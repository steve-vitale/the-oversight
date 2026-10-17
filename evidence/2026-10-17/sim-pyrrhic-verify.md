# sim-pyrrhic-verify — independent verification of the landed pyrrhic-kill fix (flesh-out loop, 2026-10-17)

**Run:** flesh-out loop, run_id fleshout-20261017T1815Z (coordinator-assigned arm sim-pyrrhic; axis scale-onramp blocking).
**Type:** VERIFY + MEASURE. The coordinator's brief assumed the a2 pyrrhic-kill blank (evidence/2026-10-17/sim-attrcensus.md) was still open. It was not: the fleshout-20261017T1223Z run already implemented, proved, measured, and landed the fix as commit 94f78198 ("sim-pyrrhic: pyrrhic-kill attribution fix"), with evidence/2026-10-17/sim-pyrrhic.md. This run independently re-verifies the landed work and re-measures on a different substrate.
**Canon:** docs/CANON.md read; docs/MONSTER-WAVES.md read (discovery channels; wave-ledger law; readiness gates). No new canon invented. Scope: verification only — zero src/js changes in this run; the only new files are scripts/sweep-pyrrhic-verify-20261017.js and this evidence file (+ per-seed JSONs).

## What was verified (not re-built)

1. **The fix exists in this tree** (94f78198 is an ancestor of HEAD): `recordPyrrhicKill(monsterId, killerVid, via, detail)` at src/js/game.js:29924 writes exactly three things — `state.villageSlain[mid]++`, codex BEASTS entry stage `'slain'` via ensureMonsterEntry, and the waveKillLog entry `{d, mid, w, by, via, trick}` (+ waveKillByChannel). It does NOT call scoreLedgerKill, does NOT touch `state.waveKills` counts / wave4Slain / checkWaveUnlockBeat / queueKillerTale / tbKillRewards. tbEnd's per-kill ledger gate is `won||routed||lost`, dispatching `'lost'` → recordPyrrhicKill, else → recordWaveKill (unchanged); the `_kills` lineage list below stays won/routed-only, so loot/carcass stay forfeit on 'lost' per the deliberate design.
2. **Proof test re-run:** `node scripts/test-pyrrhic-20261017.js` → **13/13 GREEN** in this run's tree (RED-pin documented in the 1223Z evidence; not re-broken here — the tree already carries the fix).
3. **Deed boundary re-verified by code inspection:** the only waveKillLog reader that feeds unlocks is the VETERANS bar in `waveCombatReadiness` (src/js/standing.js:268-283). Default behavior excludes dead killers (`!isLiving(e.by)` → skip; the pyrrhic scholar is dead by the time the mantle passes), and the wave filter (`w >= w-1`) excludes the observed pyrrhic cases (wave-1 mids vs wave-4 readiness). A living companion's pyrrhic kill counting as veteran experience is the designed meaning of the bar (survivors of combat). The steve-call boundary (scoreLedgerKill / wave-ledger deed points) is untouched — the proof test's BOUNDARY section pins this (scoreLedgerKill spy = 0, ledger points flat).
4. **scripts/test-pyrrhic.js (undated) NOT created:** the brief asked for it, but scripts/test-pyrrhic-20261017.js already proves the change (RED→GREEN 13/13) and follows the repo's dated-test convention. A second file would be pure duplication. Noted, not built.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE the sweep)

**Question:** does the landed fix recover pyrrhic trick kills (trick-bearing monster dies, scholar dies, result 'lost') into waveKillLog+trick, codex 'slain', villageSlain — on a substrate the 1223Z run did not measure (feastscale-only, no tribfloor)?

**PRIMARY (GO):** ≥2 pyrrhic trick kills recovered in waveKillLog on the ARMED corpus — 8 FRESH seeds (1911–1918; 0 per-seed filename hits across evidence/, verified) × {leadfeast, belongfeast} = 16 runs, 180d death-aware, pre-seat (SEATDRIVE=0 explicit; NODEWITNESS unset), FEASTSCALE_R13=1, TRIBFLOOR off (default-OFF layers stay off).

