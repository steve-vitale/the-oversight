# sim-vetreengage-confirm-a — CONFIRM NO-GO

Run: fleshout-loop-b-20261117T0030Z (Loop B), arm sim-vetreengage-confirm-a
(CONFIRM of the sim-vetreengage-a pilot GO — no src/ change by design).
Branch `sim-vetreengage-confirm-a` (worktree
`~/workspace/worktrees/sim-vetreengage-confirm-a`).
Base: `580510a5d` (master tip at arm start; lever already ON master,
env-gated `VETREENGAGE=1`, default OFF).
Binding prereg: `evidence/2026-11-16/sim-vetreengage-confirm-a-prereg.md`
(frozen before any judged sim). Band 102901–102908 (fresh, verified),
150d, death-aware, competent verbatim (policy sha
`df9b7dff4de498779655`).

**Verdict: CONFIRM NO-GO.** The pilot GO does NOT replicate on a fresh
band: mean vet5@end among unlocked reads armed 0.667 vs control 0.25 —
the ratio half passes (2.67x) but the absolute floor (≥1.0) fails. Per
the prereg, the pilot GO reads as small-n fluctuation. The lever stays
default OFF; no src/ change either way.

## §1 The question, in plain words

The pilot (band 102601–102608) scored PILOT GO: mean vet5@end among
unlocked 0.0 → 1.4, survival 5/8 held. But the trio launch and
gate-counting pieces NEVER fired (0/19 wave-4-target launches at size 3,
partyTrios 0, countedRows 0/92); the gain came via the seed call + pair
launches. This confirm re-tests, on a FRESH band under the SAME frozen
bars, whether the vet5@end gain replicates — and whether trios ever fire
there.

Answer: the gain does not replicate (0.667, below the 1.0 floor), and
trios still never fire. The trio failure now has a pinned mechanism
(§5): the dawn pick is computed and accepted, then dropped before
depart — 0 of 294 departs carry a second companion.

## §2 Frozen bars + judge

Primary metric: mean living wave-4 veterans at end among wave-5-unlocked
seeds (lever ON vs OFF, same seeds).

| Bar | Control | Armed | Pass |
| --- | --- | --- | --- |
| 1. Mean vet5@end among unlocked, armed ≥ 1.0 AND ≥ 1.5x control | 0.25 | 0.667 (ratio 2.67x) | **FAIL** (floor) |
| 2. Survival guardrail: survived/8 armed ≥ survived/8 control − 1 | 5 | 5 | PASS |
| 3. Starvation watch (reported, not judged): armed ≤ control + 2 | 2 | 1 | PASS |

Judge computed by `scripts/analyze-vetreengage-confirm-a.js` from the
T-class snapshots: `{"verdict": "NO-GO"}`. This time the ratio half was
NOT vacuous (control 0.25, not 0.0) — the floor alone decides the bar.

## §3 Per-seed table

