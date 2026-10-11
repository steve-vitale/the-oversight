# Longsim win-path lever (lever 10: arcs → national → table → win) — 2026-10-11

## Lever played: the lesser-seat invitation (the binding constraint)

**Exact change** (`src/js/progression.js`, `src/js/table.js`):
1. **Arc IV's gate is now the table's seat bar, not the full gate alone.**
   Before: `checkArc` advanced arc 3→4 (and set `tableWaiting`) only on
   `deedGateReady().ok` — the FULL seat (national+, 5/5/4/3/2 waves faced,
   3 contests, 3 crises, stage≥3). The LESSER seat (`tableSeat()`: waves
   4/4/3 faced, 2 contests, 2 crises, regional+, stage≥2, food-thesis deeds)
   was **dead code in the invitation path** — `tableScene()` handled the
   lesser audit fine, but nothing ever set `tableWaiting` for a lesser run.
   The designed "reachable bar for competent non-god play" (docs/TABLE.md)
   could never fire. After: `if (want >= 3 && (seat === 'full' || seat === 'lesser')) want = 4;`
   and the dawn re-fire check uses the same bar. The seat bars already
   encode stage/scale/contests/crises, so no separate stage check.
   The bar itself is UNCHANGED (not weakened — the endgame build calibrated
   it; seed 99 came within 1 fight + 1 crisis of it).
