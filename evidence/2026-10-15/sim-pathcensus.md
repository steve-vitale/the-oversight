# sim-pathcensus — where path variety dies (flesh-out loop DIAGNOSTIC, 2026-10-15)

Run: sim-pathcensus, scale-onramp axis (standing scale directive; the WIN side of the wall).
Canon: docs/CANON.md + docs/TABLE.md (read first). Zero src/js changes — READ-ONLY instrument, default-OFF env, no lever change.

## Pre-registered questions (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE the sweep)

Diagnostic run — no GO lever; the QUESTIONS bind per §14 (a miss is NO-GO only
on the questions' own terms).

**Stack:** the landed win-side stack — FEASTSCALE_R13 + TRIBFLOOR +
SUCCGRACE + RAIDDENSITY (asserted up front) + WINPURSUIT=1 + WINDEFER=1 +
SEATDRIVE=1 (armed only). 8 fresh seeds [131,242,353,464,575,686,797,908] x
{leadfeast, belongfeast} x {armed}, 180d death-aware. No control needed (no
lever change — the instrument's read-only proof IS the control).

**Context:** all 24 measured wins are lesser-seat feared-path walks — the
winpursuit drain plays options[0], it doesn't choose the door
(evidence/2026-10-15/sim-winconfirm.md; sim-findings #309/#311). Path
selection is a steve-call (#316/#317): this run does NOT design path
selection. It measures the funnel and files evidence Steve can rule on.

**Proof:** scripts/test-pathcensus-20261015.js — 28/28 GREEN (exports +
PATH_IDS + stack; SMOKE green both policies; DET-GATE 4/4 seeds
[131,242,353,464] trajectory-identical armed+instrument vs plain armed on
60d — plain-repeat stable AND census-repeat stable AND plain==census, the
both-repeat design distinguishing an instrument leak from the known
timestamp-entropy issue; record/finish honesty on a 180d census run that won).
SMOKE green before the sweep. Instrument: scripts/pathcensus-20261015.js
(withPathCensus wraps SD.leadseat/SD.belongseat; recording chooseTableOption
calls through with identical args — zero behavioral change).

**Q1 (binding):** invite → sit → answer conversion: invitations pending
count, sittings, modal answers per run (medians and ranges).
**Q2 (binding):** answer distribution: per answer, which of the 7 paths x
{light, dark} branch — the full 14-cell table across all runs.
**Q3 (binding):** where non-lesser-seat doors die: for each answer, the
modal's offered doors (options) and classification — (a) never offered,
(b) offered but drain picked options[0], (c) picked but failed
mid-challenge. Plus invited-but-unanswered modal streak lengths in days.
**Q4 (binding):** read-only counterfactual: for each answer, which door a
least-walked-door policy would have taken, and whether it was offered.

## A1 — invite → sit → answer (16 runs)

| run | announcedDay | seatDay | seat | invDays | sits | answers | doors | won |
|---|---|---|---|---|---|---|---|---|
| belongfeast s131 | 126 | 126 | lesser | 1 | 1 | 5 | 1 | 1 |
| belongfeast s242 | 42 | — | — | 0 | 0 | 0 | 0 | 0 (died d69) |
| belongfeast s353 | 73 | 90 | lesser | 1 | 1 | 5 | 1 | 1 |
| belongfeast s464 | — | — | — | 0 | 0 | 0 | 0 | 0 (died d51) |
| belongfeast s575 | 56 | 90 | lesser | 1 | 1 | 5 | 1 | 1 |
| belongfeast s686 | 72 | 90 | lesser | 1 | 1 | 5 | 1 | 1 |
| belongfeast s797 | 56 | 90 | lesser | 1 | 1 | 5 | 1 | 1 |
| belongfeast s908 | — | — | — | 0 | 0 | 0 | 0 | 0 (died d77) |
| leadfeast s131 | 63 | 90 | FULL | 1 | 1 | 5 | 1 | 1 |
| leadfeast s242 | 49 | 90 | FULL | 1 | 1 | 5 | 1 | 1 |
| leadfeast s353 | 48 | 90 | lesser | 1 | 1 | 5 | 1 | 1 |
| leadfeast s464 | 82 | 90 | lesser | 1 | 1 | 5 | 1 | 1 |
| leadfeast s575 | 100 | 100 | lesser | 1 | 1 | 5 | 1 | 1 |
| leadfeast s686 | 55 | — | — | 0 | 0 | 0 | 0 | 0 (died d70) |
| leadfeast s797 | 57 | — | — | 0 | 0 | 0 | 0 | 0 (died d78) |
| leadfeast s908 | 131 | 131 | lesser | 1 | 1 | 5 | 1 | 1 |

Medians/ranges: invitations pending = 1 day per sitting run (range 1–1);
announcedDay median 60 (range 42–131); seatDay median 90 (90 ×8, 100, 126,
131); sittings 11/16; drain answers 55 = 5 per sitting × 11; door answers
11. Five runs died pre-invitation (d51–78, village-lost — combat attrition,
the wall's standing attrition engine). Every invitation became a sitting
the first dawn the preview existed: the announcement fires early
(d42–82 on most runs), but winDayFloorOk gates the preview to d90+, and
the driver sits immediately when the preview appears (invDays=1 always —
the invitation never waited).

## A2 — the 14-cell answer distribution (11 door answers, all runs)

| path \ branch | light | dark |
|---|---|---|
| feared | **11** | 0 |
| indispensable | 0 | 0 |
| beloved | 0 | 0 |
| witness | 0 | 0 |
| assimilated | 0 | 0 |
| defiant | 0 | 0 |
| relay | 0 | 0 |

(Relay's grey band: never reached — relay never walked.) Every walked
door was feared-light. The branch was earned, not chosen: all 11 runs had
protected ≥ killed, foodShared > foodHoarded, promises kept — the ledger
read light on every seat. Dark branches are unmeasured, not disproven.

## A3 — where the non-feared doors die

Per-answer offered doors (the modal the player would have seen):

- **Lesser seats (9/11 sittings):** options = [feared, beloved, assimilated,
  defiant, relay] — 5 doors, feared ALWAYS options[0] (PATHS insertion
  order: table-feared.js registers first).
- **Full seats (2/11: leadfeast s131, s242):** options = [feared,
  indispensable, beloved, assimilated, defiant, relay] — indispensable
  needs the full seat (minSeat:'full', honest prereq).
- **Witness:** never offered in 11/11 (prereq: ledger.exposed ≥ 3; all
  runs had fewer — honest, priced in the prompt as unearned).

Classification totals (per path, per door answer):

| path | (a) never offered | (b) offered, drain picked options[0] | (c) picked, failed mid-challenge |
|---|---|---|---|
| feared | 0 | — (it IS options[0]) | 0 (won 11/11) |
| indispensable | 9 | 2 | 0 |
| beloved | 0 | 11 | 0 |
| witness | 11 | 0 | 0 |
| assimilated | 0 | 11 | 0 |
| defiant | 0 | 11 | 0 |
| relay | 0 | 11 | 0 |

**(c) never happened:** 0 downgrade modals in 11 walks — every picked door
completed. The 5 offered-but-untaken doors died at the CHOICE, not the
offer: the drain played options[0] = feared all 11 times.

Invited-but-unanswered modal streaks: **0 streaks** (n=0, max 0d). The
modal never waited — answered the dawn it appeared (day ≥ 90, the windefer
never-hold rule).

## A4 — the least-walked-door counterfactual (read-only, sweep order)

- **Single-door counterfactual** (least walked of all 7): the door a
  least-walked-door policy would have taken was **indispensable on 8/11
  answers — but it was NOT offered** (full-seat-only; those were lesser
  seats). Taken once: feared on the very first answer (empty ledger).
  Score: counterfactual-taken 1/11; counterfactual-not-offered 8/11.
- **Least-walked-OFFERED counterfactual** (the variety a variety-seeking
  policy could actually have walked on the same seats): feared ×1,
  beloved ×8, indispensable ×2 — genuine door variety, on the menu, never
  walked.

The 11 walks went to feared ×11; the counterfactual says the same seats
would have supported feared ×1 + beloved ×8 + indispensable ×2.

## Sense-testing: one full sitting, end to end

belongfeast-armed-s131 (win d126, lesser seat — 578 beats, d1–126,
evidence/2026-10-15/pathcensus-beats/belongfeast-armed-s131.json):

The day before: the village is still living its life — people setting out
to find Carlos, the doubled night watch explaining the quiet treeline,
the Mirror Draft opening in the wave-4 ratings block. The announcement
beats read honestly: "The table is being set — a lesser seat, priced for
what you built," then Arc IV's inefficiency beat ("Recalculating.
Recalculating.") — the food thesis landing as the table's premise.

The sit (d126): "◈ THE TABLE — it is not a table. It's a ring of pale
light... 'HUMANITY PRESENTS ITS CASE.'" The audit reads the run back:
"A lesser seat — national standing, waves 1–3 faced (18/9/3), 12 contests
survived, 4 crises weathered. The table does not rise. It prices." The
door grants (Dreadfield, War-table, Oathbound, Shieldbearer) are voiced
as capabilities, not numbers. The feared-light walk is the tightrope
from TABLE.md played straight: "Look what eating built" → the ledger
read ("The food truth was shared. The light road is open.") → the
terror-for-shield beats ("You spend it — the shield, not the sword.
Your people stand a little straighter.") → the final choice, "Show
mercy" → "the galaxy learns that the feared one chose gentleness — and
that choice echoes longer than any threat." The win lands plainly: "You
won. Say it plainly: you won. The village endures. The table signed."
And the tribute walks out: "5,148 kcal walks out of the pantry toward
The Red Table III. The relationship holds."

**Verdict:** the walk reads as a CHOICE in the fiction — the audit, the
branch voice, the final mercy beat, and the tribute all make the feared
door feel deliberated and earned. But the instrument says no deliberation
happened: the modal offered five doors and the drain answered options[0]
instantly, five beats in one dawn. The meaning is real (the ledger read,
the branch, the mercy — all engine-earned); the choosing is not. A human
player would have stood in front of the same five doors and picked; the
sim played the first one. The fiction covers for the policy — that's why
35 runs (this + winconfirm) all read fine while walking the same door.

## Village assessment (plain words)

Eleven villages sat at the table and won the way they've been winning:
feared, light, plain-spoken. Two of them (leadfeast s131, s242) had FULL
seats — the only full seats in the run — and the drain walked past
indispensable, which was ON their menu, to take feared. Five villages
never got invited: they died young (d51–78) to the same combat attrition
that has always been the wall's engine — village-lost before the floor.
The announced-but-waiting pattern is healthy: the invitation fires early
(the System is watching), the floor holds until d90, the sit happens the
morning the preview exists. Nobody stalled at the door. Nobody was
exiled. The funnel's bottom half (offer → walk → win) is a well-oiled
machine; the funnel's top half (which door) is a coin with one side.

## The answer for Steve's ruling (#316/#317)

**Path variety dies at the CHOICE, not the offer.** The modal is honest
and well-built: 5–6 earned doors per seat, unearned ones priced aloud
(witness's exposed bar, indispensable's full-seat bar), feared first only
by registration order. The drain — the only choosing verb in the sim
stack — doesn't choose: it plays options[0], and options[0] is always
feared. A least-walked-offered-door policy would have walked three
different doors on the same seats. The branch axis is equally untested:
11/11 light, dark unmeasured. **No design is proposed here** (steve-call
#316/#317 stands): the evidence for the ruling is the funnel above —
invite 11 → sit 11 → walk feared 11, with 5 other doors offered and 0
walked.

## Metric review

1. Q1–Q4 all answered with 16/16 runs measured; every number above is from
   the per-seed JSONs (evidence/2026-10-15/perseed-pathcensus/, 16/16
   schema-verified on invitations/sittings/answers + per-path map).
2. Schema note for the coordinator's telemetry-check: `answers` = total
   drain answers (55 = 5 per sitting), `doorAnswers` = 'path:' answers
   (11). Both numeric, both written; the won/wins-style drift trap is
   documented here.
3. The both-repeat det-gate design (plain×2, census×2) worked cleanly:
   all four seeds stable both sides, plain==census 4/4 — the instrument
   is provably read-only and the timestamp-entropy issue did not appear
   on these seeds.
4. Limitation: dark branches and witness/indispensable walks are
   unmeasured on this substrate (the funnel can't measure what the drain
   never reaches). A future run with a dark-leaning policy or a manual
   door picker could walk them; path selection remains Steve's call.
5. Metric-design note (recurring): `invitations` counts days the preview
   exists pre-sit (invDays=1 everywhere here) — the announcement
   (tableWaiting) fires earlier (d42–131). Invitation-pending vs
   announcement-pending are different clocks; both are in the JSONs.
