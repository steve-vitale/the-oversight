# sim-axefirst-b-r1430 — AXEFIRST ruin-run axe supply (lever, DIAG-NO-STRAND)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T1430Z,
arm sim-axefirst-b, axis food-economy, tracker blank 3 (run 1047Z).
Prereg (binding, committed BEFORE any judged leg):
evidence/2026-10-31/sim-axefirst-b-r1430-prereg.md (commit f200c7b08).
Pinned base: 47162b801a9763ed92a54bcbd633ec56b9fb049d.
Stack: POLICY=nighttravel, WOODCARRY=1, WOODWARM=1,
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
STRANDFIX != 1, PRESSB != 1, DAYS=30. AXEFIRST=1 lever / 0 control.

## VERDICT: DIAG-NO-STRAND — lever UNJUDGED (substrate-blocked)

This is the prereg's DIAG-NO-STRAND verdict, and the coordinator's
SUBSTRATE-BLOCKED wording for the same fact: NO seed strands on
control legs at all (0 still creek evenings on the pilot seed 15215
on both arms AND on all 16 confirm control legs), so the lever's
joint proof cannot be exercised on this tree. The lever is UNJUDGED
— explicitly NOT a lever NO-GO. The lever was never given a strand
morning to prove itself on; primary clause (a) and guardrails (c)
are unjudged with it, because the lever confirm legs were not run
(staging decision below). No verdict was re-scored into a friendlier
shape: nothing here claims the lever works, and nothing claims it
fails.

## What was built (adoption accounting)

The first worker on this arm died mid-run on a transport error
(database pool timeout, process killed) — NOT a verdict. What it
left: the prereg commit (f200c7b08) and two untracked scratch
probes at the tree root (probe-axefirst-scratch.js,
probe-ruinrun-scratch.js). What this adoption worker built on top
of that prereg, in this run:

