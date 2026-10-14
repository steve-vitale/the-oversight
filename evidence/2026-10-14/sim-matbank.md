# sim-matbank 2026-10-14 — ARM (materials-banking), food-economy axis, POLICY-SIDE

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — binding)
- **Question:** sim-findings #81 — the blind-craft gate question dissolves into
  a materials question. The KILLED snaregate arm's 2+2 softened gate fired ZERO
  times on 7/8 pilot seeds: the scholar's pack never co-banks vine>=2 &&
  stick>=2 (vine banks thinly, stick burns on knives/tools). If the blind craft
  is to matter, a future arm needs MATERIALS-BANKING behavior (deliberate
  vine+stick stockpiling), not a lower gate number. This arm is that behavior.
- **Arm:** scripts/policies/matbank.js — opt-in layer (MATBANK=1, default OFF),
  hooked into competent.js (competent-family policies only):
  (1) SNARE RESERVE: discretionary vine/stick recipe burns (arrow: stick 2,
  bark_armor: vine 2) may spend only the surplus above vine>=2 && stick>=2 —
  the craft goes ahead iff the pack still holds 2+2 after the spend;
  (2) KNIFE PRIORITY: stone_knife knapping at every policy site (keepKnife,
  cleanCatch, armUp) is never gated — the knife is the scholar's daily
  survival tool, the snare is the investment; the snare craft itself is never
  gated (the reserve exists for it);
  (3) COLLECT BEFORE BURNING: below the reserve (snare L1+), the forage trip
  prefers vine-rich ground (thickets/groves), extending the knife's existing
  vine preference to the trapline's pull.
  ENGINE CORRECTION (pre-registered as a finding, not an assumption): the arm
  brief said "only spend vine/stick on fires/tools when above a snare reserve"
  — engine fires burn branch/wood/fusion fuel ONLY (game.js fireFuel/feedFuel),
  never vine/stick. The real discretionary burns are arrow + bark_armor.
  Policy-side ONLY — zero game-code edits.
- **Primary metric (1):** seeds where the scholar's pack held vine>=2 &&
  stick>=2 simultaneously on >=1 day. **GO:** >= 4/8 seeds (either policy).
