# sim-racksvoice-b — RACKS-FULL VOICE census (DIAG only, no game change)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T0530Z,
axis food-economy, arm sim-racksvoice-b.
Worktree: `~/workspace/worktrees/sim-racksvoice-b`, branch sim-racksvoice-b.

Status: PRE-REGISTERED — everything under "PRE-REGISTRATION" below was
written BEFORE any sim in this run was executed. The RESULTS section
at the end is appended after the sweep completes and is judged ONLY
against the header.

## Canon read first

- `docs/CANON.md` (manifest), then `docs/PRESERVATION.md` (the food
  ladder: cleaned 2d < cooked 5d < smoked 30d < rendered 90d <
  pemmican 120d; smoking 16 ticks; blind penalties teach once)
  and `docs/CONVERSATIONS.md` (dialogue: real back-and-forth, no
  repeats, context-aware openings — the sense bar this census
  judges racks-full lines against).
- No canon doc covers a racks-full voice cooldown or a
  village-level first-complaint rule — stated, not invented.
  Any such rule in RESULTS is a DESIGN for a future arm, not
  canon and not implemented here.

## Background (quoted, NOT re-judged here)

- sim-saystub-b (evidence/2026-10-25/sim-saystub-b.md) proved
  the say-capture instrument (scripts/say-capture.js, in master)
  and found, on seed 9757, the racks-full cook line fires 106
  times across the run — "the game's per-cook-day gate still
  lets the fullness complaint recur heavily on a racks-bound
  village. Documented here for a future sense arm, not chased
  here." The stafffallback landing (908ad0f12) and the
  say-capture verdicts are NOT re-judged here.

## Gate read from code BEFORE any sim (to be confirmed from the corpus)

- Cook duty, src/js/game.js cook branch (~line 7070 cook task,
  ~7224 worked note, ~7236 racks-full note, ~7241 say call):
  the cook resolves ~3x/day (r20 comment). Every resolution
  calls `this.say` once with the frame
  `🍲 {first} cooked for the haven — meals stretched.` plus a
  `preservedNote` that is empty unless (a) n > 0 batches were
  smoked (worked note) or (b) the racks-full voice fires.
- Racks-full condition (computed every resolution):
  `preservedKcal >= rackCap`, where preservedKcal sums all
  preserved/rendered pantry stock and
  `rackCap = 125 * roster * max(1, ownShelf - 2)`,
  ownShelf = 30 + 5*skill if the cook is a preserver, else 15.
  So the blind-cook cap is 125 * roster * 13 kcal; a skilled
  cook's cap is larger. FOODLEVER_R5 is OFF here (not set), so
  the stand-down does not apply.
- Racks-full voice gate (the candidate governing gate):
  `this._racksFullVoice[vid] !== day` — once per cook per day.
  It fires ONLY when racksFull AND `eligible.length > 0`
  (there is about-to-rot surplus to complain about). On the
  2nd/3rd resolution of the same cook-day, or on a racks-full
  day with no eligible surplus, the line is the plain frame
  with an empty note — no complaint. The measure stays
  truthful every resolution; only the voice is gated.
- Arithmetic consequence, stated before sweeping: on a 100-day
  horizon one cook can contribute at most ~100 racks-full
  lines. A 106 total therefore CANNOT be one cook repeating
  daily — it requires at least two cooks, or a day-count /
  gate behaviour the corpus must show. The census below
  settles which: per-cook counts, per-cook day spans, and
  distinct complaint days.

## PRE-REGISTRATION (bound per docs/MEASUREMENT.md §§9-12, 14-15)

### Instrument (use what exists, do not reinvent)

- scripts/say-capture.js after loadGame, same post-load wrap
  pattern as saystub-b. No change to say-capture.js, no change
  to sim-harness.js, zero src/js changes in this arm.
- CAP choice, fixed for this run: SAYCAP=1000 (the metric-review
  fix from saystub-b: SAYCAP >= 500, because the 200 cap
  truncated plain cook lines; 9757 alone produced 370 matching
  lines). The full cook filter is kept (not narrowed to
  worked/racks-full only), so the worked==resolutions
  cross-check stays meaningful and plain-line volume is
  visible. This choice is fixed here and not changed mid-run.
