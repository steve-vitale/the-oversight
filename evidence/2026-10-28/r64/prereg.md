# Journey social r64 — PRE-REGISTER (lane B, 2026-10-28)

Written before any r64 seed ran. Leg 5 (social life), cycle r64.
Rotation-b read 5 at run start. This run ADVANCES rotation-b to 6
at closeout: leg 5's named-next question after r63 is the WILD
OUTING SCORING run (see below). (Rotation note: r63 advanced
5 -> 6 at its closeout, but the file reads 5 again at this run's
start — the same clobber class as r59/r60/r61/r62/r63. The file
is the authority, and leg 5 carries the named-next question, so
this run plays social again and writes 6 itself at closeout.)

## Follows

- r63 (lane B, 2026-10-28, merged locally pending ship): WILD
  INVITATION SCORING GO — pooled dry-family 0.282/convo, end-on-dry
  0.0%, lure CHARACTER-DECIDES-IN-WILD (16 decisions, 37.5%, 5
  plots), full party census 64 decisions / 54.7%, cold open 0.06%.
  r63's metric review named the social leg's next question as the
  residual dry9 burden OR the player-side accept half, whichever the
  tackle-all coordinator had not already taken. Tackle-outing has
  since taken joint foraging as a BUILD (below), so this run scores
  that build in the wild — the same pattern r63 applied to
  tackle-invite. The residual dry9 burden stays open for a later
  social run; it is not this run's question.
- tackle-outing (7f0e1dc41, in master): playable joint-foraging
  outing — a promised forage_help favour goes start (dawn, Haven,
  next to the partner) -> forage together (one solo-rule press,
  edible haul split about half and half) -> trail talk -> deliver
  both shares at Haven -> favour fulfilled, promise kept. Its proof
  (scripts/test-joint-outing-20261027.js) used PINNED fixtures on
  seeds 42 and 7, never natural runs. Its bars doc is
  evidence/2026-10-27/tackle-outing-bars.md (B1-B6).
- docs/CONVERSATIONS.md still says joint foraging "remains
  unavailable" — STALE canon: it predates tackle-outing. The code
  (src/js/favor-forage.js, in master, wired in index.html) is the
  authority for this run; the canon doc's staleness is reported as
  a documentation blank, not re-litigated as a game finding.
  src/js/convo-wants.js routes forage_help to forageFavorAction
  when present; its "unavailable" line is only the fallback when
  the action is absent.

## Leg questions

- (Q1) WILD OUTING SCORING: in natural full runs, does the playable
  joint-foraging outing actually happen end to end — forage_help
  requests offered -> accepted -> dawn-met -> departed -> foraged
  together -> talked on the trail -> delivered -> kept? Where does
  the funnel thin out, and what blocks it at each stage?
- (Q2) DRY REPLICATION: does r63's dry census hold on fresh seeds
  (same driver definition, same bars)?
- (Q3) COLD OPEN vs r62 baseline 0.56% (r63: 0.06%).
- (Q4) PEOPLE: do the outing-adjacent transcripts read like
  people — the ask, the accept, the departure, the shared forage
  line, the trail talk, the delivery? 0 fabricated-history flags,
  weak endings <= 1?

## Arms (fresh seeds 5901-5904, smoke 5905 30d, DAYCAP=140, death-aware)

ALL linger, seeded-speaker steering ON (constant, excluded from
the natural funnel, as r56-r63). Policy is r63's verbatim EXCEPT
three declared, driver-only additions (zero src/js) and one
declared removal:

