# sim-strandloss-b — DIAG-NO-GO: neither lootabilities file, alone or together, restores the 15215 strand on current master

Run: oversight-flesh-out-loop-b, arm sim-strandloss-b, axis food-economy.
Worktree sim-strandloss-b. DIAG ONLY (measurement): zero src/js changes,
zero policy-default flips, zero edits to any existing policy file or
existing script. New files only. Restorations were measurement
scaffolding inside this worktree only and were REVERTED before commit;
the committed tree contains no restored game file as a change (proof
diff guard passes). This worker does NOT push, bump, or verify live;
the coordinator merges. Status to coordinator: committed on branch
sim-strandloss-b, pending coordinator merge.

## Verdict: DIAG-NO-GO — no single-file attribution, and no combined move either

The binding prereg (evidence/2026-10-31/sim-strandloss-b-prereg.md,
commit bd78f4ebf, written BEFORE any judged leg) ordered a file-level
restoration bisection of the 15215 strand loss on pinned base
a3e57bfc17a95d90773634d24f7d39b8c34123c3. The interval was
enumerated via git log, not assumed: between the strand-era base
daabd0e2d (parent of the windowcarry prereg, whose control corpora
measured 15215 guard [7,8,9] / ON [7..16]) and the w3 merge
19b3e1ae0, the ONLY src/ changes are src/js/fieldFights.js (w2 arm
5bcc89bc0) and src/js/villager-build.js (w3 arm b10f3eb7f); neither
file has been touched since 19b3e1ae0, so restoring either file to
its daabd0e2d version on the current base exactly undoes that
landing's game-code delta. Lootabilities w1 is an ancestor of
daabd0e2d and is not a candidate.

Result, on the 8-seed pilot band (guard + ON, 16 legs per stage,
all errs 0, all survived 30 days):

| stage | restoration | 15215 guard still | 15215 ON still | total still (16 legs) |
|-------|-------------|-------------------|----------------|-----------------------|
| baseline | none | [] | [] | 0 |
| R1 | fieldFights.js ← era | [] | [] | 0 |
| R2 | villager-build.js ← era | [] | [] | 0 |
| R3 (diagnostic only) | both ← era | [] | [] | 0 |

