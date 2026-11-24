# Loop A round 0215Z — adoption closeout (scale-onramp)

**Run:** fleshout-20261124T0615Z (Loop A, axis scale-onramp).
**Adopted run:** fleshout-20261124T0215Z (Loop A, axis scale-onramp),
which timed out before closeout with both arms finished but unmerged.
**Master at closeout:** `4e9120c2c` (+ this record).

## 0. Stale-lock recovery (run start)

- Lock held `fleshout-20261124T0215Z`, created 2026-11-24T02:22:30Z —
  3h55m old at recovery (06:18Z), past the 90-min fallback.
- Registry: no tree registered for run `fleshout-20261124T0215Z`.
- `ps`: no flesh-out coordinator process; the only heartbeat loops
  belong to journey-deepening r278 / journey2-7 r279 (other lanes).
- Subagents: both 0215Z workers `done` (launchdiag 4b4ae025,
  departname 09fee1e5); no file written in the departname tree in
  the 15 min before recovery.
- Recovery: lock re-read and deleted in the same call (run_id
  matched), claim retired to `.DEAD`, own lock
  `fleshout-20261124T0615Z` + claim written.
- NOT touched: Loop B 0530Z (live claim + running worker
  sim-standing-gearready-b, axis winnability-chain). Loop B landed
  its arm 2 (sim-standing-gearready-b, 3ae2507b5..fcc304f63) on
  local master mid-run; zero overlap with this adoption.

## 1. Arm 1 — sim-launchdiag-a: DIAG-GO (both sub-arms), ALREADY LANDED

Commit `233163022` verified as an ancestor of master at run start;
branch + worktree already released by the dead run's coordinator
before it died. Nothing re-run; nothing re-merged. Evidence:
`evidence/2026-11-24/sim-launchdiag-a.md` (on master).

