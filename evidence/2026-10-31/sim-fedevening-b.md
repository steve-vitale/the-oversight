# sim-fedevening-b — DIAG: the strand set is empty on this base (lever UNJUDGED)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T1430Z,
arm sim-fedevening-b, axis food-economy. Worktree sim-fedevening-b.
POLICY PROTOTYPE ONLY: one new policy file
(scripts/policies/fedevening-diag.js), zero edits to any existing
policy file, zero src/js changes, zero policy-default flips. This
worker does NOT push, bump, or verify live; the coordinator merges.
Status to coordinator: committed on branch, pending coordinator
merge. Per the task brief, the prototype + instruments + corpora +
evidence are committed anyway; the coordinator handles prototype
cleanup. Nothing is deleted silently.

## Verdict: DIAG (substrate void) — the lever is UNJUDGED, not NO-GO

The prereg (evidence/2026-10-31/sim-fedevening-b-prereg.md, commit
dc832a7c5) was committed BEFORE any judged leg, and the instruments
(commit b16eaf7a2, pure proof 20/20) before the pilot. The pilot
then failed its sniff on substrate, not on mechanism: on this base
there is NO strand to judge. The 15215 strand every prior arm
measured (guard still 7-9, ON still 7-16, re-derived on every prior
base) does not exist here — the vessel never leaves haven on any pilot
seed, on either leg, through either driver. With zero still
evenings, the prereg's GO clauses (fall >= 2 + linked rescue,
strand non-increasing, guardrails) have no denominator: they are
UNEVALUABLE, not failed. Per the prereg's staging, no confirm
spend follows a failed pilot sniff — running 72 confirm legs over
stay-home villages could not change any clause, so none were run.
The branch-fire substitution mechanism itself was never exercised
(zero gathers, zero fires): this verdict says nothing about
whether it works. It needs a re-based strand and a new prereg, not
a burial. A NO-GO verdict here would be dishonest — it would
claim a mechanism failed that never got to run.

## Canon read

docs/CANON.md first, then docs/TIME-ECONOMY.md (ticks/day-parts;
bridge 96 ticks + 60 kcal; gatherFallen 16 ticks + 10 kcal,
bare-hands, no tool gate) and docs/PRESERVATION.md (the ladder;
unknown food is not food until identified). No canon doc covers
the strand-fix blank itself — stated in the prereg, not invented.

## The design (carried forward untested, not killed)

Strand-evening deadfall branch-fire substitution: on a still-creek
evening, after the failed bridge attempt, gather fallen branches
(bare-hands — no axe, no food gate) and, if branches >= 2, light
a BRANCH fire — never a log fire (fireFuel() falls back to wood
below 2 branches, so the fire step is gated on branches >= 2).
The wrapper sits INSIDE woodwarm, so a lit branch fire reads
nearFire -> warmth miss 'fire-near' and unlit branches >= 2 read
miss 'branches-available': either way no log fire lights that
night and the bridge logs stay in the pack for tomorrow's bridge.
It names its failure (wood-bleed via warmth log fires, jointly
with ticks) and explicitly does NOT address kcal-short evenings,
the ticks-short day-7 evening, the felling tool gate, or the 15337
retry-refusal. All of that stands as designed — it is simply
unmeasured, because the strand it was designed for is gone.

## PILOT (sniff, never judged) — FAIL ON SUBSTRATE

8 seeds (15003, 15009, 15091, 15211, 15215, 15220, 15221, 15337),
ON variant leg only, stdout-runner transport (stdout -> file in
evidence/, idle splitter, jsonl deleted after split):

| check | result |
|-------|--------|
| files present | 8/8 |
| driver errors | 0 on every leg |
| daysAlive / endReason | 30 / survived on all 8 |
| creek evenings (any seed) | 0 |
| still evenings on 15215 | 0 (control range was 7-16) |
| fedevening records on 15215 | 30 (all 'not-still-creek' skips) |
| fedevening acts (gathers/fires) | 0 on every seed |
| warmth acts on 15215 | 0 (control ON: 6) |

