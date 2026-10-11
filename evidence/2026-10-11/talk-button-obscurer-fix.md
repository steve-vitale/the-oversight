# Talk-button obscurer fix — evidence (2026-10-11)

## Steve's directive
"Don't let an element obscure crucial info. That sounds like something to fix."

## Diagnosis (verified live, not inferred)
Browser DOM forensics on the live build (`803af6e8-20261011-112410`,
https://the-oversight.vercel.app/) reproduced the failure 3× across two
villager cards: mouse clicks on the Talk button were refused BEFORE dispatch
(`obscured` — "Another element covers the target"), while keyboard Enter
worked (it bypasses hit-testing).

**Covering element:** `div.ord-controls` — the sticky action-menu header
(dpad + nearby buttons + feedback slot). Live stylesheet rule
(desktop `@media (min-width: 900px)`, `body:has(.game-cols)`):

```css
.ord-controls { position: sticky; top: 0; z-index: 10; background: var(--bg); }
```

**Mechanism:** the villager person card renders inside `.ord-narration`
(fixed 184px region). It was a *following sibling* of the sticky header in
the scrolling side column. Whenever the column scrolled (user scrolling to
management panels, or programmatic scroll-into-view), the card slid UNDER
the opaque pinned header; `elementFromPoint` at the button hit
`.ord-controls`, not the button. The card's Close button was covered too —
the entire card was unclickable, and the region rendered visually empty.
The button's own CSS was clean; nothing was wrong with the button.

## Fix (structural, not a patch)
The card can never again occupy the same visual space as the pinned header,
because the card now lives INSIDE the pinned element:

- `src/js/app.js` (`expeditionScreen`): `.ord-controls` + `.ord-narration`
  wrapped in `<div class="ord-topstack">`. (dpshow button and toast-layer
  stay outside — dpshow is absolutely positioned against the column;
  toast-layer is fixed + pointer-events:none.)
- `src/css/main.css`:
  - Base: `.ord-topstack { display: contents; }` — on narrow screens the
    wrapper vanishes; `.ord-controls`/`ord-narration` keep their own flex
    orders (2/3) in the single-column mobile flow. Mobile layout untouched.
  - Desktop: `body:has(.game-cols) .ord-topstack` becomes the ONE pinned
    stack (`position: sticky; top: 0; z-index: 10;` opaque background,
    `order: -3`). The old sticky on `.ord-controls` itself is removed —
    no nested/duplicate pinning.
- The person card, dialogue box, and contest box all render inside
  `.ord-narration`, i.e. inside the pinned stack. Everything below the
  stack (status, haven panel, compass, minimap) still scrolls under it —
  that is info/management, which the scroll rule explicitly allows to
  scroll. The interaction surface never goes under anything.

## Proof
`scripts/test-talk-button-obscurer-fix-20261011.js` — **23/23 green**,
deterministic (pure string assertions on the shipped template + stylesheet):

- **A. Sensitivity (4):** the OLD configuration (from `git show HEAD:`)
  exhibits the exact bug mechanism — sticky+opaque+z-10 `.ord-controls`
  with `.ord-narration` as a following sibling outside it. The test would
  have caught this bug.
- **B. Fix (8):** `.ord-topstack` opens before `.ord-controls` and closes
  after `.ord-narration`; person cards route into `.ord-narration`;
  the card carries the Talk (`data-act`) and Close (`sheet-x`) buttons;
  desktop CSS pins the stack (sticky/top-0/z-10/opaque) with no residual
  sticky on `.ord-controls`; interaction-first order preserved.
- **C. Mobile 390×844 (4):** no sticky/fixed positioning on
  `.ord-controls`, `.ord-narration`, or `.ord-topstack` in the mobile
  block — no covering element exists at phone width; flex orders intact.
- **D. Audit (4):** `.sheet-head` sticky is inert (head pinned by
  `flex-shrink: 0`, body scrolls internally — the correct pattern);
  toast-layer, night tint, mflash/beamflash are pointer-events:none.
- **E. Template balance (3):** interpolation-stripped literal markup of the
  changed region balances perfectly; both controls and narration nest
  inside the stack at depth 2.

## Audit of other sticky/fixed elements (same bug class)
Reviewed every `position: sticky/fixed/absolute` in main.css:
- `.sheet-head` sticky — inert, correct pattern (see above). No change.
- `#sheet-root` (z-500) is pointer-events:none except on the sheet itself;
  sheets are modal by design. No change.
- `#inlineslot` (mobile, fixed, z-100) — intentional transient panel
  container with its own Close. No change.
- `#toast` (fixed bottom) — transient, auto-fades. Not the sticky-scroll
  bug class. Noted, unchanged.
- `#update-banner`, `.broadcast-live-bug`, `.system-arrival-overlay`,
  `.speech-bubble`, `.party-pop`, `.dpshow`, `.dpmin` — transient, modal,
  or tiny intentional controls. No change.
- Decorative absolute indicators (cell dots, barrier arrows, depleted
  markers) — no covering risk.

Conclusion: the `.ord-controls` sticky was the only instance of the
structural bug class (opaque pinned element + independently-scrolled
interactive content sliding under it).

## Limitations / follow-up
- No live-browser verification from this worker: headless Chromium hangs
  in this VM (known), and subagents cannot drive the live browser.
  **After the ship loop deploys this, verify on the live build:** fresh
  run, open a villager card, mouse-click Talk and Close, confirm the
  conversation starts — at desktop AND true 390×844.
- Person cards remain 184px-tall tenants with internal scroll on all
  viewports (standing dialog-layout decision); the fix guarantees the
  region itself is never covered, not that the whole card fits without
  scrolling.
