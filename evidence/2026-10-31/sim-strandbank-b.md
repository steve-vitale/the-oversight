# sim-strandbank-b — DIAG: strand re-derivation census on pinned base f536e3ad3

Run: oversight-flesh-out-loop-b, arm sim-strandbank-b, axis food-economy.
Worktree sim-strandbank-b. DIAG ONLY (measurement): zero src/js changes,
zero policy-default flips, zero edits to any existing policy file or
existing script. New files only. This worker does NOT push, bump, or
verify live; the coordinator merges. Status to coordinator: committed
on branch sim-strandbank-b, pending coordinator merge.

## Verdict: SUBSTRATE-MISSING STANDS — strand arms stay parked

The binding prereg (evidence/2026-10-31/sim-strandbank-b-prereg.md,
commit d1ba7fdf9, written BEFORE any judged leg) ordered exactly this:
re-derive the strand set on current master first, sweeping wider than
the 8-seed band (the 10-seed bank, then fresh seeds), before ANY
judging. The sweep is now done, and it is empty. Across the full swept
width — 18 seeds, 36 legs (stage 1: 10-seed bank x guard+ON; stage 2:
8 fresh seeds x guard+ON, triggered by the prereg's own rule because
stage 1 yielded 0 strands) — there are ZERO still-creek evenings and
ZERO genuine creek evenings on either leg. No strand set is published,
because there is no strand to publish: the prereg's decision rule is
explicit that a looser definition cannot turn a 0-strand census into a
published set, and no metric was re-scored mid-run. The old strand set
(15215 guard [7,8,9] / ON [7..16]) stays VOID. The fedevening
branch-fire design and the axefirst joint proof stay PARKED — neither
blank reopens, because neither has a strand to judge on. This verdict
is a census result, not a lever verdict: no lever was judged here, and
none is claimed to have failed.

## Resume note (predecessor state, repaired before any work)

This worker replaced a worker that died on a harness transport error.
Its left state was the safe-commit index-clobber pattern on the
prereg file itself (staged-deleted AND untracked, commit intact).
Repaired before anything else via `git update-index --add
--cacheinfo` from the HEAD blob (6307f71b2806ed6b3bdc400bd863d36089b7838f);
after repair `git status --short` empty AND `git diff HEAD` empty,
and the prereg file read back intact — the binding prereg was NOT
rewritten, and stands as committed. The diff guard below confirms the
game + policy code under measurement is the pinned base throughout:
`git diff --name-only f536e3ad3 -- src/ scripts/policies/` is EMPTY.

## Pinned base + substrate

Base commit f536e3ad3 (worktree HEAD; the main-tree HEAD at prereg
writing time). Substrate asserted FATAL in every driver run, verbatim
from the prereg: POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0, DEPOSITGATE=1, WOODCARRY=1, WOODWARM=0 (guard) / 1 (ON),
DAYS=30, MORNINGCARRY, WINDOWCARRY, STRANDFIX, PRESSB unset/0,
FEDEVENING unset. Control stack only — no variant, no probe, nothing
that moves the trajectory.

## BASECHECK (instrument verification, never judged)

