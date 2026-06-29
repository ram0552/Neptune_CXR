"""
NEPTUNE-CXR: Python AI Service Entry Point

Trustworthy Multi-Label Thoracic Disease Screening System
FastAPI service providing AI inference, GradCAM visualization, 
and clinical explanation generation for chest X-ray analysis.
"""
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from app.core.config import HOST, PORT, LOG_LEVEL, MODEL_NAME, HEATMAP_DIR
from app.models.model_registry import ModelRegistry
from app.services.inference_service import InferenceService
from app.api import routes


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events."""
    # ── Startup ──
    print("=" * 60)
    print("  NEPTUNE-CXR: AI Service Starting")
    print("=" * 60)
    
    # Load AI model
    print(f"[Startup] Loading model: {MODEL_NAME}")
    model = ModelRegistry.get_model(MODEL_NAME)
    model.load()
    
    # Initialize inference service
    inference_service = InferenceService(model)
    routes.inference_service = inference_service
    
    model_info = model.get_model_info()
    print(f"[Startup] Model loaded: {model_info['name']} v{model_info['version']}")
    print(f"[Startup] Device: {model_info['device']}")
    print(f"[Startup] Parameters: {model_info['num_params']:,}")
    print(f"[Startup] Classes: {model_info['num_classes']}")
    print("=" * 60)
    print(f"  Service ready at http://{HOST}:{PORT}")
    print("=" * 60)
    
    yield
    
    # ── Shutdown ──
    print("[Shutdown] NEPTUNE-CXR AI Service stopped")


# Create FastAPI app
app = FastAPI(
    title="NEPTUNE-CXR AI Service",
    description=(
        "Trustworthy Multi-Label Thoracic Disease Screening System. "
        "Provides AI inference, GradCAM visualization, and clinical "
        "explanation generation for chest X-ray analysis."
    ),
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, restrict to frontend origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve heatmap images as static files
app.mount("/heatmaps", StaticFiles(directory=str(HEATMAP_DIR)), name="heatmaps")

# Include API routes
app.include_router(routes.router)


if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=HOST,
        port=PORT,
        log_level=LOG_LEVEL,
        reload=False
    )
