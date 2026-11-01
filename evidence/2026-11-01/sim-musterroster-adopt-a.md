# sim-musterroster-adopt-a — live-seed adoption of the muster-roster build

Run: fleshout-loop-a-20261101T2315Z, arm sim-musterroster-adopt-a, axis scale-onramp.
Worktree branch: sim-musterroster-adopt-a. Anchor: pilot + diagnostic runs on
worktree HEAD 6ef32f7e (prereg commit; build 11ea80917 is an ancestor).
Prereg: evidence/2026-11-01/sim-musterroster-adopt-a-prereg.md — committed
BEFORE any judged sim (commit 6ef32f7e). Judged against it below; no bar
was changed mid-run. No game code changed by this arm (instrument + evidence
only). No [needs-eyes] (measurement only, nothing player-facing).
Panel (§15): NOT APPLICABLE — single-arm before/after on identical seeds
with a snapshot-vs-actual comparison at the same trigger moment, not a
panel policy comparison (same declaration class as muster3).

## Verdict: NO-GO (pilot) — mechanism ADOPTED, ceiling still short

The build does what its fixture promised on a real timeline: rosterless
linked villages answer the call with real named people. But on the live
90111 timeline the sounded call yields 6, not ≥10, and the muster stays
NOT READY at 9/10 after full Haven commit — so the prereg GO bars fail
and, per the prereg's pilot gate, NO confirm spend was made. The binding
constraint moved: it is no longer faces, it is quota. At the first refused
Herald attempt on current master, trust sits at 69/48/57 (base tier, quota
2 each) instead of the before-corpus 91/84/88 (trusted tier, quota 6 each).
Faces fixed, quota short: 2+2+2 = 6.

## Before / after (seed 90111, first refused Herald attempt)

BEFORE (recorded muster3 corpus, base 7f87585608b5): first refusal day 87,
omen stage 2, snapshot callYield 3 every snapshot, ceiling 6/10; sounded
call brought exactly 3 allies (Emberhold only), muster NOT READY, zero
later Herald fights. Stonebridge/Thornfield: quota 6, facesFree 0, roster
field ABSENT.

AFTER (this run, current master, same policy stack, same instruments):
- Trigger: first refused Herald attempt, day 72 (not 87 — see base drift).
- Snapshot at trigger: callYield 2; links Emberhold trust 69 / quota 2 /
  facesFree 3, Stonebridge trust 48 / quota 2 / facesFree 0, Thornfield
  trust 57 / quota 2 / facesFree 0. Pre-call roster read: Emberhold roster
  present (12), Stonebridge NO roster, Thornfield NO roster — the 90111
  roster-absence shape reproduced live.
- Sounded call: 6 allies — Emberhold: Kenji Ford, Elena Kowalski;
  Stonebridge: Kira Reyes, Ibrahim Costa; Thornfield: Omar Frost,
  Deshawn Santos. Every responder verified: named, living adult, present
  on its village's roster at call time (validator: responders-verified
  PASS, problems none).
- Link count unchanged by the call: 3 → 3 (no link created).
- Haven commit (two taps): 3 blades. Muster total 6 + 3 = 9/10 —
  readyAfter FALSE. Zero later Herald fights (92 refused attempts total,
  0 fought after the call).
- Validator (scripts/test-musterroster-adopt-a.js) on the pilot JSON:
  yield-vs-snapshot PASS (6 ≥ 2), Stonebridge PASS (2), Thornfield
  PASS (2), responders PASS, links PASS, instruments-clean PASS (0+0
  errors); yield≥10 FAIL (6); ready-after-commit FAIL. Overall FAIL.

## Control (seed 85106): NOT JUDGED on current master

85106 produced ZERO Herald attempts and zero muster snapshots on current
master — in BOTH this replay and the no-call diagnostic sweep below — so
the control never triggered and no yield comparison exists. The before
corpus's "reachable control (call 5→9)" no longer describes 85106 on
current master. This is base drift (below), not an instrument failure:
the diagnostic sweep uses the unmodified muster3 instrument and also
finds zero. A next run needs a fresh refused-Herald screen on current
master before adopting old control seeds.

## Base drift — why the before timeline moved (diagnosed, not assumed)

Between the muster3 corpus base (7f87585608b5) and this run's HEAD, the
only src/js movement builds are 11ea80917 (this build: titanAlliedFaces
only, called solely from soundTitanCall, which is never called before
the trigger) and 3056aeb4f "Herald drift toward Haven" (wanderWorldMonsters
biases Herald steps Haven-ward; its own proof: contact 295→3589 ticks on
identical seeds). The Herald-steer build is the drift source: Herald
contacts Haven earlier (day 72 vs 87), before trust has climbed to the
trusted tier (69/48/57 vs 91/84/88), so quotas are base-2 instead of
trusted-6. Proof the replay itself is non-perturbing: the unmodified
muster3 sweep re-run on current master (diagnostic, not judged) reproduces
the replay's pre-trigger state exactly — 90111 first refusal day 72,
trusts 69/48/57, quotas 2, snapshot callYield 2; 85106 zero attempts.
The before/after comparison at the trigger moment is therefore valid
(snapshot 2 vs actual 6 on the same timeline); the cross-base comparison
(before corpus day-87 trusted-tier shape vs live day-72 base-tier shape)
is NOT an identical-seed comparison anymore, and this report does not
present it as one.

## What the corpus shows after the call (recorded, not judged)

- Generated rosters persist: later snapshots show Stonebridge facesFree 2
  and Thornfield facesFree 3 (the uncommitted remainder of the rosters
  the call generated). A second call would add nothing — quota already
  met (already = 2 each) — which is correct per game rules, not a bug.
