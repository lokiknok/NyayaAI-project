import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.config import settings
from app.database.session import init_db, SessionLocal
from app.legal_sources.seed_data import seed_knowledge_base
from app.ai.adapter import get_ai_provider
from app.api.routes import router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("nyaya_ai")

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Initialize DB tables and seed authoritative Indian legal corpora
    logger.info("Initializing NyayaAI database tables...")
    init_db()

    db = SessionLocal()
    try:
        provider = get_ai_provider()
        seeded_count = await seed_knowledge_base(db, provider)
        logger.info(f"NyayaAI Knowledge Base ready with {seeded_count} core legal authorities.")
    finally:
        db.close()

    yield
    logger.info("NyayaAI service shutting down gracefully.")

app = FastAPI(
    title="NyayaAI - Indian Legal AI Assistant",
    description="Statutory RAG and Legal Intelligence API grounded in India Code and Supreme Court Precedents.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
origins = settings.cors_origin_list
allow_all = not origins or "*" in origins

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if allow_all else origins,
    allow_credentials=not allow_all,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Centralized error handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled server error on {request.url.path}: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "A secure internal error occurred while processing the legal inquiry. Please retry."}
    )

# Mount API routes
app.include_router(router)

@app.get("/health", tags=["Health"])
def health_direct():
    """Direct root health-check for cloud orchestrators and Render."""
    return {
        "status": "healthy",
        "mock_mode": settings.USE_MOCK_AI or settings.AI_PROVIDER.lower() == "mock",
        "message": "NyayaAI Indian Legal Engine is online and operational."
    }

@app.get("/")
def root():
    return {
        "app": "NyayaAI",
        "description": "Indian Legal AI Assistant API",
        "docs_url": "/docs",
        "health_url": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.effective_host,
        port=settings.effective_port,
        reload=(settings.APP_ENV == "development" and not os.environ.get("RENDER"))
    )

