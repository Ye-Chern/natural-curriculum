"""Protect the boundary between a research result and a published chapter."""
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch

SPEC = importlib.util.spec_from_file_location("sync_content", Path(__file__).resolve().parents[1] / "scripts/sync_content.py")
SYNC = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(SYNC)


class PublicationBoundary(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        (self.root / "research").mkdir()
        (self.root / "chapters").mkdir()
        (self.root / "chapters/ready.qmd").write_text("## A proof {#proved-here}\n", encoding="utf-8")
        (self.root / "research/draft.md").write_text("Research proof, not a chapter.\n", encoding="utf-8")
        self.ready = dict(id="ready", kind="tool", parameter="all finite groups", object="ready result", evidence="proof", status="proved", chapter="chapters/ready.qmd", anchor="proved-here", dependencies="none")

    def generate(self, events):
        (self.root / "research/events.json").write_text(json.dumps(events), encoding="utf-8")
        with patch.object(SYNC, "ROOT", self.root):
            return SYNC.outputs()

    def test_research_proof_does_not_publish_even_with_a_chapter_pointer(self):
        research = dict(self.ready, id="research-only", object="unpublished result", status="research-proved", research_file="research/draft.md")
        result = self.generate([self.ready, research])
        self.assertEqual(result[self.root / "_chapters.yml"].count("chapters/ready.qmd"), 1)
        self.assertIn("ready result", result[self.root / "events.qmd"])
        self.assertNotIn("unpublished result", result[self.root / "events.qmd"])

    def test_research_needs_a_real_recovery_pointer(self):
        research = dict(self.ready, id="research-only", status="computed", research_file="research/missing.md")
        with self.assertRaisesRegex(ValueError, "Missing research file"):
            self.generate([research])

    def test_claimed_publication_needs_the_actual_anchor(self):
        with self.assertRaisesRegex(ValueError, "Missing chapter/anchor"):
            self.generate([dict(self.ready, anchor="not-written")])

    def test_duplicate_ids_cannot_silently_replace_evidence(self):
        with self.assertRaisesRegex(ValueError, "Duplicate event id"):
            self.generate([self.ready, dict(self.ready, object="different claim")])


if __name__ == "__main__":
    unittest.main()
