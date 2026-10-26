# journey-scale r39 — THE TABLE HAS YOUR NAME NOW (2026-10-26, lane A, leg 3)

**Run id:** oversight-playtest-loop-20261026T1114Z. Rotation read 3 → leg 3 SCALE
(days 80–140 + post-national tail); write 3→0 on completion.
**Base:** master@1204c06f5 at run start (journey-deepening r51). No sibling landed
mid-run, so no rebase was needed. Main tree verified clean at start; disk 26%.
**Arm:** r38's named next question, NOT a re-measure of the hunger window
(r38 measured it to 5/5) and NOT the pilgrimage break-off rule (needs a Steve
ruling before a fix is measured).
**Driver:** `scripts/journey-scale-r39-20261026.js` (r38 driver, labels/EVIDIR/
mode only, PLUS one read-only daily instrument: `tableWatch` — tableSeat()
seat + detail, arc, tableWaiting, tableAnnounced, tableDone, scaleRank,
globalLive, overtimeTier; no engine inputs change, no policy change, no new
convo days). **Analyzer:** `scripts/analyze-scale-r39-20261026.js` (r38
analyzer + TABLE section). **Proof test:**
`scripts/test-journey-scale-r39-table.js` (23/23 static, RED verified on the
r38 driver; 48/48 with full EVIDIR).
**Policy:** `scripts/policies/scalecourt-nogate.js` — UNCHANGED. Standing
scalecourt.js untouched. Zero src/js change: r39 is measurement.
**Pre-register:** `evidence/2026-10-26/journey-scale-r39-prereg.md` (written
before any sim; one pilot correction appended before the full run — see
metric review).
**Seeds:** MATCHED to r30–r38: 85001–85004. Horizon DAYCAP=180, death-aware stop.
Pilot seed 85001 ran first and passed the gate (no crash, pilgrimages = 4)
before the other three launched. Control first: the r38 driver with ONLY its
output dir changed (scratch dir `journey-scale-r39-control`, never r38's own
dir) ran seed 85001 on this base.

## Pre-registered leg question

r38's 85003 reached GLOBAL at d99 and sat at d180 with seat none, arc 3, no
table seat voiced. TABLE.md says the table PRICES the run and the lesser seat
is the reachable bar for competent non-god play. r39's question: on a matched
seed that reaches global, which lesser-seat bars fail, does arc ever reach 4,
does tableWaiting/tableAnnounced ever set, and does the game ever voice the
table approach — or does the village sit at global in silence?

## Verdicts (binding — none re-scored)

- **TABLE-DAILY: MEASURED 4/4.** tableWatch rows 180/141/120/180, every row
  complete, days non-decreasing, maxDay = census day − 1 on every seed (see
  pilot correction in metric review). No unmeasured day.
- **SEAT-AT-GLOBAL: MEASURED, and the answer is one bar away — twice.**
  85001 at global d98: seat none, missing ONLY wave-3 deeds (w3 0/3; w1 17,
  w2 8, contests 12, crises 3, rank global, stage 3, foodDeeds true). By d123
  it holds a lesser seat (w3 3, then 6 by d180). 85003 at global d98: ALREADY
  lesser, every bar clear (w1 15, w2 11, w3 4, contests 6, crises 2, rank
  global, stage 3, foodDeeds true). The villages that reach global either
  already hold the seat or are one wave-3 deed short of it.
- **ARC4: 3/4.** 85001 d124, 85002 d86, 85003 d86; 85004 never (max arc 3).
  Progression.js sets tableWaiting only at arc ≥ 4 with a seat, and the
  data obeys it exactly: every arc-4 day with a seat is a waiting day.
- **TABLE-WAITING: 3/4.** 85001 wait + announced d124; 85002 wait d86,
  announced d90; 85003 wait d86, announced d90; 85004 never. Overtime (the
  waiting cost) runs exactly where the table waits: 85001 tier 6 (the cap),
  85002 tier 6, 85003 tier 4, 85004 tier 0. No seed ever sits (tableDone
  false everywhere) — the policy courts but never takes the seat, so all
  three waiting villages end the run in a held breath with the seat open
  and the overtime clock maxed. The finale itself is lane B's leg, not
  this one's — but the approach ends unplayed, and that is the run's
  central image, not a footnote.
- **TABLE-VOICED: the table SPEAKS, and it names the missing bar aloud.**
  True table lines per seed (see filter note in metric review): 85001: 4,
  85002: 2, 85003: 4, 85004: 1. The withdrawal lines are the game at its
  best: 85001 hears "The ledger still wants: wave-3 monsters faced. The
  climb is not over" — exactly the bar tableWatch measures. 85003 hears
  "Species agency: unlocked. You are not at the table yet. But the table
  has your name now." 85001's lesser-seat line: "The table is being set —
  a lesser seat, priced for what you built. They are watching to see who
  comes to it." Villagers gossip it too ("The table's set. The ring of
  pale light — it's just sitting there. Waiting on them."). r38's silent
  global is gone on this base: the approach is voiced at every stage.
