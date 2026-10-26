# sim-reminder-b — frozen-stretch REMINDER voice (game-code arm)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T1130Z,
axis food-economy, arm sim-reminder-b.
Worktree: `~/workspace/worktrees/sim-reminder-b`, branch sim-reminder-b.

Status: PRE-REGISTERED — everything under "PRE-REGISTRATION" below was
written BEFORE any sim in this run was executed. The RESULTS section
at the end is appended after the sweeps complete and is judged ONLY
against the header. Rule D is NOT re-judged here and is NOT revived:
the 1035Z evidence killed D on a diagnosed metric failure (its two
ratio bars were jointly unsatisfiable), and this arm measures a NEW
design named in that metric review — a frozen-stretch reminder voice
— not a D variant.

## Canon read first

- `docs/CANON.md` (manifest), then `docs/PRESERVATION.md` (the food
  ladder: cleaned 2d < cooked 5d < smoked 30d < rendered 90d <
  pemmican 120d; smoking 16 ticks; "rot can't be smoked back into
  food") and `docs/CONVERSATIONS.md` (dialogue sense bar: real
  back-and-forth, no repeats, context-aware openings — the bar
  racks-full lines are judged against).
- No canon doc covers a racks-full voice cooldown, a village-level
  first-complaint rule, or a reminder voice — stated, not invented.
  Gate B (landed) and rule R below are DESIGNS to measure, not canon.

## Background (quoted, NOT re-judged here)

- evidence/2026-10-26/sim-food-economy-round-1035-b.md (binding):
  gate B is the current default (village-level first racks-full
  complaint per day, in src/js/game.js). Rule D (change-only: speak
  only when a cook's rounded kcal figure differs from that cook's
  last spoken figure) was PILOT NO-GO and KILLED — D 178 vs B 230
  voices, voice-days ratio 0.774 against a 0.90 bar — and the metric
  review diagnosed the bars, not just the rule: under any
  one-voice-per-day successor, total voices equal voice-days, so
  the two ratio bars could never both pass, and D attains the
  change-only MAXIMUM voice-days (the 52 lost days have zero
  changed figures, so no change-only rule can voice on them). The
  next change-only arm must pre-register a SINGLE ratio bar — and
  must not re-judge the D corpus. "A frozen-stretch reminder voice
  (a voice that returns after N silent racks-bound days) is an
  untested NEW design, not a D variant."
- evidence/2026-10-26/sim-racksvoice-gate-b.md: gate B landed
  (pilot band 265 -> 185, confirm 509 -> 404, daily signal kept).
  B's known costs: frozen-number repeats across days untouched,
  and cook-diversity loss (9757 under B is all-Miguel 55).
- evidence/2026-10-26/sim-plainvoice-b.md: plain frames split at
  source (900 lines: P-SILENCED 483, P-RES2PLUS 215,
  P-FIRST-NOSMOKE 202, P-RACKS-NOELIG 0, UNCLASSIFIED 0). On 9757,
  231 silenced lines pile up behind 68 spoken complaints.
- D's sense failure, carried as the design problem: 25 racks-bound
  days on 9752 go entirely voiceless under D — "a player could
  reasonably conclude the racks problem resolved when it hasn't.
  D is locally correct and globally quiet."

## PRE-REGISTRATION (bound per docs/MEASUREMENT.md §§9-12, 14-15)

### The design: rule R (NEW, not D)

Start from gate B (village-level first complaint per day). Add
per-cook change memory plus a reminder. All changes are VOICE
only: the fullness computation still runs every resolution, the
racksFull + eligible-surplus condition is unchanged, and a
silenced complaint becomes the plain frame (exactly what the
2nd/3rd resolution of a cook-day already produces) — no cook
line is deleted, say totals are unchanged, only
complaint -> plain conversion happens. The kept kcal figure is
always Math.round(preservedKcal), the same figure the current
line prints.

State (new, on the game object, voice-only):
- `this._racksFullReminderLast`: map vid -> last spoken rounded
  kcal figure for THAT cook (per-cook memory, as in D).
- `this._racksFullReminderSilent`: village-level count of
  consecutive racks-bound days with no R voice since the last
  R voice (counts racks-bound days only; calendar gaps and
  non-racks-bound days neither increment nor reset it).
