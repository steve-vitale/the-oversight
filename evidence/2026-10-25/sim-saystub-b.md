# sim-saystub-b — a say-capture instrument so cook smoke-rack lines survive sim runs

Run: oversight-flesh-out-loop-b, arm sim-saystub-b, axis food-economy
(instrument axis: the preserveact sense-testing instrument).
Worktree: `~/workspace/worktrees/sim-saystub-b`, branch sim-saystub-b.

Status: PRE-REGISTERED — everything under "PRE-REGISTRATION" below was
written BEFORE any sim in this run was executed. The RESULTS section
at the end is appended after the sweep completes and is judged ONLY
against the header.

## Canon read first

- `docs/CANON.md` (manifest) then `docs/PRESERVATION.md` (the food
  ladder: cleaned 2d < cooked 5d < smoked 30d < rendered 90d <
  pemmican 120d; smoking 16 ticks; blind penalties teach once).
- No canon doc covers the sim-harness say stub — stated, not
  invented. The capture, the GO bar, and the neutrality bar below
  are measured instruments, not designed values.

## Background (quoted from prior runs, NOT re-judged here)

- sim-preserveact-b (evidence/2026-10-25/sim-preserveact-b.md):
  pilot verdict NO-GO failed=P1 (widening did not increase
  preserve-action counts); that verdict stands and is NOT
  re-judged here. Its metric review records saySamples = 0 on all
  four trace files — no cook smoke-rack say-lines were captured —
  and its addendum names the root-cause candidate: Game.say is a
  no-op stub in the sim harness, so the cook's lines are dropped
  before any emit wrapper or matcher could see them. This arm
  proves or refutes that candidate and builds the capture.
- The preserveact matcher itself (/smoke racks|cooked for the
  haven|racks are already full/i) was never proven wrong: the real
  cook line (game.js cook duty) reads `🍲 {first} cooked for the
  haven — meals stretched. {first} worked the smoke racks too —
  {n} batch(es) preserved (~{kcal} kcal, keeps ...)`, which the
  matcher DOES match. If the stub is the cause, the matcher needs
  no fix — the lines need a live say path.

## ROOT-CAUSE CANDIDATE (stated before proving, to be confirmed by test T2)

- Chain, read from code before any sim: cook duty calls
  `this.say(...)` (src/js/game.js cook duty) → `G.say` is defined
  in src/js/encounters.js as `this.emit(msg, surface)` → but
  scripts/sim-harness.js `loadGame` replaces `G.say` with
  `function () {}` whenever `opts.narration` is falsy, and the
  preserveact sweep calls `loadGame` with NO narration option.
  So the cook line never reaches `Game.emit` at all. The
  preserveact sweep wrapped `Game.emit` only — a wrapper on a
  path the line never takes. Cause class: harness stub swallowing
  the lines, NOT a matcher bug and NOT "cooks never speak".
- Proof required (test T2, before the verdict): with the stock
  harness, a direct `Game.say` of the known cook line leaves
  `Game.log` empty AND reaches no emit wrapper; with the new
  capture installed, the same call is recorded. Both halves must
  hold, or the candidate is wrong and the verdict is NO-GO.

## PRE-REGISTRATION (bound per docs/MEASUREMENT.md §§9-12, 14-15)

### Instrument design (zero game changes)

- NEW file only: scripts/say-capture.js. It wraps `Game.say`
  AFTER `loadGame` (the same post-load wrap pattern the
  probe-killattr-say-20261020 probe already uses). It does NOT
  edit scripts/sim-harness.js, does NOT touch any src/js file,
  does NOT change any game say text, and does NOT flip any
  default. When the capture is absent, runs are byte-identical
  to stock-harness runs by construction (nothing is installed).
- Neutrality mechanism, stated: the wrapper writes ONLY to a
  caller-owned array; it never touches Game.state, Game.log,
  RNG, or any game field; it delegates to the original say with
  the same arguments, `this`, and return value. A counting
  failure is try/catch-isolated and can never change game
  behavior. The wrapper records only lines matching the cook
  filter (below), so non-cook say traffic costs nothing.
- Filter (identical to the preserveact matcher, so this run
  tests the stub hypothesis and NOT a new matcher):
  /smoke racks|cooked for the haven|racks are already full/i.
  Cap: 200 samples per run (raised from preserveact's 60 so the
  worked-lines == resolutions cross-check below is not
  truncated on cells with up to ~67 resolutions).
