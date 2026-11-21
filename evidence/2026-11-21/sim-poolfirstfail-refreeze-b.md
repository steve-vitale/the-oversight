# sim-poolfirstfail-refreeze-b — DIAG re-freeze + re-judge (Loop B run fleshout-loop-b-20261121T1530Z)

**Arm:** sim-poolfirstfail-refreeze-b, DIAG instrument, re-freeze + re-judge ·
**Loop B run:** fleshout-loop-b-20261121T1530Z, the 1430Z round record's
next blank (1), a coordinator-authorized correction, NOT a re-roll ·
**Axis:** winnability chain · **Branch:** `sim-poolfirstfail-refreeze-b` ·
**Worktree:** `~/workspace/worktrees/sim-poolfirstfail-refreeze-b` ·
**Base:** worktree HEAD `3e13d63d8` · **Frozen base:** `df40fced1`
(`df40fced12a086c28fbe53d3a9696abd02f5b905`) · **Prereg:**
`evidence/2026-11-21/sim-poolfirstfail-refreeze-b-prereg.md` (frozen
~15:59Z, before any judged sim) · **Policy:** competent verbatim, sha
`1884c8852d38` · **Band:** 106731–106738 (re-recorded, same band) ·
**Horizon:** 150d death-aware · **Substrate:** `SENSEEXPED=1
PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 ALLYSLOT3=1
LAUNCHSURVIVE=1`, `MODE=vre`, recorder ON.

## Verdict: STOPPED — proof gate RED on §1 (pool-path identity), not the anchor; judged leg NOT run

The proof test is **47 passed, 1 failed** (exit 1), and the single
failure is NOT the defect this arm was authorized to fix. Per the
frozen run procedure (step 4: proof test GREEN before any judged
leg) and the brief's stop rule ("if anything else fails, STOP and
report, do not proceed to judged legs"), **no judged leg ran** —
there are no re-recorded corpora, no
`perseed-poolfirstfail-refreeze-b-106731-106738/` dir, no analysis
JSON, no balanced panel. This is the procedure working as designed
for the second time in a row: a frozen guard caught a real state
change before any judged sim spent.

**The anchor defect is FIXED — both re-anchor failures now pass.**
§0 positive (synthetic corpus stamped with the frozen base passes
the substrate check), §I positive (same check inside the analyzer
selftest), §0 live-positive (the §4 live 150d run's `anchorCommit`
is the full frozen base even though HEAD has moved), and the
analyzer selftest is 78/78 green. The re-freeze did exactly what
the coordinator authorized: `EXPECTED.anchor12` is now
`'df40fced12a0'`, the true 12-char prefix, and the 12-char slice
comparison passes on a correct stamp.

**The failure, measured:** the inherited §1 check `pool-path files
identical between frozen base df40fced1 and HEAD` fails because
HEAD has moved since the re-anchor prereg froze: `git diff
df40fced1 HEAD -- <pool-path files>` is non-empty. The delta is
exactly the PROFILEGATE4 lever (`84e57fcc3`, sim-profilegate-b,
landed in the 1430Z round after the re-anchor prereg froze):
`src/js/villager-brain.js` (+26) and `src/js/win-plan.js` (+26) —
`profilegate4On()` / `profilegate4OpenFor()` helpers plus one
gate-line change in `findCompanion` in each file
(`if (!profilegate4OpenFor(self, vid) && prof !== 'wanderer' &&
prof !== 'explorer') continue;`). The whole `src/` delta
`df40fced1 → HEAD` is now six files, not the four the re-anchor
prereg recorded. The failure was pre-registered in this arm's
prereg (Base-identity check, measured before the proof test ran),
so it is a confirmed HEAD fact, not a surprise and not a re-score.

**What the failure does and does not mean:**

- It does NOT mean the judged leg would have run the wrong code.
  The judged leg runs the frozen `src/` checkout, and the CLI
  guard (`git diff --quiet df40fced1 -- src/` exit 0) plus the
  per-`oneRun()` sentinel guard (all four frozen blob hashes
  verified) both pass — the on-disk `src/` under the frozen
  checkout IS the frozen base's `src/`, byte-identical to the
  original arm's code. The §4 live run proves it again: 378
  holder-state rows (126/126/126), 21 gate picks, 27 seed rows,
  **23 pool rows**, **148 census rows** on seed 106731 — the
  original arm's numbers exactly.
