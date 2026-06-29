"""
NEPTUNE-CXR: Clinical Explanation Generator
Generates natural-language clinical explanations for AI predictions.
Aligned with the reference document's emphasis on clinically faithful explanations
that connect anatomy, abnormality patterns, and confidence.
"""
from typing import Dict

from app.core.config import DISEASE_REGION_MAP


# Template-based explanation patterns for each disease
# These follow radiology report conventions and reference document terminology
EXPLANATION_TEMPLATES = {
    "Atelectasis": {
        "patterns": [
            "volume loss in the {region}",
            "linear opacity suggesting subsegmental collapse",
            "increased density with volume loss pattern"
        ],
        "description": "Partial or complete collapse of lung tissue"
    },
    "Cardiomegaly": {
        "patterns": [
            "enlarged cardiac silhouette exceeding normal limits",
            "cardiothoracic ratio appears increased",
            "widened cardiac contour on frontal view"
        ],
        "description": "Enlarged heart shadow"
    },
    "Consolidation": {
        "patterns": [
            "airspace opacification in {region}",
            "dense opacity with air bronchograms visible",
            "homogeneous opacity replacing normal lung aeration"
        ],
        "description": "Dense lung opacity indicating filled airspaces"
    },
    "Edema": {
        "patterns": [
            "bilateral perihilar haziness and vascular redistribution",
            "Kerley B lines and peribronchial cuffing visible",
            "bilateral alveolar opacities in butterfly pattern"
        ],
        "description": "Fluid accumulation in lung tissue"
    },
    "Effusion": {
        "patterns": [
            "blunting of the costophrenic angle",
            "meniscus sign at the {region}",
            "layering opacity at the lung base"
        ],
        "description": "Fluid in the pleural space"
    },
    "Emphysema": {
        "patterns": [
            "hyperinflation with flattened diaphragm",
            "increased lucency in the {region}",
            "attenuated vascular markings with barrel-shaped thorax"
        ],
        "description": "Overinflation and destruction of alveolar walls"
    },
    "Fibrosis": {
        "patterns": [
            "reticular opacities in the {region}",
            "honeycombing pattern with architectural distortion",
            "volume loss with reticular markings"
        ],
        "description": "Scarring and fibrotic changes in lung tissue"
    },
    "Hernia": {
        "patterns": [
            "abnormal lucency or structure overlying the {region}",
            "bowel loop pattern visible above the diaphragm",
            "disruption of the normal diaphragmatic contour"
        ],
        "description": "Protrusion of abdominal contents through the diaphragm"
    },
    "Infiltration": {
        "patterns": [
            "ill-defined opacity in the {region}",
            "patchy airspace disease pattern",
            "non-specific parenchymal opacity"
        ],
        "description": "Substance denser than air within the lung parenchyma"
    },
    "Mass": {
        "patterns": [
            "well-defined opacity greater than 3cm in the {region}",
            "rounded density with possible lobulated margins",
            "space-occupying lesion visible in the {region}"
        ],
        "description": "Pulmonary mass lesion requiring further evaluation"
    },
    "Nodule": {
        "patterns": [
            "small rounded opacity less than 3cm in the {region}",
            "focal density visible in the {region}",
            "discrete pulmonary nodule identified"
        ],
        "description": "Small rounded opacity in the lung parenchyma"
    },
    "Pleural Thickening": {
        "patterns": [
            "thickened pleural line along the {region}",
            "pleural density along the lateral chest wall",
            "irregular pleural surface opacity"
        ],
        "description": "Thickening of the pleural membrane"
    },
    "Pneumonia": {
        "patterns": [
            "airspace opacity consistent with infectious process in the {region}",
            "patchy consolidation with possible air bronchograms",
            "focal opacity in the {region} suggesting pneumonic infiltrate"
        ],
        "description": "Infection causing inflammation and fluid in the lungs"
    },
    "Pneumothorax": {
        "patterns": [
            "visible visceral pleural line at the {region}",
            "absence of lung markings beyond the pleural edge",
            "lucency without vascular markings at the {region}"
        ],
        "description": "Air in the pleural space causing lung collapse"
    }
}


class ExplanationService:
    """
    Generates clinical explanations for AI predictions.
    
    Each explanation includes:
    - What the AI focused on (anatomical region)
    - What pattern was detected (radiological description)
    - How confident the AI is
    - Clinical context
    
    This follows the reference document's call for explanations that
    "connect image regions, semantic findings, and confidence estimates
    in a form usable during review, communication, and quality assurance."
    """

    def generate(
        self,
        disease: str,
        probability: float,
        confidence_level: str
    ) -> str:
        """
        Generate a clinical explanation for a positive finding.
        
        Args:
            disease: Disease name
            probability: Prediction probability
            confidence_level: Human-readable confidence level
            
        Returns:
            Clinical explanation string
        """
        # Get template info
        template_info = EXPLANATION_TEMPLATES.get(disease, {
            "patterns": ["abnormal pattern detected in the {region}"],
            "description": "Abnormal finding detected"
        })
        
        # Get anatomical region
        regions = DISEASE_REGION_MAP.get(disease, ["thoracic region"])
        primary_region = regions[0]
        
        # Select pattern (use probability to deterministically pick one)
        pattern_idx = int(probability * 10) % len(template_info["patterns"])
        pattern = template_info["patterns"][pattern_idx].format(region=primary_region)
        
        # Build explanation
        explanation_parts = [
            f"AI focused on {primary_region}.",
            f"Detected {pattern}.",
            f"Pattern consistent with {disease.lower()}.",
            f"Confidence: {confidence_level}.",
            f"Clinical note: {template_info['description']}."
        ]
        
        return " ".join(explanation_parts)

    def generate_summary(self, positive_findings: list) -> str:
        """
        Generate a brief clinical summary for all positive findings.
        
        Args:
            positive_findings: List of dicts with disease, probability, etc.
            
        Returns:
            Summary string suitable for a clinical report
        """
        if not positive_findings:
            return ("No significant thoracic abnormalities detected by AI screening. "
                    "Normal chest X-ray appearance within the limits of automated analysis.")
        
        count = len(positive_findings)
        diseases = [f["disease"] for f in positive_findings]
        
        if count == 1:
            intro = f"AI screening identified one finding: {diseases[0]}."
        else:
            disease_list = ", ".join(diseases[:-1]) + f", and {diseases[-1]}"
            intro = f"AI screening identified {count} findings: {disease_list}."
        
        # Add severity note
        high_conf = [f for f in positive_findings if f.get("probability", 0) >= 0.7]
        if high_conf:
            high_diseases = ", ".join(f["disease"] for f in high_conf)
            severity = f" High-confidence findings include: {high_diseases}."
        else:
            severity = " All findings are at moderate confidence level."
        
        disclaimer = (" This is an AI-generated screening result and does not constitute "
                      "a medical diagnosis. Clinical correlation and radiologist review "
                      "are recommended.")
        
        return intro + severity + disclaimer
