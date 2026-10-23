# sim-depinteraction-b — PLENTYDEPRI × DEPOSITGATE interaction decomposition

Run: oversight-flesh-out-loop-b-20261023T1130Z (cron), axis food-economy.
Worker tree: ~/workspace/worktrees/sim-depinteraction-b.
DIAG — MEASUREMENT ONLY, zero src/js changes, ever.

## The question (origin: run sim-plentydepri-confirm-b, run 20261023T0330Z)
The confirm ended NO-GO on its binding primary with DEPOSITGATE=ON as
common-mode substrate: leadfeast rot/100d 0.532x (GO) / belongfeast 1.594x
(MISS), plus guardrail (c) FAIL on 1 alien death. The pilot (DG also ON,
unrecognized) had measured 0.542x/0.622x GO. The interaction — PD × DG —
has never been decomposed.

Both levers read the SAME "plentiful" sensor: prodThrottleEngaged() (>4
fresh days; hungryStreak>=3 stands both down). PLENTYDEPRI (landed df66ebaff,
2026-10-21, Steve's SURPLUSFEED-replacement ruling) eases production at the
decision (50% of surplus push above meal-need estimate; ledger
v._plentyDepri.days; depriKcal). DEPOSITGATE (landed layer, b2 GO on 64 fresh
seeds) eases DEPOSITS when plentiful: funnel.share half-held, scholar
homecoming keep 2000→6000 kcal, _depositGateHoldback on away.return /
ambient.bighaul (ledger v._depositGate.days + holdback kcal; easedKcal).

Interaction hypothesis (to be carried by channel evidence, never freehand):
PD's production easing drains the pantry → fewer plentiful days → stands
DOWN DG's deposit holdbacks; DG's deposit holdbacks drain inflow → fewer
plentiful days → stands DOWN PD's production easing. The winner is decided
by the channel ledgers, not by narration.

## Hook verification (pre-sweep, REQUIRED GREEN)
- scripts/proof-plentydepri-confirm-b.js re-ran: fixture/det-gate/hook
  byte-identical PASS; only "failure" is the propagated known NO-GO verdict.
- scripts/test-depositgate-b.js re-ran: ALL GREEN.
- Gate check: PLENTYDEPRI default-ON in node when unset; DEPOSITGATE
  default-ON when unset — both sides assert env EXPLICIT (unset would arm
  "controls" silently).

## PRE-REGISTRATION (bound per §14 — a miss is a miss, never re-scored)
- Substrate: FEASTSCALE_R13=1, SEATDRIVE=0 (asserted FATAL in every script),
  100d death-aware horizons (dead villages stop; +10d tail max),
  policies {leadfeast, belongfeast}. PLENTYDEPRI=0/1 x DEPOSITGATE=0/1 explicit.
- Seeds: 16 FRESH — 9250–9265 (confirm used 9209–9240, pilot 9001–9016;
  scanned scripts/ filenames + contents, evidence/ filenames — no collisions;
  the only hits were incidental) × 2 policies × 4 cells = 128 configs.
- PRIMARY (per feast-side, per DEPOSITGATE setting): (rotFreshKcal +
  rotPreservedKcal) absolute kcal per 100 days alive, PD=1 / PD=0 ratio —
  the SAME metric as pilot/confirm; this is a decomposition, not a new lever.
- DIAG-GO iff:
  (i) the DG=0 leg reproduces the pilot GO (ratio ≤0.80 both feast-sides)
      OR the miss is root-caused to a NAMED substrate change (no floating miss);
  (ii) the interaction term (log(ratio_DG1) − log(ratio_DG0) per feast-side)
       is NAMED, SIGNED, and mechanism-attributed via depriKcal/easedKcal +
       glutChannels evidence — 0 unexplained cells;
  (iii) guardrails hold PD=1 vs PD=0 on EVERY cell:
      (a) median paired (pd1−pd0) survival-diff ≥ −10d (paired by seed);
      (b) exposure-normalized starvation: armedRate ≤ controlRate + 2/(armedVD/100)
          (rate = starvationDeaths/villageDays×100);
      (c) no new death modes: pd1 cause-families (kind-mapped; named-monster
          strings are combat-family variants, the pilot's operationalization)
          ⊆ pooled pd0 corpus (both policies, both DG cells);
      (d) national reach not collapsing vs control (report; ≥ control−2);
      (e) pantry median-of-run-medians freshDays: pd1 ≥ 0.5× pd0 (report both);
      ENGAGEMENT: ≥28/32 PD=1 configs with depriKcal>0 or easedKcal>0.
- WATCH (report-only): wall numbers per cell (national/table/wins, wave 4–5
  unlocks, median survival), channel PD-deltas, death-cause shares.
- Instruments: scripts/sweep-depinteraction-b.js (derived from the confirm's
  scripts/sweep-plentydepri-confirm-b.js, cited; + DG ledger capture,
  villageDays, schema-exact per-seed JSONs into
  evidence/2026-10-23/depinteraction-b-corpus/), scripts/det-gate-depinteraction-b.js,
  scripts/analyze-depinteraction-b.js (DIAG verdict; exit 0 = DIAG-GO),
  scripts/proof-depinteraction-b.js (fixture + det-gate + hook byte-identical +
  analyzer propagation). Balanced panel per §15: env-gated levers hit the
  documented #797 "Unmatched flags" invalidity by construction — the invalid
  compare .md is attached alongside the manual paired row analysis, metric NOT
  re-scored.
- Verdict: DIAG-GO iff (i)+(ii)+(iii); else DIAG-NO-GO (report-only — both
  levers are already on master; a DIAG-NO-GO is flagged to the coordinator,
  never a self-revert).

## Metric review (pre-sims)
- The primary reuses the pilot/confirm rot/100d exactly — the DIAG's question
  is whether the confirm's DG=ON reversal survives the DG=0 leg, so the
  metric must not move.
- Guardrail (b) keeps the confirm's exposure-normalized revision (raw
  starvation deaths are survival-confounded).
- The interaction term is in log-ratio space so attenuation and amplification
  are symmetric; its sign is the verdict direction.
- Engagement bar ≥28/32 (87.5%) rather than 100%: PD=1 on a lean seed may
  never see a plentiful pantry; the mechanism is conditional by design.
- Horizon 100d matches the confirm: the food-economy question answers in the
  first 100 days; death-aware stop + 10d tail.

## Results
## Results

DIAG VERDICT: **DIAG-NO-GO** — 4 FAIL / 0 UNEXPLAINED
(scripts/analyze-depinteraction-b.js, exit 1; full report:
evidence/2026-10-23/depinteraction-b-analyzer-report.txt).
Report-only per pre-registration: both levers are already on master; the
NO-GO is flagged to the coordinator, never a self-revert.

### Corpus (stale-lock adoption — this run)
The dead worker (run fleshout-loop-b-20261023T1130Z) left 50 schema-valid
pilot per-seed files, 15 EMPTY (0-byte, EPERM-truncated) files, and no
summaries. This run re-ran the IDENTICAL design for all 8 cells × 16
seeds via the dead worker's own EPERM-hardened path
(scripts/run-depinteraction-b.sh; 8/8 cells verified on split attempt 1,
no flap): 128/128 per-seed JSONs schema-valid + 8/8 sweep summaries with
correct meta. Determinism: 44/44 pilot files semantically identical to
the re-run (the 15 empties were lost data, correctly regenerated).

### (i) DG=0 leg reproduces the pilot GO — PASS both feast-sides
- leadfeast: control 303.4k → armed 196.3k = **0.647x** (≤0.80) PASS
- belongfeast: control 225.1k → armed 117.8k = **0.523x** (≤0.80) PASS

### (ii) Interaction term: NAMED, SIGNED, mechanism-attributed — 0 unexplained cells
- leadfeast: log(0.558) − log(0.647) = **−0.147** — DEPOSITGATE=ON **AMPLIFIES** PLENTYDEPRI
- belongfeast: log(0.339) − log(0.523) = **−0.433** — DEPOSITGATE=ON **AMPLIFIES** PLENTYDEPRI

The sign is the OPPOSITE of the pre-registered hypothesis. The stand-down
the hypothesis predicted IS real at the engagement-ledger level — PD
steals DG's plentiful days (dg1 easedKcal 3074k→1568k leadfeast,
3153k→1169k belongfeast) and DG steals PD's (pd1 depriKcal 3136k→2713k,
2474k→2079k) — but it does not flip the rot effect, because the rot is
dominated by a SINGLE channel: the funnel.share glut. PD-delta channel
deltas on all 4 cells are dominated by funnelShare (−965k…−2361k; other
channels ±20–127k). Both levers bite the same glut from two sides (less
production pushed + less deposited): less engagement each ≠ less rot
reduction combined. glutChannels partition conserved (sum ~= total
inflow) on all 128 runs.

