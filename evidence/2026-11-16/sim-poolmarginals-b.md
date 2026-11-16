# sim-poolmarginals-b — DIAG: per-condition marginals for the companion pool

**Arm:** sim-poolmarginals-b (Loop B, run `fleshout-loop-b-20261116T0730Z`, axis winnability chain).
**Prereg:** `evidence/2026-11-16/sim-poolmarginals-b-prereg.md` (frozen; one
correction recorded in the metric review below — the prereg's "subject only
exists with the seed call" premise is wrong on this band: three live seed
paths open plans without the world-tick call. The GO bar is unaffected).
**Prior art:** `evidence/2026-11-16/sim-companionpool-b.md` + prereg — the
instrument this arm EXTENDS (the members extension); `evidence/2026-11-15/sim-dawnbid-a.md`.
**Type:** DIAG — instrument + measured marginals. No game change, no default flipped.
**Seeds:** 102131–102138 (8-seed pilot, 150d death-aware, policy competent verbatim,
sha `74a890f0844e`). Band verified fresh by this arm (see prereg).
**Branch:** `sim-poolmarginals-b`. **Worktree:** `~/workspace/worktrees/sim-poolmarginals-b`.
**Base:** master `9b04ae9b7` at arm start (the worktree HEAD; current master at the time).

## GO verdict: GO — instrument valid, all four prereg bars pass

1. **Classification with full per-member profiles:** 171/171 plan-holder scored dawns
   classified, unknown **0** (share 1.0 ≥ 0.90). Every classified dawn carries a
   valid `members` array (length == rosterN, firstFail tallies == counts).
2. **Corpus:** 16/16 files parse (8 control + 8 instrument, identical seeds).
3. **Neutrality:** D1/D2 green (proof test), D3 drift smoke clean on all 8 seeds
   (first divergence on/after the first seed day on every seed; 102137 IDENTICAL).
4. **Proof:** `scripts/test-poolmarginals-b.js` **64/64** on the instrument tip (seed call on)
   and **64/64** in the off shape after the revert.

## Instrument built

`scripts/poolmarginals-driver-20261116.js` extends the companionpool driver (same
vetfirst T-class instrument, same `v4seeds` / `v4departs` / `v4gates` /
`v4encounters` recorder, same dawnbid bid/census capture, same companionPool
first-fail capture) PLUS the `members` extension: every pool row now carries one
entry per roster member — `{id, profile, trust, trustRaw, node, away, engaged,
onExped, alive, firstFail}` — read BEFORE the first-fail order is applied, from
the same effective values (trust default 10, node-null → not-at-Haven,
profile-null → not-ranger), so marginals and first-fails are two readings of
one consistent snapshot. `scripts/analyze-poolmarginals-b.js` requires the
companionpool analyzer (not copied) and reuses its `classifyPool` +
`summarizePool`, then computes the marginal table from the raw rows' `members`
arrays. `scripts/test-poolmarginals-b.js` is the proof (sole-blocker fixtures
for first-fail AND marginal classification, co-occurrence fixtures M1/M2,
members-shape unknowns M3a–M3d). No game-code hook: the driver wraps
`vbrainScorePick` and computes the pool replica from pure reads after the call.
`POOLMARGINALS_RECORDER=off` skips the wraps (D2 leg). The replica's ranked
pick matched the real `findCompanion` pick on every dawn where a `party_launch`
bid existed — the analyzer's `agree` check passes on all 171 dawns (unknown 0).

**The two findCompanions** (frozen in the prereg, carried from companionpool):
`villager-brain.js:129` is the party_launch path; `win-plan.js:177` is its
eligibility-equivalent twin at the depart gate. The decomposition is recorded
against the brain's definition.

**Anchors.** Control anchor = `e478aaac8` (instrument, seed call ABSENT).
Instrument anchor = `0f1dc8b80` (seed call re-landed verbatim — the 13-line block
from revert `7ba893b4b`, blob `a66d45a5e`, in `resolveWildMonsterEncounter`,
`src/js/game.js`: on `vFlee` vs wave-4+, call
`winPlanSeedFromFight(vid, mdef, 'fled')`). After measurement the seed call was
**reverted** (`b9120c1f`); the branch's `src/` is byte-identical to the control
anchor (`git diff e478aaac8 HEAD -- src/` = 0 lines). Seed-call text is preserved
verbatim in the prereg and in git history (`0f1dc8b80`).

