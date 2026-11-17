# sim-part2target-a — where part-2 commits carry targets (DIAG, GO)

**Arm:** sim-part2target-a · **Loop A run:** fleshout-20261117T1535Z (worker) /
fleshout-20261117T1820Z (adoption) · **Axis:** scale-onramp
**Type:** DIAG, instrument-only. No game-code change, no default flipped, no lever built.
**Branch:** `sim-part2target-a` · **Base at arm start:** master `0668af726`
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
**Band:** seeds 103421–103428 (8 seeds) · **Horizon:** 150d death-aware
**Prereg:** `evidence/2026-11-17/sim-part2target-a-prereg.md` (frozen before any judged sim;
leg-(c) addendum appended by the worker ~17:30Z after leg (b) was analyzed)

## Adoption note (coordinator, run fleshout-20261117T1820Z)

The 1535Z run died with this arm stranded: prereg + instrument committed
(`8d800c71e`, `142d70d83`), leg (b) corpus 8/8 + `part2target-a-analysis.json`
written but uncommitted, recorder-OFF leg 6/8 (seeds 103427–103428 missing),
no panel, no evidence file. The worker subagent was cancelled before it
finished; its tree heartbeat was 49 min stale at the guard and its last
write 44 min old — dead by the 15-min guard. This adoption VERIFIED, not
re-ran:

- **Proof re-run:** `node scripts/test-part2target-a.js` → **111/111 green**
  on the instrument tip (D1 repeatability + D2 wrap neutrality included).
- **Analyzer re-run:** `node scripts/analyze-part2target-a.js` reproduces
  `part2target-a-analysis.json` **byte-identical**.
- **OFF-leg fill:** the 2 missing recorder-OFF seeds (103427, 103428) run by
  the adoption with `PART2TARGET_RECORDER=off` (exit 0; both survived;
  recorder arrays all 0, errors 0). The OFF leg is a neutrality leg, not a
  judged leg — filling it completes the worker's frozen panel design.
- **Panel built:** `scripts/build-part2target-panels-20261117.js` → OFF→ON
  compare, every observed metric delta exactly 0 (see Panel).
- **Dawn-launch check:** the addendum's "1/7 launched at dawn in reality"
  verified directly from the corpus (somchai_prasert d51 → dawn d52
  `party_launch`, same target chorus_line; the other 6: 1 held at dawn,
  4 no dawn depart row — see Fates).
- **Sense check:** the adoption's read of the corpus (the worker wrote none)
  — the one target-carrying launch left no fight record and no voice line;
  the only spool line on the seed is an unrelated day-54 veteran-kill call.

Nothing in the worker's numbers was re-judged. The verdict below is the
worker's frozen-bar verdict, verified by the adoption.

## The question (part2night's named next blank)

sim-part2night-a found all six part-2 commits on band 103411–103418 were
TARGETLESS — no named beast — so the hold-to-dawn counterfactual's "same
target" condition never bit, and the named-beast hold case was unmeasured.
This arm answers WHERE part-2 commits carry targets: survey part-2 commits
across bands and horizons, classify each as target-carrying vs targetless,
and for the target-carrying ones record the night-tick fate and how often a
target survives to a dawn launch.

## Verdict: DIAG-GO

All four frozen bars pass (`part2target-a-analysis.json`):

| Bar | Result |
| --- | --- |
| 1. Classification completeness | PASS — 80/80 part-2 commits classified, 0 UNCLASSIFIED; target presence recorded on 100% |
| 2. Instrument valid | PASS — 0 instrument errors, 8/8 files parse, 0 orphan skip rows, proof 111/111, D1 identical, D2 identical, OFF-vs-recorder panel compare shows identical trajectories |
| 3. Counterfactual computed | PASS — every target-carrying died-at-night-veto commit carries a dawn follow-up snapshot with target-validity fields; 0 missing |
| 4. Subject formed (viability floor ≥1 commit) | PASS — 80 part-2 commits observed |
| 5. Balanced panel (§15) | DONE — `part2target-a-panel.{json,md}` + before/after `.json.gz`, OFF→ON compare; every observed metric delta exactly 0 (see Panel) |

## The answer, in plain words

