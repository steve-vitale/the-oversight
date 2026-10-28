# Journey crisis r60 — THE GATE HOLDS, THE PANEL MOVED (lane B, leg 6)

Regression / guardrail panel for r59's aidFight gate, on the new
master. No game change in this run: zero src/js touched. The
question r59 retired (early 'fought' resolutions) is re-measured,
not re-litigated.

Pre-registration:
`hidden_files/evidence/2026-10-28/journey-crisis-r60-prereg.md`
Instrument: r59 driver/analyzer verbatim -> r60 (names, EVID,
policy id only).
Base at panel time: b898dff4a (master tip after sibling
wave4flip-b + homebirth-b landings; my branch was rebased onto
it before the panel ran, re-verified clean).
Policy: oracleV2, 120d death-aware (+10d tail). Delayed rule
unchanged.
Driver: `scripts/journey-crisis-r60-delayed-20261028.js`
Analyzer: `scripts/analyze-crisis-r60-delayed-20261028.js`
Per-seed records:
`hidden_files/evidence/2026-10-28/r60-panel/journey-crisis-r60-delayed-seed{9405,9406,9407,9408,9411,9413}.{json,log}`
plus r60-panel transcripts.
Analyzer output:
`hidden_files/evidence/2026-10-28/journey-crisis-r60-analyzer.txt`
Pin run (same-commit re-run, see below):
`hidden_files/evidence/2026-10-28/r60-pin/` + `r60-pin-analyzer.txt`

## Panel (r60 vs r59 after-panel)

| seed | r59 after | r60 |
| 9405 | game-over d106, 1 alive, 0 kcal | IDENTICAL (d106, 1, 0; same 8 resolutions) |
| 9406 | horizon, 5 alive, 8,479 kcal | IDENTICAL (same 8 resolutions) |
| 9407 | horizon, 7 alive, 36,127 kcal | horizon, 2 alive, 13,800 kcal; gorge 9->24, sorties 2->5, drifts 4->8 |
| 9408 | horizon, 8 alive, 23,829 kcal | horizon, 2 alive, 0 kcal; gorge 5->7, sorties 1->2, drifts 5->2 |
| 9411 | game-over d89, 0 alive, 37,155 kcal | IDENTICAL (d89, 0, 37,155; same 8 resolutions) |
| 9413 | horizon, 8 alive, 7,043 kcal | IDENTICAL (same 10 resolutions) |

4 of 6 seeds are outcome-identical to the r59 after-panel, with
matching resolution days. The two diverged seeds end the same
way (both horizon, as before) but thinner: the siege costs more
people and more stores on the new master.

## Pre-registered verdicts (§14 — bindings, not re-scores)

- B1 TRUE early 'fought' resolutions = 0: GO — TRUE 0 and
  legacy 0 on all 6 seeds. The r59 gate holds on the new master.
- B2 outcome flips vs r59 after-panel: PARTIAL — no seed flips
  its ending (horizon stays horizon, game-over stays game-over),
  but 9407 and 9408 move substantially inside the horizon, and
  the mechanic-level cause is NOT pinned (see Drift below).
  Reported as unexplained-at-mechanic-level, not passed.
- B3 price honesty: GO — pantryDelta == -paid on 10/10 ok
  attempts, deltaBad [] (12 attempts: 2 refused, both with the
  r58 refused-book guard holding: refusedDayIsLastSortie false).
- B4 death accounting: GO — muster-aware mismatches 0,
  bloodied deathsDuringSay lines 0, unattributed death lines [].
- B5 people check: GO — 0 fabrication flags (fabricHits 0 on
  38 driven convos); full transcripts read below.

## Drift investigation (the main work of this run)

First-divergence days, from a field-by-field diff of the
per-seed JSONs against the r59 after-panel:
- 9408: day 9. The first differing records are a day-9 feast
  (7x beans / 3 eaters -> 15x beans / 6 eaters) and a day-9
  contest say-line, before the first raid difference (day 17
  -> day 16, different raider set). The crisis cadence then
  re-times from day 46 onward.
- 9407: day 95-96. Raids match through raid 9; the first
  differing records are a day-95 say-line and the day-96
  gorge lingerer identity (Night Court -> The Bailiff). The
  late run then takes more sorties (5 vs 2) and loses more
  people (2 alive vs 7).

Pin run (same-commit re-run): seed 9408 was re-run on r59's
own landed commit a2a2a20f3 in a throwaway registered
worktree (journey2-crisis-pin, released as done-abandoned,
branch deleted, no commits). Result: TRUE early 0, deltaBad [],
mismatches [], alive 8, pantry 15,034 — close to the r59
after-panel (alive 8, pantry 23,829) but NOT identical: first
divergence day 116 (gorge kcal 2,000 -> 1,000; final raid
day 119 vs 118; final sortie day 119 vs 120). Conclusion in
two parts:
1. The instrument has a late-run wobble: even identical code
   re-runs diverge in the tail (day 116+ here). Panels must be
   judged on outcome bands, not byte equality in the tail.
2. The r60 divergences (day 9 for 9408, day 95 for 9407) are
   far earlier and far larger than the wobble, so they are
   real code-driven drift from the landings between r59's base
   and b898dff4a — NOT instrument noise. The candidate set is
   the post-r59 src diff (tackle-map game.js beyond-edge
   generation, calmbeast abilityActions, party self-invite
   guard, plus conversation/betrayal/titans touches); the
   mechanic-level bisection is NOT done and is the next run's
   job. No single landing is claimed as the cause here.

## Village assessment (plain words)

