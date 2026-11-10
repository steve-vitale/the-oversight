# Prove-out baseline — post gap PRs #3–#7 (2026-11-08)

Measure-only. No policy retunes. No Loop B claim. Unit tests from #3–#7 are
not this baseline.

## Identity

| Field | Value |
|---|---|
| Tip | `816404356` (`origin/master` after merges of PRs #3–#7) |
| Observer | `scripts/balance-panel.js` + all23 contract `panel-contract-rulings-2026-10-24` |
| Policies | `capable,maker,merchant,caregiver` (unchanged registered controllers) |
| Seeds | documented screening 16: `7,42,99,1234,555,777,2026,31337,1,2,3,4,5,6,8,9` |
| Horizon | 150 days |
| Cases | 64 observed + 4 observer-off neutrality proofs (seed 7 × 4 policies) |
| Neutrality | 4/4 match, 0 warnings; `sourcesStable: true` |
| Wall time | ~162s, `--par 4` |

Raw panel: `evidence/2026-11-08/prove-out-baseline-panel/panel.json.gz`  
Feature census: `evidence/2026-11-08/prove-out-baseline-features.{json,md}`  
Machine summary: `evidence/2026-11-08/prove-out-baseline-analysis.json`  
Case cache (local replay only, not the published claim): `…/prove-out-baseline-panel/cases/`

## Headline (blunt)

**On this screening bank, campaigns are not 0 national / 0 full seat / starving-early.**

| Signal | Pooled 64 | vs 2026-11-07 Loop B bands |
|---|---|---|
| National (all23) | **55/64 (86%)** | 2030 witnessdoor confirm: **0/12**; feast pilot: **0/8** |
| Table sit / win | **45/64 (70%)** | witnessdoor table sat **5/12**, wins **5/12**; feast **0/8** |
| Full seat (`endings.table_won.seat === 'full'`) | **9/64** | witnessdoor **full seat 0/12** |
| Lesser seat | **36/64** | (Loop B reported lesser separately; not 0) |
| No seat / no win | **19/64** | — |
| Labeled starvation deaths (any run) | **10/64 runs**; 14 death events total | frozen-band story: early roster loss → mass starve |
| `lowFood` day fraction | **0.7%** | not a food-crisis screen |
| First-bearer survives d60 | **52%** pooled; capable only **25%** | early *bearer* death is real; village often continues |

Per policy (16 each):

| Policy | national | table/won | full | lesser | surv30 | surv60 | communityLost | abilityAccepted/run |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| capable | 11/16 | 15/16 | 3 | 12 | 88% | **25%** | 1/16 | 102 |
| maker | 16/16 | 7/16 | 3 | 4 | 94% | 63% | 2/16 | 114 |
| merchant | 14/16 | 13/16 | 1 | 12 | 100% | 63% | 1/16 | 88 |
| caregiver | 14/16 | 10/16 | 2 | 8 | 94% | 56% | 0/16 | 100 |

Capable wins hard (15/16) while burning first bearers (surv60 25%). Maker reaches
national every seed but sits/wins only 7/16. That is a utilization / seat-drive
shape, not a softlock-to-zero wall on these seeds.

Starvation labels seen: `villager:starvation` (11), `player:starvation` (3).
Early `village-lost` by day 60: rare on this bank (capable seed 1234 is the
clear early collapse in the capable set). **“Starving early” is not the
dominant failure mode here.** Early *fighter* / bearer turnover is.

## Utilization census (collector already exposes)

Jobs/classes (player builds observed across 16 runs; a run can hold more than one):

- **capable:** hunter/stalker 7, forager/gardener 4, socialite/showrunner 4, explorer/cartographer 2, forager/feaster 1. Gods: none.
- **maker:** forager/gardener 8, hunter/stalker 7, socialite/showrunner 3, caregiver/healer 2, plus cartographer/demagogue/beastmaster/feaster/trickster. Gods: 3 runs (relay, all_seeing, shepherd).
- **merchant:** forager/gardener 7, hunter/stalker 5, showrunner 3, healer/feaster/…; **one brawler/juggernaut**. Gods: 2 runs.
- **caregiver:** forager/gardener 10, showrunner 4, demagogue 3, hunter 4, healer 2. Gods: 2 runs.

Abilities / deeds / table path (event totals over 16 runs):

| Policy | ability_granted | ability_used | godpath_deed | table_path | table_won | ascension | scale_rank |
|---|---:|---:|---:|---:|---:|---:|---:|
| capable | 6884 | 1640 | 238 | 17 | 15 | 3 | 36 |
| maker | 6153 | 1847 | 260 | 8 | 7 | 5 | 51 |
| merchant | 4004 | 1416 | 220 | 13 | 13 | 3 | 46 |
| caregiver | 6050 | 1689 | 194 | 11 | 10 | 5 | 47 |

Livelihood controller counters fire where expected (maker crafts/buys/sales/
harvests; merchant buys/sales/harvests; caregiver patients 784 / comforts 128 /
treatments 89). Table win paths observed include feared, beloved, relay,
witness, indispensable, defiant — not a single stuck door.

`goodGear` is 1.0 on every policy in this screen (earned T3+ weapon/armor
access on instrumented routes). That is acquisition coverage, not proof the
gear was useful in the fight that mattered.

## What this does **not** prove

1. **Not a 64-seed holdout.** Small-effect / confirmation claims stay unproven.
2. **Not Muse Loop B’s frozen bands** (53001–53008 / 53201–53212) and **not**
   the doorwalk / fullseat instruments those arms used. The 2026-11-07 wall
   (national 0, full seat 0, wave-5 kills 0 on those bands) is a different
   measurement. This panel does not retire it and does not own that lane.
3. **Not human play.** Bot controllers ≠ phone decisions.
4. **Not clearance of gap PRs #3–#7.** Those PRs’ unit proofs stand on their
   own; this baseline only asks whether the tip still looks unwinnable under
   the documented screening protocol. Spoiler: it does not, on these seeds.
5. **Wave-5 kills** are not an all23 metric; wave unlock reaches 5 on many
   runs (capable 12/16 unlock wave 5) but kill counts were not collected here.

## Muse-overlap note

Loop B (scale-onramp / winnability chain) keeps policy ownership and its own
bands. This run reused stock `capable/maker/merchant/caregiver` with zero
policy edits. Coordinate numbers; do not merge conclusions across instruments
without a same-seed same-observer re-sweep.

## Command

```bash
node scripts/balance-panel.js --root . --n 16 \
  --policies capable,maker,merchant,caregiver --days 150 \
  --out evidence/2026-11-08/prove-out-baseline-panel --par 4
node scripts/balance-features.js \
  evidence/2026-11-08/prove-out-baseline-panel/panel.json.gz \
  --out evidence/2026-11-08/prove-out-baseline-features
```