- DATA (one system, prereg part (a)): one hatchet entry appended to
  each of the 6 regions with a list pool in src/data/regions.json
  (na_eastern_woodlands, sa_amazon, eu_temperate,
  africa_sahel_savanna, south_asia, east_asia; id 'hatchet', name
  'Hatchet', kcal 0, kg 0.7, plain text line). The other 14 regions
  have a null pool and fall back to the in-code SCAVENGED pool,
  which the prereg deliberately leaves untouched — no pool was
  invented for them. Diff: 42 insertions, 0 deletions, hatchet
  entries only (proof's diff guard enforces this shape).
- POLICY (one new file, prereg part (b)):
  scripts/policies/axefirst-diag.js — env-gated AXEFIRST=1/0
  wrapper over the warmed stack: gameDays 2-6, starts the day at
  haven, holds no axe-tier tool (own woodcutTier only) → one
  deliberate ruin run (nearest ruin via offered travelTargets, else
  visible-board tileAt scan; hop-walk, no force; engine
  doAction('forage') searches; walk back to the day's start tile),
  then the base daily runs as usual. Perception-law clean by
  construction (own tier/pack/position/kcal/ticks, visible board,
  engine-offered steps; no roster, no loot queue, no other
  villager's state). No src/js change of any kind.
- INSTRUMENTS (all -r1430 suffixed; no 0841Z file touched):
  scripts/axefirst-r1430-trace-b.js (stdout-emitter driver),
  scripts/axefirst-r1430-split-b.js (idle splitter),
  scripts/analyze-axefirst-r1430-b.js (census + control-vs-lever
  compare: primary axe-by-day-7, joint proof, guardrails),
  scripts/test-axefirst-r1430-b.js (proof).
- The two scratch probes were used for exploration only and are
  DELETED before the final commit (they are not in it).

## Pilot (prereg gate: completeness + determinism)

- 15215 control + lever: both legs complete (30 evenings, 29
  mornings, errs 0). Pilot gate PASSES on completeness.
- Determinism: lever 15215 re-run byte-identical to the judged
  pilot lever file (cmp, no differences). Pilot gate PASSES.
- Strand presence is a FINDING, not a gate: 15215 strands on
  NEITHER pilot leg (0 still evenings both arms) — the first
  substrate signal, confirmed by the confirm census below.

### Pilot lever leg, in full (the only lever leg judged anywhere)

4 ruin runs, all to the (5,4) ruin next to haven, all returned
home, 0 unreached, 0 finds, 8 searches total, every stop 'ticks',
kcal healthy throughout (1987–2300 after each run), no day-boundary
crossing, evenings all 'completed'/'already-inside':

| loopDay | gameDay | searches | stop | gained | kcal before → after |
|---|---|---|---|---|---|
| 2 | 2 | 1 | ticks | leather_jacket | 2400 → 2300 |
| 3 | 3 | 3 | ticks | machete, memory_lantern, oath_ring | 2354 → 2054 |
| 4 | 5 | 1 | ticks | can_soup | 2310 → 2210 |
| 5 | 6 | 3 | ticks | can_corn ×2, jar_peaches | 2287 → 1987 |

Only 4 run-days, not 5: the window is defined on gameDays, and a
base-daily day roll skipped gameDay 4 (loopDay 4 woke on gameDay 5).
No hatchet in this ruin's queue: the 8 draws emptied the visible
queue (leather jacket, machete, lantern, ring, soup, corn ×2,
peaches). That is ordinary queue luck, not a lever failure — ruin
queues are random with-replacement samples from the common pool
(see §"What the pilot taught about ruin queues"), and with 11
common pool items the chance of no hatchet in 8 draws is ~47%.

### Two pilot-caught fixes, disclosed (pilot amendments, not redesigns)

1. STALE-VARIABLE BUG (first pilot lever leg, DISCARDED): the
   first pilot lever leg recorded skip 'error' on loopDays 2–5 with
   store error "daily: run is not defined" — a stale variable
   reference left by an edit, thrown AFTER the ruin run completed,
   discarding its record (runs counted 4, records lost). That leg
   is unjudged-quality and was deleted and re-run, not quoted
   anywhere as evidence. The proof test gained an ON-path daily()
   test that would have caught it (59/59 after the fix).
2. TICKS-GUARD OFF-BY-ONE (prereg literal vs prereg invariant):
   the prereg's literal guard "ticksLeft < 64" does NOT honor the
   prereg's own invariant ("the loop must never spend the day
   boundary"). Proven on the buggy leg's runs: from a 128-tick dawn
   budget, 2 searches left ticksAfter 512 and kcalAfter 0 — the
   second search landed ON the boundary and endDay fired, burning
   the vessel's food to zero. The guard is therefore ticksLeft
   <= 64 (a search runs only when MORE than its own cost remains
   in the day), documented in the policy header. On this stack the
   dawn budget is ~128 ticks (the harness's 3 waits consume the
   rest), so at most 1–3 searches fit per run-day (3 when the dawn
   budget is 256 after a short prior day). This is a fix to honor
   the prereg's stated invariant, disclosed here — not a
   re-scoring: the fixed pilot leg is the judged one, and its
   numbers are reported exactly as run.
3. PACK-ID READER (records only): inventory entries are
   heterogeneous — gear carries itemId, cans carry plantId, books
   carry bookId, some are bare strings. The first pilot's gains
   read as nulls; the reader now maps all four shapes. Hatchet
   detection was never affected (gear enters with itemId).

## Confirm: control census (16 seeds) — the substrate verdict

Staging decision, stated plainly: the pilot seed (the canonical
10-night strand seed on older bases) did not strand on either arm,
matching the two sibling arms' findings today (fedevening-b: 0
creek evenings on all 16 legs; corpsemove-b: 0 bearer deaths, 0
corpse moves). Running the full 32-leg confirm on a dead substrate
would have spent 16 lever legs proving nothing. Instead the 16
confirm CONTROL legs were run as the substrate census the prereg's
DIAG clause requires ("NO seed strands on control legs at all"),
and the lever confirm was withheld pending any strand. Had any
control seed stranded, the lever confirm would have followed
immediately and the arm would have been judged in full. None did.

Confirm control seeds (prereg bank + fresh band): 15003, 15009,
15091, 15211, 15220, 15221, 15337, 15376, 15439, 16401–16407.
Result, per seed (all errs 0, all recorders complete):

- Still creek evenings: 0 on ALL 16 legs. Strand mornings: 0.
  Pairing (fell-tier strand mornings): 0. Joint denominator: EMPTY.
- Evening outcomes: overwhelmingly 'completed' /
  'already-inside'. Travel refusals exist but are never creek:
  'out-of-reach' 10 evenings (15376: 3, 16402: 1, 16407: 6),
  'blocked-combat' 3. The woodcarry bucket is never 'creek', so
  no evening is ever classified still.
- Away-mornings after out-of-reach evenings: 10 (15376: 3 on
  forest_floor; 16407: 5 on thicket + return home day 12; 16402:
  1, but that morning the vessel woke INSIDE at haven). Every one
  of the genuinely-away mornings carries wood EXACTLY 4 — none is
  needs-wood even under a looser "slept away, any cause"
  definition. The strand is doubly dead: no creek nights, and no
  wood-short away mornings either.
- Survival to day 30: 14/16. Lost: 16401 (village-lost day 24 —
  four villagers starved on day 24 after sickness/monster
  attrition) and 16404 (village-lost day 12; listed deaths are
  monsters + one ambush, no player death recorded in the sample).
- Wave reach: wave 1 on 2 seeds (15003, 16404), wave 2 on 12,
  wave 3 on 2 (16403, 16405). National / table / wins: 0 on all
  legs — structural on a 30-day pre-seat stack, reported not
  claimed (see telemetry check below).
- Control axe by day 7: 2/16 (numerically inside the prereg's
  control bound of ≤2, but the bound is unjudged without lever
  legs — reported, not judged):
  - 15221 day 1, source 'stash fetch' (vessel's own stash at
    haven; held at haven, never fell-capable — the 0841Z haven
    pattern again: an axe at haven has no tree to fell).
  - 16402 day 5, source 'other' — resolved by inspection, not
    assumed: the first vessel died in the wild on day 4 and the
    SUCCESSOR arrived already carrying a hatchet equipped (melee
    slot) with bark armor and a chef's knife. This refines 0841Z
    without contradicting it: a hatchet is NOT inherited at
    succession (it leaves with the dead vessel), but a successor
    can ARRIVE holding one of their own. The classifier has no
    succession class; the evidence names it here. Fell-capable
    morning day 18 (no strand morning to pair with).

## Primary / joint / guardrails (prereg clauses, honestly applied)

- (a) PRIMARY: lever — not run (withheld, see staging). Control
  2/16 by day 7. Clause (a) is UNJUDGED, not failed.
- (b) JOINT: zero stranding control seeds with a needs-wood
  strand morning → DIAG-NO-STRAND by the prereg's own rule.
  Pilot compare (n=1, attached as
  sim-axefirst-b-r1430-compare.json) computes the same verdict
  on the pilot pair; the full basis is pilot + 16-leg confirm
  census (sim-axefirst-b-r1430-census-confirm-control.json).
- (c) GUARDRAILS: unjudged (no lever confirm legs to compare).
  Pilot-scale observation only: the pilot lever leg survived to
  day 30 like its control, with no lever-only death.
- COST BAR (sim-scalemetric: starvation ≤ control+2 AND arm-only
  deaths AND median ≥ 0.8× control median): not judged — no lever
  confirm legs exist to apply it to. Not claimed either way.

## Village assessment (plain words)

Villages on this tree sleep at home almost every night now. The
long creek strand that used to trap the vessel out for ten nights
is simply gone: the vessel either walks home for the night or, a
few nights per run, sleeps out in the thicket or forest because
home is out of reach — and even then it keeps its four logs and
walks home within a few days, sometimes after days at zero food
(16407 spent days at 0 kcal out in the thicket and still walked
home on day 12). Two of sixteen villages died out in thirty days:
one starved together on day 24 after sickness and monsters thinned
it, one was lost by day 12. Everyone else was still standing at
day 30, mostly having met second-wave monsters, two having met
third-wave ones. Nobody reached anything national, nobody sat at
any table, nobody won — thirty days is far too short for that,
and the numbers say so honestly.

The ruin-run errand itself, on the one seed where it ran, looks
like something a person would do: walk next door to the ruin in
the morning, pry open a cupboard, bring home a leather jacket or
a can of corn, walk home, carry logs from the woodpile, and get
on with the day — meeting Ava and David, learning their names,
hearing gossip by the fire. Nothing about the errand reads
robotic; what it did not do is find a hatchet, because this
ruin's cupboard never held one.

## Sense-test (law)

Read end to end: the pilot lever leg's day 2 (first ruin-run day;
no lever strand morning exists to read). The day's narration runs
"Travel 1 tile to ruin. — Pre-Burn ruin — [barn story]. You pry
open a cupboard: Leather jacket. [its story]. Travel 1 tile to
Haven. You walk back into Haven." followed by the ordinary day
(woodpile carry, garden orders, introductions to Ava and David,
gossip by the fire). Meaning: a deliberate morning errand with a
real find and a real walk home. Coherence: the run's cost (100
kcal, 64 ticks) and return are visible and proportionate.
Relevance: the errand serves the vessel's own need (a tool for
felling), not a checklist. Consequences: the jacket rides in the
pack; the day proceeds; nothing breaks. The sense-test PASSES for
the errand's conduct — with the plain caveat that the errand
found a jacket, not the hatchet it was looking for, because the
cupboard did not hold one. Limitation, stated: the driver's
evening tail holds the day's last 30 say lines; the morning run's
lines survive in it here, but a longer day could push them out —
a future run that needs full-day narration should capture the
run's say lines in the run record itself.