seed | leg | unlock | vet5@unl | vet5@end | w4k field/TB | w3made | conv | wildSch | starv | days | end | standing
--- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | ---
102901 | control | — | — | 0 | 5 f0/tb5 | 4 | 1 | 6 | 1 | 136 | village-lost | 199
102902 | control | 127 | 2 | 0 | 6 f1/tb5 | 8 | 2 | 8 | 1 | 150 | survived | 525
102903 | control | 117 | 2 | 0 | 4 f2/tb2 | 8 | 3 | 9 | 0 | 150 | survived | 375
102904 | control | — | — | 1 | 2 f1/tb1 | 8 | 1 | 5 | 0 | 150 | survived | 199
102905 | control | — | — | 1 | 1 f1/tb0 | 4 | 0 | 3 | 0 | 93 | village-lost | 199
102906 | control | 106 | 2 | 1 | 5 f3/tb2 | 7 | 2 | 4 | 0 | 150 | survived | 440
102907 | control | 117 | 2 | 0 | 3 f1/tb2 | 9 | 2 | 8 | 0 | 148 | village-lost | 245
102908 | control | — | — | 1 | 2 f1/tb1 | 7 | 2 | 6 | 0 | 150 | survived | 199
102901 | armed | 98 | 2 | 0 | 2 f1/tb1 | 6 | 2 | 3 | 0 | 111 | village-lost | 290
102902 | armed | — | — | 0 | 0 f0/tb0 | 5 | 0 | 5 | 0 | 108 | village-lost | 125
102903 | armed | — | — | 0 | 3 f1/tb2 | 4 | 1 | 4 | 1 | 150 | survived | 199
102904 | armed | — | — | 0 | 1 f1/tb0 | 5 | 0 | 6 | 0 | 150 | survived | 150
102905 | armed | 114 | 2 | 0 | 7 f3/tb4 | 9 | 3 | 8 | 0 | 150 | survived | 550
102906 | armed | — | — | 0 | 1 f0/tb1 | 7 | 0 | 1 | 0 | 150 | survived | 199
102907 | armed | 115 | 2 | 2 | 5 f4/tb1 | 6 | 1 | 8 | 0 | 150 | survived | 440
102908 | armed | — | — | 0 | 3 f0/tb3 | 5 | 1 | 4 | 0 | 124 | village-lost | 199

Unlocked seeds: control 4 (102902, 102903, 102906, 102907), armed 3
(102901, 102905, 102907). vet5@end among unlocked: control [0,0,1,0]
mean 0.25; armed [0,0,2] mean 0.667. The single armed 2 is 102907
(peak standing 440, faced wave 5 from d115).

## §4 Mechanism decomposition

| | Control | Armed |
| --- | --- | --- |
| Launches (all sizes) | 28 | 203 |
| Launch by size | 1:0, 2:28, 3:0 | 1:0, 2:203, 3:0 |
| Wave-4-target launches | 0 | 10 |
| Wave-4-target by size | 3:0 | 3:0 |
| Departs | 33 | 294 |
| Launched with killer | 4 | 80 |
| Gate consults (v4gates) | 15 | 76 |
| Gate SEEKs | 0 | 1 |
| Trick holds | 1 | 58 |
| Avoids outmatched | 14 | 17 |
| Encounters (wave-4+) | 158 | 143 |
| Encounter kills / flees / deaths | 10 / 127 / 12 | 8 / 74 / 10 |
| Wave-4 kills (field / TB) | 28 (10 / 18) | 22 (10 / 12) |
| Wave-4 kills per seed | 3.5 | 2.75 |
| Field wave-4 kills per seed | 1.25 | 1.25 |
| Conversions (w3→w4 killer) | 13 (rate 0.236) | 8 (rate 0.17) |
| Wave-3 killers made | 55 | 47 |
| WILD scholar deaths | 49 | 39 |
| Starvation deaths | 2 | 1 |
| Gate-counted rows (countedRows) | 0 | 2 |
| Second-companion picks (v4picks) | 0 | 19 |

Reading: the lever moves a LOT — launches 28 → 203, departs 33 → 294,
gate consults 15 → 76, trick holds 1 → 58 — but none of it lands as
veterans. Field wave-4 kills are FLAT (10 = 10); TB kills fall 18 → 12;
conversions fall 13 → 8. The pilot's inflow story (more wave-3 killers
converting) does NOT reproduce: w3Made 55 → 47, conversions down. The
pilot's durability story (wild scholar deaths down) reproduces weakly
(49 → 39) but buys nothing — the extra launches put more villagers in
the wild and the death rate rises (see §8). Gate-counting fired twice
(vs zero in the pilot) — a flicker, not a mechanism.

## §5 Pick→launch join — the trio failure, PINNED

The §9.4 recorder logged 19 second-companion picks on the armed leg
(control: 0). All 19:

- result: accepted 19/19. reason: accepted 19/19. site: dawn-cands
  19/19. Pool: never empty (poolCount 1–6, dawn pool mean 2.79).
  Tiers: killer 14, armed 5.
