# sim-killlootbundle-a — KILL-LOOT searcaster bundle

- Arm: sim-killlootbundle-a (LEVER), Loop A run fleshout-20261121T2015Z.
- Base: worktree HEAD `3329f4441`; branch `sim-killlootbundle-a`.
- Prereg: `evidence/2026-11-21/sim-killlootbundle-a-prereg.md` (committed
  `7df786d82`, frozen ~21:50 UTC 2026-11-21, before any judged sim).
- Instrument commit: `7df786d82` (lever + instrument; proof test 12/12,
  analyzer selftest 17/17).
- **Adoption-written evidence:** the worker was cancelled by the run
  timeout before writing a judgement or this file. The verdict below is
  the adoption coordinator's read of the worker's frozen prereg plus the
  analyzer's own compare output (`killlootbundle-a-compare.json`,
  verdict `INCONCLUSIVE`) — no new judged sim was run by the
  coordinator, and no bar was re-scored. Proof test (12/12) and analyzer
  selftest (17/17) were re-run by the coordinator after the index-clobber
  repair (see §7) and are green.
- Horizon: 150d death-aware. Seeds: 107261–107268 (fresh band, verified
  unused). Policy: competent (verbatim). Substrate:
  `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1 SENSEEXPED=1
  BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1` (both legs identical except
  `KILLBUNDLE`).

## Verdict: INCONCLUSIVE

**The mechanism is proven; the effect is unjudged.** Both legs saw
**zero** kill-loot searcaster arrivals — 0 in 8 seeds on ctl, 0 in 8 on
arm — so the frozen zero-arrival rule (prereg §6) fires: bar 3 is
INCONCLUSIVE, not GO, not NO-GO. The lever never engaged, so the two
legs are trajectory-identical on every number (deaths 701 = 701,
starvation deaths 5 = 5, median survival 150.5 = 150.5, days and end
reasons identical per seed). That is consistent with the prereg's own
static prior — kill-loot arrivals are rare, ~1 per 8 seeds on the
grantrate band, so P(0 in 8) ≈ 34% — but it means this pilot cannot say
whether a bundled kill-loot gun ever reaches a fight. The next run
needs a wider band (16 seeds: P(≥1 arrival) ≈ 88%) or a forced-arrival
fixture.

**Lever disposition: KEPT, env-gated, default OFF.** The prereg's
revert rule applies to NO-GO only; this is INCONCLUSIVE, and the
mechanism stands proven by bar 2. The lever adds zero RNG draws, fires
only on a roll that already returned `'searcaster'`, is off in the
browser (`process.env` undefined) and off unless `KILLBUNDLE=1`, and
showed zero measured cost (panel identical on every observed metric).
Keeping it preserves the proven mechanism for the wider-band follow-up
without any live-game effect. Coordinator decision, documented here;
Steve can overrule.

## Frozen-bar table (prereg §6)

| Bar | Frozen threshold | Result | Pass |
| --- | --- | --- | --- |
| 1. Instrument validity (proof test 100% + selftest + 0 errors + every kill-loot drop carries a cells-at-arrival diff) | all must hold | proof test 12/12 (re-run by coordinator); selftest 17/17 (re-run); instrumentErrors 0 both legs; 0 drops to diff, so the diff requirement holds vacuously | ✅ |
| 2. Mechanism proof (KILLBUNDLE=1 bundles exactly 2 cells on a forced searcaster drop, 0 when off, 0 for non-searcaster) | all must hold | proof test 12/12 — forced searcaster +2 cells on, +0 off; non-searcaster +0 even with KILLBUNDLE=1; bundle lands on the same holder as the gun | ✅ |
| 3. Pilot GO (arm: ≥ 1 bundled kill-loot arrival AND ≥ 1 kill-loot volley; ctl: 0 bundled arrivals) | all must hold for GO | arm bundled 0, kl volleys 0; ctl bundled 0 — zero-arrival rule fires | ❌ INCONCLUSIVE |
| 4. Coverage (100% of kill-loot drops attributed with cells-at-arrival; 100% of gun arrivals counted; 0 unclassified sources) | all must hold | 0 drops to attribute; 9 + 9 gun arrivals counted (all contest grants); 0 unclassified searcaster sources | ✅ (vacuous) |
| 5. Guardrails (panel ctl → arm: no material signal on starvation deaths or median survival; total gun arrivals reported) | all must hold | starvDeaths 5 = 5; median survival 150.5 = 150.5; panel review_required (unobserved metrics), no material signal on observed metrics; total arrivals 9 = 9 | ✅ |

## Wall numbers (both legs, 8 seeds — identical)

