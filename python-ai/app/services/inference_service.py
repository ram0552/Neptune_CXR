"""
NEPTUNE-CXR: Inference Service
Orchestrates the full prediction pipeline from image bytes to structured results.
"""
import time
import numpy as np
from typing import Dict, Any, List

from app.models.base_model import BaseCXRModel
from app.services.preprocessor import ImagePreprocessor
from app.services.gradcam_service import GradCAMService
from app.services.confidence_service import ConfidenceService
from app.services.explanation_service import ExplanationService
from app.core.config import DISEASE_LABELS, POSITIVE_THRESHOLD


class InferenceService:
    """
    Main orchestrator for the prediction pipeline.
    
    Pipeline:
    1. Preprocess image → tensor + viz array
    2. Model forward pass → raw probabilities
    3. GradCAM generation → heatmap overlay
    4. Confidence classification → structured confidence levels
    5. Explanation generation → clinical text
    6. Package response
    """

    def __init__(self, model: BaseCXRModel):
        self.model = model
        self.preprocessor = ImagePreprocessor()
        self.gradcam_service = GradCAMService(model)
        self.confidence_service = ConfidenceService()
        self.explanation_service = ExplanationService()

    async def analyze(self, image_bytes: bytes, image_id: str) -> Dict[str, Any]:
        """
        Run full analysis pipeline on a chest X-ray image.
        
        Args:
            image_bytes: Raw image file bytes
            image_id: Unique identifier for saving outputs
            
        Returns:
            Complete prediction response dict
        """
        start_time = time.perf_counter()
        
        # 1. Preprocess
        tensor, viz_array, image_metadata = self.preprocessor.preprocess(image_bytes)
        
        # 2. Model inference
        probabilities = self.model.predict(tensor)
        
        # 3. Generate GradCAM heatmap
        # Find the top predicted disease for primary heatmap
        top_disease_idx = int(np.argmax(probabilities))
        heatmap_path = self.gradcam_service.generate(
            tensor=tensor,
            viz_array=viz_array,
            target_class=top_disease_idx,
            image_id=image_id
        )
        
        # 4. Build per-disease predictions with confidence
        predictions = []
        for idx, (disease, prob) in enumerate(zip(DISEASE_LABELS, probabilities)):
            confidence_info = self.confidence_service.classify(
                disease=disease,
                probability=float(prob)
            )
            
            is_positive = float(prob) >= POSITIVE_THRESHOLD
            
            explanation = ""
            if is_positive:
                explanation = self.explanation_service.generate(
                    disease=disease,
                    probability=float(prob),
                    confidence_level=confidence_info["confidence_level"]
                )
            
            predictions.append({
                "disease": disease,
                "probability": round(float(prob), 4),
                "confidence_level": confidence_info["confidence_level"],
                "risk_level": confidence_info["risk_level"],
                "is_positive": is_positive,
                "affected_region": confidence_info["affected_region"],
                "explanation": explanation
            })
        
        # Sort by probability descending
        predictions.sort(key=lambda x: x["probability"], reverse=True)
        
        # Calculate inference time
        inference_time_ms = round((time.perf_counter() - start_time) * 1000, 2)
        
        # Get model info
        model_info = self.model.get_model_info()
        
        return {
            "predictions": predictions,
            "heatmap_filename": heatmap_path.name if heatmap_path else None,
            "inference_time_ms": inference_time_ms,
            "model_version": model_info["version"],
            "model_name": model_info["name"],
            "image_metadata": image_metadata,
            "positive_findings": [p["disease"] for p in predictions if p["is_positive"]],
            "top_finding": predictions[0]["disease"] if predictions else "No Finding"
        }
