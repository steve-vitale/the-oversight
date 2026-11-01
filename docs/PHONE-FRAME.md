# Combat turn presentation (2026-10-22 candidate)

The one message area shows the actual actor and net HP/movement changes rather
than only the final log sentence. Compact results show up to two changes;
Details opens that turn's accepted messages in the existing history workspace.
Only this explicitly opened history scrolls. A selected turn stays selected
while other actors continue, and closing it restores the live board. Choosing
another expedition clears that selection. Reader state never enters the save.
The UI retains at most24 recent turn records and500 accepted lines per turn;
an actual overflow is labeled. Native saved Messages remain the saved log,
not a promise to preserve this in-memory reader after reload. Unknown names
stay unknown. Additional world/status messages can reclaim the narration area.

An announcement paints before the action (450ms), then the resolved result
holds700ms before the next participant. Movement buttons are disabled while
another actor owns the turn; the real driver still owns all eligibility and
costs. Player turns keep their movement/action budget. Human balance effects
of clearer information remain unmeasured; this is no numeric survival tune.
Actual prepared solo/party and recorded Deer checks are in
evidence/2026-10-22/combat-turn-audit-r1.md.

Party combat: the main action area has a fixed budget. A bounded ally/hurt/
down summary stays visible; Party/actions opens full names/health and extra
commands inside the board. Individual party rows must not push Wait beneath
the bottom menu. Both phone heights have actual entry/movement/Wait/Strike/
Continue/escape receipts in release-party-phone-*-r5; text remains at least12px.

 One phone screen for play

Large-battle scale iteration(local2026-10-18): Steve: “If we have a fight with
that many people, we need to show it on a denser grid that fits the scale, and
make the monster even bigger.” The initial implementation uses24x24 for a
coalition of10+ real volunteers, with a true10x10 titan footprint. Humans take
one small cell; repeat name labels are hidden on these fields, while individual
accessible actor names and turn narration remain. The bearer keeps its gold
marker and44px dpad/action controls. These sizes are implementation choices,
subject to actual play and Steve's visual review, not a quoted numeric design.
Attack reach, telegraphs, collision and target selection use the actual body.
Normal fights and Table trials keep their ordinary geometry. No zooming or
scrolling between battlefield and actions is introduced.

Steve,2026-10-18: “It needs to be playable on one screen. Nobody wants to
scroll back and forth to move and take actions then up to see.”

The field uses one bounded viewport. Header/time and survival resources stay at
the top; the square board takes the remaining space; one message area and the
movement/action row stay above the bottom menu. Food keeps the largest resource
bar. Movement and primary actions have44px touch targets. Grid cells scale with
available space and the actual rendered row/column count, including titan boards.

## Where information goes

- The message area is the one place for current narration, conversation, action
  feedback and ambient notices. Speech bubbles and floating toast stacks are
  routed there on phones. Recent messages are retained behind Messages.
- A live combat warning stays pinned within that area while the current
  actor/action/result can render beneath it. A warning must not replace every
  subsequent enemy action. Combat turns still use the real asynchronous driver.
- Decorative screen effects stay clipped to the board during phone field play.
  Letterbox bars are hidden there; HUD, current notices and thumb controls remain
  visible. Entry messages use concise counts; actors retain individual names.
- A person card shows in the message area; its actions move beside the pad.
  Conversations and contests put their real choices in that same action row.
  Choices page without scrolling or rerendering/querying the engine. Browsing
  must not change text, available replies, time, calories or RNG.
- Pack, Place, extra Actions, Menu and message history open deliberately in the
  board area. Long management/history lists and text inside the bounded
  message area may scroll internally. Character-count pagination does not
  guarantee a readable fit on every font size or phone.
  They never cover the movement pad, message area or main action row. Moving
  closes tools and returns the visible board.
- Required progression choices/endings retain their explicit game surfaces.
  Ordinary notices must not become new modal dialogs. Preserve unknown names,
  learned warnings, equipment and ability eligibility; this layout grants none.

Primary combat controls retain Strike, Study and Wait. Target selection gives
Cancel and target choices priority, with the remaining targets available from
Targets. Other earned actions remain under Actions. During conversation the
action row contains the real reply buttons and a More choices pager; long
replies receive more space. The buttons keep their original handlers.

The implementation is mountPhoneField/decorateFieldMessage in app.js and the
scoped field-layout CSS. The other mobile/desktop styles also serve onboarding,
tent, history and management views; their old in-flow comments do not define
the current field layout.

## Repeat the actual phone proof

Both390×736 and390×844 are required. Use trusted touch input and hit testing;
no automatic scrolling or desktop clicks for core controls. The repeatable
Playwright function is evidence/2026-10-18/phone-frame-replay-r1.js. It imports
the unedited recorded old expedition and actual interrupted Deer save into a
disposable loopback origin. It never grants gear/health or calls gameplay action
methods. Use its exact saved-run selector; other local fixture saves may coexist.

