# sim-winnability-round-2230 — Loop B coordinator evidence

Run: fleshout-loop-b-20261114T2230Z (Loop B), axis winnability chain.
Blanks taken: 2130Z next blanks #2 (the hold) and #4 (proof refresh round 18),
in order. Blank #1 (answercourt cost call) sits with Steve / main session —
NOT taken. Blank #3 (competent seat-taking BUILD) is a Steve-call — NOT
taken. Blank #5 (veterans survivorship) is a design question — NOT taken.
Re-point queue fully disposed (arm-2 toggle CLOSED 2026-11-06; flee-repair
landed via Loop A; standing-99107 answered). No new food-economy arm (parked).
Loop A live on scale-onramp throughout (2115Z transplant 15A band 3 +
family 16; band3 landed eaa8e4c85 mid-run) — NOT touched. Master at run start
eaa7fb431; at closeout 5356dc62e (both arms + Loop A band3 landed).

## Arm 1 — sim-holdrealm-b (DIAG): GO, 0 UNCLASSIFIED

Branch sim-holdrealm-b, commits 59edb6769 (prereg) + 5356dc62e (rebased from
4c3ac7d7f + ec76139e9 onto eaa8e4c85, 2/2 picks clean). Merged ff-only.
Evidence: evidence/2026-11-14/sim-holdrealm-b.md (+ prereg,
holdrealm-b-analysis.json, scripts/analyze-holdrealm-b.js).

- **Count correction:** the source evidence said 5 dissolutions; the per-day
  series holds **7** — 100208 and 100211 dissolved and re-climbed, so
  end-state counting hid them. All 7 classified, plus both pilot-band
  dissolutions, 0 UNCLASSIFIED. Re-climb blocker named for 100203, 100212,
  and the pilot's 100107.
- **Mechanisms:** speaker-death-verified (100203 Arjun d89, 100208 Carlos
  d100); probable-succession (100204/100206/100212 — simultaneous −8/−13
  drops + a death that day; labelled as inference where funeral lines are
  uncaptured); succession-wounded-then-erosion (100216). Structural rule
  (from src/js/hierarchy.js): a realm is Haven + exactly 3 seasoned links
  and tolerates ONE weak link; the succession haircut (−8 to ALL links)
  drops every marginal link at once, so any realm with two links near the
  bar dies on one funeral. The pending global summons bought 0–1 days in
  all 9 cases — not life support.
- **Re-climb blockers:** 100203 — trust 21/39/22 at d150, zero tends in 60
  days, pantry never above 14,447 kcal (poverty trap: lingering monsters
  gorged the stores nightly after the fall); 100212 — trust 25/28 with only
  8 days of horizon left. Re-climb is fast when attempted (100208 in 12d
  with no tends; 100211 in 20d; pilot 100106 in 5d).
- **The tend-drive gap:** the policy tends ONLY unseasoned links — every
  tend in the 32-file corpus lands on a se=0 link. Once the last link
  seasons, tending stops everywhere, even in healthy villages (100201's
  last tend is d70). Seasoned bonds have no maintenance (+1/week tribute
  vs −5 herald / −10 raid / −6 arrears). After dissolution, tending resumes
  only where the village can pay (100211 once the pantry recovered past
  21k).
- **Recorder fix LANDED:** 5/7 confirm dissolutions left no captured line —
  the 600-line cap was hit days earlier. New shared
  scripts/linklines-capture.js keeps a dissolution-episode ring
  (dissolution, funeral, mantle, drift warning, succession leverage) past
  the general cap, wired into scripts/diploverb-driver-20261114.js as an
  additive `dissolutionLines` field. Zero src/js changes.
- **No fresh band was run.** Per the prereg, a fresh band runs only if the
  corpus cannot answer a dissolution; it answered all of them. Running one
  would have been a wasted measurement batch.
- **Proofs re-run green by the coordinator on the rebased tip:**
  test-holdrealm-b-recorder 19/19, test-holdrealm-b-classify 17/17,
  test-diploverb-b §1 39/39 + §2 game 22/22 (seed 98801, both policies, 0
  instrument errors).
- **Wall numbers (confirm corpus, as carried):** armed national 13/16,
  table 0, wins 0, wave 4 16/16, wave 5 8/16, median survival 122d; baseline
  national 0/16, median 125d.

## Arm 2 — sim-proofrefresh-b18 (measurement proof): GO 12/12

Branch sim-proofrefresh-b18, commits 87bfa6cf2 (prereg) + 282a57d89 (panel +
re-point + test) + 6c4332a73 (evidence). Merged ff-only (base 007c61738).
Evidence: evidence/2026-11-14/sim-proofrefresh-b18.md (+ prereg,
neutral-proofrefresh-b18.json.gz).

- **Round 18 was OWED, verified not assumed.** On base eaa7fb431 the proof
  test failed with "Proof source inputs are not current". Manifest diff vs
  the retained b17 panel: exactly 4 keys — src/js/game.js +
  src/js/partyTactics.js (Reunion arena balance: mirror cap, HP ×0.4,
  damage ×0.6) and src/js/build.js + index.html (batch-ship version bump).
  Observer/contract digests matched.
- **Panel:** one clean ~21-min run, 64 cases, 0 cached jobs, sha256
  cc38babf. 0 stale keys on the tip; neutrality 4/4, warnings 0; 3/64 rows
  moved vs b17 (survival +1/+3/+1 days only, all verdicts unchanged).
