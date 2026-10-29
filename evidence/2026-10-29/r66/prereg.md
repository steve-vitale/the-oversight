# Journey social r66 — PRE-REGISTER (lane B, 2026-10-29)

Leg 5 (social life), cycle r66. Rotation-b read 5 at run start. This run
ADVANCES rotation-b to 6 at closeout. (Rotation note: r65's closeout
stated 5 -> 6, but the file reads 5 again at this run's start — the
same clobber class as r59–r65. The file is the authority, and leg 5
carries a named-next question, so this run plays social again and
writes 6 itself at closeout.)

Base: master 4f349fed1. Instrument + one small driver-only recording
addition (roster snapshots; see below). Zero src/js unless a finding
below earns a fix under the staged rules — a fix needs its own proof
test and is NOT pre-authorized by this prereg.

## Follows

- r65 (lane B, 2026-10-29, merged locally pending ship): RESIDUAL
  DRY9 BURDEN — pooled dry9/convo 0.300 (band [0.20, 0.40] held),
  recovery 91.0% (HESITATION), end-on-dry 0.1%, retry-substantive
  61.4% (content deferred, not destroyed), locus = generic
  continuation (dlg:more + dlg:react + goon = 69.3%), late-convo
  saturation. r65's named follow-up, still open: dry chains
  cluster where the village is thinnest — seed 6004 (extinct by
  day 133) held 18 of the pooled 46 another-dry follows (39%)
  from 14% of dry9 turns. This run is that question.
