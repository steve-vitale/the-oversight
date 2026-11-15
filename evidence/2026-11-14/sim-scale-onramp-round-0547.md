# Scale-onramp round — run fleshout-20261115T0547Z (Loop A)

Axis: scale-onramp (converging, NOT converged). Loop B live on winnability
chain throughout — first the 0411Z run (funeral-mend-b + fighterhold-b),
which landed mid-run (funeral-mend-b b9b226430, fighterhold-b 5aa0863e2
already on master), then a fresh 0621Z run (successorcaution-b +
proofrefresh-b20) — NOT touched. Master moved once under this run (Loop B
funeral-mend landing b9b226430); both arms rebased clean onto it, zero file
overlap, proofs green after every rebase.

This run takes the 0427Z next blanks (1) OVE-48 fresh-band survival re-test
and (2) RNG-draw-parity probe, in order. Both are DIAG arms against the
same question from opposite directions: does the band-3 survival gap
(3/8 → 0/8) reproduce on a fresh band, and is there a draw-volume
mechanism that could carry it?

## Arm 1 — sim-ove48-freshband-a (DIAG, blank #1)

Verdict: UNMEASURED — baseline gate failed, no subject leg cut.
Commits (rebased onto master tip b9b226430, merged ff-only 0f53244b9):
prereg + step + proof 55c895dd8 (rebased ce5a61083, stage-1 50/50),
baseline corpus + evidence f95607150 (rebased 0f53244b9, stage-2 17/17).
Proof scripts/test-ove48-freshband.js: stage-2 17/17 on the rebased tip.
Zero src/js. Subject branch transplant-15a-narrowed-subject untouched at
493d7a975 (verified 1 commit on the far end, tree 6d6216e3…, 3 files
+320/-3).

Judged numbers (fresh band 190561–190568, verified fresh: zero hits in any
.md under evidence/ or hidden_files/, 150d, competent verbatim walk-out,
standing fix f8fda4295a99 swapped in):
- Baseline leg (far end 203a32775, STEP t-ove48-freshband-base): 1/8
  survived (190562 only, 150d; others 81–132d), median 103d — below the
  pre-registered gate of ≥3/8, so the arm STOPPED per the binding bar and
  the 8c precedent. No subject leg was run; no CARRIER / NOT-CARRIER /
  AMBIGUOUS verdict is recorded on this band.
- Wall: wave-4 8/8, wave-5 1/8 (190563 only), regional 8/8, national 0,
  table 0, wins 0, 717 deaths (villager combat 290, expedition 197,
  combat 99, starvation 2 — villages die fighting, not hungry).
  Tribute ready 1/8 (190562 only — the sole seed with 2 living wave-4+
  veterans). Standing strikingly flat: 7/8 seeds end at exactly 199.
  Mechanism diagnostic (not judged): 774 opens, dawn-aligned 31.2%
  (band-3 baseline was 28.7%), dawn-priority reads 0 as expected on the
  far end. Validity V1–V5 pass.
