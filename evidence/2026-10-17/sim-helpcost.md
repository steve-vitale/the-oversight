# sim-helpcost — aid cost-accounting on fresh seeds (2026-10-17)

Run: fleshout-20261017T1815Z · axis: scale-onramp (blocking) · arm: sim-helpcost.
Worker: village assessor. The sim-helpcall2 "named next": replicate-or-refute
the median-survival gap (155.5 vs 172d), instrument the runner-absence cost
separately from the runner-death cost, pre-register aid-runner as a counted
cost, and census apex-raid engagement volume on both sides. Policy-side
only — scripts/policies/helpcost.js is new; helpcall.js untouched (reuse);
zero src/js changes (loop B owns src/js this run; scripts/ + evidence/ only).

## Pre-registration (BINDING — docs/MEASUREMENT.md §§9–12, 14, written BEFORE the sweep)

**The arm.** scripts/policies/helpcost.js (withHelpCost, always-on pure
observation, no env gate): wraps helpcall.js's armed policies
(HELPCALL=1, reuse) on the armed side and the tribfloor base on the control
side (HELPCALL explicitly unset — the true default-OFF path). Instruments:
(1) runner-absence — per-part census via a commsTick wrap (engine-true
day-parts away; a daily census undercounts short legs — caught and fixed
mid-run, see proof note), measured separately from runner deaths; per-runner
away-episode day windows for death-day matching; (2) aid-runner deaths with
full situation (crisis wave, one-way parts, runner temperament, held
abilities, the engine's 0.12+0.02*wave road-danger value, mishap); (3)
apex-raid episode census (crisis.raiders && wave>=3) on BOTH sides.

**PRIMARY (binding):** attribution completeness of the armed-control
total-death delta. delta = sum(control.nDeaths) − sum(armed.nDeaths).
Classified: perExposureGain (raid-death delta minus the exposure term),
exposureAsym ((C.episodes − A.episodes) × C.raidDeaths/C.episodes),
runnerCost = −armed aid-runner deaths (counted cost), absenceCorr = −armed
non-raid deaths with day in a runner trip window (correlational, disclosed),
noInviteNonRaid (non-raid/non-runner/non-absence delta over pairs with no
invite either side). unattributed = delta − sum(classified).
GO iff |delta| > 0 and |unattributed| ≤ 0.20 × |delta|.

**DIAGNOSTIC SECONDARY:** replicate-or-refute the 155.5-vs-172d
median-survival gap on fresh seeds — median gameDays, paired sign test,
clock-rate (gameDays/harness-days, the wave4reach tick-stall lesson:
endReason village-lost + total deaths, never scholar.day alone).

**GUARDRAILS (binding):** national armed ≥ control−2; exiled 0 (armed); no
NEW death mode beyond aid-runner at n≥3 armed (aid-runner is the
pre-registered counted cost, not a violation); det-gate holds.

**Substrate:** SEATDRIVE=0 explicit (pre-seat courtship), FEASTSCALE_R13=1,
TRIBFLOOR=1, SUCCGRACE=1, RAIDDENSITY=1, WINPURSUIT=1, WINDEFER=1,
ALLOWGATE2 unset, NODEWITNESS unset — identical to sim-helpcall2.

**Seeds:** 8 FRESH [970, 971, 972, 990, 992, 993, 994, 995] —
collision-checked as `-s<seed>.` literals against evidence/ before the run
(973–989 all hit other arms' evidence). × {leadfeast, belongfeast} ×
{armed, control} = 32 runs, 180d death-aware.

**Horizon:** 180d death-aware. **Schema:** per-seed JSONs carry numeric
national/table/wins/exiled keys (evidence/2026-10-17/perseed-helpcost/).

**Instruments:** scripts/test-helpcost.js (proof) ·
scripts/sweep-helpcost-20261017.js (paired sweep) ·
scripts/analyze-helpcost-20261017.js (verdict analyzer) ·
scripts/policies/helpcost.js (the instrument).

## Canon read

No dedicated raids/aid canon doc exists (stated, not invented, per the
helpcall2 precedent): the design authority is the engine's own ontology
header (src/js/comms.js — the four tiers, honest costs, refusals aloud/fast,
the wave>=3 apex penalty in aidAskVillage) plus PROGRESSION.md "When a
monster shows up at your door" and the DESIGN.md 2026-10-10
survival-safety-nets entry.

## Proof (scripts/test-helpcost.js) — 15/15 GREEN

- RED/GREEN fixtures (9/9): naked base → costSummary null (the gap);
  wrapped → apex episode census (wave-3 raid counted once across two dailies;
  wave-2/non-raid/resolved ignored); placement context (parts 2, temper bold,
  abilities 2, danger 0.18 = the engine's 0.12+0.02×3); died placement →
  runner-death situation (wave 5, danger 0.22); day windows + finalize;
  per-part census (2 away parts on a 2-part leg, 1 in-crisis);
  install-once + purity (no state writes, no RNG reads, hostile aidCrisis
  survives).
- Proof note (caught mid-run, fixed before the sweep): the first census
  design tracked partsLeft deltas across the daily tick — a runner
  completing a short leg inside one harness day showed trips>0 but
  awayParts=0 (observed on the killed first sweep: trips=4, awayParts=0).
  The per-part census (commsTick wrap, one observation per part the runner
  is on the road) counts exactly the engine's own away parts. The stale
  sweep was killed and restarted; its 2 partial runs were discarded.
- Engine-true (2/2, loadGame seed 970): fixture raid crisis (crisis.raiders
  set directly — havenRaidTick sets it in real runs, documented) counted as
  an apex episode on the real Game; installPartCensus on the real Game
  counted 1 away part on the return leg and 3 total across legs.
- Det-gate (1/1): withHelpCost(TF.leadfeast) HELPCALL-unset vs naked
  TF.leadfeast, seeds 970/971 × 60d — game-true fields byte-identical
  (endReason, gameDays, nDeaths, causeCounts, won/national/table,
  maxWaveUnlocked), WITH the part census installed on both sides.
- SMOKE (2/2): HELPCALL=1 armed stacks 20d × {leadfeast, belongfeast} —
  clean ends, cost block present.

## Results

Sweep complete 2026-10-17: 32/32 runs finished (16 pairs), 0 dropped, exit 0.

### Wall numbers

| | armed | control |
|---|---|---|
| national | 11/16 | 11/16 |
| table (invited) | 13/16 | 13/16 |
| wins | 0/16 | 0/16 |
| exiled | 0/16 | 1/16 |
| wave 4–5 unlocks | 1/16 | 1/16 |
| median survival | 181.5d | 181.5d |
| max survival | 183d | 183d |
| village-lost ends | 7/16 | 7/16 |
| total deaths | 761 (47.6/run) | 712 (44.5/run) |
| mean clockRate | 1.011 | 1.011 |

### PRIMARY: NO-GO — the delta reversed and the ledger does not close

delta = 712 − 761 = **−49** (armed buried 49 MORE dead this run — the
opposite sign of helpcall2's +43).

| component | value | note |
|---|---|---|
| raidGain (ungated) | −1.0 | post-invite: armed 23 vs control 22 — the 0.467x raid benefit did NOT replicate |
| exposureAsym | −11.8 | armed faced MORE apex episodes (30 vs 25); rC = 2.36 raid deaths/episode |
| perExposureGain | +10.8 | per unit exposure, armed still lost fewer raid deaths (mechanism intact) |
| runnerCost (counted) | −2 | 2 aid-runner deaths, full situations below |
| absenceCorr (corr.) | −20 | non-raid deaths with day in a runner trip window, armed (correlational — see metric review) |
| noInviteNonRaid | +0 | 3/16 pairs with no invite either side |
| **unattributed** | **−26.0** | |unattr|/|delta| = 0.531 > 0.20 → **NO-GO** |

Paired total-death diffs (armed−control): +8, −7, −5, −3, 0, 0, 0, 0, +16,
+15, +9, +11, 0, +3, 0, +2 — the armed excess concentrates in the s992/s993
siege pairs (+16/+15/+9/+11 = +51 of the +49); raid deaths per pair are
near-identical (raid A/C: 6/7, 7/7, 5/6, 5/6, …). The excess is non-raid
combat/monster noise on high-attrition seeds, not a systematic treatment
effect — which is exactly what the unattributed residual says.

### Cost ledger (the counted price, engine-true)

- aid-runner deaths: 2 (armed), 0 (control) — both with full situations:
  - s971 belongfeast d143: wave=3, parts=2, temper=steady, abilities=1,
    danger=0.18, mishap=null, target=village_2
  - s971 leadfeast d171: wave=5, parts=2, temper=bold, abilities=2,
    danger=0.22, mishap=null, target=village_1
  (Road danger is wave-graded by the engine: 0.12+0.02×wave. The wave-5
  call cost the bolder, more able runner.)
- runner-absence: 26 trips, **49 runner-day-parts away**, of which **45
  while an apex raid crisis was active** (the per-part census). The runner
  is overwhelmingly away DURING crises — absence is the intervention's
  shape, not an accident. But 49 parts ≈ 16 harness-days of one villager's
  time across 16 runs is small against 761 deaths; the −20 absenceCorr is
  an upper-bound correlation (villages under siege lose people while the
  runner is out), not a causal price.
- The 0.467x raid-death gain did not reproduce: post-invite raid deaths
  armed 23 vs control 22 (ungated −1.0). The per-exposure residual (+10.8)
  says the mechanism still works per raid; the exposure draw (−11.8) and
  combat-death noise swamped it on fresh seeds.

### Engagement volume: the 38-vs-13 question answered

- This run (NODEWITNESS unset, same substrate as helpcall2): armed **42
  placements** (sent 26, died 2, nolink 14) over **30 census episodes**
  (1.40/episode). Verdicts: accepted 20, refused 6 (share 0.769); 18 aid
  parties / 70 fighters arrived; 0 errors; 100% attribution (unattributed
  0, en-route 0).
- helpcall2 (same substrate): 38 placements. Prior arm (NODEWITNESS=1): 13.
- Verdict: **substrate, not seeds.** Same-substrate replication gives
  42 ≈ 38; the 13 belongs to the NODEWITNESS=1 substrate. The engagement
  question is closed: apex-call volume is substrate-driven.
- Census caveat: the episode census dedups by sinceDay/wave/name and
  undercounts same-day repeat crises — s992 belongfeast placed 15 calls
  (14 nolink: "nobody linked to run to", 1 sent) across days 151–179, a
  genuine late-game apex siege, but the census counted 5 episodes.
  Placements (ledger, engine-true) are the reliable engagement measure;
  the census is a lower bound. Noted for the instrument's next revision.

### SECONDARY: the median-survival gap is REFUTED

Prior: armed 155.5d vs control 172d. This run on fresh seeds: armed
**181.5d** vs control **181.5d** — identical medians. Paired diffs
(armed−control): −31, +0, +0, +0, +23, +0, +0, +0, +0, −1, +0, +0, +1, +36,
+0, +0. Sign test on 5 nonzero diffs: +3/−2, two-sided p = 1.000.
Clock-rate: 1.011 vs 1.011 — no tick-stall (the wave4reach lesson checked
and cleared). Village-lost ends 7/7, total deaths the only mover.
**The gap does not replicate: it was noise** (consistent with helpcall2's
own sign test, p ≈ 0.45). The guardrail that tripped on it tripped on
noise — see metric review.

### Guardrails: all HOLD

- national ≥ control−2: HOLD (11 vs 11).
- exiled 0 (armed): HOLD (0; control had 1).
- no new death mode beyond aid-runner at n≥3: HOLD (none; aid-runner is
  the pre-registered counted cost at n=2).
- det-gate: holds (proof, 15/15).

## Sense-reads (SENSE-TESTING LAW — transcripts, not counts)

**The runner's death is legible, not silent bookkeeping.** The dispatch is
aloud with the honest price — d178 s971 belongfeast: "Sara sprints for
Thornfield — 2 day-parts each way, and the road isn't safe. That's the
price. They're gone from Haven's hands until they're back." The died branch
says it to the village's face (comms.js aidSendRunner): "<name> takes the
plea and the road — and the road takes <name>. They don't make it. The
message dies with them." The death lands in the ledger as cause
'aid-runner' with the runner's name. A refusal is equally aloud (d179:
"Sara turns home from Thornfield — empty-handed — Thornfield said no").

**Recorder gap (tooling, not game):** my beat recorder's keyword set
missed the died-branch say-text — "takes the plea and the road" contains
neither "runner" nor "sprint". The death was narrated in-game; only the
recorder was blind. Keyword sets for future aid arms must include
"takes the plea".

**A siege read — belongfeast s992 (armed), d151–179.** Fifteen placements
in 28 days, 14 'nolink'. The village is under rolling apex attack and
keeps calling into a fire network with nobody on the other end — the
engine answers every time ("nobody's linked to run to — Haven stands
alone"). The village survived to 182d anyway. The beats read as a village
that learned it was alone and fought anyway — the layer's honesty (no
phantom aid) held under the heaviest engagement of the sweep.

## Village assessment

Pre-seat courtship villages at their strongest: national 11/16 both sides,
table invited 13/16, median survival 181.5d — the substrate's ceiling, not
the arm's doing. Deaths are combat deaths (59–60% `combat`, 20–21%
`villager combat`, 6–7% `monster`) — the fieldfightsrc shape, unchanged.
The armed side's extra 49 dead are combat/monster noise plus exposure
luck (30 vs 25 apex episodes), not the aid layer's price: the counted
price is exactly 2 road deaths against 49 measured away day-parts, 45 of
them in-crisis.

Who thrived: the full-horizon survivors (9–10/16 per side) — aid or no.
Who died: the mid-game attrition pairs, apex pressure compounding
human-raid stripping, same as helpcall2. What was missing: the win
(pre-seat substrate by design) and wave-4/5 as progression (1/16 both
sides — the decoupling stands, filed).

## Metric review (§14)

1. **PRIMARY NO-GO — the framework's miss, reported not re-scored.** The
   attribution framework was built for a world where the treatment moves
   deaths through raid/absence channels. On fresh seeds the dominant movers
   were exposure luck (armed drew 30 apex episodes vs 25) and combat-death
   noise (+36 `combat`), and the framework's exposure term only scales
   raid deaths — 53% of the delta is unattributed. The NO-GO stands.
   **Revision for the next cost arm:** pre-register the delta on
   RAID-attributed deaths only (the channel the layer actually touches),
   with exposure-scaled combat deaths as a separate diagnostic — or extend
   the exposure term to all combat channels. Do not re-run this
   attribution against a friendlier partition.
2. **The 0.467x raid benefit did not replicate** (23 vs 22 post-invite;
   ungated −1.0). The per-exposure residual (+10.8) keeps the mechanism
   alive as a hypothesis, but the headline effect is unproven on fresh
   seeds. The next aid arm should pre-register on post-invite raid deaths
   with an exposure-matched design (or more seeds), not on totals.
3. **The survival-gap guardrail tripped on noise.** helpcall2's violation
   (155.5 vs 172d, sign test p ≈ 0.45) does not replicate (181.5 vs
   181.5, p = 1.000; clock-rates identical). A guardrail that fires on a
   statistically null gap and then un-fires on replication is measuring
   noise. Proposal for the NEXT run (not this one): replace the median-
   survival guardrail with endReason village-lost rate + total deaths
   (the wave4reach lesson's recommended pair), which is what actually
   moved here.
4. **absenceCorr is correlation, reported as such.** Twenty non-raid deaths
   fell on days a runner was away — but runners are away 92% of their
   parts DURING apex crises, and villages under apex attack lose people.
   The instrument cannot separate "the runner's absence cost lives" from
   "the layer fires exactly when villages are dying." Treating it as a
   causal price would be dishonest; it is an upper bound.
5. **§15 panel treatment.** The balanced panel (§15) is the instrument for
   game-code before/after; this arm changes zero game code, so the panel
   cannot judge the arm. What it CAN do — and did — is provide an
   independent before/after of the env-gated lever (gate-off vs
   HELPCALL=1) through the 23-metric contract on matched options. See
   "Balanced panel" below. The binding neutrality proof remains the
   det-gate (byte-identical trajectories, gate-off), which the panel's
   own neutrality gate corroborates.

## Balanced panel (§15)

`node scripts/balance-panel.js` with the helpcost stack registered
additively in scripts/sweep-compare.js (`leadcost`/`belongcost` — zero
behavior change to existing entries): before-panel = gate-off
(HELPCALL unset), after-panel = HELPCALL=1, matched options
(--seeds 970,971,972,990,992,993,994,995 --policies leadcost,belongcost
--days 180), substrate env identical to the sweep (SEATDRIVE=0,
FEASTSCALE_R13=1, TRIBFLOOR=1, SUCCGRACE=1, RAIDDENSITY=1, WINPURSUIT=1,
WINDEFER=1). The lever is env-gated, so both panels share the source
digest — recorded here, not hidden. (Caveat: the panel child runs
setupGame without the courtship roster — a different substrate from the
sweep; the comparison is internally matched, so it is valid as a
before/after, but it is not the same substrate as the sweep.)

**Decision: review_required** (exit 2). Both panels valid (sourcesStable,
neutrality gate green — the instrument's observation-neutrality
corroborated by the panel's own gate). Screen-only (8 seeds/policy).

- leadcost: player (bearer) deaths per run 5.375 → 7.125 (+1.75,
  95% exploratory interval 0.125–3.5) — **regression_signal**; mean
  sampled living NPCs −0.41 (−0.889 to −0.024) — **regression_signal**.
  National scale access, table invitation, community loss rate: all
  no_material_signal (0.75/0.75, 0.75/0.75, 0.375/0.375).
- belongcost: player deaths +0.75 (−0.25 to 2.125) — regression_watch;
  living NPCs −0.25 — no_material_signal; national/table/community-loss
  all no_material_signal.

Per §15 the panel never overrides the pre-registered verdict — this is an
investigation note, and it points the same way as the sweep: on fresh
seeds the armed side loses more dead (here: bearer deaths, a channel the
sweep's attribution framework did not partition). The runner is never the
scholar (aidPickRunner excludes the villagerId), so the bearer-death
signal is not the runner's road death — it is the siege-selection shadow
(the layer fires when the village is already dying) and/or a real
second-order cost. Screen-only; not confirmation. It does not re-score
the PRIMARY (NO-GO stands) — it corroborates that the 0.467x benefit does
not replicate and the layer's cost side needs the re-designed arm from
metric review §§1–2.

Display note: this section's metric reads "First bearer survives through
day 30" — the read pipeline displays "bearer survives" as
"bearer <redacted>"; the file bytes were verified clean (no literal
"<redacted>" anywhere; charCodes 115,117,114,118,105,118,101,115).

## Telemetry check (Steve 2026-10-13)

Per-side against
`hidden_files/telemetry-baselines/scale-wall.json` (metrics
national,table,wins,exiled): 1 LOUD per side —
`wins disappeared: baseline 16 -> current 0`.
**EXPLAINED, not a bug** — the scale-wall baseline is the full win-side
stack; this arm runs the pre-seat substrate (SEATDRIVE=0 explicit) where
wins are 0/16 by construction (same verdict as helpcall2). Baseline NOT
rolled forward. No other LOUD lines.

## Convergence state

**killed-at-pilot is wrong; parked is wrong — the arm is NO-GO with
value.** The cost-accounting instrument works (15/15 proof, engine-true
day-parts, full runner-death situations, 100% placement attribution) and
answered its named questions: the survival gap was noise (refuted), the
engagement-volume question is closed (substrate, not seeds), the runner's
price is counted (2 road deaths, 49 away day-parts, sacrifice legible).
But the PRIMARY did not go (0.531 > 0.20 unattributed) and the 0.467x
raid benefit did not replicate — so the lever stays unlanded and the
question "at what cost" is answered while "does it reduce raid deaths"
is back to unproven. The instrument stays (default-OFF, zero src/js) for
future arms. The scale-onramp axis is not converged.

## Named next (backlog, not chased)

1. **Aid-arm re-design (first):** pre-register on post-invite raid deaths
   with exposure matching (or 12–16 seeds with the census), per metric
   review §§1–2. The per-exposure +10.8 keeps the mechanism alive.
2. **Survival guardrail revision:** endReason village-lost rate + total
   deaths instead of median gameDays (metric review §3). Proposed for the
   next run, not applied here.
3. **Census key fix:** dedupe apex episodes by crisis object identity,
   not sinceDay/wave/name (s992: 15 placements vs 5 counted episodes).
4. **Beat-recorder keyword:** add "takes the plea" (the died-branch
   say-text) to the aid-beat recorder set.
5. **Tier comparison** (still open from helpcall2): build-gated cry tier
   vs runner — the aftermath-vs-defense mechanism question.

## Proof artifacts

- scripts/policies/helpcost.js — the instrument (new)
- scripts/test-helpcost.js — proof 15/15 (RED/GREEN fixtures 9 + engine-true 2 + det-gate 1 + SMOKE 2)
- scripts/sweep-helpcost-20261017.js — paired sweep (32 runs, exit 0)
- scripts/analyze-helpcost-20261017.js — verdict analyzer
- scripts/sweep-compare.js — additive registry entries (leadcost/belongcost)
- evidence/2026-10-17/perseed-helpcost/ — 32 per-seed JSONs (numeric wall keys + cost block)
- evidence/2026-10-17/helpcost-beats/ — 32 beat files
- evidence/2026-10-17/panel-helpcost-{off,on}/panel.json.gz + panel-helpcost-compare.{md,json} — §15 panels
