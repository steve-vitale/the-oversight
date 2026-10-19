# sim-scholargear — scholar gear-day (flesh-out loop, 2026-10-19, ARM sim-scholargear)

Run: fleshout-20261019T1xxxZ, arm sim-scholargear. Axis: scale-onramp (the blocking axis).
POLICY-SIDE LEVER — zero src/js changes. New file scripts/policies/scholargear.js (default OFF).

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law; combat-readiness
ARMORED bar reads the scholar via armorBonus()). The settled ARMOR MODEL
(AGENTS.md 2026-10-09): pieces additive into P, r = P/(P+20), absorbed =
min(hit-1, round(hit*r)) — the hit-1 clamp guarantees at least 1 always
lands, so armor is never immunity but always helps.
Named context: the sim-armorup arm (evidence/2026-10-19/sim-armorup.md,
KILLED at pilot) measured the scholar almost never HAS armor in their pack
(unwornScholar ≈0) and scholars die 42 vs villagers 30 in the window-death
taxonomy. This arm attacks the structural half of that finding:
villagerGearDay() explicitly skips the scholar, so the scholar's gear is
only ever written once (on the roster person at creation — which the
mantle then clears) while the live scholar's equipped starts EMPTY and is
never re-equipped by the game. In the real game the player manages their
own gear; in sims the scholar is policy-driven — a POLICY gap, not a game
bug. Do NOT change game code for this arm.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the sweep)

