# sim-strandloss-b — PRE-REGISTRATION (binding, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-strandloss-b, axis food-economy.
Worktree sim-strandloss-b. DIAG ONLY (measurement): zero src/js changes,
zero policy-default flips, zero edits to any existing policy file or
existing script. New files only: this prereg, one proof test
(scripts/test-strandloss-b.js), the evidence file, run manifests, and
the leg corpora. Restorations below are measurement scaffolding inside
this worktree only — they are REVERTED before any commit; commit only
instruments + evidence + proof + corpora + manifests, never a restored
game file as a change. Sibling trees never touched; main tree never
touched. The coordinator merges; this worker does NOT push, bump, or
verify live.

## Canon read before designing

docs/CANON.md first, then docs/TIME-ECONOMY.md (one clock;
ticks/day-parts). No canon doc covers the departure gate itself —
stated here, not invented (departdiag-b said the same). The strand
set itself is a measured property of a base + policy stack, not
canon. Standing rules that bear on it: perception law (the census
reads only the vessel's own evening records — its tile, its pack,
its woodcarry bucket — never a roster) and "if you don't know, it
doesn't show" (nothing here reveals anything to the player).

## Prior evidence read in full before designing anything

- evidence/2026-10-31/sim-strandbank-b.md + sim-strandbank-b-prereg.md
  (SUBSTRATE-MISSING: 18 seeds, 36 legs, 0 strands on pinned base
  f536e3ad3; old set 15215 guard [7,8,9] / ON [7..16] now void;
  haven-checked census definitions; haven-bucket artifact 16506).
- evidence/2026-10-31/sim-departdiag-b.md (departure gate = return
  leg, return never fails; 0 overnight departures on 480 loop-days).
- evidence/2026-10-31/sim-food-economy-round-1430-b.md (headline:
  lootabilities w2+w3 landings re-rolled the shared RNG stream and
  voided the trajectory; seeded trajectories are BASE-PINNED).
- evidence/2026-10-31/sim-food-economy-round-1630-b.md (strandbank
  SUBSTRATE-MISSING, departdiag DIAG-GO, corpsehome DIAG-GO; no
  game change; food-economy stays converging).
- evidence/2026-10-31/sim-windowcarry-b.md + prereg (the last base
  on which the old strand set was re-derived as control: 15215
  guard [7,8,9] / ON [7..16]).

## Pinned base (this arm)

Base commit a3e57bfc17a95d90773634d24f7d39b8c34123c3 — the worktree
HEAD at prereg writing time. All legs run on this base except for
the single-file restorations named below (which change exactly one
game file each, reverted before commit). Later commits on this
branch add ONLY evidence files, new scripts/ files, and leg
corpora; the diff guard in the proof test asserts
`git diff --name-only <pinned-base> -- src/ scripts/policies/` is
EMPTY at evidence time, so no game or policy code ships as a
change from this arm.

## Bisection interval, enumerated via git log (NOT assumed)

Strand-era base: daabd0e2d33827763ed10d359eb3f081ea4ad3a5 — the
parent of the windowcarry prereg commit b57494997, i.e. the tree
whose game code windowcarry's control corpora measured (its control
strand set was exactly 15215 guard [7,8,9] / ON [7..16]).
Lootabilities w1 (59dddefc0) is an ancestor of daabd0e2d, so w1 is
already inside the strand-era base and is NOT a candidate.

