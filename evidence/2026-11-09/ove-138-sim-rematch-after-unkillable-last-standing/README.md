# OVE-138 — STD16 rematch after Unkillable last-standing army lean

- **Treatment tip:** `fc6cd6395` (OVE-136 Unkillable last-standing army lean; #103)
- **Baseline panel:** OVE-134 Apex rematch `panel/panel.json.gz` (PR #102 / panel `sourceHead` `3110e0f64`)
- **Verdict:** `NO_REGRESSION` — 64/64 exact `stateHash` + all23 metric vectors identical
- **Policy identity:** `scripts/policies/competent.js` = `origin/master` (measurement tip only; Muse off)
- **Recipe:** seeds `7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9` × `capable,maker,merchant,caregiver` × 150d × all23; `balance-panel --par 4`
- **Artifacts:** `before-ove134-panel.json.gz`, `panel/`, `cmp.{md,json}`, `panel.log`

See store result `ove-138-sim-rematch-after-unkillable-last-standing-result.md`.
