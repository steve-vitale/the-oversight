# Win-flag census (sim-wincensus, 2026-10-14)

## Pre-registered diagnostic header (written BEFORE any sims)

- **Question:** national is reached (8-11/16 on courtship roads), the table is reached sporadically
  (0-5/16 in various suites), wave-5 unlocks happen — but **wins = 0 ALWAYS**. Nobody has measured WHY.
- **Diagnostic GO:** >=2 table-reaching runs instrumented end to end; EVERY win-flag gate attributed
  (which gates clear, which never do, with counts); a complete taxonomy of where table-reaching villages
  die/fail (death causes, gate shortfalls, timing).
- **Seeds/policies:** leadfeast (FEASTSCALE_R13=1) seeds 11/22/33/44/55/66/77/88 (the r31 set) — screen
  first; full census (origin + walked arms, 2 in-process invocations each) on every table-reaching seed.
- **Arms:** `origin` (policy as the suite ran it — reproduction; leadfeast never answers the table modal)
  | `walked` (same policy + tableWalk driver — answers scholar.tableChoices first-option, winseek-style —
  measures the post-invitation chain mechanically).
- **Horizon:** 180d death-aware (matches the origin suites). Dead villages stop simulating (+10d tail).
- **Determinism:** A/A in-process, dayHash identical required; a diverged seed is EXCLUDED (documented).
- **Method:** scripts-only instrument (scripts/wincensus-20261014.js) — no game-code changes. Named-export
  unwrap for the policy; SMOKE honesty gate before the census.
- **INFO-SKIP (documented):** the r30b overstock table seeds (overlead/overbelong, 5 seeds) are NOT
  reproducible on this base — scripts/policies/overstock.js exists only on unlanded branch sim-overstock2.
  Workers never touch unlanded branches.
- **If <2 table-reaching seeds materialize:** expand the screen honestly (documented); never lower the bar.

## The win-flag chain (read from code 2026-10-14, docs/TABLE.md + MONSTER-WAVES.md)

G1 Arc IV seat: `checkArc` → tableSeat() 'full'|'lesser' → pg.arc=4, pg.tableWaiting=true.
G2 `tableScene` (next dawn): seat 'none' → WITHDRAWAL aloud (tableWaiting=false); else pg.tableDone=true,
T.phase='paths', 7-door modal via tablePrompt → scholar.tableChoices.
G3 Path walk: chooseTableOption('path:X') → tableStartPath → beats (tableChoose) → fail → tableFail
(downgrade loop or comfort-ending) | finals → tableFinals.
G4 Final choice: tableResolveFinal → **winDayFloorOk()** (scholar.day >= 90):
- NO → winDayFloorDefer: T.phase='paths', tableChoices=null, game continues. NOTHING re-opens the modal
  (tableOfferPaths is only ever called from tableScene; tableScene is blocked by pg.tableDone=true once
  fired). **DEFERRAL STALL: after a pre-day-90 resolution the win is unreachable for the rest of the run.**
- YES → T.phase='done', Game.over=true, Game.won=true — THE WIN FLAG.
G5 Trial-by-combat (feared path opt-in): tableTrialByCombat pauses the challenge; tbEnd resumes.

## Gate taxonomy — where table-reaching villages die/fail

Screen (leadfeast, FEASTSCALE_R13=1, 8 seeds, origin arm, 180d death-aware): **3/8 table-reaching**
(s11, s22, s55). Full census: origin + walked arms × 2 in-process invocations = 12 runs, **all 12 A/A
identical** (day-hashes and gate chains). GO met: 6 identical-instrumented runs on 3 table-reaching seeds.

Per-run gate chains (A/A identical both invocations):

| seed | arm | days | end | chain |
|---|---|---|---|---|
| s11 | origin | 180 | survived | ARC4 WAIT SCENE(full) -path -finals -choice -won |
| s11 | walked | 174 | over-other | ARC4 WAIT SCENE(full) PATH(feared) FINALS FINAL(floor-ok) **WON** (Game.won=true verified) |
| s22 | origin | 167 | village-lost | ARC4 WAIT SCENE(lesser) -path -finals -choice -won |
| s22 | walked | 167 | village-lost | ARC4 WAIT SCENE(lesser) PATH(feared) FINALS FINAL(**DEFERRED**) -won |
| s55 | origin | 180 | survived | ARC4 WAIT SCENE(lesser) -path -finals -choice -won |
| s55 | walked | 180 | survived | ARC4 WAIT SCENE(lesser) PATH(feared) FINALS FINAL(**DEFERRED**) -won |