- Sweep driver: scripts/sweep-saystub-b.js (new file). One
  process per arm (CAP=0 stock harness, CAP=1 capture
  installed), seeds run sequentially inside the process —
  the same loadGame-per-seed pattern the preserveact sweep
  used and reproduced deterministically. Per-seed JSONs carry
  the numeric fields (daysAlive, batches, kcal, resolutions,
  deaths, national, wave, rank) plus saySamples on CAP=1
  files only. Corpus dir (new, never mixed into an older
  corpus): evidence/2026-10-25/sim-saystub-b-corpus/ — inside
  this worktree, NEVER /tmp.

### Pair, contrast, horizon, seeds

- Contrast, ONLY contrast: CAP=0 vs CAP=1 on CURRENT head
  (ON substrate, no patch, no game change). Both arms run the
  identical policy/horizon/cells; the ONLY difference is the
  capture wrapper installed after loadGame.
- Cells, identical on both arms: policy leadfeast,
  DEPOSITGATE=1, FEASTSCALE_R13=1, SEATDRIVE=0,
  PLENTYDEPRI=0 (pd0 only — the say question needs one
  cook-rich side, not both), 100d death-aware horizon (dead
  villages stop; +10d tail max), all asserted FATAL by the
  driver, matching the preserveact substrate except the side
  restriction (pd0 only) and the capture itself.
- Seeds, REUSED band (deliberate: identical seeds make the
  neutrality comparison exact and allow a secondary check
  against published numbers): 9750-9757 (8 seeds), the
  preserveact pilot band. Configs: 8 seeds x {cap0, cap1} =
  16 configs. File names:
  saystub-b-<cap0|cap1>-pd0-dg1-leadfeast-s<seed>.json.
- Seed 9754 note (BOUNDARY): 9754 is included ONLY as a
  neutrality cell (its ON batches were 0 in the preserveact
  pilot). Its zero is NOT investigated here — the sibling arm
  (sim-onzero9754-b) owns the 9754 ON-zero question. If 9754
  shows saySamples 0 on both arms with batches 0, that is
  consistent-neutral, not a finding about the zero.
- Substrate-drift note, stated before sweeping: src/js HAS
  changed since the preserveact corpus base (9f11741a) — e.g.
  sim-expedid-b and gap W4-narr spam gates — so the CAP=0 arm
  may NOT reproduce every published preserveact ON pd0 number
  exactly. That drift, if any, is a substrate fact, not a stub
  effect, and it is handled by the verdict rule below: the
  PRIMARY neutrality bar is internal (CAP=0 vs CAP=1 on the
  same head, same run), and the published-number comparison is
  reported, never the judge.

### VERDICT RULE (binding — judge ONLY against this header)

GO holds if and only if ALL of A, B, C hold:

- A (known-line capture): at least one captured line on a
  cook-rich seed matches /worked the smoke racks too/ AND
  matches the real game.js cook-duty template (starts with
  the 🍲 cooked-for-the-haven line and names a batch count
  and kcal figure). The line must be a real game line: its
  template is cited from src/js/game.js cook duty, not
  invented, and the captured line's batch count comes from
  the game's own resolution, not from the test.
- B (neutrality): CAP=0 vs CAP=1 numeric fields are IDENTICAL
  on all 8 seeds: daysAlive, preserveVillagerBatches,
  preserveVillagerKcal, preserveVillagerResolutions, death
  count, national, waveReach, rank. Bar: 8/8 cells identical
  on every listed field. Any single differing field fails B.
- C (cook-rich sample): saySamples > 0 on every CAP=1 cell
  with preserveVillagerBatches > 0 (a village that preserved
  must have spoken about it), and total captured cook lines
  across the CAP=1 corpus > 0. A batches>0 cell with zero
  captured lines fails C.

Otherwise the verdict is NO-GO, with the failed condition(s)
named (A / B / C). A NO-GO here means ONLY "this capture does
not prove cook-line capture" — it is NOT a judgment on the
preserveact verdict, on the widening, or on seed 9754.

