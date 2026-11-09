# OVE-142 — STD16 rematch after OPA breach army lean

- **Treatment tip:** `26707499d` (OVE-140 OPA breach army lean; #106)
- **Baseline panel:** OVE-138 Unkillable rematch `panel/panel.json.gz` (PR #105 / panel `sourceHead` `fc6cd6395`)
- **Verdict:** `NO_REGRESSION` — 64/64 exact `stateHash` + all23 metric vectors identical
- **Policy identity:** `scripts/policies/competent.js` = `origin/master` (measurement tip only; Muse off)
- **Recipe:** seeds `7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9` × `capable,maker,merchant,caregiver` × 150d × all23; `balance-panel --par 4`
- **Artifacts:** `before-ove138-panel.json.gz`, `panel/`, `cmp.{md,json}`, `panel.log`

See store result `ove-142-sim-rematch-after-opa-breach-result.md`.
