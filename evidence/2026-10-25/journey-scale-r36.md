# journey-scale r36 — BOOK THE MOVES (2026-10-25, lane A, leg 3)

**Run id:** oversight-playtest-loop-20261025T2315Z. Rotation read 3 → leg 3 SCALE
(days 80–140 + post-national tail); write 3→0 on completion.
**Base:** master@43a0786f8 at run start. No sibling landed mid-run, so no
rebase was needed. Main tree verified clean at start.
**Arm:** r35 blank (a) — book the two unbooked trust moves, NO number
changes: (1) `src/js/titans.js` titanEscalate night-strike writes one
`Game._linkNote(link, 'titan', …)` beside the say line; (2)
`src/js/hierarchy.js` covenantTick pool-shortfall writes one
`this._linkNote(ls[i], 'pool', …)` per link charged −4, naming the
shortfall amounts. **Driver:** `scripts/journey-scale-r36-20261025.js`
(r35 driver, labels/EVIDIR/mode only). **Analyzer:**
`scripts/analyze-scale-r36-20261025.js` (r35 analyzer + BOOK join).
**Proof test:** `scripts/test-journey-scale-r36-bookmoves.js` (26/26 on
r36; the 4 static-wiring assertions FAIL on HEAD copies — RED verified).
**Policy:** `scripts/policies/scalecourt-nogate.js` — UNCHANGED. Standing
scalecourt.js untouched.
**Pre-register:** `evidence/2026-10-25/journey-scale-r36-prereg.md` (written
before any sim).
**Seeds:** MATCHED to r30–r35: 85001–85004. Horizon DAYCAP=180,
death-aware stop. Pilot seed 85001 ran first and passed the gate (no
crash, pilgrimages=1, outcome line identical to r35's control) before
the other three launched.

## Pre-registered leg question

r35 proved every trust move routes through a logged setter and named all
112 drops ≤ −4, but two move classes are voiced in the moment and never
booked: titan night-strikes (−5) and league-pool shortfall charges (−4).
A player scrolling back cannot find them. r36's question: does booking
one link-history note per move close the scrollback blank — every titan
−5 and every pool-short −4 carrying a book entry — with zero change to
trust numbers, pantry, or outcomes?

## Verdicts (binding — none re-scored)

- **BOOK-TITAN: GO — 11/11 booked.** 85002: 2/2, 85004: 9/9, 85001/85003:
  0 events (no strikes fired). Every titanEscalate −5 setter event has
  a matching `[titan]` book entry for the same link within the
  night-lag window. Spot-check: 85004's book carries 12 titan entries —
  the 3 extra are strikes on its 0-trust covenant, where trust cannot
  drop further (setter logs nothing) but the note still lands. The book
  is now MORE complete than the setter log.
- **BOOK-POOL: NOT-ENCOUNTERED in the wild (not a pass, not a fail).**
  Zero covenantTick −4 events fired on any seed: 85001 died d71 before
  any pool era, 85002 scattered d86 with zero covenants, 85003 scattered
  d110 with unseasoned covenants (never poolLive), 85004's single
  covenant never went poolLive. The wild run cannot judge a move that
  never fired. The pool half is instead proven behaviorally in the
  proof test: the REAL covenantTick with an empty pantry charges −4
  per link AND books a `came up short` note per link (26/26, including
  the −2/−4 decomposition). The wild verdict stays open for a run whose
  seeds actually reach the pool era.
- **NO-NUMBER-CHANGE: GO on the control comparison, with one explained
  base move.** Patched vs UNPATCHED-HEAD control on 85002 (same driver,
  same base): identical on every outcome field (d86, over, 8/8, pantry
  0, regional, lesser, arc 4, same single link at 35, same 21 setter
  events). The arm moves nothing. BUT 85002 differs from r35's 85002
  (national d164/global d165, 6/6 at d181 → scattered d86, 8/8): the
  control proves that move is a BASE/sibling effect between r35's base
  (2018a499a) and 43a0786f8 (29 landings, incl. the W4-narr brace fix
  and armor-vine arrival change), NOT the arm. 85001/85003/85004 match
  r35's outcome lines exactly (d71 0/0 10,338; d110 scattered 7/7 0;
  d181 5/5 2,240).
