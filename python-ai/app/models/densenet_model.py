"""
NEPTUNE-CXR: DenseNet121 Model for Chest X-ray Classification
Implements multi-label classification using pretrained DenseNet121.
Adapted for 14-class ChestX-ray14 / CheXpert disease labels.
"""
import torch
import torch.nn as nn
import numpy as np
from torchvision import models
from typing import Any, Dict

from app.models.base_model import BaseCXRModel
from app.core.config import NUM_CLASSES, MODEL_CACHE_DIR


class DenseNet121CXR(BaseCXRModel):
    """
    DenseNet121-based multi-label chest X-ray classifier.
    
    Architecture:
    - Backbone: DenseNet121 pretrained on ImageNet
    - Classifier: Custom head replacing the original 1000-class classifier
      with a 14-class sigmoid output for multi-label prediction
    - GradCAM target: features.denseblock4 (last dense block)
    """

    MODEL_VERSION = "densenet121-cxr-v1.0"
    ARCHITECTURE = "DenseNet121"

    def __init__(self, num_classes: int = NUM_CLASSES, device: str = None):
        super().__init__(num_classes=num_classes, device=device)

    def load(self) -> None:
        """Load DenseNet121 with pretrained weights and custom classification head."""
        # Set cache directory for model weights
        torch.hub.set_dir(str(MODEL_CACHE_DIR))
        
        # Load pretrained DenseNet121
        self.model = models.densenet121(weights=models.DenseNet121_Weights.IMAGENET1K_V1)
        
        # Replace the classifier head for multi-label classification
        # DenseNet121 has 1024 features before the classifier
        num_features = self.model.classifier.in_features
        self.model.classifier = nn.Sequential(
            nn.Linear(num_features, 512),
            nn.ReLU(inplace=True),
            nn.Dropout(0.3),
            nn.Linear(512, self.num_classes)
        )
        
        # Move to device and set eval mode
        self.model = self.model.to(self.device)
        self.model.eval()
        self._is_loaded = True
        
        print(f"[NEPTUNE-CXR] DenseNet121 loaded on {self.device} "
              f"with {self._count_params():,} parameters")

    def predict(self, tensor: torch.Tensor) -> np.ndarray:
        """
        Run multi-label inference.
        
        Args:
            tensor: Preprocessed image tensor (1, 3, 224, 224)
            
        Returns:
            Sigmoid probabilities for each disease class (14,)
        """
        if not self._is_loaded:
            raise RuntimeError("Model not loaded. Call load() first.")
        
        tensor = self.to_device(tensor)
        
        with torch.no_grad():
            logits = self.model(tensor)
            probabilities = torch.sigmoid(logits)
        
        return probabilities.cpu().numpy().flatten()

    def get_cam_target_layer(self):
        """Return the last dense block for GradCAM visualization."""
        return self.model.features.denseblock4

    def get_model_info(self) -> Dict[str, Any]:
        """Return model metadata."""
        return {
            "name": self.ARCHITECTURE,
            "version": self.MODEL_VERSION,
            "architecture": "DenseNet121 + Custom Multi-Label Head",
            "num_params": self._count_params(),
            "num_classes": self.num_classes,
            "input_size": "224x224x3",
            "pretrained_on": "ImageNet",
            "output_activation": "Sigmoid (multi-label)",
            "device": self.device
        }

    def _count_params(self) -> int:
        """Count total trainable parameters."""
        if self.model is None:
            return 0
        return sum(p.numel() for p in self.model.parameters())
