# sim-vgearseat — "the veteran channel on the winning substrate" (flesh-out loop, 2026-10-20, ARM sim-vgearseat)

Run: fleshout-20261020T2145Z. Axis: scale-onramp (the blocking axis).
POLICY-SIDE LEVER — zero src/js changes. New file scripts/policies/vgearseat.js (composition layer, VGEAR=1 default-OFF over the default-on seat stack).

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave-4 roster + bands, the readiness gate, VILLAGER XP LAW — villager kills score the ledger exactly like the player's).

## The bind

- VGEAR is the ONLY proven veteran channel (sim-villagergear: pilot GO 3/8 armed seeds with a wave-4 kill via=villager vs 0/8 control; combined 4/16 armed vs 0/16 control; w5vetsMax ≥ 2 on 3/16 armed vs 0/16 control; s64006 exemplar fills the veterans bar then dies in the wave-5 window). It was proven on the w5doormeasure substrate with SEATDRIVE=0 (pure delegation).
- The seat substrate is the ONLY substrate with real wins (sim-seatdefault: 10/16 wins, all one track). The scale-onramp axis's binding wall is the wave-5 door: 18 of 21 villages reaching the wave-5 door die inside the window; the 2-living-veterans bar is the readiness gate's hard proof.
- VGEAR has NEVER run where the table actually works. This arm is the first end-to-end test of the only proven veteran channel against the binding wall (the wave-5 door) on the substrate where wins happen: withSeatDrive(withWinDefer(withVetrel(withReposition(TF leadfeast/belongfeast)))) wrapped OUTSIDE by withVillagerGear.

## Composition honesty (proved BEFORE the sweep — scripts/test-vgearseat-20261020.js)

E1: VGEAR=1 + SEATDRIVE=0 delegates byte-identically to the vgear pilot's SEATDRIVE=0 armed substrate (the exact stackFor from scripts/sweep-villagergear-20261020.js, rebuilt inline — same call chain, same tags).
E2: VGEAR unset + SEATDRIVE unset = the pure seat stack byte-identical (this module's inner stack vs seatdrive.js's prebuilt leadseat/belongseat — the winning 10/16 substrate objects; the withVetrel/withReposition wrappers are env-inert and delegate purely).
E3: VGEAR unset (gate off) = pure delegation to the wrapped stack.
E4: VGEAR=1 armed diverges from control — the layer acts on the seat substrate.
D2: 180d armed run per policy completes, deterministic re-run.
If any composition gate failed, the composition would NOT have been "fixed" — the arm would FAIL LOUDLY and stop. (Gate results: see Proof section below.)

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the sweep)