- **PICK-G: GO.** Max consecutive dlg:more/goon ≤ 1 on every transcript
  (85004-d120: 1, 85004-d90: 1, 85003-d90: 0); post-deflect goon = 0.
- **BETRAY: ENGAGED, landing still missing (r35 blank (b) re-confirmed).**
  85004-d120 Dorothy betrayal:accept engages, no driver drop — but the
  ending is still the generic close (see People check). Measured, not
  fixed, this run.
- **BONDS/NATIONAL (report-only):** third bond by d110: 0/4 this run
  (85001 had 3 covenants but died d71; 85004 has 1; 85002/85003 scattered
  with 0/2). National by d140: 0/4. Lesser seat: 4/4 waiting (85001's
  seat reads none — it died). Wave 5: 0/4. The scale wall above
  national/table is untouched — and this run's seeds never even reached
  national, a base-effect regression vs r35's 1/4 that belongs in the
  base-move investigation, not this arm's verdict.

## Mechanisms verified in the wild

- **The titan book entries are real engine history, not driver fiction.**
  85004's trustevents file carries `[titan]` entries stamped with the
  strike day and the struck village's name (e.g. "THE NIELSEN struck
  Thornfield in the night — trust −5"). A player opening the link's
  book now finds the strike.
- **85002's scatter is hunger, said aloud.** "Haven couldn't hold. On
  the fifth hungry day, people started walking — in different
  directions. The scattering, again." Pantry 0, 29 pilgrimages/studies
  walked by the policy first — the courtship engine kept walking a
  world with an unknown village (blocker: unknown-village) while the
  pantry emptied.
- **No engine logic reads active-link history for decisions.** The only
  history read in src/js is hierarchy.js:2986 (broken-link 'broken'
  entries, for a rekindle line) plus app.js display. Notes on active
  links cannot steer outcomes — consistent with the control match.

## Village assessments (plain words)

- **85001 (died out d71):** the league that seasoned and then lost its
  speakers — identical to r35. Three covenants at 42, pantry 10,338;
  it ran out of people, not food.
- **85002 (scattered d86):** the hungry courtship. 8/8 alive, pantry 0,
  one primary-sub link at 35, zero covenants, one village never known.
  The policy walked 29 pilgrimages/studies while the village starved —
  courtship without a granary.
- **85003 (scattered d110):** the famine village, again. 7/7 alive,
  pantry 0, two unseasoned covenants (26/28) that bled out with it, one
  village never known. Same shape as r35.
- **85004 (alive 5/5 at d181, regional, lesser seat waiting):** the thin
  village that held on a thread — identical to r35. Pantry 2,240, no
  primary-sub bond left, one covenant at trust 0 kept alive by crisis
  concessions. It waits at the table with nothing solid behind it.

## People check (SENSE-TESTING LAW — 3 transcripts read in full)

