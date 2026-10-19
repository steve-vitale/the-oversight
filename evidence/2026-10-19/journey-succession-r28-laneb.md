# Journey-succession r28 (lane B) — "REGRESSION WATCH + THE SILENT THANKS" (2026-10-19)

Leg 7 (succession). Pre-registered per MEASUREMENT.md §§9-12, 14.

## Pre-registration

**Leg question:** does the PROVEN r27 close still hold on the current tip?
r27 (2026-10-19, recovered+landed f1997f58c) proved the full loop end-to-end
(3/3 closes) and fixed the promisee-heir zombie. Since then ~40 commits
landed: dialogue-truth fixes (recap/wounds/press/lapse reframings — the repay
gratitude goes through betrayal:wounds tellings), gossip walk-down
(game.js/conversation.js), arenaAct wiring, crisis defender beats, new
grief-pool lines. This run replays the EXACT r27 profile (same forcing, same
means gate, same trust rule, same horizon) on fresh seeds 8301–8305.

**Interesting-finding criteria:**
(a) closes hold at r27's rate → machinery stable; roll telemetry baseline;
(b) a close breaks at a named link → REAL BUG (regression);
(c) the close holds but gratitude TEXT materially changed → content change documented;
(d) <2 seeds reach attempt → means-reachability finding (never re-scored).

**Seeds:** 8301–8305 (fresh; r27 used 8201–8205; profile otherwise identical).
**Policy:** competent + daily honest convo driver, ORCHESTRATE=1 (documented).
**Horizon:** kill d16–17 via real playerDeath; successor plays to d30–31.
**Binding metrics:**
- M1: ≥3/5 mantles pass cleanly. **M2:** ≥2/5 reach the fulfill attempt.
- **M3:** ≥1 FULL CLOSE on attempted seeds (fulfill → repay gratitude →
  favor 'thanked', promise kept=true, trust increased, no zombies).
- **M4:** ≥2 repay/gratitude transcripts meet the quality bar.
**Kill rule:** mantle fails on ≥2/5 → SUBSTRATE-MISSING.

## What happened

**M1: 5/5 GO** — Kurt→Ursula, Eamon→Esteban, Aidan→Jessica, Ryan→Grace,
Siobhan→Jorge. Lineage entries with cause on all 5; villages alive at end
(8–10 living).

**M2: 3/5 GO** — 8301, 8303, 8305 reached the fulfill attempt. 8302/8304: no
setup-eligible need in the 4d forcing window (same finding (e) as r27).

**M3: 3/4 closes GO — and 1 REAL BUG FOUND (criterion b).**
- 8301: Carl, sick_help → CLOSED (thanked, kept, trust 40→52, 0 zombies).
- 8303: Wei, forage_help → CLOSED (thanked, kept, trust 40→58, 0 zombies).
- 8305: Bessie, sick_help → CLOSED (thanked, kept, trust 74→81, 0 zombies).
- 8303: **Henriette, heal_help → the ledger said 'thanked' but the NPC never
  spoke the gratitude.** favorState='thanked', promiseKept=true, trust 49→64
  (+15 honest, from the keep), 0 zombies — but `thankedInTranscript=false`.
  The repay convo served grief/consolation; "You came through on this wound.
  I won't forget it." never appeared. **The close machinery lied.**

**M4: GO (3/3).** Carl, Wei, Bessie repay transcripts all meet the bar —
gratitude specific, settlement explicit ("Good — that favor, settled. Feels
better said out loud."), "You kept your word. That's rare out here." firing.
One composition wrinkle (below), driver-wandering filler as usual.

## The bug: the silent thanks (REAL BUG, FIXED)

**Root cause** (proven with a reproduction probe, not inferred):
1. The `repay` want's opener computed the gratitude line AND flipped
   `favor.state` fulfilled→'thanked' as a side effect of computing it
   (convo-wants.js) — BEFORE the no-repeat ledger check.
2. The convo machinery (`conversation.js`, seed-opener path) then ran
   `convoWouldBlock(vid, voicedLine)` on the voiced line.
3. Henriette's voiced gratitude was string-identical to Dmitri's and
   Jessica's heal_help gratitudes from earlier (same template, same
   favor.short 'this wound') sitting in the 48-line run window → blocked.
