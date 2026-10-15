# SIM-TRIBSTREAK — tribute-timing revival: hungryStreak-gated early tribute pull-forward (loop B, food-economy)

Date: 2026-10-15 · Loop: oversight-flesh-out-loop-b · Run: fleshout-b-20261015T021443Z · ARM 1 of 2
Worker tree: sim-tribstreak · Axis: food-economy (scale-wall lens) — tribute discipline.
Claims sim-findings #257 (open, loop B sim-tribhealth-b kill finding, evidence/2026-10-15/sim-tribhealth-b.md):
the tribhealth village-health gate (v.hungryDays pantry-empty streak + trailing starvation-death
telemetry) NEVER fired in 16 runs — the pantry streak resets on fed days while individuals starve.
The named revival gates on progState().hungryStreak (the engine's own individual-hunger signal;
>=3 = hunger-winter crisis threshold) instead.

## Pre-registration (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE any sims)

- PRIMARY (BELONG road only — tribute-timing is belong-only by construction; the lead road has
  ~no Haven-subordinate tribute volume): armed tribute arrears notes <= control x 0.6 AND armed
  (missed+thin) weeks <= control x 0.65 (identical seeds).
- Control numbers are the tribhealth kill's BELONG-road split (8 seeds x belongseek, 180d,
  courtship road, NO feast substrate): arrears 19, missed+thin 31, starvation 1, national 6/8,
  median 146d. GO bars: arrears <= 11, missed+thin <= 20.
  (Bar calibration: tribhealth-armed on belong delivered 0.47x/0.61x with a VACUOUS village
  gate; this arm's real village gate only holds during genuine crisis stretches (streak>=3),
  which the tribhealth sweep showed are rare — the mechanism should deliver comparable
  discipline on non-crisis days, with slack for the conservative holds.)
