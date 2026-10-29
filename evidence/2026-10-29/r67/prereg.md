# Journey social r67 — PRE-REGISTER (lane B, 2026-10-29)

Leg 5 (social life), cycle r67. Rotation-b read 5 at run start. This run
ADVANCES rotation-b to 6 at closeout. (Rotation note: r66's closeout
advanced 5 -> 6, crisis r66/r69 then advanced 6 -> 7, succession r70
7 -> 4, endgame r71 4 -> 5 — so 5 now is the legitimate next leg, not
the r59–r65 clobber class. Leg 5 carries named-next questions from
r66, so this run plays social again and writes 6 itself at closeout.)

Base: master 6a5658cc6. Instrument + one recording addition (opening
scan; see below). Zero src/js unless a finding below earns a fix under
the staged rules — a fix needs its own proof test and is NOT
pre-authorized by this prereg.

## Follows

- r66 (lane B, 2026-10-29, merged locally pending ship): TRUE
  back-to-back dry substitutions are 1 in 514; 48 of 49
  r65-definition "chains" are stale-lastLine phantoms (the next turn
  added zero transcript entries). CHAIN-TRACKS verdict:
  INSUFFICIENT-DATA — no village thinned to the <=4 thin band
  (rosters 5–11 over 140d), so the comparison could not be tested.
  Replication in band (dry9/convo 0.291), recovery HESITATION
  (90.5%), people PASS (5 reads, 0 fabricated-history, 0 weak
  endings). Named gaps for the next social run: (a) the 6102
  counter delta (+3): opening dry lines spoken by startConvo escape
  the driver's turn-scan — named fix is scanning the opening
  segment; (b) the phantom turns themselves are unclassified — what
  pick produces a zero-entry turn, and is any of them a
  player-visible dead pick rather than menu navigation?
- Mechanism (unchanged since r66; no conversation-code commit on
  master between r66's base 4f349fed1 and this base 6a5658cc6 that
  touches the dry-line path — verified by grep before seeds run):
  convoDryLine fires when the intended line is blocked by the RUN
  LEDGER — another villager said that line recently — and the
  engine substitutes one of 9 "lost my train of thought" lines
  (cap 9 per conversation). startConvo resets the transcript and
  the dryLines counter every sitting (conversation.js:5033, 5090),
  so the opening segment is exactly this sitting's opening lines
  and is safe to scan without double-counting turn-added entries.

## Leg questions

- (Q1) OPENING-GAP CLOSURE: does scanning the opening segment close
  the engine-counter gap? Per seed, gapBefore = counterDryTotal -
  scannedDryTotal (r66 pooled +3) vs gapAfter = counterDryTotal -
  (scannedDryTotal + openingDryTotal). The gap closes iff gapAfter
  == 0 on every seed.
- (Q2) EMPTY-TURN CLASSIFICATION: what are the added==0 turns?
  Classify every one by pickId and position (mid-conversation vs
  last turn of its conversation). A mid-conversation non-navigation
  pick that adds nothing is a player-visible dead pick — a game
  finding, not an instrument artifact. Navigation picks
  (menu:more, subject-menu moves) that add nothing are expected:
  paging is not speech, and no line is spoken.
- (Q3) SPEAKER CONCENTRATION: is the dry9 burden carried by a few
  villagers' lines, or spread? Per speaker (convo name), dry9 share
  vs convo share. Interesting iff the top speaker's dry9 share
  exceeds their convo share by >= 10 percentage points.
- (Q4) REPLICATION guardrails (report-only unless they collapse):
  pooled dry9/convo in [0.20, 0.40]; recovery
  (substantive-or-close follows) >= 85%; convos ending on a dry9
  line < 5%.
- (Q5) PEOPLE: do dry9-heavy transcripts still read like people?
  5 sense reads, >= 2 dry9-heavy, 0 fabricated-history flags, weak
  endings <= 1.

## Instrument (r66 driver verbatim + one recording addition)

Driver: scripts/journey-social-r67-20261029.js (fork of the r66
driver; policy, DAYCAP=140, death-aware, all linger,
seeded-speaker steering ON, outing wedge verbatim, invite
recording verbatim, dry9Detail + amendment-A recording verbatim,
rosterByDay verbatim). Seeds fresh: 6201–6204, smoke 6205 (30d,
self-test gate as r66).

