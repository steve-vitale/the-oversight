# sim-strandbank-b — PRE-REGISTRATION (binding, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-strandbank-b, axis food-economy.
Worktree sim-strandbank-b. DIAG ONLY (measurement): zero src/js changes,
zero policy-default flips, zero edits to any existing policy file or
existing script. New files only: this prereg, one stdout-runner, one
splitter, one analyzer, one proof test, the evidence file, and the
sweep corpora. Sibling trees never touched; main tree never touched.
The coordinator merges; this worker does NOT push, bump, or verify live.

## Order from the 1430Z round headline (binding on this arm)

Evidence evidence/2026-10-31/sim-food-economy-round-1430-b.md orders:
the NEXT STRAND ARM MUST RE-DERIVE THE STRAND SET ON CURRENT MASTER
FIRST, sweeping wider than the 8-seed band (the 10-seed bank, then
fresh seeds), before ANY judging. The old strand set (15215 guard
[7,8,9] / ON [7..16]) is VOID: lootabilities w2+w3 re-rolled the shared
RNG stream, and on current master the vessel never leaves haven on the
old band. This arm is that re-derivation. It judges NO lever. No
strand-dependent lever's confirm may be planned off any set this arm
does not publish.

## Canon read before designing

docs/CANON.md first, then the strand census's standing definitions in
evidence/2026-10-31/sim-fedevening-b-prereg.md (census definitions
below are copied from there, not re-invented) and the mechanism-class
finding in evidence/2026-10-31/sim-fedevening-b.md (THE DRIFT, WHY THE
STRAND MOVED, metric review), plus the 1430Z round headline above.
docs/TIME-ECONOMY.md (one clock; ticks/day-parts) and docs/PRESERVATION.md
(the ladder; unknown food is not food until identified) were read for
the strand program's background; no canon doc covers the strand set
itself — it is a measured property of a base + policy stack, not canon.
Standing rules that bear on it: perception law (the census reads only
the vessel's own evening records — its tile, its pack, its woodcarry
bucket — never a roster) and "if you don't know, it doesn't show"
(nothing here reveals anything to the player).

## Prior evidence read in full before designing anything

- evidence/2026-10-31/sim-fedevening-b.md + sim-fedevening-b-prereg.md
  (DIAG substrate-void: 15215 guard [] / ON [] on base 19b3e1ae0;
  26 legs, 0 creek evenings, all stay-home; strand seeds are
  RNG-stream-fragile, not seed-pinned; branch-fire design carried
  forward UNTESTED).
- evidence/2026-10-31/sim-food-economy-round-1430-b.md (round headline
  quoted above; axefirst confirm control: 16 seeds, 0 still creek
  evenings; corpsemove: bearer-death trajectory void on its base).
- evidence/2026-10-31/sim-windowcarry-b.md (the last base on which the
  old strand set was re-derived: 15215 guard [7,8,9] / ON [7..16]).

## Pinned base

Base commit f536e3ad3 — the worktree HEAD and the main-tree HEAD at
prereg writing time (verified equal before this commit). All legs run
on this base. Later commits on this branch add ONLY evidence files and
new scripts/ files; the diff guard in the proof test asserts
`git diff --name-only <pinned-base> -- src/ scripts/policies/` is EMPTY
at evidence time, so the game + policy code under measurement is the
pinned base throughout.

## Substrate (asserted FATAL in the driver, verbatim from the prior arms)

POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, WOODCARRY=1, WOODWARM=0 (guard) / 1 (ON), DAYS=30,
MORNINGCARRY, WINDOWCARRY, STRANDFIX, PRESSB all unset/0 (each FATAL
if 1). FEDEVENING unset (the fedevening policy is not in this stack;
the morningcarry driver composes withWoodwarm(withWoodcarry(
nighttravel)) only). This is the control stack every prior strand arm
measured — no variant, no probe, nothing that moves the trajectory.

## Base-equality check (BEFORE any judged leg; NOT a judged leg)

