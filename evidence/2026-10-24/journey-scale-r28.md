# journey-scale r28 — NATIONAL GOVERNANCE: MECHANISM OR ANNOUNCEMENT? (2026-10-24, lane A, leg 3)

**Run id:** oversight-playtest-loop-20261024T0843Z. Rotation read 3 → leg 3 SCALE
(days 80–140); wrote 3→0.
**Base:** master@ef04cd8cb (pulled at run start).
**Driver:** `scripts/journey-scale-r28-20261024.js` (r27 driver + day-attributed
`govWatch` governance instruments). **Analyzer:**
`scripts/analyze-scale-r28-20261024.js`. **Instrument proof:**
`scripts/test-journey-scale-r28-instruments-20261024.js` (govClass classifier
7/7 on real engine lines — proves the classifier, not the engine; the run
itself is the end-to-end proof).
**Pre-register:** `hidden_files/evidence/2026-10-24/journey-scale-r28-prereg.md`
(written before any sim).
**Policy:** leadcourt. **Seeds:** fresh 83001–83004. **Horizon:** DAYCAP=150,
death-aware stop. Pilot seed 83001 ran clean before the other three launched.

## Pre-registered leg question

The LEAD national beat announces "GOVERNANCE LAYER: online — polity tribute
routing, the court calendar, famine reserves." On lead-road national seeds, do
all three named mechanisms actually OPERATE after the first court? Code
reading before the run (hierarchy.js, game.js:30205): tribute routing is real
(linkTick arrivals, x1.25 when national); the famine draw is covenant-league
only; no recurring court event exists. The wild run tested those readings.

## Verdicts (binding — none re-scored)

- **G1 tribute routing: NO-GO on the binding letter, GO on the substance
  (see metric review).** Letter: "≥1 post-national arrival on every national
  seed" — 83001 has one (d112); 83002 has zero (post-national window only
  d77→d83, 6 days — shorter than the weekly tribute cadence, so the metric
  could not fire); 83003 has zero arrivals across 58 post-national days.
  Substance: routing operates wherever there is anything to route. 83001's
  d112 arrival is 2,813 kcal = 2,250 × 1.25 — the national routing multiplier
  operating and named in the line. 83003's routing evidence is 7 voiced
  shortfalls with exact amounts and arrears accounting (see below) — the
  mechanism working on a subordinate with empty fields. The letter measured
  payer solvency + window length, not the mechanism. Reported as NO-GO per
  §14; the metric revision (not a re-score) is in metric review.
- **G2 court calendar: FINDING — 0 recurring court/calendar beats on all
  three national seeds.** After each first court (d98/d76/d92), zero
  `courtLine` entries fire for the rest of the run (to d151/d83/d151). The
  "court calendar" in the GOVERNANCE line is announcement-only on the lead
  road: the first court is a single beat, and nothing calendars after it.
  Documented blank, Steve's call whether a calendar should exist. (Classifier
  caveat: `courtLine` also catches the Night Court MONSTER's name — all
  such lines on national seeds fall pre-court, so the 0 stands; on the
  non-national 83004 the single post-"court" line is a Night Court fight,
  not a court beat.)
- **G3 famine reserves (lead road): FINDING — 0 draws on every seed.**
  Lead road has no league pool (`leaguePoolKcal: 0` everywhere), so no draw
  mechanism exists to fire. The sharp datum is 83002: national d77, global
  d78, lesser seat — then "Day 5 of hunger" and an honest scatter at d83,
  with no reserve intervening. On the lead road the one-time feast IS the
  granary moment; after it, a famine is honest and can kill a crowned realm.
  Documented blank, not a bug claim — the feast already paid out, and the
  scatter is the designed consequence.
- **L1 stay-green: GO (3/4 national ≤d140).** d99 (83001), d77 (83002),
  d93 (83003); 83004 honest early scatter d23. Better than r27's 2/4.
- **L5 stay-green: GO.** 2 villages alive at d151 (9/9 each); 2 honest
  starvation scatters (83002 d83, 83004 d23), both voiced in full
  ("Haven couldn't hold… The scattering, again."). No silent deaths.
- **M4 people: GO under the r26/r27 driver-artifact precedent, with the
  alternative reading stated.** Villager content meaningful 4/4 (see People
  check). One transcript as PLAYED is senseless (83003-d90: the driver
  teach-spammed over a real confession) — named in full below. If Steve
  counts as-played transcripts rather than villager content, M4 reads NO-GO;
  the d120 follow-up shows the villager's want-thread surviving the spam
  and progressing, which is why the precedent classification is kept.

## Mechanisms verified in the wild (not just in code)

