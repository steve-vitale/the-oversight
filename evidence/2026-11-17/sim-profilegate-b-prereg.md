# sim-profilegate-b — PREREG (frozen before any judged sim)

**Arm:** sim-profilegate-b · **Loop A run:** fleshout-20261117T1820Z · **Axis:** scale-onramp
**Type:** LEVER, game code, default-OFF env flag. No default flipped — the
default flip is a coordinator/Steve call.
**Branch:** `sim-profilegate-b` · **Worktree:** `~/workspace/worktrees/sim-profilegate-b`
**Base at arm start:** master `eb2d3714f` (branch fast-forwarded to master tip
before building; HEAD was an ancestor, 4 tooling-only commits behind).
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
**Band:** seeds 103411–103418 (8 seeds) · **Horizon:** 150d death-aware.

## The question (poolshape-a's named next lever, option 1)

sim-poolshape-a priced the empty companion pool: the profile gate admits
only wanderers/explorers and 89.7% of the people at Haven are
foragers/homebodies. Lifting the profile gate alone fills 79/81 empty dawns
at a mean pool of 2.36; every other single-condition lift fills 0.
sim-launchfunnel-a ranked the binding stage as the dawn bid via that empty
pool (81/87 scored dawns empty, 93%; the one fought meeting dealt ~8.5% of
a wave-4 monster's HP). This arm BUILDS the widened gate — option (1) from
poolshape's "Next lever" — and measures before/after on identical seeds:
does filling the pool buy launches, and at what cost?

## What was read first (do not re-measure what they answered)

- `evidence/2026-11-17/sim-poolshape-a.md` + prereg — the priced answer.
  Counterfactual: relax-profile fills 79/81 empty dawns, mean pool 2.36;
  relax-away/node/trust/engaged/onExped each fill 0. Profile census:
  forager 346, homebody 54, wanderer 38, explorer 8 (446 members). Holders
  86/87 non-ranger. The poolshape `vre` leg is this arm's OFF-leg
  replication target: 87 pool rows, 81 empty, per-seed split
  0/0/25/0/37/25/0/0, wall 460/517 deaths, 3/5 starvation (off/vre).
- `evidence/2026-11-17/sim-launchfunnel-a.md` + prereg — the funnel this
  feeds. Census leg (`vre`, VETREENGAGE=1): 12 instances, binding stage
  candidate-not-bid 8/12 (no-companion-party 7), 3 launched instances
  (launched-no-meeting 2, launched-fought-no-kill 1), 0 launched kills,
  the one fight dealt 77 of ~909 HP (8.5%). OFF leg (master default):
  0 instances — the funnel only exists with the seed call.
- `evidence/2026-11-15/sim-profilegate-a.md` — the Nov 15 arm of the same
  name. It tried the DEPART-path bypass (`agencyTick` skipping
  non-rangers) and went PILOT NO-GO (0 dawn launches on the frozen
  definition) and was REVERTED. This arm does NOT re-run the depart
  bypass. Note, read from the code (not assumed): that bypass was
  RE-LANDED verbatim by sim-launchdef-a (`1b28ad555`) and is LIVE in
  this base, unconditional (`src/js/villager-agency.js:383-399`) — a
  committed `party_launch` holder is never vetoed at the depart door.
  The two profilegate-a launches that did happen (mid-day commits) are
  consistent with it. The depart path is therefore NOT part of this
  lever; the lever is companion eligibility only.

## Canon read

- `docs/CANON.md`, `docs/MONSTER-WAVES.md` (wave law, readiness bars,
  trick-learning rule), `docs/PARTY.md` (party unlock day 7, cap 3→4→5,
  **no trust gate on invites** — trust affects acceptance, not System
  permission), `docs/VILLAGER-BRAIN.md` (one brain, one scorer; win-plan
  and EXPEDITION feed candidates to the dawn pass; departure honors the
  dawn commitment).
- **Canon gap, recorded not invented:** no canon doc covers expedition
  companion eligibility (who may walk the road as a companion), the
  away-flag semantics, or the ranger-profile gate on `findCompanion`.
  The lever below is grounded in the two `findCompanion`
  implementations and in poolshape's priced counterfactual, not in canon.

## The lever — exact sites (pinned by reading the code)

Companion eligibility is gated in exactly TWO places, the `findCompanion`
twins, which apply the same checks in the same order:

1. **`src/js/villager-brain.js:129` `findCompanion`** — the DAWN BID gate.
   `winPlanCands` (line ~215) calls it to build the `party_launch`
   candidate; its pick becomes the dawn commit's `companion`. The live
   depart path (`vbrainExecuteDepart`, brain line ~1022) launches the
   commit's companion directly and never re-picks — so widening this
   twin widens both the bid and the live depart. (`vbrainOwnsDawn()`
   returns `true` unconditionally, brain line 648.)
2. **`src/js/win-plan.js:208` `findCompanion`** — the LEGACY depart gate.
   Called by `winPlanDepart` (line ~561), which `agencyTick` reaches
   only when `vbrainOwnsDawn()` is false — i.e. never while the brain
   module is loaded. Changed identically so the twins stay in sync
   (poolshape: "both twins apply the SAME checks in the SAME order").

The change in each twin, and nowhere else: the profile check
`if (prof !== 'wanderer' && prof !== 'explorer') continue;`
(brain ~line 150, win-plan ~line 226) is skipped when the flag is on —
any profile may be a companion. Every other check is unchanged: alive,
away flag, trust ≥ 15, at Haven, engaged, on-expedition. Each file gets
a `profilegateOn()` helper mirroring the existing `vetreengageOn()` /
`planfixOn()` pattern in win-plan.js:
`((typeof process !== 'undefined' && process.env && process.env.PROFILEGATE) === '1')`
(VETSHAPE precedent, `src/js/standing.js:238`). Default OFF; in the
browser `process` is undefined, so the lever is off there too.

NOT changed (named so a reviewer can verify the diff is only the gate):
- `src/js/win-plan.js:483` `winPlanHavenTick` plan-SEEDING gate (a
  villager must be a ranger to seed a plan organically) — holders stay
  as seeded; the VETREENGAGE seed call plants plans regardless of
  profile, which is why 86/87 holders are non-rangers already.
- `src/js/villager-brain.js:263-270` `expeditionCand` (a villager's own
  ranging chance roll) — not companion eligibility.
- `src/js/win-plan.js:692` `winPlanSecondCompanion` — already
  profile-open (range ≥ 1 only, no profile check); the second-companion
  path needs no change.
- `companionLaunchable` (gear-up + armed-or-armored, sick, range-0,
  hurt<70) — unchanged. CONSEQUENCE, MEASURED NOT ASSUMED: homebodies
  have `npcMaxDist` 0 (`villager-agency.js:349-352`: explorer 6,
  wanderer 3, forager 1, homebody 0), so a homebody can be *bid* at dawn
  but cannot *launch* (range-0). The analyzer reports picked-companion
  profiles and the bid→launch conversion, so the homebody share of the
  filled pool is priced, not assumed.
- `src/js/villager-agency.js:383` depart bypass — already live in base,
  untouched.
- `companionRank` (`src/js/companion-score.js`) — profile-blind ranking,
  untouched; the replica's ranked pick stays comparable to the real pick.

This lever changes who can walk with a party — a feel change. Any
commit touching `src/` carries `[needs-eyes]`.

## Band freshness (verified 2026-11-17, before this prereg)

Intentional same-band reuse of the launchfunnel/poolshape band
(103411–103418) so the before/after is a matched §15 comparison on
identical seeds — same villages, same dawns, one flag flipped. This is
NOT a fresh measurement band, and the reuse is by design, recorded here
(the local seed-band rule reserves a band against *new* measurement; a
matched ON-vs-OFF comparison on the priced band is the point).
Search scope: (1) `grep -rln "10341[1-8]" evidence/*/sim-*-prereg.md`;
(2) goal `hidden_files/lever-claims/*.json` (this run's claim
`fleshout-20261117T1820Z.json` names 103411–103418 for this arm);
(3) goal `hidden_files/convergence-tracker.md`.
Result: the band is named only by `sim-launchfunnel-a-prereg.md`,
`sim-part2night-a-prereg.md` (sibling arm, same Loop A run, shared by
design), `sim-part2target-a-prereg.md` (names it as a reference band;
its own bands are 103421–103428 / 103431–103438),
`sim-poolshape-a-prereg.md`, this run's claim, and the convergence
tracker's 1415Z wall line (the same band's judged corpora — consistent,
not conflicting). **No other prereg names a conflicting use. Reuse is by
design, recorded here.**