Gate detail:
- s11: Arc IV @175 (full seat — deed bars [14,8,7,6,2], cx15, cr4, national since d78, maxWave 4).
  Walked: feared/light @175, 3 beats, 0 fails, 0 trials, finals @175, final:mercy, floorOk (d175≥90) →
  T.phase='done', Game.over=true, **Game.won=true** (verified in a separate end-of-run read).
- s22: Arc IV @67 (lesser — waves 1–3 faced 10/9/3, 6 contests, 4 crises, regional). Walked: feared/light,
  finals @67, final:mercy, **floorOk=false → deferred @67**. Stall: 101 days in phase='paths' with 0
  pending choices, tableActive=true throughout. Died d167 village-lost.
- s55: Arc IV @59 (lesser). Walked: deferred @59. Stall: 122 days, phase='paths', 0 choices.
  Survived to 180.
- All walked runs: path always 'feared' (first earned option), branch light, 3/3 beats clean, no
  downgrade loops, trial-by-combat never taken (options[0] is never the trial door — matches winseek).

The four sinks, with counts:

**T1 — The unanswered door (3/3 origin runs; harness-policy artifact, not a game bug).** The scene fires,
the 7-door modal is offered (prompts=1), the policy never answers (answered=0). s22 sat 102 days and s55
123 days with the modal pending (phase='paths', choices>0, tableActive=true); both outlived the wait
(one died, one survived — the wait itself is survivable). Only winseek-family policies drive the table;
leadfeast/leadcourt/belongseek do not. In production the player taps. The suites' "table=1, won=0" rows
are this sink.

**T2 — The deferral stall (2/2 early-table walked runs; REAL game-chain gap).** A pre-day-90 final
resolution fires winDayFloorDefer: phase='paths', tableChoices=null, pg.tableDone=true — and NOTHING
ever re-opens the modal. The beat text promises "Come back when the village has seen ninety dawns —
the table will still be here." The engine does not keep the promise. s22 lived 100 more days and died
in the stall; s55 lived 121 days in it. **This is the wall past the Standing bar for early-table
villages: the table chain itself, not the seat.**

**T3 — The completed win (1/1 late-table walked run).** s11 @175, full seat, floorOk → Game.won=true.
The chain is end-to-end functional when walked post-day-90. The win flag is NOT broken.

**T4 — Death by endgame combat (s22, both arms).** 5 bearer combat deaths in 20 days (d145,147,155,162,165
— mantle passed each time) against wave-5 producers + 1 villager contest death (d165) → village-lost @167.
Table sanctity suspends AMBIENT pressure (tableActive=true the whole stall), but not the policy's
deliberate wave-5 hunts. The village died fighting the Producers while the table waited.

Second-order observation: the scene is one-shot — s22 earned FULL-seat deed bars by d165
([10,10,4,3,3], cx20, cr4, global) while deferred on its d67 lesser seat. Early-table villages are never
re-priced. Same fix as T2 covers it (re-fire re-prices).

## Wall numbers (screen: leadfeast origin, 8 seeds, 180d death-aware)

- national: **5/8** (s11, s22, s44, s55, s77)
- table: **3/8** (s11, s22, s55) — vs r31's 2/8 on the same policy/seeds; the +1 (s11) is cross-process
  divergence (known villager-ID/contest-RNG issue), not a contradiction — in-process A/A identical everywhere.
- wins: **0/8** (origin arm never walks the table — sink T1)
- wave-4/5 unlocks: wave-4+ on 3/8 (s11 w4; s22, s55 w5); wave-5 on 2/8
- median survival: **90d** (days: 32, 51, 69, 79, 101, 167, 180, 180); max 180d
- wins when walked: **1/3** (s11; s22/s55 deferred — sink T2)

## Village assessment (sense-testing — SENSE-TESTING LAW)

Read the table beats + final days on s11-walked (win) and s22-walked (deferral + death):

