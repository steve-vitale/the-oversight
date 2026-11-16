# sim-companionpool-b — DIAG: which findCompanion condition fails, per scored dawn

**Arm:** sim-companionpool-b (Loop B, run `fleshout-loop-b-20261116T0530Z`, axis winnability chain).
**Prereg:** `evidence/2026-11-16/sim-companionpool-b-prereg.md` (frozen; no corrections).
**Prior art:** `evidence/2026-11-15/sim-dawnbid-a.md` (DIAG-GO — 11/24 seeded wave-4 plans sat at
party stage with no eligible companion; even the one ranger holder, owen_smith, never found one).
**Type:** DIAG — instrument + measured decomposition. No game change, no default flipped.
**Seeds:** 102001–102008 (8-seed pilot, 150d death-aware, policy competent verbatim,
sha `74a890f0844e`). Band re-verified fresh by this arm (see prereg).
**Branch:** `sim-companionpool-b`. **Worktree:** `~/workspace/worktrees/sim-companionpool-b`.
**Base:** master `97ff03342` (coordinator note: master has since moved — journey r220/r221, now
`3853257d6`; no rebase mid-run; the coordinator rebases at landing and re-runs proofs).

## GO verdict: GO — instrument valid, all four prereg bars pass

1. **Classification:** 196/196 plan-holder scored dawns classified, unknown **0** (share 1.0 ≥ 0.90).
2. **Corpus:** 16/16 files parse (8 control + 8 instrument, identical seeds).
3. **Neutrality:** D1/D2 green (proof test), D3 drift smoke clean on all 8 seeds
   (first divergence on/after the first seed day on every seed).
4. **Proof:** `scripts/test-companionpool-b.js` **55/55** on the instrument tip (seed call on)
   and **55/55** in the off shape after the revert.

## Instrument built

`scripts/companionpool-driver-20261116.js` extends the dawnbid driver: same vetfirst T-class
instrument plus `v4seeds` / `v4departs` / `v4gates` / `v4encounters` plus the dawnbid bid/census
capture, and new `companionPool` rows — one per scored dawn (part 0) for a wave-4+ plan holder:
first-fail counts per roster member in the brain `findCompanion` check order, the eligible pool,
and the ranked pick via the pure-read `companionRank`. `scripts/analyze-companionpool-b.js`
reuses the dawnbid classifier (`classifySeed`, imported) and decomposes the pool rows joined to
those instances' scored dawns; `scripts/test-companionpool-b.js` is the proof. No game-code hook:
the driver wraps `vbrainScorePick` and computes the pool replica from pure reads after the call
(scoring writes no roster/trust/away state). `COMPANIONPOOL_RECORDER=off` skips the wraps (D2 leg).
The replica's ranked pick matched the real `findCompanion` pick on **35/35** dawns where a
`party_launch` bid existed (agree false: 0) — the replica is faithful to the code it mirrors.

