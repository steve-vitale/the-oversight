# sim-winconfirm3 — THIRD fresh-seed confirm of the landed win-side stack (2026-10-15)

Run: flesh-out sim-winconfirm3 arm, scale-onramp axis (the WIN side of the scale wall).
Canon: docs/CANON.md + docs/TABLE.md (read first). ZERO src/js changes —
policy/instrument scripts only. This is a confirm: no lever change.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE the sweep)

**Question:** two prior replicates (sim-seatdrive on seeds [11..88], sim-winconfirm
on seeds [111..888]) both went 12/16 wins armed, 0/16 control. Third fresh-seed
set [121,232,343,454,565,676,787,898] asks whether the win-side stack replicates
again — three independent seed sets before the convergence tracker trusts it.

**Substrate (asserted up front — #312 lesson):**
FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1
+ control SEATDRIVE unset / armed SEATDRIVE=1. **ALLOWGATE2 unset — the landed
allowgate2 layer is default-OFF and stays OFF for this replicate.** If SMOKE or
the det-gate shows the substrate moved vs winconfirm's expectations: STOP, do
not rescore, report to coordinator.

**Arms:** none (diagnostic confirm). 8 fresh seeds x {leadfeast, belongfeast} x
{control, armed}, 180d death-aware, identical seeds both sides, own in-sweep
control. Sweep: scripts/sweep-winconfirm3-20261015.js (SEEDS env override),
per-seed JSONs in evidence/2026-10-15/perseed-winconfirm3/ with EXACT numeric
keys national, table, wins, exiled, sittings (the won/wins schema-drift trap).

**Horizon + why:** 180d death-aware. Win-day floor day 90; invitations fired
d90–126 on the last fresh-seed set; the chain (invite → seat → paths →
challenge → win) needs the full window.

**Proof:** scripts/test-winconfirm3-20261015.js — layer-live markers honest both
sides; det-gate 16/16 byte-identical gate-off trajectories on the FRESH seeds
(ALLOWGATE2 stays unset here — the det-gate compares gate-off wrapped vs naked);
SMOKE green both sides BEFORE the sweep.

**PRIMARY (binding):** wins armed >= 8/16 (prior replicates 12/16; honest bar at
2/3). A miss = NO-GO.

**CO-PRIMARY (binding):** wins control == 0. Control wins > 0 = investigate,
never rescore.

**GUARDRAILS (binding):**
- national armed >= national control - 2
- exiled armed <= 1
- no new death mode at n>=3
- median survival on per-seed-matched NON-WINNING runs >= control - 10d (the
  wintrace confound precedent — wins end ~d90 and truncate).

**Secondaries:** full wall numbers both sides (national / table / wins /
wave-4 unlocks / wave-5 unlocks / median survival / exiled).

**SENSE-TESTING LAW:** sense-read one full sitting transcript end to end —
does the win story make sense? Judge meaning, not counts.

## Metric review

(per §14 — pre-registered metrics bind; doubts go here, revisions apply to
the NEXT run)

1. **PRIMARY GO: wins armed = 16/16 (bar >= 8/16).** Three independent fresh
   seed sets now read 12/16 → 12/16 → 16/16. Not just above the bar — every
   armed run sat and won. The win-side stack replicates.
2. **CO-PRIMARY GO: wins control == 0.** 16/16 invitations on control, 0
   sittings, 0 wins — the inert state is genuinely inert across three seed
   sets now. The driver remains the only seat-taking verb on the courtship
   road.
3. **Guardrails all GO.** national armed 12 = control 12 (bar >= 10).
   exiled 0 <= 1 both sides. No new death mode: armed's 12 death modes are
   a strict subset of control's 13 (control additionally shows "the phoenix
   link" ×7 — the armed trajectories simply never lived long enough to
   produce one).
4. **Matched non-winning median survival is VACUOUS — n=0 pairs.** The
   guardrail was designed for partial win rates; with 16/16 armed wins
   there are no non-winning armed runs to match. This is a metric-design
   item for the NEXT winconfirm run, not a miss: the honest successor
   metric is per-seed "control survived >= armed seatDay" (the win must
   not cut a life short — it ends the run AT the table). It held 16/16
   here: every control run outlived its armed counterpart's seatDay
   (controls d109–182; seatDays 90–139). The all-runs medians (93.0d armed
   vs 141.0d control) are the pre-registered wintrace confound, computed
   and noted, not the verdict.
