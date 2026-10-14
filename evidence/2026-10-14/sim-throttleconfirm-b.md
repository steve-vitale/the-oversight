# THROTTLE-CONFIRM — prodthrottle §10-12 staged confirm (fleshout-b ARM 2)
2026-10-14 (run 2026-10-14T04:33Z) | axis: food-economy | arm: throttle-confirm

## Context
The 2026-10-14 16-run pilot under honest courtship policies
(evidence/2026-10-14/sim-prodthrottle-b2.md, lever landed as afb736e6)
met GO 5×: armed fresh-rot 986.1k vs identical-seed baseline 3845.8k
(−74.4%). This is the staged §10-12 CONFIRM: 12 FRESH seeds
(101/202/303/404/505/606/707/808/909/111/222/333 — distinct from the pilot's
11/22/33/44/55/66/77/88), identical seeds on both sides, 180d death-aware.

"Off" side = prodThrottleEngaged() patched to `return false` in the worker's
worktree ONLY (never committed — restored via `git checkout HEAD --`
before the armed side); "on" side = landed afb736e6. Both sides ran
identical seeds (seed-identity check GREEN post-hoc).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14) — written BEFORE running
- Question: does the pilot's −74% fresh-rot reduction CONFIRM on 12 fresh
  seeds with the lever as landed, under the same honest courtship policies?
- Lever: PRODTHROTTLE as landed (afb736e6), unconditional — no design change.
- PRIMARY: absolute fresh-rot kcal, armed total vs before-side total,
  identical seeds. GO = armed ≤ 0.85 × before (≥15% reduction), direction
  consistent with pilot (armed < before). A miss is NO-GO — never re-scored
  mid-run.
- GUARDRAILS (adopting the pilot's §14 metric review — one-sided median,
  noise-aware hungryDays):
  - national: armed ≥ before − 2
  - median survival: armed_median ≥ before_median − 10d (ONE-SIDED:
    improvement does not fail)
  - hungryDays: armed ≤ before + max(5, 10% of before)
  - starvation deaths: armed ≤ before + max(5, 25% of before) (corroborating)
  - combat deaths: report delta; fail only if a new death-cause mode appears
    or armed > 2× before
  - table / wins / exiled: report; no pre-registered bound (pilot: 0/0 both)
- Horizon: 180d death-aware (pacing-law max, same as pilot); dead villages stop.
- Seeds: 101/202/303/404/505/606/707/808/909/111/222/333 ×
  leadcourt/belongseek, IDENTICAL seeds both sides (24 runs/side).
- Instrument-honesty: SMOKE=1 gate before any confirm spend; per-side shape
  assertion (prodThrottleEngaged source matches the declared side) before
  each side's runs; per-seed dir identity check after both sides.
- Wall numbers reported: national/table/wins, wave 4-5 unlocks,
  median/max survival, death-cause shares, exiled.

## Instrument-honesty gate (BEFORE any confirm spend)
- `SIDE=on node scripts/test-throttleconfirm-20261014.js`: ALL GREEN —
  landed shape (`pantryFreshDays() > 4`) asserted in source, engaged()==true
  on a 10-day pantry, false on empty; unwrap RED/GREEN (#69 bug shape
  detected, named-export unwrap correct both policies); SMOKE=1 gate passed
  (policies genuinely drive).
