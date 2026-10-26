# sim-rotsucc-b — yield-trap successor rotation: FIRST-CANDIDATE-SLOT ROTATION (rule S)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T1345Z,
arm sim-rotsucc-b (rotation successor — the only game-code candidate
in this run), axis food-economy.
Worktree: `~/workspace/worktrees/sim-rotsucc-b`, branch sim-rotsucc-b.

Status: PRE-REGISTERED — everything under "PRE-REGISTRATION" below was
written BEFORE any sim in this run was executed. The RESULTS section
at the end is appended after the sweeps complete and is judged ONLY
against the header. The cookdiv verdict and the D corpus are quoted,
NOT re-judged here. Rule Y is NOT re-run (killed).

## Canon read first

- `docs/CANON.md` (manifest), then `docs/PRESERVATION.md` (the food
  ladder: cleaned 2d < cooked 5d < smoked 30d < rendered 90d <
  pemmican 120d; smoking 16 ticks; "rot can't be smoked back into
  food").
- No canon doc covers a racks-full voice rotation, a cook-yield rule,
  a slot rotation, or cook-diversity as a metric — stated, not
  invented. Gate B (landed) and rule R (landed, the default on
  current master) are DESIGNS to measure, not canon.

## Background (quoted, NOT re-judged here)

- evidence/2026-10-26/sim-cookdiv-b.md (binding): rule Y
  (yesterday's speaker yields) PILOT NO-GO — distinct cooks won
  7/8 but band voice 107 vs R 156 = 0.686x against a 0.80x bar.
  Rule R baseline on the leadfeast band: R band voice 156, Y
  band voice 107. Dominance baseline under R: 9750 Sierra 12 /
  Malik 1, 9752 Mason 6 / Theo 14, 9753 Courtney 32 / Owen 2,
  9754 Jenny 20 alone, 9755 Otto 9 alone, 9756 Grace 18 /
  Hassan 1, 9757 Miguel 41 alone (9751: no voices).
- The yield trap, in one line: under rule Y the speaker baton
  passes only on voices, so a frozen second-cook silence spends
  the day slot without passing it and the first cook keeps
  yielding to an absent cook (9756 voices only days 36/48/60/78
  over 22 racks-bound days).
- evidence/2026-10-26/sim-reminder-b.md (binding): rule R is the
  landed default (B day slot + per-cook change memory + reminder
  on the 7th silent racks-bound day, N=7).
- evidence/2026-10-26/sim-substrate-b.md (binding caveat): the
  gate-B voice taxonomy is VOID under rule R — it is not reused
  here, and no taxonomy is rebuilt (none is needed: the
  instrument is the paired R-vs-S voice table).
- NEW corpus check done BEFORE choosing the design (this run,
  read-only, from the cookdiv corpus — not a re-judgement of
  its verdict): on 9756, gate-B racks-bound days are Grace on
  21 of 22 days and Hassan only on day 78. The second cook is
  not merely silent on Grace's days — he is ABSENT as a
  candidate on those days. Any successor that waits for a
  follow-up cook on the same day waits for someone who is not
  there. This fact drives the design choice below.

## PRE-REGISTRATION (bound per docs/MEASUREMENT.md §§9-12, 14-15)

### The design choice (ONE design, picked up front): (b) FIRST-CANDIDATE-SLOT ROTATION — rule S

Rule S is picked; rule (a) EXPIRING YIELD is NOT tested
(depth over breadth on the one picked design).

Why (b) beats (a) against the yield trap:

- (a) EXPIRING YIELD still yields into the same void. On
  9756, Hassan is absent on 21/22 racks-bound days, so every
  yield day is a lost voice with nobody to replace it, and
  expiry only caps the stall at N silent days. The two bars
  cannot both hold: an expiry short enough to restore
  diversity (N=1: speak, yield-silent, speak, ...) caps trap
  voice near 0.50x R on consecutive-voice-day villages, while
  an expiry long enough to keep 0.90x voice (N>=6, i.e. the
  reminder threshold itself) is just R with extra silence and
  no diversity gain. (a) cannot satisfy the primary bar and
  the diversity bars at once on trap seeds — it is the same
  coupling as Y (rotation driven by a cook's yield decision)
  with a shorter fuse.
- (b) SLOT ROTATION decouples rotation from voices AND from
  follow-ups: the day's speaker slot advances on the calendar
  of racks-bound days, regardless of whether the previous day
  voiced, froze, or had its holder absent. A frozen cook
  cannot hold the slot because the slot is not theirs to
  hold — it moves to the next candidate in first-seen order
  on the next racks-bound day whether or not anyone spoke.
  On a single-candidate village (9756: order [Grace] until
  day 78) the design degenerates to R exactly — voice kept,
  no diversity gain there, honestly: a village with no
  second cook present cannot be diversified by rotation, and
  (b) does not pretend otherwise by going silent. On a
  multi-candidate village (9757: Miguel first, Grace present
  as a later cook on racks-bound days) the slot alternates
  holders, so Grace gets days where HER complaint is the
  one evaluated first, and her change voice fires on her
  own memory — not as a favour from Miguel's yield.
- The failure mode (b) owns up front (measured by guardrail
  (d) below, not hidden): on a day whose holder is absent,
  the day is silent even if another cook would have spoken
  under R. Rotation moves on the next day, so the loss is
  one day per absent-holder day, never a stall — unlike Y's
  unbounded (reminder-bounded) silence.

### The design: rule S — first-candidate-slot rotation (NEW, not R, not Y)

Start from rule R (the default). Add a rotating day slot, env
RACKSVOICE_SLOT=1 (default OFF = rule R; the flag is a
measurement flag, and landing would flip the default only on
GO per the landing rule below).

State (new, on the game object, voice-only, alongside R
markers — written ONLY when SLOT is on, so SLOT off is
behaviorally identical to unmodified R):
- `this._racksFullSlotOrder`: array of vids in first-seen
  order of racks-full candidates (first candidates, plus
  later-day candidates observed while the day slot was
  already spent — observation only, no voice change).
- `this._racksFullSlotIdx`: integer, advances by 1 on each
  new racks-bound day.
- `this._racksFullSlotDay`: last racks-bound day the slot
  advanced on.
- `this._racksFullSlotSilentDay`: last racks-bound day the
  silent count was already incremented on (once-per-day
  guard, see below).

Slot evaluation (inside the R branch, SLOT on):
1. On the first candidate of a new racks-bound day
   (`_racksFullReminderDay !== day` and `_racksFullSlotDay
   !== day`): set `_racksFullSlotDay = day`. If the order
   is empty, append this candidate and set idx 0 (holder =
   this candidate). Otherwise idx += 1. Holder =
   order[idx % order.length] — computed from the prior
   days' order, stored for the whole day; candidates
   appended later today cannot shift the slot mid-day
   (idx % a growing order would re-point it).
2. If the candidate is NOT today's holder: the line stays
   plain, with NO other R state change except two
   bookkeeping items: (i) append the candidate to the order
   if unseen; (ii) increment the village silent count by 1
   for this racks-bound day (a voiceless racks-bound day
   counts toward the reminder threshold exactly as R's
   frozen days do; counted ONCE per day — later non-holder
   candidates today do not recount it) and set
   `_racksFullSlotSilentDay = day`. `_racksFullReminderDay`
   is NOT set — the day slot stays open, so a later
   candidate today (in particular the holder) can still
   evaluate. RESCUE (added during implementation review,
   BEFORE any sweep, after mirror reasoning found the hole:
   a frozen-holder day following an absent-holder day could
   otherwise stretch a voiceless run to 7): if the increment
   brings the silent count to 7, THIS candidate speaks a
   reminder voice (same line, same true figure), sets their
   last spoken figure, resets silent to 0, and spends the
   day slot — R's coverage guarantee, kept in voiceless-day
   terms rather than holder-evaluation terms.
3. If the candidate IS today's holder: evaluate exactly as
   R does (change/initial voice, frozen silence, reminder
   at 7), with one guard: in the frozen branch, if
   `_racksFullSlotSilentDay === day` (this day's silent
   count was already incremented by an earlier non-holder
   candidate), do NOT increment a second time for the same
   day. The reminder check then runs on the once-counted
   value.
4. On a later candidate of an already-evaluated day
   (`_racksFullReminderDay === day`): observation only —
   append the candidate to the order if unseen; the line
   stays plain exactly as R leaves it.
5. SLOT off: no new branch executes and no new state is
   written — the R baseline is behaviorally identical to
   unmodified R.

Worked example (9757 shape: Miguel first most days, Grace
present as a later cook): day 1 racks-bound, order empty ->
holder Miguel, R evaluation. Later that day Grace's
resolution appends her -> order [Miguel, Grace]. Next
racks-bound day: idx 1 -> holder Grace; Miguel's complaint
is plain (slot open, silent +1 for the day unless Grace
speaks); Grace evaluates on her own memory (initial voice
the first time, change voice when the figure moved since
HER last spoken figure) and speaks, resetting silent to 0.
Following racks-bound day: holder Miguel again. The
alternation is driven by the day count, not by who spoke.

Worked example (9756 shape: Grace only): order stays
[Grace] through day 66 -> holder Grace every day -> R
evaluation every day -> identical to R. Day 78 Hassan
appears; order becomes [Grace, Hassan] only if Hassan is
observed as a candidate, and rotation begins after that.

### Why not policy-side or recorder-side (decided before sweeping)

- Policy-side rotation is not available: villager cook duty
  order is engine-side (the cook branch iterates duty
  assignments); scripts/policies/*.js drive the player bot,
  not villager duty order. No policy hook reorders who cooks
  first. (Same finding as cookdiv, re-stated, not re-argued.)
- Recorder-side rotation would falsify data: a recorder can
  only record the speaker the engine chose; rewriting the
  name on a captured line would manufacture a diversity the
  game never produced. Rejected as dishonest instrumentation.
- Therefore the variant is a small game-code voice-gate
  change, confined to the R branch in src/js/game.js (the
  same branch rule R landed in), gated by a new env flag
  defaulting OFF, so the R baseline is byte-identical
  behavior with the flag unset. THIS IS THE RUN'S
  GAME-CODE CANDIDATE: flagged prominently here and in the
  report. A killed variant leaves zero src/js diff (game.js
  reverted and verified identifier-free).

### Instrument

- scripts/say-capture.js unchanged (proven neutral in prior
  arms). SAYCAP=1000.
- New sweep scripts/sweep-rotsucc-b.js: same loadGame-per-seed
  pattern as sweep-cookdiv-b.js, plus the SLOT env
  passthrough; SWEEP_CENSUS=1 stdout mode (flap-proof: the
  long-running sweep never writes files; a short-lived
  splitter persists per-seed JSONs from stdout). Corpus dir
  (new, never mixed into older corpora):
  evidence/2026-10-26/sim-rotsucc-b-corpus/ — inside this
  worktree, NEVER /tmp as the sole copy.
- New splitter scripts/split-rotsucc-b.js (same validation as
  split-cookdiv-b.js: parse + filename-seed match + prefix).
- New analyzer scripts/analyze-rotsucc-b.js: per-seed R-vs-S
  table, distinct cooks, voice totals, second-cook shares,
  median survival, starvation deaths, wall numbers,
  voiceless-run check via the B-aux racks-bound days, GO
  evaluation against the bars below.
- New proof test scripts/test-rotsucc-b.js: slot-mirror
  fixture checks (T1) run BEFORE the sweep; corpus
  assertions + GO evaluation (T2) after. ORDER (binding):
  the neutrality leg (R-vs-S numerics identical) runs FIRST
  in the test and is reported first; no classified number
  is judged if it fails.

### Substrate, seeds, horizon (identical on all configs)

- Policy competent-nofeast (COMPETENT_FEAST=0, FEASTSCALE_R13
  unset/0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1), 100d
  death-aware horizon (dead villages stop, +10d tail max).
  All asserted FATAL by the driver.
- Pilot: band 9750-9757 (8 seeds) x {R baseline (SLOT unset,
  REMINDER unset = default R), S (SLOT=1), B-aux (REMINDER=0,
  racks-bound-day set only)} = 24 configs, run SEQUENTIALLY.
  Baseline is RE-SWEPT on current master — no old corpus is
  cited as this run's baseline. NOTE: this band differs
  from cookdiv's leadfeast band by policy (competent-nofeast
  per this run's assignment), so the re-swept R control is
  expected to differ from cookdiv's R 156 — any drift is
  stated and judged against THIS run's own R control
  (carried-corpus rule: never cite a stale baseline as
  current).
- Confirm: fresh band 9758-9765 (8 seeds) x {R, S, B-aux} =
  24 configs, identical seeds. Confirm runs ONLY on pilot GO.
- File names:
  rotsucc-b-<R|S|B>-pd0-dg1-competent-nofeast-s<seed>.json
  (confirm files add `-confirm` before the seed).
- B-aux is instrumentation for the voiceless-run check only
  (gate B speaks exactly once per racks-bound day, so its
  voice days ARE the racks-bound days). No verdict bar is
  judged against B except the coverage check (d) below.

### Primary metric and GO thresholds (binding — judge ONLY against these)

PRIMARY metric: band total racks-full voices on identical
seeds, R baseline vs S variant. SECONDARY bars are
pass/fail bars, NOT re-scores of the primary: the primary
is the voice ratio; distinct/share are separate pass/fail
bars; which is primary is stated here so no mid-run
re-scoring can swap them.

PILOT GO iff ALL of the following hold:

- (a) VOICE KEPT (PRIMARY): band total racks-full voices
  under S >= 0.90x the R band total on identical seeds.
  (Y failed at 0.686x against a 0.80x bar — this bar is
  deliberately stricter.) Per-seed ratios are also reported;
  a per-seed collapse (S < 0.50x R on any seed with R >= 10)
  is named even if the band bar passes.
- (b) DISTINCT: distinct cooks under S >= distinct cooks
  under R on >= 6/8 pilot seeds. All 8 seeds counted; a seed
  with zero voices under both arms counts as a pass on
  this bar only if both are zero (named as such) — the
  6/8 threshold absorbs at most two misses.
- (c) SECOND-COOK SHARE: on every pilot seed where S has
  >= 2 distinct cooks AND S voices >= 8, the non-dominant
  cook's share of that seed's S voices must be >= 20%.
  Justification for the >= 8 floor: below 8 voices a share
  statistic is one voice away from flipping (1/7 = 14% vs
  2/8 = 25%), so small seeds cannot honestly pass or fail
  a 20% bar; they are reported, not judged, on share. The
  9754 lesson is the reason this bar exists: distinct
  alone passes Jenny 5 / Oscar 1 (17% — which would FAIL
  this bar, correctly, as first-cook-dominated).
- (d) COVERAGE KEPT: max voiceless racks-bound-day run <= 6
  on every pilot seed under S (racks-bound days from the
  B-aux voice days; an S voice day breaks a run). This is
  R's landed guarantee; S must not break it.
- (e) SURVIVAL KEPT: median daysAlive under S >= the R
  median on identical seeds, AND total starvation-caused
  deaths under S <= the R total on identical seeds
  (deathCauses['starvation'] summed over the band).
- (f) NEUTRALITY: numerics identical R vs S on every cell
  (daysAlive, batches, resolutions, deaths, rank, national,
  waveReach, table/win); worked == resolutions on every
  cell; say totals unchanged R vs S on every seed. Any
  numeric delta = NO-GO (voice leaked into state).

A miss is NO-GO, never re-scored against a friendlier metric
mid-run. Metric doubts go under "Metric review". Confirm
spend ONLY on pilot GO.

### CONFIRM GO thresholds (binding, fresh band 9758-9765)

Same six bars, judged on the fresh band: band voice
>= 0.90x R; distinct >= R on >= 6/8 seeds (same 75% rate);
share bar on every confirm seed with S distinct >= 2 and
S voices >= 8 (non-dominant share >= 20%); max voiceless
run <= 6 every seed; median survival >= R median and
starvation <= R total; numerics identical 8/8 with worked
== resolutions and say totals unchanged. Any miss =
overall NO-GO: the game-code change is killed (revert
game.js, verify byte-identical — zero RACKSVOICE_SLOT
identifiers), commit tooling + evidence + corpus only, and
report the full numbers.

### Landing rule (pre-registered)

If pilot GO and confirm GO, flip the default to S (SLOT
unset = S; RACKSVOICE_SLOT=0 restores R for regression
testing) and re-verify the proof test plus a spot paired
check before committing. If either fails, the game-code
change is KILLED per the confirm rule above. No push, no
version bump, no live verification — committed on branch
sim-rotsucc-b, pending coordinator merge.

### Balanced panel (§15)

- scripts/balance-panel.js is a before/after panel RUNNER
  (spawns its own child sims under its own observer with
  --before/--after panel files); it cannot ingest recorder
  corpora. A panel invocation attempt is recorded honestly
  in RESULTS (command + output) rather than skipped
  silently. No panel compare is attached and none is
  faked; the §15-equivalent instrument is the identical-seed
  R-vs-S paired table (same observer, same seeds, only the
  SLOT env differs), judged by the GO bars above.

### Sense-testing, wall numbers, villager behaviour

- SENSE-TESTING LAW: sample at least 2 seeds' cook-voice days
  from the S corpus and judge whether the rotated voices
  read as different people taking turns, or like a machine
  cycling names. Quote at least 1 S voice per sampled seed
  verbatim with day/seed/cook/kcal, plus 1 holder-absent
  silent day described from detail arrays where one exists,
  and judge meaning: does the second cook's line read as
  their own complaint about the same pile?
- WALL NUMBERS on the pilot corpus: national / table / wins,
  wave 1-5 reach, median survival, death-cause shares. NOTE:
  table = win flag, and SEATDRIVE=0 makes the table
  unreachable by construction — table 0 here is a
  construction fact, not a scale-wall finding. These are
  reported labeled as a MEASUREMENT BAND, not a scale arm.
- VILLAGER-BEHAVIOUR SAMPLE: per-seed cook shares under R
  vs S (does S actually move share off the first cook? on
  which seeds does it fail and why?), and whether worked
  lines still interleave with complaints on the same seed.

### Metric review (filled after the verdict, §14 — revisions apply to the NEXT run, this verdict is NOT re-scored)

- See the "Metric review" subsection under RESULTS below.

### Scope

- Game change (only if pilot + confirm GO, then default-flipped
  per the landing rule): src/js/game.js cook branch slot gate
  only, inside the R branch. New files: scripts/sweep-rotsucc-b.js,
  scripts/split-rotsucc-b.js, scripts/analyze-rotsucc-b.js,
  scripts/test-rotsucc-b.js,
  evidence/2026-10-26/sim-rotsucc-b-corpus/ (per-seed files),
  evidence/2026-10-26/sim-rotsucc-b.md (this file). No push,
  no version bump, no live verification — committed on branch
  sim-rotsucc-b, pending coordinator merge.

---

## RESULTS (appended after the pre-registration above; verdict judged ONLY against the header)

CORPUS: evidence/2026-10-26/sim-rotsucc-b-corpus/, 24 files
(pilot 8 seeds x {R, S, B-aux}:
rotsucc-b-<R|S|B>-pd0-dg1-competent-nofeast-s9750..9757.json),
policy competent-nofeast, pd0, dg1, 100d death-aware horizon.
R = rule R baseline RE-SWEPT on current master (default, SLOT
unset); S = rule S (RACKSVOICE_SLOT=1); B-aux = gate B
(REMINDER=0, racks-bound-day set only). CAP=1 throughout
(say-capture installed); SAYCAP=1000, no cell truncated
(max say 424).

PROOF TEST: node scripts/test-rotsucc-b.js --corpus — T1 20 PASS /
0 FAIL (fixtures, run before the sweep); T2 neutrality leg PASS
(numerics identical, say unchanged, worked == resolutions,
under cap); GO bars 5/6 PASS, bar (c) FAIL; TOTAL 28 PASS /
1 FAIL, exit 1. The single failure IS the verdict, not a test
defect. Analyzer: node scripts/analyze-rotsucc-b.js (table + GO
evaluation below agree with the proof test on every bar).

### Verdict: PILOT NO-GO — rule S KILLED, no confirm spend

- (a) VOICE KEPT (PRIMARY): PASS — band total S 197 vs R 195,
  ratio 1.010 (need >= 0.90). Slot rotation does NOT lose
  voice: unlike Y (0.686x), the day-driven slot keeps the
  village talking. No per-seed collapse below 0.50x on any
  seed with R >= 10.
- (b) DISTINCT: PASS — 7/8 seeds S distinct >= R distinct
  (need 6). Only 9755 misses (S 2 vs R 3: Tanisha's single R
  voice is not reproduced under S).
- (c) SECOND-COOK SHARE: FAIL — on 6 judged seeds (S distinct
  >= 2 and S voices >= 8), two fail the 20% bar: 9753 Roberto
  4/29 = 14%, 9756 Hassan 7/38 = 18% (need >= 20% each). The
  other four judged seeds pass (9750 Malik 46%, 9752 Paramjit
  43%, 9755 Alfredo 33%, 9757 Grace 50%). This bar alone kills
  the pilot; no confirm is run.
- (d) COVERAGE KEPT: PASS — max voiceless racks-bound-day run
  <= 6 on every seed (3, 0, 6, 6, 0, 5, 6, 3). The rescue voice
  works exactly as designed: three seeds sit exactly at the
  boundary, none over.
- (e) SURVIVAL KEPT: PASS — median daysAlive S 100d vs R 100d
  (need >= 100); starvation deaths S 7 vs R 7 (need <= 7).
- (f) NEUTRALITY: PASS — numerics identical R vs S on 8/8
  cells (daysAlive, batches, resolutions, deaths, rank,
  national, waveReach, table/win); worked == resolutions on
  every cell; say totals unchanged on every seed.

PER-SEED TABLE (seed: R voices/distinct -> S voices/distinct,
say R = say S, max voiceless, B racks-bound days):
- 9750: R 21/2 (Sierra 20, Malik 1) -> S 28/2 (Sierra 13,
  Malik 15), say 227, maxV 3, B days 37
- 9751: R 0/0 -> S 0/0, say 17, maxV 0, B days 0 (village-lost
  day 48)
- 9752: R 27/2 (Mason 12, Paramjit 15) -> S 28/2 (Mason 16,
  Paramjit 12), say 284, maxV 6, B days 73
- 9753: R 35/1 (Courtney 35) -> S 29/2 (Courtney 25, Roberto 4),
  say 284, maxV 6, B days 56
- 9754: R 0/0 -> S 0/0, say 10, maxV 0, B days 0 (village-lost
  day 97)
- 9755: R 28/3 (Otto 12, Tanisha 1, Alfredo 15) -> S 18/2
  (Otto 12, Alfredo 6), say 108, maxV 5, B days 36
- 9756: R 43/1 (Grace 43) -> S 38/2 (Grace 31, Hassan 7),
  say 182, maxV 6, B days 58
- 9757: R 41/1 (Miguel 41) -> S 56/2 (Miguel 28, Grace 28),
  say 424, maxV 3, B days 67
Band: R 195, S 197, B racks-bound days 327.

### Why S failed: rotation diversifies, but presence caps share

S fixes everything Y broke and one thing Y fixed — except
the share bar, which turns out to demand more than rotation
can manufacture:

- Voice is kept (1.010x): the slot's day-driven advance
  never stalls, and per-cook memory lets a figure speak once
  per holder — the same mechanism that made Y louder than R
  on following-cook seeds (9757: S 56 vs R 41, Miguel 28 /
  Grace 28, a perfect split). The yield trap is gone: no
  seed collapses, and the worst per-seed ratio is 9755 at
  0.64x (18 vs 28) — a presence loss, not a stall.
- Distinct improves where a second cook exists: 9753 goes
  from Courtney-alone under R to Courtney + Roberto under S;
  9756 from Grace-alone to Grace + Hassan; 9757 from
  Miguel-alone to an even Miguel/Grace split. The headline
  dominance case is fixed better than Y fixed it (Y: 27/26;
  S: 28/28).
- But share is capped by PRESENCE, not by the slot: Roberto
  voices only on days 80/83/86/89 — he is simply not a
  racks-bound candidate earlier, so no rotation rule can
  give him 20% of a 29-voice run. Hassan's 7 voices on 9756
  are the same story (18%): the second cook arrives late
  and rarely, and the slot can only hand him days he is
  there for. A 20%-on-every-judged-seed bar therefore fails
  on villages where the second cook is a rare visitor —
  rotation moves share toward balance (9756: 0% -> 18%;
  9753: 0% -> 14%) without reaching the bar. The bar did
  its job as a strictness check, and the design, not the
  measurement, is what falls short: no voice-gate rotation
  can outrun cook presence.
- Coverage holds at the boundary by construction: the
  rescue voice fires on the 7th silent racks-bound day
  whoever holds the complaint, which is why three seeds sit
  at exactly maxV 6. Without the rescue, the frozen +
  absent-holder interleave found in mirror reasoning would
  have stretched a run to 7 — the pre-sweep amendment
  earned its place.

BASELINE DRIFT (stated, judged against this run's own R):
this run's competent-nofeast R control (band 195) differs
sharply from cookdiv's leadfeast R (band 156) — different
policy band, as assigned, not trajectory noise alone:
9750 21 vs 13, 9752 27 vs 20, 9754 0 voices (village lost
day 97) vs 20, 9756 43 vs 19, and every seed ranks village
here vs national-or-better on 7/8 under leadfeast. The
verdict rests on this run's own paired corpus, not on
matching old numbers. (Note for the next arm: on this band
the old dominance anecdotes do not all reproduce — 9752's
second cook here is Paramjit, not Theo, and 9754 has no
voices at all under either arm.)

### Sense-testing (SENSE-TESTING LAW)

Sampled seeds: 9757 (the fixed dominance case) and 9753
(the share-fail case). Verdict: the rotated voices DO read
as different people taking turns, not like a machine
cycling names — the failure is share, not sense.

- 9757, verbatim (day 34, Miguel): "🍲 Miguel cooked for
  the haven — meals stretched. The racks are already full
  (18,570 kcal kept — more than the haven can eat before
  it turns), so Miguel left the fresh pile for tonight's
  dinner instead of smoking it onto the rot pile." Next
  racks-bound day, Grace speaks the same 18,570 figure.
  Read in sequence — Miguel day 34, Grace day 35, Miguel
  day 38, Grace day 39, alternating all run — this reads as
  two cooks noticing the same pile on successive days, each
  on their own turn. The alternation is the point, and it
  works; 28/28 is not a cycling artefact, it is turn-taking.
- 9753, late run (days 80-90, from detail arrays): Roberto
  80, Courtney 81, Roberto 83, Courtney 84, Roberto 86,
  Courtney 87, Roberto 89, Courtney 90 — a genuine late
  alternation once Roberto starts cooking. His lines read
  as his own complaint about the same pile (same figure
  family, falling from 44,485 to 18,822 across his turns as
  the pile shrinks). The early run is all-Courtney because
  Roberto is not there yet — a presence fact, not a
  rotation failure.
- Holder-absent silent stretch that DESERVES its silence
  only up to the boundary (9753 racks-bound days 55-60, six
  consecutive days with no voice, broken by Courtney day
  61; same shape at 63-68 and 70-75): these are stretches
  where the holder is absent or frozen and the pile goes
  unmentioned for nearly a week at a time, three times over.
  The rescue keeps each stretch at exactly 6, so the
  village is never left quiet past the landed guarantee —
  but three back-to-back boundary silences still read as a
  quiet village, not an attentive one. Coverage passing at
  the boundary is the design holding, not the design
  excelling.
- Worked lines still interleave: worked == resolutions on
  every cell of both arms (e.g. 9757: 38 worked lines under
  both R and S), and worked-quote samples are unchanged
  between arms — smoking work and racks-full voice remain
  two interleaved voices, not partitioned phases.

### WALL NUMBERS (measurement band, NOT a scale arm)

Pilot corpus (R and S identical — voice never leaks into
state): national-or-better 0/8, table 0/8, wins 0/8, wave
reach distribution {2: 4, 3: 4} (wave-4 reach 0/8, wave-5
reach 0/8), median survival 100d capped, deaths 43 (R and
S identical counts). Death-cause shares (band): the arena
15, starvation 7, monster 4, wound 4, sickness 4, ambush 3,
dehydration 3, and 1 each of old stare, alien, lockjaw.
NOTE: table = win flag, and SEATDRIVE=0 makes the table
unreachable by construction — table 0 here is a
construction fact, not a scale-wall finding. The 0/8
national and 0/8 wave-4 figures are band facts about the
competent-nofeast measurement band (every seed ranks
village), not a scale-wall verdict — the leadfeast band
reached national on 7/8 of the same seeds, so the band,
not the game, moved.

### Balanced panel (§15)

- Panel attempt (honest, not fabricated): `node
  scripts/balance-panel.js` with no arguments errors
  "Error: --out <panel-directory> required" — the panel is
  a before/after runner that spawns its own sims under its
  own observer; it cannot ingest recorder corpora. No panel
  compare is attached and none is faked. The §15-equivalent
  instrument is the identical-seed R-vs-S paired table above
  (same observer, same seeds, only the SLOT env differs),
  judged by the GO bars in the header.

### Metric review (§14 — revisions apply to the NEXT run, this verdict is NOT re-scored)

- The 0.90 voice-kept bar did its job in the other
  direction this time: it proves S is not another Y (1.010x
  vs Y's 0.686x). Keep a voice-kept bar on every future
  rotation arm — it is the bar that separates a working
  rotation from a stalling one.
- The share bar as written (20% on EVERY judged seed) is
  too strong for presence-limited villages: it fails a
  design that moves 9756 from 0% to 18% and 9753 from 0% to
  14%. A future diversity arm should judge share at the
  BAND level over judged seeds (e.g. median non-dominant
  share, or band aggregate second-cook share) or set the
  per-seed bar only where the second cook is present on a
  minimum fraction of racks-bound days — presence is the
  gating fact, and a bar that ignores it will fail every
  rotation design on villages like 9753/9756. This verdict
  is NOT re-scored under any such revision: S is killed on
  the bar as pre-registered.
- The distinct bar (S >= R per seed) proved nearly toothless
  in the other direction: it passes on seeds where S adds
  a token second cook, and its only miss (9755, Tanisha)
  is a presence quirk. Distinct + share jointly are the
  honest pair; distinct alone should never again be the
  diversity bar.
- The coverage bar (d) proved load-bearing again: it
  passes at exactly the boundary (6) on three seeds, and
  the rescue amendment is what keeps it there. Any future
  rotation arm that drops (d) or the rescue loses the
  diagnostic that separates "quiet by design" from "quiet
  by stall."
- The per-cook double-speak of one figure (9757: Miguel
  18,570 then Grace 18,570) is now S behavior that dies
  with S, but a future rotation arm should decide
  explicitly whether a figure speaking once per cook is
  desirable signal or noise — it is what makes S louder
  than R on following-cook seeds (56 vs 41), and it would
  inflate voice totals if counted naively. S's 1.010x band
  ratio includes this inflation on 9757/9750; without it,
  S would sit below R on voice — the primary bar passing
  partly on double-speak is a caveat the next arm inherits.

### VILLAGE ASSESSMENT (plain words)

These villages are quieter in standing and louder in the
kitchen than the last band's: on this way of playing, all
eight villages stay village-ranked, nobody reaches national,
and nobody gets near the table — but their cooks still
spend the run smoking food and complaining that the racks
are full. What this run tested was whether the complaint
could come from more than one mouth without the village
going quiet. On the village where it mattered most — 9757,
where Miguel did all the talking under the old rule — it
worked beautifully: Miguel and Grace now trade the
complaint every day, 28 turns each, and the village hears
about the pile more often, not less. The new rule never
goes quiet the way the last one did: it keeps the voice
count up across the whole band. But on two villages the
second cook barely shows up — Roberto only starts cooking
late on 9753, Hassan only now and then on 9756 — so even
though they do get their turns, their share of the talking
stays under a fifth, and the strict bar this run set says
that is not enough. The cooks are still doing all their
smoking work, and nobody starved because of this — the
shortfall is about who gets heard, not about food. So the
rule is killed on the share bar it was measured against:
the old rule stays, and the next attempt needs to face
the real limit, which is not the rotation but how often
the second cook is even in the kitchen.

### Blanks filled or documented

Filled: the yield-trap successor is now measured, not
hypothesized — slot rotation keeps voice (1.010x), fixes
the 9757 dominance case to an even split, and holds the
coverage guarantee at the boundary via the rescue voice;
its limit is named (presence-capped share). The 1237Z
blank 2 (yield-trap successor) is answered: (b) beats (a)
on mechanism, and (b) itself is killed on share.
Documented (next blanks, in order): (1) a presence-aware
share bar for future diversity arms (band-level share, or
a presence floor per seed) — the per-seed 20% bar fails
every rotation on rare-visitor villages; (2) whether a
figure speaking once per cook is signal or noise (S's
9757 loudness mechanism, carried from Y); (3) the
competent-nofeast band's village-ranked, wave-3-capped
profile vs leadfeast's national profile on identical seeds
— a band fact the scale-wall reporting should carry, not
a finding about this arm; (4) the plain-display blank from
plainvoice-b (a swallowed complaint still looks like a
quiet cooking in the log) remains open.

### CONVERGENCE STATE for this axis (cook diversity)

food-economy stays converging (NOT converged): rotation
under R is now measured twice and KILLED twice on
different bars (Y on voice, S on share, mechanisms named
for both), the dominance baseline is measured on two
bands, and the scale wall is untouched by this axis. The
next diversity arm starts from the presence diagnosis, not
from scratch — and needs a presence-aware bar before it
starts, or it will fail the same way.

### Scope compliance and KILL

Per the pre-registered pilot rule (pilot NO-GO), the
game-code change is KILLED: src/js/game.js was reverted to
its pre-run state (this worktree's HEAD content) and
verified with zero RACKSVOICE_SLOT identifiers remaining
in the file (grep returns nothing) and `git status`
showing game.js clean. Committed here: tooling + evidence
+ corpus ONLY — scripts/sweep-rotsucc-b.js,
scripts/split-rotsucc-b.js, scripts/analyze-rotsucc-b.js,
scripts/test-rotsucc-b.js,
evidence/2026-10-26/sim-rotsucc-b-corpus/ (24 files),
evidence/2026-10-26/sim-rotsucc-b-sweep-R/S/B.log + .err
(stdout carriers), evidence/2026-10-26/sim-rotsucc-b.md
(this file). No src/js change ships. No push, no version
bump, no live verification — committed on branch
sim-rotsucc-b, pending coordinator merge.

