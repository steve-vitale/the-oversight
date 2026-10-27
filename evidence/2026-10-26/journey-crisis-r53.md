# Journey crisis r53 — THE DOOR GOES QUIET WHILE THE SIEGE EATS (lane B, leg 6)

Direct handoff from r52's metric review §1–§2 (instrument gaps, not game
changes): r52 left D4 INCONCLUSIVE (no aidCrisis snapshot at sortie time)
and its "drift" bucket conflated three exits. This run fixes the instrument
and replays the delayed-sortie panel.

Pre-registration: `hidden_files/evidence/2026-10-26/journey-crisis-r53-prereg.md`
Instrument: `scripts/journey-crisis-r53-delayed-20261026.js` (r52 driver
verbatim EXCEPT: pure-read `snapCrisis()` at every day boundary and
before/after every sortie call; `resolveAidCrisis` resolutions tagged
'sortie-call' vs 'tick'; every drift classified melts-line /
moved-on-valve / player-drawn-off / unknown; removal records carry object
identity + context) + `scripts/analyze-crisis-r53-delayed-20261026.js`.
No src/js change this run (instrument only).
Policy: oracleV2, 120d death-aware (+10d tail). Delayed rule unchanged
(first sortie ≥3 nights waited; second 3+ days after the first).
Per-seed records:
`hidden_files/evidence/2026-10-26/journey-crisis-r53-delayed-seed{9405..9407}.{json,log}`
plus sheltered transcripts. Stale-lock recovery: this run found the
previous lane-B lock (social leg) with a 65-minute-stale registry
heartbeat and deleted it before proceeding (see run note header note in
memory log).

## Headline verdict: A DELAYED SORTIE NEVER MEETS A LIVE CRISIS — THE
## CRISIS IS ALREADY OVER, AND THE SIEGE IS STILL EATING

Across the 3-seed pilot (8 attempts: 6 ok, 2 refused bench-bare), 5
sorties cleared the treeline (remaining == 0) — and ALL FIVE found
crisisBefore == null. No delayed clear produced a same-day 'fought'
resolution, from the sortie or from the tick. The one sortie in the
pilot that DID meet a live raid crisis (9406 d123, sinceDay 119,
ageParts 13) broke on vFlee with 1 lingerer remaining, and that crisis
then died by the 6-day safety valve ('moved-on' d126) — not by a fight.

The mechanism is now proven, not inferred (9405 d87–d91, transcript +
code):
- d87 night: raid raises the crisis ("at Haven's door").
- d88: an aidFight ends with "The teeth break. The door holds — with
  Ellis Weber standing in Haven's dirt." — and `aidFight` (comms.js)
  calls `resolveAidCrisis('fought')` UNCONDITIONALLY on any vKill/mFlee
  outcome, WITHOUT checking whether other lingerers still hold the
  treeline. The village hears "The door is quiet. Haven breathes."
- d88–d90 nights: Big Loud KEEPS GORGING (875 + 1,641 + 1,500 kcal)
  while the crisis is already resolved.
- d91: the delayed sortie clears Big Loud and voices "The treeline is
  quiet" — but there is no crisis left for it to resolve.
The sortie's own resolution path (`lingererSortie` aftermath) and the
commsTick auto-resolution both check "no lingerers remain" first; the
aidFight path does not. That asymmetry is the whole D4 story: the crisis
is a door-fight record, not a siege record, and it closes at the first
broken tooth while the treeline still holds shapes. Whether that is a
bug or intended is Steve's call — the narration promise ("door is
quiet") breaks against the gorge that follows, so it is filed here as a
blank, not silently fixed.

## Pre-registered verdicts (§14 — bindings, not re-scores)

- D1 snapshot completeness: GO — 8/8 sortie entries carry crisisBefore
  AND crisisAfter (null counts: "no live crisis" is data). Snapshots
  also present on both refusals, including 9406 d120 (live crisis seen
  during a refused sortie).
