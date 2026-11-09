# journey-scale r122 — PRE-REGISTER (lane A, leg 3 SCALE, pilgrim-stall fix)

**Run id:** laneA-20261109T0545Z (scheduled 05:45 CST 2026-11-09).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(a pilot-gate stop is not success; rotation stays 3).
**Base:** local master `8419eefa4` (sim-medheadcount-suite-a evidence-only
on top of r113's `5b8ff908e`). **Zero `src/js` change since r113's base
`60eb9a5bb`** (verified: `git diff --stat 60eb9a5bb..HEAD -- src/js` empty)
— the stall mechanism below is byte-identical to what r113 measured.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price,
nor gate change in this run.
**Perception law (2026-10-28) stands.**
**DELIVER OVER MEASURE (2026-11-01):** this run BUILDS the fix for
r113's carried blank #2 (the 97904 pilgrimage stall) and proves it
before/after on identical seeds. It is not a re-proof of the trade wall.

## Standing context (read before scoring)

- **r113 (2026-11-09, band 97901–97904, base 60eb9a5bb): Q1
  WALL-PROPOSE** (charter sealed 0/4; trade proposals 3/2/0/0);
  **Q2 FACES 4/4** (62 villager w4+ field fights); **Q3 OPENS + HOLDS
  4/4** (national d37/d32/d28/d45; lesser priced d46/d103/d36/d43);
  **Q4 NOT clean** (1 senseless moment: 97903-d90 gossip voice-break).
  Full seat priced 0/4. Tribute delivered 2/4 — and spends its veterans
  (design question for Steve, NOT this run's to build).
- **The carried blank this run builds (r113 LOUD #2):** 97904 ran 13
  pilgrimages, 0 studies. Every trip stalled: the pilgrim's postrace
  walk rows show `after=(4,4)` every day, distance never closing from
  5–6, trip dropped stale after 15 days, retried, stalled again. The
  village died d158 with the scholar having learned nothing from the
  road. Root cause was OPEN ("movement budget vs walk gating on the
  pilgrim side").

## Root cause — PINNED BEFORE THE FIX (this run, before-leg repro)

Repro on CURRENT master, stock r113 driver, seed 97904, DAYCAP=45,
EVIDIR=/tmp (repo-read-only; preserved as before-leg evidence in
`evidence/2026-11-09/journey-scale-r122-before/`): the stall reproduces
exactly — d28+ `walk ... after=(4,4) dist2=6`, 0 studies to d45.
A day-stamped diagnostic wrapper on `Game.travelTo` /
`Game.travelTargets` / `Game.say` (`/tmp/r122-walkdiag-97904.log`,
preserved) pins it:

- The pilgrimage's best hop from (4,4) toward village_0 (2,8) is
  **(2,5), and the d<=3 jump to it is refused by `travelTo`'s
  intermediate-blockage scan: intermediate (2,4) is a creek needing a
  bridge** (return object names it: `{kind:'blockage',
  blockType:'creek', x:2, y:4}`; the engine says so honestly — "The
  creek runs fast here — no crossing without a bridge or a swim." —
  once per pilgrim day). (2,5) itself is passable (its creek needs no
  bridge) — the jump dies on the tile BETWEEN, which the old walkTo
  never saw. Verified directly on a fresh 97904 load:
  `travelBlockage(2,5)` is null, `travelBlockage(2,4)` is the creek
  block, and `travelTo(2,5)` from (4,4) returns the (2,4) block.
- `walkTo` (scripts/policies/scalecourt-traderoad-r113.js:145) tries
  exactly ONE hop per day — the first minimum-Manhattan-distance
  target in row-major order — and abandons the day's walk on the first
  refusal (`if (Game.map.px === px0 ...) break`). (2,5) ties with
  (3,6) and (4,7) at distance 3 to the target; (3,6) is ITSELF a
  bridgeless creek, and only (4,7) (wetland) was open — never tried.
  The identical hop is retried identically for the trip's whole
  15-day life.
- **The destination itself is unreachable:** village_0 (2,8) sits on
  a creek tile needing a bridge. Exact arrival is impossible on this
  seed without bridging or the swimmer skill — so the walk must stop
  at STUDY RANGE (dist ≤ 2), where the courtship's study fires, not
  at the village tile. The old walkTo's exact-arrival goal was
  unachievable here even with perfect detours.
- Count: the (2,5) creek refusal fired **16 times** (d28–d41 + d43–d44
  after the d42 stale drop); it is the ONLY refused hop in the whole
  log; **0 `studyVillageCodex` calls in 45 days**.
- CORRECTION to r113's reading: r113's note said "capture empty
  d28–30". The day-stamped log proves the creek line WAS said on d28,
  d29, d30 (once per pilgrim day). The refusal was narrated honestly
  by the engine; the policy never acted on it. The defect is the
  policy's brittle walk, not a silent engine.
- The engine is CORRECT here: `travelTo` refuses the creek honestly
  and offers the remedies (bridge / swim / go around). The fix is
  POLICY-SIDE, in the live scale policy's `walkTo` — zero `src/js`.

## The fix (POLICY-SIDE ONLY, zero src/js)

Rewrite `walkTo` in `scripts/policies/scalecourt-traderoad-r113.js`
(the live scale policy; the frozen `morntrace3` base is untouched),
mirroring the engine's own `walkHome` pattern (`game.js`, fixall-map
slice 1a — the proven resilient walk):

1. Orthogonal one-tile steps through `travelTo` (each step checks only
   its own destination — the old d<=3 jumps also tripped the
   intermediate-blockage fan scan, a second refusal surface).
2. Each step: longer axis first, then the other axis.
3. Both axes refused: sidestep perpendicular, toward-target side first,
   never onto a tile already on this walk's path (no oscillation).
4. Stop at a caller-given closeEnough distance: the pilgrimage call
   passes 2 (study range — the courtship studies at dist ≤ 2), so the
   walk stops at the village's edge instead of demanding the village
   tile itself; the return-home call passes 0 (exact arrival).
   Stop honestly when every escape refuses (the engine names the block
   on each refusal — no new instrumentation needed; the postrace `walk`
   row already records the after-position).
5. Cap 16 steps per call (8 to cross the 9x9 + 8 for detours; every
   on-board target is ≤8 from Haven, and the scholar starts each
   courtship at Haven).
6. No resource spend: no bridge-building, no clearing, no swim
   requirement. Going around is the fix; a genuinely ringed target
   stalls honestly with the block named, and bridge/clear becomes a
   named next lever — not a silent stall.
7. `walkTo` returns `{reached, steps, blocked}` for the proof test
   (callers ignore it; contract unchanged) and is added to the module
   exports alongside the other pure helpers.

NOT fixed this run (carried, named): the same brittle `walkTo` is
duplicated in ~12 policy files (`scalecourt.js`, `competent.js`,
`scalecourt-nogate*.js`, `morntrace*.js` …). This run fixes the one
the scale leg uses; a family-wide shared helper is owed, not 12
copies. Also carried: r113 LOUD #3 (tribute spends veterans — Steve
design question), #4 (trade trust flicker — TEND_PEER lever), #5
(gossip voice-break), #6 (sayOncePerFight barrier noise).

## Q1 — THE PILGRIMAGE WALK: does the scholar reach the village and study? (binding, BUILD)

Same driver stack as r113 (trade-road policy + instruments + delivery
verb, SEATDRIVE=0), with ONLY the `walkTo` fix applied. Before = r113's
published band + this run's before-leg repro (97904 d45, 0 studies);
after = this run's pilot/confirm on identical seeds.

- **GO** — on 97904 DAYCAP=60 with the fix: ≥1 codex study completes
  (`studyVillageCodex` fires; postrace `study` row) AND zero pilgrim
  trips stall ≥5 consecutive no-move walk days.
- **NO-GO** — 0 studies on 97904, or any trip stalls ≥5 consecutive
  no-move days.
- **Guardrail (NO-GO if breached):** 97901 confirm shows a regression
  (0 studies on a d60 horizon — r113's band had 4 studies there to
  d180, first at d27); or any walk teleports (a single `travelTo`
  step moves >1 tile — asserted in the proof test); or the scholar's
  return-home walk breaks (trips end with `_returning` stuck — the
  postrace `walk` rows + `ret` flag in morntrace show it).
Secondary (report-only): studies per seed, first-study day, trips
started/completed/stalled, trade proposals by d60, detour paths visible
in the postrace `walk` rows, creek-refusal say lines per day.

## Q2 — PEOPLE CHECK (sense law)

Transcripts the after-leg runs produce, read in full (the d60 horizon
yields the d28–d45 talks; CONVO_DAYS [28, 45] on the pilot/confirm
seeds). Senseless count must be 0 to claim the people check clean.
The r113 defects (gossip voice-break, raise echo/brush-off/unvoiced/
unanswered) are CARRIED, not re-litigated — re-counted only if the
fix touches conversation code (it does not).

## Q3 — CENSUS (plain words)

Village assessment for 97904 before/after (who lived, what the scholar
learned on the road, what changed) + 97901 confirm census. Short form:
the mechanism fix is the claim; the census is the leg's plain-words
record, not a ladder verdict.

## Seed band — MATCHED PANEL, not a fresh band

- **Seeds 97901–97904 (the r112/r113 band), reused as a matched
  before/after panel** (§15): before = r113's published band on the
  r112/r113 policy + r113 base; after = this run's fixed policy on the
  current base (zero `src/js` delta disclosed above). This is NOT a
  freshness claim: 97901–97904 are used, named in the r112/r113
  preregs, and must never be presented as fresh.
- Freshness re-check (per local_seed_band_freshness): grepped ALL dated
  preregs (`evidence/*/sim-*-prereg.md` +
  `evidence/*/journey-*-prereg.md`) for each seed as a whole token —
  the ONLY hits are the r112 and r113 preregs. No use since r113. No
  forbidden-band collision (99201–99208 contaminated band untouched;
  97801–97804 r111, 98000–98099, 97501–97516, 98601–98616, 99001–99016
  all disjoint).

## Method

- PILOT GATE: 97904 first, DAYCAP=60. Crash, recorder errors > 0, or a
  postrace file with 0 walk rows → STOP, do not score. Pilot gates the
  fix: if the pilot shows 0 studies or a ≥5-day stall, STOP — the fix
  is broken, not the game (NO-GO, no confirm spend).
- CONFIRM: 97901, DAYCAP=60 (guardrail seed). 97902/97903 DAYCAP=60
  ONLY if the run budget allows; if they do not run, the run note says
  so plainly and the band is labeled partial (pilot + 1 confirm).
  The full 180-day 4-seed band is OUT of this run's budget and is owed
  to a later run — the fix's claim is the mechanism (walks complete,
  studies fire), not the ladder outcome (charter/trade). No ladder
  verdict is claimed from d60 runs.
- DAYCAP=60 horizon reason (§10): the stall's first trip life is 15
  days (d28–42); d60 covers trip 1 completing + a retry trip + the
  return-home walk, with margin. Death-aware stop (+10d tail max).
- Policy: the r113 trade-road stack, unchanged except `walkTo` —
  frozen in this prereg, do not tune mid-band.
- Proof test `scripts/test-journey-scale-r122-walkto-20261109.js`:
  ≥3 seeds (§3): (a) 97904 real-creek walk-around — scholar at (4,4),
  walkTo(2,8) moves and closes distance; (b) reach-target on 97901 +
  one further seed; (c) determinism — same seed twice, same end
  position; (d) honest stop — all four orthogonal neighbours creeked,
  walkTo stops with the scholar unmoved and `blocked` named; (e) no
  teleport — every single travelTo step moves ≤1 tile.
- Telemetry: the pilot/confirm regime (1–2 seeds, d60) differs from the
  `scale.json` baseline regime (4 seeds, d129–180, sums 446/289/646).
  Do NOT run `--update-baseline` on pilot numbers and do NOT present a
  pilot-vs-baseline comparison as a verdict. If a same-regime band
  completes later, the check runs then.
- Gate note (carried): the full `check.js --quick` gate is attempted at
  the end and its result (green or timed-out) is reported honestly. The
  proof test + pilot/confirm evidence are this run's regression cover;
  this run changes ZERO `src/js` and ZERO harness/collector inputs.

## Pre-registered metrics (bind the run — §14)

- PRIMARY: per-seed studies completed (count + days), trips started /
  completed / stalled (a stall = ≥5 consecutive no-move walk days on
  one trip), first-study day, walk rows per trip (eval/walk/study/drop
  with after-positions), creek-refusal say lines per day. A miss is
  NO-GO, never re-scored against a friendlier metric mid-run.
- SECONDARY (report-only): survived days, end cause, pop alive/end,
  trade proposals by d60, transcript senseless count (must be 0 to
  claim the people check clean), national stage day, lesser priced day.
- Every run note carries a "metric review" section; if a metric proves
  wrong, the revision is proposed for the NEXT run.
