# sim-gatelever-b — the gate lever pilot (Loop B, run fleshout-loop-b-20261116T0730Z)

## Verdict: NO-GO — lever KILLED, reverted, evidence-only

The gate lever moved the winnability chain — the first gate SEEKs, the
first launched-party wave-4 kills, wave 5 unlocked on 3 of 8 seeds
(control: 0 of 8) — but it fails the frozen GO bar on two of the five
bars: kill:death 0.67 against a 0.92 bar, and faced-not-killed 0.67
against a 0.20 bar. Per the prereg the pilot NO-GO kills the lever:
all game code (the three gate changes plus the vetparty seed call)
is reverted on this branch in commit `a1e3d9378`, and this evidence,
the instrument, and both corpora land as evidence-only. No 12–16
seed confirm runs on an invisible-or-losing effect.

In plain words: the lever got villagers to the big fights in threes
and got the gate to say "go" once, but the fights they then fought
killed more villagers than beasts (2 kills against 3 deaths in the
counted meetings), and two of the three villages that reached wave 5
met it without killing one. The lever also made the run deadlier
overall: 645 villager deaths against 559 on the control leg.

## Prereg header

- Prereg: `evidence/2026-11-16/sim-gatelever-b-prereg.md`
  (commits `807381e36`, Correction C1 `50947b150`). GO bar:
  gatereach2 §8, binding, frozen definitions in the prereg.
- Design: control leg = the vetparty seed call only (re-landed
  verbatim, 13 lines, commit `aaf9d13b6`); lever leg = seed call +
  the three gate changes (commit `757b3be05`).
  - Part 1 — the launched party arrives as three: a second
    companion joins a launch when one is free (never waited for),
    and the gate counts the plan's own launched party, not only
    who is sensed at the meeting tile. The gate's bar is unchanged:
    still 3 for wave 4+.
  - Part 2 — the trick is known before the meeting: a hunt or
    standing plan naming a wave-4+ beast whose trick the village
    has not learned waits at Haven, bounded 7 days, once per
    target; on expiry the hunt launches anyway.
  - Part 3 — the plan names the beast: a fled fight re-points a
    hunt/standing plan at the beast actually fled, and the gate
    accepts a hunt plan whose holder personally fought the beast
    in front of them. Rumor-born plans never qualify.
- Seeds: 102101–102108 (8, fresh — zero hits across preregs,
  evidence, scripts, tracker, findings, per-seed filenames, and
  memory, re-verified per the seed-band-freshness skill).
  Horizon 150 days, death-aware. Policy: competent verbatim,
  sha256 `74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456`
  (matches the dawnbid/gatereach2 policy).
- Base: master tip `9b04ae9b7`. Control leg ran on the seed-call-only
  tip; lever leg on the lever tip. Proof test
  `scripts/test-gatelever-b.js` green on the lever tip (static,
  judge, recorder, determinism D1+D2 identical at 150d, seed
  102101) and green post-revert (`GATELEVER_MODE=off`: static
  src diff 0, seed call absent).
- Instrument: `scripts/gatelever-driver-20261116.js`,
  `scripts/analyze-gatelever-b.js`,
  `scripts/gatelever-drift-check.js`,
  `scripts/build-gatelever-panels-20261116.js` (commit `4bc64f062`
  + panel builder, this landing). Analysis:
  `evidence/2026-11-16/gatelever-b-analysis.json`. Corpora:
  `evidence/2026-11-16/perseed-gatelever-b-control/` and
  `perseed-gatelever-b-lever/` (8 files each, 0 instrument
  errors). Balanced panel:
  `evidence/2026-11-16/gatelever-b-panel.{json,md}` (before/after
  `.json.gz` alongside).

## The verdict, bar by bar

| Bar (prereg, binding) | Control | Lever | Bar | Pass? |
| --- | --- | --- | --- | --- |
| 1. Gate SEEKs (wave-4+ rows) | 0 | **1** (distinct 1) | ≥ 1 | **PASS** |
| 2. Launched-party wave-4+ field kills (distinct) | 0 | **2** | ≥ 1 | **PASS** |
| 3. Kill:death | null (0/0) | **0.67** (2 kills / 3 deaths) | ≥ 0.92 | **FAIL** |
| 4. Faced-not-killed share among unlocked | null (0 unlocked) | **0.67** (2 of 3) | ≤ 0.20 | **FAIL** |
| 5a. Starvation | 4 | **5** | ≤ control + 2 (6) | **PASS** |
| 5b. Median survival (days) | 119 | **132.5** | ≥ 0.8× control (95.2) | **PASS** |
| Instrument (errors, consult/arrival shares) | 0 errors, 1.0 / 1.0 | 0 errors, 1.0 / 1.0 | clean | **PASS** |

