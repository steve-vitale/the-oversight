# Run flesh-out-2026-10-24-0446 — axis scale-onramp (COMPLETE)

## Pre-registration (written before any sims)
- AXIS: scale-onramp (standing directive: attack the scale wall until the tracker records it converged). Sibling loop B live-claimed food-economy (0430Z) — not touched.
- Arm 1 sim-vetcontact (LEVER, policy-side, zero src/js): VETCONTACT=1 havencontact formation lever per evidence/2026-10-24/sim-wallseg.md named next. PRIMARY: wave-4+ kills per config, armed vs control, paired identical seeds, 8-seed pilot (32 configs), 180d death-aware, full landed substrate (FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1 LINKFORM=2). GO iff armed−control ≥ +4 AND armed≥control on ≥6/8 pairs. Engagement: contactStages>0 on ≥12/16. Guardrails: median survival paired diff ≥ −10d; starvation ≤ control+2; no new death kinds.
- Arm 2 sim-bloodrestage (LEVER re-stage, zero new src/js): landed BLOODRESTRAINT=1 hook on the formation-rich VETRESTAGE band (seeds 65511–65518, the re-stage's rich band), restraint the only delta. Formation-conditional PRIMARY: window-mantle-deaths (14d window from first kill, death inside with player flag), GO iff control ≥ 3 AND armed ≤ control−2. Same guardrails + picked-successor survival watch.
- Arm 3 sim-vetautopsy (DIAG, claims backlog #859): per-death-row telemetry for wave-4+ killers over the defer5-rediag band (70111–70122), 24 configs. DIAG-GO iff ≥90% of killer deaths fully attributed, remainder in an explicit unexplained bucket <10%.
- §15: before/after through scripts/balance-panel.js (panel is the instrument, the bars above are the judge). Metric review sections mandatory in all three arm evidence files.

## Arm 1 — sim-vetcontact: PILOT NO-GO → killed-at-pilot (landed 07a3ede32)
- PRIMARY: wave-4+ kills (waveKillLog direct) control 18 vs armed 15, delta −3 (bar ≥+4) → FAIL. Pairs armed≥control 7/8 → PASS, but both clauses required. Per §14 a miss is NO-GO, never re-scored.
- ENGAGEMENT: contactStages>0 on 1/16 armed configs (bar ≥12) → NO-GO. Staged wave-4 fights 41 vs 40.
- GUARDRAILS: PASS. Median survival paired diff 0.0d; starvation 6 vs 4; no new death kinds; wall national 9/16 both arms, table 11/16, wins 0/32.
- ROOT CAUSE (why the lever is wrong, not the implementation): the havencontact fight is fought by the SAME party vetformation stages — 9/11 vc-attributed staged fights were already vf-staged; net union gain +1 staged fight, −3 kills. Firing opportunity is rare (10 contact-days/16 configs; vetformation's signal is usually hot when monsters are about, skipVfHot up to 81/config). When it fires it can't commit (1 invite in 10 contact-days). The "channel gap" the DIAG measured was a location gap, not a staging gap.
- Proof 37/37 GREEN pre-kill (mechanism correct, theory wrong). Policy file deleted per kill discipline; measurement record + evidence + corpus landed. Proof's armed gates are unrunnable post-kill by design.
- Sense: in the one config where the beat acted (s70903-belong, national+table reached), all 3 wave-4 kills were closed by vetformation-staged Elif — the lever was a passenger in its own best case. Trace-honesty note: the vc fight trace affirms formations without invites, overstating agency; contactStages (commits) is the honest instrument.
- Telemetry: "wins disappeared" LOUD on both arms = regime artifact (baseline is the winseat stack; pre-seat SEATDRIVE=0 substrate) — explained, baseline NOT rolled.

## Arm 2 — sim-bloodrestage: NO-GO → killed-at-pilot (landed 50e25ddb4; hook reverted fa10e1ca8)
- PRIMARY (formation-conditional): window-mantle-deaths control 3 vs armed 3 (bar control≥3 AND armed≤control−2). Floor MET (exactly 3) — this is a mechanism-scoped miss, not base-rate-limited.
- ROOT CAUSE (lever confirmed wrong per KILL DISCIPLINE): 3/3 control window-mantle-deaths were ALREADY SCHOLARS at kill time (gen_8mdijoz s65513, sofia_chen s65514, gen_mcowb5v s65517 — all took the office days before their wave-4 kills). A succession-candidacy filter can never fire for them — the restraint's addressable population on the rich band is ~zero by construction. The single wild firing (armed-leadfeast-s65517 d131) held gen_y1ietd2 and picked amina_diallo — dead as scholar +1d in the same combat meat-grinder; village died out d132. Combined with the pilot: 3/3 restraint-picked successors dead within a day. The restraint trades a blooded-vid chair death for a picked-successor chair death — the chair during a crisis eats whoever holds it.
- The pilot's restore (db7c5f211) was justified by a base-rate-limited miss; this re-stage's miss is mechanism-scoped, so that justification is spent. Hook REVERTED to zero src/js trace (fa10e1ca8; ledger.js byte-identical to pre-restore; default-off so live behavior unchanged). Instrument scripts retained per precedent. Mantlechain lane stays open: new-scholar restraint window; scholar's haven defense.
- Secondaries: coincidence days 3/3 (no gain); distinct living veterans 2/3 (noise). Engagement brEvents control 0 / armed 1. Guardrails all PASS. Wall: national 7/16, table 13/16, wins 0/16 both arms, medSurv 141.
- Proof 30/30 GREEN on the re-stage substrate pre-revert (mechanism deterministic; recorded in evidence).
- Telemetry: LOUD lines (table 16→26, wins 16→0) = winseat-regime artifact; control==armed on all metrics; baseline NOT rolled.

## Arm 3 — sim-vetautopsy: DIAG-GO (landed 26699ef52; backlog #859 → FIXED)
- 24-config census (70111–70122 × lead/belong, armorvillage+armorydrive pinned, 180d, anchor 84d390816755), zero src/js. 6/6 wave-4+ killer deaths fully attributed, 0 unexplained.
- ATTRIBUTION — what kills the veterans: **the CHAIR, 6/6 (100%)**. Every wave-4+ killer who died died as the mantle-holder: all 6 were picked successors (0/6 initial scholars), all dead within 14 days of first blood (0, 1, 2, 4, 7, 10d; median 4d), 5/6 in aid-crisis haven defense against named wave-4 monsters (eulogy, suburb, algorithm ×2, congregation), 0/6 wearing armor (verified via the correct armorBonus() read path after catching a mid-run instrument misread).
- 18/24 configs never formed a veteran at all — formation remains the larger wall segment.
- Wall: national 7/24, table 17/24, wins 0/24, wave4 21/24, wave5 0/24, median survival 145d.
- Proof E1–E6 ALL GREEN (classifier units 24/24, byte-identical determinism, blind hand-audit 6/6 agreement, env-guard, band gate, dedup). Post-rebase re-run: ALL GREEN.
- Sense: 4 veterans' last days read end-to-end — genuine blow-by-blow fights with the scholar leading from the front; deaths read as structural (the fiction working as designed), which is why a restraint, not a stat lever, is the honest next move.
- New findings appended to sim-findings.md: (1) aid-crisis haven-defense channel (5/6 chair deaths — wave-4 engagements seek the scholar at the haven); (2) the unarmored scholar (0/6 — the armorvillage economy arms the village but not the blooded scholar; design question, not chased).
- Metric-review gap documented: exposure (combat_start rows) and conversion (waveKillLog kills) are visible; per-fight non-conversion outcomes remain unknowable from this telemetry.

## Convergence
scale-onramp stays converging (NOT converged). This run: TWO kills with teeth (vetcontact: theory-of-change dead — havencontact needs no independent staging; bloodrestraint: mechanism-scoped kill, hook reverted) and one DIAG-GO that closes #859 and names the veterans leg precisely — the chair eats 100% of blooded veterans, all picked successors dead within 14d of first blood. The veterans leg is now: formation (18/24 never form) + chair-retention (the mantlechain lane's named nexts: new-scholar restraint window, scholar's haven defense). Wins 0 everywhere (structural on SEATDRIVE=0); wave5 0/24 on the autopsy band.

## Wall numbers (this run, per corpus)
- vetcontact: national 9/16, table 11/16, wins 0/32, wave-4 kills 18/15 (control/armed), median survival paired diff 0.0d
- bloodrestage: national 7/16, table 13/16, wins 0/16, medSurv 141
- vetautopsy: national 7/24, table 17/24, wins 0/24, wave4 21/24, wave5 0/24, median 145d

## Village assessment
Thirty-two paired villages watched the haven door: the contact lever staged one formation in sixteen villages and the wave-4 kills went to vetformation's fighters anyway — Elif closed all three in the lever's best case. Thirty-two more watched the chair: the restraint held one blooded vid back and the village spent amina_diallo instead, dead the next day in the same grinder. Twenty-four watched their veterans: six blooded, six took the office, six died in the chair within two weeks — none of them wearing armor, five of them defending the haven when the wave-4 call came. The chair is not a position of power. It's where the village puts the people it can't afford to lose, right before it loses them.

## Infrastructure incidents (all LOUD, all recovered)
1. safe-commit INDEX CLOBBER struck 3 more times (coordinator's brrevert commit; both lever arms' commits) — repaired via update-index --cacheinfo after blob verification; commits always correct.
2. sim-bloodrestage worktree's docs/ONTOLOGY.md found EMPTY post-worker (2000-line truncation, same destruction class as the tracker incidents) — restored from HEAD (branch never touched the file), verified 2000 lines.
3. EPERM flap hit the vetautopsy panel write + one evidence write — retried clean; /tmp+same-command-copy recovery used once.
4. The brrevert safe-commit REFUSED the -69-line deletion as "stale-tree revert signature" — intentional and verified (ledger.js untouched since db7c5f211; reverse-apply byte-identical to pre-restore); re-ran with --force-delete per the guard's own instruction.

## Metric review (§14)
All three arms judged against pre-registered bars; no re-scoring. vetcontact's engagement bar (≥12/16) correctly measured the theory's death (1/16). bloodrestage's formation-conditional bar fired as designed (floor met, mechanism missed). vetautopsy's DIAG bar met exactly (6/6 attributed, 0 unexplained). No metric revisions proposed.

## Telemetry deviation check (§13 step 10)
Ran node scripts/telemetry-check.js against all three arm corpora (baseline scale-wall.json, metrics national/table/wins/exiled):
- perseed-vetcontact (control + armed, 16 files each): LOUD wins 16→0 on both — regime artifact (WINSEAT full-stack baseline vs pre-seat SEATDRIVE=0 substrate), same class as the week's precedents.
- perseed-br-rst (33 files): LOUD table 16→26 + wins 16→0 — regime artifacts (formation-rich band n=33 vs baseline n=16; the band's table rate 26/33 = 79% matches the defer5-rediag band's 19/24 = 79%; worker verified control==armed on all metrics).
- perseed-vetautopsy (24 files): LOUD wins 16→0 — regime artifact (pre-seat).
All LOUD lines investigated and explained (regime/substrate/n-mismatch, never an arm effect). Baseline NOT rolled forward.