No stage yields GO (exact [7,8,9] / [7..16]), no stage yields even a
PARTIAL-MOVE (any non-empty still on 15215 or any pilot seed), so
per the prereg no confirm band runs and no det-gate is owed (there
is no moved leg to re-run). The verdict is DIAG-NO-GO: on the
current base, undoing w2 alone, w3 alone, or both together does NOT
reproduce or move the 15215 strand trajectory. The R3 result is
reported as combined-only, never as single-file attribution — and
here it adds nothing anyway (see effect-size section: R3's
trajectory changes are exactly R1's).

This does NOT overturn fedevening's finding that the strand was
already gone on 19b3e1ae0, and it does NOT claim w2/w3 are innocent
in the original voiding. What it proves is narrower and, for the
strand program, more consequential: the loss is not reversible on
current master by undoing those two files. Either later landings
between 19b3e1ae0 and a3e57bfc1 independently re-rolled the stream
past the departure lottery, or the voiding was an interaction whose
other half has since moved. A bisection that wants the original
voiding event must run on the 19b3e1ae0 base itself (named as the
next arm below), not on current master — current-master bisection
cannot see it, because the current stream position no longer
depends on these two files for the anchor seed (15215 is
byte-identical under every restoration; see below).

## Pinned base + substrate

Base commit a3e57bfc17a95d90773634d24f7d39b8c34123c3 (worktree HEAD
at prereg time). Substrate asserted FATAL in every driver run,
verbatim from the prior arms: POLICY=nighttravel, COMPETENT_FEAST=0,
SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1, WOODCARRY=1, WOODWARM=0
(guard) / 1 (ON), DAYS=30, MORNINGCARRY, WINDOWCARRY, STRANDFIX,
PRESSB unset/0, FEDEVENING unset. Control stack only — the only
thing that moves a trajectory between stages is the named
restoration, verified per leg by a manifest (idle-written blob
hashes; proof asserts restored files hash to the daabd0e2d blob
and unrestored files hash to the pinned-base blob).

## BASECHECK (instrument verification, never judged)

Verbatim scripts/morningcarry-trace-b.js, seed 15215, guard + ON,
file-writing mode first-try (no EPERM substitution needed for the
check itself; judged legs still ran through the stdout-runner per
the transport rule). Result, both legs: 30 evenings, 30 days
survived, errs 0, creek [] / still [] / rescued [] (haven-checked;
raw counts also []), vessel at haven all 30 evenings, vessel
gen_gyft62f. The prereg's STOP condition did not fire: the
verbatim instrument reproduces the current-base [] / [] reading
(strandbank's f536e3ad3 reading, re-checked on a3e57bfc1 — no
further drift between those bases on the anchor seed). Runner
equivalence proven the strandbank way: stdout-runner 15215
guard+ON legs deep-equal the basecheck legs on evenings,
mornings, nights, errs, daysAlive, endReason.

## STAGE 0 — BASELINE PILOT (judged): 0 still on 16 legs

Seeds 15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337,
guard + ON, unrestored pinned base. Per-seed (guard | ON, identical
on both legs): still [] / runs [] / rescued [] / away [] /
awayWoodShort [] on ALL 8 seeds, both legs. Total still 0, total
genuine creek 0. No seed sleeps away at all on this band — the
departdiag picture (day trips out, home by night) holds on this
base too. Wave reach on the baseline legs: wave 1 on 2 legs,
wave 2 on 14 legs, wave 3 on 0.

## STAGE 1 — R1, undo w2 fieldFights.js (judged): moves trajectories, not the strand

fieldFights.js restored to its daabd0e2d version only
(manifest-verified; villager-build.js untouched at its pinned
blob). Same 8-seed pilot band, guard + ON. Result: still [] /
runs [] / rescued [] / away [] / awayWoodShort [] on ALL 8 seeds,
both legs. Total still 0. R1 is NOT a partial move, let alone GO.

Effect size (why this is a real negative, not a no-op): R1 corpora
are byte-DIFFERENT from baseline on 5/8 seeds on both legs
(15009, 15091, 15211, 15220, 15337) and byte-identical on 3/8
(15003, 15215, 15221). On 15009 guard the evenings diverge from
loop-day 8 onward (23/30 evenings differ; mornings, nights,
sayLines, waveKills, deaths all move). The w2 undo genuinely
re-rolls five trajectories — it just re-rolls none of them onto a
creek night. Wave reach under R1: wave 1 on 4 legs, wave 2 on 10,
wave 3 on 2 (vs baseline 2/14/0) — the re-roll reaches further
in wave terms and still strands nobody. The anchor seed 15215 is
byte-identical under R1: on current master, 15215's trajectory
does not depend on fieldFights.js at all in this window.

## STAGE 2 — R2, undo w3 villager-build.js (judged): no effect at all on this band

villager-build.js restored to its daabd0e2d version only
(manifest-verified; fieldFights.js untouched at its pinned blob).
Same pilot band, guard + ON. Result: still [] on ALL 8 seeds,
both legs. Total still 0. R2 is NOT a partial move.

Effect size: R2 corpora are BYTE-IDENTICAL to baseline on 8/8
seeds, both legs — wave distribution identical too (1 on 2 legs,
2 on 14). Undoing villager self-craft changes nothing the vessel
does or sees in 30 days on this band: either no weaponless
villager at home ever meets the craft conditions here, or the
duty fires without touching the vessel's trajectory (no RNG draw
reaches the vessel's stream position). Either way, w3's game-code
delta is inert on this band on current master — it cannot be the
lever that moves 15215 back to a strand here, because it moves
nothing here at all.

## STAGE 3 — R3, undo both files (CONDITIONAL diagnostic, never attribution): no move

Triggered by the prereg's rule (neither single yielded even a
partial move). Both files restored to their daabd0e2d versions
(manifest-verified), same pilot band, guard + ON. Result: still []
on ALL 8 seeds, both legs. Total still 0. R3's trajectory changes
are EXACTLY R1's (same 5 differing seeds, same 3 identical, same
wave distribution 4/10/2) — the combined restoration adds nothing
over undoing w2 alone, which is consistent with R2 being inert.
Reported ONLY as "combined restoration does not restore" — never
as attribution to w2+w3 jointly, and never as evidence either
file alone did anything it did not do.