- It does NOT mean the pool filter changed in a way this arm can
  certify: the sibling §1 check (no added/removed pool-filter
  line matching `findCompanion|npcRangeProfile|npcRangingApt|
  RANGY_OCC`) PASSES — no +/- line in the brain/win-plan diff
  carries those tokens. But the gate LINE itself changed (the
  `profilegate4OpenFor` call wraps the wanderer/explorer test),
  so the pool path's behavior is no longer identical between the
  frozen base and HEAD when `PROFILEGATE4=1`. In this arm's env
  the flag is unset (the lever is off), and the judged leg would
  have run frozen code anyway — but the §1 check as frozen
  asserts identity, and identity is false.
- It DOES mean the frozen guard's premise went stale under a
  landing the brief did not account for. The brief names base
  `3e13d63d8` (which already contains profilegate) and expects
  48/48, but also carries the re-anchor procedure's "known 4-file
  delta" wording, which predates the profilegate landing. The
  prereg corrected that wording by measurement before the gate
  ran (six-file delta), and the gate confirmed it.

**What was NOT done about it:** nothing was amended. Adapting the
§1 check — e.g. asserting the `df40fced1`-vs-HEAD pool-path delta
is exactly the env-gated PROFILEGATE4 lever — would be a change
to a frozen guard beyond the one authorized change (the anchor
line), and a judgment about guard semantics that belongs to the
coordinator, not this arm. The brief's stop rule exists for
exactly this case. The verdict below is reported as measured,
never re-scored.

## DIAG-GO bar (frozen) — judged

| Bar | Result |
|---|---|
| (a) Classification completeness (0 unclassified pool snapshots, census coverage) | **UNMEASURED** — no re-recorded band exists; the judged leg did not run. Original band: 138 snapshots, 0 problems, census 1030 (quoted, not re-derived). |
| (b) Binding first-fail named with strict plurality | **UNMEASURED** on new corpora. Original band: `notRanger` 417 vs `away` 305 of 781 non-self (quoted). |
| (c) Instrument validity (proof green, selftest green, 8/8 parse, 0 errors, substrate assertions pass) | **FAIL** — proof 47/48 green, selftest 78/78 green; the single failing check is §1 pool-path identity (HEAD drift, profilegate — see above). All anchor checks pass. |
| **Verdict** | **STOPPED** (bar (c) fails on §1; bars (a)/(b) unmeasured because the proof gate stopped the run before the judged leg). |

## What the re-freeze itself proved (all measured)

The re-freeze — the actual deliverable of this arm — works, and
the instrument copies are proven correct. Every check that
touches them passes:

- **§0 (7/7):** driver stamps the frozen base as a constant
  (`FROZEN_BASE`); driver carries the CLI guard + per-`oneRun()`
  sentinel guard; no HEAD lookup left in the driver for the
  anchor; `EXPECTED.anchor12` is `df40fced12a0`; prereg forbids
  post-hoc amendment; the old bad stamp `38692c34c24b` fails the
  substrate check (negative); the frozen-base stamp passes
  (positive).
- **§0 live-positive: PASS.** The §4 live 150d run's
  `anchorCommit` is the full frozen base even though worktree
  HEAD (`3e13d63d8`) has moved.
- **Guards verified live:** CLI guard passes under the frozen
  checkout (`git diff --quiet df40fced1 -- src/` exit 0);
  `sentinelCheck()` passes on the frozen checkout (all four blob
  hashes verified independently against `git show
  df40fced1:<path>` before the run); the six files differing vs
  HEAD are exactly the measured delta (4 known + 2 profilegate).
- **§4 live 150d shape run (seed 106731) reproduces the original
  arm's numbers exactly:** 378 holder-state rows
  (part-start/tick-entry/tick-exit 126/126/126), 21 gate picks,
  27 seed rows, **23 pool rows**, **148 census rows**, 0
  instrument errors — the same counts the original prereg's
  AMENDMENT 2 cites for this seed. The copied driver behaves
  identically to the original under identical code.
