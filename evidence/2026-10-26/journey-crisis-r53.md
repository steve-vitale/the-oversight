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
heartbeat and deleted it before proceeding.

BASE NOTE — READ FIRST: this run's pilot ran TWICE, because lane A
landed mid-run. The first pilot ran on base 44179091d; after the rebase
onto master c04d4e0cb (journey-scale r42: bystander-hold fix, 15+/2-
in src/js/game.js), the proof re-run diverged, so the full pilot was
re-run on the new base. The verdicts below are the NEW-BASE pilot
(base c04d4e0cb). The old-base pilot is preserved in condensed form
under "Pre-rebase pilot" — its headline finding is the same, and the
comparison itself measures the bystander fix's effect on crisis legs.
Per-seed JSONs in the evidence dir are the NEW-BASE set; old-base
9406/9407 JSONs are preserved in
`hidden_files/evidence/2026-10-26/r53-pre-rebase/` (old-base 9405's JSON
was overwritten by the post-rebase proof re-run; its headline numbers
are preserved in the pre-rebase paragraph below).

## Headline verdict: A DELAYED SORTIE NEVER MEETS A LIVE CRISIS — THE
## CRISIS IS ALREADY OVER, AND THE SIEGE IS STILL EATING

Across the new-base 3-seed pilot (6 attempts, all ok), 4 sorties
cleared the treeline (remaining == 0) — and ALL FOUR found
crisisBefore == null. No delayed clear produced a same-day 'fought'
resolution, from the sortie or from the tick. Sortie-call resolutions
in the whole pilot: 0. The two sorties that DID meet a live raid
crisis (9405 d48, sinceDay 44, ageParts 13; 9406 d121, sinceDay 120,
ageParts 1) both BROKE (vFlee / vDie) with lingerers remaining — and
in both cases the crisis then resolved while lingerers still gorged.

