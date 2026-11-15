# sim-succpolity-b — SUCCPOLITY / SUCCGRACE against the hold

Run: fleshout-loop-b-20261114T2345Z, arm sim-succpolity-b, branch `sim-succpolity-b`.
Prereg: `evidence/2026-11-14/sim-succpolity-b-prereg.md` (commit 8e9379a01, binding).
Status: **STOPPED at the REPRO GATE — 5 of 6 baseline cells reproduce; 1 does not.
No judged leg was run.** This file records the gate outcome, the diff, and the
diagnosis, so the coordinator can decide the next step (re-baseline the one
cell on current HEAD, or another route). Nothing below is a leg verdict.

## What was supposed to happen

The hold: realms dissolve after the court — 7 dissolutions in the
answercourt-confirm band (seeds 100201–100216, 150d), 2 never re-climbed
(100203, 100212). The levers (both already in `src/js/hierarchy.js`, default
OFF, env-gated, zero src/js changes for this arm):

- `SUCCPOLITY=1` — a 14-day proving window that reads inherited standing
  instead of the funeral hour's shaken trust.
- `SUCCGRACE=1` — an answerable renegotiation beat for sub-bar links at
  succession instead of the silent verdict (answered by the succpolity policy
  with a gift; the baseline answercourt policy does not answer renegotiation
  beats).

Baseline: the committed answercourt-confirm corpus
(`evidence/2026-11-14/perseed-answercourt-confirm-b/`, anchor
`b3de4e512cf003e4004d7254431146ead1195039`, 2026-11-14 20:58:35Z), armed leg.

## REPRO GATE (binding, prereg §"REPRO GATE")

Re-ran baseline seeds 100201, 100203, 100208 × both policies (6 cells),
env defaults, driver `scripts/succpolity-driver-20261114.js`, RUN=`repro`,
OUTDIR `perseed-succpolity-b-repro`, compared with
`scripts/compare-succpolity-repro.js` (field-for-field modulo `anchorCommit`,
`run`, `arm`, `env`, additive `dissolutionLines`, additive `prSg`).

Result: **5 PASS, 1 FAIL — gate FAILS.**

| seed | policy | result |
|------|--------|--------|
| 100201 | competent-scaleclimb-b | **FAIL — days 124 (corpus) vs 143 (repro)** |
| 100201 | competent-answercourt-b | PASS |
| 100203 | competent-scaleclimb-b | PASS |
| 100203 | competent-answercourt-b | PASS |
| 100208 | competent-scaleclimb-b | PASS |
| 100208 | competent-answercourt-b | PASS |

Per the prereg: **STOP, report the diff to the coordinator, do not
re-baseline, do not run judged legs.** That is what happened. No pilot leg
(a), (b), or (c) was run. No leg verdict exists.

## The diff (seed 100201, competent-scaleclimb-b)

Both runs end `village-lost`, scale `regional`, maxWave 4, standing 199.
The series is **identical through day 96** (scale, wave kills, pantry,
population, deaths, link roll, policy events).

First divergence — series day 97:

- wave kills: corpus `{"1":30,"2":13,"3":4}` vs repro `{"1":30,"2":14,"3":4}`
  — the repro party killed **one more wave-2 monster** in a wild fight.
- pantry: corpus 6,871 kcal vs repro 6,750 kcal (121 kcal more spent).
- deaths: corpus has Yuki Mori dying day 97 ("a stranger"); repro has Yuki
  Mori dying day 98 ("a stranger"), plus a paparazzo kill day 97 and an
  alien-tick kill day 98.
- downstream: corpus village-lost day 124 (68 deaths, 1 starvation); repro
  village-lost day 143 (75 deaths). The village survives 19 days longer
  because that one day-97 fight went the other way.

Policy behaviour is **byte-identical** in both files: same 3 proposes
(accepted), same 3 accord-answers (gift), same 17 tends, same tend kcal
(25,500). The capSummary differences (`proposeBlockedPending` 63 vs 81,
`nationalPendingDays` 63 vs 81, `tendsBlockedPantry` 35 vs 29) are
consequences of the longer run, not causes. The divergence is in **fight
outcomes only**, not in policy, diplomacy, or succession handling.

## Diagnosis: the known src/js delta since the corpus anchor

The brief's "zero src/js behavior changes since that corpus" is **false**
(established in the prereg): `git diff b3de4e512..HEAD -- src/js/` is
`build.js` (version stamp only) + `game.js` (17 lines) + `partyTactics.js`
(73 lines) — the **Reunion ARENA balance** (Steve-ordered 2026-11-14: arena
Reunion HP ×0.4, damage ×0.6 via per-fight clone; arena mirror cap 1),
gated on `state.arenaContest` at `startCombat` entry. Field fights and wild
Reunion keep the full def. Corpus anchor `b3de4e512` is **not an ancestor**
of HEAD `910bff7f4`.