## Instrument (copy + adapt the launchfunnel instrument, do not rebuild)

- **Driver:** `scripts/profilegate-driver-20261117.js` — a copy of
  `scripts/launchfunnel-driver-20261117.js` with these deltas, all
  recorded here: (a) names `profilegate-b` / `perseed-profilegate-b-<leg>`
  / `profilegate-b-s<seed>-profilegate-b-<leg>.json`, loadGame mode
  `'profilegate-' + MODE`; (b) `poolReplica` reads
  `process.env.PROFILEGATE`: when `1`, the profile first-fail is skipped
  (any profile passes that check) and the row carries
  `profileGateOpen: true` — so the replica mirrors the widened gate on
  the ON leg and the old gate on the OFF leg, and the `agree` check
  (replica ranked pick vs the real bid companion) stays meaningful on
  both legs; members still carry their full profile, so the analyzer
  can count would-be-notRanger members on either leg; (c) the skip
  recorder stays mode `'on'` (the depart bypass is landed in base);
  (d) error strings re-tagged `profilegate-`. Everything else — the
  dawn-scoring hook, `v4seeds`/`v4departs`/`v4gates`/`v4encounters`
  wraps, `dawnbidCensus`, the `vetSays` capture — is the launchfunnel
  instrument verbatim.
- **Analyzer:** `scripts/analyze-profilegate-b.js` — a copy of
  `scripts/analyze-launchfunnel-a.js` with these deltas: (a) legs
  `on` (judged, replaces `vre`) / `off` (control) / `rec` (D2);
  (b) per-leg pool-shape table (scored dawns, empty dawns + share, mean
  eligible/dawn, eligible distribution, picked-companion profile
  counts from pool rows' `bidCompanion` + member profiles, `agree`
  rate); (c) launch events counted on the any-commit definition
  (`classifySeed` `launchDefinition: 'any-commit'`, per profilegate-a's
  metric review — dawn + part-1 + part-2 commits all count), plus a
  secondary total of wave-4+ `dawnbidDeparts` launch rows; (d)
  damage-wall table (B4): per fought meeting, damage share =
  `mDealt` / derived monster max HP — derived from the fight log's
  first `strikes for N (M left)` line as `N + M` (the launchfunnel
  909-HP derivation), falling back to the `src/data/monsters.json`
  hp-range midpoint when no line parses — pooled share + per-meeting
  shares, reported not judged; (e) arm-only starvation deaths: a
  starvation death on the ON leg counts as arm-only iff no starvation
  death exists on the OFF leg on the same (seed, day); same in reverse
  for the OFF arm-only count; (f) wall numbers per leg, both national
  definitions, as before.