(a) FAVOR-ACCEPT PICK (driveOne): at each conversation turn, BEFORE
gossip/ans/linger/steer, if the current want is ask_favor with
kind forage_help and dlg:commit is offered, pick it and tag the
convo favorAcceptPick. Acceptance is verified by post-turn state
(favorLedger state asked -> promised + promises[vid].favorId match),
not by the pick alone; a refused commit (same-villager open promise)
is recorded as accept:false with the live reason. Offers are
recorded once per favor id (want seen in any turn of any convo).
Other favor kinds are recorded as offers but NEVER committed by
this driver: dlg:commit is skipped in fallback picks while a
non-forage favor want is active, so one villager's other promise
cannot silently block their later forage commit. Non-favor wants
keep the old fallback behavior (their dlg:commit creates no
promise). dlg:favor_action / dlg:favor_requirements /
dlg:favor_cancel / dlg:forage_talk are NEVER picked by socialConvo
fallbacks — outing play belongs to the wedge (c), with full
recording, not to accidental fallback picks.

(b) DAWN START WEDGE (pol.upkeep, dayPart 0 only, once per day):
for each promised forage_help favour whose promise is unkept and
whose outing has not started, read forageFavorAction (pure status
read). If ready (forage_start), perform through the public favour
path (convoPerformFavor) and record the line. If blocked on the
Haven-door side, cross the door once toward the partner's side
(exitBuilding/enterBuilding) and re-read before performing.
Any other block is recorded with the game's own reason, no retry.
Upkeep wraps competent's upkeep (base.upkeep runs first); the
wedge never replaces it.

(c) OUTING-DAY WEDGE (pol.daily, BEFORE base.daily, at most one
outing advanced per day, earliest-deadline live outing first):
if an outing is live (forageRun, not returned, bearer is the
player): if at Haven with haul > 0, deliver (status read, then
convoPerformFavor). Otherwise run the forage leg — scan
travelTargets from home for an unblocked forageable tile (first
match, no driver RNG), travelTo there (the party wrapper places
the partner beside the player, as in real play), status read,
forage together (convoPerformFavor) if ready, trail talk once
(performForageTalk) if ready, travel home in hops (unblocked
targets reducing distance to home, bounded), status read,
deliver if ready. Every step records its status/line or its
blocking reason (including mid-combat refusal — the wedge never
travels mid-fight). The wedge uses only public game verbs
(travelTo, convoPerformFavor, performForageTalk, door verbs);
any RNG consumed is the game's own (travel placement, forage
sweep), never driver-side Math.random for a decision.

(d) INVITE WRAP KEPT (r63 verbatim, recording only, descriptive
census, no bars): every npcInviteDecision call is recorded.
(e) PARTY PROBE REMOVED (declared): r63's once-a-day probe pick
is gone — r64's pick delta is the favor accept, and the probe
would compete with it for the same after-gossip pick slot. The
full party census (wrap) is unaffected.

No other policy change. The player-side accept/decline of NPC
invitations is still NOT measured (driver never picks
betrayal:accept) — that half stays open, as in r63.

## Bindings (a miss is NO-GO, never re-scored)

- F1 dry-family < 1.0/convo pooled (r63: 0.282). A miss is a
  REPLICATION FAILURE, not a game regression — this run changes
  zero src/js.
- F2 end-on-dry < 20% pooled (r63: 0.0%). Both bars must pass
  for a dry REPLICATION GO.
