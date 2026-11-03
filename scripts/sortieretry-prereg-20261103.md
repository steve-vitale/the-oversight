# Pre-registration — sim-sortieretry-a (Loop A 20261103, axis scale-onramp)

The tracker 121834Z entry's next blank: sortie RETRY — Q1 invalidation +
aiming, measuring sortie VALUE with its own prereg + wall bars, multi-only
agreement, explicit answers-vs-ok denominator. Unblocked by two landed
pieces: sortiev2 (evidence/2026-11-03/sim-sortiev2-a.md) settled Q1 YES
(a policy layer can skip stale offers on legal inputs: on a verb return
of 'none', invalidate every offer recorded BEFORE that return; the replay
over the sortie-b corpus cut attempts 47 -> 30 and 'none' attempts 24 -> 7
with zero useful attempts lost) and sortietarget (evidence/2026-11-03/
sim-sortietarget-a.md, landed ef3233b17) settled Q2 by building the
game-code threading (answerLingerer(how, targetKey?), lingerKey,
lastLingererOffer record, per-lingerer beats buttons, match-first).

## Canon read first

docs/CANON.md read. There is NO dedicated lingerer/sortie canon doc
(sortietarget prereg, same finding) — no canon is invented here. The
mechanism source is the code header in src/js/havenGrowth.js (design call
#8, 2026-10-16) plus docs/PERCEPTION.md as applied by the sortiev2 Q2
settlement: a policy standing in for the player knows who's around only
through its own senses — here, only the engine's announced-offer record
(state.lastLingererOffer, what was spoken aloud in a gorge line) plus its
own queue/answered set. This policy NEVER calls a roster-list or
world-array function; the proof test asserts those tokens absent from the
policy file, comments included.

## The question, stated honestly

The sortiev2 replay proof is a FILTER on a recorded sequence, not a live
run — and it rests on the claim that a 'none' return happens BEFORE any
muster or ration spend, so a suppressed attempt changes no game state
except the spoken line. This arm tests that claim LIVE, and measures
whether the combined retry policy (queue + Q1 invalidation + aiming) has
any VALUE over the landed last-offer-once aimed behavior — or whether it
is only a waste-cutting instrument with identical fights.

Why a queue at all: the landed sortietarget policy answers the LAST
announced offer once per (key,day). It is already immune to the sortie-b
flood (an already-answered offer is never re-answered). The flood lives
only in a queue policy that keeps unanswered offers: when the treeline
empties (6-night drift valve), the queue keeps answering its backlog into
an empty treeline, one wasted answer per day. The retry policy is
therefore defined against the queue, with the landed behavior as the
reference arm — three arms, one shared stack, identical seeds:

- Arm A (reference, landed behavior): closecommit stack + sortietarget
  AIMED last-offer-once layer (scripts/policies/sortietarget.js, as
  landed). Answers the last announced offer once per (key,day), with key.
- Arm B (queue, NO invalidation): closecommit stack + sortieretry queue
  layer with invalidate=false. Each daily: observe lastLingererOffer;
  enqueue it if its (key,day) is unseen; answer the queue head once per
  day with its key. On ok: dequeue the head. On 'no-fighters': KEEP the
  head (retry it next day — the bench, not the offer, is bare; Q1 says
  no-fighters does NOT invalidate). On 'none': dequeue ONLY the head
  (no invalidation) — the next stale offer is answered the next day.
  This arm is expected to reproduce the flood live.
- Arm C (queue + Q1 invalidation = the RETRY policy): identical to B,
  except on 'none': drop ALL queued offers recorded BEFORE that return
  (the whole backlog, Q1 global rule — the per-name refinement is NOT
  used; the global rule has no twin-name caveat). The queue is then
  empty until the next night's gorge enqueues a fresh offer.

The ONLY differences between B and C are the 'none' handler. The ONLY
difference between A and C is last-offer-once vs queue+invalidation.
No src/js changes in this arm: policy + driver + proof + evidence only.
If C wins, the deliverable is the policy layer as the recommended answer
layer for future arms (kept as an instrument file, like sortietarget.js),
NOT a game-code change and NOT a default flip.

## Measurement — staged (MEASUREMENT §§9–12, 14–15)

- STAGE 1 (pilot, 8 seeds): identical-seed driver table (sortietarget
  precedent), seeds 98601–98608 (next free band after 98401–98408 pilot
  and 98501–98512 confirm; if collided at run time, the next free band
  is used and the substitution is noted in the evidence file), 180d
  death-aware cap, closecommit stack (tribfloor leadfeast + windefer +
  seatdrive + fullseat-diag + titanroute + musterclose + mustergap) +
  answer layer. Env flags, same seven as the sortie drivers:
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
  FULLSEAT=1 HERALD=1. Mode herald.
- STAGE 2 (confirm, 12 seeds): ONLY on pilot GO. Seeds 98701–98712,
  same rule, same bars.
- Denominators, explicit (per the tracker blank): every rate below is
  reported over BOTH denominators — answers (all answerLingerer calls)
  and ok sorties (ret.ok) — plus the raw 'none' and 'no-fighters'
  counts. Multi-only agreement: first-fought agreement is judged ONLY
  over ok sorties with raidersAtStart >= 2 (single-lingerer agreement is
  trivially 100% in both arms and inflates any pooled rate — sortietarget
  metric review). Fire count (total fought entries) is reported with
  EVERY agreement number; a zero fought count with ok sorties is a
  broken instrument, reported as such, never as a zero effect.
- Attribution: RETURN-VALUE only (0815 lesson). The driver wraps
  answerLingerer and records the return object (fought[] captured at
  fight start by the landed havenGrowth attribution, targetMatched,
  raidersAtStart). No tbfight.id wrap anywhere.

## Primary metric and GO threshold (binding, §14)

PRIMARY: live Q1 suppression with zero useful lost, C vs B:
- (G1) Flood present: B 'none' calls >= 8 total on the pilot band.
  If the flood is absent, the verdict is INSUFFICIENT-DATA (not GO,
  not KILL): the suppression question cannot be judged on this band.
- (G2) Suppression: C 'none' calls <= 50% of B 'none' calls.
- (G3) Zero useful lost: C ok calls >= B ok calls − 2 AND C fire count
  >= 75% of B fire count.
- (G4) No wall regression vs A: C deaths <= A deaths + 25%, C wins >=
  A wins − 2. (Loose wiring bars, as in sortietarget: fight order
  legitimately changes RNG paths.)

VALUE VERDICT (reported alongside GO, not a fifth bar): C ok sorties vs
A ok sorties and C fire count vs A fire count. If C ≈ A on fights while
cutting waste vs B, the verdict is "GO as instrument, NO-VALUE as
gameplay change": the retry policy is worth keeping as the answer layer
but claims NO wall movement and NO gameplay land. If C beats A on ok
sorties or fire count by >= 25% with G4 holding, the verdict is
"GO with value" and the next arm may measure it against wall bars.

CONFIRM GO: same G1–G4 bars on the confirm band. Anything else =
KILLED as a policy (policy file deleted per kill protocol; no game code
was ever touched, so nothing to revert).

## Balanced panel (§15) — non-applicability, stated plainly

Same as sortietarget: the §15 panel binary runs registry policies only,
and no registry policy answers lingerers — so no panel run can observe a
sortie. The before/after instrument is the identical-seed driver table
(sortie-b / sortietarget precedent). No panel compare is attached, and
none is claimed. check.js --quick runs as the regression smoke (zero
src/js in this arm, so it is expected to match the standing profile).

## Sense-testing

Read transcripts: at least one C 'none' + invalidation episode (the day
the queue clears and the next fresh offer is answered) and at least one
C multi-sortie, quoted in the evidence file. Judge: does the village
read as answering the named beast and then stopping its dead questions,
rather than nagging an empty treeline?

## Kill protocol

On KILL: delete scripts/policies/sortieretry.js +
scripts/sortieretry-driver-20261103.js + scripts/sortieretry-analyze.js,
keep prereg + proof test (rewritten to prove the kill as applicable) +
pilot JSONs + evidence. Worktree left with ONLY committed work at
closeout. No src/js was touched, so no revert exists.

## Files

- Prereg: scripts/sortieretry-prereg-20261103.md (this file).
- Policy: scripts/policies/sortieretry.js (queue + invalidation).
- Driver: scripts/sortieretry-driver-20261103.js (adapted from
  sortietarget-driver-20261103.js; arms reference|queue|retry).
- Analyzer: scripts/sortieretry-analyze.js (answers/ok/none/
  no-fighters/fire/multi-only agreement/wall bars per arm).
- Proof: scripts/test-sortieretry-a.js.
- Evidence: evidence/2026-11-03/sim-sortieretry-a.md.
- Per-seed JSONs: evidence/2026-11-03/perseed-sortieretry-a/.
