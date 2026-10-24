# sim-depositrelief-b — DEPOSITRELIEF=1 buffer-aware deposit-gate stand-down

Run: oversight-flesh-out-loop-b-20261024T0430Z (cron), axis food-economy.
Worker tree: ~/workspace/worktrees/sim-depositrelief-b.
Claims backlog: #863 (from run 20261024T0332Z's bufferdepri arm — the named next).

## The question (origin: finding #863)

On DEPOSITGATE=1 cells the starvation regression (0.108–0.118/100vd vs
0.035–0.052 control, bufferdepri-b corpus) does NOT respond to the
PLENTYDEPRI=2 easing repair — it flows through the deposit holdback pipe,
a different channel. The bufferdepri stand-down (1.0–7.2% of ease volume,
voiced, legible) repairs starvation only on the easing channel (dg0);
the dg1 deposit channel is outside its coverage. The next arm against
food-economy starvation must work the deposit channel, not the easing
channel.

The lever: **DEPOSITRELIEF=1 = buffer-aware deposit-gate stand-down.**
When the pantry reads plentiful fresh but the deep-reserve buffer is thin,
the deposit gate STANDS DOWN: homecoming keep stays 2000 (no raise),
_depositGateHoldback returns 0 (no holdback), the funnel.share ease is
skipped — the haul flows to the pantry as before. Reuses the SAME >4 line
on the engine's existing pantryDaysEstimate() sensor that bufferdepri-b
documented (read-only sensor read, no state writes, no RNG).

Implementation (env-gated gate edits in src/js/game.js, zero behavior
change when unset — diff confined to the depositgate gate region, 120
insertions / 6 deletions):
- `_depositReliefOn()`: true only when process.env.DEPOSITRELIEF === '1';
  browser (typeof process === 'undefined') OFF — default unchanged.
- `_depositReliefBufferClear()`: true unless DR=1 AND
  pantryDaysEstimate() <= 4. Read-only (no state writes, no RNG), so
  gate-off and DR=0 trajectories cannot diverge through it.
