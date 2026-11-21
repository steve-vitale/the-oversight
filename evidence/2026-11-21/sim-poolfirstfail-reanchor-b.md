# sim-poolfirstfail-reanchor-b — DIAG re-anchor + re-judge (Loop B run fleshout-loop-b-20261121T1430Z)

**Arm:** sim-poolfirstfail-reanchor-b, DIAG instrument, re-anchor + re-judge ·
**Loop B run:** fleshout-loop-b-20261121T1430Z, arm 3 (adopted from the
0430Z adoption — the frozen prereg's header names that run; the frozen
bars, band, substrate, and run procedure do not depend on the run id) ·
**Axis:** winnability chain · **Branch:** `sim-poolfirstfail-reanchor-b` ·
**Worktree:** `~/workspace/worktrees/sim-poolfirstfail-reanchor-b` ·
**Base:** worktree HEAD `238dcf94b` · **Frozen base:** `df40fced1`
(`df40fced12a086c28fbe53d3a9696abd02f5b905`) · **Prereg:**
`evidence/2026-11-21/sim-poolfirstfail-reanchor-b-prereg.md` (frozen
~13:45Z, before any judged sim) · **Policy:** competent verbatim, sha
`1884c8852d38` · **Band:** 106731–106738 (re-recorded, same band) ·
**Horizon:** 150d death-aware · **Substrate:** `SENSEEXPED=1
PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 ALLYSLOT3=1
LAUNCHSURVIVE=1`, `MODE=vre`, recorder ON.

## Verdict: DIAG-NO-GO — proof gate RED; judged leg NOT run

The proof test is **46 passed, 2 failed** (exit 1), and both failures
are the same single root cause. Per the frozen run procedure
(step 4: proof test GREEN before any judged leg), **no judged leg
ran** — there are no re-recorded corpora, no
`perseed-poolfirstfail-reanchor-b-106731-106738/` dir, no analysis
JSON, no balanced panel. This is the procedure working as designed:
the new §0/§I anchor checks — written precisely because the original
proof test never asserted the anchor — caught the defect before any
judged sim spent.

**The defect, measured:** the inherited analyzer comparison cannot
pass with a correct stamp. `substrateOf` compares
`(j.anchorCommit).slice(0, 12)` against `EXPECTED.anchor12`, but
`EXPECTED.anchor12` is `'df40fced1'` — **9 characters**, not 12.
A corpus stamped with the full frozen base
`df40fced12a086c28fbe53d3a9696abd02f5b905` slices to
`'df40fced12a0'` (12 chars), which never equals `'df40fced1'`.
`substrateOf` therefore reports `["anchor:df40fced12a0"]` on a
perfectly stamped corpus. The original arm's NO-GO was blamed on
the wrong stamp (`38692c34c24b`), but the stamp was only half the
story: **even the right stamp fails this comparison.** The frozen
prereg's expectation — "the analyzer on the real re-recorded band
reports `substrateBadFiles: 0`" — is unattainable under the
inherited comparison as written. Nobody had run a positive anchor
check before; this arm's §0/§I are the first, and they caught it.

**What was NOT done about it:** nothing was amended. Changing
`EXPECTED.anchor12` to `'df40fced12a0'` or the slice to `(0, 9)`
would be a post-hoc amendment of a frozen definition, which the
prereg forbids ("a miss is NO-GO, never re-scored"). The verdict
below is reported as measured, never re-scored.

## DIAG-GO bar (frozen) — judged

| Bar | Result |
|---|---|
| (a) Classification completeness (0 unclassified pool snapshots, census coverage) | **UNMEASURED** — no re-recorded band exists; the judged leg did not run. Original band: 138 snapshots, 0 problems, census 1030 (quoted, not re-derived). |
| (b) Binding first-fail named with strict plurality | **UNMEASURED** on new corpora. Original band: `notRanger` 417 vs `away` 305 of 781 non-self (quoted). |
| (c) Instrument validity (proof green, selftest green, 8/8 parse, 0 errors, substrate assertions pass) | **FAIL** — proof 46/48 green, selftest 77/78 green; the single failing check in each is the anchor comparison above. All other substrate assertions (policy sha, all 7 flags, `allyslot3InSrc: false`) pass. |
| **Verdict** | **DIAG-NO-GO** (bar (c) fails; bars (a)/(b) unmeasured because the proof gate stopped the run before the judged leg). |

