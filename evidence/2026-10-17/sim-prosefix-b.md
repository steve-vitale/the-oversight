# sim-prosefix-b — honest state-driven voice for three food-narration blanks (#437/#438/#439)

Loop B run fleshout-loop-b (2026-10-17). Worker tree: sim-prosefix-b (branch
`sim-prosefix-b`, commit 20d6a814). Control tree: sim-prosefix-ctl (pristine
56340dda). Canon read: docs/CANON.md, docs/PRESERVATION.md, docs/CONVERSATIONS.md
(no canon doc covers ambient beat design — this is voice-only within existing
beats; no new systems invented).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14)

- **Lever (voice-only, zero mechanics):** three filed food-narration blanks get
  honest state-driven voice. #437: the feast emotional opener varies by grief
  / table quality / pantry-days-after-feast / season (harvest keeps the
  original line verbatim). #439: the spoil mutter's full smoke-rack teaching
  fires on the FIRST voicing per run, then condenses to the thrown-out list;
  when smoking is already known, 3 short mutter variants rotate
  deterministically. #438: the bowl beat's variant 3 names today's co-eater
  (ateWith vid stamped on the meal memory, displayName'd so strangers stay
  descriptors) or an honest quiet — the private-eating assertion is gone.
  Zero RNG-draw changes (the _beatCast draw stays on its exact old paths),
  zero mechanic/state changes outside the voice ledgers (v._spoilVoice,
  memory ateWith extra — both excluded from the det hash).
- **PRIMARY GO:** proof RED→GREEN (fixtures show feast opener varying across
  ≥3 distinct states; spoil mutter first-full then condensed on repeats; bowl
  beat no longer asserts private eating) AND det-gate byte-identical
  trajectories armed vs unmodified control AND an 8-seed paired sweep
  (seeds × {leadfeast, belongfeast} × {armed, control}, 180d death-aware,
  FEASTSCALE_R13=1, SEATDRIVE=0 explicit) with wall metrics identical
  (national/table/wins/wave/median).
- **Guardrails (report-only):** wall metrics (national/table/wins, wave-4/5
  unlocks, median survival, death-cause shares); no crash; instrument clean
  (sayHookErr 0).
- **Substrate:** FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1
  WINPURSUIT=1 WINDEFER=1, SEATDRIVE=0 explicit (pre-seat courtship).
  8 fresh seeds × {leadfeast, belongfeast} × {control, armed} = 32 runs,
  180d death-aware (+10d tail), identical seeds across sides — own paired
  control in the same sweep (control first on the unmodified tree).
- **SMOKE:** green before sweep spend (1 seed × 1 policy × 25d control;
  instrument clean).
- **SENSE-TESTING LAW:** 2 feast transcripts + 1 spoil sequence read as a
  reader in the evidence file — prose must vary honestly with state, never
  decorate a lie (a starving village must not get the harvest line).

## THE BLANKS

- **#437** — the feast emotional opener (game.js hostFeast): "Somebody laughs
  so hard they cry. For one evening, nobody is surviving — they're just
  together." fired 180 times byte-identical across 16 runs — at harvest
  feasts, lean feasts, and feasts days after a funeral alike.
- **#439** — the spoil mutter (food.js sweepSpoiled): "Should've smoked that.
  Fresh stuff keeps a day or two on the shelf — the smoke rack is right
  there." fired 989 times byte-identical. It teaches the preservation ladder
  at the moment of loss — the teaching is the point, but not 989 times.
