# journey-landing r112 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon to d28)

**Run id:** laneA-20261107T0359Z (scheduled 21:45 CST 2026-11-06, started ~04:00Z).
Rotation read 0 → leg 0 LANDING; wrote 0→1 at run start, verified by read-back.
**Base:** master@0d3c46971 at run start (`git pull` already up to date at
06b2ecb42; master moved during registration — sim-killersurvive-b +
sim-trajfrag-b landed — so the worktree branches from the fresh 0d3c46971;
no stale-base risk, re-verified before merge). Main tree clean; disk 27%.
**Seed band 1053–1062 (fresh — see below).**
**Registration (slow, loud):** the first register attempt died silently
(session lost, no worktree/branch/registry entry left behind — verified
before retrying); the retry ground ~10 min (reap + 7.6G checkout) and
completed exit 0. Heartbeat at registration + 10-min loop.
**Numbering note:** the Lane A counter is global across legs; r111 (landing)
was last, so this run is r112. The last landing run was r111.
Driver: scripts/journey-landing-r112-20261107.js (r111 driver verbatim except
seeds 1053–1062, OUTDIR landing-r112, header, and the Q1 practice instrument
below — driver-only, zero src/js). Analyzer:
scripts/analyze-landing-r104-20261105.js (UNCHANGED except the Q2 autopsy
fallback below; the NO-ARRIVAL split + scholarDeaths breakout from r111 are
the standing lines). Practice analyzer (new):
scripts/analyze-landing-r112-practice.js. Commit-offer:
scripts/analyze-landing-r107-commit-offer.js (unchanged). Fights:
scripts/analyze-fights89-20261102.js (unchanged).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or gate
change in this run. **Perception law (2026-10-28) stands** — all instruments
read-only; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** a code change lands ONLY if a defect is
proven in game code (not driver policy) with a before/after proof test; the Q2
fix is INSTRUMENT-only (analyzer, zero src/js), explicitly named as next-run
work in r111's note. The Q1 instrument is driver-only (zero src/js). No
game-code change is planned.