## What the re-anchor itself proved (all measured)

The re-anchor — the actual deliverable of this arm — works. Every
check that touches it passes:

- **§0 static (5/6, only the inherited-comparison positive fails):**
  driver stamps the frozen base as a constant (`FROZEN_BASE`); driver
  carries the CLI guard + per-`oneRun()` sentinel guard; no HEAD
  lookup left in the driver for the anchor; `EXPECTED.anchor12` is
  `df40fced1` unchanged; prereg forbids post-hoc amendment; the old
  bad stamp `38692c34c24b` fails the substrate check (negative).
- **§0 live-positive: PASS.** The §4 live 150d run's `anchorCommit`
  is the full frozen base even though worktree HEAD (`238dcf94b`)
  has moved.
- **Guards verified live:** CLI guard passes under the frozen
  checkout (`git diff --quiet df40fced1 -- src/` exit 0);
  `sentinelCheck()` passes on the frozen checkout (all four blob
  hashes verified independently against `git show df40fced1:<path>`
  before the run); the four files are exactly the known delta.
- **§4 live 150d shape run (seed 106731) reproduces the original
  arm's numbers exactly:** 378 holder-state rows
  (part-start/tick-entry/tick-exit 126/126/126), 21 gate picks,
  27 seed rows, **23 pool rows**, **148 census rows**, 0 instrument
  errors — the same counts the original prereg's AMENDMENT 2 cites
  for this seed. The copied driver behaves identically to the
  original under identical code.
- **§5 D1/D2: PASS.** Identical full corpus on repeat (recorder ON
  twice, 30d), identical trajectories recorder ON vs OFF, recorder-off
  run carries empty recorder arrays, 0 instrument errors.
- **§1 (all pass):** on-disk `src/` matches the frozen base; the
  pool path is byte-identical between `df40fced1` and HEAD
  (brain/win-plan/agency/objectives/companion-score/game/data/
  harness/policy/analyzers); no added/removed pool-filter line;
  driver + analyzer + test are the new `-reanchor-b` files.
- **§3 fixture (all pass):** `seedOf` on the synthetic corpus —
  1 instance, candidate-not-bid, H explains d12 as
  `hs-engaged-skip`, Leg P 2 snapshots / 0 problems / census 12 /
  binding `notRanger` 3.
- **Analyzer selftest 77/78:** §A–§H all green (74 checks),
  §I 3/4 green (only the positive anchor check fails, same root
  cause). Leg R reproduces the 10 launcheng unknown days exactly.

**Proof log:** `evidence/2026-11-21/poolfirstfail-reanchor-b-prooftest.log`
(46 passed, 2 failed; the two failures are §0 positive and §2,
both the anchor comparison — the §I failure inside the selftest is
the same check).

## Run procedure — what actually happened

1. Prereg frozen before any judged sim (pre-existing, ~13:45Z).
2. Instrument built per prereg §Instrument: driver + analyzer +
   test copies. **Zero `src/js` changes in any commit.** The driver
   diff vs the original is only the prereg-listed deltas (arm/run
   rename, file names, stop prefix, driver-filename strings,
   ALLYSLOT3 comment) plus the anchor fix (`FROZEN_BASE` constant,
   CLI guard, sentinel guard over the four frozen blob hashes,
   `anchorCommit: FROZEN_BASE`, exports). The analyzer diff is only
   renames + `substrateOf` export + new selftest §I. The test diff
   is only renames + new §0 + the §1 re-anchor invariant +
   `df40fced1`-vs-HEAD pool-path identity + §2 count 74→78.
   Recorder logic is byte-identical in behavior (proven by the §4
   exact reproduction above).
