# Journey crisis r253 — RUN NOTE (Lane B, leg 6) — ADOPTED CLOSEOUT

**Run:** `playtest2-20261120T0105Z` (scheduled Thu 2026-11-19 19:00 CST / Fri
2026-11-20 01:00Z), crisis (6), seeds 14561–14565, base `1cb6ce2e1`, policy
oracleV2, 150d death-aware +10d tail. Prereg:
`evidence/2026-11-19/journey-crisis-r253-prereg.md` (committed `953e1e3ae`).

**Adoption chain (this closeout run `playtest2-20261120T0400Z`):** the 0105Z
coordinator timed out during closeout; adoption worker `a374239c` (01:59–02:52Z)
verified verdicts complete but closeout BLOCKED on the host write flap
(verified real, still active 02:57Z). The 0255Z occurrence created lock
`playtest2-20261120T0255Z` at 02:57:25Z and then died — no registry entry, no
live coordinator agent, no live process, no file activity in the tree since
03:30Z; the `journey2-crisis` heartbeat at 03:41:53Z was the post-restart
(VM restarted ~03:41Z, uptime 18 min at check) re-stamp, not live work.
Stale-lock recovery per the overlap guard: lock deleted 03:59:43Z after
run_id verification in the same call; this run's own lock
`playtest2-20261120T0400Z` created 04:02:56Z. The r253 fixes + proof tests
were still uncommitted in the worktree; this run verified them RED/GREEN
from files, rebased onto master `ae33e03b3`, re-ran all proofs, and lands
them here. No fresh panel was run: r253's panel on the fresh band completed
with verdicts, and the stranded closeout was the work.

## Panel verdict: GO — r247's verdicts hold on the new base

