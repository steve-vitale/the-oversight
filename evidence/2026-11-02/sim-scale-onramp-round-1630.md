# Loop A 1630Z coordinator evidence — scale-onramp round (run fleshout-loop-a-20261102T1630Z)

## Pre-registration (this round)

- Axis: scale-onramp (topmost non-converged axis; sibling Loop B live on
  food-economy throughout — B claim fleshout-loop-b-20261102T153648Z at run
  start, B 1536Z coordinator evidence merged mid-run; NOT touched).
- Arms (claim written before any sims, retired at closeout):
  - sim-heralddepart-a (DIAG): herald world-list departure audit.
  - sim-npcdeadfilter-a (BUILD): npcIds() dead filter, dead-id follow-up (i).
- Standing directive still applies: scale-onramp is the blocking axis;
  rotation file reads 3 but the rotation is suspended by the directive.
- Wall numbers this round (both corpora are measurement/diagnosis
  substrates, not reach claims): national 0 / table 0 / wins 0,
  wave-5 unlocks 0, full seat 0. Scale wall picture unchanged.

## Arm sim-heralddepart-a — DIAG-GO

Verdict: DIAG-GO. The herald does not "leave". It loses sight of you and
despawns. When the herald shares the scholar's tile but cannot SEE the
scholar (or any villager target) through the detail grid — trees, walls,
tents block the Bresenham sight line — each monsterTurn increments its
`lostSight` and drifts it randomly. At `lostSight > 6` (7 unseen turns)
monsterTurn removes it from worldMonsters with the line "You hold still
behind cover. After a while, the sounds fade. It lost your trail." Tile
co-location is not perception. The muster still stands and no titan
outcome is recorded for the departure. The lost-sight clock only ticks on
the scholar's tile (monsterTurn early-returns elsewhere), which is why
heralds wandering other tiles persist for weeks while a same-tile-unseen
herald vanishes in ~7 turns.

Classification (corpus 11 r1 runs; 140 missed-bump days, coverage 1.00):
- HEROLD-LEFT 63 — removal mechanisms LOST-SIGHT 62, FIGHT-START 1.
- NEVER-ARRIVED 68 — herald present, different tile at day-end.
- DETAIL-DIFFERED 9 — same tile, different detail cell: 4 spiral days
  (every monster-turn seeScholar False, lostSight climbing, each followed
  by a lost-sight removal within 1–2 days) vs 5 approach days (sight True,
  stance advancing curious→hungry, each followed by a bump day).
- MATCHED-NO-BUMP 0, UNKNOWN-removal 0.
The one FIGHT-START departure (97418, gate 15) is not a vanishing:
startCombat pulls the monster into the fight and its titan outcome record
resolves the same day to 'slain'.

Prereg judgment (binding, both legs pass): coverage 1.00 ≥ 0.95, and all
three known departure cases reproduce with a named mechanism — 97400
closecommit d69, 97338 musterfed d87, 97338 lairnoise d85, each removal at
`lostSight` 7 with the lost-trail line next. Proof test 10/10 green.

Seeds / horizon / policies: 180 days, death-aware; env
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1
HERALD=1; closecommit stack (titanroute + musterclose + mustergap) plus
musterfed/lairnoise legs. Corpus: departure cases 97400 closecommit,
97338 musterfed, 97338 lairnoise; band closecommit 97405, 97420, 97432,
97433, 97435, 97412, 97418, 97426 (band reuse disclosed: laircontact-a's
band, re-run under the new instrument, not re-cited).

Deviation (code-version fact, not a re-score): on current code, band seeds
97405, 97412, 97432 no longer call at all. Proven code movement, not
instrument artifact: the old laircontact driver on current code gives
97405 exactly the new driver's result (no call, gameDays 103, over-other).
The planned stay-case contrast (97405) evaporated; the contrast now rests
on in-corpus stayers 97426 (24 NEVER-ARRIVED days) and 97435 (17
NEVER-ARRIVED + 1 DETAIL-DIFFERED). No won/table/national flags cited.

Commits (zero src/js): prereg b32109c28, results 8c55ba39b (after clean
rebase onto moving master; proof 10/10 re-green on rebased tip).

## Arm sim-npcdeadfilter-a — PILOT GO, confirm owed (coordinator decision below)

Verdict: PILOT GO. `npcIds()` in src/js/betrayal.js (+27/−1) now excludes
dead-marked ids, using `deadMarked()` when available with the identical
triple-source check inline as fallback (data.villagers record,
background_survivors record, vpOf/rosterChars — all three, per the deadid
evidence). The villagerId exclusion is unchanged, no RNG is consumed, and
on a clean roster output is byte-identical. Every caller inherits it:
succession candidates, voters, gossip hearers. Scope (i) only — no
debate-notices-death, no refusal-transcript bundle, no genApplicant change,
no new narration, no [needs-eyes] (pure membership filter).

Proof test (scripts/test-npcdeadfilter-a.js, live harness, seed 42): RED
pre-fix (7 passed, 7 failed), GREEN post-fix (14 passed, 0 failed, 0
skipped). Covers killed-and-pushed-back id, villagers-record-only,
bg-record-only, and vpOf-only dead marks (all excluded post-fix), plus
driven succession — pre-fix a dead top-trust (90) id on the roster was
chosen bearer by playerDeath; post-fix the candidate list contains no dead
id and a living villager becomes bearer. Clean-roster guardrail: npcIds()
equals roster-minus-bearer in order throughout.

