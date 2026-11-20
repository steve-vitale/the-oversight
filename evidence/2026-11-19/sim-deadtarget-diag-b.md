# sim-deadtarget-diag-b — the departure-gate diagnostic (finding #2617)

**Verdict: DIAG-GO** — the departure-gate question is answered with a
classified population: **no liveness check exists on the departure
path** (code answer, §1), and under the landed substrate **2 of 6
launches departed against a dead target type** (dead share 0.333) —
the exact 106084 re-launch pair from #2617 reproduces launch-for-
launch, while the 106081 pair does not (its holder died the day
after the first launch). The gate never fires because there is no
gate: the plan store holds a target past its death, and the village
keeps departing after it.

- **Branch:** `sim-deadtarget-diag-b`, tip `dff65072a` (instrument +
  analyzer correction) at leg time; base master `1cb6ce2e1`
  (origin/master at rebase time — see §"Base difference" below).
- **Prereg:** `evidence/2026-11-19/sim-deadtarget-diag-b-prereg.md`
  (frozen 2026-11-20 ~01:07 UTC, before any judged sim; commit
  `bdca2df67`)
- **Analysis:** `evidence/2026-11-19/deadtarget-diag-b-analysis.json`
  (analyzer exit 0; log `deadtarget-diag-b-analysis.log`)
- **Panel:** `evidence/2026-11-19/deadtarget-diag-b-panel.md`
  (decision `review_required`, 8 paired cases, no material signal)
- **Corpus:** `evidence/2026-11-19/perseed-deadtarget-diag-b/`
  (8 seeds, 150 days, 0 instrument errors)
- **Seeds:** 106081–106088 (the FULL designated band, never a
  subset — deliberate same-band reproduction of #2617)
- **Leg:** single diagnostic leg, substrate SENSEEXPED=1,
  PARTYSIZE4=1, VETREENGAGE=1, FLEEREPAIR2=1, FIGHTALLY2=1,
  NO ALLYSLOT3, NO LAUNCHSURVIVE. Competent verbatim (policy
  sha256 first-12 `150229eda010` — unchanged since the
  dmgshape-rerun leg), 150-day death-aware. Leg log
  `deadtarget-diag-b-leg.log` (exit 0, ~4 min for 8 seeds).

## EVIDENCE-ONLY — no game change on this branch

Zero `src/js` changes. The instrument is a renamed driver copy
(`scripts/deadtarget-driver-b.js` — the departure-gate snapshot
added to both `v4departs` wraps), a new analyzer
(`scripts/analyze-deadtarget-b.js`), a proof test
(`scripts/test-deadtarget-diag-b.js`, **22/22**), and a re-pointed
panel builder (`scripts/build-deadtarget-diag-b-panels.js`). The
ALLYSLOT3 slot code is ABSENT on this base (0 refs in
fieldFights.js / party-wiring.js / game.js) — the ported slot
commit `735fce64f` was never re-introduced, and the driver
refuses to run with ALLYSLOT3=1 (proof-test guard, exit 2).

## Base difference (recorded)

The coordinator registered this branch on master `8bd330f22`
(journey-establishment r244). Master moved before the judged
sims, so per the brief the branch was rebased onto
origin/master `1cb6ce2e1` (a batch-ship version bump on top of
`8bd330f22`). `git diff 8bd330f22 HEAD -- src/js` is one line in
`src/js/build.js` (the version stamp) — no game-code difference.
Journey-endgame r249 (`af7fddfc4`) is already an ancestor of
`8bd330f22`, so it is in both bases. Master did not move again
during the leg (`origin/master` still `1cb6ce2e1` at analysis
time); the judged anchor is the instrument commit `da21a2b32`.

## 1. The code answer — there is no departure gate (half the verdict)

Read in `src/js/win-plan.js` on this base (proof test §A pins
each line):

- `winPlanDepart` (lines 658–810) is the departure gate. It
  checks stage, gear (`gearOf`, `villagerGearUp`), companion
  willingness/launchability (`findCompanion` +
  `companionLaunchable`), the `PARTY_WAIT_DAYS` hold and the
  `VETERAN_GUARD_DAYS` hold. `launchParty()` (lines 668–775)
  walks to `plan.node` (a fixed tile) or a fresh ranging target;
  `plan.target` is copied onto the companions' plans (lines 760,
  764, 769) and never validated. **No read of `villageSlain`,
  no read of monster sightings, no recency or liveness check
  exists anywhere on the departure path.**
- `plan.target` is written in exactly one place,
  `winPlanSeedFromFight` (line 515), and copied at launch;
  there is NO `plan.target = null` / `plan.node = null`
  anywhere in `win-plan.js` — the target is never cleared, by
  death, kill, or time.
