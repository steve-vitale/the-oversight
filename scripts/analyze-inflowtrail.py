#!/usr/bin/env python3
"""sim-inflowtrail-b analysis: trailing-window provenance of inflow-b's
unattributed racks-bound days. Read-only vs the repo corpus; writes only
to the goal hidden_files work dir (argv output path).
Pre-registered in sim-inflowtrail-b-PRE-REGISTRATION.md BEFORE this ran:
PRIMARY = median daysSinceLastInflow across unattributed days <= 7 -> GO.
"""
import json, glob, os, sys
from statistics import median

# Corpus path: the committed repo corpus, resolved relative to this script
# (scripts/analyze-inflowtrail.py -> evidence/2026-10-26/sim-inflow-b-corpus).
# This is the ONLY adaptation from the 1438Z original; all analysis logic
# is unchanged.
CORPUS = os.path.join(os.path.dirname(os.path.abspath(__file__)),
                       "..", "evidence", "2026-10-26", "sim-inflow-b-corpus")
OUT = sys.argv[1] if len(sys.argv) > 1 else None

rows = []  # one per unattributed bound day
tot_bound = tot_attr = tot_unattr = 0
per_seed = {}
for f in sorted(glob.glob(os.path.join(CORPUS, "inflow-b-cap1-*.json"))):
    d = json.load(open(f))
    seed = d["seed"]
    inflows = sorted(d["inflows"] or [], key=lambda r: (r["day"], r["seq"]))
    at = d["attributionTable"] or []
    tot_bound += len(at)
    per_seed[seed] = {"bound": len(at), "unattr": 0}
    for r in at:
        if r.get("attributed"):
            tot_attr += 1
            continue
        tot_unattr += 1
        per_seed[seed]["unattr"] += 1
        D = r["day"]
        prior = [i for i in inflows if i["day"] < D]
        last_day = max((i["day"] for i in prior), default=None)
        dsl = (D - last_day) if last_day is not None else None
        trail = {}
        for W in (3, 7, 14, 30):
            sel = [i for i in inflows if D - W <= i["day"] <= D - 1]
            by_door = {}
            for i in sel:
                by_door[i["door"]] = by_door.get(i["door"], 0) + i["kcal"]
            trail[W] = {"kcal": sum(by_door.values()), "n": len(sel),
                        "byDoor": by_door}
        rows.append({"seed": seed, "day": D, "pantryFirst": r.get("pantryFirst"),
                     "daysSinceLastInflow": dsl,
                     "lastInflow": ([i for i in prior if i["day"] == last_day]
                                    if last_day is not None else []),
                     "trail": trail})

dsl_vals = sorted(r["daysSinceLastInflow"] for r in rows
                  if r["daysSinceLastInflow"] is not None)
med = median(dsl_vals) if dsl_vals else None
no_prior = sum(1 for r in rows if r["daysSinceLastInflow"] is None)
out = {
    "neutrality": {"bound": tot_bound, "attributed": tot_attr,
                   "unattributed": tot_unattr, "expected": [327, 289, 38],
                   "pass": (tot_bound, tot_attr, tot_unattr) == (327, 289, 38)},
    "perSeed": per_seed,
    "primary": {"metric": "median daysSinceLastInflow",
                "value": med, "bar": "<= 7",
                "verdict": ("GO" if med is not None and med <= 7 else "NO-GO")},
    "daysSinceLastInflowDistribution": {
        str(v): sum(1 for r in rows if r["daysSinceLastInflow"] == v)
        for v in sorted(set(r["daysSinceLastInflow"] for r in rows),
                        key=lambda x: (x is None, x))},
    "noPriorInflowDays": no_prior,
    "secondary": {},
    "rows": rows,
}
for W in (3, 7, 14, 30):
    any_in = sum(1 for r in rows if r["trail"][W]["n"] > 0)
    ratios = sorted(r["trail"][14]["kcal"] / r["pantryFirst"]
                    for r in rows if r["pantryFirst"]) if W == 14 else []
    out["secondary"][f"trailing{W}d"] = {
        "daysWithAnyInflow": any_in, "share": any_in / len(rows) if rows else 0,
        "medianKcal": median([r["trail"][W]["kcal"] for r in rows]) if rows else 0}
    if W == 14:
        out["secondary"]["trailing14d"]["medianKcalOverPantryFirst"] = (
            median(ratios) if ratios else None)
door_mix = {}
for r in rows:
    for door, kcal in r["trail"][14]["byDoor"].items():
        door_mix[door] = door_mix.get(door, 0) + kcal
out["secondary"]["trailing14dDoorMixKcal"] = door_mix

if OUT:
    with open(OUT, "w") as f:
        json.dump(out, f, indent=1)
print("neutrality:", out["neutrality"])
print("perSeed:", per_seed)
print("PRIMARY median daysSinceLastInflow:", med, "->", out["primary"]["verdict"])
print("distribution:", out["daysSinceLastInflowDistribution"])
print("noPriorInflowDays:", no_prior)
for W in (3, 7, 14, 30):
    print(f"trailing{W}d:", out["secondary"][f"trailing{W}d"])
print("trailing14d door mix:", door_mix)
print("--- sense samples (first 3 unattributed days) ---")
for r in rows[:3]:
    li = r["lastInflow"]
    li_txt = "; ".join(f"{i['name']} {i['kcal']}kcal day {i['day']} ({i['door']})"
                         for i in li) if li else "NONE EVER"
    print(f"seed {r['seed']} day {r['day']}: pantryFirst={r['pantryFirst']} "
          f"daysSinceLast={r['daysSinceLastInflow']} last=[{li_txt}] "
          f"trail7={r['trail'][7]['kcal']}kcal trail14={r['trail'][14]['kcal']}kcal")
