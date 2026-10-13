# Scale-wall r17 ARM 2 — table recon (DIAGNOSTIC, no game changes)

Run: fleshout-a-20261013T2015Z, ARM 2 (scale-table). Worktree: ~/workspace/worktrees/scale-table.
Axis: scale-onramp (blocking, standing directive). Canon: docs/CANON.md, docs/TABLE.md read first.
No lever — pure recon. No game-code changes; scripts/ + evidence/ only.

## Pre-registration (diagnostic arm)

- Suite: the r1–r3 wall suite revived — seeds 11/22/33/44/55/66/77/88 × competent/winseek, 150d death-aware, gates off (clean env, no COMPETENT_/WINSEEK_ overrides), identical seeds for the shared r17 baseline (arms 1 + 3 reuse this baseline).
- Instrument: NEW `scripts/sweep-tablerecon-20261013.js` — table-approach telemetry on top of the scale-repro + food-coupling instruments: every-5-day `tableSeat()` + `deedGateReady()` rows with best-ever rung tracking, tableWaiting/tableDone/Arc-IV day latches, nationalFirstDay at daily resolution, wave-ledger kill points (the wave-4/5 gate input), tribute/proposals/tends at national scale, structured `registerDeath` causes, bounded say-line story capture. Proof: `scripts/test-tablerecon-20261013.js`, **19/19 green**.
- GO (diagnostic): honest table-reach numbers + the binding constraint at national scale named with measured numbers, on the 8-seed suite. "No coherent pattern" would have been an acceptable finding — it wasn't needed.

## The instrument

`attachTable` wraps nothing behavioral: `Game.say` and `Game.registerDeath` are pass-through wrappers (the double-death guard and all game logic untouched — proven by test). `tableRow()` reads `tableSeat()` (lesser bar: w1-3 distinct faced, contests, crises, rank, stage, food-deeds) and `deedGateReady()` (full bar: w1-5 distinct fought, contests, crises, scale) plus the new `waveLedgerPoints(1..4)` sampling. `trackBest` keeps best-ever rungs so a mid-run seat that regresses still counts as approach; `namedGaps` names the missing rungs per seat. Deterministic per seed; 142–166s for 16 runs.

## Wall numbers (this suite)

**Suite: national 0/16 · tableWaiting 0/16 · tableDone 0/16 · arc4 0/16 · wins 0/16 · seats ever: full 0, lesser 0 · wave 4/5 faced 0/16 · median 63d / max 150d · exiled 0/16 · vests 0.**

| policy | median d | end | maxRank | proposals→accepted | tribute out |
|---|---|---|---|---|---|
| competent (8) | 120 | 7 village-lost, 1 survived 150 | village 8/8 | **0 → 0** | 0k |
| winseek (8) | 40 | 8 village-lost | regional 6/8, village 2/8 | 8 → 2 | 266.3k |

Missing rungs at best-ever approach —
- lesser seat: w3 14/16 · food-deeds 13/16 · scale village<regional 10/16 · w2 9/16 · contests 6/16
- full seat: w3 16/16 · w4 16/16 · w5 16/16 · scale 16/16 · w2 10/16 · contests 7/16 · crises 2/16

**Wave-3 ledger kill points (wave-4 gate needs 4, per-type cap 2): median 0, max 5.** Only competent s22 cleared the bar (5 pts at d130) — but rank=village, so no wave-4 unlock. The 6 regional seeds (all winseek) have 0 wave-3 kill points. **0/16 meet both rungs of the wave-4 gate.** Wave 5 is unreachable by construction (needs 3 wave-4 points; wave 4 never unlocked in any run on any suite).

Closest table approaches: winseek s66 (d50, regional) missed the lesser seat by ONE rung (w3 0/3 distinct faced); competent s11/s22 (d145/d130) missed by two (scale + food-deeds). The food-deed rung is a known policy gap (r13's feast instrument fills it 7/8; journey-endgame r8's "only missing rung").

