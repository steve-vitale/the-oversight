# sim-dmgshape-rerun-b — FROZEN prereg (Loop B 2130Z run, arm sim-dmgshape-rerun-b)

**Frozen:** 2026-11-19 ~22:05 UTC, BEFORE any judged sim. Base master
`5e38f3f7b` (sim-scale-onramp-round-1815 adoption closeout). Branch
`sim-dmgshape-rerun-b`.
**Diagnostic:** instrument-only — ZERO `src/js` game-code changes
except the coordinator-authorized ALLYSLOT3 substrate port (see
below). The instrument is a renamed driver copy + a new analyzer in
`scripts/` (pure reads of the fight record `rec`); the game is
untouched.

## The question (finding #2605; tracker 1830Z next blank #2)

The damage question underneath — what lifts a launched party toward
~111 damage/round — re-measured with damage-per-launch defined as
"first fight against the launch target, any origin". The first run
(sim-dmgshape-b) judged n=3 fled launched-quad fights too thin
(NO-GO METRIC-BROKEN) but validated the instrument (exact identity
0.3% error over all 97 fled fights) and measured the exploratory
gap structure: base-rate ceiling 43.7% of the gap, ally-delay
27.6%, verb 3.1%, miss 0%, hit rate 1.000. The re-run changes the
population, not the instrument: a launch counts when its TARGET is
fought — by the launched party or by any other party that meets
the target first, on any router (expedition, world-tick, aid,
patrol) — because the launchfunnel survey and the partysurvive
re-run both showed launched parties' fights happen mostly
off-expedition (pavel's quad fought its Reunion target and killed
a Herald in world-tick fights the expedition-only join never saw).

## Substrate (frozen)

- Flags: SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1
  FIGHTALLY2=1 ALLYSLOT3=1, identical to sim-partysurvive-rerun-b.
  LAUNCHSURVIVE=1 (tracker rows on, same as the re-run).
- **Port (coordinator-authorized, evidence-only):** cherry-pick
  `f4d1100ee` (partysurvive's own port of held sim-allyslot3-b
  `7efbf26a8` via sim-fightcap-b `5a5343363`) onto this branch.
  Verified NOT an ancestor of master before picking
  (`git merge-base --is-ancestor f4d1100ee HEAD` = no). The
  fightcap driver refuses without the slot, so the port is
  required for the diagnostic to run. Proof:
  `scripts/test-allyslot3-b.js` (arrives with the cherry-pick),
  expect 18/18. The port must NEVER be merged to master as a
  game change — this branch holds it only so the diagnostic can
  run; the coordinator lands evidence-only.
- **BOWCRAFT turn-on is live on this base** (`d56fbe819`, bowcraft
  duty always on). Recorded as a substrate note; bowcraft is NOT
  re-judged here.
- **Policy moved since the survey/re-run.** `scripts/policies/
  competent.js` sha256
  `150229eda010b89e4c73c0e7e68d06d30a7191cc3748778339c81f09e470161a`
  (first 12: `150229eda010`; git blob `8f8307b54dee`). The survey
  and partysurvive-rerun recorded `729af71ccddd...`. The change
  is journey-landing r148 (`cf17e4dd6`, moderator-mute guard +
  link-accept rotation, +78 lines). The judged leg runs the
  CURRENT policy verbatim. Trajectories will therefore diverge
  from partysurvive-rerun-b even on identical seeds — the launch
  count is RE-MEASURED on arrival, never assumed to be 9, and
  the wall numbers are compared against partysurvive-rerun-b as
  a same-band reproducibility reference, not as a before/after.
- Horizon: 150d, death-aware (dead villages stop, +10d tail max).
- Policies: competent verbatim only.
- Seeds: **106081–106088, the FULL designated band, never a
  subset** (launchfunnel-b: 17 launches, 9 quads, 4 joined quad
  meetings per 8 seeds on the survey substrate; partysurvive-
  rerun-b: 9 targeted launches, 2 quads under the full
  substrate — finding #2616, designation non-transfer). Seed-band
  freshness: the band is fresh for re-use AS DESIGNATED
  (partysurvive-rerun-b verified the only prereg hit is the
  designating survey itself).

## Judged population (frozen)

**Launches:** `v4departs` rows with `result: 'launch'`,
`targetWave >= 4`, `target` non-null — the survey's counting,
all party sizes (trio + quad), so the substrate-corrected
launch count compares directly with launchfunnel-b's 17 and
partysurvive-rerun-b's 9. (Verified on the partysurvive-rerun
corpus before freezing: 9 rows, 0 duplicate (vid, day, target)
keys, all source 'brain' — the two recorder wraps do not
double-fire for one departure.)

**First fight against the launch target:** for each launch, the
earliest `v4encounters` row with `mid === launch.target`
(the monster TYPE id — the recorder carries no instance id, so
the first fight against ANY live monster of the target type
counts), `day` in `[launch.day, launch.day + 21]` (the family's
21-day window, same as `correctedJoin`), fought
(`rounds > 0` or `mDealt > 0`), ANY origin (expedition,
world-tick, aid, patrol, other), ANY fighter (the launched
party or any other party that meets the target first). Earliest
day wins; file order breaks a same-day tie (the recorder
appends chronologically). Two launches against the same target
type may share one first fight — each launch maps to its own
first fight; the count of distinct fights is reported beside
the count of launches. A launch with no such row in its window
has no first fight and does not enter the population.

