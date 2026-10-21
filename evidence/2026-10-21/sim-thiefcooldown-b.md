# sim-thiefcooldown-b — Thief-ability theft spam (findings backlog 2026-10-20)

Arm: food-economy/trust surface, scale-wall lens. Run: loop B, 2026-10-20/21.
Base: 5886ab681. Worktree: ~/workspace/worktrees/sim-thiefcooldown-b.

## Pre-registration (binding, MEASUREMENT.md §§9-12, 14-15)

- PRIMARY: caught-red-handed trust-hit events per 10-day window <= 3
  (the finding observed ~30 on seed 8801, d135-144).
- CONTROL: a genuine steal still triggers the punishment — the thief branch
  must still fire on a real over-share take (proven with a scripted theft).
- Guardrails: (a) no behavior change for non-thief runs — det-gate
  byte-identical without a thief scholar; (b) no new death modes.
- Horizon: unit proof paced 3x600 kcal/day x 10 days (1800 kcal/day, under
  the 2000 fair-share norm — the finding's "ordinary pantry eating");
  pilot: 8 seeds x 100 days, death-aware (runDays endReason), leadfeast +
  SURPLUSFEED=1 + doomeddraw governor + FEASTSCALE_R13=1 + SEATDRIVE=0,
  scholar granted Light Fingers at setup (the finding's substrate).
- Policies: leadfeast (finding's policy); the unit proof drives
  takeFromPantry directly on a live Game (no mocks).

## Investigation (STEP 1) — verdict: DEFECT

The takes/gives ledger misfiring on communal eating — NOT working as designed.

What trips the bar: `takeFromPantry` / `takeFromPantryBulk` computed
`net = v.gives[vid] - v.takes[vid]` as a LIFETIME cumulative gross and fired
the "noticed" block on `net < -5000` on EVERY take, with no cooldown and no
time dimension. ~2.5 days of fair-share eating (~2000 kcal/day, Steve
2026-10-06) crosses -5000 for good; every later take then reads as theft.
For a Light Fingers scholar each such take is a 50% coin flip for
"Caught red-handed! They saw you steal. Trust -20." — ~30 hits in 10 days on
seed 8801, trust craters to 0 and stays there.

The code's own comments identify this exact class as a defect, twice:
- r7 (theftConfrontation): the old code passed cumulative lifetime takes, so
  "~2 days of the village's own communal feeding tripped 'blatant theft' —
  below-fair-share eating was indistinguishable from hoarding." Fixed to
  this-take + trailing-7d rate.
- r9 (freeloaderTick): "the old cumulative approach was manufactured
  evidence" — the clock now judges the trailing-7d NET rate vs fair share:
  "eating your own day's food is never evidence — taking MORE than you need,
  sustained, is."
- The takeHist header itself: "v.takes[vid] is cumulative GROSS with no time
  dimension — it cannot distinguish 'ate their share for a week' from
  'drained the pantry.'"

Canon reading (SENSE-TESTING LAW): the fiction "Caught red-handed! They saw
you steal." voiced for a villager eating their 2000/day fair share from the
communal pantry reads as a ledger misfire, not caught-stealing. Canon:
"THEFT IS ALLOWED... Take more than your fair share while witnesses are
present" and "the pantry is TAKE WHAT YOU WANT; the consequences are
social." Eating your share is not theft.

RED proof (pre-fix, scripts/test-thiefcooldown-b.js MODE=red, 7/7):
- 30 paced ordinary takes (3x600/day x 10d, netRate7 ~1800/day): 6
  caught-red-handed, trust 15 -> 0.
- The old bar is blind to the rate ledger: a genuine RECORDED hoard
  (takeHist +16000 kcal) does NOT trip it — it only sees cumulative
  v.takes gross.
- Non-thief ordinary eater: trust 15 -> 0 with 9 "Someone watches you take
  food" nicks — the misfire was never thief-specific.

## Fix (STEP 2) — minimal, game-code only

`src/js/game.js`, +24/-7. Both take paths now gate the "noticed" block on
the trailing-7-day NET take rate against the 3000 kcal/day abuse bar:

```js
const netRate7 = this.takeRate7(vid) - this.giveRate7(vid);
if (netRate7 >= 3000) { /* thief coin / -2 nick, unchanged inside */ }
```

BAR CHOICE (design call, documented for Steve's overrule): the first cut
used `> 2000` (freeloaderTick's draining bar). Investigation then surfaced
scripts/test-ledgerpenalty-20261014.js — the 2026-10-14 spec written for
sim-findings #156 ("takeFromPantry's '-2 trust per take when net < -5000'"),
which pre-registered EXACTLY this fix with the 3000 bar and boundary tests
at 2999.4/3000.4 kcal/day. The fix was specified but never landed. Adopting
the pre-registered 3000 (1.5x the fair-share norm, same as
theftConfrontation's rate bar): the 2000-3000 band stays covered by the
freeloader clock's staged 3/7/12-day ladder — no gap. The #156 spec is now
10/10 green against the fix (its T6 fixture needed one honest correction:
the take-back -5 requires givePending/giveTrust, which bare v.gives never
arms — armed it so T6 really exercises the guard it names).

- takeFromPantry: replaced `if (net < -5000)`. takeHist for the current take
  was already recorded above the bar.
- takeFromPantryBulk: replaced `if (net < -Math.min(5000, _pk))`; moved
  `recordTakeHist(vid, totalKcal)` above the bar (was recorded after) so the
  rate includes the current pack, mirroring the single path; removed the
  now-unused pantry-scaled `_pk` computation.
- Inside the block, NOTHING changed: Light Fingers keeps its 50% clean-palm
  / -20-caught behavior, non-thief keeps the -2 nick, the donate-then-take-
  back exploit check (cumulative `net`) is untouched, and theftConfrontation
  (this-take + 3000/day rate bars) plus the freeloader clock still punish
  genuine theft through their own paths.

GREEN proof (post-fix, MODE=green, 10/10):
- Same 30 paced ordinary takes: 0 caught events (primary <= 3/10d: PASS),
  trust stays 15.
- CONTROL genuine theft: recorded 16000 kcal take history (netRate7 ~2285 >
  2000), forced caught coin -> "Caught red-handed!" voiced, trust 15 -> 0
  (-20 intact); forced clean coin -> "palm the food cleanly", trust stays 15.
  Light Fingers still works; real theft still punished.
- DET-A donor (net never near either bar): byte-identical summaries pre/post.
- DET-B ordinary eater, non-thief: pre-fix trust 0 / 9 nicks; post-fix trust
  15 / 0 nicks — the fix is confined to the previously-misfiring nick.

## Pilot — 8 seeds x 100d, thief-scholar leadfeast (post-fix)

scripts/sweep-thiefcooldown-b.js, seeds 8801-8808. Per-seed JSONs:
evidence/2026-10-21/perseed-thiefcooldown-b/postfix-seed<seed>.json.

| seed | survived | end | caught | max/10d | trust start->end (min) | death |
|------|----------|-----|--------|---------|------------------------|-------|
| 8801 | 100 | survived | 0 | 0 | 15->85 (15) | d86 combat |
| 8802 | 100 | survived | 0 | 0 | 15->80 (15) | d71 combat |
| 8803 | 100 | survived | 0 | 0 | 15->71 (15) | d91 combat |
| 8804 | 85 | village-lost | 0 | 0 | 15->60 (15) | d73 combat |
| 8805 | 100 | survived | 0 | 0 | 15->71 (15) | d91 combat |
| 8806 | 100 | survived | 0 | 0 | 15->79 (15) | d87 combat |
| 8807 | 61 | village-lost | 0 | 0 | 15->55 (15) | d54 combat |
| 8808 | 100 | survived | 0 | 0 | 15->75 (15) | d83 combat |

PRIMARY verdict: maxCaughtPer10d = [0,0,0,0,0,0,0,0] — PASS (bar <= 3;
finding observed ~30 pre-fix). Trust never dips below its 15 start on any
seed — honest play now BUILDS trust (55-85) instead of cratering it. All
scholar deaths are combat (the leadfeast policy faces the feast's scavenger
draw) — no new death modes; two village-lost ends are combat-attrition, the
policy's known profile, unrelated to the trust mechanic.

Wild pre-fix tie-in: the finding itself is the pre-fix wild data point —
seed 8801, same substrate (leadfeast + SURPLUSFEED=1), ~30 caught in 10 days
(d135-144). Post-fix seed 8801: 0 caught in 100 days. (A revert-and-rerun
pilot was deemed redundant: the unit RED proves the mechanism on the same
seed, and the finding documents the wild pre-fix number on the identical
substrate.)

## Village assessment

Eight thief-scholar villages (leadfeast + SURPLUSFEED=1, 100d death-aware).
What they looked like: ordinary, working villages. The scholars ate from
the communal pantry like everyone else — and for the first time, the
village treated that as eating, not stealing. Trust on every seed climbed
from its 15 start to 55-85 and never dipped below 15; pre-fix the same
substrate cratered it to 0 within days of ordinary eating (finding, seed
8801). Nobody was "caught red-handed" even once across 800 village-days —
not because the thief branch was removed (the scripted CONTROL proves it
still fires on a genuine 3142/day hoard), but because no scholar sustained
over-share taking: the Light Fingers scholars simply ate their share.

Who died and why: every scholar died in combat (d54-91) — the leadfeast
policy faces the feast's scavenger draw, and the courtship road is a
fighting road. Combat death is the policy's known profile, not a new death
mode; the villages played on (6/8 reached d100; 8804 and 8807 lost the
village at d85/d61 to combat attrition). No starvation, no exile, no
trust-collapse deaths.

What was missing: nothing new surfaced — the instrument was narrow by
design (caught events + trust + survival). The sense read of the finding
stands: the fiction now matches the mechanic (a villager eating their share
hears nothing; a villager draining the pantry gets noticed, then
confronted, then freeloaded out — the staged pipeline works as canon
describes).

Blank filled: the takeFromPantry/takeFromPantryBulk cumulative theft bar
(the ledger misfiring on communal eating). Blank documented for a next arm:
justice.js moot heat still uses the cumulative ledger (net < -5000/-15000)
— same defect class, different system, out of this arm's scope.

## Blanks filled / documented

- FILLED: the takeFromPantry/takeFromPantryBulk cumulative theft bar —
  ordinary communal eating no longer reads as theft; genuine over-share
  taking still punished through the thief branch, theftConfrontation, and
  the freeloader clock.
- DOCUMENTED: justice.js moot heat still uses the cumulative ledger
  (`net < -5000/-15000` adds heat). Out of this arm's scope (moot
  accusation, not per-take spam); the r9 doctrine suggests it is the same
  defect class and a candidate next arm — appended to sim-findings.md.

## Related test updates (same commit, design changed on purpose)

- scripts/test-takefrompantry-zero-trust-20261013.js: trip fixture updated
  for the rate bar (seeds 22000 kcal take history -> ~3142/day >= 3000; a
  single 400-kcal take no longer trips it). The zero-trust doctrine
  assertions (0 stays 0, 10->8, unset->13, floor at 0) are unchanged and
  green — the -2 path's doctrine survives the re-barring.
- scripts/test-ledgerpenalty-20261014.js (#156 spec): T6 fixture armed
  honestly (givePending) — see above. Now 10/10 green.

## Metric review

- The pre-registered guardrail (a) said "no behavior change for non-thief
  runs (det-gate byte-identical without a thief scholar)". The investigation
  (DET-B RED: non-thief ordinary eater trust 15 -> 0, 9 nicks pre-fix)
  proved the misfire was never thief-specific — the non-thief -2 nick is the
  same documented defect class (r7/r9 "manufactured evidence"). A
  thief-only fix would have left every long-lived scholar's trust cratered
  by ordinary eating. The guardrail is therefore revised for the NEXT run:
  non-thief behavior change is expected and intended exactly where the old
  bar misfired (the nick block); byte-identical holds everywhere else
  (DET-A donor scenario: identical pre/post). No new death modes observed.
- Primary metric held as registered; no re-scoring.

## Convergence

Axis: food-economy/trust surface. State: converging — defect fixed and
proof-tested (unit RED->GREEN 10/10, #156 spec 10/10, zero-trust doctrine
green), wild pilot 8/8 PASS (0 caught/10d on all seeds vs ~30 observed
pre-fix; trust builds instead of cratering; no new death modes). The
justice.js cumulative moot-heat bar is the known remaining instance of the
class, documented for a next arm.
