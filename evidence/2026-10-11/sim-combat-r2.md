# Long-run sim — lever 1 r2: combat & death share, trap acquisition on-ramp (2026-10-11)

## Lever played
**Trap acquisition on-ramp: put traps in hands.** Three coordinated changes, one lever:

1. **`scripts/policies/competent.js` — `workTrapline()`** (new): the competent
   policy keeps a snare trapline when it knows the recipe. Craft at L2+
   (1 vine + 1 stick, 85%); at L1 blind only when materials are plentiful
   (3+3, 35% odds, materials at real risk — a competent gamble). Cap 2 held
   traps (consumed on set, wear out — a working line, not a stockpile). Set
   on wild ground (never haven/ruin), once/day. The old every-3-days setter
   stub in `counterPlay` is folded in here (one place, one cadence).
   `workTrapline` is exported as a test seam.

2. **`src/data/characterGen.json` — `knowsSnare: true`** added to 4 occupations:
   `forager`, `rancher`, `trail_crew`, `fishing_guide` (was only
   `hunting_guide` of 55). Exact diff: 4 insertions, nothing else.
   The snare is primitive technology ("a loop, a stick, an animal" —
   the L1 text); the game already treats the stone knife as universal
   for the same reason. Rural/woods occupations not knowing it was the
   stranger fiction.

3. **`scripts/policies/competent.js` — `forageTripSeedFirst` retry**:
   the policy foraged the nearest stocked tile every day, but that tile is
   usually the one picked clean yesterday (detail regrows in ~2 days) —
   every trip failed with "worked out", so the policy gathered NO wild
   food and NO crafting materials for weeks. Now it steps to another green
   patch (up to 3 nearest tiles) when the forage fails, like the game's own
   failure line says. This was a prerequisite for the lever (no materials →
   no traps) and a real measurement-quality fix: the "competent" policy's
   foraging was broken, which inflated starvation deaths in every prior
   lever-1 measurement.

**Why this lever (5-question evaluation):**
1. Real-world anchor: a snare is among the oldest human technologies; rural
   people knowing it is the default, not the exception.
2. What breaks if wrong: too much trap knowledge → free meat → food pressure
   eases. Guardrails: traps cost materials + time + a day-part; 40%/day catch
   on stocked ground with declining returns (trap shyness); uses wear out;
   carcasses must be cleaned (disease risk); the knowledge gate still binds
   (50/55 occupations must learn via the trust-15 teaching channel or a
   witnessed catch).
3. What the sim says: below — on-ramp opened (0→2), starvation halved.
4. What it feels like: the village traps. "Hunting capacity = trap supplies
   + knowledge" (Steve) becomes real instead of decorative.
5. Fiction: the trap system (ecology, shyness, uses, rot, carcass pipeline)
   was fully built and never ran. Now it runs.

**Why this lever and not another:** traps sat at 0/0 across EVERY measured
run (this cycle confirmed 0/0 again on current master before the change).
Player-side armor and counter-play remain documented blanks; the armor curve
itself is untouched (Steve's 2026-10-09 model respected).

## Before / after (identical seeds 1–16, 200 days, competent policy)

| metric | before | after | delta |
|---|---|---|---|
| traps crafted | 0 | 2 (seed 11) | on-ramp opened |
| traps looted | 0 | 0 | loot channel still dry |
| player deaths | 101 | 83 | −18 |
| player starvation | 33 (33%) | 15 (18%) | **halved** (forage fix) |
| player combat | 68 (67%) | 66 (80%) | flat absolute; share up |
| villager deaths | 57 | 72 | +15 |
| villager combat | 48 (84%) | 56 (78%) | +8 |
| median survival | 54.5d | 40.5d | −14 (noisy — see below) |
| max survival | 98d | 81d | −17 |
| wave-1 fights / loss | 122 / 42% | 118 / 49% | noise band |
| wave-2 fights / loss | 52 / 58% | 42 / 64% | noise band |
| wave-3 fights | 13 | 1 | runs ending earlier |
| counters discovered | 103 | 91 | noise |
| national reach | 0/16 | 0/16 | upstream still binds |

**On the survival drop:** per-seed deltas are ±50 days (seed 4: 98→44,
seed 12: 42→71) — chaotic-sim noise dominates at 16 seeds. The forage retry
increases wild exposure (2–3 successful forages/day vs 0–1 failed), which
honestly trades starvation for combat: starvation deaths halved, combat
deaths flat. Whether the median drop is the retry's cost or noise needs more
seeds; flagged for the next cycle.

## Reachability verdict (combat content)
- **Wave 1:** 16/16 runs fight it. Loss 42→49% (designed brutality intact). ✅
- **Wave 2:** 15/16 runs. Loss 58→64% (small samples, noisy). ✅
- **Wave 3:** 13→1 fights. Barely reachable; runs ending earlier didn't help.
  Still lever 2's bar. ⚠️
- **Waves 4–5:** 0/16. Not reachable. Lever 2. ❌
- **Traps:** 0→2 crafted. The engine (craft→set→dawn check→ecology→shyness→
  carcass) now runs in long sims. Still a crack, not a flood — materials
  trickle (vine 30%/bush, stick 40%/tree as foraging byproducts). ✅ (opened)
- **Counters:** 91–103 discovered; policy still doesn't play them tactically.
  Documented blank (unchanged).
- **Armor:** unchanged this cycle (villager bark armor from r1 still in play).
- **Win flag / table:** 0/32. Upstream still binds.

## Village assessment (plain words)
The village forages for real now — and it shows in the death ledger. Before,
the "competent" scholar spent weeks failing on the same worked-out patch
next to Haven while the pantry starved; a third of scholar deaths were
starvation with food in the wilds. Now the scholar steps to another patch:
starvation deaths halved (33→15), and the two traps that got built are the
first real traps in any measured 200-day run.

Who thrived: nobody in particular — the seeds are chaotic. Who died: scholars
still die to combat at the same absolute rate (66 vs 68); villagers died more
(72 vs 57), partly because more of them now run TRAPS objectives in the wilds
(the knowsSnare widening puts ~1 trap-knower per village instead of ~1 per
5 villages). What's missing: the trap trickle is slow (materials are a
foraging byproduct; 2 traps in 16×200 days). The teaching channel (hunter
shows the scholar at trust 15+) still never fired in 16 seeds — trust climbs
too slowly for it to matter in most runs.

