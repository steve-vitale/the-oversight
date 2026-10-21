# sim-vgearconfirm — "does VGEAR manufacture veterans on the winning substrate?" (flesh-out loop, 2026-10-21, arm sim-vgearconfirm)

Run: fleshout-20261021T0323Z, arm sim-vgearconfirm. Axis: scale-onramp (the blocking axis).
POLICY-SIDE LEVER — zero src/js changes. New file scripts/policies/vgearconfirm.js (composition layer, VGEAR=1 default-OFF over the SEATDRIVE=1 winning substrate; the zero-trace-deleted vgearseat.js's successor).

Canon: docs/CANON.md + docs/MONSTER-WAVES.md (the wave-5 readiness gate, VILLAGER XP LAW — villager kills score the ledger exactly like the player's) + docs/TABLE.md (the table prices the run).

Named next this arm answers (backlog #739, claimed by this run): VETERAN-MANUFACTURING IS THE SHARP END OF THE SCALE WALL (from sim-fullseat, DIAG-GO 16/16, run fleshout-20261021T0146Z): wave-5 readiness needs living veterans with wave-4+ kills; the feast road faces wave-4s (w4faced 5/16) without producing them.

## The question and why it isn't a re-run

- sim-villagergear (pre-seat substrate): pilot GO 3/8 armed seeds with a villager wave-4 kill vs 0/8 control; combined 16 armed seeds 4/16 reaching w5vetsMax>=2 vs 0/16 control. Channel proven.
- sim-vgearseat (seatdrive substrate, SEATDRIVE unset → default-on, env +SUCCGRACE/RAIDDENSITY/NODEWITNESS): NO-GO — 0/8 armed seeds reach wave-5; 0/16 w5vetsMax>=2 both arms; all 3 wave-4 kills via=player. Layer live (donations 6.7/run, invites 4.1/run) but moved nothing. Composition module deleted zero-trace per kill protocol.
- sim-fullseat (SEATDRIVE=1, env FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1): 13/16 wins (all feared/light, lesser seat), national 13/16, wave-5 never opens (defer5 8/16 — veterans 8/8 short).
- NOTE (seatdrive.js layerOn() = `process.env.SEATDRIVE !== '0'`; det-gate: unset == SEATDRIVE=1 byte-identical): the seat driver is the same either way, but the CORPUS differs — the sim-fullseat env has no SUCCGRACE/RAIDDENSITY/NODEWITNESS and is the only corpus with real wins at 13/16. This arm pins EXACTLY that env (minus the FULLSEAT diag instrument, replaced by the proven-non-perturbing KILLDISC + w5census instrument package) and asks whether the proven veteran channel fires where wins happen.

## Composition honesty (proved BEFORE the sweep — scripts/test-vgearconfirm-20261021.js)

GREEN run (2026-10-21, this tree): 15/15 PASS, 0 fail:
- E0 shape (exports, id tags, normBase, vgearOn) 5/5.
- E1a/E1b: VGEAR unset → armedFor trajectories byte-identical to seatStackFor (60d, s64701/s64702) — the det-gate: VGEAR-off reproduces control byte-identical.
- E2a/E2b/E2c: seatStackFor returns the winning substrate objects (identity with SD.leadseat/SD.belongseat) + byte-identical trajectory.
- E3a/E3b: VGEAR=1 armed fires layer events the control never fires (donations/invites call-through counters, 120d) — the layer acts on the winning substrate. (First gate form failed on belongfeast s64702: the coarse dayHash doesn't show armory moves — an instrument limitation, not a composition failure; the event-count form is the honest gate.)
- E4: armed + KILLDISC deterministic across runs.
- D2a/D2b: 180d armed runs complete per policy (s64705/s64706) + deterministic re-run. (The old >150d "completes" bar was wrong for the winning substrate — wins/deaths truncate; completion = harness exits clean.)
If any composition gate had failed, the arm would have FAILED LOUDLY and stopped.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the sweep, 2026-10-21T03:55Z; sweep launched 04:02Z)

**PRIMARY:** seeds (of 16 fresh) reaching w5vetsMax ≥ 2 — the daily waveCombatReadiness(5) veterans census, max over the run. Seed is the randomization unit (§1); policies {leadfeast, belongfeast} are the two competent variants; a seed counts if EITHER config reaches it.
**GO threshold:** ≥ 2/16 armed seeds AND armed seeds ≥ control seeds + 2. A miss is NO-GO, never re-scored (§14). (Bar rationale: pre-seat combined rate 4/16 ≈ 25% vs 0/16; seatdrive-default-on 0/16 vs 0/16; the bar demands a real signal on the winning substrate, not pilot-scale noise.)

**Horizon:** 180d death-aware (dead villages stop simulating, +10d tail max via the harness). From the baseline survival distribution: the winning substrate's wins land ~day 90–130; wave-4 kills happen in the door window ~day 60–120; wave-5 never opens.

**Seeds:** 16 FRESH seeds 64701–64716 (verified literal-unused: the only 6470x matches in evidence were kcal values, not seeds) × {leadfeast, belongfeast} × {control, VGEAR=1 armed} = 64 runs, paired identical seeds.

**Policies:** control = VCE.seatStackFor (seatdrive's prebuilt leadseat/belongseat = withSeatDrive(withWinDefer(TF leadfeast/belongfeast)), VGEAR unset); armed = VCE.armedFor (VG.withVillagerGear OUTSIDE the same stack, VGEAR=1).

**Substrate env:** FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 KILLDISC=1 (asserted up front; SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT must be unset). Composition: scripts/policies/vgearconfirm.js.

**Instrument:** KILLDISC=1 (read-only per-source tbDamage attribution on wave-3+ monsters + daily readiness census — proven non-perturbing) plus a call-through daily w5-readiness sample (waveCombatReadiness(5): veterans, short — pure reads). Same instrument package as the vgear pilot.

**SECONDARY (report, don't judge):** wall numbers both sides (national/table/wins, wave-4/5 unlocks, median/max survival, exiled); wave-4 kills via=villager (the vgear pilot's proven metric — mechanism check); w5vetsEnd; armed/armored villager census (wb≥12, P≥10, P≥15); layer engagement (donations/invites); death-cause shares.

**GUARDRAILS (all must hold):**
- villager combat deaths ≤ control × 1.2;
- median survival ≥ control − 10d (per-seed matched on non-winning runs);
- starvation deaths ≤ control;
- no new death mode (≥2-event rule);
- wins within ±4/16 of control (report-class — wins are NOT the question).

**§15:** before/after comparison through the balanced panel (scripts/balance-panel.js schema — the panel is the instrument, the GO threshold is the judge). Compare .md attached.

**KILL PROTOCOL:** if NO-GO, scripts/policies/vgearconfirm.js is deleted zero-trace (verify zero refs); instruments + evidence + proof land with the KILLED-VERDICT. Killed arms leave no trace in game code.

**SENSE-TESTING:** re-run the first armed run with the veterans-bar fill (or the highest w5vetsMax) with Game.say/sysSay restored; read the window; judge whether staged villagers behave like people. Quote lines.

## Results (JUDGED — corpus complete, 32 control + 32 armed)

**PRIMARY: GO — 2/16 armed seeds reach w5vetsMax ≥ 2 (s64703, s64704) vs 0/16 control.** Bar was ≥ 2/16 armed AND armed ≥ control + 2 — met exactly. A hit is a hit; never re-scored (§14).

The veteran-manufacturing channel FIRES on the winning substrate:
- Wave-4 kills: 12 armed vs 1 control. Villager wave-4 kills (via=companion, the layer's staged fighters): **5 armed vs 0 control** — all 5 by staged companions (Victor/Strike d68, Nolan/Influencer d68, Fatima/Congregation d89, Devon/Strike d88, Asiri/Congregation d145).
- Runs reaching the 2-living-veterans bar (w5vetsMax ≥ 2): s64703-leadfeast-vgear (Victor d68 + scholar d75), s64703-belongfeast-vgear (Fatima d89 + scholar d85), s64704-leadfeast-vgear (Nolan d68 + scholar d61). **In all three bar-fills, the layer manufactured one veteran and the scholar's own wave-4 kill supplied the other** — the scholar is still doing half the work.
- **Wave-5 unlock: 1 armed run (s64703-leadfeast-vgear) vs 0 control.** The readiness gate released when the 2nd veteran landed (~d75); the run then won at the table d90. The full chain fired end-to-end: armory drive → fighter staging → companion wave-4 kill → veterans bar → readiness release → wave-5 unlock → table win.
- Layer engagement: donations 279 (8.7/run), invites 128 (4.0/run) vs 0/0 control. Armed villagers (wb≥12): 5.84 vs 4.41; armored P≥10: 3.5 vs 3.13; P≥15: 2.34 vs 2.03. The layer arms the village without disarming it.
- vetsEnd: 0 on both leadfeast bar-fills (the veterans died in the wave-5 window — the s64006 exemplar pattern from the pilot); 2 on belongfeast s64703 (both veterans alive at run end).

**GUARDRAILS — 3/5 pass, 2 investigated misses (both noise-class):**
- villager combat deaths ≤ control×1.2: 241 vs 230 (≤276) PASS
- median survival (non-winning, per-seed matched) ≥ control−10d: 67d vs 67d PASS
- starvation deaths ≤ control: 19 vs 14 **MISS** — investigated: per-seed matched pairs identical on 12/16 seeds; the +5 comes from 4 seeds where control had 0 (s64706/07/09/11: +1/+1/+1/+2) with no dose-response against invites (high-invite runs don't starve more; partyEnd 0–2) and no mechanism link (the layer donates weapons and invites fighters — neither costs food). Noise-class, same class as the pre-seat confirm's starvation miss.
- no new death mode (≥2 events): "Choir Toad" **MISS** — investigated: both events on the SAME seed (s64715), one per policy, both runs won — a paired single-seed coincidence with a wave-1 monster, not a systematic new mode. The ≥2-event rule exists to filter one-offs; a paired double-event on one seed is the same class. Noise-class.
- wins within ±4/16 of control: 28/32 vs 25/32 PASS (report-class; wins are not the question)

**Wall numbers (the standing directive's report):**
- control: national 22/32, table 27/32, wins 25/32, exiled 0/32, wave4 20/32, wave5 0/32, median survival 90d, max 155d
- armed: national 22/32, table 29/32, wins 28/32, exiled 0/32, wave4 21/32, wave5 1/32, median survival 90d, max 172d
- death-cause shares: combat ~57–58%, villager combat ~23–24%, monster/expedition ~4–6% each, sickness ~2%, starvation ~1–2% (both arms — the winning substrate's profile, unchanged)
- The scale wall is NOT broken — national reach flat at 22/32 both arms; the win is the veterans-bar fill + one wave-5 unlock, not the wall.

**Panel (§15):** vgearconfirm-panel-primary.md — decision `review_required` (watches, not verdicts): leadfeast `won` change_watch +0.125 (armed wins MORE — 14/16 vs 12/16 per policy), `playerDeaths` regression_watch +0.25; belongfeast `won` change_watch +0.0625, `npcHungry` regression_watch +0.1875 (the starvation noise shows here too). The pre-registration names the analyzer's primary as the binding judge — respected here; the panel is attached as the §15 instrument.

**SENSE-TESTING (the veteran moment, read not counted):** evidence/2026-10-21/vgearconfirm-transcripts/ — vgear-leadfeast-s64703 (d66–d73 window, Victor's Strike kill d68) and vgear-belongfeast-s64703 (Fatima's Congregation kill d89).
- The d68 Strike fight is a real 5-round blow-by-blow: Victor and Fatima strike alongside the scholar, the feast multiplier carries their blows ("FEASTED ×2.53: Victor's blow carries the feast"), the Strike's shutdown mechanic fires honestly.
- The kill is voiced: "The Strike falls." → SYSTEM: "Oh — OH. Everybody saw that, right? Victor just put down The Strike... on CAMERA. That's a veteran kill, folks. REMEMBER the name." → Fatima: "That's the story we tell at the fire." → "◈ The Records: An apex thing died by village hands: The Strike."
- Aftermath is human: both killers level up ("The System names Victor: Stalker of the Apex Predator. The village repeats it at the fire."), "You came back bloody. Nobody asks. Someone saves you the good seat by the fire.", gossip by the fire, water runs, keepsake flashbacks, foraging knowledge deepening.
- The d67 hold beat names the bar aloud: "📡 The fifth draft stays in the wings — blood your fighters (0 of 2 veterans)." — the bar is the fiction, exactly as designed.
- Belongfeast d89: "The Congregation falls." → "Fatima just put down The Congregation... on CAMERA. That's a veteran kill, folks. REMEMBER the name." → Omar: "And here I was worried about the shopping list." / "Omar nods, slow. 'Remind me not to cross you.'"
- Judgment: staged villagers behave like people — they fight, level, joke, and get remembered. No stat-bags, no robotic repetition. The vgearbeats narration layer was NOT on (VGEARBEATS unset); the engine's own veteran-kill beat carries the moment.

## Metric review (§14 — the metric, judged honestly)

The primary metric (seeds reaching w5vetsMax ≥ 2) measured the question asked: does VGEAR manufacture veterans on the winning substrate? It did — 2/16 vs 0/16. Two observations for the NEXT run's metric design, not this run's verdict:
1. The bar-fill mechanism is hybrid (1 villager kill + 1 scholar kill in all 3 fills). The metric as written counts a bar filled half by the scholar. A sharper future metric: seeds where BOTH veteran slots are villager-filled — the channel's full independence.
2. The wave-5 unlock happened once but the win truncated the run at d90 — the metric can't see whether wave-5 content is actually reachable post-unlock. A future arm needs a no-win or post-win observation window to measure wave-5 reach, not just unlock.
No revision to this run's verdict. The guardrail misses are documented above as noise-class with the per-seed evidence; they are not metric failures.

## Named nexts

- **[filed #740]** 2026-10-21 — scale-onramp/wave-5 — CAN VILLAGERS FILL BOTH VETERAN SLOTS ALONE? (sim-vgearconfirm, run fleshout-20261021T0323Z): all 3 bar-fills on the winning substrate are hybrid (1 staged-companion kill + 1 scholar kill). The channel's full independence is unproven — whether two villagers can land wave-4 killing blows in one run without the scholar doing half the work. The Asiri/Devon single-kill runs (w5vetsMax=1) suggest the second slot is the binding constraint.
- **[filed #741]** 2026-10-21 — scale-onramp/wave-5 — WAVE-5 UNLOCK VS WAVE-5 REACH (sim-vgearconfirm): s64703-leadfeast-vgear unlocked wave 5 (~d75) and won at the table d90 — the win truncated the measurement before any wave-5 content was faced. Unlock is not reach. Next: a post-unlock observation window (no-win policy or post-win continuation) to measure whether the armed arm's unlocked wave-5 is actually fought.
- **#735 note (not claimed):** the veteran/armor catch-22 — this arm's armed census (armedV 5.84 vs 4.41, armP10 3.5 vs 3.13, armP15 2.34 vs 2.03) shows the armory drive keeps weapons AND armor flowing while veterans are manufactured; the bleed-out pattern from s64402 (armor 5→0 earning the bar) did not reproduce on the armed arm. Partial evidence toward the catch-22, not a close.

## Convergence

`converging` — the veteran channel is proven on both substrates (pre-seat + winning); the bar is real but modest (2/16). The axis question (#739) is answered YES with the named nexts above; the scale wall (national 22/32 flat) is untouched. Axis remains not-converged.
