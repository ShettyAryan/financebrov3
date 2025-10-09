from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, ValidationError
from typing import List, Dict, Tuple
import os
import json
import time
import google.generativeai as genai
from dotenv import load_dotenv

# Load .env and configure Gemini
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(title="FinanceBro AI Practice Service", version="1.0.0")

# Optional: Load lesson content from a local JSON file to avoid DB
_LESSONS_INDEX: Dict[str, Dict] = {}


def _load_lessons_from_file() -> None:
    """Load lessons from JSON at startup. Supports override via LESSONS_JSON_PATH env."""
    global _LESSONS_INDEX
    try:
        base_dir = os.path.dirname(__file__)
        default_path = os.path.join(base_dir, "lessons.json")
        path = os.getenv("LESSONS_JSON_PATH", default_path)
        if os.path.exists(path):
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
            # Build index by id and by normalized title
            index: Dict[str, Dict] = {}
            for lesson in data.get("lessons", []):
                lid = str(lesson.get("id", "")).strip()
                title = str(lesson.get("title", "")).strip()
                if lid:
                    index[f"id::{lid}"] = lesson
                if title:
                    norm = title.lower()
                    index[f"title::{norm}"] = lesson
            _LESSONS_INDEX = index
        else:
            _LESSONS_INDEX = {}
    except Exception:
        # Fail-soft; service can still run without local lessons
        _LESSONS_INDEX = {}


_load_lessons_from_file()


class Question(BaseModel):
    id: str
    scenario: str
    options: List[str]
    answer: int = Field(ge=0, le=3)
    explanation: str


class GenerateRequest(BaseModel):
    user_id: str
    lesson_id: str
    concept_name: str
    lesson_content: str


class GenerateResponse(BaseModel):
    lesson_id: str
    concept_name: str
    questions: List[Question]


class EvaluateRequest(BaseModel):
    user_id: str
    lesson_id: str
    concept_name: str
    questions: List[Question]
    user_answers: List[int]


class EvaluateResponse(BaseModel):
    score: int
    weak_areas: List[str]
    feedback: str
    recommended_lessons: List[str]
    xp_delta: int
    coins_delta: int


# Simple in-memory cache (user_id, lesson_id) -> questions
_CACHE: Dict[Tuple[str, str], List[Question]] = {}
_CACHE_TTL_SECONDS = 60 * 30  # 30 minutes
_CACHE_TS: Dict[Tuple[str, str], float] = {}


# Helpers
def _get_model():
	if not GEMINI_API_KEY:
		raise RuntimeError("GEMINI_API_KEY not configured")
	# Allow overriding the model via env; default to a broadly supported model
	model_name = os.getenv("GEMINI_MODEL", "gemini-2.5-flash")
	return genai.GenerativeModel(model_name)


def _build_generation_prompt(concept_name: str, lesson_content: str) -> str:
    return (
        "You are an AI tutor for fundamental analysis. Generate 10 multiple-choice scenario questions strictly derived from the lesson content provided.\n"
        "Each question must include: a realistic investment scenario, four distinct options (A-D), the correct option index (0-3), and a concise explanation referencing the lesson material.\n"
        "Do NOT introduce topics outside the lesson. Keep language simple and grounded.\n\n"
        f"Concept: {concept_name}\n\n"
        "Lesson Content (source of truth):\n" + lesson_content + "\n\n"
        "Return strict JSON with this structure: {\"questions\":[{\"id\":\"q1\",\"scenario\":\"...\",\"options\":[\"...\",\"...\",\"...\",\"...\"],\"answer\":1,\"explanation\":\"...\"}, ... x10]}"
    )


def _build_evaluation_prompt(concept_name: str, lesson_content: str, questions: List[Question], user_answers: List[int]) -> str:
    q_payload = []
    for i, q in enumerate(questions):
        q_payload.append({
            "scenario": q.scenario,
            "options": q.options,
            "correct": q.answer,
            "user": user_answers[i] if i < len(user_answers) else None
        })
    return (
        "Evaluate the user's answers against the provided questions. Identify weak sub-concepts strictly based on the lesson content.\n"
        "Return JSON: {\"score\":int,\"weak_areas\":[string],\"feedback\":string,\"recommended_lessons\":[string]}\n\n"
        f"Concept: {concept_name}\n\n"
        "Lesson Content (source of truth):\n" + lesson_content + "\n\n"
        f"Questions and Answers: {q_payload}"
    )


def _strip_code_fences(text: str) -> str:
    t = text.strip()
    if t.startswith("```"):
        t = "\n".join(t.splitlines()[1:])
    if t.endswith("```"):
        t = "\n".join(t.splitlines()[:-1])
    return t.strip()


def _extract_json(text: str) -> str:
    t = _strip_code_fences(text)
    start = t.find('{')
    end = t.rfind('}')
    if start != -1 and end != -1 and end > start:
        return t[start:end + 1]
    return t


