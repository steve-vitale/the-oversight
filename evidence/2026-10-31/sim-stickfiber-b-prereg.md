# sim-stickfiber-b — PRE-REGISTRATION (written BEFORE any judged sims)

Run: Loop B worker, arm sim-stickfiber-b, axis scale-onramp, next blank
(2) from run fleshout-loop-b-20261031T0249Z. DIAG ONLY: zero src/js,
zero policy-default flips, zero edits to existing policy files. The
deliverable is a landed instrument set + evidence + ranked next arm,
not a game change.
Worktree branch: sim-stickfiber-b. Base anchor at prereg time: the
worktree HEAD at first judged sweep (recorded per seed as
anchorCommit in the per-seed JSONs; supply-b ran on 7a297468408c).

## What prior work already settled (reconciliation, not re-proof)

- sim-supply-b (2026-10-31): pile stick = 0 and fiber = 0 on every
  daily snapshot of all 16 seeds (85101-85116) while stones pile to
  15-848; all 36 bow pocket calls material-blocked at the recipe
  check; 0 craft attempts, 0 arrows/bolts ever produced; sling
  pocketing works when called (9/11). Its static source audit named
  candidate paths (stone duty, storage inflow wrap, scholar
  donateMaterial, betrayal +4 fiber, scholar-only clearBrush /
  deadfall / carexplore gains, no branch->stick conversion) but did
  NOT claim a complete inventory: it was a grep of materials writes
  plus the measured trajectory, not an exhaustive producer census.
- sim-ammo-a (2026-10-31): dry fighters never departed, so
  departure-only pocketing cannot reach them.
- Tool gate (run 0117Z strandfix-morning): a stone knife cannot fell
  (axe tier required) — any wood-seeking routine spec must name an
  axe-class tool gate, not assume knife felling.

## Question (two halves, both DIAG)

(1) CODE INVENTORY: every path in the codebase that can produce
sticks or fibers into the village pile or a fighter's pack —
gather/forage routines, loot, recipes, crafting, events, trades.
For each path: producing routine, trigger/conditions, tool/skill
gates, and whether it ever fires on the supply band.
(2) SIM CENSUS on the supply band: pile stick/fiber trajectories
per seed, any production events (count + source), craft-call
material blocks, and whether ANY seed ever produces a stick or
fiber by any path. If production is zero everywhere, say so
plainly and name what a source routine would need (trigger, tool
gate, location/routine shape) — specification only, no game change.

## Inventory method (completeness bar, stated up front)

Searches, all run over src/js + src/data in this worktree, results
saved in the evidence file's inventory table and in the inventory
script's output:
(a) Material-name grep: `stick` and `fiber` (word-boundary, plus
    `materials.stick`, `materials['stick']`, `addMaterial`,
    `donateMaterial`) over all src/js, with every hit classified
    as pile-write / pack-write / read-only / unrelated (e.g.
    sharpened_stick weapon, stick as verb).
(b) Producer-function grep: `stash` writes (`materials.`, `pile`,
    `stashState` callers that mutate materials), `addMaterial`
    callers, `donateMaterial` callers, `villagerPocketAmmo` and any
    `npcCraft`/`villagerCraft` path, loot/drop tables in src/data
    mentioning stick/fiber, event/trade files mentioning stick/fiber.
(c) Routine-name sweep: every function whose name contains
    gather/forage/fell/chop/collect/harvest/loot/donate/craft/trade
    in src/js, checked for a stick/fiber output even when the
    material name is a variable (dynamic material id) — this is the
    anti-miss net for paths (a) cannot see.
(d) Cross-check: the storage inflow wrap's material roll table and
    the 'stone' duty are read in full; the recipe table for
    arrow/bolt is read in full (inputs, outputs, any byproduct).
Zero unexamined paths: the inventory script
(scripts/stickfiber-inventory-20261031.js) prints the hit counts
for (a)-(c) and the classified list; any hit left unclassified at
evidence time is a NO-GO under verdict item 1, not a footnote.
Scholar-only paths are inventoried and marked scholar-only (they
do not count as village-pile production unless a deposit path
exists); a path counts as "fires on the band" only if the census
or a band trace shows it, never from code presence alone.

## Substrate (shared supply band, so numbers are comparable)