GO requires all five. Bars 3 and 4 fail, so the verdict is NO-GO.

Sensitivity note on bar 3: the frozen denominator counts only
deaths where the dead villager was the expedition holder (a
covering holder launch). Two more villagers died as companions
on wave-4+ expeditions (Priya Nair, seed 102103 day 84, Eater;
Diana Osei, seed 102103 day 112, Cancellation wave 5). Counting
all five expedition deaths, kill:death would be 2/5 = 0.40 —
still a fail. The verdict does not rest on the accounting
choice. (Correction C1: the death log's `'villager combat'` rows
are the killed beasts' own records; that term contributes 0, as
the analyzer reports — `vcDeathsW4plus` 0.)

## Wall numbers

Both standing reads are reported, named, because they disagree
(the known definition gap — see the sim-findings entry on wall
"national": the rank label advances on link/covenant staging,
the standing total on points).

| | Control | Lever |
| --- | --- | --- |
| National by end standing ≥ 200 | 0/8 | 3/8 (102102: 335, 102103: 250, 102104: 625) |
| National by final scaleRank | 0/8 (all regional) | 0/8 (all regional) |
| Table (seat taken) | 0 | 0 |
| Wins | 0 | 0 |
| Wave 4 unlocked (maxWave ≥ 4) | 8/8 | 8/8 |
| Wave 5 unlocked (maxWave ≥ 5) | 0/8 | 3/8 (102102, 102103, 102104) |
| Median survival (days) | 119 | 132.5 |
| Starvation deaths | 4 | 5 |
| Total villager deaths | 559 | 645 |
| Wave-4 kills, all origins | 12 | 20 |
| Wave-5 kills, all origins | 0 | 2 (both seed 102104) |
| Days: survived / village-lost | 3 / 5 | 3 / 5 |

Per-seed lever classes: 102101 LOCKED, 102102 FACED-NOT-KILLED
(unlocked day 126, first faced day 130), 102103 FACED-NOT-KILLED
(unlocked day 108, faced day 109), 102104 KILLED (unlocked day
87, faced day 90, 2 kills), 102105 LOCKED, 102106 LOCKED,
102107 LOCKED, 102108 LOCKED. Control: all 8 LOCKED.

## Mechanism decomposition (lever leg)

| Mechanism | Count | What it means |
| --- | --- | --- |
| Second-companion launches (part 1A) | 25 launches, 28 departs | A second companion joined a launch on 102103 (8), 102104 (13), 102106 (4). The party that sets out is three now, where the pool allows. |
| Gate rows with plan-counted members (part 1B) | 2 rows, 0 SEEKs | The gate counted a plan member twice; neither row became a SEEK. |
| Trick-wait holds, recorded (part 2) | 0 rows, 0 episodes | See metric review §4: the counter is blind to how the hold actually lands. The wait DID engage (27 dawn wins), but no hold row was ever recorded. |
| Seed re-points on fled (part 3A) | 47 rows | Plans re-pointed at the beast actually fled, across all 8 seeds (102104 alone: 18). |
| SEEKs via lived-fought acceptance (part 3B) | 0 | No SEEK came through the lived-fought disjunct. |
| SEEKs via plan-target match | 0 | No SEEK came through a plan-target match either (see §3). |

Gate consultations (wave 4+): control 67 rows (null 21, avoid
46, seek 0); lever 66 rows (null 37, avoid 28, seek 1). The
lever moved 18 avoids into nulls: parties now arrive big
enough, but the gate still says nothing — because the target or
the trick is missing. Lever null decomposition: 31 party-OK /
not-target / trick-unknown, 6 party-OK / target / trick-unknown;
**0 of 37 null rows had a known trick** (control: 0 of 21).
Avoids are all `outmatched`, party sizes 1 (5) and 2 (23) —
the remaining avoids are launches that never reached three.

## Sense-testing

