# sim-wave5cond — SCALE-WALL r25: the CONDITIONAL wave-5 survival posture

Arm: `sim-wave5cond` (oversight-flesh-out-loop, run 2026-10-14, axis scale-onramp).
Policy-side only — new file scripts/policies/wave5cond.js (gate `WAVE5COND=1`,
default OFF); sweep driver scripts/sweep-wave5cond-20261014.js; proof tests
scripts/test-wave5cond-20261014.js (10/10 green). No src/js game-code changes.
No balance changes — the layer drives existing verbs with existing gates.

Lineage: r24 (evidence/2026-10-14/sim-wave5posture.md) measured the blanket
post-unlock posture (homebound scholar, no wild ranging, proposal pause, dusk
top-up feasts): mean post-unlock survival 32.8d → 34.8d (GO needed +15d) —
KILLED AT PILOT. The filed blank ("Post-unlock trajectories split weak/strong",
hidden_files/sim-findings.md): the posture HELPED villages dying fast
post-unlock (s33 +19d, s44 +16d) but COST strong ones (s77 −22d + national
lost, s66 −7d) — where the village is strong, the scholar's ranging is
load-bearing. This arm is the filed "next design": the r24 posture engaged
CONDITIONALLY — only while the village is actively losing scholars in the
window — never as a blanket rule.

## THE CONDITION (defined here, BEFORE any sims — docs/MEASUREMENT.md §14)

After wave-5 unlock latches, each day count trailing-30d scholar deaths
(succession events, observed as `state.scholar.villagerId` changing between
days — policy-observable in-run; tracked passively from day 1, no behavior
change pre-window or gate-off):
- ENGAGE the r24 posture verbs when count >= 2
- STAND DOWN when count < 2 (deaths age out of the window)
- At the unlock latch, evaluate immediately from pre-unlock history.

Why >=2 (not >=1): a single scholar death is normal attrition; the pathology
the r24 posture actually saved was the succession-chain spiral (>=2 scholar
deaths clustering in the window: s33 d86/87/93/93, s44 d98x2/d119/d124x2).
Known risk, stated upfront: the r24 hurt-seeds s66/s77 ALSO had >=2
pre-unlock scholar deaths, so the condition will fire on them — whether the
net is positive is exactly what the pre-registered GO adjudicates. The
continuous stand-down is the mitigation vs r24's blanket pin: strong
recoveries resume ranging when the bleeding stops.

When ENGAGED the verbs are the r24 posture verb-for-verb (reconstructed from
the preserved RED spec scripts/test-wave5posture-20261014.js — the r24 policy
file was deleted per kill protocol and was never committed, so no git
recovery): travel guard (monster-active wild tiles declined; haven + adjacent
+ homeward allowed; combatExit always passes), proposal pause, walk-home at
engage, dusk top-up feast vs wave-5 haven threat (honest feast gates + 1.5x
buffer, one/day). When NOT engaged (strong village): pure delegation.

## Pre-registration (MEASUREMENT.md §§9–12, 14) — written BEFORE the sweep

- ARMS: leadfeast (baseline: FEASTSCALE_R13=1, WAVE5COND off) vs condfeast
  (FEASTSCALE_R13=1, WAVE5COND=1).
- SEEDS: pilot 11,22,33,44,55,66,77,88 (8; pilot gate per §9). Confirm: the
  r24/plentycost suite (15 measurable; 505 excluded — it stalls).
- HORIZON: 180d death-aware (runDays stops on Game.over / pop zero). Why 180:
  wave-5 is a late metric; shorter caps truncate exactly the survivors that
  carry the post-unlock window. WIN-PATH HORIZON 180 is the absolute max.
- PRIMARY METRIC: mean post-unlock survival days (endDay − unlockDay5) among
  wave-5 unlockers >= 49.8d (the r24 blanket arm's 34.8d + the 15d bar it
  missed), AND table reaches among wave-5 unlockers >= baseline.
- THIN-N RULE: if unlocks < 2 on BOTH sides → UNMEASURABLE → kill per §9, no
  confirm spend.
- GUARDRAILS: overall median survival within ±10d of baseline, national >=
  baseline−2, no wave-reach regression.