3. Frozen `src/` checked out (`git checkout df40fced1 -- src/` —
   the prereg's `df40fced1...` is a prose ellipsis, not a ref).
   CLI guard verified passing; exactly the 4 known files modified
   vs HEAD.
4. Proof test run twice (second run after fixing one test-side
   check string: the §1 Leg P check needed a whitespace-flattened
   match because the prereg wraps "P8 / what-would-have-to-change"
   across a line break; the frozen bar itself is untouched).
   Result: RED, isolated to the anchor comparison. **Judged leg
   NOT run, per procedure.**
5. `src/` restored to HEAD immediately after the proof runs:
   `git checkout HEAD -- src/`; `git status --short -- src/` empty;
   `git diff df40fced1 HEAD -- src/` back to the known 4-file delta.
   Verified. No `src/` change committed, ever.
6. Analyzer + balanced panel §15: **not run** — there are no
   re-recorded corpora to analyze. Telemetry check: not run — same
   reason (no new corpora; the original band's corpora are not
   re-checked here).

## What the next run needs (coordinator decision, not mine)

A re-freeze of exactly one line, then this arm's procedure re-runs
cleanly (proof + judged leg + analyzer + panel) with the instrument
already built and proven:

- **Option A (preferred — matches the field name):**
  `EXPECTED.anchor12` becomes `'df40fced12a0'` (the true 12-char
  prefix of the frozen base). The value changes; the comparison
  stays `slice(0, 12)`.
- **Option B:** the comparison becomes `slice(0, 9)` against the
  frozen `'df40fced1'`. The value stays; the comparison changes.

Either way the prereg must be re-frozen (the amendment is a
definition change, and the current prereg forbids post-hoc
amendment — which is why this run stopped instead of fixing it).
After the re-freeze, the expected outcome is DIAG-GO on the
reproduction criterion (the §4 live run already reproduces the
original numbers exactly, and the original analysis's Leg P numbers
stand quoted above). The re-recorded band, the judged leg, and the
panel are all still to do; nothing here pre-judges them.

## Wall numbers (original band — quoted, NOT re-recorded)

No re-recorded corpora exist, so these are the original band's
numbers from `evidence/2026-11-21/poolfirstfail-b-analysis.json`,
recomputed by that analyzer, quoted for the every-run wall report:

- Wins **0** · national by scaleRank ≥ 2: **0** · national by
  standing ≥ 200: **3** · table seats **0** · wave-4 unlocked **8/8**
  · wave-5 unlocked **3/8** · median survival **146d** · survived
  **3/8** · total deaths **670** · starvation deaths **3** ·
  standing-199 stall **4**.
- Per seed (survived days / standing / maxWave / deaths):
  106731 151d/325/w5/88 · 106732 151d/199/w4/63 · 106733 96d/199/w4/62 ·
  106734 82d/195/w4/44 · 106735 150d/199/w4/89 · 106736 143d/275/w5/67 ·
  106737 149d/470/w5/191 · 106738 129d/199/w4/66.
- The scale wall stands: villages reach wave 4 everywhere and wave 5
  in 3/8, but none reaches national by rank, none takes the table,
  none wins. Standing-199 stalls in 4/8 seeds.

## Sense-testing (SENSE-TESTING LAW)

No re-recorded corpora exist, so the stories below are re-read from
the **original** corpora (same band, preserved read-only) — the
re-judge's re-read is owed on the re-record, once the re-freeze
lands. The §4 live run's exact reproduction (378 holder rows,
23 pool rows) says the re-record will tell the same stories.

**The village, seed 106731 (151d, survived, standing 325, wave 5):**
a village that survives everything except winning. The System
narrates veteran kills on camera — *"Oh — OH. Everybody saw that,
right? Ming just put down The Callback... on CAMERA. That's a
veteran kill, folks. REMEMBER the name."* (day 28) — and the door
fights read as real, costly stands: *"Ming, Dastan, Luis, Nathan
and Tariq met them at the door — 5 put down. Ming, Dastan, Luis,
Nathan, Tariq are hurt."* (day 8). People fight, get hurt, and keep
going; the narration names them and counts the hurt. That part
reads like people.

**An empty-pool day, end to end (day 109, holder visjoin_106,
target herald, stage party):** at dawn the holder's candidates
include FORAGE, WATER, HUNT, VISIT, a HAVEN_CHORE with
`party_wait`, and five DUTY rows — and the pick is `party_wait`,
because the pool is empty. The pool row says why, with names:
Luis is away foraging, Nathan is away fetching water, Nikolai is
away foraging; gen_ickx95o and visjoin_102 are home but foragers
(range 1, gap 1 — one point short of wanderer), trusted (89 and
35). So the holder spends all four parts of the day on one indoor
Haven chore (partsLeft 3→2→1→0, then idle), committed to
`party_wait` the whole day, while the wave-4 herald waits
unfaced and nobody dies. The story is coherent and a little bleak:
the village's would-be hunting party is out fetching water and
food — the survival errands eat the day the hunt needed. The
mechanism the decomposition names (notRanger 417, away 305) is
visible here in one day: the away three are doing necessary
chores, and the home two are each a single range point short.
Nothing robotic; the frustration is legible, and it is the same
frustration the numbers name.

