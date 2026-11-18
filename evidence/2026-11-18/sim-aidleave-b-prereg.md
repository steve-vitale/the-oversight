# Pre-registration — sim-aidleave-b (Loop B run fleshout-loop-b-20261118T1430Z, axis: winnability chain)

Committed BEFORE any judged sweep. Judge strictly against this file; a miss
is NO-GO / DIAG-NO-GO, never re-scored against a friendlier metric mid-run.
Metric doubts go under "metric review" in the evidence file, for the NEXT run.
This is a DIAG arm: NO src/js game change. The build shape that follows from
the numbers (aid path consults the trick-hold, or leave-hit intended) is a
Steve-call.

## Canon (read first)

- docs/CANON.md: no canon doc covers field-fight flee or the aid-path
  crisis fight (same finding as the fleerepair3-b prereg).
- docs/MONSTER-WAVES.md (Wave 4): "The Suburb (comfort as a trap —
  you don't kill it, you ESCAPE it)". src/data/monsters.json, suburb
  entry: weaknesses "you can't kill it — LEAVE. Navigation is victory;
  the fight is a timer".
- src/js/fieldFights.js villagerTrickAction: `mid === 'suburb' &&
  fctx.round === 1` returns `{type:'leave', why:'suburb-leave'}` when
  the village knows the trick; the trick branch sets
  `rec.outcome='vFlee'; rec.fleeWise=true` with the line "you can't
  kill a suburb. They walk out. (Navigation is victory.)"
- src/js/comms.js aidFight: the crisis fight with arrived allies as REAL
  combatants — it calls `this.fieldFight(vid, mdef, m, opts)` directly
  (allyFromStart + foreignAllies when help is at the door). The aid path
  is the SAME fieldFight engine as the expedition/world-tick paths; it
  is not a separate fight implementation. Callers: resolvePatrol /
  resolveWildMonsterEncounter in game.js route a LINGERING raider
  fight here while an aid crisis is open.
- src/js/win-plan.js winPlanFightGate (the expedition gate's SEEK
  path): the TRICK-HOLD — a wave-4 beast whose trick the village has
  NOT learned is not a veteran-seeking fight; the gate withholds forced
  contact (returns null, `trickHolds` bump) and the seek opens only
  once the trick is learned (two observations teach it). Note the
  direction: the hold fires when the trick is UNKNOWN. A trick-KNOWN
  target is never held by this gate — the gate cannot save a
  trick-known meeting. Any aid-path consult of the trick-hold for
  trick-KNOWN meetings would be a NEW rule, not the existing gate.

## The finding under diagnosis (#2540, from finding #2539/#2540)

Evidence `evidence/2026-11-18/sim-wildavoid-rejudge-a.md`, seed 104417,
days 94–98, seven aid-path Suburb meetings: `trickBefore` true and
`fleeWise` true on all seven on BOTH legs (the village knew the
leave-trick and did the wise round-1 leave each time), yet each meeting
still took 13–25 damage and a wounded villager died to a 17-damage hit
on day 98. "The leave-trick does not make the leave free on the aid
path." The 1015Z "pre-learning mauling" story is contradicted by the
corpora.

## Candidate mechanisms

