# SIM-TRIBHEALTH — village-health + link-stability gated early tribute pull-forward (loop B, food-economy)

Date: 2026-10-15 · Loop: oversight-flesh-out-loop-b · Run: fleshout-b-20261015T010800Z
Worker tree: sim-tribhealth-b · Axis: food-economy (scale-wall lens) — tribute discipline.
Claims sim-findings item: TRIBUTE-TIMING NEEDS A VILLAGE-HEALTH / LINK-STABILITY GATE (claimed 2026-10-15).

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

- PRIMARY: armed tribute arrears notes <= control x 0.7 AND armed (missed+thin) weeks <= control x 0.85 (identical seeds).
- GUARDRAILS (harm-specific, median report-only per #224): starvation <= control+2; hungryDays <= control x 1.1; national >= control-2/16; no new death mode (n>=3 per #216).
- Pilot gate: 8 seeds (11/22/33/44/55/66/77/88) x leadcourt/belongseek (courtship road, NO feast substrate), 180d death-aware, identical seeds. Control RE-MEASURED on current tip (#247 — never inherit a baseline from a prior run's evidence).
  SMOKE=1 instrument-honesty gate; det-gate 16/16 both modes; proof scripts/test-tribhealth-20261015.js RED->GREEN before the sweep.
  Confirm 12-16 only if the pilot meets GO per §9.
- GO -> land as its own commit; primary miss or guardrail breach -> KILL per §14 (layer deleted, evidence + proof + sweep + det-gate kept).

## The arm

The tribdisc kill's two load-bearing lessons (evidence/2026-10-14/sim-tribdisc-b.md):
1. PANTRY HEALTH ≠ VILLAGE HEALTH — pantryFreshDays() >= 4 let a village starving from day 1 pay 7 early weeks (~36k kcal) and die at 68d.
2. Early pull-forward is only safe on STABLE links — 33 early pays on the belong road with zero harm; the harm rode a transient lead-road courtship stint.

This arm answers sim-findings #237's steve-call ("what counts as healthy enough to pay early?") with three gates, ALL required:
1. PANTRY (inherited): pantryFreshDays() >= 4 AND pantry kcal >= week's tribute. Fragile holds stay silent; base discipline timing untouched.
2. VILLAGE (new): zero starvation deaths in the trailing 7 days (telemetry death stream, /starv/i on cause|kind) AND today's village.hungryDays streak <= 2 AND the trailing-7d max streak <= 2 (villageEats treats hungryStreak >= 3 as the hunger-winter crisis threshold; 2 days is noise, 3+ is a spiral warning).
3. LINK (new): link age >= 14 days (canon BELONG standing bar: seasoned bonds are >= 14 days) AND link.trust >= 30 (formed at 30; below that is fresh or damaged). Transient courtship stints never see an early pay.

scripts/policies/tribhealth.js (TRIBHEALTH=1, default OFF; zero src/js changes):
the tribute verb only, wrapping leadcourt/belongseek. Each day, BEFORE the parent policy's daily (so the early pay lands ahead of the base discipline's own tribute step):
- gate off -> pure delegation (byte-identical to the parent policy; det-gate 16/16 pins it).
- no active Haven-subordinate link -> nothing.
- week already current (tributePaidWeek === week) -> nothing.
- any gate fails -> silent hold counted by gate (thHoldPantry/thHoldVillage/thHoldLink); the base discipline's own step still runs after.
- all gates pass -> pay the week's tribute early-in-full via Game.payTribute(link.id) (the engine's own verb; idempotent per-week, so the base discipline cannot double-pay), recorded as thEarly with real kcal.
  The beat names the PRE-payment pantry depth (tribdisc beat bug fixed) plus the village-health signal that justified it.

No feast-gating changes, no aid changes; tribute verb only.