THE CONFIRM'S REVERSAL DID NOT REPRODUCE. The origin question was the
sim-plentydepri-confirm-b belongfeast reversal (1.594x MISS with DG=ON).
On 16 FRESH seeds 9250–9265 the dg1 leg is 0.558x (lead) / 0.339x
(belong) — GO with margin. The reversal was seed noise on a
chaos-dominated substrate, not a systematic interaction reversal. The
DIAG's systematic answer is amplification, not reversal.

### (iii) Guardrails — the NO-GO drivers
- (a) paired survival-diff: 0d / 0d / 0d / −4.5d — PASS all (≥ −10d).
- (b) exposure-normalized starvation: leadfeast dg0 PASS (0.063 vs bar
  0.098); FAIL leadfeast dg1 (0.100 vs 0.066, bar 0.080),
  belongfeast dg0 (0.095 vs 0.071, bar 0.087),
  belongfeast dg1 (0.120 vs 0.041, bar 0.057).
- (c) no new death modes: PASS — pd1 families {alien,combat,dehydration,
  sickness,starvation} ⊆ pooled pd0 corpus (kind-mapped per the pilot's
  operationalization).
- (d) national reach: PASS on 3 cells (12=12, 8≥8, 8≥5);
  FAIL belongfeast dg1 (6 vs 11, bar ≥ 9).
