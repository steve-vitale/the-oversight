# sim-seatdrive — the seat-taking driver (flesh-out loop ARM 3, 2026-10-15)

Run: fleshout-a-2026-10-15T174600Z, ARM 3 of 3 (sim-seatdrive).
Axis: scale-onramp (standing scale directive; the WIN side of the wall).
Canon: docs/CANON.md + docs/TABLE.md (read first; the seat/drain/guard
rules below are engine + canon, not invented). Zero src/js changes —
policy only.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep seed runs)

**Question:** sim-wincensus (ARM 1) proved the landed win-side layers
(winpursuit 7/16 wins on the old base; windefer discipline proven) are
INERT on current master: 15/16 invitations, 0 sittings, 0 answers, wins
0/16 both sides, 16/16 armed-control pairs byte-identical. Steve's
2026-10-14 commit 116a8b9d ("Table seat is a Haven option, not a morning
prompt") moved the sit to the active Haven-panel action `tableTakeSeat`;
the ONLY sim policy that takes the seat is capable.js's tableRoad. The
courtship-road chain (leadcourt/belongseek → scalecourt/competent →
feastscale → tribfloor) contains zero seat-taking verbs, so the
winpursuit drain and windefer discipline operate on a table modal that
never exists. This arm builds the missing DRIVER: a policy layer that
takes the seat when the invitation is pending — the drain and the
discipline already landed do the rest.

**Layer:** scripts/policies/seatdrive.js (SEATDRIVE=1, default OFF —
gate-off delegates byte-identically to the wrapped policy; the proof's
det-gate pins that). Composes outside windefer on the tribcollapse stack
(tribfloor over feastscale): seatdrive daily takes the seat at dawn,
then windefer's daily drains the modal (with the hold discipline), then
the base daily. The layer replicates capable.js's seat-taking call
sequence exactly (tablePreview → pv.ready → tableTakeSeat → r.ok counts)
— it never re-picks doors and never stalls mid-challenge; the drain owns
the modal.

Guard classification (sim-findings #294): tableTakeSeat is a
council-gated verb — the layer pre-checks the exile/joined gate
(canPropose pattern: !scholar.exiled && !scholar.joinedVillage) and
classifies guard-refusal separately (ctx.sdGuardRefused) from attempts
(ctx.sdSeatAttempts). A guard refusal is never counted as a failed
attempt. Scholar-alive is a precondition (not counted as an attempt
either).

**PRIMARY (binding):** sittings armed ≥ control+1. Control expected 0
(the wincensus number: 0 sittings on 16). A miss on PRIMARY kills the
layer per kill protocol (delete scripts/policies/seatdrive.js, keep
proof + sweep + evidence).

**CO-PRIMARY (binding):** wins armed ≥ control+1 (the wintrace bar).
Control expected 0/16.

**GUARDRAILS (binding):**
- national ≥ control−2/16
- median survival ≥ control−10d, computed per-seed matched on
  NON-WINNING runs only (pre-registered explicitly — the wintrace
  metric-review precedent: wins truncate long runs, so the
  letter-of-the-law all-runs median is structurally confounded).
  A miss on the median guardrail goes to metric review, NOT auto-kill
  (the documented precedent).
- no new death mode at n≥3.

**Substrate:** 8 seeds (11/22/33/44/55/66/77/88) × {leadfeast,
belongfeast} × {control, armed}, 180d death-aware, identical seeds both
sides, OWN control in the same sweep (#247).
- Env asserted up front: FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 +
  RAIDDENSITY=1 (the tribcollapse stack).
- control = seatdrive-wrapped (leadfeast-windefer / belongfeast-windefer)
  with SEATDRIVE unset + WINPURSUIT=1 + WINDEFER=1 — the current best,
  provably inert per wincensus. The windefer wrapper reproduces
  winpursuit's tableRoad drain internally (windefer's 19/19 proof), so
  WINPURSUIT=1 is the drain's live marker and WINDEFER=1 the hold
  discipline's.
- armed = the SAME objects + SEATDRIVE=1.

**Horizon + why:** 180d death-aware. The win-day floor is day 90 and
invitations in the census fired d46–114; the chain (sit → paths →
challenge → deferral windows → re-offers) needs the full window.

**Proof:** scripts/test-seatdrive-20261015.js — REAL-RED on constructed
invited-but-unseated fixtures (gate off: no sitting; gate on: the seat
is taken, tableChoices modal pending for the drain); guard-classification
fixtures (exiled / joinedVillage → sdGuardRefused, zero attempts, zero
sittings); scholar-dead fixture (precondition, not an attempt);
det-gate 16/16 identical day-hash trajectories gate-off vs the
unwrapped composition; SMOKE green BEFORE the sweep.

**Secondaries (pre-registered):** wall numbers both sides
(national/table/wins/wave4/wave5/median survival/exiled); per-seed JSONs
in evidence/2026-10-15/perseed-seatdrive/<policy>-<side>-s<seed>.json
each carrying numeric national, table, wins, exiled, sittings (the
coordinator runs telemetry-check against them).

**SENSE-TESTING LAW:** sense-read at least one sitting transcript end to
end — the invitation beat, the seat-taking, the modal, the path walk.
Judge meaning and coherence.

## Metric review

(per §14 — pre-registered metrics bind; doubts go here, revisions apply
to the NEXT run)

1. **PRIMARY GO: sittings armed=12, control=0 (bar: armed ≥ control+1).**
   The driver engages exactly where invitations exist. The 4 non-sitting
   armed runs are byte-identical to their control pairs (same days, same
   endReason): belongfeast s44 + leadfeast s33 + belongfeast s66 died
   d60–74 (before the day-90 floor — tablePreview() is null pre-90, so no
   attempt, by design); leadfeast s44 survived to d182 national and was
   never invited (the wave-3 bar — the census's standing case). The layer
   is inert when there is nothing to drive, exactly as the gate-off
   det-gate requires.
2. **CO-PRIMARY GO: wins armed=12, control=0 (the wintrace bar).** All 12
   sittings converted — the landed drain + windefer discipline did the
   rest (tableAnswers=60, 5 per run; holds=0 — day ≥ 90, so the hold
   discipline never binds; the drain walks immediately). The win-side
   stack is no longer inert on current master.
3. **Guardrails all GO.** national 6/16 armed vs 6/16 control (bar ≥ 4).
   Matched non-winning median survival 71.0d armed vs 71.0d control (bar
   ≥ 61.0d) — n=4 pairs, small but exactly equal; the all-runs median
   (90.0d vs 120.5d) is the pre-registered wintrace confound (wins end at
   d90), which is why the matched computation was pre-registered. No new
   death mode: armed's death modes are a subset of control's (control
   additionally shows starvation×1, alien×1, The Big Beast×1).
4. **Wave-5 reads 1/16 armed vs 5/16 control — run-truncation, not a
   content regression.** Control's four extra wave-5 unlocks happen at
   d112–176; armed's wins end the run at d90. Future win-side metrics on
   wave reach must be computed on non-winning runs or pre-win windows —
   proposed revision for the next run's pre-registration.
5. **guardRefused=0 on both sides.** No exiled/joined runs occurred in
   this sweep, so the guard-classification path is fixture-proven only
   (the proof's exiled/joined/dead-scholar fixtures) and unobserved in
   the wild. Not a gap — the precondition logic is exercised — but worth
   stating.
6. **Path diversity is the drain's, not the driver's.** All 12 wins cost
   exactly 5 answers; the drain walks options[0] (the fixture walked
   assimilated, s22 walked feared — the first earned path varies by run
   state, but the driver never picks). A sibling arm owns path selection
   (windefer's notes); this arm's scope ends at opening the door.

## Results — the seat driver lands (GO on every binding metric)

Proof scripts/test-seatdrive-20261015.js 26/26 GREEN (REAL-RED on
constructed invited-but-unseated fixtures: gate-off takes no seat — the
census finding reproduced; gate-on takes it, tableDone set, the paths
modal opened for the drain; exiled/joinedVillage → sdGuardRefused with
zero attempts; dead scholar → precondition, zero attempts; det-gate
16/16 identical day-hash trajectories at 60d gate-off; SMOKE green).
Sweep scripts/sweep-seatdrive-20261015.js, SMOKE gate green before the
sweep (layer-live markers honest both sides).

Substrate: 8 seeds × {leadfeast, belongfeast} × {control, armed}, 180d
death-aware, FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1
(asserted up front), identical seeds both sides, own control in the same
sweep. control = seatdrive-wrapped stack, SEATDRIVE unset + WINPURSUIT=1
+ WINDEFER=1. armed = same + SEATDRIVE=1.

| metric | control (16) | armed (16) | bar | verdict |
|---|---|---|---|---|
| sittings | 0 | 12 | ≥1 | GO |
| wins | 0 | 12 | ≥1 | GO |
| national | 6 | 6 | ≥4 | GO |
| invitations (table) | 15 | 15 | — | — |
| wave-4 unlocks | 14 | 14 | — | — |
| wave-5 unlocks | 5 | 1 | — | truncation (see metric review 4) |
| exiled | 0 | 0 | — | — |
| median survival (all) | 120.5d | 90.0d | — | confounded (see 3) |
| median survival (matched non-winning, n=4) | 71.0d | 71.0d | ≥61.0d | GO |
| table answers | 0 | 60 | — | the drain engaged |
| guard refusals | 0 | 0 | — | classified, none occurred |

Per-seed JSONs: evidence/2026-10-15/perseed-seatdrive/
(<policy>-<side>-s<seed>.json, each with numeric national, table, wins,
exiled, sittings). Beat captures:
evidence/2026-10-15/seatdrive-beats/ (ring buffer, table/seat/death
language).

The mechanism, per run: the invitation beat fires ("◈ THE TABLE IS SET.
A ring of pale light waits — take your seat from Haven when you are
ready. Nothing is final until you sit."), the next dawn the driver takes
the seat (sdSeatTaken, seatDay=90 on all 12 — the invitation fires at the
floor and the driver sits immediately), the windefer daily drains the
7-door modal with the hold discipline (day ≥ 90: never hold, walk now),
the path challenge plays its beats, the win resolves. 12/12 sittings →
12/12 wins, 5 answers each.

## Village assessment (plain words)

Twelve villages sat down and won. They are the same villages the census
watched die waiting — belongfeast s22 died d101 of combat with a lesser
seat priced and nobody to sit; this run it sits at d90 and wins. The
driver didn't make them stronger or richer; it gave them hands. The
invitation was always the cruelest line in the game ("Nothing is final
until you sit") because the policy had no hands to sit with. Now it does.

The four villages that didn't sit tell the honest remainder: three died
young of combat before the ninetieth dawn (the same combat attrition
that dominates every window — 'combat' ×285 + 'villager combat' ×132 on
the control side), and one did everything right — national, survived to
the horizon — and was never invited at all, because it never faced 3
distinct wave-3 monsters. The driver's scope ends at the seat; the
wave-3 bar and the combat pressure are other arms' work, unchanged by
this layer (national 6=6, death modes a subset).

The belong road's villages that sat won from regional standing with
lesser seats — competent non-god play reaching the table, which is
TABLE.md's reachability target. Nobody was exiled; the guard stayed
quiet. Nothing about the wins reads cheap: the audit priced real deeds
(16/8/3 waves faced, 9 contests, 3 crises on the sense-read run), the
light branch was earned from the ledger ("The food truth was shared"),
and the finale's mercy beat landed because the run had lived it.

## Sense-testing

One full sitting transcript, belongfeast-armed s22 (win d90), read end
to end (evidence/2026-10-15/seatdrive-beats/belongfeast-armed-s22.json,
389 beats):

- **The village before:** reads like people — Nadia's unnamed wanting
  ("The wanting is real. The word for it isn't 'to belong somewhere'"),
  the well that won't fill itself, raids from Thornfield and Emberhold,
  funerals that stop the village ("Somebody screams. Somebody else
  starts digging"), knowledge drawn in dirt ("It'll wash away. The
  knowledge won't"). Nothing robotic; the starvation spiral and raid
  beats repeat with the known template fingerprints (sim-findings
  #302), but the texture holds.
- **The invitation (d90):** "◈ THE TABLE IS SET. A ring of pale light
  waits — take your seat from Haven when you are ready. Nothing is final
  until you sit." Honest and unadorned — the same line the census
  called the cruelest in the game, now answerable.
- **The seat-taking:** the next beats are the engine's audit, not the
  policy's — the driver adds no narration of its own, and it shouldn't:
  "◈ THE TABLE — it is not a table. It's a ring of pale light, and
  around it, things with too many angles to be faces." Then the audit
  prices the actual run: "A lesser seat — regional standing, waves 1–3
  faced (16/8/3), 9 contests survived, 3 crises weathered. The table does
  not rise. It prices." Real numbers, real deeds — the pricing is the
  run, not a menu.
- **The path walk (feared, light):** "Look what eating built." — the
  food thesis pays off dramatically, on the record. "The table has read
  your ledger. The food truth was shared. The light road is open."
  "You spend it — the shield, not the sword... Protective terror: the
  table writes it down and doesn't understand it, which is the point."
- **The win:** "The most frightening thing you ever did. The table
  doesn't know what to do with mercy from a predator. Neither do you,
  quite. But the audience weeps, and the galaxy learns that the feared
  one chose gentleness — and that choice echoes longer." Then: "You won.
  Say it plainly: you won."

Judgment: meaning and coherence pass. The arc is earned — a named
village's ledger, priced aloud, resolved through a branch the ledger
earned. The drain's 5 answers don't read as button-mashing; each beat
advances the scene. Nothing in the sequence needed a human's hands to
feel deliberate — except, structurally, the one pair of hands the
driver supplied.

## Findings filed

- (this arm) The seat-taking driver works and the win-side stack is live
  on current master: 12/12 sittings → 12/12 wins on identical seeds
  where control sat 0 and won 0. Recommend landing as-is (policy-side,
  default OFF, gate-off byte-identical).
- sim-findings #294's lesson held in the wild by absence: zero guard
  refusals in 32 runs (no exiled runs). The classification is
  fixture-proven; a future sweep that exiles scholars would exercise it
  live.
- Metric-design note for the next win-side arm: wave-reach metrics must
  be computed on non-winning runs or pre-win windows — wins truncate at
  d90 and read as content regressions otherwise (metric review 4).
- Out of scope, documented: the drain walks options[0] (path selection
  is a sibling's); wave-3 bar still binds the s44 national (never
  invited); combat attrition still kills 3/8 belong villages before the
  floor.
