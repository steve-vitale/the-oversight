# sim-haventick-b — PREREG (binding)

Run: fleshout-20261116T1315Z (Loop A), axis winnability chain, arm
sim-haventick-b — DIAG: the havenTick plan-creation path counted per
instance and per launch, the same way seedpaths counted the four seed
paths (tracker blank #4 DIAG). Branch `sim-haventick-b` (worktree
`~/workspace/worktrees/sim-haventick-b`). Base: master `5eedd695b` at
arm start (the worktree HEAD; the coordinator rebases at landing and
re-runs proofs).
Binding prereg: THIS file — frozen before any judged sim. The
instrument (driver, analyzer, proof test) is built AFTER this commit;
no judged numbers exist yet. Commit this file FIRST
(`scripts/safe-commit.sh "sim-haventick-b: frozen prereg — ..."`),
then build.

## The question, in plain words

Seedpaths counted four plan-creation paths and found the seed call
owns 27 of 28 plan instances — but the winPlanHavenTick path (a ranger
at Haven starts a win-plan without any seed call) was never counted
the same way, so the "seed fires" picture is incomplete until
havenTick is counted per instance too. Seed 102131 proves plans exist
that no seed path ever fires for: on both seedpaths legs it carries a
plan (holder `gen_e9nw4vr`, target null, stage party, 99 score rows on
the control leg, all `party_wait`) with ZERO seed rows. This DIAG
counts havenTick-created plans per instance and per launch, on a fresh
band, alongside the four seedpaths paths — and says whether havenTick
alone ever launches a party that kills.

## Prior art (read first)

- `evidence/2026-11-16/sim-seedpaths-b.md` + prereg — the instrument
  this arm EXTENDS (extend `scripts/seedpaths-driver-20261116.js`,
  `scripts/analyze-seedpaths-b.js`, `scripts/test-seedpaths-b.js`;
  don't rebuild). Its §Next diagnostic #1 names this arm ("HavenTick
  plan-creation, counted the same way"), and its "fifth plan-creation
  path" section (incl. the winPlanHavenTick discussion) is the design
  input: havenTick plans never open a dawnbid instance by definition
  (instances open only on seed rows), so they are outside the
  four-path frame, not a missed wrap. This arm closes that gap by
  counting plan CREATION, not seed rows.
- `evidence/2026-11-16/sim-poolmarginals-b.md` + prereg — the driver
  family origin; the vetparty seed-call text (13-line block) is
  preserved verbatim in the poolmarginals prereg §Design decision 1
  (blob `a66d45a5e`, removed by `7ba893b4b`).
- `evidence/2026-11-16/sim-companionpool-b.md`;
  `evidence/2026-11-16/sim-launchdef-a.md` (gate-avoid seed path).
- `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md` (wave 4 "The
  Mirror Draft"; the doc lists 9 wave-4 ids, the data has 10 and the
  data rules — seedpaths established this), `docs/PARTY.md`.
- CANON GAP (recorded, not invented): no CANON-registered doc covers
  companion-pool seed paths, departure gates, or the pick lottery
  (checked 2026-11-16 by seedpaths against the `docs/CANON.md`
  manifest). The same gap covers havenTick plan creation. The evidence
  file states this gap instead of inventing canon.

## Design — the creation ledger (frozen)

The driver wraps the THREE plan-creation sites in the code (verified
in this tree; the only three assignments to `v.winPlan[vid]`):

1. **winPlanHavenTick** — `src/js/win-plan.js:282`, called from
   `src/js/villager-agency.js:433`. Creates a plan (stage `gear`,
   target null) for a wanderer/explorer at Haven who has personally
   fought a beast (`lived`) or whose village has slain one (`heard`).
   Only when no plan exists.
2. **winPlanSeedFromFight** — `src/js/win-plan.js:225`, called from
   the four seed sites seedpaths located (world-tick
   `src/js/game.js` `resolveWildMonsterEncounter`; agency evade/flee
   `src/js/villager-agency.js` `expeditionMonster`; gate avoid
   `src/js/win-plan.js:512` `winPlanFightGate`). Creates a plan
   (stage `gear`/`party`, target = the beast) when no plan exists, or
   retargets/refreshes an existing one.
3. **winPlanOf** — `src/js/win-plan.js:215`, called from the launch
   paths (`src/js/win-plan.js:438` `winPlanDepart` launchParty, and
   `src/js/villager-brain.js:1025,1046,1048` the dawn-commit executor).
   Creates a plan (stage `gear`, target null) when no plan exists —
   in practice the COMPANION's plan on a launch (the companion gets
   stage `hunt`, party `[inviter]`, and target copied from the
   inviter's plan by `winPlanDepart`, or left null by the brain
   executor). A sixth creator, recorded explicitly — NOT a fifth
   path, NOT unknown. If it is zero it stays a zero row; if it is
   material the evidence says so.

