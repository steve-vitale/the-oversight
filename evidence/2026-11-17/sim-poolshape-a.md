# sim-poolshape-a — decompose the empty companion pool (DIAG, GO)

**Arm:** sim-poolshape-a · **Loop A run:** fleshout-20261117T1535Z · **Axis:** scale-onramp
**Type:** DIAG, instrument-only. No game-code change, no default flipped, no lever built.
**Branch:** `sim-poolshape-a` · **Base at arm start:** master `0cace51c3a2d`
(worktree HEAD at sweep time; the instrument commit — the launchfunnel base
`f9b33757a` plus this arm's instrument).
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
**Band:** seeds 103411–103418 (8 seeds) · **Horizon:** 150d death-aware
**Prereg:** `evidence/2026-11-17/sim-poolshape-a-prereg.md` (frozen before any judged sim)

## The question (launchfunnel's named next blank 1)

sim-launchfunnel-a ranked the launch funnel's binding stage as the dawn bid
via an empty companion pool: 81/87 scored dawns with zero eligible
companions (93%). This arm answers WHY the pool is empty, on the same band,
same villages, same dawns — decomposing each scored dawn member by member
against the reason codes the pool-scoring code itself checks.

## Verdict: DIAG-GO

All four frozen bars pass (`poolshape-a-analysis.json`):

| Bar | Result |
| --- | --- |
| 1. Classification completeness | PASS — 446/446 member-checks coded (share 1.0 ≥ 0.95), 0 unknown, 0 shape-bad, 0 instrument errors on every file |
| 2. Corpus + same-dawn replication | PASS — census leg 8/8 seeds; pool rows reproduce launchfunnel's `vre` leg exactly: 87 rows, 81 empty, per-seed split 0/0/25/0/37/25/0/0 |
| 3. Decomposition produced | PASS — per-dawn dominant-reason table, marginals, counterfactual relaxations, away/node disagreements, profile census, holder split; top reason named with share (below) |
| 4. Instrument validity | PASS — proof 50/50 green; D1 repeatability + D2/D2b wrap neutrality green (60d, seed 103411); D2 full-band `rec`≡`vre` and `off`≡`rec0` trajectories, 0 divergences; D3 drift CLEAN on all 8 seeds (first divergence day ≥ first-lever-day + 2 everywhere) |
| 5. Balanced panel (§15) | DONE — `poolshape-a-panel.{json,md}` + before/after `.json.gz`, `rec0`→`off` compare; every observed metric delta exactly 0 (see Panel) |

## The answer, in plain words

**The pool is empty because the people at Haven in the morning are
foragers and homebodies, and the bid only takes rangers.** Nine out of ten
villagers a holder could ask are the wrong kind of person for the road —
and of those, most are wrong on profile alone, with nothing else the matter
with them. The rangers exist (46 of 446 members) but they are out, not
home: the expedition population IS the ranger population, out in the world.
Nothing else moves the pool. Not trust, not distance, not the away flag.

## The decomposition (census leg `vre`, 87 scored dawns, 446 member-checks)

### Marginals — what blocks how many people (a member can fail several)

| Condition | n | Share of 446 | Alone (only this flag) |
| --- | --- | ---: | ---: |
| **notRanger (profile not wanderer/explorer)** | **400** | **89.7%** | **198** |
| away (flag) | 241 | 54.0% | 0 |
| notAtHaven (node ≠ Haven tile) | 235 | 52.7% | 0 |
| trustLow (trust < 15) | 37 | 8.3% | 0 |
| onExped | 32 | 7.2% | 0 |
| dead | 0 | 0% | 0 |
| engaged | 0 | 0% | 0 |

First-fail order (the code's check order, for comparability with
launchfunnel/poolmarginals): away 241, notRanger 198, eligible 7 —
launchfunnel's tally reproduced exactly (away 241, notRanger 198,
selfOrScholar 174, eligible 7). The first-fail picture hides the marginal
truth the same way it did on poolmarginals' band: away looks like the
leader (241) only because it is checked second; **away binds alone on zero
members** — every away member is also a non-ranger, off-node, or both.

### Dominant reason per empty-pool dawn (81 dawns)

- **Marginal reading (largest failing group): notRanger 75/81 dawns**
  (away 10, notAtHaven 10, trustLow 1 — tallies exceed 81 where dawns tie).
- **Alone reading (largest group failing on exactly one condition):
  notRanger 79/81 dawns.** On 79 of the 81 empty mornings, the biggest
  group of people who could go if one thing changed is the people who are
  fine except for their profile.
- **First-fail reading: away 60, notRanger 55** (ties) — the check-order
  artifact again; the marginal and alone readings agree the story is
  profile, and the first-fail reading splits only because away is checked
  before profile.

