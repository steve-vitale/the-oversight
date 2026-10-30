# sim-stashfetch-b — PREREG (binding, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-stashfetch-b, axis food-economy
(daytime-wood). Worktree sim-stashfetch-b. Game-code arm: ONE new vessel
stash-fetch step (villager-build.js), plus recorder reuse + analyzer +
proof test. No hatchet grants, no generation changes, no vest / courtship /
warmth touches. Main tree never touched. Sibling trees never touched.

## Question (from sim-hatchequip-b, landed bec2c000b)

Stashed hatchets are never equipped by vessels: the vessel is never
offered the stash choice (villagerGearUp's stash block needs acquire=true;
only two NPC departure sites pass it; competent gearUp scans inventory /
equipped only). Corpus: stashed hatchet left the stash 0/4 vessels,
vessel-targeted gearUp calls 0/16 seeds vs 1,373 NPC calls. Named next
fix: a stash-fetch equip step. Acceptance test (hatchequip's own words):
re-run the hatchequip recorder on seeds 16103/16106/16110 and show the
stashed hatchet now leaves the stash / gets equipped.

## Fix design (pre-registered, minimal)

- New Game method `vesselStashFetch()` in src/js/villager-build.js,
  called from `villagerBuildDay()` (the endDay daily tick, sleep path —
  so it runs in live play and in sims with no policy change).
- Gate: vessel at haven (`playerAtHaven()`) — a fetch from "their space
  in haven" while away would be a teleport. Probe (pre-prereg,
  scripts/probe-stashfetch-haven.js, seed 16103): vessel at haven at
  20/20 sleeps, so the gate does not starve the fetch on this substrate.
- Scope: WEAPONS ONLY, own stash only (person.stashed of the CURRENT
  vessel, Game.villagerId). Best stashed weapon whose slot bonus beats
  the scholar's currently equipped weapon in that slot (empty slot
  counts as beaten); at most one fetch per day. Fetched item moves
  person.stashed -> scholar.inventory in the scholar item shape
  (mirroring mantleBecome's toScholarItem: bonded, owner = vessel).
  Equipping itself is left to the normal path (policy gearUp in sims,
  player UI in live play) — the fix offers the choice, it does not force
  the wield. Narrated via Game.say at fetch time (no silent actions);
  the fetch also fires a `tele('vessel_stash_fetch', ...)` record.
- Explicitly NOT done: no armor fetch (separate blank; armor already has
  its own landed conversion work), no communal-armory draw for the
  vessel, no change to villagerGearUp's gates or acquire sites, no
  change to spawn pools / choosePersonalFive / drop tables, no policy
  default flips. The recorder driver runs UNCHANGED (behavior-neutral
  wrappers) so before/after traces are comparable.

## Primary metric

Per acceptance seed (16103, 16106, 16110), the hatchequip recorder trace
(reused verbatim, OUTDIR sim-stashfetch-b-corpus): does the spawn
vessel's stashed hatchet leave person.stashed AND enter the scholar kit
(inventory or equipped) while the spawn vessel still lives — i.e.
before its first wholesale kit-change morning (16103 d16, 16106 d18,
16110 d9, per the baseline corpus)? A seed counts EQUIPPED if the
hatchet reaches scholar.equipped in that window, FETCHED if it reaches
scholar.inventory (kit) but is not wielded (a better weapon winning the
slot is a real choice, not a fetch failure).

## GO threshold (binding)

GO iff (EQUIPPED on >= 2 of 3 acceptance seeds) OR (FETCHED on >= 2 of
3 AND the cost bar below holds). A miss is NO-GO, never re-scored
mid-run. If the fix fails its bar, report KILLED honestly with numbers.

## Cost bar (binding, secondary)

Recorder band 16101–16116 before (hatchequip baseline corpus) vs after:
village-lost count <= baseline + 1 (baseline: 1/16, seed 16103 d50) AND
median daysAlive >= 0.8x baseline median (baseline median 60, capped).
Balanced-panel compare (below) is supporting evidence: a
regression_signal on a survival metric is investigated same-run and
reported, but per MEASUREMENT.md §15 the panel never overrides this
prereg verdict.

## Horizon + why

60 days, death-aware (runDays stops at Game.over), matching hatchequip
exactly: the acceptance windows close by day 18 at the latest, and 60d
covers the full axe window plus the cost-bar survival read.

## Seeds / policies / substrate (identical to hatchequip guard leg)

Fresh band 16101–16116. POLICY=nighttravel, WOODCARRY=1, WOODWARM=0
(guard leg), COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1. Pilot: 16101–16108 (contains acceptance seeds 16103,
16106). Confirm: 16109–16116 (contains 16110). Judge only after both;
no judged leg runs before this prereg commit.

## Balanced panel (§15, supporting instrument)

- Before panel (base code, built AFTER this prereg commit, BEFORE any
  src change): node scripts/balance-panel.js --out
  evidence/2026-10-30/sim-stashfetch-b-panel-before --seeds
  16101,...,16116 --policies competent --days 60
- After panel (fix applied): same command with --out
  .../sim-stashfetch-b-panel-after
- Compare: node scripts/balance-panel.js compare --before
  <before panel.json.gz> --after <after panel.json.gz> --out
  evidence/2026-10-30/sim-stashfetch-b-panel-compare ; attach the .md.
- Only panel.json.gz + compare .md/.json are committed; cases/ caches
  are deleted, never committed.
- Panel substrate is the standard competent substrate (not the
  nighttravel recorder substrate) — stated, not hidden. Its role is the
  cost-bar cross-check, not the primary verdict.

## Instruments

- scripts/hatchequip-trace-b.js — REUSED VERBATIM (OUTDIR override to
  evidence/2026-10-30/sim-stashfetch-b-corpus). Baseline corpus:
  evidence/2026-10-30/sim-hatchequip-b-corpus (committed, hatchequip-b).
- scripts/analyze-stashfetch-b.js (new) — per-seed FETCHED / EQUIPPED /
  window verdicts + band cost-bar numbers, before vs after.
- scripts/test-stashfetch-b.js (new) — proof: unit-level fetch behavior
  on synthetic scholar/person fixtures (beats-slot, loses-to-better,
  away-from-haven gate, one-per-day, no grant, stash-only-own) +
  corpus assertions (acceptance seeds, cost bar).
- scripts/probe-stashfetch-haven.js — pre-prereg gate probe, NOT a
  judged leg, kept for the record (not committed as evidence).

## Sense-test (law)

Read the Game.say hatchet lines captured by the recorder in the after
corpus for at least one acceptance seed: the fetch moment must read as
a person remembering their own axe at their space, and the equip moment
must follow through the normal gear path. A silent fetch is incomplete.

## Metric review (section in the evidence file, filled at write time)

Doubts about the metric itself go here for the NEXT run; they do not
re-score this run.
