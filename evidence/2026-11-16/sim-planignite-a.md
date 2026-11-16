# sim-planignite-a — DIAG: why do villages never start a plan?

**Arm:** sim-planignite-a, Loop A 2015Z (oversight-flesh-out-loop), axis winnability chain.
**Base:** master `7bb50f3dc` at arm start; rebased onto master at landing, proofs re-run.
**Prereg:** `evidence/2026-11-16/sim-planignite-a-prereg.md` (frozen before any judged sim; commits `f55373917` prereg + `a354e2dc3` instrument).
**Band:** 102601–102608, 8 seeds, 150d death-aware, competent policy. Instrument-only: zero game-code change, no default flipped.
**Verdict: DIAG-NO-GO on bar 1** (classification coverage). Bars 2–5 pass. The frozen taxonomy could not classify the two no-plan villages — but the post-hoc initializer diagnostic (not a taxonomy row) explains them exactly, in code and in numbers. The fix is a follow-up arm, not this DIAG.

## The question, in plain words

HavenTick is the dominant plan creator on master as-is — but on 4 of 8 control seeds in haventick-b the plan system never starts at all in 150 days, while the villages survive, reach wave 5, and slay beasts. This DIAG decomposes havenTick plan creation per village per day and names, for every village that never starts a plan, WHICH condition blocks it.

## Panel

| Seed | Days | Standing | Rank | Creates | Ranger calls | Ranger days | Heard day 1 | Blocker |
|---|---|---|---|---|---|---|---|---|
| 102601 | 151 | 385 | regional | 0 | 233 | 495 | 7 | unexplained |
| 102602 | 151 | 190 | regional | 3 | 81 | 239 | 7 | ignited |
| 102603 | 149 | 315 | regional | 6 | 62 | 166 | 5 | ignited |
| 102604 | 107 | 199 | regional | 7 | 111 | 332 | 5 | ignited |
| 102605 | 123 | 375 | regional | 2 | 235 | 419 | 8 | ignited |
| 102606 | 151 | 425 | regional | 8 | 181 | 588 | 5 | ignited |
| 102607 | 151 | 199 | regional | 0 | 238 | 507 | 5 | unexplained |
| 102608 | 150 | 199 | regional | 7 | 92 | 374 | 6 | ignited |

**2/8 villages never start a plan in 150 days** (102601, 102607) while surviving, reaching regional standing (385 / 199), and slaying beasts. The shape from haventick-b reproduces on a fresh band.

## Bars (frozen)

- **Bar 1 classificationCoverage: FAIL** — 2 no-plan seeds, 2 unclassified, 2 unexplained villages. The frozen taxonomy has no row for what actually blocks them.
- **Bar 2 corpus: PASS** — 8/8 per-seed files.
- **Bar 3 tickGateReplica: PASS** — 0 mismatches. The instrument's replica of the havenTick gate agrees with the game's gate on every tick: the game itself refuses to create on those calls.
- **Bar 4 creationLedger: PASS** — holdersWithoutCreation 0, census unexplained 0.
- **Bar 5 wallReported: PASS** — national by standing 4/8, by rank 0/8, table 0, wins 0, wave-4 8/8, wave-5 4/8, median survival 150.5d.

## Mechanism — the store that never existed (verified in code and in numbers)

**The code** (`src/js/win-plan.js`): the plan store `v.winPlan` is lazily initialized by `stateOf()` (line 93: `v.winPlan = v.winPlan || {}`), which is reached only through `winPlanSeedFromFight` / `winPlanNoteKill` / fight-gate bump / `winPlanOf` / `winPlanStats` — i.e. only after a wave-3+ seed row, an expedition/agency kill, a fight-gate avoid, or a bond/muster bump. But `winPlanHavenTick` (line 282), the function that is supposed to SEED a plan from heard knowledge, reads the store directly:

```js
var v = this.state && this.state.village;
if (!v || !v.winPlan) return null;
```

It never calls `stateOf()`. **When the store is absent, every havenTick call returns null before it ever checks profile, Haven presence, or engagement. It can never be the first spark.**

**The numbers** (analyzer store-initializer diagnostic, `scripts/analyze-planignite-a.js:165–260`):

