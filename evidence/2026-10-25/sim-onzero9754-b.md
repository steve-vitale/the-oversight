# sim-onzero9754-b — WHY does preserver widening zero out cook resolutions on seed 9754?

Run: oversight-flesh-out-loop-b, arm sim-onzero9754-b, axis food-economy.
Worktree: `~/workspace/worktrees/sim-onzero9754-b`, branch sim-onzero9754-b.
DIAG ONLY — zero src/js changes, no default flips, no game-code lever.
No say-capture stub is built here (sibling arm sim-saystub-b owns it);
only existing trace/event recorders plus driver-side read-only
pantry/assignment snapshots are used. The preserveact pilot verdict
(NO-GO on counts) and the rotdecide2 verdict are NOT re-judged here.

Status: PRE-REGISTERED — everything under "PRE-REGISTRATION" below was
written BEFORE any sim in this run was executed. The RESULTS section
at the end is appended after the sweep completes and is judged ONLY
against the header.

## Canon read first

- `docs/CANON.md` (manifest) then `docs/PRESERVATION.md` (the food
  ladder: cleaned 2d < cooked 5d < smoked 30d < rendered 90d <
  pemmican 120d; smoking 16 ticks; blind penalties teach once).
- The preserver-widening commit 75fdd9258 widened
  SPECIALTIES.preserver from ghost occupations matching almost nobody
  to the real occupation pool (fisherman 3; fishing/hunting guides,
  sailor, chef, line cook, butcher, farmer, rancher 2; beekeeper,
  mushroom grower 1) and aligned TECHNIQUE_GRANTS.preserve the same
  way.
- No canon doc covers the preserve-action instrument — stated, not
  invented. The cook-duty decomposition below (cook resolutions,
  eligibility, reserve, racks-full guard) is read from the game.js
  cook-duty smoke-rack branch (the code itself), not from canon.

## Background (quoted from the preserveact pilot, NOT re-judged here)

- sim-preserveact-b (evidence/2026-10-25/sim-preserveact-b.md, corpus
  evidence/2026-10-25/preserveact-b-corpus/, pilot base
  9f11741afc05741afac6581de23cf4eb13e1b245): seed 9754 under
  leadfeast/dg1/100d — OFF produced 59 (pd0) / 72 (pd1) cook batches,
  while ON (preserver widening) produced ZERO preserving work on both
  sides (0 batches, 0 resolutions, 0 attempts), yet the village still
  lived 100 days and stayed national. OFF resolutions 27 (pd0) /
  32 (pd1); ON resolutions 0 / 0.
- This run answers ONLY the mechanism question: which step of the
  cook-duty chain goes to zero under ON on this one seed.

## PRE-REGISTRATION (bound per docs/MEASUREMENT.md §§9-12, 14-15)

### Pair, contrast, horizon, seeds

- Pair under test, ONLY pair: preserver widening OFF vs ON, on
  CURRENT master substrate (worktree HEAD at sweep time). ON = the
  HEAD tree unmodified. OFF = the HEAD tree with ONLY the two
  widening hunks of 75fdd9258 reverted in src/js/food.js (committed
  patch scripts/preserveact-off.patch, applied by
  scripts/sweep-one-onzero9754-arm.sh). The runner VERIFIES the
  extracted OFF tree differs from a fresh HEAD archive ONLY in
  src/js/food.js (single-file patch + reverse-check, the cheap proof
  from the preserveact run) and FAILS LOUDLY otherwise.
- Anchor contrast (identical on both sides of the pair, identical on
  both arms): policy leadfeast, DEPOSITGATE=1 (dg1 only),
  FEASTSCALE_R13=1, SEATDRIVE=0 (all asserted FATAL by the driver),
  PLENTYDEPRI per SIDE (pd0 vs pd1), 100d death-aware horizon (dead
  villages stop; +10d tail max) — the preserveact substrate,
  matched deliberately so this corpus is comparable to the corpus it
  follows. No header revision to the horizon is made after this line.
