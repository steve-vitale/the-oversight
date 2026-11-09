# OVE-146 — STD16 rematch after Ward army-advance lean

- **Treatment tip:** `0a1359337` (OVE-144 Undying Ward army-advance lean; #109)
- **Baseline panel:** OVE-142 OPA-breach rematch `panel/panel.json.gz` (PR #108 / panel `sourceHead` `26707499d`)
- **Verdict:** `NO_REGRESSION` — 64/64 exact `stateHash` + all23 metric vectors identical; screen-only `review_required` with all deltas 0
- **Policy identity:** `scripts/policies/competent.js` = `origin/master` (measurement tip only; Muse off)
- **Recipe:** seeds `7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9` × `capable,maker,merchant,caregiver` × 150d × all23; `balance-panel --par 4`
- **Artifacts:** `before-ove142-panel.json.gz`, `panel/`, `cmp.{md,json}`, `panel.log`

See store result `ove-146-sim-rematch-after-ward-army-result.md`.
