# sim-fightcap-recheck-a — evidence (DIAG RECHECK of the wave-4 fight)

**Arm:** sim-fightcap-recheck-a · **Loop A run:** fleshout-20261124T1715Z (adoption of the timed-out 1515Z round)
**Axis:** scale-onramp · **Type:** DIAG RECHECK of findings #2538/#2544
**Prereg:** `evidence/2026-11-24/sim-fightcap-recheck-a-prereg.md` (frozen 2026-11-24 ~16:55 UTC, before any judged sim)
**Branch:** `sim-fightcap-recheck-a`, base master `8616c6b2f`. Head at close: `0a0040dd2` (+ evidence commit to follow).
**Canon:** `docs/CANON.md` + `docs/MONSTER-WAVES.md` read. Wave-4 bands (damage 35–95, HP 850–1500, pierce 0.2–0.5) — "a 4–6 round fight for a godhood build (~220 dmg/round)" — are the damage yardstick. No canon doc covers the sim recorder or the launch party; the launch mechanics are cited from code, not canon.

## Verdict (judged ONLY against the frozen prereg)

**DIAG-NO-GO — thin pool.** The arm leg's pair-inclusive n is **9, one short of the frozen floor of 10**. Combined pair n is 12 (arm 9 + ctl 3). Classification is complete (12/12 meetings classified, 0 unclassified), the decomposition is complete (kill share + damage ladder + gate crosstab computed), and instrument errors are 0 on all 16 per-seed files — so the only failed bar is the pool floor.

Note on labels: the analyzer's own verdict reads `DIAG-GO, kind THIN-POOL`. That is the analyzer's internal scheme (its `judge()` returns DIAG-GO whenever the pool floor fails, meaning "diagnostic only, thin pool"). It does **not** satisfy the prereg's frozen ladder, which requires pair-inclusive n ≥ 10 for DIAG-GO. The question stays open on the strict reading, by one meeting. See Metric review.

**The picture, on the thin pool:** kill share **holds** (arm 0/9 = 0.000, tolerance [0, 0.16]); vFlee damage/round **holds** (arm mean-of-rates 45.3, pooled 49.3, tolerance [36, 86]); loss share **moved outside tolerance** (arm 9/9 = 1.000, tolerance [0.72, 0.92]). The move is a tolerance call, not a significance call: under the Nov 18 loss rate (0.824), P(9/9 losses) ≈ 0.18; under the Nov 18 kill rate (0.059), P(0/9 kills) ≈ 0.58. At n=9 the loss-share tolerance is a single meeting wide (8/9 = 0.889 is inside, 9/9 = 1.000 is outside).

**Confirm gate:** the prereg orders 12–16 seeds ONLY if the picture moved materially. The loss share is outside its frozen tolerance, which is the trigger condition — but the trigger rests on one meeting at n=9, and the cost bar failed (below). **Recommendation to the coordinator: run a confirm round (12–16 seeds, fresh band, both legs).** It would settle three things at once: the pool floor, the loss-share move, and the community-loss excess. This worker did not run it unilaterally — the coordinator decides.

## Primary metric (binding, §14)

Kill share on pair-inclusive engaged launched meetings, arm leg: **0/9 = 0.000** (Nov 18 arm: 2/34 = 0.059). Win share (vKill + mFlee) / n: **0/9**. Trio+ population (|planParty| ≥ 2): arm **5 meetings, 0 wins** (0 kills, 0 mFlee, 1 vDie, 4 vFlee); ctl 1 meeting, 0 wins.

| Leg | Pair n | Wins | Kills | Losses (vDie / vFlee) | Kill share | Loss share |
|---|---|---|---|---|---|---|
| arm (SENSEEXPED=1) | 9 | 0 | 0 | 9 (2 / 7) | 0.000 | 1.000 |
| ctl (SENSEEXPED unset) | 3 | 0 | 0 | 3 (0 / 3) | 0.000 | 1.000 |
| Nov 18 arm (HELD sense fix) | 34 | 6 | 2 | 28 | 0.059 | 0.824 |

