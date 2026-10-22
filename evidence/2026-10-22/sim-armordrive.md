# sim-armordrive — "ARMOR THE VILLAGE" (axis scale-onramp)

Run fleshout-20261022T1915Z, arm sim-armor-drive (claim fleshout-20261022T1915Z.json).
Worker tree sim-armor-drive. Finding #646 claimed in sim-findings.md at run start.

## Canon

docs/CANON.md read. docs/MONSTER-WAVES.md read (wave 4 = The Mirror Draft;
wave 5 = The Producers; readiness gate: VETERANS bar = 2 living roster
members with wave-4+ kills; wave-5 demand ARMORED 4 fighters at worn P>=15,
ARMED 6, TRICKS 3, VETERANS 2). **No canon doc covers armor/equipment —
stated, not invented.** Armor mechanics read from code (equipment.js
armorOf, villager-build.js villagerGearDay, game.js rollAlienLoot/
alienLootGrant, betrayal.js visitorWares).

## The named next (from sim-windowloss DIAG)

The wave-5 door's ARMORED bar is the SOLE blocker on 100% of instrumented
never-opened window-days (28/28d), and the restraint probe proved veteran
survival alone doesn't open doors. The veterans leg is manufacturable
(armorydrive: 4/32 armed reached w5vets2=2 vs 0/32 control); the armor leg
has no economy on the measured substrate and no acquisition verbs.

## Design — "war footing" (window-live armor drive)

Gate `Game.armorDriveLive()` (standing.js): wave-5 VETERANS bar >= demand
(2) AND the wave-5 door still shut (`!waveCombatReadiness(5).ready`).
Fail-closed. The verbs below fire ONLY while the gate is live — the rest
of the game cannot see them.

Params in `standingCfg().armorDrive` (sim starting points, Steve can
overrule): `{ lootChance: 0.35, traderWare: true }`. The demand numbers
(4 fighters, P>=15) are read live from `readyDemand[5]` — parametric.

Verb 1 — WAR-LOOT (game.js `rollWarLoot`, hooked in `tbKillRewards` and
`villagerKillLoot`): while the gate is live, every wave-4+ kill rolls a
dedicated armor drop at lootChance. Pool is data
(`reward-economy.json warArmor.ids`, 15 ids, all P>=15), filtered at
runtime against the live armorP demand. Scholar kills: same corpse path as
normal loot (loot-as-action preserved), narrated. Villager kills: into the
killer's pack like the normal gift; the caller's `villagerGearUp`
re-equips on the spot; returned preferentially so the deed names the armor.

