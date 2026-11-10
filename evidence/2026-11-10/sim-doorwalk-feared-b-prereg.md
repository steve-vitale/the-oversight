# sim-doorwalk-feared-b — prereg (Lane B leg 4, endgame; journey-endgame r167)

**Arm:** sim-doorwalk-feared-b · **Run:** oversight-playtest-loop-2, 2026-11-10 00:56Z (Lane B leg 4 — endgame) · **Branch:** journey2-endgame, base master `a64d6e91a` · **Policy:** `scripts/policies/competent-doorwalk-b.js` + new env gate `DOORWALK_ROTATION=feared-witness` (default rotation unchanged; policy-side only, zero src/js, zero default flips) · **Horizon:** 150d death-aware · **Proof:** `scripts/test-doorwalk-feared-b.js` (to be green before the judged pilot) · **Analyzer:** `scripts/doorwalk-feared-b-analyze-20261110.js` · **Driver:** `scripts/doorwalk-feared-b-driver-20261110.js` (doorwalk-b-driver copy: new names/dirs, rotation set on the armed leg, door-verb capture extended with option text, tableLines filter gains "You won"/"both-hands").

## The question

The doorwalk arm (2026-11-07, sim-doorwalk-b) walked four doors — beloved, relay ×2, defiant, assimilated — all light/grey, all won 5/5 through first-option beats. It left the coverage blank open: **feared was offered on all five sits and never walked; witness was offered on four sits and never walked; no dark branch was ever exercised.** This run walks the un-walked doors. When a competent player sits at the table and is assigned feared or witness, does the door walk and resolve — and do its beats read as real choices with real stakes (sense-test), not a first-option drain to a foregone win?

## What counts as interesting

- Feared/witness walked on ≥3/8 pilot seeds and every walk reaches a resolution (win, or an honest downgrade played through — no stall, no unanswered modal at run end).
- The beats read differently per door: feared's calibration tightrope (terror vs villager horror) and witness's trial (charges, defense testimony) must show their own meters/moves in the transcript, not the same three beats with the door name swapped.
- A dark branch appearing on any walk is recorded and sense-read (the branch is ledger-earned; the driver never overrides `tableBranch`).
- Trial-by-combat is NOT opted into (separate pre-registered decision; risks the Bearer). Dark conscript, if offered, is refused (doorwalk precedent).

## Seeds, legs, policies

- **Band:** 53001–53008 (frozen band, deliberately reused — same as doorwalk-b, takeseat-b, sitdrive-b; a re-run, not a fresh band).
- **Legs:** baseline (TAKESEAT_B=1, door drive OFF) vs armed (TAKESEAT_B=1, DOORWALK_B=1, DOORWALK_ROTATION=feared-witness). Same substrate, same master, same seeds, same days.
- **Rotation (pre-registered):** ROTATION = ['feared','witness','feared','witness'], seed-mapped as `ROTATION[(seed − 53001) % 4]` — 53001 feared, 53002 witness, 53003 feared, 53004 witness, 53005 feared, 53006 witness, 53007 feared, 53008 witness. Door rule otherwise unchanged (assigned if offered+earned; else first offered non-feared; else only-feared). A door never offered is never taken.
- **Reachable set procedure (from the run's own before leg, before the armed leg is judged):** the set of seeds that sit on the baseline leg. The primary bar counts entered doors among reachable seeds; offered-not-taken must be empty on the armed leg (a reachable seed that sits but never walks is a miss, not a shrug).

## Pre-registered bars

| # | Bar | GO threshold |
|---|---|---|
| 1 | PRIMARY — doors entered, armed vs baseline | ≥3/8 armed, 0/8 baseline; every entered door is feared or witness (assigned rotation; fallback only if assigned not offered/earned); every entered door reaches a resolution (win or honest downgrade) |
| 2 | SUBSTRATE SANITY — the sit substrate still sits | baseline earns lesser ≥3/8 AND sits ≥3/8 |
| 3 | SUBSTRATE GUARD — per-seed exact reproduction | ≥6/8 seeds satisfy their clause (never-entered: whole-run exact; entered: pre-entry daily rows exact) |
| 4 | COST — starvation | armed ≤ baseline + 2 total AND arm-only ≤ 2 |
| 5 | COST — survival non-inferiority (REVISED — see metric review) | 0 violations: every non-won armed seed's days ≥ its baseline pair's days; won seeds count as success |
| 6 | SENSE-TEST — full transcript read per walked door | every walked door's beats + final read as that door's game (feared: terror/horror tension visible; witness: charges + testimony visible); branch lines ledger-true; no verbatim-repeat stutter, no unanswered modal |

Bar 5 is the revision the doorwalk metric review proposed (per-seed non-inferiority, or wins counted at horizon) — the frozen doorwalk header's non-won median compares different populations once wins exist and is defective. This run judges under the revision, stated here before any judged computation. No other bar changes.

## Stage plan

- **Stage 0 — smoke (proof live legs):** the proof runs the driver on 53001 (no-seat structural check) and on a sitting seed (initially 53005 — sat under winseek on master 8cee6a8d2, the closest known sitter; the doorwalk substrate may differ). If 53005 does not sit under this substrate, the proof's live leg is re-pointed at a seed that does sit on THIS run's baseline leg and the re-point is recorded here as Correction 1 before the armed leg is judged (the sitdrive-rebaseline precedent: re-pointing is a correction, never a weakening).
- **Stage 1 — pilot:** 8 seeds, both legs, judged by the bars above.
- **Stage 2 — confirm (pilot GO only):** fresh band 53201–53212 (the doorwalk confirm band, freshness-checked 2026-11-07; re-check before use), 12 seeds, balanced panel (§15) + recorder corpora.

## Metric review (pre-written)

- The primary metric counts entered doors among reachable seeds; the reachable set is re-derived from this run's baseline leg (procedure above), exactly as sitdrive-b/sitdrive-rebaseline-b did. A 1-seed reachable set would make the pilot primary thin — the confirm on 12 fresh seeds is then the second leg, and the two legs must agree.
- The win is not the judged metric (same as sitdrive-b): wins downstream of sits are reported honestly, never smuggled in as a second primary. Whether first-option door play should be able to win is a design question, already filed as a Steve-call — this run's sense-test (bar 6) is the evidence for it, not a re-score.
- The panel contract carries no door mapping (doorwalk precedent) — entry is judged from the analyzer, as here. The panel covers national/table/wins/cost series.
- Day-field note: the driver's stdout `days` and the corpora's `gameDays` can differ by one day (daily-row count vs game clock); the analyzer judges both legs on the same field.

## Convergence state

**scale-onramp / winnability chain: converging, NOT converged.** The chain runs end to end through a won lesser seat (doorwalk-b 5/5). What remains: national 0/8, full seat 0/8, un-walked doors (feared, witness, dark, trial). This run closes the feared/witness coverage; dark and trial stay open by design (ledger-earned branch; opt-in trial).
