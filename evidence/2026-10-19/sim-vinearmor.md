# sim-vinearmor — armor materials-bank: MATERIAL-GATED or KNOWLEDGE-GATED (flesh-out loop, 2026-10-19, ARM sim-vinebank)

Run: fleshout-20261019T1555Z, arm sim-vinebank. Axis: scale-onramp (the blocking axis).
POLICY-SIDE LEVER — zero src/js changes. New file scripts/policies/vinearmor.js (VINEARMOR=1 opts in, default OFF).

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law, combat-readiness ARMORED bar — worn armor at P ≥ demand; the scholar via armorBonus()), docs/PRESERVATION.md (no canon for armor production — the preservation ladder is food-only; armor craft canon is the recipe knowledge levels in src/data/recipes.json). AGENTS.md 2026-10-09 armor model (pieces additive into P, r=P/(P+20), absorbed=min(hit-1, round(hit*r))).
Required reading: evidence/2026-10-19/sim-armorprod.md (FULL) — the material-starvation diagnosis: hideAttempts=0 across 16 armed runs; hide max 0–2 in the pack; vine max 0–18, consumed by the knife/trap race; the base policy's bark craft fired 3× in the whole corpus; armor arrives via LOOT, never crafting. Canon constraint: NO communal armory for armor (Steve 2026-10-09 individual ownership); NO villager crafting verb exists — the drive is SCHOLAR-side only. Metric review: the door leg (armored15 end/max) may be the more sensitive instrument than combat deaths for production-side arms.

## FILENAME DECISION (loud — deviates from the brief)

The brief ordered "ONE new file scripts/policies/vinebank.js". That name is
TAKEN by a live loop-B arm (scripts/policies/vinebank.js, 2026-10-14
materials-banking for the blind snare band; hooked into competent.js at 5
call sites, env-gated VINEBANK=1, part of the base competent stack — and it
actively DEFERS bark_armor while banking, the opposite of this arm's drive).
Overwriting it would break loop B's live policy. This arm ships as
**scripts/policies/vinearmor.js** (gate VINEARMOR=1, default OFF). The brief's
intent (one new policy file, zero src/js changes, withX composition) is
honored; only the filename changed to avoid collision.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE any sims; a miss is NO-GO, never re-scored)

**PRIMARY:** armor crafts per run (bark_armor + hide_armor pieces crafted by
the scholar-side policy — base's ctx.barkArmorCrafted PLUS the layer's
va counters; both arms instrumented identically), armed vs control on
IDENTICAL seeds, paired.
**GO = armed mean ≥ 2x control mean AND armed mean ≥ 1.0 craft/run**
(absolute engagement floor — a drive that crafts less than once/run is a dead
letter). A miss is NO-GO, never re-scored (§14). Metric doubts go under
"metric review".

