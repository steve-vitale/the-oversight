# SIM-FEASTSCAV — feast scavenger-draw harm-channel instrument (ARM 3, loop B, food-economy)

Date: 2026-10-15 · Loop: oversight-flesh-out-loop-b · Worker tree: sim-feastscav
Axis: food-economy (scale-wall lens) — sim-findings #227's harm-channel question, claimed 2026-10-15 by loop B (this run).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — binding, written BEFORE sims)

- **Question**: FEAST-AS-TABLE-DOOR's benefit is causation (4th replication,
  5/5 traced feast→rung→seat, 0/16 control tables) but the lever was KILLED
  at confirm on the national guardrail (6/16 vs ≥9/16, median 129→94d, the
  lead road uniformly ≤0d). Suspected harm channel: "the feast's
  scavenger-draw adds real combat exposure — the 4-day floor guards the
  pantry, not the fight." The feasttable-b evidence could not separate
  this channel from trajectory perturbation (the identical-seed design is
  perturbation-dominated for RNG-consuming verbs). This arm is the
  INSTRUMENT that separates them — it builds no lever, changes no policy
  and no game code (harness-side wraps only).
- **Instrument**: scripts/feastscav-instrument-20261015.js —
  installFeastScav(Game) wraps, call-through (zero trajectory delta,
  pinned by the det-gate):
    - Game.grantFeastBuff → feast events {day, armed, quality, refreshed}
      (the feast verb's grant; armed = devotion-gated fresh grant — only
      armed grants can draw, canon src/data/feast-surge.json,
      feastDraw.chance=1.0)
    - Game.drawFeastScavenger → draw events {day, drawn, why, monsterId,
      veteran, wave} (the scavenger-draw event itself)
    - Game.faceFeastDraw / Game.driveOffFeastDraw → faced/driven events
    - Game.startCombat → combat-exposure events {day, monsterId,
      drawPending, participants}
    - Game.registerDeath → death events {day, cause, kind, who, player}
  Windows: every armed feast opens [F, F+2] (the buff's live window,
  durationNights=2); channel by the draw's fate:
    draw-fought / draw-driven / draw-unfought (draw fired) /
    feast-nodraw (draw wrapper fired, drawn=false — smoke carried clear,
    already pending, no cast) / feast-nodraw-unverified (armed feast with
    NO draw event — a log gap, counts as UNATTRIBUTED).
  Draw-fight linkage: a drawn draw links to the combat that consumed it —
  same monster id, within [drawDay, drawDay+2], s.feastDraw still present
  at combat start (raw snapshot — the instrument NEVER calls
  Game.feastDrawPending() inside a wrap: it self-cleans and can trigger
  clearFeastBuff, which changes the fight; neutrality pinned by
  instrumented-vs-pristine A/A). The draw fight is the LAST candidate in
  tick order: on the base road the harness day-loop resolves the pending
  encounter at tick end (after driveFights), so faceFeastDraw is never
  reached — the fight is real either way. One combat links to at most one
  draw (7d cadence keeps same-species draws apart).
  Attribution: a combat-family death (cause /combat|monster/i —
  'combat', 'patrol combat', 'villager combat', 'monster') OF A PERSON
  (kind 'villager'/'person' — monster deaths are the village WINNING
  fights, tracked separately as the exposure companion, never as harm)
  is attributed to the window channel containing its day (priority
  draw-fought > draw-driven > draw-unfought > feast-nodraw > ... >
  baseline); non-feast days = 'baseline'.
- **PRIMARY (diagnostic)**: attribution coverage ≥ 0.80 — of combat-family
  PERSON deaths inside armed-feast windows, the fraction in a DRAW-RESOLVED
  channel (draw-fought/draw-driven/draw-unfought/feast-nodraw). The
  'feast-nodraw-unverified' channel is a log gap and counts as
  unattributed; ≥80% required for the instrument to answer the question.
  Cross-checks: instrument feast count vs the policy's ctx.fsArmedFeasts;
  instrument death count vs the tele 'death' stream (fullTelemetry=1).
- **DECISION RULE (harm-channel verdict)**:
    REAL  iff (a) the draw-fought window PERSON combat-death rate ≥ 2× the
          baseline (non-feast-day) PERSON combat-death rate, AND
          (b) ≥ 50% of the armed-side excess combat deaths (armed minus
          control on identical seeds) fall inside feast windows.
    NOT-ESTABLISHED → design next: perturbation-aware guardrail
          graduation (a scavenger-safe feast needs no harm to be safe
          from; the feasttable-b guardrail miss reads as perturbation).
  The feast-vs-non-feast combat-death-rate comparison (armed leadfeast
  vs pristine leadcourt, identical seeds, same sweep) is part (b).
  SECONDARY (mechanism check): monster-kill rate in draw-fought windows —
  the draw fight really happens iff kills concentrate there.
