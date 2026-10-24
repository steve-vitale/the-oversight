# Journey succession r43 — THE OFFICE VS THE VILLAGE (lane B, 2026-10-24)

Leg 7 (succession). Rotation-b read 7 → write 4 (next run plays leg 4, endgame).
Seeds 24001–24004 (fresh band), competent policy, phase A competent
(24001/24002 EARLY_KILL_DAY=10; 24003/24004 standard 40d), kill via the REAL
playerDeath ('a hushwolf') unless the mantle passed organically, then 30d
competent play as the successor. Death-aware stop.
Pre-registration: evidence/2026-10-24/journey-succession-r43-prereg.md
(written before any run). Instrument:
scripts/journey-succession-r43-20261024.js (r42-derived + two dials +
deed ledger + grief-excluded identity wire).

## Headline

The r42 flatline is explained, and it is not the village's story. On all
four seeds the VILLAGE warmed fast — mean trust in the office-holder rose
+13.2, +28.4, +23.6, +35.3 — while the OFFICE entry did its own thing
(fall, climb, flat, climb). On the two clean single-bearer seeds the
office entry did NOT track the warming at all: Rosa's office entry FELL
32→24 while her village climbed 23.2→36.4, and Carlos's sat FLAT at 62
while his village climbed 65.8→89.4. The office entry is a
public-standing / inheritance number (ledger.js: set by formula at each
handoff, moved after that only by public events such as the phoenix
broadcast/gift) — not a live social thermometer. The village's own trust
entries are the thermometer, and they climb steeply under competent,
talkative play, even for low-trust successors. No design change is
implied; the dials were being read as one number when they are two.

## Verdicts (pre-registered, never re-scored)

- T1 (both dials readable, mantle + d+≥14 panel): GO 4/4.
- T2 (deed ledger lives): GO 4/4 (39 post-death deed calls recorded).
- S5 stay-green: GO — M1 funeral arc 4/4, M4 machinery 4/4 (linOk + moOk),
  MG2 meal gate 0 voice violations on 4/4 seeds / 120 audited
  successor meal-days. Parity equal 4/4, zero inherited abilities.
  Scholar function signals 4/4 (System voice 19–48 lines, Codex growth
  on every axis, track XP +27..+48).
- S6 people: GO — 0 identity failures. Wire raw 0 / grief-excluded 0 on
  all seeds; 5 transcripts sense-read in full + a grep scan of all 30
  for "told me" callbacks. Two office-voice lines of the known r42 class
  (disclosed, not counted — see People check).
- M2a vouch contract: 1/1 eligible seed fired (24003, 6 vouchers);
  the other three had 0 eligible and correctly stayed silent.
- M3 social echo: 0/4 on the letter — but see Metric review: the
  tele-style week-2 mention counts are 4, 4, 4, 5, so the dead ARE
  mentioned; the echo filter's villager-talk format misses them. A
  metric-instrument finding, not a game verdict.

## The two dials, seed by seed

| Seed | Handoff | Office (mantle → last) | Village mean (mantle → last) | End |
|------|---------|------------------------|------------------------------|-----|
| 24001 | Paul → Rosa, d11 scripted | 32 → 24 (FALL −8) | 23.2 → 36.4 (CLIMB +13.2) | 9 alive, pantry 9.6k |
| 24002 | Jude → Minh, d11 scripted, then CHAIN to Hannah d28 | 33 → 52 (spans bearers — see note) | 21.5 → 49.9 (CLIMB +28.4) | 8 alive, pantry 8.1k |
| 24003 | Anna → Carlos, d41 scripted, 6 vouchers | 62 → 62 (FLAT) | 65.8 → 89.4 (CLIMB +23.6) | 10 alive, pantry 20.5k |
| 24004 | Robin → Ivan, d12 organic, then CHAIN to Ruby d17 | 40 → 43 (spans bearers — see note) | 26.6 → 61.9 (CLIMB +35.3) | 9 alive, pantry 18.2k |