Verified from the analysis log + per-seed JSONs in goal hidden_files
`evidence/2026-11-19/` (not from any worker's word):

| seed | days | end | raids | gorge | sorties | convos | alive | pantry |
|------|------|-----|-------|-------|---------|--------|-------|--------|
| 14561 | 150 | horizon | 9 | 86 | 6 | 8 | 4 | 0 |
| 14562 | 132 | game-over | 10 | 56 | 5 | 8 | 1 | 0 |
| 14563 | 148 | game-over | 12 | 70 | 15 | 8 | 2 | 0 |
| 14564 | 143 | game-over | 10 | 83 | 11 | 8 | 1 | 0 |
| 14565 | 150 | horizon | 12 | 34 | 6 | 8 | 3 | 600 |

- Raids fired on all 5 seeds; fought resolutions present on all (9–12 each).
- DRY census: 0 dry lines, deflect_q 0 — DRY3/DRY2/R238-DRY CONFIRM GO.
- Titan gate: 195 refused outcomes, 30 gate refusal lines, **0 repeats**
  (≤1 per titan per day holds); spoken "you have 0" honest on every line.
  Field slays: Florencia d112 (14561), Nadia d80 (14562), Carlos d97
  (14563), Katarina d68 (14565) — villagers do kill the Herald in the field.
- DeathCleanup: 7 cleanups, **0 dead-holder entries**, 0 unseeded, 0
  ignition-after-death. Plan seeds 6 (main panel).
- Fight-1: okSorties 30, cleared 19, multiMonsterCleared 16/25. Cleared
  max vTaken 65 — the standing Q4 trigger (cleared fight-1 with vTaken ≥ 70)
  did NOT fire.
- Softlock seeds 0. Stranger panel VACUOUS (kills 0, silent 0).
- Medicine: 0 acquisitions on the main panel (S3 = 0) — the supply did not
  move with no lever landed, as expected. RUINROAD stays 0/317 cumulative.
- PS4 side-arm (substrate on, seeds 14561–14563): **trios 3, quads 3 on
  14562** — the PARTYSIZE4 substrate reaches the crisis band on 1 of 3
  seeds, same as r247. Plan seeds 26, deathCleanups 30, 0 dead-holder.

## Village assessment (plain words)

Two villages out of five made it to day 150; three died in the 130s–140s,
each down to one or two living people — the hunger wall, same shape as r247
(4/5 game-overs there, 3/5 here), not a siege-mechanic failure. Every
village was raided 9–12 times and fought back every time; the gorge nights
(34–86 per village) are the long grind, not the killer. The pantry sat at
zero on four of five villages at census — food is the wall, and the one
village with 600 kcal left (14565) is also one of the two that survived.
Four different villagers killed the Herald in the open field, which is the
brightest line in the panel: the village can win a fight that matters, just
not often enough to outrun hunger. Parties of three and four do form and
launch on the crisis band when the substrate is on (14562), but only on one
seed in three — the launch drought is still the binding shape, same as r247.

## People check (C3)

40 driven transcripts, fabricHits 0. Read in full by the r253 coordinator;
spot-checked first-hand this run: seed 14561 d31, Darius Petrov. Darius
opens with a real question ("What do YOU think actually happened to us?"),
presses it ("Are you going to stay? With us. For real."), and the ending
resolves — "Good. We're better with you here. I mean that." The NPC wants
something (an answer, then a commitment), the options engage or deflect it,
and nothing is fabricated. One small wrinkle, not a failure: the recap
after the stay-thread still names the original theory thread ("we're still
on what you think happened to us") — honest, just a beat behind the
conversation. No dry lines, no filler loops, no static menus in the read.

## Blanks filled (2 fixes, both landed here)

**1. March-gate refusal spam (r233 class).** The Commercial Break march gate
said its full refusal paragraph on EVERY attempt while the muster stood
short — the PS4 arm heard it 10× on one day (14562 d103). The Herald titan
gate got the r233 once-per-day fix; this sibling gate never did.
Fix (`src/js/finale-campaign.js`): record the refusal day in campaign state
(`Game.state.titans.campaigns.finale`, same home as `started`, saved with
the run) and say the line only when the day differs. The refusal still
stands on every attempt (return null); only the spoken line is deduped.
Proof `scripts/test-finale-march-refusal-once-per-day-20261119.js`: RED
3 failed (said 4× across the staged days) → GREEN 7/7.

**2. "The The" antler-thrash regression (r249 fix, 26772ac93).** Panel seed
14563: "The The Bright Bastard thrashes its antlers at you." The village
had named the gallowdeer "The Bright Bastard" (a proper name carrying its
own article); `tbAntlerThrash` composed "The " + name blindly, guarding
only the "something" case. The `articlePhrase` class fix exists and the
sibling sites already use it; this site was missed.
Fix (`src/js/game.js`): compose via `articlePhrase(mn, true)` — proper
names stand bare, lowercase descriptors take "The ". Damage label keeps
the name whole.
Proof `scripts/test-antler-thrash-the-the-20261119.js`: RED 3 failed
("The Headlight Harry") → GREEN 7/7.
Re-run after rebase onto `ae33e03b3`: march 7/7, antler 7/7, titan-refusal
proof (`test-titan-refusal-have-counts-haven-20261119.js`) 15/15.

## Reachable / fun / winnable (leg 6, crisis)

- **Reachable:** yes — raids, gorge nights, sorties, funerals, titan
  refusals and field slays all fired on ordinary seeds with no staging.
- **Fun:** yes, with the same caveat as r247 — the fights and the talk are
  alive (a villager killing the Herald in the field is a real beat), but
  the long grind is hunger, and hunger is a slow way to lose.
- **Winnable:** not yet, same as r247 — 2/5 villages reached the horizon
  and none took a seat on this panel; the wall is food + launch drought,
  not a broken gate.

## Metric review (§14)

- D1/DRY3/DRY2/R238-DRY: all GO, 0 dry lines — the binding bars held.
- Titan-refusal (thread 12): GO, 0 repeats, counts honest; the strict
  per-line spoken-vs-gate equality check still wants muster composition
  persisted at outcome time (driver instrument, future run — carried).
- C3b settled-favor: adjudicated by the r253 coordinator/adoption read
  (fourth wild panel); no false settlement surfaced in the analysis log.
- Q4 trigger (cleared fight-1, vTaken ≥ 70): not fired (max 65).
- Telemetry baseline units (crisis.json: sum or mean?) still open — report
  per-seed values + the 5-seed sum (see Telemetry below).
- PS4 deltaBad anomaly: did not recur (closes as non-recurring, carried
  from r247).
- Link-accept ECHO: fifth panel, still 0 raises — coverage note, stays open.
- HOMEBODY / NOTICKDEFER: descriptive-only, retired. FLEEREPAIR3 /
  WILDAVOID: still unmeasured, no instrument.
- funeralMendStats counters still NOT persisted in per-seed JSON (r247
  metric review 8, carried).
- 14553's census reads extinct=False with aliveCount=0 (r247 review 13)
  and Joko's d50 death absent from the census corpse list (r247 review 10)
  — census-owner looks, no panel impact, carried.

## Base movement at merge (1cb6ce2e1 → 0edff1f59)

25 commits to `55770a359`, the Lane A r245 landing, plus 5 bowknow commits.
TWO touch live behavior under the default panel, both postdating the r253
panel, so the panel verdicts stand on `1cb6ce2e1`:
(a) **SEARSUPPLY lever (6c4b75925, src/js/contests.js +66, src/js/game.js
+12)** — contest-prize redirect to fight-proven villagers, searcaster
bundles 2 cells, tier-4 cell weight x4 [needs-eyes].
(b) **BOWKNOW mentoring (eaf530d6a, src/js/villager-build.js +60)** — a
bow-knower at home teaches spear-holders (finding #2590 serve half);
prereg + proof 19/19.
The proof tests were re-run GREEN on the merged base after each rebase.
The rest is evidence/scripts only (searsupply prereg/evidence, winnability
round record, scale-onramp adoption, deadtarget/laterage/spearstage/
fusioncell diagnostics, bowknow prereg/analyzer/driver/evidence) plus the
r245 deepening run note + gate log. Canon unchanged (`git log` on the canon
docs empty since r247, per prereg).

## Gate

`node scripts/check.js --quick` in the worktree: **337 passed, 7 failed in
901s** — see `evidence/2026-11-19/journey-crisis-r253-gate.log`. 5 of the 7
are identical to the r245 gate on clean master (measurement staleness pair,
phone-frame stale receipt, 2 deed-attainment 120s timeouts — pre-existing,
0 attributable). The 2 new ones under the 4-parallel gate — cache-flags
(87s) and occupation-panels (120s timeout) — both pass standalone WITH the
fixes (4/4, 25/25) and WITHOUT them (4/4, 25/25): parallel-load flakiness,
not this diff. **Gate verdict: 0 attributable.**

## Telemetry

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/crisis.json
--current '.../evidence/2026-11-19/journey-crisis-r253-delayed-seed*.json'
--metrics defendedFights,playerFights,latelyDefenseCount`:
**quiet (7 files, 3 metrics, no large deviations)** — no LOUD lines.
Baseline NOT rolled (single-panel variance, per prereg).

## Closeout

- Rotation-b: read 6 at run start; this run writes **7** at closeout
  (succession next).
- Lock: stale `playtest2-20261120T0255Z` recovered (see top); own lock
  `playtest2-20261120T0400Z` deleted at closeout with run_id verified in
  the same call.
- Merge: `journey2-crisis` ff-only into master, merged locally, pending
  ship. No version bump, no push, no live verification (ship loop owns it).
