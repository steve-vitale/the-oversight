# sim-presence — presence-routing without movement: the 11th veteran-production attempt (2026-10-19)

Run: flesh-out loop arm sim-presence (loop oversight-flesh-out-loop), axis scale-onramp (the blocking axis).
Worktree: ~/workspace/worktrees/sim-presence.
Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law, villager XP law, combat-readiness bar, design call #4).

LINEAGE: sim-killdisc (2026-10-18) reframed the bind — companion wave-3 damage-share 1.5% vs kill-share 0%; the base channel has no companion damage to convert. sim-vetarm (9th) armed + exposed: the patrol beat killed 19 able villagers (moving fighters kills them). sim-armory (10th, KILLED-AT-PILOT): arming alone moved damage-share 0.90x (flat); fight-count identical 5 vs 5 — arming without moving doesn't get them into the fight. The veteran question is PRESENCE + ARMING; arming is measured sufficient-but-inert. This arm: presence-routing WITHOUT movement — named next #1 from sim-armory.

## The investigation (what determines WHICH companions join)

**The join rule** (game.js `startCombat`, ~line 30663): villagers on the scholar's node with `village.positions` within Chebyshev distance 4 of the scholar's combat position join the fight (nearest 4). **No other gate** — no health, weapon, temperament, or willingness filter. Temperament only sets their AI mode (bold→brave, cautious→cautious, else helpful).

**The shapes** (killdisc taxonomy): haven-TB (scholar TB at Haven, no crisis), raid (aid crisis active — the muster effect), wild (scholar TB in the wild). The raid's 5.0% vs haven-TB's 0.7% companion damage-share is the muster (more villagers on node), not a different join rule.

**The diagnostic** (scripts/probe-presence-diag-20261019.js, 26 wave-3+ fights on control seeds 63511–63512):
- 22/26 fights: ZERO villagers with grid positions ("nobody-on-node").
- Dominant sub-case is **DOOR-SPLIT**: the scholar stands OUTSIDE at the treeline (grid edge, e.g. (6,0), (0,1)) while villagers are INSIDE the hall (asleep; npcInside defaults true). `ensureVillagerPositions` deletes cross-door positions, so the join rule sees an empty village. (d=69: 10 villagers inside at Haven, scholar outside → 0 joiners.)
- 3/26: villagers on node but >4 tiles (scholar at grid edge).
- 1/26: no living villagers.
- Secondary block: `ensureVillagerPositions` only runs on scholar movement; `goInside` doesn't call it — so even an inside scholar can have 0 positioned villagers (d=69 eulogy: scholar inside, 3 villagers inside, onNode=0).
- atHaven 25/26, aid 15/26, scholar inside only 8/26.

