# Loop A 0915Z round — scale-onramp: stance-layer trace DIAG-GO

Run: fleshout-loop-a-20261102T0915Z, arm sim-stancelayer-a, axis scale-onramp.
Worktree branch: sim-stancelayer-a, based at current master a9b63b88
(post-locatedengage; locatedengage commit 38b8e1666 is an ancestor).
POLICY/INSTRUMENT SIDE ONLY — zero `src/js` changes (git diff on src/
empty at report time). This arm sounded nothing, deferred nothing,
and mutated nothing: it is a pure diagnosis of the 0815Z finding
(seed 97301, step days 73/85/87). Prereg committed BEFORE any judged
sim (commit 4e4046491d, below; one safe-commit index-clobber repair
applied to the worktree index afterwards — the commit itself was
correct, verified by blob hash match; see Metric review).
Sibling Loop B trees/branches NOT touched. Sibling arm
sim-titanroute-a NOT depended on: no file of its tree was read or
used; this arm stands alone on master. No titan canon doc exists
in docs/ — stated, none invented (same finding as 0445Z, 0605Z,
0725Z, 0815Z); the in-code sources are `src/js/titans.js` +
`src/data/titans.json` + `src/js/havenGrowth.js` + the stance
machine in `src/js/game.js` (`monsterTurn`, `stanceFor`,
`playerMonster`).

## Verdict: DIAG-GO (all bars pass)

- (a) COVERAGE: every day 59–91 on 97301 carries a named daily
  label, 0 UNCLASSIFIED (validator: 33/33).
- (b) GATE-NAMED: step days 73/85/87 each carry a resolved gate
  sub-label (all three NO_TURN), 0 GATE-UNRESOLVED; attempt days
  78/89 each carry a resolved sub-label (both CLOSED-IN-DAY after
  the instrument correction below), 0 ATTEMPT-UNRESOLVED.
- (c) REPRODUCIBILITY: the trace reproduces the 0815Z milestones
  exactly for both seeds (97301: wave4 48, stage2 59, present
  59–91, attempts days 78/89, lair 8,4, traces 182, travel 327;
  97307: wave4 116, stage2 129, present 129–152, attempts 0, lair
  7,4, traces 302, travel 617). The stance instrument reads did
  not shift the runs.
- (d) PROOF: classifier unit proof 18/18 green
  (`scripts/test-stancelayer-classify.js`); corpus validator
  21/21 green, exit 0, reproducing the verdict from the corpus
  alone (`scripts/test-stancelayer-a.js`).
- (e) PURITY: zero `src/js` changes.
- (f) WALLS: per-seed wall numbers below — case + cross-check
  only, NEVER pooled, NEVER presented as band evidence.

## Reconciliation (pre-registered correction to the brief)

The brief's shorthand "stepping onto the lair tile alone produced
zero attempts on days 73/85/87" is imprecise, and this arm does
NOT repeat it as fact. The steps on those days landed the scholar
on the herald's CURRENT tile (5,4) via forageTripSeedFirst, NOT
on the lair tile (8,4): the lair (parsed from the lair line) is
(8,4), and no travel event in the window targets (8,4). The days
come from seed 97301, arm sim-locatedengage-a (0815Z) — NOT from
97307, which never shared a tile at all (this arm re-confirms:
97307 monsterTurn shared calls 0, arrivals 0). The judged
question is therefore about stepping onto the herald's tile, and
the lair tile itself is never stepped on in the window. A march
policy's arrival tile is the herald's CURRENT tile (it wanders),
not the lair tile.

## The answer, in plain words

Stepping onto the herald's tile does nothing by itself, because
stepping between tiles is not what the fight engine listens to.
The engine's stance machine runs only on detail-grid turns —
small steps inside a tile, touches, waits — and a tile hop
(`travelTo`) produces exactly zero of those turns. On all three
step days the scholar hopped onto the herald's tile and hopped
off again in the same trip, generating zero shared stance turns,
so the machine never moved, never watched, never closed, never
offered the fight. The sharpest case is day 87: the herald
followed the scholar onto the next tile and landed on the
scholar's EXACT detail cell (8,8) = (8,8), already hungry — and
still nothing happened, because no stance turn ran while they
stood there. Arrival, even coincided arrival, without a turn
after it, is experientially and mechanically nothing.

