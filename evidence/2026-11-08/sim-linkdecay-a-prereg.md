# sim-linkdecay-a — prereg: the 76408-class pre-national link-decay diag

Run: fleshout-20261108T2315Z (Loop A). Worktree:
`~/workspace/worktrees/sim-linkdecay-a` (branch sim-linkdecay-a, cut at master
93e7bea26). Axis: scale-onramp / winnability chain (converging, NOT
converged). DIAG ONLY — zero src/js, no default flips.

## Canon + code read first (before any sim)

- docs/CANON.md, docs/SCALE.md.
- Prior decomposition, NOT re-measured:
  - evidence/2026-11-08/sim-tendtrust-b.md (Loop B 1230Z, base 715c2918d):
    the tend/trust gate exactly (links form at trust 30; seasoned = 30+
    days AND trust 40+; tendLink = 1,500 kcal → +8 trust, once/week/link,
    refuses during mourning; `_trustGain` is the single choke — no gains
    while the link's village grieves, 7 days after a speaker death; NO
    passive weekly trust decay — trust moves only through events). The
    ledger: succession shakes −8 on EVERY link per leader death are the
    dominant drag (89 events, −692); tribute nearly nets out; the engine
    drive fires ~1 week in 3 (actor-presence throttle, UNMEASURED — no
    actor-presence field in any corpus). The tendtrust-b recorder
    (scripts/policies/tendtrust-b.js) is a proven-neutral default-OFF
    policy instrument.
  - evidence/2026-11-08/sim-tenddrive-a.md (Loop A 2216Z, base 6680d7924):
    the downstream failure — seed 76408 qualifies d58 with 4 subs and
    trust 49–65, but links decay d60→99 (village_0 53→18); seasoned subs
    4→1; NO national beat ever stages. 11 policy tend attempts, all 11
    mourning-refused; 5 engine tends. A PRE-national
    qualification-persistence failure — the tend-while-national fix cannot
    touch it. Tenddrive NO-GO'd (national final 3 → 3).
- Frozen-band warning (sim-findings.md, 2026-11-08): 4/8 prereg roots don't
  occur on master 6680d7924 — the band is seed-frozen, not
  trajectory-frozen. Tendtrust's own table shows binddiag's per-seed
  stories did NOT reproduce on its base. **Roots are re-verified on
  current master FIRST; if drift moved 76408, the diag re-scopes to
  whichever seeds now show the shape and says so — 76408 is not forced.**

## THE QUESTION

Villages qualify for national (LEAD: ≥3 seasoned subs) and then the links
decay before the national beat ever stages. What drags the trust down in
the qualification→beat window, per source, and can the next lever be sized
from that census — or is the decay firing-throttle-dominated with no sized
number (a sizing NO-GO, with the numbers)?

## The gate, exactly (code authority — re-read, not assumed)

- `winPlanBondsTick` (src/js/win-plan.js:539): the villagers' own tend
  drive. Gates, in order: returns null while `nationalLive` or
  `pendingNational`; needs ≥2 primary links; needs a plan actor AT Haven
  (`planActorsAtHaven`, win-plan.js:646 — a villager holding a win plan,
  alive, whose node is the Haven node, not engaged, not the player);
  pantryDays ≥ 3; then tends Haven-primary links with trust < 50, once
  per week per link, skipping mourning, +8 via `tendLink` (1,500 kcal).
- `planActorsAtHaven` reproduction for the recorder (pure read): plans =
  `Game.state.village.winPlan` keys; alive via `Game.getPerson`/`vpOf`
  (!dead); at Haven via `Game.npcNode(vid)` nx/ny === Haven node from
  `Game.havenNodeXY()` (fallback `(v.px ?? 4, v.py ?? 4)`, the graves.js
  convention); not engaged via `Game.isEngaged(vid)`. All calls guarded —
  if the Game surface is absent the field reads `null` (unknown), never
  a fabricated 0.
- The engine drive fires inside the daily (villager-agency tick), between
  the recorder's pre and post snapshots. Actor presence is therefore
  sampled at BOTH snapshots (pre and post counts in the trajectory
  point); the analysis uses the post count as the day's value and reports
  the pre/post agreement.
- Trust-move sources in the ledger (tendtrust-b): accord (+10 once),
  aid, court (+10 First Court), tended (policy + engine, +8 each),
  tribute (+1/−1/−2 weekly), succession (−8 per leader death, every
  link), renegotiation (−5), titan (−5), drift, unattributed (no history
  note: failed renegotiations −5, +4 gains).

## Composition choice (decided before sweeping)

- REUSE `scripts/policies/tableseat-nowait.js` unmodified — same substrate
  as binddiag / tendtrust / tenddrive.
- EXTEND `scripts/policies/tendtrust-b.js` with the actor-presence field
  ONLY (tendtrust named it as the next instrument gap). No behavior
  change: the recorder stays pure-read, writes nothing to game state,
  draws no RNG. The extension adds `planActors`/`planHolders` to
  `snapTT` and `actors`/`actorsPre`/`actorIds`/`planHolders` to each
  trajectory point. Proof test for the extension:
  `scripts/test-linkdecay-a.js` (actor computation on a mock Game incl.
  engaged/dead/away/absent-surface cases; purity — no state writes, no
  RNG; traj points carry the field).
