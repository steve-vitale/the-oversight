# sim-rosterreturn-a — dead-villager roster return: mechanism isolated (Loop A 20261102)

Arm: sim-rosterreturn-a, Loop A run fleshout-loop-a-20261102T1424Z,
axis scale-onramp. Follow-up to sim-bearerorder-a's instrument
observation. DIAGNOSIS ONLY — zero src/js changes, zero
policy-decision changes (the bearerorder closecommit stack reused
verbatim). Ready for coordinator merge, pending ship (NOT pushed, NOT
bumped, NOT live-verified — ship loop owns deploys). No [needs-eyes]:
diagnosis only, no feel/combat/UI change.

## Verdict: DIAG-GO

The pre-registered GO threshold is MET: the return mechanism is named
from code (function + file + trigger condition) AND the return event
is traced to that path with a named cause at every step — a log line,
a code hook, and a before/after roster snapshot pair tied to the
trigger. Proof test: scripts/test-rosterreturn-a.js, 29/29 green.
Prereg: evidence/2026-11-02/sim-rosterreturn-a-prereg.md, written and
committed BEFORE any judged sim in this arm.

## The mechanism, in one sentence

A dead villager is re-drawn from the applicant pool because the
applicant generator never excludes the dead — then the village
auto-accepts her (thin roster), and arrival re-appends her own old id
to the roster, trust intact, death flag still set — so she stands for
the mantle as a dead-flagged non-member, because succession candidates
come from the roster with no dead check.

## The mechanism, step by step (all traced, seed 97330)

1. Death (d106) — src/js/ledger.js playerDeath calls
   src/js/betrayal.js removeVillager('nora_wilson', 'killed'):
   roster drops her (index 1 -> absent), trust entry SURVIVES (90),
   and the DEAD-IS-DEAD mark sets rec.dead = true on her
   data.villagers / background_survivors record (betrayal.js
   ~1158-1170). Trap record d106: before {onRoster true, trust 90,
   vpDead false, isMember true} -> after {onRoster false, trust 90,
   vpDead true, isMember false}.
2. Re-application (d109) — src/js/membership.js considerApplications
   -> genApplicant() draws her from src/data/background_survivors
   (she is entry nora_wilson there). The generator's `used` set is
   built from the CURRENT roster + pending applications only — the
   dead and the fallen are never excluded (verified by code read;
   the function body contains no dead/fallen check). Same day,
   villageAutoRecruit (roster 5 < 8, thin-village rule) auto-accepts
   her: arrivals entry {id nora_wilson, charId nora_wilson,
   arriveDay 111}.
3. Arrival (d111 endDay) — src/js/membership.js arrivalTick, line
   612: `if (v.roster.indexOf(nid) < 0) v.roster.push(nid)` appends
   her id LAST (rosterIndex 5). The trust guard `if (t[nid] == null)
   t[nid] = 20` does NOT fire — her trust entry survived her death
   (90) — and ensureRosterPerson returns her existing
   data.villagers record WITHOUT clearing dead (game.js:1609-1630
   early-returns on an existing record). Trap record at the push:
   {trust 90, vpDead true, isMember false}.
4. Candidacy (d112) — src/js/betrayal.js npcIds() returns the roster
   minus the bearer, with NO dead filter, so the dead-flagged id is a
   succession candidate. isMember() (membership.js:114) returns false
   for her (vpOf().dead) — the engine's own membership rule knows she
   is dead, but succession never asks it. She wins by sort-time trust
   (91 vs Omar 90, per bearerorder) and rules as bearer with vpDead
   still true (d112 snapshot: bearer nora_wilson, trust 74
   post-inheritance-reset, vpDead true, isMember false), then falls
   d122 like anyone else.

Timing note (snapshot labels vs the event): the push happens d111
endDay (membershipDaily inside endDay); the d111 daily snapshot is
taken before that endDay pass, so the return first APPEARS in the
d112 snapshot. Bearerorder's "returns d112" is the snapshot day; the
push day is d111. Both descriptions describe the same event.

## What was ruled out (traced, not guessed)

- Visitor invite (betrayal.js:3375): mints a fresh `visjoin_` id —
  cannot reuse nora_wilson.
- Petitioner admission (villageAgency.js:916): mints fresh `ptn_`
  ids — cannot reuse her id.
- Loaned/away-party returns (membership.js loanedReturnTick,
  awayPartiesReturnTick): they announce returns but never touch the
  roster, and both now death-check before announcing.
- Roster rebuild / villageEats restore (membership.js:1026-1039):
  the meal wrap re-appends WITHHELD non-members after every meal —
  which is why post-return snapshots keep showing her appended last
  (d112 assign trap via villageEats) — but it can only restore ids
  that were on the roster when the meal began, so it maintains the
  return, it does not cause it. (Pre-return, she was absent from the
  roster at every meal, so no meal could have restored her.)
- Phoenix clause (betrayal.js removeVillager head): would have kept
  her on the roster at death; the d106 trap shows a real removal
  with vpDead set, so phoenix did not fire.
- Titan muster paths (titans.js): titanHavenBlades / reconcile only
  FILTER the haven list by roster membership; nothing there pushes
  to the roster.

## Per-seed numbers (judged runs, 180d horizon, closecommit stack)

