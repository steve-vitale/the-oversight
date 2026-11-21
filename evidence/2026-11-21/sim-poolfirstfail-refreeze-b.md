# sim-poolfirstfail-refreeze-b — DIAG re-freeze + re-judge (Loop B run fleshout-loop-b-20261121T1530Z)

**Arm:** sim-poolfirstfail-refreeze-b, DIAG instrument, re-freeze + re-judge ·
**Loop B run:** fleshout-loop-b-20261121T1530Z, the 1430Z round record's
next blank (1), a coordinator-authorized correction, NOT a re-roll ·
**Axis:** winnability chain · **Branch:** `sim-poolfirstfail-refreeze-b` ·
**Worktree:** `~/workspace/worktrees/sim-poolfirstfail-refreeze-b` ·
**Base:** worktree HEAD `3e13d63d8` · **Frozen base:** `df40fced1`
(`df40fced12a086c28fbe53d3a9696abd02f5b905`) · **Prereg:**
`evidence/2026-11-21/sim-poolfirstfail-refreeze-b-prereg.md` (frozen
~15:59Z, before any judged sim) + **§1 re-freeze amendment**
(~16:12Z, coordinator-authorized, before any judged sim) · **Policy:**
competent verbatim, sha `1884c8852d38` · **Band:** 106731–106738
(re-recorded, same band) · **Horizon:** 150d death-aware ·
**Substrate:** `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1
FIGHTALLY2=1 ALLYSLOT3=1 LAUNCHSURVIVE=1`, `MODE=vre`, recorder ON.

## Verdict: DIAG-GO — the decomposition reproduces exactly, on re-recorded corpora

The proof test is **51 passed, 0 failed**, the analyzer parses **8/8
files with 0 instrument errors**, and every frozen Leg P number
reproduces **exactly**. The re-recorded corpora are byte-identical to
the original arm's corpora after stripping only the expected label
fields (`arm`, `run`, `anchorCommit`, file names) — all 8 files, every
row, including all 6,003 holder-state rows and all 138 pool snapshots.
The anchor defect this arm was authorized to fix is fixed
(`substrateBadFiles` 8 → 0), and the §1 guard-drift that stopped the
first attempt is resolved by the coordinator-authorized §1 re-freeze
amendment (see below). **DIAG-GO.**

## DIAG-GO bar (frozen) — judged

| Bar | Result |
|---|---|
| (a) Classification completeness (0 unclassified pool snapshots, census coverage) | **PASS** — 138 snapshots, 0 problems; census 1030 rows, 1030 distinct days, 0 bad seeds (census day-set C ⊆ daily day-set D, \|C\| ≥ \|D\|−1, AMENDMENT 1: 1030/1051). Every `companionPool` row satisfies counts-sum-to-rosterN, every member's `firstFail` in the frozen set, every non-self member carrying `range{score, profile, gap}` + `trust` + `awayPurpose`. |
| (b) Binding first-fail named with strict plurality | **PASS** — `notRanger` **417** vs next `away` **305** of 781 non-self first-fails (eligible 53, trustLow 6, dead / notAtHaven / engaged / onExped 0). |
| (c) Instrument validity (proof green, selftest green, 8/8 parse, 0 errors, substrate assertions pass) | **PASS** — proof 51/51 green; analyzer selftest 78/78 green; 8/8 files parse, 0 instrument errors; substrate assertions pass (policy sha `1884c8852d38`, all 7 flags `1`, `allyslot3InSrc: false`, anchor base `df40fced12a0`, `substrateBadFiles` 0). |
| **Verdict** | **DIAG-GO** — all three bars hold. |

## The two-attempt history (why this file replaces a STOPPED verdict)

**Attempt 1 — STOPPED at the proof gate (47/48).** The instrument as
first built ran the frozen procedure verbatim: the proof test went 47
passed / 1 failed, the single failure the inherited §1 check
`pool-path files identical between frozen base df40fced1 and HEAD`.
Measured cause: HEAD `3e13d63d8` carries the PROFILEGATE4 lever
(commit `84e57fcc3`, landed in the 1430Z round after the re-anchor
prereg froze) in `src/js/villager-brain.js` (+25/−1) and
`src/js/win-plan.js` (+25/−1), so the `df40fced1`→HEAD `src/` delta is
six files, not the four the re-anchor prereg recorded. The anchor fix
itself was already proven in that run (§0/§I/§4 all pass; the §4 live
run reproduced the original numbers exactly). Per the frozen run
procedure (proof test GREEN before any judged leg), no judged leg ran;
nothing was amended on the spot.

