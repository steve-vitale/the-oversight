# Truthful garden surplus decisions

This milestone changes simulation policy and auxiliary observation only. No Game
crop timing, yield, food price, storage capacity, combat or player asset changes.
Muse retains numerical calibration. The rolling public-release goal continues.

## Behavior and proof

The old competent policy incremented donated and reset _lastGiveDay after a
null-returning donation, including refusals. A second decision could donate
unsafe food and bypass pack reserves. Both decisions now use one helper:
known usable food, actual spoilage modifiers, pantry room, a safe-food reserve
and real whole-stack public donation. A removed row AND matching engine gift
credit establish success. Attempts/refusals are separate; unsuccessful calls do
not postpone contribution. The main one-day/opt-in trading reserve remains;
the second decision honors its documented two-day reserve and one-transfer limit.
No inventory rewrite, hidden split, fabricated grant or new Game privilege.

The shared-kit test passes15 checks; the old root fails9 of15. Existing23
garden-controller tests pass. Prepared scenes cover real null-returning success,
refusal, full/partly full stores, a smaller fitting gift behind an oversized row,
one-stack reserve, unsafe/unknown/bonded/zero/shell/rotten food, hall access and
the actual preservation boundary. Initial rotten-food pilots were still fresh
under owned modifiers; later tests explicitly prove fixture freshness/rot and
grant the preservation modifier when needed. Failed pilots remain retained.

## Same-Game measurement

Only competent.js changes in the declared source manifest. The64-case screen
uses16 matched seeds per capable/maker/merchant/caregiver. Its baseline is reused
byte-for-byte from solo-campaign-after-r1 only after source, observer, contract
and real neutrality validation; the candidate and neutral controls are fresh.
The standard comparator still rejects mixed policy revisions. The explicit
harness comparator reports review_required; no Game balance clearance follows.

Wins15→16/6→7/9→9/8→8. Deaths/run rise in capable, maker and caregiver; all23
metrics and every warning remain in balanced-r1. Fourteen independent replays
cover both roots for all seven screen cases with any changed metric, reproducing
Game hash, complete driver row and all23. Those are diagnostics, not holdouts
or a causal account of every downstream difference. More wins do not cancel
the death watches; no subsidy or win-rate restoration is added.

Both long arms contain82 jobs:74 observed campaigns plus eight actual on/off
controls each. Same Game/harness, current tool/configuration/jobs; all controls
preserve Game hash, driver row, all23, RNG and native donation counters. Ten
extended campaigns per arm reach real wins, through day309, without watchdog
recovery. They do not establish natural Gardener or pacifist viability.

The independent direct-donation observer finds:

| Across74 observed campaigns | Before | Candidate |
| --- | ---: | ---: |
| Actual action attempts | 180 | 23 |
| Actual food transfers | 97 | 23 |
| Refusals | 83 | 0 |
| Claimed donations | 180 | 23 |
| Actually transferred nominal kcal | 493,516 | 46,465 |
| Cases with count disagreement | 4 | 0 |

Candidate transferred calories also agree exactly with native receipt counters.
The observer covers direct donateToPantry, not all gifts or pantry production.
Missing historical calorie counters remain null, never invented zeroes.

## Storage tradeoff and next work

Harvesting48/74 and crop eating47/74 remain. Consumed crop food falls
1,719,837→1,715,632 kcal; primary nourishment1,675,601→1,671,820. Nominal output
rises10,530,075→10,755,195, while measured spoilage rises7,058,265→7,485,137.
End stock falls452,737→365,311. Costs and the unallocated residual are retained
separately in review-r1; these quantities do not establish net profit or waste
for the residual. This is not a storage-efficiency improvement claim.

Eight extra natural replays retain full pre-donation pack/pantry snapshots and
raw hash-verified final states for maker4 and caregiver9/10004/10008, both roots.
In baseline caregiver9, eight actual gifts were cleaned squirrel/rabbit meat
still carrying raw-meat disease risk. Candidate gifts in these selected cases
carry no such risk. Large safe crop gifts also disappear; these snapshots do
not prove each disappearance is beneficial or isolate every downstream cause.
Do not attribute the whole reduction to unsafe food or personal reserve.

Decision: share truthful accounting and safe decisions, preserve the balanced
watches and lower transfer/intake findings, then repair the actual player
partial-donation gap. A huge single stack cannot currently donate a fitting
portion while retaining meals. The bot skips it and tries smaller rows rather
than inventing an action. Next milestone adds a real Pack portion flow, phone
controls/cancellation/Continue proof and shared-controller use, before numerical
crop calibration or earned Gardener/upper-tier viability claims.

Repeat retained review with `node evidence/2026-10-21/garden-transfer-review-r1.cjs`.
Plans, frozen-root recipe/manifests, matched panels, auxiliary observations,
all23 per-policy/cap metrics, diagnostics and test logs accompany this note.
Prepublication binds fresh quick/full checks, current maintenance proof/tools,
unchanged phone/runtime inputs and the preserved foreign sweep log.