## Damage/round ladder (mDealt/rounds, same construction as fightcap-a)

| Leg / outcome | n | dmg/round (mean of per-meeting rates) | pooled | Nov 18 |
|---|---|---|---|---|
| arm vFlee | 7 | 45.3 | 49.3 | ~61 |
| arm vDie | 2 | 15.6 | 18.7 | ~40 |
| arm vKill | 0 | — | — | ~111 |
| ctl vFlee | 3 | 52.8 | 55.6 | — |

Arm vFlee 45.3 sits inside the frozen [36, 86] band. Against the canon godhood bar (~220 dmg/round for a 4–6 round fight), launched parties deal about a fifth of what the fight asks: the longest arm fight (13 rounds, Algorithm, 742 of 1059 HP) still ended in flight at 70% damage dealt. Rounds: arm pair mean 4.9 (vFlee 5.0, vDie 4.5); ctl pair mean 5.3.

## Gate × outcome crosstab (arm pair, n=9)

| Gate | vDie | vFlee | vKill/mFlee |
|---|---|---|---|
| null | 1 | 7 | 0 |
| seek | 1 | 0 | 0 |
| avoid | 0 | 0 | 0 |

Gate `avoid` is **0 among all 9 arm losses** — unchanged from Nov 18 (0 among 28 arm losses). The gate never says "seek" usefully and never says "avoid": 8 of 9 losses carry a null gate. The one `seek` row is a vDie (seed 110105, Reunion, day 92).

## Funnel — the sharpest leg difference is presence, not winning

Pair-inclusive funnel (encounters → engaged):

| Leg | Encounters | No launch plan | Party absent | Evade-excluded | Engaged pair |
|---|---|---|---|---|---|
| arm | 27 | 2 | **0** | 16 | 9 |
| ctl | 42 | 0 | **33** | 6 | 3 |

SENSEEXPED does what it says on presence: in the arm leg the launched party was present at **every** launched encounter (0 absent vs 33 in ctl). But presence did not become engagement or winning: of the 25 present arm encounters, the party evaded 16 and lost all 9 it engaged. The ctl leg's parties mostly never showed up at all (33/42 absent). The recheck's decomposition, in one line: **the sense fix got the party to the fight; the fight still kills or routs them.**

Trio+ funnel for reference: arm 27 encounters → 13 below the trio size floor → 0 absent → 7 evade → 5 engaged; ctl 42 → 27 below floor → 14 absent → 0 evade → 1 engaged.

Monsters met (arm pair): Congregation 3, Strike 2, Algorithm 2, Influencer 1, Reunion 1 — all losses. No Eulogy in the arm pair (the contradict-counterplay case never arose).

## Zero-damage classification (the dmgshape lesson — full)

Every engaged pair-inclusive meeting classified with `scripts/analyze-zerodmg-recheck-a.js`:

| Leg | Total | strike-fight | contradict-counterplay | died-before-strike | other-zero-damage | unclassified |
|---|---|---|---|---|---|---|
| arm | 9 | 9 | 0 | 0 | 0 | 0 |
| ctl | 3 | 3 | 0 | 0 | 0 | 0 |

**Zero zero-damage meetings in either leg.** The dmgshape failure mode did not bite here: every engaged meeting dealt damage (arm mDealt 20–742), so the decomposition can price all of them. The classifier itself is proven by the proof test (§D, 29/29), which fully classifies the Nov 18 arm pair (20 strike, 2 other-zero-damage, 0 unclassified).

## Cost bars (binding guardrails) — ONE FAIL, investigated same-run

| Bar | Result |
|---|---|
| Community loss (arm ≤ ctl + 0.125, i.e. ≤ 3 villages) | **FAIL — arm 6/8 vs ctl 2/8** |
| Starvation (arm ≤ ctl + 2, totals AND villager-only) | PASS — totals arm 3 vs ctl 1; villager arm 2 vs ctl 1 |
| Median survival (arm ≥ 0.8 × ctl median) | PASS — arm 136d vs ctl 150d |