| Candidate | How it would show |
|---|---|
| (A) Parting hit (the #2500 defect, shared by all fieldFight callers) | Aid trick-known wise leaves are leave-first in the log (leave line before the first hit line) with vTaken > 0 on the ctl leg, and go to vTaken 0 on the FLEEREPAIR3=1 leg. The aid path needs no separate fix — FLEEREPAIR3 already covers it. |
| (B) Monster-first hit (legitimate, preserved by design) | The hit line precedes the leave line; vTaken > 0 on BOTH legs. The leave is still correct; the damage is the price of losing initiative. |
| (C) Aid-path-specific second hit source | Aid trick-known wise leaves still take damage on the FLEEREPAIR3=1 leg with the leave line first and no earlier hit — damage the expedition fix does not reach. Then the aid path needs its own build shape (Steve-call). |
| (D) No phenomenon on the fresh band | Fewer than 5 aid trick-known Suburb wise leaves across the fresh ctl leg AND the archived chain cannot be re-scored — unjudgeable on this band. |

The fleerepair3-b evidence already shows parting hits 13 → 0 across
ALL origins on band 103601–103608, which favors (A) — but that panel
never cut the numbers by origin, and the #2540 chain lives on the
wildavoid band (104411–104418) under a different substrate
(FLEEREPAIR2=1). This arm measures the aid cut on that band.

## Pre-registered metrics (DIAG bars)

- PRIMARY D1 — **aid-path leave damage with the trick known, ctl vs
  arm**: aid-origin, mid 'suburb', trickBefore true, fleeWise true,
  rounds 1. Report per leg: n meetings, vTaken total / mean / median /
  max, parting-hit count (classifier below), monster-first count,
  wise-leave deaths (fleeWise && outcome vDie) attributable to the
  leave-hit (parting-hit deaths vs monster-first deaths). Per-seed
  counts + damage distribution in the evidence file.
  **Calibration gate (frozen): the control leg (fresh ctl OR the
  archived wildavoid ctl corpus on the same seeds) must show >= 1 aid
  trick-known parting hit; if 0 on both, D1 is UNJUDGEABLE.**
- D2 — **mechanism classification**: every aid trick-known Suburb
  wise-leave meeting on the ctl leg is classified parting-hit /
  monster-first / clean by log order (same classifier as
  analyze-fleerepair3-b.js: leave line "reads the sterile streets"
  vs first hit line "hits … for N"). Verdict states which of (A)/(B)/
  (C) the damage is, with the share of total damage per class. A
  mechanism verdict requires the classified meetings to cover >= 80%
  of the ctl leg's aid trick-known wise-leave damage.
- D3 — **known vs unknown contrast (ctl leg)**: aid-origin Suburb
  wise-leave damage per meeting with trickBefore true vs false. (The
  leave is only available when known; unknown meetings are the
  learning-path baseline — multi-round fights, morale flees.)
- D4 — **staged harness probes** (probe only, no game change):
  - P1 (live): staged aid-shaped fieldFight (allyFromStart +
    foreignAllies, trick known, Suburb), FLEEREPAIR3 OFF vs ON, same
    rng seed: vTaken drops to 0 with outcome still vFlee / fleeWise /
    rounds 1 / mDealt 0 — proving the FLEEREPAIR3 break covers the
    aid path's fieldFight call.
  - P2 (counterfactual re-score on the ctl corpus): re-score every
    aid trick-known Suburb wise leave as "avoided by a trick-hold
    consult" (damage 0, no death) and report the saved damage and
    saved deaths — the UPPER BOUND of what an aid-path trick-hold
    consult would buy beyond FLEEREPAIR3.
  - P3 (gate check, corpus-level): `winPlanStats.trickHolds` on the
    band vs aid trick-known Suburb meetings — confirming the existing
    gate holds only trick-UNKNOWN seeks and never touches a
    trick-known aid meeting.
- D5 — **wall numbers** (both legs, reported not judged): wins,
  national standing (>= 200) / national rank, table, wave-4 unlock,
  wave-5 unlock, median survival.
- Instrument: 8/8 files both legs, 0 instrument errors, missingHp 0
  on fought non-kill rows, seed sets match (104411–104418), analyzer
  selftest green, proof test green
  (scripts/test-aidleave-b.js on the final tip).
- Panel (§15): scripts/balance-panel.js compare on the panel corpora
  built from the two fresh legs; the compare .md is attached to the
  evidence file; no uninvestigated regression.

**Verdict: DIAG-GO iff instrument clean AND calibration gate met AND
D2 classifies the mechanism AND D1/D3/D4/D5 are reported with per-seed
counts, damage distribution, and deaths. DIAG-NO-GO iff the instrument
is dirty or the calibration gate fails. A miss on any bar is not a
re-score. The verdict names the mechanism (A, B, C, or a mix with
shares) — it does NOT pick the build shape; that is a Steve-call.**

## Design (seeds, policy, horizon, instruments)

- Band: **104411–104418** (8 seeds, frozen — the wildavoid band, home
  of the 104417 chain). This band IS the pilot; confirm (12–16 seeds)
  only on a pilot DIAG-GO that needs a population number.
- Horizon: 150d death-aware. Policy: competent verbatim
  (scripts/policies/competent.js).
- Legs (BOTH fresh, on the current tip, identical seeds):
  - ctl: VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1, FLEEREPAIR3
    unset. This is the substrate the #2540 chain was observed under.
  - arm: ctl + FLEEREPAIR3=1.
- Substrate justification: FLEEREPAIR2=1 both legs matches the
  wildavoid band (the finding's home substrate), so the fresh ctl is
  comparable to the archived `perseed-wildavoid-a-ctl` corpus; the
  ONLY difference between the fresh legs is FLEEREPAIR3, so the
  ctl→arm contrast measures exactly the parting-hit contribution on
  the aid path. FLEEREPAIR3=1 on the arm leg isolates aid-path numbers
  from expedition parting hits the same way it isolates every other
  fieldFight caller — the aid path routes through fieldFight, so the
  flag reaches it; P1 stages that directly.
- Cross-check (reported, not judged): fresh ctl vs archived
  `perseed-wildavoid-a-ctl` (same seeds, same substrate, older master)
  — trajectory stability; the archived corpus carries the 104417 chain
  and is re-scored by the analyzer as a second control.
- Instruments (new files, distinct names — never modify shared
  analyzers): scripts/aidleave-driver-b.js (fleerepair3 driver copy:
  same recorder — rows already carry origin + trickBefore + fleeWise
  + log + vTaken; MODE/env validation for THIS contrast:
  FLEEREPAIR2=1 required both legs, FLEEREPAIR3=1 iff arm),
  scripts/analyze-aidleave-b.js (aid-origin Suburb cut + D2
  classifier + P2 counterfactual re-score + P3 gate check + wall
  numbers), scripts/build-aidleave-b-panels.js (panel builder copy).
  Proof: scripts/test-aidleave-b.js.
- Reproduction (unit-level, in the proof test): staged aid-shaped
  suburb fight with a trick-knowing villager — flag OFF: leave-first
  + vTaken > 0 (parting hit present); flag ON, SAME rng seed:
  outcome still vFlee, fleeWise, rounds 1, mDealt 0, vTaken 0;
  monster-first staged fight: vTaken > 0 on BOTH legs; trick-unknown
  villager: fights multi-round, flag changes nothing; analyzer on
  synthetic legs: aid-known cut, classifier, judgeD1 calibration,
  P2 re-score arithmetic.
- BALANCED PANEL (§15): before/after through scripts/balance-panel.js
  compare on the panel corpora; the compare .md is attached to the
  evidence file.
- PILOT GATE: 8 seeds (this band) before ANY confirm spend.

## Sense-test (pre-registered)

Read the 'leave' lines and the aid-crisis say lines in both legs.
Judge meaning: on the arm leg a wise leave must read as a person
walking out of a street unharmed — the leave line with NO monster hit
after it — while the crisis itself stays open for a better-equipped
responder (the beast stays in the world; the door is not magically
safe). A fixed run whose leave lines still show a hit afterwards is a
sense NO-GO even if the numbers pass. Before the trick is known, the
same villagers must still stand and fight the Suburb for rounds and
flee wounded (the learning path), unchanged. The aid meeting must read
as a response to a call for help, not a random stroll — the party came
because Haven asked.
