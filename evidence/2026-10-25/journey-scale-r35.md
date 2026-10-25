# journey-scale r35 — TRUST-SETTER ATTRIBUTION (2026-10-25, lane A, leg 3)

**Run id:** oversight-playtest-loop-20261025T1843Z. Rotation read 3 → leg 3 SCALE
(days 80–140 + post-national tail); write 3→0 on completion.
**Base:** master@2018a499a (lane-B sim-food-round-1752 landed mid-preflight;
worktree rebased onto it before any sim). Main tree verified clean at start.
**Driver:** `scripts/journey-scale-r35-20261025.js` (r34 driver + ONLY:
trust-setter call-site logging, betrayal-choice picker handling, DRIVER DROP
marker, DAYCAP 150→180). **Analyzer:** `scripts/analyze-scale-r35-20261025.js`
(r34 analyzer + site derivation, day-label + order-greedy reconciliation,
betrayal/drop scan, post-national window). **Proof test:**
`scripts/test-journey-scale-r35-trustset.js` (24/24 on r35, RED on r34).
**Policy:** `scripts/policies/scalecourt-nogate.js` — UNCHANGED.
Standing scalecourt.js untouched. Zero src/js changes (instrument only).
**Pre-register:** `evidence/2026-10-25/journey-scale-r35-prereg.md` (written
before any sim).
**Seeds:** MATCHED to r30–r34: 85001–85004. Horizon DAYCAP=180, death-aware
stop. Pilot seed 85001 ran first and passed the gate (no crash,
pilgrimages=1) before the other three launched.

## Pre-registered leg question

r34 proved deeds feed covenant trust silently and found 4 silent −4/−5
drops with no writer in the engine's book, and concluded daily snapshots
cannot attribute moves the engine never books. r35's question: can
driver-only trust-setter logging attribute EVERY daily trust move to a
named call site, and what are the writers of the r34-class silent drops?

## Verdicts (binding — none re-scored)

- **ATTR (day-label coverage): NO-GO as written.** Day-label reconciliation
  matched only 38/86 (85001), 56/137 (85002), 7/26 (85003), 25/70 (85004)
  nonzero link-days — far under the ≥95% bar. The miss is a measurement
  artifact, not an instrument failure, and it is diagnosed exactly (see
  Mechanisms): night moves log the OLD day but land in the NEXT snapshot.
  The bar is NOT re-scored: it stands as a NO-GO, and r36's revision is
  proposed under Metric review (order-based reconciliation).
- **ATTR-order (the stronger claim, reported not substituted): PASS.**
  Order-greedy reconciliation explains 15/15 links exactly: every snapshot
  level on every link is hit in order by the setter log, and every
  remaining tail lands exactly on the census final. No trust move in the
  run escapes the log.
- **DROPID (silent-drop writers): GO — 100% named.** All 112 drops ≤ −4
  across the 4 seeds carry a named site (zero 'unknown'). The r34-class
  −4/−5 drops resolve to two writers (see Mechanisms).
- **BETRAY (betrayal-choice handling): GO.** The r34 drop case (85004-d120
  Dorothy) now engages: betrayal:accept picked, transcript played out,
  no DRIVER DROP on any of the 5 transcripts.
- **PICK-G (picker-cap guard): GO.** Max consecutive dlg:more/goon ≤ 1 on
  every transcript (85004-d120: 1, 85004-d90: 1, rest 0); post-deflect
  goon = 0 everywhere.
- **POSTNAT (post-national window): MEASURED, first time.** 85002 reached
  national d164, global d165, and was observed for 17 post-national days
  (to the d181 cap) with 33 poolLive snapshots in that window. r34's
  blank (d) is retired as measured, not carried.
