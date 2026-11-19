# sim-rage-setup-a — evidence (finding #2568)

**Arm:** sim-rage-setup-a · **Loop A run:** fleshout-20261119T0115Z
**Axis:** scale-onramp · **Finding:** #2568 (setup-turn survival — follow-up
to sim-fieldcarrier-confirm-a, finding #2552)
**Prereg:** `evidence/2026-11-18/sim-rage-setup-a-prereg.md` (frozen
2026-11-18 ~19:45 CST, before any sims; Correction 1 pre-sim: mechanism
check (c) redefined from total mDealt to damage/round).
**Branch:** `sim-rage-setup-a` (base master `be0b90b41`).
**Verdict: NO-GO — pool met, kill-share bars missed, no confirm spent.**

## What was tested

The Rage branch sets `nextMult = 2; nextN = 3` and returns `consumed = true`
WITHOUT striking — the fighter spends round one going red instead of
striking. Finding #2568 asked whether surviving the setup is the binding
cost, and froze the direction: test an HP/armor floor on firing, OR Rage
as a free action that strikes the same round — NOT a bigger multiplier.

**Shape picked: Rage as a free action that strikes the same round**
(env-gated `RAGEFREE=1`, off = old behavior exactly). In `godpath.js`
`fieldAct`'s Rage branch, after setting `nextMult = 2; nextN = 3` and
paying the honest 60 kcal, return `out.consumed = false` instead of
`consumed = true` — the caller (`fieldFights.js`) runs its normal strike
in the same round, and `fieldStrike` consumes the first of the 3 doubled
strikes on that round. Multiplier ×2 for 3 strikes, 60-kcal pay,
monster-HP-above-40% gate, once-per-fight use — all unchanged. Applies
branch-wide (carrier fires AND real-Rage holders alike). The TB carrier
(`game.js`) is untouched. The HP/armor floor remains the untested other
shape for a future arm, judged against this result.

**Legs (both run the carrier — differ ONLY by RAGEFREE):**
- **ctl:** substrate + `FIELDCAPDMG=1`, `RAGEFREE` unset — the consuming
  carrier (fieldcarrier-confirm-a behavior, re-measured on this band).
- **arm:** substrate + `FIELDCAPDMG=1` + `RAGEFREE=1` — the free-action
  carrier.
- **Substrate, both legs:** `VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1
  + FIGHTALLY2=1 + WILDAVOID=1 + LAUNCHPARTY=1` (competent policy, 150d
  death-aware). The held launchparty-sense substrate is cherry-picked as
  measurement substrate only (`480168a58` → `d0c2ed7e4`), NEVER to land;
  the carrier is cherry-picked as the lever under test (`e3a77c411` →
  `9f8f108a4`); tooling `bceb0e433` → `0757a9c29`; confirm-a adaptation
  `9dd183c4b` → `20f4b316e`. `WILDSEEDPLAN` verified INERT on master
  (no code reads it) and NOT set on either leg.

**Proofs green (before any sim):** `scripts/test-fieldcarrier-a.js`
**57/57** (incl. new §1h: with `RAGEFREE=1` the Rage round returns
`consumed = false` and the same-round strike is doubled, live staged
fight, determinism under flag, real-Rage branch-wide; §1g unchanged),
analyzer `--selftest` **23/23**, instrument test **10/10** (seed 106001
arm leg). Regressions green: abilityfirst 43/43, ability-gaps 16/16,
godpath-villagers 58/58, aidleave ALL PASS, fightcap analyzer 20/20,
dmg analyzer 10/10. (`check.js --quick` was started during the run but
killed after ~7 min with no output — NOT run to completion; recorded
gap, re-run at adoption closeout.)

## Pilot (fresh band 106001–106008, 8 seeds, 150d, competent policy)

Both legs exit 0. Ctl ~14.5 min, arm ~25.4 min. Analysis:
`evidence/2026-11-18/rage-setup-a-analysis.json`. Corpora:
`evidence/2026-11-18/perseed-rage-setup-a-{ctl,arm}/` (8 files each).