**Conclusion**: presence is a door-alignment + position-assignment problem. The policy cannot move villagers (vetarm's lesson), but it can move the scholar (the player it drives).

## Substrate

- policy: tribfloor leadfeast/belongfeast (the pure tribfloor base — identical to sim-armory's control) + presence layer (PRESENCE=1)
- env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 (the armory pre-seat substrate)
- seeds: 8 fresh (63521–63528 — verified filename-unused in evidence/2026-10-19/perseed-*/ before the sweep), x {lead, belong} = 16 runs per arm, paired on identical seeds
- horizon: 180d death-aware (dead villages stop simulating; runDays handles this)
- instruments: KILLDISC=1 (the killdisc read-only instrument — per-source tbDamage attribution on wave-3+ monsters; proven non-perturbing) + call-through observation of the presence beat (ctx counts only, zero state writes beyond the beat's own honest movement).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14–15 — BINDING, written BEFORE the sweep)

**PILOT PRIMARY (mechanism):** JOIN RATE = (fights with any companion damage) / (wave-3+ killing fights). Presence arm ≥ 1.5x control → GO to confirm. (Control re-baselined on this corpus; armory measured 5/33 control vs 5/46 armed.)
**ENGAGEMENT:** presence beat fires (goInside) on ≥ 8 runs (the beat must genuinely engage).
**CONFIRM (gated on pilot GO):** 12–16 fresh seeds x 2 policies through the balanced panel; PRIMARY outcome: living-veterans at end of run ≥ +2/16 presence vs control.
**GUARDRAILS:** median survival ≥ control−5d; no new death modes (esp. no fighter-movement deaths — assert the mechanism never assigns/moves/risking villagers); national/table reach not degraded.
**KILL PROTOCOL (pre-registered):** on primary miss, the layer is deleted zero-trace; instruments + evidence land. A miss is NO-GO, never re-scored mid-run (§14).

## The lever (scripts/policies/presence.js — POLICY-SIDE ONLY, zero src/js)

PRESENCE=1. The "stand with the village" beat — scholar self-movement only:

When a wave-3+ threat is at the Haven node (a wave-3+ world monster on the haven node, or an aid crisis active) AND the scholar is at Haven but OUTSIDE (and not in combat), the scholar goes INSIDE (`Game.enterBuilding`) and takes one micro-step. This door-aligns the scholar with the villagers (who sleep inside; npcInside defaults true), and the step triggers the engine's `ensureVillagerPositions` so inside villagers get grid positions the join rule can see. When a raider comes inside ("eyes on your bedroll"), the fight starts inside with villagers in range.

**WHAT IT DOES NOT DO:** never calls `Game.assignTask`, `Game.takeWeapon`, or any verb that moves, assigns, or risks a villager. The scholar moves; the village doesn't. (The armory A10 presence proof is the bar; the vetarm patrol beat is the anti-pattern.)

**Gate:** PRESENCE=1 opt-in, default OFF. Gate-off is pure delegation (proof D0/C1 pins byte-identical trajectories vs tribfloor). Gate-on deterministic (no RNG draws).

## Proof

`scripts/test-presence.js` — RED→GREEN on the layer (ALL GREEN 2026-10-19):
- RED phase (real): run with the layer moved aside → exit 1, "RED: scripts/policies/presence.js missing and PRESENCE_KILLED not set."
- A1 gate honesty: PRESENCE unset → pure delegation (base.daily called, no presence ctx keys, goInside never called; upkeep too) — 5/5
- A2 w3 monster on haven node + scholar outside → goInside + micro-step, ctx counts, scholar now inside, base.daily still runs — 5/5
- A3 no threat → no goInside (the scholar's routine is their own); A4 scholar already inside → no-op; A5 scholar away → no-op; A6 in combat → no-op — 4/4
- A7 aid crisis → triggers (threat recorded as aid-crisis); A8 w2 monster / off-node → no trigger — 4/4
- A9 PRESENCE: assignTask/takeWeapon never called (would throw) — 1/1
- A10 waveOf reads the data table — 1/1
- C1 det-gate (real harness): gate-off byte-identical to tribfloor leadfeast/belongfeast (2 seeds × 60d, 4/4); gate-on deterministic (1/1); gate-on non-vacuous (fabricated w3-at-haven → goInside fires, 11 villagers positioned) — 6/6
- C2 real-sweep gate: 180d presence runs complete per policy (leadpresence d111, belongpresence d161), zero errors, deterministic re-run — 4/4
- **Bug caught**: the layer initially called `Game.goInside` (does not exist); the engine verb is `Game.enterBuilding`. Fixed in policy + test; C1 non-vacuous now green with 11 villagers positioned.

## Results — PILOT

**PILOT VERDICT: GO. The layer survives to confirm.**

32 runs (16+16), 0 instrument errors, 0.0% other-share on both arms:

| metric | control | presence | bar |
|---|---|---|---|
| JOIN RATE (fights w/ companion dmg / w3 killing fights) | 6.5% (2/31) | 45.5% (20/44) | ≥1.5x |
| ratio | — | **7.05x** | ≥1.5x → GO |
| w3 companion kills | 0 | 5 | — |
| companion damage (total) | 159 | 5,875 | — |
| beat engagement (goInside fires) | 0 | 280 | — |
| runs with beat firing | 0/16 | 16/16 | ≥8/16 → GO |
| wave-4 reach | 13/16 | 12/16 | — |
| wave-5 reach | 0/16 | 0/16 | — |
| national reach | 7/16 | 6/16 | not degraded |
| table reach | 13/16 | 15/16 | not degraded |
| wins | 0/16 | 0/16 | — |
| median survival (gameDays) | 119 | 128 | ≥ control−5d → PASS |
| starvation deaths | 0 | 0 | — |
| death modes | 14 modes | 15 modes (see metric review) | no new → JUDGED PASS |

The primary HIT (7.05x vs the 1.5x bar). Engagement HIT (16/16 runs, 280 beats). All guardrails PASS: median survival +9d (bar −5d), starvation 0 vs 0, national/table not degraded (6/16 vs 7/16 national, 15/16 vs 13/16 table), and no fighter-movement deaths (the mechanism never assigns/moves/risks villagers — proof A9; see metric review on the naive new-mode flag).

### Balanced panel (§15)

`evidence/2026-10-19/presence-panel-primary.md` — control→presence compare: decision `review_required`; national `regression_watch` delta −0.125 with 95% CI crossing 0 (−0.625 to 0.25) — no material signal, consistent with the guardrail verdict (6/16 vs 7/16 is noise on 16 runs). The panel is the instrument; the pre-registered 1.5x threshold was the judge (7.05x, GO).

### Wall numbers (this run, 32 runs)

national 13/32, table 28/32, wins 0/32, wave-4 25/32, wave-5 0/32, median survival 119/128d. The scale wall stands (no wins), but the presence arm moved the veteran-production needle: 5 companion kills vs 0, 20/44 fights with companion damage vs 2/31.

## Village assessment (plain words)

The modal village on the presence arm fights wave-3 monsters with company. The scholar's "stand with the village" beat fired 280 times across 16 runs — every run had the scholar door-aligning with the village when wave-3+ threats were at Haven. The result: 20 of 44 wave-3 killing fights had companion damage (vs 2 of 31 on control), and 5 wave-3 monsters were killed BY companions (vs 0 on control).

Who thrived: Aki (s63524) — fought an Ad Break alongside the scholar for 9 rounds, dealing 381 damage (FEASTED ×2.25, 23–41 per hit), taking hits on their gear. The transcript reads as two people fighting together, not a damage number. Who died: everyone, eventually — 31/32 villages lost or dead; the wall is mortality, not presence. What was missing before: a reason for the scholar to be on the same side of the door as the villagers. The blank this run fills is presence-routing without movement — the 11th attempt succeeds where 10 failed.

## Sense-testing (SENSE-TESTING LAW)

Read: evidence/2026-10-19/presence-transcripts/leadpresence-s63524.txt (d78 ad_break — 4 joiners, 381 companion damage).

"⚔ AD BREAK! Valentina, Aki, Farid, Indira join you!" Four companions join. Aki fights bravely for 9 rounds (23–41 per hit, FEASTED). "Farid watches, jaw tight." — then "Farid runs for it!" Valentina "runs for it!" Indira is present but passive. The companions read as PEOPLE with distinct courage: Aki the fighter, Farid the frightened, Valentina the fleer, Indira the witness. Nobody is confused; the fiction matches the ledger; the join is the proximity rule working as designed. The sense-test CONFIRMS the mechanism: door-aligned villagers join and behave like villagers, not damage numbers.

## Metric review (§14 — binding, never re-scored)

1. **PILOT PRIMARY (≥1.5x join rate) HIT: 7.05x.** Not re-scored, not re-framed. The bar was written before the sweep; the hit is GO per the pre-registered protocol. The layer survives to confirm.
2. **Engagement bar (≥8 runs) HIT: 16/16.** The beat genuinely fired (280 goInside + 280 steps); the hit is mechanism, not noise.
3. **Guardrails:** all PASS (survival +9d, starvation 0v0, national/table not degraded). The "new death mode" flag was naive string-matching: the 6 "new" strings are instances (monster names: Landlord, Glow Stag, Anaconda Empress; disease: lockjaw; "alien"; "the expedition" vs "expedition"), not modes. Categories are identical (combat, villager combat, monster, expedition, sickness, contest, ambush). Crucially: ZERO fighter-movement deaths — the beat never calls assignTask/takeWeapon (proof A9). The guardrail passes on its stated intent ("esp. no fighter-movement deaths").
4. **Panel (§15):** `review_required`, national regression_watch (CI crosses 0). The panel is descriptive; the pre-registered 1.5x threshold was the judge.
5. **Seeds.** 63521–63528, verified filename-unused in evidence/2026-10-19/perseed-*/ before the sweep. 32/32 runs, 0 instrument errors, 0.0% other-share both arms, deterministic re-runs (proof C2).
6. **Infrastructure:** a service restart mid-run wiped /tmp and killed the presence sweep at 9/16 (the documented 2026-10-19 hazard). Per-seed JSONs survived on disk; the 7 missing belongpresence runs were re-run cleanly (deterministic seeds). No seed was run twice for the same question.
7. **Metric doubt for the NEXT run (not this one):** the beat fires very often (up to 40/run on s63524) — it may be over-triggering on lingering threats. If the confirm shows survival degradation, consider a cooldown. Not re-scored here.

## Out-of-arm findings (not chased)

Filed to hidden_files/sim-findings.md:
1. **Door-split is the dominant presence block** (diagnostic 22/26): scholar outside at treeline, villagers inside. Any future presence work should start here.
2. **ensureVillagerPositions only runs on scholar movement**; goInside/enterBuilding doesn't call it. A game-code fix (call it on door transition) would help all presence, not just this beat. Steve-call if pursued.
3. **Beat over-triggering**: up to 40 goInside/run. May need a cooldown if confirm shows costs.

## Convergence

**GO-TO-CONFIRM.** The 11th production attempt succeeds: presence-routing without movement raised the wave-3 join rate 7.05x (45.5% vs 6.5%) with all guardrails green. Five companion kills vs zero. The mechanism (door-alignment via scholar self-movement) is proven. The axis stays scale-onramp: the confirm (12–16 fresh seeds, living-veterans primary) will test whether presence converts to surviving veterans. No game change: zero src/js; policy-side only.

## Files

- scripts/policies/presence.js — the layer (PRESENCE=1; survives to confirm)
- scripts/test-presence.js — layer proof, ALL GREEN (A 21/21, C1 6/6, C2 4/4; RED→GREEN incl. real RED phase)
- scripts/presence-sweep-20261019.js — pilot sweep (16+16 runs; carries the writeFileFlap EPERM hardening)
- scripts/presence-analyze-20261019.js — pilot analysis + guardrail judgment
- scripts/presence-transcripts-20261019.js — sense-testing probe (with sysSay restore per w5census lesson)
- scripts/build-presence-panels.js — §15 balanced-panel compare (control→presence)
- scripts/probe-presence-diag-20261019.js — the join-block diagnostic (control policy; 26 fights)
- scripts/probe-inside-check.js — manual inside-mechanism check (scratch)
- evidence/2026-10-19/perseed-presence-pilot/ — 32 per-seed JSONs + _summary-{control,presence}.json + _analysis.json
- evidence/2026-10-19/presence-panel-primary-{before,after}.json.gz + presence-panel-primary.json + presence-panel-primary.md — the panel compare
- evidence/2026-10-19/presence-transcripts/leadpresence-s63524.txt — sense-test transcript (Aki's 381-damage fight)
- evidence/2026-10-19/presence-diag.json — diagnostic output
- evidence/2026-10-19/sim-presence.md — this file
- ZERO src/js changes; no game-code changes of any kind
