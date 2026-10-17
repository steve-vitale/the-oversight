# sim-pyrrhic — the pyrrhic-kill attribution fix (flesh-out loop, 2026-10-17)

**Run:** flesh-out loop, run_id fleshout-20261017T1223Z (coordinator-assigned arm sim-pyrrhic; axis scale-onramp blocking).
**Type:** FIX + MEASUREMENT. Named fix from evidence/2026-10-17/sim-attrcensus.md (the a2 path-drop).
**Canon:** docs/CANON.md read; docs/MONSTER-WAVES.md read (discovery channels §: 1. perform the trick, 2. told at Haven via villageSlain/beasttricks, 3. codex hint on slaying). No new canon invented. Work scoped to src/js/game.js tbEnd per-kill ledger ONLY (sibling loop B owns game.js this run — read-only elsewhere).
**Lane note:** the attrcensus arm's LANE CONSTRAINT (loop B owns game.js) applied to THAT run. This arm's brief explicitly assigns the game.js tbEnd fix; loop-B's commits (mergereval/phantomfood/capdoor/prosefix) are all landed in the base.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE the fix)

**Question:** does extending tbEnd's per-kill ledger to 'lost' attribute pyrrhic kills (trick-bearing monster dies, scholar dies, result 'lost') without touching deeds or loot?

**PRIMARY (GO):** 100% of pyrrhic fights attributed on re-sweep — the 3 known cases MUST now carry waveKillLog + trickSummaryFor + codex 'slain' + villageSlain:
- belongfeast-s1811 seq42 d147 belltoad/shout
- belongfeast-s1812 seq3 d21 gallowdeer/move_windup
- leadfeast-s1812 seq23 d90 gallowdeer/move_windup
PLUS a fresh 8-run re-sweep (fresh seeds 1809–1812 × {leadfeast, belongfeast}, tribfloor policies, FEASTSCALE_R13=1, TRIBFLOOR=1, SEATDRIVE=0 explicit, 180d death-aware) with **0 unattributed pyrrhic kills**.
- Proof test scripts/test-pyrrhic-20261017.js RED-pinned (fails on pristine game.js, passes with the fix) and GREEN.

**GUARDRAIL:** det-gate byte-identical on identical seeds (claim: attribution-only, no behavior change). If trajectories DIVERGE: report as behavior-change with wall-metric guardrails (national/table within noise of control, no new death mode), name the divergence mechanism. Never hidden, never re-scored.

**HARD BOUNDARY (steve-call, out of scope):** do pyrrhic kills grant wave-unlock deeds (scoreLedgerKill)? NOT called, NOT touched — pending Steve's ruling. Loot/carcass stay forfeit on 'lost' (deliberate design, tbKillRewards never reached).

## The fix (src/js/game.js, +2 hunks)

1. **tbEnd ledger gate** (was `won||routed`, now `won||routed||lost`): the per-kill loop (lineage-deduped, TRICKTAG killer resolution, trickSummaryFor — all unchanged) dispatches per result: `'lost'` → new `recordPyrrhicKill(...)`, else → `recordWaveKill(...)` (unchanged). The `_kills` lineage list below stays won/routed-only → tbKillRewards never fires on 'lost' → loot/carcass forfeit preserved.
2. **New `recordPyrrhicKill(monsterId, killerVid, via, detail)`** — writes EXACTLY the three named things:
   - `state.villageSlain[monsterId]++` (the villageSlain teaching channel — same as recordWaveKill),
   - codex entry stage `'slain'` via ensureMonsterEntry (BEASTS entry + counter hint surface),
   - waveKillLog entry `{d, mid, w, by, via, trick}` (+ `waveKillByChannel` counter), same `_attrKills` gate and 1000-cap as recordWaveKill.
   
   **Deliberately NOT written:** scoreLedgerKill (deed path — steve-call), `state.waveKills` counts, `wave4Slain`, `checkWaveUnlockBeat`, `queueKillerTale`, tbKillRewards. Grep-verified: no deed path touched (`scoreLedgerKill` appears in the new code only inside comments).

## Proof: scripts/test-pyrrhic-20261017.js — RED→GREEN 13/13

- **RED (pristine, verified before the fix):** 7/13 fail — no waveKillLog entry, no trick, no codex 'slain', no villageSlain on synthetic tbEnd('lost') with a dead trick-bearing belltoad. Boundary + routed-control assertions passed on pristine too (proving the pin is specific).
- **GREEN (with fix):** 13/13 — waveKillLog entry `{mid:'belltoad', trick:'shout,shout,shout', by:<fallen scholar>, via:'player', w:1}`, codex belltoad 'slain', villageSlain +1. **Boundary:** scoreLedgerKill spy = 0 calls, tbKillRewards spy = 0 calls, wave-1 ledger points flat. **Routed-ctrl:** tbEnd('routed') still routes through recordWaveKill (ledger points scored, codex 'slain') — won/routed untouched.
- `node scripts/check.js --quick`: 96 passed, 1 failed — the failure is scripts/test-sprites-valid-20261014.js (dustboar/sunback/sweeps_week/cliffhanger sprites), which loads ONLY sprites.js+godhood.js in a vm context and never touches game.js: pre-existing sibling drift on the hot tree, unrelated to this arm, left for its owner.

