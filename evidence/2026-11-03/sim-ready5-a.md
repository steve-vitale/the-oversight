# Readiness-5 release re-measurement — Loop A, run fleshout-20261103T2315Z, arm sim-ready5-a

Axis: scale-onramp (standing directive: the scale wall). DIAG-ONLY
arm: zero src/js changes. This arm re-measures, on the CURRENT
anchor (42f0bd49f), whether readiness-5 actually releases — tracker
blank 3 from the 1945Z closeout / blank 5 from round 1819, owed
after the TB-lethality arm and the party arm (wild ally-join fix,
landed). It proposes and makes NO gate/price/deed change.

## Pre-registration (committed before the judged leg)

`evidence/2026-11-03/sim-ready5-a-prereg.md` (commit a48062f19,
with the calibration file). Policy `scripts/policies/competent.js`
`{competent}` VERBATIM (the CURRENT file at this anchor), default
env. Seeds 99101–99108. Horizon 140 days, death-aware. Balanced
panel (§15): INAPPLICABLE — pure diagnostic, no before/after
change; no comparison is fabricated. DIAG-GO bar: all 8 seeds
with a complete per-day bar table; ready-day counts reconciled
against veteran kill events; 0 unclassified release/door events;
0 instrument errors, 0 orphan events. No threshold on reach
counts — this is a diagnostic.

## Calibration gate — DIVERGED, re-baselined (before the prereg)

The unmodified w4convert driver rerun on seed 99107 at this anchor
gave 38 days / village-lost / 0 spawns / 0 TB / 0 field / 0 kills /
maxWave 3, vs 1819's 80 days / 3 spawns / 2 TB / 2 kills / maxWave
4. Cause proven by `git diff`: between anchors, competent.js
gained +237 lines (gap-audit11 leg 1: combat-ability presses in
fights; plus deadfall-duty staffing) and game.js gained gap-batch
items 13/16/17/18, journey-scale r92 peer tending, and equipment
weapon-profile work. The TB arm's calibration at its own anchor
(77ff4a80) still matched 1819 — the move happened after it, in
the gap-batch landings.

RE-BASELINE (binding): 1819's numbers are the PREVIOUS anchor and
are NOT pooled with this arm's numbers and NOT cited as this
arm's baseline. This arm's baseline is its own judged leg below.
Any 1819 comparison here is descriptive, anchor-move-aware, never
a before/after claim.

## Door / release rule, as found in code (not taken on faith)

From `src/js/standing.js` (`villageStandingTotal`,
`waveCombatReadiness`, `standingDeferral`, `standingCfg`) and
`src/js/game.js` (`unlockedWave`), current anchor:

- Standing = war (25 per wave-3+ ledger kill point) + diplomacy
  (34 per seasoned regional+ link) + plenty (20 per major feast).
- Thresholds t4 = 100, t5 = 200. Plenty counts at most 100 toward
  the t5 bar (capped total).
- Readiness-5 demands: armored 4 at armor P >= 15 (armor WORN,
  never pack), armed 6 (weapon equipped or carried), tricks 3
  (counters known), veterans 2 (living roster members with a
  wave-4+ kill in `state.waveKillLog` — verified: entries with
  `e.w >= 4`, distinct `e.by`, living only; scholar always
  counts as living, others via `vpOf` not dead; VETSHAPE OFF by
  default, so dead killers do NOT count).
- Gated-total release to wave 5 requires capped >= 200 AND
  readiness-5 ready. While capped >= 200 but readiness-5 is not
  ready, the gated total holds at t5-1 = 199 (the "199" in 1819
  is the HOLD value, not a threshold to reach — a village at raw
  150 was never near the hold at all; it was standing-short).
  While raw >= 200 but capped < 200, the plenty-cap hold also
  binds at 199. Once released, `_standingPeakWave = 5` ratchets
  the floor at 200 forever.
- `unlockedWave() == 5` additionally requires the wave-3 rung
  (day >= 25 AND wave-2 ledger points >= bar) AND wave-4 faced.
  Peak release alone does not put wave 5 in the pool without
  those two.
- Instrument neutrality: the daily snapshot NEVER calls
  `villageStandingTotal()` or `unlockedWave()` (both record the
  peak and fire beats). Door-open events are observed as the
  ENGINE announces them (release say-lines + peak transitions).
  One end-of-run `unlockedWave()` call is reported separately
  and never counted as a natural door-open; no seed's end call
  moved the peak (endCallMovedPeak false on all 8).

