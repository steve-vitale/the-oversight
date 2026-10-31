# sim-sighit-a — PRE-REGISTRATION (written BEFORE any judged sims)

Run: Loop A, oversight-flesh-out-loop, run fleshout-20261031T1315Z,
axis scale-onramp, arm sim-sighit-a. Worktree branch: sim-sighit-a.
Base anchor: recorded by the fixture script in every corpus file
(last commit touching src/, the spearxbow-a anchor rule — stable
across script/evidence-only commits).
Substrate: FORCED-MEETING FIXTURE BAND through the real
Game.fieldFight, in the spearxbow-a style, not a live sim band.
DIAG ONLY: zero src/js changes, zero policy-default flips, zero
edits to existing policy files. The signature-isolation leg
monkeypatches Game.sigW4FieldMonster inside the fixture process
only (it still calls the original, so RNG draws and side effects
such as audit tax and sig narration are preserved, but returns
the pre-signature total): a measurement instrument, never a
default change, never a src edit, never shipped.

## Question (from the spearxbow-a backlog, ranked next arm 2)

Spearxbow-a priced the ranged slot (XBOW median total 118, the
only tier clearing the #1369 57.25 DPR yardstick) and still got
0 kills/drive-offs in 156 confirm fights, all ending vFlee in a
median 2 rounds. Partyvolley-b/spearxbow-a reported single
congregation/eater hits landing ~2x their base ranges
(112-145 observed vs base 45-75). This arm asks: does the
monster signature hit, not the ranged slot, cap fight rounds —
and by how much, at the party scale spearxbow-a actually
measured (leader + 1 from-start ally, best earnable armor)?

## What prior work already settled (reconciliation, not re-proof)

- sim-spearxbow-a (2026-10-31, SPEAR:GO + XBOW:GO): P2,
  machete + crude_bow + 8 arrows + hide_armor leader, unarmed
  from-start ally, 3 beasts (congregation 1000 HP, eater 1050,
  audit 1200), 12 confirm streams 201-212: median rounds 2 in
  every tier, 0 kills/drive-offs, vDie 0 (hide armor converts
  deaths to flees at this party scale). This arm reuses that
  exact BOW-tier party shape as its baseline leg, on fresh
  sweeps in THIS worktree — never judged against spearxbow-a's
  corpus, whose base differs.
- Code read (src/js/sigW4.js sigW4FieldMonster, src/js/
  fieldFights.js monster phase, src/data/monsters.json —
  function names are the citation, line numbers drift):
  - The monster phase rolls ONE attack per live pack member
    from the multi-move kit filtered to entries with damage,
    honoring hpBelow/hpAbove only (cooldownTurns and
    firstTurn are NOT honored), `d = lroll(rDmgRange)`, then
    passes `total` through sigW3b (a no-op for wave-4 ids:
    it returns ctx.total unless id is spool/chorus_line/
    terms_of_service), then sigW4FieldMonster, then armor
    (leader only; ally hits take no armor), then wornDamage,
    then the log line `R<round>: <atk> hits <name> for
    <total>`. The wrapper therefore records, per monster
    attack call, the pre-signature total (the base roll, as
    passed in) and the post-signature total (as returned),
    so sig delta = returned − incoming, per call.
  - Congregation: on round % 3 === 1 it ADDS lroll([50,70])
    (the beam) on top of the generic roll, unless a theology
    trick was argued the round before (no trick is staged
    here, so the beam always fires on beam rounds).
    Predicted beam-round pre-armor total for Absolution
    [50,70] = [100,140]; Excommunication [42,62] is legal
    only below 50% beast HP, which a 2-round party fight
    essentially never reaches.
  - Eater: EVERY round it ADDS lroll([45,75]) + floor(round/2)
    *15 growth. Predicted round-1 pre-armor total: Gorge
    [45,75] -> [90,150]; Smack-Rush [55,85] -> [100,160].
  - Audit: on round % 3 === 0 it taxes the VILLAGER's strike
    (rec.auditTaxRounds = 2) and adds NOTHING to monster
    damage. Predicted sig delta 0 on every round. Audit is
    the CONTROL beast: if audit sig deltas are non-zero,
    the wrapper/attribution is broken, not the beast.
  - Suburb (the fourth beast, new to this band): on odd
    rounds it ADDS lroll([35,55]) (Property Tax for
    resisting). Predicted odd-round pre-armor total:
    Property Tax [35,55] -> [70,110]; HOA Fine [28,44] ->
    [63,99]. Suburb HP midpoint 1400 (def range 1300-1500),
    pierce 0.2 (vs congregation 0.3, eater 0.35, audit 0.4).
  - Pack: none of the four beasts has a pack field, so
    exactly ONE member acts per round: one monster hit per
    round, no pack doubling.
  - Armor (leader only): hide_armor protection 20, effP =
    20*(1−pierce), absorbed = min(total−1, round(total *
    effP/(effP+20))). So a signature delta D survives armor
    at roughly (1 − effP/(effP+20)): congregation ~59%,
    eater ~61%, audit n/a, suburb ~56%. Ally hits take the
    FULL delta (no armor). The paired MAIN-vs-NOSIG fight
    comparison therefore measures the signature's effect
    THROUGH armor and ally-share, which is the question —
    not the raw delta alone.
  - Leader: boris_kowalski (steady, iron_stomach = food-only,
    no fieldFight effect), age 35, health 100, exactly the
    spearxbow-a fixture leader. Ally: the first other roster
    NPC, unarmed, from-start (co-presence channel, "already
    at the door" — the only sensed channel this fixture
    uses; no roster/list-fed decision anywhere).

## The fixture band

One harness load (scripts/sim-harness.js loadGame + setupGame,
seed 4242 — the volleyfix/partyvolley/spearxbow fixture seed).
Before EVERY fight the script restores: each staged villager's
record in place, the FULL Game.state from a deep snapshot,
and exactly the fixture gear (the spearxbow-a pattern, so
nothing accumulates across fights). Each fight calls the REAL
Game.fieldFight with a fresh beast entity { hp: midpoint,
maxHp: midpoint }, no awareness (forced meeting), opts.rng =
mulberry32(stream), opts.allies = 1, opts.allyVids = [ally],
opts.allyFromStart = true.

Party shape (both legs, all beasts): P2-BOW — leader machete
+ crude_bow + 8 arrows + hide_armor; ally unarmed. The ONLY
varied factor between legs is the signature component.

Legs (paired on identical streams):
- MAIN: signature live (baseline; a fresh baseline sweep in
  this worktree on identical seeds).
- NOSIG: wrapper calls the original sigW4FieldMonster (same
  RNG draws, same side effects incl. audit tax and sig
  narration lines) but returns the pre-signature total.
  Caveat, stated up front: in NOSIG fights the sig narration
  lines still appear (beam/gorge/tax announced) while the
  damage is not added — the NOSIG log is therefore NOT
  honest narration by construction, and is never used for
  sense-testing. Sense-testing reads MAIN-leg transcripts
  only. The MAIN-vs-NOSIG damage/rounds comparison is
  unaffected: the narration lines carry no damage.

Beasts (midpoints as spearxbow-a, plus suburb):
- congregation 1000 HP, speed 2, pierce 0.3
- eater 1050 HP, speed 4, pierce 0.35
- audit 1200 HP, speed 2, pierce 0.4 (control: delta 0)
- suburb 1400 HP, speed (def), pierce 0.2

Per-hit record (every monster attack call, all rounds until
the fight ends): beast, stream, leg, round, attack name
(parsed from the hit log line, matched to wrapper calls in
order within the fight), base band for that attack (from
src/data/monsters.json), pre-signature total (wrapper
incoming), post-signature total (wrapper returned), sig
delta, final hit damage (log line, post-armor/post-worn),
target (leader/ally), leader/ally HP after the hit.
Per-fight record: beast, stream, leg, rounds, outcome,
volley damage (context only), total damage dealt, vTaken,
allyTaken, leader HP left, ally HP left, ally down flag,
from-start join flag, and the full log.

## Staged plan

PILOT (4 beasts x 2 legs x 8 rng streams 101-108 = 64 fights).
Pilot gate (all must pass, else stop: killed-at-pilot, no
confirm, no re-score):
- P1 (mechanism): from-start ally joins on >= 90% of pilot
  fights (log line "already at the door").
- P2 (mechanism): every pilot fight yields a per-hit record
  for every monster attack call (wrapper call count ==
  hit-log-line count; no fight throws, no missing line).
- P3 (mechanism): congregation and eater pilot MAIN fights
  show sig delta > 0 on >= 90% of their monster hits that
  fall on a sig-add round (congregation round % 3 === 1,
  eater every round, suburb odd rounds), and audit pilot
  MAIN fights show sig delta == 0 on 100% of hits (control
  integrity). Pilot damage medians are NEVER a gate and
  NEVER pooled into the confirm.
CONFIRM (if the pilot gate passes; judged on the confirm
sample alone, pilot numbers reported separately, never
pooled): 4 beasts x 2 legs x 12 rng streams (201-212) = 96
fights.

DETERMINISM GATE (binding, both stages): the fixture script
run twice produces byte-identical corpus files (no timestamps
or timings written). A det-gate failure voids the run,
whatever the damage numbers say.

## Pre-registered GO thresholds (judged exactly as written)

PRIMARY METRIC: paired rounds-to-outcome + leader survival,
MAIN vs NOSIG, confirm sample alone (pairs = same beast +
same stream, 48 pairs).

Verdict DIAG-GO ("the signature hit caps fight rounds at
party scale") iff ALL of:
- R1: pooled median rounds NOSIG >= MAIN median rounds + 1.
- R2: pooled mean paired delta rounds (NOSIG − MAIN) >= 0.5
  rounds (i.e. removing the signature buys at least half a
  round on average across the 48 pairs).
- R3: pooled median leader HP left NOSIG >= MAIN median
  leader HP left + 10 (the extra rounds are bought with
  health, not with a flee-rule artifact alone).
Verdict DIAG-NO-GO iff any prong misses (a miss is NO-GO,
never re-scored against a friendlier metric mid-run; doubts
go under "metric review" for the NEXT run). A NO-GO here is
a substantive answer, not a failure: it would mean that at
the spearxbow party scale (hide armor + ally share), the
signature component — however large raw — does NOT cap
rounds, and the 2-round vFlee wall sits elsewhere (morale
flee rule, damage race, or the 2-fighter engine cap).

Per-beast cap (reported, never promoted to judge): median
rounds MAIN vs NOSIG and mean paired delta rounds per beast;
a beast counts as "round-capped by its signature" in the
report iff its median rounds rise by >= 1 AND its mean
paired delta >= 0.5 on that beast alone.

SECONDARY (reported, never promoted to judge):
- Per-monster single-hit distributions (MAIN leg, confirm):
  per beast, median/range of pre-signature totals, sig
  deltas, and post-signature pre-armor totals; share of
  hits whose post-signature pre-armor total exceeds the
  logged attack's base band top; share of hits with sig
  delta > 0, by beast and by sig-add vs non-sig-add round.
- Per-beast base-band fidelity: share of NOSIG pre-signature
  totals inside the logged attack's base band (a low share
  would implicate an unmodeled layer, e.g. sigW3a or a
  bonus, and is reported as an unexplained layer).
- Fight outcomes per leg: vDie / vFlee / mFlee / vKill mix,
  ally-down rate, median total damage dealt, median DPR,
  median leader/ally HP left, per beast and pooled.
- Signature share of incoming damage: per beast, median
  over fights of (sum of sig deltas) / (sum of pre-signature
  totals + sig deltas) across that fight's monster hits.
- Instrument check: audit NOSIG-vs-MAIN fights must be
  near-identical on monster hits (delta 0 predicts identical
  hit records except where the audit tax interacts with
  strike timing); any audit divergence is named, not
  assumed away.

## Horizon, policies, wall numbers, panel

- Horizon: NOT APPLICABLE. Fixture fights are not sim days;
  death-aware horizons apply to live sims, and the reason
  the fixture band is the right instrument here is that the
  question is per-hit damage arithmetic and rounds-to-
  outcome through the real fight engine with the signature
  component isolated, which a live sim cannot isolate
  (awareness, party, armor, and morale would all confound
  the hit record).
- Policies: NONE. No policy drives a fixture fighter.
- Wall numbers (national / table / wins / wave reach): NOT
  OBSERVABLE on this substrate, stated structurally, not as
  0s. A fixture band has no village trajectory, no scale
  ladder, and no win flag. The wall relevance is the bound
  this band establishes: how many rounds, and how much
  leader health, the wave-4 signature component costs at
  the largest party fieldFight can field, in the best
  earnable armor — i.e. whether the signature is the
  round-cap the spearxbow band hit, or whether removing it
  still leaves the 2-round vFlee wall standing.
- Panel (§15): NOT APPLICABLE, and none fabricated.
  scripts/balance-panel.js is a policy-comparison driver:
  it runs registry policies on ONE frozen root and compares
  panel outputs. It cannot express this arm's substrate (a
  forced-meeting fixture band with no policy, no sim days,
  and a paired instrument leg as the comparison) and it has
  no fixture mechanism. The judge is the pre-registered
  fixture comparison + determinism gate above (same
  rationale as sim-volleyfix-b / sim-partyvolley-b /
  sim-spearxbow-a).

## Sense-testing

Read at least one full MAIN-leg party-fight transcript per
beast and judge whether the fight reads as people fighting
together (ally named and entering through the co-presence
channel, strikes accounted for, the signature beat narrated
as its own event — a beam rung, a gorge, a tax announced —
vs one inflated number with no legible second event), not
just counts. NOSIG transcripts are excluded from
sense-testing by construction (see the narration caveat
above).

## Metric review (for the NEXT run, never a re-score of this one)

Doubts about the metrics above go here in the evidence file
after the run; they do not change this run's verdict.
