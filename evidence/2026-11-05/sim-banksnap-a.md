# sim-banksnap-a — bank-added snapshot at every upkeep call + re-judgment of the 14 events

- **Run:** fleshout-20261105T1215Z, arm sim-banksnap-a (axis food-economy)
- **Date:** 2026-11-05
- **Prereg:** `evidence/2026-11-05/sim-banksnap-a-prereg.md` (commit `565439444`, committed BEFORE any judged re-run)
- **Prior arm:** `evidence/2026-11-05/sim-bankadded-substrate-a.md` (run fleshout-20261105T1041Z) — NO-GO-NON-UNANIMOUS, 6 retained / 8 VANISHED over 14 judged bank-added events, 0 censored
- **Verdict: GO-RETAINED** — unanimous, 14/14 retained-or-retained-then-eaten, 0 unexplained-vanished
- **Game code changed:** none. Instrument-only (probe + analyzer + tests). No `src/js` touched.
- **Corpora:** substrate `evidence/2026-11-05/sim-bankadded-substrate-a-corpus/` (8 files, unchanged) and new `evidence/2026-11-05/sim-banksnap-a-corpus/` (8 files, same 8 seeds)

## What this arm did, in plain words

The last run found that food the game banks overnight mostly survives the night — but 8 of 14 test meals seemed to vanish. That vanishing turned out to be a measuring mistake, not lost food: on nights when sleep is refused (the clock is too far gone), the scholar eats breakfast *before* the measuring snapshot looks at the pack, so the food was already eaten by the time anyone checked. This arm fixed the measuring tool to take a snapshot at every upkeep call instead of only on day-change, then re-judged the same 14 meals with the fixed tool. All 8 "vanished" meals are now accounted for: the food was in the pack at nightfall and was eaten in the morning before the old snapshot looked. Nothing was lost overnight. The finding the substrate arm was built to test — banked food survives the night — now stands unanimous.

## Primary metric (binding, from the prereg)

Re-judge the same 14 distinct bank-band added events (seeds 17025, 17029, 17051, 17059, 17060, 17063, 17064, 17073) under the fixed every-upkeep snapshot.

**GO bar:** re-judge ALL 14; GO iff unanimous retained-or-retained-then-eaten, every one of the 8 prior VANISHED explained per rules E1–E6 with kcal accounting quoted per event, every one of the 6 prior retained confirmed by the snaps. Any event unexplained-vanished, DISAGREED, or UNRESOLVED → NO-GO with that event named.

**Result: GO.** 14/14 retained-or-retained-then-eaten (6 retained confirmed, 8 VANISHED → RETAINED-THEN-EATEN), 0 disagreed, 0 unresolved, 0 unexplained-vanished.

## The instrument fix

Files (commits `b9353031e`, `6ace6a84e`, `fe0146113`):

- `scripts/policies/bankfood-diag.js` — the bankfood wrapper's store gains `upkeepSnaps: []`; `withBankfood` upkeep now records a snapshot at EVERY upkeep call (scholarDay, running upkeep index, afterDailyCalls, kcal, dayTicks, canonical pack snapshot), taken BEFORE delegating to inner upkeep. The old first-upkeep behavior is unchanged. Pure recorder addition: no state edits, no RNG draws.
- `scripts/bankadded-probe-trace-b.js` — instance output attaches `upkeepSnaps` alongside `firstUpkeeps`.
- `scripts/analyze-bankadded-probe.js` — new `preSnapshotWindow(inst, ev)` (paths: refused-path / sleep-path / roll-after-daily / no-upkeep-snaps) and `rejudgeEvent(inst, ev)` (rejudgedVerdict, retainedFinal, preSnapshot); constants `EAT_TRIGGER_KCAL = 2040`, `ENDDAY_BURN_KCAL = 2200`. Old `verdict` / GO math kept untouched. New totals: `retainedThenEaten`, `disagreed`, `unresolvedNoPreSnap`, `retainedFinal`, `unexplainedVanished`, `reVerdict` (GO-RETAINED iff unanimous retainedFinal; else NO-GO-UNEXPLAINED; INSUFFICIENT-DATA if none judged). Residual `R = kcal(snapPost) − (kcal(snapEat) + 720 − 2200)` is computed ONLY for staged events whose drop is at-or-before the snapshot; null for retained events (food eaten after the snapshot) and for genuine/press-added events (no injected food).
- `scripts/policies/bankadded-probe-diag.js` — untouched (probe wrapper delegates to bankfood unchanged).

