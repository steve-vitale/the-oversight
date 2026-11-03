# journey-deepening r89 — run note (lane A, leg 2 DEEPENING)

**Run id:** laneA-deepening-2026-11-03T06:45CST. Base master@3b54dede5 at
worktree creation; worktree `journey-deepening`. Rotation read 2 →
deepening; 2→3 written at run start and verified by read-back.
Prereg: evidence/2026-11-03/journey-deepening-r89-prereg.md (committed with
this run; written BEFORE any seed ran). Seeds fresh 93201–93204, competent
policy (r88 driver lineage), DAYCAP=100, death-aware stop. Smoke seed 93200
× DAYCAP=45 proved the instruments, then its outputs were deleted per the
prereg (smoke finding noted below, not judged).

**Infrastructure note (loud, not blocking):** worktree registration took
~6 minutes: the registry lock was held by another agent's registration
(gap-beastpool2m) and `git worktree add` ran slowly under heavy concurrent
git contention. The run heartbeated throughout (10-minute loop, verified in
the registry). No work was lost; the delay is recorded because a future run
could mistake the slow checkout for a hang.

## Panel verdicts

- **MEAT-DINNER: GO on 4/4 seeds.** Monster meat reached village meals on
  every seed (18 dinner draws total). The standing friction "monster meat
  still never becomes dinner" does NOT hold for competent play in this
  window — dinners landed as early as day 8.
- **MEAT-STAGE (diagnostic):** 88 monster kills → 19 test verdicts → 18
  safe reveals → 18 dinner draws. Per seed: 93201 K19/T4/R4/D4,
  93202 K27/T5/R4/D6, 93203 K23/T5/R5/D5, 93204 K19/T5/R5/D3.
  One test returned POISON, correctly: belltoad body (seed 93202, day 32),
  which was not revealed safe and never eaten — the two-pool safety rule
  working as designed.
- **M4 people: 11/11 transcripts sense-read, 0 senseless.** The 12th
  transcript does not exist because seed 93202's village was lost on day 62
  (death-aware stop, not a missing instrument).
- **M5 winnable (descriptive):** 3/4 villages survived to day 101;
  93202 was lost on day 62. All 4 reached regional scale with an active
  hierarchy link.
- **STAY-GREEN: death-honesty mislabels 0 on all seeds.**
- **Proof:** scripts/test-journey-deepening-r89-instruments-20261103.js —
  20/20 (driver markers + analyzer verdict fixtures). Analyzer:
  scripts/analyze-journey-deepening-r89-20261103.js.

## Village assessment, in plain words

Three villages made it through the deepening window and one did not, but
none of them starved quietly — they fought, ate monster meat, argued,
grieved, and climbed to regional standing.

- **93201 (survived, day 101, wave 3, regional):** 8 alive at the end —
  Valeria, Ingrid, Leo, Ohene, Elif, Bashayer, Donna, Oluwakemi. They knew
  25 monsters in the Codex and shared 38 pieces of village knowledge, with
  one seasoned regional link (trust 47). They ate ducks, nightcourt, and
  cliffhanger meat, and a tester named Nathan Lee put the first bite to
  ducks on day 7. Losses along the way were mostly monsters and wounds that
  would not close — Katarina Novak and Xavier Dubois both died of wounds —
  plus one starvation (Onni Korhonen, day 29).
- **93202 (lost, day 62, wave 3, regional):** 9 people were still alive on
  the roster when the village was lost, so this was not a wipeout — the
  village fell apart around day 50–62 after a run of combat deaths (Pavel
  Dubinin, Hassan Ali in the arena) and a poison scare handled right: the
  belltoad body was tested poison on day 32 and never served. Diana Osei,
  who did most of the tasting, died to a monster on day 34. This village
  ate the most monster meat (6 dinners) and still fell.
- **93203 (survived, day 101, wave 4, regional):** 8 alive — Raul, Clinton,
  Miguel, Aki, Petra, Victor, Vasyl, Mateo. The only seed to touch wave 4
  inside the deepening window, with 29 monsters in the Codex and standing
  100, but also 4,000 in arrears on its regional link — climbing while in
  debt. It ate hushwolf, sweeps-week, glasswing, and gallowdeer meat.
- **93204 (survived, day 101, wave 3, regional):** 10 alive — the biggest
  household. It ate mirrormoth and rut-king meat. Two of its talkers
  (Alejandro, Penelope) later died in the wild, days 89 and 92, after the
  day-80 conversations — the village kept going without them.

What they knew: every village could name and cook a handful of monsters,
but nobody's pantry ever held monster meat at a checkpoint — the meat was
eaten within days of the kill, never stockpiled. What was missing: breadth.
Each village killed 10–13 kinds of monster and only ever tasted 4–5 of
them. The rest were corpses, not food.

## The funnel — the blank this run documents, not fixes

The chain works, but it narrows hard after the first few kills, and this
run's data cannot yet say which stage narrows it — so no fix is claimed:

1. **Tested kinds cluster early.** First tests land days 7–24; after that,
   new kinds are rarely tasted even when killed repeatedly (93202 killed
   hushwolf 6 times, tasted it once on day 20, never ate it).
