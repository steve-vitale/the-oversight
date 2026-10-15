# sim-winconfirm — the win-side stack on FRESH seeds (flesh-out loop DIAGNOSTIC, 2026-10-15)

Run: fleshout-20261015T192452Z, sim-winconfirm arm (claim filed by coordinator).
Axis: scale-onramp (standing scale directive; the WIN side of the wall).
Canon: docs/CANON.md + docs/TABLE.md (read first). Zero src/js changes —
policy-only confirm. No new layer: the seatdrive driver landed 9cdbe8d1;
this run asks whether 12/16 wins replicates on seeds the stack has never
seen.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE the sweep)

**Question:** sim-seatdrive proved the landed win-side stack
(FEASTSCALE_R13 + TRIBFLOOR + SUCCGRACE + RAIDDENSITY + WINPURSUIT +
WINDEFER + SEATDRIVE) goes 12/16 wins on seeds [11..88]. The convergence
tracker says: confirm the wins hold on FRESH seeds before any rotation
resumes. That is this run.

**Arms:** none (diagnostic confirm — no lever change). Both sides in one
sweep on identical fresh seeds [111,222,333,444,555,666,777,888] x
{leadfeast, belongfeast} x {control, armed}, 180d death-aware, own
control in the same sweep.
- Control = seatdrive-wrapped tribfloor stack, SEATDRIVE unset +
  WINPURSUIT=1 + WINDEFER=1 — provably inert on the old seed set (0/16
  sittings, 0/16 wins, wincensus+seatdrive). Expected: still inert on
  fresh seeds.
- Armed = the same objects + SEATDRIVE=1.

**Horizon + why:** 180d death-aware. The win-day floor is day 90 and
invitations fired d46–114 in the census; the chain (invite → seat →
paths → challenge → win) needs the full window.

**Proof:** scripts/test-winconfirm-20261015.js — layer-live markers
honest both sides; det-gate 16/16 byte-identical gate-off trajectories
on the FRESH seeds (seatdrive layer unchanged since its 26/26 proof —
no fixture re-proof needed, gate-off purity re-verified on fresh
ground); SMOKE green both sides BEFORE the sweep.

**PRIMARY (binding):** wins armed >= 8/16 (prior 12/16; honest bar at
2/3). A miss = NO-GO: the win-side stack does not replicate on fresh
seeds, and the directive does NOT lift.

**CO-PRIMARY (binding):** wins control == 0 (the inert state must still
be inert on fresh seeds). Control wins > 0 would mean the "inert"
baseline is seed-lucky, not inert — investigate, do not rescore.

**GUARDRAILS (binding):**
- national armed >= national control - 2 (out of 16)
- exiled armed <= 1
- no new death mode at n>=3
- median survival on per-seed-matched NON-WINNING runs >= control - 10d
  (pre-registered per the wintrace confound precedent — wins end at d90
  and truncate; the all-runs median is structurally confounded).

**Secondaries:** wall numbers both sides (national/table/wins/wave-4/5
unlocks/median survival/exiled); per-seed JSONs in
evidence/2026-10-15/perseed-winconfirm/<policy>-<side>-s<seed>.json,
each carrying numeric national, table, wins, exiled, sittings (keys
EXACT — the won/wins schema-drift trap, twice today).

**SENSE-TESTING LAW:** sense-read one full sitting transcript end to
end (invitation → seat → path → win); judge meaning and coherence.

## Metric review

(per §14 — pre-registered metrics bind; doubts go here, revisions apply
to the NEXT run)

1. **PRIMARY GO: wins armed = 12/16 (bar >= 8/16).** The 12/16 from the
   old seed set replicates exactly on fresh seeds — same number, same
   shape (all lesser-seat, 5 answers each, 0 holds). Not 8, not 10:
   12/16 again.
2. **CO-PRIMARY GO: wins control == 0.** 15/16 invitations on control,
   0 sittings, 0 wins — the inert state is genuinely inert, not
   seed-lucky. The driver remains the only seat-taking verb on the
   courtship-road chain.
3. **Guardrails all GO.** national armed 12 = control 12 (bar >= 10).
   exiled 0 <= 1 both sides. Matched non-winning median survival
   78.0d armed = 78.0d control (bar >= 68.0d), n=4 pairs — byte-equal
   again; the all-runs median (90.0d vs 119.5d) is the pre-registered
   wintrace confound (wins end at seatDay, d90–126 here), which is why
   the matched computation was pre-registered. No new death mode:
   armed's death modes are a strict subset of control's (control
   additionally shows sickness×4, "The Big Beast"×1, "the night"×1,
   "The Congregation"×1).
