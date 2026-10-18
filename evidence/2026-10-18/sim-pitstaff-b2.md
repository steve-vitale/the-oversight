# sim-pitstaff-b2 — pit-trap staffing layer, re-run on the knowledge-open substrate (2026-10-18)

Loop-B food-economy arm, run fleshout-loop-b-20261018T1930Z. Re-runs the
killed sim-pitstaff-b layer (evidence/2026-10-18/sim-pitstaff-b.md —
KILLED at the engagement gate: pit_trap recipe knowledge L0 on 8/8
baseline runs) on the substrate sim-pitknowledge-b opened and LANDED on
master (commit c11e7aa97): knowsPit on hunting_guide/trail_crew/rancher,
trapper-background scholars start pit_trap L3, TRAPS-purpose pit line
(18%/return, 400–1000 kcal), witnessed-catch L1, once-per-teacher teach
beat (trust 15+), villager apprenticeship — all via grantKnowledge L1.
The pitknowledge sweep measured pit_trap L1+ acquired on 6/16 competent
runs. This arm rebuilds the deleted layer (scripts/policies/pitstaff.js,
PITSTAFF=1, default OFF, wraps leadfeast/belongfeast upkeep+daily, zero
src/js changes) per the killaudit named spec: fire dawn at Haven on LEAN
days (pantryFreshDays < 4 or scholar kcal < 50% cap / < 500), scholar not
recovering, snare knowledge L1+, pit line (held + tile-set) < 2, materials
(L2+: 2 sticks; blind L1: 6 sticks). The engine's own Game.craft('pit_trap')
applies the real knowledge gate and costs; engine refusal = honest miss.
The dawn-Haven craft rides the base policy's forage outing:
workTraplineSet sets the first held trap (TRAPLINE_IDS includes pit_trap)
out on the wild tile.

## Canon read (BEFORE sims)

