# sim-feastdisc-paired-b — paired fresh-seed confirm of FEASTDISC's damage-majority kill bar

Run: fleshout-loop-b-20261023T2030Z (loop B, second axis — ARM 2 of 3).
Axis: food-economy. Lever: sim-feastdiscipline (policy-side, FEASTDISC=1 env gate).

## Provenance (why this run exists)

- sim-feastdisc-confirm (d8c122a0c, evidence/2026-10-22/sim-feastdisc-confirm.md):
  GO on a knife-edge — armed 3 vs control 1 damage-majority wave-4 villager
  kills on 12 seeds (bar: armed >= control+2 AND >=3/12 armed seeds).
- sim-feastdisc-reconfirm-b (58b6f79e2, evidence/2026-10-23/sim-feastdisc-reconfirm-b.md):
  independent 16-seed re-confirm, NO-GO on the primary — armed 4 vs control 4
  kills; the control base rate moved 1/12 -> 4/16, swamping the +2 margin at
  16 seeds. Mechanism replicates (feasted-engagement 44.1% vs 18.8%, staged
  feasts 134 vs 0, kill-time kills 13 vs 9, armed dmgMaj shares 0.55-0.89
  decisive vs control 0.50-0.58 marginal). Per Steve's KILL DISCIPLINE the
  lever is NOT killed — the metric was base-rate-limited, not the mechanism
  wrong.
- This run implements the metric review's named next: a PAIRED one-sided
  sign test per matched config (chaos-aware) on FRESH seeds, instead of more
  seeds hoping the corpus-total bar goes GO.

