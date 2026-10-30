# sim-axeacq-b — PREREGISTRATION (written BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1130Z,
arm sim-axeacq-b, axis food-economy (axe acquisition).
Worktree sim-axeacq-b. DIAG ONLY: measurement, zero src/js
changes, zero policy-default changes, zero default flips, no
behavior probe built, run, or judged. Sibling trees
(sim-floortime-a, sim-dissolve-a, sim-vests-b, sim-rankconv-b)
are never touched. Main tree never touched.

## The question (backlog #1510, sim-findings.md 2026-10-30)

Loop-B arm sim-walktree-b (run fleshout-loop-b-20261030T1030Z,
evidence/2026-10-30/sim-walktree-b.md) proved the walk-to-tree
middle fails on three independent gates, one being the AXE GATE:
cutInfo('bigtree').canFell is FALSE on all 11 stranded mornings
because the bot carries a Stone knife (whittle tier) and no
axe-tier tool. The design brief left open (c): whether the bot
is SUPPOSED to hold an axe by day 7 on this trajectory, or
axe-less-ness is intended. This arm answers: is axe acquisition
broken, unbuilt, or simply later than day 7?

## Canon (read before judging)

- docs/CANON.md read first, then docs/BALANCING.md (wood-duty
  yield is the only axe-adjacent number; it prices axe work, it
  does not say who holds an axe), docs/TIME-ECONOMY.md (action
  costs), docs/DESIGN.md (systems design). NO canon doc covers
  axe/tool acquisition, tool crafting, or who starts with what —
  stated here instead of invented canon. Everything below about
  acquisition channels is a code read, labeled as such.
- Perception law (Steve 2026-10-28, binding): the recorder reads
  game state; it never feeds a roster/list to a villager decision.
  No villager behavior is steered by this arm.

## Engine facts (code reads, verified before any judged leg)

- Axe-tier = woodcut tier 'fell' (storage.js TIER_RANK:
  none 0, whittle 1, brush 2, prune 3, fell 4).
  cutInfo('bigtree').canFell is true iff the vessel's best
  woodcut tier (inventory + equipped, via Game.woodcutTier())
  ranks >= fell. Game.cutInfo / Game.woodcutTier are live
  engine reads, used by the recorder verbatim.
- The ONLY fell-tier item in src/data/items.json is the Hatchet
  (class weapon, melee +15, "Chops wood", tool.woodcut 'fell',
  findable true, NO lootTier field so it defaults to 1, NO
  origin field so it is not alien). The full woodcut ladder in
  items.json: stone_knife = whittle, machete = brush,
  hand_saw = prune, hatchet = fell. Nothing else carries a
  woodcut tag.
- NOT CRAFTABLE (code read): 'hatchet' appears NOWHERE in
  src/data/recipes.json (full recursive scan, zero hits), so no
  recipe, and no competent daily-craft attempt can produce one.
  The competent policy's craft attempts run the one recipe
  system; a hatchet is outside it.
- NOT SCAVENGEABLE (code read): the ruin loot pool is
  regionScavenge() = regions.json people.scavenge, falling back
  to game.js SCAVENGED = canned food + rare medicine only;
  'hatchet' appears nowhere in regions.json. Ruins yield food
  and medicine, never tools.
- NOT A CONTEST GRANT (code read): grantWeapon values found in
  contests/js are hunting_spear and stone_knife only — no
  hatchet grant.
- SPAWN LOTTERY (code read, game.js genStartingItems): the
  vessel's opening kit takes tool x2 (unfiltered), weapon x1
  filtered to (lootTier || 1) <= 2 AND origin !== 'alien',
  clothing x2, sentimental x2, plus one wildcard from anywhere
  non-food with the same <= 2 / non-alien filter. The hatchet
  passes every filter (default tier 1, no origin), so it CAN be
  a starter weapon — and occupation itemBias FAVORS it for
  hunting guide (weapon bias), carpenter (tool bias), and
  trail crew lead (weapon bias). Whether a given seed's vessel
  starts with one is a lottery over the seed's roster card and
  bias pools, measured per seed, never assumed.