VALIDITY (preconditions, not verdict conditions): all 16
per-seed files present, parsing, arm tags + seeds + contrast
matching; batches >= resolutions on every cell (the
preserveact cross-check); on every CAP=1 cell, the count of
captured "worked the smoke racks" lines EQUALS
preserveVillagerResolutions (one say line per n>0 cook
resolution by construction — the duty calls this.say once
per resolution and creditDeed 'preserving' fires in the same
n>0 block). If validity fails, there is NO verdict — the run
fails loudly as an instrument failure and does not claim GO
or NO-GO. (Racks-full voice lines match the filter but are
counted separately from worked lines, so they cannot inflate
this equality; a mismatch is investigated, not averaged
away.)

### Pilot gate (§9)

- No separate pilot/confirm split: the whole corpus is 16
  configs at ~seconds each, and the GO bar is judged on all
  8 seeds at once. The pilot-gate principle is honored by
  running the proof test's T2 stub proof BEFORE the sweep:
  if T2 fails (the stock harness does NOT swallow say, or
  the capture does NOT record a direct say call), the sweep
  does not run and the arm ends as an instrument failure
  with the cause named.

### Balanced panel (§15)

- This is NOT a before/after balance pair (no game lever
  changes), so no panel compare is attempted and none is
  faked. The §15 instrument here is the CAP=0 vs CAP=1
  paired table in RESULTS, judged by the GO rule above.

### Sense-testing, wall numbers, villager behavior

- SENSE-TESTING LAW: quote at least 3 captured cook lines
  verbatim in RESULTS and judge whether they read as
  villager speech (named cook, concrete work, quantities
  that track the village's food) vs boilerplate (identical
  repeated strings with no village content). A quote with
  its day, seed, and batch count attached is the evidence;
  a bare count is not.
- WALL NUMBERS on this corpus: national / table / wins,
  wave 1-5 reach, median survival (median daysAlive). NOTE:
  table = win flag, and SEATDRIVE=0 makes the table
  unreachable by construction — table 0 here is a
  construction fact, not a scale-wall finding.
- VILLAGER-BEHAVIOR SAMPLE: death-cause spread across the
  corpus, cook-line variety across days/seeds (same cook
  name recurring vs rotating speakers, racks-full voice
  vs worked voice). Anything robotic, static, or repeated
  is flagged.

### Metric review (filled after the verdict, §14 — revisions apply to the NEXT run, this verdict is NOT re-scored)

- See the "Metric review" subsection under RESULTS below.

### Scope

Zero src/js game changes in this worktree. New files only:
scripts/say-capture.js, scripts/sweep-saystub-b.js,
scripts/test-saystub-b.js,
evidence/2026-10-25/sim-saystub-b-corpus/ (per-seed files),
evidence/2026-10-25/sim-saystub-b.md (this file). No push,
no version bump, no live verification — merged locally,
pending ship, by the coordinator.

---

## RESULTS (appended after the pre-registration above; verdict judged ONLY on the corpus named here)

CORPUS: evidence/2026-10-25/sim-saystub-b-corpus/, 16 files
(saystub-b-cap0/cap1-pd0-dg1-leadfeast-s9750..9757.json),
policy leadfeast, pd0, dg1, 100d death-aware horizon, current
head (no patch, no game change). CAP=0 = stock harness;
CAP=1 = scripts/say-capture.js installed after loadGame.

PROOF TEST: node scripts/test-saystub-b.js — 19 PASS / 0 FAIL
(T1 unit 10, T2 stub+capture proof 4, T3 corpus+verdict 5).

ROOT CAUSE, CONFIRMED (not just the candidate): T2 proves both
halves. With the stock harness, a direct Game.say of the known
cook line reaches NO emit wrapper and leaves NO log line — the
line is dropped by the harness no-op before any downstream path
can see it. With the capture installed, the identical call is
recorded day-tagged. Cause class: harness stub swallowing the
lines. NOT a matcher bug (the matcher matches the real template,
T1) and NOT "cooks never speak" (the corpus below holds 273
worked lines). This answers the preserveact metric-review
question definitively: the matcher never got the chance.

INSTRUMENT FIX (during this run, before the verdict — same class
as preserveact's own instrument-fix section; the verdict rule
itself is unchanged): the first CAP=1 sweep capped samples at
200, and seed 9757 hit the cap (200 samples, only 23 of its 43
worked lines recorded — the rest arrived after the cap filled).
Cause: the filter matches EVERY cook line, not just smoke-rack
ones (plain "cooked for the haven" lines count too), so a
100-day cell can produce ~370 matching lines. Fix: SAYCAP env
override on the sweep (default still 200); seed 9757 CAP=1 was
re-run once with SAYCAP=1000. The re-run is a genuine re-run,
not a hand edit: its numerics are identical to both the capped
run and the CAP=0 run (see neutrality below), and it records
370 samples with worked=43=res. All other cells were already
under the cap (max 130), so no other cell needed a re-run.
The capped 9757 numbers are preserved here for audit: say=200,
worked=23, res=43 — the shortfall is cap truncation, nothing
else.