- Sweep driver: scripts/sweep-racksvoice-b.js (new file, same
  loadGame-per-seed pattern as sweep-saystub-b.js, plus a
  census computed from the captured samples: per-cook
  racks-full counts, per-cook distinct days, day span,
  racks-full kcal min/max parsed from the line text).
  Corpus dir (new, never mixed into an older corpus):
  evidence/2026-10-26/sim-racksvoice-b-corpus/ — inside this
  worktree, NEVER /tmp.

### Substrate, seeds, horizon (identical on all configs)

- Policy leadfeast, DEPOSITGATE=1, FEASTSCALE_R13=1,
  SEATDRIVE=0, PLENTYDEPRI=0 (pd0 only — the racks-bound side),
  100d death-aware horizon (dead villages stop, +10d tail max).
  All asserted FATAL by the driver.
- Seeds: the saystub band 9750-9757 (8 seeds, identical seeds
  make the comparison exact). Never below 8.
- Configs: 8 seeds x {cap0, cap1} = 16 configs. cap0 is the
  neutrality control (stock harness, no capture); cap1 is
  the census corpus. File names:
  racksvoice-b-<cap0|cap1>-pd0-dg1-leadfeast-s<seed>.json.

### VERDICT RULE (binding — judge ONLY against this header)

DIAG-GO holds if and only if ALL of the following hold:

- (a) The 9757 recurrence is reproduced-or-explained: if the
  cap1 9757 racks-full count differs from 106, the drift is
  named (substrate change, cap, or gate behaviour) — the
  count is NOT forced to 106.
- (b) The gate + recurrence shape is named with exact counts
  on >= 6/8 seeds, with any deviating seed named individually.
  "Shape" means: one cook repeating daily, many cooks each
  complaining once/few times, or a gate that resets — stated
  from the per-cook breakdown, not asserted.
- (c) Validity holds: all 16 per-seed files present and
  parsing; batches >= resolutions on every cell; on every
  cap1 cell, captured worked-line count EQUALS
  preserveVillagerResolutions (the saystub-b cross-check,
  mandatory for every corpus judged here).

Otherwise the verdict is DIAG-NO-GO, with the failed
condition(s) named. A DIAG-NO-GO here means ONLY "this census
does not characterise the recurrence" — it is NOT a judgment
on the racks-full mechanic, on saystub-b, or on any future
voice-gate design.

Guards (reported, never verdict-flipping post-hoc):
- Neutrality: cap0 vs cap1 numeric fields identical on a
  control pair — batches, resolutions, daysAlive (and the
  full saystub field list where present). If the capture
  moves any numeric field, that is reported and the arm is
  NO-GO on neutrality (stated here as a guard, applied as
  reported, not as a re-scored verdict condition).
- Sense: quoted racks-full lines carry day/seed/cook/batches
  context (here: day/seed/cook/preserved-kcal from the line);
  judge whether the line's content still tracks the village
  (kcal figure moving across days) or degrades into pure
  repetition (identical kcal figure repeated).

### Pilot gate (§9)

- No separate pilot/confirm split: the whole corpus is 16
  configs at ~seconds each, and the verdict is judged on
  all 8 seeds at once. The pilot-gate principle is honoured
  by running scripts/test-racksvoice-b.js parser + gate
  checks BEFORE the sweep: if the cook/kcal parsers fail on
  the known saystub lines, the sweep does not run.

### Balanced panel (§15)

- This is a DIAG census, not a before/after balance pair (no
  game lever changes), so no panel compare is expected. A
  panel attempt is recorded honestly: if
  scripts/balance-panel.js cannot ingest recorder corpora,
  that fallback note is written and no panel input is
  fabricated. The §15-equivalent instrument here is the
  cap0 vs cap1 paired table in RESULTS.

### Sense-testing, wall numbers, villager behaviour

- SENSE-TESTING LAW: quote at least 3 racks-full lines
  verbatim with day/seed/cook/kcal, plus at least 1 worked
  line, and judge meaning and repetition — does the kcal
  figure track the village across days, or is the complaint
  the same number every time? A quote with its day, seed,
  cook, and kcal attached is the evidence; a bare count is
  not.
- WALL NUMBERS on this corpus: national / table / wins,
  wave 1-5 reach, median survival (median daysAlive). NOTE:
  table = win flag, and SEATDRIVE=0 makes the table
  unreachable by construction — table 0 here is a
  construction fact, not a scale-wall finding.