- OTHER CHANNELS THAT EXIST IN CODE (measured only if the
  census shows one firing; never assumed to fire): individual
  ownership (villagers choose their own 5 from their pool;
  stashed items are theirs, no village armory, no borrowing);
  corpse loot (a killer loots the body — the item moves to the
  killer's pack); deliberate give/trade (an owner gives/trades
  deliberately). A villager-held hatchet is therefore NOT
  vessel-usable: ownership blocks borrowing, so the census
  carrier is the VESSEL, with villager holdings reported
  separately as transfer opportunity, never as acquisition.
- Bot vessel: sim-harness setupGame(Game) with no occupation
  plays generatedRoster[0] (the first offered card, seed
  dependent). Its occupation and day-1 inventory are recorded
  per seed — the spawn-lottery question is answered from those
  two fields, not from the bias pools in the abstract.

## Definitions (the judged quantities)

- AXE-TIER HELD (per morning snap): Game.cutInfo('bigtree')
  .canFell true, equivalently Game.woodcutTier().tier ===
  'fell'. The recorder stores the tier, the tool name, and the
  vessel inventory itemIds + equipped itemIds at the snap.
- FIRST AXE DAY (per seed): the first loop-day whose MORNING
  snap (post-sleep, pre-daily, loop-days 2+; plus the day-1
  spawn snap) shows AXE-TIER HELD. Day 1 = spawn (the vessel
  starts holding it). A seed that never shows it in its run is
  BLOCKED, with its blocking gate named (see below).
- SOURCE (per acquisition, from RECORDED events only, never
  inference): the day's captured say lines are scanned for
  'hatchet' (case-insensitive). spawn = hatchet present in the
  day-1 spawn snap inventory. loot = a corpse-loot line naming
  the Hatchet that day. find = a ruin/scavenge line naming it.
  grant = a contest/System grant line naming it. trade/gift =
  a give/trade line naming it. other-named = some other line
  naming it (quoted in the evidence). unrecorded = the
  inventory gains a hatchet on a day with NO line naming it
  (reported as unrecorded, never guessed into a channel).
- BLOCKING GATE (per blocked seed): spawn-miss (vessel did not
  start with a hatchet) + no acquisition channel fired in the
  run window, with the channel inventory stated: not
  craftable, not scavengeable, no grant observed, no loot /
  trade observed. If a channel exists in code but never fires,
  that is "unbuilt-or-unfired on this trajectory", named as
  such — not "broken" (broken requires a firing attempt that
  fails; the recorder logs any hatchet-naming line, including
  refusals, so a failed attempt would be visible).
- STRANDED MORNING (column b): walktree definition verbatim —
  the morning snap of a loop-day whose evening row is bucket
  creek + rescued false. Axe presence at those mornings is the
  column-(b) census.
- CLASSIFICATION (every seed, both columns): ACQUIRED
  (day + source + carrier) or BLOCKED (named blocking gate).
  Zero unclassified seeds is a DIAG-GO condition.
- VERDICT TAXONOMY (the named answer): BROKEN = an acquisition
  channel exists and is attempted but fails (refusal / loss /
  misroute visible in lines). UNBUILT = no channel exists on
  this trajectory that could deliver a hatchet after spawn
  (craft absent, scavenge absent, grant absent — and loot /
  trade never fire in the window). LATER-THAN-DAY-7 = axes
  arrive, but after day 7 (median first-axe day > 7, with the
  distribution shown). INTENDED = the evidence shows
  axe-less-ness is the designed state (a canon doc or a code
  comment stating it — none found in the reads above, so this
  verdict requires new evidence found during the run, and is
  otherwise unavailable; the arm will NOT invent it).

## Columns

