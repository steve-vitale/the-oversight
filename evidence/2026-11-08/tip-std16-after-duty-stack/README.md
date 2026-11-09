# Tip STD16 after hunt + scout DUTY stack (OVE-86)

Measurement-only screen. Decision: **`review_required`**.

- **Game tip:** `84b54f4be` (PR #64 tip; includes #63 `dutyKnownPrey`←codex + #64 scout DUTY offers).
- **Prior panel:** copy of `improvements-verify-panel` (tip `206fe4931`) as `before-improvements-verify-panel.json.gz`.
- **Fresh panel:** `panel/panel.json.gz` (64 cases).
- **Compare:** `cmp.{md,json}` → `review_required`.

## competent.js identity

First compare on the raw #64 tip was **`invalid`** (`cmp-invalid-policy.*`): Muse `scripts/policies/competent.js` had drifted in stack commit `ddb7f90da`. Measurement restores that file to **`origin/master` identity only** so the paired screen is Game-only. No other Muse policy/economy edits.
