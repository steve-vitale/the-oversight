# sim-poolfirstfail-refreeze-b — DIAG PREREG, the poolfirstfail re-freeze + re-judge (frozen before any judged sim)

**Arm:** sim-poolfirstfail-refreeze-b, DIAG instrument, re-freeze + re-judge ·
**Loop B run:** fleshout-loop-b-20261121T1530Z (axis: winnability chain) ·
**Branch:** `sim-poolfirstfail-refreeze-b` · **Worktree:**
`~/workspace/worktrees/sim-poolfirstfail-refreeze-b`
**Base at arm start:** worktree HEAD `3e13d63d8` (journey social life
r261 adoption closeout). Master has since moved to `df4867134` (an
evidence-only journey commit) — do NOT rebase; the coordinator
rebases at landing. The re-freeze does not depend on the master tip:
the judged leg runs the frozen base's `src/` (see §"The anchor fix"
in the re-anchor prereg), so the moving master cannot move the
substrate.
**Frozen:** 2026-11-21 ~15:59 UTC, BEFORE any judged sim.
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
(first 12: `1884c8852d38` — verified live on this worktree before
freezing).
**Horizon:** 150d, death-aware. **Band:** 106731–106738 (8 seeds,
RE-RECORDED — same band as the original arm, see below).

## The question (the 1430Z round record's next blank #1, and what this arm re-judges)

sim-poolfirstfail-reanchor-b (`evidence/2026-11-21/sim-poolfirstfail-reanchor-b.md`,
DIAG-NO-GO on bar (c) only) proved the re-anchor works — §0
live-positive passes, CLI guard + per-`oneRun()` sentinel guard
verified live, §4 live 150d run reproduces the original arm's
numbers exactly (378 holder-state rows, 23 pool rows, 148 census
rows on seed 106731), D1/D2 pass, Leg R 10/10 — but its proof test
went 46 passed / 2 failed and no judged leg ran. Both failures are
one root cause: `EXPECTED.anchor12` is `'df40fced1'` (**9
characters**) while the inherited analyzer comparison slices 12
(`(anchorCommit).slice(0, 12)` — `scripts/analyze-poolfirstfail-reanchor-b.js:56`
and `:652`). A corpus stamped with the correct full frozen base
slices to `'df40fced12a0'`, which never equals `'df40fced1'`. The
1430Z round record (Arm 3, coordinator decision) authorizes the
correction as Option A: re-freeze `EXPECTED.anchor12` to
`'df40fced12a0'` (the true 12-char prefix of the frozen base), then
re-run this arm's procedure (proof + judged leg + analyzer + panel)
with the instrument already built. This arm is that correction —
a re-freeze, NOT a re-roll: the bars stay frozen, only the broken
anchor comparison is fixed.

## The one authorized change

`EXPECTED.anchor12`: `'df40fced1'` → `'df40fced12a0'`. The
comparison stays `slice(0, 12)`. The change is applied consistently
to every anchor assertion that states the value:

- `scripts/analyze-poolfirstfail-refreeze-b.js`: `EXPECTED.anchor12`
  (`:56`) and the §I selftest static check (`~line 1757`, which
  asserts the value).
- `scripts/test-poolfirstfail-refreeze-b.js`: the §0 static
  assertion (`~lines 55-56`, which asserts the value).
- `scripts/poolfirstfail-driver-refreeze-b.js`: `FROZEN_BASE12`
  (`'df40fced1'` → `'df40fced12a0'`) — the constant is NAMED for 12
  characters and holds the same 9-char value; updating it makes the
  name truthful. It is used only in a stop message and an export,
  never in any comparison.

No other behavioral change vs the landed `-reanchor-b` files. Arm/run
names, OUTDIR `perseed-poolfirstfail-refreeze-b-106731-106738`,
`RUN=poolfirstfail-refreeze-b`, stop-message prefix
`POOLFIRSTFAIL-REFREEZE`, driver-filename strings, and the §0/§1
prereg-path checks are renamed consistently to the new `-refreeze-b`
files and this prereg. Do NOT modify the landed `-reanchor-b` or `-b`
instrument files. Do NOT touch `src/js` at all. Do NOT touch
`villager-brain.js` / `win-plan.js` / `fieldFights.js`.

**Post-hoc amendment is forbidden.** `EXPECTED.anchor12` is
`'df40fced12a0'` in this prereg and in the refreeze analyzer. It may
not be amended after any judged leg to match whatever the driver
stamped. If the re-recorded corpora fail the anchor check, the
verdict is NO-GO and the failure is reported, never re-scored.

