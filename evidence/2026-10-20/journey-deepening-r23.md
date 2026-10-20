# Deepening leg R23 — knowledge economy + wave-3 signature end-states (2026-10-20)

Run: oversight-playtest-loop (lane A), run_id 2026-10-20T07:45:00Z. Leg 2 (deepening, days 40–80).
Rotation-a: 2→3. Worktree: journey-deepening. Base: master@b050dcb26.

## Pre-register (MEASUREMENT.md 9–12, 14 — BINDING)
- R1: sig end-state proof scripts/test-w3-sig-endstates-r23.js 9/9 GREEN (pre-run).
- R2: knowledge — ≥2/4 seeds with ≥1 counter known OR ≥1 knowledge marker by d80.
- R3: trick fights in real play, reported by type (report-only).
- M1: ≥8 transcripts read, 0 senseless (report-only; dialogue = social loop's lane).
- M2: ≥3/4 villages alive at d80.
- Seeds: 9601–9604 competent, DAYCAP=100, death-aware stop.
- Race guards: no pacing lever (flesh-out), no dialogue changes (social loop), gate untouched (Steve's design).

## Results
- **R1: GO** — 9/9 GREEN (2 runs).
- **R2: GO 4/4** — 15–20 counters known/seed by d100 (channels: observed/taught/trick/scholar-observed); experiment beats 3–4/seed; moots fire; traderDeep 2 on 9603.
- **R3:** 85 wave-2 field fights, **0 trick performances**; wave-3 N/A (never unlocked).
- **M1: GO** — 10 transcripts read, 0 senseless, 8 meaningful; 1 policy-driven loop defect (9604-d45); 1 thin walkaway.
- **M2: GO** — 4/4 survived to d94–102.

## Blanks
1. **CORRECTED (r22 design note #3):** "Spool's starve counter works but takes 121 rounds; canon's 'third quiet turn flees' isn't in the code." Both halves were misdiagnosed:
   - The "third quiet turn flees" canon is the **Redactor's** (MONSTER-WAVES.md batch A), and it **works** — proof T1: the redactor starves after 2 quiet turns and flees after the 3rd (4th player turn incl. the sigHadTurn grace; the "one more turn" telegraph is honest from the player's perspective).
   - The Spool's 121-round stalemate was a **policy artifact**: r22's policy kept waiting instead of striking once the tape held silence. Proof T2: feed 3 waits → replay is harmless (0 player damage) → kill in 27 rounds bare-handed, no party.
   - Proof T3 (report-only): the neutralized spool is a **permanent** safe punching bag — 285/285 HP after 40 quiet rounds, never attacks, never leaves. Whether the trick should eventually dismiss it is Steve's call.
   - Proof: scripts/test-w3-sig-endstates-r23.js (9/9). No game-code change — the mechanics were already correct; the record is corrected.
2. **DOCUMENTED — wave-3 unlock 0/4 by d102.** The kills-only gate binds, not contact:
   - 9601: 2 kills / 7 types faced; 9602: 3/8; 9603: 2/10; 9604: 3/6. Gate needs 4.
   - Combined with r21+r22: fight-seeking play unlocks d77–96; fight-avoidant competent play may never unlock. Contact is plentiful (6–10 types faced) — kills are the constraint. Steve's design; not moved.
3. **DOCUMENTED — wave-1/2 field-trick gap is a deliberate boundary.** fieldFights.js documents 13 counter kinds as "un-actuatable, never faked" (need grid/telegraph/segments the abstract model lacks). Not overridden — this is the known open tension (Steve declined gate alignment; counterwire lane owns the route).
4. **DOCUMENTED (social lane, report-only):** grief-pool verbatim recycling persists (Marvin 4-line set on 9603-d60); teach-template verbatim ×3/seed; Hinewai 9604-d45 want-loop (6× repeated ask_favor vs stonewalling NPC — policy-driven, with verbatim pool exhaustion); Emily 9603-d45 share_news evaporation (the "bursting to share" news never surfaces).

## Census (plain words)
Four villages lived to days 94–102, all at regional scale with 2 links each, populations 9/9/9/6. Deaths ran 11–30 per seed — mostly villagers lost to wave-1/2 monster combat (nightcourt, hushwolf, drumbelly, glasswing), plus the occasional starvation, sickness, and expedition loss; zero death mislabels. Every village is *smarter* than at day 40: 15–20 beast counters known, learned by watching each other survive and by teaching at the fire; villagers run the cautious-tasting protocol on unknown foods; one knowledge trader deepened its pool in-run. The scholar fought only 5–13 times per run — these villages avoid fights — while villagers fought 109–170 field fights each and mostly lived. Nobody faced a wave-3 monster; nobody needed to. The villages are holding steady, not thriving: pantries stable, aid crises answered (7–9 each), no leader standing out, Jada still waiting on word about Emily in the pods.

## Telemetry deviation check
vs telemetry-baselines/deepening.json (w3fights, engaged.w3, fightsTotal, fightsByWave.3): **3 LOUD lines, all EXPLAINED** — w3fights/engaged.w3/fightsByWave.3 at 0 because wave-3 never unlocked (the R2 finding above). The content exists and is proven working on this tip (sig proof 9/9); it wasn't reached. Baseline NOT rolled.

## Metric review (§14)
- R2's bar was too easy — the knowledge economy is healthy; next run should tighten it (e.g., beasttricks ask/teach channel fires, or a wave-2 trick-performance bar on actuable kinds only).
- The w2Missed "missed opportunity" instrument over-counts: it uses end-of-run knowledge as the upper bound, but most missed fights had rounds=0 (monster fled before any villager action). Next run: only count fights where the villager had ≥1 turn.
- Keep the sig end-state proof as the r23-style pre-flight (cheap: ~5s, guards the surface).

## Reachable / fun / winnable (deepening leg)
- **Reachable: MIXED** — wave-3 (the leg's headline) reached 0/4 this run; everything else in the leg (knowledge economy, regional links, moots, contests) fires reliably.
- **Fun:** villages feel alive (Jada's taken-sister arc across 15+ days, Dieter's water math, Ruth's grief); the signature counterplay is proven at proof level but never fired in real play this run — the Undertale moments are real but rare for fight-avoidant players.
- **Winnable:** 4/4 survive to ~day 100 with stable pantries; the leg threatens nothing a competent village can't handle.

## Design notes for Steve (his calls, not levers)
1. **Wave-3 gate:** 0/4 unlocks by d102 on fight-avoidant competent play (2–3 kills vs 4 needed; 6–10 types faced). The kills-only gate is yours — the data says contact isn't the constraint, kills are.
2. **Neutralized spool never leaves** — the feed-silence trick makes a permanent safe punching bag. Intended Undertale reward, or should it wander off?
3. **Moot volume:** 9602 logged 58–68 moot markers in 102 days — more than one every two days (social lane's).

## Files
- Run note: evidence/2026-10-20/journey-deepening-r23.md (this file)
- Proof: scripts/test-w3-sig-endstates-r23.js (9/9 GREEN)
- Harness: scripts/journey-deepening-r23-20261020.js
- Per-seed JSONs: evidence/2026-10-20/journey-deepening-r23-competent-96{01..04}.json
- Transcripts: evidence/2026-10-20/journey-deepening-r23-transcript-competent-*.txt (105)
- Run log: evidence/2026-10-20/journey-deepening-r23-run.log
- check.js --quick: evidence/2026-10-20/journey-deepening-r23-checkquick.log