### The E1–E6 rules (from the prereg)

- **E1** — snapPre (last upkeep snap of the evening day, afterDailyCalls == loopDay) shows the injected 18 units and snapPre edible == post-bank edible.
- **E2** — snapPost (first upkeep of the new day) shows injected 0.
- **E3** — the drop localizes to one consecutive inter-snap step (snapDrop is the first snap after snapPre with injected < 18; snapEat is the snap immediately before it; drop before the roll or at the snapshot; the eating call is in the same loop-day p-loop).
- **E4** — the competentEat trigger fired at the eating call (kcal < 2040).
- **E5** — spoil immunity (injected spoilDay gameDay+2 > new day).
- **E6** — kcal accounting QUOTED per event, not exact-matched (see metric review).

E-flag encoding in the table below: `Y` = rule holds, `n` = rule does not hold / not applicable to this event shape. For retained events there is no drop to localize, so E2/E3 read `n` and the confirmation is the injected count holding at 18 at both snaps; for retained-then-eaten events all five fire. E6 is satisfied by the quoted kcal columns, not by a flag.

### Prereg improvement, held (with reason)

The brief's "same-window kcal rise" as literally stated is unmeasurable in this window, because the endDay burn (2200) and competentEat's pantry guard-loop takes share it — demonstrated by the two retained controls in the existing corpus (17051/11: 2240→0 while 17025/32: 2230→2090, same trigger state, wildly different overnight kcal moves). So the kcal accounting is QUOTED per event with the residual attributed or named open; the proof is the pack-identity drop localized to the eat window (E1–E3) + fired trigger (E4) + spoil immunity (E5). The residual `R` is an upper bound on (pantry take − debits), not a measurement, because resolveDay floors kcal at 0 — see metric review.

## Proof (all green BEFORE any judged re-run, per the prereg proof bar)

