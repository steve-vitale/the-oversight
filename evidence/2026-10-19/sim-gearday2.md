# sim-gearday2 — weight-honest scholar gear-day re-arm (flesh-out loop, 2026-10-19, ARM sim-gearday2)

Run: fleshout-20261019T1555Z, arm sim-gearday2. Axis: scale-onramp (the blocking axis).
POLICY-SIDE LEVER — zero src/js changes. New file scripts/policies/gearday2.js (default OFF).

Named next #1 of the killed sim-scholargear arm (evidence/2026-10-19/sim-scholargear.md).
That arm's full autoEquip layer MET the 21.1% primary bar but FAILED guardrails
(wave-4 16→11, median survival −28d): the parallel autoEquip wrote directly to
scholar.equipped without removing worn items from inventory → 3.6x "too heavy"
→ encumbrance cascade. The 21.1% signal warrants a re-arm with correct weight
handling.

Canon: docs/CANON.md, docs/MONSTER-WAVES.md. INDIVIDUAL OWNERSHIP (Steve
2026-10-09): personal belongings at their space, not a communal pool — own
stash only. The settled ARMOR MODEL (AGENTS.md 2026-10-09): pieces additive
into P, r = P/(P+20), absorbed = min(hit-1, round(hit*r)).

The actual gap (read from code, not invented): the base competent policy's
gearUp already equips the scholar well via the real Game.equip verb 3x/day —
the "scholar never re-equips" premise was wrong. What gearUp never touches
is the scholar's OWN STASH (person.stashed — e.g. seed 63801 day-1: a crossbow
+ denim jacket sitting at the scholar's space in Haven forever). This layer
EXTENDS gearUp's domain (stash awareness + per-slot inventory sweep for slots
gearUp's max-comparison misses), it does not build a redundant parallel
autoEquip.

HARD CONSTRAINTS (violation fails the arm):
1. NEVER write directly to scholar.equipped. Every slot change goes through
   the real Game.equip/Game.unequip verbs (unequip-first: the replaced piece
   returns to inventory; the verb removes worn items from inventory —
   "worn, not carried" — so the weight bug is structurally impossible).
2. Read worn gear ONLY via Game.state.scholar.equipped — never
   Game.getPerson(Game.villagerId).equipped (the SCHOLAR-GEAR READ PATH
   finding: the person record is a stale creation snapshot; reading it
   silently no-ops).
3. Own stash only; keepsakes (acc1-4, sentimental) untouched; narrate only
   on fetch; mantle-safe; idempotent.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the sweep)

