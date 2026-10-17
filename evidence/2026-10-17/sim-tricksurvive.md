# sim-tricksurvive — the performer-survival / companion-finisher arm (flesh-out loop, 2026-10-17)

**Run:** flesh-out loop, axis scale-onramp (blocking). Worktree `sim-tricksurvive`.
**Type:** POLICY LEVER — new file scripts/policies/tricksurvive.js ONLY (TRICKSURVIVE=1, default OFF). ZERO src/js, ZERO other scripts/policies changes. **KILLED AT PILOT — policy file deleted zero-trace per kill protocol; instruments + evidence kept.**
**Canon:** docs/CANON.md read; docs/MONSTER-WAVES.md read (counter kinds + discovery channels; waves 3–5 deliberately counter-less — this arm's domain is wave-1/2).
**Named next from:** finding #433 (evidence/2026-10-16/sim-execensus.md, sim-trickfunnel.md): perf→attr is a SURVIVAL gap, not a wiring gap. 56 attributed kills; cond→perf LOSSLESS; the 42 lost between performed and kill-attributed are lethality (ducks_in_a_row strike_nonhead: 6 performed / 0 attributed / scholar died in ALL 6; gallowdeer move_windup: 18/3).

## The lever (design)

Two pushes, all policy-side, all engine-honest:

**(a) Trick-fight party assembly** — when the village KNOWS a trick kind for a wave-1/2 species (knowledge gate: `state.monsterCounters[mid]` fully discovered OR codex `monsters[mid].stage === 'slain'` — "If you don't know, it doesn't show"), ensure a combat-capable companion is in the party: the strongest available through the real `inviteToParty` verb (trust-gated at 20 by the verb itself), ranked by the landed vetrel.js `combatScore` (imported, never copied — its domain was wave-3 vet hunts; this domain is wave-1/2 trick fights). Once per day, at haven; one companion is the need. Combat-capable = a weapon bonus or armor to hand.

**(b) Post-performance yield** — after the scholar's trick performance registers in the fight (`f.trickLogByMid` — the engine's own per-species hit record), the scholar yields the kill: defensive posture via the real `tbPlayerWait` verb, while companions finish. Guards: scholar hpPct ≥ 0.7 (LUXURY discipline — the base's turn-1 outmatched walk-away and 0.35 eject stay authoritative; this never rescues, it finishes), never before round 2, an engaged companion in the fight, weakest live trick-bearing monster with a registered performance at ≤50% maxHp, ≤5 yield turns/fight, stall detection (2 yield turns with no damage → cancel), yield cancelled if the scholar drops below 0.5. The mechanism: `trickSummaryFor(f, mid)` is per-species per-fight — the landed tricktag channel (commit de49bea3) attributes a companion's killing blow `by=<vid> via='companion'` WITH the trick summary. A kill the scholar's death used to erase becomes a trick-attributed kill.

Why the yield triggers on PERFORMANCE, not knowledge: the duck case performed while UNKNOWN (discovery-in-fight) and died anyway — a knowledge-gated yield would never have saved the performer. The performance IS the knowledge event.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE the pilot sweep)

**PRIMARY:** trick kill-attributed kills (attr) — waveKillLog entries with a non-empty trick summary, INCLUDING companion-finished attributions. **GO: armed − control ≥ 4 across the 16-run pilot. KILL: miss → delete scripts/policies/tricksurvive.js zero-trace per kill protocol; keep instruments + evidence.**

**Guardrails:** scholar combat deaths ≤ control+2; national ≥ control−2 (per 8-seed set); median survival ≥ control−10d; no new death mode (death-cause key sets compared).

**Horizon:** 180d death-aware (dead villages stop; the trick game plays across the whole run — wave-1/2 contacts happen all game).

**Seeds:** 8 FRESH [3701–3708] × {leadfeast, belongfeast} = 16 runs per side (32 total). FRESH = 0 per-seed filename hits across evidence/ (verified 2026-10-17: `find evidence -name "*s370[1-8]*"` → empty).

**Policies:** leadfeast/belongfeast × control/armed. **Substrate:** SEATDRIVE=0 EXPLICIT, FEASTSCALE_R13=1 (pre-seat by design).

### §14b pre-pilot substrate checklist