**Community-loss investigation.** The 6-vs-2 gap has no supporting mechanism in any measured channel:

- Death-cause shares are near-identical: expedition 39% arm vs 41% ctl; villager combat 37% vs 34%; combat 11% vs 12%; monster 3% both. Starvation deaths 3 vs 1.
- Deaths per village-day are slightly LOWER in arm (0.73 vs 0.79). Launch volume is similar (v4departs 255 arm vs 232 ctl; dawnbidDeparts 298 vs 283). Pantry-zero days are identical in total (32 arm vs 31 ctl) with similar mean pantry.
- `villageLost` fires two ways in code (`src/js/game.js:33589` famine scattering after 3+ hungry days; `:34668` roster extinction). Arm villages that scattered still held pop 8–9 at the end (seeds 110107, 110108) — famine scattering, not extinction — yet their pantry pressure matches ctl.
- Fisher exact two-sided p ≈ 0.13 on the 6-vs-2 split: not significant at n=8.
- The sharpest pattern, unexplained: **the four best-scaling ctl villages all village-lost in the arm leg** — seeds 110103 (ctl survived, standing 610), 110105 (420), 110108 (580), 110106 (survived). The two seeds lost in both legs (110104, 110107) match; the arm leg's extra four losses are exactly the ctl leg's scalers.

Conclusion: the excess is consistent with seed noise on an 8-seed band, but the "scalers die" pattern is too pointed to dismiss. The balanced panel independently flags it (below). **A confirm round on a fresh band is the test; no mechanism was found to fix.**

## Balanced panel (§15)

`scripts/build-fightcap-panels-a.js` (ported — see Tooling note) + `node scripts/balance-panel.js compare`. Compare `.md` attached: `evidence/2026-11-24/fightcap-recheck-a-panel.md` (panels `fightcap-recheck-a-panel-before/after.json.gz`, `fightcap-recheck-a-panel.json`).

- **Decision: `review_required`** (compare exit 2), driven by one signal: **Community loss, regression_signal** — 0.25 → 0.75, paired delta +0.5, 95% exploratory interval 0.125 to 0.875 (excludes 0).
- Everything else: no_material_signal. Village deaths per run actually fell (107.25 → 91.25, delta −16). National 0 → 0, wins 0 → 0, table metrics not observed by this instrument (null, never faked).

## Wall numbers (every run)

| Leg | National | Table | Wins | Wave 4 | Wave 5 | Median survival | Community lost |
|---|---|---|---|---|---|---|---|
| ctl (8 seeds) | 0/8 | null (not instrumented) | 0/8 | 8/8 | 4/8 | 150d | 2/8 |
| arm (8 seeds) | 0/8 | null | 0/8 | 8/8 | 1/8 | 136d | 6/8 |
| Combined | 0/16 | null | 0/16 | 16/16 | 5/16 | — | 8/16 |

Per-seed: ctl survivors 110101/02/03/05/06/08 (standing 199/295/610/420/199/580; wave 5 in 110102/03/05/08), lost 110104 (d131, standing 199) and 110107 (d62, standing 150). Arm survivors 110101/02 only (standing 199/199); lost 110103 (d140), 110104 (d83), 110105 (d134, wave 5, standing 425), 110106 (d138), 110107 (d108), 110108 (d99). Scale rank regional in all 16. The scale wall stands: no national, no wins, on either leg.

## Sense-testing (transcripts read in full)

No vKill and no mFlee exist in either leg, so per the prereg fallback I read **2 arm lost + 2 ctl lost** fight transcripts in full and say so plainly:

1. **Arm, seed 110105 day 81, Elif vs The Algorithm (vFlee, 13 rounds, 742/1059 dealt).** The best fight in the band. Coherent blow-by-blow: ranged opener (2/2 arrows), "Elif is losing — shouts for help! Marta charges in!", then Taha. Gear absorbs steadily. The party deals 70% of the monster's HP over 13 rounds and still flees. The log is capped at 20 lines, so rounds 5–13 — including the flee decision itself — are invisible; I cannot judge why a party at 70% damage dealt walks away.
2. **Arm, seed 110105 day 92, Theo vs The Reunion (vDie, 7 rounds, 148/1342 dealt).** The counterplay is real and characterful: "Theo does something they have never done — stands on one foot and recites a poem mid-fight. The Reunion falters; it has nothing to wear. (Novelty.)" Then "Theo holds the line — working the trick, not the damage race." — but the trick lines repeat verbatim round after round, and Theo dies anyway: the novelty stalls the monster while the damage race is still lost 148 to 1342. `dmgByVid` is empty `{}` despite strikes landing in the log — the per-fighter attribution gap.
3. **Ctl, seed 110105 day 55, Booker vs The Eulogy (vFlee, 6 rounds, 517/944 dealt).** Rage procs ("Booker's eyes go red. Next 3 strikes hit twice as hard"), a 63-then-70 strike pair under the multiplier, field medicine (+20 HP mid-fight), shouts bringing Theo then Ethan in. People act like people. The monster still has 427 HP when the log truncates at R4.
4. **Ctl, seed 110107 day 49, James vs The Congregation (vFlee, 6 rounds, 250/1072 dealt).** Same shape: ranged misses narrated honestly ("loosed wide — the arrow buries itself in the dirt"), wound-binding, two allies joining on shouts, steady 13–21 damage a round against a 1072-HP monster. The fight is lost on arithmetic, not on nonsense.

Sense verdict: the fights read as real fights between people and monsters — shouts, wound care, rage, misses, counterplay — and they are lost on damage math (parties deal ~45–55 dmg/round vs ~1050–1350 HP). Nothing robotic except the verbatim repeated trick lines in the Reunion fight. The damage gap, not the narration, is the blank.

**Recorder gaps (fightcap-a §11) — still bite:** (a) the 20-line encounter-log cap truncates 7 of the 12 pair meetings, including every fight longer than ~4 rounds and every flee decision; (b) per-fighter attribution is empty on the Reunion vDie despite parsed strikes; (c) mHpStart-null-on-vKill is untestable — zero vKills in this band (mHpStart is present on all 12 pair meetings).

## What this recheck does NOT judge

No game-code lever is landed. The 4th seat (ALLYSLOT3 off both legs) is out of scope. The rounds=0 "vKill" rows are excluded by the engaged filter, as in fightcap-a. No `check.js` gate was run (no src/ change; driver + analyzer + proof test only). The rage/carrier path was not touched (Loop B arm sim-ragecarry-b owns it); Rage appears only as an observed line in one transcript. ReadyDemand numbers were not moved; no default was flipped.

## Tooling note

`scripts/build-fightcap-panels-a.js` needed a port the prereg assumed away ("no port"): it hardcoded the fightcap-a filename pattern (`launchparty-sense-a-s<seed>-fightcap-a-<mode>.json`) and policy name, so it could not read the recheck corpora. Minimal port: `--prefix / --run / --policy / --origin` args, all defaulting to the fightcap-a values. Proof of behavior-preservation: with defaults, the Nov 18 panels reproduce **byte-identical** (decompressed JSON equality on both legs, same contract digest). Then built with `--prefix fightcap-recheck-a --run fightcap-recheck-a --policy fightcap-recheck-a --origin sim-fightcap-recheck-a`.

## Run notes (adoption)