- `this._racksFullReminderDay`: last day a racks-full candidate
  was evaluated (spoken or silent) — the day slot, so at most
  one candidate per day is evaluated, exactly as B allows at
  most one voice per day.

Candidate rule (env RACKSVOICE_REMINDER=1; default OFF = gate B
during measurement — do NOT flip the default until pilot GO):
on a racks-full + eligible resolution, if the reminder day
marker already equals today, the line is plain (day slot
spent). Otherwise mark the day evaluated, then:
- CHANGE voice: the candidate cook has never spoken a
  racks-full complaint, OR the current rounded figure differs
  from that cook's last spoken figure. Speak; set the cook's
  last spoken figure; reset the silent count to 0; set
  `_racksFullVoiceDay` (so B-marker readers see a voice).
- FROZEN day: the figure equals the cook's last spoken figure.
  Increment the silent count. If the silent count reaches N,
  speak a REMINDER voice (same line, same true figure); set
  the cook's last spoken figure (same value); reset the silent
  count to 0; set `_racksFullVoiceDay`. Otherwise stay silent
  (plain frame; `_racksFullVoiceDay` NOT set, so the day reads
  as voiceless — the day slot is still spent via the reminder
  day marker, so no later cook speaks that day).

N = 7. Justification, fixed before sweeping: 7 days is one
in-game week — a natural "the cook mentions it again after a
week of silence" cadence, long enough to keep D's silencing
win on short freezes (the old 9755 case was a 2-day freeze,
which stays silent) and short enough to interrupt the long
freezes that motivated this design (the old 9752 case ran an
11-day same-figure stretch, which under N=7 speaks a reminder
on its 7th silent day). N is fixed for the pilot; a different
N is a different arm, not a mid-run tuning knob. If
RACKSVOICE_GATE=0 is set (old per-cook rule), the reminder is
ignored entirely — R modifies only the B default path.

Landing rule, pre-registered: if pilot GO and confirm GO (both
below), flip the default to R (env unset = R; env
RACKSVOICE_REMINDER=0 restores B for regression testing) and
re-verify the proof test plus a spot paired check before
committing. If either fails, the game-code change is KILLED:
revert src/js/game.js to its pre-run state, verify
byte-identical (zero R identifiers), commit tooling +
evidence + corpus only, and report the full numbers.

### Stretch and voice definitions (the pilot's units, fixed here)

- Racks-bound day: a day with at least one eligible racks-full
  complaint opportunity. Operationally, a B voice day: gate B
  speaks exactly once per racks-bound day, so the B detail
  array's distinct days ARE the racks-bound days, and the B
  first-complaint figure per day is the figure of B's (only)
  line that day. Racks-bound days are identical under B and R
  because numerics are identical (guard bar below) — the
  racks-bound day set is a game-state fact, not a voice fact.
- Frozen run: a maximal run of consecutive racks-bound days
  (in racks-bound-day order; calendar gaps between
  racks-bound days do not break a run) sharing the same B
  first-complaint figure.
- Voiceless run: a maximal run of consecutive racks-bound days
  on which R speaks no voice.
- Reminder voice (analyzer classification, computed from the R
  detail order independently of the implementation): an R voice
  whose speaker cook previously spoke a racks-full complaint
  AND whose figure equals that cook's last spoken figure.
  Change/initial voices are all other R voices (cook never
  spoke, or figure differs from the cook's last spoken
  figure). The implementation's reminder voices satisfy this
  classification by construction (a reminder fires only on a
  frozen day); the analyzer verifies it rather than assuming
  it, and also verifies the schedule: a reminder-classified
  voice must be preceded by exactly N-1 consecutive voiceless
  racks-bound days.
- "Frozen stretch of >=N silent racks-bound days" (the task's
  primary bar, operationalized): a run of racks-bound days
  whose first N days would all be silent. The reminder
  interrupts exactly that: it speaks on the Nth silent day
  (the (N-1) voiceless days before it plus the reminder day
  itself make the N-day stretch, and the stretch therefore
  contains the reminder voice). Coverage 100% therefore means:
  (a) NO voiceless run reaches length N (max voiceless run
  <= N-1 = 6 on every seed), AND (b) every reminder-classified
  voice is preceded by exactly N-1 voiceless racks-bound days
  (reminders fire on schedule, never early, never late).
  A stretch that ends before N silent days (short freeze, or
  a change voice) needs no reminder and counts against
  neither condition.
