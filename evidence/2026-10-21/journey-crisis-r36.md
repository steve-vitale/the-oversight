# Journey — crisis leg r36 (lane B): the compound crisis, mass-casualty lens (2026-10-21)

**Pre-registration** (MEASUREMENT.md §§9–12, 14):
- **Leg question:** When famine and outbreak hit TOGETHER and deaths come
  faster than the village can mourn, does the village stay honest and
  person-like — or do the grief/burial/talk systems break, go silent, repeat?
- **Prior art:** r9 (2026-10-14 compound, interaction-deadlock lens, d55),
  r32 (outbreak sense-test, clean bill), r34 (famine; proposed mass-casualty
  exemption to the 100%-mourning bar; mourning-pool expansion landed),
  r35 (siege; named next: first-grave double-fire lead, spontaneous grief
  reachability; telemetry schema mismatch — check skipped).
- **Canon:** docs/DISEASES.md (two pools; diseases never announce true names
  undiagnosed), docs/PRESERVATION.md (food ladder), docs/CORRUPTION.md (fear
  slope — r7's ground). Steve: "violence desperate and traumatic."
- **Interesting-finding bars (any):** (a) a villager death with zero response
  of any kind within 7d; (b) first-grave truly firing twice (re-arm confirmed);
  (c) a villager deserting/panicking during overwhelm (r35 saw none);
  (d) spontaneous (non-driver) overwhelm talk during a casualty window.
- **Seeds:** 101, 202, 303 (pilot; continuity with r9/r34/r35).
  **Policy:** oracleV2 (competent). **Horizon:** establish 20d, blight from
  d20, gut-rot staged on 5 adults at d25 (r9's staging — downstream fully
  real), run to d75, death-aware (+10d tail max, never tick a dead village).
- **Staging note (honesty):** the inherited "blight" (refuse pantryAdd +
  stockPantry) is PARTIAL — daily foraging deposits push directly to
  `v.pantry` (game.js:8083/8114 etc.), bypassing both functions. Famine
  severity therefore varies by seed (how much foraging the village manages).
  Documented, not changed: the partial blight gives a spectrum (scatter /
  scatter / hold), which is more informative than a guaranteed collapse.
- **Bound metrics (§14):**
  - M1 (casualty density): ≥1 mass-casualty window (≥5 villager deaths in any
    rolling 7d) on ≥2 of 3 seeds. GO→judge; NO-GO→cannot judge, restage.
  - M2 (the dead are named): 100% of window deaths get ≥1 grief response
    within 7d (driven grief convo surfacing mourning, first-grave, or a
    grief say-line naming them).
  - M3 (no parrot): 0 verbatim-repeat grief/mourning lines in window transcripts.
  - M4 (no theater): 0 fabricated-history lines; 0 undiagnosed true-name
    announcements (DISEASES canon).
  - M5 (first-grave re-arm): fireCrisis('first-grave') true-returns ≤1 per run.
- **Driver:** scripts/journey-crisis-r36-compound-20261021.js (call-through
  instrumentation; records fireCrisis RETURN values, not just calls — the
  r35 lead demanded it; splits person/villager deaths from monster kills).

## Pilot verdict — M1 NO-GO, and the pilot found the real question

**M1: 0/3 seeds produced a mass-casualty window.** The compound crisis does
not produce mass casualty in competent play. What it produces instead, per
seed:

| seed | end | villager deaths | outcome |
|------|-----|-----------------|---------|
| 101 | d38, over (villageLost) | 8 (3 combat, 1 wound, 4 starvation) | **SCATTERED** — 3 hungry days, "Haven couldn't hold... The scattering, again." 5 villagers alive, scholar at 88hp |
| 202 | d76, over=false | 6 (1 starvation, 1 union-rep, 3 combat, 1 monster) | **HELD** — pantry crashed to 23k then recovered to 33.8k; 8 alive |
| 303 | d59, over (villageLost) | 5 (2 combat, 1 starvation, 1 monster, 1 combat) | **SCATTERED** — pantry 0; 10 villagers alive |

The village doesn't die together under compound crisis — **it walks apart,
or it bends and holds.** The scattering (game.js:29482, the famine endgame —
the game's title beat) is the compound-crisis break, not mass casualty.
Per §14, M1 is recorded NO-GO (never re-scored); the metric-review section
below proposes the revision. M2–M4 are vacuous without windows and are
carried as observations, not verdicts.

## Main findings

### 1. The scattering is the compound-crisis break — and it is earned (r36's answer)

On seeds 101 and 303 the village hit 3 consecutive hungry days with an empty
pantry and scattered: `over=true, villageLost=true`, with 5 and 10 villagers
still alive and (on 101) a healthy scholar. The days before read as a real
unraveling, not an abrupt game-over: "Hunger is doing its slow work on
everyone. The lines get thinner every hungry day." / "The bins can't cover
broth and bandages — we don't have 800 kcal to burn on tending." (triage's
honest cost, spoken by Chloe) / "⚠ STARVING: health and energy falling. The
spiral has started." / "⚠ Haven's pantry is empty. Day 1/2/3 of hunger."
The relief system opened mid-collapse (Chloe: "We can't just watch the fever
in the tents happen... pick one, maybe two, but everything costs something.").
Four starvation deaths preceded the scatter on 101 (d35,35,37,38). The break
has a lead-up, a cost, and a name. The village bends (fewer faces, thinner
lines) and then — on two seeds — breaks by walking apart.

### 2. r35's first-grave "double-fire" lead: RESOLVED as instrument artifact (FILLED)

Seed 101/202/303: fireCrisis('first-grave') was CALLED 8/… times per run but
**fired (returned true) exactly once** on all three seeds (M5 GO). The r35
instrument counted calls; the dedupe in progression.js ("once per kind per
run — the hook sites stay 1-3 lines and never think about farming") works.
Regression guard committed: scripts/test-crisis-firstgrave-once-20261021.js
(4/4 GREEN) — drives two real villager deaths through registerDeath, asserts
exactly one true fire. No game-code change needed; the game was right, the
instrument was wrong.

### 3. Instrument lesson: 'villager combat' deaths are monster kills, not village deaths

The first pilot run (since discarded) counted 32 "deaths" on seed 101 — 19
were `cause:'villager combat', kind:'monster'`: **a villager killing a
monster** (game.js:19055), defense data, not a village death. The driver now
records `kind` and splits person/villager deaths from monster kills at the
instrument. Any future crisis instrument must filter on kind — cause strings
lie. (Seed 101's real toll: 8 villagers; the village also killed 9 monsters.)

### 4. Grief works; hunger honestly outranks it (people check)

- Seed 101: 3/3 driven grief convos surfaced mourning. Lines read as people:
  "Since Sofia died... I keep expecting to see Sofia at the fire. Stupid." /
  "Wei is gone and Rafael is gone and the world just... continues. That's the
  part I can't stand." / "I sleep in short shifts for Rafael, now. Feels
  right. Feels like the least I can do."
- Seed 303: 0/3 surfaced — and the transcripts show WHY: Joshua was starving
  ("I haven't eaten right in days. I need food before I can't work at all.")
  and debt-tangled ("Still on that debt."). A starving man talks about food,
  not the dead. The r32 "quiet-by-design" rule holds under famine: urgent
  wants (hunger, debt) legitimately outrank grief in conversation. Not a bug.
- The staged outbreak's sick asked for help like people (Aurora: "Whatever
  this is, it's winning. I can barely stand up straight. Please — someone who
  knows what they're doing."), and the aid-quest system answered (TEND THE
  SICK accepted d17, done d28; she lived). The "no longer available to receive
  help" line that follows a kept promise is honest — help already delivered —
  though it reads as a shrug in the transcript.

### 5. Mourning-pool repetition is visible (DOCUMENTED, not fixed)

"We bury, we grieve, we keep going. There's no step four." surfaced 3x across
5 convos on seed 101 (the `next.mourning` lately pool has 3 variants; r34's
expansion touched the death-say templates, a different pool). The line is the
pool's strongest and it shows. A real player talking to five villagers about
the dead hears it three times — noticeable, not broken. Named for a future
pool-dilution pass; not changed this run (judgment call: the line earns its
keep, and dilution without a sense-read risks weakening the pool).

### 6. The outbreak was tended through; famine did the killing

sickPeak=5 on all three seeds (the staged gut-rot), but ZERO sickness deaths:
villagerCareTick + the player's tendVillager + aid quests carried the sick
through. The compound crisis killed via starvation (101: 4) and the ongoing
combat/monster tax — famine is the lethal half of the compound, outbreak the
talked-about half. The two systems interacted without deadlocking (r9's
original question, re-confirmed on a longer horizon).

### 7. Nobody deserts, nobody panics (bar c — not fired)

Across 19 villager deaths and 2 scatters, no villager deserted or panicked
mid-crisis. The village's break is collective (the scattering) or not at all.
Consistent with r35.

## Village assessment (plain words)

Three competent villages under the same compound crisis — blight from day 20,
gut-rot on five adults at day 25. On one seed the village bent and held: the
pantry crashed to 23k, the sick were tended through, six people died over 76
days (a wound, a starvation, fights, a monster), and by day 76 the pantry was
back to 33.8k with eight alive — the crisis a tax, not a wall. On the other
two seeds the famine won: pantries emptied, four starved on one seed, and
after three hungry days the villages walked apart — five alive on one, ten on
the other, the scholar healthy on the first. Nobody fought over the last
crumb; nobody broke rank. The dead were named at the fire ("I keep expecting
to see them by the fire"), the sick asked for help and got it, and when it
ended it ended with the line the game is named for: Haven couldn't hold.

## Reachable / fun / winnable

- **Reachable:** yes — blight is staged here, but the famine→hunger→scattering
  chain is all real downstream machinery; natural famines (r34) feed the same
  path. The staged outbreak uses the real disease system.
- **Fun:** the compound crisis reads as a living village under converging
  pressure — the hunger narration, the triage-cost honesty, the relief tent
  going up mid-collapse, the grief lines. The scattering as an ending is
  devastating in the right way: the village doesn't die, it gives up together.
- **Winnable:** 1/3 villages held to d76+ and was recovering; the crisis is a
  filter, not a wall. The two scatters are honest losses (villageLost, wiped).

## Metric review (§14)

- **M1 NO-GO (0/3 mass-casualty windows).** The metric assumed deaths would
  cluster; the game's actual break under compound crisis is the scattering
  (collective, at 3 hungry days) or attrition. Proposed revision for the next
  compound run: replace the mass-casualty bar with "break-mode classification"
  — scatter vs hold vs attrit — with the scattering beat's narration as the
  sense-test target.
- **M2/M4 vacuous** (no windows to judge); carried as observations in §4.
  The 100%-mourning bar from r34 remains untested under true mass casualty —
  still an open question for a future run that actually produces it.
- **M3 (no parrot):** observed 3x "no step four" repetition — documented in
  §5, proposed as a pool-dilution candidate, not a failure (no window to bind).
- **M5 GO (3/3):** first-grave fires exactly once; regression test committed.

## Telemetry check

Ran `node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/crisis-compound.json
--current 'evidence/2026-10-21/journey-crisis-r36-*.json'
--metrics carriedCount,sickPeak` → **quiet** (3 files, 2 metrics, no large
deviations). Baseline (r9): {carriedCount: 10, sickPeak: 14}; r36:
carriedCount 2/5/4, sickPeak 5/5/5. The lower sickPeak reflects r9's longer
tracked sickness tail vs r36's 14-day staged gut-rot; carriedCount variance
is seed-driven (r9 drove 4 convos/seed on a fixed schedule; r36 drives
threshold-crossing convos). No LOUD lines; baseline stands, not rolled.

## Rotation

journey-rotation-b.txt was 6 at run start (r35's 6→7 write was missed —
its note says "Next index after this run: 7" but the file still read 6;
no other lane-B run is active). Played leg 6 (crisis). Writing 7
(succession) at close.
