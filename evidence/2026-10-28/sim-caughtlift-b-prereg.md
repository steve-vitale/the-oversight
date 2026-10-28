# sim-caughtlift-b prereg — caught-lift trust narration blank (measurement only)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261028T0530Z,
axis food-economy, arm sim-caughtlift-b. Base: master at worktree
creation (5ef4d5bad version bump on top of 065e31dc5). Committed
BEFORE any judged fixture or sweep in this arm. Zero src/js changes
are planned; this is a MEASUREMENT arm. If a fix looks obvious it is
reported in the evidence, not landed unpreregistered.

## Backlog item

Tracker 2026-10-28 0330Z blank 3 / 0444Z blank 2: a caught lift's
trust narration is unobserved. NOT re-litigated here (stated context
from prior arms): sim-outflowzero-b fixture-proved Light Fingers
lift capture exact to 0 kcal (400 kcal) on seeds 9820 + 9850, with
band lift calls 0 (competent never calls thief);
sim-thiefcooldown-b (2026-10-21) proved a genuine-theft caught lift
still punishes trust -20 with the "Caught red-handed! They saw you
steal. Trust -20." line and a 50% palm rate. Still unobserved: when
a caught lift fires, does the village narrate it in its own language
beyond that one line, and is the trust move booked/traceable in the
log/ledger (vs a silent drop)? Is the -20 village trust, link trust,
or conflated with reputation?

## Canon

docs/CANON.md read first. NO canon doc covers ability-action
refusals or pantry ledger accounting generally (tracker blank 5,
2026-10-28) — stated in evidence, not invented; docs/GARDENS.md
covers only the cultivate gate. Canon rule relevant here, from the
manifest: trust ≠ reputation (gossip moves REP, never trust).
Firing conditions below are read from src/js code, not canon.

## Firing conditions (read from code, before any probe)

1. ABILITY LIFT (`thief.steal_pantry`, src/js/abilityActions.js
   ~1708): player holds thief, haven stores access != 'none',
   pantry holds a positive-kcal stack, carry room >= 1 unit.
   Lift = up to 2 units of the largest-total-kcal stack. Coin:
   `caught = Math.random() < 0.5`. Caught branch (abilityActions.js
   ~1752): direct `v.trust[vid] = max(0, (v.trust[vid] || 15) - 20)`
   where vid = player's villagerId; `observe('caught_you_stealing')`;
   say line 'A hand closes on your wrist. "Really?" -20 trust.
   The pantry remembers. (Light Fingers — caught.)'. Clean branch:
   'The food disappears. Magic. (It\'s not magic. Nobody saw.
   Light Fingers.)'. NOTE (code-read, to be confirmed by probe):
   the caught branch does NOT call bumpTrust, so the bumpTrust
   telemetry path (`tele('trust', {who, delta, reason})`,
   game.js ~8102) is not obviously engaged; and observe()'s
   action table (game.js ~16972) has NO 'caught_you_stealing'
   entry, so observe() returns before the witness loop — the
   observe call may be a full no-op (no gossip, no witness rep).
   The ability code also does NOT call remember() or hoardFood().
   The probe tests exactly this.
2. ORDINARY-TAKE CAUGHT (`takeFromPantry`, game.js ~16043):
   fires only when trailing-7d net take rate >= 3000 kcal/day AND
   the player holds thief AND the palm coin fails
   (`Math.random() < 0.5` palms cleanly, else caught). Caught
   branch: direct `v.trust[vid] = max(0, (v.trust[vid] || 15) - 20)`
   (again NOT bumpTrust) + 'Caught red-handed! They saw you steal.
   Trust -20.' This is the thiefcooldown line; it is probed as a
   SECONDARY diagnostic only (the judged verdict is the ability
   lift, leg set below). Its theftConfrontation tail may add a
   witness confrontation line and a -8 trust move on the
   confronter (a DIFFERENT villager id) — recorded separately,
   never counted as the lift's -20.
3. TRUST vs REP (code-read): v.trust[vid] is the trust map keyed
   by villager id; the caught branches write the PLAYER's own id
   (village trust in the player). Reputation lives separately
   (repOf / applyRep dims). The probe records repOf(player) before
   / after to test conflation: a pure trust move leaves rep dims
   unchanged except via any witness/gossip side path, which is
   itself reported.

