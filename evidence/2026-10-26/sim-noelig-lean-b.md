# sim-noelig-lean-b — P-RACKS-NOELIG measured on a leaner band (DIAG only, no game change)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T1130Z,
axis food-economy, arm sim-noelig-lean-b.
Worktree: `~/workspace/worktrees/sim-noelig-lean-b`, branch sim-noelig-lean-b.

Status: PRE-REGISTERED — everything under "PRE-REGISTRATION" below was
written BEFORE any sim in this run was executed. The RESULTS section
at the end is appended after the sweep completes and is judged ONLY
against the header. This run does NOT re-judge the plainvoice corpus
(sim-plainvoice-b, leadfeast band) — it measures one new band.

## Canon read first

- `docs/CANON.md` (manifest), then `docs/PRESERVATION.md` (the food
  ladder: cleaned 2d < cooked 5d < smoked 30d < rendered 90d <
  pemmican 120d; smoking 16 ticks; "rot can't be smoked back into
  food") and `docs/CONVERSATIONS.md` (dialogue sense bar: real
  back-and-forth, no repeats, context-aware openings — the bar
  plain lines are judged against).
- No canon doc covers cook-voice classification — stated, not
  invented. The taxonomy below is the MEASUREMENT INSTRUMENT from
  sim-plainvoice-b, reused unchanged, not a canon claim. No new
  voice rule is designed or implemented here.

## Background (quoted, NOT re-judged here)

- evidence/2026-10-26/sim-plainvoice-b.md (DIAG-GO): plain cook
  frames split AT THE SOURCE on leadfeast, seeds 9750-9757: 900
  plain lines, 0 UNCLASSIFIED — P-SILENCED 483, P-RES2PLUS 215,
  P-FIRST-NOSMOKE 202, P-RACKS-NOELIG 0. The class "racks full,
  nothing about to rot to complain about" never occurs on
  leadfeast: on that food-rich policy a racks-bound day always
  carries about-to-rot surplus.
- evidence/2026-10-26/sim-food-economy-round-1035-b.md (1035Z
  blank 4): P-RACKS-NOELIG was genuinely empty — 0 of 900 plain
  lines — on leadfeast only, unmeasured on leaner policies.
  This arm is that blank.

## PRE-REGISTRATION (bound per docs/MEASUREMENT.md §§9-12, 14-15)

### Instrument (reused, DIAG only, zero src/js, zero default flips)

- scripts/plainvoice-capture.js (unchanged, from sim-plainvoice-b):
  wraps `Game.say` AFTER loadGame; for every cook line records
  frame class (worked / racksFull / plain) and, for plain lines
  ONLY, the emit-time context tags (day, cook, resolutionIndex
  recorder ordinal, racksFull recompute, eligiblePresent /
  eligibleCount / eligibleKcal, voiceSpokenToday, preservedKcal,
  rackCap). Read-only by construction (writes only the caller's
  arrays; person lookup reads `Game.data.villagers` directly,
  never `Game.getPerson`; every tag computation try/catch
  isolated). Classes are assigned from tags ONLY, never text.
- scripts/sweep-noelig-lean-b.js (new, adapted from
  sweep-plainvoice-b.js): same loadGame-per-seed pattern plus the
  plainvoice capture; SWEEP_CENSUS=1 stdout mode (flap-proof:
  the long-running sweep never writes files; a short-lived
  splitter persists per-seed JSONs from stdout). Corpus dir
  (new, never mixed into older corpora):
  evidence/2026-10-26/sim-noelig-lean-b-corpus/ — inside this
  worktree, NEVER /tmp as the sole copy.
- scripts/test-noelig-lean-b.js (new): taxonomy fixture checks
  (T1, runs BEFORE the sweep) + corpus assertions (T2, runs
  after). scripts/analyze-noelig-lean-b.js (new): per-seed
  class distribution table + sense samples + the eligible-present
  split on the non-full classes.