- Seeds: START from 9754 ONLY (both sides, both arms = 4 configs).
  Expansion is allowed ONLY as the pre-reg allows: if the 9754
  decomposition names a mechanism step whose ON-zero is ambiguous
  (e.g. the step is zero on both arms at the daily-snapshot
  granularity), up to 2 neighbouring pilot seeds (9753, 9755) may be
  run with the identical driver as a disambiguation check, and their
  numbers are reported as disambiguation, never folded into the 9754
  verdict. No other seed band is run or judged.
- File names: onzero9754-b-<arm>-<side>-dg1-leadfeast-s<seed>.json.
  Per-seed files are the analyzer's ONLY inputs; sweep-*.json
  summaries are NOT analyzer inputs.
- Driver method: the driver (scripts/sweep-onzero9754-b.js, derived
  from scripts/sweep-preserveact-b.js) runs from a
  git-archive-extracted tree of HEAD per arm
  (<worktree>/bisect-scratch/<arm>/ — never /tmp worktrees, never
  bare `git worktree add`, never a checkout in the worktree). The
  driver is copied into each extracted tree; the extracted tree's
  own src/js is swept (OFF tree: food.js patched, everything else
  HEAD). No src/js file is modified in the worktree at either arm:
  all counting is driver-side wrappers (the pre-existing
  creditDeed/stockPantry/sweepSpoiled/registerDeath patterns from
  the preserveact driver) plus driver-side read-only daily
  pantry/assignment snapshots. No say-capture stub is built.

### Instrument: the decomposition chain (in cook-duty order)

A cook resolution converts pantry stacks only if EVERY step holds.
The driver measures each step separately, so exactly one step can
be named as the zero:

1. COOK DUTY RUNS: creditDeed 'cooking' count by villager id +
   each cook's preserver skill at deed time. Every cook-duty
   resolution credits 'cooking' at its end, whether or not it
   preserved anything — BUT the scholar's own cooking also routes
   through noteDeed -> creditDeed('player', 'cooking'), so the
   villager cook-duty count is the by-vid count EXCLUDING who ==
   'player' (reported alongside the total; the split is the
   instrument, not a post-hoc filter). If villager cooking == 0,
   no villager cook duty resolved at all — the assignment step
   zeroes.
2. PRESERVER POOL: daily snapshot of the roster — each villager's
   occupation and specialistSkill('preserver') under the arm's own
   food.js, pool size by skill level, and the staffed cooks' skills.
   (Widening can only change this step through the two food.js
   tables; any pool difference IS the widening, by construction.)
3. ELIGIBLE PANTRY: daily snapshot replicating the cook branch's
   eligibility filter read-only — pantry stacks that are not
   bonded, not preserved/rendered, not pemmican, not keepsakes,
   with a finite spoilDay, not spoiled (isSpoiled(it, 0)), and
   spoilDay - day <= 2. Reported as eligible kcal and as
   days-with-eligible > 0.
4. RESERVE (DINNER-FIRST): the same snapshot applies the branch's
   reserve rule read-only (reserve = 250 x roster; soonest-spoiling
   first; whole stacks held fresh until the reserve is spent;
   partial stacks split) and reports after-reserve kcal and
   days-with-after-reserve > 0. If eligible > 0 but after-reserve
   is 0 on every snapshot, the reserve swallows the whole surplus.
