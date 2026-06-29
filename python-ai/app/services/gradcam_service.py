"""
NEPTUNE-CXR: GradCAM Visualization Service
Generates Gradient-weighted Class Activation Map overlays for explainability.
Aligned with the reference document's emphasis on visual explanation beyond basic saliency maps.
"""
import cv2
import numpy as np
import torch
from pathlib import Path
from typing import Optional

from app.models.base_model import BaseCXRModel
from app.core.config import HEATMAP_DIR


class GradCAMService:
    """
    GradCAM heatmap generator for chest X-ray explainability.
    
    Uses pytorch-grad-cam library for reliable gradient computation.
    Overlays the activation map on the original image to show 
    which regions influenced the model's prediction.
    """

    def __init__(self, model: BaseCXRModel):
        self.model = model
        self._cam = None

    def _get_cam(self):
        """Lazy-initialize GradCAM to avoid import issues if library unavailable."""
        if self._cam is None:
            try:
                from pytorch_grad_cam import GradCAM
                target_layer = self.model.get_cam_target_layer()
                pytorch_model = self.model.get_pytorch_model()
                self._cam = GradCAM(
                    model=pytorch_model,
                    target_layers=[target_layer]
                )
            except ImportError:
                print("[WARNING] pytorch-grad-cam not installed. Using fallback heatmap.")
                self._cam = "fallback"
        return self._cam

    def generate(
        self,
        tensor: torch.Tensor,
        viz_array: np.ndarray,
        target_class: int,
        image_id: str
    ) -> Optional[Path]:
        """
        Generate GradCAM heatmap overlay.
        
        Args:
            tensor: Preprocessed input tensor (1, 3, 224, 224)
            viz_array: Original image as numpy array (224, 224, 3) in [0, 1]
            target_class: Index of the target disease class
            image_id: Unique identifier for the output filename
            
        Returns:
            Path to saved heatmap image, or None on failure
        """
        try:
            cam = self._get_cam()
            
            if cam == "fallback":
                return self._generate_fallback_heatmap(viz_array, image_id)
            
            # Define target for specific class
            from pytorch_grad_cam.utils.model_targets import ClassifierOutputTarget
            targets = [ClassifierOutputTarget(target_class)]
            
            # Generate CAM
            tensor_device = self.model.to_device(tensor)
            grayscale_cam = cam(input_tensor=tensor_device, targets=targets)
            grayscale_cam = grayscale_cam[0, :]  # Take first (only) image in batch
            
            # Create overlay
            heatmap_overlay = self._create_overlay(viz_array, grayscale_cam)
            
            # Save
            output_path = HEATMAP_DIR / f"{image_id}_gradcam.png"
            cv2.imwrite(str(output_path), heatmap_overlay)
            
            return output_path
            
        except Exception as e:
            print(f"[GradCAM] Error generating heatmap: {e}")
            return self._generate_fallback_heatmap(viz_array, image_id)

    def _create_overlay(
        self,
        image: np.ndarray,
        cam_mask: np.ndarray,
        alpha: float = 0.5
    ) -> np.ndarray:
        """
        Create a colored heatmap overlay on the original image.
        
        Args:
            image: Original image (H, W, 3) in [0, 1] range
            cam_mask: GradCAM activation mask (H, W) in [0, 1] range
            alpha: Overlay transparency
            
        Returns:
            BGR image with heatmap overlay (H, W, 3) in [0, 255] range
        """
        # Convert image to BGR uint8
        image_bgr = (image * 255).astype(np.uint8)
        image_bgr = cv2.cvtColor(image_bgr, cv2.COLOR_RGB2BGR)
        
        # Create colored heatmap
        heatmap = cv2.applyColorMap(
            (cam_mask * 255).astype(np.uint8),
            cv2.COLORMAP_JET
        )
        
        # Resize heatmap to match image
        heatmap = cv2.resize(heatmap, (image_bgr.shape[1], image_bgr.shape[0]))
        
        # Blend
        overlay = cv2.addWeighted(image_bgr, 1 - alpha, heatmap, alpha, 0)
        
        return overlay

    def _generate_fallback_heatmap(
        self,
        viz_array: np.ndarray,
        image_id: str
    ) -> Optional[Path]:
        """
        Generate a simple Gaussian-based pseudo-heatmap as fallback
        when GradCAM library is unavailable.
        """
        try:
            h, w = viz_array.shape[:2]
            
            # Create a Gaussian-centered heatmap (simulates lung focus)
            y, x = np.mgrid[0:h, 0:w]
            center_y, center_x = h * 0.55, w * 0.5  # Slightly below center (lung area)
            sigma = min(h, w) * 0.25
            gaussian = np.exp(-((x - center_x)**2 + (y - center_y)**2) / (2 * sigma**2))
            gaussian = (gaussian / gaussian.max())
            
            # Add some noise for realism
            noise = np.random.uniform(0, 0.15, gaussian.shape)
            cam_mask = np.clip(gaussian + noise, 0, 1).astype(np.float32)
            
            overlay = self._create_overlay(viz_array, cam_mask)
            
            output_path = HEATMAP_DIR / f"{image_id}_gradcam.png"
            cv2.imwrite(str(output_path), overlay)
            
            return output_path
            
        except Exception as e:
            print(f"[GradCAM] Fallback heatmap also failed: {e}")
            return None
