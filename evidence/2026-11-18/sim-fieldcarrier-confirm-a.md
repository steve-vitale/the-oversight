# sim-fieldcarrier-confirm-a — Rage carrier re-measured WITH the sense substrate: pilot NO-GO, THIN-POOL

**Run:** fleshout-20261118T2330Z, Loop A arm sim-fieldcarrier-confirm-a
**Finding #2552 follow-up verdict: NO-GO, THIN-POOL** (per frozen prereg — no confirm, no re-score)
**Branch:** `sim-fieldcarrier-confirm-a`, worktree `~/workspace/worktrees/sim-fieldcarrier-confirm-a`
**Prereg:** `evidence/2026-11-18/sim-fieldcarrier-confirm-a-prereg.md` (frozen 2026-11-18 ~17:35 CST, before any sims)

## Verdict in plain words

The carrier works — and this time it fired where it counts. On a launch-rich band with the sense fix running on both legs, the carrier fired 6 times inside the judged population and produced the first carrier kill: Liam's party killed an Influencer in 11 rounds. But the judged pool still missed its floor (7 meetings, floor 10), so the kill-share question is still unanswered — and the miss itself is the news. The pool didn't miss because the party was absent (the sense fix works: the party was present at 28 of 34 arm meetings). It missed because one village spent 90 days spotting wave-4 monsters and giving them room — 20 evades from a single village — and because the carrier changes the villages that use it: two of the three paired fights where the carrier fired ended with the fighter DEAD, where the same fight without the carrier ended with the fighter walking away. The multiplier's price is a turn: the fighter spends round one going red instead of striking, and a fighter who is already hurt dies before the doubled strikes land. One kill, two paired deaths, and a pool that the carrier itself thinned — that is the measurement.

## 1. What was built / measured (finding #2552 follow-up)

The fieldcarrier-a pilot (NO-GO THIN-POOL, pair n=2) proved the carrier fires in the field engine but measured it on a band where the launched party was absent 12/19 meetings. This arm re-measures on a launch-rich band WITH the held sense substrate:

- **Substrate (measurement only, HELD, never to land):** cherry-pick `bc0f001e8` of `480168a58` (sense fix from sim-launchparty-sense-a `d01eaf0a5`: party-wiring `LAUNCHPARTY` block + villager-brain partyTrios counter). Both legs run `LAUNCHPARTY=1`. The cherry-picked commit message still names the old flag (`FIGHTCAPDMG`) — the prereg is the authority on the flags actually run.
- **Carrier:** cherry-pick `568814f4b` of `e3a77c411` (`[needs-eyes]`, godpath.js fieldBegin + fieldAct Rage branch + fieldFights.js record) — auto-merged cleanly onto current master; the only diffs vs the original commit in the two `src/js` files are the landed foodgate-instr additions (finding #2557-A), which coexist (the carrier copy and the foodgate copy both run after each fieldAct call; flags are sticky).
- **Tooling:** cherry-pick `ba18f1867` of `bceb0e433` (driver + analyzer + panel builder), then adapted in `9dd183c4b`:
  - Driver: `LAUNCHPARTY=1` + `SENSE_PRESENT` now REQUIRED on both legs (a true substrate claim, the reverse of the fieldcarrier-a driver); `PARTYSIZE4` not set, deliberately; per-seed files `fieldcarrier-confirm-a-s<seed>-fieldcarrier-confirm-a-<mode>.json` under `perseed-fieldcarrier-confirm-a-{ctl,arm}/`.
  - **Instrument (fieldcarrier-a §5/§9):** the driver copies the landed foodgate record fields (`foodTier`, `hungerStart`, `holdsRage`, `foodgateTierBlocked` / `Round` / `Count`, `foodgatePayBlockedRage`, `foodgatePayBlockedFirst`) onto EVERY encounter row. Coverage verified on the pilot corpora: **293/293 rows carry non-null foodTier and numeric hungerStart, 0 missing keys, 0 undetermined non-fires.**
  - Analyzer: new `carrierNonfireAttribution` — every held-but-unfired row classified tier-gate / hunger-gate / neither / undetermined / evade (precedence hunger > tier when both bit — a refused pay proves fieldAct reached the Rage branch, so hunger is the proximate cause; the tier block is still recorded on the row).
  - Panel builder: re-pointed at the confirm corpora, seeds, and filenames.
- **Proof-test fix (master drift, not a carrier change):** the rebased tip first ran `test-fieldcarrier-a.js` at **37/38** — the determinism leg failed because the landed foodgate instrument records `hungerStart` on the fight record, and fight 1's honest 60-kcal Rage pay raises the holder's hunger 0→2, so the second fight on the same staged state is no longer the same starting state. A scratch probe (`/tmp/probe-fc-determinism.js`) showed the ONLY diff between the two fights was `hungerStart: 0 vs 2` (identical outcome, rounds, mDealt, log). Fix: re-stage before each repeat fight (identical inputs, as the leg intends). **38/38 after the fix.** Analyzer selftest **18/18** (was 12, +6 attribution checks); new instrument test `scripts/test-fieldcarrier-instr-a.js` **9/9** (one full pilot seed through the driver's oneRun: substrate flags, carrier flags, 0 instrument errors, foodgate keys on every row, attribution runs on the real corpus). Regressions green: abilityfirst 43/43, ability-gaps 16/16, godpath-villagers 58/58, aidleave ALL PASS, fightcap analyzer 20/20, dmg analyzer 10/10.
- **Panel-builder slip, caught and repaired:** the first panel build ran with a stale `OUT_PREFIX` default and overwrote the fieldcarrier-a panel gz files with confirm data. Restored byte-identical with `git checkout --` (verified clean) and fixed the builder default before re-running. No pilot data was lost; the old panel files are untouched in the final tree.

**Legs:** both `VETREENGAGE=1 + FLEEREPAIR2=1 + FIGHTALLY2=1 + LAUNCHPARTY=1`; ctl `FIELDCAPDMG` unset, arm `=1`. `PARTYSIZE4` NOT set. 150d death-aware, competent policy, fresh pilot band 104901–104908.

## 2. Frozen bars (prereg)

- **Primary:** pair-inclusive kill share — engaged wave-4+ expedition meetings, launched party present, `|planParty| ≥ 1`, kill = `vKill` only.
- **GO requires:** arm kill share ≥ 0.25 AND ≥ 2× ctl on identical seeds (ctl 0 kills ⇒ ratio passes iff arm kills > 0) AND pool floor arm pair n ≥ 10 AND cost bars pass.
- **Pool floor (derived, finding #2566):** arm pair n ≥ 10 — below the lower of the two measured WITH-substrate bands (fightcap-a fresh band: 22 pair-inclusive engaged / 8 seeds; dmg band: 13 / 8 seeds), on the narrower size-≥2 cut; this arm's ≥1 population is a superset.
- **Cost bars:** community loss arm share ≤ ctl + 0.125; starvation arm ≤ ctl + 2 (totals AND villager-only); median survival arm ≥ 0.8× ctl median; instrument errors 0.
- **Mechanism check (gates GO):** arm carrier fires > 0 AND ctl carrier fires == 0, inside the judged population.
- **Verdict ladder:** pool met + bars met + costs pass → GO; pool met + bars missed / cost fails → NO-GO; pool missed (arm pair n < 10) → **NO-GO, thin pool, inconclusive**.

## 3. Pilot numbers (8 seeds 104901–104908, 150d, competent; ctl exit 0, arm exit 0 after a resume — see §8)

Corpora: `evidence/2026-11-18/perseed-fieldcarrier-confirm-a-{ctl,arm}/`; logs `fieldcarrier-confirm-a-{ctl,arm}.log/.err`; analysis `evidence/2026-11-18/fieldcarrier-confirm-a-analysis.json`. Corpus flags verified: ctl `fieldcapdmgOn` false, arm true; `carrierPresent` true both; `sensePresent` true, `launchpartyOn` true both. Anchor `9dd183c4b`, godpathSha `e17b4caafbc4`, fieldSha `22f3b13360d2`.

| Bar | Ctl | Arm | Pass? |
| --- | --- | --- | --- |
| Pool floor (arm pair n ≥ 10) | 14 | **7** | **NO** |
| Kill share (pair-inclusive) | 0.000 (0/14) | **0.143 (1/7)** | NO (bar ≥ 0.25) |
| Kill-share ratio ≥ 2× (ctl 0 ⇒ arm kills > 0) | — | 1 kill | PASS |
| Trio+ pool | 2 | 0 | — |
| Carrier fires in judged population | 0 | **6** | PASS (mechanism) |
| Community loss | 2/8 | 4/8 | **NO** (bar ≤ 0.375) |
| Starvation (total / villager-only) | 1 / 1 | 2 / 2 | yes |
| Median survival | 150d | 143d | yes (0.95×) |
| Instrument errors | 0 | 0 | yes |

**Verdict: NO-GO, THIN-POOL.** The pool floor fails (7 < 10), so the kill-share question is inconclusive by the frozen ladder. The cost bar on community loss ALSO fails (4/8 vs 2/8) — recorded here, not re-scored into a different verdict: the ladder yields THIN-POOL on the pool miss alone. No confirm band spent (confirm band 104911–104926 stays fresh).

### Funnel (pair-inclusive)

| Step | Ctl | Arm |
| --- | --- | --- |
| Wave-4+ expedition encounters | 25 | 34 |
| No launch plan | 2 | 1 |
| Party absent at the meeting | 2 | 6 |
| Evades (rounds 0) | 7 | 20 |
| **Engaged (judged population)** | **14** | **7** |

The sense substrate works: the launched party is present at 28/34 arm meetings (vs 7/19 in the fieldcarrier-a pilot). The pool shortfall is NOT a presence failure. It is two things: **the 104905 evade cascade** (20 of the arm's 20 evades come from one village — §5) and **trajectory divergence** (104903 collapses to 1 gate on the arm vs 6 on ctl; 104908's village is lost at day 104 on the arm vs surviving on ctl). Note the asymmetry against the derived floor: the CONTROL leg delivered 14 (inside the derived 13–22 expectation) while the ARM leg delivered 7 — the carrier itself thins its own pool by changing trajectories. A future confirm needs a pool design robust to arm-side divergence (e.g., a larger band, or judging the pool on the control leg's delivery) — see §9.

### Per-seed table

| Seed | Ctl (days / end / standing / wave / deaths) | Arm (days / end / standing / wave / deaths) |
| --- | --- | --- |
| 104901 | 150d survived 310 w5 d71 | 150d survived 510 w5 d77 |
| 104902 | 150d survived 199 w4 d76 | **136d village-lost 199 w4 d89** |
| 104903 | 144d village-lost 199 w4 d103 | **102d village-lost 175 w4 d68** |
| 104904 | 150d survived 199 w4 d78 | identical |
| 104905 | 150d survived 360 w5 d79 | 150d survived 485 w5 d102 |
| 104906 | 66d village-lost 150 w4 d83 | identical |
| 104907 | 150d survived 350 w5 d61 | 150d survived 325 w5 d61 |
| 104908 | 150d survived 199 w4 d109 | **104d village-lost 199 w4 d82** |

6/8 seeds diverged, 2 identical (104904, 104906). Total deaths: ctl 661, arm 640 (fewer deaths overall on the arm, but concentrated into 2 extra village losses). The carrier changed trajectories on 6/8 seeds, in both directions on standing (104901: 310→510; 104905: 360→485) and toward earlier loss on 104902/104903/104908.

### Damage race (pair-inclusive, mDealt/rounds)

| Outcome | Ctl n / dmg-round mean | Arm n / dmg-round mean |
| --- | --- | --- |
| vKill | — | 1 / **82.4** (906 in 11 rounds) |
| vFlee | 11 / 42.6 (range 6.2–98.8) | 3 / 37.4 (18.7, 45.9, 47.6) |
| vDie | 3 / 12.5 | 3 / 23.9 (0.0, 34.3, 37.3) |

Damage share mean: ctl 0.174, arm 0.216. Rounds mean: ctl 4.7, arm 6.6. The arm's single kill dealt 82.4/round — below the fightcap winning shape (~111/round) but the best arm rate on the band. Note the ctl's best flee (Carlos d63, 98.8/round) dealt MORE per round than the arm's kill — because the carrier's setup turn cost Carlos a strike on the arm leg (§5). The gate never held back a loser (arm losses: gate null 5, seek 1; the kill's gate null) — same as every prior band.

### Wall numbers

National 0/8 both; table not instrumented (null, never faked); wins 0/8 both; wave-4 unlock 8/8 both; wave-5 3/8 both; median survival 150d ctl, 143d arm. The standing-199 stall persists (104902, 104903, 104904, 104908 at 199 on one or both legs).

## 4. The carrier-fire table — every fire and every non-fire, with tier/hunger attribution

**Arm leg, all origins: 30 held rows, 11 fired, 19 unfired. Ctl leg: 0 held, 0 fired.**

### Fires (11)

| Meeting | Origin | Outcome | Rounds | Damage | Tier / hunger |
| --- | --- | --- | --- | --- | --- |
| 104901 d63 Carlos vs Influencer | expedition | vDie | 3 | 103/985 | abundant / 8 |
| 104902 d42 Owen vs Audit | world-tick | vFlee | 2 | 60/1100 | abundant / 24 |
| 104902 d45 Diana vs Congregation | expedition | vFlee | 6 | 204/1008 | abundant / 16 |
| 104903 d62 Theo vs Eater | expedition | vDie | 4 | 149/996 | abundant / 8 |
| 104905 d49 Liam vs Influencer | expedition | vFlee | 11 | 505/988 | abundant / 16 |
| 104905 d75 Liam vs Algorithm | expedition | vFlee | 9 | 428/1055 | abundant / 25 |
| 104905 d141 Liam vs Influencer | expedition | **vKill** | 11 | **906 / null** | abundant / 24 |
| 104907 d117 Ruby vs Eulogy | world-tick | vFlee | 4 | 130/675 | **tight** / 58 |
| 104907 d133 Ruby vs Cancellation (w5) | world-tick | vFlee | 4 | 112/1600 | **tight** / 39 |
| 104908 d45 Amina vs Algorithm | world-tick | vDie | 4 | 115/1000 | abundant / 33.5 |
| 104908 d45 Dmitri vs Suburb | expedition | vDie | 1 | **0**/1457 | abundant / 64 |

6 of the 11 are in the judged population (Carlos d63, Theo d62, Liam d49, Liam d75, Liam d141, Dmitri d45); the other 5 are world-tick (Owen, Ruby ×2, Amina) or party-absent (Diana d45 — the launched party was not present at that meeting despite the substrate). **Every held carrier in the judged population fired (6/6). No tier gate and no hunger gate blocked a single judged fire.** The two tight-tier fires (Ruby) are the exception that proves the gate's shape: the tier gate bit in 3 rounds (d117) and 2 rounds (d133) and the carrier still fired in a later round, once her HP fell to the gate's lift (HP ≤ 40% — d117: hit to exactly 40 HP in R3, Rage in R4) or the pack grew.

### Non-fires (19) — attribution complete, 0 undetermined

| Attribution | n | Rows |
| --- | --- | --- |
| evade (fight never started, rounds 0) | 18 | 104901 d41 Carlos vs Congregation (abundant/10); 104902 d75 Emma vs Strike (secure/47); 104905 d62 Liam vs Eater (abundant/24), d64 gen_ky8jx4k vs Strike (abundant/8), d66 gen_b4cfw9w vs Congregation (abundant/67), d70 Liam vs Eater (abundant/40), d74 gen_b4cfw9w vs Congregation (abundant/98.5), d74 gen_ky8jx4k vs Suburb (abundant/39), d85 gen_b4cfw9w vs Eater (abundant/61), d93 gen_hg7kdxo vs Algorithm (abundant/50.5), d96 Liam vs Algorithm ×2 (abundant/16, 24), d98 gen_b4cfw9w vs Eulogy (secure/83.5), d98 Liam vs Algorithm (secure/32), d104 gen_b4cfw9w vs Rerun w5 (abundant/60.5), d108 gen_b4cfw9w vs Audit (abundant/100), d140 gen_b4cfw9w vs Algorithm (abundant/100), d144 Liam vs Strike (abundant/34) |
| neither (engaged, no gate bit) | 1 | 104907 d117 Rafael vs Eulogy, world-tick, mFlee, 3 rounds, 0 dealt (tight/50) — see §5: the fighter spent all three rounds working the trick, and the monster talked down |
| tier-gate | 0 | — |
| hunger-gate | 0 | — |
| undetermined | 0 | — |

The fieldcarrier-a pilot's two undetermined non-fires (§5) are ANSWERED, not repeated: on this band the gates bit nowhere a carrier was held and engaged. The tier gate and the hunger gate are not what stops the carrier — the fight never starting (evade) and the trick displacing the verb (Rafael) are.

## 5. Sense-testing — reading the carrier firing

**The setup turn kills (paired meetings, same seed/day/vid/mid on both legs — the carrier is the only difference).** The Rage branch sets `nextMult = 2; nextN = 3` and returns `consumed = true` WITHOUT striking: the fighter spends round one going red, and the doubled strikes land in later rounds. Against a monster hitting 20–30 a round, a hurt fighter cannot afford that turn:

- **104901 d63 Carlos vs Influencer.** Ctl: strikes R1 (40), R2 (41), R3 (39), R4 (36) + Desmond 39 → 494 dealt in 5 rounds, flees at 18 HP. Arm: R1 eyes go red (no strike), R2 one doubled strike 80, R3 Ratio hits for 26 — dead at 0 HP. **103 dealt, died.** The carrier turned a 5-round 494-damage flee into a 3-round death. His base strike was ~40; the one doubled strike (80) could not cover the lost R1 strike plus the round he never got.
- **104903 d62 Theo vs Eater.** Same shape. Ctl: 31/28/31/31 + allies → 193 in 4 rounds, flees. Arm: R1 Rage (no strike), R2 58, R3 58, R4 Smack-Rush hits for 31 — dead before the third doubled strike. **149 dealt, died.**
- **104908 d45 Dmitri vs Suburb (arm only).** The extreme form: Dmitri walks in at 14 HP, R1 eyes go red, Property Tax hits for 14 — dead in round 1, **0 dealt**. The Rage gate is the MONSTER's HP above 40%, not the holder's — the carrier fires on a dying holder and the setup turn is pure loss. (The gate is as designed — the fieldcarrier-a prereg states "monster above 40% HP" — but the consequence is now measured: no holder-HP floor.)
- **104905 d49 Liam vs Influencer (paired, the good case).** Ctl: vFlee r10, 427 dealt, strikes of 11–15 (a weak base). Arm: R1 Rage, R2 23, R3 25, R5 28 (x2.5), field medicine mid-fight → 505 in 11 rounds, still fled. **+78 damage (+18%), still fled at 51% of the monster's HP.** The multiplier on a weak base again (finding #2554): doubling ~11 buys ~78 over the fight against ~988 HP.

**The kill — 104905 d141 Liam vs Influencer (vKill, 11 rounds, 906 dealt, 82.4/round).** R1 eyes go red; R2 55, R3 55, R4 63 (x2.5); Roberto charges in on the shout, then Owen; "Liam and Roberto have bled together — it steadies them." Abilities/member 5.67, min armor 32, mean armor 35 — the best-geared, most-able party on the band. It is the first carrier kill, on the same seed whose village also produced all 20 evades: the village that won't fight 20 times is the village that kills once. The kill's mHpStart is null (the known recorder gap — damage share uncomputed; mDealt/rounds stands).

**Rafael d117 — the 'neither' non-fire, explained.** "R1: Rafael contradicts the narration — it says Rafael runs — Rafael advances… Rafael holds the line — working the trick, not the damage race." All three rounds go to the trick; the monster stands down (mFlee, talk-down, 0 dealt). The trick displaces `fieldAct` entirely, so the carrier never gets a turn — the same displacement the proof test had to order around. Attribution 'neither' is correct, and now it has a mechanism and a name.

**Ruby d117/d133 — the tight gate delays, never denies.** R1–R3 plain strikes of 12–14 while the tier gate blocks the Rage verb (pack < 2 and HP > 40%); R3 a hit drops her to exactly 40 HP, the gate lifts, R4 eyes go red. The gate is a delay that a surviving fighter outlasts, not a denial.

**The 104905 evade cascade (20 evades, one village).** Every evade reads the same line: "Owen saw The Suburb in time and gave it room." Trick unknown on all 20; gate null; party size 3, all armed, all armored. The holders are Owen, Liam, gen_b4cfw9w (hunger 67→100 over the run), gen_ky8jx4k, gen_hg7kdxo — a launched party that stays out in the field for ~90 days, meets a wave-4 monster every few days, and gives it room every time. Only Liam ever engages on this seed (3 fights, 1 kill). The village launched 54 times (departs) against the ctl leg's 20. Whether the split is an awareness roll ("saw in time" vs Liam's "walks straight into… no avoiding it") or a threat judgment, the behavior is legible and repeated — and it is what thinned the pool. Filed as a finding, not chased here (§9).

No new player-facing text was added by this arm (measurement only). The transcripts read like people throughout — shouts, charges, field medicine, the bow opening, the trick-working narration.

## 6. §15 balanced panel

`node scripts/build-fieldcarrier-panels-a.js` then `node scripts/balance-panel.js compare` → `evidence/2026-11-18/fieldcarrier-confirm-a-panel.md`, decision **review_required**, 8 paired cases, screen only. Village deaths per run −2.625 (82.625 → 80, no signal); village deaths per 100 days +4.368 (regression_watch, interval crosses zero); **community loss +0.25 (0.25 → 0.50, regression_watch, interval 0 to 0.625)** — the panel's watch corroborates the frozen cost-bar failure, from the other direction: fewer deaths overall, concentrated into two extra village losses. National 0 → 0, table win rate 0 → 0. The panel is the instrument; the frozen bars are the judge (NO-GO THIN-POOL).

## 7. Metric review

The bars were frozen before any sims and are not re-scored. The pool floor (arm pair n ≥ 10) fails at 7, so the verdict is NO-GO THIN-POOL by the ladder — the kill-share question is inconclusive, not answered. Three things about the floor deserve recording for the next prereg (not a re-score of this one):

1. **The derivation was honest and still missed.** The floor (10) sat below the lower of the two measured WITH-substrate pools (13 and 22). The control leg delivered 14 — inside expectation. The arm leg delivered 7. The derivation held for the control and failed for the arm, because the carrier changes trajectories (6/8 seeds diverged). A floor derived from control-leg behavior does not bind an arm that moves its own villages. The next prereg must design the pool for arm-side divergence — a larger band, or a floor judged on the control leg's delivery with the arm's pool reported beside it.
2. **The pool floor is not the only failed bar.** Community loss fails too (4/8 vs 2/8, bar ≤ 0.375) and kill share misses (0.143 < 0.25). Had the pool been met, this would have been a NO-GO on the bars, not a GO — the thin pool is not hiding a passing arm.
3. **The mechanism check passed cleanly (6 fires judged, 0 ctl) and the instrument worked completely (0 undetermined).** The measurement itself is sound; the population is what is thin. The attribution precedence (hunger > tier when both bit) was never exercised — no row had both flags — so it stands as an untested interpretation, recorded here.

## 8. Telemetry deviation check + run notes

- Telemetry: `node scripts/telemetry-check.js --baseline …/telemetry-baselines/scale-wall.json --current 'evidence/2026-11-18/perseed-fieldcarrier-confirm-a-arm/*.json' --metrics national,table,wins,exiled` — REFUSED recorder-corpus input (all rows carry top-level anchorCommit; same documented refusal as the fieldcarrier-a and dmg arms). The baseline file does not exist in this worktree. Recorder corpora are compared with sweep-compare tables, never against a run baseline here. Baseline NOT rolled.
- **Run interruption:** the pilot command was SIGTERM'd at ~26 min with the arm leg at 6/8 seeds (ctl 8/8 complete, exit 0). Resumed the arm leg for the 2 missing seeds only (104907, 104908; exit 0, 8 files). The driver refuses overwrites, so the 6 completed seeds were untouched by the resume; the resumed seeds ran under the identical env and code (anchor `9dd183c4b` on all 16 files). No seed was run twice.
- **Panel-builder slip:** see §1 (stale OUT_PREFIX overwrote the fieldcarrier-a panel gz files with confirm data; restored byte-identical via git checkout; builder fixed; final panel files are the confirm ones). The fieldcarrier-a panel files are untouched in the final tree — verified with git status.

## 9. What this means / next question (for the coordinator to file — this arm does not edit sim-findings.md)

1. **The carrier works and the kill-share question is still open.** 6 judged fires, 0 ctl, first carrier kill (906 damage, 11 rounds). But pool 7 < 10, kill share 0.143 < 0.25, community loss fails. NO-GO THIN-POOL; no confirm; the confirm band 104911–104926 stays fresh.
2. **NEW — the setup turn is a cost, not just the multiplier's price (finding #2552 follow-up).** The Rage branch consumes the fighter's turn to set up. On the three paired fired meetings: two deaths where the ctl leg fled (Carlos d63: 494→103 dealt, fled→died; Theo d62: 193→149, fled→died) and one improved flee (+78). Plus Dmitri: fired at 14 HP, died round 1, 0 dealt. The gate is the monster's HP, never the holder's — the carrier fires on a dying holder. The next capability arm should test whether the multiplier needs a holder who can survive the setup (HP/armor floor, or the strike landing in the same round as the Rage — i.e., Rage as a free action, not a consumed turn) rather than a bigger multiplier. This is a design question for the next arm, not a claim that the carrier is net-negative (n=3 paired, pool thin).
3. **NEW — the evade cascade thins the pool more than absence does.** 104905: 54 departs, 20 awareness-evades ("saw in time and gave it room"), trick unknown on all 20, fully armed party of 3. The launched party stays out and declines the fight for 90 days. If evades are an awareness roll, the pool is luck-gated; if a threat judgment, the party judges wave-4 un-fightable even armed. Either way the next pool design must count evades as a first-class funnel loss (this run does — 20 of the arm's 34 meetings never started).
4. **The food gates do not block the carrier.** 0 tier-gate and 0 hunger-gate non-fires in the judged population; the only engaged non-fire is trick displacement (Rafael). The fieldcarrier-a §5 question is answered: on a launch-rich band with the instrument running, neither gate stops a held carrier. (The tight gate delays Ruby's fire by 3 rounds; the hunger gate never bites — the hungriest held holder, gen_b4cfw9w at hunger 100, only ever evades.)
5. **The pool derivation needs arm-side robustness (finding #2566, extended).** Derive the floor from measured pools, as this prereg did — but from the ARM leg's delivery, or with a band large enough that arm-side divergence cannot halve the pool. The ctl leg's 14 shows the derivation was right for the control; the arm's 7 shows the carrier moves its own denominator.
6. **Community loss moved the wrong way (4/8 vs 2/8).** Total deaths fell (640 vs 661) but two extra villages were lost (104902, 104908). Whether the paired deaths (§5) are the mechanism or the losses are trajectory noise, the next arm must watch community loss as a primary cost, not a guardrail — the panel's regression_watch agrees.

## 10. Files and commits

- Prereg: `evidence/2026-11-18/sim-fieldcarrier-confirm-a-prereg.md` (commit `f2d27f490`)
- Substrate (HELD, never to land): cherry-pick `bc0f001e8` of `480168a58` (sense fix, sim-launchparty-sense-a `d01eaf0a5`)
- Carrier + proof test: cherry-pick `568814f4b` of `e3a77c411` `[needs-eyes]` (proof test fixed for the foodgate record: re-stage before repeat fights)
- Tooling: cherry-pick `ba18f1867` of `bceb0e433`
- Driver/analyzer/panel-builder adaptation + instrument + proof-test fix: commit `9dd183c4b` (analyzer selftest 18/18, proof 38/38, instrument test 9/9)
- This evidence + analysis + panel: committed with this evidence (see commit below)
- Corpora + logs: `evidence/2026-11-18/perseed-fieldcarrier-confirm-a-{ctl,arm}/`, `evidence/2026-11-18/fieldcarrier-confirm-a-{ctl,arm}.log/.err`
- Scratch probes (not committed, `/tmp`): `/tmp/probe-fc-determinism.js`, `/tmp/fc-confirm-detail.js`, `/tmp/fc-confirm-detail2.js`
- Index-clobber repairs (safe-commit.sh aftermath, AGENTS.md lesson): after the prereg commit and after `9dd183c4b`, the main index showed committed files staged-as-deleted / MM; repaired both times with `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, verified status empty + diff HEAD empty + hash-object == HEAD blob per file. Both commits verified correct.

**HELD:** launchparty-sense substrate `480168a58` (cherry-picked as measurement substrate only, never to land from this arm); carrier `e3a77c411` (same). Finding #2552 verdict for the coordinator: **NO-GO, THIN-POOL** — carrier proven to fire in the judged population (6/6 held fired) with the first carrier kill; kill-share question still open pending a pool the carrier's own divergence cannot halve; the setup-turn cost and the evade cascade are the next arm's questions.
