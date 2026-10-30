# sim-woodwarm-b — PREREGISTRATION (written BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-woodwarm-b,
axis food-economy (wood-short lacking-line, backlog
#1456 still-open sub-item). Worktree sim-woodwarm-b.
MEASUREMENT ONLY: zero src/js changes, zero
policy-default changes. This worker does NOT merge
to master — coordinator merges. Do NOT push, bump
versions, or verify live.

## Why this run exists

sim-woodshort-ledger-b (evidence/2026-10-30/
sim-woodshort-ledger-b.md, INSUFFICIENT-DATA)
proved the cooking-campfire staging route cannot
fire: the bot's stranded nights are foodless (no
rawKcal item), and its code survey found
makeFire/feedFire spend exactly 1 log, only on
success, only when the player holds fewer than 2
branches; competent.js walkTo BREAKS at a refused
step instead of building; the morning carry tops
the pack to 4 logs, so a spend only survives to
a later creek evening if no haven-morning refill
intervenes (multi-day strands exist, e.g. seed
15215 days 7–9). That run's named next path, and
this run's arm, is a bot that spends wood by
lighting a fire for warmth on a stranded night.

## Canon (read before judging)

- docs/CANON.md read first. No canon doc covers
  the creek/bridge lacking-line narration itself —
  stated here instead of inventing canon. Closest
  grounded canon: docs/TIME-ECONOMY.md (bridge
  build = 96 ticks, 60 kcal — the thresholds the
  line family names), docs/MAP.md (creeks block
  travel), docs/ABILITY-REFUSALS.md (refusals must
  be honest about why). The line under measurement
  is the landed woodcarry.js lackingLine,
  wood-short branch, NOT re-specified here.
- Fire engine facts (code reads, game.js):
  makeFire costs 32 ticks (+16 without beard-moss
  tinder; 8 with a lighter) + 70 kcal (5 with a
  lighter, clamped at 0); success is a friction
  lottery (knowledge / moss / drill / torch /
  pity curve); fuel is spent ONLY on success
  (spendFireFuel sits inside the success branch);
  fireFuel prefers 2 branches over 1 log, so a
  log is spent only when branches < 2. A warmth
  fire therefore needs no food in the pack, no
  cooking step, and no kcal gate — the engine
  clamps the kcal cost and names it.

## The staged route: stranded-night warmth fire

Real-play mechanism, in plain words: you get
caught out at a creek at nightfall with your 4
bridge logs. You are spending the night outside,
so you light a fire for warmth (1 log, if you
hold no branches to burn instead). Next night
you are still out, the creek still blocks you,
and now your pack holds 3 logs: the wood-short
line plays honestly, naming the live count.

Why warmth and not a widened cooking campfire:
the cooking purpose was the binding constraint
in the ledger run (knowledge-gated forage cannot
be cooked; the bot cooks known food during the
day). Warmth is a different, honest purpose —
temperature on a night spent outside — argued
here as its own trigger with its own predicted
signature, not smuggled in as a widened cooking
check. The policy lights NO fire for cooking and
attempts NO cookFood step.

Staging policy (scripts/policies/woodwarm.js,
policy-side only, zero src/js; wraps woodcarry,
runs AFTER inner.daily each loop-day):
- Gate: WOODCARRY=1 AND WOODWARM=1 (both
  asserted explicitly by the driver; guard legs
  have WOODWARM=0, so the guard stays pure).
- Trigger, ALL required, on a loop-day evening:
  (a) ctx._wcLast outcome travel-refused, bucket
  creek, rescued false (a genuine still-refused
  stranded night — any skip: kcal/ticks/build/
  retry); (b) player alive, not in combat, not
  game-over; (c) player NOT at haven
  (insideHaven false and tile not haven);
  (d) NOT in a tent (insideTent false — a tent
  night is sheltered, not a stranded-outside
  night); (e) branches held
  (materialCount('branch')) < 2, else a branch
  fire would spend no log — recorded as a miss,
  never lit for staging; (f) woodCount >= 1;
  (g) NOT nearFire already; (h) a fireGroundOK
  cell within 1 of the player's grid cell
  (mx,my), else miss; (i) ticksToDayEnd (live:
  512 - dayTicks) >= fire cost + 10, where fire
  cost = 8 (lighter) / 32 (beard-moss) / 48
  (otherwise). The +10 margin exists ONLY to
  keep tickAction from rolling the day over
  inside the fire step (tickAction calls endDay
  at dayTicks >= 512); it is NOT a cooking margin
  — no cooking follows a warmth fire.
  No kcal gate: the engine clamps the 70-kcal
  fire cost at 0 and names the clamped spend,
  and a 0-kcal player lighting a fire to survive
  a cold night outside is the survival story
  itself; kcal at lighting is recorded and the
  tail read judges it.
