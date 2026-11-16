# sim-gateconfirm-a — the profile-gate bypass tested AS LANDED: CONFIRM NO-GO (vacuous)

Run `fleshout-20261116T0825Z`, axis scale-onramp (converging, NOT
converged). Arm: **sim-gateconfirm-a**. Branch `sim-gateconfirm-a`,
worktree `~/workspace/worktrees/sim-gateconfirm-a`, base master
`796fa96ca`. Sibling arms: none on this run (Loop B live on
DIFFERENT bands — untouched).

## Verdict: CONFIRM NO-GO (VACUOUS)

The frozen bar was: launched wave-4+ plans on ≥3 of 12 seeds
(any-commit definition) AND the cost bar clean AND the new deaths
term clean AND the instrument valid AND skip-reason coverage. The
armed leg launched **1 instance on 1 of 12 seeds** (102028) — and
the control leg launched the SAME instance on the SAME seed, by the
SAME wanderer, on the SAME day. The two legs are **bit-identical
trajectories on all 12 seeds** (11/12 exactly; the 12th differs only
in the recorder's leg label on its skip rows). The bypass changed
nothing: no non-ranger holder ever held a `party_launch` commit at
a tick on this band — the control leg recorded **zero**
`profile-gate-veto` rows in 12 seeds. The deaths term is clean
because the gate never engaged (delta 0, scholar delta 0, no new
mode), not because the price was paid and absorbed. Instrument
valid (classified 1.0, unknown 0, 24/24 files parse, 0 instrument
errors, drift clean). Skip coverage clean (0 bare
`selected-not-executed` days out of 9 blocked commit-days).
Proof 90/90 on the armed tip, the control tip, and the post-restore
tip. **NO-GO — and vacuous under the prereg's clause (2 instances
opened across both legs, < 4): the fix AS LANDED is inert on this
band because plans almost never form without a seed source, NOT
because the gate fails when plans exist.** The pilot already proved
the gate in isolation WITH a seed source (6 launched on 4/8 seeds).

**Disposition:** the fix stays on master (this arm reverts nothing
— the control-leg revert was a working-tree state, restored and
verified after the run). Whether the seed call lands WITH the gate
fix, as a chain repair, is the coordinator's decision — this confirm
is the evidence for it: on master-as-is, 12 seeds produce 11
wave-4 seed calls and 1 plan. No game-code change is committed by
this arm; its commit is evidence + instrument only.

## The lever, in plain words

Dawnbid found that wave-4+ plans were bid and selected but never
left, because the daily departure routine skips anyone who is not a
wanderer or explorer before it ever tries to send them out. The
gate fix (landed on master as `ed542bba4`, 18 insertions) says: a
launched `party_launch` plan bypasses that profile gate in the
depart path. The pilot proved the bypass works — when plans are fed
to it by a re-landed seed call. This confirm asks the landing
question instead: with the fix as it ships, no seed call anywhere,
do villages actually launch more wave-4 parties than without it?
Answer: no. Not because the bypass is broken — on the one plan
that formed, the holder was a wanderer and the gate never applied —
but because on master-as-is almost nothing ever becomes a plan in
the first place. The chain stalls one step earlier, at the seed:
109 seed calls in 12 seeds, and 100 of them arrive while the
holder's plan is already out hunting, so they open nothing.

## Before / after (identical seeds 102021–102032, 150d death-aware horizon)

Baseline: tableseat-nowait policy (`scripts/policies/tableseat-nowait.js`,
sha `a11a1abc672e`, wrapping leanlinkrescue `53f310aba27a`),
env `LEANLINKRESCUE=1 TABLESEATNOWAIT=1`, both legs — a REAL
tableseat-nowait baseline (flags on). The subject is the bypass AS
LANDED: armed = master as-is (bypass present, `game.js` seed call
absent — verified 0 `winPlanSeedFromFight` hits in `src/js/game.js`
on master); control = master with ONLY the 18-line PROFILEGATE
bypass reverted in `src/js/villager-agency.js` (working-tree state
for the control-leg run, exact inverse of `ed542bba4`: 1 insertion,
18 deletions; restored immediately after, PROFILEGATE marker
verified back). No seed call re-landed on either leg — this confirm
tests the landing shape, per the prereg's Decision 1 and its
vacuity clause. The judged difference isolates the bypass, in the
shape in which it ships.

