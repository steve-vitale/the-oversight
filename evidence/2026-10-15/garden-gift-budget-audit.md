# Garden feeding strategy and real gift budgets — 2026-10-15

This advances the fitting-deed and playstyle-viability audit. It adds a named
real-action feeding policy and repairs a phone-proven calorie mismatch. The
Garden seven-day gate remains unfinished; no ascension threshold changed.

## Actual phone failure and correction

Prepared phone play at 390 x 844 uses the real Talk -> Give food -> Until
full controls. A resident at 80 hunger became full after five 50-kcal portions:
250 kcal consumed, 250 nourishment recorded, but 80 hunger removed. The receipt
was honest while the need meter manufactured the rest of the meal.

The live care verb and base fallback now cap relief to actual consumed food,
using the existing receipt convention of 25 kcal per hunger point. Bite/meal
keep their one/three-unit limits and 25/60 relief ceilings. Full gifts draw
whole units until enough energy is given or the pack runs out. Mixed stacks
keep their original order. Trust/bond formulas, handoff time, spoil checks and
harvest ownership are unchanged. An already-fed recipient retains the legacy
one-portion gift, with zero nourishment credit.

Verified through the actual phone controls after loading fresh assets:

| Prepared pack | Hunger | Food consumed | Food left |
|---|---|---:|---:|
| Before fix: 500 kcal | 80 -> 0 | 250 | 250 |
| After fix: 500 kcal | 80 -> 60 | 500 | 0 |
| After fix: 3,000 kcal | 80 -> 0 | 2,000 | 1,000 |

Screenshots and the fixture generator are retained. These are finite prepared
food cases, not natural acquisition proofs. The first reload used old cached
PWA assets; the displayed old description exposed that. The corrected cases
used a fresh loopback origin and the new scarcity warning. No SW/version bump,
cache purge, deployment or change to the release occurred. The temporary phone
viewport was reset, the owned tab closed and both loopback servers stopped.

## A named feeding strategy, not gifted resources

`garden-feeder` layers on caregiver. It creates/sows/tends/harvests normal plots,
uses known or genuinely guided seed options, and gives food to nearby living,
present residents above the same visible hunger threshold as the gift card.
It keeps a conservative dinner buffer. It never grants food, knowledge, kit,
XP, relationships or harvest ownership, and does not reorder inventory to
select a hidden source. Its inherited strategy still faces normal encounters:
it is a mixed playstyle, not a pacifist certificate or a default bot change.

The three lost-win case replays reproduce all saved standard rows and final
state hashes on both roots. After the correction, those runs perform 23, 37
and 15 personal harvests, respectively. The policy is exercising the actual
resource path, not just naming itself a feeder. Its counters are diagnostics,
not game deeds. Three first-gift comparisons:

| Seed | Day | Hungry before | Old food charged | Correct food charged | Carried stock after corrected gift |
|---|---:|---:|---:|---:|---:|
| 7 | 59 | 51 | 260 kcal | 1,300 kcal | 3,705 kcal |
| 34 | 75 | 73 | 360 kcal | 1,890 kcal | 7,290 kcal |
| 37 | 74 | 73 | 260 kcal | 1,880 kcal | 7,650 kcal |

The recipient, date, prior stock and bearer reserve agree at each first gift.
Both versions clear the recipient's hunger there, but only the corrected one
pays the existing receipt's food price. The bearer's reserve does not change
at those handoffs and dinner stock remains. Later trajectories diverge; these
traces do not attribute a whole campaign loss to immediate starvation.

## Balanced campaign evidence

Both roots contain identical new policy/registry files. Only game.js and
carexplore.js differ in their normalized gameplay manifests. The baseline is
an archive of 6c521168 plus that same policy overlay. Ten unique sampled
observer-on/off pairs (five policies on both roots) pass with no warnings;
all 20 full job records and their case/result digests are retained.

The four ordinary policies' 16-seed screens have **64/64 identical standard
rows, final state hashes and all 23 metric vectors**. The feeder's screen
keeps eight wins on each side but flags community/other changes. Expanding
in the same directories to 64 feeder seeds reused 17 jobs per root.

| Feeder, 64 matched seeds | Before | After |
|---|---:|---:|
| Table wins | 31 | 29 |
| Table entry / invitation | 34 | 32 |
| Community losses | 8 | 11 |
| Player deaths | 48 | 51 |
| Earned player tier-3+ weapon/armor via contests/shows | 62 | 62 |

The confirmation report is **review_required**. Win/entry/invitation and
community-loss rates are regression watches; exploratory intervals include
zero. This does not prove the correction worsens balance, and it is not an
improvement/equivalence claim. All metrics, denominators, tails and intervals
are retained; other gains cannot cancel these watch items. The noncombat
reward access is real in this mixed profile, not proof for every playstyle,
accessory quality, natural NPC parity or pacifist campaigns.

The separate 16-seed day-coverage screen still has no 300-kcal-per-resident
whole-village day and no seven qualifying days. After the correction it has
one day at that reference for everyone *except* the producer; that remains
far short of an authored deed. Exact daily meal demand, communal serving
opportunities and runtime day/membership settlement remain next.

## Verification and limits

Thirteen shared-harness real-action assertions pass. Frozen runtime: six pass,
seven fail. They cover crumbs, ordinary meals, scarce/ample full gifts, mixed
stacks, whole-unit waste, split gifts and already-fed people. The old legacy
full-gift test gave only 500 kcal while asserting an 80-hunger cure; its
success fixture now supplies enough actual food, with the new scarcity test
guarding the opposite case. No assertion was loosened or quarantined.
Quick: 156/156. Full: 928/928.

Raw panels, source snapshots, observer controls, coverage panels, lost-win
probes, screenshots and logs have hashes in gift-budget-validation.json.
The archived runner reported its enclosing checkout HEAD; in this experiment
it equals the actual frozen archive base. Full content manifests and the
explicit overlay establish provenance. Archive HEAD reporting is a tooling
follow-up, not a reason to substitute a different game under these results.
The broader gift safety/presence/social-reward audit is not closed by this
calorie correction. Keep these simulation watches and remaining Garden work
visible in the roadmap; do not treat green tests as a release decision.