- (1a) pick-early-return delay-vs-wall (tracker blank #5):
  DIAG-GO. 14/14 days named, 0 unclassified — DELAY 11, WALL 3.
  The dawn body gate is a one-day deferral, not a wall: 11/14
  holders are asked the very next day; the 3 WALLs all resolve by
  D+2 (one repeat early-return, two guard-duty aways). Longest
  silence after a pick-early-return day is 2 days.
- (1b) corpseloot — Omar's corpse thread (tracker blank #3):
  DIAG-GO. 2,376 corpse-takes censused across 41 villages, 0
  unclassified — ALL scholar, 0 villager. The only villager takes
  anywhere are the 4 re-arm takes on the REARM-on leg, all Haven
  channel, 0 witness. Fixture F1–F8 (60/60 checks): a scholar's
  wild gun DOES come home — recoverBearer brings the body to the
  fire one day after death and the Haven sweep takes the gun + 2
  cells — but only with REARM on (F3 takes, F4 does not). A dry gun
  is unlootable by villagers by design. Omar's gun was lost because
  the only villager take path was switched off and the successor
  never walked back to the body.
- Instrument only, zero `src/js` changes.

## 2. Arm 2 — sim-departname-a: GO, LANDED THIS RUN

Branch `sim-departname-a`, adopted at `d862bc18b` (worker verdict
GO, worktree clean). Adoption verification, all from git/files:

- `git fetch origin master`: origin/master `e5dd61e96` is an
  ancestor of local master (local ahead, normal pending-ship
  state) — no divergence.
- Rebased onto current master `fcc304f63` in its worktree, clean,
  no stop-at-pick quirk: prereg `90bc0ac95`, fix `bf73c94d9`,
  record `4e9120c2c`. Fix diff old-vs-rebased on
  `src/js/win-plan.js`: empty (byte-identical).
- Proof re-run on the rebased tip: `scripts/test-departname-a.js`
  **29/29**; analyzer selftest **17/17**; neighboring beat tests
  `test-departbeat-b` 34/34, `test-reseedbeat-b` 30/30,
  `test-winplandepart-b` 18/18, `test-winplan-departures-r265`
  14/14.
- Merged `--ff-only` into master; `git merge-base --is-ancestor
  4e9120c2c master` confirms landed. Tree released
  done-merged, branch deleted, worktree removed. Main tree clean.

The fix (finding #2710, tracker blank #4): departure beats name
companions by true first name, not stranger descriptors — `beatName`
helper in `src/js/win-plan.js` at all five naming sites
(departure, re-seed launch, re-seed commit, expiry, homebody
handoff). Frozen bars: B1 5/5 known beats fixed on repro seeds
(107423 d7 now "Sean sets out with Ethan — the fire marks the
trail."); B2 band 107601–107616 descriptors 21→0 with beat counts
(296→296), deaths (1434→1434) and launches (34→34) identical;
B3 sense test PASS (every fixed line reads as people setting out
by first name); B4 proof + gate PASS (see §4 for the gate on the
merged tip). Text-only by design — no sim outcome moved.
`[needs-eyes]` on the fix commit: feel/dialogue change.
Evidence: `evidence/2026-11-23/sim-departname-a.md`.

Documented follow-ups (evidence §8, not fixed here): whether the
beat should teach the scholar the name (design call — the
`overheard` reveal channel exists); hold lines in
villager-brain.js :736/:768 (same class, silent in corpus —
steve-call whether a hold should speak at all); handoff lines are
not SAY_RE-captured, so the band check cannot see them.

## 3. Wall (this round's judged corpora)

| Corpus | Wins | National | Table | Wave 5 | Median surv. |
|---|---|---|---|---|---|
| launchdiag 1a replay (8 seeds, 150d) | 0 | 0 | 0 | 3/8 | 150d |
| launchdiag 1b frozen bands (41 seeds) | 0 | 0 | — | 3/8 corpsecap; 11/16 rearm legs | 150d |
| departname band 107601–107616 (16 seeds, 150d) | 0* | 0* | 0* | — | — |

\* Departname band is a text-fix before/after: wins/national/table
not instrumented on that corpus (recorded, never faked); deaths
1820→1820 and launches 38→38 identical across all 19 seeds.
The wall did not move — both arms were diagnostic / text-only, as
pre-registered. Villages reach wave 5 and survive to the horizon;
none reaches national and none wins.

## 4. Gate

`node scripts/check.js --quick` on the merged tip `4e9120c2c`
(log `hidden_files/check-quick-0215-adopt.log`): **338 passed, 6
failed in 941s — 0 attributable.**

- 3× load timeouts at exactly 120s (check.js per-script cap, no
  assertion failure, mid-run progress lines):
  `test-living-garden-deed-attainment`,
  `test-one-person-army-deed-attainment`,
  `test-trust-observer-neutrality`. **Re-ran directly (node, no
  120s cap, same merged tip): all three exit 0** — trust-observer
  6/6 (log `hidden_files/check-quick-0215-standalone.log`; the
  per-test logs lived in /tmp and were not retained). Same
  standing profile as the 2015Z gate (335/9) and the departname
  worker's gate on the fixed tree (336/8); the box ran at load
  ~13 with sibling Loop B work.
- 3× proof staleness, all pre-existing at the base:
  `test-measurement-proof-update` ("Proof source inputs are not
  current"), `test-measurement-workflow` (same stale-panel
  family), `test-phone-frame-proof` (retained browser inputs
  mismatch: index.html, alienPlayers.json, build-notes.json,
  foreignSpeech.json, regions.json, statusEffects.js — **none is
  win-plan.js**, this arm's only game file). The worker proved
  the measurement staleness at base `7344d8a56` (retained panel
  differs in 27 sources) and the phone-frame receipts predate the
  base by ~2 weeks. Refreshing these proofs is maintenance work
  owned by the proof-refresh process, not this adoption.
- Notably: `test-measurement-cache-flags`,
  `test-occupation-panels`, and `test-capable-bot` all PASS this
  run (they failed in the 2015Z gate) — the failure count fell
  9 → 6 on the same standing profile.
- Zero `src/js` in the launchdiag arm; the departname arm touches
  only `src/js/win-plan.js` (dialogue naming) plus its own
  scripts/evidence. Neither arm can produce a measurement-proof,
  phone-frame, or deed-attainment failure.

## 5. Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-22/perseed-departname-a-after/*.json' --metrics
national,table,wins,exiled` — REFUSES recorder-corpus input (all 19
rows carry top-level anchorCommit; sweep recorder rows, not runs).
No LOUD lines; baseline NOT rolled. Same refusal as the 2130Z /
0230Z rounds; the launchdiag corpora are frozen replay/analyzer
rows of the same shape.

## 6. Findings backlog

- #2710 (departure-beat physical-description naming): FIXED by
  sim-departname-a — marker already flipped by the worker; the
  0615Z closeout corrected the UPDATE's hashes to the landed
  rebased commits (`bf73c94d9` + `4e9120c2c`).
- #2672 (Omar's corpse thread, inside the contest-guns finding):
  UPDATE appended — launchdiag 1b answers the thread (villagers
  never loot a scholar's/wild corpse except via the two
  REARM-gated channels; Omar's gun lost because the only take path
  was off). Finding stays `[open]` (guns-going-dry question
  continues); the corpse thread is CLOSED as a question.
- Muster finding (82 never-scored holder-days): UPDATE appended —
  launchdiag 1a names the pick-early-return share (DELAY 11 /
  WALL 3, worst case 2 days).

## 7. Metric review

The metrics did their job on both arms: launchdiag's frozen bars
(classification completeness 14/14 and 2,376/2,376, fixture
60/60) and departname's frozen bars (B1–B4 all PASS) judged
exactly what was pre-registered, with no re-scoring. Two
instrument lessons carry forward (both already in the arm
evidence): (1) name-token patterns must accept the name cultures'
full shape (apostrophes, accents — Chepng'etich); (2) handoff
lines need a SAY_RE beat token before any future arm wants band
coverage of them. No metric revision proposed for the next run.

## 8. Village assessment (plain words)

Two loose threads are now tied off with numbers, not stories. The
hungry holder who is never asked turns out to be a one-day story:
people eat, come back to the fire, and get asked the next morning.
And the gun on Omar's corpse was never lost to a bug: the village
only takes a dead man's gun through two narrow doors, and both were
shut. The fireside lines now name people by their names instead of
calling them "a person, maybe 40s" — the village sounds like
people who know each other. Nothing here moves the wall: villages
still reach wave 5, survive, and never reach national or win. The
wall stands where the frozen bands left it.

## 9. Infrastructure

- Machine restart ~01:31Z killed the 0215Z coordinator (per its
  claim notes); a second restart ~03:27Z interrupted the
  departname after-leg three times (worker resumed missing seeds
  only; corpora verified 19/19 valid).
- No EPERM flap observed this run. No safe-commit index clobber
  (no new worker commits; the coordinator commit is evidence-only).
- Master moved once under this run before the adoption (Loop B
  sim-standing-gearready-b landing, 4 commits, zero overlap);
  the departname branch rebased clean onto it.
- Rotation left at 7 (adoption closeout does not cycle it).

## 10. Next blanks (in order, from the 2015Z round + this round)

1. Whether a hunt-locked plan should retarget on a wave-4 meeting
   (design call — changes the lock's purpose).
2. Held departures are silent — whether a hold should speak
   (design call).
3. Whether the departure beat should teach the scholar the name
   (design call — `overheard` channel exists; UI-wide effects).
4. The witness channel question is now Loop B's (rearm-witness
   NO-GO: takers don't fight — why a villager who takes a gun
   never brings it to a fight).
5. Whether waiting matters on bands where the seat stays unready
   longer (long-standing).