Seed-band freshness (verified 2026-11-16 by this arm, re-verified
with `rg` — the coordinator's check confirmed independently):
zero hits for the exact seeds 102021–102032 in `evidence/*.md`
(all dated preregs included), `scripts/*.js`, and per-seed
filenames under `evidence/`; one hit in goal `hidden_files/` that
is NOT a seed (`hidden_files/evidence-archive/2026-10-07/run-flesh-out-loop-20261007-0508.md:21`
names version tags `102032` and `102025` from a 2026-10-07 bump).
Raw-substring hits in old `.json`/`.jsonl` corpora are floats, not
seeds (e.g. `28.741020215970007` contains `102021` as a substring).

### Bucket decomposition (analyzer `gateconfirm-a-analysis.json`)

| Bucket | Control (1 instance) | Armed (1 instance) |
|---|---:|---:|
| launched (any-commit) | 1 | **1** |
| target-killed | 0 | 0 |
| selected-blocked | 0 | 0 |
| bid-not-selected | 0 | 0 |
| plan-churned-before-dawn | 0 | 0 |
| candidate-not-bid | 0 | 0 |
| unknown | 0 | 0 |

Seed calls wave-4+ (analyzer count): control 11, armed 11.
Classification: classified share 1.0, unknown 0, 24/24 files
parse, 0 instrument errors. Instance count is 1 vs 1 — the same
single instance on both legs.

Launch events: armed **1 launch** (dawn, day 71) vs control 1
(the identical launch). The gate adds **+0 launch events, +0
instances, +0 seeds** beyond control. The one instance is
aki_tanaka (seed 102028, target reunion, companion gen_6a0qgib)
— a WANDERER, so the profile gate never applied to them on either
leg.

### GO section (analyzer)

| Bar | Armed | Control | Pass |
|---|---:|---:|---|
| launched seeds (≥3 of 12 needed) | 1 (102028) | 1 | **NO** |
| launched total (instances) | 1 | 1 | — |
| launched dawn-only (secondary) | 1 | 1 | — |
| median survival | 93d | 93d | ratio **1.0** ≥ 0.8 ✓ |
| starvation deaths, totals | 3 | 3 | 3 ≤ 3+2 ✓ |
| starvation deaths, arm-only (matched same-seed same-day) | 0 | 0 | 0 ≤ 0+2 ✓ |
| deaths, totals | 709 | 709 | delta **0** ≤ +24 ✓ |
| scholar deaths | 33 | 33 | delta **0** ≤ +12 ✓ |
| new death modes | [] | — | ✓ |
| bare selected-not-executed days | 0 / 9 blocked days | — | ✓ |
| national at end (scaleRank ≥ 2) | 11/12 | 11/12 | — |

### Wall numbers

| | Control | Armed |
|---|---:|---:|
| wins | 10/12 | **10/12** |
| national at end (scaleRank ≥ 2) | 11/12 | 11/12 |
| national (standing ≥ 200, analyzer wall) | 1/12 (seed 102032, standing 277) | 1/12 |
| table seats | 0/12 | 0/12 |
| wave-4 reached | 12/12 | 12/12 |
| wave-5 reached | 1/12 (seed 102032) | 1/12 |
| median survival | 93d | 93d |
| villages lost | 2/12 | 2/12 |
| total deaths | 709 | 709 |
| scholar (player) deaths | 33 | 33 |
| starvation deaths | 3 | 3 |

The wall numbers are IDENTICAL on both legs because the
trajectories are identical — the wall moved nowhere, which is the
point: the fix as landed contributes nothing measurable on this
band, in either direction.

### Per-seed table

| Seed | Leg | Days | End | Won | Rank | Standing | MaxWave | Deaths | Scholar | Starv | Instances | Launched |
|---:|---|---|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| 102021 | both | 93 | won | yes | global | 199 | 4 | 76 | 5 | 0 | 0 | 0 |
| 102022 | both | 120 | won | yes | global | 199 | 4 | 47 | 3 | 0 | 0 | 0 |
| 102023 | both | 90 | won | yes | global | 199 | 4 | 57 | 3 | 0 | 0 | 0 |
| 102024 | both | 95 | won | yes | global | 199 | 4 | 68 | 4 | 0 | 0 | 0 |
| 102025 | both | 90 | won | yes | global | 199 | 4 | 38 | 5 | 0 | 0 | 0 |
| 102026 | both | 59 | village-lost | no | regional | 199 | 4 | 44 | 2 | 1 | 0 | 0 |
| 102027 | both | 83 | village-lost | no | national | 199 | 4 | 60 | 1 | 2 | 0 | 0 |
| 102028 | both | 93 | won | yes | global | 199 | 4 | 64 | 0 | 0 | 1 | 1 |
| 102029 | both | 97 | won | yes | national | 199 | 4 | 38 | 1 | 0 | 0 | 0 |
| 102030 | both | 114 | won | yes | national | 199 | 4 | 49 | 3 | 0 | 0 | 0 |
| 102031 | both | 90 | won | yes | global | 199 | 4 | 99 | 2 | 0 | 0 | 0 |
| 102032 | both | 105 | won | yes | global | 277 | 5 | 69 | 4 | 0 | 0 | 0 |

"Both" is literal: after normalizing the `mode`/`leg`/`run`/`arm`
labels, the per-seed JSONs are byte-identical on 11 seeds, and on
102028 they differ only in the `leg` field stamped on each skip
row. Death causes, both legs (identical): villager combat 333,
expedition 210, combat 88, the wild 22, monster 14, sickness 13,
the arena 6, thirst 5, a wound that wouldn't close 4, starvation
3, the night 2, alien 2, ambush 2, contest 1, dehydration 1,
named-monster causes 3 (The Focus Group, Sunback, Nostalgia).
Villages die fighting, not hungry, on both legs.

### Balanced panel (instrument, not judge)

`scripts/build-gateconfirm-panels-20261116.js` →
`gateconfirm-a-panel.md`: decision **review_required**. Every
paired metric reads delta exactly 0 on 12/12 pairs: table win
rate 0.8333 → 0.8333, national scale access 0.9167 → 0.9167,
village deaths per run 59.0833 → 59.0833, villageDeaths100Days
64.298 → 64.298, community loss 0.1667 → 0.1667. The panel's
review_required is its screen-only default here, not a signal:
with zero deltas on every metric there is no regression and no
improvement to review — the instrument confirms the effect is
exactly zero, and the prereg's threshold is the judge (NO-GO on
launches). No LOUD lines to investigate; the baseline is NOT
rolled (there is no deviation to explain — the legs are the same
trajectories).

