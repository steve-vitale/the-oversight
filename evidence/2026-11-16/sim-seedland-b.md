# sim-seedland-b — LAND the vetparty seed call (evidence, NO-GO — reverted)

Run: fleshout-20261116T1515Z (Loop A, adoption of the 1315Z run, which died on
timeout + host write flap with the arm half-done). Axis: winnability chain,
tracker blank #1 — the seed-call landing BUILD.
Prereg (binding, frozen): `evidence/2026-11-16/sim-seedland-b-prereg.md` — read
it first; the bars below are its frozen bars, judged strictly.
Branch `sim-seedland-b`, worktree `~/workspace/worktrees/sim-seedland-b`.
Base: master `5eedd695b` at arm start. Master has since moved to `ef8bd7177`;
this arm did NOT rebase (coordinator owns the rebase at landing). Report the
base as `5eedd695b` + instrument + seed call; the coordinator re-runs proofs
after rebase.

## Verdict: NO-GO — the seed call is REVERTED, evidence-only

The seed call does what it was built to do — it plants plans (seed calls 6 →
69, plan instances 0 → 17, launches 0 → 3) — but the launched parties never
re-met their target, so the frozen kill bar stays at zero. All three launches
ended with the holder dying at home before any re-encounter. The seed call
ships nothing; `src/` is back to exactly the pre-seed-call state (game.js
blob `440ef1b40`, the same blob as base `5eedd695b`).

## The change, in plain words

A villager who faced a wave-4 beast in the wild, fought it, and ran away now
remembers it — the type is real, they know where it is, they survived it —
and plans to go back after that type with a party. That is the 13-line
VETPARTY seed-call block in `resolveWildMonsterEncounter` (game.js), re-landed
verbatim from the prereg on top of master, which already carries the gate fix
(PROFILEGATE bypass in villager-agency.js — verified present before the run).
The gate fix alone is inert without a seed source (gateconfirm: 1 launch on
12 seeds); the seed call was the missing first link. This arm judged whether
seed call + gate fix together produce launched-party wave-4 kills.

## Frozen bars (all four must pass for GO)

| Bar | Frozen threshold | On-leg result | Pass |
| --- | --- | --- | --- |
| 1. Launched-party wave-4+ kills | >= 1 on 8 seeds | **0** | **NO** |
| 2. Kill:death across launched wave-4+ meetings | >= 0.92 (0 deaths + kills >= 1 passes) | null (0 kills / 0 deaths) | **NO** |
| 3. Faced-not-killed share among wave-5-unlocked seeds | <= 0.20 (0 unlocked = FAIL) | **0.17 (1/6 unlocked)** | YES |
| 4. Cost: starvation <= control + 2 AND median survival >= 0.8x control | starvation 2 vs 2; survival 150.5 vs 150.5 | starvation 2, median 150.5 | YES |

Instrument validity (judged alongside the bars): 8/8 files parse on each leg,
0 instrument errors on each leg, attribution coverage 1.0 on-leg (control
null — 0 instances to attribute, as expected with no seed source). Valid.

## Legs (identical seeds, policy, horizon, driver, analyzer)

- Control: base as-is (seed call absent, gate fix present), anchor `bc9806fcd`.
- On: base + the 13-line seed call, anchor `e5e398153`.
- Seeds 102141–102148 (fresh band, coordinator-verified), competent verbatim
  policy (sha256 `74a890f0…`), 150d death-aware horizon, SEEDLAND=1 driver.
- The ONLY difference between legs is the 13-line seed call.

## Before / after numbers (identical seeds)

