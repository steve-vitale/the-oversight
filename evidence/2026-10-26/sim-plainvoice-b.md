# sim-plainvoice-b — plain cook frames classified AT THE SOURCE (DIAG only, no game change)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T0935Z follow-up,
axis food-economy, arm sim-plainvoice-b.
Worktree: `~/workspace/worktrees/sim-plainvoice-b`, branch sim-plainvoice-b.

Status: PRE-REGISTERED — everything under "PRE-REGISTRATION" below was
written BEFORE any sim in this run was executed. The RESULTS section
at the end is appended after the sweep completes and is judged ONLY
against the header.

## Canon read first

- `docs/CANON.md` (manifest), then `docs/PRESERVATION.md` (the food
  ladder: cleaned 2d < cooked 5d < smoked 30d < rendered 90d <
  pemmican 120d; smoking 16 ticks; blind penalties teach once;
  "rot can't be smoked back into food") and `docs/CONVERSATIONS.md`
  (dialogue sense bar: real back-and-forth, no repeats,
  context-aware openings — the bar plain lines are judged against).
- No canon doc covers cook-voice classification — stated, not
  invented. The taxonomy below is a MEASUREMENT INSTRUMENT, not a
  canon claim. No new voice rule is designed or implemented here.

## Background (quoted, NOT re-judged here)

- evidence/2026-10-26/sim-racksvoice-b.md (DIAG-GO census): plain
  lines cannot be split from text alone — every plain line is the
  byte-identical frame `🍲 {first} cooked for the haven — meals
  stretched.` with an empty `preservedNote`. On seed 9757, 221 plain
  lines of 370 sit in that one frame, covering second/third
  resolutions, racks-full days with no about-to-rot surplus, and
  non-full days with nothing to smoke.
- evidence/2026-10-26/sim-racksvoice-gate-b.md (gate confirm):
  confirm plain total is 908 vs racks-full 404 (fresh band
  9760-9775, baseline). Gate B (village-level first complaint)
  LANDED and is the default on current master — so a fourth plain
  source now exists that the census predates: racks-full complaints
  silenced by gate B after the day's first complaint spoke.
- This run is the 0935Z run's named next blank (2): split plain
  frames AT THE SOURCE, by tagging each plain frame at emit/capture
  time with its context — never by re-reading text.

## Gate read from code BEFORE any sim (src/js/game.js cook branch)

- The cook resolves ~3x/day. Every resolution calls `this.say` once
  with the frame plus a `preservedNote` that is empty unless (a) n > 0
  batches were smoked (worked note) or (b) the racks-full voice fires.
- Racks-full condition (computed every resolution):
  `preservedKcal >= rackCap`, preservedKcal sums preserved/rendered
  pantry stock, `rackCap = 125 * roster * max(1, ownShelf - 2)`,
  ownShelf = 30 + 5*skill if the cook is a preserver, else 15.
  FOODLEVER_R5 is OFF here (not set).
- Racks-full voice gate on current master (gate B, default ON):
  `this._racksFullVoiceDay !== day` — only the FIRST racks-full
  complaint each day speaks; later cooks that day get the plain
  frame. `RACKSVOICE_GATE=0` restores the old per-cook-per-day rule;
  this run does NOT set it (default gate B is the substrate).
- Eligible surplus (recomputed by the recorder, same rules as the
  branch): pantry item with kcalEach > 0, units > 0, not bonded, not
  preserved/rendered, not pemmican, not a keepsake, spoilDay defined
  and < 9999, not spoiled at bonus 0 (spoilDay <= day), and
  spoilDay - day <= 2 (about-to-rot window).