The single SEEK (seed 102104, day 94): Leonard
(`app_mgpsphn0592`) meets the Eater with Jorge Silva and Grace
Obi beside him — three people, all armed and armored, the
Eater's trick already known. The gate says seek. The fight
lasts three rounds and Leonard flees: "R1: Gorge hits Leonard
for 16 (60 left)", "R2: Gorge hits Leonard for 25 (35 left)" —
and the encounter ends `vFlee`. The gate opened the door; the
party still walked away from it.

The two kills (both Jorge Silva, seed 102104, both ordinary
encounters — the gate returned null on both, trick unknown,
plan target 'spool'):

- Day 82 vs the Algorithm, wave 4. Jorge opens at range
  (4 shots, 55/56/53/56), then "R1: Jorge chose this fight
  before it knew it was one. (Choose the Terms: Ambush)",
  strikes for 213 (x3.0), 142 (x2.0, Rage), 280 (HAYMAKER x2),
  calls Dale Hoffman in on round 3, and the Algorithm dies on
  round 5. 1,090 damage dealt, 42 taken.
- Day 90 vs the Spoiler, wave 5 — the leg's first wave-5 kill.
  "R1: Blooded — the village knows where the Producers bleed",
  strikes for 324 (x3.0), 219 (x2.0), 420 (HAYMAKER x2), calls
  Emma Larsen in, and the Spoiler dies on round 4. 1,365
  damage dealt, 25 taken.

The three counted deaths (all parties of three, all armed and
armored, all gate-null, all trick unknown):

- Seed 102103, day 70: Katarina Novak vs the Reunion, 2 rounds.
  "The Reunion wears Katarina's strikes — the familiar ones land
  soft." 21 damage dealt, then "Your Move hits Katarina for 30
  (22 left)" and 29 (0 left). The mirror's trick was unknown;
  the party watched her die in two rounds.
- Seed 102103, day 92: Ruby Callaghan vs the Eulogy, 10 rounds.
  "The Eulogy narrates: 'Ruby faltered.'" five times over, Devon
  charges in on round 2, and the log ends "The Eulogy finishes
  — Ruby dies as narrated. (The village will remember the
  story.)" 795 damage dealt, 1,438 taken.
- Seed 102104, day 103: Jorge Silva vs the Algorithm, 3 rounds —
  the same Jorge who killed the Algorithm on day 82 and the
  Spoiler on day 90. "R3: Engagement hits Jorge for 19 (0
  left)." 759 damage dealt. The log names the beast "Big Loud"
  in the fight text while the row says Algorithm — a naming
  quirk, out of scope (see sim-findings).

The two uncounted companion deaths: Priya Nair, seed 102103
day 84 vs the Eater ("Priya should have poisoned the meal",
2 rounds, 68 damage dealt); Diana Osei, seed 102103 day 112
vs the Cancellation, wave 5 ("the stamp descends over Diana",
2 rounds, 33 damage dealt).

## Metric review

1. **The control replicates the gatereach2 instrument leg in
   shape.** SEEK 0, 0 launched kills, 0 mechanism firings, 67
   wave-4 consultations (gatereach2's band: 46 — same shape,
   higher count; a band difference, not a failure), 46
   avoid:outmatched, 21 nulls. The nulls split 12 party-OK /
   not-target / trick-unknown and 9 party-OK / target /
   trick-unknown (pure trick-holds). The lever's parts 2 and 3
   were aimed squarely at those 21 rows — and the lever leg's
   nulls grew to 37 because more parties now reach the gate
   with the party fixed but the target or trick still missing.
2. **Part 1 works as a party builder; the gate still will not
   say seek.** Second companions launched 25 times and departs
   show 28; avoids fell 46 → 28. But the only SEEK in the leg
   did not come from any lever part: on seed 102104 day 94 the
   live defer-beat need named wave 4, the party of three was
   sensed together on an ordinary expedition (not a plan
   launch), and the trick was already known. `seeksPlanCounted`
   0, `seeksLivedFought` 0, `seeksTargetMatch` 0 (by plan
   fields). Part 1B counted a plan member on 2 gate rows and
   produced nothing. Part 3A re-pointed 47 plans and produced
   no SEEK through the lived-fought disjunct.