`git log --oneline daabd0e2d..19b3e1ae0` (19b3e1ae0 = the w3 merge,
fedevening's base) contains exactly: w3 merge, w3 arm, windowcarry
cleanup, w2 merge, windowcarry evidence, w2 arm, windowcarry
prereg. `git diff --stat daabd0e2d 19b3e1ae0 -- src/` shows
EXACTLY two files: src/js/fieldFights.js (+315/-4, w2 arm
5bcc89bc0) and src/js/villager-build.js (+169, w3 arm
b10f3eb7f). No other src/ file changed in that interval.

`git log --oneline 19b3e1ae0..HEAD -- src/js/fieldFights.js
src/js/villager-build.js` is EMPTY, and
`git diff --stat daabd0e2d HEAD -- src/js/fieldFights.js
src/js/villager-build.js` is identical to the daabd0e2d..19b3e1ae0
diff. Consequence: restoring either file to its daabd0e2d
version on the current base EXACTLY undoes that landing's
game-code delta on this base. The two candidates are therefore
enumerated, not assumed — and the enumeration also proves there
is no third game-code candidate in the voiding interval.

## Substrate (asserted FATAL in the driver, verbatim from the prior arms)

POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, WOODCARRY=1, WOODWARM=0 (guard) / 1 (ON), DAYS=30,
MORNINGCARRY, WINDOWCARRY, STRANDFIX, PRESSB unset/0,
FEDEVENING unset. Control stack only — no variant, no probe,
nothing that moves the trajectory except the named restoration.

## Base-equality check (BEFORE any judged leg; NOT a judged leg)

Run the PRIOR instrument VERBATIM — scripts/morningcarry-trace-b.js,
unmodified, in its file-writing mode — for seed 15215, guard + ON
legs, into evidence/2026-10-31/sim-strandloss-b-basecheck-guard
and sim-strandloss-b-basecheck-on. Expected reading (the
current-base reading established by strandbank on f536e3ad3, now
re-checked on a3e57bfc1): creek [] / still [] / rescued []
(haven-checked) on both legs, errs 0, 30 evenings, survived.
IF THE VERBATIM INSTRUMENT DOES NOT REPRODUCE THE [] / []
READING, STOP AND REPORT — do not judge. (A non-empty reading
here would mean the strand moved again between f536e3ad3 and
a3e57bfc1, and the bisection's baseline would be wrong; a
driver error would mean the instrument, not the base, moved.)
If the verbatim file mode is EPERM-blocked, the check runs
through the strandbank stdout-runner instead and the
substitution is disclosed with the runner-equivalence proof as
the bridge — labeled instrument-verification-by-equivalent,
not verbatim. The basecheck corpora are NEVER mixed into any
judged census.

## Instruments (reused verbatim, plus one new proof test)

Judged legs run through the EXISTING, UNMODIFIED instruments:
scripts/strandbank-stdout-runner-b.js (morningcarry driver with
main() replaced by a stdout emitter), scripts/split-strandbank2-jsonl-b.js
(idle splitter), scripts/analyze-strandbank-b.js (haven-checked
census: strandChecked + awayWoodShort, as in strandbank-b).
Transport rule (proven this week): judged legs NEVER write files
from a game-loaded process — emit to stdout, split while idle,
never stage judged corpora in /tmp. Runner equivalence on this
base is proven the strandbank way: stdout-runner legs for 15215
guard+ON must deep-equal the basecheck legs on evenings,
mornings, nights, errs, daysAlive, endReason; any difference is
an instrument failure and no judged leg is quoted.

New file scripts/test-strandloss-b.js (pure + corpus checks):
pure census checks on synthetic evenings; corpus completeness
(every leg errs 0, 30 evenings, survived); per-leg restoration
manifest verification (see below); determinism (re-run legs
byte-identical); diff guard (no src/ or scripts/policies/
change vs the pinned base at evidence time); census
recomputation matching stored census JSONs.

Restoration manifests (provenance, written by an IDLE process,
never by a game-loaded process): for every restoration leg, a
manifest JSON records, before the leg runs, the blob hashes
(`git hash-object`) of src/js/fieldFights.js and
src/js/villager-build.js in the worktree, the pinned HEAD, and
which file (if any) is restored. The proof test asserts each
manifest's restored file hashes to the daabd0e2d blob and each
unrestored file hashes to the pinned-base blob. A leg without a
matching manifest is unjudged.

## Census definitions (verbatim from the strandbank prereg)

- still = woodcarry bucket creek + rescued false, haven-checked
  (an evening with inside true / tile haven is not a creek
  evening under any definition; haven evenings break runs).
- rescued = woodcarry bucket creek + rescued true, haven-checked.
- creek = still + rescued (haven-checked).
- strand = maximal run of still evenings on consecutive loop-days.
- A seed's strand set = its strand runs, per leg (guard and ON
  reported separately, never pooled).
