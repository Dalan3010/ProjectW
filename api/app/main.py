from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.presentation.api import auth, cases

app = FastAPI(
    title="Jak Business Idea Discovery API",
    description="API for discovering and validating business ideas using n8n orchestration and RAG.",
    version="0.1.0"
)

# CORS configurable vía Settings.CORS_ORIGINS (coma-separado en la env var).
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cases.router)
app.include_router(auth.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Jak Business Idea Discovery API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
