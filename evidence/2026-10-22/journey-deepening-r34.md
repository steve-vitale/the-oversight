# journey-deepening r34 — the alien-pool ability proof (2026-10-22)

## Run note (run start)

- Rotation file read 2 (deepening). r33 (THE MEAT TRAIL) completed and landed
  (2bcb558b9) but never wrote the rotation back — this run plays deepening as
  r34 and will write 3 at the end.
- Lock `journey-deepening-20261022T234400Z` created 2026-10-22T23:46:59Z (no
  prior lock; no live lane-A tree). Worktree `journey-deepening` registered
  from master e32d4e8c4 (base verified equal), heartbeated; background
  re-heartbeat every 10 min for the run.

## Pre-register (§14 BINDING — written BEFORE the probe ran)

**Leg question:** The alien pool promises "some avoid infection, others seek
it as build fuel" (docs/DISEASES.md) — drawback + ability + transformation.
r32 proved the vector channel fires (scholar-only, measured not moved) but
explicitly left the ABILITIES untested: "The crow-warning ability
(game.js:22641) never fired on 9941 — the 2-day window had no wanderer spawn
to trigger it; untested, not broken." Do the three alien-pool abilities
actually function when the status is held — east_nile crow warnings
(game.js:22675), eurika mosquito-sense (game.js:22692, 22845), lemons engorge
+20% kcal (game.js:26201) / blood-sense (game.js:34276) — or are they dead
code behind the "build fuel" promise?

**Code read (2026-10-22, BEFORE the probe):**
- east_nile: wanderer cast (checkEncounter, day≥3) → if hasStatus('scholar',
  'east_nile'), crows scream the danger direction; else "birds went quiet."
- eurika: wanderer on the scholar's tile → mosquito-sense warning, no ambush
  (same slot as eyes_in_back); tent-breach ambush → same treatment
  (break-it disease r11 fix).
