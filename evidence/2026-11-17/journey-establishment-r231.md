# Journey leg ESTABLISHMENT — r231 run note (2026-11-17, Lane A)

## Run
Run id `playtest-loop-a-20261117T0759Z` (scheduled Tue 2026-11-17
01:45 CST). Rotation read `1` (establishment); write `1→2` at
closeout with read-back. **Base:** local master `dbeb1493f`
(journey-landing r141). Heartbeat loop running (9-min cadence,
`journey-establishment-hbloop-r231.sh`, pid 27420, setsid-detached
per the r141 lesson). Pre-flight: main tree CLEAN, disk 46%. Lock
created by this run 2026-11-17T08:00:32Z. No push (ship loop owns
pushes). Registration took ~2 min; worktree `git status` was slow
on first run under box load (timed out at 60s, completed in ~5 min
in the background — index restat warming; the run proceeded with
file tools meanwhile).

## Pre-registered bars (r231 prereg)
Q1 FAVORLESS ASK, RE-MEASURE OF THE r230 FIX on a MATCHED band
(101201–101205, released for this one re-measure in the prereg).
Q1b WANT-RAISE, regression guard. Q2 SITTING CLOSES, standing bar.
Q3 recap paraphrase, report-only. Carried bars: SPOTTER, LADDER,
FASTER-ID, END BAR, TRUST GUARD, VILLAGE BAR, JAM, STRANDED /
TRAVEL / THREAD watches, PEOPLE CHECK, SCHOLAR-DEATH standing
metric, ROSTER-RECONCILIATION watch (now with the
rosterDepartures instrument + death-id match). Pilot gate passed
first try (see below).

