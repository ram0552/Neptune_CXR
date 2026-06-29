"""
NEPTUNE-CXR: Confidence Estimation Service
Converts raw probabilities into clinically meaningful confidence levels and risk assessments.
Aligned with the reference document's emphasis on calibrated, human-readable confidence output.
"""
import random
from typing import Dict, Any

from app.core.config import (
    CONFIDENCE_THRESHOLDS,
    DISEASE_RISK_WEIGHTS,
    DISEASE_REGION_MAP
)


class ConfidenceService:
    """
    Transforms raw model probabilities into structured clinical confidence output.
    
    For each disease prediction, produces:
    - confidence_level: Human-readable confidence category
    - risk_level: Clinical risk assessment considering disease severity
    - affected_region: Most likely anatomical region (from reference document zones)
    """

    def classify(self, disease: str, probability: float) -> Dict[str, Any]:
        """
        Classify a prediction into confidence and risk levels.
        
        Args:
            disease: Disease name
            probability: Raw sigmoid probability (0-1)
            
        Returns:
            Dict with confidence_level, risk_level, affected_region
        """
        confidence_level = self._get_confidence_level(probability)
        risk_level = self._get_risk_level(disease, probability)
        affected_region = self._get_affected_region(disease)
        
        return {
            "confidence_level": confidence_level,
            "risk_level": risk_level,
            "affected_region": affected_region
        }

    def _get_confidence_level(self, probability: float) -> str:
        """
        Map probability to human-readable confidence level.
        
        Thresholds:
        - >= 0.9 → Very High
        - >= 0.7 → High
        - >= 0.5 → Moderate
        - >= 0.3 → Low
        - < 0.3  → Very Low
        """
        if probability >= CONFIDENCE_THRESHOLDS["very_high"]:
            return "Very High"
        elif probability >= CONFIDENCE_THRESHOLDS["high"]:
            return "High"
        elif probability >= CONFIDENCE_THRESHOLDS["moderate"]:
            return "Moderate"
        elif probability >= CONFIDENCE_THRESHOLDS["low"]:
            return "Low"
        else:
            return "Very Low"

    def _get_risk_level(self, disease: str, probability: float) -> str:
        """
        Determine clinical risk level considering both probability and disease severity.
        
        The risk level accounts for the clinical importance of the disease —
        e.g., Pneumothorax at 60% probability is higher risk than
        Pleural Thickening at 60% because of urgency.
        """
        # Weight the probability by disease severity
        weight = DISEASE_RISK_WEIGHTS.get(disease, 1.0)
        weighted_score = probability * weight
        
        if weighted_score >= 0.85:
            return "Critical"
        elif weighted_score >= 0.65:
            return "High"
        elif weighted_score >= 0.45:
            return "Moderate"
        elif weighted_score >= 0.25:
            return "Low"
        else:
            return "Minimal"

    def _get_affected_region(self, disease: str) -> str:
        """
        Return the primary anatomical region for a disease.
        Uses the zone-based mapping from the reference document's
        'six clinically meaningful zones' concept.
        """
        regions = DISEASE_REGION_MAP.get(disease, ["Thoracic region"])
        # Return the first (most common) region
        return regions[0]