4. **Wave-5 reads 4/16 armed vs 8/16 control — truncation, again, not
   regression.** The seatdrive metric-review precedent applies
   verbatim: all 8 control w5 unlocks are on the lead road, which lived
   to d104–145 on those seeds; armed ended those runs at d90 by winning.
   Wave-5 is reachable under the win — two armed runs fought wave-5
   monsters pre-win (s222: 2 distinct, s777: 1 distinct, both won d90),
   and a third fought one pre-death (s555, d80). No content capability
   regressed; the count gap is the clock stopping.
5. **Seat timing spreads wider on fresh seeds.** Old seeds: all 12 sits
   at d90. Fresh seeds: seatDay 90 (×7), 94, 100, 112, 123, 126 —
   invitations fire d90–126 (later invites on s111-lead, s666-belong,
   s888-belong) and the driver sits the next day. The wins follow the
   invitations, not a fixed floor. The wincensus's d46–114 invitation
   window now reads d90–126 — the invitation beat fires only at/after
   the d90 floor; earlier "table" language in beats is unrelated
   (tribute-negotiation "the table" hits, e.g. d20 Ashford beat).
6. **12/12 sittings → 12/12 wins, again.** The drain + windefer
   discipline still does the rest with no intervention. Path walked
   varies by run state (feared light here, per the drain), but the
   driver never picks — a sibling's scope, unchanged.

## Results — the win-side stack holds on fresh seeds (GO on every binding metric)

Proof scripts/test-winconfirm-20261015.js 12/12 GREEN (layer-live
markers honest both sides; det-gate 16/16 byte-identical gate-off
trajectories on the FRESH seeds; SMOKE green both sides). Sweep
scripts/sweep-winconfirm-20261015.js, SMOKE gate green before the sweep
(seat=false/armed=true, defer=true both sides; policy id belongfeast-
windefer).

Substrate: 8 fresh seeds [111..888] × {leadfeast, belongfeast} ×
{control, armed}, 180d death-aware, FEASTSCALE_R13=1 + TRIBFLOOR=1 +
SUCCGRACE=1 + RAIDDENSITY=1 (asserted up front), identical seeds both
sides, own control in the same sweep. Control = seatdrive-wrapped
stack, SEATDRIVE unset + WINPURSUIT=1 + WINDEFER=1. Armed = same +
SEATDRIVE=1.

| metric | control (16) | armed (16) | bar | verdict |
|---|---|---|---|---|
| wins | 0 | 12 | >= 8 | GO |
| control wins | 0 | — | == 0 | GO (inert stays inert) |
| sittings | 0 | 12 | — | the driver engages |
| national | 12 | 12 | >= 10 | GO |
| invitations (table) | 15 | 15 | — | — |
| wave-4 unlocks | 16 | 16 | — | — |
| wave-5 unlocks | 8 | 4 | — | truncation (see metric review 4) |
| exiled | 0 | 0 | <= 1 | GO |
| median survival (all) | 119.5d | 90.0d | — | confounded (wins end at seatDay) |
| median survival (matched non-winning, n=4) | 78.0d | 78.0d | >= 68.0d | GO |
| table answers | 0 | 60 | — | the drain engaged |
| guard refusals | 0 | 0 | — | classified, none occurred |

Per-seed JSONs: evidence/2026-10-15/perseed-winconfirm/
(<policy>-<side>-s<seed>.json — all 32 present, numeric national,
table, wins, exiled, sittings; the won/wins schema-drift trap avoided).
Beat captures: evidence/2026-10-15/winconfirm-beats/ (32 files; ring
buffer on table/seat/scale/death language).