The mechanism is now proven twice over, not inferred (old-base 9405
d87–d91 AND new-base 9406 d120–d122, transcript + code):
- d120 night: raid raises the crisis ("at Haven's door").
- d121: the march goes out (Dina, Yawo, 4,000 kcal), stares down two
  hp-1 stragglers for free, then Dina DIES to the 195-HP Ugly Thing
  ("Dina faced The Ugly Thing at the treeline... and didn't come
  back. The party carries the body home."). The march breaks.
- d121, right after: "The teeth break. The door holds — with nobody's
  help but Haven's own." + "The door is quiet. Haven breathes." — an
  aidFight resolved the crisis 'fought' (comms.js calls
  `resolveAidCrisis('fought')` UNCONDITIONALLY on any vKill/mFlee
  outcome, WITHOUT checking whether other lingerers still hold the
  treeline).
- d121–d122 nights: the Ugly Thing, Don't-Look and Loud-Eyes KEEP
  GORGING (1,500 + 2,500 + 2,500, then 3,000 + 3,000 kcal) after the
  village was told the door is quiet.
The sortie's own resolution path (`lingererSortie` aftermath) and the
commsTick auto-resolution both check "no lingerers remain" first; the
aidFight path does not. That asymmetry is the whole D4 story: the crisis
is a door-fight record, not a siege record, and it closes at the first
broken tooth while the treeline still holds shapes. Whether that is a
bug or intended is Steve's call — the narration promise ("door is
quiet") breaks against the gorge that follows, so it is filed here as a
blank, not silently fixed.

## Pre-registered verdicts (§14 — bindings, not re-scores)

- D1 snapshot completeness: GO — 6/6 sortie entries carry crisisBefore
  AND crisisAfter (null counts: "no live crisis" is data).
- D2 crisis-at-clear: GO (classified, not re-scored) — 4/4 clears:
  crisisBefore none, resolutionsDuring [], laterSameDay []. The game
  verdict from the classification: delayed clears resolve no live
  crisis, because every raid crisis in the pilot resolved 'fought'
  via tick within ~1 day of its raid (30/31 resolutions are 'fought'
  via tick; the exception is 9405's d44 crisis, resolved 'moved-on'
  d51 by valve). The pilot did NOT produce a live-crisis clear, so
  per the pre-registration the panel does NOT expand to 9408/9409.
  (The pre-rebase pilot's 5 clears were also all crisis-none.)
- D3 drift classification: GO — 12/12 drifts carry exactly one label,
  unknown == 0: player-drawn-off 4, sortie-clear 7, moved-on-valve 1
  (no melts-line fired in the new-base pilot).
- D4 people check: GO — 19 convos driven panel-wide, 0 fabrication
  flags (r50 regex). Read in full this round: 9407 d111 Sanne (a real
  person — the Amsterdam dream, a street that keeps getting longer;
  a trust negotiation answered right: "I hope to earn it") and 9406
  d93 Mason (corrects a false history — "I wasn't a paramedic. I was
  a mechanic" — then refuses to re-confess: "I'm not confessing it
  twice for dramatic effect"). Notes: Sanne's recap loop repeats
  near-identically 3 times ("Still on what you dream about") — a
  mild filler loop; the confrontation thread shows the engine CAN
  track repetition, so recap is the lagging path. From the
  pre-rebase pilot: 9405 d17 Marco (Taking, brother Declan, pods in
  sleep, a commitment received with gratitude) and 9406 d116 Mason
  (Somchai's burnt piece, "I take it now") remain the strongest
  grief writing; 9405 d32 Marco's "The Secret Deck. They just...
  took you" is grounded in a real contest (contests.js) but this
  run's record carries no player contest history, so the line cannot
  be verified from the record (see metric review).
- D5 price honesty: GO — pantry-after = pantry-before - paid EXACTLY
  on 6/6 ok attempts; no refusals this panel.
- D6 episode-keyed gorge-after: GO — 0 gorge nights for a cleared
  object after its clear day (name-matched secondary check also 0).

## Panel totals — NEW BASE (c04d4e0cb)

- Attempts 6: ok 6, refused 0. Clears 4 (9406 d70; 9407 d113, d118,
  d122). Breaks 2 (9405 d48 vFlee; 9406 d121 vDie — the march's leader
  died). Sortie fights 10. Paid in rations: 31,068 kcal. Gorged:
  65,253 kcal over 38 nights.
- Raids 31. Convos 19, fabrications 0. Resolutions 31 (30 'fought'
  via tick, 1 'moved-on' via valve). Sortie-call resolutions: 0.
- Endings: 9405 horizon (3 alive, 0 kcal); 9406 horizon (3 alive,
  21,878 kcal); 9407 horizon (6 alive, 2,500 kcal — the run survived
  its own player's starvation death on d13 and played on as the
  village, which is the village-as-protagonist rule working).
- Sortie deaths: 1 leader (Dina, d121 march — confirmed by Codex +
  sortie line). CORRECTION TO THE INSTRUMENT: the sortie entry's
  `deathsDuring` roster-diff field reads [] for that march, because
  the muster leader's id is not on the village roster at check time.
  The death is real and voiced; the field undercounts non-roster
  muster leaders. See metric review item 4.
- The stare-down soft spot (r50 note item iii) bit in the open: the
  d121 march's two clears were 0-round stare-downs against hp-1
  stragglers, then the leader died to the one real fight. Free until
  it isn't.

## Pre-rebase pilot — OLD BASE (44179091d), condensed

Same driver, same seeds, pre-rebase base. Attempts 8 (ok 6, refused 2
bench-bare). Clears 5, all crisisBefore null. Drifts 17, unknown 0
(drawn-off 6, sortie-clear 8, melts 2, moved-on 1). Gorge 72,157 kcal
/ 52 nights. Convos 22, fabrications 0. Price honesty exact 6/6.
Endings: 9405 horizon (6 alive, 38,107 kcal); 9406 horizon (5 alive,
2,050 kcal); 9407 horizon (6 alive, 2,500 kcal — IDENTICAL to the
new-base 9407, a robust seed).
Comparison (the bystander fix's effect on crisis legs): the fix stops
startCombat silently deleting a bystander lingerer on player-tile
fights, so sieges run their full course instead of vanishing when
bumped into. Old 9405's d44 episode resolved next-day with the
lingerers mostly met at the door; new 9405's d44 episode gorges 6
nights to the valve. Old 9406 ended at 2,050 kcal after 29 gorge
nights; new 9406 ends at 21,878 kcal after 14 — the shape of the
siege changed, not just its length. The crisis-resolution asymmetry
(aidFight closing the crisis while lingerers gorge) is UNCHANGED by
the fix: it fired on both bases.

## Instrument neutrality (control, same run)

The pre-rebase pilot's 9405 diverged from r52's recorded 9405
(different raids after d44). Suspect was instrument contamination
(new displayNameOf calls at first sight). Control: the UNCHANGED r52
driver on the pre-rebase base reproduced the r53 timeline EXACTLY
(raids 8,15,30,44,60,69,87,94,107,119; sortie d91 paid 6,051; census
6 alive, 38,107 kcal). Verdict: the divergence is a BASE MOVE
between r52's run (2026-10-26 17:07 UTC) and the pre-rebase base, not
the instrument. `monsterDisplayName` is a pure read (no RNG) and
`aidCrisis()` is a pure getter, as verified in source. Control
record: `hidden_files/r53-control-9405.json` (+ transcripts dir
`hidden_files/r53-control-9405/`).

## Village assessment (plain words)

The siege is a tax the village pays twice: once when the door fight
ends (the crisis closes and everyone is told it is quiet), and again
for every night the treeline still holds a shape. 9405 ends on empty
stores because its one siege ran to the valve and its march broke.
9406 ends thinner than it looks: the march that broke cost its
leader, and the village heard "the door is quiet" while three shapes
kept eating. 9407 ends thin but intact: three marches cleared five
lingerers and nobody died on a march. The people in these villages
grieve specifically (burnt pieces, brothers in pods, streets that
keep getting longer in dreams) and correct false histories instead
of repeating them — they read as people, with the recap loop as the
one place the conversation stops listening to itself.

## Metric review (§14)

No metric was re-scored mid-run. Notes for the NEXT run:
1. D2 is answered for the delayed shape on two bases; the open
   question moves to the aidFight path: should `aidFight` check
   remaining lingerers before resolving 'fought' (like the sortie
   aftermath and commsTick do)? That is a game change and Steve's
   call — this run files it, it does not fix it. A targeted proof
   (aidFight vs 2+ lingerers) would settle whether the early
   resolution is ever wrong in a way players can see beyond the
   gorge-after-quiet narration.
2. Drift classification holds, but `nightsWaited` overstates for
   RE-lingered objects (pre-rebase 9406: Big Loud, firstSeen d102,
   re-lingered by the d119 raid, reports 21 nights at the d123
   sortie though its current episode is 4 nights). Episode identity
   should reset when an object re-lingers after a clear.
3. Convo records should carry the player's contest history, so lines
   like "The Secret Deck took you" become verifiable instead of
   plausible.
4. NEW: the sortie entry's `deathsDuring` roster-diff field misses
   non-roster muster leaders (Dina's d121 death reads []). Death
   accounting for sorties must read the Codex/death say lines (or
   the fight outcomes) alongside the roster diff, or march deaths
   will be undercounted.
5. Open items carried forward (documented, not fixed): (i) dead
   discoverer's orphaned fireside entry (r51, Steve's call); (ii)
   unfed marches proceed (r50, Steve's call); (iii) the stare-down
   soft spot (r50 note; the d121 march is now its clearest case:
   two free stare-down clears, then death on the real fight).

## Telemetry check

Ran `telemetry-check.js` against `telemetry-baselines/crisis.json`
(metrics defenderFights, playerFights, defendedCount,
latelyDefenseCount) on the new-base files. Two LOUD lines fired, both
EXPLAINED, not bugs:
- defenderFights 95 -> 0: vocabulary mismatch. The journey instrument
  records the same concept as `defendedFights` (111 total this panel)
  — same order of magnitude, no disappearance. The baseline's key
  name differs from the instrument's field name.
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
  intervention beyond the delayed rule, on both bases.
- FUN: mixed — the march itself is legible and costly, the people
  are real, but the "door is quiet" line landing mid-siege undercuts
  the siege's tension: the game tells the player the crisis is over
  while the pantry keeps bleeding, and on the new base the march
  that hears it has just lost its leader. That narration gap is this
  run's blank.
- WINNABLE: yes — all three villages reached the horizon alive,
  including the one that ended on 0 kcal (alive, but with nothing
  left — the thin edge of winnable).

## Files

- Driver: `scripts/journey-crisis-r53-delayed-20261026.js`
- Analyzer: `scripts/analyze-crisis-r53-delayed-20261026.js`
- Per-seed (NEW BASE):
  `hidden_files/evidence/2026-10-26/journey-crisis-r53-delayed-seed{9405,9406,9407}.{json,log}`
  + `journey-crisis-r53-seed{9405,9406,9407}-d*.txt` transcripts
- Pre-rebase preservation:
  `hidden_files/evidence/2026-10-26/r53-pre-rebase/` (old-base 9406/9407
  JSONs; old-base 9405 JSON overwritten by the post-rebase proof
  re-run, numbers preserved above)
- Control: `hidden_files/r53-control-9405.json`,
  `hidden_files/r53-control-9405/`
- Status: merged locally, pending ship (no version tag; the ship loop
  owns bumps, pushes, and live verification).
