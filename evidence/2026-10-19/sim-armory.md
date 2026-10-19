# sim-armory — presence-preserving arming: the 10th production attempt (2026-10-19)

Run: flesh-out loop arm sim-armory (run_id fleshout-20261019T0415Z, loop oversight-flesh-out-loop), axis scale-onramp (the blocking axis).
Worktree: ~/workspace/worktrees/sim-armory (registered at 8433576dc; master moved mid-registration to 66e51053c — rebased inside the tree before landing).
Canon: docs/CANON.md (individual ownership — Steve 2026-10-09), the game.js villagerGearUp comment block (Steve 2026-10-09), villager-build.js villagerGearDay.

LINEAGE: sim-killdisc (2026-10-18) reframed the bind — companion wave-3 damage-share 1.5% vs kill-share 0%; the base channel has no companion damage to convert. sim-vetarm (2026-10-19, 9th production attempt) armed + exposed: the arming beat worked (167 weapons entered circulation, 0 errors, all gates green) but the patrol beat killed 19 able villagers — weapons in the hands of dead or absent villagers don't raise damage-share (damage-share 0.23x, survival −30d, 'patrol combat' new death mode). sim-vetarm's named next #1 — this arm: the arming beat ALONE, no patrol assignments, no movement of fighters. Presence is the binding constraint (killdisc's finding, confirmed by the patrol-beat autopsy); the arming must not move the fighters.

## Substrate

- policy: tribfloor leadfeast/belongfeast (the feastscale leadfeast/belongfeast + TRIBFLOOR layer — identical to sim-vetarm's control) + armory layer (ARMORY=1)
- env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 NODEWITNESS=1 (the killdisc/compchan pre-seat substrate)
- seeds: 8 fresh (63511–63518 — verified filename-unused in evidence/2026-10-19/perseed-*/ before the sweep), x {lead, belong} = 16 runs per arm, paired on identical seeds
- horizon: 180d death-aware (dead villages stop simulating; runDays handles this)
- instruments: KILLDISC=1 (the killdisc read-only instrument — per-source tbDamage attribution on wave-3+ monsters; proven non-perturbing) + call-through observation wrap on Game.donateWeapon (counts only, zero state writes, zero RNG draws). No assignTask wrap: the layer never calls it (proof A10); any call would be a loud failure, not telemetry.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14–15 — BINDING, written BEFORE the sweep)