The attempts, when they came, did not come from waking up on the
right cell. They came from WAITING: on days 78 and 89 the scholar
waited at home while the raid-pinned herald shared the home
tile, and those waits ran 12 and 8 shared stance turns that
closed the detail distance from 8 cells away down to zero — the
attempt fired on the closing turn itself. The "morning snapshot"
in the 0815Z report is the result of that closing, not its
cause: the pre-daily sample is taken after the harness's
pre-daily waits, so it shows the cells already coincided because
the waits had already closed them. A march policy must therefore
not aim to "wake up coincided" or to "sleep on the tile" — sleep
produced zero stance turns in this corpus — it must arrive and
then WAIT (or step, or touch) on that tile, awake, until the
machine closes.

## The stance layer, precisely (code refs by function name)

- `monsterTurn` (game.js) is the only escalation path for a wild
  titan: it runs per detail-grid step (microMove), per interact
  (cellInteract), per wait batch, per searchRoom/examineCell —
  NOT per `travelTo` jump, NOT at dawn, NOT during sleep (zero
  sleeping=true shared calls in 49 recorded shared calls; haven
  tier was 3 throughout, so the sleep-at-haven-tier>=2 guard
  would additionally suppress any such turn at home, but no turn
  ever presented itself to be suppressed). Early returns: sleep
  guard, `playerMonster()` null (tile not shared), table active,
  glasswing/hummice specials (not herald). Then line of sight:
  if neither scholar nor nearest villager is visible (`canSee`),
  `lostSight++` + random drift, despawn at `lostSight > 6` — no
  stance progress on blind turns.
- `stanceFor` (game.js): the herald's data (monsters.json)
  `behavior` is prose ("It announces...") matching NO stanceFor
  branch, so the herald's initial stance falls through to
  `curious`. Observed: stance None until the first sighted
  shared turn (day 77 call #0: None → curious), because the
  blind path returns before stance initialization.
- `monsterTurn` curious branch: detail distance > 3 →
  `stepToward()` one cell (no watch progress); distance ≤ 3 →
  `watchTurns++`, and at `watchTurns >= 3` stance becomes
  `hungry` (watchTurns reset). Curious NEVER steps while
  watching and NEVER watches while far. Observed day 77 calls
  #0–#4, all on the home tile: d5 → step, d4 → step, d3 →
  watch 1, watch 2, then hungry.
- `monsterTurn` hungry branch: `stepToward()` one cell, then
  `startCombat(m.id)` iff detail cells coincide. Observed day
  78 calls #0–#9: d8 → d0 in 10 turns (8 progress + 2
  terrain stalls where `stepToward` could not move: #6 d2→d2,
  #8 d1→d1), attempt firing on the closing turn #9, then
  re-firing on #10/#11 while still coincided (3 attempts that
  day, all REFUSED/MUSTER-GATE). Day 89: d8 → d0 in 8 clean
  turns, attempt on #7.
- `travelTo` (game.js): a tile JUMP — it does NOT call
  `monsterTurn`. It calls `checkEncounter()` (wander tick, not
  the stance machine) and, on leaving a tile, the follow branch
  (truthy `mdef.follows` re-places the follower's detail cells
  on the new tile). Every tile hop therefore RESETS the detail
  distance to whatever the re-place/wander roll produces (day
  87: follow re-place landed the herald exactly on the scholar's
  cell; day 85: arrival distance 7; day 73: arrival distance 8).
  Closing progress on one tile does not carry to the next tile.
- Raid pins preserve detail numbers but change the grid they
  mean on: `havenRaidTick` (havenGrowth.js) and `havenGrowthDaily`
  (lingering re-pin) set ONLY tx/ty. Observed: day 77 post
  detail (8,2) on tile (3,4) → day 78 call #0 pre detail (8,2)
  on home tile (4,4) — same numbers, new grid, distance to the
  scholar's home cell re-measured from scratch (d8).

## The zero-attempt step days, gate by gate

- Day 73 — NO_TURN. Arrival (5,4): scholar detail (1,0),
  herald detail (4,8), Chebyshev distance 8, stance None (never
  initialized — no sighted shared turn had ever run). Shared
  monsterTurn calls that day: 0. The trip hopped (4,4)→(4,3)→
  (3,4)→(5,4)→(4,4) by travelTo only; no detail step, interact,
  or wait ran while on (5,4). Gate: NO_TURN (travelTo generates
  no stance turns), compounded by CURIOUS_FAR distance 8 — even
  one turn could only have stepped once.
