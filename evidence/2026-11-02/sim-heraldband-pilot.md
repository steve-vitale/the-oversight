# sim-heraldband-pilot — re-screened fight-positive herald-chain pilot band

Run: fleshout-20261102T2215Z, axis scale-onramp, worker sim-heraldband.
Arm: instrument + judged-band only — ZERO game-code change.
Prereg: evidence/2026-11-02/sim-heraldband-pilot-prereg.md (committed
23db5b70 BEFORE any judged sim), restating the staged 2018Z prereg with
the 2115Z correction: the anchor is the tip the sims actually ran on.

## Anchor (actual)

Per-seed anchorCommit: 23db5b706923 — the prereg-commit tip. It differs
from the worktree base 62e251b69 by exactly one file (the prereg itself),
so no trajectory-relevant code differs from base; the anchor correction
is satisfied by recording the actual tip, not the base.

## Canon note

docs/CANON.md read first; docs/MONSTER-WAVES.md read for wave law. No
canon doc covers the herald/titan call chain itself (herald appears in
MONSTER-WAVES / ONTOLOGY / TABLE in passing) — this arm invents no
canon and judges only recorded outcome rows, per the prereg.

## Stack (verbatim)

Policy closecommit (titanroute + musterclose + mustergap over
lead-fullseat) exactly as scripts/fightoutcome-driver-20261102.js
composes it. Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
SEATDRIVE=1 FULLSEAT=1 HERALD=1. Mode herald, 180d death-aware cap, one
process per seed. Recorder/analyzer:
scripts/fightoutcome-{recorder,driver,analyzer}-20261102.js as landed
at base. Analyzer run over the per-seed JSON only (no re-simulation).
Output-dir note: the driver writes into perseed-fightoutcome-a (shared
with the recorder pilot); this run's 8 files were MOVED into the fresh
dir perseed-heraldband-a before analyzing, so the analyzer corpus is
exactly this band and the recorder-pilot dir is left as it was.

## Primary metric — screen usability (NOT a chain verdict)

- Analyzer problems: **0** (legs 1a/1b/1c + leg 2 complete; missing 0,
  orphan 0, duplicates 0, unresolved 0; 115 fought TB rows, 643 field
  fights, floor titanTb + field both true).
- Fight-positive yield: **1** (seed 98102 only — one titan TB fight row
  joined to a slain/fled outcome record).
- **VERDICT: SCREEN TOO THIN.** Problems = 0 but yield 1 < 2, so the
  screen is usable but too thin to justify a confirm round on this
  band. This is NOT a verdict on the herald chain. Next run: widen the
  band (spare band 98201-98208 on file) rather than judging the chain
  on one fight.

## Secondary — per-seed table (descriptive, never judged)

| seed | call day | titan class | national | table* | won | maxWave | gameDays | end |
|------|----------|-------------|----------|--------|-----|---------|----------|-----|
| 98101 | — | no-call | 0 | 1 | 0 | 3 | 95 | village-lost |
| 98102 | 66 | fled (fight d68) | 0 | 1 | 0 | 4 | 89 | village-lost |
| 98103 | — | no-call | 0 | 1 | 1 | 4 | 90 | over-other |
| 98104 | — | no-call | 0 | 1 | 1 | 3 | 90 | over-other |
| 98105 | — | no-call | 0 | 1 | 0 | 4 | 62 | village-lost |
| 98106 | — | no-call | 0 | 1 | 1 | 3 | 90 | over-other |
| 98107 | 89 | still-pending-at-cap | 0 | 1 | 1 | 4 | 90 | over-other |
| 98108 | — | no-call | 0 | 1 | 1 | 4 | 101 | over-other |

\* Driver table flag is a latch (tableWaiting OR tableDone), not "sat
at the table": it reads 1 even on village-lost runs. Do not cite 8/8
as table reach.

Classes: no-call = run ended before any call fired (6 seeds);
refused-only = 0 seeds as a final class (98102 carries refused records
AFTER its fled fight — see findings); departed-silent-or-pending = 0
seeds on this band; still-pending-at-cap = 98107 only.

## Wall numbers for the band (honestly limited)

National 0/8, table-latch 8/8 (see caveat), won 5/8, wave-4 unlocks 5/8,
wave-5 unlocks 0/8, median survival 90 days (survivals 62, 89, 90, 90,
90, 90, 95, 101). These are 8 pilot seeds on a screened band, not a
scale-wall measurement: runs ended at 62–101 days, well short of the
180d cap, because villages died or won — which is itself why 6 of 8
seeds never called at all. The wall picture is unchanged: national 0,
wave-5 0.

## Sense-read — seed 98102 titan fight, day 68 (SENSE-TESTING LAW)

Read the fight row's sayLines end-to-end (head 150 + tail 150 kept,
223 middle lines dropped and counted — the transcript is honest about
its gap). Verdict: the row and the transcript MATCH, and the fight
reads as a real coalition fight with a real price — but with two
blemishes a player would feel.