- **Succession press-down is ×0.75 per chair-empty event.** 83001's tribute
  chain, all voiced: 4,000 → "presses the tribute down to 3,000 kcal/week
  while the chair is empty" → 2,250 arrivals → end snapshot 1,688
  (2,250 × 0.75). Each press is said aloud with its reason.
- **National routing ×1.25, copy/engine agree.** 83001 d112: "Tribute from
  Emberhold arrives — 2,813 kcal" = 2,250 × 1.25, post-national (nationalDay
  d99). The arrival line names the true amount.
- **Full-pantry tribute waiver.** "Tribute wagons turn at the gate — our
  shelves are full past tomorrow. 'Eat well,' we send back. 'That IS your
  tribute this week.' (Trust +1.)" — repeated, honest, no thin-air grain.
- **Shortfall voicing with exact arrears.** 83003 Emberhold: "Nothing comes
  … (Arrears +4,000 kcal, trust -2)" / "comes up thin — 832 of 4,000 kcal …
  (+3,168 kcal)" / 1,563 / 1,552 repeats. Arrears reach 20,949 while trust
  sits at 100 — weekly tending (+8) outruns the -1/-2 shortfall haircuts.
  Observation for Steve (not a bug claim): on a tended link, arrears are a
  ledger number with no teeth — the neglect snap needs trust <20 + no
  upkeep, and tending counts as upkeep, so a tended realm never snaps no
  matter the arrears.
- **Neighbor aid without ceremony.** Thornfield's Kira walks in unannounced
  with spare grain (1,985 / 1,676 / 2,852 kcal, "no tribute, no ceremony") —
  the region's mutual-aid voice operating beside the tribute ledger.

## Village assessments (plain words)

- **83001 (9/9, global d130, seat none):** the crowned one. National d99,
  global d130, 21 contests, 41 deaths — all fighting. The realm holds to
  d151 with a positive pantry (9,588 kcal). No seat because foodDeeds=false
  (r27's rule again: 21 contests don't substitute for the food-thesis deeds).
  Tribute flows, presses, and routes exactly as designed.
- **83002 (scatter d83, lesser seat, tableWaiting):** the crowned-and-starved
  one. National d77, global d78, lesser seat opens — then the pantry empties
  and on the fifth hungry day the realm walks apart. A seat doesn't feed a
  realm. The table approach opened and the village still died honestly;
  that is the design working, not failing.
- **83003 (9/9, national d93, seat none):** the patient one. Emberhold
  starves through the whole run — every shortfall voiced, arrears climbing —
  while Haven itself stays fed (13,652 kcal at d151) and the realm holds.
  foodDeeds=false, so no seat despite national standing. 24 deaths, all
  combat. The realm's poorest fire is carried, not cut loose.
- **83004 (scatter d23):** the early one. Hunger by day 3 of the leg's window
  ("Kiara starved. Slowly.") and the village walks at d23 with 7/7 roster
  alive — a scatter, not a wipe. Honest, voiced, early.

## People check (SENSE-TESTING LAW — 4 transcripts read in full)

