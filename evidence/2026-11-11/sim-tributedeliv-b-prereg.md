# sim-tributedeliv-b — prereg (Loop B, arm 2 of 3)

- **Run:** fleshout-loop-b-20261111T1830Z, arm sim-tributedeliv-b
- **Arm:** tribute-delivery diag — instrument-only, ZERO src/js. Findings #2255
  (M24B, claimed by this run): no tribute delivery fired in 13 runs, no honest
  refusal measured.
- **Base:** local master at run start (record anchor commit in evidence).
- **Canon:** no `docs/` file covers the military tribute. `docs/CANON.md` and
  `docs/MONSTER-WAVES.md` were read first; the veteran-bar rule comes from
  MONSTER-WAVES.md design call #4 (2026-10-16) and Steve's 2026-11-10
  scholar-counts ruling. The tribute rule is read from code only
  (`src/js/ladder.js` countLivingVeterans / ladderCapstoneReady,
  `src/js/table.js` ladderDeliverCapstone, `src/js/app.js` panelHaven) —
  nothing here invents canon.

## Code facts verified by reading (before sims)

- `ladder.js countLivingVeterans(G, 4)` returns `{veterans, payable}`:
  veterans = living wave-4+ killers INCLUDING the scholar (Steve RULED
  2026-11-10); payable = the non-scholar subset. A killer must be alive
  and on the village roster (`vp.dead` false, roster member; scholar
  always counts as living).
- `ladderCapstoneReady('military_tribute')` reports ready when
  veterans >= 2 (need from `src/data/ladder-capstones.json`), and carries
  `payable` on the return.
- `table.js ladderDeliverCapstone('military_tribute')` is the Haven
  entry-point delivery (app.js panelHaven calls it). It re-checks
  readiness, then picks 2 living wave-4 veterans, NEVER the scholar,
  distinct killers in waveKillLog order, `isLiving` = non-scholar +
  `vpOf(vid)` exists and `!vp.dead` (catch → true; NOTE: no roster check
  in the delivery's own isLiving, unlike ladder.js). Fewer than 2 →
  `{ok:false, reason:'veterans-short', veterans: seen.length, need:2}`.
  Other reasons: 'delivered' / 'not-ready' / 'over' / 'read-error'.
- Prime suspect (code-level): readiness counts the scholar, delivery needs
  2 PAYABLE — ready can hold with payable = 1 (scholar + 1 villager).
  Second branch: delivery is a player Haven-panel act
  (`app.js panelHaven`); a grep of `scripts/policies/` and
  `scripts/sim-harness.js` finds NO call to `ladderDeliverCapstone` —
  the competent policy may never attempt it. Both branches are measured,
  not assumed.
- Known-ready seeds (vetphantom band, fix leg, end-of-run reads):
  190393 tribute `{ready:true, veterans:2, payable:1}` — the prime
  suspect holds at end state; 190397 tribute `{ready:true, veterans:2,
  payable:1}` — CORRECTION to the task brief's "payable:2": the
  per-seed fix-leg JSON
  (`perseed-vetphantom-b/vetphantom-s190397-vetphantom-pilot-fix.json`)
  reads payable 1 at end, same shape as 190393. Both known-ready seeds
  end scholar+1. The re-trace must still confirm this day-by-day
  (payable may have reached 2 on earlier ready days).

## Method

- (a) Re-trace seeds 190393 / 190397 day-by-day through their ready
  windows with a new recorder (`scripts/tributedeliv-driver-20261111.js`,
  built on the vetphantom driver's pattern; reuses its
  `ladderCapstoneReady` read). Same seeds, same competent policy —
  trajectories must reproduce the vetphantom fix leg (cross-check:
  end tribute read, days, standing).
- (b) Fresh 8-seed band 190411–190418, competent policy verbatim, 150d
  death-aware (dead villages stop, +10d tail max).
- Per day per seed the recorder logs: `ladderCapstoneReady('military_tribute')`
  `{ready, veterans, payable, need, reason}` PLUS a replication of the
  delivery gate's own `seen` count (wave-4 log entries, distinct, living,
  non-scholar, in log order — replicating table.js isLiving verbatim,
  including its no-roster-check behaviour, plus a roster-membership flag
  per seen killer for diagnosis) PLUS a wrap on `ladderDeliverCapstone`
  logging every delivery attempt and its outcome. The wrap also proves
  the policy-attempt count (expected 0 — the policy never calls it).