- NEW sweep `scripts/test-linkdecay-a-sweep.js`, modeled on
  `scripts/test-tendtrust-b-sweep.js` (loadGame/setupGame/runDays,
  per-config incremental corpus writes via
  `scripts/sim-postunlock2-b-writer.js`), plus the decay-census analysis:
  per-link drag by source between qualification day and beat-staging (or
  death), per-seed dominant-source classification, and actor-presence
  accounting (days with an actor at Haven; engine-tend days conditional
  on actor presence; firing rate on actor-present vs actor-absent days).

## PRE-REGISTRATION (binding — written BEFORE sweeping, judged against it, never re-scored)

- Substrate (both arms): tableseat-nowait. Baseline: tableseat-nowait,
  `TENDTRUST` unset. Armed: tableseat-nowait wrapped with tendtrust-b
  (`TENDTRUST=1`). Own baseline replication (8), NOT another arm's corpus.
- Seeds (pilot): 76401–76408. **REUSED deliberately — same band as
  binddiag / tendtrust / tenddrive. This is a diag on the same band,
  reuse stated, not contamination.**
- Horizon: 180 loop-days, death-aware (runDays breaks on Game.over).
- STEP 0 — ROOTS RE-VERIFIED (before any judged sweep is bound to 76408):
  the baseline leg's per-seed table is read first. 76408 shows the shape
  iff it qualifies (leadQ) and then loses seasoned subs / trust decays
  with NO national beat ever staging. If it does not, the diag re-scopes
  to whichever seeds NOW show the shape (qualify → decay → no beat) and
  the evidence file names them; seeds that never qualify or that stage a
  beat are classified, not forced.
- Primary (DIAG-GO, ALL must hold):
  (a) 8/8 armed configs produce a full daily corpus: trust trajectories
      per link + trust-move attribution (succession shakes, tribute,
      Titan, renegotiation, tends by source, unattributed moves);
  (b) actor-presence per day in the corpus (post count; pre count for
      agreement; `null` only where the Game surface is absent);
  (c) a decay census: for each link, total drag by source between
      qualification day and beat-staging (or death);
  (d) per-seed classification: which decay source dominates the
      qualification→beat gap (succession drag vs firing throttle vs
      tribute/Titan vs mourning choke);
  (e) a sized next-lever spec computed from the corpus (never by
      simulation) OR a NO-GO on sizing if the decay is
      firing-throttle-dominated with no sized number — say which, with
      the numbers;
  (f) G1 det-gate PASS; (g) G2 recorder neutrality PASS (8/8 identical);
  (h) G3 corpus integrity PASS; (i) cross-check PASS (recorder tends +
      refused == substrate attempts).
- Cost bar (diagnostic): starvation totals, median days, baseline vs armed.
- Sizing method (computation, never simulation): for the dominant drag
  source, the tends that offset it = ceil(drag points / measured mean
  lift), capped by the weeks actually available in the
  qualification→beat window (1 tend/week/link) and by the pantry-gate
  feasibility (days the pantry actually read above the threshold the
  lever would set). If the dominant drag is firing-throttle (tends
  feasible in cadence and gates but not fired — actor-absent days, or
  mourning-refused attempts), the sizing is a NO-GO with the measured
  throttle numbers (actor-present share of window days, tend rate on
  actor-present days, refused-attempt count), not a number.
- Proof gates:
  - G1 det-gate: with the recorder unset, wrapped policy == unwrapped
    policy on one seed (days/gameDays/ts counters identical, no
    `_tendtrust` surface on ctx).
  - G2 recorder neutrality: for ALL 8 seeds, baseline vs armed identical
    on days/gameDays/ts counters/starvation, plus identical death-cause
    breakdown.
  - G3 corpus integrity: 16/16 rows; every armed row carries the tend
    log + trust trajectories + decay census inputs + actor-presence
    trajectory; every baseline row carries a post-run pure-read end
    snapshot; engine-gated validation matches on every armed row.
  - Cross-check: recorder POLICY tend events + refused attempts ==
    substrate attempts, refusals mourning-explained.
- Landing rule: DIAG-GO → this run's commit is instruments + evidence +
  corpus (extended default-OFF recorder policy; no game-code change, no
  default flips). Any step failing → NO-GO, instruments + evidence only,
  verdict recorded.
- Balanced panel (§15): attempt `scripts/balance-panel.js` compare on
  the corpus; if it throws (known failure on per-seed rows, as in
  tendtrust-b), record exactly why + sweep-compare tables as the §15
  comparison.
- Sense-testing law: one NON-MEASURED narration-on replay read of a
  decay seed — judge meaning/coherence/consequences, never just counts:
  does the village hear anything about bonds cooling between
  qualification and the beat that never comes?

## Instrument

- `scripts/policies/tendtrust-b.js` (extended: actor-presence field only).
- `scripts/test-linkdecay-a.js` (proof test for the extension).
- `scripts/test-linkdecay-a-sweep.js` (sweep + --detgate + --sense modes
  + decay-census analysis).
- Corpus: `evidence/2026-11-08/perseed-linkdecay-a/` (16 rows + summary.json).
- Evidence: `evidence/2026-11-08/sim-linkdecay-a.md` (with metric review +
  wall numbers: national / table / wins, wave 4–5 unlocks, median survival).

## Flap protocol

Probe O_EXCL file creation (`git update-ref refs/heads/probe-linkdecay-a
HEAD` then delete it) before every sweep and every commit; if the probe
fails, wait and retry — never force ref surgery during a flap. Heartbeat
the tree every ~30 min (`bash scripts/worktree-heartbeat.sh
sim-linkdecay-a`); if the heartbeat script hangs >2 min, kill it and
continue. Probe OK at prereg time (2026-11-08 ~23:50Z).
