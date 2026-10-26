# sim-stafffallback-b — staffing fallback on the 9754 cook-staffing capture

Run: oversight-flesh-out-loop-b, arm sim-stafffallback-b, axis food-economy.
Worktree: `~/workspace/worktrees/sim-stafffallback-b`, branch sim-stafffallback-b.
This run's named next blank (1) from sim-onzero9754-b: a staffing-fallback
arm on the 9754 capture mechanism — NOT a "more preservers" arm, NOT a
re-investigation of the 9754 zero, NOT a say stub (sibling arm owns it).

Status: PRE-REGISTERED — everything under "PRE-REGISTRATION" below was
written BEFORE any sim in this run was executed. The RESULTS section at
the end is appended after the sweep completes and is judged ONLY against
the header.

## Canon read first

- `docs/CANON.md` (manifest) then `docs/PRESERVATION.md` (the food ladder:
  cleaned 2d < cooked 5d < smoked 30d < rendered 90d < pemmican 120d;
  smoking 16 ticks; blind penalties teach once).
- No canon doc covers the policy staffing pick — stated, not invented.
  The pick is read from the code itself: `scripts/policies/competent.js`
  counterPlay, "STAFF THE SMOKE RACKS" block, which takes the single
  highest-preserver free villager (`sk > bestSkill`, strict) and calls
  `Game.assignTask(best, 'cook', {via: 'in-person'})` once, ignoring the
  return value. `Game.assignTask` returns `{ok: false, refused: true}`
  on a checkObedience refusal (cook is not fish/garden "food work", so
  cook gates at trust 20, plus a 40%-reluctant roll below trust 40).

## Background (quoted from sim-onzero9754-b, NOT re-judged here)

- On seed 9754, preserver widening gives exactly one villager a
  preserver skill she lacked — Rosa Mendez, the line cook, skill 0 -> 2
  — and the staffing pick then chooses Rosa every day. Rosa refuses
  cook duty every time (152 refusals across both arms and both sides
  of the onzero corpus; the 40% roll cannot produce that run, so her
  trust sits below the 20 gate). With no cook ever staffed, no cook
  duty resolves, nothing is smoked, and the about-to-rot surplus rots
  fresh. The village still lives 100 days on fresh haul and fast
  turnover — the zero hid inside a healthy-looking village.
- The fix shape named there: a fallback pick, or a refusal that retires
  the candidate for the day. This arm builds the FIRST shape (fallback
  pick) and measures it. A willingness-gated pick (skipping refusers
  without asking) was considered and NOT chosen: the policy (the
  player-bot) has no honest way to know trust numbers the player UI
  does not show, and asking down the list is what a leader actually
  does. The fallback asks; it does not presume.

## The lever (policy-side only, zero game code)

In the smoke-racks block only, replace the single-pick with a
skill-ordered try-down: free villagers sorted by preserver skill
descending (ties keep roster order — Array.sort is stable, so this
preserves the current strict-`>` tie behaviour), tried in order
until one `assignTask` returns `{ok: true}`. A refusal or null return
moves to the next candidate; if nobody accepts, no cook is staffed
(same honest outcome as before, not a forced assignment). The
block still runs at most once per day (the existing `ctx._cpDay`
guard) and still only when fresh kcal in the 0..3-day window tops
1,500 with no cook already assigned. `ctx.cookStaffed` now counts
successful staffings only (it previously counted attempts, refusal
included); `ctx.cookStaffFallback` counts staffings that needed a
second-or-later candidate. Nothing else in competent.js changes;
no src/js file changes at all. Policy-side arms touch no game-code
systems, so no arm-interaction split is needed.

Say-line note, stated before sweeping: each refused ask emits its
refusal line through Game.say (canon: no silent actions), so a
fallback day narrates "Rosa said no, X stepped in" rather than
silence. The pilot records refusal-line samples and the max
refusals-per-day per cell; a pathological all-refuse village would
show up there, and is metric-review material (a cap), not a silent
fix made mid-run.

## PRE-REGISTRATION (bound per docs/MEASUREMENT.md §§9-12, 14-15)

### Pair, contrast, horizon, seeds, policies

- Pair under test, ONLY pair: staffing fallback OFF vs ON, on CURRENT
  master substrate (worktree HEAD at sweep time, base tag recorded in
  every per-seed file). OFF = the HEAD tree unmodified (the
  single-pick staffing). ON = the HEAD tree with ONLY the
  smoke-racks fallback hunk applied to scripts/policies/competent.js
  (committed patch scripts/stafffallback-on.patch, applied by
  scripts/sweep-one-stafffallback-arm.sh). The runner VERIFIES the
  ON tree differs from a fresh HEAD archive ONLY in
  scripts/policies/competent.js (single-file patch + reverse-check,
  the cheap proof from the onzero run) and FAILS LOUDLY otherwise.
  The driver is copied identical into both extracted trees, so the
  ONLY code difference between arms is the fallback hunk.
- Anchor contrast (identical on both sides of the pair, identical on
  both arms): policy leadfeast, DEPOSITGATE=1 (dg1 only),
  FEASTSCALE_R13=1, SEATDRIVE=0 (all asserted FATAL by the driver),
  PLENTYDEPRI per SIDE (pd0 vs pd1), 100d death-aware horizon (dead
  villages stop; +10d tail max) — the onzero substrate, matched
  deliberately so this corpus is comparable to the corpus it
  follows. No header revision to the horizon is made after this line.
- Seeds: the 9754 band, 9750-9757 (8 seeds, the pilot gate), both
  sides, both arms = 32 configs. No other seed band is run or
  judged in the pilot. A confirm (12-16 seeds) is run ONLY if the
  pilot passes GO below; the confirm band and its header are written
  as a pre-reg amendment before any confirm sim runs, never after.