**Horizon:** 180d death-aware (dead villages stop simulating, +10d tail max).
**Seeds:** pilot 8 seeds (63801–63808, taxonomy comparability) ×
{leadfeast, belongfeast} × {control, armed} = 32 runs. Confirm 12–16 seeds
ONLY on pilot GO.
**Policies + substrate:** the w5path stack (VETREL=1), env
FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
WINDEFER=1 NODEWITNESS=1 VETREL=1 SEATDRIVE=0 — taxonomy comparability.
**Guardrails (all must hold):** wave-4 unlocks within ±2/16 runs of control;
median survival no worse than −10d; no new death mode (a new cause counts at
≥2 events — the revised rule); starvation deaths ≤ control+1 (paired per run).
**Secondary (report, don't judge):** wave-5 door armored15 leg end/max;
scholar mean P worn at fight start; wall numbers (national/table/wave-4/wave-5/wins).
**Watch (not guardrail):** knife/trap production counts — the vine claim
reorders what gets built; report it, don't hide it. Also "too heavy" rates.
**§15:** before/after through scripts/balance-panel.js — attach the compare
.md. Every evidence file carries a "metric review" section.

## Lever played

VINE-PRIORITY DRIVE (scripts/policies/vinearmor.js, VINEARMOR=1 opts in,
default OFF — gate-off is pure delegation, DET-pinned byte-identical to the
bare w5path stack). The scholar-side armor crafts get FIRST CLAIM on vine:
the layer's daily runs its craft drive BEFORE base.daily, so the day's armor
craft physically consumes the vine before the knife/trap sinks see it
(keepKnife/armUp stone_knife crafts, workTrapline snares, gearUp's own bark
craft). No reservation bookkeeping — honest first-come verbs.

Rules (per the brief): fire only when the recipe is known L1+, the other
materials are on hand (bark 3 / hide 2), the vine bank isn't banking
(vinebank.banking(Game) — with VINEBANK unset this is always false, and
respected if a sibling run sets it), one attempt/day. Blind L1 35%, L2+ 85%;
craft() consumes materials win or lose.

Priority (the upgrade path, from armorprod's design note): hide_armor first
(hide 2 + vine 1 → P=20, CAN clear the wave-5 door's ARMORED bar P≥15) when
worn P < 20; else bark_armor (bark 3 + vine 2 → P=10, the base competent bar
wornMax<10) when worn P < 10. A successful craft is worn immediately (best-P
re-equip, the base's own equip logic). The base gearUp bark block then sees
wornMax≥10 or armor owned and does not double-attempt.

Canon constraint honored (Steve 2026-10-09 INDIVIDUAL OWNERSHIP): the layer
never moves armor into the stash/armory and never hands armor to a villager —
no such verb exists (verified: storage.js has no armor deposit hook;
villagerGearDay's armory is weapons-only). The DON test proves the negative.

**The question it answers:** is armor production MATERIAL-GATED (vine gets
eaten before armor crafts fire) or KNOWLEDGE-GATED (hide_armor L1 arrives
late/never, so no vine claim can fix it)?

## Results

32/32 pilot sweep complete (8 seeds 63801–63808 × {leadfeast, belongfeast} ×
{control, armed}, 180d death-aware, w5path substrate VETREL=1, VINEARMOR=1 on
the armed arm). 0 bad files, 0 instrument errors. Sweep log:
evidence/2026-10-19/vinearmor-sweep.log (control) + vinearmor-sweep-armed.log
(armed; the first armed launch died silently at 19/32 — host hiccup, no error
— and was re-run fresh after the layer fix below; the control corpus was
unaffected and kept).

**PRIMARY — NO-GO.** Armor crafts per run (bark_armor + hide_armor by the
scholar-side policy, base + layer, both arms instrumented identically),
paired on identical seeds: control mean **0.13**, armed mean **0.13**,
ratio **1.00**, paired deltas all exactly **+0** (16/16). The layer's drive
fired **ZERO times** in ~4,000 sim-days: vaHideAttempts=0, vaBarkAttempts=0
on all 16 armed runs. GO (armed mean ≥ 2x control AND armed mean ≥ 1.0
craft/run) missed on both bars.

**Guardrails:** wave-4 unlocks 16→16 PASS; median survival 122.5→122.5 PASS;
new death modes PASS (none); starvation deaths PASS. (All trivially — the
arms are trajectory-identical; see below.)

**Wall numbers:** national 13/16→13/16, table 12/16→12/16, wins 0/16→0/16,
wave-4 16/16→16/16, wave-5 0/16→0/16, median survival 122.5d→122.5d. The
scale wall does not move.

**The answer to the brief's question — KNOWLEDGE-GATED (with a materials
kicker).** Census of 1,912 armed-arm days:
- hide_armor: recipe L1 known on 8/16 seeds (401 days), but (hide≥2 & vine≥1)
  co-occurs on **0 days**. Hides never bank in the pack — the materials never
  arrive, so the vine claim has nothing to claim. Material-gated on the hide
  side, and L1 arrives late/partial on the knowledge side.
- bark_armor: recipe L1+ known on all 1,912 days (16/16 seeds), (bark≥3 &
  vine≥2) co-occurs on 47 days — but the drive ALSO requires worn P < 10,
  and by the time the materials co-occur the scholar is wearing P≥10 LOOT
  armor. The corpus's only 2 bark crafts are the BASE policy's (one each on
  leadfeast/belongfeast-s63805, mid-day after foraging brought materials —
  the layer runs at dawn, before the day's trips, and never sees the
  co-occurrence).
- The layer's metric mismatch contributed: the layer gates bark on total
  worn P via Game.armorBonus(), the base gates on max single-piece P
  (wornMax) — a two-P=5-piece scholar passes the base's bar but fails the
  layer's. Matching the base exactly would buy ~2 crafts corpus-wide at best.
  Not the story.

The vine race is real (transcripts show vine harvested then immediately
spent on stone knives — "The Stone knife comes apart in your hands. The
materials are wasted. (craft failed)" at d10/d17 on leadfeast-s63802) but it
is DOWNSTREAM of a gate that never opens: the armor craft conditions don't
hold at dawn, ever. A first-claim on a resource the drive never gets to bid
for is a dead letter.

**Secondary — wave-5 door armor leg:** armored15 end=1.00 / max=3.25 on BOTH
arms (demand 4). Unmoved — nothing changed, so nothing moved.

**Watch — vine-sink reordering:** knives control=4 / armed=4, traps
control=65 / armed=65, tooHeavy 1218/1218, packRefused 0/0, leftBehind
178/178. Nothing reordered — the layer never consumed a vine, so no knife
or snare was ever deferred. The armed arm is byte-identical to control on
every trajectory (day hashes match per-run).

**§15 panel:** control→armed compare decision=review_required (16 rows each;
no material signal — the arms are identical). The panel is the instrument;
the pre-registered GO bar is the judge: NO-GO. Panel JSON+MD attached
(evidence/2026-10-19/vinearmor-panel-primary.{json,md,json.gz pair}).

**Verdict: KILLED AT PILOT.** Layer deleted zero-trace per kill protocol
(scripts/policies/vinearmor.js removed; instruments + evidence + proof
land). Kill proof: scripts/test-vinearmor-20261019.js (KILLED-VERDICT)
green post-kill.

**Diagnosis:** armor production is not winnable policy-side by reordering
the vine race — the race is downstream of two harder gates: (1) hides never
accumulate (0/1,912 days with hide≥2 & vine≥1), (2) bark armor is moot by
the time materials arrive (the scholar wears P≥10 loot armor; the base's
own bark craft fires twice in 4,000 days). The vine-priority mechanism is
proven correct (22/22 layer proof, GATE/DET/SMOKE green) but it never
engages. The armorprod diagnosis stands, sharpened: the gap is materials
acquisition (hides) and knowledge timing, not craft ordering.

## Village assessment

What the villages looked like: 16 paired villages on the pre-seat full
win-side stack (leadfeast/belongfeast, 180d death-aware). National 13/16,
table 12/16, wave-4 16/16, wave-5 0/16, wins 0/16 — the scale wall's shape
is exactly the armorprod shape (the two corpora even share seeds/policies/
substrate, and the trajectories rhyme: median survival 122.5d both). Two
runs survived the full 182d (leadfeast-s63806, belongfeast-s63806).

Who thrived and who died and why: unchanged from the armorprod assessment —
the combat-death mix is the taxonomy's field-combat bucket, raids at Haven
and wild/expedition fights. Nothing in this arm touched any of it (the
layer never fired; the arms are trajectory-identical).

What the village does while the layer is live: it functions — the layer is
a silent observer. Villagers act like people throughout (monster-naming
arguments, counter-learning by the fire, tribute presses in the
transcripts); nothing about the layer made them robotic, because the layer
did nothing. The one visible craft beat in the corpus (leadfeast-s63805
d18: "You've only SEEN a Bark armor..." → "You make a Bark armor." →
"Equipped Bark armor (torso).") is the base policy's, and reads as honest
learning.

## Sense-testing (SENSE-TESTING LAW)

Read: 2 armed-arm transcripts — leadfeast-s63802 (10,394 SAY lines) and
leadfeast-s63805 (7,128), full + armor-filtered.

**The craft beats that DO fire read sensibly.** The d1 bark-armor L1 beat
("Dawn at Haven. By the fire hangs an old bark cuirass, split at the seam —
somebody's grandfather wore this into the treeline and came back") teaches
L1 honestly. The d18 s63805 bark craft (base policy) reads as a real
learning moment: blind attempt → success → L2 recipe knowledge → equipped.
The hide-handling beat from armorprod ("You hold the hide — thick, raw,
smelling of the animal...") does not appear here — hides never arrive.

**The vine race is visible and honest.** "[d10] You also take some vine
(crafting material)." → "[d10] The Stone knife comes apart in your hands.
The materials are wasted. (craft failed)". The vine is harvested and
immediately spent on knives — the race the layer was built to reorder. The
race is real; the layer's bid never arrives because the armor-craft gate
never opens.

**Blanks / noise:**
1. The drive's total silence across ~4,000 sim-days is itself the finding
   (see Results): at dawn the pack never holds the materials with the
   recipe known and worn P below the bar. A real player who wanted armor
   would go GET hides — the policy never tries. Materials acquisition is
   the blank, not craft ordering.
2. No new noise introduced: "too heavy" rates identical (1218/1218), no
   pack refusals, no left-behinds change. The layer cost nothing because it
   did nothing.

## Named nexts

1. **Hide acquisition is the real production lever** — hides never bank
   (0/1,912 days with hide≥2 & vine≥1). A policy drive that deliberately
   harvests/cures hides (or a butchering-yield lever that keeps hides in the
   pack instead of spending/trading them away) would test whether hide
   armor is reachable at all. Out-of-arm; appended to the findings backlog.
2. **Dawn-vs-dusk craft timing** — the layer checked the pack at dawn;
   materials arrive mid-day via foraging. A drive that re-checks after the
   day's trips (still before the next dawn's sinks) would engage more often
   without touching the food economy. But with worn P≥10 from loot by then,
   the marginal gain is ~2 crafts corpus-wide. Concept-thin; noted, not
   claimed.
3. **Villager armor production remains the wave-5 door's binding leg**
   (carried from sim-armorprod; steve-call in the findings): armored15
   maxes at 3.25, demand is 4, and no policy verb can produce or transfer
   armor to villagers.

## Out-of-arm findings

(Appended to hidden_files/sim-findings.md; not chased.)
- Hide acquisition: hides never bank in the pack (0/1,912 armed-arm days
  with hide≥2 & vine≥1) — hide armor is materials-gated on hides before
  any vine claim can matter.
- The base policy's bark craft fires mid-day after foraging brings
  materials (leadfeast/belongfeast-s63805 d18); a dawn-timed drive never
  sees the co-occurrence.
- scripts/policies/vinebank.js (2026-10-14, loop B) is a live, different
  arm on the same name family — future armor-materials work must not
  collide with it again.

## Metric review

The pre-registered bar is met exactly as specified and missed honestly:
crafts/run control mean 0.13 vs armed mean 0.13 (ratio 1.00; paired deltas
16/16 exactly +0) vs the ≥2x bar, and 0.13 vs the ≥1.0 engagement floor —
NO-GO, never re-scored (§14). Two notes for the NEXT run on this axis:
1. The paired-identical-seed basis worked: 16/16 zero deltas is a louder
   signal than any aggregate could be — the mechanism provably never
   engages.
2. For production-side arms, an engagement floor (the ≥1.0 craft/run here)
   is load-bearing: without it, a 2x ratio on near-zero counts could pass
   on noise. Keep the floor.
3. The metric-review note from armorprod held: the door leg (armored15)
   was the informative secondary — here it confirmed the null (1.00/3.25
   both arms), which is itself evidence the layer never engaged.

## Convergence

**killed-at-pilot.** The arm is dead: NO-GO on the primary (ratio 1.00,
engagement floor missed), all guardrails trivially pass on identical
trajectories. The axis stays converging: the scale wall does not move on
armor-craft reordering — the diagnosis (hides never bank; bark armor moot
once loot armor lands; the vine race is downstream of both) is the
handoff. The claimed findings item
(ARMOR CRAFTING IS MATERIAL-STARVED) is answered: sharpened from
"vine is the contested resource" to "hides never arrive and bark armor is
moot by the time materials co-occur — the vine race is downstream."

## Files

- scripts/policies/vinearmor.js — the lever (DELETED zero-trace per kill
  protocol; pre-kill layer proof: scripts/test-vinearmor-20261019.js 22/22
  green — DON fixtures incl. the armorP reader and the no-communal-armor
  constraint; GATE: layer-off == bare stack byte-identical; DET:
  VINEARMOR=1 repeat byte-identical; SMOKE both policies x both arms, 30d,
  zero instrument errors. One mid-run design correction: the layer's
  pre-craft wearBest was removed after it diverged armed/control
  trajectories on s63803 without a craft attempt — equipping owned armor is
  the base policy's job, and the layer must not move trajectories for
  reasons unrelated to the vine claim.)
- scripts/probe-vinearmor-20261019.js — sweep probe (fork of the armorprod probe)
- scripts/analyze-vinearmor-20261019.js — before/after judge + §15 panel compare builder
- scripts/vinearmor-transcripts-20261019.js — SAY-line transcript probe (sysSay restored)
- scripts/test-vinearmor-20261019.js — layer proof (pre-pilot 12/12-style; KILLED-VERDICT post-kill if killed)
- evidence/2026-10-19/perseed-vinearmor/{control,armed}/{leadfeast,belongfeast}/s63801–63808.json — 32 per-seed sweep JSONs
- evidence/2026-10-19/vinearmor-analysis.json — pilot verdict JSON
- evidence/2026-10-19/vinearmor-panel-primary.{json,md,json.gz pair} — §15 panel compare
- evidence/2026-10-19/vinearmor-transcripts/ — 2 full + 2 armor-filtered transcripts
- evidence/2026-10-19/sim-vinearmor.md — this file
