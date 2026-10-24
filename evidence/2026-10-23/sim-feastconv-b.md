# sim-feastconv-b — FEASTDISC=1 under the per-engagement conversion bar

Run: fleshout-loop-b-20261023T2230Z (loop B, food-economy axis, arm sim-feastconv-b).
Lever: FEASTDISC=1 (scripts/policies/feastdiscipline.js, zero src/js, UNCHANGED).
Axis: food-economy, second axis per the loop-B role (loop A works the scale-onramp).

## Provenance (why this run exists)

- sim-feastdisc-confirm (d8c122a0c, evidence/2026-10-22/sim-feastdisc-confirm.md):
  GO on a knife-edge — armed 3 vs control 1 damage-majority wave-4 villager
  kills on 12 seeds (bar: armed >= control+2 AND >=3/12 armed seeds).
- sim-feastdisc-reconfirm-b (58b6f79e2, evidence/2026-10-23/sim-feastdisc-reconfirm-b.md):
  independent 16-seed re-confirm, NO-GO — armed 4 vs control 4 kills; control
  base rate moved 1/12 -> 4/16. Mechanism replicates (feasted-engagement 44.1%
  vs 18.8%, staged feasts 134 vs 0, kill-credit 13 vs 9). Lever NOT killed
  per KILL DISCIPLINE — the metric was base-rate-limited.
- sim-feastdisc-paired-b (8438328b5, evidence/2026-10-23/sim-feastdisc-paired-b.md):
  paired fresh-seed confirm — PRIMARY NO-GO: 32 pairs, 27 TIES, n=5, k_pos=3,
  k_neg=2, net=+1, p=0.50 (bar p<0.10 AND net>=+4 missed). The paired design
  was base-rate-limited (27/32 ties). Mechanism replicates on a 4th straight
  run: staged feasts 74 vs 0, feasted-engagement 40.3% vs 27.3%, kill-time
  villager wave-4 kills 11 vs 7, armed dmgMaj shares 0.51-1.0 decisive vs
  control 0.50-0.58 marginal. Guardrails ALL PASS.
- This run implements the metric review's named next: PER-ENGAGEMENT
  CONVERSION — of feasted wave-4 engagements, the fraction yielding a
  companion-majority (kill-time villager damage-majority) kill. The
  denominator changes from per-pair to per-engagement, removing the tie
  trap.

