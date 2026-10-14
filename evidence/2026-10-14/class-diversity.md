# Class diversity: job → path lean and a wider level-up window (2026-10-14)

Law: "Gods are rough representatives of what starts out as jobs and classes,
or playstyles." / "Villagers and players should get the same XP, when in
doubt we treat them the same way." / "There should be maybe 8 natural level
ups plus a few other gifts or events etc that compete for those 6 slots."
(`docs/godpath/STEVE-ANSWERS.md`)

## The problem

Only about 8 of the 20 subclasses formed across 64 capable-bot seeds. Every
holder of a track was offered the same next 3 kit entries, so the same paths
formed in every run. Re-ordering the kits was tried and reverted
(`godpath-buff.md` §2), because it moved the early survival entries and raised
deaths. This change leaves kit order alone.

## What changed

| Lever | Where | Rule |
|---|---|---|
| **Job → path lean** | `characterGen.json` occupations[].`pathLean` (all 55 jobs, 1 or 2 paths each) | Before the System names a class, a level-up or gift sheet carries at least one offer on the holder's job path, if the window holds one. It replaces the deepest slot that isn't the emerging-path pick. Once a class is named, the existing class lean takes over |
| **Wider window** | `godpath.js kitSheet`; data in `godpaths.json rules.offers` (`window` 6, `windowDecay` 0.7, `jobLean`) | A sheet draws its 3 offers from the next 6 unheld entries of the track's kit. Entry *i* has weight 0.7^*i*, so power order holds on average, and the offers show in kit order. The draw is deterministic per holder, track and level: an FNV-1a hash feeds mulberry32. It never touches `Math.random` |
| **One function** | `tracks.js levelUpOffers(track, level)` and `villager-build.js villagerLevelUpOffers(vid, track, level)` | Both call `Game.kitSheet`. Villagers still choose with `buildScore` |

These are unchanged: the 5-threshold "~8 level-ups", the 6 slots, the
recognition rule (3 or more of one path), the capstone gates, the class lean
and `payoffAnyTrack`.

### Job → path table

| Job | Lean | Job | Lean |
|---|---|---|---|
| ER nurse | caregiver | locksmith | drifter, miser |
| line cook | forager, survivalist | welder | brawler, survivalist |
| hunting guide | hunter | roofer | brawler, explorer |
| electrician | survivalist, hunter | mason | shieldbearer |
| ESL teacher | socialite, caregiver | HVAC tech | survivalist |
| interpreter | caregiver, socialite | appliance repair | miser, survivalist |
| mechanic | survivalist, miser | blacksmith | brawler, shieldbearer |
| paramedic | caregiver, survivalist | exterminator | hunter, drifter |
| farmer | forager | glazier | explorer, shieldbearer |
| carpenter | shieldbearer, miser | beekeeper | forager, hunter |
| librarian | explorer, caregiver | butcher | brawler, forager |
| trail crew | explorer, drifter | baker | forager, survivalist |
| army medic | caregiver, shieldbearer | fisherman | hunter, survivalist |
| fishing guide | explorer, hunter | rancher | hunter, brawler |
| gardener | forager | chef | forager, socialite |
| midwife | caregiver | forager | forager, explorer |
| dentist | caregiver, miser | vintner | miser, forager |
| pharmacist | caregiver, survivalist | mushroom grower | forager, explorer |
| veterinarian | hunter, caregiver | sailor | explorer, survivalist |
| physical therapist | caregiver, brawler | programmer | explorer, drifter |
| firefighter | survivalist, shieldbearer | truck driver | drifter, explorer |
| police officer | shieldbearer, socialite | artist | socialite, drifter |
| 911 dispatcher | socialite, explorer | musician | socialite |
| social worker | caregiver, socialite | journalist | socialite, explorer |
| mortician | caregiver, survivalist | lawyer | miser, socialite |
| plumber | survivalist, drifter | tailor | miser, caregiver |
| soldier | shieldbearer, brawler | pilot | explorer, drifter |
| bartender | socialite, miser | | |

Every path is some job's lean. Primary leans are spread out: caregiver 10,
forager 8, explorer 7, socialite 6, and 2 to 5 for each of the others.

## Proof

`scripts/test-class-diversity-20261014.js` passes 22 checks and is on the
green list (quick). It proves:

- Every occupation has a valid `pathLean`.
- An unrecognised nurse, player or villager, gets a caregiver offer on every
  craft sheet. A plain "next 3" sheet would hold none.
