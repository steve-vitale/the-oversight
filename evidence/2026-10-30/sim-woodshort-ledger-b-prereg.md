# sim-woodshort-ledger-b — PREREGISTRATION (written BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-woodshort-ledger-b,
run fleshout-loop-b-20261030T0230Z, axis food-economy
(wood-short lacking-line, backlog #1456 still-open sub-item).
Worktree sim-woodshortledger-b.
MEASUREMENT ONLY: zero src/js changes, zero policy-default
changes. This worker does NOT merge to master — coordinator
merges. Do NOT push, bump versions, or verify live.

## Why this run exists

sim-lackingline-woodshort-b (evidence/2026-10-29/
sim-lackingline-woodshort-b.md, landed 5d40ae91c) closed
both honest routes its prereg named (day-1 pile-floor
morning never meets a creek evening: day-1 evenings
inside on 500/500 screen seeds; stranded mornings meet
creek evenings but packs still hold 4 logs) and left the
sharper question: is there ANY honest route to a
wood-short creek evening via the pile/pack ledgers, or
is the sub-claim unplayable-by-construction under the
shipped carry? This run answers it with a code-led
route survey (below, done BEFORE any judged leg, from
code reads only) plus ONE staged route test.

## Canon (read before judging)

- docs/CANON.md read first. No canon doc covers the
  creek/bridge lacking-line narration itself — stated
  here instead of inventing canon. Closest grounded
  canon: docs/TIME-ECONOMY.md (bridge build = 96
  ticks, 60 kcal — the thresholds the line family
  names), docs/MAP.md (creeks block travel),
  docs/ABILITY-REFUSALS.md (refusals must be honest
  about why). The line under measurement is the
  landed woodcarry.js lackingLine, wood-short branch,
  NOT re-specified here.

## Code-led route survey (code reads only, no legs run)

Pack-wood ledger: Game.woodCount / addWood / spendWood
(src/js/game.js). The ONLY spenders of player-carried
wood in the engine are:
1. buildBridge — spends exactly 4 logs (game.js
   buildBridge; refuses unless wood >= 4, so a
   4-log pack goes to 0). Requires a deliberate
   build action.
2. makeFire / feedFire — spends exactly 1 log, and
   ONLY on success (spendFireFuel sits inside the
   success branch; a failed friction attempt spends
   kcal/ticks but no fuel), and ONLY when the player
   holds fewer than 2 branches (fireFuel prefers 2
   branches; feedFuel prefers 1 branch). Requires a
   deliberate fire action. Costs: 32 ticks (+16
   without beard-moss tinder; 8 with a lighter) +
   70 kcal (5 with a lighter); cooking is a further
   32 ticks (16 with a camp pot).
3. buildFoundShelter — exile-only (betrayal.js;
   founding flow), irrelevant to haven play.
4. dropItem — voluntary discard. Deliberately NOT a
   route: dropping your bridge logs to manufacture a
   wood-short line is staging, not play. Forbidden
   in this run.
No engine mechanism spends pack wood without a
deliberate player action: no auto-burn, no theft
from the pack, no combat item loss, no NPC taking
found in the survey. Consequence: under
competent+nighttravel, pack wood can NEVER fall
below 4 during a day, because the bot never builds
bridges, never lights field fires, never drops wood
(competent.js: walkTo BREAKS at a refused step
instead of building; cookPack cooks only near an
existing fire; no makeFire / buildBridge /
dropItem call in any policy). The 52-evening all-4
record is therefore explained structurally, not by
bad luck — and "unplayable-by-construction" is
FALSE about the game (spend verbs exist) but TRUE
about the bot policy (no spend behavior exists).
The Steve-call note in the evidence will say
exactly that.

Pile ledger: village pile drains are hearthBoil
(boils 6L per log from the pile), villager whittle
(1 log while pile > 3), takeWood / morning carry
(player takes), and haven construction via
havenGrowth mats. Pile replenishment is wood duty
(competent.js assigns wood duty while pile < 8)
plus haul-backs. The pile route (a haven morning
with pack < 4 AND pile below the 8-log floor, past
day 1) is NOT re-staged here: it needs a pack
below 4 first, which needs a spend first. The pile
trajectory is still reported on the new bank as a
secondary ledger check (min pileBefore on haven
mornings, days 2+).

## The ONE staged route: stranded-night campfire

Real-play mechanism, in plain words: you get caught
out at a creek at nightfall with your 4 bridge logs.
You make camp — light a fire to cook dinner (1 log,
if you hold no branches to burn instead). Next
night you are still out, the creek still blocks you,
and now your pack holds 3 logs: the wood-short
line plays honestly, naming the live count.

Why this route and not the daytime bridge build:
a daytime bridge spend is equally real, but it
cannot be staged without invasive mid-day hooking
(competent.daily is monolithic; walkTo's refused
step is inside it; wrapping Game.travelTo would
also catch the judged evening hop itself and
destroy the measurement). The campfire stages at
a clean, genuine decision point AFTER the judged
refusal, using only engine verbs, perturbing
nothing before the refusal. The bridge-spend route
is documented as real-play-true but bot-untestable
on current policy — a finding, not a staged claim.

Staging policy (scripts/policies/campfire.js,
policy-side only, zero src/js; wraps woodcarry,
runs AFTER inner.daily each loop-day):
- Gate: WOODCARRY=1 AND CAMPFIRE=1 (both asserted
  explicitly by the driver; OFF legs have neither,
  so the OFF guard stays pure).
- Trigger, ALL required, on a loop-day evening:
  (a) ctx._wcLast outcome travel-refused, bucket
  creek, rescued false (a genuine still-refused
  stranded night — any skip: kcal/ticks/build/
  retry); (b) player alive, not in combat, not
  game-over; (c) player NOT at haven (insideHaven
  false and tile not haven); (d) branches held
  (materialCount('branch')) < 2, else a branch
  fire would spend no log — recorded as a miss,
  never lit for staging; (e) woodCount >= 1;
  (f) pack holds >= 1 raw cookable item (rawKcal
  set AND needsCooking true); (g) NOT nearFire
  already; (h) a fireGroundOK cell within 1 of the
  player's grid cell (mx,my), else miss; (i)
  ticksToDayEnd (live: 512 - dayTicks) >= fire
  cost + 40, where fire cost = 8 (lighter) / 32
  (beard-moss) / 48 (otherwise) — this hard gate
  exists so tickAction can never roll the day over
  inside the camp step (tickAction calls endDay at
  dayTicks >= 512); cooking takes a further 32
  ticks (16 with a camp pot) inside the 40 margin.
  No kcal gate: the engine clamps the 70-kcal
  fire cost at 0 and names the clamped spend, and
  a 0-kcal player cooking dinner to eat is the
  survival story itself; kcal at lighting is
  recorded and the tail read judges it.
- Action, engine verbs only: ONE makeFire on the
  chosen ground cell; if the fire lit (success),
  attempt ONE cookFood on the first raw cookable
  item if live ticksToDayEnd >= 16 afterwards
  (water refusal is recorded, not forced). If the
  fire failed to catch, NO fuel was spent (engine
  fact) — recorded as a failed camp, never counted
  as a spend. No state edits, no RNG drawn by the
  policy itself (the friction lottery and any
  batch/monster turns inside tickAction are the
  engine's own, downstream of the lever, same class
  as the retry hop's encounter checks).
- Record per evening (ctx._cfLast): trigger
  outcome (acted / miss reason), woodBefore /
  woodAfter, branchesBefore, kcalBefore / After,
  ticksBefore / After, ground cell, fireLit bool,
  cooked count + item name or cook refusal.

## Predicted ledger signature (the route, if it stages)

- Night N: creek still-refused evening (skip in
  kcal-short / ticks-short / build-refused /
  retry-refused), rescued false; camp acted:
  wood 4 -> 3, fire lit, say lines for fire (+
  cooking if it ran).
- Morning N+1: not-at-haven carry skip (no carry;
  pack stays 3).
- Night N+1: creek evening, woodPlayer 3,
  bridge skip wood-short, lacking line "the pack
  holds 3 logs, and a bridge needs 4." — with a
  full tail read for sense.
Any night-N+1 creek evening counts ONLY if its
loop-day N camp record shows a log spent (wood
4 -> 3 with fireLit true). A wood-short evening
without a preceding camp spend is reported as an
anomaly, never as a staged success.

## Base pin (binding)

- PINNED BASE: worktree HEAD at prereg writing
  time, full hash ff6bf0e04fecd10fab2aa2807a99b9003e8cd9e2.
  The prereg commit adds ONLY this file (no code,
  no policy, no driver change), so the legs run on
  pinned-base game code verbatim. The evidence file
  will verify with git diff that pinned base ->
  final tree differs in game code by nothing (only
  measurement scripts + evidence + corpora).
- If the coordinator later rebases this branch, the
  verdict does NOT travel with it: re-judgment
  would need a fresh base-pinning prereg.

## Legs (all on pinned base, identical driver env)

- Driver: scripts/woodshort-ledger-trace-b.js (adapted
  from woodcarry3-trace-b.js; same honesty guards:
  no thief grant, no taps, no state edits, no
  clock-setting, no top-ups, no driver travelTo).
  Env asserted FATAL: COMPETENT_FEAST=0 SEATDRIVE=0
  PLENTYDEPRI=0 DEPOSITGATE=1 POLICY=nighttravel
  WOODCARRY=1 CAMPFIRE=1 DAYS=30.
- PILOT (instrument validation, part of the bank,
  not a separate selection): seeds 15003, 15215
  (one plain qualifier + the multi-strand seed
  from the woodshort screen). Pilot checks: errs 0,
  camp records present with the full field set,
  no day-rollover (evening loopDay sequence
  intact), determinism re-run of 15003
  byte-identical. A pilot instrument failure stops
  the run (fix the instrument, never the bar).
- BANK: all 10 qualifier seeds from the woodshort
  500-seed screen, in screen order (15003, 15009,
  15091, 15211, 15215, 15220, 15221, 15337, 15376,
  15439). No cap, no subset, no seed added after
  the bank runs. Qualifiers were selected for OFF
  creek evenings, independent of campfire — no
  selection on the staged outcome.
- OFF GUARD legs: the same 10 seeds, WOODCARRY=0
  CAMPFIRE=0, for the guard only (0 "No bridge"
  hits across all OFF evenings; campfire inactive:
  0 camp records). OFF legs are NOT re-screened
  for qualifiers and NOT judged for wood-short.
- Determinism: re-run of the first bank seed
  (15003) ON+c camp into a worktree staging dir,
  byte-compared to the judged corpus file, staging
  dir deleted after comparison. (The proof script
  re-runs this check on every invocation.)

## Bars (judged exactly as written; a miss is NO-GO /
INSUFFICIENT-DATA, never re-scored)

- PRIMARY: >= 1 honestly-staged wood-short creek
  evening (per the signature above: camp log-spend
  on night N, wood-short skip + live-count line on
  night N+1) with a full tail read for sense.
  Minimum-n 1, stated up front, never lowered.
- If PRIMARY is 0: the verdict is
  INSUFFICIENT-DATA with the miss breakdown, NOT
  CLOSE-AS-UNPLAYABLE — because the code survey
  already proves spend verbs exist, a staging miss
  on a 10-seed bank disproves nothing. The
  evidence must report, separately: camp triggers
  fired / missed by reason; fires lit with log
  spent; next-night creek evenings after a spend
  and why each did or did not go wood-short
  (walked home, hop succeeded, bridge built from
  a different state, ticks/kcal binding first —
  note wood is checked FIRST, so a post-spend
  creek evening that is NOT wood-short needs an
  explanation: pack replenished, e.g. morning
  carry after reaching haven, or cutting during
  day N+1).
- CLOSE-AS-UNPLAYABLE is NOT an available verdict
  on this run: the survey found real spend verbs.
  What CAN be closed is narrower: "wood-short is
  unplayable under competent+nighttravel bot play"
  — true by the survey (no bot spend behavior),
  and the Steve-call note will carry that plus
  the two real-play routes (bridge spend, fire
  spend) and the question of whether the bot
  should learn either behavior.
- SECONDARY (ledger, no bar): pile trajectory on
  the bank — min pileBefore on haven mornings,
  days 2+, from carry records; reported as
  re-confirmation (or refutation) of the pile
  route staying closed.
- INSTRUMENT bars: recorder/classifier errs == 0
  on judged legs; determinism re-run
  byte-identical; OFF guard 0 lever lines and 0
  camp records.

## Forbidden (as briefed; violations void the run)

- Weakening the carry, draining the pile, starving
  kcal by hand, re-screening ON legs hoping for a
  better draw, lowering any minimum-n bar, staging
  via dropItem, lighting a fire without the cooking
  purpose (raw cookable food + no fire near +
  good ground + tick room), building a bridge on
  any tile except through the engine's own evening
  step, any state edit outside engine verbs.

## Metric review (for the NEXT run)

- If the campfire trigger rate is 0 for a single
  dominant reason (e.g. no raw cookable food on
  stranded nights, or ticks gate), the next prereg
  should either widen the camp purpose honestly
  (fire for warmth on a stranded night is itself a
  real player behavior — but it must be argued,
  not smuggled) or take the bridge-spend route
  with a mid-day policy design. What it must NOT
  do is drop the cooking purpose silently or
  light fires on non-stranded nights.
- No balanced-panel compare .md is produced, as
  pre-registered: this is a 30-day position
  measurement of a policy-side behavior with zero
  src/js changes, so there is no game-root delta
  for a panel to compare, and the panel's registry
  policies do not include the nighttravel trace
  policy. The determinism re-run is the
  instrument-perturbation proof, and the bars
  above are the judge.