**PRIMARY:** seeds reaching wave-5 unlock (maxWave ≥ 5, from runDays' maxWaveUnlocked).
**GO threshold:** ≥ 2/8 armed seeds vs 0/8 control (the vgear pilot bar). A miss is NO-GO, never re-scored (§14).
**Unit note:** seed is the randomization unit (policies leadfeast/belongfeast are the two competent variants); a seed counts if EITHER config reaches wave 5. Per-run counts also reported.

**Horizon:** 180d death-aware (dead villages stop simulating, +10d tail max via the harness). Set from the baseline survival distribution (the seat substrate's wins land ~day 90–130; wave-4 kills happen in the door window ~day 60–120).

**Seeds:** pilot 8 FRESH seeds (64301–64308 — verified filename-unused in evidence/ before the sweep; TAKEN at pre-registration: 64001-64008, 64009-64014, 64015-64022, 64201-64208, 8801-8808, 5411-5426, 63901-63908, 61205) × {leadfeast, belongfeast} × {control, vgear} = 32 runs.

**Policies:** control = seat stack (VGEAR unset, SEATDRIVE unset — default-on drives the seat); armed = withVillagerGear OUTSIDE the seat stack (VGEAR=1). Composition: scripts/policies/vgearseat.js.

**Substrate env:** FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 NODEWITNESS=1 KILLDISC=1 (VETREL/REPOSITION unset → inert; SEATDRIVE unset → default-on drives the seat). The sweep FAILS LOUD unless the env matches exactly. (Env-trap note: read the Usage header of the proof/sweep and run exactly per it.)

**SECONDARY (report, don't judge):** runs with w5vetsMax ≥ 2; wall numbers (national/table/wins, wave reach 1–5, median/max survival, death-cause shares); wave-4 kills via=villager (the vgear pilot's proven metric — reported as the mechanism check).

**GUARDRAILS (all must hold):**
- villager combat deaths ≤ control × 1.2;
- median survival ≥ control − 10d;
- starvation deaths ≤ control;
- no new death mode (≥2-event rule);
- wave-4 unlocks within ±2/16 of control.

**§15:** before/after comparison through the balanced panel (scripts/balance-panel.js schema — the panel is the instrument, the GO threshold is the judge). Compare .md attached (vgearseat-panel-primary.md).

**KILL PROTOCOL:** if killed at pilot, the composition layer (scripts/policies/vgearseat.js) is deleted zero-trace (verify zero refs); instruments + evidence + proof land with the KILLED-VERDICT. Killed arms leave no trace in game code.

**SENSE-TESTING:** re-run the first armed seed with a wave-5 unlock (or the first veterans-bar fill) with Game.say/sysSay restored; read the window; judge whether staged villagers behave like people. Quote lines.

## Proof

scripts/test-vgearseat-20261020.js — RED→GREEN on the composition + det-gates + D2 real-sweep gate:
- RED phase: module absent → exit 1 (verified before writing the layer).
- E0 composition shape (exports, id tags).
- E1/E2/E3/E4 det-gates (real harness, 60d, per-day hash trajectories).
- D2 real-sweep gate: 180d armed run per policy completes, deterministic re-run.

**GREEN run (2026-10-20, this tree @ d67a7520f): 13/13 PASS, 0 fail:**
- E1a/E1b PASS: VGEAR=1+SEATDRIVE=0 armed == vgear pilot's SEATDRIVE=0 armed substrate, byte-identical (s64301 leadfeast, s64302 belongfeast).
- E2a/E2b PASS: VGEAR unset+SEATDRIVE unset control == prebuilt leadseat/belongseat (the winning 10/16 substrate objects), byte-identical — the withVetrel/withReposition wrappers are env-inert, proven not asserted.
- E3 PASS: VGEAR unset armed obj byte-identical to the inner stack (gate-off pure delegation inside the module).
- E4 PASS: VGEAR=1 armed diverges from control on the seat substrate (the layer acts; on=1654 vs off=1655 hash chars).
- D2 PASS: 180d armed leadfeast s64301 completes, deterministic (days=180/180, end=survived); 180d armed belongfeast s64301 completes, deterministic (days=155/155, end=over-other).
- Composition honesty holds on both substrates. The sweep is authorized.

## Results (JUDGED — corpus complete, 16 control + 16 armed)

**PRIMARY: NO-GO — 0/8 armed seeds reach wave-5 unlock (control 0/8).** Bar was ≥ 2/8 armed. A miss is NO-GO, never re-scored (§14).

**SECONDARY:** runs with w5vetsMax ≥ 2: 0/16 armed vs 0/16 control. Villager wave-4 kills: 0/8 seeds both arms — all 3 wave-4 kills in the corpus are via=player (the scholar: armed s64301 d159 The Influencer, armed s64304 d66 The Algorithm; control s64307 d121 The Influencer).

**GUARDRAILS — 4/5 pass:**
- villager combat deaths: 108 → 113 (≤ 130 = control×1.2) PASS
- median survival: 96d → 90d (≥ 86d = control−10d) PASS
- starvation deaths: 12 → 9 (≤ control) PASS
- new death modes: none at ≥2 events PASS
- wave-4 unlocks: 7/16 → 11/16 (±2) **MISS** (|diff| = 4)

**Wall numbers:**
- control: national 11/16, table 12/16, wins 11/16, wave-reach {w3:7, w4:7, w2:2}, median survival 96d, max 182d
- armed: national 11/16, table 11/16, wins 11/16, wave-reach {w4:11, w3:4, w2:1}, median survival 90d, max 182d
- death-cause shares: combat ~60%, villager combat ~22–23%, monster ~4–5%, expedition ~4–5%, starvation ~2%, sickness ~1–2%, contest ~1–2% (both arms — the substrate's profile, unchanged)

**Layer engagement:** donations 0 → 6.7/run, invites 0 → 4.1/run, armed villagers (wb≥12) 5.1 → 5.9. The layer is LIVE on the seat substrate (proof E4) — it donates, stages, arms — and moves nothing about the outcome.

**Panel:** vgearseat-panel-primary.md — review_required; the pre-registration names the corpus analysis as the binding instrument — respected here, panel attached as the §15 instrument.

**Recovery note:** a host service restart at ~22:47 UTC killed both sweep processes after 1 seed each; both arms were relaunched from scratch and completed (exit 0, zero instrument errors). The 2 pre-restart JSONs were recomputed and overwritten deterministically.

## Metric review (§14 — binding, never re-scored)

Primary judged NO-GO on the completed 32-run corpus: 0/8 vs 0/8. No re-scoring was needed or performed — the verdict stands on the pre-registered metric.

Two metric-design notes for the NEXT run:
1. The wave-4-unlock guardrail (±2/16) was calibrated on the vgear pilot's pre-seat substrate, where unlocks shouldn't move. On the winning substrate the armed arm moved unlocks 7→11 — directionally ALIGNED with the axis (more villages reaching the wave-4 window), but the guardrail is binding and the MISS stands as recorded. A future run on a winning substrate should pre-register the unlock guardrail one-sided (armed must not REDUCE unlocks below control−2) rather than ±. Proposed for the next run, not applied here.
2. The primary (wave-5 unlock) assumes the run lasts long enough for the wave-4→5 door to matter. On a substrate that wins at ~day 90–134, the run ENDS before the door opens — the metric measures the substrate's win, not the channel. For compositions on winning substrates, pre-register a mechanism primary (e.g. villager wave-4 kills, or w5vetsMax ≥ 1) alongside the wall primary, so a structural truncation reads as mechanism-zero rather than wall-zero. Proposed for the next run.

## Village assessment

The seat substrate wins before the veteran channel can operate. 11/16 wins on BOTH arms — the table win lands ~day 90–134 and the run ENDS at the win (control s64301 leadfeast won d134 at maxWave 3; armed s64304 leadfeast won d90 at maxWave 4). The wave-4 window needs standing ≥100 AND the readiness bars; the veterans bar needs wave-4 KILLS by villagers. By the time villagers could blood themselves, the village has already sat the table and won. The vgear channel was proven where the game runs LONG (the s64006 exemplar: 113 days, veterans bar filled, then died in the wave-5 window). On the winning substrate there is no long game — the win truncates the channel's operating window. The composition is structurally incompatible with its substrate, not mis-tuned: the layer donates (6.7/run), stages invites (4.1/run), arms villagers (5.9 wb≥12) — and the wall numbers don't move because the game is already over.

Who thrived and who died: both arms are the seat substrate's village — national 11/16, table 11–12/16, wins 11/16, deaths combat-heavy (60% combat, 22% villager combat). The layer does not shift death onto villagers (108→113, under the 1.2× binding bar) and does not starve anyone (12→9). No new death modes. The village is not being spent.

The scale wall, reframed: national IS reached (11/16 both arms) — via the table win, not via wave-5. The standing directive's lift condition (national/table reached in sims) is met on the numbers; the wave-5 door remains unopened (0/16 both arms). The axis question moves from "can villages reach national" to "can anything reach wave 5 on a substrate that wins first" — a coordinator/tracker call.

## Sense (SENSE-TESTING LAW)

Re-ran the first armed wave-4 kill window with SAY restored: vgear-leadfeast-s64304 d64–d71 (The Algorithm d66, scholar final blow; run won d90). Transcript: evidence/2026-10-20/vgearseat-transcripts/vgear-leadfeast-s64304.txt (748 lines).

- The staged villagers read like people fighting a herald. Elif and Ricardo (staged, armed by the layer) take real turns and land real blows: "Elif strikes the Algorithm. ... Elif hits algorithm for 29.", "Ricardo strikes the Algorithm. ... Ricardo hits algorithm for 50.", "It's reeling — the party sees the opening and piles on! (+25% vs controlled)". They whoop at the kill: "Elif whoops. 'That's how it's done!'" — and go back to chores after: "Ricardo heads out for water. 'The well won't fill itself.'"
- The aftermath is people-shaped: "You came back bloody. Nobody asks. Someone saves you the good seat by the fire." The fire retells the story: "You catch fragments by the fire — Ricardo telling Wei about you. The truth left this story two fires ago. What's left is better theater."
- The System voices the binding wall honestly mid-window: "📺 SYSTEM: "📡 The fifth draft stays in the wings — armor the village (2 of 4 fighters armored); blood your fighters (0 of 2 veterans)."" — the readiness hold beat naming the short bars, exactly as designed. Wave 5 stays in the wings because veterans = 0.
- The structural reason the mechanism can't fire here: the scholar's Phase blade hits 235–313 while staged companions hit 23–50. The scholar is a godhood build; no companion can reach the killing blow first, and the yield mechanic never arms because the scholar is a non-veteran fighting normally (C3 — correct: this IS the scholar's first wave-4 kill). The vgear channel needs a scholar who ISN'T the overwhelming finisher; the winning substrate produces exactly the scholar who is.
- The arming IS visible in the fight fiction — companions present, armed, landing blows — even though the kills don't transfer. The machinery is no longer invisible in the fight itself.
- Caveat (standing from the pilot): the layer's own beats are SILENT — no SAY line marks a weapon donation or a staging invite (filed to sim-findings.md line 699). Unchanged.

Verdict on sense: the villagers behave like people; the fiction is honest about why wave 5 stays shut. The composition's failure is structural (the win ends the run), not fictional.

## Named nexts

1. **STRUCTURAL (filed to sim-findings.md):** the seat win truncates the veteran channel. On a winning substrate (table win ~d90–134) the wave-4 veterans bar cannot fill because the run ends before villagers blood themselves. The vgear channel needs the long game; the seat substrate doesn't play one. Candidate designs (all Steve-calls, not worker decisions): (a) veterans bar counts wave-3+ kills (canon change to the readiness gate); (b) test vgear on a non-seat long substrate (SEATDRIVE=0, 180d+ horizons); (c) table-win doesn't end the run (canon — unlikely). This is the honest next, not a re-tune of the composition.
2. Metric: one-sided wave-4-unlock guardrail for winning substrates (see Metric review §1).
3. Metric: mechanism primary alongside the wall primary for compositions on winning substrates (see Metric review §2).
4. The pilot's named nexts stand: visible arming beats (sim-findings.md line 699), killbeat misattribution (#5).

## Convergence

**KILLED-AT-PILOT.** The composition layer (scripts/policies/vgearseat.js) is deleted zero-trace (zero refs verified); instruments + evidence + proof land with this KILLED-VERDICT. The axis question ("can the proven veteran channel move the wave-5 door on the winning substrate?") is answered NO — structurally: the table win ends the run before the channel's operating window opens. The kill is fast and clean: 13/13 proof gates green before the sweep, 32/32 runs completed, verdict on the pre-registered primary with no re-score. Axis remains not-converged; the wave-5 door stands unopened (0/16 both arms) while national/table/wins replicate at 11/16 on the seat substrate.
