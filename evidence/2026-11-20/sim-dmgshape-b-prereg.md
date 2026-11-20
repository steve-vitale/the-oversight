# sim-dmgshape-b — FROZEN prereg (Loop B 0530Z run, arm sim-dmgshape-b)

**Frozen:** 2026-11-20 ~06:40 UTC, BEFORE any judged sim. Base master
`0d925556a` (batch ship 8cd4c0181-20261120-052438) + coordinator-authorized
ALLYSLOT3 port `a1cd6cdc0` (cherry-pick of `f4d1100ee`, see below).
Branch `sim-dmgshape-b`. Worktree `~/workspace/worktrees/sim-dmgshape-b`.
**Diagnostic:** instrument-only — ZERO `src/js` game-code changes
except the coordinator-authorized ALLYSLOT3 substrate port. The
instrument is a renamed driver copy + a merged analyzer in `scripts/`
(pure reads of the fight record `rec`); the game is untouched.

## The question (finding #2605; tracker blank #1 from the 0130Z adoption closeout)

The damage question underneath — what lifts a launched party toward
~111 damage/round — re-measured with damage-per-launch defined as
"first fight against the launch target, any origin". Two prior legs
NO-GO'd METRIC-BROKEN on a thin pool: sim-dmgshape-b (1230Z, fresh
band 105931–105938: 5 launches, 3 fled fights) and
sim-dmgshape-rerun-b (2130Z, designated band 106081–106088: 4
launches with a first fight vs floor 6, 3 fled vs floor 4;
accounted 0.694 vs 0.70, top baseCeiling 61.9% — reported, not
banked). The survey sim-dmgsurvey-b (GO, landed 8cd4c0181) screened
4 fresh bands under the full landed substrate and DESIGNATED band
**106181–106188** for exactly this run: 16 launches, 9 counted /
6 distinct first-fights, 6 fled, 3 died, 0 killed; 9 quad launches.
This run measures the damage decomposition on that designated band,
with the ALLYSLOT3 slot ported (the survey ran with the slot
env-only) and the pool re-verified on arrival.

## Substrate (frozen)

- Flags: SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1
  FIGHTALLY2=1 ALLYSLOT3=1 LAUNCHSURVIVE=1, identical to
  sim-dmgshape-rerun-b. The fightcap driver refuses without the
  slot, so the port is required for the diagnostic to run.
- **Port (coordinator-authorized, evidence-only):** cherry-pick
  `f4d1100ee` (partysurvive's own port of held sim-allyslot3-b
  `7efbf26a8` via sim-fightcap-b `5a5343363`) onto this branch,
  landed as `a1cd6cdc0`. Verified NOT an ancestor of master
  before picking (`git merge-base --is-ancestor f4d1100ee HEAD`
  = no). Verified after picking: ALLYSLOT3 12x fieldFights.js,
  3x game.js, 3x party-wiring.js; ally3Vid 31x fieldFights.js.
  Proof: `scripts/test-allyslot3-b.js` (arrived with the
  cherry-pick), 18/18 green. The port must NEVER be merged to
  master as a game change — this branch holds it only so the
  diagnostic can run; the coordinator lands evidence-only or
  releases the branch done-abandoned.
- **Worktree reset at arm start:** the coordinator-registered
  worktree arrived holding the 1230Z run's branch tip
  (`35ff44e43`, base `e1f00206`, NOT the brief's base master
  `0d925556a`). The branch was reset to master `0d925556a`
  (worktree clean, nothing uncommitted lost); the 1230Z tip is
  preserved as branch `sim-dmgshape-b-1230Z` at `35ff44e43`,
  and the 1230Z evidence is already on master
  (`evidence/2026-11-19/sim-dmgshape-b.md`). The reset is
  recorded here, not hidden.
- **Policy frozen:** `scripts/policies/competent.js` sha256
  `150229eda010b89e4c73c0e7e68d06d30a7191cc3748778339c81f09e470161a`
  (first 12: `150229eda010`; git blob `8f8307b54dee`) — the same
  policy the survey and the rerun ran. Verified before freezing.
  If the policy moves before the judged leg, record it and STOP
  (frozen-base check, do not silently proceed).
- **BOWCRAFT turn-on is live on this base** (substrate note from
  the rerun prereg, inherited). Bowcraft is NOT re-judged here.
