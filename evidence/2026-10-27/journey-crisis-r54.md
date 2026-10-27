# Journey crisis r54 — THE DOOR IS QUIET AND THE SIEGE GOES ON (lane B, leg 6)

Direct handoff from r53's metric review §1–§4 (instrument fixes, not
game changes). r53 proved aidFight resolves 'fought' while lingerers
still gorge; this run answers r53's open question: is the early
resolution merely narration, or does it mechanically mislead a
competent player?

Pre-registration: `hidden_files/evidence/2026-10-27/journey-crisis-r54-prereg.md`
Instrument: `scripts/journey-crisis-r54-delayed-20261027.js` (r53
driver verbatim EXCEPT: episode reset on re-linger after clear/drift;
say-line death accounting on sortie entries; playerContests snapshot
on convo records; lingeringAtResolution on every aid resolution) +
`scripts/analyze-crisis-r54-delayed-20261027.js`.
No src/js change this run (instrument only).
Policy: oracleV2, 120d death-aware (+10d tail). Delayed rule unchanged
(first sortie ≥3 nights waited; second 3+ days after the first).
Per-seed records:
`hidden_files/evidence/2026-10-27/journey-crisis-r54-delayed-seed{9405..9407}.{json,log}`
plus sheltered transcripts. Base: fc57dd0bd (lane A r43 landed
mid-prep; see Base note).
No expansion: the pilot met none of the pre-registered expansion
triggers (unknown drift 0, live-crisis clear 0, beat-dead instance 0),
so the pilot IS the run, per r53 precedent.

BASE NOTE — READ FIRST: lane A landed journey-scale r43 onto master
between this run's pull and its worktree registration (master moved
5c3c80013 → fc57dd0bd). The r54 pilot therefore runs on a NEWER base
than r53's new-base pilot (c04d4e0cb) — yet every headline number
reproduces r53's new-base pilot EXACTLY: attempts 6, ok 6, clears 4
(9406 d70; 9407 d113, d118, d122), breaks 2 (9405 d48 vFlee; 9406 d121
vDie), sortie fights 10, paid 31,068 kcal, gorged 65,253 kcal over 38
nights, raids 31, convos 19, fabrications 0, resolutions 31 (30
'fought' via tick, 1 'moved-on' via valve). The instrument adds zero
game-state writes, so exact reproduction means the lane A r43
bystander-hold fix is NEUTRAL on crisis legs for these seeds — a
useful base-neutrality check, not an instrument error.

## Headline verdict: THE EARLY RESOLUTION IS NARRATION-ONLY — THE
## SIEGE STAYS ANSWERABLE, BUT THE GAME LIES ABOUT THE DOOR

The resolution census (new this run) finds 6 early-resolution
instances: a 'fought' resolution with lingerers still holding the
treeline at resolution time (lingeringAtResolution 1–3). On ALL SIX
days the aidFight line fires — "The teeth break. The door holds" —
followed by "The door is quiet. Haven breathes." That pairing is the
proof r53 asked for: these are aidFight-path resolutions (comms.js
unconditional resolve on vKill/mFlee), NOT commsTick auto-resolutions
(the tick checks lingeringRaiders first and cannot fire with
lingerers present). The only 'fought' resolutions in the whole panel
that carry lingerers are the aidFight ones; the tick's check holds.

And on ALL SIX instances the siege stays answerable (D7: beat-alive
6/6):
- Gorge continues after every early resolution: 2–16 further gorge
  nights, 4,700–30,027 kcal each — the treeline keeps eating after
  the village was told it is quiet.
- Sorties were still driven after 5 of the 6 (the exception, 9406
  d121, is horizon end: 2 gorge nights follow, no days left to
  muster). The driver calls answerLingerer('sortie') at day
  boundaries regardless of crisis state, and the calls succeed —
  because answerLingerer never checks crisis state at all (it gates
  only on lingeringRaiders().length). A real player with fighters
  and rations can still march after "the door is quiet."
So the mechanical mislead is NOT there: nothing the player needs is
gated on the crisis record. What breaks is the narration promise:
the game tells the player the crisis is over while the pantry keeps
bleeding, and on 9406 d121 the village hears "the door is quiet" on
the same day its march lost its leader. The fix (aidFight checks
lingerers first, like the other two paths) remains Steve's call —
this run proves the cost of leaving it is a false "all clear," not
a stranded siege.