- WHAT WOULD KILL IT: condition never fires on any unlock seed (precondition
  kill), GO missed at pilot (no confirm spend), any guardrail breached.
- INSTRUMENT: scripts/sweep-wave5cond-20261014.js; per-seed JSON
  evidence/2026-10-14/wave5cond-sweep.json. Dot-paths:
  summary.perPolicy[].wave5unlock / .meanPostUnlock / .tableAmongUnlockers /
  .national / .table / .medianDays / .exiled / .wcEngageDays / .wcEngages /
  .wcMonsterTileDeclined / .wcFarTravelDeclined / .wcProposalsPaused /
  .wcTopUpFeasts / .wcHomeReturns;
  rows[].unlockDay5 / .postUnlockDays / .wcEngageDays / .wcEngages /
  .u5ScholarDeaths30d / .u5LivingNPCs / .u5PantryDays / .u5PantryKcal /
  .windowSay.
- BASELINE RE-RUN: the base moved since r24 (combat-survival fixes 3e7e0cc6
  landed after r24). The identical-seed baseline is re-run on current master
  FIRST (evidence/2026-10-14/wave5cond-baseline.json), then compared to the
  r24 numbers — the 49.8d bar is absolute and does not move with the re-run.

## RESULTS

Sweep: 16/16 runs completed (8 seeds x leadfeast/condfeast, 180d death-aware,
identical seeds, one process). Per-seed JSON:
evidence/2026-10-14/wave5cond-sweep.json (dot-paths in the pre-registration
header). Proof tests scripts/test-wave5cond-20261014.js: 10/10 green
(gate-off byte-identical delegation RED-pinned; pre-window passive tracking
RED; strong-village no-engage RED; engage/disengage/guard/top-up GREEN;
defensive load GREEN). Real-Game smoke (12d, WAVE5COND=1): clean.

### The baseline moved — and then moved again (read before the verdict)

Step 1 re-ran the identical-seed baseline on current master FIRST
(evidence/2026-10-14/wave5cond-baseline.json):
- leadfeast: 4/8 unlocks (s22 u5=132 postU=48 table-lesser; s44 u5=111
  postU=39; s77 u5=69 postU=14; s88 u5=69 postU=7); meanPostUnlock 27.0d
  (r24: 32.8d); table among unlockers 1 (r24: 2); national 3 (r24: 6);
  median 105d (r24: 117d). The combat-survival fixes (3e7e0cc6) landed
  after r24 moved the base substantially.
- The unlock-day sampler VALIDATED the condition's selectivity on these
  actuals: trailing-30d scholar deaths at unlock = s22: 0, s44: 1, s77: 3,
  s88: 2. The >=2 condition fires exactly on the two fast-dying unlockers
  (s77 postU=14, s88 postU=7) and spares the two strong ones (s22 postU=48
  + table, s44 postU=39). No precondition kill — the condition discriminates
  weak/strong as designed. (Pantry is NOT the discriminator: s77 died fast
  with 172 pantry-days banked.)

Then the pilot's OWN baseline side — same seeds, same policy, same code,
same driver, different process — gave a DIFFERENT baseline: meanPostUnlock
27.0 -> 34.8 (s44 postU 39->66, s88 7->11, s55 d132->d124). The baseline is
not stable across invocations. This is the seed-88 nondeterminism finding
grown teeth — see the determinism investigation below. The 49.8d GO bar is
absolute (per pre-registration) and does not move; but the instrument's
noise floor must be understood before any number is trusted.

### Pilot numbers (reported, then adjudicated)

- Baseline (in-pilot): 4 unlocks (s22 u5=132 postU=48 table; s44 u5=111
  postU=66; s77 u5=69 postU=14; s88 u5=69 postU=11); meanPostUnlock 34.8d;
  table among unlockers 1; national 4; median 105d; t5 4.
- Armed (condfeast): 2 unlocks (s22 u5=57 postU=24; s55 u5=79 postU=101
  table-lesser); meanPostUnlock 62.5d; table among unlockers 1; national 3;
  median 81d; t5 2.
