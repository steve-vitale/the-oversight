# Miser intent, access and costs across three source-bound arms

2026-10-15. Controller commit `ff7ca50c12887b61859cc0079aa8bbf8702c2b2b`
on codex/resume-claude, based on1a448653. **Retain the strategy tools; neither
global kit reorder is adopted.** Original runtime/data remain in the game.
No release, merge to master, SW bump or Muse region/nomad edit.

## What changed and what was tested

Generic merchants previously saw more Miser starters but chose none. Two
declared player strategies now inherit the unchanged merchant survival,
public commerce, defensive combat, conversations and Table controller:
merchant-hoarder and merchant-dealer. Only actual shown/held magic definitions
can influence their preference. No ability, XP, slot, knowledge, gear or
class/god gate is granted. The shared/NPC build brain is unchanged.

The optional ctx.offerIntent callback in capable.chooseOffers receives the
generic proposed decision and shown sheet. Miser rank100, preferred subclass
+20, payoff+4 or enabler+2; stable sheet order breaks ties. Free slots prefer
shown Miser magic. Full level-up slots first replace the weakest known
off-path incumbent, preserving the reactor; otherwise only upgrade a lower
preference Miser. Generic replacements that dismantle the earned Miser core
can be declined. Full gifts retain the real swap gate. This commitment can
fill six slots and sacrifice defence; it is not an optimal-human strategy
or a guarantee of the policy's preferred subclass. Actual selected IDs reach
the ordinary counters and passive choice observer.

Ten actual choice/keep/swap/knowledge/ordinary-control assertions pass.
Quick167/167, full939/939 at the published controller revision. A final
documentation check also passes167/167. Later work adds only evidence,
executable reproduction fixtures and documentation; controller/runtime
sources remain identical to that checked revision.

Three arms, with identical current policy/harness/observer/contract per
game comparison, same64 seeds,150-day cap, origin and recorded flags:

| Arm | Kit change | Policies/campaign cases | Disposition |
|---|---|---:|---|
| original | none | four standard + two intent /384 | retained |
| early | Hoarder8/Haggle10 ->5/6 | merchant + two intent /192 | declined |
| haggle | Haggle10 ->6; first five preserved, Hoarder becomes9 | four standard + two intent /384 | declined |

The Haggle-only arm is an adaptive exploratory follow-up to the two-starter
result, not a preregistered holdout. Its preservation of Crowd Favorite5
does not establish harmlessness. Both16-seed screens and64-seed confirmations
are retained, including the original three-policy subset needed to reproduce
the early comparison. Do not compare different policy sets as one game-only
panel or pool correlated same-seed strategies as independent populations.

## All-policy tradeoffs

Haggle-only confirmation (original -> candidate):

| Policy | Wins | Player deaths | Community losses | First bearer through60 | Named-class cases |
|---|---:|---:|---:|---:|---:|
| capable |55 ->54|90 ->84|8 ->7|34 ->33|45 ->38|
| maker |21 ->25|52 ->68|18 ->20|53 ->47|53 ->52|
| caregiver |23 ->29|45 ->44|18 ->19|53 ->54|49 ->47|
| merchant |25 ->24|42 ->44|14 ->20|57 ->57|46 ->42|
| merchant-hoarder |28 ->30|36 ->46|12 ->13|60 ->60|44 ->41|
| merchant-dealer |28 ->30|36 ->43|12 ->13|60 ->60|44 ->40|

All23 per-policy contracts, coverage and exploratory intervals are retained
in haggle-confirmation.json/.md. Notable signals: capable named-class delta
-0.109375 [-0.203125,-0.03125]; maker first60 -0.09375
[-0.171875,-0.03125]; maker deaths per100 calendar days +0.27243
[0.0517,0.5032]. They are investigation signals, not adjusted causal tests.
Other resource, hydration, low-HP, hunger and population measurements remain
visible. More maker/caregiver wins or new Miser codas cannot cancel those
costs. No weighted score or target win percentage.