2. **Seat-honest Arc IV beat text.** The full-seat beat names all five waves
   ("the Mirror Draft, the Producers themselves"); the new lesser variant
   names only waves 1–3 ("the calibration fauna, the audience's notes, the
   Final Draft … yours, though unfinished, are undeniable"). Claiming waves
   4–5 on a lesser run would be a lie the audit would catch.
3. **Pantheon dead code** (`src/js/table.js` `tableEpilogue`): the old
   else-if chain made `asc.length > 1` unreachable (asc partitions exactly
   into facAscended+unbacked), so the "pantheon's politics get one beat"
   TABLE.md promises never fired. Now it fires whenever 2+ villagers ascend,
   alongside the architect/outshone beat.

## Before/after (identical seeds)

**Baseline funnel** — `scripts/sweep-winpath.js` (new harness; full chain:
arcs, waves 1–5 unlocked+faced, regional/national days, lesser/full seat
days, table fired, won, crises, counters, death shares, mantle passes),
32 runs (competent + winseek × 16 seeds × 200d), current master:
- arc≥4: **0/32** · lesser seat: **0/32** · full seat: **0/32** · table fired: **0/32** · won: **0/32**
- wave≥3: 5/32 · wave≥4: 0/32 · wave≥5: 0/32 · national: 1/32 · regional: 16/32
- median survival 55d, max 148d; all 32 ended village-lost
- death causes: combat 197, villager combat 122, starvation 60 (combat ~77%),
  monster 21, sickness 8, wounds 4, lockjaw 1, Highbeam Deer 2
- Near-miss analysis (lesser bar): winseek seeds 4 and 7 died 1 bar short
  (w3 faced 0/3 — faced 8/6/0 and 9/4/0, everything else met); winseek 1
  missed w3 + contests. Competent runs miss scale (never courts it) + food
  deeds (no feast loop) + w2/w3 bars.

**Journey policy before/after** — `scripts/test-journey-endgame-20261011.js`
(deed-seeking competent: fights for deed bars, feast-surge loop, scale
courtship, answers table choices), identical seeds:
- BEFORE (pre-fix game code): table fired **0/8** (maxDay 12–80, all died)
- AFTER (fixed code): table fired **0/24** — the 8 identical seeds ran
  byte-identical trajectories (RNG stream intact after adding the table
  modules to the harness: seed 20261011 maxDay=74, 777=65, 424242=67/68,
  99=14 — all match before exactly), plus 16 new seeds, also 0.
- Closest: seed 21 (87d, regional, wave 3) missed the lesser bar by w2
  faced 3/4 (one fight) + feastSurgeUsed (surge armed at resonance 35,
  never used in real combat). Died with pop 2, pantry 0.
- Honest reading: the invitation now fires for any run that reaches the
  bar (proven RED→GREEN + e2e won=true), but on current master no
  journey-policy seed reaches the bar — survival upstream binds (median
  ~60d vs the ~100d chain). That is lever 1's territory, not a reason to
  weaken the bar.

**Proof test** — `scripts/test-winpath-lesser-invite-20261011.js`: **25/25**
(RED→GREEN verified: 6 fix assertions fail on pre-fix code).
- lesser bar → checkArc → arc 4 + tableWaiting; lesser invitation line;
  lesser arc-4 beat (no wave 4/5 claims); tableScene fires the lesser audit
  (no withdrawal); full-seat control unchanged (full beat names all 5 waves).
- pantheon: 2 ascensions → ARCHITECT + PANTHEON both fire; 2 unbacked →
  OUTSHONE + PANTHEON both fire.

**Regressions**: table suite 31/31, 27/27, 21/21, 22/22, 18/18, 13/13,
18/18, 39/39; test-deed-gate 68/68. test-progression.js and
test-understudy-arc.js throw identically pre/post fix (pre-existing, not
caused by this change).

**End-to-end sense drive** — `scripts/test-winpath-table-e2e-20261011.js`:
lesser seat → checkArc → tableScene → defiant path walked beat-by-beat →
finals → epilogue → **won=true**. Full transcript at
`/tmp/winpath-e2e-transcript.txt` (read below for the sense verdict).

## Village assessment (plain words)

The win path's binding constraint was not the bar — it was the invitation.
Every sim ever run (0/32 here, 0/60 winseek, 0/8 journey leg) died without
the table ever coming, and the engine guaranteed it: the lesser seat was
priced but never invited. Villages die young (median 55d) and violently
(combat ~77% of deaths); the ones that live (seed 555: 80d, seed 20261011:
74d) stall at wave 2 with regional never courted by the competent policy.
The chain now fires for any run that earns the bar — the next binding
constraint is survival upstream (lever 1's territory), not the table.

## Sense findings (transcript reads)

- **Invitation/audit**: "The table is being set — a lesser seat, priced for
  what you built." / "A lesser seat — regional standing, waves 1–3 faced
  (4/4/3), 2 contests survived, 2 crises weathered. The table does not rise.
  It prices." Honest, no wave 4/5 claims.
- **Defiant (light branch, earned)**: the harvest price ("Haven's shelves
  echo"), naming Marcus ("Some prices you pay forever, in installments of
  grief"), de-integration ("the world gets bigger and colder and *yours*
  again"), the walk-away final ("the long shot of small figures leaving the
  light, carrying their food and their dead and their songs"). The branch
  was read from the ledger ("The protected outnumber the killed; the food
  truth was shared. The light road is open.") — never a menu choice.
- **Epilogue**: "Bill Palmer walks out of the light alone, which is how
  they walked in. The village endures. That was always the story." Correct
  for a run with no ascensions.
- **People check (day 105)**: Shannon ("Teach me something") → teaching
  exchange → earned candor ("You're alright. I think. Ask me again in a
  week." / "be the person you are when nobody's watching"); Manuel (grief
  confession) → "Trust is slow out here. It's the one thing the System
  can't grant us." / "Stay... People leave. You keep showing up." Distinct
  voices, no verbatim repeats, resolutions with meaning. The village acts
  like a village at day 105.

## Blanks

**Filled (2)**:
1. Lesser-seat invitation dead code (above) — the lever.
2. Pantheon politics beat dead code (above).

**Documented (not fixed)**:
1. **Survival is the next binding constraint.** Median 55d (competent+winseek)
   / journey policy max 80d on current master; the chain needs ~100d. Combat
   deaths ~77%. This is lever 1 (combat & death share) territory, not lever 10.
2. **Crisis sparsity for stable villages** (from journey evidence): a peaceful
   empire sees ~1 crisis/180d; the lesser bar needs 2 and Arc III needs 2.
   Turbulence-coupled crises punish competent play. Worth a lever-10 revisit
   or a crisis-cadence look.
3. **test-progression.js throws** at line 251 (`bond` of undefined) and
   **test-understudy-arc.js throws** in newFight — identical pre/post fix,
   pre-existing. Owners' eyes needed.
4. **Wave 4/5 still unreached** in all sims (0/32) — scale-bound (travel
   lever's domain); the full seat remains aspirational by design.
5. The journey-endgame harness now loads table.js + table-*.js + relay-ext.js
   (was missing the endgame modules — its "table=no" readings were vacuous
   without them). No top-level RNG draws in those modules; seed streams
   verified intact (after-run seed 20261011 trajectory matches before-run
   through day 74 exactly).

## Files

- Fix: `src/js/progression.js` (seat gate + re-fire + seat-aware arc-4 beat),
  `src/js/table.js` (pantheon beat)
- Proof: `scripts/test-winpath-lesser-invite-20261011.js` (25/25, RED→GREEN)
- Harness: `scripts/sweep-winpath.js` (new full-chain funnel; /tmp/wp-baseline.json)
- Sense: `scripts/test-winpath-table-e2e-20261011.js` (transcript /tmp/winpath-e2e-transcript.txt)
- Harness fix: `scripts/test-journey-endgame-20261011.js` (loads table modules now)