- Non-vacuity REPORT (not a GO bar, so it cannot re-score the
  verdict): the pilot reminder count is published. If zero
  reminders fire, the reminder mechanism is unexercised on
  this band and the GO is reported as "GO on bars, reminder
  unexercised" with that caveat attached — the bars below
  still decide GO/NO-GO, and the metric review carries the
  follow-up (a longer-freeze band) for the next run.

### Instrument

- scripts/say-capture.js unchanged (proven neutral in prior
  arms: cap0 vs cap1 numerics identical 8/8). SAYCAP=1000.
- New sweep scripts/sweep-reminder-b.js: same loadGame-per-seed
  pattern as sweep-racksvoice-gate-b.js, with RACKSVOICE_REMINDER
  passed through env; SWEEP_CENSUS=1 stdout mode (flap-proof:
  the long-running sweep process never writes files; a
  short-lived splitter persists per-seed JSONs from stdout).
  Corpus dir (new, never mixed into older corpora):
  evidence/2026-10-26/sim-reminder-b-corpus/ — inside this
  worktree, NEVER /tmp as the sole copy.
- New analyzer scripts/analyze-reminder-b.js: per-seed B-vs-R
  table, frozen runs, voiceless runs, reminder classification
  and schedule check, GO evaluation against the bars below.
- New proof test scripts/test-reminder-b.js: parser checks +
  corpus assertions. ORDER (binding): the neutrality leg
  (flagged-vs-unflagged numerics identical) runs FIRST in the
  test and is reported first; no classified number (coverage,
  totals, say) is judged if neutrality fails. The test file
  itself enforces this order (neutrality assertions precede
  coverage assertions, and the test exits nonzero on a
  neutrality failure before evaluating GO bars).

### Substrate, seeds, horizon (identical on all configs)

- Policy leadfeast, DEPOSITGATE=1, FEASTSCALE_R13=1,
  SEATDRIVE=0, PLENTYDEPRI=0 (pd0 only), 100d death-aware
  horizon (dead villages stop, +10d tail max). All asserted
  FATAL by the driver.
- Pilot: census band 9750-9757 (8 seeds) x {B baseline
  (flag unset), R (RACKSVOICE_REMINDER=1)} = 16 configs, run
  SEQUENTIALLY. Baseline is RE-SWEPT on current master — no
  old corpus is cited as this run's baseline (prior arms
  showed substrate drift from sibling policy changes).
- Confirm: fresh band 9760-9775 (16 seeds) x {B, R} = 32
  configs, identical seeds. Confirm runs ONLY if pilot GO.
- File names:
  reminder-b-<B|R>-pd0-dg1-leadfeast-s<seed>.json
  (confirm files add `-confirm` before the seed).

### PILOT GO thresholds (binding — judge ONLY against these)

PILOT GO iff ALL of the following hold:

- (primary) Reminder coverage 100%: max voiceless
  racks-bound-day run <= 6 (= N-1) on every seed, AND every
  reminder-classified voice is preceded by exactly 6
  voiceless racks-bound days.
- (guardrail) Total racks-full voice <= B baseline total on
  identical seeds (band total; per-seed R <= B is also
  reported — R voices are a subset of B voice days by
  construction, and any per-seed increase is a loud
  implementation bug even though the band bar is the verdict
  bar).
- Numerics identical on every cell (daysAlive, batches,
  resolutions, deaths, rank, national, waveReach, table/win).
  Any numeric delta = NO-GO (voice leaked into state).
  Worked == resolutions on every cell.
- Say totals unchanged: sayTotal R == B on every seed
  (plain rises by exactly the silenced count).
- No seed loses all racks-full voice: for every seed with B
  racksFull > 0, R racksFull > 0.

A miss is NO-GO, never re-scored against a friendlier metric
mid-run. Metric doubts go under "Metric review". Confirm
spend ONLY on pilot GO.

