#!/usr/bin/env python3
"""Proof for sim-inflowtrail-b: re-run the committed analyzer on the
committed corpus and assert the landed verdict reproduces exactly.

Why .py and not .js: the analyzer (scripts/analyze-inflowtrail.py) is
Python. A .js proof would only shell out to python and assert on its
output — an extra layer with no value. This script does that job
directly: run the analyzer, read its JSON, assert the fixed numbers.

Asserts (from the pre-registered bar + 1438Z result, never re-judged):
  neutrality: bound 327, attributed 289, unattributed 38
  PRIMARY: median daysSinceLastInflow == 1.0 (bar <= 7 -> GO)
  distribution: 1x32, 2x4, 3x1, 4x1; zero days with no prior inflow
Exits non-zero on any mismatch. Usage: python3 scripts/test-inflowtrail-b.py
"""
import json, os, subprocess, sys, tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
ANALYZER = os.path.join(HERE, "analyze-inflowtrail.py")
CORPUS = os.path.join(HERE, "..", "evidence", "2026-10-26",
                       "sim-inflow-b-corpus")

fails = []
def check(name, got, want):
    ok = got == want
    print(f"{'PASS' if ok else 'FAIL'} {name}: got {got!r}, want {want!r}")
    if not ok:
        fails.append(name)

if not os.path.isdir(CORPUS):
    print(f"FAIL corpus dir missing: {CORPUS}")
    sys.exit(1)

with tempfile.TemporaryDirectory() as td:
    out = os.path.join(td, "inflowtrail.json")
    r = subprocess.run([sys.executable, ANALYZER, out],
                       capture_output=True, text=True)
    print(r.stdout, end="")
    if r.returncode != 0:
        print("FAIL analyzer exited non-zero:\n", r.stderr)
        sys.exit(1)
    res = json.load(open(out))

n = res["neutrality"]
check("neutrality bound", n["bound"], 327)
check("neutrality attributed", n["attributed"], 289)
check("neutrality unattributed", n["unattributed"], 38)
check("neutrality pass flag", n["pass"], True)
check("PRIMARY median daysSinceLastInflow",
      res["primary"]["value"], 1.0)
check("PRIMARY verdict", res["primary"]["verdict"], "GO")
check("distribution", res["daysSinceLastInflowDistribution"],
      {"1": 32, "2": 4, "3": 1, "4": 1})
check("noPriorInflowDays", res["noPriorInflowDays"], 0)
check("row count", len(res["rows"]), 38)
check("trailing7d daysWithAnyInflow",
      res["secondary"]["trailing7d"]["daysWithAnyInflow"], 38)

if fails:
    print(f"PROOF FAILED: {len(fails)} mismatch(es): {fails}")
    sys.exit(1)
print("PROOF GREEN: sim-inflowtrail-b reproduces exactly "
      "(327/289/38, median 1.0, GO).")
