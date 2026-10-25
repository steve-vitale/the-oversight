# Journey crisis r49 — THE QUIET LINGERER, ANSWERED (lane B, leg 6)

Direct handoff from r48's TWO open items (2026-10-24):
1. Tracer gap: the 9405 Ugly Beast's linger→wander transition was voiced
   by the game but NOT recorded by the r48 tracer (outside the five
   wrapped ticks).
2. Quiet lingerers (voice gap, 2 instances in r48): drafted lingerers
   that never gorged and never got an unmet line — 9406 callback (d97)
   and 9408 focus_group (d80) — persisting with no voice at all.

Pre-registration: `hidden_files/evidence/2026-10-24/journey-crisis-r49-prereg.md`
Instrument: `scripts/journey-crisis-r49-quietlinger-20261024.js` (new;
r48's tick tracer + a DAY-BOUNDARY census no tick can dodge + precise
gorge attribution by havenGrowthDaily loop-order alignment + post-drift
wild-fight tracking). Policy: oracleV2, 120d death-aware (+10d tail).
Per-seed records: `hidden_files/evidence/2026-10-24/journey-crisis-r49-seed{9405..9409}.{json,log}`
plus sheltered-transcript txt files (32 convos driven).

## Headline verdict: NO QUIET LINGERERS. The r48 voice gap does not recur.

Across 5 seeds, 48 raids, 37 unmet lines, 100 gorge nights, 36 drafted
lingerers and 24 day-boundary exits, ZERO lingerers meet the refined
quiet definition (persisted at least one day boundary, 0 attributed
gorge nights, no unmet line). Every single exit has a named explanation.
And the r48 tracer gap is now closed mechanically: the linger→wander
shape (drift close, then the same beast fought in the wild afterwards)
was captured on 9409 — gavel, drift d103, wild fight d106.

## Pre-registered verdicts (§14 — bindings, not re-scores)

- M1 exit explanation: GO — 24/24 day-boundary exits explained
  (15 spliced / combat-killed with a removal record, 5 drift-voiced,
  4 moved-on-voiced, 0 unexplained). The tick tracer alone caught only
  13 tick events against 24 exits: combat-path exits (a lingerer killed
  in a defended/player fight) happen OUTSIDE every wrapped tick, and only
  the day-boundary census + removal records explain them. That is the
  r48 gap, characterized: tick tracing is a secondary instrument now;
  the day-boundary census is the instrument of record.
- M2 wander capture: GO (recorded, not vacuous) — 9409 gavel: drift
  close d103 ("paces the treeline one last night"), then 4 wild fights
  starting d106 (first outcome vFlee). This is the r48 Ugly Beast shape
  with a paper trail. The other 4 drifted beasts were not fought again
  in-window — the capture is the mechanism working, not a guarantee.
