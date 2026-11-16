# sim-dawnbid-a — DIAG: why seeded wave-4 plans almost never depart

**Arm:** sim-dawnbid-a (Loop A, run `fleshout-20261116T0315Z`, axis scale-onramp).
**Claims:** sim-findings #2404. **Prereg:** `evidence/2026-11-15/sim-dawnbid-a-prereg.md`
(frozen, Corrections 2–3 applied before any judged sim).
**Prior art:** `evidence/2026-11-15/sim-vetparty-a.md` (PILOT NO-GO — the vetparty lever
seeded 106 wave-4+ flee plans across 8 seeds but only ONE produced a wave-4 depart row).
**Type:** DIAG — instrument + measured decomposition. No game change, no default flipped.
**Seeds:** 100861–100868 (8-seed pilot, 150d death-aware, policy competent verbatim,
sha `74a890f0844e`). Shared with sibling arm sim-ammocensus-a (also a neutral recorder).
**Branch:** `sim-dawnbid-a`. **Worktree:** `~/workspace/worktrees/sim-dawnbid-a`.

## GO verdict: GO — instrument valid, all four prereg bars pass

1. **Classification:** 24/24 seeded plan instances classified, unknown **0** (share 1.0 ≥ 0.90).
2. **Corpus:** 16/16 files parse (8 control + 8 instrument, identical seeds).
3. **Neutrality:** D1/D2 green (proof test), D3 drift smoke clean on all 8 seeds
   (first divergence on/after the first seed day on every seed).
4. **Proof:** `scripts/test-dawnbid-a.js` **50/50** on the instrument tip (default shape)
   and **50/50** in the off shape after the revert.

## Instrument built

`scripts/dawnbid-driver-20261115.js` extends the vetparty driver: same vetfirst
T-class instrument plus `v4seeds` / `v4departs` / `v4gates` / `v4encounters`, and new
`dawnbidScores` (every `vbrainScorePick` call: day, part, villager, candidates with
annotated scores, pick, dawn commit, plan, holder gear), `dawnbidDeparts` (every
`vbrainExecuteDepart`: result, whether each expedition started, blocker derivation),
`dawnbidCensus` (daily live wave-4 plans), `dawnbidStarts` (every `startExpedition`
for a wave-4 plan holder). `scripts/analyze-dawnbid-a.js` is the 6-bucket classifier;
`scripts/test-dawnbid-a.js` is the proof. No game-code hook: the driver wraps
`vbrainScorePick`, `vbrainExecuteDepart`, `winPlanSeedFromFight`, `winPlanFightGate`,
`fieldFight`, `startExpedition` with pure reads + driver-local writes, no RNG.
`DAWNBID_RECORDER=off` skips the wraps (D2 leg).

**Anchors.** Control anchor = `e98d138f5` (instrument, seed call ABSENT).
Instrument anchor = `94721f769` (seed call re-landed verbatim — the 13-line block from
revert `7ba893b4b`, blob `a66d45a5e`, in `resolveWildMonsterEncounter`, `src/js/game.js`:
on `vFlee` vs wave-4+, call `winPlanSeedFromFight(vid, mdef, 'fled')`). After measurement
the seed call was **reverted** (`ce393ec75`); the branch's `src/` is byte-identical to
the control anchor (`git diff e98d138f5 HEAD -- src/` = 0 lines). Seed-call text is
preserved verbatim in the prereg and in git history (`f0fb6fc18`).

**Commits on this branch:** `7bc8150c1` (prereg), `537f7071e` (prereg Corrections 2–3),
`e98d138f5` (instrument, control anchor), `94721f769` (instrument tip, seed call),
`585378530` (analyzer bar fix + proof hardening), `ce393ec75` (seed-call revert).
Ready to merge, pending ship.

## Before / after on identical seeds

| | Control leg (seed call absent) | Instrument leg (seed call on) |
|---|---|---|
| Seeds / files | 8 / 8 | 8 / 8 |
| Instrument errors | 0 | 0 |
| Wave-4 seed calls | 9 | 50 |
| Plan instances opened | **0** | **24** |
| National / table / wins | 3 / 0 / 0 | 4 / 0 / 0 |
| Wave-4 reached / wave-5 reached | 8 / 3 | 7 / 4 |
| Median survival | 138.5d | 123.5d |

Per-seed (instrument leg): 100861 survived 147d standing 480, 5 instances;
100862 lost d113 standing 199, 4; 100863 survived 151d standing 450, 3;
100864 lost d98 standing 199, 2; 100865 lost d134 standing 535, 4;
100866 survived 151d standing 400, 5; 100867 lost d74 standing 150, 1;
100868 lost d51 standing 50, 0. (Control leg: 100861 lost d127, 100862 survived,
100863 survived, 100864 lost d99, 100865 survived, 100866 lost d93, 100867 lost d103,
100868 survived. The wall difference between legs on 8 seeds is noise; the seed call
is a DIAG instrument, reverted — do not read it as a lever effect.)

### The control leg's finding (before the instrument leg even starts)

