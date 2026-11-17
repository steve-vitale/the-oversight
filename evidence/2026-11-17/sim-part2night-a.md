# sim-part2night-a — part-2 commits dying at the night tick (DIAG, GO)

**Arm:** sim-part2night-a · **Loop A run:** fleshout-20261117T1215Z (adopted by run
fleshout-20261117T1415Z after the 1215Z coordinator died) · **Axis:** scale-onramp
**Type:** DIAG, instrument-only. No game-code change, no default flipped, no lever built.
**Branch:** `sim-part2night-a` · **Base at arm start:** master `f9b33757a`
**Policy:** competent verbatim (`scripts/policies/competent.js`),
sha256 `df9b7dff4de498779655b04db29782023840d8b2a4ed19a0ecbe86db9c71438c`
**Band:** seeds 103411–103418 (8 seeds) · **Horizon:** 150d death-aware
**Prereg:** `evidence/2026-11-17/sim-part2night-a-prereg.md` (frozen before any judged sim)
**Claim:** sim-findings.md #2425 (PART-2 COMMITS DIE AT THE NIGHT TICK — quantified here;
the design question stays Steve's; this DIAG closes nothing).

## The question, in plain words

A villager commits mid-day (part 2) to lead a party out after a beast. The next
tick is night (part 3), and the night veto stops the departure before it starts —
so the commit dies overnight, silently, and the next dawn's refresh writes a fresh
lottery pick over it. The launchdef pilot counted 25 such night deaths (all at tick
part 3) and zero part-2 launches. This DIAG measures the loss: how many part-2
commits die at the night tick, how many of those were actually killed BY the night
veto, and how many would have launched at the next dawn if the commit had been held
overnight. The design question — hold a part-2 commit to the next dawn, or is part-1
the only real mid-day channel? — is Steve's; this arm supplies the numbers for it,
and changes nothing in the game.

## Verdict: GO

All four frozen bars pass; the analyzer's verdict is `go: true`
(`evidence/2026-11-17/part2night-a-analysis.json`, re-run by the adoption and
reproduced byte-identical).

| Bar | Result |
| --- | --- |
| 1. Completeness | PASS — every part-2 commit classified, 0 `UNCLASSIFIED` |
| 2. Instrument valid | PASS — 0 instrument errors, 8/8 files parse, 0 orphan skip rows, proof test green (93/93 on re-run, incl. the new analyzer regression legs), D1 identical, D2 identical |
| 3. Counterfactual computed | PASS — every `died-at-night-veto` commit carries a dawn follow-up snapshot, 0 missing |
| 4. Subject formed (viability floor) | PASS — 6 part-2 commits AND 6 `died-at-night-veto` commits observed (floor: ≥1 each) |

A DIAG has no NO-GO: a zero-loss result is still a GO quantification — and that
is what this band says.

## The numbers: the night veto costs ~0 launches

6 part-2 commits in 8 villages × 150 days. All 6 died at the night tick.
**0 executed (0 launched, 0 held), 0 overwritten, 0 plan-churned, 0
holder-died, 0 run-ended, 0 UNCLASSIFIED.** The wave-4+ subset is empty: **0
wave-4 commits** — every part-2 commit on this band was an any-wave commit,
none aimed at a wave-4+ beast.

Counterfactual (frozen: would the commit have launched at the first dawn tick
of the next day if it had survived the night?):

| | Count |
| --- | --- |
| would-have-launched | **0 / 6** |
| would-not-launch | 6 / 6 |
| no-next-dawn (run ended) | 0 |

Dawn-condition failures (a commit can fail several): plan-stage 4, holder
not-at-Haven 3, holder away 3, companion away 1, companion not-at-Haven 1,
indoor-objective 1.

The six commits:

| Seed | Holder | Day | Plan stage | Target | Dawn after | What the dawn actually did |
| --- | --- | --- | --- | --- | --- | --- |
| 103414 | gen_k8xfk0x | 49 | hunt | — (null) | d50 | fresh commit re-picked a launch; sam_wilson launched at dawn d50 with gen_k8xfk0x |
| 103414 | sam_wilson | 49 | hunt | — (null) | d50 | **launched at dawn in reality** (with gen_k8xfk0x) — the night death cost nothing |
| 103414 | gen_k8xfk0x | 53 | hunt | — (null) | d54 | **launched at dawn in reality** (with sam_wilson) |
| 103414 | sam_wilson | 53 | hunt | — (null) | d54 | fresh commit re-picked a launch; gen_k8xfk0x launched at dawn d54 with sam_wilson |
| 103415 | catalina_reyes | 51 | party | — (null) | d52 | holder away at dawn; fresh part-2 commit the same day (a normal depart, not a launch) |
| 103415 | catalina_reyes | 52 | party | — (null) | d53 | holder away at dawn; dawn held her on a fresh `party_wait` |

Two of the six night deaths (sam_wilson d49, gen_k8xfk0x d53) were **fully
recovered by the next dawn's fresh pick** — the same pair launched with each
other the next morning anyway. The veto cost them a night, not a launch.

## The targetless shape (the finding inside the quantification)

**All 6 night-veto commits carry `target: null`.** No part-2 commit on this
band aimed at a named beast — the plans were at `hunt` stage (4) or `party`
stage (2) with no target attached. That bounds what the counterfactual means:
the frozen "same target" condition is vacuous when there is no target, and the
hold-to-dawn question as Steve would ask it — hold a commit to go kill a
NAMED beast — is unmeasured by this band, because no part-2 commit carried
one. The plan-stage failure mode is the same story from the other side: by
dawn the plan had moved to `hunt` stage on 4 of the 6, so a held `party`-stage
commit would not have matched the plan's stage anyway.

The population is also thin and concentrated: 6 commits on 2 seeds only;
6 of 8 seeds had zero part-2 commits in 150 days. Superseded bids (a later
score row overwriting the commit before any tick) number 12 band-wide. Part-3
commits (written after the day's last tick): 0 days.

## Per-seed table

| Seed | Days | End | Standing | Max wave | Part-2 commits | Night-veto deaths | Executed |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 103411 | 69 | village-lost | 175 | 4 | 0 | 0 | 0 |
| 103412 | 49 | village-lost | 50 | 3 | 0 | 0 | 0 |
| 103413 | 150 | survived | 199 | 4 | 0 | 0 | 0 |
| 103414 | 150 | survived | 150 | 4 | 4 | 4 | 0 |
| 103415 | 150 | survived | 199 | 4 | 2 | 2 | 0 |
| 103416 | 150 | survived | 199 | 4 | 0 | 0 | 0 |
| 103417 | 150 | survived | 199 | 4 | 0 | 0 | 0 |
| 103418 | 150 | survived | 300 | 5 | 0 | 0 | 0 |

## Wall numbers (both national definitions)

Wins 0/8, national by standing ≥ 200: 1/8, national by scaleRank ≥ 2: 0/8,
table 0/8, wave 4 unlocked 7/8, wave 5 unlocked 1/8, median survival 151d,
total deaths 460, starvation 3, scholar deaths 43.

Cross-check: this wall is **identical in every number to the sibling arm
sim-launchfunnel-a's OFF leg** (same band, same policy, pure master, different
recorder) — deaths 460, starvation 3, survivals [48, 69, 151, 151, 151, 151,
151, 152]. Two pure-read recorders on the same villages produce identical
trajectories.

## Balanced panel (§15) — single-leg self-compare

