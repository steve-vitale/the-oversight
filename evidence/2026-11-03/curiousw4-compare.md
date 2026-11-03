# Curious-default escalation pilot comparison — Loop A 20261103T0518Z, run sim-curiousw4-a

Prereg: `scripts/curiousw4-prereg-20261103.md` (committed before any
judged sim, commit 67e6ed342). Driver:
`scripts/curiousw4-driver-20261103.js`. Per-seed JSONs:
`evidence/2026-11-03/perseed-curiousw4-a/s-{baseline,variant}-s<seed>-cpilot.json`.
Say transcripts: `/tmp/curiousw4-says-{baseline,variant}-s<seed>-cpilot.json`
(not in repo; the per-seed JSONs carry a filtered sigLines sample).

Arms: baseline = closecommit stack (leadfeast + windefer + seatdrive +
fullseat-diag + titanroute + musterclose + mustergap), mode herald, 180d
death-aware cap. Variant = baseline + `scripts/policies/curiousw4.js`
(`withCuriousW4` — presses the fight's own enabled wave-4 signature
verbs in player turn-based fights; POLICY-SIDE ONLY, zero src/js).
Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 HERALD=1. Seeds 98501–98508, identical across arms.
Anchor: branch sim-curiousw4-a (post bdd725c81).

NOTE on baseline sig counts: baseline shows sigUses=0 structurally —
the sig layer is absent from the baseline. Baseline 0 does NOT mean
"no wave-4 fights happened"; variant sig counts are the availability
measure (sig verbs fired on 4 of 8 seeds). Zero-sig variant seeds
(98501, 98503, 98505, 98506) have byte-identical trajectories to
baseline (same deaths, same days, same wave-4 list) — the control
that the layer is inert without a wave-4 player fight.

## Per-seed table

| seed | base w4 fought | var w4 fought | base >=1 | var >=1 | var sig uses | var attributed deaths | base deaths | var deaths | base starv | var starv | base days | var days |
|------|---------------|---------------|----------|---------|--------------|----------------------|-------------|------------|------------|-----------|-----------|----------|
| 98501 | 0 | 0 | 0 | 0 | 0 | 0 | 21 | 21 | 1 | 1 | 29 | 29 |
| 98502 | 2 (suburb, eater) | 4 (suburb, strike, congregation, eater) | 1 | 1 | 6 | 1 | 42 | 44 | 0 | 0 | 90 | 95 |
| 98503 | 0 | 0 | 0 | 0 | 0 | 0 | 37 | 37 | 0 | 0 | 90 | 90 |
| 98504 | 3 (eulogy, reunion, suburb) | 3 (eulogy, eater, influencer) | 1 | 1 | 5 | 2 | 58 | 59 | 0 | 0 | 149 | 139 |
| 98505 | 0 | 0 | 0 | 0 | 0 | 0 | 24 | 24 | 1 | 1 | 61 | 61 |
| 98506 | 1 (audit) | 1 (audit) | 1 | 1 | 0 | 0 | 43 | 43 | 0 | 0 | 90 | 90 |
| 98507 | 5 (eater, herald, reunion, strike, influencer) | 5 (eater, herald, reunion, strike, influencer) | 1 | 1 | 4 | 2 | 58 | 58 | 0 | 0 | 142 | 142 |
| 98508 | 5 (algorithm, reunion, influencer, suburb, congregation) | 4 (algorithm, influencer, eulogy, strike) | 1 | 1 | 9 | 3 | 50 | 48 | 0 | 0 | 90 | 95 |
| TOTAL | 16 kinds | 17 kinds | 5 | 5 | 24 | 8 | 333 | 334 | 3 | 3 | median 90 | median 92.5 |

Sig uses by verb (variant): tbInflOutentertain 8, tbEulogyContradict 5,
tbEaterPoison 4, tbSuburbLeave 2, tbStrikeMeet 2, tbAlgoTank 2,
tbCongRefuse 1. Never pressed in this band: tbCongHeresy,
tbStrikeMeet cap aside, tbAuditRead (no audit player fight offered it
in a pressable turn), tbSuburbRest, tbEulogyRewrite.

## Judged verdict (prereg §GO, binding)

- (a) Seeds with >=1 wave-4 fought: variant 5 − baseline 5 = **0**
  (GO needs >= +2). FAIL.
- (b) Cost bar, all three legs:
  1. Total starvation deaths: variant 3 <= baseline 3 + 2. PASS.
  2. Fighter-attributed arm deaths (scholar deaths inside a
     sig-pressed fight, driver tele-wrap keyed to sig-pressed fight
     ids): **8** (GO needs <= 2). FAIL.
  3. Median survival: variant 92.5d >= 0.8 × baseline 90d. PASS.
- **Verdict: KILLED.** Leg (a) fails and leg (b2) fails. No re-scoring:
  the +1 total wave-4 kinds (16 → 17), the 98502 gain (2 → 4 kinds),
  the wave-4 kill gain (1 → 4 kills), the newly learned Strike trick,
  and the table/won gain (4 → 5) are descriptive only, not the judged
  quantity.

## Wall numbers (pilot, both arms except where noted)

- National reach: 0/8 both. Table: tableDone baseline 4/8, variant 5/8;
  won flag baseline 4/8, variant 5/8.
- Wave 4 unlock: 6/8 both (98501 never past wave 2, 98505 never past
  wave 3; unlock days 30–97 where unlocked). Wave 5 unlock: 0/8 both;
  wave-5 fought: 0/8 both.
- Median survival (game days at run end): baseline 90d, variant 92.5d;
  max baseline 149d, variant 142d. Runs end by win (~day 90–95) or by
  village loss (day 29–149); the 180d cap never bound.
- Wave reach (seeds with >=1 fought): wave 1: 8/8 both; wave 2: 8/8
  both; wave 3: 7/8 both; wave 4: 5/8 both; wave 5: 0/8 both.
- Death-cause shares (pilot totals): baseline 333 deaths (villager
  combat 173, combat 61, the wild 31, monster 16, expedition 14, wound
  13, starvation 3); variant 334 (villager combat 174, combat 63, the
  wild 27, monster 17, expedition 14, wound 13, starvation 3).
  Scholar deaths: baseline 38, variant 34.
