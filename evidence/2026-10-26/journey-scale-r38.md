# journey-scale r38 — THE PILGRIMAGE THAT STARVED THE VILLAGE (2026-10-26, lane A, leg 3)

**Run id:** oversight-playtest-loop-20261026T0742Z. Rotation read 3 → leg 3 SCALE
(days 80–140 + post-national tail); write 3→0 on completion.
**Base:** master@72cf7a672 at run start (journey-deepening r50). No sibling landed
mid-run, so no rebase was needed. Main tree verified clean at start; disk 24%.
**Arm:** r37's named next question, NOT a re-measure of betrayal-accept (r37 measured
it to a deterministic blank three runs running, and its metric review says betrayal
needs a Steve ruling on landing options before it is measured again).
**Driver:** `scripts/journey-scale-r38-20261026.js` (r37 driver, labels/EVIDIR/mode
only, PLUS one read-only daily instrument: `hungerWatch` — policy-time pantry,
opening village hungryDays, pilgrim/returning state, league pool; no engine inputs
change, no policy change, no new convo days). **Analyzer:**
`scripts/analyze-scale-r38-20261026.js` (r37 analyzer + HUNGER section).
**Proof test:** `scripts/test-journey-scale-r38-hunger.js` (20/20 static, RED verified
on the r37 driver; 41/41 with EVIDIR).
**Policy:** `scripts/policies/scalecourt-nogate.js` — UNCHANGED. Standing
scalecourt.js untouched. Zero src/js change: r38 is measurement.
**Pre-register:** `evidence/2026-10-26/journey-scale-r38-prereg.md` (written before
any sim).
**Seeds:** MATCHED to r30–r37: 85001–85004. Horizon DAYCAP=180, death-aware stop.
Pilot seed 85001 ran first and passed the gate (no crash, pilgrimages = 5) before
the other three launched.

## Pre-registered leg question

r37's two scattered seeds both end on "Haven couldn't hold. On the fifth hungry
day, people started walking" while the survivor ran 100 courtPoorDays and never
scattered. The code (game.js endDay) ticks the scatter clock only when pantryKcal
<= 0 at endDay, five straight days, unless the league granary fed that day; any
fed day resets it. r38's question: on each of the five hungry days, what was the
policy doing — was it still walking courtship while the pantry stood empty, and
did the league granary ever hold anything that could have fed the village?

## Verdicts (binding — none re-scored)

- **HUNGER-WINDOW: MEASURED 5/5, and the answer is YES — all five days.**
  85004 scattered on d175. Its window rows are exactly the predicted shape:
  opening hungryDays [0,1,2,3,4] across d171–d175, and on EVERY one of those
  days the policy was mid-pilgrimage to the same village (village_spl_32_76279),
  never returning, never breaking off — and never even arriving: the
  climb studies stay at 2 and pilgrimages at 11 across the whole window,
  and the target sits at opinion 7 at the scatter (below the 10 bar), still
  unlinked. The village died walking to a village it had not reached, for
  an opinion gain it never collected. Policy-time pantry across the window:
  3,200 → 600 → 215 → 0 → 0. The engine's own lines confirm the clock:
  "Day 1 of hunger" through "Day 5 of hunger", then the scattering line.
  The pilgrimage was active even earlier: the village had already survived a
  near-miss at d168–d169 (hungryDays 1,2, pantry 0, same pilgrimage active)
  before a fed day at d170 (pantry 1,548, clock reset to 0) bought it one
  more chance — and then it walked the same trip into the fatal five days.
  The policy does not break off courtship for hunger. That is the blank, in
  plain words: the village starves while walking to make friends.
- **PILGRIM-ON-HUNGRY-DAYS: 5/5.** No bar was pre-registered; this run
  establishes the number for the first time. It is the maximum.
- **POOL-ZERO: 0 on all five window days, and 0 on every hungerWatch row on
  every seed.** The league granary never held anything on any day of any run,
  so no rescue was available and unused — the blank is an empty granary, not
  an ignored one. (85003's covenants did go poolLive, but its pool reads 0
  throughout; poolLive is a status, not food in hand.)
- **SURVIVOR-CONTRAST: the contrast cuts the other way from r37's warning.**
  85003 never got hungry at all (maxHungry 0, pantry 23,173 at d180) and
  reached GLOBAL — national d98, global d99, first court d97, three covenants
  seasoned at trust 100/99/83. 85001 and 85002 never scattered either: both
  died out by arena attrition with food in hand (85001: d157, pantry 2,000,
  maxHungry 0; 85002: d104, pantry 2,775, maxHungry 2). So on this base,
  scattering is not the general scale fate — it is the fate of the village
  that walks a pilgrimage through an empty pantry. Courtship-while-poor
  alone does not scatter a village; courtship-while-EMPTY for five straight
  endDays does, and only that.