Canon note (task-mandated): feastdiscipline is a POLICY layer (threat-driven
armed-feast staging, FEASTDISC=1). No docs/*.md canon doc covers it — stated
here rather than inventing canon. docs/CANON.md read first;
docs/MONSTER-WAVES.md (wave-4 = The Mirror Draft readiness window) and
docs/PRESERVATION.md (the feast's food ladder — the pantry cost is real)
read for the lever's area.

## PRE-REGISTRATION (§14 binding — written BEFORE any sims)

- Design: 16 FRESH seeds — the FIRST fully-clean 16-block among candidates
  68511-68526, 68611-68626, 68711-68726 per the C1 gate (filename criterion,
  digit-boundary, over evidence/ (excl. this run's own perseed dir) +
  scripts/; zero script-content hits; skip-set: the proof test itself) —
  chosen by the C1 gate before any sim runs. Known-excluded blocks:
  66501-66516 (paired-b), 66301-66316 (reconfirm-b), 66111-66122 (confirm),
  66101-66110, 66021-66028 (pilot), 66201-66216 / 66401-66416
  (huntfix-adopt-b), 68501/68508 (partially touched).
  x {leadfeast, belongfeast} x {control, feastdisc} = 64 configs, 180d
  death-aware (dead villages stop simulating; harness breaks on Game.over),
  on the same non-seat long substrate as the paired run:
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1
  ARMORYDRIVE=1 (VETREL/REPOSITION/VGEAR unset).
  control = AD.armedFor(base), ARMORYDRIVE=1 (proven baseline).
  feastdisc = FD.disciplinedFor(base), ARMORYDRIVE=1 + FEASTDISC=1
  (threat-driven armed-feast staging OUTSIDE the armorydrive stack).
  Zero src/js, zero policy changes.
- PRIMARY (binding — per-engagement conversion, pooled per arm):
  denominator = rows of w4EngageDetail with feasted === true (one row per
  fight; fightId-unique per the sweep's startCombat census).
  numerator = denominator rows whose (day, mid) matches a kill-time villager
  dmgMaj kill row (kill rows deduped by (day, mid) — the known KILLDISC
  double-fire duplicate counts once).
  Rows with feasted == null (no matching startCombat census) are excluded
  from the denominator and counted separately.
  Pooled across the arm (all seeds x policies), not per-config mean.
  conversion_armed = num_armed / den_armed, conversion_control likewise.
  GO iff conversion_armed >= conversion_control + 15pp AND
  conversion_armed >= 30% absolute.
  A miss is NO-GO — never re-scored against a friendlier metric mid-run
  (§14). Metric doubts go under "metric review" for the next run.
- SECONDARIES (reported, not re-scored): layer-staged feasts (fdTele.feastsStaged,
  expect >0 deterministic armed vs 0 control); feasted-engagement share;
  kill-time villager wave-4 kills (kill-credit lift); dmgMaj share
  distributions on kill-time villager wave-4 kills.
- GUARDRAILS (all binding): paired per-seed median survival >= control-10d;
  no new death mode (>=2-event rule); starvation deaths <= control+3.
- WALL NUMBERS (reported): national/table/wins, wave 4-5 unlocks, median/max
  survival, maxWave distributions.
- Structural note: wins are structurally ~0 on the SEATDRIVE=0 substrate —
  the pinned substrate has no seat path (telemetry-check will fire a
  spurious LOUD 'wins disappeared' vs the WINSEAT-regime baseline; regime
  artifacts are interpreted, not investigated).
- KILL-FAST: if the layer stages zero feasts on the armed arm (mechanism
  never fires) — close as evidence, do not advance.
- Instruments: KILLDISC=1 v2 (read-only per-source tbDamage attribution on
  wave-3+ monsters + startCombat engagement census) + daily bearer census
  (kill-time attribution — the scholar is a role, not a person) +
  feast-staging census (read-only hostFeast / grantFeastBuff wraps:
  armed feast days, feasted status at each wave-4 engagement) +
  feastdiscipline layer counters (FD.tele).
- Before/after through the balanced panel (scripts/balance-panel.js) per
  §15 — for env-gated levers the automated compare is INVALID by
  construction (#797 pattern); attach the compare .md alongside the manual
  per-engagement analysis, and do not re-score from either. The panel is
  the instrument, the pre-registered bar is the judge.

## Proof gates (run BEFORE the sweep — scripts/test-feastconv-b.js)

- C1 seed-freshness + block selection: first clean block among
  68511/68611/68711 (filename criterion digit-boundary over evidence/ +
  scripts/; zero script-content hits; skip-set: the test itself).
- C2 sweep determinism: selected block's first seed x {leadfeast} x
  {control, feastdisc}, 60d, same config twice -> byte-identical sweep
  JSONs (spawns the REUSED confirm sweep to a /tmp evidence dir).
- C3 per-engagement counting units: kill-row dedup, (day,mid) matching,
  feasted-null/non-feasted exclusion, bearer/player non-conversion —
  RED->GREEN on the real analyzer exports.
- C4 conversion-verdict arithmetic: GO/NO-GO edges of the pre-registered
  bar (armed >= control+15pp AND armed >= 30%) — RED->GREEN on the real
  exported function.
- C5 analyzer pins the committed paired-b corpus: the NEW analyzer on
  evidence/2026-10-23/perseed-feastdisc-paired-b must reproduce
  mechanically-derived quantities (control 3/24=12.5%, armed 7/50=14.0%;
  hand-verified feastdisc-lead-s66512 config 2/4=0.50). No sims — pure
  determinism of the new instrument.

## Sweep (after GREEN gates)

FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1
ARMORYDRIVE=1 ARM=control / ARM=feastdisc (+FEASTDISC=1) SEEDS=68511..68526
(first clean block per the C1 gate, 2026-10-23; verified before any sims)
POLICIES=leadfeast,belongfeast DAYS=180 EVID=evidence/2026-10-23/perseed-feastconv-b
node scripts/sweep-feastdisc-confirm-20261022.js — 64 configs, per-seed JSONs
written ONCE, on purpose, to evidence/2026-10-23/perseed-feastconv-b/.
Namespace feastconv-* on all new scripts (disjoint from sibling arms
pooledblock-*/storageshedb7-*).

## Results — 64 configs, 180d death-aware (sweep complete 2026-10-24 UTC)