- `winPlanNoteKill` (lines 536–553): a kill advances a
  hunt/party plan to stage `'standing'` — target and node
  untouched. Stage `'standing'` still launches: the branch at
  line 796 sends `'party' | 'hunt' | 'standing' | 'table'`
  all through `launchParty()`.
- `winPlanFightGate` (lines 944–1010, the fight gate, not the
  departure gate): SEEK matches `plan.target` by id OR any wave
  match when stage is `'standing'` (`plan.stage === 'standing'
  && wave >= 3`) — also no liveness check.
- The knowledge channel the gate COULD consult exists:
  `state.villageSlain[type]` (game.js lines 35192, 35423; read
  for engagement seeding at win-plan.js line 598) — the fire
  tells the village when a type is slain (MONSTER-WAVES.md: 1+
  slain unlocks the beasttricks topic). The departure gate does
  not consult it. Both dead-target launches on this leg departed
  with `villageSlain[herald] = 1` — the village KNEW, and the
  holder departed anyway.

**Correction to the prereg's stage hypothesis.** The prereg
guessed the re-launches would depart from stage `'standing'`
(kill → standing → re-launch). They departed from stage
`'hunt'` — and the code says why: `winPlanNoteKill` fires only
for the KILLER (`src/js/villager-agency.js:694`, inside `if
(rec.outcome === 'vKill')` for the fighter whose agency fight
resolved). Allies in the kill fight never learn. Visjoin_114
fought beside Rafael in the d126 kill as an ally, so his plan
never advanced past `'hunt'` — and `'hunt'` launches without
any further question. The plan learns of a kill only when its
holder lands it. That is a sharper mechanism than the prereg's
guess: the dead target survives in the plan not only because
nothing clears it, but because the kill is never told to the
holder who didn't land it.

## 2. Judged numbers (frozen bars, §14 of the prereg)

| Bar | Measured | Bar | Result |
| --- | --- | --- | --- |
| Pool: launches | **6** | ≥ 4 | **PASS** |
| Classification | **6/6 = 1.000** | 1.000 | **PASS** |
| Gate snapshot (missing / mismatched) | **0 / 0** | 0 / 0 | **PASS** |
| Duplicate depart rows | **0** | 0 | **PASS** |
| Instrument errors / files | 0 / 8 | 0 / 8 | **PASS** |

Dead-target share **2/6 = 0.333** (reported, not a GO bar —
the question is the mechanism). #2617 measured 4/8 = 0.50
under the ALLYSLOT3-ported substrate; the share is lower here
because the 106081 pair does not reproduce (see §3), not
because a gate exists — the code answer (§1) is unchanged
and the 106084 pair reproduces exactly.

### The classified launch table (all 6 launches)

| Seed / day / holder → target | Class | Stage before | Last fight (day, outcome) | Days since | villageSlain | First fight after | Refought after |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 106081 d112 app_mgpspho1903 → herald (quad) | live | party | d110 vFlee | 2 | 0 | d117 vKill (aid) | yes |
| 106083 d114 caleb_jones → editor (quad) | live | party | d113 vFlee | 1 | 1 | d115 vFlee | yes |
| 106084 d115 visjoin_109 → herald (pair) | live | party | d114 vFlee | 1 | 0 | d118 vFlee | yes |
| 106084 d124 visjoin_114 → herald (trio) | live | party | d123 vFlee | 1 | 0 | d124 vFlee (same day) | yes |
| **106084 d136 visjoin_114 → herald (pair)** | **dead** | **hunt** | **d126 vKill** | **10** | **1** | none | **no** |
| **106084 d141 visjoin_114 → herald (trio)** | **dead** | **hunt** | **d126 vKill** | **15** | **1** | none | **no** |

Per-seed: 106081 1 launch (0 dead), 106082 0, 106083 1 (0 dead),
106084 4 (2 dead), 106085 0, 106086 0, 106087 0, 106088 0.
Median days since last fight 1.5. All four live launches
departed 1–2 days after a flee — fresh sightings, honest
departures. Both dead launches are re-launches by the same
holder against the same target, 10 and 15 days after the kill,
with the village's told kill count at 1 and nobody fighting
the type again for the rest of the run.

## 3. Reproduction of #2617 — partial, and the split is informative