- lemons: eat() → +20% kcal absorbed, narrated ("occupied joints drink
  deeper"); combat vs bleeding target → bonus (34276).
- All three are pure downstream of the status — the probe applies the status
  via the real applyStatus and drives the real trigger paths. No src/js
  changes for the probe.

**Interesting-finding bar:** each ability FIRES with honest narration on its
real trigger path = the build-fuel half is alive (document, move on). Any
ability that does NOT fire on its trigger = a blank: root-cause (dead branch,
unreachable trigger, status never surviving long enough) and fix if it's a
bug, document if it's design.

**Binding metrics:**
- P1 (ability probe, PRIMARY): 3 directed probes (one per ability), seeded,
  harness-side status application, real trigger paths. 3/3 probes complete,
  0 probe errors. Each probe asserts the narration line fired (captured via
  say-wrap) AND the mechanical effect (wanderer.warned / no ambush / kcal
  delta).
- P2 (wild end-to-end, report-only): 4-seed competent playthrough (9971–9974),
  DAYCAP=100, death-aware stop. Instruments: applyStatus for
  eurika/east_nile/lemons (natural infections), crow-warning lines,
  mosquito-sense lines, engorge lines. A natural infection followed by an
  ability firing = the wild end-to-end.
- M1 winnable: ≥3/4 villages alive at end.
- M2 people (report-only): ≥6 full villager transcripts sense-read, 0
  senseless. Per-villager filenames; array-aware scholar status read.
- Report-only extras: death census (r27 lib), plain-words census per seed.

**Seeds / horizon / policy:** probes seeded (fixed); playthrough 9971–9974,
competent pinned, DAYCAP=100, death-aware stop (+10d tail max).

**Race guards:** probe applies statuses harness-side only (the infection
gates themselves are landed code; r32 measured them). No pacing levers, no
wave gates, no dialogue changes. If a probe finds a dead ability branch, a
minimal src fix + proof test is in scope (blank-filling); the vector
scholar-only gating and the meat-trail reveal cadence stay parked as Steve's
calls.

**Metric review:** (to fill after the run)

## RESULTS (2026-10-22)

### P1 — ability probe (PRIMARY): 13/13 PASS

`scripts/probe-alien-abilities-20261022.js` — each status applied via the real
`applyStatus`, each trigger driven through the real game function:

| probe | trigger path | result |
|-------|--------------|--------|
| A east_nile crow warning | `checkEncounter()` wanderer cast, status held | PASS — "The crows are screaming — not the usual racket. They're screaming east, and you understand: something's moving in the woods, that way." Control (no status): "birds went quiet." |
| B eurika mosquito-sense | `checkEncounter()` wanderer on scholar tile, status held | PASS — "Your skin prickles before your eyes catch up — warmth, moving, close. The sensory hairs know. Something is HERE. (no ambush — your skin knew first)"; `wanderer.warned=true`, no ambush spawn. Control: "Something big is HERE" ambush spawns. |
| C lemons engorge | `eat()` with 500-kcal food, status held | PASS — exactly 600 kcal absorbed (+20%), "Your occupied joints drink deeper — the food goes further. (+80 kcal)". Control: flat 500. |

Also code-verified (wired + narrated): lemons blood-sense (+2 vs bleeding,
game.js:34276) and the eurika tent-breach path (`wandererTentBreach`,
game.js:22845). **r32's "untested, not broken" is closed: TESTED, WORKING.**
The "build fuel" half of the alien pool is real.

### P2 — wild end-to-end (report-only): not observed

| seed | days | end | wave | alive | natural alien infections | ability fires |
|------|------|-----|------|-------|--------------------------|---------------|
| 9971 | 101 | survived | 2 | 8/8 | 0 | 0 |
| 9972 | 87 | village-lost | 3 | 4/4 | 0 | 0 |
| 9973 | 101 | survived | 4 | 8/8 | 2 (day 64: eurika + east_nile, two mosquito bites, scholar) | 0 |
| 9974 | 101 | survived | 2 | 10/10 | 0 | 0 |

The one wild infection event: 9973 day 64, the scholar (Consuelo Zhong) killed
two giant_mosquitoes; each bite applied one virus (`mosquitoBiteVirus`
50/50 — min-maxers can seek both, per the r10 comment). She held both for
7 days — then died in combat on day 71 and the mantle passed to Yevgeny
Komarov; succession wiped the statuses ("new body, no old afflictions,"
ledger.js:916 — Steve 2026-10-07, confirmed working as designed). During the
7-day hold, ZERO wanderer casts occurred (the single 9973 wanderer was cast
pre-infection and never contacted — one un-contacted wanderer blocks future
casts), so neither ability had a trigger. A second succession followed on
day 95 (Yevgeny → Aki Tanaka).

**Wild shape, measured:** infections land rarely (1 event / 4 seeds here;
1 / 4 seeds in r32), holds are cut short by combat death + succession wipe,
and the ability triggers (wanderer cast/contact) are themselves infrequent —
so the "seek it as build fuel" window is narrow in the wild. The abilities
work (P1); the channel is quiet, not broken. Whether it should be louder is
a Steve call — same parking as r32/r33.

### M1 winnable: PASS (3/4 alive at end)
9971/9973/9974 survived to day 101 (waves 2/4/2). 9972 lost the village on
day 87 to a wave-3 combat bloodbath (7 villager combat deaths + The
Moderator + contest + lockjaw — 10 person-deaths). A feared wave doing its
job, not a deepening wall.

### M2 people: PASS (6 transcripts sense-read, 0 senseless)
Stan (exterminator — "The randomness would almost be kinder," invites you on
his trap line), Ramiro (zookeeper, seek_taken — asks about his taken kin
Sofia; player PROMISES to ask the System — the ending owes), Aki
(Japanese-only fisherman — the language barrier played straight through
non-verbal beats), Meera (dentist, ask_favor — the cistern's nearly dry,
"Haul the creek with me at dawn?"), Fiona (locksmith, ask_favor — "I hate
to ask twice," declines carry consequence: "They won't raise it again"),
Dwayne (sign painter — "Did you leave someone behind?" … "saying it out
loud makes it real in a way I can't afford yet"). All 12 transcripts landed
with per-villager filenames (r32b fix verified — no overwrites).

### R2 narration: PASS (probe)
All three ability narrations read on the page with honest mechanical teeth
(direction named, ambush negated, kcal counted).

## VILLAGE ASSESSMENT (plain words)

- **9971:** Eight alive at day 101, wave 2. A quiet competent village —
  aquarium keeper, zookeeper, exterminator, interpreter, aide, midwife. Four
  villager deaths all run (2 combat, 1 ambush, 1 monster). The war stayed
  small; the wave stayed low.
- **9972:** The village that bled out at wave 3. Four left at day 87 after
  combat took seven, the Moderator one, a contest one, lockjaw one. Wave 3
  is feared the way the design intends — this one just lost.
- **9973:** Eight alive at day 101, wave 4. Three successions (Alma →
  Consuelo day 49 → Yevgeny day 71 → Aki day 95) — the mantle moved through
  combat deaths while the village held. Consuelo carried both mosquito
  viruses for a week; the village never knew what she almost became.
- **9974:** Ten alive at day 101, wave 2. Carpenters, florist, journalist,
  locksmith, midwife, HVAC tech — the specialist economy humming, two
  villager deaths all run.

## BLANKS FILLED / DOCUMENTED

1. **FILLED — the alien-pool abilities are proven (r32's "untested, not
   broken").** 13/13 probe PASS on the real trigger paths; blood-sense and
   tent-breach code-verified. The build-fuel half is alive.
2. **DOCUMENTED — wild end-to-end rarity + succession interaction.** Natural
   infection → ability firing was not observed in 4 seeds: 1 infection event,
   7-day hold, 0 wanderer triggers, succession wipe on death. Measured, not
   moved — the trigger cadence and the wipe are landed design (Steve
   2026-10-07). If Steve wants the "seek it as build fuel" fantasy louder,
   the levers are wanderer recurrence and hold length, not the abilities.
3. **NOTED — probe-harness lesson (mine): `checkEncounter()` early-returns on
   safe tiles.** The first probe revision failed 8/13 because the fresh
   scholar starts at haven. Fixed in-probe (goWild helper). Worth remembering
   for future encounter probes.

## JUDGMENT: reachable / fun / winnable (deepening leg)

- **Reachable:** the abilities are reachable — infections land naturally
  (9973, r32's 9941) and the probe proves the triggers work. The wild window
  is narrow but real.
- **Fun:** yes — the crow direction callout, the mosquito-sense save, and
  the engorge beat all read as earned alien weirdness; 6/6 transcripts show
  villagers as people.
- **Winnable:** yes — 3/4 villages reached day 101; the loss was wave-3
  combat, the designed fear.

## METRIC REVIEW

- P1's 13/13 stands; no metric proved wrong. The probe's first revision
  (safe-tile early return) was a harness bug, fixed in-probe — the "goWild"
  helper is now in the committed script.
- P2's "wild end-to-end" bar was aspirational and report-only: not met, but
  the probe carries the verdict, so no revision proposed. A future wild-E2E
  run would want wanderer-dense seeds, not more seeds.
- M1 PASS (3/4), M2 PASS (6 transcripts, 0 senseless). The r32b per-villager
  filenames and the array-aware scholar status reader both verified working
  (12/12 transcripts; the 9973 succession wipe read correctly as []).
- TELEMETRY CHECK (body step 14): SKIPPED with reason — same as r33: the
  deepening baseline carries panel metrics the r34 instrument does not emit;
  a check would false-alarm on instrument mismatch. The r34 JSONs carry the
  alien-pool census instead.