- (a) FRESH-SEED CENSUS, competent play. Substrate verbatim
  from walktree (so the census is on the same trajectory
  family that stranded): POLICY=nighttravel, WOODCARRY=1,
  WOODWARM=0 (guard leg only — warmth affects evening fires,
  not inventory, so the guard leg isolates acquisition; the
  ON leg is re-derived in column (b) for stranded mornings),
  COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
  DEPOSITGATE=1. Recorder driver scripts/axeacq-trace-b.js
  (adapted from scripts/walktree-trace-b.js: same day loop,
  same policy stack, READ-ONLY morning-snap additions —
  inventory ids, tier, canFell, vessel occupation, spawn snap
  — plus hatchet-line capture over the day lines the master
  driver already captures; NO behavior change, NO microMove,
  NO cutTree, NO state edit beyond what the master driver
  already does). Analyzer scripts/analyze-axeacq-b.js (pure
  reads: first-axe day/source/carrier per seed, blocked-gate
  classification, wall numbers, sense-read day lines).
- (b) BANK RE-DERIVATION. The walktree bank
  (15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337,
  15376, 15439), DAYS=30, BOTH legs (guard WOODWARM=0 and ON
  WOODWARM=1), same driver, OUTDIR override only. Judged
  numbers are fresh — nothing is quoted from walktree as the
  measurement. EQUIVALENCE BAR: guard + ON legs must
  reproduce walktree's fresh-leg counts exactly (guard
  creek 15 / still 4 / rescued 11; ON creek 21 / still 11 /
  rescued 10) AND the recorder legs must reproduce THOSE
  fresh legs exactly on every per-seed creek/still/rescued
  count, proving the recorder behavior-neutral. Divergence
  is DRIFT to report and investigate (driver diff first,
  then base diff), never hidden, and column (b) is not
  judged until equivalence holds or the divergence is
  explained.

## Prereg (binding)

- PRIMARY METRIC: per-seed first axe-tier day + source +
  carrier on column (a); axe-tier presence at every stranded
  morning on column (b).
- DIAG-GO THRESHOLD (both columns must pass): (1) every seed
  classified ACQUIRED (day+source) or BLOCKED (named gate),
  zero unclassified; (2) recorder errors zero on judged legs;
  (3) determinism gate holds (below); (4) column (b)
  equivalence bar holds (or divergence explained); (5) a
  sense-read is written for one sample villager's days around
  tools. If any condition fails, DIAG-NO-GO with the exact
  blocker named — never re-scored against a friendlier
  metric mid-run.
- HORIZON + WHY: column (a) cap 60 loop-days; column (b)
  cap 30 loop-days (walktree parity). Axe acquisition is an
  early/mid-game question, not a 180d reachability question:
  the trigger is day 7, so 60d gives ~8x the trigger window
  — long enough to cover the spawn lottery (day 1), early
  kills and their corpse loot, early trades/gifts, and the
  first contests, while staying far below win-horizon runs.
  DEATH-AWARE: runDays stops at Game.over, so dead /
  village-lost runs end at death with NO tail (the +10d tail
  cap is moot — the engine, not the driver, stops the run;
  the driver adds no days after over). A seed that dies
  axe-less is BLOCKED with endReason recorded, not censored
  out: death before acquisition IS a blocking gate outcome
  (died-before-acquisition), counted separately from
  survived-without-acquisition.
- SEEDS (exact literals): column (a) FRESH BAND 16101, 16102,
  16103, 16104, 16105, 16106, 16107, 16108 (pilot) and 16109,
  16110, 16111, 16112, 16113, 16114, 16115, 16116 (confirm).
  Freshness verified BEFORE this prereg: no 1610x/1611x seed
  literal appears in evidence/2026-10-28, 2026-10-29, or
  2026-10-30 *.md files, and no evidence corpus directory
  name contains 1610x/1611x (the one 1610 hit anywhere is the
  filename run-flesh-out-loop-20261007-1610.md, a 16:10
  timestamp, not a seed). Caveat stated honestly: a full
  recursive grep over every corpus JSON was not completed
  (too slow to finish in the window); the check covers the
  task's stated surfaces — dated *.md files and corpus
  filenames. Column (b) bank literals above (walktree bank,
  deliberately reused for re-derivation).