- The win path reads as a story, not a state machine. d174 "The table is being set..." → Arc IV full-seat
  beat naming every draft fought → d175 THE TABLE scene → THE AUDIT ("A full seat. regional standing,
  every wave faced, the deeds complete. The table rises when you enter.") → door abilities granted aloud
  (War-table, Shieldbearer) → THE FEARED challenge beats with villager reactions ("Behind you, your own
  people go still too — a different stillness." / "Your people stand a little straighter.") → branch
  voiced from the real ledger ("The food truth was shared. The light road is open.") → finals → "Show
  mercy." → "You won. Say it plainly: you won. The village endures. The table signed."
- The deferral beat is honest about the floor and dishonest about the return: "◈ THE TABLE WAITS —
  'Ninety days. We do not price a life half-lived. Come back when the village has seen ninety dawns —
  the table will still be here.'" The fiction promises a return the engine never delivers (sink T2).
- Villagers act like people throughout: named raiders with motives ("Marcus of The Bloodied walks into
  your firelight alone, thinner than you remember. 'Our jars are empty,' they say."), gossip with
  distortion ("(The truth: dead is dead; the killing part is gossip.)"), funeral beats ("The village
  stops. Somebody screams. Somebody else starts digging."), tribute renegotiation when a link-holder dies
  ("Thornfield watches to see if Haven holds without its dead — and presses the tribute down...").
  Bearer deaths pass the mantle and the village continues (s11 won under a successor bearer).
- Texture note (not a blank): ambient water-fetching chatter repeats heavily ("Won't be long." /
  "The well won't fill itself." dozens of times) — fine as background, but it's the bulk of the
  say-stream.

## Telemetry deviation check

`telemetry-check.js` vs `hidden_files/telemetry-baselines/scale-wall.json` (national,table,wins,exiled):
**LOUD: table newly appeared: baseline 0 → current 3 (n=8).** Verdict: EXPLAINED, not a bug — table>0 on
the feast road is the already-investigated phenomenon (r30b overstock: table 0→5 LOUD, named as the
lesser-seat food-deed rung opening the table; r31 leadfeast baseline: 2/8). The +1 vs r31 (s11) is the
known cross-process contest-RNG divergence. Baseline NOT rolled forward (it tracks the scale-wall suite's
policy mix; this screen is a targeted diagnostic). exiled=0/8 (adjacent r31 measurement, same policy/seeds).

## Metric review (§14)

- GO met as pre-registered: 6 identical-instrumented runs on 3 table-reaching seeds (needed ≥2 runs on ≥2).
- Metric lesson for the next run: `gates.wonDay` (from per-day rows) is blind to end-of-run wins —
  censusRow runs BEFORE policy.daily, and the win lands mid-daily. The honest win signals are the
  final-chosen event's post-call `won` flag plus a terminal Game.won read. Next census should capture
  terminal Game.won/Game.over in finalize.
- No mid-run re-scoring: the taxonomy above judges exactly the pre-registered gates.

## Named next lever

**The deferral re-offer** (game-code, small, [needs-eyes] — it touches the win flow): after
winDayFloorDefer, when scholar.day >= 90, re-open the path modal — e.g. extend checkArc's table re-fire
to also cover `T.phase==='paths' && !scholar.tableChoices && day>=90` (re-pricing the seat at re-fire
covers the second-order observation too). Without it, every village that resolves its final before day 90
is permanently locked out of the win — the fiction already promises the return. Estimated effect: s22/s55
class villages convert deferral stalls into post-90 wins; measure on identical seeds before/after.

## Tooling

- scripts/wincensus-20261014.js — the instrument (installWinCensus / censusRow / finalizeWinCensus /
  wrapWithTableWalk). 19/19 proof checks green (scripts/test-wincensus-20261014.js).
- scripts/sweep-wincensus-20261014.js — screen + census driver (SMOKE mode, A/A determinism gate).
- scripts/test-wincensus-20261014.js — proof (fixtures: withdrawal + deferral-stall attribution; live:
  s22 reaches table, gates attributed; A/A identical day-hashes and gate chains).
- scripts/analyze-wincensus-20261014.js — per-seed taxonomy tables (diagnostic scratch).
- scripts/sense-table-20261014.js — narrow beat capture for sense-testing (diagnostic scratch).
- evidence/2026-10-14/wincensus-per-seed/ — 8 screen + 12 census per-seed JSONs.
- evidence/2026-10-14/wincensus-summary-20261014.json — run summary + GO check.
- evidence/2026-10-14/wincensus-flat/ — telemetry-check adapter (national/table/wins/exiled per seed).

Sim-findings #131 ("the wall past wave-5 is still the table chain, not the Standing bar"): CONFIRMED and
named — the wall is sink T2, the deferral stall. Mark #131 `fixed` only when the re-offer lever lands
and measures wins on identical seeds; until then it stays open with this census as the evidence.