- **Primary metric (2):** blind snare crafts (snare crafts at codex snare
  level 1). **GO:** armed >= 2x baseline AND armed >= 4 absolute (floor against
  the zero-baseline softness flagged in sim-snaregate's metric review).
- **Guardrails:** fires still get lit (armed firesLit >= baseline firesLit);
  knife knapping unblocked (armed stone_knife crafts >= baseline); median
  survival no worse than -10d vs baseline.
- **KILL:** a miss on (1), (2), or any guardrail -> delete the layer + revert
  the competent.js hooks before commit, keep only the evidence (killed arms
  leave no trace).
- **Horizon:** 150d death-aware (Game.over stops the run; dead villages stop
  simulating — no fixed tail). **Seeds:** 11, 22, 33, 44, 55, 66, 77, 88 ×
  competent, belongseek (16 runs/side, IDENTICAL seeds baseline vs armed).
- **Sides:** baseline = MATBANK unset (default OFF); armed = MATBANK=1. Code
  identical otherwise, same commit.
- **Convergence:** converging -> 12-16 seed confirm if GO met;
  killed-at-pilot otherwise.
- **Canon:** docs/CANON.md (standing rules). No canon doc covers trap-material
  banking specifically — the behavior is a player-behavior blank (a competent
  trapper banks cordage), not a system redesign; recipes and the vine race are
  engine canon (recipes.json, keepKnife's knap-first logic).

## Proof — scripts/test-matbank-20261014.js (RED baseline -> GREEN armed)
RED (MATBANK off): the blank, demonstrated — arrow crafted at stick=2 burns
2->0; bark_armor crafted at vine=2 burns 2->0; no collection signal; a tied
meadow-vs-thicket trip takes the meadow. 6/6.
GREEN (MATBANK=1): 12/12 —
- arrow NOT crafted at stick=2 (reserve holds); crafted at vine=2/stick=4
  (surplus spent, stick 4->2, vine intact at 2);
- bark_armor NOT crafted at vine=2/stick=2; crafted at vine=4/stick=2
  (vine 4->2, reserve intact);
- knife knapping fires at stone=1/vine=1 even below the reserve (priority);
- snare craft at 3+3 still attempted (the reserve exists for it);
- collection signal: true below reserve at snare L1, false at reserve met,
  false at snare L0; a tied trip steers for the thicket.
Method: node harness, full src/js list in index.html order (minus DOM-only
app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js), Math.random seeded
BEFORE eval, Game.save never stubbed. Gate-off path draws no RNG and touches
no state — baseline byte-identical.

## Pilot — scripts/matbank-pilot-20261014.js (16 runs/side, identical seeds)

| side | national | table | wins | exiled | maxWave | crafts | blind | snareAtt | sets | coBank seeds | knives | arrows | bark | fires | fireDays | medianSurv | pdeaths (cause: n) |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| baseline (off) | 3 | 0 | 0 | 0 | 3 | 26 | 3 | 27 | 35 | 66, 88 (2/8) | 6 | 0 | 0 | 0 | 1167 | 63d | combat 25, starvation 6, expedition 2, contest 2, sickness 1 |
| armed (MATBANK=1) | 2 | 0 | 0 | 0 | 4 | 3 | 1 | 4 | 13 | 11, 88 (2/8) | 4 | 0 | 0 | 0 | 1378 | 98.5d | combat 27, starvation 7, contest 2, expedition 1, lockjaw 1 |

Per-seed (base | armed — surv, crafts, blind, coBank, vineMax/stickMax, snareL):
11/C 47d 0/0/0 v4s0 L1 | 44d 0/0/1 v4s2 L1 · 11/B 35d 0/0/0 v4s0 L1 | 37d 0/0/1 v2s2 L1
22/C 38d 0/0/0 v0s3 L1 | 123d 0/0/0 v1s4 L1 · 22/B 69d 0/0/0 v0s8 L1 | 87d 0/0/0 v2s6 L1
33/C 41d 0/0/0 v11s0 L1 | 41d 0/0/0 v11s0 L1 · 33/B 41d 0/0/0 v7s0 L1 | 41d 0/0/0 v7s0 L1 (byte-identical — arm never fired)
44/C 113d 0/0/0 v4s0 L0 | 113d 0/0/0 v4s0 L0 · 44/B 152d 0/0/0 v9s0 L0 | 152d 0/0/0 v9s0 L0 (byte-identical)
55/C 138d 0/0/0 v8s3 L1 | 96d 0/0/0 v4s7 L1 · 55/B 115d 0/0/0 v5s1 L1 | 101d 0/0/0 v4s1 L1
66/C 32d 0/0/0 v2s3 L1 | 126d 0/0/0 v0s18 L1 · 66/B 44d 6/1/1 v3s3 L2 | 111d 0/0/0 v0s11 L1
77/C 103d 0/0/0 v6s0 L0 | 103d 0/0/0 v6s0 L0 · 77/B 135d 0/0/0 v11s1 L0 | 135d 0/0/0 v11s1 L0 (byte-identical)
88/C 72d 11/1/1 v8s2 L2 | 51d 3/1/1 v2s3 L2 · 88/B 57d 9/1/1 v6s2 L2 | 57d 0/0/0 v2s12 L1

## Verdict: KILLED at pilot

- Primary (1): co-banked seeds 2/8 -> 2/8 (need >= 4/8). MISS. The arm moved
  co-banking from seed 66 to seed 11 but did not increase the count.
- Primary (2): blind snare crafts 3 -> 1 (need >= 2x baseline = 6 AND >= 4
  absolute). MISS. Total crafts 26 -> 3.
- Guardrails: firesLit 0 = 0 (parity holds — the policy never lights fires;
  fireDays 1167 -> 1378, haven hearths, no regression); stone_knife crafts
  6 -> 4 — MISS against the pre-registered >= bar (see metric review);
  median survival 63d -> 98.5d (inside the -10d gate).
- Per the binding pre-registration, a miss on a primary is KILL: the layer
  (scripts/policies/matbank.js + the hooks in competent.js) was DELETED and
  competent.js reverted to HEAD — killed arms leave no trace. Committed
  evidence-only: this file, the two pilot JSONs, the proof script, the pilot
  script, the transcript probe.

## Why it died (mechanism, not just numbers)

The reserve was keyed to the wrong band. The layer banks to exactly 2+2 —
the dead snaregate arm's 2+2 softened band — and the collection preference
shuts off AT the reserve line (snareReserveWanted false once 2+2 is held).
But the LIVE blind gate is 3+3 (workTrapline: `level >= 2 ? 1+1 : 3+3`).
The arm parks the pack one short of the craft threshold on each half: armed
seed 11 co-banked at exactly v2s2/v4s2 and never pushed to 3+3; armed 88/B
banked twelve sticks with vine pinned at 2.

The baseline's crafts came from UNDIRECTED drift: seeds 66 and 88 drifted to
3+3, a 35% blind success reached L2, and the reliable 1+1 band then drove 20
of the 26 crafts. The arm didn't increase 3+3 reachability — it can't, by
construction: nothing in the layer pulls past 2+2, because the preference was
written against the reserve, not the craft threshold.

Secondary mechanism: the burn-gate half of the layer is provably correct
(proof 12/12) but empirically inert — baseline arrowCrafts = 0 and
barkArmorCrafts = 0 across all 16 runs, so there was nothing to block. The
only live mechanism was the thicket preference, and it was aimed one short.

Where the layer never fired (seeds 33/44/77: snare L0 or no burns), armed
trajectories are byte-identical to baseline — the inert checks draw no RNG
and touch no state, as designed.

## Metric review

§14: judged against the header exactly as written — no re-scoring. Two notes
for the NEXT run, not this one:

1. The knife guardrail (4 vs 6) is recorded as a miss, but the mechanism is
   proven unblockable: keepKnife/cleanCatch/armUp contain no gate (proof:
   knife knapping fires with MATBANK=1), and the counts are tiny-number
   trajectory noise after divergence (seed 55: baseline knapped on a 138d run,
   armed on a 96d run). A future run should pre-register the knife guardrail
   as "no systematic block" (proof-level) rather than a raw count >= bar.
2. Primary (1) measured the mechanism (2+2 held) while primary (2) measured
   the outcome (crafts) — the two-conjunct design worked as intended: (1)
   showed the banking fires, (2) showed 2+2 doesn't buy crafts. The GO band
   itself was the bug: it should have been keyed to the 3+3 blind threshold,
   not the 2+2 reserve. A future arm keys the banking target (and the
   preference shutoff) to the craft threshold, not the reserve.

## Village assessment / blanks

- **Blank documented (refines sim-findings #81):** materials-banking to 2+2
  is not enough — the live L1 blind gate is 3+3, and a reserve keyed to 2+2
  parks the pack one short. The prescription for the next arm: bank to (and
  keep the collection pull active until) the CRAFT threshold (3+3 blind,
  then 1+1 at L2), not a fixed 2+2. -> hidden_files/sim-findings.md (update).
- **Corroborated:** the wire bypass remains the honest early trapline
  (snaremat); the craft line is an L2 luxury reached via a 35% blind success
  at 3+3. Vine is the binding half everywhere (armed stickMax hit 18 with
  vineMax 0 on 66/C — sticks bank, vine doesn't).
- **Corroborated, not chased:** combat remains the player-killer (25-27 of
  ~36 player deaths); starvation 6-7. Median survival rose 63d -> 98.5d on the
  armed side — trajectory noise from early destination divergence (seed 22:
  38d -> 123d; seed 66: 32d -> 126d), not an arm effect to claim.
- **Wall numbers:** national 3 -> 2, table 0, wins 0, exiled 0; max wave
  reach 3 -> 4 (one armed run touched wave 4). No wall movement attributable
  to the arm.

## Sense read

Armed seed 11, 40d transcript (scripts/matbank-transcript-20261014.js):
d7 "You also take some vine (crafting material)."; d13–15 three consecutive
"Travel N tiles to thicket." with thicket flavor ("Thick brush — Thorns and
tangle. Things live in here that don't want to be seen."); d14 "A sturdy stick
(crafting material)."; end pack vinex1 ×4 — banked, nothing spent it (below
reserve, the discretionary burns stayed holstered). Baseline seed 11 same
window: vine gathered d7, end pack vinex1 ×2, no thicket trips. The banking
beats read as a person deciding — heading for the thickets because the
trapline needs cordage, holding what they gather — not a counter hoarding.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-10-14/matbank-pilot-*.json'
--metrics flat.national,flat.table,flat.wins,flat.exiled`:

`LOUD: flat.national newly appeared: baseline 0 -> current 5 (n=2 files)`
VERDICT: explained, not a bug — same spurious class as sim-snaregate. The
scale-wall.json baseline is seeded from a different measurement context
(different seeds/policies). Both of THIS arm's sides are 3 (baseline) and 2
(armed) — no arm-attributable movement. Baseline NOT rolled forward.
