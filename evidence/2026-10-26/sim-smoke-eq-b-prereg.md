# sim-smoke-eq-b — PRE-REGISTRATION (written AND committed BEFORE any sweep runs)

Run: oversight-flesh-out-loop-b, arm sim-smoke-eq-b
(20261026T2130Z), axis food-economy. MEASUREMENT ONLY:
zero src/js changes, no default flips, no meal or pantry
redesign. This arm is the 2029Z run's next blank (1): the
meal-draw re-prereg with the THREE-TERM smoke equation.
The 2029 verdict was NO-GO because the window equation
omitted the morning smoke: window 28 proves it exactly
(night-28 surplus 2000, 0 draws, 600 left, gap exactly
1400; day-29 worked cook gains exactly 1737 dried kcal
incl. 7x160 = 1120 = 1400 x 0.80 rough yield). The morning
cook smokes the surplus BEFORE the first-cook snapshot.
Do NOT re-score that NO-GO. This arm's verdict is ONLY
whether writes − draws − evidenced smoke closes the
surplus windows.

Prior evidence read first: evidence/2026-10-26/
sim-mealdraw-reprereg-b.md + its prereg
sim-mealdraw-reprereg-b-prereg.md, plus sim-mealdraw-b.md.
Canon: docs/CANON.md + docs/PRESERVATION.md (ladder:
cleaned 2d < cooked 5d < smoked 30d; smoking 16 ticks;
"rot can't be smoked back into food"; smoke yields 0.95
known / 0.80 rough; villager cook smoke: reserve ~2 nights
of pantry draw, soonest-spoiling first, budget ~4000 kcal,
racks-full guard).

## Base pin (binding) — PIN CHANGE, stated explicitly

The 2029 pin f89a9b32d5c652e046caf27c25d2220212673988
("journey-social r57") has MOVED by exactly one file on
the game-tree path list:

  git diff f89a9b32d HEAD -- src/ index.html
    scripts/sweep-stockdoor-b.js scripts/sweep-mealdraw-b.js
    scripts/mealdraw-capture.js scripts/stockdoor-capture.js
    scripts/substrate-capture.js scripts/inflow-capture.js
    scripts/preservesched-resid-capture.js scripts/sim-harness.js
    scripts/policies/
  = scripts/policies/w4dmg-diag.js ONLY (243 lines added).

That file is a wave-4 damage diagnostic policy. It is
never loaded by this substrate: the sweeps require() only
scripts/policies/competent.js, and no game file requires
it. It cannot move a competent-nofeast trajectory. The
current master tip (9490f7da1) differs from this branch
tip by exactly one more such file,
scripts/policies/w4opp-diag.js (287 lines, also an
unloaded diagnostic policy); src/, index.html, harness,
and every reused sweep/capture file are byte-identical
across the 2029 pin, this branch tip, and the master tip.

Per the assignment, the pin is therefore the CURRENT
branch game tree, not the 2029 pin:

Pinned base commit: a02b0c8f2 ("sim-food-economy-round-
2029-b: coordinator evidence", this branch tip at prereg
time). The pin is on the GAME TREE at that commit, not
on the literal branch tip: committing this prereg itself
advances HEAD by evidence-only commits, so literal HEAD
equality would fail on the prereg commit and prove
nothing about trajectories. Leg 0 therefore checks,
before the control sweep, between the sweeps, and after
the judged sweep: (a) the pinned commit is an ancestor
of HEAD, and (b) `git diff <pin> HEAD -- src/ index.html
scripts/sim-harness.js scripts/sweep-stockdoor-b.js
scripts/sweep-mealdraw-b.js scripts/mealdraw-capture.js
scripts/stockdoor-capture.js scripts/substrate-capture.js
scripts/inflow-capture.js scripts/preservesched-resid-capture.js
scripts/substrate-days.js scripts/inflow-days.js
scripts/plainvoice-capture.js scripts/policies/` is EMPTY,
and (c) the worktree holds no uncommitted change under
those paths. The four NEW files of this arm
(scripts/smoke-eq-capture.js, scripts/sweep-smoke-eq-b.js,
scripts/analyze-smoke-eq-b.js, scripts/test-smoke-eq-b.js)
are additive-only: they are committed before any sweep
and must not modify any reused file (verified by (b)
covering every reused path). If any of (a)-(c) fails at
any check, the run STOPS: no judgment is made, the
verdict is NO-GO with leg 0 named, and the evidence
reports the base move. No sweep in this arm runs on any
other game tree.