- Taxonomy reused VERBATIM from sim-plainvoice-b (exclusive,
  first match wins): P-SILENCED (racksFull && eligible &&
  voiceSpokenToday); P-RACKS-NOELIG (racksFull && !eligible);
  P-RES2PLUS (!racksFull && resolutionIndex >= 2);
  P-FIRST-NOSMOKE (!racksFull && resolutionIndex == 1);
  UNCLASSIFIED (recompute failed / rackCap ambiguous /
  impossible combo racksFull && eligible && !voiceSpokenToday
  under gate B).

### Chosen leaner policy (fixed BEFORE any sweep — this choice is the pre-registration)

- Policy: `competent` (scripts/policies/competent.js) with
  COMPETENT_FEAST=0, FEASTSCALE_R13 unset/0, SEATDRIVE=0,
  PLENTYDEPRI=0 (pd0), DEPOSITGATE=1 (dg1). Policy id in files:
  `competent-nofeast`.
- WHY IT IS LEANER THAN LEADFEAST (the claim this band tests):
  leadfeast is leadcourt courtship PLUS the feastscale r13
  layer, which counts tribute/tend toward the feast gate and
  actively drives regular pantry feasts (armed cadence 7d,
  affordability have >= cost x 1.5, feast-draw scavengers,
  FEASTED combat windows). Competent with COMPETENT_FEAST=0
  removes the ENTIRE feast engine: `feastOn()` returns false,
  so eveningFeast, channelDevotion and feastFightRoad all
  return immediately; surplusFeast is separately default-OFF
  (needs COMPETENT_SURPLUS_FEAST=1, not set); and competent
  carries no leadcourt daily, so there are no courtship
  tribute/tend outflows either. The village food economy on
  this band is base foraging/cooking/preserving only — no
  feast-driven pantry draws, no feast-draw scavengers, no
  FEASTED buff windows, no courtship outflows. That is the
  leaner, feast-free band on which a racks-bound day might
  finally arrive with nothing about to rot to complain about.
  NOTE, stated not hidden: removing feast draws also removes
  a pantry OUTFLOW, so the direction of the pantry effect is
  not assumed — the band reports preservedKcal/rackCap and
  the eligible-present split alongside the class counts, and
  the verdict rests on the measured counts, not on the
  direction guess.

### Substrate, seeds, horizon (identical on all configs)

- Policy competent-nofeast (above), DEPOSITGATE=1,
  FEASTSCALE_R13 unset/0 (asserted FATAL by the driver:
  R13=1 is a hard error), SEATDRIVE=0, PLENTYDEPRI=0 (pd0
  only), 100d death-aware horizon (dead villages stop, +10d
  tail max). All asserted FATAL by the driver. SAYCAP=1000.
- Pilot band: seeds 9750-9757 (8 seeds, the plainvoice band,
  so per-seed comparison against the leadfeast band is
  like-for-like on seeds). Configs: 8 seeds x {cap0, cap1} =
  16 configs. cap0 = neutrality control (stock harness, no
  capture); cap1 = classified corpus. File names:
  noelig-lean-b-<cap0|cap1>-pd0-dg1-competent-nofeast-s<seed>.json.
- Extension rule, pre-registered: extend to 16 seeds ONLY if
  UNCLASSIFIED > 5% on the pilot; otherwise the 8-seed band
  decides. No confirm spend on a classified band.
- Re-sweep on current master: NO old corpus is cited as this
  run's numbers. Prior totals (leadfeast 900 plain, NOELIG 0)
  are background only; every number in RESULTS comes from
  this run's fresh sweep on the leaner band.

### VERDICT RULE (binding — judge ONLY against this header)

DIAG-GO holds if and only if ALL of the following hold:

- (a) NEUTRALITY FIRST: cap0 vs cap1 numeric fields identical
  on 8/8 seeds (daysAlive, batches, resolutions, deaths,
  national, waveReach, rank). A recorder that perturbs
  trajectories invalidates everything — no classified number
  is judged if this fails. The neutrality leg runs BEFORE
  any classified number is judged.
- (b) COVERAGE: >= 95% of plain lines on the pilot band carry
  a class (UNCLASSIFIED <= 5% of band plain total). Per-seed
  UNCLASSIFIED counts are published individually.