- Secondary count ONLY (never judged): awayWoodShort = evenings
  NOT at haven with eveningWood < 4.

## Staging

- BASECHECK (instrument verification, never judged): 15215
  guard+ON, verbatim driver (see above). Plus runner-equivalence
  legs (15215 guard+ON via stdout-runner, never judged).
- STAGE 0 — BASELINE PILOT (judged): the 8-seed pilot band
  (15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337),
  30d, guard + ON legs (16 legs), on the UNRESTORED pinned base.
  Purpose: the current-base baseline this bisection judges
  against. Expected: 0 still on all 16 legs (strandbank's
  f536e3ad3 reading, re-checked on a3e57bfc1).
- STAGE 1 — R1 (judged): restore src/js/fieldFights.js to its
  daabd0e2d version ONLY (villager-build.js untouched, verified
  by manifest), run the same 8-seed pilot band, guard + ON
  (16 legs). Then REVERT the restoration immediately
  (`git checkout <pinned-base> -- src/js/fieldFights.js`,
  verified by hash + status) before any other stage.
- STAGE 2 — R2 (judged): restore src/js/villager-build.js to
  its daabd0e2d version ONLY (fieldFights.js untouched,
  verified by manifest), run the same 8-seed pilot band,
  guard + ON (16 legs). Then REVERT immediately, same
  verification, before any other stage.
- STAGE 3 — R3 (CONDITIONAL, diagnostic only, never
  attribution): runs ONLY if NEITHER R1 nor R2 yields even a
  PARTIAL-MOVE (defined below) on 15215. Restore BOTH files
  to their daabd0e2d versions, run the same 8-seed pilot
  band, guard + ON (16 legs). Then REVERT immediately, same
  verification. R3's result is reported ONLY as "combined
  restoration restores / does not restore" — NEVER as a
  single-file attribution, and never as evidence that either
  file alone did it.
- CONFIRM (conditional): if any restoration yields a
  PARTIAL-MOVE, run the full strandbank width on THAT
  restoration only: the 10-seed bank (15003, 15009, 15091,
  15211, 15215, 15220, 15221, 15337, 15376, 15439) + fresh
  seeds 16501–16508, guard + ON (36 legs), then revert.
  If a restoration yields GO (defined below) on the pilot,
  the confirm still runs (GO is claimed only with the
  confirm + det-gate behind it).
- DET-GATE: any GO or PARTIAL-MOVE leg is re-run fresh
  (same restoration, same seed, same leg) and must be
  BYTE-IDENTICAL to the quoted leg; otherwise the move is
  unproven and reported as such.

## Pre-registered decision rule (binding, §14 — this is a DIAG)

Primary judged unit: seed 15215, haven-checked still sets,
guard and ON legs separately.

- GO (single-file reproduction): a named single-file
  restoration (R1 or R2) yields, on 15215, guard still EXACTLY
  [7,8,9] AND ON still EXACTLY [7,8,9,10,11,12,13,14,15,16],
  with the det-gate passed and the confirm band run. Verdict
  for that file: ATTRIBUTED — that landing voided the 15215
  strand trajectory on the current base (the restoration
  undoes exactly that landing's game-code delta, per the
  interval enumeration above).
- PARTIAL-MOVE (movement, not reproduction): a restoration
  yields any non-empty still set on 15215 on either leg, or
  any still evening on any pilot seed, without meeting GO.
  Verdict: MOVED-BUT-NOT-REPRODUCED for that file — the
  restoration moves the reading, the old trajectory is not
  reproduced, and the confirm band + det-gate decide whether
  the move is real or noise. Never upgraded to GO mid-run.
