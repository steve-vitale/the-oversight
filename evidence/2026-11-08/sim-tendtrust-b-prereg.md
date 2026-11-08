# sim-tendtrust-b — prereg: sizing the tend/trust lever for the Binding leg

Run: fleshout-loop-b-20261108T1230Z (Loop B, second axis). Worktree:
`~/workspace/worktrees/sim-tendtrust-b` (branch sim-tendtrust-b, cut at master
715c2918d). Axis: scale-onramp / winnability chain (converging, NOT
converged). Tracker blank (5) from the 1030Z tracker: "the Binding-leg
tend/trust DIAG". DIAG ONLY — zero src/js, no default flips.

## Canon + code read first (before any sim)

- docs/CANON.md, docs/SCALE.md.
- Prior decomposition, NOT re-measured:
  evidence/2026-11-08/sim-binddiag-b.md (0230Z): the national pipeline on
  band 76401–76408 (tableseat-nowait substrate, 180d): links 8/8 → subs 8/8
  → seasoned 8/8 → LEAD qualifies 5/8 → beats staged 4/8 (all First Court,
  all day 77) → national held to end 2/8. Binding stages: LEAD
  qualification (trust, not age) and national persistence (trust dips
  un-season links). Non-qualifiers: 76403 (trust 37/38, 2–3 short; tends 0;
  final pantry 7,500 kcal), 76404 (trust 33, 7 short; tends 0; pantry
  5,745), 76407 (trust 32/36/48; tends 4, not enough). National losses:
  76405 (d147), 76406 (d88, re-won d134), 76408 (d92) — all a seasoned
  link's trust falling below 40, polity under 3 seasoned subs, rank dying
  with it. Seasoning fails in two faces: too poor to tend, or tends not
  lifting enough.

## The tend/trust gate, exactly (code authority)

Trust moves for a Haven-primary subordinate link — `src/js/hierarchy.js`:

1. **Formation.** Links form at trust 30 (SCALE.md; `proposeLink`).
   Seasoning bar is trust 40 (`_linkSeasoned`, hierarchy.js:233: 30+ days
   AND trust 40+; conquered: the season, not the trust). A fresh link
   needs **+10 net trust** to season, once it is 30 days old.
2. **tendLink** (hierarchy.js:1147, "send grain"): 1,500 kcal from Haven's
   pantry → **+8 trust** via `_trustGain`, **once per week per link**
   (`tendedWeek`), refuses during their mourning (grief is not bought
   off), partial pantry → proportional gain (`Math.round(8 * paid/1500)`).
   The tended grain is real food in the subordinate's pantry
   (SUBAID-AID-CREDIT).
3. **_trustGain** (hierarchy.js:1775): the single choke point for gains.
   While a link's village grieves (`mourningUntil`, 7 days after a speaker
   death) NO gains land; every positive gain stamps `lastKeptDay`.
4. **Weekly tribute tick** (`linkTick`, hierarchy.js:1300+): the
   subordinate's fields pay 4,000 kcal/week. Full payment **+1**,
   partial **−1**, nothing **−2** (arrears ride alongside). A tended link
   drifts clearly positive; a struggling one decays slowly. There is NO
   passive weekly trust decay — trust moves only through events (tribute,
   tends, deaths, court answers, demands).
5. **Leader-death shake** (`onLeaderDeath`, hierarchy.js:1908/1921/1999):
   **−8 trust** on every link when the representative or the player falls.
   **First Court feast** (answerNationalChoice, hierarchy.js:2647):
   **+10** each. **Cold** (hierarchy.js:2681): **−12** each.
6. **The substrate's rescue-tend gate** (`scripts/policies/leanlinkrescue.js:87`):
   tends ONLY to active Haven-primary links with trust < 40, once per
   week, and ONLY when Haven's pantry reads **> 20,000 kcal**. A link at
   trust ≥ 40 is never tended (the bar holds itself); a dipping link on a
   thin pantry is never tended either. This gate is the thing being sized:
   on the binddiag band it fired on only 2/8 seeds (76402: 5 tends,
   76407: 4 tends; all others 0).
7. **National persistence** (hierarchy.js:2428): national is a LIVE state.
   The moment `_havenPolity()` is null with no pending beat, `nationalLive`
   clears aloud. A trust dip that un-seasons one link of three kills the
   realm — no link death required.

