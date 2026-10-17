# sim-performretire — PERFORM-THEN-DISENGAGE on the trick-execution window (flesh-out loop POLICY LEVER, 2026-10-17)

**Run:** flesh-out loop, run_id (coordinator-assigned; worktree `sim-performretire`), axis scale-onramp (blocking).
**Type:** POLICY LEVER — new file scripts/policies/performretire.js ONLY (PERFORMRETIRE=1, default OFF). ZERO src/js, ZERO other scripts/policies changes.
**Canon:** docs/CANON.md read; docs/MONSTER-WAVES.md read (counter kinds + discovery channels; waves 3–5 deliberately counter-less — this arm's domain is wave-1/2 where tricks are wired). No new canon invented.
**Corpus read:** evidence/2026-10-17/sim-trickshape.md, sim-attrcensus.md, sim-trickroute.md.

## The lever (design)

**PERFORM-THEN-DISENGAGE.** After a trick performance REGISTERS in the fight — the engine's own per-species trick record, read through the landed tricktag channel's `trickSummaryFor(f, mid)` when present, else `f.trickLogByMid` — the scholar stops pressing the attack and disengages via the REAL flee/disengage verb (`Game.tbBarrierExit`, the deliberate barrier push, no coin flip — the same verb the base policy's flee uses) instead of standing in for the kill. This leans INTO the measured fight shape (trickshape: "tricks convert losses into flights; perf→attr gap = kill-attribution blindness to trick-driven disengagement") to cut the 49% performer-died gap (attrcensus b1).

This is a DIFFERENT shape from the two killed predecessor arms — do NOT rebuild them:
- sim-tricksurvive (KILLED): party assembly + companion finisher (the yield poisoned the scholar's kill engine).
- sim-perfsurvive (KILLED): companion screening (the screen shrank the performance pool 24% — survival improved, attr fell).
- This arm adds NO companion machinery, NO yield, NO change to the scholar's strike flow. It banks a performance the scholar already landed, then walks out.

**Guards:**
- never before round 2 (f.round >= 2) — the base's turn-1 outmatched walk-away already had its turn;
- the base's turn-1 outmatched walk-away and 0.35 eject stay authoritative: below 35% HP the retire does NOT fire (the base ejects — this never rescues); on the fight's first player turn it does NOT fire;
- an engaged companion with an overmatch cancels the retire. Operationalization (documented: "overmatch" is not an engine concept — zero grep hits in src/js): an engaged (alive, not fled) companion fighter is present AND party effective HP (scholar maxHp + companions') >= 2.5x monster effective maxHp — the base's turn-1 outmatched bar (totalMhp > 2.5 * pmax, competent.js) mirrored. The party is winning; the scholar stays;
- <=1 retire per fight (ctx._prFight).

**Flee mechanics:** nearest-edge walk (tbPlayerMove refuses over-budget paths honestly) then `Game.tbBarrierExit` push; grid edge via `Game.tbGridMax()` (titan 12x12); `markRecover` bookkeeping after a push (the base's recover-and-return precedent, imported from competent.js).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE the pilot sweep)

**Question:** does retiring after a registered trick performance cut performer deaths in performed-trick fights vs the base feast policies on identical seeds?

**PRIMARY:** performer combat deaths in performed-trick fights — TB fights with `f.trickLogByMid` non-empty at tbEnd where fighter 'p' is NOT alive at tbEnd. (Operationalization of "trick-bearing fights": the lever's contact surface is performed fights — it fires only after a performance registers; deaths in non-performed trick-bearing fights cannot be touched by the layer. This choice is made here, before the pilot, and the broader deaths are reported descriptively for transparency.)
**GO: (armed performerDeaths) − (control performerDeaths) ≤ −3 across the 16-run pilot.**
**KILL:** miss → delete scripts/policies/performretire.js zero-trace per kill protocol; keep instruments + evidence.

**SECONDARY (direction check, NOT binding):** routed-via-trick fight rate — performed fights ending `result='routed'` — armed ≥ control.

**Pre-pilot metric-design note (written before results):** reading `tbBarrierExit` end-to-end shows a successful barrier push ends the fight as `tbEnd('fled')` when nothing follows (non-chasers, gave-up chasers, Haven reached) — the fight continues on the new node only while chasers persist. So the retire's disengage produces `result='fled'` (player flight), NOT `result='routed'` (monster disengagement — the trickroute class). The pre-registered secondary (routed rate) is therefore mis-aimed at the lever's actual outcome class; the honest direction check is the performed-fight **'fled' rate**. Both will be reported; the routed-rate secondary stays as pre-registered (it is not binding), and this note stands as the §14 metric-review entry: if the routed secondary reads flat while the fled rate moves, that is the metric being wrong, not the lever. Proposed revision for the NEXT run: secondary = performed-fight fled rate (armed ≥ control).

**GUARDRAILS:** kill-attributed trick kills ≥ control−2; national ≥ control−2 (per 8-seed set); median survival ≥ control−10d; no new death mode (death-cause key sets compared); det-gate byte-identical (proof).

**Horizon:** 180d death-aware (dead villages stop; the trick game plays out across the whole run — wave-1/2 contacts happen all game).
**Seeds:** 8 FRESH [9941–9948] × {leadfeast, belongfeast} = 16 runs per side (32 total). FRESH = 0 per-seed filename hits across evidence/ (verified 2026-10-17 before the run).
**Policies:** leadfeast/belongfeast × control/armed. **Substrate:** SEATDRIVE=0 EXPLICIT, FEASTSCALE_R13=1 (pre-seat by design — the same substrate as the funnel corpus).

Per-seed JSONs: evidence/2026-10-17/perseed-performretire/ with canonical wall keys national/table/wins/exiled (finding #482).

**Sweep note:** the pilot was launched once, then restarted after 1 run when the `tbBarrierExit` read showed the retire's outcome class is `fled` — the sweep now records both `routedViaTrick` (pre-registered secondary) and `fledViaTrick` (honest direction check) per performed fight. The 1 completed run's per-seed file was discarded before the restart; all 32 runs are fresh.

### §14b pre-pilot substrate checklist

1. **Contact:** the trickfunnel census measured the phenomenon on this exact substrate class (pre-seat, leadfeast/belongfeast): 307 trick-bearing contacts, 98 performances, 56 attributed; attrcensus classified ~49% of the gap as performer-died. The retire's trigger (a registered performance) is the funnel's own per-species record.
2. **Pool sizing:** the addressable pool is ~27 performer-died fights per 16 runs (attrcensus b1 rate); the GO bar (−3) is ~11% of the b1 pool — reachable without assuming a miracle, honest (not a coin-flip threshold).
3. **Verb existence:** all verbs are the engine's own — trickSummaryFor/trickLogByMid (the landed channel), tbBarrierExit (the real flee), tbAfterPlayerAction, tbGridMax. The proof observes tbBarrierExit firing on a real startCombat fight.
4. **Horizon fit:** wave-1/2 trick fights happen from day 1; 180d death-aware contains the phenomenon with room.

## Proof: scripts/test-performretire-20261017.js

**22/22 GREEN** (run 2026-10-17, against the committed layer; see the v1→v2 note below):

**v1→v2 note:** after the pilot launched, the layer got one precision fix: `performRetirePlay` now returns false (no turn spent, no retire marked) when `retireDisengage` itself fails, instead of spending the turn anyway. The delta is confined to the internal-exception path (all inner calls are guarded; the proof never hit it). The pilot measured v1; the proof will be re-run against v2 before commit; the behavioral surface is identical outside the exception path.

- **RED (gate OFF):** unit reads (trickPerfSummary: empty → none, injected entry → one perf summary via the landed `trickSummaryFor(f, mid)` channel, agreeing with the raw channel; redactor confirmed wave 3); no retire despite a registered performance + round>=2 (pure delegation, structural); det-gate byte-identical trajectories (gate-off performretire-lead vs leadfeast, gate-off performretire-belong vs belongfeast, s204 60d) + gate-on deterministic.
- **GREEN (gate ON):** real `startCombat('hushwolf')` fight, injected engine-channel performance + round>=2 + healthy scholar → retire fires exactly once, the fight is marked (≤1/fight), the banked performance is logged (`hushwolf:strike_lead`), the REAL flee verb observed (`Game.tbBarrierExit` called once), the scholar crossed the barrier (map 4,4→3,4 — the chaser followed honestly, monster moved (4,4)→(3,4) on the new node), the turn honestly spent (round 2→3, monster acted during the advance). Guards: round 1 → silent; no registered performance → silent; hpPct<0.35 → silent (base eject keeps its turn); engaged companion with overmatch (100k-HP companion vs hushwolf) → silent; second turn on the same fight → silent (≤1 retire). Mid-grid scholar → retire fires, walks toward the edge, turn spent (push lands when the edge is reached).
- **SMOKE:** 20d pre-seat run with PERFORMRETIRE=1 completes.
- **Proof-found design notes (not bugs):** (a) the disengage is the PUSH, not the fight end — a relentless chaser (hushwolf) follows through the barrier and the fight continues on the new node; the retire banks the exit attempt, not the escape. (b) After `tbAfterPlayerAction()` the turn cycles back to the scholar in the sync harness — the observable for "turn spent" is the round number advancing, not `p.acted`/`turnIdx` (the WAIT DOUBLE-ADVANCE lesson's mirror: `tbBeginTurn` resets `acted` on the fresh turn).

## Results — PILOT: NO-GO (KILL)

32/32 runs finished (16 control + 16 armed, 180d death-aware, 0 dropped runs). Per-seed JSONs: evidence/2026-10-17/perseed-performretire/. Sweep summary: evidence/2026-10-17/sim-performretire-pilot.json. Paired diffs: scripts/analyze-performretire-20261017.js.

### PRIMARY verdict

| metric | control (16) | armed (16) | diff | bar | verdict |
|---|---|---|---|---|---|
| performer deaths in performed-trick fights | 11 | 18 | **+7** | ≤ −3 | **NO-GO** |

Paired per-seed performer-death diffs (armed−control): +0, +2, +0, +1, +3, +0, −1, +0, +0, +4, +0, −1, −2, +2, −1, +0 → 3 negative, 4 positive, 9 zero, sum **+7**. The retire did not cut performer deaths — it added them.

### Secondary + guardrails

| metric | control | armed | bar | verdict |
|---|---|---|---|---|
| routed-via-trick rate (pre-reg secondary) | 0.1953 | 0.2047 | ≥ control (direction) | direction OK (+0.0094), not binding |
| fled rate (honest direction check) | 0.0000 | 0.1024 | ≥ control (direction) | direction OK (+0.1024) — the mechanism fired |
| kill-attributed trick kills | 126 | 86 | ≥ control−2 | **FAIL (−40)** |
| national (per 8-seed set) | 8 | 9 | ≥ control−2 | PASS |
| median survival | 180d | 168d | ≥ control−10d | **FAIL (−12d)** |
| village-lost | 8 | 10 | — | — |
| new death mode | — | — | none | PASS (armed causes ⊆ {combat, contest, dehydration, starvation, the night}; control additionally sampled lockjaw/sickness — rare-cause sampling, not a new mode) |

### Mechanism

- retires fired (armed): **83** across 16 runs (5.2/run). The layer had real contact.
- performed fights: 128 control vs 127 armed (−1 — the pool did not shrink; unlike the companion arms, the retire doesn't displace performances).
- performed-fight outcomes: fled 0→13 (the retire's outcome class), routed 25→26, won implied 92→70. **attr 126→86 (−40).**
- scholar deaths (all): 108→121 (+13); scholar combat deaths 92→108 (+16); villager deaths 172→179 (+7).

### The mechanism of the kill (why the retire backfires)

The retire trades the scholar's strike turn for a disengage — and the disengage usually doesn't end the fight:

1. **Chasers follow.** `tbBarrierExit` only ends the fight (`tbEnd('fled')`) when nothing can follow; chasers (hushwolf and company — most of the trick-bearing roster) continue the pursuit on the new node. The scholar spent their post-performance turn walking instead of striking, and the fight continues with the scholar a turn down. The kill window the performance opened (e.g. strike_windup's 100%-won interrupt) is abandoned.
2. **Sealed fights eat the push.** The layer never checked `f.noFlee`/arenaContest — in a sealed fight the barrier push is *consumed* with no effect ("the barrier holds"), the turn is spent, and the scholar is stuck having wasted the turn that could have played the actual counter.
3. **Attr collapses because the scholar stops pressing.** Performed fights that the base would have won (92 implied wins) become flights (13) or continued fights the scholar then loses — attr −40 across nearly every paired seed.

The funnel's bottom is not purchasable with disengagement either: this is the THIRD falsification on the trick-execution axis (tricksurvive's yield, perfsurvive's screen, now performretire's retire) — each time, interrupting the scholar's own strike flow costs more than the survival/disengage shape buys.

### Wall numbers (context — pre-seat by design)

national 17/32, table 28/32, wins 0/32 (pre-seat by design), wave4 0/32, wave5 0/32, median survival 174d pooled (armed 168 / control 180). The scale wall stands: no national movement attributable to the arm (national +1 is seed noise; the arm doesn't touch scale).

### Sense-testing (3 perform-then-disengage fights)

Beats: evidence/2026-10-17/performretire-beats/performretire-lead-s9945.json (re-run of the pilot seed; retire events marked @@RETIRE@@).

**Read 1 — the retire working as designed (d18, hushwolf/strike_lead, routed, scholar alive, 3 rounds):** "The lead staggers — and the pack's silence shatters into yips and snarls. Coordination broken. (WOUND THE LEAD: it worked.)" → "You STRIKE the wolf for 46" → @@RETIRE@@ push at round 2 → "🚪 BARRIER CROSSED — you crash through to a new area, but they're right behind you — through the barrier!" → "The Hushpuppy is gaining on you." → "Wolf's Harass hits you for 6." → "The Hushpuppy breaks and runs!" The scholar banks the pack-breaking performance, walks out, the pack breaks. Coherent — this is the shape the lever wanted.

**Read 2 — the retire killing the scholar (d82, moderator/wait, lost, scholar dead, 10 rounds):** "You hold still, watching." (the wait performance) → @@RETIRE@@ push at round 2 → "🚪 You hurl yourself at the edge — the barrier holds. **Sealed: no one leaves until this is decided.**" The push is consumed; the turn is spent. Then the mute grinds: "🔇 MOVE MUTED inside the suppression field... vary your verbs, or step out of the purple" → "🚫 MOVE IS MUTED... Your feet refuse the order — flagged as a violation. (PRIOR VIOLATIONS: 1... 2... 3 — its Notices hit +3/+6/+9 harder.)" → "Moderator's Content Noted hits you for 12... 18... 20." → "You go down." The retire wasted the one turn that could have played the real counter ("STRIKE or WAIT to flip the mute, then move"). The layer's missing sealed-fight check is visible here — but it is one death mode of a falsified theory, not a fix that would save the arm.

**Read 3 — the clean flight, twice (d172, belltoad/shout ×2, fled, scholar alive):** "You cup your hands and BELLOW — raw noise, no words, all lungs." / "The Choir Toad flinches — its note dies mid-croak." → @@RETIRE@@ push at round 3 → "🚪 BARRIER CROSSED — you crash through to a new area. The pursuit falters behind you — they give up the chase. (You fled the fight by leaving the area.)" Then a second choir toad, same shape, same clean flight. When nothing follows, the retire is exactly right — bank the shout, walk out untouched.

Verdict from the reads: the retire reads as designed in the fiction in all three — and still kills in aggregate, because the fights where it works (non-chasers) are the fights the scholar was already surviving, while the fights where it's needed (chasers, sealed) are where the spent turn costs a life.

### Metric review

- **The PRIMARY bound the run and missed unambiguously** (+7 against a ≤−3 bar; 10/16 paired diffs non-negative). No re-scoring: the fled-rate direction (+0.1024) is reported honestly as a mechanism check, and the verdict stays KILL. The theory "bank the performance, walk out" is falsified on this substrate.
- **The pre-registered secondary (routed rate) was mis-aimed** as documented in the pre-pilot metric-design note: the retire's outcome class is `fled`, not `routed`. The fled rate (+0.1024, armed ≥ control) is the honest direction check — the mechanism fired, the outcome didn't convert to survival. Proposed revision for the NEXT run (not this one): any future disengage lever pre-registers the fled rate as its secondary.
- **Guardrail honesty:** attr −40 and median-days −12 are real negatives, not noisy nulls (attr negative in 13/16 paired diffs). The arm is not just ineffective but harmful — the kill is load-bearing, not marginal.
- **No metric revision proposed for the PRIMARY** — performer deaths in performed fights is the right population (the lever's contact surface); the bar (−3 on ~11 control) was well-sized and reachable in principle.

### Village assessment (plain words)

**What the villages looked like.** The armed villages look like villages whose scholars learned to walk away — 83 times across 16 runs, the scholar performed a trick and then headed for the barrier instead of pressing. Thirteen of those walks ended clean (the belltoad flights, the pack-breaks). But the walks that mattered — the chasers, the sealed rooms — ended with the scholar a turn poorer and often dead: 18 performer deaths vs 11 on control, 16 more scholar combat deaths overall, villages lost 10 vs 8.

**Who thrived.** No one, on net. National 9 vs 8 is noise; the table 14 vs 14 flat.

**Who died and why.** The scholars died more (121 vs 108 deaths) — not because the retire never fired (it fired 83 times) but because of what it replaced: the strike after the performance. The attrcensus b1 gap (performer died) is real, but the deaths happen in fights where the scholar is already losing the race — spending the turn on a walk instead of a strike doesn't change the race, it just moves it to the next node. And the kills the village used to get (126 trick-attributed) fell to 86 — the retire converts the village's trick game from kills into flights, and flights don't fill the ledger.

**What was missing.** Not the disengage verb (it's real), not the performance record (it's the engine's own), not contact (83 retires). What's missing is what the funnel corpus already said: tricks are debuffs/openers, not finishers — and neither walking away after the opener nor standing in for the kill changes who wins the damage race. The binding constraint on the b1 deaths is the race itself, which this lever never touches.

**Which blank was filled.** The measurement: a paired 32-run pilot proving that perform-then-disengage (a) fires honestly through the real flee verb, (b) produces flights (+13 fled), but (c) increases performer deaths (+7) and collapses trick-attributed kills (−40). The theory is falsified a third time, via a third mechanism — and the sense-reads show exactly why (chaser pursuit, sealed rooms, the spent turn).

## Blank-fill record

- FILLED (instrument): perform-then-disengage pilot with paired before/after on identical seeds — the performed-fight death instrument (tbEnd wrapper: trickLogByMid non-empty × fighter 'p' dead) plus the retire counter (ctx.prRetires) and the fled/routed split; per-seed JSONs carry canonical wall keys (finding #482).
- FILLED (measurement): 32-run pilot, PRIMARY NO-GO (+7 vs ≤−3 bar); guardrails attr FAIL (−40), median-days FAIL (−12d), national PASS, no-new-death-mode PASS; 83 retires of mechanism contact; paired diffs via scripts/analyze-performretire-20261017.js.
- FILLED (sense): 3 transcript reads — the working retire (hushwolf pack-break), the killing retire (moderator sealed room), the clean flight (belltoad ×2).
- FILLED (metric-design): the pre-pilot note that the retire's outcome class is `fled` not `routed` — the honest secondary for any future disengage lever.
- KILLED (zero-trace): the performretire policy layer. The theory "bank the performance, walk out" is falsified — the third falsification on the trick-execution axis after tricksurvive (yield) and perfsurvive (screen).
- DOCUMENTED (not fixed): the layer's missing sealed-fight check (f.noFlee/arenaContest) — one death mode of a falsified theory, not a rescue.

## Convergence state

scale-onramp: **killed-at-pilot** (this arm). The trick-execution window is now 0-for-3 on survival-shaped levers (yield / screen / retire) — the funnel's bottom is not purchasable with survival or disengagement. The axis stays open; the named nexts remain the attrcensus a2 pyrrhic-ledger fix (pending Steve's deed ruling) and the b2 dismissal shape — not the scholar's strike flow.