- DIAG-NO-GO (no single-file attribution): neither R1 nor R2
  yields even a PARTIAL-MOVE on the pilot band. Verdict:
  DIAG-NO-GO — no single file between the strand-era base
  and current master reproduces or moves the 15215 strand
  trajectory on the current base. The R3 combined result is
  then reported as its own line (SPLIT attribution if R3
  moves/restores where singles did not; NO-MOVE if R3 also
  yields 0 still), never folded into a single-file claim.
- Instrument failure (driver errs > 0 on a judged leg,
  runner non-equivalence, determinism mismatch, missing seed
  file, manifest mismatch) voids that leg, not the census:
  the leg is re-run fresh, and if it cannot be made clean
  the evidence file says so and reports the clean-leg width
  honestly.
- Never re-score a miss against a friendlier metric: the
  awayWoodShort secondary count may be REPORTED, but it
  cannot turn a 0-still bisection into a reproduction, and
  it cannot be adopted as the strand definition mid-run.
  Metric doubts go under "metric review" for the next run.

## Horizon + why (death-aware, never a fixed 200d by default)

DAYS=30, death-aware: the harness stops at Game.over (dead
villages stop simulating; the +10d tail is the harness's own
end handling). 30 days covers the whole old strand (guard
nights 7-9, ON nights 7-16, plus tail) and matches every prior
strand arm's census window, so counts compare exactly. A
150-day panel would measure a different question on a
different substrate and cannot express this stack (see §15).

## SENSE TEST (law)

If any restoration moves the strand reading, sense-read the
moved evenings end to end: the departure evening, the still
evenings, the rescue or the tail — transcripts, dialogue,
meaning, coherence. If no restoration moves anything, the
sense-read covers the stay-home evenings on the anchor seed
(15215) on the baseline pilot and states plainly that there
are no strand days to sense-read — the same honest limit the
prior arms recorded. The village assessment in the evidence
file is written in plain words from those readings, not from
counts alone.

## §15 panel (non-applicability declaration, made before judged legs)

scripts/balance-panel.js runs sweep-compare registry policies
on 150-day horizons with its own scorecard and observer
contract. It cannot express the nighttravel+woodcarry+woodwarm
strand stack, the 30-day creek-evening census, or a
single-file-restoration bisection with no lever variant — the
same declaration every prior strand arm made. No panel result
is fabricated; the panel tool is not invoked on this corpus.
The comparison here is the bisection itself (baseline vs
restoration legs on identical seeds through the census
analyzer), never labeled a panel comparison. No compare .md
is produced unless a lever comparison arises (none is planned
in this DIAG); if one did, it would run through
scripts/balance-panel.js with the compare .md attached.

## Metric review (carried in the evidence file; revisions apply to the
NEXT run, never mid-run)

Open questions noted before any judged leg, not resolved by
re-scoring:
- Whether the GO bar's exact-equality demand ([7,8,9] /
  [7..16]) is too strict given later landings since 19b3e1ae0
  also re-roll the stream: the PARTIAL-MOVE tier exists for
  exactly this — a moved-but-not-exact reading is reported
  as movement, not forced into GO and not hidden as NO-GO.
- Whether a combined-restoration GO (R3) should count as
  attribution to "w2+w3 jointly": NOT decided here; R3 is
  reported as combined-only, and any joint-attribution claim
  is a coordinator/Steve decision on top of this evidence,
  not a verdict this arm reaches.
- Whether the haven-checked vs raw-bucket primary count
  (strandbank's 16506 artifact) changes any bisection
  reading: haven-checked is primary here, raw counts are
  reported alongside wherever they diverge.
- Whether the stay-home trajectory itself is a bug or a
  legitimate routine outcome (departdiag answered the
  departure half: the vessel travels daily and returns
  nightly): NOT judged here; carried.
