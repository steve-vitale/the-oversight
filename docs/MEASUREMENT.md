# MEASUREMENT.md — the house standard (Steve 2026-10-11)

How the loops test, measure, and prove. Short and enforceable, not
aspirational. If your run doesn't meet this, say so in the evidence file —
don't silently lower the bar.

## 1. Identical seeds, always

Every before/after claim runs the SAME seeds on both sides. Seeds are fixed
literals in the script or env (`SEEDS="7,42,99"`), never "a few random ones".
The standard runner is `scripts/sweep-compare.js`:

```
LEVER="my lever" SEEDS="7,42,99" POLICIES="competent,risk-aware" DAYS=60 \
  OUT=/tmp/out.json node scripts/sweep-compare.js
```

Minimum: 3 seeds × 60 days for a smoke claim; 6+ seeds × 200 days for a
reachability claim. Fewer than that is a probe, not a result — label it.

## 2. Multi-policy, always

One policy can't see strategy-dependence. Every lever runs at least TWO
policies on identical seeds: `competent` (the default baseline — its behavior
is pinned; don't "improve" it inside a lever run) plus the policy that
isolates your lever's question (`risk-aware` for fear, `larceny-leaning` vs
`kind` for justice, `deed-seeking` for deed curves, `winseek` for the ceiling).
The policy library lives in `scripts/policies/` with a README. If no existing
policy isolates your question, add one (one file, documented, deterministic)
instead of hand-rolling behavior into the sweep.

## 3. Seeded PRNG in proofs — no exceptions

A proof test asserting aggregate behavior over unseeded Math.random is flaky
by construction. Seed before eval (the harness does this: mulberry32 installed
as Math.random BEFORE modules load, because several capture it at load time),
expose a SEED env override, and re-run green on ≥3 seeds before calling it
done. Sample-gate share assertions (skip when n is tiny); day-normalize rate
comparisons.

## 4. Sense-reads are the bar, not the garnish