**Commits on this branch:** `bd2ae9342` (prereg), `e478aaac8` (instrument, control anchor),
`0f1dc8b80` (instrument tip, seed call), `b9120c1f` (seed-call revert).
Ready to merge, pending ship.

## Before / after on identical seeds

| | Control leg (seed call absent) | Instrument leg (seed call on) |
|---|---|---|
| Seeds / files | 8 / 8 | 8 / 8 |
| Instrument errors | 0 | 0 |
| Wave-4+ seed calls (wave ≥ 4) | 13 (54 seed rows total, all waves ≥ 3) | 60 (124 seed rows total) |
| Plan instances opened | **3** | **35** |
| Scored dawns (pool rows) | 19 | 171 |
| National by standing ≥200 / by scaleRank | 3 / 0 | 4 / 0 |
| Table / wins | 0 / 0 | 0 / 0 |
| Wave-4 reached / wave-5 reached | 8 / 3 | 8 / 4 |
| Median survival (gameDays) | 151d | 150d |

Per-seed (instrument leg): 102131 survived 150d standing 365, 4 instances, 17 dawns;
102132 survived 151d standing 495, 6 instances, 12 dawns; 102133 lost 149d standing 370,
10 instances, 47 dawns; 102134 lost 96d standing 199, 4 instances, 33 dawns; 102135
survived 150d standing 435, 4 instances, 10 dawns; 102136 survived 151d standing 199,
3 instances, 32 dawns; 102137 survived 151d standing 199, 1 instance, 18 dawns;
102138 lost 91d standing 175, 3 instances, 2 dawns.
(The wall difference between legs on 8 seeds is noise; the seed call is a DIAG instrument,
reverted — do not read it as a lever effect.)

### The control leg's finding (a correction to the family story)