### Drift check D3 (`scripts/vetparty-drift-check.js`): CLEAN, NO DIVERGENCE AT ALL

Every seed reads IDENTICAL (firstDivDay=null on all 12), with
first lever days 10–45 on the 8 seeds that have any `v4seeds` row
(102022, 102025, 102029, 102030 have none). No pre-seed drift —
and no post-seed divergence either, because the gate never
engaged. The armed/control difference is zero, lever-caused or
otherwise.

### Proof (`scripts/test-gateconfirm-a.js`): 90/90 green on all three tips

- Armed tip (`GATECONFIRM_GATE=on`, seed call absent): 90/90.
- Control tip (`GATECONFIRM_GATE=off`, seed call absent): 90/90 —
  gate B correctly NOT reached, and the recorder records a
  `profile-gate-veto` skip row for the staged holder.
- Post-restore (bypass back on master, seed call absent): 90/90.
- Live gate fixture: staged non-ranger forager `gen_szx7qu2` at
  Haven with companion `gen_o985i73` — execute NOT reached
  without a commit on either tip; with a `party_launch` commit,
  reached on the armed tip and not on the control tip. D1
  repeatability and D2 wrap neutrality green (60d, seed 102021).
- Deaths-term fixtures: identical legs → delta 0; +20 total /
  scholar +13 → total passes, scholar breaches; +25 total
  breaches; armed-only generic cause (starvation) IS a new mode;
  armed-only named-monster cause (The Eater) is NOT; control-only
  cause is NOT; no control leg → null; per-seed deaths carried.