### CONFIRM GO thresholds (binding, fresh band 9760-9775)

Same five bars, judged on the fresh band: coverage 100%
(max voiceless run <= 6 every seed; every reminder voice
preceded by exactly 6 voiceless days), band total R <= band
total B, numerics identical 16/16, say totals unchanged
16/16, no seed with B > 0 loses all voice. Any miss = overall
NO-GO: the game-code change is killed (revert game.js, verify
byte-identical) even though the pilot passed.

### Balanced panel (§15)

- scripts/balance-panel.js is a before/after panel RUNNER
  (spawns its own child sims under its own observer with
  --before/--after panel files); it cannot ingest recorder
  corpora. Running a panel would be a different experiment
  under a different observer, not a comparison of this
  corpus. So no panel compare is attached and none is
  faked; the §15-equivalent instrument is the identical-seed
  B-vs-R paired table (same observer, same seeds, only the
  reminder env differs), judged by the GO bars above. A panel
  invocation attempt is recorded honestly in RESULTS (command
  + output) rather than skipped silently.

### Sense-testing, wall numbers, villager behaviour

- SENSE-TESTING LAW: quote at least 1 kept racks-full line
  verbatim with day/seed/cook/kcal from the R corpus, plus 1
  reminder voice quoted with its preceding silence (days
  since the last voice on that seed) and 1 silenced case
  described from detail arrays, and judge meaning: does the
  reminder still read as the same true complaint returning
  after a week, and does the silenced case deserve silence?
- WALL NUMBERS on the pilot corpus: national / table / wins,
  wave 1-5 reach, median survival. NOTE: table = win flag,
  and SEATDRIVE=0 makes the table unreachable by construction
  — table 0 here is a construction fact, not a scale-wall
  finding.
- VILLAGER-BEHAVIOUR SAMPLE: which cooks speak under R vs B
  (does the per-cook memory change who speaks? does the
  first-complaint rule still favor the earliest-duty cook?),
  and whether worked lines still interleave with complaints
  on the same seed.

### Metric review (filled after the verdict, §14 — revisions apply to the NEXT run, this verdict is NOT re-scored)

- See the "Metric review" subsection under RESULTS below.

### Scope

- Game change (only if pilot + confirm GO, then default-flipped
  per the landing rule): src/js/game.js cook branch reminder
  gate only. New files: scripts/sweep-reminder-b.js,
  scripts/analyze-reminder-b.js, scripts/test-reminder-b.js,
  evidence/2026-10-26/sim-reminder-b-corpus/ (per-seed files),
  evidence/2026-10-26/sim-reminder-b.md (this file). No push,
  no version bump, no live verification — committed on branch
  sim-reminder-b, pending coordinator merge.

---

## RESULTS (appended after the pre-registration above; verdict judged ONLY against the header)

CORPUS: evidence/2026-10-26/sim-reminder-b-corpus/, 48 files
(pilot 16: reminder-b-<B|R>-pd0-dg1-leadfeast-s9750..9757.json;
confirm 32: reminder-b-<B|R>-confirm-pd0-dg1-leadfeast-s9760..9775.json),
policy leadfeast, pd0, dg1, 100d death-aware horizon. B = gate B
baseline RE-SWEPT on current master (no old corpus cited as this
run's baseline); R = rule R (RACKSVOICE_REMINDER=1 during
measurement). CAP=1 throughout (say-capture installed); the
neutrality leg below is flagged-vs-unflagged on these same files,
so it is a same-corpus control, not a separate cap0 run — the
capture itself was proven neutral in prior arms (cap0 vs cap1
identical 8/8) and nothing in this arm touches the capture.

PROOF TESTS: node scripts/test-reminder-b.js — pilot 99 PASS /
0 FAIL (T1 18, neutrality leg 8, corpus + GO bars 73); confirm
179 PASS / 0 FAIL (T1 18, neutrality leg 16, corpus + GO bars
145). Analyzer: node scripts/analyze-reminder-b.js (pilot and
confirm modes agree with the proof tests on every bar).

### Verdict: PILOT GO and CONFIRM GO — rule R LANDS (default ON)

