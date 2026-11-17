# sim-haventickgate-b — DIAG: WHY do half the villages never ignite a plan?

**Arm:** sim-haventickgate-b (Loop B, run `fleshout-loop-b-20261117T0430Z`,
axis winnability chain, tracker blank #4 successor — haventick-b's named
next diagnostic #1).
**Prereg:** `evidence/2026-11-16/sim-haventickgate-b-prereg.md` (frozen;
no correction — the frozen design held as written).
**Prior art:** `evidence/2026-11-16/sim-haventick-b.md` + prereg;
`evidence/2026-11-16/sim-planignite-a.md` + prereg (the direct parent
instrument this arm extends; its catch-22 is the working hypothesis
re-tested here on a fresh band with the store guard counted directly
from the calls); `evidence/2026-11-16/sim-seedpaths-b.md` + prereg.
**Type:** DIAG — instrument + per-condition failure table. No game
change, no default flipped. No seed call anywhere on either leg.
**Seeds:** 103211–103218 (8-seed pilot, 150d death-aware, policy
competent verbatim, sha `df9b7dff4de4`). Fresh band (coordinator-verified
per the seed-band skill; no prereg names any seed in it).
**Branch:** `sim-haventickgate-b`. **Worktree:**
`~/workspace/worktrees/sim-haventickgate-b`.
**Base:** master `eb8e0cc18` at arm start (the worktree HEAD; master has
since moved under Loop A — NOT rebased, coordinator owns the rebase at
landing).

## GO verdict: GO — instrument valid, all four prereg bars pass

| # | Prereg bar | Result |
|---|---|---|
| 1 | Corpus + instrument: 8/8 files parse each leg (16), 0 instrument errors either leg, 0 tick-gate mismatches, 0 null-tick calls, 0 unknown sources/paths, ledger clean (holdersWithoutCreation 0), store cross-check agrees | **PASS** — 16/16 parse; errors 0/0; mismatches 0; null-tick 0; unknown 0/0; holdersWithoutCreation 0; censusUnexplained 0; storeCrossDisagree 0 |
| 2 | Proof green: `scripts/test-haventickgate-b.js` — static/judge/recorder + D1/D2 (60d, seed 103211) + 150d replica validation + taxonomy re-derivation fixtures; cross-leg neutrality 8/8 identical | **PASS** — **102/102**; D1 identical corpus, D2 identical trajectories; neutrality 8/8 identical on (days, gameDays, endReason, standing, scaleRank, maxWave, won, deaths, waveKillLog) |
| 3 | Classification completeness — every empty seed classified by the frozen taxonomy | **PASS** — 3 empty seeds, all 3 classified `store-never-initialized`, 0 unclassified, 0 unexplained |
| 4 | Wall numbers on both legs | **PASS** — below (identical on both legs) |

**The VERDICT is the per-condition failure table itself plus the
classification of every empty seed** (below). A DIAG GO means the
instrument is valid and the table is trustworthy — not that any path
"wins".

## The answer, in plain words

**It is the store, and only the store.** On this fresh band 3 of 8
villages never start a plan in 150 days (103215, 103216, 103217) — and
on all three the plan store simply never existed. Not a profile
problem: each village had 4–8 rangers. Not a Haven-presence problem:
rangers reached the havenTick call 89, 203, and 192 times. Not an
engagement problem: the village had heard of slain beasts from day 4,
8, and 5. Every single one of those reached calls — 89, 203, 192 —
died at the same line: `if (!v || !v.winPlan) return null`
(win-plan.js:343). The gate's own conditions were met and the call
still returned null, because there was no store to read. Across the
three empty seeds, 456 ranger+engaged calls were eaten by the guard
(87 + 187 + 182), spanning day 4 to day 149 — the whole run, not an
early-days transient.

The ignited seeds prove the same mechanism from the other side: on
all five, the store spent part of the run uninitialized too — 37, 100,
1, 28, and 54 ranger+engaged calls were eaten before the first
initializer arrived (seed 103212 waited until day 83, hearing about
slain beasts since day 6, while 100 would-be creations died at the
guard). The village that hears the fire talk on day 6 and gets its
first plan on day 83 lost 77 days of planning to a store that did not
exist yet. On 2 of the 5 ignited seeds the initializer IS the first
creation (a wave-3+ seed row both switches the store on and plants
the plan in the same call); on the other 3 a villager's kill
(`winPlanNoteKill`) switches it on and a havenTick creation follows
the same day or the next. First creation falls on or after the first
initializer day on 5/5 seeds.

The two initializer kinds observed: `winPlanNoteKill` (an expedition
/ agency kill, days 5, 21, 30) and `winPlanSeedFromFight` (a wave-3+
seed row, days 83, 95). No bond/muster initializer fired anywhere on
the band. The driver-recorded `storeInitEvents` and the analyzer's
independently derived initializer table agree exactly on all five
ignited seeds (kind and day), and the store cross-check (events day
vs first `storeExists=true` village day) agrees on 8/8 seeds.

## Before / after on identical seeds (OFF vs ON — the recorder leg)

There is no before/after lever here: both legs are master as-is, and
the legs differ only by the recorder wraps. The comparison IS the
neutrality proof — and it is exact:

| | OFF leg (recorder off) | ON leg (recorder on) |
|---|---|---|
| Seeds / files | 8 / 8 | 8 / 8 |
| Instrument errors | 0 | 0 |
| Standing (per seed) | 190 / 199 / 199 / 160 / 295 / 175 / 375 / 199 | identical, 8/8 |
| Scale rank | regional, 8/8 | identical, 8/8 |
| Wave-4 kills / wave-5 kills (all sources) | 21 / 2 | 21 / 2 |
| Deaths (all causes) | 557 | 557 |
| National by standing ≥200 / by scaleRank | 2 / 0 | 2 / 0 |
| Table / wins | 0 / 0 | 0 / 0 |
| Wave-4 reached / wave-5 reached | 8 / 2 | 8 / 2 |
| Median survival (gameDays) | 151d | 151d |

The recorder does not perturb the game on any of the 8 seeds, on any
compared field — including the full death lists and the final wave
kill logs.

## The per-condition failure table (the deliverable)

One row per seed. Layer-1 buckets are ranger-tick first-fail counts
from the agencyTick replica (modal-ranger villagers, summed over
`tickGateTotals`; `player-skip` = ticks where the villager was the
current scholar after a succession — the loop correctly skips the
scholar, so those ticks are no-call by design, not a gate failure).
Layer-2 outcomes are the havenTick call outcomes (all calls, all
profiles). `storeBlocked` = store-guard-blocked calls: ranger +
engaged + no plan + store absent — calls that would have created but
for the guard.

| Seed | Empty? | Layer-1 ranger ticks: notAtHaven / night / indoor / onExped / engaged / trigger / reached | Layer-2 call outcomes: store-uninit / created / plan-exists / profile-fail / engagement-fail | storeBlocked | Store |
|---|---|---|---|---|---|
| 103211 | ignited (9 creates) | 314 / 105 / 125 / 372 / 18 / 7 / 113 | 43 / 6 / 56 / 0 / 0 | 37 | noteKill d21 |
| 103212 | ignited (2) | 492 / 152 / 90 / 113 / 1 / 10 / 122 | 109 / 1 / 9 / 0 / 0 | 100 | seed d83 |
| 103213 | ignited (5) | 107 / 77 / 136 / 263 / 2 / 4 / 40 | 7 / 4 / 28 / 0 / 0 | 1 | noteKill d5 |
| 103214 | ignited (3) | 159 / 101 / 147 / 51 / 4 / 30 / 67 | 38 / 3 / 26 / 0 / 0 | 28 | noteKill d30 |
| 103215 | **EMPTY** | 406 / 150 / 111 / 0 / 3 / 9 / **89** | **89 / 0 / 0 / 0 / 0** | **87** | never |
| 103216 | **EMPTY** | 578 / 256 / 310 / 0 / 1 / 36 / **203** | **203 / 0 / 0 / 0 / 0** | **187** | never |
| 103217 | **EMPTY** | 865 / 186 / 57 / 0 / 1 / 25 / **192** | **192 / 0 / 0 / 0 / 0** | **182** | never |
| 103218 | ignited (3) | 369 / 113 / 116 / 38 / 6 / 6 / 85 | 66 / 2 / 17 / 0 / 0 | 54 | seed d95 |

Read the table three ways:

1. **Layer 1 is not the blocker anywhere.** Rangers reach havenTick
   constantly — 40 to 203 reached ticks per seed, including 89–203
   on the empty seeds. The modal Layer-1 bucket on every seed is
   `notAtHaven` (rangers are often out ranging — that is what
   rangers do), but reached ticks are plentiful. The village DOES
   have a ranger at Haven at tick time, again and again.
2. **Layer 2 has exactly one failure mode on this band.**
   `profile-fail` 0 and `engagement-fail` 0 on all 8 seeds — no call
   ever failed on profile or engagement. Every non-creating call is
   `store-uninitialized`: 747 of 899 total calls (83%). On the empty
   seeds, 100% of calls (484/484) are store-uninitialized.
3. **The store is the dominant failing condition, including on
   ignited seeds.** Even the villages that ignite lose 1–100
   would-be creations to the guard before the store exists. The
   store is not a one-time edge for dead villages; it is a tax on
   every village's first weeks (or, on 103212, first 83 days).

## Classification table

| Seed | Days | Standing | Rank | Creates | First creation | Blocker |
|---|---|---|---|---|---|---|
| 103211 | 151 | 190 | regional | 9 | d21 havenTick/heard | ignited |
| 103212 | 151 | 199 | regional | 2 | d83 agency-evade (seed = initializer) | ignited |
| 103213 | 151 | 199 | regional | 5 | d5 havenTick/heard | ignited |
| 103214 | 132 | 160 | regional | 3 | d31 havenTick/both | ignited |
| 103215 | 150 | 295 | regional | 0 | — | **store-never-initialized** (87 blocked, first d4) |
| 103216 | 146 | 175 | regional | 0 | — | **store-never-initialized** (187 blocked, first d9) |
| 103217 | 151 | 375 | regional | 0 | — | **store-never-initialized** (182 blocked, first d6) |
| 103218 | 151 | 199 | regional | 3 | d95 agency-evade (seed = initializer) | ignited |

Blocker tally: ignited 5, store-never-initialized 3, no-ranger 0,
no-engagement 0, ranger-never-reaches-haventick 0,
haventick-called-no-create 0, unexplained 0.

## The store-initializer cross-check (two independent measures agree)

| Seed | Driver event (kind @ day) | Derived first initializer (kind @ day) | Agree? |
|---|---|---|---|
| 103211 | winPlanNoteKill @ 21 | agency kill @ 21 (first agency kill day) | yes |
| 103212 | winPlanSeedFromFight @ 83 | wave-3+ seed row @ 83 | yes |
| 103213 | winPlanNoteKill @ 5 | agency kill @ 5 | yes |
| 103214 | winPlanNoteKill @ 30 | agency kill @ 30 | yes |
| 103215 | — (never) | — (0 seed rows, 0 agency kills, 0 gate avoids, 0 bond/muster) | yes |
| 103216 | — (never) | — (0 / 0 / 0 / 0) | yes |
| 103217 | — (never) | — (0 / 0 / 0 / 0) | yes |
| 103218 | winPlanSeedFromFight @ 95 | wave-3+ seed row @ 95 | yes |

The driver watches the store flip at the `stateOf()` caller; the
analyzer derives the first initializer from seed rows, the final
wave kill log (`via: 'agency'`), gate avoids, and the stats counters.
They agree on kind and day on all 8 seeds. The store cross-check
(events day vs first `storeExists=true` village day) also agrees
8/8. This is not one instrument's opinion twice — it is two
different readings of the same run agreeing.

## HavenTick source split (reproduces haventick-b)

16 havenTick creations on the band: `heard` 14, `both` 2, `lived`
**0** — the third consecutive band with zero lived-only creations
(haventick-b: 0/39; planignite-a's ignited seeds likewise heard-led).
Every havenTick plan starts from hearing the village slew a beast,
never from the ranger's own fought experience alone. The likely
mechanism is still the one haventick-b named (a villager who
personally fights a beast usually gets a plan from the fight itself
before havenTick ever sees them plan-less at Haven), with one new
caveat from this run's sibling arm: sim-zeroattempt-b found fight
narration WITHOUT `know.fought` being written, so the `lived`
channel may under-record as well as be shadowed — see §Metric
review. Either way, `heard` is the only live source on this band.

## Reachability verdict for the wave-4 chain

**Reachable — and ignition, not reachability, is the wall.** All 8
villages unlock wave 4; 2 unlock wave 5; parties launch and plans
create on the 5 ignited seeds. But the chain's first link — a
village starting to think in gameplan terms — is a coin flip gated
on an accident: whether some villager happens to kill a beast on an
expedition, or a wild fight happens to seed, before the village
needs a plan. The two villages that reached national-by-standing
(103215: 295, 103217: 375) are both planless — standing, wave-5
unlocks, and even wave-5 kills (103217: 9 wave-4 kills, 2 wave-5
kills, 62 beasts in the ledger) all happen WITHOUT a single plan.
Plans gate party launches, not kills or standing — so the ignition
failure bites the chain exactly where launches matter (a launched
party that hunts together), while the village keeps killing at the
door. Regional is reached 8/8; national by scaleRank 0/8, table 0,
wins 0. The scale wall does not move on 8 seeds.

## Village assessment, in plain words

Three kinds of village live on this band, and the difference between
them is one accident. On 103213 the village hears of a slain beast
on day 4, a villager kills something on day 5, the store switches on,
and a ranger starts planning the same day — five plans, a working
village. On 103212 the village hears on day 6 and then waits: a
hundred rangers stand at Haven, engaged, ready to think in
gameplan terms, and every one of them is turned away by a store
that does not exist, until day 83 when a wild fight finally seeds
one. On 103217 the village never gets even that accident: it fights
at the door for 151 days, celebrates its veterans on camera, reaches
standing 375, unlocks wave 5, kills two wave-5 beasts — and nobody
ever starts a plan, because 182 times a ranger stood at Haven,
having heard the fire talk about a slain beast, and 182 times the
game said nothing. The villagers act like people the whole time;
they just never act like planners, because the thing that would let
them plan was never switched on. The fix arm (Loop A 0015Z's
sim-planignite-fix-a — initialize the store on first HavenTick) is
the owner of the repair; this DIAG is its evidence, and the evidence
says the repair is worth exactly the villages it wakes: 3 of 8 here,
4 of 8 on haventick-b's band, 2 of 8 on planignite-a's.

## Sense-testing (read the lines, not just the counts)

**The sleeping village (seed 103217, ON leg — master as-is).** The
village meets beasts at the door for five months ("Raj, Devon, Leo
and Brian met them at the door — 2 put down, 2 driven off"), the
System celebrates veteran kills on camera ("Alfredo just put down
Ad Break... on CAMERA. That's a veteran kill, folks. REMEMBER the
name." — day 46; "Mateo just put down Spool" — day 55; "Omar just
put down The Redactor" — day 64), the FINAL DRAFT beat fires on
day 39 — and the recorder shows 192 havenTick calls, 182 of them
ranger+engaged, every one returning null at the store guard. The
narration and the instrument agree: the village fights, teaches,
celebrates — and never plans. The contrast with the same band's
ignited seeds is the store's whole story in one seed.

**The late spark (seed 103212, ON leg).** Heard from day 6. One
hundred blocked calls. Day 83, Carlos Diaz evades a beast on
expedition — the seed row both initializes the store and plants
the first plan in the same call. One havenTick creation follows.
The village heard for 77 days before it could think in gameplan
terms, and the only reason it ever could is that Carlos happened
to meet a beast in the wild and walk away. If he had fought it
instead of evading, or never met it, this seed would be a fourth
empty one.

**The same-day spark (seed 103213, ON leg).** Heard day 4,
store initialized day 5 by a villager's kill, first havenTick
creation day 5, same day. Four havenTick creations, all `heard`.
The mechanism works fine once the store exists — the creation
follows the initializer immediately, every time, on every ignited
seed. There is no second bottleneck hiding behind the store: once
it exists, rangers create on the first engaged call.

**One check, clean:** every recorded `store-uninitialized` call's
caller frame is the agency tick (`villager-agency.js:433`), and
every `storeInitEvents` row's caller names the initializer's real
call site (`expeditionMonster` for the seed rows,
`winPlanNoteKill` for the kills). No row's creator contradicts its
caller — and the `lived`-zero split above is a real property of the
band, not a classifier artifact (the classifier distinguishes
lived/heard/both from the fought/slain counts, and `both` fires
when both are present).

## Blanks filled or documented

- **Haventick-b's named next diagnostic #1, closed.** The
  havenTick gate's three conditions read per tick against the empty
  seeds, plus the store state per seed: profile — rangers exist on
  every empty seed (4–8); Haven presence — rangers reach havenTick
  89–203 times per empty seed; engagement — heard from day 4–8 on
  every empty seed. The failing condition is the store, on 3/3
  empty seeds, with 456 guard-blocked calls as the count.
- **Planignite-a's proposed taxonomy row, implemented and
  validated.** `store-never-initialized` is now a frozen first-class
  row (first match wins, gated on a demonstrably blocked would-be
  creation), and it classifies 3/3 empty seeds on a fresh band —
  where planignite-a's frozen taxonomy had to fail bar 1 with
  `unexplained` on the same shape.
- **Store-init events recorded directly, not derived.** The driver
  now watches all seven `stateOf()` callers and records the
  absent→present transition with kind/day/vid. Two independent
  measures (events vs derived initializer table) agree on kind and
  day on 8/8 seeds.
- **The ignition delay is a tax on ignited villages too
  (documented).** 1–100 would-be creations eaten per ignited seed
  before the store exists (103212: 100 over 77 days). The fix does
  not only wake dead villages; it gives every village its first
  weeks back.
- **HavenTick `lived` is zero on a third band (documented).** 16
  creations, 14 `heard` + 2 `both`, 0 `lived`. Appended to the
  findings backlog as a reproduction note alongside the planless
  wave-5 observation (below).
- **Planless villages still reach wave 5 and kill wave-5 beasts
  (documented).** Seed 103217: standing 375, wave 5 unlocked, 9
  wave-4 kills + 2 wave-5 kills, zero plans. Appended to the
  findings backlog.
- **CANON GAP (recorded, not invented):** no CANON-registered doc
  covers havenTick plan creation, departure gates, the pick
  lottery, or the plan store's lazy initialization (checked
  against the `docs/CANON.md` manifest). The gate is grounded only
  in `src/js/win-plan.js` and `src/js/villager-agency.js`, as the
  prereg states.
- **Index clobber (safe-commit):** struck twice this run (the prereg
  commit and the instrument commit: new files showed staged-deleted
  + untracked). Repaired both times via `git ls-tree -r HEAD --
  <paths> | git update-index --add --index-info`, verified with
  `git status` clean + `git diff HEAD` empty + hash-object match.
  Both commits verified correct.

## Metric review

- The frozen taxonomy held — no mid-run re-scoring. The store row
  fired exactly where planignite-a's `unexplained` did, on a fresh
  band, with the guard-blocked count as the evidence (not a
  post-hoc story): 3/3 empty seeds classified inside the bars.
- **Layer-1 buckets were never the deciding row.** No empty seed
  reached rule 4 — every empty seed had ranger+engaged calls, so
  the store row fired first. The Layer-1 distribution is still
  reported in full (the table above) because the task asked which
  of the three conditions never lines up; the answer is none of
  them — they all line up, and the store eats the call anyway.
- **`lived` may under-record, not just be shadowed.** The
  `lived` branch reads `know[vid].fought`; sibling arm
  sim-zeroattempt-b found fight narration with `know.fought`
  staying empty all run. If some fight paths never write
  `know.fought`, the lived count is a floor, not the truth — but
  it cannot change this run's verdict: `heard` alone is enough
  engagement, and the blocked calls were engaged by `heard`
  anyway. A follow-up that audits which fight paths write
  `know.fought` would sharpen the lived/heard split; it is not
  needed to judge the store.
- **150d was the right horizon.** Blocked calls span day 4 to day
  149 on the empty seeds; ignitions happen as late as day 95
  (103218). A 100d horizon would have misread 103218 as empty.
- **No wrap missed a creation.** 0 unknown rows on either leg;
  every planCensus holder traces to a creation; 0 tick-gate
  mismatches across 4,707 ticks; every havenTick call carries a
  non-null tick and a named outcome.
- **OFF leg reproduced the ON leg exactly.** Neutrality 8/8
  identical on all nine compared fields, including deaths and the
  final kill logs — the recorder is observation-only, as designed.

## Balanced-panel review note (why no panel)

No balanced panel was run for this DIAG, same as dawnbid,
companionpool, poolmarginals, seedpaths, haventick-b, and
planignite-a. The panel (`scripts/balance-panel.js`) runs fresh
multi-policy sims and compares two panel `.json.gz` files — it
cannot compare recorder corpora, and this arm ships no game change:
the instrument is observation-only, the two legs differ only by
the recorder, and the prereg bars are the judge. A panel here would
measure recorder noise across fresh trajectories, not the judged
corpora. The neutrality proof (D1/D2 + the analyzer's 8/8 ON-vs-OFF
trajectory identity) is the panel's substitute here, and it is
exact. The prereg's panel instruction was evaluated against this
and declined for the stated reason, not silently skipped.

## Neutrality evidence

- **D1** (proof test): instrument tip, seed 103211, 60d, recorder ON
  twice — identical full corpus (76 havenTick calls, 240 ticks).
- **D2** (proof test): same, recorder ON vs OFF — identical
  trajectories; recorder-off run carries empty ignition arrays.
- **Cross-leg** (analyzer, 150d, 8 seeds): ON-vs-OFF identical on
  8/8 seeds — days, gameDays, endReason, standing, scaleRank,
  maxWave, won, deaths, waveKillLog. Wave-4 kills 21/21, wave-5
  kills 2/2, deaths 557/557.
- **Proof:** 102/102 on the instrument tip (seed 103211, 60d +
  150d live run). The 150d live run recorded 43
  store-uninitialized outcomes and 0 unexplained-call outcomes —
  the store finding, visible on the proof seed itself.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-16/perseed-haventickgate-b-on/*.json' --metrics
national,table,wins,exiled` — **REFUSED**, as the recent DIAGs hit:
"telemetry-check: refusing recorder-corpus input: all 8 --current
rows carry top-level anchorCommit, so they are sweep recorder rows,
not runs. Recorder corpora are compared with sweep-compare tables,
never against a run baseline here." Recorded, not worked around;
the baseline was not rolled on it.

## Wall numbers (both legs — identical)

| | OFF | ON |
|---|---|---|
| National by standing ≥200 | 2/8 | 2/8 |
| National by scaleRank | 0/8 | 0/8 |
| Table / wins | 0 / 0 | 0 / 0 |
| Wave-4 reached / wave-5 reached | 8 / 2 | 8 / 2 |
| Median survival | 151d | 151d |
| Wave-4 kills / wave-5 kills | 21 / 2 | 21 / 2 |
| Deaths (all causes) | 557 | 557 |

Per-seed (ON leg): 103211 survived 151d standing 190, 9 creates;
103212 survived 151d standing 199, 2 creates; 103213 survived
151d standing 199, 5 creates; 103214 lost 132d standing 160, 3
creates; 103215 survived 150d standing 295, 0 creates; 103216 lost
146d standing 175, 0 creates; 103217 survived 151d standing 375,
0 creates; 103218 survived 151d standing 199, 3 creates.
(The two national-by-standing villages, 103215 and 103217, are
both planless — see §Reachability verdict.)

## Commits on this branch

- `ba2be3a9f` frozen prereg
- `335d83da3` instrument — gate driver + analyzer + proof test
  (102/102; OFF anchor, recorder off; ON anchor, recorder on)
- This evidence + analysis + corpora commit follows.

Ready to merge, pending ship. Do NOT push, do NOT bump — the ship
loop owns deploys.

## Files

- Prereg: `evidence/2026-11-16/sim-haventickgate-b-prereg.md`
- Instrument: `scripts/haventickgate-driver-20261116.js`,
  `scripts/analyze-haventickgate-b.js`,
  `scripts/test-haventickgate-b.js`
- Corpora: `evidence/2026-11-16/perseed-haventickgate-b-off/` (8 files),
  `evidence/2026-11-16/perseed-haventickgate-b-on/` (8 files)
- Analysis: `evidence/2026-11-16/haventickgate-b-analysis.json`
- This evidence file: `evidence/2026-11-16/sim-haventickgate-b.md`

## Next diagnostic (named, not done)

1. **Why `lived` never creates.** Three bands, zero lived-only
   havenTick creations — and now a sibling finding that fight
   narration can run without `know.fought` being written. If the
   fight seeds first, the `lived` branch may be unreachable by
   construction; if `know.fought` under-records, the branch may be
   starved by a different bug. One probe that audits which fight
   paths write `know.fought` would separate the two.
2. **The ignition delay on ignited villages.** The fix arm
   (planignite-fix-a, Loop A 0015Z) owns the repair; its prereg
   should carry this band's delay numbers (103212: 100 blocked
   calls over 77 days) as the before-measure, and re-run this
   DIAG's instrument on the fixed code to show the blocked-call
   count going to zero.
3. **Dead holders' plans linger.** Still open from haventick-b
   (named next diagnostic #3, taken by this run's sibling arm
   sim-deadplan-b) — whether a dead holder's lingering plan costs
   anything.