The two-starter focused preferences instead move28->23 wins, first60
60->52, and community losses12->18 /12->17. The previous broad standard
two-starter report remains in miser-access-audit.md under its original
policy source. The new merchant control independently reproduces its64
rows/full hashes. The new original controls independently reproduce all256
prior standard rows/full hashes:320 verified cross-revision controls in
total, rather than re-keying old cached cases into the new comparison.

Overall player class coverage across the six original/Haggle-only cohorts
is14 observed subclasses in each: Phantom is no longer sampled, Dealer is
newly sampled. This is neither a net count gain nor proof of impossibility.
NPC class coverage remains nine, with no Miser NPC. Every original/Haggle
case earns tier3+ weapon/armor, overwhelmingly through contest/show sources;
craft/trade tier3+ remains unobserved. That does not establish a broken trade
route or trade-only viability. Inspect known stock, affordability and upgrade
selection before changing reward strength.

Fixed windows retain complete paired calendars, missing dates and competing
endings. First2–30 complete pairs:56 capable,53 maker,57 caregiver,59 merchant
and59 per intent cohort. Later windows thin further. Conditional survival
windows do not erase individual losses or turn capped runs into failures.

## Actual Miser outcomes, not just aggregate wins

| Arm / each intent preference | Ever-Miser campaigns | Locked Miser winning frames |
|---|---:|---:|
| original |3/64|0/64|
| early |13 Hoarder-preference /14 Dealer-preference|3/64 each|
| haggle |10/64 each|3/64 each|

Generic policies form none. Original intent Miser seeds4,15,1234 do not win.
Early's winning Miser frames are seeds13,18,47 (Market God, Market God,
Dealer). A fourth ever-Miser winning case28 resolves an ordinary social-track
frame, so it is not counted as a Miser ending. Haggle-only's Miser frames
are seeds5,28,47. They are the same three seeds for both preferences, not six
independent examples or proof of a population win-rate improvement.

The ending frame is locked on entry, and can outlive its bearer:
- Haggle5: the original Hoarder/Market God bearer is last sampled89; a
  successor is current90–91. The locked Market God frame resolves Witness91.
  Post-run current bearer has no class, no reactor,100 HP. This is an earned
  community frame after succession, not survival of the original Miser.
- Haggle28: current Hoarder/Market God, no reactor,100 HP,129,047 nominal
  pantry kcal, lesser Feared ending90. This is a concrete reactor-free case,
  not a statement that its stock is all interest or that combat was absent.
- Haggle47: current Dealer, reactor,74 HP, lesser Relay ending90. Reactor
  presence and the living class are explicit. No claim of reactor-free Dealer
  economics or a fitting Market ascension deed.

Other traced outcomes include surviving-but-incomplete builds. Original4
ends145 with a living Hoarder, reactor,79 HP and31,060 pantry kcal. The actual
lesser-seat check is none because food-thesis deeds are incomplete, despite
enough wave exposure, contests, crises and global standing. Do not confuse
the stricter full-seat deedGateReady result with the actual lesser-seat
eligibility. Riches or a god title alone do not complete the run's content.

The visible Hoarder's Interest day caller uses game.hasAbility for the
player; NPC payoff parity is not proved. Its existing class-age ascension
proxy is also not a fitting authored deed. Neither is repaired or silently
waived by a strategy preference.

## Representative harms and coverage limits

142 rich replay rows match their balanced rows and full hashes, with zero
warnings/truncated choice logs, plus six same-current-observer off controls.
The244 listed win/community/first60 transitions are not all causally replayed.
Additional post-run diagnostic cases are hashed before querying game gate
helpers, so diagnostic initialization cannot affect the comparable result.

Maker6: original first bearer sampled through150, capped community survives;
Haggle-only first bearer ends43, six player deaths in aggregate (five combat,
one dehydration), community lost141. Maker9: original first bearer through86
and surviving community149; candidate initial bearer through59, two player
combat deaths in aggregate, community loss90. No player in either of these
candidate cases ever holds Haggle. The global draft changes other choices
and subsequent identities/luck; these trajectories do not prove that Haggle's
30-kcal cost directly killed their makers. All-policy consequences still
matter when assessing a global draft intervention.

