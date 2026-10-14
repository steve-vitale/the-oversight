# Region start: first-run landing and real-date season (2026-10-14)

Steve (verbatim, `docs/godpath/STEVE-ANSWERS.md` round 2): "Maybe first run
let them land in the origin they choose a character from. Random after." /
"Yes that's okay to run a wet/dry year. Whenever the player starts, should be
the season the game starts in. Like it happened right when they started
playing, for immersion."

Design: `docs/WORLD-REGIONS.md` §10 Q1/Q4 (answered) and §11 (calendars).

## What was built

| Piece | Where |
|---|---|
| Run counter (own key `oversight.runs.v1`; first run = none counted and no save/tombstone on the device) | `world.js` `runsStarted`, `noteRunStart`, `isFirstRun` |
| First-run landing: origin region if playable, else same climateFamily, then continent (origin's neighbors first), then `na_eastern_woodlands` | `world.js` `firstRunLanding`, `game.js` `pickLandingRegion` |
| `region_start` telemetry: `why` (`first_run_origin` / `random` / `debug`), `via`, `calendarDate` | `game.js` `newGame` |
| 10 climate calendars, one per climateFamily; every stub names its calendar | `src/data/climates.json`, `regions.json` `climate.calendar` |
| Real date → day 1's day-of-year, saved as `state.calendarStart`; `season()` reads it | `world.js` `regionCalendar`, `calendarStartFor`; `game.js` `season` |
| Validator: calendars cover the year, 12-month maps, unbroken month runs in season order, weather sums to 1, family → calendar exists | `scripts/validate-regions.js` |
| Proof (55 checks, under 1 s, green list quick) | `scripts/test-region-start-20261014.js` |

## Zero behaviour change (only the season label moves)

Method: same 8 seeds (7, 42, 99, 1234, 555, 777, 2026, 31337) × 2 origins
("Columbus, Ohio", "Lagos, Nigeria"), capable bot, 60 days, harness
`scripts/sim-harness.js`. Before = `origin/master` 5aeca451, after = this
change. Compared per run: landing, end, days, population, deaths, pantry,
codex size, the telemetry type/day stream, the full telemetry (minus the
region_start label fields), and an md5 of every top-level state key (minus
`pacing`, wall-clock, and the new `calendarStart`).

Result: **identical on all 16 runs, every field, every state key.** The
`region_start` timestamp is identical too: newGame makes one `Date.now()`
call and reuses it as that event's timestamp, so the harness's counting
clock ticks exactly as before (the earlier region-engine change shifted
seed 777 that way; this one doesn't).

| origin | seed | end | pop | deaths | season day 1 | why/via |
|---|---|---|---|---|---|---|
| Columbus | 7 | survived | 8 | 20 | spring → fall | first_run_origin/origin |
| Columbus | 42 | survived | 9 | 18 | spring → fall | first_run_origin/origin |
| Columbus | 99 | survived | 11 | 16 | spring → fall | first_run_origin/origin |
| Columbus | 555 | village-lost | 2 | 21 | spring → fall | first_run_origin/origin |
| Columbus | 777 | survived | 7 | 28 | spring → fall | first_run_origin/origin |
| Columbus | 1234 | survived | 8 | 25 | spring → fall | first_run_origin/origin |
| Columbus | 2026 | survived | 8 | 28 | spring → fall | first_run_origin/origin |
| Columbus | 31337 | survived | 8 | 26 | spring → fall | first_run_origin/origin |
| Lagos | 7 | survived | 7 | 21 | spring → fall | first_run_origin/default |
| Lagos | 42 | survived | 7 | 21 | spring → fall | first_run_origin/default |
| Lagos | 99 | survived | 10 | 21 | spring → fall | first_run_origin/default |
| Lagos | 555 | survived | 1 | 33 | spring → fall | first_run_origin/default |
| Lagos | 777 | survived | 10 | 20 | spring → fall | first_run_origin/default |
| Lagos | 1234 | survived | 9 | 28 | spring → fall | first_run_origin/default |
| Lagos | 2026 | survived | 8 | 27 | spring → fall | first_run_origin/default |
| Lagos | 31337 | survived | 4 | 30 | spring → fall | first_run_origin/default |

Sims are deterministic: the harness freezes `Date.now` at 1760400000000
(2025-10-14 UTC), so every sim run starts in fall (eastern woodlands doy 210).
The date is read in UTC, so the machine's time zone can't move it.

## Defaults adopted (Steve can overrule)

- **"First run" is per device.** Counted in localStorage `oversight.runs.v1`.
  A device that already has any save or tombstone counts as played, so
  existing players don't get a "first run" after this update.
- **Run counter is not in the meta store.** `oversight.meta.v1` promises
  newGame never reads it (`metaProgression.js` rule, asserted by
  `test-meta-progression-20261010.js`). So the counter sits beside it.
- **Real date is the UTC date**, not local time: deterministic sims, and it
  only matters within a day of a season boundary.
- **Placement within the season is proportional.** Mid-October is 44% of the
  way through Sep–Nov, so day 1 is 44% of the way through the region's fall.
- **Old saves keep the old rule** (day 1 = first day of spring). No season
  jump in the middle of a run.
- **Calendar months are written for the north**; a southern region reads them
  six months on. A region can give its own literal `climate.months`.
- Stub calendars are metadata: weather tables for heat/storm kinds are rolled
  but have no effects yet (known gap from the region engine).

## Known gaps (non-critical)

- The season isn't shown anywhere in the UI yet (it wasn't before either).
  The eastern woodlands' weather is the same in every season, so starting in
  fall changes nothing a player can feel until seasonal content exists.
- The wet/dry calendars are reasonable approximations per climate family,
  not per-country accuracy; Muse can override `climate.months` per region.