- Off-patch applied (single-line diff, worktree-only):
  `SIDE=off` test ALL GREEN — engaged()==false even on a 10-day pantry;
  SMOKE=1 passed on the patched tree (patch doesn't break policy driving).
- Post-sweep: `--check-dirs` GREEN — 24 vs 24 files, identical
  policy:seed sets, all 12 fresh confirm seeds (not the pilot's).

## Confirm results

| metric | before (off) | armed (on) | delta | pre-reg |
|---|---|---|---|---|
| fresh-rot kcal (PRIMARY) | 8098.4k | 4773.7k | **−41.1%** | GO (≥15%) ✓ |
| preserved-rot kcal | 581.4k | 508.7k | −12% | — |
| fresh-rot share | 93.3pp | 90.4pp | −2.9pp | — |
| median survival | 136d | 122d | −14d | **FAIL** (bound ≥126d) |
| mean survival | 129.5d | 124.3d | −5.2d | — |
| national | 16/24 | 18/24 | +2 | ≥14 ✓ |
| table / wins | 0 / 0 | 0 / 0 | — | — |
| exiled | 1 | 3 | +2 (tiny base) | report only |
| max wave reach | 4 | 4 | 0 | — |
| wave-4 reach | 9 | 8 | −1 | — |
| wave-5 reach | 0 | 0 | — | — |
| hungryDays | 52 | 56 | +4 | ≤57.2 ✓ |
| starvation deaths | 26 | 38 | +12 | **FAIL** (bound ≤32.5) |
| combat deaths (pilot convention) | 116 | 139 | +23 | PASS (<2×, no new mode) |
| total deaths | 262 | 291 | +29 | — |
| throttle redirects | 0 | 8,636 | mechanism fires at scale | — |
| tribute (belongseek) | 1798.1k/168w | 1509.4k/152w | −289k/−16w | guardrail-only |

Per-seed: rot fell on 15/24 seeds. The 9 rises follow the pilot's pattern —
armed villages that lived longer accumulated more rot (lead-333: 109→164d,
578→661k; belo-808: 145→167d, 97→384k; lead-808: 60→127d, 98→119k).
GO threshold was armed ≤ 6883.6k; armed came in at 4773.7k (2.7× the
required reduction).

Per-seed JSON: evidence/2026-10-14/throttleconfirm-perseed-before/*.json and
throttleconfirm-perseed-armed/*.json. Aggregates: throttleconfirm-before.json,
throttleconfirm-armed.json. Adjudication: scripts/adjudicate-throttleconfirm-20261014.js.

## Verdict: NO-GO (killed-at-guardrail)
The PRIMARY confirms (−41.1%, GO by 2.7×) and national/hungryDays/combat
guardrails pass — but median survival regressed 14d (bound: −10d) and
starvation deaths rose 26→38 (bound: ≤32.5). Per §14 the pre-registered
guardrails bind: a miss is NO-GO, never re-scored mid-run. The lever's
rot effect is real and large; its costs are real too. See Metric review.

TELEMETRY: two LOUD lines, both EXPLAINED (same as pilot):
- national 8→18 vs scale-wall.json — the baseline file is the r16 gate-off
  courtship aggregate (different suite composition); the identical-seed
  control shows national 16→18, no regression. No baseline roll.
- exiled 0→3 vs scale-wall.json — the identical-seed control shows exiled
  1→3 (before: leadcourt-101; armed: leadcourt-303, belongseek-101,
  belongseek-303). Tiny base, not a pre-registered guardrail; noted.

## Wall numbers (scale wall — report every run)
Before: national 16/24, table 0, wins 0, exiled 1, wave4 9/24, wave5 0/24,
median/max survival 136/180d, hungryDays 52.
Armed: national 18/24, table 0, wins 0, exiled 3, wave4 8/24, wave5 0/24,
median/max survival 122/180d, hungryDays 56.
Death-cause shares (before→armed): combat 116→139, starvation 26→38,
monster 42→35, villager combat 30→17, sickness 19→27, contest 10→14,
wound 11→9, thirst 2→4, expedition 3→3(+1 "the expedition"), lockjaw 1→2,
Ugly-Eyes 1→0, alien 1→0(+1 "experiment", +1 "wound_fever" — label variants,
not new modes).

## Village assessment (plain words)
The fresh seeds grew STRONGER villages than the pilot's: median survival
136d (pilot: 64d), national on 16/24 runs (pilot: 4/16), three 180d
leadcourt survivors. These are villages that actually build surplus — the
throttle's premise — and the redirect fired 8,636 times (vs 2,782 on the
pilot). The pantry stops being a mountain: armed rot falls 41% in absolute
terms across the suite.

But the villages also die more chaotically. The throttle changes what
every villager does every day, so trajectories diverge hard: per-seed
survival swings ±60-100d in both directions (lead-202: 62→122d; lead-404:
136→35d; lead-222: 180→115d; belo-101: 110→170d). Against that churn, the
median slipped 14 days and 12 more villagers starved — concentrated on
five seeds (belo-111 +3, belo-303 +5, belo-909 +4, lead-303 +4, lead-505 +3),
partly offset by four seeds where starvation fell (lead-101 −6, lead-404 −3,
belo-101 −2, lead-202 −1).

The mortality wall still rules: 22/24 before-side and 22/24 armed-side runs
end village-lost (only 606/707 belongseek-armed and 303/606/222
leadcourt-before + 333 belongseek-before survived to 180). Nobody reached
the table or won on either side. The lever wins the rot battle inside dying
villages but doesn't move the wall — same as the pilot.

## Sense-test (villager day-in-the-life, throttled vs unthrottled)
Two 80d samples per side (leadcourt-808, belongseek-909), same seeds both
sides. scripts/sample-throttle-days-20261014.js.

OFF side (unthrottled): redirects 0 both samples. Villagers forage
(120/205 forage acts), eat, take from pantry, talk (84 talkTo/endConvo
pairs on leadcourt-808 — real conversations happening), boil water, drink.
leadcourt-808 died at day 60 (village-lost); belongseek-909 survived 80d.

ON side (throttled): 370 redirects (leadcourt-808, survived 80d, hungry 0)
and 286 (belongseek-909, survived 80d, hungry 2). The redirect beat reads
as people deciding, not tokens rerouting:
- "🌿 A person, maybe 30s checks the pantry before heading out — the
  shelves are full, ~6 days of fresh on hand… leaves the harvest standing
  and turns to the wood run instead. The pantry can't take more; the wild
  will keep."
- "🌿 Jaxon checks the pantry before heading out — the shelves are full,
  ~5 days of fresh on hand… leaves the fish nets standing and turns to the
  stone pile instead. The pantry can't take more; the wild will keep."
Named villagers and strangers alike narrate the decision; the day-count is
honest (5-6 days, gate is >4). The redirected labor is REAL work, not a
no-op: wood → village pile + trust ("🪵 X hauls back N wood. The pile
grows."), stone → communal stash + trust, water → dirty cistern + trust.
Villagers still forage normally when the pantry is below the gate (158/198
forage acts on the armed samples) — the throttle only bites on surplus.

Gaps the sense-test surfaced (documented, not chased):
- The wood/water/stone labor is invisible in pacing telemetry (branches
  say() directly without pacingRecord) — 370 redirects fired with zero
  wood/water/stone verbs in the top-25 act keys. Telemetry gap, not a
  behavior gap.
- "leaves the fish nets standing" — nets don't stand; the pilot polished
  garden→"harvest" but fish kept "fish nets". Minor phrasing polish item.

## Blanks filled / documented
- FILLED: scripts/test-throttleconfirm-20261014.js — the confirm's
  measurement proof (per-side lever-shape assertion vs declared SIDE,
  functional engaged() check both sides, #69 unwrap RED/GREEN, SMOKE=1
  gate, --check-dirs seed-identity). GREEN on both sides.
- FILLED: scripts/adjudicate-throttleconfirm-20261014.js — pre-registered
  GO/guardrail adjudication against the two OUT files. Reproduces the
  pilot's GO on pilot data; returns NO-GO on the confirm data.
- FILLED: scripts/sample-throttle-days-20261014.js — sense-test sampler
  (redirect narration capture + act-mix + top act keys).
- DOCUMENTED (not chased — not this arm's axis):
  1. SIM-PERF PATHOLOGY: leadcourt+seed202 (mode prodthrottle-leadcourt)
     runs ~50× slower per day than competent on the same seed
     (~8.5 CPU-s/day vs ~0.15). The run completes (62d then 122d) — slow,
     not stuck — but a seed+mode-specific cost blowup in the
     leadCourtship path. Belongseek-808 armed showed the same pattern
     (~8 min for the run). Needs a profile pass, not a confirm-run fix.
     (Also appended to hidden_files/sim-findings.md.)
  2. VM REBOOT mid-run (~05:07 UTC) killed the first before-side sweep
     after 2/24 runs; /tmp was wiped (log lost). Recovered by rerunning:
     the harness is deterministic — leadcourt-101 and leadcourt-202
     reproduced BYTE-IDENTICAL (days, end, wave, rank, rot, hungry).
     Lesson: sweep logs go to the workspace (evidence/), never /tmp.
  3. Sibling contention: the sibling loop's sweep-throttlefeast ran
     concurrently all run (load 5-7 on the 2-core box); before-side pace
     was ~4-7 min/run until it eased. No interference with results
     (separate worktrees, identical-seed design).
  4. Exiled 1→3 (tiny base; not a guardrail). No new death mode.
  5. Armed sims run FASTER than before-side (smaller pantries → cheaper
     sweepSpoiled scans) — a consistency signal the lever is really
     capping the pantry.

## Metric review (§14)
1. Adopted from the pilot: median-survival guardrail one-sided
   (regression-only), hungryDays noise-aware (≤ baseline + max(5, 10%)),
   primary = absolute fresh-rot kcal. All three held up well.
2. THE STARVATION GUARDRAIL may be miscalibrated for chaotic divergence.
   Bound was armed ≤ before + max(5, 25%) = 32.5; observed 38 (+12).
   The +12 is concentrated on 5 seeds (+19) with 4 seeds offsetting (−12),
   and hungryDays barely moved (52→56) — if the throttle were directly
   starving villages via thinner buffers, hungryDays should have risen
   with it. The pattern looks downstream of trajectory divergence (seeds
   where armed villages died earlier starved more; where they lived
   longer they starved less) rather than a direct throttle effect. But
   the pilot DID predict a thinner-buffer cost (+3/16 there), and the
   mechanism is plausible — I cannot rule out a real effect. This is a
   metric-design question for the NEXT run, not a re-score of this one:
   propose starvation deaths per 100 villager-days (denominator-aware)
   and/or a wider bound calibrated on measured seed variance.
3. THE MEDIAN-SURVIVAL GUARDRAIL (−10d) may be tighter than this suite's
   noise floor. The mean moved only −5.2d while the median moved −14d;
   per-seed swings are ±60-100d in both directions. The before-side
   median (136d, 4/24 runs at the 180 cap) may itself be a high draw.
   A variance-calibrated bound (e.g. from a repeated-baseline A/A run)
   would be more honest than ±10d. Next run, not this one.
4. The primary (absolute fresh-rot) was the right call again: −41.1% is
   unambiguous, and the share metric would have shown only −2.9pp.
5. Tribute stayed guardrail-only and behaved (1509k/152w armed vs
   1798k/168w before — downstream of mortality reshuffle; courtship
   functioned on all 12 armed belongseek seeds).
6. Determinism held for THESE seeds (leadcourt-101 and leadcourt-202
   reproduced byte-identically across a VM reboot that killed the first
   sweep mid-run), but sim-findings notes a seed-88-class nondeterminism
   on long fight-heavy trajectories — identical-seed before/after has a
   genuine noise floor on some seeds. A future re-confirm should include
   an A/A repeat (same side, twice) to measure the suite's own variance
   before judging guardrail misses of a few days/deaths.

## Convergence state
food-economy: pilot GO (prodthrottle-b2) stands; CONFIRM **NO-GO
(killed-at-guardrail, 2026-10-14)** — primary held (−41.1%, 2.7× GO) but
median survival −14d and starvation +12 breached pre-registered guardrails.
The lever stays landed (afb736e6); the confirm did not promote it. Next
step is a Steve/coordinator call: re-confirm with variance-calibrated
guardrails, or work the thinner-buffer cost directly (pilot's proposed
"exempt redirect while any villager is actively hungry" arm).