Pilot pass required "the gather/fire gates evaluated on real
15215 still evenings" — with zero still evenings there is nothing
to evaluate. The prereg's zero-gather clause (KILLED-AT-PILOT if
no deadfall in reach ON still evenings) does not apply: this is
one level up — no still evenings at all. The pilot sniff fails,
so per staging the confirm band (12 seeds x 6 legs) was NOT run.
OFF det-gate legs were likewise not run: with zero creek evenings
on control AND variant, OFF == control would be vacuous
([] == []), and the pilot variant leg already proves the driver
runs clean (errs 0, 30/30 evenings).

## THE DRIFT, PROVEN THREE WAYS (not a driver bug)

1. Pilot variant leg (new fedevening driver, FEDEVENING=1,
   WOODWARM=1): all 8 seeds 0 creek evenings, all evenings at
   haven, all 30 days survived.
2. Drift-check (ORIGINAL unmodified morningcarry-trace-b.js,
   the exact driver that produced windowcarry's control legs):
   15215 ON and guard alike, 0 creek evenings, vessel at haven
   all 30 evenings. Same driver file, same env, same seed as
   windowcarry's control — different trajectory.
3. Fresh control legs (original driver, 8 seeds x guard + ON):
   0 creek evenings on all 16 legs, all survived 30 days.

Two independent drivers agree, so this is base drift, not an
instrument failure. The game-code deltas between windowcarry's
evidence commit (824b27c42, 14:19Z) and this worktree's base
(19b3e1ae0, 14:28Z) are exactly two: src/js/fieldFights.js
(lootabilities-w2 Arms 4-5, ability field coverage) and
src/js/villager-build.js (lootabilities-w3 Arm 6, villager
self-craft duty), plus windowcarry's own cleanup and proof
scripts. No policy file, no harness file, no driver file changed
in that interval.

## WHY THE STRAND MOVED (mechanism class proven, draw unisolated)

The spawn is identical (vessel gen_gyft62f on both trajectories)
and mornings 2-3 match — then the RNG stream diverges. Pilot
morning 4 holds 2340 kcal where control holds 2294; pilot day 4
spoils "unknown nuts" where control spoils "unknown shoots";
pilot day 4 meets Brian/Paolo where control meets Fatima/Nikolai/
Yara and learns a Swarm Hum counter. Names, gossip, spoilage —
all RNG draws — differ from day 4 on, and the day-7 departure
(a routine lottery) comes out the other way: the vessel stays
home. The strand was never a property of seed 15215 alone; it
was a property of seed 15215 PLUS the exact RNG stream. The two
landed systems both add RNG draws (Arm 6 craft-odds lotteries in
NPC daily duties; field-fight ability coverage lotteries), and
any new draw anywhere in the shared stream shifts every later
draw, including the player's departure decision. Which exact draw
shifted it is NOT isolated here — the say lines carry no Arm 6
craft line on the pilot trajectory (28 craft-ish matches are all
item mentions, not attempts), and isolating the draw would need a
bisect this arm's staging does not ask for. The honest claim is
the class (shared-stream shift from the two landed systems), not
the draw. A future arm that needs the old stream must bisect or
re-derive, not assume.

## SENSE TEST (law) — PASS on what exists, with the gap stated

Read end to end: pilot 15215 days 4 and 7. The stay-home village
reads as people living days — dawn, spoilage swept, hunger noted,
pantry beans eaten (some off, -5 health, narrated honestly),
water drunk, assignments handed out ("Fish. They'll report back
by next part."), overheard creek talk ("The creek's lower than
yesterday"), a low-trust refusal ("Not today. Sorry."), a wood
run chosen over fish nets because the pantry is full. PASS on
meaning for a haven-bound village. The gap is stated, not hidden:
there are NO strand days to sense-read — no creek evening, no
gather line, no substitution line, no bridge line exists in any
judged corpus. The narration of the fix is untested alongside
the mechanism.

## Reachability verdict

Creek/bridge content is NOT reached on any leg in this window
(0 creek evenings on 26 runs: 8 pilot + 16 control + 2 driftcheck,
all stay-home). This is a road-to-content finding, not a
content finding: the bridge code is unchanged, but the road that
used to walk the vessel to the creek no longer fires on this
band. No wave-4/5 reach, no regional/national/table content is
in scope of this census, and none is claimed either way.

## Village assessment, in plain words

Picture the village the strand arms always saw: the scholar
leaves home, walks to the creek, and gets stuck there night
after night. On this base that village is gone — not dead, not
broken, just home. On all eight seeds the scholar spends thirty
days in the haven: eating beans from the pantry, drinking clean
water, listening to gossip, sending other people out to fish,
turning to the wood run when the shelves are full. The same
person, the same starting seed, the same village — but the
game's dice now fall in a different order, because two new
systems (villagers crafting their own weapons, wider ability
coverage in field fights) added new dice rolls to the shared
cup, and every roll after them lands differently. The scholar's
decision to walk out on day 7 was itself one of those rolls,
and now it lands "stay." Nothing in the haven looks wrong — the
days read fine, the pantry feeds everyone, nobody dies — which
is exactly why this is easy to miss: a healthy-looking village
that simply never takes the road where the whole strand story
used to happen. The branch-fire fix I built for that road is
still sitting in the pack, unused — it never got a night out
at the creek to prove itself on.

## Wall numbers

NOT OBSERVABLE on a 30-day pre-seat census — reported, never
fabricated. Observed counts on all legs run, all seeds alive at
day 30 (daysAlive 30, endReason survived): national 0, table 0,
wins 0 (structurally unreachable in this band, not a wall
measurement); median survival 30 days (ceiling — all legs
survived the window). Wave reach is not reported as a wall
number here because the band never leaves haven: no field
content is exercised at all.

## Blanks filled or documented

- Documented (this arm, measured): THE STRAND SET IS EMPTY ON
  THIS BASE. 15215 guard [] / ON [] (was [7,8,9] / [7..16]);
  the full 8-seed pilot band [] on both control legs. Any strand
  arm judging on this band on this base measures nothing. The
  next strand arm must re-derive the strand set on ITS base
  before judging — a derivation pre-step, not an assumption.
- Documented (this arm, mechanism class): STRAND SEEDS ARE
  RNG-STREAM-FRAGILE, not seed-pinned. A landing that adds RNG
  draws anywhere (NPC duties, fight lotteries) can move or erase
  a strand seed without touching strand code. Strand preregs
  should pin the stream (re-derive on the run's base) or the
  verdict is void.
- Documented (this arm, unisolated): the exact shifting draw is
  NOT identified (fieldFights vs villager-build candidates
  named, no Arm 6 craft line in the pilot transcript). A bisect
  is owed before anyone claims which landing moved the strand.
- Carried, NOT re-judged: the branch-fire substitution design
  (prereg, policy, driver, analyzer, proof) is complete and
  untested — it needs a new strand seed + a new prereg, not a
  rewrite. The 15337 day-20 retry-refusal blank (bridge built,
  retry refused, combat intervened) likewise evaporates with
  the strand set on this base: 15337 control is now [] too, so
  that blank survives only as windowcarry-variant evidence.
- Filled (instrument): the fedevening driver + stdout transport
  + splitter are proven clean on a strandless band (pilot 8/8,
  errs 0, split 8/8 first-try); the analyzer's joint-gate,
  pre-strand-identity, and guardrail machinery is implemented
  and pure-tested but has no strand to run on (its corpus
  checks assert the empty-strand facts instead).

## Metric review (revisions apply to the NEXT run, never mid-run)

- Prereg Q1 (branch fire vs cold nights): UNMEASURED — no
  branch fire ever lit, no cold strand night observed. The
  question carries forward verbatim to the next strand prereg.
- Prereg Q2 (gather-alone vs fired nights): UNMEASURED — no
  gather ever attempted. Same carry-forward.
- Prereg Q3 (bark side effect): UNMEASURED — no gather, no
  bark. Same carry-forward.
- Prereg Q4 (15337 retry-refusal, one blank or two):
  UNMEASURED and now MOOT on this base (15337 control []).
  If a re-derived strand set produces a retry-refusal evening
  again, the question reopens there.
- New doubts for the NEXT run, not re-scored here: (1) whether
  ANY seed strands on current master at all — the re-derivation
  must sweep wider than the 8-seed band (the 10-seed bank, then
  fresh seeds) before a strand arm is even planned; (2) whether
  strand arms should judge on a FROZEN stream (a pinned base +
  pinned policy set) rather than current master, given that any
  landing can void the seed — that is a coordinator/Steve
  decision about what strand evidence means, not a worker call;
  (3) whether the stay-home trajectory itself is a bug or a
  legitimate routine outcome — the vessel's days read coherent,
  but a competent policy that never departs on 8/8 seeds in 30
  days deserves a DIAG of its own (departure conditions on this
  base), separate from any strand fix.

## §15 panel (non-applicability declaration)

scripts/balance-panel.js runs sweep-compare registry policies on
150-day horizons with its own scorecard and observer contract. It
cannot express the nighttravel+woodcarry+woodwarm strand stack,
the 30-day creek-evening census, or an env-gated single-mechanism
probe — the same declaration every prior strand arm made. No
panel result is fabricated; the panel tool was not invoked on
this corpus. With no strand, there is not even a paired compare
to attach: the evidence is the pilot + control corpora and the
proof's corpus checks, not a compare .md.

## Infrastructure findings (for the coordinator — NOT game findings)

1. Stdout transport worked first-try this run (pilot 8/8 lines,
   split 8/8, errs 0), and the original driver's file mode also
   wrote first-try on all 17 driftcheck/control legs — no EPERM
   flap observed in this window. The rule stands anyway (game-
   loaded processes cannot be trusted to write files; stdout ->
   file -> idle split is the proven form).
2. Safe-commit index clobber hit BOTH commits in this arm
   (prereg file, then all 5 instrument files: committed files
   showing staged-as-deleted while byte-identical in the
   worktree). Repaired each time via `git update-index --add
   --cacheinfo` from HEAD blobs; `git status --short` empty +
   `git diff HEAD` empty verified after each repair. The commits
   themselves were never in doubt (blob hashes match).
3. Judged corpora were never staged in /tmp (pilot jsonl lived
   in evidence/ until split, then deleted, per the rule).

## Proof

scripts/test-fedevening-b.js: 24/24 checks pass (20 pure +
4 corpus): BFS target choice (empty, adjacent, tie-breaks,
walled ring, thicket, row-major), fire-cost rule, substitution
lines (lit/failed/gather-alone/none), wrapper gates (lever-off,
not-still-creek, rescued), strand runs, joint-gate link logic
(in-range + wooded + linked / wood-short / out-of-range),
starvation counting, and corpus facts (pilot 8/8 errs 0 zero
creek; control 8/8 per leg errs 0 zero creek; driftcheck
15215 both legs stay-home; pilot 15215 vessel never leaves
haven, spawn vessel gen_gyft62f).

## Files

- Prereg: evidence/2026-10-31/sim-fedevening-b-prereg.md
  (commit dc832a7c5, BEFORE any judged leg)
- Evidence (this file): evidence/2026-10-31/sim-fedevening-b.md
- Policy (new, default-OFF): scripts/policies/fedevening-diag.js
- Driver: scripts/fedevening-trace-b.js; analyzer:
  scripts/analyze-fedevening-b.js; splitter:
  scripts/split-fedevening-jsonl-b.js; proof:
  scripts/test-fedevening-b.js (24/24)
- Pilot (ON variant leg only, NEVER judged):
  evidence/2026-10-31/sim-fedevening-b-corpus-pilot-on (8 files)
  + sim-fedevening-b-pilot-on.stderr.log (jsonl deleted after
  split, per the rule)
- Drift-check (original driver, 15215): evidence/2026-10-31/
  sim-fedevening-b-driftcheck-on,
  sim-fedevening-b-driftcheck-guard (1 file each)
- Fresh control legs (original driver, 8 seeds x 2 legs):
  evidence/2026-10-31/sim-fedevening-b-control-on,
  sim-fedevening-b-control-guard (8 files each)
- No confirm corpora exist (no confirm spend per staging); no
  compare .md exists (no paired comparison without a strand);
  no OFF legs exist (det-gate vacuous on a strandless band —
  stated, not hidden).
