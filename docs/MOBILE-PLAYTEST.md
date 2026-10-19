Body pickup follow-up2026-10-19: prepare a disposable edge/overload save with
`node evidence/2026-10-19/release-loot-prepare-r1.cjs <fresh-fixture-path>`.
The retained recipe expects `/evidence/2026-10-19/release-loot-fixture-r1.json`.
Run `release-loot-phone-r1.js` through the runner below at736/844: Search must
be a primary action without tapping a square, Take must work above normal load,
hard-limit refusal must preserve both inventories and say nothing was taken,
adjacent Search and Continue must retain the same body. Inspect the rendered
card, actual current/normal/maximum load, and internal scroll. The12-check
`scripts/godpath/test-loot-carry-release.js` automatically joins quick/full;
it also covers predecessor/successor property with unique gear and water.
Repeated item names alone are not an inheritance test. Production007 lacks
the candidate fixes: record exact source/build identity in every report.

2026-10-19 corpse/terrain/dialogue replay: use the shared
`evidence/2026-10-19/run-release-contact2-browser-r1.cjs` runner against a
disposable loopback origin at736 and844 heights with
`body-carry-phone-replay-r1.js` and `deer-dialogue-mobile-replay-r1.js` in the
same evidence directory. The former plays nearby Search, real item/water take,
hard-limit refusal, Pack cost explanation, paid movement and Continue; the latter
plays a real conversation and checks exact speech-only Piper input, plus prepared
burned ground/Continue. Fixtures state their prepared inputs. Run the unchanged
16-stage `evidence/2026-10-18/phone-frame-replay-r1.js` too; it covers actual
Deer Wait/escape. Record current network inputs before updating the proof manifest.
Full body/deer behavior guards are automatic quick tests under scripts/godpath.
See body-carry-audit-r1.md and SURVIVAL-LEVERS for the2x pickup limit/food tax.

Settings Done regression (2026-10-19): run
`evidence/2026-10-19/release-settings-phone-replay-r1.js` through the existing
`run-release-contact2-browser-r1.cjs` runner at both736/844 heights on a
disposable loopback origin. It covers title Settings before an expedition,
Done/reopen with persisted audio, and in-game pad change/Done/return to board
without time or kcal use. The ordinary field replay alone did not cover title
Settings; mocks must include the absent-expedition boundary. See
`evidence/2026-10-19/release-settings-audit-r1.md`.

# Mobile playtesting before release

Earned gear/cart route (2026-10-19): release-gear-phone-replay-r1.js imports
declared non-god eligibility, then plays the contest/show, wears their real gear,
reads the notebook, pays for bow/ammo crafting, buys an ordinary trader's ware
and equips it. It uses real internal swipes and touch, not Game mutations. Both
heights keep Place open at the cart reading position through purchase. Other
goods and the sold marker remain reachable while payment feedback uses the one
narration region. Check movement still closes tools with the ordinary frame
recipe. Failed reward/craft rolls are expected possibilities, not automatic bugs.

Final gear receipts are release-gear-final-phone-{736,844}-r4.json. Their carried
craft/trade storage comes from real navigation/pagehide; the combat fixture
producer loads those earned saves without granting equipment/ammo/health. Native
Strike proves real ammo use and damage in declared encounters at both sizes.
Repeat with fresh output names using the same loopback server/browser runner as
the ending recipe. For a newly earned receipt, run prepare-release-gear-combat-r1.cjs
RECEIPT craft FRESH_CRAFT_FIXTURE and again with trade FRESH_TRADE_FIXTURE. Set
OVERSIGHT_GEAR_COMBAT_FIXTURES to a JSON object mapping craft/trade to their
/evidence/... fixture paths before running release-gear-combat-replay-r1.js.
Retain the actual seed/outcome; these diagnostic scenes prove functioning
delivery/equipping/use, not natural eligibility frequency or pacifist viability.

Ending/succession journey (2026-10-19): the prepared release-ending fixtures
exercise a real enemy turn after native Wait, actual mantle transfer and two
promised favors. The successor's self-debt must be moot; the other creditor's
need stays asked. A second scene resolves a real Table final. A third overreaches
on the Feared door, closes that door, then plays the weakened Assimilated fallback
to its actual ending. Table failure downgrades the story under TABLE.md law 4;
do not restore the obsolete assertion that two failed doors delete the campaign.

