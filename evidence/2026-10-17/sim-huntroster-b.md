# sim-huntroster-b — hunt-roster generation audit (sim-huntduty-b's named next #1)

Diagnostic arm, loop B food-economy axis, run fleshout-b-20261017T1835Z.
Sibling: sim-huntduty-b (hunt-duty assignment audit — 0/672 hunt duties
assigned; policy never asks; ~0.6 hunter-competent villagers/seed via a
coarse occupation word-match). This arm audits the ROSTER/GENERATION side:
WHY is the hunting engagement substrate ~0.6/seed — generation gap,
measurement artifact, or canon-honest?

## PRE-REGISTRATION (binding; written BEFORE sims)

- PRIMARY: hunter-competent count per 12-person day-0 roster across 16
  fresh seeds × {leadfeast, belongfeast}, under SIX stated definitions:
  - D1 coarse14 / D2 coarse12: sim-huntduty-b's word lists (replication —
    expect ~0.6/seed combined, the figure under audit).
  - D3 engine14/engine12: Game.villagerCompetence(vid,'hunt') — the engine's
    OWN detector (ground truth for what any policy-side staffing arm could
    see).
  - D4 plus20: formerOccupation.includes('hunter') — villagerHuntResolve's
    +20% hunter-background bonus (expect 0 if the word list is stale).
  - D5 substrateSkill: occupation grants a hunt-relevant skill
    (game_sense|tracker|patient_aim|field_dressing) OR knowsSnare —
    the design-intent hunter-capable substrate.
  - D6 knowledgeHunt: the knowledge system recognizes this occupation as
    hunt-relevant (track_read|animal_behavior|snare_wire backgrounds) —
    the npcSeedSkills background route, pure data join.
  Plus: full occupation histogram across seeds (uniformity check of the
  genCharacter pick), day-90 re-snapshot (joiner channel), final duties of
  hunter-substrate villagers (what they did instead).
- GO = a verdict with exact classification: (a) generation knob exists and
  is set low (name the knob + fix spec with values), (b) generation lacks
  hunter-capable people by canon design (canon doc + line), or
  (c) measurement artifact (the audit measured coarsely — show the finer
  measurement). A wiring bug in the detector word lists counts as a named
  fix spec under (a)-adjacent.
- SEEDS: 7701-7708 (fresh; verified zero overlap with the banned lists in
  sim-huntduty-b's evidence: 4801-4808, 4101-4108, 6101-6108, 9701-9708,
  5201-5208, 931-938, 1801-1808, 4201-4208, 3801-3808, 107-884, 1940809,
  962-969, 941-948, 951-958, 4001-4004, 1253, 2601457, 1404-1406, 2026,
  2031, 2042, 3050, 3055, 3061, 8801-8808, 8701-8708, 8901-8908, 1707,
  1060511, 1802, s967, 7101-7108, 7601-7608, 7901-7908, 7611-7618).
- POLICIES: leadfeast, belongfeast (FEASTSCALE_R13=1, SEATDRIVE=0 EXPLICIT;
  16 runs total). 180d death-aware horizons (engine tail) for the wall
  context; the census itself is day-0 roster snapshots (+ day-90).