- Plain-frame sources on current master, therefore FOUR, not three:
  (1) 2nd/3rd resolution of a cook-day; (2) racks-full day with no
  eligible surplus; (3) non-full day with nothing to smoke (all
  eligible surplus within the dinner reserve, or none at all);
  (4) gate-B-silenced racks-full complaint (racks full, eligible
  surplus present, but the day's first complaint already spoke).

## PRE-REGISTRATION (bound per docs/MEASUREMENT.md §§9-12, 14-15)

### Instrument (new, DIAG only, zero src/js, zero default flips)

- scripts/plainvoice-capture.js (new): wraps `Game.say` AFTER
  loadGame (same post-load pattern as scripts/say-capture.js, which
  is unchanged). For every cook line it records frame class
  (worked / racksFull / plain) and, for plain lines ONLY, the
  emit-time context tags below. It writes ONLY to the caller's
  array; it never writes Game.state, Game.log, RNG, or any game
  field; it delegates to the original say with the same arguments,
  `this`, and return value; every tag computation is try/catch
  isolated. Person lookup reads `Game.data.villagers` directly —
  it deliberately does NOT call `Game.getPerson` (which can
  hydrate a seed, a write) — so the recorder is read-only by
  construction, not just by intention.
- Emit-time tags per plain line (read from the engine at the moment
  `say` is called, i.e. AFTER the cook branch ran, BEFORE any later
  resolution mutates state):
  - day: `Game.state.scholar.day` at emit time.
  - cook: first name from the line (identity only — never a class
    input; classes come from the tags below).
  - resolutionIndex: the recorder's own emit-order ordinal for
    that cook on that day (1st, 2nd, 3rd+ cook line that day, all
    frames counted in arrival order). DESIGN QUESTION, recorded
    not hidden: the engine keeps NO resolution counter — this
    ordinal is a recorder sequence count, not an engine variable.
    A future engine-side tag would be needed to make it a code
    fact; this run does not add one.
  - racksFull: recomputed preservedKcal vs rackCap (cook skill
    from candidate villagers sharing the cook's first name; if
    candidates disagree on the skill bucket, rackCap is ambiguous
    and the line is UNCLASSIFIED rather than guessed).
  - eligiblePresent / eligibleCount / eligibleKcal: recomputed
    eligible list by the branch rules above, from the pantry at
    emit time. Valid for plain lines because a plain resolution
    mutates nothing (n = 0; no conversion, no partial split).
  - voiceSpokenToday: `Game._racksFullVoiceDay === day` at emit
    time (gate B: a complaint already spoke today).
  - preservedKcal, rackCap: the recomputed numbers, for the
    sense read and for auditing the racksFull boolean.
- scripts/sweep-plainvoice-b.js (new): same loadGame-per-seed
  pattern as sweep-racksvoice-b.js, plus the plainvoice capture;
  SWEEP_CENSUS=1 stdout mode (flap-proof: the long-running sweep
  never writes files; a short-lived splitter persists per-seed
  JSONs from stdout). Corpus dir (new, never mixed into older
  corpora): evidence/2026-10-26/sim-plainvoice-b-corpus/ — inside
  this worktree, NEVER /tmp as the sole copy.
- scripts/test-plainvoice-b.js (new): taxonomy fixture checks +
  corpus assertions. scripts/analyze-plainvoice-b.js (new):
  per-seed class distribution table + sense samples.

### Substrate, seeds, horizon (identical on all configs)

- Policy leadfeast, DEPOSITGATE=1, FEASTSCALE_R13=1,
  SEATDRIVE=0, PLENTYDEPRI=0 (pd0 only), 100d death-aware horizon
  (dead villages stop, +10d tail max). All asserted FATAL by the
  driver. SAYCAP=1000 (>= 500 per the racksvoice metric review;
  largest prior cell was 425 lines under gate B).
- Pilot band: seeds 9750-9757 (8 seeds, the racksvoice band).
  Configs: 8 seeds x {cap0, cap1} = 16 configs. cap0 = neutrality
  control (stock harness, no capture); cap1 = classified corpus.
  File names: plainvoice-b-<cap0|cap1>-pd0-dg1-leadfeast-s<seed>.json.
- Extension rule, pre-registered: extend to 16 seeds ONLY if
  UNCLASSIFIED > 5% on the pilot; otherwise the 8-seed band
  decides. No confirm spend on a classified band.
- Re-sweep on current master: NO old corpus is cited as this
  run's numbers. Prior totals (census 708 plain, confirm 908
  plain) are background only; every number in RESULTS comes
  from this run's fresh sweep.