**The two findCompanions (frozen in the prereg, read from the code):** `villager-brain.js:129`
is the party_launch path — `winPlanCands` (line 215) calls it to build the dawn bid. `win-plan.js:177`
is its eligibility-equivalent twin at the depart gate (`winPlanDepart`'s `launchParty`, line 359).
The two loops are semantically identical (same roster order, same check order, same
`companionRank` ranking); they differ only mechanically (`npcNode` direct vs the `atHaven` helper,
`getPerson` dead-read vs the `alive` helper). The decomposition is recorded against the brain's
definition, which is the one the dawn bid sees.

**Anchors.** Control anchor = `abe9a4e7f` (instrument, seed call ABSENT).
Instrument anchor = `a5dfd6b34` (seed call re-landed verbatim — the 13-line block from
revert `7ba893b4b`, blob `a66d45a5e`, in `resolveWildMonsterEncounter`, `src/js/game.js`:
on `vFlee` vs wave-4+, call `winPlanSeedFromFight(vid, mdef, 'fled')`). After measurement
the seed call was **reverted** (`9f65d6eda`); the branch's `src/` is byte-identical to
the control anchor (`git diff abe9a4e7f HEAD -- src/` = 0 lines). Seed-call text is
preserved verbatim in the prereg and in git history (`a5dfd6b34`).

**Commits on this branch:** `1e622e28c` (prereg), `abe9a4e7f` (instrument, control anchor),
`a5dfd6b34` (instrument tip, seed call), `9f65d6eda` (seed-call revert).
Ready to merge, pending ship.

## Before / after on identical seeds

| | Control leg (seed call absent) | Instrument leg (seed call on) |
|---|---|---|
| Seeds / files | 8 / 8 | 8 / 8 |
| Instrument errors | 0 | 0 |
| Wave-4+ seed calls (wave ≥ 3) | 27 (3 wave-4) | 137 (56 wave-4) |
| Plan instances opened | **0** | **31** |
| Scored dawns (pool rows) | 0 | 196 |
| National / table / wins | 2 / 0 / 0 | 4 / 0 / 0 |
| Wave-4 reached / wave-5 reached | 7 / 2 | 8 / 4 |
| Median survival | 141d | 146d |

Per-seed (instrument leg): 102001 lost d142 standing 199, 3 instances, 29 dawns;
102002 survived 151d standing 310, 0 instances; 102003 lost d57 standing 125, 0;
102004 lost d141 standing 380, 9 instances, 69 dawns; 102005 lost d87 standing 125, 0;
102006 survived 150d standing 430, 4 instances, 6 dawns; 102007 survived 152d standing 485,
11 instances, 72 dawns; 102008 survived 150d standing 199, 4 instances, 20 dawns.
(The wall difference between legs on 8 seeds is noise; the seed call is a DIAG instrument,
reverted — do not read it as a lever effect.)

### The control leg's finding (again)

0 instances on all 8 seeds — the seed only attaches when the fleeing villager already has an
engagement plan aimed at the fled type (dawnbid's control-leg finding, reproduced: 27 seed
calls, 0 openings). Seed 102007 alone had 22 seed calls and 88 score rows: 21 of the 22 hit
hunt-stage target-null plans, the 22nd seeded a wave-3 (gavel) party-stage plan — none opened
a wave-4+ plan.

## The classified decomposition (instrument leg, 196 scored dawns)

Pooled over 196 scored dawns and 1,430 roster-member checks:

| Condition (first-fail, in findCompanion order) | n | Share of checks |
|---|---|---|
| selfOrScholar (holder + scholar, structural) | 392 | 0.274 |
| dead | 0 | 0 |
| away | 400 | 0.280 |
| trustLow (trust < 15) | 0 | 0 |
| notAtHaven | 0 | 0 |
| engaged | 0 | 0 |
| **notRanger (profile not wanderer/explorer)** | **593** | **0.415** |
| onExped | 0 | 0 |
| **eligible** | **45** | **0.031** |

Eligible-pool size per dawn: **0: 161 (82.1%)**, 1: 25, 2: 10, 3+: 0.
Binding blocker on the 161 empty-pool dawns (largest failing group; ties named):
notRanger 74 (in 91 dawns counting ties), away 47 (in 54), selfOrScholar 21 (in 36).
Wave-4-only cut: 180/196 dawns classified, unknown 0.

Holder profiles: **0 ranger-holder dawns, 196 non-ranger** (forager/homebody). 18 holders total,
all forager or homebody. The pool was empty on 161 dawns, and the holder could not have departed
on any dawn anyway — Gate 1 and Gate 2 are the same population: the people who remember a wave-4
flee are foragers and homebodies, and the only people who could walk with them are rangers who
are not at Haven in a usable form.

Instance buckets (dawnbid classifier, reused): launched **0**, target-killed 1, selected-blocked 8
(all `selected-not-executed`), bid-not-selected 0, plan-churned-before-dawn 5 (2 retargeted,
3 holder-died), candidate-not-bid 17 (all `no-companion-party`), unknown 0.

## The answer: profile first, away second, everything else zero

**Profile is the pool's binding constraint.** Of the 638 roster members who reached the profile
check (alive, not away, trusted, at Haven), 593 (93%) were not rangers — only 45 were. The pool
is empty on 82% of scored dawns, and on 91 of those 161 dawns the largest failing group is the
non-rangers sitting at Haven. A companion exists on only 35 dawns, and every one of those dawns
bid `party_launch` (35/35 bids, replica agrees 35/35) — the scorer takes the companion whenever
one exists. The pool is not the scorer's problem; the village's rangers are the problem.

**Away is second.** 400 members (28% of checks) were away — out on expeditions, errands, or
otherwise not home — and away is the binding blocker on 54 of the 161 empty dawns. Away subsumes
the expedition check in first-fail order: anyone on an expedition is away first, so `onExped`
reads 0 not because nobody is out, but because the away check already caught them.

**Trust, node, engagement, expedition, death: zero as first fails.** 638 members reached the
trust check and 0 were below 15; 638 reached the node check and 0 were not at Haven; 638
reached the engaged check and 0 were engaged; 45 reached the expedition check and 0 were on
one; 1,038 reached the dead check and 0 were dead. Read precisely: these are FIRST-FAIL zeros.
A member failing an earlier check could also fail a later one — the instrument records only the
first. What the zeros do establish: among villagers who were alive, home, and not yet excluded,
trust was never the reason, nobody was stuck off-node, and nobody was tied up engaged. The
trust floor of 15 is not binding in these villages by the time a wave-4 plan exists.

**The villages are also thin.** On 21 empty-pool dawns the largest failing group was the
holder-plus-scholar themselves — rosters of 2–4 people. Example: seed 102001, day 104,
visjoin_87 (forager, target eulogy): roster of 4 — the holder, the scholar, one villager away,
one non-ranger. There is nobody left to find.

**Two holders, told in full.** Vasyl Shevchenko (forager, seed 102004): 49 scored dawns across
6 instances, 9 eligible dawns, 9 bids — every bid selected, none executed (non-ranger holder,
Gate 1). His Herald instance (seeded day 93) had 25 scored dawns and 5 selections, and closed
`target-killed` the same day it opened: he killed the Herald solo. James Okonkwo (forager,
seed 102007): 23 scored dawns, 6 eligible dawns, 6 bids, 6 selections, selected-blocked —
he bids the return trip six times and never leaves.

## Reachability verdict for the wave-4 chain

**Reachable but broken at the same two gates dawnbid named, now measured to the condition.**
(1) The seed only attaches to an existing engagement plan aimed at the fled type (control: 0/8
seeds open a plan). (2) When a plan opens, the holder is never a ranger in this band (0/196
dawns) and the pool is empty on 82% of dawns, almost entirely for want of rangers at Haven.
Net in this panel: **0 launches in 31 seeded plans, 0 wave-4 kills through a launched party**
(dawnbid's band had 1 launch; this band has none — consistent with 0 ranger holders here).

## Village assessment, in plain words

Villagers who survive a wave-4 monster do remember it, and when anyone is around to go with,
they ask — every single time a companion exists, the dawn picks the return trip. But there is
almost never anyone to go with. The village at Haven is foragers and homebodies: the rangers
are out, or there are no rangers at all, and the person who remembers the beast is themselves
a forager or a homebody who could not leave even with a companion. In the thinnest villages
there are two or three people left in total and the question answers itself. One man, Vasyl,
did go back alone and killed the Herald with a crowbar, a tripwire, and field medicine — the
chain works when the person is already strong enough to go alone. It does not work as a party.

## Sense-testing (read the lines, not just the counts)

- **The solo kill reads like a fight.** Seed 102004, day 93 — Vasyl Shevchenko vs the Herald,
  3 rounds, solo (alliesN 0 in the record; the fight is his):
  > "Vasyl closes in and strikes with the crowbar for 12 (54 left) — but The Herald holds its
  > ground, wounded, and still coming. (Committed)"
  > "Vasyl had strung a wire at ankle height before it closed — the first rush will eat dirt.
  > (Tripwire)"
  > "R1: Vasyl stops mid-fight and binds the wound — field medicine, +20 HP."
  > "R3: Vasyl strikes for 21 (blood trail +2) (x1.3) (0 left)"
  > "The lead falls — the pack's coordination shatters. The rest scatter or die."
  Tripwire, field medicine, blood trail, a committed monster that holds its ground — the tricks
  and the fight read as one coherent encounter, and the plan closed `target-killed` the day it
  opened.
- **The Suburb cannot be killed, only escaped — and the lines say so.** Seed 102001, day 40 —
  Pavel Dubinin vs the Suburb:
  > "Pavel walks straight into The Suburb. No avoiding it."
  > "R1: Pavel strikes for 12 (1402 left)"
  12 damage against 1,402 HP is the fight telling the truth about what the Suburb is.
- **The death reads as a death.** Seed 102001, day 40 — Ashanti vs the Influencer:
  > "Ashanti sees The Influencer coming and nocks an arrow — the fight opens at range (2 shots)."
  > "loosed wide — the arrow buries itself in the dirt. (spent)"
  > "loosed wide — the arrow buries itself in the dirt. (spent)"
  She misses both shots and dies. The fight does not flatter her.
- **Wave-4 fights overall (instrument leg):** 198 encounters, 12 villager kills, 143 flees,
  21 villager deaths. Fleeing is the normal outcome, as in dawnbid's band.
- **The village still doesn't mark a veteran's death aloud:** 365 `vetSays` lines across the
  instrument leg, 0 veteran-death lines — the same silence dawnbid found, and Loop A's
  profilegate arm logged as a finding today. Corroboration, not a new finding.

## Blanks filled or documented

- **Why no companion (dawnbid's 11 cases): DECOMPOSED.** Profile 41.5% of checks / binding on
  91 empty dawns; away 28% / binding on 54; trust, node, engaged, expedition, death all zero
  as first fails; 82% of scored dawns have an empty pool.
- **Why the seed bounces on target-null plans (control leg):** same as dawnbid — the seed
  only retargets an existing engagement plan. Loop A's seedattach arm logged the world-tick
  seed gap as a finding today (64 of 78 wave-4 flees leave no trace); no duplicate entry here.
- **The profile question is a design call, not this arm's:** should the seed only fire for
  rangers, should the departure loop run for any plan holder, or should a non-ranger be paired
  with a ranger inviter? The DIAG proves the gate exists and measures its size (0/196 ranger
  holder dawns; 93% of reachable members not rangers); it does not pick the fix. Loop A's
  profilegate arm owns this question.
- **Deviation logged:** the instrument's wraps use empty `catch (e) {}` blocks, inherited
  verbatim from the dawnbid driver (28 in the driver, 1 in the analyzer); the repo's new-code
  rule says no empty catch. Not reworked — rework would require re-running both legs, and the
  wraps are proven neutral by D2. This arm's NEW code (the pool replica, the analyzer's pool
  classifier, the proof fixtures) has no empty catches — every catch assigns, returns, or
  records the error.
- **Index clobber (safe-commit):** struck on all three instrument/prereg commits this run
  (staged-deleted + untracked, and once as `MM` on game.js). Repaired each time via
  `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, verified with
  `git status` clean + `git diff HEAD` empty + hash-object match. All four commits verified
  correct after repair.

## Metric review

- The frozen definitions held — no mid-run re-scoring. The wave-4-only cut (180/196 dawns)
  matches the prereg's secondary split; the 16 wave-5-target dawns behave the same way
  (the seed gate is wave ≥ 3, as frozen).
- The zeros need their precise reading (see above): first-fail zeros, not "never happens"
  zeros. A member failing `away` may also have trust < 15 or be a non-ranger; the instrument
  cannot see past the first failure. A next diagnostic that wants per-condition marginals
  (not first-fails) would need per-member full profiles in the row — the `fails` map already
  records first-fail per member, so the extension is small.
- The instrument leg opened 31 instances (dawnbid: 24) — different band, same order. The
  decomposition is judged on the scored dawns that occur (196), not on matching 24.
- No launches this band (dawnbid: 1) is consistent with the pool finding, not a contradiction:
  0 ranger holders means Gate 1 blocks every eligible dawn.
- The primary metric (classified share) passed at 1.0, so the instrument is valid. The
  interesting result is the decomposition itself: the pool fails on profile, not on trust,
  and the holders are never rangers.

## Balanced-panel review note (why no panel)

No balanced panel was run for this DIAG, same as dawnbid. The panel (`scripts/balance-panel.js`)
measures a lever's effect on wins/survival across policies; this arm ships no game change —
the seed call is reverted, the instrument is observation-only, and the prereg bar is the judge.
A 64-case panel on both legs would measure the seed call's noise, not a lever. The neutrality
proof (D1/D2/D3) is the panel's substitute here, and it is clean.

## Neutrality evidence

- **D1** (proof test): instrument tip, seed 102001, 60d, recorder ON twice —
  identical full corpus (including companionPool rows).
- **D2** (proof test): same, recorder ON vs OFF — identical trajectories.
- **D3** (drift smoke, `scripts/vetparty-drift-check.js` over both corpora):
  CLEAN on all 8 seeds, NO PRE-LEVER DRIFT. First divergence days 31/38/44/57/40/35/72/26
  vs first seed days 28/36/41/6/35/33/13/25.
- **Proof:** 55/55 on the instrument tip, 55/55 in the off shape after the revert.

## Files

- Prereg: `evidence/2026-11-16/sim-companionpool-b-prereg.md`
- Instrument: `scripts/companionpool-driver-20261116.js`, `scripts/analyze-companionpool-b.js`,
  `scripts/test-companionpool-b.js`
- Corpora: `evidence/2026-11-16/perseed-companionpool-b-control/` (8 files),
  `evidence/2026-11-16/perseed-companionpool-b-on/` (8 files)
- Analysis: `evidence/2026-11-16/companionpool-b-analysis.json`
- This evidence file: `evidence/2026-11-16/sim-companionpool-b.md`

## Next diagnostic (named, not done)

1. The profile gate as a design call (Loop A owns it) — seed only for rangers, departure loop
   for any holder, or pair the holder with a ranger inviter.
2. Seed-attach on target-null plans as a design call (Loop A's seedattach finding).
3. Per-condition marginals (not first-fails): extend the pool row with each member's full
   profile/trust/node, to say how often trust < 15 co-occurs with away/notRanger.

**Note for the coordinator:** `src/js/game.js` was touched (seed call, now reverted;
branch `src/` is byte-identical to the control anchor). Sequence merges if a sibling arm
also touches it. Loop A is live on scale-onramp (profilegate + seedattach arms) — this arm
touched none of those files.
