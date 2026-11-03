# gap-playtest9 — Nov 2 live-playtest defects (arm 9)

Branch `gap-playtest9`, worktree `~/workspace/worktrees/gap-playtest9`.
Owner `gap-round-20261102`. All four legs UI, hence `[needs-eyes]`.
No live browser was available to this builder: engine legs are proven by
node harness scripts; layout legs by source-structure proofs plus a
regression note. A real phone check (390×844) is still owed for legs
(a2), (a3) and (c) — see each leg's "Still needs" line. Do NOT claim a
browser/phone verification from this file.

## Leg (a) — Foraging around Haven: DONE (commit a6c87b51)

Diagnosis (proven before the fix): the Haven world tile carries stock 0 /
maxStock 0 by design, and `canForage(tile)` requires stock > 0. But the
Haven grounds detail grid contains a deliberate teaching garden patch —
cells (6,6):bush, (7,6):plant, (5,7):bush, (6,7):plant, (7,7):bush —
planted "so a new player learns the forage verb HERE". Every Forage press
on that patch returned "Nothing left to take here today" with zero yield
and zero cost (before-fix proof: inventory 3→3, ticks 0→0, kcal
2200→2200). That is the ~10 failed attempts: the patch designed to teach
foraging could never be foraged. A failed press via `doAction` directly
costs no player ticks/kcal (proven); via `cellInteract` the world turns
still run first, so the felt "budget" cost was dead taps plus a moving
world, not ticks/kcal.

Fix:
1. `src/js/game.js`, `doAction` forage branch: a patch-truth gate scans
   the 9×9 detail grid once before the `canForage` refusal. If the patch
   has green, the sweep runs even at stock 0 (`stripGround` already
   no-ops on a zero-cap tile; `detailRegrow` still paces 3-day recovery).
   If the patch has no green, the refusal names the real state: patch
   regrowing → "This patch is picked clean — it comes back in a few
   days. Work another green patch meanwhile."; green elsewhere → "Nothing
   within reach. Walk to the green first."; regrowing elsewhere → "This
   ground is picked clean — it comes back in a few days. Wild ground
   further out may still have green."; Haven with nothing → "Nothing
   grows to take on the Haven grounds right now. Walk out past the door
   to wild ground."
2. `src/js/app.js`, `nearbyActionItems`: the old dedupe collapsed every
   nearby green cell into one "Forage ↖" button (dedupe key was the label
   alone). Forage labels now dedupe by `label + '@' + cx + ',' + cy`, so
   the context bar shows one Forage button per direction with its arrow.
3. `src/js/app.js`, `renderDetail`, plus `src/css/main.css`: the
   entities-overlay step replaced the stood-on cell's glyph entirely with
   the player token, hiding the ground underfoot. The pre-overlay glyph is
   now captured as `_stoodGlyph` and appended as a `<span
   class="stood-glyph">` chip on the player token (36% of cell, min 14px,
   dark backing, `pointer-events: none`, depleted variant dimmed).

Proof: `scripts/test-gap-playtest9-forage.js` (seeds 42 and 7). After the
fix a garden press yields — seed 42: inventory 3→7, ticks 0→17, kcal
2200→2140, `detailRegrow` 5 keys; re-pressing a regrowing patch cell
gives the picked-clean message; a forced truly-depleted patch refuses
with the picked-clean message and costs no ticks/kcal.
Still needs: a real phone check that the per-direction buttons and the
stood-on chip read clearly at 390×844.

## Leg (b) — Journal shows raw markdown: DONE (commit 91a9ecf02)

Diagnosis: the ONLY `**` producers in all of `src/js` were three `say()`
lines in `Game.codexLearnAbility` (`src/js/game.js`, levels 1/2/3), e.g.
the reported "you UNDERSTAND **Diplomatic Incident**" pattern. The
narration box strips HTML and escapes text, so the asterisks printed
literally; no surface ever rendered them bold.

Fix: strip the markup at the source (explicitly allowed by the task)
rather than adding a renderer — this fixes narration, Messages
(textContent), and saved log slices consistently. The fix comment was
reworded to avoid containing a literal `**` so the census stays clean.

Proof: `scripts/test-gap-playtest9-journal.js` (seed 42). Drives
`codexLearnAbility` for a real ability (Triage in the run) through levels
1/2/3 and asserts all three Journal lines spoken, none containing `**`,
and the UNDERSTAND line naming the ability in plain text, plus a source
census walking `src/js` for the literal `**` → 0 hits.
Still needs: nothing phone-specific; the lines are plain text everywhere.

## Leg (c) — Haven panel buttons covered/unclickable after scrolling until reload: BUILT + PROVEN, commit blocked by host write flap (see below)

Diagnosis (code-read, mechanism proven in source, not browser-verified):
on phone, `mountPhoneField` moves `.ord-panel` into the Place workspace
(`.field-workspace`: `grid-area: board`, z-index 7) and moves lower-menu
buttons except `pack`/`character` into the Menu workspace — so "Sleep"
lives in the Menu workspace. `cellPopup` / `showBlockage` write DIRECTLY
into `#inlineslot` without touching `inlineView`, and the old
`mountPhoneField` `choose()` cleared the slot ONLY when `inlineView` was
set. So opening a tool panel while a tile/blockage card was open left
that card painted over the workspace (phone slot: `position: absolute;
inset: 0; z-index: 8` > workspace z 7), covering the Haven panel buttons
— and the board underneath was hidden behind the workspace, so no fresh
tap could replace the card. The card's own ✕ was the only way out, and
for a long card scrolled down, that ✕ (in flow at the card top, not
sticky) scrolled out of reach. Weaker alternatives weighed and set
aside: the desktop sticky side-column stack recovers on scroll-back
(does not explain "until reload"); the `window.scrollTo(0, _savedY)`
scroll-pin is dead code (`_savedY` is never assigned).

