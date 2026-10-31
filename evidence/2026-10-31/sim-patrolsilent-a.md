# sim-patrolsilent-a — the patrol-silent seeds census (DIAG-GO)

Run: Loop A worker, arm sim-patrolsilent-a, axis scale-onramp, run
fleshout-20261031T1415Z. Deferred (not killed) from run
fleshout-20261031T1315Z by the EPERM flap; this run completes it.
DIAG ONLY: zero src/js changes, zero policy-default flips. A
fixable small lever, if found, is documented as a next arm, not
built here.
Worktree branch: sim-patrolsilent-a. Base anchor: 19b3e1ae0
(this worktree's HEAD at sweep time; pocketdesign's anchor was
003a9c2f391e — the base moved between the two censuses, which
matters: see §Base drift).
Pre-registration: evidence/2026-10-31/sim-patrolsilent-a-prereg.md
(written BEFORE any judged sims, plus one pre-sims amendment
replacing the pocketdesign-hash gate with a same-base paired
neutrality gate, for the stated reason that the base moved).
Instrument: scripts/patrolsilent-diag-20261031.js (PSILDIAG=1,
v2 — see §Instrument notes) + scripts/patrolsilent-sweep-20261031.js
(S-PATROL stack verbatim) + scripts/patrolsilent-analyze-20261031.js
(derives every judged number from the per-seed JSONs only).
Proof: scripts/test-patrolsilent-20261031.js — 34/34 GREEN
(pure functions, synthetic corpus incl. the pre-claimed case,
live gate: sweep seed 85901 60d twice byte-identical + once
without instrument with identical dayHashes + caller regression
guard + beat atHaven == playerAtHaven() on a live game).
No [needs-eyes] (measurement only; nothing player-facing ships).
Panel (§15): NOT APPLICABLE, none fabricated — single-base DIAG
census, not a before/after lever comparison (same declaration
as pocketdesign-a). A later lever arm reusing this corpus as
its baseline runs the panel then.

## Verdict: DIAG-GO (judged exactly against the prereg)

1. Pilot neutrality + cleanliness — GO. 8 pilot seeds, instrument
   errors 0 on every seed; paired with/without-instrument runs
   on 85104 and 85108 give IDENTICAL full-horizon dayHash
   sequences (90 and 92 hashes respectively).
2. Silent seeds classified — GO under the pre-sims amendment.
   85107: CRED (cred-eligible villager-beats 0, cred holders 0).
   85111: FIT-FIRST 100% (197/197 cred beats consumed by fit).
   85114: FIT-FIRST 100% (109/109, corrected join — see
   §Instrument notes). 85104, silent on the old base, is NOT
   silent on this base (64 attempts): reported as
   NOT-REPRODUCED with the numbers, per the amendment, not
   forced into a cause.
3. Contrast — GO. 13/16 seeds patrol-active (8–65 attempts) with
   the same table, same units.
4. Call path verified live — GO. Every patrol assignTask row on
   every checked seed has caller delegateBeat (100%); every
   non-assignTask patrol sighting is 0 on silent seeds (silent
   on ALL paths, not just assignTask).

## The answer, in plain words

Scholar presence is NOT the binding constraint — it never was on
this band. The leader is at Haven for 88–100% of upkeep beats on
all 16 seeds, and 100% on all three silent seeds. A village with
the leader home every single part can still go a whole run
without anyone ever being asked to walk the perimeter, for two
different reasons, and the census caught both in the wild:

(a) NOBODY TO ASK (85107): 17 villagers, zero with combat
    cred — no combat occupation, no monster kill in any
    agency record, across 306 upkeep beats. The leader asked
    1,626 times that run; never once for patrol, because the
    rule only lets them ask someone with a uniform or a kill.