Pilot (seeds 9750-9757, B vs R on identical seeds):
- (primary) Coverage 100%: max voiceless racks-bound-day run
  <= 6 on every seed (worst: 9752 and 9753 at exactly 6, the
  boundary, never over); the pilot's single reminder-classified
  voice is preceded by exactly 6 voiceless days (schedule
  clean, 0 schedule violations). No voiceless run reaches 7.
- (guardrail) Band total R 149 <= B 230 (ratio 0.648);
  per-seed R <= B on 8/8 seeds (worst per-seed ratio 9756:
  19/22; best 9752: 13/37).
- Numerics identical 8/8 seeds (daysAlive, batches,
  resolutions, deaths, rank, national, waveReach, table/win).
  Worked == resolutions on every cell.
- Say totals unchanged 8/8 (captured cook-line say totals:
  171, 7, 118, 350, 143, 132, 131, 425 both arms); plain
  rises by exactly the silenced count on every seed.
- No seed loses all voice: every seed with B > 0 keeps R > 0
  (9751 has 0 in both — a village lost at day 31 that never
  filled its racks, not a loss).

Confirm (fresh seeds 9760-9775, B vs R on identical seeds):
- (primary) Coverage 100%: max voiceless run <= 6 on every
  seed (worst: 9763 and 9767 at exactly 6); both
  reminder-classified voices preceded by exactly 6 voiceless
  days (schedule clean, 0 violations).
- (guardrail) Band total R 290 <= B 430 (ratio 0.674);
  per-seed R <= B on 16/16 seeds.
- Numerics identical 16/16 seeds. Worked == resolutions on
  every cell.
- Say totals unchanged 16/16; plain rises by exactly the
  silenced count on every seed.
- No seed loses all voice (9761 and 9774 have 0 in both —
  villages lost before filling racks, not losses).

PER-SEED TABLE, pilot (seed: B -> R, reminders, max voiceless,
say B = say R):
- 9750: 19 -> 13, rem 0, maxV 3, say 171
- 9751: 0 -> 0, rem 0, maxV 0, say 7 (village-lost day 31)
- 9752: 37 -> 13, rem 1, maxV 6, say 118
- 9753: 49 -> 34, rem 0, maxV 6, say 350
- 9754: 25 -> 20, rem 0, maxV 2, say 143 (village-lost day 90)
- 9755: 10 -> 9, rem 0, maxV 1, say 132
- 9756: 22 -> 19, rem 0, maxV 1, say 131 (global)
- 9757: 68 -> 41, rem 0, maxV 3, say 425
Band: B 230, R 149, reminders 1.

PER-SEED TABLE, confirm (seed: B -> R, reminders, max voiceless):
- 9760: 32 -> 20, rem 0, maxV 4
- 9761: 0 -> 0, rem 0, maxV 0 (village-lost day 65)
- 9762: 55 -> 47, rem 0, maxV 3
- 9763: 47 -> 27, rem 0, maxV 6
- 9764: 35 -> 25, rem 0, maxV 3 (village-lost day 98)
- 9765: 16 -> 7, rem 0, maxV 5
- 9766: 37 -> 31, rem 0, maxV 3
- 9767: 61 -> 30, rem 2, maxV 6
- 9768: 8 -> 3, rem 0, maxV 5
- 9769: 21 -> 17, rem 0, maxV 1
- 9770: 14 -> 11, rem 0, maxV 3
- 9771: 28 -> 24, rem 0, maxV 2
- 9772: 34 -> 15, rem 0, maxV 4
- 9773: 19 -> 15, rem 0, maxV 2
- 9774: 0 -> 0, rem 0, maxV 0 (village-lost day 56)
- 9775: 23 -> 18, rem 0, maxV 2
Band: B 430, R 290, reminders 2.

Substrate note (named, not forced): the pilot B band total
230 reproduces the 1035Z re-swept B baseline (230) exactly —
this band is substrate-stable since 1035Z. The confirm B band
(430) differs from the gate-B confirm band (404) through
sibling policy changes since that corpus; the verdict rests on
this run's own paired B-vs-R corpora, not on matching old
numbers.

### The reminder, in the data (why this is not D again)

