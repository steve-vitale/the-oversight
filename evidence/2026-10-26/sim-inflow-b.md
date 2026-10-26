# sim-inflow-b — inflow-source hunt on racks-bound days (DIAG ONLY, no game change)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T1345Z,
axis food-economy, arm sim-inflow-b.
Worktree: `~/workspace/worktrees/sim-inflow-b`, branch sim-inflow-b.

Status: PRE-REGISTERED — everything under "PRE-REGISTRATION" below was
written BEFORE any sim in this run was executed. The RESULTS section
at the end is appended after the sweep completes and is judged ONLY
against the header. This run does NOT re-judge the substrate verdict
(326/327 S-NO-FORAGE-DUTY), the cookdiv verdict, or rule Y; it does
NOT use the gate-B voice taxonomy (void under rule R per the
substrate caveats); its classification never uses voice.

## Canon read first

- `docs/CANON.md` (manifest), then `docs/PRESERVATION.md` (the food
  ladder: cleaned 2d < cooked 5d < smoked 30d < rendered 90d <
  pemmican 120d; smoking 16 ticks; "rot can't be smoked back into
  food"). PRESERVATION.md covers preserving/racks, so it is the
  canon doc for this area. No canon doc covers pantry-inflow
  source taxonomy — stated, not invented. The classes below are
  the MEASUREMENT INSTRUMENT built from the code's own
  `stockPantry` name labels, not a canon claim.
- Engine facts read from code BEFORE any sim (not invented):
  - `stockPantry(kcal, name, opts)` (game.js) is the duty /
    production funnel: duty forage stocks 'Foraged food', duty
    garden stocks 'Garden harvest', duty fish stocks 'Fish
    catch', duty hunt stocks 'Game meat', traps stock 'Snared
    meat' / 'Pit meat (…)', expeditions stock 'Expedition
    haul' / 'Expedition meat'. Every kcal arrives as an item;
    the function rounds kcal and returns early on kcal <= 0.
  - Two other pantry doors exist (havenGrowth comment names
    all three: stockPantry, donateToPantry, pantryAdd).
    donateToPantry (scholar pack -> pantry) deposits via
    `depositPantryPieces(v, donated, 500)` — this is the route
    the scholar's own forage trips take into the pantry
    (forage -> pack -> donateHaul -> donateToPantry). pantryAdd
    is the finished-food put-away door (one finished item,
    cap-enforced). Direct pantry pushes bypass all three
    doors: starting stock (regionPeople pantry defs, pushed
    directly at setup), hierarchy tribute / league granary
    draws, raid spoils, favor repayments — none of these call
    stockPantry, so none are recorded by this instrument; they
    are named as a limitation, not silently absorbed.
  - Racks do NOT fill from inflow directly: preserveFood
    converts pantry items into preserved stock. The inflow
    question is therefore "what fills the pantry that the
    racks are smoked from?" — the dominant inflow source on a
    racks-bound day is the pantry stream feeding that day's
    racks, not a pipe into the racks. There is NO 'preserved
    stock' inflow class in code; that task-list phrase is
    answered by this mechanism note, not by inventing a class.
  - The competent policy never calls assignTask('forage')
    (substrate verdict); its scholar trips run via
    forageTripSeedFirst and leave no villager-duty line.

## Background (quoted, NOT re-judged here)

- evidence/2026-10-26/sim-substrate-b.md (DIAG-GO): 326/327
  racks-bound days classify S-NO-FORAGE-DUTY; duty forage
  returns 3 lines total (all Sierra, seed 9750); voiced
  throttle redirects are garden/fish (573 harvest + 93 fish),
  never forage. The open question this run answers: where do
  full racks come from when nobody forages?
- evidence/2026-10-26/sim-cookdiv-b.md and sim-reminder-b.md
  (rule R reminder voice, N=7, the current default): read for
  the voice context only. This run's classification never
  uses voice, spoken or silenced, so rule R cannot move it.

## PRE-REGISTRATION (bound per docs/MEASUREMENT.md §§9-12, 14-15)

### Instrument (new, DIAG only, zero src/js, zero default flips)

- scripts/inflow-capture.js (new): wraps THREE pantry doors
  AFTER loadGame, before setupGame, each delegating with
  identical arguments, `this`, and return value, writing
  ONLY to the caller's arrays:
  - Game.stockPantry: records (day via the plainvoice
    branchDay = scholar day, name verbatim, kcal rounded as
    the engine rounds it, door 'stock').
  - Game.depositPantryPieces: records (day, src.name
    verbatim, kcal = kcalEach * units, door 'deposit'). This
    captures scholar donations (donateToPantry) and any other
    deposit-door inflow.
  - Game.pantryAdd: records (day, item.name verbatim, kcal,
    door 'pantryAdd', added boolean = the return value) —
    only calls that return true put food in the pantry; a
    false return records kcal 0 toward attribution (cap
    refusal, not inflow).
  - A wrapper that throws during install, or a wrapped
    function that is not a function at install time, is a
    FATAL install failure, not a silent skip.
- scripts/substrate-capture.js + scripts/substrate-days.js
  REUSED UNCHANGED (say wrapper for cook lines + duty
  events; day-table builder for the racks-bound day set).
  The bound-day set in this run is therefore the same
  instrument as substrate's, and the neutrality pair below
  checks it reproduces substrate's bound days.
- scripts/inflow-days.js (new, shared): the attribution
  builder used identically by the sweep test and the
  analyzer, so attribution cannot drift between them.
  Input: one seed's day table (substrate-days) + inflow
  records. Output: one row per racks-bound day.
- scripts/sweep-inflow-b.js (new, adapted from
  sweep-substrate-b.js): same loadGame-per-seed pattern
  plus both captures; SWEEP_CENSUS=1 stdout mode
  (flap-proof: the long sweep never writes files; a
  short-lived splitter persists per-seed JSONs from stdout).
  Corpus dir (new, never mixed into older corpora):
  evidence/2026-10-26/sim-inflow-b-corpus/.
- scripts/test-inflow-b.js (new): grouping/attribution
  fixture checks (T1, runs BEFORE the sweep) + corpus
  assertions (T2, runs after). scripts/analyze-inflow-b.js
  (new): per-seed attribution tables + band roll-up +
  sense samples (day transcripts in arrival order).

### Racks-bound day (definition, fixed before the sweep)

Identical to substrate: a day D (of one seed) is
RACKS-BOUND iff at least one cook line that day has
racksFull true — a spoken racksFull frame, or a plain line
whose emit-time recompute says racksFull. Worked lines
never make a day racks-bound. The day set is computed by
the reused substrate-days builder, not re-derived here.

### Inflow-source classes (from code labels, fixed before the sweep)

Each inflow record maps to exactly one class by its
verbatim name (stock door) or door (deposit / pantryAdd
doors). First match wins; the mapping is total — every
recorded name lands in exactly one class, and the
other-stock class keeps the verbatim name on the record
so nothing hides inside a bucket:

- garden: stock name 'Garden harvest'
- fish: stock name 'Fish catch'
- forage: stock name 'Foraged food' (NOTE: this label is
  shared by several call sites — duty forage, scout cache
  finds, and misc 'Foraged food' deposits. The class is
  the code's label, not a claim about which call site
  fired; the analysis cross-checks it against the
  substrate duty-forage say lines, which ARE call-site
  specific.)
- hunt: stock names 'Game meat', 'Snared meat',
  /^Pit meat/, 'Expedition meat', 'Emergency hunt meat'
- expedition: stock name 'Expedition haul'
- trade-aid: stock names /^Aid from /, 'Aid crew haul',
  /^Remedy stores from /, 'Restitution', 'Weregild',
  'Refunded trade goods', 'Ration returned',
  /^Tribute grain from / (deposit door)
- system-feast: stock names 'Trial feast',
  /^System-replicated/, 'Genesis fruit',
  "Hoarder's interest", 'Meal leftovers'
- donated-pack: ANY deposit-door record (scholar pack
  donations and other deposit-door inflows; the verbatim
  item name is kept on the record and the analysis reports
  the top donated names — this is the scholar-trip channel)
- finished-putaway: ANY pantryAdd record that returned
  true (finished food put away; verbatim item name kept)
- other-stock: ANY other stock-door name, verbatim
  (reported by name in the analysis, never aggregated
  away; a class share for other-stock is always
  accompanied by its name breakdown)
- prior-stock: NOT an inflow class. It is the reason
  recorded on a racks-bound day with zero recorded inflow
  that day (see "Dominant source" below). Starting stock
  is one contributor to prior stock (setup direct push,
  before any recorder runs) but prior-stock days are NOT
  relabeled 'starting stock' — the recorder cannot see
  which earlier day's stock a smoked batch came from, and
  saying otherwise would invent provenance.

### Dominant source (per racks-bound day, fixed before the sweep)

Per racks-bound day, sum recorded inflow kcal by class
(same-day inflows only; stockPantry rounding already
applied by the engine before the wrapper records — the
wrapper records the rounded kcal the engine was called
with, which is what the pantry receives up to the
piece-split). The day's dominant source is the class
with the largest same-day kcal total; ties break by
earliest first arrival that day (lowest record seq),
recorded on the row. Every row carries: per-class kcal,
total inflow kcal, inflow record count, dominant class,
dominant kcal, dominant share of that day's inflow, and
the pantry snapshot at the day's first racks-bound cook
line (pantryKcal, preservedKcal, freshDays — from the
substrate cook snapshot).

- A day with total recorded inflow > 0 is ATTRIBUTED
  (dominant class named).
- A day with total recorded inflow == 0 is UNATTRIBUTED
  with the explicit named reason: `prior-stock: no
  recorded inflow this day; pantry at first bound line
  held {pantryKcal} kcal ({freshDays} fresh days), so the
  racks smoked from stock accumulated on earlier days
  (including starting stock)`. The reason is written on
  the row, never a bare UNCLASSIFIED bucket. A day is
  never attributed to a source with 0 kcal that day.

### Chosen band (fixed BEFORE any sweep — one band, never mixed)

- Policy: `competent` with COMPETENT_FEAST=0,
  FEASTSCALE_R13 unset/0, SEATDRIVE=0, PLENTYDEPRI=0 (pd0),
  DEPOSITGATE=1 (dg1). Policy id: `competent-nofeast` — the
  SAME band as sim-substrate-b and sim-noelig-lean-b, so
  per-seed comparison is like-for-like (same seeds, same
  horizon, same policy). This is a MEASUREMENT BAND, not a
  scale arm: wall numbers are reported labeled as such.
- Seeds 9750-9757 (8 seeds, the substrate band).
  Configs: 8 seeds x {cap0, cap1} = 16 configs. cap0 =
  neutrality control (stock harness, no capture); cap1 =
  substrate + inflow corpus. File names:
  inflow-b-<cap0|cap1>-pd0-dg1-competent-nofeast-s<seed>.json.
- Horizon: 100d death-aware (dead villages stop, +10d tail
  max). SAYCAP: cook lines 1000 (as substrate), event
  lines 3000, inflow records 50000 (separate cap; no cap
  may be hit — a hit invalidates that seed's attribution
  table and is reported, and a hit on cook lines
  invalidates that seed's day table as in substrate).

### VERDICT RULE (binding — judge ONLY against this header)

DIAG-GO holds if and only if ALL of the following hold:

- (a) NEUTRALITY FIRST: cap0 vs cap1 numeric fields
  identical on 8/8 seeds (daysAlive, batches, kcal,
  resolutions, deaths, deathCauses, national, rank, table,
  win, waveReach, endReason). The recorders wrap ONLY
  Game.say (substrate, unchanged) and the three pantry
  doors (inflow, delegating identically); no engine
  function is wrapped beyond those four, no Game.state
  write occurs in any wrapper, no RNG is consumed by any
  wrapper. The neutrality leg runs BEFORE any attributed
  number is judged.
- (b) BOUND-DAY REPRODUCTION (instrument neutrality,
  second leg): cap1's racks-bound day set equals the
  substrate corpus's day set on every seed — same day
  lists, same 327 total (or the drift is named per seed
  with counts; any drift must be explained as a head
  change since substrate landed, and the verdict then
  rests on this run's own paired corpus, with the drift
  stated, not hidden). A recorder that perturbs
  trajectories invalidates everything.
- (c) ATTRIBUTION COMPLETE: every racks-bound day on the
  band appears in the attribution table exactly once
  with exactly one dominant class OR one named
  prior-stock reason; days with neither == 0. The
  headline metric is attribution completeness = fraction
  of racks-bound days ATTRIBUTED (dominant class named
  from same-day inflow). DIAG-GO bar: completeness
  >= 95%, AND every unattributed day carries its explicit
  prior-stock reason with its pantry snapshot (never a
  bare bucket). If completeness < 95%, the verdict is
  DIAG-NO-GO even if every unattributed day is named —
  the bar is the bar; the named reasons then say what
  the next instrument must thread (e.g. direct-push
  doors).
- (d) DOMINANT SOURCES RANKED: the ranked inflow-source
  shares across racks-bound days are published — both
  (i) share of bound days by dominant class, and (ii)
  share of bound-day inflow kcal by class — plus the
  answer in plain words to "where do full racks come
  from when nobody forages?"
- (e) SENSE READ: 2-3 racks-bound days sampled with their
  day transcripts in arrival order (cook lines, inflow
  say lines where the code voices them — garden/fish
  duty lines, throttle redirects — and the attribution
  row), judged in plain words whether the day reads as
  "the garden/fish filled the pantry and the cook smoked
  it" vs "the racks smoked from old stock" vs anything
  incoherent. At least one sample per dominant class
  that holds >= 5 bound days, or all classes if smaller.
  No voice taxonomy is used anywhere in this read.
- (f) VALIDITY: 16/16 per-seed files present and parsing;
  batches >= resolutions on every cell; on every cap1
  cell, captured worked-line count EQUALS
  preserveVillagerResolutions (the racksvoice cross-check,
  as substrate); every cap1 cook total under the 1000
  cap, every event total under the 3000 cap, every
  inflow total under the 50000 cap (no truncation).
- (g) WALL NUMBERS published, labeled as a measurement
  band (SEATDRIVE=0 construction): national-or-better /
  table / wins, wave 1-5 reach, median survival (median
  daysAlive). Table 0 is a construction fact, not a
  scale-wall finding.

Otherwise the verdict is DIAG-NO-GO, with the failed
condition(s) named. A DIAG-NO-GO here means ONLY "this
recorder cannot attribute racks-bound-day inflow" — it
names exactly which field is missing and where it would
have to be threaded from. It is NOT a policy comparison
and NOT a judgment on the cook mechanic, the throttle,
or the substrate verdict.

### Pilot gate (§9)

- The pilot IS the 8-seed band (16 configs). The
  grouping/attribution fixture test (scripts/test-
  inflow-b.js T1) runs BEFORE the sweep: if fixture days
  do not attribute exactly as pre-registered, the sweep
  does not run. No confirm spend exists for a DIAG arm
  beyond the pilot band unless attribution is incomplete,
  in which case the run reports DIAG-NO-GO rather than
  buying seeds to paper over an instrument gap.

### Balanced panel (§15)

- This is a DIAG classification, not a before/after
  balance pair (no game lever changes), so no panel
  compare is expected. A panel attempt is recorded
  honestly: if scripts/balance-panel.js cannot ingest
  recorder corpora (the known failure class from the
  substrate/plainvoice/noelig runs — it is a panel RUNNER
  that spawns its own sims under its own observer), that
  note is written and no panel input is fabricated. The
  §15-equivalent instrument is the cap0 vs cap1 paired
  table in RESULTS.

### Sense-testing, villager behaviour

- SENSE-TESTING LAW: the day transcripts in (e) are read
  for meaning, not just counts — does a garden-dominant
  day read as a village feeding itself from its beds
  while the racks overflow, or as numbers with no story?
  Flag anything robotic or repeated (e.g. the same
  garden line every day-part with no variation, or a
  dominant class the village's own lines never mention).
- VILLAGER-BEHAVIOUR SAMPLE: who produces the dominant
  inflow on racks-bound days (duty say lines name the
  gardener/fisher where the code voices them), and whether
  the same villagers always fill the pantry.

### Metric review (filled after the verdict, §14 — revisions apply to the NEXT run, this verdict is NOT re-scored)

- See the "Metric review" subsection under RESULTS below.

### Scope

Zero src/js game changes in this worktree. New files only:
scripts/inflow-capture.js, scripts/inflow-days.js,
scripts/sweep-inflow-b.js, scripts/test-inflow-b.js,
scripts/analyze-inflow-b.js,
evidence/2026-10-26/sim-inflow-b-corpus/ (per-seed files),
evidence/2026-10-26/sim-inflow-b.md (this file).
scripts/substrate-capture.js, scripts/substrate-days.js
and scripts/plainvoice-capture.js are REUSED unchanged.
No push, no version bump, no live verification —
committed on branch sim-inflow-b, pending coordinator merge.

---

## RESULTS (appended after the pre-registration above; verdict judged ONLY on the corpus named here)

CORPUS: evidence/2026-10-26/sim-inflow-b-corpus/, 16 files
(inflow-b-cap0/cap1-pd0-dg1-competent-nofeast-s9750..9757.json),
policy competent-nofeast (competent, COMPETENT_FEAST=0,
FEASTSCALE_R13 unset/0), pd0, dg1, 100d death-aware horizon,
current head (no patch, no game change, rule R default).
CAP=0 = stock harness (control); CAP=1 = substrate say capture
(reused unchanged) + inflow pantry-door capture, cook cap 1000,
event cap 3000, inflow cap 50000. CAP=1 files carry the FULL
cook-line array + event array + inflow array + day table +
attribution table.

PROOF TEST: node scripts/test-inflow-b.js --corpus — 459 PASS
/ 0 FAIL (T1 fixtures 41, T2 corpus assertions 418). T1 ran
BEFORE the sweep (41/0) and gated it. Analyzer:
node scripts/analyze-inflow-b.js (tables + samples below).
Sweep logs: evidence/2026-10-26/.inflow-logs/cap0/cap1.log
(stdout carrier; per-seed JSONs split from them by a
short-lived validator that checked filename-seed match, cap
match, parse, and readback). The .inflow-logs directory is
transient carrier material, not corpus, and is deleted
before commit (the corpus files are the record).

### Verdict: DIAG-NO-GO (on condition (c) only)

- (a) NEUTRALITY HOLDS: cap0 vs cap1 numeric fields identical
  on 8/8 seeds (daysAlive, batches, kcal, resolutions, deaths,
  deathCauses, national, rank, table, win, waveReach,
  endReason — test T2 "neutrality" 8/8). The recorders wrap
  ONLY Game.say (substrate, unchanged) and the three pantry
  doors (delegating identically); no Game.state write, no RNG
  consumed by any wrapper. The neutrality leg ran BEFORE any
  attributed number was judged.
- (b) BOUND-DAY REPRODUCTION HOLDS: cap1's racks-bound day
  set equals the substrate corpus's day set on every seed —
  same day lists, not just same totals (9750: 37, 9752: 73,
  9753: 56, 9755: 36, 9756: 58, 9757: 67; 9751/9754: 0),
  327 total both sides. The added pantry-door wrappers did
  not perturb trajectories.
- (c) ATTRIBUTION COMPLETENESS FAILS THE BAR: 289 of 327
  racks-bound days attributed (88.4%), below the
  pre-registered >= 95% bar. The 38 unattributed days ALL
  carry their explicit prior-stock reason with pantry
  snapshot (condition (c)'s naming half is met; the bar
  half is not). Per the header, the bar is the bar: the
  verdict is DIAG-NO-GO even though every unattributed day
  is named. What the failure means is established below
  (it is NOT a recorder gap — see "Why the bar missed").
- (d) DOMINANT SOURCES RANKED: published below, both by
  dominant days and by inflow kcal, plus the plain-words
  answer.
- (e) SENSE READ HOLDS: five dominant-class samples + two
  prior-stock samples below, day transcripts in arrival
  order, judged in plain words. No voice taxonomy used.
- (f) VALIDITY HOLDS: 16/16 files present and parsing;
  batches >= resolutions on every cell; worked ==
  resolutions on every CAP=1 cell (39/5/39/34/7/50/45/38);
  every CAP=1 cook total under the 1000 cap (max 424),
  every event total under the 3000 cap, every inflow
  total under the 50000 cap (max 281 records on a seed),
  so no cell was truncated.
- (g) WALL NUMBERS published below, labeled as a
  measurement band (SEATDRIVE=0 construction).

A DIAG-NO-GO here means ONLY "same-day inflow attribution
as pre-registered cannot reach 95% on this band" — the
instrument is proven neutral and complete in its naming
(every bound day has exactly one dominant class or one
named reason, 0 days with neither). It is NOT a policy
comparison, NOT a judgment on the cook mechanic, the
throttle, or the substrate verdict.

### Why the bar missed (established, not assumed)

The 38 prior-stock days are genuine zero-inflow days, not
missed doors:

- They carry ZERO inflow records of any kind (not a
  rounding or door miss: 0 stock, 0 deposit, 0 pantryAdd
  records that day) and ZERO refused pantryAdd attempts
  band-wide (0 refused on all 327 bound days).
- Their pantry snapshots are deep stock, not empty
  shelves: pantryFirst 19,360–120,329 kcal, fresh
  4.6–249.8 days. Neighbour days DO have inflow (e.g.
  9757 d68: 0 today, 11,412 yesterday), so the recorder
  sees inflow fine — it just does not arrive every day.
- On 10 of the 38 days the cook still smoked a worked
  batch from that old stock (workedLines = 1), which is
  exactly what "racks smoked from prior stock" predicts.
- Direct-push doors (raid spoils, favor repayments,
  tribute, league draws) bypass all three wrapped doors
  and could in principle fire on a prior-stock day, but
  nothing in this band makes them likely (rank village
  throughout, no national/regional links, no hierarchy
  draws at this scale), and the deep pantry snapshots
  make old stock sufficient regardless. Named as the
  residual limitation, not hidden.

So the same-day metric is the wrong shape for a stock:
the racks are a reservoir, not a stream. On roughly one
bound day in nine, nothing new arrives at all and the
cooks smoke from what is already there. That is a
finding about the village, not a broken recorder — but
the header binds the verdict, and the verdict is NO-GO.
The metric revision for the NEXT run is in "Metric
review" below; this verdict is NOT re-scored against it.

### The headline: the racks are filled by the scholar, ambient foragers, hunters, and old stock — never by the garden

PER-SEED TABLE (CAP=1; CAP=0 numerics identical):
seed days batches res worked spoken plain | bound attr | dominant days (forage/hunt/donated/finished/expedition/prior-stock)
- 9750 100 88 39 39 21 167 | 37 24 | forage 23, finished 1, prior 13
- 9751 48 7 5 5 0 12 | 0 0 | —
- 9752 100 106 39 39 27 218 | 73 72 | hunt 23, forage 17, donated 30, finished 1, expedition 1, prior 1
- 9753 100 107 34 34 35 215 | 56 54 | forage 26, hunt 23, finished 5, prior 2
- 9754 97 13 7 7 0 3 | 0 0 | —
- 9755 100 190 50 50 28 30 | 36 29 | forage 25, expedition 2, hunt 1, finished 1, prior 7
- 9756 100 132 45 45 43 94 | 58 52 | forage 43, donated 4, hunt 4, expedition 1, prior 6
- 9757 100 118 38 38 41 345 | 67 58 | forage 47, donated 8, expedition 1, finished 2, prior 9
Band: bound days 327, attributed 289 (88.4%), spoken
complaints 195, plain lines 1084, worked 257, deaths 43,
inflow records band total 1,608.

RANKED, BY DOMINANT DAYS (of 327 bound days):
forage 181 (55.4%), hunt 51 (15.6%), donated-pack 42
(12.8%), prior-stock 38 (11.6%), finished-putaway 10
(3.1%), expedition 5 (1.5%), garden 0, fish 0, trade-aid 0,
system-feast 0, other-stock 0.

RANKED, BY BOUND-DAY INFLOW KCAL (total 546,285 kcal):
donated-pack 357,320 (65.4%), forage 104,991 (19.2%),
hunt 46,088 (8.4%), expedition 23,126 (4.2%),
finished-putaway 13,800 (2.5%), fish 960 (0.2%),
garden 0, trade-aid 0, system-feast 0, other-stock 0.

Three facts inside those rankings matter more than the
rankings themselves:

1. GARDEN IS ZERO EVERYWHERE. Not just on bound days:
   zero 'Garden harvest' stockPantry calls in the entire
   band, all days, all seeds (1,608 inflow records, none
   garden). The garden leg never stocks at all under
   competent-nofeast — the throttle turns gardeners to
   wood/water/stone on high-fresh days, and no harvest
   window ever opens (see Findings). Fish is the
   contrast: 84,761 kcal all-run, but only 960 kcal on
   bound days — fishers DO stock when the pantry is low
   (non-bound days), and the throttle shuts them off on
   the high-fresh days when the racks are bound. Garden
   never even gets the low-fresh window.
2. 'FORAGED FOOD' IS NOT DUTY FORAGE. Duty-forage say
   lines account for 1,316 kcal on bound days (Sierra's
   two returns on 9750 d47) against 104,991 kcal of
   forage-class inflow — 98.7% of bound-day 'Foraged
   food' comes from non-duty call sites that share the
   code label: away-return forage hauls, villager
   big-day / routine hauls, scout cache finds, quiet
   pantry gifts, fireside armfuls, quest turn-ins. The
   village DOES forage — through ambient villager systems
   and returns, not through duty assignments. The
   substrate verdict (no forage DUTY) and this verdict
   (forage-label dominant on 181 bound days) are
   compatible: different doors, same label. Any report
   that says "foraging feeds the racks" without that
   qualifier is wrong.
3. THE SCHOLAR IS THE BULK SUPPLIER BY KCAL. Donated-pack
   (scholar pack -> pantry via donateToPantry) is 65.4%
   of bound-day inflow kcal on only 42 dominant days:
   single donations run to ~8,460 kcal in a day (9752
   d32). The donated names are plants, not meat:
   Burdock 228,690 kcal, Muscadine Grapes 88,470,
   Staghorn Sumac 37,200, American Persimmon 2,600,
   Cattail 360 (bound days). That is the scholar's own
   forage trips, donated in bulk — the competent policy's
   forageTripSeedFirst + donateHaul loop. On 9752 the
   scholar donates 299,180 kcal all-run; on 9757,
   88,470. Finished-putaway (10 dominant days, 13,800
   kcal) is entirely one item: "Winner's share (alien
   rations)" — contest winnings put away as finished
   food, not a production stream at all.

### The plain-words answer

Where do full racks come from when nobody forages? From
four places, in this order by weight: first, the scholar
hauling plants home in bulk and donating them (Burdock,
grapes, sumac — two-thirds of the calories on bound
days); second, villagers bringing food home outside any
duty — big hauls, returns from trips away, scout caches,
little gifts by the fire — all filed under the code's
'Foraged food' label; third, hunters and expeditions
bringing meat and hauls; and fourth, on about one bound
day in nine, from nothing new at all — the pantry was
already so deep (twenty to a hundred-plus days of fresh
food) that the cooks smoked from yesterday's stock while
the gardeners were turned away to haul wood. The garden
contributes nothing, ever, on this way of playing: the
beds never yield a stocked harvest. So the racks are not
a mystery of missing foragers — they are the visible
tip of a pantry filled by the scholar, by villagers'
unofficial foraging, and by sheer accumulation.

### SENSE-TESTING samples (day transcripts in arrival order)

- FORAGE-DOMINANT [9750 d47, the band's only S-FORAGED
  day]: Penelope turned from the harvest to the stone
  pile (~5 days fresh); Sierra smokes 4 batches (~2,416
  kcal); Sierra returns with foraged food (+624 kcal);
  Sierra speaks the racks-full complaint (15,022 kcal
  kept); Sierra returns again (+692 kcal); Malik's plain
  line. Attribution: forage 2,431 kcal (72%), fish 960.
  Judgment: reads as abundance with a forager in it —
  the ONLY bound day where duty forage and the racks
  story meet, and even here duty forage is barely half
  the forage-class total (1,316 of 2,431). The day's
  food work is voiced; the rest of the forage inflow is
  not.
- FINISHED-PUTAWAY-DOMINANT [9750 d74]: Sam turned from
  the harvest to the wood run (~56 days fresh); Sierra
  smokes 2 batches (~1,593 kcal); Sierra speaks the
  racks-full complaint (14,390 kcal); Malik's plain line.
  Attribution: finished-putaway 2,400 kcal (94%) —
  Winner's share alien rations put away, forage 158.
  Judgment: reads as a prize, not production — a contest
  win lands in the pantry on a day the village already
  has everything, and the racks complain about it. The
  log never says the prize arrived that day; the
  attribution is the only witness.
- HUNT-DOMINANT [9752 d28, the village's first bound
  day]: Mason turned from the harvest to the wood run
  (~20 days fresh); Mason speaks the racks-full complaint
  (19,034 kcal); nothing else voiced. Attribution: hunt
  409 kcal (62%), forage 249; pantry 60,655 kcal.
  Judgment: reads as a quiet day with a full pantry —
  the hunt inflow that dominates the day is entirely
  silent in the log (no hunt say line is captured or
  voiced that day). The numbers say "hunt fed the
  racks"; the transcript says nothing at all.
- DONATED-PACK-DOMINANT [9752 d32]: Nina turned from
  the harvest to the stone pile (~16 days fresh);
  Mason's plain line. Attribution: donated-pack 8,460
  kcal (92%), forage 512, hunt 216; pantry 62,266 kcal.
  Judgment: the day's story is invisible in the log —
  an 8,460-kcal scholar donation (bulk Burdock/grapes
  by the name totals) arrives with no line at all, while
  the one voiced line is a gardener being turned away.
  A player reading the log would conclude nothing
  happened; the pantry grew by a week's food.
- EXPEDITION-DOMINANT [9752 d51]: Theo turned from the
  harvest to the water run (~26 days fresh); Paramjit
  speaks the racks-full complaint (48,491 kcal); plain
  lines follow. Attribution: expedition 1,283 kcal (82%),
  hunt 289; pantry 106,369 kcal. Judgment: reads as a
  village drowning in food — 106k kcal in the pantry,
  racks at 48k — with the expedition haul again silent.
- PRIOR-STOCK [9757 d68]: Miguel turned from the fish
  nets to the wood run (~114 days fresh); Miguel smokes
  2 batches (~3,160 kcal); Miguel speaks the racks-full
  complaint (18,870 kcal); plain lines follow. Zero
  inflow that day; pantry 61,372 kcal, 104.6 fresh days.
  Judgment: reads exactly as the reason says — nothing
  arrived, nobody needed it to, the cook smoked from a
  pantry with a hundred days of fresh food in it. The
  complaint is about a stock problem, not a flow problem.
- PRIOR-STOCK [9750 d83]: Sierra turned from the fish
  nets to the stone pile (~31 days fresh); Sierra smokes
  3 batches (~914 kcal); Sierra speaks the racks-full
  complaint (13,033 kcal); plain lines follow. Zero
  inflow; pantry 23,050 kcal. Judgment: same shape at a
  smaller scale — the racks smoke from old stock while
  the fisher is turned away. Coherent, not robotic; the
  repetition that matters is structural (the same
  redirect line, once a day, always garden/fish, never
  forage — as substrate found).

SENSE FLAG (not a verdict condition): most bound-day
inflow is SILENT. Duty lines voice garden/fish/forage
work and throttle redirects, but stockPantry itself
says nothing for hunt, expedition, ambient forage, or
scholar donations — the three largest bound-day streams
by kcal (donated-pack, ambient forage, hunt) arrive
without a log line. A player reading the transcript
sees full racks, turned-away gardeners, and complaining
cooks, but never sees the food arrive. The inflow story
is real and measured, but untold in the game text.

### WALL NUMBERS (corpus, CAP=1; measurement band, SEATDRIVE=0)

national-or-better 0/8, table 0/8, wins 0/8, wave reach
distribution per-cell max {3,2,2,3,3,3,2,2} (wave-4
reach 0/8, wave-5 reach 0/8), median daysAlive 100, max
100. Table 0 is a construction fact (SEATDRIVE=0), not a
scale-wall finding. National 0/8 matches the substrate
band (same policy, same construction). Total deaths 43
(CAP=1); 9751 lost at day 48 (12 deaths), 9754 lost at
day 97 (14 deaths, starvation-marked in the noelig read).

### VILLAGER-BEHAVIOUR SAMPLE

Who fills the pantry on racks-bound days: the scholar
(plant donations, bulk, silent); ambient villagers
(big-day and return hauls, scout caches, small gifts —
voiced only sometimes, e.g. the fireside armful and
quiet-gift lines, not captured as events by this
recorder); hunters and expedition parties (silent);
and, on 10 days, a contest winner's share put away.
Who does NOT: gardeners (never stock, all run) and
fishers (stock only on low-fresh, non-bound days).
Sierra is still the only duty forager in the band (3
returns all run, 2 on bound days). The cooks rotate
(Miguel, Sierra, Grace, Malik, Mason, Paramjit) but the
inflow shape does not: bound day after bound day, the
same pattern — full racks, fresh pile about to rot,
gardener/fisher turned away, food arriving silently
from the scholar and from unofficial hauls, or not
arriving at all.

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
header — the same stance the substrate/plainvoice/noelig
runs took.

### Metric review (§14 — for the NEXT run; this verdict is NOT re-scored)

- SAME-DAY ATTRIBUTION IS THE WRONG SHAPE FOR A STOCK.
  The pre-registered bar (>= 95% of bound days with a
  same-day inflow source) fails at 88.4% not because the
  recorder misses doors — prior-stock days have zero
  records of any kind — but because a reservoir does not
  need a daily stream. The next run should attribute
  bound days to a TRAILING WINDOW (e.g. dominant source
  over the 7 days ending on the bound day, with the
  window and the prior-stock fallback both pre-registered)
  or, better, to STOCK PROVENANCE: pantry items already
  carry harvestShares/gardenShares, and preserveFood
  converts specific items — threading those shares
  through the preserve step would answer "which stream's
  food is on the racks" directly, instead of "which
  stream arrived today." Either revision must be
  pre-registered with its own bar; neither rescues this
  run's NO-GO.
- 'FORAGED FOOD' LABEL AGGREGATION. The class is the
  code's label, shared by duty forage, away returns,
  big-day/routine hauls, scout caches, quiet gifts,
  fireside armfuls, and quest turn-ins. A future run
  that wants "who foraged" rather than "what label
  arrived" must thread call-site (or capture the
  ambient say lines: the quiet-gift +150, fireside
  +100, big-day lines are voiced, the return/routine
  hauls mostly are not). Until then, never quote the
  forage-class share as duty-forage share — duty forage
  is 1.3% of it on bound days.
- GARDEN-ZERO NEEDS ITS OWN ARM. Zero garden stocks in
  1,608 inflow records is a production fact, not a
  recorder artifact (the wrapper sees every stockPantry
  call). The open question is mechanism: does the
  throttle permanently close the harvest window (plots
  never ripe because gardeners are always redirected
  before sowing/cultivating), or do plots ripen and rot
  unharvested? That arm needs garden-plot state reads
  (ripe/planted counts per day), not another inflow
  recount.
- SCHOLAR-DONATION VISIBILITY. The largest bound-day
  stream (donated-pack, 65.4% of kcal) is entirely
  silent in the log. If Steve wants the player to
  understand where the pantry comes from, a donation
  line (or a haven-board summary) is the missing
  surface — a design question, not a measurement fix.
  Recorded here; not built here (DIAG only).
- PRIOR-STOCK DAYS ARE NOT A FAILURE OF THE VILLAGE.
  Eleven-point-six percent of bound days having no
  inflow is abundance, not breakdown: the pantry holds
  19k–120k kcal on those days. A future bar that treats
  prior-stock as failure would punish the village for
  being full. The trailing-window / provenance revision
  above handles this honestly.

### CONVERGENCE STATE for this axis (racks-bound-day inflow)

DIAG-NO-GO on the pre-registered same-day bar (88.4% <
95%), with the instrument itself proven neutral (8/8),
bound-day-exact (327/327 day lists), and complete in
naming (0 days with neither class nor reason). On
competent-nofeast, racks-bound days are fed: forage-label
181/327 days (but duty forage only 1.3% of that kcal),
hunt 51, scholar donations 42 days / 65.4% of kcal,
contest put-away 10, expeditions 5, prior stock 38,
garden 0, fish 0 dominant days. The 1237Z blank 1 is
answered in substance — full racks come from the
scholar's bulk plant donations, villagers' unofficial
hauls, hunters/expeditions, and accumulated stock — but
the pre-registered metric does not pass, so the blank
stays open for the trailing-window/provenance follow-up
named above, not closed by re-scoring.

### VILLAGE ASSESSMENT (plain words)

These villages eat from a pantry nobody watches fill.
The scholar walks out, comes back with armfuls of
burdock and grapes, and tips them into the pantry
without a word in the log. Villagers bring home hauls
from trips away, big lucky days, scout finds, little
gifts by the fire — again, mostly without a word. Hunters
bring meat; expeditions bring hauls. The gardeners, the
people whose job is supposed to be growing food, never
bring in a single harvest all run, because every day
the pantry is already so full that they get turned away
to haul wood and water instead. The fishers bring fish
only on the lean days, never on the days the racks are
full. And about one day in nine, nobody brings anything
at all — the pantry already holds weeks or months of
food, the cooks smoke from it anyway, and the racks stay
full. If Steve asks why the racks are full when nobody
forages, the honest answer is: somebody IS foraging —
the scholar, and villagers on their own time — just
never on duty; and the garden, the one food source the
village is supposed to grow, grows nothing at all.

### Scope compliance

Zero src/js changes. Changed/added:
scripts/inflow-capture.js, scripts/inflow-days.js,
scripts/sweep-inflow-b.js, scripts/test-inflow-b.js,
scripts/analyze-inflow-b.js,
evidence/2026-10-26/sim-inflow-b-corpus/ (16 files),
evidence/2026-10-26/sim-inflow-b.md (this file).
scripts/substrate-capture.js, scripts/substrate-days.js
and scripts/plainvoice-capture.js REUSED UNCHANGED
(verified by the T1 static checks). No push, no version
bump, no live verification — committed on branch
sim-inflow-b, pending coordinator merge.
Process note (honest, not a verdict condition):
scripts/check.js --quick produced no output in ~7
minutes and was killed to avoid concurrent-run
interference with the sweep; the designated proofs for
this DIAG arm are T1 (41/0, pre-sweep) and T2 (418/0,
post-sweep), both green, and no src/js file was touched,
so no game-code check surface exists for this run.

### Findings for the coordinator backlog (do NOT edit goal hidden_files here)

- [open] 2026-10-26 — racks inflow attribution —
  same-day attribution reaches only 289/327 bound days
  (88.4%, below the 95% bar): 38 bound days have zero
  inflow of any kind and smoke from prior stock
  (pantry 19k–120k kcal). Verdict DIAG-NO-GO on the
  pre-registered bar; instrument proven neutral (8/8)
  and bound-day-exact (327/327). Next instrument:
  trailing-window or stock-provenance (harvestShares
  through preserveFood) (evidence sim-inflow-b).
- [open] 2026-10-26 — garden never stocks — zero
  'Garden harvest' calls in 1,608 inflow records across
  8 seeds / all days on competent-nofeast; gardeners are
  throttled daily and no harvest window opens. Needs a
  garden-plot-state arm (ripe/planted counts per day),
  not another inflow recount (evidence sim-inflow-b).
- [open] 2026-10-26 — scholar is the bulk supplier,
  silently — donated-pack is 65.4% of bound-day inflow
  kcal (Burdock 228,690; Muscadine Grapes 88,470;
  Staghorn Sumac 37,200) via scholar forage trips +
  donateHaul, with no log line. Player-visible inflow
  story is missing; candidate design: a donation line
  or haven-board summary (evidence sim-inflow-b).
- [open] 2026-10-26 — forage label vs duty forage —
  'Foraged food' dominates 181/327 bound days but duty
  forage is only 1,316 of 104,991 bound-day forage kcal
  (1.3%); the rest is ambient/return/big-day/scout/quest
  hauls sharing the label. Never quote the forage-class
  share as duty-forage share (evidence sim-inflow-b).
- [open] 2026-10-26 — fish stocks only off-bound days —
  fish 84,761 kcal all-run but 960 kcal on bound days:
  the throttle shuts fishers off exactly on high-fresh
  (racks-bound) days. Contrast with garden-zero (which
  never stocks even off-bound days) (evidence
  sim-inflow-b).
- [open] 2026-10-26 — contest winnings feed the pantry —
  finished-putaway on bound days is entirely "Winner's
  share (alien rations)" (13,800 kcal, 10 dominant days):
  contest prizes put away as finished food on
  already-full days, silently (evidence sim-inflow-b).