(b) THE WRONG RULE ASKS LAST (85111, 85114): each village HAS
    exactly one cred holder, and that person earned their cred
    by killing (3 kills for a mechanic, 2 for a farmer) — but
    the leader's pick order checks the day job first. The
    mechanic mends 271 times and never patrols; the farmer
    cooks 257 times and never patrols. The kill that should
    have qualified them is invisible to the branch that runs
    first. On the old base both villages patrolled (85111: 44
    attempts; 85114: 48 patrol departures, mostly task-lead) —
    the silence is roster-and-base dependent, not a law of the
    seeds.

The general shape: patrol coverage on this band is a roster
lottery. Thirteen villages patrol because one or two people
happen to hold cred and happen not to be fit-trapped (a
police officer gives 15 attempts, a firefighter 64); three
villages don't, for the two reasons above. Fit-first is not a
general tax (fit share 0.00–0.06 on every active seed) — it is
a total block only when the village's ONLY cred holder is also
fit-routed. And the danger roll itself never starves a village:
on active seeds every cred beat that reaches the danger branch
produces patrol or hunt at the policy's own rates; there is no
seed where cred beats reach danger and all roll away.

## Band numbers (judged band, 16 seeds, S-PATROL stack, this base)

- Patrol attempts: 13/16 seeds active (8–65); silent: 85107,
  85111, 85114 (0 attempts, 0 beat-boundary patrol-assignment
  sightings, 0 patrol task-lead sightings — silent on all
  paths, not just assignTask).
- Upkeep presence (scholar at Haven at beat time): 88.5–100%
  per seed; silent seeds 100% (306/306, 600/600, 321/321).
  Away beats, where they exist, are real expeditions: 85104
  21 beats at distance 7, 85106 33 at distance 2, 85113 3 at
  distance 3, 85116 22 at distance 5–6.
- Cred holders per seed: 0–5 (median 2). Single-holder seeds
  produce all their attempts from that holder (85101: police
  officer, 15; 85104: firefighter, 64; 85110: street artist
  with 1 kill, 13).
- Cred-beat fit share: 0.00 on 11 active seeds, 0.06 on 85108,
  1.00 on both fit-trapped silent seeds.
- Pre-claimed cred beats (competent's water/fish staffing
  stands before delegateBeat, so pickTask never runs for that
  villager that beat): 0–16 per seed — a minor tax, never the
  binding constraint anywhere.
- Patrol rows by caller: 100% delegateBeat on every checked
  seed. Other assignTask callers in the same beats: assignOne
  (competent water), assignAnother / counterPlay (competent
  staffing), staffDeadfall (deadfall staffing) — none ever
  assigns patrol.
