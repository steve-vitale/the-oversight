# Gap closure: seek_taken "pool narrowness" — 2026-10-17

## The blank
Scale r4, Bakhyt 8707 (d100): 8 turns of legacy "be remembered" goal lines,
want=seek_taken, stage 0→3, resolution 'engaged' — with ZERO Taking content
spoken. The want was "live" for the whole conversation and never surfaced,
then took credit for content it never touched.

## Root cause (not a content problem)
Three compounding defects in the existing want machinery:

1. **No stale-opener fallback.** `convoPickCycle` never returns null on
   exhaustion — it resets the key's said-list and re-picks. So a long-lived
   want's opener variants all end up in the no-repeat ledgers
   (`c.saidLines` / run ledger) eventually, and every future opener is
   skipped by the OPENER SKIP check. The goal fallback (#5) then hijacks
   the topic every conversation: the want goes permanently mute.
2. **Thread-incoherent engagement.** The `dlg:more` / `dlg:askwhy` handlers
   in convo-dialogue.js called `convoWantEngage(vid,'engage')`
   unconditionally — "engaging with the thread engages the want behind it"
   — even when the thread was the *goal's*, not the want's. (`dlg:comfort`
   had the same shape for non-comfort wants.)
3. **The 3-day gate was consumed by skipped openers.** `takenWantDay` was
   set inside `opener()`, which runs *before* the ledger-block check — so
   a muted want also burned its never-twice-in-three-days re-draw gate on
   conversations where it never spoke.

New systems: none. All three fixes close leaks in existing machinery.

## The fix
- `src/js/convo-wants.js`: `seek_taken.staleOpener(vid)` — state-aware
  reframe lines (promised vs unpromised: the promise is the live thread);
  `seek_taken.onSurfaced(vid)` — sets `takenWantDay` only when the opener
  actually speaks; `opener()` is now pure. Generic
  `convoWantStaleOpener(vid, want)` backstop for wants without a
  def.staleOpener. Header rules/providers updated.
- `src/js/conversation.js`: the opener chain (#3) tries the stale opener
  when every fresh variant is ledger-blocked (still ledger-checked — a
  blocked stale line falls through honestly); `onSurfaced` fires on the
  fresh path, the stale path, and the fromSeed path.
- `src/js/convo-dialogue.js`: `dlg:more` / `dlg:askwhy` engage only when
  the thread IS the want's (`'want'`/`'small'`); `dlg:comfort` also engages
  for comfort-kind wants (`seek_comfort`), preserving the designed
  comfort flow on grief threads.

## Proof
`scripts/test-wantopener-stale-20261017.js` — RED→GREEN, deterministic
(seed 7, voiceLine stubbed to identity so ledger keys are exact):
- TEST 0 (fixture sanity): unblocked opener fires, thread 'want'.
- TEST 1 (stale reframe): all 3 fresh variants ledger-blocked →
  pre-fix thread 'small' (mute); post-fix thread 'want' with a stale
  reframe naming the actual kin ("About the taken — about Sajal...").
- TEST 2 (thread-coherent engagement): opener chain exhausted, `dlg:more`
  on the goal thread → pre-fix stage 0→2, resolution 'engaged' (the exact
  Bakhyt shape); post-fix stage 0, resolution 'unestablished'.
- Regressions: test-convo-beats (25), convo-cycle-norepeat (40/40),
  deflect-cycle-r6 (13), deflect-cycle (11), engine-day1 (12), convo-gaps,
  convoturn-guard (16), socialite-endconvo-farm (4/4), norepeat-fallback
  (9) — all green.

## Metric review
No pre-registered sweep metric applies (mechanism fix, not a lever run).
The defect class is closed structurally: (a) no want can go ledger-mute
again — exhaustion now reframes; (b) no non-want thread can engage a want;
(c) the re-draw gate is only consumed on surfacing. Residual: wants
*without* a def.staleOpener get the plain generic reframe — defs with real
content should define their own (only seek_taken done this pass).

## Sense note
Stale lines read in-fixture: promised — "You said you'd ask about the
pods. Have you? About Sajal — I need to know if you heard anything.";
unpromised — "I dreamed about the pods again. Sajal's face. Tell me I'm
not the only one who hears the humming." State-aware, kin-named, no
fabricated shared history. [needs-eyes] only if Steve wants to hear the
reframe in a live sitting — it's rare by construction (only after total
opener exhaustion).
