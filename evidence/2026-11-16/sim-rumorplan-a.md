# sim-rumorplan-a — the lifecycle of rumor-born hunt-stage win-plans

- **Arm:** sim-rumorplan-a (Loop A, run fleshout-20261116T0645Z, axis scale-onramp)
- **Date:** 2026-11-16
- **Type:** DIAG, instrument-only — zero `src/js` changes
- **Prereg:** `evidence/2026-11-16/sim-rumorplan-a-prereg.md` (frozen, with Corrections 1–2 committed before any judged sim)
- **Policy:** tableseat-nowait (`a11a1abc672e`), env `TABLESEATNOWAIT=1 LEANLINKRESCUE=1` on both legs
- **Seeds:** 102011–102018 (fresh band; verified unused before the prereg commit), horizon 150d death-aware (runs end early on win or village loss)
- **Legs:** main `evidence/2026-11-16/perseed-rumorplan-a-main/` (8/8 files) + replication `evidence/2026-11-16/perseed-rumorplan-a-replication/` (8/8 files)
- **Analysis:** `evidence/2026-11-16/rumorplan-a-analysis.json`
- **Panel (§15):** `evidence/2026-11-16/rumorplan-a-panel.md`
- **Verdict: DIAG-GO** — every pre-registered bar passed; questions 1–2 answered with numbers, question 3 answered with a read trip.

## The question, in plain words

When villagers gather at the fire at night, they hear about monsters other
villages have killed. That talk can plant a plan in a villager's head: go
out and hunt the wave-4 beasts, win the village a seat at the table. But
the plan is born with no beast named in it — the holder heard a rumor,
fought nothing themselves, so there is nothing to attach the plan to.
Seedattach (2026-11-15) showed 8 of 10 such target-null hunt plans were
born this way. This arm asked: do those rumor-born plans EVER pick up a
real target before they launch, or do they only ever march out with no
beast named? And of all the wave-4+ launches, how many come from rumor,
how many from villagers who fought the beast themselves, how many from
companions who inherited the plan?

## Answer 1 (Q1): rumor-born plans NEVER convert — 0 of 20

- 33 hunt-stage plan instances on the band; 33/33 classified (100%, unknown 0).
- 20 of the 33 are rumor-born (heard-at-fire, target-null at birth).
- **Conversions: 0.** Not one rumor-born plan ever launched with a named
  wave-4/5 beast as its target.
