#Party combat: the main action area has a fixed budget. A bounded ally/hurt/
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