Canon note (task-mandated): feastdiscipline is a POLICY layer (threat-driven
armed-feast staging, FEASTDISC=1). No docs/*.md canon doc covers it — stated
here rather than inventing canon. docs/CANON.md read first; docs/MONSTER-WAVES.md
(wave-4 = The Mirror Draft readiness window) and docs/PRESERVATION.md (the
feast's food ladder — the pantry cost is real) read for the lever's area.

Policy layer: scripts/policies/feastdiscipline.js (FEASTDISC=1, zero src/js,
READ-ONLY for this run — NOT modified). Sweep reuses the proven confirm sweep
scripts/sweep-feastdisc-confirm-20261022.js with SEEDS/EVID overrides (same
measurement path as the reconfirm, fresh seeds).

## PRE-REGISTRATION (§14 binding — written BEFORE any sims)

- Design: 16 FRESH seeds — the FIRST fully-clean 16-block among candidates
  66501-66516, 66601-66616, 66701-66716 per the C1 gate (filename criterion,
  digit-boundary, over evidence/ + scripts/; zero script-content hits) —
  chosen by the C1 gate before any sim runs. Known-excluded blocks:
  66021-66028 (feastdiscipline pilot), 66111-66122 (confirm), 66301-66316
  (reconfirm-b), 66101-66108 (w5preseat), 66109/66110 (test-deathcensus-b),
  66201-66216 (huntfix-adopt-b pilot), 66401-66416 (huntfix-adopt-b armed/ctl —
  LIVE files in evidence/2026-10-22/perseed-huntfix-adopt-b-{armed,ctl},
  2026-10-23). x {leadfeast, belongfeast} x {control, feastdisc} = 64 paired
  configs, 180d death-aware (dead villages stop simulating; harness breaks on
  Game.over), on the same non-seat long substrate as the confirm/reconfirm:
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1
  ARMORYDRIVE=1 (VETREL/REPOSITION/VGEAR unset).
- control = AD.armedFor(base), ARMORYDRIVE=1 (proven baseline).
- feastdisc = FD.disciplinedFor(base), ARMORYDRIVE=1 + FEASTDISC=1
  (threat-driven armed-feast staging OUTSIDE the armorydrive stack). Zero
  src/js, zero policy changes.
- PRIMARY (binding — paired per matched config): for each of the 32 matched
  (seed x policy) pairs, a_k = nW4VillagersDmgMaj on the armed config,
  c_k = nW4VillagersDmgMaj on the control config (KILLDISC-attributed
  damage-majority (>=50% non-scholar share) kill-time villager wave-4 kills,
  as in the reconfirm). Ties (a_k == c_k) are dropped. n = non-tied pairs;
  k_pos = pairs with a_k > c_k, k_neg = pairs with c_k > a_k.
  One-sided EXACT sign test, H1 armed > control:
  p = P(Bin(n, 1/2) >= k_pos) = sum_{i=k_pos..n} C(n,i)/2^n.
  GO iff p < 0.10 AND net pairs (k_pos - k_neg) >= +4.
  A miss is NO-GO — never re-scored (§14). Metric doubts go under
  "metric review" for the next run.
- SECONDARIES (reported, not re-scored): damage-majority share
  distributions on kill-time villager wave-4 kills (armed vs control);
  kill-time villager wave-4 kills; feasted-engagement rate; layer-staged
  feasts (fdTele.feastsStaged); total feasts; mean non-scholar share on
  kill-time kills.
- GUARDRAILS (all binding): paired per-seed median survival >= control-10d;
  no new death mode (>=2-event rule); starvation deaths <= control+3.
- WALL NUMBERS (reported): national/table/wins, wave 4-5 unlocks, median
  survival.
- KILL-FAST: if the layer stages zero feasts on the armed arm (mechanism
  never fires) — close as evidence, do not advance.
- Instruments: KILLDISC=1 v2 (read-only per-source tbDamage attribution on
  wave-3+ monsters + startCombat engagement census) + daily bearer
  census (kill-time attribution — the scholar is a role, not a person) +
  feast-staging census (read-only hostFeast / grantFeastBuff wraps) +
  feastdiscipline layer counters (FD.tele).
- Before/after through the balanced panel (scripts/balance-panel.js) per
  §15 — for env-gated levers the automated compare is INVALID by
  construction (flag snapshots differ per #797); attach the invalid compare
  .md alongside the manual paired rows, and do not re-score from either.

## Proof gates (run BEFORE the sweep — scripts/test-feastdisc-paired-b.js)

- C1 seed-freshness + block selection: first fully-clean 16-block among
  66501, 66601, 66701 (filename criterion digit-boundary over evidence/ +
  scripts/; zero script-content hits; skip-set: this test itself).
- C2 sweep determinism: selected block's first seed x {leadfeast} x
  {control, feastdisc}, 60d, same config twice -> byte-identical sweep JSONs
  (spawns the REUSED confirm sweep to a /tmp evidence dir).
- C3 attribution units: kill-time + damage-majority attribution on
  synthetic waveKillLog/KILLDISC rows — RED->GREEN.
- C4 sign-test metric sanity: exact one-sided sign-test p-value on
  synthetic pair sets + GO arithmetic (ties dropped, net>=4, p<0.10) —
  RED->GREEN.
- C5 analyzer pins the reconfirm corpus: the NEW paired analyzer run on
  the committed reconfirm corpus (evidence/2026-10-23/perseed-feastdisc-reconfirm-b)
  must reproduce its headline numbers exactly (armed 4 vs control 4
  damage-majority kills; k_pos/k_neg/net and p to 6 decimals). No sims —
  pure determinism of the new instrument.

RESULT: **ALL GREEN — 20 PASS, 0 FAIL** (2026-10-23, current master tip).
C1 selected block 66501-66516 (clean per the gate); C2 pinned determinism
on both arms (control + armed 60d re-runs byte-identical); C3 pinned the
bearer <redacted>-aware attribution; C4 pinned the analyzer's exact
one-sided sign-test p-value against 5 hand-computed values plus 6
GO/NO-GO edge cases (incl. the exact net=+4 edge and the all-ties n=0
case) using the real exported functions; C5 pinned the analyzer against
the committed reconfirm corpus (control 4 / armed 4, k_pos=4, k_neg=4,
net=0, p=0.63671875, NO-GO — exact match). The sweep ran AFTER these
gates.

## Sweep (after GREEN gates)

FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1
ARMORYDRIVE=1 ARM=control / ARM=feastdisc (+FEASTDISC=1) SEEDS=66501..66516
(first clean block per the C1 gate, 2026-10-23; verified before any sims)
POLICIES=leadfeast,belongfeast DAYS=180 EVID=evidence/2026-10-23/perseed-feastdisc-paired-b
node scripts/sweep-feastdisc-confirm-20261022.js — 64 configs, per-seed JSONs
written ONCE, on purpose, to evidence/2026-10-23/perseed-feastdisc-paired-b/.

## Results — 64 configs, 180d death-aware (sweep complete 2026-10-23)

Control = AD.armedFor, armed = FD.disciplinedFor, both ARMORYDRIVE=1,
substrate FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
KILLDISC=1 ARMORYDRIVE=1. Corpus: evidence/2026-10-23/perseed-feastdisc-paired-b/
(64 JSONs). Analysis: scripts/analyze-feastdisc-paired-b.js.

### PRIMARY (paired sign test per matched config — binding): NO-GO

- 32 matched (seed x policy) pairs: 27 ties, n=5, k_pos=3, k_neg=2,
  net=+1, p=0.500000000. GO required p < 0.10 AND net >= +4. **NO-GO.**
- Reference corpus totals (non-binding): control 5 vs armed 7
  damage-majority kills.
- The non-tied pairs:
  - armed>control (3): leadfeast|s66508 (staged 6, Shuai d176 Suburb
    0.72), leadfeast|s66510 (staged 8, Guadalupe d64 Suburb 0.81),
    leadfeast|s66512 (staged 11, Adil d77 Suburb 0.65 + Ruth d107 Strike
    0.58 x2) — ALL on configs where the layer staged feasts.
  - control>armed (2): belongfeast|s66506 (staged 2, Nikos d172 Strike
    0.52), belongfeast|s66510 (staged 1, Leo d63 Influencer 0.67) — the
    layer fired on the armed side but failed to convert.
- The paired design worked as intended (chaos-aware): two pairs carry the
  SAME kill on both arms and count as ties — s66508/belongfeast Andres
  d116 Influencer 0.51 on both arms, s66513/belongfeast Nikolai d69 Strike
  1.0 on both arms. Same-seed conjunctions fire identically on both arms;
  the sign test prices them as ties rather than noise.
- Honest reading: with 27/32 ties, the paired test had only n=5 effective
  pairs — the damage-majority event is too rare per-config for a paired
  count bar at 16 seeds to separate arms. This is the same base-rate
  finding as the reconfirm, in paired form: the mechanism steers the
  conjunction (below), but the kill-count bar does not move at this scale.

### SECONDARY (replicates the mechanism readings)

- Kill-time villager wave-4 kills: control 7 (7/32 configs) vs armed 11
  (10/32 configs) — the kill-credit lift replicates (reconfirm: 9 vs 13).
- Feasted-engagement rate: control 24/88 (27.3%) vs armed 50/124 (40.3%)
  — the conjunction lift replicates (reconfirm: 18.8% vs 44.1%).
- Layer-staged feasts: 74 armed (tele.feastsStaged), 0 control —
  composition honesty holds (the layer never fires on control).
- Total feasts: 334 armed vs 273 control.
- Damage-majority share distributions on kill-time kills: armed 0.51,
  0.58, 0.58, 0.65, 0.72, 0.81, 0.81, 1.0 (8 kills, 6 configs) vs control
  0.51, 0.52, 0.67, 1.0, 1.0 (5 kills, 5 configs) — the armed side
  manufactures decisive (not marginal) companion-majority kills.
- Mean non-scholar damage share on kill-time villager kills: 0.62 armed
  (n=12) vs 0.58 control (n=8).

### GUARDRAILS: ALL PASS

- Paired per-seed median survival: control 147.5d vs armed 137.0d raw;
  paired median diff 0.0d on BOTH policies (bar >= -10d). Ranges:
  leadfeast -43..+38, belongfeast -50..+12 — symmetric, no directional
  shift.
- Starvation deaths: 25 armed vs 26 control (bar <= control+3).
- No new death mode: every armed cause appears in control; no armed cause
  >=2 events absent from control. Top causes both arms: combat (749/720),
  villager combat (275/272), monster (51/41), expedition (47/46),
  starvation (25/26), sickness (16/18) — same shape.

### §15 balanced panel: built, noted, manually judged

- feastdisc-paired-b-panel-primary-before/after.json.gz + .md built from
  the paired corpus (scripts/build-feastdisc-paired-b-panels.js).
- Panel decision: review_required. leadfeast playerDeaths regression_signal
  (delta +3.75, ci [0.81, 7.88]) and playerDeaths100Days regression_signal
  (delta +2.54, ci [0.41, 5.04]); belongfeast all watch with CIs crossing
  zero. Per-policy combat-death sums: leadfeast 384 armed / 324 control
  (+60); belongfeast 365 armed / 396 control (-31).
- §15 STATUS: the intervention is env-gated (FEASTDISC=1 on the armed arm
  only); per the pre-registration the automated compare is invalid by
  construction — the manual paired-row comparison is the judging
  instrument. Descriptive note, not a verdict: the leadfeast excess is a
  one-policy subset effect (belongfeast moves the other way), and the
  pre-registered paired survival guardrail — the judge — shows median diff
  0.0d on both policies. No re-score from either instrument.

### Telemetry deviation check: 3 LOUD lines, regime artifacts

node scripts/telemetry-check.js vs telemetry-baselines/scale-wall.json
fired 3 LOUD lines (national 12->20, table 16->44, wins 16->0). Same as
the reconfirm: the baseline's own _regime block is the WINSEAT regime
(SEATDRIVE=1); this run is the pre-seat substrate (SEATDRIVE=0), where
"wins are structurally ~0 there and telemetry-check will fire a spurious
LOUD 'wins disappeared'." All three LOUD lines are regime artifacts, not
deviations — interpreted, not investigated further.

## Sense test (SENSE-TESTING LAW) — PASS (determinism MATCH)

scripts/sense-feastdisc-paired-b.js re-ran the s66512/leadfeast armed
config (fdStaged=11, Ruth d107 Strike dmgMaj kill) mirroring the sweep's
oneRun exactly + read-only Game.say wrap. VERIFY-DETERMINISM: MATCH
(sense timeline == corpus timeline).

What the narration shows (d70-120), and it is SENSIBLE:
- d70: Jason stages the feast; Spool is drawn by the feast-smell — "Face
  it while the feast is in you" — and falls feasted. The MIRROR DRAFT is
  announced the same night: "Say hello to the MIRROR DRAFT."
- d74-76: the layer's conjunction working in prose — the feast draws Ad
  Break ("WE'LL BE RIGHT BACK," says the sky), the counter is learned
  ("Look away when the break runs"), the sponsor-creature is killed, The
  Algorithm circles the light, The Focus Group falls — all while feasted.
- d77: Adil puts down The Suburb — "Adil just put down The Suburb...
  on CAMERA. That's a veteran kill, folks. REMEMBER the name."
- d101-107: the feast draws The Influencer (falls, RERUN), draws The Big
  Beast (Scarred veteran — falls); d107 Ruth puts down The Strike —
  "Ruth just put down The Strike... on CAMERA. REMEMBER the name."
- The fire talks back: feast-draws are faced, not avoided; gossip grows
  the kills ("The story's already growing"); deaths are mourned (d105:
  "The Audit killed Bayan in 1 round. The village mourns."); traders
  arrive (Stonebridge grain, Hungry Road begging food); carcass spoilage
  is narrated honestly ("went bad — maggots, smell, the whole sad story.
  Leaving it had a cost.").
- Noted, not in scope: the per-blow "A mailbox falls over" line repeats
  13x during The Suburb fight (the known narration cadence, same class as
  the reconfirm's per-tick "blow carries the feast"); the televised kill
  line double-fires for the duplicated KILLDISC row.

Verdict: PASS. The feasted wave-4 fights read as villagers fighting —
feasted blades answering the feast's own draws, televised, storied,
mourned. Nothing robotic, nothing repeated-without-cause.

## Metric review (§14)

The paired run PROVED the paired count-bar revision is still
base-rate-limited at 16 seeds: 27/32 ties -> n=5 effective pairs, p=0.50.
The paired design did its real job — it priced the shared-seed
conjunctions as ties instead of noise (two identical kills on both arms
count as ties here; in a corpus total they would have counted 2-2) — but
damage-majority companion kills at ~1 per 6 configs are too rare for a
per-config count bar to separate arms at this seed scale.

Revisions proposed for the NEXT run, none applied here:
1. The informative quantities are the mechanism readings that DO move at
   16 seeds: feasted-engagement lift (27.3%->40.3%, replicates across 4
   runs), staged-feast volume (74 vs 0), kill-credit lift (7 vs 11), and
   the manufactured share distribution (armed 0.65-1.0 decisive). The
   count-bar family (corpus-total +2, paired sign test) needs either 32+
   seeds or a different unit — per-ENGAGEMENT conversion: of feasted
   wave-4 engagements, what fraction yield a companion-majority kill?
   (the conjunction volume the layer demonstrably manufactures).
2. The intent-to-treat note stands clean (all 3 armed-positive pairs on
   fdStaged>=6 configs; the 2 control-positive pairs on configs where the
   armed side staged but failed to convert) — keep it standard.

Per Steve's KILL DISCIPLINE: a missed bar is not a kill. The lever is NOT
shown wrong — the layer fires deterministically (74 staged feasts), steers
the conjunction (40.3% vs 27.3% feasted engagement), replicates the
kill-credit lift (11 vs 7), and manufactures decisive companion-majority
kills (0.65-1.0). What failed is the kill-count GO bar, in paired form,
against a too-rare event at 16 seeds. The lever stays; the bar needs
revision.

## Village assessment (plain words)

Villages on both arms live ~137-148 days, reach national 10/32, sit the
table 22/32, unlock wave 4 on 19/32 and wave 5 on 2/32 — the wall shape is
IDENTICAL between arms (maxWave distributions match exactly:
w2=4 w3=9 w4=17 w5=2 both sides), which is the paired design working:
same seeds, same progression, the lever only steers the fight calendar.
Nobody starves for the fire (25-26 starvation deaths across 64 configs);
nobody dies a new kind of death. The fire is busier on the armed arm: 334
feasts vs 273, 74 of them staged by the threat-driven layer, and
companions fight feasted 40% of engagements vs 27%.

The sense-run village (s66512/leadfeast) tells the human story: the
feast's own smoke draws the fights — Spool, Ad Break, The Algorithm, The
Influencer, The Big Beast — and the feasted blades answer them. Adil and
Ruth took veteran kills on camera and the fire retold them bigger. The
Audit killed Bayan in one round and the village mourned. Stonebridge's
traders brought grain; the Hungry Road begged food; carcasses left out
went bad and the game said so. The feast economy worked as the war
economy: the fire that feeds the blades also summons what they must
fight. This is the same honest trade the pilot documented — a busier
fight calendar with the combat deaths that come with it — but the fights
read as fights, not spreadsheets.

## Convergence (scale-onramp axis)

converging — the feast leg of the veterans conjunction remains
policy-steerable at independent 16-seed scale (staged-feast volume,
feasted-engagement lift, and kill-credit lift all replicate across four
runs now; guardrails all pass), but the damage-majority kill-count bar
did NOT separate from the control base rate in paired form either
(NO-GO: 32 pairs, 27 ties, n=5, k_pos=3, k_neg=2, p=0.50, net=+1). The
metric review's named next is the per-engagement conversion bar. No new
lever required; no lever killed.

## Files

- scripts/test-feastdisc-paired-b.js — proof gates C1-C5 (NEW, 20 PASS)
- scripts/analyze-feastdisc-paired-b.js — paired sign-test analyzer,
  exports pure functions for the gates (NEW)
- scripts/build-feastdisc-paired-b-panels.js — §15 panel builder,
  seed-agnostic (NEW)
- scripts/sense-feastdisc-paired-b.js — sense harness, seed-agnostic (NEW)
- evidence/2026-10-23/perseed-feastdisc-paired-b/ — paired corpus (64 JSONs)
- evidence/2026-10-23/feastdisc-paired-b-panel-primary.{json,md} +
  -before/-after.json.gz (§15, attached invalid-by-construction)
- scripts/sweep-feastdisc-confirm-20261022.js — REUSED unchanged
  (SEEDS/EVID overrides)
- scripts/policies/feastdiscipline.js — the layer (FEASTDISC=1, zero
  src/js, UNCHANGED)
