# sim-villagergear — "the village armed, not the scholar" (flesh-out loop, 2026-10-20, ARM sim-villagergear)

Run: fleshout-20261020T1015Z, arm sim-villagergear. Axis: scale-onramp (the blocking axis).
POLICY-SIDE LEVER — zero src/js changes. New file scripts/policies/villagergear.js (default OFF, VGEAR=1).

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave-4 roster + bands, the readiness gate, VILLAGER XP LAW — villager kills score the ledger exactly like the player's).

## The bind (read from evidence, not invented)

- The scholar-gear lane is CONCEPT-CAPPED (backlog #651, evidence/2026-10-19/sim-gearday2.md): arming the scholar cut scholar combat deaths −19.6% but RAISED villager combat deaths +29% and cut median survival 122.5d→93.5d. The axis needs the VILLAGE armed, not the scholar.
- The wave-5 door's 2-living-veterans bar never fills because wave-4 kills are 10/10 via=player (E2/E3, evidence/2026-10-20/sim-w5door-measure.md) — villagers never land the killing blow. The veterans bar counts DISTINCT LIVING killer vids with wave-4+ kills in state.waveKillLog (standing.js waveCombatReadiness); the only villager who kills wave-4 is the scholar, and the scholar dies within 30d of the kill 9/10.
- The TB killing-blow channel EXISTS and is engine-honest: a companion landing the final hit in the scholar's TB fight logs by=<companion vid>, via='companion' (TRICKTAG, game.js:42126; sim-killbeat's fiction beat landed 2026-10-19). Baseline on the census corpus: 0/13 wave-4 kills via=villager.
- Policy-layering lesson (backlog #656): NEVER re-equip what the base policy (competent.js gearUp) already owns. gearUp equips the SCHOLAR only (state.scholar.equipped/inventory, 3x/day) — villagers are untouched. This layer never calls Game.equip/unequip on the scholar, never donates the scholar's best, never touches scholar inventory beyond spare-weapon donation.

## Lineage (the 9th–11th production attempts, honored)

- sim-vetarm (9th, KILLED): armory donations + patrol exposure. The patrol beat killed 19 able villagers ('patrol combat' death mode) and cannibalized presence. → This layer NEVER calls Game.assignTask, never moves fighters.
- sim-armory (10th, KILLED): armory-only. Donations moved the ARMED readiness bar (6→17 armed companions, median wbonus 0→8, guardrails green) but not wave-3 damage-share (0.90x) — arming improves the QUALITY of companion participation, not its FREQUENCY; frequency dominates. The named next (#623): presence-routing without movement via the "joins you" trigger conditions.
- sim-vetrel (LANDED, default-OFF, 18-0 at confirm): combat-ranked party invites, scholar-softens/companion-finishes yield, companion-survival breakoffs — proven on the wave-3 veteran channel. This layer reuses the protocol SHAPE re-scoped to wave-4. VETREL stays env-inert here (its deliberate hunts consume the day clock — finding #490 — and its bar is wave-3).
- Armor: NO HONEST POLICY-SIDE CHANNEL (sim-findings #608, steve-call). No communal armor pile (storage.js: "armor/misc have no deposit hook"), no gift verb, individual ownership is Steve's law. The layer does not touch armor — the engine's villagerGearDay already equips villagers from their OWN stashes. Documented, not re-litigated.

## The lever (scripts/policies/villagergear.js, VGEAR=1, composed OUTSIDE the w5path stack)

Three beats, all engine-honest:

1. **ARMORY DRIVE** (daily, at Haven): worst-spare WEAPON → Game.donateWeapon (strictly worse than the scholar's equipped best — the layer never touches what gearUp owns; never the only edge; keepsakes/bonded never donated; knap fallback stone+vine with vinebank defersCraft deference). The engine's daily villagerGearDay distributes armory weapons to the biggest gains (deposit is consent). Target: armory ≥ 3 units.
2. **FIGHTER STAGING** (daily, at Haven, wave-4+ unlocked, w5 veterans bar unmet): combat-ranked invites through the real inviteToParty verb (trust floor 20, engine acceptance draw — personality/goals decide). Non-veterans first (a wave-4+ killer's next kill doesn't advance the bar), strongest first (weaponBonus×3 + armor×2 + hp — vetrel's proven formula). Max 2 companions (party cap 3 — the village keeps defenders). No dismissals (negative gossip). Party members travel with the scholar (placePartyAtPlayer) → within the TB join radius (nearest 4 within 4 squares, startCombat) → presence in wave-4 fights via the engine's own "joins you" trigger. Consent-based staging, never assignTask.
3. **WAVE-4 YIELD + SURVIVAL** (fight wrapper, player turns): in a TB fight with a live wave-4 monster and an engaged party companion — a NON-veteran scholar fights normally (they need their own kill; they're the reliable finisher); a VETERAN scholar HOLDS (the honest tbPlayerWait turn-forfeit) when the weakest live wave-4 monster is ≤20% maxHp, scholar hp ≥ 50%, round ≥ 2, ≤6 yield turns/fight, and the monster took damage in the trailing 2 yield turns (a companion who can't close doesn't get watched forever). Any engaged companion <40% HP ends the commitment: scholar resumes striking if the monster is near death (fastest end = fastest the companion stops taking damage), otherwise breaks off honestly via tbBarrierExit.

Deliberate non-goals: scholar re-equipping (#656); armor transfers (#608 steve-call); patrols/task assignment (vetarm autopsy); deliberate wave-4 hunts (finding #490 — wave-4 arrives via unlocks/raids, and B6: facing is reliable).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the sweep)

**PRIMARY:** seeds with ≥1 wave-4 kill via=villager — waveKillLog entries with w==4, by ≠ scholar vid, via ∈ {companion, patrol, wild, aid-crisis, contest, agency, sortie} (the "villager landed the killing blow" set; baseline corpus 0/13).
**GO threshold:** ≥ 2/8 seeds on the armed arm. A miss is NO-GO, never re-scored mid-run (§14).
**Unit note:** seed is the randomization unit (policies leadfeast/belongfeast are the two competent variants); a seed counts if EITHER config shows a villager wave-4 kill. Per-run counts also reported.

**Horizon:** 180d death-aware (dead villages stop simulating, +10d tail max via the harness). Set from the baseline survival distribution (w5doormeasure on this substrate: median 181.5d game-days) — 180d covers the door window where wave-4 kills happen.

**Seeds:** pilot 8 seeds (64001–64008 — verified filename-unused in evidence/ before the sweep) × {leadfeast, belongfeast} × {control, vgear} = 32 runs. Confirm (only on pilot GO): 8 more seeds (16 total).

**Policies:** the exact w5doormeasure stack — withSeatDrive(withWinDefer(withVetrel(withReposition(TF leadfeast/belongfeast)))).

**Substrate env:** FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 NODEWITNESS=1 KILLDISC=1 SEATDRIVE=0 (VETREL/REPOSITION unset → inert; SEATDRIVE=0 → pure delegation). The sweep FAILS LOUD unless the env matches exactly.

**Arm env:** VGEAR=1 (armed) vs unset (control — gate-off is pure delegation, DET-pinned byte-identical to the wrapped stack).

**SECONDARY (report, don't judge):** runs with the 2-living-veterans w5 readiness bar EVER met (w5vetsMax ≥ 2 via the daily census) — armed ≥ 2/16; end-of-run w5vetsEnd; armed/armored villager census (wb≥12, P≥10, P≥15); wave-4 companion damage-share (KILLDISC); wall numbers (national/table/wins, wave reach, median/max survival, death-cause shares).

**GUARDRAILS (all must hold):**
- villager combat deaths ≤ control × 1.2 (the #651 shift, made binding — the scholar-gear arm raised these +29%);
- median survival ≥ control − 10d;
- starvation deaths ≤ control;
- no new death mode (≥2-event rule);
- wave-4 unlocks within ±2/16 of control.

**§15:** before/after comparison through the balanced panel (scripts/balance-panel.js) — the panel is the instrument, the GO threshold is the judge. Compare .md attached.

**KILL PROTOCOL:** if killed at pilot, the layer is deleted zero-trace; instruments + evidence + proof land with the KILLED-VERDICT. Killed arms leave no trace in game code.

**SENSE-TESTING:** re-run the armed seed with the first villager wave-4 kill (or the first wave-4 kill window) with Game.say/sysSay restored; read the whole window; judge whether armed villagers behave like people fighting a herald or stat-bags. Sample SAY lines in evidence.

## Proof

scripts/test-villagergear-20261020.js — RED→GREEN on the layer (RED phase: layer absent → exit 1; fixture waveKillLog-on-state bug fixed mid-proof):
- A1 gate honesty; A2 worst-spare donation; A3 unarmed scholar keeps the only edge; A4 armory≥3 no-op + one push/day; A5 keepsake/bonded skipped; A6 knap fallback; A7 vinebank deferral; A8 scholar equip/unequip never called;
- B1 strongest non-veteran invited first (veteran deprioritized, trust<20 skipped); B2 staging gates (pre-wave-4, bar-met stand-down, 2-in-party cap, one pass/day); B3 no dismissals/assignTask;
- C1 veteran scholar yields at ≤20% monster HP; C1b yield bounded (≤6) + stalls end it; C2 hurt companion ends yield (scholar strikes); C2b break-off when monster healthy; C3 non-veteran scholar fights normally; C4 gate-off fight pure delegation;
- D1 det-gate (real harness): gate-off vgearLead/vgearBelong byte-identical to leadfeast/belongfeast (2 seeds × 60d); gate-on deterministic;
- D2 real-sweep gate: 180d armed runs complete per policy, deterministic re-run.

*(results below — filled after the sweep; the pre-registration above is unchanged)*

## Results

*(pending sweep)*

## Metric review (§14 — binding, never re-scored)

*(pending)*

## Named nexts

*(pending)*

## Village assessment

*(pending sense-testing)*

## Convergence

*(pending)*
