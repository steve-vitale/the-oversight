# sim-substrate-b — substrate-state hunt for P-RACKS-NOELIG and the racks-full silence (DIAG only, no game change)

Run: oversight-flesh-out-loop-b, 1130Z blank 3 (food-economy axis).
Worktree: `~/workspace/worktrees/sim-substrate-b`, branch sim-substrate-b.

Status: PRE-REGISTERED — everything under "PRE-REGISTRATION" below was
written BEFORE any sim in this run was executed. The RESULTS section
at the end is appended after the sweep completes and is judged ONLY
against the header. This run does NOT re-judge the plainvoice or
noelig-lean corpora, and does NOT re-run a policy swap: the 1130Z
verdict says the next hunt needs a substrate-state hypothesis
(foraging stopped while racks stay full), not another policy.

## Canon read first

- `docs/CANON.md` (manifest), then `docs/PRESERVATION.md` (the food
  ladder: cleaned 2d < cooked 5d < smoked 30d < rendered 90d <
  pemmican 120d; smoking 16 ticks; "rot can't be smoked back into
  food"). PRESERVATION.md covers preserving/racks, so it is the
  canon doc for this area. No canon doc covers cook-voice
  classification or substrate-state taxonomy — stated, not
  invented. The taxonomy below is the MEASUREMENT INSTRUMENT
  reused/extended from sim-plainvoice-b, not a canon claim.
- Engine facts read from code BEFORE any sim (not invented):
  - Cook resolves ~3x/day (up to 4 observed). Racks-full voice
    fires only when preservedKcal >= rackCap AND about-to-rot
    eligible surplus is present; gate B speaks only the day's
    first such complaint, later ones are silenced into the plain
    frame (sim-plainvoice-b).
  - Villager duty forage resolves in `resolveOneAssignment`:
    the villager depletes real tiles, stocks the pantry, and
    says `🌿 {first} returns with foraged food: +{kcal} kcal
    to the pantry.` — one say line per duty forage resolution.
  - PRODTHROTTLE (game.js, 2026-10-13): when the pantry holds
    >4 fresh days-on-hand at the measured burn rate, duty
    forage/garden/fish is redirected to non-perishable work
    (wood/water/stone) and says `🌿 {first} checks the pantry
    before heading out — the shelves are full, ~{n} days of
    fresh on hand… leaves the {forage} standing and turns to
    the {alt} instead.` — one say line per redirected duty
    forage resolution. Hunger exemption (hungryStreak >= 3)
    stands the throttle down and says the `🍽️ … hungry eat
    first: keeps working the {forage}` line instead, after
    which the forage branch runs and a returns line follows.
  - These three say lines are therefore the observable
    substrate: a duty forage assignment that day shows up as
    exactly one returns line (it foraged) or exactly one
    redirect line (it was stopped by the throttle). That is
    the instrument's claim, and the neutrality pair below is
    what proves the recorder did not perturb it.

## Background (quoted, NOT re-judged here)

- evidence/2026-10-26/sim-plainvoice-b.md (DIAG-GO): on
  leadfeast, P-RACKS-NOELIG is 0/900 plain lines.
- evidence/2026-10-26/sim-noelig-lean-b.md (DIAG-GO): on the
  leaner competent-nofeast band, P-RACKS-NOELIG is 0/925 plain
  lines. A two-band zero, so the class absence is a
  preserving-loop property, not a policy artifact.
- The open question this run answers: WHAT is the village
  doing on racks-bound days? Is foraging stopped while racks
  stay full? Is there no eligible forage? Is the pantry
  already covered by the reserve? Classify the substrate
  state; do not just recount the silence.

## PRE-REGISTRATION (bound per docs/MEASUREMENT.md §§9-12, 14-15)

### Instrument (new, DIAG only, zero src/js, zero default flips)

- scripts/substrate-capture.js (new): wraps `Game.say` AFTER
  loadGame (the plainvoice post-load pattern, say-only — NO
  engine function is wrapped, so the wrapper rule is met by
  construction plus the neutrality pair). For every say line
  it records, in arrival order:
  - cook lines (the plainvoice frame regex): frame
    (worked / racksFull / plain) plus, for EVERY cook line
    (not only plain lines — this is the extension over
    plainvoice), the emit-time recompute from
    scripts/plainvoice-capture.js `recomputeContext`
    (reused unchanged): day, racksFull, eligiblePresent /
    eligibleCount / eligibleKcal, preservedKcal, rackCap,
    voiceSpokenToday. Plus a pantry snapshot at emit time:
    pantryKcal (total pantry kcal), freshDays (via
    `Game.pantryFreshDays()` if available, else null),
    throttleEngaged (via `Game.prodThrottleEngaged()` if
    available, else null). All snapshot queries are
    try/catch isolated and read-only; a throwing query
    yields null, never a game write.
  - duty forage returns: `🌿 {first} returns with foraged
    food: +{kcal} kcal to the pantry.` (day, name, kcal).
  - throttle redirects: `… leaves the {forage|harvest|fish
    nets} standing and turns to the {alt} instead.` (day,
    name, from-task, alt-task). A from-task of `forage` is a
    stopped forage assignment; `harvest`/`fish nets` are
    stopped garden/fish duties, counted separately.
  - throttle exemptions: `🍽️ … hungry eat first: keeps
    working the {forage}` (day, name, from-task) — a forage
    assignment the hunger exemption kept working; its
    returns line follows separately and is counted there,
    never double-counted as a second assignment.
  - fitness rests: `{name} is in no shape for the treeline`
    (day, name) — a villager who could not walk out at all;
    an attribute, not an assignment count (no resolution
    follows it).
  - The wrapper delegates to the original say with the same
    arguments, `this`, and return value; it writes ONLY to
    the caller's arrays; it never writes Game.state, Game.log,
    RNG, or any game field. Person lookup is via the
    reused plainvoice recompute (reads `Game.data.villagers`
    directly, never `Game.getPerson`).
- scripts/substrate-days.js (new, shared): the day-table
  builder used identically by the sweep test and the
  analyzer, so the classification cannot drift between them.
  Input: one seed's cook lines + event lines. Output: one
  row per racks-bound day (see "Racks-bound day" below),
  each row carrying exactly one class.
- scripts/sweep-substrate-b.js (new, adapted from
  sweep-noelig-lean-b.js): same loadGame-per-seed pattern
  plus the substrate capture; SWEEP_CENSUS=1 stdout mode
  (flap-proof: the long sweep never writes files; a
  short-lived splitter persists per-seed JSONs from stdout).
  Corpus dir (new, never mixed into older corpora):
  evidence/2026-10-26/sim-substrate-b-corpus/.
- scripts/test-substrate-b.js (new): taxonomy/day fixture
  checks (T1, runs BEFORE the sweep) + corpus assertions
  (T2, runs after). scripts/analyze-substrate-b.js (new):
  per-seed day tables + band roll-up + sense samples
  (day transcripts in arrival order).

### Racks-bound day (definition, fixed before the sweep)

A day D (of one seed) is RACKS-BOUND if and only if at
least one cook line that day has racksFull true: either a
spoken racksFull frame, or a plain line whose emit-time
recompute says racksFull. Worked lines never make a day
racks-bound (a worked resolution smoked, so the racks were
not full at that resolution); a worked line whose recompute
says racksFull would be counted as a `workedRacksFull`
anomaly attribute, not as a racks-bound marker, and is
reported if it ever occurs.

### Substrate-state classes (exclusive, exactly one per racks-bound day)

Per racks-bound day, let F = number of duty forage returns
that day, R = number of forage-task throttle redirects that
day. Assigned-to-forage that day = distinct names in
returns ∪ forage redirects. Classes, first match wins (the
four cases exhaust all (F, R) combinations, so coverage is
structural — the completeness check below is what proves
no day fell through):

- S-THROTTLED — F == 0 AND R > 0. Foraging stopped by the
  pantry-full throttle while the racks stayed full: every
  forage assignment that day was turned to wood/water/stone.
  (The 1130Z hypothesised state.)
- S-THROTTLED-PARTIAL — F > 0 AND R > 0. The throttle hit
  some foragers and not others (fresh-days fell through the
  4-day line mid-day, or assignments resolved across the
  line): foraging partly stopped while racks stayed full.
- S-FORAGED — F > 0 AND R == 0. Foraging continued all day
  despite full racks: the village kept hauling fresh food
  while it could not smoke it.
- S-NO-FORAGE-DUTY — F == 0 AND R == 0. No duty forage
  assignment resolved that day at all: nobody was sent to
  forage (other duties, no assignments, the village away or
  dying — the day's other attributes, e.g. rest lines and
  pantry snapshot, say which; the class does not guess).

Attributes carried on every row (never extra classes):
assignedForage names + count, forageKcal total, garden/fish
redirect count, exempt count, rest count, pantryKcal at
first and last racks-bound cook line that day, preservedKcal
at first/last, freshDays at first/last (nullable),
throttleEngaged at first/last (nullable), eligibleAny
(any racks-bound cook line that day with eligiblePresent),
eligibleKcal max, racksFull spoken count, silenced count,
cook lines that day, workedRacksFull anomaly count.

### Chosen band (fixed BEFORE any sweep — one band, never mixed)

- Policy: `competent` with COMPETENT_FEAST=0,
  FEASTSCALE_R13 unset/0, SEATDRIVE=0, PLENTYDEPRI=0 (pd0),
  DEPOSITGATE=1 (dg1). Policy id: `competent-nofeast` — the
  SAME band as sim-noelig-lean-b, so per-seed comparison
  against the noelig corpus is like-for-like (same seeds,
  same horizon, same policy; a substrate re-read, not a
  policy comparison). Leadfeast is NOT swept here: the
  task forbids another policy swap, and competent-nofeast
  already carries the larger racks-bound volume
  (320 spoken + 612 silenced on the noelig band vs
  230 + 483 on leadfeast).
- Seeds 9750-9757 (8 seeds, the plainvoice/noelig band).
  Configs: 8 seeds x {cap0, cap1} = 16 configs. cap0 =
  neutrality control (stock harness, no capture); cap1 =
  substrate corpus. File names:
  substrate-b-<cap0|cap1>-pd0-dg1-competent-nofeast-s<seed>.json.
- Horizon: 100d death-aware (dead villages stop, +10d tail
  max). SAYCAP: cook lines 1000 (as plainvoice), event
  lines 3000 (separate cap; neither cap may be hit — a hit
  day is reported, and a hit on cook lines invalidates that
  seed's day table).

### VERDICT RULE (binding — judge ONLY against this header)

DIAG-GO holds if and only if ALL of the following hold:

- (a) NEUTRALITY FIRST (the wrapper rule): cap0 vs cap1
  numeric fields identical on 8/8 seeds (daysAlive,
  batches, resolutions, deaths, national, waveReach, rank,
  table, win). The recorder wraps ONLY Game.say and
  delegates with identical arguments/this/return; the
  neutrality leg runs BEFORE any classified number is
  judged. A recorder that perturbs trajectories invalidates
  everything.
- (b) CLASSIFICATION COMPLETE: every racks-bound day on
  the band appears in the day table exactly once with
  exactly one class; UNCLASSIFIED racks-bound days == 0,
  where UNCLASSIFIED means a racks-bound day with no day
  row, a row with no class, or a row on a seed whose cook
  cap was hit. If any unclassified day exists, each is
  named (seed + day + reason) and the verdict is
  DIAG-NO-GO unless the header's allowance applies — it
  does not: the allowance is only for days named with a
  reason AND still counted as a failure of completeness
  unless the reason is a documented instrument limit that
  leaves the dominant-state share unaffected, in which
  case the verdict names that explicitly. In practice:
  0 unclassified is the bar.
- (c) DOMINANT STATE NAMED: the class with the largest
  share of racks-bound days is named with its day count
  and share of all racks-bound days (band total, plus
  per-seed shares published).
- (d) NEXT STEP NAMED: a named next lever or design
  question that follows from the dominant state (not a
  policy swap, not a recount).
- (e) SENSE READ: 2-3 racks-bound days sampled with their
  day transcripts in arrival order (cook lines, forage
  returns, redirects, in the order the village lived them),
  judged in plain words whether the day reads as "dinner
  already covered by the reserve" vs "nothing to do" vs
  "foraging stopped" — with the quoted lines that support
  the judgment. At least one sample per non-empty class
  that holds >= 5 days, or all classes if smaller.
- (f) VALIDITY: 16/16 per-seed files present and parsing;
  batches >= resolutions on every cell; on every cap1
  cell, captured worked-line count EQUALS
  preserveVillagerResolutions (the racksvoice cross-check);
  every cap1 cook total under the 1000 cap and every
  event total under the 3000 cap (no truncation).
- (g) WALL NUMBERS published: national-or-better / table /
  wins, wave 1-5 reach, median survival (median daysAlive).
  Table 0 is a construction fact (SEATDRIVE=0), not a
  scale-wall finding.

Otherwise the verdict is DIAG-NO-GO, with the failed
condition(s) named. A DIAG-NO-GO here means ONLY "this
recorder cannot see the substrate state" — it names
exactly which field is missing and where it would have to
be threaded from. It is NOT a policy comparison and NOT a
judgment on the cook mechanic, the throttle, or gate B.

### Pilot gate (§9)

- The pilot IS the 8-seed band (16 configs at ~seconds
  each). The day-table fixture test (scripts/test-
  substrate-b.js T1) runs BEFORE the sweep: if the fixture
  days do not classify exactly as pre-registered, the
  sweep does not run. No confirm spend exists for a DIAG
  arm beyond the pilot band unless classification is
  incomplete, in which case the run reports DIAG-NO-GO
  rather than buying seeds to paper over an instrument gap.

### Balanced panel (§15)

- This is a DIAG classification, not a before/after
  balance pair (no game lever changes), so no panel
  compare is expected. A panel attempt is recorded
  honestly: if scripts/balance-panel.js cannot ingest
  recorder corpora (the known failure class from the
  plainvoice/noelig runs — it is a panel RUNNER that spawns
  its own sims under its own observer), that note is
  written and no panel input is fabricated. The
  §15-equivalent instrument is the cap0 vs cap1 paired
  table in RESULTS.

### Sense-testing, villager behaviour

- SENSE-TESTING LAW: the day transcripts in (e) are read
  for meaning, not just counts — does a S-THROTTLED day
  read as a village choosing not to haul food that will
  rot, or as a village with nothing to do? Does a
  S-FORAGED day read as abundance or as waste? Flag
  anything robotic or repeated (e.g. the same redirect
  line every day-part with no variation).
- VILLAGER-BEHAVIOUR SAMPLE: who forages and who is
  redirected on racks-bound days (names per class), and
  whether the same villagers are always the ones stopped.

### Metric review (filled after the verdict, §14 — revisions apply to the NEXT run, this verdict is NOT re-scored)

- See the "Metric review" subsection under RESULTS below.

### Scope

Zero src/js game changes in this worktree. New files only:
scripts/substrate-capture.js, scripts/substrate-days.js,
scripts/sweep-substrate-b.js, scripts/test-substrate-b.js,
scripts/analyze-substrate-b.js,
evidence/2026-10-26/sim-substrate-b-corpus/ (per-seed files),
evidence/2026-10-26/sim-substrate-b.md (this file).
scripts/plainvoice-capture.js is REUSED unchanged (its
`recomputeContext` export). No push, no version bump, no
live verification — committed on branch sim-substrate-b,
pending coordinator merge.

---

## RESULTS (appended after the pre-registration above; verdict judged ONLY on the corpus named here)

CORPUS: evidence/2026-10-26/sim-substrate-b-corpus/, 16 files
(substrate-b-cap0/cap1-pd0-dg1-competent-nofeast-s9750..9757.json),
policy competent-nofeast (competent, COMPETENT_FEAST=0,
FEASTSCALE_R13 unset/0), pd0, dg1, 100d death-aware horizon,
current head (no patch, no game change, racksvoice rule R
default — see "Rule R drift note" below). CAP=0 = stock harness
(control); CAP=1 = scripts/substrate-capture.js installed after
loadGame, cook cap 1000, event cap 3000. CAP=1 files carry the FULL
cook-line array (every cook line with its tag set + pantry
snapshot) plus the FULL event array (every forage return,
throttle redirect/exempt, fitness rest) plus the day table.

PROOF TEST: node scripts/test-substrate-b.js --corpus — 134 PASS
/ 0 FAIL (T1 day fixtures 14, T2 corpus assertions 120,
including the neutrality leg on 8/8 seeds). T1 ran BEFORE the
sweep (14/0) and gated it. Analyzer:
node scripts/analyze-substrate-b.js (tables + samples below).
Sweep logs: /tmp/substrate-b-logs/cap0/cap1.log (stdout carrier;
per-seed JSONs split from them by a short-lived validator that
checked filename-seed match, cap match, parse, and readback).

### Verdict: DIAG-GO

- (a) NEUTRALITY HOLDS: cap0 vs cap1 numeric fields identical
  on 8/8 seeds (daysAlive, batches, kcal, resolutions, deaths,
  deathCauses, national, rank, table, win, waveReach,
  endReason — test T2 "neutrality" 8/8). The recorder wraps
  ONLY Game.say and delegates with identical arguments/this/
  return; no engine function is wrapped by the recorder (the
  sweep's creditDeed/registerDeath counters are identical on
  both caps, as in the plainvoice/noelig sweeps, so the pair
  isolates the say wrapper). The wrapper rule is met: the
  neutrality pair ran BEFORE any classified number was
  judged, and it proves delegation — wrapped vs unwrapped
  trajectories are identical.
- (b) CLASSIFICATION COMPLETE: 327 racks-bound days, 327 day
  rows, 327 rows with exactly one class, 0 UNCLASSIFIED.
  The rebuild check passes on 8/8 seeds (day table rebuilt
  from raw cook lines + events equals the stored table, and
  every raw racks-bound day appears in the table). No
  extension, no naming of unclassified days needed — there
  are none.
- (c) DOMINANT STATE NAMED: S-NO-FORAGE-DUTY — 326 of 327
  racks-bound days (99.7%). Per-seed shares: 9750: 36/37
  (the 37th is the band's only S-FORAGED day); 9752: 73/73;
  9753: 56/56; 9755: 36/36; 9756: 58/58; 9757: 67/67;
  9751 and 9754: 0 racks-bound days (both villages lost
  before ever filling racks).
- (d) NEXT STEP NAMED: an inflow-source hunt — thread
  stockPantry inflows by source per day (scholar forage
  trips vs garden vs fish vs hunt vs other) on racks-bound
  days, to answer where the racks stock comes from when
  nobody is on forage duty (see "The next question" below).
  It is NOT another policy swap and NOT a recount.
- (e) SENSE READ HOLDS: three racks-bound days sampled below
  with full day transcripts in arrival order (seq-ordered),
  each judged in plain words. At least one sample per
  non-empty class that holds >= 5 days (S-NO-FORAGE-DUTY,
  326 days) plus the band's only S-FORAGED day.
- (f) VALIDITY HOLDS: 16/16 files present and parsing;
  batches >= resolutions on every cell; worked ==
  resolutions on every CAP=1 cell (39/5/39/34/7/50/45/38);
  every CAP=1 cook total under the 1000 cap (max 424) and
  every event total under the 3000 cap (max 102 events on
  a seed), so no cell was truncated.
- (g) WALL NUMBERS published below.

### The headline: on racks-bound days, nobody is on forage duty — not throttled, never assigned

PER-SEED TABLE (CAP=1; CAP=0 numerics identical):
seed days batches res worked spoken plain | boundDays THROTTLED PARTIAL FORAGED NO-DUTY
- 9750 100 88 39 39 21 167 | 37 0 0 1 36
- 9751 48 7 5 5 0 12 | 0 0 0 0 0
- 9752 100 106 39 39 27 218 | 73 0 0 0 73
- 9753 100 107 34 34 35 215 | 56 0 0 0 56
- 9754 97 13 7 7 0 3 | 0 0 0 0 0
- 9755 100 190 50 50 28 30 | 36 0 0 0 36
- 9756 100 132 45 45 43 94 | 58 0 0 0 58
- 9757 100 118 38 38 41 345 | 67 0 0 0 67
Band: bound days 327, spoken complaints 195, plain lines
1084 (763 plain bound + 321 plain non-bound), worked 257,
deaths 43.

BAND CLASS TOTALS: S-THROTTLED 0 (0.0%),
S-THROTTLED-PARTIAL 0 (0.0%), S-FORAGED 1 (0.3%),
S-NO-FORAGE-DUTY 326 (99.7%).

The 1130Z hypothesis — "foraging stopped while racks stay
full" — does NOT describe these villages. Foraging (villager
duty forage) is not stopped on racks-bound days; it is
absent on racks-bound days and non-bound days alike, because
under the competent policy nobody is ever assigned to forage
duty in the first place:

- Duty forage returns in the WHOLE band: 3 lines, all one
  villager (Sierra, seed 9750) — 2 on the band's single
  S-FORAGED racks-bound day (d47) and 1 on a non-bound day.
  Every other seed: zero duty forage returns all run.
- Voiced throttle redirects in the whole band, by from-task:
  harvest (garden) 573, fish nets 93, forage 0. Zero voiced
  forage redirects anywhere — there is no forage duty for
  the throttle to stop.
- Why no forage duty: the competent policy never calls
  assignTask('forage') — it assigns water, wood, garden,
  cook, fish and the rest, but not forage. The only route
  to a forage resolution is a forage task lead (a contender
  who took or was yielded the forage domain), which is why
  Sierra's three returns are the band's entire duty-forage
  output. This is a policy fact, not a game bug — and it
  reframes the blank: the racks fill without any villager
  foraging, so the racks stock must come from elsewhere
  (see "The next question").
- The throttle IS engaged nearly every day — just not on
  forage. Every one of the 327 racks-bound days carries
  exactly one voiced garden/fish throttle redirect (the
  day-table gardenFishRedirects distribution is {1: 327} —
  no bound day has 0, none has 2, because the FOODVOICE2
  gate voices at most one redirect per day). Median fresh
  pantry stock at the first bound line of the day is 59.5
  days-on-hand (min 3.9, max 314.5); median pantry total
  58,778 kcal. The village is drowning in fresh food while
  its racks are full — the gardeners and fishers are the
  ones being turned to wood/water/stone, every day, while
  the cooks complain about the racks.
- EligibleAny is 327/327 (100%) on racks-bound days: every
  racks-bound day has about-to-rot surplus at some bound
  resolution. So "no eligible forage" is false at day
  granularity too, and the day-level version of the
  two-band NOELIG zero is confirmed: plain racks-full
  lines with no eligible surplus number 0 in this corpus
  (plainNoelig 0 of 763 plain bound lines).
- The scholar's own forage trips are NOT in this table:
  competent's forageTripSeedFirst runs for the scholar
  personally and leaves no villager-duty line. The verdict
  is about villager duty foraging. Anyone claiming
  "foraging stopped" village-wide must first thread the
  scholar's trips (policy ctx export) — named in the
  metric review, not smuggled into this verdict.

### SENSE-TESTING samples (day transcripts in arrival order)

- S-FORAGED, the band's only one [9750 d47, Sierra]:
  "🌿 Penelope checks the pantry before heading out — the
  shelves are full, ~5 days of fresh on hand… leaves the
  harvest standing and turns to the stone pile instead."
  Then Sierra works the racks (4 batches, ~2,416 kcal),
  Sierra returns with foraged food (+624 kcal), Sierra
  speaks the racks-full complaint (15,022 kcal kept),
  Sierra returns with foraged food again (+692 kcal), then
  Malik's plain line. Judgment: this day reads as a village
  with too much of everything — the gardener is turned
  away, the cook still smokes, the forager still hauls,
  the racks are full and complained about, and the same
  cook hauls fresh food twice after the complaint. It is
  "foraging continued", not "foraging stopped" — and it is
  the exception that proves the rule: the only forage duty
  in the band is one villager on one seed.
- S-NO-FORAGE-DUTY [9750 d48, the day after]:
  Penelope again turned from the harvest to the wood run
  (~4 days fresh), then three plain cook lines (Sierra,
  Sierra, Malik), all racks-full on recompute, none spoken.
  Judgment: this reads as "dinner already covered by the
  reserve" plus a quiet rack — the pantry holds 23,932
  kcal, the racks hold 15,022, the fresh pile is about to
  rot (eligible 2,200 kcal), and nobody's complaint speaks
  because the figure is unchanged since Sierra spoke
  15,022 yesterday (rule R, see drift note). Nobody
  forages, nobody is stopped from foraging — there is
  simply no forage duty that day, and the village's one
  voiced throttle line belongs to the garden.
- S-NO-FORAGE-DUTY [9757 d34, the village's first bound
  day]: Grace turned from the harvest to the water run
  (~62 days of fresh on hand), Miguel works the racks
  (2 batches), Miguel speaks the racks-full complaint
  (18,570 kcal kept), then three plain lines (Miguel,
  Miguel, Grace). Judgment: "foraging stopped" is the
  wrong story for this day too — the day's food work is a
  gardener redirected, a cook smoking, and a cook
  complaining. The village never needed a forager to get
  here: 40,484 kcal in the pantry, 54.8 fresh days on
  hand, racks full on day 34. It reads as abundance with
  nowhere left to put it, not as a village that stopped
  doing something.
- Same pattern on 9752 d28 (first bound day, not quoted
  in full): Mason turned from the harvest to the wood run
  (~20 days fresh), Mason speaks the racks-full complaint
  (19,034 kcal kept), pantry 60,655 kcal. No forage duty
  anywhere in the day.

Nothing reads robotic beyond the frame itself — but the
repetition that matters is structural, as in the voice
runs: the same garden redirect line, once a day, every
bound day, always the harvest or the nets, never the
forage. The village's throttle has exactly one voice a
day, and it always spends it on the duties the policy
actually assigns.

### WALL NUMBERS (corpus, CAP=1)

national-or-better 0/8, table 0/8, wins 0/8, wave reach
distribution {2: 4, 3: 4} (per-cell max wave), wave-4 reach
0/8, wave-5 reach 0/8, median daysAlive 100, max 100.
Table 0 is a construction fact (SEATDRIVE=0), not a
scale-wall finding. National 0/8 matches the noelig band
(same policy, same construction). Total deaths 43 (CAP=1);
9751 lost at day 48 (12 deaths), 9754 lost at day 97
(14 deaths, starvation-marked in the noelig read).

### VILLAGER-BEHAVIOUR SAMPLE

Who forages on racks-bound days: Sierra, and only Sierra,
and only on 9750 d47. Who is redirected on racks-bound
days: gardeners and fishers, one voiced redirect per bound
day, every bound day — Penelope, Grace, Mason and their
counterparts, always from the harvest or the nets, always
to wood/water/stone. No villager is ever redirected from
forage, because no villager holds a forage duty. The
cooks rotate (Miguel, Sierra, Grace, Malik, Mason,
Paramjit across seeds) but the substrate does not: bound
day after bound day, the same shape — full racks, fresh
pile about to rot, gardener turned away, no forager.

### BALANCED PANEL (§15)

Attempted honestly, not fabricated: running
scripts/balance-panel.js without --out errors "--out
<panel-directory> required" — it is a before/after panel
RUNNER that spawns its own sims under its own observer;
it cannot ingest recorder corpora, and running a panel
would be a different experiment under a different
observer, not a comparison of this corpus. So no panel
compare is attached and none is faked. The §15-equivalent
instrument for this DIAG run is the CAP=0 vs CAP=1 paired
table above (8/8 identical), judged by the GO rule in the
header — the same stance the plainvoice and noelig runs
took.

### Rule R drift note (affects voice taxonomy, NOT this verdict)

Current master no longer runs gate B alone: the
RACKSVOICE-REMINDER rule R (sim-reminder-b, landed
2026-10-26, after the plainvoice/noelig runs) is the
default. Under rule R, a racks-full candidate speaks only
when its figure changed since THAT cook's last spoken
figure, or on the 7th silent day — so the plainvoice
"impossible combination" (racksFull && eligible &&
!voiceSpokenToday → UNCLASSIFIED) no longer holds. In
this corpus, 450 of 763 plain bound lines carry
voiceSpokenToday=false: they are reminder-silenced
(unchanged figure), not gate errors. This run's day
classification never uses voiceSpokenToday — a day is
bound by racksFull recompute or spoken frame — so the
drift does not touch the verdict. But any future voice
taxonomy built on the plainvoice gate-B model must be
rebuilt on rule R first; the plainvoice classes as
written will misclassify reminder-silenced lines as
unclassified on current master. Recorded here for the
coordinator; not chased here (DIAG only, stay on axis).

### Worked-line recompute note (not a contradiction)

70 worked lines on bound days recompute racksFull=true.
That is a post-conversion artifact, not a branch
contradiction: the recompute runs at emit time, AFTER
the resolution smoked — a worked resolution can push
preserved stock over that cook's cap during the smoke
itself (9750 d47: Sierra smokes 4 batches, preserved
rises past her 14,625 cap in the same resolution). For
plain lines (n = 0, nothing converted) the emit-time
recompute IS the branch-time state, which is why the
plainvoice instrument is exact for plain lines and why
this run never uses a worked line as a bound marker.
Related: 122 worked resolutions occur ON racks-bound
days — racks-bound is cook-relative (rackCap depends on
the cook's preserver skill), so a day bound for one
cook's cap can still have another cook (higher cap)
smoke. The day table counts worked lines per bound day
as an attribute; it does not let them move a day's class.

### Drift vs the noelig corpus (named, not hidden)

7 of 8 seeds reproduce the noelig-lean-b numerics exactly
(days, batches, resolutions, deaths). Seed 9752 drifted:
batches 132 → 106, resolutions 41 → 39 (days 100, deaths
2 unchanged). One seed's trajectory moved under sibling
changes since the noelig run landed; the internal
cap0-vs-cap1 pair still agrees 8/8, so the verdict rests
on this run's own paired corpus, not on matching old
numbers. Spoken racks-full complaints total 195 here vs
320 on the noelig band — that drop is the rule R voice
gate (fewer spoken complaints), not fewer bound days
(327 bound days here, with 763 plain bound lines behind
the 195 spoken ones).

### Metric review (§14 — for the NEXT run; this verdict is NOT re-scored)

- The four classes exhaust (F, R) by construction, and
  the 0-unclassified bar held at 327/327 — but the class
  labels mean "observed via say lines", and two say-voice
  gates bound what "observed" can see. (1) Redirect voice
  is gated to one per day (FOODVOICE2): silent redirects
  are invisible to this recorder. In THIS band the
  exposure is negligible (forage duties number 3 lines
  total; a silent forage redirect would need a forage duty
  that voiced garden/fish spoke first — and there are
  essentially no forage duties to hide). On a policy that
  assigns forage heavily, a NO-DUTY label would be
  unsafe without the throttle ledger: a future arm must
  thread v.throttleRedirects deltas at day boundaries (or
  an engine-side redirect tag) before trusting
  S-NO-FORAGE-DUTY there. (2) The scholar's own forage
  trips are invisible to this recorder (policy ctx, not
  Game.say): a future village-wide foraging claim must
  export ctx.forageTrips per day.
- The day-table field named "silenced" counts plain bound
  lines regardless of voiceSpokenToday. Under rule R that
  name misleads: 450/763 are reminder-silenced
  (unchanged figure), 313 are gate-silenced (a complaint
  spoke that day). A future run should split the field
  into plainBound, plainVoiceSpokenToday, and
  plainReminderSilenced — and should rebuild the
  plainvoice taxonomy on rule R before reusing it.
- The pre-registered "racks-bound day" definition (any
  cook line racksFull) proved load-bearing in the
  cook-relative-cap sense: bound days are per-cook-cap
  days, not village-absolute days. A future arm quoting
  "racks-bound" should say "bound for at least one
  cook's cap" or it will overclaim.
- The next hunt is named in (d): inflow-source tracing.
  The instrument for it is a stockPantry-caller recorder
  (or haulcount-style tap) bucketed per day — scholar
  trips, garden, fish, hunt, other — on racks-bound days
  only. That answers the question this run exposed:
  where do full racks come from when nobody forages?

### CONVERGENCE STATE for this axis (racks-bound-day substrate)

DIAG-GO, classification complete. On competent-nofeast,
racks-bound days are S-NO-FORAGE-DUTY 326/327 (99.7%),
S-FORAGED 1/327, S-THROTTLED 0, S-THROTTLED-PARTIAL 0.
The 1130Z blank 3 is filled with a substrate answer, not
a recount: the racks-full silence is not a village that
stopped foraging — it is a village that never assigned
foraging, whose gardeners and fishers are throttled daily
while its racks fill from elsewhere. The open blank it
exposes is the inflow question (which stream fills the
racks), plus the voice-taxonomy rebuild on rule R — both
recorded, neither solved here (DIAG only, zero game
changes).

### VILLAGE ASSESSMENT (plain words)

These villages are not hungry, not idle, and not
foraging. They sit on pantries of forty to sixty thousand
calories, with fifty-odd days of fresh food on hand, and
their smoke racks have been full for weeks — one cook
complains about it (or, when the number hasn't changed,
quietly doesn't), the gardeners get turned away to haul
wood and water because there is simply too much fresh
food already, and nobody at all is sent out to forage.
The one day in 327 when someone did forage on a
racks-bound day, it was one woman, Sierra, hauling twice
on a day her village already had everything. The quiet
in the log is not a village holding its tongue about
foraging — it is a village that found other ways to fill
its shelves, and then filled them past the brim. If Steve
wants to know why the racks are full, the next question
is not "who stopped foraging" — it is "who filled them
in the first place," because on this way of playing, the
answer is nobody with a forage basket.

### Scope compliance

Zero src/js changes. Changed/added:
scripts/substrate-capture.js, scripts/substrate-days.js,
scripts/sweep-substrate-b.js, scripts/test-substrate-b.js,
scripts/analyze-substrate-b.js,
evidence/2026-10-26/sim-substrate-b-corpus/ (16 files),
evidence/2026-10-26/sim-substrate-b.md (this file).
scripts/plainvoice-capture.js reused UNCHANGED (its
`recomputeContext` export). No push, no version bump, no
live verification — committed on branch sim-substrate-b,
pending coordinator merge.

### Findings for the coordinator backlog (do NOT edit goal hidden_files here)

- [open] 2026-10-26 — substrate dominant state —
  racks-bound days on competent-nofeast are S-NO-FORAGE-
  DUTY 326/327 (99.7%): no villager holds forage duty on
  bound days (competent never assigns forage; the band's
  entire duty forage is 3 Sierra returns on 9750). The
  "foraging stopped while racks stay full" hypothesis
  does not describe these villages; the throttle hits
  garden/fish (573 harvest + 93 fish voiced redirects,
  0 forage) (evidence sim-substrate-b).
- [open] 2026-10-26 — racks inflow question — where does
  racks stock come from when nobody forages? Next hunt:
  thread stockPantry inflows by source per day on
  racks-bound days (scholar trips vs garden vs fish vs
  hunt) (evidence sim-substrate-b).
- [open] 2026-10-26 — voice taxonomy stale on rule R —
  plainvoice's impossible-combo rule (racksFull &&
  eligible && !voiceSpokenToday → UNCLASSIFIED) no longer
  holds under reminder rule R: 450/763 plain bound lines
  here carry voiceSpokenToday=false (unchanged figure).
  Rebuild the voice taxonomy on rule R before reusing it
  (evidence sim-substrate-b).
- [open] 2026-10-26 — substrate instrument limits — say
  recorders cannot see silent throttle redirects (1
  voiced/day gate) or scholar forage trips (policy ctx):
  a forage-heavy policy arm must thread the throttle
  ledger and ctx.forageTrips before trusting a NO-DUTY
  label village-wide (evidence sim-substrate-b).

