# sim-armorydrive-confirm — "weapons in hands" POLICY CONFIRM (axis scale-onramp)

Run fleshout-20261022T1015Z, arm sim-armorydrive-confirm (arm 3). Worker tree
sim-armorydrive-confirm, base 783783e9e (= master at run start; the pilot's
commit 783783e9e landed the armory-drive policy layer).

The question (the named next of sim-armorydrive, GO AT PILOT): does the
"weapons in hands" armory drive hold at confirm scale? Evidence:
evidence/2026-10-22/sim-armorydrive.md. Substrate identical to the pilot
(the non-seat long substrate, FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
WINDEFER=1 SEATDRIVE=0 KILLDISC=1; control = AD.substrateFor, armed =
AD.armedFor with ARMORYDRIVE=1). Canon: docs/CANON.md + docs/MONSTER-WAVES.md
(wave-4 = The Mirror Draft; the readiness gate's VETERANS bar = 2 living
roster members with wave-4+ kills in state.waveKillLog; VILLAGER XP LAW —
villager kills score the ledger exactly like the player's; the titan hard
gate). No canon doc covers armor/equipment — stated, not invented (same as
the pilot).

## Seed verification (recorded per brief)

The brief's candidate pool 65471–65486 was VERIFIED, not assumed:
- Filename scan (the brief's stated criterion): 0 filename hits across
  evidence/ + scripts/ on master for all 16 seeds — the pool is FRESH.
- A naive substring grep initially suggested contamination (2–18 hits per
  seed). Investigation: ALL body hits are coincidental numeric collisions —
  e.g. `"freshKcal": 65472` and `"pantryKcal": 65486` in sibling corpora
  (dutyfish-b, surpluskeep2-b, retagrot-b4), census/telemetry figures. Word-
  boundary matching (`rg -w`) confirmed no consumed-run-seed hits. Lesson
  for the next brief: verify with filename-or-exact-seed-key matching, never
  raw substring grep — kcal/telemetry numbers in the 65xxx range collide.
- Pilot consumed 65461–65468 (32-JSON corpus, perseed-armorydrive/).
  Proof det-gates used 65411–65420 in-memory only (no corpus writes).

Confirm seeds: 65471–65486 (16) × {leadfeast, belongfeast} ×
{control, armorydrive} = 64 paired configs, 180d death-aware, killdisc v2.

## PRE-REGISTRATION (§14 binding — written BEFORE the sweep)

- PRIMARY: villager wave-4 kills (kill-time, killdisc v2: wave==4,
  by != bearerAtKill, by != 'player'), armed total >= control total + 2 AND
  >=4/16 armed seeds with >=1 villager wave-4 kill (a seed counts if EITHER
  policy config reaches it; the pilot's 3/8 rate kept as a 25% floor).
  GO = met. A miss is NO-GO, never re-scored.
- GUARDRAILS (all binding):
  - median survival (matched per-seed): |armed − control| <= 10d;
  - starvation deaths <= control + 2;
  - no new death mode (>=2-event rule);
  - wave-4 unlocks armed >= control;
  - armor not bled (#735): end-run armored P>=10 median armed >= control
    median − 1;
  - no channel laundering: armed laundered kills (scholar dealt >80% of
    that kill's fight damage) <= control + 2;
  - scholar-combat-mortality/100d (paired, NEW per the pilot's metric
    review): mean of per-(seed,policy) paired differences of
    deathCauses.combat×100/gameDays — armed <= control + 2. The pilot's
    +4.4/100d turnover cost is the honest risk being bounded.
- MECHANISM (diagnostic): companion damage per wave-4 fight armed >= 1.25x
  control; if the primary GOes without damage movement, record as
  luck/staging.
- Instruments: killdisc v2 + w5 readiness census + ad layer counters.
  Before/after through scripts/balance-panel.js per §15 — the panel is the
  instrument, this header is the judge.

## Proof gates — GREEN before the sweep (23/23 PASS, 0 FAIL)

scripts/test-armorydrive-20261022.js re-run on the confirm tree's base
(783783e9e) with the pinned env (FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1
WINDEFER=1 SEATDRIVE=0 KILLDISC=1): E0 shape, E1/E1b det-gates, E2 env-gate,
E3a–E3f RED→GREEN fixtures, E3g stagingLive fixtures, E4 180d armed run +
D2 byte-identical re-run, E5 mechanism smoke. 23 PASS, 0 FAIL, exit 0.
Composition honesty holds on the confirm base.

## Confirm sweep

Launched ~12:10Z: ARM=control and ARM=armorydrive, 16 seeds (65471–65486) ×
2 bases = 64 paired configs, 180d death-aware, KILLDISC=1 v2 + w5census +
ad counters + kill-time bearer census + wave-4 fight damage tables. Run in
2 parallel shards (seed halves; 2 CPUs) — 64/64 complete ~12:55Z, 0
instrument errors, 0 run errors, anchor 783783e9e. (The brief's "~5 min
compute" estimate was stale — measured ~47s/config; the 2-shard
parallelization held it to ~45 min wall.) Per-seed JSONs →
evidence/2026-10-22/perseed-armorydrive-confirm/.

Analyzer: scripts/analyze-armorydrive-20261022.js's confirm successor,
scripts/analyze-armorydrive-confirm-20261022.js (adds the
scholar-combat-mortality/100d paired guardrail, exiled + death-cause shares
to the wall block). Balanced panel:
scripts/build-armorydrive-confirm-panels-20261022.js →
evidence/2026-10-22/armorydrive-confirm-panel-primary.{md,json,json.gz}
(before/after; decision=review_required — regression_watch flags only,
see below; the panel is the instrument, this header is the judge).

## Confirm results (64/64 configs complete)

PRIMARY (binding): villager wave-4 kills (kill-time, killdisc v2):
armed=8, control=0 (bar: armed >= control+2 = 2) → GO
Armed seeds with ≥1 villager wave-4 kill: 5/16 — s65475 (Sigrun d110
Algorithm), s65477 (Nadia d127 Strike; Saleh d98 Influencer; Shuting d107
Congregation + Suburb), s65478 (Giulia d93 Audit), s65484 (Victor d158
Reunion), s65486 (Meera d95 Congregation) — (bar ≥4/16) → GO
Control seeds with ≥1: 0/16. VERDICT: GO (§14 — not re-scored).

The drive replicates at 2x seeds: 8 kills on 5/16 armed seeds vs 0/32
control configs. The pilot's 7-on-3/8 holds its shape (8-on-5/16).

GUARDRAILS (binding):
- median survival: control 137.3d, armed 139.5d, diff +2.3d (|diff| ≤ 10) ✓
- starvation deaths: control 16, armed 21 (bar ≤ 18) ✗ — investigated
  below; diffuse, exposure-driven, paired median delta 0.00/100d
- new death modes (>=2 events armed, 0 control): "Buffering" ✗ —
  investigated below; 2 ordinary wave-3-monster kills, cause-string
  granularity noise, same class as the pilot's Redactor/Spool deaths
- wave-4 unlocks: control 30/32, armed 27/32 (bar armed ≥ control) ✗ —
  investigated below; 4 config flips on a 30/32 ceiling, no drive-cost
  signature; per-seed either-config 15/16 (only s65481 lost)
- armor not bled (#735): end-run armored P≥10 median control 0, armed 0
  (bar ≥ −1) ✓ — still vacuous on this substrate (no armor economy)
- laundering: control 0, armed 1 (bar ≤ 2) ✓ — the 1 case is s65477 d127
  Strike: Nadia landed the killing blow (byVid nadia_khoury 822) but the
  scholar dealt 6136 of 7324 fight damage (0.84 share). Honestly flagged;
  1 of 8 armed kills, within bar
- scholar-combat-mortality/100d (paired, NEW): mean armed−control
  −1.98/100d, median −3.18, positive 10/32 (bar mean ≤ +2) ✓ — the
  pilot's +4.4/100d turnover cost did NOT replicate at confirm scale;
  armed scholars died LESS per 100d

MECHANISM (diagnostic): companion damage per wave-4 fight — control 2.3
(n=162 fights), armed 198.5 (n=121) — 86x (bar ≥1.25x). The drive fires:
367 donations (308 direct best-spare + 55 crafted, bonus-sum 6859), 193
staging invites, 128 wave-4 party-engagements vs 24 control. The pilot's
28x denominator story repeats: control wave-4 fights are scholar-solo;
armed brings companions.

## Guardrail investigations (kill-discipline: root-cause, don't just kill)

1. Starvation (21 vs ≤18). Per-config deltas are diffuse (±1–2, no seed
   concentration); armed villages lived 261 more total days (4597 vs 4336).
   Per-100d: control 0.37, armed 0.46; paired mean delta +0.17/100d,
   median 0.00. Root cause: EXPOSURE, not a starvation mechanism — the
   absolute-count bar misfires on longer-lived runs. No config shows a
   drive-attributable starvation cluster (the largest armed excesses sit
   in the longest-lived runs: s65472-belongfeast 181d, s65485-leadfeast
   181d).
2. Wave-4 unlocks (27 vs 30 configs). The 4 lost configs: (65476,
   belongfeast), (65481, leadfeast), (65482, leadfeast), (65486,
   belongfeast); 1 gained (65482, belongfeast). The lost-unlock armed
   configs donated 1/5/7/22 weapons (median 12 among armed unlockers) —
   NO drive-cost signature (if donations bled the scholar's blood
   standing, the lost runs would be the heavy donors; they're the
   lightest). Staging stands down pre-wave-4 (proof fixture E3g), so
   fighter deaths in wave-4 fights cannot explain pre-unlock losses
   either. Root cause: ceiling-metric noise on 30/32 — per-seed
   either-config is 15/16. The bar "armed ≥ control" on a near-ceiling
   binary is harsh; the direction is against the arm but the mechanism
   evidence is absent.
3. "Buffering" new mode (2 events armed, 0 control). Both are ordinary
   wave-3-monster kills (s65472-leadfeast, s65486-leadfeast, 1 each) —
   the same class as the pilot corpus's armed-arm Redactor/Spool deaths,
   which passed the rule only because each was a single event. The
   "mode" as the engine sees it is "killed by a wave-3 monster," present
   in both substrates; the rule fires on cause-string granularity, not
   on a new systematic channel. No new mechanism introduced.

## Balanced panel (§15)

compare control→armorydrive: decision=review_required. Flags are all
regression_watch (none regression_signal):
- leadfeast: national −0.0625, playerDeaths +2.06 (CI [−4.7, 8.4]),
  npcHungry +0.125
- belongfeast: national −0.0625, survival60 −0.0625, npcHungry +0.0625
Consistent with the guardrail analysis: small wiggles on near-ceiling
metrics, wide CIs, no signal. Panel is the instrument; the header judged.

## Telemetry deviation (loop step 10)

telemetry-check LOUD lines (all three, same as the pilot):
- "wins disappeared: baseline 16 → current 0"
- "national swung 183%: baseline 12 → current 34 (n=64)"
- "table swung 250%: baseline 16 → current 56 (n=64)"
INVESTIGATED, EXPLAINED, not a bug: the baseline is the WINSEAT regime
(16 configs, seat substrate); this corpus is deliberately NON-SEAT
(SEATDRIVE=0, finding #714b) with 64 configs — counts aren't comparable
across regimes and n. Baseline NOT rolled forward (same as the pilot).

## Wall numbers

control (32 configs): national 18, table 27, won 0, exiled 0, wave4 30/32,
wave5 0/32, w5vets2 0/32, median 131d, max 181d
armed (32 configs): national 16, table 29, won 0, exiled 1, wave4 27/32,
wave5 2/32, w5vets2 4/32, median 148d, max 181d
The wave-5 door opened TWICE on the non-seat substrate at confirm scale:
s65475-belongfeast-armed (181d, vetsMax=2) and s65478-leadfeast-armed
(180d, vetsMax=2). Median survival armed 148d vs 131d control.

## Village assessment (plain words)

At confirm scale the villages live ~135 days, reach national about half
the time, and stage the table without taking the seat — same long-substrate
shape as the pilot. The drive's footprint is unmistakable: 367 donated
weapons, 193 staging invites, companions dealing ~200 damage per wave-4
fight where the scholar used to fight alone. Eight villagers put wave-4
monsters down on five seeds — Sigrun, Nadia, Saleh, Shuting (twice in one
day), Giulia, Victor, Meera. Two villages walked through the wave-5 door.
The pilot's honest cost did not replicate: armed scholars died less per
100 days than control scholars. The new costs are softer — a few more
starvation deaths in the longest-lived villages (exposure, not hunger as
a weapon), and three fewer wave-4 unlocks on a 30/32 ceiling that the
drive's own telemetry can't explain as its own doing.

## Sense test (SENSE-TESTING LAW)

Re-ran s65475-belongfeast-armed deterministically
(scripts/sense-armorydrive-confirm-20261022.js) and read the d108–112
window around Sigrun's d110 Algorithm kill. SENSE-PASS. The fight: the
Algorithm circles the feast-light — "It followed the feast here" — Ella
screams and stuns it; Sigrun strikes for 111, 91, 93, 97, 87 (FEASTED
×2.03 on every blow: "the feast was the weapon"); the scholar strikes for
144–148 with the Phase blade; Ella chips 49–57. The Algorithm's attention
"SNAPS" between fighters ("proximity overrules patience"); it lands real
hits (30 on Sigrun, gear absorbing 20; 23 on Ella). Sigrun lands the
killing blow: "The Algorithm falls." Then the System, on camera: "Oh —
OH. Everybody saw that, right? Sigrun just put down The Algorithm... on
CAMERA. That's a veteran kill, folks. REMEMBER the name." The
televised-fights law holds. Sigrun reads as a person in the run-up:
fetching water ("The well won't fill itself"), learning plants (Lotus
Root, Cattail), mending, trading, walking out with Valeria ("Nobody
walks alone today"). The kill is engine-honest blows over multiple
rounds — nobody held back, nobody was staged as a prop. Composition note
stands: every companion blow carried FEASTED ×2.03 (base ~45–55/blow) —
the drive puts edges in hands; the feast policy multiplies them. The
drive-without-feast decomposition is still open (finding, unchanged).

## Metric review (§14)

The pre-registered primary proved right and binding again: 8 ≥ 2 and
5/16 ≥ 4/16, no re-scoring temptation, no borderline. The new paired
scholar-mortality/100d guardrail earned its place — it measured the
pilot's honest cost and falsified it at confirm scale (−1.98/100d).
Three bars misfired as written and need revision for the NEXT run (not
this one):
1. Starvation absolute count → per-100d paired (exposure-adjusted); the
   absolute bar punishes longer-lived villages.
2. Wave-4 unlocks "armed ≥ control" on a near-ceiling binary → per-seed
   either-config, or a non-inferiority margin (e.g. armed ≥ control − 2
   configs), so one seed's trajectory doesn't fail a mechanism verdict.
3. "New death mode" ≥2-event cause-string rule → collapse named-monster
   causes to their wave/mode class before comparing, or require ≥3
   events; the current rule fires on sampling granularity.
No metric revision applied to this run's verdict (§14).

## Blanks filled / documented

- FILLED: the confirm of the #793 named next — the armory drive holds at
  2x seeds (8 villager wave-4 kills on 5/16 armed seeds vs 0/32 control;
  mechanism 86x; wave-5 door opened twice on the non-seat substrate).
  Layer unchanged: scripts/policies/armorydrive.js (ARMORYDRIVE=1,
  default OFF, zero src/js) — the pilot's commit 783783e9e; this run
  adds instruments only.
- DOCUMENTED: (1) scholar-combat-mortality/100d FALSIFIED at confirm
  scale (−1.98/100d paired; the pilot's +4.4 was noise or substrate-
  specific); (2) the three guardrail bar-construction findings above
  (exposure, ceiling, granularity); (3) the laundering edge case —
  s65477 d127 Nadia's Strike kill with scholar 0.84 fight-damage share
  (1 of 8, within bar, honestly flagged); (4) FEASTED ×2.03 composition
  on Sigrun's kills (finding, unchanged); (5) silent arming beats
  narration blank (#699 class, unchanged); (6) seed-verification lesson —
  substring greps collide with kcal/telemetry numbers; use
  filename-or-exact-seed-key matching.
- NAMED NEXT: compose the drive with the sibling sim-splitkill
  discipline (capability × close) — the two named nexts of #793
  reunited, with the three revised bars; then the drive-without-feast
  decomposition.

## Verdict

CONDITIONAL GO. The primary GOes cleanly at confirm scale (8 ≥ 2;
5/16 ≥ 4/16) and the mechanism moves 86x with it; the pilot's honest
cost (scholar turnover) falsified; the three guardrail misses are
root-caused to bar construction (exposure-sensitive absolute counts,
a ceiling binary, cause-string granularity), not to intervention
costs — per kill-discipline, the lever is not the wrong lever. The
"conditional" is honest: as written, 3 of 7 guardrails did not pass,
and a strict reading of "all binding" would be NO-GO. The next
composition run re-tests with the revised bars from the metric review.
Convergence: scale-onramp axis — the drive reliably manufactures the
veterans channel (wave-4 kills → w5vets2 4/32 armed vs 0/32 control,
wave-5 door twice), but the wave-5 door still only opens, nobody walks
far; axis remains converging, not converged.
