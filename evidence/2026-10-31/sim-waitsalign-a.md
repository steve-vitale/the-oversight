# sim-waitsalign-a — the waits-alignment mechanism (backlog #1599)

Run: oversight-flesh-out-loop, run fleshout-20261031T0537Z,
arm sim-waitsalign-a, axis food-economy. Worktree
sim-waitsalign-a. DIAG/MECHANISM ONLY: zero src/js
changes, zero policy-default flips, zero edits to any
existing policy file or existing script. New files only:
one diag policy (default OFF), one trace driver, one
night-watch driver, one corpus scan analyzer, one sleep
probe + sweep, one proof script. Sibling worktrees never
touched; the main tree never touched; nothing is merged
by this worker (the coordinator merges).

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-31/sim-waitsalign-a-prereg.md (commit
bd8750cfe). Verdict judged exactly as written (see
Verdict). Staged method: pilot (code read + corpus scan
+ probe trio + unit probe) before confirm (second
seed/leg + determinism).

## 0. THE MECHANISM, NAMED (the answer first)

**The too-late-sleep line (evening dayTicks 448).**
"Waits" in this arm means the harness's 3 morning
doAction('wait') calls — there is no engine waits
counter, and the evidence file defines the term here so
nobody hunts for one. Each wait ticks to the next
128-tick part boundary. The morning clock is set by
what the night's sleep did, then the 3 waits:

- **Sleep runs and rolls the day** (evening dayTicks
  <= 448, uninterrupted): the sleep loop ticks in
  32-tick chunks to 512, endDay resets the clock to 0,
  and the 3 waits land on 128, 256, **384**. Morning
  ticks left: 128.
- **Sleep refuses, "too late for real sleep"**
  (evening dayTicks >= 449): the day does NOT roll in
  sleep. The first wait is the rollover stub (512 minus
  the evening clock, e.g. 61 ticks from 451), which rolls
  the day to 0, and only 2 full waits follow: morning
  **256**. Morning ticks left: 256.
