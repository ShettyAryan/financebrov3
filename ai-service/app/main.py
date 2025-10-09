from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, ValidationError
from typing import List, Optional, Dict, Tuple
import os
import json
import time
import google.generativeai as genai

# Configure Gemini
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if GEMINI_API_KEY:
	genai.configure(api_key=GEMINI_API_KEY)

app = FastAPI(title="FinanceBro AI Practice Service", version="1.0.0")

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
	return genai.GenerativeModel("gemini-1.5-pro")


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


def _parse_questions(text: str) -> List[Question]:
	payload = json.loads(text)
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
	# Cache lookup
	key = (body.user_id, body.lesson_id)
	now = time.time()
	if key in _CACHE and key in _CACHE_TS and now - _CACHE_TS[key] < _CACHE_TTL_SECONDS:
		return GenerateResponse(lesson_id=body.lesson_id, concept_name=body.concept_name, questions=_CACHE[key])
	try:
		model = _get_model()
		prompt = _build_generation_prompt(body.concept_name, body.lesson_content)
		def call_model():
			resp = model.generate_content(prompt)
			return _parse_questions(resp.text)
		questions = _retry(call_model, attempts=3, delay=1.5)
		if len(questions) < 10:
			raise HTTPException(status_code=500, detail="AI returned insufficient questions")
		# Cache set
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
		# For deeper grounding, callers should pass lesson_content too; omitted here for brevity
		lesson_content = ""
		prompt = _build_evaluation_prompt(body.concept_name, lesson_content, body.questions, body.user_answers)
		def call_model():
			resp = model.generate_content(prompt)
			return json.loads(resp.text)
		parsed = _retry(call_model, attempts=3, delay=1.5)
		score = int(parsed.get("score", 0))
		weak_areas = parsed.get("weak_areas", [])
		feedback = parsed.get("feedback", "")
		recommended_lessons = parsed.get("recommended_lessons", [])
		xp_delta = max(0, score) * 5
		coins_delta = max(0, score) * 10
		return EvaluateResponse(score=score, weak_areas=weak_areas, feedback=feedback, recommended_lessons=recommended_lessons, xp_delta=xp_delta, coins_delta=coins_delta)
	except (ValidationError, ValueError) as e:
		raise HTTPException(status_code=500, detail=f"Schema validation failed: {e}")
	except HTTPException:
		raise
	except Exception as e:
		raise HTTPException(status_code=500, detail=str(e))