## Results — the 8-run re-sweep (evidence/2026-10-17/perseed-pyrrhic/)

Substrate identical to the attrcensus re-sweep. Per-seed JSONs carry fights, classCounts, pyrrhicFixed rows, codexStages, villageSlain, wall metrics, and the in-sweep detGate vs the attrcensus control.

### PRIMARY: GO

All 3 known cases now carry the full attribution (waveKillLog + trick, codex 'slain', villageSlain ≥ 1):

| case | waveKillLog entry | codex | villageSlain |
|---|---|---|---|
| belongfeast-s1811 seq42 d147 belltoad/shout (3 perfs) | {d:147, trick:'shout,shout,shout', by:thabo_maseko, via:'player'} | belltoad 'slain' | 1 |
| belongfeast-s1812 seq3 d21 gallowdeer/move_windup (1 perf) | {d:21, trick:'move_windup', by:gen_nzsgk48, via:'player'} | gallowdeer 'slain' | 3 |
| leadfeast-s1812 seq23 d90 gallowdeer/move_windup (1 perf) | {d:90, trick:'move_windup', by:gen_y71rxx3, via:'player'} | gallowdeer 'slain' | 1 |

**0 unattributed pyrrhic kills** across the re-sweep (nPyrrhicUnattr = 0/8 runs; pristine control = 3). Pooled classes: b1=12, b2=22 — identical to the attrcensus re-sweep; the only movement is the 3 a2 rows → attributed.

### GUARDRAIL: 7/8 byte-identical, 1/8 DIVERGED — mechanism named (not hidden)