- Wall numbers (this substrate, labeled as pocketdesign's):
  national 10/16, table 11/16, wins 11/16, wave 4 reached
  14/16, wave 5 reached 0/16, median survival 94 days, max
  201 days. Arc II/III/IV reach, four-realm formation, trap
  acquisition by source, counter discovery/kill rates, and
  young-link succession survival are NOT instrumented in this
  substrate and are NOT reported.

## Seed-by-seed table (all numbers from the analyzer, v2 join)

- s85101: 111d, nat 1, table 1, won 1, w4 1. beats 333,
  atHaven 333 (100%). assigns 3016, patrolAtt 15 (stood 5,
  refused 10). credVB 40, fit 0, danger 40 (patrol 15, hunt 9).
  roster 17, holders 1 (police officer, 0 kills, 15 picks).
- s85102: 111d, village-lost, nat 1, table 0, won 0, w4 1.
  beats 333, atHaven 333 (100%). assigns 2108, patrolAtt 9
  (stood 0, refused 9). credVB 22, fit 0, danger 22. holders 1
  (police officer, 9 picks).
- s85103: 90d, nat 0, table 1, won 1, w4 1. beats 270,
  atHaven 270 (100%). assigns 1758, patrolAtt 47 (stood 40,
  refused 7). credVB 141, fit 0, danger 141. holders 2
  (infantry soldier 44 picks, hunter 3). patrolLeadSight 68
  (task-lead residual — patrol calls exceed attempts here,
  as in pocketdesign).
- s85104: 90d, nat 1, table 1, won 1, w4 1. beats 270,
  atHaven 249 (92.2%). assigns 2155, patrolAtt 64 (stood 46,
  refused 18). credVB 171, fit 0, danger 171. holders 1
  (firefighter, 64 picks). NOT-REPRODUCED: silent (0) on the
  old base, 64 here — the roster on this base holds a
  firefighter the old trajectory did not surface as a picker.
- s85105: 92d, nat 1, table 1, won 1, w4 1. beats 276,
  atHaven 276 (100%). assigns 2498, patrolAtt 13 (stood 11,
  refused 2). credVB 51, fit 0, danger 51. holders 2 (HVAC
  tech 1 kill 13 picks; trail crew lead 1 kill 0 picks).
- s85106: 96d, nat 1, table 1, won 1, w4 1. beats 288,
  atHaven 255 (88.5%). assigns 2038, patrolAtt 52 (stood 13,
  refused 39). credVB 128, fit 0, danger 128. holders 2
  (firefighter 1 kill 39 picks; wild food forager 1 kill
  13 picks).
- s85107 SILENT (CRED): 102d, village-lost, nat 1, table 0,
  won 0, w4 1. beats 306, atHaven 306 (100%). assigns 1626,
  patrolAtt 0. credVB 0, fit 0, danger 0. roster 17, holders 0.
  noCredVB 1330, hpLowVB 32, preClaimed 73. Roster
  occupations include rancher, farmer, mechanic, nurse,
  paramedic, army medic — none matches the delegate combat
  regex (hunter|soldier|police|marine|ranger|security|
  firefighter|boxer|mma), and no roster member ever records
  a monster kill. Deadfall hauls 11 (nonzero — work happens;
  patrol assignment never does).
- s85108: 92d, nat 0, table 1, won 1, w4 1. beats 276,
  atHaven 276 (100%). assigns 2238, patrolAtt 64 (stood 64,
  refused 0). credVB 228, fit 13, danger 215. holders 5
  (infantry soldier 45 picks; paramedic 1 kill 19 picks;
  blacksmith 1 kill, fisherman 2 kills, fishing guide
  2 kills — 0 picks each). patrolLeadSight 115.
- s85109: 131d, village-lost, nat 0, table 0, won 0, w4 1.
  beats 393, atHaven 393 (100%). assigns 2906, patrolAtt 8
  (stood 7, refused 1). credVB 15, fit 0, danger 15. holders 2
  (army medic 1 kill 6 picks; night security guard 2 picks).
- s85110: 90d, nat 0, table 1, won 1, w4 1. beats 270,
  atHaven 270 (100%). assigns 1462, patrolAtt 13 (stood 13).
  credVB 26, fit 0, danger 26. holders 1 (street artist,
  1 kill, 13 picks). preClaimedCred 13.
- s85111 SILENT (FIT-FIRST 1.00): 201d, survived, nat 1,
  table 0, won 0, w4 0. beats 600, atHaven 600 (100%).
  assigns 5177, patrolAtt 0. credVB 197, fit 197, danger 0.
  holders 1: mechanic, 3 kills, 0 picks — delegate picks
  mend 271 times, rest 8. The ONLY cred holder's every
  cred-eligible beat is consumed by the mend branch, which
  runs before the danger branch. Old base: 44 attempts,
  33 patrol departures — silence is base-dependent.
  Deadfall hauls 12.
- s85112: 114d, nat 1, table 1, won 1, w4 1. beats 342,
  atHaven 342 (100%). assigns 2485, patrolAtt 65 (stood 61,
  refused 4). credVB 180, fit 0, danger 180. holders 2
  (firefighter 13 picks; firefighter 52 picks).
- s85113: 62d, village-lost, nat 0, table 0, won 0, w4 0.
  beats 186, atHaven 183 (98.4%). assigns 1732, patrolAtt 42
  (stood 15, refused 27). credVB 128, fit 0, danger 128.
  holders 2 (police officer 7 picks; night security guard
  35 picks).
- s85114 SILENT (FIT-FIRST 1.00, corrected join): 107d,
  nat 1, table 1, won 1, w4 1. beats 321, atHaven 321 (100%).
  assigns 2989, patrolAtt 0. credVB 109, fit 109, danger 0.
  holders 1: farmer, 2 kills, 0 picks — delegate picks cook
  257 times (specialistSkill preserver 2 routes to cook
  before the danger branch). 13 further cred beats are
  pre-claimed by competent water staffing (not danger-roll
  misses — the v1 join misread them; see §Instrument notes).
  Old base: 12 attempts, 48 patrol departures — silence is
  base-dependent. Deadfall hauls 7.
- s85115: 90d, nat 0, table 1, won 1, w4 1. beats 270,
  atHaven 270 (100%). assigns 2126, patrolAtt 36 (stood 14,
  refused 22). credVB 124, fit 0, danger 124. holders 2
  (ESL teacher 1 kill 0 picks; infantry soldier 36 picks).
- s85116: 92d, nat 1, table 1, won 1, w4 1. beats 270,
  atHaven 248 (91.9%). assigns 1501, patrolAtt 41 (stood 33,
  refused 8). credVB 89, fit 0, danger 89. holders 2 (trail
  crew lead 3 kills 33 picks; hunter 8 picks).

## The assignment call path (traced, then verified live)

- In sims, Game.assignTask is called from exactly these
  policy paths (all verified in the corpus by caller):
  delegateBeat (scripts/policies/delegate.js:148, via
  policy.upkeep) — the ONLY patrol caller; competent
  assignOne/workWater (competent.js:989/992) — water;
  assignAnother / counterPlay (competent.js:1629/1658) —
  staffing by occupation; staffDeadfall (deadfall-b) —
  deadfall. The harness wraps Game.assignTask in a telemetry
  wrapper (sim-harness.js `const w`, reported as Object.w)
  which sits between every policy caller and the method —
  see §Instrument notes.
- Gates BEFORE any patrol attempt counter increments
  (delegateBeat → pickTask, delegate.js):
  1. Scholar at Haven at upkeep time (playerAtHaven,
     game.js: Manhattan ≤ 1 from the village node). The
     whole beat is skipped if false. On this band this
     gate almost never binds (88.5–100% presence).
  2. Villager already holds an assignment this part
     (snapshot-held, or pre-claimed by competent's upkeep
     staffing earlier in the same beat) → skipped, no call.
  3. pickTask order: hp < 40 → rest; specialistSkill
     cook/preserver ≥ 2 → cook; fisherman/sailor → fish;
     farmer/gardener/botanist/herbalist → garden;
     carpenter/mechanic/engineer/tailor/seamstress → mend;
     teacher-ish + 50% → teach; THEN hp ≥ 60 AND combatCred
     → 35% patrol / 25% hunt; else need-based. combatCred =
     agency monsterKills > 0 OR combat occupation regex.
  4. Engine gates AFTER the attempt (trust ≥ 20 for patrol,
     wounded < 40 HP outdoor refusal) explain stood/refused
     splits (e.g. s85102: 9 attempts, 0 stood, 9 refused) but
     never zero attempts.
- Non-assignTask patrol paths: deal / appeal direct writes
  (game.js:4491, 4577) and task-lead auto-resolution
  (game.js resolveAssignments taskLeads loop) — these explain
  pocketdesign's residual (calls > attempts, e.g. s85103:
  47 attempts, 68 lead sightings here). Silent seeds show 0
  sightings on these paths too.