**The §1 re-freeze amendment (~16:12Z, coordinator-authorized).** The
coordinator authorized re-freezing the §1 pool-path identity check
before any judged leg runs, recorded as a dated amendment appended to
the prereg — before any judged sim existed. The rationale was verified
from the real diff, not asserted:

- The full `src/` delta `df40fced1 → HEAD` is exactly six files
  (build.js version stamp only; conversation.js + convo-dialogue.js
  M12-CAP latch; fieldFights.js #2634 downedtwice fix; villager-brain.js
  + win-plan.js PROFILEGATE4).
- The two new pool-path files contain ONLY the PROFILEGATE4 lever:
  `profilegate4On()` / `profilegate4OpenFor()` helpers plus one
  gate-line change in `findCompanion` per file. Across both files: 50
  added lines, 2 removed (both the old gate line), 2 new gate lines;
  every other added line is a comment, blank, contains `profilegate4` /
  `PROFILEGATE4` / `profile-gate`, or one of the six helper-body code
  lines. No other pool-path change exists.
- `PROFILEGATE4` is UNSET in this arm's run env (verified live), so the
  lever is inert even on HEAD's code — `profilegate4OpenFor()` returns
  false and the gate line behaves exactly as the frozen base's.
- The judged leg runs under the frozen `src/` checkout, so HEAD's
  `src/` cannot affect it; the §1 failure was a guard-drift label, not
  a substrate difference in the judged run.

The amended §1 asserts: (1) on-disk `src/` matches the frozen base
(unchanged); (2) the `df40fced1`-vs-HEAD pool-path delta touches ONLY
villager-brain.js + win-plan.js AND is exactly the PROFILEGATE4 lever
(50 added / 2 removed, every added line classified); (3) `PROFILEGATE4`
is unset in the run env. `scripts/test-poolfirstfail-refreeze-b.js`
§1 was updated to assert exactly that; the §0 anchor assertions are
untouched; the frozen bars (a)+(b)+(c) and the reproduction criterion
are untouched.

**Attempt 2 — proof GREEN (51/51), judged leg run.** The first proof
re-run after the amendment went 50 passed / 1 failed — the single
failure a bug in my own new check, not the instrument: the prereg
marker string I asserted (`PROFILEGATE4 is unset in the run env`)
did not match the prereg's actual backticked text (`` PROFILEGATE4`
is unset in the run env``). Fixed the check to match the real text
(one-line change, verified against the file), re-ran: **51 passed, 0
failed**. The judged leg then ran under the same frozen checkout
(legs log `evidence/2026-11-21/poolfirstfail-refreeze-b-legs.log`,
driver exit 0, 8/8 seeds, 0 instrument errors), `src/` was restored
to HEAD immediately after and verified (`git status --short -- src/`
empty, `git diff df40fced1 HEAD -- src/` back to the known 6-file
delta). No commit was made while `src/` differed from HEAD.

## Reproduction criterion (frozen) — judged EXACT

Comparison of the new analysis
(`evidence/2026-11-21/poolfirstfail-refreeze-b-analysis.json`) against
the original (`evidence/2026-11-21/poolfirstfail-b-analysis.json`):
**identical in every number** except the anchor fix itself
(`substrateBadFiles` 8 → 0 in the two instrument bars, verdict
DIAG-NO-GO → DIAG-GO). The corpora comparison is stronger still: all
8 re-recorded files are byte-identical to the originals after stripping
only `arm`, `run`, `anchorCommit`, and file-name labels — the D1
determinism premise holds on the full band, not just the screening seed.

