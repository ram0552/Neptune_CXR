"""
NEPTUNE-CXR: FastAPI Routes
API endpoint definitions for the Python AI service.
"""
from fastapi import APIRouter, UploadFile, File, HTTPException
from app.schemas.schemas import PredictionResponse, HealthResponse, ErrorResponse
import uuid

router = APIRouter()

# These will be set by main.py after model initialization
inference_service = None


@router.post(
    "/predict",
    response_model=PredictionResponse,
    responses={
        400: {"model": ErrorResponse},
        500: {"model": ErrorResponse}
    },
    summary="Analyze a chest X-ray image",
    description="Upload a chest X-ray image for multi-label disease prediction with GradCAM explanation"
)
async def predict(file: UploadFile = File(..., description="Chest X-ray image (PNG/JPG/JPEG)")):
    """
    Run the full AI screening pipeline on a chest X-ray image.
    
    Returns:
    - Per-disease predictions with confidence and risk levels
    - GradCAM heatmap visualization
    - Clinical explanations for positive findings
    - Inference timing and model metadata
    """
    global inference_service
    
    if inference_service is None:
        raise HTTPException(status_code=503, detail="AI model not loaded yet")
    
    # Validate file type
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type: {file.content_type}. Expected image/png, image/jpeg."
        )
    
    try:
        # Read image bytes
        image_bytes = await file.read()
        
        if len(image_bytes) == 0:
            raise HTTPException(status_code=400, detail="Empty file uploaded")
        
        # Generate unique ID for this analysis
        image_id = str(uuid.uuid4())[:12]
        
        # Run analysis pipeline
        result = await inference_service.analyze(image_bytes, image_id)
        
        return PredictionResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Analysis failed: {str(e)}"
        )


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Health check",
    description="Check if the AI service is running and model is loaded"
)
async def health_check():
    """Return service health status and model information."""
    from app.models.model_registry import ModelRegistry
    
    model_loaded = False
    model_name = ""
    model_version = ""
    
    if inference_service and inference_service.model.is_loaded:
        model_info = inference_service.model.get_model_info()
        model_loaded = True
        model_name = model_info["name"]
        model_version = model_info["version"]
    
    return HealthResponse(
        status="healthy",
        model_loaded=model_loaded,
        model_name=model_name,
        model_version=model_version,
        available_models=ModelRegistry.list_models()
    )
