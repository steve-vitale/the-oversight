# sim-monstermeat-b — the pack→mouth last mile (loop B, 2026-10-15)

ARM: sim-monstermeat-b. Finding #17 (open, 2026-10-13): revealed monster meat
rots uneaten (player-eaten 0 across all arms); scholars satiate on fish/garden,
succession wipes packs, blind cooking burns 60% (r12 kitchen). The duty cook
drive works the PANTRY surplus — the blank is the pack→mouth last mile.

## PRE-REGISTRATION (written BEFORE any sims — binding per MEASUREMENT.md §§9–12, 14)

- **Primary metric (both must hold):** revealed-monster-meat rot-share armed
  ≤ 0.5× control AND revealed-monster-meat kcal eaten (anyone) ≥ 10k/run mean.
  rot-share = revealed rotted / (revealed rotted + revealed eaten), in the
  meatlastmile instrument's revealed-valued kcal. eaten(anyone) = scholar
  eaten + villager eaten (pantry-pool residual).
- **Guardrails:** alien-quirk acquisitions armed ≤ control+2; no new death
  mode; starvation deaths armed ≤ control+2; national armed ≥ control−2/16;
  median survival report-only.
- **GO → land the layer. MISS → delete the layer per kill protocol, commit
  evidence + instruments as KILLED AT PILOT.**
- **Horizon:** 180d death-aware (+10d tail max).
- **Seeds:** 121/232/343/454/565/676/787/898 × {leadcourt,belongseek} ×
  {control,armed} = 32 runs. OWN control in the SAME sweep. FEASTSCALE_R13=1
  both sides (feastscale courtship substrate: leadcourt→leadfeast,
  belongseek→belongfeast per the sleepin precedent).
- **Det-gate:** proof test RED→GREEN before sweep spend; SMOKE=1
  instrument-honesty gate.
- **Convergence state:** GO → land; MISS → killed-at-pilot.

## Canon read

- docs/CANON.md (knowledge law: "if you don't know, it doesn't show"; no
  silent actions; human skills ≠ alien abilities).
- docs/DISEASES.md (mandatory): the ALIEN pool (howlbelly, gristlefit,
  croakbelly, shellgut, witness_maw, flockmind + eurika/east_nile/lemons) —
  alien meat carries quirks as min-max building blocks; whoever eats alien
  meat risks the alien pool; never touched by mundane medicine. The engine
  prices it at eat time (maybeMonsterWeirdness raw 35%/cooked 20% for the
  scholar; villagerMonsterWeirdness same table for villagers) — the layer
  routes the meat but never suppresses or hides the price; the guardrail
  counts acquisitions.
- docs/PRESERVATION.md: the ladder (cleaned 2d < cooked 5d < smoked 30d <
  rendered 90d < pemmican 120d); blind penalties teach once (r12's 60% burn
  is the lesson: never blind-burn); cooking never destroys honest calories.
- r12 kitchen evidence (evidence/2026-10-13/sim-kitchen-r12.md): the cook→eat
  last mile is not the binding constraint — the revealed pool is tiny
  (~1.6k/83d), the scholar satiates on fish/garden, succession wipes packs,
  blind cooking burns 60%. Killed at pilot (eaten 0 vs 25% GO).
