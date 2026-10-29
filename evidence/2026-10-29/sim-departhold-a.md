# sim-departhold-a — DEPARTURE-HOLD RECORDER: DIAG-GO (the silent overwrite is now recorded, and it never fired on a wave-4 hunt in this band)

Run: flesh-out loop, run fleshout-20261029T0915Z.
Axis: scale-onramp (blocking axis, converging, NOT converged).
Worker: sim-departhold-a.
Assignment: DEPARTURE-HOLD RECORDER (diag, FIRST next step from
sim-pickdepart-a). DIAGNOSIS ONLY — zero game-behavior changes,
zero default flips, zero policy changes, zero lever. The
HUNT-holds-through-danger lever itself is a LATER run and is
NOT built here.
Preregistration (binding, committed BEFORE any judged leg):
evidence/2026-10-29/sim-departhold-a-prereg.md (commit 85b2d8431
on branch sim-departhold-a). This evidence judges the recorder
against that prereg. No metric was changed mid-run.
Closeout note: the run coordinator timed out before closeout;
this evidence was written by the recovery closeout from the
committed prereg, the committed instrument, the untracked
sweeps, and the untracked analysis. The recovery re-ran the
analyzer on the corpora and reproduced the worker's analysis
JSON byte-identically, and re-ran the fixtures green (25/25).
Nothing in the verdict rests on the timed-out worker's word.

VERDICT: DIAG-GO — all four pre-registered legs pass. The
recorder classifies every wave-4 HUNT pick in the ON corpus
(2/2, 0 unknown), records zero wave-4 overwrites under
complete evaluation coverage, leaves no unrecorded overwrite
anywhere, and moves nothing in the game (OFF vs ON deep-equal).
The pickdepart danger-overwrite inference is answered on
branch (b) of the prereg: zero overwrites, every primary
pick's fate explained by recorded events. The overwrite
mechanism itself is proven real and recorded — on non-wave-4
picks, where it fired twice with full verdict chains.
The recorder is adoption-ready: the build coordinator should
ADOPT this recorder rather than rebuild it, then judge the
HUNT-holds-through-danger lever as the second step.

## Plain words first

A villager who decides to go back for a big beast does not
always walk out the door. Until now, when the decision
vanished between the choice and the walk, nobody could say
why — the game left no record at all. This arm built a
recorder that watches the doorway: every time a villager
with a hunt decision is checked for danger, sickness, and
departure, the recorder writes down the verdict.

In eight fresh villages, two villagers picked a wave-4 hunt.
One woman's hunt died the same afternoon because dinner
outranked it — and that replacement IS recorded, as a new
dinner decision. The other woman held her hunt ready for
two days while sick, then walked out when she was well and
the danger check said go — every step recorded. No wave-4
hunt was silently overwritten in this band.

But the silent overwrite is real, and the recorder caught
it twice on smaller hunts: a villager's hunt decision was
replaced by an indoor chore after a danger check said
"tighten," with no record in the base game — exactly the
vanishing the pickdepart arm could only infer. The recorder
makes that vanishing visible. The doorway is now watched.

## Header (pre-registered) vs result

Substrate (named, never switched): tableseat-nowait. Sweeps:
fresh band, seeds 75101-75108, 180d death-aware,
LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1,
RETURNS=1, FUNNEL=1, DEPARTHOLD=1 (ON corpus) or unset
(OFF corpus). Instrument committed before either sweep ran;
nothing else committed until sweeps + analysis were done.
Corpora: evidence/2026-10-29/perseed-departhold-off/ and
perseed-departhold-on/ (8 seed rows + summary.json each).
Analyzer: scripts/test-departhold-a.js (pure reads over
both corpora + src/data/monsters.json wave lookup).
Fixtures: scripts/test-departhold-a-fixtures.js (25/25).
Instrument: scripts/policies/departhold-diag.js (policy-side
recorder, DEPARTHOLD=1 gated, zero src/js).

PRIMARY UNIVERSE (binding): every pick record in the ON
corpus whose chosen.kind == 'HUNT' and whose chosen.huntMid
maps to a wave-4 monster. Each pick gets exactly one class
by the prereg's priority order.

- GO LEG 1 — COMPLETENESS: 100% of wave-4 HUNT picks
  classified into a named mechanism, ZERO 'unknown':
  RESULT 2/2 classified, 0 unknown -> PASS.
- GO LEG 2 — NO UNRECORDED OVERWRITES: every departhold
  evaluation for a wave-4 HUNT objective carries its danger
  verdict or a named no-attempt reason; no evaluation has
  action 'other' or 'other-held'; every 'overwritten'
  evaluation carries a danger verdict + subtype:
  RESULT wave4Evals=6, other=0, otherHeld=0,
  overwriteWithoutVerdict=0, orphanOverwrites=0,
  wave4OverwrittenEvals=0 -> PASS. (The 788
  dangerOutside records are the gossip-retarget danger
  re-runs on 'out' objectives, counted and reported
  separately per the prereg; they are not departure
  verdicts and never feed a classification.)