3. **The kills do not come through the gate at all.** Both
   counted kills happened on gate-null ordinary encounters —
   the gate said nothing, the party of three fought anyway, and
   won. The gate's SEEK is not the kill path on this band; the
   ordinary encounter is. That is why bar 1 can pass while
   bars 3 and 4 fail: the SEEK is a rare, fragile event (1 of
   66 consultations) and the killing happens elsewhere, at
   roughly even odds with dying (2 kills, 3 counted deaths,
   5 expedition deaths total).
4. **Part 2 engaged, but the instrument cannot see its holds —
   and the holds may not matter.** The trick-wait candidate won
   the dawn lottery 27 times (13 on 102103, 11 on 102104, 3 on
   102108; `brainEnd.byAction` in the corpora). Zero
   trick-wait hold rows were recorded, because the hold lands
   through `vbrainAlignObjective`: a trick-wait commit rewrites
   the villager's live objective to an indoor Haven chore, and
   `vbrainExecuteDepart` — the only thing the depart recorder
   watches — is never called for a chore objective. The
   analyzer's `trickWaitRows` counts only executeDepart holds,
   so it reads 0 while the wait ran. The wait clock did arm
   and expire in the open: on seed 102102, gen_19ep7t1 fled
   the Algorithm on day 62 (the seed re-pointed his plan at
   it), launched for it on day 72 and again on day 85 with
   `trickWaitedFor: 'algorithm'` set — the 7-day bound ran
   out and the hunt went anyway. The only wait releases visible
   in the corpora are the 3 expiry marks; no wait is shown
   released because the village learned the trick. And every
   gate null on the lever leg (37/37) still had an unknown
   trick. The wait, as built, only ever expires — it never
   opens a hunt on a learned trick. (Instrument gap filed in
   sim-findings.)
5. **The drift flags are the drift check's blind spot, not
   substrate drift.** The check flags 2 seeds: 102103
   (diverges day 49, first recorded lever action day 55) and
   102106 (diverges day 38, first recorded action day 42);
   3 seeds CLEAN, 2 IDENTICAL. Investigation: on both flagged
   seeds a second-companion launch happened ON the divergence
   day itself and is recorded in the depart rows (102103 day
   49: Ruby Callaghan + Devon Okafor; 102106 day 38:
   gen_uvntpcq + gen_1e3uys7) — but the check's
   first-lever-day reads second-companion launches from
   `grLaunches.partyAfter ≥ 2`, and on both launches
   `partyAfter` recorded only 1 companion, so the check missed
   them. The lever acted on or before the divergence day on
   both seeds. No substrate drift is indicated: same seed call,
   policy, and data in both legs, and the lever tip is
   deterministic (D1/D2 identical). (Instrument gap filed in
   sim-findings.)
6. **The balanced panel says the lever costs deaths.**
   Decision `review_required` (8 paired cases). Village deaths
   per run 69.875 → 80.625 (+10.75, 95% exploratory interval
   1.25 to 20.5) — a regression signal. Deaths per 100 days
   56.77 → 61.48 (+4.71, interval −0.36 to 10.49) — a
   regression watch. National access 0 → 0, wins 0 → 0,
   community loss 0.625 → 0.625, survival through day 30/60
   1 → 1. The extra deaths concentrate on the seeds with the
   most gate-enabled departures; seed 102101 alone is +24
   deaths (54 → 78) with zero gate benefit — no SEEK, no kill,
   still LOCKED. The frozen cost bar (starvation + median
   survival) passes, but the deaths price is the same shape
   Loop A flagged on launchdef-a, and it is the panel's one
   material signal. (Filed in sim-findings.)
7. **Wave 5 opened but did not convert.** Three seeds
   unlocked wave 5 (control: none) and one killed two wave-5
   beasts (seed 102104, the Spoiler on day 90 and a second
   wave-5 kill in the totals). The other two unlocked seeds
   faced wave 5 and killed nothing — that is the 0.67
   faced-not-killed share. The lever moved the unlock, not
   the kill.
8. **Survival rose while deaths rose.** Median survival 119 →
   132.5 days, but total deaths 559 → 645. Longer-lived
   villages accumulate more deaths over more days, and the
   per-100-days death rate rose too (+4.71) — the lever's
   villages live longer and bleed faster, because they fight
   more wave-4/5 beasts (wave-4 kills 12 → 20, wave-5 kills
   0 → 2) and lose more of those fights than they win.

## Telemetry deviation check