- (e) pantry freshDays: PASS all (armed ≥ 0.5× control).
- ENGAGEMENT: 64/64 PD=1 configs with depriKcal>0 or easedKcal>0 — PASS.

Kill discipline (Steve 2026-10-21): the guardrail misses are not a kill.
Root cause is the mechanism itself, working as designed: the throttles
cut the GLUT, and the glut was also the BUFFER. On seeds that turn lean,
the armed village's floor is thinner — +5/+2/+9 starvation deaths over
~13k village-days, and slower surplus accumulation toward national on the
worst cell (belongfeast dg1, 6 vs 11). This is the mechanism's real cost,
not a broken lever. Both levers stay on master; whether the combined
buffer cost wants a throttle of its own is a design call (filed in
sim-findings.md as open, not steve-call — the coordinator decides the
escalation).

### Metric review (post-run)
- The (b) bar (armed ≤ control + 2/(armedVD/100), i.e. ~+0.014–0.016
  headroom) is tight against chaos-dominated starvation counts: the
  scholardist-b lesson (small real effect + large chaos) applies here too —
  paired survival (a) passed everywhere while counts missed. PROPOSED for
  the NEXT run: keep the exposure-normalized starvation metric but judge
  it against a chaos-aware tolerance, or promote paired survival-diff to
  the binding harm bar with starvation counts as watch. NOT re-scored this
  run (§14 binds).
- The interaction hypothesis was directionally wrong (predicted
  attenuation, measured amplification) — the stand-down is real but acts
  on engagement, not on rot. The decomposition holds because the channel
  evidence carried it, never the narration.