- GO LEG 3 — OVERWRITE QUESTION ANSWERED, branch (b):
  zero wave-4 overwrites AND every primary pick's fate
  explained by recorded events (legs 1 + 2 holding):
  RESULT 0 wave-4 overwrites; pick 1 explained by a
  recorded superseding dinner pick, pick 2 explained by a
  recorded 6-evaluation chain ending in departure ->
  PASS. Branch (a) (a recorded wave-4 overwrite) did
  NOT occur: leg3a_recordedOverwrite=false. Plainly
  stated, as the prereg requires: the fresh band does
  NOT reproduce the nikos d173 chain from pickdepart —
  that old trajectory is not re-tested, and the verdict
  rests on the fresh band's own chains, as the prereg
  allows. What the fresh band DOES prove directly is
  that the overwrite path is real and recordable: two
  recorded tighten-overwrites on wave-1 hunts (below).
- GO LEG 4 — PERTURBATION: OFF vs ON identical on the
  judged channels per seed (funnel picks, returns
  meetings / departures / drops, wall numbers):
  RESULT diffs=[], equal=true -> PASS. A recorder that
  moves the game cannot measure it; this one moves
  nothing.

DIAG-GO requires ALL legs. All four pass.

## Judged numbers

Primary universe, ON corpus (2 picks, both seed 75106,
both monster eulogy, wave 4, pick day 135 part 536,
hunt day 132):

| villager | class | fate, as recorded |
| --- | --- | --- |
| visjoin_113 | superseded-by-needs-pick | first later pick part 539 day 135 chose EAT; 0 departure evaluations — replaced before any departure check |
| visjoin_115 | departed-pick-linked | departure part 544 day 137; 6 evaluations: 5 held-ready (no-attempt-early-return, reason sick), then departed, danger go/1 |

Classes: superseded-by-needs-pick 1, departed-pick-linked
1, unknown 0. Wave-lookup coverage complete:
unknownWave=[].

## Guards (reported, NOT re-scored into DIAG-GO)

OFF = ON = lottery base, exactly, on every guard:

| guard | OFF | ON | lottery base |
| --- | --- | --- | --- |
| starvation deaths | 1 | 1 | 1 |
| deaths total | 286 | 286 | 286 |
| median days | 146 | 146 | 146 |
| wave-4 reach | 6 | 6 | 6 |
| wins | 3 | 3 | 3 |

Drift comparison (reported, not scored): lotteryPrimary 2,
lotteryDeparted 1, freshPrimary 2, freshDeparted 1 — the
fresh band reproduces the lottery band's primary counts.

Recorder hygiene: 8/8 ON rows installed, diag errs 0,
overflow empty in every ON row. OFF rows carry
departhold: null — the key exists as a null placeholder,
no section, no records; install never ran. (Prereg
wording said "no departhold section at all"; the
substance — zero OFF records — holds exactly.)

Determinism: the recovery re-run of the analyzer on the
same corpora produced output byte-identical to the
worker's analysis JSON
(evidence/2026-10-29/departhold-a-analysis.json).
Fixtures re-run: 25 passed, 0 failed.

## Secondary census (reported, not judged): the overwrite, caught

Same taxonomy applied to ALL HUNT picks (all waves) in
the ON corpus — 6 picks: departed-pick-linked 3,
overwritten-danger 2, superseded-by-needs-pick 1.

The two overwritten-danger picks are the mechanism the
pickdepart arm inferred, now with full verdict chains
(both seed 75106, villager visjoin_102, monster murkcap,
wave 1):

- Pick day 108 part 428 -> eval part 429 day 108:
  danger tighten/4 -> tighten-overwrite, HUNT replaced
  by HAVEN_CHORE indoor.
- Pick day 108 part 431 -> eval part 432 day 109:
  danger tighten/5 -> tighten-overwrite, HUNT replaced
  by HAVEN_CHORE indoor.

In the base game neither overwrite leaves a pick record,
a departure record, or a narration line. With the
recorder, the danger verdict, the score, the subtype,
and the indoor-chore landing are all on the record.

## Sense bar: verdict chains, verbatim from the ON corpus

PICK s75106 visjoin_113 eulogy d135 part=536 huntDay=132
-> superseded-by-needs-pick (first later pick part=539
day=135 chose EAT)
  (no evaluation records for this pick)