## Pre-registered verdicts (§14 — bindings, not re-scores)

- D1 episode accounting: GO — every drift/sortie entry carries
  episode firstSeenDay AND firstSeenEver; no re-lingered object
  appeared in this panel (episode resets 0, drift old-vs-new diffs
  0), so the reset logic itself is UNTESTED in live play (it boots
  clean and the code path is guarded by cleared/drifted flags, but
  no live re-linger exercised it). The r53 pre-rebase Big Loud case
  (21 nights reported for a 4-night episode) did not recur on this
  base/panel. Next run: the reset still needs a live re-linger to
  prove itself; do not claim it proven.
- D2 early-resolution census: GO — 0 resolutions missing
  lingeringAtResolution. Census: 6 early (all aidFight-path, all
  'tick' in driver taxonomy — i.e., during the day's ticks, not
  inside a driver sortie call), 24 fought-with-no-lingerers
  (genuine), 1 moved-on (valve). No sortie-call resolutions at all,
  same as r53.
- D3 death accounting: PARTIAL (capture GO, attribution still
  gapped). The d121 sortie entry's deathsDuringSay DOES capture the
  Dina death lines (4 lines, including "Dina faced The Ugly Thing at
  the treeline... and didn't come back"), while deathsDuring
  (roster diff) stays [] — the r53 Dina class reproduced exactly.
  But the analyzer's mismatch metric reports [] because name
  attribution matches only ROSTER names, and Dina is not on the
  roster. The gap is now precisely located: line capture works,
  name sourcing doesn't. The fix for the next run is in the record
  itself: the sortie line reads "SORTIE — Dina, Yawo take up arms" —
  muster names must be parsed from the SORTIE line, not the roster.
  (Corpses confirm the full d121–d122 toll: Dina d121, Yawo and
  Pablo d121-night per the Codex, with kill narration in the d122
  "things you missed" catch-up — ordering explained, not a bug.)
- D4 contest verifiability: GO — 19/19 convo records carry a
  playerContests snapshot. The r53 unverifiable line is now
  VERIFIED: 9405 d32 Marco's "The Secret Deck. They just... took
  you" lands with a snapshot showing contestsSeen including
  'secrets' (held=5 by d32), and contests.js routes id 'secrets' to
  the Secret Deck contest ("${p} has been taken"). The NPC line is
  grounded in a contest the player actually played.
- D5 price honesty: GO — pantryDelta == -paid EXACTLY on 6/6 ok
  attempts (panel paid 31,068 kcal, matching r53 to the kcal).
- D6 people check: GO — 19 convos driven, 0 fabrication flags
  (r50 regex). Read in full this round: 9407 d120 Sanne (Lucas gone,
  "the world just... continues" — grief that refuses consolation
  logic) and 9406 d122 Fatima (names the actual dead — Dina, Yawo,
  Pablo — the day after they fell; "The fire doesn't care" is the
  truest siege line in the panel). The engine tracks repetition
  ("You asked me that before. It's a different question now") — the
  opposite of a filler loop. All 19 convos this panel are
  sheltered-two-days-after; no defender-on-raid-day convo fired.
- D7 beat availability: GO — 6/6 early-resolution instances
  classified beat-alive (gorge lines and/or driven sorties after
  the resolution day in every case).

## Panel totals

- Attempts 6: ok 6, refused 0. Clears 4 (9406 d70; 9407 d113, d118,
  d122). Breaks 2 (9405 d48 vFlee; 9406 d121 vDie — the march's
  leader died). Sortie fights 10. Paid in rations: 31,068 kcal.
  Gorged: 65,253 kcal over 38 nights.
- Raids 31. Convos 19, fabrications 0. Resolutions 31 (30 'fought'
  via tick, 1 'moved-on' via valve). Sortie-call resolutions: 0.
- Early resolutions (new census): 6 — 9406 d67 (2 lingerers, 11
  gorge nights / 22,028 kcal after, 2 sorties after), 9406 d117 (1,
  8 / 18,220, 1), 9406 d121 (3, 2 / 6,000, 0 — horizon end), 9407
  d110 (2, 16 / 30,027, 3), 9407 d114 (2, 10 / 20,151, 2), 9407 d119
  (2, 2 / 4,700, 1). All beat-alive.
- Drift labels: moved-on-valve 1, player-drawn-off 4, sortie-clear
  7, unknown 0.

## Village assessment (plain words)

The siege is still a tax the village pays twice, but this run proves
the second payment is collectible: the village CAN march after being
told the door is quiet, and it does. 9405 ends on empty stores with
3 alive — the thin edge of winnable, same as r53. 9406 ends with 3
alive (Fatima, Ji-min, Waimarie) and 21,878 kcal — thinner than it
looks, because the d121 night took the whole muster generation:
Dina at the treeline, Yawo and Pablo to the same lingerers the next
night, and Fatima is left doing the remembering properly. 9407 ends
with 6 alive and 2,500 kcal — intact but thin. The people grieve
specifically and correct the record (Fatima's d122 roster of the
dead matches the corpses exactly) — they read as people, and the
conversation system now proves its lines against played history
instead of asserting it.

## Metric review (§14)

No metric was re-scored mid-run. Notes for the NEXT run:
1. D1 reset logic needs a live re-linger: keep the episode fields
   and watch for a cleared/drifted object returning. Until one
   fires, the reset is code-reviewed, not proven.
2. D3 attribution fix (concrete, from this run's record): parse
   muster names from the SORTIE line ("SORTIE — Dina, Yawo take up
   arms") and match death lines against roster ∪ muster names.
   The current roster-only match will miss every non-roster muster
   death by construction.
3. The aidFight-check question stays Steve's call (filed r53, proven
   here as narration-only cost). If he rules for the check, the
   proof test is this run's census: re-run the panel and the 6
   early resolutions must go to 0 without stranding a siege.
4. Stare-down soft spot, fourth sighting (r50/r51/r53 + now): the
   d121 march stared down two lingerers for free (0 rounds) before
   dying on the real fight. Still Steve's call, still documented.
5. Open items carried forward (documented, not fixed): (i) dead
   discoverer's orphaned fireside entry (r51, Steve's call); (ii)
   unfed marches proceed (r50, Steve's call).

## Telemetry check

Ran `telemetry-check.js` against `telemetry-baselines/crisis.json`
(metrics defenderFights, playerFights, defendedCount,
latelyDefenseCount) on the r54 files. Two LOUD lines fired, both
EXPLAINED, not bugs (same as r53):
- defenderFights 95 -> 0: vocabulary mismatch. The journey
  instrument records the same concept as `defendedFights` — same
  order of magnitude, no disappearance. The baseline's key name
  differs from the instrument's field name.
- defendedCount 21 -> 0: no such field exists in journey records
  (a convo-instrument count, not a journey field).
playerFights and latelyDefenseCount are 0 -> 0 (quiet). The baseline
was NOT rolled forward: overwriting a convo-instrument baseline with
journey-instrument numbers under mismatched keys would destroy its
meaning. The mapping fix (defenderFights -> defendedFights) remains a
proposal for the next run, not a silent rewrite.

## Reachable / fun / winnable (leg 6)

- REACHABLE: yes — raids, lingerers, gorges, sorties, refusals,
  drifts, early resolutions and all exits fired in a 3-seed pilot
  without intervention beyond the delayed rule, on the new base.
- FUN: mixed, same shape as r53 but sharper — the march itself is
  legible and costly, the people are real and now provably
  grounded, but the "door is quiet" line landing mid-siege still
  undercuts the siege's tension. This run bounds the damage: it
  costs the narration, not the player's options. A player who
  trusts the "all clear" and stops marching will keep bleeding —
  which is itself a legible (if harsh) lesson, but the game should
  not teach it with a false sentence.
- WINNABLE: yes — all three villages reached the horizon alive,
  including the one that ended on 0 kcal.

## Files

- Driver: `scripts/journey-crisis-r54-delayed-20261027.js`
- Analyzer: `scripts/analyze-crisis-r54-delayed-20261027.js`
- Per-seed (NEW BASE fc57dd0bd):
  `hidden_files/evidence/2026-10-27/journey-crisis-r54-delayed-seed{9405,9406,9407}.{json,log}`
  + `journey-crisis-r54-seed{9405,9406,9407}-d*.txt` transcripts
  + `journey-crisis-r54-analyzer.txt`
- Pre-registration:
  `hidden_files/evidence/2026-10-27/journey-crisis-r54-prereg.md`
- Smoke: `hidden_files/r54-smoke/` (3-day boot check, seed 9405)
- Control: pilot reproduced r53's new-base pilot exactly (see Base
  note) — no separate control run needed; determinism + base
  neutrality is the control.