For layout iteration the loopback phone-layout-preview-server-r1.py deliberately
disables the worker and HTTP cache. This is not installed-update evidence.
Point the browser at that origin, set a target viewport, execute the function,
and retain its full JSON result under a fresh evidence filename. Repeat at the
other size. The function records actual response bodies, trusted touch events,
frame geometry and state at16 stages:

ordinary play; Pack/refusal; menus; movement; person and actual conversation;
stable choice paging and a real reply; resumed Deer; extra combat actions;
zero moves/one action; actual Wait resolution; normal edge escape.

Then refresh the real retained witness:

`node scripts/phone-frame-proof-update.js <736-receipt.json> <844-receipt.json>`

Run quick/full normally. check.js automatically includes
godpath/test-phone-frame-proof.js. It validates all current boot inputs and
the recipe/validator, exact receipt hashes, both viewport budgets, trusted
touch/coarse/no-hover evidence, stable choices and actual Wait/escape.
The old3693px scrolling layout, stale app bytes and resource-consuming paging
are rejection fixtures. Do not hand-edit proof hashes or relax the assertions.
New runtime inputs require new actual browser runs, just as observer changes
require real neutral measurement panels.

Inspect screenshots too. Geometry alone cannot prove readability or cadence.
The original32-stage receipts are phone-frame-replay-736-r5.json and
phone-frame-replay-844-r5.json. Their network capture retains two early
navigation/body-read failures; every required input is subsequently captured
and matched. Those instrumentation failures are not silently discarded.

Latest source-matched receipts are release-placement-frame-{736,844}-r4.json.
Additional entry-{736,844}-r5.json receipts and inspected army-r5 screenshots
prove23 allies render before an action and cinematic bounds equal the board,
with hidden letterbox bars. See release-placement-audit-r1.md for prepared
encounter resolution and the separate balance review. These receipts and the
current scripts/phone-frame-proof.json supersede earlier source witnesses.
The duplicate titan marquee is hidden on phones: its information already lives
in the combat strip. The board must fit inside its wrapper and stay above the
message/control areas, not merely have bounds somewhere within the viewport.

These are Chromium phone-emulation checks, not physical iOS/Android installation,
safe-area, suspension, audio or full content coverage. Follow
PWA-RELEASE-CHECKLIST.md separately for primed-cache upgrade/offline/rollback.


## Haven station and arrival maintenance (2026-10-21)

Haven uses real saved room cells for furnishings. Gardens belong to grounds;
inside and outside use the same canonical boolean after native load. People
and bodies render above the furniture. Tap an empty bunk/exit to walk there
and see real actions in the existing thumb row; a person occupying the cell
retains normal person selection/explicit second-tap movement. A station
selection replaces its prior person card. Fire offers a paid Walk closer
before warmth/cooking when distant. No station menu covers the room.

Two source-bound gates join quick/full automatically:
- `test-haven-phone-proof.js`: prepared native birth choice, rest, hearth,
  exit and Continue at390x736/844; zero indoor garden markers and preserved beds.
- `test-arrival-phone-proof.js`: unedited late save, all seven arrival buttons
  on screen without outer scrolling, no time/resource effects and actual exit.

Replay `evidence/2026-10-21/haven-visual-mobile-r1.cjs <fresh-revision>` and
`exile-scene-mobile-r1.cjs --rev <fresh-revision>` with the documented local
preview server. Retain new receipts, then run respectively
`scripts/haven-phone-proof-update.js <736.json> <844.json>` and
`scripts/arrival-phone-proof-update.js <736.json> <844.json>`. Do not replace
source hashes by hand. Generic16-stage phone-frame proof and installed-update/
cold-offline byte verification remain separate requirements. These are touch
emulations; physical iOS/Android usability and Steve's art review remain open.


### Lodge and management extension (2026-10-21 candidate)

The outdoor lodge uses one composed image over actual intact rectangular
lodge cells. Irregular/altered saved structures use their remaining real cells;
the render does not fill gaps. A normal lodge tap approaches the existing south
door through native pathing and presents explicit entry. Original Dpad movement
and collision remain unchanged. People/bodies stay visible above the structure.

At home, Place is labeled 🏠 Haven. Garden and the already-gated Pantry button
move with their original handlers to its first row; duplicated place identity
and compass content fold under Grounds and surroundings. This is an explicit
management surface; the normal board/message/thumb frame is preserved. Pantry
keeps native inside/System entitlement and exile refusal, with one actual node.

Current Haven maintenance replay is now `lodge-mobile-r1.cjs <fresh-revision>`
(the earlier haven-visual recipe remains historical). Retain both height JSONs
and update with haven-phone-proof-update.js. The gate additionally checks one
six-cell lodge, native doorstep/entry and management/Pantry access. Actual
saved damaged-structure and remote/exiled browser recipes are lodge-fallback-r1
and lodge-access-r1. Generic16-stage/arrival/installed gates stay separate.