- **Horizon**: 180d death-aware (pacing-law absolute max — the guardrail
  harm showed as earlier death; the full road is needed for national
  reach and the survival tail). Dead villages stop simulating.
- **Seeds**: 11/22/33/44/55/66/77/88 × {leadcourt (FEASTSCALE_R13 unset,
  pristine — 0 feasts by construction, pinned in proof R2), leadfeast
  (FEASTSCALE_R13=1, draws faced unconditionally — the feasttable-b road)}
  = 16 runs, own control in the SAME sweep (CONTROL BASELINE DRIFT #247 —
  never inherit a baseline; the sim-wildtile run showed committed
  baselines perish via narration→RNG coupling).
- **Det-gate**: 16/16 bit-identical A/A reruns with the instrument
  installed FIRST (r27 rule) — per-day trajectory hashes AND the
  instrument's own event logs must match, both sides.
- **SMOKE=1**: instrument-honesty gate (inert when unwrapped; control
  truly never feasts; named-export policy unwrap pin).
- **Decision**: diagnostic instrument — GO/KILLED verdict on the HARM
  CHANNEL per §14; a miss on coverage or an inconclusive comparison is
  NO-GO (the harm is NOT established), never re-scored. Nothing lands
  except the instrument itself (scripts + proof + sweep + evidence).

## Proof results (REAL RED → GREEN, run BEFORE any sims)


scripts/test-feastscav-20261015.js. Independently re-run (both sides,
final instrument).

- **Det-gate FIRST (r27 rule)**: 8/8 A/A bit-identical BOTH sides with the
  instrument installed (16/16 total) — per-day trajectory hashes AND the
  instrument's own event logs (feasts/draws/faced/deaths) match. The
  instrument adds zero trajectory delta.
- **Neutrality pin** (stronger than A/A): instrumented-vs-pristine
  (no instrument) day-hash comparison, s22/s33/s44 — identical on all
  three. This caught a REAL bug mid-build: the first startCombat snapshot
  called Game.feastDrawPending() pre-call, which self-cleans and can
  trigger clearFeastBuff — deleting a still-pending draw and turning the
  draw fight into a bulldozer fallback (d34 health 95 vs 92). Fixed to
  pure property reads; neutrality re-pinned.
- **SMOKE=1 honesty**: R1 instrument inert when unwrapped (no retroactive
  logs); R2 control road logs zero feasts/draws over 180d (the isolation
  baseline is real); R3 named-export unwrap — FEASTSCALE_R13 unset →
  leadfeast == leadcourt per-day hashes 40d ×2 seeds (the r20b unwrap
  lesson: the armed side is the NAMED export, not a copy).
- **GREEN rigs** (SMOKE=1): G1 armed grant → draw fires → faceFeastDraw →
  real startCombat → engine combat death attributes 'draw-fought',
  coverage 1.0. G2 driven-off draw → 'draw-driven'. G3 draw blocked
  (already-pending) → 'feast-nodraw', no draw-fought window. G4 armed road
  fires feasts+draws on s22 (s11's village collapses d33 before any feast
  — the instrument logs what the road does, honestly zero; fixture moved
  to s22). G5 rig determinism: identical fixture twice.
- RESULT: all checks passed (RED and GREEN), both sides. Logs:
  /tmp/proof-fscav-control.log, /tmp/proof-fscav-armed.log (re-run at
  evidence time; the worktree scripts are the re-runnable record).

## Sweep results


16 runs, identical seeds (11/22/33/44/55/66/77/88), 180d death-aware.
Own control in the same sweep (leadcourt pristine vs leadfeast
FEASTSCALE_R13=1). Instrument honesty on live seeds: attribution
coverage 1.00, feast-log coverage 1.00 (instrument armed feasts ==
policy ctx.fsArmedFeasts), death-log coverage 1.00 (instrument deaths ==
tele 'death' stream).

| metric | control (leadcourt) | armed (leadfeast) |
|---|---|---|
| feasts / armed / draws | 0 / 0 / 0 | 54 / 53 / 53 |
| draws fought | — | 52/53 (1 unfought) |
| person combat deaths | 89 (0.103/d) | 82 (0.099/d) |
| …in draw-fought windows | — | 23 (0.150/d over 153d) |
| …in feast windows (all) | — | 25 |
| monster kills (exposure) | 121 | 139 (57 in draw-fought = 41% of kills in 18% of days) |
| national | 5/8 | 4/8 |
| table | 0/8 | 2/8 (1 lesser s66, 1 FULL s77) |
| wins / exiled | 0/8 / 1 | 0/8 / 1 |
| wave-4 / wave-5 | 5/8 / 0/8 | 6/8 / 3/8 |
| max Arc | 4 | 4 |
| median / max survival | 115d / 180d | 109d / 180d |