**PILOT PRIMARY (mechanism):** companion wave-3 damage-share (armed) ≥ 2x control → GO to confirm. (Control re-baselined on this corpus; vetarm re-measured 2.19% vs killdisc's 1.5%.)
**ENGAGEMENT:** donations engaged ≥ 10 armed runs (the vetarm beat did 167 donations/16 runs; the layer must genuinely fire).
**CONFIRM (gated on pilot GO):** 12–16 fresh seeds x 2 policies through the balanced panel; PRIMARY outcome: living-veterans at end of run ≥ +2/16 armed vs control.
**GUARDRAILS:** median survival ≥ control−10d; starvation deaths ≤ control+2; no new death mode (esp. no patrol-combat deaths — assert the mechanism doesn't move fighters); national/table not degraded.
**KILL PROTOCOL (pre-registered):** on miss, the layer is deleted zero-trace; instruments + evidence land. A miss is NO-GO, never re-scored mid-run.

## The lever (scripts/policies/armory.js — POLICY-SIDE ONLY, zero src/js)

ARMORY=1. The arming/donation beat ALONE — one push/day at Haven, keeping the communal armory at ≥ 3 weapon units (the vetarm level, confounded nowhere):

1. **Worst-spare donation:** donate the worst donatable weapon from the scholar's inventory — def.class === 'weapon', not bonded, not keepsake, STRICTLY worse than the scholar's equipped best (max melee/ranged weaponBonusOf). Never the scholar's only edge (equipped best == 0 → no donation).
2. **Knap fallback:** no spare but stone+vine on hand → craft stone_knife and donate it. The vinebank keeps first claim (vinebank.defersCraft(Game, 'stone_knife') defers, counted — same deference as competent.js).
3. **Presence:** the layer never calls Game.assignTask or Game.takeWeapon — no fighter is moved, assigned, or borrowed-from. Weapons reach fights through the game's own distribution (daily villagerGearDay: armory weapons go to the biggest gains first, one per villager per day) and departure gearing (villagerGearUp: communal armory is the third acquisition rung — deposit is consent).

**ARMOR NOTE (documented, not re-litigated — sim-vetarm finding #3):** armor has no honest policy-side channel. No communal armor pile (storage.js: "armor/misc have no deposit hook", canon); individual ownership is Steve's law (transfer paths: owner's own equip, deliberate give/trade, discard, death); no gift verb exists in the game. A gift verb or armor deposit hook is a Steve-call (game design), not a policy lever. This layer never touches armor.

## Proof

`scripts/test-armory.js` — RED→GREEN on the layer:
- RED phase (real): run before the layer existed → exit 1, "RED: scripts/policies/armory.js missing and ARMORY_KILLED not set."
- A1 gate honesty: ARMORY unset → pure delegation (no ctx keys, no armory change)
- A2 worst-spare donation; A3 unarmed scholar → no donation; A4 armory ≥ 3 → no-op + one push/day; A5 knap fallback; A6 vinebank deferral (test-bug fix: patch the destructured vinebank object, not the module wrapper); A7 equal-bonus not a spare; A8 keepsake/bonded skipped; A9 armor never donated; A10 presence — assignTask/takeWeapon never called
- C1 det-gate (real harness): gate-off byte-identical to tribfloor leadfeast/belongfeast (2 seeds × 60d); gate-on deterministic; gate-on non-vacuous
- C2 real-sweep gate: 180d armed runs complete per policy, zero errors, deterministic re-run

## Results — PILOT

**PILOT VERDICT: NO-GO. The layer is killed per the pre-registered kill protocol.**

16+16 runs, 0 instrument errors, 0.0% other-share on both arms:

| metric | control | armed | bar |
|---|---|---|---|
| companion wave-3 damage-share | 3.33% (527/15,834) | 3.01% (839/27,875) | ≥2x |
| ratio | — | **0.90x** | ≥2.0x |
| killing fights | 33 | 46 | — |
| fights with ANY companion damage | 5 | 5 | — |
| w3 companion kills | 1 | 3 | — |
| living veterans (end, sum) | 1 | 1 | — |
| wave-4 reach | 14/16 | 14/16 | — |
| wave-5 reach | 0/16 | 0/16 | — |
| national reach | 6/16 | 7/16 | — |
| table reach | 14/16 | 15/16 | — |
| wins | 0/16 | 0/16 | — |
| median survival (gameDays) | 113 | 134 | ≥ control−10d |
| starvation deaths | 1 | 1 | ≤ control+2 |
| death modes | 19 modes incl. combat, villager combat, monster… | 14 modes, **none new** | none new |

The primary missed (0.90x vs the 2x bar). All guardrails PASS: median survival +21d (bar −10d), starvation 1 vs 1 (bar +2), no new death mode (esp. no patrol-combat — the mechanism never moved a fighter), national/table not degraded (7/16 vs 6/16 national, 15/16 vs 14/16 table).

### Engagement (the beat genuinely fired)

| beat | control | armed |
|---|---|---|
| armory donations | 0 | 166 |
| armory end (units, sum) | 0 | 34 |
| armed companions ≥12 wb (sum) | 6 | 17 |
| median companion wbonus (median of run-medians) | 0 | 8 |

The arming moved the ARMED readiness bar (6→17 armed companions, median companion wbonus 0→8) — but not the damage-share. The fight-count is identical (5 fights with companion damage on BOTH arms): arming improved the QUALITY of companion participation, not its FREQUENCY, and frequency dominates the share.

### Balanced panel (§15)

`evidence/2026-10-19/armory-panel-primary.md` — control→armed compare: decision `review_required`; all deltas ±0.125 on 8 paired cases with 95% exploratory intervals crossing 0 (table invitation −0.125, national ±0.125/±0.25, player deaths ±0.125) — no material signal, consistent with the guardrail verdict. (Panel-instrument note: the scorecard requires substrate flags AND observerDigest identical between panels — the intervention flag must NOT be in `options.flags`; arm identity is positional. Fixed in build-armory-panels.js during this run.)

### Wall numbers (this run, 32 runs)

national 6–7/16 per arm (13/32), table 14–15/16 (29/32), wins 0/32, wave-4 28/32, wave-5 0/32, median survival 113/134d, max 174/164d. End reasons: 31 village-lost + 1 village-dead — every village died; the table is REACHED (29/32) but never survived. The scale wall stands: villages reach national/table and then die; nothing in this run moved the win flag.

## Village assessment (plain words)

The modal village fights wave-3 monsters with the scholar doing 97% of the damage. On the armed side, the scholar's donated spares flowed through the armory into companions' hands — 17 armed companions vs 6, median weapon bonus 8 vs 0 — and the companions who did join fights hit like fighters, not bystanders. But the number of fights with ANY companion damage didn't budge (5 vs 5): the village's fighters stand beside the scholar in exactly as many wave-3 fights as before. The weapons wait in the armory (34 units at end of runs); the hands that would wield them are busy fishing, cooking, and hauling — or dead. Presence, not gear, is the binding constraint: this run proves it from the other side. Vetarm proved that moving fighters kills them; armory proves that arming them without moving them doesn't get them into the fight.

Who thrived: Dale (s63517) — solo-killed a wave-3 Focus Group for 325 damage, the run's single best companion performance. Who died: everyone, eventually — 31/32 villages lost, 1 dead outright; the wall is mortality, not armament. What was missing: a reason for an armed companion to be STANDING NEXT TO the scholar when the wave-3 monster arrives. The blank this run fills is the presence-vs-arming separation; the blank it names is presence-routing without movement.

## Sense-testing (SENSE-TESTING LAW)

Read: evidence/2026-10-19/armory-transcripts/belongarmory-s63517.txt (d90 focus_group, d129 callback — the arm's companion-damage fights).

The d90 fight is the honest payoff the whole veteran-production line has been chasing. "⚔ BIG-EYES! Dale joins you!" Dale strikes ~10 times for 30–40 each (FEASTED ×2.53 — base ~13-16, real weapon hits, not whittled-stick taps). Dale takes hits on his own gear ("Dale's gear absorbs 18"). Dale heals the scholar mid-fight: "Dale patches you up (+12 HP). 'Hold still!'" The scholar deals ZERO damage the whole fight (325/325 companion) — dodging and watching while Dale works. The Focus Group's mechanics all fire honestly around them (mouth-heads pop, deliberation, boredom beats, attention snaps). Nobody is confused; the fiction matches the ledger; the companion reads as a person fighting beside you, not a damage number.

The sense-test CONFIRMS the mechanism verdict two ways: (1) when an armed companion IS present, the arming is transformative — Dale soloing a wave-3 is the veteran-production dream, achieved; (2) it happened TWICE in 16 runs (d90, d129) — presence is a lottery, and no amount of armory stocking buys more tickets. The d129 callback (comp 30/324) is the modal case: present, armed, marginal.

## Metric review (§14 — binding, never re-scored)

1. **PILOT PRIMARY (≥2x damage-share) MISSED: 0.90x.** Not re-scored, not re-framed. The bar was written before the sweep; the miss is NO-GO per the pre-registered kill protocol. The layer is deleted.
2. **Guardrails:** all PASS (survival +21d, starvation 1v1, no new death modes, national/table not degraded). They do not rescue the primary — the protocol binds on the primary.
3. **Engagement bar (≥10 donations) PASSED: 166.** The layer genuinely fired; the miss is mechanism, not engagement.
4. **Panel (§15):** run on the pilot corpus as the before/after instrument (task requirement) — decision `review_required`, no material signals. The panel is descriptive here; the pre-registered threshold was the judge.
5. **Seeds.** 63511–63518, verified filename-unused in evidence/2026-10-19/perseed-*/ before the sweep. 32/32 runs, 0 instrument errors, 0.0% other-share both arms, deterministic re-runs (proof C2).
6. **Control re-baselined.** The killdisc baseline (1.5%) and vetarm re-measure (2.19%) are both stale on this corpus: 3.33%. The bar (2x) was judged against the re-measured control.
7. **Metric doubt for the NEXT run (not this one):** the ARMED readiness bar moved 6→17 armed companions (median wbonus 0→8) — a real, measured effect on the wave-4/5 readiness gate's ARMED leg. If run 11 re-targets the readiness gate rather than damage-share, pre-register the ARMED bar (or living veterans) as the primary there. Not re-scored here.
8. **Infrastructure:** the host's EPERM flap on node writes killed 4 consecutive armed-sweep attempts (all 16 JSONs written 0-byte each time). Added `writeFileFlap` (EPERM-only retry, 60s backoff ×15) to the sweep — environment hardening, no data change. Also: two service restarts mid-run (one killed a proof run post-C1, one killed the sweep after all writes landed — files verified on disk). And a real layer bug caught by the pilot (not the proof): `equippedBest` read `getPerson(villagerId).equipped`, which is EMPTY for the scholar in the real game — the scholar's gear lives at `state.scholar.equipped`. The fabricated proof stub initially mirrored the bug (it fed equipped through getPerson); fixed the stub to be real-faithful (empty equipped on the person record), which now guards the correct path.

## Out-of-arm findings (not chased)

Filed to hidden_files/sim-findings.md:
1. **Scholar-gear read path** (bug class, fixed in-test): `Game.getPerson(Game.villagerId).equipped` is empty in the real game; the scholar's gear is `Game.state.scholar.equipped`. Any future policy reading scholar gear must use the latter. Proof stubs must mirror this (empty equipped on the person record) or they certify fiction.
2. **EPERM flap on node writes** (infra): 4 sweep runs lost to 0-byte JSONs; `writeFileFlap` retry helper added to armory-sweep (survives in instruments). Probe `node -e` writes before long sweeps; re-probe if any write fails.
3. **Table reached ≠ village survives**: 29/32 runs reached the table, 0/32 won, 32/32 villages died (31 lost + 1 dead). The table entry is not the win and doesn't stop the dying — worth a dedicated read on what kills post-table villages.
4. **Donation-beat side effect**: the scholar donates spares but keeps their best — scholar damage unchanged by construction. Companion damage grew in absolute terms (527→839) but scholar damage grew faster (more fights on the armed side: 46 vs 33 killing fights).

## Convergence

**KILLED-AT-PILOT.** The 10th production attempt is dead: presence-preserving arming moved companion damage-share the wrong side of flat (0.90x vs the 2x bar) with all guardrails green. The mechanism lesson is now two-sided and sharp: vetarm proved moving fighters kills them (patrol beat, 19 dead); armory proves arming them without moving them doesn't get them into the fight (5 companion-damage fights on both arms). The veteran question is PRESENCE + ARMING, and arming is now measured sufficient-but-inert: 17 armed companions, median wbonus 8, damage-share flat. What remains is presence-routing without movement — the axis stays scale-onramp. No game change: zero src/js; the policy layer deleted zero-trace.

## Named nexts

1. **Presence-routing without movement (the 11th production attempt):** investigate what determines WHICH companions join the scholar's wave-3 fights (proximity at fight start? the haven-TB vs raid shapes? the "joins you" trigger conditions?) and whether a policy-side beat can raise join probability without assigning, moving, or risking any fighter. Pre-register the JOIN RATE (fights with companion damage / killing fights) as the primary — not damage-share. The armory instruments (killdisc lineage, arming census) are the control-side reference.
2. **Readiness-gate re-target (alternative):** the ARMED bar moved 6→17 (median wbonus 0→8). If the axis reframes around the wave-4/5 readiness gate, pre-register ARMED-bar or living-veterans as the pilot primary.
3. **Post-table mortality read:** 29/32 table-reaching villages all died. What kills them after the table is set? A diagnostic sweep, not a lever.

## Files

- scripts/policies/armory.js — DELETED per kill protocol (zero-trace)
- scripts/test-armory.js — layer proof, 17/17 GREEN pre-kill (RED→GREEN incl. real RED phase); INFO-SKIP post-kill (ARMORY_KILLED=1)
- scripts/armory-sweep-20261019.js — pilot sweep (16+16 runs; INFO-SKIP without the layer; carries the writeFileFlap EPERM hardening)
- scripts/armory-analyze-20261019.js — pilot analysis + guardrail judgment (reads JSONs only; stays working)
- scripts/armory-transcripts-20261019.js — sense-testing probe (INFO-SKIP without the layer)
- scripts/build-armory-panels.js — §15 balanced-panel compare (control→armed; reads JSONs only; stays working)
- evidence/2026-10-19/perseed-armory-pilot/ — 32 per-seed JSONs + _summary-{control,armed}.json + _analysis.json
- evidence/2026-10-19/armory-panel-primary-{before,after}.json.gz + armory-panel-primary.json + armory-panel-primary.md — the panel compare
- evidence/2026-10-19/armory-transcripts/belongarmory-s63517.txt — sense-test transcript (Dale's 325-damage solo)
- evidence/2026-10-19/sim-armory.md — this file
- ZERO src/js changes; no game-code changes of any kind