5. RACKS-FULL GUARD: the snapshot reports preservedKcal and, for
   each skill level 0-3, the branch's rackCap
   (125 x roster x max(1, ownShelf - 2), ownShelf = 30 + 5*skill
   if skill > 0 else 15) and whether preservedKcal >= that cap.
   NOTE, STATED BEFORE SWEEPING: if preservedKcal stays 0 (as the
   pilot's ON rotPreservedKcal = 0 suggests), the guard CANNOT be
   the zero — preservedKcal >= rackCap is false for every skill
   level, since every rackCap is positive. The guard is still
   measured, not assumed away.
6. CONVERSION: the pre-existing HAULCOUNT TAP batches + kcal and
   creditDeed 'preserving' resolutions (the pilot's primary
   numbers). batches >= resolutions per cell by construction;
   a violation is an instrument defect, not a finding.

### DIAG-GO BAR (binding — judge ONLY against this header)

DIAG-GO holds if and only if ALL of D1, D2, D3 hold:

- D1 (reproduction first): the current-master reproduction shows
  the same qualitative pattern as the published pilot counts —
  OFF batches > 0 on both sides AND ON batches == 0 on both sides.
  If current master diverges from the published counts, the
  divergence is reported plainly in RESULTS, the run does NOT
  silently re-baseline, and D1 FAILS (the diag question as posed
  does not reproduce on current master — the divergence itself
  becomes the finding, and no mechanism is claimed from a
  non-reproducing pair).
- D2 (single named step): exactly one decomposition step (1-5
  above) is zero under ON on BOTH sides while non-zero under OFF
  on at least one side, at trace/event level: i.e. the step's ON
  count is 0 and its OFF count is > 0, with the step's own
  instrument (cooking deeds / pool membership / eligible days /
  after-reserve days / racks-full days) as proof. Steps that are
  zero on both arms, or non-zero on both arms, cannot be the
  named step. If two steps both meet this pattern, D2 FAILS as
  ambiguous and both are reported — never pick the prettier one.
- D3 (no instrument defect): batches >= resolutions on all 4
  cells; villager cooking deeds (excluding 'player') >= preserving
  deeds on all 4 cells (a preserving resolution is a villager cook
  resolution with n > 0, so the villager cooking count must bound
  it); per-seed files parse with arm/base tags + seeds + contrast
  matching; invHaulActions > 0 on all 4 cells (haul non-vacuous).

Otherwise the verdict is DIAG NO-GO, with the failed condition(s)
named (D1 / D2 / D3). A DIAG NO-GO here does NOT overturn the
preserveact pilot NO-GO (which stands on its own corpus and rule)
and does NOT touch rotdecide2.

### Balanced panel (§15)

- This IS a before/after pair (OFF -> ON), so ATTEMPT
  scripts/balance-panel.js compare and attach the compare .md.
- EXPECTED FAILURE CLASS, STATED BEFORE ATTEMPTING: the panel
  compare ingests panel.json.gz cases built by the panel driver
  from sweep-compare policies — NOT env-gated arm-contrast recorder
  rows. If compare fails on ingesting the recorder corpus (the
  known recorder-row ingestion class, as in rotdecide2 and
  preserveact), attach the analyzer's sweep-compare table instead
  and name the failure class. A tooling failure NEVER blocks or
  re-scores the verdict: the verdict is judged on the analyzer's
  paired rows (§15 fallback).

### Sense-testing, wall numbers, villager behavior

- SENSE-TESTING LAW: read the daily snapshots as a food story —
  what the village ate, what sat about to rot, what never arrived
  — and judge whether the ON village's 100-day survival with no
  preserving coheres (fresh haul + fast turnover vs a missing
  food leg). Quote snapshot aggregates, not just counts.
- WALL NUMBERS on this corpus: national / table / wins, wave 1-5
  reach, median survival (median daysAlive). NOTE: these files
  carry table = win flag (same convention as preserveact), and
  SEATDRIVE=0 makes the table unreachable by construction —
  table 0 here is a construction fact, not a scale-wall finding,
  and is reported as such.
- VILLAGER-BEHAVIOR SAMPLE: death-cause spread across the 4 cells,
  cook-identity distribution (who cooked, with what skill, on each
  arm), haul/preserve event names from the existing recorders.
  Anything robotic, static, or repeated is flagged; aggregate
  divergence tracking the food story is reported as people-like,
  not proven.

### Metric review (filled after the verdict, §14 — revisions apply to the NEXT run, this verdict is NOT re-scored)

- See the "Metric review" subsection under RESULTS below (filled
  after the verdict; the verdict above is NOT re-scored by it).

### Scope

Zero src/js game changes in this worktree. New files only:
scripts/sweep-onzero9754-b.js, scripts/sweep-one-onzero9754-arm.sh,
scripts/test-onzero9754-b.js,
evidence/2026-10-25/sim-onzero9754-b-corpus/ (per-seed files,
sweep summaries), evidence/2026-10-25/sim-onzero9754-b.md (this
file). The OFF tree's food.js revert exists ONLY in
git-archive-extracted scratch trees that are deleted after each
arm run — never committed, never in the worktree. No push, no
version bump, no live verification — merged locally, pending ship,
by the coordinator.

---

## RESULTS (appended after the pre-registration above; verdict judged ONLY on the corpus named here)

CORPUS: evidence/2026-10-25/sim-onzero9754-b-corpus/, seed 9754 only,
4 main cells (off/on x pd0/pd1) + 4 assign-log cells (same seed,
contrast, horizon, driver family — see "Second-phase diag" below).
Corpus base tag (all 8 files): 4f5f3b61 (worktree HEAD at sweep
time; the pilot base was 9f11741a — see "Reproduction" for the
divergence, reported plainly, not re-baselined).

### The answer, in plain words

Widening does not break the smoke racks, the pantry, or the cook's
hands. It breaks the STAFFING PICK. On this seed the widening gives
exactly one villager a preserver skill she did not have — Rosa
Mendez, the line cook, skill 0 -> 2 — and the competent policy's
smoke-rack staffing picks the single highest-preserver free
villager and never falls through to a second choice. Under widening
that pick is Rosa every single day. Rosa refuses cook duty every
single time she is asked (trust gate: cook is not "food work" in
checkObedience — only fish/garden get the low gate — so cook needs
trust 20+, and her 152 refusals across both arms rule out the
40%-reluctant roll and point at the hard gate). With no cook ever
staffed, no cook duty ever resolves, nothing is ever smoked, and
the about-to-rot surplus rots fresh instead. The village still
lives 100 days and stays national on fresh haul and fast turnover
— the missing smoked food was never load-bearing here, only
wasted. The racks-full guard is innocent: with nothing ever
preserved, the preserved stock it guards stays at zero, so the
guard never fires — its silence is a consequence, not a cause.

### Reproduction (D1) — pattern holds, one exact count diverges

Published pilot counts (base 9f11741a) vs current-master
reproduction (base 4f5f3b61), batches / resolutions:

- OFF pd0: published 59 / 27 -> current 59 / 27 (EXACT).
- OFF pd1: published 72 / 32 -> current 60 / 22 (DIVERGES in exact
  count; haul also differs, 155 actions / 85k kcal published vs
  133 / 135k now, and wave reach 4 -> 3). The between-base changes
  (narration/spam-gate edits, villager-agency/objectives touches)
  shifted the pd1 trajectory. The divergence is reported here, not
  hidden, and the pair is NOT re-baselined to it.
- ON pd0: published 0 / 0 -> current 0 / 0 (EXACT).
- ON pd1: published 0 / 0 -> current 0 / 0 (EXACT).

D1 (qualitative pattern: OFF batches > 0 both sides, ON batches
== 0 both sides) PASSES. The pd1 exact-count divergence does not
change the pattern, but it does mean exact pd1 counts from the
pilot base are not stable across the intervening commits — a
fragility note for any future exact-count comparison, recorded
under "Metric review" below.

### Decomposition (D2/D3) — the chain, step by step

Main-corpus per-cell table (batches / resolutions / villager
cooking deeds / player cooking deeds / day-1 skilled pool /
eligible days / after-reserve days / racks-full days by skill /
days alive / national / max wave):

- OFF pd0: 59 / 27 / 88 / 0 / 0 / 90 / 61 / {0: 7} / 100 / true / 4
- OFF pd1: 60 / 22 / 75 / 0 / 0 / 92 / 43 / {0: 2} / 100 / true / 3
- ON pd0: 0 / 0 / 0 / 0 / 1 / 91 / 50 / {all 0} / 100 / true / 4
- ON pd1: 0 / 0 / 0 / 0 / 1 / 91 / 55 / {all 0} / 100 / true / 4

Step by step, in cook-duty order:

1. COOK DUTY RUNS — ZEROES ON. Villager cooking deeds OFF 88/75,
   ON 0/0. Player cooking deeds are 0 on all 4 cells, so the split
   changes nothing here. No villager cook duty resolves under ON.
2. PRESERVER POOL — does NOT zero; it is the only day-1 change.
   First-snapshot rosters are identical (12 villagers) on both
   sides of both arms; the sole difference is rosa_mendez
   (line cook) preserver 0 OFF -> 2 ON. Day-1 skilled pool OFF 0,
   ON 1. (A late-arriving farmer, liam_davis, reads skill 2 OFF
   on the last snapshot — irrelevant to the early capture, and he
   cooks 4 times OFF pd0.)
3. ELIGIBLE PANTRY — does NOT zero. Days with about-to-rot pantry
   (spoilDay - day <= 2, unspoiled, unbonded, not preserved)
   OFF 90/92, ON 91/91; max eligible kcal ON 16,176 / 25,255.
4. RESERVE (DINNER-FIRST) — does NOT swallow it. Days with
   after-reserve surplus OFF 61/43, ON 50/55; max after-reserve
   kcal ON 14,376 / 23,238; first after-reserve day ON 21 / 35.
   The surplus is there, past dinner's share, on half the days.
5. RACKS-FULL GUARD — zero days ON, but as a SHADOW, not a cause.
   Preserved kcal is exactly 0 on all 100 snapshot days on both
   ON sides (OFF: up to 18,879 kcal, preserved on 33/58 days).
   A guard that never fires cannot block a resolution; its ON
   zero is entailed by the conversion zero (nothing is ever
   preserved, so there is never a stock to guard).
6. CONVERSION — zero ON by the same token: batches 0/0, kcal 0,
   resolutions 0/0; OFF 59/60 batches, 27/22 resolutions.

D3 PASSES on all 4 cells: batches >= resolutions, villager
cooking >= preserving, invHaulActions > 0, 100 snapshots per
cell, shared base tag, seeds/policy/contrast matching.

D2, AS WRITTEN, FAILS — and the failure is instructive, not a
mystery. The proof test's D2 scan (scripts/test-onzero9754-b.js)
finds TWO steps meeting the syntactic pattern "ON == 0 both
sides, OFF > 0 at least one side": villagerCooking (88/75 -> 0/0)
AND racksFullSkill0 days (7/2 -> 0/0). The header requires
exactly one, so the verdict is DIAG NO-GO on D2. The
second-phase diag below resolves the ambiguity causally rather
than by re-scoring: the racks-full zero is downstream of the
cook zero (preserved stock cannot exist without a cook), while
the cook zero is upstream and is proven at call level. The
verdict stands as written; the mechanism is nonetheless
identified, and the bar's flaw is recorded under "Metric review"
for the next run. No step was picked because it looked prettier.

### Second-phase diag — assign-call trace (same seed, same contrast)

Because the main decomposition left the assignment step as the
zero ("no cook duty resolves") without saying whether the
policy never asks or always gets refused, a second driver
(scripts/sweep-onzero9754-assign-b.js, run by
scripts/sweep-one-onzero9754-assign-arm.sh) wrapped Game.assignTask
(delegating, counting only — the same recorder pattern as the
stockPantry/creditDeed wrappers; NOT a say-capture stub, NO game
code) and recorded every assignment call plus a per-day staffing
record (fresh kcal in the staffing block's own 0..3-day window,
assignments before/after the policy daily). This is the same
seed and the same pre-registered decomposition item ("villager
cook assignments"), traced one level deeper — not a seed
expansion and not a re-score. Its counts reproduce the main
corpus EXACTLY on all 4 cells (batches/resolutions/cooking
deeds identical: 59/27/88, 60/22/75, 0/0/0, 0/0/0), so the
wrapper is behaviour-neutral (proof: scripts/test-onzero9754-assign-b.js,
9 PASS / 0 FAIL).

Assign-call proof (cook calls / ok / refused / target):

- OFF pd0: 40 calls / 40 ok / 0 refused — targets gen_fx2txh3
  (35), gen_xvfa6ve (1), liam_davis (4). First cook call day 14.
- OFF pd1: 63 calls / 38 ok / 25 refused — the 25 refusals are
  ALL rosa_mendez (days 67+), the accepts are other villagers.
  Rosa's refusal predates widening; widening does not create it.
- ON pd0: 60 calls / 0 ok / 60 refused — ALL to rosa_mendez
  (skill 2). First refused call day 14, same day OFF first
  staffs a cook.
- ON pd1: 67 calls / 0 ok / 67 refused — ALL to rosa_mendez
  (skill 2). First refused call day 19, same day OFF first
  staffs a cook.

Staffing-block behaviour: on fresh-kcal > 1500 days with no cook
assigned before the daily, OFF staffs a cook (staff-day
examples: day 14 fresh 1,510 -> cook assigned); ON the same
shape of day ends with no cook assigned (day 14 fresh 1,510 ->
nothing; 76/75 such staff-days per side). The policy's staffing
code (competent.js counterPlay, "STAFF THE SMOKE RACKS") takes
the single highest-preserver free villager (`sk > bestSkill`,
strict — ties go to the first free villager in roster order)
and assigns ONLY that one; there is no fallback to the next
villager on refusal, and because hasCook stays false, the block
retries the same refuser on every fresh day. Under OFF, skill
ties at 0 let earlier-roster villagers win the pick and accept;
under ON, Rosa's skill 2 beats every tie-break permanently.

Refusal reading (code + pattern, not a measured trust number):
assignTask returns {ok: false, refused: true} only from
checkObedience (cook is not outdoor work, so the wounded gate
does not apply). For cook, checkObedience gates at trust 20
(cook is not in the fish/garden "food work" gate-10 set) plus a
40%-reluctant roll below trust 40. Rosa refuses cook 152/152
times across both arms and both sides (60 + 67 + 25); a 40%
roll cannot produce that run, so her trust sits below the 20
gate. Her exact trust value was not instrumented (it is not
needed for the capture mechanism), and no claim is made about
WHY her trust is low — only that she refuses and the policy
keeps picking her anyway.

No neighbouring seeds (9753/9755) were run: the pre-reg allows
them only to disambiguate an ambiguous step zero, and the
assign-call trace resolves the ambiguity causally on 9754
itself. Extra seeds could not answer the remaining question,
which is definitional (how D2 treats downstream/in-hibitor
steps), not empirical.

### Wall numbers (main corpus, 4 cells)

national = 4/4, table = 0, wins = 0, max-wave distribution
{4: 3, 3: 1}, median daysAlive = 100, max daysAlive = 100.
Table 0 is a construction fact (SEATDRIVE=0 makes the table
unreachable by construction), not a scale-wall finding. The
wall on this corpus sits past national, at the table, exactly
where SEATDRIVE=0 puts it — same shape as the preserveact
pilot. Total deaths 35: the arena 21, starvation 4 (1 per cell
— the ON village does not starve more), monster 2, contest 2,
and one each of bright bastard, alien, dehydration, combat,
sickness, expedition. Villages here die in the show, not of
hunger, on both arms.

### Sense-testing (read the food story, not just the counts)

- The ON village's 100-day survival with zero preserving
  coheres: fresh haul 103k (pd0) / 96k (pd1) kcal, pantry peaks
  ~40k kcal, and the about-to-rot surplus that a cook would
  have smoked instead rots (rotFresh 47k / 43k). Nothing about
  the ON story reads as a missing food leg — it reads as waste:
  the same fresh pile, smoked, would have been dinner next
  week; unsmoked, it is dinner tonight or rot. The count zero
  is a staffing story, not a starvation story, and the
  starvation deaths (1 per cell on both arms) confirm it.
- The OFF story is the same village with a cook: 88/75 cook
  resolutions, 59/60 batches, preserved stock on 33/58 snapshot
  days — steady work across the horizon, not a start-up burst.
- Nothing in the traces reads robotic or static: cook staffing
  tracks the pantry day by day (first cook call lands the day
  fresh kcal first tops 1,500 on both arms, day 14 pd0 / day 19
  pd1), refusals track the person (Rosa, both arms), and the
  divergence tracks the single changed skill, not a repeated
  script. No dialogue-quality claim is made beyond the
  event-level behaviour above — no say-capture stub was built
  here by design (sibling arm owns it), so no cook dialogue is
  quoted from this corpus.

### Balanced panel (§15)

ATTEMPTED. `node scripts/balance-panel.js compare` with the
recorder sweep summaries fails with the exact pre-stated
failure class: `TypeError: Cannot read properties of undefined
(reading 'days')` at balance-scorecard.js comparePanels — the
panel ingests panel-driver cases, not env-gated arm-contrast
recorder rows. No panel inputs were fabricated. The analyzer's
per-seed tables above are the §15 fallback instrument, and the
verdict is judged on them. A tooling gap of this class never
blocks or re-scores the verdict.

### Village assessment (plain words)

One villager's new skill broke the kitchen — not because she
is a bad preserver, but because she is the only preserver the
staffing rule can see, and she will not take the job. Every
day the village has food about to rot, the leader asks Rosa,
Rosa says no, and nobody else gets asked. The food rots, the
village eats fresh instead, and everyone still lives — which
is why this zero hid inside a healthy-looking village for a
whole pilot. The blank filled here is the mechanism itself: the
pilot's "why would widening zero out cook resolutions on one
seed entirely?" now has a traced answer (staffing capture by a
refusing top-skilled villager, no fallback on refusal), plus
the exact code shape that would need to change to fix it
(a fallback pick, or a refusal that retires the candidate for
the day) — a fix is NOT made here: this run is DIAG ONLY, zero
src/js changes, and any fix belongs to a future arm with its
own pre-registration.

### Metric review (§14 — for the NEXT run; this verdict is NOT re-scored)

- D2 needs a causal-order rule: when a chain's zero sits at the
  top, every downstream step is zero too by entailment (no cook
  -> no conversion -> no preserved stock -> no racks-full
  days). The next D2 should name the HIGHEST zero in the chain
  as the step, and treat downstream zeros as shadows, not
  rival candidates. As written, D2 can never pass on a
  top-of-chain zero — that is a bar defect, recorded here, not
  a reason to re-score this run.
- D2 needs a direction rule for inhibitor steps: a racks-full
  guard zeroes resolutions by FIRING, not by being absent. The
  next scan should count "guard-blocked would-be resolutions"
  (guard firing while a cook is present and surplus exists),
  not raw guard days — under that count the guard here is 0
  OFF-or-ON in the blocking sense on the ON side for the
  trivial reason that no cook exists, and the ambiguity
  disappears.
- The assign-call instrument (assignTask wrapper + staffing-day
  record) should be a standard step-1 sub-proof for any future
  staffing question: it separates "never asked" from "always
  refused" in one run, and it reproduced the main corpus
  exactly, so it costs no validity.
- Exact-count fragility: OFF pd1 batches moved 72 -> 60 between
  the pilot base and current HEAD with no lever change. Future
  exact-count comparisons across bases should pre-register a
  tolerance or re-run the pilot pair on the new base before
  judging — qualitative patterns (zero vs non-zero) survived,
  exact counts did not.
- The pd1 divergence itself is not investigated here (out of
  scope for a single-seed diag); if a future run needs it, the
  between-base diff is narration/spam-gate + villager-agency /
  objectives touches, a small surface to bisect.

### Scope / files

Zero src/js game changes in this worktree. New files only:
scripts/sweep-onzero9754-b.js, scripts/sweep-one-onzero9754-arm.sh,
scripts/sweep-onzero9754-assign-b.js,
scripts/sweep-one-onzero9754-assign-arm.sh,
scripts/test-onzero9754-b.js, scripts/test-onzero9754-assign-b.js,
evidence/2026-10-25/sim-onzero9754-b-corpus/ (4 main per-seed
files + 4 assign per-seed files + sweep summaries),
evidence/2026-10-25/sim-onzero9754-b.md (this file). The OFF
tree's food.js revert exists ONLY in git-archive-extracted
scratch trees deleted after each arm run — never committed,
never in the worktree. No push, no version bump, no live
verification — merged locally, pending ship, by the coordinator.

### Proof tests

- scripts/test-onzero9754-b.js: 12 PASS / 1 FAIL, exit 1 by
  design — the single FAIL is D2 as written (two syntactic zero
  steps), which is the verdict, not a harness failure. D1 PASS,
  D3 PASS.
- scripts/test-onzero9754-assign-b.js: 9 PASS / 0 FAIL, exit 0
  — assign mechanism proven (determinism + refusal capture +
  staffing fires / never lands).