CHAIN NOTE (read before quoting any office delta): 24002 and 24004 each
passed the chair twice. Minh held it d11–d28, then Hannah; Ivan held it
d12–d17 (five days), then Ruby. The instrument tracks only the first
death in detail, so the chain deaths' causes are NOT captured — not
guessed here. On those two seeds the office delta spans a second
inheritance (the formula re-sets the entry at each handoff), so it
cannot be read as earned climb; the village-mean climb is unaffected
(it is the roster's trust in whoever holds the office). The clean
single-bearer readings are 24001 (fall) and 24003 (flat) — and both
villages still warmed.

Office movement detail (panels): Rosa's entry sat at 32 through d+14
then fell to 24 by d+30; Carlos's never moved; Minh→Hannah's jumped
between d+14 (34) and d+30 (52), across the d28 handoff. What moves the
office entry between handoffs is NOT in this run's saved evidence (no
say dump was kept) — the code's known writers are public events
(phoenix aftermath/broadcast, phoenix gift +10). Naming the channel
without the event is the honest limit; instrumenting office-entry
writers is the follow-up.

## Deed ledger: the wrapped deeds move nothing

39 post-death deed calls, every one delta 0:
- teachPlant 36 calls, all delta 0. Teaching raises a learner's trust
  only below 40 (game.js words cap); every recorded teach landed on a
  villager already at/above 40. The teaches were real (Maypop,
  Plantain, etc. in transcripts) and trust-neutral by rule, not by bug.
- donateToPantry 3 calls, no trust target by construction.
- giveFood, treatVillager, comfort: ZERO calls in any post window.
  Competent post-death play talks and teaches but never directly gives,
  heals, or comforts through those APIs. (Ligaya's tending on 24004
  happened through a conversation favor action — care, honestly not a
  cure — not through treatVillager. The two channels are distinct.)