## Sense test (SENSE-TESTING LAW, scoped honestly)

This corpus records state, not narration, so no transcript is
quoted as read — the people-read is from positions and
assignments, and it is sharp. The leader is home: on silent
seeds the scholar spends every upkeep beat within a node of
Haven while 1,600–5,200 assignments go out — the village is
being run, just never run toward the treeline. The two
fit-trapped holders read as people the system mis-sees: a
mechanic who has killed three times and spends 271 beats
mending, a farmer who has killed twice and spends 257 beats
cooking. Their kills are in the record; the leader's own rule
never looks at the record before looking at the job title.
And the 85107 village reads as a place with no one to send:
17 people, jobs from rancher to piano tuner, and the rule
that only a uniform or a kill qualifies — a rule no one
there meets. That is a coherent village, not a broken counter.

## Instrument notes (read before reusing)

- v1 → v2 caller fix: the v1 instrument reported caller
  Object.w on every row — the sim-harness verb-telemetry
  wrapper, not a policy. v2 skips it (and sim-harness
  frames) and reports delegateBeat / assignOne /
  assignAnother / counterPlay / staffDeadfall. v1 and v2
  corpora are byte-identical on every field except caller
  and the instrument string (verified seed by seed) — the
  fix is count-neutral and trajectory-neutral.