D's failure was global quiet: 25 racks-bound days on 9752 with
no voice at all. R answers exactly that failure mode and the
data shows it working, not just asserted:
- Pilot 9752: the old frozen exemplar run (12 racks-bound days
  at one figure, days 37-48) now reads: day 37 Theo change
  voice (17,033), days 38-43 silent (6 days), day 44 Theo
  REMINDER voice (17,033), days 45-48 silent (4 days), day 49
  figure changes (16,043) and the voice returns as a change.
  The village never goes more than 6 racks-bound days without
  hearing about the pile, and the reminder is the same true
  number coming back — not a new claim.
- Confirm 9767: a 20-day frozen run (days 36-55, all 47,678
  kcal) reads: day 36 Terrence initial voice, days 37-40
  silent, day 41 Sibusiso initial voice (a cook speaking the
  pile for the first time), days 42-47 silent (6 days),
  day 48 Terrence REMINDER, days 49-54 silent (6 days),
  day 55 Sibusiso REMINDER, day 56 the figure moves (46,765)
  and the voice returns as a change. Two reminders, both on
  schedule, alternating cooks — the rule re-times the voice
  rather than deleting it.
- Boundary discipline: 9753's 7-day frozen run (days 71-77 at
  52,547) speaks on day 71 and stays silent days 72-77 — six
  silent days, at but not over the line, and the run ends
  before a reminder is owed. 9768's 6-day frozen run behaves
  the same way. Short freezes stay silent; only freezes that
  would reach a 7th silent day are interrupted.
- Reminder volume is thin by design, and that thinness is
  reported, not hidden: 1 reminder in the pilot band, 2 in
  the confirm band. The mechanism fired on both bands (not
  vacuous), but most of R's reduction vs B comes from
  change-voice filtering (e.g. 9757: 68 -> 41 with zero
  reminders — every figure moved often enough that no
  7-silence stretch ever formed). A future arm that wants a
  louder reminder should change N, not re-score this one.

### Sense-testing (SENSE-TESTING LAW)

- Kept change voice, verbatim from the R corpus (9752 day 30,
  Mason): "🍲 Mason cooked for the haven — meals stretched.
  The racks are already full (17,191 kcal kept — more than the
  haven can eat before it turns), so Mason left the fresh pile
  for tonight's dinner instead of smoking it onto the rot
  pile." The kept voice still tracks the village: a new
  figure, spoken once, true at that moment.
- Reminder voice, verbatim from the R corpus (9767 day 48,
  Terrence — the corpus quotes array carries it): "🍲 Terrence
  cooked for the haven — meals stretched. The racks are
  already full (47,678 kcal kept — more than the haven can
  eat before it turns), so Terrence left the fresh pile for
  tonight's dinner instead of smoking it onto the rot pile."
  Read in context — the same 47,678 figure the village heard
  on day 36, returning after six silent racks-bound days —
  the line reads as a genuine "this still hasn't been dealt
  with," not as a repeat: the week of silence is what gives
  the return its meaning. The cook alternation (Terrence,
  then Sibusiso on day 55) also softens B's one-cook
  dominance on long freezes.
- Pilot reminder case, from detail arrays (9752 day 44, Theo,
  17,033 kcal, after silent days 38-43): the line itself is
  the same template with Theo's name and the 17,033 figure
  (the corpus quotes array carries only the first three and
  last R lines, so this one is reconstructed from the detail
  row + the game.js template, which the proof test's T1
  fixture matches in form — labeled as reconstructed, not
  quoted as captured).
- Silenced case that deserves silence (9757 day 34): B day 34
  is Miguel quoting 17,976 — the same figure R already spoke
  on day 33 — so R stays silent, and speaks again on day 36
  when the figure moves to 20,807. One silent day, same
  number, nothing lost: this is D's correct behavior kept,
  with R's reminder as the backstop for when such days pile
  up to seven.
- Worked lines still interleave: worked == resolutions on
  every cell of both bands (e.g. 9757: 52 worked lines under
  both B and R), and the worked-quote samples (first worked
  line per seed) are unchanged between arms — smoking work
  and racks-full voice remain two interleaved voices, not
  partitioned phases.

### Cook diversity under R vs B

