# sim-scholaraway-b — DIAG: is scholar-away structural, or seed variance?

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T1130Z,
axis food-economy, arm sim-scholaraway-b. Worktree sim-scholaraway-b,
branch sim-scholaraway-b. Answers Loop B 1030Z round next blank #5,
"scholar presence before any scholar-supply lever".
DIAG ONLY: zero src/js changes, zero policy-default flips, zero edits
to any existing policy file or existing script. New files only:
prereg, scholaraway trace driver, scholaraway analyzer, proof test
(including the positive control), a non-judged diagnostic probe,
evidence, censuses/corpora. The absencehunt splitter is REUSED
VERBATIM (hence the corpus filenames' absencehunt-b- prefix). This
worker does NOT push, bump, verify live, or merge into master; the
coordinator merges. Status to coordinator: committed on branch,
pending coordinator merge.

## Verdict: NO-GO / killed-at-pilot for the STRUCTURAL-ABSENCE claim

Prereg: evidence/2026-11-01/sim-scholaraway-b-prereg.md, commit
9f790919d, written and committed BEFORE any judged sim. Its verdict
rule, applied exactly as written:

STRUCTURAL required ALL of: (a) homecomings 0 on >= 7/8 seeds,
(b) unload 0 on 8/8, (c) haven-evenings <= 2 on every seed,
(d) a named mechanism. The pilot meets ONLY (b):

- (a) FAILED outright, in the opposite direction: homecomings
  (non-death-path returnToVillage calls) number 19, 27, 28, 31, 19,
  28, 28, 28 across seeds 51101-51108 — the scholar comes home
  constantly, not never.
- (c) FAILED outright: haven-evenings (scholar's own tile IS the
  haven tile at evening) are 18, 30, 30, 29, 22, 30, 27, 30. Four
  seeds never spend a single evening away.
- (b) PASSED: unload is exactly 0 kcal on 8/8 seeds — supplyleg's
  supply number reconciles seed for seed.

So the verdict word under the prereg is VARIANCE (the structural
hypothesis is NO-GO), and per the prereg there is NO confirm spend:
killed at pilot, evidence only. But "variance" undersells what the
pilot actually found, so state it sharply: this is NOT "some seeds
home, some not." The scholar is home on nearly every seed AND
unloads nothing. The zero is real; the absence explanation is
false. The zero is a KEEP-THRESHOLD zero, not a presence zero (see
Mechanism). Any future "scholar supply" lever must address the
keep/give split (and the depositgate keep), not scholar presence.
Presence is not the blocker and never was in this window.

## The answer in one paragraph

Under competent play the scholar sleeps at home most nights (22-30
of 30 evenings on surviving seeds), walks onto the haven tile
19-31 times per seed, and still unloads exactly zero finished food
into the pantry — because the homecoming haul block keeps the
first 2,000 kcal for the road, raised to 6,000 kcal while the
depositgate is engaged (pantry plentiful, >4 fresh days), and the
scholar's finished-food pack at return never exceeds 3,720 kcal.
The pack the scholar actually carries home is mostly unknowns —
not food until identified — plus materials: on seed 51105's last
away evening the pack holds 92 units and 0 finished kcal. The
scholar's food does reach the pantry, but through the donate path
(donateToPantry: 1,360 / 605 / 1,300 kcal on seeds 51102 / 51105 /
51106), not through unload. Supplyleg's "camps wild all month"
explanation for seed 51105 is corrected below: the away stretch
is 8 days (12-19), not the month, and it ends with the scholar's
death by sickness on day 19 and the mantle passing to a successor
who is home from day 20 on.

## Pilot gates (all passed, before judging)

(1) POSITIVE CONTROL: scripts/test-scholaraway-b.js, 30/30 checks
green, including the constructed homecoming (real game, driver's
own wrappers, 3,000-kcal pack, returnToVillage called directly):
one homecoming recorded, unload kcal > 0, deposit logged inside
the return with a returnToVillage stack. A zero from this recorder
is a real zero, not a broken recorder.
(2) COMPLETE CAPTURE: every pilot seed yielded full evening
snapshots (map coords, haven coords, playerAtHaven value all
non-missing) plus a say-line capture. Analyzer completeCapture
true on 8/8.
(3) INSTRUMENT NEUTRALITY: the driver contains no travelTo, eat,
or other state-moving call in the judged path — returnToVillage
appears only as the counted wrapper. Wrappers count; they do not
move the scholar.

## Presence census (30d competent window, seeds 51101-51108)

havenEve = evenings on the haven tile (primary). atHavenEve =
playerAtHaven() true (distance <= 1, adjacent included).
adjacent = atHaven but not on tile. homeLive = returnToVillage
calls with Game.over false at entry (see caveat on the day-19
call). unload = deposit kcal inside a return OR with a
returnToVillage stack. Full per-seed census:
evidence/2026-11-01/sim-scholaraway-b-census.json; per-seed
corpora (snapshots + say lines):
evidence/2026-11-01/sim-scholaraway-b-corpus/.

| seed | end | alive | havenEve | atHavenEve | adj | awayEve | longestWild | homeLive | unload | donate | hungerLines | campWildLines |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 51101 | village-lost | 25 | 18 | 18 | 0 | 7 | 7 | 19 | 0 | 0 | 13 | 7 |
| 51102 | survived | 30 | 30 | 30 | 0 | 0 | 0 | 27 | 0 | 1360 | 23 | 0 |
| 51103 | survived | 30 | 30 | 30 | 0 | 0 | 0 | 28 | 0 | 0 | 24 | 0 |
| 51104 | survived | 30 | 29 | 29 | 0 | 1 | 1 | 31 | 0 | 0 | 15 | 0 |
| 51105 | survived | 30 | 22 | 22 | 0 | 8 | 8 | 19 | 0 | 605 | 17 | 8 |
| 51106 | survived | 30 | 30 | 30 | 0 | 0 | 0 | 28 | 0 | 1300 | 26 | 0 |
| 51107 | survived | 30 | 27 | 29 | 2 | 3 | 2 | 28 | 0 | 0 | 12 | 3 |
| 51108 | survived | 30 | 30 | 30 | 0 | 0 | 0 | 28 | 0 | 0 | 24 | 0 |

Notes on the table:
- Returns can exceed days (51104: 31 returns in 30 days): the
  scholar can step onto the haven tile more than once in a day
  (out-and-back trips). Evening position therefore UNDERSTATES
  travel: a scholar home at evening may still have traveled that
  day — the homecoming calls prove it.
- Adjacent evenings are rare (2, both on 51107): the scholar is
  almost never camped one tile out at evening. The adjacent-tile
  middle category the prereg worried about is nearly empty here.
- Camp-wild say lines map EXACTLY onto away evenings (51105:
  days 12-19 = 8 lines = 8 away evenings; 51101: days 7-13 = 7 = 7;
  51107: 3 = 3). Camp-wild is a faithful away marker.
- Away-evening activity (daily-phase day lines only; sleep-phase
  lines are excluded by construction — see metric review):
  travel lines dominate (51101: 38 on 7 away evenings; 51105: 23
  on 8), forage lines present (17 / 9), combat lines present
  (7 / 5), teach lines 0 on away evenings. The away scholar
  travels, forages, and fights; it does not teach from the wild.

## Mechanism (named, prereg item (d) — for the record, since the verdict is NO-GO)

The mechanism that WOULD have explained a structural zero does not
exist. The mechanism that explains the actual zero is the haul
keep/give split in returnToVillage (game.js), verified three ways:

1. CALLERS (probe, non-judged, seeds 51102 + 51105):
   evidence/2026-11-01/sim-scholaraway-b-probe.jsonl. On 51102,
   27/27 live returns come from the travelTo haven-tile PIN
   (game.js:12690) via the competent policy's own walkTo — genuine
   walk-home steps, not engine phantoms. On 51105, 18/19 are the
   same PIN; the 19th is the endDay failure-branch call
   (game.js:32198) on day 19, the player-death day (brought 0 kcal,
   pantry fresh days 1.94 — see caveat below). Probe return counts
   reproduce the judged counts exactly (27, 19).
2. THE KEEP (code + probe gate reads): the haul block keeps the
   first KEEP_KCAL of finished food and gives only the excess:
   2,000 base, 6,000 while _depositGateEngaged() (gate on AND
   pantryFreshDays > 4, unless hungryStreak >= 3). Probe reads:
   gate engaged on 27/27 live returns (51102) and 18/19 (51105);
   pantry fresh days at return 5.8-26.4 (51102) and up to 25.5
   (51105). Maximum finished-food pack at any return: 3,720 kcal
   (51102), 3,025 (51105) — both below the 6,000 keep. Give is
   empty on every return by arithmetic, not by absence.
   Corroboration in the judged corpora: "nothing extra for the
   pantry" lines on the pack-carrying seeds (51101: 10, 51102: 21,
   51105: 13, 51106: 20, 51107: 8) and "bursting past tomorrow"
   lines (51102: 2, 51105: 2, 51106: 4 — the raised-keep voice,
   which fires only when kept > 2,000 under the raised keep).
   Pantry-cap lines: 0 on all seeds — the cap never binds.
