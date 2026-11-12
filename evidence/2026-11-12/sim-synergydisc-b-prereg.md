# sim-synergydisc-b — prereg: dawn resonance for double-passive synergy discovery

Run: `fleshout-loop-b-20261112T0730Z` (Loop B, 2026-11-12 01:30 CST).
Arm: sim-synergydisc-b — double-passive synergy discovery build.
Findings-backlog item: `sim-findings.md` line 2280, marked
`[claimed 2026-11-12 by Loop B run fleshout-loop-b-20261112T0730Z, arm sim-synergydisc-b]`.
Tracker: 0130Z blank #2 follow-up (the synergy-stall verdict,
evidence/2026-11-11/sim-synergystall-b.md).
Base: master `d98aae0f0` (worktree sim-synergydisc-b).

## The defect (confirmed, re-derived this run)

11-of-57 was the 0230Z claim. Re-derived from `src/data/synergies.json` +
`src/data/abilities.json` against the trigger set (activation / ambient
`noteAbilityUse` 13 ids / `gainAbilityXP` literal sites / `treatDisease` /
synthetic) with an independent script (`/tmp/derive11.py`, kept out of the
repo): **the 11 reproduce exactly** — same ids, same legs, same types.

**CORRECTION — the class is 10, not 11.** The 0230Z derivation counted
activation only from the `actions` array in `abilities.json`. It missed the
live legacy activatables (`src/js/abilityActions.js` `_legacyActivatables`,
wired through the live data-driven `activatableAbilities()` → `useAbility`
→ `gainAbilityXP` → `noteAbilityUse`): `blood_magic, time_skip, dowsing,
echo_location, field_medicine, herbal_remedy, purify, compost_king,
cannibal_frenzy`. `blood_magic` has no `actions` array but IS a live button
("Blood Price", 2/day part) — using it notes it. `war_chest`
(sequential, order `[blood_magic, deep_reserves]`) therefore HAS a trigger
in ordinary play: spending blood while holding deep_reserves (passive,
resonant) is a combined use via the trigger-side resonance branch. The
other 10 have no leg in the legacy set and no other note path.

Corrected triggerless class (10):

| synergy | type | legs |
|---|---|---|
| critter_network | sustained | bird_whisperer, squirrel_friend |
| cornered_fury | simultaneous | adrenaline_control, cornered_rat |
| polyglots_ledger | sustained | translator, open_book |
| everybodys_friend | sequential | silver_tongue, gossip_network |
| farsight | sequential | eagle_eye, pathfinder |
| owl_hours | sustained | eagle_eye, night_eyes |
| tells | simultaneous | lie_detector, open_book |
| string_wall | sustained | evidence_board, eagle_eye |
| airtight | sequential | lie_detector, evidence_board |
| stand_together | sequential | draw_fire, shield_wall |

Secondary-count discrepancy (does not affect the build): the 0230Z note's
"36/57 synergies have at least one passive-no-trigger leg" does not
reproduce under the documented definition — 31 (union over all paths,
synergy/tech/skill/item legs excluded), 33–38 under plausible variants
(counting synergy legs and/or tech:/skill: legs as passive-no-trigger). The
4 leg ids that are not abilities (`blood_tracker`, `clean_kill`,
`fear_itself`, `unstoppable`) are synergy ids (synergy legs, e.g.
`apex_predator` requires `clean_kill`), not missing data. The dawn trigger
below is computed from the same trigger set as the 10, not from the 36, so
this stays a reporting discrepancy only.

## Canon grounding

- Abilities are System-granted magic in six slots; synergies are System
  grants, never taught, never bought (docs/CANON.md human-skills-vs-alien-
  abilities law; docs/SYSTEMS.md). Discovery must stay System-granted.
- No canon doc covers synergy discovery shape (checked docs/CANON.md,
  docs/SYSTEMS.md, docs/DIRECTIVES.md — none describes how a synergy is
  discovered, only that abilities/synergies come from the System). The
  shape below is therefore a documented design call, not canon
  implementation. It invents no new grant channel: it reuses the existing
  `checkSynergyDiscovery` / tease / unlock path.

## Design call (documented; Steve can overrule)

**DAWN RESONANCE.** At dawn (`endDay`, after the day advances and the dawn
header is said), the System notes the held pair: for each undiscovered
synergy with a path whose legs are ALL bare passive abilities currently
held at minLevel with no other note path (no activation incl. legacy
activatables, no ambient note, no XP-tick site, no treat path), run
`checkSynergyDiscovery` on the first leg of that path. One dawn note per
qualifying synergy per dawn. Effects by type, reusing existing logic:
simultaneous/sequential = 1 attempt per dawn (3 dawns co-held = unlock);
sustained = 1 streak day per dawn (3 consecutive dawns co-held = unlock).
The existing tease/unlock voice lines fire unchanged — the System's own
words, not new narration.

