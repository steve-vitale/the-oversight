# Wave-4 killer retention (simultaneity) — Loop B verdict (run fleshout-loop-b-20261105T0330Z, arm sim-killerdeath-b)

Axis: winnability chain (wild ally-join → wave-4 kills → veterans →
readiness-5 release → wave-5 facing → full seat). Policy-side probe only,
zero src/js. NO gate/price/deed/readyDemand/VETSHAPE-default change.

## Pre-registration (committed before any judged sim)

Full text: `evidence/2026-11-05/sim-killerdeath-b-prereg.md`
(commit 76f6f8c9d). In short: fresh band 99131–99138, competent verbatim
baseline vs ONE retention probe on the SAME seeds, 150d death-aware
horizon. Retention = scholar fresh wave-4 killers (0 < today − killDay ≤
30) get haven days instead of the daily outward legs (stoneRun, forage
trips, counterPlay, vinebank, trapline); upkeep verbatim + driver-set
COMPETENT_SEEK_FIGHTS=0 (no feast patrol sweeps); fights, pending
encounters, contests, lingerer sorties, and NPC killers unchanged (stated
limits — the probe covers scholar-killers only).
PRIMARY metric = seeds with ≥ 1 daily engine snapshot day with
readiness5.veterans ≥ 2. GO iff retention ≥ 2/8 AND baseline 0/8 (or
retention beats baseline by ≥ 2 if baseline nonzero). Pilot 8 only;
confirm 12–16 on fresh seeds ONLY on pilot GO.

## Verdict — NO-GO (judged strictly against the prereg)

- Baseline: 0/8 seeds with a living pair (snapshot AND reconstructed).
- Retention: 0/8 seeds with a living pair (snapshot AND reconstructed).
- Difference: 0 seeds — the GO bar (≥ 2/8, or +2 over baseline) is not
  met, so the verdict is NO-GO, not re-scored against a friendlier bar.
  No confirm run (12–16 seeds) is owed: the pilot did not GO.
- The probe DID apply where it could (see below): retention is not a
  null result caused by a broken probe. It kept killers alive much longer
  and still produced no pair — because the second killer never arrived,
  and because the deaths that did take retained killers happened AT HOME
  (arena, expedition), where retention does not reach.

## Proof

`scripts/test-killerdeath-20261105.js` — 14/14 PASS (11 fixture tests
incl. death-cause splitting, wild-residual handling, living-pair snapshot
vs reconstructed-pair distinction, deadMap override, anomaly timing,
retention window; live harness smoke 5d; off/on neutrality leg 10d seed
99131: identical days, endReason, kill-log length, 0 instrument errors).
Judged corpora: 16 files (8 baseline + 8 retention), instrumentErrors 0
on every file. Instrument: `scripts/killerdeath-instrument-20261105.js`
(vetprod base + recordWaveKill kill-time scholar capture + playerDeath
wrap + killer tracker + retention-observability snapshot fields).
Analyzer: `scripts/killerdeath-analyze-20261105.js`. Driver:
`scripts/killerdeath-driver-20261105.js`. Probe policy:
`scripts/policies/competent-retention-killerdeath-b.js`.
Telemetry deviation check (§10 loop-body step): the tool REFUSES
recorder corpora by design (`telemetry-check.js`: "all 8 --current rows
carry top-level anchorCommit, so they are sweep recorder rows, not runs"
— for both arms). No LOUD line exists to investigate; wall numbers are
reported directly below instead of via a forced flag.

## THE RETENTION ANSWER (plain words)

Keeping a fresh killer home works at keeping THAT killer alive — and still
doesn't make a pair, for two separate reasons.

First, the second killer usually never shows up at all. Across both arms,
only three seeds ever blooded a second wave-4 killer, and in every case
the two killers' lives didn't overlap: on 99138 the first killer (an NPC
villager, Zoltan) died to a monster three days after his kill, twelve days
before the second killer (the player, Ursula) blooded hers on the very
last day of the run. Retention can't pair killers when the village only
ever produces one at a time, weeks apart.

