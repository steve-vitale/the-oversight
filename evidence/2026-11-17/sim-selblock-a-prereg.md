# sim-selblock-a — PREREG (frozen before any sims)

**Arm:** sim-selblock-a · **Loop A run:** fleshout-20261117T2315Z · **Axis:** scale-onramp
**Type:** DIAG (classification only). No game change lands from this arm.
**Branch:** `sim-selblock-a` · **Worktree:** `~/workspace/worktrees/sim-selblock-a`
**Base at arm start:** `77a37fe91` (branch tip; sim-packhunt-rec-b evidence).
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
— verified against the file in this tree before writing this prereg.
**Band:** seeds 103411–103418 (8 seeds) · **Horizon:** 150d death-aware.
**Prereg frozen:** before any sim runs in this arm (corpus reads only before this line).

## The question (finding #2498)

sim-profilegate-b widened the companion profile gate and filled the pool
(empty dawns 81/87 → 3/99), launches rose 3 → 7 instances, but 12
instances now die at `selected-blocked` (OFF: 0) — a party is selected at
dawn and then blocked from departing. This arm says WHAT blocks a selected
party, instance by instance. It classifies; it does not fix. Any fix is a
later arm (and a later finding, if the classification shows the block is a
defect rather than an honest gate).

## What was read first (do not re-measure what they answered)

- `evidence/2026-11-17/sim-profilegate-b.md` + prereg — the source numbers.
  ON leg funnel buckets: launched-killed 0, launched-fought-no-kill 2,
  launched-no-meeting 5, **selected-blocked 12**, plan-churned-before-dawn 3,
  candidate-not-bid 3, unknown 0. OFF leg: selected-blocked 0. The
  profilegate-b analysis already splits the 12 into named sub-reasons
  (`profilegate-b-analysis.json`, `on.byFunnelSub`):
  `inviter-range-0` 6, `no-tick-after-commit` 3, `inviter-sick` 1,
  `inviter-hurt` 1, `companion-not-started:sick` 1. This arm VERIFIES that
  split instance by instance against the backing depart/skip rows, names
  the holder/companion/profile behind each, and checks whether any of the
  five sub-reasons is a mislabel (e.g. a `range-0` that is really the
  companion, a `no-tick-after-commit` that really has a backing skip row).
- `evidence/2026-11-17/sim-scale-onramp-round-2025.md` — coordinator
  closeout: #2498 filed, next blank #1 is this classification.
- `evidence/2026-11-17/sim-launchfunnel-a.md` — the funnel definitions
  (`scripts/analyze-launchdef-a.js classifySeed`, frozen precedence:
  launched > target-killed > selected-blocked > bid-not-selected >
  plan-churned-before-dawn > candidate-not-bid > unknown). A
  `selected-blocked` instance is one whose FIRST blocked selection
  resolves to `blocked` (depart row `hold` / `normal` + skip row /
  skip row alone / no row at all). The classification in this arm uses
  that same first-blocked-resolution rule, and the evidence table ALSO
  lists every blocked selection per instance so a later block is not
  hidden by the first.

## Canon read

- `docs/CANON.md` (manifest), `docs/MONSTER-WAVES.md` (wave law),
  `docs/PARTY.md` (party unlock day 7, cap 3→4→5), `docs/VILLAGER-BRAIN.md`
  (one brain, one scorer; departure honors the dawn commitment).
- **Canon gap, recorded not invented:** no canon doc covers expedition
  companion eligibility, the depart-gate block reasons, or the
  selected-blocked stage. The profilegate-b prereg already recorded the
  companion-eligibility gap. The block reasons below are grounded in the
  recorder code (`scripts/profilegate-driver-20261117.js`
  `deriveLaunchBlock`: `sick` / `range-0` (`npcMaxDist < 1`) /
  `hurt-no-medicine-no-healer` (health < 70, no usable medicine, no camp
  healer)) and in the skip recorder's reasons (`away-on-expedition`,
  `night`, `not-at-haven`, `danger-gate`, `engaged`,
  `away-as-companion-this-tick`, `other`), not in canon.
- Known mechanism, read from code not assumed: homebodies have
  `npcMaxDist` 0 (`src/js/villager-agency.js:349-352`: explorer 6,
  wanderer 3, forager 1, homebody 0), so a homebody HOLDER can be bid at
  dawn but cannot launch (`range-0`) — and a homebody COMPANION can be
  picked at dawn but cannot start (`companion-not-started:range-0` would
  be the companion-side form; the corpus shows whether it occurs).