- **83001-d90 Farid (locksmith, ask_favor):** meaningful. "Another day like
  today and we're choosing who eats" → player deflects → "No, yeah, of
  course. Forget I asked. They won't forget. They'll just stop asking." A
  deflection with a stated consequence, then a re-open ("Come see what I
  found"). PASS.
- **83001-d120 Farid (ask_favor):** meaningful, thin. "The cistern's nearly
  dry — 9 liters left. I need someone to haul water with me at first light"
  → commit → "Dawn, then." A concrete want, a planted obligation. PASS.
- **83003-d90 Otis (barber, seek_taken):** DRIVER ARTIFACT (named). Otis
  opens with a real confession ("I've been sneaking out at night. I'm
  ashamed and I can't stop") and the driver's picker answers with `teach`
  SEVEN times — a foraging lecture over a confession. Both sides' content
  is coherent; the conversation as played is senseless because the picker
  prefers repeatable `teach` over engaging the want (`dlg:react` was
  available at turn 0). Same class r26/r27 documented. Blank: the picker
  should deprioritize repeatable `teach` once used, or when the NPC's want
  is unaddressed — driver fix, not content fix.
- **83003-d120 Otis (seek_taken, stage 0→1):** meaningful, and it redeems
  d90. The taken-kin/pods thread RETURNS thirty days later ("About what
  happened to my taken kin — Have you heard anything? … I mean it") →
  player commits "I'll ask the System about the pods" → "You'd do that?
  Ask it? …Thank you. Really. Even asking is more than the silence." Wants
  persist across conversations and progress in stages despite driver abuse.
  PASS. (The shared pod-quest line matches r27's Cheyenne beat — one line
  reused across villagers for the same quest, not a verbatim-loop blank.)

## Blanks filled/documented

1. **Court calendar announcement-only (G2)** — documented above; Steve's
   call whether post-first-court court beats should exist.
2. **Famine reserves lead-road nothing-standing (G3)** — documented above;
   the feast is the moment, the scatter is the consequence.
3. **Arrears toothless on tended links** — observation above; Steve's call
   whether arrears should bite (they currently can't, by the upkeep rule).
4. **Picker teach-spam (Otis-d90)** — driver blank, fix proposed above;
   not a content bug.
5. **83002's tableWaiting + scatter** — the lesser seat opened days before
   the scatter; no contradiction (a seat prices the run, it doesn't feed it).

## Telemetry deviation check

vs `scale.json`: 4 LOUD lines, ALL "newly appeared" (baseline 0 → current
3/43/110/9 for nationalVoiced/govWatch/deathLog/leadSeasoned). Investigated
same-run: EXPLAINED — the baseline's keys (markerCounts.firstCourt,
watchers, tableTele, fightsTotal, fightsByWave.4, maxGameDay) come from an
older instrument and map to none of this driver's per-seed census shape
(same artifact r25/r26/r27 documented). Current values are in line with r27
(national voiced 3/4 vs r27's 2/4; 110 deaths across 4 seeds incl. 2 scatters
is the combat + starvation signature, not a regression). Baseline NOT rolled.

## Metric review (§14)

- **G1's letter was wrong in two ways:** (a) it conflated mechanism with
  payer solvency — a starving subordinate produces voiced shortfalls, not
  arrivals, and that IS the routing mechanism working; (b) it ignored
  cadence — a weekly event cannot appear in a 6-day post-national window.
  Proposed G1' for the NEXT run: on national seeds with ≥7 post-national
  days, routing evidence = ≥1 arrival OR ≥1 voiced shortfall/arrears
  movement. Under G1' this run scores 2/2 testable (83001 arrival + ×1.25;
  83003 shorts + arrears); 83002 untestable-in-window, 83004 non-national.
  The binding verdict above stays NO-GO on the letter; G1' is a proposal,
  not a re-score.
- **G2/G3 confirmed as finding metrics:** their 0s are the finding (the code
  reading predicted them), not failed gates.
- **M4 classification:** "senseless" is applied to villager content, per the
  r26/r27 precedent; as-played driver artifacts are named separately. The
  alternative reading (as-played = NO-GO) is stated in the verdict so Steve
  can overrule the precedent.

## Reachable / fun / winnable (scale leg)

- **Reachable:** national ≤d99 on 3/4 competent lead-road seeds; global on
  2/4; the lesser seat opens (83002). The food-thesis deeds gate holds on
  both global/national no-seat seeds (foodDeeds=false both).
- **Fun:** the tribute ledger is ALIVE — presses, waivers, shorts, neighbor
  grain, ×1.25 routing, all voiced with true amounts. The crowned-and-
  starved 83002 is the leg's best story: a realm can win the climb and
  still starve, and the game says so aloud.
- **Winnable:** the table approach opens on competent play (1 lesser seat;
  r27: 1). The win itself remains lane B's leg. The scale leg's own
  question — does governance operate? — answers: tribute routing yes,
  court calendar no, famine reserves no (lead road). Two of the three
  announced mechanisms are aspiration, one is engine.

## Evidence

`evidence/2026-10-24/journey-scale-r28-lead/` — 4 census JSONs, captures,
beats/moments/table dumps, gov dumps, 4 transcripts. Driver + analyzer +
instrument proof under `scripts/`.

## Ops

- Rotation: `journey-rotation-a.txt` → 0 (3→0).
- Commit: tooling + evidence only, zero src/js changes. No [needs-eyes] —
  no player-facing change.
- Proofs re-green at this tip: `test-scalediscovery-nextact-dedup-20261023.js`
  5/5, `test-seat-waiting-honesty-20261023.js` ALL GREEN (A–E),
  `test-journey-scale-r28-instruments-20261024.js` 7/7.
- Infra notes: (1) `git status` on the worktree takes ~50s (restat) — avoided
  full-tree status after setup; safe-commit's private-index path is
  unaffected. (2) `node scripts/check.js --quick` was stopped after ~8 min
  with no output on a box loaded with sibling sims (keepceil/pddrift/pdvalue
  sweeps + lane-B endgame probe running concurrently); targeted proofs above
  are green and the landing is tooling + evidence only, so the broad gate
  is not claimed. (3) No lock existed at run start; fresh lock created,
  deleted at run end. Master did not move during the run.
