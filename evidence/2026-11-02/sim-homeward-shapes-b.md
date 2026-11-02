# sim-homeward-shapes-b — A/C shape screen on fresh pilot bands (DIAG-NO-CANDIDATE)

Run: oversight-flesh-out-loop-b, arm sim-homeward-shapes-b
(coordinator brief 2026-11-02, run
fleshout-loop-b-20261102T1505Z). Worktree sim-homeward-shapes-b,
branch sim-homeward-shapes-b.
Prereg: evidence/2026-11-02/sim-homeward-shapes-b-prereg.md
(committed e2751e59f BEFORE any reproduction or pilot sim).
Instrument: evidence/2026-11-02/sim-homeward-shapes-b-prereg.md's
episodes analyzer committed e2751e59f (proof 10/10, below).
Convergence state: the extended (A/C-inclusive) definition
finds nothing on fresh bands, and — the larger finding —
NEITHER prototype reproduces on the current substrate: a
single intervening landing re-routed both prototype seeds
before their prototype days. The pilot verdict is judged
on the fresh bands alone, per the prereg; the reproduction
divergence is reported in full, not used to re-score the
pilot.

## What was built (policy-side ONLY, zero game-code change)

Nothing in any policy file changed. Reused, byte-identical
(verified by the proof test's git check): scripts/
homext-abl-b-driver.js, scripts/analyze-homeward-substrate-b.js,
scripts/analyze-homext-abl-b.js, scripts/analyze-homeveto-screen-b.js,
scripts/policies/competent-homewardstep-b.js,
scripts/policies/competent-homewardstep-outwardonly-b.js.
New in this run: scripts/analyze-homeward-shapes-b.js
(episodes mode: A/C definitions + veto E table, prereg
definitions implemented literally from exact driver fields)
and scripts/test-homeward-shapes-b.js (its proof).
Zero src/js, zero competent.js edits, zero policy-default
flips, zero bundled fix — this arm is INSTRUMENT/SCREEN
ONLY, as briefed. A GO would have been DIAG-GO for a
follow-up build, never a landing in this run.

## Canon note

docs/CANON.md read first; docs/MAP.md states the way home
as travel through the same travelTo pipeline. No canon doc
covers the pocket guard itself: it is a policy-side sim
instrument (a competent variant), not a game system, so
there is no canon to invent from — the guard's E(D) model
is inherited verbatim from the predecessors.

## REPRODUCTION (before any pilot band was judged — DIVERGES on both shapes)

Fresh runs, reused driver unchanged, same substrate as
the 1345Z screen (competent, 30d, DEPOSITGATE=0,
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, packcomp
*=1 flags not 1): seed 67105 and seed 68001, shadow
baseline + armed full. Reproduction files:
sim-homeward-shapes-b-repro67105-{baseline,armed}.jsonl and
sim-homeward-shapes-b-repro68001-{baseline,armed}.jsonl.
Per the prereg, definitions were NOT re-tuned to chase
the divergence, and the pilot proceeded on the prereg
definitions regardless.

### Shape A, 67105 — DOES NOT REPRODUCE (bar: shadow day-5 walk-out + fail, armed day-5 veto + pass)

| Field | Stored 1345Z | Fresh, this run |
|---|---|---|
| Shadow day 5 walk-out | (4,4)->(6,4)->(7,4)->(7,2)->(7,1), all simOk=true | Scholar never walks out: ends (4,4), dayEnd true, kcal 1160 |
| Shadow day-5 dayEnd | false at (7,1) | true at (4,4) |
| Shadow days 5-9 end | (7,1), dayEnd false, kcal -> 0 | (4,4) every night, dayEnd true |
| Armed day 5 | homeward veto (7,1)->(6,1), ends (7,2), dayEnd true | homewardVetoes 0, ends (4,4), dayEnd true |
| Armed days 5-8 | vetoes (7,2)->(6,2), ends (7,2), dayEnd true; home day 9 | No vetoes, no camp, home every night |

The fresh 67105 scholar DOES still travel far later in
the month — armed away-end days 20-27, 17 total vetoes
(0 homeward), 2 spoken veto lines (days 22-23) — but the
days 5-9 (7,1) pocket episode is gone entirely.

### Shape C, 68001 — DOES NOT REPRODUCE (bar: armed day-8 mid-trip start, origin-passing veto, day-end pass)

| Field | Stored 1345Z | Fresh, this run |
|---|---|---|
| Armed day 8 start | (2,8), already out, != haven (4,4) | (4,3), ends (4,3), dayEnd true |
| Armed day 8 homeward vetoes | 4, vetoOriginPass 4 / Fail 0: (2,8)->(4,8) x3, (0,8)->(4,8) x1, all simOk=false, originSimOk=true | 0 vetoes of any kind |
| Shadow day 8 | attempts (2,8)->(4,8) simOk=false, ends (2,8) passing | Ends (4,3) passing, no (2,8)->(4,8) attempt |
| Fresh away pattern | Camp at (2,8) days 7-10 | Ends away days 5-9 (a different, quiet trip), home otherwise, 0 vetoes either leg |

### The divergence starts early, and its cause is bounded to one landing

Days 1-2 are IDENTICAL between stored and fresh 67105
shadow legs (kcal 2400 -> 2370, no hops) — seeding and
harness agree. Day 3 is the first divergence: stored
(4,4)->(4,3)->(4,4), end kcal 1050; fresh
(4,4)->(4,3)->(3,4)->(5,4)->(4,4), end kcal 1010. From
there the trajectories separate completely (chaotic
RNG cascade after the first differing decision).
The ONLY src delta between the 1345Z results commit
(6e4ba33e9) and this branch is journey landing r72
(c0cf1d401, 15:02Z, after the 1345Z screen): game.js
door enter/exit `ensureVillagerPositions()` refreshes
(+10), convo-wants away-commit guard (+16), convo-dialogue
failed-commit line surfacing (+8/-2). No src change
sits between the substrate branch base (15ac6077c) and
its results commit. So the prototype re-routing is
attributable to the r72 code delta as a whole; which of
its three files moved the day-3 decision is NOT isolated
here (isolating it would be a bisect, not this arm's
job, and is recorded as a backlog note, not chased).
This is NOT a claim that r72 is a bug — it is a
demonstration that single-trajectory prototypes are
fragile across landings, which is why this run's prereg
required reproduction before screening.

## PILOT SCREENING (both budgeted bands, disclosed, none qualifies)

Per band, BOTH legs fresh with the ablation driver (30d,
substrate above): baseline 'competent' under the SHADOW
guard and armed 'competent-homewardstep-b' (full guard).
Judged by the new episodes analyzer (A/C definitions in
the prereg); screening files are screening evidence
only, NEVER judged legs.

| Band | Base away-end days | Armed away-end days | Armed vetoes (total) | Armed homeV | Shadow failing day-end days | Episodes A | Episodes C | Result |
|---|---|---|---|---|---|---|---|---|
| 1. 69301-69308 | 12 (69307: 11, 69308: 1) | 7 (69307: 6, 69308: 1) | 63 (all 69307) | 9 (all 69307) | 11 (all 69307, days 4-14) | 0 | 0 | NO-GO: near-miss only (see 69307) |
| 2. 69401-69408 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | NO-GO: dead band (sleeps home every night) |
| TOTAL 16 seeds | 12 | 7 | 63 | 9 | 11 | 0 | 0 | 0 candidate episodes |

Primary metric: 0 candidate episodes under the extended
(A/C-inclusive) definition on 16 fresh seeds. Prereg
verdict: NO-GO (DIAG-NO-CANDIDATE). At 1 episode the
verdict would have been DIAG-ONE; at >= 2, DIAG-GO for
a follow-up build. Neither threshold is approached, and
no re-scoring is applied (metric binding, §14).

## The 69307 near-miss (why 0 episodes coexists with 9 homeward vetoes)

Seed 69307 is the only pilot seed where anything
pocket-like happens, and it is a precise near-miss for
shape A — close enough to validate the definition's
armed-pass clause, not close enough to count:

- Shadow: day 4 walks (4,4)->(2,4)->(1,4), then approach
  hop (1,4)->(1,2) E-FAILS (shape-B echo of 64601), yet
  the scholar proceeds to (1,1) and camps days 4-9 with
  failing day-end sims, kcal -> 0. After a succession
  (player death day 10, 'the wild'), a new scholar walks
  day 10 (4,4)->(6,4)->(7,4)->(7,2)->(7,1) all
  hop-time-passing, then fails onward and camps (5,0)
  days 11-14, failing, kcal -> 0; home day 15.
- Armed: day 4 outward vetoes (1,4)->(1,2) x2 turn the
  scholar home — the (1,1) pocket never forms. Day 5
  walks the IDENTICAL walk-out to 67105 shape A:
  (4,4)->(6,4)->(7,4)->(7,2)->(7,1), all simOk=true,
  ends (7,1) kcal 1040 with dayEnd FALSE — the
  entry-tile E-divergence (hop-time pass vs day-end
  fail) reproduces exactly. But unlike 67105-armed,
  which stepped (7,1)->(7,2) (simOk=true) and bedded
  down passing, 69307-armed never attempts (7,1)->(7,2):
  every attempted step out of (7,1) is vetoed
  (homeward (7,1)->(4,1)/(6,1), outward (7,1)->(6,0)/
  (7,0)/(8,1)), and the scholar stays at (7,1) days
  5-10 with dayEnd FALSE and kcal 0 — the same stranded
  fate the guard was meant to prevent, now with vetoes
  instead of silence.
- Why it is NOT an A episode: clause 2 requires armed
  day-end PASSING. Here armed day-end fails on every
  veto day (days 5-10). The analyzer correctly rejects
  it. The lesson is the clause doing real work: vetoes
  alone do not rescue a scholar; rescue needs a passing
  step out, and 67105 had one ((7,2)) where 69307 has
  none. This stranded-veto pattern is named here as
  SHAPE D (A-entry, no rescue) — a documented
  non-candidate pattern for the next design, never a
  retroactive candidate.

## Veto E table (pre-registered divergence report)

Every armed homeward veto in the pilot bands, with
hop-time E (vetoed hop simOk) alongside day-end E
(armed dayEndReturnSim.ok). Full per-veto lines are in
sim-homeward-shapes-b-pilot1-episodes.txt /
pilot2-episodes.txt; the table below is the complete
count.

| Band | Vetoes | Disagree (hopE != dayEndE) | Hop-explains (hop false, day-end true) | Agree-fail (both false) | Agree-pass |
|---|---|---|---|---|---|
| 69301-69308 | 9, all 69307 days 5-10: (7,1)->(4,1)/(6,1), all originSimOk=false | 0 | 0 | 9 | 0 |
| 69401-69408 | 0 | 0 | 0 | 0 | 0 |
| TOTAL | 9 | 0 | 0 | 0 | 0 |

On this pilot, hop-time E does NOT explain any veto
better than day-end E: every vetoed step fails AND the
day-end position fails too. That is the opposite of the
prototype pattern (67105 days 6-8, 68001 day 8: hop
false, day-end true) — and it is consistent with shape
D: these vetoes are a stranded scholar's refused
attempts, not a fence from escapable ground. The
entry-tile divergence DOES reproduce once (69307-armed
day 5: walk-out hop (7,2)->(7,1) simOk=true vs day-end
false), but without the armed rescue it is not a
candidate. No C-LOOSE days occurred (0).

## Balanced panel (§15, context never verdict)

Combined campaign on pilot band 1 (`node
scripts/balance-panel.js --out /tmp/homeward-shapes-b-panel
--policies competent,competent-homewardstep-b --seeds
69301,...,69308 --days 30 --par 4` — 16 cases, 0 reused,
sourcesStable true, neutrality matched on both policies,
0 warnings). Raw panel archived as
evidence/2026-11-02/sim-homeward-shapes-b-panel.json.gz.
Per-policy panel rows: survived 16/16 across both legs;
won / national / table 0 on both legs (expected 30-day
pre-seat profile, not a regression). No split-panel
compare is claimed: policy-split panels can never match
(predecessor finding), and no panel verdict is needed
for a diagnostic run. The panel expresses the two
policies, not the shadow instrument — stated
deliberately, per the prereg: that is why it is context,
never verdict. The guard's work (or its absence) on
these bands sits below the panel's 30-day resolution,
as in the 1345Z run.

## Wall numbers (in-window only, never pooled across arms)

Driver substrate, all pilot + reproduction legs (20
seed-legs): median survival 30d on every leg; survived
8/8 seed-legs on every leg (driver endReason; player
deaths under succession do not end the village — e.g.
69307 records player deaths days 10/14/26 while the
village survives); maxWaveUnlocked never above 3
(band 1: wave 3 on 6/8 seeds both legs; band 2: wave 3
on 3/8 seeds both legs); wave 4-5 unlocks 0 on all 16
pilot seeds on both legs. Panel substrate, band 1:
national / table / wins 0 on both legs. No wall
movement is shown or claimed: this run screens shapes
and reproduces prototypes, it does not move the scale
wall.

## Sense-testing (transcripts, not just counts)

- The veto line reads true wherever it speaks, and its
  silence pattern is now fully characterized: 69307-armed
  has 63 total vetoes but only 6 spoken lines — 1 on
  day 4 (the outward turn-back) and 5 on day 5 (every
  veto that day, outward and homeward) — then total
  silence days 6-10 while the scholar sits at (7,1)
  with kcal 0, starving. The first-day-speaks rule
  means the village hears the fence go up once, then
  hears nothing while a person starves behind it. That
  is the carried narration question from the
  predecessors, now at its sharpest: a once-per-route
  reminder after long silence would read more human
  than six lines then nothing. This is a narration
  question about the guard, not a bar failure and not
  candidate evidence.
- The fresh 67105 transcripts contain no pocket story at
  all: the scholar sleeps home days 5-9 and talks
  ordinary village talk. The fresh 68001 transcripts
  contain a quiet out-trip (away days 5-9) with no veto
  lines on either leg. Nothing robotic appears in any
  reroute or home-stay; the strangeness in this run is
  absence (the prototypes' stories simply do not happen
  on this substrate), not incoherence.
- What the transcripts never contain in this run: a
  homeward veto line on a rescued (armed-passing) trip
  — because no such trip exists in 16 fresh seeds. The
  homeward lines that DO exist (69307 days 5-10) belong
  to shape D: a stranded scholar being refused steps
  that would not save it anyway.

## Village assessment (plain words)

Across 16 fresh villages, fifteen scholars essentially
sleep home every night for the whole month: band 2 is a
dead band (zero away-end days on either leg), and band
1 has only two villages that ever sleep out. The one
village with a story is 69307, and it is a hard one told
twice. Without the guard, a scholar walks to a pocket
at (1,1), sits there six days while its food runs to
nothing, dies, and its successor walks to another pocket
at (5,0) and sits there four more days the same way.
With the guard, the first pocket never forms — the
scholar is turned back at the approach and comes home
fed — but the second story replays in a new key: the
scholar walks the same good-looking route to (7,1) that
saved the 67105 scholar, the ground turns to a trap
under it during the day, and this time there is no step
out that works, so it sits at (7,1) six days with food
at zero while the guard vetoes every step it tries. The
guard is not useless here — it prevented the first
pocket outright — but on the second pocket it can only
say no; it cannot say where to go instead. Everywhere
else, the villages are quiet: people forage near home,
come back fed, and never meet the far ground where
these stories live. What is still missing is a trip
that walks out clean, faces its trap on the way home,
and is actually rescued by the homeward guard — the
67105 shape, on fresh seeds, on this substrate.
Sixteen more seeds did not produce one, and the
prototype that proved the shape possible no longer
runs that way at all.

## Verdict: NO-GO (DIAG-NO-CANDIDATE; reproduction DIVERGES on both prototypes)

- REPRODUCTION FAILS on both prototypes, precisely:
  67105 day-5 pocket episode absent (fresh scholar home
  all of days 5-9, 0 homeward vetoes); 68001 day-8 fence
  absent (fresh scholar at (4,3), 0 vetoes either leg).
  First divergence 67105 day 3; only src delta in
  history is r72. Per the prereg, definitions were not
  re-tuned and the pilot was judged as written.
- SCREENING FAILS to qualify: 0 candidate episodes
  (A or C) in 2 bands / 16 seeds; the budget is spent,
  no band qualifies, screening stops. Per the prereg,
  NO extension verdict (GO or NO-GO for the extension
  itself) is claimed beyond the pilot's DIAG-NO-CANDIDATE:
  the extension's judged status remains what 1345Z left
  it (unproven on a natural band, not disproven), now
  with the added fact that its prototypes do not
  reproduce on the current substrate.
- The 9 armed homeward vetoes on band 1 are reported in
  full above as non-candidate firing evidence (shape D).
  They do NOT change the verdict (metric binding).

## Metric review (for the NEXT run, never a re-score)

- The A definition's armed-day-end-passing clause is
  load-bearing and must stay: 69307 proves that
  dropping it would count stranded-veto episodes
  (shape D) as candidates. Any future A screen that
  counts vetoes without the rescue is measuring the
  fence, not the rescue.
- Prototype fragility is now a first-class screening
  cost: both 1345Z prototypes were re-routed by a single
  small landing (r72) before their prototype days. Any
  future run that leans on a stored trajectory must
  re-validate the prototype on the current substrate
  FIRST (as this prereg required) and must budget for
  the possibility that the prototype is gone. A
  constructed-trip substrate (a seeded trip that
  forces the walk-out) remains the surest route to a
  judged A/C pilot, since natural-band hit rates are
  now 0/16 here and 0/64 for the entry shape at 1345Z.
- The E-divergence report's negative result matters:
  on fresh bands, hop-time E and day-end E agree on
  every veto (both fail). The hop-explains-better
  pattern exists only in the (non-reproducing)
  prototypes. A future screen should not assume
  hop-time E adds information over day-end E on natural
  bands; it should keep recording both, because the
  disagreement is itself the signal when it appears.
- Shape D is now named and needs a design question,
  not a screen: when the guard vetoes every step out
  of a pocket the scholar entered through a
  hop-time-passing walk-out, the scholar starves in
  place with vetoes instead of silence. Whether the
  guard should offer an escape (a lateral step, a
  wait-out, a call for help) is a Steve-call design
  question — it is NOT answered by counting vetoes.
- The silent-repetition narration question is carried,
  unchanged, sharpened by 69307: 63 vetoes, 6 spoken
  lines, then silence through a starvation. A
  once-per-route reminder after long silence would read
  more human. Steve-call, about the guard's narration,
  not about the extension.
- Screening yield note (carried, updated): A/C
  candidate episodes run at 0/16 fresh seeds here (and
  0/64 for the approach-clean entry shape at 1345Z);
  armed homeward vetoes of ANY shape run at 9/16 seeds
  here counting vetoes (1/16 seeds counting seeds with
  any homeward veto — 69307 only), all shape D. A
  future natural-band search for A/C should assume a
  near-zero hit rate.
- Blanks filled or documented: filled — the A/C
  episode definitions, implemented and proof-tested,
  with the veto E table as a standing instrument.
  Documented — (a) the 2-band pilot ledger above;
  (b) the precise per-field reproduction divergence
  for both prototypes with the r72 bound; (c) shape D
  as a named non-candidate pattern; (d) the
  sharpened silent-repetition narration question. No
  game or policy change was made — correctly, since
  there is no judged effect to land. Findings outside
  this arm are listed below as backlog notes only, not
  chased mid-run.

## Findings backlog notes (for the coordinator to append to hidden_files/sim-findings.md)

- [open] 2026-11-02 — homeward-guard — shape D named:
  A-entry walk-out (all hop-time-passing) with no
  passing step out, so the armed scholar starves at
  (7,1) days 5-10 on 69307 while the guard vetoes every
  attempted step (9 homeward vetoes, origin-fail,
  day-end-fail). Question: should the guard offer an
  escape when it can only say no? (this run's evidence).
- [open] 2026-11-02 — sim-reproducibility — r72
  re-routes stored prototypes: journey landing r72
  (door position refresh + away-commit guard) moves
  the first differing decision on 67105 to day 3 and
  erases both 1345Z homeward prototypes (67105 shape A,
  68001 shape C) on fresh runs. Prototype-based work
  needs current-substrate re-validation before screening
  (this run's evidence).
- [open] 2026-11-02 — guard-narration — silent
  repetition sharpened: 69307-armed speaks 6 veto lines
  (days 4-5) then silence days 6-10 through a kcal-0
  stranding, across 63 total vetoes. Once-per-route
  reminder after long silence would read more human
  (this run's evidence, carried from predecessors).

## Census (proof, not judged evidence)

scripts/test-homeward-shapes-b.js: ALL PASS (10 checks
— A episode grouping, A rejections (armed-fail,
walk-out-fail), C episode, C-loose, A-precedence, veto
E counts, pilot-band-vs-banned, reused-files-unmodified).
Predecessor proof tests re-run post-commit as regression
checks (counts quoted in the coordinator report):
scripts/test-homeward-substrate-b.js,
scripts/test-homext-abl-b.js, scripts/test-homeveto-screen-b.js.

## Corpora

- evidence/2026-11-02/sim-homeward-shapes-b-prereg.md
- evidence/2026-11-02/sim-homeward-shapes-b.md (this file)
- evidence/2026-11-02/sim-homeward-shapes-b-repro67105-{baseline,armed}.jsonl (+ .log)
- evidence/2026-11-02/sim-homeward-shapes-b-repro68001-{baseline,armed}.jsonl (+ .log)
- evidence/2026-11-02/sim-homeward-shapes-b-pilot1-{baseline,armed}.jsonl (+ .log)
- evidence/2026-11-02/sim-homeward-shapes-b-pilot1-episodes.txt
- evidence/2026-11-02/sim-homeward-shapes-b-pilot2-{baseline,armed}.jsonl (+ .log)
- evidence/2026-11-02/sim-homeward-shapes-b-pilot2-episodes.txt
- evidence/2026-11-02/sim-homeward-shapes-b-panel.json.gz
  (band-1 panel context, 16 cases)
- scripts/analyze-homeward-shapes-b.js + scripts/test-homeward-shapes-b.js
