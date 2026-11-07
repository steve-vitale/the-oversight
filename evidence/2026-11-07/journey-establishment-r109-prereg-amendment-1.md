# Journey leg ESTABLISHMENT — r109 pre-registration AMENDMENT 1 (2026-11-07, Lane A)

Written BEFORE the fix and BEFORE the after-panel, AFTER the first
before-panel run (4 seeds, 16 convos, 2 stalls). The first before-panel
run is SUPERSEDED by a re-run with the final driver (below); its stall
count (2) and transcripts stand as the pilot observation that motivated
this amendment.

## What the first before-panel showed
Both stalls are the SAME shape, and it is NOT the Ursula shape the prereg
assumed:
- 1603 Simran (electrician, nonverbal thread — no shared language):
  menu `leave|nv:nod` after all four nonverbal gestures were spent.
- 1604 Juan (Tagalog, nonverbal thread): same menu `leave|nv:nod`
  after speak_back + all gestures spent.
The verbal thin beat (Ursula: subject → deflect → silence → goon → dead
menu) did NOT recur on this panel — the nonverbal thread is where the
menu runs dry. The mechanism is the same one the prereg named (content
exhaustion precedes budget exhaustion — goon turns do not count as
exchanges, so the wind-down never fires while the gestures run out), but
the observed stall menu is `leave|nv:nod`, not the assumed verbal menu.
The fix is therefore designed against the OBSERVED menu: the exhaustion
check must treat an already-picked repeatable choice (nv:nod, silence,
dlg:subject) as non-content, and must handle the nonverbal thread.

## Amendment: stall definition refined
A stall is a held convo whose loop ends with no pick while the
conversation is still open AND NOT winding down. A no-pick AFTER the
goodbye was spoken (windingDown true) is a CLEAN ENDING the driver
declines to click (the driver never picks leave), not a stall: post-fix,
the wind-down menu in the nonverbal thread is itself `[leave, nv:nod]`,
so the driver will still record a no-pick there — annotated
`(no pick — winding down)` — and the analyzer must not count it.
The Q1 bar is unchanged (after-panel stalls = 0 AND before-panel stalls
≥ 1); only the stall definition is refined, before the fix and before
the after-panel.

## Driver change (annotation only, no pick change)
- At a no-pick, the driver records `(no pick — winding down)` when the
  last turn's return has windingDown true, else `(no pick)`.
- This changes NO pick, so the before-panel trajectories are identical
  with or without it. The before-panel is RE-RUN with the final driver
  (TAG=r109-before) and the re-run is the scored baseline; the first run
  stands as the pilot observation above.
- The analyzer counts only plain `(no pick)` / `(choices empty)` as
  stalls and reports wound-down clean endings separately.