At 390x736 and 390x844 the ending story/lineage scroll inside one reading region;
Begin a new village stays visible and works. Reading must preserve state and
outer document position. The fixtures are prepared, not natural late-game access.
Late-game fixtures must mark the System introduction as already viewed; otherwise
the real arrival cinematic correctly takes priority over the Table. Combat setup
in node can immediately resolve a faster enemy: establish a healthy player turn
before setting the declared one-HP death scene and verify the saved bearer.

Repeat from the repository root using the bundled Playwright runtime:

```powershell
node evidence/2026-10-19/serve-release-phone-r1.cjs 8853
# In another terminal, after setting NODE_PATH to the bundled node_modules:
node evidence/2026-10-19/run-release-contact2-browser-r1.cjs evidence/2026-10-19/release-ending-phone-replay-r1.js http://127.0.0.1:8853 736 evidence/2026-10-19/ending-new-736.json C:/Users/Steve/oversight/.git/ending-new-736
```

Use fresh receipt/scratch names and repeat at 844. The server binds loopback,
serves current source without caching and disables SW; it is not lifecycle proof.
The saved fixture revision is embedded in the recipe; retain its generator,
successful receipts, inspected screenshots and failed fixture attempts together.

Encounter/Continue smoke (2026-10-19): sleep at a tier-2 Haven with a nearby
raider, then verify actual dawn and usable controls. Test awake and unprotected
contacts separately. For peace, retain unsuccessful as well as successful
native attempts and inspect the original actor's spent action. For Finale,
save an outdoor campaign-heart scene with declared crew spoils/armed zones;
Continue must preserve buttons and danger, actual taps must spend the correct
one-use counter, and a second Continue must not re-arm it. Verify rendered
cells as well as the engine grid size: 576 cells for the 24×24 coalition arena.
Do not put an outdoor fixture inside Haven, where field fighters are hidden.
Internal Actions-menu swipes are allowed; verify they preserve time, food and
outer document position. Core movement/actions must remain on one screen.

Current recipes and retained native/recorded-save receipts are release-contact2-*
in dated evidence. If the interactive browser transport is unavailable, the
run-release-contact2-browser-r1.cjs runner repeats the same recipe using host
bundled Playwright (NODE_PATH from load_workspace_dependencies), headless Edge,
an explicit disposable loopback origin, phone height, fresh receipt path and
scratch directory inside the common Git directory. No dependency install or
gameplay helper calls are needed. Close its context/browser after completion;
retain and inspect screenshots. This remains emulation, not physical-device
or installed-lifecycle evidence.

New signature fight state must use the registered camel-case namespaces in
Game.tbSignatureState (or extend that registry with a real save/Continue test).
Keep core fighters/order and asynchronous execution tokens outside its payload.
test-signature-state-persistence automatically exercises the save boundary,
spent-resource replay, old saves and rejection of core-field overrides.

Receipt portability2026-10-19: phone proof checksums declare lf-v1 and ignore
only CRLF/LF conversion by Git. Real content edits, stale served scripts,
untrusted touches and clipped/offscreen controls still fail. Do not edit a
receipt to refresh proof: retain the real browser run and use the updater.

Chat/readability smoke (2026-10-19): verify the actual hosted source before
comparing a local screenshot with Steve's phone. The live7d27851b5 build lacked
mountPhoneField and the bounded grid CSS; this was also a delivery gap.
Use native touches to reach a real conversation, browse replies, swipe long
message text to its final line, open/close history and submit an actual reply.
Reading/paging must preserve full game state and keep the outer page fixed.
Repeat with large text: a26px text stress makes font-dependent overflow
explicit. Keep NPC name in the header once; preserve speaker labels in history
and for the player's own line. Longer choices get a full-height slot; very
long labels can scroll internally. Current candidate native receipts and
refreshed ordinary/Deer frames are release-chat-*.json in dated evidence.

