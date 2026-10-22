# sim-trailstarve-b — extended starvation-channel taxonomy (backlog #815, OFFLINE)

Run: fleshout-loop-b, arm sim-trailstarve-b (the explicit named next of run
fleshout-loop-b-20261022T1630Z's sim-deathcause-b). DIAGNOSTIC — no lever,
no landing, instrument-only, ZERO src/js changes, zero policy edits, ZERO
new sims. Worker tree: ~/workspace/worktrees/sim-trailstarve-b.
The classifier was developed entirely offline against the existing meal-row
corpus at evidence/2026-10-22/perseed-deathcause-b/ (16 per-seed JSONs +
_summary.json, committed by sim-deathcause-b).

## Pre-registration (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the re-run)

- **Question (backlog #815)**: sim-deathcause-b named 233/233 deaths but
  the starvation CHANNEL taxonomy failed (5/13 named, bar ≥95%): 6/13
  starvation deaths are away-villagers whose expedition production CLIFFED
  80-95% overnight while they stayed on the trail; pack draws of 700-1000/d
  vs ~2000 need; village pantry AMPLE at death (8.6k-33k). No recall
  mechanism exists. Develop the EXTENDED taxonomy classifier offline against
  the existing meal-row corpus, then re-run the starvation-death census.
- **Extended taxonomy channels**: (1) trail-starvation: away-majority
  window + production cliff + pack draws; (2) wound-compounded:
  wound/hurting beat within 3d of death; (3) net-based inflow-failure
  (inflow ≤ 1.05× need with the pantry crashed — covers both the famine
  shape and the thin-pool shape). Legacy channels retained for precedence
  completeness (rot, distribution, homecoming-timing, scholar-from-haul).
  Each death gets {primary, flags}; wound-compounded always attaches as a
  flag when present, primary only when it is the whole story.
- **PRIMARY (DIAG-GO)**: taxonomy completeness ≥95% of starvation deaths
  named under the extended taxonomy — bar = DIAG-GO at ≥12/13 named with
  0 instrumentErrors.
- **Verdict classes**: DIAG-GO (≥12/13 named, 0 instrumentErrors),
  NO-GO (miss — never re-scored).
- **Instrument proof** (pre-registered, scripts/test-trailstarve-b.js):
  (a) fixture RED→GREEN: 14 synthetic corpora exercise every channel,
  precedence ordering, the nearest-dawn pantry join, and the cliff
  boundary; (b) corpus RED→GREEN: old taxonomy 8/13 unattributed (the
  published NO-GO) vs new taxonomy ≥12/13 named; (c) DET: two in-memory
  diag runs byte-identical on the corpus re-run.

## Canon

- docs/CANON.md read first. docs/PRESERVATION.md (the food ladder;
  "rot can't be smoked back into food" — relevant to the rot sensor
  caveat), docs/TIME-ECONOMY.md (day-part structure behind the dawn
  pantry series). **No canon doc covers expedition recall or village
  death attribution** — the channel taxonomy is an INSTRUMENT, not canon:
  it measures the engine's food flows (villageEats → villagerMealDay
  per-person draws, pantryDraw, depositPantryPieces homecoming split,
  hurtFromStarvation) as the code implements them. Nothing was invented
  from scratch; the channel names are measurement vocabulary.

## Proof results (scripts/test-trailstarve-b.js: 20/20 GREEN)

- A1–A14 fixtures: every channel fires on its signature (trail-starvation
  on away+cliff+pack-draws+ample-pan; wound-compounded primary and as
  flag; inflow-failure on BOTH the famine shape 0.71-0.81×need and the
  thin-pool shape ~1.0×need; distribution; homecoming-timing;
  scholar-from-haul; rot with a seeing sensor; honest unattributed);
  precedence verified (distribution > inflow; scholar-from-haul > inflow;
  rot > inflow; trail + wound → trail primary, both flagged); cliff
  boundary (ratio > 0.35 does not fire); nearest-dawn pantry join on a
  gap-day death.
- B1 RED baseline reproduced from the corpus's own starv entries: OLD
  taxonomy 8/13 unattributed (the published NO-GO) — 5/13 named.
- B2 GREEN: extended taxonomy names 13/13 with 0 instrumentErrors —
  clears the ≥12/13 bar.
- B3 per-death primaries match the characterized shapes exactly;
  B4 wound-compounded flags land on the transcript-confirmed cases
  (Zinaida d36, Zihao d43); B5 the Juan×2 byte-identical seed-determined
  death classifies identically on both policies.
- C1 DET: two in-memory diag runs byte-identical.

## Re-run census (diag-trailstarve-b.js → evidence/2026-10-22/trailstarve-census-b.json)

13/13 starvation deaths named (100%), 0 unattributed, 0 instrumentErrors.
byChannel: trail-starvation 5, inflow-failure 8.

| death | old | new | flags | notes |
|---|---|---|---|---|
| Theo belong s66050 d29 | unattributed | trail-starvation | trail, inflow | cliff 0.08, 15/15 away, pan 8,604; inflow flag: village pool also drained in-window |
| Somchai belong s66050 d135 | unattributed | inflow-failure | inflow | thin-pool: inflow 1.03×need, pan 5,350→1,000 (nearest-dawn fix) |
| Ingrid belong s66050 d141 | unattributed | inflow-failure | inflow | thin-pool: inflow 0.98×need, pan 500 |
| Kenneth belong s66050 d143 | unattributed | inflow-failure | inflow | village pan 0, inflow 0.92×need; away 1/4 — NOT trail by the formal rule |
| Juan belong s66053 d8 | unattributed | trail-starvation | trail, inflow | cliff 0.07, 6/8 away, pan 16,900 |
| Irving belong s66053 d21 | unattributed | trail-starvation | trail | cliff 0.14, 8/15 away, pan 8,860 (nearest-dawn fix) |
| Zinaida belong s66053 d36 | unattributed | trail-starvation | trail, wound-compounded | cliff 0.18 (last-2d), 15/15 away, pan 10,774; mauled −12 same day |
| Zihao lead s66050 d43 | inflow-failure | inflow-failure | inflow, wound-compounded | famine 0.74×need; hurting 2 HP d41/43 |
| Pavel lead s66050 d48 | inflow-failure | inflow-failure | inflow | famine 0.71×need |
| Theo lead s66050 d50 | inflow-failure | inflow-failure | inflow | famine 0.71×need; away 15/15 but no cliff, no pack draws, pan 0 — correctly NOT trail |
| Ruth lead s66050 d54 | inflow-failure | inflow-failure | inflow | famine 0.74×need |
| Laura lead s66050 d65 | inflow-failure | inflow-failure | inflow | famine 0.81×need |
| Juan lead s66053 d8 | unattributed | trail-starvation | trail, inflow | byte-identical to the belong policy row |

**PRIMARY verdict: DIAG-GO — 13/13 named (100%), 0 instrumentErrors, bar was ≥12/13.**

Net-based inflow-failure now covers both shapes: the famine (inflow
0.71–0.81×need, 5/13) and the thin-pool drain (inflow 0.98–1.03×need but
the pantry crashed 5,350→1,000 / →500, 2/13) — the guard is the crashed
pantry, not a fixed inflow ratio. Kenneth lands at inflow-failure on
corpus data (village pan 0, inflow 0.92×need); see Metric review #3 for
the wound-recall caveat.

## Reachability verdict

Not applicable by design: DIAG instrument on an existing corpus, no lever,
no new sims. Wall numbers from the corpus are unchanged from
sim-deathcause-b: won 0/16, national(end) 5/16, table 14/16, wave4 14/16,
wave5 0/16, median survival 172d.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Read the death-day beats around the trail-starvation deaths:

- **Theo d29**: the village is alive and eating the day he dies —
  "Zihao cooked for the haven — meals stretched", "Cormac returns with
  foraged food: +378/+495/+538 kcal to the pantry", "Village meal: +2000
  kcal" — while Theo's own rows show production 4640→293 and pack draws
  704–1010/d. "Theo brought you a sample. The Codex grows." — he was
  contributing knowledge the day he died. "💀 Theo starved. Slowly. The
  talk dies fast around the fire. Nobody has the words yet." / "◈ CRISIS
  — THE FIRST GRAVE." The story the game told is HONEST: the food was at
  the fire; Theo was on the trail. SENSE-PASS.
- **Irving d21**: "The pantry is bursting past tomorrow — most of the
  haul stays in your pack. The fire can wait; the road can't." / "You
  keep a day's food (4410 kcal) — nothing extra for the pantry this
  time." — the scholar keeps haul in pack while "Village meal: +1080
  kcal. (Half ration — they don't trust you yet.)" and "⚠ STARVING:
  health and energy falling." Then "📖 The Codex turns a page on its
  own. Irving is dead." Irving's production cliffed 2085→382→96 on the
  trail and he drew from his pack; the ample pantry was unreachable.
  SENSE-PASS — and the scholar's pack-keep while the village half-rations
  is socially legible, theft-adjacent, not a bug.
- **Zinaida d36**: "🩸 The Inspiration mauled Zinaida (−12 health) over 1
  round. They're lucky to be breathing." → "💀 Zinaida starved. Slowly.
  Somebody's sleeping-roll stays rolled out." Her rows: prod 2756→769→241
  overnight, pack draws 776/792. The wound-compounded flag is honest —
  the engine narrates the setup. SENSE-PASS.
- What the game never voices: the expedition-recall decision. No beat
  says "the patch collapsed, come home" or shows a villager deciding to
  stay. The recall blank is real and unvoiced — documented, not invented.

## Village assessment

Same 16 villages as sim-deathcause-b (SURPLUSFEED gone, depositgate +
plentydepri live) — this arm adds no new sims. The extended taxonomy
closes the loop the prior arm left open: every starvation death now has
a named channel, and the story is coherent:

**Who starved and why**: five villages' famine (s66050-leadfeast, inflow
0.71–0.81×need for a month, pantry bled to zero); two thin-pool drains
(s66050-belongfeast: village produced ~100% of need yet the pantry
crashed — only the trust-gated surplus ever pools while the scholar
draws a full daily meal + top-ups + rot drain the pool); five
expedition trail-starvations (production cliffs 80–95% overnight,
pack as the only buffer, full pantry at the unreachable fire); one
inflow-failure on the scattering day (Kenneth: village pan 0, mauled
−85 per the prior arm's live transcript read — the corpus transcript
retains only death-day/loss-day lines, so the wound flag is
corpus-blind; see Metric review #3).

**What was missing**: (1) expedition recall — no mechanism brings a
villager home when trail production collapses; the pack is the only
buffer and it runs dry in days (steve-call-sized design question);
(2) pool thickness — the trust-gated surplus share is too thin to
carry the scholar's fixed daily draw + top-ups + rot when production ≈
need; (3) wound care — "no healer at haven" while 2-HP villagers rest
instead of ranging, then starve.

**Blanks filled**: backlog #815 DIAGNOSED — the extended taxonomy
completes at 13/13 (recovery from the 5/13 channel NO-GO); the three
shapes are now named and measurable (famine / thin-pool / trail), with
wound-compounding as the flagged cross-cutting amplifier. The classifier
(scripts/taxonomy-trailstarve-b.js) is reusable against future corpora.
**Blanks documented**: the expedition-recall design question (steve-call);
the rot sensor phase bug (still open — instrument silence, not
evidence); the Somchai/Ingrid final-day drawn=0 mystery (still open);
the scholar-as-largest-pantry-customer measurement (50–91% of pooled
surplus).

## Metric review (§14)

1. **PRIMARY passed: 13/13 named (100%), 0 instrumentErrors → DIAG-GO.**
   Bar was ≥12/13. The recovery came from naming, not re-scoring: the
   two genuinely new channels (trail-starvation, wound-compounded) and
   the net-based inflow-failure (famine + thin-pool under one guard).
2. **Rot sensor phase bug (still open)**: the corpus rot series reads ~0
   (sweepSpoiled-phase race, sim-deathcause-b metric review #4). The rot
   channel is implemented and proven on fixtures, but fires 0/13 on this
   corpus: instrument silence, not evidence of absence. A fresh sweep
   with the sweepSpoiled-phase sensor is the named instrument fix — no
   classifier change needed.
3. **Wound-compound recall is corpus-limited**: the corpus retains
   death-day and loss-day say lines only. Zihao's hurting beats (d43)
   and Zinaida's mauling (d36) were voiced on death days → flagged.
   Kenneth's −85 mauling (scattering day, per the prior arm's live
   transcript read) is NOT in the corpus → no flag; his primary is
   inflow-failure on corpus data (village pan 0, inflow 0.92×need),
   which is the honest corpus-verdict. A future instrument should retain
   wound beats per villager per day.
4. **Pantry-at-death join fixed per metric review #5**: nearest-dawn ≤
   death-day repaired Somchai (null→1000) and Irving (null→8860). The
   drawn=pantry/pack conflation (metric review #6) is handled: away
   rows' drawn are pack draws (packDraws boolean), at-haven rows' are
   pantry draws.
5. **Theo-lead d50 is correctly NOT trail-starvation**: away 15/15 like
   the trail cases and his production did collapse (cliffRatio 0.24), but
   his last-3-day pack draws were 0/d and the pantry was 0 (not ample) —
   in the famine there was nothing to draw. The conjunction (away-majority
   AND cliff AND pack draws AND ample pantry) does the real work: no
   single-signal false positive. Verified by fixture A2 as well.
6. **Metric binding honored**: the bar was written before the re-run
   and judged as written. No re-scoring, no friendlier metric.

## Convergence state

**DIAG-GO on the pre-registered bar.** Backlog #815 diagnosed: the
extended taxonomy completes at 13/13 named (recovery from the 5/13
channel NO-GO), with the three hunger shapes named and the wound
amplifier flagged. food-economy stays converging; the wall is unmoved
(wins 0/16, wave-5 0/16 on this corpus). Named nexts: (1) the
expedition-recall blank is a steve-call-sized design question — no
mechanism recalls a villager when trail production collapses; (2) the
thin-pool finding (scholar = 50–91% of pooled surplus) belongs in the
replacement-direction evidence; (3) rot-sensor phase fix + wound-beat
retention for the next census instrument.

## Telemetry note

Coordinator's step (per the run body §10); the corpus for it is
evidence/2026-10-22/perseed-deathcause-b/ (16 per-seed JSONs +
_summary.json), anchor cd68e6dd3, substrate FEASTSCALE_R13=1/SEATDRIVE=0.
The re-run census is evidence/2026-10-22/trailstarve-census-b.json.