The driver records every creation in ONE ledger array, `v4creates`
(row: day, vid, creator, source, profile, stageAfter, target,
needWave, caller frame):

- creator `havenTick` — the havenTick wrap observed the plan absent
  before the call and present after. source `lived` (agency
  `know[vid].fought` non-empty), `heard` (villageSlain non-empty),
  `both`, or explicit `unknown-haventick-no-engagement` (never
  expected: havenTick's own creation branch requires engagement).
- creator = one of the four seed paths — the seed wrap observed the
  plan absent before the call and present after; creator classified
  by the seedpaths outcome+stack rule. The `v4seeds` rows (all seed
  firings, creations and refreshes alike) additionally carry
  `planExistedBefore` so the analyzer can tell a creation from a
  refresh without re-reading state.
- creator `winPlanOf` — the winPlanOf wrap observed the plan absent
  before the call and present after, with the caller frame recorded
  (expected callers: `winPlanDepart` launchParty, brain executor).

The driver ALSO keeps every seedpaths wrap unchanged (v4seeds with
path + caller, v4departs, v4gates, v4encounters, dawnbid scores /
departs / census / starts, companionPool) and adds `planCensus`: an
end-of-day snapshot of EVERY winPlan holder (vid, target, needWave,
stage, party, holderAlive, holderNode, holderExped, holderSick,
holderHealth, holderGear) — the independent denominator for the
attribution check and the churn detector for target-null episodes.

## Instance definition — creation frame (frozen)

An EPISODE is one continuous plan lifetime for one holder. It opens
on a `v4creates` row, with these gates (mirroring classifySeed):

- havenTick and winPlanOf creations ALWAYS open an episode (target
  null or copied).
- A wave-4 seed creation opens an episode iff stageAfter is `gear`
  or `party` (same gate as classifySeed).
- A wave-3 seed creation opens NO episode (same rule as classifySeed:
  wave-3 never opens) — it is counted in a side table (wave-3 plan
  creations by creator) and the plan it creates is visible to the
  retarget rule below.

An episode CLOSES on, first match wins:

- **retargeted** — a later seed row (wave >= 4) for the same vid with
  a different target (the seed row opens a new episode attributed to
  its path; the old episode's closeDay is the seed day).
- **retargeted-w3** — a later seed row (wave 3) for the same vid with
  a different target (closes the episode, opens nothing).
- **holder-died** — planCensus first shows the holder dead.
- **plan-deleted** — the plan leaves winPlan after the last census
  day (same rule as classifySeed).
- Still open at end of run: closeDay null.

Episode target: the target observed in the first planCensus row for
the holder on/after the creation day (falling back to the creation
row's target). Within an episode the target is constant — only a seed
row sets a holder's own plan target, and a seed row with a different
target closes the episode — so score/census rows match an episode iff
vid matches AND plan.target == episode target AND day >= openDay AND
(closeDay == null OR day <= closeDay). Same-target seed rows are
refreshes (listed in the episode's firings, never a new episode).

Attribution rule (frozen): FIRST-CREATOR WINS for the headline
count — the episode's creator is the path that created the plan. All
seed firings while the episode is live are listed in the row so a
later reader can re-count under any rule.

## Bucket taxonomy (frozen — same as dawnbid)

Same buckets, same precedence (first match wins): launched >
target-killed > selected-blocked > bid-not-selected >
plan-churned-before-dawn > candidate-not-bid > unknown. Per-episode
evidence is computed exactly as classifySeed computes it (scored
dawns from dawnbidScores part-0 rows, bids from `party_launch`
candidates, selections from dawn commits, resolution from
dawnbidDeparts, target-killed from the final waveKillLog, churn from
closeDay/closeKind vs first scored dawn). Two structural notes:

- **target-killed is N/A for target-null episodes** (havenTick and
  most winPlanOf): with no target there is nothing to kill. It is
  recorded as null, never counted, and the bucket can never fire for
  them — stated in the evidence, not hidden.
- **Launch-that-kills (the second headline question):** for every
  launched havenTick episode, the analyzer checks the final
  waveKillLog for kills by the holder OR any party member (resolved
  launch companion + v4departs party) of wave >= 3 beasts on/after
  the launch day, reported separately for wave >= 4. Same check for
  launched winPlanOf episodes, reported alongside.

## Comparison frames (frozen)

- **Seedpaths frame:** the unmodified `classifySeedPaths` runs on the
  same corpora, so the four-path first-seeder table is comparable to
  seedpaths' 28 instances / 7 launches. Any difference between the
  seedpaths-frame instance count and the creation-frame seed-episode
  count is exactly the handoff count (havenTick/winPlanOf episodes
  closed by seeding) — listed per seed, never silently reconciled.
- **Five-path headline table:** episodes by first-creator
  (world-tick / agency-evade / agency-flee / gate-avoid / havenTick),
  instances and launches separately, with winPlanOf as an explicit
  sixth row. havenTick share is reported against ALL episodes and
  against launches.

## Primary metric + GO bar (frozen)

Primary metric: **share of plan instances (episodes) attributed to a
named creation path**, reported separately per leg, with the
first-creator distribution table (counts + shares per path,
instances and launches separately) and the havenTick launch/kill
answer.

GO (instrument validity) iff ALL hold:

1. **Zero unclassified instances on EACH leg** — every episode's
   creator is one of the six named creators; every episode without a
   named creator carries an explicit reason in the row (never a bare
   `unknown`); zero `unknown-*` havenTick sources; zero `unknown-*`
   seed paths on v4seeds rows.
2. **Creation-ledger check (independent denominator):** every
   planCensus holder-day traces to a `v4creates` row on/before its
   first observed day — i.e. no plan holder is ever observed without
   a recorded creation. Any holder without one is listed as an
   unattributed episode and fails the bar.
3. **Corpus 16/16 files parse** (8 control + 8 instrument legs, one
   file per seed per leg).
4. **Proof green**: `scripts/test-haventick-b.js` — static/judge/
   recorder green + determinism D1 (recorder ON twice, identical
   trajectories) + D2 (recorder ON vs OFF, identical trajectories) on
   the instrument tip (seed 102141, 60d), and green again in the off
   shape after the revert (same shape as seedpaths' 60/60).
5. **Wall numbers reported** for both legs (national by standing
   >=200 AND by scaleRank, table, wins, wave 4/5 unlocked, median
   survival, wave-4 kills, deaths).
6. **Frames reconciled:** seedpaths-frame vs creation-frame instance
   counts reported with the handoff count; any unexplained difference
   fails the bar.

The VERDICT is the distribution table itself plus the launch/kill
answer: what share of plans havenTick creates, and whether havenTick
alone ever launches a party that kills. A DIAG GO means the
instrument is valid and the table is trustworthy — not that any path
"wins".

## Seed bands (fresh — verified, not reused)

- Band: **102141–102148** (8 seeds), control leg first (master
  as-is, seed call absent), then instrument leg (seed call + recorder),
  identical seeds, same policy/horizon.
- FRESH: `grep -rl "102141" evidence/*/sim-*-prereg.md` returns
  nothing (verified 2026-11-16 in the worktree; no prereg names any
  seed in this band), and the band is in no earlier arm's forbidden
  list. This is a fresh screening band; the comparison to seedpaths'
  band (102131–102138) is a cross-band comparison, not a same-corpus
  claim — stated in the evidence.
- NEVER 100621–100636, 100861–100868, 100821–100828, 100721–100728,
  100761–100768, 10100–10139, 190391–190398, 190621–190628,
  190631–190638, 190541–190548, 190561–190568 (the poolmarginals
  forbidden list, carried over). Sibling Loop B works band
  102201–102208 — do NOT touch its trees, claims, or band.

## Horizon, policy, death-awareness, legs

- Horizon 150 days, death-aware (dead villages stop simulating),
  policy **competent verbatim** (`scripts/policies/competent.js` —
  sha `74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456`,
  verified in the worktree before this commit).
- Control anchor = the instrument commit (driver + analyzer + proof
  test, seed call ABSENT); instrument anchor = the seed-call commit
  (instrument + the 13-line seed call re-landed verbatim from the
  poolmarginals prereg §Design decision 1, blob `a66d45a5e`).
  Both SHAs are recorded in the evidence file. The judged comparison
  is control (master as-is) vs instrument (seed call on). After
  measurement the seed call is REVERTED on the branch; the branch's
  `src/` is byte-identical to the control anchor. The primary leg is
  the control leg (master as-is); the instrument leg is secondary
  only — it exists so the instrument counts havenTick on a seed-on
  leg too, and so the frames can be reconciled there.
- ZERO src/js game-code change survives on the branch: the seed call
  is re-landed for measurement only and reverted before the evidence
  commit. The instrument itself is driver-side wraps only (pure reads
  + driver-local writes, no RNG, no state).
- Determinism: D1/D2 as in §Primary metric. Drift check D3 (same
  shape as seedpaths, `scripts/vetparty-drift-check.js` over both
  corpora): any drift flag is investigated, not waived.

## Sense-testing (mandatory)

Read transcripts. Read the per-episode rows as stories: does the
named creation path match what the villager actually did that day
(fought a beast and came home to Haven? heard the village slew one?
fled in the wild? turned away at the gate? was handed a plan as a
launch companion?). One episode where the recorded creator
contradicts the day's narration is a finding, not a rounding error —
name it in the evidence.

## Balanced panel (per docs/MEASUREMENT.md §15)

Run `scripts/balance-panel.js` comparing the two legs and attach the
compare `.md` to the evidence file. This DIAG ships no lever — the
panel measures the seed call's effect between legs (noise check, not
a lever verdict); the prereg bars are the judge. Report the panel
result as what it is.

## Metric review (fill in at evidence time; do NOT re-score mid-run)

- Did first-creator-wins hide anything (episodes with 2+ firings
  where the first creator was not the effective one — e.g. a
  havenTick episode whose launches only happened after a seed
  retarget, which would have closed it; name any)?
- Did any wrap miss a creation (a planCensus holder with no
  `v4creates` row)? Name the missed hook.
- Was 150d the right horizon, or did episodes cluster at the tail?
- Did the control leg reproduce seedpaths' shape closely enough to
  trust the cross-band comparison (same policy, different band —
  report the counts, don't assume)?
- Did winPlanOf creations matter (count, launches)?

## Wall numbers (report every run)

National (standing >=200 AND scaleRank), table, wins, wave-4
unlocked, wave-5 unlocked, median survival, wave-4 kills, deaths —
per leg.