def _parse_questions(text: str) -> List[Question]:
    json_text = _extract_json(text)
    payload = json.loads(json_text)
    if "questions" not in payload or not isinstance(payload["questions"], list):
        raise ValueError("Invalid schema: missing questions")
    questions: List[Question] = []
    for item in payload["questions"]:
        q = Question(**item)
        if len(q.options) != 4:
            raise ValueError("Each question must have exactly 4 options")
        questions.append(q)
    return questions


def _retry(fn, attempts=2, delay=1.0):
    last_err = None
    for _ in range(attempts):
        try:
            return fn()
        except Exception as e:
            last_err = e
            time.sleep(delay)
    raise last_err


@app.post("/api/practice/generate", response_model=GenerateResponse)
async def generate_quiz(body: GenerateRequest):
    key = (body.user_id, body.lesson_id)
    now = time.time()
    if key in _CACHE and key in _CACHE_TS and now - _CACHE_TS[key] < _CACHE_TTL_SECONDS:
        return GenerateResponse(lesson_id=body.lesson_id, concept_name=body.concept_name, questions=_CACHE[key])
    try:
        lesson_content = (body.lesson_content or "").strip()
        if not lesson_content and _LESSONS_INDEX:
            candidate = _LESSONS_INDEX.get(f"id::{body.lesson_id}") or _LESSONS_INDEX.get(f"title::{body.concept_name.lower()}")
            if candidate and isinstance(candidate.get("content"), str):
                lesson_content = candidate["content"].strip()
            elif candidate and candidate.get("content") is not None:
                lesson_content = json.dumps(candidate.get("content"))
        if not lesson_content:
            raise HTTPException(status_code=400, detail="lesson_content is required and not available in local lessons")

        model = _get_model()
        prompt = _build_generation_prompt(body.concept_name, lesson_content)

        def call_model():
            resp = model.generate_content(prompt)
            text = getattr(resp, 'text', None)
            if not text and hasattr(resp, 'candidates') and resp.candidates:
                parts = getattr(resp.candidates[0], 'content', None)
                text = getattr(parts.parts[0], 'text', None) if parts and getattr(parts, 'parts', None) else None
            if not text:
                raise RuntimeError("Model returned empty response")
            return _parse_questions(text)

        questions = _retry(call_model, attempts=3, delay=1.5)
        if len(questions) < 10:
            raise HTTPException(status_code=500, detail="AI returned insufficient questions")

        _CACHE[key] = questions
        _CACHE_TS[key] = now
        return GenerateResponse(lesson_id=body.lesson_id, concept_name=body.concept_name, questions=questions)

    except (ValidationError, ValueError) as e:
        raise HTTPException(status_code=500, detail=f"Schema validation failed: {e}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/practice/evaluate", response_model=EvaluateResponse)
async def evaluate_quiz(body: EvaluateRequest):
    try:
        model = _get_model()
        lesson_content = ""
        if _LESSONS_INDEX:
            candidate = _LESSONS_INDEX.get(f"id::{body.lesson_id}") or _LESSONS_INDEX.get(f"title::{body.concept_name.lower()}")
            if candidate and isinstance(candidate.get("content"), str):
                lesson_content = candidate["content"].strip()
            elif candidate and candidate.get("content") is not None:
                lesson_content = json.dumps(candidate.get("content"))

        prompt = _build_evaluation_prompt(body.concept_name, lesson_content, body.questions, body.user_answers)

        def call_model():
            resp = model.generate_content(prompt)
            text = getattr(resp, 'text', None)
            if not text and hasattr(resp, 'candidates') and resp.candidates:
                parts = getattr(resp.candidates[0], 'content', None)
                text = getattr(parts.parts[0], 'text', None) if parts and getattr(parts, 'parts', None) else None
            if not text:
                raise RuntimeError("Model returned empty response")
            return json.loads(_extract_json(text))

        parsed = _retry(call_model, attempts=3, delay=1.5)
        score = int(parsed.get("score", 0))
        weak_areas = parsed.get("weak_areas", [])
        feedback = parsed.get("feedback", "")
        recommended_lessons = parsed.get("recommended_lessons", [])
        xp_delta = max(0, score) * 5
        coins_delta = max(0, score) * 10

        return EvaluateResponse(
            score=score,
            weak_areas=weak_areas,
            feedback=feedback,
            recommended_lessons=recommended_lessons,
            xp_delta=xp_delta,
            coins_delta=coins_delta,
        )

    except (ValidationError, ValueError) as e:
        raise HTTPException(status_code=500, detail=f"Schema validation failed: {e}")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/lessons")
async def list_lessons():
    """List locally available lessons (id, title only) for debugging/integration."""
    items = []
    if _LESSONS_INDEX:
        seen = set()
        for key, lesson in _LESSONS_INDEX.items():
            if key.startswith("id::"):
                lid = str(lesson.get("id", ""))
                title = str(lesson.get("title", ""))
                if lid and lid not in seen:
                    items.append({"id": lid, "title": title})
                    seen.add(lid)
    return {"lessons": items}
