"""
NEPTUNE-CXR: Abstract Base Model
Defines the interface all CXR classification models must implement.
Designed for extensibility — future models (ViT, GNN, Concept Bottleneck)
plug in by extending this base class.
"""
from abc import ABC, abstractmethod
from typing import Any, Dict, List, Tuple
import torch
import numpy as np


class BaseCXRModel(ABC):
    """
    Abstract base class for all chest X-ray classification models.
    
    Every model implementation must provide:
    - load(): Load model weights
    - predict(): Run inference on a preprocessed tensor
    - get_cam_target_layer(): Return the layer for GradCAM visualization
    - get_model_info(): Return metadata about the model
    """

    def __init__(self, num_classes: int = 14, device: str = None):
        self.num_classes = num_classes
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self.model = None
        self._is_loaded = False

    @abstractmethod
    def load(self) -> None:
        """Load model architecture and weights."""
        pass

    @abstractmethod
    def predict(self, tensor: torch.Tensor) -> np.ndarray:
        """
        Run inference on a preprocessed image tensor.
        
        Args:
            tensor: Preprocessed image tensor of shape (1, 3, H, W)
            
        Returns:
            numpy array of sigmoid probabilities for each class, shape (num_classes,)
        """
        pass

    @abstractmethod
    def get_cam_target_layer(self):
        """
        Return the target layer for GradCAM visualization.
        This should be the last convolutional layer of the model.
        """
        pass

    @abstractmethod
    def get_model_info(self) -> Dict[str, Any]:
        """
        Return metadata about the model.
        
        Returns:
            Dictionary with keys: name, version, architecture, num_params, input_size
        """
        pass

    @property
    def is_loaded(self) -> bool:
        return self._is_loaded

    def get_pytorch_model(self) -> torch.nn.Module:
        """Return the underlying PyTorch model for GradCAM hooks."""
        if not self._is_loaded:
            raise RuntimeError("Model not loaded. Call load() first.")
        return self.model

    def to_device(self, tensor: torch.Tensor) -> torch.Tensor:
        """Move tensor to the model's device."""
        return tensor.to(self.device)
