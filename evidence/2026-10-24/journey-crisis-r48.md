# Journey crisis r48 — THE VANISHING LINGERER (lane B, leg 6)

Direct handoff from r47's OPEN BLANK: seed 9405 d85, The Terms of Service —
drafted alive (hp>0, passed r47's dead-draft filter), unmet ("Nobody met ..."),
then gone before its first gorge with no voice; the crisis resolved 'fought'
d86. r47: "If it recurs, the next run should instrument removeWorldMonster
for lingering entities." This run is that instrumentation.

Pre-registration: `hidden_files/evidence/2026-10-24/journey-crisis-r48-prereg.md`
Instrument: `scripts/journey-crisis-r48-vanish-20261024.js` (observe-only:
removeWorldMonster wrap + tick-boundary lingering diffs + per-day census).
Policy: oracleV2, 120d death-aware (+10d tail), one process per seed.
Per-seed records: `hidden_files/evidence/2026-10-24/journey-crisis-r48-seed{9405..9409}.{json,log}`
plus sheltered-transcript txt files (32 convos driven).

## Headline verdict: NO VANISH. The d85 shape does not reproduce.

Across 5 seeds, 48 raids, 33 unmet lingerer lines, 86 gorge nights, 163
defended fights, 39 lingering removals and 7 tick-boundary events, NOT ONE
linger­er disappeared silently. Every lingerer exit is one of: fought
(startCombat), wild-resolved (resolveWildMonsterEncounter, named caller),
flag-cleared WITH a voiced close ("paces the treeline one last night" /
"has moved on"), or truncated by horizon / village death. The r47 d85 shape
(unmet + no closing voice + 'fought' resolution) occurred ZERO times.

## Pre-registered verdicts (§14 — bindings, not re-scores)

- M1 reach: GO via the fresh-seed clause. The 9405 reproduction clause
  FAILED honestly: the rerun's timeline diverged from r47 (the Terms of
  Service appears in the d53 raid, met by Jovan and driven off, not in a
  d85 vanish). But 4/4 fresh seeds produced natural raids (10/12/9/11),
  satisfying the prereg's OR clause. The leg's siege content did not move.
- M2 trace completeness: GO with one tracer-gap caveat (below). Every unmet
  lingerer has a complete lifecycle record except the Ugly Beast's d66→d73
  linger→wander transition, which the GAME voiced but the TRACER did not
  record (the transition happens outside the five wrapped ticks).
- M3 vanish classification: GO — 0 UNEXPLAINED vanishes, 0 hp-to-zero
  vanishes. (a) spliced by named caller: 4 on 9406, all
  resolveWildMonsterEncounter wild resolutions (hushwolf d48/d116, landlord
  d110, mirrormoth d118). (b) flag-cleared + voiced: 9405 mirrormoth d91
  (havenGrowthDaily + "one last night" line), 9406 callback d104 (commsTick
  + "has moved on" line). (c) hp-to-zero: none. (d) other: none.
- M4 regression (r47 filter holds): GO — 0 corpse-drafted across 33
  drafted lingerers (minimum hp 1).
- M5 mechanism live: GO — 33 unmet lines panel-wide (9409 contributes 0;
  the question is live on the other four seeds).

## Per-seed summaries

