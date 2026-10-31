# sim-axefirst-b — prereg (binding; committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T0841Z,
arm sim-axefirst-b, axis food-economy. Worktree sim-axefirst-b.
DIAG ONLY: measurement, zero src/js changes, zero policy-default
flips, zero edits to any existing policy file, driver, analyzer, or
proof file. New files only: this prereg, the recorder driver +
analyzer + proof scripts named below, the evidence file, the
corpora/censuses/compare they produce, and the design proposal
section inside the evidence file (proposal only, no game change).
Sibling worktrees never touched; main tree never touched. Nothing
is merged by this worker (the coordinator merges); do NOT push,
bump versions, or verify live.

## Canon read first

docs/CANON.md read, then docs/TIME-ECONOMY.md. Fell cost is an engine
constant, verified in code (src/js/game.js cutTree: 96 ticks + 80 kcal;
src/js/storage.js woodcutTier/cutInfo: tier 'fell' is the only tier
with canFell true). Axe-tier inventory, verified in data (not assumed):
src/data/items.json carries exactly four woodcut tags — stone_knife
'whittle', hatchet 'fell', machete 'brush', hand_saw 'prune' — so the
HATCHET is the only axe-tier (fell) weapon in the game data. No
hatchet entry exists in src/data/recipes.json (checked): crafting is
kept as a source class because a route could still be narrated as a
craft, but no recipe is known to produce one. No canon doc covers an
axe-supply-first design — stated here instead of inventing canon.
Standing rules that bear on it: CANON.md's "no silent actions" and
the perception law (Steve 2026-10-28: a villager knows only what it
senses). The recorder therefore reads only the vessel's own state and
the occupied tile's own 9x9 detail grid, never a roster or another
tile.

## Prior evidence read before designing anything

- evidence/2026-10-31/sim-jointgate-b.md (+ prereg): on the census
  stack, 15215's spawn stash is [multitool, hunting_spear,
  work_gloves] with no axe-tier weapon; the day-1 fetch fires and
  fetches spear + gloves; stone knife arrives day 7 intraday; no axe
  is ever held in 30 days on either 15215 leg; the only seed holding
  an axe in 30 days on the 10-seed bank is 15337 (hatchet fetched
  day 1, first-axe evening day 1 / morning day 2). Joint 0/7 on
  15215 ON needs-wood strand mornings. This arm does NOT re-judge
  the jointgate corpus: fresh census on current master only.
  Jointgate numbers are context for comparison, never the verdict.
- evidence/2026-10-31/sim-stashfetch-a.md (+ prereg): the ordinary
  daily routine fetches the best weapon/armor at home day 1
  (vesselStashFetch / vesselArmorFetch, src/js/villager-build.js:
  once a day, at haven, own stash only, must beat the worn piece).
- evidence/2026-10-30/sim-axearrival-a.md: on the strandfix-variant
  stack, 15215's axe arrives day 15 intraday by corpse loot; on the
  warmed-only control stack the same seed NEVER holds an axe in 30
  days. The variant trajectory is a different stack — cited as an
  arrival mechanism to test against, not as this stack's evidence.
- evidence/2026-10-30/sim-axeacq-b.md (+ prereg): the axe-acquisition
  census on the 16101-16116 band (a different band from this arm's
  fresh band; not re-judged here).
- evidence/2026-10-31/sim-food-economy-round-0741-b.md (coordinator):
  the assignment — extend jointgate to a FRESH band and answer
  whether any seed ever pairs an axe-holder with a strand morning.

## The question, in one sentence

On the strand census stack, on a FRESH seed band, when does each seed
first hold an axe-tier weapon, by what supply route, when does it
first wake fell-capable, and does any seed ever pair an axe-holder
with a strand morning?

## Substrate (exact, no mid-run swaps)

Stack: warmed(woodcarry(nighttravel)) — the jointgate census stack,
verbatim. Env gates asserted FATAL in the driver:
POLICY=nighttravel, COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1, WOODCARRY=1, WOODWARM=0 (guard leg) or 1 (ON leg),
DAYS=30, STRANDFIX unset/0 and PRESSB unset/0 (both FATAL if 1:
neither is in this stack). Horizon 30 days, death-aware (runDays
stops at Game.over; dead villages stop simulating).
Pinned base: 003a9c2f391edd56f31a0f6f9f1305dfe6380a48 (worktree HEAD
at prereg writing time, after a clean rebase onto master; prereg +
instrument + corpus commits add tooling/evidence only, so all legs
run on pinned-base game code verbatim — verified by the proof's
tracked-diff guard: src/ + scripts/policies/ diff empty vs the
pinned base).

## Pre-registered definitions (frozen before any judged leg)