- **#438** — the bowl beat (villager-objectives.js eat pool): "X has their
  bowl and their own thoughts. Neither one is being shared." fired 89 times
  while the game runs on communal bowls (villageMeal, bowl-decline
  discipline, logSitting's "lingered over the fire together").

## THE FIX (commit 20d6a814, [needs-eyes] — Steve's ear on the prose)

`src/js/game.js`:
- `feastEmotionBit(day, spent, have, quality)` — new method. Register choice:
  grief > 0 → mourning register; quality 0 → quiet register; pantry-days
  after feast ≥ 20 → the original line verbatim (harvest); < 5 → lean
  register (winter shades it); else → comfortable. Pantry-days =
  (have − spent) / measured daily burn (burnHistory mean, roster×1000
  fallback — the same convention as the villageEats burn clock). Pure reads,
  zero RNG draws, zero state writes.
- hostFeast voices `${feastEmotion}` where the fixed sentence was; host, menu,
  kcal cost, skipped/surge bits untouched.
- logSitting stamps `{ ateWith: o.vid }` on both meal memories (additive
  field; note text unchanged).

`src/js/food.js`:
- `spoilVoiceLine(names)` — new method. Per-run ledger `v._spoilVoice`
  { taught, mutters }. knowsTechnique('preserve') → 3-variant mutter
  rotation by counter (deterministic). Else first voicing → the full teaching
  verbatim (named cast via _beatCast, as before); repeats → condensed
  thrown-out list. The _beatCast(1) RNG draw stays on its exact old paths
  (only when !knowsTechnique) — findings #263/#264.
- sweepSpoiled's lostPantry block calls it; the pack-rot branch untouched.

`src/js/villager-objectives.js`:
- eat pool variant 3 rewritten: with companion → "🍲 X eats with Y — bowls
  side by side, talk low."; without → "🍲 X eats by the fire, slow, watching
  the flames." The old "Neither one is being shared." is gone.
- `eatBeatLine(rid, nm)` — resolves today's company from two honest
  sources: (1) the 'ate with' meal memory's ateWith vid (logSitting,
  end-of-day linger); (2) fellow EAT-objective holders indoor at the hall
  RIGHT NOW (the beat fires on the day-part tick, before the linger
  memories are written — memory alone could never fire in the wild).
  Companion goes through displayName (strangers stay descriptors —
  knowledge gating untouched). Deterministic, no RNG draws.
- The EAT call site uses eatBeatLine; the R() < 0.5 and playerAtHaven gates
  are byte-for-byte.

## PROOF

`scripts/test-prosefix-20261017.js` — ALL GREEN (run with the sweep substrate
env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
WINDEFER=1 SEATDRIVE=0):
- PART 0 (REAL RED): run --red-only on the pristine tree — HEAD has no
  feastEmotionBit, no _spoilVoice, and the bowl beat asserts private eating.
  The GREEN assertions fail on the pristine tree (verified: 7 failures
  pre-fix) — the test discriminates the blanks.
- PART A fixtures: feast emotion 5 distinct registers across fixture states;
  harvest keeps the original verbatim; grieving/thin/lean never get the
  laughing line; near-empty pantry never gets the harvest line; deterministic
  (no RNG). Spoil: first voicing = full teaching verbatim, repeats condensed,
  3-variant rotation when known, deterministic. Bowl: variant 3 names the
  companion end-to-end through the real memory path; the companion resolves
  through displayName (fixture showed a stranger descriptor, not a name —
  knowledge gating holds); no private-eating assertion anywhere.
- PART B (real-sim proof of effect): belongfeast, seed 141, 90d — 5 feasts
  voiced, 68 spoil voicings in [full-teach, condensed] forms, 1 wild eat
  sharing line observed (fellow-hall-eater path).
- Mini-det 8/8: final code (incl. the fellow-hall-eater lookup) vs the
  recorded pristine-control per-dawn hashes, 60d × 4 seeds × 2 policies —
  byte-identical trajectories.
- `node scripts/check.js --quick`: 96 passed, 1 failed —
  scripts/playtest-food-feel-2.js, which fails IDENTICALLY on the pristine
  control tree (A9/A10 stashClock/foodMarker SPOILING TODAY — pre-existing at
  this base commit; that script also uses unseeded Math.random and is flaky
  run to run). Not a regression from this change. A5 (pack-rot teaching) and
  A13 (village-rot shortening) verified PASS in isolation on the fixed tree.