- Instrument errors: 0 on both legs, all 8 seeds each.
- Consultation share: 1.0 both legs (every wave-4+ gate row
  classified). Arrival share: 1.0 both legs.
- Proof test green on the lever tip and green post-revert
  (off mode, `src` diff vs base 0, seed call absent).
- No telemetry deviation: the judged numbers come from the
  recorded rows, and the recorder wrapped every gate, seed,
  depart, and encounter on both legs. Two instrument blind
  spots were found during the review (trick-wait holds land
  outside the depart recorder; first-lever-day misses
  3-person launches with `partyAfter` of 1) — both are filed
  in sim-findings and neither changes the verdict: bar 3 fails
  under the frozen accounting and under the all-expedition-
  deaths accounting (0.40), and bar 4 is a straight class
  count (2 of 3 unlocked).

## Loop A interaction

Loop A arm sim-launchdef-a is PILOT GO (the profile-gate
bypass lands as game code via Loop A's coordinator). The
bypass is NOT in this tree: `findCompanion` in both
win-plan.js and villager-brain.js still requires a wanderer
or explorer profile. The lever was therefore measured on the
profile-gated companion pool, exactly as preregistered. If
the bypass lands in master, the pool widens and part 1A's
25 second-companion launches are a floor, not a ceiling —
but the failing bars are about kill:death and conversion,
not about how often a second companion exists, so a wider
pool would not by itself repair this verdict. No Loop A
files were touched. Sibling arm sim-poolmarginals-b shares
no files with this arm.

## What happens next

- **Revert done.** Game code on this branch is byte-identical
  to base `9b04ae9b7` (commit `a1e3d9378`; `git diff
  9b04ae9b7 -- src/` empty; zero lever/seed markers). The
  branch lands evidence-only: instrument, corpora, analysis,
  panel, and this note.
- **Open for the coordinator / Steve, in plain words:**
  1. The gate says "go" almost never even when the party is
     three and armed — because the trick is unknown on every
     null row. Is there a faster way for a village to learn a
     wave-4 beast's trick than surviving two ordinary meetings
     with it, or should the gate stop demanding the trick at
     all? That is the next design question; this pilot cannot
     answer it.
  2. The kills happen in ordinary fights the gate never
     blesses, at roughly even odds with dying. If the gate is
     meant to be the thing that makes wave-4 fights winnable,
     it needs to change what happens inside the fight, not
     just who walks in — or the bar for "launched-party kills"
     needs to count the ordinary-encounter kills the lever
     actually produces.
  3. The lever's price is deaths (+10.75 per run on the
     panel). A confirm round for any future gate change should
     pre-register a deaths term, or the coordinator should
     rule the combat-death price acceptable for wave-5 access.
- **Do not chase in this arm:** the Big Loud / Algorithm
  fight-text naming quirk (seed 102104 day 103 log names the
  beast "Big Loud" while the row says Algorithm); the
  standing-vs-scaleRank "national" definition gap (already
  filed); the trick-wait instrument gaps (filed below).

## Files and commits

- Branch `sim-gatelever-b`, base `9b04ae9b7`.
- `807381e36` prereg; `50947b150` Correction C1;
  `4bc64f062` instrument (driver, analyzer, drift check,
  proof test); `aaf9d13b6` seed call re-landed verbatim;
  `757b3be05` the lever (+ determinism-d2 sync-write fix);
  `a1e3d9378` REVERT (pilot NO-GO).
- Evidence + corpora + analysis + panel + panel builder:
  committed with this note (see the landing commit).
- Proof test: green on the lever tip and green post-revert.
  Two proof-test findings, both fixed in `757b3be05`: the
  static check reads the committed diff (lever must be
  committed before the proof runs), and the determinism-d2
  child truncated its ~200KB key line on `process.exit(0)`
  after `console.log` to a pipe — it now writes the line
  with a synchronous write before exiting.
- safe-commit.sh refused the revert once (265-line deletion
  trips its stale-tree guard); re-run with `--force-delete`
  under the brief's explicit NO-GO→revert order, after
  verifying the worktree was byte-identical to base.
  safe-commit.sh also lost its exec bit in this worktree
  (mode 644); invoked via `bash` throughout. The index
  clobber struck after both safe-commit runs; repaired with
  the `ls-tree | update-index --add --index-info` pipe each
  time, verified with hash-object matches.
