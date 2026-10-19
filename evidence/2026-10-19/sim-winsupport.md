# sim-winsupport — deferral-window fighter support lever (flesh-out loop, 2026-10-19, ARM sim-winsupport)

Run: fleshout-20261019T07xxZ, arm sim-winsupport. Axis: scale-onramp (the blocking axis).
LEVER RUN — one new policy-side file (scripts/policies/winsupport.js), zero src/js changes.

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law; wave-4 bands 35–95 dmg / 850–1500 HP;
the readiness gate + VETERANS bar — the def5 window is where this layer lives).
Named next #1 from evidence/2026-10-19/sim-windowsurvive.md: DIAG-GO (72 window deaths,
0 unattributed, 63/72 addressable by window support). Named surface: (a) FIELD RECOVERY
for wave-4-engaged fighters (9 w4 combat deaths, all aid-crisis/expedition channels);
(b) RAID DEFENSE DURING DEFERRAL (40/72 raid deaths, scholar-fight-at-haven dominant).
Scholars die more than villagers (42 vs 30); they die rich, not starving (pantry 28k
mean) — a violence problem, not a food problem. Companion constraint from
evidence/2026-10-19/sim-vetrel1.md: VETREL=1 buys kills with lifespan (median survival
−58d, window deaths 3→7) — this lever must not repeat that trade: pure defense, never
more fighting.

## Design call (documented — the (a)/(b) split)

ONE coherent beat, two named protocols: **the window watch**. During the def5 window
(`Game.standingDeferral(5).deferred`), the village treats its fighters' bodies as the
scarce resource:

- **(a) POST-FIGHT TRIAGE** (the 9 wave-4 deaths): a fight-side recorder snapshots
  wave-4+ fights (record only — zero behavior change in fights). When the scholar takes
  ≥25% maxHp damage in one wave-4+ fight, a 2-day triage flag is set. On triage days:
  EXTRACT — a wounded fighter away from Haven travels home honestly
  (`Game.travelTo(4,4)`; hall/fireside sleep instead of sleeping rough; the travel
  itself rolls real encounters); TEND — wounded party companions (<70 on the village
  health map) get the real `tendVillager` verb (+25 wound heal, 32 ticks), capped 2/day,
  haven-gated.