Verb 2 — TRADER ARMOR WARE (betrayal.js `visitorWares`): while the gate is
live, the cart carries a 4th ware — one pool armor piece, priced in real
finished food (`pricePerTier*2` + noise), bought through the existing
`visitorBuyWare` rails (kind 'armor'; excluded from `spoiled_as_fresh`
scams — armor doesn't spoil).

NOT built (considered, documented): a new crafting recipe. `hide_armor`
(P20) is already the P>=15 crafting verb and already knowledge-gated;
villagers don't craft in the engine, so a new recipe would only serve the
player's hands — the measured gap is engine-side acquisition volume, not
recipe availability. Noted as a player-side follow-up, not this arm.

Sense note: the armored fighters should read as people gearing for the
Producers — the System watching the gap, the trader hearing what's coming.
Transcripts read in the sense section below.

## PRE-REGISTRATION (§14 binding — written BEFORE the sweep)

- PRIMARY: wave-5 doors opened among configs reaching w5vets2=2, identical
  seeds, drive vs control. GO = drive >= control+2 doors AND >=2/8 drive
  seeds with a door opened. (Door opened = maxWave>=5 or any census day
  with readiness ready; window reached = w5vetsMax>=2 on the daily census.)
- GUARDRAILS (all binding):
  - median survival |paired diff| <= 10d
  - starvation deaths/100d <= control+3 (paired)
  - no new death mode (>=2-event rule on deathCauses keys)
  - armor not bled: end-run P>=15 armor count (worn+carried, village-wide)
    drive >= control (paired) — no armor-sink regression
- Design: 8 FRESH seeds (65551-65558, filename-verified 0 hits across
  evidence/ + scripts/, 0 content hits in scripts/) x
  {leadfeast, belongfeast} x {control, drive} = 32 configs, 180d
  death-aware, shared substrate FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
  WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 (VETREL/REPOSITION/VGEAR
  unset). Policies: AD.armedFor('lead'|'belong') both legs (the landed
  weapons baseline); the ONLY difference between legs is the game code
  (control = pristine base worktree, drive = this tree) — identical seeds,
  identical env, §15 panel-valid by construction.
- A miss is NO-GO, never re-scored. Metric doubts go under metric review
  for the NEXT run.

## Proof gates — scripts/test-armordrive-20261022.js

(Results fill in after the run:)

## Proof gates — scripts/test-armordrive-20261022.js

Re-verified GREEN in-tree post-adoption: **28 PASS, 0 FAIL** (exit 0,
~6.6 min). E0–E6 all green: shape, gate logic (planted veterans -> live;
stubbed ready -> off), rollWarLoot nulls/hits, villagerKillLoot pack
path, trader ware + buy-for-food, E5 DET byte-identical 30d runs, E6
scam exclusion (armor never spoiled_as_fresh).

## Sweep completion (adoption recovery)

- Orphan state at adoption: 31/32 per-seed JSONs present
  (evidence/2026-10-22/perseed-armordrive/), missing only
  control-leadfeast-s65558. Uncommitted: modified
  scripts/sweep-armordrive-20261022.js, untracked evidence dir, the two
  helper scripts (build + diag), this file (header only).
- The uncommitted sweep-script change (policyTag: normBase+'feast' ->
  normBase) is a genuine BUG FIX, not drift: normBase('lead') already
  returns 'leadfeast', so the committed version would have written
  'leadfeastfeast' filenames. All 31 orphan files use the fixed naming;
  kept the fix.
- Determinism: DET re-run of drive-leadfeast-s65551 (same code, same
  seed, EVID override to /tmp) -> **byte-identical** (cmp clean) to the
  orphan's file. Corpus resumable.
- Control-leg provenance: all control JSONs carry anchorCommit
  8720dc2c78c5 (pristine base, no armor-drive) and repo
  sim-armor-drive-ctrl; drive JSONs anchor 6341570a0233 (this tree).
  §15 panel-valid by construction: legs differ ONLY in game code,
  identical seeds/policies/env.
- Missing config run clean: control-leadfeast-s65558 -> 40d,
  village-lost, no window, no door.
- **Corpus final: 32/32.** Substrate as pre-registered.

## Results — pre-registered judgment (§14: miss is NO-GO)

PRIMARY (doors opened among window-reachers, identical seeds):

| | control | drive |
|---|---|---|
| windows reached (w5vets2=2) | 2/16 | 2/16 |
| doors opened | 2 | 2 |
| drive seeds with a door | — | 2/8 (s65551, s65556) |

GO bar: drive >= control+2 doors AND >=2/8 drive seeds. Second conjunct
met, first missed: 2 >= 4 is false. **VERDICT: NO-GO.** No re-scoring.

GUARDRAILS (all binding, all PASS):
- median survival paired diff: 0d (bar |d|<=10) PASS
- starvation/100d paired diff: 0.00 (bar <=control+3) PASS
- new death modes (>=2 events): none PASS
- armor not bled: median end-run P>=15 armor paired diff 0 PASS

§15 panel: scripts/balance-panel.js compare, decision review_required;
per-policy leadfeast/belongfeast 8/8 paired cases, deltas 0 on every
contract metric (the instrument saw no signal either way). Panel
compare: evidence/2026-10-22/armordrive-panel.md.

MECHANISM check (drive leg): war-loot rolls 0/370. Control calls 0
(pristine tree has no rollWarLoot — legs confirmed different). **The
armor-drive gate (armorDriveLive) was never live on a single census day
in any of the 16 drive configs** (windowDays sum = 0). The verbs are
proven working (28/28 proof) but the engine never called them into
action: on the 2 seeds where veterans reached 2, the door opened
directly (census armored 5 and 7 >= demand 4), so the gate's "vets met
but door shut" condition never occurred; on the other 14, veterans never
reached 2 at all.

DIAG follow-up (scripts/diag-warloot-window-20261022.js, motivating
blocked-window seed s65477 on this substrate): gate-live days 0,
vets>=2 days 0, wave-4+ kills 1, gate-live kills 0. The motivating seed
itself no longer produces blocked windows under the pinned substrate —
the VETERANS bar is the binding constraint on these seeds, not armor.

## Metric review (for the NEXT run — not re-scored here)

1. The gate condition (veterans>=demand AND !ready) is too narrow for
   fresh-seed distributions: it fires only in the exact "vets met, armor
   short" state, which occurred 0/16 times here and on the DIAG seed too.
2. The PRIMARY assumed blocked-window seeds; the sweep used fresh seeds
   where windows themselves are rare (4/32 overall). A retest should
   either (a) widen the gate (fire when the door is HELD with ARMORED
   short, regardless of the veterans bar) or (b) pre-register on a
   blocked-window seed set where the window is known to occur, and (c)
   confirm the gate fires (windowDays>0) in a pilot before the confirm
   spend — a zero-window pilot is a kill signal, not a measurement.
3. Census/armor discrepancy noted: drive-leadfeast-s65551 opened a door
   with census armored=7 but the end-run census found 0 P>=15 pieces —
   the village was lost by day 101 and the roster was dead; the end-run
   armor count is living-villagers only. Not a bug, but the "armor not
   bled" guardrail is vacuous when villages die. A next run should count
   armor at the window/door moment, not just end-of-run.

## Village assessment (plain words)

The village on these seeds lives ~100 days, reaches wave 4 on most runs
(22/32), and dies mostly in combat (752 'combat' + 232 'villager combat'
death events). National comes up on 8/32, the table invites on 20/32,
nobody wins. The two door-opening villages (s65551 leadfeast, s65556
belongfeast) were the rare ones that kept two veterans alive through
wave-4 combat AND had 5–7 fighters in real armor — gearing that came
from the existing economy (crafted hide armor, loot), not the new
verbs. Everyone else died before the veteran bar mattered: starvation
is a minor killer here (0.86/100d) — combat is what eats the village.
The wave-5 door, on this substrate, is a VETERANS door: the armor is
already there when the veterans are; when the veterans die, nothing
else matters. The armor-drive verbs would have helped exactly the
village that didn't exist in this corpus — vets alive, armor short —
which is why the arm missed: it built the right tool for a situation
the seeds never produced.

## Sense-testing (SENSE-TESTING LAW)

The gate never went live in the sweep, so no real war-loot or
trader-armor moments exist in the 32 runs to read. Judged from the
engine code paths the proof exercises (E2/E3/E4, real verbs):

- War loot (player kill): "WAR LOOT: {name}. {flavor} The System has
  been watching the gap. It's on the body — search it." Reads as the
  System's voice, diegetic: it references the gap the hold beat names,
  and loot-as-action is preserved (the armor is on the corpse).
- Villager kill: the armor lands in the killer's pack and the deed names
  the armor preferentially — the killer strips plates, reads as a
  person, not a number.
- Trader ware blurb: "Heard you're gearing for the Producers. This
  stops more than harsh language." — a trader's voice, hearing what's
  coming. Buy beat: "Plate and padding, laced proper. Somebody's going
  to live through something in this." — stakes are personal.
- NIT (documented, not fixed — the arm is NO-GO): the blurb names "the
  Producers" while the hold-beat discipline keeps the wave-5 title
  unspoken. A trader hearing it from the wider world is defensible, but
  it's a title-knowledge leak worth a pass if the arm is ever revived.

Verdict on sense: the fiction is coherent and human. It was never
exercised, which is a measurement fact, not a writing fact.

## Wall numbers (this sweep, 32 configs)

national 8/32 | table 20/32 | wins 0/32 | wave4 22/32 | wave5 4/32
(w5vets2 windows 4/32, doors 4/4 of windows) | median survival 102d |
max 162d. Drive vs control deltas on every wall metric: 0.

## Blanks filled / documented

- FILLED (tooling): policyTag 'feast'-doubling bug in the sweep script —
  normBase already returns 'leadfeast'; committed version would write
  'leadfeastfeast' filenames. Fixed in-tree (part of this commit).
- DOCUMENTED: the motivating window (vets met, armor short) does not
  occur on fresh seeds under the pinned substrate (0/16) or on the DIAG
  seed s65477 (0 gate-live days). Finding #646's armor leg may be
  substrate-real but seed-rare; needs a blocked-window seed set or a
  wider gate (metric review above).
- DOCUMENTED: trader blurb names "the Producers" — possible
  title-knowledge leak (sense nit).

## Convergence

axis scale-onramp: NOT converged — the wave-5 door remains the binding
wall (4/32 doors, all on already-armored villages; wins 0/32). This arm
did not move the wall; killed at confirm per §14. The binding blocker on
these seeds is the VETERANS bar, not ARMORED.

## Files

- scripts/test-armordrive-20261022.js (committed, 28/28)
- scripts/sweep-armordrive-20261022.js (modified: policyTag fix)
- scripts/build-armordrive-panels-20261022.js (new: §15 panel + verdict)
- scripts/diag-warloot-window-20261022.js (new: gate-fire diagnostic)
- evidence/2026-10-22/perseed-armordrive/ (32 per-seed JSONs)
- evidence/2026-10-22/armordrive-panel-before.json.gz
- evidence/2026-10-22/armordrive-panel-after.json.gz
- evidence/2026-10-22/armordrive-panel.md (+ .json)
- evidence/2026-10-22/armordrive-panel-verdict.json
- evidence/2026-10-22/sim-armordrive.md (this file)

Game-code change (arm, NOT landed, NO-GO): 6341570a0
"[needs-eyes] sim-armor-drive: window-live armor acquisition verbs
(finding #646)" — 6 files, 531 insertions.

## Telemetry deviation check (2026-10-22)

`node scripts/telemetry-check.js --baseline .../scale-wall.json --current
'evidence/2026-10-22/perseed-armordrive/*.json' --metrics national,table,wins,exiled`
-> LOUD: "wins disappeared: baseline 16 -> current 0 (n=32)".

Investigated same-run: EXPLAINED, not a bug. The baseline file's own
_regime block says: "DO NOT compare pre-seat / courtship / readiness
substrates against this baseline — wins are structurally ~0 there and
telemetry-check will fire a spurious LOUD 'wins disappeared'." The
baseline is the winseat regime (SEATDRIVE=1, ~100%-win suite); this
sweep's substrate is SEATDRIVE=0 (pinned pre-reg). Crucially, the CONTROL
leg (pristine base 8720dc2c7, no armor-drive code) also wins 0/32 — the
arm introduced no regression. Baseline NOT rolled forward (rolling would
drop the _regime label per the script caveat; the regime split is
working as designed).