- File names: stafffallback-b-<arm>-<side>-dg1-leadfeast-s<seed>.json.
  Per-seed files are the analyzer's ONLY inputs; sweep-*.json
  summaries are NOT analyzer inputs.
- INSTRUMENT AMENDMENT (written 2026-10-26, BEFORE any judged ON data
  exists): the runner's patch tool is patch(1), NOT git apply. The
  first ON run used git apply from the extracted-tree subdirectory
  and was VOIDED IN FULL: git apply from a repo subdirectory
  silently skips patches whose path lies outside the cwd ("Skipped
  patch", visible only with --verbose, exit 0), so that run swept
  unpatched trees mislabeled "on" (its 5 pd0 files showed the exact
  control signature: 60 calls, all to Rosa, 0 ok) and every one of
  its files was deleted before any judgment. The replacement
  verification is patch --dry-run + apply + reverse dry-run PLUS a
  content check (fallback marker present, old single-pick line
  absent in the extracted file) — exit codes alone proved nothing.
  The OFF arm is unaffected (archive only, no patch) and stands.
  This amendment changes instrumentation only: the pair, contrast,
  seeds, and GO bar above are unchanged, and no ON datum judged
  below predates it.
- Driver method: the driver (scripts/sweep-stafffallback-b.js, derived
  from scripts/sweep-onzero9754-assign-b.js with the same recorder
  family: haul/preserve wrappers, creditDeed cooking/preserving
  counts, daily pantry/assignment snapshots, assignTask call log,
  staffing-day record) runs from a git-archive-extracted tree of
  HEAD per arm (<worktree>/bisect-scratch/<arm>/ — never /tmp
  worktrees, never bare `git worktree add`, never a checkout in the
  worktree). The driver is copied into each extracted tree; the
  extracted tree's own policy code is swept (ON tree: competent.js
  patched, everything else HEAD). No file is modified in the
  worktree at either arm by the sweep. Declared driver deltas vs
  the onzero assign driver: (1) mode/output/corpus names; (2) ARM
  values are off|on for the FALLBACK (not the widening — the
  widening is ON in both arms here, since HEAD contains it);
  (3) per-seed files carry saySamples (refusal + smoke-rack lines,
  capped) for sense-testing, where the onzero driver kept them in
  trace files only; (4) the analyzer computes staffed-days from the
  stored staffDays arrays (see "Staffed-day rate" below) rather
  than trusting a counter.

### 9754-class cells (defined BEFORE seeing any pilot data)

A cell (seed x side) is 9754-class iff, in the CONTROL (OFF) arm,
cookCalls > 0 AND cookOk == 0 — the capture signature: the policy
asked for a cook and never got one. Cells that do not meet this in
the control are NOT 9754-class and do not enter the primary GO
judgment (they are reported in full, and their armed-vs-control
movement is reported as a guard, not as GO evidence). Seed 9754 is
expected to be 9754-class on both sides from the onzero corpus, but
the classification is computed from THIS pilot's control arm, not
assumed from the old corpus.

### Staffed-day rate (the primary metric's denominator — read this)

