# sim-departdiag-b — DIAG-GO: the departure gate is the return leg, not the road out

Run: oversight-flesh-out-loop-b, arm sim-departdiag-b, axis food-economy.
Worktree sim-departdiag-b, branch sim-departdiag-b. Base commit
f536e3ad33da39ed7c4ed6cc620277287405bed3 (fedevening's base 19b3e1ae0
is an ancestor; intervening landings include scale-onramp arms, axefirst,
corpsemove). DIAG ONLY: zero src/js changes, zero policy-default flips,
zero edits to any existing policy file, new files only. This worker does
NOT push, bump, or verify live; the coordinator merges. Status to
coordinator: committed on branch, pending coordinator merge.

## Verdict: DIAG-GO — gate identified AND quantified, with one bounded residue

The prereg (evidence/2026-10-31/sim-departdiag-b-prereg.md, commit
60158f3b, BEFORE any judged leg) defined departure as ending the day
away from Haven. Under that definition the census confirms fedevening
exactly: 0 departures on all 16 judged legs (8 seeds x guard + ON),
480 loop-days, 480 stays, 0 away-origin days, 0 creek evenings. But
the census REFUTES the plain reading of "never departs": the vessel
leaves Haven on 210 of 240 days per leg — it just comes home for
supper every night. The gate on the strand road was never the road
out. It is the return leg, and on this band the return never fails.

DIAG-GO under the prereg's clause because: (a) the gate is traced to
named code paths (below); (b) every haven morning in the judged
corpora is classified with its gate reading and outcome — 0 unknown
stays, 0 buffer-divergences, 0 recovering days; (c) instrument
integrity holds (8/8 files per leg, errs 0, 30 loop-days per seed,
guard/ON decisions identical, 15215 guard determinism re-run
byte-identical). The one residue — which routine leg moves the
vessel on 2 needTrip-false travel days — is stated explicitly below
and does not touch the gate: both days also ended at haven, so the
overnight-absence count is 0/480 regardless of which leg moved it.

## Canon read

docs/CANON.md first, then docs/TIME-ECONOMY.md (ticks/day-parts; node
travel free, the steps to the edge already cost; forage 16 ticks +
60 kcal). No canon doc covers the departure gate itself — stated in
the prereg, not invented.

## Prior evidence read in full before designing anything