## Why the gate never engaged — the seed decomposition

The remaining seed sites DO fire (109 `v4seeds` rows per leg), but
almost none of them can open a plan:

| Seed rows per leg | n |
|---|---:|
| wave-3 seed rows | 98 |
| wave-4 seed rows | 11 |
| wave-4, stageAfter=hunt (non-opening) | 10 |
| wave-4, stageAfter=party (opened the instance) | 1 |
| wave-3, stageAfter=hunt / standing (non-opening) | 90 |
| wave-3, stageAfter=party (never opens by definition) | 8 |

100 of 109 seed rows arrive while the holder's plan is already at
hunt stage — the villager met the monster again mid-expedition,
and the seed bounces off a plan that is already out. Only one
wave-4 seed in 12 seeds arrived at party stage and opened a plan.
The four seeds with zero `v4seeds` rows at all (102022, 102025,
102029, 102030) never even met a wave-4 monster in a seeding path.

The one plan that formed belonged to a wanderer, so the profile
gate — the ONLY thing the bypass changes — never applied. The
skip-reason decomposition proves the negative from the other side:
the control leg recorded **zero** `profile-gate-veto` rows in 12
seeds. The bypass's trigger condition (non-ranger holder + today's
`party_launch` commit at a tick) never occurred once.

### The skip-reason decomposition (identical on both legs, modulo the leg label)

| Reason | Control | Armed |
|---|---:|---:|
| profile-gate-veto | **0** | **0** |
| away-on-expedition | 10 | 10 |
| other | 5 | 5 |
| night (all at tick part 3) | 3 | 3 |
| danger-gate | 1 | 1 |
| **Total skip rows** | **19** | **19** |

All 19 rows are seed 102028, all for aki_tanaka's reunion plan.
What they say, in order:

- **The profile gate vetoed nobody.** 0 veto rows on the control
  leg, where the recorder would have caught every one. The gate
  fix's trigger never fired.
- **The 5 `other` rows are explained, and they confirm the
  pilot's recorder gap on real data.** All five (days 65, 76, 81,
  84, 90) have a CLEAN pre-tick snapshot — wanderer, at Haven,
  not night, not engaged, no danger — yet execute was never
  called. The depart rows prove why: on each of those days
  gen_6a0qgib (Dylan) launched with aki_tanaka as COMPANION in
  the same tick (day 65: gen_cv4wm3i launched with Aki as
  companion), before Aki's own roster turn. The pre-tick snapshot
  is stale for them. The pilot found 3 such rows and named the
  fix (`away-as-companion-this-tick`, re-read expedition status
  after the tick); this corpus adds 5 more confirmations of the
  same mechanism. The finding stays open (see below).
- **Part-2 commits die at the night tick** (3 night rows, all at
  tick part 3 — the same shape the pilot found; the part-2
  finding stays open).
- **No bare `selected-not-executed` days.** Every blocked
  commit-day carries a recorded reason or a depart-row blocker
  (0/9) — the day-70 gap from profilegate-a does not recur.

## Sense-testing

Read the fight lines, not just the counts. The one launched party
went out for real — and met nothing:

- Armed = control, seed 102028, day 71 dawn — Aki launches with
  Dylan (gen_6a0qgib) for the Reunion: two depart rows in the same
  dawn (seq 734: Dylan launches his own party with gen_cv4wm3i;
  seq 735: Aki launches with Dylan as companion — one villager,
  two expeditions, same tick; see the double-booking finding
  below). The analyzer counts Aki's as the launch.
- The seed's four wave-4 encounters are all evades, 0 rounds:
  "Aki saw The Reunion in time and gave it room." (day 64, the
  seed fight itself — before the launch) / "Dylan saw The Strike
  in time and gave it room." (day 72) / "Aki saw The Algorithm in
  time and gave it room." (day 75) / "Dylan saw Big Ugly in time
  and gave it room." (day 82). No blows struck in any of them.