**VERDICT: NOT-ESTABLISHED (the harm channel is not established as the
explanation for the feasttable-b guardrail miss) → PERTURBATION.**
Pre-registered rule, judged as written (§14, no re-scoring):
- (a) draw-fought window person combat-death rate ≥ 2× baseline: 0.150
  vs 0.085 = **1.77×** → MISS (vs control baseline 0.103 = 1.46×).
- (b) ≥50% of the armed-side excess person combat deaths in feast
  windows: armed−control = 82−89 = **−7** — there is no excess; the
  armed road killed FEWER villagers in combat than the pristine road
  → MISS (vacuous).
Both prongs miss. The #227 harm channel — "the feast's scavenger-draw
adds real combat exposure [that explains the national guardrail miss]"
— is NOT established. Design next: **perturbation-aware guardrail
graduation** (the feasttable-b national miss reads as perturbation,
consistent with loop A's feastexposure finding the same day: the gate
reversed the national gap 3→5/8 while the median miss had no
mechanism).

**The honest nuance (not a re-score):** the draw fight IS a real fight
with real casualties — 23 person-deaths in 153 draw-fought window-days
(1.77× the armed baseline, spread across 7/8 seeds, not one collapse;
mechanism check passes: monster kills 2.2× concentrated in draw-fought
windows). But 24 of the 25 in-window person-deaths are SCHOLAR
successions — the mantle passes, the village continues (s77: 12 draw
fights, 12 scholar deaths, and still 180d + FULL table + national).
Only ONE non-scholar villager died in a feast window across all 8
seeds. The draw taxes the scholar's lives, not the village's survival —
and the aggregate shows no excess mortality to explain a national
guardrail miss. A scavenger-safe feast (the exposure-gate direction)
would cut real scholar casualties, but it is not required to explain
the killed guardrail.

## Sense-testing (SENSE-TESTING LAW — read, not counted)


scripts/sense-feastscav-20261015.js (FEASTSCALE_R13=1, s22, 60d). The
feast→draw→fight chain reads as a real consequence, not a counter:

- d27: "🍖 FEAST 📺 — Walt opens the pantry wide... Somebody laughs so
  hard they cry. For one evening, nobody is surviving — they're just
  together." → "🍖 FEASTED ×2.03 until tomorrow's dawn... A channeled
  keepsake feeds the flames (devotion ×1.5)." → "🌙 The cookfire's smell
  carried further than the laughter did — smoke and grease on the night
  wind. Nevermore is circling the edge of the light. It followed the
  feast here. (A scavenger, drawn by the feast. Face it while the feast
  is in you — or let the watch drive it off.)"
- The fight: "⚠️ 1 threats: Scarred Big Big 1 (×4) — all here, all now.
  Your party: just you. You are outnumbered — fight like it."
- The aftermath is social, not numerical: "Back at the haven the argument
  starts: Wolfgang is calling it 'The Loud Beast.'" / "You catch Jorge
  telling the fire about Theo. 'Theo killed tick out past the ridge' The
  story's already growing."

**PASS** — the exposure reads as a real consequence of the feast: the
village names the beast and tells stories about the fight. The 1.77×
window elevation is villagers living this, not noise in a counter.

## Wall numbers (every run)


| side | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| control (8) | 5/8 | 0/8 | 0/8 | 5/8 | 0/8 | 115d | 180d |
| armed (8) | 4/8 | 2/8 | 0/8 | 6/8 | 3/8 | 109d | 180d |

Exiled: 1 both. The scale wall is not broken by this arm (instrument-only
by design), but the feast benefit replicates on the instrumented road:
table 0→2/8 (one FULL seat, s77), wave-5 0→3/8, Arc IV reached — with no
national gap (4/8 vs 5/8) and no aggregate combat-mortality gap
(0.099 vs 0.103/d).

## Village assessment (plain words)


Eight villages that never feasted, eight that did — same seeds, same
starting people. The feast villages read like the feasttable run's:
Walt opening the pantry wide, somebody laughing so hard they cry, the
honest kcal count in the beat — and then the cookfire's smell carrying
further than the laughter, the Nevermore circling the edge of the
light, the outnumbered fight, the village naming the beast afterward
("The Loud Beast") and telling the story by the fire. Every feast drew
its beast (53/53) and every beast but one was fought (52/53) — the
village wins those fights far more often than not (139 monster kills to
82 person-deaths on the armed side).

