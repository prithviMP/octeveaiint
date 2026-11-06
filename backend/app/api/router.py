from fastapi import APIRouter

from app.api.routes import health, interviews, questions, subjects

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(subjects.router)
api_router.include_router(questions.router)
api_router.include_router(interviews.router)
