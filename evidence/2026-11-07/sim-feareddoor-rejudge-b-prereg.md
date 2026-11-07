# sim-feareddoor-rejudge-b — prereg (re-judge the HELD feared-door arm under a revised metric)

**Arm:** sim-feareddoor-rejudge-b (run fleshout-loop-b-20261107T1830Z,
axis scale-onramp / winnability chain) · **Policy-side only, zero
src/js, zero default flips, no changes to any existing policy file.**
Adopts the HELD branch `sim-feareddoor-b` (1430Z run, held by the
1730Z coordinator: feared entered 5/5 and won 5/5, guard 12/12,
cost bar clean — judged NO-GO ONLY on the frozen "+2 more wins"
clause, which the 1730Z verdict and the frozen metric review both
establish as a metric defect, not a lever failure). **This run
re-judges that frozen verdict under a revised metric. NO NEW SIMS —
re-judgment on the frozen corpus only.** Nothing is re-run, nothing
is re-simulated; the only new computation is the analyzer re-run
below, on the frozen per-seed files.

## Canon

READ first: `docs/CANON.md`, then `docs/TABLE.md` (the endgame
Table — the seat, the seven doors, sanctity, the day-90 floor, the
sticky offer). **No canon is invented here.** The lever is
unchanged from the frozen prereg
(`evidence/2026-11-07/sim-feareddoor-b-prereg.md`, committed
a696d0178): the feared-first wrapper policy
(`scripts/policies/competent-feareddoor-b.js`, `FEAREDDOOR_B=1`,
default OFF) over the doorwalk rotation; the mechanism, drain
rule, and rotation are frozen and are NOT re-decided here.

## The frozen corpus (verified this run, before this prereg)

Band 53201–53212, horizon 150d death-aware, 12 files per leg,
all parse, 0 instrument errors on all 24 files:

- `evidence/2026-11-07/perseed-feareddoor-b-baseline/` — 12 files,
  per-seed `anchorCommit` 808515cb5a34 (the tooling commit)
- `evidence/2026-11-07/perseed-feareddoor-b-armed/` — 12 files,
  per-seed `anchorCommit` b8bbf538e416 (the prefix-shape fix)
- Branch base 660825ea2 (the doorwalk tip rebased onto
  cf22937b8); judged at branch tip 6e8b3e8f0.

**Base correction, recorded honestly:** the task brief for this
run names "judged base 4ce3c0c1f" — that is the
doorwalk-confirm base, not this corpus's base. This corpus was
judged on base 660825ea2 (see the frozen evidence file's Base
note and the per-seed `anchorCommit` values above, verified by
re-reading the files this run). The frozen numbers below are
the corpus's own, and the re-judge judges them, not the brief's
shorthand. No gap was found: 12+12 files, seeds 53201–53212
complete, per-seed days match the frozen evidence table
exactly (90/150/91/150/150/93/150/123/102/69/145/90 in both
legs).

**Frozen numbers under the old header (from
`evidence/2026-11-07/sim-feareddoor-b.md`, NOT re-scored
here):** feared entered 5/12 armed vs 0/12 baseline; feared
wins 5/12 armed vs 0/12 baseline; wins 5/12 both legs (the
baseline rotation won all five sat seeds); guard 12/12
per-seed exact; per-seed survival non-inferiority 12/12;
starvation 4 → 4; pair days 80 → 80; median survival 112.5d
→ 112.5d (all seeds, identical). The frozen NO-GO stands as
judged under the frozen header (§14 metric binding) — this
run does not rewrite it. This is a NEW judgment under a NEW
prereg, recorded in a NEW evidence file; the old verdict
stays on the record.

## Why the revision is honest (not re-scoring to win)