- VILLAGER-BEHAVIOUR SAMPLE: which cooks speak (one-cook
  vs rotating villages), whether the same cook complains
  on consecutive days, and whether worked lines and
  racks-full lines interleave on the same seed (a village
  that both smokes and complains) or partition by phase.

### Metric review (filled after the verdict, §14 — revisions apply to the NEXT run, this verdict is NOT re-scored)

- See the "Metric review" subsection under RESULTS below.

### Scope

Zero src/js game changes in this worktree. New files only:
scripts/sweep-racksvoice-b.js, scripts/test-racksvoice-b.js,
evidence/2026-10-26/sim-racksvoice-b-corpus/ (per-seed files),
evidence/2026-10-26/sim-racksvoice-b.md (this file). No push,
no version bump, no live verification — committed on branch
sim-racksvoice-b, pending coordinator merge.

---

## RESULTS (appended after the pre-registration above; verdict judged ONLY on the corpus named here)

CORPUS: evidence/2026-10-26/sim-racksvoice-b-corpus/, 16 files
(racksvoice-b-cap0/cap1-pd0-dg1-leadfeast-s9750..9757.json),
policy leadfeast, pd0, dg1, 100d death-aware horizon, current
head (no patch, no game change). CAP=0 = stock harness (control);
CAP=1 = scripts/say-capture.js installed after loadGame, SAYCAP
1000. CAP=1 files are CENSUS records (see "Corpus format" below),
not full sample arrays — every verdict input is carried in the
record, and the record says so (fullSamplesPersisted: false).

PROOF TEST: node scripts/test-racksvoice-b.js — 57 PASS / 0 FAIL
(T1 parsers + gate read 9, T2 corpus + verdict 48). Analyzer:
node scripts/analyze-racksvoice-b.js (table + quotes below).

### Verdict: DIAG-GO

- (a) HOLDS — 9757 REPRODUCED EXACTLY: racksFull 106, sayTotal
  370, worked 43, batches 107, resolutions 43, deaths 3,
  daysAlive 100, national — identical to saystub-b on every
  reported field. No drift to explain on 9757.
- (b) HOLDS — gate + recurrence shape named with exact counts
  on 8/8 seeds (table below), no deviating seed in gate terms:
  on every seed, every cook's racks-full count EQUALS that
  cook's distinct complaint days (test T2 "gate holds" 8/8) —
  the per-cook-per-day gate holds everywhere, with no reset.
- (c) HOLDS — validity: 16/16 files present and parsing;
  batches >= resolutions on every cell; worked == resolutions
  on every CAP=1 cell (52/54/50/62/34/20/61/43).
- Neutrality guard HOLDS: CAP=0 vs CAP=1 numeric fields
  identical on 8/8 seeds (daysAlive, batches, kcal,
  resolutions, deaths, national, waveReach, rank). The capture
  moves nothing.

### The governing gate, in plain words