| Seed | Wave-3+ seed rows | Agency kills | Gate avoids | Bond/muster | First initializer day | Store ever initialized |
|---|---|---|---|---|---|---|
| 102601 | 0 | 0 | 0 | 0/0 | — | **No** |
| 102607 | 0 | 0 | 0 | 0/0 | — | **No** |
| 102602 | 7 | 22 | 0 | 0/0 | 13 | Yes |
| 102603 | 2 | 9 | 3 | 0/0 | 31 | Yes |
| 102604 | 25 | 49 | 13 | 0/0 | 20 | Yes |
| 102605 | 5 | 6 | 1 | 0/0 | 104 | Yes |
| 102606 | 29 | 70 | 24 | 0/0 | 36 | Yes |
| 102608 | 20 | 63 | 8 | 0/0 | 16 | Yes |

On the two dead villages, **no initializer of any kind ever fired in 150 days** — yet rangers stood at Haven with engagement present: 102601 logged 233 havenTick calls (19 engagement-fail, **214 unexplained-call**), 102607 logged 238 (6 engagement-fail, **232 unexplained-call**). Sampled unexplained calls show heard=true, village slain count 2, plan absent — the gate's own conditions were met and the call still returned null at the `!v.winPlan` guard. **869 unexplained havenTick calls panel-wide** (446 on the two dead villages, the rest before first initialization on the ignited seeds). On all six ignited seeds the first creation falls on or after the first initializer day, every time.

**The catch-22, in plain words:** the plan system needs a wave-3+ seed or an agency kill to switch on — but the plan system is the thing meant to get villagers hunting wave-3+ beasts. A village that never gets that first spark can hear monsters from day 5, slay beasts, survive 150 days at regional standing, and never once start a plan. The ignition failure is not a threshold, not a profile, not a Haven-presence problem: the store simply never existed.

## What this does NOT claim

- It does not claim the store is the ONLY ignition failure: 6/8 villages ignited, and the ignited seeds' pre-initializer calls show the same guard firing transiently. The store is the binding failure for the never-plan villages.
- It does not claim a fix: this arm is instrument-only. The fix (initialize the store on first HavenTick, or seed it from heard/slain knowledge directly) is a follow-up arm with its own prereg. No game code changed here.

## Proof

`scripts/test-planignite-a.js`: **80 passed, 0 failed** (re-run on the rebased landing tip; the policy-sha pin was re-pinned 74a890f0844e → df9b7dff4de4 after the landing r140 budget stop changed `scripts/policies/competent.js` — the only policy-file change between the arm base and the landing tip, verified by diff; the arm itself touches no policy file). Instrument: driver `scripts/planignite-driver-20261116.js`, analyzer `scripts/analyze-planignite-a.js` (extends the haventick-b instrument; analyzer validated against the haventick-b corpus before the panel). Corpus: `evidence/2026-11-16/perseed-planignite-a-control/` (8 files), analysis `evidence/2026-11-16/planignite-a-analysis.json`.

## Metric review

- **Bar 1 failed as written** — the frozen taxonomy had no row for a never-initialized store. That is the finding, not a scoring error: the taxonomy assumed a named blocker (no-ranger / no-engagement / never-reaches-haventick) and the real blocker was outside it. The initializer diagnostic was written as a post-hoc explanation, not a taxonomy row, per the prereg's rule that the taxonomy binds.
- **Proposed for the next run:** add a `store-never-initialized` taxonomy row (initializer count 0 across all four observable initializer kinds) so the next ignition DIAG classifies this shape inside its bars; the fix arm then tests whether initializing the store on first HavenTick moves the no-plan rate.
- No mid-run re-scoring. All verdicts above use the prereg thresholds.

## Wall

National by standing ≥200: 4/8. National by rank: 0/8. Table: 0. Wins: 0. Wave-4 unlocked: 8/8. Wave-5 unlocked: 4/8. Median survival: 150.5d.

## Closeout

- Adopted in the main session after the 2015Z coordinator timed out: evidence written from the worker's corpus + analysis, proof re-run, committed, rebased onto master, merged locally, pending ship. No version bump, no push, no live check (ship loop owns those).
- Round lock (`fleshout-loop.lock`, run `fleshout-20261116T2015Z`) and round claim NOT deleted by this adoption: sibling arms sim-trickshare-a and sim-vetreengage-a were still active with no final handoff at adoption time. Coordinator round evidence `sim-winnability-round-2015.md` is owed by the round, not this arm.