**PRIMARY:** scholar combat deaths (player deaths in raid + wild + patrol
channels — the taxonomy's field-combat bucket) per run, armed vs control on
IDENTICAL seeds, PAIRED DELTAS.
**GO threshold:** ≥ 20% fewer scholar combat deaths on the armed arm (same
bar as the killed sim-scholargear arm).
A miss is NO-GO, never re-scored mid-run (§14). Metric doubts go under
"metric review".

**Horizon:** 180d death-aware (dead villages stop simulating, +10d tail max
via the harness).
**Seeds:** pilot 8 seeds (63801–63808, taxonomy comparability) ×
{leadfeast, belongfeast} × {control, armed} = 32 runs. Confirm (only on
pilot GO): 12–16 seeds.
**Policies:** competent-player policy (the w5path stack, VETREL=1).
**Substrate env:** FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
WINPURSUIT=1 WINDEFER=1 NODEWITNESS=1 VETREL=1 SEATDRIVE=0.
**Arm env:** GEARDAY2=1 (armed) vs unset (control — gate-off is pure
delegation, DET-pinned byte-identical to the bare stack).

**GUARDRAILS (all must hold):**
- wave-4 unlocks within ±2/16 runs of control;
- median survival no worse than −10d;
- no new death mode (≥2-event rule);
- starvation deaths ≤ control+1 (paired per run);
- "too heavy" SAY-line RATE ≤ 1.5× control per day (promoted from watch
  item by the killed arm's metric review — the instrument counts them via
  the once-installed Game.say hook).

**SECONDARY (report, don't judge):** scholar mean P worn at fight start
(the probe's fight-open recorder); all-scholar deaths; wall numbers
(national/table/wave-4/wave-5/wins).

**§15:** before/after comparison through the balanced panel
(scripts/balance-panel.js) — the panel is the instrument, the GO threshold
is the judge. Compare .md attached.

**KILL PROTOCOL:** if killed at pilot, the layer is deleted zero-trace;
instruments + evidence + proof land with the KILLED-VERDICT. Killed arms
leave no trace in game code.

## Lever played

WEIGHT-HONEST GEAR-DAY (scripts/policies/gearday2.js, GEARDAY2=1 gate,
default OFF), wrapped via withGearDay2 OUTSIDE the w5path stack:

Daily (dawn cadence), BEFORE parent daily:
1. Day guard + Haven gate (the stash is at their space in Haven; away days
   are counted, not fetched).
2. Read Game.state.scholar fresh (mantle-safe) and the CURRENT scholar's
   person.stashed (own property only).
3. Phase A — own-stash fetch: for each stash weapon/armor (non-sentimental,
   ammo-aware) routing to a main slot and beating the current slot value
   (read from state.scholar.equipped), splice it out of the stash, push a
   proper scholar-inventory entry, and verb-equip it (unequip-first, so the
   replaced piece returns to inventory). Best-per-slot only.
4. Phase B — per-slot best-inventory sweep: gearUp's armor branch compares
   the best piece against the MAX worn anywhere, so e.g. a P=6 helmet sits
   in the pack forever over a P=10 torso. This pass verb-equips the best
   inventory piece per slot that beats the current slot value.
5. Narrate only on fetch ("☀️ Dawn gear: you pull X from your space.") plus
   the verb's own "Equipped X".

Design calls (he can overrule):
- Dawn cadence, not fight-gated: a competent player pulls their gear at
  dawn. No tick/calorie cost (same design call as armorup).
- Unequip-first verb flow rather than equip-overwrite: the verb's own
  equip() overwrites the slot without returning the replaced piece (stale
  comment in code); the unequip-first pair preserves replaced items in
  inventory and keeps the layer weight-honest under scrutiny.
- Ammo-awareness mirrors gearUp's doctrine (dry ranged weapons stay in
  the stash/pack).

Proof: scripts/test-gearday2-20261019.js — 32/32 green on the live engine
(DON fixtures on the real shape: D0 stash fetch + verb-equip + P≥10;
D0b weight regression — no worn item double-counted in inventory;
D0c read path — fake person-record melee ignored; D1 away-from-Haven;
D2 replaced piece returns to inventory; D3 other-villager stash
untouched; D4 keepsakes/acc untouched; D5 idempotent; D6 gate-off ==
bare daily; GATE 3 seeds byte-identical; DET repeat byte-identical;
SMOKE both policies × both arms with the weight invariant held).

## Results

32-run pilot complete (8 seeds 63801–63808 × {leadfeast, belongfeast} ×
{control, armed}, 180d death-aware). Verdict JSON:
evidence/2026-10-19/gearday2-analysis.json. Panel compare:
gearday2-panel-primary.{json,md,json.gz pair} (§15 — the panel is the
instrument, the pre-registered threshold the judge; decision:
review_required on both policies).

**PRIMARY (scholar combat deaths, paired):** control 107 → armed 86 =
**19.6% reduction** (GO bar ≥20%: MISSED by 0.4pp — NO-GO, binding per
§14). Paired deltas: 10/16 negative, 3 zero, 3 positive (worst pair
leadfeast/s63808: +5).

**GUARDRAILS:**
- wave-4 unlocks: 16 → 12 (band ±2/16: **FAIL**, −4)
- median survival: 122.5d → 93.5d (band −10d: **FAIL**, −29d)
- new death modes: none (**PASS**)
- starvation: ≤ control+1 paired on all 16 pairs (**PASS**)
- "too heavy" SAY-line rate: 0.630 → 1.008/day = 1.6× control (band
  ≤1.5×: **FAIL**, barely — driven by two outlier runs: armed
  leadfeast/s63803 987 and armed belongfeast/s63803 565)

**VERDICT: KILLED-AT-PILOT** (primary miss + three guardrail fails).
The layer is deleted zero-trace; instruments + evidence + proof land with
the KILLED-VERDICT. No confirm round (pilot did not GO).

**Mechanism (verified from the corpus):** the layer worked as designed —
28 stash fetches + 45 inventory upgrades across 16 armed runs, fight-open
scholar P 11.6 → 13.2, scholar all-deaths 119 → 96. The weight bug is
fixed (no worn double-counting — proven pre-sweep). But the scholar's
survival shifted combat deaths to villagers: villager combat deaths
31 → 40 (**+29%**), all-combat 138 → 126. The better-armed scholar tanks
longer; villagers in the fight take the hits. The village then collapses
earlier (−29d median, village-lost on 15/16 armed runs vs 14/16 control).
Arming the scholar makes the SCHOLAR safer but the VILLAGE frailer —
scholar survivability ≠ village survivability, and the scale-onramp axis
cares about the village reaching national. The guardrail pattern repeats
the killed arm (survival collapse + wave-4 loss) with the weight bug
fixed, so the harm is not (only) encumbrance — it is the fight-dynamics
shift. Second contributor: the unequip-first verb flow (honest —
replaced pieces return to inventory instead of the verb's destroy-on-
overwrite) adds pack weight on long runs; the two 500+ "too heavy" runs
are the tail of that.

**Secondary:** fight-open scholar P 11.6→13.2; scholar all-deaths
119→96; wall numbers — national 13→12/16, table 12→12/16, wins 0→0/16,
wave-4 16→12/16, wave-5 0→1/16 (armed leadfeast/s63803 reached wave 5).

## Village assessment

Armed villages look like villages with a well-dressed scholar and a
thinning militia. The scholar pulls their crossbow/denim jacket from their
space at dawn, upgrades through the run (fight-open P climbs), and
personally survives fights that used to kill them. But the fights don't
get shorter — they get longer, and the villagers holding the line beside
the scholar die 29% more often in combat. The village roster erodes a
month earlier on the median run; wave-4 unlocks slip from 16/16 to 12/16.
Nobody starves more (paired starvation flat) — the collapse is
population, not pantry. The scholar lives; the village doesn't. For the
scale-onramp axis this is the wrong trade at any price: national needs
villagers, not a geared protagonist.

Who thrived: the scholar (all-deaths −19%). Who died: villagers in
raid/wild/patrol channels (+9 combat deaths). Missing capability: the
village's FIGHTERS are the unarmed ones now — the lever armed the wrong
person. Named next for a future arm: villager-fighter gear (the +29%
villager combat deaths are the signal), not scholar gear.

## Sense-testing (SENSE-TESTING LAW)

40-day armed sense run (seed 63805, leadfeast, say-lines captured):
- d1: "☀️ Dawn gear: you pull Camo Jacket from your space." + the verb's
  "Equipped Camo Jacket (torso)." — one line, on fetch only, diegetic.
- d4: kitchen knife (melee) + work gloves (hands) equipped via the
  inventory sweep. d18: crafted bark armor replaces. d24: canvas pants.
  d31: fire-hardened spear. Final: armorBonus 19, melee=kitchen_knife,
  ranged=fire-hardened_spear, head=field_suture_kit (canon head-is-fun: a
  suture kit as a helmet — the game allows it, the policy doesn't judge),
  torso=bark_armor, hands=work_gloves, shoes=running_shoes.
- Narration is sparse and honest: one dawn line per fetch day, the verb's
  own "Equipped X" otherwise. No spam, no non-events narrated.
- The scholar reads as a person doing a morning routine, not a robot:
  pulls gear at dawn, upgrades when better loot comes in, keeps the
  kitchen knife for weeks (familiarity over optimization — emergent, not
  coded).

## Metric review

The pre-registered metrics bound the run correctly. The primary (scholar
combat deaths, paired) measured the mechanism honestly — 19.6% is a real
signal, and the 20% bar correctly refused to round it up. The guardrails
caught the real harm (the villager death shift → survival collapse).
Promoting "too heavy" rate to a guardrail was validated: it failed at
1.6×, driven by two outlier runs — the rate form (per day, not total) is
the right shape; totals would have been noisier. No metric changes for
this arm. For future gear-touching arms: the villager-combat-death share
should be a GUARDRAIL, not a secondary — this run proved the scholar/
villager death trade is the binding harm, and secondaries don't kill arms.

## Convergence

killed-at-pilot. The scholar-gear lane is concept-capped, not
metric-broken: two independent implementations (full autoEquip,
weight-honest verb gear-day) both move scholar deaths ~20% and both
collapse village survival via the same villager-death shift. The axis
(scale-onramp) needs the VILLAGE armed, not the scholar. Named next:
villager-fighter gear arm (see village assessment).

## Files

- scripts/policies/gearday2.js — the lever (GEARDAY2=1 gate, default OFF; zero src/js)
- scripts/probe-gearday2-20261019.js — sweep probe (fork of the scholargear probe; same substrate + instruments)
- scripts/analyze-gearday2-20261019.js — before/after judge (GO test, guardrails incl. too-heavy RATE, wall numbers) + §15 panel compare builder
- scripts/test-gearday2-20261019.js — proof (DON + GATE + DET + SMOKE + VERDICT; 32/32 green pre-sweep)
- evidence/2026-10-19/perseed-gearday2/{control,armed}/{leadfeast,belongfeast}/s63801–63808.json — 32 per-seed sweep JSONs (TBD)
- evidence/2026-10-19/gearday2-analysis.json — pilot verdict JSON (TBD)
- evidence/2026-10-19/gearday2-panel-primary.{json,md,json.gz pair} — §15 panel compare (TBD)
- evidence/2026-10-19/sim-gearday2.md — this file