**Judged decomposition:** the FLED subset (outcome `vFlee`) of
the first-fights — the fights that had damage but no kill, as
in dmgshape-b. Killed (`vKill`) and villager-death (`vDie`)
first-fights are reported beside, never substituted.

## Primary metric (BINDING, §14)

**Per-round damage decomposition of fled first-fights against
the launch target, reusing dmgshape-b's decomposition verbatim**
(`scripts/analyze-dmgshape-b.js` `decomposeEncounter` +
`aggregate`, imported — not copied).

- `D_meas` = mean of per-fight `mDealt/rounds` over fled
  first-fights (fightcap's ladder definition — MEAN of
  per-fight rates, not pooled). Reference winning shape
  `W = 111`/round (fightcap-a ladder; MONSTER-WAVES.md wave 4:
  HP 850–1500, "a 4–6 round fight for a godhood build (~220
  dmg/round)", which brackets 111 as a competent-party winning
  shape, roughly half godhood).
- Gap `G = W − D_meas` (per round; G > 0 expected — if G ≤ 0 the
  diagnostic is moot and the verdict is NO-GO kind NO-GAP).
- Components, all per-round over the fled first-fights, from
  the engine's own per-round records (`rec.roundsDetail`,
  `rec.roundTotals`) and the FULL fight log (uncapped):
  - (a) **Verb loss** — fighter rounds spent on a verb/ability
    instead of a strike, priced at the fighter's mean landed-
    strike damage.
  - (b) **Miss loss** — zero-damage strikes as a share of
    strike attempts, priced at `P_mean`.
  - (c) **Ally-delay loss** — empty striker-slot rounds
    (before join / after down) vs a full 4-striker round,
    priced at the allies' mean landed-strike damage.
  - (d) **Base-rate ceiling** — `W − P_mean × 4`, where
    `P_mean` = mean damage per landed strike (fighter +
    allies, volley excluded) and 4 = max strikers/round.
    The shortfall that remains even at a full party striking
    every round.
  - Reconciliation: (a′)+(b′)+(c′)−echo = `P_mean × 4 −
    D_strike` within ±15% (Correction 1 exact identity,
    unchanged); a larger error is an instrument failure,
    verdict NO-GO kind INSTRUMENT.
- **Accounted share** = ((a)+(b)+(c)+(d)) / G.
- **GO bar: accounted share ≥ 0.70 AND the single top
  contributor ≥ 0.25 of G**, named with per-component numbers.

**Classification bar 0.90 (frozen):** classified = first-fights
(all outcomes) for which the analyzer produced a complete
decomposition (verbLoss, missLoss, allyDelayLoss, baseCeiling
all non-null — i.e. the fight has at least one landed strike
to price from, plus the roundsDetail/log fields the components
need). Bar: classified / first-fights ≥ 0.90. A first-fight
with zero landed strikes (pMean null) is unclassified, never
silently scored at zero. Instrument errors and unreadable rows
are reported separately and fail the instrument bar.

**POOL FLOOR (binding precondition, two legs):**
(i) ≥6 launches with a first fight against the target;
(ii) ≥4 fled first-fights, so the decomposition bars are
judged on a population that can carry them. Failure of
either leg → NO-GO kind METRIC-BROKEN (pool). If leg (i)
fails, the headline finding is the substrate-corrected launch
count (and the first-fight count beside it) — the pool the
designated band actually delivers under the full substrate
on the current policy.

**GO requires ALL of:** pool floor (both legs) + classification
≥ 0.90 + accounted ≥ 0.70 + top ≥ 0.25 + reconciliation ≤ 15%
+ 0 instrument errors + 8/8 files. A miss is NO-GO, never
re-scored against a friendlier metric.

## Secondary (REPORTED, not binding)

- Per-seed launch map: launches, launches with a first fight,
  fled/killed/died first-fights, distinct first-fight rows.
- Per-member contribution (fighter / ally1 / ally2 / ally3
  shares of `mDealt` over fled first-fights), ability-touch
  damage share + excess, volley/pre-round share, rounds
  survived before flee, kill-gap per fled first-fight (HP and
  rounds-at-111).
- **Late-Rage-fire pin (secondary):** for every Rage fight in
  the first-fight population, the fire round from the FULL log;
  late = fire round ≥ 4. Observed-or-absent with counts.
- **Exploratory (NOT the verdict):** the same decomposition
  aggregated over ALL first-fights regardless of outcome
  (fled + killed + died + other), labeled exploratory — the
  analogue of dmgshape-b §3's full-population table.