Same-base det-gate (fixed vs pristine game.js at this run's HEAD, identical seeds — scripts/analyze-pyrrhic-20261017.js, 175 pass / 5 fail, all 5 on ONE seed):

- **7/8 seeds:** days, endReason, nTbFights, nPerf, nUnattr, wall metrics, and every unattr fight row field-identical. Attribution-only confirmed.
- **leadfeast-s1809 DIVERGED** (deterministic — reproduced 3×): pristine 45d/village-lost/5 fights → fixed 96d/village-lost/15 fights. First 3 fights identical (d13 gallowdeer lost, d26 belltoad lost w/ 1 dead, d28 gallowdeer lost); fork after.
- **Root cause (bisected, scripts/bisect-pyrrhic-20261017.js):** of the fix's three state writes, ONLY `villageSlain` moves the trajectory (wkl-only → 45d, codex-only → 45d, slain-only → 96d, none → 45d).
- **Mechanism, end to end:** d26 pyrrhic belltoad kill → `villageSlain['belltoad']=1` → `counterTeachable()` returns 'belltoad' → the competent-policy evening routine ("a curious player asks when the village knows something" — scripts/policies/competent.js:2471, inherited by leadfeast/belongfeast) fires `askAbout(vid,'beasttricks')` → villager teaches → `discoverMonsterCounter('belltoad','taught')` → `monsterCounters.belltoad=true` + journal "Counter: Break the chorus…" → the scholar/village know the shout trick → subsequent fights resolve differently. **This is the fix working as designed** — MONSTER-WAVES.md discovery channel 2 ("TOLD AT HAVEN — the village learns together… villager experiences count — Steve 2026-10-10"). The village watched Clarence take the deer down at the feast-fire's edge; the fire now has a theory. The steve-call boundary (deeds) is untouched: no scoreLedgerKill, no ledger points, no wave unlocks from the pyrrhic kill itself.
- **Wall-metric guardrails on the divergent seed:** national 0→0, table 0→0, won 0→0 (identical); death mode village-lost both (no new death mode); survival 45→96 (better, not worse — the village learned and lived longer). Pooled 8-run wall metrics: national 3, table 6, won 0 — IDENTICAL fixed vs pristine control.

Per the pre-registered guardrail clause this is reported as a **behavior change with named mechanism and passing wall guardrails**, not a silent pass and not a NO-GO: the PRIMARY is met, and the divergence is the fix's intended knowledge consequence (the village learning is the point of the fix), confined to the designed teaching channel.

### Det-gate footnote (base drift, documented)

The sweep's in-script detGate vs perseed-attrcensus (pristine) PASSED 7/8 and FAILED leadfeast-s1809 — but that control is base-mismatched: four loop-B commits landed on src/js/game.js between the attrcensus re-sweep and this run's base (sim-mergereval-b, sim-phantomfood-b, sim-capdoor-b, sim-prosefix-b — food-economy mechanics). The authoritative gate is the same-base fixed-vs-pristine comparison above (scripts/analyze-pyrrhic-20261017.js), which isolates the fix. On leadfeast-s1809 the attrcensus control (45d) matches THIS run's pristine control (45d) — the base drift did not touch that seed; the fix did, via the mechanism above.

## Sense-testing (SENSE-TESTING LAW) — the d21 pyrrhic kill, verbatim

belongfeast-s1812, Clarence Wang vs the Highbeam Deer at the feast-fire's edge (scripts/sense-pyrrhic-20261017.js):

> [d21] "🌙 The cookfire's smell carried further than the laughter did — smoke and grease on the night wind. Highbeam Deer is circling the edge of the light. It followed the feast here."
> [d21] "The Highbeam Deer falls."
> [d21] "You cut it down — but the light was already in its eyes. Highbeam Deer's death throes loose the beam."
> [d21] "Highbeam Deer's Ocular Discharge hits you for 76."
> [d21] "You go down."
> [d21 sys] "OH. Oh no. ...The gamblers are very quiet."
> [d21] "📖 The Codex turns a page on its own. Clarence Wang is dead. You didn't ask. It knew."
> [d21] "🕯️ Clarence Wang is dead — combat. The village stops. Somebody screams. Somebody else starts digging."
> [d21] "🌟 "MANTLE TRANSFER DETECTED. ...Oh! New face! Same job! ... The audience CRIED."
> [d21] "📖 The Codex turns a page: Clarence Wang, 21 days. The mantle passes to Ruben Luna."

**Judgment: coherent.** The mutual kill reads as one event — "The Highbeam Deer falls" and "You go down" in the same breath, the death-throes beam (the documented DOUBLE-KO shape) doing the killing. The 'lost' verdict is honored in fiction: no victory fanfare, the gamblers go quiet, the village grieves, the mantle passes with the "You're not Clarence" beat. Nothing in the narration contradicts the silent ledger learning — the kill happened in front of the whole feast ("Face it while the feast is in you"), so the codex 'slain' + villageSlain + trick attribution are diegetically earned: the village watched him take it down with him. No narration change needed — the fix is bookkeeping, and the bookkeeping matches the fiction. **No [needs-eyes]:** attribution-only, no feel/combat/UI change.

## Metric review (§14)

- The PRIMARY (pyrrhic attribution completeness) is met as pre-registered: 3/3 known cases + 0 unattributed across the re-sweep — GO.
- The GUARDRAIL (byte-identical det-gate) missed on 1/8 seeds. Per the pre-registered divergence clause this is reported as a behavior change with mechanism + wall guardrails — NOT re-scored against a friendlier metric, NOT hidden. If the reviewer judges that villageSlain-fed teaching from pyrrhic kills is too generous (the dead-scholar-tells-no-tales reading), that belongs in the steve-call alongside the deeds question — the fix as scoped implements the brief's named three artifacts, and the teaching consequence is Steve's designed channel-2 loop.
- The in-sweep detGate vs perseed-attrcensus is superseded by the same-base comparison (base drift documented above); the JSONs retain both.

## Village assessment

Eight villages on the pre-seat courtship road, 180d death-aware: 4 survived to 178–180d, 4 lost (d45/d77/d96/d129/d178). National 3/8, table 6/8, wins 0/8 (pre-seat by design — the seat driver is off). The standout is leadfeast-s1809: the village that learned the belltoad's shout from a pyrrhic kill lived to day 96 instead of dying at 45 — the first measured case of a pyrrhic kill's knowledge paying survival rent. Villagers acted like people throughout the sense-read: the feast grief ("somebody's seat is empty, and everybody sees it"), the mantle handoff ("You're not Clarence. No heat in it. Just fact."), Emberhold's unannounced aid walk-in. Nothing robotic flagged.

## Telemetry deviation check

`telemetry-check.js --baseline …/scale-wall.json --current 'evidence/2026-10-17/perseed-pyrrhic/*.json' --metrics national,table,wins,exiled` fired 3 LOUD lines — all EXPLAINED, baseline kept:
- wins 16→0, national 12→3, table 16→6: the recurring pre-seat LOUD class (SEATDRIVE=0 explicit; baseline is the full win-side stack). Identical to the attrcensus re-sweep's own numbers (3/8 national, 6/8 table, 0/8 wins) — zero deviation from the immediate predecessor on the same substrate.

## Wall numbers (this run)

national 3/8, table 6/8, wins 0/8; wave 4–5 unlocks 0; median survival: 4 survived to 178–180d, losses at d45/d77/d96/d129/d178.

## Findings / named nexts

- **steve-call (open):** do pyrrhic kills grant wave-unlock deeds (scoreLedgerKill)? The attribution half is fixed; the deed half awaits his ruling. Subsidiary for the same call: is villageSlain-fed 'beasttricks' teaching from a pyrrhic kill the intended generosity, or should the dead-scholar-tells-no-tales reading exclude it? (This run's evidence: the teaching saved a village — 45d→96d.)
- Filed pattern for future arms: the same-base pristine-control procedure (patch → checkout → sweep → re-apply) is the honest det-gate on this hot tree; cross-run controls drift within hours.
- scripts/test-sprites-valid-20261014.js fails on sprite drift (dustboar/sunback/sweeps_week/cliffhanger) — not this arm's scope; flagging for the sprite owner.
