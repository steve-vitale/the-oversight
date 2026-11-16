# sim-profileshadow-a — the shadow numbers for the profile-gate design call (DIAG, no game change)

Run: fleshout-20261116T1631Z, Loop A. Worktree branch `sim-profileshadow-a`.
Prereg: `evidence/2026-11-16/sim-profileshadow-a-prereg.md` (frozen, committed first).
Analyzer: `scripts/analyze-profileshadow-a.js` (requires `scripts/analyze-poolmarginals-b.js`, not modified) → `evidence/2026-11-16/profileshadow-a-analysis.json`.
Proof: `scripts/test-profileshadow-a.js`.
Control anchor `498ecbe1e` (instrument commit); instrument anchor `6ed5987ff` (instrument + verbatim 13-line VETPARTY seed call). Policy competent verbatim, sha `74a890f0844e` (matches the prereg). Band 102401–102408, 150d, death-aware.

## Verdict: GO (all four frozen bars pass)

| Bar | Result |
|---|---|
| (1) Instrument valid: 8/8 corpora parse, 0 instrument errors, S0 agreement 100% on biddable dawns | **PASS** — 8/8 + 8/8 parse, 0 errors either leg, S0 agreement 51/51 biddable dawns (100%) |
| (2) Shadow tables complete for S0/S1/S2 on all scored dawns (unknown 0) | **PASS** — 137/137 shadow-classified on the instrument leg, 11/11 on control, unknown 0 both legs |
| (3) Proof green on the instrument tip AND post-revert | **PASS** — 80/80, 0 failed on the instrument tip AND post-revert |
| (4) Neutrality: D1 + D2 green (proof) AND D3 drift smoke clean | **PASS** — D1/D2 green in the proof; D3: no pre-seed divergence on any seed (divergences 38/68/—/—/33/55/129/49, each on/after that seed's first `v4seeds` day 5/34/40/—/31/51/18/9; 102403/102404 identical) |

This DIAG ships no game change. The seed call is instrument only and is reverted on the branch; `src/` diff vs the instrument tip is 0 after the revert. It does NOT decide the profile gate — it gives Steve the numbers for the design call.

## The question, answered in plain words

Poolmarginals proved the profile gate is the only condition that binds alone at scale: most living members are not wanderers or explorers, and hundreds bind on profile alone. This arm asked, at every dawn a hunter actually held a wave-4 plan: how many companions would there be if the gate were dropped, or widened to foragers?

**Dropping the gate empties the problem completely. Under the current gates, 86 of 137 scored dawns (63%) have nobody to take along. Drop the profile gate and that falls to zero — every single dawn has someone. Widen it just to foragers and it falls to 2 of 137. The people are there: under the dropped gate the companion the scorer would pick is a forager on 69% of dawns, a homebody on 17%, a wanderer on 14%. And the forager-only widening recovers 84 of the 86 empty dawns — nearly everything the full drop buys, without ever admitting a homebody.**

The residual question is not "who else is blocked" — once profile is out of the way, nothing else blocks at these dawns. The question is the one Steve owns: whether foragers (and homebodies) should be allowed to answer a wave-4 hunt at all.

## Primary metric

Eligible-0 dawn share under S1 vs S0 (the shadow tables complete for S0/S1/S2 on all scored dawns).

- **S0 (current gates): 86/137 eligible-0 (62.8%). On-leg: 0/137 under S1. The gate is the whole of the empty-pool problem at these dawns.**
- **S2 (foragers admitted): 2/137 eligible-0 (1.5%).**

## Per-shadow tables (instrument leg, 137 scored dawns)

| | S0 current gates | S1 profile dropped | S2 foragers admitted |
|---|---|---|---|
| Eligible histogram (0 / 1 / 2 / 3+) | 86 / 46 / 4 / 1 | 0 / 22 / 57 / 58 | 2 / 47 / 48 / 40 |
| Eligible-0 dawns | 86 (62.8%) | 0 (0%) | 2 (1.5%) |
| Would-be-biddable dawns | 51 (37.2%) | 137 (100%) | 135 (98.5%) |
| Mean eligible per dawn | 0.42 | 2.66 | 2.08 |
| Pick profiles (explorer / wanderer / forager / homebody / null) | 0 / 51 / 0 / 0 / 0 | 0 / 19 / 95 / 23 / 0 | 0 / 22 / 113 / 0 / 0 |
| Pooled eligible by profile (explorer / wanderer / forager / homebody / null) | 0 / 57 / 0 / 0 / 0 | 0 / 57 / 228 / 79 / 0 | 0 / 57 / 228 / 0 / 0 |
| Profile-null members eligible | 0 | 0 | 0 |

Paired (same dawns): **86 S0-empty dawns open under S1; 84 open under S2; 0 dawns stay empty under S1.** The two dawns still empty under S2 are both on seed 102402.

Actual launches on the same band: **7**, vs would-be-biddable dawns 51 / 137 / 135. The gap Steve's design call must close is 51 → 137 dawns; the separate bid → launch leak (51 biddable dawns, 7 launches) is named in the findings.

Control leg (11 scored dawns, all on 102402): S0 eligible-0 7/11 (63.6%), biddable 4; S1/S2 eligible-0 0/11, biddable 11/11. S1 picks: forager 7, homebody 4. S2 picks: forager 9, wanderer 2. The control direction agrees; the instrument leg (137 dawns) carries the verdict.

## Would-be companion identity distribution

Under S1 the scorer's pick is a forager on 95/137 dawns (69.3%), a homebody on 23 (16.8%), a wanderer on 19 (13.9%), an explorer on 0. Under S2 it is a forager on 113/135 (83.7%), a wanderer on 22 (16.3%). **No explorer is ever the pick under any shadow** — there are no explorers among eligible companions at any scored dawn on this band; S0's picks are wanderer-only (51/51). The "ranger" pool here is wanderers, and the widening's new blood is foragers.

## First-fail decomposition + marginals (instrument leg)

Pooled first-fail over 856 checks: selfOrScholar 274 (32.0%), notRanger 308 (36.0%), away 216 (25.2%), trustLow 0, notAtHaven 0, engaged 0, onExped 1 (0.1%), eligible 57. Binding tally (the single condition that blocks the dawn): notRanger 26, away 22, selfOrScholar 9, selfOrScholar+notRanger 23, selfOrScholar+away+notRanger 3, selfOrScholar+away 3. Ranger split: ranger-holder dawns 40 (eligible-0 36), non-ranger-holder dawns 97 (eligible-0 50).

Marginals (Pop-A = Pop-B = 148): condition counts away 58, trustLow 0, notAtHaven 57, engaged 0, notRanger 120, onExped 18. Alone: notRanger 80, onExped 1, away 0, trustLow 0, notAtHaven 0, engaged 0. In combination: away 58, notAtHaven 57, notRanger 40, onExped 17. Unknown node 0, unknown profile 0, trust defaulted 0. This reproduces poolmarginals' shape on a fresh band: profile binds alone, away only in combination, trust never binds.

Instance buckets (instrument, 20 opened): launched 7, target-killed 1, selected-blocked 5, bid-not-selected 0, plan-churned-before-dawn 2, candidate-not-bid 5, unknown 0. Control (2 opened): launched 1, selected-blocked 1.

## Per-seed table

### Instrument leg (anchor 6ed5987ff; 0 errors)

| Seed | Days | End | Max wave | Standing | Scale | Instances | Launches | Scored dawns | S0-e0 | S1-e0 | S2-e0 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 102401 | 150 | survived | 5 | 380 | regional | 7 | 2 | 31 | 25 | 0 | 0 |
| 102402 | 149 | village-lost | 4 | 199 | regional | 5 | 3 | 32 | 20 | 0 | 2 |
| 102403 | 91 | village-lost | 4 | 135 | regional | 0 | 0 | 0 | 0 | 0 | 0 |
| 102404 | 150 | survived | 4 | 199 | regional | 0 | 0 | 0 | 0 | 0 | 0 |
| 102405 | 150 | survived | 4 | 199 | regional | 1 | 0 | 0 | 0 | 0 | 0 |
| 102406 | 150 | survived | 4 | 199 | regional | 1 | 1 | 7 | 4 | 0 | 0 |
| 102407 | 150 | survived | 4 | 199 | regional | 2 | 0 | 32 | 17 | 0 | 0 |
| 102408 | 138 | village-lost | 4 | 199 | regional | 4 | 1 | 35 | 20 | 0 | 0 |

### Control leg (anchor 498ecbe1e; 0 errors)

| Seed | Days | End | Max wave | Standing | Scale | Instances | Launches | Scored dawns | S0-e0 | S1-e0 | S2-e0 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 102401 | 128 | village-lost | 4 | 199 | regional | 0 | 0 | 0 | 0 | 0 | 0 |
| 102402 | 132 | village-lost | 4 | 199 | regional | 2 | 1 | 11 | 7 | 0 | 0 |
| 102403 | 91 | village-lost | 4 | 135 | regional | 0 | 0 | 0 | 0 | 0 | 0 |
| 102404 | 150 | survived | 4 | 199 | regional | 0 | 0 | 0 | 0 | 0 | 0 |
| 102405 | 141 | village-lost | 4 | 199 | regional | 0 | 0 | 0 | 0 | 0 | 0 |
| 102406 | 150 | survived | 5 | 475 | regional | 0 | 0 | 0 | 0 | 0 | 0 |
| 102407 | 150 | survived | 4 | 199 | regional | 0 | 0 | 0 | 0 | 0 | 0 |
| 102408 | 150 | survived | 5 | 325 | regional | 0 | 0 | 0 | 0 | 0 | 0 |

Notes: seed 102403 is identical on both legs (village lost day 91, no seed rows either leg). Seed 102404 is identical too (0 seed rows, survived 150 days). The scored dawns concentrate where plans open: 102401/102402/102407/102408 carry 130 of the 137.

## Guard metric (reported, not judged)

| | Control | Instrument |
|---|---|---|
| Expedition deaths | 168 | 229 (+61, +36%) |
| Total village deaths | 619 (77.4/run) | 710 (88.8/run, +15%) |
| Median survival | 145.5 days | 151 days |

Same cost signal as seedland/launchsurvive on this band (the same corpora family): the seed call sends more villagers out and more die out there, while median survival is flat-to-better. The cost is the seed call's, not the shadow's — the shadows are pure reads and change no trajectory (D2).

## Wall numbers

| | Control | Instrument |
|---|---|---|
| National by standing ≥ 200 | 2/8 | 1/8 |
| National by rank | 0/8 | 0/8 |
| Table (seat offered) | 0/8 | 0/8 |
| Wins | 0/8 | 0/8 |
| Wave-4 unlocked | 8/8 | 8/8 |
| Wave-5 unlocked | 2/8 | 1/8 |
| Median survival | 145.5d | 151d |

No village reached the table on either leg. The shadow numbers move nothing on the wall by themselves — they are the input to the design call, not a lever.

## Reachability

Wave 4 is reached by every village on both legs (8/8). Wave 5: 2/8 control, 1/8 instrument. The companion pool this arm measures is the wave-4 hunt pool; the wall past wave 4 stays shut.

## Village assessment (plain words)

The village has hunters with plans and almost never a second person to take along. On nearly two mornings in three, a villager wakes with a wave-4 hunt on their mind and nobody in the village who is allowed to go with them — not because nobody is home, and not because nobody trusts them, but because the people at home are foragers and homebodies, and the rule only takes wanderers and explorers. The foragers are right there, trusted, at Haven, doing nothing that morning. Widen the rule to foragers and the empty mornings nearly vanish. The village is not short of people; it is short of permission.

## Sense test

Sampled wave-4 fight lines from the instrument leg read like fights, not templates. Seed 102401, day 35 — Yuki Mori vs a Eulogy, 5 rounds, an ally charging in mid-fight:

> "Yuki has Sling but no arrows — the string stays drawn, useless."
> "R1: Yuki strikes for 9 (891 left)" / "R1: Epitaph hits Yuki for 11 (84 left)"
> "Yuki is losing — shouts for help! Patrick charges in!"
> "R3: Patrick strikes for 38 (833 left)" / "R5: Final Chapter hits Yuki for 16 (52 left)"

Same day, Hassan Ali vs a Eulogy, 3 rounds — he binds a wound mid-fight and flees, and the fight teaches him the trick (`trickAfter` true; Yuki's same-day fight did not). Seed 102401, day 37 — Jorge Silva sees a Reunion in time and gives it room (an evade, not a fight — the log says so plainly). 197 encounters in the instrument corpora, all with logs; wave-4 types present: strike 89, suburb 40, eulogy 38, reunion 37, herald 26, algorithm 20, congregation 11, eater 11, influencer 10, audit 5. The party reads like a party: allies charge in when called, and they are named.

## Metric review

- **S1's picks are overwhelmingly foragers, not homebodies** (95 forager vs 23 homebody of 137 picks; 69.3% vs 16.8%). The prereg's anticipated fork resolves toward foragers: the design call faces "admit foragers" as the live question, and S2 already answers most of it (84/86 dawns) without touching homebodies.
- **No residual blocker under S1.** Eligible-0 is exactly 0 under S1, so once profile is out of the way nothing else blocks at these dawns — away and notAtHaven never bind alone here (they bind only in combination in the marginals, and the S1-eligible-0 count of 0 settles it).
- **Plan-instance count 20 vs poolmarginals' 35.** Different band, no party/gate lever in this run; the shadows are judged on the scored dawns that occur (137), not on matching 35.
- **Control leg is small-n.** 11 scored dawns on a single seed (102402); the control comparison is directional only. The instrument leg carries the verdict.
- **Explorers are absent.** No explorer is ever eligible or picked under any shadow. The "ranger" pool on this band is wanderers only, and even wanderers number just 57 pooled eligible across 137 dawns.
- **The bid → launch leak is separate and larger than the gate.** 51 S0-biddable dawns produced 7 launches; 5 instances sit selected-blocked (3 selected-not-executed) and 5 candidate-not-bid. Even with the gate fixed, the launch path itself leaks most of its mornings. The next diagnostic should follow a biddable dawn through to the depart gate.

## Proof

`scripts/test-profileshadow-a.js`:

- On the instrument tip (seed call present): **80 passed, 0 failed** (~6.6 min). Static checks (verbatim seed call present, driver wraps, game-code diff exactly the 13-line call, scripts diff profileshadow-* only, wave-4 id set matches `src/data/monsters.json` exactly, `companionRank` pure-read), shadow-classifier unit fixtures (all edge profiles, trust boundary, exclusions, nesting, agreement, shape unknowns, identity distribution), recorder + replica-live checks, D1 + D2 green (seed 102401, 60d; D1 recorded 3 pool rows, 64 score rows, 15 `v4` seeds).
- Post-revert (`PROFILESHADOW_SEED_CALL=off`, seed call absent): **80 passed, 0 failed** (~4.7 min), re-run by the coordinator after the revert commit. (A first post-revert attempt against the uncommitted revert scored 79/80 — its single failure was the test's own staging check that the revert be committed, not a behavior check; committing the revert and re-running gives 80/80.)

D1/D2 determinism green in the proof; D3 smoke clean (analyzer + `vetparty-drift-check.js`, see bar 4).

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline …/telemetry-baselines/scale-wall.json --current 'evidence/2026-11-16/perseed-profileshadow-a-control/*.json' --metrics national,table,wins,exiled`

**Refused, as expected:** "refusing recorder-corpus input: all 8 --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs. Recorder corpora are compared with sweep-compare tables, never against a run baseline here." Recorded as a refusal. No `--allow-recorder-corpus` workaround used; the baseline was not rolled.

## Method notes (for the next arm)

- Driver: `scripts/profileshadow-driver-20261116.js` (`RUN=profileshadow-a`, `OUTDIR=perseed-profileshadow-a-<mode>`; refuses to overwrite existing per-seed files). Extends the poolmarginals driver: same vetfirst T-class instrument, same `v4seeds` / `v4departs` / `v4gates` / `v4encounters` recorder, same dawnbid bid/census capture, same companionPool first-fail + members capture, PLUS the `shadow` object (s0/s1/s2) on every pool row, computed from `pool.members` + `Game.companionRank` (pure read) at the same scored dawn.
- Analyzer: `scripts/analyze-profileshadow-a.js <instrumentDir> [controlDir]` — requires `analyze-poolmarginals-b.js` (not modified); writes `evidence/2026-11-16/profileshadow-a-analysis.json`; exits 0 iff unknown == 0, all files parse, no instrument errors, S0 agreement 100%.
- Drift check: `scripts/vetparty-drift-check.js` verbatim over the two corpora (first divergence on/after the first `v4seeds` day per seed).
- The next diagnostic needs the depart gate, not the pool: follow S0-biddable dawns through selection → execution and name why 5 sit selected-blocked and 5 never bid. It also needs a forager-admission lever to test: S2 as a real gate change, measured on launches (not just biddable dawns).

## Findings for the backlog

1. **Profile gate is the binding constraint (measured).** S0 eligible-0 62.8% → S1 0%, S2 1.5%. The forager widening alone recovers 84/86 empty dawns. Design call for Steve: admit foragers (S2), drop the gate (S1), or hold.
2. **Bid → launch leak (mechanism, unmeasured).** 51 S0-biddable dawns → 7 launches; 5 selected-blocked, 5 candidate-not-bid. The gate is not the only leak.
3. **Explorers absent from the eligible pool (observation).** 0 explorer picks under every shadow on this band; S0 picks are wanderer-only. If the design intends explorers as the core companion pool, the roster is not producing them at these dawns.

## Files

- Prereg: `evidence/2026-11-16/sim-profileshadow-a-prereg.md`
- Evidence (this file): `evidence/2026-11-16/sim-profileshadow-a.md`
- Analysis: `evidence/2026-11-16/profileshadow-a-analysis.json`
- Control corpora: `evidence/2026-11-16/perseed-profileshadow-a-control/` (8 files, anchor 498ecbe1e)
- Instrument corpora: `evidence/2026-11-16/perseed-profileshadow-a-on/` (8 files, anchor 6ed5987ff)
- Instrument: `scripts/profileshadow-driver-20261116.js`, `scripts/analyze-profileshadow-a.js`, `scripts/test-profileshadow-a.js`
- Seed call (reverted): verbatim 13-line VETPARTY block, blob a66d45a5e, in `resolveWildMonsterEncounter` before `if (rec.outcome === 'alreadyDead') {`.

## Convergence state

- This arm answers tracker blank #2 (companion pool / the profile-gate design call) for the winnability chain: the shadow numbers are measured, the instrument is valid, the gate is the binding constraint, and the forager widening is the narrow fix that recovers nearly everything.
- Poolmarginals + this arm agree: profile binds alone; away/trust/engaged do not. The design call is now a numbers question, not a guess.
- No game change ships from this arm. Ready to land, pending coordinator merge.