STRAND MORNING (M, loopDay >= 2): the previous loop-day's evening
woodcarry record has bucket 'creek' and rescued false (a still
evening), AND the vessel wakes NOT at haven (insideHaven false AND
tile != 'haven'), AND not game-over, AND not in combat. This is the
jointgate strand-morning definition, reused verbatim so strand
membership is comparable — but RE-DERIVED on current master here:
no strand set from any prior bank is quoted as current, and any
drift vs jointgate (15215 still evenings, or any bank seed's) is
named in the evidence file under "drift watch", never silently
inherited.

Per leg, the recorder captures (all reads, no verb calls, no state
writes, no RNG draws): spawn snap (stash ids, inventory ids,
equipped ids, tier) + EVERY morning snap (tool tier + cutInfo +
fell-target BFS + full inventory/equipped + stash ids + vessel id +
kcal + ticks + pack) + EVERY evening snap (tool tier + inventory +
stash + fetch flags) + fetch say-lines + per-evening hatchet lines
(day lines matching /hatchet/i) and take lines (day lines matching
/take .* from|fetch it/i) for source classification.

FIRST AXE-TIER HELD: the first loopDay on which a snap shows
woodcutTier tier 'fell'. Reported as two dates: firstAxeEvening
(first evening snap with tier 'fell') and firstAxeMorning (first
morning snap with tier 'fell'). If the spawn snap already shows
tier 'fell', the day is 'spawn' (loopDay 0). If no snap in 30 days
shows tier 'fell', the result is 'never in 30 days' (both dates
null) — a finding, not a missing value.

FIRST-AXE SOURCE (classified on every leg that ever holds one; the
classifier below runs in the analyzer over the arrival evening's
recorded lines + inventory/stash diffs, and every 'other' case
carries its quoted lines in the census):
- 'spawn': spawn snap shows tier 'fell' (hatchet in spawn inventory
  or equipped).
- 'stash fetch': arrival-day lines contain a fetch line naming the
  hatchet ("You remember the Hatchet at your space in the haven
  and fetch it"), OR the stash shrinks by the hatchet between the
  previous evening and the arrival evening with _stashFetchDay set
  on the arrival day.
- 'corpse loot': arrival-day lines contain "You take ... hatchet
  from <name>" (the corpses.js loot narration).
- 'craft': arrival-day lines name making/crafting/fashioning a
  hatchet.
- 'other': none of the above fires. The census quotes the arrival
  evening's hatchet lines + take lines + inventory/stash diff, and
  the evidence file names the mechanism if the lines show one (gift,
  trade, reward, monster loot, succession handover, etc.) or states
  'mechanism unnamed in the record' if they do not. A leg counts as
  classified iff it carries one of the five classes above; 'other'
  with quoted lines and a named-or-unnamed mechanism statement
  counts as classified (the gap, if any, is documented, not hidden).
- Succession note: if the vessel id changes on or before the arrival
  loopDay, the census records whether the axe arrived with a new
  vessel (successor's own gear) or with the continuing vessel.

FIRST FELL-CAPABLE MORNING: the first morning snap with tier 'fell'
AND cutInfo.canFell true AND a non-null fell target (the jointgate
BFS target on the wake tile). If tier 'fell' is held but no morning
has a target, the result is 'held but never fell-capable at wake'
with the held date — not a fell-capable morning.

STRAND-x-AXE PAIRING: a strand morning (definition above) whose
morning snap shows tier 'fell'. The pairing answer is the SET of
(seed, leg, loopDay) triples across all judged legs: an empty set is
the answer NO (with the seed list that was searched), never a missing
value. The pairing question is answered over the pilot + confirm
bands jointly (see Staging).

## Primary metric + GO threshold (binding)

Primary metric: the axe-first census — per seed and leg: first-axe
day + source, first fell-capable morning, strand mornings, and the
pairing set.

Verdict, judged exactly as written (DIAG verdict — the census COUNTS
are findings, never the verdict):
- DIAG-GO iff ALL of: (a) pilot census complete: every pilot leg
  carries 30 evenings + 29 mornings (or fewer only if Game.over
  ends the leg early, with the end reason recorded), recorder errs 0,
  every morning carries tier + cutInfo-or-null-target + inventory +
  stash, and every strand morning is fully recorded (tier, kcal,
  ticks, pack, target); AND (b) first-axe source classified on
  every pilot + confirm leg that ever holds an axe-tier weapon
  (classes above; 'other' only with quoted lines + mechanism
  statement); AND (c) the strand-x-axe pairing question answered
  yes/no with the searched seed list (empty set = NO, stated as
  such); AND (d) determinism: a re-run of the 15215 ON pilot leg
  reproduces the judged pilot file byte-identically; AND (e)
  strand membership re-derived on current master: 15215 still
  evenings named per leg, drift vs jointgate named (or 'no drift'
  stated with the numbers); AND (f) sense-read: at least one
  axe-arrival evening read end to end per source class present
  (minimum one), judged for meaning, not counts.
- DIAG-NO-GO otherwise (incomplete recorder, unclassified axe
  arrival, unanswered pairing question, indeterministic census,
  un-derived strand membership, or no sense-read). A pairing set of
  EMPTY is NOT a DIAG-NO-GO: for a diagnosis, a complete,
  deterministic NO with the searched seed list is a successful
  answer. Conversely a non-empty pairing set does not by itself
  make DIAG-GO — the recorder, classification, determinism, drift,
  and sense-read bars must still all hold.
- NO-GO is reserved for a failed instrument that cannot be repaired
  within DIAG scope (e.g. the recorder perturbs trajectories:
  judged legs' strand sets differ from the jointgate shape with no
  recorder-neutral explanation — see Recorder neutrality below).

## Staging

- PILOT (gate + census, never discarded): seeds 15215 (strand guard)
  + 15501, 15502, 15503, 15504, 15505, 15506, 15507 (fresh) = 8 seeds
  x guard + ON = 16 legs, into sim-axefirst-b-corpus-pilot. Pilot
  bar: census complete as in (a) + strand mornings identifiable +
  determinism re-run started. Pilot legs ARE part of the final
  census (they are fresh census legs, not throwaway); the gate
  governs CONFIRM spend only.
- CONFIRM (judged band, only if the pilot passes its bar): seeds
  15508, 15509, 15510, 15511, 15512, 15513, 15514, 15515, 15516,
  15517, 15518, 15519 (12 fresh seeds, within the 12-16 requirement)
  x guard + ON = 24 legs, into sim-axefirst-b-corpus-confirm.
  15215 is NOT re-counted in the confirm band (pilot seed, reported
  separately). If the pilot fails its bar, NO confirm spend: report
  DIAG-NO-GO with the pilot evidence.
- DETERMINISM: re-run of the 15215 ON pilot leg into
  sim-axefirst-b-corpus-determinism; byte-identical to the judged
  pilot file required for DIAG-GO.
- FINAL CENSUS: pilot 16 + confirm 24 = 40 legs. The pairing answer
  is computed over all 40 legs.

## Recorder neutrality (anti-perturbation guard)

The recorder makes no verb calls, writes no state, draws no RNG. As
a check, the pilot's 15215 strand sets (still evenings per leg) are
compared against the jointgate shape (guard still 7-9, ON still
7-16 on 15215). A mismatch does not by itself fail the run — base
drift is possible — but it must be explained in the evidence file
(e.g. base moved between 003a9c2f3 and the jointgate base, with the
differing evenings named). An UNEXPLAINED mismatch (recorder draws
RNG or writes state) is NO-GO.

## Instruments (new, this arm)

- scripts/axefirst-trace-b.js — recorder driver copied from
  scripts/jointgate-trace-b.js (same warmed stack, same evening/
  morning record shape) with READ-ONLY additions and NO behavior
  change: per-evening hatchet lines + take lines for source
  classification. Env gates asserted FATAL. OUTDIR override only.
- scripts/analyze-axefirst-b.js — pure reads: per-leg first-axe
  day + source classification + first fell-capable morning +
  strand census (jointgate method) + pairing set + drift table vs
  jointgate's 15215 still evenings (guard 7-9, ON 7-16).
- scripts/test-axefirst-b.js — proof: unit cases for the source
  classifier (all five classes + succession note + held-but-never-
  fell-capable) + fell-capable morning boundaries + corpus checks
  (completeness, errs 0, determinism byte-identity, tracked-diff
  guard src/ + scripts/policies/ empty vs pinned base).
- §15 panel: scripts/balance-panel.js runs sweep-compare registry
  policies on 150-day horizons with its own scorecard; it cannot
  express the nighttravel+woodcarry+woodwarm strand stack, the
  30-day axe-first census, or an env-gated recorder, and a 150-day
  win/vest panel would measure a different question on a different
  substrate. The arm will ATTEMPT the panel's compare path with the
  recorder rows and record any refusal verbatim in the evidence
  file; the judged comparison is guard-vs-ON legs on identical
  seeds through the standalone census analyzer, attached as
  sim-axefirst-b-compare.md, and is never labeled a panel result.

## Wall numbers (declared non-observable, in advance)

On a 30-day pre-seat census, national / table / wins are NOT
observable as reachability (structurally unreachable in this band,
not a wall measurement). The evidence file will report observed
counts (expected 0) as structural zeros and median survival as the
30-day ceiling where it applies — never as wall numbers, and never
fabricated. Wave reach (maxWaveUnlocked) IS observable and reported.

## Metric review (carried into the evidence file)

- The source classifier's 'craft' class has no known recipe behind
  it (recipes.json checked, no hatchet entry): if a 'craft' arrival
  ever appears, its lines must be quoted in full before the class
  is believed — a narrated craft without a recipe would itself be a
  finding about narration vs mechanics.
- The 'other' class is a documentation device, not a verdict: an
  'other' arrival with an unnamed mechanism still counts as
  classified for bar (b) only because its lines + diffs are quoted
  and the gap is stated. It must not be reported as a known route.
- First-axe EVENING vs MORNING: an axe fetched during a day shows
  on that day's evening snap and the NEXT morning's snap. Both
  dates are reported so no arrival is dated a day late by snap
  choice; the source classifier reads the arrival EVENING's lines.
- Strand membership is re-derived per leg from that leg's own
  woodcarry records, never from a prior bank's strand list. A seed
  that strands on one leg but not the other is reported per leg.
