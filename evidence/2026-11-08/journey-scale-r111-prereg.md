# journey-scale r111 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-20261108T0545Z (scheduled 05:45 CST 2026-11-08).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(a pilot-gate stop is not success; rotation stays 3). Verify the write by
re-reading the file — r108/r109/r110 all claimed to write it and the file
still read 3 at this run's start.
**Base:** master@715c2918d at first scored seed ("journey deepening r119:
ladder opens 4/4, trust earned-only" — the Standing-ladder build, legs 1+2,
is ON master and this is the first scale-leg run on it).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price,
nor gate change in this run.
**Perception law (2026-10-28) stands** — raise answers read only live
pending raises from named villagers, answered in a real conversation
with the raiser; the sit drive reads only the engine's own preview.
**DELIVER OVER MEASURE (2026-11-01):** this run is the first measurement
OF a delivered build — the ladder (Steve approved 2026-11-07 19:28 CST)
is the lever; this run judges whether it opens at scale. It does not
re-prove the feast-surge wall (r109/r110 settled that: the wall was
pricing, the feast the table counted never fired on hungry bands).

## Standing context (read before scoring)

- **r110 (2026-11-07, band 97001–97004): FINDING — the stall is S3, the
  feast itself, on 3/4 seeds, with a completing control seed that proves
  it.** `gives7okDays` maps 1:1 to feasts and seats (0/0/0/1 → feasts
  0/0/0/1 → seats none/none/none/lesser-sat). 97004 won (lesser, sat
  d102, Liam Davis took it) — the first sat seat and first win on the
  scale driver; the sit+modal drive is GO live. The full seat is still
  unproven on this band (lesser only; the realm dissolved before a full
  seat could price). The lever target named was the S3 gives gate or
  the surplus-feast path — SUPERSEDED by the ladder build: the feast is
  now an optional bundle deed (6 slots, 12 contributions, buy-out),
  the lesser seat needs sentimentTaught + ladder peak ≥ Village (12
  counted points), the full seat needs deedGateReady + ladder peak ≥
  National (40) + a capstone delivered. The gives gate is no longer on
  the seat path at all.
- **The ladder, as landed (leg 1 + leg 2 run notes, read as the API
  contract):** `Game.villageLadder()` → {stage 0–3, peakStage, counted,
  cap, tracks{ fight, forage, craft, talk, explore }, countedTracks,
  capped[], nextThreshold, shortfall, detail{ fightLedger, fieldXp,
  craftXp, links, contests, discovery, breadth, activeLinks,
  bundleBonus, bundleStages }}. Five-track points with a ~60%
  per-track cap per stage; thresholds Village 12 / Regional 26 /
  National 40 (read live from `ladderCfg()` — the instrument records the
  live thresholds, never hardcodes them; corrected from 24 in the first
  draft of this prereg, which misread the leg-2 note — the code says
  [12, 26, 40], capFrac 0.6, caps 7/15/24). `ladderStage()` never returns
  4; stage 4 is the capstone delivery, recorded on progState.
  Capstones (leg 2): military_tribute (2 living wave-4 veterans, the
  price — they leave the roster), trade_charter (a sealed chartered
  trade link + national+ scale), feast_embassy (feast bundle done
  while at National stage). `ladderCapstoneReady(kind)` is the read;
  `ladderDeliverCapstone(kind)` is the delivery (wired-exempt: leg-3
  Haven entry point, app.js panelHaven calls it). Delivery starts the
  mercy window via `tableActive()`. The +4-per-stage bundle bonus is
  read inside `villageLadder()` (leg-2 flagged amendment).
- **Leg-2 neutral proof (fresh panel seed 7 × 4 policies × 150d,
  neutrality 4/4, 0 warnings, refreshed after rebase):** the ladder
  build itself is measurement-neutral on the standard panel. This run
  is the first JOURNEY-leg evidence of whether the ladder OPENS —
  whether real villages climb it to National in days 80–140.