The door still tells the truth — no village was declared quiet
while teeth held the treeline — and the siege still bends
villages without breaking the leg. Four villages replay exactly
as before, which is the strongest form of this verdict. The two
that moved show the siege's cost, not a new failure: 9407
survives but is gutted (two standing, stores thin after five
sorties and twenty-four gorge nights); 9408 survives with two
standing and empty stores, where it once held all eight. The
losing branches are unchanged and honest: 9405 dies out slowly
with one person left and nothing in the pantry; 9411 dies out
with a full pantry (37,155 kcal) — killed by the fighting, not
by hunger, which is the siege working as designed. 9413 holds
all eight, poor but whole.

## People check (full transcripts read)

- 9405 d51, Marco: grieves Obure ("I dreamed Obure was still
  here. Woke up angry at the dream."), picks up Obure's share
  of the work. Grief with a consequence, not a line.
- 9406 d19, Leo: teaches monster tells (Living Wire water,
  Anaconda Empress ripple), names plants, asks for help hauling,
  gives a kept tool, and circles back to whether the player has
  hurt someone. The NPC wants something (help, honesty) and the
  exchange resolves.
- 9407 d52, Amanda: "Zoe always took the burnt piece. Said
  someone had to. I take it now." / "We bury, we grieve, we
  keep going. There's no step four." A ritual passed on, not
  invented history.
- 9408 d9, Paul: shows a private thinking place ("Don't tell
  the others"), presses the unsettled ambush of Theo — the
  story splits, holds, and is judged rehearsed-or-true. A real
  investigation beat, with the player driving it.
No fabricated shared history, no filler loops, no static menus
in the read transcripts. 0 fabrication flags, matching the
analyzer count.

## Telemetry check

Ran `telemetry-check.js` against
`telemetry-baselines/crisis.json` (defenderFights, playerFights,
defendedCount, latelyDefenseCount) on the 6 r60 panel files.
Two LOUD lines, both EXPLAINED, same as r53/r54/r57/r58/r59:
- defenderFights 95 -> 0: vocabulary mismatch. The journey
  instrument records the same concept as `defendedFights`
  (210 defended fights across the 6 r60 panel JSONs, counted
  from the records); nothing disappeared.
- defendedCount 21 -> 0: no such field exists in journey
  records (a convo-instrument count, not a journey field).
playerFights and latelyDefenseCount are 0 -> 0 (quiet). The
baseline was NOT rolled forward: overwriting a
convo-instrument baseline with journey-instrument numbers
under mismatched keys would destroy its meaning. The mapping
proposal (defenderFights -> defendedFights) remains a proposal
for the next run, not a silent rewrite.

## Reachable / fun / winnable (leg 6)

- REACHABLE: yes — raids, lingerers, gorges, sorties, refusals
  and refusal retries, drifts, re-lingers and both exits fired
  across 6 seeds, on the new master.
- FUN: the leg reads the same as r59 where it replays, and
  harder where it moved — the thinner horizons are a costlier
  siege, not a broken one. The door-quiet line still means
  something when it comes (TRUE early stays 0).
- WINNABLE: yes — 4 of 6 seeds reach the horizon alive (9406,
  9407, 9408, 9413); 9405/9411 show the losing branch, later
  and honestly, exactly as in r59.

## Regression evidence

- Proof test: test-crisis-r59-aidfight-gate.js 10/10 on the new
  master (b898dff4a base).
- check.js --quick in the worktree: 284 passed, 6 failed in
  951s. The 6 failures are identical in identity to the
  sibling landing check's 6 on the same base profile
  (measurement-proof-update, measurement-workflow,
  mobile-combat-cadence, occupation-panels, phone-frame-proof,
  establishment-r20 racks-full) — none references crisis,
  aidFight, lingerers, or either new r60 script, and the two
  new scripts are not in the green list. NO-REGRESSION holds
  for r60.

## Metric review (§14)

For the NEXT run:
1. Bisect the 9407/9408 drift at mechanic level: tackle-map
   game.js vs calmbeast vs party-guard vs the smaller touches,
   using seed 9408 (earliest divergence, day 9) as the probe.
   Until then, cite r60's 9407/9408 censuses as
   post-r59-master numbers, not as r59-after numbers.
2. Instrument wobble: same-commit re-runs diverge in the tail
   (pin day 116 for 9408). Find the nondeterminism source, or
   adopt outcome-band comparison (ending + alive band + pantry
   band) as the panel rule and stop expecting tail equality.
3. Telemetry mapping proposal (defenderFights ->
   defendedFights) still a proposal, not a rewrite.
4. Carried open items (documented, not fixed): dead
   discoverer's orphaned fireside entry (r51, Steve's call);
   unfed marches proceed (r50, Steve's call); stare-down cost
   as a class (Steve's call). Gating freeze (2026-10-27)
   untouched; no gating change in this run.
5. Process notes: (a) a nohup heartbeat loop spawned from a
   finished exec session died after its first beat — the
   tracked background session (7-min beats, log-verified) is
   the reliable form; (b) worktree-release.sh takes
   `merged|abandoned`, not `done-merged` — the pin tree was
   released with `abandoned` after its branch was deleted;
   (c) telemetry-check glob needs an absolute path (shell ~
   is not expanded inside quotes).

## Files

- Game change: NONE (zero src/js).
- Driver: `scripts/journey-crisis-r60-delayed-20261028.js`
  (r59 verbatim, renames only)
- Analyzer: `scripts/analyze-crisis-r60-delayed-20261028.js`
  (r59 verbatim, glob only)
- Run note: `evidence/2026-10-28/journey-crisis-r60.md` (this file)
- Panel: `hidden_files/evidence/2026-10-28/r60-panel/` +
  `hidden_files/evidence/2026-10-28/journey-crisis-r60-analyzer.txt`
- Pin: `hidden_files/evidence/2026-10-28/r60-pin/` +
  `hidden_files/evidence/2026-10-28/r60-pin-analyzer.txt`