- **§5 D1/D2: PASS.** Identical full corpus on repeat (recorder ON
  twice, 30d), identical trajectories recorder ON vs OFF,
  recorder-off run carries empty recorder arrays, 0 instrument
  errors.
- **§1 (15/16, only pool-path identity fails):** on-disk `src/`
  matches the frozen base; no added/removed pool-filter line;
  driver + analyzer + test are the new `-refreeze-b` files;
  prereg exists and freezes the bar, Leg P, Taxonomy H, the
  band, AMENDMENTS 1+2, and the overlap guard.
- **§3 fixture (all pass):** `seedOf` on the synthetic corpus —
  1 instance, candidate-not-bid, H explains d12 as
  `hs-engaged-skip`, Leg P 2 snapshots / 0 problems / census 12 /
  binding `notRanger` 3.
- **Analyzer selftest 78/78:** §A–§H all green, §I 4/4 green
  (the positive anchor check that failed in the re-anchor arm
  now passes). Leg R reproduces the 10 launcheng unknown days
  exactly.
- **Copy hygiene (caught by diff review before the gate ran):**
  a naive rename of `poolfirstfail-reanchor-b` misses the driver
  filename (`poolfirstfail-driver-reanchor-b` does not contain
  that substring) — the first copy left 4 driver-filename refs
  in the driver (header, usage line, `firstCallerFrame`,
  `fightOrigin`) and 9 in the test (§0/§1 driver-source reads,
  new-file check, §4 require, §5 childRun) pointing at the OLD
  driver. Fixed before the proof run; the final diffs
  reanchor→refreeze are only the authorized renames + the anchor
  value (driver 48 diff lines, analyzer 32, test 52). The
  remaining `df40fced1` occurrences in the refreeze copies are
  full hashes (as a prefix), `git df40fced1` refs (still a valid
  abbreviation), or historical comments — none is an anchor
  assertion.

**Proof log:** `evidence/2026-11-21/poolfirstfail-refreeze-b-prooftest.log`
(47 passed, 1 failed, 9,183 bytes; the one failure is §1
pool-path identity).

## Run procedure — what actually happened

1. Prereg frozen before any judged sim (this arm's file,
   ~15:59Z), recording the authorization, the one-line change,
   the bars verbatim, the reproduction criterion, and the
   MEASURED six-file base-identity delta (correcting the brief's
   stale "4-file" wording by measurement).
2. Instrument built per prereg §Instrument: driver + analyzer +
   test copies, diff-verified against the landed `-reanchor-b`
   files (renames + anchor value only, plus the driver-filename
   fix above). **Zero `src/js` changes in any commit.**
3. Frozen `src/` checked out (`git checkout df40fced1 -- src/`).
   CLI guard verified passing; exactly the 6 measured files
   modified vs HEAD; sentinel guard verified live.
4. Proof test run once. Result: RED, isolated to the §1
   pool-path identity check. **Judged leg NOT run, per
   procedure.**
5. `src/` restored to HEAD immediately after the proof run:
   `git checkout HEAD -- src/`; `git status --short -- src/`
   empty; `git diff df40fced1 HEAD -- src/` back to the measured
   6-file delta. Verified. No `src/` change committed, ever.
6. Analyzer + balanced panel §15: **not run** — there are no
   re-recorded corpora to analyze. Telemetry check: not run —
   same reason (no new corpora; the original band's corpora are
   not re-checked here).

## What the next run needs (coordinator decision, not mine)

A re-freeze of the §1 pool-path identity expectation, then this
arm's procedure re-runs cleanly (proof + judged leg + analyzer +
panel) with the instrument already built and proven:

- **Proposed (the narrowest re-freeze):** the §1 check asserts
  the `df40fced1`-vs-HEAD pool-path delta is EXACTLY the
  PROFILEGATE4 lever — the two files
  (`villager-brain.js`, `win-plan.js`), the added
  `profilegate4On` / `profilegate4OpenFor` helpers, and the one
  gate-line change per file — with `PROFILEGATE4` unset in the
  run env (the lever off) and the judged leg still running the
  frozen `src/` checkout. The `poolPathDiff === ''` assertion
  becomes a "delta is exactly this" assertion, frozen in the
  next prereg before any judged sim. The sibling regex check
  (no added/removed pool-filter line) already passes and stays.
