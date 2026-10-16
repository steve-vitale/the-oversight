# Paid goods practice, Miser access and measured tradeoffs

2026-10-15. Base 911065b78dcf45eb0123c57ee89257c3b48e8213 on
codex/resume-claude. Codex class/progression lane; no release/SW bump.

## Decision and scope

Retain one capped social XP/day for real paid goods practice. Existing cart
purchases, sales and hawker buys incremented trade-savvy but had no shared
track deed; paid river barter likewise supplied goods without track credit.
The tracks.json trade event now uses n=1/perDay=1, like conversation. Prices,
food costs, goods, threat rules, thresholds, slots, ability kits and class/god
requirements remain unchanged. This is not a fitting ascension deed or a claim
that trading now produces a Miser class.

The commerce module's creditGoodsTrade delegates to creditDeed for the actual
living bearer/resident. Successful cart buy/sale and river-goods completion
credit the original acting person. An actual resident hawker also earns the
same value/cap as their buyer. A failed payment, empty/sold stock, free grant,
nonfinite/nonpositive consideration, unknown/dead person or passive trade route
earns no practice. Repeated buy/sell across channels shares one daily cap.
NPC caps and XP carry into actual succession. No trades are presumed from a
job or daily tick. Visitor personas without a resident progression record are
not invented as NPC learners. Knowledge barter and institutional route income
are separate models and are not claimed complete by this goods change.

Identity matters: a purchase's time cost can pass the mantle. Callers capture
the actor before that cost; a successor does not inherit the predecessor's
purchase credit. Old trade-savvy/history is preserved but is not converted into
retroactive XP because its actor/day/cap history is unavailable.

This is an earned noncombat progression lever, not a maximize-wins adjustment.
More experience can change choices and costs; it is not automatically safer.
The survival-lever register records this decision and the outcomes below.

## Runtime, wiring and phone proof

Shared-harness test-trade-progression: 22/22 current, frozen base 10 pass /
12 fail. Real public cart, sale, hawker and river actions prove payment and
item delivery, caps across channels/days, refusal/free/replay controls, equal
resident seller credit, real save/load and actual mantle cap inheritance.
A test injects actual playerDeath at the purchase's tickAction boundary to
prove the successor receives no credit; payment/delivery and death themselves
remain production calls. This is a prepared boundary test, not a natural death.

The initial fixture used the wrong player track shape (a number rather than
{xp,level}); that was corrected before the retained frozen/current proofs.
The initial quick check's fixed wiring-source list omitted the commerce module.
It now includes betrayal.js; the same deed call-site assertion remains, and the
unified-tracks test passes 84 assertions. No quarantine or assertion relaxation.
The commerce-specific helper lives with commerce, not the generic track engine.

An early handoff test found actor credit following the new bearer. The initial
unfinished measurement/check runs were deliberately stopped, and their candidate
is not published. The corrected source was recollected. Content/config identities
reject its earlier partial cache cases; only final-source cases are retained.

Final quick 164/164; full 936/936; ontology 111 valid.

At 390 x 844, a prepared funded cart starts at social XP17, four 500-kcal food
units, no stone knife. The public Buy action pays the existing 800-kcal price
in two whole food units (1,000 physical kcal, unchanged rounding), delivers the
knife, spends eight ticks, and reaches XP18/Social1 with the ordinary choice
sheet. Screenshot and DOM show XP18, food2 and knife=true. No class or magic
kit was granted by the fixture. Keep what I have closes the sheet normally.
The near-threshold XP and food are prepared controls, not naturally earned
campaign progress. Test tab closed, viewport reset, owned local server stopped.

## Standard 16-screen and 64-confirmation

Same current observer/contract, capable/maker/merchant/caregiver policies,
Columbus origin, 150 driver days, default flags unset, Node v24.13.0. Full
source manifests, policies, seeds and flags remain in the raw panels. The
baseline archive has no inherited enclosing checkout HEAD. Baseline case reuse
is exact-source/config reuse from the preceding sealed-arena candidate.

| Policy (64 each) | Changed states | Wins | Table entries | Player deaths | Community losses | Earned tier-3+ gear runs |
| --- | --- | --- | --- | --- | --- | --- |
| capable | 0 | 55 -> 55 | 57 -> 57 | 90 -> 90 | 8 -> 8 | 64 -> 64 |
| maker | 36 | 21 -> 21 | 22 -> 22 | 59 -> 52 | 19 -> 18 | 64 -> 64 |
| merchant | 32 | 23 -> 25 | 23 -> 25 | 46 -> 42 | 14 -> 14 | 64 -> 64 |
| caregiver | 0 | 23 -> 23 | 25 -> 25 | 45 -> 45 | 18 -> 18 | 64 -> 64 |

