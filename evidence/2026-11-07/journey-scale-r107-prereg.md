# journey-scale r107 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-20261107T1045Z (scheduled 04:45 CST 2026-11-07).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(a pilot-gate stop is not success; rotation stays 3).
**Base:** master@38aa62dce at first scored seed (includes the r113 deepening
recovery merge: Q1 driver fix + Q2 away-line fix + proofs, gate 276/14
adjudicated).
**Stale-lock recovery:** this run opened by recovering the timed-out r113
run (lock laneA-20261107T0845Z, heartbeat 09:52:09Z stale, no live process;
main session confirmed dead). r113 branch rebased twice onto current master,
proofs re-run green 18/18 + 9/9 + 29/29, gate re-run on the rebased tip
(276/14, all adjudicated pre-existing/load), note + gate log committed
38aa62dce, merged ff-only, worktree released. Rotation was already 3.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price,
nor gate change in this run.
**Perception law (2026-10-28) stands** — the instrument is read-only
(pure reads + counting wraps that return results untouched); the policy is
unchanged; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** this run is measurement with a
decision attached (see Q1) — it does not re-prove the staged-policy
diagnosis, it tests whether the scale driver behaves the same way.

## Standing context (read before scoring)

- **sim-regionalstep-b (landed this morning, 6a59ed7fe): DIAG-GO.** On the
  STAGED policy (competent-stageally-a, band 53001–53008), scale never leaves
  `village` because nobody ever asks: villages known by day 3–5,
  courtship-ready the same day, would accept outright from ~day 9 — and
  `proposeLink` is called **0 times on all eight seeds** (931/940
  no-regional days courtship-no-attempt, 99.0%). The gate chain works as
  designed; the policy simply never walks up to it. The named lever is a
  link-forming drive — propose, and answer the link raises villagers
  already bring.
- **Loop B is building that lever in parallel right now**
  (sim-linkdrive-b, registered 11:11Z, staged substrate 53001–53008).
  This run does NOT build a lever. It measures the OTHER driver: does
  the scale leg's competent player ask? If the scale driver also never
  asks, the policy gap generalizes beyond the staged substrate and the
  lever has two drivers to serve. If it asks, the question moves
  downstream (counter / link / seasoning / Dawn) and the lever's shape
  changes. Either answer is a finding, not a re-proof.
- **The scale driver HAS a proposeLink call site** (read, not assumed):
  `scripts/policies/scalecourt-nogate-morntrace3.js:131` — day ≥ 25, no
  pending counter/accord/national, no active links → proposeLink to the
  first known, unlinked candidate (7-day cooldown per village). With
  links it pushes covenant/trade at opinion ≥ 10, climbing first via
  pilgrimage + codex study. So the scale driver is wired to ask for the
  FIRST link — the question is whether the wiring ever fires on a fresh
  band, and what happens when it does.
- **r106 (95911–95914): control stages national/global on 95914**
  (covenant, national d80, global d81) — so on that band the scale driver
  DID get links (the first proposeLink must have fired, or a raise was
  answered). Q1 was INSUFFICIENT-DATA (control dry 0). The arm fired only
  on 95914. Realm dissolve / re-stage is a new shape in the scale line.
- **r105 (95901–95904):** arm seed 95901 lived +54 days and staged the
  FIRST national (d77) and FIRST global (d78) in the r102–r105 scale line;
  control 0/4 national/global. Fill-arm decision cannot rest on one quad.
- **Wall carried:** no full seat, no wave-5 content faced, no kill claimed
  on any seed in the scale line. One global staging is a rung, not a win.
- **V-INIT-BOND is live in this base** (landed 2026-11-06): villagers
  propose bonds and raise village-link ideas; targets decide by character.
  Link raises are counted by the recorder (pending + decided/expired +
  whether the raiser was talked to in the 2-day window), report-only.
- **Q2 away-line fix is live in this base** (r113, merged 38aa62dce):
  the commit-site refusal keeps refusing but the words are true
  face-to-face; the action-site away block is presence-gated. Transcripts
  on this run are read against the fixed wording.

## Q1 — DOES THE SCALE-LEG COMPETENT PLAYER EVER ASK? (binding)

Attach the regionalstep recorder (`scripts/regionalstep-instrument-20261107.js`,
require — not a copy) to the journey-scale driver (r106 driver cloned,
labels/seeds/EVIDIR only; policy `scalecourt-nogate-morntrace3` UNCHANGED,
control shape TEND_PEER=0, FILL_ARM=0). Fresh band **97001–97004**
(freshness: grep over all dated preregs + forbidden-band lists + full-corpus
seed-context grep — zero seed uses; the only raw-substring hits are float /
kcal values, e.g. `188.320970042796`, `"pantryFreshAfter":97004`, not seeds;
bands 95701–95704 and 95801–95804 were checked first and REJECTED — both
appear in Oct 17–23 evidence). DAYCAP=180, death-aware stop.