R does not fix B's first-cook dominance where the first cook
never changes — 9757 stays all-Miguel under both arms (B 68,
R 41), because Miguel is first on duty every racks-bound day
and the per-cook memory is his. Where the first cook does
rotate, R spreads voice more honestly than B: 9767's frozen
run gives Terrence and Sibusiso each a reminder, and 9753
keeps Courtney 32 / Owen 2 (vs B 46 / 3) — the ratio is the
same shape, just quieter. The diversity question from 1035Z
remains open for villages with a single dominant first cook;
R neither claims nor delivers a fix there.

### WALL NUMBERS

Pilot corpus (B and R identical — voice never leaks into
state): national-or-better 7/8 (9756 global; 9751 village,
lost day 31), table 0/8, wins 0/8, wave-4 reach 3/8, wave-5
reach 0/8, median survival 100d capped, deaths 49.
Confirm corpus: national-or-better 14/16 (9761 and 9774
regional, village-lost), table 0/16, wins 0/16, wave-4 reach
6/16, wave-5 reach 0/16, median survival 100d capped, deaths
119. NOTE: table = win flag, and SEATDRIVE=0 makes the table
unreachable by construction — table 0 here is a construction
fact, not a scale-wall finding.

### Balanced panel (§15) and telemetry deviation check

- Panel attempt (honest, not fabricated): `node
  scripts/balance-panel.js` with no arguments errors
  "Error: --out <panel-directory> required" — the panel is a
  before/after runner that spawns its own sims under its own
  observer; it cannot ingest recorder corpora. No panel
  compare is attached and none is faked. The §15-equivalent
  instrument is the identical-seed B-vs-R paired table above
  (same observer, same seeds, only the reminder env differs),
  judged by the GO bars in the header.
- Telemetry check: `node scripts/telemetry-check.js --baseline
  <scale-wall.json> --current
  'evidence/2026-10-26/sim-reminder-b-corpus/*.json' --metrics
  national,table,wins,exiled` produced 3 LOUD lines (national
  12 -> 42 over n=48 files; table 16 -> 0; wins 16 -> 0).
  Adjudicated as the known regime/ingestion artifact class
  (same as 1035Z): the corpus is a SEATDRIVE=0 competent-only
  substrate (table/wins unreachable by construction), the
  file count double-counts each seed (B and R files), and
  recorder rows do not carry the checker's top-level
  table/wins keys the way the WINSEAT baseline does.
  Actuals: pilot national-or-better 7/8, confirm 14/16,
  table/wins 0 on both bands. Baseline NOT rolled. No
  investigation item.

### Landing: default flipped to R, verified by spot check

Per the pre-registered landing rule (pilot GO + confirm GO),
the default is now rule R: src/js/game.js's reminder branch
runs whenever RACKSVOICE_REMINDER is not '0' (including
unset and browser, where no process.env exists);
RACKSVOICE_REMINDER=0 restores gate B for regression testing.
RACKSVOICE_GATE=0 still restores the old per-cook rule above
both. The sweep script's env mapping was updated to the
post-flip semantics (unset/1 = R, 0 = B) with a comment
recording that the pilot/confirm corpora used the
measurement-phase mapping (unset = B, 1 = R) and were NOT
re-generated.
Spot check (post-flip, seeds 9752/9757, sweep stdout vs
corpus files, ignoring only the ms timing field): default
mode == R corpus exactly (keys + full racksFullDetail arrays
identical on both seeds: 9752 R 13, 9757 R 41) and
RACKSVOICE_REMINDER=0 == B corpus exactly (9752 B 37, 9757
B 68). SPOT-CHECK PASS. The proof tests were re-run after
the flip (they read the corpus files, which the flip does
not touch): pilot 99/0, confirm 179/0, unchanged.

### Metric review (§14 — revisions apply to the NEXT run, this verdict is NOT re-scored)

- The single-ratio guardrail (total R <= total B) worked
  where the 1035Z twin-ratio bars failed: because R voices
  are a subset of B voice days by construction, the guardrail
  is satisfiable and informative (it caught nothing because
  there was nothing to catch — the per-seed R <= B check is
  the load-bearing version, and it held 24/24 cells).