- Action, engine verbs only: ONE makeFire on the
  chosen ground cell. If the fire failed to
  catch, NO fuel was spent (engine fact) —
  recorded as a failed warmth fire, never counted
  as a spend. NO cookFood attempt, NO state edit
  outside the engine verb, NO RNG drawn by the
  policy itself (the friction lottery and any
  batch/monster turns inside tickAction are the
  engine's own, downstream of the lever, same
  class as the retry hop's encounter checks).
- Record per evening (ctx._wwLast): trigger
  outcome (acted / miss reason), woodBefore /
  woodAfter, logSpent, branchesBefore,
  kcalBefore / After, ticksBefore / After,
  ground cell, fireLit bool, fire error if any.
  Purpose is recorded as 'warmth' on every
  record so a warmth spend can never be mistaken
  for a cooking camp later.

## Predicted ledger signature (the route, if it stages)

- Night N: creek still-refused evening (any
  skip), rescued false; warmth acted: wood 4
  -> 3, fire lit, say lines for fire.
- Morning N+1: not-at-haven carry skip (no
  carry; pack stays 3) — UNLESS the player
  reached haven during day N+1, in which case
  the morning carry refills to 4 and the staging
  is lost; that outcome is recorded, not hidden.
- Night N+1: creek evening, woodPlayer 3,
  bridge skip wood-short, lacking line "the pack
  holds 3 logs, and a bridge needs 4." — with a
  full tail read for sense.
A wood-short evening counts as staged ONLY if a
prior loop-day evening (not necessarily N+1 —
any earlier night with no intervening haven-
morning refill, verified from the carry records)
has a warmth record with a log spent
(woodBefore - woodAfter >= 1 with fireLit
true). A wood-short evening without such a
prior spend is reported as an anomaly, never as
a staged success. Note the definition is
deliberately wider than the ledger run's strict
N+1: a warmth spend survives across ANY number
of stranded nights until a haven morning
refills the pack, so the linkage check walks
back through the carry records, not just one
night. The evening's own warmth action (after
the wood-short line is said) does NOT stage
itself — staging requires a PRIOR night's spend.

## Base pin (binding)

- PINNED BASE: worktree HEAD at prereg writing
  time, full hash
  c795e7e2535921c21fd0c27d5cd180f34d0fb40a.
  The prereg commit adds ONLY this file (no code,
  no policy, no driver change), so the legs run
  on pinned-base game code verbatim. The evidence
  file will verify with git diff that pinned base
  -> final tree differs in game code by nothing
  (only measurement scripts + evidence + corpora).
- Base drift is real on this repo: the bank
  census is RE-DERIVED on the pinned base from
  the warmth-OFF guard leg (WOODCARRY=1,
  WOODWARM=0) and judged against that fresh
  census, never quoted from the ledger run's old
  census (15 creek / 4 still / 11 rescued, wood
  4 on all 15) unless the guard leg reproduces
  it exactly. If it diverges, the divergence is
  reported and the old census is not cited as
  current-base behavior.
- If the coordinator later rebases this branch,
  the verdict does NOT travel with it:
  re-judgment would need a fresh base-pinning
  prereg.

## Legs (all on pinned base, identical driver env)

- Driver: scripts/woodwarm-trace-b.js (adapted
  from woodshort-ledger-trace-b.js; same honesty
  guards: no thief grant, no taps, no state
  edits, no clock-setting, no top-ups, no driver
  travelTo). Env asserted FATAL:
  COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1 POLICY=nighttravel WOODCARRY=1
  WOODWARM=0|1 DAYS=30.
- PILOT (instrument validation, part of the
  bank, not a separate selection): seeds 15003,
  15215, ON+warmth, 30 loop-days. Pilot checks:
  errs 0, warmth records present with the full
  field set, no day-rollover (evening loopDay
  sequence intact), determinism re-run of 15003
  byte-identical. A pilot instrument failure
  stops the run (fix the instrument, never the
  bar). The pilot seeds are bank seeds, so the
  pilot legs ARE judged bank legs, not extra
  draws.
