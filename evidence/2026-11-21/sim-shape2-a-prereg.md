# sim-shape2-a — prereg (FROZEN before any judged sim)

- **Arm:** sim-shape2-a · **Loop A run:** fleshout-20261121T0715Z · **Axis:** scale-onramp
- **Findings:** #2628 (lend pool empty — holder population empty) / #2599 (searcaster that can never fire) / #2635 (granted gun vanishes when its holder dies — STAYS OPEN, ride-along recording only)
- **Base master:** `9070aaf70` (Loop A lever round record: leadside NO-GO PARTICIPATION + evadebow DIAG-GO, both merged). Worktree `~/workspace/worktrees/sim-shape2-a` (branch `sim-shape2-a`).
- **Question:** at a wave-4+ fight launch, draft a living armed holder as the lead fighter — the launch rule goes and fetches them as lead even when they are not the natural lead and not in earshot.
- **Canon:** no canon doc covers the searcaster / contest-prize / lend / holder-presence / draft rules specifically (same as the leadside/lendpool preregs record); rules below are cited from code only.

## 1. The chain that names this lever — verified from the evidence, not assumed

Shape 1 (leadside, evidence/2026-11-21/sim-leadside-a.md, NO-GO PARTICIPATION, band 107141–107148) put the gun in the hands of the villagers who already lead wave-4+ fights and changed literally nothing: 111 wave-4+ launches, **armed leads 0, armed volleys 0** on both legs, identical on every participation number. Its falsifier fired exactly as written: "the binding constraint is that holders never REACH a fight as leads at all (sheltered / not on the tile / not drafted), and the next lever is shape 2 (draft-armed-holder-as-lead), not a stronger redirect weight." A stronger redirect weight is NOT re-tried.

Lendpool (evidence/2026-11-21/sim-lendpool-a.md, DIAG-GO, band 107111–107118) quantified why: at 130/141 unarmed-lead wave-4+ launches there was **no living armed holder anywhere in the village**; earshot base rate armed 4.9%, eligible 1.4%.

Leadside's band numbers bound this arm's reachable population (both legs identical):
- Meetings (fieldFight rows, wave 4+): 183 — expedition-holder 58, aid 65, world-tick 60.
- Near-miss launches (world-tick through `resolveWildMonsterEncounter`, non-raid): 111, **all unarmed leads**, 95 with no living holder, 16 holder-present — and the nearest holder was **sheltered in all 16**.
- Armed-holder entries 21 (the gun arrives as a passenger, never as the leader); 11 of the 21 end in a flee.

## 2. The lever (frozen design): SHAPE2 — draft-armed-holder-as-lead

**`SHAPE2=1` (default OFF, env-gated, node sims only). One decision function, two call sites:**

**The decision — `Game._shape2DraftLead(vid, mdef, opts)`** (new method in `src/js/game.js`, beside `_lendSearcaster`). Pure roster scan, **zero `Math.random()` draws**. Returns `{ lead, drafted, holder, tier, missReason, candidates }` — `lead` is the villager id to fight as lead (the drafted holder, or the natural lead when no draft fires); `candidates` lists every living armed holder considered with their first failing eligibility filter, so the miss reason is auditable, never a bare code.

