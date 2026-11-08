# sim-53007-a — prereg (DIAG, zero src/js)

**Arm:** sim-53007-a (DIAG, zero src/js) · **Run:** fleshout-20261108T1622Z (Loop A) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Tracker blank:** 1530Z blank (2), findings backlog #1912 · **Branch:** sim-53007-a, rebased onto current master `6680d7924e46911a963e3ad8dd06ab5e28f128c3` (pellet-boost landed) — rebase clean, no stop-at-pick quirk. **Prereg committed BEFORE any sweep.**

## The question

What kills seed 53007, when, and is it a third unmapped mechanism or a seed that is supposed to die? Classify the death completely: cause, day, the preceding 7-day trajectory (population, pantry, wave state, sickness/wounds in camp), and whether any landing in #1..#17 could have touched it.

## Canon read

- `docs/CANON.md` read first. Area canon: `docs/DISEASES.md` (two pools — mundane vs alien; sickness vectors, cures, diagnosis; ambient tick/mosquito fever vs monster-fight alien viruses) and `docs/PRESERVATION.md` (food ladder, spoilage) for the pantry read. No canon doc covers a "seed that is supposed to die" — there is no such canon; the question is answered from measurement, not invented.
- Prior judged diagnosis for 53007 (sim-xphalf-rejudge-b, 2026-11-07): **sickness-first** on the XP-half P1 shape (55d, 7/14 deaths sickness, first death sickness d21, no violent death until d39). That label is the rule-validation target below, not the answer here — this arm re-classifies on current master.

## Endpoints actually read — and what this classification rests on

