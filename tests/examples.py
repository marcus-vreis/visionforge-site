"""Check downloadable tutorials against an installed VisionForge on CPU."""

import json
import math
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

import torch
from pydantic import ValidationError

from visionforge.models.registry import build_custom_model
from visionforge.tasks.engine import GenericTaskEngine
from visionforge.tasks.registry import get_task

EXAMPLES = Path(__file__).resolve().parents[1] / "public/examples"
# Downloadable Python sources must stay free of generated public bytecode.
sys.dont_write_bytecode = True
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

    def test_complete_project_through_cli(self) -> None:
        """Run the downloadable project on real digits with the documented CLI path."""
        import yaml

        project = EXAMPLES.parents[1] / "examples/digits-project"
        self.assertEqual(
            (project / "user_models/research_cnn.py").read_text(encoding="utf-8"),
            (EXAMPLES / "research_cnn.py").read_text(encoding="utf-8"),
        )
        with tempfile.TemporaryDirectory(prefix="vf-digits-") as temporary:
            workspace = Path(temporary) / "digits-project"
            shutil.copytree(project, workspace)
            environment = {
                **os.environ, "PYTHONDONTWRITEBYTECODE": "1", "OMP_NUM_THREADS": "2",
                "MKL_NUM_THREADS": "2", "CUDA_VISIBLE_DEVICES": "",
            }

            def execute(*arguments: str, success: bool = True) -> subprocess.CompletedProcess:
                result = subprocess.run(
                    [sys.executable, *arguments], cwd=workspace, env=environment,
                    capture_output=True, text=True, encoding="utf-8", errors="replace", timeout=120,
                )
                if success:
                    self.assertEqual(result.returncode, 0, result.stdout[-2000:] + result.stderr[-2000:])
                return result

            execute("prepare_data.py", "--limit-per-class", "12")
            manifest_path = workspace / "datasets/digits/manifest.json"
            original_manifest = manifest_path.read_text(encoding="utf-8")
            manifest = json.loads(original_manifest)
            splits = {key: set(values) for key, values in manifest["samples"].items()}
            self.assertEqual({key: len(values) for key, values in splits.items()}, {"train": 72, "val": 24, "test": 24})
            self.assertFalse(splits["train"] & splits["val"])
            self.assertFalse(splits["train"] & splits["test"])
            self.assertFalse(splits["val"] & splits["test"])
            for split in splits:
                self.assertEqual(len(list((workspace / f"datasets/digits/{split}").glob("*/*.png"))), len(splits[split]))
                self.assertEqual(sorted(path.name for path in (workspace / f"datasets/digits/{split}").iterdir()), [str(label) for label in range(10)])
            refused = execute("prepare_data.py", success=False)
            self.assertNotEqual(refused.returncode, 0)
            self.assertIn("already exists", refused.stderr)
            self.assertEqual(manifest_path.read_text(encoding="utf-8"), original_manifest)
            execute("prepare_data.py", "--limit-per-class", "12", "--output", "datasets/repeated")
            self.assertEqual((workspace / "datasets/repeated/manifest.json").read_text(encoding="utf-8"), original_manifest)
            config_path = workspace / "configs/digits.yaml"
            config = yaml.safe_load(config_path.read_text(encoding="utf-8"))
            config["training"]["epochs"] = 1
            config_path.write_text(yaml.safe_dump(config), encoding="utf-8")
            execute("-m", "visionforge", "run", "configs/digits.yaml")
            runs = list((workspace / "outputs/models").glob("**/run.json"))
            self.assertEqual(len(runs), 1)
            record = json.loads(runs[0].read_text(encoding="utf-8"))
            self.assertEqual(record["config"]["model"]["custom_model"], "research_cnn")
            self.assertEqual(record["config"]["device"]["kind"], "cpu")
            self.assertEqual(record["config"]["model"]["num_classes"], 10)
            self.assertEqual(len(record["history"]), 1)
            self.assertTrue((runs[0].parent / "best_model.pth").is_file())
            report = json.loads(execute("inspect_run.py").stdout)
            self.assertEqual(report["model"]["custom_model"], "research_cnn")
            self.assertTrue(report["metrics"])
            selected = json.loads(execute("inspect_run.py", str(runs[0])).stdout)
            self.assertEqual(selected["metrics"], report["metrics"])

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