Fix:
1. `src/js/app.js`, `mountPhoneField` `choose()`: opening a tool panel
   now ALWAYS clears `#inlineslot` (including its tile-card coordinates),
   not only when `inlineView` is set. Person cards live in narration and
   are untouched; the board re-renders fresh when the panel closes.
2. `src/css/main.css`: `.field-workspace` z-index 7 → 10 with explicit
   `position: relative`, so an open workspace paints above the inline
   slot even if any direct-written card survives. Sheets (z 500) still
   win, as they should for modal offers.
3. `src/css/main.css`: `.field-layout #inlineslot .tp-head` is now
   `position: sticky; top: 0`, mirroring the existing `.inline-head`
   rule, so a long tile card's ✕ never scrolls out of reach.

Proof: `scripts/test-gap-playtest9-ui.js` — all 12 checks pass, including
the numeric stacking assertion (workspace z 10 > slot z 8) and the
absence of the old inlineView-only clear. `node --check` passes for
`src/js/app.js`.
Still needs: a real phone check of the exact reported sequence (tile card
open → open Place/Menu → buttons reachable; long tile card scrolled →
✕ reachable) at 390×844, because app.js/CSS cannot run in the node
harness.

## Leg (d) — Pantry-days math inconsistent: DONE, commit blocked by host write flap (see below)

Diagnosis (code-read, then proven): NEITHER figure was arithmetically
wrong — they measured different burns and the display never said so.
`pantryDays` comes from `pantryDaysEstimate()` = pantry kcal / mean of
`burnHistory` (rolling 7-day NET pantry draw: pantry outflow minus
village inflows, plus the player's pantry meals). The panel's second line
printed gross need (`lastEat`, which includes self-caught food that
never touched the pantry) and called need − give the "shortfall". The
playtest numbers reconcile as different burns: 44.4 Mcal at "about 7
days" implies a net burn of ~6,340/day, while "12 mouths need
22,089/day" is the gross need, not the pantry's burn.

Fix (no number fudged; engine semantics unchanged):
1. `src/js/game.js`: new `pantryNetBurn()` helper returning the measured
   mean draw (null before the first endDay, and when the measured draw
   is zero or less). `pantryDaysEstimate()` now shares this helper, so
   the days figure and the burn figure can never drift apart; its outputs
   are byte-identical to before (proven by the fixtures below). The
   `pantryDaysEstimate() > 4` sensor and `pantryFreshDays()` are
   untouched.
2. `src/js/game.js`, `status()`: new `pantryNetBurn` field (rounded, or
   null when unmeasured).
3. `src/js/app.js`, Haven panel: the days line now reads "about 7 days
   at a net draw of 6,340/day (after what the village brings in)" when a
   measured burn exists (old wording kept pre-history), and the mouths
   line prints the same burn as "pantry net draw 6,340/day (7-day
   average)" instead of the gross-mixed "shortfall". Need and give
   numbers are unchanged; the gross "shortfall" wording survives only as
   the pre-history fallback.

Proof: `scripts/test-gap-playtest9-pantry.js` (seed 42) — all checks
pass: 44,400 kcal with burnHistory [6340×3] → days 7, burn 6340,
7×6340=44380 with remainder 20 < one day of draw; zero/negative history
→ days 999, burn null; empty history → fallback floor(44400/24000)=1,
burn null; [5000,9000,7000,6000] → mean 6750, days 14; panel source
prints the shared burn in both lines. `node --check` passes for
`src/js/game.js` and `src/js/app.js`.
Still needs: a real phone check that the two Haven panel lines read
consistently at 390×844 (display-only change; the numbers are proven).

## Regression re-runs (2026-11-02, after legs (c)+(d))

- `scripts/test-gap-playtest9-forage.js 42` — all checks pass.
- `scripts/test-gap-playtest9-journal.js` — all checks pass.
- `scripts/test-gap-playtest9-ui.js` — all checks pass.
- `scripts/test-gap-playtest9-pantry.js` — all checks pass.
- `node --check` on `src/js/game.js` and `src/js/app.js` — pass.
- jest / `check.js` NOT run (task: the coordinator runs `check.js --quick`
  serialized at merge).

## Commit / flap status at handoff

Committed: leg (a) `a6c87b51`, leg (b) `91a9ecf02` (index-clobber after
both repaired per file after hash verification; tree verified clean
after each).
UNCOMMITTED at handoff (work intact in the worktree, nothing lost):
leg (c) files `src/js/app.js`, `src/css/main.css`,
`scripts/test-gap-playtest9-ui.js`; leg (d) files `src/js/game.js`,
`src/js/app.js`, `scripts/test-gap-playtest9-pantry.js`; plus this
evidence file. NOTE: `src/js/app.js` is shared by legs (c) and (d) — the
coordinator should commit it once per leg in order (c) then (d), or as
one combined commit if the per-leg split is no longer separable; the
leg (c) change and leg (d) change touch different regions of app.js.
Reason: an intermittent host write flap (EPERM class, same family as the
2026-10-23 .git-write flap in repo AGENTS.md) blocked `safe-commit.sh`
three times ("fatal: sha1 file '/tmp/idx-safecommit-*.lock' write error:
Operation not permitted"), blocked a probe branch creation, and blocked
two worktree-heartbeat invocations (PermissionError writing the
registry). No ref was forced, no bare commit was used, no lock file was
left behind (verified: no probe lock remains). Retry `safe-commit.sh`
per leg once the flap passes; if it persists, the coordinator can commit
from this worktree. The worktree registration itself persists — only its
heartbeat freshness lapsed during the flap.