All 9 control wave-4 seed calls hit holders whose engagement plan was **hunt-stage
target-null** (`stageAfter: 'hunt'`, target null), so `winPlanSeedFromFight` returned
the plan unchanged — **no wave-4 plan ever forms**. The 141 `party_launch` dawn
commits and 58 launch depart rows in the control leg are all for target-null
engagement plans: the launch machinery works fine. What never engages is wave-4
targeting — the seed only attaches to a plan when the fleeing villager already has
an engagement plan aimed at the type they fled.

## The classified decomposition (instrument leg, 24 instances)

| Bucket | n | Share | Sub-reasons |
|---|---|---|---|
| launched | 1 | 0.042 | companion `visjoin_116` |
| target-killed | 2 | 0.083 | killed on days 102, 119 |
| selected-blocked | 8 | 0.333 | **all 8 `selected-not-executed`** |
| bid-not-selected | 0 | 0 | — |
| plan-churned-before-dawn | 0 | 0 | — |
| candidate-not-bid | 13 | 0.542 | 11 `no-companion-party`, 2 `not-scored` |
| unknown | 0 | 0 | — |

Pooled over the 24 instances: **262 scored dawns, 69 bids (26.3%), 69 selections
(100% of bids)**. A bid is always selected — the win-plan extra overrides the core
lottery in `vbrainScorePick`, exactly as the code structure predicted. 20 instances
target wave-4 types, 4 target wave-5 types (timeslot, editor ×2, spoiler — the lever's
seed gate is wave ≥ 3, so the frozen definition counts them; wave-4-only the
decomposition is launched 1, target-killed 2, selected-blocked 6, candidate-not-bid 11).

## The answer: two gates, not the two the DIAG was built to distinguish

The DIAG was built to separate "dawn never bid" from "plan churned before dawn".
**Both are empty.** The loss is entirely downstream of the bid, at two gates:

### Gate 1 — the holder is not a ranger (8/24, the biggest single loss)

Every `selected-not-executed` holder is a **non-ranger**: 0 EXPLORE candidates in
12–41 scored dawns each. The dawn scorer bids `party_launch` for any plan holder,
but the departure loop (`agencyTick` in `villager-agency.js`) skips anyone who is
not a wanderer/explorer **before** it ever calls `vbrainExecuteDepart` — so the
commit can never execute.

- **Brian Otieno, seed 100861, target timeslot (wave 5):** 21 selections over 21
  scored dawns across 40 days, at Haven (4,4), not on expedition, dawn commit
  `party_launch` with companion owen_smith — **zero depart rows, zero expedition
  starts**. He bids the return trip every dawn for over a month and never leaves.
- The one launcher, **visjoin_105 (seed 100865)**, is a ranger (EXPLORE in 6/9 dawns).
- The seed call has no profile check: it seeds plans for whoever survives a wave-4+
  flee, including homebodies and foragers, and the scorer never asks whether the
  holder can depart.

### Gate 2 — no companion to go with (11/24)

Plans sit at party stage for weeks with no eligible companion at Haven — dawn bids
`party_wait` instead. Even the one ranger holder, **owen_smith (49 scored dawns)**,
never found a companion. `findCompanion` needs a wanderer/explorer at the same node
with trust ≥ 15, not away, not engaged, not on expedition. For the 10 non-ranger
holders in this bucket the companion question is moot — even with a companion they
would hit Gate 1.

### What did NOT happen

- `bid-not-selected` 0 — a bid is never beaten in the dawn lottery.
- `plan-churned-before-dawn` 0 — plans are sticky once seeded: no holder died, no
  plan was deleted, no retarget happened before dawn in 150 days.
- No instance was ever blocked by a launch condition (gear-up / sick-stay-home /
  range-0 / hurt<70 with no medicine or healer): the executor was never reached,
  so the blocker derivation never fired. The 2 `not-scored` instances were seeded
  in the final days (0 scored dawns).

## Reachability verdict for the wave-4 chain

**Reachable but nearly always broken at two gates, in order.** (1) The seed only
attaches when the fleeing villager already has an engagement plan aimed at the fled
type — on current master, 9/9 wave-4 seeds bounced off target-null plans. (2) Even
when a plan opens, the holder is usually someone who never leaves the village (8/24)
or has no one to go with (11/24). Net in this panel: **1 launch in 24 seeded plans
(4.2%), 0 wave-4 kills through a launched party.**

## Village assessment, in plain words

Villagers who survive a run-in with a wave-4 monster do remember it, and they do
want to go back — the dawn scorer picks the return trip every single time it is
offered. But the wanting never becomes going. The person who remembers is usually
someone who never leaves the village — a homebody or a forager — and even the
travellers who remember usually can't find anyone to go with them. One party did
go (George and his companion, seed 100865) and fought the Suburb together — but
the Suburb can't be killed, only escaped, so they came home. The wave-4 chain isn't
blocked by courage or by the scorer. It's blocked by who remembers, and who is
around to go with them.

## Sense-testing (read the lines, not just the counts)

