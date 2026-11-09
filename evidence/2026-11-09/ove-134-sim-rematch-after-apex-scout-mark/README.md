# OVE-134 — STD16 rematch after Apex scout-mark army lean

- **Treatment tip:** `337f41268` (OVE-132 Apex scout-mark army lean; #100)
- **Baseline panel:** OVE-130 All-Seeing rematch `panel/panel.json.gz` (tip `eeb3defd2` / #97)
- **Verdict:** `NO_REGRESSION` — 64/64 exact `stateHash` + all23 metric vectors identical
- **Policy identity:** `scripts/policies/competent.js` = `origin/master` (measurement tip only; Muse off)
- **Recipe:** seeds `7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9` × `capable,maker,merchant,caregiver` × 150d × all23; `balance-panel --par 4`
- **Artifacts:** `before-ove130-panel.json.gz`, `panel/`, `cmp.{md,json}`, `panel.log`

See store result `ove-134-sim-rematch-after-apex-scout-mark-result.md`.