- Trust bleeds across the refusal window: Emberhold 69 → 4, Stonebridge
  48 → 0, Thornfield 57 → 0 by days 72–102, and by day 103 the snapshots
  carry NO active links at all. Refusals keep coming (92 on 90111) while
  the trust needed for trusted-tier quota drains away — a doom loop
  worth a next arm's attention (see metric review): every refused
  attempt happens at a trust level the refusals themselves erode.
- Tail observation (single seed, NOT a claim): the intervened 90111 run
  ended village-lost day 107, maxWave 4; the unintervened diagnostic
  sweep on the same seed ended day 140, maxWave 5, national 1. Sounding
  a short muster commits 3 Haven blades out of the workforce; whether
  that hastened the loss is unproven on n=1 and is flagged, not claimed.

## Sense-test (SENSE-TESTING LAW — transcript read)

The call reads sensibly and humanly, not list-fed:
"📯 THE CALL GOES OUT — THE HERALD must fall, and no one fire can do it.
— Emberhold answers! Kenji Ford and Elena Kowalski will march. (trust
holds — they are counting on you.)
— Stonebridge answers! Kira Reyes and Ibrahim Costa will march. ...
— Thornfield answers! Omar Frost and Deshawn Santos will march. ..."
Responders are real named people, one fire answering at a time, with the
trust-holds line carrying the social consequence. Quota and refusal still
come from trust/opinion only; the roster only names who answers — the
perception-law reading of the build holds on the live timeline. No
robotic repetition beyond the game's own repeated refusal lines (the
92 refusals are the same gate line; that is the game's narration of a
stuck gate, already documented by muster3, not new here).

## Wall numbers

Pilot (intervened, call sounded on 90111 only): 90111 — maxWave 4,
national 0, table 0, won 0, 107d, village-lost; 85106 — maxWave 4,
national 1, table 0, won 0, 181d, village-lost. Band: national 1/2,
table 0/2, wins 0/2, wave-5 reach 0/2, median survival 144d, max 181d.
Death-cause shares (run samples, not a full census): 90111 (31 sampled
deaths) — combat 10, villager combat 8, the wild 7, monster 3, starvation
1, sickness 1, arena 1; 85106 (69) — combat 39, villager combat 8,
sickness 7, the wild 6, expedition 3, wound 2, starvation 1, stranger 1,
monster 1, alien 1.
Diagnostic no-call sweep (same seeds, current master): 90111 — maxWave 5,
national 1, table 0, won 0, 140d, village-lost, 130 Herald attempts all
REFUSED, 1 field fight; 85106 — maxWave 4, national 1, table 0, won 0,
181d, village-lost, 0 Herald attempts.

## Village assessment (plain words)

The village on 90111 meets the Herald too early and too poor in friends.
It has three allied fires who would fight beside it, and the call now
actually reaches the two it could never reach before — Kira, Ibrahim,
Omar, and Deshawn do march. But friendship is thin at first contact:
each fire can spare only two blades, so even with Haven itself throwing
in three more, the muster stops one blade short of the ten the Herald
demands. Then the village keeps asking, keeps being refused, and each
refusal seems to wear the friendships thinner until the links themselves
are gone. The build fixed the empty-chair problem; the remaining problem
is a race — the Herald arrives before the friendships are strong enough
to answer in force, and refusing makes them weaker, not stronger.

## Blanks filled / documented

- FILLED (evidence): live-seed adoption proof that rosterless villages
  answer with named living adults (Stonebridge 2, Thornfield 2 on 90111).
- DOCUMENTED (not fixed, out of scope): (1) quota, not faces, now binds
  the 90111 ceiling at first contact; (2) Herald-steer invalidated the
  muster3/85106 befores — future adoption arms must re-screen on current
  master after any movement build; (3) trust-bleed doom loop across
  repeated refusals + link dissolution by day 103; (4) possible tail
  cost of sounding a short muster (n=1 observation only).
- NOT touched per task bounds: #1538 steve-call queue, gates, stages,
  deed bars, win prices.

## Metric review (for the NEXT run — no bar changed here)

1. "First refused attempt" is the wrong trigger moment under Herald-steer:
   first contact now precedes trusted-tier trust, so a first-contact GO
   bar of ≥10 is nearly unreachable by construction (max 2×3+3 = 9).
   Next run should pre-register a trigger a competent player would use —
   e.g. the call at the refusal moment when trust first reaches the
   trusted tier, or the best-yield refusal moment — and judge THAT, with
   the first-contact result reported alongside, not substituted.
2. Before corpora must be re-baselined on current master after movement
   builds: identical seeds are not identical timelines across a steer
   build. The snapshot-vs-actual comparison at the same trigger moment
   (used here) survives drift; cross-base before/after does not.
3. The control seed must be re-screened on current master (85106 no
   longer contacts). Do not carry mustercall-b/muster3 control seeds
   forward unverified.
4. Next arm candidate (from this run's findings, for the coordinator):
   the trust race — time for links to reach trusted tier vs Herald
   arrival time under steer, and whether refusal trust-bleed is intended
   (it makes the trusted tier unreachable after contact begins).

## Corpus

evidence/2026-11-01/perseed-musterroster-adopt/ — pilot.stdout/stderr,
pilot-s90111.json, pilot-s85106.json (judged), diag-sweep.stdout/stderr
(unmodified muster3 sweep on current master, diagnostic only).
Validator note: scripts/test-musterroster-adopt-a.js was fixed after the
pilot run to parse whole-file JSON (the first version read only the
first line and could not run on pretty-printed per-seed files) and to
display an unjudged seed as N/A rather than FAIL. No gated bar changed:
90111 shows the same two FAILs (yield≥10, ready) under both versions.
The validator fix is committed with this evidence.