The frozen clause demanded armed wins ≥ baseline wins + 2
(7 on this band). The baseline rotation won all five sat
seeds, and the armed leg cannot differ before the sit (the
door drive fires only after a sit; guard 12/12 proves the
pre-sit trajectories identical), so armed wins are capped at
5 — the clause is unreachable by ANY door lever on this
band. It measured the substrate's headroom (zero unwon sat
seeds), not the lever. The revised metric judges the lever's
OWN contribution — feared wins armed vs feared wins
baseline — in the exact shape the doorwalk-confirm run
landed under (wins ≥4/12 AND margin ≥3; prereg ba1831626,
landed dbfcca9b3): a bar the lever must still clear, not a
lowered bar. The feared door's contribution on this corpus
is 5 vs 0 — a clean +5 — and the bar demands ≥4 with margin
≥3, so the judgment still has teeth: a lever that walked
feared 2/12 or won 1/12 would fail it.

## Primary metric (REVISED — from the 1730Z metric review)

**Feared wins at horizon: seats won through the feared door
/ 12. GO bar: feared wins ≥ 4/12 armed AND ≥ 3 more feared
wins than baseline on identical seeds.** "Feared win" = the
frozen analyzer's definition, unchanged: the seed ends
`won:true`, the first walked door was feared, no downgrade
ever fired, and a final was answered on feared (a downgrade
win counts for the seed's win total, not for the feared win
count). The baseline leg is expected to show feared wins
0/12 (the gate is OFF for feared in the baseline — the RED
pin, live; the rotation's only-feared fallback never fired,
as the frozen evidence records).

## Substrate sanity (unchanged from the frozen prereg)

The baseline leg must earn lesser seats on ≥ 4/12 seeds AND
sit on ≥ 4/12 seeds (frozen: 6/12 and 5/12 — the band
re-check passed in the frozen run and is not re-litigated
here; the corpus is frozen). If either failed, the run would
be NO-GO on substrate and the feared drive UNJUDGED — it
does not fail.

## Substrate guard (unchanged — 12/12)