- **Legs (four, one band, one driver). BOTH seed-fed legs carry
  VETREENGAGE=1 — the seed call plants the funnel; without it there is
  no funnel to measure (launchfunnel OFF: 0 instances). "OFF" here means
  the PROFILEGATE flag off, not master default:**

| Leg | VETREENGAGE | PROFILEGATE | Recorder | Role |
| --- | --- | --- | --- | --- |
| `off` | `1` | unset | ON | **Control.** Reproduces poolshape's `vre` leg (replication check, B5). |
| `on` | `1` | `1` | ON | **Judged leg.** Widened gate. |
| `rec` | `1` | `1` | OFF | D2 full-band neutrality vs `on`. |
| `rec0` | `1` | unset | OFF | D2 full-band neutrality vs `off`. |

- **Drift check:** `scripts/profilegate-drift-check.js` — copy of
  `scripts/launchfunnel-drift-check.js` (off vs on dirs), first-lever-day
  = first world-tick seed row on the ON leg (fallback first companion2
  depart), conservative: the gate can first act at a scored dawn for a
  plan holder, which is never before the first plan is planted.
- **Panel builder:** `scripts/build-profilegate-panels-20261117.js` —
  copy of the launchfunnel panel builder, profilegate names;
  before=`off`, after=`on` (the LEVER contrast — unlike poolshape's
  recorder-only rec0→off panel, this panel measures the lever).
  Panel is the instrument, NOT the judge.