### Counterfactual relaxations — what each single fix would buy

Recomputed eligibility per dawn with exactly one check dropped:

| Relaxation | Mean eligible / dawn | Empty dawns filled |
| --- | ---: | ---: |
| **relax profile (any profile may walk)** | **2.36** | **79 / 81 (97.5%)** |
| relax away (flag ignored, node still applies) | 0.08 | 0 / 81 |
| relax node (node ignored, flag still applies) | 0.08 | 0 / 81 |
| relax trust (floor ignored) | 0.08 | 0 / 81 |
| relax engaged | 0.08 | 0 / 81 |
| relax onExped | 0.08 | 0 / 81 |
| relax profile + away together | 2.43 | 79 / 81 |

The 0.08 mean on the non-profile rows is just the 6 already-non-empty
dawns' existing eligible members (7 members / 87 dawns). **Every
non-profile relaxation fills zero empty dawns.** Lifting the profile gate
alone fills all but two empty mornings, at a mean pool of 2.36 — a party
that can actually bid. Adding the away lift on top buys almost nothing
(2.36 → 2.43, same 79 dawns): the away members the profile lift frees are
the same people.

### The away-flag-vs-node question, priced (finding 2026-11-16)

Eligibility is decided by the **away flag** (it is checked before the node
read in both `findCompanion` twins). Disagreements, counted separately:

- **away-but-at-Haven: 6 members** (petra_novak ×2, ines_duarte,
  nino_kapanadze ×2, gen_x21r0si — all foragers, none on expedition).
- off-node-but-flag-clear: **0 members** (every off-node member is flagged
  away, as poolmarginals found).
- node-unreadable: **0 members**.

All 6 disagreement members are foragers, so **reading eligibility by node
instead of flag would add exactly 0 eligible members** — the flag's cost
on this band is zero, not six. The finding's question is answered for
eligibility purposes; why the flag lingers after return is still a
question for whoever owns away semantics, but it is not the pool's leak.

### Who the non-rangers are

Profile census over the 446 living non-self members: wanderer 38,
explorer 8, **forager 346, homebody 54**. The non-ranger population is
entirely foragers (346) and homebodies (54) — two occupations, no others.
The 46 rangers are the whole eligible universe before distance and trust
are even considered.

### Holder split — the askers are the same kind of person as the pool

- **Ranger holders: 1 dawn** (ethan_hunt, explorer, seed 103416 d64 —
  non-empty, bid, launched).
- **Non-ranger holders: 86 dawns, 81 empty (94.2%).** Devon (forager, 25
  dawns), Sigrun (homebody, 18), visjoin_98 (forager, 19), Sofia
  (forager, 8), visjoin_99 (forager, 13), David (homebody, 1),
  visjoin_137 (forager, 2).
- The one ranger-holder dawn is the only holder dawn that ever had a
  ranger at home to ask — and it is also the only holder who is himself
  the kind of person the pool accepts. The plan holders are foragers
  asking foragers to walk a road only rangers may walk.

### Stage split (scored dawns by plan stage)

party 59, hunt 11, standing 17; gear 0, table 0. Gear-stage holders never
reach the pool (they hold for kit — the `gear_hold` candidate, not a
scored dawn), and no table-stage holder was scored on this band.

### Bid/pool coupling — perfect

- bid on empty-pool dawn: **0**; bid on non-empty dawn: **6/6**;
  non-empty dawn with no bid: **0**. The pool and the bid move together
  exactly: whenever anyone is eligible, the holder bids; whenever nobody
  is, the `party_launch` candidate does not exist at all.
- Replica/real agreement: the replica's ranked pick matched the real
  `findCompanion` pick on **6/6** dawns where a bid existed (`agree` false
  0).

## Per-seed table (census leg)

| Seed | Days | End | Standing | Max wave | Pool rows | Empty |
| --- | ---: | --- | ---: | ---: | ---: | ---: |
| 103411 | 107 | village-lost | 199 | 4 | 0 | — |
| 103412 | 62 | village-lost | 100 | 4 | 0 | — |
| 103413 | 150 | survived | 199 | 4 | 25 | 22 |
| 103414 | 150 | survived | 150 | 4 | 0 | — |
| 103415 | 144 | village-lost | 199 | 4 | 37 | 37 |
| 103416 | 150 | survived | 430 | 5 | 25 | 22 |
| 103417 | 150 | survived | 199 | 4 | 0 | — |
| 103418 | 143 | village-lost | 199 | 4 | 0 | — |

Seed 103415 is the thinnest village in the band: 37 scored dawns, **37
empty** — Sigrun and visjoin_98 asked 37 mornings and never once had
anyone eligible to ask. Seed 103413's Devon is the opposite pole: 25
dawns, 3 non-empty, and all 3 launched (d86, d95, d100).