| Criterion item | Original | Re-recorded |
|---|---|---|
| Snapshots / census rows / non-self total | 138 / 1030 / 781 | 138 / 1030 / 781 |
| First-fails: notRanger / away / trustLow / eligible | 417 / 305 / 6 / 53 | 417 / 305 / 6 / 53 |
| First-fails: dead / notAtHaven / engaged / onExped | 0 / 0 / 0 / 0 | 0 / 0 / 0 / 0 |
| Relax fills: profile / away / trust / all (of 104 empty) | 104 / 0 / 0 / 104 | 104 / 0 / 0 / 104 |
| Gap histogram {1, 2, 3, 4, 5} | 78 / 159 / 34 / 130 / 16 | 78 / 159 / 34 / 130 / 16 |
| gapStale | 2 | 2 |
| Binding gate party-no-companion (assessed days) | 134 / 134 | 134 / 134 |
| Legacy: unknown (hU / hE / hS; hs-gate-pick / hs-unexplained / hs-chore-not-finished-no-skip) | 3 (11 / 9 / 0; 8 / 2 / 1), mechanism DENIED | 3 (11 / 9 / 0; 8 / 2 / 1), mechanism DENIED |
| Leg R | 10/10 exact | 10/10 exact |
| Wave-4-target launches (uncounted / first fights) | 37 (30 / 3) | 37 (30 / 3) |
| Wall per seed (days / standing / maxWave / deaths) | 106731 151/325/w5/88 · 106732 151/199/w4/63 · 106733 96/199/w4/62 · 106734 82/195/w4/44 · 106735 150/199/w4/89 · 106736 143/275/w5/67 · 106737 149/470/w5/191 · 106738 129/199/w4/66 | identical, all 8 seeds |

No Leg P number deviates. The band was NOT re-rolled and no bar was
adjusted.

## Leg P — pool-first-fail decomposition (re-recorded band)

- **P1 first-fail tally (non-self 781):** notRanger 417, away 305,
  trustLow 6, eligible 53. Including self/scholar: selfOrScholar 276.
  Eligibility distribution across snapshots: 0 eligible in 104, 1 in
  20, 2 in 10, 3+ in 4.