## THE QUESTION

Size the tend/trust lever for the Binding leg, so the next run can build
it. For each blocked seed, how many additional tends — at the measured
mean trust lift per tend — would have qualified it before death / before
day 77? For each national loss, how many tends / what trust buffer would
have held it? Name the lever precisely: which number moves (rescue-tend
pantry threshold, trust lift per tend, tend frequency/cadence, trust
decay rate) and by how much, with the measured size. If the data shows no
single number moves it, say so — that is a DIAG verdict, not a failure.

## Composition choice (decided before sweeping, documented per brief)

- REUSE `scripts/policies/tableseat-nowait.js` unmodified — leanlinkrescue
  courtship (`LEANLINKRESCUE=1`) + seat legs only (`TABLESEATNOWAIT=1`), no
  wait leg. Same substrate as binddiag.
- NEW recorder `scripts/policies/tendtrust-b.js` (`TENDTRUST=1` gate; unset
  delegates byte-identically). PURE-READ, modeled on binddiag-b.js:
  it NEVER calls `villageStandingTotal()` during a run; it computes the
  gated total from pure reads with the standing.js formula (reusing
  binddiag-b's `snapBindingEnd` for the post-run end snapshot and its
  engine-gated validation). It writes nothing to game state and draws no
  RNG. It NEVER calls `polityOf()` (initializes `state.foreignPolities`
  on the non-HOME branch) — LEAD qualification is reproduced from the
  seasoned-sub count, as in binddiag-b.
