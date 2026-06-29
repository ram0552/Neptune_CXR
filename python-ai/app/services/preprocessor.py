"""
NEPTUNE-CXR: Image Preprocessing Pipeline
Handles image loading, validation, resizing, normalization, and tensor conversion.
"""
import io
import numpy as np
from PIL import Image
import torch
from torchvision import transforms
from typing import Tuple, Dict, Any

from app.core.config import IMAGE_SIZE, IMAGENET_MEAN, IMAGENET_STD


class ImagePreprocessor:
    """
    Preprocessing pipeline for chest X-ray images.
    
    Steps:
    1. Load image from bytes or file path
    2. Convert to RGB (handles grayscale X-rays)
    3. Resize to 224x224
    4. Normalize with ImageNet statistics
    5. Return tensor for model + numpy array for visualization
    """

    def __init__(self):
        self.transform = transforms.Compose([
            transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(mean=IMAGENET_MEAN, std=IMAGENET_STD)
        ])
        
        self.viz_transform = transforms.Compose([
            transforms.Resize((IMAGE_SIZE, IMAGE_SIZE)),
            transforms.ToTensor()
        ])

    def preprocess(self, image_bytes: bytes) -> Tuple[torch.Tensor, np.ndarray, Dict[str, Any]]:
        """
        Preprocess an image from raw bytes.
        
        Args:
            image_bytes: Raw image file bytes
            
        Returns:
            Tuple of:
            - tensor: Normalized tensor (1, 3, 224, 224) for model input
            - viz_array: Unnormalized numpy array (224, 224, 3) for visualization
            - metadata: Image metadata dict
        """
        # Load image
        image = Image.open(io.BytesIO(image_bytes))
        
        # Collect metadata before any transforms
        metadata = {
            "original_width": image.width,
            "original_height": image.height,
            "format": image.format or "Unknown",
            "mode": image.mode
        }
        
        # Convert to RGB (X-rays may be grayscale or L mode)
        if image.mode != "RGB":
            image = image.convert("RGB")
        
        # Create model input tensor (normalized)
        tensor = self.transform(image).unsqueeze(0)  # Add batch dimension
        
        # Create visualization array (unnormalized, for GradCAM overlay)
        viz_tensor = self.viz_transform(image)
        viz_array = viz_tensor.permute(1, 2, 0).numpy()  # (H, W, 3)
        
        return tensor, viz_array, metadata

    def preprocess_from_path(self, image_path: str) -> Tuple[torch.Tensor, np.ndarray, Dict[str, Any]]:
        """Preprocess an image from a file path."""
        with open(image_path, "rb") as f:
            image_bytes = f.read()
        return self.preprocess(image_bytes)
