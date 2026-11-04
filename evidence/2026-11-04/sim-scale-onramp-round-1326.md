# Coordinator evidence — run fleshout-20261104T1326Z (axis scale-onramp)

Run: Loop A (oversight-flesh-out-loop), 2026-11-04 ~13:26–14:45Z.
Axis: scale-onramp (converging, NOT converged). No live sibling claim at
run start; Loop B's 1330Z round (tendfloor GO-THIN) landed mid-run and
was NOT touched — both worker branches rebased onto it clean before
merging. No gate, price, or deed-number change in either arm.
Merged locally, pending ship (ship loop owns bump, push, live verify).

## Pre-flight
- No lock at start (previous runs' locks/claims already closed out).
  Lock + claim fleshout-20261104T1326Z written before any sims; claim
  deleted at closeout, lock deleted at closeout.
- Main tree clean at start (`git status --short` empty), disk 26%.
  `worktree-reap.sh` removed nothing sibling-owned (8 active trees,
  several with uncommitted changes — all left alone).
- Worktree registration congestion as in prior runs (~5 min per tree);
  both trees heartbeated at registration.

## Arm 1 — sim-approachbranch-a: NO-GO overall (guardrail breach), firing PROVEN
Commits (rebased, merged --ff-only): afee4bae5 (branch split +
CORRECTION), 0b1deabae (prereg), 6bc274716 (replay harness + proof +
panel driver/summarizer), 04ef612f5 (evidence + panel corpus).
Proofs re-run green on the rebased branch and counted by the
coordinator: test-approachbranch-20261104 ALL PASS,
test-approachbranch-replay-20261104 ALL PASS, test-approachconf-20261104
ALL PASS, test-approachfall-20261104 ALL PASS,
test-approachfire-b-20261104 ALL PASS. (Coordinator note: an initial
`sibling re-run` of a misremembered filename test-approachconf.js
failed MODULE_NOT_FOUND — no such file exists; the real sibling proof
is test-approachconf-20261104.js and it passes. Not a code failure.)

Step 1 — branch split + CORRECTION. The approachconf APPROACH-STEP
class never recorded the issuing branch. Split by policy precedence +
recorded HP/round/target re-classifies the confirm corpus: old 24 ->
flee 15, approach 9, other 0; true loops 0. The confirm's one baseline
"approach-loop fight" (99605 seq 2) splits flee 14 / approach 0 — it is
a flee loop, so the confirm's bar (b) does NOT pass under corrected
taxonomy. A dated CORRECTION appendix was appended to
evidence/2026-11-04/sim-approachconf-b.md (original text intact).
The fleerepair corpus, by contrast, holds real true-approach loops
(old 38 -> approach 29, true loops 4).

Step 2 — true-approach geometry + judged replay (prereg committed
before any judged replay). Primary board: fleerepair 99601 seq 4
(day 100, fallback-OFF leg), 7 true-approach turns, 4 post-mark at
HP >= 0.35. Armed replay: direct fallback firing, marks = 1 at turn 3;
re-pick step to (4,5) on turn 4; strikes turns 5-8; post-firing
blocked run 0. Negative controls prove the board is forced, not
minimal (cornercut and bothsides detour; only (3,5)-blocked reproduces
7x "No path there."). Seq-5 board repeats the shape (marks 1, repick,
strikes). Approach-only gates also fire, isolating the firing to the
fallback gate. Baseline gate reproduces the corpus shape exactly
(turns 1-7); repeat replays byte-identical; zero policy/src change.

Pilot panel (8 seeds 99601-99608, 140d, current-tree baseline — NOT
the confirm's anchor, so trajectories diverge from the confirm):
old approach steps 0/0 both legs (the panel adds no firing evidence;
firing rests on the replay, per prereg design); starvation 2 -> 7
against bar 4 — FAIL by 3; player-flagged starvation 0 -> 1 (bar 2,
PASS); median survival 93.5d -> 83d (bar 74.8d, PASS). Per §14,
guardrails are metrics: overall NO-GO. Kill taxonomy (§14a): NOT
CONCEPT-DEAD (mechanism fired on its merits on a genuine substrate),
NOT SUBSTRATE-MISSING, NOT METRIC-BROKEN (bar fair, 7 real late-game
starvation tele records). Mechanism alive; combined variant blocked
pending a 12-seed guardrail re-test. Confirm (12-16) NOT spent.
Attribution limit (stated, not hidden): the panel variant carries all
four gates, so the starvation excess cannot be pinned on the fallback
specifically.

Sense-read: baseline replay is seven identical turns — "move toward
(3,5), 'No path there.'" — the broken robot, now proven to be CLOSE
THE DISTANCE turns, not flee walks. Armed primary reads as a person:
"bump, bump, bump into the same blocked tile, then step to the next
tile, then fight" — including a strike at HP 25 on turn 8 via the
haven hold fallthrough. No sense veto. The frozen-geometry wait cycle
remains untested (every firing here re-picked a reachable tile).

Wall (panel, fresh, reported not judged): wins 0/8 both legs;
national 0/8; table 0/8; wave-5 unlocked baseline 2 (99604, 99606) /
armed 0; wave-5 kills 0; wave-4 linked kills 7 / 9; median survival
93.5d / 83d; rank village on all 16 legs despite standing up to
335 / 375. Full seat still unwon, wave-5 kills still 0.

## Arm 2 — sim-belongzombie-a: INSUFFICIENT-DATA (census pilot), no rule landed
Commits (rebased, merged --ff-only): 74d1ea7cb (prereg + driver +
analyzer + proof 17/17), 82feb7fa4 (census corpus + evidence).
Proof re-run green on the rebased branch by the coordinator:
test-belongzombie-20261104 17 pass, 0 fail. Zero src diff; the held
Haven-primary zombie rule on branch sim-recovery-zombie-b was NOT
touched. Worktree clean at handoff.

Census (prereg committed before any census leg; §14b checklist before
the bar was set: contact, pool sizing, verb existence, horizon fit
all PASS, verb with a stated partial). Survival screen first
(days-only probe, no link data — cannot select on clears): fresh
seeds 99001-99024, leadcourt, 300d — median 86.5d, max 213d (99023,
the only >= 200d village in 24). A band of eight >= 200d leadcourt
seeds is not obtainable by screening at this hit rate, so the census
band is the survival-ranked top 8: 99023 (213d), 99008 (163d), 99006
(135d), 99004 (132d), 99013 (132d), 99016 (127d), 99009 (121d), 99017
(116d) — median 129.5d, longer-lived than both prior bands. Census
legs reproduced the screen days exactly on all 8 seeds.

Census result: 2 zombie links, 1 zombie seed, 1 addressable seed
against a pre-registered bar of >= 2 addressable seeds ->
INSUFFICIENT-DATA. Per §14a this is NOT CONCEPT-DEAD (the clear
mechanism was never staged) and NOT METRIC-BROKEN (bar within an
order of magnitude of the observed pool). Step 2 (the BELONG-direction
clear probe) correctly did NOT run. No confirm expansion on worker
authority.

The one pool seed, 99008: two BELONG links (both via counter-accept
flips, d32/d33), both trust 40 -> 0 by d59, 71 / 62 in-life trust-0
snapshots, flickering 0 <-> 1-9, both breaking d156 (7 days before
the village's death at d163, via succession, not the death day),
104 days of post-zero life, pantry gate opening inside the window at
d71 and d85 (12,660 kcal — only 660 kcal over the 12,000 gate). A
weekly-boundary clear would have had a ~97-day zombie window.

Formation is the bottleneck, not zombieing (descriptive pooling, not
part of the judged verdict): 6/6 untended BELONG links across the
994/998/990 corpora reached trust 0 in life — but BELONG links form
on only ~1 in 8 leadcourt seeds, always via counter-flip (leadcourt
proposes LEAD only; competent proposes nothing). The other 7 census
seeds formed zero BELONG links.

Blocking, with a confound stated honestly: code-verified that a zombie
BELONG link blocks the pair slot (linkWith is active-only and
direction-agnostic; leadcourt's candidate filter skips linked
villages; 99008 records zero proposals to either zombie village
while active) — but NOT the LEAD count slot (leadcourt's subs >= 3
stop counts Haven-primary links only). On 99008 the behavioral record
is confounded: leadcourt stopped proposing after d34 because it
already held 3 LEAD subs, so pair-blocking cannot be separated from
the subs stop on this seed. A behavioral blocking proof needs a
still-proposing policy.

Verb partial (pre-registered, not discovered mid-run): leadcourt never
proposes BELONG-intent and never pays BELONG tribute, so a step-2
re-proposal under leadcourt could only be a LEAD re-proposal to the
same village or a new counter-flip — never a BELONG-intent
re-formation. That is why step-2 GO was defined direction-agnostically
and why the named next substrate is belongseek (BELONG links formed
and tended by design).

Sense-read: no faded line fires (no rule exists) — the finding is the
zombie's silence. 99008's two bonds decay 40 -> 0 in 27 days with no
line naming the decay, and break at d156 with no line naming either
break. The only nearby bond line is d155, about a different village.
The flip, the decay, and the break are all unnarrated; a future faded
line would be the first audible beat in the whole arc.

Wall (census legs, not wall movement): wins 0/8, survived 0/8; end
scaleRank global 4, national 1, regional 3; wave-5 unlocks 0/8,
wave-5 faced 0/8, wave-4 faced 8/8, wave-4 unlocks 8/8;
readiness-5-ready days 0 on all 8; median survival 132d, max 213d;
deaths 571, combat share 64%; starvation 4. Table and arc reach not
instrumented (stated, not faked).

## Village assessment (plain words)
Two different "stuck" stories got sharper this run. First, the fighter
who bumps into the same blocked tile seven times running is real, and
it is not a fleeing fighter — it is a fighter trying to close in and
failing. The fallback that re-picks a reachable tile works when it is
replayed on a real blocked board: the fighter steps around and fights.
But the combined variant costs lives on the small pilot panel (more
starvation deaths than the bar allows), and that cost cannot yet be
pinned on the fallback itself, so the variant stays blocked until a
bigger guardrail re-test. Second, dead BELONG bonds are real but rare
as a lever: a village can sit on two dead bonds for over a hundred
days with room to re-link, yet BELONG bonds hardly ever form under the
current policy, so a clear rule has almost nothing to act on. The next
BELONG work needs a policy that actually forms BELONG bonds first.

## Metric review
- Approach arm: metrics held. The starvation guardrail did its job —
  it blocked a variant whose mechanism works. No revision proposed
  except the owed 12-seed guardrail re-test on the confirm band
  (99601-99612) before any landing/kill decision on the variant.
- Belong arm: proposed revision for the NEXT run, not applied here —
  split the census bar into a formation leg (BELONG links formed per
  seed) and an addressable leg, since on leadcourt the formation rate
  (~1/8 seeds) dominates the addressable rate; and require a
  still-proposing policy for any behavioral blocking bar.
- Panel note (both arms): the balanced panel returns review_required
  on zero-delta pilots; both preregs stated that rule up front and
  neither verdict leans on a panel status. Balance-panel compare was
  not run on the approach panel (registry-policy panels only, per
  prereg) and is inapplicable in substance to a census.

## Telemetry deviation check
Attempted by the coordinator on the belong per-seed corpus:
REFUSED by the tool itself (recorder-corpus field shape — all 8 rows
carry top-level anchorCommit; same refusal as 0930Z/1030Z/1245Z).
No --allow-recorder-corpus workaround used, no compare fabricated,
baseline NOT rolled, no LOUD lines, no investigation item.

## Infrastructure
- Safe-commit index-clobber phantoms hit all four approachbranch
  worker commits; repaired each time via HEAD-blob update-index
  --cacheinfo; commits verified correct before proceeding.
- Both branches rebased clean onto Loop B's 1330Z master (no
  conflicts, no file overlap with tendfloor); proofs re-run green
  after every rebase and on merged master (approach proofs above,
  belong 17/17).
- Both worker trees released done-merged, branches deleted, final
  reap run, main tree clean at closeout. No push, no bump, no live
  verification (ship loop owns deploys).

## Findings appended to sim-findings.md (this run)
- Approach: live-sim firing blank (panel produced zero approach
  steps — add a direct-counter instrument to the sim driver, or
  screen wider bands and replay the best candidate; another
  unsplit-class band screen is NOT the blank); guardrail re-test
  owed; tbPlayerMove occupancy-only pathing observation; frozen-wait
  bound still untested.
- Belong: BELONG formation bottleneck; silent BELONG arc (flip, decay,
  break all unnarrated); behavioral blocking confound; thin
  pantry-gate margin (12,660 vs 12,000).

## Convergence state
scale-onramp stays converging (NOT converged): the approach fallback
fires on a real board but its combined variant is guardrail-blocked,
the BELONG clear has no addressable pool under leadcourt, the full
seat is still unwon, and wave-5 kills are still 0 in normal play.
Next blanks, in order: (1) LIVE-SIM fallback firing via a
direct-counter instrument on the fleerepair band with the fallback ON
(or a wider screen + replay); (2) 12-seed guardrail re-test of the
approach variant on 99601-99612; (3) BELONG clear on a belongseek
substrate (formation leg first); (4) frozen-wait bound design
question; (5) 99101 hold-beat case re-finding per anchor;
(6) wave5faced label rename. NO gate/price/deed arm follows.
food-economy stays converging (untouched; sibling Loop A/B pattern
noted — this Loop A run took scale-onramp because no live claim
named any axis at run start).
Convergence state: killed-at-pilot (approach variant) +
insufficient-data (belong census).