- **GO legs, all re-run on the final tip** (master 007c61738, branch tip
  282a57d89; leg (a) re-verified 9/9 again on the absolute final tip
  6c4332a73): (a) proof-update 9/9, (b) workflow 9/9, (c) cache-flags 4/4
  outright first attempt, (d) neutrality reproduces b17 and b16 with
  warnings 0, (e) test-proofrefresh-b18.js 12/12 (retained b17 AND b16
  panels both FAIL validate — green not vacuous), (f) ontology exit 0,
  "All 138 systems validated". Proof re-pointed at the new panel only
  (balance-proof-update.js exit 0, no hand-edited hashes).
- **Master move:** eaa7fb431 → 007c61738 mid-run (sim-transplant16-a,
  evidence + one non-manifest test — no manifest files). Rebased 2/2 picks
  clean onto the explicit final SHA; all legs re-run after.
- **Panel wall rows (identical to b17):** national 11/64, wins 16/64,
  entered 16/64, wave-5 13/64, wave-4 63/64, median survival 90d.
- Round 19 is owed after the next manifest change.

## Telemetry deviation check

Refused, same standing refusal as 2130Z: telemetry-check refuses the
answercourt confirm corpus (recorder-corpus input — all 32 rows carry
top-level anchorCommit, sweep recorder rows, not runs; "Recorder corpora
are compared with sweep-compare tables, never against a run baseline
here"). The proofrefresh .gz panel is likewise unparsable by
telemetry-check (known limitation recorded b11–b18). No LOUD lines, no
baseline roll. This round ran no new before/after sims, so there is no
deviation to check.

## Findings appended (sim-findings.md)

- Realms-dissolve item (2026-11-14) marked FIXED — the diag answered it
  (7 dissolutions classified, re-climb blockers named, recorder fix landed).
- NEW: no upkeep tending for seasoned links — BUILD candidate.
- NEW: post-dissolution poverty trap — BUILD candidate.
- NEW: SUCCPOLITY / SUCCGRACE are env-gated levers for exactly this
  (14-day proving window; answerable renegotiation beat at succession) —
  natural next arm against these seeds.
- NEW: scaleclimb/answercourt policy source unrecoverable from the repo
  (killed branch, refs deleted); the exact tend gate is corpus-inferred
  only.

## Infrastructure

- REGISTRY.lock contention delayed both worktree registrations (~7 min
  total queue; reaper holds the lock during scans, journey-landing release
  in flight). No registration failed.
- Safe-commit index clobber struck all three proofrefresh commits and both
  holdrealm commits — repaired each time with the documented
  `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`
  pipe, every commit verified correct (hash-object == HEAD blob,
  status/diff clean) before rebase/merge.
- `node scripts/check.js --quick` was run by the holdrealm worker and
  killed at ~9 min with zero output (slow under concurrent sibling
  sweeps — same profile as the 2215Z 853s run). Zero src/js, zero
  green-list files in either arm; the arms' targeted suites are green
  instead (recorded above). Full quick check not re-run, per loop
  precedent.
- Git gc warning on merge ("too many unreachable loose objects; remove
  .git/gc.log") — housekeeping note only, not acted on; merges unaffected.
- No EPERM flap observed this run. A transient `git status` count of 2
  during the telemetry-check invocation did not reproduce (clean before
  and after); recorded, not chased.
- Reaper: 10/16 active at closeout reap; LOUD lines only for other
  owners' dirty trees (journey-landing-r134, journey2-social) — never
  touched.

## Village assessment (plain words)

Thirteen villages became nations when someone finally answered the court.
Then the crown started slipping. A realm is only as strong as its three
oldest friendships, and a single funeral takes a cut out of all three at
once — so a village that looked solid on the morning of a death can be a
free fire by nightfall, with nobody left to say what went wrong. The two
villages that lived on after losing their realm never climbed back, not
because the climb is hard — when a village does try, it re-climbs in days —
but because nobody tends the old bonds anymore and the pantry is too empty
to start tending again. The instrument that was supposed to record all this
was full before the story happened, so five dissolutions passed in silence;
the recorder now keeps the dissolution itself past the cap. The measurement
proof is fresh again (round 18), and the numbers it carries are unchanged:
the wall is still standing at the same place — national reachable, table
and wins untouched, wave 5 faced on half the band.

## Convergence state

winnability chain stays converging (NOT converged): the hold is now
decomposed (succession haircut + no upkeep tending + poverty trap), the
proof is current, but no hold BUILD has landed, the answercourt cost call
is still with Steve / the main session, and table/wins remain 0.
scale-onramp stays converging (untouched; sibling Loop A). Next blanks, in
order: (1) answercourt cost call (Steve / main session); (2) the hold BUILD
— upkeep tending for seasoned links + post-dissolution poverty trap; the
SUCCPOLITY/SUCCGRACE arm is the natural next measurement against these
seeds; (3) competent seat-taking BUILD (Steve-call); (4) proof refresh
round 19 (owed after the next manifest change); (5) veterans survivorship
(design question); (6) phone-frame receipt refresh; (7) only-lead-shape
second band (findings backlog); (8) family 2b AMBIGUOUS (Loop A suspect
list). Claim deleted; lock deleted.