- The launched party killed no wave-4 monster: reunion kills 0
  in the final kill log. The seed's three wave-4 kills were all by
  the scholar (gen_pxy62mi, via player): congregation day 74,
  strike + influencer day 92. Like the pilot's Jorge Silva case,
  the party went out and the target had moved on; the expedition
  still resolved as a real trip, not a departure to nowhere — but
  it resolved as evades, not a fight.
- The launch reads like a real party going somewhere real (a named
  target, a companion present, a dawn departure), and then the
  world answered with evasion, not combat. Wave 4 is hard to even
  MEET on this band, let alone kill: 4 encounters in 12 seeds
  reached the fight recorder, all evaded.

## What the village looked like (plain words)

The villages look identical on both legs, because they ARE
identical — the same twelve villages, the same twelve stories,
down to the last death. Ten of twelve win, all twelve reach wave
4, one reaches wave 5 (seed 102032, standing 277), eleven end at
national standing or better, and none sits at the table. They die
mostly fighting — on the road, in expeditions, in village combat —
not hungry (3 starvation deaths in 709). The two that die young
(102026 at day 59, 102027 at day 83) die fighting too. Underneath,
the chain is starved at its first link: in twelve villages, one
person once decided to go back for a wave-4 monster — Aki, a
wanderer, for the Reunion, on day 71 — and the fix that was
supposed to unblock the door never had a door to unblock, because
nobody else ever got as far as forming the plan. The gate works.
Nobody arrives at it.

## Blanks filled / documented

- **Deaths term works and is clean here for the honest reason.**
  The prereg's new term (total ≤ +24, scholar ≤ +12, no new mode)
  passes with delta 0 on every leg of it — because the gate never
  engaged, not because a price was paid. The pilot's watch item
  (its +3.875/run combat-death price) is answered in the only way
  this corpus can answer it: the price follows engagement. Where
  the gate engages, deaths follow; where it doesn't, they don't.
  The panel's zero deltas say the same thing.
- **`other` skip rows confirmed as same-tick companion
  departures, ×5.** The pilot's recorder-gap finding is now
  confirmed on real corpus data with a clean causal chain (depart
  rows prove the companion launch on each of the five days). The
  finding stays open (not re-appended) — the instrument fix
  (`away-as-companion-this-tick`) is still owed.
- **Veteran-death silence persists:** 642 `vetSays` lines across
  both legs, **0** mention a veteran dying. Same silence dawnbid,
  profilegate, and launchdef found. The finding stays open (not
  re-appended).
- **Double-booked companion (NEW, appended to sim-findings.md):**
  gen_6a0qgib launched his own party AND joined aki_tanaka's party
  as companion in the same dawn (day 71, seed 102028) — both
  expeditions recorded as started. One villager, two expeditions,
  same tick. Is that intended, or should launching your own party
  exclude you as someone else's companion that dawn?
- **Part-2 commits die at the night tick** (3 rows, all part 3).
  The finding stays open (not re-appended).
- **The seed-source question is now measured, not just warned
  about.** The pilot warned the fix is "nearly inert" without a
  seed source; this confirm measures it: 11 wave-4 seed calls and
  1 plan in 12 seeds on master-as-is. Appended as a confirmation
  note on finding #2420 (world-tick seed gap).

## Metric review (NOT a re-score — verdict stands NO-GO)

1. **The vacuity clause fired as written.** Total instances
   opened across both legs: 2 (< 4). The verdict is NO-GO under
   the frozen bar, and its meaning is the landing-shape one the
   prereg fixed in advance: the fix as landed is inert on this
   band because plans almost never form without a seed source —
   NOT that the gate fails when plans exist. The pilot proved the
   gate in isolation; this confirm proves the landing shape has
   nothing to work on. No re-scoring was needed: the bar judged
   the corpus as it came.