**Judgment:** the stories still read the same as the original
arm reported them — the re-anchor changed no story, only the
label. The binding question (why the pool is empty) is unchanged:
too few rangers at home, too many away on chores.

## Metric review

The pre-registered metric (classification completeness + binding
first-fail + instrument validity) proved wrong in exactly one
place: bar (c)'s substrate check, as frozen, compares a 12-char
slice to a 9-char expected value and can never pass — so bar (c)
is unsatisfiable, not merely unmet. The metric itself (instrument
validity must include a correct anchor label) is right; the
implementation of the anchor comparison is wrong. Proposed
revision for the NEXT run (after the re-freeze above): keep bars
(a)/(b)/(c) as written, with the anchor comparison fixed to
compare equal-length prefixes (Option A or B above), and keep the
§0/§I positive checks — they are what caught this. No other
metric change is proposed; Leg P, Taxonomy H, and Leg R
definitions stay frozen.

## Instrument limitations (inherited, unchanged)

Per the frozen prereg §"Instrument limitations": no retroactive
classification of the holderstate 36 snapshots; cache staleness
reported not repaired; away-duration units differ by purpose;
trust is a snapshot value; the census live profile is a
recomputation; branch derivation follows code order; the sentinel
guard's scope is the four files (exact only because the committed
diff is exactly those four); a landing re-run of the proof test
requires the frozen `src/` checkout first.

## Infrastructure notes

- **Write flap:** active at run start (registry atomic writes
  failing EPERM ~14:37Z; a window 11:06Z–12:55Z cleared ~12:56Z,
  then re-burst). Probes before work: plain file writes succeeded
  and every write in this run was verified by size/readback
  (instrument files, prooftest log 8991 bytes). No write was
  blocked in this run; nothing was forced or bypassed.
- **Registry lock contention:** heartbeat attempt 14:44Z failed
  ("registry lock held > 120s — heartbeat skipped, retry later");
  retry 14:55Z succeeded ("heartbeat sim-poolfirstfail-reanchor-b").
  The lock was never bypassed and no sibling process was touched.
- **Timeout note:** this run's proof-test re-runs and the
  investigation consumed the run's sim budget; the judged leg was
  never started, so there is no partial judged state to adopt.
- **Overlap guard honored:** `villager-brain.js` and `win-plan.js`
  untouched; Loop A's trees untouched; the held
  `sim-holderstate-b` / `sim-pinquaddoor-b` branches untouched;
  the landed `poolfirstfail-b` instrument files untouched (new
  `-reanchor-b` copies only); original corpora
  `perseed-poolfirstfail-b-106731-106738/` preserved read-only
  (never written into).

## Files

- Prereg: `evidence/2026-11-21/sim-poolfirstfail-reanchor-b-prereg.md`
- Instrument: `scripts/poolfirstfail-driver-reanchor-b.js`,
  `scripts/analyze-poolfirstfail-reanchor-b.js`,
  `scripts/test-poolfirstfail-reanchor-b.js`
- Proof log: `evidence/2026-11-21/poolfirstfail-reanchor-b-prooftest.log`
  (46 passed, 2 failed — both the anchor comparison)
- Evidence: `evidence/2026-11-21/sim-poolfirstfail-reanchor-b.md` (this file)
- NOT produced (judged leg never ran):
  `evidence/2026-11-21/perseed-poolfirstfail-reanchor-b-106731-106738/`,
  `evidence/2026-11-21/poolfirstfail-reanchor-b-analysis.json`,
  `evidence/2026-11-21/poolfirstfail-reanchor-b-legs.log`
- Original corpora (preserved, read-only):
  `evidence/2026-11-21/perseed-poolfirstfail-b-106731-106738/` (8 files)
- Original analysis (comparison):
  `evidence/2026-11-21/poolfirstfail-b-analysis.json`
- `src/` diff: 0 lines (DIAG, recorder wraps only; frozen checkout
  restored and verified).