- Horizon: 150d, death-aware (dead villages stop, +10d tail max).
- Policies: competent verbatim only.
- Seeds: **106181–106188, the FULL designated band, never a
  subset.** Seed-band freshness: the band is a DESIGNATED REUSE
  (designated for exactly this run by
  `evidence/2026-11-20/sim-dmgsurvey-b-prereg.md`). Verified
  before freezing: `grep -rln "106181" evidence/ --include=
  "sim-*-prereg.md"` over all 1044 dated preregs returns ONLY
  `evidence/2026-11-20/sim-dmgsurvey-b-prereg.md` — the
  designating survey itself; the same grep for `106171`
  (runner-up) returns only the same file. Runner-up
  106171–106178 is named as fallback ONLY if the designated
  band is disqualified — do not switch bands mid-run.

## CAVEAT (inherited from the survey, stands)

The survey ran with ALLYSLOT3 env-only (port `f4d1100ee` NOT an
ancestor of master; zero ALLYSLOT3 in src). The designation is
valid on the substrate as run. This run ports ALLYSLOT3 and
RE-VERIFIES the pool on arrival; if the pool shifts below the
floor, the verdict is NO-GO kind METRIC-BROKEN (pool) with the
substrate-corrected launch count as the headline. Do not drop
dead seeds or re-scope the band.

## Judged population (frozen — rerun definition verbatim)

**Launches:** `v4departs` rows with `result: 'launch'`,
`targetWave >= 4`, `target` non-null — the survey's counting,
all party sizes (trio + quad), so the substrate-corrected
launch count compares directly with the survey's 16.

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
`aggregate`).

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
  (fled + killed + died + other), labeled exploratory.
- Wall numbers (national / table / wins, wave 4–5 unlocks,
  median survival, community loss, standing ≥200) reported
  every run and compared against the dmgsurvey designated-band
  corpus as a reproducibility reference (the policy is the same
  but the slot is now live in code; the comparison is
  descriptive, never a lever before/after).

## Design

- Driver: `scripts/dmgshape-driver-b.js` — a copy of
  `scripts/dmgshape-rerun-driver-b.js` with ONLY these changes:
  header comment, `arm` string `dmgshape-b`, default
  RUN `dmgshape-b`, default OUTDIR `perseed-dmgshape-b`,
  corpus file prefix `dmgshape-b-s<seed>`, and the two
  stack-skip filename strings (functional: the renamed file
  must skip its own frames). The MODE guard stays
  `MODE=dmgshape`; all substrate assertions stay (SENSEEXPED,
  PARTYSIZE4, VETREENGAGE, FLEEREPAIR2, FIGHTALLY2, ALLYSLOT3
  flags =1; LEVER_PRESENT enforced — the leg must never
  re-scope to the control substrate). All recorder logic is
  byte-identical in behavior. Corpus:
  `evidence/2026-11-20/perseed-dmgshape-b/` (8 files).
- Analyzer: `scripts/analyze-dmgshape-b.js` — MERGED, not a
  blind copy (deviation from the brief, recorded here before
  freezing): a literal copy of
  `scripts/analyze-dmgshape-rerun-b.js` over
  `analyze-dmgshape-b.js` would self-import — the rerun
  analyzer does `require('./analyze-dmgshape-b.js')` for
  `decomposeEncounter`/`aggregate`, so the copy would load
  itself and `decomposeEncounter` would be undefined. The
  merged file therefore keeps the decomposition home IN
  `analyze-dmgshape-b.js` (log-parsing, `decomposeEncounter`,
  `aggregate`, `WIN_SHAPE`, moved in-file byte-identical from
  the 1230Z module — verified by diff after the move) and
  takes the rerun analyzer's selection/judging/selftest
  (launchesOf, firstFight, isClassified, isStrictClassified,
  analyzeFile, analyzeDir, judge, BARS) adapted to the
  dmgshape-b names. The 1230Z quadKills-based analyzeDir/judge
  is superseded (preserved in git history); its decomposition
  fixtures (§B synthetic, §B2 Rage/ability-excess, §B3
  aggregate identity) are RETAINED in the merged selftest
  beside the rerun's §A selection / §B classification / §C
  judge fixtures. The merged analyzer keeps exporting
  `decomposeEncounter`, `aggregate`, `WIN_SHAPE`, so the
  existing import chains (`analyze-dmgshape-rerun-b.js`,
  `analyze-dmgsurvey-b.js` via the rerun analyzer) keep
  working.
