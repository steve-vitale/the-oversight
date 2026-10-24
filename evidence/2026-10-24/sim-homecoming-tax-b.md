# sim-homecoming-tax-b — channel-aware taxonomy audit of the homecoming deposit path

Run: oversight-flesh-out-loop-b-20261024T0430Z, arm sim-homecoming-tax-b (DIAG).
Axis: food-economy. Zero src/js changes, zero new sims, both corpora READ-ONLY.

## Pre-registration (evidence header)

- **Primary metric:** taxonomy completeness — 100% of the 128 depinteraction-b
  configs attributed under the corrected channel taxonomy, 0 unexplained channels.
- **GO threshold:** DIAG-GO iff 100% attributed and 0 unexplained.
- **Horizon/seeds/policies:** n/a (DIAG re-analysis; no sims). Corpus:
  evidence/2026-10-23/depinteraction-b-corpus/ (128 configs) cross-checked
  against evidence/2026-10-23/easingchannels-b-corpus/ (128 configs, same design).
- **Canon:** docs/CANON.md and docs/PRESERVATION.md read. **No canon doc covers
  the depositgate channel taxonomy** — the taxonomy below is instrument
  attribution, not invented canon.

## Metric review

The metric held. The one revision for the next run: "attributed" was
operationalized at the cell level (16-seed cells), not seed level, because the
substrate identity check rejected seed-level attribution transfer (see §2).
No re-scoring occurred; the GO bar was met as written.

## The finding it answers

sim-findings.md item (2026-10-24, sim-infrastructure/taxonomy):
"DEPINTERACTION INSTRUMENT BLIND TO THE HOMECOMING CHANNEL" —
scripts/sweep-depinteraction-b.js's channelOf() maps 'scholar_home' via a
/donat/i stack regex that never matches the homecoming deposit path, so
evidence/2026-10-23/depinteraction-b-corpus/ records
glutChannels.scholarHomecoming = 0 on all 128 configs; those deposits land in
its away_wild/other buckets. Implication: sim-depinteraction-b's "ONE channel"
rot claim (funnel.share dominates the PDΔ) was measured blind to homecoming.

## 1. The blindness, verified

- 128/128 depinteraction-b per-seed JSONs read; metadata matches filenames;
  **scholarHomecoming == 0 on 128/128**. The blindness is real, not a read error.
- Mechanism: channelOf() in sweep-depinteraction-b.js (line 96) maps
  'scholar_home' only on /donat/i (the donateToPantry path). The actual
  homecoming deposit path is returnToVillage/returnToOldVillage, whose stacks
  match /packMeal|homecoming|awayReturn|npcNodeTravel|objReturnEffect/i first →
  'away_wild', or nothing → 'ambient:other'. Both buckets are contaminated.
- The honest instrument exists: scripts/easingchannels-instruments-b.js wraps
  Game.returnToVillage and Game.returnToOldVillage → 'scholar_home' →
  scholarHomecoming (same 128-config design: PDxDG × {leadfeast,belongfeast} ×
  seeds 9250–9265, 100d, FEASTSCALE_R13=1/SEATDRIVE=0).

## 2. Seed-level transfer REJECTED — cell-level attribution is the honest unit

