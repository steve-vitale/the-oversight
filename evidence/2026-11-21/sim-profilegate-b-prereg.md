# sim-profilegate-b — PREREG (frozen before any judged sim; SCOPED variant)

**Arm:** sim-profilegate-b (scoped profile-gate relaxation) · **Loop B run:**
fleshout-loop-b-20261121T1030Z, arm 1 of 3 · **Axis:** winnability chain
**Type:** LEVER, game code, default-OFF env flag (`PROFILEGATE4=1`).
No default flipped — the default flip is a coordinator/Steve call.
**Branch:** `sim-profilegate-b` · **Worktree:**
`~/workspace/worktrees/sim-profilegate-b`
**Base at arm start:** master `2b97163b0` (branch base; master has since
moved to `27a650645` by an evidence-only commit — do NOT rebase; the
coordinator rebases at landing).
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
(verified 2026-11-21 before freezing).
**Band:** seeds 106741–106748 (8 seeds, FRESH — see Band freshness below) ·
**Horizon:** 150d death-aware.

## The question (findings #2638 + #2605 — the scoped next step, not a re-roll)

The parent arm (Loop A, 2026-11-17, `evidence/2026-11-17/sim-profilegate-b.md`)
widened the companion profile gate for EVERY plan holder and went NO-GO on
B3: the pool filled (empty 0.931 → 0.0303), launches rose 3 → 7, but median
survival fell 147.5 → 116.5d (bar 118.0) and total deaths rose +52%. The
parent's metric review names the honest next step as a lever that addresses
the COST, not a re-roll — and its D3 investigation found the unscoped gate
acts at ANY dawn bid for ANY plan holder (seeds 103415/103417 diverged on
days 54/46, before any wave-4 plan existed, on wave-3 holders). This arm
builds the SCOPED variant: relax the profile gate ONLY for wave-4+ plans
(`plan.needWave >= 4`). Wave-3 holders keep the old gate, so the extra
launches — and their cost — are confined to the hunts the winnability
chain actually needs. This is a DIFFERENT lever from the parent's; re-running
the parent shape would be metric shopping, and this arm does not do that.

## What was read first (do not re-measure what they answered)

- `evidence/2026-11-21/sim-poolfirstfail-b.md` (§2 P2/P3, §8) — the
  decomposition that names this lever: the companion pool is empty because
  villages have almost no rangers (notRanger 417/781, relax-profile alone
  fills 104/104 empty snapshots). Baseline derived from its corpora for the
  B1 bar — see "B1 baseline derivation" below.
- `evidence/2026-11-20/sim-launcheng-b.md` — finding #2605's named lever
  shape: "let a trusted villager who is actually at Haven stand as a
  wave-4+ hunting companion, not only wanderers/explorers — trust-gated,
  Haven-gated, profile gate relaxed for wave-4+ plans only."
- `evidence/2026-11-17/sim-profilegate-b.md` + its prereg — THE PARENT ARM.
  Pool filled, launches rose, cost failed (median survival bar missed by
  1.5d, deaths +52%, panel `regression_signal` on deaths/run). Lever
  reverted; instrument + evidence on master. The parent's D3 first-lever-day
  caveat (too narrow for an UNSCOPED gate) does NOT apply here: the scoped
  gate can only act for a needWave>=4 holder, and a needWave>=4 plan
  requires a wave-4 seed first — so first-v4-seed-row is a valid
  conservative bound for this lever (see B5).
- `evidence/2026-11-21/sim-poolfirstfail-b-prereg.md` — substrate + band
  discipline (its anchor-label lesson is applied here — see "Anchor rule").

## Canon read

