# dialog-ui-fix — evidence (2026-10-11)

Structural fix of conversation UI defects + content quality, verified broken
on live build `803af6e8-20261011-112410` via screenshot audit. Steve's rule:
"Fix all structurally." No symptom patches.

## Defect 1 — DUPLICATE RENDERING
**Root cause:** `Game.sayLine` (src/js/conversation.js) emitted every NPC line
to TWO surfaces: the dialogue transcript (dialogue box) AND `this.say(...)`
→ the 'narration' feed (narration box). Proven with a harness that wrapped
`sayLine` + `emit`: 7/7 NPC lines in one conversation appeared in both.
Same bug class Steve had fixed 2026-10-11 for feedback cards ("ONE TEXT STREAM").
**Fix:** removed the `this.say(...)` echo. NPC speech in a conversation lives
ONLY in the dialogue transcript; the narration surface is for narration.
**Proof:** test D1 — line in transcript, absent from Game.log after sayLine.

## Defect 2 — TALK BUTTON OBSCURED
**Investigation:** exhaustive code inspection. The Talk button markup
(`<button class="btn sm" data-act="talk">`), the narration-box wiring
(`narrBox.querySelectorAll('[data-act]')` → `personAct`), `personAct`'s
`'talk'` branch → `openChat`, and `openChat` itself are all correct. No
`pointer-events: none`, no covering overlay, no z-index trap found in CSS.
The wiring has been correct since 2026-10-05.
**Honest limit:** the covering element could not be identified from code —
hit-testing needs a live browser (not available to subagents). Markup +
wiring proven correct by test D2. **Live 390×844 re-verification must follow
after ship** — if the button is still unclickable, the cause is environmental
or in a render path not visible statically.
**Structural note:** the person card renders inside the fixed 184px
`.ord-narration` scroll region; the Talk button sits at the bottom of a tall
card. Even with working clicks, it's buried — a layout concern for the
person-card pass.

## Defect 3 — GRAMMAR (no space after speaker colon)
**Finding:** the space EXISTS in current code (both render sites):
`<span class="dlg-who">${who}:</span> <span class="sp">`. The audit's
no-space transcription could not be reproduced from source — likely a
rendering artifact or transcription slip.
**Structural fix anyway:** the space was fragile (a literal between two
spans — one markup edit or minifier away from vanishing). Extracted the
pattern into a single label shape used by BOTH render sites (current beat +
history), with the space INSIDE the label span (`<span class="dlg-who">Who: </span>`),
so it's part of the label text and cannot be silently dropped.
**Proof:** test D3 — every `.dlg-who` label carries `: </span>`; no bare-colon form remains.

## Defect 4 — TRUNCATION (talk-cost explainer cut mid-sentence)
**Finding:** the string is COMPLETE in source on both master and the live
build: "(Talking costs a little energy — 10 kcal a conversation. Small talk
is cheap; going deep costs time, not more food.)". The mid-sentence cutoff
was visual (scroll container), not a string defect.
**Fix:** folds into defect 5's pagination — no beat is ever visually cut;
long lines paginate at sentence boundaries, never mid-word.
**Proof:** test D4 (string complete) + D5 (pagination).

## Defect 5 — LAYOUT (dialogue in a ~90px scroll box)
**Root cause:** `.dlg-line` (the current beat) had `max-height: 30vh;
overflow-y: auto` — the NPC line itself was a scroll box, violating the
one-screen no-scroll rule (Steve 2026-10-05, non-negotiable).
**Structural fix:** paginate at the EMISSION choke point, not the render
layer. New `Game.convoSplitBeats(text)`: splits lines >260 chars into
multiple transcript entries at sentence boundaries (word-boundary fallback;
never mid-word). `sayLine` emits each chunk as its own transcript entry;
tap-advance (▼) walks them beat by beat — the existing Pokémon-style
`chatAdvance`/`msgIndex` machinery paginates with zero UI changes. CSS:
`.dlg-line` is now `overflow: hidden` (never scrolls); `.dlg-history`
stays scrollable (explicit user-opened transcript, Steve 2026-10-05).
**Proof:** test D5 — chunks ≤260 chars, rejoin exactly, sayLine emits N
entries and returns the first beat; CSS contract asserts no scroll on the
current beat. Updated `test-dialog-layout-20261011.js` for the new contract
(26/26).

## Defect 6 — NO-REPLY BUG ("How can I help?" → silence)
**Root cause (two layers):**
1. `sayLine`'s no-repeat ledger returns `null` (emits nothing) when the line
   was already spoken. The `dlg:help` handler ignored the return and returned
   `{line: composed}` anyway — the UI then showed the player's own line with
   refreshed options and NO NPC reply. Trigger: re-asking "How can I help?"
   after the favor was stated (the beat pool re-offered `dlg:help` at stage 2+,
   the want menu's dedupe didn't catch it because the want menu offers
   commit/cant there).
2. The no-want fallback was hollow: "Really? ...Thank you. I'll let you know
   what I need." — a promise of a favor that never comes.
**Fix (structural, three parts):**
- Menu: `beatMenuResponses` suppresses beat-pool `dlg:help` once the want is
  engaged (stage 2+) — the want menu owns the engaged offer flow.