The day-97 divergence sits **two days after a day-95 arena fight** in this
seed: the deaths list records a villager (gen_wyi1ppj) dying "the arena" on
day 95 in both runs, wave kills tick wave-1 29→30 and wave-2 12→13 that day,
and day 95 is also a succession day (Simone dies; the mantle passes to
Yuki — "Simone is dead — and the dead hold no treaties. Every link Haven
has shakes."). The day-95 arena deaths are identical in both runs, but the
survivors' wounds are not in the series snapshot — a weaker arena Reunion
under the new balance leaves the party in a different state, and the next
wild fight (day 97) plays out differently. That is the consistent
explanation; it is **not proven at the code level** (the arena fight's
composition is not recorded in the per-seed file — the 600-line episode ring
holds only the tail, and the Reunion mentions in both files are identical
wild-lingering "gorges at the treeline" lines on days 47–52, not an arena
fight).

What rules out a harness/determinism fault: 5 of 6 cells reproduce
field-for-field over 122–150 days each, including both policies on 100203
and 100208 and the armed policy on 100201. A flaky RNG or a driver
transcription error would scramble cells broadly, not one fight on one day
in one cell. The driver and policies are byte-identical recoveries (hashes
verified in the prereg).

## Analyzer validation (independent of the gate)

`scripts/analyze-succpolity-b.js` run against the corpus as its own
baseline reproduces the holdrealm numbers exactly (baseline wall):
national ever 13/16, at end 8/16, table 0, wins 0, wave 4 16/16, wave 5
8/16, median survival 121.5d, dissolutions 7, reclimbs 2, starvation 6,
total deaths 1225. Dissolutions found: 100203 d90 (speaker-death),
100204 d139, 100206 d134, 100208 d101 (reclimb), 100211 d107 (reclimb),
100212 d142, 100216 d97 — matching holdrealm. The analyzer is trustworthy;
the gate failure is in the game, not the instrument.
Output: `evidence/2026-11-14/succpolity-b-analysis.json` (baseline section;
its "leg" section is the corpus compared against itself and is not a leg
verdict — ignore it).

## Proof tests

`scripts/test-succpolity-b-20261114.js`: §1 static **67/67 green**;
§2 game **16/16 green** (60d smoke on seed 100201, both policies, env flags
on; 59 series days each, dip=102, 0 instrument errors). Re-run after the
analyzer main-block edit (summary-first, flap-tolerant write) — still green.

## What is committed (branch sim-succpolity-b)

- `evidence/2026-11-14/sim-succpolity-b-prereg.md` (8e9379a01)
- Instrument (069610bba): recovered policies byte-identical, succpolity
  policy, driver, analyzer, panel builder, proof test.
- This stage (to commit): repro corpus
  `evidence/2026-11-14/perseed-succpolity-b-repro/` (6 files),
  `scripts/compare-succpolity-repro.js`, analyzer main-block fix, analysis
  JSON, this evidence file.

## Infrastructure notes

- The host write flap was active through the repro runs: one cell's file
  write fell back to stdout twice (100201 scaleclimb in the first sweep —
  lost to a truncated pipe, re-run clean; 100203 answercourt in the second
  sweep — re-run clean). All 6 repro files are now on disk, verified valid
  JSON. The driver/analyzer write-robust fallback (tmp file + rename, 480
  retries, stdout fallback) worked as designed; the 0-byte `.tmp` files are
  the flap's signature (write() refused, not rename).
- safe-commit.sh's mass-deletion guard refused the instrument commit once
  (458 files, 288,921 deleted lines in src/) on a flap-damaged private
  index; the guard computation verified clean (0 deleted lines) when re-run
  directly, and the retry landed (069610bba). The guard did its job; no
  `--force-delete` was used. Index clobber struck after that commit
  (repaired with the documented `ls-tree -r | update-index --add
  --index-info` pipe).

## Metric review

No metric revision is proposed. The gate did what it was for: it caught a
real baseline drift (one cell's fight outcomes moved with the Reunion
arena balance) before any judged leg spent the corpus's authority. The
dissolution metric itself was not exercised — no leg ran. If the coordinator
re-baselines, the natural unit is the single drifted cell (100201
scaleclimb on current HEAD), not a fresh corpus: 5 of 6 cells are already
proven stable, and the drift is confined to fight outcomes downstream of
an arena fight, not to the succession/diplomacy machinery the levers touch.

## Open question for the coordinator

1. Re-baseline the one drifted cell (100201 scaleclimb) on current HEAD and
   proceed with the pilot legs against the mixed baseline (5 corpus cells +
   1 fresh cell), or re-run the whole confirm band on HEAD, or hold the arm
   until the Reunion arena balance settles? Awaiting the call — **no judged
   leg will run until it comes.**


## Coordinator decision (Loop B coordinator, 2026-11-15, binding — recorded verbatim)

RE-BASELINE the single drifted cell (100201 scaleclimb) on current master and proceed with pilot legs (a)/(b)/(c) against the armed corpus leg. Rationale: the ARMED leg — the actual judge's baseline for G2 — reproduced 3/3 on the sampled cells; the drifted cell is a baseline-policy cell used for wall numbers only; the drift is a landed, Steve-ordered game change, not an instrument fault; re-running the full 16-seed band for a one-cell divergence would waste a band. GUARD: after rebasing the branch onto current master tip 3321c6546, re-run ALL 6 repro cells on the new tip first. If any ARMED cell now diverges, STOP and report (gate re-arms) — do not run judged legs. The fresh 100201-scaleclimb cell becomes the wall-number baseline for that cell only, labeled re-baselined in the evidence.
