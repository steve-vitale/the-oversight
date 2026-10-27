# sim-diverge73677-a — PRE-REGISTRATION (binding, written BEFORE sweeping)

Run: fleshout loop, arm `sim-diverge73677-a`, axis scale-onramp.
DIAG / MEASUREMENT ONLY: zero `src/js` changes, no default flips, no
game lever proposed, no narration/voice fix proposed from this arm.
At most, the evidence file may carry a future-fix specification line,
marked as specification only (a narration/voice fix needs Steve's
ruling; it is not proposed here).

Canon read first: `docs/CANON.md`. No canon doc covers this target
(narration-mode trajectory divergence is an instrument question, not
a game system); no canon is invented here. `docs/SIMULATING.md` read;
sims run through `scripts/sim-harness.js` (never copied eval
boilerplate), proof scripts live in `scripts/` with distinct names,
no hardcoded absolute paths.

## Background (read before sweeping; NOT re-judged here)

From `evidence/2026-10-27/sim-raidtrace-a.md` ("Transcript vs census")
and its prereg, plus `evidence/2026-10-26/sim-seq51gap-a.md` (census
substrate):

- Substrate: `scripts/policies/tableseat-nowait.js` (wraps
  `leanlinkrescue`; composed upon, never edited), seeds 73671–73678,
  180-day death-aware horizon.
- Census corpus (narration-off): the seq51gap-a sweep reused verbatim
  (five w4dmg-a recorders + seq51gap-diag daily tick). Seed 73677:
  **152d / 41 deaths / 0 walls**.
- Transcript corpus (narration-on replay, emit-wrapper recorder):
  same seed: **168d / 44 deaths / 2 walls** (seq35 d155, seq39 d168).
- All other 7 seeds match the census exactly (days, deaths, walls).
- The hypothesis in raidtrace (NOT a finding) is that live `say` /
  `sysSay` fill `Game.log` (capped at 40) and System-voice paths that
  are no-ops in census mode, and some log-dependent read downstream
  amplifies the difference. The emit wrapper itself is proven neutral
  WITHIN narration-on by raidtrace's det-gate — that does NOT prove
  narration-on vs narration-off neutrality.
- This arm does NOT re-judge the raidtrace verdict (transcript
  denominator, 16 walls, toll-quantified 0/16) and does NOT substitute
  the friendlier count. The raidtrace verdict stands as written.

## Question

Does the 73677 divergence reproduce, and what attributes it?

## Verdict denominator (pre-registered)

The comparison is between exactly two corpora, both on the raidtrace
substrate (tableseat-nowait, 180d death-aware, seed 73677 only):

- **Census-armed (A)**: narration-off, seq51gap-a armed recorders
  verbatim (`scripts/test-seq51gap-diag-sweep.js --one armed 73677`,
  EVID redirected to `evidence/2026-10-27/perseed-diverge73677-a/`).
- **Transcript-armed (B)**: narration-on, same armed recorders PLUS
  the raidtrace-diag emit recorder verbatim
  (`scripts/test-raidtrace-a-sweep.js --transcript 73677`, same EVID).

No other corpus counts toward the verdict. New attribution runs (C, D
below) are judged only as bisections of the A-vs-B difference, never
as replacement denominators.

## Arms (in order; each step gates the next)

### 1. REPRODUCE

Re-run seed 73677 fresh on the current worktree base: one A run and
one B run, via the verbatim scripts above. Record days / deaths /
walls for each (walls = C2-palisade-wall + C2?-wall-amount-only steps
from `traceSeq` on the run's own armed row, exactly as raidtrace
counted). If either fails to reproduce its raidtrace value, that IS
a result: report it, do not re-run hoping for the old numbers (the
repeat runs in arm 2 are the only further runs on that question, and
they are reported as repeats, not as a hunt for the old value).

### 2. DETERMINISM