| Metric | Ctl | Arm |
| --- | --- | --- |
| Wins | 0/8 | 0/8 |
| National scale access | 0/8 | 0/8 |
| Table | not instrumented (null) | not instrumented (null) |
| Wave 5 reached | 2/8 | 2/8 |
| Wave 4 reached | 8/8 | 8/8 |
| Median survival | 150.5 days | 150.5 days |
| Community lost | 2/8 (107267 day 106, 107268 day 140) | 2/8 (same seeds, same days) |
| Standing at end | 199, 515, 199, 420, 199, 199, 199, 199 | identical |

The scale wall still binds: no village reaches national, none wins.
This arm was a supply lever, not a scale lever — the wall numbers are
recorded, not moved.

## 1. The funnel — both legs (identical)

| Stage | Ctl | Arm |
| --- | --- | --- |
| Contests fired | 12–14 per seed (band total not split in compare) | identical |
| Contest grants (searcaster) | 9 | 9 |
| Kill-loot searcaster arrivals | 0 | 0 |
| Kill-loot bundled arrivals | 0 | 0 |
| Kill-loot dry arrivals | 0 | 0 |
| **Gun ARRIVALS (contest + kill-loot)** | **9** | **9** |
| Searcaster volleys (all guns) | 2 (4 shots) | 2 (4 shots) |
| Kill-loot volleys | 0 | 0 |
| Holder-days with cells (kill-loot holders) | 0 | 0 |

The 2 searcaster volleys (4 shots) on both legs come from contest-prize
guns — the GUNRATE bundle working as before. No kill-loot gun existed to
fire on either leg.

## 2. Per-seed tables (identical both legs)

| Seed | Days | End | Wave | Standing | Gun arrivals |
| --- | --- | --- | --- | --- | --- |
| 107261 | 151 | survived | 4 | 199 | (band total 9) |
| 107262 | 151 | survived | 5 | 515 | |
| 107263 | 150 | survived | 4 | 199 | |
| 107264 | 152 | survived | 5 | 420 | |
| 107265 | 150 | survived | 4 | 199 | |
| 107266 | 151 | survived | 4 | 199 | |
| 107267 | 106 | village-lost | 4 | 199 | |
| 107268 | 140 | village-lost | 4 | 199 | |

Per-seed arrival splits are in `killlootbundle-a-compare.json`
(`perSeed` arrays, ctl and arm identical).

## 3. Sense-test — nothing fired, so nothing new to read

The lever never engaged on either leg, so there is no new behavior to
judge for coherence — the sense read is that the two legs are the same
story told twice, which is exactly what a never-firing lever should
look like. The counterpoint is on the sibling arm's band: tier4access
seed 107257 (day 107) DID see a kill-loot searcaster arrive and be
taken the same day — kill-loot arrivals happen, roughly 1 per 8–16
seeds; this band drew none. No robotic or incoherent behavior
introduced.

## 4. Balanced panel (§15)

`scripts/build-killlootbundle-panels-a.js` + `scripts/balance-panel.js
compare` (before = ctl, after = arm, 8 paired cases):
**review_required** (unobserved metrics), no material signal on any
observed metric — every observed metric is byte-identical between legs.
Panel: `evidence/2026-11-21/killlootbundle-a-panel.md` (+ `.json`,
`-before.json.gz`, `-after.json.gz`).

## 5. Instrument notes and deviations

- **Smoke (pre-pilot, NOT judged):** seed 107261, ctl then arm, gate
  0 instrument errors + driver runs to completion on both legs.
  Passed (smoke corpus in `perseed-killlootbundle-a-smoke-ctl/`).
- **Write flap (host):** the 2015Z run ran through flap bursts; the
  worker's final commit `7df786d82` landed, but the worktree index was
  left clobbered (the safe-commit index-clobber class: committed files
  staged-as-deleted, `game.js` staged-reverted). The adoption
  coordinator repaired it with the `git ls-tree -r HEAD |
  git update-index --add --index-info` pipe and verified empty status
  + empty diff HEAD + hash-object match per file. No work was lost: all
  five repaired files hash-match HEAD.
- **Worker cancelled before judgement:** the panel builder and compare
  ran (panel + `killlootbundle-a-compare.json` present, verdict
  INCONCLUSIVE from the analyzer), but no judgement file and no
  evidence file existed. This file and the adoption closeout commit
  supply them from the frozen prereg + analyzer output; no new judged
  sim was run.
- **What was NOT measured:** whether a bundled kill-loot gun fires in
  a real fight (the point of the pilot — 0 arrivals, so unmeasured);
  table entry/sitting (not instrumented — left null, never faked).

## Metric review (MEASUREMENT.md §14)

- **Bars frozen before any judged sim** (prereg, committed `7df786d82`):
  bars 1, 2, 4, 5 pass; bar 3 is INCONCLUSIVE under the frozen
  zero-arrival rule. No bar was re-scored; the verdict is INCONCLUSIVE
  on the frozen bars.
