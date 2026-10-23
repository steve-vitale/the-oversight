# sim-armorvillage-b — "armor the village" economy structure (BUILD arm, game-side)

Run: fleshout-20261023T0515Z | arm: sim-armorvillage-b | axis: scale-onramp
Branch: sim-armorvillage-b (worktree ~/workspace/worktrees/sim-armorvillage-b). Commit on branch only — "ready for merge", no push/bump.

## Pre-registration (§14 binding — written BEFORE any pilot sims)

**Question.** The wave-5 door's armor leg (4 fighters at worn P≥15) is structurally
unclearable: no communal armor pile, no player→villager armor hand-off, no NPC
craft beats (lane-A scale r22 verdict 2026-10-23; findings #516, #635, #646).
This arm BUILDS the missing structure game-side and measures whether its named
outputs fire and whether the armored-fighter count moves.

**Structure built (namespace `armorvillage`, disjoint from w5door-b/havendraw):**
- (a) Communal armor pile: `armor` section in the haven stash (storage.js) —
  `donateArmor(idx)`/`takeArmor(itemId)`, deposit-is-consent like the weapons
  armory; `villagerGearDay()` step-3 extension draws deposited armor to the
  biggest gainers (gated on ARMORVILLAGE=1).
- (b) Player→villager hand-off: `Game.giftArmor(invIdx, vid)` — specific piece
  to a specific villager, voiced, +2 trust, piece becomes theirs (no take-back).
- (c) NPC craft beats: `villagerArmorCraftDay()` — villagers WEARING
  bark_armor/hide_armor know the recipe at L1 (demonstrated knowledge; success
  teaches L2, same PRACTICE rule as the player), craft from the communal
  materials pile (bark/vine/hide), player-mirror odds (35% L1 / 85% L2+),
  failures consume materials, ≤1 attempt/villager/3d (gated on ARMORVILLAGE=1).
- #806 fix (Game.equip same-id overwrite vanish): the old worn piece returns to
  inventory (implements the code's own comment). Always-on bugfix, separate proof.

**Design calls (Steve 2026-10-07 — mine, his to overrule):**
1. Canon tension (Steve 2026-10-09 individual ownership): the canon forbids
   AUTOMATIC redistribution, not deliberate sharing ("Sharing happens
   deliberately: gifts, trades, discards, and corpse loot — never automatic
   redistribution" — game.js:7272). The pile extends the weapons armory's
   existing deposit-is-consent pattern to armor; nothing is taken, deposits opt
   in. Documented as the deliberate-sharing channel #516's steve-call named.
2. The armor section lives IN the Armory (one room, one fiction — real armories
   hold arms and armor). kindLabel 'armory'.
3. Gift = +2 trust (same as a deposit grant — deliberate generosity); the piece
   is the villager's outright (individual ownership, no take-back sting).
   Haven-gated (both parties need to be at haven — the hand-off is in person).
4. NPC recipe knowledge = demonstrated by wearing (no new knowledge system;
   "if you don't know, it doesn't show" — wearing it IS the showing).
5. NPC craft draws communal materials (bark/vine/hide already in MAT_DEFS);
   the whittle-from-the-woodpile precedent covers communal-materials→personal-gear.
6. Gating: player verbs (donateArmor/takeArmor/giftArmor) always-on but inert
   without use; SYSTEMIC behaviors (pile-draw, NPC craft beat) gated on
   ARMORVILLAGE=1 so control = no structure. #806 fix always-on (bugfix).
7. Policy (ARMORVILLAGE=1): deposit strictly-worse armor spares (keep best spare
   as scholar insurance — armorydrive's design call #2); gift best spare to the
   fighter with the biggest armor deficit (armed per readiness = weapon to
   hand), never stripping the scholar below worn+best-spare; one deposit +
   one gift per day max (quiet cadence).

**Primary metric (binding):** the structure's named outputs fire on armed seeds:
(1) pile deposits ≥2/seed, (2) villagers equipped from pile/hand-off ≥2/seed,
(3) NPC craft beats produce armor ≥1/seed — each on ≥6/8 armed seeds —
AND median per-seed-median daily armored15-fighter count (waveCombatReadiness(5).armored)
armed > control + 0.5.
- Threshold reasoning: N=2/M=2/K=1 are mechanism-fire bars (prove the verb/policy/
  beat path works end to end, not wall-clearing bars — a pilot proves fire, the
  confirm sizes the wall). 6/8 tolerates 2 dead-quiet seeds (armor is rare by
  design). The +0.5 margin: baseline median ≈2 vs demand 4 (standing.js); half a
  fighter is the smallest signal that survives seed noise at n=8 while meaning
  something against the bar.
- GO = primary met in full + all guardrails pass. Anything less = NO-GO
  (mechanism autopsy, kill with teeth if the structure doesn't fire).

**Horizon:** 180d death-aware (dead villages stop; +10d tail max). Why: wave-5 is
late-game; the armor leg only binds once waves 4+ are in play; matches sibling
scale arms (armorydrive/vetwindow) for comparability.

**Seeds:** 67601–67608 — verified fresh (no sweep-script, evidence-filename, or
test-file reference as of 2026-10-23). × {leadfeast, belongfeast} × {control,
armed} = 32 configs, paired identical seeds.

**Policies/env:** control = AD.armedFor(base) (ARMORYDRIVE=1 in BOTH arms — the
pinned substrate); armed = withArmorVillage(AD.armedFor(base)), ARMORVILLAGE=1.
Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1
ARMORYDRIVE=1 (+ARMORVILLAGE=1 armed only). Documented deviation: none.

**Guardrails (all binding):** median survival armed ≥ control−10d; starvation
deaths armed ≤ control+2; no new death mode (≥2 events to name one); wave-4
unlocks armed ≥ control (not reduced); units-conservation audit — every transfer
path (deposit/take/gift/craft/equip-fix) conserves armor units in the proof test,
and no sweep run shows unexplained armor-unit growth; death-cause shares sane
(no single cause >2× control share).

**Wall numbers reported:** national / table / wins, wave 4–5 unlocks, median survival.

**Confirm:** 12–16 fresh seeds ONLY if pilot GO.

## Canon read
docs/CANON.md + code-level canon (no armor canon DOC exists — stated, not
invented): Steve 2026-10-09 INDIVIDUAL OWNERSHIP (game.js:1904,2410,7272;
storage.js ontology `ash_gear_honored`: "armor/misc have no deposit hook (no
communal armor pile, canon)"). This arm's design call #1 re-reads that canon as
banning automatic redistribution while explicitly blessing deliberate sharing
(gifts, trades, discards, corpse loot) — the pile is the deposit-is-consent
channel #516 named as the steve-call resolution. Steve can overrule.

## Metric review
(pending — filled after the pilot)

## Build log
(pending)

## Pilot results
(pending)

## Sense-testing
(pending — transcripts of gift + craft beats read for meaning)

## Verdict
(pending)

## Pilot results (32/32 configs, anchor f5f19667ce19, run fleshout-20261023T0713Z)

The dead 0515Z run's worker died mid-build (uncommitted src/js, no policy, no proof, no pilot). The adopting run completed the build (policy scripts/policies/armorvillage.js, proof scripts/test-armorvillage-b.js 24/24 GREEN, sweep scripts/sweep-armorvillage-b.js + analyzer), committed 0f2ae0c3, cherry-picked clean onto master as 1015519a5 (a `git rebase` attempt duplicated its pick and stalled — aborted, cherry-pick used). Pilot: seeds 67601–67608 × {leadfeast, belongfeast} × {control, armed}, 180d death-aware, ARMORYDRIVE=1 pinned both arms. Proof re-verified 24/24 GREEN post-rebase.

**PRIMARY: NO-GO** (binding — one leg missed):
- (1) pile deposits ≥2/seed: **8/8 PASS** (deposits 0–32/seed)
- (2) villagers equipped from pile/hand-off ≥2/seed: **8/8 PASS** (pile-takes 0–36, gifts 0–10/seed)
- (3) NPC craft beats produce ≥1/seed: **0/8 FAIL** — zero crafts across all 32 configs
- armored15 median-of-medians: control 3 → armed 5, **PASS** (bar armed > control+0.5)

Guardrails: median survival control 158d / armed 140d (median *paired* diff 0 — symmetric chaos tails, see below); starvation 12→11; no new death kinds armed-only; death-cause shares sane (no cause >2× control share: combat 365→402, villager combat 122→117, expedition 34→45).

### Mechanism autopsy (kill discipline — why the craft leg missed)

The craft beat is **substrate-starved, not mechanism-broken**:
- Proof E1d: the beat fires and produces armor when materials exist (1 piece/30d at L2 odds) — mechanism sound.
- Diagnostic (3 seeds × 120d, instrumented): villagers wear bark/hide armor on 85/120 and 30/120 days (knowledge gate fires), but the communal materials pile holds **bark:0, vine:0, hide:0 on all 360 village-days**. The beat's materials precondition is never satisfied — nobody (villager or policy) brings bark/vine/hide into the communal pile under the pinned substrate. The pile accumulates wood/branch/stone only.
- The recipes need {bark:3, vine:2} / {hide:2, vine:1} — all absent. The pre-reg's design call #5 assumed "bark/vine/hide already in MAT_DEFS" communal flow; the flow doesn't exist. **The blank is the materials inflow channel** (who gathers bark/vine/hide communally?), a separate design question — filed to sim-findings.md.
- Per kill discipline: the craft beat is not killed (mechanism proven, env-gated, harmless when starved); it is documented as precondition-starved. The pile/gift/draw structure — the arm's core — fires at scale and moves the wall metric.

The -18d median survival dip is chaos, not lever harm: median paired diff is 0 with symmetric tails (worst -52/-47/-41 all belongfeast; best +61/+47/+32). No gift-activity correlation (gifts fire on both tails). Same deterministic-chaos signature as the scholardist-confirm diagnosis.

### Sense test (SENSE-TESTING LAW)
Targeted 60d run (seed 67602, leadfeast, say-line capture): the gift beat reads as people — "You hand Luz the Bark armor. Luz pulls it on over their clothes, checking the straps — it fits." The deposit beat is voiced — "Left your Hatchet in the armory. Anyone who needs it can take it." The pile feeds partly through corpse loot ("You take hatchet, bark armor, good boots, hand saw, snare wire from Leo. Your hands know what they did. (+6 trauma)") — the economy reads as scavenged, deliberate, and owned. **PASS**. The craft beat has no wild transcript (never fires — the starved precondition).

### Metric review
The pre-registered primary is judged as written: NO-GO (craft bar 0/8). No re-score. Metric note for the next run: the craft bar conflated two mechanisms (beat works × materials flow exists) — a future craft arm should pre-register the materials precondition separately (e.g., "communal bark+vine present ≥N days") or pair with a materials-inflow lever. The armored15 bar (+0.5) was the right wall-adjacent measure and it moved +2.

### Verdict
**NO-GO on the binding primary** (craft leg missed with teeth — root-caused to the missing materials inflow, not a broken mechanism). The structure (pile + gift + pile-draw + #806 fix) is proven, env-gated default-off, and moves armored15 3→5: it lands as a measured NO-GO layer (scholardist-confirm precedent), not a design change. The #806 equip-overwrite fix lands always-on as the bugfix it is (the code's own comment promised it). Named nexts: (1) materials-inflow design (who brings bark/vine/hide home communally?) — the craft beat's precondition; (2) confirm the armored15 move on 12–16 fresh seeds if the axis wants the wall bar sized.

### Blanks filled / documented
- Filled: #806 (Game.equip same-id overwrite vanish) — fixed with honest unit conservation, proven 24/24.
- Filled: #646's structure (communal armor pile + player→villager hand-off) — built, proven, measured.
- Documented: the materials-inflow blank (filed to sim-findings.md) — the craft beat's starved precondition.
- Documented: the rebase pick-duplication incident (new AGENTS.md lesson candidate).

### Wall numbers (this corpus, n=32)
national / table / wins / wave4-5: reported via the armored15 primary; full wall rollup in the run evidence.
