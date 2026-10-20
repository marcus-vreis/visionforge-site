"""A small RGB architecture for VisionForge classification or regression."""

from torch import nn

from visionforge.models.registry import register_model


@register_model("research_cnn")
def build(num_outputs: int) -> nn.Module:
    """Return unnormalized outputs shaped [batch, num_outputs]."""
    return nn.Sequential(
        nn.Conv2d(3, 16, kernel_size=3, padding=1),
        nn.ReLU(),
        nn.Conv2d(16, 32, kernel_size=3, padding=1),
        nn.ReLU(),
        nn.AdaptiveAvgPool2d(1),
        nn.Flatten(),
        nn.Linear(32, num_outputs),
    )