PICK s75106 visjoin_115 eulogy d135 part=536 huntDay=132
-> departed-pick-linked (dep part=544 day=137)
  EVAL part=537 d135 dayPart=1 atHaven=true fresh=false
  action=held-ready sub=no-attempt-early-return
  reason=sick danger=[] heal=[] tighten=[] depart=[]
  EVAL part=538 d135 dayPart=2 atHaven=true fresh=false
  action=held-ready sub=no-attempt-early-return
  reason=sick danger=[] heal=[] tighten=[] depart=[]
  EVAL part=540 d136 dayPart=0 atHaven=true fresh=false
  action=held-ready sub=no-attempt-early-return
  reason=sick danger=[] heal=[] tighten=[] depart=[]
  EVAL part=541 d136 dayPart=1 atHaven=true fresh=false
  action=held-ready sub=no-attempt-early-return
  reason=sick danger=[] heal=[] tighten=[] depart=[]
  EVAL part=542 d136 dayPart=2 atHaven=true fresh=false
  action=held-ready sub=no-attempt-early-return
  reason=sick danger=[] heal=[] tighten=[] depart=[]
  EVAL part=544 d137 dayPart=0 atHaven=true fresh=false
  action=departed sub=null reason=null
  danger=[{"verdict":"go","score":1}]
  heal=[{"satOut":false,"cached":false}] tighten=[]
  depart=[{"ret":true,"postState":"out"}]

Judgment (SENSE-TESTING LAW): visjoin_115 reads like a
person making a choice — sick for two days, she holds a
dangerous decision ready instead of dropping it, then
walks when she is well and the danger check says go.
visjoin_113 reads like an errand queue overwriting a
decision — dinner outranks the hunt the same afternoon —
but unlike the inferred danger overwrite, the replacement
IS recorded as a decision of its own (the EAT pick).
The murkcap tighten-overwrites read like the queue at
its worst: a decision silently becomes an indoor chore.
The recorder does not fix that; it makes it visible,
which is what a diagnosis owes the lever that follows.

## What this does NOT prove

- The nikos d173 danger-overwrite chain itself was not
  re-created: the fresh band's trajectories diverge from
  the lottery band's, and no wave-4 pick met a non-'go'
  danger verdict here. Leg 3(b) is a coverage argument
  (no gap for an overwrite to hide in), not a sighting
  of a wave-4 overwrite. The direct proof — a seeded
  fixture driving objMaybeDepart on a ready wave-4 HUNT
  under a non-'go' verdict — remains open (see metric
  review).
- The HUNT-holds-through-danger lever is NOT judged
  here: no lever was built, no hold behavior changed.
  The lever's prereg should use this recorder's chains
  as its baseline.
- The primary universe is small (n=2). DIAG-GO judges
  the instrument, not the frequency of wave-4 hunts:
  the pickcensus arm (same run) established that
  scarcity separately — 4 wave-4 HUNT picks across 24
  villages in the older bands.

## Metric review (for the NEXT run — never a mid-run re-score)

Carried from the prereg, plus one wording note:

(a) Whether 'overwritten-danger' should stay split from
supersession classes by evaluation part (overwrite before
first later pick) or merge into a supersession family with
an overwrite flag. The two murkcap chains argue for
keeping the split: the overwrite fires inside a departure
evaluation, not at a pick, and that distinction is the
whole point of the recorder.
(b) Whether the agency-steal path (objTick) needs its
own recorder before the HUNT-hold lever is judged, if any
pick lands unknown. None landed unknown here, so the
question stays open, not urgent.
(c) Whether leg 3(b) ("refuted by zero overwrites under
complete coverage") is too weak a refutation when the
fresh band's trajectories diverge from the nikos chain —
the next prereg should decide whether a targeted
re-creation of the nikos conditions (a seeded fixture
driving objMaybeDepart on a ready wave-4 HUNT under a
non-'go' verdict) is owed as a direct proof of the
overwrite path, independent of band luck. This
evidence's answer: yes, it is owed before the lever
lands, because the lever's whole premise is that
verdict.
(d) Wording note: the prereg's hygiene line ("OFF rows
carry no departhold section at all") is satisfied as
departhold: null with zero records, not as a missing
key. The next prereg should say "null or absent" to
match the sweep's placeholder.

## Handoff to the build coordinator

The departhold recorder (scripts/policies/departhold-diag.js,
DEPARTHOLD=1 gated, zero src/js) is DIAG-GO and
adoption-ready — ADOPT it rather than rebuilding it.
Adoption inputs, all landing with this arm: the
instrument + fixtures commit, the analyzer
(scripts/test-departhold-a.js), the corpora
(evidence/2026-10-29/perseed-departhold-off/ and
perseed-departhold-on/, seeds 75101-75108), and the
analysis (evidence/2026-10-29/departhold-a-analysis.json).
Recorder first, HUNT-holds-through-danger lever second —
that order is the pickdepart arm's ranked recommendation
and this arm confirms the first half is done.