PER-SEED TABLE (CAP=0 numerics = CAP=1 numerics on every cell;
say/worked/racksFull are CAP=1 counts):
- 9750 days=100 | batches 127 | res 44 | say 88 | worked 44 | racksFull 24 | deaths 10 | national true | wave 3 | rank national
- 9751 days=100 | batches 115 | res 40 | say 66 | worked 40 | racksFull 13 | deaths 9 | national true | wave 4 | rank national
- 9752 days=100 | batches 78 | res 32 | say 130 | worked 32 | racksFull 30 | deaths 8 | national true | wave 4 | rank national
- 9753 days=100 | batches 55 | res 24 | say 41 | worked 24 | racksFull 10 | deaths 10 | national true | wave 4 | rank national
- 9754 days=100 | batches 0 | res 0 | say 0 | worked 0 | racksFull 0 | deaths 10 | national true | wave 4 | rank global
- 9755 days=100 | batches 134 | res 43 | say 90 | worked 43 | racksFull 8 | deaths 7 | national true | wave 3 | rank national
- 9756 days=100 | batches 111 | res 47 | say 102 | worked 47 | racksFull 10 | deaths 6 | national true | wave 4 | rank global
- 9757 days=100 | batches 107 | res 43 | say 370 | worked 43 | racksFull 106 | deaths 3 | national true | wave 4 | rank national

VERDICT: GO (A=true, B=true, C=true, validity=true).
- A HOLDS: worked smoke-rack lines captured on every
  preserving seed, each matching the real game.js template
  (🍲 cooked-for-the-haven frame + batch count + kcal + shelf
  note). Example, seed 9753 day 15: "🍲 Owen cooked for the
  haven — meals stretched. Owen worked the smoke racks too — 2
  batches preserved (~3762 kcal, keeps for weeks)."
- B HOLDS: CAP=0 vs CAP=1 numeric fields identical on 8/8
  cells (daysAlive, batches, kcal, resolutions, deaths,
  national, waveReach, rank). The stub perturbs nothing.
- C HOLDS: saySamples > 0 on every CAP=1 cell with batches
  > 0 (7/7 such cells); total captured cook lines across the
  CAP=1 corpus = 887, of which 273 are worked lines.
- VALIDITY HOLDS: 16/16 files present, parsing, tags match;
  batches >= resolutions on every cell; worked-line count
  EQUALS resolutions on every CAP=1 cell (44/40/32/24/0/43/
  47/43 — one say line per n>0 cook resolution, exactly as
  the duty code constructs it).

PUBLISHED-NUMBER CHECK (secondary, reported not judged): the
CAP=0 arm reproduces the published preserveact ON pd0 numbers
EXACTLY on all 8 seeds (batches, resolutions, daysAlive all
identical to evidence/2026-10-25/preserveact-b-corpus ON pd0
files). No substrate drift on these fields despite the src/js
commits since 9f11741a — the internal neutrality bar and the
published reproduction agree.

SENSE-TESTING (read the lines, not just the counts):
- Quoted, verbatim, with day/seed/batch count:
  - [9753 d15] "🍲 Owen cooked for the haven — meals stretched. Owen worked the smoke racks too — 2 batches preserved (~3762 kcal, keeps for weeks)."
  - [9750 d13] "🍲 Wei cooked for the haven — meals stretched. Wei worked the smoke racks too — 1 batch preserved (~97 kcal, keeps for weeks)."
  - [9756 d84] "🍲 Hassan cooked for the haven — meals stretched. Hassan worked the smoke racks too — 7 batches preserved (~3738 kcal, keeps for weeks)."
  - [9757 d100] "🍲 Miguel cooked for the haven — meals stretched. Miguel worked the smoke racks too — 4 batches preserved (~2670 kcal, keeps a couple of weeks)."
  - [9753 d46 racks-full] "🍲 Owen cooked for the haven — meals stretched. The racks are already full (53,848 kcal kept — more than the haven can eat before it turns), so Owen left the fresh pile for tonight's dinner instead of smoking it onto the rot pile."