3. THE PACK (judged corpora): finished-food pack kcal at return
   averages 0-844 per seed and is 0 on every return on seeds
   51103/51104. What the scholar carries is unknowns and
   materials, not finished food. Seed 51105 day 19 (last away
   evening): pack 92 units, 0 finished kcal, scholar kcal 2,232
   after eating — the trip's haul is unidentified greens, which
   the haul block cannot pool (brought counts finished food only).

What this means for the next lever: with DEPOSITGATE engaged, the
scholar would need a finished-food pack over 6,000 kcal to unload
anything at all — roughly double the largest pack observed. With
the gate off (keep 2,000), the observed packs (up to 3,720) WOULD
unload on the big days. Whether the 6,000 keep is doing its
intended job (keeping road food in the pack while the pantry is
plentiful) or silently killing the unload path is a design
question for the coordinator/Steve, not a verdict of this arm.
This arm's verdict is only: presence is not the blocker.

## Correction to supplyleg (stated, not smoothed)

sim-supplyleg-b.md said seed 51105's scholar "camps wild the whole
month." The census refutes the "whole month": 51105 evenings are
home days 1-11, away days 12-19 at tile (1,7) (distance 6), home
days 20-30. Supplyleg's transcript note ("camp wild recurs from
day 12 on") is consistent with an 8-day stretch misread as the
month. The unload zero survives the correction; its explanation
does not. The backlog item "SCHOLAR-AWAY STRUCTURAL ZERO" should
be reworded to "SCHOLAR-UNLOAD KEEP-THRESHOLD ZERO" (coordinator
action): unload 0% by the keep arithmetic, not by scholar absence.