## Totals (the finding, stated as a width)

4 stages x 16 legs = 64 judged legs, 1920 evenings, errs 0 on every
leg, all 64 legs survived the 30-day window. Still-creek evenings:
0. Genuine creek evenings (haven-checked): 0. Raw rescued: 0 on
every leg of every stage (no haven-bucket divergence on this
band, unlike strandbank's 16506). Seeds with a strand run: 0.
Slept-away evenings anywhere: 0 on all 64 legs. AwayWoodShort: 0
on all 64 legs. The looser metric is also 0 — the strand is
doubly dead under every restoration, not merely narrowly defined
away.

## SENSE TEST (law) — PASS on what exists, with the gap stated

No restoration moves any strand day, so per the prereg the
sense-read covers the stay-home evenings on the anchor seed
(15215, baseline ON leg, days 4 and 7, vessel gen_gyft62f — the
same vessel and the same day-4 life strandbank read). The village
reads as people living days: dawn, unknown nuts spoiled and left
for the flies, pantry beans eaten (some off, -5 health, narrated
honestly), clean water drunk, assignments handed out ("Fish.
They'll report back by next part."), a low-trust refusal ("Not
today. Sorry."), overheard creek talk ("The creek's lower than
yesterday"), and the pantry-full pivot — Brian checking full
shelves (~6 days fresh) and turning from fish nets to the wood
run because "the pantry can't take more; the wild will keep."
Day trips out (trail edge, forest floor, a deer startled) and
home by night, every evening outcome completed at haven with
wood exactly 4. PASS on meaning for a haven-bound village. The
gap is stated, not hidden: there are NO strand days to sense-read
under any restoration — no creek evening, no bridge line, no
rescue line exists in any judged corpus of this arm.

## Reachability verdict

Creek/bridge content is NOT reached on any leg in this window
(0 genuine creek evenings on 64 judged legs + 2 basecheck legs +
2 equivalence legs). This is a road-to-content finding, not a
content finding: the bridge code is unchanged, but no restoration
of the two voiding-interval files re-opens the road that used to
walk the vessel to the creek and strand it there. No wave-4/5
reach, no regional/national/table content is in scope of this
census, and none is claimed either way. (Wave 3 is reached on 2
R1/R3 legs vs 0 baseline legs — a re-roll effect, not a strand
effect, and not a reachability claim about wave content.)

## Village assessment, in plain words

Picture the village the strand arms always saw: the scholar leaves
home, walks to the creek, and gets stuck there night after night.
This arm tried to walk the road backward — take out the two
changes that arrived between the last time that story worked and
the first time it didn't, one at a time and then both together —
and the story still never starts. Taking out the field-fight
abilities does stir the village: five of eight villages live
slightly different thirty days, one even pushes a wave further,
but every scholar still comes home every night. Taking out the
villager self-craft does literally nothing — those thirty days
play out word for word the same, which says that change never
touches this village's days at all. And taking out both together
is just the first change again. So the creek nights aren't hiding
behind those two changes anymore. Something else moved the road
after them — or the road moved in a way that undoing them can't
unmove — and the next arm has to look at the road as it was the
day the story broke, not as it is today. Until then, the
branch-fire fix and the joint proof stay parked: there is still
no creek night anywhere for them to prove themselves on.

## Wall numbers

NOT OBSERVABLE on a 30-day pre-seat census — reported, never
fabricated. Observed counts on all judged legs, all seeds alive
at day 30 (daysAlive 30, endReason survived): national 0, table 0,
wins 0 (structurally unreachable in this band, not a wall
measurement); median survival 30 days (ceiling — all legs
survived the window). Wave reach is not reported as a wall number
here because the band never reaches creek content; maxWaveUnlocked
per leg is in the corpora (baseline 1:2/2:14 legs; R1/R3
1:4/2:10/3:2; R2 identical to baseline).

## Blanks filled or documented

- Filled (this arm, measured): THE CURRENT-MASTER BISECTION.
  Undoing w2 (fieldFights.js) alone, w3 (villager-build.js)
  alone, or both together does NOT reproduce or move the 15215
  strand trajectory on pinned base a3e57bfc1 (64 legs, 0 still).
  The "which landing voided it" question does NOT have a
  current-master single-file answer — and now that negative is
  measured, not assumed.
- Filled (this arm, measured): EFFECT SIZES. w2's delta moves
  5/8 trajectories (from loop-day 8 on 15009) but strands none;
  w3's delta moves 0/8 trajectories (byte-identical) on this
  band. Any future claim about either landing's strand effect
  must reckon with these sizes: w2 is stream-active but
  strand-inert here; w3 is inert here, period.
- Documented (this arm, next-arm proposal, NOT done here): a
  bisection ON THE 19b3e1ae0 BASE ITSELF — restore fieldFights.js
  and villager-build.js singly onto fedevening's base and re-run
  the 15215 band there. That is the experiment that can still
  isolate the original voiding event; this arm's prereg bound it
  to the current base, so it runs it nowhere here and claims
  nothing about it. If that base-bisection also yields 0, the
  voiding was never a single-file event at all, and the
  strand program's "which landing" question dissolves into a
  stream-position question.
- Carried, NOT re-judged: the fedevening branch-fire design
  (complete, untested) and the axefirst joint proof (complete,
  unjudged) both stay PARKED — still no strand to judge on.
  The departdiag gate (return leg, return never fails) stands
  unchallenged: away evenings are 0 on all 64 legs here.
- Carried (this arm, strengthened): the strand set is empty on
  current master at 64 more legs of width (on top of
  strandbank's 36). The 1430Z directive stands: the next
  strand arm re-derives on ITS base before judging.

## Metric review (revisions apply to the NEXT run, never mid-run)

- Prereg GO bar (exact [7,8,9] / [7..16]): HELD, unmet — and
  the PARTIAL-MOVE tier did its job: with 0 still everywhere,
  there was no temptation to upgrade a near-miss, because
  there was no near-miss at all. The exact-equality worry
  (later landings re-rolling the stream) is now evidence,
  not just worry: R1 moves trajectories without moving the
  strand, so exact reproduction on current master may be
  unachievable even for the true voiding landing.
- Prereg Q (should a combined-restoration GO count as joint
  attribution): MOOT here — R3 did not move, so no joint
  claim arises. The rule stands for a future arm: combined
  results are reported as combined-only.
- Prereg Q (haven-checked vs raw primary): NO DIVERGENCE on
  this band — raw rescued is [] on all 64 legs, so the
  primary-count question does not bite here. Strandbank's
  16506 artifact remains the only known divergence.
- Prereg Q (stay-home bug vs routine): NOT judged here;
  carried. Departdiag's answer (daily travel, nightly return)
  is consistent with every leg here (away 0, day-trip
  narration intact on 15215).
- New doubt for the NEXT run: whether file-level restoration
  bisection is even the right instrument when the stream
  position is cumulative — restoring a file changes draws
  only where that file's code executes, and on a haven-bound
  band fieldFights.js executes rarely (no field fights) while
  villager-build.js executes without effect. A bisection on a
  band where the candidate code actually runs (field-fight
  band for w2, armed-villager band for w3) would be a
  different, possibly sharper instrument — but it would
  measure a different question than the 15215 strand
  trajectory, and must be preregistered as such.

## §15 panel (non-applicability declaration)

scripts/balance-panel.js runs sweep-compare registry policies on
150-day horizons with its own scorecard and observer contract. It
cannot express the nighttravel+woodcarry+woodwarm strand stack,
the 30-day creek-evening census, or a single-file-restoration
bisection with no lever variant — the same declaration every
prior strand arm made. No panel result is fabricated; the panel
tool was not invoked on this corpus. The comparison here is the
bisection itself (baseline vs restoration legs on identical
seeds through the census analyzer), never labeled a panel
comparison. No compare .md is produced: there is no paired
before/after lever comparison, only a DIAG bisection.

## Infrastructure findings (for the coordinator — NOT game findings)

1. Safe-commit index clobber (known class) hit BOTH pre-leg
   commits (prereg file, then all 7 instrument/basecheck
   files: committed files showing staged-as-deleted while
   byte-identical in the worktree). Repaired each time via
   `git update-index --add --cacheinfo` from HEAD blobs;
   `git status --short` empty + `git diff HEAD` empty verified
   after each repair. The commits themselves were never in
   doubt (blob hashes match). The judged-legs commit below
   must be verified the same way before this report is relied
   on.
2. safe-commit.sh does NOT accept directory paths (known
   lesson, re-hit here): passing corpus dirs fails with
   "fatal: Unable to add <dir> to database". The judged-legs
   commit expands to explicit file lists.
3. No EPERM flap observed in this window: the verbatim
   file-mode basecheck wrote first-try, all stdout transports
   split first-try, all splitter writes landed first-try. The
   stdout transport rule was followed anyway (judged legs
   never wrote from a game-loaded process).
4. Judged corpora were never staged in /tmp (jsonl lived in
   evidence/ until split, then deleted, per the rule).
5. All restorations were reverted and hash-verified before
   this evidence was written: fieldFights.js and
   villager-build.js both hash to their pinned-base blobs,
   and `git status` shows no tracked modifications.

## Proof

scripts/test-strandloss-b.js: pure 6/6; full corpus run 343/343
(basecheck [] / [] both legs; runner equivalence both legs;
stage completeness 16/16 legs x 4 stages, errs 0, 30 evenings,
survived; census recomputation matches all 4 stored censuses;
all 8 manifests verify (restored = era blob, unrestored =
pinned blob); diff guard: no src/ or scripts/policies/ change
vs pinned base). No confirm corpora exist (no partial move, so
no confirm band ran per the prereg); no det corpora exist (no
moved leg to re-run per the prereg's det-gate).

## Files

- Prereg (binding, before judged legs):
  evidence/2026-10-31/sim-strandloss-b-prereg.md (commit bd78f4ebf)
- Evidence (this file): evidence/2026-10-31/sim-strandloss-b.md
- Proof: scripts/test-strandloss-b.js (343/343 with corpora)
- Basecheck (verbatim driver, 15215, never judged):
  evidence/2026-10-31/sim-strandloss-b-basecheck-guard,
  sim-strandloss-b-basecheck-on (1 file each)
- Runner-equivalence legs (15215, never judged):
  evidence/2026-10-31/sim-strandloss-b-equiv-guard,
  sim-strandloss-b-equiv-on (1 file each + stderr logs)
- Baseline pilot (judged, unrestored): evidence/2026-10-31/
  sim-strandloss-b-baseline-guard, sim-strandloss-b-baseline-on
  (8 files each + stderr logs); census:
  evidence/2026-10-31/sim-strandloss-b-census-baseline.json
- R1 (judged, fieldFights.js ← era): evidence/2026-10-31/
  sim-strandloss-b-r1-guard, sim-strandloss-b-r1-on (8 files
  each + stderr logs); census:
  evidence/2026-10-31/sim-strandloss-b-census-r1.json
- R2 (judged, villager-build.js ← era): evidence/2026-10-31/
  sim-strandloss-b-r2-guard, sim-strandloss-b-r2-on (8 files
  each + stderr logs); census:
  evidence/2026-10-31/sim-strandloss-b-census-r2.json
- R3 (judged, both ← era, diagnostic only): evidence/2026-10-31/
  sim-strandloss-b-r3-guard, sim-strandloss-b-r3-on (8 files
  each + stderr logs); census:
  evidence/2026-10-31/sim-strandloss-b-census-r3.json
- Manifests (idle-written provenance, 2 per stage):
  evidence/2026-10-31/sim-strandloss-b-manifest-{baseline,r1,r2,r3}-{guard,on}.json
- No compare .md exists (no paired lever comparison — this is a
  DIAG bisection, never labeled a panel comparison); no panel
  result exists (non-applicability declared above).
