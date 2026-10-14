# ARM 3 "fourthlink" — where the 4th link dies (scale-onramp, points-throughput lens)

Worktree: `~/workspace/worktrees/sim-fourthlink` (registered; sibling trees sim-scholartrick/sim-mantlebeat live).
Run: oversight-flesh-out-loop-b, run 2026-10-14T01:29:29Z. Stale-lock recovery: n/a (fresh claim, live run).
Commit under test: worktree tip f0f76f56 (fusion singularity). No game-code changes — policy layer + instruments + evidence only.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE any sim

- **Question**: r19 wave5-confirm found diplomacy saturates at 3 seasoned links
  (102 pts); nobody seasons a 4th — even the d149 longest survivor sat at 102
  for 71 days. Why does no 4th link ever season?
- **Phase 1 (DIAGNOSE)**: instrument the link pipeline on leadcourt/belongseek
  (proposals, accept/counter/decline, seasoning progress per link, caps) on
  unmodified code. Diagnostic GO: the instrument names WHERE the 4th link dies
  with per-run numbers (never proposed / proposed-but-declined /
  accepted-but-never-seasoned / cap-blocked), on ≥6/8 seeds per policy.
- **Phase 2 (LEVER, only if bind is policy-side)**: new `scripts/policies/`
  layer, opt-in `FOURTHLINK=1`, default OFF, removing the policy-side bind
  with honest verbs only. If the bind is ENGINE-side (link slots, season math,
  trust mechanics): NO lever — file as steve-call in sim-findings.md, arm
  becomes a diagnostic KILL (evidence-only commit).
- **Primary metric (lever phase)**: seeds where a 4th link SEASONS
  (30+d, trust 40+) — GO ≥2/8 pilot seeds vs 0/8 identical-seed baseline.
- **Guardrail**: median survival within ±10d of identical-seed baseline;
  wall metrics (national/table/wins, wave-4/5 unlocks) no regression.