The cook's job runs about three times a day. Each time, the
game checks whether the smoke racks are overfull: it adds up
all the smoked and rendered food in the pantry and compares it
to what the village can eat before that food turns (125 kcal
per person per day, times the cook's shelf life minus a couple
of days — about 13 days' worth for an unskilled cook). If the
pile is bigger than that AND there is fresh food about to rot
that could have been smoked, the cook says so — but only ONCE
per cook per day. A little notebook in the game
(`_racksFullVoice`) remembers which cook already complained
today. On the cook's second and third jobs that day, or on a
day when the racks are full but nothing is about to rot, the
cook just says the plain "cooked for the haven" line with no
complaint. The fullness itself is re-checked every time; only
the VOICE is gated.

### The recurrence shape (the answer to the census question)

It is MANY cooks, each complaining on their own cook-days —
not one cook repeating daily, and not a gate that resets.
The per-cook-per-day gate multiplies by the number of cooks
on duty: a racks-bound village with two cooks working the
same day produces TWO complaints that day, and a village
stuck racks-bound for weeks produces a complaint per cook
per day for the whole stretch.

- 9757 (the 106): FOUR cooks over 55 distinct days, d44–d100:
  Miguel 55, Grace 36, Kealan 14, Hryts 1 (day 100 only).
  Most racks-bound days carry two complaints (Miguel + Grace
  or Kealan). 106 = 55 + 36 + 14 + 1. No cook exceeds one
  complaint per day; no day carries more than two.
- 9753 (64 lines, 51 distinct days, d37–d96): Courtney 50,
  Roberto 14; days 68–69 and later carry both cooks.
- 9750 (33 lines, 19 days, d56–d77): Sierra 18, Malik 15,
  nearly always paired on the same days.
- 9752 (37 lines, 37 days, d30–d90): Mason 3 (d30–d32), then
  Theo alone for 34 days — the closest thing to a single
  repeating cook, and still only one line per day.
- 9756 (17 lines, 17 days, d34–d77): Grace alone, one per day.
- 9751 (4 lines, 4 days, d66–d93): Aroha alone, scattered.
- 9755 (4 lines, 2 days, d53–d54): Otto + Alfredo, same two
  days, same stock figure all four times.
- 9754 (0 lines): the village never filled its racks — it
  lost at day 95 with only 34 smoking resolutions spread
  over 8 cooks (Liam 21 of them). No racks-full days means
  no complaints, which is the gate working, not silence.

PER-SEED TABLE (CAP=1 census; CAP=0 numerics identical):
- 9750 days=100 | batches 144 | res 52 | worked 52 | racksFull 33 | plain 86 | say 171 | deaths 6 | national | wave 4
- 9751 days=100 | batches 145 | res 54 | worked 54 | racksFull 4 | plain 12 | say 70 | deaths 8 | national | wave 3
- 9752 days=100 | batches 147 | res 50 | worked 50 | racksFull 37 | plain 31 | say 118 | deaths 3 | national | wave 2
- 9753 days=100 | batches 162 | res 62 | worked 62 | racksFull 64 | plain 209 | say 335 | deaths 3 | national | wave 3
- 9754 days=95 (village-lost) | batches 72 | res 34 | worked 34 | racksFull 0 | plain 11 | say 45 | deaths 14 | regional | wave 3
- 9755 days=82 (village-lost) | batches 51 | res 20 | worked 20 | racksFull 4 | plain 88 | say 112 | deaths 14 | regional | wave 4
- 9756 days=100 | batches 171 | res 61 | worked 61 | racksFull 17 | plain 51 | say 129 | deaths 3 | global | wave 4
- 9757 days=100 | batches 107 | res 43 | worked 43 | racksFull 106 | plain 221 | say 370 | deaths 3 | national | wave 4

Totals (CAP=1): racksFull 265 lines over 8 seeds; worked 336;
plain 708; say 1380. The plain frame — a cook resolution with
no note — is the largest single voice in the corpus, not the
complaint: on 9757, 221 of 370 cook lines are plain, vs 106
complaints. Plain lines cannot be split further from text
alone (every plain line is the byte-identical frame): they
cover second/third resolutions of a cook-day, racks-full days
with no about-to-rot surplus, and non-full days with nothing
to smoke. That split is a stated limit, not a finding.

### Does the line's content still track the village?

Partly — and the failure mode is specific. The kcal figure is
always the true preserved pile at that moment (never invented),
but on racks-bound stretches the pile often sits untouched for
days, because the village eats fresh food first at night. So
the complaint repeats the SAME number for days:

- Frozen: 9755 — 16,256 kcal all 4 lines (2 cooks × 2 days).
  9752 — 17,033 kcal × 11 straight days (d38–d48), then
  16,043 × 7 days. 9753 — 15,511 × ~10 lines, 15,341 × 8,
  14,729 × ~8. 9757 — 19,409, 19,349, and 19,467 each frozen
  for multi-day runs inside the 106.
- Tracking: 9756 — all 17 complaints carry DIFFERENT kcal
  figures (19,218 → 41,683 → 34,596), because that village
  keeps smoking and eating in turns. 9750 — 13 distinct
  figures over 33 lines; 9751 — 3 distinct over 4 lines.
- Same-day cooks quote the same figure (they read the same
  pile): 9757 d44 Miguel + Grace both 20,187; 9750 d58 Sierra
  + Malik both 15,578; 9753 d68 Courtney + Roberto both
  15,511.

Judgment (SENSE-TESTING LAW): the line never lies about the
pile, but as VOICE it degrades into pure repetition exactly
when the pile is frozen — which is most of a long racks-bound
stretch. A player reading the log sees "the racks are already
full (19,467 kcal kept…)" day after day from two cooks, with
nothing new said. The honest complaint becomes noise not
because the number is wrong, but because nothing changed and
it is said again anyway.

### Phase structure (villages smoke first, then complain)

Every preserving village starts with worked lines (first
worked line d14–d33 across seeds) and only later hits
racks-full (first complaint d30–d66). 9757 is the cleanest
example: Kealan smokes on d26, Miguel smokes through the
early stretch, and from d44 on the village is racks-bound
for the rest of the run — 106 complaints, almost no more
worked lines. The complaining cook is whoever is on cook duty
on a racks-full day, not necessarily the main smoker: 9756
smokes mostly through Hassan (56 worked lines) but complains
only through Grace (17); 9751 smokes mostly through Aroha
(42) and complains only through her too, on 4 scattered days.

### SENSE-TESTING quotes (verbatim, day/seed/cook/kcal)

- [9757 d44 Miguel] "🍲 Miguel cooked for the haven — meals stretched. The racks are already full (20,187 kcal kept — more than the haven can eat before it turns), so Miguel left the fresh pile for tonight's dinner instead of smoking it onto the rot pile."
- [9757 d44 Grace] same day, same figure: "🍲 Grace cooked for the haven — meals stretched. The racks are already full (20,187 kcal kept — more than the haven can eat before it turns), so Grace left the fresh pile for tonight's dinner instead of smoking it onto the rot pile."
- [9757 d100 Hryts] "🍲 Hryts cooked for the haven — meals stretched. The racks are already full (16,427 kcal kept — more than the haven can eat before it turns), so Hryts left the fresh pile for tonight's dinner instead of smoking it onto the rot pile."
- [9752 d30 Mason] "🍲 Mason cooked for the haven — meals stretched. The racks are already full (17,191 kcal kept — more than the haven can eat before it turns), so Mason left the fresh pile for tonight's dinner instead of smoking it onto the rot pile."
- [9753 d37 Courtney] "🍲 Courtney cooked for the haven — meals stretched. The racks are already full (20,651 kcal kept — more than the haven can eat before it turns), so Courtney left the fresh pile for tonight's dinner instead of smoking it onto the rot pile."
- [9756 d34 Grace] "🍲 Grace cooked for the haven — meals stretched. The racks are already full (19,218 kcal kept — more than the haven can eat before it turns), so Grace left the fresh pile for tonight's dinner instead of smoking it onto the rot pile."
- Worked, for contrast [9756 d17 Hassan] "🍲 Hassan cooked for the haven — meals stretched. Hassan worked the smoke racks too — 5 batches preserved (~1631 kcal, keeps for weeks)."

### WALL NUMBERS (corpus, CAP=1)

national-or-better 6/8 (9756 global; 9754/9755 regional and
village-lost), table 0/8, wins 0/8, wave reach distribution
{2: 1, 3: 3, 4: 4} (per-cell max wave), median daysAlive 100,
max 100. Table 0 is a construction fact (SEATDRIVE=0), not a
scale-wall finding. Total deaths 54 (CAP=1); the arena alone
is 35/54 (~65%) — same shape as saystub-b (arena ~63%):
on this policy and horizon, villages do not mainly starve,
they die in the show. 9754/9755 are the exceptions that prove
the shape: both lost villages with 14 deaths each, 11–12 of
them in the arena.

### VILLAGER-BEHAVIOUR SAMPLE

Cooks rotate: 9754 spreads 34 smoking resolutions over 8
cooks; 9751 spreads 54 over 3 (Aroha 42, Valeria 9, Desmond 3);
9757 spreads 43 over 3 (Miguel 37, Grace 4, Kealan 2). No
village in this corpus is a one-cook village, unlike
saystub-b's 9753 (Owen alone) — the staffing fallback changed
that (see "Substrate drift" below). Nothing reads robotic
beyond the honest frame repetition of a single duty line;
the repetition that matters is the racks-full complaint
itself, analyzed above.

### Design for a future arm (DESIGN ONLY — nothing implemented here)

The gate to change is the per-cook-per-day voice gate in the
cook duty (src/js/game.js). Three candidate rules, to be
measured as separate arms with their own GO thresholds (a
future arm's job, not this census's verdict):

- B (village-level first complaint): only the FIRST racks-full
  complaint each day speaks; later cooks that day get the
  plain frame. On this corpus B cuts 9757 106 → 55 (one per
  racks-bound day) and 9753 64 → 51, while keeping the daily
  signal. It does nothing about frozen-number repeats across
  days.
- C (change-only voice): a cook complains only when the kept
  kcal figure moved since the last complaint (by any amount,
  or by a threshold the arm sets). On this corpus C cuts 9757
  106 → 29 distinct figures, 9752 37 → 12, 9755 4 → 1, and
  leaves 9756 untouched at 17 (every figure already moved).
  C attacks exactly the frozen-pile repetition found here.
- B+C combined: one voice per day, only when the number
  moved — the most faithful rule on this evidence, but it
  must be measured, not assumed: it risks silencing a
  genuinely worsening pile on days the number barely moves.
  A future arm should also re-read plain-line volume (708
  lines here) before claiming the log got quieter — quieting
  complaints while plain frames stay at 221 on 9757 is only
  half a fix, and the plain-frame question needs its own
  split (the census cannot split plain subtypes from text).

No [needs-eyes] on this commit: DIAG-only evidence, no game
change, no player-facing difference.

### Substrate drift vs saystub-b (named, not forced)

Zero src/js changes between saystub-b's head (878247f96) and
this run's head (git log 878247f96..HEAD -- src/js/game.js is
empty; 26 commits, all tooling/policy/evidence). The drift
source is the stafffallback landing 908ad0f12, which changed
scripts/policies/competent.js cook staffing: the old code
picked the single highest-preserver free villager and never
fell through — if that villager refused cook duty (cook gates
at trust 20), NO cook was staffed; the new code walks down
the skill list until someone accepts. That one policy change
moved the whole band:

- 9750: batches 127→144, res 44→52, racksFull 24→33, deaths 10→6
- 9751: batches 115→145, res 40→54, racksFull 13→4, deaths 9→8
- 9752: batches 78→147, res 32→50, racksFull 30→37, deaths 8→3, wave 4→2
- 9753: batches 55→162, res 24→62, racksFull 10→64, deaths 10→3
- 9754: batches 0→72, res 0→34, racksFull 0→0, days 100→95 (village-lost), rank global→regional, deaths 10→14
- 9755: batches 134→51, res 43→20, racksFull 8→4, days 100→82 (village-lost), rank national→regional, deaths 7→14
- 9756: batches 111→171, res 47→61, racksFull 10→17, deaths 6→3
- 9757: NO DRIFT — batches 107, res 43, say 370, racksFull 106, deaths 3, all identical to saystub-b

So the drift is trajectory divergence from a real policy
change, not instrument error: where the trajectory did not
diverge (9757), every number reproduces exactly; where it
did, the cap0-vs-cap1 internal comparison still agrees on
all 8 seeds. Per the pre-registration, verdict condition (a)
is "reproduced-or-explained": 9757 is reproduced, the other
seven are explained by the staffing change above. The verdict
does not depend on matching saystub-b's numbers.

### Corpus format (honest deviation, documented)