- **NO-NUMBER-CHANGE: MISS vs r37's published numbers, EXPLAINED — and the
  instrument itself is proven clean.** r38's 85001 ends d157, not r37's d71.
  That is NOT instrument contamination: the r37 driver run as a control on
  this base gives the byte-identical outcome line (d157, pop 0/0, pantry
  2,000, pilgrimages 5, lead 1/1). The base moved under the run: between
  r37's base (bdabb563d) and this base, the competent policy's cook-staffing
  changed (sim-stafffallback-b, 908ad0f12) — it now tries villagers down
  the skill list until one accepts cook duty, instead of picking only the
  single best preserver who could refuse forever. That is a real change in
  what the player does every day (food preserved → pantry → survival), and
  it is the mechanism behind both the moved numbers and the unblocked
  scale wall below. The old-base parity metric is therefore void for this
  run and is recorded as a miss with its cause, not re-scored: the valid
  parity check is same-base control parity, which holds exactly.
- **BOOK-TITAN (regression watch): GO — 2/2 booked.** 85001 and 85004 each
  had one titanEscalate −5, both booked. r36's fix holds on the new base.
- **BOOK-POOL-WILD: NOT-ENCOUNTERED, fourth run in a row.** Zero covenantTick
  −4 events on any seed. 85003's covenants went poolLive, but no short
  week fired a −4 tick. The pool half remains proven only by proof test.
- **PICK-G: GO.** Max consecutive dlg:more/goon ≤ 1 on every transcript
  (all 7 transcripts: max 1, several 0); post-deflect goon = 0.
- **BETRAY (report-only on this base): NOT-ENCOUNTERED.** Zero betrayal
  accepts on any seed — expected, since the new base's worlds differ from
  r37's (Dorothy's d120 want on 85004 is curious, not the betrayal want).
  r37's blank stands unre-measured, as pre-registered.
- **BONDS/NATIONAL (report-only):** third bond by d110: 85003 REACHED (3
  seasoned covenants); national by d140: 85003 REACHED (d98); global: 85003
  REACHED (d99). Lesser seat: 85002 waiting. Wave 5: 0/4. The scale wall
  above national/table is NOT the wall it was in r37 — on this base, one
  matched seed walks through it. What 85003 has that the others do not is
  three seasoned covenants at high trust plus a fed pantry; the table seat
  itself is still unvoiced (seat none, arc 3) even at global — that is the
  next leg question, not this run's.

## Village assessments (plain words)

- **85001 (died out d157):** the village that lived long and then bled out
  in the arena — 5 pilgrimages, 4 studies, 3 covenants (one seasoned), pantry
  2,000 at the end, never hungry a single day. It did not starve; it ran out
  of people to the monthly arena.
- **85002 (died out d104):** the village that kept almost starving and then
  didn't — hungryDays reached 2 three separate times (d69–70, d76–77, d80–81),
  each time a fed day broke the streak, and it still ended with food in hand
  (pantry 2,775) and no one left. Hunger knocked; the arena answered.
- **85003 (alive 9/9 at d180, GLOBAL):** the village that made it — national
  at d98, global at d99, first court at d97, three covenants seasoned at
  trust 100/99/83, pantry 23,173, never hungry. It waits at global with no
  table seat voiced yet.
- **85004 (scattered d175):** the village that walked itself to death — 11
  pilgrimages, pantry 3,200 → 0 across five days, a pilgrimage to a split
  village it never reached (opinion 7, below the bar, still unlinked) that
  never broke off, league pool 0 throughout. It survived a two-day hunger
  scare at d168–169, ate again at d170, and then walked the same trip
  straight through the five hungry days. Six people alive at the end,
  walking in different directions.

## People check (SENSE-TESTING LAW — all 7 transcripts read in full)