A fresh stockdoor-only control sweep runs on this pin
FIRST, then the judged sweep; the judged numbers are
judged against that fresh control, never against the
2029 corpora. (Observation only, not a leg: the fresh
control's game-output fields are expected to match the
2029 control corpus exactly, since no loaded file
differs; any mismatch there is reported as a finding.)

## Instrument (NEW, additive-only)

- `scripts/smoke-eq-capture.js` (NEW; sibling capture
  files untouched): wraps Game.resolveOneAssignment
  (game.js: the villager duty resolver; the cook branch
  converts fresh pantry surplus to preserved BEFORE it
  says the cook line) and Game.say (own cook-line
  counter, same COOK_FRAME_RE as the resid capture).
  Per cook-duty call it deep-snapshots the village
  pantry aggregate before/after (class key =
  name|kcalEach|spoilDay|granaryDays|foodState, units and
  kcal) and records: day (branchDay), vid, task,
  cookLinesSeenBefore/After for that day, per-class
  unit/kcal deltas, fresh kcal lost per class, preserved
  kcal gained per class, and the worked line's keptKcal
  parsed from the cook line text when the frame is
  worked. A cook duty's pantry changes are its smoke
  conversions only (the branch credits haven gives, not
  the pantry, then converts, then says the line).
  The wrapper writes ONLY to its own array, writes no
  Game.state, consumes no RNG, and never writes a say
  line. Snapshot reads are try/catch isolated.
- `scripts/sweep-smoke-eq-b.js` (NEW): mirrors
  sweep-mealdraw-b.js exactly (same band, substrate,
  inflow, resid, stockdoor, mealdraw captures, same
  env assertions) PLUS the smoke-eq capture. Output
  names: smoke-eq-b-cap1-pd0-dg1-competent-nofeast-
  s<seed>.json.
- `scripts/sweep-stockdoor-b.js` (control) reused
  UNCHANGED via PERSEED_DIR override.