## Band freshness (verified before this prereg)

Intentional same-band reuse of 103411–103418 so the classification is
directly comparable with profilegate-b (same villages, same dawns, same
instances — this is a deliberate frozen-band re-measurement, not a fresh
band). Search scope: `grep -rln "103411" evidence/*/sim-*-prereg.md`.
Result: the band is named by `sim-launchfunnel-a-prereg.md`,
`sim-part2night-a-prereg.md`, `sim-part2target-a-prereg.md` (as a
reference band; its own bands are 103421–103428 / 103431–103438),
`sim-poolshape-a-prereg.md`, `sim-profilegate-b-prereg.md`, and
`sim-fightallycap-confirm-b-prereg.md` (names it among several bands).
**No other prereg names a conflicting use. Reuse is by design, recorded
here.** (The local seed-band rule reserves a band against *new*
measurement; a matched re-measurement of the priced band is the point.)

## Corpus-first decision (frozen)

The profilegate-b ON corpus (`evidence/2026-11-17/perseed-profilegate-b-on/`,
8 files) already records, for every dawn-bid depart, the depart-gate
state: `vidExped` / `companionExped`, `vidBlock` / `companionBlock`
(`sick` / `range-0` / `hurt-no-medicine-no-healer` / `unknown`), and the
`launchdefSkips` rows carry the first-failing depart-gate check
(`reason` + `raw` state: profile, node, haven, exped, away, night,
engaged, danger, dead). **Therefore: classify from the corpus. No
re-run is needed for the classification itself.** The PROFILEGATE lever
is NOT re-applied in this arm and no src/ change is made at any point
(net src/ diff vs base must be zero at the end — trivially, no src/
file is touched). If — and only if — the corpus inspection below shows
a selected-blocked instance whose reason cannot be named from the
corpus, the arm adds a skip-reason capture to the recorder and re-runs
the frozen band with the lever re-applied in-tree only (env-gated,
reverted before commit), per the brief step 3. That contingency is NOT
triggered unless the corpus check fails it in writing in the evidence.

## Instrument (reuse, do not rebuild)

- **Classifier:** `scripts/analyze-profilegate-b.js` `funnelForSeed`
  (which calls `scripts/analyze-launchdef-a.js` `classifySeed` with
  `launchDefinition: 'any-commit'`) run over the EXISTING ON corpus.
  No analyzer code changes. The extraction is a throwaway `/tmp`
  script that calls the analyzer's exported `funnelForSeed` and joins
  each selected-blocked instance to its backing `dawnbidDeparts` /
  `launchdefSkips` rows and to holder/companion profiles from the
  nearest `companionPool` member rows — the join is a read, not a
  re-classification.
- **D-checks (instrument validity, run in this arm):**
  - **D1 repeatability:** same tip, seed 103411, 60d, recorder ON,
    PROFILEGATE unset (OFF behavior — no lever exists in this tree),
    run twice; trajectories identical.
  - **D2 wrap neutrality:** same tip, seed 103411, 60d, recorder ON vs
    recorder OFF; trajectories identical (0 divergences). Full-band
    form is NOT re-run (that would need the lever); the 60d seed-103411
    form is the frozen profilegate-b D2 shape.
  - **OFF-leg replication (exact):** re-run `analyze-profilegate-b.js`
    over the EXISTING OFF corpus
    (`evidence/2026-11-17/perseed-profilegate-b-off/`) and compare
    `byFunnel`, `byFunnelSub`, pool rows (87 rows, 81 empty, per-seed
    0/0/25/0/37/25/0/0) and wall numbers against
    `evidence/2026-11-17/profilegate-b-analysis.json`. Must match
    exactly; any mismatch is investigated, not waved through.
  - **Proof test:** `scripts/test-selblock-a.js` — synthetic
    selected-blocked instances per bucket (see below) + the
    OFF-replication check (analyzer over the OFF corpus equals the
    frozen analysis JSON on the funnel + pool-shape fields). Must be
    green.
- **Panel:** no balance panel — this is a DIAG, not a lever; there is
  no before/after to compare. The before/after numbers in the evidence
  are the profilegate-b OFF vs ON numbers quoted from its frozen
  analysis, not re-measured here.

## Primary metric (frozen)

