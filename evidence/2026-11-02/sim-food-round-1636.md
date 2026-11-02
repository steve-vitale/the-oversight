# Loop B 1636Z coordinator evidence — PENDING REPO COMMIT (container EPERM flap)
# When .git writes clear: copy this file verbatim to evidence/2026-11-02/sim-food-round-1636.md
# in the repo, commit with scripts/safe-commit.sh, THEN land stranded sim-gatedisengconf-b
# (recovery commands at the end of this file). Do NOT re-run judged sims.

## Run fleshout-loop-b-20261102T1636Z (axis food-economy — 1 arm MERGED + 1 arm STRANDED, flap-blocked closeout)

Run fleshout-loop-b-20261102T1636Z, axis food-economy (second
non-converged axis; scale-onramp is Loop A's lane). Claim written
before any sims; retired to .DEAD at closeout with a recovery note;
lock deleted. Pre-flight: main tree clean at 20bb82e0d, disk 22%,
reaper removed nothing sibling-owned. Loop A 1630Z live at run start
(heralddepart + npcdeadfilter, NOT touched); it closed out mid-run
(2c119dde3) and its claim retired — NOT touched. Master moved under
this run (Loop A closeout); both worker branches rebased clean onto
the new tip before merging (homeward) / attempted (gatediseng, flap).

Arm sim-homewardac-b: A SUBSTRATE-FAIL + C NO-GO, MERGED
(rebased commits 5d76fa125, 0aacda0d5, 71046107d; proof
test-homewardconstruct-b.js 15/15 re-run green on the rebased tip
before merging; zero src/js changes, zero edits to competent.js /
guard policy / homext driver / shapes analyzer). Prereg committed
before any judged sim. Bands: A 69501-69508 (day-5 walk-out to
(7,1)), C 69601-69608 (days 5-6 to (2,8) + attempt (2,8)->(4,8)),
30d, fresh both legs, day-1 identity 16/16 PASS, no substrate drift.
Shape A: 0 candidate episodes, 2/8 integrity-ok (< 4 threshold) =
SUBSTRATE-FAIL (DIAG, not a guard verdict) — construction did not
establish the shape often enough to judge. Shape C: 0 episodes,
5/8 integrity-ok, meeting the prereg NO-GO threshold — with the
mechanism stated sharply: on all 5 integrity-ok trips the attempt
hop PASSED E, so the guard correctly had nothing to veto; fencing
on a TRUE C setup (pocketed destination from escapable origin)
remains unjudged, not claimed as judged. Homeward vetoes: 0 on all
32 legs. Outward vetoes (secondary, not judged): 5 total (4 A band,
1 C band). Wall 30d: median survival 30d, maxWave 3, wave 4-5
unlocks 0, national/table/wins/vests 0 both policies (panel
context, A band). Sense: veto line reads as a person deciding
("You don't walk there — you couldn't get home from there.",
second-person, reason-giving, once per destination, repeats
silent); camped-out dawn at (2,8) reads human; the run's
strangeness is absence (shapes' preconditions never arise), not
incoherence. Shape D documented as open STEVE-CALL (should the
guard offer an escape when it can only say no); no escape shape
implemented. Notable mechanisms: 69604 guard->succession cascade
(one outward veto re-routes the scholar's day; armed scholar dead
in the wild day 6 while shadow camps on; successor starts at haven,
C trip fails integrity); 69501 pocket opens day 12 (stranded days
5-11 at 0 kcal, then walks home, mechanism unisolated); 69502
E/engine creek disagreement (forced hop E-passes yet engine
refuses with a creek line; guard passes hop origin to
travelBlockage, engine d=1 check does not).

Arm sim-gatedisengconf-b: CONFIRM PASS, COMMITTED BUT NOT MERGED
(branch sim-gatedisengconf-b, commits c9df9812f prereg,
5ad3d7a7d proof, 6a9fcd367 results; base 8471c5da3; zero edits to
existing scripts/policies; worktree clean; proof suites green on
final state: new test 10/10, reused gatediseng 21/21,
gatediseng-confirm 11/11). Carried confirm bar, quoted verbatim
from evidence/2026-11-01/sim-gatediseng-confirm-b-prereg.md:
survivor firing-seed rate <= 25% on the band, plus the in-time
check on any collapsing trajectory. Band 76701-76712, 30d
competent, fresh (zero seed-field hits in any evidence jsonl/json
before prereg), day-1 identity 12/12 PASS, 76701 determinism
byte-identical re-run, rows == daysAlive (30 each). Result:
2/12 = 16.7% <= 25% = PASS. Firings: 76706 day 18 (stand-down day
15 at 16,500 -> 10,600, -35.8%), 76712 day 9 (stand-down day 6 at
20,650 -> 11,242, -45.6%). In-time leg VACUOUS: 12/12 survived, no
collapsing seed — timeliness still rests on 51608 alone (day 15 vs
starvation day 21). Cross-check: 0 mismatches on 12/12 between the
reused gatediseng analyzer and the evenings analyzer.
Evenings-per-firing-seed MEASURED for the first time (522 band
fired zero times, so this was null): raw evenings [6, 4], mean 5,
median 5, max 6; issued warnings [1, 1]; one-per-stretch rule holds
(76706 second fall run days 26-27 and 76712 day-15 evening issue no
second warning). Sibling candidates on the same trajectories
(texture, not judged): (a) 4/12, (b) 3/12, (d) 4/12. Pooled all
bands (not judged): 6/59 = 10.2%. Wall 30d window limit stated, no
wall movement claimed: 12/12 survived 30d (median 30, max 30),
wave 3 on 8 seeds, wave 2 on 4, waves 4-5 / national / table / wins
0; deaths 253 total, villager combat 179, the only 3 starvation
deaths all on 76712 (days 22-23), 13 days after its day-9 firing.
Sense: a (c) warning reads as the village noticing, not an alarm
from nowhere (76712 day 9: "You keep a day's food (360 kcal) —
nothing extra for the pantry this time," echoed by the deploy
line; day-6 stand-down already speaks "Hunger gnaws. The pack is
thin."); qualification: day 8 speaks an optimistic counter-voice
("We're going to make it"), so the warning sits beside optimism.
Observation: 76712's 25-evening disengaged stretch is the longest
measured on any gatediseng band. This arm deploys nothing; the (c)
deploy spec from the 522 confirm prereg stays deploy-ready. Note
on "fresh BOTH legs": this is a would-fire overlay with zero
game-code change, so baseline and armed trajectories are identical
by construction — the prereg states this mapping explicitly, with
the two independent analyzer legs as the second leg, rather than a
fabricated duplicate leg.

Telemetry: prescribed invocation on the homeward pilot jsonl
returned one LOUD parse line (could not parse pilotA-armed.jsonl:
non-whitespace character after JSON at position 384967) — a
recorder-format parse refusal in the same class as prior runs'
refusals, NOT a deviation signal; baseline NOT rolled, no LOUD
deviation lines. Gatediseng corpus not telemetry-checked (branch
unmerged at closeout; check it on landing).

Infrastructure (flap timeline, same container EPERM class as
2026-10-23): worktree-release for sim-homewardac-b failed twice
with PermissionError on the registry atomic write (registry entry
still 'active', last heartbeat 2026-11-02T16:50:41Z — reaper
threshold is 4h stale, so no imminent reaper risk); gatediseng
rebase failed twice with "could not write
.git/worktrees/sim-gatedisengconf-b/rebase-merge/head-name:
Operation not permitted" (first failure left a stale rebase-merge
dir with only two 0-byte files, head-name + interactive, no picks
applied, HEAD unchanged — removed per git's own instruction, second
attempt failed identically); heartbeats for both trees then failed
on the same registry write; a main-tree probe ref write then failed
("couldn't write .git/refs/heads/probe-flap-1636.lock") — the flap
had spread to main .git ref writes by closeout, so NO further ref
surgery was attempted. No probe ref was created (probe3/4/5 on the
branch list are pre-existing). Main tree verified clean at
71046107d at closeout. Safe-commit index clobber (staged-deletion
variant) hit all homeward commits and the gatediseng prereg +
results commits; all repaired via HEAD-blob cacheinfo with commit
contents verified each time.

food-economy stays converging (NOT converged): the homeward A/C
judged pilot is now ANSWERED as substrate-fail / no-go-on-a-
non-qualifying-band (the guard shapes themselves remain unjudged
— the next prereg is a construction call, not a bigger band), and
gatediseng (c) is re-confirmed on a second fresh band (PASS) but
NOT yet merged — its verdict must not be cited as landed until the
recovery below completes. No guard default has flipped, nothing
deployed. scale-onramp untouched (sibling Loop A lane).

RECOVERY (next run or ship loop, when .git writes clear — do NOT
force during the flap):
  cd ~/workspace/worktrees/sim-gatedisengconf-b && git rebase master
  # re-run proofs: node scripts/test-gatedisengconf-b.js,
  #   scripts/test-gatediseng-b.js, scripts/test-gatediseng-confirm-b.js
  cd ~/workspace/the-scattering && git merge --ff-only sim-gatedisengconf-b
  # verify commit 6a9fcd367 (rebased) on master, then:
  bash scripts/worktree-release.sh sim-gatedisengconf-b merged
  git worktree remove --force ~/workspace/worktrees/sim-gatedisengconf-b && git branch -d sim-gatedisengconf-b
  # same release/remove/delete for sim-homewardac-b (already merged as 71046107d)
  bash scripts/worktree-release.sh sim-homewardac-b merged
  git worktree remove --force ~/workspace/worktrees/sim-homewardac-b && git branch -d sim-homewardac-b
  # then commit this file as evidence/2026-11-02/sim-food-round-1636.md
  # (with a landing addendum for gatediseng) and run worktree-reap.

Next blanks, in order: (0) gatedisengconf-b landing recovery above
+ commit this evidence to the repo; (1) homeward destination-first
construction: screen seeds/tiles for the shape precondition (A:
direct-fails + lateral-passes at some time of day; C: destination
E-fails from escapable origin) BEFORE forcing the trip, instead of
fixed routes whose destinations are pocketed on 0/16 trips here;
(2) gatediseng timeliness re-confirm still owed (third statement;
needs a collapsing-seed band — two vacuous bands in a row);
(3) panel/driver substrate divergence isolation (standing);
(4) guard-E creek-hop fidelity (69502 E/engine disagreement);
(5) pocket persistence mechanism (69501 day-12 opening);
(6) guard->succession cascade (69604); (7) shape D Steve-call
(escape when the guard can only say no, unchanged); (8) 60501-shape
roadwork-credit band (still owed); (9) guard + return-capability
pairing OR a second veto-budget shape, decided up front;
(10) sensor non-pantry collapse signal; (11) pantry-cap-as-garden-
bottleneck (74007); (12) standing-load remainder; (13) pack-full
refusal narration; (14) HUNGER WINTER relief passivity (steve-call
candidate); (15) shelling default-flip call; (16) P3 reset
follow-ups; (17) patrol-departure narration; (18) garden/fish/traps
early path; (19) creek clearance wood-bound (evening wood-carrying
first; read Loop A creekwood arm before re-screening); (20) rubble
daytime-clearing habit; (21) washed_out scramble narration;
(22) 96-tick bridge edge; (23) 120d window only on a new
horizon-cut episode.

Merged locally, pending ship (homeward arm only; gatediseng arm
committed, pending flap-clear landing).

## Landing addendum (main-session recovery, 2026-11-02 ~11:15 CST)
Stranded arm recovered, NOT re-run: the flap-blocked rebase left a
partial sequencer dir (git-rebase-todo missing, no commands done,
tree clean, tip intact at 6a9fcd367). Sequencer dir removed after
verifying tip + clean tree; branch rebased clean onto 71046107d
(new tip b6deca172: prereg 45bc7bd85, proof 6dd24f309, results
b6deca172). Proofs re-run green on the rebased tree: gatedisengconf
10/10, gatediseng 21/21, gatediseng-confirm 11/11. Merged --ff-only;
both worktrees released/removed, both branches deleted. Main tree
clean at b6deca172. Gatediseng CONFIRM PASS 2/12 now fully landed;
homeward arm already on master at 71046107d. Merged locally,
pending ship.