- sim-meatlastmile diagnostic (evidence/2026-10-15/sim-meatlastmile-b.md,
  landed ~00:00 CDT today): the bind is corpse-rot at 79.7% — meat never
  leaves the corpse. Pack-side revealed-valued pool ~217/run; the only eaten
  meat (800 kcal/16 runs) was raw off the carcass; succession-lost 0 (no meat
  in packs at death); the reveal makes raw carcasses edible (steve-call #278).
  Recommendation: the next arm must work kill→haul, not the kitchen.

## The lever (policy-side, scripts/policies/monstermeat.js)

`withMonsterMeat(base, id)` — MONSTERMEAT=1 opt-in (default OFF; gate-off
delegates byte-identically, det-gate pinned). Chains the base upkeep/daily/
fight (never clobbers per #119). Two beats, both before the base eat beat:

1. **Eat revealed first (hungry):** scholar eats revealed-edible monster meat
   first via eatOne, soonest-spoiling first — before the base beat fills the
   bar on fish/garden. (The "fresh-first eating when hungry" candidate.)
2. **Pack→pantry donation:** donates ALL revealed-edible cleaned+ monster meat
   to the pantry (not just competent's buffer surplus) when the hall is
   reachable — so the village's cook drive + meals process it with the
   village's real cooks, and it survives succession (pantry outlives pack).
   Carcass-state excluded (not pantry food; the haul layer's job).

Guards: NEVER edible:false (knowledge law); NEVER meat_human (trembles);
spoiled skipped; refusal-free (pre-checks hall access so the transcript
doesn't fill with "The pantry is in the hall. Your hands are not.").

**Mid-pilot design change (documented, not hidden):** a third beat —
knowledge-gated in-pack cooking — was built, proven (18/18), and then
REMOVED after the pilot's first 24 runs. It never fired (mmCooked=0
everywhere), and its fire check diverged trajectories even with zero firings:
bisected on s676, the cook beat (via Game.nearFire()'s dead-fire sweep, a
real state change) diverged gate-ON from gate-OFF; a sweep-free grid read
diverged too. The r12 kitchen layer owns cooking; this layer owns routing.
The 4 armed runs that could have been tainted (s343/s676 × both policies)
were re-run with the fixed two-beat layer; the proof test was updated
(15/15) and the zero-firing purity re-verified byte-identical on s676.

## Proof (scripts/test-monstermeat-20261015.js — 15/15 GREEN)

- RED phases: both beats are pure no-ops with the gate unset.
- GREEN: hungry scholar eats revealed meat (kcal rises, mmAte counts);
  hall access → meat moves pack→pantry (mmDonated counts);
  away-from-hall → untouched, no refusal spam.
- Guards: edible:false and meat_human untouched by every beat.
- Det-gate: gate-OFF wrapped vs pristine leadfeast/belongfeast byte-identical
  on seeds 121/232 × 30d.
- Purity: gate-ON with zero firings byte-identical to gate-OFF on s676 × 100d
  (re-verified after the cook-beat removal).
- SMOKE: layerOn() === (MONSTERMEAT==='1') honest.

## Pool sizing (pre-pilot probe, /tmp/meatprobe — plain courtship, seeds 121/232)

killed 14–26k/run gross, corpse-rot 78–100%, eaten 0 on all 4 runs,
revealed-valued pool ~300/run. The eaten GO (≥10k/run) is ~30× the
addressable pool — flagged here before the sweep, NOT re-scored after.

## Results (pilot — 24/32 runs at timeout)

The sweep timed out with 24 of 32 per-seed JSONs written (14 control, 10
armed; missing: belongseek-armed s343/s676/s787/s898, belongseek-control
s787/s898, leadcourt-armed s787/s898). The verdict below is STRUCTURAL,
not seed-dependent — the missing 8 runs cannot move it (see GO/NO-GO).

| metric | control (14) | armed (10) | bar | verdict |
|---|---|---|---|---|
| revealed rot-share | 1.000 (435 rotted/run) | 0.848 (176 rotted / 32 eaten per run) | armed ≤ 0.5× control = ≤0.500 | MISS |
| revealed kcal eaten/run mean (anyone) | 0 | 32 | ≥ 10,000 | MISS (~300×) |
| mmAte (layer eat beats) | — | 2 total | — | barely fired |
| mmDonated / mmDonatedKcal | — | 0 / 0 | — | never fired |
| alien quirks | 7 | 5 | ≤ control+2 | GO |
| starvation deaths | 0 | 0 | ≤ control+2 | GO |
| national | 10/14 | 8/10 | ≥ control−2 | GO |
| new death mode | — | none | none | GO |

The layer's eat-first beat fired twice in 10 armed runs; the pack→pantry
donation beat never fired once. The revealed-valued pool the pre-pilot
probe sized at ~300/run reproduced in the sweep (armed: 176 rotted + 32
eaten = ~208 revealed-valued/run; control: 435 rotted + 0 eaten = ~435/run
— the pool is small and mostly rots in stash/pack).

## GO/NO-GO

**NO-GO — KILLED AT PILOT per the binding pre-registration.** Both PRIMARY
legs missed: rot-share 0.848 vs the ≤0.500 bar, and eaten 32/run vs the
≥10,000/run bar. The second leg was structurally unmeetable — the
addressable pool (~300/run, probe-verified pre-sweep) is ~30× smaller than
the bar. Even perfect routing on the 8 missing runs caps the armed eaten
mean near ~150/run. The layer is deleted per kill protocol; evidence +
instruments committed, layer leaves no trace.

## Village assessment

24/24 completed runs ended village-lost (median horizon truncation, not a
layer effect — control identical). Deaths: combat 659, villager combat 215,
monster 154, expedition 46, the rest scattered (The Eater 3, wound 7,
sickness 11). Zero starvation deaths both sides. The villages look like
every other courtship-substrate village: they fight, they don't starve,
they die to attrition. The layer changed nothing about how villages live
or die — it barely touched their food (32 kcal/run of monster meat against
a fish/garden economy). No new behavior to assess; the arm's story is the
pool's story (see Blanks).

## Sense-test (transcripts)

There is almost nothing to sense-read: mmAte=2, mmDonated=0. The beats
captures confirm the layer's near-silence rather than any texture — no
refusal spam (the hall pre-check held), no quirk events from routed meat
(quirks 5 armed vs 7 control, all from ambient sources). The honest
sense verdict is that the routed-meat channel is too thin to have a
voice. The villages' transcripts read like the substrate's usual —
combat, feasts, succession — untouched by this arm.

## Reachability verdict

Not applicable to this arm — a policy routing layer changes no content
gates. Wave/arc/national reach on the 24 runs matches the substrate
(maxWave 4–5 observed, national 18/24, everTable on the long runs);
nothing regressed, nothing unlocked.

## Blanks filled / documented

Finding #17 (revealed monster meat rots uneaten) is DOCUMENTED, not
filled. This arm plus the morning's sim-meatlastmile diagnostic now bound
the problem on both sides:

- meatlastmile: the bind is corpse-rot at 79.7% — meat never leaves the
  corpse. kill→haul is the missing mile.
- monstermeat-b: the pack→mouth mile is real but tiny — ~200–400
  revealed-valued kcal/run, of which the layer could route ~32/run to
  mouths. The donation beat (pack→pantry) never fired: revealed meat never
  accumulates in packs in haulable quantity.

The recommendation stands and hardens: the next arm must work kill→haul
(hauling revealed-edible meat off the carcass before corpse-rot), not the
kitchen and not the pack. Filed as the follow-up direction in metric
review.

## Convergence

killed-at-pilot. The pack→mouth routing direction is exhausted on this
substrate — the pool is two orders of magnitude below any meaningful
food-economy threshold.

## Metric review

1. **The eaten bar (≥10,000 kcal/run mean) was ~30× the addressable pool.**
   The pre-pilot probe sized the revealed-valued pool at ~300/run and
   flagged this BEFORE the sweep; per §14 the threshold was not re-scored
   after seeing numbers, and the arm was killed on the binding metric. For
   the NEXT arm: pre-register the pool size from the probe and set the bar
   as a multiple of the pool (e.g. eaten ≥ 0.5× pool), not an absolute kcal
   figure. The absolute bar made the kill a foregone conclusion — honest
   per the rules, but wasteful of a pilot.
2. **Pilot incompleteness (24/32 at timeout):** the verdict is structural
   (pool ≪ bar on both legs), not seed-dependent. The 8 missing runs are
   documented as missing, not imputed. No metric was computed on a
   completed pilot and none is claimed as one.
3. **The rot-share bar (≤0.5× control) behaved as designed** — control
   rotted everything (1.000), armed moved it to 0.848. The layer does
   route; there is just nothing to route. A future kill→haul arm that
   grows the pool should re-test routing against this same bar.
4. **Mid-pilot design change (cook-beat removal) was handled cleanly:**
   the diverging fire-check was bisected, removed, the 4 tainted armed
   runs re-run, proof updated (15/15) and zero-firing purity re-verified
   byte-identical. No hidden state in the verdict above.