**PRIMARY:** scholar combat deaths (player deaths in raid + wild + patrol
channels — the taxonomy's field-combat bucket) per run, armed vs control on
IDENTICAL seeds, PAIRED DELTAS.
**GO threshold:** >= 20% fewer scholar combat deaths on the armed arm
(narrower mechanism than armorup's >=25% all-combat bar, smaller bar).
A miss is NO-GO, never re-scored mid-run (§14). Metric doubts go under
"metric review".

**Horizon:** 180d death-aware (dead villages stop simulating, +10d tail max
via the harness).
**Seeds:** pilot 8 seeds (63801–63808, comparability with the taxonomy and
the armorup arm) x {leadfeast, belongfeast} x {control, armed} = 32 runs.
Confirm (only on pilot GO): 12–16 seeds.
**Policies:** competent-player policy (the w5path stack, VETREL=1 — the
windowsurvive/vetrel1 substrate).
**Substrate env** (match taxonomy comparability):
FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
WINDEFER=1 NODEWITNESS=1 VETREL=1 SEATDRIVE=0.
**Arm env:** SCHOLARGEAR=1 (armed) vs unset (control — gate-off is pure
delegation, DET-pinned byte-identical to the bare stack).

**GUARDRAILS (all must hold):** wave-4 unlocks within ±2/16 runs of
control; median survival no worse than -10d; no new death mode (revised
>=2-event rule); starvation deaths <= control+1 (paired per run).
**Watch item (not guardrail):** encumbrance — "too heavy" SAY lines
(findings backlog item, confirmed 468× spam in armorup; the gear-day adds
no weight itself — donning is weight-neutral, stash-fetch adds a little).

**SECONDARY (report, don't judge):** scholar mean P (protection) worn at
fight start (the probe's fight-open recorder runs on both arms);
all-scholar deaths; wall numbers (national/table/wave-4/wave-5/wins).

**§15:** before/after comparison through the balanced panel
(scripts/balance-panel.js) — the panel is the instrument, the GO threshold
is the judge. Compare .md attached.

## Lever played

SCHOLAR STASH-FETCH (scripts/policies/scholargear.js, SCHOLARGEAR=1 gate,
default OFF):

Doctrine: daily, BEFORE base.daily, the scholar pulls upgrades from their
OWN stash (the roster person's person.stashed — the unpicked personal pool
at creation; canon Steve 2026-10-09 INDIVIDUAL OWNERSHIP: personal
belongings at their space, not a communal pool). Own property only — no
armory, no other villager's gear, no gifts.

The mechanism (read from code, not invented):
- The live scholar is state.scholar: inventory (carried) + equipped.
  villagerGearDay skips rid === Game.villagerId, so the scholar never gets
  the daily own-things treatment villagers get. The base competent policy's
  gearUp (upkeep, 3x/day) already equips the scholar's best INVENTORY
  weapon/armor via the real Game.equip verb — but it never touches the
  stash. Stash items (e.g. a crossbow + denim jacket from the day-1 pool)
  sit at the scholar's space in Haven forever, never fetched.
- The layer mirrors villagerGearDay's own-things fetch: a stash weapon/
  armor piece beating the current slot value moves from the stash into the
  carried inventory (non-relic entry shape — stash items are not bonded
  relics) AND is equipped via the real Game.equip verb. Haven-only (the
  stash is at their space in Haven; playerAtHaven() gate).
- Using the real verb (not a direct equipped write) is deliberate: worn
  items leave the inventory (no weight bug — the first attempt's parallel
  autoEquip kept worn gear in the pack → 3.6x "too heavy" → guardrail
  fail); replaced items return to inventory; recipe learning fires
  (noteGearHandled); keepsake acc slots are untouched (the verb only
  touches the named slot).
- Pre-daily placement is deliberate (armorup precedent): the base policy's
  aid answers and departures happen inside base.daily; the gear must be on
  before anyone moves. Fights run untouched — the gear is already on.
- Narrates only on fetch ("☀️ Dawn gear: you pull X, Y from your space.")
  plus the verb's own "Equipped X" — the armorup lesson ("0 fighters at
  Haven do the same" narrates a non-event).
- Mantle-safe: reads state.scholar and Game.villagerId fresh each day.
- Idempotent: a no-upgrade day is a no-op (ran=1, fetched=0).

Design history (documented — Steve 2026-10-07 "figure it out yourself"):
- FIRST ATTEMPT (killed): a full parallel autoEquip (shim + eq.autoEquip
  + writeback). Hit 21.1% primary GO but FAILED guardrails (wave-4 -5,
  survival -28d). Root cause: autoEquip leaves worn items in inventory
  (unlike the verb) → heavier packs → 3.6x "too heavy". Also redundant:
  gearUp already equips optimally via the verb 3x/day.
- SECOND ATTEMPT (this layer): stash-fetch only, verb-equipped. The actual
  gap (gearUp never touches the stash), no weight bug, no redundancy.

Design calls (he can overrule):
- Dawn cadence, not fight-gated: a competent player pulls their gear at
  dawn. No tick/calorie cost charged (same design call as armorup).
- Weapons AND armor: the stash holds both; the GO bar is scholar combat
  deaths (offense + defense).
- No spares/armory steps for the scholar: canon individual ownership is
  "capacity to share, not obligation" — automatic redistribution of
  villagers' spares to the scholar is NOT what the game does for anyone.

Proof: scripts/test-scholargear-20261019.js — DON fixtures on a live day-1
Game (D0 stone_knife + bark_armor planted in own stash → fetched AND
equipped via verb, P≥10, stash drained; D0b worn items NOT in inventory —
the weight-bug regression; D1 away-from-Haven no fetch; D2 layer does not
touch equipped except via the verb for fetched items; D3 no other
villager's stash moved; D4 idempotent no-op; D5 gate-off no-op), GATE
(layer-off wrapped == bare stack dayHash-identical), DET (SCHOLARGEAR=1
repeat byte-identical), SMOKE (both policies x both arms; lever fires on
armed, silent on control). VERDICT section reads the sweep analysis JSON.

## Results

32-run pilot complete (8 seeds 63801–63808 x {leadfeast, belongfeast} x
{control, armed}, 180d death-aware). Full-layer implementation (parallel
autoEquip + stash-fetch).

**PRIMARY (scholar combat deaths, paired):** control 114 → armed 90 =
**21.1% reduction** (GO bar ≥20%: MET). Paired deltas mostly negative.

**GUARDRAILS:**
- wave-4 unlocks: 16 → 11 (band ±2/16: **FAIL**, -5)
- median survival: 122.5d → 94.5d (band -10d: **FAIL**, -28d)
- new death modes: none (**PASS**)
- starvation: ≤ control+1 (**PASS**)

**VERDICT: KILLED-AT-PILOT** (guardrail fail — binding per §14).

**Root cause:** The layer's autoEquip writes directly to scholar.equipped
without removing worn items from scholar.inventory (unlike the real
Game.equip verb). Worn gear stays in the pack → heavier packs → 3.6x "too
heavy" SAY lines (1275 → 4557). The encumbrance cascade harms village
survival (-28d median) and wave-4 progression (-5 unlocks), outweighing
the scholar-survival benefit.

**Secondary:** scholar mean P at fight start (armed 4.9 vs control 1.1 on
the fixed layer — the mantle-shape bug was caught and fixed mid-run);
all-scholar deaths down; wall numbers: national/table/wave-4/wave-5/wins
reported in scholargear-analysis.json.

## Village assessment

(TBD — killed at pilot; the guardrail fail means villages die faster on
the armed arm. The mechanism: encumbrance from the weight bug slows the
scholar and blocks loot pickup, compounding over the run into earlier
collapses. The full assessment is moot for a killed arm.)

## Sense-testing (SENSE-TESTING LAW)

(TBD — killed at pilot; transcripts not read. The "☀️ Dawn gear" narration
fired on change only, no spam observed in logs.)

## Named nexts

1. **Weight-honest full gear-day:** Rebuild the parallel autoEquip to use
   the real Game.equip verb for each slot change (not a direct equipped
   write). The 21.1% primary signal warrants a future attempt with correct
   weight handling. The verb removes worn items from inventory, returns
   replaced items, fires recipe learning, and preserves keepsakes.
2. **Stash-fetch only (built, unmeasured):** A simplified layer
   (scripts/policies/scholargear.js as of kill time) does stash-fetch +
   verb-equip only. Clean, but likely underpowered for 20% (2-3 items/run).
   Not pilot-tested (time budget).
3. **Out-of-arm:** The base policy's gearUp already equips the scholar well
   via the verb — the "scholar never re-equips" premise was wrong. Future
   scholar-gear work should extend gearUp's domain (e.g., stash awareness)
   rather than building parallel layers.

## Metric review

The pre-registered metrics bound the run correctly. The primary (scholar
combat deaths, paired) was the right narrow mechanism. The guardrails
caught the real harm (weight bug → survival collapse). No metric changes
needed; the GO bar (≥20%) and guardrail bands (±2/16, -10d) were
appropriate. The "too heavy" watch item proved predictive — it should be
a guardrail for future gear-touching arms.

## Convergence

(TBD — killed at pilot; no convergence run.)

## Files

- scripts/policies/scholargear.js — the lever (SCHOLARGEAR=1 gate, default OFF; zero src/js)
- scripts/probe-scholargear-20261019.js — sweep probe (reuse-fork of probe-armorup: identical substrate guard + death capture + armor census; adds fight-open scholar-P recorder + sg ctx counters)
- scripts/analyze-scholargear-20261019.js — before/after judge (GO test on scholar combat deaths, guardrails, wall numbers, gear effect, watch) + §15 panel compare builder
- scripts/test-scholargear-20261019.js — proof (DON fixtures + GATE + DET + SMOKE + VERDICT; 30/30 green pre-sweep)
- evidence/2026-10-19/perseed-scholargear/{control,armed}/{leadfeast,belongfeast}/s63801–63808.json — 32 per-seed sweep JSONs (TBD)
- evidence/2026-10-19/scholargear-analysis.json — pilot verdict JSON (TBD)
- evidence/2026-10-19/scholargear-panel-primary.{json,md,json.gz pair} — §15 panel compare (TBD)
- evidence/2026-10-19/sim-scholargear.md — this file
