# sim-modalplay — the modal driver (flesh-out loop, axis scale-onramp, 2026-10-17)

Run: fleshout-20261017T1405Z (worker). Policy layer: `scripts/policies/modalplay.js`
(MODALPLAY=1, default OFF), composed over the takeseat road
(`leadmodalplay`/`belongmodalplay`). Proof: `scripts/test-modalplay-20261017.js`
(19 checks: RED/GREEN, #452, witness honesty, trial carve-out, det-gate
byte-identical). Sweep: `scripts/sweep-modalplay-20261017.js`
(log: `evidence/2026-10-17/modalplay-sweep.log`).
Per-seed: `evidence/2026-10-17/perseed-modalplay/`.
Probe (door-offer structure): `scripts/probe-modalplay-doors-20261017.js`.

## PRE-REGISTERED HEADER (binding — MEASUREMENT.md §§9-12, 14)

- **Primary metric**: wins(armed) − wins(control) over the pilot.
- **GO threshold**: ≥ +3/16 (takeseat's bar — the layer must move wins, not just sittings).
- **Horizon**: 180d death-aware (dead villages stop +10d tail; never a fixed grind).
- **Seeds**: 8 FRESH seeds 9901–9908 (never 9701–9708) × {leadfeast, belongfeast}
  × {armed, control} = 32 runs, identical-seed armed/control pairs.
- **Policies**: substrate FEASTSCALE_R13=1, SEATDRIVE=0 (explicit), TAKESEAT=1
  (both arms sit via the takeseat driver — the modal opens on both arms).
  ARMED adds MODALPLAY=1. CONTROL = bare takeseat policy (MODALPLAY unset —
  the sim-takeseat baseline: the modal opens, nobody answers, wins 0/16).
- **Guardrails** (all binding): national ≥ control−2; median survival ≥
  control−10d; no new death mode; det-gate byte-identical with the layer off;
  SMOKE green.
- **Metric binding (§14)**: a miss is NO-GO, never re-scored against a
  friendlier metric mid-run. Doubts about the metric go under "metric review"
  and apply to the NEXT run. Convergence verdict reported every run.

## PRE-REGISTERED DOOR RULE (finding #452 — POLICY-SIDE, NOT canon)

The layer NEVER chooses doors via options[0] (that would be feared, by
index.html load order — a substantive choice made by accident). At the
7-door offer (every option id `path:`):
1. Read `Game.tableEarnedPaths()` — the engine's own audit pricing
   (strength 0–100, voiced aloud at the table: "the table prices the run").
   Engine-honest input, not load order.
2. Candidates = offered doors that are EARNED per that pricing. A door never
   offered cannot be taken — recorded, never forced.
3. Choose the candidate with the highest strength.
4. Ties: fixed preference `['beloved','feared','relay','assimilated',
   'defiant','witness','indispensable']` — policy-side, not canon: prefer the
   door that plays the feast road's demonstrated engine (audience/community:
   beloved) over the terror tightrope (feared); the scale-independent relay
   next; the always-open safe doors (assimilated, defiant) over the
   never-offered ones; witness/indispensable last (dead substrate /
   full-seat-only on this road — listed for completeness).

