# Maker counter preparation: public access and measured use

The previous preservation census found smokable meat on maker prep counters in
13/16 runs but no policy behavior for it. This pass tests the actual route,
without changing gear rewards, ingredient supply, processing yields or enemy stats.

## Behavior and contracts

The maker's existing `make` routine now calls `preserveCounter`: one eligible
counter batch per day, only inside Haven with a real fire, at least 1,800 kcal,
50 health and at least the final 128 ticks left in the day. It selects fresh,
positive known meat by earliest spoilage, excluding human, alien-monster and
poisoned stock. Cleaned/undercooked meat goes through public `cookFood` first.
Only cooked-through food without unresolved parasites/disease proceeds to public
`preserveFood`; actual yields, learning, fire, time and risk are unchanged.
Personal inventory meals are not moved or sold by this routine. Paid-action
interruptions, death or bearer changes stop the sequence. Public bulk shelving
is skipped if it would also feed a dangerous neighboring finished batch.

The public `putAwayFinished` action bypassed the access guard already used by
Donate and could move a counter's food to Haven from a remote location or exile.
It now uses the existing `havenStoresAccess` contract: hall access or the earned
Full Integration remote ability, with exile still refusing. The specific Pack
binding no longer displays unconditional "Put away" success after a refusal;
actual engine narration describes what happened.

Phone testing also found cooked counter meat had no Smoke action, despite the
engine supporting it and the Pack offering Smoke for the same cooked meat when
carried. The counter now displays the existing action. Its `howFarOptions` quotes
16 ticks, current known/blind per-portion yield, shelf life, fire requirement,
and a warning where smoking leaves undercooking/parasites unresolved. Undercooked
counter meat also offers the existing public re-cook action. This is access and
description, not a processing-math or risk change.

## Proofs

`test-maker-counter-20261015.js`: **17 pass**, shared seeded harness, one Game.
The actual `make` policy entry calls public smoke/shelving with 16 ticks and
leaves personal food intact. It tests once-per-day/time/hunger bounds, unresolved
risk, actual cooking, mixed dangerous stock, physical pantry access, exile and
Full Integration. Independent pre-guard fixtures fail the two remote/exile checks
(11 pass / 2 fail at that stage); no empty-after-first-refusal fixture hides exile.
The three later UI checks fail before their repair (14 pass / 3 fail), then pass:
actual game options for cooked/undercooked meat and the shipped counter renderer.

390×844 actual browser, prepared supplies/knowledge/location stated explicitly:
- Away-camp Pack → Put away finished food: actual refusal "The pantry is in the
  hall. Your hands are not."; all four portions remain, pantry zero, ticks zero,
  and no false success receipt. The first exploratory away fixture was ordinary
  wilderness, whose counter UI is correctly hidden; an explicit camp fixture
  was used to exercise the real counter control instead.
- Hall Pack → Smoke — you → Put away finished food: a novice smokes four cooked
  400-kcal portions to 320 each (80% blind yield), learns preserving, spends 16
  ticks, and shelves **1,280 kcal** through the real button. Counter empty,
  actual success narration visible. See `maker-counter-phone.png`. This is
  prepared UI/access proof, not naturally earned supplies or a won run.

## 64-seed matched natural screen

`gear-usage-audit.js --n 64 --policies maker --days 150 --par 4`, frozen before
and after trees from HEAD `d557de64`, exact unchanged competent.js policy bytes.
The manifests differ only in `src/js/food.js` (physical shelving guard) and
`scripts/policies/livelihood.js` (counter behavior). Node excludes app.js; the
subsequent cooked-counter choice/receipt UI patch is verified separately.
Neither policy hunts deliberately or runs feast fights, but ordinary defence
and unavoidable combat remain. These are livelihoods, not pacifist runs.

| Measure | Before | After |
|---|---:|---:|
| Table wins | 20/64 | 21/64 |
| Table seats | 31/64 | 31/64 |
| Bearer deaths | 51 | 53 |
| Runs using counter preservation | 0 | 4 |
| Selected counter batches cooked / smoked / shelved | 0 / 0 / 0 | 5 / 5 / 4 |
| All public preserve calls | 3 | 7 |
| Runs with sampled raw/rendered fat | 0 | 0 |
| Earned personal noncombat tier-3+ gear runs | 64 | 64 |
| Observer / livelihood errors | 0 / 0 | 0 / 0 |

**60/64 final state hashes match**. Changed seeds 99, 2, 5 and 56 are exactly
the four users of the new counter route. Seed 99 changes loss→win; the others
retain their win/loss. This is not a statistically established balance gain:
one more win occurs alongside two more bearer deaths, with only four exposed
runs. It does establish natural use of a previously ignored route without
conjuring stock, learning or rewards.

Seed 5 smokes one batch but does not shelf it. The routine may correctly stop
for access/interruptions/capacity or unsafe neighboring stock; this screen does
not record the exact stop reason. Trace it before calling the whole delivery
route reliable or adding more reward/supply. Fat and pemmican are still absent
from samples/calls; keep that upstream access issue separate from this counter
coverage improvement. Data: `gear-usage-maker-counter-{before,after}-64.{json,md}`.

Final source (including cooked-counter choices) replays all four changed seeds
99, 2, 5 and 56 through the same standard driver. **All four final state hashes
match their frozen after-screen rows**, including seed 5's zero stored count.
The UI choices therefore do not alter those measured natural trajectories.
Selected-batch counters do not count additional finished neighbors that the
public bulk-shelving action may also store.

Validation: **17 focused assertions**, **126 quick scripts pass** (30 seconds),
and **898 full-suite scripts pass**, zero failures (143 seconds). No tests were
weakened or quarantined. No remote push, release or service-worker version bump.