- **85004-d120 Dorothy (curious stage 1): GO, short and warm.** She wants
  something funny, gets a real laugh ("the first real one you've heard in
  days"), borrows an old laugh from before — a villager with a past, not a
  menu. Clean close.
- **85001-d90 Irving (ask_favor stage 1): GO.** A sick villager ("achy and
  wrung out, barely keeping food down") asks for help, the commit lands
  ("I'll come back to help"), clean close. A want, an answer, an ending.
- **85003-d90 Joshua (seek_taken stage 1): GO.** Same taken-kin commit as
  r36/r37 ("Even asking is more than the silence"). Coherent with the world.
- **85001-d120 (curious stage 1): GO, short.** A missed-food exchange, one
  goon, clean close. Nothing broken.
- **85002-d90 (ask_favor stage 1): GO.** Same commit shape as Irving's.
- **85003-d120 Scarlett (seek_taken stage 0): FLAT — documented, not fixed.**
  Her want never engages: the talk drifts into a gossip treadmill ("Giulia
  is back", "Habiba headed out to forage", "Habiba is back") across three
  dlg:more presses, and ends with "We'll pick this up later" — which is the
  talk giving up, not resolving, planting, or owing. PICK-G passes (no two
  mores in a row), but the conversation has no spine: the NPC's taken-kin
  want is named in the header and never spoken about. A real player would
  feel led around the village green, not talked with.
- **85004-d90 Nancy (seek_taken stage 0): MIXED — documented, not fixed.**
  She opens with a real confession ("I can't read, and I'm scared it
  matters now") — and then the talk never touches it again. The driver
  picks field-teaching twice, then teaches three plants in a row (Cattail,
  Black Walnut, Stinging Nettle). The plants are well-written ("And I've
  been walking past it for weeks"), but they bury the confession: a
  villager says she is scared about not reading, and the conversation
  answers with botany. Part driver artifact (the picker reaches for
  ask_field/teach before the want), part system blank (nothing in the talk
  returns to the confession). Worth a Steve look, not a silent worker fix.

## Reachable / fun / winnable (leg 3)

- **Reachable: YES, and further than r37.** A matched seed reaches global
  on this base — the road past national is walkable, not theoretical.
- **Fun: SHARP, with one cruel edge that now has a name.** The scale game
  works when the village eats; when it doesn't, the game lets the player
  walk a pilgrimage through five hungry days without a single break-off,
  warning, or granary draw — the scattering then reads as the game
  forgetting to care, not the world being cruel. Cruelty needs a witness
  line or a choice; here there is neither, just a trip that never stops.
- **Winnable: ARRIVED for one seed, not for the leg.** Global 1/4, table
  seat 0/4, wave 5 0/4. The table approach after global is the next blank.

## Metric review

- No metric re-scored mid-run. NO-NUMBER-CHANGE is reported as a MISS
  against r37's published old-base numbers with the cause documented
  (competent.js cook-staffing fallback, 908ad0f12, between bases) and the
  same-base control parity (r37 driver on this base = r38 pilot, identical
  outcome line) reported as the method check that actually validates the
  instrument. HUNGER-WINDOW was judged exactly as pre-registered: 5/5
  window days measured on the one scattered seed.
- **Revision proposed for r39:** NO-NUMBER-CHANGE must be judged against a
  same-base control run (old driver on the current base), not against a
  previous run's published numbers, whenever any policy or src file in the
  player's path changed between bases. Matched-seed parity across a moved
  base is not a meaningful bar — r38 proves it twice over (numbers moved,
  instrument clean).
- **Revision proposed for r39 (leg question):** the table approach after
  global (85003 sits at global, seat none, arc 3) and the pilgrimage
  break-off rule (should a pilgrimage stop, or the granary draw, when the
  pantry hits 0?) are the two named next arms. The break-off question
  needs a Steve ruling before a fix is measured — it changes what a
  competent player does, which is a design call, not a worker patch.
- **Proof-test correction, recorded:** the first version of the proof
  asserted hungerWatch days strictly increase, then that same-day rows
  carry identical state — both wrong. policy.daily can fire twice on one
  game day (a return walk completes and a new pilgrimage starts inside the
  same game day), so later same-day rows carry later intra-day state. The
  correct invariant, now asserted and green: days non-decreasing, and
  same-day rows share hungryDays (which only changes at endDay). The
  85004 window is unaffected (d171–175 each appear once).
- **Telemetry check:** same-shape check quiet — `telemetry-check.js`
  against scale.json with metrics day, popAlive, pantryKcal: "quiet (4
  files, 3 metrics, no large deviations)". Baseline NOT rolled (panel
  baseline, journey aggregates — same standing note as r37). A
  journey-shaped baseline is still owed by a future run.
- **Test suites:** proof test 41/41 with EVIDIR + 20/20 static; analyzer
  exit 0 on all 4 seeds; node --check green on driver and analyzer.
  check.js --quick: 279 passed, 8 failed in 1526s — and the 8 are EXACTLY
  r37's standing 8 (hide-discovery, measurement-comparison,
  measurement-proof-update, measurement-workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof, parity-20261014). r37's 8 extra
  failures are GONE this run (zero EPERM mentions in the gate log): the
  container write flap was quiet, so this gate is cleaner than r37's, not
  worse. Verdict: NO regressions attributable to this run — it changes
  zero src/js and zero existing scripts, new files only, and the gate
  failures are the pre-existing standing set.