What matches: the row opens "12 allies join you on the field"; the
outcome record is fled with detail blades 12 — the same 12. The Herald
(700 HP) is beaten down to 44 HP and alive, engine "routed", closing
line "It comes apart — no one in reach, no one chasing. The fight
ends; they melt back into the wilds." — a flee, not a slain, and the
row says fled. The call line (day 66: "THE CALL GOES OUT — THE HERALD
must fall, and no one fire can do it") is answered by a genuine
multi-village coalition: named fighters from village_1/2/3, plus the
day-89-style answering pattern seen on 98107 (Emberhold, Thornfield,
Ashford answer; Stonebridge refuses with trust −8 — refusals are
remembered, which is people-like, not mechanical).

The price is legible and steep: 6 of the 12 allies die (Lena Garcia,
Sam Mendez, Lucia Rhee, Sanne Olsen, Grace Park, Felix Frost); the 6
survivors end at 10–36 HP. The Herald's own blows land hard (26–50
damage, with Codex lessons for First Omen and Second Omen firing
mid-fight). The muster-hunger lines running alongside ("2,000 of
12,000 kcal fed", then "1,410 of 12,000") make the coalition price
concrete: feeding the muster is part of the fight's cost, not flavor.

Blemishes, judged as a player would feel them:
1. "No path there." appears 112 times in the kept transcript. Allies
   repeatedly cannot reach the Herald; long stretches of the fight are
   the coalition flailing at pathing while the Herald's AoE does the
   work. A 12-ally titan fight that spends this much of its transcript
   on failed movement reads robotic, not heroic.
2. The player ("You") ends untouched at 100/100 while half the
   coalition dies. Either the bearer is kept out of harm's way by
   design (then the transcript should say why the leader is safe while
   allies fall) or the bearer is never actually at risk in this fight
   (then the coalition price is paid by everyone except the person who
   called it). Either way it undercuts the "no one fire can do it"
   stakes.
3. After the fled outcome, further herald attempts on days 68, 69 and
   83 are recorded "refused" on the muster gate (have 0, need 10) —
   even though 12 blades just fought. A refusal trail after a resolved
   fight reads as the gate counting something other than the blades
   that were there; worth a look, not a verdict.

Sense verdict: PASS on row/transcript match and coalition meaning;
FLAG the pathing repetition and the untouched bearer as findings, not
as arm failures. Counts alone did not pass this arm — the transcript
did, with blemishes named.

## Telemetry

node scripts/telemetry-check.js against
hidden_files/telemetry-baselines/scale-wall.json:
- First invocation (glob `perseed-heraldband-a/*.json`) did NOT refuse
  and printed spurious LOUD lines (national/wins disappeared). Cause
  found and owned: the glob swept in analysis.json, which carries no
  top-level anchorCommit, so the guard's all-rows condition failed and
  the tool compared a recorder corpus against a run baseline. The
  baseline itself is a different regime (winseat ~100%-win suite), so
  even a clean compare would have been a regime artifact.
- Correct invocation (glob `perseed-heraldband-a/fo-*.json`):
  **REFUSAL, exit 2** — "refusing recorder-corpus input: all 8
  --current rows carry top-level anchorCommit, so they are sweep
  recorder rows, not runs." This is the EXPECTED refusal class.
  Baseline NOT rolled. No LOUD line stands.

## Metric review

- Departed-silent-or-pending vs still-pending-at-cap: SEPARATES CLEANLY
  on this band. The one pending seed (98107) is unambiguously
  still-pending: call day 89, herald still present on the last traced
  day (day 90, tile 6,3, muster present, zero outcome records), game
  won day 90 — the run ended one day after the call, before any fight
  could happen. Departed-silent (herald gone from dailyTrace, no
  outcome record) occurred on ZERO seeds here, so the class remains
  defined but unexercised on this band; it cannot be validated or
  retired from this run.
- Yield >= 2 as confirm gate: HELD for this run (yield 1 correctly
  blocks a confirm on a single fight), but the thinness here is
  run-length as much as call rarity — 6/8 runs ended before any call.
  Proposal for the NEXT run (not a mid-run rescore): widen the band
  AND consider screening on runs that survive to call age, or report
  yield per called seed alongside yield per band seed, so a band of
  short-lived runs cannot masquerade as a thin chain.

## Findings noted for the coordinator backlog (NOT appended by this worker)

- Titan-fight pathing: "No path there." ×112 in the 98102 Herald
  fight transcript — 12-ally titan fights spend much of the fight on
  failed movement (evidence: perseed-heraldband-a/fo-closecommit-s98102-r1.json).
- Untouched bearer: player ends 100/100 in the Herald fight while 6/12
  allies die — bearer risk in titan fights needs a look.
- Post-fight refused trail: herald attempts refused on the muster gate
  (have 0/need 10) on days 68/69/83 after a 12-blade fled fight on day
  68 — gate accounting vs fought blades mismatch to inspect.
- Band thinness is run-length-driven: median survival 90d vs 180d cap;
  6/8 seeds never called because runs ended first. Next screen should
  widen the band (spare 98201-98208 on file) and/or condition on
  call-age survival.

## Village assessment (plain words)

Eight villages, same coalition-seeking policy. Five won their own game
and three died — but none reached national standing and none met a
wave-5 monster, so the scale wall stands exactly where it stood. Only
two villages ever heard the Herald's call. One (98102) actually fought
it: twelve allies from three villages marched, six died, and the
beaten-down Herald slipped away at 44 of 700 health while the player
stood untouched — a real coalition fight that reads heroic in its
price and shaky in its pathing. The other (98107) got its call one day
before winning its game, so its coalition never got to march. The
other six villages lived and died without the call ever sounding.
The blank this run fills is narrow but real: the fight recorder holds
up on a fresh band (zero problems), the Herald chain produces a
joinable, readable fight when it fires — and it fires rarely, partly
because villages end before it can.

## Proof

scripts/test-heraldband-pilot-20261102.js: **45 passed, 0 failed**
(corpus, anchor, analyzer invariants, yield, per-seed classes, wall
numbers, 98102 sense facts, 98107 pending separation). No game-code
change; no [needs-eyes] (instrument-only arm; the pathing/bearer
findings are backlog items, not feel changes by this arm).