- BANK: all 10 qualifier seeds from the
  woodshort 500-seed screen, in screen order
  (15003, 15009, 15091, 15211, 15215, 15220,
  15221, 15337, 15376, 15439), 30 loop-days each,
  driver scripts/woodwarm-trace-b.js, env
  POLICY=nighttravel, COMPETENT_FEAST=0,
  SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
  WOODCARRY=1, WOODWARM=1. No cap, no subset,
  no seed added after the bank runs.
  Qualifiers were selected for OFF creek
  evenings, independent of warmth — no selection
  on the staged outcome.
- OFF GUARD legs: the same 10 seeds, WOODCARRY=1
  WOODWARM=0, for the guard only (0 wood-short
  evenings; warmth inactive: 0 warmth records
  acted) AND for the pinned-base census
  re-derivation above. Guard legs are NOT judged
  for staging.
- Determinism: re-run of the first bank seed
  (15003) ON+warmth into a worktree staging dir,
  byte-compared to the judged corpus file,
  staging dir deleted after comparison. (The
  proof script re-runs this check on every
  invocation.)

## Bars (judged exactly as written; a miss is NO-GO /
INSUFFICIENT-DATA, never re-scored)

- PRIMARY: >= 2 honestly-staged wood-short
  creek evenings (per the signature above:
  prior warmth log-spend night, no intervening
  haven-morning refill, wood-short skip +
  live-count line on the staged night) AND at
  least one full tail sense-read passing.
  Minimum-n 2, stated up front, never lowered.
- If PRIMARY is 0 staged (or 1 staged, below
  the bar): the verdict is INSUFFICIENT-DATA
  with the miss breakdown, NOT CLOSE-AS-
  UNPLAYABLE — because the code survey already
  proves spend verbs exist, a staging miss on a
  10-seed bank disproves nothing. The evidence
  must report, separately: warmth triggers fired
  / missed by reason; fires lit with log spent;
  next-night creek evenings after a spend and
  why each did or did not go wood-short
  (walked home, hop succeeded, haven-morning
  refill, fire failed to catch, branches >= 2
  on the spend night, ticks gate — note wood is
  checked FIRST in bridgeDecision, so a post-
  spend creek evening that is NOT wood-short
  needs an explanation: pack replenished, e.g.
  morning carry after reaching haven, or wood
  cut during day N+1).
- CLOSE-AS-UNPLAYABLE is NOT an available
  verdict on this run: the survey found real
  spend verbs. What CAN be closed is narrower:
  "wood-short is unplayable under competent+
  nighttravel bot play" — true by the survey
  (no bot spend behavior), and the Steve-call
  note will carry that plus the real-play routes
  (bridge spend, fire spend) and the question
  of whether the bot should learn either
  behavior.
- INSTRUMENT bars: recorder/classifier errs == 0
  on judged legs; determinism re-run
  byte-identical; OFF guard 0 wood-short
  evenings and 0 warmth records acted.
- SENSE-TEST: at least one full tail sense-read
  passing on a staged evening (read the say
  tail: the wood-short line, the fire lines, the
  surrounding narration must cohere — a cold
  night outside, a fire lit, a pack one log
  lighter, a bridge that cannot be lashed).
  If no evening stages, the sense-test is NOT
  PERFORMED and is recorded as such, not hidden.

## Forbidden (as briefed; violations void the run)

- Weakening the carry, draining the pile, starving
  kcal by hand, re-screening ON legs hoping for a
  better draw, lowering any minimum-n bar, staging
  via dropItem, lighting a fire on a non-stranded
  night, lighting a fire with a cooking purpose
  (no cookFood step in this policy), building a
  bridge on any tile except through the engine's
  own evening step, any state edit outside engine
  verbs, quoting the ledger run's census as
  current-base behavior without re-deriving it.

## Metric review (for the NEXT run)

- If the warmth trigger rate is 0 for a single
  dominant reason (e.g. ticks gate on the
  strand nights, or branches >= 2 on every
  still-refused night), the next prereg should
  either take the daytime bridge-spend route
  with a mid-day policy design (the current
  blocker is competent.daily being monolithic —
  walkTo's refused step is inside it, and
  wrapping Game.travelTo would catch the judged
  evening hop too) or argue the line variant
  stands as unplayed-but-harmless for real
  players only. What it must NOT do is drop the
  stranded-night condition, light fires on
  rescued nights, or spend via dropItem.
- No balanced-panel compare .md is produced, as
  pre-registered: this is a 30-day position
  measurement of a policy-side behavior with zero
  src/js changes, so there is no game-root delta
  for a panel to compare, and the panel's registry
  policies do not include the nighttravel trace
  policy. The determinism re-run is the
  instrument-perturbation proof, and the bars
  above are the judge.