- **Acquired-but-unlaunched: 0.** Not one rumor-born plan even gained a
  target without launching — all 20 were still target-null at the end of
  their lives (or their holder's life).
- The seed mechanism does work, but only on plans born the other way:
  the only 12 strict (named-beast) wave-4+ launches in the whole corpus
  are all **seed-created** — plans the seed itself created out of a fight
  the holder fought, born already targeted. The seed fires 75 times on
  the band (16 at wave 4+, 59 at wave 3), yet it never once attaches a
  target to a rumor-born plan, at party stage or hunt stage. The Carlos
  natural experiment from seedattach said the seed works at party stage
  and is inert at hunt stage; this corpus says it is inert for
  rumor-born plans at every stage, because the plan's holder never fought
  the beast and the seed only writes a target from a fight the holder
  fought.

## Answer 2 (Q2): most wave-4+ launches are rumor-born — and all of them target-null

Unit: the launched plan (one participant row per real expedition start).

| Origin of the launched plan | Wave-4+ launched plans (broad, n=48) | Strict: named wave-4/5 beast or needWave ≥ 4 (n=12) |
| --- | --- | --- |
| heard-at-fire (rumor-born) | 27 (56%) | **0** |
| fought-personally | 5 | 0 |
| companion-inherited | 4 | 0 |
| seed-created | 12 | **12 (100% of strict)** |
| seeded-then-lost | 0 | 0 |
| unknown | 0 | 0 |

- Broad = needWave ≥ 4 at launch, OR target is a wave-4/5 beast, OR the
  plan has a wave-4 bounce in its history. The 27 rumor-born broad
  launches qualify only through the third leg: their needWave reached 4
  (the plan wants a wave-4 kill) while the target stayed null. Every one
  of the 27 launched with `targetAfter: null`.
- Event-level (one row per launch event, inviter's plan origin): 21
  wave-4+ launch events — heard-at-fire 9, fought-personally 3,
  companion-inherited 2, seed-created 7.
- All 201 hunt-stage launched plans by origin: heard-at-fire 111 (55%),
  fought-personally 26, companion-inherited 43, seed-created 21.
  The hunt stage is mostly rumor: over half of everything that launches
  at hunt stage is a plan born from fire talk with no beast named.

## Classification table (all 33 hunt-stage instances)

| Origin | n | Share |
| --- | --- | --- |
| heard-at-fire (rumor-born) | 20 | 61% |
| fought-personally | 3 | 9% |
| companion-inherited (brain mirror) | 7 | 21% |
| seed-created | 3 | 9% |
| seeded-then-lost | 0 | 0% |
| unknown | 0 | 0% |

Per seed: 102011: 6 hunt (3 rumor, 1 companion, 2 seed-created);
102012: 2 (1 rumor, 1 companion); 102013: 5 (3 rumor, 1 fought, 1
companion); 102014: 3 (2 rumor, 1 fought); 102015: 8 (6 rumor, 1 fought,
1 companion); 102016: 0 — no win-plan was ever created in that village
in 116 days; 102017: 2 (1 rumor, 1 companion); 102018: 7 (4 rumor, 2
companion, 1 seed-created).

## Lifecycle: what happens to a rumor-born plan

Terminal state (last observed wins) × launch status, all 33 instances:

| Origin | Terminal | n |
| --- | --- | --- |
| heard-at-fire | launched-target-null, holder died | 12 |
| heard-at-fire | launched-target-null, alive at end | 8 |
| fought-personally | launched-target-null, holder died | 2 |
| fought-personally | launched-target-null, alive at end | 1 |
| companion-inherited | launched-target-null, holder died | 4 |
| companion-inherited | launched-target-null, alive at end | 3 |
| seed-created | launched-targeted, alive at end | 2 |
| seed-created | never launched, holder died | 1 |

No instance ended churned, superseded, or deleted in this corpus — the
outmatched demotion and the HavenTick deletion never fired on a hunt
instance here. The typical rumor-born life: born target-null at Haven,
reaches hunt, launches again and again with no target, and the holder
either dies (12/20) or is still carrying it when the run ends (8/20).

## Answer 3 (Q3): what the target-null trips do — they wander into real monsters and get mauled

176 launched target-null trips; 27 met a wave-4 monster on the way.
Outcomes of those meetings: evade 22, fled-after-fighting 13 (some
trips met more than one monster).

**One trip, read end to end (seed 102011, Wyatt, `gen_w3zeqy2`):**

- Day 56: Wyatt's plan is born at Haven, target null — the village had
  slain 5 beasts by then, and he had fought none of them.
- Day 58: he launches as Pavel Dubinin's companion (brain mirror),
  party → hunt, target still null. Out two days, health 100 → 70.
- Day 61: back at Haven, demoted to party. Day 62: launches again as a
  companion, hunt, target null.
- Day 62: "Wyatt saw The Eater in time and gave it room." He dodges a
  wave-4 Eater.
- Day 66: "Wyatt walks straight into The Eater. No avoiding it." Three
  rounds: he and a helper deal 173 damage to a 983-HP Eater and take 63
  in return. At 19 HP: "Wyatt sees how this ends — and runs while
  running still works." He flees; the Eater still has 810 HP.
- Day 73: "Wyatt saw The Influencer in time and gave it room." Dodges
  a second wave-4 beast.
- Days 69, 78, 81: launches again as inviter, always hunt, always
  target null. Alive at the end of the run.

Judged as a story, not a count: the trip is not a hunt. Nothing in it
names a beast, so the party walks where the road takes them; when they
meet a wave-4 monster they either give it room or blunder into a fight
they cannot win and run. The plan gives them a reason to go out and a
stage name, but no quarry. That is the whole corpus in miniature:
27 of the 48 wave-4+ launches are parties marching out under a plan
that names nothing.

## Instrument neutrality (the recorder did not change the game)

- Proof test `scripts/test-rumorplan-a.js`: **97 passed, 0 failed**
  (classifier fixtures on synthetic cases; live 5d runs on both policies;
  D1/D2 60d legs).
- D1 determinism: identical full corpus, recorder ON twice, 60d, seed 102011.
- D2 wrap neutrality: identical trajectories, recorder ON vs OFF, 60d, seed
  102011; the OFF run carries empty rumorplan/seedattach/v4/dawnbid arrays.
- D3 drift smoke (`vetparty-drift-check.js` main vs replication): all 8
  seeds IDENTICAL, no pre-lever drift.
- Main vs replication legs: bit-identical summaries on every number
  (33 instances, 20 rumor-born, 0 conversions, 48 wave-4+ launches).
- §15 balanced panel (main → replication, pseudo-policy rumorplan-a):
  every observed metric has paired delta 0 and a 95% exploratory
  interval of 0 to 0 — no material signal. (Top-level panel label reads
  `review_required`, which is the panel's standing label for a
  screen-only run; every per-metric status is `no_material_signal`.)
- Instrument errors: 0 on both legs.

## Wall numbers (tableseat-nowait baseline, seeds 102011–102018)

| Metric | Result |
| --- | --- |
| Wins | 7/8 |
| National-or-global at end | 7/8 |
| Standing ≥ 200 (national) | 1/8 (seed 102015, standing 302) |
| Table entry | not observed by this instrument (see below) |
| Wave 4 reached | 8/8 |
| Wave 5 reached | 1/8 (seed 102015 only) |
| Median survival (run length) | 90 days |

Runs end early on win or village loss, so the 150d horizon is a cap,
not a fixed length: 7 villages won at days 90–116, seed 102015 lost
its village at day 76 after reaching wave 5. The 7 wins all ended at
global rank with standing 199; the one loss ended regional at standing
302 after reaching wave 5 — the village that climbed highest is the
one that died. These are baseline numbers for wall comparability with
the sibling arm, not a claim about the live game: tableseat-nowait is
a strong policy by design.

Table entry is not a measured number here: neither the analyzer nor the
§15 panel observes a table-offer event in this corpus (panel: Table
entry rate `unknown / not_observed`, 0/8). The wins (7/8) are the seat
outcome this corpus can state. Do not read the analyzer's `table: 0`
as "no village reached the table" — it is a placeholder for an
uninstrumented counter.

## Metric review (pre-registered bars)

| Bar | Requirement | Result | Pass? |
| --- | --- | --- | --- |
| Classification | ≥90% of hunt-stage instances classified (unknown ≤10%) | 33/33, 100%, unknown 0 | PASS |
| Corpus | 8/8 main + 8/8 replication files parse | 8 + 8 | PASS |
| Neutrality | D1+D2 green, D3 drift smoke clean, §15 no material signal | all green / identical / delta 0 | PASS |
| Proof test | `scripts/test-rumorplan-a.js` green | 97/97 | PASS |

No bar was re-scored mid-run. Two analyzer fixes landed before the
judged sims (both committed, both re-proven 97/97): the expedition-start
gate for launch rows (Correction 1), and the loss detector no longer
treating a bounce's pre-change null or a census-diff's from-null as a
target loss — a null that exists only because the very same event is
about to set the target is not a loss.

## Residue and secondary findings

- **Companion-not-started (3 rows, seed 102013):** the brain mirror
  sets a companion's plan to hunt without checking the companion's
  expedition started, so 3 launch rows name a companion who stayed
  home. They are counted separately, not as launches.
- **Expeditions without a launch row (3 of 121):** chance-roll
  expeditions (`R() < chance` in villager-agency) start trips no plan
  launched. Secondary residue only.
- **Seed 102016:** zero win-plans in 116 days, zero rumorplan rows —
  the plan system never fired there at all, yet the village still won.
  Plans are not on the critical path to winning under this policy.
- **Target-diff channel nearly silent:** only 2 census-diff rows in the
  whole corpus; seed-set detection ran almost entirely on bounces.
- **Telemetry deviation check: REFUSED.** No `telemetry-baselines/
  scale-wall.json` exists in this tree (no `telemetry-baselines/`
  directory at all), so the check cannot run. No baseline was rolled.
- **Design call untouched:** whether the world tick should seed
  rumor-born plans (the 82% of wave-4 flee/evade encounters that never
  reach a seed site, per seedattach) is a Steve/coordinator call. This
  arm measured only. What the measurement says to that call: the seed
  as built cannot help rumor-born plans at all, because it writes a
  target only from a fight the holder fought — so seeding from the
  world tick would need a different attachment rule, not just more
  seed call sites.

## Files

- Prereg: `evidence/2026-11-16/sim-rumorplan-a-prereg.md`
- Instrument: `scripts/rumorplan-driver-20261116.js`,
  `scripts/analyze-rumorplan-a.js`,
  `scripts/build-rumorplan-panels-20261116.js`,
  `scripts/test-rumorplan-a.js`
- Corpora: `evidence/2026-11-16/perseed-rumorplan-a-main/` (8 files),
  `evidence/2026-11-16/perseed-rumorplan-a-replication/` (8 files)
- Analysis: `evidence/2026-11-16/rumorplan-a-analysis.json`
- Panel: `evidence/2026-11-16/rumorplan-a-panel.md`
  (+ `rumorplan-a-panel.json`, `.json.gz` before/after)
