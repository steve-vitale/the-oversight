# sim-departfit-b — BUILD: departure-fitness check (arm + load before launch)

## 1. Verdict — GO (pilot, frozen bars B1–B5 all pass)

The departure-fitness check works as designed: launched parties now
depart with loaded bows (post-load loaded share 60/62 = **96.8%**,
baseline 56/105 = 53.3%), launch count holds inside the guardrail
(110 vs 137 = **0.80**, floor 0.75), survival is a touch better
(median 151d vs 149d), and no death-cause share moves more than
6.3pp. The check loads carriers where ammo exists (18 loaded by the
check) and holds where it does not (1,100 no-ammo holds).

The GO carries a named cost, not a hidden one: on two ammo-starved
seeds the unbounded hold strands the win plan in a re-bid loop
(111302: 146 holds, 4 launches; 111305: 944 holds, 1 launch). The
aggregate launch count still passes only because 111301's village
survives instead of dying (6 → 22 launches). The next arm is the
softer hold the prereg named (hold only when ALL ranged carriers are
dry, or hold N days then launch anyway) — this GO lands the check as
built; it does not claim the hold is finished.

## 2. Prereg (frozen, no amendments)

Prereg: `evidence/2026-11-27/sim-departfit-b-prereg.md` (frozen before
any judged sim; committed 8a0340a7d). Seeds 111301–111308, competent
verbatim, 150d death-aware, no env flags. Paired legs on identical
seeds: BASELINE = pre-lever master (instrument only), PILOT = +
departure-fitness check. Confirm prereg (16-seed extension band
111401–111416):
`evidence/2026-11-27/sim-departfit-b-confirm-prereg.md`.

## 3. Method

- Lever (`src/js/villager-brain.js`, +~150 lines): `Game.winPlanDepartFitness(vid, members)` — per launch member, gear up if unarmed (`villagerGearUp` + `villagerStageBow`, then re-read) and pocket ammo if a volley carrier is dry (`villagerPocketAmmo`, then re-read). Still unarmed or still dry → fail. Called in `vbrainExecuteDepart`'s `party_launch` branch only, after the dead-target re-seed check and before any `startExpedition`; a fail holds with `holdVoice(..., 'no-ammo')` (new kind: "<Name> will not send out a bow with an empty quiver — there is nothing left to load it with — the party waits.") and returns `'hold'`. No HP gate anywhere. Members: holder + commit companions (companion2/3 only under their env flags, mirroring the launch code; both off here). The solo-EXPEDITION branch and `winPlanDepart` are untouched. Telemetry: `village.departFit` counters + `departFitByVid`.
- Instrument: `scripts/departfit-b-instrument.js` — the launchfit stamp plus a POST-call stamp (members re-read after the departure call returns). The launchfit 57.1% was a PRE-load read (before gear-up/pocket run inside `startExpedition`); the primary metric is the POST-load share, the true departure loadout.
- Driver: `scripts/departfit-driver-b.js` (one process per seed; counts `ammo_craft` / `weapon_craft` telemetry events; records deaths with causes + `departFit` snapshot). Analyzer: `scripts/analyze-departfit-b.js`. Panel builder: `scripts/build-departfit-panels-b.js`.
- Proof: `scripts/test-departfit-b.js` — **14/14 PASS** (instrument pre/post stamps, analyzer on synthetic paired corpus, check on a fake Game: loads a dry carrier, fails no-ammo, spear needs no ammo, HP never gates, unarmed fails kit, player read-only, one pocket attempt per member at most, full depart path holds dry with the voiced line and launches when loaded; T5 real-corpus self-check green on both legs).
- `node scripts/check-wired.js src/js/villager-brain.js`: 0 unwired. `node scripts/validate-ontology.js`: 138 systems validated (docs/ONTOLOGY.md regen committed alongside). `node scripts/check.js --quick`: **339 passed, 5 failed** — the documented standing master set (journey-establishment-r245, 2026-11-20): measurement-proof-update + measurement-workflow (proof staleness, re-sign round 22 still owed), phone-frame-proof (stale receipt), living-garden + one-person-army deed-attainment (120s timeouts under load). 0 attributable to this arm.