Pilot band, 8 seeds, 180d death-aware cap, closecommit stack (env as above):
97330–97336, 97338. Baseline and post-fix are BYTE-IDENTICAL on all 8
seeds. Band totals both sides: applications 43, walked 19, refused 0, dead
draws 0, dead walk-ins 0, reappearances 0, bearer-after-death 0, npcIds
dead returns 0, dead succession candidates 0, driver errors none. All four
prereg guardrails pass. Neighbouring proofs on rebased tip: deadid 23/0/1,
rosterreturn 29/29 (two assertions flipped on purpose to pin the REFUSAL —
documented A-FLIP-2), membership 43/43. Three membership test files crash
identically with betrayal.js reverted to HEAD — pre-existing, same profile
the deadid arm recorded, not this arm's. check.js --quick was killed by a
150s timeout mid-run under sibling load — NOT green, NOT failed, NOT
claimed.

Caveat carried: the pilot is a no-harm check, not a wild demonstration. On
current code the deadid entry gates already hold, so no pilot seed puts a
dead id on the roster through any other path (zero dead returns baseline
too). The filter is proven where it can be: harness injection of exactly
the corrupt-roster state it exists for. The 97331 Jovan chain does NOT
reproduce as a live chain on current code (entry gates kill it) and is not
claimed as reproduced.

Commits: prereg a4916be07, fix cc370f832, evidence c891a7029 (after clean
rebase onto moving master; proofs re-green on rebased tip: npcdeadfilter
14/14, rosterreturn 29/29, deadid 23/0/1, membership 43/43).

### Coordinator decision: confirm DEFERRED, not killed, scoped

The worker recommended a confirm, but as a no-harm band, noting a
clean-seed confirm will most likely just reproduce the same byte-identical
no-op. Spending 12–16 clean seeds buys no new information. Confirm is owed
with this scope: a CORRUPT-ROSTER band (at least one seed with a dead id
injected onto the roster through a non-entry-gate path, or a constructed
corrupt-roster substrate) plus a longer horizon, under its own prereg.
That substrate does not exist yet; building it is a new arm, not a re-run
of this pilot. Recorded here so the next run picks it up instead of
re-spending a clean band.

## Plain-words village assessment

Two scale-onramp absurdities closed this round. First, the titan herald no
longer vanishes mysteriously: when it shares your tile but cannot see
anyone through trees, walls, or tents for seven turns, it gives up the
trail and walks out of the world — while the village muster it was called
for still stands, unpaid and unfought. That is the mechanism behind the
"herald left the day after we stood together" sightings. Second, the list
the village uses to pick its next leader is now checked for dead names, so
the village always picks a living leader no matter how a dead name got on
the list; on the simulated seeds no dead name ever reached the list, so
daily village life is day-for-day identical. Neither change moves the wall
numbers — national, table, and wins stay at zero, wave 5 still unfought in
normal play — but the on-ramp no longer contains a vanishing titan or a
dead leader, which are the kinds of absurdities that made the wall
unreadable.

## Metric review

- Heralddepart: prereg held; no re-score. The stay-case contrast seed
  (97405) evaporating to code movement is recorded as a deviation, not a
  metric change; in-corpus stayers carried the contrast instead.
- Npcdeadfilter: prereg held; the deadid byte-identity lesson was honored
  (byte-identity was NOT demanded — and indeed the pilot came out
  byte-identical anyway, because no dead id reached the roster). The
  pilot's no-op character is a property of the current entry gates, not a
  metric failure; the confirm scope above follows from it.
- Panel compare: no §15 panel compare attached for either arm. Heralddepart
  is diagnosis (driver records, not panel-ingestible); npcdeadfilter's
  pilot is byte-identical, so a panel compare would be descriptive-only.
  The standing panel/driver substrate divergence items in the backlog are
  untouched by this round.

## Infrastructure

- Master moved under this run three ways from sibling lanes (Loop B 1536Z
  coordinator evidence 20bb82e0d, journey-deepening r86 8471c5da3, plus the
  reopen120 base already in the branches) — zero file overlap with either
  arm. Both branches cleanly rebased onto current master; proofs re-green
  on rebased tips; merges --ff-only only after `git branch --merged
  master` verification. No safe-commit index clobber on the coordinator
  commit path this round (workers hit it and repaired per the recorded
  recipe; commits verified correct). No EPERM flap observed by this run.
- check.js --quick NOT re-run by coordinator (npcdeadfilter arm: one
  minimal src/js file, proof suites green on merged master; heralddepart
  arm: zero src/js; standing pre-existing profile recorded by sibling
  runs). Origin/master ancestor check: see closeout note below.

## Next blanks, in order

1. Npcdeadfilter confirm, scoped as above (corrupt-roster band + longer
   horizon, own prereg) — owed, not killed.
2. Herald-departure telegraph + design question (Steve-call territory if
   it touches feel): should seven unseen same-tile turns silently delete a
   titan the village mustered for? Candidates to measure, not assume:
   (a) telegraph the spiral (a line at lostSight 1–3), (b) exempt titans
   from lost-sight removal, (c) let a standing muster hold the titan. Any
   game-code change needs its own prereg + panel treatment.
3. Dead-id follow-ups remaining: (ii) live-sim transcript of the
   accepted-before-death refusal line (proven in harness only — no pilot
   sim produced it, gate 1 fires first); (iii) whether debate should
   notice a pending applicant's death (design question, (b)-adjacent).
4. Fight-outcome recorder (tbOutcomes into per-seed outputs) before any
   "herald chain reachable end-to-end" claim — still owed; the one
   FIGHT-START slay this round (97418) was recorded by the departure
   instrument, not a standing recorder.
5. STEVE-CALL (unchanged): committed blade as bearer (options a–d).
6. Stores-draw upkeep proposal (Steve-call, unchanged).

Merged locally, pending ship (npcdeadfilter BUILD pilot-GO + heralddepart
DIAG-GO). No push, no version bump — the batch ship job owns deploys.