Verbatim scripts/morningcarry-trace-b.js, seed 15215, guard + ON, into
sim-strandbank-b-basecheck-guard / -on. The verbatim file mode worked
first-try in this window (no EPERM substitution needed for the check
itself — the judged legs still ran through the stdout-runner, per the
prereg's transport rule). Result, both legs: 30 evenings, 30 days
survived, errs 0, creek [] / still [] / rescued [] (haven-checked;
raw counts also []), vessel at haven all 30 evenings. Drift data
point: 15215 stays home on f536e3ad3 EXACTLY as it did on 19b3e1ae0
(the fedevening drift-check corpora agree: [] on both legs). The
strand did not move again between those bases — it was already gone,
and it is still gone. Cross-check: this base's 15215 day-4 morning
holds 2340 kcal, matching the fedevening pilot's 2340 (vs the
windowcarry control's 2294) — the trajectory on this base is the
fedevening trajectory, not a new one.

## Instrument adaptation (proof-tested, not assumed)

Judged legs ran through scripts/strandbank-stdout-runner-b.js (the
windowcarry pattern applied to the morningcarry driver: main()
replaced by a stdout emitter, driver source otherwise verbatim),
foreground redirect to a .jsonl in evidence/, then idle split by
scripts/split-strandbank2-jsonl-b.js (jsonl deleted after split, per
the rule; no judged corpus ever staged in /tmp). Census by
scripts/analyze-strandbank-b.js. Proof scripts/test-strandbank2-b.js:
pure 15/15, full corpus run 111/111, including:

- RUNNER EQUIVALENCE: stdout-runner legs for 15215 guard+ON
  deep-equal the verbatim basecheck legs on ALL prereg fields
  (evenings, mornings, nights, errs, daysAlive, endReason) — same
  driver, same base, same seed, only the transport differs.
- DETERMINISM: the ON sweep leg re-run is BYTE-IDENTICAL to the
  sweep ON corpus on all 10 seeds.
- Sweep completeness: 20 stage-1 files + 16 stage-2 files + 10
  rerun files, every leg errs 0 with 30 evenings, every leg
  survived 30 days.

## A definitional correction found mid-run (verdict-neutral, disclosed)

The analyzer imports strandOf from scripts/analyze-fedevening-b.js,
which counts bucket==='creek' alone. The prereg's census definitions
add the vessel-at-haven check: "an evening with inside true / tile
haven is not a creek evening under any definition." On this sweep
the two readings diverge on exactly one evening per leg: seed 16506
evening 25 carries bucket creek + rescued true while the vessel
sits AT haven (inside true, tile haven, outcome travel-refused —
the woodcarry classifier recording the blocked creek route, not a
night spent out). The analyzer therefore implements strandChecked
(haven evenings excluded from creek/still/rescued AND breaking
runs, since runs are maximal on consecutive loop-days) and reports
BOTH counts: raw rescued [25] on 16506 both legs, haven-checked
rescued []. The verdict is identical under both readings (still=0
either way), so this is a clarification, not a re-score — but future
preregs should state which count is primary, because raw bucket
counts and haven-checked counts now observably diverge.

## STAGE 1 — SWEEP (judged census): 10-seed bank, 20 legs, 0 strands

Seeds 15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337, 15376,
15439, guard + ON, all fresh. Per-seed (guard | ON, identical on
both legs unless noted): still [] / runs [] / rescued []
(haven-checked) on ALL 10 seeds, both legs. Total still 0, total
genuine creek 0. Secondary counts (REPORTED, never judged):

- Slept-away evenings: only seed 15376, loop-days [10,11,12,13] on
  both legs (outcomes out-of-reach x3, blocked-combat x1; tile
  forest_floor, vessel genuinely out). Wood on all four evenings
  is EXACTLY 4 — never wood-short.
- awayWoodShort ("slept away, any cause, wood < 4"): [] on all 20
  legs. The looser metric is also 0 on this stage, exactly as
  axefirst found on its band: the strand is doubly dead here, not
  merely narrowly defined away.

## STAGE 2 — triggered by the prereg's rule (stage 1 yielded 0 strands)

Fresh seeds 16501–16508 (stated in advance in the prereg), guard +
ON, all fresh, 16 legs. Per-seed: still [] / runs [] on ALL 8
seeds, both legs. Total still 0, total genuine creek 0
(haven-checked). Secondary counts:

- Slept-away evenings: only seed 16502, loop-days [16,17,18,21,22,23]
  on both legs, wood >= 4 throughout (awayWoodShort []).
- awayWoodShort: [] on all 16 legs.
- Seed 16506 evening 25: raw bucket rescued [25] on both legs, the
  haven artifact described above — haven-checked, it is not a
  creek evening at all. No seed in stage 2 ever spends a night at
  the creek.

## Totals (the finding, stated as a width)

18 seeds x 2 legs = 36 legs, 1080 evenings, errs 0 on every leg,
all 36 legs survived the 30-day window. Still-creek evenings: 0.
Genuine creek evenings (haven-checked): 0. Seeds with a strand
run: 0. Slept-away evenings anywhere: 10 (15376 x4, 16502 x6), all
with wood >= 4, none creek-bucketed. The creek road itself is not
provably absent — 16506's travel-refused classification shows the
creek route being considered and refused — but no vessel on this
width ever sleeps at the creek, stranded or otherwise.

## SENSE TEST (law) — PASS on what exists, with the gap stated

No strand days exist to sense-read, so per the prereg the sense-read
covers the stay-home evenings on the anchor seed (15215, ON leg,
days 4 and 7, vessel gen_gyft62f — the same vessel as fedevening).
The village reads as people living days: dawn, unknown nuts spoiled
and left for the flies, pantry beans eaten (some off, -5 health,
narrated honestly), clean water drunk, assignments handed out
("Fish. They'll report back by next part."), a low-trust refusal
("Not today. Sorry."), overheard creek talk ("The creek's lower
than yesterday"), and the pantry-full pivot — Brian checking full
shelves (~6 days fresh) and turning from fish nets to the wood run
because "the pantry can't take more; the wild will keep." Day 7
adds snow by morning, a stash-count suspicion ("1 stone missing.
Nobody saw anything."), and stone pried from the creek bed for the
building pile. PASS on meaning for a haven-bound village. The gap
is stated, not hidden: there are NO strand days to sense-read — no
creek evening, no bridge line, no rescue line exists in any judged
corpus on this base.

## Reachability verdict

Creek/bridge content is NOT reached on any leg in this window
(0 genuine creek evenings on 36 legs). This is a road-to-content
finding, not a content finding: the bridge code is unchanged, but
the road that used to walk the vessel to the creek and strand it
there fires on no seed in this width. No wave-4/5 reach, no
regional/national/table content is in scope of this census, and
none is claimed either way.

## Village assessment, in plain words

Picture the village the strand arms always saw: the scholar leaves
home, walks to the creek, and gets stuck there night after night.
On this base, across eighteen different villages, that story never
starts. Seventeen of the eighteen never even sleep away from home
in thirty days — they eat pantry beans, drink clean water, listen
to gossip, send other people out to fish, and turn to the wood run
when the shelves are full. The two exceptions prove the rule in the
other direction: one village sleeps out in the forest for four
nights, another for six, and both come home carrying exactly four
logs every time — fed, wooded, unstranded, with nothing for a
bridge story to catch on. The creek itself is still out there —
one village walks toward it and is turned back at the route — but
nobody spends a night beside it. The branch-fire fix built for those
creek nights is still sitting in the pack, unused, for the third
round running: it never got a night out at the creek to prove
itself on, and this census says the next arm should not assume it
will find one without re-deriving first.

## Wall numbers

NOT OBSERVABLE on a 30-day pre-seat census — reported, never
fabricated. Observed counts on all legs run, all seeds alive at day
30 (daysAlive 30, endReason survived): national 0, table 0, wins 0
(structurally unreachable in this band, not a wall measurement);
median survival 30 days (ceiling — all legs survived the window).
Wave reach is not reported as a wall number here because the band
never reaches creek content; maxWaveUnlocked per leg is in the
corpora, not summarized as reach.

## Blanks filled or documented

- Documented (this arm, measured): THE STRAND SET IS EMPTY ON
  PINNED BASE f536e3ad3, on a wider sweep than any prior arm:
  18 seeds, 36 legs, 0 still, 0 genuine creek. Any strand arm
  judging on this base without a re-derived set measures nothing.
  The next strand arm must re-derive AGAIN on ITS base before
  judging — the 1430Z directive is now a standing pre-step, not a
  one-time repair.
- Documented (this arm, secondary): the looser "slept away, any
  cause, wood < 4" metric is ALSO 0 on all 36 legs (the only slept-
  away evenings anywhere carry wood exactly 4+). Adopting the
  looser definition would not have produced a strand set on this
  width — the metric-review question is answered for this base,
  not merely carried.
- Documented (this arm, instrument): a haven evening can carry a
  creek bucket + rescued classification (16506 evening 25,
  travel-refused). Raw bucket counts and haven-checked counts
  diverge there; future preregs must state which is primary.
- Carried, NOT re-judged: the fedevening branch-fire design
  (complete, untested) and the axefirst joint proof (complete,
  unjudged) both stay PARKED pending a re-derived strand set.
  The 15337 day-20 retry-refusal blank likewise stays moot on
  this base (15337 control [] on both legs, as in fedevening).
- Carried (this arm, strengthened): whether the stay-home
  trajectory itself is a bug or a legitimate routine outcome
  (fedevening doubt 3) — now with wider evidence: 16 of 18 seeds
  never sleep away at all in 30 days under a competent policy.
  That DIAG is still owed, separate from any strand fix.

## Metric review (revisions apply to the NEXT run, never mid-run)

- Prereg Q (looser strand definition): ANSWERED for this base —
  awayWoodShort is 0 on all 36 legs, so the looser definition
  yields no set either. The question of WHETHER to adopt it as
  the definition remains open for a future base where it is
  non-zero; it is not adopted here, and it changed nothing here.
- Prereg Q (frozen stream vs current master): still a
  coordinator/Steve decision, not a worker call. This arm's
  contribution is the re-derived EMPTY set on the pinned base —
  which is itself evidence for the frozen-stream side: on a
  moving base, the set to freeze keeps coming up empty.
- Prereg Q (stay-home bug vs routine): strengthened, not
  resolved — see Blanks above. A departure-conditions DIAG on
  this base is the named next measurement, not a strand arm.
- Prereg Q (bisect the shifting draw): NOT done here (a census
  arm does not bisect); candidates unchanged (lootabilities w2
  field-fight ability coverage, w3 villager self-craft).
- New doubt for the NEXT run: whether the haven-bucket artifact
  (16506) indicates a classification worth fixing in woodcarry
  itself (a refused trip that never left haven should arguably
  not bucket as creek) — a DIAG question for the woodcarry
  instrument, not a game claim made here.

## §15 panel (non-applicability declaration)

scripts/balance-panel.js runs sweep-compare registry policies on
150-day horizons with its own scorecard and observer contract. It
cannot express the nighttravel+woodcarry+woodwarm strand stack, the
30-day creek-evening census, or a control-stack census with no
variant — the same declaration every prior strand arm made. No
panel result is fabricated; the panel tool was not invoked on this
corpus. The comparison here is the census itself (guard vs ON legs
on identical seeds through the census analyzer), never labeled a
panel comparison. No compare .md is produced: there is no paired
before/after to compare, only a census.

## Infrastructure findings (for the coordinator — NOT game findings)

1. The predecessor's index-clobber state was repaired before any
   work (see Resume note); the clobber did NOT recur on this
   run's work (no commits made yet at evidence-writing time —
   this file + instruments commit together; the coordinator
   should verify status/diff clean after that commit the same
   way, per the known class).
2. No EPERM flap observed in this window: the verbatim file-mode
   basecheck wrote first-try, all stdout transports split
   first-try, all splitter writes landed first-try. The stdout
   transport rule was followed anyway (judged legs never wrote
   from a game-loaded process).
3. Judged corpora were never staged in /tmp (jsonl lived in
   evidence/ until split, then deleted, per the rule).

## Proof

scripts/test-strandbank2-b.js: pure 15/15; full corpus run 111/111
(equivalence guard+ON on all 6 prereg fields; sweep completeness
20/20 legs + 30 evenings each; determinism byte-identical 10/10;
census recomputation matches stored stage-1 census JSON).
Diff guard: `git diff --name-only f536e3ad3 -- src/
scripts/policies/` EMPTY at evidence time.

## Files

- Prereg (binding, before judged legs):
  evidence/2026-10-31/sim-strandbank-b-prereg.md (commit d1ba7fdf9)
- Evidence (this file): evidence/2026-10-31/sim-strandbank-b.md
- Runner: scripts/strandbank-stdout-runner-b.js; splitter:
  scripts/split-strandbank2-jsonl-b.js; analyzer:
  scripts/analyze-strandbank-b.js; proof:
  scripts/test-strandbank2-b.js (111/111 with corpora)
- Basecheck (verbatim driver, 15215, never judged):
  evidence/2026-10-31/sim-strandbank-b-basecheck-guard,
  sim-strandbank-b-basecheck-on (1 file each)
- Runner-equivalence legs (15215, never judged):
  evidence/2026-10-31/sim-strandbank-b-equiv-guard,
  sim-strandbank-b-equiv-on (1 file each + stderr logs)
- Stage 1 sweep (judged): evidence/2026-10-31/
  sim-strandbank-b-sweep-guard, sim-strandbank-b-sweep-on
  (10 files each + stderr logs); census:
  evidence/2026-10-31/sim-strandbank-b-census.json
- Stage 2 (judged, prereg-triggered): evidence/2026-10-31/
  sim-strandbank-b-stage2-guard, sim-strandbank-b-stage2-on
  (8 files each + stderr logs); census:
  evidence/2026-10-31/sim-strandbank-b-census-stage2.json
- Determinism re-run (ON sweep leg): evidence/2026-10-31/
  sim-strandbank-b-rerun-on (10 files + stderr log)
- No compare .md exists (no paired comparison without a strand);
  no panel result exists (non-applicability declared above).
