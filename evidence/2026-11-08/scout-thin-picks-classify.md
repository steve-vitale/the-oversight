# OVE-88 — scout thin picks classify

Tip: `84b54f4be` (OVE-81 #64). Census: `evidence/2026-11-08/phase6-role-census-after-scout/`
(OVE-83 / #66). Measurement only; no Game/policy edit; no re-panel.

## Verdict

**SCOUT_THIN_HONEST_COMPETITION**

## Weight stack (live `villager-brain.js`)

| Duty | Base w | Notes |
|---|---:|---|
| scout | 2.3 | OVE-81 soft vs teach |
| teach | 2.4 | |
| known-prey hunt | 2.5–3.4 | |
| water | ≥3.0 | |
| Competence nudge | ×clamp(comp,0.85,1.15) | soldier scout 1.4 → 2.645 |

## Capable `adSamples` (640 total, last-40/seed)

| Metric | Value |
|---|---:|
| Samples with scout | 519 |
| Scout top among DUTY | 7 |
| Beat-by water / teach / patrol / hunt | 238 / 142 / 115 / 17 |
| Teach > scout when cofired | 497/502 |
| Water > scout when cofired | 240/240 |

Competent: scout present 520; top 4; water 300 / teach 96 / hunt 71 / patrol 49;
teach>scout 491/505; water>scout 301/301.

## Competence rung 0

| Policy | ge8 who | End/periodic scout pr | Competence |
|---|---|---:|---|
| capable | Vasyl (infantry soldier), seed7 | 13 (endSnap) | 1.4 → 1.4 |
| competent | Vasyl, seed7 | 9 (periodic day60) | 1.4 → 1.4 |

Practice step narration fires; analyzer `competenceRungSteps` stays 0 under the 1.4 cap.

## Probe undercount

`scripts/probe-phase6-role-census-20261108b.js` `pickByTask` uses `dutyCands[0]`,
not max score. Capable seed7 samples: 4 max-score scout DUTY wins, file
`pickByTask.scout=0`. Game `vbrainScorePick` correctly selects max DUTY `w`.

Store result: Project store `docs/ove-88-scout-thin-picks-classify-result.md`.
