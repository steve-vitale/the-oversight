# sim-jointgate-b — prereg (binding; committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T0741Z,
arm sim-jointgate-b, axis food-economy. Worktree sim-jointgate-b.
DIAG ONLY: measurement, zero src/js changes, zero policy-default
flips, zero edits to any existing policy file, driver, analyzer, or
proof file. New files only: this prereg, the recorder driver +
analyzer + proof scripts named below, the evidence file, and the
corpora/censuses they produce. Sibling worktrees never touched
(sim-heraldhp-adopt-a, sim-mustercall2-a, sim-pocketcall-a and all
scale-onramp work are out of bounds); main tree never touched.
Nothing is merged by this worker (the coordinator merges); do NOT
push, bump versions, or verify live.

## Canon read first

docs/CANON.md read, then docs/TIME-ECONOMY.md. Fell cost is an engine
constant, verified in code (src/js/game.js cutTree: 96 ticks + 80 kcal;
src/js/storage.js woodcutTier/cutInfo: tier 'fell' is the only tier
with canFell true; hatchet carries tool.woodcut 'fell', stone_knife
'whittle'). No canon doc covers the joint fed+axe+roomy gate itself
or the strand-fix blank — stated here instead of inventing canon.
Standing rules that bear on it: CANON.md's "no silent actions" and
the perception law (Steve 2026-10-28: a villager knows only what it
senses — its own tile, its own pack, its own clock). The recorder
therefore reads only the vessel's own morning state and the occupied
tile's own 9x9 detail grid, never a roster or another tile.

## Prior evidence read before designing anything

- evidence/2026-10-31/sim-tickfell-a.md (+ prereg): FED+AXE+ROOMY
  NEVER co-occur on strand mornings — 0 axe-tier snaps on any
  recorded morning of either 15215 leg, 7 wood-short ON mornings
  failing tool 7/7, kcal-floor 7/7, ticks 4/7. This arm does NOT
  re-judge the tickfell corpus: fresh census on current master only.
  Tickfell numbers are context for comparison, never the verdict.
- evidence/2026-10-31/sim-stashfetch-a.md (+ prereg): an ordinary
  daily routine fetches the best weapon/armor at home day 1
  (vesselStashFetch / vesselArmorFetch, src/js/villager-build.js:
  once a day, at haven, own stash only, must beat the worn piece).
  On 15337 the spawn stash held a hatchet + bark armor, so day 1
  fetched an axe-tier weapon. Whether 15215's spawn stash holds
  anything axe-tier — and whether the vessel is at haven at the
  day-1 endDay — is RE-DERIVED here, never inherited from 15337.
- evidence/2026-10-30/sim-axearrival-a.md: on the strandfix-variant
  stack, 15215's axe arrives day 15 intraday by corpse loot (Ethan),
  fells day 17 fed into a ticks-short evening; on the warmed-only
  control stack the same seed NEVER holds an axe in 30 days. The
  variant trajectory is a different stack from this arm's census
  stack — cited as the arrival mechanism to test against, not as
  this stack's evidence. This arm's stack has NO strandfix wrapper,
  so a day-15 corpse-loot arrival is a hypothesis to check in the
  morning inventory sequence, not an assumption.
- evidence/2026-10-31/sim-waitsalign-a.md: the 448 too-late-sleep
  threshold. Morning ticks left are 256 (sleep refused / interrupted
  late) or 128 (sleep ran) on this harness's 3-wait mornings — the
  roomy gate below is therefore expected to split strand mornings
  roughly in half, as tickfell observed (3 roomy / 4 tight).
- evidence/2026-10-30/sim-strandfix-morning-b.md: the strandfix-morning
  lesson — tool arrivals must be recorded per morning, or the
  mechanism stays a gap. This recorder records tool tier + cutInfo +
  full inventory + stash on EVERY morning, not only strand mornings.

## The question, in one sentence

On the strand census stack, on strand mornings, do FED + AXE + ROOMY
ever hold JOINTLY — and, if not, which gate(s) fail, and does the
day-1 stash-fetch routine explain the axe side (supplying it, or
provably unable to supply it on this seed/stack)?

## Substrate (exact, no mid-run swaps)

Stack: warmed(woodcarry(nighttravel)) — the tickfell control stack,
with NO tickfell wrapper (its prototype was deleted) and NO strandfix
wrapper. Env gates asserted FATAL in the driver:
POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, WOODCARRY=1, WOODWARM=0 (guard leg) or 1 (ON leg),
DAYS=30, STRANDFIX unset/0 and PRESSB unset/0 (both FATAL if 1:
neither is in this stack). Horizon 30 days, death-aware (runDays
stops at Game.over; dead villages stop simulating, +10d tail max
does not apply because the harness ends at game-over).
Pinned base: f239efe48e55d937f8da0fb71d8f558d19b32cdd (worktree HEAD
at prereg writing time; prereg + instrument + corpus commits add
tooling/evidence only, so all legs run on pinned-base game code
verbatim — verified by the proof's tracked-diff guard: src/ +
scripts/policies/ diff empty vs the pinned base).