- M5 people: 5 sense-reads, 0 fabricated-history flags, weak
  <= 1 (r63's floor), >= 2 dry-bearing or cold-open OR
  outing-adjacent reads. At least 1 of the 5 must be an
  outing-adjacent read (ask, accept, start, forage, talk, or
  deliver material) when such material exists; if no outing
  material exists on any seed, M5 falls back to r63's composition
  and the shortfall is reported as an instrument/coverage finding,
  not a people failure.
- OUTING (report-only + interesting-finding rules, no bar):
  the funnel is counted at every stage (offers, accepts, dawn
  waits, starts, forage presses, talks, delivers, kept / broken /
  expired end states, with blocking reasons pooled).
  - >= 1 complete outing (start -> >= 1 forage press -> deliver
    -> kept, partner share > 0, player share > 0, pantry gain =
    delivered total) => OUTING-PLAYS-IN-WILD.
  - 0 complete outings with >= 3 accepts => WART (accepts do not
    convert; the blocking stage is named, not averaged away).
  - < 3 accepts => INSUFFICIENT DATA for a conversion rate
    (accept sparsity is the finding).
  - 0 offers on all 4 seeds => NO-OFFER finding (the request
    never fires in natural play; the outing is playable but
    unreachable content — the blank, named as such).
- COLD: cold-open rate reported per seed + pooled vs r62's
  0.56%; >= 10% => wart (r62's rule, carried). No new bar.
- D1/D2 census completeness (r63's bars, carried): dry census +
  mechanism split + favor census + outing census reported for
  all 4 seeds; a seed with zero instrumented conversations
  fails D1.
- G guardrails (report-only, not bars): no-offer rate, late
  picks, deep2 pairs, villages alive — reported against r63
  (9.8%, 413, 84, 7/7/5/6).
- NO-REGRESSION: check.js --quick at the CURRENT base profile
  (r63's profile was 276/14; if the base moved, the actual
  profile is recorded and any NEW failure vs that profile fails
  the run — r63's list is not assumed current). r64 changes
  zero src/js, so no check failure is attributable to r64 by
  construction; EPERM-flap artifacts are classified as infra,
  as in r63.
- Bars explicitly NOT adopted: any outing conversion-rate
  threshold (first wild measurement); any cold-open threshold
  other than r62's carried 10% wart rule; any dry threshold
  other than 1.0 / 20%.

## Interesting-finding rule (pre-registered)

- Dry replication GO (F1+F2 pass) AND outing
  OUTING-PLAYS-IN-WILD => the joint-foraging outing joins dry
  and invitations as scored-in-the-wild; the social leg's next
  question becomes the residual dry9 burden (r63's named-next,
  still open).
- Dry replication GO but outing WART => the pinned-fixture win
  does not transfer; the next run must find why at the named
  blocking stage (dawn meeting, door side, travel target,
  adjacency, patch, or delivery).
- Dry replication GO but outing INSUFFICIENT DATA / NO-OFFER =>
  the wild outing question stays open; the next run needs a
  denser favor instrument (more talks/day, or a favor-seeking
  steer), not a lower bar.
- Dry replication FAIL => B7's wild hold is seed-fragile; the
  next run must find why before any new social question.

## Metric review (§14 — mandatory section in the evidence file)

Pre-registered metrics bind the run — a miss is NO-GO, never
re-scored against a friendlier metric mid-run. Metric doubts
go here for the NEXT run. In particular: r63's numbers are a
share-level baseline only (fresh seeds); no matched-seed or
turn-identity claim is made; outing rates are first wild
measurements with no baseline bars by design; the favor-accept
pick and both wedges are declared policy deltas vs r63, so dry
replication is share-level, not trajectory-matched; the wedge
performs through convoPerformFavor (the public favour path's
dispatch, as in tackle-outing's proof) rather than navigating
conversation menus — menu offering is verified by the status
read (ready/action) that gates every performance, and the
outing menu ids are recorded where the wedge reads them.

## Telemetry

Deviation check vs telemetry-baselines/social.json (metrics
l3.bonds, l3.deep2, dryRate — r57-r63's exact set) after the
evidence is written. A LOUD line is a same-run investigation
item before any baseline roll; r63's l3.deep2 LOUD line was an
EXPLAINED schema artifact (baseline predates the deep2 key)
and the baseline was NOT rolled — the same practice applies
here unless a LOUD line is a real deviation.

## What would count as an interesting finding

Any of: a complete wild outing with a split haul and a kept
promise (the fixture win transferring to plots); a funnel that
thins at one named stage (dawn meeting missed, door side,
no green target, adjacency, empty patch, delivery refused);
a forage_help request that never fires in 4 x 140 days; an
outing transcript where the shared work reads like people;
a dry replication miss on fresh seeds; a cold-open rate that
names a new wart.