- docs/CANON.md: knowledge gates every surface ("If you don't know, it
  doesn't show"); human skills ≠ alien abilities; no silent actions.
- docs/BEAR.md: separable fat bear 6 / boar 3 / javelina 2 slabs (~20% of
  gross); bear is a non-monster monster FIGHT (bow > spear > knife > bare
  hands; maul 8-17 at range ≤ 2) — bear is NOT a trap target;
  render/pemmican are L4 deep knowledge; trichinosis in bear/boar/javelina
  meat — only `foodState: 'cooked'` clears it, smoking does NOT.
- **No hunting/traps canon doc exists** (docs/ has no HUNTING.md or
  TRAPS.md — verified again 2026-10-18). The trap species table lives in
  src/data/recipes.json: pit_trap catches white_tailed_deer ×2 /
  wild_boar / raccoon / opossum — the only boar trap; NO recipe catches
  black_bear. Stated here instead of invented, per protocol.
- Engine mechanics read from the code (not invented): Game.craft is
  knowledge-gated per-recipe (L0 = honest refusal; L1 blind 35% + L2
  lesson on success; L2+ 85%); checkTraps catches the tile's REAL wildlife
  at 40%/day (shyness 0.65^level); pit uses=4; boar retrieval is a real
  beat (L3 pit readers spear from above: 10% goring 5–10 dmg; careless
  climb-down: 35% goring 12–20 dmg).

## PRE-REGISTRATION (binding; written BEFORE sims — MEASUREMENT.md §14)

- QUESTION: does staffing pit traps on the knowledge-open substrate
  produce boar kills and boar-kcal to the pantry?
- PRIMARY (binding): boar kills armed ≥ 4 across the armed side AND
  boar-meat pantry arrivals ≥ 5,000 kcal. PAIRED CLAUSE (stated up front):
  control now carries the pitknowledge channel on BOTH sides (the NPC
  trapper pit line runs at 18%/return with wild_boar in the table — the
  pitknowledge armed side measured 1 boar + 2,564 pit kcal on 16 runs), so
  control boar kills are expected small-but-nonzero, NOT 0. For GO, the
  armed−control delta must ALSO be ≥ 3 boar kills AND ≥ 4,000 kcal — the
  delta is the layer's staffing verb, and a both-sides NPC bonanza must
  not false-pass.
- ENGAGEMENT (kill-fast): pitCrafts (tele('craft') id='pit_trap' — the
  layer's own staffing verb) ≥ 8 across the armed side. JUSTIFICATION: the
  original ≥ 16 bar was calibrated to an all-L0 substrate where engagement
  was impossible by construction; knowledge now reaches L1+ on 6/16 runs
  (pitknowledge-b), so ≥ 8 crafts (~2–4 knowledgeable runs × 2–4 crafts
  each) is the honest engagement bar on this substrate. Kill-fast: 0
  armed crafts at pilot → KILL — never run 12–16 seeds on an invisible
  effect.
- GUARDRAILS: trap-duty deaths ≤ control+2; median survival ≥ control−10d;
  no new death mode; det-gate byte-identical gate-off (scripts/
  test-pitstaff-b.js PART B: 4/4 byte-identical, proven pre-sweep —
  neutrality established, not re-gated).
- HORIZON: 180d death-aware (dead villages stop; engine tail).
  SUBSTRATE: FEASTSCALE_R13=1; SEATDRIVE=0 EXPLICIT; HUNTSTAFF unset
  (default OFF) both sides; PITKNOWLEDGE unset both sides (the channel is
  substrate on master, not treatment — the only delta is PITSTAFF=1).
- SEEDS: 9005, 9006, 9007, 9008, 9009, 9010, 9306, 9307 (zero hits in evidence md/js/json seed-context patterns — verified 2026-10-18) × {leadfeast, belongfeast} × {control, armed} =
  32 runs, own in-sweep paired control, identical seeds both sides, the
  ONLY delta the PITSTAFF env var. Seed freshness verified against
  evidence/ + scripts/ before any sims (see below).
- Balanced panel compare (scripts/balance-panel.js) per §15 — separate
  out-dirs, sources frozen, attach the compare .md.
- DEATH INSTRUMENTS: capture death tele KIND, filter to person/villager
  (lesson #525); snapshot v.taskLeads alongside the assignTask wrap
  (lesson #528).
- A miss is NO-GO, never re-scored mid-run. Metric doubts go under
  "metric review".

## The layer (rebuilt onto the knowledge-open substrate)

scripts/policies/pitstaff.js (PITSTAFF=1, default OFF; wraps
leadfeast/belongfeast's upkeep+daily; zero src/js changes):
- staffPit fires in the wrapper's daily BEFORE the base daily (dawn craft
  at Haven rides the day's forage outing — workTraplineSet sets the first
  held trap on the wild tile), once per day (ctx-day key), on LEAN days
  only (pantryFreshDays < 4 or scholar kcal < 50% cap / < 500 — the
  huntstaff lean definition), scholar at Haven (playerAtHaven), NOT
  recovering (competent.recovering — wounded trappers do not dig), snare
  knowledge L1+ (the audit spec's craft-literacy gate), pit_trap L1+ (the
  layer never spams the engine's honest L0 refusal — at L0 the village
  doesn't even TRY), pit line (held + tile-set) < 2, materials (L2+: 2
  sticks per the recipe; blind L1: 6 sticks — mirrors workTrapline's blind
  band; blind attempts risk 65% material loss, so only a stock gambles).
- The engine's own Game.craft('pit_trap') applies the pit recipe's
  knowledge gate and costs; engine refusal (L1 miss at 65%, L2+ miss at
  15%) = honest miss — null, no count, no spam.
- Telemetry: ctx._psCrafted + ctx._psCraftLog (day, blind), written only
  on successful craft; gate-off = zero writes (the det-gate depends on
  this).

## Proof: scripts/test-pitstaff-b.js — ALL GREEN on current master

Rebuilt layer, same proof: PART A fixture 19/19 (RED gate-off: null +
craft never attempted + ctx untouched; GREEN: all gates pass → craft
exactly once + once-per-day; lean/haven/snare-L1/pit-L0/line-full/
materials-blind-band/engine-refusal/recovering gates each refuse
honestly; fired craft lands the tool in the trapline queue); PART B
det-gate: wrapped PITSTAFF-unset vs unwrapped base, 2 seeds × 2 policies
× 60d per-day trajectory hashes — 4/4 byte-identical, 0
substrate-noise, 0 layer-attributable; PART C smoke. Run:
`FEASTSCALE_R13=1 SEATDRIVE=0 node scripts/test-pitstaff-b.js`.

## Sweep results — pilot COMPLETE (coordinator timeout recovery, 2026-10-18 ~16:45 CDT)

32 runs (seeds 9005–9010, 9306, 9307 × leadfeast/belongfeast × control/armed), 180d death-aware. Verified from per-seed JSONs (`perseed-pitstaff-b2/`, 16/16 present):

| metric | armed | control | bar | verdict |
|---|---|---|---|---|
| pitCrafts (layer's staffing verb) | **3** | 0 | ≥ 8 | ENGAGEMENT MISS |
| pitsSet | 3 | 0 | — | — |
| boarKills | **0** | 0 | ≥ 4 (+Δ≥3) | PRIMARY MISS |
| boarMeatPantryKcal | **0** | 0 | ≥ 5,000 (+Δ≥4,000) | PRIMARY MISS |
| pit_trap L1+ runs | 9/16 | 8/16 | — | knowledge reached, crafts didn't |

All 3 crafts happened on ONE run (belongfeast-armed-9307, days 148–151) — the same run where 2 villagers died in their own pits (days 152, 155). Knowledge reached L1+ on 9/16 armed runs, so the craft-literacy gate is no longer the binding gate (b was killed on the L0 substrate; b2 confirms the fix didn't unlock engagement).

**VERDICT: NO-GO — KILLED.** Engagement miss (3 < 8), primary miss (0 boar kills, 0 boar kcal), AND new-death-mode guardrail miss: 2 "your own pit trap" deaths on armed, 0 on control (see below).

## Sense-test (SENSE-TESTING LAW) — done at recovery

Read the belongfeast-armed-9307 pitBeats transcript, days 148–155. The beats are legible and brutal: the layer's pits catch deer and opossum, then "Somchai Prasert is dead — your own pit trap. The village stops. Somebody screams. Somebody else starts digging." followed by Eli Giordano three days later. The game's own craft voice warns "mark it well: your own pit will take you too" — the fiction KNOWS the danger, and the staffing layer dug the pits anyway. The kill is not just metric-honest; it's thematically right. A staffed pit-trap program is a villager-death factory. No fabrication flags; the beats read as people reacting to a real, earned horror.

## Guardrails

- Median survival: armed 180d, control 180d (bar ≥ control−10d) — PASS.
- Trap-duty deaths: no excess over control (control trap deaths 0 across 16) — PASS.
- **New death mode: MISS** — "your own pit trap" ×2 on armed (both kind='villager', player=True), 0 on control.
- det-gate byte-identical 4/4 (proven pre-sweep) — PASS.

## Wall numbers (report-only)

armed: {national:8, table:6, wins:0, wave4:8, wave5:0} — control: identical. The layer moved nothing at the wall; it only killed villagers.

## Village assessment (plain words)

Belongfeast-armed-9307 is the only armed run where the layer fired: a villager dug 3 pits over days 148–151, caught 2 deer and 2 opossums (~42,400 kcal on the bone — the layer's one real contribution), then buried two of their own people in the holes. Everywhere else the layer slept: 15 of 16 armed runs crafted nothing despite knowledge reaching L1+ on 9 of them. The pitstaff family is 0-for-2 — b killed at engagement on the L0 substrate, b2 killed with teeth on the knowledge-open substrate.

## Metric review (mandatory)

The ≥8 engagement bar (recalibrated from 16 for the knowledge-open substrate, ~2–4 knowledgeable runs × 2–4 crafts) was the right call: the layer failed by an order of magnitude, not a rounding error. The paired delta clause (≥3 kills, ≥4,000 kcal vs control) was never reached. No metric doubts — the numbers and the guardrail miss agree.

## Named next

pitstaff stays DEAD (0-for-2). Do not re-run staffing on this channel. The named work is the SIBLING question: the pitknowledge NPC trapper line runs at 18%/return and produced 1 boar + 2,564 pit kcal on 16 runs in its own sweep — the NPC channel, not a staffing layer, is the live pit economy. If a staffing verb ever returns here, the materials gate (2 sticks L2+ / 6 blind L1) and the own-pit death mode are the binding constraints, not knowledge.

## Findings backlog note

- [fixed] 2026-10-18 — pit_trap knowledge blank (sim-pitknowledge-b, c11e7aa97) — b2 ran on this substrate; blank stays filled.
- [open] 2026-10-18 — "your own pit trap" death mode now EXISTS in the death-mode corpus (2 events, player=True) — any future pit-staffing work must treat it as a known channel, not a novelty.
