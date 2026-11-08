# Living Garden / harvest_fed — seeded attainment panel

Measure-only. No garden yield or ability-price retunes (Muse).

## Identity

| Field | Value |
|---|---|
| Tip | `origin/master` at branch cut (`b74db6460` family; deed from gap PR #5) |
| Script | `scripts/godpath/test-living-garden-deed-attainment.js` |
| Seeds | screening 16: `7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9` |
| Authored deed | `harvest_fed` — 7 consecutive days; every other living neighbor ≥400 kcal from the producer's `harvestShares` |
| Raw | `evidence/2026-11-08/living-garden-deed-attainment-panel.{json,log}` |
| Companion unit | `scripts/godpath/test-forager-deed.js` (25/0) |

## Verdict

**Hardness, not missing wiring.**

The gate is live: stripping the authored deed restores synergy proxies (failing
control 16/16). Prepared sole-attribution pantry clears the streak at
baseline-like roster sizes (9 neighbors, 3600 kcal/day floor) 16/16 and
ascends Living Garden. A short natural lean (21 endDays, gardener kit, no free
village-wide tagged stores) never opens a pending streak (max 0) and never
ascends. That matches prove-out baseline census #2: forager classes common,
`living_garden` holders zero — opportunity is class-open; the consecutive
provenance streak is the bottleneck. Do not retune yields from this panel.

## Panel summary (16/16)

| Arm | Result |
|---|---|
| Wiring armed blocks synergy proxy | 16/16 |
| Failing control: deed removed → synergy opens | 16/16 |
| Restored deed blocks again | 16/16 |
| Prepared 2-neighbor tagged → complete + ascend | 16/16 |
| Roster scale tagged complete @ 2/4/8/9 neighbors | 16/16 each |
| Anonymous day or under-floor tagged kcal breaks streak | 16/16 |
| Natural lean complete / ascended | **0 / 0** |
| Natural lean max streak | **0** (mean 0) |

## Hardness shape (why bots with gardener never god)

1. **Every** other living neighbor must clear the 400 kcal producer floor the
   same calendar day — mean living NPCs on forager baseline runs ≈ 8.9 →
   ~3600 sole-attribution kcal/day before a streak day counts.
2. Streak is consecutive; one anonymous or diluted day resets to zero.
3. Magical Feed the Multitude stays provenance-free (by design) and cannot
   mint the deed.
4. Prepared tagged pantry proves the observer/ceremony path; natural
   production mixes sources, so the lean never even pending-streaks in 21d.

Numerical garden prices and policy lean stay **Muse**. Optional follow-up:
typed `godpath_deed` event-id census on a full campaign panel (instrument).