## Pilot (seed 101201, 42d)
Ran clean in ~13s: endDay 43, aliveEnd 12, aliveAt40 12, wave 3,
pantryEnd 53,462, wedgeSits 71, committed 4, bumpCalls 54,
bumpBenefit 44, codexPlants 21. Gate: 2 sittingCloses records with
closing beats (Gladys 2, Frank 3), 62/62 wedge social sits carry
Q1 trace fields, spotter instruments fire, rosterDepartures
present (empty — start 12, end 12, nobody vanished on this
trajectory, unlike r230's 101201 which lost 2 on d16). Panel
proceeded on the same driver.

## Analyzer verdicts (r231 panel, seeds 101201–101205, 42d)
- **Q1 FAVORLESS ASK: GO — 13/82 raised asks (15.9%) never
  materialized into a committable favor (r230: 26/74 = 35.1%).**
  Rate < 20%, stage-0-deflected 0, every sit classified. The r230
  fix works on the matched band: the rate fell 19.2 points with
  the same villages, same driver, only the base changed. But the
  residual is still 100% class E1 (opener never ran, 13/13) — and
  the shape of the residual is the finding below (F1).
- **Q1b WANT-RAISE: GO — 82/297 social sits raised ask_favor
  (27.6%); any-want sits 278/297; zero-raise seeds 0/5.** Kinds:
  forage_help 57, (no-kind) 13, food_share 5, heal_help 4,
  water_haul 1, sick_help 2.
- **Q2 SITTING CLOSES: 0/10 CUT — GO.** 1 engine-ended sitting
  WITH closing beats; 0 other no-close. The r224 F4a/F4b/F4c
  dry-line fixes, r228 C3c/F2 fixes, and r226 F6 dry-opener guard
  hold in the wild (0 recurrences in their classes). C3d recap
  fix: the Seymour sitting's recap names the live want
  ("wanting to protect the group — that's still where we are")
  — holds in the wild on the read sitting.
- **Q3:** recap paraphrase distinct 2/10 sittings (raw 4) —
  report-only, no second formulation owed (bar: ≥6 distinct).
  Canned lines (distinct/raw): walked-in 0/0, recap-stitch 0/0,
  slope-reading 0/0, take-it 0/0, stew-bowl 0/0, pod-dream 0/0,
  pod-dream-open 0. Parting pool: 0 serves this panel (see/care/
  tomorrow all 0 — second panel in a row at 0; the r214 parting
  lines never fire in the wild. Watch, not a bar).
- **SPOTTER GO:** 50 total (16/10/10/11/3), 5/5 seeds > 0.
- **LADDER 4/5** (bar ≥3/4). Seed 101205 misses pace (Ruth 3 XP)
  — the thin end again, same seed and same villager as r230:
  spotter XP tracks foraging volume, not time (same mechanism as
  r210/r217/r221/r225/r230).
- **FASTER-ID GO:** 5/5 seeds, 172 benefit plays in 255 bump calls
  (r230: 172/249 — the identical benefit count is a curiosity of
  the first-per-day cap, not a defect; bump calls differ).
- **CODEX 131** plants identified at end across 5 seeds (r230: 122).
- **END BAR 15/15** broken-live forage closed ≤2 dawns (r230:
  14/14). TRUST GUARD 0 drops. VILLAGE BAR 5/5 alive d40. JAM 0.
  STRANDED: 6 stranded dawns on 1 run, worked-on-stranded 0,
  guard fires 0, social-sit dawns 6/6 — BAR PASSES (see census).
  THREAD 0/0, TRAVEL 0/0 — NO-OPPORTUNITY on both. Water 0
  broken-live runs.

## FINDING F1 — the residual 13: "It's already handled" eats the help press

The r230 fix made the ask reachable — the menu offers `dlg:help`
and the player presses it — but 10 of the 13 residual favorless
sits pressed `dlg:help` and the want STILL never surfaced. The
mechanism, quantified from the sit traces:

- 12 of 13 residual sits carry a SETTLED ledger favor at sit
  start (moot/acknowledged/declined) while a LIVE need waits
  (forage_help/u2 ×9, heal_help/u4 ×1, water_haul/u3 ×2).
- 10 of 13 pressed `dlg:help` (turn 0 or 1) — the menu fix fired
  and the wedge pressed it — and the stage stayed 0, no favor
  attached, sit ended "no-offer".
- The handler short-circuits: `convo-dialogue.js` dlg:help
  answers ANY settled ledger favor with "It's already handled.
  Thank you for asking." and returns WITHOUT calling
  `convoWantEngage` — before `engageBeat` is ever reached. The
  engageBeat deferred-after-resume guard (dialog audit #1, seed 7
  Nolan) was written for exactly this shape, but it is dead code
  on the dlg:help path: the handler's own short-circuit fires
  first. And it only covers RESUMED sittings — 4 of the 13
  residual sits have resumedOnce false (pre-empted by a
  secret/trade/recall thread instead).
- The 3 sits that never pressed help (Meera d39, Chantal d15,
  Kate d26): Chantal d15 is the only residual sit with NO ledger
  favor at all — the one case the short-circuit cannot explain
  (help likely never offered that turn, or the sit ended first).

In human terms this is Victor (101203 d36, heal_help/u4 — an
URGENT healing need): the player asks "What do you need?" and
Victor answers "It's already handled" — about a DECLINED
heal_help favor — while the need is live. The same line fires in
the day-43 people-check sitting (see People check). A villager
with a live need must not answer "it's handled" about a dead
favor when asked how to help.

## The fix (landed this run — the blank, filled)
**THE SETTLED-LEDGER SHORT-CIRCUIT.** Two guards, one condition:
- `src/js/convo-dialogue.js` (+13/−1): the dlg:help handler skips
  the settled-favor short-circuit when the want has NO favor, is
  still at stage 0, and a LIVE need exists (read fresh via
  `convoFindFavorNeed` — the need can die between menu and press).
  It falls through to engageBeat, whose deferred branch states
  the ask. Without a live need, the settled answer still fires.
- `src/js/convo-wants.js` (+11/−3): engageBeat's
  `deferredAfterResume` broadens from "resumed sitting with no
  favor, stage < 1" to "no favor, stage < 1" — the pre-emptor
  need not be a resume opener. The picker only selects ask_favor
  on a live need, so a stage-0 favorless ask_favor want always
  has a live ask to state; if the opener cannot build one, the NO
  HOLLOW FALLBACK answers honestly. The r7 shape is preserved:
  a want whose OWN favor is settled still gets "it's handled".
- Proof test
  `scripts/test-journey-establishment-r231-settled-help-20261117.js`
  **19/19 PASS on the fix; 13 pass / 6 fail on the base** (the 6
  failures are exactly the C/C2/C3 + D/D2/D3 discriminators:
  help returns "It's already handled", stage stays 0, no favor).
  Scope guards pass on both: no live need → "already handled"
  (E); own favor settled → "already handled" (F, r7 shape);
  plain deferred ask with no ledger favor → surfaces (G, fresh
  game — the first process's run ledger can block a third
  identical ask line through the F4c guard, so G runs on seed
  5002; the probe that caught this is documented in the test).
- Carried proof tests re-run green on the fixed code: r230
  stage0-help 13/13, r214 mood-goodbye 10/10, r139 spotter 35/35,
  r221 want-raise 7/7.
- **r225 stage0-cant UPDATED (deliberate overturn, 18/18):** the
  r225 test's C section expected help on a settled favor to leave
  the stage-0 want alone — written before the r230 surfacing fix,
  it directly contradicts r230-D (help must engage a stage-0
  want) and is the behavior the r231 panel proved defective.
  C now expects the surfacing behavior, D/E (cant/deflect_q on a
  still-stage-0 want leave it alone — the actual r225 defect
  guards) run first on the staged state, re-staged so C's engage
  does not contaminate them. The r225 spirit is preserved: help
  ENGAGES (states) the want, never resolves it as refused unheard.
  Updated in the same commit, reason stated in the test header
  (repo rule: design change on purpose → update the test, say so).

## Q4 — census (plain words)
Five villages, 42 days, all alive at day 40 (5/5). They are not
the same village five times: seed 101201 is the fat one (pantry
53,462 kcal, 12 of 12 alive, nobody died, nobody even vanished);
seed 101203 is the lively one (pantry 17,548, 12 of 12 alive,
wave 4 reached); seed 101205 is the thin one (pantry 16,840,
9 of 12 alive — the only village that lost three).
- **The dying:** 5 named villagers died across the five villages
  (of 196 death events — the rest are monsters the villagers
  killed). Causes: Clarence d20 the wild (101202), Esmeralda d17
  contest (101204), Nino d15 ambush, Ivan d17 monster, Miles d36
  the wild (101205). Nobody starved. Three mantle-holders died
  (Clarence, Esmeralda, Miles) — see Scholar-death watch below.
- **The vanishing (roster watch, ANSWERED):** 0 unaccounted on
  all five seeds. The rosterDepartures instrument + death-id
  match work: 101202 Clarence died d20 (the wild) — death
  recorded AND departure logged; 101204 Esmeralda d17 (contest);
  101205 three deaths d15/d17/d36, all matched by ID. The r230
  anomaly seed 101201 lost nobody this run (trajectory diverged
  on the new base — the two who vanished on r230 stayed). The
  instrument proof on the r230 corpus also exposed the name-only
  matching flaw (101204/101205 read UNACCOUNTED=2 by name — the
  death record's resolved name "Wei" differs from the
  start-census name "A person, maybe 30s, with a broad frame"),
  fixed before the panel by recording the death id
  (corpses.js `who` is the villager id). The watch is answered as
  "departures happen and are now recorded, matched by id" — the
  next question is whether a departure is ever narrated to the
  player, and the instrument stays in the driver.
- **What they knew:** the scholar's plant codex holds 21–37
  plants per village at end (131 total). Spotter knowledge
  concentrates in one forager per village (16/10/10/11/3 XP) —
  practice earns it, one person per village carries the specialty.
  Seed 101205's Ruth (3 XP) is the thin end, same seed and same
  villager as r230.
- **What they carried:** joint favors are all forage_help (27
  commits across the panel; r230: 30). Pantries end 16,840–
  53,462 kcal (1,462–4,455 per person). Wave 4 reached on 3/5
  seeds (101203/101204/101205) vs 0/5 on r230 — the unlock reads
  standing only (game.js:34508), so the villages' standing totals
  crossed the wave-4 threshold by d42 where r230's did not. The
  base's standing-relevant changes are the companion guard
  (expeditions complete instead of being overwritten) and the
  dlg:help fix (fewer joint commits this panel, 27 vs 30 — not
  the driver); the guard is the leading candidate but
  unattributed — the driver does not record standing totals. No
  wave-4 kills or party launches in the instrumented records
  (the driver does not capture wave per kill or launches).
- **The stranded run (101205):** Abderrazak's forage run stranded
  for 6 dawns (d38–d43) because its bearer Miles died d36 (the
  wild) and the successor can neither work nor end it. The wedge
  still sat socially on all 6 dawns, performed 0 work on the
  stranded run, and committed one new favor (Kate d39) — the
  r137 stranded shape in the wild, bar holding.
- **Social life:** wants are raised in 94% of social sits
  (278/297). The gap this run closes is the other side of r230's
  fix: a villager who says "How can I help?" will now hear the
  live ask instead of "It's already handled" about a dead favor.

## People check — PASS (seed 101203, Seymour + Victor, read in full)
- **Seymour** (carpenter): PASS. Resumes "wanting to protect
  the group" from 8 days back; the recap paraphrase names the
  live want ("that's still where we are" — C3d holding). "I count
  heads at night. Every night. You get used to the arithmetic of
  care." "Protection looks boring when it works. I aim for
  boring." "Mine's simple: learn one useful thing a week. This
  week it's trapping. A plan's just a direction you argue with."
  Coherent, characterful, resolves. Nit, not a defect: the
  goon-first driver presses "How would that even work?" three
  times; the NPC answers differently each time (probe artifact).
- **Victor** (appliance repair tech): PASS as people, FINDING as
  mechanism (F1 above). Opens with continuity ("You said one day
  at a time. How's that holding..."), the player asks "What do
  you need?" and Victor answers "It's already handled. Thank you
  for asking." — the settled-branch line, live in a held sitting.
  The sitting then wanders through real things (the hollow,
  teaching Wild Ramps, White Yam, "a ridge with a view for
  miles") and closes warmly ("Steady as she goes. See you at
  dinner." + "This was good."). The conversation is human; the
  handled line is the defect, now fixed — on the fixed code that
  press states the live ask instead. (This sitting is day 43, not
  the d36 wedge sit itself; the shape and the line are identical.)

## Scholar-death watch — 3 deaths, investigate (prereg: ≥3)
Three mantle-holders died (Clarence d20 the wild, Esmeralda d17
contest, Miles d36 the wild) vs 0/5 on r230 and 1–2 on every
earlier panel in the series. Two of three are "the wild" — the
honest fallback cause for an away-from-Haven death with no named
killer (game.js:9463–9468, ledger.js:744). The named candidate
mechanism is the companion guard (shipped unconditional this
base): a companion call no longer overwrites a live expedition,
so a mantle-holder out on an expedition stays out — longer
exposure to the wild. Unproven from this panel alone: the
driver does not record the scholar's location at death, and the
travel logs around the death days name the wedge's outings, not
the scholar's. No src/js change from this run on scholar deaths:
3 deaths on one matched panel, causes split, and the guard's
benefit (orphans 2→0) was proven on the sim lane. Carried: if
r232 also shows ≥3, escalate to a matched A/B on the guard with
a location-at-death instrument.

## Verdicts (leg: establishment, days 14–40)
- **Reachable:** YES. All five villages play the full 42 days;
  sittings, teaching, favors, contests, waves 3–4 all fire.
- **Fun:** YES. Conversations land, close, and resolve; the
  villages feel inhabited; Seymour's arithmetic of care and
  Victor's ridge are the game at its best — and the one false
  note (Victor's "already handled") is now fixed with a proof.
- **Winnable:** ON TRACK for the leg, with the Q1 GO standing as
  the leg's closed item. Villages survive, gear up, kill ~30–70
  monsters each, bank spotter skill, and reach wave 3 on 5/5 and
  wave 4 on 3/5 seeds. No village reached national/table —
  expected at day 42. The binding watch is now a fix with a
  proof: a villager asking for help will hear the live ask
  instead of "It's already handled" — the next establishment run
  re-measures the rate.

## Metric review (§14)
- **Q1 GO, and the bar worked.** The rate (15.9%) and the
  stage-0-deflected count (0) split the verdict honestly; the
  class mix (E1 13/13) named the residual mechanism instead of
  letting the GO hide it. The fix lands the same run, per the
  r230 precedent; its effect is for the NEXT establishment run
  to re-measure.
- **Q1 re-measure design (matched band) worked.** The 19.2-point
  drop is attributable to the base, not the band — same seeds,
  same driver. The band release in the prereg is spent: r232
  takes a fresh band UNLESS its prereg explicitly re-releases
  101201–101205 for the r231-fix re-measure (same justification,
  same scoping — the re-measure of THIS fix wants the same
  attribution, and the fix was not tuned to these seeds).
- **Q1b bar WORKS.** 27.6% panel rate (up from r230's 23.9%),
  no zero-raise seed. Keep as written.
- **Q2 bar WORKS on the new base.** 0/10 CUT with the C3d fix
  in the game. Keep as written.
- **Q3 — report-only, stable.** Distinct 2 (raw 4), same as
  r230. The parting pool is now 0 serves on two straight panels
  (r230 + r231) — if r232 also serves 0, open the question of
  whether the r214 parting lines are reachable at all in the
  wild.
- **Scholar deaths 3/5 — first ≥3 in the series.** Investigated
  above (wild-travel shape 2/3, guard-exposure hypothesis named,
  unproven). The metric stays; r232 re-reads it.
- **LADDER pace read, again:** the thin seed (101205, Ruth 3 XP)
  misses pace while foraging least — spotter XP tracks foraging
  volume, not time. Not a bar failure. Same seed, same villager
  as r230 — the band's structure persists across bases.
- **Wave 4 on 3/5 (was 0/5).** Not a bar, but the biggest
  base-effect signal besides Q1. Unlock reads standing only;
  the guard is the leading candidate, unattributed. The next
  establishment run's driver should capture standing totals at
  end so the move can be attributed.
- **Roster watch CLOSED as an instrument gap, answered.** 0
  unaccounted on 5/5 seeds with departures logged and matched by
  id. The instrument stays in the driver; the open question is
  narration of departures, not recording.
- **Telemetry baseline — do NOT roll.** LOUD on guardrails.* is
  the known schema mismatch (prereg-predicted); c3 quiet.

## Telemetry check (§14)
`telemetry-check.js` vs `telemetry-baselines/establishment.json`
(metrics guardrails.deaths, guardrails.popAlive,
guardrails.pantryKcal, c3.starvationDeaths):
- LOUD: guardrails.deaths 604 → 0; guardrails.popAlive 178 → 0;
  guardrails.pantryKcal 1210411 → 0.
- Adjudicated: the KNOWN schema mismatch (prereg-predicted) —
  the driver never emits `guardrails.*` fields, so the checker
  reads missing paths as 0. Not a game change; the r231 panel's
  deaths / pantry are all in-band in the analyzer (5/5 alive
  d40, pantries 16,840–53,462, 0 starvation deaths).
  Baseline NOT rolled (prereg: never roll on a mismatch).

## Gate check
`node scripts/check.js --quick` in the worktree, log
`evidence/2026-11-17/journey-establishment-r231-gate.log` —
**334 passed, 6 failed in 587s, 0 attributable.**

- 4 standing failures, identical files/messages to r230/r141:
  `test-measurement-proof-update.js` +
  `test-measurement-workflow.js` — measurement-proof staleness
  pair (retained neutrality proof); `test-phone-frame-proof.js`
  — phone-frame receipt staleness (3 fails); `test-ladder-bundle-
  20261108.js` — same control fail (200 monster turns WITHOUT
  delivery fire the ambient raid — fires 0).
- 2 load timeouts (exact 120s), both PASS standalone WITH logs:
  living-garden 8/8, one-person-army 7/7.
- Notably GREEN in-gate this run (both failed on r230/r141):
  measurement-cache-flags and trust-observer-neutrality, and
  occupation-panels (80s, slowest, passed) — the load-artifact
  rotation, confirming the standing profile is load-driven, not
  code-driven. Gate GO for adoption.

## Closeout
[TBD — merge/release/rotation/lock after the evidence commit.]