- After the class is named Feaster, every sheet leans forager, and caregiver
  is no longer forced.
- Offers always come from the next 6 entries, and the same holder, track and
  level always get the same sheet.
- Sheets vary by level and by holder.
- Earlier entries are offered more often.
- Building a sheet consumes no `Math.random` (player and villager paths).
- `levelUpOffers` and `villagerLevelUpOffers` both call `Game.kitSheet`.

`test-parity-20261014` now pins its strange kit to exactly the three entries
it tests. This is the design change, made on purpose; the assertion is
unchanged.

## Measurement

**Setup:** capable bot, 150 days, one process per seed
(`scripts/godpath/sweep-buff.js --all`). The 64 seeds are the standard 16
plus seeds 10–41 and 43–58. The headline pair is on the **merged base**
(origin/master a2618bb3, after the origins/fauna trim and the feel pass).
Before = that base; after = that base plus this change.

| | Before (merged) | **After (merged)** |
|---|---|---|
| **Subclasses seen (player + villagers)** | 6 / 20 | **10 / 20** |
| Player class recognised | 59% | **72%** |
| Villagers classed (sum over runs) | 52 | **69** |
| Player ascensions (runs past day 100 that ascended) | 12 (6/16) | **20 (13/27)** |
| Villager ascensions | 14 | **19** |
| Won / sat at the Table | 36 / 36 | **30 / 31** |
| Invited | 47 | 39 |
| Village lost | 24 | 25 |
| Median days | 94.5 | 97.5 |
| Deaths: the bearer | 281 | 302 (+7%) |
| Deaths: villagers | 384 | 375 |
| Deaths: other people | 327 | 330 |
| **Human deaths, total** | 992 | **1007 (+1.5%)** |

Subclasses after the change: forager/gardener 31, hunter/stalker 30,
forager/feaster 30, hunter/beastmaster 10, socialite/showrunner 10,
survivalist/furnace 7, caregiver/healer 6, drifter/trickster 4,
socialite/demagogue 2, caregiver/keeper 1. Before: forager/feaster 40,
forager/gardener 28, hunter/stalker 28, hunter/beastmaster 7,
survivalist/furnace 2, explorer/cartographer 1.

### Every configuration measured (64 seeds each)

| Configuration | Base | Subclasses | Won | Lost | Human deaths | Class % | Ascensions (player / villager) |
|---|---|---|---|---|---|---|---|
| Before | old (0cda22b0) | 8 | 27 | 29 | 960 | 53 | 10 / 22 |
| **window 6 / 0.7, job lean in window** | old | 10 | 40 | 21 | 912 | 66 | 19 / 14 |
| same, job lean at any kit depth | old | 11 | 34 | 27 | 931 | 66 | 18 / 14 |
| window 8 / 0.8 | old | 11 | 33 | 27 | 895 | 64 | 17 / 23 |
| window 8 / 0.8, any depth | old | 11 | 29 | 31 | 916 | 63 | 16 / 22 |
| window 10 / 0.85, any depth | old | 11 | 38 | 20 | 969 | 63 | 18 / 17 |
| Before | merged | 6 | 36 | 24 | 992 | 59 | 12 / 14 |
| **window 6 / 0.7 (shipped)** | merged | **10** | 30 | 25 | 1007 | 72 | 20 / 19 |
| window 8 / 0.8 | merged | 10 | 28 | 31 | 950 | 67 | 20 / 15 |

Rows are in `class-diversity-sweep.json`.

### Reading it

- **The target was 14 of 20 subclasses. It was not met.** Seen went from 6
  to 10 on the merged base and from 8 to 10 on the old one. Every variant
  plateaus at 10 or 11: a wider window, a deeper job lean, or both.
- **Deaths did not rise materially.** Human deaths rose 1.5% on the merged
  base and fell 5% on the old one. Bearer deaths rose 7% on the merged base,
  under the 10% line. So the window weighting was not retuned, and the
  executive numbers (6 and 0.7) stand.
- **Wins moved in opposite directions on the two bases:** +13 on the old
  base, −6 on the merged base. The village-lost count barely moved (+1 and
  −8). `godpath-buff.md` already showed a one-line change swinging a 32-seed
  sweep by 4 wins. I read wins as noise around no effect, not as a cost.
  Watch it on the next sweep.