- v1 → v2 join fix (material): the v1 analyzer joined the
  LAST assign in a beat as "the pick", which misread
  competent's pre-beat water claims as delegate danger-roll
  misses (s85114: 13 water beats). The v2 join takes only
  delegateBeat rows as picks and buckets stood non-delegate
  rows as pre-claimed. This changed s85114's fit share from
  0.89 to 1.00 and its credDanger from 13 to 0 — the
  corrected verdict is FIT-FIRST, not mixed. All other
  seeds' verdicts are unchanged by the fix (patrol rows
  were already 100% delegateBeat).
- Read-only discipline held: no RNG draws, no game-state
  writes (agency kills read RAW from state.village.agency
  when present, never via agencyOf which creates entries;
  persons read from data.villagers only, never via getPerson
  which hydrates seeds). Neutrality proven by identical
  dayHash sequences with/without the instrument (full
  horizon, 85104 + 85108; 60d on 85901 in the proof test).
- EPERM flap episodes during this run: (1) git index writes
  refused at session start (worked around with
  GIT_OPTIONAL_LOCKS=0 for reads); (2) all three proof-test
  sweep legs left 0-byte outputs during a ~2-minute /tmp
  write denial (sweep now retries writes up to 5 minutes
  and exits non-zero on failure instead of shipping a
  partial corpus, and resumes valid per-seed outputs on
  re-run — anchor + instrument validated, 0-byte files
  re-run). No judged number comes from a retried or
  partial write.

## Base drift (why 85104 and the old silent set differ)

