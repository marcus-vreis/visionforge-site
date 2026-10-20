"""Check downloadable tutorials against an installed VisionForge on CPU."""

import json
import math
import tempfile
import unittest
from pathlib import Path

import torch
from pydantic import ValidationError

from visionforge.models.registry import build_custom_model
from visionforge.tasks.engine import GenericTaskEngine
from visionforge.tasks.registry import get_task

EXAMPLES = Path(__file__).resolve().parents[1] / "public/examples"
torch.set_num_threads(2)


class TutorialTests(unittest.TestCase):
    """Exercise discovery, tensor contracts, the research field and run artifacts."""

    def test_model_outputs_and_gradients(self) -> None:
        """Build the downloaded model through the real custom-model registry."""
        for outputs in (2, 3):
            model = build_custom_model(
                "research_cnn", num_outputs=outputs, user_models_dir=EXAMPLES
            )
            prediction = model(torch.randn(2, 3, 32, 32))
            self.assertEqual(prediction.shape, (2, outputs))
            prediction.square().mean().backward()
            self.assertTrue(all(p.grad is not None for p in model.parameters()))

    def test_field_drives_loss_and_real_cpu_training(self) -> None:
        """Validate the generated form field, hooks and one real CPU epoch."""
        info = get_task("research_method", user_tasks_dir=EXAMPLES)
        self.assertIsNotNone(info.spec_cls)
        spec = info.spec_cls()
        field = spec.Config.model_json_schema()["properties"]["research_weight"]
        self.assertEqual(field["minimum"], 0)
        self.assertEqual(field["maximum"], 1)
        self.assertEqual(field["default"], 0.1)
        with tempfile.TemporaryDirectory(prefix="vf-tutorial-") as temporary:
            config = {
                "name": "tutorial_cpu",
                "data": {"base_dir": temporary, "num_workers": 0},
                "training": {"epochs": 1, "batch_size": 7, "seed": 42},
                "device": {"kind": "cpu"},
                "output": {"models_dir": str(Path(temporary) / "runs")},
                "n_samples": 32,
            }
            for invalid in (-0.1, 1.1):
                with self.assertRaises(ValidationError):
                    spec.Config.model_validate({**config, "research_weight": invalid})
            cfg = spec.Config.model_validate(config)
            model = spec.build_model(cfg)
            train, val, _ = spec.build_loaders(cfg)
            batch = next(iter(train))
            zero = cfg.model_copy(update={"research_weight": 0.0})
            one = cfg.model_copy(update={"research_weight": 1.0})
            difference = spec.compute_loss(model, batch, one) - spec.compute_loss(
                model, batch, zero
            )
            penalty = torch.cat([p.flatten() for p in model.parameters()]).square().mean()
            torch.testing.assert_close(difference, penalty, atol=1e-6, rtol=1e-5)
            spec.compute_loss(model, batch, cfg).backward()
            self.assertTrue(all(p.grad is not None for p in model.parameters()))
            with torch.no_grad():
                errors = torch.cat([(model(x) - y).abs().flatten() for x, y in val])
            self.assertAlmostEqual(spec.compute_metrics(model, val, cfg)["mae"], errors.mean().item(), places=6)
            events = []
            result = GenericTaskEngine(info, cfg).run(progress_callback=events.append)
            self.assertEqual(result.total_epochs, 1)
            self.assertEqual(result.device_used.lower(), "cpu")
            self.assertTrue(math.isfinite(result.metrics["mae"]))
            self.assertTrue(result.model_path.is_file())
            record = json.loads((result.run_dir / "run.json").read_text(encoding="utf-8"))
            self.assertEqual(record["task"], "custom:research_method")
            self.assertEqual(record["config"]["research_weight"], 0.1)
            self.assertEqual(len(record["history"]), 1)
            self.assertIn("environment", record)
            self.assertEqual(events[0]["event"], "start")
            self.assertEqual(events[-1]["event"], "end")


if __name__ == "__main__":
    unittest.main()