- **Sleep is interrupted mid-loop** ("You wake with a
  start"): the clock stops at the interruption point T
  (evening clock + 32-tick chunks), and the morning is
  whichever boundary the 3 waits reach from T: T in
  (256,384] -> **128**; T in (384,512) -> **256**; T in
  (128,256] -> **0** (predicted, not observed — see
  Metric review).
- **Sleep refuses, "barely dawn"** (dayPart 0 and clock
  < 32, i.e. a day that ended almost before it started):
  the waits run 128, 256, 384 on the UNROLLED day, so
  the morning reads 384 but the gameDay does not advance
  that night. Same ticks left, different day bookkeeping.

Code locations (all read, none changed):

- The too-late guard: src/js/game.js sleep() —
  `if (T.TICKS_PER_DAY - (s.dayTicks || 0) <
  T.TICKS_PER_BATCH * 2)` (512 - clock < 64, i.e. clock
  >= 449) refuses with "Dawn's an hour off — too late
  for real sleep."
- The dawn guard: sleep() — `if (this.dayPart === 0 &&
  (s.dayTicks || 0) < T.TICKS_PER_BATCH)` refuses with
  "It's barely dawn."
- The sleep loop: sleep() ticks
  `Math.min(T.TICKS_PER_BATCH, remaining)` per chunk and
  breaks with woke=true on fight / encounter / contest
  grab / tent wreck, returning "You wake with a start"
  with NO dawn accounting.
- The wait: doAction('wait') — `wticks = rem === 0 ?
  128 : 128 - rem` where rem = dayTicks % 128.
- The day roll: tickAction() — `if (dayTicks >= 512)
  { dayTicks = 0; actionClock = 0; endDay(); }`.
- The 3 morning waits: scripts/sim-harness.js runDays —
  `for (let p = 0; p < 3; p++)` upkeep + driveFights +
  driveContests + doAction('wait'), then policy.daily,
  then Game.sleep().

**Why the trim's saving is self-defeating.** Saving 3
ticks on d9 moves the evening clock 451 -> 448, exactly
across the line: sleep flips from refused to accepted,
and the next morning's USED ticks jump 256 -> 384. The
morning budget LOSES 128 ticks while the evening saved
3. Net on d10's bridge decision: 221 -> 94 ticks, a
fall of 127 (128 lost to the flip, 1 won back by d10's
own 1-tick routine saving). Any future trim must price
its savings against the 448 line: a save that crosses
the line costs 128 the next morning, and a save that
does not cross it costs nothing. Quoting trim savings
as net without the flip is wrong by up to 128 ticks.

## 1. PILOT P1 — corpus scan (120 transitions, 0 unexplained)

Pure-read scan of the four selecttrim-a corpora
(scripts/analyze-waitsalign-a.js; census
evidence/2026-10-31/sim-waitsalign-a-scan.json):

- 120 evening->morning transitions; 113 match the
  simple threshold rule (<= 448 -> 384, >= 449 -> 256);
  4 are leg-ended (no next morning); 3 mismatch the
  simple rule and are ALL explained by interrupted
  sleep (nightwatch, §2); **0 UNEXPLAINED**.
- The simple rule's only other morning value in the
  corpus is 128 (one case, d16, interrupted — §2). No
  morning 0 was observed anywhere (predicted cell only).

## 2. PILOT P1b — nightwatch (the three anomalies, isolated)

scripts/waitsalign-nightwatch-b.js wraps Game.sleep and
Game.doAction('wait') with pure logging (no state edits,
no RNG draws; the leg's evenings reproduce the selecttrim
ON-control corpus exactly: d16 eve 273, d20 eve 401,
d22 eve 419). Nightwatch corpus:
evidence/2026-10-31/sim-waitsalign-a-nightwatch-on-control/
waitsalign-nightwatch-s15215.json (25 nights, ON control).

| night | eve | sleep | waits | morning | cause |
|-------|-----|-------|-------|---------|-------|
| d16 | 273 | 273 -> 369, day unrolled, "wake with a start" | 369->384, 384->0, 1->128 | 128 | interrupted at T=369 (3 chunks) |
| d20 | 401 | 401 -> 465, day unrolled, "wake with a start" | 465->0, 1->128, 130->256 | 256 | interrupted at T=465 (2 chunks) |
| d22 | 419 | 419 -> 451, day unrolled, "wake with a start" | 451->0, 1->128, 130->256 | 256 | interrupted at T=451 (1 chunk) |

Each morning is exactly the 3rd wait-boundary from the
interruption clock, as the mechanism predicts. The
interrupting event itself (which fight/encounter/grab
fired mid-sleep) is NOT identified per night — the
sleep wrapper records flags (all false at sleep entry)
and the wake line, but not the mid-loop trigger. That
is a documented gap below, not a hole in the morning
law: the morning depends only on T, and T is measured.

One nuance, stated so it is not misread later: night
d24's sleep lines ALSO contain "You wake with a start"
— but AFTER the "DAY 25 DAWN" banner, with the day
already rolled and the post-sleep clock at 3, so the
waits still land on 384. A wake-with-start line alone
does not imply a short morning; what matters is whether
the day had rolled before the interruption.

## 3. PILOT P2 — honest-trajectory probe trio, 15215 ON

scripts/waitsalign-trace-b.js, substrate identical to
selecttrim-a (nighttravel + woodcarry + woodwarm ON +
pressb=1), DAYS=15. New diag policy
scripts/policies/waitsalign-diag.js: same gate as the
trim (imported trimDecision, not copied), but the day
assembles forage + sortHaul + eat + talkRound — it
skips ONLY askAbout beasttricks (save 2). Corpora:
evidence/2026-10-31/sim-waitsalign-a-corpus-on-{control,
askskip,trim}/.

| leg | d9 routine | d9 eve | d10 morning | d10 decision | flip? |
|-----|-----------|--------|-------------|--------------|-------|
| control (save 0) | 19 (selecttrim corpus) | 451 | 256 | 221 | no (predicted) |
| askskip (save 2) | 17 | 449 | 256 | 219 | no (predicted) |
| trim (save 3) | 16 | 448 | 384 | 94 | YES (predicted) |

All three match the prereg predictions exactly. The
ask-skip leg fires on d9, d11, d13 (not d10: d10's
morning is 256, below the gate's 384 line, so the gate
itself declines — the gate and the flip are the same
line). Control and trim legs reproduce selecttrim-a's
own legs on game fields (control presses d10 E540/d14
E900; trim presses d10 E720/d14 E900). Askskip d10's
routine reads 20 vs control's 18 — a cascade of the
skipped askAbout's RNG-stream shift, reported, not
hidden; the judged d9->d10 clock values are exact.

The 1-save honest rung was NOT built: askAbout costs
exactly 2 ticks and is indivisible, and no 1-tick beat
exists to skip alone on d9 (talkRound is the 1-tick
beat, but skipping it alone while keeping askAbout
would require reordering daily's beats, not subsetting
them). The 1-save rung is covered by the unit probe
instead (eve 450 -> 256, §4), and the evidence file
says so rather than pretending a beat-skip leg exists.

## 4. PILOT P3 — unit sleep probe (boundary exact)

scripts/waitsalign-sleep-probe-b.js (one harness per
value; clock advanced with tickAction in 32-tick chunks
only, then sleep() + 3 waits exactly as the harness
does) + sweep driver. Seed 15215, 14 values; seed 15003,
9 values. Corpora:
evidence/2026-10-31/sim-waitsalign-a-sleepprobe-s15215.json,
-sim-waitsalign-a-sleepprobe-s15003.json.

Seed 15215 (eve -> morning; refused waits read
[0,128,256], accepted [128,256,384]):

| eve | 400 | 440 | 442 | 444 | 446 | 447 | 448 | 449 | 450 | 451 | 455 | 460 | 480 | 500 |
|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|-----|
| morning | 384 | 384 | 384 | 384 | 384 | 384 | 384 | 256 | 256 | 256 | 256 | 256 | 256 | 256 |

Boundary exact at 448/449 on both seeds (15003:
448 -> 384, 449 -> 256, and all 9 values consistent).
No interruptions, no errors, reached ticks exact on
every value. In save-ladder terms on the 15215 ON d9
trajectory (control eve 451): save 0/1/2 -> morning
256 (no flip); save 3/5/9 -> morning 384 (flip).
Threshold, not phase, not draw-count: the guard is a
pure clock comparison and the probe never draws on the
guard itself.

## 5. CONFIRM C1 — second seed / second leg

(a) Second seed: the 15003 unit probe above (boundary
identical) + a 9-seed band scan — ON control legs,
DAYS=15, seeds 15003, 15009, 15091, 15211, 15220, 15221,
15337, 15376, 15439 (same driver, same substrate;
corpus sim-waitsalign-a-corpus-on-control/): every
completed transition obeys the simple threshold rule,
**0 violations** across 126 band transitions (140
including the 15215 leg). (No band
seed strands in 15 days — pbAttempts 0 on all nine —
so no band seed yields a trim-crossing strand evening;
the prereg's fallback confirm shape is therefore used,
and stated here.)
(b) Second leg: guard control + trim re-run by this
arm's driver, DAYS=15 (corpus
sim-waitsalign-a-corpus-guard-{control,trim}/):
guard control reproduces selecttrim guard control (d9
eve 403, d10 419, d11 497 -> morning 256, press d10
E450); guard trim reproduces selecttrim guard trim
(trims 9,10,11; d11 eve 400 -> morning 384, press d10
E540); guard trim d12 sits EXACTLY on the line (eve
448 -> morning 384, completed evening) — a second
leg's boundary confirmation.
(c) The guard trim d11 flip (control 497 -> 256 vs
trim 400 -> 384) is a flip of the same rule via
trajectory divergence (97 ticks), NOT a clean
crossing — reported as such, not counted as the clean
crossing (15215 ON d9 is the clean one).