- **Healed endpoint `c9fea16ee` is NOT current master anymore.** The pellet-boost landing (6680d7924, after the healed endpoint) changed pellet behavior (boosts now cost pantry calories). This arm's classification rests on **current-master (`6680d7924`) re-runs** with the DIAG recorder armed. The healed-endpoint corpus is used only as a cross-check.
- **Reused (committed corpora, NOT re-run):** collapsed control `perseed-healerctl-collapse-b/` (53007: 63d, 8 fallen) and healed/mid16 `perseed-healerbisect-mid16-b/` (53007: 50d, 8 fallen, identical to the healed control's own file). These answer the endpoint headline + fallen list. They do NOT answer the question: their daily rows carry no pantry, no sickness/wound counts in camp — the preceding-7-day trajectory cannot be read from them.
- **Re-run (this arm, current master):** full frozen band 53001–53008, doorwalk baseline leg, 150d death-aware, DIAG recorder armed — the only way to get daily pantry + sick/wounded counts. Plus unrecorded controls for G2 (below).
- **Confound check, pre-registered:** if current-master 53007 does NOT reproduce the healed-exact shape (50d, same fallen list), the pellet-boost landing is the prime suspect — report the divergence as its own finding, do not smooth it into the classification.

## Substrate

- DIAG recorder (`scripts/recorder-53007-20261108.js`, new, scripts only) on the frozen band 53001–53008, competent doorwalk leg (`scripts/doorwalk-b-driver-20261107.js` pattern, BASELINE only: TAKESEAT_B=1, DOORWALK_B off), 150d death-aware, current master `6680d7924`.
- Recorder wraps the sitstep instrument snapshot (same pattern as the driver's own snapshot extension) and adds ONE pure-read `diag` object per daily row: `pantryKcal` (`Game.pantryKcalLive(village)` — a pure reduce over pantry items, no writes, no RNG), `foodDays` (`Game.villageFoodDays()`, pure read), `sickN` + `sickList` (name, disease, daysLeft from `village.sick`), `woundedN` + `woundedList` (living villagers with `village.health[vid] < 100`, default 100), `hungryN` (existing `village.needs[vid].hunger > 70` only — reads the needs map directly, NEVER calls `npcNeeds()`, which lazily initialises entries), `pelletHolder` (vid or null from `state.fusionReactorHolder`), `pelletPassDay` (`state.pelletPass.lastPassDay`).
- Reuses the healerbisect screen module / doorwalk driver where it fits; the recorder is built only because no existing instrument records pantry or sickness-in-camp per day.
- Corpus under `evidence/2026-11-08/perseed-53007-a/`. Driver: `scripts/doorwalk-53007-driver-20261108.js` (doorwalk-b-driver pattern + recorder install, `DIAG_RECORDER=0` runs unrecorded for the G2 control).

## Mechanism classification rule (pre-registered, applied mechanically)

Cause groups: VIOLENT = monster, combat, ambush, contest, arena, 'the wild', betrayal, 'a stranger', The Callback, expedition. ATTRITION = sickness, 'a wound that wouldn't close', starvation, thirst. OTHER = 'the night' and anything unlisted (stated, never silently bucketed).

Apply in order, first match wins:
1. **sickness-first:** first death is sickness AND sickness deaths ≥ 40% of fallen AND no violent death before the 3rd sickness death.
2. **attrition-after-thinning:** first 3 deaths all violent AND living at d30 < 8 (daily living row) AND ≥ 3 attrition deaths after d30.
3. **starvation-led:** ≥ 2 starvation deaths AND starvation is the modal attrition cause in the final 7 days.
4. **combat-led:** violent deaths ≥ 60% of fallen.
5. **mixed/other:** none of the above — report the full cause mix, do not force a label.

**Rule validation (pre-registered):** the rule must reproduce the judged xphalf-rejudge label for P1 53007 (55d: first death sickness d21, 7/14 sickness, no violent death until d39) as **sickness-first**. If it does not, the rule is wrong and the classification is reported as unjudged, not re-scored. The rule-order nuance from that run is carried: a sickness-cluster opener that ends in attrition classifies sickness-first under this rule (rule 1 fires before rule 2) — stated here so 53005-style seeds do not need a footnote later.

## The #1..#17 non-heal explanation (method, pre-registered)

For each of the 17 game-code landings in `cf22937b8..c9fea16ee` (candidate table in `evidence/2026-11-08/sim-healerbisect-b-prereg.md`):
- Verify the landing's diff scope from `git show --stat` / `git diff` on master (read-only): what files/systems it touches.
- State which mechanism it could in principle touch (sickness pressure, the village's response to sickness, pantry/food, roster size before d50, party formation) and which it could not.
- Evidence per landing: 53007's screened death day across the bisect (collapsed 63d → #8 63d → #9 59d → #14 59d → #15 50d → #16 50d) plus the decisive fact that the healed endpoint — all 17 landings together — still dies it at 50d.
- Landings verified inert in the prereg (from the bisect prereg, re-stated not re-derived): #4/#13 version stamps only; #6–#7 prodstore pair nets to zero game code and was lever-gated off; #3 one dialogue line in characterGen.json. The rest are verified from their diffs in this run.

## GO bars (binding — DIAG-GO requires ALL)

1. 8/8 configs produce a full daily corpus with an end snapshot (daily rows contiguous from first to last day, end snapshot present, 0 instrument errors).
2. A per-seed death table for the band with 53007's death classified in full (cause, day, preceding-7-day trajectory, mechanism class per the rule above).
3. The #1..#17 non-heal explained per landing class — which landings could in principle touch 53007's mechanism and which could not, with the evidence for each.
4. **G1 det-gate PASS** (proof `scripts/test-53007-a.js`: classifier reproduces the judged P1-53007 label on the committed corpus fixture; a broken recorder fails the integrity leg).
5. **G2 recorder neutrality PASS** (armed recorder reproduces the unrecorded trajectory exactly — daily living/fallen/end fields identical — on control seeds 53007 and 53004, same code, same master).
6. **G3 corpus integrity PASS** (every corpus JSON: contiguous daily rows, end snapshot, fallen list consistent with daily living drops, 0 instrument errors).

If a lever candidate emerges from the classification, NAME it with its prereg shape for the next run — do NOT build it in this arm.

## Proof

`scripts/test-53007-a.js` (det-gate + neutrality + corpus-integrity legs). The proof must FAIL on a broken recorder (mutated recorder fixture: pantry always 0 / sick list dropped) and PASS on the real one. Never run concurrent jest; use `--cacheDirectory=/tmp/jest-cache-sim-53007-a`.

## Non-goals

- DIAG only: zero src/js, no default flips, no game-code change.
- No fresh band, no landing, no merge — report ready-to-merge; the coordinator lands it.
- Flap protocol: probe-gate EVERY git write (`git update-ref refs/heads/probe HEAD`, delete the probe branch when done); if the probe fails, do read work and retry later — never force a write, never route around a denial with a manual ref edit. Flap was ACTIVE ~16:50Z; probe passed at rebase time (~17:00Z) — record probe state at each write.

## Metric review (pre-registered note)

- The primary metric is the classification itself (cause + day + trajectory + mechanism class), judged against the bars above — not a friendlier re-scoring of the band's health. If current-master 53007 diverges from the healed-exact shape, that is a finding about master movement (pellet boost), not a reason to re-score the classification.
- The doorwalk baseline leg never walks a door and never wins by design; national/table/wins are reported as wall numbers, not judged.
- Panel (§15): not a panel verdict — this is a DIAG classification on a recorder corpus, same standing as the bisect arms; if `balance-panel.js` refuses recorder corpora, record that honestly.