Canon read: docs/CANON.md, docs/SCALE.md (trust math + seasoned-bond age), docs/PRESERVATION.md (the fresh-days ladder). Steve-call answer documented above for his overrule.
Horizon: 180d death-aware (scale-wall reachability question, pacing-law max).

## Proof results (run BEFORE any sims)

RED (TRIBHEALTH unset): R1 verb returns 'off', ctx untouched, gateOn() false; R2 tribhealthbelong.daily byte-identical to belongseek.daily; R3 tribhealthlead.daily byte-identical to leadcourt.daily. 6/6 on seeds 11/22/33.

GREEN (TRIBHEALTH=1): G1 fragile fixture (~3.75 fresh-days) — verdict 'held', thHoldPantry=1, SILENT, base discipline still pays the week (tributePaidWeek === week); G2 healthy pantry + hunger spiral (streak 4) — hold-village, no early pay; G3 healthy pantry + transient link (age 3d) — hold-link, no early pay; G4 healthy pantry + eating village + seasoned link (age 20d, trust 50) — 'early', full week paid (6000 kcal, week current), beat names the pre-payment depth (~6.3 days) + the village-health signal, base discipline does NOT double-pay; G5 starvation death in trailing-7d telemetry — hold-village, no early pay; G6 deterministic rerun. 13/13 on seeds 11/22/33.

Det-gate: 16/16 bit-identical off-vs-base (gate-off wrapper vs parent policies, 40d, per-day hashes) AND 16/16 armed determinism (8 seeds x 2 roads). SMOKE=1 honesty gate green both sides.
scripts/test-tribhealth-20261015.js, scripts/det-gate-tribhealth-20261015.js.

## Pilot results

