# sim-vetfinish-b — prereg: verify the landed committed finish on the grind band + build the constructed wall-delivery instrument

- Arm: sim-vetfinish-b (Loop B, BUILD arm, run fleshout-loop-b-20261109T2330Z)
- Branch: sim-vetfinish-b; base anchor `65fef6d7e` (worktree `~/workspace/worktrees/sim-vetfinish-b`)
- Master moved under the branch after start: `65fef6d7e` → `0b2e37220`
  (foodrung adoption, DIAG zero src/js; intervening src/js change is
  journey-succession r166 askfavor dialogue only — no field-fight mechanic
  touched). The coordinator rebases at landing; this run does NOT rebase or
  merge. Before-leg numbers are anchored to `65fef6d7e`; any shift on rebase
  is the coordinator's to report, not silently re-run here.
- Lever from: sim-findings.md #1841 (Loop A sim-grind-a, evidence/2026-11-06/sim-grind-a.md)
  + #1829; the adopt arm's named next step (evidence/2026-11-07/sim-finishersize-adopt-a.md,
  "Metric review").

## Premise correction (recorded before any judged computation in this run)

The COMMITTED field finish named in #1841 is ALREADY BUILT and landed:
commit `8a4ce0eab` (sim-finishersize-a, 2026-11-06) is an ancestor of this
branch's base. It was proven 89/89 at engine level and adopted by
sim-finishersize-adopt-a (2026-11-07). Two bands then judged its wild field
effect DIAG: pilot 99661–99668 (2 below-break meetings, 0 addressable) and
adopt band 99421–99436 (0 below-break meetings, 0 addressable) — combined
24 seeds, 186 wave-4 field fights, 2 below-break meetings, 0 addressable
meetings. This arm does NOT rebuild it. It does the adopt arm's named next
step instead: build the constructed wall-delivery instrument that puts
softened beasts in front of field fighters on purpose, and judge the
committed finish on the addressable-window conversion rate through the real
engine — plus a verification leg of the landed finish on the grind band
below. Any game-code gap the instrument finds is named as a next build with
numbers, not built hastily in this run.

## Pool arithmetic (computed from PRE-EXISTING corpora before any judged computation here)

Grind band corpus, evidence/2026-11-06/perseed-grind-a/ (128 wave-4 field fights):

| Pool | Count |
|---|---|
| Field wave-4 fights | 128 |
| Field wave-4 kills (all) | 1 (contact finish, 1-HP wall-delivered audit) |
| Entry HP ≤ 125 (finishable tail at entry) | 1 (the 1-HP audit) |
| Exit HP ≤ 125 | 1 (same fight) |
| Exit HP ≤ 250 | 3 |
| Crossed the break line during the fight (entry ≥ 15%, exit < 15%, alive) | **0** |
| Entry frac 15–25% | **0** |
| Below-break meetings (contact finish attempted) | 1, killed by the contact strike itself |
| Volley-softened below-break meetings, FS pilot + adopt corpora (372 w4 field fights) | **0** |

Consequences, all pre-registered:
- The task's suggested wild GO (≥3 field wave-4 kills on the 8-seed band vs
  the 1/128 baseline) is METRIC-BROKEN on this band (§14a): the only
  meeting on the band that was ever inside the finish window already
  converts under the old code (contact strike kill), so the ceiling for ANY
  finish-shaped lever on this band is +0. It is not re-scored, not
  re-attempted with a friendlier bar, and not claimed as a lever failure.
- Every finish-shaped extension is pool-empty in the wild at this scale:
  met-below-break ~1/128 meetings, volley-softened 0/372, driven-crossing
  0/128. The driven-crossing shape (fighter drives the beast below its
  break line mid-fight, then holds it) is measured by construction in this
  run and named as a candidate next build ONLY if construction shows a
  convertible pool the wild hides; it is not built here (it is a mid-fight
  hold with real fighter-risk tradeoff, not a finish, and needs its own
  sizing + prereg).
- The volley-softened shape is likewise measured by construction: at FS
  sizing (post-contact HP ≤ 3× contact strike) a bow-only fighter's
  contact strike is ~4–8, so the volley would have to deliver the beast to
  ~≤24 HP — the construction leg tests whether any observed volley shape
  can do that, rather than assuming it.

## Primary metric (binds this run, §14)