The original plan was full sample arrays per seed (saystub-b
format). The container write-denial flap (EPERM) blocked
file writes from the long-running sweep process persistently
during this run — 60 real-wait retries over 2 minutes still
failed on one file — while short-lived shell/python writes
and the exec pipe kept working. Two instrument fixes, both
in scripts/sweep-racksvoice-b.js (tooling only, zero game
changes), and both documented here:

1. The sweep's write-retry "2s busy-wait" was a no-op: the
   harness mocks Date.now to advance 1ms per CALL
   (sim-harness.js), so the wait exited after ~2000 mock
   calls (~0 real ms) and all 30 retries burst inside one
   denial moment. Fixed with Atomics.wait (real wall time).
   The saystub-b sweep has the same latent bug — it only got
   lucky on open windows. A future run reusing that sweep
   should port this fix.
2. Census mode (SWEEP_CENSUS=1): the sweep prints a compact,
   verdict-complete census record to stdout (pipe) instead
   of the full samples array. The record carries every verdict
   input — numerics, worked/resolutions, per-cook breakdowns,
   per-line racks-full detail (day/cook/kcal for EVERY
   racks-full line), and verbatim quote samples — and states
   fullSamplesPersisted: false. CAP=1 files in this corpus
   are census records; CAP=0 files are the small full numeric
   records (no samples by construction). The worked ==
   resolutions cross-check was computed in-process from the
   full samples before summarising, so the check is not
   weakened by the summarising — but a future run that wants
   to re-read every plain line verbatim cannot do so from
   this corpus, and that limit is stated here, not hidden.

