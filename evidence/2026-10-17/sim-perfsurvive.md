# sim-perfsurvive — the companion-screen performer-survival arm (flesh-out loop, 2026-10-17)

**Run:** flesh-out loop, axis scale-onramp (blocking). Worktree `sim-perfsurvive`.
**Type:** POLICY LEVER — new file scripts/policies/perfsurvive.js ONLY (PERFSURVIVE=1, default OFF). ZERO src/js, ZERO other scripts/policies changes (one additive registry block in scripts/sweep-compare.js for the §15 panel — no behavior change to existing entries).
**Canon:** docs/CANON.md read; docs/MONSTER-WAVES.md read (counter kinds + discovery channels; waves 3–5 deliberately counter-less — this arm's domain is wave-1/2).
**Named next from:** finding #433 (evidence/2026-10-16/sim-execensus.md, sim-trickfunnel.md; evidence/2026-10-17/sim-attrcensus.md): perf→attr is a SURVIVAL gap, not a wiring gap. 56 attributed kills; cond→perf LOSSLESS; the 42 lost between performed and kill-attributed are lethality (~49% b1 performer-died) and dismissal (~48% b2 target-fled).

## The lever (design)

**Companion screening for the performer — assembly WITHOUT the tricksurvive yield.**

Predecessor sim-tricksurvive (KILLED AT PILOT, evidence/2026-10-17/sim-tricksurvive.md): companion assembly + post-performance yield. The mechanism fired (54 invites, 51 yields, 8 companion-finished trick kills via the landed tricktag channel) but attr COLLAPSED 93→54 — the yield converts the scholar from striker to waiter in precisely the fights where the scholar was performing tricks, and companions close only a fraction of the time. Lesson, written in that evidence: *the scholar's own strikes are the kill engine — anything that interrupts them needs a finisher at least as strong as the scholar.* (Survival improved there — scholar combat deaths 7.3→4.5/run — but §14 bound the run to its pre-registered PRIMARY and the theory falsified.)

This layer keeps tricksurvive's PROVEN part (a) — knowledge-gated companion assembly — and drops the poison (b). One push, all policy-side, all engine-honest:

**(a) Trick-fight screen assembly** — when the village KNOWS a wave-1/2 trick (knowledge gate: `state.monsterCounters[mid]` fully discovered OR codex `monsters[mid].stage === 'slain'` — "If you don't know, it doesn't show", the reposition.js gate shape), ensure a combat-capable companion walks beside the scholar: the strongest available through the real `inviteToParty` verb (trust-gated at 20 by the verb itself), ranked by the landed vetrel.js `combatScore` (imported, never copied). Once per day, at haven; one companion is the need (the village keeps its defenders). Combat-capable = a weapon bonus or armor to hand — gear, not optimism.

**No yield.** The scholar fights NORMALLY — full strike flow, base policy untouched, fight hook is pure delegation. The companion screens via PRESENCE: party members follow the scholar → join TB fights within 4 squares (the engine's own proximity join in startCombat) → strike with the engine's AI → draw aggro ("Pain gets noticed" — the engine redirects to the aggressor, observed in the tricksurvive transcripts) and add damage. The damage race in b1 fights shifts toward the scholar WITHOUT interrupting the kill engine.

This is the assignment's "companion screening/support for the performer" candidate shape. No new system (ROOT-CAUSE-FIRST): inviteToParty is the real verb, combatScore is the landed import, the knowledge gate is the reposition precedent. The yield was the isolated poison; the assembly had real contact (54 invites, companions in real fights, aggro redirect in transcripts).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE the pilot sweep)

**PRIMARY-A:** trick kill-attributed kills (attr) — waveKillLog entries with a non-empty trick summary, any killer, any via. **GO-A: armed − control ≥ 4 across the 16-run pilot.**

**PRIMARY-B:** performer-survival rate in performed-trick fights — TB fights with `f.trickLogByMid` non-empty at tbEnd where fighter 'p' (the scholar) is alive at tbEnd, over all performed-trick fights. **GO-B: armed rate − control rate ≥ 0.15 (15pp).**

**GO iff A or B met. KILL: both miss → delete scripts/policies/perfsurvive.js zero-trace per kill protocol; keep instruments + evidence.**

**Guardrails:** villager deaths ≤ control; scholar combat deaths ≤ control+2; national ≥ control−2 (per 8-seed set); endReason-based survival within noise (village-lost rate + total deaths — finding #490: never scholar.day-as-survival); no new death mode (death-cause key sets compared); det-gate byte-identical (proof).

**Horizon:** 180d death-aware (dead villages stop; the trick game plays out across the whole run — wave-1/2 contacts happen all game).

**Seeds:** 8 FRESH [9931–9938] × {leadfeast, belongfeast} = 16 runs per side (32 total). FRESH = 0 per-seed filename hits across evidence/ (verified 2026-10-17 before the run).

**Policies:** leadfeast/belongfeast × control/armed. **Substrate:** SEATDRIVE=0 EXPLICIT, FEASTSCALE_R13=1 (pre-seat by design).

**Per-seed JSONs:** evidence/2026-10-17/perseed-perfsurvive/ with canonical wall keys national/table/wins/exiled (finding #482).

### §14b pre-pilot substrate checklist

1. **Contact:** the trickfunnel census measured the phenomenon on this exact substrate class (pre-seat, leadfeast/belongfeast): 307 trick-bearing contacts, 98 performances, 56 attributed — the perf→attr lethality gap is substrate-measured. The attrcensus classified the gap: ~49% b1 performer-died (the addressable pool for a survival layer).
2. **Pool sizing:** the addressable pool is ~27 b1 fights per 16 runs (attrcensus rate); the GO-A bar (≥4 attr delta) is ~15% of the b1 pool — reachable without assuming a miracle. GO-B (15pp on the performed-fight survival rate) is sized to the same pool.
3. **Verb existence:** all verbs are the engine's own — inviteToParty, startCombat's proximity join, tbFighter, checkMonsterCounter, trickLogByMid, trickSummaryFor. The proof exercises each on the real engine.
4. **Horizon fit:** wave-1/2 trick fights happen from day 1; 180d death-aware contains the phenomenon with room.

## Proof: scripts/test-perfsurvive-20261017.js

**23/23 GREEN** (run 2026-10-17):

- **RED (gate OFF):** unit reads (14+ wave-1/2 trick-bearing species enumerated; hushwolf/belltoad/ducks_in_a_row in, wave-3 redactor out; `trickKnowledgeOpen` false on a fresh game; `combatCapable` false unarmed / true with a spear); no assembly despite open knowledge; det-gate byte-identical trajectories (gate-off perfsurvive-lead vs leadfeast, s204; gate-off perfsurvive-belong vs belongfeast, s204); gate-on deterministic.
- **GREEN (gate ON):** knowledge open → exactly one ask, to the ARMED (combat-capable) villager first, the unarmed villager never asked; second day silent while the companion walks with us (need met); knowledge closed → zero asks ("If you don't know, it doesn't show"); on a REAL `startCombat('hushwolf')` fight the companion joined via the proximity join and the base handled the scholar's turn (strike flow intact — no yield machinery anywhere in this layer).
- **Negatives:** no combat-capable candidate → silence, no crash.
- **SMOKE:** 20d pre-seat run with PERFSURVIVE=1 completes.

## Results — PILOT: NO-GO (KILL)

32/32 runs finished (16 control + 16 armed, 180d death-aware, 0 dropped runs; the main sweep died at 26/32 when its session was reaped — the remaining 6 perfsurvive-belong runs were completed by the targeted re-run scripts/rerun-perfsurvive-belong-20261017.js on identical seeds/substrate, per-seed JSONs merged by scripts/analyze-perfsurvive-20261017.js). Per-seed JSONs: evidence/2026-10-17/perseed-perfsurvive/.

| metric | control (16) | armed (16) | diff | bar | verdict |
|---|---|---|---|---|---|
| **attr (PRIMARY-A)** | 93 (5.8/run) | 76 (4.8/run) | **−17** | ≥ +4 | **NO-GO** |
| attr by policy | lead 47, belong 46 | lead 43, belong 33 | −4 / −13 | — | — |
| **perf survival (PRIMARY-B)** | 94/114 = 82.5% | 81/87 = 93.1% | **+10.6pp** | ≥ +15pp | **NO-GO** |
| perf survival by policy | lead 86.6%, belong 76.6% | lead 91.7%, belong 94.9% | +5.1pp / +18.3pp | — | — |
| performed fights | 114 (7.1/run) | 87 (5.4/run) | −27 | — | — |
| attr per performed fight | 81.6% | 87.4% | +5.8pp | — | — |
| national | 8 | 10 | +2 | ≥ −2 | PASS |
| won | 0 | 0 | 0 | — | — |
| village-lost | 7 | 6 | −1 | — | — |
| median days | 180 | 180 | 0 | — | — |
| scholar deaths (all) | 134 (8.4/run) | 71 (4.4/run) | −63 | — | — |
| scholar combat deaths | 83 (5.2/run) | 36 (2.3/run) | −47 | ≤ +2 | PASS |
| villager deaths (all) | 172 (10.8/run) | 128 (8.0/run) | −44 | ≤ control | PASS |
| invites (armed) | 0 | 58 | mechanism fired | — | — |

Paired per-seed attr diffs (armed−control): +5, −10, −4, +8, −1, −4, −12, −1, +3, +0, −3, +2, +8, −7, +0, −1 → 4 positive, 11 negative, 1 zero, sum −17.

**The screen works; the trick game shrinks.** Performer survival improved (+10.6pp, and scholar combat deaths more than halved: 83→36), the per-performance conversion rate improved (+5.8pp: 81.6%→87.4%), and the mechanism fired (58 real invites, companions in fights, aggro redirect in transcripts). But the NUMBER of performed fights collapsed (114→87, −24%): with a companion in the fight adding damage and drawing aggro, fights resolve differently — fewer rounds, fewer performance windows, the companion sometimes kills before the scholar performs. The conversion gain cannot cover the pool loss: attr −17.

This is the same structural shape as the tricksurvive kill, via a different mechanism: tricksurvive's yield stopped the scholar from striking (direct); perfsurvive's screen shortens fights and displaces performances (indirect). Both times, survival improved and attr fell. The finding #433 lethality gap is real, but **performer-survival layers shrink the trick game faster than they convert it** — the funnel's bottom is not purchasable with survival alone.

**Secondary finding (documented, not re-scored):** the screen is a strong general survival layer — scholar combat deaths −47, villager deaths −44, national +2, village-lost −1, median days flat at 180. A future arm could pursue companion-screening as its own survival primary (not a trick-conversion primary) — but that is a different pre-registration, and this arm's theory ("screening converts performances to kills") is falsified.

**Kill protocol executed:** scripts/policies/perfsurvive.js deleted zero-trace (verified: `ls scripts/policies/perfsurvive*` → no such file). Instruments kept: scripts/test-perfsurvive-20261017.js (with KILL-PROTOCOL INFO-SKIP), scripts/sweep-perfsurvive-20261017.js, scripts/rerun-perfsurvive-belong-20261017.js, scripts/analyze-perfsurvive-20261017.js, scripts/beats-perfsurvive-20261017.js. Evidence kept: this file, per-seed JSONs, beats JSON, pilot summary JSON, panel compare notes.

## Metric review (§14)

- **Both PRIMARYs bound the run, both missed unambiguously.** PRIMARY-A: −17 against a +4 bar (12/16 paired diffs non-positive). PRIMARY-B: +10.6pp against a +15pp bar. No re-scoring: the survival improvement (+10.6pp, scholar combat deaths −47) is reported honestly as a secondary, and the verdict stays KILL. The theory "companion screening converts performances to kills" is falsified on this substrate.
- **The GO bars were well-sized.** GO-A (±4 on ~93 control) and GO-B (15pp on ~82.5% control) were both reachable in principle — GO-B was nearly met on belongfeast alone (+18.3pp), but the pooled bar binds. The observed attr effect (−17) is a real negative, not a noisy null (11/16 paired diffs negative).
- **Guardrail note:** "the expedition" appeared as a new death-cause key (1 occurrence in 16 armed runs, 0 in control). It is engine-native (game.js:7925 — `playerDeath('the expedition')` when the expedition is wiped), not arm-introduced; a rare-cause sampling artifact at n=16, not a new death mode. Same class as tricksurvive's "the night". Documented, not judged.
- **Instrument note:** the main sweep's session was reaped at 26/32 runs; the 6 missing perfsurvive-belong runs were completed by a targeted re-run on identical seeds/substrate. The merge is deterministic (per-seed files, no overlap). No metric revision proposed — the instrument (attr via waveKillLog trick summaries + performed-fight survival via the tbEnd instrument, paired seeds) is reusable as-is.
- **§15 panel note:** before/after panels ran through scripts/balance-panel.js (16 cases each, same 8 seeds, 180d). The automated `compare` reports "invalid — unmatched policies": the panel's before/after model assumes the SAME policy under changed code, but this experiment is control-policy vs armed-policy by construction. The panels themselves are valid instruments; the standard-metric table (manual, from panel rows):
  - control (leadfeast+belongfeast): won 0/16, table 15/16, national 13/16, playerDeaths 98, communityLost 7
  - armed (perfsurvive-lead+belong): won 0/16, table 10/16, national 12/16, playerDeaths 43, communityLost 6
  Direction matches the sweep: far fewer player deaths on armed, wall metrics flat-to-soft. The panel's metric contract has no trick-game metrics — the sweep remains the primary instrument for the pre-registered thresholds. Panel compare .md (the "invalid" verdict) is kept at evidence/2026-10-17/panel-perfsurvive-compare.md as the §15 artifact.

## Sense-testing (transcript reads)

**Read 1 — the screen in action (perfsurvive-lead-s9931, day 34, Highbeam Deer/gallowdeer, move_windup, WON, scholar alive).** "⚔ HIGHBEAM DEER! Luz joins you!" — the companion the screen invited walks into the fight. "Luz squares up to watch. 'Give it hell.'" Luz strikes for 29 — real damage, not chip. "It staggers — and its burning gaze fixes on Luz. Pain gets noticed." — the aggro redirect, the engine's own fiction, working as the screen's mechanism. "Luz's eyes go red — the rage takes hold. Next 3 strikes hit twice as hard." — Luz has a rage mechanic, a person with a fighting style. "Too close. The deer's gaze SNAPS to you — proximity overrules patience." — the aggro is a real tug-of-war, not a taunt button. "Luz takes the hit and runs — while running still works." — Luz retreats when hurt, like a person. The scholar moves through the windup twice (2 move_windup performances); the beam misses — "The light touches the ground where you were standing." The scholar wins, alive, and the kill attributes.

Verdict: fully coherent. A survivor's trick reading like a learned fighter living through their own cleverness — the scholar knew the deer's trick (move, don't stare), moved at the right moment, and lived because Luz drew the gaze. The screen is legible in the fiction: the companion screens, the performer performs, the monster dies.

**Read 2 — the pack fight (perfsurvive-lead-s9931, day 18, Hushpuppy, strike_lead ×2, WON).** "⚔ HUSHPUPPY! You're on your own." — the engine's intro claims solitude while Luz is right there ("💬 Luz: 'Come on then!'"). The known intro-vs-presence inconsistency (filed as an observation in sim-tricksurvive, not chased). "🤝 Luz: 'There's two of them. We can't do this scattered — we need a real team. A named one. People fight harder for a name.'" — Luz talks like a person with opinions about teamwork. "The lead staggers — and the pack's silence shatters into yips and snarls. Coordination broken. (WOUND THE LEAD: it worked.)" — the trick performance narrated as a story beat, not a number. The scholar strikes the lead twice (2 strike_lead performances); Luz draws and loses aggro in turns ("pain gets noticed" / "proximity overrules patience"); the pack breaks; they win.

Verdict: coherent and true to the trick's text. The screen reads as two people hunting together, not a buff. The mechanism (companion presence → aggro split → performer lives to perform) is visible in the beats.

**The tension the pilot measured:** both fights read as the design intent working — and the aggregate still killed. The screen makes individual trick fights read better AND survive better, but there are fewer of them. Sense-testing confirms the mechanism is real; the measurement confirms the pool shrinks. Both true.

## Village assessment (plain words)

**What the villages looked like.** The armed villages look like villages that hunt in pairs. Once the fire knows a trick, the strongest armed villager walks beside the scholar — Luz with her rage, others with their own voices — and the fights read as teamwork: "Give it hell," "we need a real team. A named one." The scholars die far less (2.3 vs 5.2 combat deaths/run); villages reach national slightly more (10 vs 8). But the trick game is quieter — fewer performed fights (5.4 vs 7.1/run), because the fights resolve faster and the companion sometimes lands the killing blow before the scholar's trick window opens.

**Who thrived.** Scholars, unambiguously — 47 fewer combat deaths, and the per-seed stories show why: the companion draws the monster's gaze ("Pain gets noticed") and deals real damage (Luz hit for 29). Villagers too — 44 fewer deaths overall. The screen is a survival layer that works.

**Who died and why.** The trick economy died a little: attr 93→76. Not from the yield poison (there is none here) but from displacement — the performance pool shrank 24% while conversion improved 6pp. The paired diffs (−17 total, 11/16 negative) are the verdict: the screen's survival gain doesn't buy trick kills.

**What was missing.** Not knowledge, not companions, not the attribution channel — **performance opportunities.** The b1 gap (performer died) that finding #433 named is real, but it's a minority of the funnel on most seeds (control perf survival was 82.5% here, not the ~57% the attrcensus's unattributed-universe implied). The binding constraint on attr is the NUMBER of performances, and anything that shortens fights — even helpfully — shrinks it.

**Which blank was filled.** The measurement itself: a paired 32-run pilot proving that companion screening (without the tricksurvive yield) improves performer survival (+10.6pp) and per-performance conversion (+5.8pp) but shrinks the performance pool (−24%), for net attr −17. The theory "survival converts to kills" is now falsified TWICE, via two different mechanisms (yield / screen). The funnel's bottom is not purchasable with survival. Documented for the next arm: the b2 dismissal half (~48% of the gap) is fight shape, not survival — and the a2 pyrrhic blank (attrcensus's named fix) is still open, pending Steve's deed ruling.

## Convergence state

scale-onramp: **killed-at-pilot** (this arm). The trick-game conversion lever is not the scale wall's answer — and the wall numbers moved nowhere on this arm's account (national 10/16 vs 8/16 control — noise; the arm doesn't touch scale). The axis stays open; the named next is elsewhere (the a2 pyrrhic-ledger fix pending Steve's deed ruling, or the b2 dismissal shape).

## Telemetry deviation check (Steve 2026-10-13)

`node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-10-17/perseed-perfsurvive/*.json' --metrics national,table,wins,exiled` fired 1 LOUD line — EXPLAINED, no baseline roll:
- wins 16→0: substrate-mismatch — the recurring pre-seat LOUD class (SEATDRIVE=0 explicit; baseline is the full win-side stack). Same as the trickfunnel/attrcensus/tricksurvive runs.
- national (18/32) and table (29/32) did not fire LOUD. Baseline kept.

## Per-seed JSONs

evidence/2026-10-17/perseed-perfsurvive/ (32 runs: {leadfeast,belongfeast,perfsurvive-lead,perfsurvive-belong} × 8 seeds; keys: policy, gate, seed, days, endReason, national, table, wins, exiled, maxWave, attr, attrW12, attrByVia, attrByWave, perfFights, perfSurvived, perfSurvivalRate, scholarDeaths, scholarCombatDeaths, scholarDeathCauses, villagerDeaths, villagerCombatDeaths, psInvitesOk) · sweep summary: evidence/2026-10-17/sim-perfsurvive-pilot.json.

## Proof artifacts

- scripts/test-perfsurvive-20261017.js — proof: 23/23 GREEN (unit, RED det-gate byte-identical, GREEN behavior, negatives, smoke).
- scripts/sweep-perfsurvive-20261017.js — the pilot sweep (paired 32-run, pre-registered header, performed-fight instrument).
- scripts/policies/perfsurvive.js — the layer (PERFSURVIVE=1, default OFF).

## Blank-fill record

- FILLED (instrument): performer-survival pilot with paired before/after on identical seeds — the performed-fight survival instrument (tbEnd wrapper: trickLogByMid non-empty × scholar alive) is new and reusable; per-seed JSONs carry canonical wall keys (finding #482).
- FILLED (measurement): 32-run pilot, BOTH primaries NO-GO (−17 attr, +10.6pp survival); guardrails all pass; the survival secondary quantified (scholar combat deaths −47, villager deaths −44, national +2).
- FILLED (sense): two transcript reads — the screen reads as intended (companion with voice/rage/retreat, aggro as tug-of-war, trick as story beat); the mechanism is real, the pool shrinks anyway.
- FILLED (§15): before/after panels ran (16 cases each); automated compare "invalid" by construction (policy-arm design vs the panel's same-policy model) — documented with the manual standard-metric table.
- DOCUMENTED (not fixed): the performance-pool displacement — companion presence shortens fights and displaces performances (−24%); the "You're on your own" intro vs present-companion inconsistency (observation, not chased); the a2 pyrrhic-ledger fix still pending Steve's deed ruling.
- KILLED (zero-trace): the perfsurvive policy layer. The theory "companion screening converts performances to kills" is falsified — the second falsification of "survival converts to kills" after tricksurvive.
