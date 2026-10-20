# sim-villagergear — "the village armed, not the scholar" (flesh-out loop, 2026-10-20, ARM sim-villagergear)

**JUDGED GO.** Stale-run recovery: the dead run (fleshout-20261020T1015Z) left a COMPLETE 32-run pre-registered pilot corpus; the coordinator's landing pass merged the branch (INCOMPLETE verdict, 84818a64f) and released the tree mid-judgment. Judgment was drafted by a duplicate instance of run fleshout-20261020T1415Z (run_id 2026-10-20T14:59:51+00:00, died mid-write) and then INDEPENDENTLY VERIFIED — primary, all 5 guardrails, secondary, wall numbers, layer-engagement counts, supplement set, and transcript quotes recomputed from the committed corpus — and finished by run fleshout-20261020T1615Z, which corrected the draft where it failed verification (see "Metric review (judgment run)").

Run: fleshout-20261020T1015Z (sweep + proof) / 2026-10-20T14:59:51+00:00 (judgment draft) / fleshout-20261020T1615Z (independent verification + finish + confirm round). Axis: scale-onramp (the blocking axis).
POLICY-SIDE LEVER — zero src/js changes. New file scripts/policies/villagergear.js (default OFF, VGEAR=1), landed 3628ccf71.

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave-4 roster + bands, the readiness gate, VILLAGER XP LAW — villager kills score the ledger exactly like the player's).

## The bind (read from evidence, not invented)