## Judged leg (current anchor only)

Proof `scripts/test-ready5-20261103.js` 10/10 before the leg
(bar math, veteran-to-kill linkage, door-rule classification,
live-harness smoke: gate == recount, capped math,
peak-stable snapshot). Instruments commit 878b9423a.

Per-seed (ready = readiness-5-ready days; best = best capped day;
end bars = final snapshot):

| seed | days | end | scale | maxWave | endUW | ready days | ready4 days | best capped (war/diplo/plenty) | best short | end bars a/ar/t/v |
|------|------|-----|-------|---------|-------|------------|-------------|-------------------------------|------------|-------------------|
| 99101 | 134 | lost | village | 4 | 4 | 0 | 72 | 195 (175/0/20) | armor, weapons, veterans | 0/0/26/1 |
| 99102 | 115 | lost | village | 4 | 4 | 0 | 55 | 225 (125/0/100) | veterans | 1/1/26/0 |
| 99103 | 75 | lost | village | 4 | 4 | 0 | 29 | 125 (125/0/0) | veterans | 0/0/24/0 |
| 99104 | 66 | lost | village | 4 | 4 | 0 | 25 | 125 (125/0/0) | veterans | 0/0/24/0 |
| 99105 | 140 | survived* | village | 4 | 4 | 0 | 52 | 125 (125/0/0) | veterans | 0/0/27/0 |
| 99106 | 78 | lost | village | 4 | 4 | 0 | 31 | 240 (200/0/40) | armor, weapons, veterans | 0/0/30/0 |
| 99107 | 38 | lost | village | 3 | 3 | 0 | 0 | 0 (0/0/0) | armor, tricks, veterans | 5/9/16/0 |
| 99108 | 42 | lost | village | 3 | 3 | 0 | 5 | 25 (25/0/0) | veterans | 0/0/21/0 |

\* 99105 "survived" = alive at the 140-day horizon cap, not a win
and not ready (0 veterans, capped 125 at end).

Pooled: ready days 0 on all 8 seeds. Door opens (peak 5) 0.
Wave-5 faced 0. Wave-4 faced 6/8 (99107/99108 never face wave 4;
peak 4 reached on the same 6). Readiness-4 days total 269
(wave-4 readiness met often; wave-5 never). Wins 0/8, national
0/8, table 0/8 — scaleRank is `village` on every snapshot of
every seed. Median survival 76.5 days (sorted days 38, 42, 66,
75, 78, 115, 134, 140; 99105 censored at the horizon), max 140
(censored). Death causes over 123 person/villager deaths:
"the wild" 60, "monster" 29, sickness 8, ambush 5, "the arena"
4, "a wound that wouldn't close" 3, combat 2, contest 1,
thirst 1, starvation 1, named-monster causes 9.

## The binding finding: veterans never reach 2 — kills are the wall

Total wave-4 kills in the judged leg: 4, one per killing village,
and NO village ever holds 2 living veterans at once:

| killer | seed | kill (day / beast / via) | veteran days | death (day / cause) |
|--------|------|--------------------------|--------------|---------------------|
| visjoin_104 | 99101 | 133 / eater / wild | 134–135 (2 snaps) | 135 / the wild |
| rosa_mendez | 99102 | 65 / congregation / companion | 65–90 (26 days) | 91 / the wild |
| olivia_bennett | 99105 | 105 / algorithm / wild | 106–127 (22 days) | 128 / monster |
| mateo_alvarez | 99106 | 75 / strike / player | 75 (1 snap) | 76 / the wild |

Every killer dies within days of the kill (rosa the longest-lived
at 26 veteran days). Every counted veteran reconciles to exactly
one wave-4+ kill-log entry; every kill event added a log entry
(4/4 entryAdded, 0 deduped); the only killers-not-veterans at end
are these same four dead killers — nothing dropped, nothing
unaccounted. Gate veteran count == instrument recount on every
snapshot (0 mismatch days).

Standing-sufficient days exist and still do not release: 75 days
with capped >= 200 (99102: 51, 99106: 24). On 39 of them the ONLY
short bar is veterans (99102: 32 days, 65–96; 99106: 7 days,
56–62). 99102 is the sharpest case: rosa alive days 65–90 with
gear and standing met (capped 225, armored 6–8, armed 7–10) and
exactly one veteran short of ready for 26 days; she dies day 91
and the village keeps standing 225 with gear met but 0 veterans
through day 94, then gear decays and the village dies day 115.
99106 mirrors it from the other side: gear + standing ready days
56–62 with 0 veterans, then collapse, then mateo's kill day 75
one day before his death and three days before village loss.
99101's kill comes day 133, the day before village loss.

