# sim-armorbreak — armor-fragility census at wave-4 unlock deferrals (2026-10-17)

Run: flesh-out loop diagnostic sim-armorbreak (run_id fleshout-20261017T1844Z), axis scale-onramp (blocking).
Canon: docs/CANON.md + docs/MONSTER-WAVES.md (read first; the readiness gate, design call #4, is the canon ground here).
Worktree: ~/workspace/worktrees/sim-armorbreak. Branch: sim-armorbreak.
**ZERO src/js changes, ZERO scripts/policies changes — instruments + evidence only.** New files ONLY:
scripts/armorbreak-analyze.js, scripts/armorbreak-census.js, scripts/test-armorbreak-20261017.js,
evidence/2026-10-17/sim-armorbreak.md.

## The question (sharpened from sim-vetdemand #427 input)

run fleshout-20261017T1815Z's sim-vetdemand (steve-call #427 input) found that under the veteran-demand
shape change, wave-4 deferral snapshots stay armor-bound — "armor co-binds at every observed deferral
snapshot; the census armor-fragility second lock holds." Earlier runs (sim-vetshape 1223Z,
sim-wave4reach 1405Z) observed wave-4 unlocks dying shortly after — "opened a war it couldn't staff"
(d155; d150 "in the draft it opened"). This diagnostic measures the armor side: for every wave-4
unlock in the two existing corpora (evidence/2026-10-17/perseed-wave4reach/, 32 runs; perseed-vetshape/,
32 runs), what was the roster's armor coverage at unlock (protection P per living villager, body slots
filled, how many had any armor at all), how did the run survive post-unlock, and was armor or veterans
the binding bar at each deferral.

## Pre-registration (docs/MEASUREMENT.md §14 — BINDING, written BEFORE classification)

- **Corpora (fixed, no new sims for the verdict):** the 32 wave4reach per-seed JSONs
  (evidence/2026-10-17/perseed-wave4reach/, swept at c477ba34553af65b0fa6816ec408cbb0d9aa6152,
  seeds 3091141…3761855 × {leadfeast,belongfeast} × {control,armed}, env VETREL=1+VETSHAPE=1 on armed)
  + the 32 vetshape per-seed JSONs (evidence/2026-10-17/perseed-vetshape/, swept at
  cfaab2f976590fe438e67504e6c08840095355de, seeds 2210317…2981033 × {leadfeast,belongfeast} ×
  {control,armed}, env VETSHAPE=1 on armed). Nothing in src/js or scripts/policies touched.
