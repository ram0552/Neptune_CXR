"""
NEPTUNE-CXR: Pydantic Schemas
Defines the API contract for the Python AI service.
"""
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime


class DiseaseResult(BaseModel):
    """Individual disease prediction result."""
    disease: str = Field(..., description="Disease name")
    probability: float = Field(..., ge=0.0, le=1.0, description="Sigmoid probability")
    confidence_level: str = Field(..., description="Human-readable confidence level")
    risk_level: str = Field(..., description="Clinical risk assessment")
    is_positive: bool = Field(..., description="Whether prediction exceeds threshold")
    affected_region: str = Field(..., description="Primary anatomical region")
    explanation: str = Field("", description="Clinical explanation text")


class ImageMetadata(BaseModel):
    """Metadata about the input image."""
    original_width: int
    original_height: int
    format: str
    mode: str


class PredictionResponse(BaseModel):
    """Complete prediction response from the /predict endpoint."""
    predictions: List[DiseaseResult]
    heatmap_filename: Optional[str] = None
    inference_time_ms: float
    model_version: str
    model_name: str
    image_metadata: ImageMetadata
    positive_findings: List[str]
    top_finding: str


class HealthResponse(BaseModel):
    """Health check response."""
    status: str = "healthy"
    model_loaded: bool = False
    model_name: str = ""
    model_version: str = ""
    available_models: List[str] = []
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class ErrorResponse(BaseModel):
    """Standard error response."""
    error: str
    detail: Optional[str] = None
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
