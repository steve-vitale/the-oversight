# Journey social r65 — PRE-REGISTER (lane B, 2026-10-29)

Leg 5 (social life), cycle r65. Rotation-b read 5 at run start. This run
ADVANCES rotation-b to 6 at closeout. (Rotation note: r64's closeout
stated 5 -> 6, but the file reads 5 again at this run's start — the
same clobber class as r59–r64. The file is the authority, and leg 5
carries a named-next question, so this run plays social again and
writes 6 itself at closeout.)

Base: master 4dd347e4b. Instrument + one small driver-only recording
addition (turn records; see below). Zero src/js unless a finding below
earns a fix under the staged rules — a fix needs its own proof test
and is NOT pre-authorized by this prereg.

## Follows

- r64 (lane B, 2026-10-28, merged locally pending ship): WILD OUTING
  SCORING — pooled dry-family 0.290/convo (r63: 0.282), end-on-dry
  0.0%, ALL remaining dry is dry9 (515/515), self3 0. 9 outings
  delivered by the deliver log. r64's metric review named the
  social leg's next question as the RESIDUAL DRY9 BURDEN (r63's
  named-next, still open). This run is that question.
- Mechanism (src/js/conversation.js, read before this prereg):
  convoDryLine fires when the intended line is blocked by the RUN
  LEDGER — another villager said that line recently, so this speaker
  cannot honestly say it, and the engine substitutes one of 9
  distinct "lost my train of thought" lines (cap 9 per conversation).
  The last-3 pool (self3) is the within-sitting self-repeat case and
  is 0 in r62/r63/r64. So dry9 = cross-villager line collision, not
  a per-villager repeat.
- r64 sense read #2: dry lines "read as human hesitation inside a
  conversation that still works." r65 tests whether that reading
  holds across the whole dry9 population, or whether dry9 kills
  threads, strands content, or clusters on one broken pick class.

## Leg questions

- (Q1) DRY9 RECOVERY: after a dry9 line, does the conversation
  continue (substantive next line, or a natural close) or die
  (another dry line, or the conversation ends on the dry line)?
- (Q2) DRY9 CONTENT LOSS: when the same pick is retried later in
  the same conversation, does it yield its content, another dry
  line, or nothing? Is the collided content deferred or destroyed?
- (Q3) DRY9 LOCUS: which pick classes / threads carry dry9? If one
  class holds >50%, the mechanism has a locus, not a spread.
- (Q4) DRY9 POSITION: where in a conversation does dry9 strike
  (turn index vs convo length)? Early strikes smell like a cold
  ledger; late strikes smell like ledger saturation.
- (Q5) PEOPLE: do dry9-heavy transcripts still read like people?
  0 fabricated-history flags, weak endings <= 1 across 5 sense
  reads, >= 2 of them dry9-heavy.

## Instrument (r64 driver verbatim + one recording addition)

Driver: scripts/journey-social-r65-20261029.js (fork of the r64
driver; policy, DAYCAP=140, death-aware, all linger, seeded-speaker
steering ON, outing wedge verbatim, invite recording verbatim).
Seeds fresh: 6001–6004, smoke 6005 (30d). The r64 dry census,
outing funnel, and invite census are carried as guardrails.

Recording addition (driver-only, zero game behavior change): each
conversation records per-turn records {turn, pickId, dry9 flag,
lastLine} (turnDry9 captured during the existing entry scan; the
last line of the turn is already computed as `nl`). At dry-census
build time the driver aggregates a new `dry9Detail` list: one record
per dry9 turn with {day, name, turn, turnsTotal, pickId, pickClass,
followKind, retried, retryKind} where:
- followKind: the NEXT turn's last line, classified as
  substantive | another-dry | close | end (no next turn).
- retried: a later turn in the same conversation picks the same
  pickId; retryKind: that retry turn's outcome, substantive |
  dry9 | self3 | none.
- pickClass: the driver's existing dryPickClass (react/topic/other
  split, extended below to thread families — see analyzer).

Analyzer: scripts/analyze-journey-social-r65-dry9-20261029.js reads
the 4 per-seed JSONs and prints pooled Q1–Q4 breakdowns. The r64
funnel analyzer is carried (renamed r65) for guardrails.

## Seeds, regime, policy

Fresh seeds 6001–6004 (full 140d, death-aware) + smoke 6005 (30d,
self-test gate as r64). Competent policy, all linger, seeded-speaker
steering ON (constant, excluded from the natural funnel, as
r56–r64). PILOT FIRST (§9–12): smoke + seed 6001 run first; if the
dry9 instrument records 0 dry9 turns on 6001 (instrument failure,
not a game finding — r63/r64 guarantee dry9 > 0 on any full seed),
stop and fix the instrument before running 6002–6004. If the pilot
shows dry9 but nothing else interesting, the run still completes
its census — dry9 characterization IS the leg question — and the
run note says so plainly.

## Binding verdicts (§14 — a miss is NO-GO, never re-scored)

- DRY9-REPLICATION (replication band, not a quality verdict):
  pooled dry9/convo in [0.20, 0.40] (r63 0.282, r64 0.290). Outside
  the band = investigate (policy drift vs mechanism change),
  reported, never silently re-banded.
- RECOVERY (binds HESITATION vs WART): HESITATION iff BOTH
  (a) substantive-or-close follows >= 85% of dry9 turns that have
  a next turn, AND (b) convos ending on a dry9 line < 5% of all
  convos. Else WART (dry9 kills conversations) and the run note
  names the failing half with counts.
- CONTENT-LOSS (reported, binds the follow-up question): retry
  substantive rate reported; if retried picks return substantive
  >= 50%, content is deferred, not destroyed. Below 50% names a
  follow-up: the collided line never reaches the player.
- LOCUS (reported, binds the next run's question): the top pick
  class share is reported; > 50% names that class as the locus for
  the next social run (or a fix, if the locus is a bug).
- PEOPLE (binds): 5 sense reads, >= 2 dry9-heavy, 0
  fabricated-history flags, weak endings <= 1.
- GUARDRAILS (carried, report-only unless they collapse): F1 dry
  < 1.0/convo, F2 end-on-dry < 20%, cold-open < 10%, outing
  deliveries >= 1 (deliver-log count, per r64 metric review).
  A guardrail collapse is investigated in-run, not re-scored.

## What would count as an interesting finding

- Dry9 followed by a natural close at high rate: the "lost my
  train of thought" line ends conversations it shouldn't — the
  hesitation reading fails.
- One pick class (e.g. gossip about a shared person, or a goal
  line every villager shares) carrying most dry9: the run ledger
  is colliding on templated lines, and the fix is content-side
  (more line variety) or ledger-side (per-thread scoping).
- Retried picks returning dry9 again: the same collision re-fires
  within one sitting — the player can never get that content from
  that villager that day.
- Dry9 striking at turn 0–1 (cold ledger): the ledger is already
  saturated before the conversation starts, implicating cross-
  conversation ledger scope, not within-convo repetition.