### Balanced panel (§15)
The automated compare is invalid BY CONSTRUCTION for env-gated levers
(#797): comparePanels requires before.options.flags === after.options.flags,
so PD=1 vs PD=0 on identical code returns decision:invalid / "Unmatched
flags" — mechanically verified on synthetic panels differing only in the
flag (see Results note above). The invalid compare .md
(evidence/2026-10-23/depinteraction-b-panel-compare.md) is attached
alongside the manual paired row analysis (analyzer report, "MANUAL PAIRED
ROWS (#797 fallback)"); the metric is NOT re-scored.

### Sense testing — PASS
scripts/sense-depinteraction-b.js (2 strong-engagement seeds × PD=0/1,
DG=1, 60d): both lever voices read as people making legible
plenty-decisions. DEPOSITGATE: "Kyle leaves the surplus by the fire for
whoever's hungry. 'The pantry can't take it. We can.'" / "Pavel looks at
the full shelves and waves off the day's share. 'No more into the store
— we eat at the fire, and the shelves keep.'" PLENTYDEPRI: "Miguel peeks
into the pantry, then turns the foraging party back. 'Plenty for days.
Teaching the kids snares instead — they'll need to know.'" /
"Eoin weighs the day's basket against the pantry shelves and puts it
down. 'Enough. Carving bowls instead — we're down to the cracked ones.'"
Named instead-of work with reasons, per-villager phrasing; the combined
(PD=1, DG=1) transcripts show the village consistently reading the same
plentiful sensor on both halves. No robotic, static, or repeated beats
beyond the deterministic early-day overlap expected on identical seeds.

### Wall numbers per cell (national / table / wins, wave 4–5, median survival)
- pd0-dg0 leadfeast: national 12/16, table/wins 0/16, wave≥4 9/16, wave≥5 0/16, survival med 100d
- pd0-dg0 belongfeast: national 7/16, table/wins 0/16, wave≥4 9/16, wave≥5 0/16, survival med 100d
- pd1-dg0 leadfeast: national 12/16, table/wins 0/16, wave≥4 6/16, wave≥5 0/16, survival med 100d
- pd1-dg0 belongfeast: national 8/16, table/wins 0/16, wave≥4 9/16, wave≥5 0/16, survival med 100d
- pd0-dg1 leadfeast: national 10/16, table/wins 0/16, wave≥4 5/16, wave≥5 0/16, survival med 100d
- pd0-dg1 belongfeast: national 11/16, table/wins 0/16, wave≥4 7/16, wave≥5 0/16, survival med 100d
- pd1-dg1 leadfeast: national 8/16, table/wins 0/16, wave≥4 7/16, wave≥5 0/16, survival med 100d
- pd1-dg1 belongfeast: national 6/16, table/wins 0/16, wave≥4 9/16, wave≥5 0/16, survival med 95.5d

The wave-5 door is shut on this substrate (0/128 unlocks); the table/wins
flag never fires in 100d on this axis (as expected — the win is an
endgame arc, not a 100d food-economy outcome).

### Death-cause shares (16 configs per cell; named-monster strings are combat-family)
Combat dominates everywhere (49–85/cell), then monster/ambush/wounds.
Starvation: 6–15/cell (armed cells run higher — the guardrail (b) story).
Sickness 7–19/cell; dehydration 1–5/cell. No alien-death anomaly this run
(the confirm's guardrail-(c) alien death did not recur).

### Village assessment
The pd0-dg0 village is a massive-glut village: 44–99 plenty days per
100d, rot 100k–545k/100d, 93–94% of it FRESH (preservation knowledge is
not the failing point — the glut is fresh inflow that outruns deposit
discipline). National/global reach on most seeds; wave 4 on ~half;
villages die to combat attrition (ambushes, monster fights, wounds that
won't close), almost never to the 100d horizon itself (median survival
100d on 7/8 cells).

Who thrived: fat-seed villages (9250, 9253, 9255, 9256) thrived in every
cell — the rot reduction is biggest where the glut is biggest (e.g.
s9256 leadfeast dg0: 504k→214k; s9252: 118k→0.5k). Villagers on armed
seeds visibly redirect plenty-time labor (teaching snares, carving bowls,
tending fever cases, hauling water) and hold shares at the fire — the
village acts like people who know they're plentiful.

Who died and why: lean-seed villages (9260: dead d25–33 both arms; 9261
belongfeast armed d30 vs d86 control) die of combat/attrition cascades
regardless of arm. The armed cells add a few extra starvation deaths in
the ruins of those collapses — the throttle thins the buffer, so when a
seed turns lean the floor is thinner. Paired survival holds (median diff
≥ −4.5d) because the deaths are early-combat deaths the lever never
touched.

Missing knowledge/capabilities: the rot has ONE channel — the
funnel.share glut of fresh inflow. There is no second, independent rot
channel to attack with another deposit-side throttle; future rot work
should look at production-side composition (what gets deposited fresh vs
preserved, and who processes it) rather than stacking more deposit
throttles on the same sensor.

### Proofs re-run GREEN (this run)
- scripts/proof-depinteraction-b.js: ALL GREEN — fixtures
  test-plentydepri-b.js 28/28, test-depositgate-b.js ALL GREEN; det-gate
  8/8 (gate-off legs never engage; gate-on diverge only where their
  mechanism engages); plentydepri hook byte-identical vs df66ebaff,
  depositgate hook byte-identical vs 1ff979f19; analyzer propagation
  (DIAG-NO-GO propagates as data, exit 1).
- scripts/test-depinteraction-measurement-b.js (new): ALL GREEN — corpus
  integrity 128/128 schema-exact; primary recomputed independently from
  the per-seed corpus matches the analyzer report to printed precision
  (0.647/0.558/0.523/0.339x); interaction signs −0.147/−0.433 confirmed;
  determinism spot-checks (identical sweep instrument, single seeds
  9255/pd1-dg1/leadfeast and 9263/pd0-dg1/belongfeast) reproduce corpus
  rot values exactly.
- OBSERVER-EFFECT NOTE: a bare-harness re-run of a corpus config does NOT
  reproduce corpus numbers (s9255: 11381 vs 397462) — the sweep's daily
  policy wrapper reads G.npcNeeds(id) and G.pantryFreshDays() every day,
  perturbing trajectories. Only the identical instrument reproduces the
  corpus. The paired before/after design is unaffected (all cells ran the
  same instrument). Filed in sim-findings.md.

### Infrastructure notes (this run)
- The EPERM file-write flap was QUIET this run: 8/8 cells verified on
  split attempt 1; the 15 empty pilot files were dead-worker losses from
  an earlier flap wave, not this run's.
- Analyzer STDOUT_SPLIT payload split via a python splitter
  (/tmp/depb-split-analyzer.py, ephemeral): 128/128 patched with cell
  medianSurvival, 0 fails.

(TBD — pre-registration complete; proof + pilot gate next)

## Pilot gate (8 seeds 9250–9257 × 4 cells × 2 policies = 64 configs, 100d)
PASS — engagement 32/32 PD=1 configs (depriKcal>0 or easedKcal>0), far above
the ≥2/8 kill bar. Both levers fire loudly in every cell. Pilot sniff:
- pd0-dg0 (double control): massive-glut world — rot 22k–919k/100d, plenty
  days 44–99, national/global reach on 13/16, wave 4 on 8/16. The food-economy
  axis has real rot to move.
- pd1-dg0 leadfeast: depriKcal 60k–450k on 8/8; rot fell on 9251 (202k→51k),
  9252 (118k→0), 9254 (78k→5k); rose on 9250/9253/9255/9256.
- pd1-dg0 belongfeast: rot fell sharply on 5/8 (9251 204k→10k, 9252 102k→0,
  9253 359k→76k, 9254 314k→86k, 9256 379k→53k).
- pd0-dg1 leadfeast: DG eases 11k–365k kcal, 8/8 firing; rot down vs pd0-dg0
  on the fat seeds (9250 545k→193k, 9253 504k→143k, 9256 504k→150k).
- pd1-dg1 leadfeast (confirm's armed cell): rot collapsed vs pd0-dg1
  (9250 193k→7k, 9251 1k→16k...); plentyDays fell (99→79 on 9250) and DG's
  easedKcal fell with it (352k→121k) — PD's production easing visibly starves
  DG's deposit holdbacks of plentiful days. The stand-down direction is
  already visible in the pilot.

INFRA NOTE (2026-10-23): this container developed an intermittent EPERM flap
on file writes (node fs AND bash redirection, ~10–30 min waves, then
recovers) starting ~12:33 UTC. The sweep instruments were hardened:
atomic temp+rename writes with retries + read-back verification (FAIL LOUDLY
after 60 tries), and a STDOUT_SPLIT mode where the sims emit payloads on
stdout and a shell splitter (scripts/run-depinteraction-b.sh) captures +
retries the file split until every per-seed JSON and the sweep summary
verify (16 seeds, field-level checks). Measurement-only scripts; zero src/js.