The other bars do NOT bind: tricks demand 3 against maxima of
16–30 (never short once learned); diplomacy is 0 on every seed
(no seasoned regional+ link anywhere — standing here is war +
plenty only, and that is enough to clear 200 on two seeds); the
plenty cap shaves 99102's best raw 245 to capped 225 but capped
still clears 200, so the cap is not the blocker on any seed.
Armor/armed decay with fighter deaths (the 1819 gearbar finding,
unchanged), but on the standing-sufficient days they are met
often enough that veterans is the sole short bar 39 times.

## Answers to the pre-registered questions

(a) How many villages reach readiness-5-ready days on the current
anchor? ZERO — 0 days on 8/8 seeds, vs 5 days on one seed (99107,
days 76–80) at the 1819 anchor. The 1819 ready village no longer
exists on this band: 99107 now dies day 38 before wave 4.

(b) Does readiness-ready lead to release/door-open, and if not,
what blocks it? UNTESTABLE on this anchor — the premise never
arises, because no village is ever ready. What the leg DOES prove
is that the release mechanism is not implicated: the hold works
exactly as designed (see sense-testing: weekly hold beats naming
veterans), the gate math verifies (gate == recount, 0
mismatches), and standing-sufficient villages sit at the hold
without any release anomaly. The blocker is UPSTREAM of release:
villages cannot bank 2 living veterans, because wave-4 kills
total 4 across 8 villages and every killer dies within days.
Release-after-ready remains an open question for an anchor where
ready days actually occur — it must not be cited as tested here,
in either direction.

(c) Funnel now vs 1819 (descriptive, different anchors, never
pooled): ready days 5 → 0; door opens 0 → 0; wave-5 faced 0 → 0;
median survival 90d → 76.5d; villages lost 8/8 → 7/8 lost + 1
survived to horizon; wave-4 kills 2 on 1 seed → 4 on 4 seeds
(wider but still max 1 per village); killer survival 2/2 alive
at end → 0/4 alive at end (killer attrition, vetbar's old
failure mode, is back as a descriptive fact at n = 4, not a
verdict).

## Sense-testing

The hold beats are the sense-test corpus, and they pass: weekly
cadence exactly (99102: days 65, 72, 79, 86, 93, 100, 107, 114),
each naming the true short bar in the village's own terms —
"blood your fighters (1 of 2 veterans)" while rosa lives,
"(0 of 2 veterans)" the week after she dies day 91, then gear
decay named as it happens ("armor the village (2 of 4 fighters
armored); put weapons in hands (2 of 6 armed)"). 99106's holds
tell the same story in miniature (0 veterans days 55–69, then
"1 of 2 veterans" day 76, the day after mateo's kill, naming the
one-veteran state honestly). Nothing robotic flagged; the System
says aloud, weekly, exactly what the bar table says. One
instrument caveat (not a game finding): the captured
`standingLines` sample is noisy — the say-line regex matched
"standing" in pantry lines ("leaves the harvest standing"), so
the raw sample is ~123 lines per seed of which only the
strict-pattern hold/release lines (8 + 4) are the standing
corpus. Hold/release classification used the strict patterns
only and is unaffected; the next run should narrow the capture
regex (see metric review).

Snapshot gaps, proven non-ready: day 3 is missing on all 8 seeds
(systematic harness day-boundary: first snapshot day 2, next day
4 — same pattern family as prior arms) and day 54 is missing on
99106 only. No ready day can hide in either gap: ready requires
2 living veterans, which requires 2 wave-4+ kill events, and kill
events are wrap-captured continuously (not snapshot-dependent) —
there are zero kill events near day 3 on any seed and zero near
day 54 on 99106 (its only kill is day 75), and day 54 is bracketed
by identical day-53/day-55 states (veterans 0, capped 190).
Day 3 is in any case before wave 4 can unlock (wave-3 rung needs
day >= 25), so a wave-4 kill — hence a veteran — is impossible
that early.

## Village assessment (plain words)