- **BONDS/NATIONAL (report-only):** third bond by d110: 85001 had 3 by d28
  (then died d71); 85002 had 3 by d100; 85003 had 2; 85004 had 1. National
  by d140: 0/4 — 85002 reached national d164, 24 days past the window
  (r34's d150 on the same seed moved later on the new base). Lesser seat
  waiting: 4/4 seeds (including scattered 85003). Full seat 0/4, wave 5
  0/4 — the scale wall above national/table is untouched.

## Mechanisms verified in the wild (setter stacks, file:line)

- **Every trust move routes through a logged setter.** 458 setter events
  (147 + 174 + 37 + 100). Gain sites: answerAccord (+10 accord gift),
  recordDeed (+1..+4 per deed, via agencyTeachVillager/objTick),
  covenantTick/tradeTick/linkTick (+1 daily ticks), proveWorth,
  payTribute, answerAidBeg/Offer, answerCovenantCrisis (+8 concessions),
  answerNationalChoice. Drop sites: covenantCrisis (−10, leader-death
  crisis on covenant/trade links), successionCrisis (−8, primary-sub),
  _resolveRenegotiation (−6), linkTick arrears (−6, tribute-short),
  answerDemand (−15 once, 85004 d106), answerAidBeg (−5 once),
  titanEscalate (−5), covenantTick pool-short (−4).
- **The r34 silent −4/−5 drops are titan night-strikes and pool-short
  charges — voiced in the moment, never booked.** titanEscalate
  (titans.js:288) says "struck X in the night. They bled while the
  coalition talked. (trust −5 — they notice who wasn't there.)" with NO
  link-history note. Pool-short (hierarchy.js:3091) says "Haven's share
  of the league pool comes up short… (Trust −4 across the league.)"
  with NO −4 note (the pool pour note does not name the charge). A
  player present hears them; a player scrolling back cannot find them.
  That is the precise blank: book both moves, change no numbers (r36
  arm — see Blanks).
- **The sleep-phase lag, exactly.** Night moves (hierarchyDaily ticks and
  night deeds) log the pre-sleep day but land in the next snapshot:
  e.g. 85001 village_1: tick +1 logged d28 + deeds logged d29 appear
  across snapshots d29 (+2, not +3) and d30 (−1, not −2) — one deed
  logged d29 lands in snapshot d30. Day labels are therefore the wrong
  join key; order is the right one. The analyzer now reports both.
- **85001 instrument-neutral, control-identical.** Same outcome line as
  r34's control: died out d71, pop 0/0, pantry 10,338, census covenants
  42/42/42 (weekly snapshots end at 51; the d71 crisis −10 + night tick
  +1 explain the census 42 exactly). The setter accessor changed no
  outcome.
- **85002 post-national trust movement is real and downward.** Covenant
  links: pre-pool nets +22/+14/+20, post-pool nets −15/0/0; poolLive
  snapshots 33 after national. The pool era does not hold trust up by
  itself — crises, titan strikes (−5 × 12 on this seed), and pool-short
  −4s bleed it. National is a stage, not a stabilizer.
- **85004's zombie bond.** Its one covenant formed d71, never seasoned
  (peak 34), and hit trust 0 five times — each time a crisis concession
  (+8) revived it to 8–9, then titan strikes and crises bled it back to
  0. A link at 0 stays 'active' in the census. Whether a 0-trust bond
  should still count as a bond is a design question, not a bug claim.
- **85004's primary-sub collapse is arrears, not war.** village_2 peaked
  at trust 74, then tribute-short −6s, a −15 demand answer (d106), and
  repeated −6 ticks broke it (0 primary-sub links at end). The
  subordinate road broke on the ledger.

## Village assessments (plain words)

- **85001 (died out d71):** the league that seasoned and then lost its
  speakers. Three covenants at peak 55, seasoned — and nobody left to
  carry the mantle. The village did not starve (pantry 10,338); it ran
  out of people, same arena chain as r34.
- **85002 (national d164, global d165, alive 6/6 at d181, lesser seat
  waiting):** the realm that arrived at the table hungry and kept going.
  Three covenants at 37–50, pantry 0 at the cap — the league granary
  (14,929 kcal drawn) is carrying them, not their own pantry. National
  voiced, global voiced, table waiting.
- **85003 (scattered d110):** the famine village, again. Pantry empty,
  people walked. Its two covenants bled out with it (26/28, never
  seasoned) — crisis after crisis, two deed-gain days in the whole run.
  One village never even became known (unknown-village blocker).
- **85004 (alive 5/5 at d181, regional, lesser seat waiting):** the thin
  village that held on a thread. Pantry 2,240, no primary-sub bond left,
  one covenant at trust 0 — a bond that keeps dying and being revived
  by concessions. It is waiting at the table with nothing solid behind
  it.

## People check (SENSE-TESTING LAW — 5 transcripts read in full)

- **85004-d120 Dorothy (ask_favor stage 2, betrayal engaged):** ENGAGED,
  PARTLY resolved. The r34 driver drop is fixed: accept is picked, and
  Dorothy's want is real ("I've been mapping the roads out. Quietly").
  The middle has voice ("I pack light. Always have. Makes leaving
  easier. Makes staying harder, too."). But the ending is a generic
  close ("Alright. One thing at a time.") — it never resolves, plants,
  or owes her departure: no date, no condition, no debt. The
  more/react loop also spins aphorisms without progression (3 mores).
  Blank: betrayal:accept needs a landing.
- **85002-d120 Elena (ask_favor stage 2, pantry run):** GO. Details
  engaged ("I did the count twice. The count doesn't change."),
  deflect taken with consequence ("They won't ask twice"), clean leave.
- **85002-d90 Ariana (ask_favor, hungry hands):** GO, short. Commit made
  ("I'll come back to help"), resolution ("I won't forget who fed me").
- **85003-d90 Joshua (seek_taken, taken kin):** GO, strong. The game
  knows Theo died d89 in the arena; Joshua's question is coherent with
  the world, and the commit ("Even asking is more than the silence")
  lands.
- **85004-d90 Dorothy (curious, regrets):** GO. "I regret the ordinary
  days I rushed through... I'd pay anything for one annoyed morning
  now" — a villager with a past, not a menu.

## Blanks filled / fixed this run

1. **Trust-setter instrument (driver + analyzer + proof):** the r35 arm.
   Proven by the proof test (real extracted functions: drop/gain stacks
   name callers, unchanged assignments silent, re-install idempotent)
   and by the matched 4-seed run (458 setter events, 15/15 links
   order-explained, 112/112 drops named, pilot outcome control-identical).
2. **Betrayal-choice picker handling + DRIVER DROP marker:** r34 blank
   (c) closed on the driver side — 85004-d120 engages; zero driver
   drops across all 5 transcripts (marker would have caught any).
3. **Post-national window:** r34 blank (d) retired — 85002 gives 17
   post-national days with poolLive movement measured.
4. **Documented, NOT fixed this run (discipline — each needs its own arm):**
   - (a) **Book titan night-strikes and pool-short charges.** One
     _linkNote each, no number changes. r36's arm; proof = setter log
     shows a book entry after each such move.
   - (b) **Betrayal:accept needs a landing.** The engaged thread ends
     in a generic close; whether accept schedules a departure (or any
     state change) is not visible in the transcript — r36 should
     measure the state consequence, then judge the ending.
   - (c) **0-trust bonds still count as bonds.** 85004's covenant sits
     at 0 and counts in the census; a design question for Steve, not a
     fix to smuggle into an instrument run.
   - (d) **Carried from r34, still open:** "Come see what I found"
     plant-drop; closing-line mismatch after a commit. Not re-judged.
   - (e) **85001 arena die-out:** unchanged on the new base — still a
     contest/arena-lane bisect, not this run's.

## Reachable / fun / winnable (leg 3)

- **Reachable: YES, with the same caveat.** The covenant road forms on
  4/4 seeds (3/4 with 3+ bonds), the seasoned bar is reachable when
  deeds outrun deaths, and the lesser seat waits on 4/4. The caveat is
  the die-out class: a village can season its league and still die in
  the arena before the table.
- **Fun: PARTLY, and now precisely located.** The voiced half (crises,
  concessions, council, titan strikes) reads as real politics. The
  silent half is now down to two unbooked moves (titan −5, pool-short
  −4) — heard in the moment, lost on scrollback. That is the leg's
  remaining fun blank, and it is a one-note-each fix.
- **Winnable: APPROACHING, not arrived.** Lesser seat 4/4, national 1/4
  (late, d164), global voiced 1/4, full seat 0/4, wave 5 0/4 — the scale
  wall above national/table is untouched, consistent with the
  scale-onramp picture.

## Metric review

- No metric re-scored mid-run. ATTR, DROPID, BETRAY, PICK-G were judged
  exactly as pre-registered; POSTNAT/BONDS/NATIONAL are report-only as
  written. ATTR missed on the letter (day-label join) and the miss is
  diagnosed, not excused: night moves log the old day.
- **Revision proposed for r36:** ATTR becomes order-based — every
  snapshot level hit in order by the setter log, every tail landing on
  the census final (r35's order test: 15/15). Day-label reconciliation
  stays as a diagnostic line, not the judge.
- **Instrument lesson for the NEXT run:** day labels lie by one phase;
  any future daily instrument must join on order (or log phase), never
  on day alone. The setter log's stack already carries the phase
  implicitly (hierarchyDaily = night, everything else = day) — r36
  could tag phase explicitly from the stack.
- **Telemetry check:** LOUD lines are the same instrument-shape
  mismatch as r30–r34 (census JSONs carry no markerCounts/fightsTotal/
  maxGameDay fields; that baseline is from a different instrument).
  Mechanisms are present in-capture: national d164/global d165 on
  85002, pool/council lines, defense calls answered. Baseline NOT
  rolled (shape mismatch, and rolling a driver-arm run into the
  baseline would bake the arm in). tableTele 0→0, no LOUD line.
- **Test suites:** proof test 24/24 (r35) + RED on r34 (as designed);
  r34 trustdelta proof still passes on the r34 driver; r33 pickcap
  proof still passes. Full --quick NOT run (zero src/js changes; same
  precedent as deepening r44/r45/r46 and scale r34 — instrument-only
  runs run the proof + targeted checks, not the 23-minute full set with
  its standing 8 pre-existing failures).

## Ops

- Worktree journey-scale registered, heartbeated throughout (detached
  loop, verified via registry heartbeat_at after start, plus per-seed
  loops), to be released and removed at the end; branch deleted after
  merge; main tree verified clean. No version bump/push (ship loop owns
  it). Merged locally, pending ship — no version tag, no push. Lock
  deleted at end. Rotation-a 3→0 on completion.