Classify every no-regional day by the first failing link in the regional
chain (know → courtship → attempt → counter → link → gesture → seasoning
→ dawn), same `classifyGate` rule as the instrument and analyzer.

**Verdicts (checked in order, band-wide):**
- **ASK-HAPPENS** — `proposeCalls ≥ 1` on ≥1 seed. Report the downstream
  gate per seed (counter-unanswered / attempted-no-link / link-young /
  seasoned-no-dawn / Dawn fired), the first-attempt day, and whether a link
  formed and seasoned. This moves the question downstream of the ask.
- **CONFIRMED** — courtship-no-attempt explains ≥80% of no-regional days
  band-wide AND `proposeCalls = 0` on every seed that ever had a
  courtship-ready village. The policy gap generalizes to the scale driver.
- **GAME-GAP** — known-no-courtship dominates (no village ever
  courtship-ready on the band). The door is shut, not unknocked.

**What counts as interesting:** any seed where the ask fires (the downstream
story is new for this driver); a CONFIRMED verdict on a second driver (the
lever then serves two drivers, and the staged-policy diagnosis is not a
substrate artifact); a GAME-GAP (the courtship preconditions, not the
policy, bind — changes the lever entirely).

## Secondaries (report-only, not judged)

- **National/global staging** (natGate watch, as r103–r106): rank timeline,
  shape, dissolve / re-stage, viewership at global.
- **Table approach** (tableWatch): seat priced daily, arc, tableWaiting /
  tableAnnounced.
- **Village assessment:** census in plain words — who lived, who died, what
  they knew, what was missing.
- **People check:** CONVO_DAYS [90, 120] transcripts read in full
  (SENSE-TESTING LAW) — do villagers act like people at the scale horizon?
- **D-THING / bonds / betrayals:** carried from the r106 analyzer as
  report-only counts.
- **Purity:** the recorder must not change the played game — the census on
  the pilot seed is compared against the r106 driver's shape (same policy,
  same DAYCAP); a divergence in played days / deaths / pantry beyond
  stream noise stops the run. (The recorder draws no RNG and writes no
  game state; this is a guard, not an expectation.)

## Method

- Driver `scripts/journey-scale-r107-20261107.js` (r106 clone + recorder
  install / daily snapshot / finalize + reggate txt + regional JSON per
  seed). Analyzer `scripts/analyze-journey-scale-r107-20261107.js`
  (r106 analyzer + reggate section; the regional corpus JSONs are also
  readable by `scripts/regionalstep-analyze-20261107.js` directly).
  Proof `scripts/test-journey-scale-r107-reggate-20261107.js` (wiring:
  install/uninstall round-trip, snapshot carries a gate, wraps count
  calls and pass results through; live smoke leg on a probe seed in /tmp
  asserting rows exist, every row carries a gate, instrument errors 0).
  Proof green BEFORE any scored seed runs.
- PILOT GATE: seed 97001 runs first. Crash, recorder errors > 0, or a
  reggate file with 0 rows → STOP, do not score the band.
- Telemetry: `telemetry-check.js` against `telemetry-baselines/scale.json`
  after evidence is written (metrics: firstCourt, watchers, tableTele,
  fightsTotal, fightsByWave.4, maxGameDay). Any LOUD line is a same-run
  investigation item before the baseline rolls forward.
- **Gate note (carried, not hidden):** the full `check.js --quick` gate
  will NOT run inside this run — the r113 gate (276/14, all adjudicated)
  ran on this exact master 30 minutes ago, and this run changes ZERO
  src/js (scripts + evidence only). The gate is owed on the next run that
  touches src/js; the r107 proof tests + pilot evidence are the regression
  cover for this DIAG arm, as for regionalstep-b.

## Pre-registered metrics (bind the run — §14)

- PRIMARY: per-seed gate tally (share of no-regional days by first failing
  gate) + `proposeCalls` + `acceptLinkRaiseCalls` + first-attempt day +
  first-link day + Dawn fired (y/n/day). A miss is NO-GO, never re-scored
  against a friendlier metric mid-run.
- SECONDARY (report-only): nationalLive / globalLive day + shape, seat /
  arc at end, survived days, pop alive/end, D-THING named/testable,
  bond sittings answered, transcript senseless count (must be 0 to claim
  the people check clean).
- Every run note carries a "metric review" section; if a metric proves
  wrong, the revision is proposed for the NEXT run.