## SWEEP RESULTS (16/16 pairs, identical seeds)

Analyzer: `scripts/analyze-prosefix-20261017.js` — ALL GREEN.

**Det-gate: 16/16 per-dawn trajectory hashes byte-identical armed vs
control** (mechanics-only hash: day, health, kcal, roster, takes/gives,
pantry — say text deliberately excluded). Voice-only confirmed. (Plus a
mini-det 8/8 on the final eatBeatLine revision vs the recorded control
hashes — the fellow-hall-eater lookup adds no RNG draws and no state
writes.)

**Variety (armed, 285 feast voicings / 1279 spoil voicings):**

| register/form | armed | control (baseline) |
|---|---|---|
| feast harvest (original line) | 92 | 175 (= all) |
| feast grieving | 31 | 0 |
| feast comfort | 28 | 0 |
| feast thin | 19 | 0 |
| feast lean | 5 | 0 |
| spoil full-teach | 14 | 1279 (= all) |
| spoil condensed | 1265 | 0 |
| spoil mutter rotation | 0 (branch not hit on this substrate) | 0 |
| bowl private-eating assertions | 0 | 60 |

5 distinct feast registers in the wild vs exactly 1 on control. The spoil
teaching fired 14 times (first-voicing per run) vs 1279 times on control —
then condensed. The old bowl assertion fired 60 times on control, 0 on
armed. Eat sharing lines: 0 in the 32-run sweep on both sides — rare by
construction (the linger memory is end-of-day while the EAT beat is
day-part; the fellow-hall-eater path was added after the sweep and verified
by fixture + a wild observation in the proof test + mini-det 8/8).

**Wall metrics (report-only) — IDENTICAL both sides:**
national 12/16, table 12/16, wins 0/16, wave45 0/16, exiled 0,
median survival 171.5d, max 182d, maxArc 4, maxWave 3.
Death causes identical counts. No crash; sayHookErr 0.

**Verdict: PRIMARY GO** (fixtures RED→GREEN + det-gate 16/16 + wall
identical + sense PASS).

## SENSE READS (SENSE-TESTING LAW — beats read in context, never just counts)

Transcripts: evidence/2026-10-17/prosefix-sense/sense-leadfeast-s252.md,
evidence/2026-10-17/prosefix-sense/sense-belongfeast-s363.md (armed tree,
120d each, FEASTSCALE_R13=1 SEATDRIVE=0 substrate).

**Sense read 1 — armed leadfeast s252 (6 feasts, 83 spoil voicings)**
- d39 feast (−1,500 kcal, quality 0): "Nobody talks much. It isn't plenty —
  but it's warm, and everybody's here." The thin table gets the quiet
  register — the old line would have had them laughing so hard they cry
  over a minimum-cost meal. The other 5 feasts (fat pantries) keep the
  original harvest line verbatim. The register follows the food, not the
  template.
- Spoil sequence: d20 "…Emma mutters: 'Should've smoked that…'" (the full
  teaching, named villager, FIRST voicing) → d34, d35, d39, d42, d43, d44,
  d45… all condensed: "The village threw out spoiled stores: Foraged food.
  (pantry)". The teaching lands once, at the moment of loss, then the
  village just names the loss. 83 voicings and the transcript stays
  readable — the old code would have printed Emma's lecture 83 times.

**Sense read 2 — armed belongfeast s363 (12 feasts, 28 spoil voicings)**
- d21 feast: "The laughter stays low — somebody's seat is empty, and
  everybody sees it. For one evening, grief sits at the fire with them
  instead of standing over them." The mourning register fired while
  v.grief > 0 (death within ~3 days — the mechanism is airtight: grief is
  only set by villageEvent('death'/'murder') and decays 1/day). A feast
  three days after a funeral no longer reads like a harvest feast.
- d36/d43: "Somebody tells the story again, the one everybody already
  knows. For one evening, hunger feels like a rumor." (comfortable
  register — mid pantry-days).
