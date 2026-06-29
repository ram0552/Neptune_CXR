"""
NEPTUNE-CXR: Python AI Service Configuration
"""
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# Base directories
BASE_DIR = Path(__file__).resolve().parent.parent
PROJECT_ROOT = BASE_DIR.parent

# Server
HOST = os.getenv("HOST", "0.0.0.0")
PORT = int(os.getenv("PORT", 8000))
LOG_LEVEL = os.getenv("LOG_LEVEL", "info")

# Model
MODEL_NAME = os.getenv("MODEL_NAME", "densenet121")
MODEL_CACHE_DIR = Path(os.getenv("MODEL_CACHE_DIR", str(PROJECT_ROOT / "models")))

# Directories
HEATMAP_DIR = Path(os.getenv("HEATMAP_DIR", str(PROJECT_ROOT / "heatmaps")))
UPLOAD_DIR = Path(os.getenv("UPLOAD_DIR", str(PROJECT_ROOT / "uploads")))

# Ensure directories exist
HEATMAP_DIR.mkdir(parents=True, exist_ok=True)
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
MODEL_CACHE_DIR.mkdir(parents=True, exist_ok=True)

# Image preprocessing
IMAGE_SIZE = 224
IMAGENET_MEAN = [0.485, 0.456, 0.406]
IMAGENET_STD = [0.229, 0.224, 0.225]

# Disease labels (14-class ChestX-ray14 aligned)
DISEASE_LABELS = [
    "Atelectasis",
    "Cardiomegaly",
    "Consolidation",
    "Edema",
    "Effusion",
    "Emphysema",
    "Fibrosis",
    "Hernia",
    "Infiltration",
    "Mass",
    "Nodule",
    "Pleural Thickening",
    "Pneumonia",
    "Pneumothorax"
]

NUM_CLASSES = len(DISEASE_LABELS)

# Confidence thresholds
POSITIVE_THRESHOLD = 0.5
CONFIDENCE_THRESHOLDS = {
    "very_high": 0.9,
    "high": 0.7,
    "moderate": 0.5,
    "low": 0.3,
    "very_low": 0.0
}

# Risk level mapping based on disease severity
DISEASE_RISK_WEIGHTS = {
    "Pneumothorax": 1.3,
    "Pneumonia": 1.2,
    "Edema": 1.2,
    "Consolidation": 1.1,
    "Mass": 1.3,
    "Cardiomegaly": 1.1,
    "Effusion": 1.0,
    "Atelectasis": 0.9,
    "Emphysema": 1.0,
    "Fibrosis": 1.0,
    "Nodule": 1.2,
    "Hernia": 0.9,
    "Infiltration": 1.0,
    "Pleural Thickening": 0.8
}

# Anatomical region mappings (from reference document's zone-based approach)
DISEASE_REGION_MAP = {
    "Atelectasis": ["Lower lung fields", "Bilateral bases"],
    "Cardiomegaly": ["Cardiac silhouette", "Mediastinum"],
    "Consolidation": ["Right lower lobe", "Left lower lobe", "Bilateral lung fields"],
    "Edema": ["Bilateral perihilar regions", "Bilateral lung fields"],
    "Effusion": ["Costophrenic angles", "Lower lung zones"],
    "Emphysema": ["Upper lung zones", "Bilateral lung fields"],
    "Fibrosis": ["Lower lung zones", "Bilateral bases"],
    "Hernia": ["Diaphragm region", "Lower mediastinum"],
    "Infiltration": ["Bilateral lung fields", "Perihilar regions"],
    "Mass": ["Upper lung zones", "Peripheral lung fields"],
    "Nodule": ["Upper lung zones", "Peripheral lung fields"],
    "Pleural Thickening": ["Pleural surfaces", "Lateral lung borders"],
    "Pneumonia": ["Right lower lung", "Left lower lung", "Bilateral bases"],
    "Pneumothorax": ["Apical regions", "Lateral lung borders"]
}