## Sense test (SENSE-TESTING LAW: read, don't just count)

Seed 51105 away stretch (days 12-19): the scholar reads like a
person on a working trip with a reason to stay out, not like a
policy that forgot the walk-home order. Day 12: a haven breach
crisis, a beast fight won with a hunting spear, then "Travel 2
tiles to meadow." Days 15-16 at (1,7): foraging unknown nuts and
roots ("Not food until identified — sort them at camp"), learning
a Hummice counter, making a snare — while hungry (scholar kcal
12 on day 15, 0 on day 16) and repeatedly hitting a washed-out
path ("The path is washed out." x4 daily — the trip's real
friction, and a robotic repetition note: the same refusal voice
four times a day). Day 19: the scholar dies of sickness while
away (deaths list: player True, sickness); day 20's successor
walks home honestly: "Travel 1 tile to Haven. You keep a day's
food (710 kcal) — nothing extra for the pantry this time. ...
You walk back into Haven. 19 Codex entries. The village is glad
to see you." The keep logic narrates itself; the homecoming beat
lands.

Seed 51102 (never away): the scholar is home all 30 days and the
"Hunger gnaws. The pack is thin…" line still fires on 23 days.
That refutes the away-stretch framing of the repetition note too:
the hunger line is a daily hunger-threshold beat (fires when the
day's kcal dips under 1,200), at home just as much as away. It
repeats verbatim near-daily on 51105 (17 days) and 51102 (23
days) — robotic by repetition, not broken, and not an away
marker. The repeated hunger beat and the washed-out x4 are the
two sense notes; both are prose/voice issues, not blockers.

## Wall numbers (as measured in-window; wall NOT measurable here)

This 30d pre-seat window cannot measure national / table / wins:
no seed can reach national in 30 days, and none does. What
runDays returns in-window: 7/8 seeds survived 30 days; seed 51101
village-lost day 25 (the same 3-hungry-nights shape supplyleg
found, with a 7-evening away stretch days 7-13 before the end);
maxWaveUnlocked 1-2 (wave 2 on six seeds, wave 1 on 51101/51106);
wave kills recorded in the census file. National 0, table 0,
wins 0 IN THIS WINDOW ONLY — not a wall movement claim. The wall
numbers stand as last measured (Loop A lane). Balanced panel
(§15): inapplicable per the prereg declaration (single-arm
census, no lever, no second panel to compare; no compare
fabricated).

## Caveats and attribution limits (honest, per prereg)

- HOMECOUNT CAVEAT: the prereg's live-homecoming filter excludes
  only Game.over=true calls. The probe shows one counted "live"
  homecoming (51105 day 19) is actually the endDay failure-branch
  call on the player-death/mantle-pass day — over false at entry,
  but not a step home. True step-home counts are therefore 18,
  not 19, on 51105; other seeds may carry at most a similar
  one-call distortion (death days only). The verdict is
  unaffected: step-home counts remain 18-31, not 0.
- EVENING POSITION UNDERSTATES TRAVEL: returns exceed days on
  51104 (31/30) and homecomings fire on days the scholar ends at
  home — out-and-back trips within a day are invisible to evening
  snapshots. Presence at evening is a lower bound on coming home,
  which only strengthens the NO-GO.
- DAY-LINE BUCKETS EXCLUDE SLEEP-PHASE LINES: dayLines are sliced
  during daily() only, so sleep-phase lines (including "camp wild
  tonight") never enter awayBuckets — the analyzer's campWild
  bucket is structurally 0 and must NOT be quoted. Camp-wild
  counts in this evidence come from the full say-line corpus.
- Single policy (competent) by prereg design, 30-day early window
  only. Other policies and later windows may shape differently.
- The probe is NON-JUDGED diagnostics: its numbers never enter
  the census or the verdict rule; they only name the mechanism
  and the caller. The judged verdict rests on the driver census
  plus code reads.
- Infrastructure note: the host's intermittent write/process flap
  struck the probe's file redirects repeatedly (0-byte outputs,
  fast silent exit-1 runs, same command succeeding minutes
  later). No judged data was affected (pilot jsonl + split
  verified by byte counts and readback); the stacks probe file
  was dropped as redundant because probe.jsonl already carries
  the caller frames.

## Metric review (for the NEXT run; this run judged against its header)

- Homecoming counting must be stack-aware: exclude endDay
  failure-branch calls (game.js:32198), not just Game.over=true
  calls, or death days inflate step-home counts by one.
- Evening position alone understates presence dynamics: the NEXT
  presence census should count intraday returns (homecoming
  calls) as a primary metric alongside evening position, since
  out-and-back days are the norm here, not the exception.
- Day-line slicing must include the sleep phase, or sleep-phase
  narration (camp-wild, meal lines) will keep vanishing from
  activity buckets. Attribute sleep lines to the day just ended,
  not to the next day's window.
- The hunger line must not be used as an away marker in future
  sense reads: it fires on home days at the same rate. Its
  repetition is a voice-fatigue note, full stop.
- Proposed NEXT lever (for the coordinator, not this arm): a
  depositgate-keep arm — measure unload with DEPOSITGATE=0
  (keep 2,000) on identical seeds, where the observed packs
  (up to 3,720) predict nonzero unload on big-pack days. That
  tests whether the keep threshold, not presence, is the live
  scholar-supply lever. Presence work on this axis is DONE
  unless a new window or policy reopens it.

## Findings for backlog (for the coordinator to append)

- SCHOLAR-UNLOAD KEEP-THRESHOLD ZERO (correction of
  SCHOLAR-AWAY STRUCTURAL ZERO): scholar-unload 0% is a keep
  arithmetic zero (depositgate keep 6,000 vs max finished pack
  3,720), NOT a scholar-absence zero — scholar home 22-30
  evenings, 19-31 returns per seed. Reword the backlog item.
- DEPOSITGATE KEEP vs SCHOLAR PACK (next lever candidate):
  with keep 6,000, no observed scholar pack unloads; with keep
  2,000, big-pack days would. Needs a design call on whether the
  raised keep is working as intended.
- WASHED-OUT RETRY VOICE: "The path is washed out." fires x4
  daily on blocked away days (seed 51105 days 15-19) — robotic
  repetition note, same class as the hunger-line note.
- HUNGER LINE NOT AN AWAY MARKER (correction): fires verbatim
  near-daily at home too (seed 51102: 23 days, never away).
  Voice-fatigue note only.