Seeds 85101-85116, policy stack
withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))),
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1, 200d death-aware cap (dead villages stop, +10d tail max).
Instruments: scripts/ammo-diag-20261031.js (AMMODIAG=1, read-only,
det-gate proven by sim-ammo-a) + scripts/supply-diag-20261031.js
(SUPPLYDIAG=1, read-only, det-gate proven by sim-supply-b) +
the new scripts/stickfiber-diag-20261031.js (STICKFIBERDIAG=1,
read-only: daily pile snapshot diffs as production-event records,
pocket-call pile deltas, and call counters wrapped around every
Game-level producer routine the inventory finds that is wrappable
as a method; draws NO RNG, writes NO game state, calls neither
stashState() nor agencyState()).
Sweep: scripts/stickfiber-sweep-20261031.js (supply-sweep logic +
stickfiber fields, writes
evidence/2026-10-31/perseed-stickfiber-b/baseline/s<seed>.json
ONCE, on purpose). Analyzer:
scripts/stickfiber-analyze-20261031.js. Proof:
scripts/test-stickfiber-20261031.js (det-gate 60d identical
trajectories with/without the new instrument, static read-only
scan, wrap fixtures, real-sweep gate byte-identical re-run).
The proof must be green BEFORE judged sims are judged (its scratch
60d sweep is instrument validation, not judged data).
Note on comparability: the census re-runs the band rather than
re-reading supply-b's corpus, so anchor movement is visible as a
trajectory difference if any; per-seed fight identity vs supply-b
is reported, never assumed.

## Census (per seed, per day, per pocket call)

- Daily pile trajectory: stick/fiber/stone/branch per day (from the
  supply instrument's daily rows, re-analyzed), aggregated to
  ever>0, max, first-positive day, days-positive, final pile.
- Production events: any day-over-day stick or fiber increase in
  the daily snapshot series, any pocket-call pile increase in
  stick/fiber, any wrapped-producer counter > 0, any end-of-run
  pack/stash stick/fiber gain attributable to a producer (packs
  carry materials only if a path writes them — recorded as such).
  Each event names its source routine if identifiable, else
  "unattributed daily increase" with the day and delta.
- Craft-call material blocks: bow/crossbow pocket calls classified
  as in supply-b (material-blocked naming the short material(s),
  craft-attempted, not-a-craft-path), band totals.
- End-of-run census: packs + own stashes + ammoCraft totals for
  arrow/bolt, plus pile final stick/fiber.
- Wall numbers: national / table / wins / wave 4 unlocked /
  wave 5 unlocked / median + max survival, from the per-seed JSONs,
  same caveats as supply-b (table/win flags are policy-stack
  substrate flags, not ordinary-play claims).

## Verdict (DIAG only — judged exactly as written)

DIAG-GO iff ALL of:
1. Inventory completeness: every grep hit from (a)-(c) is classified
   in the evidence inventory table (zero unexamined paths), each
   with routine, trigger/conditions, tool/skill gates, and a
   fires-on-band verdict.
2. Census coverage: 16/16 seeds with a complete daily pile series
   (zero pile-null days), zero instrument errors on all three
   instruments, and a production-event count (zero counts as a
   complete result, not a missing result).
3. The band verdict answers, in plain words, whether ANY seed ever
   produces a stick or fiber by any path, with the per-path
   production counts; if zero everywhere, it names what a source
   routine would need (trigger, tool gate, location/routine shape)
   as specification only.
4. Sense test done (below) and wall numbers stated honestly.
DIAG-NO-GO otherwise. A miss is NO-GO, never re-scored mid-run.
Any metric doubt goes under "metric review" in the evidence file
for the NEXT run.

PILOT GATE: 8 seeds (85101-85108) before any confirm spend. Pilot
passes to confirm iff census completeness on pilot seeds is 100%
(zero pile-null days), instrument errors = 0, the proof test is
green, and pilot fights > 0 (zero wave-4 fights is a substrate
failure, not a pass). Confirm: seeds 85109-85116 (band total 16)
if the pilot passes.

## Sense-testing (SENSE-TESTING LAW)

Read at least one sample villager routine/transcript stretch where
a stick/fiber move would occur (a gathering duty, a return home,
a craft moment, a dry-fight line) and judge whether the absence
reads as a real gap — a villager doing a job that should plausibly
bring sticks home but bringing something else, or a fighter
standing by a pile that should hold sticks — never just a zero
count. Quote the stretch; judge meaning/coherence.

## Panel (§15)

scripts/balance-panel.js is NOT APPLICABLE, none fabricated — same
rationale as sim-supply-b / sim-ammo-a Stage 1: it is a
policy-comparison driver on one frozen root, it cannot express
this arm's substrate (leadfeast + seatdrive + windefer +
fullseat-diag stack is not a registry policy), and this arm has no
before/after comparison at all (single-base census + code
inventory). The judge is the pre-registered inventory-completeness
+ census-coverage bar above.

## Perception law (Steve 2026-10-28)

No roster/list-fed fix is proposed. Any source-routine
specification must come through sensed contact and real routines
(a villager going out, seeing/gathering, and returning with
material) — no magic "who needs what" list feeding a decision.

## Metric review (for the NEXT run, never a re-score of this one)

Doubts about the metrics above go here in the evidence file after
the run; they do not change this run's verdict.
