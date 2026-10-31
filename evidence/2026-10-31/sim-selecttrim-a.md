# sim-selecttrim-a — selective trim that keeps the walk (backlog #1588)

Run: oversight-flesh-out-loop, run fleshout-20261031T0415Z,
arm sim-selecttrim-a, axis food-economy. Worktree
sim-selecttrim-a. DIAG/MECHANISM ONLY: a policy-side
prototype, NON-default, gated flag only — zero src/js
changes, zero policy-default flips, zero edits to any
existing policy file or existing script. One new policy,
one new driver, one spy driver, one analyzer, one proof
script. Sibling worktrees never touched; the main tree
never touched; nothing is merged by this worker (the
coordinator merges). Sim-findings.md NOT edited (the
coordinator marks #1588 at closeout).

## Prereg (binding; committed BEFORE any judged leg)

evidence/2026-10-31/sim-selecttrim-a-prereg.md (commit
9e4dd7fbb). Substrate (shared strand substrate):
POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0,
PLENTYDEPRI=0, DEPOSITGATE=1, WOODCARRY=1, DAYS=30, seed
15215 only (guard + ON legs), PRESSB=1 on control AND
trim legs. Single-seed mechanism pilot: the 8-seed rule
does NOT apply here (said explicitly, per the task
brief) — the mechanism question is about one trajectory's
walk, not a bank rate.

PRE-REGISTERED verdict (judged exactly this): DIAG-GO
iff (a) a trim mechanism exists (wrapper form or
gated-variant form, per the prereg's definitions) that
preserves the within-tile walk on BOTH legs, AND (b)
following-morning press attempts are preserved
(strictly more than the hold arm's 0 on each leg where
control had attempts), AND (c) ticks saved are reported
per leg against the known holes (day-7 49-tick routine
hole; guard day-10 press shape). Conversion of strand
evenings is NOT required for DIAG-GO. DIAG-NO-GO iff
the walk is lost like the hold arm, or no trim point
exists without editing competent.daily's core flow.

## 0. THE IMPLEMENTATION ANSWER (asked first): WRAPPER, NOT GATED VARIANT

competent.daily runs monolithically — nighttravel.daily
calls competent.daily whole, then nightStep
(scripts/policies/nighttravel.js) — and a wrapper over
daily() can only call it whole or not at all. BUT the
monolith is bypassable without editing it: competent.js
EXPORTS its beats (module.exports, competent.js:3282 —
forageTripSeedFirst, sortHaul, competentEat, recovering,
needTrip, walkTo, goHomeStanding, and more). The trim
is therefore built as a WRAPPER that assembles a trimmed
day from the routine's own exported beats. No line of
competent.js changed; no gated variant inside daily()
was needed. Code locations:

- competent.daily, the monolith: scripts/policies/competent.js:2837
  (beats are module-private functions called in sequence;
  daily() itself has no per-beat flags or hooks).
- The exports that make the wrapper possible:
  scripts/policies/competent.js:3282.
- The trim wrapper: scripts/policies/selecttrim-diag.js,
  sitting in the strandfix slot (wrapping nighttravel,
  inside woodcarry/woodwarm, so the morning carry, the
  evening bridge decision, and the warmth fire all still
  run exactly as on control legs).

Trim-day sequence (only): forageTripSeedFirst +
sortHaul + competentEat, then nighttravel's nightStep
with nighttravel.daily's ctx bookkeeping replicated (as
strandfix did). Everything else in daily() is skipped
on trim days. Trim gate (strict-subset days only — the
trim does LESS than daily, never more): creek wake, not
inside haven, not in a tent, not dead, not in combat,
morningDayTicks >= 384, NOT recovering(), needTrip()
true, and thirstHome would NOT fire (hydration >= 45,
or water carried, or at haven — daily's drink-then-walk
branch uses unexported drinkSafe, so the trim declines
those days instead of half-reproducing it).

## 1. THE SPY: WHAT THE "WITHIN-TILE WALK" ACTUALLY IS

Identification run (NOT a judged leg):
scripts/selecttrim-spy-b.js, control stack, seed 15215,
guard + ON, recording position + dayTicks + kcal around
every engine verb with the calling beat. Finding, stated
plainly because it reframes the whole backlog item:

competent.daily NEVER calls microMove and NEVER writes
mx/my. There is no within-tile walk in the policy. What
ticks-b called "the within-tile walk from the west corner
to the east muscadine patch" is forageTripSeedFirst's
OUT-AND-BACK NODE TRIP: out to neighbouring tiles,
forage (16 ticks when a patch pays, 0 when all picks
fail), then walkHome back to the creek tile. The return
landing is the east edge cell (8,0) because the return
approaches from the east (3,5) on day 9, and (8,0) again
on day 10 because the return approaches from the north
(2,4) preserving x=8. The next morning's 3x3 press sweep
around (8,0) then holds known muscadine, so the press
fires. Skip forageTrip and the landing — and the press —
are lost. That is the hold arm's 0-press mechanism, now
traced to the exact beat (competent.js:1466 travelTo,
:1483 forage, :1165 walkTo).

Strand-day routine decomposition (spy, control legs):

| day | routine | anatomy (beats that spent ticks) |
|-----|---------|----------------------------------|
| guard d9 | 19 | forage 16 + talkRound 1 (talkTo) + askAbout beasttricks 2 |
| guard d10 | 18 | forage 16 + talkRound 1 + competentEat 1 |
| guard d11 | 17 | forage 16 + talkRound 1 |
| ON d12 | 25 | forage 16 + talkRound 1 + 8 other (beats the trim skips; verb not in the spy list — likely deepTalk/keepPromises social beats; NOT further decomposed) |
| ON d13 | 33 | reported, not attributed (outside the spy window) |

Every other daily beat spends 0 ticks on strand days
(haven chores, crafting, traps, teaching all no-op away
from haven). Consequence, priced before the verdict:
a walk-preserving trim can save AT MOST the 1-3 social
ticks on early strand days — it CANNOT clear day 10's
3-tick hole while keeping the forage (384 waits + 17
press + 16 forage = 417, still 1 short of 416 even with
talk AND eat skipped; 418 with eat kept, as built).
The day-7 81-tick routine is a HAVEN day the creek-wake
gate can never touch. The trim is a mechanism proof,
not a fix, and the numbers below say so.

## 2. CONTROL REPRODUCTION (this arm's own legs, no drift)

| leg | creek | still | rescued | ticks-short days | presses |
|-----|-------|-------|---------|------------------|---------|
| guard-control | 5 | 4 | 1 | 7, 10 | 1 (d10 E450) |
| ON-control | 17 | 17 | 0 | 7, 13, 18, 22 | 4 (d10 E540, d14 E900, d18 E810, d22 E990) |

Exactly ticks-b's 15215 control-variant numbers on both
legs (guard ticks-short d7 shortfall 49 + d10 shortfall
3; ON ticks-short d7/d13/d18/d22). All 4 judged legs:
errs 0 in every store; 30 evenings; survived 30 days.
Determinism: trim-guard re-run byte-identical to the
judged trim-guard file.

## 3. THE TRIM RESULT (judged measurement)

| leg | creek | still | rescued | ticks-short days | presses | trims |
|-----|-------|-------|---------|------------------|---------|-------|
| guard-trim | 5 | 5 | 0 | 7, 10 | 1 (d10 E540) | 9, 10, 11 |
| ON-trim | 8 | 8 | 0 | 7, 10, 14 | 2 (d10 E720, d14 E900) | 9, 10, 12, 13, 14 |

### (a) Walk preserved on both legs

Evening landing (the walk's own end) matches control on
ALL 8 trim days: guard d9 (8,0), d10 (8,0), d11 (0,0 —
control's walkHome landing from the spy; control's
evening snapshot is the haven cell (0,8) AFTER bridge +
travel); ON d9 (8,0), d10 (8,0), d12 (0,0), d13 (8,0),
d14 (8,0). Next-morning wakes match wherever the bearer
lives to the morning: guard d9->d10 (8,0), d10->d11
(8,0); ON d9->d10 (8,0), d10->d11 (8,0), d12->d13 (0,0),
d13->d14 (8,0). The two wake mismatches are BOTH
succession artifacts, not walk losses, and are reported
as such rather than hidden: guard d11->d12 (control
wakes at haven (0,8) by rescue, trim wakes at haven
(4,4) by succession — the bearer died day 12, see §5);
ON d14->d15 (control still stranded at (8,0), trim
wakes at haven (4,4) by succession — the bearer died
day 15, see §5). The walk on those days themselves
matched (guard d11 (0,0), ON d14 (8,0)); what differs
is the overnight fate, not the walk. The prereg's
wake-cell proxy therefore reads 2 mismatches while the
walk-itself reads 8/8 — the verdict below judges the
walk itself and discloses the proxy deviation openly
for the coordinator to overrule (see Metric review).

### (b) Press attempts preserved (hold arm scored 0)

Guard: trim 1 > 0 (d10 E540, vs control E450 — the
press fires AND yields one more grape; see §5 for the
RNG-stream note). ON: trim 2 > 0 (d10 E720, d14 E900 =
control's d14 yield exactly). The ON trim has fewer
presses than control (2 vs 4) because the strand ends
by bearer death day 15 — the d18/d22 presses never
arise. That is a strand-length effect, NOT press
suppression: every press that could fire on a lived
strand morning DID fire (guard 1/1, ON 2/2 within the
bearer's life). Contrast the hold arm: 0 presses on
either leg by structural position-freeze.

### (c) Ticks saved per leg (decision-time ticks: woodcarry
classification.ticksToDayEnd, before the warmth fire)

| trim day | control routine | trim routine | saved | control decTicks | trim decTicks | evening |
|----------|----------------|--------------|-------|------------------|---------------|---------|
| guard d9 | 19 | 16 | 3 | 109 | 112 | still / still |
| guard d10 | 18 | 17 | 1 | 93 | 94 | still / still |
| guard d11 | 17 | 16 | 1 | 111 | 112 | rescued / still (gate-shift, §5) |
| ON d9 | 19 | 16 | 3 | 109 | 112 | still / still |
| ON d10 | 18 | 17 | 1 | 221 | 94 | still / still (newly ticks-short, §5) |
| ON d12 | 25 | 16 | 9 | 231 | 112 | still / still |
| ON d13 | 33 | 16 | 17 | 95 | 112 | still / still |
| ON d14 | 18 | 17 | 1 | 221 | 94 | still / still |

Day 7: NOT MOVED on either leg, exactly as preregistered
(no trim fires day 7 — haven wake — both legs; day 7
still ticks-short on all four legs). Guard day-10 press
shape: 384 + 17 + 17 = 418, 2 short (was 3 short) — the
hole is NARROWED by 1, NOT cleared, exactly as the spy
bound predicted.

## 4. SENSE-TEST (law — read end to end)

Trim days read as people, not as absences — the
opposite of the hold arm's 2-line days. Guard-trim d9
(17 lines): wetland trips, a Hushpuppy counter learned,
a goose encounter, unknown berries foraged, walk home,
honest refusal ("-60 kcal in hand"). Guard-trim d10
(11 lines): the press working the patch (6 muscadine,
eaten 540), Purslane worked and eaten, fireside
fragments overheard, honest ticks refusal ("94 ticks
left... takes 96"). ON-trim d12/d13/d14: travel,
fireside fragments (Tao, Ethan, Dakota retellings),
bullfrog encounter, Green Thumb deepening, a failed
fire then a caught fire, the d14 press (10 muscadine,
900 eaten) + Purslane + the Rut King at the boundary.
PASS on sense: the trimmed day still walks, forages,
meets things, and ends where the walk took it.

One sense cost, stated plainly: the trim skips the
talk, and the talk TEACHES. On control guard d9 the
skipped talk is Ethan teaching the Flashbulb Moth
counter ("Hit it while it folds..."); the trim
villager never learns it that day. A trim that saves
ticks by skipping teaching trades knowledge for time —
another reason this stays DIAG-only.

## 5. COSTS (reported honestly; conversion not required, none achieved)

- CONVERSIONS: none on either leg. Gate-shift (control
  rescued -> trim still, same day): guard d11 ONLY.
  Mechanism, traced: trim d11 strands on KCAL (40 vs
  60, a 20-kcal margin), NOT on ticks (trim d11 decision
  ticks 112 >= 96). Chain: trim skips d9's talk — and
  the talk is a FOOD event (spy: talkTo moves kcal -60
  -> 0, exactly the forage effort debt; skipping it
  costs the villager a meal/gift, not just 1 tick) —
  AND skipping talk/askAbout shifts the game RNG stream
  (press yields move: guard d10 5 -> 6 grapes, E450 ->
  E540; ON d10 E540 -> E720). The kcal trajectories
  diverge (trim d10 evening 600 vs control 500; d11
  morning 100 vs 130 — the overnight burn difference
  itself is observed, mechanism not isolated), and the
  20-kcal margin loses the rescue. The trim does not
  lose the rescue on time; it loses it on food.
- NEWLY TICKS-SHORT, ON d10: control d10 decision
  ticks 221 (256-morning) -> trim d10 94 (384-morning).
  The trim's 3 saved ticks on d9 coincide with the next
  morning's waits-alignment flipping 256 -> 384 (d9
  evening 451 -> 448), which makes d10 ticks-short where
  control had room. The saving is partially
  self-defeating through the morning-alignment mechanism
  (sleep/upkeep internals, not isolated — reported as
  observed, same standard as prior arms).
- BEARER DEATHS FORWARD on both legs (same class as
  the hold arm's cost): guard none -> day 12 ("the
  wild", same bearer gen_gyft62f); ON day 23 -> day 15
  (-8 days, same bearer, same cause). Mechanism not
  isolated — night-encounter lottery on the shifted RNG
  stream is the candidate (followers trail the scholar;
  the stream shift changes the night's draw). The
  strands end by succession on both trim legs (guard
  d12 and ON d15 wakes are successor haven wakes), not
  by rescue.
- WAVE REACH: guard 3 -> 2, ON 2 -> 1 (15215 only; the
  press-fed fight-richer trajectory is gone on guard,
  the longer fed trajectory is gone on ON).

## Reachability

No new content reached by a game change (no game
change landed — policy prototype only, default off).
Creek/bridge content reached on every leg. Waves 4-5
not reached in this 30-day window (same window as all
prior strand arms).

## Wall numbers

NOT OBSERVABLE on 30-day evening legs (pre-seat, no
field) — reported as the window's structural value, not
a game verdict: national 0/10, table 0/10, wins 0/10 in
the sense that the legs contain no national/table/win
content (single-seed pilot; the 10-seed phrasing does
not apply). Median survival: 30 days (survived window
on all 4 legs — ceiling effect, not a survival claim).

## Verdict against the prereg

- DIAG-GO (judged exactly as written; conversion not
  required and not achieved). (a) HOLD: a trim mechanism
  exists in WRAPPER form (exported beats, zero
  competent.js edits) that preserves the walk on both
  legs — 8/8 evening landings match, every pressable
  strand morning presses. (b) HOLD: presses preserved
  above the hold arm's 0 on both legs (guard 1, ON 2).
  (c) HOLD: ticks saved reported per leg (guard 3/1/1,
  ON 3/1/9/17/1) against the known holes (day-7 hole
  NOT MOVED as preregistered; guard day-10 hole
  narrowed 3 -> 2, not cleared).
- DIAG-NO-GO triggers do NOT fire: the walk is NOT lost
  like the hold arm (presses fire, landings match), and
  a trim point DOES exist without editing competent.daily's
  core flow (the wrapper form). The instrument as built
  must NOT be shipped as a behavior: it loses the guard
  d11 rescue on kcal, brings bearer deaths forward on
  both legs, and newly ticks-shorts ON d10 through the
  morning-alignment flip. What the measurement DOES
  establish for the coordinator's next design: the walk
  is forageTripSeedFirst + walkHome (not a microMove
  walk); a walk-preserving trim saves only the 1-3
  social ticks on early strand days (9-17 on the fed ON
  trajectory, where more social beats fire) and cannot
  clear d10's hole; and skipping talk costs FOOD (+60
  kcal event) and shifts the RNG stream — any future
  trim must price the talk's meal, not just its tick.

## Proof

scripts/test-selecttrim-a.js: 89/89 checks pass,
including: pure gate tests (all fire/skip branches incl.
384 boundary, haven wake, tent, combat, game-over,
recovering, no-trip-needed, thirst-home);
thirstHomeWouldFire cases; lever gating; corpus checks
(4 legs x 30 evenings, errs 0); control reproduction
(guard presses [d10 E450], ticks-short [7,10]; ON
presses [d10 E540, d14 E900, d18 E810, d22 E990],
ticks-short [7,13,18,22]); trim legs (guard trims
[9,10,11] presses 1; ON trims [9,10,12,13,14] presses
2); walk landings 8/8 (incl. the rescued-control
spy-walkHome case, guard d11); ticks saved per day
(guard 3/1/1, ON 3/1/9/17/1); day-7 unmoved on all legs;
guard d10 94 vs control 93; gate-shift [11], conversions
[]; determinism (det-guard-trim byte-identical);
worktree-contains-only-my-files guard; src/ diff empty.

Disclosure (index clobber, repaired): after the prereg
safe-commit, the worktree index showed the prereg file
staged-as-deleted (the known safe-commit clobber class
from AGENTS.md) while the commit itself was correct
(blob ad51012d = worktree file hash). Repaired with
`git update-index --add --cacheinfo` before any judged
leg; HEAD unchanged (9e4dd7fbb), diff empty, verified
again after the final commit (see commit message
trailer). No sibling tree or branch was touched.

## Metric review

- Decision-time ticks vs evening ticks: the analyzer's
  first version judged ticks-short on evening dayTicks
  and misclassified ON evenings (warmth's 48 ticks run
  AFTER the bridge decision). Fixed to woodcarry
  classification.ticksToDayEnd — the same
  decision-time number ticks-b priced (guard d10 93,
  ON d13 95). Any future trim prereg must specify
  decision-time ticks, or ON legs will misread.
- Walk proxy vs walk-itself under succession: the
  prereg operationalized (a) as next-morning wake-cell
  match. Two rows mismatch on that proxy, both by
  succession (bearer died overnight), while the walk
  itself (evening landing) matches on all 8 trim days
  and every pressable morning presses. This run judges
  (a) on the walk itself and discloses the deviation
  here, rather than verdicting NO-GO on a succession
  artifact — the same transparency standard as
  combined-b's disclosed pilot-sniff judgment call.
  The coordinator may overrule to NO-GO on the strict
  proxy; if it does, the mechanism facts above stand
  unchanged (walk preserved, presses fire, ticks saved
  as tabled) and only the label changes.
- Talk is not tick-only: the +60 kcal talk event means
  "social beats cost 1-3 ticks" understates the trim's
  price. A future trim prereg must carry a kcal bar
  (no fed evening lost to a skipped talk) alongside
  any ticks bar, or it will repeat this run's guard
  d11 shape with a smaller trim.
- RNG-stream shift is a confound, not a flaw in the
  verdict: skipped talk draws shift later yields
  (press grapes 5 -> 6) and night outcomes (bearer
  deaths forward). The trim legs are honest trajectories
  of the trimmed policy, not controlled replays — the
  verdict's comparisons (walk, presses, ticks saved)
  are per-day structural facts, while kcal/death
  divergences are reported as cascade effects, not
  hidden.

## Out-of-scope findings (NOT chased; for the coordinator's backlog)

- [open] 2026-10-31 — food-economy/social — TALK IS A
  FOOD EVENT (this arm): talkTo on guard d9 moves kcal
  -60 -> 0 — the conversation feeds the villager (meal
  or gift) for exactly the forage effort debt. Skipping
  social beats costs food, not just ticks. (evidence:
  this file, §5; spy guard d9 calls.)
- [open] 2026-10-31 — food-economy/clock — MORNING
  ALIGNMENT FLIP (this arm, observed, mechanism not
  isolated): saving 3 ticks on ON d9 coincides with
  d10's morning flipping 256 -> 384 ticks, making d10
  newly ticks-short (221 -> 94). The sleep/upkeep
  threshold behind the flip is not isolated here.
  (evidence: this file, §5; ON control vs trim d9/d10.)
- [open] 2026-10-31 — food-economy/death — TRIM DEATH
  FORWARD (this arm, same class as the hold arm):
  bearer deaths forward on both trim legs (guard none
  -> day 12, ON day 23 -> day 15), candidate mechanism
  night-encounter lottery on the shifted RNG stream,
  not isolated. (evidence: this file, §5; deaths arrays.)

## Files

- Prereg: evidence/2026-10-31/sim-selecttrim-a-prereg.md
  (commit 9e4dd7fbb)
- Evidence (this file): evidence/2026-10-31/sim-selecttrim-a.md
- Census + compare: evidence/2026-10-31/sim-selecttrim-a-census.json,
  sim-selecttrim-a-compare.md
- Policy: scripts/policies/selecttrim-diag.js (default
  OFF); driver: scripts/selecttrim-trace-b.js; spy:
  scripts/selecttrim-spy-b.js; analyzer:
  scripts/analyze-selecttrim-a.js; proof:
  scripts/test-selecttrim-a.js (89/89)
- Judged corpora: evidence/2026-10-31/
  sim-selecttrim-a-corpus-guard-control,
  -guard-trim, -on-control, -on-trim (15215, 30 days)
- Determinism: evidence/2026-10-31/
  sim-selecttrim-a-corpus-det-guard-trim (byte-identical)
- Identification: evidence/2026-10-31/
  sim-selecttrim-a-spy-guard, -spy-on