- Condition telemetry (armed): wcActiveRuns 2, wcEngages 4, wcDisengages 3,
  wcEngageDays 94, wcMonsterTileDeclined 216, wcFarTravelDeclined 5,
  wcProposalsPaused 0, wcTopUpFeasts 1, wcHomeReturns 0. The condition fired
  and the verbs ran: s22 engaged 20/24 post-unlock days (1 engage, death
  spiral); s55 engaged 74/101 post-unlock days (3 engage/disengage
  oscillations as deaths aged in/out of the window).
- Pre-registered GO: mean 62.5 >= 49.8 PASS (numerical); table among
  unlockers 1 >= 1 PASS (numerical). Guardrails: median 105 -> 81 (-24d,
  BREACHES the ±10d band); national 4 -> 3 (within baseline-2); wave-reach
  4 -> 2 unlocks (regression on the "no wave-reach regression" guardrail).

### Determinism investigation (the verdict's actual basis)

The pilot's headline numbers cannot be trusted, and I can prove why:

1. **det-test** (scripts/det-test-20261014.js): same seed + same policy,
   twice, IN ONE PROCESS. s44: d161 village-lost vs d180 survived. s88:
   d76 vs d80. DIVERGED. Identical-seed before/after is not a controlled
   comparison even within a process — the noise is per-RUN, not per-process.
2. **bisect** (scripts/diag-nondeterminism-bisect-20261014.js): per-day
   trajectory hashes on s44, two runs. Days 1-111 BIT-IDENTICAL (day,
   health, kcal, roster, position, wave, pantry all match); first divergence
   day 112 (pantry 2200 vs 1600), then a roster split day 113 (11 vs 10).
   The RNG stream is identical for 111 days, then something unseeded fires
   or first matters — on/just-after the wave-5 unlock (d111), in a
   fight-heavy trajectory. Tractable lead for the entropy hunt, filed below.
3. The layer is PROVABLY inert pre-window (R2 RED: gate-on pre-window =
   passive tracking only, verbs pass through; trackScholar/inWindow are
   RNG-pure reads). Therefore every pre-unlock divergence between baseline
   and armed on the same seed — s22 armed unlocking d57 vs baseline d132,
   s55 armed unlocking d79 vs baseline never, all six armed pre-window
   deaths — is noise BY CONSTRUCTION, not the layer.
4. Consequences: the armed "win" (62.5d mean on n=2) rides on s55's lucky
   trajectory (the layer cannot take credit for the unlock or the
   trajectory shape — only for post-unlock modulation, which it did: 74
   engaged days). The guardrail "breach" (-24d median) rides on six
   pre-window deaths where the layer is inert — noise, not layer-caused.
   The noise floor (baseline mean 27.0 -> 34.8 between invocations; per-seed
   postU swings of ~27d) exceeds the effect size the pilot was built to
   resolve.

### Verdict: KILLED AT PILOT — UNMEASURABLE, not disproven

The pre-registered kill conditions include "any guardrail breached" — the
median guardrail breached (-24d), so this is a clean NO-GO by the letter.
But the honest verdict is stronger: **the pilot cannot measure the layer at
all.** The instrument (identical-seed before/after, n=8) is noise-dominated
on the primary metric — proven, not suspected. Killing for the guardrail
alone would imply the layer caused the -24d; it provably did not (inert
pre-window). Passing on the primary alone would imply the layer caused the
62.5d; it provably did not (n=2, lucky s55 trajectory, unlocks are
pre-window noise). Per the throughput doctrine (fast kills beat 90m maybes)
and §9: no confirm spend. The arm is killed; the layer file is deleted per
the kill protocol; proof + driver + evidence + instruments survive.

What SURVIVES as validated (not killed): (a) the mechanism — 10/10 proof
GREEN, verbs fire exactly as specified; (b) the condition's selectivity —
fires on weak unlockers, spares strong ones, on measured baseline actuals;
(c) the sense test — engage/disengage lines read as village decisions (see
below). The open question is purely outcome measurement, blocked on the
noise floor.

## Metric review