Second, the deaths that DO take retained killers happen at home, where
"stay home" is no protection. Dmitri (99133) sat at haven for his full
retention stretch, then died in the arena the day after — the show takes
its fighters regardless of where they slept. Yuki (99136) is the
clearest case: in the baseline he blooded two wave-4 monsters and died
two days later in a wild fight; under retention he stayed home thirty
days, lived sixty-six days past his first kill, his village survived to
the horizon — and in all that extra time, with thirteen wave-4 fights,
nobody else ever landed a wave-4 kill. Retention bought a long-lived
veteran and a surviving village, but the pair still needed a second
killer the village never produced.

So the binding shortfall is no longer just "killers die too fast." On
this band it is two problems stacked: (a) second-killer PRODUCTION is
nearly absent (5 wave-4 kills on 8 baseline seeds, 4 on 8 retention
seeds, spread so thin no two ever coexist), and (b) the killer deaths
that remain are home deaths (arena, expedition) outside any stay-home
lever's reach. A game-code build that only "protects" fresh killers
would repeat this probe's result at higher cost. The next lever needs
to be about producing the second killer (encounter production is the
sibling arm's question), or about home/arena exposure — not about
longer retention windows.

## Per-seed table — baseline (competent verbatim)

| seed | days | end | w4 fights | w4 kills | killers ever | living at end | max sim | engine max vets | peak gated | class |
|------|------|-----|-----------|----------|--------------|---------------|---------|-----------------|------------|-------|
| 99131 | 40 | lost | 0 | 0 | 0 | 0 | 0 | 0 | 0 | NEVER-FACED-WAVE4 |
| 99132 | 69 | lost | 1 | 0 | 0 | 0 | 0 | 0 | 165 | FACED-NO-KILL |
| 99133 | 73 | lost | 3 | 1 | 1 | 1* | 1 | 1 | 125 | KILLED-LIVING-SHORT |
| 99134 | 54 | lost | 0 | 0 | 0 | 0 | 0 | 0 | 75 | NEVER-FACED-WAVE4 |
| 99135 | 109 | lost | 10 | 0 | 0 | 0 | 0 | 0 | 150 | FACED-NO-KILL |
| 99136 | 104 | lost | 10 | 2 | 1 | 0 | 1 | 1 | 199 | KILLED-DEAD-KILLER |
| 99137 | 41 | lost | 0 | 0 | 0 | 0 | 0 | 0 | 50 | NEVER-FACED-WAVE4 |
| 99138 | 150 | survived | 11 | 2 | 2 | 1 | 1 | 1 | 199 | KILLED-LIVING-SHORT |

\* "Living at end" = no death record at run end (deadMap + fallen). On a
village-lost seed the village ended around the killer; it means "no
recorded death," not "walked away alive."

## Per-seed table — retention probe (same seeds)

| seed | days | end | w4 fights | w4 kills | killers ever | living at end | max sim | engine max vets | peak gated | retention days applied | class |
|------|------|-----|-----------|----------|--------------|---------------|---------|-----------------|------------|------------------------|-------|
| 99131 | 40 | lost | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | NEVER-FACED-WAVE4 |
| 99132 | 69 | lost | 1 | 0 | 0 | 0 | 0 | 0 | 165 | 0 | FACED-NO-KILL |
| 99133 | 119 | lost | 7 | 1 | 1 | 0 | 1 | 1 | 175 | 10 (d71–80) | KILLED-DEAD-KILLER |
| 99134 | 54 | lost | 0 | 0 | 0 | 0 | 0 | 0 | 75 | 0 | NEVER-FACED-WAVE4 |
| 99135 | 109 | lost | 10 | 0 | 0 | 0 | 0 | 0 | 150 | 0 | FACED-NO-KILL |
| 99136 | 150 | survived | 13 | 1 | 1 | 0 | 1 | 1 | 199 | 30 (d82–111) | KILLED-DEAD-KILLER |
| 99137 | 41 | lost | 0 | 0 | 0 | 0 | 0 | 0 | 50 | 0 | NEVER-FACED-WAVE4 |
| 99138 | 150 | survived | 11 | 2 | 2 | 1 | 1 | 1 | 199 | 2 (d151–152, run tail) | KILLED-LIVING-SHORT |

Retention days applied are daily-snapshot retentionActive days (the
instrument's own rule, matching the policy). On 99131/99132/99134/
99135/99137 retention never triggered (no scholar wave-4 kill), so those
seeds' corpora are identical to baseline on every recorded field —
expected, not a probe failure. On 99138 retention triggered only after
Ursula's day-150 kill (run-tail days 151–152), and that corpus is
identical to baseline on every recorded field except total say count
(tail-day voice lines only).
The probe's live tests are 99133 and 99136, and both moved: 99133 lived
46 days longer (73 → 119), 99136 survived to the horizon (104 → 150).

## Killer ledger (wave-4+ kills only)

Baseline:

| seed | killer | kills (days, monsters) | channel | death day (split cause) | kill→death |
|------|--------|------------------------|---------|-------------------------|------------|
| 99133 | dmitri_sokolov | 1 (d70, influencer) | player | — (no death record; village lost d73) | — |
| 99136 | yuki_mori | 2 (d81 algorithm, d82) | player | d83 (scholar-death: the wild: away, in-combat) | 2d |
| 99138 | zoltan_nagy | 1 (d135, reunion) | npc (field) | d138 (monster: Big Ugly) | 3d |
| 99138 | ursula_weber | 1 (d150, eater) | player | — (alive at horizon) | — |

Retention:

| seed | killer | kills (days, monsters) | channel | death day (split cause) | kill→death | retention applied |
|------|--------|------------------------|---------|-------------------------|------------|-------------------|
| 99133 | dmitri_sokolov | 1 (d70, influencer) | player | d81 (scholar-death: the arena: at-haven, in-combat) | 11d | d71–80, all at haven |
| 99136 | yuki_mori | 1 (d81, algorithm) | player | d147 (scholar-death: the expedition: at-haven, not-in-combat) | 66d | d82–111 (full 30d), all at haven |
| 99138 | zoltan_nagy | 1 (d135, reunion) | npc (field) | d138 (monster: Big Ugly) | 3d | none (NPC — out of probe reach) |
| 99138 | ursula_weber | 1 (d150, eater) | player | — (alive at horizon) | — | d151–152 (run tail only) |

Kill-to-death median: baseline 2.5d (n=2 dead killers: 2d, 3d — small n,
reported with its n, not as a band estimate); retention 11d (n=3: 3d,
11d, 66d). The retention median is NOT a "retention extends life by
8.5 days" claim: the two arms' killers are different people on changed
trajectories (retention re-routes the whole run from the first retained
day), and n=2–3 is too small for a median comparison. What IS solid:
the retained scholar-killers both outlived their baseline counterparts'
spans by an order of magnitude (99136: 66d vs 2d; 99133: 11d of retained
life vs a village that ended 3 days after the kill), and still no pair.

Death-cause shares (dead wave-4 killers only): baseline — scholar-death
1/2, monster 1/2; retention — scholar-death 2/3, monster 1/3. UNSPLIT
RESIDUAL: 0 in both arms — every dead killer's cause was split by a
monster-threaded fallen entry or a playerDeath-wrap context. The fallen
'the wild' bucket, which vetprod had to cite unsplit, is split here in
all three scholar cases (away/in-combat; at-haven/in-combat/arena;
at-haven/not-in-combat/expedition). No dead killer in either arm died
with an unsplit 'the wild' as its only evidence.

## Closest seeds (per the prereg's closest-seed rule)

- 99138 (both arms, identical trajectories): the pair near-miss. Two
  killers ever, max simultaneous 1. Zoltan (NPC, field fight) blooded
  d135 and died d138 to Big Ugly; Ursula (player) blooded d150, the
  horizon's last day. The 12-day gap between Zoltan's death and Ursula's
  kill is the whole story: sequential production, never simultaneous.
  Retention could not touch this seed — Zoltan is an NPC (out of probe
  reach) and Ursula's kill came too late for any retention day to matter.
- 99136 retention: the retention near-miss. Yuki lived 66 days past
  first blood (baseline: 2 days), his village survived to the horizon,
  thirteen wave-4 fights happened — and the second killer never came.
  If retention were the answer, this seed is where it would have shown:
  a long-lived veteran, a surviving village, ample fights, and still
  max simultaneous 1.

## Wall numbers (both arms; secondary, never re-scored)

| | baseline | retention |
|---|---|---|
| Wins | 0/8 | 0/8 |
| National | 0/8 | 0/8 |
| Table | 0/8 | 0/8 |
| Wave-4 unlocks | 5/8 | 5/8 |
| Wave-4 faced | 5/8 | 5/8 |
| Wave-5 unlocks | 0/8 | 0/8 |
| Wave-5 faced | 0/8 | 0/8 |
| Readiness-5-ready days | 0/8 seeds | 0/8 seeds |
| Median survival | 71d | 89d |

The retention median-survival lift (71 → 89d) is a secondary observation
driven by 99133 (+46d) and 99136 (survived): retention keeps villages
alive longer when it triggers. It did not move any wall bar (no unlock,
no national, no table, no win in either arm).

## Village assessment (plain words)

Picture eight villages playing competently on fresh ground. Three never
meet the fourth draft at all; two meet it repeatedly (ten or eleven
fights) without ever killing one; three blood a fighter or two — and
then the arithmetic of simultaneity defeats them. The villages are
short-lived (median 71 days baseline): most die before the wave-4 story
can even develop. The one village that survives to the horizon (99138)
produces its killers one at a time, twelve days apart, the second on the
last possible day. Retention changes the texture — scholars who would
have died in the wilds two days after first blood instead sit at haven,
tend the village, and live weeks longer — but it cannot conjure the
second killer, and it cannot stop the arena or an expedition from taking
a retained fighter at home. The village that retention saved (99136)
still ends the run one veteran short of the door, with a gated standing
of 199 staring at a demand of 2.

## Sense-testing (read, not just counted)

- Dmitri's death (99133 retention, d81): coherent and consequential.
  "🕯️ Dmitri Sokolov is dead — the arena. The village stops. Somebody
  screams. Somebody else starts digging." Then the grave ritual ("That
  night, they bring Dmitri home... the filling of it is yours") and a
  speaking turn at the grave. The mantle passes the next day to Meera,
  who herself dies d82 in combat at haven ('the wild' in the fallen
  roll, in-combat at haven in the wrap) — the transcript reads as a
  village losing bearers in quick succession, not as a bookkeeping
  event. The death narration is honest about the arena as the killer.
- Yuki's death (99136 retention, d147): the ritual lines are the same
  and equally coherent ("Yuki Mori is dead — the expedition... The
  village's quarrel was with Yuki — and Yuki is dead. The sentence
  doesn't cross the grave"), but the CAUSE line is odd against the
  instrument context: cause arg 'the expedition' while the scholar was
  at haven (4,4), not in combat, not in a pending encounter. An
  expedition death landing on a scholar sitting at home needs a code
  read before anyone explains it — flagged as a follow-up question,
  not a verdict. (Tracker health reads the village health map, not
  scholar health, so no health claim is made about Yuki's last days.)
- Zoltan's death (99138, d138): thin narration for an NPC field death —
  a Codex page ("Zoltan is dead") plus raid lines, no grave ritual in
  the filtered window, while the monster attribution (Big Ugly) lives
  only in the fallen data. Scholar deaths get the full ritual; NPC field
  deaths get a page-turn. That asymmetry is worth a look, not a verdict.
- Terminology collision, re-confirmed: on 99133 d82 the System voice
  celebrates a "veteran kill" for Yue putting down Loud-Eyes — a
  monster-veteran kill, not a wave-4 villager-veteran kill (the analyzer
  counts only 1 wave-4 kill on that seed). The game uses "veteran" for
  both concepts on screen, as vetprod noted; the voice line does not
  mean the readiness bar moved.

## Metric review (§14 — for the NEXT run, not a re-score of this one)

- The snapshot-day primary behaved: snapshot and reconstructed pair
  counts agreed (0/8 both arms, both methods) — no fleeting pair was
  missed by snapshots on this band.
- The 30d window was long enough to observe: both retained scholars
  lived past the window's purpose (99133 died 1 day after his 10
  observed retention days — death cut the window short, not the window
  expiring; 99136 used the full 30 days and lived 36 more). A longer
  window would not have changed either seed's pair outcome: 99133's
  killer died in the arena, 99136's village never produced a second
  killer in 150 days.
- Baseline killer scarcity DID thin the pair metric: only 4 killers ever
  on 8 baseline seeds, and 5 of 8 seeds had zero killers at all. The
  pair metric is still the right primary (it is the bar), but a future
  retention-style probe on a band this killer-poor will mostly measure
  production, not retention. If retention is ever re-tested, it wants a
  band where killers are plentiful first (or the sibling encounter
  arm's production fix landing first).
- Tracker limitation for the next run: killer-track health reads the
  village health map and is not scholar health — do not use it for
  scholar last-days claims. Per-step haven-day errors are not exported
  (runDays does not return policy ctx); application was judged by
  snapshot flags + positions, which proved sufficient here.

## Blanks filled or documented

- FILLED (instrument): the fallen 'the wild' bucket is now splittable —
  recordWaveKill kill-time scholar capture + playerDeath wrap + killer
  tracker, proven neutral (14/14 test, off/on leg). Future arms can
  cite split causes instead of the residual. Files are committed for
  reuse; the analyzer's split categories are the vocabulary.
- DOCUMENTED (finding, not a fix): retention is NO-GO as a pair lever.
  The next lever is second-killer production or home/arena exposure,
  not longer retention. No game-code build follows from this arm.
- DOCUMENTED (follow-ups, not verdicts): (1) 'the expedition' deaths
  landing on at-haven, not-in-combat scholars (Yuki d147) need a code
  read; (2) NPC field deaths get thin narration vs scholar grave
  ritual; (3) the "veteran kill" voice line fires for monster-veteran
  kills and does not mean the readiness bar moved.

## Infrastructure notes (loud, as required)

- EPERM flap tonight: no blocked write hit this arm's commits (one
  safe-commit produced the known index-clobber pattern — main index
  showed the 6 committed files staged-as-deleted; repaired with
  `git update-index --add --cacheinfo` from HEAD blobs, verified
  `git status` empty + `git diff HEAD` empty + hash-object matches
  before proceeding). The prereg commit itself is intact (76f6f8c9d).
- Worktree heartbeat was slow once (~50s to land) but landed; earlier
  heartbeat in the run was prompt. No heartbeat failure.
- No other run's worktree, branch, claim, or lock was touched. Loop A
  0115Z food-economy, held sim-triggerbuild-b / sim-standaccum2-b /
  sim-fleerepair-a / sim-strandnight-a, and main-session ability-use
  were not duplicated or rebuilt.

## Corpus

Per-seed JSON (16 files): `evidence/2026-11-05/perseed-killerdeath-b/`
(`killerdeath-s<seed>-killerdeath-baseline.json`,
`killerdeath-s<seed>-killerdeath-retention.json`). Smoke corpus (2
seeds, NOT judged) was written to /tmp and is not part of the verdict.