- `docs/CANON.md`, `docs/PARTY.md` (party unlock day 7, cap 3→4→5, **no
  trust gate on invites** — trust affects acceptance, not System
  permission; it covers the SCHOLAR's party, not the villager pool).
- **Canon gap, recorded not invented:** no canon doc covers expedition
  companion eligibility (who may walk the road as a companion), the
  away-flag semantics, or the ranger-profile gate on `findCompanion`.
  The lever below is grounded in the two `findCompanion` implementations
  and in poolfirstfail's priced counterfactual, not in canon.

## The lever — exact sites (pinned by reading the code)

Companion eligibility is gated in exactly TWO places, the `findCompanion`
twins, which apply the same checks in the same order:

1. **`src/js/villager-brain.js:129` `findCompanion`** — the DAWN BID gate.
   `winPlanCands` (line ~215) calls it to build the `party_launch`
   candidate; its pick becomes the dawn commit's `companion`.
2. **`src/js/win-plan.js:237` `findCompanion`** — the LEGACY depart gate.
   Called by `winPlanDepart` (line ~1069), which `agencyTick` reaches
   only when `vbrainOwnsDawn()` is false — i.e. never while the brain
   module is loaded. Changed identically so the twins stay in sync.

The change in each twin, and nowhere else: the profile check
`if (prof !== 'wanderer' && prof !== 'explorer') continue;`
(brain ~line 150, win-plan ~line 262) is skipped when the flag is on AND
the holder's plan has `needWave >= 4` — the established idiom
(VETREENGAGE in win-plan.js:1120, PARTYSIZE4 :1142, brain second/third
companion picks :244/:260, extraCompanionScan :583). The plan is read
inside each twin from the holder's own plan store
(`self.state.village.winPlan[vid]` in the brain twin — the same read
`winPlanCands` uses; `v.winPlan[vid]` in the win-plan twin, where `v`
is already in scope). If the holder has no plan, or its needWave is
below 4, the gate stays closed — the safe default. Every other check is
unchanged: alive, away flag, trust ≥ 15, at Haven, engaged,
on-expedition. Each file gets a `profilegate4On()` helper mirroring the
file's existing env-gate pattern (`vetreengageOn()` / `partysize4On()` in
win-plan.js; the inline try/catch env read in villager-brain.js):
`((typeof process !== 'undefined' && process.env && process.env.PROFILEGATE4) === '1')`.
Default OFF; in the browser `process` is undefined, so the lever is off
there too. Do NOT reuse `PROFILEGATE=1` — it is inert/reverted and
confusing.

NOT changed (named so a reviewer can verify the diff is only the gate):
- `src/js/win-plan.js:483` `winPlanHavenTick` plan-SEEDING gate (a
  villager must be a ranger to seed a plan organically) — holders stay
  as seeded; the VETREENGAGE seed call plants plans regardless of
  profile.
- `src/js/villager-brain.js:263-270` `expeditionCand` (a villager's own
  ranging chance roll) — not companion eligibility.
- `src/js/win-plan.js:692` `winPlanSecondCompanion` — already
  profile-open (range ≥ 1 only, no profile check).
- `companionLaunchable` (gear-up + armed-or-armored, sick, range-0,
  hurt<70) — unchanged. CONSEQUENCE, MEASURED NOT ASSUMED: homebodies
  have `npcMaxDist` 0, so a homebody can be *bid* at dawn but cannot
  *launch* (range-0). The analyzer reports picked-companion profiles
  and the bid→launch conversion, so the homebody share is priced.
- `src/js/villager-agency.js:383` depart bypass — already live in base,
  untouched. A picked non-ranger companion must actually depart — the
  proof's depart variants prove it (see Instrument), they do not assume it.
- `companionRank` (`src/js/companion-score.js`) — profile-blind ranking,
  untouched.
- **OVERLAP GUARD:** do NOT touch the PINQUAD blocks
  (villager-brain.js ~1269, win-plan.js ~1152) held by
  sim-pinquaddoor-b; do NOT touch fieldFights.js pin lines. If a
  rebase/merge conflict touches those lines, STOP and report to the
  coordinator (do not resolve it yourself).

This lever changes who can walk with a party — a feel change. Any
commit touching `src/` carries `[needs-eyes]`.

## Band freshness (verified 2026-11-21, before this prereg)

Fresh band 106741–106748. Search scope: (1) `grep -l "10674[1-8]"
evidence/*/sim-*-prereg.md` — empty; (2) exact-seed greps
`106741`…`106748` over `evidence/ --include="sim-*-prereg.md"` — empty;
(3) all prereg band ranges in the 106xxx region (`grep -h -o
"106[0-9][0-9][0-9][–-][0-9]*" evidence/*/sim-*-prereg.md | sort -u`) —
bands named run 106001–106609 (incl. 106241–106248, 106251, 106501,
106601); nothing at 10674x or above except 106701–106716
(pinquaddoor-reprereg) and 106729–106736 / 106731–106738 (dmgpin-reprereg
/ poolfirstfail); (4) goal `hidden_files/` for `106741` — three hits,
all verified false positives (substrings of floats `0.00210674157…` /
`0.0210674157…` in 2026-10-20 analysis JSONs, not seed bands);
(5) goal `hidden_files/convergence-tracker.md` + `lever-claims/*.json`
for `10674` — only 106729–106736 and 106731–106738 named. **Band
106741–106748 is unused. No other prereg names a conflicting use.**