## Wall numbers (both national definitions)

| | OFF leg | VRE leg (census) | REC leg | REC0 leg |
| --- | ---: | ---: | ---: | ---: |
| Wins | 0/8 | 0/8 | 0/8 | 0/8 |
| National by standing ≥ 200 | 1/8 | 1/8 | 1/8 | 1/8 |
| National by scaleRank ≥ 2 | 0/8 | 0/8 | 0/8 | 0/8 |
| Table seats | 0/8 | 0/8 | 0/8 | 0/8 |
| Wave 4 unlocked | 7/8 | 8/8 | 8/8 | 7/8 |
| Wave 5 unlocked | 1/8 | 1/8 | 1/8 | 1/8 |
| Median survival | 151d | 147.5d | 147.5d | 151d |
| Total deaths | 460 | 517 | 517 | 460 |
| Starvation deaths | 3 | 5 | 5 | 3 |

The `vre` wall is **byte-identical in every number to launchfunnel's
`vre` wall** (517 deaths, 5 starvation, survivals [107, 62, 150, 150,
144, 150, 150, 143] by seed) and the `off` wall to launchfunnel's `off`
wall (460 deaths, 3 starvation) — two independent recorders on the same
villages produce identical trajectories, as the neutrality legs require.
The `rec` wall equals `vre` and `rec0` equals `off` on every number.

## Balanced panel (§15) — `rec0`→`off` pure recorder contrast

`scripts/balance-panel.js compare` on the `rec0`→`off` panels; overall
decision **review_required** (the tool's default when metrics are
unobserved/descriptive). **Every observed metric is exactly 0 delta on all
8 paired seeds** — wins 0→0, national 0→0, survival-60 0.875→0.875,
village deaths 57.5→57.5, deaths/100d 50.12→50.12, community loss
0.25→0.25 — each with status `no_material_signal`. The recorder moves
nothing; the overall `review_required` is the panel tool's framing for the
unobserved metrics, not a signal (launchfunnel's panel carried the same
overall decision). The panel is the instrument, NOT the judge (the frozen
bars above are).

## Sense-testing (SENSE-TESTING LAW)

What an empty-pool morning looks like from inside, seed 103413, Devon
Okafor (forager, target the Eulogy). His 25 scored dawns pick: WATER 6,
DUTY 11, party_launch 3, HAVEN_CHORE 1, VISIT 4. On an empty morning the
`party_launch` candidate is not even offered — d82's candidate list is
FORAGE / WATER / HAVEN_CHORE / DUTY ×3, and he fetches water; d84's is
the same shape and duty wins. On d86, the first morning anyone is
eligible, the candidate appears and wins by override
(`win_plan:party_launch`, core pick WATER) — the same man, the same beast,
the same morning shape, and the only thing that changed is that a ranger
was home. The pool is not a preference the holder weighs; it is a door
that is either there or not.