4. The opener fell through to a grief opener ("seed stays planted, side
   effects deferred" — but the side effect had already fired). The favor sat
   at 'thanked', trust moved, promise kept — the NPC never said thanks.
   The planted seed could never re-fire the gratitude (state no longer
   'fulfilled'). A second latent fault: at endConvo the seed was consumed,
   so the thanks was lost forever, not just delayed.

**Fix** (src/js/convo-wants.js, settle-on-speak — follows the seek_taken
`onSurfaced` precedent: "opener() is pure"):
- New module helpers `favorSettleOnSurfaced(vid)` / `favorSettleReplant(vid)`.
- The `repay` opener and `convoFavorFollowup` no longer flip state; they
  record the pending settle on `c.want._favorSettle` and return the line.
- Both the `repay` and `ask_favor` defs get `onSurfaced` → applies the
  pending settle only when the opener's line actually speaks.
- Both defs' `resolve` replants a repay seed when the settle is still
  pending at endConvo (blocked line → thanks next conversation, not silence).
- The want-stage-0 early-return in the resolve dispatcher got the same
  replant (a blocked opener never surfaces, so def.resolve never ran).

**Proof:** scripts/test-settle-on-speak-20261019.js — 13/13 GREEN on fixed
code; RED-verified 9/13 on pre-fix code via patch-revert (the 4 failures are
exactly the bug: silent settle + lost seed). E2E replant cycle verified:
blocked convo → state stays 'fulfilled', seed replanted → next convo speaks
the gratitude → 'thanked', seed consumed.
Post-fix re-run of seed 8303: Henriette's d18 repay correctly leaves the
favor 'fulfilled' (no silent settle); Wei's close still CLOSED CLEANLY.

**Regression:** check.js --quick 96/96 green. check.js --only succession:
5 pass, 1 fail — test-succession-opener-coherence.js fails deterministically
on seed 4242, PRE-EXISTING (documented in r27's recovery: caused by the
2026-10-17 journey-social r19 grief-pool change, untouched by this run).

## Village assessment (plain words)

Five villages, all alive at day 30–31. The mantles passed cleanly everywhere.
Three successors took up dead bearers' debts and the villages marked them:
Carl's fever tended, Wei's pantry run kept, Bessie's sickness fought — each
with the gratitude spoken aloud and trust moved (+12 to +18). On two seeds
the villages were healthy enough that no debt was urgent — clean books, no
forcing. The one sour note was Henriette's: the village watched her wound
get tended and the books say "thanked," but nobody heard her say it. That
was the bug, and it's fixed.

## People check

Full transcripts on every attempt. Best — 8305 Bessie (the commit and the
repay both name Siobhan honestly; "I'm picking up Siobhan's share of the
work. Someone should, and it might as well be me."). The repay scenes keep
their r27 quality: specific gratitude, visible relief, the kept-word memory
firing. Composition wrinkle (documented, not fixed): on 8301 the grateful
close pool appended "I won't forget that." right after the template "I won't
forget it." — reads as emphasis, not parroting, but the stacking is
slightly awkward. Social-loop territory if they want it.

## Blanks filled / documented

1. **FIXED: the silent thanks** (above). src/js/convo-wants.js.
2. **Documented (no change): the Simone zombie** (8305) — an inherited
   'asked' favor whose need died (Simone recovered), stuck 'asked' because
   the moot only fires inside a favor convo and grief outranks the favor
   want. Verified inert: no UI surface reads it, no promise attached, the
   table counts ignore 'asked', a new need overwrites it via convoStoreFavor.
   Same disposition as r27 ("design gap documented"). Per Steve's
   root-cause-first: no new daily-sweep system for an inert gap.

## Metric roll-up

- M1: 5/5 GO. M2: 3/5 GO. M3: 3/4 closes GO + 1 real bug found at the
  named link (gratitude swallowed by the no-repeat ledger) → fixed, proven.
- M4: 3/3 GO.

## Metric review

M3's "failure at any named link → REAL BUG" fired exactly as designed — the
instrument caught a genuine regression-class fault in the close machinery
(the bug predates r27's proof; r27's seeds just never collided in the run
window). No metric revision: the bar stands.

## Findings for Steve (design calls)

1. **The silent thanks is fixed**, but note the shape: any identical line
   spoken for two villagers within ~48 spoken lines blocks the second. The
   gratitude template is per-kind identical ("You came through on this
   wound"). The fix makes the second thanks wait for the next conversation
   rather than vanishing — honest. If you want same-day thanks to always
   land, the gratitude lines need per-NPC variation (voice DNA already
   varies them ~30% of the time; that's why this only bit 1/4 closes).
2. **The Simone zombie** (dead-need 'asked' favor, inert) — still open from
   r27. A daily need-death sweep would close it; I didn't build one (new
   system for an inert gap — your call).
3. r27's open questions stand: (a) urgency-2 favors are open-book-only in
   practice; (b) trust persists across death vs "earn this face" fiction.

## Reachable / fun / winnable

- **Reachable:** the mantle is (5/5). The full close is reachable when an
  acute need exists (3/4 attempts closed; the 4th was the bug, now fixed).
- **Fun:** the repay scenes remain the emotional peak of the leg. The fix
  protects exactly the beat the leg is about — the village HEARING the
  thanks, not just ledgering it.
- **Winnable:** neutral — succession is continuity machinery, and it held.

## Telemetry

telemetry-check vs telemetry-baselines/succession.json (r27-rolled): **quiet**
— 5 files, 5 metrics, no large deviations. Baseline not rolled (no
census-level change; the fix is fiction-beat only).

## Regression

- New proof: test-settle-on-speak-20261019 13/13 (RED-verified 9/13 pre-fix).
- check.js --quick: 96/96 green.
- check.js --only succession: 5 pass, 1 fail — the pre-existing
  test-succession-opener-coherence seed-4242 failure (sibling's r19
  grief-pool change; documented in r27; untouched by this run).

## Landing

- Commit: src/js/convo-wants.js (settle-on-speak fix) + scripts/
  journey-succession-r28-20261019.js + scripts/test-settle-on-speak-
  20261019.js + 5 per-seed tele JSONs in evidence/2026-10-19/.
- rotation-b: 7 → 4 (endgame next). Lock deleted.
- Report: "merged locally, pending ship" — no version tag; the ship job
  reports the tag when it goes live.