Run the PRIOR instrument VERBATIM — scripts/morningcarry-trace-b.js,
unmodified, in its file-writing mode — for seed 15215, guard + ON legs,
into evidence/2026-10-31/sim-strandbank-b-basecheck-guard and
sim-strandbank-b-basecheck-on. Compare against the fedevening
drift-check corpora (evidence/2026-10-31/sim-fedevening-b-driftcheck-guard
and -on, same driver, same seed, base 19b3e1ae0): report creek/still/
rescued counts per leg and whether the evening-outcome sequences
match. The check's purpose is instrument verification on the new base
(the driver still runs clean, errs 0) plus a drift data point (does
15215 stay home on f536e3ad3 as it did on 19b3e1ae0, or move again?).
It does NOT judge anything and its corpora are NEVER mixed into the
sweep census. If the verbatim file mode is EPERM-blocked, the check is
run through the stdout-runner instead and the substitution is disclosed
in the evidence file with the runner-equivalence proof (below) as the
bridge — the check is then instrument-verification-by-equivalent, not
verbatim, and is labeled as such.

## Instrument adaptation (proof-tested, not assumed)

The judged legs run through a stdout-runner adaptation, because
game-loaded processes cannot reliably write files (EPERM flap; the
windowcarry precedent: a game-loaded driver's post-sim writes fail
while a fresh process succeeds, and its frozen-clock sleeps never
elapse). The adaptation reuses scripts/morningcarry-trace-b.js
VERBATIM except main(): scripts/strandbank-stdout-runner-b.js loads
the driver source, replaces main() with a stdout emitter (one JSON
line per seed; summaries to stderr), following the proven
scripts/windowcarry-stdout-runner-b.js pattern. Transport: the runner's
stdout is redirected to a .jsonl file in evidence/ by a foreground
exec (never a backgrounded pipe), then split by an idle process,
scripts/split-strandbank2-jsonl-b.js (stdin jsonl -> one file per
seed; every line parsed, every file read back and re-parsed), into
the corpus dirs. Judged corpora are NEVER staged in /tmp (sibling
cleanup wipe rule).

Proof-test of the adaptation (scripts/test-strandbank2-b.js, before
any judged leg is quoted): (a) pure checks on the analyzer's census
and strand-run functions (synthetic evening sequences, including
consecutive-run breaks, rescued interleaves, and non-creek buckets);
(b) pure checks on the splitter (synthetic jsonl round-trip, bad-line
rejection); (c) RUNNER EQUIVALENCE: the stdout-runner legs for 15215
guard+ON must deep-equal the basecheck legs (evenings, mornings,
nights, errs, daysAlive, endReason) — same driver, same base, same
seed, only the transport differs; any difference is an instrument
failure and the sweep does not start. (d) DETERMINISM: the ON sweep
leg re-run must be byte-identical to the sweep ON corpus.

## Census definitions (verbatim from the fedevening prereg)

- still = woodcarry bucket creek + rescued false.
- rescued = woodcarry bucket creek + rescued true.
- creek = still + rescued (every woodcarry-bucket-creek evening).
- strand = maximal run of still evenings on consecutive loop-days.
- A seed's strand set = its strand runs, per leg (guard and ON
  reported separately, never pooled).
- Vessel-at-haven check: an evening with inside true / tile haven is
  not a creek evening under any definition.

## Staging

- BASECHECK (instrument verification, never judged): 15215 guard+ON,
  verbatim driver (see above).
- STAGE 1 — SWEEP (judged census): the 10-seed bank (15003, 15009,
  15091, 15211, 15215, 15220, 15221, 15337, 15376, 15439), 30d,
  guard + ON legs (20 legs), ALL LEGS FRESH (no inherited data from
  any prior arm, including the 2026-10-30 strandbank corpora, which
  were measured on an older base). Plus the determinism re-run of
  the ON leg (10 legs, byte-identical required).
- STAGE 2 — ONLY if stage 1 yields 0 strands (0 still-creek evenings
  on all 20 legs, i.e. no strand run on any seed on either leg):
  8 fresh seeds, stated here in advance: 16501, 16502, 16503, 16504,
  16505, 16506, 16507, 16508, guard + ON legs (16 legs), all fresh.
  Stage 2 does NOT run if stage 1 yields >= 1 strand — the set is
  already re-derived, and wider sweeping is the next arm's work,
  not this census's.
