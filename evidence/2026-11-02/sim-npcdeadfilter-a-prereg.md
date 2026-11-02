# sim-npcdeadfilter-a — PREREG (written BEFORE any judged sim in this arm)

Arm: npcIds() dead filter BUILD, Loop A run fleshout-loop-a-20261102T1515Z
follow-up (i), axis scale-onramp. Follow-up to sim-deadid-a
(evidence/2026-11-02/sim-deadid-a.md; landing d7fa67ee6, already on
this worktree's base). Scope (i) ONLY, per the task: exclude
dead-marked ids from npcIds() (src/js/betrayal.js), consulting the
same death records deadMarked() uses (data.villagers record,
background_survivors record, vpOf/rosterChars — all three, per the
deadid evidence, because removeVillager marks only the first record
it finds). Do NOT touch debate-notices-death, the live-sim refusal
transcript bundle, or genApplicant (already landed). No policy-file
changes. No [needs-eyes]: a pure membership filter; nothing in
normal play changes when no dead id sits on a roster (the filter is
a no-op on a clean roster), and no new narration is added.

## Background (proven, not re-litigated)

Deadid scope (a) closed the entry gates: genApplicant excludes
deadMarked ids and arrivalTick refuses a dead-flagged arrival. But
succession (src/js/ledger.js, playerDeath) still trusts roster
membership alone: `candidates = this.npcIds()`, sorted by trust,
`candidates[0]` becomes bearer. npcIds() itself
(src/js/betrayal.js) is only `(roster).filter(id !== villagerId)` —
no dead check. So any other path putting a dead id on a roster
would still feed succession a dead candidate. This arm closes that
remaining hole at the consumer, not at another entry gate.

## Pre-prereg reproduction (disclosed, not a judged sim)

Before this prereg was written, a one-off harness repro (seed 42,
/tmp script, not a judged run) confirmed the hole on current code:
a non-bearer roster id X, killed via removeVillager('killed')
(deadMarked(X) = true, dropped from roster), then pushed back
onto the roster to simulate "any other path" — npcIds() returned
X again. Succession sorts that list by trust, so a dead id with
the top trust entry would be chosen first. The repro is the
mechanism proof; the pilot baseline below is the live-sim check
for whether any pilot seed actually puts a dead id on a roster
via another path on current code.

## The 97331 chain — what reproduces and what does not

The deadid 97331 chain (Jovan Milic killed d40, drawn d41, walked
d43, bearer-after-death d55-58) does NOT reproduce as a live chain
on current code, and must not be claimed as reproduced: the entry
gates landed in d7fa67ee6 already kill it at the draw. That is the
prior arm working, not a failure of this arm. This arm's live
question is narrower: on current code, does ANY pilot seed put a
dead id on the roster through some other path, so that baseline
npcIds() returns it? The pilot baseline answers that; if the
answer is zero on all 8 seeds, the pilot is a no-harm /
no-living-flow-loss check and the harness injection cases are the
judged primary (they prove the filter for the corrupt-roster
state it exists for). No seed chain is claimed as reproduced
unless the pilot baseline actually shows it.

## Scope — exactly ONE, named here (never bundled)

1. npcIds() (betrayal.js): filter out deadMarked ids, using
   Game.deadMarked when available with an inline triple-source
   fallback (villagers record, background_survivors record,
   vpOf().dead) so the filter does not depend on method load
   order or on a partial harness. The villagerId exclusion is
   unchanged. No other npcIds() caller is edited; callers
   (gossip hearers, voters, succession candidates) all inherit
   the filter, which is the point — a dead id must not vote,
   witness, or inherit either.
2. Nothing else in src/js. No narration line is added (a filtered
   id is simply not returned; there is no event to narrate, and
   the arrival-refusal line from deadid already covers the
   walk-in case).

Explicitly NOT in this arm: debate-notices-death, the live-sim
refusal transcript bundle, genApplicant, arrivalTick, trust
rules, removeVillager marking, ensureRosterPerson hydration.
No won/table/national flag from any measurement substrate is
cited as reach (per the task instruction and the laircontact
precedent: substrate flags are not reach evidence).

## Code hypothesis (read BEFORE any judged sim)

- A dead id on the roster is invisible to npcIds() after the
  fix, on all three death-record sources, while every living
  roster id is still returned in the same order.
- When no dead id is on the roster, npcIds() output is
  byte-identical, so clean-roster sim trajectories are
  byte-identical too (contrast with the deadid pool filter:
  filtering a pool changes pick() indices; filtering npcIds()
  changes nothing unless a dead id is actually present, and
  the only callers that index into the list then operate on a
  clean list).
- Rival hypothesis to be killed by the proof test: deadMarked
  is unavailable or disagrees with the triple check in some
  harness state, so npcIds() still returns a dead id through
  one source. The proof test covers each source separately;
  any surviving source is NO-GO and is reported, not papered.

## Primary metric (pre-registered, binds this arm)

Harness injection cases (scripts/test-npcdeadfilter-a.js, live
harness, seed 42 unless stated), judged post-fix:

P1. npcIds() excludes a dead-marked id placed on the roster —
    separately for each death-record source: (a) real
    removeVillager('killed') path (triple-visible mark),
    (b) villagers-record-only dead mark, (c) bg-record-only
    dead mark, (d) vpOf-only dead mark (if constructible in
    harness; otherwise reported as untestable, not assumed).
P2. Succession candidate list excludes the dead id: the
    ledger-ordered candidate list (npcIds() sorted by trust,
    as ledger.js does) never has a dead id first, even when
    the dead id holds the top trust entry; and a driven
    playerDeath with a dead top-trust id on the roster does
    not make that id bearer (if playerDeath proves
    undrivable in harness, P2 falls back to the sorted-list
    form and the fallback is disclosed, not hidden).
P3. Living guardrail: with no dead id on the roster, npcIds()
    returns exactly the pre-fix list (same ids, same order),
    and a living roster id is never filtered.

## GO threshold (pre-registered, strict)

BUILD-GO ONLY if ALL hold:

- P1 (a)-(c) and P3 hold post-fix; P1 (d) holds or is
  disclosed-untestable with a reason (vpOf-only marks are
  the hydration case deadid already covers via deadMarked).
- P2 holds in at least the sorted-list form, and in the
  driven-playerDeath form if drivable.
- Proof test is RED pre-fix on the P1/P2 cases and GREEN
  post-fix (the RED run happens before the fix is written,
  on this same code).
- Pilot guardrails G1-G4 all hold (below).
- No confirm spend is automatic on pilot GO: the pilot
  verdict is reported and the coordinator decides on a
  12-16 seed confirm.

A miss on any item is NO-GO, never re-scored against a
friendlier metric mid-run. Metric doubts go under "metric
review" for the NEXT run. Byte-identity of before/after
trajectories is NOT demanded on any seed where the baseline
returns a dead id from npcIds() — any correct membership
filter changes downstream picks once a dead id is removed
(the deadid pool-index lesson, applied here to slice/index
callers of npcIds()).

## Guardrails (pilot band, before/after on identical seeds)

G1. NO LIVING-FLOW LOSS. Per seed, post-fix applications and
    walked arrivals are not below baseline, and succession
    events (playerDeath bearer changes) are not fewer, EXCEPT
    on a seed where baseline npcIds() returned a dead id
    (there, divergence is the fix working, and the seed is
    reported as such, not counted as loss). Band totals for
    applications and walked arrivals are not below baseline
    on the same exemption.
G2. DET-GATE (corrected form, per deadid metric review).
    Divergence in death days/names, endReason, survival
    days, or application/arrival counts is allowed ONLY on
    a seed where the baseline driver recorded a dead id
    returned by npcIds() (or a dead id on the roster), and
    only on/after the first day such a dead return occurs.
    Every other seed must be byte-identical on those fields.
G3. ZERO DEAD RETURNS POST-FIX. The pilot driver traps
    npcIds() returns: post-fix, zero dead ids are returned
    by npcIds() on any pilot seed, and zero dead succession
    candidates occur at any playerDeath.
G4. NO NEW ERROR CLASS. Driver errors lists empty on both
    sides, all 16 pilot runs.

## Horizon, seeds, policies (pre-registered)

- Horizon: 180d cap, death-aware (run ends early on
  village-lost / win as the harness reports) — same as
  deadid, so the bands are comparable. Why 180d: the deadid
  Jovan chain played out by d58 and the band's villages
  resolve well inside 180d; a longer horizon adds no new
  intake/succession signal for this filter.
- Seeds (pilot, 8): 97330, 97331, 97332, 97333, 97334, 97335,
  97336, 97338 — the deadid pilot band, unchanged, so
  baseline behavior is comparable to the prior arm.
- Policies (closecommit stack, verbatim from deadid):
  tribfloor leadfeast + windefer + seatdrive + fullseat-diag
  + titanroute + musterclose + mustergap commit-own, with
  env FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
  SEATDRIVE=1 FULLSEAT=1 HERALD=1. Driver:
  scripts/npcdeadfilter-driver-20261102.js (deadid driver
  plus an npcIds() return trap and a succession-candidate
  trap; new per-seed dir perseed-npcdeadfilter-a, so the
  deadid judged files are not overwritten).
- Panel: no panel compare is attached, for the stated
  reason carried from deadid/laircontact — balance-panel.js
  runs its own registry policies and cannot express the
  closecommit stack, so it cannot judge this filter; the
  sweep driver + proof test are the judged instruments.
  If the coordinator wants a panel guardrail, that is a
  separate run, not a re-score of this verdict.

## Canon

docs/CANON.md read first. No canon doc covers npcIds(),
succession ordering, or membership intake specifically
(MONSTER-WAVES.md covers wave law, not membership). The
rules above are code-read from src/js/betrayal.js,
src/js/ledger.js, and src/js/membership.js, not invented
canon. The "no silent actions" standing rule needs no new
line here: filtering a return list narrates nothing, and
no event is dropped silently (a dead id was never a
legitimate voter, witness, or heir).