2. **Checkpoint censuses miss the action.** Meat is tested and eaten
   within days, so the 50/70/85/100 snapshots almost always show empty
   containers. The event log (kill day → test day → dinner day) is the
   right instrument; the census is not (see metric review).
3. **Two loose ends worth the next instrument, not a fix today:**
   - Belltoad legs were never tested or eaten on any seed, though the body
     was tested poison — the legs path (safe part, poison body) may never
     get hauled, or the test beat may never see legs. Unproven either way.
   - Seed 93201's lockpick-raccoon meat was tested safe day 83, sat in the
     pantry as "preserved" on day 85, and was gone by day 100 with no
     dinner draw recorded — either eaten through an unwrapped meal path
     or swept. Unproven either way.
4. **Next instrument (for r90 or a focused sim):** loot-by-kind + pantry
   -arrival events, so "carcass rotted unhauled" can be separated from
   "hauled but never tested" and "safe but never drawn at a meal."

## People check (sense-read, all 11 transcripts)

Every sitting has an NPC who wants something real: Ingrid probing trust,
Xavier asking what got you through the first week, Erin and Raul asking the
player to ask the System about the taken, Yuzhen/Raul/Penelope hungry and
asking for food. Options engage or deflect; endings resolve (promised,
engaged) or honestly stay open (a walk-with-me invitation left unanswered;
the language-barrier sitting with Bashayer, where no shared words exist and
the game does not fake comprehension). Moods fit the words — hungry
villagers ask for food, grieving ones talk about loss.

Two flat notes, not failures: (a) stock lines repeat across villagers —
"Thank you. I won't forget who fed me when it mattered" and "Walk with me?
I want another pair of eyes on something" recur verbatim in different
mouths; within any one sitting nothing repeats (maxRepeat 1 everywhere).
(b) One opener gestures at unverifiable shared history (93204 day 45:
"We never finished talking about what they confided") — coherent as a
resumed thread, and the sitting honestly ends "unestablished" rather than
faking a resolution. Watch item, not a defect.

## Reachable / fun / winnable

- **Reachable: yes.** Regional scale, hierarchy links, wave 3 (and wave 4
  on one seed), and monster-meat dinners all occur under ordinary competent
  play without steering.
- **Fun: yes, with a narrow payoff.** Villages feel alive — fights,
  contests, food asks, grief — but most monster kills never become food,
  so the meat channel's payoff is a handful of kinds, not the menagerie
  the player killed. The funnel above is the fun gap.
- **Winnable: yes, not guaranteed.** 3/4 villages survived the window and
  climbed to regional; one fell at day 62 despite eating the most monster
  meat. Progress toward a win is real and losable.

## Telemetry deviation check

`node scripts/telemetry-check.js` against
hidden_files/telemetry-baselines/deepening.json, metrics w3fights,
engaged.w3, fightsTotal, fightsByWave.3:

- **LOUD: w3fights 6 → 17, engaged.w3 7 → 23, fightsByWave.3 6 → 17
  (n=4 files). Verdict: EXPLAINED, not a bug — and the baseline was NOT
  rolled forward.** The tool sums across files, but the baseline file
  carries no seed count, so a 4-seed sum cannot be compared to it as a
  swing (per-seed means: w3fights 4.25 vs baseline 6 — no rise at all).
  Meanwhile total fighting is stable (fightsTotal sum 41 vs baseline 49,
  inside the band): the wave-3 share of fights is higher (17/41 vs 6/49),
  which is the expected mix shift for a deepening window where every seed
  reached wave 3. The baseline needs an n-annotated reseed before it can
  judge anything; rolling a 4-seed sum over it would bake in the same
  shape error.

## Metric review

- **MEAT-HAUL via checkpoint census: wrong instrument.** The chain
  completes in days; 50/70/85/100 snapshots show empty containers even on
  seeds with dinners. Next run: judge haul from pantry-arrival events, not
  census snapshots.
- **M5 via census-alive: wrong proxy.** The analyzer counted 93202 as
  "alive" (9 roster alive) though its endReason is village-lost. Next run:
  M5 counts endReason survived, not roster alive.
- **Telemetry baseline shape:** deepening.json has no seed count or regime
  label; sums across panels cannot be judged against it. Reseed with
  explicit n before the next telemetry check.
- No pre-registered metric was re-scored mid-run. MEAT-DINNER, M4, and
  STAY-GREEN are reported exactly as pre-registered.

## Harness

scripts/journey-deepening-r89-20261103.js (r88 lineage + meat instruments:
monsterMeatEntry / markMonsterFoodSafe / villagerExperimentBeat-diff /
trackMealExposure wraps + meatCensus at checkpoints and seed end; zero
game-code change). Analyzer + proof as above. Per-seed JSONs and 11
transcripts: goal hidden_files evidence 2026-11-03
(journey-deepening-r89-seed9320*.json, journey-deepening-r89-transcript-*.txt).

## Smoke finding (not judged evidence)

Smoke seed 93200 (village lost day 28) already showed the full chain in
the first 9 days: 13 kills, 3 tests, 3 reveals, 4 dinners — including the
same narrow-funnel shape (only the first 3 kinds tasted). The main panel
confirmed it at full horizon, so the smoke is consistent, not an outlier.
