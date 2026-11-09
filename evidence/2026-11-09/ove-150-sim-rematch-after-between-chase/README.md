# OVE-150 — STD16 rematch after Between chase lean

- **Treatment tip (panel Game):** `f585bc98f` (OVE-148 Between chase/race contest lean; #112)
- **Evidence PR base / phone tip:** `a0bab369e` (OVE-149 phone-frame; #113)
- **Baseline panel:** OVE-146 Ward rematch `panel/panel.json.gz` (PR #111 / panel `sourceHead` `0a1359337`)
- **Verdict:** `NO_REGRESSION` — 64/64 exact `stateHash` + all23 metric vectors identical; screen-only `review_required` with all deltas 0
- **Policy identity:** `scripts/policies/competent.js` = `origin/master` (measurement tip only; Muse off)
- **Recipe:** seeds `7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9` × `capable,maker,merchant,caregiver` × 150d × all23; `balance-panel --par 4`
- **Artifacts:** `before-ove146-panel.json.gz`, `panel/`, `cmp.{md,json}`, `panel.log`

See store result `ove-150-sim-rematch-after-between-chase-result.md`.