- Handler: if the want is already engaged, `dlg:help` answers honestly
  ("Like I said — I could really use the help.") instead of re-stating.
- Handler: the hollow fallback is replaced with honest lines ("Honestly? I'm
  alright right now."); and if `sayLine` ever blocks, the handler names the
  repeat ("I just said — did you miss it?") instead of desyncing into silence.
**Proof:** test D6 — first ask gets a concrete reply; re-ask gets an honest
repeat (never silence); menu at stage 2+ offers no `dlg:help`; hollow string
gone from source.

## Defect 7 — CROSS-NPC VERBATIM REPETITION
**Root cause:** fixed strings bypassed every freshness system. `ask_favor`'s
`engageBeat` fallback was ONE string ("I need an extra pair of hands
tomorrow...") and `closeLine('promised')` was ONE string ("Thank you. Really
— I won't forget this.") — spoken verbatim by every NPC. The `sayLine`
no-repeat ledger is per-conversation, so it couldn't catch cross-NPC repeats.
(The village-freshness system in `convoPick` only helps pool-selected lines.)
**Fix (generator/selection level + choke point):**
- All three fixed strings are now `convoPickCycle` pools (4, 3, and 3
  variants), which route through village freshness.
- New `Game.convoRunLedger()`: a run-wide spoken-line registry on the village
  state. `sayLine` checks it (in addition to per-conversation `saidLines`)
  and blocks verbatim cross-NPC repeats. Backstop by design — the pools +
  freshness should prevent repeats; the ledger catches anything that slips
  through fixed-string paths.
**Proof:** test D7 — forced verbatim repeat across two NPCs is blocked for
the second; pools present; old verbatim strings gone from source.

## Defect 8 — VAGUE WANTS THAT FIZZLE
**Root causes (two):**
1. `ask_favor`'s opener fallbacks were vague ("There's something I've been
   meaning to ask you.", "Could you do something for me? It's not big.
   Probably.") — no concrete, answerable want.
2. `convoThreadBeat` had NO branch for thread `'want'`: on a want-driven
   conversation, "tell me more" found no beats and fizzled to "That's...
   pretty much all of it, honestly." — even though the want def owned real
   content (`convoWantNews`).
**Fix:**
- Openers replaced with four CONCRETE favors (mend the snare line, haul water
  at first light, walk the treeline, remove a splinter). Every opener now
  names something the player can engage, deflect, or commit to.
- `convoThreadBeat` gained a `'want'` branch delegating to the want def's
  `engageBeat` — the thread draws the want's content. If the content was
  already delivered, the ledger blocks the repeat and the honest dry
  admission fires (correct — the news WAS shared).
**Proof:** test D8 — vague opener strings gone from source; sampled openers
all concrete; `convoWantNews` delivers real content; `'want'` branch present.
Sense check: "tell me more" on a share_news want now yields the actual news
instead of the fizzle line.

## Regression runs
- `test-dialog-ui-fix-20261011.js`: 40/40 across seeds 20261011, 1, 42, 777, 999.
- `test-dialog-stream-20261011.js`: 43/43.
- `test-dialog-layout-20261011.js`: 26/26 (updated for no-scroll contract).
- `test-dialog-grammar-20261011.js`: 39/39.
- `test-dialog-coherence-20261011.js`: 37/37.
- `test-dialog-gating-20261011.js`, `test-dialog-leakfix-20261011.js`: ALL GREEN.
- `test-dialog-phase1-20261008.js`: 56/56.
- `test-dialog-phase2-20261008.js`: 34/35 — the 1 failure (`alive:memory routes`)
  is PRE-EXISTING (fails identically on the base without these changes).

## Files changed
- `src/js/conversation.js` — sayLine: removed narration echo (D1), added
  convoSplitBeats pagination (D5), added convoRunLedger cross-NPC check (D7),
  added 'want' branch to convoThreadBeat (D8).
- `src/js/convo-wants.js` — ask_favor: concrete openers (D8), pooled
  engageBeat/closeLine (D7).
- `src/js/convo-dialogue.js` — dlg:help: honest repeat, no hollow fallback,
  blocked-repeat safety (D6).
- `src/js/convo-beats.js` — suppress re-offered dlg:help at stage 2+ (D6).
- `src/js/app.js` — speaker-label space inside the span, both sites (D3).
- `src/css/main.css` — .dlg-line never scrolls (D5).
- `scripts/test-dialog-ui-fix-20261011.js` — new proof test (40 checks).
- `scripts/test-dialog-layout-20261011.js` — updated for no-scroll contract.

## Follow-ups for Steve (phone verification after ship)
1. **Live 390×844 re-verification is REQUIRED** (subagents have no browser):
   Talk button clickability (D2), dialogue pagination feel, no-scroll
   behavior, and general dialogue feel — hence [needs-eyes].
2. The run-wide ledger blocks with silence if it ever triggers in practice;
   the pools should prevent that, but a long run with many favors could
   exhaust the 4-line favor pool — watch for NPCs going quiet on favors.
3. Person card still lives in the 184px narration region — Talk is reachable
   but buried; a person-card layout pass is the natural next step.