| Metric | Control | On |
| --- | --- | --- |
| Wave-4+ seed calls (`v4seeds` rows, wave >= 4) | 6 | 69 |
| Plan instances opened | 0 | 17 |
| Launches (dawnbid `launched`) | 0 | 3 |
| Launched-party wave-4+ meetings (any outcome) | 0 | 0 |
| Launched-party wave-4+ kills | 0 | 0 |
| Launched-party wave-4+ deaths | 0 | 0 |
| Expedition-origin wave-4+ encounters | 7 | 36 |
| Wave-5 unlocked seeds (maxWave >= 5) | 4 | 6 |
| Wave-5 class KILLED seeds | 0 | 3 (102144, 102146, 102147) |
| Faced-not-killed share | 0.75 (3/4) | 0.17 (1/6) |
| Starvation deaths | 2 | 2 |
| Median survival (gameDays) | 150.5 | 150.5 |
| Villages survived to 150d | 5/8 | 5/8 |
| Total village deaths | 612 | 720 |
| National by standing (>= 200) | 4/8 | 6/8 |
| National by scaleRank | 0/8 | 0/8 |
| Table / wins | 0 / 0 | 0 / 0 |

Per-seed on-leg: 102141 survived 151d maxWave 4 standing 199; 102142 survived
151d maxWave 5 standing 545; 102143 village-lost d102 maxWave 4 standing 175;
102144 village-lost d119 maxWave 5 standing 345; 102145 village-lost d150
maxWave 5 standing 515; 102146 survived 151d maxWave 5 standing 515; 102147
survived 150d maxWave 5 standing 535; 102148 survived 151d maxWave 5 standing
410. (Control per-seed: 150/151/144/89/151/133/151/152 days; maxWave 5,5,4,4,
4,5,5,4; standing 375/545/199/150/199/490/440/199.)

## What actually happened — the three launches

All three launches are on the on-leg (control had none). Every one ended with
the holder dying before the party ever re-met its target:

1. **Seed 102143 — Omar Farouk → Algorithm, companion gen_jetk4dt.**
   Seeded d70, launched d71, closed d73, closeKind holder-died. A 2-day
   window; no meeting inside it. The companion had already fled from an
   Algorithm on d53 — eighteen days BEFORE the launch — the only
   holder/companion meeting with the target in the whole run, and it fell
   outside the launch window (the analyzer's one window-excluded meeting).
2. **Seed 102147 — app_mgpsphmd698 → Herald, companion Hannah Kim.**
   Seeded d96, launched d98, closed d131, holder-died. A 33-day window; no
   launched-party meeting inside it at all. The holder did meet an Editor on
   expedition on d110 (evaded) — wrong target, so it does not count.
3. **Seed 102147 — Greta Hansen → Suburb, companion Mateo Alvarez.**
   Seeded d123, launched d124, closed d137, holder-died. A 13-day window; no
   meeting inside it. Greta died on d137 — the same day the feed records her
   putting down The Loud Beast on camera at the village door. She died
   defending home, not on the hunt.

The pattern is consistent: the seed call opens plans and the gate fix lets
them launch, but the launched holder dies at home (all three closeKinds are
holder-died) before the party re-encounters the target in the wild. The
launch is real; the re-encounter is not.

## Why the launches stall before the kill (the numbers behind the NO-GO)

- **No companion party is the binding blocker at dawn.** Of 17 instances: 3
  launched, 3 plan-churned-before-dawn (1 holder-died, 2 retargeted), 11
  candidate-not-bid — all 11 with sub `no-companion-party`. Of 100 scored
  dawns, 90 had ZERO eligible companions (eligible0Share 0.90). First-fail
  shares: notRanger 0.42, selfOrScholar 0.29, away 0.27. Binding shares:
  notRanger alone 0.56, away alone 0.22. The pool is empty even after the
  gate fix, because the fix only bypasses the profile skip for bid-and-
  selected `party_launch` commits — the companions still have to be alive,
  at the haven, and not away.
- **The seed call is not the bottleneck anymore.** Seed calls rose 6 → 69
  (the 6 on control come from the three pre-existing `winPlanSeedFromFight`
  call sites in villager-agency.js:660/743 and win-plan.js:512 — evade/flee/
  avoid paths that already existed on master). Instances 0 → 17, launches
  0 → 3. The seed source works. What fails is everything downstream of the
  launch: finding the beast again, and the holder living long enough to do it.
- **Wave-5 kills happened anyway — but not through launched parties.** Three
  seeds reached KILLED class on-leg (control: 0): s102144 (Rerun d79 and
  Editor d97, both via the player's party), s102146 (Finale Crew d143, a
  wild world-tick kill by visjoin_116), s102147 (Finale Crew d141 wild,
  Spoiler d143 in an aid crisis, both by Elena Petrova). That is why bar 3
  passes while bar 1 fails: the chain's later links can fire through wild
  and aid fights, but the launched-party link — the one this arm was built
  to prove — produced zero meetings.

## Cost of the seed call (secondary, not a frozen bar)

The panel compare (`evidence/2026-11-16/seedland-b-panel.md`,
decision `review_required`) flags one regression signal: village deaths per
run 76.5 → 90 (+13.5, 95% exploratory interval 2.6 to 25.1). Death-cause
shares explain it — expedition deaths rose 98 → 189 (16% → 26% of all
deaths) while starvation stayed flat (2 vs 2) and median survival identical
(150.5 vs 150.5). The seed call sends more villagers out on expeditions and
more of them die out there; villages do not die sooner on the median, they
just lose more people. Worth carrying into the next arm: any fix that makes
launches meet their target will also raise expedition exposure, so the
kill:death bar and the death count have to be watched together.

Control death shares (612 deaths): villager combat 296 (48%), combat 116
(19%), expedition 98 (16%), the wild 50 (8%), monster 19, starvation 2.
On-leg shares (720 deaths): villager combat 314 (44%), expedition 189 (26%),
combat 112 (16%), the wild 36 (5%), monster 24, starvation 2.

## Wall numbers (reported every run, not judged)

| | Control | On |
| --- | --- | --- |
| National by standing (>= 200) | 4/8 | 6/8 |
| National by scaleRank | 0/8 | 0/8 |
| Table (seat taken) | 0 | 0 |
| Wins | 0 | 0 |
| Wave-4 unlocked | 8/8 | 8/8 |
| Wave-5 unlocked | 4/8 | 6/8 |
| Median survival | 150.5d | 150.5d |

The scale wall stands: no seed reaches national by rank, no table, no wins.
Standing-only national moved 4 → 6, and wave-5 unlocks 4 → 6, but the rank
bar — the one that gates the table — did not move.

## Reachability verdict

- Waves 1–4: reached on all 8 seeds both legs. Wave 5: reached on 6/8 on-leg
  (4/8 control). Wave-5 kills: 3/8 on-leg, all outside launched parties.
- Regional: all 8 seeds both legs. National by standing: 6/8 on-leg.
  National by rank, the table, the win flag: 0/8 — still decoration at this
  horizon for this policy.
- The launched-party re-engagement path (seed → plan → launch → re-meet →
  kill) is now measured end to end for the first time: it reaches "launch"
  and dies there. The kill step is unreached, not merely rare.

## Village assessment (plain words)

Five of eight villages lived to day 150 on both legs; the other three were
lost between days 89 and 150. The villages that lived ended with full
pantries on some seeds (10,786 and 15,006 kcal on s102146/s102147) and nearly
empty ones on others (1,150 kcal on s102141) — food is not what kills them
anymore at this horizon; fighting is. Villagers do plan: on the on-leg they
seeded 69 return plans, opened 17, and launched 3 hunting parties after
beasts they had already survived once. That is new behavior that reads like
people remembering a scare and going back prepared. But the plan dies with
the planner: all three launched holders were dead within 2–33 days, killed
defending the village door, and their parties never found the beast again.
The village that lost Omar on day 73 had watched him teach everyone about
European Elder the day before — knowledge spreads, people die, the plan
does not outlive them. The blank this run fills is a measured one: the
seed-call link of the chain is proven working and is NOT the binding link
anymore. The binding link is now launch survival + re-encounter: holders
must live through the launch window, and the party must actually find the
beast it set out after.

## Sense test (read the transcripts)

Sampled `vetSays` around the launches. The lines are event-tied and varied,
not templated loops:

- s102147 d97: "SYSTEM: Oh — OH. Everybody saw that, right? Mateo just put
  down The Herald... on CAMERA. That's a veteran kill, folks. REMEMBER the
  name." — Mateo kills a Herald at the door the day before Greta's launch
  names him companion. Coherent: the village's proven killer gets picked.
- s102147 d130: "Mateo, Greta, Ruia and Elena met them at the door — 2 put
  down, 2 barely walked away." d131: "Blooded — the village knows where the
  Producers bleed." d137: Greta puts down The Loud Beast on camera — and
  dies the same day. The feed tells a real story: the holder who was
  supposed to be out hunting the Suburb died at the door instead.
- s102143 d72: "Village knowledge: Omar taught everyone about European
  Elder. The Codex grows without you lifting a finger." — teaching spreads;
  Omar dies the next day. No robotic repetition found in the sampled lines.

## Metric review (prereg §, to be filled here)

- **Instance-lifetime window vs gatelever duration window:** the window
  admitted 0 launched-party meetings and excluded 1 — the d53 companion
  flee, 18 days before its launch. That meeting is a genuine pre-launch
  encounter (the companion had already faced the target and fled), so the
  window choice is load-bearing in principle but did NOT turn any bar here:
  even counting it, launched kills stay 0 and bar 1 still fails. The
  window is honest; the launches simply produced no in-window meetings.
- **Wave-5 class adaptation (maxWave-only unlock, no deed series):** no
  seed's class turns on the adaptation in a way I can check from these
  corpora — the corpora carry no deed series, so the event-based half
  cannot run. The 3 KILLED classes rest on real wave-5 killCalls rows
  (listed above), not on the adaptation. The 1 FACED-NOT-KILLED seed
  (102145) faced wave-5 in encounters with no wave-5 killCall; that class
  is the same under either definition.
- **Origin taxonomy:** 0 `unclassified` rows, 0 `other:<fn>` rows on either
  leg. Origins on-leg: expedition 36, aid 60, world-tick 79 (control:
  expedition 7, aid 64, world-tick 79). The expedition share of wave-4+
  encounters rose 7 → 36 with the seed call — the expected signature of
  villagers going back out after beasts.
- **D3 drift smoke:** first divergence day vs first world-tick seed day
  per seed: 102141 38 vs 36, 102142 null vs 137, 102143 34 vs 33, 102144
  28 vs 27, 102145 54 vs 50, 102146 93 vs 91, 102147 40 vs 39, 102148 31
  vs 29. `divergesBeforeFirstSeed: false` on all 7 diverging seeds —
  trajectories diverge only after the first seed fires, as expected. No
  pre-seed divergence; the seed call is the cause of the divergence.
- **Bar 2 with 0/0:** the frozen rule (zero denominator passes only with
  kills >= 1) behaved as written — a 0/0 leg cannot pass a kill:death bar,
  which is correct: no meetings means no evidence about fight outcomes.
- **Panel as instrument:** the balanced panel is the instrument and the
  frozen bars are the judge. The panel's `review_required` (deaths
  regression signal) does not override the frozen verdict — it is
  reported above as a secondary cost signal, not a bar.