## Sense-testing (transcripts read)
**Trap beats are sensical when they fire** (unit-level, seeded): "You make a
Snare. a loop of vine on a bent stick..." → set on wild ground → dawn:
"🪤 TRAP: Your Snare ... caught a Cottontail Rabbit! About ... kcal on the
bone — clean it quickly (knife). It rots fast." Uses decrement, shyness
tracks, the carcass needs cleaning. The fiction holds end to end. ✅

**Villagers still repeat themselves** (prior blank confirmed open):
three different villagers on three days, verbatim: "Honestly? there's
tension about who's in charge." (lever 3/4: dialogue variety). Agency XP
still 0/0/0 for most villagers at day 30 (lever 3).

**Death narration still lands:** "📖 The Codex turns a page on its own.
Emma is dead. You didn't ask. It knew." / "Nobody's talking much. The fire
feels smaller tonight." ✅

**New find (documented, not fixed — policy donation timing):** when the
scholar is away from the hall, `donateHaul` spams "The pantry is in the
hall. Your hands are not." once per food item (30+ lines in a day). The
policy should only donate at camp. Out of this lever's scope; noted.

## Proofs & tooling
- `scripts/test-trapline-20261011.js`: 22/22 green ×2 seeds (SEED=20261011, 7).
  Proves: hunter/forager/rancher/trail_crew/fishing_guide scholars start with
  snare L3; policy crafts (L3 + materials) with the 2-trap cap; policy sets on
  wild ground (tool consumed); dawn checkTraps catches on stocked ground
  (carcass, uses--, shyness++); L0 refuses; L1 blind gambles only when
  materials are plentiful.
- `scripts/sense-trapline-20261011.js`: transcript sampler (SCHOLAR_OCC,
  SEED, DAYS env).
- `scripts/sense-villagers-20261011.js`: pre-existing villager sense script
  (re-ran for this cycle's evidence).

## Files changed (commit bb17df47)
- `scripts/policies/competent.js` (+65/−16): workTrapline + forage retry + export
- `src/data/characterGen.json` (+4): knowsSnare ×4 occupations
- `scripts/test-trapline-20261011.js` (new): 22-check proof
- `scripts/sense-trapline-20261011.js` (new): transcript sampler

## Blanks filled / documented
- **Filled:** trap acquisition on-ramp (policy + knowledge + materials).
  Traps went 0→2 crafted in long sims; the engine now runs.
- **Filled:** competent policy's foraging was broken (worked-out-patch loop).
  Starvation deaths halved as a result.
- **Documented:** trap loot channel still dry (0/0 looted); teaching channel
  never fires at trust-15 gating; trap trickle is slow (materials as
  byproduct); askAbout 'village' verbatim repetition; agency XP 0s;
  donate-away-from-hall spam.
- **Design call for Steve:** is the snare too widely known now, or should it
  be wider still (universal like the stone knife)? Currently 5/55 occupations
  start with it. The 5-question evaluation above is the case for the current
  line; he can overrule.
