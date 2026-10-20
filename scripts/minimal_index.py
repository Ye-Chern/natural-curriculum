"""Run a bounded GAP/PrimGrp scan and validate its complete, versioned transcript."""
import argparse
import hashlib
import json
from math import factorial
import os
from pathlib import Path
import shlex
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]


def sha256(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def summarize(raw, bound):
    rows = [json.loads(line) for line in raw.splitlines() if line.strip()]
    if not rows or rows[0].get("type") != "meta" or rows[-1].get("type") != "done":
        raise ValueError("Incomplete run: missing metadata or completion marker")
    if rows[0]["bound"] != bound:
        raise ValueError("Bound mismatch")
    if not rows[0].get("gap") or not rows[0].get("primgrp"):
        raise ValueError("Missing software versions")
    stages, actions, firsts = [], [], {}
    pending, expected_degree = [], 2
    for row in rows[1:-1]:
        if row["type"] == "simple":
            n, i = row["degree"], row["id"]
            if type(row["new"]) is not bool or (not isinstance(row["first"], list)
                    or len(row["first"]) != 2 or any(type(v) is not int or v < 1 for v in row["first"])):
                raise ValueError("Invalid class reference/type")
            if n != expected_degree or i < 1 or any(x["id"] == i for x in pending):
                raise ValueError("Unordered/duplicate action")
            if row["order"] != n * row["stabilizer_order"]:
                raise ValueError("Orbit-stabilizer mismatch")
            if not row["generators"] or any(sorted(p) != list(range(1, n + 1)) for p in row["generators"]):
                raise ValueError("Invalid permutation generators")
            key = tuple(row["first"])
            if row["new"]:
                if key != (n, i) or key in firsts:
                    raise ValueError("Invalid new-class representative")
                firsts[key] = row
            elif key not in firsts or firsts[key]["order"] != row["order"]:
                raise ValueError("Missing/incompatible earlier representative")
            pending.append(row)
        elif row["type"] == "degree":
            if row["degree"] != expected_degree:
                raise ValueError("Degree coverage gap")
            if (row["simple_actions"] != len(pending)
                    or row["new_classes"] != sum(x["new"] for x in pending)
                    or row["primitive_count"] < len(pending)
                    or any(x["id"] > row["primitive_count"] for x in pending)):
                raise ValueError("Stage accounting mismatch")
            stages.append(row); actions.extend(pending)
            pending = []; expected_degree += 1
        else:
            raise ValueError("Unexpected record type")
    if pending or expected_degree != bound + 1 or rows[-1]["classes"] != len(firsts):
        raise ValueError("Incomplete degree/class coverage")
    return {"schema": 1, "scope": {"min_degree": 2, "max_degree": bound},
            "software": {k: rows[0][k] for k in ("gap", "primgrp")},
            "status": "computed-relative-to-PrimGrp-coverage-and-GAP-algorithms",
            "completeness_dependency": "PrimGrp manual 1.1 plus minimal-index reduction in research/minimal-index.md",
            "stages": stages,
            "classes": [{"label": r["label"], "order": r["order"], "mu": r["degree"],
                         "factorial_lower_bound": next(m for m in range(2, r["degree"] + 1)
                                                       if factorial(m) % r["order"] == 0),
                         "representative": r["first"],
                         "actions": [[a["degree"], a["id"]] for a in actions if a["first"] == r["first"]]}
                        for r in firsts.values()],
            "isomorphism_calls": rows[-1]["isomorphism_calls"]}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--max-degree", type=int, default=12)
    parser.add_argument("--gap", default="gap", help="GAP executable (no shell expansion)")
    parser.add_argument("--gap-arg", action="append", default=[], help="repeat for e.g. -l and root path")
    parser.add_argument("--gap-source", help="GAP-readable path to minimal_index.g, e.g. /cygdrive/d/...")
    parser.add_argument("--runtime-bin", type=Path, help="prepend a local DLL/runtime directory to the child PATH")
    parser.add_argument("--output", type=Path, default=ROOT / "research/results/minimal-index-12")
    parser.add_argument("--check", action="store_true", help="validate frozen transcript and source hashes without GAP")
    parser.add_argument("--compare", type=Path, help="after a fresh run compare stable library IDs/classes with this frozen summary")
    parser.add_argument("--timeout", type=int, default=600)
    args = parser.parse_args()
    if not 2 <= args.max_degree <= 50:
        parser.error("This exploratory runner supports degrees 2..50; broader coverage needs review")
    raw_path = args.output.with_suffix(".jsonl")
    summary_path = args.output.with_suffix(".json")
    sources = {str(p.relative_to(ROOT)).replace("\\", "/"): sha256(p)
               for p in [Path(__file__), ROOT / "scripts/minimal_index.g"]}
    if args.check:
        frozen = json.loads(summary_path.read_text(encoding="utf-8"))
        summary = summarize(raw_path.read_text(encoding="utf-8"), args.max_degree)
        for key, value in summary.items():
            if frozen.get(key) != value:
                raise SystemExit(f"Frozen summary drift: {key}")
        if frozen["source_sha256"] != sources or frozen["transcript_sha256"] != sha256(raw_path):
            raise SystemExit("Source/transcript hash drift: rerun and review affected claims")
        print(f"Frozen run verified: {len(summary['classes'])} classes through {args.max_degree}")
        return
    source = args.gap_source or (ROOT / "scripts/minimal_index.g").as_posix()
    command = [args.gap, *args.gap_arg, "-q", "-b", "-r", "-T", "-A", "-x", "4096"]
    program = f"Read({json.dumps(source)});; RunMinimalIndex({args.max_degree});; QUIT_GAP(0);\n"
    environment = dict(os.environ)
    if args.runtime_bin:
        environment["PATH"] = str(args.runtime_bin.resolve()) + os.pathsep + environment.get("PATH", "")
    run = subprocess.run(command, input=program, text=True, encoding="utf-8", capture_output=True,
                         timeout=args.timeout, cwd=ROOT, env=environment)
    if run.returncode or run.stderr.strip():
        raise SystemExit(f"GAP failed ({run.returncode}): {run.stderr[-2000:]}\n{run.stdout[-1000:]}")
    summary = summarize(run.stdout, args.max_degree)
    raw_path.parent.mkdir(parents=True, exist_ok=True)
    raw_path.write_text(run.stdout, encoding="utf-8", newline="\n")
    summary.update(source_sha256=sources, transcript_sha256=sha256(raw_path),
                   argv=command, command=shlex.join(command), input=program.strip(),
                   runtime_bin=str(args.runtime_bin.resolve()) if args.runtime_bin else None)
    summary_path.write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8", newline="\n")
    if args.compare:
        frozen = json.loads(args.compare.read_text(encoding="utf-8"))
        stable = lambda s: [{k: row[k] for k in ("mu", "order", "representative", "actions")}
                            for row in s["classes"]]
        if (summary["scope"] != frozen["scope"] or summary["stages"] != frozen["stages"]
                or stable(summary) != stable(frozen)):
            raise SystemExit("Fresh GAP results differ from frozen stable IDs/classes; mathematical review required")
    print(f"Completed: {len(summary['classes'])} classes; output {summary_path}")


if __name__ == "__main__":
    main()
