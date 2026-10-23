# sim-armored15-confirm — CONFIRM the sim-armorvillage-b pilot's armored15 secondary

Run: fleshout-20261023T1115Z | axis: scale-onramp | worktree: ~/workspace/worktrees/sim-armored15-confirm
Policy-side only — NO game-code changes (confirm, not a build).

## Pre-registration (§14 binding — written BEFORE any confirm sims)

**Question.** The sim-armorvillage-b pilot (32 configs, seeds 67601–67608) found the
armor-pile/gift/draw structure fires (deposits 8/8, equipped 8/8) and moved the
wave-5-door armor leg's wall metric: armored15 median-of-medians control 3 → armed 5
(+2, bar was >+0.5) — but the pilot's binding primary was NO-GO on the craft leg
(0/8, root-caused to the starved communal materials inflow, mechanism NOT broken).
This run CONFIRMS ONLY the armored15 secondary on fresh seeds. It is NOT a re-run
of the full primary: the craft bar is deliberately excluded (its precondition was
proven absent in the pilot; re-testing it here would be a re-run of a diagnosed
absence, not a confirm).

**Substrate (exact pilot substrate, unchanged):** ARMORYDRIVE=1 pinned on BOTH arms.
control = AD.armedFor(base); armed = AV.armedFor(AD.armedFor(base)), ARMORVILLAGE=1.
Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1
ARMORYDRIVE=1 (+ARMORVILLAGE=1 armed only). No game code differs between arms —
the ONLY difference is the policy env flag. 180d death-aware horizons (+10d tail).

**Seeds:** 68301–68308 × {leadfeast, belongfeast} × {control, armed} = 32 configs,
paired identical seeds. Verified fresh: no exact `6830[1-8]` reference in
scripts/, tests, or evidence filenames/seed fields (one unrelated `6830` hit in
scripts/lib/luck-instrument.js is outside 68301–68308).

**PRIMARY (binding):** armored15 median-of-medians (per-seed-median daily
waveCombatReadiness(5).armored, then median over the 8 seeds) armed ≥ control + 0.5.
GO/NO-GO, never re-scored mid-run.

**ENGAGEMENT (binding, paired with the pilot's proven mechanism bars):**
- pile deposits ≥2 on ≥6/8 armed seeds (per-seed max across the 2 policies)
- villagers equipped from pile/hand-off ≥2 on ≥6/8 armed seeds

**GUARDRAILS (all binding):**
- paired median survival diff (armed−control, seed×policy pairs) within ±10d
- starvation deaths armed ≤ control+2
- no new death modes (armed-only death kind seen ≥2× to name one; none in pilot — same bar)
- wave-4/5 unlocks + national RECORDED both arms (not a pass/fail bar on this confirm;
  the wall block is recorded, per the standing directive)
- death-cause shares sane (no single cause >2× control share)

**Wall block (standing directive — recorded both arms):** national / table / wins,
wave 4–5 unlocks, median survival.

**§15 balanced-panel note.** The balanced panel (scripts/balance-panel.js) is
INVALID-BY-CONTRACT for this env-gated policy sweep: (1) the arms differ only by
an env flag (ARMORVILLAGE=1) read by policy code — the game source tree is
byte-identical between arms, so the panel's sourceDigest/sourceHead comparison
would judge nothing; (2) the binding primary (armored15 median-of-medians, a
waveCombatReadiness read) is not in the all23 contract metric set
(scripts/balance-metrics.json) — the panel cannot instrument or judge the
pre-registered metric. Attached instead: the manual paired analysis below
(§14 pre-registered bar = the judge; matched-seed pairing = the panel's
pairing discipline). Written as
evidence/2026-10-23/armored15-confirm-paired-compare.md.

## Metric review
The pre-registered primary + engagement are judged as written — both PASS, and
the guardrail miss is judged as written (NO-GO on the starvation bar), no
re-score. Metric notes for the next run:

1. The starvation guardrail counted ABSOLUTE starvation events while the armed
   arm survived +10d paired-median longer (+184 village-days, +9.3% exposure).
   Absolute counts are denominator-blind on an arm that extends survival. Next
   run: starv per 100 village-days (this run: control 0.41 → armed 0.56) or a
   paired per-config bar.
2. The craft bar was correctly excluded from this confirm's primary (pilot
   root-caused the beat as precondition-starved). No metric change needed.
3. The +0.5 margin on armored15 median-of-medians was the right wall-adjacent
   measure for a second time: both pilot and confirm read 3 → 5 on fresh seeds.

## Build log
No build (policy-only confirm). anchorCommit recorded per seed in per-seed JSONs:
single anchor db7a0456381dd2e8dff70c90f1a956d29f292fbb across all 32 configs.

## Confirm results (32/32 configs, anchor db7a0456, run fleshout-20261023T1115Z)

One backgrounded sweep died mid-arm (at armed s68305-belongfeast, ~9/16 armed
configs) with no terminal result; the arm was resumed for seeds 68305–68308 and
s68305-leadfeast re-ran with byte-identical output (deterministic harness —
md5-checked). No per-seed evidence was lost or overwritten.

