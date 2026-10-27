# sim-scale-onramp-round-0615 — coordinator evidence (run fleshout-20261027T0615Z, axis scale-onramp)

Loop A run. Sibling loop B was live on food-economy at run start
(0530Z claim: sim-stockdoors-b + sim-residualhunt-b, NOT touched);
by closeout B's trees had landed and been released. Scale-onramp
is the topmost non-converged axis and was not named in any live
claim at run start. Both arms DIAG / measurement only, zero
src/js, no default flips, no game lever landed.

Blanks worked, in tracker order: (1) final-loss non-restore —
ADOPTED from the dead 0105Z arm (its tree sim-finalloss-a was
stale-dead with zero tracked modifications and only an untracked
prereg; the prereg was preserved read-only to
hidden_files/sim-finalloss-a-prereg-preserved-20261027.md and the
dead tree itself was NOT touched, NOT released, NOT removed);
(2) C/D emit bisection on the old base — gate OPEN from
divergebase-a (0525Z), CLAIMED as sim-cdemit-bisect-a.
Ruling-pending items skipped: raid-wall toll narration,
monster-knowledge link, TB channel reset, situation-blind
table talk, dead-entry drop, 1354Z steve-calls. W4funnel
control re-pin on the current base is still outstanding (see
"Next blanks").

## Arm 1 — sim-finalloss-adopt-a: DIAG-NO-GO (commit 211b1b110, proof 120/0)

Question: why does a wave-4 monster that loses its last fight
of the day never come back in the daily count — blocked,
thrown, or removed again afterwards? The dead arm's
pre-registration (F1–F13 cause set, DIAG-GO threshold) was
run verbatim; the only adaptation is the run/arm id.

Answer: the instrument works and all 16 final-loss cases in
this corpus classify — but the verdict is honestly NO-GO,
because neither known instance re-derives on current master.
Seed 73672 ends day 118 with a win (before the known day
148); seed 73673 ends day 32 village-lost (before the known
day 112). The known instances are unreachable on this base,
not unmeasured, and the arm does not re-score around that
(per MEASUREMENT.md §14 a miss is NO-GO).