- INSTRUMENT: scripts/instrument-huntroster-b.js (read-only census: roster
  + getPerson + data-table joins + the real Game.villagerCompetence called
  read-only; zero RNG draws; zero state writes; zero src/js and zero
  scripts/policies changes). Wall maxima via read-only daily observer
  (huntduty-b's proven pattern); hunt-beat ring + death instrument =
  huntduty-b's proven wraps.
- INSTRUMENT HONESTY: scripts/test-huntroster-b.js — PART A RED-verified
  fixture (constructed 6-person roster counted exactly under all six
  definitions against the REAL table + REAL villagerCompetence; RED = no
  instrument → Game.__huntroster absent, nothing counted), PART B det-gate
  byte-identical trajectories instrument-on vs off (4 seeds ×
  {leadfeast,belongfeast} × 60d), SMOKE green.
- §15: per-seed panel-schema JSONs (schema 'huntroster-wall/1') for the
  wall metrics alongside the census; no lever piloted → no compare.
- Sense-testing (law): read at least one transcript day on the census
  seeds — is the blank visible in the fiction? Do villagers talk about
  hunting they never do? Backstories of hunter-substrate villagers sampled.
- COMPLETION GATES: 16/16 runs complete, schema-clean output, 0 instrument
  errors, det-gate green, fixture RED-verified.

## Canon read

- docs/CANON.md: read. Human skills ≠ alien abilities — hunting is
  human-skill lane (occupations grant it as background; npcSeedSkills seeds
  it; the System never needs to). "Every game starts with 12 random people
  from all over the world" (Steve 2026-10-04) — the roster premise.
- docs/BEAR.md: read. The bear is a non-monster monster fight (weapon
  effectiveness bow > spear > knife > bare hands; maul 8–17 at range ≤ 2).
  Butchering yields ~24 × 500-kcal portions; separable fat (bear 6 slabs);
  trichinosis (cooked only clears); L4 knowledge gating (rendering,
  pemmican via *Tallow & Keeping*). Hunting big game is REAL villager
  combat with real injury risk — the safety argument for any staffing arm.
- No canon doc sets a hunter spawn rate or says hunters must be rare.
  docs/VISION.md's "12 random people" is the only roster canon. The fiction
  itself contains hunters (Thornfield's tired hunter = the 'hunting guide'
  background seed Owen Smith) — the canon EXPECTS hunters to exist.

## Results

COMPLETION GATES (pre-registered): 16/16 runs complete (8 fresh seeds
7701-7708 × {leadfeast,belongfeast}, 180d death-aware), 0 instrument
errors, all 16 per-seed JSONs schema-clean. Det-gate: 8/8 byte-identical
60d trajectories, 0 errors. Fixture: 14/14 checks incl. 2 RED. (One
mid-sweep hiccup: a service restart wiped /tmp and killed the sweep at
6/16; the per-seed JSONs in the worktree survived; the remaining 10 runs
were re-run with the same instrument module. No duplicate seeds.)

### PRIMARY — the six definitions across 16 day-0 rosters (192 people)

| def | total | /seed | expected/seed | note |
|---|---|---|---|---|
| D1 coarse14 (huntduty 1.4x word list) | 0 | 0.00 | — | no 'soldier' drawn this time |
| D2 coarse12 (huntduty 1.2x word list) | 4 | 0.25 | 0.51 | 2 butcher + 2 farmer |
| D3 engine14 (villagerCompetence = 1.4) | 0 | 0.00 | — | — |
| D3 engine12 (villagerCompetence = 1.2) | 2 | 0.125 | — | temperament: 2 more at 1.08 (1.2×cautious 0.9) |
| D4 plus20 (includes('hunter')) | 0 | 0.00 | 0 | **dead code — see below** |
| D5 substrateSkill (design-intent) | 36 | 2.25 | 1.95 | the real substrate |
| D6 knowledgeHunt (knowledge system sees) | 24 | 1.50 | 1.40 | — |

Replication: huntduty measured 10/16 = 0.625/seed (4×1.4 + 6×1.2); this
census measures 4/16 = 0.25/seed coarse, 0 at 1.4x. Both are consistent
with the theoretical expectation 16 × (6×3/55 gen + 6×3/100 bg) ≈ 8.1
(Poisson σ≈2.8): the coarse figure is pure word-list footprint, and its
seed-to-seed swing (0.625 → 0.25) is the tell that it measures a rare
word, not a real substrate.

engineComp distribution (192 members): 1.0: 142 | 0.9: 22 (cautious) |
1.15: 14 (bold) | 0.7: 6 | 0.63: 4 (0.7×cautious) | 1.2: 2 | 1.08: 2 |
1.4: **0**. Not one of 192 roster members trips the engine's 1.4x hunter
detector. The detector's word list
('hunter','tracker','ranger','soldier','marine','poacher') matches exactly
ONE occupation in either person source ('infantry soldier' via 'soldier')
— and none was drawn on these seeds.

### The generation pipeline (static + empirical)

- **Occupation pick is uniform** (game.js genCharacter ~990): `pick(occPool)`
  over all 55 characterGen.json occupations, dedup-retry only. No weight
  field exists in the data — **there is no generation knob to be "set
  low."** Empirically: genCharacter channel chi2 = 59.8 (df=54, n.s.)
  across 96 generated members. The combined-roster chi2=90.8 is driven by
  the background-seed channel's hand-written composition, not a bias.
- **Roster = 6 genCharacter + 6 random draws from 100 background_survivors**
  (game.js ~2293). 16/192 bg members (8.3%) carry occupations with no
  characterGen match ('barber','dockworker','crossing guard','piano
  tuner','florist','postal worker') → occupationId null → they miss
  occupation skill/knowledge seeding (npcSeedSkills). Non-hunter, but a
  real small generation gap (findings line).
- **Skill grants work**: npcSeedSkills seeds occupation `granted` skills +
  knowledge backgrounds (knowledge.json backgrounds correctly name the
  real occupations: 'hunting guide'→track_read/animal_behavior/snare_wire,
  etc.). The generators are NOT thin: hunter occupations carry 4–6
  backstories each, hunt-flavored ("guided deer hunters through bottomland
  for eleven seasons… read sign the way other people read headlines").
- **The cap is in the detectors, not the pipeline.** Two word lists
  reference a ghost occupation namespace — 'hunter','tracker','ranger',
  'marine','poacher','athlete' exist as occupation names in NEITHER
  characterGen.json NOR background_survivors.json:
  - `villagerCompetence(vid,'hunt')` 1.4x (game.js ~5835): fires only on
    'infantry soldier'.
  - `villagerHuntResolve`'s +20% (game.js ~6216):
    `formerOccupation.includes('hunter')` — 'Hunting guide' does NOT
    contain 'hunter'. **Fires on zero persons in either table: dead code.**
    Pinned by the RED fixture (A5/A6): a literal hunting_guide scores
    engineComp 1.0 and plus20 false.

### The 36 hunters that never hunted (D5 substrate)

Ruby Roth + Hisham El-Sohagy (hunting guide; game_sense, patient_aim,
knowsSnare), Martín Escajadillo (fishing guide), Miriam Vogel (wild food
forager), Theo Lindqvist + Leo Martin (trail crew lead), Nayan Haque (bush
pilot), Irving Griffin (exterminator — holds the actual `tracker` skill),
Rabiu Sule (farmer), Felicia ODonnell (butcher), Vera Taylor + Ursula
Weber (mortician; field_dressing), Layla Palmer + Emma Larsen
(veterinarian), Irving Zhu + Ignacio Burgos (fisherman; game_sense),
Elijah Gallo (dentist; patient_aim). **Every one: engineComp ≤ 1.2,
plus20 = false.** Ruby Roth — eleven seasons guiding deer hunters —
scores exactly what an ER nurse scores.

Day-90 re-snapshot (13/16 runs alive): hunter-substrate retention 38.9%
(14/36) vs 50.0% overall (96/192) — suggestive (small-n) that hunters die
faster; the death stream is combat-dominated (see wall), and the fiction
says hunters take risks. Not conclusive; flagged, not claimed.

Final-duties read (weak — assignments are transient; most hunter-substrate
villagers were dead by run end): no hunt duties held by anyone, ever
(consistent with huntduty's 0/672).

### Wall numbers (standing directive)

16 runs: national 11/16, table 16/16, wins 0/16 (pre-seat substrate —
no modal driver on this road; huntduty measured the same), exiled 0/16,
Arc IV 16/16, wave-4 0/16, wave-5 0/16, median survival 180d (death-aware;
several runs ran the full 180).
Deaths: 739 total — combat 467, villager combat 147, monster 67,
expedition 22, sickness 11, wound-unclosed 8, contest 7, alien 5, ambush 4,
starvation 3. Food-side deaths ~1%, same as huntduty's substrate.

TELEMETRY DEVIATION CHECK: 2 LOUD lines against
telemetry-baselines/scale-wall.json (national 0→11, table 0→16 "newly
appeared" — an artifact of flat-key baseline vs `metrics.` dotted lookup;
true comparison: national 11 vs baseline 12, table 16 vs 16). Triage:
EXPLAINED — national 11 vs 12 is run-to-run noise on the same substrate
(huntduty: 14/16); wins 0 vs baseline 16 is the known substrate mismatch
(baseline is the full-stack win-side substrate with modalplay/seatdrive;
this substrate is pre-seat r13-only, FEASTSCALE_R13=1 SEATDRIVE=0
EXPLICIT — wins=0 is the substrate's own control). Baseline NOT rolled.

## Verdict: (c) MEASUREMENT ARTIFACT + (a)-adjacent WIRING BUG — named fix spec

- **(c) confirmed.** The ~0.6/seed is the footprint of the engine's own
  stale word lists, not the real substrate. Finer measurement: **~2.25
  hunter-capable villagers per 12-person roster (D5)**, ~1.5 recognized by
  the knowledge system (D6). Generation is not the blank.
- **(a): the knob doesn't exist** — uniform pick, no weights. The adjacent
  real blank is wiring: the two detector word lists reference ghost
  occupations. This also invalidates the huntduty fix spec as written:
  `assignBest(Game,'hunt',['hunter','tracker','ranger','soldier','marine',
  'poacher'])` would match only 'infantry soldier' (~0.2/seed) — the
  follow-up must use the corrected list.
- **(b): no.** No canon mandates hunter rarity; the fiction expects
  hunters (Owen Smith 'hunting guide' seed; System hunt challenges).

### Named fix spec (for the wiring arm + sim-huntstaff-b)

1. **Data-driven (preferred):** add `huntTier: 1.4 | 1.2` to the 14
   hunt-relevant characterGen.json occupations; read it via occupationId
   in `villagerCompetence` (replacing the 1.4x/1.2x word lists) and in
   `villagerHuntResolve` (replacing `includes('hunter')`). hydrateSeed
   already sets occupationId by name match, so background survivors are
   covered. Proposed 1.4: hunting_guide, fishing_guide, rancher,
   exterminator, trail_crew, forager, pilot, soldier. Proposed 1.2:
   farmer, butcher, fisherman, veterinarian, mortician. Safety: zero
   behavior change off the hunt path; the 1.4x touches duty efficiency +
   assignBest scoring only; the +20% is a +0.2 additive capped at 0.95;
   the injury roll is untouched. Villager combat risk is unchanged by the
   wiring fix itself.
2. **Minimal (no data change):** align the word lists to the real tables —
   1.4x: ['hunting guide','fishing guide','trail crew','rancher','wild food
   forager','bush pilot','exterminator','soldier']; villagerHuntResolve:
   match occupationId or the same name set; 1.2x: keep
   'butcher','farmer', add 'forager','fisherman'.
3. **sim-huntstaff-b staffing handle (corrected):**
   `assignBest(Game,'hunt',['hunting guide','fishing guide','trail crew',
   'rancher','forager','bush pilot','exterminator','soldier'])` gated on
   (a) lean/starvation day, (b) hunter-substrate + HP≥40 + trust≥40 (avoids
   the 40% reluctant roll; engine enforces HP/in-person itself), (c) one
   hunter at a time. Expected engagement substrate ~2.25/seed (vs 0.25
   under the old list) — the pilot bar huntduty pre-registered is now
   meetable. Safety argument (hunting is villager combat — BEAR.md maul
   8–17, wave-1 animal shock law, injury roll 0.08–0.22): the gates above
   + villagerGearUp arms them from their own gear (already in
   villagerHuntResolve); pilot guardrails starvation ≤ control+2,
   villager deaths ≤ control, no new death mode, det-gate gate-off
   byte-identical. Zero game-code changes for the staffing layer itself.

## Sense-test (law)

The blank is fully visible in the fiction — the village TALKS hunting it
never performs:

- The System orders hunts on runs whose rosters include literal hunting
  guides: "📢 SYSTEM CHALLENGE: 'Catch something! Anything! We want to see
  how you do it!' (Hunt an animal today for a reward.)" (d8
  belongfeast-7708 — roster: Hisham the hunting guide, Irving the
  exterminator, two trail crew leads). The challenge can only be answered
  by the scholar's own feet; no actor exists to send Hisham.
- Relief beats, run after run: "Or the hale hunt while the sick lie
  still." / "send the strong out hunting while the sick rest." / "or hunt
  hard to replace what we lost. Say which — standing here isn't an
  answer." Options the labor system cannot staff — the fiction proposes,
  the engine has no verb.
- The social system SEES the hunters the duty system can't: d28
  leadfeast-7708 — "❓ Village talk: Hisham isn't really a hunting guide,
  according to Leo. You haven't heard Hisham's own story yet." / "👂
  Overheard — Leo (to Terrence): 'You didn't hear it from me, but Hisham's
  story doesn't hold. A hunting guide, back before.'" (Leo Martin is
  himself a trail crew lead.) Gossip litigates Hisham's hunter identity
  while the labor system scores him 1.0.
- The System crowns what the village can't use: d53 leadfeast-7705 —
  "◈ The System names Nayan: Stalker of the Apex Predator." Nayan Haque,
  bush pilot, knowsSnare — hunter of the year, zero hunt duties.
- Backstories are not thin (procedural-depth rule satisfied here): "Ruby
  guided deer hunters through bottomland for eleven seasons. They read
  sign the way other people read headlines." The people are written; only
  the detectors are blind.

## Village assessment

Sixteen well-fed villages (11/16 national, 16/16 table) where 739 people
died and ~14 of food. The duty economy is fish/water/wood/cook — the creek
and the woodpile. The hunters walk among the villagers — Ruby reading
sign, Hisham with eleven seasons in the bottomland, Irving who actually
holds the tracker skill — and the village has no hunt for their hands.
They do what everyone does (transient other duties) and die like everyone
dies (combat first; hunter-substrate retention to day 90 runs 39% vs 50%
overall — suggestive, not conclusive). Who thrived: fishers, water crews,
the safe labor. Who died: fighters — 467 combat, 147 villager-combat, 67
monster. The blank I fill: the ~0.6 was never a generation gap. The
village HAS hunters — two per roster, by design, with the skills, the
knowledge, the backstories, and the gossip to prove it. What it lacks is
an engine that can see them and a policy that asks. The next arm is a
wiring fix + a staffing layer, not a roster question.

## Metric review (mandatory)

- PRIMARY answered exactly: six definitions measured on 192 roster
  members across 16 fresh seeds; the ~0.6 replicated as word-list
  footprint (0.25/seed here, 0.625/seed huntduty — both within noise of
  the 0.51 expectation) and superseded by D5 (2.25/seed).
- One measurement caveat (not a rescore): engine12 counts exact 1.2, but
  temperament modulates (cautious 1.2→1.08, bold 1.0→1.15) — the
  distribution table reports the full spread; the verdict doesn't depend
  on the bucketing.
- Det-gate ran 60d (not 180d): the instrument's reads are day-invariant;
  set before spend, not rescored. The sweep's 180d horizons are
  death-aware (engine tail).
- The mid-sweep service restart is documented above; the 10 re-run seeds
  used the identical instrument module; no duplicates.
- Panel-schema JSONs emitted per seed (evidence/2026-10-17/
  perseed-huntroster/wall-*.json, schema 'huntroster-wall/1'); full census
  JSONs alongside. No lever piloted → no balance-panel compare (§15: the
  panel is the instrument, the pre-registered threshold is the judge —
  there is no armed side).
- No metric was re-scored mid-run. No other §14 event.

## Findings for sim-findings.md

- [open] 2026-10-17 — hunt-roster wiring — villagerCompetence('hunt') 1.4x
  word list + villagerHuntResolve includes('hunter') reference ghost
  occupations; the +20% hunter bonus is dead code (0/192). Named fix spec:
  huntTier data field on the 14 hunt-relevant occupations (or aligned word
  lists); corrected sim-huntstaff-b staffing list in evidence
  (run fleshout-b-20261017T1835Z).
- [open] 2026-10-17 — background-survivor generation gap — 6/100
  background_survivors occupations ('barber','dockworker','crossing
  guard','piano tuner','florist','postal worker') match no characterGen
  occupation → occupationId null → miss occupation skill/knowledge seeding
  (run fleshout-b-20261017T1835Z).
- [open] 2026-10-17 — hunter mortality — hunter-substrate villagers retain
  to day-90 at 38.9% vs 50.0% overall (n=36, suggestive): do hunters die
  faster — intended risk-taking or exposure? (run
  fleshout-b-20261017T1835Z).