## Real phone inspection and a setup gap

A read-only replay of original merchant-hoarder4 captures the natural day75
class checkpoint. Its complete row/full hash matches the standard case.
No save/syncRun, clock or game telemetry call is made during observation;
save serialization is built into a copy. Its earned slots are Squirrel Friend,
Fusion Reactor, Bird Whisperer, Taste Vision, Hoarder's Interest and Hoarder.
The god field on a class record is its associated god, not proof of day75
ascension. The actual ascension event occurs later in the run.

The public browser import -> native save -> reload -> Continue -> You ->
Abilities/Tracks flow visibly shows the earned Hoarder class and six slots.
The retained390x844 screenshot/DOM label the imported natural checkpoint,
reactor and skipped early UI prompts. No XP, power or gear is granted by
the fixture. The Node setup leaves arrival presentation and three knack
choices unanswered; the replay suppresses only those prompts without
granting a knack. This is not an identical human early-game setup.

The first reimport was refused by stale-save protection. The corrected
fixture reports the actual save result; the successful proof uses a fresh
local origin. No bypass or forced stale overwrite. Closing the first tab
also dropped its viewport override; only the later explicitly reset phone
viewport is accepted as mobile proof. Browser tab/server are closed and
viewport restored. No final screenshot claim relies on earlier inert desktop
clicks or the interrupted presentation.

## Decision and next work

Keep the original global kit. The candidates establish possible Miser
frames under an explicit strategy, but unresolved maker survival, class
coverage and community signals do not support applying the draft change
to every playstyle now. Win declines alone do not decide this; maker wins
actually rise in the smaller candidate while important survival costs grow.

First audit/fix the shared setup's actual public introductory knack choice,
under a separately measured harness revision. Then investigate job/playstyle
starter access, meaningful food-thesis actions for passive/reactor builds,
NPC economic payoff parity and real stock/upgrade opportunities. Do not
force classes, invent trades, lower Table gates or buff rewards to match a
desired percentage. Eight authored deeds, broader god-scale and natural
Finale/Network coverage remain open; the full roadmap goal stays active.

## Reproduce and verify

960 cache rows/result digests verified;30 balanced on/off jobs;142 rich
replays/six off controls; one neutral checkpoint replay; six sealed-before-
diagnostic replays. Three fresh rebuilt roots each reproduce a seed7
merchant-hoarder result and full hash with on/off controls (six fresh jobs).
No independent holdout; all effect estimates are exploratory.

policy-sources references the prior haggle-sources after arm and replaces
only capable.js, sweep-compare.js and the new strategy module, matching
ff7ca50c. early/haggle-sources reference that policy arm and replace only
tracks.json. Source digests/flags/config, raw screens/confirmations, windows,
controls, replays and executable checkpoint/import/reconstruction sources
are retained. Rebuild into a fresh directory (requires local ff7ca50c and tar):

```text
node evidence/2026-10-15/miser-intent-reconstruct.cjs original <fresh-original>
node evidence/2026-10-15/miser-intent-reconstruct.cjs early <fresh-two-starter>
node evidence/2026-10-15/miser-intent-reconstruct.cjs haggle <fresh-haggle-only>
node scripts/balance-panel.js --root <root> --policies capable,maker,caregiver,merchant,merchant-hoarder,merchant-dealer --n 64 --par 6 --out <panel>
node scripts/godpath/deed-screen.js --root <root> --policies merchant-hoarder,merchant-dealer --n 16 --choices 1 --par 3 --out <replay.json>
```

Use the same fixed parent observer across roots; raw observer/contract bytes
must match the reports, while game-source text fingerprints normalize LF.
Reconstruction refuses existing output directories and verifies all207
fingerprinted sources. It changes no active checkout. Sources and artifact
hashes are verified again from committed Git blobs before publication.
