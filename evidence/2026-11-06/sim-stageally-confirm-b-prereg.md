# Stageally confirm — companion-staging + rally, fresh band — PRE-REGISTRATION (arm sim-stageally-confirm-b)

Run: fleshout-loop-b-20261106T0930Z (Loop B, confirm duty). Axis: scale-onramp /
winnability chain (wild ally-join → wave-4 kills → veterans → readiness-5
release → wave-5 facing → full seat). Committed BEFORE any judged sim.
Measurement only: re-run of Loop A's landed policy, zero edits to the policy,
zero src/js, no gate/price/deed/readyDemand change. If this confirm GOes, the
stageally GO stands on two bands (n=16 pooled); if NO-GO, the GO is
band-fragile and the lever returns to the loop as unconfirmed.

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

- `evidence/2026-11-06/sim-stageally-a.md` (+ prereg): pilot GO by BOTH
  routes — living pair on 1 seed (55007, 20 days) AND post-first-blood
  kills 5 ≥ 3; ally presence 27.5% → 69.2%; wave-4 kills 2 → 8; guard
  holds (armed median 109d vs baseline 92.5d). **The whole GO rests on one
  seed (55007)** — the other seven seeds produced 2 kills between them and
  no pair; 55005/55006 went backwards on kills vs baseline. Read as "the
  lever works when it catches", not "the lever works everywhere".
- `evidence/2026-11-06/sim-winnability-round-0615.md` (coordinator
  re-verification note): the GO's pair route did NOT reproduce on the
  merged tip — the coordinator's 8 staged legs re-run on current master
  (invites 28, accepted 14, rally fires 25, w4 kills 5 across 66 fights)
  formed NO living pair; 55007 killed 1, not 6. The proof's live-invite
  smoke failed on the rebase (seed 55001's trajectory stalls below the
  standing-75 gate on current master, 0 invites, deterministic); the
  coordinator re-baselined the smoke to seed 55002/60d (gate day 38,
  verified invites 4 / accepted 3 / partyDays 45 before editing;
  assertions unchanged) and the proof is 45/45 green on the merged tip
  (`ab0586860`). The GO verdict stands as measured on its base; the pair
  is unconfirmed on current master. That is why this confirm exists.
- `evidence/2026-11-05/sim-bankkiller-b.md`: rally THIN, not dead — rally
  fires 7/7 when an ally is present, allies beside the scholar in only
  28% of wave-4 TB fights. Stageally is the redesign that manufactures
  the chance.