- Mechanism (unchanged since r65; no conversation-code commit on
  master between r65's base 4dd347e4b and this base 4f349fed1):
  convoDryLine fires when the intended line is blocked by the RUN
  LEDGER — another villager said that line recently — and the
  engine substitutes one of 9 "lost my train of thought" lines
  (cap 9 per conversation). Dry9 = cross-villager line collision.

## Leg questions

- (Q1) CHAIN-vs-ROSTER: does the dry-chain rate — a dry9 turn
  followed by another dry line — rise as the living roster
  shrinks? Band each dry9 turn by the living NPC roster on its
  day: FULL >= 8, THINNED 5–7, THIN <= 4.
- (Q2) CHAIN LENGTH: do thin-roster conversations carry longer
  consecutive dry runs (max run of back-to-back dry9 turns within
  one conversation) than full-roster ones?
- (Q3) DRY DENSITY: do thin-roster days produce more dry9 turns
  per day in band than full-roster days (dry9 turns / days spent
  in band)?
- (Q4) PEOPLE: do thin-band dry9-heavy transcripts still read
  like people? 0 fabricated-history flags, weak endings <= 1
  across 5 sense reads, >= 2 dry9-heavy, >= 1 from a thin-band
  day when thin-band dry9 exists.

## Instrument (r65 driver verbatim + one recording addition)

Driver: scripts/journey-social-r66-20261029.js (fork of the r65
driver; policy, DAYCAP=140, death-aware, all linger,
seeded-speaker steering ON, outing wedge verbatim, invite
recording verbatim, dry9Detail verbatim). Seeds fresh: 6101–6104,
smoke 6105 (30d, self-test gate as r65).

Recording addition (driver-only, zero game behavior change): the
driver's daily() hook appends one read-only snapshot per loop-day
{day, living} where living = livingIds().length (NPC villagers
alive; the player is excluded, exactly as the end-of-run alive
count). No RNG consumed, no game call that mutates state. The
snapshot list is exported as top-level `rosterByDay` in each
per-seed JSON. Analyzer banding: a dry9 turn's roster = the
snapshot for its day, else the latest snapshot at or before its
day; a turn with no snapshot at or before its day is UNBANDED
and counted separately (instrument-failure signal, not dropped
silently).

Analyzer: scripts/analyze-journey-social-r66-chain-20261029.js
reads the 4 per-seed JSONs and prints per-seed + pooled, per band:
dry9 turns, dry9-with-next, another-dry follows (chain rate),
max/mean consecutive-dry run per conversation, days in band,
dry9 per band-day. The r65 funnel analyzer is carried (renamed
r66) for guardrails only.

## Seeds, regime, policy

Fresh seeds 6101–6104 (full 140d, death-aware) + smoke 6105 (30d,
self-test gate as r65). Competent policy, all linger,
seeded-speaker steering ON (constant, excluded from the natural
funnel, as r56–r65). PILOT FIRST (§9–12): smoke + seed 6101 run
first; the instrument must record >= 1 dry9 turn AND a
non-empty rosterByDay with >= 1 snapshot on 6101 (r63/r64/r65
guarantee dry9 > 0 on any full seed; rosterByDay is new, so a
missing/empty list is an instrument failure, not a game
finding) — stop and fix the instrument before running 6102–6104.
If the pilot shows dry9 but nothing else interesting, the run
still completes its census — chain-vs-roster IS the leg
question — and the run note says so plainly.

## Binding verdicts (§14 — a miss is NO-GO, never re-scored)

- CHAIN-TRACKS (binds): TRACKS iff thin-band (<= 4) chain rate
  exceeds full-band (>= 8) chain rate by >= 5 percentage points,
  with >= 30 dry9-with-next turns in EACH of those two bands.
  Else NO-TRACK (reported with counts, not re-banded). If either
  band holds < 30 dry9-with-next turns, that comparison is
  INSUFFICIENT-DATA — reported, never rescued by moving the band
  edges mid-run.
- REPLICATION (guardrail, report-only unless it collapses):
  pooled dry9/convo in [0.20, 0.40]; recovery
  (substantive-or-close follows) >= 85%; convos ending on a
  dry9 line < 5%. A collapse is investigated in-run, not
  re-scored.
- PEOPLE (binds): 5 sense reads, >= 2 dry9-heavy, >= 1 from a
  thin-band day when thin-band dry9 exists, 0 fabricated-history
  flags, weak endings <= 1.
- INSTRUMENT (binds): roster lookup covers >= 95% of dry9 turns
  (UNBANDED < 5%); engine-counter cross-check exact per seed
  (transcript dry = counter dry, as r65). A miss is investigated
  in-run, not re-scored.

## What would count as an interesting finding

- Thin-band chain rate at or above full-band rate by a wide
  margin with long consecutive runs: thinning villages talk to
  themselves in circles — a content/ledger finding, not just a
  rate.
- Chain rate flat across bands: r65's pocket was seed-6004
  variance, not a roster effect — the pocket closes.
- Thin-band dry9 density per band-day far above full-band:
  collisions concentrate in time, not just in sequence.
- A thin-band transcript that reads as people anyway: the
  hesitation reading survives the worst case.

## AMENDMENT A (pilot-caught, before the judged band ran)

Pilot seed 6101 ran first (smoke PASS, seed EXIT 0). It exposed a
followKind ambiguity that decides what "chain" means, so the
instrument is amended BEFORE seeds 6102–6104 run; seed 6101 is
re-run under the amended driver with a reproduction check (see
run note). Nothing in the game changed; this is recording only.

Finding: on 6101, all 11 another-dry follows sit ALONE in their
conversations — no sibling dry9 record at turn+1 — yet
followKind='another-dry' requires the next turn's lastLine to
exactly match a dry9 line. The entry scan counts every dry line
it sees, and the counter cross-check is exact (144 = 144), so a
true back-to-back substitution would leave a sibling record.
The consistent reading is a STALE-lastLine echo: when the next
turn adds zero transcript entries, lastLine repeats the previous
turn's last line — the dry line itself — and dryPoolOf calls it
another dry. The r65 "chain" counts (pooled 46) therefore mix
true chains with phantoms, and r65's thin-village pocket cannot
be quoted as chains until the split is measured.

Amendment (recording only, zero game behavior change):
- turnRecs gains `added` = transcript entries added by that turn
  (afterLen - beforeLen, already computed in the entry scan).
- dry9Detail gains `followNextAdded` (the next turn's `added`)
  and `followNextLastLine` (the next turn's lastLine, truncated).
- Analyzer splits another-dry follows into TRUE (next turn
  added >= 1 entry AND a sibling dry9 record sits at turn+1 in
  the same conversation — equivalently a consecutive-dry run of
  length >= 2), PHANTOM (next turn added 0 entries), and
  ANOMALY (added >= 1 but no sibling record — impossible under
  the scan logic; any count here is an instrument investigation
  item, not a chain).
- The CHAIN-TRACKS verdict now binds on the TRUE-chain rate
  (true chains / dry9-with-next), same bands, same >= 5pp bar,
  same n >= 30 per band. The r65-definition rate
  (another-dry / withNext) is still reported per band for
  comparability with r65, but it is NOT the verdict series.
- The consecutive-run census (Q2) already measures true chains
  directly and is unchanged.
