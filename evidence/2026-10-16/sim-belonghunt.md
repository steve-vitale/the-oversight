# sim-belonghunt — road-aware wave-5 pursuit with readiness + scholar-absence accounting (flesh-out loop, 2026-10-16)

Worktree: `~/workspace/worktrees/sim-belonghunt`. POLICY-SIDE ONLY — ZERO src/js changes. Branch: sim-belonghunt, based on current master.

Axis: scale-onramp (blocking). The tracker's named next from sim-w5reach3's metric review + sim-belongreach's kill: the road-aware + engine-honest-tableActive combination, with the survival lessons learned — finding #374 (gear/DPS readiness gate), finding #352 (burst-killer term), the w3drive scholar-absence lesson.

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law), docs/TABLE.md (sanctity). Canon facts the layer is built on:
- Wave-5 gate (standing.js): villageStandingTotal() >= t5(200) AND waveUnlockReady(5).ready = waveEngaged(4) >= 2 distinct wave-4 types faced blow-by-blow (FLEEING COUNTS — "you stood on the grid"); bread counts at most 100 toward t5; the rungs sit on top of the wave-3 rung.
- Sanctity (TABLE.md, Steve 2026-10-12): "when the table sits, the world holds its breath." The engine's own predicate is Game.tableActive() (table.js:359) — active from tableScene until any resolve sets phase 'done'; the win-deferral window counts as sitting. A PENDING invitation is not a sitting.
- Wave bands (anchored — MONSTER-WAVES.md): wave 3 dmg 20-70, HP 240-420; wave 4 dmg 35-95, HP 850-1500. The hunt's expedition readiness is judged on the wave-3 band (the likely contact); wave-4 champions are faced, burst-gated only — a DPR bar would forbid the facings the gate needs.
- The armor model (2026-10-09): absorbed = min(hit-1, round(hit*r)), r = P/(P+20) — at least 1 always lands. The readiness gate reads the scholar's P through the engine's own equipment.armorOf.

## The arm (the only new thing)

