# sim-poolfirstfail-reanchor-b — DIAG PREREG, the poolfirstfail re-anchor + re-judge (frozen before any judged sim)

**Arm:** sim-poolfirstfail-reanchor-b, DIAG instrument, re-anchor + re-judge · **Loop B run:**
fleshout-loop-b-20261121T0430Z adoption, arm 3 of 3 (resumed attempt — a prior
worker did read-only prep and stopped at step 1 on the write flap; nothing
was written or registered) · **Axis:** winnability chain
**Type:** DIAG, instrument-only (recorder + analyzer). No game-code
change, no default flipped, no lever built in this stage.
**Branch:** `sim-poolfirstfail-reanchor-b` · **Worktree:**
`~/workspace/worktrees/sim-poolfirstfail-reanchor-b`
**Base at arm start:** worktree HEAD `238dcf94b` (journey establishment
r247 adoption closeout). Master moved during the 28-minute registration
queue: `9c4ed7a87` (ship-loop version bump, the base named in the brief)
→ `238dcf94b` → `b6aad8942` (journey endgame r263) by the time the
worktree existed. The branch bases on `238dcf94b`, which contains
`9c4ed7a87`; the coordinator rebases at landing. The re-anchor does not
depend on the master tip: the judged leg runs the frozen base's `src/`
(see §"The anchor fix"), so the moving master cannot move the substrate.
**Frozen:** 2026-11-21 ~13:45 UTC, BEFORE any judged sim.
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `1884c8852d38170e0e99078a279e867496e27605fdcadbd3c2a42c07a54d4bb0`
(first 12: `1884c8852d38` — verified live on this worktree before
freezing; `competent.js` is byte-identical between the frozen base and
this HEAD, see Base-identity check).
**Horizon:** 150d, death-aware. **Band:** 106731–106738 (8 seeds,
RE-RECORDED — same band as the original arm, see below).

## The question (the 0430Z arm-2 verdict, and what this arm re-judges)

sim-poolfirstfail-b (`evidence/2026-11-21/sim-poolfirstfail-b.md`,
DIAG-NO-GO on the frozen instrument bar only) completed the
decomposition — classification PASS (138 snapshots, 0 problems),
binding first-fail PASS (`notRanger` 417 vs `away` 305 of 781
non-self) — but frozen bar (c) failed on the anchor assertion alone:
the driver stamped `anchorCommit` as `git rev-parse HEAD` at run
time (`38692c34c24b`, the instrument commit the timed-out 0430Z run
made before the judged leg) while the analyzer's frozen
`EXPECTED.anchor12` is `df40fced1`. The game code the corpora ran
under was byte-identical to the frozen base (`git diff df40fced1
38692c34c -- src/` empty), so the miss was a label artifact, not a
substrate difference — but the prereg freezes "a miss is NO-GO, never
re-scored", the coordinator call stands (verdict NO-GO per metric
binding; no post-hoc amendment of `EXPECTED.anchor12`), and the
proof test never asserted the anchor, so it passed 40/40 while the
analyzer's stricter check failed. This arm re-anchors the driver so
the stamp cannot drift, re-records the SAME frozen band, and
re-judges the same frozen bars.

## The anchor fix (this arm's core deliverable)

The frozen base is `df40fced12a086c28fbe53d3a9696abd02f5b905`
(`df40fced1`, full hash verified via `git rev-parse df40fced1`
before freezing). `EXPECTED.anchor12` stays `df40fced1` in the
re-anchor analyzer — unchanged from the original prereg.

1. **The stamp is a constant, never HEAD.** The re-anchor driver
   replaces the module-scope `git rev-parse HEAD` call with
   `FROZEN_BASE = 'df40fced12a086c28fbe53d3a9696abd02f5b905'` and
   stamps `anchorCommit: FROZEN_BASE` on every corpus. There is no
   `rev-parse HEAD` left in the driver for the anchor. The stamp
   therefore reads the frozen base even when HEAD has moved — which
   is the state of this worktree (HEAD `238dcf94b`, frozen base
   `df40fced1`).
2. **The stamp is guarded, not merely asserted.** A constant stamp
   is only truthful if the code that runs IS the frozen base's code.
   Two guards enforce that, both failing LOUDLY (exit 2 / throw)
   instead of recording a mis-stamped corpus:
   - (a) CLI guard in `main()`: `git diff --quiet <FROZEN_BASE> --
     src/` must exit 0 before any seed runs. (Measured ~3 min wall
     under the current I/O-starved load; it runs once per CLI
     invocation, not per seed.)
   - (b) Per-`oneRun()` sentinel guard: the four `src/` files that
     differ between the frozen base and this HEAD (below) are
     compared on disk against their frozen blob hashes, hardcoded
     in the driver (`build.js 106cc81d…`, `conversation.js
     f3cc1094…`, `convo-dialogue.js b944cd18…`, `fieldFights.js
     30f4a059…` — full hashes in the driver source). Any mismatch
     throws before the seed runs. This is the cheap, git-free
     check on the library path the proof test uses; the committed
     diff (below) proves these four files are the ONLY `src/`
     difference between the frozen base and this HEAD, so
     sentinel-match + clean worktree = on-disk `src/` IS the
     frozen base's `src/`.