1. **Contact:** the trickfunnel census measured the phenomenon on this exact substrate class (pre-seat, leadfeast/belongfeast): 307 trick-bearing contacts, 98 performances, 56 attributed — the perf→attr lethality gap is substrate-measured.
2. **Pool sizing:** the addressable pool is ~98 performances per 16 runs with 42 lost to lethality; the GO bar (≥4 attr delta) is ~10% of the lost pool — reachable without assuming a miracle.
3. **Verb existence:** all verbs are the engine's own — inviteToParty, tbPlayerWait, tbDamage/tbEnd, checkMonsterCounter, trickSummaryFor. The proof exercises each on the real engine.
4. **Horizon fit:** wave-1/2 trick fights happen from day 1; 180d death-aware contains the phenomenon with room.

## Proof: scripts/test-tricksurvive-20261017.js

**32/32 GREEN** (run 2026-10-17, ~5.6 min; KILL-PROTOCOL INFO-SKIP added after the kill — `TRICKSURVIVE_KILLED=1` exits green, mirroring test-arming-20261016.js):

- **RED (gate OFF):** unit reads (14+ wave-1/2 trick-bearing species enumerated; hushwolf/belltoad/ducks_in_a_row in, wave-3 redactor out; `trickKnowledgeOpen` false on a fresh game; `combatCapable` false unarmed / true with a spear); yield never fires in a yield-ready fight (base handles); no assembly despite open knowledge; det-gate byte-identical trajectories (gate-off tricksurvive-lead vs leadfeast, s204; gate-off tricksurvive-belong vs belongfeast, s204); gate-on deterministic.
- **GREEN (gate ON):** knowledge open → exactly one invite, to the ARMED (combat-capable) villager first, the unarmed villager never asked; knowledge closed → zero invites ("If you don't know, it doesn't show"); on a REAL `startCombat('hushwolf')` fight the scholar's real `checkMonsterCounter` strike_lead hit registered in `trickLogByMid`, the companion joined, and the yield fired (scholar held, turn handled, fight advanced); `tbDamage` with the companion's key stamped `_tbKilledBy`, and `tbEnd('won')` wrote waveKillLog `by=<companion vid> via='companion'` WITH the trick summary (`strike_lead`) — **the landed tricktag channel attributes companion-finished kills to the trick, confirmed**.
- **Negatives:** scholar at 60% HP → no yield; no companion in fight → no yield; monster at full HP → no yield (finishing discipline, not fight-yielding); all fall through to the base.
- **SMOKE:** 20d pre-seat run with TRICKSURVIVE=1 completes.

## Results — PILOT: NO-GO (KILL)

32/32 runs finished (16 control + 16 armed, 180d death-aware, 0 dropped runs). Per-seed JSONs: evidence/2026-10-17/perseed-tricksurvive/.

| metric | control (16) | armed (16) | diff | bar | verdict |
|---|---|---|---|---|---|
| **attr (PRIMARY)** | 93 (5.8/run) | 54 (3.4/run) | **−39** | ≥ +4 | **NO-GO** |
| attr wave split | w1: 61, w2: 31, w3: 1 | w1: 27, w2: 26, w3: 1 | w1 collapsed | — | — |
| armed attr by via | — | player 38, companion 8, wild 7, contest 1 | — | — | — |
| national | 9 | 10 | +1 | ≥ −2 | PASS |
| won | 0 | 0 | 0 | — | — |
| median survival | 154d | 180d | +26 | ≥ −10d | PASS |
| scholar deaths (all) | 134 (8.4/run) | 83 (5.2/run) | −51 | — | — |
| scholar combat deaths | 117 (7.3/run) | 72 (4.5/run) | −45 | ≤ +2 | PASS |
| villager combat deaths | 118 (7.4/run) | 82 (5.1/run) | −36 | — | — |
| invites / yields (armed) | 0 / 0 | 54 / 51 | mechanism fired | — | — |

Paired per-seed attr diffs (armed−control): −5, +5, +3, −2, −4, −10, −4, −4, −11, +3, +8, −4, −4, −10, +1, −1 → 4 positive, 12 negative, sum −39.