- **Pre/post daily sampling (the binddiag same-day-inference lesson):**
  end-of-day sampling cannot observe a tend that fires and is then
  masked inside one day (a tend's +8 and a same-day trust event land in
  the same daily call). The recorder therefore snapshots each sub link
  (trust, tendedWeek, mourningUntil, lastKeptDay, arrears, sub pantry)
  and Haven's pantry BEFORE delegating inward, and again AFTER — the
  tend is identified by the durable `tendedWeek` flip, and its trust
  lift is the pre→post delta on that link. Engine-side trust events
  (weekly tribute tick, leader-death shake) land during `sleep()`, AFTER
  the post snapshot, so they appear as the overnight delta between one
  day's post snapshot and the next day's pre snapshot, attributed via the
  link's day-stamped `history` entries. A `nationalLive` flip with no
  open beat is recorded as an INFERRED same-day stage+answer beat with
  the engine-stamped shape (binddiag's fix, reused verbatim in logic).
- The recorder logs, per seed: every tend event (day, giver Haven,
  receiving link/polity, pantry at tend — pre-daily pantry, the closest
  pure read to the gate's own read, plus post-daily pantry — trust
  before/after per link, measured lift); daily trust trajectories per sub
  link; LEAD qualification shortfall per seed per day (seasoned-sub count
  vs 3, per-link trust gap to 40 and days-to-season); national-loss
  events with the trust dip that caused them (which link, from/to trust,
  dip size, days the link sat below 40 before the loss); and
  gate-blocked tend opportunities per day (a sub link below trust 40,
  untended this week, pantry ≤ 20,000 — the tend the gate refused).

## PRE-REGISTRATION (binding — written BEFORE sweeping, judged against it, never re-scored)

- Substrate (both arms): tableseat-nowait. Baseline: tableseat-nowait,
  `TENDTRUST` unset. Armed: tableseat-nowait wrapped with tendtrust-b
  (`TENDTRUST=1`). Own baseline replication (8), NOT another arm's corpus.
- Seeds (pilot): 76401–76408. **REUSED deliberately — same band as
  binddiag. This is a diag on the same band, reuse stated, not
  contamination.** The binddiag corpus is the baseline this diag reads
  against; re-running the identical band under the recorder is the
  measurement, and the seed-band freshness rule is about fresh
  JUDGMENTS, not about refusing to re-observe a band a diag names.
- Horizon: 180 loop-days, death-aware (runDays breaks on Game.over).
- Primary (DIAG-GO, ALL must hold):
  1. 8/8 armed configs produce a full daily tend/trust corpus (tend log
     + trust trajectories + shortfall table + national-loss dips) with an
     end snapshot;
  2. a per-seed shortfall table: for each blocked seed, the LEAD
     shortfall at death / at day 77 in trust points per link, and the
     tend count that closes it at the measured mean lift;
  3. a tend census: counts, mean trust lift per tend (measured, with the
     code value +8 as the cross-check), pantry distribution at tend, and
     gate-blocked tend opportunities per seed;
  4. a sized lever spec: which number moves and by how much, computed
     from the corpus (never by simulation);
  5. G1 det-gate PASS; 6. G2 recorder neutrality PASS; 7. G3 corpus
     integrity PASS (incl. engine-gated validation).
  Any full seat reached is a breakthrough — entered-full count reported
  prominently. (Expected 0/8: the wave leg is already proven binding;
  this diag sizes the Binding leg's tend/trust lever, not the seat.)
- Cost bar (diagnostic, reported even for a diag): starvation totals,
  median days, baseline vs armed.
- Sizing method (computation, never simulation): for each blocked seed,
  additional tends per link = ceil(trust shortfall / measured mean lift),
  capped by the weeks actually available (1 tend/week/link from link
  formation to death / day 77) and by the pantry-gate feasibility (days
  the pantry actually read above the threshold the lever would set). For
  each national loss, the buffer = the dip size in trust points (the
  link's trust the day before the loss minus 40, plus the overnight dip),
  expressed as tends in the weeks before the loss. Trust-decay sizing
  uses the measured weekly net drift per link (tribute outcomes
  +1/−1/−2) over the season window.
- Proof gates:
  - G1 det-gate: with the recorder unset, wrapped policy == unwrapped
    policy on one seed (days/gameDays/ts counters identical, no
    `_tendtrust` surface on ctx).
  - G2 recorder neutrality: for ALL 8 seeds, baseline vs armed identical
    on days/gameDays/ts counters/starvation, plus identical death-cause
    breakdown.
  - G3 corpus integrity: 16/16 rows; every armed row carries the tend
    log + trust trajectories + shortfall table; every baseline row
    carries a post-run pure-read end snapshot; engine-gated validation
    matches on every armed row.
  - Cross-check: the armed corpus's tend counts per seed must match the
    substrate's own `ctx.tended` counters (76402: 5, 76407: 4, others 0
    per binddiag) — the recorder must see every tend the substrate made
    and invent none.
- Landing rule: DIAG-GO → this run's commit is instruments + evidence +
  corpus (new default-OFF recorder policy; no game-code change, no
  default flips). Det-gate failure → NO-GO, instruments + evidence only,
  verdict recorded.
- Balanced panel (§15): attempt `scripts/balance-panel.js` compare on
  the corpus; if it throws (known failure on per-seed rows), record
  exactly why + sweep-compare tables as the §15 comparison.
- Sense-testing law: one NON-MEASURED narration-on replay read of a seed
  where tending stalls — judge meaning/coherence/consequences, never
  just counts: does the game ever TELL the village which link is
  dipping, or does the trust cool silently?

## Instrument

- `scripts/policies/tendtrust-b.js` (new recorder, `TENDTRUST=1` gate).
- `scripts/test-tendtrust-b-sweep.js` (sweep + --detgate + --sense modes),
  modeled on `scripts/test-binddiag-b-sweep.js` (loadGame/setupGame/runDays,
  per-config incremental corpus writes via
  `scripts/sim-postunlock2-b-writer.js`).
- `scripts/test-tendtrust-b.js` (proof test: tend-event detection on
  synthetic pre/post link states incl. the same-day inference, recorder
  purity on a mock Game, shortfall/tend-count sizing arithmetic).
- Corpus: `evidence/2026-11-08/perseed-tendtrust-b/` (16 rows + summary.json).
- Evidence: `evidence/2026-11-08/sim-tendtrust-b.md` (with metric review +
  wall numbers: national / table / wins, wave 4–5 unlocks, median survival).

## Flap protocol

Probe O_EXCL file creation (`git update-ref refs/heads/probe-sim-tendtrust-b
HEAD` then delete it) before every sweep and every commit; if the probe
fails, wait and retry — never force ref surgery during a flap. Heartbeat the
tree every ~30 min (`bash scripts/worktree-heartbeat.sh sim-tendtrust-b`); if
the heartbeat script hangs >2 min, kill it and continue. Probe OK at prereg
time (2026-11-08 ~13:00Z).
