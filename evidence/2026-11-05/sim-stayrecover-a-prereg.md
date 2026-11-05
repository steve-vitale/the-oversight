# Pre-registration — sim-stayrecover-a (build: longer staying in fights)

Committed BEFORE any judged sweep. Judge strictly against this file; a
miss is NO-GO, never re-scored against a friendlier metric mid-run.
Metric doubts go under "metric review" in the evidence file, for the
NEXT run. Steve order 2026-11-05: "Address all gaps, get all this built."

## Question

The wave-4 wall is a STAYING gap (sim-killconv-a, DIAG-GO): lost fights
land median 2 strikes in 5 rounds (0.40/round); median 44 dmg/strike vs
900-HP beast = 20.5 strikes to kill. Gap factors 2.5x strike density x
4.1x rounds survived. The named fix direction is LONGER STAYING (flee
repair + in-fight recovery), NOT damage, beast HP, or gates.

This arm has two halves:
1. CONFIRM the pilot flee-repair code — REPLICATION on the current
   anchor. NOTE: a confirm already ran (sim-fleerepair-confirm-a,
   seeds 99601–99612, anchor 0de632f6a391, verdict GO (confirm) with a
   disclosed approach-path gap). This replication re-runs the same bars
   on the current anchor (e5e6aa59b) with FRESH seeds, because the
   pilot code has not landed and the anchor moved. The Nov 4 confirm
   numbers are NEVER cited as this panel's baseline.
2. BUILD in-fight recovery (the unbuilt half): a mid-fight eat verb —
   `tbEatRations()` — food-powered, inside the existing fight engine.

## Canon

No canon doc covers TB flee or mid-fight eating. What covers flee is
in-code law (game.js tbBarrierExit) + Steve's 2026-11-02 ruling that
monsters do NOT flee while players CAN. Eating in combat has in-code
precedent: spendCombatAction (Steve 2026-10-05) — "using a consumable
from Pack in combat costs your action. Eating, drinking, using items —
all of it." Field-medicine precedent (fieldFights.js): a hurt villager
binds the wound instead of striking, +20 HP, the strike spent.
Nothing invented: the eat verb is spendCombatAction's eating case,
given a body and a price.

## The recovery design (built in this arm, before the R leg)

Engine `Game.tbEatRations()` (src/js/game.js, next to tbPlayerWait):
- One bite = 250 kcal from the scholar's pack → +25 HP (1 HP / 10
  kcal), capped at maxHp via addHealth (the honest HP route in a
  fight; overheal counts through the build-around heal hooks).
- If the pack holds 100–249 kcal, eat all of it → +floor(kcal/10) HP.
- Costs the action (p.acted = true + tbAfterPlayerAction), exactly
  like a strike or a wait. Narrated honestly with the numbers
  ("You tear into your rations — 250 kcal, +25 HP. The pack is
  lighter now."). Refuses honestly and spends NOTHING when: not the
  player's turn, already acted, pack < 100 kcal ("Not enough left in
  your pack to make it worth stopping for.").
- Food is real: the debit is packSpend on the day's pack (seeded from
  the pantry on first access, as packKcal does everywhere else). Food
  eaten in a fight is food not eaten at dinner — the dinner test holds
  by construction. The pack's disease risks are claimed once, by the
  next packMeal, exactly as today; the eat verb adds no risk roll and
  skips none.
- Player button in app.js (same selfbar pattern as Wait): "🍖 Eat"
  with the bite in the title. Enabled when !p.acted; the engine
  refuses honestly when the pack is short. Phone/browser tap
  verification at 390x844 is OUTSTANDING (node cannot prove a
  tappable bar) — same standing caveat as the 2026-11-03 ability
  buttons.

Policy (scripts/policies/competent.js, gate COMPETENT_RECOVER=1,
default OFF; variant scripts/policies/competent-stayrecover-a.js opts
into the 3 flee gates + COMPETENT_RECOVER=1 — recovery ships ON the
confirmed flee repair, one staying package):
- Eat when ALL hold: hpPct < 0.50, a living monster is in weapon
  range (the alternative is a strike — a real tradeoff), the weakest
  living monster's current HP > 50 (never eat instead of a killing
  blow), pack >= 100 kcal.
- Placement in fight(): after beastTrickPlay, before close/strike —
  flee (incl. the <0.35 eject and DPS race) and ability/trick play
  still outrank eating. A trapped hurt fighter (flee returned false)
  can eat; a fighter who can flee, flees.
- Counters in ctx (recoverEats, recoverKcal, recoverHp) for the
  analyzer.

NOT in this arm: damage numbers, beast HP, gates/prices/deeds, six
slots, tile-join (HELD — do not adopt build-staying / gaps2-staying),
the approach fallback (already landed as sim-approachfall-b,
gate COMPETENT_APPROACH_FALLBACK — NOT enabled in any leg here; the
approach-loop metric below is reported, not judged), the wound-mill
outmatched fix (current-HP assessment — named next lever, not built
here; it changes flee behavior and would confound the confirm bars).

## Seeds, policies, horizon

