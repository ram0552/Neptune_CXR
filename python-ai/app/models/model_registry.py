"""
NEPTUNE-CXR: Model Registry
Plugin-based registry for swapping AI models without changing the API.
Future models (ViT, EfficientNet, GNN, Concept Bottleneck) register here.
"""
from typing import Dict, Type
from app.models.base_model import BaseCXRModel
from app.models.densenet_model import DenseNet121CXR


class ModelRegistry:
    """
    Registry pattern for AI model management.
    
    Usage:
        registry = ModelRegistry()
        model = registry.get_model("densenet121")
        model.load()
        predictions = model.predict(tensor)
    
    Adding a new model:
        1. Create a class extending BaseCXRModel
        2. Register it: ModelRegistry.register("my_model", MyModelClass)
    """
    
    _models: Dict[str, Type[BaseCXRModel]] = {}
    _instances: Dict[str, BaseCXRModel] = {}

    @classmethod
    def register(cls, name: str, model_class: Type[BaseCXRModel]) -> None:
        """Register a model class by name."""
        cls._models[name.lower()] = model_class
        print(f"[Registry] Registered model: {name}")

    @classmethod
    def get_model(cls, name: str, **kwargs) -> BaseCXRModel:
        """
        Get a model instance by name. Creates singleton instances.
        
        Args:
            name: Registered model name (case-insensitive)
            
        Returns:
            Model instance (loaded or unloaded)
            
        Raises:
            ValueError: If model name is not registered
        """
        name = name.lower()
        
        if name not in cls._models:
            available = ", ".join(cls._models.keys())
            raise ValueError(
                f"Model '{name}' not found. Available models: {available}"
            )
        
        # Return existing instance if available
        if name in cls._instances:
            return cls._instances[name]
        
        # Create new instance
        instance = cls._models[name](**kwargs)
        cls._instances[name] = instance
        return instance

    @classmethod
    def list_models(cls) -> list:
        """List all registered model names."""
        return list(cls._models.keys())

    @classmethod
    def is_registered(cls, name: str) -> bool:
        """Check if a model name is registered."""
        return name.lower() in cls._models


# ──────────────────────────────────────────────
# Register built-in models
# ──────────────────────────────────────────────
ModelRegistry.register("densenet121", DenseNet121CXR)

# Future registrations:
# ModelRegistry.register("efficientnet", EfficientNetCXR)
# ModelRegistry.register("vit", VisionTransformerCXR)
# ModelRegistry.register("concept_bottleneck", ConceptBottleneckCXR)