- **r110 carried, NOT this run's question:** the accept echo
  ("All right. Let's ask them." as both YOU and THEM, 12/12 accepted
  talks), the unvoiced raise (2/12), post-accept brush-off close
  lines, the unanswered foraging invitation under a raise, the
  planted Rafael murder thread, the r97 hydration drain (does not
  reproduce on this band's shape). Mutlaq's unanswerable raise is a
  design question for Steve, still open — re-counted here, not
  re-litigated.
- **Canon:** docs/SCALE.md (the four rungs, six national roads,
  beats played, anti-speedrun) + docs/CANON.md. The ladder is the new
  victory-gating design (Steve's brief 2026-11-07); SCALE.md's
  scaleRank ladder (village→regional→national→global) is a SEPARATE
  ladder from the Standing ladder — the two must not be conflated in
  the analysis. `scaleRank()` is the polity ladder; `villageLadder()`
  is the points ladder; the full seat needs BOTH (deed gate reads
  national/global scale AND ladder peak ≥ National).

## Q1 — DOES THE LADDER OPEN AT SCALE? (binding)

New instrument `scripts/ladder-instrument-20261108.js` (require, not a
copy — same pattern as the feast-chain instrument): a read-only daily
snapshot + pure-delegation wrappers, installed by the driver after
setupGame.

Daily snapshot (`ladderWatch`, same point as tableWatch — after
baseDaily, before endDay): day, ladder { stage, peakStage, counted,
cap, nextThreshold, nextStageName, shortfall, tracks{ fight, forage,
craft, talk, explore }, countedTracks, capped[], detail{ fightLedger,
fieldXp, craftXp, links, contests, discovery, breadth, activeLinks,
bundleBonus, bundleStages } }, thresholds (from `ladderCfg()` — live,
never hardcoded), capstones { military_tribute, trade_charter,
feast_embassy } each { ready, reason, veterans|charteredLinks|stage|
bundle }, delivered (`ladderCapstoneDelivered()`), seat
(`tableSeat()` — same call progression.js makes; the detail object is
the deed-gate shape for a full seat), preview ladder block
(`tablePreview().ladder` — read-only).
Wrappers (each logs its call and forwards exactly): `ladderDeliverCapstone`
{ day, kind, ok, reason } — whoever calls it, driver or engine;
`startCombat` { day, monsterId, wave } — wave from the monster def
(`Game.data.monsters`, `.wave`), null when the call carries no id, so
the telemetry keys can count wave-4 fights honestly.

Driver `scripts/journey-scale-r111-20261108.js` (r110 driver clone,
labels/seeds/EVIDIR only + the ladder instrument + the delivery verb
below + the telemetry keys in the census). Analyzer
`scripts/analyze-journey-scale-r111-20261108.js` (r110 analyzer clone +
ladder section, single leg — no before/after). Proof
`scripts/test-journey-scale-r111-ladder-20261108.js` (fake-Game: every
wrapper forwards args and returns the original's return verbatim;
snapshot fields read as expected; uninstall restores originals; the
delivery-order helper picks free-before-costly). Proof green BEFORE any
scored seed runs; plus a live smoke leg (seed 97801, EVIDIR /tmp,
discarded) asserting 0 instrument errors and ladder rows present.

Policy: r110's sit policy
(`scalecourt-nogate-morntrace3-linkraise-sit.js`), unchanged — the
sit/modal layers stay live (r110 proved them GO) and reusing the policy
keeps the panel comparable to r109/r110. Single leg: this is a MEASURE
of the landed ladder, not a lever test — the instrument is read-only +
delegating wrappers, so no baseline leg is needed.

**The delivery verb (driver-side competent-player verb, pre-registered
here, not ad-hoc):** after the daily ladder snapshot, if
`ladderStage() >= 3` and no capstone is delivered, the driver attempts
delivery in the order trade_charter → feast_embassy →
military_tribute — free deeds first, the costly tribute last (it
removes two living veterans from the roster). First ready kind wins;
the attempt and its result are logged in `capstoneDeliveries`. The
delivery entry point is wired-exempt (app.js panelHaven only) — no
sim policy ever calls it, so without this driver verb the full seat is
untestable in sims and the run could only report "ready, never
delivered". A competent player at National with a ready capstone
delivers it; the driver does what the player would do. The ORDER is
the choice: it is recorded per seed, and if the order itself is the
wrong call that is a design question for the run note, not a silent
driver change.

**Verdicts (checked in order):**
- **OPENS** — National (ladder stage 3) reached on ≥2/4 seeds.
- **PARTIAL** — National on exactly 1/4 seeds.
- **STALLS** — National on 0/4 seeds: per-seed stall stage +
  shortfall + capped tracks named (the binding constraint has a name).
- **INCOMPLETE** — the instrument fails to attribute on any scored
  seed (ladder rows 0, or instrument errors > 0, or a seed crash).

**Secondary binding question (judged alongside, not folded into the
ladder verdict):** capstone delivery. Among seeds that reach National,
report first-ready day per kind + delivered kind/day. If a capstone is
ready on ≥1 seed and 0 are delivered, that is a DRIVER-VERB failure
(the attempt did not fire) — named explicitly, never folded into the
ladder verdict. The full seat priced day per seed is the headline
number (report-only for the verdict; the endgame question).

**What counts as interesting:** National reached on any seed (the
ladder opens where the feast gate never did); a split (one track
carrying every village vs a different binding track per seed — the
cap is doing its job or not); a capstone ready but undeliverable for
a reason the readiness check hides; the full seat priced on any seed
(the first full-seat pricing on the scale driver).

## Q2 — CENSUS CONTINUITY (report-only; r110 metric unchanged)

Seasoned-peer count AND scatter-day gap; national/global staging;
seat priced; end cause per seed.

## Q3 — PEOPLE CHECK (sense law)

CONVO_DAYS [90, 120] transcripts read in full + ALL raise-answer
talks read in full. Mutlaq re-check: if a no-shared-words raise
recurs, count it (carried design question, not re-litigated).

## Secondaries (report-only, not judged)

- **National/global staging** (natGate watch, as r103–r110).
- **Table approach** (tableWatch + seat ledger).
- **Village assessment:** census in plain words.
- **D-THING / bonds / betrayals:** carried from the r106 analyzer
  as report-only counts.
- **Raise ledger:** per seed, from the policy stats + raiseHistory.
- **Realm dissolve / re-stage** (r108 documented blank): count per
  seed from natGateWatch / tableWatch rank transitions.
- **Feast bundle (carried, report-only):** bundleStages per seed —
  the embassy's precondition — from the ladder snapshot detail.

## Seed-band freshness (mandatory, per local_seed_band_freshness)

- Band 97801–97804, FRESH. Scope: ALL dated preregs
  (`evidence/*/sim-*-prereg.md` + `evidence/*/journey-*-prereg.md`,
  866 files) grepped for each seed as a whole token, plus the
  forbidden/contaminated lists named in those preregs
  (standacc-b, tendbelow/tendfloor-guard band-blocked, 2026-11-04/05).
  Result: 0 hits for 97801, 97802, 97803, 97804 in every prereg and
  every forbidden list.
- Near-misses, checked not assumed: 4-digit seeds 9780–9795 (Oct 26,
  sim-smoke-eq-b / mealdraw confirm bands) are DIFFERENT seed values
  from 5-digit 97801–97804 — disjoint, no collision. Rejected
  candidates, all used: 98000–98099 (awayconfirm-a 100-seed corpus +
  prodstore-a, 2026-11-07), 97501–97516 (hurthome-fix-a, 2026-11-04),
  98601–98616 (hurthome-fix-c, 2026-11-04), 99001–99016
  (belongzombie-a / tendfloor-guard-b, 2026-11-04). 99201–99208 is the
  documented contaminated band — never used.

## Method

- PILOT GATE: baseline seed 97801 runs first. Crash, recorder errors
  > 0, or a reggate file with 0 rows → STOP, do not score the band.
  Then the remaining seeds.
- DAYCAP=180, death-aware (a dead/scattered village stops; +10d tail
  max). Horizon reason (§10): reachability lever (national, table,
  wins) — 150–200d band; r107–r110 used the same cap on the same
  driver.
- Telemetry: `telemetry-check.js` against
  `telemetry-baselines/scale.json` after evidence is written (metrics:
  fightsTotal,fightsByWave.4,maxGameDay). The r110 metric-review fix
  lands here: the driver emits those three keys at the trust-JSON top
  level (fightsTotal = startCombat wrapper count per seed;
  fightsByWave.4 = wave-4 fights per seed; maxGameDay = final census
  day per seed), so the check can actually compare. The baseline is
  STALE (its markerCounts.* keys never resolved on r107–r110 files —
  a different driver regime); any LOUD line is a same-run
  investigation item before the baseline rolls forward with
  --update-baseline. Do NOT roll a baseline forward over an
  unexplained LOUD line.
- **Gate note (carried, not hidden):** the full `check.js --quick`
  gate will NOT run inside this run unless it completes quickly — the
  r114 gate (284/6, all adjudicated pre-existing) ran on the line this
  base descends from, and this run changes ZERO src/js (scripts +
  evidence only). The r111 proof tests + pilot evidence are the
  regression cover, as for r107–r110. `check.js --quick` is attempted
  at the end and its result (green or timed-out) is reported honestly.

## Pre-registered metrics (bind the run — §14)

- PRIMARY: per-seed first-day-reached per ladder stage 1/2/3 (or
  never), peak stage, counted + shortfall + capped tracks at end,
  per-track totals, bundleStages, first-ready day per capstone kind
  + reason when not ready, delivered kind/day (or never), first
  priced day per seat kind (lesser/full). A miss is INCOMPLETE, never
  re-scored against a friendlier metric mid-run.
- SECONDARY (report-only): survived days, end cause, pop alive/end,
  national/global, seat priced, transcript senseless count (must be 0
  to claim the people check clean), raise-talk senseless count (must
  be 0), dissolve/re-stage count per seed, capstone delivery attempts
  (kind, day, ok, reason).
- Every run note carries a "metric review" section; if a metric proves
  wrong, the revision is proposed for the NEXT run.