- **Alternative:** drop the `df40fced1`-vs-HEAD identity check
  from §1 entirely, on the grounds that the frozen checkout +
  CLI guard + sentinel guard already prove the judged leg runs
  the frozen code, and HEAD's content is irrelevant to the
  corpora. This weakens the guard more than the narrow re-freeze
  and is NOT recommended — the narrow version keeps a tripwire
  on HEAD drift.
- Either way the prereg must be re-frozen (the check is a frozen
  definition, and this run stopped instead of amending it).
  After the re-freeze, the expected outcome is DIAG-GO on the
  reproduction criterion (the §4 live run already reproduces the
  original numbers exactly, the anchor checks all pass, and the
  original analysis's Leg P numbers stand quoted below). The
  re-recorded band, the judged leg, and the panel are all still
  to do; nothing here pre-judges them.

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

No re-recorded corpora exist, so the stories below are re-read
from the **original** corpora (same band, preserved read-only,
verified live from
`perseed-poolfirstfail-b-106731-106738/poolfirstfail-b-s106731-poolfirstfail-b-vre.json`)
— the re-judge's re-read is owed on the re-record, once the §1
re-freeze lands. The §4 live run's exact reproduction (378 holder
rows, 23 pool rows) says the re-record will tell the same stories.

**The village, seed 106731 (151d, survived, standing 325, wave 5):**
a village that survives everything except winning. The System
narrates veteran kills on camera — *"Oh — OH. Everybody saw that,
right? Ming just put down The Callback... on CAMERA. That's a
veteran kill, folks. REMEMBER the name."* (day 28) — and the door
fights read as real, costly stands: *"Ming, Dastan, Luis, Nathan
and Tariq met them at the door — 5 put down. Ming, Dastan, Luis,
Nathan, Tariq are hurt."* (day 8). People fight, get hurt, and keep
going; the narration names them and counts the hurt. That part
reads like people. The narration also keeps score of the wider war:
*"Oh — OH. Everybody saw that, right? Nathan just put down
Buffering... on CAMERA."* (day 34) — veteran kills accumulate,
names accumulate, and still no seat.

**An empty-pool day, end to end (day 109, holder visjoin_106,
target herald, stage party):** the dawn pick is `party_wait`
(a HAVEN_CHORE, chosen over 11 candidates including FORAGE,
WATER, HUNT, VISIT and DUTY rows), because the pool is empty.
The pool row says why, with names: Luis is away foraging, Nathan
is away fetching water, Nikolai is away foraging; gen_ickx95o
(trust 89) and visjoin_102 are home but foragers (range 1, gap 1
— one point short of wanderer). The holder's day, traced
part by part, is one indoor Haven chore (partsLeft 3→2→1→0 across
parts 0–2, then idle in part 3), committed to `party_wait` the
whole day, while the wave-4 herald waits unfaced and nobody dies.
The story is coherent and a little bleak: the village's would-be
hunting party is out fetching water and food — the survival
errands eat the day the hunt needed. The mechanism the
decomposition names (notRanger 417, away 305) is visible here in
one day: the away three are doing necessary chores, and the home
two are each a single range point short. Nothing robotic; the
frustration is legible, and it is the same frustration the numbers
name. (One nuance the row adds against the re-anchor retelling:
the holder is itself a forager with range 0, gap 2 — the party
has no ranger at its head either, not just no ranger to invite.)

**Judgment:** the stories still read the same as the original
arm reported them — the re-freeze changed no story, only the
label. The binding question (why the pool is empty) is unchanged:
too few rangers at home, too many away on chores.

## Metric review