- **TABLE-PARITY (method): GO — byte-identical.** r39 pilot 85001 outcome
  line == r38-driver control outcome line on this base (day 181, over
  false, pop 3/3, pantry 3,461, lead 1/0, rank global, natV/globV true,
  proposed 1, tended 0, defense 6, seat lesser, arc 4, tW true). The daily
  tableWatch instrument contaminates nothing. Matched-seed numbers vs
  r38's published numbers moved a lot (r38's 85001 died d157 seatless;
  this base's 85001 lives to d181 with a lesser seat) — that is the base
  moving (r51 + intervening landings), not the instrument, exactly as
  r38's metric review predicted. Parity is judged vs the same-base
  control, and it holds exactly.
- **BOOK-TITAN (regression watch): GO — 22/22 booked.** 85001: 10/10,
  85002: 6/6, 85003: 5/5, 85004: 1/1. r36's fix holds on the new base.
- **BOOK-POOL: ENCOUNTERED — first time in five runs, and booked 100%.**
  r38 reported a fourth straight NOT-ENCOUNTERED run. r39: 85001 has 3
  covenantTick −4 events, all booked to pool notes; 85003 has 3, all
  booked. The pool half of the book is now proven by live events, not
  just the proof test.
- **PICK-G: GO.** Max consecutive dlg:more/goon ≤ 1 on all 8 transcripts;
  post-deflect goon = 0.
- **BONDS/NATIONAL (report-only):** third bond by d110: 85001 REACHED (3
  seasoned covenants); national by d140: 85001 d88, 85003 d89; global:
  85001 d98, 85003 d98; lesser seat: 3/4; full seat: 0/4; wave 5: 0/4.
  The full seat stays aspirational (w5 0 on every seed; best w4 is 3).
- **RANK-ON-DEATH (observed pattern, not a mechanism claim):** 85002 and
  85003 read rank global on their last played day but regional on the
  death census day — the standing falls when the village empties. The
  census rank and the tableWatch rank therefore disagree on death days
  only; both are reported as read.

## Village assessments (plain words)

- **85001 (alive 3/3 at d181, GLOBAL):** the village that made it to the
  table's door — national d88, global d98, three covenants seasoned at
  high trust, pantry 3,461, lesser seat from d123, arc 4 and announced
  d124, overtime tier 6 by d180. It waits at the table with the seat open
  and nobody sitting. The run ends mid-breath: the invitation is on the
  table, the clock is maxed, and no one takes the chair.
- **85002 (died out d142):** the village that courted itself to death —
  54 pilgrimages, lesser seat from d85 at regional (never national), arc 4
  d86, announced d90, overtime tier 6 — and then the arena took everyone,
  one by one, across d139–d142. It held a lesser seat for 57 days and
  never used it.
- **85003 (died out d121):** the village that reached global and still
  died — national d89, global d98, lesser seat already in hand at global,
  arc 4 d86, announced d90, overtime tier 4. The table waited; the
  village ran out of people first (arena deaths d119–d121). The seat
  outlived the village.
- **85004 (alive 7/7 at d181, regional):** the village that never left
  home — 8 villages known, 3 covenants but none seasoned, pantry 42,535,
  seat none the whole run, arc never past 3. Its final detail clears
  every lesser bar EXCEPT one: foodDeeds false. And the withdrawal line
  says why, in the game's own voice: "NO HUNGER ON THE RECORD — THE
  PELLET HUMS WHERE THE FIRE SHOULD BE. NO FEAST, NO SURGE, NOTHING HERE
  WE CAN PRICE." The fusion-reactor pellet ended hunger — and with it,
  the village's ability to prove the food thesis (sentiment taught +
  feast surge used). Rich, fed, and locked out of the table by its own
  full belly. That tension — the pellet path vs the table path — is a
  design question for Steve, not a bug claim: a village that no longer
  needs food cannot show the galaxy why food matters.

## People check (SENSE-TESTING LAW — all 8 transcripts read in full)

- **85001-d90 Irving (curious stage 1): GO, short.** Shared fear about
  noises past the treeline, an honest answer ("I heard them too"), clean
  close. A villager with nerves, not a menu.
- **85001-d120 Irving (curious stage 1): GO, short.** Misses soup, "with
  a spoon" — a baker dreaming of a real meal. Warm and small.
