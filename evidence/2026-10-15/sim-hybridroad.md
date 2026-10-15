# ARM "hybridroad" — the hybrid road: courtship + deliberate wave-3 hunt drive (sim-findings #212) — KILLED AT PILOT

Worktree: `~/workspace/worktrees/sim-hybridroad`. Run: oversight-flesh-out-loop, ARM 3 of the scale-onramp run (lever-8 lens), 2026-10-15.

## Context
Warroad pilot (evidence/2026-10-14/sim-warroad.md): the diplomacy road (competent + proposelayer) unlocks wave 4 on 6/8 seeds at d57–79 and 4/6 unlocking villages die 20–50d early — The Eater one-rounding villagers; the war road (competent + warroad, dedicated hunt drive) banks max 3 wave-3 ledger points and unlocks 0/8 — the war lane to Standing 100 is unreachable by hunting in a 150-day life. The named next (#212): **hybrid** — diplomacy fills the Standing bar, a deliberate wave-3 hunt drive adds war points AND real combat capability (counters, gear, XP, villager participation) so the village survives wave-4 contact. The s66 hint: survived wave-4 contact to 150 and reached global rank with 2 organic wave-3 kills (war=50) under the diplomacy bar (dip=102).

**Prior art found mid-run (2026-10-15, AFTER the build, BEFORE the pilot verdict):** an r35 hybrid arm already ran 2026-10-14 and was KILLED AT PILOT — "HYBRID ROAD FALSIFIED" (evidence/2026-10-14/sim-hybridroad.md, commit ee47425b; sim-findings #211 UPDATE 2026-10-14). r35's design: pace 6d, HP≥70%, stand-down at 2 wave-3 ledger points, + post-unlock readiness hold; kill mechanism = DRIVE COMPETITION (dip=0 on all hunt seeds — the hunts crowded out diplomacy; war-lane unlock d136 died in 7d). This arm's design differs (pace 3d, HP≥60%, stand-down at wave-4 unlock, no post-unlock hold — the readiness window), so the pilot ran as a different parameterization of the same question. The build should have checked sim-findings for prior arms BEFORE building — filed in metric review.

## The lever (policy-side, no game-code changes)
- **CONTROL (diplomacy road):** competent + proposelayer (PROPOSELAYER=1) — rebuilt 2026-10-15 on this tree from the r33 spec (evidence/2026-10-14/sim-proposelayer-r33.md + kept proof scripts/test-proposelayer-20261014.js): courtship pass mirroring leadcourt's bundle — propose LEAD-road subordinates (one/day, 7-day per-target cooldown, window day≥25 / no pending / pantry>12000 / <3 subs), answer counters ('sweeten' if pantry>25000 else 'accept'), accords ('gift'), national beats (LEAD pick 'feast'), tend weekly (pantry>20000), answer defense calls. Same code tree, identical seeds, env-var only.
- **ARMED (hybrid road):** competent + proposelayer + hybrid hunt leg (PROPOSELAYER=1, HYBRIDROAD=1) — the courtship layer's full verb bundle runs FIRST and untouched; the hunt leg adds deliberate thicket/ruin expeditions via real travelTo + real checkEncounter (courtkill's engine-honest machinery, reused: engageVisibleWave3, wave-3 selection, reveal-preference), committed attrition fights holding to 12% HP via the generic ctx._huntCommit hook in competent.fight. Villager kills score the ledger exactly like the player's (VILLAGER XP LAW) — the policy hunts alongside its villagers.
- The hunt's stand-down is the design call: it lives ONLY in the **readiness window** — wave-3 unlocked AND wave-4 not yet unlocked (`Game.unlockedWave() < 4`, engine-canonical: T4 = Standing ≥ 100) AND fewer than 4 wave-3 ledger points banked. Once the System answers (Standing ≥ 100), the hunt stands down — the scholar's attention belongs to the village. It does not grind forever.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — header written BEFORE sims
- **Axis**: scale-onramp (the wall), lever-8 lens.
- **Seeds**: 11/22/33/44/55/66/77/88. **Horizon**: 150d death-aware (dead villages stop; +10d tail max).
- **CONTROL**: competent + proposelayer (PROPOSELAYER=1), rebuilt on this tree; own control in the same sweep (CONTROL BASELINE DRIFT #247 — never inherit baselines; the warroad control's 4/8 alive30post is context only, not the bar).
- **ARMED**: competent + proposelayer + hybrid hunt leg (PROPOSELAYER=1, HYBRIDROAD=1).
- **PRIMARY**: villages alive at d+30 post-wave-4-unlock (wave4Day != null AND days ≥ wave4Day+30) armed ≥ control AND wave-4 unlocks armed ≥ control−1. (The warroad control's binding formulation.)
- **GUARDRAILS**: median survival ≥ control−10d; national ≥ control−2/8; no new death mode (cause-family level: strip player:/villager: prefix, named monsters → the `monster` family; a new family counts only at n≥3 per #216).
- **Gates before spend**: proof scripts/test-hybridroad-20261015.js REAL RED→GREEN; det-gate-hybridroad 8/8 IDENTICAL both sides; SMOKE=1 instrument-honesty gate both sides; rebuilt proposelayer re-passes kept proof scripts/test-proposelayer-20261014.js (RED pristine / GREEN 11/11 armed).
- **GO**: primary met at pilot → confirm 12–16 seeds before calling GO. A miss is NO-GO, never re-scored mid-run.
- **Design calls** (Steve 2026-10-07: figure it out yourself): (1) hunt lives only in the readiness window (wave-3-unlocked, wave-4-not-yet-unlocked, <4 wave-3 pts) — post-unlock the scholar defends; (2) every-3rd-day cadence, healthy+fed gates (hp≥60%, kcal≥200), 12% HP commit — inherited from courtkill's proof-tested machinery, not re-tuned: this arm tests the COMPOSITION, not the machinery; (3) courtship never preempted — the hunt leg runs after the full courtship pass; (4) hybridroad with PROPOSELAYER=0 is a defined but untested combination — not run in this arm, noted not gated.

## Design-call divergence note (claim vs header)
The coordinator's claim file pre-registered "median days alive after wave-4 unlock" as the primary; the claim explicitly deferred the exact bar to the worker's evidence header. This header pre-registered alive30post-count ≥ control AND unlocks ≥ control−1 (the warroad control's binding formulation — a count of survivors at a fixed post-unlock mark, not a median that drifts with censoring). Both are reported; the binding verdict uses this header. Median-post-unlock-days is reported as a secondary (39 → 36).

## Gates (all green before spend)
- **Proof test-hybridroad-20261015.js**: REAL RED on pristine (exit 1 — R1 armed-identity fails; R2 gate-off export IS the proposelayer export reference-equal; R3 zero hunt legs on the wave-3-unlocked fixture) → GREEN 6/6 armed (G1 identity; G2 hunt leg fires on the wave-3-unlocked fixture — hunts=1, 2 travelTo legs; G3 the window STANDS DOWN at wave-4 unlock — 0 hunts; G4 courtship intact — proposeLink fires on the window fixture; G5 composition — one daily fires both propose and hunt; G6 the env gate is read live).
- **Proof proposelayer rebuild** (kept scripts/test-proposelayer-20261014.js): REAL RED (exit 1) → GREEN 11/11 — the rebuild is behaviorally identical to the r33/warroad spec.
- **Det-gate det-gate-hybridroad-20261015.js**: 16/16 IDENTICAL (8/8 control + 8/8 armed), 150d — before/after comparisons trustworthy.
- **SMOKE=1 sweep-hybridroad-20261015.js**: both sides green (harness drives policy.daily 4.8/d; control fires the real proposeLink; armed fires the hunt leg on the wave-3 fixture AND stands down on the wave-4 fixture).

## Pilot (8 seeds × 150d, identical seeds) — RESULTS

| seed | control (diplomacy) d/end | w4day | a30 | armed (hybrid) d/end | w4day | a30 | hunts/hf |
|---|---|---|---|---|---|---|---|
| 11 | 33/village-lost | – | – | 33/village-lost | – | – | 0/0 |
| 22 | 138/village-lost | 99 | Y | 123/village-lost | 99 | **n** | 6/10 |
| 33 | 150/survived | 57 | Y | 150/survived | 57 | Y | 0/0 |
| 44 | 150/village-lost | 58 | Y | 97/village-lost | 58 | Y | 6/51 |
| 55 | 115/village-lost | – | – | 137/village-lost | – | – | 0/101 |
| 66 | 67/village-lost | 65 | n | 67/village-lost | 65 | n | 0/0 |
| 77 | 93/village-lost | 57 | Y | 93/village-lost | 57 | Y | 0/0 |
| 88 | 90/village-lost | 57 | Y | 90/village-lost | 57 | Y | 0/0 |

Suite: wave-4 unlocks 6/8 → **6/8** (all diplomacy-driven, both sides); alive-at-d+30-post-unlock 5/8 → **4/8**; median survival 115 → **97**; median post-unlock days 39 → 36; national 0 → 0; table/wins 0/8 both; wave-5 0/8; regional+≤120d 7 → 7; links formed 21 → 21; seasoned 20 → 20; starvation deaths 7 → 7; hungryDays 3 → 3; exiled 1 → 1 (s55 both sides); hybrid hunts 12 deliberate legs / 22 legs / 162 committed fight-turns; maxStanding 152 → 127.

**VERDICT: KILLED AT PILOT.** PRIMARY MISSED on the survival prong (alive30post 4 < 5 — s22 missed the +30 mark by 6 days; the unlock prong held 6 ≥ 6−1). Guardrails: median survival MISS (97 < 115−10=105); national HOLD (0 ≥ 0−2); no-new-death-mode HOLD at the n≥3 family floor (armed-only family `thirst` ×2 — below the floor; `alien` ×1 both sides). Per §14 the miss is NO-GO, never re-scored. Both policy files deleted per kill protocol; proof (RED→GREEN) + det-gates + sweep + SMOKE + evidence + per-seed JSONs kept.

## Why it missed (honest diagnosis — a different mechanism than r35)
This parameterization did NOT reproduce r35's drive competition: diplomacy held everywhere (links 21→21, seasoned 20→20, unlocks 6/6, all diplomacy-driven — the wave-4-unlock stand-down preserved the diplomacy road). What killed it is simpler: **the deliberate hunts cost more than they buy**. On the two seeds where the hunt leg fired, the village died earlier — s44: 150→97 (−53d; 6 hunts, 51 committed fight-turns), s22: 138→123 (−15d; 6 hunts, 10 fight-turns; the 15 days cost it the alive30post mark by 6 days). The hunts banked no meaningful war points (s44 war=25 both sides — organic; s22 war 50→0) and no unlocks; they converted scholar-days and HP into attrition.

The deeper finding is structural: **the readiness window is nearly empty.** The hunt leg fired only 12 deliberate legs across 8 seeds — on 5/8 seeds (s11/s33/s66/s77/s88) it never fired once. Wave-3 unlocks organically only days before the diplomacy bar answers (wave-4 at d57–65 on 6/8 seeds): by the time wave-3 is unlocked, Standing is about to hit 100, and the window closes. The hybrid's hunt drive has almost nowhere to live — the diplomacy road is too fast for a pre-unlock readiness drive to matter, and the drive can't slow the diplomacy road without crowding it out (r35). s22 (late unlock d99) is the only seed with a real window, and the hunts there cost the village its +30 survival.

s55 is the instructive edge: 0 deliberate hunts (scholar exiled — the leg's exile guard held) but 101 COMMITTED organic fight-turns via the fight side, war=50, dip=0 (exile broke diplomacy on both sides), lived 137 vs 115. The fight-side commit on organic encounters didn't hurt — but it also didn't unlock anything (no wave-4 without the diplomacy bar). Readiness without the bar is decorative; the bar without readiness is lethal; the deliberate drive that tries to add the first crowds out or costs into the second.

## SENSE-TESTING (wave-4 contact on the hybrid road — judgment, not counts)
Armed s44, d82–84: the wave-4 arrival reads as an invasion the village was not ready for despite 6 deliberate hunts and 51 committed fight-turns. A 3-raider night raid (The Reunion, The Big Beast, Big Loud) hits Haven; The Reunion follows the scholar inside, "eyes on your bedroll," and the fight is joined round by round ("COMBAT! THE REUNION! ... ROUND 1 — FIGHT!"). The village that hunted deliberately for weeks meets the same monsters and dies 53 days earlier than its non-hunting twin. The readiness the hunt was supposed to buy is nowhere in the transcript — the fights were attrition, not preparation. **PASS on coherence, FAIL on the thesis.**
Armed s22, d108–124: the diplomacy road reads alive even under the hunt drive — relief beats fire honestly ("The sick need tending — triage tents, broth, boiled water..."), aid flows both ways ("You give Thornfield 3,750 kcal from Haven's bins — real food, honestly counted. Sofia weeps, openly."), and the scholar fights wave-4 contact with looted gear (hunting spear, 60-damage strikes). The village that almost made it — 6 days short of the +30 mark. **PASS.**
Control s33 (the bright spot, both sides): a NATIONAL village that survived wave-4 contact to 150 — pantries at ~40 days fresh, villagers making sensible foraging calls ("The pantry can't take more; the wild will keep"), relief beats, The Reunion fought at the treeline. The diplomacy road CAN hold wave-4 contact — this is the second such village observed (warroad's s66 was the first). What distinguishes the survivors is not hunting: s33 armed had 0 hunts.

## Village assessment (plain words)
The control villages court and climb: proposals ~day 25, links season, the diplomacy bar fills to 102, wave 4 unlocks ~day 60 as the System's response — and this time two of them held it (s33 survived to 150 at national rank; s22 survived 39 days post-unlock). The hybrid villages are the control villages with a hunt drive bolted on — and on the two seeds where the drive fired, it made things worse: s44's scholar spent its pre-unlock weeks fighting wave-3 monsters in thickets instead of building the village's depth, and died at 97 instead of 150; s22's six hunts cost it the 15 days that would have carried it past the +30 mark. On the other six seeds the drive never fired — the window between wave-3 unlocking and the System answering is days wide, sometimes zero. The missing capability is not "a little war": deliberate war costs scholar-days the diplomacy road needs, and organic war (s55's 101 committed fight-turns, s22-control's war=50) doesn't buy readiness either. The s66 hint was survivorship twice over.

## Reachable / fun / winnable (the hybrid road, competent + proposelayer + hunt drive)
- **Reachable:** YES for the mechanism (the hunt leg fires, commits fights, stands down at wave-4 unlock — all proven), NO for the thesis — the readiness window is nearly empty and the hunts don't convert to survival.
- **Fun:** the hunts play as real fights, and the diplomacy road underneath still produces the best-read scale content in the sims (s33's national survival, s22's aid beats). But the hybrid adds nothing to either.
- **Winnable:** 0/8 national held (s33 reached national and survived — a milestone, not a win), 0/8 table, 0/8 wins. The wall stands.

## Metric review (§14 — for the NEXT run, not this one)
1. **Prior-art check before building.** This arm re-ran a question r35 had already falsified (evidence/2026-10-14/sim-hybridroad.md, #211 UPDATE). The coordinator's claim cited #212 as open without noting #211's r35 update. The parameterization differed and the mechanism differed (no drive competition this time — the unlock stand-down worked), so the run still produced a new finding (the nearly-empty readiness window), but the build should have started from r35's evidence, not the warroad evidence alone. Next hybrid-adjacent arm: read ALL prior sim-hybridroad evidence first.
2. **The primary's survival prong is seed-fragile at n=8.** s22's 6-day miss on the +30 mark flipped the verdict; a 16-seed confirm might have told a different story. But the median-survival guardrail missed independently (97 < 105) through the same causal chain (hunts cost days), so the NO-GO does not rest on one seed.
3. **The no-new-death-mode n≥3 floor worked as designed:** `thirst` ×2 (s22 armed — the hunting scholar dying thirsty in the wild) stayed below the floor. Without the floor this would have been a false guardrail miss on 2 events.
4. **alive30post worked cleanly** (no censoring — no unlock after day 120 except s22's d99, honestly counted on both sides).
5. **Drive-coexistence (r35's metric-review #1) was measured:** diplomacy standing on hunt seeds held (dip=102 on s22/s44 armed) — the unlock stand-down preserved coexistence. The failure is downstream: coexistence without benefit.

## Blanks (filled / documented)
1. **HYBRID ROAD FALSIFIED A SECOND TIME, DIFFERENT MECHANISM (filled):** r35 falsified via drive competition (dip=0 on hunt seeds). This parameterization (readiness-window stand-down at wave-4 unlock) preserved the diplomacy road (6/6 unlocks, dip intact) and still missed — the hunts cost days without buying readiness (s44 −53d, s22 −15d), and the readiness window is nearly empty (12 deliberate hunts in 8 seeds; 0 on 5/8 seeds — wave-3 unlocks days before the diplomacy bar answers). Two parameterizations, two mechanisms, same verdict: deliberate wave-3 hunting does not make the diplomacy road survivable. Appended to hidden_files/sim-findings.md.
2. **THE READINESS WINDOW IS NEARLY EMPTY (filled):** structural, not tuning — wave-3's organic unlock (day≥25 + 5 wave-2 points) lands days before the 3-link diplomacy bar fills (~d57–65). Any pre-unlock readiness drive has almost nowhere to live. A readiness lever belongs POST-unlock (but r35's post-unlock hold moved nothing) or the diplomacy bar must be slower (Steve's call).
3. **CONTROL MILESTONE: s33 national + survived 150 (documented):** the second diplomacy village observed holding wave-4 contact to the horizon (warroad's s66 was the first), and the first at national rank. The diplomacy road is not certain death — survival variance is real and unexplained. Worth a diagnostic arm on what distinguishes surviving unlock villages (s33, s22-control, s66-warroad) from the ones that bleed.
4. **s55's 101 organic committed fight-turns (documented):** the fight-side commit works on organic encounters (exile blocked the deliberate leg); the village lived longer (137 vs 115) but unlocked nothing. Readiness without the bar is decorative — consistent with the warroad finding.

## Convergence
scale-onramp: CONVERGING (unchanged). The hybrid does not move the axis — two parameterizations falsified (r35 drive-competition, this run hunt-cost + empty window). The axis still moves only when a road reaches wave 4 AND holds it. Open directions per prior evidence: post-unlock siege doctrine, plenty-road-to-wave-4 (loop B), or a slower diplomacy bar (Steve's call).

## Wall numbers (this run, 8 seeds × 150d, identical seeds)
national 0/8 both (s33 reached national and survived — not held as a win) · table 0/8 · wins 0/8 · wave-4 unlocks 6/8 control / 6/8 armed (all diplomacy-driven) · wave-5 0/8 · median survival 115 control / 97 armed · alive30post 5/8 control / 4/8 armed · maxStanding 152 control / 127 armed.

## Files
- `scripts/policies/hybridroad.js` — DELETED per kill protocol (the killed arm; no trace).
- `scripts/policies/proposelayer.js` — DELETED per kill protocol (control rebuild; warroad/r35 precedent: both layers deleted, proofs kept).
- `scripts/test-hybridroad-20261015.js` — proof, REAL RED (exit 1) → GREEN 6/6 (kept; INFO-SKIP guard).
- `scripts/test-proposelayer-20261014.js` — kept proof from r33/warroad (not this arm's; re-verified the rebuild GREEN 11/11 pre-kill; INFO-SKIP guard).
- `scripts/det-gate-hybridroad-20261015.js` — det-gate 16/16 IDENTICAL both sides (kept; INFO-SKIP guard).
- `scripts/sweep-hybridroad-20261015.js` — pilot sweep + SMOKE=1 gates + COMPARE=1 verdict (kept; INFO-SKIP guard added).
- `evidence/2026-10-15/sim-hybridroad-control.json`, `sim-hybridroad-armed.json` — per-seed evidence rows (kept; rows carry linkpipe, fc/starveDays, sr/scale, standing incl. wave4Day/driver/atT4/traj, deathCauses, side counters, lines transcript material).
- `evidence/2026-10-15/sim-hybridroad.md` — this file.
- Telemetry note for the coordinator: per-seed JSONs above are the telemetry-check inputs (national, table, wins, exiled per-row fields present). No telemetry-check run by this worker — coordinator owns the baseline roll per loop-body step 10 (r33/warroad convention).