| Bar (frozen) | Ctl | Arm | Pass? |
|---|---|---|---|---|
| Pool floor (arm pair n ≥ 10) | 22 | **13** | YES |
| Kill share (pair-inclusive, bar arm ≥ 0.25) | 0.000 (0/22) | **0.000 (0/13)** | NO |
| Kill-share ratio (ctl 0 → arm kills > 0) | — | 0 kills | NO |
| Community loss (arm ≤ ctl + 0.125) | 3/8 | 4/8 | YES (exactly at bar) |
| Starvation (arm ≤ ctl + 2, totals + villager) | 8 / 8 | 8 / 8 | YES |
| Median survival (arm ≥ 0.8 × ctl) | 150d | 148.5d | YES |
| Instrument errors (bar 0) | 0 | 0 | YES |
| Carrier fires in judged population (bar > 0 both) | 12 | 8 | YES |
| Paired damage rate (arm ≥ ctl on ≥ 2/3 of pairs) | — | 2/2 | YES |

**Verdict ladder (frozen):** pool met + kill-share bars missed → **NO-GO**.
No confirm spent (confirm band 106011–106026 stays fresh and unspent).

## The numbers behind the verdict

**Funnel (pair-inclusive engaged):** ctl 46 encounters → 2 no-plan, 4
party-absent, 18 evades → 22 engaged; arm 26 encounters → 2 no-plan, 0
absent, 11 evades → 13 engaged. Evades are the largest funnel loss
(finding #2569 holds); arm-side trajectory divergence again halves the
pool (26 vs 46 encounters).

**Outcomes (pair-inclusive):** ctl 22 — 18 vFlee, 3 vDie, 1 mFlee, 1 win
(monster fled), 0 kills; arm 13 — 10 vFlee, 2 vDie, 1 mFlee, 1 win, 0
kills. Trio-only cut: ctl 10 (8 vFlee, 1 vDie, 1 mFlee), arm 6 (6
vFlee); kill share 0 both, win share 0.10 ctl / 0 arm.

**Paired fired meetings (same seed/day/vid/mid, carrier fired both
legs):** 2 — Sergio d95 vs Influencer 172→210 dmg (+38, both vFlee 4
rounds; R1 strike 50 at ×2.0 on the arm leg — the mechanism working
exactly as designed); Ruby d139 vs Algorithm 216→238 (+22, both vFlee
6 rounds). One further paired meeting, Devon d127, is identical 23/23
with no fire on either leg.

**Damage race:** vFlee damage/round ctl **35.9** vs arm **38.5** — the
free action raises the rate, but both sit far below the ~111/round
winning shape (fightcap-a); fights still end in flight at ~4–6 rounds
with the monster at ~70–85% HP. Pair-inclusive damage share ctl 0.164
vs arm 0.144 (fights end a round earlier on the arm leg, so the share
falls even as the rate rises — the confound Correction 1 warned about).

**Non-fires (tier/hunger attribution):** ctl tier-gate 4 / neither 6;
arm tier-gate 5 / neither 4; hunger-gate 0 both; undetermined 0.

**Wall numbers:** national 0/8 both; table null (not instrumented, never
faked); wins 0/8 both; wave-4 unlock 8/8 both; wave-5 ctl 6/8, arm 5/8;
median survival 150d ctl, 148.5d arm. Total deaths ctl 685, arm 651.

## §15 balanced panel (the instrument, not the judge)

`scripts/build-rage-setup-panels-a.js` + `node scripts/balance-panel.js
compare` → `evidence/2026-11-18/rage-setup-a-panel.md`:
**Decision: review_required.** 8 paired cases, screen only. Wins 0/0,
national 0/0, village deaths −4.25 (no material signal). One
**regression_watch: community loss 0.375 → 0.5 (+0.125)** — exactly at
the frozen cost bar (4/8 vs 3/8), so the frozen verdict stands, but the
panel flags the same +1 village loss as a watch. No material signal
elsewhere. The panel does not change the frozen-bars verdict.

## Sense-testing (fight transcripts read in full)

- **Heinrich d53 (arm, Reunion, carrier-fired, vDie in 2 rounds) —
  VERIFIED from the corpus.** R1: Rage fires, then the peacemaker
  turn-verb fires instead of the free strike — "Heinrich walks in
  open-handed — and it goes wrong. It doesn't want peace. They're
  exposed, off-balance. (Walk In — failed)". R2 he strikes once doubled
  (35) while exposed, then dies. **The free action's benefit is
  conditional on no higher-priority turn verb firing that round** — a new
  interaction, filed as a finding (see below).
- **Moshe d38 (ctl, Suburb, real-Rage holder, vDie in 4 rounds) —
  VERIFIED.** R1: his eyes go red (Rage) and he does NOT strike — the
  setup turn costs him his R1 strike, exactly the mechanism this arm
  tests. R2 binds a wound, R3/R4 strike doubled (23 ×2.6, 20 ×2.5),
  dies R4 with the monster at 1286/1379 HP (93%).
- **Moshe d38 arm counterpart — VERIFIED ABSENT.** No day-38 encounter
  for gen_gtjd735 exists on the arm leg: the trajectory diverged, so no
  paired-death conversion exists on this band. Same for Somchai d140
  (ctl carrier-fired death, died R4) — no arm counterpart.
- **Third ctl vDie, Ruby d88 (ctl, Reunion, judged population, vDie in
  7 rounds) — VERIFIED.** Ruby works the trick honestly (Novelty poem
  R4, "holds the line" beats), calls for help, dies R6 with the monster
  at 1344/1395 HP. The trick fires; the damage doesn't follow.
- **gen_arcfvpg d47 (arm, Algorithm, carrier-fired, vFlee, 631 dealt
  in 7 rounds) — VERIFIED.** R1: "Scott's eyes go red. Next 3 strikes
  hit twice as hard. (Rage)" followed immediately by "Scott strikes for
  73 (×2.5)" — the free action working exactly as designed, R3/R4
  doubled strikes 68/68 with allies joining. The party still flees with
  the monster at 768/1041 HP (74%).

**Reading:** the mechanism works — the Rage round strikes doubled, and
the paired damage rate rises — but the flee is the wall, not the setup
turn. Zero kills on either leg, and the two paired fired meetings both
end in flight at the same round count as control.

## Findings filed

- Peacemaker interaction (Heinrich d53): the free-action Rage round can
  be pre-empted by a higher-priority turn verb (failed Walk In) — filed
  in `hidden_files/sim-findings.md`.
- Evade funnel (finding #2569 holds): evades are the largest funnel loss
  on both legs (18 ctl / 11 arm of 46 / 26 encounters).

## Metric review

- The frozen bars judged correctly: pool met, kill share missed, costs
  held — NO-GO is the honest verdict, not a measurement failure.
- The §15 panel's regression_watch (community loss +0.125) sits exactly
  on the frozen cost bar; the bar as written (≤ ctl + 0.125) passes it,
  but the panel's watch says the next arm should treat +1 village loss
  as a real cost signal, not a rounding artifact.
- The confirm band stays fresh. The HP/armor floor shape from #2568
  remains untested and is the next shape to try — but this arm's result
  says the setup turn was not the binding cost, so a floor that merely
  delays firing is unlikely to convert kills either; the flee is the
  wall. A future arm should measure the flee decision itself before
  spending another lever on the Rage round.
- Telemetry deviation check: the scale-wall baseline
  (`hidden_files/telemetry-baselines/scale-wall.json`) exists in the goal
  workspace; the deviation check is run at round closeout (see the round
  evidence file), not per arm.

## What lands / what is held

- **HELD, do not merge:** the `RAGEFREE` change (`6198f7ea3`,
  [needs-eyes]), the sense substrate cherry-pick (`d0c2ed7e4`), the
  carrier cherry-pick (`9f8f108a4`), and the driver/analyzer/panel
  adaptations (`0757a9c29`, `20f4b316e`) — all stay on branch
  `sim-rage-setup-a`.
- **Lands (evidence only):** prereg `8da4e7a19`, corpora + analysis +
  logs + panel outputs + this file (see the round evidence file).