Alternatives considered:
- **Ambient notes when the situation arises** (e.g. note `cornered_rat`
  when surrounded, `eagle_eye` when spotting): truer to "discovery, not
  given" and to each pair's fiction, but it is 10 bespoke situation hooks
  (one per pair, some with no clean situation in code) — a bigger build
  with 10 new failure modes, and several pairs have no situation that
  ever arises in ordinary play (e.g. `polyglots_ledger`). Rejected for
  this arm; a future arm may replace individual pairs with ambient notes
  once dawn resonance proves the class is reachable at all.
- **Discovery on grant** (unlock immediately when both legs are held):
  changes the design (discovery currently requires 3 combined uses) and
  would make the tease/hint arc dead content for these 10. Rejected.
- **Surge focused-practice widening**: the one existing path that can
  note these legs is devotion-lane-gated and fires one ability per
  session; widening it changes the surge economy for every ability.
  Rejected — dawn resonance is narrower and touches no other system.
- **Doing nothing / leaving war_chest in the class**: rejected by the
  re-derivation — war_chest already has a trigger, so covering it at
  dawn would double-count one moment (blood use + dawn note) and broaden
  discovery beyond the triggerless class. The dawn filter excludes it.

Scope guard: the dawn filter is computed from data + the trigger set at
runtime (not a hardcoded list of 10 ids), so a future data change that
gives a pair a trigger automatically drops it from dawn resonance. The
other 47 synergies are untouched — their discovery paths do not change.

## Primary metric + GO threshold (binds the run)

Primary metric: synergies discovered on diagnostic seed 20261011, god
policy, 94d, via `scripts/test-synergy-stall.js` VERBATIM.

- Baseline (re-run this run on base `d98aae0f0`, log
  `evidence/2026-11-12/synergystall-baseline-20261112.log`): 0 discovered,
  4 attempts total (all ringcraft, 2/3), cornered_fury 0 attempts while
  both legs held (adrenaline_control + cornered_rat, both L1 at day 94),
  157 ability_granted events. Byte-identical in substance to the 0230Z
  verdict — the baseline holds on this base.
- **GO = at least 1 of the corrected 10 triggerless synergies discovered
  on that seed AND cornered_fury attempts > 0 AND no regression on the
  fresh 8-seed band (below).**
- The stall script has no built-in pass/fail; the GO bar above is the
  judge. A miss is NO-GO, never re-scored.

## Fresh band + cost bar (no-regression leg)

- Band: seeds **190501–190508**, competent policy, 150d death-aware,
  before/after on identical seeds through `scripts/balance-panel.js`
  (before panel `evidence/2026-11-12/synergydisc-b-panel-before`,
  after panel `evidence/2026-11-12/synergydisc-b-panel-after`,
  compare `evidence/2026-11-12/synergydisc-b-panel-compare`).
- Fresh-band check (coordinator, recorded here): searched
  `evidence/*/sim-*-prereg.md` — zero hits for 190501–190508;
  full-evidence grep hits are incidental numeric substrings in per-seed
  JSON corpora (e.g. `"ate": 1905021`), not seed reservations; no
  forbidden/contaminated band list exists. Verified again by this arm:
  `grep -rl "19050[1-8]" evidence/*/sim-*-prereg.md` returned no files.
- Cost bar (scalemetric): starvation ≤ control+2 on totals AND arm-only
  deaths, median survival ≥ 0.8× control median.
- Wall numbers (national / table / wins, wave 4–5 reach, median survival)
  reported on the fresh band, both legs, in the evidence file.

## Before-panel baseline (recorded before any code change)

`scripts/balance-panel.js`, competent, seeds 190501–190508, 150d,
`evidence/2026-11-12/synergydisc-b-panel-before` (8 cases, validity
sourcesStable + neutrality match on proof seed 190501, 0 cached jobs):
median survival **138.5d**, survived 2/8, national **0/8**, table **8/8**,
won **0/8**, waveReach 4 on 7 seeds / 5 on 1 seed (190504), starvation
deaths total **3** on 2 seeds (190501: 2, 190502: 1). Cost-bar thresholds
for the after leg: starvation total ≤ 5, median ≥ 110.8d.

## Proof plan

- `scripts/test-synergydisc-b.js` (new): (a) trigger fires only for the
  10 — fixture holds both legs of cornered_fury, advances dawn, discovery
  progresses; fixture holds a synergy with an existing trigger (war_chest
  via blood_magic use; ringcraft via use), its path unchanged (no dawn
  progress without the trigger, progress via the trigger as before);
  (b) no discovery progress for unheld legs; (c) the stall script's
  verdict moves per the GO bar.
- `node scripts/check.js --quick` after the game-code change; attribute
  every failure (pre-existing vs mine) — no unclaimed green.
- SENSE-TESTING LAW: read the discovery narration/voice lines the change
  produces (tease/unlock lines from `synergies.json` as fired at dawn)
  and judge meaning, coherence, relevance — never just counts.

## Horizon / seeds / policies

- Diagnostic: seed 20261011, god policy, 94d (fixed by the stall script).
- Regression: seeds 190501–190508, competent policy, 150d death-aware.
- No other seeds, no other policies. No sims beyond these two legs except
  the proof test's fixtures.

## Metric review

(To be filled at run end. No metric re-scored mid-run.)