- (c) DISTRIBUTION PUBLISHED: per-seed counts for all five
  classes (four classes + UNCLASSIFIED), plus band totals —
  with the P-RACKS-NOELIG per-seed breakdown as the headline
  number of this run.
- (d) SENSE READ: at least one sample line per non-empty class
  with its full tag set, judged for meaning; the
  P-SILENCED coherence check (every silenced line's day
  carries that day's first complaint in the same seed's
  stream); and a judgment, in plain words, whether the
  'dinner already covered by the reserve' story holds on
  this band — i.e. eligible surplus present on
  P-FIRST-NOSMOKE / P-RES2PLUS lines.
- (e) VALIDITY: 16/16 per-seed files present and parsing;
  batches >= resolutions on every cell; on every cap1 cell,
  captured worked-line count EQUALS preserveVillagerResolutions
  (the racksvoice cross-check); every cap1 sayTotal under
  the 1000 cap (no truncation).
- A measured P-RACKS-NOELIG count of 0 on this band is a
  COMPLETE DIAG result (class still empty on this leaner
  band), NOT a failure. A populated count is the finding
  that the class exists off leadfeast. Either way, if
  (a)-(e) hold, the verdict is DIAG-GO.

Otherwise the verdict is DIAG-NO-GO, with the failed
condition(s) named. A DIAG-NO-GO here means ONLY "this
measurement does not classify plain frames on this band" —
it is NOT a judgment on the cook mechanic, on gate B, or
on any future voice design.

### Pilot gate (§9)

- The pilot IS the 8-seed band (16 configs at ~seconds each).
  The parser + taxonomy fixture test (scripts/test-noelig-
  lean-b.js T1) runs BEFORE the sweep: if the taxonomy
  cannot classify the fixture cases, the sweep does not run.

### Balanced panel (§15)

- This is a DIAG classification on a new band, not a
  before/after balance pair (no game lever changes), so no
  panel compare is expected. A panel attempt is recorded
  honestly: if scripts/balance-panel.js cannot ingest
  recorder corpora, that fallback note is written and no
  panel input is fabricated. The §15-equivalent instrument
  here is the cap0 vs cap1 paired table in RESULTS, plus
  the like-for-like per-seed comparison against the
  leadfeast band (same seeds, same horizon, different
  policy — a band comparison, not a lever comparison).

### Sense-testing, wall numbers, villager behaviour

- SENSE-TESTING LAW: one sample per non-empty class with full
  tags (see (d) above), plus a sample read of plain lines on
  the leaner band judged for sense/coherence in plain words.
- WALL NUMBERS on this corpus: national-or-better / table /
  wins, wave 1-5 reach, median survival (median daysAlive).
  NOTE: table = win flag, and SEATDRIVE=0 makes the table
  unreachable by construction — table 0 here is a
  construction fact, not a scale-wall finding. National
  reach on competent-nofeast (no courtship drive) is
  expected to be lower than on leadfeast; that is a band
  description, not a verdict input.
- VILLAGER-BEHAVIOUR SAMPLE: which cooks produce which plain
  classes on this band, and whether plain classes interleave
  with worked lines on the same seed.

### Metric review (filled after the verdict, §14 — revisions apply to the NEXT run, this verdict is NOT re-scored)

- See the "Metric review" subsection under RESULTS below.

### Scope

Zero src/js game changes in this worktree. New files only:
scripts/sweep-noelig-lean-b.js, scripts/test-noelig-lean-b.js,
scripts/analyze-noelig-lean-b.js,
evidence/2026-10-26/sim-noelig-lean-b-corpus/ (per-seed files),
evidence/2026-10-26/sim-noelig-lean-b.md (this file).
scripts/plainvoice-capture.js is REUSED unchanged from
sim-plainvoice-b (already on this branch). No push, no version
bump, no live verification — committed on branch
sim-noelig-lean-b, pending coordinator merge.

---

## RESULTS (appended after the pre-registration above; verdict judged ONLY on the corpus named here)