Death causes (structured registerDeath hook, 164 people deaths): combat/monster ~75% on BOTH policies (competent: monster:combat 92, monster:villager 35, villager:combat 20, villager:monster 19; winseek: villager:monster 30, villager:combat 24, monster:villager 22). Starvation 18, sickness 15. starveDays total 14/16 runs. **The death profile is identical across policies and identical to the r16 courtship baseline — there is no distinct "national-scale" way to die.** (Cross-run: r17 ARM 1's death-attribution instrument on the same suite attributed 57/57 scholar deaths: combat 44, starvation 7, contest 5, expedition 1 — and found 11/16 runs with same-day double scholar deaths, e.g. winseek s11 days 9/22/33 each killed two scholars. The winseek collapse is substantially same-day succession chains.)

## The binding constraint, named with numbers

**The wave-4 unlock gate is a two-rung bind, and no measured run meets both rungs.** (1) Kills: 4 wave-3 ledger points (kills only, per-type cap 2) — 1/16 cleared it on this suite, 0/8 on the r16 courtship baseline. (2) Scale: regional+ — 6/16 on this suite, but all with 0 wave-3 kill points; the one seed with the kills never courted a link. Below the wave bars, **the national on-ramp is link-courtship-gated by construction**: competent proposes 0 links and never leaves village (0/8 regional even in the 150d survivor); winseek courts (8 proposals, 2 accepted, regional 6/8) but dies median 40d in combat before links can season (the national bar needs ~30d seasoned links). The courtship policies (r16 belongseek/leadcourt) reach national 4/8 — the road is real, but it requires the courtship road specifically.

**At national scale itself, there is no coherent distinct failure mode — national is a milestone on the way to the same combat deaths.** Evidence: r16 courtship national seeds — 1/4 survived 150d holding national, 3/4 died village-lost in combat (d81/d84/d150); r13's belongseek s22 held national exactly 5d (d~120–125) before "the monsters took the village" (starveDays 0, pantry crash max 3d). Death causes at every scale are the same combat attrition. The r6-era starvation-at-scale story is gone from current-tip sims.

So the scale wall has two faces, and the table binds on the second:
1. **On-ramp:** links. Survival-without-courtship (competent) can't touch the national bar; courtship-without-survival (winseek) dies first. The bind is fight selection + villager field survival (r16 arms B/C) — the wall's long-standing face.
2. **At/above national:** the wave-4 gate's two-rung bind (wave-3 kills AND regional scale), and behind it the full seat's w4/w5 distinct-fought bars (5/5/4/3/2 — 0/16, 0/8 r16). The lesser seat is within one rung (s66); the full seat needs the wave-4 engine to ever fire in sims.

## Reachability verdict

- National: REACHABLE on the courtship road (r16: 4/8; r13: 1/8 held 5d). UNREACHABLE on the survival/combat policy mix (0/16 — by policy construction, not by game impossibility).
- The table's lesser seat: within one rung (winseek s66, d50, regional — only w3 0/3 missing). The food-deed rung is policy-fillable (r13's feast instrument).
- The table's full seat / wave 4 / wave 5: UNREACHABLE in all measured runs — the wave-4 gate's two rungs never coincide.
- Arc IV / tableWaiting: 0/16 this suite (0/8 r16 gates-off; 3/8 r13 with the feast instrument).

## Village assessment (plain words)

The two policies live in different games. The competent villages live long (median 120d) and fight plenty (w1/w2/w3 distinct bars mostly met by d145) — but they never once propose a link, so the 150-day survivor dies a villager with a rich codex and zero standing. Its story reads full: raids from Emberhold, the Bloodied, Stonebridge; contest deaths with names; feasts and keepsakes. A complete life that never touched the scale ladder — the national bar doesn't even know it exists. The winseek villages live fast and court hard: bowing to Ashford or Emberhold by day 3, 6,000 kcal/week tribute walking out of the pantry, grain aid arriving unasked, factions splitting — one rung from the table's lesser seat at day 50 — then the monsters take them. The village that almost sat at the table is a real village story; so is the one that never tried. Villagers act like people throughout (sense-test: transcripts read as village life, not counters).

## Blanks

FILLED: table-approach instrument (seat telemetry + wave-ledger kill points + structured death causes + story capture; proof 19/19); the two-rung wave-4 bind quantified (0/16 meet both); national-scale numbers on the competent/winseek mix; national as milestone-not-failure-mode with r16/r13 numbers.
OPEN (appended to sim-findings.md):
- National hold-durations for r16 courtship seeds are unmeasured (r16's driver predates nationalHeldDays) — only r13's exact 5d hold is on record.
- Say-line story capture misses late-run death narration (winseek s66: 10 people deaths, zero death beats captured d27–50) — the registerDeath hook covers causes, the say regex is the gap. Instrument-only.
- r17 ARM 1's death-attribution instrument now covers player-kind deaths (57/57 attributed, byte-identical gameplay) — my recon's `person:combat`/`person:ambush` stream should be reconciled against ARM 1's player:true records before anyone builds on my deathKinds; my structured deaths may double-count what ARM 1 wires natively.
- The winseek collapse needs a succession-chain read: 11/16 runs had same-day double scholar deaths (ARM 1's finding). Whether the mantle should grant a repositioning beat is a design question (ARM 1's open item) — but for the scale wall it means the courtship road's early game is disproportionately lethal in a way no single-fight balance lever fixes.

## Convergence

scale-onramp stays the blocking axis. The wall's current measured face: the on-ramp is fight-selection + villager field survival (r16 B/C), and above national the bind is the wave-4 gate's two-rung bind plus the full seat's wave bars. `longsims-rotation.txt` untouched (standing directive). No lever played — diagnostic only.

## Telemetry note for coordinator

`evidence/2026-10-13/sim-scale-wall-r17-tablerecon.json` summary ≈ {national: 0/16, table: 0/16, wins: 0/16, exiled: 0/16}. Versus the seeded scale-wall.json baseline ({national:8, table:0, wins:0, exiled:0} from 2×8 courtship-road files): **national 8→0 will read LOUD — EXPLAINED, do not roll.** Different policy suite by design (the r1–r3 wall suite revived as the r17 shared baseline per the sibling claim file); competent/winseek never courted national. The baseline stays the courtship-road reference until the loop decides otherwise.