## What the pilot taught about ruin queues (for the next blank)

Ruin loot queues are built at generation time as random draws
WITH REPLACEMENT from the region's common pool (game.js home-gen:
nLoot 3–5 scaled by lootMult, each draw uniform over commons).
Adding a hatchet to the pool does NOT put a hatchet in any
particular ruin: with 11 commons in the eastern pool, a given draw
is ~9% hatchet, and a 4-item queue holds one ~31% of the time.
The vessel's dawn budget admits ~1–3 searches per run-day over
~4 run-days, so even a queue that holds a hatchet can be missed
by window's end, and a queue without one can never yield one.
Any future earnable-axe route built on ruin search must price
this lottery honestly: either more ruins in reach, more searches
per day (which the day budget does not currently admit), or a
different supply shape. The 0841Z spawn-stash proposal remains
the measured fallback (granted, not earned, by its own
description) if the coordinator decides the lottery is the wrong
vehicle.

## Panel (§15)

NON-APPLICABLE, declared explicitly (prereg declaration,
unchanged): scripts/balance-panel.js runs sweep-compare registry
policies on 150-day horizons with its own scorecard; it cannot
express the nighttravel+woodcarry+woodwarm strand stack, the
30-day creek-evening census, or an env-gated single-mechanism
probe, and a 150-day win/vest panel would measure a different
question on a different substrate. The comparison here is
control-vs-lever legs on identical seeds through the census
analyzer (pilot pair attached; confirm control census attached),
and is never labeled a panel comparison.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-10-31/sim-axefirst-b-r1430-corpus-confirm-control/*.json'
--metrics national,table,wins,exiled --sweep-rows` printed LOUD
lines for national (baseline 12 → current 0), table (16 → 0),
wins (16 → 0). Investigated, not a deviation: the baseline is a
long-horizon scale-wall baseline on which those outcomes are
reachable; the current legs are a 30-day pre-seat stack on which
national/table/wins are structurally 0 (prereg secondary note).
No exiled deviation line. No same-run investigation item beyond
this note.

## Metric review (for the NEXT run — never applied to this one)

1. TICKS GUARD: the prereg's literal "ticksLeft < 64" contradicts
   its own day-boundary invariant (proven in pilot, fixed to <=
   64 here with disclosure). Next prereg should state the
   invariant as the rule ("a search runs only when more than its
   cost remains in the day") and let the number follow it.
2. WINDOW ON GAMEDAYS: gameDays skip when a base-daily day roll
   fires (pilot lever skipped gameDay 4), so a gameDay window
   yields fewer run-days than its length. Next prereg should
   define the window on loop-days, or accept and pre-register the
   skip.
3. STRAND DEFINITION: the creek-bucket definition may be too
   narrow for current master — out-of-reach away-nights exist
   (10 across the confirm band) but are not strand mornings, and
   none of them was wood-short anyway. Before any re-run of a
   strand-dependent arm, the next prereg should decide whether
   "slept away, any cause, wood < 4" is the strand — and, more
   importantly, WHY creek refusals vanished (vessel comes home
   vs goes out-of-reach; departure patterns changed since the
   strand was characterized). That re-derivation is the next
   blank (below).
4. SUCCESSION SOURCE: the classifier has no succession-arrival
   class (16402). Next census should add one (arrival = vessel
   id changed before first axe snap + axe in successor's kit).
5. MOOT-PACK-READY: the analyzer adds this joint status (lever
   stills exist but no needs-wood mornings) alongside the
   prereg's MOOT-DISSOLVED. It was unused this run (no lever
   confirm); the next prereg should adopt or reject it
   explicitly rather than inheriting it silently.
6. No metric in this run was re-scored mid-run. The DIAG verdict
   follows the prereg's own rule for exactly this outcome.

## Next blank (for the coordinator)

1. RE-DERIVE THE STRAND SET ON CURRENT MASTER FIRST. The strand
   as characterized on older bases (10 still creek nights on
   15215) does not exist on this tree on any of 17 legs (pilot
   both arms + 16 confirm control). Until a seed set with real
   still creek nights is found on current master, every
   strand-dependent arm (this one, fedevening-b, corpsemove-b)
   is unjudgeable on its joint question. Do not re-run this
   lever's confirm until that set exists.
2. If the re-derived set exists, this lever's confirm (16 lever
   legs on the prereg's bank + fresh band) is ready to run
   unchanged apart from the two disclosed pilot fixes — the
   instruments, proof (155/155 with corpora), and data edit are
   committed on this branch.
3. Standing fallbacks, not re-litigated here: the 0841Z
   spawn-stash hatchet proposal (granted, not earned); the
   stone_axe dead recipe (no item def, unlearnable, tier text
   forbids felling) as a separate blank.

## check.js --quick triage (pre-existing failures, not this arm's)

`node scripts/check.js --quick` was run twice on this tree: 284
passed / 6 failed, then 283 passed / 7 failed (the set varies
between runs). The failing scripts were triaged, not fixed (all
outside this arm's assigned area):

- scripts/godpath/test-phone-frame-proof.js — the ONLY failure
  with any plausible link to this diff (it hashes boot inputs
  including regions.json). PROVEN PRE-EXISTING by hash
  comparison: the retained hashes in
  scripts/phone-frame-proof.json match NEITHER the pinned base
  NOR this tree — for regions.json AND for index.html, a file
  this arm never touched (index.html is byte-identical between
  pinned base and this tree, yet still mismatches retained). The
  proof was already stale on the pinned base; this arm's edit
  does not newly break it. Refreshing it requires a browser
  receipt task (scripts/phone-frame-proof-update.js) and
  hand-editing hashes is forbidden — out of scope here, flagged
  for the coordinator/ship loop.
- The other six failing scripts contain ZERO references to
  regions, scavenge, or data files (grepped): measurement
  proof-update, measurement workflow, mobile combat cadence,
  occupation panels, measurement cache flags, establishment-r20
  (racks-full voice gate — identical deterministic failure in
  both runs). This arm changes no src/js, no harness, no test
  files, so none of these can be caused by this diff; they fail
  on code areas untouched here.
- docs/ONTOLOGY.md was modified by the check run itself
  (regenerated villager-build entry for the already-landed
  lootabilities Arm 6) — restored to base state before commit;
  it is not part of this arm's change.

## Transport, files, proof

- Transport: stdout JSONL (foreground exec, stderr to .log) +
  idle splitter into per-seed corpus files; .jsonl files deleted
  after successful splits. No judged corpora staged in /tmp.
- Evidence files (all -r1430; no 0841Z file touched):
  evidence/2026-10-31/sim-axefirst-b-r1430.md (this file),
  sim-axefirst-b-r1430-compare.json (pilot pair),
  sim-axefirst-b-r1430-census-pilot.json,
  sim-axefirst-b-r1430-census-confirm-control.json,
  corpora sim-axefirst-b-r1430-corpus-pilot-control/,
  -pilot-lever/, -pilot-det/, -confirm-control/ (19 legs total:
  1 control pilot, 1 lever pilot, 1 determinism re-run, 16
  confirm control), plus per-run .log files.
- Proof: node scripts/test-axefirst-r1430-b.js with pilot +
  confirm-control corpora: 155 pass, 0 fail (59/59 without
  corpora). node scripts/validate-regions.js: 20 regions, 6
  playable, 0 errors. Determinism: cmp byte-identical (see
  pilot section).
- Panel: non-applicable (see §Panel). No push, no version bump,
  no live verification — committed on branch sim-axefirst-b,
  pending coordinator merge.
