# Loop B round 0530Z — food-economy, 2 measurement arms LANDED, merged locally pending ship

Run: fleshout-loop-b-20261028T0530Z. Loop A live on scale-onramp the whole run
(0527Z claim: sim-lingerer-vis-a, sim-w4tbkill-a, sim-fighterconstruct-a — NOT
touched); journey / gap / panel trees NOT touched. This run worked food-economy
(converging), taking the 0444Z tracker blanks in order, skipping blank (1):
the home-village birth path is a Steve-call game change (it changes who lives
in Haven) and is NOT implemented here. Blanks taken: (2) a caught lift's trust
narration unobserved, and (3) the once-a-day predictor's clock-advancing cost
scope + _actionAvailable target=null button-state note. Both arms are
measurement-only, zero src/js changes. No push, no bump, no live verification
(ship-loop line).

## Arm 1 — sim-caughtlift-b: DIAG-NO-GO (measurement only, zero src/js)

Prereg b2ea808f0 (committed before any judged probe); evidence + test
bcf525a0e, rebased onto a2a2a20f3 (sibling journey crisis r59, zero file
overlap), post-rebase proof reproduced exactly, merged f1308714c.

Pre-registered legs, scripted caught lifts on seeds 9820 + 9850:
(a) exact trust delta — PASS both seeds: 50 → 30 (−20), 400 kcal lifted.
(b) narration line — PASS both seeds: "A hand closes on your wrist.
'Really?' -20 trust. The pantry remembers. (Light Fingers — caught.)"
(c) durable trace — FAIL both seeds: no tele('trust') event, no memory, no
gossip, no ledger delta, rep dims unchanged.

Why leg (c) fails (probe-confirmed): the caught branch writes v.trust
directly, never calling bumpTrust, so no trust event, reason, or milestone
check fires; observe('caught_you_stealing') is a full no-op (no entry in
observe()'s action table); no remember() or hoardFood() call. The −20 is
village-level trust in the player (v.trust[playerId]), not per-witness
trustIn, and is not conflated with reputation. The ordinary-take caught path
(secondary, rate forced to exactly the 3000 bar) is the same shape:
"Caught red-handed! They saw you steal. Trust -20." then only "Took Dried
beans.", zero trace, no witness confrontation fired. Clean-palm control:
50 → 50, "The food disappears. Magic. (It's not magic. Nobody saw.
Light Fingers.)" Honest nuance: in real play the caught sentence persists
as text in the saved 40-line message log, but that is the sentence, not a
booking — nothing reasons about it afterward, so the convoTopics line "I
know about my pack. Hands where I can see them, next time." can never
surface from a lift. Fix reported in arm evidence, NOT landed (measurement
arm): route the −20 through bumpTrust with a reason and give observe a
caught_you_stealing entry or a direct remember().

Band (seeds 10420–10427, competent, 100d death-aware cap): lift calls 0/8
(competent never lifts; the "Light Fingers" lines seen were LEARNED/JACKPOT
grant lines, not lifts); national 0/8, table 0/8, wins 0/8, wave-4 reach 2/8,
wave-5 0/8, median survival 100d (cap-censored: 7/8 survived the cap, 10420
village-lost day 28), arc 3 all. Coordinator proof on merged master: test
re-run reproduced legs a/b PASS, c FAIL on both seeds and the band
aggregate exactly.

Wall (this band only, never pooled): national/table/wins 0/8 — a refusal /
ledger measurement band, not a wall mover; the scale wall is untouched by
this axis, as in prior food-economy rounds.

## Arm 2 — sim-onceaday-scope-b: DIAG-GO (measurement only, zero src/js)

Prereg adf085381 (committed before any judged fixture); evidence + test
5bcbec3f3; hash bookkeeping ad11a00e1; rebased onto f1308714c (arm 1's merge,
zero file overlap), post-rebase proof green, merged ca1cd93aa.

Leg (a) predictor scope — PINNED, prediction costs nothing. The only
day-roll predictor is _onceADayPostPaymentDay (private, abilityActions.js),
called only by the war_cry.challenge and intimidating_presence.end_it_before
prechecks. Group A (10× _actionAvailable + 3× activatableAbilities, flag
set/unset, dayTicks 508/509, seeds 9981 + 9982, 16 rows): every delta is 0 —
day, dayTicks, kcal unmoved, button read identical across all 10 repeats.
Real payment numbers beside them (both seeds identical): 508 flag-set tap
refuses pre-payment 0/0/0 (the silent 40 kcal burn stays dead); 508 no-flag
tap succeeds +3 ticks (508→511), same day, −40 kcal (5000→4960); 509 flag-set
tap succeeds on the new day, day 1→2, ticks 509→0 (roll resets to 0,
remainder discarded), kcal 5000→2360 (that −2640 is the tap's day-roll
metabolism, not any prediction cost). Predictor covers exactly 2 actions.

