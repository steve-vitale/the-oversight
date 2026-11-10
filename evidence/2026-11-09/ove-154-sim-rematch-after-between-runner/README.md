# OVE-154 — STD16 rematch after Between runner lean

- **Treatment tip (panel Game):** `a3f8070d4` (OVE-152 Between runner army lean; #115)
- **Evidence PR base / phone tip:** `60b47480e` (OVE-153 phone-frame; #116)
- **Baseline panel:** OVE-150 Between chase rematch `panel/panel.json.gz` (PR #114 / panel `sourceHead` `f585bc98f`)
- **Verdict:** `NO_REGRESSION` — 64/64 exact `stateHash` + all23 metric vectors identical; screen-only `review_required` with all deltas 0
- **Policy identity:** `scripts/policies/competent.js` = `origin/master` (measurement tip only; Muse off)
- **Recipe:** seeds `7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9` × `capable,maker,merchant,caregiver` × 150d × all23; `balance-panel --par 4`
- **Artifacts:** `before-ove150-panel.json.gz`, `panel/`, `cmp.{md,json}`, `panel.log`

See store result `ove-154-sim-rematch-after-between-runner-result.md`.