- Concentrated on 3 seeds (102903: 8, 102905: 9, 102908: 2) and 5
  holders (boris_kowalski 6, rosa_mendez 6, app_mgpspknz320 2,
  elena_petrova 2, vasyl_shevchenko 2), targets herald / suburb /
  influencer.

Join against the 294 depart rows (same seed, same holder, day ≥ pick
day):

- **Departs with companion2 non-null: 0 of 294.** Party size is 2
  (216) or 1 (78) — never 3.
- 16 of 19 picks' holders DO depart later (same day or within days) —
  always at partySize 2 with companion2 null. 3 picks' holders never
  depart again (elena_petrova d92/d102, boris_kowalski d113).
- Example: rosa_mendez picks petra_novak d108, then launches d108 at
  size 2 with companion2 null; picks again d111/d112/d114/d115, launches
  d112/d115/d119 — every launch size 2, companion2 always null.

**Drop point: between the dawn pick and the depart.** The pick is
computed at dawn (dawn-cands site), accepted, with a live pool — and
the depart path never reads it. `winPlanSecondCompanion`'s return value
is not consumed by the launch/depart code (or the dawn-candidate result
is discarded before depart). The trio shape is dead in effect: the pick
exists only as a recorder row. The pool is not the constraint (never
empty), the gate is not the constraint (all accepted) — the handoff is.

This answers the prereg's §9.4 question directly: the trio failure is
attributed to NEITHER pool-empty NOR needWave-gate. It is a dropped
pick.

## §6 Sense-testing (SENSE-TESTING LAW)

- The corpora carry NO narrative lines: `fights` rows are monster-stat
  records (mid/name/hp/defHp), `casts` are cast-stat records — no
  dialogue, no fight narration to read. The pilot's fight-reading (§6 of
  sim-vetreengage-a.md — wave-4 fights read like fights) stands: this
  arm changes zero src/ code and no fight-narration code, so the
  pilot's sense carries.
- What the confirm CAN sense-check is the pick itself: **19/19 picks
  name a real, living villager on the roster that day** (Amina Diallo,
  Rosa Mendez, Guadalupe Wen, Petra Novak, Axel McDonald, Salvador
  Porter, Hamoud Al-Salem, Klaus Jung — all `dead: false` on the pick
  day). The picks are real people, not ghosts. The lever's failure is
  not in the pick — it is in the handoff to depart (§5).

## §7 Drift check

`node scripts/vetparty-drift-check.js <control> <on>` — **NO PRE-LEVER
DRIFT**. Every seed's first divergence falls on/after the first day the
lever could act (firstDivDay ≥ firstLeverDay + 1 on all 8 seeds;
e.g. 102905: firstLeverDay 34, firstDivDay 35; 102907: 28 → 29).
Log: `evidence/2026-11-16/vetreengage-confirm-a-drift.log`.

## §8 Balanced panel (§15)

`node scripts/build-vetreengage-confirm-panels-20261116.js` —
**decision: review_required** (8 paired cases). Panel:
`evidence/2026-11-16/vetreengage-confirm-a-panel.md`
(`vetreengage-confirm-a-panel.json` + before/after `.json.gz`).

| Metric | Before | After | Paired delta | 95% CI | Status |
| --- | --- | --- | --- | --- | --- |
| Village deaths per run | 71.5 | 88.625 | +17.125 | −2.75 to 36.25 | regression_watch |
| Village deaths per 100 calendar days | 51.177 | 65.17 | +13.993 | 1.41 to 25.69 | **regression_signal** |
| Community loss | 0.375 | 0.375 | 0 | −0.5 to 0.5 | no_material_signal |
| Table win rate / national access | 0 / 0 | 0 / 0 | 0 | 0 to 0 | no_material_signal |

Reading: the armed leg's villages lose people FASTER (deaths/100d +14,
CI clears zero) while the same number survive to the end (5/8 both,
community loss flat). The lever buys exposure — 7x more launches, more
wild time — without buying veterans. On a NO-GO verdict this is a review
note, not a verdict-changer: the lever does not kill villages outright,
but it spends lives faster for no veteran payoff.

