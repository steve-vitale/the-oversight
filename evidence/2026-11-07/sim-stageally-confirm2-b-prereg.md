# Stageally confirm re-run — companion-staging + rally on band 53001–53008, current master — PRE-REGISTRATION (arm sim-stageally-confirm2-b)

Run: fleshout-loop-b-20261107T0420Z (Loop B, re-run duty). Axis: scale-onramp /
winnability chain (wild ally-join → wave-4 kills → veterans → readiness-5
release → wave-5 facing → full seat). Committed BEFORE any judged sim.
Measurement only: re-run of Loop A's landed policy, zero edits to the policy,
zero src/js, no gate/price/deed/readyDemand change. If this re-run GOes, the
confirm-b NO-GO does not survive current master; if NO-GO again, the NO-GO
is confirmed on the same band and the lever returns to the loop as
unconfirmed.

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/MONSTER-WAVES.md` §§Wave 4/5: wave 5
  demands 2 LIVING villagers with wave-4+ kills. Wave-4 bands: damage 35–95,
  HP 850–1500, pierce 0.2–0.5. No canon invented here.
- `docs/PARTY.md`: parties are a System unlock (day 7); "Party + followers
  are placed near you on every node travel"; "Party members auto-join
  fights even beyond the normal 4-square radius"; "You ask people. Like a
  person." — the invite lives in conversation, not on a button. Cap 3 at
  unlock, 4 at day 14, 5 at day 30. Acceptance base 35 + trust×0.4,
  modified by temperament, goal, mood (the shared character decision
  `npcInviteDecision`, tackle-invite 2026-10-27: clamped 5–95, never
  always/never). Backstabbers always accept — a designed plot trap.
- "Monster encounters are fought, not rolled" (CANON.md): the lever changes
  HOW the scholar fights a wave-4 beast (with company, rallied), never
  whether the fight is rolled.

## Prior evidence read (not re-run, not re-proved)

- `evidence/2026-11-06/sim-stageally-confirm-b.md` (+ prereg
  `sim-stageally-confirm-b-prereg.md`, committed 2ff11cbf): NO-GO on band
  53001–53008 — armed living-pair seeds 0/8, post-first-blood wave-4 kills
  1 vs bar 3; baseline 4; guard held +3.5d; THIN checks clear (rally fires
  27, ally presence 73%). Corpus
  `evidence/2026-11-06/perseed-stageally-confirm-b/` (16 files). The bar
  below is IDENTICAL to that prereg's bar — frozen, not re-cut.
- `evidence/2026-11-06/sim-stageally-a.md` (+ prereg): pilot GO by BOTH
  routes — living pair on 1 seed (55007, 20 days) AND post-first-blood
  kills 5 ≥ 3; ally presence 27.5% → 69.2%; wave-4 kills 2 → 8; guard
  holds (armed median 109d vs baseline 92.5d). The whole GO rests on one
  seed (55007).
- `evidence/2026-11-07/sim-trajfrag-b.md` + `evidence/2026-11-07/sim-winnability-round-0230.md`
  (Loop B run 0230Z): WHY THIS RE-RUN EXISTS. Unperturbed 53006 staged on
  current master has 11 wave-4 kills, standing 440, wave 5 unlocked, 2
  living veterans at horizon — a living pair exists where the confirm found
  0/8. The NO-GO may not survive current master. ALSO: trajfrag-b measured
  this band trajectory-fragile — one extra Math.random() draw at day 0
  flips the verdict on 3 of 4 seeds — so a flipped verdict here needs
  attribution (master movement vs trajectory fragility), not just a new
  number. That attribution is the new trajectory-distance secondary below.
- `evidence/2026-11-06/sim-bankkiller-b.md`: rally THIN, not dead — rally
  fires 7/7 when an ally is present, allies beside the scholar in only
  28% of wave-4 TB fights. Stageally is the redesign that manufactures
  the chance.

## The lever under confirm (unchanged — read, not rebuilt)

Policy: `scripts/policies/competent-stageally-a.js` (landed `ab0586860`) —
the bankkiller rally policy (fight hook, trigger UNCHANGED) plus a daily
staging hook and a pending recorder. All other hooks are the base competent
policy's object, unchanged. **Do NOT modify the policy.** This is a
measurement confirm.

- STAGING GATE (frozen from the pilot): staging runs only when the party
  system is unlocked (`Game.partyUnlocked()`) AND (raw village standing
  ≥ 75 OR `unlockedWave() >= 4`). Target 2 party members. One invite
  attempt per day, at Haven, in conversation (answer-then-ask conduct),
  7-day re-ask block on refusal.
- RALLY (frozen, bankkiller verbatim): on the scholar's FIRST turn of a TB
  fight, when the fight contains a LIVE wave-4+ monster AND ≥ 1 living
  ally fighter, and the rally has not yet been used in this fight: call
  `Game.tbPlayerRally()` once. False falls through to `competent.fight`.
- PENDING HOOK (record-only): never delays, declines, or moves the scholar.
- Instrument: `scripts/stageally-instrument-20261106.js`. Driver:
  `scripts/stageally-driver-20261106.js`. Analyzer:
  `scripts/stageally-analyze-20261106.js`. Proof:
  `scripts/test-stageally-20261106.js` (45/45 on the merged tip). Same
  harness/instrument/analyzer as the pilot and the confirm; the driver is
  parameterized by SEEDS / OUTDIR only — no new copy of the analyzer is
  written, no frozen metric changes. NEW this run: trajectory-distance
  measurement `scripts/stageally-trajdist-20261107.js` (+ proof
  `scripts/test-stageally-trajdist-20261107.js`), a pure function over
  corpus JSON, no game reads, no re-scoring.

## Question

Does the stageally NO-GO reproduce on the same band on current master —
or does the 53006 living pair found by the 0230Z run flip the verdict,
and if it flips, is the flip master movement or trajectory fragility?

## Design (staged per docs/MEASUREMENT.md §§9–12, 14–15)

- Band 53001–53008 DELIBERATELY REUSED (see reuse record below — this is
  a re-run on current master, not a fresh band). Competent policy verbatim
  for the baseline, 150d death-aware horizon (dead villages stop
  simulating, +10d tail max via runDays).
- Stage 0 smoke (2–3 seeds, 53001–53002 staged, 60d, to /tmp, NOT judged):
  staging fires on current master — invites attempted, accepts recorded,
  rally events, party days. If the smoke fails on this band, re-baseline
  the same way the 0615Z coordinator did (seed 55002/60d) and say so,
  assertions unchanged.
- Baseline: POLICY=baseline on 53001–53008. Armed: POLICY=staged on the
  SAME seeds (identical seeds, policy-side only). Corpus:
  `evidence/2026-11-07/perseed-stageally-confirm2-b/` (16 files, 8 baseline
  + 8 staged), OUTDIR-parameterized — the confirm corpus
  (`perseed-stageally-confirm-b/`) and the pilot corpus
  (`perseed-stageally-a/`) are untouched.
- Pooled headline (pilot 55001–55008 + confirm 53001–53008 + this re-run
  53001–53008, n=24): wave-4 kills, living-pair seeds, post-first-blood
  kills, ally presence, median survivals — reported alongside the band
  verdict, never substituted for it. The verdict below is judged on THIS
  re-run band alone (8+8).

## Primary metric (binding — SAME bar as the confirm-b prereg, judge only against this)

GO iff the armed leg banks a living pair — at least 1 day with 2 living
wave-4 killers (daily engine snapshot day with readiness5.veterans ≥ 2,
the killerdeath primary; reconstructed maxSimultaneous ≥ 2 is the
cross-check) — on at least 1 seed, OR post-first-blood wave-4 kills are
at least 3 on the armed leg. NO-GO otherwise. Confirm 8 seeds on the
REUSED band, same design, ONLY on pilot GO (which holds).

GUARDRAIL (binds the verdict — a failed guard is NO-GO even if the
primary holds):
- G-survival: armed median survival ≥ baseline median survival − 10d.

DENOMINATOR GUARDS (THIN, bankkiller precedent — the THIN check runs
BEFORE the GO/NO-GO bar):
- T1 rally fires < 8 across the armed leg → THIN (the rally half is
  unmeasured — the confirm cannot judge the lever; NOT a NO-GO; the next
  run re-designs the trigger).
- T2 allies present in < 40% of armed-leg wave-4+ TB fights, when the
  armed leg has ≥ 10 such fights → THIN (the staging half is unmeasured:
  baseline presence is 28% (7/25); if staging cannot lift it past 40%,
  the lever never engaged and the rally denominator is still thin).
  With < 10 armed-leg wave-4+ TB fights T2 is vacuous (stated, not
  hidden) and T1 governs.

## Secondary (reported, never re-scored)

- Ally presence: share of wave-4+ TB fights with ≥ 1 ally in the fight
  at entry, both legs (instrument fight-level rows).
- Party formation: days with ≥ 1 / ≥ 2 party members (daily snapshots),
  invites attempted / accepted / declined / not-offered, party size at
  each wave-4+ pending (staged share).
- Living-pair days: snapshot days with readiness5.veterans ≥ 2, and
  reconstructed maxSimultaneous ≥ 2 (cross-check, killerdeath shape).
- First-killer survival: median kill→death days (observed exits only),
  both legs.
- Post-first-blood kill rate: wave-4 kills in fights after first blood /
  post-first-blood wave-4 fights (secondkiller shape).
- TB survival per wave-4+ TB fight (FIGHT-LEVEL via the tbEnd wrap).
- Wave-4 kill rate (kills / wild wave-4 fights), both legs — descriptive
  only; the survival guard, not the kill rate, binds the trade.
- Wall numbers every run: wins, national/global, table, wave 4–5 unlocks,
  wave 4–5 faced, wave-4 kills, wave-5 kills, readiness-5-ready days,
  median survival.
- Per-killer trajectories for the closest seed. Closest seed = highest
  maxSimultaneous, tie-broken by longest killer survival (alive at end
  beats any death span; else max kill-to-death days).
- Killer channel mix (player vs NPC via kill-time scholar capture).
- Pooled headline (pilot + confirm + this re-run, n=24): wave-4 kills,
  living-pair seeds, post-first-blood kills, ally presence, median
  survivals — reported alongside the band verdict, never in place of it.

## NEW secondary — trajectory distance (blank 2 from the 0230Z list)

Purpose: attribute a flipped verdict to master movement vs trajectory
fragility. Reported, never re-scored against the primary.

Definition (`scripts/stageally-trajdist-20261107.js`, pure function over
corpus JSON):
- Per-seed distance between two legs of the SAME seed (baseline vs
  staged, this run; and same-policy across corpora, this run vs the
  confirm-b corpus): D = |Δ wave-4 kills| + |Δ standing|/100 +
  |Δ maxWave| + |Δ survival days|/150 + (pair formed on exactly one of
  the two legs ? 1 : 0). Components are reported alongside the composite;
  the composite is a summary, not a threshold — no GO/NO-GO line is drawn
  on it in this prereg.
- Reported tables: (a) per-seed baseline↔staged distance within this
  re-run; (b) per-seed, same-policy distance between this re-run and the
  confirm-b corpus (baseline↔baseline, staged↔staged) — the master-movement
  read; (c) the 0230Z trajfrag unperturbed legs are cited as the
  fragility reference (one-draw displacement flips 3/4 seeds), not
  re-measured here.
- Attribution rule (stated now, applied at verdict time): if the verdict
  flips AND the same-policy distance (b) is large on the flipping seed(s)
  while the within-run distance (a) is small, the flip reads as master
  movement; if (b) is small and the flipping seed's outcome differs from
  the confirm corpus on the same policy, the flip reads as trajectory
  fragility (same code, different draw order — the trajfrag shape). If
  neither reads cleanly, say so — do not force the attribution.

## Band-reuse record (per local_seed_band_freshness skill — reuse, NOT fresh)

Band 53001–53008 is DELIBERATELY REUSED. No seed-freshness check as if it
were fresh is run, because the whole point of this arm is to re-measure
the SAME seeds on current master and compare against the confirm-b corpus
on identical seeds. The reuse reason: the 0230Z run found unperturbed
53006 staged on current master with 11 wave-4 kills, standing 440, wave 5
unlocked, 2 living veterans — a living pair where the confirm found 0/8 —
and the question is whether the NO-GO survives current master. A fresh
band could not answer that question. Recorded prior uses of this band:
confirm-b prereg + evidence (2026-11-06), trajfrag-b prereg + evidence
(2026-11-07, 4-seed subset 53001/53002/53004/53006/53008 legs), arena-b
(2026-11-07, 53006 baseline replay). No other band is used.

## Metric review (per §14; filled at verdict time, not now)

- Whether the living-pair primary (≥ 1 pair day) vs the post-first-blood
  alternative (≥ 3 kills) is the right GO shape for a re-run, and whether
  a re-run GO on post-blood kills without a pair day should still count
  the lever confirmed.
- Whether the staging gate (standing ≥ 75) vs an unlock-only gate changes
  exposure on this band, for the next run.
- Whether the T2 40% presence line was the right power line for staging.
- Whether the party's wave 1–3 effect (it travels everywhere, not just to
  wave-4 fights) confounds the survival guard, and whether the guard's
  10d window is the right width.
- Whether the pooled n=24 headline (pilot + confirm + re-run) or the band
  verdict (8+8) should govern the next loop decision when they disagree.
- NEW: whether the trajectory-distance composite (kills + standing/100 +
  maxWave + days/150 + pair-flip) is the right attribution shape, or
  whether a component (e.g. kills alone) carries the signal and the
  composite hides it.

## Balanced panel (§15)

Attempted, outcome recorded honestly: there is no Game-root change to
compare — baseline vs armed differ ONLY in the policy (competent verbatim
vs competent + staging + rally wrapper) on identical seeds with an
identical instrument. That policy A/B is the comparison.
`scripts/balance-panel.js` takes no corpus input (confirm-b: `--help`
errors "Error: --out <panel-directory> required"); it will be attempted
and the refusal recorded, not fabricated into a compare `.md`. If the tool
refuses (the policy-vs-policy shape), the matched-seed paired comparison
per the awayeve/linkseek precedent is used instead and the record
attached.

## Telemetry deviation check

Attempted at verdict time; the tool has refused recorder corpora on every
prior killer-chain arm — the refusal, if it recurs, is the result. The
WINSEAT baseline's own regime note forbids pre-seat comparisons — check
it first.

## Sense-testing law

Read transcripts/dialogue for at least one armed-leg wave-4 fight and one
party invite (fightLines/deathSays + invite lines in the corpus): judge
meaning, coherence, consequences — never just counts. In particular: does
the invite read as a person asking another person to come along, does the
rally line read as a person calling their line together, and do rallied
allies' deaths read as a line holding, not as bookkeeping? On 53006 in
particular: read the pair-formation days and the wave-5 unlock, and judge
whether the village's climb reads as earned.

## Proof (re-run, not rewritten)

`scripts/test-stageally-20261106.js` — 45/45 on the merged tip (confirm-b
re-verification). Re-run green on this worktree before the judged run; if
the smoke needs re-baselining, that is a proof edit with its own commit
and the reason stated, assertions unchanged. The proof's live legs write
to /tmp only, never into evidence/.
`scripts/test-stageally-trajdist-20261107.js` — NEW proof for the
trajectory-distance measurement (fixture rows, known distances); must be
green before the judged run.

## What this arm is NOT claiming

- It does not claim rally wins fights — the guard, not the rally, judges
  the trade.
- It does not claim the pair: the primary is a living-pair day OR
  post-first-blood production; a re-run GO earns trust in the pilot GO,
  not a "pair solved" headline.
- It does not claim field fights move: the policy cannot touch them; they
  are the control channel.
- It does not claim the wait-at-the-door: no engine verb declines a
  pending wanderer, so no such claim is made (see NO WAIT in the pilot
  prereg).
- It does not claim the party is free: party members eat, drink, and can
  die on the road — the survival guard prices that, it is not assumed away.
- It does not re-judge the pilot or the confirm: the pilot verdict stands
  as measured on its base (55001–55008, GO by both routes); the confirm
  verdict stands as measured on its base (53001–53008, NO-GO). This
  re-run judges the lever on the same band on current master.
- It does not claim a flipped verdict is explained by the distance
  composite alone: the composite is a summary for attribution, and the
  verdict rule above is applied honestly, including "neither reads
  cleanly".
