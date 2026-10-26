# sim-cookdiv-b — cook-diversity rotation under rule R (rule Y: yesterday's speaker yields)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261026T1130Z blank 1
+ open backlog item "cook-diversity as a voice metric",
axis food-economy, arm sim-cookdiv-b.
Worktree: `~/workspace/worktrees/sim-cookdiv-b`, branch sim-cookdiv-b.

Status: PRE-REGISTERED — everything under "PRE-REGISTRATION" below was
written BEFORE any sim in this run was executed. The RESULTS section
at the end is appended after the sweeps complete and is judged ONLY
against the header. The reminder-b and plainvoice-b corpora are quoted,
NOT re-judged here.

## Canon read first

- `docs/CANON.md` (manifest), then `docs/PRESERVATION.md` (the food
  ladder: cleaned 2d < cooked 5d < smoked 30d < rendered 90d <
  pemmican 120d; smoking 16 ticks; "rot can't be smoked back into
  food") and `docs/CONVERSATIONS.md` (dialogue sense bar, via the
  reminder-b read).
- No canon doc covers a racks-full voice rotation, a cook-yield rule,
  or cook-diversity as a metric — stated, not invented. Gate B
  (landed) and rule R (landed, the default on current master) are
  DESIGNS to measure, not canon. Rule Y below is a new design to
  measure, not canon.

## Background (quoted, NOT re-judged here)

- evidence/2026-10-26/sim-reminder-b.md (binding): rule R is the
  landed default (B day slot + per-cook change memory + reminder on
  the 7th silent racks-bound day, N=7). Pilot band 9750-9757 under R:
  B 230 -> R 149 voices. "R does not fix B's first-cook dominance
  where the first cook never changes — 9757 stays all-Miguel under
  both arms (B 68, R 41), because Miguel is first on duty every
  racks-bound day and the per-cook memory is his." Documented next
  blank (1): cook-diversity on single-first-cook villages.
- evidence/2026-10-26/sim-plainvoice-b.md (binding): plain-frame
  split at source on the same band (P-SILENCED 483, P-RES2PLUS 215,
  P-FIRST-NOSMOKE 202, P-RACKS-NOELIG 0, UNCLASSIFIED 0). On 9757,
  silenced lines pile up behind spoken complaints (231 silenced vs
  68 spoken under B) — Miguel 169 silenced, Grace 61, Kealan 1:
  Grace DOES cook on racks-bound days, after Miguel, and her
  complaints are the ones gate B swallows. That is the opening
  rule Y exploits: the second cook is present, just never first.
- The racks-full figure is a village fact, not a per-cook fact:
  the printed figure is Math.round(preservedKcal) over the shared
  pantry, identical whichever cook speaks it. Yielding the voice to
  another cook therefore loses no information — only the name on
  the line changes. (The per-cook rackCap differs by skill, but
  the printed kcal figure does not.)

## PRE-REGISTRATION (bound per docs/MEASUREMENT.md §§9-12, 14-15)

### Why not policy-side or recorder-side (decided before sweeping)