The screen lost one maker win (9->8) and one merchant win (4->3); confirmation
changes the aggregate picture. Full 23-metric/per-policy confirmation remains
review_required: merchant wins +0.03125 are a neutral change_watch, exploratory
95% paired interval [-0.03125,0.09375]. It is not a proved benefit. No independent
holdout or full livelihood balance claim. The other confirmation metrics have
no material adverse flag under the current contract, which is not an all-clear
for fun, hidden opportunities or earlier Relay/caregiver/challenge questions.

Both manifests remain stable; zero runtime/observer warnings/errors. All 512
confirmation rows match verified cache result digests. Sixteen seed-7 balanced
on/off control jobs match complete gameplay hashes and standard rows. The
fixed-calendar report retains complete paired subsets, missing dates, metric
unknowns and competing terminal outcomes; no inferred post-Table survival.
Universal good gear in mixed policies does not prove pacifist/crafting-only
viability or that every reward route is sufficiently useful.

## Investigate gains and losses, not just totals

All twelve cases whose win or community-loss status changes have before/after
source-bound replays. There are 52 observed replay rows/hashes in total: sixteen
merchant cases per arm, maker6, six further maker cases, and three further
merchant cases per arm. Two additional seed-7 merchant observer-off runs match
the observed rows/hashes. The summary lists every endpoint transition.

- Maker6 loses a day144 Table win and instead reaches the observation cap.
  Maker11 gains a day130 win. Maker12/13/19 no longer lose their communities;
  maker18 and49 newly lose theirs on days128 and131. This is not cancellation
  of harms by a net-one community improvement.
- Merchant3 loses a day128 Table win and reaches the cap; merchant11/23/37
  gain wins. Merchant6 newly loses the community on day125, while merchant23's
  former community loss becomes a day108 Table win. A terminal Table outcome
  does not establish what that village would do afterward.

Merchant3 retains its Gardener class. Its actor earns eleven trade credits
on days22,29,42,44,49,54,56,60,67,69,74; observed player sheet entries rise
24->27. Baseline reaches the witness Table, candidate has no Table trace.
This locates real progression and a changed trajectory, but does not prove
one chosen ability, XP alone, or a particular resource caused the missed seat.
Extra real progression events and later action/identity/RNG trajectories can
diverge; do not label every seeded endpoint movement a direct price effect.
Full event/gate/offer/Table records are retained rather than inventing a cause.

## Miser access remains open

In the sixteen merchant replays, credited trade goes from zero to31 actual
credits across ten canonical people. Miser offer totals remain sparse and
identical across those arms: player Taste Vision8/Haggle1, NPC Taste Vision2/
Hoarder1; no other Miser offers. Neither Miser subclass is sampled in any of
the 256 confirmation campaigns, for player or NPC. The added practice alone
has not solved class reachability; absence is not proof a human cannot build it.

Current kit positions explain a concrete next experiment: Taste Vision is
Strange4, but Hoarder is Social8, Haggle10, Bribe11, Sweetener15; Hoarder's
Interest is Craft11, Coin Guard16; Squirrel Friend is Field12 and Pact is
Strange15. The initial shared offer window is six unheld entries. A job lean is limited
to that window. Once two same-path magic abilities strictly lead the build,
the emerging-path rule can pull a deeper on-path candidate from the remaining
kit; recognized classes can also request their payoff across tracks. Thus
the bottleneck is not an absolute six-entry ban: inspect access to and choices
among the first two Miser abilities before changing placement. Classes still
require three leading primary magic abilities. The prepared first Social
sheet on the phone offers other paths, as the data says.

Next isolate a small, fitting kit-access change or named intentional-build
cohort, retaining the shared player/NPC sheet and knowledge rules. Do not lower
class/god gates, add fake NPC activity, reorder everything at once, or restore
a target win rate. Eight fitting authored deeds, broad god-scale effects,
remaining job/playstyle work and natural campaign/Network coverage remain open.

Source reconstruction: reference sealed-learning-sources.json.gz's exact after
arm and apply the three named replacement files in trade-progression-sources.
Both manifests, shared kit/observer/test sources and prior wiring test are
retained. Published artifact hashes canonicalize text to LF and use exact
bytes for gzip/PNG. Raw historical results remain under their original source.