### PRE-REGISTERED CLASS TAXONOMY (exclusive, first match wins, in this order)

Classes are assigned at capture time from the emit-time tags only.
No class is ever assigned from line text (all plain lines share
one byte-identical frame, so text cannot distinguish them).

- P-SILENCED — gate-B-silenced complaint: racksFull AND
  eligiblePresent AND voiceSpokenToday. The day's first complaint
  already spoke; this resolution's complaint was silenced into
  the plain frame.
- P-RACKS-NOELIG — racks full, nothing to complain about:
  racksFull AND NOT eligiblePresent. The racks are overfull but
  no about-to-rot surplus exists, so the voice condition
  (racksFull AND eligible) never held.
- P-RES2PLUS — later resolution, racks not full: NOT racksFull
  AND resolutionIndex >= 2. A 2nd/3rd resolution on a day when
  the racks are not full and nothing was smoked.
- P-FIRST-NOSMOKE — first resolution, racks not full: NOT
  racksFull AND resolutionIndex == 1. The cook's first job of
  the day smoked nothing (eligible surplus, if any, sits within
  the dinner reserve, or there is none).
- UNCLASSIFIED — recompute failed (no villager candidate for
  the cook's first name; pantry/day unavailable; any tag threw)
  OR rackCap ambiguous across same-first-name candidates OR the
  impossible combination racksFull AND eligiblePresent AND NOT
  voiceSpokenToday (under gate B that resolution would have
  spoken, so observing it as plain would mean the gate model
  is wrong — it is counted as unclassified, never forced into
  a class).

EligiblePresent, preservedKcal, rackCap, and cook identity are
retained as attributes on every classified line for sub-analysis
(e.g. P-FIRST-NOSMOKE split by eligible present/absent), but they
do not create extra classes mid-run.

### VERDICT RULE (binding — judge ONLY against this header)

DIAG-GO holds if and only if ALL of the following hold:

- (a) NEUTRALITY FIRST: cap0 vs cap1 numeric fields identical
  on 8/8 seeds (daysAlive, batches, resolutions, deaths,
  national, waveReach, rank). A recorder that perturbs
  trajectories invalidates everything — no classified number
  is judged if this fails.
- (b) COVERAGE: >= 95% of plain lines on the pilot band carry
  a class (UNCLASSIFIED <= 5% of band plain total). Per-seed
  UNCLASSIFIED counts are published individually, not just the
  band rate — a band pass hiding one broken seed is not a pass
  in spirit and is named as such.
- (c) DISTRIBUTION PUBLISHED: per-seed counts for all five
  classes (four classes + UNCLASSIFIED), plus band totals.
- (d) SENSE READ: at least one sample line per class with its
  full tag set (day/seed/cook/resolutionIndex/racksFull/
  eligible/preservedKcal/rackCap/voiceSpokenToday), judged for
  meaning — does the plain line make sense in that context
  (e.g. a P-SILENCED line on a day whose first complaint is
  also in the corpus)? A class whose samples do not cohere
  with their tags fails (d) even if (b) holds.
- (e) VALIDITY: 16/16 per-seed files present and parsing;
  batches >= resolutions on every cell; on every cap1 cell,
  captured worked-line count EQUALS preserveVillagerResolutions
  (the racksvoice cross-check, mandatory for every corpus
  judged here); say totals unchanged cap0-vs-cap1 in the
  sense that cap1 sayTotal is reported (cap0 carries no
  samples by construction — the neutrality check is on the
  numeric fields, as in the census).

Otherwise the verdict is DIAG-NO-GO, with the failed
condition(s) named. A DIAG-NO-GO here means ONLY "this
recorder does not classify plain frames at the source" — it
is NOT a judgment on the cook mechanic, on gate B, or on any
future voice design.

### Pilot gate (§9)

- The pilot IS the 8-seed band (16 configs at ~seconds each).
  The parser + taxonomy fixture test (scripts/test-plainvoice-b.js
  T1) runs BEFORE the sweep: if the taxonomy cannot classify
  the fixture cases, the sweep does not run.

### Balanced panel (§15)

- This is a DIAG classification, not a before/after balance
  pair (no game lever changes), so no panel compare is
  expected. A panel attempt is recorded honestly: if
  scripts/balance-panel.js cannot ingest recorder corpora,
  that fallback note is written and no panel input is
  fabricated. The §15-equivalent instrument here is the
  cap0 vs cap1 paired table in RESULTS.

### Sense-testing, wall numbers, villager behaviour

- SENSE-TESTING LAW: one sample per class with full tags (see
  (d) above), plus a coherence check: every P-SILENCED line's
  day must also carry a racks-full complaint line in the same
  seed's corpus (the first complaint that silenced it) — the
  corpus check, not an assertion, since the complaint may
  predate... no: the complaint speaks earlier the SAME day, so
  it must be in the same seed's captured stream. A P-SILENCED
  line whose day has no complaint line is a coherence failure
  and is counted under (d).
- WALL NUMBERS on this corpus: national / table / wins, wave
  1-5 reach, median survival (median daysAlive). NOTE:
  table = win flag, and SEATDRIVE=0 makes the table
  unreachable by construction — table 0 here is a
  construction fact, not a scale-wall finding.
- VILLAGER-BEHAVIOUR SAMPLE: which cooks produce which plain
  classes (does one cook dominate P-SILENCED? do P-FIRST-NOSMOKE
  lines cluster on particular cooks/days?), and whether plain
  classes interleave with worked lines on the same seed.

### Metric review (filled after the verdict, §14 — revisions apply to the NEXT run, this verdict is NOT re-scored)

- See the "Metric review" subsection under RESULTS below.

### Scope

Zero src/js game changes in this worktree. New files only:
scripts/plainvoice-capture.js, scripts/sweep-plainvoice-b.js,
scripts/test-plainvoice-b.js, scripts/analyze-plainvoice-b.js,
evidence/2026-10-26/sim-plainvoice-b-corpus/ (per-seed files),
evidence/2026-10-26/sim-plainvoice-b.md (this file). No push,
no version bump, no live verification — committed on branch
sim-plainvoice-b, pending coordinator merge.

---

## RESULTS (appended after the pre-registration above; verdict judged ONLY on the corpus named here)

CORPUS: evidence/2026-10-26/sim-plainvoice-b-corpus/, 16 files
(plainvoice-b-cap0/cap1-pd0-dg1-leadfeast-s9750..9757.json),
policy leadfeast, pd0, dg1, 100d death-aware horizon, current
head (no patch, no game change, gate B default). CAP=0 = stock
harness (control); CAP=1 = scripts/plainvoice-capture.js installed
after loadGame, SAYCAP 1000. CAP=1 files carry the FULL plain
detail array (every plain line with its tag set) plus the full
cook sample array — unlike the racksvoice census mode, nothing
here is summarised away.

PROOF TEST: node scripts/test-plainvoice-b.js --corpus — 102 PASS
/ 0 FAIL (T1 taxonomy fixtures 20, T2 corpus assertions 82).
Analyzer: node scripts/analyze-plainvoice-b.js (table + samples
below). Sweep logs: evidence/2026-10-26/sim-plainvoice-b-sweep-
cap0/cap1.log (stdout carrier; per-seed JSONs split from them by
a short-lived validator that checked filename-seed match, cap
match, parse, and non-zero size).

### Verdict: DIAG-GO

- (a) NEUTRALITY HOLDS: cap0 vs cap1 numeric fields identical on
  8/8 seeds (daysAlive, batches, kcal, resolutions, deaths,
  national, rank, waveReach — test T2 "neutrality" 8/8). The
  recorder perturbs nothing; every classified number below is
  judged on a clean instrument.
- (b) COVERAGE HOLDS — and then some: 900 plain lines, 0
  UNCLASSIFIED, coverage 100.00% (bar: >= 95%). Per-seed
  UNCLASSIFIED is 0 on all 8 seeds individually, not just on
  the band. No extension triggered: the pre-registered rule
  extends to 16 seeds only if UNCLASSIFIED > 5% on pilot, so
  the 8-seed band decides.
- (c) DISTRIBUTION PUBLISHED: per-seed table below, band totals
  P-SILENCED 483, P-RACKS-NOELIG 0, P-RES2PLUS 215,
  P-FIRST-NOSMOKE 202, UNCLASSIFIED 0.
- (d) SENSE READ HOLDS: one sample per non-empty class below,
  each coherent with its tags; the P-SILENCED coherence check
  passes on 8/8 seeds (silencedIncoherent = 0 everywhere —
  every silenced line's day carries that day's first complaint
  in the same seed's stream). P-RACKS-NOELIG has no sample
  because the class is empty (see below) — that absence is
  itself the finding, not a missing sample.
- (e) VALIDITY HOLDS: 16/16 files present and parsing; batches
  >= resolutions on every cell; worked == resolutions on every
  CAP=1 cell (52/0/50/42/38/60/53/52); every CAP=1 sayTotal
  under the 1000 cap (max 425), so no cell was truncated.

### The split (the answer to the 0935Z next blank)

On current master, plain frames split into THREE live classes,
not four — and the split is dominated by the gate-B silencing
that the census predates:

- P-SILENCED 483/900 (53.7%): the largest plain class. The
  racks are full, about-to-rot surplus is present, but the
  day's first complaint already spoke, so this resolution's
  complaint is silenced into the plain frame. This is gate B
  working as landed — but at a volume nobody had measured:
  on 9757, 231 silenced lines vs only 68 spoken complaints.
- P-RES2PLUS 215/900 (23.9%): 2nd/3rd(+ ) resolution, racks not
  full, nothing smoked.
- P-FIRST-NOSMOKE 202/900 (22.4%): the cook's first resolution
  of the day, racks not full, nothing smoked.
- P-RACKS-NOELIG 0/900 (0%): racks full with no about-to-rot
  surplus NEVER occurs at any cook resolution in this band.
  This is a genuine empty class, not a blind spot: every
  resolution yields exactly one of worked / racksFull / plain,
  worked implies not-racks-full, and a racks-full line implies
  eligible surplus present — so a racksFull+no-eligible
  resolution would necessarily surface as this class, and
  none does. On this policy (leadfeast, food-rich villages),
  a racks-bound day always has about-to-rot surplus to
  complain about. The census's second hypothesised source
  ("racks-full days with no about-to-rot surplus") does not
  occur here; it may occur on a leaner policy, which is a
  question for a future arm, not a claim made here.
- UNCLASSIFIED 0/900: the emit-time recompute never failed,
  never hit an ambiguous same-first-name skill split, and
  never saw the impossible combination (racksFull + eligible
  + no voice spoken — which under gate B would have spoken).
  The gate model and the recompute agree everywhere.

PER-SEED TABLE (CAP=1; CAP=0 numerics identical):
seed days batches res worked racksFull plain say deaths rank wave | SILENCED NOELIG RES2PLUS FIRST UNCLASS
- 9750 100 144 52 52 19 100 171 6 national 4 | 26 0 33 41 0
- 9751 31 0 0 0 0 7 7 9 village 2 | 0 0 0 7 0
- 9752 100 147 50 50 37 31 118 3 national 2 | 0 0 20 11 0
- 9753 100 102 42 42 49 259 350 2 national 4 | 149 0 66 44 0
- 9754 90 150 38 38 25 80 143 14 national 3 | 53 0 19 8 0
- 9755 100 161 60 60 10 62 132 3 national 3 | 8 0 16 38 0
- 9756 100 149 53 53 22 56 131 11 global 4 | 16 0 10 30 0
- 9757 100 161 52 52 68 305 425 1 national 2 | 231 0 51 23 0
Band: plain 900, say 1477, worked 347, racksFull 230, deaths 49.

### What the classes mean, in plain words

- The plain frame is, more than half the time, a SILENCED
  COMPLAINT. When the player reads "🍲 Miguel cooked for the
  haven — meals stretched." on a racks-bound day, the game is
  not saying "nothing happened" — it is swallowing a second
  (or fifth) "the racks are already full" that gate B decided
  not to repeat. The line is honest (the cook did cook) but it
  hides the reason: the racks ARE full and there IS fresh food
  about to rot. On 9757 the village is racks-bound for 68 days
  (d33–d100, one complaint each day) while 231
  silenced lines pile up behind them — Miguel 169 of them (his
  own later resolutions that day; resolution ordinals run to
  4 on his busiest days, not just 3), Grace 61, Kealan 1.
  Gate B's voice-diversity cost, already noted for complaints,
  now shows in the plain split too: Grace never gets a spoken
  complaint on 9757, only silenced plain lines.
- The "nothing to smoke" classes are NOT mostly "nothing
  there": P-FIRST-NOSMOKE lines carry eligible surplus present
  on 199 of 202 lines, and P-RES2PLUS on 214 of 215. The
  surplus is there and about to rot — it just sits within the
  dinner reserve (250 kcal per person), so the cook leaves it
  fresh for tonight and tomorrow instead of smoking it. The
  background framing ("non-full days with nothing to smoke")
  is corrected by this run: the usual plain-line story on a
  non-full day is "dinner is already covered, so nothing
  needed smoking", not "there was nothing to smoke". Only 4
  lines in the whole band have no eligible surplus at all.
- Who produces which class: second resolutions cluster on the
  main cook (9750 P-RES2PLUS: all 33 Sierra; 9757: all 51
  Miguel), while first-resolutions cluster on the second cook
  (9750 P-FIRST-NOSMOKE: Malik 34 of 41). The plain frame is
  not randomly spread — it tracks who is on duty and when.
- 9751 is the exception that bounds the story: a village lost
  at day 31 with zero smoking resolutions, 7 plain lines, all
  P-FIRST-NOSMOKE. A dying village's cooks never reach the
  racks at all; its plain lines are first-resolutions with
  nothing (yet) to preserve.

### SENSE-TESTING samples (verbatim frame + full tag set)

- P-SILENCED [9750 d58 Sierra, resIndex 2]: "🍲 Sierra cooked
  for the haven — meals stretched." Tags: racksFull=true,
  eligible present (5 stacks, 4,086 kcal), preservedKcal 15,578
  vs rackCap 14,625, voiceSpokenToday=true. Coherence: the
  same day's stream carries Sierra's spoken complaint first,
  then Sierra res-2 and Malik res-1 silenced — the complaint
  spoke once, the rest of the day's cooks went plain. The
  line makes sense as a silenced complaint, and the tags prove
  the silencing rather than asserting it.
- P-SILENCED, dominance case [9757 d34]: complaint Miguel,
  then silenced Miguel res-2, res-3, res-4 and Grace res-1 —
  five cook lines in one day, one voice. The plain lines here
  are four swallowed complaints, not four quiet cookings.
- P-RES2PLUS [9750 d29 Sierra, resIndex 2]: "🍲 Sierra cooked
  for the haven — meals stretched." Tags: racksFull=false,
  eligible present (2 stacks, 2,600 kcal), preservedKcal 4,769
  vs rackCap 16,250, voiceSpokenToday=false. The racks are
  nowhere near full; the surplus sits in the dinner reserve;
  a second resolution has nothing new to do. Coherent.
- P-FIRST-NOSMOKE [9750 d8 Zoe, resIndex 1]: "🍲 Zoe cooked
  for the haven — meals stretched." Tags: racksFull=false,
  eligible present (2 stacks, 1,800 kcal), preservedKcal 0 vs
  rackCap 19,500. Day 8, no preserved stock at all, first job
  of the day, dinner reserve covers the surplus. Coherent —
  and it shows the class is not a failure: early-game plain
  lines are villages that have not started preserving yet.
- P-RACKS-NOELIG: no sample exists (class empty, 0/900).
- UNCLASSIFIED: no sample exists (class empty, 0/900).

### WALL NUMBERS (corpus, CAP=1)

national-or-better 7/8 (9756 global; 9751 village, lost at
day 31), table 0/8, wins 0/8, wave reach distribution
{2: 3, 3: 2, 4: 3} (per-cell max wave), wave 4 reach 3/8,
wave 5 reach 0/8, median daysAlive 100, max 100. Table 0 is a
construction fact (SEATDRIVE=0), not a scale-wall finding.
Total deaths 49 (CAP=1); the arena dominates as in prior
runs (9754: 14 deaths; 9756: 11, 10 of them arena).

### VILLAGER-BEHAVIOUR SAMPLE

Cooks rotate but the plain split follows duty order, not a
rotation lottery: the first-duty cook owns the spoken
complaints AND the later-resolution plain lines, while the
second cook owns first-resolution plain lines. Nothing reads
robotic beyond the frame itself — the repetition that matters
is structural: one cook's voice stands in for the whole
village's racks-full state, day after day, while other cooks'
identical complaints are swallowed into an indistinguishable
plain frame. A player cannot tell, from the log alone, whether
a plain line on a racks-bound day is a swallowed complaint or
a quiet cooking — that distinction now exists only in this
corpus's tags, not in the game.

### Substrate stability note (named, not forced)

This run's 9757 and 9753 reproduce the gate-b adoption run's
post-rebase fresh runs EXACTLY on every reported field (9757:
racksFull 68 / say 425 / deaths 1; 9753: racksFull 49 / say 350
/ deaths 2). Other seeds drifted from the census/gate corpora
(e.g. 9750 racksFull 33 -> 19, batches 144 vs census 144 but
say 171 unchanged) through sibling policy changes since those
corpora landed — trajectory divergence on a shared policy
module, not instrument error, and the internal cap0-vs-cap1
comparison agrees on all 8 seeds regardless. The verdict
rests on this run's own paired corpus, not on matching old
numbers.

### BALANCED PANEL (§15)

Attempted honestly, not fabricated: scripts/balance-panel.js
is a before/after panel RUNNER (it spawns its own child sims
under its own observer; invoking it without --out errors
"--out <panel-directory> required") — it cannot ingest
recorder corpora, and running a panel would be a different
experiment under a different observer, not a comparison of
this corpus. So no panel compare is attached and none is
faked. The §15-equivalent instrument for this DIAG run is
the CAP=0 vs CAP=1 paired table above (8/8 identical),
judged by the GO rule in the header — the same stance the
census and gate runs took.

### Metric review (§14 — for the NEXT run; this verdict is NOT re-scored)

- The 95% bar was cleared at 100% with zero unclassified on
  every seed — the emit-time recompute is not a marginal
  instrument. A future run can tighten the bar (e.g. per-seed
  unclassified == 0) without risking a false NO-GO on this
  substrate, but should not assume the same on a leaner
  policy, where P-RACKS-NOELIG may finally appear and where
  same-first-name skill ambiguity could bite.
- The taxonomy's cause-first ordering (silenced > no-eligible
  > index) proved load-bearing: without it, a silenced second
  cook's first resolution would read as P-FIRST-NOSMOKE and
  the gate-B volume would be understated by hundreds. Any
  future plain taxonomy must keep cause before index.
- The "nothing to smoke" framing in the background brief was
  wrong in the usual case (eligible present on 413 of 417
  non-full plain lines): the operative reason is the dinner
  reserve, not absence. A future sense arm that claims plain
  lines mean "nothing to do" should pre-register the
  eligible-present split, or it will misread the village.
- Resolution ordinals run to 4, not the "~3x/day" of the
  branch comment — the recorder counts what the engine does,
  and the engine sometimes resolves a cook four times a day.
  A future arm quoting "3 resolutions" should say "~3, up
  to 4 observed".
- The resolutionIndex remains a recorder sequence count, not
  an engine variable (design question, carried forward): if
  Steve ever wants the game itself to distinguish "second
  resolution" from "silenced complaint" in the log, that needs
  an engine-side tag — this run deliberately did not add one.

### CONVERGENCE STATE for this axis (plain-frame split)

DIAG-GO, classification complete at the source. Plain frames
on current master are: silenced gate-B complaints 483,
later resolutions 215, first resolutions with dinner-reserve
coverage 202, racks-full-without-surplus 0, unclassified 0.
The 0935Z next blank (2) is filled: the plain frame is now a
measured split, not an opaque bucket. The open blank it
exposes is a DISPLAY question, not a measurement one — the
player cannot distinguish a swallowed complaint from a quiet
cooking — and it is recorded as a finding below, not solved
here (DIAG only, zero game changes).

### VILLAGE ASSESSMENT (plain words)

These villages cook constantly and say almost nothing about
it. Six of eight lived the full 100 days, and their cooks
produced 900 plain "cooked for the haven" lines — more than
half of them swallowed complaints about full smoke racks that
the village's one-voice-a-day rule decided not to repeat.
The loudest village (9757) is healthy and well-fed: its racks
have been full since day 33, one cook (Miguel) does all the
talking, and everyone else's identical complaint quietly
becomes the plain line, 231 times. The quiet villages are not
idle either — their first cookings of the day mostly leave
fresh food alone because tonight's dinner is already covered,
not because there is nothing to cook. If the game wants the
player to understand what the cooks are doing, the plain line
on a racks-bound day needs to say it is holding its tongue —
right now, a swallowed complaint and a quiet cooking look
exactly the same, and only this run's tags can tell them apart.

### Scope compliance

Zero src/js changes. Changed/added: scripts/plainvoice-capture.js,
scripts/sweep-plainvoice-b.js, scripts/test-plainvoice-b.js,
scripts/analyze-plainvoice-b.js,
evidence/2026-10-26/sim-plainvoice-b-corpus/ (16 files),
evidence/2026-10-26/sim-plainvoice-b-sweep-cap0/cap1.log + .err
(stdout carriers), evidence/2026-10-26/sim-plainvoice-b.md (this
file). No push, no version bump, no live verification —
committed on branch sim-plainvoice-b, pending coordinator merge.

### Findings for the coordinator backlog (do NOT edit goal hidden_files here)

- [open] 2026-10-26 — plain-voice display — on racks-bound days
  the plain frame hides swallowed gate-B complaints (483/900
  plain lines in this corpus; 9757: 231 silenced vs 68 spoken).
  A player cannot distinguish a swallowed complaint from a
  quiet cooking from the log alone (evidence sim-plainvoice-b).
- [open] 2026-10-26 — plain-voice display — P-RACKS-NOELIG is
  empty (0/900) on leadfeast: racks-bound days always carry
  about-to-rot surplus here. Whether the class appears on a
  leaner policy is unmeasured (evidence sim-plainvoice-b).
- [open] 2026-10-26 — cook resolution count — cook resolution
  ordinals run to 4/day (9757 Miguel), not the "~3x/day" of
  the branch comment; a future arm should quote "~3, up to 4
  observed" (evidence sim-plainvoice-b).
- [design-question] 2026-10-26 — engine-side plain tag —
  resolutionIndex is a recorder sequence count, not an engine
  variable; distinguishing "second resolution" from "silenced
  complaint" in the game log itself would need an engine-side
  tag, which this DIAG run deliberately did not add
  (evidence sim-plainvoice-b).