Buttons working is not the bar (Steve 2026-10-11: "not just that things work
but that they are sensical"). Every proof test that touches player-facing copy
prints the lines and the author reads them for meaning, coherence, and
relevance. Transcripts over counts: a conversation proof shows the exchange,
not just the exchange count.

## 5. What "green" means

- Proof test: all assertions pass on ≥3 seeds (state the seeds).
- Closest regression suites: green on the same tree (name them).
- Ontology: `scripts/validate-ontology.js` passes (headers valid).
- Determinism spot-check for new harness code: same seeds twice →
  identical tables (see sweep-compare self-test pattern).
- No bare `git commit`; `scripts/safe-commit.sh` only; merge `--ff-only`;
  never push/bump (ship loop owns it).

## 6. When a lever needs [needs-eyes]

Anything that changes feel, combat, or UI — damage numbers, new on-screen
copy, new beats, pacing changes — gets `[needs-eyes]` in the commit message.
The ship loop fast-tracks flagged batches to Steve's phone. When in doubt,
flag it: a false positive costs a tag, a false negative costs his trust.

## 7. Pacing is measured, not estimated

- Sims: `runDays` always records `result.pacing` — mean verbs/day,
  policy-calls/day, ticks/day, plus per-day rows. Quote these in lever
  evidence instead of guessing day length.
- Live: `endDay()` records real minutes-per-day into `state.pacing`
  (ring buffer, local only, never a network call); `Game.pacingStats()`
  reads it; the 🐞 debug panel shows median min/day. This is the data
  behind the 40-hour question — cite it, don't estimate.

## 8. Tooling changes nothing about balance

Measurement workers don't pull levers. If the harness spots a balance issue,
document it in the evidence file for the loops — don't fix it in the tooling
commit.

## 9. Staged seeds: the pilot gate (Steve 2026-10-12)

Never spend 12–20 seeds before knowing the lever does anything visible.
Every lever runs in stages, cheapest first:

- **Stage 0 — smoke (2–3 seeds, short horizon).** Does the lever's code path
  even fire? Does the primary metric move at all? If nothing fires, fix the
  wiring, not the tuning.
- **Stage 1 — pilot (8 seeds, question-appropriate horizon, before/after on
  identical seeds).** The GO/NO-GO gate. GO only if the effect is *obvious*
  in 8 seeds — visible in the raw numbers without statistics. (Steve
  2026-10-13: seeds are ~3s each — stop under-powering experiments; the old
  4-seed pilot was sized for expensive sims that no longer exist.)
- **Stage 2 — confirm (12–16 seeds).** Only on a pilot GO. This is the
  publishable measurement.

**Kill rule:** pilot delta below the pre-registered threshold → document it,
kill the lever, move on. No confirm spend on invisible effects.

The gate is a sniff test, not a significance test. If you need 20 seeds and
a p-value to see the lever's effect, the lever isn't pulling hard enough —
redesign it or park it.

Wall-clock budget (hourly loops): the pilot must fit in ~15 minutes. The
confirm gets the rest of the run. If the pilot can't fit, shrink the horizon
first (section 10), then the seed count — never skip the gate.

## 10. Death-aware horizons (Steve 2026-10-12)

A fixed 200-day horizon is waste when villages die at day 63. Set the horizon
from the lever's question and the measured survival distribution:

- **Early-game levers** (landing, food basics, wave 1): 60 days.
- **Mid-game levers** (waves 2–3, knowledge, regional): 100 days.
- **Reachability levers** (waves 4–5, national, table, wins): 150–200 days.
- **Adaptive rule:** horizon = min(cap, p95 village-death day from the
  baseline sweep + 15 days tail). The baseline sweep gives you the survival
  distribution for free — use it.
- **Stop rule:** a seed whose village is dead or scattered stops simulating.
  Succession/epilogue behavior gets at most a 10-day tail, then the seed is
  done. Never tick a dead village to fill a horizon.

Quote the horizon choice and its reason in the evidence header (section 11).

## 11. Pre-register the run (Steve 2026-10-12)

The evidence file header states, BEFORE running:

- primary metric (one — the thing this run is trying to move),
- minimum meaningful effect (the GO threshold for the pilot gate),
- horizon + why (section 10),
- seeds (exact literals), policies.

Judge the run against its header. If the data makes you move the goalposts,
record the change in the evidence file as a correction — never a quiet edit.
A run that pre-registered honestly and killed its lever is a good run.

## 12. Convergence and lever budgets (Steve 2026-10-12)

Tuning converges; it doesn't just continue.

- A lever is **converged** when two consecutive tuning steps move the primary
  metric less than the meaningful-effect threshold, or the metric hits its
  design target. Say so in the evidence file and move to the next lever.
- **Budget:** 3 rounds without passing the pilot gate → park the lever,
  document why, move on. Sunk cost is not a strategy.
- Every run reports convergence state in one line:
  `converging | converged | parked | killed-at-pilot`.

## 13. Playstyle balance (Steve 2026-10-13)

"Playstyles relatively balanced" is a standing target alongside winnability.
No degenerate single-build endgame: reaching national and winning must be
possible through multiple roads (LEAD/BELONG), multiple table paths (the 7 ×
light/dark), and multiple ability builds — not one solved route.

- The sweep (`scripts/sweep-winstats-deep.js`) records tablePath/tableBranch,
  abilities, synergies, road, and ascension per run. The analyzer
  (`scripts/analyze-winstats-deep.js`) prints a BALANCE VERDICT.
- Verdicts: `insufficient-data` (< 10 wins — distribution not judgeable yet) ·
  `DEGENERATE` (one path ≥ 60% of wins, or one ability in ≥ 70% of wins) ·
  `skewed` (one path ≥ 40%, or one ability in ≥ 55%) · `even` (otherwise).
- Honest sequencing: with ~1 win per 145 runs, balance is unmeasurable today.
  The verdict activates when wins exist. Levers keep working winnability
  first; when the win-path axis unblocks, the first balance verdict gates
  whether tuning continues or the design needs a real shake-up.
- Steve's ascension law holds in sims: the ending follows the village's
  story, and the analyzer's WINS DETAIL stays the audit trail.

## 14. Metric binding — the anti-drift rule (Steve 2026-10-13)

"Continually reevaluate our success metrics to prevent drift." Re-evaluation
happens BETWEEN runs, never within one. The failure mode: a run misses its
pre-registered GO, and the analyst re-scores the same run against a friendlier
metric instead of reporting the miss. (2026-10-13: the villager-counter pilot's
strict rule said NO-GO on attributed kills; the run was read as GO on ledger
kills instead — the metric moved mid-judgment.)

- Pre-registered metrics are BINDING for the run. Judge the run against the
  header (§11) exactly as written. A miss is a miss; report NO-GO.
- If the metric proves wrong (bad proxy, taxonomy artifact, blind channel),
  write it up under "metric review" in the evidence file and propose the
  revised metric FOR THE NEXT RUN. Never re-score the same run.
- Every evidence file carries a "metric review" section, even if it says
  "none — metrics held." The review is where drift gets caught: is the GO
  still measuring what Steve cares about (winnability, tedium, reachability),
  or has it become a number that moves without the game improving?
- Category/taxonomy changes (e.g. the 2026-10-13 corpseTakeItem social→food
  fix) invalidate previously published tables. When a taxonomy changes,
  regenerate the tables and stamp a dated CORRECTION note — never silently
  re-issue.
- Guardrails are metrics too: a GO met with a guardrail breached is NO-GO.

### 14a. Kill verdict taxonomy (Steve 2026-10-16 — "question the underlying assumptions")

A KILL is not a single verdict. Every killed arm MUST classify its kill in
the evidence file's verdict section, using one or more of:

- **CONCEPT-DEAD**: the mechanism was staged, the metric was fair, and the
  concept failed on its merits. Do not retry without a new mechanism.
  (Example: learnfight — withdrawal from hostile trick-bearers is
  structurally lethal; the funnel moved but the price was wrong.)
- **METRIC-BROKEN**: the bar was unachievable, mis-scoped, or measured noise
  — the pilot could not have passed regardless of the concept's merit.
  The arm returns to the queue with a corrected pre-registration; this is
  a NEW run, not a re-score. (Examples: monstermeat-b — bar 30x the pool,
  flagged by the pre-pilot probe; fieldports — metric conflated mechanism
  with contact; feastexposure — guardrail miss on n=8 perturbation with no
  mechanism.)
- **SUBSTRATE-MISSING**: the engine does not stage what the arm needs
  (unwired witnesses, missing verb, truncated horizon). The arm BLOCKS on
  the substrate being built, then re-runs. Do not run more arms against a
  missing substrate. (Examples: witnesslearn — node-mate witnesses never
  wired; siegeroster — muster beat fires but no shelter verb exists;
  counterres — seat driver truncates the trick game before it matures.)

The taxonomy is the anti-waste rule: a METRIC-BROKEN or SUBSTRATE-MISSING
kill that gets filed as CONCEPT-DEAD buries a live idea. When in doubt
between CONCEPT-DEAD and the other two, the autopsy's mechanism section
decides: if no mechanism for the failure was found in the arm's own logic,
it is not CONCEPT-DEAD.

### 14b. Pre-pilot substrate checklist (Steve 2026-10-16)

Before spending a pilot, verify the engine actually stages what the arm
needs. All four checks run BEFORE the sweep; a failed check blocks the
pilot until fixed (fixing the pre-registration before the run is not
re-scoring — re-scoring only happens after numbers are observed):

1. **Contact**: does the phenomenon occur on the measurement substrate?
   (Probe: does the target species spawn field fights? Do witnesses exist
   at kill sites? If the probe shows zero contact, the pilot measures
   nothing — fix the substrate or the scope first.)
2. **Pool sizing**: is the addressable pool within an order of magnitude of
   the bar? (Probe the pool BEFORE pre-registering the threshold; set the
   bar as a multiple of the pool, not an absolute figure pulled from nowhere.
   The monstermeat-b 30x-pool kill was a foregone conclusion — wasteful.)
3. **Verb existence**: does the engine have the verb the arm's mechanism
   needs? (If the arm narrates defense, the engine must be able to move
   villagers to safety. Narration without mechanism is theater — the
   siegeroster finding.)
4. **Horizon fit**: does the measurement window contain the phenomenon?
   (If the trick game needs d81+ and the substrate wins at d89, the pilot
   is eight days wide — the counterres finding.)

### 14c. Roster measurement rule (Steve 2026-10-16)

Survival and defense arms MUST pre-register villager (non-scholar) combat
deaths as a co-primary alongside any scholar metric. The scale wall lives
in the roster, not the scholar: siegedef2r protected the scholar (2 vs 5
deaths) while the village died around them (d120, d97 village-dead) — a
scholar-only metric cannot see the wall it claims to measure.

## 15. Balanced comparison panels — the shared instrument (Steve 2026-10-17)

The before/after comparison now runs through one shared instrument instead
of each loop's ad-hoc sweep output: `scripts/balance-panel.js` builds paired
panels (identical seeds, matched options, observation-neutrality proofs) and
`scripts/lib/balance-scorecard.js` compares two panels against the 23-metric
contract in `scripts/balance-metrics.json` (digest-pinned: panels built under
different contract digests are mechanically rejected as incomparable).

The panel is the INSTRUMENT, not the judge. §14 still binds: the run's
pre-registered primary metric and GO threshold decide GO/NO-GO. A panel
status (`no_material_signal`, `review_required`, `regression_signal`) is
evidence — it never overrides the pre-registered verdict, and a
`review_required` on a secondary metric is an investigation note for the
evidence file, not a license to re-score the run.

- Build: `node scripts/balance-panel.js --out <panel-dir> --seeds <csv>
  --policies <csv> --days <horizon>` on the base commit, then again with the
  lever applied. Compare: `node scripts/balance-panel.js compare --before
  <base-panel.json.gz> --after <lever-panel.json.gz> --out <prefix>`;
  attach the resulting `.md` to the evidence file.
- Pass `--policies` explicitly from the current POLICY_REGISTRY. The reconciled
  root includes capable/maker/merchant/caregiver and socialite. Older Muse
  reports describing missing defaults apply to their historical roots only.
  Do not substitute a different controller to make two old panels compare.
- Validity: a panel with validity errors is not evidence — repair and rerun.
  Never waive a policy/harness mismatch as if only Game changed. Overlay the
  same current controller/harness on both Game roots, or use the dedicated
  policy/harness revision analysis described in SIMULATING.md and retain
  its changed-file scope and reason. An invalid panel is not a balance gate.
- Commit the panel summary only: `panel.json.gz` + the compare `.md`/`.json`.
  NEVER commit the `cases/` cache (thousands of per-case archives) — it is
  reproducible from seeds + digests. Cache bloat is what turned one agent's
  branch into 18k committed files.
- Sizing follows Steve's current AGENTS instruction: start with16 matched
  seeds per capable/maker/merchant/caregiver, adding named region/job cohorts
  for the feature. Use64 and independent holdouts for small-effect claims.
  Historical8/12/16 runs remain pilots/screens, regardless of their old labels.
- The contract is versioned (`schemaVersion` + digest). Changing a metric,
  tolerance, or direction is a Steve-call; both agents adopt the same digest
  or their panels cannot be compared. The scorecard enforces this — it is
  the mechanical end of the coordination rule in docs/AGENT-LANES.md.

### Reconciled workflow (2026-10-17, Muse9072f375 + Codex)

Keep pre-registered questions and thresholds; never re-score a miss after
seeing results. Review every policy's survival, community, resources,
progression and earned gear alongside the primary question. Win changes in
either direction require investigation. More wins cannot cancel another
warning. See MEASUREMENT-PLAN.md and SURVIVAL-LEVERS.md. The current integration
screen remains review_required: stronger caregiver wins coexist with maker/
socialite gear warnings and community/resource watches. Do not tune quotas.

Read docs/SIMULATING.md before reusing a legacy diagnostic. Load one harness
per process, even for sequential comparisons: modules retain captured globals.
The isolated Witness and gorge-drive checks are in the shared check workflow.
Legacy multi-load diagnostics are historical evidence until isolated and
rerun; passing them does not waive source or observer validity. Source roots
are immutable during a sweep. Retain all raw panels, both feature censuses,
configuration/source/contract hashes, exclusions and the tradeoff decision.
See evidence/2026-10-17/muse-9072-audit.md for branch inventory and continuations.

### Panel contract rulings (Steve 2026-10-24)

Three contract changes, all Steve's call under the rule above. The contract
digest changes with them, so panels built under an older digest are
mechanically incomparable — cross-era reading is manual, never a compare run.

- **665 — `table` counts sittings, not invitations.** A run counts when the
  seat is taken (`row.entered`), whether or not a waiting invitation was ever
  observed. Prompt-seat substrates skip waiting, and counting invitations
  printed a fake regression there. Consequence, stated plainly: `table` and
  `entered` now agree by construction (both count the sitting) until a future
  ruling separates them.
- **753 — village deaths and player deaths are tracked separately.**
  `villageDeaths` counts every death recorded in the run; `playerDeaths`
  counts only deaths of the player-flagged character. Comparability map, by
  builder: old per-arm panels computed `playerDeaths` as total deaths — read
  those columns as `villageDeaths` now. Old shared panels already computed
  `playerDeaths` from player-flagged deaths only — read those columns as the
  new `playerDeaths`. The new narrow `playerDeaths` is never comparable to an
  old per-arm `playerDeaths`.
- **797 — declared-intervention-flag exemption.** The compare accepts
  `--intervention-flags <csv>`: a flag declared there is exempted from the
  flags match and recorded on the report (declared flags plus their
  before/after values). The exemption is never inferred — an undeclared
  differing flag still invalidates the comparison, and a malformed
  declaration invalidates it too.