## Pre-registered definitions (frozen before any judged leg)

STRAND MORNING (M, loopDay >= 2): the previous loop-day's evening
woodcarry record has bucket 'creek' and rescued false (a still
evening), AND the vessel wakes NOT at haven (insideHaven false AND
tile != 'haven'), AND not game-over, AND not in combat. This is the
tickfell strand-morning definition, reused verbatim so the fresh
census is comparable.

Per strand morning, the recorder captures (all reads, no verb calls,
no state writes, no RNG draws):
- TOOL: Game.woodcutTier() {tier, name, itemId} + Game.cutInfo()
  for the fell target's cell (canFell, canPrune) + full inventory
  (itemId, name, units) + equipped slots + the vessel person's
  stashed list (ids) + vessel id (succession check).
- CUTINFO TARGET: BFS over non-blocking cells of the OCCUPIED tile's
  own 9x9 detail grid (start = wake cell; tree/bigtree cells only;
  smallest stance path, tie bigtree > tree, then row-major — the
  tickfell/strandfix-morning choice rule, restricted to fellable
  cells). walkSteps = stance path length; no reachable tree/bigtree
  => target null, walkSteps null.
- PACK: morningWood = Game.woodCount(); needsWood = wood < 4
  (bridge needs 4 logs).
- FED: morning kcal >= 80 (the fell's own engine cost).
- AXE: woodcutTier tier == 'fell' (equivalently cutInfo.canFell
  true on a tree/bigtree; both are recorded and must agree — a
  disagreement is a recorder error, not a joint).
- ROOMY: projected = morningTicksLeft - walkSteps - 96 - 40 >= 96,
  where morningTicksLeft = TICKS_PER_DAY - morningDayTicks (512
  base, read from Game.TIME), 96 = fell ticks, 40 = the tickfell
  ROUTINE_ALLOWANCE (UNVALIDATED — no fell ever fired under it;
  see Metric review: the allowance is reused for comparability,
  never cited as validated). If target is null, ROOMY is null
  (not evaluable), never false.
- JOINT (primary): needsWood AND fed AND axe AND roomy, all true.
  Pack-ready mornings (wood >= 4) are NOT joint and NOT in the
  joint denominator — a fell is not needed there; they are reported
  separately. No-target mornings are NOT joint and are reported
  separately with roomy null.

STASH-FETCH RECONCILIATION (recorded on every leg, judged only on
15215): spawn snap (after setupGame, before runDays: vessel stash
ids, inventory ids, equipped ids) + loopDay-2 morning snap (the
first morning after the day-1 endDay: stash ids, inventory ids,
_fetchDay flags) + every morning's stash/inventory sequence. The
reconciliation is DETERMINATE iff, for 15215, the record names:
(a) whether the spawn stash held an axe-tier weapon, (b) whether
the day-1 fetch could fire (vessel at haven at the day-1 endDay —
read from the loopDay-2 morning's position history via the loopDay-1
evening row + fetch flags), and (c) the first morning, if any, on
which an axe-tier tool appears, with the intraday bracket that
supplies it (morning->evening inventory change on the same loop-day)
or a dated 'never in 30 days' result.

## Primary metric + GO threshold (binding)

Primary metric: the joint census — on seed 15215, guard + ON legs:
(J, D) where J = count of strand mornings with JOINT true, and
D = count of needs-wood strand mornings (the joint denominator);
plus per-gate fail counts (tool / kcal / ticks / no-target) over D,
and the pack-ready count reported separately.

Verdict, judged exactly as written (DIAG verdict — the joint COUNT
is a finding, never the verdict):
- DIAG-GO iff ALL of: (a) pilot recorder complete (every loop-day
  morning + evening snap present on both 15215 legs, recorder errs 0,
  every strand morning carries tool + cutInfo + inventory + stash +
  kcal + ticks + pack, no disagreements between tier and canFell);
  AND (b) determinism: a re-run of the 15215 ON leg reproduces the
  judged file byte-identically; AND (c) confirm complete (see
  Staging: all 18 confirm legs, errs 0, every strand morning fully
  recorded); AND (d) the 15215 stash-fetch reconciliation is
  DETERMINATE as defined above; AND (e) at least one strand-morning
  transcript sense-read (SENSE-TESTING LAW: read a full still-evening
  day + its morning record end to end and judge meaning, not counts).
- DIAG-NO-GO otherwise (incomplete recorder, indeterministic census,
  indeterminate reconciliation, or no sense-read). A joint count of
  ZERO is NOT a DIAG-NO-GO: for a diagnosis, a complete, deterministic
  zero with named failing gates is a successful answer. Conversely
  a joint count above zero does not by itself make DIAG-GO — the
  recorder, determinism, confirm, reconciliation, and sense-read bars
  must still all hold.
- NO-GO is reserved for a failed instrument that cannot be repaired
  within DIAG scope (e.g. the recorder perturbs trajectories: judged
  legs' strand sets differ from the tickfell control shape with no
  recorder-neutral explanation — see Recorder neutrality below).

## Staging

- PILOT (gate only, never judged): seed 15215, guard + ON legs, into
  sim-jointgate-b-corpus-pilot. Pilot bar: recorder complete as in
  (a) + strand mornings identifiable + determinism re-run started.
  Pilot files are NEVER mixed into judged corpora.
- CONFIRM (judged band, only if the pilot passes its bar): the bank
  band 15003, 15009, 15091, 15211, 15220, 15221, 15337, 15376, 15439
  (9 seeds, >= 8 as required) x guard + ON = 18 legs, into
  sim-jointgate-b-corpus-confirm. 15215 is NOT re-counted in the
  confirm band (pilot seed, reported separately). If the pilot fails
  its bar, NO confirm spend: report DIAG-NO-GO with the pilot evidence.
- DETERMINISM: re-run of the 15215 ON pilot leg into
  sim-jointgate-b-corpus-determinism; byte-identical to the judged
  pilot file required for DIAG-GO.

## Recorder neutrality (anti-perturbation guard)

The recorder makes no verb calls, writes no state, draws no RNG. As
a check, the pilot's strand sets (still evenings per leg) are compared
against the tickfell control shape (guard still 7-9, ON still 7-16 on
15215). A mismatch does not by itself fail the run — base drift is
possible — but it must be explained in the evidence file (e.g. base
moved between f239efe48 and the tickfell base, with the differing
evenings named). An UNEXPLAINED mismatch (recorder draws RNG or
writes state) is NO-GO.

## Instruments (new, this arm)

- scripts/jointgate-trace-b.js — recorder driver adapted from
  scripts/kcalshort-trace-b.js (same warmed stack, same evening/
  morning record shape, plus: spawn snap, per-morning tool + cutInfo
  + fell-target BFS + full inventory/equipped + stash ids + vessel
  id, full day lines on still-refused creek evenings for the
  sense-read). Env gates asserted FATAL. OUTDIR override only.
- scripts/analyze-jointgate-b.js — pure reads: strand extraction
  (lackingline method: still creek evenings, maximal runs), joint
  census per leg, per-gate fail table, pack-ready / no-target splits,
  stash-fetch reconciliation table (spawn -> day-2 morning -> first
  axe morning), guard-vs-ON comparison on identical seeds.
- scripts/test-jointgate-b.js — proof: unit cases for the joint
  definition (fed/axe/roomy boundaries, pack-ready exclusion,
  no-target roomy-null, tier/canFell agreement) + fell-target BFS
  cases + corpus checks (completeness, errs 0, determinism
  byte-identity, tracked-diff guard src/ + scripts/policies/ empty
  vs pinned base).
- §15 panel: not applicable, as declared by tickfell and adopted here
  — scripts/balance-panel.js runs sweep-compare registry policies on
  150-day horizons with its own scorecard; it cannot express the
  nighttravel+woodcarry+woodwarm strand stack, the 30-day
  creek-evening census, or an env-gated recorder, and a 150-day
  win/vest panel would measure a different question on a different
  substrate. The comparison here is guard-vs-ON legs on identical
  seeds through the census analyzer, and is never labeled a panel
  comparison.

## Wall numbers (declared non-observable, in advance)

On a 30-day pre-seat census, national / table / wins are NOT
observable as reachability (structurally unreachable in this band,
not a wall measurement). The evidence file will report observed
counts (expected 0) as structural zeros and median survival as the
30-day ceiling where it applies — never as wall numbers, and never
fabricated. Wave reach (maxWaveUnlocked) IS observable and reported.

## Metric review (carried into the evidence file)

- The ROUTINE_ALLOWANCE (40) is unvalidated by any fired fell; its
  reuse here is for comparability with tickfell only. If a joint
  morning ever fires a fell in a future arm, the allowance must be
  audited against actual evening ticks before being trusted.
- The joint definition counts only needs-wood strand mornings. A
  reader who wants "joint on ALL strand mornings" can recompute it
  from the reported pack-ready count — the denominator choice is
  stated here so it cannot be re-scored mid-run (§14 binding).
- Fed uses MORNING kcal, not evening kcal: evening kcal depends on
  the day's routine forage, which the morning cannot know. A morning
  that is fed at wake but unfed by evening is still joint at the
  gate — the gate judges the morning decision point, not the outcome.