- **"Armed" (frozen, from the lendpool/leadside instruments):** Tier 1 gun = searcaster in the equipped ranged slot + ≥1 fusion cell in pack; Tier 2 bow = any ranged weapon with an ammo id + ≥1 of that ammo in pack (bow/crossbow/starfall_bow/apex_bow + arrows/bolts). Kit/ammo reads mirror the driver's `rangedKitOf`/`ammoCountOf` and the game's `isArmedHolder` shape. Pick: first roster-order Tier-1 holder passing eligibility; else first roster-order Tier-2 holder passing eligibility.
- **Eligibility (frozen — every filter must hold):** living roster villager; never the scholar (never picked as holder, and a scholar natural lead is never replaced); not the natural lead; health > 20 (undefined health passes, mirroring `isArmedHolder`); not sheltered; not post-flee resting; not sick; range (`npcMaxDist`) ≥ 1. **No earshot / location requirement** — the draft fetches from anywhere in the village; that is the shape's point.
- **The draft fires only when the natural lead is NOT armed** (neither tier). An already-armed lead leads their own fight; no swap, no record beyond a `lead-already-armed` decision row.
- **Miss reasons (frozen set):** `lead-already-armed` | `no-living-holder` (no living holder by kit in either tier) | `gun:<filter>` / `bow:<filter>` (holders existed in that tier but none passed eligibility; `<filter>` is the first failing filter of the best tier's first roster-order candidate — `sheltered`, `resting`, `low-health`, `sick`, `range0`, `dead` never reaches here) | `not-wave4` | `raid` | `aid` | `scholar-lead` | `off`.

**Call site 1 — `Game.resolveWildMonsterEncounter` (`src/js/game.js`, ~line 21362).** After the post-flee-rest early return on the NATURAL lead (a resting lead means no encounter at all — no draft conjures a fight), before the entry-HP / person / allies reads, so those reads follow the drafted lead. The head reorder moves pure reads only (monster-def read + aid-routing read move above the draft; the post-flee check moves to the top). Skipped when `opts.raid` or aid-routed (`wViaAid` — the aided villager IS the lead; the fight is about them). The WILDAVOID check and the `_lendSearcaster` call then see the drafted lead (composition: a drafted armed lead needs no lend; the lend stays OFF in this arm anyway).

**Call site 2 — `villager-agency.js` `expeditionMonster` (~line 619).** After the monster pick (wave known), before the `agencyOf(vid)` capture and the `winPlanFightGate` + `fieldFight` calls; when the vid changes, `agencyOf` is re-captured for the drafted holder (it returns the shared agency state and initializes the holder's know/xp maps). All post-fight bookkeeping (`winPlanNoteFight`, `winPlanNoteKill`, `recordWaveKill`, `hurtVillager`, agency know/xp) follows the drafted lead — the holder genuinely led, so the holder gets the outcome. `winPlanNoteFight`/`winPlanNoteKill` already null-check a missing plan, so a holder with no plan is safe. No new plan-store ignition path: `winPlanNoteKill` already runs on every expedition kill today; the draft only changes WHOSE kill it records.

### 2a. Why NOT the win-plan launch hook (the brief's "likely touch points")

Read the code — party launch does not fix fight lead, so a `win-plan.js` `launchParty` / `companionLaunchable` draft cannot produce armed leads:

- `launchParty` starts expeditions for the inviter + companions. Encounters roll **per member** in `agencyTick` (`expeditionMonster(vid)` per expedition member), so the expedition leader leads only the fights they personally roll (~1/3 for a trio). Making the holder the expedition leader is not making them the fight lead.
- A launch-time draft would ALSO require the holder to be at Haven and launchable at dawn (the `companionLaunchable` bar) — reintroducing the pool problem the lendpool diagnosis already killed (holders are rarely at Haven and often sheltered when fights happen).
- It would need a plan transfer (the holder becomes the plan holder) — a bigger design change than the fight-launch draft, for a weaker effect.

The fight-launch routers are where the lead is actually fixed, so the draft lives there. **`win-plan.js` and `villager-brain.js` are NOT touched by this arm** — which also sidesteps the Loop B conflict on those files entirely (B holds `sim-pinquaddoor-b` + `sim-holderstate-b` there, with `dmgpin-reprereg-b` live on the first right now; this arm touches only `src/js/game.js` + `src/js/villager-agency.js`).

### Scope exclusions (frozen)

Raids (defence at the haven door — same scope rule as the LEADSIDE recorder and the lend); aid fights (the aided villager stays lead); scholar-led fights (never drafted, never replaced); patrol / sortie / contest / nomad / alien origins (not fight launches through these routers — their leads are organic baseline, counted by the judge but never drafted). The draft covers expedition + world-tick launches: 118/183 meetings on the leadside band (~64%).

### Composition notes

With `SHAPE2` off, both call sites behave as before: the draft call is the only addition, and the `resolveWildMonsterEncounter` head reorder moves pure reads only (no RNG, no writes in the moved reads) — proven by the proof test's control legs + draw-neutrality checks. The draft draws zero RNG; the fight that follows draws per its (new) lead, so the legs diverge after a draft fires — expected, like any lever.

**Substrate (both legs, already on master — no rebuild needed):** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1`, LEND OFF on both legs.

**Legs (differ ONLY by the draft rule):**
- Control: substrate as-is (SHAPE2 unset).
- Arm: substrate + `SHAPE2=1`.

## 3. Band freshness (verified before writing this prereg)

- Band **107161–107168**. For EACH seed 107161–107168: 0 matches in any dated `evidence/2026-*/sim-*.md` or `*prereg*.md` (`grep -rl` over `evidence/*/sim-*-prereg.md` and `evidence/*/sim-*.md`), 0 matches in `hidden_files/sim-findings.md`, 0 corpus filenames under `evidence/` (`find evidence -name "*10716[1-8]*"`).
- The only "10716" hits anywhere in `evidence/` are the **5-digit seed 10716** in Oct raidname files (`sim-raidname-b1-b.md`, `sim-raidname-collision-b.md`, `sim-raidname-fix-b.md`) and a sha256 fragment in `sim-fusionoffer-b.md` — different seeds, not this band. No forbidden-band / contaminated-band list file exists under `hidden_files/`.
- Neighbouring used bands: 107141–107148 (leadside), 107131–107138 (holdersupply), 107111–107118 (lendpool), 107091–107098 (fibersupply), 107081–107088 (lendfix), 107051–107058 (gunrate/cellgate).
- Caveat (recorded, not hidden): a full-tree content grep over `evidence/` JSON corpora was started and killed — it was too slow and flooded output by matching inside corpus JSON. The scoped search above (all preregs + sim files, corpus filenames, findings backlog) is the check the skill requires; the band is declared fresh on that search.

## 4. The honest tension (recorded, not hidden)

The draft can only fire where a living armed holder exists at launch time, and lendpool says 92% of launches have none; leadside says the 16 holder-present launches on its band were all nearest-sheltered, and this draft excludes sheltered holders (the shelter door stays shut — pulling a sheltered holder out into a monster fight contradicts what shelter is for, and the lend's eligibility already refuses them). So the draft's **gun-tier bite is uncertain and may be ~0** — the pilot measures it exactly via the draft-decision recorder (miss reasons by tier), and a 0 is a result, not a broken instrument.

The bow tier makes the draft fire OFTEN (bow holders are common) — the arm leg will diverge from control on many fights, not just gun fights. That is a real lever effect, judged by the guardrail; the frozen bar stays searcaster-specific so the gun question is answered cleanly, and bow leads/volleys are reported as diagnostics against their control baselines.

**Falsifier:** if searcaster armed leads stay 0 on the arm leg despite the draft (miss reasons dominated by `no-living-holder` / `gun:sheltered`), the binding constraint is holder SUPPLY + shelter at launch time, not lead selection — and the next lever is holder supply at wave-3/4 preparation (lendpool §8) or a shelter-aware draft (a design call, not this arm). A bow-tier success with a gun-tier failure does not rescue the bar: the bar is the gun question.

## 5. Frozen bars (GO requires ALL of 1–5; a miss is NO-GO, never re-scored)

| Bar | Metric (arm leg unless stated) | Floor | Baseline for comparison |
|---|---|---|---|
| 1 | Searcaster-holder-days | ≥ 40 | leadside arm: 102 |
| 2 | **Armed leads** (wave-4+ entry, lead's rangedId searcaster + ≥1 cell) | ≥ 2 | leadside arm: **0** — the discriminating bar; this lever's point |
| 3 | Armed volleys fired (lead rangedId searcaster, shots > 0) | ≥ 1 | leadside arm: 0 |
| 4 | Armed-holder entries (wave-4+ entry, searcaster + ≥1 cell, any participant) | ≥ 3 | leadside arm: 21 |
| 5 | Guardrail, separated (frozen from gunrate/cellgate/holdersupply/leadside): (i) deaths per engaged wave-4+ meeting ≤ 1.10× control; (ii) median survival ≥ 0.80× control; (iii) villager starvation deaths ≤ control + 2 | all three | — |

Guardrail note (task wording mapped): the task's "starvation ≤ control+2 on totals AND arm-only deaths, median ≥ 0.8× control median" maps onto the frozen bar 5 — (i) is the arm leg's death rate per engaged meeting vs control ("arm-only deaths" as a rate, not a re-scored total), (ii) is the median, (iii) is starvation totals. No new guardrail shape is invented here.

**Diagnostics (computed and reported, NOT judged):** draft decisions (fired by tier, misses by reason, drafts that reached a fight — draft fired → fieldFight row with the drafted lead); bow-armed leads + bow volleys (arm vs ctl); grants-by-lead-count (see §6); pool presence (near-miss breakdown, as in leadside).

**Instrument validity (pre-pilot, not a judged bar):** proof test green before the pilot; analyzer `--selftest` green; near-miss coverage ≥ 95% with ≤ 5% unclassified on each leg (if coverage fails, the verdict is METRIC-BROKEN, not NO-GO). `v4lends` must stay 0 on both legs (LEND off); `v4lendPool` counter re-verified (lendable rows agree with pool moments). SHAPE2 leg-consistency: arm requires SHAPE2=1, ctl forbids it (driver guard, like the leadside LEADSIDE guard).

**Outcome discipline:** if GO, the lever stays env-gated OFF on master (no default flip — a separate design decision); the arm lands instrument + evidence + the proof. If NO-GO, REVERT the SHAPE2 game-code change in the worktree before finishing (verify the revert is the exact inverse by hash), leaving instrument + evidence only, and name the next lever with numbers.

## 6. Instrument (clones + folded-in extensions)

- Driver: `scripts/shape2-driver-a.js` — clone of `scripts/leadside-driver-a.js` (itself the gunrate-driver lineage). MODE=ctl|arm; no lever changes in the driver (SHAPE2 is game code). Run name `shape2-a`. SHAPE2 leg-consistency guard + `shape2On`/`shape2Present` in corpus metadata. **New: draft-decision recorder** — wraps `Game._shape2DraftLead` (pure-read wrap; the game method runs exactly once, untouched) and logs every decision (`v4drafts`: day, mid, wave, origin router, natural lead, drafted lead, holder, tier, missReason, candidates).
- **Folded-in ride-along — finding #2635 + leadside §8(a) gap (grants-by-lead-count).** The analyzer computes it from existing corpus fields — NO new driver instrument, NO second census: for each searcaster grant event (`grantEvents`, caller `contest-prize` et al), count the recipient's wave-4+ leads BEFORE the grant day from `v4encounters` rows (lead == recipient, day < grant day). Reported as grants by lead-count bucket (0 / 1 / 2+ leads) + the sink census kept from leadside (transfers by kind × attribution). This answers "grants missed the leaders" vs "leaders never got the chance" for any future redirect re-test.
- Analyzer: `scripts/analyze-shape2-a.js` — clone of `scripts/analyze-leadside-a.js`, keeping its `judgeLeadside` bars as the frozen floors in §5 under a new `judgeShape2` (same floors, renamed), plus `draftStats` (decisions / fired-by-tier / misses-by-reason / reached-fights), `bowStats` (bow-armed leads + bow volleys, arm vs ctl), and `grantsByLeadCount`. The `armedLeads` counter fix from the lendpool analyzer is kept; the selftest must prove the new stats on synthetic corpora.
- Proof test: `scripts/test-shape2-a.js` — draft fires on a real wave-4+ fight through BOTH routers (expeditionMonster + resolveWildMonsterEncounter) with a living armed holder; gun tier beats bow tier; skips when the natural lead is already armed; skips raids, aid-routed fights, and scholar leads; eligibility filters (sheltered / resting / sick / low-health / range-0 / dead holder / scholar holder); the drafted holder takes the fight's outcome (kill credit + hurt land on the holder, not the natural lead); draw-neutrality of the decision (0 draws, SHAPE2 on vs off, on a stubbed fight); control-path identity (SHAPE2 unset: same lead, same fight outcome on a fixture); gate hold/fire unchanged under SHAPE2=1 (CELLGATE hold below wave 4, fire at wave 4+); analyzer selftest.
- Panel builder: `scripts/build-shape2-panels-a.js` — rename of `scripts/build-leadside-panels-a.js` (before = ctl substrate, after = arm substrate+SHAPE2, seeds 107161–107168). Balanced-panel compare per docs/MEASUREMENT.md §15; the panel is the instrument, the frozen bars above are the judge.

## 7. Run plan

1. Commit this prereg BEFORE any judged sim (safe-commit).
2. Build SHAPE2 + proof test; proof test green before the pilot.
3. Smoke: seed 107161, both legs; corpora valid, coverage sane, `v4lends` 0, draft recorder logging decisions.
4. Pilot: 8 ctl + 8 arm seeds 107161–107168, parallel background legs (~20–30 min each). Resume from disk if a sweep dies (re-run only missing seeds, never a partial corpus).
5. Analyze (frozen judge), build panels, compare, write evidence `evidence/2026-11-21/sim-shape2-a.md` (prereg, before/after on identical seeds, village assessment in plain words, metric review, next lever named, sink census + grants-by-lead-count, wall numbers, sense-test sample from drafted-lead fight transcripts).
6. If NO-GO: revert SHAPE2 (hash-verified inverse), re-run proof test post-revert, commit instrument + evidence only. If GO: land env-gated OFF.
7. No push, no bump, no live verification. Report branch tip + proof results + verdict to the coordinator; the coordinator merges.

## 8. Metric review (to be filled in the evidence file)

Pre-registered here as a placeholder so the evidence file carries the section: bars 1–4 measure the lever's mechanism (holder exists → draft fires → armed lead → volley → entries); bar 5 is the frozen exposure-normalized guardrail. Known metric risks, stated in advance: (a) bar 2's floor (≥ 2) demands a gun holder alive AND eligible at a launch inside the 150d horizon — a grant late in the run may never get its chance, so the evidence must report draft miss reasons + grants-by-lead-count alongside the bar; (b) the draft covers expedition + world-tick launches only, so a launch routed elsewhere (patrol/aid/raid) counts for the judge's denominator but never for the draft — a scope limit, stated here, not a measurement gap; if those origins dominate armed leads the evidence must say so; (c) bar 4 (entries ≥ 3) is a guard against a degenerate shape, not the lever's point — if leads pass but entries fail, the evidence must say which shape occurred; (d) bow-tier drafts change many fights, so a guardrail failure with passing participation bars would mean the draft's breadth, not its gun mechanism, is the problem — the evidence must separate the two.