- M3 quiet-lingerer rate: NOT CONFIRMED, no fix — 0 quiet lingerers
  against a bar of ≥3 (and ≥2 voiceless at exit). The r48 instances stay
  a 2-instance curiosity: neither recurs on the same seeds (timelines
  diverge, as r48's own 9405 rerun did), and no new case appears in 36
  drafted. Documented, not fixed — a voice line for a never-gorging
  lingerer would be a fix in search of a bug on this evidence.
- M4 regression (r47/r48 filter holds): GO — 0 corpse-drafted across
  36 drafted lingerers.
- M5 people check: GO — 0 fabrication flags in 32 sheltered convos
  (transcripts below).

## Why the pilot nearly misled (instrument honesty)

The v1 instrument used display-name matching for gorge attribution and
flagged 2 "quiet" lingerers on 9405 — both false. One was a name
collision artifact (5 ambiguous matches in 27 gorge lines), the other a
category error: beasts drafted at a raid tick but gone before the next
day boundary were counted as lingerers that "never gorged." The v2
instrument fixes both: gorge lines are attributed by loop order inside
havenGrowthDaily (100/100 gorge lines aligned on all 5 seeds, zero
ambiguity), and drafted-but-never-at-a-boundary beasts are reported
separately as TRANSIENT (6 panel-wide: drafted, fought or lifted the
same day, never owed a night's voice). The refined quiet definition
requires at least one day-boundary presence. Lesson for the next
instrument run: name matching is not attribution; loop order is.

## Per-seed summaries

- 9405: 10 raids, 27 gorge nights, 7 exits (6 spliced, 1 moved-on).
  Village wiped (0 alive, pantry 0, game-over d116). 7 convos, 0 fab.
- 9406: 8 raids, 18 gorge nights, 3 exits (1 spliced, 2 moved-on —
  TWO distinct callback entities, hp 231 and 203, drafted at the same
  d100 raid; the duplicate day/id exit lines are two beasts, not a
  double-count — id collisions across entities are exactly why the
  tracker keys on object identity). Nearly wiped (1 alive, pantry 0).
  3 convos, 0 fab.
- 9407: 11 raids, 12 gorge nights, 2 exits (both drift-voiced).
  Survived to horizon, 6 alive, pantry 21,460. 8 convos, 0 fab. One
  tracer footnote: the d120 cliffhanger drift has no tick event (the
  flag-clear happened outside the wrapped ticks) but IS drift-voiced —
  explained by the day-boundary record, which is why M1 counts
  day-boundary explanations, not tick events.
- 9408: 9 raids, 27 gorge nights, 7 exits (5 spliced, 1 drift, 1
  moved-on). Nearly wiped (1 alive, pantry 0). 6 convos, 0 fab.
- 9409: 10 raids, 16 gorge nights, 5 exits (3 spliced, 2 drift).
  Thrived to horizon, 8 alive, pantry 42,457. 8 convos, 0 fab. The
  wander capture lives here (gavel, above).

Panel totals: 48 raids, 37 unmet lines, 100 gorge nights (100 aligned),
36 drafted, 13 tick events, 24 day-boundary exits, 0 quiet, 6 transient,
1 wander capture, 32 convos, 0 fabrication flags, 0 sorties (below).

## Village assessment (plain words)

The siege still reads as a season, not a script. When the village meets
raiders at the door, the leftovers linger and eat — 100 gorge nights,
each one priced in the open — and then one of three honest things
happens: somebody kills them (15 of 24, the common end), they drift off
after about six nights with a farewell line (5), or the crisis goes
quiet and they move on (4). Nothing evaporated. The two villages that
nearly died did so with empty pantries and one survivor each — the
gorge is a slow bleed that matters — and the two that lived did so with
stores from 21k to 42k. Survival here is whether the defense holds and
the stores last, not a single number.

## Transcripts (sense-testing: 32 convos, 0 fabrication flags)

Read in full on 9405 (7) and 9409 (8); spot-checked on the other seeds.
The wants are real: Nkosinathi's festering wound ("If it festers I'm no
good to anyone — can't haul, can't hunt, can't watch") with an honest
positional blocker ("Move next to them, on the same side of the Haven
door, to help"); Tariq's laugh-want ("I want one day where I laugh
until it hurts and it's not from nerves" — a want, not flavor).
Arjun's first-memory exchange is honest about invented memory ("Or I
invented it. First memories are half real and half the story you
needed"). The Nevermore tell is real knowledge (shadow detaches at
dawn/dusk). Driver-loop notes, not dialogue bugs: the favor_requirements
loop (3 identical picks) and dlg:more chains show the policy hammering
one option — the NPC escalations stay honest ("As I said —", "Like I
said —", "I've told you what I've told you"), but the well is shallow
on repeat asks. Same class as r48's note; no fix from this leg.

## Reachable / fun / winnable (crisis leg)

- Reachable: YES — raids on 5/5 seeds (48 total), lingerers, gorges,
  drift closes, moved-on resolutions, wipes and survivals, and now a
  captured wander re-entry.
- Fun: YES with the carried sortie caveat — the siege reads as real
  pressure, and every exit is now accounted for. The gorge text still
  offers a sortie nobody uses (0 sorties across r48 + r49, 10 seeds):
  a competent-policy backlog item, not a game blank — the verb exists
  for a human player, the bot just never takes it.
- Winnable: YES — 2/5 villages survived to horizon; the 3 that didn't
  were earned (combat attrition + empty pantries), not scripted.

## Metric review (§14)

No metric was revised mid-run. Two metric notes for the NEXT crisis run:
1. M1's denominator should stay day-boundary exits (24 here), NOT tick
   events (13) — ticks undercount combat-path exits by design.
2. M3's quiet definition must keep the boundary-days ≥ 1 clause — the
   v1 definition (no boundary requirement) false-flagged transient
   drafted beasts, and name-matched gorge attribution false-flagged
   through collisions. Both traps are now documented in the instrument
   header. Transient drafted (6 here) is a separate count, not a
   quiet-lingerer count.

## Telemetry check

New channel seeded: `hidden_files/telemetry-baselines/crisis-quietlinger.json`
(dayBoundaryExits 24, quietLingerers 0, wanderCaptures 1, drafted 36,
gorgeAligned 100, sorties 0, tickEvents 13). The seeding run's LOUD
lines are the expected first-run artifact (baseline started as {} —
"newly appeared" against zero, not a deviation); the re-check against
the seeded baseline is quiet. The crisis-sickinvite baseline was NOT
rolled (r48 precedent: different channel).

## Regressions

No src/js change this run (observe-only leg outcome: no blank met its
fix bar), so no proof test is owed. Instrument self-proof: gorge
alignment 100/100 on all 5 seeds, and day-boundary exits reconcile
24/24. `check.js --quick` in the worktree: **280 passed, 7 failed**
(identical on a second full run — deterministic, not flaky). The 7:
godpath/test-measurement-comparison, test-measurement-proof-update,
test-measurement-workflow (proof-freshness), test-mobile-combat-cadence,
test-occupation-panels, test-phone-frame-proof (browser receipts), and
test-parity-20261014 (gear: spear/jacket). None references the new
instrument and the instrument is not on the green list, so none is a
regression from this run — they sit in areas other lanes touched today
and are flagged here for the ship loop / owning lanes, not fixed in
this leg run. Full log: hidden_files/checkquick-r49.log.

## Landing note (rebase, not a re-score)

Master moved during this run (lane A journey-establishment r34 + food
confirm landings), so the branch was rebased onto the new master in the
worktree (clean, 1 commit, no conflicts) and the proof re-run: seed
9409 on the rebased base reproduces the panel record EXACTLY (120d,
horizon, 10 raids, 12 unmet lines, 16 gorge nights, 16 aligned, 11
drafted, 2 tick events, 5 day-boundary exits, 0 quiet, 1 wander capture
— gavel d103→d106). The panel measurements above were taken on base
110eb84e0; the rebased instrument behaves identically on the new tip.
The safe-commit index clobber (staged-deletion variant) struck after
the first commit and was repaired with `update-index --cacheinfo`
before rebasing — the commit itself was correct throughout.

## Files

- Instrument (to commit): scripts/journey-crisis-r49-quietlinger-20261024.js
- This note (to commit): evidence/2026-10-24/journey-crisis-r49.md
- Pre-registration: hidden_files/evidence/2026-10-24/journey-crisis-r49-prereg.md
- Per-seed records (workspace, uncommitted — r47/r48 precedent):
  hidden_files/evidence/2026-10-24/journey-crisis-r49-seed{9405..9409}.{json,log}
  + sheltered-transcript txt files
- Telemetry baseline (workspace): hidden_files/telemetry-baselines/crisis-quietlinger.json
