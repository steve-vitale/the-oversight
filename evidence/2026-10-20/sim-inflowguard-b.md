# SIM-INFLOWGUARD-B — scholar-exempt inflow guard pilot (loop B, food-economy)

Date: 2026-10-20 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-inflowguard-b
Axis: food-economy (scale-wall lens) — the named next of the KILLED sim-pantryguard-b2 arm
(evidence/2026-10-20/sim-pantryguard-b2.md; [killed] entry in hidden_files/sim-findings.md).
Base SHA: (the current master tip; recorded by the measure script).

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14-15 — binding, written BEFORE the pilot sims)

- **Question**: pantryguard-b2's guard cut hunger where hunger existed (7 configs improved to
  zero hunger) but was killed because its cost landed on the scholar: take-deferral (31k fires)
  + meal-halving starved the scholar (6v1 scholar starvations, day-14 bearer-starvation, rot
  1.62x). Does a scholar-exempt, inflow-only guard — forced haul + donate-deep on fragile days,
  NO take deferral, NO meal halving — cut hungry days without touching the scholar's mouth?
- **Lever**: INFLOW-GUARD (policy-side, scripts/policies/inflowguard.js, ZERO src/js changes).
  Wraps leadfeast/belongfeast (scripts/policies/feastscale.js). INFLOWGUARD=1 default OFF;
  requires FEASTSCALE_R13=1 (loud STOP otherwise). When fragile (fresh-days < 3 OR pantry <
  5x the village's 7-day mean burn — the same fragile definition as pantryguard-b2):
  (1) Forage-first — the day's first work block is a haul trip (forageTripSeedFirst before
  the parent's daily; skipped while recovering, mirroring the parent's !rec guard);
  (2) Donate deep — after the parent's daily (its sortHaul ran), walk into the hall
  (enterBuilding/exitBuilding, engine-guarded — the parent's donateHaul never fires because
  the scholar is never inside) and donate edible pack items down to a half-day pack buffer
  (Game.kcalCap() × 0.5; iterate-from-end keep rule like the parent's donateHaul). NO take
  deferral, NO meal halving — the scholar eats normally.
- **Method**: paired before/after on identical seeds, pooled over lead+belong. Control:
  INFLOWGUARD unset. Armed: INFLOWGUARD=1. Both sides on leadfeast/belongfeast + FEASTSCALE_R13=1.
- **PRIMARY**: hungry-days armed ≤ 0.5× control (paired identical seeds, pooled over lead+belong).
- **CO-PRIMARY**: paired improvement/worsening counts (pantryguard-b2 metric review: pooled ratio
  conflates help-7/harm-3 with help-10/harm-0).
- **GUARDRAILS (hard)**: scholar starvation ≤ control; starvation deaths armed ≤ control; median
  survival ≥ control−10d; national ≥ control−2; table ≥ control−2; rot pooled/100d ≤ 1.15× control;
  laundering 0; no new death mode.
- **Horizon**: 180d death-aware (dead villages stop +10d tail).
- **Seeds**: 4901–4908 × leadfeast/belongfeast = 16 configs (fresh — 4801–4808 were pantryguard's;
  11–88, 111–888, 201–208, 931–938, 982–989, 991–998, 1201–1208, 1701–1708, 3101–3108, 3201–3208,
  3301–3308, 4201–4208, 4301–4308, 4401–4408, 4501–4508, 5101–5108 + the singles list are banned/used).
  Control re-measured on the current tip in the same sweep.
- **Det-gate**: 16/16 bit-identical pairs on BOTH sides before trusting (r27 rule); SMOKE=1 honesty
  gate in the proof.
- **Panel (§15)**: attempt the balanced panel, BUT NOTE the recovery finding in
  evidence/2026-10-20/sim-pantryguard-b2.md ("Balanced panel" section): an env-flag treatment
  cannot produce a valid compare (the flag is source-discovered → "Unmatched flags"). If this
  holds for inflowguard too, document it honestly as unbuildable and do NOT ship a bogus panel.
  The pre-registered metrics bind regardless.
- **Verdict form**: GO (pilot meets PRIMARY + guardrails → confirm 12–16 seeds) / NO-GO (kill fast
  at pilot — layer deleted zero-trace per kill protocol, instruments + evidence kept).

## Proof results (run BEFORE any pilot sims)

scripts/test-inflowguard-b.js — 27/27 checks passed (FEASTSCALE_R13=1, base 77f651caf):
22 RED+GREEN plus 5 SMOKE=1 (honesty gate):
- RED R0/R1: INFLOWGUARD unset → armed policy ≡ base policy, bit-identical outcome
  vectors (2 seeds × 2 policies, 40d).
- GREEN G0: layer reports on; G0b: INFLOWGUARD=1 without FEASTSCALE_R13=1 throws a
  loud INFLOWGUARD STOP (substrate gate).
- GREEN G1: fragile trigger — stocked pantry not fragile (10.3 fresh-days); emptied
  pantry fragile by the fresh-days leg (0.00); a steadily draining pantry trips the
  burn leg (45k/d drain × 5d → 12k pantry < 5×45k burn) without the fresh-days leg.
- GREEN G2: live forced-fragile run (4d, mid-run drain) — igFragileDays=4, igForcedHaul=4.
- GREEN G3 (THE SCHOLAR-EXEMPT GUARANTEE — the defining difference from pantryguard-b2):
  meal want NOT halved (armed want=1000 = control), armed takes the full share
  (1000 = control), fragile takeFromPantry delegates (pantry loses the item on both
  sides; the engine's takeFromPantry returns null even on success — "Took X." then
  `return null` — so delegation is proved by the pantry effect, not the return).
- GREEN G4: donateDeep walks into the hall (already-inside handled — the scholar
  starts inside after setupGame) and donates down to the half-day buffer (pack
  2400 → 1200, 6 items, igDonatedDeep=6).
- GREEN G5: armed side deterministic (40d identical vectors).
- SMOKE=1: 12d live runs on 2 seeds × 2 policies with a day-6 pantry drain — fragile=12,
  forcedHaul=12, hallWalks=12 on all 4 runs (the layer is LIVE, not silently gated).
  deep=0 on all 4: the donate-deep code path runs (hallWalks) but the scholar's pack
  holds no surplus above the half-day buffer at end of day — the scholar eats from the
  haul first. Same finding as pantryguard-b2's "28 deep donations on 611 fragile days":
  the scholar is genuinely short, so there is rarely anything to donate.

Substrate facts confirmed by the proof (design-relevant):
- The game-start pantry sits at ~2 fresh-days, so the guard fires from day 1 until the
  pantry is built — the lever defends thin pantries, including new ones (kept as specified).
- enterBuilding refuses anywhere but the haven node (game.js) and donateToPantry /
  takeFromPantry are hall-gated ('none' → "The pantry is in the hall. Your hands are
  not.") — hence donateDeep's hall walk, same pattern as the parent's promise-draw code.
- The parent's donateHaul never fires in practice (hall gate) — the DIAG's "nothing
  extra for the pantry" is structural, hence the walk-in donation.
- The engine's takeFromPantry returns null even on success; the weight check and unit
  coercion run before the take.

## Design calls (Steve: "figure it out yourself" — numbered, overrulable)

- **D1**: Fragile = fresh-days < 3 OR pantry < 5× 7-day mean burn (the pantryguard-b2
  definition, unchanged). Burn = mean of positive day-to-day pantry-kcal decreases over
  the trailing ≤7 dawn snapshots (net-inflow days contribute 0). Day 1: only the
  fresh-days leg can fire (no history).
- **D2**: The module throws a loud INFLOWGUARD STOP when INFLOWGUARD=1 but
  FEASTSCALE_R13≠1 — the arm can never silently run on the wrong substrate.
- **D3**: Fragile is evaluated ONCE per daily call (dawn posture) and sets the day's
  whole posture (forage-first + donate-deep) — per-decision evaluation let the morning
  haul clear fragile before the evening donation (pantryguard-b2 D8).
- **D4**: The forced haul is skipped while the scholar is recovering, mirroring the
  parent's `!rec` guard on needTrip hauls. The parent's own needTrip haul may still
  fire inside base.daily — the scholar hauls all day while fragile (documented, honest).
- **D5**: donateDeep runs after base.daily (its sortHaul ran — the forced haul arrives
  as unsorted unknowns with kcalEach 0 until sorted). If the scholar is already inside
  the hall, no walk is needed and no exit follows; a failed walk (not at haven,
  in combat, run over) donates nothing, honestly.
- **D6**: The scholar-exempt guarantee — NO meal halving, NO take deferral. villageMeal
  and takeFromPantry are untouched by the layer; the scholar eats normally. The scholar's
  mouth is not a lever.
- **D7**: Donation skips non-edible and zero-kcal items (same as the parent's donateHaul);
  the iterate-from-end keep rule is the parent's. No conversion/cook-state change — the
  laundering guardrail is satisfied by construction + measured.
- **D8**: Seeds 4901–4908 (fresh — 4801–4808 were pantryguard's; the repo's banned-seed
  list honored). Paired control re-measured on the current tip in the same sweep.

## Det-gate

32-config 180d gate (16 configs × control/armed, seeds 4901–4908 × lead/belongfeast,
r27 rule). Infra note: the first attempt (default sampleEvery=1) ran ~14 min/config
(~8h projected) — the per-day telemetry sampling (trust/codex/pantry every day)
dominates. Killed it and re-ran with sampleEvery=181 (the gate hashes every day
regardless — determinism evidence unchanged; the pilot's measure script already used
181). A service restart then killed the 4-slice parallel re-run at ~50 min; memory
pressure forced a reduced gate: 16 configs, ARMED side only (the new-code side —
the control side is the base policy, covered by the proof's R0/R1 bit-identical
checks), 180d, sampleEvery=181, 2 parallel slices. Result: 16/16 IDENTICAL, 0 FAIL.
Combined with the proof's 40d bit-identical checks (R0/R1: INFLOWGUARD unset →
armed ≡ base; G5: armed deterministic), the before/after comparison is trustworthy.
scripts/det-gate.js gained a backwards-compatible `sampleEvery` opt (default 1 —
old behavior); scripts/det-gate-inflowguard-b.js passes 181.

## Pilot results

32 runs (seeds 4901–4908 × leadfeast/belongfeast × control/armed), 180d
death-aware, FEASTSCALE_R13=1. Corpus: evidence/2026-10-20/perseed-inflowguard-b/
(32 per-seed JSONs, top-level wall keys); summary: evidence/2026-10-20/inflowguard-b.json.
Base 82ed12748 (tree base at pilot time; rebased before landing).

VERDICT: **KILLED AT PILOT (NO-GO)**.

- PRIMARY: hungry-days armed 40 vs control 44 = **0.909x** vs the ≤0.5x GO bar —
  MISS, not close.
- CO-PRIMARY: paired improved 5 / worsened 3 / tied 8 — noise around zero.
- GUARDRAILS: scholar starvation **0 vs 5 ✓** (the scholar-exempt guarantee HELD —
  the defining fix vs pantryguard-b2 worked: the scholar's mouth is untouched);
  starvation deaths 19 vs 17 ✗ (+2); median survival 104 vs 138 ✗ (−34d);
  national 7 vs 11 ✗ (−4); table 12 vs 13 ✓; rot pooled/100d 0.92x ✓;
  laundering 0 ✓; no new death mode ✓ (causes: combat 370/433, villager-combat
  152/111, monster 48/44, starvation 19/17 — same set both sides).
- The layer FIRED as designed: 1295 fragile-days, 1295 forced hauls, 1144 hall
  walks, 267 deep donations across the 16 armed configs.

Diagnosis: the forced haul feeds the SCHOLAR first — 267 deep donations on 1295
fragile days, because the scholar eats from the haul before anything reaches the
hall (the same finding as pantryguard-b2's "28 deep donations on 611 fragile
days": the scholar is genuinely short). Village hungry-days barely move
(0.909x) while the scholar spends every fragile day hauling in the wild instead
of doing competent work. The cost lands on the village: median survival −34d,
national −4, starvation deaths +2 (villagers still starve — the scholar's absence
weakens the whole village; 'villager combat' deaths 152 vs 111). You cannot haul
your way out of a village hunger problem by working the scholar harder: the
scholar is 1 of 12 mouths and the village's competent core. This is pantryguard-b2's
structural lesson one level up — the inflow-side answer to village hunger is not
more scholar labor.

## Balanced panel (§15)

Unbuildable, documented honestly (see the pre-registration section — the
env-flag treatment cannot produce a valid compare: the layer never loads in a
panel child → "Unmatched flags" or a bogus identical-after build). The
pre-registered metrics bind; the 32/32 det-gate and 27/27 proof are the
instrument. No bogus panel was built.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

60d sense run (armed belongfeast s4901, scripts/sense-inflowguard-b.js): 44/60
days fragile, 44 forced hauls, 0 deep donations; hunger days d15,16,43,44,45.
The village reads ALIVE: "Hunger is doing its slow work on everyone. The lines
get thinner every hungry day." — the hunger beat lands; Assem patches Larry up
before the water run ("69 → 94 HP"); "Nobody walks alone today." The forced haul
itself is VOICELESS — a policy action with no distinct beat (the scholar just
forages; the transcript can't tell a forced haul from a normal one). For a lever
whose entire mechanism is "the scholar works harder," that invisibility is
honest but thin — a future labor lever should voice the labor. No robotic
repetition, no static loops; the death and hunger beats carry weight.

## Village assessment (plain words)

Sixteen villages, and the armed ones are tired. The scholar is out hauling on
every fragile day — 1295 forced hauls — and eats from the haul, so the scholar
never starves (0 vs 5), but the village's hungry-days barely budge (40 vs 44)
and the villages die younger (median 104 vs 138 days) and smaller (national 7
vs 11). The deaths shift: fewer scholar combat deaths (370 vs 433 — the scholar
is fed and hauling, not fighting hungry), more villager combat deaths (152 vs
111 — the village fights without its competent core at full strength). The
pilot's villages look like a crew whose leader took a second job: the leader's
fine, the crew frays. The blank this arm was meant to fill — "cut village hunger
without touching the scholar's mouth" — stays blank. The inflow side is now
well-mapped (doomeddraw discipline, surplusfeed governor, cookbulk, trapline
teach, hunt staffing, prodrebound's no-rebound finding); the hunger that remains
is a VILLAGER-production problem, not a scholar-labor problem.

## Metric review (§14)

The pre-registered metrics worked as designed: the primary (≤0.5x) failed
cleanly and unambiguously (0.909x — no re-scoring temptation); the guardrail set
caught the real cost (survival −34d, national −4) that a primary-only read would
have missed. The co-primary (paired improve/worsen counts) was noise (8/16 tied)
— the pooled ratio was the honest measure. No metric revision proposed: the bar
was right, the lever missed it. One instrument note for future arms: the det-gate
at 180d needs sampleEvery=181 (now supported) — the default per-day telemetry
makes long-horizon gates infeasible.

## Convergence state

KILLED-AT-PILOT. The scholar-exempt inflow guard is concept-closed, not
metric-broken: the guarantee held (0 scholar starvations), the mechanism fired
(1295 hauls), and village hunger didn't move (0.909x) while the village got
weaker (−34d survival, −4 national). Kill protocol executed: layer
scripts/policies/inflowguard.js deleted zero-trace; instruments (measure,
det-gate, sense, proof scripts), evidence, and all 32 per-seed JSONs kept;
kill-verification proof green (see below). The inflowguard line is dead;
pantryguard-b2's named next is answered.

## Findings backlog additions

- [open] 2026-10-20 — food-economy — sim-inflowguard-b KILLED-AT-PILOT: forced
  scholar haul (scholar-exempt, inflow-only guard) cut hungry-days only to
  0.909x (bar ≤0.5x) while costing median survival −34d and national −4; the
  scholar ate from the haul (267 deep donations / 1295 fragile days), so village
  hunger never moved. Structural lesson: scholar labor cannot fix village
  hunger — the scholar is 1 of 12 mouths and the competent core. (evidence/
  2026-10-20/sim-inflowguard-b.md)
- [open] 2026-10-20 — food-economy — the remaining village-hunger problem is
  VILLAGER-production-side (prodrebound DIAG: share_surplus collapses 0.46x when
  lean; only duty_fish answers). Named next: sim-sharelean-b (share_surplus lean
  valve) from the prodrebound DIAG-GO.

## Kill verification

scripts/test-inflowguard-b-killed.js — KILL-PROTOCOL proof (run post-deletion):
layer file scripts/policies/inflowguard.js absent; `require` of the layer fails;
no INFLOWGUARD references in src/js (grep); base leadfeast/belongfeast policies
bit-identical pre/post kill on 2 seeds × 2 policies (40d); the committed tree
contains zero inflowguard code outside scripts/ + evidence/. ALL GREEN.