The pre-registered metric (classification completeness + binding
first-fail + instrument validity) proved wrong in exactly one
place this time, and it is a different place than last time:
bar (c)'s §1 pool-path identity check, as frozen, asserts
`df40fced1`-vs-HEAD pool-path identity — true when the re-anchor
prereg froze (HEAD `238dcf94b`), false at this HEAD
(`3e13d63d8`) after the profilegate landing. The metric itself
(instrument validity must include "the code the judged leg runs
is the frozen code") is right, and the runtime guards that
actually enforce it (CLI guard, sentinel guard, frozen checkout)
all pass; the static §1 check is a proxy for that property, and
the proxy went stale when HEAD's pool path moved. Proposed
revision for the NEXT run (after the re-freeze above): keep bars
(a)/(b)/(c) as written, with the §1 check re-frozen to assert the
delta is exactly the env-gated PROFILEGATE4 lever (narrow
re-freeze above), and keep the §0/§I positive anchor checks —
they are what proved the re-freeze. No other metric change is
proposed; Leg P, Taxonomy H, and Leg R definitions stay frozen.
Note for the record: this is the second consecutive run stopped
by a frozen guard whose premise moved under a landing (anchor
comparison, then pool-path identity). The guards are doing their
job; the cost is a round-trip per stale premise. A standing
"re-freeze the guards to the new HEAD" step at run start — before
the prereg freezes — would have caught both.

## Instrument limitations (inherited, unchanged)

Per the frozen prereg §"Instrument limitations": no retroactive
classification of the holderstate 36 snapshots; cache staleness
reported not repaired; away-duration units differ by purpose;
trust is a snapshot value; the census live profile is a
recomputation; branch derivation follows code order; the sentinel
guard's scope is the four files (exact only for those four — it
does not cover the two profilegate files; the CLI guard and the
run procedure's restore + verify cover the whole tree); a landing
re-run of the proof test requires the frozen `src/` checkout
first; the §1 pool-path identity check is NOT re-defined here
and any re-freeze of it is a coordinator decision for the next
round.

## Infrastructure notes

- **Write flap:** no write was blocked in this run. Probes
  before work: the prereg write (24,892 bytes) and all instrument
  writes verified by size/readback; proof log 9,183 bytes,
  verified by tail. Nothing was forced or bypassed.
- **Registry / heartbeat:** heartbeat `sim-poolfirstfail-refreeze-b`
  succeeded at run start (~15:59Z). The lock file was never
  bypassed and no sibling process was touched.
- **Timeout note:** the proof test ran once (~49s wall) and the
  run stopped at the gate; no judged leg was started, so there
  is no partial judged state to adopt.
- **Overlap guard honored:** `villager-brain.js` and `win-plan.js`
  untouched (read-only diff inspection); Loop A's trees
  untouched; the held `sim-holderstate-b` / `sim-pinquaddoor-b`
  branches untouched; the landed `poolfirstfail-b` and
  `poolfirstfail-reanchor-b` instrument files untouched (new
  `-refreeze-b` copies only); original corpora
  `perseed-poolfirstfail-b-106731-106738/` preserved read-only
  (read, never written into).

## Files

- Prereg: `evidence/2026-11-21/sim-poolfirstfail-refreeze-b-prereg.md`
- Instrument: `scripts/poolfirstfail-driver-refreeze-b.js`,
  `scripts/analyze-poolfirstfail-refreeze-b.js`,
  `scripts/test-poolfirstfail-refreeze-b.js`
- Proof log: `evidence/2026-11-21/poolfirstfail-refreeze-b-prooftest.log`
  (47 passed, 1 failed — the one failure is §1 pool-path identity)
- Evidence: `evidence/2026-11-21/sim-poolfirstfail-refreeze-b.md` (this file)
- NOT produced (judged leg never ran):
  `evidence/2026-11-21/perseed-poolfirstfail-refreeze-b-106731-106738/`,
  `evidence/2026-11-21/poolfirstfail-refreeze-b-analysis.json`,
  `evidence/2026-11-21/poolfirstfail-refreeze-b-legs.log`
- Original corpora (preserved, read-only):
  `evidence/2026-11-21/perseed-poolfirstfail-b-106731-106738/` (8 files)
- Original analysis (comparison):
  `evidence/2026-11-21/poolfirstfail-b-analysis.json`
- `src/` diff: 0 lines (DIAG, recorder wraps only; frozen checkout
  restored and verified against the measured 6-file delta).