ADOPTION FIX: the panel builder as committed defaulted to the PILOT band
(102601–102608) — the copy never updated the seed list — and failed on a
missing per-seed file. Fixed at adoption (default seeds → 102901–102908,
the prereg's confirm band); the build above ran on the fixed builder.

## §9 Proof

`node scripts/test-vetreengage-confirm-a.js` — **passed 52, failed 0,
skipped 0 (lever built)**, exit 0. Log:
`evidence/2026-11-16/vetreengage-confirm-a-proof.log`. Re-run on the
rebased tip at adoption (see §13).

## §10 Telemetry

`telemetry-check.js` vs `telemetry-baselines/scale-wall.json` (metrics
national, table, wins, exiled): **REFUSED — recorder-corpus input.**
The checker takes a single `--current GLOB_OR_JSON` and cannot glob a
`*` directory component (ENOENT on
`perseed-vetreengage-confirm-a-*/*.json`); directory paths fail EISDIR;
the corpora are T-class recorder rows, the same class the checker has
refused all day (2215Z/2230Z rounds). Baseline NOT rolled. The wall
numbers are reported in §12 instead.

## §11 Metric review (§14)

1. **The ratio bar was NOT vacuous this time.** Control mean vet5@end
   among unlocked came in at 0.25 (not 0.0), so the 1.5x half did real
   work (armed 0.667 = 2.67x control, passes) and the absolute floor
   alone decided the bar (0.667 < 1.0, fails). The floor is the binding
   bar on this band.
2. **The pilot gain reads as small-n fluctuation, as the prereg
   anticipated.** Pilot armed 1.4 → confirm armed 0.667, on identical
   bars and a fresh band. The pilot's mechanism decomposition (durability
   + inflow) does not reproduce either (§4).
3. **Panel builder seed list:** the instrument as committed pointed at
   the pilot band, not the confirm band — fixed at adoption (§8). The
   analyzer and proof test were unaffected (they read the corpora the
   driver wrote, band-agnostic).
4. **Next run:** the trio question is now a CODE question, not a
   measurement question — where does the dawn pick get dropped before
   depart? A fix arm would wire the accepted pick into the depart
   (companion2), then re-measure trios on a fresh band. No further
   confirm of the un-wired lever is worth running.

## §12 Wall numbers

| | Control | Armed |
| --- | --- | --- |
| National by standing | 4/8 | 3/8 |
| National by rank | 0/8 | 0/8 |
| Table | 0 | 0 |
| Wins | 0 | 0 |
| Wave-4 unlocked | 8/8 | 8/8 |
| Wave-5 unlocked | 4/8 | 3/8 |
| Median survival | 151d | 150.5d |
| Survived | 5/8 | 5/8 |
| Starvation deaths | 2 | 1 |
| Wave-4 kills | 28 | 22 |
| Wave-5 kills | 0 | 0 |

## §13 Closeout (adoption)

The Loop B 0030Z coordinator timed out before adoption (killed
2026-11-17T02:37Z-ish; the run's claim file and lock were NOT deleted —
the round cannot close while sim-expignite-b is still running). This
evidence file was written by the main-session adoption, which completed
the missing verification: drift check (§7), balanced panel (§8, incl. the
seed-list fix), pick→launch join (§5), sense leg (§6), proof re-run
(§9), telemetry attempt (§10). Corpora + analysis were on disk
uncommitted and are committed with this evidence. Zero src/ changes
(DIAG/CONFIRM, instrument + evidence only). The lever stays default OFF
on master; the pilot GO is NOT confirmed. The 0030Z round's other arms
(sim-expignite-b still running; sim-nationalsticky-b stopped by cron
timeout with 6/16 OFF corpora uncommitted, ON leg never started;
sim-companionguard-b in progress, no completion reported) are NOT part
of this adoption and are left for their own closeout.