- The coverage operationalization held up: "max voiceless run
  <= N-1 plus reminders on schedule" is checkable, caught no
  violations, and the boundary cases (6-day silences on
  9753/9768 that correctly earn no reminder) prove the bars
  are not vacuous in the easy direction. But the reminder
  count (1 pilot, 2 confirm) is thin: a future reminder arm
  that wants to stress the reminder itself should
  pre-register a corpus with a long-freeze seed (9767's
  20-day run is the exemplar) rather than relying on a
  general band to produce one.
- The non-vacuity report clause worked as designed: it
  forced the reminder count into the open instead of letting
  a 100% coverage number imply a heavily exercised
  mechanism. Keep that clause for future voice arms.
- N=7 is now a landed constant, not a tuning knob: a future
  arm that wants N=5 or N=10 must pre-register it as a new
  arm with its own GO bars, not as a tweak to this one.
- Per-cook memory's known quirk is confirmed present but
  harmless here: a cook speaking a pile figure for the first
  time (Sibusiso day 41 on 9767) breaks a frozen silence
  without being a change or a reminder. The analyzer's
  three-way classification (initial/change/reminder) handles
  it, and the voiceless-run bound still holds. A future arm
  should keep the three-way split, not a two-way one.

### VILLAGE ASSESSMENT (plain words)

These villages are still well-fed to a fault — 7 of 8 pilot
villages and 14 of 16 confirm villages reached national
standing or better, and their cooks still spend the run
smoking food and then complaining that the racks are full.
What changed is the rhythm of the complaint. Under the old
rule the cook repeated the same number every single day for
weeks; now the cook says it when the pile actually changes,
holds their tongue while nothing changes, and — if a week
of racks-bound days goes by with the pile still sitting
there untouched — says it again, once, as a reminder that
the problem never went away. On the longest frozen stretch
in the confirm band, twenty days at the same number, the
village heard about it four times instead of twenty: the
first mention, a new cook mentioning it once, and two
reminders a week apart. The two villages that died early
never filled their racks at all, and their silence is
honest — there was nothing to complain about. The cooks
still do all their smoking work; the work lines and the
complaint lines still weave together. The complaint is
quieter now, but it no longer goes quiet forever — and that
was the whole point.

### Blanks filled or documented

Filled: the frozen-stretch reminder design named in the 1035Z
metric review is now measured on two bands (pilot GO,
confirm GO) and LANDED as the default voice rule
(RACKSVOICE_REMINDER=0 restores gate B). The D failure mode (global
quiet) is answered in data, not just in design: max
voiceless racks-bound-day run 6 on both bands, reminders on
schedule on both bands.
Documented (next blanks, in order): (1) cook-diversity on
single-first-cook villages (9757 all-Miguel under both B and
R) — R does not fix it; (2) reminder volume is thin (3
reminders across 24 seeds) — a future reminder-stress arm
should pre-register a long-freeze seed band around the 9767
exemplar; (3) plain-silenced indistinguishability (a player
still cannot tell a swallowed complaint from a quiet cooking
from the log alone — the plainvoice split exists only in
corpus tags); (4) P-RACKS-NOELIG still unmeasured on leaner
policies; (5) N=7 is landed — any other N is a new arm.

### CONVERGENCE STATE for this axis (reminder voice)

food-economy stays converging (NOT converged): a third voice
mechanism is now measured truth and landed (plain split
complete, cross-day gate killed with a diagnosed metric
failure, reminder landed on pilot + confirm GO), but the
scale wall is untouched by this axis and the cook-diversity
and plain-display blanks above remain open.

### Scope compliance

Changed/added: src/js/game.js (reminder gate, default ON,
RACKSVOICE_REMINDER=0 restores gate B),
scripts/sweep-reminder-b.js, scripts/analyze-reminder-b.js,
scripts/test-reminder-b.js, scripts/split-reminder-b.js,
evidence/2026-10-26/sim-reminder-b-corpus/ (48 files),
evidence/2026-10-26/sim-reminder-b-sweep-B/R/B-confirm/
R-confirm.log + .err (stdout carriers),
evidence/2026-10-26/sim-reminder-b.md (this file). No push,
no version bump, no live verification — committed on branch
sim-reminder-b, pending coordinator merge.

