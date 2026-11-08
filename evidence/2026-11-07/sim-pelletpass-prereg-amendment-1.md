# Prereg amendment A1 — trigger v2: single-dawn hunger read, no meter streak

Date: 2026-11-07 (same day, before the panel, after implementation probe).
Amends `sim-pelletpass-prereg.md` §(a) and §(b). The numbers N=3 and the
cooldown (30 days) and the hunger measure (`needs.hunger > 70`) are
UNCHANGED. Only the D=3 consecutive-dawn streak is removed.

## Why (probe evidence, not panel results)

Probe `/tmp/pellet-dynamics.js` (seed 42, constructed 99767-shape state,
6 villagers stamped at hunger 95, empty pantry, real `Game.endDay()` loop):

- Dawn 0: hunger `[95×6, 30×5]`, 6 above 70.
- Dawn 1: hunger `[30,30,23,28,43,56,0,0,1,0,12]`, ZERO above 70.
- Dawn 2+: all hunger ~0. `pg.hungryStreak` stayed 0 throughout.

Root cause (code read): `villagerMealDay` eats self-production FIRST
(`ownEat = min(produced, need)`, `villagerDayProduction` ≈ a full meal for
every villager) and then drops the meter by `(ate/need)*70`. The hunger
meter is a slow stock that RISES ~3–8/day when unfed but FALLS ~70 on one
decent meal. Reaching >70 takes ~2 weeks of near-zero intake; one fed day
clears it. A 3-consecutive-dawn streak above 70 therefore requires 3 MORE
days of total deprivation after weeks of it — a famine-only trigger that
almost never fires in a living village. That is the exact dead-lever
failure mode Steve rebuked (2026-11-01): a lever that never fires.

The game's own multi-day hunger fact (`pg.hungryStreak`, the hunger-winter
clock: someone ate <60% of need, 3 days running) does not save the streak
either: in the same probe it stayed 0 with an EMPTY pantry, because
self-production covered ≥60% of need. And it anti-correlates with the
meter: 3 days at 50% intake leaves the meter near 0, so requiring BOTH
signals is requiring weeks of near-zero intake.

## Trigger v2 (replaces the D=3 streak)

At each dawn (`progDaily()`), the pellet passes when:

1. The System has arrived.
2. A bearer is actually pellet-fed (unchanged: `fusionReactorOnline()` for
   a player bearer; alive + `npcHasAbility(vid, 'fusion_reactor')` for a
   villager bearer; a stale holder counts as not fed).
3. **≥ N = 3 living present non-bearer villagers have
   `needs.hunger > 70` at THIS dawn.** No streak. The meter above 70 IS
   the sustained-deprivation fact — it takes ~2 weeks of under-eating to
   get there, so a single dawn reading it is not noise, it is the end of a
   long hungry stretch. `progDaily` runs BEFORE `villageEats` inside
   `endDay`, so the read is yesterday's end-of-day hunger, honestly.
4. **Cooldown 30 days between passes** (unchanged) — this, not a streak,
   is what stops churn. The pellet can migrate down the hunger list at
   most once a month during a famine, which is the intended behavior:
   it keeps finding the hungriest hands.

Transfer, voice, telemetry, and the stale-holder / fed-village rules are
unchanged from the prereg. State is now `state.pelletPass =
{ lastPassDay }` (the `hungryDays` streak field is dropped).

## GO bar changes

- §(b) item 1 becomes: pass fires **on the first dawn** on >= 7/8 armed
  hungry-village seeds (phase A runs 3 dawns; the pass is expected on
  dawn 1, since the stamped hunger is read before the day's meals).
- Items 2–4 unchanged (feast grants + combat spends + seat prices on
  >= 7/8; fed control 0 passes on 8/8; baseline 0 passes / 0 seats on 8/8).
- Panel construction change: the pantry is stocked generously in phase A
  (the thin-pantry idea is obsolete with v2 — the stamped hunger is the
  test input, and a stocked pantry keeps the famine/scattering clock out
  of the way). The hungry villagers are still stamped at hunger 95.