**The mechanism works; the discipline is net-negative.** The tricktag channel did its job — 8 companion-finished trick kills were attributed (`via='companion'`, the proof's GREEN test predicted exactly this). But the scholar's own trick-kill rate collapsed (player via: ~85 → 38): the yield converts the scholar from striker to waiter in precisely the fights where the scholar was performing tricks, and companions close only a fraction of the time (51 yields → 8 companion kills). The attr loss concentrates in wave-1 (61→27): wave-1 fights are where the scholar's own kill flow is fastest, so disrupting it costs the most there.

**Secondary finding (documented, not re-scored):** performer survival DID improve — scholar combat deaths 7.3→4.5/run, median survival 154→180d, villager combat deaths 7.4→5.1/run. The yield redistributes damage to companions ("Pain gets noticed" — monsters redirect to the aggressor), and scholars live longer. But the pre-registered PRIMARY is attr, and per §14 a miss is NO-GO, never re-scored against a friendlier metric. The survival gain is real and measured — a future arm could pursue it as its own primary — but this arm's theory (survival → more trick kills) is falsified: scholars lived longer and killed fewer trick-attributed kills.

**Kill protocol executed:** scripts/policies/tricksurvive.js deleted zero-trace (verified: `ls scripts/policies/tricksurvive*` → no such file). Instruments kept: scripts/test-tricksurvive-20261017.js (with KILL-PROTOCOL INFO-SKIP), scripts/sweep-tricksurvive-20261017.js, scripts/beats-tricksurvive-20261017.js. Evidence kept: this file, per-seed JSONs, beats JSON.

## Metric review (§14)

- **The PRIMARY bound the run.** It was the right metric: it measured exactly the arm's theory (performances → attributed kills) and the miss is unambiguous (−39 against a +4 bar; 12/16 paired diffs negative). No re-scoring: the survival improvement is reported honestly as a secondary, and the verdict stays KILL.
- **The GO bar (±4 on ~93 control) was well-sized** — not so tight as to kill noise, not so loose as to pass drift. The observed effect (−39) is an order of magnitude beyond the bar: this is a real negative, not a noisy null.
- **Guardrail note:** "the night" appeared as a new death-cause key (1 occurrence in 16 armed runs, 0 in control). It is engine-native (game.js:10994 — endDay blames "the night" when no cheat-death trigger fires), not arm-introduced; a rare-cause sampling artifact at n=16, not a new death mode. Documented, not judged.
- **No metric revision proposed.** The instrument (attr via waveKillLog trick summaries, paired seeds) is reusable as-is for future trick-economy arms.

## Sense-testing (transcript reads)

**Fight #2, tricksurvive-lead-s3703, day 10 — belltoad (Choir Toad), the yield in action.** The scholar bellows ("broke the chorus with raw noise" — the trick performed and registered), then:

> You hold still, watching.
> Chen strikes the Choir Toad. Chen hits toad for 5.
> It CROAKS — offended — and its throat swells toward Chen. Pain gets noticed.
> ... You hold still, watching.
> Chen strikes the Choir Toad. Chen hits toad for 7.
> It CROAKS — offended — and its throat swells toward Chen. Pain gets noticed.

Meaning: the design intent reads exactly as written — the scholar does the trick, holds, the companion works, and the monster *redirects to the aggressor* ("Pain gets noticed" — the engine's own aggro fiction). Chen fights like a person: "Stay behind me!", strikes, and later "takes the hit and runs — while running still works." Coherence: the yield is legible in the fiction. Relevance: this is the mechanism working — and then the fight is still lost on damage ("You go down" — the toad's chorus lands as one sound). Chen hits for 5–7 against a 45–60 HP toad; two yielded turns buy 12 damage and cost the scholar the fight. The transcript shows WHY the pilot missed: the companion can't close fast enough, and the yielded turns are free monster turns.

**Read 2 — fight #1, same seed, day 10 (no yield, pre-knowledge):** "⚔ CHOIR TOAD! You're on your own." — while Chen is right there fighting ("Chen strikes the Choir Toad"). Minor fiction inconsistency in the engine's existing intro text (not this arm's doing): the intro claims solitude while a villager is in the fight. Filed as an observation, not chased (stay on axis).

## Village assessment

The villages look like villages that learned to hunt in pairs and got worse at it. The fire knows the tricks (knowledge gates opened; 54 invites across 16 runs — the assembly worked), companions walk beside the scholar, and the scholar visibly yields ("You hold still, watching") while Chen and others strike. Who thrived: scholars — they died far less (4.5 vs 7.3 combat deaths/run) and villages survived longer (median 180 vs 154d). Who died: the trick economy — wave-1 trick kills nearly halved, because the scholar stopped striking in the fights where they used to perform-and-kill.

What was missing: not knowledge, not companions, not the attribution channel — **closing power**. The companion hits for 5–7; the scholar's yielded turns are worth more than the companion's added turns against anything with real HP. The blank filled: performer-survival does NOT convert to kill attribution on this substrate — the funnel's lethality gap (finding #433) is real, but the fix isn't "scholar yields" — the scholar's own strikes are the kill engine, and anything that interrupts them needs a finisher at least as strong as the scholar. Documented for the next arm: a companion-finisher discipline needs companions who can actually finish (stronger companions, or the yield restricted to near-dead monsters at much lower HP thresholds).

## Convergence state

scale-onramp: **killed-at-pilot** (this arm). The trick-game conversion lever is not the scale wall's answer — and the wall numbers moved nowhere on this arm's account (national 10/16 vs 9/16 control; the arm doesn't touch scale). The axis stays open; the named next is elsewhere.

## Telemetry deviation check (Steve 2026-10-13)

`node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-10-17/perseed-tricksurvive/*.json' --metrics national,table,wins,exiled` fired 2 LOUD lines — both EXPLAINED, no baseline roll:

1. `LOUD: table disappeared: baseline 16 -> current 0` — EXPLAINED: substrate-mismatch (baseline = win-side stack; this pilot runs pre-seat SEATDRIVE=0 by design — the recurring pre-seat LOUD class; also the per-seed JSONs record `won`, not `table`).
2. `LOUD: wins disappeared: baseline 16 -> current 0` — EXPLAINED: same class (pre-seat wins are 0 by design; won=0/16 both sides).

national did not fire LOUD (19/32). Baseline kept.

## Per-seed JSONs

evidence/2026-10-17/perseed-tricksurvive/ (32 runs: {leadfeast,belongfeast,tricksurvive-lead,tricksurvive-belong} × 8 seeds; keys: policy, gate, seed, days, endReason, national, won, maxWave, attr, attrW12, attrByVia, attrByWave, scholarDeaths, scholarCombatDeaths, scholarDeathCauses, villagerCombatDeaths, tsInvitesOk, tsYields) · beats: evidence/2026-10-17/tricksurvive-beats/tricksurvive-lead-s3703.json (2549 fight beats, 24 yields) · sweep summary: evidence/2026-10-17/sim-tricksurvive-pilot.json.

## Proof artifacts

- scripts/test-tricksurvive-20261017.js — proof: 32/32 GREEN (unit, RED det-gate byte-identical, GREEN behavior + tricktag attribution, 4 negatives, smoke); KILL-PROTOCOL INFO-SKIP after the kill.
- scripts/sweep-tricksurvive-20261017.js — the pilot sweep (paired 16-vs-16, pre-registered header).
- scripts/beats-tricksurvive-20261017.js — beat capture for sense reads.
- scripts/policies/tricksurvive.js — **DELETED per kill protocol** (zero-trace; never committed).

## Blank-fill record

- FILLED (instrument): performer-survival lever with paired before/after on identical seeds; the tricktag channel verified end-to-end (companion killing blow → `by=<vid> via='companion'` + trick summary).
- FILLED (measurement): 32-run pilot, PRIMARY NO-GO (−39, bar +4); guardrails all pass; the survival secondary quantified (scholar combat deaths −45, median survival +26d).
- FILLED (sense): transcript read of the yield in action — coherent fiction, failed fight; the "Pain gets noticed" aggro redirect documented.
- DOCUMENTED (not fixed): the finisher-strength gap — a yield discipline needs companions who can close; the engine's "You're on your own" intro vs present-companion inconsistency (observation, not chased).
- KILLED (zero-trace): the tricksurvive policy layer. The theory "performer survival converts to trick kills" is falsified on this substrate.