- **Armor bar definition (canon, design call #4):** `Game.waveCombatReadiness(4)` counts fighters
  with armor WORN at P ≥ 15 (`S.equipment.armorOf` for villagers, `Game.armorBonus()` for the scholar;
  pieces sum + coordination bonus, full-set replaces). Demand: 4 armored, 5 armed, 3 tricks,
  2 veterans (standingCfg().readyDemand — "sim starting points, not canon; Steve can overrule").
  BODY_SLOTS: head, torso, legs, hands, shoes (src/js/equipment.js).
- **PRIMARY (diagnostic GO, binding):** 100% of wave-4 unlock runs in both corpora classified by
  armor coverage at unlock + post-unlock survival outcome, ZERO unattributed runs. (10 unlock runs:
  5 wave4reach + 5 vetshape.) A miss is NO-GO (instrument incomplete), never re-scored.
- **SECONDARY (report-only):** armor-bound vs veteran-bound deferral share, where the corpora allow
  a reading: wave4reach carries a last-unready-day bindingSnapshot (day + armored/armed/tricks/
  veterans + short bars) on every run — full reading; vetshape carries only end-state readiness4 —
  end-state reading only, clearly labeled.
- **Per-villager census method:** bar-level coverage comes from the corpora themselves
  (bindingSnapshot at unlock / end-state readiness4). The per-villager detail (P per living
  villager, body slots filled, any-armor count, fullSet vs pieces) is reconstructed by REPLAYING
  each unlock run on current HEAD with the sweep's exact seed + policy composition + substrate env,
  censused at the replay's first wave-4-unlock day. Each replay is fidelity-verified against its
  corpus JSON on trajectory markers (firstW4Day, bindingBars, gameDays, days, endReason, won,
  deaths.total, deaths.starv, readiness4 counts, standingTotal). MATCHED replays → census
  attributed to the corpus run. DRIFTED replays → census labeled reconstructed-on-current-HEAD
  with the divergence noted; the run still carries its bar-level classification (zero unattributed
  regardless).
- **Post-unlock survival:** days survived after unlock = gameDays − firstW4Day (village clock,
  with the wave4reach day-clock-stall caveat from sim-wave4reach.md: vetrel hunts consume ticks and
  Game.sleep() refuses, so gameDays lags harness days on the armed arm); endReason; death-cause
  class of the run (byCause aggregate + pre/post-unlock death split from replay death samples).
- **Wall numbers:** reported from the corpora (national / table / wave-4 unlocks / median survival).

## Method

1. `scripts/armorbreak-analyze.js` — read-only classifier, no game load: loads all 64 per-seed JSONs,
   emits the unlock census table (10 rows), the deferral census (wave4reach 32 runs from
   bindingSnapshot; vetshape 32 runs from end-state readiness4), and the wall numbers.
2. `scripts/armorbreak-census.js` — replay instrument: for each unlock run, replays the sweep's
   runOne logic exactly (same policies, same env, same harness calls), adds a per-villager armor
   census at the first unlock day + a pre/post-unlock death split, and verifies trajectory markers
   against the corpus JSON.
3. `scripts/test-armorbreak-20261017.js` — proof: attribution completeness (10/10 unlock runs
   classified, 0 unattributed) on the real corpora; census self-determinism (same run replayed
   twice → byte-identical census); armorOf accounting unit checks on fixture villagers.

## Results

**PRIMARY: DIAGNOSTIC-GO — 10/10 wave-4 unlock runs classified by armor coverage at unlock +
post-unlock survival outcome, ZERO unattributed runs.** Per-villager census via fidelity-verified
replay (all 10 MATCHED on every trajectory marker vs the corpus JSONs; census demandMet ===
the engine's own `waveCombatReadiness(4).armored` at the census moment on all 10). Proof test
scripts/test-armorbreak-20261017.js: 21/21 GREEN (attribution completeness, armorOf accounting,
census self-determinism + fidelity).

### Armor coverage at unlock (per-villager census, demand 4 fighters @ P≥15, 5 body slots)

| run | w4 | living | anyArmor | met | sumP | armored roster at unlock |
|---|---|---|---|---|---|---|
| wave4reach/armed-leadfeast-s3211345 | 60 | 11 | 11 | 5 | 242 | Vlada(P46), Aroha(P50), Jorge(P47), Oliver(P33), Priya(P15) |
| wave4reach/armed-belongfeast-s3211345 | 81 | 8 | 8 | 7 | 207 | (scholar) Oliver(P33), Priya(P15), Omar(P44), Nikos(P32), Ruby(P25), Brian(P28), Sigrun(P22) |
| wave4reach/armed-belongfeast-s3101243 | 88 | 10 | 10 | 4 | 222 | (scholar) Darius(P66), Lina(P27), Jesse(P50), Rosa(P39) |
| wave4reach/armed-belongfeast-s3761855 | 106 | 9 | 9 | 7 | 255 | Caitlin(P40), (scholar) Yen(P26), Valeria(P30), Yara(P37), Nadia(P50), Emma(P31), Xavier(P34) |
| wave4reach/control-belongfeast-s3651753 | 111 | 8 | 8 | 5 | 197 | Giulia(P37), Chloe(P42), Thabo(P22), Yara(P41), Sigrun(P22) |
| vetshape/armed-leadfeast-s2430521 | 139 | 10 | 10 | 5 | 186 | Yuki(P26), Jovan(P35), Petra(P21), Wanjiru(P45), Sigrun(P26) |
| vetshape/armed-belongfeast-s2430521 | 139 | 9 | 9 | 4 | 165 | Yuki(P26), (scholar) Jovan(P35), Petra(P21), Wanjiru(P45) |
| vetshape/armed-belongfeast-s2760829 | 89 | 8 | 8 | 4 | 118 | (scholar) Olivia(P30), Caleb(P27), Nino(P17), Ethan(P17) |
| vetshape/armed-belongfeast-s2981033 | 146 | 9 | 9 | 4 | 133 | (scholar) Patrick(P25), Giulia(P42), Aroha(P17), Theo(P17) |
| vetshape/control-leadfeast-s2430521 | 139 | 10 | 10 | 5 | 186 | Yuki(P26), Jovan(P35), Petra(P21), Wanjiru(P45), Sigrun(P26) |

What the armor IS (sense read): a junk-patchwork. Every living villager on all 10 runs wears
something (anyArmor == living everywhere — flannel_shirt, rain_poncho, work_gloves, good_boots,
bark_armor; head slots carry keepsakes: dead_phone, paperback, mixtape, dog_tags), and the bar
clears on a thin margin of trophy pieces: alien_carapace, bloodplate, stormcloak, alien_greaves,
second_skin_suit, riot_gear, worldroot_plate. Marginal qualifiers at exactly P=15 (Priya) and
P=17 (Nino, Ethan, Aroha, Theo) are common — the bar clears on a knife's edge: losing ONE
marginal piece re-shorts it. No run had armor depth; every run had armor breadth.

### Post-unlock survival — the war collects the armored

| run | post gameDays | end | post deaths | combat post | met@unlock died post |
|---|---|---|---|---|---|
| wave4reach/armed-leadfeast-s3211345 | 35 | survived | 3 | 3 | 0/5 |
| wave4reach/armed-belongfeast-s3211345 | 79 | survived | 26 | 25 | **7/7** |
| wave4reach/armed-belongfeast-s3101243 | 17 | village-lost | 13 | 4 | **4/4** (all d105: Darius combat; Lina/Jesse/Rosa "the phoenix link") |
| wave4reach/armed-belongfeast-s3761855 | 37 | survived | 18 | 15 | **7/7** |
| wave4reach/control-belongfeast-s3651753 | 47 | survived | 17 | 17 | 3/5 |
| vetshape/armed-leadfeast-s2430521 | 43 | survived | 25 | 24 | **5/5** |
| vetshape/armed-belongfeast-s2430521 | 43 | survived | 12 | 11 | 2/4 ((scholar) Jovan d139 — the unlock day itself) |
| vetshape/armed-belongfeast-s2760829 | 67 | village-lost | 22 | 22 | **4/4** ((scholar) Olivia d99, 10 days after unlock) |
| vetshape/armed-belongfeast-s2981033 | 36 | survived | 10 | 8 | 2/4 (Theo d147 to The Congregation — a wave-4 monster) |
| vetshape/control-leadfeast-s2430521 | 43 | survived | 25 | 24 | **5/5** |

**34 of 47 demand-meeting villagers died post-unlock (72%), almost all in combat** — the Mirror
Draft kills exactly the armored vanguard the gate selected for. 5 of 10 runs lost EVERY armored
villager; 2 more lost half or more. The only run that kept its armor (s3211345 leadfeast armed:
0/5 died, end-state 5/4) is the only one that held the bar to end. The armored scholar is
especially exposed: Oliver d90, Darius d105, Yen d116, Jovan d139, Olivia d99, Patrick d178 —
6 of 7 armored scholars died post-unlock (respawn = their gear leaves with them). The armor bar
is met TRANSIENTLY at unlock and then the draft bleeds it: end-state armored 0/4, 1/4, 1/4,
2/4 on the wave4reach unlocks (only 5/4 held), 0–2/4 on the vetshape unlocks.

### SECONDARY — deferral binding shares

- wave4reach, last-unready-day bindingSnapshot, 32/32: **armor+veterans co-bound 21,
  veterans-bound 10, armor-bound 1.** Control: 13/16 co-bound, 3/16 veterans-bound. Armed
  (VETREL+VETSHAPE): 8/16 co-bound, 7/16 veterans-bound, 1/16 armor-bound — the veteran-side
  instruments moved the veteran bar and exposed armor as the remaining lock.
- vetshape, END-STATE readiness4 only (corpus carries no deferral snapshots — labeled, not
  binding-at-deferral): armor-bound 9, armor+veterans 21, veterans-bound 2. Consistent with the
  co-bind picture at end of run.
- Armor binds at the BOTTOM of the margin: at unlock every wave4reach snapshot had armor met
  (4–7/4) with veterans the sole short bar (5/5 unlocks, per sim-wave4reach.md) — the gate opens
  on veterans while armor sits at exactly-demand; any post-unlock casualty re-shorts armor first.

### Wall numbers (from the corpora)

| corpus | arm | national | table | w4 unlocks | median survival | village-lost |
|---|---|---|---|---|---|---|
| wave4reach | control | 11/16 | 0/16 | 1/16 | 158 gameDays* | 11/16 |
| wave4reach | armed | 10/16 | 0/16 | 4/16 | 110 gameDays* | 3/16 |
| vetshape | control | n/a (not recorded) | 0/16 | 1/16 | 182d | 6/16 |
| vetshape | armed | n/a (not recorded) | 0/16 | 4/16 | 182d | 7/16 |

\* wave4reach gameDays is the village clock; the vetrel day-clock stall (stall 20–85d on armed
runs, sim-wave4reach.md §metric-review) means harness-day survival is longer. vetshape runs
show no stall (days≈gameDays).

### Sense-testing (SENSE-TESTING LAW)

The census reads sensically, not just countably: named villagers wearing legible gear
((scholar) Darius's worldroot_plate + tasting_spoon, Jesse's second_skin_suit, Nino's
stormcloak + bus_map), dying to named causes on named days after the door they opened.
The fiction consequence is coherent and legible to a player: the hold beats say "armor the
village (0 of 4 fighters armored)" — the village armors its fighters in whatever it has —
the draft opens on the veterans bar — and the Mirror Draft then kills the armored first.
The gate selects the vanguard; the war collects it. Whether wave 4 SHOULD collect the
armored vanguard ("opened a war it couldn't staff" as intended cost) or whether the armor
demand should measure something more durable than worn junk-patchwork is the design question
this census sharpens for Steve's #427 call.

### Sharpened input for steve-call #427 (from the armor side)

1. **The armor bar is mortality-selected.** 72% of demand-meeting villagers died in the draft
   they unlocked; the bar is not a stock the village keeps, it is a snapshot the village bleeds.
   Any veteran-demand loosening that opens the gate earlier opens it onto this same bleed —
   sim-vetdemand's "0/4 gate releases, armor co-binds" is the same lock seen from the veteran side.
2. **The armor the bar measures is junk-depth, not kit-depth.** Breadth is universal (everyone
   wears something); depth is 1–3 trophy pieces + marginal P=15/17 qualifiers. The demand is met
   at exactly-demand on patchwork, never with a reserve. A "butchering armor L1" (design call
   landed) or an armory/stockpile measure would change what the bar selects for.
3. **The armored scholar is the single point of failure on 4 runs.** The scholar's gear leaves
   with the respawn. If armor depth matters, scholar-guard or gear-inheritance is the lever.
4. **VETSHAPE + vetrel moved the veteran side (armed deferrals: 7/16 veterans-bound vs 3/16 on
   control) and left armor exposed** — the composition works as designed; the remaining wall is
   the armor side measured here.

## Metric review (§14 — binding, never re-scored)

1. **Replays run on current HEAD (a7848c4c), not the sweep commits (c477ba34, cfaab2f9).**
   Fidelity verification was the guard: all 10 replays MATCHED every trajectory marker in the
   corpus JSONs (firstW4Day where recorded, bindingBars, gameDays, days, endReason, won,
   deaths.total/starv, readiness4 counts, standingTotal) — so the census state at unlock IS the
   sweep's state, and the census demandMet equals the engine's own bar at the census moment
   (10/10). The vetshape corpus records no firstW4Day; the replay supplies it
   (139/139/89/146/139) under the same MATCHED fidelity.
2. **Post-unlock survival is in gameDays (village clock).** On wave4reach armed runs the
   day-clock stall (20–85d, sim-wave4reach.md) means harness-day post-unlock survival is longer;
   reported both where they differ. The verdict (armor bleed) does not depend on the clock —
   it is named villagers dying on named days.
3. **who-matching is substring-based** (vid, name, or substring either way). Spot-checked:
   matched counts are exact and consistent with post totals (e.g., s3211345 leadfeast armed
   matched 0/5 — a clean negative control; s3101243 matched 4/4 all on d105 with the
   village-lost endReason). No false-positive inflation observed.
4. **Armor "breadth vs depth" is a census read, not a new metric.** The pre-reg's "how many
   have any armor at all" is answered literally (anyArmor == living on all 10 runs); the
   depth read (marginal P=15/17 qualifiers, trophy-piece dependence) is reported under Results,
   not scored.

## Convergence

**converging.** The diagnostic is complete and proven (21/21 proof GREEN, 10/10 fidelity
MATCHED, 0 unattributed). It sharpens the steve-call #427 input from the armor side: the
veteran-demand change opens the gate, but the armor bar is a mortality-selected lock — the
gate opens on junk-patchwork armor that wave 4 then kills off (34/47 armored villagers died
post-unlock across 10 runs). The axis stays scale-onramp; the next step is Steve's ruling on
#427 (veteran demand shape + whether the armor demand should measure something more durable),
not another lever. No game change: zero src/js changes, zero scripts/policies changes —
instruments + evidence only.

## Files

- scripts/armorbreak-analyze.js — read-only corpus classifier (this run)
- scripts/armorbreak-census.js — replay + per-villager armor census instrument (this run)
- scripts/test-armorbreak-20261017.js — proof (this run)
- evidence/2026-10-17/sim-armorbreak.md — this file
