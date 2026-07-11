from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.interview import router as interview_router
from app.routes.resume import router as resume_router

app = FastAPI(
    title="PlacementPilot AI API",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume_router)
app.include_router(interview_router)

@app.get("/")
def root():
    return {"message": "PlacementPilot AI backend is running"}

@app.get("/health")
def health_check():
    return {"status": "healthy"}