Control = AD.armedFor, armed = FD.disciplinedFor, both ARMORYDRIVE=1,
substrate FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
KILLDISC=1 ARMORYDRIVE=1. Corpus: evidence/2026-10-23/perseed-feastconv-b/
(64 JSONs). Analysis: scripts/analyze-feastconv-b.js (namespace feastconv-*).

Infrastructure note: the sweep was interrupted mid-control-arm by the known
intermittent container EPERM-on-write flap (Error: EPERM: operation not
permitted, write — writeFileSync in the sweep; same class as the 2026-10-23
.git-lock flap, new surface: evidence/ writes). One 0-byte file resulted
(control-lead-s68520.json). The flap persisted ~11 min through 5 retries;
the armed arm completed fully on retry. The 14 missing control configs were
re-swept to /tmp (flap-free) and copied into evidence/ — byte-deterministic
per the C2 gate. Full corpus re-validated: 64/64 JSONs parse.

### PRIMARY (per-engagement conversion, binding): NO-GO

- control: 5/35 = 14.3% of feasted wave-4 engagements convert
- armed:   7/88 =  8.0% of feasted wave-4 engagements convert
- diff (armed − control): −6.3pp. GO required armed >= control + 15pp AND
  armed >= 30% absolute. **NO-GO, decisive on both legs.**
- feasted-null rows: 0 both arms (no attribution gaps).
- Per-policy: control lead 2/13 (15.4%), belong 3/22 (13.6%);
  armed lead 2/34 (5.9%), belong 5/54 (9.3%) — no policy flips the sign.
- Converting configs: armed 6/32, control 4/32. Same-seed conjunctions
  convert on BOTH arms (leadfeast s68518 eulogy d81; leadfeast s68526
  strike d72) — the paired run's tie-pricing shows up here as shared
  numerator events, correctly.
- Reference (informational): on the OLD paired corpus this instrument reads
  armed 7/50 = 14.0% vs control 3/24 = 12.5% (diff +1.5pp — also NO-GO
  against this bar; pinned in C5). The bar's base rate is ~12-14% on both
  corpora, far below the 30% absolute leg.

The mechanism fires (below) but the manufactured feasted engagements do
NOT convert at a higher rate — the denominator the layer manufactures
(88 vs 35) grows ~2.5x while the numerator (7 vs 5) barely moves.

### SECONDARY (the mechanism replicates on a 5th straight run)

- Kill-credit lift: kill-time villager wave-4 kills control 11 vs armed 17
  (paired-b: 7 vs 11; reconfirm: 9 vs 13).
- Feasted-engagement lift: control 35/164 (21.3%) vs armed 88/189 (46.6%)
  — replicates (paired-b: 27.3% vs 40.3%; reconfirm: 18.8% vs 44.1%).
- Layer-staged feasts: 192 armed (tele.feastsStaged), 0 control — the layer
  never fires on control; composition honesty holds.
- Total feasts: 434 armed vs 255 control.
- Damage-majority share distributions on kill-time villager wave-4 kills:
  armed 0.54, 0.54, 0.56, 0.57, 0.65, 0.67, 0.67, 0.75, 1.0, 1.0 (n=10)
  vs control 0.54, 0.56, 0.59, 0.65, 0.70, 0.75, 0.79 (n=7) — the armed
  side still manufactures the top-end decisive kills (two 1.0 shares).
- Mean non-scholar damage share on all kill-time villager wave-4 kills:
  0.53 armed (n=18) vs 0.51 control (n=12).

### GUARDRAILS: ALL PASS

- Paired per-seed median survival: control 125.5d vs armed 115.5d raw;
  paired median diff 0.0d (bar >= -10d). Range -49..+33 — symmetric.
- Starvation deaths: 24 armed vs 23 control (bar <= control+3).
- No new death mode: every armed cause appears in control; no armed cause
  >=2 events absent from control. Top causes both arms: combat (875/779),
  villager combat (237/239), expedition (56/57), monster (54/56),
  starvation (24/23), wound (21/24) — same shape; armed is busier in
  combat (+96) with the same villager-combat deaths.

### §15 balanced panel: built, noted, manually judged

- feastconv-b-panel-primary-before/after.json.gz + .md built from the fresh
  corpus (scripts/build-feastconv-b-panels.js).
- Panel decision: review_required. leadfeast playerDeaths100Days
  regression_signal (delta +3.34, ci [0.41, 6.58]); belongfeast playerDeaths
  regression_signal (delta +3.94, ci [1.38, 6.56]); belongfeast national and
  npcHungry regression_watch with CIs touching zero.