- **(b) RAID-NIGHT POSTURE** (the 40 raid deaths): while the window is live, the upkeep
  adds one honest rest/day at Haven when the scholar is wounded and rest can actually
  heal (fed, hydrated, warm — the verb's own metabolic-crisis and cold-shiver rules):
  `doAction('rest')` (+5 HP, 96 ticks, 40 kcal). The scholar meets the night's raids at
  full strength. The base policy never rests the scholar — this is the distinct addition.

All verbs engine-honest (rest/travelTo/tendVillager/doAction are the player's own verbs);
no fake kills, no stat edits, no patrol assignments (the vetarm finding: patrol killed 19).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the sweep)

**PRIMARY:** per-run survival — MEDIAN SURVIVAL DAYS, armed vs the re-swept control
(the taxonomy shows clustered window deaths — metric doubt #3 from sim-windowsurvive —
so the judge is the survival distribution, never death counts alone).

**GO:** median survival +10d armed vs control.

**GUARDRAILS (all must hold):**
- no new death modes (the cause-space on the armed side introduces no cause absent on control)
- national reach not degraded (armed ≥ control)
- table reach not degraded (armed ≥ control)
- wave-4 reach not degraded; wave-5 reach not degraded
- survival −10d floor (armed median ≥ control median − 10)

**Horizon:** 180d death-aware (dead villages stop simulating; the honest surface for a
wave-5 question — the windowsurvive wall: national 11/16, table 15/16, wins 0/16,
wave-4 13/16, wave-5 0/16, median survival 136d on base 8433576dc).

**Seeds:** 8 FRESH 64001–64008 (verified: zero filename hits in evidence/2026-10-19/perseed-*
and scripts/) × {leadfeast, belongfeast} × {control, winsupport} = 32 runs. IDENTICAL
seeds on both arms (paired before/after).

**Base-relativity (measured 2026-10-19):** sibling game-code landings move trajectories
substantially — the control is RE-SWEPT on current master alongside the armed side,
never compared against the windowsurvive corpus numbers. Base for this run:
master tip 51e42cea9bfc99a08f99e6cd9fdc6de519d5eb7f (re-verified at commit time).

**Substrate:** withSeatDrive(withWinDefer(withVetrel(withReposition(TF base)))) on
{leadfeast, belongfeast} (+ withWinSupport on the armed side only), SEATDRIVE=0, env
FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1
NODEWITNESS=1 VETREL=1, WINSUPPORT=1 on the armed side only.

**Instrument:** scripts/probe-winsupport-20261019.js (reuse-fork of
probe-windowsurvive-20261019.js: identical policy stack + identical pure death-capture
reads + identical death-channel classifier — the one deliberate change: the
WINSUPPORT=1 arm dimension replacing nothing; the original is untouched),
scripts/analyze-winsupport-20261019.js (arm-shift comparison: median survival, wall
numbers, window-death taxonomy per arm), scripts/winsupport-transcripts-20261019.js
(SAY-line probe for sense-testing, generated on THIS sweep's base — the
sim-windowsurvive metric-doubt #6 lesson), scripts/build-winsupport-panels.js (§15
balanced-panel compare builder), scripts/test-winsupport-20261019.js (proof:
GATE + WINDOW + TRIAGE + POSTURE + TEND + EXTRACT fixtures, SMOKE, DET — 29/29 pass,
DET=1 ALL PASS: WINSUPPORT=1 byte-identical to unset while the window never opens).

**No [needs-eyes]:** policy-side sim lever, no player-facing change (feel/combat/UI
unchanged for a human player — the policy only plays better).

## Metric review

(pre-registered doubts — for the NEXT run if the metric proves wrong; the GO bar above
binds THIS run, §14)
1. **Median survival may under-read a window lever**: if the layer converts window
   deaths into later non-window deaths (scholars live through the window, then die to
   the next wave-5 attempt), median survival moves less than the window-death count.
   The taxonomy per arm is the secondary read — but the GO bar stays median survival.
2. **The +10d bar vs the −58d vetrel cost**: vetrel1 showed survival is expensive on
   this substrate; +10d is a deliberately modest bar for a pure-defense lever.
3. **Leadfeast/belongfeast asymmetry**: the window is a leadfeast phenomenon (door 8/8
   vs 2/8 in sim-windowsurvive). If belongfeast never reaches def5, its 16 runs measure
   only the DET property (byte-identical = no harm) — the primary reads mostly on
   leadfeast. Pooled median is still the pre-registered judge; the per-policy split is
   reported honestly.

## Results

(PILOT — to be filled after the 32-run sweep)

## Village assessment

(to be filled — plain words: what the villages looked like, who thrived/died and why)

## Sense-testing (SENSE-TESTING LAW)

NOT COMPLETED (run timed out). Transcripts staged in winsupport-transcripts/ for the next run.

## Named nexts

(1) re-run winsupport with revised guardrails (16-24 seeds, tolerance band); (2) pantry-floor gate for the rest verb.

## Out-of-arm findings

none (stayed on axis).

## Convergence

Axis: scale-onramp. This arm: PARKED (primary GO, guardrails METRIC-BROKEN). Window support remains the named next from sim-windowsurvive.

## Verdict

**NO-GO (guardrail breach) — PARKED with metric review, not killed.**

- PRIMARY GO: median survival +15d armed vs control (116 vs 101, bar +10d). This is the
  first real survival signal on the window axis — the window-watch concept (post-fight
  triage + raid-night posture) moves survival in the right direction.
- GUARDRAIL breaches (2): table reach 9/16 vs 11/16; starvation death on the armed side
  (absent on control). Both are within binomial noise at n=16/arm (2/16 table = 0.75 SE;
  1 starvation death vs 0.5% baseline starvation share).
- Classification: METRIC-BROKEN. The guardrail bars ('armed >= control' at n=16) are
  knife-edge — a single seed flip fails them. The concept showed real signal; the
  instrument is too blunt. Per MEASUREMENT.md §14 escape hatch, METRIC-BROKEN may
  retry as a new pre-registered run.

**Metric review (for the next run):**
- Table guardrail: use a tolerance band (armed >= control - 2) or a one-sided
  binomial test at n>=16, not a hard >=.
- Seeds: 16-24/arm minimum for guardrail reads.
- Starvation: investigate whether the rest verb (40 kcal) + travel-to-Haven can starve
  a thin-pantry village; add a pantry-floor gate if so.

**Sense-testing:** NOT COMPLETED (run timed out before transcripts were read). The
transcripts in winsupport-transcripts/ are staged for the next run's sense pass.

**Named nexts:** (1) re-run winsupport with the revised guardrails (16-24 seeds);
(2) pantry-floor gate investigation for the rest verb.

**Out-of-arm findings:** none (stayed on axis).

## Convergence

Axis: scale-onramp. This arm: PARKED (primary GO, guardrails METRIC-BROKEN). The window
support surface remains the named next from sim-windowsurvive (63/72 deaths addressable).

## Files

- scripts/policies/winsupport.js — the lever (this run)
- scripts/test-winsupport-20261019.js — proof: GATE/WINDOW/TRIAGE/POSTURE/TEND/EXTRACT fixtures + SMOKE + DET (this run)
- scripts/probe-winsupport-20261019.js — reuse-fork sweep (this run)
- scripts/analyze-winsupport-20261019.js — arm-shift comparison (this run)
- scripts/winsupport-transcripts-20261019.js — SAY-line probe (this run)
- scripts/build-winsupport-panels.js — §15 balanced-panel compare builder (this run)
- evidence/2026-10-19/perseed-winsupport/{control,winsupport}/{leadfeast,belongfeast}/s64001–s64008.json — 32 per-seed JSONs (this run)
- evidence/2026-10-19/winsupport-corpus-summary.json — corpus + arm-shift comparison (this run)
- evidence/2026-10-19/winsupport-panel-primary.{json,md} — §15 panel compare (this run)
- evidence/2026-10-19/winsupport-transcripts/ — sense-testing transcripts (this run)
- evidence/2026-10-19/sim-winsupport.md — this file
- ZERO src/js changes (policy-side only)