## Substrate (frozen)

- Policy: competent verbatim, sha256 `1884c8852d38` (12-char prefix;
  full `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`).
- Env flags on BOTH legs: `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1
  FIGHTALLY2=1 ALLYSLOT3=1 LAUNCHSURVIVE=1`. Legs differ ONLY by
  `PROFILEGATE4` (off leg: unset; on leg: `1`).
- **ALLYSLOT3 is INERT on this base** (verified 2026-11-21 by repo-wide
  grep: the only `ALLYSLOT3` hits are in the held arm's driver
  `scripts/allyslot3-driver-b.js`; no reader exists in `src/js/` or
  `party-wiring.js` — the slot lives on the HELD sim-pinquaddoor-b
  branch, never merged). The flag is carried for substrate parity with
  poolfirstfail-b / launcheng-b (whose corpora also ran with it inert)
  and changes nothing; the third-ally slot is inactive on both legs.
  The other five flags were verified present as live readers:
  SENSEEXPED (`party-wiring.js:103`), PARTYSIZE4 (`win-plan.js:314`),
  VETREENGAGE (`win-plan.js:278`), FIGHTALLY2 (`fieldFights.js:1325`),
  LAUNCHSURVIVE (driver-side, recorder tracker).
- Anchor: base commit `2b97163b0` (full
  `2b97163b009dab4505de287c7227bd79a3357cb0`); EXPECTED.anchor12 =
  `2b97163b0`.

## Anchor rule (poolfirstfail's lesson, applied)

The driver stamps `anchorCommit` as `git rev-parse HEAD` at run time.
The judged legs run BEFORE any commit is made on this branch, so HEAD
is still the frozen base `2b97163b0` and the stamp matches. If anything
is committed before the judged legs (including the instrument), the
anchor moves and the legs must be re-run after a dated prereg
CORRECTION — never by amending EXPECTED.anchor12 after the fact. The
analyzer asserts every corpus file's anchor starts with
`2b97163b0` (part of B5), and the proof test asserts the anchor too.

## Fixture seed (LIVE on the current base — probed BEFORE freezing)

The parent proof's gate-act fixture seed 103413 scores ZERO pool rows
on the new base (its village plants no plans there). Probed 2026-11-21
~12:10 UTC on base `2b97163b0` with the parent driver OFF leg, 150d,
full substrate (script `/tmp/probe-pg4-fixture.js`, in-process, no
writes): the probe REPRODUCES poolfirstfail exactly on this base —

| Seed | Pool dawns | Empty | dawnbidScores | v4seeds | gameDays | End |
| --- | --- | --- | --- | --- | --- | --- |
| 106731 | 23 | 23 | 118 | 27 | 151 | survived |
| **106736** | **53** | **53** | 128 | 18 | 143 | village-lost |
| 106737 | 51 | 17 | 255 | 71 | 149 | village-lost |