- **P2 counterfactual relaxations:** relaxing the profile gate fills
  all 104 empty snapshots (104/104); relaxing away fills 0; relaxing
  trust fills 0; relaxing all fills 104. The profile gate alone is the
  binding relax — the next lever (profile-gate relaxation, arm 1's job)
  is pointed at the right place.
- **P3 notRanger gap:** histogram {1: 78, 2: 159, 3: 34, 4: 130, 5: 16};
  gapStale 2 (live profile moved past the cached one). Gap closers:
  snare 78, observant 56, goalExplore 78, potential 47, none 0 — every
  gap-1 member closes via a snare apt part, and no gap is unclosable by
  any named route.
- **P4 away decomposition (305):** expedition|exped|ranger|trustOk 86,
  expedition|exped|nonRanger|trustOk 55, forage 65, water 60, guard 19,
  explore 1, leave 3, plus ranger-away-on-chores (guard 5, water 5,
  forage 4, guard-exped 1) and one water|trustLow. Only 14 of the 305
  away members would have been eligible had they been home — the away
  three on a typical day are doing necessary chores, and most of them
  are non-rangers anyway.
- **P5 trust:** trust distribution <15: 7, 15–24: 33, 25–39: 52, 40+:
  689. Trust gaps: {5: 2, 7: 2, 12: 2} — trust is almost never the
  binding failure (6 trustLow in 781).
- **P6 census supply chain:** 1030 census rows over 1051 daily days;
  rangers alive 737, rangers at home 343, rangers at home trusted 329,
  chain-full days 262. The village has rangers; it does not have them
  home, trusted, and free at the same dawn.
- **P7 splits:** non-ranger holders 124 snapshots / 94 empty; ranger
  holders 14 / 10 — even ranger-led parties usually find nobody.
  Stage split: party 93 / 91 empty, hunt 41 / 13, standing 4 / 0.
- **P8 what-would-have-to-change:** the profile gate. Relaxing it
  fills every empty snapshot; relaxing away or trust fills none. The
  pool is empty because the filter demands wanderer/explorer and the
  village's people are foragers and homebodies — not because they are
  away, untrusted, dead, or engaged.

## Leg R + legacy (reported, not gating)

Leg R reproduces the 10 launcheng unknown days exactly (10/10, same
seed/vid/target/day list as the strikeband4 corpora). Legacy unknown 3
(hU 11, hE 9, hS 0; hs-gate-pick 8, hs-unexplained 2,
hs-chore-not-finished-no-skip 1), mechanism DENIED — identical to the
original arm. The analyzer's legacy completeness line reads FAIL
(unknown 3 > 0) exactly as it did on the original analysis; that line
is the reported legacy state, not a gate — the DIAG bar is (a)+(b)+(c)
only, and all three pass.

## Wall numbers (re-recorded — recomputed by the analyzer, not copied)

- Wins **0** · national by scaleRank ≥ 2: **0** · national by
  standing ≥ 200: **3** · table seats **0** · wave-4 unlocked **8/8**
  · wave-5 unlocked **3/8** · median survival **146d** · survived
  **3/8** · total deaths **670** · starvation deaths **3** ·
  standing-199 stall **4**.
- Per seed (gameDays / standing / maxWave / deaths / end):
  106731 151d/325/w5/88 survived · 106732 151d/199/w4/63 survived ·
  106733 96d/199/w4/62 village-lost · 106734 82d/195/w4/44
  village-lost · 106735 150d/199/w4/89 survived · 106736 143d/275/w5/67
  village-lost · 106737 149d/470/w5/191 village-lost · 106738 129d/199/w4/66
  village-lost.
- Starvation by seed: 106731: 2, 106733: 1, all others 0.

## Reachability verdict

Waves 1–5 are reachable in sim: wave 4 unlocks on 8/8 seeds, wave 5 on
3/8, and the wave-5 villages fight there (seed 106737: 47 v4
encounters, 336 launch-track rows). Regional standing is reached
everywhere (scaleRank regional on all 8). National by standing (≥200)
is reached on 3/8, but national by rank (scaleRank ≥ 2) on 0/8, the
table on 0/8, and the win flag on 0/8. The scale wall stands exactly
where the original arm left it: villages survive to wave 5 and pile up
standing, but the rank/table step never fires. Standing-199 stalls in
4/8 seeds — the same four as the original band.

## Village assessment

The re-record tells the same story as the original, because it IS the
same story — the same villages, day for day. Seed 106731 survives 151
days at standing 325 and wave 5 and still never gets near a seat; seed
106737 survives 149 days at standing 470 — the richest village on the
band — and dies village-lost with 191 deaths. Standing is not the
constraint; the rank step is. The binding mechanism the decomposition
names is unchanged: the party pool is empty because the village's
people are foragers and homebodies (417 notRanger) and the rangers it
does have are out on chores (305 away, only 14 of whom would have been
eligible at home). The profile-gate relaxation (arm 1's lever) is the
named next move, and this re-judge confirms it is aimed at the whole
of the empty-pool problem: relaxing the profile gate fills 104/104
empty snapshots, relaxing anything else fills none.

## Sense-testing (SENSE-TESTING LAW)

Re-read on the **re-recorded** corpora (same band, verified
byte-identical rows after label strip) — the stories read the same as
the original arm reported them, because they are the same rows.

**The village, seed 106731 (151d, survived, standing 325, wave 5):**
the System narrates veteran kills on camera — *"Oh — OH. Everybody
saw that, right? Ming just put down The Callback... on CAMERA. That's
a veteran kill, folks. REMEMBER the name."* (day 28) — and the door
fights read as real, costly stands: *"Ming, Dastan, Luis, Nathan and
Tariq met them at the door — 5 put down. Ming, Dastan, Luis, Nathan,
Tariq are hurt."* (day 8). People fight, get hurt, and keep going;
the narration names them and counts the hurt. That part reads like
people. The narration also keeps score of the wider war: *"Oh — OH.
Everybody saw that, right? Nathan just put down Buffering... on
CAMERA."* (day 34) — veteran kills accumulate, names accumulate, and
still no seat.

**An empty-pool day, end to end (day 109, holder visjoin_106, target
herald, stage party):** the dawn pick is `party_wait` (a HAVEN_CHORE,
chosen over 11 candidates including FORAGE, WATER, HUNT, VISIT and
DUTY rows), because the pool is empty. The re-recorded pool row says
why, with names: Luis Fernandez is away foraging, Nathan Lee is away
fetching water, Nikolai Volkov is away foraging; gen_ickx95o (trust
89) and visjoin_102 (trust 35) are home but foragers (range 1, gap 1
— one point short of wanderer). The holder is itself a forager with
range 0, gap 2 — the party has no ranger at its head either, not just
no ranger to invite. The holder's day, traced part by part, is one
indoor Haven chore (partsLeft 3→2→1→0 across parts 0–2, then idle in
part 3), committed to `party_wait` the whole day, while the wave-4
herald waits unfaced and nobody dies. The story is coherent and a
little bleak: the village's would-be hunting party is out fetching
water and food — the survival errands eat the day the hunt needed.
The mechanism the decomposition names (notRanger 417, away 305) is
visible here in one day: the away three are doing necessary chores,
and the home two are each a single range point short. Nothing
robotic; the frustration is legible, and it is the same frustration
the numbers name.

**Judgment:** the stories still read the same — the re-freeze changed
no story, only the label. The binding question (why the pool is empty)
is unchanged: too few rangers at home, too many away on chores.

## Metric review

The pre-registered metric (classification completeness + binding
first-fail + instrument validity) held this time with no revision
needed: bars (a) and (b) reproduce exactly, and bar (c) passes once
its §1 guard was re-frozen to the measured HEAD. Two metric notes for
the next run:

1. The §1 re-freeze is now part of the frozen record (prereg
   amendment, ~16:12Z). The amended check is a tighter tripwire than
   the identity check it replaces: it pins the exact delta (50 added /
   2 removed, every line classified) instead of asserting emptiness,
   so a future HEAD drift that is NOT exactly this lever still fails
   loudly. Keep it as written.
2. The first proof re-run after the amendment caught a bug in my own
   new check (the prereg marker string missed a backtick) — 50/51
   before the fix, 51/51 after. The check now asserts against the
   prereg's actual text, verified live. No metric change follows; the
   lesson is that a new guard assertion should be verified against the
   file it reads before the gate run, not during it.
3. The driver's per-seed `days` summary field (150/150/97/82/150/143/
   149/129) differs by ±1 from the analyzer's `gameDays` (151/151/96/
   82/150/143/149/129) on three seeds — the analyzer's count is the
   one the prereg criterion quotes, and it reproduces exactly. The
   difference is a counting convention between the driver's summary
   and the analyzer, not a divergence: both are identical to the
   original arm's values on their own terms.