So the village climb came from UNWRAPPED channels — conversations
above all. The biggest movers were conversation partners: Paolo 11→60
and Wei 41→90 (Rosa's village), Yasuko 24→90 and Naran 16→66 (Minh's),
Pavel 14→90, Victor 20→90, Ivy 14→83, Ligaya 23→90 (Ruby's). Talk is the
engine here; the deed ledger's narrow API set is a declared limit, not
evidence that deeds don't matter. A minority drifts down while the
village climbs (Caleb 13→3, Dongsheng 12→6 on 24001; Ines 12→1 in the
proof run) — normal social variance, not a spiral.

## Village assessment, in plain words

- 24001 — Paul died on day 11 and Rosa, a middling-trusted villager
  (office 32), took the chair. Thirty days later the village trusts the
  office more (mean 36.4, two villagers over 60) even though Rosa's own
  office number slipped to 24 late in the month. Nine alive, shelves
  thinner (9.6k) but holding. The village warmed to Rosa without ever
  being asked to love her on paper.
- 24002 — Jude died day 11, Minh took over, and Minh died on day 28 —
  Hannah has held the chair since. The roughest village (8 alive, 5
  fallen across the window), yet the roster's trust nearly doubled
  (21.5→49.9, three over 60). The office survives its holders.
- 24003 — Anna died day 41 after a long life; six villagers spoke for
  Carlos at the grave ("Anna trusted them. We saw it."). Carlos's
  office number never moved (62), but his village went from warm to
  devoted (mean 89.4, nine of ten over 60). Ten alive, pantry 20.5k —
  the calmest, richest village in the run.
- 24004 — Robin died organically on day 12, Ivan held the chair five
  days and died, Ruby has held it since. Ruby's village is the steepest
  climb in the run (26.6→61.9, four villagers to ~90). Nine alive. A
  chair that passed twice in a week did not break the village.

## People check

S6 GO. Five transcripts sense-read in full; all 30 scanned for
"told me" callbacks; wire raw 0 / filtered 0 everywhere.
- Meaningful: Paolo (the Pit abduction, told in his own voice, invite
  taken eagerly, Maypop taught); Wei (a candy bar saved "for when
  things get better", "haven't told anyone", then "Someone should watch
  your back"); Ligaya (sick, asks for help, tended honestly as care not
  cure); Cheyenne (thread continuity across a week, teaches the
  scholar slope-reading "how their grandmother did it" — the reverse
  teach, freely given); Wei/Cheyenne closings land warm, not templated.
- Office-voice, disclosed not counted (the r42 class): Yasuko's "You
  told me you're from Columbus, Ohio" attributes a disclosure to the
  successor the instrument cannot verify as theirs, and Ligaya's
  "Sweet Tooth. They just... took you" addresses show history to the
  office. The village protagonist is the office, and the office did
  hear these things — same caveat as r42, not a new failure.
- Recurring tells (not failures): the "lost my train of thought" seam
  at conversation joints, "comfortable quiet" closings, the
  driver-picked "You said something odd the other day" recap line.

## Blanks filled / documented

1. ANSWERED (no src change): the r42 trust flatline is a dial artifact.
   Village trust climbs steeply on 4/4 seeds; the office entry is a
   separate public-standing number. The succession leg's social story
   is healthy; the instrument was reading the wrong dial.
2. FIXED (instrument, found in proof): checkpoint trust panels were
   computed for the ledger but never appended to the trust-panels
   array, so the verdict compared the mantle panel to itself (proof
   showed villageMean flat 13.8→13.8 while Gina had actually climbed
   16→63). Fixed before the real seeds; proof re-run confirmed panels
   at d+0/+7/+10 and the true climb. Proof used throwaway seed 23999;
   its outputs were deleted, not committed.
3. FIXED (instrument): identity wire now reports raw AND grief-excluded
   counts. This run it had nothing to exclude (0 trips either way), so
   the exclusion itself is still unproven in the wild — declared, not
   claimed.
4. DOCUMENTED (metric, not game): M3's echo filter misses real
   mentions. Tele week-2 dead-bearer mentions are 4–5 per seed while
   echoMentions is 0 — the mentions exist in say-log formats the
   villager-talk regex doesn't match. See Metric review.
5. DOCUMENTED (instrument gap): chain deaths' causes are not captured
   (first-death-only tracking). 24002's Minh and 24004's Ivan died in
   the window; their causes are unknown, not guessed.
6. DOCUMENTED (policy observation, not bug): competent post-death play
   never calls giveFood / treatVillager / comfort in 120 days of
   successor life. Talk + teach carry the social game; direct
   give/heal/comfort APIs sit unused in this regime.

## Metric review (for the NEXT run, not this one)

- T1/T2 behaved: both dials readable 4/4, deed ledger non-empty 4/4.
  Keep both, but rename the office dial in future pre-registrations to
  "public standing" — calling it "successor trust" is what created the
  r42 confusion.
- M3 (social echo): the bar stands for this run per §14 (0/4 recorded
  as a miss with cause), but the filter is the suspect, not the
  village. Proposed next-run bar: count tele-style week-2 mentions
  (say-log name matches, funeral-arc beats excluded) instead of the
  villager-talk-format filter, or widen the format regex with a
  side-by-side comparison on one seed before swapping.
- The deed ledger's API set is too narrow to attribute the climb:
  future runs should add conversation-partner attribution (checkpoint
  movers were convo partners) or wrap convoTurn consequences, rather
  than quoting wrapped-deed deltas as "deeds don't move trust".
- The smallDraw tally is dropped from the meal verdict as decided in
  r42's review; the voice-only audit held (0 violations, 120 days).

## Reachable / fun / winnable (leg 7)

- Reachable: yes — mantles pass through real deaths (1 organic, 2
  scripted-via-real-playerDeath, plus 2 chain mantles in the window)
  and the 30d successor life plays end to end on all seeds.
- Fun: yes — the successor month reads as a social life, not a
  caretaker stint: villages warm visibly, secrets are told, the chair
  survives double deaths. The office-entry wrinkle is an instrument
  lesson, not a player-facing flatness.
- Winnable: yes for the leg — no village scattered, pantries held
  (8.1k–20.5k), successors alive at +30d on all seeds (counting chain
  successors where the chair passed twice).

## Telemetry

`telemetry-check --baseline telemetry-baselines/succession.json` (4 files,
5 metrics): **QUIET** — no large deviations. Baseline stands; not rolled.

## Design calls for Steve

1. The r42 flatline is CLOSED (explained, no src change): the village
   warms; the office entry doesn't track it. Remove from the open list.
2. No new design call from this run. One open question, not a call:
   if any player-facing surface ever shows "how much the village
   trusts you", which dial should it show — the office entry (public
   standing, moved by public events) or the village mean (live social
   warmth)? The game currently answers this per-system, not in one
   place; this run does not propose changing that.
3. Standing, untouched: re-take surface narrowing (r34), the Simone
   zombie (r28/r29), office visibility/shoes-now, socially-silent
   funerals (r31–r33), naming-debate displacement of mourning (r39).

## Infrastructure

Worktree journey2-succession, branch journey2-succession. Base was
stale on registration (branch ancestor of master); fast-forwarded to
master in the worktree before writing the instrument — no sibling work
touched. Heartbeat loop held throughout (10-min beats). No EPERM flap
observed. No src/js changed by this run.