CORPUS: evidence/2026-10-26/sim-noelig-lean-b-corpus/, 16 files
(noelig-lean-b-cap0/cap1-pd0-dg1-competent-nofeast-s9750..9757.json),
policy competent-nofeast (competent, COMPETENT_FEAST=0,
FEASTSCALE_R13 unset/0), pd0, dg1, 100d death-aware horizon,
current head (no patch, no game change, gate B default). CAP=0 =
stock harness (control); CAP=1 = scripts/plainvoice-capture.js
installed after loadGame, SAYCAP 1000. CAP=1 files carry the FULL
plain detail array (every plain line with its tag set) plus the
full cook sample array.

PROOF TEST: node scripts/test-noelig-lean-b.js --corpus — 200 PASS
/ 0 FAIL (T1 taxonomy fixtures 15, T2 corpus assertions 185,
including the neutrality leg on 8/8 seeds). T1 ran BEFORE the
sweep (15/0) and gated it. Analyzer:
node scripts/analyze-noelig-lean-b.js (table + samples below).
Sweep logs: /tmp/noelig-lean-cap0/cap1.log (stdout carrier;
per-seed JSONs split from them by a short-lived validator that
checked filename-seed match, cap match, parse, and readback).

### Verdict: DIAG-GO

- (a) NEUTRALITY HOLDS: cap0 vs cap1 numeric fields identical on
  8/8 seeds (daysAlive, batches, kcal, resolutions, deaths,
  national, rank, table, win, waveReach, deathCauses — test T2
  "neutrality" 8/8). The recorder perturbs nothing; the
  neutrality leg ran BEFORE any classified number was judged.
- (b) COVERAGE HOLDS: 925 plain lines, 0 UNCLASSIFIED,
  coverage 100.00% (bar: >= 95%). Per-seed UNCLASSIFIED is 0
  on all 8 seeds individually, not just on the band. No
  extension triggered: the pre-registered rule extends to 16
  seeds only if UNCLASSIFIED > 5% on pilot, so the 8-seed
  band decides.
- (c) DISTRIBUTION PUBLISHED: per-seed table below, band totals
  P-SILENCED 612, P-RACKS-NOELIG 0, P-RES2PLUS 146,
  P-FIRST-NOSMOKE 167, UNCLASSIFIED 0.
- (d) SENSE READ HOLDS: one sample per non-empty class below,
  each coherent with its tags; the P-SILENCED coherence check
  passes on 8/8 seeds (silencedIncoherent = 0 everywhere).
  The dinner-reserve story HOLDS on this band, stronger than
  on leadfeast: eligible surplus is present on 165/167
  P-FIRST-NOSMOKE lines and 146/146 P-RES2PLUS lines — the
  usual plain-line story is still "dinner is already covered
  by the reserve, so nothing needed smoking", not absence.
  Only 2 plain lines in the whole band have no eligible
  surplus at all (both P-FIRST-NOSMOKE, early days).
- (e) VALIDITY HOLDS: 16/16 files present and parsing; batches
  >= resolutions on every cell; worked == resolutions on every
  CAP=1 cell (39/5/41/34/7/50/45/38); every CAP=1 sayTotal
  under the 1000 cap (max 424), so no cell was truncated.

### The headline: P-RACKS-NOELIG is still empty — on the leaner band too

P-RACKS-NOELIG per-seed counts (the number this run exists to
measure): 9750: 0, 9751: 0, 9752: 0, 9753: 0, 9754: 0, 9755: 0,
9756: 0, 9757: 0. Band: 0 of 925 plain lines.

Per the pre-registered verdict rule, a measured 0 is a COMPLETE
DIAG result, not a failure. The class "racks full, nothing
about to rot to complain about" does not occur at any cook
resolution on this feast-free band either — even though this
band is genuinely leaner in play (no courtship drive, no
feasts, no feast-draw scavengers: national 0/8 vs leadfeast's
7/8, wave-4 reach 0/8 vs 3/8, two villages lost outright
including a starvation-marked one). The mechanism is now
visible across two bands: whenever preserved stock reaches
the rack cap, about-to-rot surplus is present at the same
resolutions — the racks fill FROM the same surplus stream
that supplies the complaint, so the two conditions do not
come apart at cook time. A racks-bound day with nothing
about to rot would need a village whose preserved stock is
high while its fresh about-to-rot stock is zero at every
cook resolution of the day — neither the feast-rich band
nor the feast-free band produces that state. This is a
structural observation about the cook/preserve loop, not
a policy artifact: the next place to look, if anyone still
wants the class, is not another policy but a different
substrate state (e.g. a village that stopped foraging while
its racks stayed full) — recorded as a finding, not chased
here (DIAG only, stay on axis).