- **Classes form more often and more variously.** Player recognition rose
  from 59% to 72%, villagers classed from 52 to 69, and player ascensions
  from 12 to 20. Socialite, caregiver and drifter classes now form where they
  didn't before.
- **Ten subclasses still never form:** brawler (berserker and juggernaut),
  shieldbearer (bulwark and warden), explorer/seer, survivalist/undying,
  miser (hoarder and dealer), drifter/phantom and caregiver/keeper (1). Their
  entries sit at kit depth 7–20, past any window that keeps the early
  survival entries on the sheet. The capable bot and `buildScore` also never
  favour a 1-ability job lean over a held build. Reaching 14 likely needs one
  of these (NEEDS-STEVE):
  - a job-path term in `buildScore`'s `buildPathLean` (the brief said "as
    now");
  - per-deed XP (more sheets per villager);
  - moving one entry per rare subclass into the first 6 of some track. That
    is a narrow re-order, not the reverted interleave.

## Job → background skills balance (coordinator request)

Steve: "Job to skills sounds right if it's balanced well." Nine jobs carry
extra skills from `knowledge.json` backgrounds: soldier, police officer,
firefighter, rancher, mortician, locksmith, bartender, hunting guide and
exterminator.

**Method:** `FORCE_OCC=<job>` (new in `sweep-buff.js`) gives the starting
bearer that job on the same seed. Only the first character's occupation pool
is swapped, so the RNG draw count matches. Each job ran on the 16 standard
seeds for 150 days on the merged base plus this change. Four jobs without the
new pairings are controls. Natural draws are too sparse to judge: 12 of 64
runs started as a paired job.

| Job | Group | Runs | Won | Village lost | Median days | Bearer deaths | Human deaths |
|---|---|---|---|---|---|---|---|
| soldier | paired | 16 | 6 | 8 | 94 | 72 | 243 |
| police officer | paired | 16 | 8 | 6 | 97 | 61 | 229 |
| firefighter | paired | 16 | 10 | 5 | 95 | 75 | 256 |
| rancher | paired | 16 | 6 | 8 | 93.5 | 77 | 217 |
| mortician | paired | 16 | 11 | 3 | 94 | 62 | 206 |
| locksmith | paired | 16 | **12** | **3** | 94 | 68 | 224 |
| bartender | paired | 16 | 4 | 8 | 99.5 | 70 | 255 |
| hunting guide | paired | 16 | 6 | 8 | 94.5 | 84 | 240 |
| exterminator | paired | 16 | **3** | **12** | 94 | 70 | 240 |
| ER nurse | control | 16 | 9 | 6 | 98.5 | 84 | 255 |
| farmer | control | 16 | 5 | 9 | 90.5 | 67 | 237 |
| programmer | control | 16 | 8 | 7 | 91.5 | 76 | 214 |
| glazier | control | 16 | 6 | 5 | 98 | 63 | 237 |
| **Paired, pooled** | | 144 | 66 (46%) | 61 (42%) | | 4.4 / run | 14.7 / run |
| **Control, pooled** | | 64 | 28 (44%) | 27 (42%) | | 4.5 / run | 14.7 / run |

**Verdict: balanced as a group.** Pooled, the paired jobs match the controls
on wins, villages lost and deaths per run.

Two possible outliers, flagged but not retuned. Neither is egregious: 16 runs
give a binomial spread of about ±2 wins.

- **Exterminator** is weak: 3 won, 12 lost. That is about 2.5 standard
  deviations below the mean of about 7 wins.
- **Locksmith and mortician** are strong: 12 and 11 won, 3 lost each.

To confirm, run 32 seeds of exactly these three (`FORCE_OCC=… SEEDS=…`)
before acting.

## Checks

- `check-wired` on godpath.js, tracks.js and villager-build.js: 0 unwired.
- `validate-ontology`: OK.
- godpath validate (65) and ladder (25): green.
- `check.js --quick`: 88 passed, on the merged branch.
- Full `check.js` before the merge: 852 passed and 4 failed. All 4 are on the
  known load-flaky list and pass standalone: enter-building-guard,
  deterministic-clock, scale-lead-fix and simopt-trajectory.

## Logged, not fixed

- On craft sheets, the distinct-roles swap in `shapeOffers` always pulls
  craft's only enabler, Green Whisper. This is older behaviour, but it is one
  reason forager/gardener stays dominant.
- `test-class-diversity` requires every occupation to have a `pathLean`, so a
  new occupation must name one.
