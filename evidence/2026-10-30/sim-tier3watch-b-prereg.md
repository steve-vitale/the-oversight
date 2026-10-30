# sim-tier3watch-b — PREREG (binding, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1928Z,
arm sim-tier3watch-b, axis food-economy. Worktree sim-tier3watch-b.
MEASUREMENT ONLY — zero game/policy changes in this arm. Main tree
never touched. Sibling trees never touched.

## Question (backlog #1545, claimed by this run)

Loop-B arm sim-stashfetch-b (evidence/2026-10-30/sim-stashfetch-b.md,
panel compare sim-stashfetch-b-panel-compare.md) showed earned player
tier-3+ weapon/armor access 0.5625 -> 0.5 on its balanced panel,
status regression_watch, exploratory paired interval -0.25 to +0.125
(includes 0). Question: does the dip persist on current master, or
was it noise / base drift? This arm re-reads the spec; it does not
fix anything. A real regression found here is reported as a finding
for a future fix arm, NOT fixed here.

## Spec reproduced exactly (no substitution)

- Instrument: scripts/balance-panel.js (§15), the stashfetch panel
  equivalent, same command shape:
  `node scripts/balance-panel.js --out
  evidence/2026-10-30/sim-tier3watch-b-panel --seeds
  16101,...,16116 --policies competent --days 60`
- Seeds: 16101-16116 (the stashfetch band, all 16).
- Policy/substrate: competent, standard competent substrate (NOT the
  nighttravel recorder substrate of the stashfetch primary metric —
  the tier-3+ watch item lives on the panel, and the panel substrate
  is what is re-read).
- Horizon: 60 days, death-aware (panel observation cap; runs stop at
  engine over / village loss, same as stashfetch).
- Access definition (EXACT, from the observer code — no canon doc
  defines this metric; docs/CANON.md only states monster tiers ≠
  loot tiers, which this metric respects by reading loot tiers):
  panel metric `goodGear` = 1 for a seed iff the gear census records
  at least one grant with who === 'player', gear === true (item def
  has armor or weapon), and tier >= 3 where tier = lootTier || tier
  || 1 (scripts/balance-panel.js finish(): `census.grants.filter(g =>
  g.who === 'player' && g.gear && g.tier >= 3)`; grants recorded by
  scripts/gear-usage-audit.js METHODS wrappers). Starting gear is
  excluded by the observer (acquisitions only; startingTier is nulled
  for this metric path). Sub-metrics (contest/show, craft/trade,
  corpse) are reported descriptively, never as substitute judges.
- Historical values (extracted read-only from the committed stashfetch
  panel.json.gz files, verified before this prereg):
  before 9/16 = 0.5625 (1s: 16101, 16105, 16106, 16108, 16109, 16110,
  16111, 16112, 16115); after 8/16 = 0.5 (1s: 16101, 16105, 16106,
  16107, 16109, 16110, 16111, 16115). Before->after flips: 16107
  0->1, 16108 1->0, 16112 1->0 (net -1 seed).
- Panel reproduction check (part of the verdict, judged before any
  rate claim): the current panel must run all 16 cases with
  sourcesStable and a neutrality match on the proof seed, and the
  observer digest/contract must still define goodGear as above. If
  the script moved, the definition changed, or cases fail, the spec
  does NOT reproduce exactly: verdict is inconclusive, the difference
  is stated exactly, and the spec is re-registered explicitly in a
  prereg amendment — never silently substituted.

## Primary metric

Current-master goodGear rate on seeds 16101-16116 (count/16), with a
per-seed table (current vs stashfetch-before vs stashfetch-after)
and a Wilson 95% interval for the current rate. Because current
master carries many landings since stashfetch, per-seed paired deltas
against the old panels are DESCRIPTIVE only (trajectories diverge by
construction); the judge is the current rate against the two
historical levels, read with the interval.

## Verdict (binding, stated before the sweep)

- RESOLVED iff current rate >= 9/16 (0.5625) — back at or above the
  stashfetch-before level.
- PERSISTS iff current rate <= 8/16 (0.5) — still at or below the
  stashfetch-after level.
- INCONCLUSIVE iff the spec fails to reproduce exactly (see above),
  or the panel itself is invalid (sources unstable, neutrality
  mismatch, case failures). A 1-seed gap between the levels is within
  noise at n=16 and the verdict is therefore a level read, not a
  significance claim — the Wilson interval is reported alongside and
  must not be hidden behind the one-word verdict.

## Measurement-GO threshold (binding; this is a measurement, not a lever)

The re-read completes on the stated spec with a per-seed table +
Wilson interval + verdict stated. There is no game GO/KILL here, only
measurement completeness. A miss (spec unreproducible, panel invalid,
per-seed table unextractable) is NO-GO on completeness, reported
honestly — never re-scored against a friendlier metric mid-run.

## Pilot rule

No pilot is spent: the spec reproduces exactly (same script, same
seeds, same definition, same panel method, verified above), so the
full 16-seed band IS the measurement, stated here per the task brief.
If the reproduction check fails at panel time, the run stops and the
verdict is inconclusive with the difference stated — no substitute
band is run under this prereg.

## Instruments

- scripts/sweep-tier3watch-b.js (new) — reproducible wrapper: runs
  the panel command above, extracts per-seed goodGear + sub-metrics
  from panel.json.gz, computes the Wilson 95% interval, writes
  evidence/2026-10-30/sim-tier3watch-b-panel-summary.json. It does
  NOT re-implement the metric; the panel remains the instrument.
- evidence/2026-10-30/sim-tier3watch-b-panel/panel.json.gz (committed;
  cases/ caches deleted before commit, per stashfetch convention).
- evidence/2026-10-30/sim-tier3watch-b.md (measurement, per-seed
  table, verdict, village assessment in plain words, metric review).

## Sense-test (law)

From the current panel's gear census, pick one tier-3+ acquisition
(item, source, day, seed) and describe in words how the villager
actually got the gear. Flag anything robotic, static, or repeated in
the sampled behavior. A grant record is not a transcript line — say
which it is.

## Metric review (section in the evidence file, filled at write time)

Doubts about the metric itself go here for the NEXT run; they do not
re-score this run.