Per-seed exact reproduction, pre-first-bind (the frozen
analyzer's guard, unchanged): seeds where neither leg ever
enters a door reproduce the baseline EXACTLY whole-run
(days, endReason, standing, maxWave, wave-4+ kills, final
seat); seeds where a door is entered reproduce the baseline
EXACTLY on every daily row BEFORE the earlier first-entry
day (the frozen prereg's field list). Guard passes iff
12/12 (frozen: 12/12). A guard miss names the seed and the
first differing field — it is an instrument/substrate signal,
not a lever verdict by itself, but the run is NO-GO if the
guard is not 12/12.

## Cost bar (REVISED — mirrors the doorwalk-confirm revised cost bar, plus a median tripwire)

- **Per-seed survival non-inferiority:** no seed dies
  earlier in the armed leg than its own baseline day. A won
  seed counts at the horizon (150d). Formally, for every
  seed: `(armed.won ? 150 : armed.days) >= baseline.days`.
  One violation fails the bar. (Frozen: 12/12.)
- **Starvation ≤ baseline + 2 total AND arm-only starvation
  0** — no seed starves in the armed leg that did not starve
  in its own baseline. (Frozen: 4 → 4, arm-only 0.)
- **Median survival armed ≥ 0.8× baseline median** (all
  seeds) — a gross-collapse tripwire, deliberately loose.
  (Frozen: 112.5d → 112.5d, ratio 1.0.)
- Pair days recorded, not gated. (Frozen: 80 → 80.)

A primary hit that breaches the cost bar is NO-GO. A win can
never breach the cost bar.

**Caveat on the median tripwire (for the metric review, not
a revision here):** the all-seed median still suffers the
win-truncation artifact the doorwalk-confirm run retired the
old median bar for — on a band where the baseline wins 0/12
and the armed leg wins 5/12 at d90, the armed median can
read ~0.75× baseline and trip this wire on a clean lever.
The 0.8× threshold is loose enough to pass this corpus
(ratio 1.0, both legs won the same five seats), and the
per-seed non-inferiority bar — not the median — is the real
cost judge. If a future arm trips only the median wire, the
metric review should say so and the per-seed bar should
govern.

## Secondaries (frozen from the frozen prereg)

Feared entered per seed (door, branch, day, feared-first vs
fallback, rule) / feared offered per seed / feared
offered-but-unwalked per seed (must be 0 in the armed leg —
frozen: 0/5) / doors offered per sat seed (names) / finals
reached / downgrades taken / conscript refusals / trial-only
skips / challenge beats answered / wins per leg, national,
wave 4–5 unlocks, median survival (all seeds, reported not
gated beyond the tripwire above), pair days, starvation
deaths per seed, feast surge + foodDeeds per seed, links
formed per seed, days the run continues after an entry
(modal-stall check), per-seed entry lag (sit day → entry
day, 0 by construction — verify it). Scale-wall numbers
(national / table-sat / wins, wave 4–5 unlocks, full seat,
median survival) reported every run.

## Judge

The run is judged against this header. A miss is NO-GO, never
re-scored against a friendlier metric mid-run. If a metric
proves wrong, write it under "metric review" and propose the
revision for the NEXT run. Every evidence file carries a
"metric review" section.

## Panel (§15)

Before/after through `scripts/balance-panel.js` — the
feareddoor panel builder
(`scripts/build-feareddoor-panels-20261107.js`) re-run on the
frozen corpus. The panel is the instrument, the pre-registered
threshold is the judge. The panel measures the neutral
before/after (survival, wins, rank, arc); the door metrics
come from this arm's own driver corpora. The frozen panel
already exists (`evidence/2026-11-07/feareddoor-panel.md`,
decision `review_required`, win rate 0.4167 → 0.4167) — the
re-judge re-attaches it, since the corpus is unchanged; if
the builder reproduces it byte-identically that is recorded,
and if the tooling refuses recorder-corpus input, that
refusal is recorded and the analyzer table is attached
instead. Telemetry deviation check:
`scripts/telemetry-check.js` REFUSES recorder-corpus input
by design (same refusal as doorwalk/takeseat/feareddoor
frozen) — record the refusal, no LOUD line expected; zero
src/js changed, so no Game-telemetry baseline exists to
deviate from.

## Tooling (new this run, committed with the re-judge)

- `scripts/feareddoor-rejudge-b-analyze-20261107.js` — the
  re-judge analyzer: reuses the frozen analyzer's per-seed
  analysis (`analyzeSeed`, `preEntryMatch`, `medianOf`,
  `starvation`, `effectiveDays`) by require, and judges the
  REVISED bars above (feared wins ≥4/12 AND margin ≥3;
  guard 12/12; per-seed non-inferiority; starvation ≤
  baseline+2 AND arm-only 0; median ≥0.8× baseline).
  Writes `/tmp/feareddoor-rejudge-b-analysis.json` (working
  copy; the evidence file is the record). The frozen
  analyzer is NOT edited — its verdict under the frozen
  header stands on the record.
- `scripts/test-feareddoor-rejudge-b-20261107.js` — the
  re-judge proof: fixtures pin the revised-bar logic
  (margin computation, guard/cost components, median
  ratio), plus a frozen-corpus leg that asserts the
  analyzer reproduces the frozen per-seed rows and the
  frozen numbers (feared wins 5 vs 0, guard 12/12,
  starvation 4→4) before judging them under the revised
  bars. Green BEFORE the evidence file is written.

## Proof (before the evidence file)

The re-judge proof above, green, before the evidence file
is written. The frozen proof
(`scripts/test-feareddoor-b-20261107.js`) is re-run on the
rebased tip after the rebase (see below); its known live
smoke leg fails on the collapsed frozen band 53001–53008
(`seatTaken` 0 vs 1, seed 53003) — recorded, NOT re-pinned,
NOT re-run to fix. check.js --quick NOT required: zero
src/js in this arm.

## Landing path (if GO)

Rebase the branch onto then-current master — re-read the
master SHA in the main tree immediately before rebasing
and rebase onto that explicit SHA (never a stale SHA).
Re-run the proof on the rebased tip. Report "ready to
land" with the tip SHA. Do NOT merge, do NOT push, do NOT
bump versions, do NOT verify live — the coordinator merges
--ff-only and the batch ship job owns pushes.

## Convergence state reported

converging | converged | parked | killed-at-pilot, per axis
scale-onramp.