- 97330 (mandatory): death chain reproduces bearerorder EXACTLY
  (10 deaths, same days and names — the instrument did not move
  outcomes). Exactly ONE roster reappearance in the whole run:
  nora_wilson, gone ~d106, back d112 snapshot (push d111). No other
  id reappears. Village-lost d122.
- 97338 (second seed): death chain reproduces bearerorder (incl.
  d115/d117 muster events). ZERO roster reappearances of any id.
  The mechanism needs a dead background-survivor to be re-drawn,
  which is a chance event (70% pool branch, thin-roster auto-accept);
  97338 simply never drew one. Per the prereg, 97338 is a generality
  check, not a GO requirement — the claim is bounded by 97330, and
  the live-harness half of the proof test shows the loop closes for
  ANY id, not just Nora's.

## Answers to the secondary questions (plainly)

1. Does this affect the bearerorder verdict? NO. At choice time Nora
   was a legitimate roster candidate BY THE ENGINE'S OWN LIST:
   npcIds() included her, the ledger sorted her, she won on
   sort-time trust. The ordering rule (highest sort-time trust,
   roster-order ties, commitment never consulted) stands exactly as
   bearerorder proved it. What changes is the interpretation of one
   input: the roster fed to that rule can contain a dead-flagged
   villager, so "highest-trust roster candidate" can mean "a dead
   villager the village re-invited without noticing."
2. Should anyone build on roster membership as "alive" before this
   is closed? NO. Roster membership is not aliveness: a roster id
   can carry vpOf().dead = true (this arm proves it in a judged run
   and in a live harness). Any future work that treats "on the
   roster" as "alive" — succession, parties, census, muster counts —
   must check vpOf().dead (or isMember(), which already does) until
   the re-application hole is closed. The hole itself is small and
   nameable: genApplicant's `used` set must exclude dead/fallen ids
   (and/or arrivalTick must refuse a dead-flagged charId) — a
   Steve-call-sized fix, NOT made here (diagnosis only).
3. Sense check (transcript d106-d112): the return IS narrated — it
   is not silent. d109: "📨 Word came: Nora Wilson of Stonebridge
   wants to join Haven. 'My village is gone. Yours isn't.'" / debate
   / "📨 The village didn't wait for you. Nora Wilson was vouched
   for around the fire — they're walking." / "Accepted. Nora Wilson
   is walking." d111: "🚶 Nora Wilson walks in — pack light, eyes
   wide. Haven grows by one. (6 souls.)" What NO line ever says is
   that this is the same Nora who died d106 — the village treats its
   own dead tailor as a newcomer from Stonebridge, five days after
   burying her ("That night, they bring Nora home... the grave is
   dug by the fire," d107). The fiction gap is identity-blindness,
   not silence: the application, debate, and walk-in all read
   sensibly for a stranger, and all read wrong for a woman the
   village just buried.

## Metric review (for the NEXT run, not this verdict)

- Daily-snapshot day labels lag endDay events by one snapshot: a
  return pushed in d111's endDay first appears in the d112 snapshot.
  Future roster instruments should timestamp pushes by trap day,
  not snapshot day, or the "return day" will read one day late.
- Bearerorder's "no 'walks in' line was captured" is explained, not
  contradicted: that driver's saved fields (event transcripts use a
  mantle-only regex; commit lines use a commit-only regex) filtered
  walk-in lines OUT, and the full say log was never persisted. This
  arm's driver persists walk-in/application lines explicitly. Do not
  cite the old file's silence as evidence of a silent return.
- The d112 snapshot trust (74) vs the d112 sort-time trust (91):
  the snapshot is post-pass (inheritance reset), the choice used
  pre-pass sort-time trust. Same distinction bearerorder's metric
  review flagged; it holds here too.

## Canon

docs/CANON.md read first. No canon doc covers titan musters, the
Herald, or bearer succession ordering (bearerorder arm established
this; MONSTER-WAVES.md covers wave law, not muster accounting,
succession, or re-application). Nothing here invents canon for them.
The mechanism above is code-read (betrayal.js, ledger.js,
membership.js, game.js ensureRosterPerson, conversation.js vpOf) plus
judged sim traces, not invented canon.

## Files committed (this arm)

- scripts/rosterreturn-driver-20261102.js — return instrument
  (closecommit stack reused verbatim; driver-side reads + wrappers
  + a roster setter/push trap that logs only target-entry events)
- scripts/test-rosterreturn-a.js — proof test, 29/29 green (live
  harness loop-closure + driver-JSON analysis + code-property reads)
- evidence/2026-11-02/sim-rosterreturn-a-prereg.md (pre-sim prereg)
- evidence/2026-11-02/sim-rosterreturn-a.md (this file)
- evidence/2026-11-02/perseed-rosterreturn-a/rr-s97330-r1.json
  (10 deaths, trap chain d106/d109/d111, daily snapshots, say lines)
- evidence/2026-11-02/perseed-rosterreturn-a/rr-s97338-r1.json
  (10 deaths, zero reappearances)

## Village assessment (plain words)

The village buried its tailor on day 106 and, five days later, took
her application seriously, debated her, vouched for her around the
fire, and welcomed her home as a stranger from Stonebridge — because
nobody in the application office checks whether the applicant is
already dead. She walked back in with her old trust, her old name,
and her death still marked on her record, and the village — which
picks its leaders by trust alone — handed her the mantle again. The
village is not haunted. It is forgetful in exactly one place: the
list of people allowed to apply does not cross out the dead.
