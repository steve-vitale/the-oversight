# ARM "fifthlink-r26" — fifthlink conversion on the forming-seeds denominator (scale-onramp) — GO

Worktree: `~/workspace/worktrees/sim-fifthlink-a`. Run: oversight-flesh-out-loop, run r26, loop A, axis scale-onramp.
Context: r22's fifthlink arm PROVED the tend-vs-decay race can be won (scripted race 24→14 baseline vs 24→54 layered) but KILLED at pilot: conversion was gated by 5th-link FORMATION (~2/8 seeds) and the GO metric was miscalibrated (≥2/8 absolute demanded ~100% conversion on forming seeds). r22's named next step: "next run should use forming-seeds as denominator." This arm is that next run. The layer is a fresh recreation (r22's file was deleted per kill protocol) — proof re-run, numbers reproduced exactly (24→14 / 24→54 / 35→57).

Commit: policy-side only, default OFF. No game-code changes — layer + instruments + evidence only.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE any sim

- **Question**: conditional on a 5th lead link FORMING, does the tend-first layer convert it to seasoned (30+d, trust 40+) — measured on forming seeds only?
- **Primary metric**: seasoned conversion = (forming seeds where the 5th lead link seasons by end of run) / (forming seeds), identical seeds, with-layer vs without-layer.
- **GO**: armed conversion ≥50% AND armed ≥ baseline+1 conversion. Baseline measured on the identical forming subset (expected ~0% — see metric review).
- **KILL-AT-SCREENING**: if the 16-seed baseline screening yields <4 forming seeds, the conversion measurement is under-powered — KILL at screening, documented (no conversion spend).
- **Guardrails**: exiled / national / wave-5 not regressed vs the identical-seed baseline side (per-seed comparison, not median). Median survival is REPORT-ONLY (sharepol finding: median guardrails are tighter than the A/A noise floor on fight-heavy seed sets).
- **Horizon**: 180d death-aware (Steve's WIN-PATH HORIZON 180: 5th links form d50+, seasoning needs 30d).
- **Seeds**: screening 11/22/33/44/55/66/77/88 + 101/202/303/404/505/606/707/808 × leadcourt+FOURTHLINK (baseline, FIFTHLINK unset). Conversion on the forming subset × (baseline vs FOURTHLINK=1 FIFTHLINK=1).
- **Policies**: `fourthlink` (FOURTHLINK=1) vs `fifthlink-r26` (FOURTHLINK=1 FIFTHLINK=1). Policy-side only — safe with sibling arms.
- **Proof**: `scripts/test-fifthlink-r26-20261014.js` — REAL RED phase (scripted in-engine race: baseline 24→14 net-negative; gate-off = fourthlink), GREEN (layer flips 24→54; renegotiation gift answered +8 vs −6 expiry; history-thin 35→57). 15/15.

Metric binding (§14): a miss is NO-GO, never re-scored against a friendlier metric mid-run. Doubts go under "metric review" for the NEXT run. Every evidence file carries a "metric review" section.

## The layer (scripts/policies/fifthlink-r26.js, FIFTHLINK=1, default OFF)

Recreation of r22's deleted `fifthlink.js`, on leadcourt+fourthlink, running after fourthlink.daily, honest engine verbs only:

1. **Young-link grief, answered**: `answerRenegotiation(link.id, 'gift'|'visit')` on live primary-Haven links — gift (1,500 kcal, +8) when pantry > 8000, visit otherwise. Baseline lets both expire aloud (−6 each).
2. **Thin-first tends at the lower gate**: the base tends every link at pantry > 20000 and none below; the layer tends THIN links first when the pantry sits between the courtship floor + one tend price (13500) and the fat gate (20000) — never spending below 12000 (pantry re-read per tend). Thin = trust<30, or 2+ short-tribute weeks in the last 3 from the link's own tribute history ("paid thin:" / "paid nothing" notes). `tendedWeek` dedups against the base's pass.

## Screening (baseline, FOURTHLINK=1, FIFTHLINK unset — 16 seeds, 178s, 16/16 ok)

5th lead link formed on **8/16** seeds — no kill at screening (≥4):

| seed | d | 5th formed | 5th seasoned | trustAt30 | endStanding | national | wave4 | wave5 |
|---|---|---|---|---|---|---|---|---|
| 11 | 168 | d91 | **d127** | 39 | 136 | 1 | 1 | 0 |
| 22 | 119 | d84 | — | 2 | 136 | 1 | 1 | 0 |
| 33 | 107 | d39 | **d68** | 68 | 238 | 1 | 1 | **1** |
| 44 | 135 | d76 | **d105** | 62 | 195 | 1 | 1 | **1** |
| 55 | 90 | d43 | **d72** | 56 | 170 | 1 | 1 | 0 |
| 101 | 80 | d49 | — | 37 | 161 | 1 | 1 | 0 |
| 606 | 122 | d53 | — | 15 | 136 | 1 | 1 | 0 |
| 808 | 104 | d66 | **d95** | 45 | 195 | 1 | 1 | 0 |

Non-forming: s66 (d95, stand 75), s77 (d73, stand 102), s88 (d163, stand 161), s202 (d98, stand 100), s303 (d82, stand 0), s404 (d35, stand 0), s505 (d131, stand 186), s707 (d139, stand 186).

**The big screening finding**: the baseline (unlayered fourthlink) seasons 5th links on **5/8** forming seeds — r22's premise (0/2 baseline conversions) is stale. Landed commits since r22 shifted the race: fat-gate tends land more often (richer pantries / longer-lived villages), so most 5th links win the race unaided. What remains are the near-misses: s101 (t30:37, 3 short), s606 (t30:15, cratering), s22 (t30:2, dead link walking). The conversion question is now: does the layer convert exactly those near-misses?

Screening wall numbers: national 12/16, wave4 13/16, wave5 2/16 (s33, s44), table 0, won 0, maxStanding 238, median survival 105.5d.

## Conversion (forming subset 11/22/33/44/55/101/606/808 × baseline vs armed, identical seeds)

| seed | base 5th | armed 5th | base→armed Standing | nat | exiled | wave5 |
|---|---|---|---|---|---|---|
| 11 | d91→s127 (tw:9, t30:39) | d91→**s120** (tw:21, t30:84) | 136→**272** | 1→1 | 0→0 | 0→**1** |
| 22 | d84→x (tw:1, t30:2) | d77→x (link died with village d96) | 136→136 | 1→1 | 0→0 | 0→0 |
| 33 | d39→s68 (tw:23, t30:68) | d39→s68 (t30:68) | 238→238 | 1→1 | 0→0 | 1→1 |
| 44 | d76→s105 (tw:12, t30:62) | d76→s105 (t30:76) | 195→229 | 1→1 | 0→0 | 1→1 |
| 55 | d43→s72 (tw:6, t30:56) | d43→s72 (t30:54) | 170→170 | 1→1 | 0→0 | 0→0 |
| 101 | d49→x (tw:5, t30:37) | d42→**s71** (tw:12, t30:57) | 161→170 | 1→1 | 0→0 | 0→0 |
| 606 | d53→x (tw:4, t30:15) | d53→**s82** (tw:28, t30:56) | 136→**204** | 1→1 | 0→0 | 0→**1** |
| 808 | d66→s95 (tw:12, t30:45) | d66→s95 (t30:59) | 195→195 | 1→1 | 0→0 | 0→0 |

- **PRIMARY: baseline conversion 5/8, armed conversion 7/8.**
- GO (armed ≥50%): 7/8 = 87.5% — PASS.
- GO (armed ≥ baseline+1): 7 ≥ 6 — PASS.
- **Verdict: GO.** The layer converts exactly the near-misses: s101's t30:37→57 (+5 tends over baseline) and s606's t30:15→56 (+24 tends). s22's link was dead-link-walking on both sides (trust cratered to 2 by age 30 on baseline; the armed trajectory's village died d96 before the d77-formed link reached 30 days) — no tend layer saves a link whose village can't feed it.
- Mechanism receipt (tend-weeks on the 5th): s101 5→12, s606 4→28, s11 9→21. The lower-gate band (13500–20000) fires exactly on the thin links the base's fat gate leaves behind.
- Standing deltas: s11 +136 (wave-5 unlocked), s606 +68 (wave-5 unlocked), s44 +34, s101 +9; s22/s33/s55/s808 unchanged.

Guardrails (per-seed, identical seeds):
- national: 8/8 both sides — no regression. ✓
- exiled: 0/8 both sides. ✓
- wave-5: baseline s33/s44; armed s11/s33/s44/s606 — no regressions, +2 (s11, s606 gained). ✓
- survival per-seed: s11 168→161, s22 119→96 (−23), s33 107→127, s44 135→157, s55 90→121, s101 80→86, s606 122→168, s808 104→104. Median REPORT-ONLY: 113→124d (+11, beneficial direction).
- Death-cause profile (forming subset): combat/monster-dominant both sides (base player:combat 32, villager:monster 29; armed player:combat 21, villager:monster 39) — the mortality wall binds, the diplomacy lever doesn't touch it.

## Village assessment

The uncapped LEAD road on current tip is a stronger engine than r22 measured: 8/16 seeds form a 5th link and the base seasons most of them. The villages that form 5ths are the long-lived, pantry-rich ones — they tend their bonds weekly and the 5th link is usually just another bond (s33's seasoned d68 with t30:68; the System noticed — wave-5 on baseline). The layer's real contribution is the rescue operation: it finds the two links the fat-gate rhythm abandons — s101's bond that was 3 trust short of seasoning, s606's Thornfield bond cratering at trust 15 with empty fields — and feeds them through the thin weeks (28 tend weeks on s606's 5th). The 5th link's world is harsher than the first four's (late-formed splinter villages, dry fields, Haven's succession haircuts), and the layer is the policy that notices.

The villages that never form a 5th (s66/s77/s303/s404 dead by d95; s303/s404 with Standing 0) are the mortality wall's — no diplomacy lever reaches them. And s22 shows the layer's limit honestly: the 5th formed at d84 with trust already cratered (t30:2) — a bond nobody fed for a month. The layer tends thin links, it doesn't resurrect dead ones.

## SENSE-TESTING (scripts/sense-fifthlink-r26-20261014.js, seed 606, narration on)

The converted link's story (Thornfield, formed d52 in the narration re-run) reads as village diplomacy:
- d60: "Met grief with grain (4,000 kcal, trust +8); the tribute leverage never landed." — the renegotiation answer is the engine's designed fiction, and the layer clicked it instead of letting the silence answer.
- d63: "Thornfield paid nothing — empty fields. Arrears +4,000." — the shortfall said aloud with the reason (empty fields, not defiance), then "Haven sent grain (1,600 kcal, trust +8); the bond is fed."
- d65: "Young link: grief delays the verdict — a renegotiation is staged." → answered again with grain.
- d77: "First court: shared granary feast (5,111 kcal)." — the bond holds; the link seasoned.

Every trust move has a named cause. The one wrinkle (carried from r22): tend/renegotiation notes report whole-unit takes (4,000/3,000 kcal) larger than the 1,500 price — honest per the whole-unit take doctrine, but a player reading "4,000" may wonder where the number came from. Noted, not chased. (Narration re-run formed the 5th at d52 vs d53 in the sweep — instrument RNG consumption in the sweep wrapper; mechanism story identical.)

## Blanks filled / documented

- **FILLED**: the tend-vs-decay race re-measured on current tip — the unlayered fourthlink now seasons 5/8 forming 5th links (r22 measured 0/2). The r22 kill's premise is partially stale; the race the layer must win is the near-miss race, and it won it (2/2 near-miss conversions: s101, s606).
- **DOCUMENTED** (sim-findings.md): (1) s22's dead-link-walking 5th — a link that craters to trust 2 in its first month is beyond tending; formation without feeding is decoration. (2) The diplomacy road now produces wave-5s on current tip: baseline s33/s44, armed s11/s606 — four distinct wave-5 unlocks via the seasoned-link path (Standing 204–272). The T5=200 diplomacy engine is real, not theoretical. (3) s303/s404 (Standing 0, dead d82/d35) — the mortality wall's floor; courtship levers never reach them.

## Metric review (§14)

GO met: armed 7/8 ≥ 50%, and 7 ≥ baseline+1 (baseline measured 5/8). The forming-seeds denominator worked exactly as r22 intended — the question "does the layer convert forming links?" got a clean answer instead of a formation-gated kill.

The pre-registration's "expected ~0%" baseline was wrong — the screening measured 5/8. The GO's second clause (armed ≥ baseline+1) was the binding one, and it held. If the baseline had converted 7/8, the arm would have needed a perfect 8/8 — the pre-registered bar would have been miscalibrated again, in the other direction. Lesson for the next run on this road: pre-register the baseline from a 4-seed screen BEFORE fixing the GO's additive clause, or express the GO as a conversion-rate delta with a noise floor (the s22-class dead-link seeds are unconvertible by construction — the true denominator is "forming links that survive to age 30 with trust > 5", not all forming links).

Median report-only held: armed 124d vs baseline 113d (+11, beneficial). The s22 −23d per-seed delta is within the fight-heavy noise floor (same endReason, same death-cause profile); no guardrail fired.

## Wall numbers (every run)

| | national | table | wins | wave-4 | wave-5 | maxStanding | medianSurv* |
|---|---|---|---|---|---|---|---|
| screen baseline (16) | 12/16 | 0/16 | 0/16 | 13/16 | 2/16 | 238 | 105.5d |
| conv baseline (8 forming) | 8/8 | 0/8 | 0/8 | 8/8 | 2/8 | 238 | 113d |
| conv armed (8 forming) | 8/8 | 0/8 | 0/8 | 8/8 | **4/8** | **272** | 124d |

\* median REPORT-ONLY per pre-registration (sharepol noise-floor finding).