Plain-words answer: on today's game, a monster that loses
its last fight does NOT mysteriously vanish. Of the 16
cases: 6 came back exactly as the rules say; 6 never came
back because another monster was already standing on the
spot they would return to (the Haven pile-up — every
lingering monster is pinned nightly to the single Haven
tile, so the first one restored blocks the rest); 3 came
back, were fought again, and were killed in that re-fight;
1 is a snapshot-boundary case (the re-fight's ending fell
just after the day's count). No restore ever threw, no
case was left unexplained, and every restored monster came
back at exactly the predicted HP and tile — which
independently validates the restore prediction model.
The one genuinely silent case is a blocked restore (F1):
no line tells the player the monster never came back.

The arm's own baseline replication is EXACT against the
0525Z current-base band (see "Wall numbers"), so the
known-instance gap is base movement since the 1920 band,
not recorder interference (G2 neutrality 8/8, det-gate
PASS, cost bar PASS, all cross-checks PASS).

Evidence: evidence/2026-10-27/sim-finalloss-adopt-a.md +
prereg + perseed-finalloss-adopt-a/ + sense replays
(73672/73673) + scripts/policies/finalloss-diag.js +
sweep + proof script.

## Arm 2 — sim-cdemit-bisect-a: DIAG-GO (commits f66796781 + 58fcb45d0, proof 40/0)

Question: does the seed-73677 census-vs-transcript
divergence (narration-off vs narration-on giving different
villages) disappear at commit c04d4e0cb, the sole src/js
change between raidtrace's base and the current branch?

Answer: YES, exactly, 3/3 rep pairs per leg. Control leg
on c8770e7f reproduces raidtrace's divergence exactly
(census 152d/41 deaths/0 walls vs transcript 168d/44
deaths/2 walls; transcript doc byte-identical to
raidtrace's own). Test leg on c04d4e0cb reads the SAME
trajectory in both modes on every rep (130d/37/won/3
walls, headline AND stripped full-field agreement, zero
tick diffs, all five recorder sections stripped-equal),
matching the current-base figures — the clean GO, not a
collapse onto an old-base figure and not an unexplained
shift. The divergence's disappearance is now located at
c04d4e0cb (17-line bystander-hold fix) by measurement,
not by guess. No game change is approved by this arm, and
no narration change is proposed (any voice change needs
Steve's ruling).

Plain-words answer: on the old game, simply turning the
storytelling on changed the village's fate — same seed,
16 extra days, 3 more deaths, 2 extra raid wounds. At
c04d4e0cb, storytelling on/off give the identical
village. The fix stops the game from lifting a monster
that was only standing nearby (not actually in the fight)
and then losing it when the fight is won — and that
lifecycle sits at the heart of this seed's story.

Procedure (as briefed, verified): legs run on DETACHED
checkouts; the raidtrace sweep + emit recorder do not
exist at either base and were restored verbatim from
fd3bcd83d onto each checkout (identical hashes on both
legs), never committed there; the arm returned to branch
sim-cdemit-bisect to commit. Instrument identity verified
(the rest of the stack is identical across the range, so
the ONLY difference between legs is the base commit).
Fight-ID timestamp prefixes stripped before every
comparison (control stripped-unequal = real divergence;
test raw-only diffs = timestamps only). Det-gates PASS on
both legs, both modes.

Infrastructure disclosed in the arm evidence (not
re-litigated here): a container EPERM write flap hit
this arm hard (rep-file copies, a checkout that
truncated game.js to 0 bytes and left c04d4e0cb files
untracked — recovered with blob-hash verification and
deletion of the leftovers, nothing lost; a stale 0-byte
ref probe file blocking the return checkout — deleted,
never a real ref). Test-leg sweep writes were routed
through FIFOs with the verbatim sweep scripts
unmodified; every rep file verified by size, JSON
parse, and headline fields, and the proof validator
re-derives every verdict number from those files. A
proof-validator display bug (doc-array off-by-one) was
found and fixed in-arm; the corrected proof runs 40/0.
Safe-commit index clobber hit the arm's prereg commit
(bogus staged deletion); repaired via HEAD-blob
cacheinfo, status clean after.

Evidence: evidence/2026-10-27/sim-cdemit-bisect-a.md +
prereg + perseed-cdemit-bisect-a/ (control + test, 3
reps/mode each) + scripts/test-cdemit-bisect-a.js.

## Wall numbers (this run's current-base corpus only)

From the finalloss band (seeds 73671–73678,
tableseat-nowait, 180d death-aware, current base;
baseline == armed on every field): national-ever 7/8,
national-final 5/8, table invited 5/8, entered 4/8,
wins 4/8, wave-4 5/8, wave-5 0/8, median survival 130d,
deaths 284, starvation deaths 2, wave-4 kills 2 total
(73671: 1, 73677: 1). Death causes: combat ~68%
(villager combat 43.3%, villager-vs-villager 24.6%),
player arena 12.0%, expedition 7.0%, sickness 3.5%,
starvation 0.7%. The bisect corpus is a single-seed
old-base comparison, not a band, and is not mixed into
these numbers.

Sense note (finalloss replays, non-measured): villagers
act like people in the samples — Olivia lays out real
options with real costs to an empty pantry; the
73673 scattering ("people started walking — in
different directions") is a coherent human ending, not
a mechanical fizzle. A blocked restore (F1) has no
line at all — the one silent case.

## Telemetry deviation check (body step 10)

Ran: node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-10-27/perseed-finalloss-adopt-a/s736*.json'
--metrics national,table,wins,exiled.

Result: 2 LOUD lines (national 12 -> 0, wins 16 -> 0,
n=16 files). Verdict: BOTH ARE INGESTION ARTIFACTS,
baseline NOT rolled. (1) The baseline file itself
labels its regime WINSEAT and warns not to compare
pre-seat substrates against it. (2) The finalloss
per-seed files are recorder/sweep rows, not telemetry
rows — the tool reads national/wins as 0 because those
fields are not in its expected shape; the band-level
truth from the arm's own summary is national-ever 7/8,
wins 4/8. (3) The glob counts 16 files for 8 runs
(baseline + armed, G2-identical). Same artifact class
as the 0525Z run. The bisect corpus was NOT run
through telemetry-check (single-seed old-base
comparisons are not a band; the arm's proof validator
is the comparison of record there).

## Metric review (MEASUREMENT.md §14)

- Finalloss condition (2) (both known instances must
  re-derive) assumes trajectory stability across bases,
  and the base moved. The next run must choose BEFORE
  its pre-registration: (i) re-baseline known instances
  from a current-base corpus (e.g. this corpus's own 16
  cases), or (ii) pin to the base the known instances
  were observed on. Never quietly drop condition (2)
  or substitute a near-miss (same monster, different
  seed/day) and call it re-derived.
- Finalloss F9 as defined can fire on a snapshot-boundary
  artifact (73675 day-168: the fight DID end, just
  after the count, in a frozen second phase). A tighter
  next-run definition would treat a fight-end row in
  the same day's second phase (or visible in the
  post-run count) as ending the lift. Under it this
  corpus would hold 0 F9 and the day-168 case would
  read as delayed RESTORED. This run keeps the
  pre-registered definition (F9: 1, qualified).
- Bisect agreement definition (headline + trajEq + zero
  tick diffs + all sections stripped-equal) was never
  stress-tested by a mixed case; a future arm that sees
  headline agreement with a stripped tick difference
  should report it as persisting stripped divergence,
  not agreement.
- Balanced panel has no corpus-ingest mode (standing
  limitation); paired identical-seed tables are the
  comparison of record for both arms. No panel file
  faked. Telemetry-check NOT run on recorder rows as
  a measurement (see the deviation check above, which
  is a coordinator-level check reported as artifact).

## Infrastructure

- Master moved twice under the run before landing
  (loop B residual2b 6fdcbfce3 + the run's own bisect
  landing); both branches rebased clean (no file
  overlap with master movement in either case), proofs
  green after every rebase and on merged master
  (bisect 40/0, finalloss 120/0, each run pre- and
  post-rebase). No EPERM flap on the coordinator's own
  writes this run (the flap hit the bisect worker's
  sweep writes; see its evidence).
- Safe-commit index clobber hit the bisect arm's
  prereg commit (worker-repaired, verified clean);
  no clobber on the coordinator's merges. Main tree
  clean at closeout.
- check.js --quick NOT run (sibling-test contention
  precedent from 0525Z; both arms are zero src/js and
  their proof suites are the attributable
  verification).
- Rotation left at 3 (convergence-directed work, not
  rotation work; no bump claimed).

## Convergence state

scale-onramp stays converging (NOT converged): wave 5
still 0/8, full seat unreached, and the finalloss known
instances are now known-unreachable on current master.
food-economy untouched (sibling loop B). Next blanks,
in order: (1) finalloss known-instance choice —
coordinator's call BEFORE the next prereg (re-baseline
from a current-base corpus, or pin to the old base);
F9 definition tightening for that prereg; Haven
pile-up intended-behavior question — Steve-call if it
touches the restore rule, otherwise a design note.
(2) C/D bisection CLOSED: divergence mechanism located
at c04d4e0cb; a future narration-neutrality claim
must meet the arm's stated bar (paired agreement,
headline + stripped, 3 rep pairs/mode). (3) w4funnel
control re-pin on the current base — required before
any future funnel number is judged. (4) Ruling-pending,
skipped: raid-wall toll narration, monster-knowledge
link, TB channel reset, situation-blind table talk,
dead-entry drop, 1354Z steve-calls. Claim deleted;
lock deleted. Evidence: this file (coordinator
211b1b110 is the finalloss landing; bisect landing
58fcb45d0) + sim-finalloss-adopt-a.md + prereg +
perseed-finalloss-adopt-a/ + sim-cdemit-bisect-a.md +
prereg + perseed-cdemit-bisect-a/. Merged locally,
pending ship.
