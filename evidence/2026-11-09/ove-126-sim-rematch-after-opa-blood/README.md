# OVE-126 — STD16 rematch after OPA blood contest lean

- **Treatment tip:** `f656b2ff8` (OVE-124 One-Person Army blood contest lean; #94)
- **Baseline panel:** OVE-122 Market army rematch `panel/panel.json.gz` (tip `a9f41e191` / #91)
- **Verdict:** `NO_REGRESSION` — 64/64 exact `stateHash` + all23 metric vectors identical
- **Policy identity:** `scripts/policies/competent.js` = `origin/master` (measurement tip only; Muse off)
- **Recipe:** seeds `7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9` × `capable,maker,merchant,caregiver` × 150d × all23; `balance-panel --par 4`
- **Artifacts:** `before-ove122-panel.json.gz`, `panel/`, `cmp.{md,json}`, `panel.log`

See store result `ove-126-sim-rematch-after-opa-blood-result.md`.