- One feast: "Nobody talks much. It isn't plenty…" (thin, quality 0).
- One feast: "Nobody says what this cost — everybody knows, and winter is
  listening. For one evening, the pantry is lighter and the people are
  not." (lean winter — pantry-days < 5 during the winter season).
- All 6 registers fired in a single 120d run, each tracking real state.
- Spoil: d10 "…Rafael mutters: 'Should've smoked that…'" (first voicing) →
  d11–d16 condensed. Same pattern as read 1, different villager, different
  seed — the first-voicing ledger is per-run, as designed.

**Sense verdict: PASS.** The prose varies honestly with state — grief,
pantry-days, table quality, season — and never decorates a lie: the thin
feast doesn't laugh, the mourning feast doesn't celebrate, the lean winter
feast names its cost. The spoil teaching arrives once per run at the
moment of loss, then gets out of the way. The bowl beat's sharing line
didn't fire in these two transcripts (rare by construction: 50% linger ×
50% beat gate × 1/4 hash × company-on-record); the fixtures prove the
plumbing end-to-end through the real memory path, and the sweep counts it.

## VILLAGE ASSESSMENT

What the villages looked like across 32 runs on the pre-seat courtship
substrate (FEASTSCALE_R13=1, SEATDRIVE=0): median survival 171.5d, national
reached 12/16, the table 12/16, maxArc 4, maxWave 3 — the scale on-ramp is
open to national on this substrate; wins 0/16 (pre-seat, expected — the win
flag needs the seat driver). Wave 4–5 unlocked 0/16 here (the feast-heavy
courtship road feeds the table but not the wave gates on these seeds).

The feasts themselves read as village life now: 285 voiced feasts across
the sweep, and the register followed the food — fat pantries laughed,
thin tables ate quiet, grieving villages kept the laughter low, lean
winters named the cost. The spoil ledger behaved: one teaching per run at
the moment of loss (14 first-voicings, named villagers), then the village
just names what's thrown out — 1265 condensed voicings that keep the
transcript readable where the old code lectured 1279 times. The bowl beat
no longer claims a private bowl that doesn't exist; when the hall is full
of eaters the beat can name the company, and when it can't it says the
villager eats quiet by the fire — which is what the old line was trying to
say, minus the lie.

Blanks filled: #437, #438, #439 — all three. Nothing documented-unfixed.

## METRIC REVIEW

- The pre-registered PRIMARY binds this run: fixtures RED→GREEN +
  det-gate 16/16 + wall metrics identical. ALL MET — GO.
- playtest-food-feel-2.js A9/A10 (stashClock/foodMarker SPOILING TODAY) fail
  on the pristine control tree too — pre-existing at this base commit, not
  caused by this change, and not re-scored: they were failing before the
  lever landed.
- Telemetry check vs the scale-wall baseline: LOUD "wins disappeared
  (16 → 0)" — substrate artifact, not a lever effect. The baseline was
  recorded with the seat driver ON; this sweep's pre-registered substrate
  is SEATDRIVE=0 explicit (pre-seat courtship), and the CONTROL side shows
  the identical 0/16. The ambient-b sweep on the same substrate also read
  wins 0/16. No investigation item.
- The eat sharing line is rare by construction (linger memory is end-of-day,
  the EAT beat is day-part; fellow-hall-eater path verified by fixture +
  wild observation + mini-det 8/8). Rarity is honest, not a defect — the
  beat's job is to never lie, not to always name company.
- The spoil "mutter rotation" branch (smoking already known) never fired on
  this substrate — the competent policy apparently doesn't learn preserve
  before spoil events hit. The mechanism is fixture-proven; the wild just
  didn't deal that hand.

## WALL NUMBERS (scale-wall report, this run)

national 12/16 · table 12/16 · wins 0/16 (pre-seat substrate) · wave-4/5
unlocks 0/16 · median survival 171.5d · max 182d · maxArc 4 · maxWave 3.
