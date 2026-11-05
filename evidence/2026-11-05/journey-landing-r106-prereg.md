# journey-landing r106 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon to d28)

**Run id:** laneA-20261105T1847Z (scheduled 12:45 CST 2026-11-05).
Rotation read 0 → leg 0 LANDING; wrote 0→1 at run start, verified by read-back.
**Base:** master@5ffbdaa1a at run start (`git pull` already up to date; main tree
NOT clean — 1 untracked sibling file evidence/2026-11-05/sim-adoption-round-1715.md,
left by the finished Loop A adoption run fleshout-20261105T1715Z; proceeded per
workspace lesson — untracked sibling evidence cannot be swept by private-index
commits or an ff-only merge of this run's branch; file untouched, see run note).
Disk 31%.
**Numbering note:** the Lane A counter is global across legs; r105 (landing) was last, so this run is r106.
Driver: scripts/journey-landing-r106-20261105.js (r105 driver + R106-ARMS-WHY
instrument below; diff-verified at run start: only header, seeds, OUTDIR, and the
R106 blocks differ — zero policy change).
Analyzer: scripts/analyze-landing-r104-20261105.js (+ R106 precond reporting).
Fights: scripts/analyze-fights89-20261102.js (unchanged, dir-as-argv).
Shape test: scripts/test-landing-r94-shape.js (unchanged) + scripts/test-landing-r104-rescue-goaround.js (unchanged, re-run against the r106 corpus as a regression check).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or gate change in this run. **Perception law (2026-10-28) stands** — all instruments read-only; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** a code change lands ONLY if a defect is proven in game code (not driver policy) with a before/after proof test; otherwise document and move on. This run carries NO planned code change.

## Q1 (PRIMARY) — WHY ARE THE WIN-PLAN ARMS SILENT? (conditions vs reachability)
**Why this run, why now:** r104 + r105 proved the win-plan system bites in the
first fortnight ONLY through its party/hunt arms (r105 d28: planSeeds 16,
partyInvites 15, partyDepartures 15, partyWaits 50, partyFights 74, holders 18).
The other arms were DEAD SILENT across 20 seeds on two panels: gearHolds 0,
bondTends 0, avoidances 0, seekContacts 0, standingContacts 0,
veteranGuardHolds 0, musterStanddowns 0, trickHolds 0. r105's metric review
explicitly named this run's question: do those arms' conditions ever arise
before day 28, or are the stages unreachable that early? Code-read (src/js/win-plan.js)
gives the preconditions, and this run instruments them rather than re-counting zeros:
- gearHolds: plan in 'gear' stage at a departure tick, holder unarmed AND unarmored after villagerGearUp. Reachable in principle in landing (plan-holders exist).
- veteranGuardHolds: plan in 'table' stage + living wave-4 killer. Needs a wave-4 kill + fifth-draft beat — expected structurally unreachable before d28.
- trickHolds: wave-4 fight + hunt/standing plan + full geared party + trick unknown. Expected structurally unreachable (no wave-4 fights in landing).
- standingContacts / seekContacts: hunt/standing plan + isTarget (wave == needWave [3/4, only when a defer beat names veterans short] OR plan.target match [set only by a wave-3+ fight seeding] OR standing stage + wave>=3) + partyOk (>=2, all armed; w4 needs >=3 + all armored). Only reachable via a wave-3 fight with a party — rare (1 in r105).
- bondTends: >=2 own primary links (prims), actor at Haven, pantryDays >= 3, a link trust < 50 untended this week. Regional links form in deepening (days 40+) — expected prims == 0 in landing, structurally unreachable.
- musterStanddowns: herald muster active + (seasoned links >= 2 or polity) + weakest trust < 55 + hunger + committed actor. Post-landing system — expected structurally unreachable.
- avoidances: wave>=4 (outmatched) or table-stage veteran vs wave>=3 — expected structurally unreachable in landing.
**Instrument (R106-ARMS-WHY, driver-only, read-only):** winPlanSnapshot extended
with a `precond` block at d14 and d28 — stage histogram; per gear-stage holder:
armed/armored (gearOf replicated read-only via Scattering.equipment + carried-weapon
scan; NEVER via Game.winPlanOf, which seeds on read); own-primary-link count
(hierarchyState filter primary==='haven'); herald muster presence
(titanMusterState('herald')); defer-beat presence (state._standingDeferBeat
beat[4]/beat[5]); wave-4+ kills (state.waveKillLog); table-stage plan count.
Fight wave histogram comes from the existing fight analysis.
**Pre-registered metrics (binding):**
- M-A1 (gear): if any gear-stage holder at d14 or d28 is unarmed AND unarmored,
  the gearHold precondition DID arise — 0 gearHolds then means the depart gate
  never ran for them (gate-side, name it). If every gear-stage holder is
  armed-or-armored at both snapshots, villagerGearUp arms them first and
  gearHolds is unreachable-by-construction in landing (report as such).
- M-A2 (structural): prims == 0 AND muster == null AND wave4kills == 0 AND no
  table-stage plans at d28 on all 10 seeds = bondTends / musterStanddowns /
  veteranGuardHolds / trickHolds / avoidances are STRUCTURALLY UNREACHABLE in
  the landing window (design answer, not a defect). Any counterexample
  (prims > 0, muster present, wave-4 kill, table plan) is named, and that arm's
  silence becomes a live question instead.
- M-A3 (seek/standing): count wave>=3 fights in the panel; if >=1 wave>=3 fight
  involves a plan-holder in hunt/standing stage with a party >= 2 armed beside
  them, the seek/standing precondition arose — 0 contacts then is a live defect
  question. If 0 such fights, the precondition never arose (unreachable that panel).
- A miss on any M-A metric is NO-GO, never re-scored against a friendlier metric mid-run (metric review below if the metric proves wrong).

## Q2 (PRIMARY) — R104-GOAROUND AT PANEL SCALE (M7 REVISED)
**Why this run:** r104's creek-pocket fix (bridge + BFS detour rungs) proved on ONE
seed's replay; r105 at panel scale: 3 arrivals / 3 skips = 100% but all three via
first-travelTo — the bridge/detour rungs did NOT fire, so they remain proved only
on the r104 replay, not at panel scale.
**Pre-registered metrics (binding):**
- M7-r106 kcal: arrived / kcal-skips >= 80% = GOAROUND-HOLDS; < 80% = GOAROUND-WEAK (name the failing seeds/days and the rung that stopped: bridge-skipped, detour:no-onboard-path, or other).
- M7-r106 water: still UNTESTED unless a wild water skip fires (see Q4).
- Rung fires (bridge / detour / no-onboard-path) reported as counts with seed/day.

## Q3 (CARRIED) — DOORSTEP-OUTINGLIVE REGRESSION
r104 proved the branch a third time at panel scale; r105 carried it GO (279 checks,
2 triggered, 0 refusals, 0 class-E scholar starvation deaths). Carried as a
regression check: M6 clauses hold (complete eatRecs on triggered steps; 0 class-E
scholar starvation deaths; 0 triggered steps ending enterResult===false).
Includes the R105-DOORSTEP-DRINK-ENTRY fix (door step now enters on needEat OR
needDrink; `filled` records only bottles actually gained).

## Q4 (CARRIED) — WATER CLAUSE, STILL UNTESTED
0 wild water skips since r87 (now seventeen runs deep). Record wild outing
iterations + min hydration; if 0 wild water skips again, stays UNTESTED. Not a
re-proof — a standing blind spot, reported, not chased by changing the panel.

## Carried bindings (r105 verdicts, re-judged fresh)
- **M1 ALIVE-D14: 10/10** (no village lost by day 14).
- **M2 SYSTEM CONTACT: 10/10** (first contact ~day 8).
- **M3 FIGHT-LOG:** all hunt fights complete, 0 unknown/mixed trigger.
- **M5 PEOPLE:** wind-down picks, WD probe gates, betrayal held-offers 0, party invites spoken/dry; two full transcripts read for sense (SENSE-TESTING LAW).

## Watch items (not verdicts)
- **R70 never-waited at dawn:** r105 found favors exist but the scholar NEVER waits
  at dawn on 3/10 seeds (partner inside the hall, scholar told to go through the
  door). Record the count; if it recurs on >=3 seeds, name it as a carried friction.
- **R73 NARROW-PATTERN:** promised favors mostly break on 1-day windows (r105:
  16 NARROW, 4 KEPT, 11 BROKEN, 1 OPEN). Design input, carried.
- **Steve's XP/ABILITIES+GEAR direction (2026-11-05 07:09 CST):** build queued
  (XP coverage + synergy bonus + gear protection retune) may change what gear means
  in the landing window before r106 runs. Read M-A1 alongside it: the gear-arms
  silence finding is about the win-plan gear-check arm never firing, not about
  gear bars. No verdict in this run changes; no work in this run touches that build.

## Seeds, pilot, shape
- Panel: fresh seeds 887–896, DAYS=28, OUTDIR landing-r106 (goal hidden_files evidence/2026-11-05/landing-r106).
- PILOT FIRST: 3 seeds (887–889) before expanding. If Q1 shows nothing interesting in the pilot (0 silent-arm events AND 0 planSeeds at d14 on all three), document and still run the panel only if the carried bindings need the panel — the pilot decides; do not burn a full run on a dead question.
- Shape: pilot validates the ARMS-WHY instrument is read-only (planSeeds before/after instrument reads on a replay seed — same check as r104) and that the precond block populates (no nulls on live fields).

## Metric review (filled at closeout, never mid-run)
- (to be filled)