Trajectory fingerprints (daysAlive, villageDays, rot kcal, depriKcal, easedKcal,
national, table, win, freshDaysMedian, waveReach) compared per matched config:
**identical on 0/128, diverged on 128/128** (e.g. seed 9250 belongfeast pd0dg0:
rot 919k vs 444k; both instruments count rot identically, so this is real
substrate divergence). Cause: the game base moved between the two sweeps' run
times (33 src/js commits landed on 2026-10-23; chaos-dominated substrate —
the depinteraction report itself calls it chaos-dominated). Not determinable
post-hoc from corpus data, and not a re-run justification (#850).

Consequence: per-seed cross-corpus subtraction (dep awayReturn − eas
homecoming) is INVALID. The corrected table is built per 16-seed cell from the
honest instrument, and the verdict ratios are computed **within one substrate**
(self-consistent), then compared against the claimed numbers. The analyzer
reproduces sim-depinteraction-b's claimed PDΔ numbers exactly from the corpus
(−2267k/−965k/−2361k/−1297k), so the before/after comparison is apples-to-apples
at the claim level.

## 3. The corrected channel table (per-cell sums over 16 seeds, kcal)

Claimed = depinteraction corpus (blind). Corrected = easingchannels corpus
(honest call-path instrument). PDΔ = PD=1 − PD=0.

| leg | claimed funnelShare PDΔ | claimed homecoming PDΔ | corrected funnelShare PDΔ | corrected homecoming PDΔ | corrected tribute PDΔ | corrected away PDΔ | corrected ambient PDΔ | corrected other PDΔ | homecoming/funnelShare (honest substrate) |
|---|---|---|---|---|---|---|---|---|---|
| leadfeast/dg0 | −2267k | +0k | −3591k | **−1369k** | −512k | +8k | −72k | +109k | **0.38** |
| leadfeast/dg1 | −965k | +0k | −740k | **−302k** | −33k | −24k | −12k | −236k | **0.41** |
| belongfeast/dg0 | −2361k | +0k | −2467k | **−606k** | +0k | −65k | −30k | −18k | **0.25** |
| belongfeast/dg1 | −1297k | +0k | −260k | **−260k** | +0k | +2k | +34k | −506k | **0.51** |

Corrected whole-run volumes (pd0 arms, 16-seed sums): homecoming is
2062k/1591k on dg0 (17.7%/17.2% of pd0 inflow) — the second-largest inflow
channel after funnelShare on every dg0 cell.

**Verdict: UNSEEN, not absent — 4/4 legs.** On every leg the homecoming PDΔ is
25–51% of the funnelShare PDΔ. sim-depinteraction-b's "ONE channel" claim
("PD-delta channel deltas dominated by funnelShare; other channels ±20–127k")
was measured blind to a channel carrying a quarter to a half of the funnel
delta. The claim's quantitative core survives — funnelShare remains the largest
single channel — but the "no second channel" reading is revised: **two channels
dominate the inflow PDΔ, funnelShare and homecoming.**

## 4. The homecoming tax (keep-raise + holdback)

DEPOSITGATE taxes the homecoming channel directly:
- Homecoming volume dg0→dg1 (pd0): leadfeast −1320k, belongfeast −895k
  (16-seed sums; the keep 2000→6000 raise + _depositGateHoldback).
- Measured holdback on away.return + ambient.bighaul (eas corpus ledger):
  leadfeast 334k (retE 177k + bigE 157k), belongfeast 284k
  (retE 148k + bigE 136k) per 16-seed cell; funnel.share eased 2086k/1928k.
- The keep-raise ledger (homecoming-diag-b report, 928 block, per glut-day):
  keepRaise = 0 on all dg0 arms, 120–304 on all dg1 arms (6.5–14.5
  keepRaiseEvents/run). The raise fires exactly when the keep raised.

## 5. Sense-testing: the 6000-keep raise voice

- The per-seed JSONs carry **no Game.say transcript data** (neither corpus;
  eas's sayLines collection is empty). Transcript verification of the voice
  line is not possible from corpus data — stated plainly, no transcript invented.
- Ledger + code read instead: game.js (homecoming decision) gates the raised-
  keep line on `dgKeepRaised && kept > 2000` — "say the raised keep aloud —
  but only when it actually changed behavior (kept > the old 2000 ceiling).
  Never silent when it eased, never narrated when it didn't." The line:
  "The pantry is bursting past tomorrow — most of the haul stays in your pack.
  The fire can wait; the road can't."
- The ledger corroborates the gate: keepRaiseEvents = 0 on all dg0 arms
  (never narrated when the keep didn't raise), >0 on all dg1 arms. The voice
  discipline is structurally sound; the residual gap (no transcript proof) is
  named, not filled.

## 6. Side finding (same instrument, second blind spot — NOT this arm's axis)

depinteraction's channelOf() maps 'tribute' only on /catchUpSim|tribute/i, but
tribute deposits flow through call paths whose stacks don't match — the
depinteraction corpus records **tributeDeposit = 0 on all 128 configs** while
the honest instrument records 1675k/1163k (leadfeast pd0dg0/pd1dg0, 16-seed
sums; −512k PDΔ on leadfeast dg0). Same taxonomy-blindness class, different
channel. Filed as a new OPEN item in sim-findings.md; the corrected table above
already carries the honest tributeDeposit channel.

## 7. Proof

scripts/test-homecoming-tax-b.js — 52 checks, ALL GREEN:
- Synthetic fixtures (full 128-config design, known channel splits): corrected
  homecoming PDΔ exact (−6400/−3200), claimed-blindness reproduced (0),
  true-away vs blind-away deltas exact, partition conserved on all 8 cells.
- Corpus determinism: two analyzer runs byte-identical on all 3 outputs.
- Corpus read-only: 280 corpus files hashed before/after — unchanged.
- 100% configs attributed (8/8 cells, all 6 channels ≥ 0, totals > 0),
  0 unexplained; analyzer exit 0.

## 8. DIAG verdict

**DIAG-GO.** 100% of the 128 configs attributed under the corrected taxonomy;
0 unexplained channels; every channel has an attribution rule; partitions close
(named-share 76.6–97.7%; the dg1 'other' residual of 19–23% is the named
partition remainder — composition not persisted in the corpus, the largest
remaining taxonomy gap, flagged for the next arm). The corrected table stands:
homecoming was UNSEEN, not absent — 25–51% of the funnelShare PDΔ on every leg.

## 9. Village assessment (what the village looked like)

The audit reframes the depinteraction villages: the "funnel.share glut" story
is now a two-channel glut. The homecoming channel — the scholar's own
expedition hauls coming home — is the village's second artery, and DEPOSITGATE
is its tax collector: the keep raise (2000→6000) and the away.return holdback
visibly throttle it on dg1 cells. The rot-dominance mechanism stands, but the
buffer-thinning cost sim-depinteraction-b flagged is now attributable to two
throttled inflows, not one. No blank filled (DIAG-only arm); one blank
documented (tribute blind spot, §6).

## 10. Wall numbers (from the depinteraction corpus, n=16/cell)

national / table+wins / wave≥4 / wave5 / median survival:
- pd0dg0 leadfeast: 12/16, 0/16, 9/16, 0/16, 100d
- pd0dg0 belongfeast: 7/16, 0/16, 9/16, 0/16, 100d
- pd1dg0 leadfeast: 12/16, 0/16, 6/16, 0/16, 100d
- pd1dg0 belongfeast: 8/16, 0/16, 9/16, 0/16, 100d
- pd0dg1 leadfeast: 10/16, 0/16, 5/16, 0/16, 100d
- pd0dg1 belongfeast: 11/16, 0/16, 7/16, 0/16, 100d
- pd1dg1 leadfeast: 8/16, 0/16, 7/16, 0/16, 100d
- pd1dg1 belongfeast: 6/16, 0/16, 9/16, 0/16, 95.5d

The scale wall stands: national reach is real (6–12/16 per cell), the table
unreached (0/16 everywhere), no wins. Median survival 95.5–100d (death-aware
horizon; the instrument stops dead villages).

## Outputs

- scripts/homecoming-tax-b.js (analyzer), scripts/test-homecoming-tax-b.js (proof, 52/52 green)
- evidence/2026-10-24/homecoming-tax-b/corrected-table.json (machine table)
- evidence/2026-10-24/homecoming-tax-b/corrected-table.md (human table)
- evidence/2026-10-24/homecoming-tax-b/run-log.txt (full run log)
- evidence/2026-10-24/homecoming-tax-b/fixtures/ (proof fixture corpora + fixture run)