BEAT RULE (challenge/finals/demand-price/conscript/downgrade): challenge and
finals take the first presented option — the winpursuit drain precedent
(beats are an authored live sequence, first option = the straightforward
walk, NOT load order; the door choice is the only load-order-sensitive pick
and that is where #452 bites). Carve-out: NEVER any option id containing
'trial' (trial-by-combat is opt-in existential risk — a Steve call, never a
policy default). Downgrade re-applies the DOOR rule to the remaining earned
paths. Conscript is refused (policy-side call; canon TABLE.md: refusable, and
the refusal is voiced "The mourners exhale"). Demand-price takes the first
presented option (drain precedent).

WITNESS HONESTY (finding #452): the witness door's prereq
(ledger.exposed ≥ 3, src/js/table-witness.js) is dead substrate on this road
— exposed 0 on all 6 probe runs, door never earned, never offered. The layer
only ever picks from EARNED offered doors; the proof pins that an
offered-but-unearned door is never taken and that no honest pick means no
answer (never forced).

## The probe (pre-pilot, seeds 9801–9803 — not pilot seeds)

All 6 probe runs (3 seeds × 2 roads) reached the identical offer at day 90:
EARNED feared (100), beloved (98–100), assimilated (45–50), defiant (36–44),
relay (40); NEVER earned: indispensable (full-seat-only), witness
(exposed=0 < 3 — dead substrate 6/6). Option ids in registration order:
path:feared, path:beloved, path:assimilated, path:defiant, path:relay.
Ties at the top (feared 100 vs beloved 100) are common — the tie-break fires
for real, not just in principle.

## Pilot results

32/32 runs completed, EXIT 0. Substrate asserted up front (FEASTSCALE_R13=1,
SEATDRIVE=0 explicit, TAKESEAT=1 — sweep stops otherwise).

| | armed (MODALPLAY=1) | control (takeseat only) |
|---|---|---|
| wins | **13/16** | 0/16 |
| tableDone | 13/16 | 13/16 |
| national | 10/16 | 11/16 |
| median survival | 90d | 182d |
| doors played | feared@100 ×4, beloved@100 ×9 | — |
| modal answers | 5 per seated run (door + 3 beats + final) | 0 |

**PRIMARY: +13 (GO iff ≥ +3) → GO, decisively.** Every seated armed run
(13/13) played the modal to a win the same dawn the seat was taken. The
three armed non-wins died BEFORE the seat (d34, d49, d88) — seed-identical
on both arms; the layer never saw a modal there.

Guardrails:
- national 10/16 ≥ control−2 (9) ✓
- median survival 90d vs control 182d — LITERAL MISS (see metric review).
  Intent (no added mortality): PASS — pre-seat deaths seed-identical
  (d34/d49/d88 both arms); every other armed run ended by WINNING.
- no new death mode ✓ — death-cause sets match across arms (villager
  combat, sickness, combat, wounds, starvation, monster, expedition,
  contest, ambush, dehydration, Choir Toad on both; control's extra
  singletons — lockjaw, 'the expedition', alien — are rare modes in
  longer-lived controls, not layer-introduced).
- det-gate byte-identical with layer off ✓ (proof test, 60d harness).
- SMOKE green ✓ (proof test, 18 stub checks).

Tripwires: witnessTaken 0/16 ✓ (dead substrate confirmed — never offered,
never taken); trialSkipped 4/4 feared walks ✓ (the trial option was
presented and refused every time); driveError 0; doorNoHonest 0.

Beat anatomy (all 13 wins): feared walks play
path:feared → beat:kill → beat:lean → beat:spend → final:mercy (4/4
identical — the drain's first-option walk is deterministic on feared);
beloved walks play path:beloved → beat:hunter → beat:song →
beat:quiet (5/9, light/Eulogy) or beat:cut (4/9, dark/Edit Bay — the
engine's branch-conditional second beat, first-presented either way) →
final:audience (9/9). Every terminal in the table engine sets won=true
(table.js ×4) — a completed drain is a completed story, never a wipe
(TABLE.md law 4).

TELEMETRY DEVIATION CHECK: LOUD lines were schema artifacts, investigated
same-run — the baseline `scale-wall.json` uses keys `wins`/`table`
while this sweep's per-seed schema uses `won`/`tableDone` (and
`nationalDay`, not `national`). Verdict: EXPLAINED, not a real deviation.
Did NOT roll the baseline forward: the key mismatch plus unestablished
baseline provenance (which run/policy produced `wins:16`?) make
--update-baseline a corruption risk. Substantive comparison: armed wins
13/16, tableDone 13/16 armed + 13/16 control, national 10/16 + 11/16.

## Sense-read (SENSE-TESTING LAW)

Feared walk (leadfeast/s9901, d110): the audit prices the run aloud
(lesser seat, regional, waves 1–3 at 8/8/3, 12 contests, 4 crises); the
door grants Dreadfield, War-table, Oathbound, Shieldbearer — all voiced.
Beats: "The deer. The cleanest kill. The table goes very still. Behind
you, your own people go still too — a different stillness."
→ "You let them see it. All of it." → "You spend it — the shield, not
the sword... Protective terror: the table writes it down and doesn't
understand it, which is the point." Final: "Show mercy" (light branch —
"The table has read your ledger. The protected outnumber the killed; the
food truth was shared. The light road is open."). Win: "You won. Say it
plainly: you won. The village endures. The table signed."

Beloved walk (leadfeast/s9902, d118 — the tie-break door, 100/100):
audit at GLOBAL standing, 15 contests, 1 ascension ("its terms improve
accordingly. Nobody has ever seen that before."); grants Spotlight,
Standing-O, Eulogy. Beats cast a NAMED villager — "Desmond tells the
hunt — the real one, with the fear left in" — then the feast song:
"Trillions of beings who never ate anything hear it and feel hungry for
the first time" (the food thesis, sung at the table), then "You spend it
all... on people the cameras never found. You name the unfilmed
villages. You name the dead." Final: "Let the audience speak" — "You
made popularity into a constitution." Win: "The terms held — the table
had priced the village, ascension and all, and the village paid in
full."

Both walks read as coherent stories with real stakes: the village's
actual people and its food thesis do the work at the table. The drain's
first-option beats happen to walk the light road on both doors here —
that is the authored sequence's shape, not a policy choice; the policy's
choice was the door, and it was the table's own pricing.

## Village assessment

What the villages looked like at the table: feast-road villages arriving
with 25–35 distinct monsters faced blow-by-blow, viewership in the
high 20s–30s, fan favor 21–48, stage-3 neural integration, defiance 4–5
on the record, 2–15 contests survived. The table priced every one of
them at feared 100 / beloved 98–100 — the road's two demonstrated
engines (fighting and feasting) both max the audit. Villages that sat
won the same dawn; villages that never sat either lived on at national
(the control's honest story: seated, waiting, unanswered — the named
gate, now closed) or died seed-identical deaths the layer never touched.

## Blanks filled / documented

- **FILLED (finding #480's named next gate)**: the table modal on the
  feastscale road now has a driver — `scripts/policies/modalplay.js`
  (MODALPLAY=1, default OFF; zero src/js changes). 13/16 wins where
  0/16 won before, on identical seeds, with the door choice made by the
  table's own audit pricing (never options[0] by load order — #452).
- **DOCUMENTED (dead substrate)**: the witness door cannot be earned on
  this road (ledger.exposed = 0 on all 6 probe runs; prereq needs ≥ 3).
  No exposure-generating mechanics exist on the feastscale road. If a
  future loop wants the witness door reachable, the substrate needs an
  exposure source — filed to sim-findings.md.
- **DOCUMENTED (metric)**: the median-survival guardrail as written
  measures run-end, not mortality — see metric review.
- **DOCUMENTED (telemetry)**: the scale-wall baseline's per-seed schema
  (`wins`/`table`/`national` keys) doesn't match this sweep's schema
  (`won`/`tableDone`/`nationalDay`) — the LOUD lines were investigated
  and explained; baseline NOT rolled forward (provenance unestablished).

## Metric review

The median-survival guardrail (armed ≥ control−10d) is structurally
wrong for a win-producing layer, and this run proves it: armed median
90d vs control 182d is a LITERAL MISS, but every armed run either won
(the engine ends the run on every table resolution — table.js sets
over=true at all four terminals; a win is not a death) or died on the
exact same day as its seed-identical control (d34/d49/d88). The layer
adds ZERO mortality; the guardrail punishes winning because wins end
runs. The guardrail's intent (don't land something that kills villages)
is fully satisfied — its letter is broken by the win mechanic itself,
which no win-producing layer can satisfy jointly with PRIMARY ≥ +3/16.
This is recorded as a miss, NOT re-scored: the verdict follows the
pre-registered PRIMARY (GO at +13). PROPOSED for the next run: replace
the guardrail with a death-aware formulation — e.g. "pre-win/pre-seat
deaths seed-identical; death-cause distribution parity on non-winning
runs" — which is what this run actually demonstrates.

Second note (for the integrated method): Steve's 2026-10-17 shared-
measurement order (balanced panel, MEASUREMENT.md §15) landed mid-run.
Per §14 this run's pre-registration stands — the panel is the instrument
going forward, §14 remains the judge. Next run's evidence should use the
panel schema for per-seed files so the telemetry baseline compares
cleanly.

## Convergence verdict

**Converging.** The scale-onramp's national→table→wins chain now runs
end to end on the feastscale road: national 10–11/16, table 13/16, wins
13/16 armed (0/16 control). The blocking gate named in sim-takeseat.md
("the modal opens and nobody answers") is closed by this layer. What
remains on the axis: the win-side diversity (only feared/beloved walked
so far — the audit prices them at 100 and the rule follows the pricing;
assimilated/defiant/relay never outprice them here), waves 4–5 unlocks,
and whether the witness door's dead substrate matters for the axis.
