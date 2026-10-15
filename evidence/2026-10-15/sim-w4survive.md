# ARM "w4survive" — wave-4 contact-outcome attribution instrument (scale-onramp, diagnostic)

Worktree: `~/workspace/worktrees/sim-w4survive`. Run: oversight-flesh-out-loop, ARM 2 of run fleshout-a-20261015T0510Z (scale-onramp, standing directive).

## Context
The hybridroad arm (evidence/2026-10-15/sim-hybridroad.md) documented the CONTROL MILESTONE: s33 reached NATIONAL and survived wave-4 contact to 150 — the second diplomacy village observed holding wave-4 contact (warroad's s66 was the first), the first at national rank. The diplomacy road is not certain death — survival variance is real and unexplained. The named next: a diagnostic instrument — what distinguishes surviving unlock villages from the ones that bleed.

## The instrument (instrument-only, zero game-code changes)
- **Substrate:** courtship/diplomacy road — `leadcourt` (scripts/policies/leadcourt.js), the competent + LEAD-road courtship policy. This IS the hybridroad control's spec ("courtship pass mirroring leadcourt's bundle": propose LEAD-road subordinates one/day, 7-day per-target cooldown, window day≥25 / no pending / pantry>12000 / <3 subs; answer counters 'sweeten' if pantry>25000 else 'accept'; accords 'gift'; national beats LEAD pick 'feast'; tend weekly pantry>20000; answer defense calls). leadcourt.js implements exactly this; used directly, no rebuild.
- **Design:** harness-side read-only wraps (the wildtile w5census-lib pattern — read evidence/2026-10-15/sim-wildtile.md):
  - `Game.fieldFight` wrap: pre-fight snapshot (monster id/wave via Game.data.monsters, scholar tile, haven tile, raid/wild/patrol channel via the wildtile taggers). On the FIRST wave-4+ fight at/after wave-4 unlock (live `Game.unlockedWave() >= 4` gate), captures the full first-contact snapshot BEFORE the fight: roster combat stats (hp from state.village.health; weaponBonus/armorP via globalThis.Scattering.equipment + Game.getPerson — the engine's own reads, never autoEquip), pantry fresh-days (`Game.pantryDaysEstimate()`), scholar/haven tiles, links active/seasoned (`Game.hierarchyState()` + `Game._linkSeasoned`), standing (`Game.villageStanding()`), scale rank, known counters (`state.monsterCounters`).
  - `Game.registerDeath` wrap: death records (vid/cause/day/kind) for outcome attribution.
  - Push-to-array only; the harness RNG stream is untouched.
- **Population:** wave-4 unlocks on the leadcourt road (first day `Game.unlockedWave() >= 4`; engine-canonical: Standing ≥ 100). For each unlocker, the FIRST CONTACT = the earliest day ≥ unlockDay with a fieldFight involving a wave-4+ monster. Contacts only — unlockers with no wave-4+ contact by run end are reported separately (died-before-contact / survived-no-contact), never absorbed into the attribution denominator.
- **Contact-outcome row fields** (all required for attribution): unlockDay, contactDay, daysSinceUnlock, rosterAtContact (+ rosterAtUnlock), gear {coverage (share wb>0), meanWb}, armor {meanP, coverage (share P>0)}, counterCoverageW4 (contacting wave-4+ ids known / contacting wave-4+ ids — waves 3–5 are deliberately counter-less per MONSTER-WAVES.md, so this is expected 0, recorded honestly), pantryFreshDays, scholarTileAtContact (+ scholarAwayFromHaven), firstContactComposition (distinct {monsterId, wave} of the contact day's wave-4+ fights + fight count + channels), villagerCombatStats {meanHp, minHp, meanWb, meanArmorP}, links {active, seasoned}, standingAtContact, scaleRankAtContact, outcome {alive30post: true/false/'censored', endDay, endReason, deathCause (+day) for bleeders}.
- **alive30post:** unlockDay != null AND days ≥ unlockDay+30 (village held the mark — died after or survived). Bleeder: village-lost (or pop-zero) before the mark → death cause + day. Censored: horizon ended ('survived') before unlockDay+30 → outcome unknown, counted as NOT outcome-attributed (honest).
- **Distinguishing factors (pre-registered separation rule):** for each numeric row field, survivors (alive30post=true) vs bleeders (alive30post=false; censored excluded). A field is a NAMED factor iff both groups n ≥ 2 AND the value ranges don't overlap (max of one group < min of the other). Boolean fields: named iff all survivors share one value and all bleeders share the other (n ≥ 2 both). Otherwise the field is unconcentrated. Zero named factors → verdict "unconcentrated".

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — header written BEFORE sims
- **Axis:** scale-onramp (the wall). Standing directive applies.
- **Seeds:** 11/22/33/44/55/66/77/88. **Horizon:** 180d death-aware (dead villages stop; +10d tail max). WIN-PATH HORIZON 180 (Steve 2026-10-13).
- **Substrate:** leadcourt (the diplomacy road), identical seeds, env-var-only difference between sides.
- **CONTROL:** leadcourt with NO instrument wraps (read-only daily bookkeeping only: unlockDay, scaleRank, national, table, won — reads don't perturb RNG). Own control in the same sweep (CONTROL BASELINE DRIFT #247 — never inherit a baseline, even on identical seeds; committed sweep JSONs are perishable per #257).
- **INSTRUMENTED:** leadcourt + the w4survive wraps. The control/instrumented per-seed comparison doubles as the trajectory-neutrality proof (days, endReason, unlockDay, sampler death counts must be identical).
- **DIAGNOSTIC GO (binding, §14):** (1) ≥80% of wave-4 contacts outcome-attributed (all row fields present, outcome resolved — censored counts as unattributed), AND (2) a named set of distinguishing factors between survivors and bleeders per the separation rule above. Both prongs must hold. A miss on either is NO-GO — never re-scored, never softened mid-run. GO → land the instrument as its own commit (scripts + evidence only). MISS → evidence-only, blank stays open with the measured coverage.
- **Gates before spend:** proof scripts/test-w4survive-20261015.js REAL RED→GREEN (the instrument CAN fail: unattributable fixtures read 0, GO fails); SMOKE=1 instrument-honesty gate — seed-11 180d double-run, armed-wrap vs no-wrap byte-identical trajectories (days|endReason|unlockDay|deaths|standing); det-gate-w4survive-20261015.js 2 seeds × 2 subprocess reps bit-identical fingerprints (harness deterministic clock + stable person keys post-r27, both sides).
- **Design calls** (Steve 2026-10-07: figure it out yourself): (1) first contact = earliest post-unlock day with a wave-4+ fight (raid nights with multiple fights collapse to one contact day — the village meets wave 4 as an event, not a fight); (2) pre-fight snapshot for readiness fields (what the village walked in with); (3) counter coverage recorded as 0-expected (canon: waves 3–5 deliberately counter-less) — the field exists to falsify the counters thesis, not to assume it; (4) censored outcomes count against prong 1 — the outcome is the question.

## Gates (all green before spend)
- **Proof scripts/test-w4survive-20261015.js:** REAL RED (15 assertions — the instrument CAN fail: no-contact unlocks excluded from the denominator, broken-wrap snapshots unattributed, censored outcomes unattributed, GO fails at 0.5 and on zero contacts, empty population → "unconcentrated") → GREEN 51/51 (first-contact detection, row building, alive30post true/false/censored, attribution rollup, distinguishing-factors separation rule incl. boolean fields, wall aggregation).
- **SMOKE=1:** seed-11 180d double-run, armed-wrap vs no-wrap — byte-identical trajectories (days 33=33, endReason village-lost, unlockDay null, sampler deaths 15=15, nationalDays 0, table/won, maxUnlocked 2; full signature identical). The wraps are trajectory-neutral. GREEN.
- **Det-gate scripts/det-gate-w4survive-20261015.js:** seeds 33+44 × 2 subprocess reps — BIT-IDENTICAL both (fingerprint covers days|endReason|unlock|contact|composition|row fields|death causes). Harness deterministic clock + stable person keys hold on both sides. GREEN.

## Sweep (8 seeds × 180d death-aware, leadcourt, own control + instrumented in same sweep)

Trajectory neutrality: ALL 8 seeds identical control-vs-instrumented (days, endReason, unlockDay, sampler deaths, nationalDays, maxUnlocked). The instrument does not perturb the sim.

| seed | d/end | unlock | contact | composition | dsu | a30 | attr |
|---|---|---|---|---|---|---|---|
| 11 | 33/village-lost | – | none | – | – | – | n/a |
| 22 | 138/village-lost | d99 | d100 | algorithm (w4), wild | 1 | Y | Y |
| 33 | 180/survived | d57 | d64 | suburb (w4), wild | 7 | Y | Y |
| 44 | 150/village-lost | d58 | d62 | suburb (w4), wild | 4 | Y | Y |
| 55 | 115/village-lost | – (exiled) | none | – | – | – | n/a |
| 66 | 67/village-lost | d65 | none — died 2d post-unlock | – | – | n (combat x2, d67) | n/a |
| 77 | 93/village-lost | d57 | d66 | eulogy (w4), wild | 9 | Y | Y |
| 88 | 90/village-lost | d57 | d65 | suburb (w4), raid | 8 | Y | Y |

Contact rows (all 5 attributed):

| seed | roster | gear | meanWb | armorP | pantry (d) | scholarAway | links a/s | stand | rank | end |
|---|---|---|---|---|---|---|---|---|---|---|
| 22 | 10 | 0.60 | 10.70 | 16.8 | 57 | Y | 3/3 | 102 | regional | d138 lost |
| 33 | 10 | 0.60 | 5.30 | 4.8 | 55 | Y | 3/3 | 102 | regional | d180 surv |
| 44 | 9 | 0.667 | 14.22 | 5.56 | 18 | n | 3/3 | 127 | regional | d150 lost |
| 77 | 10 | 0.60 | 10.30 | 13.9 | 21 | Y | 3/3 | 102 | regional | d93 lost |
| 88 | 9 | 0.444 | 3.78 | 11.67 | 8 | n | 3/3 | 102 | regional | d90 lost |

Counter coverage (wave-4): 0/5 contacts (canon: waves 3–5 deliberately counter-less — the field falsifies the counters thesis as designed). preUnlockW4Fights: 0 on all 5 (engine spawn gating honest).

**Attribution: 5/5 = 1.000 ≥ 0.80 — GO prong 1 MET.** Zero unpaired contacts; every wave-4 contact on this substrate comes through a fieldFight the instrument sees.

No-contact unlockers (reported separately, never in the denominator): s11 (no unlock, died d33), s55 (no unlock — exiled, diplomacy broken, died d115), s66 (unlock d65, died d67 of combat ×2 BEFORE any wave-4+ fight — the died-before-contact case).

## Distinguishing factors
**Verdict: unconcentrated — GO prong 2 MISS.** All 5 attributed contacts are survivors (alive30post=true); there are ZERO bleeders in the contact population. Under the pre-registered separation rule (n ≥ 2 per side + non-overlapping ranges), no field can be named — there is no survivor/bleeder variance to explain.

The diagnostic's premise did not reproduce: the "survival variance" the hybridroad milestone named is NOT a contact-outcome phenomenon on the diplomacy road / current tree / these 8 seeds. Wave-4 contact is survived 5/5 — the bleed happens BEFORE contact (s66: unlock d65, dead d67, never met a wave-4 monster) or WITHOUT unlock (s11, s55), or as post-mark attrition (s77 d93, s88 d90 — both held the +30 mark, then died 33–36d post-unlock to the post-contact grind).

Per §14 the miss is NO-GO, never re-scored. The blank stays open — but reframed (see Blanks).

## SENSE-TESTING (wave-4 contact transcripts — judgment, not counts)
No true bleeder exists in the contact population, so the contrast case is s88 — the survivor with the shortest post-contact survival (died d90, 25d post-contact; held the mark, then bled).

**s33 (SURVIVOR, national, 180d):** the instrument's row (wild contact, suburb, scholar away at contact, pantry 55d) matches the narrative beat-for-beat. d63 "Something moves out there — The Suburb"; d64 it mauls Catalina (-79, 2 rounds); d65 it kills Rafael in 1 round ("The village mourns") and a 4-raider night raid (Suburb, Big Big, Flashbulb Moth, Understudy) hits Haven; d66 the scholar fights The Suburb personally — a real 9-round duel, Hardlight knife landing 59–61 strikes, taking 11–22/round in Property Tax/HOA Fines. The village absorbs named deaths (Rafael, Pallavi d66) and holds. The arrival reads as an invasion survived by a deep village (pantry 55d, roster 10, scholar with real personal damage output) — not a cutscene, not a stat check the village failed. **PASS on coherence; the row and the narrative agree.**

**s88 (SHORTEST-POST-CONTACT, died d90):** the row (raid channel, suburb, scholar HOME, pantry 8d) matches: d65 night raid — 4 raiders (Big Beast, Sunbasker, Suburb, Big Beast) at Haven's door, The Big Beast kills Theo in 1 round, the scholar is present. The aftermath is the grind the row predicts: nightly pantry raids (~1–1.5k kcal/night from Ashford/Stonebridge/Thornfield), The Suburb returning d71/d73 ("Something moves out there"), The Herald feeding d75 (1,480 kcal). The village held the +30 mark (d90 ≥ d87) but died 25 days post-contact — contact survived, post-contact attrition killed a pantry-thin village. The pantry-8d vs s33's 55d difference is VISIBLE in the transcript (nightly raid drains vs absorbed losses) but cannot be NAMED under the pre-registered rule (s88 is a survivor by the binding metric). **PASS on coherence; the row and the narrative agree.**

Consequences are real in both: named villagers die (Rafael, Pallavi, Theo), the scholar fights personally, raids cost material kcal. No robotic repetition beyond the raid formula (amounts/attackers vary).

## Metric review (§14 — for the NEXT run, not this one)
1. **The diagnostic answered a sharper question than the one pre-registered.** Prong 2's premise (survivors vs bleeders among contacts) assumed contact-outcome variance; the measurement shows 5/5 contacts survived. The binding verdict is MISS, but the instrument is proven (51/51 proof, SMOKE, det-gate, 5/5 attribution) — the blank needs reframing, not a better instrument. Next diagnostic on this question should target (a) pre-contact fragility (the s66 class: unlock then immediate combat death), or (b) the post-contact grind (raid+herald attrition on pantry-thin villages), not contact outcomes.
2. **The s66 class is the actual bleed.** Unlock d65 → dead d67 of combat ×2, zero wave-4+ fights. The diplomacy road's wave-4 deaths happen before the monsters arrive, not in the meeting. A future instrument should capture the unlock→contact window (days 0–10 post-unlock) as its own population.
3. **Censoring never bit:** no unlock after day 120 except s22's d99 (honestly counted, held the mark). The 180d horizon was the right call for the +30 mark.
4. **Pantry-at-contact is the visible-but-unnamable difference** (55/57d on the long survivors vs 8d on s88). With n=5 and zero bleeders it stays a sense-tested observation, not a named factor. A larger seed set with true bleeders could name it — the instrument is ready.
5. **Neutrality held on all 8 seeds** — the own-control design doubled as the honesty proof. #247's discipline (never inherit baselines) cost ~2× compute and bought a clean read.

## Blanks (filled / documented)
1. **W4SURVIVE DIAGNOSTIC: prong 1 MET, prong 2 MISS — MISS overall (documented):** the instrument attributes wave-4 contact outcomes at 5/5 = 1.000 on the diplomacy road (leadcourt, 8 seeds × 180d, own control, all trajectories neutral). The distinguishing-factors question is unconcentrated — not because the fields are wrong, but because there are no bleeders in the contact population: 5/5 contacts held the +30 mark. The "survival variance" from the hybridroad milestone does not live in contact outcomes on this substrate. Reframed blanks: (a) pre-contact fragility — the s66 class (unlock → combat death in 2d, never meeting wave 4); (b) post-contact grind — raid+herald attrition vs pantry depth (s88's 8d pantry vs s33's 55d, sense-tested). Instrument scripts deleted per MISS protocol (evidence-only landing); design preserved in this file for a future re-run.
2. **COUNTERS THESIS FALSIFIED BY DESIGN (documented):** counterKnownW4 = 0/5 contacts — waves 3–5 are deliberately counter-less (MONSTER-WAVES.md). Any future "readiness" lever predicated on wave-4 counters is building on a canon void.
3. **CONTACT TIMING (documented):** first wave-4 contact lands 1–9d post-unlock (dsu 1/7/4/9/8) — the "readiness window" the hybridroad arm found nearly empty PRE-unlock is, if anything, POST-unlock and days wide. A post-unlock readiness doctrine has somewhere to live; the pre-unlock one didn't.
4. **SCHOLAR PRESENCE AT CONTACT (documented):** scholar away 3/5 (s22/s33/s77 — all survived), home 2/5 (s44/s88 — both survived). Presence at first contact does not separate outcomes on this set — consistent with the wildtile finding that the scholar's tile is not the binding variable.

## Convergence
scale-onramp: CONVERGING (unchanged). The diagnostic does not move the axis — it reframes the question: the wall on the diplomacy road is not "villages die when wave 4 arrives" (5/5 contacts survived) but unlock timing + pre-contact fragility + the post-contact grind. The axis still moves only when a road reaches wave 4 AND holds it durably.

## Wall numbers (this run, 8 seeds × 180d, leadcourt, identical seeds, control=instrumented trajectories)
national 5/8 · table 0/8 · wins 0/8 · wave-4 unlocks 6/8 · wave-5 0/8 · median survival 115d · max 180d.
Death-cause shares (8-seed aggregate): villager:combat 71, villager:villager combat 50, player:combat 50, villager:monster 39, villager:expedition 14, villager:sickness 12, villager:wound 9, villager:starvation 5, player:starvation 2, player:expedition 2, villager:contest 2, player:contest 1, player:dehydration 1, player:lockjaw 1, villager:alien 1, villager:ambush 1, villager:dog-shaped-silence 1.
(s33: national, survived 180 — the control milestone reproduces on the current tree, extended from 150 to the 180d horizon.)

## Files
- `evidence/2026-10-15/sim-w4survive.md` — this file.
- `evidence/2026-10-15/sim-w4survive.json` — per-seed rows (control + instrumented, neutrality table, attribution, distinguishing verdict, wall).
- `evidence/2026-10-15/sim-w4survive-sweep.log` — sweep console log.
- Instrument scripts (`scripts/w4survive-*.js`: lib, sweep, proof, det-gate, sense) — PROVEN (51/51 proof incl. 15 RED, SMOKE trajectory-neutral, det-gate 2/2 bit-identical) but DELETED per MISS protocol (evidence-only landing). Design preserved above for a future re-run.