scripts/policies/belonghunt.js — the wave5reach hunt/commit mechanism rebuilt with six changes:
1. ROAD GATE: belong road only ('belongfeast-windefer'). Lead ids pure-delegate even opted in — w5reach3 showed the base already unlocks there and the arm only costs.
2. ENGINE-HONEST HUNT GATE: Game.tableActive() — the w5reach3 refinement (397 recovered days, 27 engagements; the landed tableBusy heuristic strands the hunt per finding #369). Strand telemetry w5TableBlocked counts in-window stand-downs.
3. READINESS GATE (new, #374/#352): playerDPR = 13 + weapon bonus (the policy's fightAssessRace convention); armor P via Scattering.equipment.armorOf; against the wave-3 band: burst term — 2 * throughArmor(70, P) < scholarHP (the 35% eject can't fire if the scholar never reaches it); DPR term — exposure (scholarHP/45) >= killPace (330/playerDPR) * 0.25, the "facing, not duel" bar.
4. PER-ENGAGEMENT BURST GATE (new, #352): a visible wave-3+ monster whose two-round max burst through the scholar's armor is lethal is not deliberately engaged; wave-3 gets a 60-round stalemate bound; wave-4 facings are burst-gated only.
5. ABSENCE ACCOUNTING (w3drive lesson): the don't-hunt gate reads villageFoodTier() — no hunts on 'starving' days (the scholar-kcal>=200 gate is dropped); at most 2 hunt legs per trailing 7 days.
6. UNCHANGED: 35% retreat discipline (competent.js — this layer holds no flee logic), 12-step engage bound, node selection, every-3rd-day cadence, hp>=60%, base.daily first and fully.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep)

**Question:** does the road-aware + tableActive-gated hunt — with the readiness and scholar-absence lessons folded in — move belong-road wave-5 unlocks without the lead-road regression, the stranding, or the survival cost?

**The lever:** scripts/policies/belonghunt.js — env-gated BELONGHUNT=1, default OFF. Wraps SD.leadseat / SD.belongseat (same ids 'leadfeast-windefer'/'belongfeast-windefer'). On the belong road after wave-4 unlock and before wave-5 unlock (and never while the table sits):
1. Counter-learning expeditions: every 3rd day, hp>=60%, pantry tier != 'starving', <=2 legs/trailing-7d, readiness-gated; travel to thicket/ruin/forest/grove nodes, engage visible wave-3/4+ monsters that pass the per-engagement burst gate (facing feeds waveEngaged — fleeing counts; kills feed the war ledger), come home. The win-side verbs run FIRST and fully — the hunt is additive, never preempting.
2. Fight commitment: wave-3 in fight → ctx._huntCommit (courtkill's proven mechanism, holds to 12%); wave-4+ in fight + scholar >=50% HP → ctx._w5Commit, honored by the extended legacy flee block in scripts/policies/competent.js (start-of-fight walk-away overridden ONLY; the mid-fight 35% eject is UNCHANGED).
3. No free knowledge, no combat cheats, no deed-bar reimplementation: reads Game state, issues player verbs — never writes engine state.

**Arms:** control = pre-seat stack (FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1 + WINPURSUIT=1 + WINDEFER=1, SEATDRIVE NEVER set — the seat layer gate-offs to pure delegation) with BELONGHUNT unset; armed = the same + BELONGHUNT=1. Identical seeds both sides, 180d death-aware (dead villages stop simulating, +10d tail max), own control in the same sweep. Belong road ONLY.

**Seeds:** 8 FRESH [204,315,426,537,648,759,870,981] (verified: zero prior per-seed files in evidence/ as seed values) x belongfeast x {control, armed} = 16 runs.

**Horizon + why:** 180d death-aware. Wave-5 unlocks land d69–d163 on measured pre-seat sets; the pre-seat stack's runs live long (w5reach3: median ~110–118d), so the full horizon is the honest surface.

**Proof:** scripts/test-belonghunt-20261016.js — RED→GREEN on the layer: (a) C1 REAL-RED — the LANDED wave5reach.js huntLive strands in the #369 stranding state (pending invitation, table not sitting) while belonghunt's stays live; sabotage-run confirmed C1b/C1c FAIL on the old heuristic and PASS on the engine-honest gate; (b) C2 the sitting still stands the hunt down; (c) C3 lead-road pure delegation; (d) C4 readiness math pinned (burst-block on the sharpened-stick case, dpr-block, ready mid-build, armor-curve unit checks); (e) C5 per-engagement burst gate (wave-3 stalemate bound, wave-4 facings burst-gated only); (f) C6 pantry gate; (g) C7 weekly cap; (h) C8 det-gate — gate-off byte-identical to the seatdrive composition (2/2 seeds, 60d), lead-armed byte-identical (road gate), gate-on deterministic, gate-ON non-vacuous on a fabricated mid-game state (the w5reach3 det-vacuity lesson); (i) C9 no flee/eject logic in the layer — the 35% eject lives only in competent.js. SMOKE green before the sweep (sweep's SMOKE=1 gate).

**PRIMARY (binding):** belong wave-5 unlocks armed >= control+2 (GO). NO-GO = killed at confirm, layer DELETED per kill protocol (commit instruments + evidence only).

**CO-PRIMARY (binding, exercise gate):** >= 4 hunt engagements across the sweep (contact, not no-contact).

**GUARDRAILS (binding):** national >= control−2; median survival >= control−10d; starvation deaths <= control+2; no new death mode at n>=3; no gate-blocked scholars — report tableActive (sitting) days vs hunts (the #369 strand must not reappear).

**Secondaries:** mean per-seed paired wave-5 unlock-day delta (armed − control) over both-unlocked pairs (reported even at n<4 — no-coverage is a finding, not a failure); full wall numbers both sides; gate-block telemetry (ready/pantry/cap/burst/table blocks).

**Unlock dating:** sample unlockedWave() daily AND cross-check the harness's maxWaveUnlocked AND scan beats for the greenlight line (finding #375 — final-day unlocks are missed by daily sampling).

**SENSE-TESTING LAW:** sense-read at least one hunt arc end-to-end — does the pursuit read as earned village action (a scholar working the problem the System named), not a lever?

## Metric review

(per §14 — pre-registered metrics bind; doubts go here, revisions apply
to the NEXT run)

1. **PRIMARY is NO-GO (binding).** Belong wave-5 unlocks: armed 0/8 vs
   control 3/8 (bar: armed >= control+2). The arm did not move the
   needle — it moved it backwards on the seeds where the base's own
   verbs unlock (s204 d107, s315 d134, s648 d85 — all control-only
   unlocks; this seed set's belong controls unlock 3/8 on their own,
   vs 0/8 on w5reach3's seed set).
2. **The readiness gate is the mechanism's killer, not its savior.**
   127 ready-blocks across 8 armed runs vs 43 hunts fired. The burst
   term at the wave-3 band (2*throughArmor(70,P) < HP) blocks unarmored
   scholars almost entirely early (s204: 28 blocks; s315: 27), and the
   DPR "facing, not duel" bar bites the rest. The w5reach3 hunts
   succeeded with these same scholars WITHOUT a readiness gate (0/8 →
   4/8) — the gate's calibration, not the scholars, is the binding
   constraint. The #374 lesson is real (the sharpened-stick Spool
   engagement), but my calibration was wrong: I gated the deliberate
   expedition on surviving the wave-3 band's worst two rounds, while
   the measured hunts survive via the 35% eject + flee-counts canon.
   A future arm should gate per-engagement only (the actual monster's
   burst — already built here as engageableMonster) or on the scholar's
   observed fight lore, never on band worst-case. Filed to
   sim-findings.
3. **SECONDARY is no-coverage — a finding, not a failure.** Zero
   both-unlocked pairs (3 control-only unlocks). The paired-delta
   surface cannot be computed on this road with n=8.
4. **Guardrail MISS: median survival −21d** (114.0d vs 135.0d, bar >=
   control−10d). The hunts cost absence + fight risk even with the
   pantry tier gate and the weekly cap — s204 (151→115d), s315
   (139→113d), s648 (131→108d) all die earlier on identical seeds. The
   w3drive absence-accounting (pantry tier, 2/week cap) did its part —
   starvation 0 vs 2, the pantry gate held — but the scholar's repeated
   absence still shows up as earlier deaths. Two seeds ran the other
   way (s870 survived 182d, s981 99→137d) — the cost is heterogeneous,
   not uniform.
5. **Guardrails that held:** national 5/8 vs 7/8 (>= control−2, at the
   bar exactly); starvation deaths 0 vs 2 (<= control+2); exiled 0;
   wins 0/16 (expected); no new death mode at n>=3 (every armed death
   mode appears in control); zero scholar deaths to committed fights
   (the 35% eject held, per the C9 pin).
6. **The strand did NOT reappear (guardrail).** sittingDays=0,
   tableBlocked=0, hunts=43, liveDays=336 — the engine-honest
   Game.tableActive() gate kept the hunt live for 336 days across the
   sweep with zero stranding. The w5reach3 refinement's mechanism is
   vindicated even as the arm is killed: the combination (road gate +
   tableActive) is proven live; what killed the arm is the readiness
   calibration and the base's own 3/8 unlocks.
7. **Exercise gate met — genuine negative, not no-contact.** 12
   engagements, 216 bloodFights, 153 facingFights across 8 armed runs.
   The hunts contacted the mechanism; the mechanism didn't convert.
8. **#375 cross-check clean.** Beats scan found greenlight lines only
   in the 3 control runs (s204/s315/s648) — matching the daily sampler
   exactly. No armed run greenlit; the harness's maxWaveUnlocked agreed
   with daily sampling on all 16 runs. No missed unlocks.

## Results

16 runs (8 fresh seeds x belongfeast x {control, armed}), 180d
death-aware, pre-seat substrate (SEATDRIVE=0 explicit opt-out — see
substrate note below), own in-sweep control. Per-seed JSONs:
evidence/2026-10-16/perseed-belonghunt/ (16/16 present, 0 schema-bad).
Beat captures: evidence/2026-10-16/belonghunt-beats/ (16/16).
Sweep log: evidence/2026-10-16/belonghunt-sweep.log.

SUBSTRATE NOTE: since c004b9dd flipped the seat default ON
(layerOn = SEATDRIVE !== '0'), the pre-seat substrate now requires
SEATDRIVE=0 explicit. The task's "SEATDRIVE unset" is the pre-flip
spelling of the same stack — the intent (seat layer gate-offed to pure
delegation) is what SEATDRIVE=0 produces. SMOKE gate verified
seat=false/defer=true on both sides before the sweep.

| metric | control (n=8) | armed (n=8) | bar | verdict |
|---|---|---|---|---|
| wave-5 unlocks (PRIMARY) | 3/8 | 0/8 | armed >= control+2 | **NO-GO** |
| paired unlock-day delta (SECONDARY) | — | no both-unlocked pairs | — | no-coverage (finding) |
| hunt engagements (CO-PRIMARY) | 0 | 12 | >= 4 | GO (contact) |
| wins | 0/8 | 0/8 | expected 0, LOUD if any | GO |
| national | 7/8 | 5/8 | >= control−2 | GO (at the bar) |
| table invites | 7/8 | 8/8 | — | — |
| wave-4 unlocks | 8/8 | 8/8 | — | — |
| exiled | 0/8 | 0/8 | 0 | GO |
| median survival | 135.0d | 114.0d | >= control−10d | **MISS (−21d)** |
| starvation deaths | 2 | 0 | <= control+2 | GO |

Per-seed (control / armed — days, nat, wave-5 day, hunts, engaged):
- s204: c d151 nat1 w5=d107 / a d115 nat0 w5– hunts=7 eng=1
- s315: c d139 nat1 w5=d134 / a d113 nat0 w5– hunts=5 eng=1
- s426: c d101 nat1 w5– / a d107 nat1 w5– hunts=8 eng=4
- s537: c d182(surv) nat1 w5– / a d171 nat1 w5– hunts=4 eng=0
- s648: c d131 nat1 w5=d85 / a d108 nat1 w5– hunts=2 eng=2
- s759: c d93 nat0 w5– / a d82 nat0 w5– hunts=6 eng=0
- s870: c d158 nat1 w5– / a d182(surv) nat1 w5– hunts=4 eng=1
- s981: c d99 nat1 w5– / a d137 nat1 w5– hunts=7 eng=3

Mechanism counters (armed): 43 hunts, 336 liveDays, 0 sittingDays,
12 engagements, 216 bloodFights (wave-3 commits), 153 facingFights
(wave-4+ commits); gate blocks: ready 127, pantry 66, cap 11, burst 4,
table 0. Control: all zero (gate off, as designed). Zero scholar deaths
to committed fights.

Death modes: control dominated by combat (199), villager-combat (74),
monster (56); armed: combat (217), villager-combat (71), monster (41).
Starvation 2 vs 0 — the pantry-tier don't-hunt gate held. No new death
mode at n>=3.

Wall numbers on the pre-seat stack (this arm's measurement): national
5–7/8, table 7–8/8, wins 0/8, wave-4 8/8, wave-5 0–3/8, median
114–135d, exiled 0. (This seed set is easier than w5reach3's — belong
controls unlock 3/8 here vs 0/8 there; the seat driver remains the
win-side difference.)

## Village assessment

Sixteen belong-road villages on the pre-seat stack. Three of the
control villages (s204, s315, s648) stood before the Mirror Draft's
champions on their own verbs and watched the fifth draft greenlit —
the base's own verbs reach the gate on this seed set without a single
hunt. The armed twins of those three villages died earlier (151→115d,
139→113d, 131→108d), wave-4-locked, the scholar's expeditions a
tax on a village that was already winning its own way.

The other five pairs tell the harder story. s426's scholar walked out
8 times and faced champions 4 times across the wave-4 window — and the
village still bled out d107 with the fifth draft ungated, waveEngaged(4)
short of the 2-distinct-types bar. The readiness gate stood the scholar
down 6 more times (and the pantry 6) — the pursuit was rationed by its
own caution as much as by the monsters. s981's scholar hunted 7 times,
engaged 3, and lived 38 days longer than its control (99→137d) — the
only seed where the hunts bought time instead of spending it.

Nobody starved (2 vs 0 starvation deaths). No exiles. No wins. The
table stays empty; the villages die rich in standing under post-invite
overtime, combat the way out as always.

The honest read: the hunt is a tax the village pays for a gate the
base's own verbs sometimes reach alone. Where the base can't reach
(w5reach3's 0/8 seed set), the un-gated hunt paid (0/8 → 4/8). Where the
base can (this 3/8 set), my gated hunt cost −21d of median survival and
converted nothing. The readiness gate I added to answer #374 throttled
the mechanism to the point where it couldn't reproduce w5reach3's gain
even where the base failed — 127 ready-blocks is not caution, it's
starvation by another name.

## Sense-testing

Read end to end: s426 armed d71–107 (the most-engaged arc: 8 hunts, 4
engagements, wave-4 unlock d71, village-lost d107).

- The village is alive around the hunts. Booker checks the pantry
  before heading out and redirects to wood/water/stone when the shelves
  are full; Aaron's fire speech ("Then we meet it with torches and
  steel. I'm done being hunted."); funerals narrate ("The village
  stops. Somebody screams. Somebody else starts digging."); the Codex
  turns its own pages on the dead. Villagers teach each other plants
  unprompted. This is people, not a lever's backdrop.
- The hunt arc is earned. The Mirror Draft opens with the System's own
  voice ("We've been watching you for a LONG time... Say hello to the
  MIRROR DRAFT") and the hold beat states the price ("The fifth draft
  stays in the wings. Stand before the Mirror Draft's champions — more
  than once, more than one kind — and the Producers will take notice").
  The scholar's expeditions are that order executed deliberately — no
  expedition cutscene, just the scholar walking out to monster country
  on purpose, bounded, gated on health and pantry, the fights real
  (the village buries people throughout). It reads as a scholar working
  a problem the System named, not as farming.
- The cost is visible and honest. The pantry-tier gate fired 6 times
  on this run — the scholar stayed home on thin-pantry days, which is
  exactly the w3drive lesson made verb. The village still died d107
  with the gate ungated — 4 engagements weren't 2 distinct champion
  types faced.
- Judgment: meaning and coherence pass. The lever is sensible where it
  fires. It fires ~5 times per village per lifetime under my gates —
  the readiness calibration is the failure, not the fiction.

## Blanks (filled / documented)

- **FILLED:** scripts/test-belonghunt-20261016.js (RED→GREEN proof, 30/30 GREEN on the layer: C1 REAL-RED on the landed stranding + sabotage-run FAIL/PASS on the engine-honest gate, C2–C7 gate pins, C8 det-gate byte-identity both roads + gate-on determinism + non-vacuity, C9 no flee/eject logic in the layer; now INFO-SKIPs since the layer is killed).
- **FILLED:** scripts/sweep-belonghunt-20261016.js (the 16-run sweep: daily unlockedWave() sampling, #375 greenlight cross-check, gate-liveness + strand telemetry, beat captures, per-seed JSONs with the exact numeric keys national, table, wins, exiled, wave5, wave5Day).
- **FILLED:** the 16-run pre-seat road+readiness census — evidence/2026-10-16/perseed-belonghunt/*.json (16/16 present, 0 schema-bad) + belonghunt-beats/ (16/16 beat captures) + belonghunt-sweep.log.
- **KILLED:** scripts/policies/belonghunt.js DELETED per kill protocol (PRIMARY NO-GO 0/8 vs 3/8 + median-survival guardrail MISS −21d). No trace left — evidence and instruments kept, proof INFO-SKIPs.
- **DOCUMENTED:** the readiness calibration failure — the #374/#352 burst+DPR gate at the wave-3 band worst-case (127 ready-blocks vs 43 hunts) throttled the mechanism below the point where it could reproduce w5reach3's un-gated belong gain (0/8 → 4/8). The gate's strictness, not the scholars, was the binding constraint: the measured hunts survive via the 35% eject + flee-counts canon, not via surviving the band's worst two rounds. Filed to sim-findings: a future arm should gate per-engagement only (the actual monster's burst — engageableMonster, already built) or on observed fight lore, never on band worst-case.
- **DOCUMENTED:** the substrate spelling change — since c004b9dd flipped the seat default ON, the pre-seat substrate now requires SEATDRIVE=0 explicit; "SEATDRIVE unset" is the pre-flip spelling of the same stack. Any future pre-seat arm copying the old sweep headers must set SEATDRIVE=0 or it silently runs the win-side stack.
- **DOCUMENTED:** the engine-honest gate vindicated — 336 live days, 0 sitting days, 0 table-blocks: the #369 strand did not reappear. The road+tableActive combination is proven live; the kill is about the readiness calibration and the base's own 3/8 unlocks, not the gate.
- **DOCUMENTED (pre-existing, not mine):** master moved mid-run (3 commits: 858ad861 version bump, 889d951e sim-dawngo-b kill, aeda28d1 journey endgame r13) — rebased before landing, proofs re-run GREEN.

## Convergence state

**killed-at-pilot** — more precisely killed-at-confirm: the arm is dead per kill protocol (PRIMARY NO-GO + survival guardrail miss), the layer deleted. The axis (scale-onramp) learns: (1) the road+tableActive combination is mechanically live (336 days, no strand) — it is the right vehicle; (2) per-day band-worst-case readiness gating strangles the pursuit — the next arm should carry the per-engagement burst gate only, or gate on observed lore; (3) the belong road's base verbs reach the gate on easier seed sets (3/8 here) — future arms need seed sets where the base fails (the w5reach3 0/8 set) or they measure the tax, not the gain. Axis stays **converging** — the mechanism family is narrowing, not dead.