- **Proof test:** `scripts/test-profilegate-b.js` — static checks (lever
  present + env-gated in both twins, depart bypass still landed and
  untouched, `winPlanSecondCompanion` still profile-open, instrument
  file list), a live gate fixture (staged non-ranger forager at Haven
  with a wave-4+ plan holder: `findCompanion` via the dawn candidate
  returns null OFF and the forager ON; a staged homebody is picked OFF?
  NO — homebody is picked ON at dawn but blocked at launch by range-0,
  proven by `companionLaunchable` returning false), analyzer fixtures
  (pool-shape table, damage-share derivation incl. the log-parse
  fallback, arm-only starvation matching), D1 repeatability + D2 wrap
  neutrality (60d, seed 103411, VETREENGAGE=1, both PROFILEGATE states).

## Primary metric (frozen)

**Launched wave-4+ plan instances (any-commit definition) and the
companion-pool fill on the ON leg vs the OFF leg, on identical seeds** —
pool fill first (B1), launches second (B2), cost third (B3), damage
fourth as a tracked wall (B4).

## GO bars (frozen — a miss is NO-GO, never re-scored)

1. **B1 pool fills.** ON leg: empty scored dawns share ≤ 40/87
   (≈0.46, vs 81/87 = 0.93 OFF) AND mean eligible/dawn ≥ 1.5.
   Justification: poolshape's counterfactual predicts 2/81 empty
   (79/81 filled) at mean 2.36 on the OFF population; the bar is set
   deliberately looser than the counterfactual because ON trajectories
   diverge (launches change who is at Haven), so the ON population is
   not the OFF population recomputed. Half the OFF empty share, at
   ~2/3 the counterfactual mean, is the honest bar for "the gate
   widened and the pool filled".
2. **B2 launches rise.** Launched instances (funnelBucket `launched-*`,
   any-commit) ON ≥ 5 AND ON > OFF. Launchfunnel's census leg launched
   3 instances; the pool fill must convert into more launched parties,
   not just more bids. Secondary (reported, not barred): total wave-4+
   launch events ON vs OFF.
3. **B3 scalemetric cost bar.** Starvation deaths, totals: ON ≤ OFF + 2.
   Starvation deaths, arm-only (matched same-seed same-day, see
   Analyzer (e)): ON ≤ OFF + 2. Median survival: ON ≥ 0.8 × OFF median.
4. **B4 damage wall TRACKED, not judged.** Launched-party damage share
   per fought meeting (derivation in Analyzer (d)), pooled + per
   meeting, vs launchfunnel's 8.5% (single meeting, 77/909). Reported;
   no pass/fail — filling the pool buys launches, not kills.
5. **B5 instrument valid.** Proof test `scripts/test-profilegate-b.js`
   green; D1 repeatability + D2 wrap neutrality green (60d, seed
   103411, VETREENGAGE=1, both PROFILEGATE states); D2 full-band:
   `rec` trajectories identical to `on` on all 8 seeds and `rec0`
   identical to `off` on all 8 seeds (0 divergences); D3 drift CLEAN
   (first divergence day ≥ first-lever-day on every seed);
   `check.js --quick` attempted after the `src/` change and its result
   reported honestly (poolshape: the box could not finish it in ~20
   min; a killed incomplete run is recorded as incomplete, never as
   green); balanced panel §15 built off→on and attached
   (`profilegate-b-panel.{json,md}` + before/after `.json.gz`).
   **OFF-leg replication (reported, investigated if mismatched — not a
   verdict-killer):** the OFF leg should reproduce poolshape's `vre`
   leg pool rows (87 rows, 81 empty, per-seed 0/0/25/0/37/25/0/0) and
   wall. Base drift since poolshape: only `src/js/conversation.js`
   (quote-aware pagination, `7eb8ffc22`) + a version bump between
   poolshape's base `0cace51c3a2d` and this base `eb2d3714f`. If the OFF
   leg does not reproduce, the evidence names the delta and checks
   whether `7eb8ffc22` moved trajectories; the ON-vs-OFF verdict still
   stands (both legs share the same base), but comparability with the
   priced counterfactual is weakened and must be said so.