**Addressable-window conversion rate on CONSTRUCTED meetings.**
Addressable (A): a wave-4+ below-break contact meeting — met-below-break
(entry frac < 15%) OR volley-softened (pre-volley frac ≥ 15%, post-volley
frac < 15%) — whose contact strike did not kill, with post-contact HP
strictly greater than the contact strike, intent `engage`, fighter entry
HP ≥ 60%. Convertible (C): A with post-contact HP ≤ 3× the contact
strike. Primary: FS committed kills / |A|.
- GO: conversion rate ≥ 0.50, with every C meeting firing a commit.
- DIAG if |A| = 0 after construction (same bar as adopt-a).
- Construction: harvest observed shapes from the grind (99641–99648), FS
  pilot (99661–99668) and FS adopt (99421–99436) corpora (real meetings:
  1-HP audit, 34-HP strike, 17-HP eulogy, 144-HP near-miss, 246/212-HP
  near-tail exits), then synthesize shapes spanning the observed parameter
  ranges (meetHp, volley damage from the real volley distribution, contact
  strikes from lroll([4+wb, 8+wb]), fighter HP, intent) and re-drive each
  through the REAL `Game.fieldFight` on seeded streams (same harness as
  scripts/test-finishersize-20261106.js, seed 87104 family). No table rolls,
  no stubbed fights. The instrument is scripts/vetfinish-instrument-20261109.js;
  its proof is scripts/test-vetfinish-b.js.
- The wild band leg below is the GUARD + wall-number report, not the judge:
  field wave-4 kills must not drop vs grind-a (1), field-fighter deaths
  (vDie) must not rise vs grind-a (10), TB wave-4 kills and the wall numbers
  are reported both legs.

## Wild verification leg (the task's before/after on identical seeds)

- Band: **99641–99648 RE-USED** — the grind-a measured band. NOT fresh and
  never claimed fresh: prior naming sim-grind-a, evidence/2026-11-06/sim-grind-a.md.
  Re-use is justified because this IS this lever's measured band.
- Policy: competent, verbatim (scripts/policies/competent.js).
- Horizon: 150d, death-aware (same as grind-a: 7/8 villages died before
  150d; dead villages stop simulating, +10d tail max). Why 150d: it is the
  band's measured horizon and the window in which the grind band's chains
  play out (audit chain d56–106, eulogy d61–66).
- Legs: before-leg on current master (this branch base, FS landed) via the
  FS instrument/driver (scripts/finishersize-driver-20261106.js,
  OUTDIR evidence/2026-11-09/perseed-vetfinish-b, RUN vetfinish-before);
  after-leg (RUN vetfinish-after) as a NEUTRALITY leg — this arm makes zero
  src/js changes, so the legs must be byte-identical except anchor; any
  difference is an investigation item, not a lever effect.
- No confirm leg: the pilot GO is on the constructed conversion rate, not
  the wild band; doubling the wild band doubles the zeros (finishersize-a
  precedent).

## Guards (all hold)

- No readyDemand, win-price, deed-gate, or gate change of any kind.
- No rounds-cap change (MAX_ROUNDS = 15 untouched), no armor-ignoring hits.
- No Eulogy counter-dismissal change; no mBreak change.
- Zero src/js changes expected in this arm (instrument + proof test +
  evidence + corpora only). The FS lever's game code is already landed.
- Wall numbers reported every leg (national / table / wins, wave 4–5
  unlocks, median survival).

## Balanced panel (§15) and telemetry

- scripts/balance-panel.js runs its own full panel and takes no corpus
  input — it cannot compare a single-leg verification on identical seeds
  (same precedent as grind-a, finishersize-a, adopt-a). No compare .md is
  fabricated; the pre-registered primary comparison is the identical-seed
  FS corpus + the constructed conversion rate, whose wall numbers are
  reported in the evidence.
- Telemetry deviation check (scripts/telemetry-check.js, baseline
  .../telemetry-baselines/scale-wall.json, metrics national,table,wins,exiled)
  is attempted on the per-seed corpus; the recorder-corpus refusal recorded
  by grind-a/finishersize-a is the expected outcome and is recorded as the
  result, not worked around.

## Metric review (to fill in the evidence)

- The wild ≥3-kills bar: METRIC-BROKEN on this band (ceiling +0, see pool
  arithmetic above). The corrected judge is the constructed addressable-window
  conversion rate (adopt-a's correction, extended here to volley-softened
  and driven-crossing shapes).
- If |A| = 0 after construction, the question closes as engine-proven /
  field-unmeasurable and #1841 moves to fixed-by-construction; the veterans
  bar must then be attacked elsewhere (party damage / TB relay — other arms'
  territory, named not built here).