- The band-3 CARRIER verdict stands on its own band; this band neither
  confirms nor overturns it. The far end now reads 4/8, 1/8, 3/8, 1/8
  across four bands: the band itself moves survival by three seeds,
  which is why the gate exists — this is the second band it has caught
  (8c's fresh band first).

Sense-testing: 291 vetSays lines read — villages read like people
(named veteran kills on camera, System audience voice,
teaching/knowledge beats, ARC IV + Mirror Draft reached on the
surviving seed). One corroboration, no new backlog entry: the
Blooded-beat-vs-flag reverse case again (0 beats, flag true on 3
seeds). One mild same-day low-trust refusal repeat (190561 d2) — not a
stuck loop.

Evidence: evidence/2026-11-14/sim-ove48-freshband-a.md (+ prereg).

## Arm 2 — sim-ove48-drawparity-a (DIAG, blank #2)

Verdict: PARITY-OK — the RNG-draw-drift candidate carrier is dead as a
systematic effect.
Commits (rebased onto master tip 0f53244b9, merged ff-only 2e21f87da):
prereg + instrument 7ebf3777c (rebased 829f78230, stage-1 22/22 at the
time), judged corpora + determinism re-runs + evidence + driver fix
2bdca6de3 (rebased f0daff57c), proof-test fix 908f734d9 (rebased
2e21f87da). Proof scripts/test-ove48-drawparity.js: stage-1 23/23,
stage-2 23/23 on the rebased tip. Zero src/js. Subject branch untouched
at 493d7a975 (verified 1 commit on the far end, 3 files +320/-3).

Judged numbers (deliberate reuse of band 190457–190464, 150d, competent
verbatim, standing fix swapped in; pure pass-through Math.random draw
counter — wraps the seeded RNG, consumes no draws, writes no game
state; determinism re-runs exact on both legs):
- Per-seed total draws, subj − base: −56,693 / +9,379 / −155,284 /
  +28,962 / +23,130 / −121,381 / +383,142 / +76,576. Median +16,254.5;
  total +187,831; positive 5/8, negative 3/8 → sign MIXED → PARITY-OK
  (PARITY-FAIL needed positive on ≥7/8). A carrier that points both
  ways cannot carry a one-way survival collapse.
- Pick loop: exactly 10.0 draws per weighted pick on BOTH legs, every
  seed; weighted picks 515 vs 569 (conv counts replicated exactly), so
  the pick-loop delta is exactly +540 = 54 × 10 (0.015% of ~3.5M
  total). The `dawn` read draws 0. 99.3% of the total delta is the
  `other` bucket (chaotic downstream divergence, both signs).
- Timing: draw streams part d2–d10, preceding deathDiv on 6/8 seeds
  (same day on the other 2); deathDiv reproduced 8/8.
- Validity V1–V5 all pass: opens 875/935, per-seed days match conv
  corpora exactly on all 16 seed-legs, survived 3/8 vs 0/8, dawn reads
  0/569, 0 instrument errors. Draws/day actually LOWER on the subject
  (3,503 vs 3,586) — the total delta is a lifespan artifact.
- Wall (context, not the verdict): national/table/wins 0/0/0 both legs;
  wave-5 0/8 base, 4/8 subj.

CORRECTION (disclosed in the arm evidence, carried here): the mech
evidence's "515 vs 569 (RNG draws)" label was WRONG — those are
weighted-pick OPENS, not draws. Real draw counts are now measured
(~3.5M per band, pick loop 10.0/pick). The sim-findings RNG-drift
entry is marked fixed with this correction.

Instrument bug found and fixed (judged numbers unaffected — V2
replication proves the observer pure): `setupDraws` for seeds 2–8
included the previous seed's run total (process-global counter zeroed
only at the run-phase boundary). Corrected arithmetically — setup
draws identical on 8/8 seeds — and the driver is fixed post-judgment
(reset before `loadGame`, stage-1 check added). Analyzer untouched;
its output stands as the judged record.

Evidence: evidence/2026-11-14/sim-ove48-drawparity-a.md (+ prereg,
ove48-drawparity-comparison.json).

## Coordinator decision — the OVE-48 survival question rests here

The 0/8 has now survived every mechanism probe aimed at it:
- Semantic path: PROVEN NEGATIVE (ove48-mech, 0215Z).
- Spoken-drive channel: settled GO on the real transcript
  (talktranscript, 0427Z); OVE-48 KEEP stands.
- Draw-volume path: PARITY-OK (this run) — no systematic extra-draw
  carrier; the +54 is 54 opens × 10 draws, 0.015% of the stream.
- Held-conversation reproduction: does NOT reproduce (ove48-mech:
  subject 4/8 vs far end 3/8 under COMPETENT_TALK=1).
- Fresh-band reproduction: UNMEASURED twice over — the far end
  itself reads 1/8 on fresh bands (8c, then this run), so no fresh
  band has yet given the question a healthy baseline to judge against.

No further fresh band is proposed by this run. A third fresh band
would test band health more than OVE-48: the gate has now caught two
bands in a row, and the band-3 CARRIER (3/8 → 0/8) stands on its own
band with no mechanism behind it — that is the recorded state, not a
verdict waiting on one more band. The next run takes the transplant
program forward: family 6b + narrowed 7b, then 2b AMBIGUOUS, then the
four conflicted PR #22 hunks as a family. Headcount-ceiling stays a
Steve-call; Reunion mirror pack in the wild stays a Steve design call.

## Wall (this run's judged corpora)

Freshband baseline: survived 1/8, median 103d, wave-5 1/8, national /
table / wins 0. Drawparity legs: survived 3/8 base vs 0/8 subj
(band-3 gap reproduced on the original band as context), wave-5 0/8
vs 4/8, national / table / wins 0. No new before/after sims beyond
these two arms; no game-code change anywhere in this run.

## Telemetry deviation check