- **85002-d90 Keisha (ask_favor stage 1): GO.** Hungry, hands shaking,
  asks for food; the commit lands ("I won't forget who fed me when it
  mattered"). A want, an answer, an ending.
- **85002-d120 Kaushik (no shared language): MIXED — documented, not
  fixed.** The no-shared-words talk works as far as it goes (glossed
  words accumulate, "Food?" emerges, graceful close) — but it is a nod
  treadmill: six nv:nod presses in a row, each met with a repeated Hindi
  line. Part driver artifact (the picker reaches for nod every turn),
  part system flatness (no new shared words are ever learned, so the
  conversation cannot escalate). A real player would vary the gesture;
  the system never rewards them for it.
- **85003-d90 Joshua (seek_taken stage 1): GO.** The taken-kin commit
  ("Even asking is more than the silence"), same as r36–r38. Coherent
  with the world.
- **85003-d120 Eduardo (seek_taken stage 0): FLAT — documented, not
  fixed.** The pattern from r38's Scarlett repeats: the want is named in
  the header and never spoken about. The talk drifts into a gossip
  treadmill (forage, water, one reputation line) and ends with "need
  some air" — the talk giving up, not resolving, planting, or owing.
  Two runs running, stage-0 seek_taken talks don't engage the want.
- **85004-d90 Dorothy (curious stage 1): GO, short.** An honest plan
  exchange ("One day at a time" / "I can work with honest"). Clean.
- **85004-d120 Dorothy (ask_favor stage 2): FLAT — documented, not
  fixed.** Her want is at stage 2 — the most pressing — and it never
  surfaces: "Today's just heavy" → comfort → snares gossip ×3 → "Sorry.
  I need a minute." The talk ends unresolved with a villager who came in
  heavy and leaves unheard. The picker shares blame (it reaches for
  gossip), but the want's absence from the talk itself is the system's.

## Reachable / fun / winnable (leg 3)

- **Reachable: YES, further than r38.** Lesser seat 3/4, global 2/4, arc 4
  3/4. The road past national is walkable, the seat is earnable, and the
  game now voices every stage of the approach.
- **Fun: SHARP, with a held breath at the end.** The approach sings —
  withdrawal lines that name the exact missing deed, villagers gossiping
  about the waiting ring of light. The cruel edge is the open seat nobody
  sits: three villages wait with overtime maxed while the run ends. A
  player would sit; this policy doesn't, so the finale stays unplayed.
- **Winnable: APPROACH-ARRIVED, finale unplayed.** Lesser seat + arc 4 +
  announced on 3/4 seeds; full seat 0/4; the win itself (sitting and
  playing a path) belongs to lane B's endgame leg. For lane A the leg
  question is answered: the table comes, it prices honestly, and it says
  so aloud.

## Metric review

- No metric re-scored mid-run. TABLE-PARITY is judged exactly as
  pre-registered (same-base control, not r38's published numbers) and
  holds byte-identical.
- **PILOT CORRECTION (recorded before the full run):** TABLE-DAILY as
  first written required maxDay == census day; the pilot showed maxDay
  180 vs census 181, because runDays plays loop-days 1..180 and the
  census reads the day after. The bar was corrected (rows ≥ maxDay AND
  maxDay ∈ {census day, census day − 1}) in the prereg and the proof
  test before the remaining seeds ran. The instrument was never at
  fault; the bar was.
- **TABLE-VOICED filter note (for r40):** the shared table-line filter
  also catches two non-table lines — the fusion-reactor line ("It does
  not come out" matches /does not come/) and feast lines ("Arc IV burns
  hotter" matches /ARC IV/). True table-line counts above are hand-
  counted (4/2/4/1), not the filter's raw counts (5/3/5/2). A future run
  should tighten the filter or count by hand, as here.
- **BOOK-POOL, first live proof:** 6/6 pool −4 events booked across
  85001/85003. The pool half no longer rests on the proof test alone.
- **Telemetry check:** same-shape check quiet — `telemetry-check.js`
  against scale.json with metrics day, popAlive, pantryKcal: "quiet (4
  files, 3 metrics, no large deviations)". Baseline NOT rolled (panel
  baseline, journey aggregates — same standing note as r37/r38). A
  journey-shaped baseline is still owed by a future run.
- **Test suites:** proof test 48/48 with full EVIDIR + 23/23 static;
  analyzer exit 0 on all 4 seeds; node --check green on driver and
  analyzer. check.js --quick: 279 passed, 8 failed in 449s — and the 8 are
  EXACTLY r38's standing 8 (hide-discovery, measurement-comparison,
  measurement-proof-update, measurement-workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof, parity-20261014), zero EPERM
  mentions in the gate log. Verdict: NO regressions attributable to this
  run — it changes zero src/js and zero existing scripts, new files only,
  and the gate failures are the pre-existing standing set.

## Next arms (named, not started)

1. **The pellet-vs-table tension (Steve call):** does the fusion pellet
   intentionally cost the food-thesis deeds, or should a pellet-fed
   village prove the thesis another way? 85004 is the exhibit.
2. **Stage-0 seek_taken / stage-2 ask_favor treadmill (repeat pattern):**
   wants named in the header that the talk never engages (r38 Scarlett,
   r39 Eduardo + Dorothy). Driver shares blame; the want's absence is
   the system's.
3. **The unplayed finale (lane B's leg):** three villages wait with open
   lesser seats and maxed overtime. Lane A documents the open seat;
   lane B plays it.