- Wall numbers (national / table / wins, wave 4–5 unlocks,
  median survival, community loss, standing ≥200) reported
  every run and compared against partysurvive-rerun-b's wall
  on the SAME band as the reproducibility reference (the
  policy + bowcraft substrate moved since that leg; the
  comparison is descriptive, never a lever before/after).

## Design

- Driver: `scripts/dmgshape-rerun-driver-b.js` — a copy of
  `scripts/dmgshape-driver-b.js` with ONLY these changes:
  header comment, `arm` string `dmgshape-rerun-b`, default
  RUN `dmgshape-rerun-b`, default OUTDIR
  `perseed-dmgshape-rerun-b`, corpus file prefix
  `dmgshape-rerun-b-s<seed>`. The MODE guard stays
  `MODE=dmgshape`; all substrate assertions stay (SENSEEXPED,
  PARTYSIZE4, VETREENGAGE, FLEEREPAIR2, FIGHTALLY2, ALLYSLOT3
  flags =1; LEVER_PRESENT enforced — the leg must never
  re-scope to the control substrate). All recorder logic is
  byte-identical in behavior. Corpus:
  `evidence/2026-11-19/perseed-dmgshape-rerun-b/` (8 files).
- Analyzer: `scripts/analyze-dmgshape-rerun-b.js` — first-fight
  selection (frozen above) + `decomposeEncounter`/`aggregate`
  imported from `analyze-dmgshape-b.js` + wall via
  `analyze-fightcap-b.js` `summarizeLeg`. `--selftest` covers:
  first-fight selection fixtures (any-origin, earliest-day,
  21-day window, target-type match, fought filter, same-day
  file-order tiebreak, one fight shared by two launches,
  no-fight-in-window), classification counting (zero-landed-
  strike fight unclassified), and judge fixtures (GO shape,
  floor fail → METRIC-BROKEN, classified 0.80 → NO-GO,
  recon fail → INSTRUMENT).
- Proof test: `scripts/test-dmgshape-rerun-b.js` — port
  present + flags + analyzer selftest + a live 30d driver
  smoke on one designated seed (exit 0, 0 instrument
  errors, flags self-describing). Mirrors
  `test-dmgshape-b.js`.
- Panel: `scripts/balance-panel.js` compare of this corpus
  against the partysurvive-rerun-b corpus as a same-band
  reproducibility reference (NOT a lever before/after) via a
  re-pointed panel builder; if the tool refuses the unpaired
  comparison, record the refusal verbatim and report wall
  numbers directly (dmgshape-b §4 / partysurvive-rerun-b §8
  precedent — the panel is the instrument, the frozen
  threshold is the judge, and a refused panel is a recorded
  refusal, never a re-scored verdict).
- Telemetry: `node scripts/telemetry-check.js --baseline
  <scale-wall.json> --current 'evidence/2026-11-19/
  perseed-dmgshape-rerun-b/*.json' --metrics
  national,table,wins,exiled`; if it refuses recorder
  corpora, record the refusal verbatim and report wall
  numbers directly.

## Fixture (encounter-gear rule, Steve 2026-11-13)

No staged fixture: the corpus is live first-fights from the
competent policy on the designated band. The analyzer's
synthetic selftest stages its own rows, not live fights.

## Metric review (for the NEXT run — this run is judged as frozen)

- The population redefinition is the whole point of the
  re-run (finding #2605): the expedition-only, launched-
  party-only join measured the fight the launch was supposed
  to have; this run measures the fight the launch's target
  actually had first. The two populations answer different
  questions — do not compare their D_meas as if one
  corrected the other.
- Target matching is by TYPE id, not monster instance: the
  recorder carries no instance id, and a band can hold
  several live monsters of one type. A first fight against
  "the target" may therefore be against a different
  individual of the target species than the one the plan
  tracked (the plan tracks a node/sighting, not an id). The
  evidence will name the target type beside every first
  fight so this is auditable, and the sense-test will read
  whether the fought monster is the one the village meant.
- Day granularity: a same-day fight may precede the launch
  within the day (the analyzer sees days, not parts). The
  family's convention (day >= launch.day) is kept; a
  same-day first fight is flagged in the per-launch table
  so a reader can see how many rest on it.
- The fled floor (leg ii, ≥4) is new to this re-run: dmgshape-b
  needed ≥8 fled fights on a quad-only population; this run's
  population is wider (any size, any origin), so the floor is
  set at 4 — enough to carry the decomposition bars without
  pretending n=2 can. If the floor binds, the verdict kind
  is the same METRIC-BROKEN (pool) as leg (i).
- The classification bar prices a new failure mode explicitly:
  a fight with zero landed strikes cannot be decomposed (no
  P_mean to price from). On dmgshape-b's corpus that never
  happened (hit rate 1.000); on this wider population it
  might (a 0-damage first fight like nina's survey meetings).
  Such fights count in the pool, fail classification, and
  pull the bar — by design, not by accident.
- The panel compare is expected to refuse (unmatched origin
  — the two corpora carry different RUN labels). It is
  attempted anyway so the refusal is on the record; the
  reproducibility reference is the direct wall-number
  comparison against partysurvive-rerun-b on the same band.
