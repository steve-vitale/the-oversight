# sim-sicktele-b (re-run) — SICKNESS DEATH-TELE GAP, re-checked at current head (Loop B, 2026-10-30)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T0007Z, arm sim-sicktele-b.
Parent: loop-B arm sim-starveplenty-b (run fleshout-loop-b-20261030T1030Z),
evidence/2026-10-30/sim-starveplenty-b.md observation 1; sim-findings #1514.
Backlog #1514 (sickness death-tele gap): starveplenty-b found elif_demir,
seed 9983, day 32: a sickness hurt row with died=true, living count 8→7
across day 32, elif absent from day-32+ meals — but NO death tele in
either instrument's death list (both list 14 deaths, neither includes
elif). This run's job: the living-count-delta vs tele-death cross-check.

Base pin (HEAD at prereg time): f52f08600550b0da8159849ffcfd5665c75e04f0
Branch: sim-sicktele-b (worktree ~/workspace/worktrees/sim-sicktele-b).
Prereg (committed in this same commit, written BEFORE any judged sweep):
evidence/2026-10-30/sim-sicktele-b-prereg-20261031T0007Z.md.
Zero src/js changes, zero policy-default changes, zero game changes.
DIAG ONLY. No merges, no pushes, no version bumps, no live verification
— the coordinator lands.

PRIOR-RUN NOTE: this worktree/branch already holds a completed run of
this same arm (run fleshout-loop-b-20261030T1332Z, prereg
evidence/2026-10-30/sim-sicktele-b-prereg.md, evidence
evidence/2026-10-30/sim-sicktele-b.md, commit e3491697c). That run
answered #1514: elif died in a contest via _cxKillContestant, which
never called registerDeath — 2 gaps on 9983 (elif + marcus_webb), 0
gaps on its 8-seed pilot band 10201-10208. This re-run does NOT
overwrite that run's files: every file below carries the
-20261031T0007Z suffix, and the prior prereg/evidence/traces stay
intact. This re-run judges itself ONLY against its own prereg's GO
threshold (the brief's threshold, which differs from the prior run's
header), on a FRESH census band the prior run never swept, plus a
9983 reproduction at the CURRENT head.

## Verdict: DIAG-NO-GO on this run's pre-registered threshold

Both clauses of the brief's threshold fail at the current head:

1. The 9983 elif gap does NOT reproduce on re-run. At the current
   head, seed 9983 runs a DIFFERENT trajectory: 38 days (was 39),
   10 teles (was 14), 6 roster exits — all tele-matched, 0 gaps.
   Elif does not die at all in this trajectory: she is on the final
   roster when the village scatters on day 38, alive at health 49
   after a day-36 monster wound (43 damage) and starvation hits.
   Marcus Webb is likewise alive at the scatter. The reproduction
   clause fails because the trajectory moved, not because the
   mechanism was refuted in place — the elif event simply no longer
   occurs on 9983.
2. The fresh census finds ZERO unmatched living-count deaths on any
   further seed: 8 seeds (10211-10218), 83 roster exits, 83 named
   (coverage 1.0), 83 delta-deaths, 0 gaps, 0 phantom lethal hurts.
   So the second clause (>=1 unmatched death on at least one
   further seed with a named distinguishing pattern) also fails.