- New analyzer `scripts/analyze-smoke-eq-b.js`
  (parameterized by corpus directory; reads control
  numbers from the control corpus AT ANALYSIS TIME and
  hardcodes NO prior corpus's numbers) and new proof
  `scripts/test-smoke-eq-b.js`. The analyzer encodes
  leg FORMS from this prereg (exact equality, residual
  exactly 0); thresholds are fixed here, before any
  sweep. Reading a baseline at analysis time is not
  post-hoc threshold-setting.

## Band (pilot; identical to the mealdraw bands)

Seeds 9750-9757, competent-nofeast (COMPETENT_FEAST=0,
FEASTSCALE_R13 unset/0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1), 100d death-aware (villages that die stop
early; +10d tail max per MEASUREMENT.md §10 — the sweeps
stop at death as built), CAP=1. This 8-seed band IS the
pilot gate. Paired reuse of the 9750-9757 band, stated
as such, for comparability with the 2029 windows. No
confirm band is spent unless the pilot legs (0-5) all
pass.

Corpora (new directories; sweep outputs NEVER in /tmp):
- Control: evidence/2026-10-26/
  sim-smoke-eq-b-control-corpus/
  (stockdoor-b-cap1 files, via PERSEED_DIR override).
- Judged: evidence/2026-10-26/
  sim-smoke-eq-b-corpus/
  (smoke-eq-b-cap1 files, via PERSEED_DIR override).

## Primary metric (binding, MEASUREMENT.md §14)

Primary metric: closure of surplus windows under the
THREE-TERM equation, on the pinned base. For a surplus
window D (first-cook day D to first-cook day D+1) on a
seed, the surplus class is ('Foraged food', 200, D+3,
granaryDays null, foodState null); the equation is

  after = before + stockdoorWrites(D) − windowDraws(D)
         − smokeFresh(D)

where before/after are that corpus's own dayPantry
first-cook snapshots for days D and D+1,
stockdoorWrites(D) is the summed stockdoor kcal for
scholar day D, windowDraws(D) is the summed meal-draw
kcal from the surplus class in window D (a draw belongs
to window D iff (day == D and cookLinesSeenToday >= 1)
or (day == D+1 and cookLinesSeenToday == 0), the
mealdraw instrument's own rule), and smokeFresh(D) is
the summed surplus-class fresh kcal lost in cook-duty
calls on day D+1 with cookLinesSeenBefore == 0 — i.e.
every cook duty that runs before the first cook line of
day D+1, including the duty that says that line itself
(its conversion precedes its line) and any duty that
smokes without saying a line. Residual3 = after −
(before + writes − draws − smokeFresh). Gross =
stockdoorWrites(D); surviving pile = after. Both
numbers are reported for every judged window; a night's
gross write is NEVER quoted as its surviving pile.

Known limitation, stated before sweeping: the equation
attributes all surplus-class change inside a window to
the three terms. A three-door write of the EXACT surplus
class inside a window (inflow records carry no spoilDay,
so such writes cannot be attributed to a class) would
break closure as a positive residual. That is not
absorbed or adjusted: a non-zero residual fails the leg,
and the cause, if identified, is reported as a finding.
The 2029 windows closed exactly on 67/81 two-term
windows, so such writes are at most rare on this band.

GO threshold — ALL of the following must hold:

0. Base pin: the pinned commit is an ancestor of HEAD
   and the game-tree diff to the pin (paths listed
   under "Base pin") is empty at all three checks
   (before control, between sweeps, after judged),
   with no uncommitted change under those paths.
1. Control gate: the stockdoor-only control sweep
   completes 8/8 seeds with no truncation flag on any
   file (inflow, resid, stockdoor, cook, event) and no
   write failure. The control summary (pre-fourth-door
   view: bound/attributed/unattributed,
   attribution-flag reproduction, lag distribution,
   median lag, coverage, residuals; stockdoor grosses;
   dayPantry endpoints) is recorded VERBATIM from the
   control corpus. The control numbers are DERIVED from
   the pinned HEAD, not pre-specified.
2. Determinism / instrument neutrality: the judged
   corpus matches the control corpus on EVERY
   game-output field on all 8 seeds (dayTable classes,
   attribution flags, daysAlive, deaths, deathCauses,
   rank, waveReach, national/table/win, endReason).
   The ONLY permitted per-seed differences are the
   added `mealDrawRecords` and `smokeEqRecords` fields
   and run timings (instrument output). Any other
   mismatch is an instrument effect and fails this leg.
3. Three-term surplus-window reconciliation (focus
   seed 9750): every CHECKABLE surplus window on seed
   9750 closes with residual3 exactly 0. A window is
   checkable iff stockdoorWrites(D) > 0 on day D AND
   both dayPantry endpoints (D and D+1) exist in the
   judged corpus. At least 3 checkable windows are
   required; fewer is a leg failure for lack of
   evidence, not a pass. Two-term residuals are
   reported alongside every window for diagnosis, but
   they are NOT judged: only the three-term residual
   is the leg.
4. Residual disposition, stated per-seed explicitly:
   the control corpus's pre-fourth-door view is
   computed with the identical counting rules of
   analyze-mealdraw-b.js (three doors only: stock,
   deposit, pantryAdd) and its residual list is
   reported VERBATIM. For EVERY present residual
   (seed S, day Y), the surplus window covering that
   day on THAT seed must close under leg 3's
   three-term equation (for a residual day Y the
   covering window is the window whose day is Y-1
   under the prior arm's convention, verified in the
   analyzer output; the evidence names the window it
   checked). If NO residual is present on a seed, that
   absence is a finding, not a leg failure. Demanding
   old residuals on a new base is an error; absence
   cannot fail this leg — but the evidence must say
   which residuals were present and which windows
   covered them, in plain words.
5. Cross-checks (judged corpus): (a) every
   villager-home meal call: freshTaken + spoiledGot ==
   ret.drawn, 0 mismatches; (b) every drawSpoiled: got
   == before/after diff sum, 0 mismatches; (c) no
   mealdraw truncation on any file; (d) ctxKcalMatch 0
   mismatches; (e) resid join 0 misses; (f) worked-line
   cross-check: the day-29 first-cook smoke record(s)
   on focus seed 9750 must reproduce the 2029 worked
   line EXACTLY — total preserved gain 1737 kcal, of
   which surplus-class fresh 1400 kcal (preserved
   1120 kcal). These numbers are pre-registered here
   from the 2029 evidence, not picked after this
   sweep: the swept tree is trajectory-identical to
   the 2029 pin for this substrate, so a mismatch
   here means the trajectory moved and fails loudly.
   The analyzer also parses keptKcal from each worked
   line at sweep time and reports
   |keptKcal − total preserved gain| per worked call
   as a diagnostic (not a gate).
6. Confirm (ONLY if legs 0-5 pass; otherwise NO
   confirm spend — the pilot gate binds): confirm band
   seeds 9780-9795 (16 seeds), same policy/horizon/
   CAP, control + judged sweeps on the pinned HEAD
   (pin re-verified per leg 0 before each), into
   sim-smoke-eq-b-confirm-control-corpus/ and
   sim-smoke-eq-b-confirm-corpus/. Band-freedom check
   at prereg time: no file in evidence/2026-10-26/
   carries a 9780-9795 seed number, and no
   sim-mealdraw-reprereg-b-confirm* directory exists
   (the 2029 arm spent no confirm) — the band is free.
   Confirm GO requires: (a) neutrality judged==control
   on all 16 seeds on every game-output field (same
   field list as leg 2); (b) cross-checks pass as in
   leg 5 (worked-line gate 5f applies to the confirm
   focus seed only if that seed's trajectory carries
   a day-29 worked line; otherwise 5a-5e); (c) every
   checkable surplus window across all 16 seeds closes
   with residual3 exactly 0, with at least 8 checkable
   windows in total (fewer is a confirm failure for
   lack of evidence). If any confirm requirement
   fails, the final verdict is NO-GO with the confirm
   leg named.

GO iff legs 0-6 all hold (legs 0-5 for the pilot
verdict; leg 6 spent only on a pilot GO). Any miss is
NO-GO with the failing leg named, never re-scored;
metric doubts go under "metric review" in the final
evidence. The prior arms' verdicts stand under their
own headers; this arm judges only the three-term
equation on the pinned base.

## Horizon / seeds / policies

Horizon 100d death-aware (above). Pilot seeds
9750-9757; confirm seeds 9780-9795. Policy
competent-nofeast as above. Wall numbers reported from
the judged corpus (pilot) and the confirm judged corpus:
national / table / wins, wave 4-5 reach, median
survival, death causes, wave reach. A sense-test (one
real cook-line sequence read and judged for meaning vs
the recorded smoke) is reported in the final evidence,
not in this prereg, and is not a GO leg.

## Balanced panel (MEASUREMENT.md §15)

No balance-panel comparison exists for this arm: §15
panels compare a base Game root against a lever-applied
Game root over panel-driver observer rows, and this arm
applies NO lever and changes NO game code — the before/
after comparison here is instrument-off (control) vs
instrument-on (judged) on identical seeds, judged by
exact per-field equality (leg 2), which is strictly
stronger than a 23-metric panel aggregate for an
instrument-neutrality question. Running panel builds
would compare identical roots through a different
harness and prove nothing about this instrument. The
determinism comparison in legs 2/6a IS this arm's
before/after comparison, and the evidence file states
this rather than attaching a panel compare .md.

## Metric review (pre-sweep doubts, for the record)

- The smokeFresh definition assumes every pre-first-line
  cook duty's conversion precedes the snapshot. That is
  the resid wrapper's own timing (it snapshots inside
  the say wrapper, after game code has converted and
  said the line), so it holds by construction — but if
  a cook duty ever smokes WITHOUT saying a cook line,
  its smoke is still counted (cookLinesSeenBefore == 0
  persists until the first line), which is the correct
  treatment, not a leak.
- The reserve rule means the first cook's smoke need
  not touch the surplus class at all (sooner-spoiling
  stock can absorb the whole reserve); smokeFresh(D)
  is then 0 and the window must close two-term. The
  leg does not assume smoke is present every window.
- If leg 3 fails with residuals that are NOT explained
  by any smoke record, the next run's question is
  whether a fourth consumer exists (three-door writes
  inside the window are the named suspect) — not a
  re-scoring of this run.