- `scripts/test-banksnap-a.js` (new, 52 tests): **52 passed, 0 failed** — every-upkeep snapshot ordering (snap before inner upkeep's eat; OFF leg records nothing), preSnapshotWindow E1–E5 on fixtures (refused-path drop across the roll, drop-before-roll, retained agreement/disagreement, trigger-not-fired stays VANISHED, partial drop stays PARTIAL-UNEXPLAINED, sleep-path and roll-after-daily keep the old verdict, no-snaps fallback, genuine keeps RETAINED with edible 360/360 and null residual), summarizeDir before/after on identical events in temp dirs (old verdict NO-GO-NON-UNANIMOUS vs reVerdict GO-RETAINED; mixed dir with a sleep-path vanish stays NO-GO-UNEXPLAINED).
- `scripts/test-bankadded-probe-a.js` (unchanged from the substrate arm): **58 passed, 0 failed**.
- Smoke (1 seed, 17063, to /tmp): driver exit 0; reproduced the substrate seed exactly (2 staged + 1 genuine, errs 0, survived 60d). Analyzer on smoke: old verdict NO-GO-NON-UNANIMOUS, reVerdict GO-RETAINED (13 genuine RETAINED, 14 + 15 staged VANISHED → RETAINED-THEN-EATEN, 180 upkeep snaps recorded).
- Determinism guard (stop condition, not a re-score): **PASSES** — the re-run reproduced the substrate's event set exactly (same 14 seed/loopDay/kind/delta, same per-seed staged counts, same evening kcal). Event sets identical between old and new corpora; old-only [] / new-only [].

## Full band (8 seeds, 60d death-aware horizon)

Driver exit 0, ~12.5 min, all 8 files written to `evidence/2026-11-05/sim-banksnap-a-corpus/`. Per-seed staged counts match the substrate exactly: 17025: 2 staged, survived 60d; 17029: 0, survived 60d; 17051: 1, survived 60d; 17059: 2, survived 60d; 17060: 2, village-lost day 42; 17063: 2 staged + 1 genuine, survived 60d; 17064: 2, survived 60d; 17073: 2, village-lost day 35. Instrument errors 0 (bfErrs 0, probeErrs 0, all seeds). Guard leg WOODWARM=0, BANKFOOD=1, BANKADDED_PROBE=1, env gates COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1, POLICY=nighttravel, WOODCARRY=1. This arm's own corpus survival: median 60d, 2 of 8 villages lost.

## Before / after — same 14 events, old snapshot vs new snapshot

| Corpus | Judged | Censored | Old retained | Old vanished | RTE | Disagreed | Unresolved | Retained-final | Unexplained-vanished | Old verdict | Re-verdict |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Substrate (old analyzer, no snaps) | 14 | 0 | 6 | 8 | 0 | 0 | 0 | 6 | 8 | NO-GO-NON-UNANIMOUS | NO-GO-UNEXPLAINED |
| Banksnap (new corpus, every-upkeep snaps) | 14 | 0 | 6 | 8 | 8 | 0 | 0 | 14 | 0 | NO-GO-NON-UNANIMOUS | **GO-RETAINED** |

New-corpus totals: seeds 8, strandedEvenings 31, stagedTotal 13, stagedJudged 13, stagedCensored 0, pressAddedTotal 0, genuineTotal 1, genuineJudged 1, judged 14, censored 0, retainedAtTrueMorning 6 (retainedClean 5, retainedSpoilSwept 1), vanished 8, partialUnexplained 0, injectedStackMatch 5, injectedStackMismatch 8, flipAddedTotal 5 (context only), probeErrs 0, bfErrs 0, retainedThenEaten 8, disagreed 0, unresolvedNoPreSnap 0, retainedFinal 14, unexplainedVanished 0, distinctJudged 14, unanimousFinal true, reVerdict GO-RETAINED.

Note: the old `verdict` column is deliberately untouched by the fix — the first-upkeep snapshot still says NO-GO-NON-UNANIMOUS on both corpora. That is the artifact reproducing itself, as designed: the old instrument cannot see the pre-snapshot eat. Only the re-judgment (which uses the every-upkeep snaps) changes.

## Per-event re-judgment (all 14)

Snap indices are running upkeep counters (#97 = the 97th upkeep call of the run). `inj` = injected Muscadine Grapes units (18 = one full injected stack, 40 kcal each, 720 kcal). `kEat` = scholar kcal at the snap just before the drop; `kPost` = kcal at the first snap of the new day; `resid` = R (see above; null for retained events). `ed` = pack edible kcal at snapPre / snapPost. All 14 paths are refused-path (sleep refused, clock 449–483). All 8 RTE drops sit exactly on the snapshot step (snapDrop == snapPost, snapEat == snapPre, consecutive upkeep indices).

| Event | Kind | Old → New | E1–E5 | snapPre → snapPost (eat / drop) | inj | kEat → kPost | Resid | ed pre/post | Morning disposition |
|---|---|---|---|---|---|---|---|---|---|
| 17025/32 | staged | RETAINED → RETAINED | nnnnY | #97 → #98 | 18→18 | — → 2090 | null | 720/720 | morning-phase-eaten, injected 18/18 |
| 17025/33 | staged | RETAINED-SPOIL-SWEPT → RETAINED-SPOIL-SWEPT | nnnnY | #100 → #101 | 18→18 | — → 2400 | null | 1680/1280 | morning-phase-eaten, injected 18/18; carried spoilDay-34 stack swept |
| 17051/11 | staged | RETAINED → RETAINED | YnnYY | #34 → #35 (eat #35 / drop #36) | 18→18 | 0 → 0 | null | 720/720 | upkeep-eaten (food eaten at p=2 after the snapshot; snap #36 kcal 0→720, pack 720→0) |
| 17059/5 | staged | VANISHED → RETAINED-THEN-EATEN | YYYYY | #16 → #17 (eat #16 / drop #17) | 18→0 | 655 → 0 | 825 | 720/0 | still-in-pack |
| 17059/6 | staged | VANISHED → RETAINED-THEN-EATEN | YYYYY | #19 → #20 (eat #19 / drop #20) | 18→0 | 0 → 0 | 1480 | 720/0 | still-in-pack |
| 17060/8 | staged | RETAINED → RETAINED | YnnYY | #25 → #26 (eat #26 / drop #27) | 18→18 | 480 → 480 | null | 1240/1240 | upkeep-eaten-unexact (eaten at p=2: kcal 480→1700, pack 1240→0) |
| 17060/9 | staged | VANISHED → RETAINED-THEN-EATEN | YYYYY | #28 → #29 (eat #28 / drop #29) | 18→0 | 1510 → 0 | −30 | 720/0 | still-in-pack |
| 17063/13 | genuine | RETAINED → RETAINED | nYYnY | #40 → #41 (eat #40 / drop #41) | 0→0 | 2230 → 0 | null | 325/325 | upkeep-eaten (no injection — genuine bank-added food) |
| 17063/14 | staged | VANISHED → RETAINED-THEN-EATEN | YYYYY | #43 → #44 (eat #43 / drop #44) | 18→0 | 165 → 0 | 1315 | 720/0 | still-in-pack |
| 17063/15 | staged | VANISHED → RETAINED-THEN-EATEN | YYYYY | #46 → #47 (eat #46 / drop #47) | 18→0 | 0 → 0 | 1480 | 720/0 | still-in-pack |
| 17064/6 | staged | VANISHED → RETAINED-THEN-EATEN | YYYYY | #19 → #20 (eat #19 / drop #20) | 18→0 | 155 → 0 | 1325 | 720/0 | still-in-pack |
| 17064/7 | staged | VANISHED → RETAINED-THEN-EATEN | YYYYY | #22 → #23 (eat #22 / drop #23) | 18→0 | 0 → 0 | 1480 | 720/0 | still-in-pack |
| 17073/31 | staged | VANISHED → RETAINED-THEN-EATEN | YYYYY | #94 → #95 (eat #94 / drop #95) | 18→0 | 1328 → 0 | 152 | 720/0 | still-in-pack |
| 17073/32 | staged | RETAINED → RETAINED | YnnYY | #97 → #98 (eat #98 / drop #99) | 18→18 | 0 → 0 | null | 720/720 | upkeep-eaten-unexact (eaten at p=2: kcal 0→972, pack 720→0 — includes +252 pantry take) |

Reading the table:

- **The 8 RTE events** all show the same signature: injected 18 at snapPre, 0 at snapPost, the drop on the single step between two consecutive upkeep snaps, the competentEat trigger fired (evening kcal 0–1510, all below the 2040 trigger), spoil immunity holding (injected spoilDay is gameDay+2), and the morning disposition "still-in-pack" — meaning by the time the old first-upkeep snapshot looked, the food was already eaten and the pack was empty. The food was retained overnight and eaten for breakfast; it did not vanish.
- **The 5 retained staged events** all show injected 18 at both snapPre and snapPost — the food survived the night intact — and were then eaten later in the morning (morning-phase or upkeep-eaten dispositions). 17025/33 additionally shows the carried spoilDay-34 stack swept at dawn (edible 1680→1280) while the injected stack (spoilDay gameDay+2) survived — the spoil sweep works as designed and does not touch the injected food.
- **The 1 genuine event** (17063/13, real bank-added food rather than an injected test stack) is retained and eaten in the morning, same as the staged controls.
- **Residuals** for the 8 RTE events: 825, 1480, −30, 1315, 1480, 1325, 1480, 152. Every one lies within the pantry guard-loop's maximum possible take for its event (2280 − (kcalEat+720): 905, 1560, 50, 1395, 1560, 1405, 1560, 232). The negative residual (−30, event 17060/9) is the tell that the residual is not a clean measurement: it can only go negative if debits beyond the flat 2200 burn ate into the take — consistent with the floor-at-0 destroying the separation between take and debits. The proof is the pack identity (18→0 across one eat step with the trigger fired), not the kcal arithmetic.

## Mechanism (recap — full detail in the substrate evidence)

Each loop-day runs 3 upkeep calls (policy.upkeep → fights → wait → fights, ×3), then policy.daily, then Game.sleep(). Sleep refuses when fewer than 64 ticks remain in the day (clock ≥ 449). A refused sleep does nothing; the day rolls later via tickAction → endDay(). The bankfood snapshot is taken at the START of each upkeep call, before inner upkeep — so with the fixed instrument, upkeep #1's snap (snapPre, evening day) still holds the injected food, and upkeep #2's snap (snapPost, new day, after the roll) shows it gone — with the eat in between localized to the single inter-snap step by the consecutive upkeep indices and the fired trigger. No other pack consumer exists in the [snapPre, snapPost] window (code read in the substrate arm): cookPack needs a fire the stranded scholar has none, feasts require being at Haven, the endDay spoil sweep is spoilDay-gated and the injected stack is immune, and villager/monster turns never touch the scholar's pack. Pantry guard-loop takes are directly visible in the snaps: 17073/31 p=2 snap kcal 0→1260 with an empty pack (pure pantry take); 17073/32 p=2 kcal 0→972 with 720 pack food (+252 pantry). This confirms the mechanism, though it does not quantify each RTE event's take.

## Sense-test (narration)

Read the evening say-tails for all 14 judged evenings and the following mornings in the new corpus. The narration is coherent throughout: rest lines ("You settle in and rest through most of the dusk…"), cold-snap shivering lines, fireside storytelling fragments, and counter-learned lines from villagers (Marta on The Living Wire, Suat on The Static Kite). Nothing in the say lines contradicts the re-judgment — no line claims banked food appeared, vanished, or was stolen.

Two honest limits, stated plainly:

1. **The pre-snapshot eat leaves no narration trace in-corpus.** No "You eat …" line appears for any RTE event's evening, because the eat happens in the inter-daily p-loop gap (after daily, before the roll), which the driver does not capture as say lines — it saves only per-row evening tails, not the p-loop wait lines. The eat is proven by the snaps (pack identity + trigger + localized step), not by a line of dialogue. A future instrument could capture p-loop say lines to close this gap; it is not needed for this verdict.
2. **The bank-add itself is silent by design** (an instrument injection, not a game event), so no narration is expected to mention it. The one evening eat line in-corpus (17025/33: "You eat Muscadine Grapes (320 kcal).") is an ordinary evening action eat, not the pre-snapshot upkeep eat.

Morning kcal in the morning rows corroborates the snap story where the capture points overlap (17025/32: 2090 = snapPost; 17025/33: 2400 = snapPost; 17051/11: 720 after the p=2 eat; 17060/8: 1680, near the 1700 post-eat snap; 17073/31: 2331 after further pantry takes). Where the morning row differs from snapPost, it is a later capture point (after the morning's own eats/takes), not a contradiction.

## Metric review

1. **The prereg's kcal improvement held.** Quoting kcal per event (rather than demanding an exact kcal-rise match) was the right call: the residual is an upper bound, not a measurement, because resolveDay floors kcal at 0 and the pantry guard-loop take shares the window with the 2200 burn. The negative residual on 17060/9 (−30) proves the point — a clean measurement cannot go negative. The verdict rests on pack identity (injected units 18→0 across exactly one eat step, trigger fired, spoil immune), with kcal as corroboration. **Proposed revision for the next run:** none needed to the GO bar itself; but any future arm that wants kcal-exact accounting should first add p-loop say-line capture (to see the eat) and a pre-burn kcal snapshot (to separate the guard-loop take from the burn), because without those two the residual can only ever be a bound.
2. **Open instrument question (carried from the substrate arm, still open): the overnight kcal credits on three RETAINED events are not explained by the flat 2200 burn alone.** 17025/32: 2230→2090 (−140, i.e. a +2060 credit against the burn); 17025/33: 2240→2400 (+160, exactly cap, i.e. a +2360 credit); 17060/8: 2270→480 (−1790, i.e. a +410 credit). Candidates ruled out by code read: villageMeal (pantryInReach false — not at Haven), feasts (require playerAtHaven + dayPart 2), pantry guard loop (trigger not fired at those kcal), joined-village meal (max 2000, and burn-then-meal ordering cannot reach 2400 from 40). 17060/8's +410 is consistent with cold-blooded (+440, 20% of 2200 returned) minus ~30 debits — the loopDay-9 say lines record a cold snap that night — but 17025's +2060/+2360 has no identified credit in-corpus (endDay's say lines fall outside the driver's captured slices). A grep for `scholar.kcal +=` / `s.kcal +=` in game.js returned only eat(), the cap clamp, the joined-village meal, and two other sites — no additional overnight credit found yet. **This does not affect any verdict:** pack identity is exact and the anomaly left the pack untouched in all three events. It is recorded here as an open instrument question for a future arm with p-loop/endDay say capture.
3. **No re-scoring happened.** The GO bar was committed in the prereg before any judged re-run and was applied as written. The determinism guard passed, so no stop was triggered. The old verdict column was left untouched on purpose — the artifact reproduces under the old instrument, which is itself evidence the fix addresses the cause rather than the symptom.
4. **Panel note (MEASUREMENT.md §15).** No balanced-panel comparison is owed or meaningful here: balance-panel.js cannot express this probe stack, and no game code changed. The comparison is old-vs-new snapshot verdicts on identical events by one analyzer, never labeled a panel comparison.
5. **Wall numbers — carried from 1041Z, not re-measured on this recorder corpus.** standaccum2 band national/table/wins 0/16, wave-5 0/16, median survival 90.5d; Loop B 0618Z postblood wild-dominant. Full seat still unwon; wave-5 kills still 0 in normal play. (This arm's own corpus is a bank-retention recorder, not a wall panel: median survival 60d, 2 of 8 villages lost — 17073 day 35, 17060 day 42.)

## Convergence state

Food-economy axis, item #1756: the snapshot-timing artifact is fixed and the 14 events are unanimously re-judged retained-or-retained-then-eaten. The substrate question — does banked food survive the night? — is now answered yes on this band with zero unexplained losses. The bank-retention strand itself is **converged** on this evidence; what remains open is the instrument question in metric review §2 (unidentified overnight kcal credits on retained events), which belongs to a future instrument arm, not to this verdict.

## Landing

- Commits (this arm): `565439444` (prereg), `b9353031e` (instrument fix + proof, 50/50 + 58/58 at that point), `6ace6a84e` (residual null for non-staged), `fe0146113` (residual only when the drop is at-or-before the snapshot; final proof 52/52 + 58/58). Evidence + corpus commit to follow in this worktree.
- sim-findings.md #1756 (BANK-ADDED SNAPSHOT MUST FIRE AT EVERY UPKEEP CALL, THEN RE-JUDGE THE 14 EVENTS) — mark `fixed` on landing (coordinator-owned file; worker does not edit it).
- Merged locally, pending ship. No [needs-eyes] — instrument-only, no game-code change, no player-facing difference.