§14 honored: the guardrail breach is a NO-GO as pre-registered — no
re-score, no confirm spend. Doubts recorded here for the NEXT run, not this
one:
(1) The pre-registered GO assumed the r24 noise model ("identical-seed
before/after is necessary but not sufficient — budget for the noise
floor"). The det-test PROVED that model insufficient: same seed+policy
diverges within-process, with per-seed postU swings (~27d on s44) larger
than the 15d effect bar. Future wave-5 arms must EITHER fix the entropy
source (bisect: divergence onset ~day 112 / wave-5 unlock on s44 — a
tractable lead) OR pre-register a noise budget: e.g. a determinism gate
(same seed+policy twice in-process must be bit-identical before any
before/after comparison is trusted), the baseline's own
invocation-to-invocation spread as the minimum resolvable effect, and seed
counts from a power analysis rather than fixed 8/15.
(2) Mean post-unlock among unlockers is conditioned on unlocking — and the
layer (or noise) changes WHO unlocks (4 vs 2 here). On thin n the subset
matters more than the lever. A future metric should count unlocks as an
outcome and/or use all-seed post-unlock-day totals.
(3) The thin-n rule (<2 unlocks on BOTH sides → unmeasurable) was met
(4 and 2), but "measurable" by the letter still wasn't measurable in fact
— the rule needs the noise-budget companion from (1).

## Village assessment

What the villages looked like: two wave-5 windows, two different sieges.

**s55-armed** is the posture working as designed. Wave-5 unlocks d79; d80
Dieter Esposito dies in combat and the village mourns ("The village stops.
Somebody screams. Somebody else starts digging.") — and then the brace line
fires in-fiction: "Two scholars lost in a moon. The village braces — no
more ranging, no new courts. Home ground, full bellies, and the table."
The scholar stays home through three engage/disengage oscillations (74 of
101 post-unlock days); declines read as decisions ("No ranging while the
fifth wave is up. The village needs its scholar home." x3 on d80); traders
still walk IN (Wren of Thornfield: 2,669 kcal, "Heard your bins are
echoing"); the table arc completes (lesser seat); the village survives to
d180 with 11 successions absorbed. The posture did not turtle the village
into starvation — the pantry carried, the village lived around its
homebound scholar. Whether the layer CAUSED the survival is unmeasurable
(the trajectory is a noise draw), but the mechanism behaved exactly as
designed on a bleeding village.

**s22-armed** is the posture's boundary. The scholar was STARVING from the
window's first day (d57-61: "STARVING: health and energy falling. The
spiral has started."). Wave-5 unlocks d57 with 1 pre-unlock scholar death
(below threshold — correctly not engaged at latch). d62 the second scholar
death trips the condition; the posture engages into a death spiral it
cannot fix: d63 a CONTEST takes the scholar (contests grab you — no posture
helps), then combat deaths d65/d66/d69/d75, starvation deaths d75/d78. The
village was too far gone — the posture's help is bounded by the spiral's
cause, and starvation + contests are outside its reach. 20 engaged days,
216 declines across the two window runs, village lost d81.

Who thrived: villages that unlock wave-5 with a full pantry and no scholar
bleeding (s22-baseline: table, d180) — the condition correctly leaves them
alone. Who died: everyone the noise dealt a bad trajectory, posture or not.
What was missing: not a better condition — the condition discriminates —
but a measurement instrument that can see through the noise floor.

Blanks filled: none — the arm is killed. Blanks documented: (a) the
per-run nondeterminism with det-test + bisect evidence → sim-findings (this
blocks ALL future wave-5 outcome measurement, not just this arm);
(b) the s22 boundary — posture help is bounded by spiral cause (contest +
starvation deaths are outside its reach) — a design note for any revival.

## Sense test (SENSE-TESTING LAW)

Two window transcripts read (s22, s55 — the only armed unlocks). The
engage/disengage lines read as village decisions, not engine theater:
the s55 d80 brace follows a mourned death ("Somebody screams. Somebody
else starts digging") and the d80-81 declines interleave with living
village beats (traders, feasts, the table arc). The s22 transcript reads
as a tragedy the posture witnesses but cannot fix — starvation warnings
pre-date the engage, the contest death is explicitly unavoidable, and
nothing in the transcript suggests the homebound scholar caused the
starvation (the spiral started d57, engage ~d62). The sense test passes —
which is why the kill is purely measurement-driven: the posture is
coherent and its condition is selective; the pilot simply cannot resolve
its outcome effect through the noise floor.