2. **The deaths term did its job by staying silent.** Total delta
   0, scholar delta 0, no new mode. The term is validated as an
   instrument (the proof fixtures prove each leg of it breaches
   when it should), and its silence here is informative: it rules
   out a hidden deaths price for the landed fix on this band.
   The pilot's +3.875/run price does not reproduce — because the
   pilot's price was the price of engagement, and there was no
   engagement here.
3. **The ≥3-seed bar on 12 seeds is the pilot's absolute bar
   carried over, and it was not the binding constraint in the way
   the prereg feared.** The control leg launched on 1 seed, not
   ≥3, so no "re-read as gate-adds-launches" was triggered — but
   the re-read would have been moot anyway: armed-minus-control is
   0 on every count, not just on seeds.
4. **The panel's review_required with all-zero deltas is a
   screen default, not a signal.** With 12/12 paired deltas of
   exactly 0, there is nothing to review. If the scorecard's
   default ever needs a name for this shape, "no effect" would
   serve better than "review_required" — a panel-builder note,
   not a verdict question.
5. **Ever-national is not derivable from this corpus** (no
   trustWeekly samples) — the prereg's wording over-promised;
   only end-national is reported, both definitions (scaleRank ≥ 2:
   11/12; standing ≥ 200: 1/12). The two definitions diverge
   sharply on this band, as the Loop B finding already records —
   the rank label advances on link/covenant staging, the standing
   total on points. Report both, conflate neither.
6. **The away split is post-hoc, not live — again.** The
   recorder's stage discriminator cannot separate
   away-as-companion from away-on-expedition (the brain mirrors
   the companion's plan to hunt). The 5 `other` rows are resolved
   by joining skip rows to depart rows after the fact. A live
   split still needs the recorder to check other holders' parties
   at tick time (the same fix the `other` finding names).
7. **D3's "first lever day" is the first `v4seeds` day, and four
   seeds have none.** The drift smoke reads those seeds as
   identical trajectories — correct, and visible in the analyzer's
   per-seed seed-call counts rather than hidden.

## Files and commits

- Prereg: `331ce27a6` — `evidence/2026-11-16/sim-gateconfirm-a-prereg.md`
- Instrument: `4d07af076` — `scripts/gateconfirm-driver-20261116.js`,
  `scripts/analyze-gateconfirm-a.js`,
  `scripts/build-gateconfirm-panels-20261116.js`,
  `scripts/test-gateconfirm-a.js`
- Armed corpus: `evidence/2026-11-16/perseed-gateconfirm-a-on/` (12 files)
- Control corpus: `evidence/2026-11-16/perseed-gateconfirm-a-control/` (12 files)
- Control-leg revert (working-tree only, restored): the exact
  inverse of `ed542bba4` — `src/js/villager-agency.js`, 1 insertion,
  18 deletions, restoring `if (prof !== 'wanderer' && prof !== 'explorer') continue;`
- This evidence + `gateconfirm-a-analysis.json` + panel outputs
  (`gateconfirm-a-panel.json`, `.md`, `-before.json.gz`,
  `-after.json.gz`): this commit.
- Logs: `/tmp/gateconfirm-armed.log`, `/tmp/gateconfirm-control.log`
  (ephemeral, not committed).

## Process notes

- The task text cited "commit ed441db06" for the gate fix;
  `ed441db06` is the launchdef-a EVIDENCE commit. The fix is
  `ed542bba4` (= `1b28ad555` post-rebase), 18 insertions, 1
  deletion — corrected in the prereg, not disputed.
- The index-clobber pattern from AGENTS.md struck after the
  prereg and instrument safe-commits — repaired each time with
  `git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info`, verified by `git status` empty on the committed
  paths.
- `check.js --quick` NOT re-run: no `src/` file is changed by
  this arm's commits (the control revert was working-tree only
  and is restored); the instrument is proof-covered 90/90 on
  three tips.
- Telemetry deviation check: REFUSED by shape (recorder rows,
  anchorCommit) — same pattern as 0115Z/1415Z/0315Z/0446Z/0645Z.
  Baseline NOT rolled; no LOUD lines; no investigation item.
  (The panel's all-zero deltas are themselves the deviation
  statement: there is no deviation.)
- Heartbeat kept every ~30 min through the two ~7–10 min legs.
