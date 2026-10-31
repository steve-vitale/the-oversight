# sim-food-economy-round-0537-a — coordinator evidence (Loop A run fleshout-20261031T0537Z)

Axis: food-economy (converging). Sibling Loop B held a live claim on
scale-onramp at run start (claim fleshout-loop-b-20261031T0436Z: sim-sighit-b,
sim-heraldhp-b, sim-deadfall-b — NOT touched; B landed sim-deadfall-b to
master mid-run, commit 7d5281064), so Loop A worked food-economy, the
topmost axis not converged and not live-claimed. Rotation file read 3
(villager agency); the convergence rule overrides the rotation, and the
arms below use the levers as lenses on food-economy.

All three arms DIAG ONLY: zero src/js changes, zero policy-default flips,
zero edits to existing policy files. No food-economy default flipped, no
balance change landed. Three DIAG-GO verdicts; the strand is now priced
on five gates (food, wood, ticks, warmth-as-log-tax, tool) with two of
its three open measurement blanks closed (stash-fetch trigger, waits
alignment) and the third (lacking-line incompleteness) censused with a
ranked wording proposal awaiting a design owner.

## Pre-registration (coordinator)

- Primary question: close the next food-economy blanks in tracker order —
  (1) the 15337 stash-fetch trigger (#1597), (2) the waits-alignment
  mechanism behind the ON d10 flip (#1599), (3) the lacking-line
  first-gate incompleteness (#1561/#1580/#1583 class).
- Method: staged (pilot 8 before confirm 12–16), death-aware horizons,
  pre-registered per-arm GO thresholds in each arm's prereg, judged
  exactly as written. Balanced panel (§15): N/A — DIAG arms run no
  before/after comparison; no panel compare is attached, and none is
  claimed.
- Shared substrate (from the 0415Z round): POLICY=nighttravel,
  COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
  WOODCARRY=1, strand seed 15215 (+ bank seeds where stated).
- Base at arm start: master f44ec6957. Master moved once under the run
  (Loop B deadfall landing 7d5281064); all three branches rebased clean
  and proofs re-run after every rebase and on merged master (see
  Coordinator adjudications).

## Arm 1 — sim-stashfetch-a: DIAG-GO (backlog #1597 ANSWERED)

Commits (rebased): prereg 5d1a21560, instrument 91ba01a5d, analyzer fix
c3d75aab9, evidence a39f1faf9. Proof: scripts/test-stashfetch-a.js
93/93 with --require-corpus on the pinned base (34/34 without corpus
checks); see adjudication for the post-rebase 92/93.

Plain-words answer: the 15337 fetch is not a quirk of that seed and not
a product of the variant stack. It is the game's ordinary daily routine:
once a day, when the player-character is home, they pick up the best
weapon and the best armor sitting at their own space in the haven — if
it beats what they already wear — and put it in their pack. On 15337
that happened to be a hatchet and bark armor on day 1, because those
were the weapon and armor the character had left at their space when
the game began. Turn off the variant pieces one at a time, or drop the
variant stack entirely for the plain village policy, and the fetch
still fires on day 1, because no variant piece controls it. What turns
it off is the routine's own rules: after day 1 there is nothing left
worth fetching, and things that are neither weapons nor armor — the
snare wire, the hand saw — stay sitting at the space forever. The older
"never held" finding is explained too: it was measured before this
routine existed in the game at all.

Numbers: ablation cells V/A/B/C + plain cell P on 15337 (DAYS=5) all
fire; pilot + confirm = 20/20 weapon FETCH, 20/20 armor FETCH, 0
INVALID, recorder errs 0, complete 26/26 legs. Weapons fetched across
the 20 seeds: hatchet (2), sling (3), fire_hardened_spear (3),
crude_bow (4), crowbar (3), crossbow (1), hunting_spear (1),
sharpened_stick (1), stone_knife (2). The third stashed item — neither
weapon nor armor — NEVER fetches on any seed (day-2 leftovers include
snare_wire, binoculars, anchors_locket, hiking_backpack, hand_saw).
Determinism: cell-V re-run byte-identical.
Evidence: evidence/2026-10-31/sim-stashfetch-a.md (+ prereg).

## Arm 2 — sim-waitsalign-a: DIAG-GO (backlog #1599 ANSWERED)

Commits (rebased): prereg 3a97301eb, results 3da673616. Proof:
scripts/test-waitsalign-a.js 38/38, green on the pinned base, after
each rebase, and on merged master.

Plain-words answer: "waits" here means the harness's 3 morning
doAction('wait') calls — there is no engine waits counter. The morning
clock is set by what the night's sleep did, and the line is the
too-late-sleep guard at evening dayTicks 448: if sleep runs and rolls
the day (evening clock <= 448), the 3 waits land on 128, 256, 384 and
the morning has 128 ticks left; if sleep refuses as "too late for real
sleep" (evening clock >= 449), the day does NOT roll in sleep, the
first wait is the rollover stub, and only 2 full waits follow, so the
morning reads 256 with 256 ticks left. Sleep interrupted mid-loop
leaves the morning at whichever boundary the waits reach from the
interruption point. That is why saving 3 ticks on d9 flips d10: it
moves the evening clock across the 448/449 line, and the next morning
is a different morning, not a cheaper version of the same one.

Numbers: unit-probe boundary exact at 448/449 on both seeds (15215:
14 values; 15003: 9 values, all consistent). Save-ladder on the 15215
ON d9 trajectory (control evening 451): save 0/1/2 -> morning 256 (no
flip); save 3/5/9 -> morning 384 (flip). Threshold, not phase, not
draw-count. Confirm: 9-seed band scan (15003, 15009, 15091, 15211,
15220, 15221, 15337, 15376, 15439), DAYS=15, 0 violations across 126
band transitions (140 including the 15215 leg); second leg (guard
pair) reproduced. No band seed strands in 15 days.
Evidence: evidence/2026-10-31/sim-waitsalign-a.md (+ prereg).

## Arm 3 — sim-lackingline-a: GO (backlog #1561/#1580/#1583 MEASURED)

Commits (rebased): prereg 09a41dfa3, results 93937911f. Proof:
scripts/test-lackingline-a.js 140/140 with all five corpus dirs as
arguments (129/129 on the two primary legs alone); green after each
rebase and on merged master.

Plain-words answer: the bridge refusal line tells the truth but not
the whole truth. On stranded evenings it names only the first failing
gate (wood, then food, then time, in that order) and never mentions
the others failing at the same time — and it never connects a warmth
fire that burned a bridge log the night before to the next night's
refusal. A player reading only the story calls a two-or-three-problem
night a one-problem night, and can never learn that warmth cost the
bridge.

Numbers: strand set re-derived on this base = 15215 only (guard nights
7–9, ON nights 7–16; 15009 has 0 creek evenings on both legs). Census
covers every stranded evening: 34 total (13 primary + 21 variant), 0
unclassified, skip agreement on all 34, every narration equal to its
lackingLine template (proof-checked). Primary gate combinations
(guard 3: ticks-only 1, kcal-only 2; ON 10: ticks-only 1, kcal-only 2,
wood-only 2, wood+kcal 5); primary multi-gate evenings 5, all hiding
at least one gate; across all 34, 10 multi-gate evenings. Warmth
connection: ON spend nights 9, 11, 12, 13; 4 following evenings, 0
connected (strict test: the lacking-line text itself). ON-variant
spends 9, 10, 14, 15, same 0-connection pattern.
Ranked wording proposal (proposes, implements nothing; design owner
settles wording): (1) RECOMMENDED name-first-plus-count — keep the
current line verbatim as the lead and append the count/names of the
further failing gates (repairs 100% of censused incompleteness,
changes nothing on the 24/34 single-gate evenings); (2) name-all-gates
(fullest honesty, roughly doubles/triples line length on a one-screen
mobile surface); (3) keep-as-is. No canon doc covers the bridge/
lacking line itself (ABILITY-REFUSALS.md covers ability refusals, not
this); the standing CANON rule that bears on it is "no silent actions
— every action narrates honestly, including failures."
Evidence: evidence/2026-10-31/sim-lackingline-a.md (+ prereg).

## Wall numbers (structural windows only — no wall verdict claimed)

These DIAG arms run 5-day and 15/30-day strand windows, not wall bands:
national 0, table 0, wins 0 on every leg (no national/table/win
content in the windows), wave reach not observable above wave 1 in the
strand windows. The scale wall itself is UNTOUCHED by this run (Loop B
lane) and stands as last measured: full seat 0, wave 5 reached 0.
No wall number moved here, and none is claimed to have moved.

## Village assessment (plain words)

The village in these windows is a small group stuck at a creek crossing
for a little over a week: one character stranded out, sleeping rough,
short of food, wood, or time on different nights, sometimes all three
at once. What this run filled in is the fine print around that
stranding. First, the character is not as bare as the old notes said:
whatever weapon and armor they started with is waiting at their space
at home and gets picked up on day 1, automatically, by an ordinary
routine — the "never held a weapon" puzzle was a measurement taken
before that routine existed. Second, the mornings after a stranded
night are not interchangeable: whether the character slept properly or
too late decides how much of the next day they have, and saving a few
minutes the day before can flip that decision — so any future plan to
save time by trimming the routine has to reckon with the morning it
creates, not just the minutes it saves. Third, the game's own narration
understates the stranding: on a third of the stranded evenings more
than one thing is wrong, and the line names only the first. None of
this changes what the village can do yet — all three arms measured,
none changed the game — but the next strand-fix design now has three
solid facts instead of three open questions: the tool arrives by
itself, the morning is threshold-set, and the refusal line needs its
appendage before a player can trust it.

## Blanks filled or documented

- FILLED (measured, evidence landed): #1597 stash-fetch trigger —
  ordinary daily routine, gates verified, generality 20/20.
- FILLED (measured, evidence landed): #1599 waits-alignment mechanism
  — too-late-sleep line at evening dayTicks 448, threshold-proven on
  two seeds + 9-seed band scan, 0 violations.
- DOCUMENTED (measured, decision open): #1561/#1580/#1583 lacking-line
  incompleteness — complete 34-evening census + ranked wording
  proposal; the wording choice belongs to the design owner, not to
  this run. No src/js change proposed by the arm is landed.
- STILL OPEN, not chased: the strand-fix design itself (a day-part-
  cheap wood move for fed + axe mornings, reckoning with the
  near-minimal routine, the 448 threshold, and the tool gate); the
  two Steve-call items (competent courtship drive;
  generation-dealt vs earnable vests) and the warmth default, which
  still await rulings. Loop B's deadfall/brush source duty (landed
  7d5281064) is adjacent to the wood move but is B's lane, not
  claimed here.

## Coordinator adjudications (landing, not re-judgment)

1. Stashfetch post-rebase proof 92/93: the sole failure is the
   base-pinned diff guard (src/ + scripts/policies/ diff empty vs
   f44ec6957) flagging exactly Loop B's deadfall landing
   (scripts/policies/deadfall-b.js + deadfall evidence/scripts +
   src/js/game.js + perceive.js). The arm touches zero of those
   files (audited file list: new files only, no src/js, no existing
   policy edits). Named cause, verdict stands as measured on its
   base — the same adjudication class as run 0415Z.
2. Stashfetch mechanism survives the base move (coordinator spot
   check, NOT a re-judgment): plain cell P on 15337 re-run on the new
   master (deadfall landed) still FETCHes hatchet + bark armor on
   day 1, all five channels agreeing, spawn pool [snare_wire,
   hatchet, bark_armor] -> day-2 [snare_wire]. The spot-check corpus
   was deleted after reading; the worktree was verified clean
   before merge.
3. Lackingline proof count: 140/140 requires all five corpus dirs as
   positional arguments; the bare run checks the two primary legs
   only (129/129). Both forms green on merged master; no discrepancy.
4. Waitsalign proof 38/38 green on pinned base, after each rebase,
   and on merged master, with no guard involvement.
5. Safe-commit index clobber: NOT observed on any of the three worker
   commits or the three merges — `git status --short` empty after
   every merge (checked each time, per the 2026-10-23 lesson).
6. Master moved once under the run (deadfall 7d5281064); each branch
   was rebased onto the then-current tip and its proof re-run before
   merging. The waitsalign/lackingline branches needed a second
   rebase after the stashfetch merge (merge --ff-only correctly
   refused the first attempt); proofs re-run green after the second
   rebase too. No merge conflicts, no force, no push, no version bump.

## Metric review

- Stashfetch: the prereg's GO bar was refined before any judged leg
  (recorded in the prereg) so a fully-isolated trigger would not be
  forced NO-GO merely because no stack cell turns it off; the
  refinement kept the on/off requirement via a gate-failing negative
  state. The judged verdict uses the refined bar, disclosed here.
- Waitsalign: the predicted interrupted-sleep case T in (128,256] ->
  morning 0 is predicted, not observed (recorded in the arm evidence);
  it does not touch the judged threshold, which is observed on both
  seeds.
- Lackingline: pooled shares across primary + variant legs are
  reported separately, never pooled into the verdict (per the arm's
  metric review); the verdict rests on the complete-census bar.
- No metric was re-scored mid-run. The next strand-fix design should
  pre-register against the 448 threshold and the name-first-plus-
  count proposal explicitly, rather than re-deriving either.

## Infrastructure notes

- Worktree registration was slow at run start (~5 min per tree,
  tree restat) but succeeded; one heartbeat round hit the container
  EPERM flap (all three trees, PermissionError) and the next round
  landed — heartbeats verified by readback, never assumed.
- `worktree-reap.sh` at pre-flight removed one unregistered tree
  (journey2-succession-r83) whose content was already on master as
  f44ec6957; it left all dirty/active sibling trees alone.
- Sibling trees never touched: sim-heraldhp-b, sim-deadfall-b (Loop B),
  journey-deepening (playtest loop). Sibling Loop B's claim file is
  still live (not .DEAD) at closeout; scale-onramp remains B's lane.

## Telemetry deviation check

Run after this evidence file (see coordinator closeout note): the
scale-wall telemetry baseline covers national/table/wins/exiled wall
bands, which these DIAG strand windows do not produce; the check is
attempted and its outcome (including any tool refusal) is recorded in
the run note, not used to re-judge any arm.

Worktrees released as merged, branches deleted: sim-stashfetch-a,
sim-waitsalign-a, sim-lackingline-a, coord-0537-a. Claim retired to
.DEAD; lock deleted. Merged locally, pending ship.