- `_depositGateEngaged(vid)`: when the gate WOULD engage (fresh plentiful)
  but the buffer reads thin, notes the stand-down in vv._depositRelief
  (ledger-only, per-vid) and returns false — never on a lean day when the
  gate would not have eased anyway (never narrated when it didn't ease).
- `_depositReliefDayVoice(v)`: the stand-down is voiced once per day (own
  day guard, rotating speaker, per-speaker line key, deterministic) — the
  PRODTHROTTLE / _plentyDepriDayVoice pattern. Never silent when the gate
  stood down. The contrast with the eased keep-raise voice is the design:
  the ease voice celebrates full shelves (keep the share, eat at the fire);
  the relief voice reads the pantry one level deeper (full front shelves,
  thin back shelves) and sends everything to the pantry.
- The three decision sites pass their vid (homecoming: this.villagerId;
  funnel.share: vid; _depositGateHoldback: vid) so the voice names a real
  villager, never "Someone".

No canon doc covers the deposit gate itself (the four decision points are
the 2026-10-22 landed behavior, not Steve-written canon) — said here,
not invented.

## Design question (engine definition coverage)

Same as bufferdepri-b's: the engine's plenty definition does NOT cover
this gate's "thin" — it is binary (>4 fresh days). This lever reuses the
SAME >4 line on the engine's existing deep-reserve sensor
(pantryDaysEstimate). Whether "thin" should instead mean a fresh-days
margin above 4 is a STEVE-CALL design question, documented here, not a
new constant.

## Hook verification (pre-sweep, REQUIRED GREEN)

- scripts/test-depositrelief-b.js: ALL GREEN (40/40) — RED (DR=0) gate
  unreachable (relief off, buffer gate short-circuits, the gate eases
  exactly as landed: holdback holds half, gate ledger counts, relief
  voice silent, no relief ledger); DR=1 buffer-THICK eases exactly like
  landed DEPOSITGATE=1 (engaged true, holdback 300/600, no relief ledger,
  no voice); DR=1 buffer-THIN stands down (engaged false → homecoming
  keep stays 2000, holdback 0, relief ledger noted with the villager's
  vid, stand-down voice once/day, idempotent, real-villager speaker, not
  the ease voice); invariants carried over (lean day: no note, no voice;
  hunger-stretch: no note; gate-off: no note; deterministic, no RNG);
  det-gate (DR=0 full-run legs never touch the relief; unset == DR=0
  byte-identical; DR=1 deterministic); browser-path (no process) off.
- src/js/game.js diff confined to the depositgate gate region.

## PRE-REGISTRATION (bound per §14 — a miss is a miss, never re-scored)

- Substrate: FEASTSCALE_R13=1, SEATDRIVE=0 (asserted FATAL in every
  script), 100d death-aware horizons (dead villages stop, +10d tail max),
  policies {leadfeast, belongfeast}. Seeds 9250–9265 (same substrate as
  bufferdepri; fresh for this lever).
- PLENTYDEPRI=0 explicit (the deposit channel in isolation — PD unset
  would silently arm the landed PD=1 default); DEPOSITGATE=1 explicit.
- Cells: {DEPOSITGATE=1} x {DEPOSITRELIEF=0/1} — DG explicit, never unset.
  16 seeds x 2 policies x 2 cells = 64 configs.
- PILOT GATE: 8 seeds (9250–9257) first; engagement sniff = relief
  stand-down fires on >=6/16 DR=1 pilot configs; full 16 only on pilot GO.
- PRIMARY (binding, per policy): exposure-normalized starvation DR=1 vs
  DR=0: armedRate <= controlRate + 2/(armedVD/100) (the depinteraction
  prior bar — per bufferdepri's metric review, the strict bar was
  chaos-dominated). GO iff holds on BOTH policies.
- ENGAGEMENT: stand-down ledger counts >0 on >=12/32 DR=1 configs per
  policy.
- GUARDRAILS per policy: (a) rot/100d DR=1/DR=0 <= 1.10
  (non-inferiority — absolute rot is hostile to a repair that keeps hauls
  flowing); (b) national(end) >= control-2; (c) median paired (dr1-dr0)
  survival-diff >= -10d; (d) no new death modes (dr1 kind-families ⊆
  pooled dr0 corpus).
- Verdict: GO iff primary + engagement + all guardrails on both policies.
  Else NO-GO classified per §14a (concept-dead / metric-broken /
  substrate-missing — be honest).
- §15 balanced panel: env-gated levers hit the documented #797 "Unmatched
  flags" invalidity by construction — the panel compare .md is built,
  attached as invalid, and judgment runs on the analyzer's manual paired
  rows. Metric NOT re-scored.
- WATCH (report-only): wall numbers per cell (national/table/wins,
  wave 1–5 unlocks, median/max survival), death-cause shares, stand-down
  ledger, pantry freshDays, trap acquisition by source (chan.traps share
  of inflow), young-link succession survival (scholar deaths per cell;
  successor villages reaching the horizon).

## Metric review (pre-sims)

- The primary bar carries the depinteraction prior's +2/(armedVD/100)
  headroom by construction (per bufferdepri's metric review §4: the
  strict bar judges 1–3 death-count chaos on a 9%-share cause). With ~13k
  villager-days per cell the headroom is ~0.015/100vd — honest noise
  floor, not a giveaway.
- Guardrail (a) is non-inferiority (<=1.10), not a reduction bar: the
  relief keeps hauls flowing into the pantry, and kept hauls add fresh
  inflow that can rot (bufferdepri's metric review §2 — absolute rot is
  hostile to a repair that works as intended). A rot increase <=10% is
  the price of the repair; above that the lever is feeding the rot
  channel it was meant to starve.
- Seeds 9250–9265 are REUSED from the substrate runs by design (paired
  identical-seed comparison); they are fresh for the DEPOSITRELIEF lever
  itself.

## Results

### Pilot gate (8 seeds 9250–9257 x 2 cells x 2 policies = 32 configs, 100d)

GO on the engagement sniff: relief stand-down fired on 12/16 DR=1 pilot
configs (bar >=6) — 6/8 leadfeast, 6/8 belongfeast. Full 16-seed run
warranted.

Infra note: the /tmp wipe class struck mid-pilot (driver log lost, driver
died after all 4 pilot cells completed). The corpus survived (worktree,
not /tmp). The driver's verify_cell initially demanded all 16 seeds on
the pilot pass — fixed to verify the expected seed list per pass, with
the full pass verifying the merged 16. A second driver kill (my own,
after diagnosing the verify bug) was followed by a direct missing-seeds
fill. The node-side summary merge worked cleanly on all 4 cells this run
(no #864 recurrence).

### Full sweep (16 seeds 9250–9265 x 2 cells x 2 policies = 64 configs)

Corpus: evidence/2026-10-24/depositrelief-b-corpus/ — 64/64 per-seed JSONs
verified (schema + env + diag), 4/4 summaries 16-row. Four zero-byte
per-seed files from the python splitter's EPERM flap were re-swept and
verified byte-identical to the summary rows (byte-deterministic), then
copied into the corpus.

PRIMARY — exposure-normalized starvation DR=1 vs DR=0
(GO bar: armed <= control + 2/(armedVD/100), binding):
- leadfeast: armed 0.095/100vd (13 deaths / 13,621 vd) vs bar 0.085 — MISS
- belongfeast: armed 0.130/100vd (17 / 13,090 vd) vs bar 0.093 — MISS
The lever does not repair the dg1 starvation; starvation is HIGHER on the
armed cell (both policies).

ENGAGEMENT — stand-down ledger >0 on >=12/32 DR=1 configs:
- leadfeast: 12/32 — PASS
- belongfeast: 11/32 — MISS (by one)

GUARDRAILS (DR=1 vs DR=0):
- (a) rot/100d ratio: leadfeast 0.843, belongfeast 0.980 (both <= 1.10) — PASS
- (b) national(end): leadfeast 11 >= 7, belongfeast 8 >= 7 — PASS
- (c) median paired survival-diff: 0.0d both — PASS
- (d) no new death modes: PASS both (after instrument repair — see below)

Instrument repair (documented, not re-scoring): the kind-mapping
misclassified monster-kill flavors as "new death modes" — "the landlord"
(The Landlord, wave-2 monster) and "the night" (Night Court's "the night
takes it back"; pre-existing cause, 2 occurrences in the bufferdepri-b
corpus). Both are combat deaths. The analyzer now consults monsters.json;
the bar (no new modes) is unchanged.

### Verdict

NO-GO (judged as pre-registered; a miss is a miss, never re-scored).
Classification per §14a: CONCEPT-DEAD.

The mechanism fires as designed (hook proof 40/40 green; relief engages
on 23/64 armed configs; the stand-down voice reads as a person), but the
outcome goes the wrong way: starvation is higher on DR=1, not lower. The
seed-level deltas concentrate on 9252 (+2 both policies), 9261 (+3
belongfeast), 9256 (+2 belongfeast) — and seed 9261 belongfeast is
mechanistically informative: dr0 survives 100d with 0 starvation deaths
while dr1 dies at day 34 with 3 starvation deaths DESPITE reliefDec=39.

The backfire hypothesis: the deposit gate's easing gives food DIRECTLY to
villagers (the held-back share is eaten at the fire; the raised homecoming
keep stays in the scholar's pack). The relief stands down ALL of it,
sending the food to the pantry instead. When the buffer reads thin but
fresh is plentiful, the pantry has food — but the starving villager needed
it in hand, not in the store. The relief removes the direct-to-villager
protection. Finding #863's "holdback pipe" theory of dg1 starvation is not
supported: the holdback is not the starvation channel, or not the
repairable one.

This does not invalidate the DEPOSITGATE=1 layer itself (which stays
landed and default-on). It kills the DEPOSITRELIEF=1 repair theory.
The dg1 starvation channel remains an open question — the next arm should
look elsewhere (distribution, not deposits).

Convergence state for food-economy: converging (this lever killed). The
axis keeps its converging state; the deposit-gate starvation channel is
returned to the backlog as an open mechanism question, not a named next
arm.

## Scale wall (per cell)

National / table+wins / wave>=4 / wave>=5 / survival median / max /
scholarDeaths (successions) / trapsK of inflowK
(16 seeds each, 100d death-aware; SEATDRIVE=0 pre-seat substrate so
wins are structurally 0 — regime artifact, not a finding):
- dr0 leadfeast: 9 / 0 / 6 / 0 / 100d / 100d / 15 / 0k/4222k
- dr0 belongfeast: 9 / 0 / 8 / 0 / 100d / 100d / 15 / 0k/4358k
- dr1 leadfeast: 11 / 0 / 7 / 0 / 100d / 100d / 16 / 0k/4564k
- dr1 belongfeast: 8 / 0 / 7 / 0 / 100d / 100d / 15 / 0k/4508k
The wave-5 wall stands at 0/16 on every cell (the binding wall,
unchanged). National reach is relief-neutral to slightly positive
(leadfeast 9→11). Median survival is horizon-capped at 100d on all
cells. Scholar deaths (successions) run 15-16 per cell — the succession
mechanic is active; successor villages reach the horizon about as often
as un-succeeded ones (no succession collapse signal in this corpus).
trapsK reads 0k on all cells — the chan.traps attribution (/checkTraps/
stack match) is not capturing trap inflow on this substrate; measurement
gap, not a finding (trap food flows, just unattributed).

## Death-cause shares

Pooled over all 64 runs (kind-mapped): combat 65.4% (323), starvation
9.9% (49), sickness 8.9% (44), other:ambush 5.1% (25), dehydration 4.7%
(23), other:contest 4.3% (21), other:monster-flavors 1.8% (9: "a line of
ducks, walking" 4, "lockjaw" 2, "big loud" 2, "big-eyes" 1). Starvation
is a minority cause — the primary misses are small-count deltas, but
they were judged as written (prior bar with headroom, no re-score).

## Village assessment

The villages in this corpus look like mid-plenty villages: pantries
reading 4-20 fresh days, the deposit gate easing on thick-buffer days
(easedK 50-444k per run), the relief standing down on thin-buffer days
(reliefDec 0-63). Under DR=1 the village hears the stand-down voice on
thin days — the pantry is read one level deeper, and everything goes to
the store. What the village is missing is not deposits — it's the last
mile: on seed 9261 the pantry read plentiful while villagers starved,
and the relief's "everything to the pantry" was the wrong answer. The
village needed the food in hands (the eased share at the fire, the
raised keep in the pack), not in the store. That is the blank this run
documented: the deposit channel is not the starvation channel, and the
"holdback pipe" theory is dead.

## Blanks filled / documented

- DOCUMENTED (finding #863 → killed): the DEPOSITRELIEF=1 repair theory.
  The relief fires as designed but starvation is not repaired (primary
  missed both policies; 9261 belongfeast backfired dramatically). The
  "deposit holdback pipe" theory of dg1 starvation is not supported.
  The dg1 starvation channel is returned to the backlog as an open
  mechanism question.
- DOCUMENTED (instrument): the sweep's chan.traps attribution captures
  0k on this substrate — trap inflow is unattributed. Not a game finding.
- DOCUMENTED (instrument): monster-kill cause flavors ("the landlord",
  "the night", "a line of ducks, walking", etc.) need monster-roster
  mapping in kindOf; fixed in the analyzer with the monsters.json
  consult + the documented "the night" → Night Court mapping.
- DOCUMENTED (infra): the run-depositrelief-b.sh verify_cell now takes
  the expected seed list per pass (pilot vs full); the #864 fresh-merge
  re-invocation is built into run_cell's retry structure.

## Metric review (post-run)

1. The primary bar (depinteraction prior bar) worked as intended: it
   caught a real directional miss, not noise. No metric complaint.
2. The engagement bar (12/32) was missed by one on belongfeast (11/32).
   The lever engages, just under the bar. Not metric-broken — the bar
   is honest.
3. Guardrail (d)'s kind-mapping needed the monster-roster repair. The
   operationalization is now more correct, not looser. Future arms
   should use the repaired kindOf.
4. The control rates (dr0: 0.071/0.078) sit above bufferdepri's pd0-dg1
   (0.035/0.052) — substrate drift from journey r39 (game.js), not lever
   leakage: the DR=0 inertness was verified byte-identical (stashed
   original vs modified, seed 9250, all metrics identical). Paired
   identical-seed design keeps the comparison valid.

## Proofs re-run GREEN (this run)

- scripts/test-depositrelief-b.js: ALL GREEN (40/40) — hook proof holds
  on the lever layer.
- scripts/analyze-depositrelief-b.js: exit 1 = NO-GO, exactly as
  pre-registered (no re-score); 64/64 per-seed schema-exact, 4/4
  summaries 16-row, all env assertions held.

## Sense testing (SENSE-TESTING LAW)

scripts/sense-depositrelief-b.js (seeds 9253/9250, leadfeast, DG=1, 60d,
DR=0 vs DR=1) — transcript read end to end, voice judged for meaning:

- DR=0: the gate ease voice fires once/day and reads as landed — Bill:
  "looks at the full shelves and waves off the day's share. 'No more
  into the store — we eat at the fire, and the shelves keep.'"
- DR=1 (seed 9253, standDownDec=14): on thin-buffer days the stand-down
  voice fires INSTEAD, once/day, rotating speakers —
  d2 Bill: "pats the pantry jars — full up front, thin at the back.
  'Shelves look rich, but the deep stores are thin. Everything goes in
  today.'"
  d3 Ava: "counts the deep jars behind the fresh shelves and shakes their
  head. 'Plenty today, thin underneath. No keeping back — the pantry
  takes it all.'"
  d4 Consuelo: "checks the deep jars and calls off the easing. 'Thin
  behind the fresh. We hold nothing back today — the pantry eats first.'"
  The contrast with the ease voice is exactly the design: the same
  village reads the pantry one level deeper (front shelves vs back
  shelves) and chooses the opposite action. It reads as a person, not a
  throttle. Never silent when it stood down; seed 9250 DR=1 (no
  thin-buffer days, standDownDec=0) voices nothing — never narrated when
  it didn't ease.

Sense verdict: PASS. The voice is honest and legible. The tragedy is
that the honest voice doesn't repair starvation — the design, not the
voicing, is what the NO-GO kills.