- GUARDRAILS (harm-specific, median report-only per #224): starvation <= control+2;
  hungryDays <= control x 1.1; national >= control-2/8; no new death mode (n>=3 per #216).
- Pilot: 8 seeds (11/22/33/44/55/66/77/88) x belongseek (judged) + leadcourt (coverage only),
  180d death-aware, identical seeds control vs armed. Control RE-MEASURED on current tip
  in THIS sweep (#247 — never inherit a baseline from a prior run's evidence).
- SMOKE=1 instrument-honesty gate both sides; det-gate 16/16 both modes (off-vs-base AND
  armed determinism); proof scripts/test-tribstreak-20261015.js RED->GREEN before the sweep.
  Confirm 12-16 seeds ONLY on GO per §9.
- GO on primary + all guardrails -> land as its own commit; primary miss or guardrail
  breach -> KILL per §14 (layer deleted, evidence + proof + sweep + det-gate + sense kept).

## The arm

The tribhealth kill's two load-bearing lessons (evidence/2026-10-15/sim-tribhealth-b.md):
1. The implemented village-health signal was the wrong instrument — it never fired.
2. Tribute-timing is belong-only by construction (0 full tribute weeks on 6/8 leadcourt
   control seeds); pre-register on the belong road's own control numbers.

This arm reuses the proven tribhealth pieces verbatim and swaps the one wrong instrument:
- (1) PANTRY (inherited): pantryFreshDays() >= 4 AND pantry kcal >= the week's tribute.
- (2) VILLAGE (new): progState().hungryStreak <= 2 — >= 3 is the hunger-winter crisis
  threshold (game.js villageEats: `pg.hungryStreak = anyStarving ? pg.hungryStreak+1 : 0`,
  fired by ACTUAL individual intake < 60% of need, not pantry emptiness). A starving
  village holds, no matter what the pantry reads. Unreadable signal -> hold (fail safe).
- (3) LINK (inherited): age >= 14d (canon seasoned-bond bar, docs/SCALE.md), trust >= 30
  (the 68-holds link-stability gate from tribhealth).
- The beat names the PRE-payment pantry depth + the actual hungryStreak number that
  justified it (the sense note's ask); said only after Game.payTribute confirms.

scripts/policies/tribstreak.js (TRIBSTREAK=1, default OFF; zero src/js changes):
tribute verb only, wrapping belongseek + leadcourt. Each day, BEFORE the parent policy's
daily (so the early pay lands ahead of the base discipline's own tribute step):
- gate off -> verb never called: wrapper is pure delegation (byte-identical to parent).
- no active Haven-subordinate link -> nothing.
- week already current (tributePaidWeek === week) -> nothing.
- any gate fails -> silent hold counted by gate (tsHoldPantry/tsHoldVillage/tsHoldLink);
  the base discipline's own step still runs after.
- all pass -> pay the week's tribute early-in-full via Game.payTribute(link.id) (the
  engine's own verb; idempotent per-week, so the base discipline cannot double-pay),
  recorded as tsEarly with real kcal; the beat names the pre-payment depth + streak.

No feast-gating changes, no aid changes; tribute verb only.

Canon read: docs/CANON.md, docs/SCALE.md (trust math + seasoned-bond age),
docs/PRESERVATION.md (the fresh-days ladder). The #257 steve-call answer is the arm itself.

Horizon: 180d death-aware (scale-wall reachability question, pacing-law max).

## Proof results (run BEFORE any sims)

RED (TRIBSTREAK unset): R1 verb 'off', ctx untouched, gateOn() false; R2 belong wrapper
daily byte-identical to belongseek.daily; R3 lead wrapper daily byte-identical to
leadcourt.daily. 6/6 on seeds 11/22/33.
GREEN (TRIBSTREAK=1): G1 fragile fixture (~3.75 fresh-days) — verdict 'held',
tsHoldPantry=1, SILENT, base discipline still pays the week on its own timing; G2 crisis
streak 4 — hold-village, no early pay; G2b hungryDays=0 + streak 4 — hold-village (THE
DIVERGENCE: the killed tribhealth gate would have paid here; the engine's signal says
crisis); G3 transient link (age 3d) — hold-link; G4 healthy + eating + seasoned (age 20d,
trust 50) — 'early', full week paid via engine verb, beat names the PRE-payment depth +
the actual streak number, base discipline does NOT double-pay; G5 streak-2 pays / streak-3
holds (the crisis line, exactly); G6 deterministic rerun. 15/15 on seeds 11/22/33.
Det-gate: 16/16 bit-identical off-vs-base AND 16/16 armed determinism (8 seeds x 2 roads,
40d, per-day hashes). SMOKE=1 honesty gate green both sides.
scripts/test-tribstreak-20261015.js, scripts/det-gate-tribstreak-20261015.js.

## Pilot results

8 seeds/side (11/22/33/44/55/66/77/88) x leadcourt (coverage) + belongseek (judged),
180d death-aware, identical seeds. Control RE-MEASURED on this tip (#247). Det-gate GREEN
both modes before trusting comparisons; SMOKE=1 honesty gate green both sides.

| metric (BELONG road, judged) | control (TRIBSTREAK unset) | armed (TRIBSTREAK=1) | pre-reg bar |
|---|---|---|---|
| arrears notes (**PRIMARY**) | 14 | **13** | **MISS** (<= 8 = 0.6x ctrl; calibration <= 11 also missed) |
| (missed+thin) weeks (**PRIMARY**) | 25 | **22** | **MISS** (<= 16 = 0.65x ctrl; calibration <= 20 also missed) |
| tribute weeks full/thin/missed | 81f/0t/25m | 78f/1t/21m | report |
| early kcal moved | — | 54 early pays (verb counters 54e/128p/2v/19l) | report |
| starvation deaths (guardrail) | 5 | **4** | PASS (<= 7) |
| hungryDays (guardrail) | 18 | **20** | BREACH (<= 19.8, by 0.2d) |
| national (guardrail) | 4/8 | 3/8 | PASS (>= 2) |
| median survival (report-only per #224) | 106d | 115d | — |
| table | 0/8 | 0/8 | — |
| wins | 0/8 | 0/8 | — |
| everW4 / everW5 | 3/0 | 2/0 | — |
| maxWave | 4 | 4 | — |
| exiled | 0 | 0 | unchanged |

Lead road (coverage): 8/8 armed runs match baseline day-for-day (33/138/180/150/115/67/93/90d,
0 tribute weeks either side, verb never fires — 0e/0p/0v/0l); national 5/8 both; no harm,
no signal. The coverage wrapper is inert where no subordinate links exist.

**Verdict: KILLED AT PILOT per §14.** The primary required arrears <= 8 AND missed+thin
<= 16 on the belong road; armed delivered 13 and 22. Both prongs miss by margin, not by
rounding. No confirm spend. The layer is deleted per the kill protocol; proof + det-gate +
sweep + sense + per-seed evidence kept.

## The mechanism reading (why 54 early pays bought almost nothing)

The verb fired 54 times (128 pantry holds, 2 village holds — the new gate BIT, unlike the
tribhealth vacuous gate — 19 link holds). But the tribute books barely moved: arrears
14→13 (0.93x), missed+thin 25→22 (0.88x), vs tribhealth's 0.47x/0.61x on this road. Two
readings, both in the numbers:
1. The room is gone: on the current tip the base belongseek discipline already pays 81
   full weeks with only 25 missed+thin across 8 seeds (the tribhealth control read 19
   arrears / 31 missed+thin — the base discipline or the regime shifted under the arm).
   An early pay converts a week to full; most early-paid weeks would have been full on
   base timing anyway. s77 fired 19 early pays and the books didn't move at all
   (23f/0t/1m both sides).
2. Timing perturbation: s44 missed 3→4 and s55 missed 4→5 with the arm firing — paying
   early reshuffles pantry timing and can create misses the base discipline didn't have.
   s22's armed village died at 120d (baseline survived 180d) with 10 early pays and zero
   starvation deaths (combat/monster ended it) — perturbation, not the starvation
   channel the arm touches, but a 60d swing on one seed with the verb firing 10× is not
   nothing. Open question, not chased (n=8, primary miss kills the arm regardless).

The revive's one design success is real: the hungryStreak gate fires where the killed
gate never did (2 village holds, s33 + s77), and G2b proves the divergence on a fixture
the old instrument misread. But a gate that bites twice in 16 runs cannot carry a
discipline lever whose primary mechanism — early pay converting missed weeks — has no
room left to work on this tip.

## Death-cause shares

Control belong (8 runs): combat 64, "a wound that wouldn't close" 4, villager combat 10,
starvation 5, sickness 10, lockjaw 1, monster 6, contest 6, Buffering 1.
Armed belong: combat 43, "a wound that wouldn't close" 4, villager combat 12,
starvation 4, sickness 10, monster 8, contest 4, Buffering 1.
Armed causes are a strict subset of control modes — **no new death mode: PASS.**
Lead road: base and armed death-cause maps byte-identical (verb inert there).

## Wall numbers (every run)

| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control | 9/16 | 0/16 | 0/16 | 9/16 | 0/16 | 106d | 180d |
| armed | 8/16 | 0/16 | 0/16 | 8/16 | 0/16 | 115d | 180d |

Exiled: 0 both. The scale wall stands: no table, no wins, no wave 5 on either side.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Armed tribstreakbelong s77, 180d: 19 early pays, 1 village hold, 3 link holds. Every
early-pay beat names the PRE-payment pantry depth (23.3 → 361.9 days as the pantry deepens
through the season) and the actual streak number — "the hungriest streak in the ledger is
0 days, and the crisis line is three" — then the engine's payment beat lands beside it
("Tribute paid: 6,100 kcal walks out of the pantry toward Thornfield. The relationship
holds."). The cause line is said only after payTribute confirms. **Coherence PASS.** The
19 beats are near-identical in phrasing (same decision, same narration) — acceptable for
a policy beat, carried over from the tribhealth sense note; the varying depth + streak
numbers keep each one honest. The early days of s77 show the scholar starving (day 1–19
"STARVING" beats) while no link yet exists — the verb stayed silent through the hunger
(nolink), correctly doing nothing before the courtship formed.

## Village assessment (plain words)

Sixteen villages, and the revived verb did its job on the instrument question: where the
killed tribhealth gate watched sixteen runs and never once held, the hungryStreak gate
held twice (s33, s77) — the engine's own individual-hunger signal is genuinely readable
by a policy wrapper, and the divergence fixture proves it sees what the pantry streak
misses. The narration tells the truth about what it did — every early pay names the
pre-payment depth and the streak that justified it.

But the lever's primary mechanism — paying early to convert missed weeks into full ones —
had no room to work: the base belongseek discipline on this tip already pays 81 full
weeks with only 25 missed+thin, and 54 early pays bought a 3-week net improvement. The
lineage (tribgate → tribdisc → tribhealth → tribstreak) is now four arms deep, and the
discipline numbers keep converging toward the same asymptote: arrears 19→9→13 across the
last three runs' armed sides, while the control keeps improving under them (19→14 this
tip). The tribute books on the courtship road may simply be close to as clean as
early-payment timing can make them.

## Blanks filled / documented

- **MEASURED, KILLED AT PILOT** (primary missed both prongs, §14): the hungryStreak-gated
  early tribute pull-forward — scripts/policies/tribstreak.js (TRIBSTREAK=1, default OFF;
  DELETED per kill protocol), proof scripts/test-tribstreak-20261015.js (RED 6/6 + GREEN
  15/15 on seeds 11/22/33, kept), det-gate scripts/det-gate-tribstreak-20261015.js (16/16
  both modes, kept), sweep scripts/measure-tribstreak-20261015.js (kept, INFO-SKIPs
  post-kill), sense scripts/sense-tribstreak-20261015.js (kept), evidence + per-seed JSON
  (evidence/2026-10-15/perseed-tribstreak-{base,armed}/, kept), sweep JSONs
  (sweep-out/tribstreak-{baseline,armed}.json, kept). Zero src/js changes.

## Metric review (§14)

1. **The KILL stands on the header as written — no re-scoring.** The primary required
   arrears <= control×0.6 AND missed+thin <= control×0.65 on the belong road; armed
   delivered 13 vs <=8 and 22 vs <=16. Both prongs miss with margin. The absolute
   calibration (<=11, <=20) also misses. The guardrail breach (hungryDays 20 vs <=19.8)
   is immaterial to the call — the primary kills it alone.
2. **Control re-measurement moved the bars, and the ratio reading is the binding one.**
   The header pre-registered the ratio metric AND a calibration against the inherited
   tribhealth control (19/31 → bars <=11/<=20). This sweep's re-measured control is
   14/25 (#247 drift), which makes the ratio bars STRICTER (<=8/<=16) than the
   calibration absolutes. I judged on the stricter ratio bars — the primary as worded —
   never the friendlier calibration. Both fail, so no ambiguity.
3. **The lineage question for the next run.** Four arms (tribgate, tribdisc, tribhealth,
   tribstreak) have now attacked tribute-timing, and the disciplined numbers asymptote:
   the base discipline on the current tip already converts nearly every tribute week.
   The next tribute arm should NOT be another early-payment timing variant — it should
   either (a) change the tribute terms themselves (amounts, young-bond relief — see the
   young-bond relief-valve steve-call), or (b) prove the room exists first with a
   constructed scenario where the base discipline misses many weeks (predcond 6/6
   pattern). A fifth early-pay variant without that proof is a wasted pilot.
4. **hungryStreak is the right instrument.** The G2b divergence + 2 live holds vs the
   killed gate's 0/16 prove the engine's individual-hunger signal is policy-readable.
   Any future tribute/crisis policy that needs "is the village starving?" should read
   progState().hungryStreak, never v.hungryDays.

## Convergence state

food-economy: **killed-at-pilot** (tribstreak). The hungryStreak-gated revival proved the
instrument (gate fires where the killed one never did; beat names pre-payment depth +
streak honestly) but the primary missed both prongs by margin (arrears 14→13 vs <=8;
missed+thin 25→22 vs <=16) — the current-tip base discipline leaves no room for early-pay
timing to convert. Lineage note: four tribute-timing arms have now asymptoted; the next
tribute arm needs a terms-change or a room-exists proof, not another timing variant.