Recording addition (driver-only, zero game behavior change): after
startConvo, driveOne scans the sitting's opening transcript
entries (indices before the first turn's beforeLen) with the same
dryPoolOf classifier used by the turn scan, and records per convo:
openingDryLines, openingDry9Lines, openingSelf3Lines,
openingDryTexts (truncated). Opening entries are also appended to
out.transcript (the turn scan starts at beforeLen, so no entry is
counted twice; sense reads become the full conversation). The
dryCensus gains openingDryTotal / openingDry9Total /
openingSelf3Total sums and per-seed gapBefore / gapAfter. The
turn-based dry9Detail is unchanged (opening dry lines have no turn
and cannot enter follow/retry logic).

Analyzer: scripts/analyze-journey-social-r67-20261029.js reads the
4 per-seed JSONs and prints per-seed + pooled: gapBefore,
gapAfter, opening dry totals, the empty-turn census (count, by
pickId, mid vs last, and for mid turns the following turn's
pickId/added), the speaker-concentration table (dry9 share vs
convo share per speaker), and the r66 funnel analyzer carried
(renamed r67) for guardrails only.

## Seeds, regime, policy

Fresh seeds 6201–6204 (full 140d, death-aware) + smoke 6205 (30d,
self-test gate as r66). Competent policy, all linger,
seeded-speaker steering ON (constant, excluded from the natural
funnel, as r56–r66). PILOT FIRST (§9–12): smoke + seed 6201 run
first; the instrument must record openingDry* fields on 6201
convos AND gapAfter <= gapBefore on 6201 (the opening scan must
not widen the gap) — stop and fix the instrument before running
6202–6204. If the pilot shows a residual gapAfter > 0 with a clear
cause in another unscanned segment, the instrument may be amended
before the judged seeds run (r66 amendment-A precedent) and 6201
re-run under the amended driver; the amendment is recorded in the
run note.

## Binding verdicts (§14 — a miss is NO-GO, never re-scored)

- GAP-CLOSES (binds): CLOSES iff gapAfter == 0 on all four seeds.
  Else OPEN with the residual per seed — reported, never rescued
  by redefining the scanned segment mid-run (a pilot-caught
  amendment before judged seeds run is the only exception, per
  above).
- EMPTY-TURNS (binds as classification completeness): every
  added==0 turn classified; verdict EXPLAINED iff zero
  mid-conversation non-navigation picks added nothing, else
  DEAD-PICK with the pickIds and counts — a game finding carried
  to a fix or a documented hold, not a run failure.
- SPEAKER (binds as interesting/not): INTERESTING iff top
  speaker dry9 share exceeds their convo share by >= 10pp, else
  SPREAD.
- REPLICATION (guardrail, report-only unless it collapses):
  pooled dry9/convo in [0.20, 0.40]; recovery >= 85%;
  end-on-dry9 < 5%. A collapse is investigated in-run, not
  re-scored.
- PEOPLE (binds): 5 sense reads, >= 2 dry9-heavy, 0
  fabricated-history flags, weak endings <= 1.

## AMENDMENT B (pilot-caught, before the judged seeds run)

Pilot seed 6201 ran first (smoke PASS, seed EXIT 0, 142d, alive 6,
dry 124/443, ctr 124/0, gap 0/0). It exposed that the per-seed JSON
deletes `_convoLog` before writing (driver line ~1479: transcripts
go to TDIR files instead), so any census reading turnRecs from the
JSON is vacuous — the first analyzer draft reported 0 empty turns
and 0 speakers from an absent log, not from the game. Nothing in the
game changed; this is recording only.

Amendment (recording only, zero game behavior change):
- driveOne records `openingScanned` (bool) and `openingEntries`
  (opening transcript length) per convo, so the census can prove
  the opening scan actually ran even on a seed with zero opening
  dry lines (6201: opening 0 — live-or-dead was unproven without
  this counter).
- dryCensus builds `emptyTurnCensus` (total / mid / last /
  midNonNav / byPick / midNext / deadPicks capped at 50) and
  `speakerDry9` (per speaker: convos, dry9 = turn + opening) from
  convoLog BEFORE the JSON writer deletes it, and exports
  `openingConvosScanned` / `openingEntriesScanned`.
- The analyzer reads those in-JSON censuses instead of `_convoLog`.
- Pilot gate tightened: openingConvosScanned must equal
  totalConvos on 6201, and gapAfter <= gapBefore. Seed 6201 is
  re-run under the amended driver; the judged series is the
  amended-driver series only.

## What would count as an interesting finding

- gapAfter == 0 everywhere: the counter is fully explained and
  the dry census is now exact — the instrument gap closes.
- A mid-conversation dead pick: the player presses a real option
  and nothing is said — a conversation-UI blank, distinct from
  the phantom-chain artifact.
- Empty turns ~all menu:more: the phantom story closes as
  navigation, and the r65 "chain" rate is fully retired as an
  artifact of paging.
- One speaker carrying the dry9 burden: a content-pool finding
  (their lines collide because their pool is thin), not a ledger
  mystery.