- Day 85 — NO_TURN. Arrival (5,4): scholar (1,0), herald (8,3),
  distance 7, stance hungry (earned days 77+ and persisted).
  Shared calls: 0. A hungry herald 7 cells away needed 7
  closing turns and got none; the scholar's forage hop left the
  tile the same trip. Gate: NO_TURN alone — stance was ready,
  distance was closable, turns were zero.
- Day 87 — NO_TURN, the proof case. Arrival (5,4): scholar
  (1,0), herald (1,7), distance 7, stance hungry, shared calls
  on that tile: 0. Then the hop (5,4)→(4,2): the herald FOLLOWED
  and its follow re-place landed it on the scholar's exact
  entry cell (8,8) = (8,8), distance 0, stance hungry — and the
  scholar's next hop went home before any monsterTurn ran.
  Shared calls on (4,2): 0. Gate: NO_TURN alone — coincided,
  hungry, and still zero attempts, because coincidence without
  a stance turn is not an attempt. This single row kills any
  "arrive and it fires" design.

Near-misses that bound the requirement (shared but no attempt):

- Day 77 — HUNGRY_OPEN, 8 shared calls, all in the pre-daily
  wait phase on the home tile: curious → hungry (calls #0–#4),
  then hungry steps d3 → d1 (#5–#7). Sharing then broke when
  the daily's forage trip left home. One more shared turn at d1
  would have fired. Lesson: the budget must include the final
  closing turn, and departure forfeits it.
- Day 79 — HUNGRY_OPEN, 8 shared calls (wait phase): d8 → d4,
  with blind interludes (lostSight 0→1→0→1→2→0 across calls
  #2–#6 — sight flickering through terrain costs turns without
  closing). Departure forfeited the rest.
- Day 80 — HUNGRY_OPEN, 12 shared calls (wait phase): d8 → d1.
  Again one turn short when the daily's trip left home.
- Day 76 — BLIND, 1 shared call (daily-phase, on tile (5,4)):
  scholar (1,0), herald (0,2), d2, canSee false → lostSight
  0→1, random drift to (0,3), stance still None. Lesson: blind
  turns are not progress turns; the march must stand where the
  herald can see the scholar.
- Day 74 — SHARED_NO_ESCALATION/NO_TURN, day 75 —
  STEP_NO_ESCALATION/NO_TURN (a forage arrival on (4,3) at
  distance 8), day 81 — SHARED_NO_ESCALATION/NO_TURN: shared at
  the pre-daily sample, zero shared calls. These are the
  wait-phase puzzle below, NOT march-blockers: on step days the
  arrivals themselves generated the zero, whatever the waits did.

## Morning-snapshot answer (task question (d), stated plainly)

A policy that arrives mid-day CAN attempt the same day — but
only if it generates enough shared stance turns on that tile
BEFORE leaving it. The observed attempts fired during pre-daily
waits, not during sleep and not at dawn: the attempt is a
stance-turn event, and any turn source counts (wait batches,
detail steps, interacts). Sleep on the tile is NOT the mechanism:
zero sleeping shared calls were observed in 49 shared calls, so
sleeping through the night on the herald's tile buys no
escalation; at home with haven tier ≥ 2 the sleep guard would
suppress such turns anyway. What the march policy must do is
linger AWAKE: arrive, then wait (each wait yields ~4 batches ≈
up to 4 stance turns; observed closing days ran 8–12 shared
turns) until the attempt fires. The pre-daily "morning snapshot
coincidence" in the 0815Z report must not be read as a
precondition: on both attempt days the first firing call started
NON-coincided (day 78 call #9: d1 → d0; day 89 call #7: d1 →
d0) and the snapshot coincidence is what those closings left
behind. (See Metric review for the classifier correction this
forced.)

## March-policy requirement list (each tied to a traced observation)

1. ARRIVE ON THE CURRENT TILE, NOT THE LAIR TILE. The lair
   (8,4) was never visited; every step day targeted the
   herald's wandering tile (5,4). Track the monster's current
   tile; the lair line is stale the moment the herald wanders.
2. ARRIVAL IS NOT ENGAGEMENT. travelTo hops generate zero
   stance turns (days 73/85/87: arrivals + 0 shared calls + 0
   attempts). The policy must do something AFTER arriving.
3. LINGER AWAKE ON THE TILE AND GENERATE SHARED TURNS — waits
   first (each wait ≈ 4 stance turns; 8–12 turns closed d8 on
   days 78/89), else detail steps/interacts. Do not leave the
   tile until the attempt fires: days 77/80 ended at d1, one
   turn short, because the daily's trip departed.
4. BUDGET TURNS FROM THE ARRIVAL STATE, NOT FROM HOPE. Fresh
   curious herald at detail distance d: (d − 3) stepping turns
   to reach watch range (if d > 3), + 3 watch turns at ≤ 3 (no
   movement while watching), + up to 3 hungry closing turns
   (d ≤ 3 → 0), + terrain stalls (day 78: 2 stalls in 10 steps).
   Observed totals: d8 → 10 turns (day 78), d8 → 8 turns
   (day 89). A hungry herald at d7 (days 85/87 arrivals) needs
   7 closing turns — and got 0. Budget ≥ 11 shared turns for a
   fresh d8 arrival; verify turns are accruing (see open
   puzzle: wait batches are not guaranteed every day).
5. KEEP LINE OF SIGHT. Blind turns drift the monster and earn
   no stance progress (day 76), and 7 blind turns in a row
   despawn it (`lostSight > 6`, code). Stand on open cells, not
   behind blocking terrain.
6. DO NOT SLEEP ON THE TILE AS THE PLAN. Sleep generated zero
   stance turns here; the sleep guard additionally suppresses
   turns at home at tier ≥ 2. Linger awake; sleep is at best
   neutral, at worst the thing that ends sharing (departure +
   overnight re-pin re-measures the distance on a new grid).
7. DO NOT CHANGE TILES MID-CLOSE. Every tile hop re-places
   detail cells (follow re-place, wander re-roll) and re-opens
   the distance. The close must complete on ONE tile.
8. MUSTER BEFORE (OR DURING) THE CLOSE — THE ATTEMPT STILL
   GATES. All 4 attempts were refused MUSTER-GATE (no muster —
   the call was never sounded). Mitigating observation: a
   coincided stance turn re-attempts every turn (day 78: 3
   attempts on consecutive turns #9/#10/#11), so a muster
   completed mid-sequence could still catch a later turn — but
   the policy should sound the call first, not gamble on it.
9. STANCE PERSISTS, DISTANCE DOES NOT. Hungry, once earned,
   persisted days 77 → 89 across departures and re-pins; but
   every tile change re-measures the distance on the new grid
   (pins preserve detail NUMBERS, not distances). A policy that
   earned hungry yesterday still owes the full close today on
   whatever tile it arrives on.

## Sense-testing (real lines only, judged for meaning)

Day 87 has NO anchored herald line at all — and that absence is
the reading. The day's route, from the trace, is: a long walk
out and back, then the evening forage loop (4,4)→(4,3)→(5,4)→
(4,2)→(4,4). On (5,4) the scholar stands on the herald's tile,
7 detail cells from a hungry herald. On (4,2) the herald
follows and stands on the scholar's exact cell. Then the
scholar walks home. What the villager would have experienced:
walking through the herald's ground, feeling it trail them
onto the next tile and stand where they stand — and hearing
nothing. No warning, no cue, no "pads into the clearing" (that
line fires on wander steps onto the scholar's tile, and this
arrival was a follow, not a wander). The fiction says the sky
with a face in it is standing on you; the engine says nothing,
because no stance turn ran. A march policy that only routes
will reproduce this silence at the destination: the villager
arrives, the herald arrives with them, and nothing happens.
The wait — the lingering, the watching, the closing — is what
turns that silence into an encounter.

Contrast, day 89 (the one anchored refusal line, repeated from
0815Z): "⛔ THE HERALD does not notice you the way prey notices
a hunter. It notices you the way weather notices a field. You
cannot face this alone — sound the call, muster 10 allied
blades (you have 0)." Judgment, unchanged and sharpened: the
gate is legible and correctly refuses a solo fight — and the
refusal fired only because 8 wait-phase turns had closed the
distance first. The line is the END of the stance sequence, not
a substitute for it.

## Wall numbers (per seed only, never pooled)

- 97301: national 1, table 1, won 1, wave4 1, wave5 0, survival
  91d, endReason over-other, herald attempts 4 (days 78×3,
  89×1, all REFUSED/MUSTER-GATE, all wild-contact),
  pendingEncounter never true, shared monsterTurn calls 49
  (days 76/77/78/79/80/89), arrival rows 15.
- 97307: national 1, table 1, won 1, wave4 1, wave5 0, survival
  152d, endReason over-other, herald attempts 0, shared
  monsterTurn calls 0, arrival rows 0.

## Metric review (for the NEXT run, never this verdict)

- INSTRUMENT CORRECTION — ATTEMPT SUB-LABEL DEFINITION (applied
  with full disclosure; no bar outcome changed): the prereg
  defined COINCIDED-AT-DAWN from the pre-daily trace and
  CLOSED-IN-DAY from a closing call row, and the classifier's
  decision order preferred the pre trace. On both attempt days
  BOTH definitions hold literally (pre coinc true AND a closing
  call fired) — because the pre-daily sample is taken AFTER the
  harness's pre-daily waits (runDays: 3× doAction('wait'), then
  policy.daily with the pre sample inside it). The pre
  coincidence is therefore the RESULT of wait-phase closing,
  not its precondition, and the firing call is the proximate
  cause. The classifier was corrected to label from the FIRST
  firing call's pre state (pre.coinc true → COINCIDED-AT-DAWN;
  pre.coinc false + post.coinc true → CLOSED-IN-DAY), unit
  proof extended to 18/18 (including a stub where pre coinc
  true must NOT outrank a non-coincided firing call), validator
  re-run 21/21. Both attempt days are CLOSED-IN-DAY under the
  corrected rule (day 78 firing call #9: d1 → d0; day 89 firing
  call #7: d1 → d0). The bars never depended on which resolved
  label applied (both are resolved; 0 ATTEMPT-UNRESOLVED either
  way), so this is an attribution fix, not a re-score — but the
  next contact instrument should pre-register the firing-call
  rule and should record a wait-phase/daily-phase flag per call
  row (the judged corpus distinguishes them only by chain
  reconstruction: wait-phase chains end exactly at the
  pre-sample state).
- COINCIDENCE NEEDS TILE SHARING (trap in the old trace): day
  75 post shows detail coincidence (1,0) = (1,0) across
  DIFFERENT tiles (scholar (4,4), herald (4,3)) — detail numbers
  on different grids are not comparable. Any coincidence flag
  must be the conjunction (same tile AND same detail cell).
  The corrected attempt rule is immune (firing calls are
  tile-shared by construction), but a future instrument should
  store the conjunction, not bare detail equality.
- SAFE-COMMIT INDEX CLOBBER (known class, AGENTS.md): after the
  prereg safe-commit, the worktree index showed the prereg file
  as staged-deleted while the file existed untracked; the commit
  itself was correct (blob bb6ffb81... in HEAD). Repaired with
  `git update-index --add --cacheinfo` and verified (status
  empty, diff HEAD empty, hash-object matches). Check the index
  after EVERY safe-commit in this tree.
- PROBE/JUDGED DIVERGENCE (same class as 0815Z): the non-judged
  mt-count probe (scripts/stancelayer-probe-mtcount-20261102.js)
  omits the judged replay's startCombat readiness interceptor,
  whose readiness call generates a roster on first refusal — so
  its post-first-refusal days diverge (probe: attempts 78×3 +
  80×3, end day 90; judged: 78×3 + 89×1, end day 91). Its
  pre-first-refusal mechanism facts are used above (16 total
  monsterTurn calls/day on days 70–89; shared counts match the
  judged corpus on days 76/77/78); its day-80 numbers are
  DISCARDED and never cited as judged fact.
- OPEN PUZZLE — WAIT-PHASE CALLS ON DAYS 74/75/81 (not a bar
  item, not chased further here): the judged corpus shows zero
  shared calls on days 74/75/81 despite the herald being on the
  home tile at the pre-daily sample, while the (comparable
  pre-refusal part of the) probe shows 16 total monsterTurn
  calls those days, 0 shared, mostly on the home tile. Two
  candidate explanations, undistinguished by this corpus: (i)
  the raid/lingering pin lands AFTER the wait batches but
  before the pre-sample (pin timing inside the wait phase's
  dawn crossing); (ii) the pinned herald is shadowed on the
  home tile by another monster (monsterAt returns the first
  entry; raid pins do not check occupancy). A march policy
  that lingers by waiting must VERIFY stance turns are actually
  accruing (count shared calls), because a wait that yields no
  shared turn is a wasted wait. The next instrument should log
  monsterAt(scholar tile) identity per call to separate (i)
  from (ii).
- ROW ATTRIBUTION (inherited from 0815Z): trace rows are stamped
  by scholar day at sample time; monsterTurn call rows are
  stamped by scholar day at call time, which mixes wait-phase
  calls (before the pre-sample) with daily-phase calls (after
  it) under one day stamp. The verdict does not depend on the
  split (gates are per-day), but a future instrument should
  carry a phase flag (wait vs daily) per call row.

## Findings (for the coordinator, not chased mid-run)

1. THE 0815Z "MORNING SNAPSHOT" SENTENCE NEEDS ITS CORRECTION
   CARRIED FORWARD: "attempts fired only when the detail cells
   coincided at the morning snapshot" reverses cause and effect.
   The snapshot coincided because wait-phase stance turns had
   already closed the distance and fired. Any brief or design
   doc repeating the snapshot version should be corrected to
   the closing version, or the march policy will optimize for
   waking up coincided — which no mechanism produces.
2. WAIT-BATCH ACCOUNTING IS A MARCH-POLICY INPUT: the number of
   stance turns a wait yields (~4/batch, but 0 shared turns on
   days 74/75/81 for undetermined reasons) is the policy's
   real budget currency. The march policy needs a turn counter,
   not a wait counter.
3. FOLLOW RE-PLACE CAN COINCIDE BY ACCIDENT (day 87, (4,2)):
   a follower's detail re-place can land it exactly on the
   scholar's cell. Coincidence at arrival is therefore not
   evidence of closing — only a stance turn on that tile is.
4. SLEEP IS NOT A LINGER MECHANISM (this corpus): zero sleeping
   shared calls; the sleep guard additionally suppresses home
   turns at tier ≥ 2. Any "sleep on the lair tile" plan needs
   its own proof before it is designed around.

## Convergence state

scale-onramp stays converging (NOT converged): the stance layer
of located-titan engagement is now ANSWERED (tile arrival
without stance turns is nothing; waits/steps/interacts close;
sleep does not; muster still gates), but no march policy has
been built or measured here (that is sim-titanroute-a's tree).
The next move on this axis is that policy's measurement
against this requirement list, not another trace.

## What was built (stays — the reusable stance-layer trace instrument)

- `scripts/stancelayer-replay-20261102.js` — locatedengage
  replay + read-only monsterTurn bracket (shared-call rows with
  stance/watchTurns/lostSight/detail cells/coincidence/sleep/
  tier/table flags + attempt delta) + travelTo arrival rows +
  extended pre/post traces.
- `scripts/stancelayer-classify.js` — pure per-day gate
  classifier (ATTEMPT / STEP_NO_ESCALATION / SHARED_NO_ESCALATION
  / SCHOLAR_NEAR / APART / UNCLASSIFIED + gate sub-labels,
  firing-call attempt rule).
- `scripts/test-stancelayer-classify.js` (unit, 18/18),
  `scripts/test-stancelayer-a.js` (corpus validator, 21/21).
- `scripts/stancelayer-probe-mtcount-20261102.js` (non-judged
  probe — total vs shared call counts; post-first-refusal days
  divergent, see Metric review).
- Corpus: evidence/2026-11-02/perseed-stancelayer-a/
  (sl-s97301.json, sl-s97307.json, run-97301/97307.stdout/
  .stderr, probe-mtcount.log/.stderr). DISCLOSED REUSE: both
  seeds are the 0725Z pilot case + contrast, re-traced — never
  pooled, never band evidence.

## Commits (this branch, coordinator merges —ff-only or not at all)

- 4e4046491d prereg (before any judged sim).
- CLOSING COMMIT (this evidence + corpus + replay + classifier +
  tests + probe; DIAG-GO, scripts stay).

Check note (not a bar): `node scripts/check.js --quick` on this
tree: 284 passed, 6 failed in 489s. All 6 failures are in
pre-existing suites untouched by this arm (godpath
test-measurement-proof-update, test-measurement-workflow,
test-mobile-combat-cadence, test-occupation-panels,
test-phone-frame-proof, test-establishment-r20-fixes-20261020);
no stancelayer file appears in the check run, and this arm
changes zero src/js and zero shared test files, so it cannot
have caused them. Left as found; the coordinator can confirm
pre-existing status against master.

Ready for coordinator merge, pending ship. Nothing pushed, no
version bump, no live verification (ship loop owns deploys).