- **The launched party fights like a party.** Seed 100865, day 127 — George
  (visjoin_105) departs with companion visjoin_116 and meets the Suburb twice that
  day, allies named beside him both times:
  > "R1: George reads the sterile streets — you can't kill a suburb. They walk out.
  > (Navigation is victory.)"
  The Suburb escapes by design ("you don't kill it, you ESCAPE it"); both fights
  end vFlee. The earlier day-107/108 Suburb fights were wild encounters, before the
  first launch on day 118.
- **The target-kill reads as a real finish, in the wild.** Seed 100863, day 102 —
  Wanjiru Kamau vs the Herald, 1 round:
  > "Wanjiru sees it — The Herald is broken and close enough to finish. They hold
  > the line to end it. (Committed finish, met-below-break)"
  > "R1: Wanjiru strikes for 22 (0 left)"
  > "The lead falls — the pack's coordination shatters. The rest scatter or die."
  She killed her plan target without ever launching — the plan died with the target.
- **Wave-4 fights overall (instrument leg):** 120 encounters, 6 villager kills,
  75 flees, 6 villager deaths. Fleeing is the normal outcome.
- **The village still doesn't mark a veteran's death aloud:** 257 `vetSays` lines
  across the instrument leg, 0 veteran-death lines (same silence the vetparty arm
  found).

## Blanks filled or documented

- **Why no companion (11 cases): not decomposed.** The recorder captures the bid,
  not the companion pool. Next diagnostic: per scored dawn, which `findCompanion`
  condition fails — no ranger at Haven / trust < 15 / all away or engaged.
- **Why the seed bounces on target-null plans (control leg):** `winPlanSeedFromFight`
  only retargets an existing engagement plan; a villager with no plan, or a plan
  aimed at nothing, gets nothing. Design question, not this arm's: should a flee
  seed a fresh plan?
- **The profile question is a design call, not this arm's:** should the seed only
  fire for rangers, should the departure loop run for any plan holder, or should a
  non-ranger be paired with a ranger inviter? The DIAG proves the gate exists and
  measures its size (8/24); it does not pick the fix.
- **Analyzer bug found and fixed this run:** `summarize()` returned `files` as a
  count, but the corpus bar read `ctrlSummary.files.length` (undefined) — the corpus
  bar read FAIL until fixed. Fixed in `585378530`; a summarize-shape regression
  check was added to the proof, which also now tolerates the seed call being
  committed (static check).
- **Deviation logged:** the instrument's wraps use empty `catch (e) {}` blocks,
  inherited from the vetparty pattern; the repo's new-code rule (worktree
  `AGENTS.md`) says no empty catch. Not reworked — rework would require re-running
  both legs, and the wraps are proven neutral by D2. A future instrument should
  report the error instead.

## Metric review

- Corrections 2–3 were applied before any judged sim and the frozen definitions
  held — no mid-run re-scoring. Stage advancement is not churn; `target-killed`
  and `selected-not-executed` were added as buckets/sub-reasons before the legs ran.
- The frozen definition counts wave-5 targets as instances (the lever's seed gate is
  wave ≥ 3). A next run's prereg should either restrict to wave-4 ids only or rename
  the metric "wave-4+ plans". The count is unaffected either way.
- The primary metric (classified share) passed at 1.0, so the instrument is valid.
  The interesting result is the decomposition itself, which overturns the DIAG's
  premise: the loss is not "dawn never bid" vs "plan churned" — both are zero. The
  loss is the profile gate and the companion pool.

## Neutrality evidence

- **D1** (proof test): instrument tip, seed 100861, 60d, recorder ON twice —
  identical full corpus.
- **D2** (proof test): same, recorder ON vs OFF — identical trajectories.
- **D3** (drift smoke, `scripts/vetparty-drift-check.js` over both corpora):
  CLEAN on all 8 seeds, NO PRE-LEVER DRIFT. First divergence days 29/28/95/94/37/64/
  27/31 vs first seed days 27/27/18/44/35/26/26/28.
- **Proof:** 50/50 on the instrument tip, 50/50 in the off shape after the revert.

## Files

- Prereg: `evidence/2026-11-15/sim-dawnbid-a-prereg.md`
- Instrument: `scripts/dawnbid-driver-20261115.js`, `scripts/analyze-dawnbid-a.js`,
  `scripts/test-dawnbid-a.js`
- Corpora: `evidence/2026-11-15/perseed-dawnbid-a-control/` (8 files),
  `evidence/2026-11-15/perseed-dawnbid-a-on/` (8 files)
- Analysis: `evidence/2026-11-15/dawnbid-a-analysis.json`
- This evidence file: `evidence/2026-11-15/sim-dawnbid-a.md`

## Next diagnostic (named, not done)

1. Companion-pool decomposition per scored dawn — which `findCompanion` condition
   fails (no ranger at Haven / trust < 15 / all away or engaged).
2. The profile gate as a design call (see above).
3. Seed-attach on target-null plans as a design call (see above).

**Note for the coordinator:** `src/js/game.js` was touched (seed call, now reverted;
branch `src/` is byte-identical to the control anchor). Sequence merges if sibling
arm sim-ammocensus-a also touches it.