**Target-carrying part-2 commits exist on pure master — one in ten, and
only ever wave 3.** On a fresh band with no seed call and no lever, 8 of 80
mid-day party-launch commits named a beast (chorus_line ×2, focus_group ×3,
spool ×2, redactor ×1). The night still kills nearly all of them: 7 of the 8
died at the night veto, and the target was still valid at dawn in all 7
cases — the beast was still the plan's beast the next morning — yet none of
the 7 would have launched even with the veto lifted. The hold-to-dawn
counterfactual now bites for real (the same-target condition is no longer
vacuous), and it answers: the night veto is not what stops these launches.
The one target-carrying commit that did launch went the same day
(gen_19a280j, seed 103428, day 63, spool, with companion gen_4mx09gq).

## The survey (leg (b), fresh band 103421–103428, pure master)

### Target share

| | n |
| --- | ---: |
| Part-2 commits | 80 |
| Target-carrying | **8 (10%)** |
| Targetless | 72 (90%) |
| By wave | wave 3: 8; wave 4: 0; wave 5: 0 |
| By stage | party 24, hunt 53, standing 3 |
| Target kinds | chorus_line 2, focus_group 3, spool 2, redactor 1 |
| Superseded bids (counted separately) | 36, of which 4 with a target |

No wave-4+ part-2 commit exists on this band (wave4counts all zero). The
target population is wave-3 only — plans are born wave-3 (see part2night /
nightcarry-resume), and nothing on pure master promotes a part-2 commit to
a wave-4 target.

### Classification (all 80 commits)

| Class | n |
| --- | ---: |
| executed-launched | 10 |
| executed-held | 0 |
| died-at-night-veto | 67 |
| died-at-night-other | 3 |
| overwritten-before-night | 0 |
| plan-churned-before-night | 0 |
| holder-died-before-night | 0 |
| run-ended | 0 |
| UNCLASSIFIED | **0** |

### Target fates (the 8 target-carrying commits)

| Seed | Holder | Day | Target | Stage | Fate | Dawn target valid | Counterfactual |
| --- | --- | ---: | --- | --- | --- | ---: | --- |
| 103423 | somchai_prasert | 45 | chorus_line | party | died-at-night-veto | yes | would-not-launch |
| 103423 | somchai_prasert | 51 | chorus_line | standing | died-at-night-veto | yes | would-not-launch |
| 103424 | maya_singh | 92 | focus_group | hunt | died-at-night-veto | yes | would-not-launch |
| 103424 | maya_singh | 98 | focus_group | standing | died-at-night-veto | yes | would-not-launch |
| 103424 | maya_singh | 99 | focus_group | standing | died-at-night-veto | yes | would-not-launch |
| 103428 | gen_19a280j | 63 | spool | party | **executed-launched** | — | — |
| 103428 | gen_19a280j | 80 | spool | party | died-at-night-veto | yes | would-not-launch |
| 103428 | leo_martin | 80 | redactor | party | died-at-night-veto | yes | would-not-launch |

All 7 target-carrying night-veto deaths keep their target valid at dawn
(7/7 target same, stage same, party intact per the dawn snapshot) and all
7 are would-not-launch under the frozen counterfactual. The dawn reality
check (adoption, from the corpus): 1 of the 7 launched at dawn in reality
via a fresh commit (somchai_prasert d51 → d52 `party_launch`, same target
chorus_line); 1 held at dawn (d45 → d46 `party_wait`, same target); 4 have
no dawn depart row at all.

### Counterfactual (all 80 commits)

would-have-launched **0**, launched-anyway 2, would-not-launch 65,
no-next-dawn 0, missing-dawn 0. (65 + 2 = the 67 died-at-night-veto
commits.) The dawn-failure reasons behind the 65 would-not-launch
(tallies exceed 65 — several failures per commit): plan-stage 52,
indoor-objective 47, danger-gate 13, companion-not-at-haven 9,
holder-not-at-haven 6, holder-away 6, holder-block 1, companion-away 1.
The binding failures are stage and indoor-objective, not the target: the
plan is no longer at `party` stage by dawn, or the holder's objective was
rewritten to an indoor Haven chore overnight (the trick-wait shape).

### Holder state at night death (all 80)

At Haven 67, away 13; sick 0, engaged 0, medic-duty 0, launch-block 1.
Skip reasons: night 67, away-on-expedition 13. Part-3 commit days: 57.

## Leg (a) — re-read (from the prereg, computed before the arm ran)

| Corpus (band, policy, game) | Part-2 commits | Target-carrying |
|---|---:|---:|
| part2night-a (103411–103418, competent, pure master) | 6 | 0 |
| launchfunnel-a OFF (same band, competent, pure master) | 6 | 0 — identical commits, second recorder |
| launchfunnel-a VRE (same band, competent, VETREENGAGE=1) | 20 | 10 |
| launchdef-a control (102011–102018, tableseat-nowait, seed ON) | 59 | 17 |
| launchdef-a ON (same band/policy, seed ON + gate bypass) | 62 | 21 |