`scripts/build-part2night-panels-20261117.js` builds the §15 panel from the
corpus and self-compares (before = after = this corpus): degenerate BY DESIGN.
All paired deltas are 0; the scorecard decision reads `review_required`
(win rate is `descriptive` at 0/0 — no material signal exists to review, and
none is claimed). The cross-instrument compare against the sibling
launchfunnel corpus was NOT run: the sibling corpus lives in the
launchfunnel worktree and was not visible to this builder at panel time
(the panel builder looks for it under this worktree's evidence dir). The
wall-equality check above — identical trajectories across the two recorders —
is the same neutrality statement, made by hand.

## Sense-testing (SENSE-TESTING LAW)

The dawn launches nearest each night death are sam_wilson at dawn d50 and
gen_k8xfk0x at dawn d54 (seed 103414, the pair re-launching each other). No
`vetSays` line on the band mentions Sam, Catalina, or either departure — the
depart rows exist in the instrument, but the village never says anybody left.
That matches the standing finding that departures are silent (returns are
voiced richly, departures never). The night deaths themselves are likewise
silent: nothing in the transcript marks a commit dying overnight. A player
watching this village would see a pair walk out on two consecutive mornings
and never be told why, or that the previous afternoon's plan had died
unvoiced at nightfall.

## Metric review

- The frozen bars judged the DIAG as designed; no re-scoring. The viability
  floor (≥1 commit AND ≥1 night-veto death) passed, but the population is
  thin (6 commits, 2 seeds) — the zero is a small-n zero, and the evidence
  says so rather than dressing it as a tight bound.
- **Prereg miss, recorded not hidden:** the prereg's counterfactual assumes
  a commit with a target ("same target" as a dawn condition). All 6 commits
  are targetless, so that condition never bit. A future hold-to-dawn
  measurement needs a band where part-2 commits carry targets — on this
  band, the mechanism (part-2 → night veto → fresh dawn pick) is measured,
  but the named-beast case is not.
- The `plan-stage:hunt` dawn failure (4/6) is a second shape the prereg did
  not anticipate as the modal failure: the plan moves on by dawn, so holding
  the commit would mean holding a stale stage as well as a stale night.
- The analyzer `_raw` crash (fixed during the run, see Adoption note) was a
  real instrument bug: `main()` crashed reading `bySeed[SEEDS[0]]._raw`
  after the `_raw` attachment was removed. The fix reads `policySha` /
  `anchorCommit` from the first raw per-seed file; the regression test
  (§2c) pins it.

## Adoption note (run fleshout-20261117T1415Z)

The 1215Z coordinator died after the worker had run the sweep, hit and fixed
the analyzer `_raw` crash, added the §2c regression test, and re-run the
analyzer (last write 14:27Z) — but before committing the fix or writing this
evidence file. Adoption verified, not re-ran, the judged numbers: proof test
re-run **93/93 green** on the worktree tip (89 original + 4 new regression
legs); analyzer re-run with the fixed code reproduces
`part2night-a-analysis.json` byte-identical; the panel files are the worker's
own (self-compare, all deltas 0). No corpus file was overwritten; no number
in this file differs from the worker's analysis. The analyzer fix + regression
test commit with this evidence under `scripts/safe-commit.sh`.

## Findings (appended to `hidden_files/sim-findings.md`)

- Finding #2425 UPDATED (not closed): part-2 commits die at the night tick,
  quantified — 6/6 in 8×150d on pure master, 0 would-have-launched, 2/6
  recovered by the next dawn's fresh pick anyway. The hold-to-dawn design
  question stays Steve's, but the numbers say a hold buys ~0 launches on
  this band — with the caveat that all six commits were targetless, so the
  named-beast case is still unmeasured.
- All 6 night-veto commits are targetless (`target: null`) with plans at
  hunt/party stage. If part-2 commits are normally targetless, the "hold"
  lever would hold a directionless commit — the next measurement needs a
  band where part-2 commits carry targets before the hold is judged.
- Departures stay silent: the two real dawn launches nearest the night
  deaths have no voiced line anywhere on the band.

## Next blanks (in order)

1. A target-carrying part-2 population: re-run the night-veto census on a
   band where part-2 commits carry targets (seed-enabled, or a later
   horizon) before any hold-to-dawn lever is judged.
2. The `plan-stage:hunt` dawn failure: is a plan's move to `hunt` by dawn
   the normal lifecycle, or does the night veto itself push it there?
3. The silent-departure finding (already open elsewhere) covers the
   voicing gap; no new arm needed for it here.