Picture eight villages playing competently for up to 140 days.
Seven die; one is still alive at the horizon but no closer to
the fifth draft than the dead ones. Nobody ever stands ready for
wave 5 — not because the village lacks armor, weapons, tricks,
or standing (two villages clear the standing bar for weeks with
full gear), but because the readiness bar demands two living
fighters who have each killed a wave-4 beast, and no village
ever has two at once. Four villagers in the whole band manage
one wave-4 kill each, and all four are dead within days — one
the day after her kill, one the day after his. The village that
comes closest spends nearly a month with one veteran, full gear,
and standing to spare, waiting for a second killer who never
comes, and then watches its veteran die in the wild. The door
is not stuck: it is correctly held, and correctly announced
every week, for a village that has not yet earned the key. The
key is a second living wave-4 killer.

## Metric review (§14 — no in-run re-scoring)

- The prereg's DIAG-GO legs were judged exactly as written; no
  metric moved. Leg 1 (complete per-day table): met modulo the
  two explained gap classes above, both proven non-ready.
  Leg 2 (veteran reconciliation): met — 4/4 kills linked, 0
  veterans without a kill, 0 unaccounted killers. Leg 3 (0
  unclassified release/door events): met vacuously — there
  were 0 peak-to-5 transitions and 0 release lines to classify,
  and the 12 hold lines are all classified. Leg 4 (instrument
  health): met — 0 instrument errors, 0 mismatch days, 0
  orphan/unlinked kill rows across 8 seeds (678 snapshots).
- The calibration-gate rule from 1819 worked exactly as
  intended: it caught a full band move before the judged leg
  and forced an explicit re-baseline instead of a silent
  pooling error. Keep the gate mandatory for band reuse.
- Proposed revision for the NEXT arm's prereg (not applied
  here): narrow the say-line capture regex to hold/release
  patterns only (the "standing" substring floods the sample
  with pantry lines); and pre-register the killer-survival
  window (kill day → death day per killer) as a first-class
  table, since it is now the binding split, not an anecdote.
- The "199" shorthand should be retired from loop reports: 199
  is the hold value the gated total sits at while deferred, not
  a standing target. Reports should quote capped vs 200 and the
  short bars, as this evidence does.

## Verdict — DIAG-GO (current anchor only)

0 instrument errors; 0 mismatch days; 0 unclassified door
events; every veteran reconciled to a kill; proof test 10/10
before the leg. The GO covers the diagnostic on the current
anchor only. It does NOT test release-after-ready (no ready days
occurred) and must not be cited as evidence that release works
or fails — only that nothing upstream of release lets a village
reach it.

## Next blank, precisely (no fix in this run)

The binding link is now WAVE-4 KILLS + KILLER SURVIVAL, not
release, not gear, not standing: 4 kills in 8 villages, max 1
per village, 0/4 killers alive at end. The next arm is a
kill-conversion / killer-survival arm on this anchor (why a
village banks at most one wave-4 kill, and why every killer
dies within days — fight lethality vs post-kill exposure are
separate questions and should stay split). NO gate/price/deed
arm follows from this evidence: standing clears 200 and gear
meets demand on the closest seeds, so lowering a bar would
paper over the kill gap, not measure it. NO release-mechanism
arm either, until an anchor produces ready days to test it
against.

## Proof and landing

- `scripts/test-ready5-20261103.js`: 10/10 (ready-day/run math,
  veteran linkage, door-rule classification, blocked-day splits,
  live-harness smoke) before the judged leg and re-run green
  after the instrument commit.
- Arm commits on branch sim-ready5-a: prereg a48062f19
  (with calibration JSON), instruments 878b9423a (zero src/js).
  This evidence file + the 8 per-seed JSONs
  (`perseed-ready5-a/`) commit on the same branch, pending
  coordinator merge --ff-only, pending ship (the ship loop owns
  version bumps, pushes, live verification).
- check.js --quick NOT re-run in full: zero src/js changed,
  same standing caveat as prior tooling-only landings; the
  arm's own proof (10/10) was run before the judged leg and
  after the instrument commit.
- Safe-commit index clobber hit both worker commits (repaired
  via HEAD-blob cacheinfo each time, commits verified correct;
  no clobber on coordinator work — this arm's commits only).
- Telemetry deviation check: not run by this arm (the
  coordinator runs it after evidence; baseline NOT rolled on a
  refusal, per prior runs). Note for the coordinator: the
  scale-wall baseline WILL deviate on this band (wins 0,
  national 0, survival down vs 1819) — the deviation is the
  anchor move documented above (competent policy + gap-batch
  landings), not an instrument artifact; the calibration
  control is the evidence.
- Heartbeats: worktree heartbeated per the coordinator's
  addition (registry `sim-ready5-a` alive through the run).