The flap also left 0-byte residue files twice (a failed
write truncates before failing); both were deleted before
the successful writes, and every corpus file in the final
corpus was verified parsing with the expected seed and
non-zero size (test T2: 57/57).

### BALANCED PANEL (§15)

Attempted honestly, not fabricated: scripts/balance-panel.js
is a before/after panel RUNNER (it spawns its own child sims
under its own observer with --before/--after panel files) —
it cannot ingest recorder corpora, and running a panel would
be a different experiment under a different observer, not a
comparison of this corpus. So no panel compare is attached
and none is faked. The §15-equivalent instrument for this
DIAG census is the CAP=0 vs CAP=1 paired table above (8/8
identical), judged by the GO rule in the header — the same
stance saystub-b took for its instrument-only arm.

### Metric review (§14 — for the NEXT run; this verdict is NOT re-scored)

- The SAYCAP=1000 choice held: the largest CAP=1 cell (9757)
  produced 370 matching lines, under the cap with headroom;
  no cell was truncated. Keep SAYCAP >= 500 for any future
  use of this capture, and port the Atomics.wait retry fix
  to any sweep reusing the old writeRobust.
- The worked==resolutions cross-check held on all 8 cells
  again (including the two village-lost cells) — keep it
  mandatory for every future use of this capture.
- The pre-registration's "one cook repeating daily" framing
  was the wrong null: the gate is per-cook, so the natural
  unit is complaints per cook-day, and the headline number
  (106) is a sum over cooks, not a single cook's count. A
  future voice arm should pre-register "complaints per
  racks-bound day" and "distinct kcal figures per complaint
  run" alongside the raw total, or it will mistake a
  two-cook village for a broken gate.
- Plain-line volume (708 lines, more than double the
  complaints) was not a pre-registered metric and is not
  judged here — but it is the largest voice in the corpus,
  and a future sense arm should pre-register a plain-line
  split (cook-day position + racks-full-without-eligible
  flag) instead of inferring it from identical frame text.
- Seed 9754's racksFull=0 is consistent (never racks-bound),
  but it also means this corpus cannot show what a
  racks-full complaint looks like on a dying village — the
  GO rests on the other seven seeds, as it should.

### CONVERGENCE STATE for this axis (racks-full voice census)

DIAG-GO, census complete. The recurrence is characterised,
not merely counted: the governing gate is the per-cook-per-
day voice gate, the shape is many cooks × their cook-days
(9757: Miguel 55 + Grace 36 + Kealan 14 + Hryts 1 = 106 over
55 days), and the sense failure is frozen-number repetition
on untouched piles, not a broken gate or a reset. The next
step is a future voice arm measuring rule B, C, or B+C —
design above, implementation explicitly out of scope here.

### VILLAGE ASSESSMENT (plain words)

These villages are well-fed to a fault. Six of eight lived
the full 100 days and reached national standing or better,
and their cooks spent the run smoking food — then, once the
smoke racks filled past what the village could eat, spent
weeks telling everyone so, once a day each, in the same words
with a number that often hadn't moved since yesterday. Two
villages didn't make it: both were torn apart in the arena
(11 and 12 arena deaths), one before its racks ever filled,
one after only two days of complaints. The loudest village
(9757) is also one of the healthiest — 106 complaints is not
a village in trouble, it's a village with full racks, two
cooks on duty, and nothing new to say for two months. If the
game wants that complaint to stay meaningful, it should speak
only when the pile actually changed — otherwise the cooks
are just repeating yesterday's number at the player, twice a
day, for the rest of the run.

### Scope compliance

Zero src/js changes. Changed/added: scripts/sweep-racksvoice-b.js
(census mode, stdout mode, real-wait retry fix),
scripts/test-racksvoice-b.js, scripts/analyze-racksvoice-b.js,
evidence/2026-10-26/sim-racksvoice-b-corpus/ (16 files),
evidence/2026-10-26/sim-racksvoice-b.md (this file). No push,
no version bump, no live verification — committed on branch
sim-racksvoice-b, pending coordinator merge.