The mechanism, per run: the invitation beat fires at d90–126 ("◈ THE
TABLE IS SET. ... Nothing is final until you sit."), the driver takes
the seat the next dawn (seatDay 90–126, all lesser), the windefer daily
drains the 7-door modal with the hold discipline (never holds at day ≥
90), the path challenge plays its 5 beats, the win resolves the same
day. 12/12 sittings → 12/12 wins, 5 answers each.

## Village assessment (plain words)

Twelve more villages sat down and won — on seeds the stack had never
seen. The shape is identical to the old seeds: the same driver, the
same audit, the same five beats, the same plain-spoken win. The only
thing that moved is the calendar: invitations fire later on some fresh
seeds (d94–126), and the driver doesn't care — it sits whenever the
ring of light is there. That's what a driver should look like.

The fresh seeds are kinder than the old ones (national 12/16 vs 6/16,
table 15/16 both sides, wave-4 16/16 on both sides), and the kind of
kindness they show is interesting: the lead road on fresh seeds reaches
wave-5 in half its runs, including pre-d90. Two armed villages fought
wave-5 monsters and still won the same day — the win doesn't require
hiding from the late game. The belong road never reached wave-5 on
these seeds either side, which is the standing wave-5 reach question,
not a regression (armed = control on the belong side, modulo
truncation).

The four non-winning armed pairs are byte-identical to their controls
— the driver's honesty holds at the edges: s444-belong survived to
d182 national on both sides, never invited (the wave-3 bar, the
census's standing case); s555 and s888 on both roads died young of
combat before the floor. Combat is still the wall's attrition engine:
'combat' ×381 + 'villager combat' ×132 on the control side.

Nobody was exiled; the guard stayed quiet again (fixture-proven only).
Deaths during the runs read honest — the sense-read run lost Moya
Tierney, its Stonebridge speaker, the day before the invitation, and
the game didn't flinch: Stonebridge raised the tribute to 11,250
kcal/week on the grief ("Grief is leverage, and they know it"), and
the table the next dawn priced a village that was still burying
someone. The win didn't erase the funeral; the funeral is in the
pricing.

## Sense-testing

One full sitting transcript, belongfeast-armed s222 (win d90), read
end to end (evidence/2026-10-15/winconfirm-beats/belongfeast-armed-
s222.json, 430 beats, d1–d90):

- **The village before:** reads like people — the well that won't fill
  itself, strangers setting out to find strangers, plants drawn in dirt
  for the others ("It'll wash away. The knowledge won't."). The
  template fingerprints repeat (sim-findings #302), but the texture
  holds.
- **The day before (d88–89):** Moya Tierney dies in combat; the link to
  Stonebridge shakes; Stonebridge installs their own speaker and the
  tribute doubles on the grief; a visitor (Priya) waits two days at the
  fire, gets nothing, walks back — "They'll remember the silence."
  Real stakes, real consequences, the day before the biggest night of
  the run.
- **The invitation (d90):** "◈ THE TABLE IS SET. A ring of pale light
  waits — take your seat from Haven when you are ready. Nothing is
  final until you sit." Unadorned and honest.
- **The seat-taking + audit:** "A lesser seat — national standing,
  waves 1–3 faced (17/10/4), 12 contests survived, 3 crises weathered.
  The table does not rise. It prices." Plus a line the old-seed read
  didn't have: "The table notes 1 ascension from one village — its
  terms improve accordingly. Nobody has ever seen that before." —
  the ascension engine feeding the audit honestly.
- **The path walk (feared, light):** "Look what eating built." — the
  food thesis again, on the record. "The table has read your ledger.
  The food truth was shared. The light road is open." Then the mercy
  beat: "The most frightening thing you ever did. ... the galaxy
  learns that the feared one chose gentleness — and that choice echoes
  longer than any threat."
- **The win:** "You came to the Table as the Feared the hard way: one
  fight at a time, most of them for someone else." ... "You won. Say it
  plainly: you won. The village endures. The table signed. The galaxy
  applauds, and the applause is real, and you earned it."

Judgment: meaning and coherence pass, on a fresh seed, with a fresh
death the night before. The arc is earned — the ledger, the grief, the
pricing, the branch, the win. Nothing reads as button-mashing; each of
the 5 answers advances the scene. The stack holds.

## Findings filed

- (this run) **CONFIRM GO — the win-side stack replicates on fresh
  seeds: 12/16 wins armed, 0/16 control, all binding metrics green.**
  The convergence tracker's trigger (national reached in sims) is now
  measured on two seed sets; whether the standing directive lifts is a
  coordinator/Steve call.
- Metric-design note (recurring, second run): wave-reach metrics on
  win-side sweeps must be computed on non-winning runs or pre-win
  windows — wins truncate at seatDay and read as content regressions
  otherwise (4/16 vs 8/16 here; capability demonstrably intact).
- Out of scope, documented: path selection is the drain's
  (options[0], sibling's); the wave-3 bar still binds the never-invited
  national (s444-belong, d182); combat attrition still kills the young
  before the floor; guard classification remains fixture-proven only
  (guardRefused=0 in 64 runs across both seed sets).
- Invitation timing spreads d90–126 across seeds; the driver sits
  whenever the invite exists. No design change needed.
- Schema note: per-seed JSONs verified numeric on all five keys before
  this evidence was written (0 schema-bad of 32) — the coordinator's
  telemetry-check can read them directly.