- POLICIES: column (a) nighttravel + woodcarry, WOODWARM=0;
  column (b) same stack, WOODWARM=0 and =1. No other policy
  env varies. COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1 WOODCARRY=1 on every leg, asserted FATAL.
- PILOT GATE: 8 seeds (16101–16108) before ANY confirm spend.
  Pilot GO = all 8 classified + 0 recorder errors +
  determinism holds on 2 re-run pilot seeds. Confirm (16109–
  16116) runs ONLY on pilot GO; otherwise the arm stops and
  reports DIAG-NO-GO with the blocker.
- DETERMINISM GATE: re-run 2 pilot seeds (16101, 16102) and
  1 bank seed (15215, guard leg) and require byte-identical
  per-seed JSON after stripping volatile fields (run ms and
  wall-clock-derived fields only, named in the analyzer; no
  judged field is ever stripped). A mismatch is a hard stop:
  re-run proof legs before judging anything.
- BALANCED PANEL (§15): NO compare .md exists for this arm
  and none is fabricated. This is a single-state census
  (DIAG), not a before/after pair: zero src/js and zero
  policy changes, so there is no game-root delta for the
  panel to compare — the same standing as the walktree
  prereg. Column (b) equivalence counts are a re-derivation
  check, not a panel compare, and are labeled as such.
- METRIC REVIEW: every evidence file carries a "metric
  review" section. A miss is NO-GO, never re-scored.
- SENSE-READ: one sample villager's days around tools, read
  end to end from the fresh corpus day lines + morning snaps
  (the earliest-acquisition seed if any acquires, else the
  longest-surviving blocked seed): do they act like people
  around tools, or is anything robotic? Judged for meaning,
  not counts.
- WALL NUMBERS (reported for both corpora, never judged
  against): national / table / wins, wave reach (max wave
  unlocked + wave kills), median survival (loop-days run /
  endReason). Read from runDays results + end-state reads
  (scaleRank / integrationStage / standing, try/catch, nulls
  reported as nulls).

## Base pin (binding)

- PINNED BASE: worktree HEAD at prereg writing time, full
  hash 082cfa19e088fa82ef4df3c38d0c85277d2ddda7. The prereg
  commit adds ONLY this file, so the legs run on pinned-base
  game code verbatim. If master moves under this run (loop A
  merges), rebase onto the new tip and re-run proof legs
  before judging.
- Tracked diff guard: at evidence time, `git diff` of src/
  and scripts/policies/ between pinned base and final tree
  must be EMPTY. The recorder driver, analyzer, and proof are
  measurement scripts only; no policy file is created,
  edited, or wired.

## Implementation (measurement first, no behavior)

- MASTER DRIVER (verbatim, OUTDIR override only):
  scripts/walktree-trace-b.js is the behavior reference for
  column (b) equivalence; scripts/axeacq-trace-b.js adapts it
  with READ-ONLY morning-snap axe fields + spawn snap +
  hatchet-line capture. Env asserted FATAL on every leg.
- PROOF: scripts/test-axeacq-b.js — fixtures (tier ladder:
  stone_knife whittle / machete brush / hand_saw prune /
  hatchet fell; cutInfo canFell true iff fell), determinism
  legs, substrate legs (recorder vs master equivalence on
  the bank), and analyzer legs on synthetic corpora.
- EVIDENCE: evidence/2026-10-30/sim-axeacq-b.md (+ per-seed
  JSON corpora under evidence/2026-10-30/sim-axeacq-b-corpus-*,
  inside this worktree, NEVER /tmp). Per-seed axe census
  table in the evidence file. New backlog items are listed
  in the worker report for the coordinator to append (the
  worker must not touch the main tree or the goal
  hidden_files outside its worktree).
- METRIC REVIEW section in every evidence file (this prereg
  is not an evidence file; the evidence file carries it).