## 6. CONFIRM C2 — determinism

ON control leg re-run into
sim-waitsalign-a-corpus-det-on-control/: byte-identical
to the judged ON control corpus (cmp clean).

## 7. SENSE-TEST (law — read end to end)

The refusal is honest in-fiction, not a silent clock
quirk: control and askskip d9 nights both say "Dawn's
an hour off — too late for real sleep. Rest a while
instead, or wait for morning." — and the villager then
waits through the morning, exactly as told. The trim
night says "You settle into the cold ground. Sleep
takes you." The d10 press fires on all three legs
(control 6 grapes E540, askskip 6 E540, trim 8 E720 —
the trim yield shift is the known RNG-stream cascade,
as in selecttrim-a). PASS on sense: the mechanism reads
as a person told it is too late to sleep, versus a
person who sleeps.

## Reachability

No new content reached by a game change (no game
change landed — policy prototypes only, default off).
Creek/bridge content reached on every leg. Waves 4-5
not reached in this 15-day window (same window class
as prior strand arms).

## Wall numbers

NOT OBSERVABLE on 15-day evening legs (pre-seat, no
field) — reported as the window's structural value, not
a game verdict: national 0, table 0, wins 0 in the sense
that the legs contain no national/table/win content.
Median survival: 15 days (survived window on all probe
legs — ceiling effect, not a survival claim).