REFUSED (recorder-corpus class, as for all prior bisect/transplant
arms) — `node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-14/perseed-ove48-conv-t-ove48-freshband-base/*.json'
--metrics national,table,wins,exiled` refuses recorder corpora
(per-seed rows carry anchorCommit + sweep recorder fields, not run
baselines). Baseline NOT rolled, no LOUD lines. (The drawparity
corpora are likewise recorder-class; same refusal applies.)

## Infrastructure

- Service restart SIGTERM'd the first registration batch mid-flight
  (exit 15 after ~10 min; first tree registered, second not started).
  No partial state: the second worktree did not exist, no registry
  entry, no gitdir. Re-ran the second registration alone — clean.
  The stale REGISTRY.lock left behind is flock-guarded, not a blocker
  (no holder; the next registration acquires it normally).
- Rebase stop-at-pick quirk hit once (freshband rebase, 2nd pick):
  tree clean + pick's files absent in the worktree (verified with
  `git diff <pick> -- <files>` non-empty), recovered with `git rebase
  --continue` — sailed through, commits byte-identical after rebase
  (empty patch diffs on touched files for all 5 commits across both
  arms). Drawparity rebase 3/3 clean first try.
- Safe-commit index clobber struck on worker commits (both arms) —
  repaired with the documented ls-tree pipe each time, commits
  verified correct. No clobber on the coordinator commit.
- Heartbeat slowness: worktree-heartbeat took ~8 min and ~2.7 min
  (registry-lock contention from the reaper's long scan) — heartbeats
  still landed (06:03Z both trees).
- Proof verification on merged master: both stage-2 suites fail
  exactly ONE check each — the "on arm branch" guard, stale by
  design once merged (freshband 16/17, drawparity 22/23 on master;
  17/17 and 23/23 on the rebased tips where the verdicts were
  judged). All content checks pass on master. Not a re-score: the
  verdicts stand as judged on the rebased tips.
- Worker self-caught process note (freshband): a step invocation
  piped through `tail` masked the step's exit code — classification
  was verified directly from the summary JSON instead; recorded in
  the arm evidence. Same lesson family as the 0427Z masked-merge
  exit (AGENTS.md).
- `git gc` warning at merge time (too many unreachable loose
  objects; `.git/gc.log` present) — housekeeping for the ship loop,
  not this run. check.js --quick NOT re-run (zero src/js both arms;
  loop precedent).
- No EPERM flap this run (one SIGTERM service restart only).

## Metric review

- The freshband prereg's baseline-gate design worked as intended on
  a second band (gate caught a 1/8 far end before any subject spend).
  The CARRIER / NOT-CARRIER / AMBIGUOUS bar was never reached, so no
  re-scoring question arises. The gate's cost is real: two fresh
  bands in a row have burned their arms at the gate — the next
  transplant prereg should consider a smaller band-health pre-check
  (e.g. 3–4 seeds) before committing the full 8-seed baseline leg.
- The drawparity prereg's PARITY-FAIL bar (median > 0 AND total ≥ +40
  AND ≥7/8 same-sign) killed the candidate cleanly on the sign leg:
  the median and total both point positive, but 3/8 seeds point the
  other way by hundreds of thousands — the bar's sign requirement is
  doing the work it was designed for. The "515 vs 569 draws" label
  correction is a measurement-hygiene fix, not a re-score: the judged
  bars used the measured draw counts, never the label.
- No re-scoring anywhere in this run: both arms judged against their
  committed preregs.

## Findings appended

- sim-findings.md: the OVE-48 RNG-drift candidate entry marked FIXED
  (PARITY-OK + the opens-vs-draws label correction); the far-end
  band-sensitivity entry gets a second-band corroboration UPDATE
  (freshband 1/8 on 190561–190568).
- No other backlog appends (nothing out-of-scope surfaced); the
  Blooded-beat-vs-flag reverse case is already filed.

scale-onramp stays converging (NOT converged): the OVE-48 question is
now mechanism-closed on every probed path with the band-3 survival
gap still unexplained and unreproduced on any fresh band, and
national / table / wins remain 0 on every judged corpus. The
transplant program moves on to families 6b/7b. food-economy stays
converging (untouched; parked). winnability chain stays converging
(untouched; sibling loop B). Next blanks, in order: (1) family 6b +
narrowed 7b; (2) family 2b AMBIGUOUS stays on the suspect list; (3)
the four conflicted PR #22 hunks as a family; (4) headcount-ceiling
(Steve-call); (5) Reunion mirror pack in the wild (Steve design call).
Claim deleted; lock deleted. Evidence:
evidence/2026-11-14/sim-scale-onramp-round-0547.md (this file).