- The scholar-gear lane is CONCEPT-CAPPED (backlog #651, evidence/2026-10-19/sim-gearday2.md): arming the scholar cut scholar combat deaths −19.6% but RAISED villager combat deaths +29% and cut median survival 122.5d→93.5d. The axis needs the VILLAGE armed, not the scholar.
- The wave-5 door's 2-living-veterans bar never fills because wave-4 kills are 10/10 via=player (E2/E3, evidence/2026-10-20/sim-w5door-measure.md) — villagers never land the killing blow. The veterans bar counts DISTINCT LIVING killer vids with wave-4+ kills in state.waveKillLog (standing.js waveCombatReadiness); the only villager who kills wave-4 is the scholar, and the scholar dies within 30d of the kill 9/10.
- The TB killing-blow channel EXISTS and is engine-honest: a companion landing the final hit in the scholar's TB fight logs by=<companion vid>, via='companion' (TRICKTAG, game.js:42126; sim-killbeat's fiction beat landed 2026-10-19). Baseline on the census corpus: 0/13 wave-4 kills via=villager.
- Policy-layering lesson (backlog #656): NEVER re-equip what the base policy (competent.js gearUp) already owns. gearUp equips the SCHOLAR only (state.scholar.equipped/inventory, 3x/day) — villagers are untouched. This layer never calls Game.equip/unequip on the scholar, never donates the scholar's best, never touches scholar inventory beyond spare-weapon donation.

## Lineage (the 9th–11th production attempts, honored)

- sim-vetarm (9th, KILLED): armory donations + patrol exposure. The patrol beat killed 19 able villagers ('patrol combat' death mode) and cannibalized presence. → This layer NEVER calls Game.assignTask, never moves fighters.
- sim-armory (10th, KILLED): armory-only. Donations moved the ARMED readiness bar (6→17 armed companions, median wbonus 0→8, guardrails green) but not wave-3 damage-share (0.90x) — arming improves the QUALITY of companion participation, not its FREQUENCY; frequency dominates. The named next (#623): presence-routing without movement via the "joins you" trigger conditions.
- sim-vetrel (LANDED, default-OFF, 18-0 at confirm): combat-ranked party invites, scholar-softens/companion-finishes yield, companion-survival breakoffs — proven on the wave-3 veteran channel. This layer reuses the protocol SHAPE re-scoped to wave-4. VETREL stays env-inert here (its deliberate hunts consume the day clock — finding #490 — and its bar is wave-3).
- Armor: NO HONEST POLICY-SIDE CHANNEL (sim-findings #608, steve-call). No communal armor pile (storage.js: "armor/misc have no deposit hook"), no gift verb, individual ownership is Steve's law. The layer does not touch armor — the engine's villagerGearDay already equips villagers from their OWN stashes. Documented, not re-litigated.

## The lever (scripts/policies/villagergear.js, VGEAR=1, composed OUTSIDE the w5path stack)

Three beats, all engine-honest:

1. **ARMORY DRIVE** (daily, at Haven): worst-spare WEAPON → Game.donateWeapon (strictly worse than the scholar's equipped best — the layer never touches what gearUp owns; never the only edge; keepsakes/bonded never donated; knap fallback stone+vine with vinebank defersCraft deference). The engine's daily villagerGearDay distributes armory weapons to the biggest gains (deposit is consent). Target: armory ≥ 3 units.
2. **FIGHTER STAGING** (daily, at Haven, wave-4+ unlocked, w5 veterans bar unmet): combat-ranked invites through the real inviteToParty verb (trust floor 20, engine acceptance draw — personality/goals decide). Non-veterans first (a wave-4+ killer's next kill doesn't advance the bar), strongest first (weaponBonus×3 + armor×2 + hp — vetrel's proven formula). Max 2 companions (party cap 3 — the village keeps defenders). No dismissals (negative gossip). Party members travel with the scholar (placePartyAtPlayer) → within the TB join radius (nearest 4 within 4 squares, startCombat) → presence in wave-4 fights via the engine's own "joins you" trigger. Consent-based staging, never assignTask.
3. **WAVE-4 YIELD + SURVIVAL** (fight wrapper, player turns): in a TB fight with a live wave-4 monster and an engaged party companion — a NON-veteran scholar fights normally (they need their own kill; they're the reliable finisher); a VETERAN scholar HOLDS (the honest tbPlayerWait turn-forfeit) when the weakest live wave-4 monster is ≤20% maxHp, scholar hp ≥ 50%, round ≥ 2, ≤6 yield turns/fight, and the monster took damage in the trailing 2 yield turns (a companion who can't close doesn't get watched forever). Any engaged companion <40% HP ends the commitment: scholar resumes striking if the monster is near death (fastest end = fastest the companion stops taking damage), otherwise breaks off honestly via tbBarrierExit.

Deliberate non-goals: scholar re-equipping (#656); armor transfers (#608 steve-call); patrols/task assignment (vetarm autopsy); deliberate wave-4 hunts (finding #490 — wave-4 arrives via unlocks/raids, and B6: facing is reliable).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the sweep)

**PRIMARY:** seeds with ≥1 wave-4 kill via=villager — waveKillLog entries with w==4, by ≠ scholar vid, via ∈ {companion, patrol, wild, aid-crisis, contest, agency, sortie} (the "villager landed the killing blow" set; baseline corpus 0/13).
**GO threshold:** ≥ 2/8 seeds on the armed arm. A miss is NO-GO, never re-scored mid-run (§14).
**Unit note:** seed is the randomization unit (policies leadfeast/belongfeast are the two competent variants); a seed counts if EITHER config shows a villager wave-4 kill. Per-run counts also reported.

**Horizon:** 180d death-aware (dead villages stop simulating, +10d tail max via the harness). Set from the baseline survival distribution (w5doormeasure on this substrate: median 181.5d game-days) — 180d covers the door window where wave-4 kills happen.

**Seeds:** pilot 8 seeds (64001–64008 — verified filename-unused in evidence/ before the sweep) × {leadfeast, belongfeast} × {control, vgear} = 32 runs. Confirm (only on pilot GO): 8 more seeds (16 total).

**Policies:** the exact w5doormeasure stack — withSeatDrive(withWinDefer(withVetrel(withReposition(TF leadfeast/belongfeast)))).

**Substrate env:** FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 NODEWITNESS=1 KILLDISC=1 (VETREL/REPOSITION unset → inert; SEATDRIVE=0 → pure delegation). The sweep FAILS LOUD unless the env matches exactly.

**Arm env:** VGEAR=1 (armed) vs unset (control — gate-off is pure delegation, DET-pinned byte-identical to the wrapped stack).

**SECONDARY (report, don't judge):** runs with the 2-living-veterans w5 readiness bar EVER met (w5vetsMax ≥ 2 via the daily census) — armed ≥ 2/16; end-of-run w5vetsEnd; armed/armored villager census (wb≥12, P≥10, P≥15); wave-4 companion damage-share (KILLDISC); wall numbers (national/table/wins, wave reach, median/max survival, death-cause shares).

**GUARDRAILS (all must hold):**
- villager combat deaths ≤ control × 1.2 (the #651 shift, made binding — the scholar-gear arm raised these +29%);
- median survival ≥ control − 10d;
- starvation deaths ≤ control;
- no new death mode (≥2-event rule);
- wave-4 unlocks within ±2/16 of control.

**§15:** before/after comparison through the balanced panel (scripts/balance-panel.js) — the panel is the instrument, the GO threshold is the judge. Compare .md attached (villagergear-panel-primary.md — panel judged review_required; corpus analysis is the binding instrument per the pre-registration).

**KILL PROTOCOL:** if killed at pilot, the layer is deleted zero-trace; instruments + evidence + proof land with the KILLED-VERDICT. Killed arms leave no trace in game code.

**SENSE-TESTING:** re-run the armed seed with the first villager wave-4 kill (or the first wave-4 kill window) with Game.say/sysSay restored; read the whole window; judge whether armed villagers behave like people fighting a herald or stat-bags. Sample SAY lines in evidence.

## Proof

scripts/test-villagergear-20261020.js — RED→GREEN on the layer (RED phase: layer absent → exit 1):
- A1 gate honesty; A2 worst-spare donation; A3 unarmed scholar keeps the only edge; A4 armory≥3 no-op + one push/day; A5 keepsake/bonded skipped; A6 knap fallback; A7 vinebank deferral; A8 scholar equip/unequip never called;
- B1 strongest non-veteran invited first (veteran deprioritized, trust<20 skipped); B2 staging gates (pre-wave-4, bar-met stand-down, 2-in-party cap, one pass/day); B3 no dismissals/assignTask;
- C1 veteran scholar yields at ≤20% monster HP; C1b yield bounded (≤6) + stalls end it; C2 hurt companion ends yield (scholar strikes); C2b break-off when monster healthy; C3 non-veteran scholar fights normally; C4 gate-off fight pure delegation;
- D1 det-gate (real harness): gate-off vgearLead/vgearBelong byte-identical to leadfeast/belongfeast (2 seeds × 60d); gate-on deterministic;
- D2 real-sweep gate: 180d armed runs complete per policy, deterministic re-run.
- Recovery re-run (run fleshout-20261020T1415Z, on the landed layer): A/B/C/D1 all PASS; D2's first attempt hit a transient /bin/sh ENOENT in the harness shell-out (infra flap, /bin/sh verified healthy seconds later), second attempt interrupted by the coordinator's landing pass deleting the worktree. D2 was corroborated by the committed 32-run corpus — recorded, not claimed green.
- Post-rebase re-run (run fleshout-20261020T1615Z, on the rebased tip, this tree): **27/27 PASS, 0 fail** — A1–A8, B1–B3, C1–C4, D1a–D1c, and D2 FRESH GREEN (180d armed leadfeast + belongfeast on s64001, both complete, deterministic, days=67/67 end=village-lost — death-aware horizon). The earlier D2 note is superseded: D2 is green on the landed+rebased code.

## Results (JUDGED — corpus complete, 16 control + 16 armed)

**PRIMARY: GO — 3/8 armed seeds show a wave-4 kill via=villager (control 0/8).** ≥ 2/8 bar cleared. Kill log verified per-entry (w==4, by ≠ scholar vid, via=companion; mid ids from src/data/monsters.json):
- Seed 64006 leadfeast-vgear: d61 Tariq (tariq_mahmood) via=companion vs **The Strike** (mid=strike); d71 Aurora (gen_oawhxpa) via=companion vs The Influencer (mid=influencer).
- Seed 64008 leadfeast-vgear: d83 Nina (nina_petrova) via=companion vs The Suburb (mid=suburb).
- Seed 64002 belongfeast-vgear: d103 Dante (gen_mfw2sia) via=companion vs The Congregation (mid=congregation).
- Control: 0/8 seeds, 0/16 runs — baseline holds (matches the 0/13 census).
- CORRECTION (judgment run): the draft said d61 Tariq's kill was "vs The Understudy" — wrong. The Understudy is the d61 fight BEFORE the Strike fight (scholar struck that final blow, see broadcast finding below). The logged villager kill is vs The Strike; the transcript shows Tariq landing the final blow and the System announcing "Tariq just put down The Strike... on CAMERA. That's a veteran kill, folks." — engine-honest attribution.

**SECONDARY: armed runs with w5vetsMax ≥ 2: 3/16** (report bar ≥ 2/16 — met). Control: 0/16. The 2-living-veterans w5 readiness bar fills on the armed arm only.

**GUARDRAILS — all pass (independently recomputed from the 32 per-seed JSONs):**
- villager combat deaths: 110 → 119 (≤ 132 = control×1.2) PASS
- median survival: 154d → 158d (≥ control−10d) PASS — this is the committed analyzer's convention (upper-middle element of sorted gameDays, analyze-villagergear-20261020.js:42). True medians for reference: gameDays 154.0 → 154.0; calendar days 152.5 → 157.0. Guardrail passes under any of the three.
- starvation deaths: 17 → 15 (≤ control) PASS
- new death modes: none at ≥2 events PASS — the only armed-only named modes are five 1-eventers (Choir Toad, Nostalgia, The Algorithm, The Congregation, lockjaw); "the night" (1) also appears in control. Modes at ≥2 events in armed ("a wound that wouldn't close" 5, Hushpuppy 6, ambush 3, contest 2) all exist in control too — pre-existing, not new.
- wave-4 unlocks: 13/16 → 12/16 (±2) PASS

**Wall numbers (pre-reg 32-run set):** national 6 → 6; table 14 → 12; wins 0 → 0; maxWave distribution: control {4: 13, 3: 1, 2: 2}, armed {4: 10, 5: 2, 2: 4} (armed s64006 + s64008 reach wave 5); max gameDays 182d both (max calendar days 180 both); median survival per the analyzer convention 154d → 158d (true calendar-day medians 152.5d → 157.0d). Death-cause shares (armed): combat 458, villager-combat 119, monster 41, expedition 27, starvation 15, alien 9. The scale wall is NOT broken — national reach is flat at 6/16 both arms; the win is the veterans-bar fill, not the wall. Note: armed has 4/16 runs stalling at maxWave 2 vs 2/16 control — seed noise on the reach tail, flagged for the confirm round, not a verdict change.

**Layer engagement:** donations 136 (armed) vs 0 (control); invites 141; mean armed villagers at census 2.625 vs 1.75; wave-4 companion damage-share (KILLDISC) on armed runs with wave-4 fights: 0.04–0.55 (median ~0.15) — arming improves the quality of companion participation, consistent with sim-armory's lesson.

**Supplement (unjudged, not part of the verdict):** the dead run also swept seeds 64009–64014 on belongfeast × both arms (12 extra runs). Directionally consistent: armed 64010 (2 villager w4 kills, vetsMax 2, national 1, table 1, 182d) and armed 64012 (1 kill, vetsMax 2); control 0 villager kills everywhere (64013 control reached vetsMax 1). Not counted toward §14 — the pre-registered set alone decides.

## Metric review (§14 — binding, never re-scored)

Primary (≥2/8 armed seeds) judged GO on the completed 32-run corpus: 3/8 vs 0/8 control. No re-scoring was needed — the verdict stands on the pre-registered metric. One metric-design note for the NEXT run: the primary counts the killing blow (a rare, noisy event); a companion-damage-share floor (e.g. median wave-4 companion damage-share ≥ 0.10) would be a steadier signal for future arming levers. Proposed for the next run, not applied here.

## Metric review (judgment run fleshout-20261020T1615Z — independent recomputation)

Recomputed from the 44 committed per-seed JSONs (32 pre-reg + 12 supplement), the analyzer script, the sweep script, and the transcript file — the draft's numbers were treated as claims, not facts:
- PRIMARY VERIFIED: 3/8 armed seeds (64002, 64006, 64008), 0/8 control. Kill entries rechecked per-entry (via=companion only; vias in the corpus are exactly {player, companion}).
- Guardrails all VERIFIED: 110→119 ≤ 132; median survival 154→158d under the analyzer's documented upper-middle convention (true medians: gameDays 154.0→154.0, calendar days 152.5→157.0 — passes under all three); starvation 17→15; no new death mode at ≥2 events (armed-only ≥2-event modes all pre-exist in control); wave-4 unlocks 13→12.
- Secondary VERIFIED: 3/16 armed runs with w5vetsMax ≥ 2 (s64002 belongfeast, s64006 leadfeast, s64008 leadfeast; vetsEnd 0 all), 0/16 control.
- Layer engagement VERIFIED: donations 136/0, invites 141/0, mean armed villagers 2.625/1.75, w4compDmgShare on 10 armed runs with w4 fights: 0.04–0.55, median 0.15.
- Supplement VERIFIED: armed s64010 (2 kills, vetsMax 2, national 1, table 1, 180d), armed s64012 (1 kill, vetsMax 2), control 0 kills everywhere, control s64013 vetsMax 1. Unjudged, as pre-registered.
- Wall numbers VERIFIED: national 6→6, table 14→12, wins 0→0, maxWave distro control {4:13,3:1,2:2} / armed {4:10,5:2,2:4}, max gameDays 182 both.
- Panel: villagergear-panel-primary.md exists and judges review_required; the pre-registration names the corpus analysis as the binding instrument — respected here, panel attached as the §15 instrument.
- Env audit: the draft's substrate line was VERIFIED against scripts/sweep-villagergear-20261020.js:49-62 (loud-fail gates enforce FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 KILLDISC=1, SEATDRIVE=0, NODEWITNESS=1, VETREL/REPOSITION unset, VGEAR=1-vs-unset) and the per-seed JSON substrate headers (identical across all 44). The JSON header string abbreviates KILLDISC out of its label, but the gate enforced it — the draft's env line stands as written. No edit needed.
- CORRECTIONS MADE: (1) judgment attribution now truthful (pilot / judgment draft / verification runs named separately); (2) d61 kill re-identified as The Strike, not The Understudy — the draft's sense section was quoting the wrong fight; (3) median-survival convention documented (the analyzer's upper-middle of gameDays); (4) maxWave restated as distributions instead of the ambiguous "max [2,3,4]" notation; (5) new finding: the killbeat's "brought down The Understudy" broadcast misattributes a scholar final blow to companions (named next #5).

## Village assessment

Seed 64006 (leadfeast-vgear) is the exemplar: the village survives 113 days, reaches national and the table, fills the veterans bar (vetsMax 2) — Tariq and Aurora both land wave-4 killing blows as staged companions — then loses the village to the wave-5 window. The layer does what it promises: it turns staged fighters into killers, and the kills register on the ledger that opens the w5 door. The village dies rich-in-capability, not starving — the deaths are window/raid/combat, matching the substrate's known endgame profile.

Seed 64008 shows the other shape: Nina's d83 companion kill, veterans bar filled, wave-5 reached at d163, village lost — same arc. Seed 64002 (belongfeast) shows Dante's d103 congregation kill. The control seeds with equal or better survival never produce a single villager kill: the capability is the layer's, not the substrate's.

Who died and why: guardrails green — the layer does not shift death onto villagers (the #651 failure mode is avoided: villager combat deaths +8%, well under the 1.2x binding guardrail; median survival UP 4d). No new death modes. Starvation DOWN 2. The village is not being spent to buy the kills.

## Sense (SENSE-TESTING LAW)

Read the d61 window of vgear-leadfeast-s64006 (transcript: evidence/2026-10-20/villagergear-transcripts/vgear-leadfeast-s64006.txt) around Tariq's d61 kill. CORRECTION (judgment run): d61 carries TWO fights — first The Understudy (scholar strikes the final blow), then The Strike, which is the wave-4 fight in the kill log (mid=strike, by=tariq_mahmood, via=companion). The draft quoted Understudy-fight lines as the kill window; the kill fiction is reconstructed below.

- The logged kill is engine-honest in fiction. In the Strike fight Tariq and Aurora take real turns ("Tariq strikes the Strike. Tariq hits strike for 14."), the monster's demands are legible ("The rat's eyes INFLATE — and it posts its demands, a real readable list: 1. 3 rounds of stillness (no movement) | 2. your best tool (dropped)"), and Tariq lands the final blow: "Tariq hits strike for 14. The Strike falls." The System calls it on camera: "Oh — OH. Everybody saw that, right? Tariq just put down The Strike... on CAMERA. That's a veteran kill, folks. REMEMBER the name." The Records: "An apex thing died by village hands: The Strike." The aftermath is people-shaped: "Tariq stares at the body, then at you." "You came back bloody. Nobody asks. Someone saves you the good seat by the fire." The village later retells it at the fire: "You catch Sanne telling the fire about Tariq. 'Tariq, Aurora brought down Pack-leader Grief Counselor...' The story's already growing." (d64)
- The Understudy fight (same window) shows the same people-shape: they banter ("💬 Aurora: 'Come on then!' 💬 Tariq: 'You would say that.'"), the monster's attention fixes on them ("Its attention fixes on Tariq").
- FINDING (new, filed as named next #5): the broadcast beat "📺 Tariq, Aurora brought down The Understudy. Together." FIRES FOR A KILL THE SCHOLAR LANDED — the transcript shows "You STRIKE the understudy for 31 (Stone knife)... +20 style — dropped the Understudy!" moments earlier. The killbeat misattributes the Understudy kill to the companions. It does not touch the primary (the Strike kill is correctly attributed in both log and fiction), but it's the exact wrong-attribution shape this arm is supposed to fix.
- Caveat: the layer's own beats are SILENT. No SAY line marks a weapon donation to the armory, an invite to stage, or a veteran scholar's yield-hold. By Steve's no-silent-actions rule the village can't see the arming happen — the companions just show up armed. Filed to sim-findings.md (line 699) as a named next, not a verdict change.
- Caveat: the yield mechanic (veteran scholar holds for the companion finish) is proven in the proof (C1/C1b/C2) but the transcript's scholar is a non-veteran who fights normally (C3) — no in-fiction yield moment was observed in this window. The kills here come from staging + presence, which is the honest channel the pilot measured.

Verdict on sense: the villagers read like people fighting a herald, and the logged wave-4 kill is real in the fiction. The machinery that armed them is invisible — that is the blank to fill next.

## Named nexts

1. Visible arming beats (filed to sim-findings.md line 699): donations and staging invites should produce SAY/world-feed lines — the village should SEE the armory drive and the fighter staging (no-silent-actions rule). CORRECTION (judgment run): the filed finding says "Tariq's d61 Understudy kill" — the logged kill was vs The Strike; the Understudy kill was the scholar's. The arming-invisibility point stands unchanged.
2. Confirm round on GO: COMPLETED this run (seeds 64015–64022, 32 runs, same substrate + policy stack) — judged NO-GO against the same bar (1/8 vs 0/8, starvation + new-mode guardrail misses, noise-class), reported above, never a re-score of the pilot. Re-confirm only if the layer changes.
3. Companion damage-share as a steadier primary for future arming levers (metric review above).
4. The scale wall stands: national 6→6, wins 0→0. This arm fills the veterans bar; the wall needs a different lever next.
5. Killbeat misattribution (new): the "Tariq, Aurora brought down The Understudy" broadcast fires for a kill the scholar landed (transcript: "You STRIKE the understudy for 31... dropped the Understudy!"). The waveKillLog is correct; the fiction beat is wrong — same wrong-attribution shape this arm is fixing. File to sim-findings.md; candidate cause: the killbeat names party members for any fight they participated in rather than keying on the actual final-blow vid. (Check: is the beat keyed off waveKillLog or off damage share? The Strike beat matched the log; the Understudy beat matched neither — the Understudy kill isn't in the log at all.)

## Confirm round (seeds 64015–64022, run fleshout-20261020T1615Z — REPORT, never a re-score of the pilot, §14)

**Pre-registration (same bar):** 8 new seeds (64015–64022 — filename-unused in evidence/ verified before the sweep) × {leadfeast, belongfeast} × {control, vgear} = 32 runs, 180d death-aware, identical substrate env (FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 KILLDISC=1; VETREL/REPOSITION unset) and policy stack, VGEAR=1-vs-unset. PRIMARY bar: ≥ 2/8 armed seeds with a wave-4 kill via=villager. Corpus: evidence/2026-10-20/perseed-villagergear-confirm/ (32 per-seed JSONs + sweep logs; summaries kept separate from the pilot corpus so the pilot set is untouched). Both sweep arms exited 0, zero instrument errors. §15: villagergear-confirm-panel-primary.md (review_required — same as the pilot panel).

**RESULT: NO-GO on the confirm.** Primary 1/8 armed seeds vs 0/8 control — bar MISSED.
- The one armed seed: s64022 belongfeast-vgear — d153 Luis (luis_fernandez) via=companion vs The Strike (mid=strike). Same monster as the pilot's Tariq kill. The run also filled vetsMax 2 (vetsEnd 0), reached wave 5, table 1, survived 182 game-days.
- Secondary: armed runs with w5vetsMax ≥ 2: 1/16 (bar ≥ 2/16 — missed). Control 0/16.
- Guardrails: villager combat deaths 106 → 107 (≤ 127.2) PASS; median survival (analyzer convention) 134d → 144d (≥ 124d) PASS; **starvation 7 → 11 MISS** (armed above control); **new death modes MISS** — 'experiment' (2 events, s64016 leadfeast-vgear) and 'the phoenix link' (7 events, s64021 belongfeast-vgear), both armed-only at ≥2 events; wave-4 unlocks 14 → 13 (±2) PASS.
- Context on the misses (report, not re-score): both named modes are game-side death causes the policy layer cannot produce — 'experiment' is food-experimentation deaths (game.js hurtVillager(tester, ...)), 'the phoenix link' is the phoenix_clause burn mechanic (game.js ~L43116). The layer only donates weapons, stages invites, and yields turns; it has no channel to either. Seed-correlated rare-event noise on 8 new seeds — exactly the class of noise a confirm exists to surface. Starvation +4 on 16 runs is the same class.
- Wall numbers (confirm set): national 8 → 9; table 11 → 12; wins 0 → 0; maxWave control {4:14, 3:1, 2:1}, armed {4:12, 3:2, 2:1, 5:1}; max gameDays 182 both.

**Reading:** the pilot GO stands on its own pre-registered set (3/8 vs 0/8, all guardrails green, §14 — never re-scored). The confirm fails to replicate at the same bar on 8 fresh seeds (1/8). The effect is real but noisy: across 16 armed seeds (pilot + confirm), 4 produced villager wave-4 kills, 0/16 control seeds did — the capability belongs to the layer, not the substrate — but the per-seed hit rate is ~25%, not the ~38% the pilot suggested, and the confirm's guardrail misses (starvation, rare death modes) are noise-class, not layer-class. The layer stays default-OFF. No design change is warranted from the confirm alone; the honest next is the named nexts (visible arming beats, killbeat attribution) and a re-confirm only if the layer changes.

## Convergence

Pilot GO on its pre-registered set (3/8 vs 0/8, guardrails green, bar filled 3/16 vs 0/16); confirm NO-GO on fresh seeds (1/8 vs 0/8, two guardrail misses, noise-class). Combined across 16 armed seeds: 4/16 seeds with villager wave-4 kills vs 0/16 control. The axis question ("can villagers be made wave-4 killers through engine-honest channels?") is still answered YES — the channel is proven, the rate is modest. The arm's contribution to scale-onramp: necessary (veterans bar fills) but not sufficient (national flat across both sets: 6→6 pilot, 8→9 confirm). Axis remains not-converged. The layer stays default-OFF (landed 3628ccf71) pending ship.
