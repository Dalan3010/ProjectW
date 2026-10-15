from fastapi import FastAPI
from app.presentation.api import cases

app = FastAPI(
    title="Jak Business Idea Discovery API",
    description="API for discovering and validating business ideas using n8n orchestration and RAG.",
    version="0.1.0"
)

app.include_router(cases.router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Jak Business Idea Discovery API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