## Proof test

`scripts/test-seedland-b.js`: 40/40 green on the on-tip (after one fixture
fix, below) and 40/40 green post-revert (re-run after the revert commit;
see commit note). Static checks confirm the seed call verbatim from the
prereg on the on-tip and absent with `src/` diff 0 post-revert; judge
fixtures cover the launch window, distinct meetings, kill:death incl.
zero-denominator pass, wave-5 classes incl. 0-unlocked null, origin
classification; D1/D2 determinism at 60d on seed 102141 green.

**Fixture fix (test-only, committed with this evidence):** the J5 full-GO
fixture failed on first run (39/40) because its control leg was built from
raw `baseSeed()` objects, which carry no `starvation` field — `legOf`
summed `undefined` into `NaN`, so the cost bar compared against
`NaN + 2` and failed. The judge was correct; the fixture was wrong. Fixed
by wrapping all three `legOf([baseSeed(...)])` control legs in
`ANALYZE.analyzeSeedlandSeed(...)`, the same as the on legs. No judge, game,
or analyzer code changed. Root cause, not a waived assertion.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-16/perseed-seedland-b-control/*.json' --metrics
national,table,wins,exiled` — refused, as the prereg expected (seedpaths
precedent): "telemetry-check: refusing recorder-corpus input: all 8
--current rows carry top-level anchorCommit, so they are sweep recorder
rows, not runs. Recorder corpora are compared with sweep-compare tables,
never against a run baseline here." Refusal recorded, not worked around
(no `--allow-recorder-corpus`, no `--update-baseline`). Note the loop
body's `<per-seed-evidence-glob>` form does not match this checker's glob
(it supports `*` in the basename only) — the first attempt matched no
files and printed LOUD for that reason alone; the dir glob above is the
real check. No LOUD deviation lines to investigate; the wall numbers above
are the deviation record (national-by-standing 4 → 6, wave-5 4 → 6,
rank/table/wins 0).

## Files

- Prereg (frozen): `evidence/2026-11-16/sim-seedland-b-prereg.md`
- Control corpora: `evidence/2026-11-16/perseed-seedland-b-control/` (8/8,
  anchor `bc9806fcd`)
- On corpora: `evidence/2026-11-16/perseed-seedland-b-on/` (8/8, anchor
  `e5e398153`, errors 0)
- Analysis: `evidence/2026-11-16/seedland-b-analysis.json` (judgment NO-GO)
- Panel: `evidence/2026-11-16/seedland-b-panel.md` (+ `.json`,
  `-before/-after.json.gz`; decision `review_required`)
- This evidence: `evidence/2026-11-16/sim-seedland-b.md`
- Instrument: `scripts/seedpaths-driver-20261116.js` (SEEDLAND=1 extension),
  `scripts/analyze-seedland-b.js`, `scripts/test-seedland-b.js` (fixture
  fix), `scripts/build-seedland-panels-20261116.js`
- Revert: the 13-line seed call removed from `src/js/game.js`;
  `src/` diff vs base `5eedd695b` is 0 after the revert commit.

## Findings backlog (appended to the loop's sim-findings.md by the coordinator)

- [open] 2026-11-16 — winnability chain / launched-party re-encounter —
  launched parties never re-meet their target: 3/3 launches closed
  holder-died within 2–33 days, 0 in-window meetings. Next arm: holder
  survival through the launch window and/or target re-encounter (the party
  must be able to FIND the beast it set out after). (sim-seedland-b)
- [open] 2026-11-16 — winnability chain / companion pool — 11/17 plan
  instances die candidate-not-bid with `no-companion-party`; 90% of scored
  dawns have zero eligible companions (notRanger 0.42, away 0.27 first-fail
  shares). The gate fix opens the launch; the pool is still empty.
  (sim-seedland-b)
- [open] 2026-11-16 — winnability chain / expedition cost — seed call
  raises expedition deaths 98 → 189 and village deaths/run 76.5 → 90
  (panel regression signal) with median survival flat. Any arm that makes
  launches meet their target must watch expedition deaths alongside
  kill:death. (sim-seedland-b)

## Convergence state

Axis winnability chain, tracker blank #1 (seed-call landing BUILD):
**killed-at-pilot** for the landing as built — the seed call is reverted and
does not ship. The seed source itself is proven working (it is no longer the
binding link); the chain's next binding link is launch survival +
re-encounter, per the findings above. No 12–16 seed confirm: the pilot
failed bars 1–2 outright, so no confirm spend is warranted.