- D2 crisis-at-clear: GO (classified, not re-scored) — 5/5 clears:
  crisisBefore none, resolutionsDuring [], laterSameDay []. The game
  verdict from the classification: delayed clears resolve no live
  crisis, because every raid crisis in the pilot resolved 'fought' via
  tick within ~1 day of its raid (32/33 resolutions are next-day
  'fought'; the exception is 9406's d119 crisis, resolved 'moved-on'
  d126 by valve). The pilot did NOT produce a live-crisis clear, so
  per the pre-registration the panel does NOT expand to 9408/9409.
- D3 drift classification: GO — 17/17 drifts carry exactly one label,
  unknown == 0: player-drawn-off 6, sortie-clear 8, melts-line 2,
  moved-on-valve 1. The drawn-off label now rests on removal context
  and say lines together (e.g. 9406 d102 "flagging — it won't follow
  much further"), not on disappearance alone.
- D4 people check: GO — 22 convos driven panel-wide, 0 fabrication
  flags (r50 regex). Six transcripts read in full: 9405 d17 Marco
  (Taking, brother Declan, pods in sleep, a commitment the NPC
  receives with gratitude, then a haul ask + gift) and 9406 d116
  Mason (Somchai's burnt piece, "I take it now") are the strongest —
  specific grief with a concrete habit, not generic sadness. 9406
  d11 Felipe shares real knowledge (Sunback behavior, a real spring).
  Weaker: 9405 d10 Marco meanders around the naming debate. One
  checkable-but-unverified line: 9405 d32 Marco's "The Secret Deck.
  They just... took you" — the Deck is a real contest (contests.js),
  but this run's record carries no player contest history, so the
  line cannot be verified from the record (see metric review).
- D5 price honesty: GO — pantry-after = pantry-before - paid EXACTLY
  on 6/6 ok attempts; 0 on both refusals.
- D6 episode-keyed gorge-after: GO — 0 gorge nights for a cleared
  object after its clear day (name-matched secondary check also 0).

## Panel totals (3 seeds)

- Attempts 8: ok 6, refused 2 (both bench-bare, voiced).
- Sortie fights 10: clears 5 (9405 d91; 9406 d105; 9407 d113, d118,
  d122). Paid in rations: 30,545 kcal (9405 6,051; 9406 9,728; 9407
  14,766). Gorged: 72,157 kcal over 52 nights.
- Raids 32. Convos 22, fabrications 0. Resolutions 33 (32 'fought'
  via tick, 1 'moved-on' via valve). Sortie-call resolutions: 0 —
  no sortie in the pilot ever fired a resolution.
- Endings: 9405 horizon (6 alive, 38,107 kcal); 9406 horizon (5
  alive, 2,050 kcal); 9407 horizon (6 alive, 2,500 kcal — the run
  survived its own player's starvation death on d13 and played on as
  the village, which is the village-as-protagonist rule working).
- No deaths during any sortie; 0 dead fighters in any muster line.

## Instrument neutrality (control, same run)

9405 diverged from r52's recorded 9405 (different raids after d44).
Suspect was instrument contamination (new displayNameOf calls at first
sight). Control: the UNCHANGED r52 driver on this run's base
reproduced the r53 timeline EXACTLY (raids 8,15,30,44,60,69,87,94,107,
119; sortie d91 paid 6,051; census 6 alive, 38,107 kcal). Verdict: the
divergence is a BASE MOVE between r52's run (2026-10-26 17:07 UTC) and
this base, not the instrument. `monsterDisplayName` is a pure read
(no RNG) and `aidCrisis()` is a pure getter, as verified in source.
9406 is identical across both bases (same raids, sorties, census) —
a robust seed. Control record:
`hidden_files/r53-control-9405.json` (+ transcripts dir
`hidden_files/r53-control-9405/`).

## Village assessment (plain words)

The siege is a tax the village pays twice: once when the door fight
ends (the crisis closes and everyone is told it is quiet), and again
for every night the treeline still holds a shape. 9405 ends fat
because its one lingerer was cleared fast and its raids were mostly
met at the door. 9406 ends thin because the gorge ran 29 nights and
the bench went bare twice while the treeline held — the village that
waits longest pays most, exactly as r52 found, and now we know the
crisis record does not even stay open long enough to price that wait.
9407 ends thin but intact: three marches cleared five lingerers and
nobody died on a march. The people in these villages grieve
specifically (burnt pieces, water tasted first, brothers in pods) and
share real knowledge (Sunback behavior, a spring) — they read as
people, not as menus.

## Metric review (§14)

No metric was re-scored mid-run. Notes for the NEXT run:
1. D2 is answered for the delayed shape; the open question moves to
   the aidFight path: should `aidFight` check remaining lingerers
   before resolving 'fought' (like the sortie aftermath and commsTick
   do)? That is a game change and Steve's call — this run files it,
   it does not fix it. A targeted proof (aidFight vs 2+ lingerers)
   would settle whether the early resolution is ever wrong in a way
   players can see beyond the gorge-after-quiet narration.
2. Drift classification holds, but `nightsWaited` overstates for
   RE-lingered objects: 9406's Big Loud (firstSeen d102, re-lingered
   by the d119 raid) reports 21 nights at the d123 sortie though its
   current episode is 4 nights. Episode identity should reset when an
   object re-lingers after a clear; until then, read nightsWaited
   for re-lingered objects as "since first ever seen," not "this
   episode."
3. Convo records should carry the player's contest history, so lines
   like "The Secret Deck took you" become verifiable instead of
   plausible.
4. Open items carried forward (documented, not fixed): (i) dead
   discoverer's orphaned fireside entry (r51, Steve's call); (ii)
   unfed marches proceed (r50, Steve's call); (iii) the stare-down
   soft spot (marches against hp-1 stragglers feel free — r50 note;
   9405's Big Loud WAS a hp-1 straggler cleared by a full march).

## Telemetry check

Ran `telemetry-check.js` against `telemetry-baselines/crisis.json`
(metrics defenderFights, playerFights, defendedCount,
latelyDefenseCount). Two LOUD lines fired, both EXPLAINED, not bugs:
- defenderFights 95 -> 0: vocabulary mismatch. The journey instrument
  records the same concept as `defendedFights` (110 total this panel:
  35 + 34 + 41) — same order of magnitude, no disappearance. The
  baseline's key name differs from the instrument's field name.
- defendedCount 21 -> 0: no such field exists in journey records
  (a convo-instrument count, not a journey field).
playerFights and latelyDefenseCount are 0 -> 0 (quiet). The baseline
was NOT rolled forward: overwriting a convo-instrument baseline with
journey-instrument numbers under mismatched keys would destroy its
meaning. Next run should either map defenderFights -> defendedFights
or rebuild the crisis baseline from the journey instrument.

## Reachable / fun / winnable (leg 6)

- REACHABLE: yes — raids, lingerers, gorges, sorties, refusals,
  drifts and all three exits fired in a 3-seed pilot without
  intervention beyond the delayed rule.
- FUN: mixed — the march itself is legible and costly, the people
  are real, but the "door is quiet" line landing mid-siege undercuts
  the siege's tension: the game tells the player the crisis is over
  while the pantry keeps bleeding. That narration gap is this run's
  blank.
- WINNABLE: yes — all three villages reached the horizon alive, and
  the thin ones (2,050 / 2,500 kcal) did so through marches, not luck.

## Files

- Driver: `scripts/journey-crisis-r53-delayed-20261026.js`
- Analyzer: `scripts/analyze-crisis-r53-delayed-20261026.js`
- Per-seed:
  `hidden_files/evidence/2026-10-26/journey-crisis-r53-delayed-seed{9405,9406,9407}.{json,log}`
  + `journey-crisis-r53-seed{9405,9406,9407}-d*.txt` transcripts
- Control: `hidden_files/r53-control-9405.json`,
  `hidden_files/r53-control-9405/`
- Status: merged locally, pending ship (no version tag; the ship loop
  owns bumps, pushes, and live verification).
