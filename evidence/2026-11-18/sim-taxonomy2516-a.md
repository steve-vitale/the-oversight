# sim-taxonomy2516-a — EVIDENCE (TAXONOMY RE-FREEZE GO)

**Arm:** sim-taxonomy2516-a · **Loop B run:** fleshout-20261118T0647Z · **Axis:** scale-onramp
**Type:** VERIFICATION / TOOLING (scripts-only; no src/js change, no game change, no balanced panel, no seed band spent, no new sims).
**Branch:** `sim-taxonomy2516-a` · **Worktree:** `~/workspace/worktrees/sim-taxonomy2516-a`
**Base at arm start:** `03c53bf6e` · **Prereg:** this file's header (written before any test edit).
**Proof test:** `scripts/test-seedattach-a.js` — baseline **74 passed, 4 failed** (the 4 known stale statics from finding #2516 / backlog #2527); post-fix result below.
**Verdict: TBD — see Verdict section.**

## Prereg (frozen before any edit)

**Primary metric:** `scripts/test-seedattach-a.js` green with corrected anchors.

**GO bars (all must hold):**
1. All anchor checks pass on the re-read counts (hunt-entry sites per file, target-copy sites per file, policy shas).
2. Buckets/subs byte-identical on the published corpora before vs after this change (in-memory `classifySeed` snapshot diff, both legs, 16 seeds).
3. No past verdict moves: the seedattach DIAG-GO verdict, the #2523 recorder-fix verdict, and the closeKind tallies stand unchanged.
4. Determinism legs D1/D2 still pass (identity drift only — no behavior break).

**Horizon / seeds / policies:** no new sims. The only live runs are the proof test's own D1/D2 legs (60d, seed 100871, competent policy) plus its 5d live-run shape checks — the same runs the baseline already executed.

**What counts as a real finding (not a re-freeze):** if the re-read shows a cplan2 (second-companion) plan is MISCLASSIFIED by the taxonomy buckets — wrong bucket, not merely unanchored — the classifier gets a fix with proof, and the finding is filed in the backlog with numbers. A re-read that confirms the buckets already cover the cplan2 path is a re-freeze, not a finding.

**Expected net src/js diff:** zero.

## The stale anchor, in plain words

The seedattach taxonomy — the code-read the bucket definitions rest on
(`evidence/2026-11-15/sim-seedattach-a-prereg.md`, "Code facts the
taxonomy is built on") — said a plan enters the hunt stage in exactly
four places: the inviter's plan and the companion's plan, in
`win-plan.js` and again in the `villager-brain.js` mirror. A sibling
landing (sim-vetreengage-a, `46426eb2e`: wave-4 parties launch as
trios) added a third write in each file: the second companion's plan
also enters hunt (`win-plan.js:657`, `villager-brain.js:1176`), with
the inviter's target copied onto it. A plan can now reach hunt
through a door the taxonomy never names — so the anchor count the
proof test froze ("exactly 2") fails, even though the buckets
themselves never read the count. In the same run the competent-policy
identity check drifted (`74a890f0844e` → `df9b7dff4de4`, journey
landings r127/r128/r140); D1/D2 still pass, so that is identity
drift, not a behavior break. This arm re-reads every hunt-entry
site, decides whether the cplan2 path is a third entry shape the
buckets already cover or a misclassification, and re-freezes the
anchors on the re-read counts — it does not silently bump a number.

## Re-read: all six hunt-entry sites (read from src, this arm)

Re-read on this tree (`src/js/win-plan.js`, `src/js/villager-brain.js`,
base `03c53bf6e`). The third write in each file is the vetreengage
trio second-companion write (sim-vetreengage-a, `46426eb2e`,
env-gated: `VETREENGAGE=1` in both files).

### win-plan.js — `launchParty()` (3 writes)

| Line | Plan | What happens |
| --- | --- | --- |
| 646 | inviter (`plan`) | `plan.stage = 'hunt'; plan.party = launched.slice()` |
| 651 | first companion (`cplan`) | `cplan.stage = 'hunt'`; party `[vid, ...launched minus cid]`; **target + node copied** (`cplan.target = plan.target; cplan.node = plan.node`) |
| 657 | second companion (`cplan2`) | `cplan2.stage = 'hunt'`; party `[vid, cid]`; **target + node copied** (`cplan2.target = plan.target; cplan2.node = plan.node`); only when `launched.length > 1` (a trio actually launched) and `vetreengageOn() && needWave >= 4` |

### villager-brain.js — brain mirror (3 writes)

| Line | Plan | What happens |
| --- | --- | --- |
| 1170 | inviter (`plan2`) | `plan2.stage = 'hunt'; plan2.party = launched.slice()` |
| 1172 | first companion (`cplan`) | `cplan.stage = 'hunt'`; party `[vid, ...]`; **no target copy** — only if the companion actually launched |
| 1176–1177 | second companion (`cplan2`) | `cplan2.stage = 'hunt'`; party `[vid, c.companion]`; **target + node copied** (`cplan2.target = plan2 ? plan2.target : null`); only when `launched.length > 1` (companion2's expedition actually started) and `VETREENGAGE=1` |

### The corrected claims (what the old anchor got wrong)

1. **Hunt entries: 6, not 4.** Three per file. The frozen prereg
   fact ("stage `hunt` is set in EXACTLY FOUR places") is superseded
   by the six sites above.
2. **Target writes: 4 statements, not 2.** `win-plan.js` carries
   three `.target =` writes (seed `:430` `plan.target = mdef.id ||
   null`; first-companion copy `:653`; second-companion copy `:657`);
   `villager-brain.js` carries one (`:1177`, second-companion copy).
   The frozen "written in EXACTLY TWO places" counted mechanisms
   (seed + companion copy); the copy mechanism now has two sites
   per file-path and one of them lives in the brain.
3. **The brain-mirror target asymmetry narrowed.** The old anchor
   said "the brain mirror does NOT copy the target" — that is now
   true only for the FIRST companion. The brain DOES copy target +
   node to the SECOND companion (`:1177`). The re-frozen anchor
   says exactly that, per companion.
4. **No target-clearing write anywhere.** Still zero `.target =
   null` assignments in either file — the seeded-then-lost
   expectation (0 in the corpus) is untouched by the trio writes.
   Note: the seed write at `win-plan.js:430` now reads
   `plan.target = mdef.id || null` (was `plan.target = mdef.id` in
   the prereg's quote; the `|| null` arrived with the gate-lever
   lineage `957ad644a` / revert `1c9ba8439`). No taxonomy impact: a
   falsy `mdef.id` yields null rather than undefined, and the
   gear/party early-return gate still restricts seeding.

### What the driver records for a trio launch (read from the driver)

`scripts/seedattach-driver-20261115.js` records ONE
`seedattachLaunches` row per launch, naming only the FIRST
companion (`plan.party[0]` on the win-plan path,
`commit.companion` on the brain path). `companion2` appears only
in the `v4departs` row, never in a seedattach launch row. A second
companion therefore has NO launch event naming them — the
classifier can only reach a cplan2 plan through the census-only
fallback or the census/bounce scans. The re-read below tests
exactly those paths.

## The re-read's answer: third entry shape, already covered — NO misclassification

A cplan2 plan enters hunt as a companion copy of the inviter's
target, which is precisely the frozen bucket 1
(`companion-inherited`) provenance — "the plan entered `hunt` as a
launch companion copy with the inviter's target null" — and the
bucket's census-only clause already names its shape: "first census
sighting at stage `hunt` with party `[inviter]` and the inviter's
plan target null that day." A cplan2 census row carries party
`[inviter, first-companion]`, so `party[0]` is still the inviter.
The six new fixtures in `scripts/test-seedattach-a.js` §2f prove
each cplan2 shape lands where the frozen taxonomy already puts it:

| Fixture | Shape | Result |
| --- | --- | --- |
| 2516-A | lazy-created 2nd companion, win-plan path (no launch row names them) | `companion-inherited:census-only:inviter-v0` |
| 2516-B | same, brain path | `companion-inherited:census-only:inviter-v0` (path-independent) |
| 2516-C | pre-existing haven-born 2nd companion (null predates the launch) | `haven-born-never-seeded:created-by-read` — the same precedence the frozen taxonomy already applies to a pre-existing first companion |
| 2516-D | pre-existing SEEDED 2nd companion, target overwritten to null by the cplan2 copy | `seeded-then-lost:target:strike:lost-day:8` — the census scan finds the loss with no launch event |
| 2516-E | 2nd companion of a SEEDED inviter (copy carries a non-null target) | 0 instances; bounce counts as `bouncedTargeted=1` — never enters the null-hunt population |
| 2516-F | FIRST companion of a trio launch (party of 2, launch row present) | `companion-inherited:winplan:inviter-v0` — party length never enters the launch-path rule |

No bucket, no sub, no precedence rule changes. The classifier is
untouched (`scripts/analyze-seedattach-a.js` diff: empty). The
only change is the test: re-frozen anchors + the six fixtures that
pin the cplan2 shapes. No new backlog finding: there is nothing to
file, because the re-read found coverage, not a misclassification.

Corpus check: the published corpora contain ZERO trio launches
(max census party length 1 on both legs; 0 trio departs in 171 +
171 `v4departs` rows) — `VETREENGAGE` defaults OFF and the corpus
runs never set it — so no cplan2 plan exists anywhere in the frozen
corpora. The byte-identical verdict below is therefore doubly
supported: by the in-memory snapshot diff, and by the corpora
containing no instance the change could move.

## Before / after — proof

### Old-code-fails control (baseline, before any edit)

`node scripts/test-seedattach-a.js` on the unedited tree:
**74 passed, 4 failed** — exactly the 4 known stale statics, and
nothing else:

- `anchor: exactly 2 hunt entries in win-plan.js (inviter + companion) — got 3`
- `anchor: exactly 2 hunt entries in villager-brain.js (mirror inviter + companion) — got 3`
- `competent policy sha is 74a890f0844e — got df9b7dff4de4`
- `live run policy is competent, sha 74a890f0844e — got competent/df9b7dff4de4`

D1/D2 passed on the baseline run (identity drift only).

### Post-fix run

`node scripts/test-seedattach-a.js`: **89 passed, 0 failed**
(78 baseline checks + 11 new: 4 net-new anchors + 7 §2f fixture
checks). All re-frozen anchors green, all six cplan2 fixtures
green, D1 repeatability and D2 wrap neutrality green at 60d on
seed 100871, both LEG policies load with their re-frozen shas
(competent `df9b7dff4de4`, tableseat-nowait `a11a1abc672e`
unchanged).

### Buckets/subs byte-identical on the published corpora

In-memory `classifySeed` snapshot over both frozen corpus dirs
(8 + 8 seeds), taken before the edit (`/tmp/taxonomy2516-before.json`)
and after (`/tmp/taxonomy2516-after.json`): `diff` clean —
**byte-identical** on every seed's `byBucket`, `bySub`, and every
instance's `bucket`/`sub`/`closeKind`. The test's own §2e frozen-corpus
diff (20 closes, exactly the 4 #2523 flips, buckets/subs identical
to the frozen JSON) also still passes inside the 89.

### Competent-policy sha re-freeze (identity drift only)

`scripts/policies/competent.js` sha `74a890f0844e` →
`df9b7dff4de4`; changed by journey landings r127 (`124a99389`,
`bb58c1f66`), r128 (`87f00547d`), r140 (`6436b14c8`). Verified
by re-running D1/D2 on the new policy: identical trajectories
recorder ON vs OFF, so the policy change carries no behavior break
for this instrument. `tableseat-nowait.js` unchanged
(`a11a1abc672e`).

## Village assessment (plain words)

Nothing about the villages changed — only the filing cabinet's
labels, again. A third door into the hunt now exists (the second
companion of a wave-4 trio), and the record-keeping already knew
how to file what comes through it: a villager pulled into a hunt
as a second companion is filed as a companion's plan, a villager
whose own old plan got pulled along is filed by what that plan
was, and a villager whose plan lost its named beast when the copy
overwrote it is filed as a plan that lost its target. The villages,
the fights, the launches, the wall — all exactly as measured
before.

Sense check (SENSE-TESTING LAW — the classifier's own sense cases
from the frozen analysis, read not counted): seed 100874, Carlos
Diaz, day 63, `haven-born-never-seeded:heard-at-fire` — "Carlos saw
The Audit in time and gave it room." A rumor-born plan with no
named beast meets the beast and gives it room; coherent. Seed
100876, Diana Osei, day 46, `companion-inherited:brain` — she walks
straight into The Influencer, fights at range with a bow (two shots,
30 and 29 damage), her Rage fires ("eyes go red"), her gear absorbs
28 of the return hit. A companion pulled into a hunt fights like a
companion, blow by blow. Both sense cases read like people, not
counters. No robotic/static flag in this arm's area.

## Metric review

- GO bars: (1) all anchor checks pass on the re-read counts —
  HOLD (89/0). (2) buckets/subs byte-identical on the published
  corpora — HOLD (snapshot diff clean). (3) no past verdict moves
  — HOLD (seedattach DIAG-GO and #2523 recorder-fix verdicts rest
  on buckets/subs/closeKind, all unchanged; analyzer untouched).
  (4) D1/D2 still pass — HOLD.
- **No panel — by design.** A test-only re-freeze changes no game
  behavior and no sim output; the balanced panel measures game
  change, so there is nothing to panel. The "before/after" here is
  the proof test itself (74/4 → 89/0) plus the corpus snapshot diff.
- **No new sims, no seed band spent.** The only live runs are the
  proof test's own D1/D2 legs and 5d shape checks.
- The frozen analysis JSON (`evidence/2026-11-15/seedattach-a-analysis.json`)
  is untouched and remains the before-oracle.

## Verdict: TAXONOMY RE-FREEZE GO

The anchor counts are re-frozen on the re-read (3 hunt entries per
file, 4 `.target` writes across the two files, competent sha
`df9b7dff4de4`); the cplan2 path is documented as a third entry
shape the frozen buckets already cover; the six §2f fixtures pin
that coverage; buckets/subs are byte-identical on the published
corpora; no past verdict moves. Net `src/` diff: zero.

## Disposition: FIX — nothing to revert

Test-only. No src/ change, no game change, no lever, no panel, no
sims, no seed band. Backlog #2527 (finding #2516) moves
`claimed` → `fixed` on landing. Commits: TBD by closeout.

## Files

- Evidence: `evidence/2026-11-18/sim-taxonomy2516-a.md` (this file)
- Proof test: `scripts/test-seedattach-a.js` (89 passed / 0 failed)
- Analyzer (untouched): `scripts/analyze-seedattach-a.js`
- Corpora read (frozen, unchanged): `evidence/2026-11-15/perseed-seedattach-a-competent/`, `perseed-seedattach-a-tableseat-nowait/`
- Before-oracle (frozen, unchanged): `evidence/2026-11-15/seedattach-a-analysis.json`
- Snapshots (scratch, not committed): `/tmp/taxonomy2516-before.json`, `/tmp/taxonomy2516-after.json`, `/tmp/taxonomy2516-baseline.log`, `/tmp/taxonomy2516-after.log`