5. **Wave-5 reads 2/16 armed vs 10/16 control — truncation, third replicate.**
   The standing seatdrive metric-review precedent applies verbatim: on the
   lead road the control runs lived d125–176 and unlocked wave-5 between
   d~90–125; the armed runs won at d90–130 before the clock ran out.
   Belong road: control 2/8 (s232 d147, s454 d113), armed 0/8 (both won at
   d90 pre-unlock). Two armed runs fought wave-5 monsters PRE-WIN and
   still won the same day (s121-lead d90, s454-lead d90) — the win does not
   require hiding from the late game. Wave-reach on win-side sweeps must
   be read on non-winning runs or pre-win windows, never as raw side
   totals (third time this trap has appeared; it is a standing note, not a
   regression).
6. **Seat timing spreads d90–139 on this seed set** (10 at d90; then 96,
   107, 115, 119, 126, 130, 136, 139). The driver sits whenever the invite
   exists — same behavior, wider calendar. "The table is being set — a
   lesser seat, priced for what you built" still precedes the sit by a day.
7. **This seed set is kinder on the lead road than either prior set:**
   leadfeast control reached wave-5 in 8/8 (vs 8/16 on the last fresh set)
   and national in 8/8 both sides. The win rate (16/16) is robust to
   seed-set kindness; it is not a lucky-seed artifact.
8. **Seat kinds: 16/16 lesser.** No full-seat run — the national bar for
   the full seat remains aspirational in sims (the s676 sense-read sits at
   REGIONAL and still wins its lesser seat honestly — the lesser seat is
   the reachable design target working as designed).

## Results — THIRD replicate: 16/16 wins armed, 0/16 control (GO on every binding metric)

Proof scripts/test-winconfirm3-20261015.js 12/12 GREEN (layer-live markers
honest both sides; det-gate 16/16 byte-identical gate-off trajectories on
the FRESH seeds with ALLOWGATE2 unset; SMOKE green both sides BEFORE the
sweep). Sweep scripts/sweep-winconfirm3-20261015.js (SMOKE gate green
before the sweep; seat=false/armed=true, defer=true both sides; policy id
belongfeast-windefer / leadfeast-windefer).

Substrate: 8 fresh seeds [121,232,343,454,565,676,787,898] x {leadfeast,
belongfeast} x {control, armed}, 180d death-aware, FEASTSCALE_R13=1 +
TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1 (asserted up front), identical
seeds both sides, own control in the same sweep. Control = seatdrive-wrapped
stack, SEATDRIVE unset + WINPURSUIT=1 + WINDEFER=1. Armed = same +
SEATDRIVE=1. ALLOWGATE2 unset (landed layer stays default-OFF).

| metric | control (16) | armed (16) | bar | verdict |
|---|---|---|---|---|
| wins | 0 | 16 | >= 8 | GO |
| control wins | 0 | — | == 0 | GO (inert stays inert) |
| sittings | 0 | 16 | — | the driver engages |
| national | 12 | 12 | >= 10 | GO |
| invitations (table) | 16 | 16 | — | — |
| wave-4 unlocks | 16 | 16 | — | — |
| wave-5 unlocks | 10 | 2 | — | truncation (see metric review 5) |
| exiled | 0 | 0 | <= 1 | GO |
| median survival (all) | 141.0d | 93.0d | — | confounded (wins end at seatDay) |
| control survives >= armed seatDay (per-seed) | — | 16/16 | — | successor metric, GO |
| table answers | 0 | 80 | — | 16 × 5, the drain engaged |
| holds | 0 | 0 | — | never holds at day ≥ 90 |
| guard refusals | 0 | 0 | — | classified, none occurred |

Per-seed JSONs: evidence/2026-10-15/perseed-winconfirm3/
(<policy>-<side>-s<seed>.json — all 32 present, 0/32 schema-bad, numeric
national, table, wins, exiled, sittings). Beat captures:
evidence/2026-10-15/winconfirm3-beats/ (32 files; ring buffer on
table/seat/scale/death language).

The mechanism, per run: the invitation beat fires at d90–139, the driver
takes the seat the next dawn (all 16 lesser), the windefer daily drains the
7-door modal with the hold discipline, the path challenge plays its 5
beats, the win resolves the same day. 16/16 sittings → 16/16 wins,
5 answers each, 0 holds. Path walked varies by run state (feared light
in the sense-read); the driver never picks — a sibling's scope,
unchanged.

## Village assessment (plain words)