The village's own voice on the launch day says nothing about the launch —
d77's line is the System selling the next draft ("But finales — FINALES
need a LEGEND, sweetheart. More STANDING — blood, bonds, or bread — and
look the Mirror Draft in the eye. The producers are WAITING.") while Devon
is about to walk out after a beast he fled the day before. The fireside
teaching lines still read well where they are authored, and the door-defense
template still repeats verbatim (launchfunnel's finding, unchanged) — but
nothing in the 371 `vetSays` lines on this band voices a holder asking for
a companion and finding nobody. The emptiest moment in the funnel is
silent in the fiction: Devon asks 22 mornings, and the game never says so.

## Metric review

- The frozen bars judged the decomposition as designed; no re-scoring.
  Bar 5's expected panel decision needs the note above: per-metric
  `no_material_signal` on every observed metric, overall
  `review_required` from the tool's default — reported, not hidden.
- The `off` leg carries 0 pool rows (launchfunnel: same) — the
  decomposition is judged on the `vre` leg, as frozen; the off leg's
  dawnbidScores (95 rows across seeds 103414/103415/103417, all for
  non-wave-4 plans) confirm the pool rows are scoped to wave-4+ holders,
  not missing.
- TrustLow marginal (37/446, 8.3%) is higher than poolmarginals' 14/1043
  (1.3%) — a band difference, not an instrument difference: this band's
  villages run lower trust. It changes nothing: trustLow binds alone on
  zero members and relaxTrust fills zero empty dawns on both bands.
- The one ranger-holder dawn (ethan_hunt, explorer) launched — the chain
  works as designed when a ranger holds the plan and a ranger is home.
  The sample is one dawn; the claim is the pool shape, not the launch.

## Findings (for the coordinator to append — this arm appends nothing itself)

- **Top reason, priced:** the companion pool is empty because the
  profile gate admits only wanderers/explorers and 89.7% of the people at
  Haven are foragers/homebodies. Lifting the profile gate alone fills
  79/81 empty dawns at a mean pool of 2.36; every other single-condition
  lift fills 0. Any follow-up lever that wants more launches must widen
  the profile gate (or grow rangers at home) — trust, away, expedition,
  and node fixes leave the pool empty.
- **Away-flag-vs-node, answered for eligibility:** 6 members flagged away
  while their node reads Haven, all foragers; reading eligibility by node
  instead of flag adds 0 eligible members. Why the flag lingers after
  return is still open for whoever owns away semantics, but it is not the
  pool's leak.
- **The holder is the pool:** 86/87 scored dawns have a non-ranger
  holder. The plan holders are foragers asking foragers to walk a road
  only rangers may walk. A lever that only widens who may be *asked*
  leaves the holder a forager; whether holders should be rangers (or the
  gate should admit the holder's own kind) is a design question for the
  follow-up arm.
- **The empty morning is silent:** nothing in the fiction voices a holder
  asking for a companion and finding nobody, on 22 Devon mornings or 37
  Sigrun/visjoin_98 mornings. If the funnel's binding stage ever gets a
  voice line, this is where it belongs.

## Next lever (named, not built)

Widen the companion profile gate — the follow-up arm's job, not this
DIAG's. The priced options, in order of what the decomposition buys:
(1) admit foragers/homebodies as companions (fills 79/81 dawns at mean
pool 2.36 — the profile lift alone); (2) grow rangers at home
(role-formation work — the rangers exist but are out); (3) nothing on
trust/away/expedition/node (each fills 0 dawns alone). Any profile-gate
lever must be judged on the same band with the same instrument, and must
carry the damage wall behind it: launchfunnel priced a launched party
meeting its target at ~8.5% of a wave-4 monster's HP. Filling the pool
buys launches, not kills.

## Instrument

- `scripts/poolshape-driver-20261117.js` — thin CLI over the launchfunnel
  instrument (`oneRun` required as a module; same dawn-scoring hook, same
  `poolReplica` with the `members` extension). Two fixes found by the
  proof test and fixed before the sweep: the driver exited on require when
  SEEDS was unset (moved the check into the CLI path), and it deleted an
  explicit `LAUNCHFUNNEL_RECORDER=off` from the environment (now left
  untouched when the leg wants the recorder on).
- `scripts/analyze-poolshape-a.js` — decomposition (marginals,
  alone-vs-combination, per-dawn dominant reasons, counterfactual
  relaxations, disagreement counts, profile census, holder/stage splits,
  replication check, D2 trajectory fingerprints, wall numbers).
- `scripts/build-poolshape-panels-20261117.js` — panel builder (copy of
  the launchfunnel builder, poolshape names, before=`rec0`, after=`off`).
- `scripts/test-poolshape-a.js` — proof, **50/50 green** (re-run on the
  instrument tip; D1/D2/D2b live legs included). `check.js --quick`:
  started, still incomplete after ~20 min under heavy box load (sibling
  arms' sims + two other trees' check runs contending; green-list
  children still spawning when stopped) — killed, no stray tree changes
  left behind. Not a frozen bar (bar 4 passes on the proof test +
  D1/D2/D3); this arm adds 4 new files and modifies no existing file or
  `src/` line, so there is nothing for the green list to regress. The
  proof test stands as the coverage.
- `src/` diff: 0 lines (DIAG, recorder wraps only, reused verbatim).
- Index clobber (safe-commit): struck on the instrument commit — the main
  index showed all 4 committed files staged-as-deleted after a correct
  commit. Repaired via `git ls-tree -r HEAD -- <paths> | git
  update-index --add --index-info`; verified status clean + `git diff
  HEAD` empty + hash-object match per file. Commit verified correct.

## Files

- Prereg: `evidence/2026-11-17/sim-poolshape-a-prereg.md`
- Instrument: `scripts/poolshape-driver-20261117.js`,
  `scripts/analyze-poolshape-a.js`, `scripts/build-poolshape-panels-20261117.js`,
  `scripts/test-poolshape-a.js`
- Corpora: `evidence/2026-11-17/perseed-poolshape-a-off/`,
  `perseed-poolshape-a-vre/`, `perseed-poolshape-a-rec/`,
  `perseed-poolshape-a-rec0/` (8 files each)
- Analysis: `evidence/2026-11-17/poolshape-a-analysis.json`
- Panel: `evidence/2026-11-17/poolshape-a-panel.{json,md}` (+ before/after `.json.gz`)
- This evidence file: `evidence/2026-11-17/sim-poolshape-a.md`