- Adopted 2026-11-24 ~17:24Z from the timed-out 1515Z round: prereg `d5b667fa9`, instrument `18bee0121` (proof 23/23) already committed; uncommitted test §D (+27 lines), zero-dmg analyzer, ctl log/err, ctl seeds 110101–110105.
- Step 1 verified: proof test **29/29 pass** (incl. §D Nov 18 arm-pair classification 20 strike / 2 other-zero-damage / 0 unclassified). Committed `7c364880a`.
- The first ctl-seeds attempt (110106–110108) was killed by an exec-service restart at ~17:34Z before writing anything; reran detached via `setsid nohup` and it completed (CTL-EXIT:0). Committed `81f96a37`.
- Arm leg (SENSEEXPED=1, 8 seeds) ran detached, ARM-EXIT:0, 0 instrument errors. Committed `9993e2d8`.
- Analysis + zero-dmg + panels committed `0a0040dd`.
- **safe-commit clobber struck on all four commits** (index showed committed files staged-as-deleted, worktree files byte-identical to HEAD). Each commit was verified correct via `git show --stat` and the index repaired with `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`; tree verified clean after each repair. This is the known clobber class (AGENTS.md, third sighting pattern).
- Write-flap probe (`git update-ref refs/heads/probe HEAD`) passed before every write that mattered; no flap window hit this adoption.
- No live driver process was running at adoption; all drivers in this adoption ran detached and exited 0.

## Metric review (binding, §14)

1. **The pool floor vs the verdict ladder.** The prereg's DIAG-GO bar (pair-inclusive n ≥ 10) and the analyzer's `judge()` disagree in naming: the analyzer returns DIAG-GO/THIN-POOL precisely when the pool is thin, while the prereg requires n ≥ 10 for DIAG-GO. A reader seeing "DIAG-GO" in the analysis JSON will think the recheck passed its bar; it did not, by one meeting. Next run: either rename the analyzer's thin-pool verdict (e.g. DIAG-THIN) or define the prereg floor on the combined pair n (12 here) instead of the arm leg alone — and say which in the prereg.
2. **Loss-share tolerance is finer than the pilot's resolution.** At n=9, the [0.72, 0.92] band is one meeting wide: 8/9 is inside, 9/9 is outside. A tolerance that flips on a single meeting at pilot scale should be widened (e.g. ±0.15) or judged on the pooled pair n for the next run.
3. **The community-loss bar did its job** — it caught the run's one real signal — but the bar's own investigation found no mechanism, and the panel's exploratory interval (0.125–0.875) is wide. The bar is a tripwire, not a diagnosis; the confirm round is the diagnosis.
4. **The 20-line log cap is now the binding sense-test limit**, not the damage ladder: the longest, most informative fight in the band is truncated before its ending. A future arm that raises the cap (or records the flee-decision lines) would be worth more than another damage decomposition.
5. **No metric was re-scored mid-run.** Kill share, loss share, vFlee dmg/round, and the cost bars are judged exactly as frozen.

## Commits (branch sim-fightcap-recheck-a)

- `d5b667fa9` prereg (frozen, pre-existing)
- `18bee0121` instrument: ported driver + proof test 23/23 (pre-existing)
- `7c364880a` proof: zero-dmg classifier §D test (29/29) + analyzer + ctl seeds 110101–110105 corpus
- `81f96a37` ctl leg complete: seeds 110106–110108, 8/8, 0 instrument errors
- `9993e2d8` arm leg complete: SENSEEXPED=1 seeds 110101–110108, 8/8, 0 instrument errors
- `0a0040dd` analysis + zero-dmg classification + balanced panel + builder port (Nov 18 panels reproduce identical)
- (this evidence file — commit to follow)

## Files

- Prereg: `evidence/2026-11-24/sim-fightcap-recheck-a-prereg.md`
- Analysis: `evidence/2026-11-24/fightcap-recheck-a-analysis.json`
- Zero-dmg classification: `evidence/2026-11-24/fightcap-recheck-a-zerodmg.json`
- Panel: `evidence/2026-11-24/fightcap-recheck-a-panel.md` (+ `.json`, `-before/-after.json.gz`)
- Corpora: `evidence/2026-11-24/perseed-fightcap-recheck-a-ctl/` (8 files), `evidence/2026-11-24/perseed-fightcap-recheck-a-arm/` (8 files)
- Driver logs: `evidence/2026-11-24/fightcap-recheck-a-ctl.log/.err`, `fightcap-recheck-a-arm.log/.err`