PER-SEED TABLE (CAP=1; CAP=0 numerics identical):
seed days batches res worked racksFull plain say deaths rank wave | SILENCED NOELIG RES2PLUS FIRST UNCLASS
- 9750 100 88 39 39 37 151 227 5 village 3 | 60 0 35 56 0
- 9751 48 7 5 5 0 12 17 12 village 2 | 0 0 0 12 0
- 9752 100 132 41 41 66 145 252 2 village 3 | 138 0 0 7 0
- 9753 100 107 34 34 56 194 284 4 village 3 | 108 0 42 44 0
- 9754 97 13 7 7 0 3 10 14 village 3 | 0 0 0 3 0
- 9755 100 190 50 50 36 22 108 2 village 3 | 7 0 10 5 0
- 9756 100 132 45 45 58 79 182 2 village 2 | 57 0 5 17 0
- 9757 100 118 38 38 67 319 424 2 village 2 | 242 0 54 23 0
Band: plain 925, say 1736, worked 259, racksFull 320, deaths 43.
Racks-full voice totals (spoken complaints): 320 across the
band, vs 612 silenced lines — nearly two swallowed complaints
for every spoken one.

### What the split means, in plain words

- The plain frame is, even more than on leadfeast, a SILENCED
  COMPLAINT: 612/925 (66.2%) vs leadfeast's 483/900 (53.7%).
  On 9757, Miguel speaks all 67 complaints while 242 silenced
  lines pile up behind them (Miguel 176, Grace 66) — the
  gate-B voice-diversity cost is worse here than on leadfeast
  (231 silenced vs 68 spoken there). On 9752, Paramjit (89)
  and Mason (49) swallow 138 complaints behind 66 spoken
  ones, with only 7 first-resolution lines in the whole seed:
  that village is racks-bound nearly every day and almost
  never cooks a "quiet" first resolution at all.
- The dinner-reserve story holds on the lean band: 165/167
  first-resolution and 146/146 later-resolution plain lines
  carry eligible about-to-rot surplus at emit time. The two
  exceptions are early-game first resolutions with nothing
  yet to preserve (9752 d21 Mason, preserved 1,196 vs cap
  16,250; 9757 d13 Hryts, preserved 0 vs cap 17,875) — a
  village that has not started preserving yet, not a
  racks-bound village with nothing to complain about.
- The lean band is lean in outcomes, not in cook chatter:
  villages that never feast and never court still cook,
  smoke, and fill racks to the same complaint volume
  (320 spoken + 612 silenced here vs 230 + 483 on leadfeast).
  Removing feasts did not quiet the kitchens — it removed
  the scale progress (national, waves) while the racks
  kept filling. The racks-full problem is a preserving-loop
  property, not a feast-policy property.

### SENSE-TESTING samples (verbatim frame + full tag set)

- P-SILENCED [9750 d47 Malik, resIndex 1]: "🍲 Malik cooked
  for the haven — meals stretched." Tags: racksFull=true,
  eligible present (1 stack, 2,400 kcal), preservedKcal 15,022
  vs rackCap 14,625, voiceSpokenToday=true. Coherence: the
  same day's stream carries the day's first complaint, then
  this line — a swallowed complaint, not a quiet cooking.
  Note this is a FIRST resolution that classifies as silenced:
  cause-before-index ordering matters (without it, this
  would misread as P-FIRST-NOSMOKE).
- P-SILENCED, overhang case [9752 d55 Mason, resIndex 1]:
  preservedKcal 51,275 vs rackCap 16,250 (3.2x over), eligible
  3 stacks / 6,264 kcal, voiceSpokenToday=true. The racks are
  not marginally full — they are triple-full — and the
  complaint still speaks only once a day. The plain line
  hides a very large overhang.