- **The zero-arrival rule worked as designed.** It kept an empty pilot
  from being scored as a NO-GO (which would have reverted a proven
  mechanism on zero evidence) or a GO (which would have blessed an
  unjudged effect). The rule's price is a follow-up: the next run must
  carry a wider band or a forced-arrival fixture, named here.
- **The pilot band was too narrow for the event rate.** The prereg's
  static prior (~1 arrival per 8 seeds) implies P(0 in 8) ≈ 34% — this
  outcome was the modal miss, not a surprise. A 16-seed band gives
  P(≥1 arrival) ≈ 88%; a forced-arrival fixture (stub `rollAlienLoot`
  → `'searcaster'` in a staged kill, then fight a wave-4 door) judges
  the "reaches a fight" half deterministically. Recommend the fixture
  first — it is cheaper than doubling the band and answers the volley
  question directly.
- **Guardrail metrics are uninformative at zero arrivals.** With the
  lever never firing, ctl ≡ arm by construction; the guardrail pass is
  a tautology here, not evidence of safety. The real safety evidence
  is the mechanism proof (zero draws, fires only on an existing
  searcaster roll) plus the env gate.

## Findings (for the coordinator to append to sim-findings.md)

- [open] 2026-11-21 — kill-loot bundle pilot INCONCLUSIVE, needs a
  wider band or forced-arrival fixture — 0 kill-loot searcaster
  arrivals on either leg of the 8-seed pilot (107261–107268), so the
  frozen zero-arrival rule fires: mechanism proven (proof test 12/12,
  exactly 2 cells on a forced drop) but the "reaches a fight" half is
  unjudged. Next run: 16-seed band (P(≥1 arrival) ≈ 88%) or a
  forced-arrival fixture (stub rollAlienLoot → searcaster, then a wave-4
  door fight). Lever kept env-gated default-OFF on master.

## Files

- Prereg: `evidence/2026-11-21/sim-killlootbundle-a-prereg.md`
  (`7df786d82`)
- Instrument (kept): `scripts/analyze-killlootbundle-a.js` (selftest
  17/17), `scripts/killlootbundle-driver-a.js`,
  `scripts/test-killlootbundle-a.js` (proof test 12/12),
  `scripts/build-killlootbundle-panels-a.js`
- Lever (kept, env-gated `KILLBUNDLE=1`, default OFF): `src/js/game.js`
  (`villagerKillLoot`, +13 lines)
- Pilot: `evidence/2026-11-21/perseed-killlootbundle-a-ctl/` (8 corpora),
  `evidence/2026-11-21/perseed-killlootbundle-a-arm/` (8 corpora),
  `evidence/2026-11-21/perseed-killlootbundle-a-smoke-ctl/` (smoke)
- Panel: `evidence/2026-11-21/killlootbundle-a-panel.md` (+ `.json`,
  `-before.json.gz`, `-after.json.gz`),
  `evidence/2026-11-21/killlootbundle-a-compare.json`

## Run identity

- **Base:** worktree HEAD `3329f4441`; branch `sim-killlootbundle-a`;
  prereg + lever + instrument commit `7df786d82`; adoption closeout
  commit (this evidence file + panel builder + panel outputs) by run
  fleshout-20261121T2215Z.
- **Pilot command (arm):** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1
  FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1 CELLGATE=1
  KILLBUNDLE=1 MODE=arm OUTDIR=perseed-killlootbundle-a-arm
  SEEDS=107261,107262,107263,107264,107265,107266,107267,107268
  RUN=killlootbundle-a node scripts/killlootbundle-driver-a.js`.
  **Ctl:** identical minus `KILLBUNDLE` (`MODE=ctl`,
  `OUTDIR=perseed-killlootbundle-a-ctl`).
- **Analyze command:** `node scripts/analyze-killlootbundle-a.js
  --compare` → `killlootbundle-a-compare.json` (verdict INCONCLUSIVE).
- **Panel command:** `node scripts/build-killlootbundle-panels-a.js &&
  node scripts/balance-panel.js compare --before
  evidence/2026-11-21/killlootbundle-a-panel-before.json.gz --after
  evidence/2026-11-21/killlootbundle-a-panel-after.json.gz --out
  evidence/2026-11-21/killlootbundle-a-panel` → review_required
  (unobserved metrics), no material signal.
- **Proof test:** `node scripts/test-killlootbundle-a.js` → 12/12 green
  (re-run by the adoption coordinator after the index repair).
  **Selftest:** `node scripts/analyze-killlootbundle-a.js --selftest` →
  17/17 green (re-run by the coordinator).