- No confirm band, no lever legs, no variant legs exist in this arm.
  There is nothing to confirm: the output is a census, not a verdict
  on a mechanism.

## Pre-registered decision rule (binding, §14 — this is a census DIAG)

- If >= 1 seed shows >= 1 still-creek evening on either leg: PUBLISH
  the re-pinned strand set (seed + guard/ON still runs, derived from
  the sweep corpora by the analyzer, never hand-typed) and state
  which food-economy blanks reopen (the fedevening branch-fire design
  and the axefirst joint proof are the named candidates; the evidence
  file names exactly which blanks the published set re-opens and
  which stay parked). Verdict: STRAND SET RE-DERIVED.
- If 0 still-creek evenings on the whole swept width (stage 1, plus
  stage 2 if it ran): verdict is SUBSTRATE-MISSING STANDS — strand
  arms stay parked — and the evidence file reports the sweep width
  (seeds x legs) as the finding. Never re-score a miss against a
  friendlier metric: a looser definition (e.g. "slept away, any
  cause") may be REPORTED as a secondary count, but it cannot turn
  a 0-strand census into a published set, and it cannot be adopted
  as the strand definition mid-run. Metric doubts go under "metric
  review" for the next run.
- Instrument failure (driver errs > 0 on a judged leg, runner
  non-equivalence, determinism mismatch, missing seed file) voids
  that leg, not the census: the leg is re-run fresh, and if it cannot
  be made clean the evidence file says so and the census reports the
  clean-leg width honestly.

## Horizon + why (death-aware, never a fixed 200d by default)

DAYS=30, death-aware: the harness stops at Game.over (dead villages
stop simulating; the +10d tail is the harness's own end handling).
30 days covers the whole old strand (guard nights 7-9, ON nights
7-16, plus tail) and matches every prior strand arm's census window,
so counts compare exactly. A 150-day panel would measure a different
question on a different substrate and cannot express this stack (see
§15 below). Wall numbers (national/table/wins) are NOT observable on
a 30d pre-seat census and will be reported as such, not fabricated.

## SENSE TEST (law)

If the sweep finds strand days, sense-read them end to end: the
departure evening, the still evenings, the rescue or the tail —
transcripts, dialogue, meaning, coherence. The village assessment in
the evidence file is written in plain words from those readings, not
from counts alone. If the sweep finds no strand days, the sense-read
covers the stay-home evenings on the bank's anchor seed (15215) and
states plainly that there are no strand days to sense-read — the same
honest limit the fedevening arm recorded.

## §15 panel (non-applicability declaration, made before judged legs)

scripts/balance-panel.js runs sweep-compare registry policies on
150-day horizons with its own scorecard and observer contract. It
cannot express the nighttravel+woodcarry+woodwarm strand stack, the
30-day creek-evening census, or a control-stack census with no
variant — the same declaration every prior strand arm made. No panel
result is fabricated; the panel tool is not invoked on this corpus.
The comparison here is the census itself (guard vs ON legs on
identical seeds through the census analyzer), never labeled a panel
comparison. No compare .md is produced: there is no paired
before/after to compare, only a re-derived set.

## Metric review (carried in the evidence file; revisions apply to the
NEXT run, never mid-run)

Open questions noted before any judged leg, not resolved by re-scoring:
- Whether "slept away, any cause, wood < 4" should become the strand
  definition (axefirst's metric-review question): NOT adopted here;
  reported only as a secondary count if the primary census is 0.
- Whether strand arms should judge on a FROZEN stream (pinned base +
  pinned policy set) rather than current master: a coordinator/Steve
  decision, not a worker call — this arm's contribution is the
  re-derived set on the pinned base, which is exactly what a frozen
  stream would need as its starting point.
- Whether the stay-home trajectory itself is a bug or a legitimate
  routine outcome (fedevening's doubt 3): NOT judged here; if the
  sweep is 0 again, the doubt strengthens and is carried forward
  with the wider sweep width as new evidence.
- Whether the exact RNG draw that moved the old strand should be
  bisected: NOT done here (a census arm does not bisect); the two
  candidate landings (lootabilities w2 field-fight ability coverage,
  w3 villager self-craft) are named, not claimed.