Counter smoke2026-10-19: at Haven's actual fire, prepare separate saved runs
for cooked meat and for a funded pemmican batch. Use the real Pack counter
Smoke/mix controls; verify costs, ingredient consumption, resulting shelf
life/yield and native reload/Continue. Do not install a second fixture into
an active run before unload: its ordinary autosave can replace that fixture.
Use independent fresh browser contexts. Current trusted-touch receipts and
inspected renders at both phone sizes are release-counter-phone-r2.json and
release-counter-frame-{736,844}-r1.json in dated evidence. Prepared stock and
technique knowledge do not establish natural availability. Final installed
and real-device checks still remain.

Fletching smoke (local 2026-10-19): use the actual Bowyer notebook, read it,
attempt a recipe without materials and verify its refusal. Collect real counter
materials through Take to pack, then make and equip a bow and five arrows. Read
the displayed success chance, including modifiers; a learned recipe can still
fail and spend materials. Retry through ordinary actions with real supplies.
Reload/Continue must preserve the paid kit. In a wild encounter, use Fight and
Strike: a shot spends one real round and can wound the foe. With the action
spent, Wait ends the turn; complete the encounter and Continue again. Keep
the board/messages/controls in one viewport at both sizes. The prepared
discovery/supply/encounter witnesses in dated release-fletching-phone/fight
receipts prove use, not organic frequency or physical-device clearance.

Ability wording (Steve,2026-10-19): inspect the real Actions sheet at both phone
heights. State the effect, full price and use limit in plain language. Show an
active bonus and a wound restriction only when relevant. Check the paid result
against actual HP/calorie changes and reload/Continue. Do not expose internal
modifier names or unexplained role badges. Keep damage boosts distinct from
healing. Keep text short enough to read beside the board and controls.
The automatic shared-kit test-ability-wording checks catalog fallback, the real
button renderer, healing and Trophy Room's actual build-dependent multiplier.
Update descriptions and these behavioral checks together when mechanics change;
refresh source-bound frame and measurement proofs through their normal scripts.

Relay smoke(local2026-10-19): an old dead/permanently departed officeholder
must be vacant on Continue; explicitly claim through Place. Temporary travel
must keep the living post. Use Menu/Wait across several parts of the same day,
then a calendar rollover: one actual -1 grounding charge/service credit per
person/day. Reload/Continue must preserve the role and receipt. Another same-day
Wait must not charge or progress again. Repeat390x736/844 with real touch,
keeping board/messages/controls in one viewport. Prepared network/legacy fixture
and passive charge-probe details are in dated release-relay-audit-r1.md; they
do not prove natural regional attainment or substitute for a browser battle death.

Ordinary trade smoke(local2026-10-19): use real finished pack food to buy a
cart tool, once normally and once with held Haggle. Read the visible quote,
food taken, tab, delivered item and capped social practice. With an eligible
resident, answer a real question, explicitly change subject if on a focused
thread, page through “More things to say” and find their business offer.
Accept its spoken quote, then leave through the real conversation choice.
Trade practice and the separate conversation-completion credit must remain
distinct. Native reload/Continue must preserve paid items, food and both saved
caps. Interrupting the chat instead intentionally settles its conversation on
load; inspect trade cap before calling that extra conversation XP a bug.
Repeat river button quote/payment, all three price labels, and the ordinary
16-stage frame/Deer journey. Prepared fixture/recipe paths are recorded in
dated release-commerce-audit-r2.md. This is not natural arrival or T3+ proof.

Food-budget smoke(local2026-10-19): from an ordinary Haven save with scarce
identified food and a nearby hungry resident, give a meal, then test Until full
with insufficient stock. Check physical portions and remaining hunger; reload
and Continue. Host a paid feast from real pantry stock: verify the host reserve
gain, actual pantry draw, guest hunger after elapsed time, the visible completed
report and whole public guest names. No redundant text caption may cover that
reader. Repeat at390x736/844 with trusted touch, then the16-stage frame/Deer
journey. Prepared repeat recipe: dated release-meal-budget-phone-r4.js; keep
fixture installation separate from normal save acquisition. Passive action
boundary observations distinguish eating from later time-driven hunger.