Night-tick fates of target-carrying commits in the re-read corpora: VRE
2 died at the night veto (both wave-4 eulogy), 1 held at depart, 7
unresolved (all wave-3, no skip rows in that corpus); launchdef control
7 veto, 1 depart-row `normal`, 9 unresolved; launchdef-on 8 veto,
**1 LAUNCHED** (stan_kowalski d55 redactor, wave 3 — the only
target-carrying part-2 launch in any re-read corpus), 1 `normal`, 11
unresolved. No target-carrying commit in any re-read corpus has a dawn
follow-up snapshot — target validity at dawn was unmeasured everywhere
before this arm's leg (b).

## Leg (c) — NOT run (worker's addendum, in the prereg)

The trigger was "(a)+(b) are targetless on pure master". It did not fire:
leg (b) found the population (8/80, 10%), its fates classified, the
counterfactual computed for every target-carrying night death. A 200d
re-run or a second band (103431–103438) would add commits but cannot
change the verdict shape. The seed-enabled option (re-landing the vetparty
seed call on the fresh band to measure the target-carrying share with the
seed on) is likewise not run here — a follow-up arm's job; the open
question (how much of the 10% is seed-suppressed vs naturally occurring)
goes to the backlog.

## Per-seed table (leg (b))

| Seed | End | Days | Standing | Rank | Wave | Commits | Target | Launched | Veto | Other | Deaths | Starv. |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 103421 | survived | 151 | 199 | regional | 4 | 16 | 0 | 3 | 11 | 2 | 79 | 0 |
| 103422 | survived | 151 | 520 | regional | 5 | 0 | 0 | 0 | 0 | 0 | 75 | 1 |
| 103423 | survived | 151 | 199 | regional | 4 | 16 | 2 | 1 | 15 | 0 | 96 | 0 |
| 103424 | village-lost | 134 | 575 | regional | 5 | 22 | 3 | 3 | 19 | 0 | 133 | 2 |
| 103425 | survived | 150 | 490 | regional | 5 | 10 | 0 | 2 | 8 | 0 | 129 | 0 |
| 103426 | village-lost | 128 | 345 | regional | 5 | 3 | 0 | 0 | 3 | 0 | 87 | 1 |
| 103427 | survived | 151 | 199 | regional | 4 | 3 | 0 | 0 | 3 | 0 | 101 | 0 |
| 103428 | survived | 151 | 370 | regional | 5 | 10 | 3 | 1 | 8 | 1 | 99 | 1 |

Seed 103422 is the thin pole: 0 part-2 commits in 151 days at standing 520
and wave 5 — a village that reaches the top of the ladder without ever
making a mid-day launch commitment. Seed 103424 is the thick pole: 22
commits, 3 target-carrying, and the village still lost on day 134.

## Wall numbers (leg (b), both national definitions)

| | ON leg (recorder) |
| --- | ---: |
| Wins | 0/8 |
| National by standing ≥ 200 | 5/8 |
| National by scaleRank ≥ 2 | 0/8 |
| Table seats | 0/8 |
| Wave 4 unlocked | 8/8 |
| Wave 5 unlocked | 5/8 |
| Median survival | 151d |
| Total deaths | 799 |
| Starvation deaths | 5 |
| Scholar deaths | 73 |

## Balanced panel (§15) — OFF→ON recorder compare

`scripts/balance-panel.js compare` on the OFF→ON panels; overall decision
**review_required** (the tool's default when metrics are unobserved /
descriptive). **Every observed metric is exactly 0 delta on all 8 paired
seeds** — wins 0→0, national 0→0, survival-60 1→1, survival-30 1→1,
village deaths 99.875→99.875, deaths/100d 68.9045→68.9045, community loss
0.25→0.25 — each with status `no_material_signal`. The recorder moves
nothing; the overall `review_required` is the panel tool's framing for the
unobserved metrics, not a signal (poolshape's and launchfunnel's panels
carried the same overall decision). The panel is the instrument, NOT the
judge (the frozen bars above are).

## Sense-testing (SENSE-TESTING LAW; adoption's read)