## Base-identity check (verified before freezing — MEASURED, not inherited)

The frozen base is `df40fced12a086c28fbe53d3a9696abd02f5b905`
(`df40fced1`, full hash verified via `git rev-parse df40fced1`
before freezing). The WHOLE `src/` delta `df40fced1 → HEAD`
(`3e13d63d8`) is exactly SIX files, not the four the re-anchor
prereg recorded — the profilegate lever (`84e57fcc3`,
sim-profilegate-b, landed in the 1430Z round AFTER the re-anchor
prereg froze) added `src/js/villager-brain.js` (+26) and
`src/js/win-plan.js` (+26):

- The four known files, unchanged from the re-anchor record:
  `src/js/build.js` (version stamp only); `src/js/conversation.js` +
  `src/js/convo-dialogue.js` (M12-CAP favor-requirements circles
  latch, journey-succession r262 — conversation dialogue only);
  `src/js/fieldFights.js` (the #2634 downedtwice fix).
- The two new files, exactly the PROFILEGATE4 lever and nothing
  else: `profilegate4On()` / `profilegate4OpenFor()` helpers plus
  one gate-line change in `findCompanion` in each file
  (`if (!profilegate4OpenFor(self, vid) && prof !== 'wanderer' &&
  prof !== 'explorer') continue;`). The lever is env-gated
  (`PROFILEGATE4=1`, unset in this arm's env) and scoped to
  holders whose plan targets wave 4+.
- Sentinel guard scope: the driver's per-`oneRun()` sentinel guard
  checks the four known files' frozen blob hashes
  (`build.js 106cc81d…`, `conversation.js f3cc1094…`,
  `convo-dialogue.js b944cd18…`, `fieldFights.js 30f4a059…`) —
  verified live before freezing: each still equals
  `git rev-parse df40fced1:<path>`. The guard does NOT cover
  `villager-brain.js` / `win-plan.js`; the CLI guard (full
  `git diff --quiet df40fced1 -- src/`) and the run procedure's
  restore + verify steps cover the whole tree. Under the frozen
  `src/` checkout the on-disk `src/` IS the frozen base's `src/`
  (CLI guard proves it), so the judged leg's code is byte-identical
  to the original arm's code regardless of HEAD.
- Consequence for the inherited §1 check, recorded here BEFORE the
  proof test runs: the test's `§1 pool-path files identical between
  frozen base df40fced1 and HEAD` check (`git diff df40fced1 HEAD
  -- <pool-path files>` empty) is FALSE at this HEAD — the diff is
  non-empty (the PROFILEGATE4 lever above). The proof gate is run
  verbatim anyway, and the brief's stop rule applies: if anything
  beyond the two anchor failures fails, the run STOPS and reports
  instead of proceeding to the judged leg. The sibling §1 check
  (no added/removed pool-filter line matching
  `findCompanion|npcRangeProfile|npcRangingApt|RANGY_OCC`) was
  verified before freezing to still PASS (no +/- line in the
  brain/win-plan diff matches the regex — the changed gate line
  carries none of those tokens). The brief's "known 4-file delta"
  wording in the restore-verify step predates the profilegate
  landing and is corrected here by measurement: restore verifies
  against the SIX-file delta listed above.
- Policy sha verified live on this worktree: `1884c8852d38`.
- Worktree `git status --short` empty at arm start (verified
  before freezing).

## Band (re-recorded, same band — a re-freeze, not a new band)

Band 106731–106738 is RE-USED deliberately, per the coordinator
call (round record §Arm 3 / next blank #1): the next run re-records
the SAME frozen band, then re-judges. This is not a fresh-band
assignment, so the fresh-band rule does not apply; the re-use is the
point (the content is deterministic — the original proof test's D1
leg proves identical corpora on repeat runs under identical code —
so the re-record must reproduce the decomposition, and any
deviation is a measured finding, not a re-roll). The original
corpora (`perseed-poolfirstfail-b-106731-106738/`) are PRESERVED
read-only for comparison; the re-record writes a NEW dir
(`perseed-poolfirstfail-refreeze-b-106731-106738/`).

## Substrate (env flags — identical to the original arm, carried exactly)

`SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 ALLYSLOT3=1 LAUNCHSURVIVE=1`,
competent verbatim, 150d death-aware, one leg (recorder ON),
`MODE=vre`. FLEEREPAIR2=1 is carried: the original prereg freezes
SEVEN flags including FLEEREPAIR2=1, and the driver hard-requires
it (exit 2 without it). ALLYSLOT3 is NOT landed on the frozen base
either (verified: the driver asserts the ENV flag is set, asserts
src ABSENCE, and records `allyslot3InSrc: false` on every corpus —
same as the original arm). **ZERO `src/js` changes in this arm.**

## Instrument (new -refreeze-b files; original -b and -reanchor-b files untouched)

- `scripts/poolfirstfail-driver-refreeze-b.js` — a copy of the
  landed `scripts/poolfirstfail-driver-reanchor-b.js` with ONLY
  these changes: header comment, arm/run `poolfirstfail-refreeze-b`
  (out object + file names
  `poolfirstfail-refreeze-b-s<seed>`), stop-message prefix
  `POOLFIRSTFAIL-REFREEZE`, driver-filename strings in
  `firstCallerFrame`/`fightOrigin` updated to the new file, the
  usage line re-seeded (same band, new OUTDIR/RUN), PLUS the
  authorized anchor change (`FROZEN_BASE12` → `'df40fced12a0'`).
  The anchor fix itself (`FROZEN_BASE` constant + CLI guard +
  sentinel guard, exported as `FROZEN_BASE`/`FROZEN_BASE12`) is
  inherited unchanged. All recorder logic (pool-first-fail
  extension, census, `rangeScoreOf`, substrate assertions) is
  byte-identical in behavior to the re-anchor driver.
- `scripts/analyze-poolfirstfail-refreeze-b.js` — a copy of
  `scripts/analyze-poolfirstfail-reanchor-b.js` with ONLY these
  changes: arm/run `poolfirstfail-refreeze-b`, `BAND_DIR`
  `perseed-poolfirstfail-refreeze-b-106731-106738`, output
  `evidence/2026-11-21/poolfirstfail-refreeze-b-analysis.json`,
  the §F/§H selftest synthetic docs' arm/run updated to the new
  arm, PLUS the authorized anchor change (`EXPECTED.anchor12` →
  `'df40fced12a0'`; §I static check updated consistently).
  Seeds stay 106731–106738; flags, policy sha,
  `allyslot3InSrc: false` unchanged. Leg R (reproduction of the 10
  launcheng unknown days from the existing strikeband4 corpora),
  the launcheng day-level classifier, Taxonomy H, Leg R, launch
  accounting, wall numbers, and Leg P (P1–P8) are reused VERBATIM
  — their definitions are not re-decided here.
- `scripts/test-poolfirstfail-refreeze-b.js` — proof (mirrors
  `scripts/test-poolfirstfail-reanchor-b.js`): §0 anchor section
  (static + negative + live-positive; the static assertion now
  expects `'df40fced12a0'`) + §1 static adapted (prereg is THIS
  file; the src-clean check is the re-anchor invariant — on-disk
  `src/` matches the frozen base, `git diff --quiet df40fced1 --
  src/` empty — NOT "clean vs HEAD", which is false by design
  while the frozen `src/` is checked out; pool-path identity
  checked as `df40fced1` vs HEAD — see the Base-identity check
  above for why that check is expected to trip on the
  profilegate delta; driver + analyzer + test are the new
  -refreeze-b files) + §2 analyzer selftest green (78 checks
  incl. §I) + §3 fixture end-to-end (Leg P on a synthetic corpus,
  arm/run updated) + §4 live 150d shape run on screening seed
  106731 (pool rows with gap fields, census rows; asserts
  `anchorCommit` is the frozen base while HEAD has moved) + §5
  D1/D2 at 30d on 106731 under the full substrate (repeatability +
  recorder neutrality). §4/§5 run under the frozen `src/` checkout
  (run procedure below); §1 fails loudly without it, by design —
  the test refuses to certify live legs it cannot run truthfully.
  A landing re-run of this test must do the frozen `src/`
  checkout first (one command, run procedure below); a §1 failure
  on a bare rebased tip is the guard working, not a broken
  instrument.

## Leg P — pool-first-fail decomposition (frozen, inherited unchanged)

Run over the re-recorded corpora. First-fail classes are the
frozen set from `findCompanion`'s check order: `selfOrScholar`,
`dead`, `away`, `trustLow`, `notAtHaven`, `engaged`,
`notRanger`, `onExped`, `eligible`. (`selfOrScholar` is
structural — 2 per snapshot — and is EXCLUDED from the
binding-first-fail plurality, but counted and reported.)
P1 first-fail tally; P2 counterfactual relaxations
(relax-profile / relax-away / relax-trust / relax-all); P3
notRanger gap; P4 away decomposition; P5 trust; P6 census supply
chain; P7 splits (holder profile, plan stage); P8
what-would-have-to-change. Definitions verbatim from the
original prereg — see that file for the full table; nothing is
re-decided here. AMENDMENT 1 (census coverage: census day-set C
⊆ daily day-set D, |C| ≥ |D|−1) and AMENDMENT 2 (§4 shape-run
horizon 150d) from the original prereg are inherited as frozen.

## Primary metric (frozen, inherited)

Pool-snapshot classification completeness over the re-recorded
band (every pool snapshot fully first-fail-classified, every
notRanger member gap-recorded, census covering the band), PLUS
the binding first-fail named with a plurality, PLUS the anchor
label now correct.

## DIAG-GO BAR (frozen — a miss is NO-GO, never re-scored)

The diag is **DIAG-GO** only if ALL of these hold (unchanged
from the original prereg):

(a) **Classification completeness:** 0 unclassified pool
    snapshots on the re-recorded band — every `companionPool`
    row satisfies: `counts` sum to `rosterN`; every member's
    `firstFail` is in the frozen set; every non-self member
    carries `range{score, profile, gap}` + `trust` +
    `awayPurpose` fields; no row is missing `members` or
    `counts`. AND `poolCensus` covers the corpus daily-snapshot
    days minus the trailing final snapshot day (census day-set
    C ⊆ daily day-set D, |C| ≥ |D|−1 — AMENDMENT 1), each row
    carrying the frozen fields.
(b) **Binding first-fail named:** the modal NON-SELF
    first-fail holds a strict plurality of non-self
    first-fails across the re-recorded band's snapshots (its
    count exceeds every other non-self class).
(c) **Instrument validity:** proof test
    `scripts/test-poolfirstfail-refreeze-b.js` green; analyzer
    selftest green; analyzer run on the real band dir parses
    8/8 files, 0 instrument errors, substrate assertions pass
    (policy sha `1884c8852d38`, all 7 flags `1`,
    `allyslot3InSrc: false`, anchor base `df40fced12a0`).

REPORTED BUT NOT GATING the verdict: Leg R reproduction of
the 10 launcheng unknown days, the binding gate over assessed
days (holderstate bar 3 shape), launch sanity, the wall
numbers, and the REPRODUCTION comparison below. The DIAG bar is
(a)+(b)+(c) only.

## Reproduction criterion (frozen — what "the decomposition reproduces" means)

The re-record runs identical code (frozen `src/`, copied
driver) on the identical band, so the Leg P numbers must
reproduce EXACTLY (original analysis
`evidence/2026-11-21/poolfirstfail-b-analysis.json`):

- Snapshots 138, census rows 1030, non-self total 781.
- First-fails: notRanger 417, away 305, trustLow 6, eligible
  53, dead / notAtHaven / engaged / onExped 0.
- Relax fills: profile 104/104 empty, away 0, trust 0, all 104.
- Gap histogram {1: 78, 2: 159, 3: 34, 4: 130, 5: 16},
  gapStale 2.
- Binding gate party-no-companion 134/134 assessed days.
- Legacy: unknown 3 (hU 11, hE 9, hS 0; hs-gate-pick 8,
  hs-unexplained 2, hs-chore-not-finished-no-skip 1),
  mechanism DENIED; Leg R exact 10/10; wave-4-target launches
  37 (uncounted 30), first fights 3.
- Wall per seed: 106731 151d survived standing 325 maxWave 5
  deaths 88; 106732 151d survived 199 w4 63; 106733 96d
  village-lost 199 w4 62; 106734 82d village-lost 195 w4 44;
  106735 150d survived 199 w4 89; 106736 143d village-lost 275
  w5 67; 106737 149d village-lost 470 w5 191; 106738 129d
  village-lost 199 w4 66.

Corpus FILES will differ from the originals only in the
expected label fields (`arm`, `run`, `anchorCommit`,
file names). If any Leg P number deviates, it is reported
as measured in the evidence — the band is NOT re-rolled and
no bar is adjusted to match. (A deviation under identical
code + identical band would mean the D1 determinism premise
failed somewhere — e.g. a driver-copy behavioral difference
or an unrecorded input — and the evidence must name the
suspect, not smooth it over.)

## Run procedure (frozen — execute verbatim)

1. Write this prereg FIRST; freeze before any judged sim.
   (Done — this file, ~15:59 UTC, before any judged leg.)
2. Build the instrument (driver + analyzer + test copies per
   §Instrument). No `src/` change, ever, in any commit.
3. Check out the frozen `src/`: `git checkout df40fced1 --
   src/` in this worktree. Verify the CLI guard passes
   (`git diff --quiet df40fced1 -- src/` exit 0).
4. Proof test GREEN before any judged leg:
   `node scripts/test-poolfirstfail-refreeze-b.js` (incl. the
   §0 anchor section and the §4 live-positive anchor assertion).
   Expected: 48/48 — the 2 anchor failures fixed. If anything
   else fails, STOP and report, do not proceed to judged legs.
   (Known pre-registered risk: the §1 pool-path identity check
   — see Base-identity check above. It is expected to trip on
   the profilegate delta; that is a measured HEAD fact, not a
   re-score, and the stop rule applies to it exactly as written.)
5. Judged leg, same checkout, legs sequential, telemetry to
   `evidence/2026-11-21/poolfirstfail-refreeze-b-legs.log`:
   `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1
   FIGHTALLY2=1 ALLYSLOT3=1 LAUNCHSURVIVE=1 MODE=vre
   OUTDIR=perseed-poolfirstfail-refreeze-b-106731-106738
   SEEDS=106731,106732,106733,106734,106735,106736,106737,106738
   RUN=poolfirstfail-refreeze-b node
   scripts/poolfirstfail-driver-refreeze-b.js`
   Do NOT commit anything before the judged legs run (anchor
   rule — the original arm's ordering mistake is the defect
   being fixed; the instrument commit happens only after the
   judged leg, if at all, per coordinator landing).
6. Restore `src/` to HEAD immediately after the judged leg:
   `git checkout HEAD -- src/`; verify `git status --short --
   src/` empty AND `git diff df40fced1 HEAD -- src/` back to
   the known delta — SIX files at this HEAD (see
   Base-identity check; the brief's "4-file" wording predates
   the profilegate landing).
7. Analyzer + balanced panel §15:
   `node scripts/analyze-poolfirstfail-refreeze-b.js` (writes
   `poolfirstfail-refreeze-b-analysis.json`); compare Leg P
   numbers to the reproduction criterion above; write the
   evidence note.
8. Commit ONLY via this worktree's OWN
   `scripts/safe-commit.sh`; verify each commit by blob hash;
   repair index clobber if it strikes (see the arm brief).
   Do NOT push, do NOT bump versions, do NOT verify live, do
   NOT rebase.

## Build gate (frozen) + overlap guard

**NO BUILD in this stage unless a named mechanism emerges
with its own frozen GO bar.** This is an instrument/DIAG arm.
The named next lever is PROFILE-GATE RELAXATION for party
companions (finding #2638) — that is **arm 1's job
(sim-profilegate-b), NOT this arm's**; do not duplicate it.
**OVERLAP GUARD:** do NOT touch `villager-brain.js` or
`win-plan.js` — held by the sibling arms; do NOT touch Loop
A's trees/branches; do NOT touch the held
`sim-holderstate-b` or `sim-pinquaddoor-b` branches (read-only
copy of the approach only); do NOT modify the landed
`poolfirstfail-b` or `poolfirstfail-reanchor-b` instrument files
(new -refreeze-b copies instead, so the original records stay
intact).

## Wall numbers (reported every run, both national definitions)

Wins, national by scaleRank ≥ 2, national by standing ≥ 200,
table seats, wave-4 unlocked, wave-5 unlocked, median survival,
total deaths, starvation deaths — recomputed by the analyzer
from the re-recorded corpora (not copied). Also the
standing-199 stall count.

## Sense-testing (SENSE-TESTING LAW)

Read transcripts. Quote real `vetSays` lines and real pool
rows (a holder, a day, the members and their first-fails with
names), and read at least one empty-pool day's story end to
end. Judge meaning, coherence, consequences — never just
counts. The evidence carries a "metric review" section. The
re-judge re-reads the same stories on the re-recorded corpora
and says whether they still read the same.

## Instrument limitations (pre-registered, not hidden)

1. **No retroactive classification:** the holderstate 36
   snapshots cannot be re-decomposed at member-gap depth —
   their corpora lack `range` / `awayPurpose` / census
   fields. Only the fresh band is decomposed; the old
   first-fail counts are quoted, never re-derived.
2. **Cache staleness is reported, not repaired:** the gap is
   computed from the LIVE score; if the cached profile is
   stale, the gap describes the live person while the filter
   saw the cached profile. The analyzer flags the count; it
   does not rewrite eligibility.
3. **Away duration units differ by purpose** (expedition
   durations vs objective partsLeft) — the analyzer reports
   raw `awaySinceDay` / `awayDuration` / `purpose` fields
   and does not convert to a common remaining-time unit.
4. **Trust is a snapshot value:** trust moves through
   interaction; the gap is the distance at snapshot time.
5. **The census live profile is a recomputation, not the
   cached profile** the game would use — by design (the
   census must not write the profile cache). Where live and
   cached disagree, the pool rows (cached) govern eligibility
   and the census governs supply.
6. **Branch derivation follows code order** from the sampled
   pre-state; the perception-flag input to
   `vbrainShouldRefresh` is module-internal and unrecorded
   (inherited).
7. **Write flap:** intermittent EPERM on fresh-file writes has
   struck this program repeatedly (latest windows Nov 20–21).
   Legs tee to
   `evidence/2026-11-21/poolfirstfail-refreeze-b-legs.log`
   (fallback recovery); writes are probed before they matter
   and verified by size/readback; a blocked final commit
   leaves files on disk intact for coordinator adoption, never
   forced. If the flap re-bursts mid-work, stop at the next
   safe point and report.
8. **Registry lock contention** was observed by sibling arms
   (registration for this arm queued behind sibling
   registrations on the registry flock; `git status` in the
   main tree ran 10+ min under concurrent load while the
   worktree's own `git status` took ~7 s). Heartbeats are
   retried periodically; the lock file is NOT bypassed and no
   sibling process is killed.
9. **The sentinel guard's scope:** the per-`oneRun()` guard
   checks the four files that differ between the frozen base
   and the re-anchor HEAD. It is exact for those four files
   only; it does not cover the two profilegate files, and it
   does not detect uncommitted `src/` edits elsewhere; the CLI
   guard (full `git diff --quiet`) and the run procedure's
   restore + verify steps cover that. The guard is documented
   as a drift-catcher, not a substitute for the run procedure.
10. **Landing re-run:** re-running the proof test requires the
    frozen `src/` checkout first (run procedure step 3). A §1
    failure on a bare rebased tip is the guard working, not a
    broken instrument.
11. **§1 pool-path identity vs the profilegate landing:** at
    this HEAD the `df40fced1`-vs-HEAD pool-path identity check
    is false by measurement (see Base-identity check). The
    check is NOT re-defined here — it runs verbatim, and the
    stop rule (step 4) governs its outcome. Any re-freeze of
    that check (e.g. asserting the delta is exactly the
    env-gated PROFILEGATE4 lever) is a coordinator decision
    for the next round, not this arm's.

## Files

- Prereg: `evidence/2026-11-21/sim-poolfirstfail-refreeze-b-prereg.md` (this file)
- Instrument: `scripts/poolfirstfail-driver-refreeze-b.js`,
  `scripts/analyze-poolfirstfail-refreeze-b.js`,
  `scripts/test-poolfirstfail-refreeze-b.js`
- Corpora (re-recorded): `evidence/2026-11-21/perseed-poolfirstfail-refreeze-b-106731-106738/`
  (8 files)
- Original corpora (preserved, read-only):
  `evidence/2026-11-21/perseed-poolfirstfail-b-106731-106738/` (8 files)
- Re-anchor corpora (not produced — judged leg never ran):
  `evidence/2026-11-21/perseed-poolfirstfail-reanchor-b-106731-106738/`
- Reproduction corpora (existing, read-only):
  `evidence/2026-11-20/perseed-strikeband4-b-106241-106248/` (8 files)
- Analysis: `evidence/2026-11-21/poolfirstfail-refreeze-b-analysis.json`
- Original analysis (comparison): `evidence/2026-11-21/poolfirstfail-b-analysis.json`
- Evidence: `evidence/2026-11-21/sim-poolfirstfail-refreeze-b.md`
- Leg log: `evidence/2026-11-21/poolfirstfail-refreeze-b-legs.log`
- `src/` diff: 0 lines (DIAG, recorder wraps only).