8 seeds/side (11/22/33/44/55/66/77/88) x leadcourt/belongseek (courtship road, NO feast substrate), 180d death-aware, identical seeds. Control RE-MEASURED on this tip (#247). Det-gate GREEN both sides before trusting comparisons; SMOKE=1 honesty gate green both sides.

| metric | control (TRIBHEALTH unset) | armed (TRIBHEALTH=1) | pre-reg |
|---|---|---|---|
| arrears notes (**PRIMARY**) | 61 | **48** | **MISS** (<= 42.7) |
| (missed+thin) weeks (**PRIMARY**) | 81 | **65** | PASS (<= 68.85) |
| tribute weeks full/thin/missed | 106f/3t/78m | 145f/2t/63m | report |
| early kcal moved | — | 41.5k kcal (thEarlyKcal) | report |
| starvation deaths (guardrail) | 2 | **3** | PASS (<= 4) |
| hungryDays (guardrail) | 33 | **33** | PASS (<= 36.3) |
| national (guardrail) | 10/16 | 11/16 | PASS (>= 8) |
| median survival (report-only per #224) | 109d | 107d | — |
| th verb counts (armed) | 0e | 107e / 386p / 0v / 68l | mechanism fires |
| table | 0/16 | 1/16 | — |
| wins | 0/16 | 0/16 | — |
| everW4 / everW5 | 6/0 | 6/0 | — |
| maxWave | 4 | 4 | — |
| exiled | 0 | 0 | unchanged |

Road split (where the arm actually lives):
- belongseek: arrears 19→9 (0.47x), missed+thin 31→19 (0.61x), starvation 1→0, national 6→6, table 0→1 (first), wave-4 unlock 0→1, median 146→180d. On the stable-bond road the re-gated arm did exactly what it was built for — strictly better discipline, zero hunger harm.
- leadcourt: arrears 42→39, missed+thin 50→46, starvation 1→3, national 4→5. The LEAD road has almost no Haven-subordinate links (0f weeks on 6/8 control seeds); most of its tribute volume is transient-courtship-stint arrears, which the link-stability gate correctly refuses to touch (68 link holds armed-side) — so there is nothing for the verb to discipline there.

**Verdict: KILLED AT PILOT per §14.** The primary required BOTH conditions; arrears missed (48 > 42.7, 0.79x vs the 0.7x bar) while missed+thin passed (65 <= 68.85, 0.80x). The discipline moved the right way on both conditions — the way tribdisc did — but the bar binds. No confirm spend. The layer is deleted per the kill protocol; proof + det-gate + sweep + sense + per-seed evidence kept.

## The s88 check (same-run investigation)

Armed leadcourt-s88 showed 3 starvation deaths vs control's 1 (guardrail: <= 2+2 = 4, PASS). The investigation (scripts/invest-tribhealth-s88.js, 90d armed re-run): the 5 early pays (41,472 kcal total) all fired on days 41–63 while the pantry hunger streak was 0 and the village was eating; the village collapsed at 88d (control: 75d, both village-lost) with the 3 starvation deaths arriving in the collapse — AFTER the last early pay, while the pantry gate was already holding (thHoldPantry=20). The mechanism on this seed: early tribute on a lead-road stint converted 0f/7m into 5f/4m and the village still starved in the endgame — the same DIRECTION as tribdisc's s11, but thHoldVillage=0 on all 16 runs means the village-health gate as implemented NEVER fired anywhere. The gate's signal (pantry-empty streak via v.hungryDays + trailing starvation-death telemetry) is the wrong instrument for what kills: the pantry streak RESETS on fed days while individuals starve. The engine's own individual-hunger signal is progState().hungryStreak (>= 3 = the hunger-winter crisis threshold, fired by `anyStarving`). A revival must gate on hungryStreak, not the pantry streak. Filed below.

## Death-cause shares

Control (16 runs): combat 86, monster 27, sickness 18, villager combat 18, contest 4, dehydration 2, thirst 3, lockjaw 1, experiment 1, expedition 1, alien 1, starvation 2, "a wound that wouldn't close" 7.
Armed (16): combat 100, contest 6, dehydration 2, sickness 12, "a wound that wouldn't close" 7, thirst 3, monster 23, villager combat 15, lockjaw 1, experiment 1, starvation 3, expedition 1, alien 1.
Armed causes are a strict subset of control modes — **no new death mode: PASS.**

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 10/16 | 0/16 | 0/16 | 6/16 | 0/16 | 109d | 180d |
| armed | 11/16 | 1/16 | 0/16 | 6/16 | 0/16 | 107d | 180d |

Exiled: 0 both. The belong-road arm reached the table once (belongseek s66 armed: wave 4 + global); the scale wall stands otherwise.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Armed tribhealthbelong s44, 120d: 11 early pays, 4 link holds. The early-pay beat pairs honestly with the engine's payment beat — the pre-payment depth is named ("The pantry holds ~43.3 days of fresh — deep enough to pull tribute forward, and the village is eating well (no hunger stretch this week, no starvation deaths)"), then the engine reports the politics ("Tribute paid: 7,710 kcal walks out of the pantry toward Emberhold. The relationship holds."). The tribdisc post-payment-depth lie is fixed: every beat names the depth that justified the decision. **Coherence PASS.** One note: the 11 beats are near-identical in phrasing (same decision, same narration) — acceptable for a policy beat, but a revival could vary the village-health clause with the actual numbers (streak days, weeks since a starvation death).

## Village assessment (plain words)

Sixteen villages, and the re-gated verb did what the #237 steve-call asked on the road it was built for: on the belong road the tribute books came out cleaner — arrears more than halved (19→9), thin+missed weeks down by two-fifths (31→19), one village reached the table, nobody starved. The 107 early pays moved real food (mostly on seasoned bonds — 68 link holds blocked the transient-stint attempts), and the narration tells the truth about what it did.

But the verdict is the bar, not the direction: arrears 61→48 is 0.79x, and the header said 0.7x. The LEAD road is the other half of the story — there is almost no tribute to discipline there (Haven is primary, not subordinate), so the arm's effect is belong-only by construction. And the s88 investigation found the weak joint: the village-health gate I built never fired once in sixteen runs — the pantry-empty streak misses individual starvation by design. The arm measured the pantry gate and the link gate, not the village gate I claimed to answer the steve-call with.

## Blanks filled / documented

- **MEASURED, KILLED AT PILOT** (primary missed one of two bars, §14): the village-health + link-stability gated early tribute pull-forward — scripts/policies/tribhealth.js (TRIBHEALTH=1, default OFF; DELETED per kill protocol), proof scripts/test-tribhealth-20261015.js (RED 6/6 + GREEN 13/13 on seeds 11/22/33, kept), det-gate scripts/det-gate-tribhealth-20261015.js (16/16 both modes, kept), sweep scripts/measure-tribhealth-20261015.js (kept, INFO-SKIPs post-kill), sense scripts/sense-tribhealth-20261015.js (kept), investigation scripts/invest-tribhealth-s88.js (kept), evidence + per-seed JSON (evidence/2026-10-15/perseed-tribhealth-{base,armed}/, kept), sweep JSONs (sweep-out/tribhealth-{baseline,armed}.json, kept). Zero src/js changes.
- **DOCUMENTED** (appended to hidden_files/sim-findings.md): (a) the village-health gate never fired in 16 runs — pantry-empty streak (v.hungryDays) misses individual villager starvation; the engine's own individual-hunger signal is progState().hungryStreak (>= 3 = hunger-winter crisis); any tribute-timing revival must gate on hungryStreak (steve-call answer, filed for a future arm); (b) the belong road is the only road with discipline-able tribute volume — the lead road has almost no Haven-subordinate weeks, so tribute-timing levers are belong-only by construction; (c) the tribdisc post-payment-depth beat bug is confirmed FIXED (all 11 sense beats name the pre-payment depth).

## Metric review (§14)

1. **The KILL stands on the header as written — no re-scoring.** The primary required arrears <= 42.7 AND missed+thin <= 68.85; armed delivered 48 and 65. One of two conditions misses, so the pilot is NO-GO. The direction was right on both (0.79x, 0.80x) — and the road split shows the effect is belong-concentrated (0.47x/0.61x there) — but §14 binds the run to its header, not its direction or its road split.
2. **The village-health gate was vacuous and the header still treated it as answered.** thHoldVillage=0 across 16 runs — including leadcourt-s88, where 3 villagers starved to death while the gate watched. The implemented signal (pantry-empty streak + trailing starvation-death telemetry) cannot trip on the starvation that actually kills villagers: the pantry streak resets on fed days while individuals starve; the death telemetry only trips AFTER the starvation it was meant to prevent. The engine already has the right instrument — progState().hungryStreak, the hunger-winter crisis signal — and the next tribute-timing arm should gate on it. This is a design-call miss in MY arm (filed), not a Steve metric to revise.
3. **Calibration note for the next run.** The tribdisc-derived bars (0.7x/0.85x) assumed the feast substrate; on the courtship substrate the belong road alone beat 0.5x/0.65x while the lead road contributed almost no discipline-able volume. A future arm should pre-register on the belong road's own control numbers, or measure the arm where the lever lives.
4. **Guardrail health.** starvation passed at 3 <= 4 (boundary, as in tribdisc) and the s88 investigation shows early pays can still precede an endgame collapse on lead-road stints — but with the village gate vacuous, this run could not test whether a REAL village gate prevents it. That's the open question, not a finding.

## Convergence state

food-economy: **killed-at-pilot** (tribhealth). Primary missed one of two bars (arrears 61→48 vs ≤42.7; missed+thin 81→65 vs ≤68.85 PASSED). Guardrails all passed; no new death mode. The re-gated arm proved the link-stability gate fires correctly (68 holds on transient stints) and the beat names the pre-payment depth honestly, but the village-health gate as implemented never fired — the pantry-empty streak is the wrong starvation instrument (filed for the next arm: gate on progState().hungryStreak). The belong road remains the only road with discipline-able tribute volume.
