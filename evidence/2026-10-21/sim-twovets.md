# sim-twovets-r2 — evidence (flesh-out loop, run fleshout-20261021T0730Z, axis scale-onramp)

Backlog #747: every wave-5 bar-fill measured so far is HYBRID (1 staged-companion kill + 1 scholar kill). Can villagers fill BOTH veteran slots alone? Re-derives the dead 0515Z run's sim-twovets arm (design + pre-registration survive; its code was uncommitted and lost with its tree). Base: master 9c634ebac (landed vgearconfirm VGEAR=1 layer + killdisc v2 instrument + heraldmuster kill).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15)
**PRIMARY:** per-seed count of seeds where (distinct villagers with wave-4 kills >= 2) AND (scholar wave-4 kills = 0). Seed counts if EITHER policy config reaches it. Villager kill = waveKillLog entry w=4, by != scholarVid, by != 'player'; scholar kill = by == scholarVid or by == 'player'. ATTRIBUTION REFINEMENT (diag-bearer, this run): scholarVid is read KILL-TIME (bearer on the kill's day), not end-of-run — succession churn otherwise misattributes villager kills as scholar kills (s64712 d74 "scholar" kill was by a companion; the killer only became scholar at d87). This is the honest reading of the brief's line (the scholar is a role, not a person — village-as-protagonist), not a metric change.
**GO:** >= 2/8 armed seeds AND armed seeds >= control seeds + 2. Miss = NO-GO, never re-scored (§14).
**Horizon:** 180d death-aware (+10d tail max). **Seeds:** 8 FRESH seeds 64841–64848 (verified unused 2026-10-21) × {leadfeast, belongfeast} × {control, TWOVETS=1 armed} = 32 configs, paired identical seeds.
**Policies:** control = VCE.armedFor (VGEAR=1 stack, TWOVETS unset); armed = TV.armedFor (TWOVETS=1 OUTSIDE the same stack, VGEAR=1).
**Substrate env:** FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1 KILLDISC=1 (+TWOVETS=1 armed). Asserted up front; SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/VGEARBEATS unset. killdisc v2 instrument (scripts/killdisc-instrument-20261021.js) — substrate update vs the 0515Z pre-registration, documented here, not mid-run.
**Instrument:** KILLDISC=1 v2 (read-only per-source tbDamage attribution on wave-3+ monsters + daily readiness census) + call-through daily w5-readiness sample + tv layer counters (counts only).
**SECONDARY (report, don't judge):** wall numbers both arms (national/table/wins, wave-4/5 unlocks, median/max survival, exiled); w5vetsMax>=2 villager-only composition; wave-4 kills by channel; vgear engagement; death-cause shares.
**GUARDRAILS:** villager combat deaths <= control×1.2; median survival (non-winning, per-seed matched) >= control−10d; starvation deaths <= control; no new death mode (≥2-event rule); wins within ±4/16 (report-class).
**§15:** before/after through scripts/balance-panel.js; the compare .md is attached below.
**KILL PROTOCOL:** NO-GO at pilot -> delete scripts/policies/twovets.js zero-trace (verify zero refs); instruments + evidence + proof land with the KILLED-VERDICT.
**SENSE-TESTING:** re-run the first armed run reaching the primary (or highest two-villager-kill run) with narration live; read the window; judge whether staged villagers behave like people. Quote lines.

## The design (scripts/policies/twovets.js, default-OFF, TWOVETS=1, zero src/js)
Rewrites ONLY the wave-4 turn policy (beat 3) for full independence — the scholar softens but NEVER finishes; the killing blow is never the scholar's. VGEAR=1 still required (armory drive + fighter staging legs unchanged, from scripts/policies/vgearconfirm.js on master).
- T1 ALWAYS-YIELD: yield fires regardless of scholar veteran status. Window: weakest live wave-4 <=30% maxHp, scholar hp>=50%, round>=2, <=8 yield turns/fight, stall guard (2 consecutive yield turns with no damage -> abandon, never finish).
- T2 SCHOLAR STAND-DOWN: wave-4 fight with NO engaged companion -> scholar does not pursue the kill — grid-honest breakoff (tbBarrierExit via tbGridMax; titan fights run 12x12). Fleeing records wavesFaced (fled counts as faced — the wave-5 wave-4-faced requirement is preserved), never a kill. On flee failure: hold (tbPlayerWait) if any wave-4 <=50%, else delegate to inner fight (rare path, only when every live wave-4 is above half).
- T3 SOFTENING DISCIPLINE: scholar strikes the weakest live wave-4 only while ABOVE 50% maxHp; in (30%,50%] band strikes strongest other live monster (chaff first, then strongest wave-4 >50%) or holds; at <=30% yields. Scholar never strikes a wave-4 at/below half. The wrapper strikes directly via Game.tbPlayerStrike (never delegates the strike) so the inner policy can't finish what the discipline forbids.
- T4 NO SCHOLAR-FINISH, EVER: stall -> breakoff (abandon, don't finish). Hurt companion (<40%): near-death -> keep yielding; else breakoff. Scholar hp<50% -> breakoff first, then metric-pure fallback (hold when any live wave-4 at/below half; delegate only when all above half). KILL-LEAK FIX: breakoff-failure DELEGATIONS never hand the killing blow to the base policy — delegation to the inner fight happens ONLY when every live wave-4 monster is above 50% maxHp (the dead run's diag caught the scholar striking at 25% then 7% via delegation).
- T5 NON-WAVE-4 FIGHTS UNCHANGED: wrapper takes scholar turns only in fights with a live wave-4; else delegates to the inner vgear stack.
Composition honesty: the wrapper engages only when TWOVETS=1 AND the inner VGEAR=1 (E1c: TWOVETS=1+VGEAR-unset is byte-identical to the seat stack — the staging legs the rewrite relies on are the vgear ones).
Deliberate non-goals: no party dismissal of veteran companions; no armor transfers (finding #608, steve-call); staging caps unchanged (max 2 staged companions).
Residual leaks (measured, not assumed): (a) one-shot strike from just above 50%; (b) flee-fail fallback delegation; (c) reactive damage attributed to scholar. The pilot's waveKillLog judges.

## Proof (scripts/test-twovets-20261021.js)
Gates: E0 shape; E1 det (TWOVETS-off == VCE.armedFor byte-identical, 2 seeds × 60d); E1c (TWOVETS=1+VGEAR-unset == seat stack byte-identical); E2 env; E3 engagement (tv counters fire on wave-4-reaching seeds, scholar w4 kills = 0); E3f RED (TWOVETS-off fires zero tv counters); R1 RED (TV_TEST_NOSTANDDOWN=1 -> scholar lands wave-4 kills on the regression seed — the dead run's kill-leak, simulated); E4 determinism; D2 (180d runs complete per policy + deterministic re-run).

**Result: 19/19 PASS, 0 fail** (log: /tmp/twovets-proof.log — rerun: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 KILLDISC=1 node scripts/test-twovets-20261021.js). R1-RED confirmed the regression seed produces scholar wave-4 kills with stand-down disabled; R1-GREEN confirmed 0 with the fix, same seed. All gates green BEFORE the pilot sweep, per protocol.

## Pilot sweep (scripts/sweep-twovets-20261021.js)
32 configs (8 fresh seeds 64841–64848 × {leadfeast, belongfeast} × {control, twovets}), 180d death-aware, paired identical seeds. Per-seed JSONs: evidence/2026-10-21/perseed-twovets/. Analyzer: scripts/analyze-twovets-20261021.js.

PRIMARY (kill-time attribution — bearer on the kill's day):
| seed | control lead (n,s) | control belong (n,s) | twovets lead (n,s) | twovets belong (n,s) | seed C/T |
|---|---|---|---|---|---|
| 64841 | 0,0 | 0,1 | 0,0 | 0,0 | 0/0 |
| 64842 | 0,0 | 0,0 | 0,0 | 0,0 | 0/0 |
| 64843 | 0,0 | 1,3 | 0,0 | 0,0 | 0/0 |
| 64844 | 0,0 | 1,0 | 0,0 | 0,0 | 0/0 |
| 64845 | 0,0 | 0,1 | 0,0 | 1,0 | 0/0 |
| 64846 | 0,0 | 0,0 | 0,0 | 0,0 | 0/0 |
| 64847 | 0,0 | 0,0 | 0,0 | 0,0 | 0/0 |
| 64848 | 0,0 | 0,0 | 0,0 | 0,0 | 0/0 |
n = distinct villagers with wave-4 kills, s = scholar wave-4 kills (kill-time). Seed counts if EITHER config reaches (n>=2 AND s=0).

**VERDICT: NO-GO.** Armed seeds reaching primary: 0/8. Control: 0/8. Bar (>= 2/8 armed AND armed >= control+2): missed on both prongs. Per §14, not re-scored.

What the pilot actually measured:
- The mechanism FIRES and is honest: tv counters engaged on 6/16 armed configs (tvFights up to 4/run; tvSoftStrikes, tvHolds, tvYieldTurns, tvBreakoffs, tvStanddowns, tvDelegates all observed; 0 instrument errors). The single armed wave-4 kill (s64845-belongfeast, d75, THE EATER, by Nikos via=companion) is a genuine villager veteran kill with scholar kills = 0 on that config — the discipline held where it engaged.
- The binding constraint is OPPORTUNITY, not discipline: 1 wave-4 kill in 16 armed runs. Wave-4 fights are rare in the 180d window (runs win ~d90; the wave-4 door opens ~d60-75), and the T2 stand-down aborts no-companion fights while stall-breakoffs abandon fights companions can't close. The layer manufactures the veteran only when a staged companion is already in the scholar's fight AND can close — that conjunction fired once in 16 runs.
- Control shows the disease the arm was meant to cure: 7 wave-4 kills, 5 by the scholar (incl. 3 on s64843-belongfeast) — the inner vgear stack lets non-veteran scholars finish. The twovets discipline removes the scholar finish (0 scholar wave-4 kills in 16 armed runs) but doesn't create companion kills.

## Analyzer (scripts/analyze-twovets-20261021.js)
Wall numbers (16 configs/arm): control {national:10, table:12, won:11, wave4:10, wave5:0, exiled:0, medSurv:92.5, maxSurv:151, w5vets2:1} | twovets {national:10, table:13, won:13, wave4:10, wave5:0, exiled:0, medSurv:92.5, maxSurv:142, w5vets2:0}. Wave-5 never opens on either arm — the scale wall stands.
Guardrails: villager combat deaths 349 vs 352 control (bar <= 422.4) PASS; starvation deaths 7 vs 8 PASS; median survival non-winning per-seed matched >= control−10d PASS (all 8 seeds); no new death mode PASS; wins 13 vs 11 (report-class, ±4) PASS.
Wave-4 kill detail (armed): s64845 belongfeast d75 eater by=Nikos(nikos_papadopoulos) via=companion. (control): 7 kills, 5 scholar / 2 villager — see analyzer output.

## §15 panel compare
scripts/build-twovets-panels-20261021.js → evidence/2026-10-21/twovets-panel-primary.{json,md} (+ .json.gz before/after). Decision: review_required. leadfeast: playerDeaths regression_watch (+0.75 combat deaths/run, CI [0,1.5] — noise-scale; the contract metric is total combat deaths, same formula as the sibling arm's panel). belongfeast: won change_watch (+0.25). No material signal against the arm; the panel is the instrument, the pre-registered bar is the judge — and the judge says NO-GO.

## Village assessment
The villages look like the winning-substrate villages from sim-fullseat: feasts, courtship, the seat taken, table wins ~d90. The twovets layer is invisible in daily life (it only touches wave-4 fight turns) — no daily-life texture change, which is correct for a turn-policy rewrite. In the one manufactured veteran kill (Nikos vs THE EATER, d75), the village behaved like people (see sense-testing). The honest cost of the discipline is visible: Rafael died in that fight while the scholar held ("You hold still, watching.") — the scholar could have finished the Eater sooner and didn't; the village grieved honestly. That is the design's price, not a bug.

## Sense-testing (brief requirement)
Re-ran s64845-belongfeast-twovets (highest two-villager-kill armed run) with narration live; read the d75 Eater window (evidence/2026-10-21/twovets-narration-s64845.txt, 2820 lines d60–90).
- The scholar softens honestly (228 on the Eater above half), then holds: "You hold still, watching." ×N while Rafael and Nikos work.
- Rafael falls mid-fight: "☠ Rafael falls." / "You carry the weight of it. They died beside you." / "Nobody's talking much. The fire feels smaller tonight."
- Nikos lands it: "Nikos hits eater for 58." / "The Eater falls." / SYSTEM: "Oh — OH. Everybody saw that, right? Nikos just put down The Eater... on CAMERA. That's a veteran kill, folks. REMEMBER the name." / Teresa: "Don't ever make them angry. That's all I'm saying." / Nikos whoops. "That's how it's done!"
- Aftermath is human: gossip chains, the beast-naming argument ("Big Big"), "Nikos set out an extra bowl before catching themself. Nobody mentioned it." The staged villagers behave like people — grief, pride, ritual. Verdict: SENSE-PASS.

## Metric review
1. Kill-time attribution (adopted): the brief's "by == scholarVid" is read as bearer-on-the-kill's-day. Justification: the scholar is a role (village-as-protagonist; succession churn is heavy — s64712 had 6 bearer changes by d87). End-of-run vid misattributes villager kills as scholar kills (diag-bearer). Not a metric change — the honest reading of the brief's line. Recorded here per §14; applies to this run's judging.
2. The PRIMARY's opportunity assumption was wrong: the bar assumed wave-4 kills happen often enough for 2 villagers to fill both slots in 8 seeds. Measured: 1 wave-4 kill in 16 armed runs. A future arm attacking #747 needs to manufacture OPPORTUNITY (more wave-4 fights reaching the scholar's party), not just discipline. Proposed next: the staging leg already invites fighters; the missing piece is fight initiation — deliberate wave-4 engagement (hunts were a deliberate non-goal here; the pilot says that non-goal is the wall).
3. Panel metric note: "playerDeaths" in the panel contract is computed as total combat deaths (same formula as the sibling arm) — mislabeled but consistent; no action.

## Convergence
killed-at-pilot. Backlog #747 (can villagers fill BOTH veteran slots alone?) remains OPEN — answered NO on this design: the discipline works (0 scholar wave-4 kills in 16 armed runs, 1 genuine villager veteran kill) but the opportunity rate (1 kill/16 runs) cannot fill two slots. The finding for the next arm: opportunity, not discipline, is the binding constraint. KILL PROTOCOL EXECUTED: scripts/policies/twovets.js deleted zero-trace (verify: grep shows no remaining requires); instruments (killdisc v2), evidence, proof (19/19), sweep (INFO-SKIP on TWOVETS_KILLED=1), analyzer, panel builder land with this KILLED-VERDICT. Zero src/js changes were made (nothing to revert).