- P-RES2PLUS [9750 d24 Sierra, resIndex 2]: "🍲 Sierra cooked
  for the haven — meals stretched." Tags: racksFull=false,
  eligible present (1 stack, 1,000 kcal), preservedKcal 0 vs
  rackCap 16,250, voiceSpokenToday=false. Racks empty, second
  resolution, dinner reserve covers the surplus. Coherent.
- P-FIRST-NOSMOKE [9750 d8 Zoe, resIndex 1]: "🍲 Zoe cooked
  for the haven — meals stretched." Tags: racksFull=false,
  eligible present (2 stacks, 1,800 kcal), preservedKcal 0 vs
  rackCap 19,500. Day 8, no preserved stock at all, first job
  of the day — the same early-game shape as on leadfeast.
  Coherent, and it shows the class is not a failure: early
  plain lines are villages that have not started preserving.
- P-RACKS-NOELIG: no sample exists (class empty, 0/925).
- UNCLASSIFIED: no sample exists (class empty, 0/925).

### WALL NUMBERS (corpus, CAP=1)

national-or-better 0/8, table 0/8, wins 0/8, wave reach
distribution {2: 3, 3: 5} (per-cell max wave), wave-4 reach
0/8, wave-5 reach 0/8, median daysAlive 100, max 100. Table 0
is a construction fact (SEATDRIVE=0), not a scale-wall
finding. National 0/8 and wave-4 0/8 are band descriptions
of the feast-free competent substrate (no courtship drive,
no feast buffs), not verdict inputs — but they do confirm
the band IS leaner in progress terms than leadfeast
(national 7/8, wave-4 3/8 on the same seeds). Total deaths
43 (CAP=1); the arena leads (15), then starvation (7 —
9754 lost at day 97 with 3 starvation deaths; 9751 lost at
day 48 with 12 deaths). Two villages lost outright is the
lean band's signature: on leadfeast only 9751 was lost.

### VILLAGER-BEHAVIOUR SAMPLE

Cooks rotate but the plain split follows duty order, as on
leadfeast: the first-duty cook owns the spoken complaints
AND the later-resolution plain lines, while second cooks own
first-resolution plain lines (9750: Malik 36 first + 35
silenced; Sierra 35 later-resolution; 9753: Courtney 42
later-resolution + 91 silenced). Nothing reads robotic
beyond the frame itself — the repetition that matters is
structural, as before: one cook's voice stands in for the
whole village's racks-full state, day after day, while
other cooks' identical complaints are swallowed into an
indistinguishable plain frame. On this band the effect is
stronger: 612 swallowed vs 320 spoken.

### BALANCED PANEL (§15)

Attempted honestly, not fabricated: scripts/balance-panel.js
is a before/after panel RUNNER (it spawns its own child sims
under its own observer; invoking it without --out errors
"--out <panel-directory> required") — it cannot ingest
recorder corpora, and running a panel would be a different
experiment under a different observer, not a comparison of
this corpus. So no panel compare is attached and none is
faked. The §15-equivalent instrument for this DIAG run is
the CAP=0 vs CAP=1 paired table above (8/8 identical) plus
the like-for-like per-seed band comparison against the
leadfeast band (same seeds, same horizon, different policy),
judged by the GO rule in the header.

### Metric review (§14 — for the NEXT run; this verdict is NOT re-scored)

- The 95% bar was cleared at 100% with zero unclassified on
  every seed on a SECOND policy band — the emit-time
  recompute is not a marginal instrument and is not
  leadfeast-specific. A future run can tighten the bar
  (per-seed unclassified == 0) without risking a false
  NO-GO on either measured band.