The primary player is using a phone. A narrow viewport with desktop clicks is
layout evidence only. Node simulations run synchronous combat, omit app.js and
cannot certify browser turn timing, touch input, rendering or handoffs.

Current field layout: PHONE-FRAME.md. Core play must not scroll at all. Pack,
Place, extra actions and message history open within the board area; their
explicit management lists may scroll. The earlier center-swipe Pack repair
below is historical failure evidence, superseded by the bounded frame.
Quick/full now require current actual16-stage touch receipts at both phone
heights through test-phone-frame-proof.js, not just synchronous simulations.

Store controls need a separate real route: a bot can call pantry APIs while
the phone reader is hidden. For store changes, run the retained
`release-pantry-flow-phone-r2.js` and `release-cache-refusal-phone-r2.js` in
evidence/2026-10-19 against the exact candidate at both heights. Generate their
labelled fixtures with prepare-release-counter-gift-r1.cjs (normal/capped)
and prepare-release-cache-refusal-r1.cjs, using explicit new output paths.
Verify Put away, native Continue, All/one-more quantity choice, fixed Pack,
gift return, settled Continue, later communal withdrawal, real cache burial/
draw and overweight Dig refusal. Inspect actual food, trust/practice, time,
visibility and one truthful message area. Never substitute input existence or
an engine-only green for reachable controls. Private preview scripts are
historical diagnostics, not the candidate build workflow.

## Browser conditions

Prepared finale replay: evidence/2026-10-18/table-phone-audit-r1.md documents
the real success and failed-trial/downgrade routes at both phone heights.
Use its fixture generator and trusted-touch recipe for rare Table scenes.
Do not substitute forced outcomes for choices or describe these arranged
day100 saves as natural campaign evidence. The Table reader and ending are
explicit reading surfaces; verify all choices are reachable and browsing does
not alter the trial. Core movement/actions continue to require zero scrolling.

Use a fresh isolated origin for the exact candidate. Record commit and file/cache
hashes; an unchanged PWA version can serve older code. Never clear real player
storage. Start at 390×844, then a shorter phone size. Enable mobile device metrics,
touch, coarse pointer and no hover; record them. Use trusted touch-start/end and
real swipes. Check that controls are visible before tapping. Automatic desktop
scroll-to-click must not stand in for discovering and reaching a phone control.
Emulated Chromium does not prove physical iOS/Safari installation, background
suspension, audio or safe-area behavior. Record real-device results separately.

## Combat is a whole journey

1. Keep the normal character's actual gear, food, HP and learned abilities.
   Explicitly labelled rare encounters may be placed for reproduction. Do not
   grant a winning loadout, heal between turns, force results or call player
   action methods from the console. Separate encounter placement from play.
2. Use movement, Strike, Study and Wait through repeated replacement controls.
   Cover zero movement/one action; blocked movement; action before movement;
   and the target picker when several enemies are present.
3. Watch every enemy turn at real speed. Show the actor before acting, a visible
   movement transition, rendered results, then one handoff to the player. Check
   painted frames, not just events. Same-species fighters need distinct tokens.
4. Finish fights: win, escape and deliberate loss/succession. An ended engine
   fight alongside stale "Enemy turn" UI is a failure. Use the successor's
   controls. Record awkward scrolling and unclear warnings rather than hiding it.
5. Leave/reload during an enemy announcement, retaining the committed save before
   normal Continue. The pending enemy acts once, without a repeated round wrap
   or skipped attack; controls return. Also cover player and terminal turns.

Use passive event/paint/input traces with monotonic timestamps, fighter keys,
positions, HP, pending actor, running state, rendered controls and visible actor.
Observers take no actions and consume no RNG. Keep failures, fixture sources,
final traces and inspected screenshots.

## Repeatable checks

Run `node scripts/godpath/test-mobile-combat-cadence.js` and
`node scripts/godpath/test-combat-narration.js`, then quick/full. These bounded
regressions complement the actual browser journey above.

`evidence/2026-10-18/mobile-touch-prepare-r2.js` is a Playwright function for the
isolated loopback fixture. It imports a recorded ordinary save and places a Deer;
`mobile-combat-observer-r3.js` is passive. The preparation emits actual swipe/tap
coordinates and rejects unreachable controls. Adapt the origin to a new isolated
source before reuse and inspect current UI/source. An intermediate pilot is not
final-source proof.