**CONTROL:** the same 16 seed×policy pairs run with the fix disabled at runtime (recordPyrrhicKill replaced by a no-op after loadGame, restored after — behaviorally identical to pristine: the tbEnd per-kill loop's only side effects are the record call; trickSummaryFor and tbSnakeLineageKey are pure reads; no RNG consumed). Control pyrrhic kills must show UNattributed, proving the blank is real without the fix.

**GUARDRAILS:** det-gate armed vs control on identical seeds — days, endReason, nTbFights, nPerf, wall metrics (national/table/won) compared; any divergence named with mechanism (expected channel per the 1223Z bisection: villageSlain → beasttricks teaching → counter discovery). No new death mode. Median survival within ±10d.

**§15 note:** scripts/balance-panel.js cannot execute this measurement — POLICY_REGISTRY has no leadfeast/belongfeast entry at the fix's base commit 94f78198^ (added later in 84687a33), so the panel's child mode throws "Unknown policy" against a pristine base. This paired sweep is the before/after instrument instead; the pre-registered PRIMARY is the judge (§15: "the panel is the instrument, the pre-registered threshold is the judge"). Coordinator follow-up: backport the registry entry as a tooling fix, or confirm the sweep suffices for attribution arms.

**Metric review (pre-written):** the 1223Z run proved the strict "byte-identical det-gate" reading is incompatible with the briefed villageSlain write — 1/8 seeds diverged via the designed beasttricks teaching channel (45d→96d, wall metrics identical). That divergence is the fix working as designed (MONSTER-WAVES.md discovery channel 2), not a failure. This run's guardrail is therefore read as: divergences reported with mechanism + wall guardrails, never hidden, never re-scored.

## Results — the 32-run paired sweep (evidence/2026-10-17/perseed-pyrrhic-verify/)

Substrate: FEASTSCALE_R13=1, TRIBFLOOR off, SEATDRIVE=0 explicit, 180d death-aware. 8 fresh seeds (1911–1918) × {leadfeast, belongfeast} × {armed, control} = 32 runs. Instrument: scripts/sweep-pyrrhic-verify-20261017.js (attrcensus fight capture + trickfunnel instrument; control = runtime recordPyrrhicKill no-op, behaviorally identical to pristine). Two service restarts mid-sweep; the resume logic (skip existing per-seed JSONs) recovered cleanly — all 32 runs completed, EXIT 0.

### PRIMARY: GO — 3/3 pyrrhic trick kills recovered on armed, 3/3 unattributed on control

| pyrrhic fight (armed) | waveKillLog entry | codex | villageSlain |
|---|---|---|---|
| belongfeast-s1911 seq24 d101 ducks_in_a_row/strike_nonhead (4 perfs), scholar ruth_goldstein died | {d:101, trick:'strike_nonhead×4', by:ruth_goldstein, via:'player'} | ducks_in_a_row 'slain' | 1 |
| belongfeast-s1913 seq4 d29 ducks_in_a_row/strike_nonhead (4 perfs), scholar gen_1xzyrow died | {d:29, trick:'strike_nonhead×4', by:gen_1xzyrow, via:'player'} | ducks_in_a_row 'slain' | 1 |
| belongfeast-s1916 seq18 d80 ducks_in_a_row/strike_nonhead (3 perfs), scholar mia_andersson died | {d:80, trick:'strike_nonhead×3', by:mia_andersson, via:'player'} | ducks_in_a_row 'slain' | 1 |

The 3 control twins show the identical fights with **zero** waveKillLog entries, codex 'observed', villageSlain 0 — the a2 path-drop reproduced on this substrate, and the fix closes it. **3 ≥ 2 → PRIMARY GO.**

Pooled classes on armed: b1/b2 distributions consistent with the attrcensus census (performer-died / target-fled dominate; the funnel's bottom remains fight shape, not wiring).

### GUARDRAIL det-gate: 15/16 pairs byte-identical; 1/16 diverged — mechanism named

- **15/16 pairs:** days, endReason, nTbFights, nPerf, national/table/won all identical. The belongfeast-s1911 pair is the textbook case: 155d/village-lost/41 fights both, wall metrics identical — the ONLY differences are the designed ledger entries (codex 'slain' vs 'observed', villageSlain 1 vs 0). Attribution-only confirmed.
- **leadfeast-s1913 DIVERGED** (nTbFights 53→44, nPerf 11→9; days 180=180, survived=survived, wall metrics 1/1/0 identical). Root-caused with scripts/diag-pyrrhic-diverge-20261017.js: **d56 'lost' fight, scholar gen_t8fv2ll died, TWO belltoads died, ZERO trick performances** — recordPyrrhicKill fired twice (villageSlain['belltoad']+2, codex 'slain', waveKillLog trick=null), unlocking the beasttricks teaching channel for belltoad on armed. The village learned the shout trick and subsequent fights resolved differently (fewer fights, same survival).
- **Key refinement of the 1223Z finding:** the teaching consequence is NOT limited to trick-bearing pyrrhic kills. The fix fires for EVERY dead monster on 'lost' — a non-trick kill teaches the village just as much. This sharpens the open steve-call subsidiary: is villageSlain-fed 'beasttricks' teaching from ANY lost-fight kill the intended generosity, or should the dead-scholar-tells-no-tales reading exclude it?
- **No new death mode** (both conditions: village-lost / survived only). **Median survival 180 vs 180** (within ±10d). Wall metrics pooled: national/table/won within noise (see below).

Per the pre-registered metric-review clause, the divergence is reported as a behavior change with named mechanism and passing wall guardrails — not hidden, not re-scored.

## Sense-testing (SENSE-TESTING LAW) — the d101 pyrrhic kill, verbatim

belongfeast-s1911, Ruth Goldstein vs Ducks in a Row (scripts/sense-pyrrhic-verify-20261017.js), the recovered fight:

> [d101] "⚔ DUCKS IN A ROW! You're on your own."
> [d101] (18 rounds of the line reforming; Ruth striking non-head segments — the "break the line" trick, 4 perfs)
> [d101] "🦆 The train drives over you — duck 2 bites as it passes! (3)"
> [d101] "You go down."
> [d101 sys] "OH. Oh no. ...The gamblers are very quiet."
> [d101] "📖 The Codex turns a page on its own. Ruth Goldstein is dead. You didn't ask. It knew."
> [d101] "Nobody's talking much. The fire feels smaller tonight."
> [d101] "🕯️ Ruth Goldstein is dead — combat. The village stops. Somebody screams. Somebody else starts digging."
> [d101] "'Ruth's gone.' Elena looks at you for a long moment. 'You're not Ruth.' No heat in it. Just fact. You'll have to earn this face."
> [d101] "🌟 'MANTLE TRANSFER DETECTED. ...Oh! New face! Same job! ... (That is a lie. We noticed. The audience CRIED.)'"

Ledger (same run): waveKillLog `{d:101, mid:'ducks_in_a_row', trick:'strike_nonhead×4', by:'ruth_goldstein'}`, codex 'slain', villageSlain 1.

**Judgment: mourning that teaches.** The 'lost' verdict is honored — no victory fanfare, the gamblers go quiet, the fire feels smaller, somebody digs. And the village watched Ruth break the line four times before the train took her; the codex 'slain' + trick attribution + villageSlain are diegetically earned. The bookkeeping doesn't contradict the grief — it IS the village learning from it. No narration change needed.

## Village assessment

16 villages on the pre-seat feastscale road (8 seeds × 2 policies), 180d death-aware: the corpus splits between survivors (180d, national 1/table 1 on several) and village-lost endings (d118–d178). The standout is belongfeast-s1911: Ruth Goldstein's pyrrhic line-break at d101 entered the ledger, and the village carried the trick forward. Villagers acted like people throughout the sense-read — the fire gossip ("barely the same story now... that's what fires do"), the mantle handoff ("You're not Ruth. No heat in it. Just fact."), the quiet grief ("Nobody's talking much. The fire feels smaller tonight."). Nothing robotic flagged. The fix changes no villager behavior directly; its only behavioral channel is the designed beasttricks teaching.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline …/telemetry-baselines/scale-wall.json --current 'evidence/2026-10-17/perseed-pyrrhic-verify/*-armed.json' --metrics national,table,wins,exiled` fired 1 LOUD line — EXPLAINED, baseline kept:
- wins 16→0: the recurring pre-seat LOUD class (SEATDRIVE=0 explicit; baseline is the full win-side stack). Same as the attrcensus and 1223Z pyrrhic runs. No bug.

## Wall numbers (this run, armed corpus 16 runs)

national **9/16**, table **16/16**, wins **0/16** (pre-seat by design); wave 4–5 unlocks 0; median survival 180d (9 survived to 180, 7 village-lost at d87–d178). Notably stronger than the 1223Z tribfloor substrate (3/8 national) — the feastscale-only road reaches national on a majority of seeds.

## Findings / named nexts

- **steve-call (still open, from the 1223Z run — SHARPENED by this run):** do pyrrhic kills grant wave-unlock deeds (scoreLedgerKill)? Subsidiary, now stronger: villageSlain-fed 'beasttricks' teaching fires for EVERY lost-fight kill, not just trick-bearing ones (leadfeast-s1913: 2 non-trick belltoad deaths → teaching → trajectory divergence). Is that the intended generosity, or should the dead-scholar-tells-no-tales reading exclude lost-fight kills from villageSlain?
- **Tooling gap (this run):** balance-panel.js cannot run leadfeast/belongfeast against the fix's pristine base (POLICY_REGISTRY entry added in 84687a33, after 94f78198). The paired sweep served as the before/after instrument. Coordinator: backport the registry entry as a tooling fix, or confirm the sweep suffices for attribution arms.
- **VETERANS-bar interaction (this run, verified by inspection):** pyrrhic waveKillLog entries are read by waveCombatReadiness's veterans bar (src/js/standing.js:268-283), but dead killers are excluded by default and the wave filter excludes the observed cases. No deed impact. Documented for the steve-call.
- **Infra note:** two service restarts mid-sweep wiped /tmp (AGENTS.md lesson re-confirmed); the resume logic (skip existing per-seed JSONs) recovered cleanly. Sweep logs now go to ~/workspace/, never /tmp.