No other metric change is proposed; Leg P, Taxonomy H, and Leg R
definitions stay frozen.

## Balanced panel §15 + telemetry

**Balanced panel: N/A for a DIAG arm — no before/after.** The original
arm's prereg records this explicitly ("balanced panels (N/A for a DIAG
arm: no before/after)"), and it holds here: this arm changes zero
`src/` lines, so there is no game-code before/after pair for
`scripts/balance-panel.js` (sweep-compare) to compare. The §15
function is served instead by the reproduction comparison above: the
same band, same policy, same flags, same horizon, same frozen code,
run twice (original vs re-record) — corpora byte-identical after
label strip, analysis identical except the anchor fix. A panel run now
would execute the CURRENT HEAD `src/` (profilegate + journey changes)
under a different harness and could not speak to Leg P; it was not
run.

**Telemetry check:** `node scripts/telemetry-check.js --baseline
…/telemetry-baselines/scale-wall.json --current
'perseed-poolfirstfail-refreeze-b-106731-106738/*.json' --metrics
national,table,wins,exiled` REFUSES recorder corpora by design
("all 8 --current rows carry top-level anchorCommit, so they are
sweep recorder rows, not runs"). Not forced — the wall numbers were
already compared exactly by the analyzer against the frozen
reproduction criterion, which is the correct instrument for recorder
corpora. No LOUD line, no deviation: the wall is identical to the
original band's.

## Run procedure — what actually happened

1. Prereg frozen before any judged sim (~15:59Z), recording the
   authorization, the one-line anchor change, the bars verbatim, the
   reproduction criterion, and the MEASURED six-file base-identity
   delta.
2. Instrument built per prereg §Instrument: driver + analyzer + test
   copies, diff-verified against the landed `-reanchor-b` files
   (renames + anchor value only). **Zero `src/js` changes in any
   commit.**
3. Frozen `src/` checked out (`git checkout df40fced1 -- src/`). CLI
   guard verified passing; exactly the 6 measured files modified vs
   HEAD; sentinel guard verified live.
4. Proof test run once. Result: RED, isolated to the §1 pool-path
   identity check (47/48). **Judged leg NOT run, per procedure.**
   `src/` restored to HEAD immediately after; verified empty status +
   6-file delta.
5. §1 re-freeze amendment written to the prereg (~16:12Z,
   coordinator-authorized, before any judged sim) with the verified
   diff evidence; test §1 updated to assert the re-frozen expectation
   (amendment marker + name-only + lever-exact + env-unset checks).
6. Frozen `src/` checked out again; CLI guard verified. Proof test
   re-run: 50/51 (my own new check's marker string missed a backtick
   in the prereg text); fixed the check to match the real text;
   re-run: **51/51 GREEN**.
7. Judged leg, same checkout, legs sequential, telemetry to
   `evidence/2026-11-21/poolfirstfail-refreeze-b-legs.log` (driver
   exit 0, 8/8 seeds, 0 instrument errors). `src/` restored to HEAD
   immediately after; verified empty status + 6-file delta. No commit
   made while `src/` differed from HEAD.
8. Analyzer run: `node scripts/analyze-poolfirstfail-refreeze-b.js`
   (analysis JSON written, verdict DIAG-GO). Leg P numbers compared to
   the reproduction criterion: exact on every number; corpora compared
   file-by-file: byte-identical after label strip.
9. Balanced panel §15: N/A (DIAG, no before/after — see above).
   Telemetry check: refused recorder corpora by design (see above).
10. Evidence updated (this file); commit via this worktree's OWN
    `scripts/safe-commit.sh`; claim + lock deletion are the
    coordinator's closeout.

## Instrument limitations (inherited, unchanged)

Per the frozen prereg §"Instrument limitations": no retroactive
classification of the holderstate 36 snapshots; cache staleness
reported not repaired; away-duration units differ by purpose; trust
is a snapshot value; the census live profile is a recomputation; branch
derivation follows code order; the sentinel guard's scope is the four
files (exact only for those four — it does not cover the two
profilegate files; the CLI guard and the run procedure's restore +
verify cover the whole tree); a landing re-run of the proof test
requires the frozen `src/` checkout first. Limitation 11's deferral
("any re-freeze of that check … is a coordinator decision for the next
round") is SUPERSEDED by the §1 re-freeze amendment above — the
coordinator decision has been made and recorded.

## Infrastructure notes

- **Write flap:** no write was blocked in this run. All writes
  (prereg amendment, test edits, proof log 135 lines / 51 PASS,
  legs log 5,514 bytes, 8 corpora, analysis JSON 502,793 bytes)
  verified by size/readback. Nothing was forced or bypassed.
- **Registry / heartbeat:** heartbeats `sim-poolfirstfail-refreeze-b`
  succeeded at run start (~16:12Z) and mid-run. The lock file was never
  bypassed and no sibling process was touched. The sibling confirm arm
  (`sim-profilegate-confirm-b`) was not touched.
- **Timing:** proof test ~100s per run (two runs after the amendment,
  one 50/51, one 51/51); judged leg ~294s for 8 seeds × 150d.
- **Overlap guard honored:** `villager-brain.js` and `win-plan.js`
  untouched (read-only diff inspection); Loop A's trees untouched; the
  held `sim-holderstate-b` / `sim-pinquaddoor-b` branches untouched;
  the landed `poolfirstfail-b` and `poolfirstfail-reanchor-b`
  instrument files untouched (new `-refreeze-b` copies only); original
  corpora `perseed-poolfirstfail-b-106731-106738/` preserved read-only
  (read, never written into).

## Files

- Prereg: `evidence/2026-11-21/sim-poolfirstfail-refreeze-b-prereg.md`
  (frozen ~15:59Z + §1 re-freeze amendment ~16:12Z)
- Instrument: `scripts/poolfirstfail-driver-refreeze-b.js`,
  `scripts/analyze-poolfirstfail-refreeze-b.js`,
  `scripts/test-poolfirstfail-refreeze-b.js`
- Proof log: `evidence/2026-11-21/poolfirstfail-refreeze-b-prooftest.log`
  (51 passed, 0 failed)
- Corpora (re-recorded):
  `evidence/2026-11-21/perseed-poolfirstfail-refreeze-b-106731-106738/`
  (8 files, byte-identical to the originals after label strip)
- Analysis: `evidence/2026-11-21/poolfirstfail-refreeze-b-analysis.json`
  (verdict DIAG-GO)
- Leg log: `evidence/2026-11-21/poolfirstfail-refreeze-b-legs.log`
  (driver exit 0)
- Evidence: `evidence/2026-11-21/sim-poolfirstfail-refreeze-b.md` (this file)
- Original corpora (preserved, read-only):
  `evidence/2026-11-21/perseed-poolfirstfail-b-106731-106738/` (8 files)
- Original analysis (comparison):
  `evidence/2026-11-21/poolfirstfail-b-analysis.json`
- `src/` diff: 0 lines (DIAG, recorder wraps only; frozen checkout
  restored and verified against the measured 6-file delta).