## Verdict against the prereg

- DIAG-GO (judged exactly as written). (a) HOLD: the
  mechanism is named — the too-late-sleep line (448)
  with exact code locations for the guard, the wait
  boundary, the day roll, and the 3 harness waits,
  plus the interruption extension (T-banded mornings).
  (b) HOLD: the 15215 ON trio flips/preserves exactly
  as predicted (control 256, askskip 256, trim 384).
  (c) HOLD: the unit probe boundary is exact (448 ->
  384, 449 -> 256) on two seeds, neighbors consistent,
  zero unexplained exceptions. (d) HOLD: reproduced on
  a second seed (15003 probe + 9-seed band scan, 0
  violations) and a second leg (guard pair re-run +
  guard d12 on-the-line 448 -> 384).
- DIAG-NO-GO triggers do NOT fire. The instrument as
  built must NOT be shipped as behavior (the ask-skip
  and trim wrappers are DIAG-only prototypes, same
  standing as selecttrim-a's). What the measurement
  DOES establish for the coordinator's next design: any
  trim's quoted savings must be net of the flip — a
  save crossing 448 costs 128 the next morning, so the
  selecttrim d9 saving of 3 is net -125 on d10's
  decision (-127 measured including d10's own 1-tick
  saving), not +3; and the guard's 384 line in the trim
  gate is the same line as the sleep line, which is why
  the trim declines 256 mornings.

## Proof

scripts/test-waitsalign-a.js: 38/38 checks pass,
including: code locations (sleep guards, wait math,
endDay reset, 3 harness waits); scan totals (120
transitions, 0 unexplained; d16/d20/d22 interrupted
causes); trio values (control 451->256/221, askskip
17/449->256, trim 16/448->384/94) + selecttrim
reproduction; unit probes on both seeds + save ladder;
band scan (0 violations, >= 100 transitions); guard
re-runs (d11 497->256, d12 448->384, presses E450/E540);
determinism (byte-identical); worktree-only-my-files
guard; src/ diff empty.

Disclosure (infrastructure, repaired or recovered):
- EPERM flap on writes (the known container class):
  safe-commit failed 18+ times on its /tmp private
  index and object writes before the flap passed; the
  prereg commit then landed clean (bd8750cfe) with the
  known index-clobber side effect (prereg staged-as-
  deleted), repaired with `git update-index --add
  --cacheinfo` before any judged leg; HEAD unchanged,
  blob verified equal (cebe4cc3...). Two evidence
  writes left 0-byte corpses mid-flap (scan + first
  nightwatch); both were deleted and regenerated clean
  after the flap passed — no judged number rests on a
  corpse file.
- Sweep filename overwrite (this arm's own bug, caught
  and fixed): the first 15003 sweep overwrote the
  unseeded 15215 sleepprobe file. The sweep script was
  fixed to seed its filename and BOTH sweeps were
  re-run; the re-run 15215 table reproduces the lost
  table's 12 values exactly, and the 15003 table was
  re-run at 9 values.

## Metric review

- Morning 0 predicted, not observed: the interruption
  band T in (128,256] predicts a 0 morning (roll in the
  3rd wait). No corpus transition shows it. It is a
  prediction of the law, not a claim — a future
  nightwatch on a longer leg may catch one; if it does,
  it confirms rather than revises.
- Interruption trigger not identified per night: the
  nightwatch measures T and the wake line but not which
  mid-sleep event (fight / encounter / contest grab /
  tent wreck) fired. The morning law needs only T, so
  the verdict does not depend on it — but a future arm
  that wants to PREDICT interruptions (rather than
  measure them) must instrument the sleep loop's
  between-chunk checks.
- GameDay is not loopDay: endDay can fire mid-daily
  (evening gameDay can exceed morning gameDay), and a
  dawn-guard night leaves the gameDay unadvanced while
  the morning still reads 384. The verdict judges
  dayTicks only, as preregistered; any future prereg
  that judges gameDay must say so explicitly.
- "Waits" terminology: this arm uses "waits" for the
  harness's 3 morning doAction('wait') calls, following
  selecttrim-a's usage ("384 mornings"). There is no
  engine waits counter; the coordinator should not
  expect one in code.

## Out-of-scope findings (NOT chased; for the coordinator's backlog)

- [open] 2026-10-31 — food-economy/clock — MORNING-0
  CELL (this arm, predicted not observed): an
  interrupted sleep with T in (128,256] should yield a
  0 morning (roll in the 3rd wait). No corpus case yet.
  (evidence: this file, §0 + Metric review.)
- [open] 2026-10-31 — food-economy/clock — INTERRUPTION
  TRIGGER PER NIGHT (this arm, measured T, unidentified
  trigger): nightwatch records the interruption clock
  and wake line but not which mid-sleep event fired.
  (evidence: this file, §2; nightwatch corpus.)
- [open] 2026-10-31 — food-economy/social — ASKSKIP
  CASCADE (this arm): skipping askAbout shifts the RNG
  stream (askskip d10 routine 20 vs control 18, press
  yields move) — same class as selecttrim-a's talk
  cascade, now shown for a 2-tick skip. (evidence: this
  file, §3.)

## Files

- Prereg: evidence/2026-10-31/sim-waitsalign-a-prereg.md
  (commit bd8750cfe)
- Evidence (this file): evidence/2026-10-31/sim-waitsalign-a.md
- Scan census: evidence/2026-10-31/sim-waitsalign-a-scan.json
- Policy: scripts/policies/waitsalign-diag.js (default
  OFF); driver: scripts/waitsalign-trace-b.js;
  nightwatch: scripts/waitsalign-nightwatch-b.js;
  analyzer: scripts/analyze-waitsalign-a.js; sleep probe:
  scripts/waitsalign-sleep-probe-b.js + sweep:
  scripts/waitsalign-sleep-sweep-b.js; proof:
  scripts/test-waitsalign-a.js (38/38)
- Judged corpora: evidence/2026-10-31/
  sim-waitsalign-a-corpus-on-{control,askskip,trim},
  -guard-{control,trim}, -on-control (9 band seeds +
  15215), -det-on-control (byte-identical),
  sim-waitsalign-a-nightwatch-on-control,
  sim-waitsalign-a-sleepprobe-s{15215,15003}.json