- 9405 (reproduction): 6 raids (d8/42/53/66/84/97), 6 unmet, 23 gorge
  nights, 15 defended fights. The d84 mirrormoth is the closest analogue to
  the r47 shape — and it got the full treatment: gorges d85–90, staredowns
  d88–90, flag-clear + voiced close d91. The d66 Ugly Beast gorged d67–72
  (exactly the promised "~6 nights"), then LEFT THE TREELINE and re-entered
  the wild pool d73 ("It followed you"), fought/stared down d73–99. The
  village died out d101 (scholar down to an Eel discharge; "No one is left
  to pick up the Codex"). 6 sheltered convos, 0 fabrication flags.
- 9406: 10 raids, 15 unmet, 35 gorge nights, 31 defended fights. The
  busiest siege panel: 5 tick events (4 wild resolutions + the callback
  flag-clear/moved-on pair d104). One crisis resolved 'moved-on' d104 —
  the only moved-on in the panel. Survived to horizon, 4 alive, pantry
  6,037. 3 convos, 0 fabrication flags.
- 9407: 12 raids, only 5 unmet (all from the final d119 raid, fought in
  the +10d tail d120/122), 8 gorge nights, 48 defended fights. The
  defense-held pole: when the village meets everyone, lingerers barely
  form. 0 tick events. Survived to horizon, 6 alive, pantry 27,417. The
  d18 player death (Violet Ahmed) is mourned by name for the rest of the
  run — succession grief working as designed. 8 convos, 0 fabrication.
- 9408: 9 raids, 7 unmet, 20 gorge nights, 27 defended fights. 0 tick
  events; all lingering exits via startCombat. Village died out d82
  (Donnacha Healy, dehydration, last bearer; pantry 0 — the final gorges
  honestly took 0 kcal). The d80 lingerers (Spool, Ugly Beast, Bulldozer)
  were truncated by the wipe, not by a vanish. 7 convos, 0 fabrication.
- 9409: 11 raids, ZERO unmet, ZERO gorge, ZERO drafted — the control case.
  The village met everyone at the door every time (42 defended fights).
  The founder starved d6 (Sergio Sanders, player) and the village still
  thrived to horizon: 7 alive, pantry 42,629. 8 convos, 0 fabrication.

Panel totals: 48 raids, 33 unmet lines, 86 gorge nights, 163 defended
fights, 39 lingering removals, 7 tick events, 33 drafted, 0 corpse-drafted.
Crisis resolutions: 45 fought, 1 moved-on. Sorties sent: 0 (see below).

## The Ugly Beast draft gap — explained, not a vanish

The tracer's `drafted` snapshot missed the Ugly Beast on 9405 because (a)
raid-line display names do not map 1:1 to entity ids (the village renames
monsters: Ugly Beast → Ugly-Eyes → Old Ugly; Old Gavel fights as
nightcourt), and (b) the linger→wander transition is not a draft. The
beast's lifecycle is fully voiced in the narrative: unmet d66 → gorges
d67–72 → follows the player d73 → fought/stared down through d99. The
TRACER gap is real (the transition path is outside the five wrapped ticks
— a candidate wrap for a future instrument pass), but the GAME behavior is
voiced and sensible. No fix this run: observe-only per prereg, and the
mechanism is not a bug.

## Two open voice gaps (documented, not fixed — observe-only leg)

1. Quiet lingerers (2 instances): 9406 callback (drafted d97, never gorged,
   never got an unmet line, closed by the voiced moved-on d104) and 9408
   focus_group (drafted d80, never gorged, never got an unmet line,
   truncated by the village wipe). Both persisted in the lingering set;
   the gap is VOICE, not existence. A future voice pass should say
   something about a lingerer that never gorges — but neither instance is
   a vanish, and neither justifies a fix on this evidence alone.
2. Sorties: 0 sent across 5 seeds despite 86 gorge nights and gorge text
   that explicitly offers the sortie ("send a sortie: fighters, rations,
   real risk"). oracleV2 never sorties. This is a POLICY gap (the
   competent bot has no sortie verb in its repertoire), not a game blank.
   The gorge text promises a verb nobody uses — worth a line in the
   competent-policy backlog, not a fix here.

## Village assessment (plain words)

The siege is composed, and the composition holds under the tracer. When
the village meets raiders at the door, it fights — 163 real fights, with
villagers killing, fleeing, and dying in them, not outcome tables. When it
can't meet everyone, the leftovers linger at the treeline and eat: the
gorge is a real, priced pressure (up to 1,500 kcal a night), and after
about six nights the lingerer either gets fought, drifts off with a
voiced farewell, or walks back into the wild to haunt the roads. Nothing
in five seeds evaporated. The two villages that died did so loudly: one
to combat at the end of a long siege season, one to dehydration with an
empty pantry while monsters still paced the treeline. The three that
lived did so with pantries from 6k to 42k — survival is not a single
number here, it's whether the defense holds and the stores last.

## Transcripts (sense-testing: 32 convos, 0 fabrication flags)

Read in full. The mourning is grounded, not generated: Victor's d44 "We
lost Vera and Marco" checks out against the death notices (Vera killed by
the Terms of Service d42, Marco dead in a contest d44). James's long grief
for Violet on 9407 tracks the d18 player death through succession. The
German nod-learning arc (Sanne, d83→d105) progresses its vocabulary
catches visibly. Three false-identity confessions land cleanly (James the
"journalist" who was a Firefighter; Paul the "street artist" who was a
Midwife; Nora from "Denver" who is from Addis Ababa). Two buried-cache /
buried-food beats pay out real pantry kcal. Driver-loop notes, not
dialogue bugs: the d26 Rosa ask_field loop (11 identical picks) and the
dlg:more homily chains show the policy hammering one option — the NPC
deflections stay honest ("that's for another fire"), but the well is
shallow on repeat asks.

## Reachable / fun / winnable (crisis leg)

- Reachable: YES — raids on 5/5 seeds (48 total), waves 1 and 3, lingerers,
  gorges, drift-closes, moved-on resolutions, village wipes and survivals.
- Fun: YES with the sortie caveat — the siege reads as a real season of
  pressure (fights + gorges + voiced closes), but the offered sortie verb
  is dead weight until a policy uses it.
- Winnable: YES — 3/5 villages survived to horizon; the 2 wipes were
  earned (combat attrition, dehydration), not scripted.

## Metric review (§14)

M1's reproduction clause failed honestly and the prereg's OR clause
carried the verdict — that is the pre-registered rule, not a re-score.
No metric was revised mid-run. One metric note for the NEXT crisis run:
M2's "complete lifecycle" should explicitly exclude horizon/village-death
truncation (both occurred here and are not incompleteness), and the
tracer should add a wrap on the linger→wander transition path so the
Ugly Beast shape is captured mechanically next time. The r47 open blank
is CLOSED: the d85 vanish did not reproduce, no mechanism capable of
producing it was found on current master, and every lingerer exit in a
48-raid panel was fought, wild-resolved, voiced-closed, or truncated by
an honest end. A single historical observation that never recurs is not
a live bug.

## Telemetry check

`telemetry-check.js` against the crisis-sickinvite baseline (r46) prints
one LOUD line: wellPendings 1244 → 0. Investigated and explained as a
metric-mismatch artifact, NOT a game change: the r48 instrument is a
vanish tracer and never observes sick-invite pendings (its records carry
no wellPendings field, so the check reads 0). The other baseline metrics
are quiet (0→0; sickVetoes 1→0, below the LOUD threshold). Baseline NOT
rolled: r48 measures a different channel, and rolling it would corrupt
the sick-invite baseline. No vanish-tracer baseline exists yet — r48 is
the first run of this instrument.

## Files

- Instrument (committed): scripts/journey-crisis-r48-vanish-20261024.js
- This note (committed): evidence/2026-10-24/journey-crisis-r48.md
- Per-seed records (workspace, uncommitted — r47 precedent):
  hidden_files/evidence/2026-10-24/journey-crisis-r48-seed{9405..9409}.{json,log}
  + sheltered-transcript txt files