- Judgment: these read as villager speech, not boilerplate.
  The frame repeats (it is one duty's line), but the content
  tracks the village: named cooks (up to 6 per seed — 9755
  rotates Otto, Tanisha, Alfredo, Nadia, Valeria, Xavier;
  9753 is a one-cook village, Owen alone), batch counts from
  1 to 7, kcal from ~97 to ~3762, days spread d13–d100, and
  the shelf note tracks skill ("keeps for weeks" skilled vs
  "keeps a couple of weeks" blind — 9757's cooks are blind).
  Nothing reads robotic or static beyond the honest frame
  repetition of a single duty line. One observation, not a
  defect claim: 9757's racks-full voice fires 106 times across
  the run — the game's per-cook-day gate still lets the
  fullness complaint recur heavily on a racks-bound village.
  Documented here for a future sense arm, not chased here.
- Seed 9754 (BOUNDARY, not investigated): say=0 with batches=0
  on both arms — consistent-neutral. The zero itself remains
  the sibling arm's (sim-onzero9754-b) question; nothing in
  this corpus speaks to why it is zero, and no claim is made
  about it here.

WALL NUMBERS (corpus, 16 configs): national=16, table=0,
wins=0, wave reach distribution {3: 4, 4: 12} (per-cell max
wave; CAP arms agree), median daysAlive=100, max
daysAlive=100, total deaths=63 (per arm; arms agree). Table 0
is a construction fact (SEATDRIVE=0), not a scale-wall
finding. National reach is total (16/16) while wins/table
stay at zero — the wall on this corpus sits past national,
at the table, exactly where SEATDRIVE=0 puts it.

DEATH-CAUSE SPREAD (corpus totals per arm, 63 deaths): the
arena 40, ambush 4, sickness 4, alien 3, contest 2, monster 2,
a wound that wouldn't close 2, big ugly 1, the night 1,
starvation 1, dehydration 1, combat 1, the expedition 1.
The arena alone is ~63% of all deaths: on this policy and
horizon, villages do not mainly starve — they die in the
show. Same shape as the preserveact pilot (arena ~59%).

VILLAGE ASSESSMENT (plain words): these are hardy, well-fed
villages. Every village lived the full 100 days, every one
reached national standing, and the cooks talked about their
work the whole way through — smoking small batches early,
bigger ones later, complaining honestly when the racks were
too full to take more. One village (9754) preserved nothing
at all and still lived 100 days at global standing, on fresh
haul and fast turnover — but why it preserved nothing is
another arm's question, and this arm does not answer it.
What this arm proves is narrower and complete: future runs
that want cook voice in sims can now have it, with numbers
to prove the voice costs nothing.

BALANCED PANEL (§15): not attempted — no game lever changed,
so there is no before/after balance pair to compare. The
CAP=0 vs CAP=1 paired table above is the §15-equivalent
instrument for this instrument-only arm, judged by the GO
rule in the header.

METRIC REVIEW (§14 — for the NEXT run; this verdict is NOT re-scored):
- The 200-sample cap was set from the resolutions scale (~67
  max) without counting that the filter also matches every
  plain cook line (~370 lines on the racks-bound seed). A
  next run using this capture should default SAYCAP to >=
  500, or narrow the filter to worked/racks-full lines only
  if plain cook lines are not wanted. The cap is an
  instrument parameter, not a verdict condition, and the
  9757 re-run above already applies the fix.
- The worked==resolutions validity check earned its keep: it
  caught the cap truncation immediately (23 vs 43) instead
  of letting a truncated sample pass as a complete one.
  Keep it for every future use of this capture.
- Seed 9754's say=0 is consistent-neutral (batches=0), but
  it also means this corpus cannot distinguish "capture
  works" from "nothing fired" on that seed alone — the GO
  rests on the other seven seeds, as it should.
- No other metric doubt: neutrality held on every field,
  published numbers reproduced exactly, and the sense
  quotes carry day, seed, cook, batches, and kcal.

CONVERGENCE STATE for this axis (sim sense-testing instrument):
CONVERGED for the cook-line question. The say-capture stub
(scripts/say-capture.js) is proven: known-line capture,
neutrality, and cook-rich samples all hold. A future run
wanting sense quotes from sims should use this capture
(SAYCAP >= 500) instead of an emit wrapper.

