AI Practice Microservice (FastAPI + Gemini)

Overview
This FastAPI microservice generates and evaluates AI-driven, lesson-grounded practice quizzes using Google Gemini. It exposes:
- POST /api/practice/generate: Produce 10 scenario-based MCQs grounded in lesson content
- POST /api/practice/evaluate: Score answers and produce feedback, weak areas, and recommendations

Setup
1) Requirements
- Python 3.10+
- A Google Gemini API key

2) Install
```
pip install -r requirements.txt
```

3) Environment
Create .env based on .env.example:
- GEMINI_API_KEY=your_key
- SERVICE_HOST=0.0.0.0
- SERVICE_PORT=8000

4) Run locally
```
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Endpoints
1) POST /api/practice/generate
Request JSON:
{
  "user_id": "uuid",
  "lesson_id": "uuid",
  "concept_name": "string",
  "lesson_content": "string (markdown or text)"
}
Response JSON:
{
  "lesson_id": "uuid",
  "concept_name": "string",
  "questions": [
    {
      "id": "string",
      "scenario": "string",
      "options": ["A", "B", "C", "D"],
      "answer": 2,
      "explanation": "string"
    },
    ... x10
  ]
}

2) POST /api/practice/evaluate
Request JSON:
{
  "user_id": "uuid",
  "lesson_id": "uuid",
  "concept_name": "string",
  "questions": [... same structure as generate ...],
  "user_answers": [0-3 x10]
}
Response JSON:
{
  "score": 0-10,
  "weak_areas": ["string"],
  "feedback": "string",
  "recommended_lessons": ["string"],
  "xp_delta": number,
  "coins_delta": number
}

Integration with Node backend
1) Set PRACTICE_AI_URL (e.g. http://localhost:8000) in backend/.env
2) Backend routes POST /api/practice/generate and POST /api/practice/evaluate forward to FastAPI (auth + Supabase remain in Node)
3) On evaluate, Node updates XP/coins/progress using existing controllers

Security
- Node backend enforces authentication and lesson unlock rules. FastAPI receives only necessary context and performs generation/evaluation.

Production
- Run behind a reverse proxy, set timeouts ~30s for generation.
- Consider caching per (user_id, lesson_id) to reduce cost.