- **106084 reproduces exactly.** The herald grind is
  byte-identical to the dmgshape-rerun leg: eight meetings
  d113→d126 (193, 13, 52, 136, 22, 62, 11, 221 = 710 dealt
  against one 700-HP herald, 10 overkill), the d124 first
  fight log identical to that leg's d124, and the d136/d141
  re-launches the same holder, same target, same party sizes
  (pair, trio), same node (4,5). The only new detail this
  diag adds: **d126 held TWO herald fights** — visjoin_114
  fled one (11 dealt, 2 rounds) and Rafael killed one later
  the same day (221 dealt, 9 rounds). The kill is the LAST
  fight of the day, which is what the analyzer's first version
  got wrong (see §7.1).
- **106081 does not reproduce — because the holder died.**
  App_mgpspho1903 died d113 of "a wound that wouldn't close",
  the day after the d112 launch, so the d115/d117 re-launches
  could never happen. The d114 kill itself does not reproduce
  either: under the landed substrate the herald kill moved to
  d117 (aid, app_mgpsphkb257, 103 dealt) instead of d114
  (Kauã/Chantal in the ported-substrate leg). The cause
  candidate is the substrate difference (no 4th ally in
  fights → different damage taken → the wound death) — a
  trajectory divergence, not a gate difference. The launch
  rate keeps falling across substrate steps on identical seeds
  (finding #2616 extends): survey 17 → partysurvive-rerun 9 →
  dmgshape-rerun 8 → this leg 6.

## 4. Reachability (waves 1–5, national/table/wins, median survival)

| | This leg | dmgshape-rerun-b (same band) |
| --- | --- | --- |
| Full wins | 0/8 | 0/8 |
| National scale | 0/8 | 0/8 |
| Table | 0/8 | 0/8 |
| Wave 5 reached | 4/8 | 4/8 |
| Wave 4 reached | 8/8 | 8/8 |
| Standing ≥ 200 | 4/8 | 4/8 |
| Standing exactly 199 | 4/8 | 4/8 |
| Survived 150d (gameDays) | 5/8 | 5/8 |
| Median survival (gameDays) | 150.5d | 150.5d |
| Community loss | 3/8 | 3/8 |
| Starvation (villager deaths) | 2 | 2 |

Per-seed (days / end / maxWave / standing / rank): 106081 150
survived / 5 / 410 / regional; 106082 150 survived / 4 / 199 /
regional; 106083 142 village-lost / 5 / 445 / regional; 106084
150 survived / 4 / 199 / regional; 106085 150 survived / 4 /
199 / regional; 106086 145 village-lost / 5 / 325 / regional;
106087 150 survived / 5 / 390 / regional; 106088 140
village-lost / 4 / 199 / regional. **Every per-seed number is
identical to the dmgshape-rerun leg** — the landed substrate
reproduces the ported-substrate wall exactly on this band.

Band-wide villager death causes (105 villager deaths):
`the wild` 37 (35%), `monster` 26 (25%), `a wound that
wouldn't close` 11, contest 8, thirst 6, `the arena` 5,
starvation 2, `a stranger` 2, named monsters 1 each (The
Reunion, Big Big, The Callback, The Loud Beast, Gavel),
`the night` 1, `the expedition` 1, dehydration 1. The
unstoried classes still dominate: `the wild` + `monster` =
60% of villager deaths (same note as finding #2607).

### Balanced panel (instrument, not judge) — RAN, review_required

`scripts/balance-panel.js compare` of this corpus against the
dmgshape-rerun-b corpus as a same-band reproducibility
reference (builder `scripts/build-deadtarget-diag-b-panels.js`;
panels `deadtarget-diag-b-panel-before/after.json.gz`;
compare `deadtarget-diag-b-panel.md`): decision
**review_required**, 8 paired cases, **no material signal**
on any metric. Village deaths per run 94.75 → 94.5 (paired
delta −0.25); community loss 0.375 → 0.375; wins and national
0 → 0. The panel confirms the direct wall comparison: the
substrate step moved nothing measurable on this band.

### Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-19/perseed-deadtarget-diag-b/*.json' --metrics
national,table,wins,exiled` — refused, verbatim:
"telemetry-check: refusing recorder-corpus input: all 8
--current rows carry top-level anchorCommit, so they are sweep
recorder rows, not runs. Recorder corpora are compared with
sweep-compare tables, never against a run baseline here. Pass
--allow-recorder-corpus for a same-shape recorder-vs-recorder
compare, or --update-baseline to reseed a baseline from these
files." Exit 2 (the refusal code, not a failure). Same refusal
as dmgshape-rerun-b. No deviation recorded; wall numbers above
are reported directly.

## 5. Sense-test: reading the fights

The d126 kill (Rafael, 9 rounds, 221 dealt) and the d124
first-fight (Marcel, 7 rounds, 62 dealt) read in full.

- **d126 kill:** the richest log on the leg and a real finish.
  Rafael opens with the bow at range (3 shots, 1 hit for 19 —
  the volley works here, unlike the empty-pouch fights of the
  arrow-supply line), then strikes 27/21/24/22/21/21/21/21/24
  as the herald's HP ticks 192 → 0. "The lead falls — the
  pack's coordination shatters. The rest scatter or die."
  reads as a genuine ending to an eleven-day grind, not a
  launched party overpowering a fresh monster. The thin spot
  is the same as dmgshape noted: "Rafael holds the line —
  they know how this one is fought, and have not had their
  turn to prove it" repeats seven times (R2–R8), and "The
  Herald is wounded past its line — and holds its ground"
  repeats five times. Good once, flat by the fifth telling.
  No double-naming: the log calls it "The Herald"
  throughout.
- **d124 first-fight:** byte-identical to the dmgshape leg's
  d124 (Marcel strikes 12/8/8/12/10/12, binds a wound in R1,
  "holds the line" five times in five rounds, Rafael arrives
  into the flee at R7: "Rafael answered Marcel's shout, but
  Marcel is past holding — they run while running still
  works."). A 7-round fight that dealt 62 damage against a
  284-HP monster was never winnable — the same verdict as
  the earlier leg, now reproduced exactly.

## 6. Village assessment, in plain words

Eight villages, and the story splits in two. On one seed the
village fights a single herald for eleven days — eight
meetings, 710 damage, the kill finally landing on the eighth
— and then the same man who fought beside the killer walks
out twice more after the very same herald, ten and fifteen
days after it died, because nobody ever told his plan the
herald was dead. The village itself knew: the fire had told
everyone the herald was slain. His plan didn't know, because
the kill is only ever told to the person who lands it, and
he was standing beside the killer, not holding the blade.
On the other seed the same shape dies before it can happen:
the holder takes a wound on the first launch and dies of it
the next day, and the herald is killed by someone else five
days later in a fight the holder never saw. The villages
that launch at all launch honestly — every live departure
came a day or two after the target was last seen alive and
fought. The dead departures are not carelessness; they are
the plan store doing exactly what it was built to do,
holding a target no one ever cleared. Nobody wins, nobody
reaches national, nobody takes a seat, and four villages sit
one standing point short of release — the same wall, to the
number, as the leg before.

## 7. Metric review (for the NEXT run — this run is judged as frozen)

1. **The analyzer's first version misclassified the two dead
   launches — and the gate cross-check caught it.** The
   first `lastFoughtBefore` kept the FIRST row at the max day
   (strict `>`); on d126 a flee and the kill share the day,
   so it took the flee and classified both re-launches live
   (dead 0/6, gateMismatch 2, verdict NO-GO INSTRUMENT).
   The frozen rule is "the LAST pre-launch fought encounter";
   the recorder appends chronologically, so the last row at
   the max day is the latest fight. The fix (strict `>` →
   `>=` in `lastFoughtBefore` / `lastSightedBefore`, commit
   `dff65072a`) implements the frozen rule correctly — this
   is a correction to match the prereg, not a re-score: the
   classification rule, the bars, and the corpus are all
   unchanged, and the corrected numbers are dead 2/6,
   gateMismatch 0, verdict DIAG-GO. The selftest now pins
   the tie-break with two correction cases (same-day
   flee-then-kill → dead; kill-then-flee → live; 22/22).
   The cross-check (driver snapshot vs analyzer
   recomputation) earned its keep: without it the wrong
   verdict would have shipped.
2. **The stage hypothesis was wrong, and the truth is
   sharper.** The prereg guessed re-launches depart from
   `'standing'`; both dead launches departed from `'hunt'`
   because `winPlanNoteKill` fires only for the killer.
   A fix arm must decide what a holder learns from a kill
   they witnessed but didn't land — the village-told channel
   (`villageSlain`) exists, the holder's own knowledge does
   not.
3. **Target matching is by TYPE, not instance** (prereg
   §"Metric review"): the recorder carries no instance id.
   The d126 kill and the d136/d141 departures are about
   "the herald" the village ground down — the arithmetic
   (710 = 700 + 10 overkill) fits one individual, but the
   instrument cannot prove it. The evidence names the type
   beside every launch so this stays auditable.
4. **The `live` class is weak evidence of liveness** (prereg
   §"Metric review"): a non-kill fight 1–2 days before the
   launch is fresh here (median days-since 1.5), but the
   class means "last seen alive in a fight", not "alive now".
   A future gate design (recency window) would need the
   days-since distribution this diag reports: live launches
   1–2 days, dead launches 10–15 days — the two classes
   separate cleanly on recency alone on this band.
5. **Day granularity:** one first-fight-after is same-day
   (d124 — launch and fight on the same day). The family's
   convention (day ≥ launch.day) is kept; the same-day row
   is flagged in the per-launch table (§2).
6. **Panel / telemetry:** panel ran (review_required, no
   material signal); telemetry refused recorder corpora
   (verbatim, §4). No LOUD lines from either.
7. **No `check.js` gate was run** — the instrument is
   evidence-only, zero `src/js` changes; the proof test
   (`test-deadtarget-diag-b.js` 22/22) and the analyzer
   selftest (22/22) are the gate for this arm (dmgshape-
   rerun-b §7.7 precedent).

## 8. Blanks and findings notes for the coordinator

- **JUDGED VERDICT: DIAG-GO** — the departure-gate question
  is answered: no liveness/recency/sighting check exists on
  the departure path (`winPlanDepart`, `launchParty`,
  `winPlanFightGate` — §1), and the classified population
  shows dead-target departures happening under the landed
  substrate (2/6, both the exact #2617 pair).
- **Finding #2617 — ANSWERED, partial reproduction:** the
  106084 pair reproduces exactly (same holder/day/target/
  node; dead share on the band 0.333 vs 0.50); the 106081
  pair does not (holder died d113 of a wound; the kill moved
  to d117 aid by another killer). The mechanism answer does
  not depend on the reproduction: the code has no gate
  either way.
- **Finding #2616 EXTENDS — launch rate falls again:**
  17 → 9 → 8 → 6 launches on identical seeds across the
  survey, partysurvive-rerun, dmgshape-rerun, and this leg.
  The designation is a property of a (substrate, policy)
  pair, not of the seeds — now on its fourth substrate step.
- **NEW mechanism (for the fix arm, not built here): the
  kill is told only to the killer.** `winPlanNoteKill`
  fires for the fighter whose agency fight resolved with
  `vKill` (villager-agency.js:694); allies in the kill fight
  never learn, so a holder who fought beside the killer
  keeps stage `'hunt'` and re-launches. The fix arm must
  decide the learning channel: village-told
  (`villageSlain`, which the village already has) vs the
  holder's own perception (what they saw/heard) — and what
  the holder does instead (hold? retarget? dissolve to
  party?). Proposed next arm (named precisely):
  **sim-deadtarget-gate-b — BUILD: a departure gate in
  `winPlanDepart`** that refuses to launch a plan whose
  target type the village has slain with no fight since
  (villageSlain + last-fight recency from the plan store),
  and re-seeds or dissolves the plan instead of departing.
  Proof bar for that arm: a dead-target launch must not
  depart on this band's corpus shape, and the launch rate
  must not collapse (the live launches are the control).
  Design calls owed before the build: type-level vs
  instance-level liveness, and holder-knowledge vs
  village-knowledge (perception-first).
- **Standing-199 stall, 4/8 seeds.** Four villages sat at
  199, one point short of the 200 release bar — same stall,
  same count as the dmgshape-rerun leg. Still the visible
  ceiling on this band.
- **Wave 5 opened on 4/8** (same as the dmgshape-rerun
  leg). Survival identical (5/8, median 150.5d). The wall
  is byte-identical to the previous leg on every per-seed
  number — the substrate step moved nothing measurable.
- **Out-of-scope gap (note only):** `the wild` (35%) +
  generic `monster` (25%) = 60% of villager deaths are
  unstoried classes. Same note as finding #2607; no new
  mechanism claimed here.
- **Instrument note:** the gate cross-check (driver snapshot
  vs analyzer recomputation) caught a real analyzer bug
  before the verdict shipped (§7.1). The cross-check stays
  in the analyzer for any future arm that reuses it.
- **Safe-commit index clobber struck three times** on this
  branch (after the prereg commit `bdca2df67`, the
  instrument commit `da21a2b32`, and the correction commit
  `dff65072a` — committed files showed staged-deleted, the
  third time as `MM`). Repaired each time with the
  documented `git ls-tree -r HEAD -- <paths> |
  git update-index --add --index-info` pipe; verified by
  `git status` empty + `git diff HEAD` empty +
  hash-object == HEAD blob per file. All three commits are
  correct; only the main index lied.
- **Panel / telemetry:** panel ran (review_required, no
  material signal, §4); telemetry refused recorder corpora
  (verbatim, §4). No LOUD lines.
- **No `check.js` gate was run** (see §7.7). No game-code
  change exists on this branch to merge — the coordinator
  lands evidence-only or releases the branch
  done-abandoned.