## Primary metric and GO threshold (BINDING)

Per seed (9820, 9850), one scripted CAUGHT ability lift
(Math.random forced to 0.1 during the useAbility call only, so the
`< 0.5` coin is caught; fixture trust preset to 50 so the -20 is
not clamped by the 0 floor; preset and coin printed in output):

- Leg (a) EXACT RECORDED TRUST DELTA: v.trust[playerVillagerId]
  after minus before == -20 exactly.
- Leg (b) PLAYER-VISIBLE NARRATION: >= 1 say() line captured
  during the lift, quoted verbatim in the evidence. (The caught
  line itself satisfies (b); a SECOND village-voice line — named
  witness, gossip voice, later conversation line — is recorded
  as a bonus diagnostic, never required.)
- Leg (c) TRACEABLE IN LOG/LEDGER: >= 1 durable record of the
  -20 beyond the transient say line, among: a state.telemetry
  'trust' event with delta -20 for the player id; a v.memory
  entry of type caught_you_stealing/theft for any roster id; a
  v.gossip entry for action caught_you_stealing/theft/hoard; a
  ledger food-truth entry (hoardFood) for the lift. The say line
  alone does NOT satisfy (c).

DIAG-GO iff legs (a), (b) AND (c) ALL pass on EACH of seeds 9820
and 9850. Otherwise DIAG-NO-GO: the evidence names exactly which
leg(s) failed, as a blank. No re-scoring against a friendlier
metric mid-run. Metric doubts go under "metric review".

## Secondary diagnostics (NOT judged)

- S1 ordinary-take caught path (forced rate + forced coin 0.9):
  same three legs, reported separately.
- S2 clean-palm control (ability lift, coin forced 0.9, so the
  `< 0.5` caught coin misses): trust delta
  must be 0 and the clean line quoted.
- S3 village-language scan: every say() line from the caught
  lift transcript, plus a conversation-topic scan for a
  caught_you_stealing memory surfacing in later dialogue text
  (convoTopics.js map line, if any memory exists to surface).
- S4 rep-conflation check: repOf(player) dims before/after the
  caught lift.

## Pilot band (confirms band lift calls, wall numbers)

8 seeds, fresh range 10420-10427 (no collision with prior bands
9820/9850, 10400-10417), competent policy, 100d death-aware cap
(runDays stops on death; villages that die stop simulating — no
fixed-200d horizon). Horizon rationale: this is a narration
blank, not a reachability claim; 100d is long enough for the
competent policy to play several pantry cycles while keeping the
band cheap, and death-awareness keeps dead villages from padding
the denominator. Band records per seed: thief.steal_pantry call
count (useAbility wrapper), Light Fingers say lines (any fired
lift is sense-read in full), won / arc / max rank / table /
wave reach / median survival. Expectation from outflowzero-b:
lift calls 0. Any fired lift is sense-read, not averaged away.
No balance-panel compare is fabricated: there is no before/after
game leg (zero src/js change), so the panel has no pair to
compare; the judged comparison is fixture before/after on
identical seeds (trust/rep/telemetry before vs after one lift).

## Seeds, policies, instrument

- Judged fixtures: seeds 9820, 9850 (outflowzero substrates).
- Band: seeds 10420-10427, competent policy only.
- Instrument: scripts/test-caughtlift-b.js (new file, this arm),
  built on scripts/sim-harness.js loadGame/setupGame/runDays
  (seed Math.random BEFORE eval; FULL src/js list in index.html
  order minus DOM-only app.js/sprites.js/tile-scenes.js/
  move-anim.js/drama.js; never stub Game.save). Fixture setup
  (grant thief, preset trust 50, force coin) touches only the
  fixture's own fresh game state and is printed in output.
  fullTelemetry: true for fixtures so the tele stream is kept
  whole (not the 300-event ring).

## Metric review

(To be filled after the run. Pre-run note: leg (c) deliberately
excludes the say line itself — if the only record of a -20 trust
move is a transient narration string, that IS the blank the
tracker asks about, and the verdict must say so rather than
counting the line twice.)