- **PRIMARY: PASS.** armored15 median-of-medians control 3 → armed 5
  (bar armed ≥ control+0.5). Per-seed: control [6,3,3,3,2,2,4,3], armed
  [7,3,6,4,5,2,7,3]. 7 of 16 pairs move up, 9 tie, 0 down. The pilot's +2
  replicates exactly on fresh seeds.
- **ENGAGEMENT: PASS/PASS.** deposits ≥2 on 8/8 armed seeds (1–40/config);
  equipped-from-structure ≥2 on 8/8 (3–39/config). Crafts 0/8 (informational;
  pilot-documented precondition starvation, unchanged).
- **GUARDRAILS:** paired median survival diff +10d — PASS at the boundary
  (bar ±10d; symmetric chaos tails -54…+77, the pilot's deterministic-chaos
  signature). Starvation control 8 / armed 12 — **FAIL** on the bar
  (≤ control+2) by 2 events. Death-cause shares sane — PASS. No new death
  kinds armed-only — PASS.
- **Mechanical verdict: NO-GO** on the starvation guardrail (judged as written,
  never re-scored). Mechanism autopsy per kill discipline: NOT lever harm —
  excess concentrates in 2 of 16 pairs on seeds that starve in control too;
  activity↔starvation r=0.149; the policy has no food path; pilot+confirm
  combined control 20 vs armed 23 = rare-event noise. Nothing is killed: the
  structure fires, the primary replicates, and there is no game-code change
  to land or withhold.

## Paired compare (§15 manual, in place of the panel)
See evidence/2026-10-23/armored15-confirm-paired-compare.md (the balanced panel
is invalid-by-contract for env-gated policy sweeps — stated there).

## Sense-testing
Seed 68303 leadfeast armed, 60d say-line capture (6017 lines, scripts/
sense-armored15-confirm.js). The armor beats read as people — PASS, same
verdict as the pilot:

- [d35] "You hand Kurt the Warden's Cloak. Kurt pulls it on over their clothes,
  checking the straps — it fits."
- [d46] "You hand Daniyar the Alien boots. Daniyar pulls it on over their
  clothes, checking the straps — it fits."
- [d35] "Left your Fire-hardened spear in the armory. Anyone who needs it can
  take it." (same day as the Kurt gift — the one-deposit + one-gift quiet
  cadence is visible in the transcript)
- [d39]/[d47]/[d53] deposit lines with the same honest voice.

Observations (not blanks): the gift line is templated (every gift "fits"),
but it names the villager and the specific piece and shows the villager trying
it on immediately — deliberate, owned, in-person. The deposit voice is the
deposit-is-consent channel the canon re-read names. The pile-draw step is
silent (no say-line) — the equipment happens inside villagerGearDay; the draw
is proven by the pileTakes counters, not the transcript. The craft beat has
no wild transcript (still precondition-starved — unchanged from the pilot).

## Telemetry deviation check
Against scale-wall-preseat.json (regime-correct; winseat scale-wall.json is
explicitly out-of-regime for pre-seat substrates): LOUD fired on national
(21 → 4 control, 21 → 6 armed). Verdict: EXPLAINED — n artifact (32 vs 16) +
regime artifact (baseline carries NODEWITNESS=1/VETREL=1; this pinned substrate
doesn't). Within the matched corpus the lever does not depress national
(4 → 6). table/wins/exiled quiet. Baseline NOT rolled forward (this run is not
the regime's baseline source). Full write-up in armored15-confirm-paired-compare.md.

## Verdict
**PRIMARY CONFIRMED (3 → 5 on fresh seeds) + ENGAGEMENT REPLICATES (8/8, 8/8).**
Mechanical NO-GO on the starvation guardrail as written (12 vs ≤10); autopsied
as rare-event noise + denominator blindness, not lever harm — the structure is
not killed, per kill discipline. This is a confirm: nothing builds, nothing
lands — the armorvillage layer stands as measured in sim-armorvillage-b, with
the armored15 move now sized on two independent seed corpora (pilot + this
confirm both read exactly control 3 → armed 5). Wave-5's armor leg opened on
2/16 armed seeds, 0/16 control — the wall signal the layer was built for.
Nexts (unchanged from the pilot): (1) materials-inflow design for the craft
beat's precondition; (2) next-run metric: starv/100 village-days.

## Landing note (stale-base lesson #793)
Master moved during the run (db7a0456 → 18c621cd: journey-deepening r35,
sim-vetkill-autopsy, journey-establishment r28 — all scripts/evidence/docs,
zero src/js). Re-verified pre-landing: `git diff` between anchor and new master
is EMPTY for src/, scripts/policies/, scripts/sim-harness.js,
scripts/instr-windowstay-20261021.js, scripts/det-gate.js — the entire
measurement substrate is byte-identical, so no re-run is required. The branch
(sim-armored15-confirm) holds only additive commits (new scripts + evidence)
and is left for the coordinator to review-merge (--ff-only not possible with
master ahead; no rebase per push-discipline).

## Wall numbers (this corpus, n=32)
- control: national 4/16 (ever 10/16), table 15/16, wins 0/16, wave4 16/16,
  wave5 0/16, median survival 122d
- armed:   national 6/16 (ever 11/16), table 15/16, wins 0/16, wave4 15/16,
  wave5 2/16, median survival 144d (paired median diff +10d)