## Seed-band freshness (skill: local_seed_band_freshness)
- **Chosen band 1053–1062**, verified fresh across ALL dated preregs (not just
  today's): word-boundary grep for 1053–1062 over `evidence/*/sim-*-prereg.md`
  and `evidence/*/journey-*-prereg.md` returns only incidental numbers —
  "TB bystander melt #1054" and "tbmelt census #1062" (census numbers, not
  seeds) in evidence/2026-10-27/sim-w4melt-a-prereg.md, and game.js line refs
  1055–1056 / ~1061 in two 2026-10-28 preregs — and zero prereg names any of
  1053–1062 as panel seeds. Journey preregs: zero hits.
- No corpus files for these seeds exist (the `*105[3-9]*`/`*106[0-2]*`
  filename hits are seed 1060511 and s11053–s11062 — different namespaces).
- Contaminated bands NOT reused: 897–906, 1301–1304, 917–926, 1001–1010,
  1101–1110, 1201–1210, 2001–2010, 3001–3010, 1033–1042 (r110's band),
  1043–1052 (r111's band, just used).

## Q1 (PRIMARY) — FIRST LANDING PANEL ON THE PRACTICE BUILD
**Basis:** practice-moves-competence landed AFTER r111's panel ran
(2b9b0371e, in this base; r111's panel measured the game WITHOUT it). The
roleform census baseline: competence moved 0 cells, skill moved 0→positive
for 0 villagers (8 seeds, 30 villagers, 80d — sim-practicemove-a replication,
94e30daef). The practice pilot GO: 14/16 moved at 80d. This run asks whether
ANY movement shows in the landing window (28d) — the first landing
measurement of the landed lever — and whether the funnel moves with it.
**Instrument (driver-only, zero src/js):** `practiceSnapshot()` in the r112
driver — per-villager {id, name, occ, competence[14 tasks via
Game.villagerCompetence], practice[14], specialist[5 via Game.specialistSkill],
foodXp[5], npcSkills[]} — same TASKS/SPECS lists as
scripts/practicemove-census-20261106.js. Captured at d1 (seed start, after
loadGame/setup), d14 (14th series snap), d28 (census time). Census JSON gains
`practice: {d1, d14, d28}`. Analyzer scripts/analyze-landing-r112-practice.js
counts moved competence cells d1→d14 and d1→d28 (same villager id in both
snaps; temperament is fixed per person so raw villagerCompetence values are
comparable), skill 0→positive moves, and practice reps; reports per-seed and
pooled.
**Pre-registered metric (binding):** movedCells(d1→d28) pooled across the
panel, with attribution (the moved cell's villager holds practice reps > 0 in
that task at d28, or the move is otherwise attributable in the snapshot).
GO if ≥1 attributed moved cell on the panel — practice movement is detectable
in the landing window. NO-GO if 0 moved cells on all 10 seeds — practice has
no landing-leg effect at 28d (informative, NOT a build failure; the 80d pilot
still stands, and the window may simply be too short). Report skill
0→positive count and practice reps alongside. Funnel numbers vs r111
(planSeeds, partyWaits, partyFights, monster kills, starvation deaths per
seed) are a watch, reported not judged — no binding threshold.
A miss is NO-GO, never re-scored.

## Q2 — EAMON AUTOPSY FIX (analyzer-only, zero src/js)
**Basis:** r111's note named the gap and left it as next-run work: Eamon
starved on day 28 (the horizon day) and his STARVATION line reads
pantryAtDeath='?' — no autopsy record exists for him. Mechanism (verified in
code): the driver records one autopsy per starvation death inside
checkStarvationDeaths(snap), called once per loop iteration with that
iteration's snapshot; a death landing after the last snapshot falls outside
the write. The series snap's pantryKcal and the autopsy pantryEdible are the
SAME measure (both sum pantry units × kcalEach), so the series can fill the
gap honestly.
**Fix:** in scripts/analyze-landing-r104-20261105.js, when no autopsy is found
for a starvation death, fall back to the last series snap with day ≤ death
day and print the series-derived pantry, labeled `(series dN, no autopsy)`.
Applies to both the NPC F-line and the scholar line. An autopsy, when
present, is still used unlabeled.
**Pre-registered metric (binding):**
- Proof test scripts/test-landing-r112-autopsy-fallback.js (synthetic
  corpora, runs the REAL analyzer): (a) horizon-day NPC death, no autopsy →
  series pantry printed with the label; (b) horizon-day scholar death, no
  autopsy → same; (c) death WITH autopsy → autopsy value used, no label;
  (d) non-horizon death without autopsy → last snap ≤ death day used.
  All cases pass BEFORE the panel runs.
- Back-compat run on the r111 corpus (BEFORE the panel): output identical
  except lines that previously read pantryAtDeath='?' now carry series
  values with the label. Any other line moving is a REGRESSION — stop and
  adjudicate before running the panel.
- On the r112 panel: zero bare pantryAtDeath='?' lines anywhere in the
  analysis.
- A miss is NO-GO, never re-scored.

## Q3 (CARRIED) — ENGAGEMENT REGRESSION LINES (M-PR1 / M-PR2, standing)
- M-PR1 per-seed: never-offered ≤1 sitting on ≥8/10 seeds, PLUS transcript
  adjudication of every never-offered sitting. The pooled never-offered rate
  stays reported for the record.
- M-PR2 revised: of sittings where dlg:commit was PICKED, fraction resolving
  'promised' / (picked − away-guard refusals) ≥80% = line holds. The
  away-guard share is reported separately, and all 'stated' refusals are
  explained case by case (the R72 away-guard is by design).
- M-TG RETIRED (r110 closed the thread-gate question — withdrawn-want
  deflection, n=6 pooled). If a picked-but-stage-1 case ever appears with a
  non-'want' thread, that single case reopens it.

## Q4 (CARRIED) — R104-GOAROUND AT PANEL SCALE (M7)
r108: GOAROUND-HOLDS (3/3 kcal skips); r109: UNTESTED (0 cases); r110:
GOAROUND-HOLDS (3/3); r111: UNTESTED (0 cases). Carried as a regression check.
**Pre-registered metric (binding):** M7-r112 kcal: arrived / kcal-skips ≥80% =
GOAROUND-HOLDS; <80% = GOAROUND-WEAK (name the failing seeds/days and the rung
that stopped). Rung fires reported as counts with seed/day.

## Q5 (CARRIED) — DOORSTEP-OUTINGLIVE REGRESSION (M6)
r110: DOORSTEP-GO (280 checks, 3 triggered, ate 3); r111: UNTESTED (278
checks, 0 triggered). Carried as a regression check: M6 clauses hold
(complete eatRecs on triggered steps; 0 class-E scholar starvation deaths;
0 triggered steps ending enterResult===false). Includes the
R105-DOORSTEP-DRINK-ENTRY fix.

## Q6 (CARRIED) — WATER CLAUSE, STILL UNTESTED
0 wild water skips since r87 (now twenty-three runs deep). Record wild outing
iterations + min hydration; if 0 wild water skips again, stays UNTESTED. Not a
re-proof — a standing blind spot, reported, not chased by changing the panel.

## Carried bindings (r111 verdicts, re-judged fresh)
- **M1 ALIVE-D14: 10/10** (no village lost by day 14).
- **M2 SYSTEM CONTACT: 10/10** (first contact ~day 8).
- **M3 FIGHT-LOG:** all hunt fights complete, 0 unknown/mixed trigger.
- **M5 PEOPLE:** wind-down picks, WD probe gates, betrayal held-offers 0, party
  invites spoken/dry; two full transcripts read for sense (SENSE-TESTING LAW).
- **M-R70 (closed r107):** consistency check only — live-promise dawn opps
  with waiting=false should stay explained (has-run / kept / dead promiser),
  0 genuine defects expected.

## Watch items (not verdicts)
- **Ally-accompanied hunt fights (Q2 retired r111):** r111 found 0 in 18
  fights — the scholar never hunts with allies in the first month. Carry the
  count as a watch: does it stay 0 on this panel?
- **R73 NARROW-PATTERN:** r111 promised=10, askedOnly=21, outOfWindow=0, all
  10 NARROW, keptInsideNarrow=4. Design input, carried.
- **R66 HUNGRY horizon pantry + starvation deaths per seed (r111
  metric-review proposal, adopted):** r111 9/10 HUNGRY with 6 starvation
  deaths (first famine panel in the r107–r111 line). Report starvation deaths
  per seed alongside the gate, so a famine panel reads as famine.
- **Mantle latency (owed item, r107 seed 1009):** r110 REPRODUCED a 2-day gap
  (1038 Luigi d11 → Ava d13); r111 did NOT (latencies [0,0,0]). Watch whether
  any r112 mantle pass exceeds 1 day.
- **Kill-mean trend (telemetry watch):** per-seed monster-kill mean 28.5 (r109)
  → 20.6 (r110) → 18.8 (r111). Seed mixture, not a trend. Reported, not chased.
- **Scholar-eats-first (held design question for Steve, not changed):** the
  scholar's villageMeal is drawn BEFORE villagers eat in endDay, so in a famine
  the player eats while villagers starve. Document only.
- **M-A2 design question (for Steve, not re-measured):** the win-plan arms'
  gear/bond/muster/standing stages are proved structurally unreachable before
  day 28 (r106 M-A2, re-confirmed r107/r108/r109/r110/r111). Re-proving the
  staging adds nothing (DELIVER OVER MEASURE).
- **Miriam closing-line defect (r111, NOT fixed this run):** the wind-down
  closer asserts a want settled ("Good — that foraging help, settled.") while
  the game's own thread label says the want was never finished. A src/js
  conversation fix — needs its own design care; stays flagged for a future run.
- **Context (not this leg's work):** the self-improvement-drive build is built
  and tested but not yet merged (drive64: ON 1 vs OFF 0, NO-GO on durable bar
  per sim-durablepair-a, in this base); the one-brain program proceeds
  elsewhere (build-brain-p1 active). This run measures master as-is; no action
  here.

## Seeds, pilot, shape
- Panel: fresh seeds 1053–1062, DAYS=28, OUTDIR landing-r112 (goal hidden_files
  evidence/2026-11-07/).
- PILOT FIRST: 3 seeds (1053–1055) before expanding. The pilot validates (a)
  the seed band (driver runs seeds 1053+), (b) the practice snapshots present
  in census JSON (d1/d14/d28, non-null competence maps), (c) the practice
  analyzer counts on pilot output, (d) Q2's fallback reports on pilot output
  if a horizon death occurs (not required — the synthetic proof covers it).
  If the pilot shows 0 hunt fights, document and still run the panel only if
  the carried bindings need the panel — the pilot decides; do not burn a full
  run on a dead question.
- Shape: proof test (synthetic corpora) + back-compat run on the r111 corpus
  BEFORE the pilot; pilot validates the new instrument on real output before
  the panel expands.

## Metric review (filled at closeout, never mid-run)
- (to be filled)