- Policy-side rotation is not available for this: villager cook
  duty order is engine-side (the cook branch iterates duty
  assignments); scripts/policies/*.js drive the player bot, not
  villager duty order. No policy hook reorders who cooks first.
- Recorder-side rotation would falsify data: a recorder can only
  record the speaker the engine chose; rewriting the name on a
  captured line would manufacture a diversity the game never
  produced. Rejected as dishonest instrumentation.
- Therefore the variant is a small game-code voice-gate change,
  confined to the R branch in src/js/game.js (the same branch
  rule R landed in), gated by a new env flag defaulting OFF, so
  the R baseline is byte-identical behavior with the flag unset.
- Overlap proof (read-only git, sibling worktrees never touched):
  at run start the sibling branches sim-w3rederive-a,
  sim-woundprice-a, sim-defnarr-a hold no commit beyond the shared
  base (all at ac98043a1, behind this worktree's master tip
  edbfeda03) and sim-substrate-b sits exactly at edbfeda03 — no
  sibling branch has any committed change to any file, so no
  committed sibling work overlaps the cook-gate region. (Uncommitted
  sibling worktree state is invisible to this run by rule and is
  not claimed about; the coordinator merges with rebase + proof
  re-run, which is the guard for it.)

### The design: rule Y — yesterday's speaker yields (NEW, not R)

Start from rule R (the default). Add a yield, env RACKSVOICE_ROTATE=1
(default OFF = rule R; the flag is a measurement flag, and landing
would flip the default only on GO per the landing rule below).

State (new, on the game object, voice-only, alongside R markers):
- `this._racksFullRotateLastSpeaker`: vid of the cook of the most
  recent R voice (initial, change, or reminder alike). Set whenever
  an R voice speaks under ROTATE.
- `this._racksFullRotateYieldDay`: the day a yield silencing
  happened (so a re-candidate by the same cook that day stays
  plain without recounting, and a later cook's frozen-silence that
  day does not double-count the day).

Yield evaluation (inside the R branch, on the first candidate of
a racks-bound day — i.e. when `_racksFullReminderDay !== day`):
1. Compute the candidate figure and the would-speak test exactly
   as R does: change/initial voice if this cook never spoke or
   the figure differs from this cook's last spoken figure;
   reminder voice if the figure equals this cook's last spoken
   figure and the silent count + 1 reaches 7.
2. If ROTATE is on AND the candidate would speak a CHANGE or
   INITIAL voice (reminders are the backstop and ALWAYS speak —
   yielding a reminder would break R's landed coverage guarantee)
   AND this cook is the last R speaker AND the silent count + 1
   is still < 7 (yield suspended at the reminder threshold, so a
   yielded run can never reach a 7th voiceless day) AND no yield
   has happened yet today:
   - YIELD: set `_racksFullRotateYieldDay = day`; increment the
     silent count by 1 (the day counts as a silent racks-bound day
     unless a later cook speaks, whose voice resets the count to
     0 as usual); do NOT set `_racksFullReminderDay` (the day slot
     stays open for the next cook); do NOT set
     `_racksFullVoiceDay`; the line stays plain.
3. Otherwise evaluate exactly as R does, with two ROTATE-only
   adjustments: (a) every R voice spoken sets
   `_racksFullRotateLastSpeaker` to its cook; (b) in the frozen
   branch, if a yield already happened today, the silent count is
   NOT incremented a second time for the same day.
4. Guard: if ROTATE is on and a yield already happened today and
   the same (last-speaker) cook candidates again, the line stays
   plain with no state change (no recount, no re-yield).
5. ROTATE off: no new branch executes and no new state is written
   — the R baseline is behaviorally identical to unmodified R.

Worked example (9757 shape: Miguel first, Grace second, both cook
most racks-bound days): day 1 Miguel speaks (initial). Day 2 Miguel
yields, Grace speaks (initial). Day 3 Miguel evaluates normally
(change voice if the figure moved since his day-1 figure, else a
frozen silence that spends the day slot as R does). Frozen days
keep R's first-candidate-spends-the-slot behavior — Y rotates the
VOICE, not the evaluation order — so on long freezes the first
cook still owns the reminder; Y's gain is concentrated on days
the first cook would have SPOKEN. That limit is stated here, not
discovered later: if the pilot's distinct-cook gain comes only
from change days, the evidence says so.

### Instrument

- scripts/say-capture.js unchanged (proven neutral in prior arms).
  SAYCAP=1000.
- New sweep scripts/sweep-cookdiv-b.js: same loadGame-per-seed
  pattern as sweep-reminder-b.js, plus the ROTATE env passthrough;
  SWEEP_CENSUS=1 stdout mode (flap-proof: the long-running sweep
  never writes files; a short-lived splitter persists per-seed
  JSONs from stdout). Corpus dir (new, never mixed into older
  corpora): evidence/2026-10-26/sim-cookdiv-b-corpus/ — inside
  this worktree, NEVER /tmp as the sole copy.
- New splitter scripts/split-cookdiv-b.js (same validation as
  split-reminder-b.js: parse + filename-seed match + prefix).
- New analyzer scripts/analyze-cookdiv-b.js: per-seed R-vs-Y
  table, distinct cooks, voice totals, median survival,
  starvation deaths, wall numbers, voiceless-run check via the
  B-aux racks-bound days, GO evaluation against the bars below.
- New proof test scripts/test-cookdiv-b.js: parser + analyzer
  fixture checks (T1) run BEFORE the sweep; corpus assertions +
  GO evaluation (T2) after. ORDER (binding): the neutrality leg
  (R-vs-Y numerics identical) runs FIRST in the test and is
  reported first; no classified number is judged if it fails.

### Substrate, seeds, horizon (identical on all configs)

- Policy leadfeast, DEPOSITGATE=1, FEASTSCALE_R13=1,
  SEATDRIVE=0, PLENTYDEPRI=0 (pd0 only), 100d death-aware
  horizon (dead villages stop, +10d tail max). All asserted
  FATAL by the driver.
- Pilot: census band 9750-9757 (8 seeds) x {R baseline (ROTATE
  unset, REMINDER unset = default R), Y (ROTATE=1), B-aux
  (REMINDER=0, racks-bound-day set only)} = 24 configs, run
  SEQUENTIALLY. Baseline is RE-SWEPT on current master — no old
  corpus is cited as this run's baseline.
- Confirm: fresh band 9760-9775 (16 seeds) x {R, Y, B-aux} =
  48 configs, identical seeds. Confirm runs ONLY on pilot GO.
- File names:
  cookdiv-b-<R|Y|B>-pd0-dg1-leadfeast-s<seed>.json
  (confirm files add `-confirm` before the seed).
- B-aux is instrumentation for the voiceless-run check only
  (gate B speaks exactly once per racks-bound day, so its voice
  days ARE the racks-bound days). No verdict bar is judged
  against B except the coverage check (e) below.

### Primary metric and GO thresholds (binding — judge ONLY against these)

Primary metric: distinct cooks voicing per seed (spoken racks-full
complaints, from racksFullDetail cook fields) on identical seeds,
R baseline vs Y variant.

PILOT GO iff ALL of the following hold:

- (a) DISTINCT: distinct cooks >= 2 on >= 6/8 pilot seeds under Y.
  All 8 seeds counted; a seed with zero voices under both arms
  (village died before filling racks, e.g. the old 9751 shape)
  counts as a miss on this bar and is named as such — the 6/8
  threshold absorbs at most two such seeds.
- (b) VOICE KEPT: band total racks-full voices under Y >= 0.80x
  the R band total on identical seeds. Per-seed ratios are also
  reported; a per-seed collapse (Y < 0.50x R on any seed with
  R >= 10) is named even if the band bar passes.
- (c) SURVIVAL KEPT: median daysAlive under Y >= 0.80x the R
  median on identical seeds.
- (d) STARVATION KEPT: total starvation-caused deaths under Y
  <= R total + 2 on identical seeds (deathCauses['starvation']
  summed over the band).
- (e) COVERAGE KEPT: max voiceless racks-bound-day run <= 6 on
  every pilot seed under Y (racks-bound days from the B-aux
  voice days; a Y voice day breaks a run). This is R's landed
  guarantee; Y must not break it.
- (f) NEUTRALITY: numerics identical R vs Y on every cell
  (daysAlive, batches, resolutions, deaths, rank, national,
  waveReach, table/win); worked == resolutions on every cell;
  say totals unchanged R vs Y on every seed (plain rises by
  exactly the yielded count). Any numeric delta = NO-GO (voice
  leaked into state).

A miss is NO-GO, never re-scored against a friendlier metric
mid-run. Metric doubts go under "Metric review". Confirm spend
ONLY on pilot GO.

### CONFIRM GO thresholds (binding, fresh band 9760-9775)

Same six bars, judged on the fresh band: distinct >= 2 on
>= 12/16 seeds (the same 75% rate as the pilot's 6/8, with the
same dead-village counting rule), band voice >= 0.80x R,
median survival >= 0.80x R, starvation <= R + 2 (band totals),
max voiceless run <= 6 every seed, numerics identical 16/16
with worked == resolutions and say totals unchanged. Any miss =
overall NO-GO: the game-code change is killed (revert game.js,
verify byte-identical — zero RACKSVOICE_ROTATE identifiers),
commit tooling + evidence + corpus only, and report the full
numbers.

### Landing rule (pre-registered)

If pilot GO and confirm GO, flip the default to Y (ROTATE unset
= Y; RACKSVOICE_ROTATE=0 restores R for regression testing) and
re-verify the proof test plus a spot paired check before
committing. If either fails, the game-code change is KILLED per
the confirm rule above. No push, no version bump, no live
verification — committed on branch sim-cookdiv-b, pending
coordinator merge.

### Balanced panel (§15)

- scripts/balance-panel.js is a before/after panel RUNNER (spawns
  its own child sims under its own observer with --before/--after
  panel files); it cannot ingest recorder corpora. A panel
  invocation attempt is recorded honestly in RESULTS (command +
  output) rather than skipped silently. No panel compare is
  attached and none is faked; the §15-equivalent instrument is
  the identical-seed R-vs-Y paired table (same observer, same
  seeds, only the ROTATE env differs), judged by the GO bars
  above.

### Sense-testing, wall numbers, villager behaviour

- SENSE-TESTING LAW: sample at least 2 seeds' cook-voice days
  from the Y corpus and judge whether the rotated voices read as
  different people speaking, not just different names on the same
  line. Quote at least 1 Y voice per sampled seed verbatim with
  day/seed/cook/kcal, plus 1 yielded case described from detail
  arrays, and judge meaning: does the second cook's line read as
  their own complaint about the same pile, and does the yielded
  day deserve its silence?
- WALL NUMBERS on the pilot corpus: national / table / wins,
  wave 1-5 reach, median survival, death-cause shares. NOTE:
  table = win flag, and SEATDRIVE=0 makes the table unreachable
  by construction — table 0 here is a construction fact, not a
  scale-wall finding.
- VILLAGER-BEHAVIOUR SAMPLE: per-seed cook shares under R vs Y
  (does Y actually move share off the first cook? on which seeds
  does it fail and why?), and whether worked lines still
  interleave with complaints on the same seed.

### Metric review (filled after the verdict, §14 — revisions apply to the NEXT run, this verdict is NOT re-scored)

- See the "Metric review" subsection under RESULTS below.

### Scope

- Game change (only if pilot + confirm GO, then default-flipped
  per the landing rule): src/js/game.js cook branch yield gate
  only, inside the R branch. New files: scripts/sweep-cookdiv-b.js,
  scripts/split-cookdiv-b.js, scripts/analyze-cookdiv-b.js,
  scripts/test-cookdiv-b.js,
  evidence/2026-10-26/sim-cookdiv-b-corpus/ (per-seed files),
  evidence/2026-10-26/sim-cookdiv-b.md (this file). No push,
  no version bump, no live verification — committed on branch
  sim-cookdiv-b, pending coordinator merge.

---

## RESULTS (appended after the pre-registration above; verdict judged ONLY against the header)

CORPUS: evidence/2026-10-26/sim-cookdiv-b-corpus/, 24 files
(pilot 8 seeds x {R, Y, B-aux}:
cookdiv-b-<R|Y|B>-pd0-dg1-leadfeast-s9750..9757.json),
policy leadfeast, pd0, dg1, 100d death-aware horizon. R = rule R
baseline RE-SWEPT on current master (default, ROTATE unset);
Y = rule Y (RACKSVOICE_ROTATE=1); B-aux = gate B (REMINDER=0,
racks-bound-day set only). CAP=1 throughout (say-capture
installed); SAYCAP=1000, no cell truncated (max say 425).

PROOF TEST: node scripts/test-cookdiv-b.js --corpus — T1 18 PASS /
0 FAIL (fixtures, run before the sweep); T2 neutrality leg PASS
(numerics identical, say unchanged, worked == resolutions, under
cap); GO bars 5/6 PASS, bar (b) FAIL; TOTAL 26 PASS / 1 FAIL,
exit 1. The single failure IS the verdict, not a test defect.
Analyzer: node scripts/analyze-cookdiv-b.js (table + GO evaluation
below agree with the proof test on every bar).

### Verdict: PILOT NO-GO — rule Y KILLED, no confirm spend

- (a) DISTINCT: PASS — 7/8 seeds >= 2 cooks under Y (need 6).
  Only 9751 misses, and it has zero voices under both arms (a
  village lost at day 31 that never filled its racks, not a
  rotation failure).
- (b) VOICE KEPT: FAIL — band total Y 107 vs R 156, ratio 0.686
  (need >= 0.80). The rotation buys diversity with a 31% voice
  loss. This bar alone kills the pilot; no confirm is run.
- (c) SURVIVAL KEPT: PASS — median daysAlive Y 100d vs R 100d
  (need >= 80.0).
- (d) STARVATION KEPT: PASS — starvation deaths Y 3 vs R 3
  (need <= 5).
- (e) COVERAGE KEPT: PASS — max voiceless racks-bound-day run
  <= 6 on every seed (3, 0, 6, 6, 6, 2, 6, 3). The yield
  suspension at the reminder threshold works exactly as
  designed: four seeds sit exactly at the boundary, none over.
- (f) NEUTRALITY: PASS — numerics identical R vs Y on 8/8
  cells (daysAlive, batches, resolutions, deaths, rank,
  national, waveReach, table/win); worked == resolutions on
  every cell; say totals unchanged on every seed (plain rises
  by exactly the yielded count).

Per-seed voice collapse (named, not a separate bar — these four
seeds are where the band bar was lost): 9752: Y 7 vs R 20
(0.35x); 9753: Y 15 vs R 34 (0.44x); 9754: Y 6 vs R 20 (0.30x);
9756: Y 4 vs R 19 (0.21x). No other seed collapses below 0.50x.

PER-SEED TABLE (seed: R voices/distinct -> Y voices/distinct,
say R = say Y, max voiceless, B racks-bound days):
- 9750: R 13/2 (Sierra 12, Malik 1) -> Y 15/2 (Sierra 8,
  Malik 7), say 171, maxV 3, B days 19
- 9751: R 0/0 -> Y 0/0, say 7, maxV 0, B days 0 (village-lost
  day 31)
- 9752: R 20/2 (Mason 6, Theo 14) -> Y 7/2 (Mason 1, Theo 6),
  say 116, maxV 6, B days 47
- 9753: R 34/2 (Courtney 32, Owen 2) -> Y 15/2 (Courtney 9,
  Owen 6), say 350, maxV 6, B days 49
- 9754: R 20/1 (Jenny 20) -> Y 6/2 (Jenny 5, Oscar 1),
  say 143, maxV 6, B days 25 (village-lost day 90)
- 9755: R 9/1 (Otto 9) -> Y 7/3 (Otto 4, Thomas 2,
  Alfredo 1), say 132, maxV 2, B days 10
- 9756: R 19/2 (Grace 18, Hassan 1) -> Y 4/2 (Grace 3,
  Hassan 1), say 131, maxV 6, B days 22 (global)
- 9757: R 41/1 (Miguel 41) -> Y 53/2 (Miguel 27, Grace 26),
  say 425, maxV 3, B days 68
Band: R 156, Y 107, B racks-bound days 244.

### Why Y failed: the yield trap (verified in the day sequences)

Y's diversity win is real — distinct cooks >= 2 on 7/8 seeds
under Y vs 4/8 under R, and the headline case is fixed: 9757
goes from all-Miguel 41 under R to Miguel 27 / Grace 26 under
Y, a near-even split. But the speaker baton stalls on frozen
silences, and that stall is visible in the day sequences:

- 9756 (the pure case): B racks-bound days 36, 41, 42, 44, 45,
  46, 47, 48, ...; Y voices only on 36, 48, 60, 78. After
  Grace's day-36 voice, Grace yields every following day, but
  Hassan (the second cook) does not follow — so the village
  hears nothing for exactly 6 voiceless racks-bound days, then
  the threshold suspension forces Grace to speak again (day
  48), and the cycle repeats (48 -> 60 -> 78, each exactly
  6 silent days then a voice). Y degrades to threshold-paced
  reminders: about 1 voice per 7 racks-bound days.
- 9753 (the mixed case): Y voices on days 42, 49, 56 — again
  threshold-paced 7-day gaps while Owen does not follow —
  then Owen starts following and the voices alternate in
  pairs (60 Owen / 61 Courtney, 65 / 66, 71 / 72, 82 / 83,
  85 / 86). The trap releases the moment the second cook
  follows; it bites whenever they do not.
- Mechanism, stated precisely: the baton passes only on
  VOICES. When the second cook's follow-up evaluation is a
  frozen silence, it spends the day slot without passing the
  baton, so the first cook is still last-speaker the next day
  and yields again — to a second cook who may again not come.
  The threshold suspension (silent + 1 >= 7 speaks anyway) is
  the only thing that breaks the stall, which is why the
  collapsed seeds sit exactly at maxV 6 and why coverage (e)
  passes even as voice (b) fails. Coverage passing and voice
  failing together is the signature of this failure mode, not
  a contradiction.
- Counter-case proving the trap is conditional, not universal:
  9757 under Y alternates Miguel/Grace on nearly every voice
  day (33 Miguel, 36 Grace, 37 Miguel, 38 Grace, ...) because
  Grace follows Miguel's yield days. And Y exceeds R there
  (53 vs 41): per-cook memory lets one figure speak once per
  cook (Grace 20,807 on day 36, then Miguel 20,807 on day 37 —
  for Miguel that figure is a change from his day-33 figure),
  so a village with two following cooks is louder under Y
  than under R. The design helps exactly where the second
  cook follows, and starves exactly where they do not.

Substrate note (named, not forced): the re-swept R baseline
differs from reminder-b's R corpus on 9752 (R 20 voices /
deaths 4 here vs 13 / 3 there) through sibling policy changes
since that corpus — trajectory divergence, not instrument
error, and the internal R-vs-Y comparison agrees on all 8
seeds regardless. The verdict rests on this run's own paired
corpus, not on matching old numbers.

### Sense-testing (SENSE-TESTING LAW)

Sampled seeds: 9757 (the fixed dominance case) and 9753 (the
trap case). Verdict: the rotated voices DO read as different
people speaking, not just different names on the same line —
the failure is volume, not sense.

- 9757, verbatim (day 36, Grace): "🍲 Grace cooked for the
  haven — meals stretched. The racks are already full (20,807
  kcal kept — more than the haven can eat before it turns), so
  Grace left the fresh pile for tonight's dinner instead of
  smoking it onto the rot pile." Next day Miguel speaks the
  same 20,807 figure. Read in sequence — Miguel day 33
  (17,976), Grace day 36 (20,807), Miguel day 37 (20,807) —
  this reads as two cooks noticing the same pile on successive
  days, not a robotic repeat: the speaker changes, the figure
  is the village's true number, and each cook's line is true
  for that cook's last-spoken comparison. The alternation is
  the point, and it works.
- 9753, verbatim (day 88, Owen — the last Y line): "🍲 Owen
  cooked for the haven — meals stretched. The racks are
  already full (54,289 kcal kept — more than the haven can
  eat before it turns), so Owen left the fresh pile for
  tonight's dinner instead of smoking it onto the rot pile."
  In the late-9753 pairs (Owen then Courtney on the same
  figure, e.g. days 82/83 at 55,200), the second cook's line
  reads as their own complaint about the same pile — again
  sensical, not repeated.
- Yielded case that does NOT deserve its silence (9756 days
  41-47, from detail arrays): six consecutive racks-bound days
  with no voice after Grace's day-36 complaint. Grace yielded
  each day; Hassan never followed; the pile sat there
  untouched and unmentioned for a week. The threshold voice
  on day 48 rescues the village from permanent quiet, but a
  week of silence about a full-racks pile is not earned
  quiet — it is the trap. Contrast with a deserved silence
  (9757 day 34-35 gap in the Y sequence: voices day 33 then
  36 — a short gap while the figure moves, not a stall).
- Worked lines still interleave: worked == resolutions on
  every cell of both arms (e.g. 9757: 52 worked lines under
  both R and Y), and worked-quote samples are unchanged
  between arms — smoking work and racks-full voice remain two
  interleaved voices, not partitioned phases.

### WALL NUMBERS

Pilot corpus (R and Y identical — voice never leaks into
state): national-or-better 7/8 (9756 global; 9751 village,
lost day 31), table 0/8, wins 0/8, wave reach distribution
{2: 2, 3: 2, 4: 4} (wave-4 reach 4/8, wave-5 reach 0/8),
median survival 100d capped, deaths 50 (R and Y identical
counts). Death-cause shares (band): the arena 28, monster 4,
ambush 3, starvation 3, sickness 4, wound 2, alien 2, and 1
each of inspiration, contest, dehydration, lockjaw. NOTE:
table = win flag, and SEATDRIVE=0 makes the table
unreachable by construction — table 0 here is a
construction fact, not a scale-wall finding.

### Balanced panel (§15)

- Panel attempt (honest, not fabricated): `node
  scripts/balance-panel.js` with no arguments errors
  "Error: --out <panel-directory> required" — the panel is a
  before/after runner that spawns its own sims under its own
  observer; it cannot ingest recorder corpora. No panel
  compare is attached and none is faked. The §15-equivalent
  instrument is the identical-seed R-vs-Y paired table above
  (same observer, same seeds, only the ROTATE env differs),
  judged by the GO bars in the header.

### Metric review (§14 — revisions apply to the NEXT run, this verdict is NOT re-scored)

- The 0.80 voice-kept bar did its job: without it, the
  distinct-cook win (7/8, and the 9757 fix) would have masked
  a 31% voice loss and Y might have landed on diversity alone.
  Keep a voice-kept bar on every future rotation arm — it is
  the bar that caught this failure.
- The distinct-cook bar alone is too weak as a diversity
  measure: 9754 passes distinct under Y (Jenny 5 / Oscar 1)
  while remaining first-cook-dominated in share. A future
  diversity arm should pre-register a share bar alongside
  distinct (e.g. second cook >= 25% of voices) or judge
  distinct + voice jointly — distinct counts cooks, not
  balance.
- The coverage bar (e) proved load-bearing in an unexpected
  way: it passed at exactly the boundary (6) on all four
  collapsed seeds, which is what distinguishes "Y starves
  voice" from "Y breaks R's guarantee." A future arm that
  drops (e) would lose that diagnostic distinction.
- The yield-trap mechanism points the next design, not a
  tweak to this one: a yield that EXPIRES (e.g. yields only
  on the day after a voice, then the first cook speaks
  regardless) or a rotation of the first-candidate slot rather
  than the speaker baton would not stall on frozen silences.
  Either is a NEW arm with its own pre-registered bars, not a
  mid-run redesign of Y.
- The per-cook double-speak of one figure (9757: Grace
  20,807 then Miguel 20,807) is Y behavior that dies with Y,
  but a future rotation arm should decide explicitly whether
  a figure speaking once per cook is desirable signal or
  noise — it is what makes Y louder than R on following-cook
  seeds, and it would inflate voice totals if counted naively.

### VILLAGE ASSESSMENT (plain words)

These villages are still well-fed to a fault — 7 of 8 reached
national standing or better, and their cooks still spend the
run smoking food and complaining that the racks are full.
What this run tested was whether the complaint could come
from more than one mouth. On the village where it mattered
most — 9757, where Miguel did all the talking under the old
rule — it worked beautifully: Miguel and Grace now trade the
complaint almost every day, and the village actually hears
about the pile more often, not less. But on four other
villages the new rule went quiet in a bad way. The rule says
"the cook who spoke yesterday steps aside so the next cook
can speak" — and when the next cook doesn't show up, nobody
speaks at all, for days, until a week of silence forces the
first cook to speak again. On one village the pile went
unmentioned for a full week at a stretch, four times over,
while the food sat there. The cooks are still doing all their
smoking work, and nobody starved because of this — the
silence is about the talking, not the food. But a rule that
trades one cook talking every day for nobody talking most
days is not a fix, even though it fixes the one village it
was named for. So the rule is killed: the old rule stays,
and the next attempt needs a version that doesn't go quiet
when the second cook is busy elsewhere.

### Blanks filled or documented

Filled: the complete first-cook dominance measurement under R
on this band (per-seed cook shares: 9750 Sierra 12 / Malik 1;
9752 Mason 6 / Theo 14; 9753 Courtney 32 / Owen 2; 9754 Jenny
20 alone; 9755 Otto 9 alone; 9756 Grace 18 / Hassan 1; 9757
Miguel 41 alone; 9751 none) — the backlog item "cook-diversity
as a voice metric" now has a measured baseline, not just the
9757 anecdote. The 1130Z blank 1 (9757 all-Miguel under R) is
confirmed on the re-swept baseline and shown fixable in
principle (Y: Miguel 27 / Grace 26).
Documented (next blanks, in order): (1) a yield-expires or
first-candidate-rotation design as the next arm — Y's
speaker-baton stalls on frozen silences and must not be
revived as-is; (2) a second-cook share bar for future
diversity arms (distinct alone passes Jenny 5 / Oscar 1);
(3) whether a figure speaking once per cook is signal or
noise (Y's 9757 loudness mechanism); (4) the plain-display
blank from plainvoice-b (a swallowed complaint still looks
like a quiet cooking in the log) remains open.

### CONVERGENCE STATE for this axis (cook diversity)

food-economy stays converging (NOT converged): rotation under
R is now measured truth and KILLED on a voice bar (distinct
won, voice lost, mechanism named), the dominance baseline is
measured, and the scale wall is untouched by this axis. The
next rotation arm starts from the yield-trap diagnosis, not
from scratch.

### Scope compliance and KILL

Per the pre-registered confirm rule (pilot NO-GO), the
game-code change is KILLED: src/js/game.js was reverted to
its pre-run state (this worktree's HEAD content) and verified
with zero RACKSVOICE_ROTATE identifiers remaining in the file
(grep returns nothing) and `git status` showing game.js
clean. Committed here: tooling + evidence + corpus ONLY —
scripts/sweep-cookdiv-b.js, scripts/split-cookdiv-b.js,
scripts/analyze-cookdiv-b.js, scripts/test-cookdiv-b.js,
evidence/2026-10-26/sim-cookdiv-b-corpus/ (24 files),
evidence/2026-10-26/sim-cookdiv-b-sweep-R/Y/B.log + .err
(stdout carriers), evidence/2026-10-26/sim-cookdiv-b.md (this
file). No src/js change ships. No push, no version bump, no
live verification — committed on branch sim-cookdiv-b,
pending coordinator merge.