The one target-carrying part-2 launch on the band (gen_19a280j, seed
103428, day 63, spool, companion gen_4mx09gq, both exped true, stage
hunt) is recorded at the depart layer only: no fight row for the pair in
the day 60–75 window, no voice line for the departure, no line naming the
spool as their quarry. The only spool line on the seed is day 54, an
unrelated veteran-kill call: "SYSTEM: Oh — OH. Everybody saw that, right?
Maree just put down Spool... on CAMERA. That's a veteran kill, folks.
REMEMBER the name." The launch that the whole hold-to-dawn question turns
on happens in silence, exactly as the "departures are silent" finding
already recorded — the fiction voices the kill, never the setting-out.
The night deaths are likewise silent: 67 commits die at the night tick
with no line saying the party waited too long.

## Metric review

- The frozen bars judged the survey as designed; no re-scoring. A 0/x
  target share on pure master would have been a GO measurement; the
  measured share is 8/80, so the question is answered with a population,
  not a zero.
- The viability floor (≥1 commit) passed easily at 80 commits, but the
  population is thin per seed (0 on 103422, 3 on 103426/103427) — a
  follow-up that wants per-seed target fates needs a wider band, not a
  re-run of this one.
- The counterfactual's "same target" condition now bites for real on 7
  commits and fails on none of them (7/7 valid at dawn) — the veto is not
  what stops these launches; stage churn and indoor-objective rewrites
  are. That re-points the hold question at the dawn scorer, not the night
  tick.
- Wave-4+ part-2 commits: 0 on this band. Any hold-to-dawn lever judged
  on wave-4 targets still has no population on pure master; the
  seed-enabled re-measurement is the way to get one.
- Finding #2425 stays open (this arm measures the population the hold
  question needs; it does not close the night-veto finding). The
  seed-suppressed-vs-natural question is a new backlog item (see Findings).

## Findings (for the coordinator to append — this arm appends nothing itself)

- **Target-carrying part-2 commits exist on pure master (8/80, 10%, all
  wave 3):** the named-beast hold case is now measured — 7/7 targets still
  valid at dawn, 7/7 would-not-launch, 1 same-day launch. The night veto
  is not the binding constraint on these commits; stage churn (52) and
  indoor-objective rewrites (47) are.
- **Seed-suppressed vs natural (open):** the 10% on pure master vs 50%
  under VETREENGAGE=1 and 29–34% under the vetparty seed call — how much
  of the gap is the seed suppressing the target population vs the seed
  creating it? Needs the seed-enabled re-measurement on the fresh band
  (follow-up arm, per the prereg).

## Instrument

- `scripts/part2target-driver-20261117.js` — thin CLI over the nightcarry
  instrument (same T-class + wave-4 per-encounter recorder + dawnbid
  capture; new `part2targetSkips` any-wave skip layer,
  `part2targetDawns` dawn follow-up snapshots, `part2targetCensus`
  end-of-day plan census; widened `dawnbidScores`/`dawnbidDeparts` to
  any wave / any win-plan action). `MODE=diag`, `PART2TARGET_RECORDER=off`
  skip-switch; refuses to overwrite an existing per-seed file.
- `scripts/analyze-part2target-a.js` — classification (part2night's
  `classifyCommit` / `part2Commits` / `evaluateCounterfactual` reused
  verbatim), target-share table, target-fate table, dawn target-validity
  table, wall numbers.
- `scripts/build-part2target-panels-20261117.js` — §15 panel builder
  (OFF→ON compare on the fresh band).
- `scripts/test-part2target-a.js` — proof, **111/111 green** (adoption
  re-run on the instrument tip; D1/D2 live legs included).
- `src/` diff: 0 lines (DIAG, recorder wraps only).
- Leg (c) addendum: 39 lines appended to the prereg by the worker after
  leg (b) was analyzed, before any leg (c) run — the only uncommitted
  change to a committed file at adoption.

## Files

- Prereg: `evidence/2026-11-17/sim-part2target-a-prereg.md` (incl. leg-(c)
  addendum)
- Instrument: `scripts/part2target-driver-20261117.js`,
  `scripts/analyze-part2target-a.js`,
  `scripts/build-part2target-panels-20261117.js`,
  `scripts/test-part2target-a.js`
- Corpora: `evidence/2026-11-17/perseed-part2target-a/` (8 files),
  `perseed-part2target-a-off/` (8 files; 6 worker + 2 adoption fill)
- Analysis: `evidence/2026-11-17/part2target-a-analysis.json`
- Panel: `evidence/2026-11-17/part2target-a-panel.{json,md}` (+ before/after `.json.gz`)
- This evidence file: `evidence/2026-11-17/sim-part2target-a.md`
