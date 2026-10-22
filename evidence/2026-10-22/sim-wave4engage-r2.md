# sim-wave4engage-r2 — deliberate wave-4 engagement POLICY pilot (axis scale-onramp, backlog #747)

Run fleshout-20261022T0555Z, worker sim-wave4engage-r2. ADOPTED orphan arm from the dead
2215Z run (worker dead 7.4h, no writes 3h). The orphan's scripts were untracked reference
material; I reviewed and re-derived them on current master (f83b5d92c). The orphan's 31
CONTROL JSONs (evidence/2026-10-21/perseed-wave4engage/ in the orphan tree only, stale base
596cb0c2c, seeds 65401–65408) are STALE-BASE — discarded as corpus; everything re-run here
on current master with fresh seeds.

The question (named next of killed-at-pilot sim-twovets-r2): twovets proved villagers won't
finish wave-4 kills on their own — 1 villager wave-4 kill in 16 armed runs. The wall is
OPPORTUNITY, not discipline. This arm is the hunt-side lever: a deliberate wave-4
engagement policy (morning patrol toward dangerous tiles with staged companions +
no-scholar-finish discipline) to MANUFACTURE the opportunity — engaged companions get the
closing turn, filling the wave-5 door's 2-living-veterans readiness bar.

Canon read first: docs/CANON.md + docs/MONSTER-WAVES.md. Wave 4 = The Mirror Draft
(standing>=100, combat-readiness gated: armored 3/P10, armed 5, tricks 3, veterans 1
killed wave-3+); wave 5 = The Producers (standing>=200 AND wave-4 faced). VILLAGER XP LAW:
villager kills score the ledger exactly like the player's.

## Seed verification (recorded per brief)

- Orphan consumed: 65401–65408 (its 31 stale-base control JSONs, orphan tree only, never committed).
- Sibling sim-windowfight-r2 claims: 65441–65448 (claim file).
- Verified UNUSED across evidence/ on master: 65451–65458 (0 files, filename check).
- This pilot uses 65451–65458. Test determinism gates use 65411–65418 (in-memory only, no corpus writes).

## PRE-REGISTRATION (§14 binding — written BEFORE any sweep)

Adopted from the orphan's own gates (analyze-wave4engage-20261021.js + test E3e). Choice
recorded: I use the ORPHAN's pre-reg rather than the parent's suggested bar — the orphan's
(a)/(b) pair was designed together and matches twovets-r2's precedent (>=2/8). The parent's
suggested ">=3 armed seeds with via=companion" variant is stricter on seed count but weaker
on engagement events; orphan's bar is the honest reconstruction.

- Design: 8 fresh seeds × {leadfeast, belongfeast} × {control, wave4engage} = 32 paired
  configs, 180d death-aware (dead villages stop +10d tail), on the pinned winning substrate
  (FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1;
  SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/VGEARBEATS/TWOVETS unset;
  WAVE4ENGAGE=1 for the armed side only).
- control = VCE.armedFor(base) (VGEAR=1 stack, WAVE4ENGAGE unset)
- wave4engage = WE4.armedFor(base) (WAVE4ENGAGE=1 OUTSIDE the same stack, VGEAR=1)
- PRIMARY (a): villager wave-4 engagement events (killdisc v2 startCombat census: wave==4,
  started, partySize>=1) summed over the 16 configs: armed >= 1.5x control. Floor: if
  control total is 0, armed >= 3 counts as GO on (a).
- PRIMARY (b): armed seeds with >=1 villager-attributed wave-4 kill (waveKillLog w=4,
  by != bearer-on-the-kill's-day, by != 'player' — sim-killtime MANDATORY) >= 2/8.
  A seed counts if EITHER policy config reaches it.
- GO = both (a) and (b). A miss is NO-GO, never re-scored mid-run (§14).
- GUARDRAILS: villager combat deaths <= control x1.2; median survival (non-winning,
  per-seed matched) >= control-10d; starvation deaths <= control+2; no new death mode
  (>=2-event rule).
- Instruments: killdisc-instrument-20261021.js (KILLDISC=1 v2: read-only per-source tbDamage
  attribution on wave-3+ monsters + daily readiness census + startCombat engagement census)
  + daily w5-readiness sample + we4 layer counters + bearer census (kill-time attribution).
  Before/after through the balanced panel (scripts/balance-panel.js) per §15 — the panel is
  the instrument, this header is the judge. If the panel can't express the treatment (env-
  gated policy; precedent sim-pitjoin-b 'invalid'), the orphan's analyze is the fallback and
  the structural reason is recorded.

## Proof gates (run BEFORE the pilot — scripts/test-wave4engage-20261022.js)

