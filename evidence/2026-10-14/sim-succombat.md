# sim-succombat — ARM 3 "succombat" (scale-onramp, mortality-wall lens)

## Pre-registration (written before the arm sweep; base measured first)

- **Question** (sim-findings #88, open): the mantlebeat arm
  (evidence/2026-10-14/sim-mantlebeat.md) measured that a forced
  barrier-exit flight policy on succession-day fights made things WORSE
  (same-day multi-death runs 5/16 -> 9/16; scholar deaths per 100 run-days
  2.64 -> 5.22): scholars died walking to the edge while the base policy at
  full HP would have fought. Is there a SMARTER fight-back than the base
  policy's generic combat — heal-first, race-aware, party-aware — or is the
  base already optimal there? Sanctuary semantics (whether monsters should
  start fights at haven on succession day) is Steve's design call — this arm
  changes NO engine code, only the policy's response.
- **Lever**: `scripts/policies/succombat.js` — opt-in `SUCCOMBAT=1` layer
  (default OFF) on leadcourt/belongseek. When a fight involves a fresh
  successor (within 2 days of succession, detected via villagerId change):
  (a) run the expedition heal check FIRST before any engagement — pharmacy
  (healing items from the pack, best-fit dose) then healer (field_medicine
  active heal, +20 HP once/daypart), mirroring the engine's combat-survival
  departure heal gate; honest verbs, real costs; (b) fight back only if
  post-heal HP >= 60% AND the race math is not a clear loss (r3's
  fightAssessRace decline rule — knowledge-gated DPR, dead-in-two, 1.3
  margin — PLUS party DPR from living villager allies; the r3 disengage
  fiction is NOT resurrected, the rule only refuses unwinnable races);
  (c) otherwise HOLD — no flee-to-edge; rally the line if allies stand with
  you, strike in place; at the daily level a hurt fresh successor
  (post-heal < 60%) refuses wild tiles — an honest haven hold day
  (eat, drink, rest) instead of ranging out.
- **Primary metric** (AND — both must pass): scholar deaths per 100 run-days
  <= BASE, AND runs with >=1 same-day multi-scholar-death day showing
  strict improvement vs BASE.
- **GO**: on the pooled 16 runs/side (8 seeds x leadcourt/belongseek),
  identical seeds before/after: scholar deaths per 100 run-days <= 1.92
  AND same-day multi-death runs <= 2/16.
- **BASE measured on this tip (a6b392b1), ARM=0** (evidence/2026-10-14/
  sweep-succombat-base.json): pooled n=16 — median survival 112d, national
  10/16, table 0/16, wins 0/16, exiled 0, scholar deaths 37,
  **scholar deaths per 100 run-days 1.92**, **same-day multi-death runs
  3/16**, 48h chain links 5. Per policy: leadcourt medD 110, sd/100d 2.44,
  sameDayMulti 2/8, chains 4, national 6/8; belongseek medD 158, sd/100d
  1.54, sameDayMulti 1/8, chains 1, national 4/8. (Note: this tip's base
  is already better than mantlebeat's 2.64 / 5/16 — the r23
  combat-survival fixes landed in between. The GO bars above are set
  against THIS base, not mantlebeat's.)
- **Guardrails**: median survival within ±10d of base (pooled 112;
  leadcourt 110, belongseek 158); national within ±2 (pooled 10;
  leadcourt 6/8, belongseek 4/8); exiled <= 1 (base 0); table/wins no
  regression (base 0).
- **Horizon**: 180d death-aware (the harness's dead-village stop applies —
  r23 harnessstop).
- **Seeds**: 11/22/33/44/55/66/77/88 x leadcourt/belongseek.
- **Secondary**: 48h combat-succession chain links (a combat player death
  within 2 days of the previous player death — the r23 metric-review item);
  multi-death days per 100 run-days; sc* counters (heal checks, fight-backs,
  holds, rallies, hold days).
- **Metric binding** (MEASUREMENT.md section 14): the above binds. A miss is
  NO-GO, never re-scored mid-run. Metric doubts go under "metric review".

## Canon note

No canon doc covers succession jeopardy (canon manifest checked
2026-10-14; same finding as mantlebeat). Nothing here invents canon. The
engine design question — sanctuary semantics, whether the mantle should
grant a repositioning beat — remains Steve's call (#38/#45, #87).

## Lever played

Built the layer (`scripts/policies/succombat.js`, since DELETED per kill
protocol), proved it (scripts/test-succombat-20261014.js ALL GREEN: RED
gate-off byte-identical on 2×30d runs; GREEN real succession detected via
villagerId change, heal check consumes a first-aid kit honestly for +30,
winnable → fight-back delegates, lost race → hold with no base delegation,
hurt → hold, party-winnable → fight-back, gate-off/non-fresh → delegate,
hurt fresh successor → haven hold day with no travel), then ran the 16v16
sweep: baseline = raw leadcourt/belongseek (SUCCOMBAT unset), arm = wrapped
with SUCCOMBAT=1, seeds 11/22/33/44/55/66/77/88, 180d death-aware. 32 runs,
~15 min compute. Raw output: evidence/2026-10-14/sweep-succombat-base.json
(+ arm.json). Sweep driver: scripts/sweep-succombat.js (degrades loudly if
the layer file is absent — r21b/r23 worker-integrity lesson).

The protocol fired in anger: 70 successions detected, 27 fresh-window
fights intercepted (18 holds, 9 fight-backs), 10 heal checks (3 real heals,
125 HP), 4 haven hold days, 4 rallies.

## Before/after numbers

| | base (16) | arm (16) | GO |
|---|---|---|---|
| scholar deaths per 100 run-days (PRIMARY A) | 1.92 | 1.96 | <= 1.92 — MISSED |
| same-day multi-death runs (PRIMARY B) | 3/16 | 4/16 | <= 2/16 — MISSED |
| multi-death days per 100 run-days | 0.16 | 0.21 | — |
| 48h combat-succession chain links | 5 | 4 | — |
| scholar deaths (total) | 37 | 38 | — |
| median survival (guardrail ±10d) | 112d | 111d | pass |
| national (guardrail ±2) | 10/16 | 11/16 | pass |
| table / wins (no regression) | 0 / 0 | 0 / 0 | pass |
| exiled (guardrail <= base+1) | 0 | 0 | pass |
| max wave | 5 | 5 | — |

Per policy: leadcourt sd/100d 2.44 -> 2.23 (improved), sameDayMulti 2/8 ->
2/8, chains 4 -> 3, national 6/8 -> 7/8, medD 110 -> 110; belongseek
sd/100d 1.54 -> 1.75 (worse), sameDayMulti 1/8 -> 2/8, chains 1 -> 1,
national 4/8 -> 4/8, medD 158 -> 158.

**GO MISSED on both primary conditions — NO-GO. Arm KILLED at pilot.**
Guardrails all pass; the primary metrics fail outright.

## Why (mechanism, probed)

The protocol is honest and fires as designed — but the deaths it targets
are unwinnable by construction at the policy layer:

1. **The remaining same-day doubles are lost races against overwhelming
   threats.** Diagnostic (scripts/diag-succombat-d101.js, leadcourt+sc
   seed 44): the d101 double's second death was a fresh successor at
   **100% HP** facing a **eulogy at 1015/1054 HP** — correctly declined by
   the race math, held in place, died anyway. The next successor wakes
   INTO the same fight at haven and dies too. No policy-side response —
   fight-back, hold, or flee-to-edge — changes a 13-DPR scholar vs a
   1054-HP monster. The threat is the problem, not the response.
2. **The heal check is usually empty-handed.** 70 successions → 10 checks
   (most successors wake ≥70% HP) → 3 real heals. Successors don't carry
   first-aid kits — the death pack stays on the corpse (loot-as-action) and
   the successor is a different villager with their own pack; field_medicine
   is an earned ability, rarely held. The engine's departure heal gate works
   for villagers because the pharmacy is SHARED; the player has no shared
   pharmacy.
3. **Hold vs flee is choreography, not survival, in truly lost races.**
   The hold (18 firings, 115 strikes in place, 4 rallies) dies fighting
   where the base dies walking to the edge (mantlebeat) — the death is the
   same. The d20 hold vs a 152-HP gallowdeer survived, so the hold isn't
   harmful; it's just not sufficient.
4. **Some 'combat' doubles are contests.** Arena deaths report cause
   'combat' (game.js:38653) — outside the protocol's reach entirely
   (e.g. belongseek+sc s11's 139:combat + 139:contest).
5. **The haven hold day is nearly inert** (4 firings) and double-edged:
   when the killer is AT haven, holding at haven keeps the hurt successor
   at ground zero.

The base policy is already optimal at the policy layer for these fights:
when the race is winnable the arm delegates to the base (identical play);
when it's lost, no play survives. The binding constraint is sanctuary
semantics — whether the killer should be able to re-engage the successor
at haven — which is Steve's engine design call (#87), not a policy lever.

## Village assessment

Thirty-two villages, all courtship-road. Median life ~111 days; the wall
numbers didn't move (national 10 -> 11/16, table 0, wins 0, max wave 5).

Who died and why: scholars died overwhelmingly to combat (the eulogy-class
threats at haven, wave-1 ambushes in the wild), then contests. The arm's
villages show the same chained-succession graveyards as the base —
leadcourt+sc s44's d101 double (eulogy), belongseek+sc s22's d108 double.
Villages that lived longest (belongseek 44/77, 180d both arms) reached
national — the courtship road works when the combat lottery doesn't chain.

Villagers acted like people throughout: grief lines, link-shaking on
bearer deaths ("Kai is dead — and the dead hold no treaties. Every link
Haven has shakes."), night raids, the mosquito-naming beat. No robotic
behavior flagged.

## Sense-test: succession-day transcript (seed 33, SUCCOMBAT=1)

Read for meaning — the successor reads as desperate-but-sensible:

- The rally beat: "You plant your feet and ROAR the line back together —
  'ON ME! ON ME!' Fear drains out of their faces. 'THE STRIKE —
  TOGETHER!' They turn as one. (Rally — regrouped, holding, coordinated.)"
  — a human verb, not a stat block.
- The hold-day beat: "You hold at haven today — the wild can wait. Eat,
  drink, mend." — in-fiction, honest about what the day is.
- The village around the succession: "🕯️ Howard Bennett is dead — combat.
  The village stops. Somebody screams. Somebody else starts digging." /
  "The Codex doesn't pause for grief. Minh blinks — and it's already there,
  overlaying everything, syncing." / "🌟 'MANTLE TRANSFER DETECTED. ...Oh!
  New face! Same job!'" — coherent, System-voice in character.

No robotic behavior. The protocol's beats are narrated, not silent.

## Blanks filled / documented

- FILLED: the measurement itself — a heal-first, race-aware, party-aware
  succession-day fight-back protocol was built, proven honest (RED
  byte-identical, GREEN real succession + synthetic fight routing), and
  measured 16v16. Verdict: it does not reduce scholar mortality or
  same-day multi-deaths vs the base policy. The base is already optimal at
  the policy layer for these fights.
- FILLED: the d101 diagnostic names the remaining doubles' mechanism —
  fresh successor at 100% HP vs 1054-HP eulogy, correctly declined, dies
  anyway; the next successor wakes into the same fight. Policy cannot fix
  this; only sanctuary semantics (engine) can.
- DOCUMENTED (append to sim-findings.md): (a) arena deaths report cause
  'combat' — same-day 'combat' doubles can be contest deaths, invisible to
  fight-scoped metrics; (b) the player has no shared pharmacy — the
  departure-heal-gate pattern's pharmacy step is villager-only, so the
  player-side heal check is usually empty-handed (design gap, not a bug);
  (c) the 48h chain metric works (5 -> 4) and should be standard in
  succession-arm sweeps going forward.

## Metric review

The pre-registered primaries behaved as written and the miss is
unambiguous — no re-scoring. Two notes for the NEXT run's metric design
(not this one): (1) the deaths/100d bar (<= base) is a non-regression bar,
not an improvement bar — on a flat result like this one (1.96 vs 1.92) it
reads as a miss by 0.04, which is noise; a future arm should pre-register
an improvement margin (e.g. <= 0.9× base) or a different primary;
(2) the same-day multi-run metric conflates contest/arena deaths with
fight deaths — a future arm should split by cause.

## Convergence

scale-onramp stays the blocking axis. This arm attacked the mortality wall
under it and was killed at pilot: the smarter-fight-back hypothesis is
closed at the policy layer. The engine-side questions (#38/#45 sanctuary
semantics, #87 killer re-engages at haven) remain open for Steve's design
call. `longsims-rotation.txt` stays 3 — the standing directive holds until
scale-onramp reads converged.