Per §14 the run is DIAG-NO-GO, not re-scored into a GO. The NO-GO
here is good news twice over, and the reason is a landed fix (below):
the contest-death record gap the prior run named is no longer in the
code — arm sim-contestdeath-b (commit 06b502d53, backlog #1541)
landed a registerDeath call inside _cxKillContestant, and this
census proves it live: seed 10213's villager contest death
(david_kim, day 126) carries a tele, a fallen entry, and a
registerDeath record from _cxKillContestant itself, with no phantom
field corpse (by design — the body died on camera in the arena,
off-map). The prior run's fix proposal is now landed code, verified
by an independent band, not just by its own arm.

## Plain-words answer first

Elif's missing death tele is gone in two senses. First, on seed 9983
itself, the story changed: the village that used to lose her in a
contest now keeps her alive through a different, harder winter — she
takes a bad monster wound on day 36, goes hungry, and still walks
away with the village when it scatters on day 38. There is no day-32
death to miss anymore on this seed. Second, and more importantly,
the hole her case exposed has been filled: contest deaths for
ordinary villagers now go through the same death record as every
other death. In the fresh census, the one villager who died in a
contest got the full record — the village said his name, the death
tele fired, and his name went into the fallen list. A death census
built on teles alone would now count him. The tele lists and the
living-count deltas agree on all 89 exits across all 9 traces in
this run.

## Leg 1 — REPRODUCTION, seed 9983 (fidelity: DIVERGED, reported)

Same instrument (scripts/trace-sicktele-b.js), same policy
(competent), same 180d death-aware horizon — different trajectory:

| | prior run (base 0794a8846) | this re-run (HEAD f52f08600) |
|---|---|---|
| days / end | 39 / village-lost | 38 / village-lost |
| teles / registers | 14 / 14 | 10 / 10 |
| roster exits | 7 | 6 |
| gaps | 2 (elif, marcus — contest) | 0 |
| starvation deaths | 1 (gen_a29exbk d39) | 3 (d32, d36, d37) |
| elif_demir | contest-killed d32, no tele | alive at scatter, final roster |
| marcus_webb | contest-killed d23, no tele | alive at scatter, final roster |

The new 9983's six exits, all TELE-DEATH: sam_wilson (sickness d24),
gen_mr1pr0r (wound d27), henry_zhang (wound d28), gen_7cclmvb
(starvation d32), gen_925shtf (starvation d36), gen_a29exbk
(starvation d37). Final roster at the day-38 scatter (6 living):
gen_dcif40j, gen_8hvtc45 (scholar), mateo_alvarez, marcus_webb,
elif_demir, desmond_clarke. Fallen: exactly the six exits. Exiles:
none. Elif's own trace in this trajectory: sickness ticks days
15-18 (3/day, recovered), monster encounters days 23/28/33 (0
damage), a 43-damage monster wound day 36 (100 → 57), starvation
hits days 36-37 (57 → 53 → 49). She never leaves the roster, never
takes a lethal hit, never gets a tele — because she never dies.
The prior run's elif event is not refuted as a mechanism; it is
absent from this trajectory. Seed trajectories are perishable across
base moves (precedent: docs/SIM-INSTRUMENTS.md rule 248), and this
is a clean instance: the same seed, the same instrument, a
different story.

## Leg 2 — FRESH-SEED CENSUS, seeds 10211-10218, competent, 180d death-aware

No confirm was spent: the brief's bar needs only the pilot 8, and
the pilot band is fully classifiable (coverage 1.0 pooled), so no
added seeds were warranted or swept.

| seed | days | end | exits | named | delta-deaths | gaps | phantom |
|------|------|-----|-------|-------|--------------|------|---------|
| 10211 | 176 | village-lost | 14 | 14 | 14 | 0 | 0 |
| 10212 | 180 | survived | 14 | 14 | 14 | 0 | 0 |
| 10213 | 180 | survived | 8 | 8 | 8 | 0 | 0 |
| 10214 | 158 | village-lost | 13 | 13 | 13 | 0 | 0 |
| 10215 | 180 | survived | 4 | 4 | 4 | 0 | 0 |
| 10216 | 88 | village-lost | 12 | 12 | 12 | 0 | 0 |
| 10217 | 180 | survived | 5 | 5 | 5 | 0 | 0 |
| 10218 | 180 | survived | 13 | 13 | 13 | 0 | 0 |
| POOLED (census) | | 5 survived / 3 lost | 83 | 83 | 83 | 0 | 0 |
| POOLED (+ 9983) | | | 89 | 89 | 89 | 0 | 0 |

Every exit in all 9 traces is TELE-DEATH. Registers == teles on
every seed (no REGISTER-NO-TELE anywhere). No REMOVAL-NO-REGISTER,
no NON-DEATH-EXIT, no UNEXPLAINED-DELTA anywhere. Cause split of
the unmatched set is therefore empty by construction — there is no
unmatched death to split, on any cause, in any phase, through any
instrument path. (For context, the matched tele deaths span the
wild, sickness, starvation, wounds, monster, arena, stranger,
ambush, and contest causes; the contest/arena teles in the census
are player:true scholar deaths except one — david_kim below.)

### The one contest death in the band — the fix, proven live

Seed 10213, david_kim, day 126: removeVillager how 'killed', caller
_cxKillContestant, rosterAfter false, dead flags true — AND
registerDeath day 126 kind villager cause 'contest', caller
_cxKillContestant — AND tele day 126 kind villager cause 'contest',
player:false — AND a fallen entry — AND no field corpse. The say
line the same day: "David is gone. The village will say the name
for a long time." Code at HEAD (src/js/contests.js _cxKillContestant
~6049, comment citing sim-contestdeath-b 2026-10-30, backlog #1541)
now calls registerDeath for villager contest deaths, then removes
the corpse registerDeath just built (the death happened on camera
in the System's arena, off-map — no honest field tile, so no
phantom lootable body at the scholar's feet), while keeping tele,
grief, deeds, and deathSeen. A grep of contests.js now finds 10
registerDeath mentions (the prior run found zero). The prior run's
"never calls registerDeath" claim is now false at HEAD, superseded
by commit 06b502d53 — which is exactly why this band shows 0 gaps
where the prior band's mechanism would have produced one here.

## Reachability verdict (DIAG arm — stated, not overclaimed)

This arm instruments death bookkeeping only; it does not measure
wave reach, Arc reach, regional/national/table reach, or the win
flag, and no such verdict is claimed from it. What the traces do
show as end states: 9983 village-lost day 38 (scatter, 6 living);
census 5 of 8 villages survived to the 180d cap, 3 village-lost
(days 176, 158, 88). No run in this band ended on a win flag or a
table event — but the instrument does not record those, so that
absence is not evidence about reachability either way.

## Village assessment (what the villages looked like)

The new 9983 village is a small, hungry village that scatters
rather than dies out: six deaths (one sickness, two wounds, three
starvations) and six living walkers, Elif among them — battered
(wound + hunger, health 49) but alive. Nothing in its death
bookkeeping reads wrong: every death has a tele, a fallen entry,
and a grief line, and the roster at the scatter matches the living
exactly. The census villages are unremarkable in the best way:
people die in the wild, of sickness, of hunger, in the arena — and
every single one is counted. The blank the parent arm found (the
village grieves out loud and keeps no grave) is closed for contest
deaths: David's grave is the fallen list, and his tele is in the
books. No robotic, static, or repeated behavior was sampled in this
band beyond what the death instrument sees; villager-behavior
judgment beyond death bookkeeping is out of this arm's scope.

## Sense test (SENSE-TESTING LAW — read the transcripts)

There is no gap event in this band to sense-read, so the sense
check falls on the two nearest things: the new 9983's deaths and
the band's one contest death. Both read clean. The new 9983's
deaths each arrive with a story line (e.g. day 27: "Diya is gone.
The wound was too much. Nobody eats much tonight."; day 28: "Henry
is gone. The wound was too much. Somebody's sleeping-roll stays
rolled out.") plus a tele and a fallen entry — story and books
agree. David's contest death reads the same way: the "is gone"
line, the tele, the fallen entry — story and books agree, and the
only deliberate absence is the field corpse, which the code
justifies (arena death, off-map) rather than hides. A player
watching any death in this band would know who died and why, and
would find the same answer in the village's records. Contrast the
prior run's elif case (story said the name, books held nothing):
that split does not occur anywhere in this band.

## Blanks filled / documented (builder, not critic)

FILLED (verification): the prior run's fix proposal is now verified
landed and live — _cxKillContestant calls registerDeath at HEAD
(commit 06b502d53), proven by an independent fresh band (10213
david_kim), not by re-reading the fixing arm's own proof. The
#1514 question can now be closed as answered-and-fixed, not merely
answered-with-proposal: the tele lists and the living-count deltas
agree on 89/89 exits in this run and 81/81 in the prior pilot band
combined with the fixed path's live proof.
DOCUMENTED, NOT CHASED: seed-trajectory perishability on 9983
(39d/14-tele story → 38d/10-tele story across the base move) means
seed-pinned findings must be re-checked at the current head before
being cited as live facts; this run is itself that re-check for
#1514. No game fix is proposed or landed here (DIAG ONLY by
prereg); the fix already exists upstream.
NOT RE-LITIGATED: the sicktick post-mortem-tick wrinkle (stale sick
records ticked after a contest death) from the prior run's evidence
— no post-mortem tick occurs in this band (no contest death
precedes a sickness tick on a corpse here), so it is neither
confirmed nor refuted by this run; it stands as the prior run
documented it.

## Convergence state

converging (diag, not a lever). #1514 is now ANSWERED AND FIXED as
far as measurement goes: mechanism named (prior run), fix landed
(06b502d53), fix verified live on a fresh band (this run, 10213
david_kim), and the original seed's gap event no longer occurs at
the current head. Coordinator: #1514 can move to closed on this
evidence; no further tele-gap census is warranted unless the death
plumbing is touched again. No lever lands from this arm (DIAG ONLY
by prereg).

## Proof

scripts/test-sicktele-b-rerun.js: 18/18 GREEN — 9983 re-run 38d
village-lost with elif + marcus alive at the scatter and 0 gaps;
census pooled 83 exits / 83 named / 0 gaps / 0 phantom; coverage
1.0 on every seed; 10213 david_kim removal + register + tele via
_cxKillContestant day 126, fallen true, corpse false (by design);
zero src/js diff vs HEAD (diag-only guard); no tracked file
modified (new files only). No concurrent jest was run; this proof
is a node script, not a jest suite. Prior run's proof
(scripts/test-sicktele-b.js) was NOT re-run or modified — it
asserts on the prior run's files, which are untouched.

## Files

- Prereg (this run): evidence/2026-10-30/sim-sicktele-b-prereg-20261031T0007Z.md
- Evidence (this run): evidence/2026-10-30/sim-sicktele-b-20261031T0007Z.md (this file)
- Proof (this run): scripts/test-sicktele-b-rerun.js
- Traces (this run): evidence/2026-10-30/sim-sicktele-b-20261031T0007Z-trace-9983.json,
  sim-sicktele-b-20261031T0007Z-trace-10211.json ... -10218.json (9 files)
- Census analysis (this run): evidence/2026-10-30/sim-sicktele-b-20261031T0007Z-pilot-analysis.json
- Instrument reused verbatim (prior run): scripts/trace-sicktele-b.js,
  scripts/analyze-sicktele-b.js
- Prior run (untouched): evidence/2026-10-30/sim-sicktele-b-prereg.md,
  evidence/2026-10-30/sim-sicktele-b.md,
  evidence/2026-10-30/sim-sicktele-b-trace-9983.json,
  evidence/2026-10-30/sim-sicktele-b-trace-10201.json ... -10208.json,
  evidence/2026-10-30/sim-sicktele-b-pilot-analysis.json,
  scripts/test-sicktele-b.js
- Fix landed upstream (not this arm): commit 06b502d53 sim-contestdeath-b

## Metric review (§14 — required section)

- Pre-registered metrics bind this run; no re-scoring occurred.
  Both clauses of the brief's threshold are reported as MISSED,
  not reinterpreted: the 9983 elif gap does not reproduce (elif
  survives in the new trajectory), and the census has 0 unmatched
  deaths on every further seed. The verdict is DIAG-NO-GO even
  though the underlying question is now answered-and-fixed — the
  bar, written before the fix landed, assumed the gap still
  existed to be reproduced. That is a bar-calibration outcome, not
  a measurement failure.
- Metric issue 1 (seed-pinned reproduction bars go stale): a
  "reproduces on seed X" clause is hostage to base moves. The
  9983 trajectory changed wholesale (39d/14 teles → 38d/10 teles)
  between the prior run and this one. Proposed revision for the
  NEXT run: pin a reproduction clause to a mechanism probe (e.g.
  "a _cxKillContestant death in any swept seed carries a tele")
  rather than to one seed's exact event, and report seed-trajectory
  fidelity as its own line, not as the verdict.
- Metric issue 2 (threshold written pre-fix): this run's bar
  required >=1 unmatched death, but the fix it was verifying had
  already landed upstream (06b502d53). A verification re-run's bar
  should be "0 gaps + at least one exercised fixed path" (which
  this band satisfies: 0 gaps, david_kim exercising the fixed
  path), not ">=1 gap". Proposed revision for the NEXT run:
  verification arms pre-register a zero-gap bar with a
  fixed-path-exercised clause. Not applied retroactively here.
- Metric issue 3 (exit dating, carried from the prior run): an
  exit is dated to the next villageEats entry snapshot; the
  analyzer matches removals within [lastSeenDay, exitDay]. No
  exit in this run needed the fallback.
- No metric revision is applied to this run's numbers. All
  revisions above are proposals for the NEXT run.