## 4. Results (judged only against the frozen bars)

| Bar | Result |
|---|---|
| B1 post-load loaded share ≥ 0.80 (arm launches) | **PASS** — 60/62 = 0.968 (baseline post-load 56/105 = 0.533; arm pre-load 45/62 = 0.726) |
| B2 launches within ±25% of baseline | **PASS** — 110 vs 137 = 0.803 (floor 0.75; margin is thin — see §5) |
| B3 median survival not worse by > 10d | **PASS** — 151d vs 149d (+2d) |
| B4 no death-cause share moves > 15pp | **PASS** — worst 'expedition' 33.8% → 27.5% (6.3pp); deaths 691 vs 683 |
| B5 0 instrument errors; determinism byte-identical | **PASS** — 0 errors both legs; seed 111301 re-run per leg: arm `cmp` byte-identical; ctl identical excluding the run-metadata labels (`anchorCommit` moved with the commits made between legs; all sim output identical) |

## 5. The distributions

**Loaded share (launches):** baseline pre-load 50/105 = 47.6%, post-load 56/105 = 53.3% — the departure loaders lift the share only ~6 points, so the famine is REAL, not a stamp-timing artifact (the correction mattered, but the answer didn't flip). Arm pre-load 45/62 = 72.6%, post-load 60/62 = 96.8%. The two carriers that still read dry on the arm leg (2/62) are NOT check misses: both are `plan.party` members who are NOT the commit's companion — Ayana Mamyrova (111301 d13, crossbow, 0 bolts) and Jovan Milic (111308 d21, bow, 0 arrows). The launch code only starts expeditions for the holder + commit companions (+ a handoff walker when the holder cannot walk), while the instrument stamps holder + `plan.party` + commit companions — so the instrument carries stale `plan.party` entries from an earlier stage into the stamp, and the check (holder + commit companions, exactly the set the launch starts) never sees them. Whether they walked out on these departures cannot be told from the corpus (the instrument stamps the plan's party list, not expedition records). So 96.8% is the frozen-metric read on the instrument's list; on the launch's own member set it is 60/60. The instrument's member list should be tightened to the launched set in a follow-up — and the same over-inclusion biases the launchfit/baseline shares downward (stale members are never loaded at departure), so 53.3% is a floor on the true walker share, not the share itself. The cleaner famine evidence is the check's own telemetry: 1,100 no-ammo holds. Armed share (post) median 1.0 both legs (arm min 0.5 on one launch). HP (post) median 84 arm vs 87 ctl, share < 50 HP 8.0% vs 7.7% — the check does not gate HP and the HP shape doesn't move.

**Per-seed (launches / holds; departFit checked / loadedByCheck / heldNoAmmo):**

| Seed | ctl L/H | arm L/H | arm check |
|---|---|---|---|
| 111301 | 6 / 10 | 22 / 1 | 22 / 5 / 1 — village-lost d99 → survived 150d; the check loads carriers and the village lives to launch more |
| 111302 | 10 / 2 | 4 / 150 | 150 / 1 / 146 — hold loop: the village has no loadable ammo; the same dry party re-bids every tick |
| 111303 | 0 / 12 | 0 / 12 | never fired (departFit null) — byte-identical to baseline; no party_launch ever bids |
| 111304 | 1 / 13 | 1 / 13 | 1 / 0 / 0 — the single launch was already loaded |
| 111305 | 23 / 0 | 1 / 944 | 945 / 2 / 944 — hold loop, worst case: 23 launches → 1 |
| 111306 | 17 / 2 | 17 / 2 | 19 / 0 / 0 — byte-identical; well-stocked, check passes through |
| 111307 | 36 / 10 | 36 / 10 | 38 / 0 / 0 — byte-identical; well-stocked, check passes through |
| 111308 | 44 / 5 | 29 / 12 | 39 / 10 / 9 — the check loads 10, holds 9 times, launches 29 |

**The hold loop, plainly:** a held launch re-bids on every agency tick (~6/day), so a stranded village spins the check hundreds of times (945 on 111305). The checks are cheap reads — `villagerPocketAmmo` returns early with no materials to take or craft from (only 3 `ammo_craft` attempts on 111305 all run) — but the win plan never progresses while the village has no ammo to find. The voice dedups to once per holder-day (with the wear bands), so the player hears the hold once a day, not 6 times. A future refinement could check once per day instead of per tick; the softer hold is the named next arm either way.

**Double-craft interaction (measured, prereg §1):** `ammo_craft` attempts 176 arm vs 173 ctl (+3 total) — negligible. The check's earlier attempt rarely buys a second craft because famine villages have nothing to craft with and stocked villages load from stash/pile. `weapon_craft` 48 vs 40 (bow staging inside the check's gear-up path on a few members).

**Selection note on B1:** the arm's launches carry only 62 ranged carriers vs the baseline's 105 — the denominator is selected launches (dry carriers never launch, so they never count). The 96.8% is the lever working as designed (load + hold), not a pure load effect: pre-load share on arm launches is already 72.6% vs 47.6% baseline (selection), and the check's loads + holds supply the rest.

## 6. Sense-test

The check reads as people deciding, not a ledger. The proven line (T13): "Mara will not send out a bow with an empty quiver — there is nothing left to load it with — the party waits." One line per holder-day, wearing over consecutive held days ("another day gone", "the wait wearing thin", "so many days now") — a village that cannot arm its bows waits visibly, and the wait itself becomes the story. The stranded villages (111302, 111305) are the honest cost: they survive, they stand at regional with standing 340 / 199, but their win plan sits at Haven day after day because no arrows or stones can be found — that is a loadout failure the village can see, not a silent stall. The sim corpus does not retain spoken lines (quietLog), so the line itself is proven by the fixture test, not by a corpus grep; the hold counts and the once-a-day voice are the corpus evidence. The three byte-identical seeds (111303, 111306, 111307) are the scoping proof: where the check never fires or the village is stocked, nothing changes at all.

## 7. Wall numbers (both legs — competent verbatim, 150d, 8 seeds)

| | ctl | arm |
|---|---|---|
| Wins | 0/8 | 0/8 |
| National | 0/8 | 0/8 |
| Table (waiting-or-done flag) | 7/8 | 7/8 |
| Wave-4 unlocked | 8/8 | 8/8 |
| Wave-5 unlocked | 3/8 | 3/8 |
| Median survival | 149d | 151d |
| Deaths | 683 | 691 |

The wall doesn't move: no village reaches national, none wins, on either leg. The check fixes departure loadout, not the scale on-ramp.

Panel (§15): `node scripts/balance-panel.js compare` → decision `review_required`; no material signal on any metric (table sitting 0.875 → 0.875, national 0 → 0, wins 0 → 0, community loss 0.375 → 0.125 with the interval covering 0, village deaths 85.375 → 86.375 `regression_watch` with the interval covering 0). The panel confirms the legs are the same villages; the frozen bars are the judge.

Telemetry deviation check: the default invocation REFUSES this corpus by design (recorder-corpus guard: per-seed files carry top-level `anchorCommit`; the 2026-10-25 audit rule says recorder corpora are never compared against run baselines). With `--sweep-rows --allow-recorder-corpus` it reproduces the launchfit artifact exactly: LOUD national 12 → 0 and wins 16 → 0, table 7/8 quiet. Per the baseline's own `_regime` note this is the documented regime artifact (baseline = win-seat full-stack regime, 16/16 wins; this band = competent verbatim with no seat stack, wins structurally ~0). No investigation item.

## 8. Blanks filled / documented, and metric review

**Filled (landed in this arm):** the departure-fitness check — armed + loaded before launch, in the brain departure path, voiced, no HP gate. The launchfit blank is closed: parties no longer depart with dry bows where ammo can be found (loaded 96.8%), and where it cannot be found they wait and say so instead of walking out dry.

**Documented (not fixed here):**
- The unbounded hold strands ammo-starved villages (111302, 111305: 1,090 of the 1,100 no-ammo holds). Next arm (named in the prereg): the softer hold — hold only when ALL ranged carriers are dry, or hold N days then launch anyway.
- The held launch re-bids every agency tick (~6 checks/day while held). Cheap but churny; a once-per-day check is a possible refinement alongside the softer hold.
- Two carriers still read dry on the arm leg (2/62) — both are stale `plan.party` entries outside the check's member list (see §5), not check misses. The instrument's member list (holder + plan.party + commit companions) should be tightened to the launched set in a follow-up; the same over-inclusion biases the launchfit/baseline shares downward.

**Metric review (frozen bars NOT re-scored):** B1's denominator is selected launches (see §5) — a future prereg for a hold lever should pre-register the launch-count and the loaded share together, or the share will always flatter a holding lever. B2's aggregate threshold passed at 0.803 but masks a bimodal per-seed story (two villages stranded, one saved) — the aggregate is the frozen judge and it passed, but per-seed hold counts belong in the evidence for any hold lever (they are here). The post-load stamp did its job twice over: it corrected the launchfit read (53.3% true baseline vs 47.6% pre-load) and it is the only share that can judge a load-at-departure lever. The telemetry-check prescription needs a fix for recorder corpora (default invocation refuses; the allowed invocation reproduces a known regime artifact) — future preregs should name the panel compare as the §15 artifact and the telemetry check as the regime-artifact read, not a live investigation trigger.

## 9. Closeout state

- Branch `sim-departfit-b`, HEAD `bece5f46f` (pilot corpus + analysis + panel + reruns). Commits: prereg 8a0340a7d, instrument+driver+analyzer+panel builder+proof  c357b13a5, baseline corpus daf148c13, lever + proof 14/14 5a288c977, ontology regen dba51677b, pilot corpus bece5f46f. (An empty commit 9c529fd1a from a safe-commit directory-path slip was reset --soft on this private branch and recommitted with explicit files; reflog retains it. The safe-commit index clobber struck on every commit this run — repaired each time via the ls-tree/update-index route; every commit verified correct, tree clean.)
- Proof test green on the run (14/14, T5 real-corpus check included).
- **Verdict for the coordinator: GO (pilot).** Confirm staged: 16-seed extension band 111401–111416, prereg frozen in `sim-departfit-b-confirm-prereg.md` (verify freshness + commit before the confirm legs run; the ctl leg needs the pre-lever `villager-brain.js`, same swap as the determinism rerun). No 12–16 seed confirm has run yet — a GO has nothing to confirm until it does.
- **Ready to merge, pending ship.** Do NOT push, do NOT bump versions. The ship loop owns deploys. Per the frozen NO-GO ladder this is a GO, so the game code STAYS (killed arms leave no trace; this one lives).

## 10. Files

- `evidence/2026-11-27/sim-departfit-b-prereg.md` (8a0340a7d)
- `evidence/2026-11-27/sim-departfit-b-confirm-prereg.md` (staged, see §9)
- `scripts/departfit-b-instrument.js`, `scripts/departfit-driver-b.js`, `scripts/analyze-departfit-b.js`, `scripts/build-departfit-panels-b.js`, `scripts/test-departfit-b.js` (c357b13a5, test extended 5a288c977)
- `src/js/villager-brain.js` — `winPlanDepartFitness` + call site + `holdVoice` 'no-ammo' kind (5a288c977); `docs/ONTOLOGY.md` regen (dba51677b)
- `evidence/2026-11-27/perseed-departfit-b-ctl/departfit-b-s11130[1-8].json` (daf148c13)
- `evidence/2026-11-27/perseed-departfit-b-arm/departfit-b-s11130[1-8].json` (bece5f46f)
- `evidence/2026-11-27/perseed-departfit-b-ctl-rerun/departfit-b-s111301.json`, `...-arm-rerun/departfit-b-s111301.json` (bece5f46f)
- `evidence/2026-11-27/departfit-b-analysis.json`, `departfit-b-panel-before.json.gz`, `departfit-b-panel-after.json.gz`, `departfit-b-panel.json`, `departfit-b-panel.md` (bece5f46f)
- This evidence file: `evidence/2026-11-27/sim-departfit-b.md`
