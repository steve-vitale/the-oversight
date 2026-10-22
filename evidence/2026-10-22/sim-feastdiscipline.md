# sim-feastdiscipline — threat-driven armed-feast staging (axis scale-onramp)

Run: fleshout-20261022T1215Z (flesh-out loop) — arm sim-feastdiscipline.
Policy files: scripts/policies/feastdiscipline.js (FEASTDISC=1, zero src/js),
scripts/diag-feastdisc-20261022.js (spike DIAG instrument),
scripts/test-feastdiscipline-20261022.js (proof gates),
scripts/sweep-feastdisc-20261022.js (pilot sweep).
Anchor: d64fcee1b (worktree sim-feastdiscipline; stagemuster landing
b73e4751e/b9a0e3574 not in this tree — policy-only delta, zero src/js).

## THE BIND (finding #794)

The drivenofeast decomposition killed the drive-without-feast theory:
companion wave-4 kills rode the FEASTED x2.53 multiplier; drive-without-feast
produced effectively zero genuine villager kills. This arm asks the named
next: can a policy-stage feasts AHEAD of wave-4 engagements so companions
fight feasted more often?

## DAY-1 SPIKE: can the policy API express it? (DIAG)

YES. Established before any sims:
- Game.hostFeast() is haven-gated, 1/day, real pantry cost (min 1500 kcal),
  costs 48 ticks, callable from a policy at ANY dayPart (no engine dayPart
  gate — feastseek's dusk timing is policy choice, not engine law).
- The FEASTED buff requires the devotion gate (scholar.prog.feastSurge,
  armed by the base's keepsake channeling) and lasts 2 dawns.
- Seatblow-open (Steve 2026-10-17, decisions #441/#445): a villager
  fighter's own blow carries the feast when the village is feasted — the
  companions need not sit at the fire.
- The armed feast's smoke draws a wave-appropriate scavenger to the
  haven's edge (feast_draw, chance 1.0), which the base policy faces
  (competent.js) — the feast can MANUFACTURE the engagement inside its
  own window (the Sigrun/d110 Algorithm kill in sim-armorydrive-confirm.md
  came through exactly this route).
- Threat detection is policy-visible: Game.monsterAt over
  Game.travelTargets (the stagemuster patrol's own read).

DIAG corpus (scripts/diag-feastdisc-20261022.js, 6 fresh seeds 66011-66016
x {leadfeast,belongfeast}, AD.armedFor control, 150d):

| seed | base | days | armedFeasts | w4 engagements | w4 feasted | gap median (days, last armed feast -> engagement) |
|------|------|------|-------------|----------------|------------|---------------------------------------------|
| 66011 | leadfeast | 105 | 3 | 7 | 0 | 27 (gaps 14-32) |
| 66011 | belongfeast | 95 | 8 | 11 | 0 | 10 (gaps 5-11) |
| 66012 | leadfeast | 146 | 16 | 6 | 0 | 1 |
| 66012 | belongfeast | 113 | 14 | 16 | 7 | 2 |
| 66013 | leadfeast | 142 | 15 | 11 | 1 | 11 |
| 66013 | belongfeast | 111 | 10 | 10 | 4 | 8 |
| 66014 | leadfeast | 54 | 6 | 5 | 0 | 7 |
| 66014 | belongfeast | 80 | 12 | 7 | 2 | 8 |
| 66015 | leadfeast | 138 | 3 | 5 | 0 | 60 (feast desert d70+, gaps 58-63) |
| 66015 | belongfeast | 113 | 12 | 10 | 0 | 7 |
| 66016 | leadfeast | 103 | 8 | 7 | 2 | 3 |
| 66016 | belongfeast | 125 | 9 | 10 | 4 | 1 |

(raw corpus: evidence/2026-10-22/perseed-feastdisc-diag/)

Headline: 108 wave-4 engagements, 20 feasted (18.5% natural conjunction).
Feast deserts of 14-63 days while wave-4 engagements continued
(s66015-leadfeast: no feast after d70, engagements at d128-133, gaps
58-63d; s66011-leadfeast: gaps 14-32d). The base's 7-day armed-feast
cadence does not aim at engagements; the 2-dawn window rarely covers them.
The timing gap is real and measurable. KILL-FAST not triggered (the
mechanism is expressible AND the gap exists).

## PRE-REGISTRATION (§14 binding — written BEFORE the pilot sweep)

- Design: 8 FRESH seeds (66021-66028, filename-verified 2026-10-22) x
  {leadfeast, belongfeast} x {control, feastdisc} = 32 paired configs,
  180d death-aware (dead villages stop simulating; the harness breaks on
  Game.over), on the proven non-seat long substrate: FEASTSCALE_R13=1
  TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1
  (VETREL/REPOSITION/VGEAR unset).
- control = AD.armedFor(base), ARMORYDRIVE=1 (weapons in hands + fire-side
  staging — the proven baseline).
- feastdisc = FD.disciplinedFor(base) = withFeastDiscipline(AD.armedFor(base)),
  ARMORYDRIVE=1 + FEASTDISC=1.
- PRIMARY (mechanism, binding): armed wave-4 villager kills (sim-killtime
  metric, same as armorydrive for comparability; REPORT damage-majority
  numbers alongside) >= control+2 AND >=2/8 seeds. GO = met.
- KILL-FAST: if the layer stages zero feasts in the pilot (mechanism never
  fires) — close as evidence, do not advance.
- GUARDRAILS (all binding): median survival >= control-10d (non-winning,
  per-seed matched); no new death mode (>= 2-event rule); starvation
  deaths <= control+3.
- A miss is NO-GO — never re-scored mid-run (§14). Metric doubts go under
  "metric review" for the next run.
- Instruments: KILLDISC=1 v2 + daily bearer census (kill-time attribution)
  + feast-staging census (armed feast days, feasted status at each wave-4
  engagement) + FD.tele layer counters. Before/after through the balanced
  panel (scripts/balance-panel.js) per §15 — env-gated levers make the
  automated compare invalid by construction (per sim-findings.md); both
  panels built, §15 status noted, manual paired-row comparison attached.

## Proof gates (run BEFORE the pilot — scripts/test-feastdiscipline-20261022.js)

E0 shape (policy shape, exports, unknown-base throw); E1 det-gate
(FEASTDISC unset -> disciplinedFor byte-identical to AD.armedFor, 60d x2
bases, ARMORYDRIVE=1 both sides, tele untouched); E2 env-gate; E3 22
synthetic RED->GREEN fixtures (fires / one-pass-per-day / next-day-refire /
no-threat / wave-3-only / unarmed / already-feasted / off-haven /
wrong-dayPart / in-combat / window-closed pre-wave-4 / window-closed vets-
met / pantry buffer / plan refusal / hostFeast refusal / base.upkeep
delegation / missing base.upkeep / gate-off beat silence / gate-off upkeep
pure delegation); E4 armed determinism (60d, same seed twice); D2 180d
armed run completes + deterministic re-run.

RESULT 2026-10-22: **ALL GREEN** (exit 0), on
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
ARMORYDRIVE=1. (Operator note: running with FEASTDISC=1 pre-exported makes
the proof STOP by construction; the proof sets the gate itself.)

## PILOT RESULTS (32 configs, 180d death-aware)

Control = AD.armedFor, armed = FD.disciplinedFor, both ARMORYDRIVE=1.

### Primary (kill-time villager wave-4 kills — binding): GO

- Control: 2 kill-time villager kills on 2/16 configs (s66022-belongfeast
  Fatima, s66027-leadfeast Benoit).
- Armed: 5 kill-time villager kills on 5/16 configs (s66022-belongfeast
  Fatima d81, s66024-belongfeast Valeria d52, s66027-belongfeast Elif d78,
  s66027-leadfeast Bauyrzhan d78, s66028-leadfeast Kahukura d178).
- Verdict: 5 >= control+2 (4) AND 5/8 seeds >= 2/8. **GO.**

### Damage-majority (reported alongside per pre-reg): FLAT

- Control: 1 damage-majority (>=50% non-scholar damage) kill (Benoit 0.53).
- Armed: 0 damage-majority kills. Armed kill shares: 0.34, 0.27, 0.47,
  0.46, 0.20 — ALL scholar-majority.
- Honest read: the layer manufactures feasted engagements and raises
  kill-time villager kills 2 -> 5, but companions contribute 20-47% of
  the damage — the scholar's blade still closes. Every armed kill landed
  on a FEASTED engagement (5/5 feasted=True at entry).

### Mechanism (did the layer fire?): YES

- Layer-staged feasts: 78 across 16 armed configs (tele.feastsStaged).
- Feasted-engagement rate: 33/86 (38.4%) armed vs 8/80 (10.0%) control —
  the layer raises the conjunction 3.8x.
- Total feasts: 200 armed vs 123 control (the layer preempts the 7-day
  cadence with threat-driven extras, pantry buffer kept).

### Guardrails: ALL PASS

- Median survival: 111.5d armed vs 119.0d control — delta -7.5d, within
  the >= control-10d bar. Paired diffs median 0.0 (range -66..+21).
- Starvation deaths: 12 armed vs 13 control (<= control+3).
- No new death mode: every cause on both arms; the single "Big Big"
  event is below the 2-event rule. Villager combat deaths paired median
  diff 0.0; scholar combat deaths paired median diff 0.0.

### §15 balanced panel: built, noted, manually judged

- feastdisc-panel-primary-before/after.json.gz + .md built from the
  sweep corpora (scripts/build-feastdisc-panels-20261022.js).
- Panel decision: review_required; leadfeast playerDeaths
  regression_signal (delta +3.5/run, ci [1.25, 7.125]).
- §15 STATUS: the intervention is env-gated (FEASTDISC=1 on the armed arm
  only); per sim-findings.md the automated compare is invalid by
  construction — the manual paired-row comparison is the judging
  instrument (attached above).
- Investigation of the panel signal: the panel's "playerDeaths" maps the
  sweep's all-cause `combat` bucket (villagers included), not player
  deaths. Manual paired checks: scholar-combat-death diffs median 0.0
  (range -3..+3); villager-combat-death diffs median 0.0. The +15
  outlier (s66026-leadfeast-armed, 49 vs 34 combat deaths) tracks 9
  extra wave-4 engagements + 9 extra days with villager combat deaths
  identical (7/7) — engagement volume, not a new death mode.

## Sense test (SENSE-TESTING LAW) — PASS

Re-ran s66028-leadfeast-armed deterministically, dumped the d170-181
narration window (scripts/sense-feastdisc-20261022.js):

- d178: "Sami opens the pantry wide" (armed feast, -1,500 kcal) ->
  "FEASTED x2.03 until tomorrow's dawn" -> "The Algorithm is circling
  the edge of the light. It followed the feast here." (feast draw) ->
  faced -> "FEASTED x2.03: Kahukura's blow carries the feast" on every
  companion blow -> "The Algorithm falls" -> System on camera:
  "Kahukura just put down The Algorithm... on CAMERA. That's a veteran
  kill, folks. REMEMBER the name."
- The pantry voice is coherent ("The racks are already full (7,784 kcal
  kept — more than the haven can eat before it turns)"); Kahukura reads
  as a person (cook duties, mentoring, scar-comparing with Maximo).
- The mechanism is narrated, consequential, and engine-honest — a
  threat-driven feast, a drawn scavenger, feasted companion blows, a
  televised veteran kill. SENSE-PASS.

## Village assessment (plain words)

Villages on the armed stack live ~112 days, reach national 7/16, sit the
table 12/16, and unlock wave 5 on 3/16 (vs 1/16 control) — the long-
substrate shape is unchanged. The fire is busier: 200 feasts vs 123, and
the feast's smoke keeps drawing wave-appropriate scavengers to the
haven's edge. Companions fight feasted nearly 4x as often (38% vs 10%
of wave-4 engagements). The cost is pantry kcal spent honestly (buffer
kept, starvation flat) and a busier fight calendar — more wave-4
engagements overall (86 vs 80), which is where the combat deaths come
from. Nobody starves for the fire; nobody dies a new kind of death.

## Metric review (§14)

The pre-registered primary (kill-time) proved right and binding: it
measures the conjunction the arm manufactures (feast -> feasted
engagement -> villager-credited kill). The damage-majority flatline
(0 vs 1) is the honest caveat the next run should carry: consider
PROMOTING damage-majority to the primary at confirm scale (12-16 seeds),
or pre-registering a companion-damage-share threshold, since the layer's
theory is companion CAPABILITY, not kill-credit. Not applied to this
run's verdict per §14.

## Wall numbers (scale-onramp)

| arm | national | table | won | wave5 | median | max |
|-----|----------|-------|-----|-------|--------|-----|
| control | 6/16 | 13/16 | 0 | 1/16 | 119.0d | 181d |
| feastdisc | 7/16 | 12/16 | 0 | 3/16 | 111.5d | 181d |

Top death causes both arms: combat, villager combat, expedition,
monster, sickness, starvation — same shape, no new modes.

## Blanks filled / documented

- FILLED: the feast->wave-4-engagement timing gap (DIAG: 81.5% of
  wave-4 engagements un-feasted, feast deserts 14-63d) now has a
  policy-side instrument: threat-driven armed-feast staging
  (scripts/policies/feastdiscipline.js, FEASTDISC=1). GO at pilot.
- DOCUMENTED (finding): the feast draw manufactures wave-4 engagements
  inside the buff window — the d178 Algorithm kill came through the
  draw, not the wander path. Any future wave-4 engagement census should
  split feast-draw vs wander engagements.
- DOCUMENTED (finding): the layer's threat gate often meets UNARMED
  devotion (skippedUnarmed=30 on s66028 alone) — the devotion arming
  cadence (base's daily channeling) is the next binding constraint on
  staged-feast volume, not the pantry.

## Convergence (scale-onramp axis)

convergence: converging — the feast leg of the veterans conjunction is
now policy-steerable (feasted-engagement rate 10%->38%, kill-time kills
2->5 at pilot). Not converged: damage-majority kills flat (0 vs 1) —
companions fight feasted but the scholar still closes. Named next: the
confirm (12-16 seeds) with damage-majority as primary or a
companion-damage-share threshold; the arming-cadence blank above.

## Files

- scripts/policies/feastdiscipline.js — the layer (FEASTDISC=1)
- scripts/diag-feastdisc-20261022.js — spike DIAG instrument
- scripts/test-feastdiscipline-20261022.js — proof gates (ALL GREEN)
- scripts/sweep-feastdisc-20261022.js — pilot sweep
- scripts/build-feastdisc-panels-20261022.js — §15 panel builder
- scripts/sense-feastdisc-20261022.js — sense probe
- evidence/2026-10-22/perseed-feastdisc-diag/ — DIAG corpus (12 configs)
- evidence/2026-10-22/perseed-feastdisc/ — pilot corpus (32 configs)
- evidence/2026-10-22/feastdisc-panel-primary.{json,md} + -before/-after.json.gz