**Gate-act fixture seed: 106736** (53 scored dawns, ALL empty OFF — the
starkest "gate closed" picture; 0 instrument errors). Alternates 106731
(23/23) and 106737 (51/17). The proof's live gate-act check runs 150d
on 106736 and asserts pool dawns ≥ 1 on the OFF leg (live: 53) and pool
fill on the ON leg. The staged day-0 gate fixture tries seeds in order
[103413, 103411, 103412, 103414, 103415] (the parent's list) and takes
the first that stages a holder + companion at Haven.

## B1 baseline derivation (from the poolfirstfail corpora, same substrate)

Script `/tmp/pg4-baseline.js` (read-only) over
`evidence/2026-11-21/perseed-poolfirstfail-b-106731-106738/` (8 files),
joining each pool row to its dawn score row by (day, vid) for
`plan.needWave`, and running the parent analyzer's `funnelForSeed`
for the launched-instances OFF baseline:

| Population (OFF leg) | Dawns | Empty | Empty share | Mean eligible |
| --- | --- | --- | --- | --- |
| ALL pool rows | 138 | 104 | 0.7536 | 0.384 |
| **needWave>=4 subset** | **99** | **94** | **0.9495** | **0.051** |
| needWave>=4, relax-profile counterfactual | 99 | 0 | 0.0 | 3.232 |

Launched instances (any-commit, OFF baseline band): **2** (both on
106737, launched-fought-no-kill; per-seed 0/0/0/0/0/0/2/0;
instances opened 24). The needWave>=4 subset is nearly ALL empty
(94/99) — the scoped population is where the gate binds hardest, and
the counterfactual says relaxing the profile fills 94/94 of those
empty dawns at mean 3.23 eligible.

## Primary metric (frozen)

**Launched wave-4+ plan instances (any-commit definition) and the
companion-pool fill on wave-4+ dawns on the ON leg vs the OFF leg, on
identical seeds** — pool fill first (B1, needWave>=4 dawns only),
launches second (B2), cost third (B3), damage fourth as a tracked wall
(B4).

## GO bars (frozen — a miss is NO-GO, never re-scored)

1. **B1 pool fills (wave-4+ dawns only).** ON leg, pool rows whose
   holder's plan has `needWave >= 4`: empty scored dawns share ≤ 0.47
   AND mean eligible/dawn ≥ 1.5. Justification: the poolfirstfail
   needWave>=4 OFF baseline is 94/99 empty (0.9495) at mean 0.051; the
   bar is half the OFF empty share (same construction as the parent's
   0.46 vs 0.93) at ~half the counterfactual mean (1.5 vs 3.23 —
   deliberately looser than the counterfactual because ON trajectories
   diverge: launches change who is at Haven, so the ON population is
   not the OFF population recomputed). Pool rows carry `needWave` so
   the analyzer can filter; dawns with needWave < 4 or null are
   reported separately and never counted toward B1.
2. **B2 launches rise.** Launched instances (funnelBucket `launched-*`,
   any-commit) ON ≥ 5 AND ON > OFF. The poolfirstfail-band OFF launched
   2; the parent's OFF launched 3 and its ON 7. The filled pool must
   convert into more launched parties, not just more bids. Secondary
   (reported, not barred): total wave-4+ launch events ON vs OFF.
3. **B3 scalemetric cost bar — IDENTICAL to the parent's.**
   Starvation deaths, totals: ON ≤ OFF + 2. Starvation deaths,
   arm-only (matched same-seed same-day): ON ≤ OFF + 2. Median
   survival: ON ≥ 0.8 × OFF median. (Parent's miss was the median
   clause alone, 116.5 vs 118.0 — this bar is the verdict the scoped
   variant must pass.)
4. **B4 damage wall TRACKED, not judged.** Launched-party damage share
   per fought meeting (derivation as in the parent analyzer), pooled +
   per meeting, vs launchfunnel's 0.085 (single meeting, 77/909) and
   the parent ON leg's 0.0577. Reported; no pass/fail — filling the
   pool buys launches, not kills.
5. **B5 instrument valid.** Proof test `scripts/test-profilegate4-b.js`
   green (incl. the anchor assertion and the live gate-act check on
   fixture seed 106736); D1 repeatability + D2 wrap neutrality green
   (60d, seed 106736, full substrate, both PROFILEGATE4 states); D2
   full-band: `rec` trajectories identical to `on` on all 8 seeds and
   `rec0` identical to `off` on all 8 seeds (0 divergences); D3 drift
   CLEAN (first divergence day ≥ first-lever-day on every seed, where
   first-lever-day = first world-tick v4 seed row on the ON leg — a
   valid conservative bound for the SCOPED gate, which cannot act
   before a wave-4 plan exists); `check.js --quick` attempted after
   the `src/` change and its result reported honestly (a killed
   incomplete run is recorded as incomplete, never as green);
   balanced panel §15 built off→on and attached
   (`profilegate4-b-panel.{json,md}` + before/after `.json.gz`).
   Corpus anchors: every file on every leg stamps `2b97163b0`.
   File counts 8/8/8/8, 0 instrument errors, classified share ≥ 0.9,
   unknown 0.

Verdict is GO iff B1 + B2 + B3 + B5 all pass. B4 is reported either way.

## Instrument (ADAPT the parent's, do not rebuild)

New files (profilegate4 names — the parent's instrument stays as the
record on master):

- **Driver:** `scripts/profilegate4-driver-20261121.js` — a copy of
  `scripts/profilegate-driver-20261117.js` with these deltas, all
  recorded here: (a) names `profilegate4-b` /
  `perseed-profilegate4-b-<leg>` /
  `profilegate4-b-s<seed>-profilegate4-b-<leg>.json`, recorder flag
  `PROFILEGATE4_RECORDER`, loadGame mode `'profilegate4-' + MODE`;
  (b) `poolReplica` is PROFILEGATE4- AND scope-aware: the profile
  first-fail is skipped only when `PROFILEGATE4=1` AND the holder's
  plan has `needWave >= 4` (plan read inside the replica from
  `v.winPlan[vid]`); the row carries `profileGateOpen` (true only
  when the gate is actually open for that holder) AND `needWave`
  (the holder's plan needWave, null when no plan) so the analyzer
  can filter B1 to wave-4+ dawns; (c) error strings re-tagged
  `profilegate4-`; (d) `ANCHOR` exported for the proof test's anchor
  assertion. Everything else — the dawn-scoring hook, `v4seeds` /
  `v4departs` / `v4gates` / `v4encounters` wraps, `dawnbidCensus`,
  the `vetSays` capture, the skip recorder (mode `'on'`, depart
  bypass landed in base) — is the parent instrument verbatim.
- **Analyzer:** `scripts/analyze-profilegate4-b.js` — a copy of
  `scripts/analyze-profilegate-b.js` with these deltas: (a) legs
  `on` / `off` / `rec` / `rec0` as in the parent; (b) pool-shape
  table computed on the needWave>=4 subset for B1 (plus the all-dawns
  table reported alongside, so the scope's effect is visible);
  (c) B5 adds the corpus-anchor check (every file's `anchorCommit`
  starts with `2b97163b0`); (d) analysis written to
  `evidence/2026-11-21/profilegate4-b-analysis.json`; (e) the
  OFF-leg replication section is DROPPED (fresh band — nothing to
  replicate against) and replaced by the anchor + substrate report
  (policy sha, flags, anchor per leg). `computeBars` keeps the
  parent's B2/B3/B4 shape; B1 reads the needWave>=4 pool shape.
- **Drift check:** `scripts/profilegate4-drift-check.js` — copy of
  `scripts/profilegate-drift-check.js` (off vs on dirs),
  first-lever-day = first world-tick seed row on the ON leg
  (fallback first companion2 depart). Valid for the scoped gate by
  construction (see B5).
- **Panel builder:** `scripts/build-profilegate4-panels-20261121.js` —
  copy of the parent panel builder, profilegate4 names;
  before=`off`, after=`on` (the LEVER contrast). Panel is the
  instrument, NOT the judge.
- **Proof test:** `scripts/test-profilegate4-b.js` — static checks
  (lever present + env-gated + scoped in both twins, depart bypass
  still landed and untouched, `winPlanSecondCompanion` still
  profile-open, `winPlanHavenTick` seeding gate + `expeditionCand`
  NOT widened, PINQUAD blocks untouched, instrument file list),
  analyzer fixtures (needWave>=4 pool-shape filter, damage-share
  derivation, arm-only starvation, anchor-mismatch B5 fail, F4-style
  frozen bar logic), a live gate fixture (staged non-ranger forager
  at Haven with a wave-4+ plan holder: `findCompanion` via the dawn
  candidate returns null OFF and the forager ON; the SCOPE variant:
  the same staging with a needWave-3 plan returns null in BOTH
  states — the gate stays closed below wave 4; a staged homebody is
  picked ON at dawn but blocked at launch by range-0, proven by
  `companionLaunchable` returning false), the depart variants
  (depart-homebody: holder leaves, homebody does NOT; depart-forager:
  both leave — proving the landed depart bypass actually lets a
  picked non-ranger companion depart), a LIVE gate-act check (150d
  on fixture seed 106736: OFF leg pool dawns ≥ 1 — probed live at
  53 — and ON leg pool fill), D1 repeatability + D2 wrap neutrality
  (60d, seed 106736, full substrate, both PROFILEGATE4 states).
  Fixture staging follows the local_proof_of_effect rule: the
  staged holder + companion carry encounter gear (armed + armored,
  per the parent fixture's holderGear) — a geared party, never a
  fresh un-geared solo, since the verdict turns on whether the
  content is beatable; the gear is recorded beside the encounter
  average it claims to match in the proof header. Proofs must
  demonstrate the OBSERVABLE effect (companions actually
  picked/launched), not just green assertions.

## Legs (four, one band, one driver). ALL legs carry the full substrate
(SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FIGHTALLY2=1 ALLYSLOT3=1
LAUNCHSURVIVE=1); "OFF" means the PROFILEGATE4 flag off, not master
default:

| Leg | PROFILEGATE4 | Recorder | Role |
| --- | --- | --- | --- |
| `off` | unset | ON | **Control.** Old gate on the fresh band. |
| `on` | `1` | ON | **Judged leg.** Scoped gate (wave-4+ only). |
| `rec` | `1` | OFF | D2 full-band neutrality vs `on`. |
| `rec0` | unset | OFF | D2 full-band neutrality vs `off`. |

## Sense-testing (SENSE-TESTING LAW)

Read transcripts. Quote real `vetSays` lines and at least one
launch-adjacent scene the corpus carries (a holder bidding with a
forager companion on a wave-4+ plan, or a homebody picked at dawn who
cannot launch). Judge meaning, coherence, consequences — never just
counts. Note specifically whether a forager companion walking the road
reads as a person choosing to go (not a roster slot filling), and
whether the fiction says anything when a picked homebody stays home.
The evidence carries a "metric review" section.

## Instrument limitations (pre-registered, not hidden)

1. The `members` snapshot is read AFTER the real `vbrainScorePick` call
   returns (parent hook shape) — a same-tick departure between the
   scorer's `findCompanion` read and the replica's read would show as
   a replica/real disagreement on the `agree` field; any `agree: false`
   row is investigated by hand and named.
2. The OFF leg's pool rows are scored with the OLD gate and the ON leg's
   with the NEW gate — the replica is flag- AND scope-aware by
   construction, so a pool row's `eligible` means "eligible under the
   leg's gate for this holder's plan", and the analyzer's
   would-be-notRanger count (from member profiles) is what makes the
   two legs' pools comparable. Pool rows whose holder plan has
   needWave < 4 are scored with the old gate on BOTH legs (the scope
   is closed there by construction).
3. Damage-share derivation reads the fight log's first strike line;
   if a monster heals before the first strike lands, the derived max HP
   understates the true max and the share overstates — the fallback
   (hp-range midpoint) and the per-meeting table make the derivation
   auditable.
4. Eight seeds is a pilot. A confirm band (12–16 seeds, fresh band,
   re-prereg) is a follow-up, not this arm.
5. The flap: at freeze time (2026-11-21 ~12:15 UTC) host ref writes
   (`git update-ref`, `git commit`, registry atomic writes) FAIL while
   plain file writes usually succeed (probed: plain 5/5 OK, ref 0/3).
   No commit is attempted during this run; the coordinator commits
   after the flap clears. The anchor rule above is what keeps the
   judged corpora valid despite the uncommitted instrument.

## Files

- Prereg: `evidence/2026-11-21/sim-profilegate-b-prereg.md` (this file)
- Lever: `src/js/villager-brain.js`, `src/js/win-plan.js` (profile check
  only, `[needs-eyes]` on the commit)
- Instrument: `scripts/profilegate4-driver-20261121.js`,
  `scripts/analyze-profilegate4-b.js`,
  `scripts/profilegate4-drift-check.js`,
  `scripts/build-profilegate4-panels-20261121.js`,
  `scripts/test-profilegate4-b.js`
- Corpora: `evidence/2026-11-21/perseed-profilegate4-b-off/`,
  `perseed-profilegate4-b-on/`, `perseed-profilegate4-b-rec/`,
  `perseed-profilegate4-b-rec0/` (8 files each)
- Analysis: `evidence/2026-11-21/profilegate4-b-analysis.json`
- Panel: `evidence/2026-11-21/profilegate4-b-panel.{json,md}` (+ before/after `.json.gz`)
- Evidence: `evidence/2026-11-21/sim-profilegate-b.md`
- Disposition if NO-GO: revert the `src/` change in this tree before
  reporting (leave the instrument + evidence).