- Seeds 99613–99624 (12, FRESH — verified before this prereg: no
  dated prereg under evidence/*/sim-*-prereg.md names any of them;
  not in the standacc-b band list (99101/99107/99108/99201/99208);
  the only 9961x/9962x hits in Nov 4–5 evidence are float artifacts
  inside tracer JSONL ("freshDays":6.330160584996169), not seeds).
- Horizon 140 days, death-aware. Single anchor e5e6aa59b (this
  worktree's base) for ALL legs; single-base judging.
- Legs (driver scripts/stayrecover-driver-20261105.js, a copy of the
  fleerepair driver with outDir evidence/2026-11-05/perseed-
  stayrecover-a/ and a third policy):
  - B baseline: POLICY=competent (verbatim, all gates default).
  - F fleerepair: POLICY=fleerepair (competent-fleerepair-a.js).
  - R recovery: POLICY=stayrecover (competent-stayrecover-a.js).
- Instrument: the fleerepair instrument (round-1 pending buffer
  included) + ctx recovery counters. Analyzer:
  scripts/stayrecover-analyze-20261105.js (fleerepair summarizer
  shape + recovery fields + approach-loop metric).
- BALANCED PANEL (§15): same reason as the Nov 4 confirm —
  balance-panel.js does not accept a two-corpus comparison and the
  variants are not registry policies; the comparison is the
  pre-registered per-seed table + analyzer aggregates, never a
  fabricated panel compare.

## Pre-registered metrics

CONFIRM replication (F vs B — the Nov 4 confirm bars, unchanged):
1. escapes >= 2 across armed TB exposures, each corroborated by a
   BARRIER CROSSED + "You escape" transcript line (an uncorroborated
   fled exposure fails the bar even at >= 2).
2. median strikes/fight (armed) >= median strikes/fight (baseline),
   all TB exposures.
3. cost bar clean, both halves: (a) starvation deaths armed <=
   baseline total + 2, on totals AND on arm-only (player=true)
   deaths; (b) median survival armed >= 0.8 x baseline median.
A miss on ANY leg is NO-GO for the confirm: the pilot code is
reverted from this branch (competent.js gated change out, variant
deleted) and reported plainly; the recovery half is judged on its
own and does not rescue a failed confirm.

RECOVERY (R vs F — the flee repair is the recovery's baseline,
because recovery ships on it; R vs B is reported too):
4. median ROUNDS SURVIVED in lost TB fights: R > F (target 5 → 8+;
   the bar is direction + the target, judged on the median, not the
   full 4.1x — recovery alone does not owe the whole gap).
5. median strikes/fight (lost fights): R >= F.
6. wave-4 kills (killRows): R > F.
7. eat actually used: recoverEats > 0 across the R leg AND
   recoverKcal > 0 AND median HP restored per eat >= 20 (the bite
   is real, not a no-op counter).
8. cost bar clean for R vs F, same two halves as (3) (starvation
   totals + player-flagged; median survival >= 0.8x).
A miss on (4), (5), (6), or (7) is NO-GO for recovery: the verb
stays off by default (gate stays OFF, variant not used) and the arm
reports the miss with the numbers; the eat verb is NOT deleted from
the branch unless it also breaks the suite — a measured NO-GO is
kept as evidence with the gate off. A miss on (8) alone is NO-GO
for landing the recovery (same treatment).

REPORTED, not judged: wins / national / table / wave-5 unlocked and
faced / median survival / max standing (wall numbers, both legs);
approach-loop metric — fights with 3+ consecutive failed approach
steps without a strike/ability/wait (the confirm's metric-review
ask; instrument records policy branch + intended step target where
the fleerepair instrument already captures it, else reported as
move-only zero-tile turns per fight); escapes per flee-triggered
fight; barrier pushes; zero-tile-move turns per fight.

## Sense-test (pre-registered)

Read transcripts of at least 3 eat turns and 2 flee fights before and
after. Judge meaning: does eating mid-fight read as a person grabbing
food to stay alive, or as a robot pressing a button? Does a repaired
flee read as a person escaping? A repaired flee or an eat that reads
as a silent no-op loop is a sense NO-GO even if the numbers pass.

## Proof (before the R leg; the F leg needs no new code)

- scripts/test-stayrecover-20261105.js: eat verb fixtures (bite
  math, pack debit, cap at maxHp, refusals spend nothing, action
  spent on success, gate-off policy never eats, gate-on policy eats
  in the band and strikes for the kill) + live-harness smoke (a
  hurt fighter in a TB fight eats and the turn advances).
- scripts/test-fleerepair-20261104.js re-run on this anchor before
  the F leg (the Nov 4 proof, unchanged code path — if it fails,
  the confirm replication is already suspect and the panel stops).
- node scripts/check.js --quick after the build (no NEW failures
  vs the 279/11 standing baseline; report the count).

## Calibration gate (run FIRST, as the B leg)

The B leg is the calibration: it must reproduce the current-master
shape on this band (140d death-aware, competent verbatim). No fixed
numbers are asserted — the anchor moved (awayration2 + pantryspoil
landed since the Nov 4 confirm), so the B leg IS the baseline and
no Nov 4 number is cited as one. If the B leg errors (instrument
errors > 0 on any seed, or a leg crashes), the panel stops and the
instrument is fixed before any judged leg runs.