- The pre-registered "leaner" definition (feast engine off,
  no courtship outflows) proved to be a real progress
  difference (national 7/8 -> 0/8, wave-4 3/8 -> 0/8) while
  NOT producing the hypothesised class. That falsifies the
  "leaner policy reveals NOELIG" hypothesis in its policy
  form: the class's absence is not a policy-band artifact.
  A future arm hunting NOELIG should pre-register a
  substrate-state hypothesis (e.g. foraging stopped while
  racks stay full), not another policy swap — and should
  say so explicitly, since two policy bands have now
  returned 0 (leadfeast 0/900, competent-nofeast 0/925).
- The dinner-reserve story is now confirmed on two bands
  (eligible present on 413/417 non-full plain lines on
  leadfeast, 311/313 here). Any future sense arm claiming
  plain lines mean "nothing to do" must pre-register the
  eligible-present split or it will misread the village.
- The silenced-to-spoken ratio (612:320 here, 483:230 on
  leadfeast) is now a two-band stable quantity worth
  tracking as a voice-health metric in future voice arms —
  it was not a pre-registered metric here and is not used
  to re-score this verdict.

### CONVERGENCE STATE for this axis (P-RACKS-NOELIG on leaner policies)

DIAG-GO, measurement complete on two bands. P-RACKS-NOELIG
is empty on leadfeast (0/900) AND on competent-nofeast
(0/925): the 1035Z blank 4 is filled with a two-band zero.
The open blank it exposes is a SUBSTRATE question, not a
policy question — what village state, if any, produces a
racks-bound day with nothing about to rot — and a DISPLAY
question carried from plainvoice (the player cannot
distinguish a swallowed complaint from a quiet cooking;
here 612 swallowed vs 320 spoken). Neither is solved here
(DIAG only, zero game changes).

### VILLAGE ASSESSMENT (plain words)

These villages are poorer and quieter in progress but just
as busy in the kitchen. Without feasts and without the
courtship drive, none of the eight villages reached national
standing and none reached wave 4 — two of them died outright,
one slowly starving at day 97 — yet their cooks still filled
the smoke racks to overflowing and complained about it, once
a day each, while hundreds more identical complaints were
swallowed into the quiet "cooked for the haven" line. The
loudest village (9757) is racks-bound nearly every day with
one cook doing all the talking and another cook's 66
complaints silently folded into plain lines. The lesson is
not that lean villages are quiet — it is that the racks
fill up whether the village is feasting or not, and the
game's one-complaint-a-day rule hides most of the problem
either way. And the class this run went looking for — a
full rack with nothing fresh about to rot — simply never
showed up: whenever the racks are full, there is always
fresh food about to rot sitting right there. That is now
measured twice, on two very different ways of playing.

### Scope compliance

Zero src/js changes. Changed/added: scripts/sweep-noelig-lean-b.js,
scripts/test-noelig-lean-b.js, scripts/analyze-noelig-lean-b.js,
evidence/2026-10-26/sim-noelig-lean-b-corpus/ (16 files),
evidence/2026-10-26/sim-noelig-lean-b.md (this file).
scripts/plainvoice-capture.js reused UNCHANGED from
sim-plainvoice-b. No push, no version bump, no live
verification — committed on branch sim-noelig-lean-b,
pending coordinator merge.

### Findings for the coordinator backlog (do NOT edit goal hidden_files here)

- [open] 2026-10-26 — plain-voice NOELIG two-band zero —
  P-RACKS-NOELIG is 0/925 on competent-nofeast after 0/900
  on leadfeast: the class's absence is not a policy-band
  artifact. A future hunt should pre-register a
  substrate-state hypothesis (foraging stopped, racks full),
  not another policy swap (evidence sim-noelig-lean-b).
- [open] 2026-10-26 — plain-voice silenced ratio — silenced:
  spoken is 612:320 on competent-nofeast (483:230 on
  leadfeast); a stable two-band voice-health quantity for
  future voice arms to track (evidence sim-noelig-lean-b).
- [open] 2026-10-26 — lean-band progress gap — competent-
  nofeast on seeds 9750-9757 reaches national 0/8 and wave-4
  0/8 (leadfeast 7/8 and 3/8 on the same seeds), with two
  villages lost outright; the racks-full complaint volume
  does not fall with the progress (320 spoken + 612
  silenced vs 230 + 483) (evidence sim-noelig-lean-b).