Pocketdesign ran on anchor 003a9c2f391e; this census runs on
19b3e1ae0 (which includes the lootabilities merge and other
intervening work). Trajectories moved on most seeds (days,
wall flags, deadfall hauls all shift; cross-base table in the
analyzer output). Consequences: 85104 stopped being silent
(0 → 64 attempts), and 85111/85114 — active on the old base —
became silent. The backlog question ("why do 85104/85107
record zero attempts") therefore has a base-dependent part:
on THIS base the silent set is {85107, 85111, 85114}, and the
mechanisms above are the current-base answer. A future
re-run on a later base must re-establish silence before
quoting these mechanisms for its own seeds.

## Findings for the coordinator (reported here, NOT edited into hidden_files/sim-findings.md — coordinator owns that file)

- B1 ANSWERED (mechanisms, this base): patrol silence is
  combat-cred availability (85107: no holder at all) or
  fit-first trapping of the sole kills-earned holder (85111:
  mechanic→mend; 85114: farmer→cook). Scholar presence is
  ruled out band-wide (88.5–100%, silent seeds 100%).
- N1 (next arm, NOT built — DIAG ONLY): kills-earned cred
  should reach the danger branch despite a fit-first
  occupation (danger before fit when monsterKills > 0, or a
  kills-cred override). Test seeds 85111 + 85114: currently
  0 patrol attempts; the arm predicts > 0 with no other
  change. This is the single smallest lever the census
  supports.
- N2 (measurement, not a fix): roster-lottery census — how
  often does a village start with zero combat occupations
  AND no kills pathway (the 85107 shape)? Needs a
  roster-generation census across fresh seeds.
- N3 (open, minor): pre-claimed cred tax (competent water/
  fish staffing before delegateBeat) peaks at 16 beats on
  85108 — never binding here, but it is a real funnel
  stage a future census should keep.
- UNTRACED (fenced off, not a verdict input): WHY
  water assignments persist across beats in beat-boundary
  snapshots (held water: 619 beats on 85107) despite
  per-part resolution — possibly wait-phase NPC initiative
  re-issuing duty after advancePart. Reported with numbers,
  mechanism not traced in this arm.
- Adjacent pocketdesign parity note (B2, NOT chased per
  brief): patrols don't screen sickness while expeditions
  do — still open, untouched by this census.

## Metric review (for the NEXT run, never a re-score of this one)

1. The prereg's caller clause assumed the first stack frame
   past the instrument is the policy caller; in real sweeps
   the harness verb wrapper sits between. Future instrument
   preregs should name wrapper frames to skip (sim-harness
   `w`) up front.
2. The prereg's per-beat join assumed one assign per
   villager-beat; competent staffing + delegateBeat can both
   touch one villager in a beat. Future census preregs
   should define the pick as the delegateBeat row and
   pre-claimed as its own bucket from the start.
3. The prereg's silent-seed clause assumed the old-base
   silent set reproduces; base drift moved it. Future
   silent-seed preregs should name the re-establishment
   step as the first gate (this run's amendment did, and it
   is what caught 85104's non-reproduction).
4. 'Range'/'no-call-recorded' buckets stayed empty on this
   band (every at-Haven beat produced a delegateBeat row
   for every unheld, unclaimed villager) — the instrument
   can drop the no-call bucket's prominence, but keep it:
   it is the detector for a future scholar-moves-during-
   upkeep change.
5. Fit share as a single number hides the two-holder shape
   (one trapped, one free — 85108). Future reports should
   split fit share per holder, not just per seed.

## Convergence state

converging — the scale-onramp axis measurement: the
patrol-silent question is answered with mechanisms on this
base (cred absence vs fit-first trapping, presence ruled
out), and the next lever (N1) is priced and seeded. No game
change landed in this run (measurement only); the full seat
remains 0 on wave-5 reach (0/16) on this band, though
national/table/wins read 10/11/11 on the policy substrate's
flags, not ordinary-play claims.

## Files

- Pre-registration: evidence/2026-10-31/sim-patrolsilent-a-prereg.md
  (including the pre-sims amendment)
- Evidence: evidence/2026-10-31/sim-patrolsilent-a.md (this file)
- Instrument: scripts/patrolsilent-diag-20261031.js (v2)
- Sweep: scripts/patrolsilent-sweep-20261031.js (S-PATROL
  stack verbatim; EPERM-tolerant writes + resume)
- Analyzer: scripts/patrolsilent-analyze-20261031.js (v2 join)
- Proof: scripts/test-patrolsilent-20261031.js (34/34 GREEN)
- Corpora: evidence/2026-10-31/perseed-patrolsilent-a/
  s85101–s85116.json (27MB, v2 instrument throughout;
  v1 corpus preserved at /tmp/ps-v1-corpus for the audit,
  NOT committed)
- Reused, unmodified: scripts/policies/delegate.js,
  scripts/policies/deadfall-b.js, and the full S-PATROL
  policy stack (tribfloor / windefer / seatdrive /
  fullseat-diag) — policy variants, not game changes
- Probe outputs (quoted above, /tmp, not committed):
  /tmp/ps-caller-probe.js, /tmp/ps-caller-probe2.js,
  /tmp/ps-noinstr-full/, /tmp/ps-proof-a|b|noinstr/