- Corpus: `evidence/2026-11-11/perseed-tributedeliv-b/` (one JSON per
  seed, writeRobust pattern from the vetphantom driver).
- Analyzer: `scripts/tributedeliv-analyze-20261111.js` — classifies EVERY
  ready-day's non-delivery by a named code condition; 0 UNCLASSIFIED
  allowed.

## Ready-day classification codes (named conditions)

- `PAYABLE_SHORT` — ready && payable < 2: delivery would refuse
  `veterans-short` (includes the scholar+1 shape; sub-flag
  `scholarIsVeteran` when the scholar is one of the counted veterans).
- `DELIVERABLE_NO_ATTEMPT` — ready && payable >= 2 && no delivery
  attempt that day: the pair stands, nobody attempts the delivery
  (policy never calls the Haven entry point).
- `ATTEMPT_REFUSED_<reason>` — an attempt was made and refused
  (reason from the delivery return, e.g. veterans-short, over,
  read-error).
- `DELIVERED` — an attempt succeeded (`ok:true`).
- `UNCLASSIFIED` — no code applies. Must be 0.

## Primary metric (binds the run, §14)

- **ready-days classified / ready-days total. DIAG-GO = 100% classified,
  0 UNCLASSIFIED**, across the re-trace seeds + the fresh band combined.

## Secondary metrics

- Deliverable-pair days (payable >= 2) band-wide (fresh band + re-trace).
- Ready-days split by (veterans, payable) — how many ready-days are
  scholar+1 vs true-pair shapes.
- Delivery attempts (count + outcomes) — expected 0 from the policy;
  any attempt is reported with its outcome.
- Wall numbers every run: national / table / wins, wave 4–5 unlocks,
  median survival.

## Horizon / seeds / policies

- Horizon 150d death-aware (matches the vetphantom band).
- Seeds: re-trace 190393, 190397; fresh band 190411–190418.
- Policies: competent verbatim.
- Seed band freshness: band 190411–190418 checked FRESH per
  `~/workspace/custom-skills/local_seed_band_freshness/SKILL.md` —
  grep over `evidence/*/sim-*-prereg.md` (zero hits for 19041x) and
  over all `evidence/**/*.md` (zero hits for any of 190411–190418).
  Goal `hidden_files/` grep returned 7 files, ALL false positives on
  inspection: the digit strings sit inside longer floats/hashes, never
  as seed reservations — `0.24646967141904116` (belongfeast-s6103.json),
  `4954.1108190414` (journey-landing-r50-census-627.json),
  `0.021465819041543235` (medheadcount panel case), same class in the
  sim-easingchannels panel cases and the armc-b-partial copies of the
  first two files. No prereg, forbidden list, or screen names this band.
  FRESH — recorded before any judged sim.

## Proof

- `scripts/test-tributedeliv-b.js` proves the instrument before judged
  sims: (1) synthetic ready-states with payable 1 vs 2 classify
  correctly (`PAYABLE_SHORT` vs `DELIVERABLE_NO_ATTEMPT`); (2) the
  driver records all fields on every day; (3) the analyzer leaves 0
  unclassified on a known corpus (synthetic + one real re-trace seed).
  Judge the run against this header.

## Sense test

- Read 1–2 transcripts on days tribute is ready — do villagers or
  narration mention the tribute at all? Judge meaning, not counts.
  (`Game.say` capture filtered /tribute|TRIBUTE/i, plus the vetphantom
  say corpus for the re-trace seeds.)