**Classified share of the 12 selected-blocked instances (ON leg,
frozen band) into named reasons** — where "named" means the instance's
first blocked resolution carries a reason from the frozen bucket set
below AND the backing depart/skip row(s) in the corpus support it
(holder/companion/profile named in the evidence table).

## Candidate buckets (frozen — the classifier's own vocabulary)

From `classifySeed` / `mapVidBlock` / the skip recorder, in the order the
classifier resolves them:

| Reason (funnelSub) | Mechanism it names |
| --- | --- |
| `inviter-sick` | depart `hold`; holder sick at the tick |
| `inviter-range-0` | depart `hold`; holder `npcMaxDist < 1` (homebody holder) |
| `inviter-hurt` | depart `hold`; holder health < 70, no usable medicine, no camp healer |
| `companion-not-started:<block>` | depart `launch` for holder, companion never started; `<block>` is the companion's `deriveLaunchBlock` (`sick` / `range-0` / `hurt-no-medicine-no-healer` / `unknown`) |
| `away-on-expedition` / `night` / `not-at-haven` / `danger-gate` / `engaged` / `away-as-companion-this-tick` | skip-row reason (depart `normal` or no depart row) |
| `commit-overwritten-midday:<action>` | commit replaced mid-day before any tick executed it |
| `no-tick-after-commit` | last commit at part-2; no tick left that day to execute it |
| `selected-not-executed` | commit at part-0/1 with no depart or skip row at all |
| `inviter-exped-failed-unknown` | **counts as UNKNOWN** — depart `hold` with no `vidBlock`, or `normal` with no skip row |

## GO bars (frozen — a miss is NO-GO, never re-scored)

**DIAG GO** iff ALL of:
1. **Classification complete:** ≥ 10 of the 12 selected-blocked
   instances classified into a named reason (funnelSub not
   `inviter-exped-failed-unknown` and bucket not `unknown`), **unknown
   ≤ 2**. The profilegate-b analysis already reports 12/12 named
   (6 + 3 + 1 + 1 + 1); this bar is met only if the per-instance
   verification in the evidence confirms the split — a sub-reason
   that fails its backing-row check counts as unknown, not named.
2. **Instrument D-checks green:** D1 repeatability green, D2 wrap
   neutrality green (60d, seed 103411), OFF-leg replication exact vs
   the profilegate-b OFF corpus (funnel + pool-shape + wall fields).
3. **Proof test green:** `scripts/test-selblock-a.js` passes all
   checks (synthetic instances per bucket + the unknown bucket +
   OFF-replication check).

A miss on any bar is DIAG NO-GO. The verdict judges the
CLASSIFICATION, not the game: a complete classification that shows the
block is mostly an honest gate (e.g. homebody holders) is still GO.

## Horizon (why 150d death-aware, same as profilegate-b)

The instances being classified ARE the profilegate-b ON-leg instances,
measured on 150d death-aware horizons. Any other horizon would
re-define the instance set and break comparability with the frozen
analysis. Death-aware: dead villages stop simulating (+10d tail max),
per MEASUREMENT.md §§9–12 — the same rule profilegate-b used.

## What the evidence must contain

- Before/after numbers on identical seeds (quoted from the frozen
  profilegate-b analysis: OFF vs ON funnel buckets, pool fill, launches).
- Per-instance classification table: seed / day / holder / companion /
  target / commit kind / reason / backing row (depart result +
  vidBlock/companionBlock, or skip reason) / holder + companion
  profiles. All 12 rows, no exceptions.
- Per-bucket totals with the mechanism each names, in plain words.
- Village assessment in plain words (what the village looked like,
  who was blocked and why it matters for the scale wall).
- Sense-testing note (transcripts: does anything say why a picked
  party stayed home? profilegate-b already noted the silence around
  homebody Jesse Cortez — confirm or correct from this corpus).
- Metric review section.
- The #2498 claim/fix (or "no fix — classification only") for the
  coordinator to file; this arm does NOT edit
  `hidden_files/sim-findings.md` (outside the repo).

## Disposition

DIAG arm: nothing to revert (no src/ change, no lever). Commits are
instrument + evidence only: this prereg, `scripts/test-selblock-a.js`,
`evidence/2026-11-17/sim-selblock-a.md`, and the extraction output if
it is kept as a script (`scripts/analyze-selblock-a.js` — only if the
extraction is worth keeping; otherwise the table lives in the evidence
alone). Net src/ diff vs base: zero (verified with `git diff` before
reporting). Do NOT push, do NOT bump, do NOT merge — the coordinator
lands the work.