Verdict is GO iff B1 + B2 + B3 + B5 all pass. B4 is reported either way.

## Sense-testing (SENSE-TESTING LAW)

Read transcripts. Quote real `vetSays` lines and at least one
launch-adjacent scene the corpus carries (a holder bidding with a
forager companion, or a homebody picked at dawn who cannot launch).
Judge meaning, coherence, consequences — never just counts. Note
specifically whether a forager companion walking the road reads as a
person choosing to go (not a roster slot filling), and whether the
fiction says anything when a picked homebody stays home. The evidence
carries a "metric review" section.

## Instrument limitations (pre-registered, not hidden)

1. The `members` snapshot is read AFTER the real `vbrainScorePick` call
   returns (launchfunnel hook shape) — a same-tick departure between
   the scorer's `findCompanion` read and the replica's read would show
   as a replica/real disagreement on the `agree` field; any
   `agree: false` row is investigated by hand and named (launchfunnel:
   0 such rows on the census leg).
2. The OFF leg's pool rows are scored with the OLD gate and the ON leg's
   with the NEW gate — the replica is flag-aware by construction, so a
   pool row's `eligible` means "eligible under the leg's gate", and the
   analyzer's would-be-notRanger count (from member profiles) is what
   makes the two legs' pools comparable.
3. Damage-share derivation reads the fight log's first strike line;
   if a monster heals before the first strike lands, the derived max HP
   understates the true max and the share overstates — the fallback
   (hp-range midpoint) and the per-meeting table make the derivation
   auditable.
4. Eight seeds is a pilot. A confirm band (12–16 seeds, fresh band,
   re-prereg) is a follow-up, not this arm.
5. Loop B's `sim-partysize-b` adoption is live in a sibling tree touching
   `win-plan.js` + `villager-brain.js` — the same files as this lever.
   Its branch (`sim-partysize-b`, tip `02117e2e8`, PILOT NO-GO on
   instrument) is NOT in master (verified 2026-11-17); this branch was
   rebased onto master `eb2d3714f` before building. If a rebase
   conflicts on a file Loop B touched, stop and FAIL LOUDLY to the
   coordinator with the file names. Do not touch Loop B's tree, claim,
   or axis.

## Files

- Prereg: `evidence/2026-11-17/sim-profilegate-b-prereg.md` (this file)
- Lever: `src/js/villager-brain.js`, `src/js/win-plan.js` (profile check
  only, `[needs-eyes]` on the commit)
- Instrument: `scripts/profilegate-driver-20261117.js`,
  `scripts/analyze-profilegate-b.js`,
  `scripts/profilegate-drift-check.js`,
  `scripts/build-profilegate-panels-20261117.js`,
  `scripts/test-profilegate-b.js`
- Corpora: `evidence/2026-11-17/perseed-profilegate-b-off/`,
  `perseed-profilegate-b-on/`, `perseed-profilegate-b-rec/`,
  `perseed-profilegate-b-rec0/` (8 files each)
- Analysis: `evidence/2026-11-17/profilegate-b-analysis.json`
- Panel: `evidence/2026-11-17/profilegate-b-panel.{json,md}` (+ before/after `.json.gz`)
- Evidence: `evidence/2026-11-17/sim-profilegate-b.md`
- Disposition if NO-GO: revert the `src/` change in this tree before
  reporting (leave the instrument + evidence).