For Game changes follow SIMULATING.md and review all 23 metrics. A synchronous
panel cannot establish the survival effect of browser-only recovery. Preserve
that limitation; unchanged node outcomes do not clear phone playability.

## Scene boundaries and the garden

A normal dpad crossing must replace the location, grid, Haven panel and actions
without a reload. Cover hall/grounds too. An engine position alone is not proof
that the arrival rendered. Live narration must invalidate the walking scene even
when the log ring has reached its cap.

Use real swipes, wait for inertia to stop and verify the hit target before a tap.
A tile panel covering the dpad must be dismissed; tapping through it is not a
movement test. Do not automatically repeat an apparently missed costly action.

`evidence/2026-10-18/garden-phone-replay-r3.js` is a verified prepared regression:
it imports the unedited committed save from ordinary play, returns to Haven,
creates plot2 and sows two of the three actually acquired Cattail units. It runs
against a disposable loopback origin; adapt that origin and inspect current UI
before reuse. The older r1 fixed-forage recipe found no Forage context at its fixed spot
and r2 exposed stale arrival UI. Keep both as failures, not green smoke scripts.
Natural forage/identification/sowing, saved plot persistence and the limits are in
`garden-opening-audit-r1.md` alongside it. Replaying acquired seed does not prove
that every opening has that seed opportunity.

## Pack, succession and installed data

Swipe through the center of narration to discover Pack. A non-scrollable child
must not trap the whole page. Drink once while thirsty, then again while full;
attempt a donation away from the hall, then a valid one inside. Check the actual
message, physical bottle/food and time/pantry changes. Command wrappers returning
true mean a command was handled, not that it succeeded. Pack feedback now uses
the emitted outcome rather than a predetermined success label.

After a deliberate combat death, check the actual successor, use their controls,
save and Continue. A local animal must remain at its original node, with no alias
carried into the successor's Haven hall. The repeatable prepared
succession-phone-replay-r1.js imports the actual interrupted Deer save and uses
touch Waits until death; it never edits health or forces succession.

Follow PWA-RELEASE-CHECKLIST.md for a primed-cache installed update, cold offline
Continue and rollback. Compare actual cached JSON contents as well as scripts,
then confirm the boot requested the same versioned data keys. The failed
installed-update-*-r1 evidence contains22 old JSON files despite a new cache
name. Final repaired phone-emulation receipts are installed-data-*-r3, with
hash verification and explicit saved-run differences retained. Physical device
results remain a separate open gate.
# Fresh release opening (2026-10-19)

Current cell-dispatch regression: `release-cell-dispatch-prepare-r1.cjs` creates
a declared captured-save fixture with pemmican ingredients/knowledge. Run
`release-cell-dispatch-phone-r1.js` via the generic native phone runner at736/844.
Tap an actual empty-body fire square, verify terrain actions, then make food
with exactly20 ticks and real ingredient consumption. This is prepared menu
wiring proof, separate from the natural opening's gathering/planting/drinking.

`evidence/2026-10-19/release-fresh-opening-phone-r1.js` drives a genuinely fresh
New Expedition at seed190019, without an imported save or gameplay grants. Run
it with `run-release-contact2-browser-r1.cjs`, the disposable no-SW UI server,
each height736/844, fresh receipt names and scratch directories inside the
common Git directory. It covers actual character/belongings selection, wake,
initial ability, Haven exit, pasture forage/identification, eating, full-hydration
water refusal, return and reload/Continue. See release-opening-audit-r1.md for
the exact evidence and exclusions. Setup and Pack readers can scroll internally;
field controls must stay inside one viewport. This does not test installed PWA
behavior or substitute for real phones.

The companion `release-fresh-garden-water-phone-r1.js` extends this same fresh
run to26 stages: native plot creation, two actual gathered tubers sown, natural
day2 thirst, clean-water consumption and planted-cell Continue. Its assertions
use observed pre-sow stock and exact water/hydration deltas. Run at both heights
with fresh outputs; see release-fresh-garden-water-audit-r2.md.