E0 shape; E1 det-gate (WAVE4ENGAGE unset → armedFor byte-identical to VCE.armedFor, 60d ×2
bases); E1c (+VGEAR unset → byte-identical to seat stack); E2 env-gate; E3 synthetic
RED→GREEN fixtures on wave4FightTurn (yield band never struck, soften above half, chaff in
the middle band, stand-down with no companion, non-w4 fights delegated); E3e engagement
fires we4 counters with 0 scholar wave-4 kills; E3f off = zero counters; E4 armed+KILLDISC
deterministic; D2 180d armed runs complete per policy + deterministic re-run.

(Result appended after the gates go green — gates must be ALL GREEN before the sweep.)

## Proof gates — GREEN 2026-10-22 ~06:22Z (22/22 PASS, 0 fail)

Run on current master f83b5d92c with the pinned substrate env. E0 shape, E1a/E1b
det-gates (WE4-off armed == VCE.armedFor, byte-identical, 60d ×2 bases), E1c
(WE4-off+VGEAR-unset == seat stack), E2 env-gate, E3a–E3g synthetic fixtures
(yield band held not struck; soften band struck above half; chaff in the middle
band; no-companion stand-down; non-w4 fights delegated; RED fixture proves the
leak the layer closes), E3e(i–iii) engagement on s65414-leadfeast 150d (we4
counters fire, scholar wave-4 kills = 0), E3f off = zero counters, E4
determinism, D2a/D2b 180d armed runs complete per policy + deterministic re-run.

## Pilot sweep

Launched 2026-10-22 ~06:23Z: ARM=control and ARM=wave4engage, 8 seeds × 2 bases
= 32 paired configs, 180d death-aware, KILLDISC=1 v2 + w5census + we4 counters
+ kill-time bearer census. Per-seed JSONs → evidence/2026-10-22/perseed-wave4engage-r2/.

INFRA (06:38Z): the runtime service restarted and killed BOTH sweep processes
mid-run (6/32 JSONs complete: control s65451 both bases + s65452 leadfeast;
armed s65451 both bases + s65452 leadfeast — all parse clean, anchor
f83b5d92cc, 0 instrument errors). Resumed 06:40Z on the missing configs only
(POLICIES-filtered chunks, same seeds, same env — determinism E4/D2-pinned, so
missing-config replay is bit-safe); completed configs untouched.

(pending — analyzer output + verdict appended after the sweep completes)

## Pilot results (32/32 configs complete, 2026-10-22 ~07:30Z)

Analyzer: scripts/analyze-wave4engage-20261022.js (the pre-registered judge).
Balanced panel: scripts/build-wave4engage-panels-20261022.js → evidence/2026-10-22/wave4engage-r2-panel-primary.{md,json} (valid compare; decision=review_required, no material signals — panel is the instrument for the standard contract metrics, this header is the judge for the primary).

PRIMARY (a) villager wave-4 engagement events (16 configs/arm): control=43, armed=36, ratio 0.84 → NO-GO (bar 1.5×)
PRIMARY (b) seeds with ≥1 villager-attributed wave-4 kill (kill-time, killdisc v2): armed=0/8, control=3/8 → NO-GO (bar ≥2/8 armed)
VERDICT: NO-GO (§14 — not re-scored).

Per-seed (b) line: control villager kills on s65454-lead (1v), s65455-lead (1v), s65457-belo (1v); armed 0 villager kills and 0 scholar kills on ALL 16 configs — the no-scholar-finish discipline held perfectly (0/16 scholar wave-4 kills), and manufactured zero closers.

Guardrails (all PASS): villagerCombatDeaths control=310 armed=332 (bar ≤372); starvationDeaths 10→12 (bar ≤12); median survival diff (non-winning matched, n=3) = 0 (bar ≥-10); no new death mode. we4 mechanism counters (armed): 174 patrol days, 174 patrol hops, 36 wave-4 fights, 119 soft strikes, 10 yields, 20 band-holds, 12 stand-downs, 52 breakoffs, 46 holds — the layer fired every beat; the kills didn't come.
Panel standard metrics: won +0.25 change_watch (CI [-0.25,0.625]), national -0.125 regression_watch, npcHungry +0.125 regression_watch — all CIs cross zero; no material signal. Consistent with guardrails PASS.

## Root cause (Steve's KILL DISCIPLINE: root-cause the lever, don't just miss the bar)

Probe scripts/probe-wave4engage-damage-20261022.js re-ran armed s65454-belong (7 wave-4 engagements) dumping per-fight damage tables:

| fight | monster (HP pool) | scholar dmg | companion dmg | outcome |
|---|---|---|---|---|
| d60 | algorithm (1000–1200) | 336 | 217 (Aroha 50, Aria 167) | survives ~50% |
| d69 | audit (1100–1300) | 481 | 249 | survives ~40% |
| d71 | congregation (900–1100) | 380 | 611 | right at the kill line — no kill |
| d73 | suburb (1300–1500) | 136 | 28 | trivial scratch |
| d82 | eulogy (900–1100) | 0 (holding) | 89 | trivial |
| d85 | reunion (1200–1400) | 0 (holding) | 75 | trivial |

Aggregate over 6 tabulated fights: scholar 1333, companion 1269 — companions land REAL damage (roughly matching the scholar). The mechanism's conjunction WORKS; the conjunction isn't enough. Wave-4 HP pools (850–1500) outscale the party's combined fight output; and the no-scholar-finish discipline removes the one reliable finisher — so kills drop to zero. The d82/d85 fights are the theory's obituary: scholar holds the whole fight, companions scratch 75–89 against a ~1000-HP pool.

The honest finding: the wall is now measured at one level deeper. Twovets said OPPORTUNITY not discipline. This arm manufactured opportunity (36 wave-4 fights, real companion damage) and the answer is CAPABILITY: villagers can't close wave-4 HP pools. The readiness bar's veterans slot needs villager kill OUTPUT, not just villager presence. A future arm must raise companion damage (VGEAR armory drive — weapons in hands, the vgearconfirm stacking) or split the kill (scholar softens INTO the yield band, companions close — the exact division this discipline forbade).

## Wall numbers

control (16 configs): national 9, table 13, won 10, wave4 10/16, wave5 0/16, w5vets2 0/16, median 90d, max 129d
armed (16 configs): national 8, table 13, won 12, wave4 10/16, wave5 0/16, w5vets2 0/16, median 90d, max 164d
The wave-5 door stays shut (0/32 unlocks this corpus); wave-4 door reliable (20/32). Villages win through the table WITHOUT ever filling the veterans bar — the door is a lagging indicator, consistent with windowreach-r2's finding.

## Village assessment (plain words)

The villages on the pinned substrate keep doing what they do: they win (10/16 control, 12/16 armed) by bread and bonds, not blood. Nobody engages the mirror draft and lives through it to tell the readiness bar. The armed villages patrolled deliberately toward danger 174 mornings — they walked into the thicket and the ruin, fought the Algorithm and the Congregation and the Eulogy with staged companions at their shoulders, and held their strikes so their people could have the kill. Their people landed real blows (Aria Thompson and Aroha Ngata trading hundreds of damage with monsters a head taller than the fight). But a wave-4 monster has ~1000 HP and a villager's spear does tens. The discipline held; the monsters walked away. On control, the same villages got 7 wave-4 kills because the scholar was allowed to finish. The policy made the village braver and its kill count zero.

## Sense test (SENSE-TESTING LAW)

Read the layer's actions against the engine: every beat goes through real engine verbs — travelTo hops (narrated travel), tbPlayerStrike (narrated strikes), tbPlayerWait (narrated holds), tbBarrierExit breakoff attempts. No silent teleports, no fabricated narration, no invented dialogue. The patrol reads as deliberate choice at the policy level (only fires when wave-4 unlocked, party staged, scholar ≥65% hp — a battered scholar doesn't go looking for mirrors). Gap (documented, not filled — filling it is a game-code change): the patrol has no in-fiction announcement; villagers don't say "we're hunting mirrors this morning" — intent is visible only as movement. The yield hold is honest (a wait can never kill) but silent in the combat log. SENSE-PASS on honesty; the intent-voicing is a blank for a future UI arm.

## Metric review (§14)

The pre-registered metric proved right and binding: both primaries missed cleanly, no re-scoring temptation (the armed=0 result is unambiguous). The (a) engagement-event line behaved honestly — armed 0.84× control, likely noise over 16 configs, recorded as measured. No metric revision proposed for the next arm; the next arm's metric must measure companion damage-per-fight vs wave-4 HP pools (capability), not opportunity.

## Blanks filled / documented

- FILLED: none (killed arm — the lever is dead).
- DOCUMENTED: (1) the veterans-bar wall is capability, not opportunity — measured companion damage vs wave-4 HP pools above; (2) intent-voicing for deliberate villager patrols is a blank (game-code, UI arm); (3) findings appended to hidden_files/sim-findings.md.

KILL PROTOCOL EXECUTED 2026-10-22: scripts/policies/wave4engage.js deleted zero-trace; coupled proof/probe scripts deleted; zero src/js changes (verified); sweep+analyze+panel instruments and the 32-JSON corpus retained as the measurement record.