- **85004-d120 Dorothy (ask_favor stage 2, betrayal:accept):** ENGAGED,
  LANDING STILL MISSING. The want is real ("I've been mapping the
  roads out. Quietly"), the middle has voice ("I pack light. Always
  have. Makes leaving easier. Makes staying harder, too."), but accept
  lands in the same generic close as r35 ("Alright. One thing at a
  time.") — no date, no condition, no debt, no departure state visible.
  The more/react loop still spins aphorisms without progression (3
  mores, alternating with reacts, cap held). r35 blank (b) stands.
- **85003-d90 Joshua (seek_taken stage 1):** GO. The taken-kin question
  is coherent with the world (Theo gone), the commit lands ("I'll ask
  it. I promise."), the resolution lands ("Even asking is more than
  the silence").
- **85004-d90 Dorothy (curious stage 1):** GO, short. A real regret
  exchange with a specific past ("Columbus, Ohio mornings I spent
  annoyed at small things. I'd pay anything for one annoyed morning
  now") — a villager with a past, not a menu.

## Blanks filled / fixed this run

1. **Titan night-strikes booked (r35 blank (a), titan half):** one
   _linkNote per strike, proven in the wild 11/11 and by the proof
   test's real-titanEscalate drive (note kind, text, day stamp).
2. **Pool-short charges booked (r35 blank (a), pool half):** one
   _linkNote per charged link, proven behaviorally by the proof
   test's real-covenantTick drive (empty pantry → −4 + note per
   link). Wild proof still owed — no pool-short fired this run.
3. **Documented, NOT fixed this run:**
   - (a) **Betrayal:accept needs a landing.** Same generic close on
     the same villager/want as r35. r37 should measure the state
     consequence of accept (does anything change after the talk?),
     then judge the ending.
   - (b) **BOOK-POOL wild proof.** Needs a run whose seeds reach the
     pool era (seasoned covenants + a short pantry week). 85004's
     zombie covenant at trust 0 is the nearest miss — a seed that
     seasons AND starves would fire it.
   - (c) **85002's base-move regression (national → hunger scatter).**
     Proven NOT the arm (unpatched control identical), but the
     sibling landing(s) between 2018a499a and 43a0786f8 that moved
     85002's world deserve a bisect note — the scale leg's national
     rate went 1/4 → 0/4 on matched seeds.
   - (d) **Carried from r35, still open:** "Come see what I found"
     plant-drop; closing-line mismatch after a commit; 0-trust bonds
     still count as bonds (design question for Steve).

## Reachable / fun / winnable (leg 3)

- **Reachable: YES, with the hunger caveat sharpened.** The covenant
  road forms, but this run's seeds show the road starving before it
  seasons: 2/4 scattered on empty pantries while the policy walked
  courtship beats. Reachable is not the same as survivable.
- **Fun: BETTER, precisely by two book entries.** The voiced half was
  already real politics; the scrollback half now keeps titan strikes
  (11/11 in the wild). The pool-short half is booked in code and
  proven in the proof test, awaiting a wild firing.
- **Winnable: NOT ARRIVED on this base.** Lesser seat 4/4 waiting, but
  national 0/4, global 0/4, full seat 0/4, wave 5 0/4 — and the base
  move cost r35's one national. The wall above national/table stands,
  and the approach road got hungrier.

## Metric review

- No metric re-scored mid-run. BOOK-TITAN judged exactly as
  pre-registered (100% of 11 events). BOOK-POOL reported as
  NOT-ENCOUNTERED rather than stretched to a vacuous pass — with 0
  events, "100% booked" would be true but meaningless, and the proof
  test carries the pool half instead. NO-NUMBER-CHANGE judged on the
  patched-vs-control comparison (exact match), with the r35-vs-r36
  base move reported as a base effect, not folded into the arm's
  verdict.
- **Revision proposed for r37:** BOOK-POOL needs a pool-era seed set
  (or a forced-shortfall scenario) before it can pass in the wild;
  pre-register the seed condition (≥1 seasoned covenant + ≥1 short
  pantry week) rather than assuming the matched seeds will fire it.
- **Telemetry check:** quiet (4 files, 4 metrics, no large deviations)
  — no LOUD lines, no baseline roll.
- **Test suites:** proof test 26/26 (r36) + RED on HEAD copies (4
  static assertions fail, as designed); titan-class 32/32; r35
  trustset 24/24; r34 trustdelta 14/14; check.js --quick 279 passed /
  8 failed in 483s — the failing script set is IDENTICAL to r33's
  (hide-discovery, measurement-comparison, measurement-proof-update,
  measurement-workflow, mobile-combat-cadence, occupation-panels,
  phone-frame-proof, parity-20261014), all pre-existing and none
  touching titans/hierarchy trust notes. No regressions.

## Ops

- Worktree journey-scale registered, heartbeated throughout (loop pid
  verified alive + registry heartbeat_at fresh at every phase), to be
  released and removed at the end; branch deleted after merge; main
  tree verified clean. No version bump/push (ship loop owns it).
  Merged locally, pending ship — no version tag, no push. Lock deleted
  at end. Rotation-a 3→0 on completion.