Leg (b) target=null button state — DOCUMENTED, judged in plain words.
_actionAvailable takes no target (hard-calls every precheck with null) and
the bar's click handler also passes no target, so button read and tap share
one resolution path. The bar renders disabled + effect text, NOT the why
reason, so honesty below means the enabled/disabled state. Challenge /
end_it_before: HONEST on the UI path (convo partner → enabled; no convo →
disabled with the "Talk to them first" reasons quoted in arm evidence).
Caveat: an explicit-target tap with no convo succeeds, so button and tap
diverge only for programmatic callers the UI never makes. animal_ken.
calm_beast: DISHONEST on the UI path — button always disabled ("Nothing
here to calm.") even beside a live hostile villager, while a tap given that
fighter's key genuinely attempts ("You try to calm it, but it's too far
gone…"). Since the bar never passes a target, Calm can never enable from
the bar. Honest, target-irrelevant: mediator, field_dressing, green_thumb,
scream/cheese out of combat ("Needs a combat turn." — in-combat button
state not fixture-proven, noted as a limit). Legacy quirk: time_skip /
echo_location rows carry why 'Used today.' even when enabled — invisible
in the bar (renders desc, not why), but a future surface rendering why
would show a refusal reason on a live button.

No band ran, per the prereg (fixtures judge this arm, not a band effect) —
so there are NO wall numbers to report, rather than invented ones.

New blanks from this arm (filed in the findings backlog, no fix landed):
(1) dive_deep boundary false refusal — flag set, dayTicks 500
(500+15≥512) → button disabled, "Already worked this water today.", tap
refuses 0/0/0, while flag-unset at the same boundary succeeds to day 2
(ticks→0, 5000→2200); the precheck reads the pre-payment day, the impl
would accept it as tomorrow's dive. Same class onceaday-b fixed for
challenge/posture; recommended next arm: extend the day-roll predictor to
dive_deep's precheck, re-running group C as proof. (2) Calm unreachable
from the bar (above) — needs a targeting path or a fight-scanning precheck
like challenge's conversation scan. (3) The bar never shows the reason — a
disabled button's explanation exists only as internal state, narrated only
on an actual refusing tap.

## Telemetry deviation check

Not run as a corpus ingest: neither arm produced a per-seed JSON corpus
(caughtlift's judged comparison is fixture before/after on identical seeds
plus band aggregates in evidence; onceaday's is 76 fixture rows). The
telemetry script takes a single --current glob/JSON and the WINSEAT baseline
is a different regime from these pre-seat fixture bands, so a forced
comparison would reproduce only the known regime + field-shape artifact
class seen in the last eight rounds. Panel exception stands (no
corpus-ingest mode). Baseline NOT rolled, no exiled line, no new
investigation.

## Metric review

Both arms judged against their own preregs, never re-scored mid-run.
Caughtlift's "durable trace" leg deliberately excludes the saved message
log as a record (disclosed in arm evidence): the log holds the sentence,
not a booking anything reasons about. Onceaday's "honest" standard is
judged against the UI path only; the explicit-target tap divergence is
recorded as a caveat, not folded into the verdict — a future run may adopt
the any-caller standard without re-running fixtures, per the arm's metric
review section.

## Sense-testing

Caughtlift: full caught-lift transcripts quoted verbatim in arm evidence
(one village voice, journal/cost lines distinguished from village voice).
Onceaday: button states and tap tails quoted verbatim per action in arm
evidence. No canon doc covers ability-action refusals or pantry ledger
accounting generally (tracker blank 5, still open) — judgments use only
"No silent actions" and "If you don't know, it doesn't show."

## Infrastructure

Safe-commit index clobber hit worker commits in both worktrees (repaired via
HEAD-blob cacheinfo each time, commits verified correct). LANDING INCIDENT
(recovery, same class as 0416Z): the first onceaday merge attempt failed on
a main-tree .git/index.lock held by a concurrent sibling git process, but
the chained release step had already marked the branch done-merged and
removed its worktree; the branch itself was intact (ca1cd93aa) and master
was still f1308714c, so recovery was clean — re-register, verify branch
unchanged, merge ff-only, verify HEAD + clean tree BEFORE releasing, then
release/remove/branch-delete (verified: branch gone, master ca1cd93aa).
Lesson restated: never chain release after merge in one command; verify
HEAD first. Master moved twice under the run before the merges (sibling
journey crisis r59 a2a2a20f3, zero overlap with arm 1; arm 1's own merge,
zero overlap with arm 2); both arms rebased clean in their own worktrees
with proof re-runs green/identical. No EPERM flap. No jest (zero src/js;
arm proof scripts are the attributable verification). Main tree clean at
closeout (ca1cd93aa). Merged locally, pending ship. No push, no bump, no
live verification (ship-loop line).

food-economy stays converging (NOT converged): two ledger/refusal blanks
are now closed on measured evidence (one as a confirmed gap, one as a
pinned scope), but the scale wall is untouched by this axis and the
home-birth gap remains open as a Steve-call. scale-onramp stays converging
(untouched; sibling loop A live). Claim deleted; lock deleted.

Next blanks, in order: (1) home-village birth path (Steve-call game change,
own prereg — distant births alone can never reach the pantry door);
(2) dive_deep day-roll predictor extension (new, proven false refusal);
(3) calm_beast targeting path or fight-scanning precheck (new);
(4) caught-lift trust booking fix (bumpTrust + observe/remember) — a game
change, own prereg; (5) bar shows the why reason (new, narration surface);
(6) no canon doc covers ability-action refusals or pantry ledger
accounting (still open).