- Proof test: `scripts/test-dmgshape-b.js` — mirrors
  `scripts/test-dmgshape-rerun-b.js`: §A analyzer selftest +
  §B corpus-reproduction check over the FROZEN dmgsurvey
  designated-band corpus (survey: 16 launches, 9 first-fights,
  6 fled, 0 killed, 3 died, 6 distinct — reproduction of the
  PRIOR corpus through the new instrument, not a judged sim).
  The analyzer's own selftest includes the driver smoke (one
  30d seed on the designated band, exit 0, 0 instrument
  errors, flags self-describing, port present, arm label
  dmgshape-b).
- Panel: `scripts/balance-panel.js` compare of this corpus
  against the dmgsurvey designated-band corpus as a
  reproducibility reference (NOT a lever before/after); if it
  refuses, record the refusal verbatim and report wall numbers
  directly (dmgshape-b §4 / partysurvive-rerun-b §8 precedent).
- Telemetry: `node scripts/telemetry-check.js --baseline
  <scale-wall.json> --current 'evidence/2026-11-20/
  perseed-dmgshape-b/*.json' --metrics
  national,table,wins,exiled`; if it refuses recorder corpora,
  record the refusal verbatim and report wall numbers directly.

## Expectation (not a bar)

A fled pool: the survey measured 6 fled, 3 died, 0 killed on
this band (9 counted / 6 distinct first-fights). Plan the
decomposition on 6 DISTINCT fights, not 9 counted. Do not
expect kills from this band. The 'audit' churn on 106188 (5
no-fight launches vs 'audit') is a lever candidate, not this
arm — classify repeat-target no-fight launches as their own
class, do not chase them.

## Fixture (encounter-gear rule, Steve 2026-11-13)

No staged fixture: the corpus is live first-fights from the
competent policy on the designated band. The analyzer's
synthetic selftest stages its own rows, not live fights.

## Metric review (for the NEXT run — this run is judged as frozen)

- The population redefinition is the whole point of the
  re-measurement (finding #2605): the expedition-only,
  launched-party-only join measured the fight the launch was
  supposed to have; this run measures the fight the launch's
  target actually had first. The two populations answer
  different questions — do not compare their D_meas as if one
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
- The fled floor (leg ii, ≥4) is new to the rerun family:
  dmgshape-b needed ≥8 fled fights on a quad-only
  population; this run's population is wider (any size, any
  origin), so the floor is set at 4 — enough to carry the
  decomposition bars without pretending n=2 can. If the
  floor binds, the verdict kind is the same METRIC-BROKEN
  (pool) as leg (i).
- The classification bar prices a new failure mode explicitly:
  a fight with zero landed strikes cannot be decomposed (no
  P_mean to price from). On dmgshape-b's corpus that never
  happened (hit rate 1.000); on this wider population it
  might (a 0-damage first fight like nina's survey meetings).
  Such fights count in the pool, fail classification, and
  pull the bar — by design, not by accident.
- The panel compare is expected to refuse (unmatched origin —
  the two corpora carry different RUN labels). It is
  attempted anyway so the refusal is on the record; the
  reproducibility reference is the direct wall-number
  comparison against the dmgsurvey designated-band corpus on
  the same band.
- Counted vs distinct: the survey's designated band counts 9
  first-fights but only 6 distinct fights (106184's d102 and
  d106 launches share the d110 fight; 106188's d125 and d129
  launches share the d130 fight; 106186's d47 and d49 launches
  share the d50 fight). The pool floor (i) counts launches
  with a first fight (9 on the survey substrate); the
  decomposition is judged on the fled subset, planned on 6
  distinct fights. If the port moves the shared-fight
  structure, the distinct count — not the counted one — is
  what the decomposition stands on.
- The analyzer merge (see Design) changes file layout, not
  decomposition: `decomposeEncounter`/`aggregate` move
  in-file byte-identical. If the merged selftest's §B/§B2/§B3
  fixtures fail, the merge — not the decomposition — is
  suspect; do not re-tune the decomposition to pass them.