The price is paid by the scholars, not the villages: 24 of the 25
feast-window deaths are successions — the bearer falls facing the
draw, another villager takes up the mantle, the village continues. The
sharpest case is s77: twelve draw fights, twelve dead scholars, and the
village still stood 180 days, reached national, and took the FULL table
seat. One non-scholar villager died in a feast window across all eight
seeds. Villages that feast die of the same things villages always die
of, at the same rate (0.099 vs 0.103 combat deaths/day) — the fire costs
lives, but it costs the player's lives, and the village keeps what the
feast bought: the door stays open (2/8 tables vs 0/8), wave-5 unlocks
(3/8 vs 0/8), and national doesn't move (4/8 vs 5/8).

The blank this run fills is the instrument itself: the feast's combat
exposure is now MEASURABLE — every feast, every draw, every draw-fight,
every death attributed to a window — instead of a suspected channel in
an autopsy paragraph.

## Blanks filled / documented


- **FILLED (instrument)**: scripts/feastscav-instrument-20261015.js — the
  harness-side feast/draw/fight/death instrument (zero game-code, zero
  policy change; neutrality pinned instrumented-vs-pristine on 3 seeds).
  Kept per the instrument protocol, with proof
  (scripts/test-feastscav-20261015.js: REAL RED→GREEN, det-gate 16/16,
  SMOKE honesty, named-export unwrap), sweep
  (scripts/measure-feastscav-20261015.js: own-control, per-seed JSONs),
  and sense (scripts/sense-feastscav-20261015.js) scripts.
- **ANSWERED**: sim-findings #227's harm-channel question — the
  scavenger-draw harm channel as the explanation for the feasttable-b
  national guardrail miss is NOT established (perturbation). Filed in
  sim-findings.md.
- **DOCUMENTED (mechanism, for the next design)**: the draw fight is
  real and scholar-taxing (24/25 in-window person-deaths are
  successions; monster kills 2.2× concentrated in draw-fought windows).
  A scavenger-safe feast would cut real scholar casualties even though
  it isn't required to explain the killed guardrail — both design-nexts
  have support, in that order.
- **Instrument bug caught by the neutrality pin** (documented, fixed):
  calling Game.feastDrawPending() inside the startCombat wrap is NOT
  neutral — it self-cleans and can trigger clearFeastBuff, deleting a
  still-pending draw and retargeting the fight (d34: 95 vs 92 HP
  divergence). Instrument wraps must use pure property reads, never
  engine methods with cleanup side effects.
- [open] re-noted, not chased: finding #64 (devotion channeling line
  verbatim daily) — fifth run in a row ("You hold Coat button... The
  feast was the weapon." fires every day in the sense transcript).

## Metric review (§14)


1. **The verdict is NOT-ESTABLISHED, and it stands.** Both prongs of
   the pre-registered rule missed ((a) 1.77× < 2×; (b) no aggregate
   excess, −7). §14 forbids re-scoring against the friendlier reading
   ("the draw fight is real and kills scholars") — that reading is
   reported as mechanism nuance, not as the verdict.
2. **The 2× bar for (a) was well-chosen.** The observed 1.77× sits below
   it but close enough that a noisier suite could have crossed it —
   the bar did its job as a skepticism device, not a formality. Keep 2×
   for future harm-channel diagnostics.
3. **The coverage gate (≥0.80) passed at 1.00**, with both cross-checks
   at 1.00 — the instrument missed nothing on live seeds. The
   'feast-nodraw-unverified' channel never fired (every armed feast
   produced a draw event), which corroborates the canon (chance 1.0).
4. **Person-only harm was the right refinement** (made pre-sims, in the
   header): monster deaths are village victories, and counting them as
   harm would have nearly doubled the "combat death" numbers and
   answered the wrong question.
5. **For the next run**: the scholar-vs-villager death split (24/25
   successions) suggests the next harm diagnostic should pre-register
   scholar-succession rate as its own metric — successions are the
   actual cost center of the draw, and the village can absorb a dozen
   of them (s77) while still winning.

## Convergence state


food-economy: **instrument-GO** (sim-feastscav). The #227 harm-channel
question is ANSWERED: the scavenger-draw harm channel is NOT established
as the explanation for the feasttable-b national guardrail miss
(perturbation) — design next is perturbation-aware guardrail
graduation. Documented alongside: the draw fight is mechanistically real
and scholar-taxing (not village-killing), so a scavenger-safe feast
remains a legitimate casualty-reduction design. The instrument
(scripts/feastscav-instrument-20261015.js + proof + sweep + sense) is
kept as the reusable measurement for future feast arms.