Repeat each mode at least twice more (same seed, same config, same
verbatim scripts; per-rep copies kept as
`s73677-census-rep<N>.json` / `s73677-transcript-rep<N>.json` so no
rep overwrites another). That is 3 runs per mode total (arm 1 + 2
repeats). If repeats within a mode disagree on days / deaths / walls,
the attribution is nondeterminism / run-to-run variance, not
narration: name it, quantify it (which field varied, by how much,
across how many reps), and STOP there — arm 3 does not run, and the
verdict is decided by the GO bar below (quantified nondeterminism
with repeat counts IS a named mechanism for GO purposes).

### 3. ATTRIBUTION (only if both modes reproduce deterministically and still diverge)

Bisect the narration difference with the smallest toggles
constructible WITHOUT changing game code. New recorder only, distinct
name (`scripts/policies/diverge73677-diag.js`; existing recorders
never edited; new sweep `scripts/test-diverge73677-a-sweep.js`):

- **C — narration-on + emit-suppressed**: narration-on, same armed
  recorders + raidtrace recorder + diverge recorder installed
  OUTERMOST on `Game.emit`. The diverge wrapper records every emit
  line (its own full-line capture, day + sequence index) and does NOT
  call the original emit: `Game.log` never fills, emit's harness-clock
  call is never consumed, but `say` / `sysSay` themselves still
  execute (including their pre-emit logic, the feel `say` wrap, and
  `sysSay`'s System-voice lookup). One run, then repeats only if C
  matches neither A nor B and a second rep is needed to rule out a
  fluke (reported as such, not as a hunt).
- **D — narration-on + emit-then-clear**: narration-on, same stack,
  diverge wrapper records every line, calls the original emit, then
  truncates `Game.log` to length 0. `say` / `sysSay` execute, emit's
  harness-clock call IS consumed, but `Game.log` never accumulates
  across emits (dedup never sees a prior line, `fbMarkIdx` comparisons
  always see an empty log, save snapshots carry an empty log tail).
- **First-divergence day** (computed by `--diff` over the A and B
  rows, before any C/D interpretation): the earliest scholar day on
  which the A and B rows differ in any of (a) seq51gap tick rows for
  that day (entity set / hp / tile / lingering / `lingerSince` /
  `lastRaidDay` / `havenTier`), (b) that day's wave-4 field-fight /
  tb-start rows, or (c) that day's kill-log entries. Tick day-jumps
  (harness day-jumps, days with no tick) are compared by day key,
  never by row index, and are listed, not counted as divergence.
  The C/D emit captures are then read only in the window from the
  first-divergence day backward to the previous matching tick day:
  the candidate call sites are the `say` / `sysSay` lines (via the
  diverge capture's text + surface + day) emitted in that window
  that a log-dependent read could plausibly consume. A call site is
  NAMED only if a code path reading `Game.log` (or a value emit
  writes: log length, last line, log entry timestamps) is shown by
  grep + the window evidence to be reachable from that window. If no
  such site is found, the report says "mechanism unlocated" with the
  divergence day and the excluded sites — no site is invented.

Pre-registered interpretation table for C/D (judged as written, never
re-scored mid-run):

| C result | D result | Attribution |
|----------|----------|-------------|
| == A | == A | Log accumulation/content is causal (both C and D keep the log empty; neither clock consumption nor say-execution reproduces B). Named mechanism: a Game.log-dependent read — the specific read must still be named from the window evidence, else "mechanism unlocated (log-accumulation class)". |
| == B | == B | Say/sysSay execution (non-log) is causal (C removes log AND clock yet still reproduces B). Named mechanism must still be a specific execution side effect shown in the window, else "mechanism unlocated (execution class)". |
| == A | == B | Harness-clock consumption by emit is causal (D restores the clock call, C does not; log stays empty in both). Named mechanism: the Date.now() call inside emit shifting later Date.now()-derived IDs — the specific ID consumer must still be named from the window evidence, else "mechanism unlocated (clock class)". |
| == B | == A | Contradiction: no single-factor reading of this table explains it. Report as "mechanism unlocated (contradictory bisection)" with both numbers; do not force a class. |
| neither A nor B (either arm) | — | Interaction or new trajectory: report the new numbers, repeat that arm once to rule out a fluke, and report "mechanism unlocated (interaction/new trajectory)" if the repeat agrees. |

"== A" / "== B" means identical days / deaths / walls to that
corpus's reproduced values (arm 1 values, which must equal the
raidtrace values for this table to apply at all; if arm 1 did not
reproduce, the table does not apply and the verdict is decided by
the GO bar's "does not reproduce" branch).

Static exclusions already established by code reading (recorded here
so arm 3 does not re-claim them as findings; they are exclusions, not
attribution):

- `sayGated` counters (`_sayGate`) increment identically in both
  modes (the increment precedes the `say` call), and no reader other
  than `sayGated` itself exists.
- The feel.js `say` wrap writes `f._feel` only, which no game code
  reads (grep: write-only).
- `feedbackMark` / `feedbackLines` are called only by `app.js`
  (excluded from node) and by test scripts, never by game code or by
  these policies; the encounters `say` feedback-surface tag is a
  surface tag, not a branch.
- `sysSay`'s voice lookup (`systemVoiceIdFor` / `playSystemLine`)
  is fire-and-forget async and returns no value to game logic; the
  manifest is not loaded at run start, so the lookup returns null
  until/unless a manifest fetch resolves mid-run (noted as a
  residual, not an exclusion, for the window read).
- `pickFresh` / `rotLine` line selection runs identically in both
  modes (selection precedes the `say` call; `rotLine` draws no RNG).

## DIAG-GO threshold (binding — judge against this header)

DIAG-GO iff the divergence is attributed to a NAMED mechanism (a
specific flag, call site, log read, or a quantified nondeterminism)
with the first-divergence day and repeat counts shown. Otherwise
DIAG-NO-GO — including "does not reproduce" and "mechanism
unlocated". A GO here means the attribution is proven, NOT that any
game change is approved. A miss is NO-GO, never re-scored against a
friendlier metric mid-run.

## Horizon, seeds, and expansion rule

Seed 73677 only for the attribution arms. The other 7 seeds are
already proven matching in raidtrace; no fresh 8-seed band is run.
EXCEPTION (pre-registered now): if arm 2 shows within-mode variance
(nondeterminism), a band expansion may be run to quantify variance
— but only after writing that expansion into this prereg (amendment
with its own bar) BEFORE running it. No expansion runs without that
amendment.

## Metric review (for the NEXT run; pre-registration is never re-scored)

This section is completed in the final evidence file, not here. The
final evidence file carries a "metric review" section (§14) covering:
whether days/deaths/walls is a sufficient trajectory fingerprint
(vs tick-level equality), whether the C/D interpretation table's
classes were sufficient, and any instrument error found in the
diverge recorder or the `--diff` analyzer. A miss is NO-GO, never
re-scored mid-run.

## Files (this arm; all under the worktree)

- `evidence/2026-10-27/sim-diverge73677-a-prereg.md` (this file)
- `evidence/2026-10-27/sim-diverge73677-a.md` (final evidence)
- `evidence/2026-10-27/perseed-diverge73677-a/` (per-seed corpus
  rows, rep copies, C/D emit captures, diff output — never /tmp,
  never another run's live filenames)
- `scripts/policies/diverge73677-diag.js` (new recorder only)
- `scripts/test-diverge73677-a-sweep.js` (new sweep + `--diff` +
  `--compare` analyzer)
- `scripts/test-diverge73677-a.js` (proof validator)

## Needs-eyes

No. Measurement-only arm; nothing changed that Steve should
playtest. No `[needs-eyes]` in any commit message from this arm.