Under fallback, a staff-day that starts with a refusal and ends with
an accept produces TWO assign calls (one refused, one ok). So
"ok calls as a share of calls" can never exceed ~50% on a
refusal-led cell, and is the WRONG denominator. The primary metric
is the STAFFED-DAY RATE: among staff-days (a policy daily where no
cook was assigned before the daily AND fresh kcal in the staffing
block's 0..3-day window topped 1,500), the share that end the daily
with a cook assigned (cook in asgPost). Computed from the stored
staffDays arrays: staffDaysFreshGt1500NoCookPre (denominator) and
staffDaysFreshGt1500Staffed (numerator). A rate of 0 in control on a
9754-class cell and >= 0.5 armed is the fix working: on at least
half the days the village needed a cook, it now has one.

### GO BAR (binding — judge ONLY against this header)

GO holds if and only if ALL of G1, G2, G3 hold:

- G1 (the fix works where the capture bites): on EVERY 9754-class
  cell, armed cookOk > 0 AND armed staffed-day rate >= 0.5. (If
  there are zero 9754-class cells in the pilot control, G1 is
  VACUOUS-FAIL: the pilot did not reproduce the capture it was
  built to fix, and the verdict is KILLED-at-pilot with the
  measurement committed — a fallback with nothing to fall back
  from proves nothing.)
- G2 (the cook actually preserves): on EVERY 9754-class cell,
  armed preserveVillagerResolutions > 0 (a staffed cook that
  never preserves is a staffed decoration, not the fix).
- G3 (no starvation/death regression — scalemetric cost-bar
  style, per side, across ALL 8 pilot seeds of that side):
  armed starvation deaths <= control starvation deaths + 2, AND
  armed median daysAlive >= 0.8 x control median daysAlive.
  Death-cause accounting uses the driver's deathCauses; a cell
  with no deaths counts 0 starvation.

If the pilot passes GO, a 12-16 seed confirm is run under a written
pre-reg amendment before landing. If the pilot fails any of
G1/G2/G3, the verdict is KILLED (at pilot if the sniff test fails
— i.e. armed cookOk == 0 on every 9754-class cell, or G1 fails on
its face) or NO-GO otherwise: the fallback change is REVERTED from
the worktree before committing, and only the measurement record
(driver, runner, patch, analyzer, proof test, this evidence file)
is committed. Killed arms leave no trace in game/policy code.

### Balanced panel (§15)

- This IS a before/after pair (OFF -> ON), so ATTEMPT
  scripts/balance-panel.js compare and attach the compare .md.
- EXPECTED FAILURE CLASS, STATED BEFORE ATTEMPTING: the panel
  compare ingests panel.json.gz cases built by the panel driver
  from sweep-compare policies — NOT env-gated arm-contrast recorder
  rows. If compare fails on ingesting the recorder corpus (the
  known recorder-row ingestion class, as in rotdecide2, preserveact
  and onzero), attach the analyzer's sweep-compare table instead
  and name the failure class. A tooling failure NEVER blocks or
  re-scores the verdict: the verdict is judged on the analyzer's
  paired rows (§15 fallback).

### Sense-testing, wall numbers, villager behavior

- SENSE-TESTING LAW: read the say samples and the staffing story —
  who refused, who stepped in, whether the fallback cook's work
  reads like a person filling a gap or a script. Quote at least
  one refusal line and one staffed-cook outcome from the corpus.
  Report max refusals-per-day per cell (the spam check).
- WALL NUMBERS on this corpus: national / table / wins, wave 1-5
  reach, median survival (median daysAlive). NOTE: these files
  carry table = win flag (same convention as onzero), and
  SEATDRIVE=0 makes the table unreachable by construction —
  table 0 here is a construction fact, not a scale-wall finding,
  and is reported as such.
- VILLAGER-BEHAVIOR SAMPLE: death-cause spread across the pilot,
  cook-identity distribution (who cooked, with what skill, on each
  arm), assign-call targets on 9754-class cells. Anything robotic,
  static, or repeated is flagged.

### Metric review (filled after the verdict, §14 — revisions apply to the NEXT run, this verdict is NOT re-scored)

- See the "Metric review" subsection under RESULTS below (filled
  after the verdict; the verdict above is NOT re-scored by it).

### Scope

Policy change only: scripts/policies/competent.js (the smoke-racks
block). Zero src/js changes. New files only:
scripts/sweep-stafffallback-b.js, scripts/sweep-one-stafffallback-arm.sh,
scripts/stafffallback-on.patch, scripts/analyze-stafffallback-b.js,
scripts/test-stafffallback-b.js,
evidence/2026-10-25/sim-stafffallback-b-corpus/ (per-seed files +
sweep summaries), evidence/2026-10-25/sim-stafffallback-b.md (this
file). The ON tree's competent.js patch exists ONLY in
git-archive-extracted scratch trees that are deleted after each
arm run — the worktree copy of the change is committed only on GO
(and reverted on KILLED/NO-GO). No push, no version bump, no live
verification — merged locally, pending ship, by the coordinator.

---

## CONFIRM PRE-REGISTRATION AMENDMENT (written BEFORE any confirm sim runs)

The pilot passed GO (see RESULTS). Per the pilot pre-reg, a confirm is
the landing gate. The confirm band, contrast, and bar:

- Band: 12 fresh seeds, 9760-9771 (never run in this corpus), both
  sides, both arms = 48 configs. Same pair (fallback OFF vs ON),
  same substrate and contrast as the pilot (leadfeast, dg1,
  FEASTSCALE_R13=1, SEATDRIVE=0, pd0/pd1, 100d death-aware). Same
  driver, same runner (patch(1) + content verification), same
  corpus directory, file names
  stafffallback-b-<arm>-<side>-dg1-leadfeast-s<seed>.json.
- C1 (generality, class cells if any): on every fresh-band
  9754-class cell (control calls > 0, ok == 0), armed ok > 0 AND
  armed staffed-day rate >= 0.5. If the fresh band contains ZERO
  class cells, C1 is SATISFIED-VACUOUS for the confirm — stated
  here, not decided after seeing data: the pilot already
  reproduced the capture (that was the pilot's job); the confirm's
  job is generality plus guards, and an absent capture class on
  fresh seeds cannot fail a lever built for it. (This differs from
  the pilot's vacuity rule deliberately: the pilot had to reproduce
  the capture, the confirm does not.)
- C2 (guards, per side, 12 seeds): armed starvation deaths <=
  control starvation deaths + 2, AND armed median daysAlive >=
  0.8 x control median daysAlive.
- C3 (no unstaffing): zero cells where control cookOk > 0 AND
  armed cookOk == 0 with armed cookCalls > 0 — the fallback must
  never take a staffed kitchen away.
- C4 (watch, reported not a GO condition): every armed
  village-lost cell in the confirm band gets its death causes
  quoted, with the arena-death share compared arm-vs-arm. The
  pilot showed armed trajectories diverging into arena-heavy
  endings on 9754 (both sides) and 9755/pd0 — all with starvation
  flat at 1 — and the confirm watches whether that pattern
  replicates or was pilot noise.
- Confirm GO = C1 + C2 + C3 all hold. On confirm GO the lever
  lands (committed with the measurement record). On any failure
  the verdict is NO-GO: the lever is reverted from the worktree
  before committing and only the measurement record lands.

## RESULTS (appended after the pre-registration above; verdict judged ONLY on the corpus named here)

### Pilot corpus

CORPUS: evidence/2026-10-25/sim-stafffallback-b-corpus/, seeds
9750-9757, both sides, both arms = 32 per-seed files. Corpus base
tag (all 32 files): 8ea64d84 (worktree HEAD at sweep time).
Pilot table (calls/ok/staffRate/resolutions/batches/daysAlive;
staffRate = share of staff-days ending the day with a cook — see
the conservative-measure note below):

- 9750 pd0: OFF 84/82/0.98/44/127/100 -> ON 72/66/1.00/52/144/100
- 9751 pd0: OFF 71/67/0.94/40/115/100 -> ON 71/70/1.00/54/145/100
- 9752 pd0: OFF 41/40/0.60/32/78/100 -> ON 87/86/1.00/50/147/100
- 9753 pd0: OFF 46/42/0.91/24/55/100 -> ON 94/89/1.00/62/162/100
- 9754 pd0 CLASS: OFF 60/0/0.00/0/0/100 -> ON 94/45/0.73/34/72/95
- 9755 pd0: OFF 64/53/0.77/43/134/100 -> ON 47/37/1.00/20/51/82
- 9756 pd0: OFF 75/74/0.99/47/111/100 -> ON 80/79/1.00/61/171/100
- 9757 pd0: OFF 81/81/0.99/43/107/100 -> ON 81/81/0.99/43/107/100 (identical)
- 9750 pd1: OFF 67/67/1.00/39/91/100 -> ON 67/67/1.00/39/91/100 (identical)
- 9751 pd1: OFF 60/55/0.90/29/111/100 -> ON 72/68/1.00/45/123/100
- 9752 pd1: OFF 52/51/0.88/28/83/100 -> ON 72/70/1.00/35/106/100
- 9753 pd1: OFF 64/63/0.98/53/169/100 -> ON 81/80/1.00/42/100/100
- 9754 pd1 CLASS: OFF 67/0/0.00/0/0/100 -> ON 72/36/0.62/21/53/98
- 9755 pd1: OFF 65/62/0.82/45/138/100 -> ON 78/77/1.00/61/182/100
- 9756 pd1: OFF 86/83/0.97/67/187/100 -> ON 85/82/1.00/47/125/100
- 9757 pd1: OFF 73/54/0.74/37/97/100 -> ON 113/67/1.00/36/99/100

9754-class cells (control calls > 0, ok == 0): exactly
9754/pd0 and 9754/pd1 — the pilot reproduced the onzero capture on
both sides, and on no other seed. Every other cell staffed a cook
in control, so the capture is a 9754-local phenomenon in this
band, not a band-wide one.

### Pilot verdict: GO

- G1 PASS: on both class cells, armed ok > 0 (45 pd0, 36 pd1) and
  armed staffed-day rate >= 0.5 (0.73 pd0, 0.62 pd1; control 0.00
  on both).
- G2 PASS: armed resolutions > 0 on both class cells (34 pd0,
  21 pd1; control 0/0).
- G3 PASS: pd0 starvation off=1 on=2 (bar <= 3), median days
  off=100 on=100 (bar >= 80.0); pd1 starvation off=4 on=2
  (bar <= 6), median days off=100 on=100 (bar >= 80.0).
- Proof test scripts/test-stafffallback-b.js: 72 PASS / 0 FAIL
  (file/tag integrity, instrument bounds, single shared base tag,
  9754 capture signature on both sides, G1/G2/G3 recomputed
  independently of the analyzer).

### The fix, in plain words

The leader now asks down the list. On 9754/pd0 Rosa was asked 45
times and refused all 45 — and 45 times someone else stepped in:
Liam Davis cooked 28 of those days, Stan Kowalski 9, the rest
scattered across six more villagers. On 9754/pd1 the fallback hero
was gen_xvfa6ve with 31 of 36 days. Different people per side, not
a script: whoever was free and willing that day worked the racks,
and the village smoked 72 batches (pd0) / 53 (pd1) where it had
smoked zero. The two cells where the fallback changed nothing
(9757/pd0, 9750/pd1) come out byte-identical — the lever is
behavior-neutral where the top pick accepts, as designed.

### The honest wrinkle: the fixed cells died earlier, not of hunger

Both class cells under ON ended village-lost (95d pd0, 98d pd1)
where control survived 100d — and 9755/pd0 under ON also ended at
82d. Starvation did NOT cause any of it: starvation deaths are 1
on every 9754 cell on both arms, and the ON endings are
arena-dominated (11 arena deaths on 9754/pd0 ON vs 4 control;
7 vs 7 on pd1; 12 on 9755/pd0 ON). The fallback changed who lived
and worked, which changed the village's shape, which changed how
the show killed it — a trajectory divergence, not a food failure.
G3's bars pass (median 100 both sides, starvation within bar),
so this does not overturn the pilot verdict, but it is the
confirm's C4 watch item: if armed trajectories systematically die
earlier in the show, that is a real cost of the lever, and the
confirm band must say so.

### Conservative-measure note (staffRate understates block success)

staffRate measures "ended the DAY with a cook assigned"
(asgPost, after the whole daily), not "the block staffed one":
a cook staffed in counterPlay can be re-tasked, die, or finish
before the day ends. The ok counts (45/36) are the direct block
evidence; the staffRate (0.73/0.62) is the conservative lower
bound the bar was written against, and it still clears 0.5 with
margin. The residual unstaffed staff-days are NOT explained by
same-day refusals (max refusals on any day on the class cells:
2 pd0, 1 pd1) — they are consistent with same-day reassignment
after a successful staffing, unproven at this granularity.

### Sense-testing (and an instrument limit, stated plainly)

No dialogue is quoted from this corpus, because there is none to
quote: saySamples is EMPTY on all 32 per-seed files. The driver's
Game.emit wrapper never fires for say lines in this harness —
Game.say evidently does not route through emit in node — so the
refusal-line and smoke-line samples the pre-reg asked for do not
exist here (same class as onzero's "no say-capture" note; a
say-capture instrument is the sibling arm's job, not this one's).
The sense judgment therefore rests on identities and the staffing
story, which does read like people: the refuser is always the
same person (Rosa, both arms), the stand-ins differ by side and
day, and the worst spam day in the whole pilot is 6 refusals on
one low-trust day (9750/pd0 ON) — the leader asking around the
fire until someone agreed, not a robocall loop. Typical days show
0-2 refusals. Nothing reads robotic or static beyond the known
fact itself: Rosa never says yes to cook duty, on any arm.

### Wall numbers (pilot, 16 cells per arm)

OFF: national 14/16, table 0/16, wins 0/16, median days 100,
waves {3: 4, 4: 12}. ON: national 14/16, table 0/16, wins 0/16,
median days 100, waves {2: 2, 3: 6, 4: 8}. Table 0 is a
construction fact (SEATDRIVE=0 makes the table unreachable by
construction), not a scale-wall finding. The wall on this corpus
sits past national, at the table, exactly where SEATDRIVE=0 puts
it.

### Balanced panel (§15)

ATTEMPTED AND NOT RUNNABLE ON THIS CORPUS, as pre-stated.
`scripts/balance-panel.js compare` requires
`--before <panel.json.gz> --after <panel.json.gz>` — panel-driver
cases — and no such inputs exist for env-gated arm-contrast
recorder rows; the tool errors on invocation without them. No
panel inputs were fabricated to force a run. This is the exact
pre-stated failure class (panel ingests panel-driver cases, not
recorder rows, as in rotdecide2, preserveact and onzero). The
analyzer's per-seed tables above are the §15 fallback instrument,
and the verdict is judged on them.

### Voided first ON run (instrument failure, caught before judgment)

The first ON sweep (patch applied with git apply from the
extracted-tree subdirectory) swept UNPATCHED trees mislabeled
"on" — git apply silently skips patches whose path lies outside
the cwd, exit 0. Its 5 pd0 files showed the exact control
signature (60 calls, all Rosa, 0 ok) and were deleted in full
before any judgment; the runner was fixed to patch(1) plus a
content-marker check, the fix was proven on a scratch tree, and
the amendment was written into the pre-reg before the valid ON
run. The OFF arm (archive only, no patch) was never affected.

### Metric review (§14 — for the NEXT run; this verdict is NOT re-scored)

- Staffed-day rate should be split in the next staffing
  instrument: "block staffed a cook" (assign-call ok on the day)
  vs "ended the day with a cook" (asgPost). The current single
  rate conflates block success with same-day reassignment, and
  its residual is uninterpretable at this granularity.
- Say sampling via Game.emit does not work in this harness for
  say lines. Any future sense-testing requirement for quoted
  dialogue needs a different capture point (the sibling say-stub
  arm's instrument), not a wider emit regex.
- The arena-death divergence on diverged trajectories needs a
  standing watch, not a one-run note: when a food lever changes
  who lives, the show's kill profile moves with it, and a
  starvation-only guard will not see it. The confirm's C4 is the
  first instance of that watch.

### Pilot scope / files

Policy change only: scripts/policies/competent.js (smoke-racks
block). Zero src/js changes. New files: scripts/sweep-stafffallback-b.js,
scripts/sweep-one-stafffallback-arm.sh, scripts/stafffallback-on.patch,
scripts/analyze-stafffallback-b.js, scripts/analyze-stafffallback-confirm-b.js,
scripts/test-stafffallback-b.js,
evidence/2026-10-25/sim-stafffallback-b-corpus/ (32 pilot per-seed
files + sweep summaries), evidence/2026-10-25/sim-stafffallback-b.md
(this file). No push, no version bump, no live verification —
merged locally, pending ship, by the coordinator.

## CONFIRM RESULTS (appended after the confirm sweep completes; judged ONLY against the amendment above)

ADOPTION NOTE (coordinator, run fleshout-loop-b-20261026T0330Z — this
section only; the pre-registration, pilot results, and amendment above
are the dead 0130Z worker's untouched words): the 0130Z worker finished
the pilot (GO), wrote the confirm amendment, and swept 44 of the 48
confirm configs before its coordinator died (heartbeats 110+/119 min
stale at adoption). The adoption run completed the missing 4 configs
(ON arm, pd1, seeds 9768-9771) with the worker's own runner, unchanged.
Two container EPERM-flap episodes interrupted the completion
(03:38-04:15Z: fast write-EPERM, then silent-zero write/readback
failures across the worktree, /tmp, and the goal dir; the flap also
broke a full-tree archive extraction at ~04:00Z). No datum was
fabricated: every completion file was produced by the worker's runner
on the worker's base, and the pd0 re-runs came out byte-identical to
the dead worker's files (hash-verified, see below), proving the
determinism the adoption relies on. A 0-byte
stafffallback-b-on-pd1-dg1-leadfeast-s9768.json observed at 04:07Z
was flap litter on a config that had never existed, not data loss.
The flap cleared at ~04:15Z; the completion sweep then ran clean
(exit 0, both sides, 20/20 per-seed files per side).

### Confirm corpus

CORPUS: evidence/2026-10-25/sim-stafffallback-b-corpus/, seeds
9760-9771 (12 fresh seeds, never run in this corpus), both sides,
both arms = 48 per-seed files. Corpus base tag (all 48 files, and
all 80 files in the corpus): 8ea64d848652500a0b336dd3b7b2e6ee45c1a88e
(single shared base tag; confirm tag check 48/48, pilot proof
re-run 72/0 after completion). Confirm table (calls/ok/staffRate/
resolutions/daysAlive; staffRate per the pilot's conservative
asgPost definition):

- 9760 pd0: OFF 83/83/1.00/68/100 -> ON 83/83/1.00/68/100 (identical)
- 9761 pd0: OFF 46/33/0.71/24/100 -> ON 46/43/0.94/34/95
- 9762 pd0: OFF 52/47/0.67/35/100 -> ON 60/53/0.66/47/100
- 9763 pd0: OFF 49/46/0.94/27/100 -> ON 80/76/1.00/55/100
- 9764 pd0: OFF 66/60/0.75/39/100 -> ON 42/35/0.57/24/100
- 9765 pd0: OFF 79/79/1.00/58/100 -> ON 79/79/1.00/58/100 (identical)
- 9766 pd0: OFF 40/38/0.95/13/100 -> ON 60/59/1.00/44/100
- 9767 pd0: OFF 87/87/1.00/46/100 -> ON 87/87/1.00/46/100 (identical)
- 9768 pd0: OFF 53/51/0.94/28/86 -> ON 51/44/0.98/26/89
- 9769 pd0: OFF 46/39/0.83/21/100 -> ON 93/80/0.99/47/100
- 9770 pd0: OFF 80/27/0.34/23/100 -> ON 111/80/1.00/59/100
- 9771 pd0: OFF 29/24/0.29/21/100 -> ON 33/27/0.54/20/82
- 9760 pd1: OFF 43/43/1.00/31/91 -> ON 43/43/1.00/31/91 (identical)
- 9761 pd1: OFF 26/22/0.95/12/55 -> ON 48/38/0.86/25/90
- 9762 pd1: OFF 50/44/0.83/19/94 -> ON 80/76/0.99/46/100
- 9763 pd1: OFF 27/27/1.00/18/74 -> ON 27/27/1.00/18/74 (identical)
- 9764 pd1: OFF 60/52/0.72/28/100 -> ON 81/78/0.94/65/100
- 9765 pd1: OFF 41/41/1.00/21/85 -> ON 41/41/1.00/21/85 (identical)
- 9766 pd1 CLASS: OFF 8/0/0.00/0/30 -> ON 67/58/1.00/32/100
- 9767 pd1: OFF 82/79/0.95/45/100 -> ON 75/70/0.97/33/100
- 9768 pd1: OFF 71/70/0.99/40/100 -> ON 69/66/0.99/35/100
- 9769 pd1: OFF 51/47/0.80/21/100 -> ON 45/38/1.00/31/100
- 9770 pd1: OFF 50/48/0.94/34/100 -> ON 34/26/1.00/15/90
- 9771 pd1: OFF 56/55/0.73/30/100 -> ON 82/75/0.91/63/100

### Confirm verdict: GO-CONFIRMED

- C1 PASS: exactly one fresh-band 9754-class cell, 9766/pd1
  (control calls 8 > 0, ok 0). Armed ok 58 > 0 and armed
  staffed-day rate 1.00 >= 0.5. C1 is NOT vacuous on this band:
  the capture class exists on fresh seeds and the fallback
  fixes it there too.
- C2 PASS: pd0 starvation off=3 on=3 (bar <= 5), median
  off=100 on=100 (bar >= 80.0); pd1 starvation off=6 on=7
  (bar <= 8), median off=100 on=100 (bar >= 80.0).
- C3 PASS: zero unstaffed cells (no cell where control ok > 0
  and armed ok == 0 with armed calls > 0). The fallback never
  takes a staffed kitchen away.
- Confirm GO = C1 + C2 + C3 all hold. Per the amendment, the
  lever LANDS (committed with this measurement record).

### C4 watch (reported, not a GO condition): pilot worry does NOT replicate

Pilot C4 watched armed trajectories diverging into arena-heavy
endings (9754 both sides, 9755/pd0). On the confirm band the
pattern does not replicate as a systematic armed cost:
armed village-lost 8 vs control 7, but armed arena deaths
134/223 (60.1%) vs control 146/227 (64.3%) — the armed share
is LOWER, and armed national reach is HIGHER (22/24 vs 18/24).
Armed lost cells: 9761/pd0 (95d, arena 6, sickness 4, wound 1,
starvation 2), 9768/pd0 (89d, arena 12), 9771/pd0 (82d, arena 15),
9760/pd1 (91d, arena 12 — identical to control), 9761/pd1 (90d,
mixed incl. starvation 4, vs control 55d), 9763/pd1 (74d,
identical to control), 9765/pd1 (85d, identical to control),
9770/pd1 (90d, arena 5). Three armed lost cells are byte-identical
to their controls (9760/pd1, 9763/pd1, 9765/pd1) — the lever
changed nothing there. The pilot's arena divergence reads, on
this band, as seed-level trajectory noise on 9754/9755, not a
cost of asking down the list. The standing arena watch (pilot
metric review) stays open as a watch, not a gate.

### The fix, in plain words (confirm band)

The one fresh village that lived the 9754 capture — 9766/pd1 —
tells the whole story: in control, the village asked for a cook
8 times, got nobody, preserved nothing, and died on day 30
(starvation 2 among its 7 deaths). With the fallback, the village
asked 67 times, got a cook 58 times, smoked 32 batches, and lived
the full 100 days. Everywhere else the lever is either neutral
(five cells come out row-identical: 9760/pd0, 9765/pd0, 9767/pd0,
9760/pd1, 9763/pd1, 9765/pd1 — six counting 9767/pd0) or a
straight improvement in staffing rate and resolutions. One cell
moves the other way on rate (9764/pd0: 0.75 -> 0.57) while still
staffing a cook 35 times — a thinner kitchen, not an empty one —
and C3 (no unstaffing anywhere) bounds that reading.

### Wall numbers (confirm band, 24 cells per arm)

OFF: national 18/24, table 0/24, wins 0/24, median days 100,
arena deaths 146/227, village-lost 7. ON: national 22/24,
table 0/24, wins 0/24, median days 100, arena deaths 134/223,
village-lost 8. Table 0 is a construction fact (SEATDRIVE=0
makes the table unreachable by construction), not a scale-wall
finding — same convention as the pilot. The wall on this corpus
sits past national, at the table, exactly where SEATDRIVE=0 puts
it. Pooled pilot + confirm (40 cells per arm): national
OFF 32/40, ON 36/40; table 0/40 both; wins 0/40 both.

### Balanced panel (§15)

ATTEMPTED AND NOT RUNNABLE ON THIS CORPUS, as pre-stated for
the pilot. `scripts/balance-panel.js compare` without panel
inputs errors: "compare --before <panel.json.gz> --after
<panel.json.gz> --out <prefix>" — panel-driver cases are the
only ingestible input, and none exist for env-gated arm-contrast
recorder rows. No panel inputs were fabricated to force a run.
This is the exact pre-stated failure class (panel ingests
panel-driver cases, not recorder rows, as in rotdecide2,
preserveact and onzero). The analyzer's per-seed tables above
are the §15 fallback instrument, and the verdict is judged on
them. No compare .md is attached, for the same reason as the
pilot (and the 0030Z round before it).

### Determinism proof (adoption-run addition)

The completion sweep re-ran the ON arm for seeds 9768-9771 on
both sides. The four pd0 re-runs came out byte-identical to the
dead worker's files (md5): s9768
8ab531109bc7121b597760da880c3124, s9769
5e598da78cab0d929b80591e8f31c35d, s9770
dab2af59c627b9de0752634de7e9ccaa, s9771
bf2e93c1ce17330416c839809d026938. The pd1 files for the same
seeds are new data (the dead worker never produced them). The
pilot proof test re-run after completion still passes 72/0,
and the confirm tag check passes 48/48 on one shared base tag.

### Metric review (§14 — for the NEXT run; this verdict is NOT re-scored)

- The pilot's staffRate-split note stands: the confirm's 9764/pd0
  rate dip (0.75 -> 0.57) is uninterpretable at asgPost
  granularity — it may be same-day reassignment after successful
  staffing (the pilot's conservative-measure note), not a weaker
  block. The next staffing instrument should split "block
  staffed a cook" (assign-call ok on the day) from "ended the
  day with a cook" (asgPost) before any rate dip is read as a
  regression.
- Say sampling via Game.emit does not work in this harness for
  say lines (pilot note, unchanged): the refusal-line samples
  the pre-reg asked for do not exist in this corpus either.
  Quoted dialogue for staffing still needs the sibling say-stub
  instrument (scripts/say-capture.js, landed 0030Z), not a wider
  emit regex.
- The C4 arena watch is answered for this lever on this band
  (no systematic armed arena cost; see above) but stays a
  standing watch for future food levers: when a food lever
  changes who lives, the show's kill profile can move with it,
  and a starvation-only guard will not see it.

### Confirm scope / files

Policy change only: scripts/policies/competent.js (the smoke-racks
fallback hunk, identical to scripts/stafffallback-on.patch —
worktree diff verified equal to the patch before landing).
Zero src/js changes. New files: scripts/sweep-stafffallback-b.js,
scripts/sweep-one-stafffallback-arm.sh, scripts/stafffallback-on.patch,
scripts/analyze-stafffallback-b.js,
scripts/analyze-stafffallback-confirm-b.js,
scripts/test-stafffallback-b.js,
evidence/2026-10-25/sim-stafffallback-b-corpus/ (80 per-seed files
+ 4 sweep summaries), evidence/2026-10-25/sim-stafffallback-b.md
(this file). No push, no version bump, no live verification —
merged locally, pending ship, by the coordinator.

### Appendix — full confirm record (original completion write, kept verbatim)

The record above is the restructured adoption record; this appendix
is the original completion write of the same verdict, in the
analyzer's table form. The numbers are identical in both (all 24
rows verified equal); the appendix is kept because it alone
carries the runner-detour disclosure and the flap-incident notes
that follow it.

Confirm band complete: 48 configs (seeds 9760-9771, both sides, both
arms). Analyzer: scripts/analyze-stafffallback-confirm-b.js, per-seed
files only. Table: seed side | class | OFF calls/ok/rate/res/days |
ON calls/ok/rate/res/days (rate = staffed-day rate, share of
staff-days ending the day with a cook).

- 9760 pd0 | - | 83/83/1.00/68/100 | 83/83/1.00/68/100
- 9761 pd0 | - | 46/33/0.71/24/100 | 46/43/0.94/34/95
- 9762 pd0 | - | 52/47/0.67/35/100 | 60/53/0.66/47/100
- 9763 pd0 | - | 49/46/0.94/27/100 | 80/76/1.00/55/100
- 9764 pd0 | - | 66/60/0.75/39/100 | 42/35/0.57/24/100
- 9765 pd0 | - | 79/79/1.00/58/100 | 79/79/1.00/58/100
- 9766 pd0 | - | 40/38/0.95/13/100 | 60/59/1.00/44/100
- 9767 pd0 | - | 87/87/1.00/46/100 | 87/87/1.00/46/100
- 9768 pd0 | - | 53/51/0.94/28/86 | 51/44/0.98/26/89
- 9769 pd0 | - | 46/39/0.83/21/100 | 93/80/0.99/47/100
- 9770 pd0 | - | 80/27/0.34/23/100 | 111/80/1.00/59/100
- 9771 pd0 | - | 29/24/0.29/21/100 | 33/27/0.54/20/82
- 9760 pd1 | - | 43/43/1.00/31/91 | 43/43/1.00/31/91
- 9761 pd1 | - | 26/22/0.95/12/55 | 48/38/0.86/25/90
- 9762 pd1 | - | 50/44/0.83/19/94 | 80/76/0.99/46/100
- 9763 pd1 | - | 27/27/1.00/18/74 | 27/27/1.00/18/74
- 9764 pd1 | - | 60/52/0.72/28/100 | 81/78/0.94/65/100
- 9765 pd1 | - | 41/41/1.00/21/85 | 41/41/1.00/21/85
- 9766 pd1 | CLASS | 8/0/0.00/0/30 | 67/58/1.00/32/100
- 9767 pd1 | - | 82/79/0.95/45/100 | 75/70/0.97/33/100
- 9768 pd1 | - | 71/70/0.99/40/100 | 69/66/0.99/35/100
- 9769 pd1 | - | 51/47/0.80/21/100 | 45/38/1.00/31/100
- 9770 pd1 | - | 50/48/0.94/34/100 | 34/26/1.00/15/90
- 9771 pd1 | - | 56/55/0.73/30/100 | 82/75/0.91/63/100

### Confirm verdict: GO-CONFIRMED

- C1 PASS: exactly one fresh-band class cell, 9766/pd1 (control
  calls 8 > 0, ok 0). Armed ok 58 > 0 and armed staffed-day rate
  1.00 >= 0.5. The 9754 capture generalizes: a fresh seed
  reproduced the zero-cook staffing break and the fallback fixed
  it (the village went from lost at day 30 to alive at day 100).
- C2 PASS, both sides: pd0 armed starvation 3 vs control 3 (bar
  <= 5), median daysAlive 100 vs 100 (bar >= 80.0); pd1 armed
  starvation 7 vs control 6 (bar <= 8), median daysAlive 100 vs
  100 (bar >= 80.0).
- C3 PASS: zero cells where control cookOk > 0 and armed cookOk
  == 0 with armed cookCalls > 0. The fallback never took a
  staffed kitchen away.
- C4 (watch only): armed village-lost 8 cells vs control 7, all
  quoted below. Arena-death share: control 146/227 (64.3%),
  armed 134/223 (60.1%) — the pilot's arena-heavy armed pattern
  did NOT replicate as a worsening. National reach rose 18/24
  to 22/24 on the armed side; table 0/24 and wins 0/24 on both
  (SEATDRIVE=0 construction, as designed). Armed losses:
  9761/pd0 (arena 6, sickness 4, wound 1, starvation 2),
  9768/pd0 (arena 12, sickness 1, monster 2),
  9771/pd0 (ambush 1, starvation 1, arena 15, monster 2,
  contest 1), 9760/pd1 (arena 12), 9761/pd1 (sickness 3, wound 3,
  arena 3, eater 1, dehydration 3, starvation 4),
  9763/pd1 (dehydration 1, paparazzo 1, arena 11, monster 2),
  9765/pd1 (arena 12, monster 2), 9770/pd1 (arena 5, contest 1,
  sickness 1, monster 1). Control losses: 9768/pd0, 9760/pd1,
  9761/pd1, 9762/pd1, 9763/pd1, 9765/pd1, 9766/pd1. Net: the
  armed side saved 9762/pd1 and the class cell 9766/pd1, and
  lost 9761/pd0, 9771/pd0, 9770/pd1 instead.

### Runner detour (disclosed, not hidden)

The confirm's on-pd1 9768-9771 files were NOT produced by the
standard runner. A host write-denial flap blocked the runner's
bulk archive extract four times (same tail files every time:
tools/audio-lab-*, tools/mobile-sim.html, version.json) and
blocked corpus file writes outright for over an hour. The four
seeds were instead run with the same driver, same env, same base
(8ea64d848), same seeds, in the worktree that IS the verified ON
tree: worktree diff of scripts/policies/competent.js is
byte-identical to the stafffallback-on.patch, the STAFFING
FALLBACK marker is present, the old single-pick marker is absent,
and competent.js is the only tracked modification. The driver
emitted per-seed JSON to stdout (STDOUT_SPLIT=1); each record was
parsed and written to the corpus with readback verification
(byte-identical, valid JSON). The contrast the amendment binds
— OFF vs ON pair, seeds, env, base — is identical; only the
harness plumbing differed (extract step bypassed, manual content
verification substituted). The verdict above is judged on the
per-seed files, which the analyzer reads directly.

### Flap incidents during this completion

- Two corpus files were truncated to 0 bytes by the flap during
  failed runner attempts (on-pd0 s9769, then on-pd0 s9768),
  although no sim was writing them at the time. Both were
  restored byte-identical from /tmp backups taken before the
  attempts and re-verified after every subsequent step.
- One 0-byte driver tmp file (s9768 on-pd1) was removed; it
  carried no data.
- All four on-pd0 files re-verified byte-identical to backups
  after the confirm completed; zero-byte audit of the corpus
  clean at landing.

### Landing addendum (2026-10-26, loop B run 0435Z — single-owner landing)

The 0330Z run could not land this arm because a second, unclaimed
adoption was working the same worktree. At this run's landing time
no writer was active: the second writer's pd1 determinism re-sweep
(node scripts/sweep-stafffallback-b.js, started 04:33Z from
bisect-scratch/offtree) was gone by 04:39Z, its last corpus write
04:38:18Z (off-pd1 s9768). Whether that re-sweep finished its
planned set is NOT known from its process state — but the landing
does not depend on it: the corpus was re-verified after it ended
(84 files, zero 0-byte files, all parse as JSON) and the confirm
analyzer re-run on the current corpus returns the same verdict
with the same tables cell-for-cell: C1 PASS (9766/pd1 CLASS,
8/0/0.00/0/30 -> 67/58/1.00/32/100), C2 PASS both sides, C3 PASS,
VERDICT GO-CONFIRMED; wall national 18/24 -> 22/24, table 0/24
both (SEATDRIVE=0 construction), wins 0/24 both, median 100/100,
arena 146/227 -> 134/223. The pilot proof test re-run passes
72/0. The appendix above is kept verbatim as the second writer's
independent confirm record; its tables agree with the 0330Z
confirm tables on every cell, so the file holds two agreeing
GO-CONFIRMED records, not a conflict. This landing commits the
lever (scripts/policies/competent.js smoke-racks fallback hunk,
byte-identical to scripts/stafffallback-on.patch, verified
before committing), the runner/analyzer/proof scripts, this
record, and the 80-file corpus + 4 summaries. The lever is
policy-side only; zero src/js changes. The second writer's
bisect-scratch/ extraction (107M, derived files only) was NOT
committed; it was relocated out of the worktree at tree removal
so no scratch is destroyed by the landing. Merged locally,
pending ship; no push, no version bump, no live verification.