- §15 STATUS: the intervention is env-gated (FEASTDISC=1 on the armed arm
  only); per the pre-registration the automated compare is invalid by
  construction (the #797 pattern) — the manual per-engagement analysis is
  the judging instrument. Descriptive note, not a verdict: BOTH policies
  show more combat deaths on armed (unlike the paired run's one-policy
  subset effect) — consistent with the analyzer's busier fight calendar
  (189 vs 164 engagements, 88 vs 35 feasted) — but the pre-registered
  paired survival guardrail, the judge, shows median diff 0.0d, starvation
  24 vs 23, and no new death modes. No re-score from either instrument.

### Telemetry deviation check: 3 LOUD lines, regime artifacts

node scripts/telemetry-check.js vs telemetry-baselines/scale-wall.json
fired 3 LOUD lines (national 12->20, table 16->44/45, wins 16->0) — the
same three as the paired run and the reconfirm: the baseline's own _regime
block is the WINSEAT regime (SEATDRIVE=1); this run is the pre-seat
substrate (SEATDRIVE=0), where wins are structurally ~0 and the check fires
spurious LOUD lines. All three are regime artifacts — interpreted, not
investigated; baseline NOT rolled.

## Sense test (SENSE-TESTING LAW) — PASS (determinism MATCH)

scripts/sense-feastdisc-paired-b.js (REUSED unchanged, seed-agnostic) re-ran
the s68526/leadfeast armed config (fdStaged=7, strike d72 feasted dmgMaj
kill) mirroring the sweep's oneRun exactly + read-only Game.say wrap,
CORPUS=evidence/2026-10-23/perseed-feastconv-b. VERIFY-DETERMINISM: MATCH
(sense timeline == corpus timeline).

What the narration shows (d60-85), and it is SENSIBLE:
- d63: Betty opens the pantry wide (−3,660 kcal); the feast's smoke draws
  Nostalgia ("It followed the feast here") — faced while feasted, falls.
- d70: the layer stages the armed feast (FEAST SURGE ×1.5 armed, −3,378
  kcal); Ad Breaks are played (sponsor-creature killed, "pops like a soap
  bubble"), the show continues.
- d72: the layer stages again (−1,686 kcal); the smoke draws The Strike
  ("It followed the feast here"); Jian's and Sam's blows carry the feast
  blow-by-blow; "The Strike falls" — "Sam just put down The Strike...
  on CAMERA. That's a veteran kill, folks. REMEMBER the name."
- d81: Greta stages another feast "while somebody's seat is empty, and
  everybody sees it. For one evening, grief sits at the fire with them
  instead of standing over them." d84: Arc IV — THE INEFFICIENCY lands
  ("Organic consumption yields impossible output. Recalculating.").

Verdict: PASS. The feasted wave-4 fights read as villagers fighting —
feasted blades answering the feast's own draws, televised, storied,
mourned. The mechanism's intent ("stage the fire before the fight") is
visible in prose: the fire that feeds the blades summons what they must
fight, and the blades answer feasted. Nothing robotic,
nothing repeated-without-cause.

## Metric review (§14)

The per-engagement conversion bar MISSED decisively (armed 8.0% vs control
14.3%, diff −6.3pp; bar: +15pp AND 30% absolute) — and on the old paired
corpus it would also have missed (armed 14.0% vs control 12.5%, diff
+1.5pp). This is the third miss of the kill-count/conversion bar family
(corpus-total +2, paired sign test, per-engagement conversion) against the
same mechanism, which replicates its mechanism readings on a 5th straight
run: staged-feast volume (192 vs 0), feasted-engagement lift (21.3%→46.6%),
kill-credit lift (11 vs 17), manufactured decisive shares (two 1.0s).

Root-cause read: the layer's theory of change is "stage the fire before
the fight so the 2-dawn buff covers the blades" — it delivers the
denominator (feasted engagements, 2.5x the control volume) but not the
numerator (conversions, 7 vs 5). The manufactured engagements — feast-draw
scavengers faced feasted — don't yield companion-majority kills at the
base rate, let alone +15pp above it. The bar asks for something the lever's
theory doesn't supply: getting companions TO the fight feasted is not
getting them to WIN it with damage-majority. That is a metric-scope miss
(same class as the homecoming DIAG-NO-GO), not a lever-kill: per KILL
DISCIPLINE the lever is NOT shown wrong — it fires deterministically (192
staged feasts), steers the conjunction (feasted-engagement 21.3%→46.6%),
replicates the kill-credit lift (11→17), and manufactures decisive kills.
What fails is the conversion bar, in a new unit, against a ~12-14% base
rate at 16 seeds with a 30% absolute leg the mechanism has never
approached.

Revisions proposed for the NEXT run, none applied here:
1. The bar family needs either (a) a different instrument — the mechanism
   readings that DO move at 16 seeds (staged volume, feasted-engagement
   lift, kill-credit lift, share distribution) — or (b) a mechanism
   addition on the conversion side (a fight-side companion to the
   feast-side layer), which is a design question, not a mid-run chase.
2. If the bar is re-run, drop the 30% absolute leg: the base rate is
   ~12-14% on both corpora; a +15pp relative leg is already demanding.
3. Keep the (day, mid) engagement<->kill matching and the double-fire
   dedup as the engagement-scope standard (pinned in C3/C5).

## Village assessment (plain words)

Villages on both arms live ~116-126 days, reach national 10/32, sit the
table 21-24/32, unlock wave 4 on 26/32 — the wall shape is near-identical
between arms (maxWave: control w2=2 w3=4 w4=25 w5=1; armed w2=2 w3=4 w4=21
w5=5 — the armed arm pushes four more villages to wave 5, same seeds).
Nobody starves for the fire (23-24 starvation deaths across 64 configs);
nobody dies a new kind of death. The fire is busier on the armed arm: 434
feasts vs 255, 192 of them staged by the threat-driven layer, and
companions fight feasted 47% of engagements vs 21%.

The sense-run village (s68526/leadfeast) tells the human story: the feast's
own smoke draws the fights — Nostalgia, the Ad Breaks, The Strike — and
the feasted blades answer them. Sam put down The Strike on camera and the
fire retold it bigger. Greta feasted the village while somebody's seat sat
empty, and the game said grief sat at the fire with them. Stonebridge's
grain arrived (2,069 kcal, "no tribute, no ceremony"); the Hungry Road
reported a killing (gossip, "the truth: dead is dead"); Arc IV landed with
the System finally seeing that eating is the engine. The feast economy
worked as the war economy again: the fire that feeds the blades also
summons what they must fight — busier calendar, same honest trade.

## Convergence (food-economy axis)

converging — the feast leg of the veterans conjunction remains
policy-steerable at independent 16-seed scale (staged-feast volume,
feasted-engagement lift, and kill-credit lift all replicate across five
runs now; guardrails all pass), but the per-engagement conversion bar did
NOT separate from the control base rate — it went the wrong way (NO-GO:
armed 8.0% vs control 14.3%, diff −6.3pp; bar +15pp AND 30% absolute).
The metric review's named next is the mechanism readings as the instrument
(bar-family retired) or a conversion-side mechanism addition (Steve's
design call). No lever killed.

## Wall numbers (scale-onramp report — this corpus)

| metric | control | armed |
|---|---|---|
| national | 10/32 | 10/32 |
| table | 21/32 | 24/32 |
| wins (structural 0, SEATDRIVE=0) | 0/32 | 0/32 |
| wave 4 unlocked | 26/32 | 26/32 |
| wave 5 unlocked | 1/32 | 5/32 |
| median survival | 125.5d | 115.5d |
| max survival | 181d | 181d |
| maxWave dist | w2=2 w3=4 w4=25 w5=1 | w2=2 w3=4 w4=21 w5=5 |

## Files

- scripts/test-feastconv-b.js — proof gates C1-C5 (NEW, 26 PASS)
- scripts/analyze-feastconv-b.js — per-engagement conversion analyzer,
  exports pure functions for the gates (NEW)
- scripts/build-feastconv-b-panels.js — §15 panel builder,
  seed-agnostic (NEW)
- evidence/2026-10-23/perseed-feastconv-b/ — fresh corpus (64 JSONs)
- evidence/2026-10-23/sim-feastconv-b.md — this file
- evidence/2026-10-23/feastconv-b-panel-primary.{json,md} +
  -before/-after.json.gz (§15, attached invalid-by-construction)
- scripts/sense-feastdisc-paired-b.js — REUSED unchanged (seed-agnostic)
- scripts/sweep-feastdisc-confirm-20261022.js — REUSED unchanged
  (SEEDS/DAYS/POLICIES/EVID overrides)
- scripts/policies/feastdiscipline.js — the layer (FEASTDISC=1, zero
  src/js, UNCHANGED)