- `evidence/2026-11-06/sim-winnability-round-0730.md`: the 0730Z run
  records this confirm as owed ("Confirm stageally on the reserved fresh
  band 53001–53008 before anyone leans on the GO") and reserves the band
  for it.

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
  harness/instrument/analyzer as the pilot; the driver is parameterized
  by SEEDS / OUTDIR only — no new copy of the analyzer is written, no
  frozen metric changes.

## Question

Does the stageally GO reproduce on a fresh band on current master — does
the armed leg bank a living pair, or produce ≥ 3 post-first-blood wave-4
kills, when the pilot's one-seed carrier (55007) is out of the picture?

## Design (staged per docs/MEASUREMENT.md §§9–12, 14–15)

- Fresh band 53001–53008 (see seed-freshness record below), competent
  policy verbatim for the baseline, 150d death-aware horizon (dead
  villages stop simulating, +10d tail max via runDays).
- Stage 0 smoke (2–3 seeds, 53001–53002 staged, 60d, to /tmp, NOT judged):
  staging fires on current master — invites attempted, accepts recorded,
  rally events, party days. The 0615Z coordinator re-baselined the proof's
  live-invite smoke to seed 55002/60d after 55001 stalled below the
  standing-75 gate; if the smoke fails on the new band, re-baseline the
  same way and say so, assertions unchanged.
- Baseline: POLICY=baseline on 53001–53008. Armed: POLICY=staged on the
  SAME seeds (identical seeds, policy-side only). Corpus:
  `evidence/2026-11-06/perseed-stageally-confirm-b/` (16 files, 8 baseline
  + 8 staged), OUTDIR-parameterized — the pilot corpus
  (`perseed-stageally-a/`) is untouched.
- Pooled with the 0615Z pilot (8+8), n=16 meets the confirm standard in
  aggregate — cite pooled n for the headline. The verdict below is judged
  on THIS band alone (8+8); the pooled numbers are reported alongside,
  never substituted for the band verdict.

## Primary metric (binding — SAME bar as the 0615Z prereg, judge only against this)

GO iff the armed leg banks a living pair — at least 1 day with 2 living
wave-4 killers (daily engine snapshot day with readiness5.veterans ≥ 2,
the killerdeath primary; reconstructed maxSimultaneous ≥ 2 is the
cross-check) — on at least 1 seed, OR post-first-blood wave-4 kills are
at least 3 on the armed leg. NO-GO otherwise. Confirm 8 seeds on a FRESH
band, same design, ONLY on pilot GO (which holds).

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
- Pooled headline (pilot 55001–55008 + confirm 53001–53008, n=16):
  wave-4 kills, living-pair seeds, post-first-blood kills, ally presence,
  median survivals — reported alongside the band verdict, never in place
  of it.

## Seed-freshness record (per local_seed_band_freshness skill)

Chosen band: 53001–53008, reserved by the 0615Z run for this confirm.
Whole-token grep of every candidate seed across ALL dated preregs
(`evidence/*/sim-*-prereg.md`) plus the evidence `.md` files, before this
prereg was written, re-verified by this worker (not taken on the
coordinator's word):
- 53001–53008: 0 hits each in ALL preregs. FRESH.
- Evidence `.md` hits: only the range endpoints — 53001 and 53008 each
  appear in exactly 2 files, `evidence/2026-11-06/sim-winnability-round-0615.md`
  and `evidence/2026-11-06/sim-winnability-round-0730.md`, both as the
  reservation statements for this confirm ("extension band 53001–53008
  reserved for this run's confirms"; "Confirm stageally on the reserved
  fresh band 53001–53008"). 53002–53007: 0 hits in any evidence `.md`.
  No judged use anywhere. FRESH.
- Hidden-files tree (`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/`):
  whole-token hits are only non-seed data values in old JSON corpora,
  verified by context: `pantryFreshAfter: 53004` / `pantryFreshBefore:
  53004` (crumbdefault census, 2026-10-16), a pantry-series value `53002`
  (spiralgate, 2026-10-17), a `"kcal": 53001` value (journey-crisis r111
  panel, 2026-11-02), and the 0615Z coordinator's own claim file naming
  the band as this run's assignment. Same class as the pilot prereg's
  pantry-kcal figures (`pantryFreshAfter: 55002`, `pantryKcalAtShare:
  55001`). No prior prereg, forbidden-band list, or seed-use names
  53001–53008. FRESH.
- No dedicated forbidden/contaminated band-list file exists in
  hidden_files; preregs naming "forbidden" are the Oct 26–27 era (other
  bands). Nov 4–6 preregs name no 53xxx band.
- The panel-case float substring noted by the coordinator
  (`24910.530018311005`) is a float, not a whole-token seed hit — same
  class as the pilot's `2.3615395500212255`.

## Metric review (per §14; filled at verdict time, not now)

- Whether the living-pair primary (≥ 1 pair day) vs the post-first-blood
  alternative (≥ 3 kills) is the right GO shape for a confirm, and whether
  a confirm GO on post-blood kills without a pair day should still count
  the lever confirmed.
- Whether the staging gate (standing ≥ 75) vs an unlock-only gate changes
  exposure on this band, for the next run.
- Whether the T2 40% presence line was the right power line for staging.
- Whether the party's wave 1–3 effect (it travels everywhere, not just to
  wave-4 fights) confounds the survival guard, and whether the guard's
  10d window is the right width.
- Whether the pooled n=16 headline (pilot + confirm) or the band verdict
  (8+8) should govern the next loop decision when they disagree.

## Balanced panel (§15)

Attempted, outcome recorded honestly: there is no Game-root change to
compare — baseline vs armed differ ONLY in the policy (competent verbatim
vs competent + staging + rally wrapper) on identical seeds with an
identical instrument. That policy A/B is the comparison.
`scripts/balance-panel.js` takes no corpus input (pilot: `--help` errors
"Error: --out <panel-directory> required"); it will be attempted and the
refusal recorded, not fabricated into a compare `.md`. If the tool refuses
(the policy-vs-policy shape), the matched-seed paired comparison per the
awayeve/linkseek precedent is used instead and the record attached.

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
allies' deaths read as a line holding, not as bookkeeping?

## Proof (re-run, not rewritten)

`scripts/test-stageally-20261106.js` — 45/45 on the merged tip (coordinator
re-verification, 0615Z closeout). Re-run green on this worktree before the
judged run; if the smoke needs re-baselining, that is a proof edit with
its own commit and the reason stated, assertions unchanged. The proof's
live legs write to /tmp only, never into evidence/.

## What this arm is NOT claiming

- It does not claim rally wins fights — the guard, not the rally, judges
  the trade.
- It does not claim the pair: the primary is a living-pair day OR
  post-first-blood production; a confirm GO earns trust in the pilot GO,
  not a "pair solved" headline.
- It does not claim field fights move: the policy cannot touch them; they
  are the control channel.
- It does not claim the wait-at-the-door: no engine verb declines a
  pending wanderer, so no such claim is made (see NO WAIT in the pilot
  prereg).
- It does not claim the party is free: party members eat, drink, and can
  die on the road — the survival guard prices that, it is not assumed away.
- It does not re-judge the pilot: the pilot verdict stands as measured on
  its base; this confirm judges the lever on a fresh band on current
  master.