3. **The judged leg runs the frozen `src/`.** HEAD's `src/` is NOT
   the frozen base's `src/` (see Base-identity check): four files
   moved, including the #2634 field-fight fix, which changes fight
   outcomes and could shift deaths, roster composition, and pool
   snapshots. Running the judged leg on HEAD's `src/` while
   stamping `df40fced1` would repeat the original error in reverse
   — a true label on a wrong run. So the run procedure (frozen
   here, executed verbatim) is: check out the frozen `src/` into
   the worktree (`git checkout df40fced1... -- src/`), run the
   proof test's live legs and the judged leg, then restore `src/`
   to HEAD immediately (`git checkout HEAD -- src/`) and verify
   (`git status --short -- src/` empty; `git diff df40fced1 HEAD
   -- src/` back to the known 4-file delta). NO `src/` change is
   committed — the committed tree keeps HEAD's `src/`. The
   checkout is a run-time condition, not a change. If the run is
   interrupted with `src/` still frozen, restore + verify before
   any commit; a commit is never made while `src/` differs from
   HEAD.
4. **The proof test asserts the anchor three ways** (new §0, see
   Instrument): static (driver carries the constant + guards and
   no `rev-parse HEAD`; analyzer `EXPECTED.anchor12` is
   `df40fced1`; this prereg forbids post-hoc amendment);
   negative (a synthetic corpus stamped `38692c34c…` — the exact
   old bad stamp — fails the analyzer's substrate check);
   live-positive (the §4 live run's `anchorCommit` equals the
   frozen base even though worktree HEAD has moved, and the
   analyzer on the real re-recorded band reports
   `substrateBadFiles: 0`).

**Post-hoc amendment is forbidden.** `EXPECTED.anchor12` is
`df40fced1` in this prereg and in the re-anchor analyzer. It may
not be amended after any judged leg to match whatever the driver
stamped. If the re-recorded corpora fail the anchor check, the
verdict is NO-GO and the failure is reported, never re-scored.

## Base-identity check (verified before freezing)

The pool path is IDENTICAL between the frozen base `df40fced1`
and this worktree's HEAD `238dcf94b`:

- `git diff df40fced1 HEAD -- src/js/villager-brain.js
  src/js/win-plan.js src/js/villager-agency.js
  src/js/villager-objectives.js src/js/companion-score.js
  src/js/game.js src/data scripts/sim-harness.js
  scripts/vetfirst-instrument-20261111.js
  scripts/policies/competent.js scripts/analyze-launcheng-b.js
  scripts/analyze-launchfunnel-a.js scripts/analyze-launchdef-a.js
  scripts/analyze-dmgshape-rerun-b.js` is EMPTY. The pool filter,
  the range profile, the harness, the policy, and every analyzer
  dependency the re-anchor analyzer requires are byte-identical.
- The WHOLE `src/` delta `df40fced1 → HEAD` is exactly four files:
  `src/js/build.js` (version stamp only, `0c61452fa…` →
  `27a650645-20261121-124229`); `src/js/conversation.js` +
  `src/js/convo-dialogue.js` (M12-CAP favor-requirements circles
  latch, journey-succession r262 — conversation dialogue only);
  `src/js/fieldFights.js` (the #2634 downedtwice fix, landed in
  the 0430Z round: ally pick indexes `_liveAllies`, fall guard
  gated on the live→0 transition). None of the four is in the
  pool path — but `fieldFights.js` changes fight outcomes, so
  the judged leg still runs the frozen `src/` (see §3 above)
  rather than relying on "unrelated" as a judgment call.
- Policy sha verified live on this worktree: `1884c8852d38`.
- Worktree `git status --short` empty at arm start (verified
  before freezing).

## Band (re-recorded, same band — a re-anchor, not a new band)

Band 106731–106738 is RE-USED deliberately, per the coordinator
call (round record §Arm 2): the next run re-records the SAME
frozen band, then re-judges. This is not a fresh-band assignment,
so the fresh-band rule does not apply; the re-use is the point
(the content is deterministic — the original proof test's D1 leg
proves identical corpora on repeat runs under identical code —
so the re-record must reproduce the decomposition, and any
deviation is a measured finding, not a re-roll). Re-use check
(2026-11-21, before freezing): `grep 10673[1-8]` over
`evidence/2026-11-21/*.md` finds only the original poolfirstfail
files, the round record, and the dmgpin note citing its OWN band
(106729–106736); no other arm has claimed 106731–106738. The
original corpora (`perseed-poolfirstfail-b-106731-106738/`) are
PRESERVED read-only for comparison; the re-record writes a NEW
dir (`perseed-poolfirstfail-reanchor-b-106731-106738/`).

## Substrate (env flags — identical to the original arm, carried exactly)

`SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 ALLYSLOT3=1 LAUNCHSURVIVE=1`,
competent verbatim, 150d death-aware, one leg (recorder ON),
`MODE=vre`. FLEEREPAIR2=1 is carried: the original prereg freezes
SEVEN flags including FLEEREPAIR2=1, the 0430Z round record's band
line omits it in print but the run used it, and the driver
hard-requires it (exit 2 without it). ALLYSLOT3 is NOT landed on
the frozen base either (verified: the driver asserts the ENV flag
is set, asserts src ABSENCE, and records `allyslot3InSrc: false`
on every corpus — same as the original arm). **ZERO `src/js`
changes in this arm.**

## Instrument (new -reanchor-b files; original -b files untouched)

- `scripts/poolfirstfail-driver-reanchor-b.js` — a copy of the
  landed `scripts/poolfirstfail-driver-b.js` with ONLY these
  changes: header comment, arm/run `poolfirstfail-reanchor-b`
  (out object + file names
  `poolfirstfail-reanchor-b-s<seed>`), stop-message prefix
  `POOLFIRSTFAIL-REANCHOR`, driver-filename strings in
  `firstCallerFrame`/`fightOrigin` updated to the new file, the
  ALLYSLOT3-discrepancy comment re-based to `df40fced1`, the
  usage line re-seeded (same band, new OUTDIR/RUN), PLUS the
  anchor fix (§1–2 above: `FROZEN_BASE` constant + CLI guard +
  sentinel guard, exported as `FROZEN_BASE`/`FROZEN_BASE12`).
  All recorder logic (pool-first-fail extension, census,
  `rangeScoreOf`, substrate assertions) is byte-identical in
  behavior to the original driver.
- `scripts/analyze-poolfirstfail-reanchor-b.js` — a copy of
  `scripts/analyze-poolfirstfail-b.js` with ONLY these changes:
  arm/run `poolfirstfail-reanchor-b`, `BAND_DIR`
  `perseed-poolfirstfail-reanchor-b-106731-106738`, output
  `evidence/2026-11-21/poolfirstfail-reanchor-b-analysis.json`,
  the §F/§H selftest synthetic docs' arm/run updated to the new
  arm, PLUS: `substrateOf` exported (additive, so the proof
  test can run the negative anchor test directly) and a new
  selftest §I (anchor: positive + negative substrate checks).
  `EXPECTED.anchor12` stays `df40fced1`; seeds stay
  106731–106738; flags, policy sha, `allyslot3InSrc: false`
  unchanged. Leg R (reproduction of the 10 launcheng unknown
  days from the existing strikeband4 corpora), the launcheng
  day-level classifier, Taxonomy H, Leg R, launch accounting,
  wall numbers, and Leg P (P1–P8) are reused VERBATIM — their
  definitions are not re-decided here.
- `scripts/test-poolfirstfail-reanchor-b.js` — proof (mirrors
  `scripts/test-poolfirstfail-b.js`): §0 NEW anchor section
  (static + negative + live-positive, see §4 of the anchor fix)
  + §1 static adapted (prereg is THIS file; the src-clean check
  becomes the re-anchor invariant — on-disk `src/` matches the
  frozen base, `git diff --quiet df40fced1 -- src/` empty — NOT
  "clean vs HEAD", which is false by design while the frozen
  `src/` is checked out; pool-path identity checked as
  `df40fced1` vs HEAD, verified empty above; driver + analyzer
  + test are the new -reanchor-b files) + §2 analyzer selftest
  green (74 checks + new §I) + §3 fixture end-to-end (Leg P on
  a synthetic corpus, arm/run updated) + §4 live 150d shape run
  on screening seed 106731 (pool rows with gap fields, census
  rows; asserts `anchorCommit` is the frozen base while HEAD
  has moved) + §5 D1/D2 at 30d on 106731 under the full
  substrate (repeatability + recorder neutrality). §4/§5 run
  under the frozen `src/` checkout (run procedure below); §1
  fails loudly without it, by design — the test refuses to
  certify live legs it cannot run truthfully. A landing re-run
  of this test must do the frozen `src/` checkout first (one
  command, run procedure below); a §1 failure on a bare rebased
  tip is the guard working, not a broken instrument.

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
    `scripts/test-poolfirstfail-reanchor-b.js` green; analyzer
    selftest green; analyzer run on the real band dir parses
    8/8 files, 0 instrument errors, substrate assertions pass
    (policy sha `1884c8852d38`, all 7 flags `1`,
    `allyslot3InSrc: false`, anchor base `df40fced1`).

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
   (Done — this file, ~13:45 UTC, before any judged leg.)
2. Build the instrument (driver + analyzer + test copies per
   §Instrument). No `src/` change, ever, in any commit.
3. Check out the frozen `src/`: `git checkout df40fced1... --
   src/` in this worktree. Verify the CLI guard passes
   (`git diff --quiet df40fced1 -- src/` exit 0).
4. Proof test GREEN before any judged leg:
   `node scripts/test-poolfirstfail-reanchor-b.js` (incl. the
   §0 anchor section and the §4 live-positive anchor assertion).
5. Judged leg, same checkout, legs sequential, telemetry to
   `evidence/2026-11-21/poolfirstfail-reanchor-b-legs.log`:
   `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1
   FIGHTALLY2=1 ALLYSLOT3=1 LAUNCHSURVIVE=1 MODE=vre
   OUTDIR=perseed-poolfirstfail-reanchor-b-106731-106738
   SEEDS=106731,106732,106733,106734,106735,106736,106737,106738
   RUN=poolfirstfail-reanchor-b node
   scripts/poolfirstfail-driver-reanchor-b.js`
   Do NOT commit anything before the judged legs run (anchor
   rule — the original arm's ordering mistake is the defect
   being fixed; the instrument commit happens only after the
   judged leg, if at all, per coordinator landing).
6. Restore `src/` to HEAD immediately after the judged leg:
   `git checkout HEAD -- src/`; verify `git status --short --
   src/` empty AND `git diff df40fced1 HEAD -- src/` back to
   the known 4-file delta.
7. Analyzer + balanced panel §15:
   `node scripts/analyze-poolfirstfail-reanchor-b.js` (writes
   `poolfirstfail-reanchor-b-analysis.json`); compare Leg P
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
`poolfirstfail-b` instrument files (new -reanchor-b copies
instead, so the original record stays intact).

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
   struck this program repeatedly (latest window 11:06Z–
   ~12:55Z Nov 21, cleared ~12:56Z; O_EXCL probe OK at
   13:00Z and 13:43Z). Legs tee to
   `evidence/2026-11-21/poolfirstfail-reanchor-b-legs.log`
   (fallback recovery); writes are probed before they matter
   and verified by size/readback; a blocked final commit
   leaves files on disk intact for coordinator adoption, never
   forced. If the flap re-bursts mid-work, stop at the next
   safe point and report.
8. **Registry lock contention** was observed by sibling arms
   (registration for this arm queued ~28 min behind two
   sibling registrations on the registry flock; `git status`
   in the main tree ran 10+ min under concurrent load while
   the worktree's own `git status` took ~7 s). Heartbeats are
   retried periodically; the lock file is NOT bypassed and no
   sibling process is killed.
9. **The sentinel guard's scope:** the per-`oneRun()` guard
   checks the four files that differ between the frozen base
   and this HEAD. It is exact only because the committed diff
   is exactly those four files (verified above) and the
   worktree starts clean. It does not detect uncommitted
   `src/` edits elsewhere; the CLI guard (full `git diff
   --quiet`) and the run procedure's restore + verify steps
   cover that. The guard is documented as a drift-catcher,
   not a substitute for the run procedure.
10. **Landing re-run:** re-running the proof test requires the
    frozen `src/` checkout first (run procedure step 3). A §1
    failure on a bare rebased tip is the guard working, not a
    broken instrument.

## Files

- Prereg: `evidence/2026-11-21/sim-poolfirstfail-reanchor-b-prereg.md` (this file)
- Instrument: `scripts/poolfirstfail-driver-reanchor-b.js`,
  `scripts/analyze-poolfirstfail-reanchor-b.js`,
  `scripts/test-poolfirstfail-reanchor-b.js`
- Corpora (re-recorded): `evidence/2026-11-21/perseed-poolfirstfail-reanchor-b-106731-106738/`
  (8 files)
- Original corpora (preserved, read-only):
  `evidence/2026-11-21/perseed-poolfirstfail-b-106731-106738/` (8 files)
- Reproduction corpora (existing, read-only):
  `evidence/2026-11-20/perseed-strikeband4-b-106241-106248/` (8 files)
- Analysis: `evidence/2026-11-21/poolfirstfail-reanchor-b-analysis.json`
- Original analysis (comparison): `evidence/2026-11-21/poolfirstfail-b-analysis.json`
- Evidence: `evidence/2026-11-21/sim-poolfirstfail-reanchor-b.md`
- Leg log: `evidence/2026-11-21/poolfirstfail-reanchor-b-legs.log`
- `src/` diff: 0 lines (DIAG, recorder wraps only).