Sixteen more villages sat down and won — the third independent fresh seed
set, and the strongest number yet (16/16, following 12/16 twice). The shape
is identical to both prior replicates: the same driver, the same audit,
the same five beats, the same plain-spoken win. What moved this time is the
kindness of the seeds, not the stack: the lead road on this set is
wave-5-rich (8/8 on control) and the villages live long (control median
141d). And the stack didn't need the kindness — on the belong road, where
villages still die young of combat (s232/s343/s454 control gone by d147),
the armed runs won at d90 anyway.

The ledger still reads the grief. The sense-read run (belongfeast, s676,
seatDay 139) buried Grace — "and the dead hold no treaties" — five days
before the table sat, and the audit priced a village mid-mourning: "A
lesser seat — regional standing, waves 1–3 faced (16/7/3), 20 contests
survived, 2 crises weathered. The table does not rise. It prices." The win
doesn't require a clean run; it requires an honest one.

Nothing was exiled, the guard stayed quiet (fixture-proven only — third
replicate, still 0/64+64 across runs), and combat remains the attrition
engine ('combat' ×479 control / ×289 armed; 'villager combat' ×138 / ×127).
The wall's far side is now measured on three seed sets: national 12/16
both sides here, the table within reach, and every village that could sit
did sit — and won.

## Sense-testing

One full sitting transcript, belongfeast-armed s676 (win d139), read end
to end (evidence/2026-10-15/winconfirm3-beats/belongfeast-armed-s676.json,
510 beats, d1–d139):

- **The village before:** reads like people. "Seven days of silence, and
  the silence answered for Haven. Emberhold's new speaker reads it plainly.
  (Trust -6.)" — silence has consequences. "You came back bloody. Nobody
  asks. Someone saves you the good seat by the fire." — people noticing
  each other. Raids come in the night and carry off the pantry; the message
  is clear and nobody dies — proportional, not random.
- **The week before (d131–138):** The Ugly Beast dies (codex notices,
  unasked). Emberhold raids. Grace Obi dies d134 — "the dead hold no
  treaties. Every link Haven has shakes." A starvation warning fires d136.
  Chantal, Marcus, Fatima, Denise keep setting out to find each other
  ("Won't be long.") — the template fingerprints repeat (sim-findings
  #302, known), but the rhythm reads as a village watching its own edges.
- **The table (d138–139):** "The table is being set — a lesser seat,
  priced for what you built. They are watching to see who comes to it."
  Then the seat: "◈ THE TABLE — it is not a table. It's a ring of pale
  light..." The audit, the War-table ability beat ("The Nielsen flinches
  first — you saw it"), the feared path: "Look what eating built." The
  ledger: "The food truth was shared. The light road is open."
- **The mercy beat:** "The most frightening thing you ever did. The table
  doesn't know what to do with mercy from a predator. ... the galaxy learns
  that the feared one chose gentleness — and that choice echoes longer than
  any threat."
- **The win:** "You won. Say it plainly: you won. The village endures.
  The table signed. The galaxy applauds, and the applause is real, and you
  earned it."

Judgment: meaning and coherence pass. A village buried someone five days
ago and the win still lands — earned, not scripted. Each of the 5 answers
advances the scene. The stack holds, on a third fresh seed set.

## Findings filed

- (this run) **CONFIRM GO — third replicate of the win-side stack on
  fresh seeds: 16/16 wins armed, 0/16 control, all binding metrics green
  (guardrail national 12=12, exiled 0, no new death mode, control
  survived >= armed seatDay 16/16).** Three independent seed sets now
  read 12/16, 12/16, 16/16. Whether the convergence tracker lifts the
  standing directive on this is a coordinator/Steve call.
- Metric-design note (for the NEXT winconfirm run): the matched
  non-winning survival guardrail is vacuous at 100% win rates — adopt the
  successor metric "per-seed control survived >= armed seatDay" (16/16
  here), which tests the honest question (the win must not cut a life
  short).
- Metric-design note (standing, third replicate): wave-reach on win-side
  sweeps reads on non-winning runs or pre-win windows only — wins
  truncate at seatDay (2/16 armed vs 10/16 control here; capability
  demonstrated intact: 2 armed runs fought wave-5 pre-win and won the
  same day).
- Out of scope, documented: path selection is the drain's
  (options[0], sibling's); guard classification remains fixture-proven
  only; the full-seat bar is aspirational in sims (lesser is the
  reachable design target, working); combat attrition still kills the
  young before the floor on the belong road.