- evidence/2026-10-31/sim-fedevening-b.md + prereg (DIAG, strand set
  empty on its base: 26 legs, 0 creek evenings, all evenings at haven,
  all 30 days survived; the day-7 departure, a routine lottery, now
  lands "stay"; metric-review doubt #3 — this arm IS that DIAG).
- evidence/2026-10-31/sim-windowcarry-b.md + prereg (NO-GO: on the old
  base the vessel departed loop-days 1-4 on 15215, both legs, then
  stranded — the departure itself was the road to the strand).
- evidence/2026-10-31/sim-morningcarry-b.md (trace-leg shape).

## Base-equality check (verbatim prior instrument, BEFORE judged legs)

scripts/morningcarry-trace-b.js UNMODIFIED on seed 15215, guard + ON,
DAYS=30, same substrate env, OUTDIR redirected to this arm's
basecheck dirs only:

| leg | end | evenings | creek | still | at haven | spawn vessel | errs |
|-----|-----|----------|-------|-------|----------|--------------|------|
| guard | survived | 30 | 0 | 0 | 30/30 | gen_gyft62f | 0 |
| ON | survived | 30 | 0 | 0 | 30/30 | gen_gyft62f | 0 |

Fedevening's stay-home base persists through the intervening landings
on this newer base. These corpora (sim-departdiag-b-basecheck-{guard,on})
are never mixed into judged corpora.

## THE CENSUS (judged) — 8 seeds x 2 legs, 30 days, nighttravel stack

Substrate: POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0, DEPOSITGATE=1, WOODCARRY=1, WOODWARM=0/1, DAYS=30.
Stack: withWoodwarm(withWoodcarry(nighttravel)), as the strand
censuses built it. Seeds: 15003, 15009, 15091, 15211, 15215, 15220,
15221, 15337. Transport: stdout-runner (one JSON line per seed to
stdout, stdout -> file in evidence/ in a foreground exec, idle
splitter, jsonl deleted after split; never /tmp).

Per-seed departures (guard and ON legs IDENTICAL — decisions
byte-identical, evenings identical minus the warmth field, on all
8 seeds, because no creek evening ever reaches woodwarm):

| seed | departures | stays | away-origin | creek still | first departure | daysAlive |
|------|------------|-------|-------------|-------------|-----------------|-----------|
| 15003 | 0 | 30 | 0 | 0 | — | 30 |
| 15009 | 0 | 30 | 0 | 0 | — | 30 |
| 15091 | 0 | 30 | 0 | 0 | — | 30 |
| 15211 | 0 | 30 | 0 | 0 | — | 30 |
| 15215 | 0 | 30 | 0 | 0 | — | 30 |
| 15220 | 0 | 30 | 0 | 0 | — | 30 |
| 15221 | 0 | 30 | 0 | 0 | — | 30 |
| 15337 | 0 | 30 | 0 | 0 | — | 30 |

Gate classes per leg (240 haven mornings; pooled over both legs the
same counts repeat, 480 total):

| gate class | per leg | meaning |
|------------|---------|---------|
| stay-needtrip-false | 30 | needTrip false at morning; vessel stays by routine decision |
| stay-day-trip-home | 210 | needTrip true, forage trip fired, vessel home by evening |
| stay-recovering | 0 | recovering() never gates a day on this band |
| stay-unknown-downstream | 0 | no stay lacks a gate reading |
| departed-buffer-divergence | 0 | no pre-daily/in-daily needTrip conflict observed |
| departed-needtrip-true | 0 | no overnight departure at all |

Evening outcomes per leg (guard; ON identical minus warmth):
already-inside 26, completed 213, blocked-combat 1 (15221 loop-day
23: a Big Loud fight live at the haven tile itself — vessel at
haven map 4,4, not an away evening).

## THE GATE, TRACED TO NAMED CODE PATHS

### 1. needTrip — scripts/policies/competent.js:949-964 (30 stay days)

    pantry = sum of village pantry kcalEach * units
    if (pantry < 25000 || s.kcal < Game.kcalCap() * 0.5) return true;
    if (day - (ctx._lastGiveDay || 0) >= 3) return true;
    return false;

needTrip is FALSE only when ALL THREE hold: pantry >= 25000 AND
vessel kcal >= 50% of cap AND gave within the last 2 days. Every
one of the 30 needTrip-false days satisfies all three exactly as
the code reads them (decomposition violations: 0, both legs). The
false days per seed (guard; ON identical): 15003 [1,2,21,22,24,25,
26,27], 15009 [1,2,26,27,28], 15091 [1,2], 15211 [1,2], 15215 [1,2],
15220 [1,2], 15221 [1,2,23,24,27,28,30], 15337 [1,2]. Days 1-2 are
spawn arithmetic (no give recorded yet, which the code reads as
day 0, so day - 0 < 3; pantry 47250 on 15215 day 1; vessel fed).
The later false days are genuine well-fed, recently-giving days
(e.g. 15221 day 27: pantry 83955, vessel 2400/2400, gave day 26).

### 2. The trip's own return — forageTripSeedFirst's trailing walkHome (210 days)

scripts/policies/competent.js:1487 — every forage trip ends with
`ctx.tripHomeDetours += walkHome(Game, hx, hy)`, walking home
whether or not the forage succeeded ("never strand the expedition"
is stoneRun's comment; the forage trip shares the shape). On all
210 trip days the vessel foraged (forageTrips delta 1-3) on near,
unblocked ground — 15215 days 3-8 read "Travel 1 tile to trail
edge", "Travel 2 tiles to forest floor", "Travel 1 tile to Haven"
— and every one of the 210 trip days carries the narrated return
"You walk back into Haven." (210/210). The nighttravel evening
step then finds the vessel already home (already-inside /
completed) and has nothing to rescue. The old strand's overnight
absence required this return to FAIL (a blocked creek path, a
ticks-short evening, combat away); on this band the return never
fails because the trips never go far enough, blocked enough, or
late enough to fail it.

### 3. What drives the trips (the needTrip-true split, 210 days/leg)

Vessel hunger NEVER drives a trip on this band: vessel kcal < 50%
of cap on 0/210 trip days (mornings run 2300-2400 against caps of
2400). The split of the other two conditions:

| seed | give-only | both | pantry-only |
|------|-----------|------|-------------|
| 15003 | 12 | 10 | 0 |
| 15009 | 4 | 18 | 3 |
| 15091 | 9 | 19 | 0 |
| 15211 | 2 | 26 | 0 |
| 15215 | 4 | 24 | 0 |
| 15220 | 2 | 26 | 0 |
| 15221 | 23 | 0 | 0 |
| 15337 | 2 | 26 | 0 |
| TOTAL | 58 | 149 | 3 |

The contribution rule (day - lastGive >= 3: "we're taking without
giving — forage") is present on 207/210 trip days; pantry shortage
alone drives only 3 days (all on 15009). On 15215 the vessel records
no give at all in week 1 (lastGive unset, read as day 0), so from
loop-day 3 the give rule alone fires the trip every day: day 7
reads pantry 23950 (< 25000), vessel 2374/2400, lastGive unset —
needTrip true, forage delta 3, home by evening, outcome completed.
That is the old "day-7 departure" on this base: a day trip, not an
overnight departure. The strand's day-7 was the vessel FAILING to
come home; this base's day-7 is the vessel coming home.

### 4. What the vessel does instead on the 30 true stay-home days

Garden beds broken behind the hall, water returns (+2/+3/+4 clean),
fish assignments handed out ("Fish. They'll report back by next
part."), talk, names learned (Elena, Quinn, Brian, Ava, David on
15215 days 1-2), pantry meals eaten. Activity classes over the 240
stay days per leg: assign 30, forage-trip 210 — exactly mirroring
the gate classes after the analyzer fix below. No silent days.

## RESIDUE (explicit unknown, not a claim)

Two needTrip-false days show multi-hop out-and-back travel with NO
forage delta: 15221 loop-days 27 and 28. Day 27 wanders creek ->
forest floor -> creek -> forest floor -> Haven across ~9 travel
legs, meeting a heron, Cliffhanger, and the Big Loud (which follows
it to the treeline, then stops at the boundary); day 28 repeats the
creek/forest shape with a mosquito follower, then garden work
(coax beds, harvest 60x Cattail) at home. Prime suspect is stoneRun
(competent.js:1367-1402: up to 3 frontier pushes via walkTo, then
"walk home whether or not stone was found"), which runs before the
needTrip check and multi-hops by design — but workTrapline /
counterPlay / flee sequences also multi-hop, and these records carry
no fogSteps/stoneRuns counter to distinguish them. The leg is
UNIDENTIFIED. It does not overturn the gate: both days ended at
haven, so the overnight-absence count stands at 0/480 either way.
A future arm that needs the leg should record ctx.fogSteps and
ctx.stoneRuns deltas per day.

## SENSE TEST (law) — PASS on what exists, with the gap stated

Read end to end: 15215 days 1-2 (both needTrip-false), 15215 days
3-8 (trip days), 15003's false stretch, 15221 days 27-28. The
stay-home village reads as people living days — dawn, spoilage
swept, hunger noted, pantry beans eaten (some off, narrated
honestly), water drunk, assignments handed out, a low-trust refusal
("Why should I listen to you?"), a wood run chosen over fish nets
because the pantry is full, a runner's complaint about foragers
stripping shared ground ("Back off — or we'll talk with teeth.").
Trip days read as real outings: worked-out patches stepped past,
smoke on the horizon (Emberhold, Ashford — other villages, with
plant counts the vessel does not yet know), and the walk home
narrated every time. PASS on meaning for a haven-bound village.
The gap is stated, not hidden: there are NO strand days to
sense-read — no creek evening, no bridge line, no night away
exists in any judged corpus. The narration of an overnight
absence is untested alongside the mechanism.

## Reachability verdict

Creek/bridge content is NOT reached on any leg in this window (0
creek evenings on 18 legs: 16 judged + 2 basecheck, all stay-home
at night). This is a road-to-content finding, not a content
finding: the bridge code is unchanged, but the road that used to
sleep the vessel at the creek now returns it home every night.
The vessel DOES visit the creek by day (15221 days 27-28 travel
lines name creek tiles) — it is the overnight stay that never
happens. No wave-4/5 reach, no regional/national/table content is
in scope of this census, and none is claimed either way.

## Village assessment, in plain words

Picture the village the strand arms always saw: the scholar leaves
home, walks to the creek, and gets stuck there night after night.
On this base that village is gone — not dead, not broken, just
home by dark. Every single day the scholar walks out — to the
trail edge, to the forest floor, a tile or two out — gathers what
the green offers, and walks back into Haven before nightfall,
every one of those returns spoken aloud in the story. On the
thirty days she doesn't even go out, the pantry is full, her belly
is full, and she gave food to the village recently enough that
nobody's keeping score — so she stays home and breaks garden
ground, sends other people out to fish, learns her neighbors'
names. The one rule that actually sends her out, day after day,
isn't hunger — she's never hungry in the morning — it's the
village's own bookkeeping: three days without giving to the pantry
and the routine says go forage, as if the village notices who's
taking without giving. And the old day-7 departure, the one that
used to strand her at the creek? On this base day 7 is just
another day trip: out, forage three times, home, done. The creek
still gets visited — she drinks from it, walks its banks — but
she never sleeps beside it anymore, because the way home never
fails her now. Nothing here looks wrong, which is exactly why
it's easy to miss: a healthy village that simply never takes the
road where the whole strand story used to happen, because the
road home works too well.

## Wall numbers

NOT OBSERVABLE on a 30-day pre-seat census — reported, never
fabricated. Observed counts on all judged legs, all seeds alive at
day 30 (daysAlive 30, endReason survived): national 0, table 0,
wins 0 (structurally unreachable in this band, not a wall
measurement); median survival 30 days (ceiling — all legs survived
the window). Wave reach is not reported as a wall number here
because the band never sleeps away from haven: no field-night
content is exercised at all.

## Blanks filled or documented

- Filled (this arm, measured): THE DEPARTURE GATE ON THIS BASE.
  Overnight departures 0/480 loop-days. The gate is two-part, both
  traced: needTrip (competent.js:949-964) holds the vessel home
  on 30 mornings (all three conditions verified per day), and
  forageTripSeedFirst's trailing walkHome (competent.js:1487)
  returns it home on the other 210 mornings. The strand road is
  gated by return failure, and the return never fails on this
  band (near unblocked destinations, narrated return 210/210).
- Filled (this arm, measured): THE TRIP DRIVER IS CONTRIBUTION,
  NOT HUNGER. Give-rule present on 207/210 trip days, pantry-only
  on 3, vessel-hunger on 0. Any future departure lever that
  assumes hunger drives trips is aimed at the wrong condition.
- Filled (this arm, measured): FEDEVENING DOUBT #3 ANSWERED. A
  competent policy that never departs overnight on 8/8 seeds in
  30 days is NOT a vessel that never leaves — it is a vessel that
  leaves daily and returns nightly. The "stay" that replaced the
  day-7 departure is a successful return, not a refused departure.
- Documented (this arm, residue): the 15221 days 27-28 multi-hop
  leg is unidentified (stoneRun prime suspect, not claimed).
- Documented (this arm, instrument): the analyzer's activity
  classifier misread mention-lines as forage trips ("Your foragers
  are stripping..." / "foragers, by the look of it") — fixed to
  first-person forage verbs only, regression-tested, activity
  counts recomputed (assign 30 / forage-trip 210, mirroring the
  gate classes); gate counts unchanged by the fix. Also fixed:
  the decomposition now mirrors the code's `ctx._lastGiveDay || 0`
  (unset lastGive reads as day 0, so spawn days 1-2 correctly show
  giveOK), regression-tested.
- Carried, NOT re-judged: the branch-fire substitution design
  (fedevening) still needs a re-derived strand seed + a new prereg
  — this arm does not revive it, because the strand road it was
  built for (overnight absence) does not exist on this band
  either. A strand arm must first produce an overnight absence,
  not just a departure: day trips are not strand substrate.

## Metric review (revisions apply to the NEXT run, never mid-run)

- Prereg definition (departure = ends the day away): HELD for this
  census, but the finding reframes it — the next departure census
  should count THREE things separately, not one: overnight
  departures (this census: 0), day trips out-and-back (210/leg),
  and multi-hop non-forage excursions (2/leg). A prereg that
  counts only overnight departures will keep "finding" stay-home
  villages that actually travel daily.
- Prereg Q (pre-daily vs in-daily needTrip reading): ANSWERED —
  buffer-divergence class is 0 on all 480 days, so the pre-daily
  reading never conflicts with the outcome on this band. The
  class stays in the instrument for bands where it might.
- Prereg Q (pantry >= 25000 as a self-sealing threshold): OPEN,
  sharpened — trip-morning pantry spans 2770-86347 kcal across the
  band, and the vessel still trips on the give rule even when the
  pantry is full, so the pantry threshold rarely binds alone (3
  pantry-only days). Whether the give rule
  SHOULD fire when the pantry is full is a design question for
  the coordinator / Steve, not a verdict this census reaches.
- Prereg Q (recovering() span): ANSWERED — recovering() is false
  on all 480 days; no post-flee recovery week exists on this band
  (the one blocked-combat evening is a fight AT haven, not a flee).
- New doubt for the NEXT run: whether the return leg's reliability
  is itself the strand killer — if walkHome + nighttravel-hop
  succeed on every band, no strand arm can ever re-derive an
  overnight absence on current master, and strand work needs a
  return-failure substrate (blocked-path trips, late returns)
  first. That is a coordinator question, not a worker call.

## §15 panel (non-applicability declaration)

scripts/balance-panel.js runs sweep-compare registry policies on
150-day horizons with its own scorecard and observer contract. It
cannot express the nighttravel+woodcarry+woodwarm strand stack, a
30-day departure-decision census, or a per-loop-day routine-gate
trace — the same declaration every prior strand arm made. The
comparison here is guard-vs-ON legs on identical seeds through the
census analyzer (identical decisions, identical evenings minus
warmth), and is never labeled a panel comparison. No panel result
is fabricated; the panel tool was not invoked on this corpus.

## Infrastructure findings (for the coordinator — NOT game findings)

1. Stdout transport worked first-try on both judged legs (8/8
   lines each, split 8/8, errs 0) and the original driver's file
   mode wrote first-try on both basecheck legs — no EPERM flap
   observed in this window. The rule stands anyway (game-loaded
   processes cannot be trusted to write files; stdout -> file ->
   idle split is the proven form).
2. Safe-commit index clobber hit BOTH pre-leg commits (prereg file,
   then all 4 instrument files: committed files showing
   staged-as-deleted while byte-identical in the worktree).
   Repaired each time via `git update-index --add --cacheinfo`
   from HEAD blobs; `git status --short` empty + `git diff HEAD`
   empty verified after each repair. The commits themselves were
   never in doubt (blob hashes match).
3. Judged corpora were never staged in /tmp (jsonl lived in
   evidence/ until split, then deleted, per the rule). The
   determinism re-run corpus was cmp-verified byte-identical and
   then deleted (not committed) to avoid duplicate corpora; the
   cmp result is recorded here.
4. Pack known-kcal morning->evening deltas on trip days are NOT a
   trip meter (median 0, range -20400..23160, 11 negative): the
   haul arrives unidentified, then sort/donate/eat move known
   kcal the same day. The trip evidence is the forage delta +
   the narrated return (210/210), not the pack number.

## Proof

scripts/test-departdiag-b.js: 162/162 checks pass (pure classifier
tests + corpus checks over both judged corpora: 8/8 files per leg,
errs 0, decisions == evenings, 30 loop-days, contiguous loopDays,
every decision carrying a needTrip + recovering reading, woodwarm
matching the leg, same seed files both legs). Analyzer gate counts
unchanged by the two post-leg analyzer fixes (activity verb
tightening, lastGive-as-0); both fixes regression-tested before
the census was regenerated.

## Files

- Prereg: evidence/2026-10-31/sim-departdiag-b-prereg.md
  (commit 60158f3b, BEFORE any judged leg)
- Evidence (this file): evidence/2026-10-31/sim-departdiag-b.md
- Census: evidence/2026-10-31/sim-departdiag-b-census.json
  (analyzer output over both judged corpora)
- Driver: scripts/departdiag-trace-b.js; splitter:
  scripts/split-departdiag-jsonl-b.js; analyzer:
  scripts/analyze-departdiag-b.js; proof:
  scripts/test-departdiag-b.js (162/162)
- Instruments commit: 11df366b (driver + splitter + analyzer +
  proof, pure 44/44 at commit time)
- Basecheck (verbatim prior instrument, 15215, never judged):
  evidence/2026-10-31/sim-departdiag-b-basecheck-guard,
  sim-departdiag-b-basecheck-on (1 file each)
- Judged corpora (8 files each, guard + ON):
  evidence/2026-10-31/sim-departdiag-b-corpus-guard,
  sim-departdiag-b-corpus-on
- Runner stderr logs: evidence/2026-10-31/
  sim-departdiag-b-guard.stderr.log,
  sim-departdiag-b-on.stderr.log
- No compare .md exists (no paired lever comparison — this is a
  DIAG census, guard-vs-ON reported in the census JSON, never
  labeled a panel comparison); no confirm corpora exist beyond
  the judged legs (this arm judges no lever).