**3 instances opened, 19 scored dawns, 2 launches — with the world-tick seed call
absent.** The prereg (like dawnbid's and companionpool's before it) said the subject
only exists with the seed call. On this band that is false: `winPlanSeedFromFight`
has three other live call sites — expedition evade (`villager-agency.js:643`,
`'evaded'`), expedition flee (`villager-agency.js:726`, `'fled'`), and the
fight-gate outmatched avoid (`win-plan.js:512`, `'avoided'`). Control seed rows:
evaded 38, fled 14, avoided 2. The seed still only attaches to an existing
engagement plan aimed at the fled type (dawnbid's mechanism, unchanged) — but
the agency and gate paths can hit a matching plan on their own. Companionpool's
control leg had 27 seed calls and 0 openings; this band's 54 seed calls opened
3. Band difference, not a contradiction — and the instrument leg measures the
world-tick path ADDED to those three live paths, not the subject conjured from
nothing. The GO bar is unaffected (it judges the instrument leg's classification,
not the control leg's instance count).

Control launches (both without the world-tick call): seed 102137, rafael_torres →
influencer with priya_nair (seedDay 34, closed 115) — the IDENTICAL instance
launches in the instrument leg too, same holder, target, companion, seed day and
close day; seed 102138, jovan_milic → reunion with gen_38psqq4 (seedDay 52,
closed 70). Seed 102137's two legs are identical on every reported field
(deaths, seeds, departs, census, pool rows, standing) — the world-tick call
added nothing on that seed.

## First-fail comparability with companionpool (171 dawns, 1,385 checks)

| Condition (first-fail, in findCompanion order) | n | Share of checks | companionpool (1,430 checks) |
|---|---|---|---|
| selfOrScholar (holder + scholar, structural) | 342 | 0.247 | 392 (0.274) |
| dead | 0 | 0 | 0 |
| away | 363 | 0.262 | 400 (0.280) |
| trustLow (trust < 15) | 0 | 0 | 0 |
| notAtHaven | 0 | 0 | 0 |
| engaged | 0 | 0 | 0 |
| **notRanger (profile not wanderer/explorer)** | **592** | **0.427** | **593 (0.415)** |
| onExped | 4 | 0.003 | 0 |
| **eligible** | **84** | **0.061** | **45 (0.031)** |

Eligible-pool size per dawn: **0: 99 (57.9%)**, 1: 62, 2: 8, 3+: 2.
Binding blocker on the 99 empty-pool dawns (largest failing group; ties named):
notRanger 63 (in 70 dawns counting ties), away 28 (in 34), selfOrScholar 1 (in 5).
Wave-4-only cut: 127/171 dawns classified, unknown 0 (44 dawns target wave-5 species).

The first-fail picture replicates: notRanger 592 vs companionpool's 593 on a
near-identical check base — the same count, independently measured on a fresh
band. The differences are the band's, not the instrument's: eligible members
nearly doubled (84 vs 45) and empty-pool dawns fell from 82.1% to 57.9%, because
this band has ranger holders (39 dawns, vs 0 in companionpool's band) and 3
launches (vs 0).

Holder profiles: **39 ranger-holder dawns, 132 non-ranger** (24 holders total:
6 rangers, 18 foragers/homebodies). Eligible-0 dawns: 24/39 ranger-holder,
75/132 non-ranger-holder.

Instance buckets (dawnbid classifier, reused): launched **3**, target-killed 1,
selected-blocked 13 (all `selected-not-executed`), bid-not-selected 0,
plan-churned-before-dawn 6 (4 holder-died, 1 retargeted, 1 plan-deleted),
candidate-not-bid 12 (all `no-companion-party`), unknown 0.

## The marginal table (the result this arm exists for)

Pooled over the 171 classified dawns. Pop-A = all non-self members (1,043);
Pop-B = living non-self members (1,043 — **dead is 0**, no dead member appears
in any pool row). Every member's fields were fully readable
(unknown-node 0, unknown-profile 0, trust-defaulted 0).

| Condition | Marginal n | Share of population | First-fail n (for contrast) |
|---|---|---|---|
| dead (over Pop-A) | 0 | 0 | 0 |
| away (over Pop-B) | 363 | 0.348 | 363 |
| trustLow, trust < 15 (over Pop-B) | 14 | 0.0134 | 0 |
| notAtHaven (over Pop-B) | 345 | 0.3308 | 0 |
| engaged (over Pop-B) | 2 | 0.0019 | 0 |
| notRanger (over Pop-B) | 819 | 0.7852 | 592 |
| onExped (over Pop-B) | 74 | 0.0709 | 4 |

## Co-occurrence (over Pop-B = 1,043)

| Pair | Both true | Share of Pop-B | P(first \| second) | P(second \| first) |
|---|---|---|---|---|
| trustLow × away | 14 | 0.0134 | 1.0 (every trustLow member is away) | 0.0386 |
| trustLow × notRanger | 14 | 0.0134 | 1.0 (every trustLow member is a non-ranger) | 0.0171 |
| away × notRanger | 227 | 0.2176 | 0.6253 | 0.2772 |

Further overlaps (same data, not in the frozen pair list): away × notAtHaven
345 — **every** off-node member is away, and only 18 away members read as at
Haven; notAtHaven × notRanger 221; onExped × away 70 (94.6% of expedition
members are away-flagged); onExped × notRanger **0 — all 74 expedition members
are rangers**; trustLow × notAtHaven 14 (every low-trust member is off-node);
engaged × away 2, engaged × onExped 2 (both engaged members are rangers, at
Haven, flagged away, on expedition).

## Alone vs in combination (over Pop-B)

| Condition | Alone (only this flag true) | In combination (≥1 other flag true) | Alone share of its true members |
|---|---|---|---|
| away | 0 | 363 | 0 |
| trustLow | 0 | 14 | 0 |
| notAtHaven | 0 | 345 | 0 |
| engaged | 0 | 2 | 0 |
| notRanger | 592 | 227 | 0.7228 |
| onExped | 4 | 70 | 0.0541 |

## The answer: profile alone, everything else only in combination

**Trust is real but never binding.** Trust < 15 is not a first-fail zero hiding a
large marginal: it is 14 members in 1,043 (1.3%). And every one of those 14 is
also away, also a non-ranger, also off-node — trustLow binds alone on zero
dawns, and on 14 of the 99 empty-pool dawns (14.1%) an empty pool hides a
low-trust member behind an earlier fail. Removing the trust floor would add
exactly zero eligible members on these dawns: all 14 fail `away` first anyway.
The trust floor of 15 is not the binding constraint in any practical sense —
companionpool's first-fail zero was, for trust, the right reading after all.

**Away is never alone either.** All 363 away members also fail something else
— 345 of them are off-node (away and not-at-Haven are nearly the same fact:
every member not at Haven is away; only 18 away members read as at Haven)
and/or non-rangers (227). Away binds alone on zero dawns. The first-fail count
(363) and the marginal count (363) are the same number because away is second
in the check order and nothing before it except death hides it — but alone it
explains nothing: the away members are, overwhelmingly, non-rangers out in the
world, not rangers stuck at home.

**notRanger is the only condition that binds alone at scale.** 819 of 1,043
living members (78.5%) are not rangers — against a first-fail count of 592.
592 of them (72.3%) fail on profile alone, with no other flag true. The other
227 are away as well. Profile is the marginal story, not just the first-fail
story: more than three in four villagers a holder could ask are the wrong kind
of person for the road, before distance or trust ever enters it.

**Expedition is the rangers, out.** 74 members are on expedition; 70 fail away
first and only 4 bind on expedition alone. And all 74 are rangers — the
expedition population IS the ranger population, out in the world. The village's
rangers are not at Haven because they are the ones who leave; the people at
Haven are the ones who cannot walk the road. That is the whole pool problem in
one line.

**Death is a true zero, not a first-fail artifact.** 0 dead members in 1,043 —
the roster at a scored dawn carries no dead members at all (they are pruned
from the roster). The dead check never fires because there is nobody dead to
check.

## Three holders, told in full

**Rafael Torres (wanderer, seed 102137, target influencer):** 18 scored dawns,
13 empty-pool. He is a ranger holder — the kind companionpool never saw — and
he launched: with priya_nair, seeded day 34, closed day 115. The same launch
happens in the control leg, identical in every field: it came from an agency
or gate seed, not the world-tick call. A ranger holder with a companion is the
chain working as designed.

**Adaeze Nwosu (wanderer, seed 102133, target herald):** 12 scored dawns, 6
empty-pool. She launched with app_mgpsphw9529 — another wanderer holder — on
the same seed day (112) that app_mgpsphw9529 launched with somchai_prasert.
Two ranger holders launching on the same day, for the same beast, with each
other. The party exists where rangers exist.

**gen_8lcnxu3 (forager, target influencer):** 29 scored dawns, 26 empty-pool —
the thinnest pool in the band. A forager holder whose village's rangers are
out or absent, asking for a companion 29 mornings and finding one 3 times.
This is companionpool's finding in one person.

## Reachability verdict for the wave-4 chain

**Reachable, and this band launches.** 35 instances, 3 launches, 1 solo
target-kill (seed 102134, visjoin_77 vs the strike, seeded day 81, killed day
83). The chain works when the holder is a ranger or when a ranger is home to
go with — 39 ranger-holder dawns produced the launches; the 132 non-ranger
holder dawns produced none that departed (13 selected-blocked, all
`selected-not-executed`: the non-ranger holder bids and never leaves — Gate 1,
unchanged). The pool is empty on 57.9% of dawns, and where it is empty the
reason is profile alone in 592 of 819 cases.

## Village assessment, in plain words

The villages on this band are livelier than companionpool's: rangers exist,
parties launch, a forager kills a Strike alone. But the shape is the same. The
people at Haven in the morning are foragers and homebodies; the rangers are
out — on expedition, away, off the Haven tile — and the person who remembers
the beast is usually a forager who could not leave even with a companion.
Trust is not the problem: only 14 villagers in a thousand are below the line,
and every one of them is already away and already the wrong kind of person for
the road. The problem is still, only, that the village does not have rangers
at home. When it does — Rafael, Adaeze — the dawn picks the return trip and
the party walks.

## Sense-testing (read the lines, not just the counts)

- **The kill reads like a fight.** Seed 102132, day 140 — Gonzalo (visjoin_133)
  vs the Herald, 5 rounds, one ally beside him:
  > "Gonzalo closes in and strikes with the kitchen knife for 10 (40 left) — but The Herald holds its ground, wounded, and still coming. (Committed)"
  > "R1: Second Omen hits Gonzalo for 12 (87 left)"
  > "R1: Gonzalo strikes for 8 (32 left)"
  > "The Herald is wounded past its line — and holds its ground. It is not leaving. (Committed)"
  A kitchen knife against the Herald, a monster that holds its ground twice over
  — the fight reads as one coherent encounter, and he wins it.
- **The Eulogy reads like a losing fight.** Seed 102131, day 138 — Samuel
  (app_mgpsphv795) vs the Eulogy, 4 rounds, two allies:
  > "Samuel sees The Eulogy coming and nocks an arrow — the fight opens at range (4 shots)."
  > "loosed wide — the arrow buries itself in the dirt. (spent)"
  > "loosed — it takes The Eulogy for 16 (884 left)."
  > "Samuel lowers the bow — The Eulogy is on them now. (2/4 hit)"
  16 damage against 884 HP, two of four arrows hitting dirt — he flees, and the
  lines say why.
- **The death reads as a death.** Seed 102132, day 39 — Benoit vs the Eulogy,
  11 rounds, two allies:
  > "R1: Benoit reads the fight as it moves — the body tells them what the mouth won't. Quicker from here. (Brawler's Instinct: +2 speed)"
  > "R2: Benoit strikes for 26 (874 left)"
  > "Benoit is losing — shouts for help! Eli charges in!"
  > "R3: Benoit stops mid-fight and binds the wound — field medicine, +20 HP."
  He fights eleven rounds, calls for help, gets it, binds his wound — and dies
  anyway. The fight does not flatter him.
- **Wave-4 fights overall (instrument leg):** 100 encounters, 6 villager kills,
  58 flees, 18 villager deaths, 13 evades, 5 monster-flees. Fleeing is the normal
  outcome, as in dawnbid's and companionpool's bands.
- **The village still doesn't mark a veteran's death aloud:** 352 `vetSays`
  lines across the instrument leg, 0 veteran-death lines (the 9 regex hits for
  died/dead/killed/fell are "fellow" and "embodied" false positives) — the same
  silence dawnbid and companionpool found.

## Blanks filled or documented

- **Companionpool's first-fail zeros, resolved to marginals.** Trust: 14/1,043
  (1.3%), always co-occurring with away + notRanger + notAtHaven, never alone.
  Node: 345/1,043 (33.1%) not at Haven, always away, never alone. Engagement:
  2/1,043 (0.2%), never alone. Expedition: 74/1,043 (7.1%), 70 hidden behind
  away, 4 alone — and all 74 are rangers. Death: a true 0, not a first-fail
  artifact. Profile: 819/1,043 (78.5%), 592 alone — the only condition that
  binds alone at scale.
- **Why the control leg opens plans (prereg correction):** three live seed
  paths — agency evade, agency flee, gate avoid — seed plans without the
  world-tick call. Control leg: 3 instances, 19 scored dawns, 2 launches.
  The instrument leg measures the world-tick path added to those, not the
  subject conjured from nothing.
- **The profile question is still a design call, not this arm's:** the marginals
  sharpen it — 72.3% of non-rangers bind on profile alone, so any fix that
  only moves trust, away, or expedition leaves the pool empty. Loop A's
  profilegate arm owns the question.
- **Away-but-at-Haven (18 members):** 18 members are flagged away while their
  node reads Haven. Logged as an open finding (sim-findings.md) — the away
  flag and the node read disagree for these members; whether the flag lingers
  after return or covers a non-spatial absence is a question for whoever owns
  away semantics, not this DIAG.
- **Index clobber (safe-commit):** struck on all four commits this run
  (staged-deleted + untracked, and once as `MM` on game.js). Repaired each
  time via `git ls-tree -r HEAD -- <paths> | git update-index --add
  --index-info`, verified with `git status` clean + `git diff HEAD` empty +
  hash-object match. All commits verified correct after repair.

## Metric review

- The frozen definitions held — no mid-run re-scoring. The wave-4-only cut
  (127/171 dawns) matches the prereg's secondary split; the 44 wave-5-target
  dawns are counted in the pooled marginal table (the marginal split by target
  wave was not computed — the table is pooled over all 171 dawns, as frozen).
- **Prereg correction (recorded, not hidden):** the prereg's Design decision 1
  said the subject only exists with the seed call. The control leg proves
  otherwise on this band (3 instances, 2 launches via agency/gate seeds). The
  correction changes no GO bar — classification, corpus, neutrality, and proof
  are all judged on the instrument leg, which ran with the seed call on — but
  the family story ("the seed only attaches...") needs the three live paths
  named wherever it is repeated. Dawnbid's and companionpool's control legs
  happened to open 0 instances, so the premise went unchallenged until now.
- Companionpool's control-leg 0-instance finding does not replicate here (3
  instances) — a band difference in whether agency/gate seeds hit a holder
  with a matching live engagement plan, not a contradiction of the mechanism.
- The instrument leg opened 35 instances (companionpool: 31, dawnbid: 24) —
  different band, same order. The marginals are judged on the scored dawns
  that occur (171), not on matching 31.
- 3 launches this band (companionpool: 0, dawnbid: 1) is consistent with the
  marginal finding, not a contradiction: 39 ranger-holder dawns where
  companionpool had 0, and all 3 launches have ranger holders.
- The primary metric (classified-with-members share) passed at 1.0, so the
  instrument is valid. The interesting result is the marginal table itself:
  trust is 1.3% and never alone; profile is 78.5% and alone 72.3% of the time.

## Balanced-panel review note (why no panel)

No balanced panel was run for this DIAG, same as dawnbid and companionpool.
The panel (`scripts/balance-panel.js`) measures a lever's effect on wins /
survival across policies; this arm ships no game change — the seed call is
reverted, the instrument is observation-only, and the prereg bar is the judge.
A panel on both legs would measure the seed call's noise, not a lever. The
neutrality proof (D1/D2/D3) is the panel's substitute here, and it is clean.

## Neutrality evidence

- **D1** (proof test): instrument tip, seed 102131, 60d, recorder ON twice —
  identical full corpus (including companionPool rows WITH members arrays).
- **D2** (proof test): same, recorder ON vs OFF — identical trajectories.
- **D3** (drift smoke, `scripts/vetparty-drift-check.js` over both corpora):
  CLEAN on all 8 seeds, NO PRE-LEVER DRIFT. First divergence days 44/35/114/
  41/130/35/—(identical)/36 vs first seed days 32/31/112/39/29/34/34/34.
  Seed 102137 is IDENTICAL across legs on every reported field.
- **Proof:** 64/64 on the instrument tip, 64/64 in the off shape after the revert.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-16/perseed-poolmarginals-b-on/*.json' --metrics
national,table,wins,exiled` — **REFUSED**, as the recent DIAGs hit:
"telemetry-check: refusing recorder-corpus input: all 8 --current rows carry
top-level anchorCommit, so they are sweep recorder rows, not runs. Recorder
corpora are compared with sweep-compare tables, never against a run baseline
here." Recorded, not worked around; the baseline was not rolled on it.

## Files

- Prereg: `evidence/2026-11-16/sim-poolmarginals-b-prereg.md`
- Instrument: `scripts/poolmarginals-driver-20261116.js`, `scripts/analyze-poolmarginals-b.js`,
  `scripts/test-poolmarginals-b.js`
- Corpora: `evidence/2026-11-16/perseed-poolmarginals-b-control/` (8 files),
  `evidence/2026-11-16/perseed-poolmarginals-b-on/` (8 files)
- Analysis: `evidence/2026-11-16/poolmarginals-b-analysis.json`
- This evidence file: `evidence/2026-11-16/sim-poolmarginals-b.md`

## Next diagnostic (named, not done)

1. The profile gate as a design call (Loop A owns it) — now sharpened by the
   marginals: any fix must move the 72.3% of non-rangers who bind on profile
   alone; trust/away/expedition fixes leave the pool empty.
2. Seed-attach on target-null plans as a design call (Loop A's seedattach
   finding) — now with the correction that three live paths already seed
   plans without the world-tick call.
3. The away flag vs the node read (18 away-but-at-Haven members) — logged as
   an open finding; the next instrument revision that reads `away` should
   say which of the two is the truth for those members.

**Note for the coordinator:** `src/js/game.js` was touched (seed call, now reverted;
branch `src/` is byte-identical to the control anchor). Sequence merges if a sibling arm
also touches it. Loop A is live on scale-onramp — this arm touched none of those files.