- **Horizon**: 180d death-aware (Steve's WIN-PATH HORIZON 180).
- **Seeds/policies**: 11/22/33/44/55/66/77/88 × leadcourt/belongseek,
  identical-seed before/after. Baseline run in this tree on unmodified code.
- **Proof**: `scripts/test-fourthlink-20261014.js` — REAL RED phase
  (instrument records the pipeline honestly; lever gate off = baseline).

Metric binding (§14): a miss is NO-GO, never re-scored against a friendlier
metric mid-run. Doubts go under "metric review" for the NEXT run.

## Phase 1 — DIAGNOSIS (instrument: scripts/link-pipeline-20261014.js)

**The 4th link dies at the proposal stage — it is never proposed.**

Baseline (16 runs, unmodified code, instrumented, `evidence/2026-10-14/sim-fourthlink-base.json`):

| | proposals (a/c/n) | window-open | cap-blocked | formed | seasoned | 4th formed | 4th seasoned |
|---|---|---|---|---|---|---|---|
| baseline | 29 (24/5/0) | 200d | **178d** | 28 | 19 | 0/16 | **0/16** |

- leadcourt's `leadCourtship` returns early at `subs >= 3`
  (scripts/policies/leadcourt.js). The cap fired on **178 of 200
  proposal-window days** — s44 sat 51/52 days, s55 55/56, s77 35/36, s88
  34/35 with known, unlinked villages to court (window.open requires
  candidates) and simply never knocked. Diagnostic GO met: the bind is
  named with numbers on 8/8 leadcourt seeds.
- It is NOT declined: proposals accept **24/29 (83%)**, 0 declines (5
  counters, all answered).
- It is NOT unseasonable: **12/12** lead links that reached age 30 seasoned
  (season day = formed+29/30 exactly; trust at day 30 was 44–97 vs the 40
  bar). The `_linkSeasoned` math (30d + trust 40+) is not the bind.
- It is NOT tend-starved: 177 tend weeks recorded; the tend gate
  (pantry>20000) held on every surviving run.
- The engine has no link cap: `proposeLink`/`judgeLink` score the 4th
  proposal exactly like the 1st (no link-count term); `_linkSeasoned` is
  direction-agnostic. **Bind is policy-side → lever justified.**
- belongseek: single-link by design — it breaks its bond before re-courting
  (rideConsolidator), so it never holds 2 concurrently. Its links season
  fine (formed d21 → seasoned d50 on 5/8 runs; s44/s55 each seasoned 2
  sequentially after a switch). A 4th link on the BELONG road means Haven
  belonging to 4 primaries at once — a design question for Steve, not a
  lever. Filed in sim-findings.md (open).

## Phase 2 — LEVER (scripts/policies/fourthlink.js, FOURTHLINK=1, default OFF)

The lever: `leadCourtship` copied verbatim from leadcourt.js with ONE change
— the `subs >= 3` cap removed. Same day-25 gate, same pantry>12000 proposal
gate, same 7-day per-target cooldown, same weekly tending (pantry>20000),
same counter answers, same engine verbs with real pantry costs. Gate off:
the module exports leadcourt itself (proof R2). No engine edits.

Armed (16 identical-seed runs, `evidence/2026-10-14/sim-fourthlink-armed.json`):

| | 4th formed | **4th seasoned (PRIMARY)** | proposals | formed | seasoned | tends |
|---|---|---|---|---|---|---|
| baseline | 0/16 | **0/16** | 29 | 28 | 19 | 177 |
| armed | 5/16 | **4/16** (leadcourt s44/s55/s77/s88) | 37 | 36 | 23 | 344 |

- **PRIMARY: 4/8 leadcourt seeds season a 4th link vs 0/8 baseline → GO
  (≥2/8) MET.** The 4th links seasoned honestly: s44 d46→s75 (trust 70),
  s55 d29→s58 (trust 49), s77 d54→s83 (trust 75), s88 d30→s59 (trust 84) —
  all via the real 30d+trust-40 season math, all tended weekly.
- s33's 4th formed d37 but the village died d51 — the mortality wall, not
  the mechanism. s55 courted 6 villages total (L5 d49, L6 d62 formed; died
  d89 before they could season).
- Guardrail: median survival **72d = 72d** (leadcourt 84 vs 83; belongseek
  72 vs 72 — belongseek trajectories byte-identical baseline→armed, as the
  lever doesn't touch it). ✓ within ±10d.
- Wall: national 5/16 vs 3/16, table 0/16 = 0/16, won 0/16 = 0/16, wave-4
  5/16 = 5/16, wave-5 0/16 = 0/16, max Standing **161 vs 109**. No
  regression — the lever strictly opened the diplomacy ceiling (102→136
  on 4/8 seeds; s77 hit 161 = war 25 + dip 136, the highest courtship-road
  Standing measured).
- The old cap's counterfactual: 6 days where the baseline cap would have
  fired; proposals continued instead (window-open days fell 200→28 because
  candidates deplete as villages get courted — the mechanism working).

Proof: `scripts/test-fourthlink-20261014.js` 12/12 green — R1 instrument
honesty (seed-11 60d with/without instrument: identical days, Standing,
links — the wrappers consume no RNG), R2 gate-off = leadcourt itself, R3
pipeline records, G1/G2 gate-on removes the cap and keeps proposing.

## Village assessment

Baseline villages court their 3 villages in the first week the window opens
(links form d26–31, accept 83%), tend them into seasoned bonds by d55–58
(wave-4 unlocks d57–58 on the diplomacy driver), then sit at 3 bonds for
35–55 days proposing nothing — the diplomacy engine idles while the
proposal window stays open. With the lever, villages keep courting every
known village (up to 6 on s55), tend 4–6 bonds weekly (94–98 tends on the
long runs), and Standing climbs to 136–161. The villages that die early
(s11/s22/s66, d35–45) never get past 1–2 links — there the mortality wall
binds first, and no diplomacy lever can help. Tending 4+ bonds costs real
grain (1500 kcal/link/week) and the pantry carried it on every surviving
run — no starvation signal from the lever (survival identical).

SENSE-TESTING: the link narratives read sensibly — s44 courts a 4th village
3 weeks after its first three bonds, tends it 5 weeks, seasons it at trust
70 on d75. A village that keeps building its court after the first bonds
mature is exactly what the LEAD road promises. Counter-formed
Haven-subordinate links (s11/s33 baseline) sit untended at trust 45 and
never season — leadcourt has no tribute-paying for them; they're dead
weight, not Standing (noted, not chased — a policy-hygiene question for a
later arm).

## Blanks filled / documented

- **Filled**: the 4th-link bind — diagnosed (proposal cap, 178/200 blocked
  days) and levered (uncapped policy layer, GO 4/8 vs 0/8, guardrails clean).
  Lever lands as `scripts/policies/fourthlink.js` (opt-in, default OFF).
- **Documented** (sim-findings.md, not chased): (1) BELONG multi-primary
  design question; (2) spec/implementation discrepancy — the spec says "+34
  per seasoned regional+ link" but `standing.js` counts ALL seasoned links
  with no regional filter; (3) late-link trust lag — s55's 5th link (formed
  d49) sat at trust 24 on day 30 despite 9 tend weeks: thin-tribute trust
  decay (-1/-2 per short week in `linkTick`) outran tending late in the run.
  Honest engine friction; may cap how many links season before subordinate
  fields run dry.

## Metric review

GO met cleanly (4/8 ≥ 2/8, baseline 0/8). No re-scoring, no revision needed.
One nuance for the record: the pre-reg's "pilot (8 seeds)" ran as 8 seeds ×
2 policies = 16 runs; the lever touches only leadcourt (8 seeds) and
belongseek served as the unchanged control (byte-identical trajectories
confirmed baseline→armed). The primary metric counted only leadcourt seeds,
as pre-registered ("4th link SEASONED on ≥2/8 pilot seeds"). T5=200 remains
unreached (max 161) — the lever moved the ceiling 102→136, but the pure
diplomacy road needs 6 seasoned links and villages die first; war/plenty
hybrids or survival are the next binds, for future arms.

## Wall numbers (every run)

| | national | table | wins | wave-4 | wave-5 | maxStanding | medianEnd | medSurv |
|---|---|---|---|---|---|---|---|---|
| baseline | 3/16 | 0/16 | 0/16 | 5/16 | 0/16 | 109 | 0 | 72d |
| armed | 5/16 | 0/16 | 0/16 | 5/16 | 0/16 | 161 | 0 | 72d |
