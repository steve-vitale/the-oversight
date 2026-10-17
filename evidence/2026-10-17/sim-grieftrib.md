# sim-grieftrib — grief-tribute negotiation on the subordinate road (2026-10-17)

Run: flesh-out loop arm sim-grieftrib, scale-onramp axis, findings #459/#460
follow-up. Policy-side lever (scripts/policies/grieftrib.js, GRIEFTRIB=1
default OFF; ZERO src/js changes). Canon: docs/CANON.md, docs/SCALE.md
(raids, tribute, the scale ladder — "the climb (renegotiate, bid for
primacy)"), docs/PROGRESSION.md. No canon invention: the renegotiation beat
(`answerRenegotiation`: gift/visit/wait) and the GRIEF COALESCES guard are
engine canon; the layer stages the existing beat where the engine previously
grabbed automatically.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE the sweep)

**Question (sim-compoundidx diagnostic, evidence/2026-10-17/sim-compoundidx.md):**
grief-leveraged tribute fired on 8/17 compound runs (terms 7,500–11,250
kcal/week), ALL on the belongfeast/subordinate road: grief events let the
dominant link ratchet tribute terms up (×1.5 per grab, twice per link since
the 2026-10-17 gap-closure cap). Lead holds primacy so grief finds nothing
to leverage there. On the subordinate road, can a policy-side response cap
or negotiate the grief-leverage ratchet?

**The engine's handle (mapped before building — the FAST-KILL path was
ready):** `_griefLeverage(link)` (src/js/hierarchy.js) fires automatically
inside `successionCrisis` for mature (≥21d) subordinate-road links — no
beat, no negotiation, no refusal verb. BUT the engine also owns
`answerRenegotiation(linkId, 'gift'|'visit'|'wait')` (the young-link beat)
and the GRIEF COALESCES guard (a link with `pendingRenegotiation` staged
returns 'grieving' — no grab, no haircut, no mourning). The layer stages the
engine's beat before the grab path runs, then answers it the same event:
'gift' (1,500 kcal, trust +8) when the pantry carries it above the 2-day
floor, else 'visit' (2-day speaker, trust +5). A handle exists → the arm
proceeds (no invented canon verbs).

**Corpus:** 8 fresh seeds (9921–9928) × {leadfeast, belongfeast} × {control,
GRIEFTRIB=1}, 180d death-aware, own paired control, same sweep. Substrate:
FEASTSCALE_R13=1, SEATDRIVE=0. Seed-collision assertion: no evidence/
filename contains 9921–9928 (checked 2026-10-17). The layer does not touch
the clock (finding #490 n/a — endReason reported, scholar.day not read as
survival for any treatment comparison).

**PRIMARY (belongfeast runs only — the subordinate road):** mean per-run max
weekly tribute terms on subordinate-road links (`subTermsMax`), armed ≤
0.75× control, identical seeds, own control same sweep. The layer's intent
is armed subTermsMax == base terms (no ratchet).

**SUBSTRATE CHECK (not a kill):** control belongfeast runs must show ≥ 1
grief grab total. If zero, the verdict is INCONCLUSIVE (no substrate), not
NO-GO — §14a taxonomy: substrate-missing.

**GUARDRAILS:** national formations armed ≥ control−2/16; broken
subordinate-road links armed ≤ control (no link collapse); mean end-run
trust on active subordinate-road links armed ≥ control−5; no new death mode
at n≥3; table/wins report-only. DETGATE D1/D2 byte-identical (D3: armed
runs where the layer never staged a beat must match control exactly).

**SECONDARIES (report-only):** grief grabs landed, beats staged/answered,
leverage landings, tribute paid totals, wave reach, exiled.

**Proof:** scripts/test-grieftrib-20261017.js — RED: gate-off delegates
(R1), the grab lands unopposed (R2: 4000→6000, grabs 1, trust 50→42).
ARMED: beat staged + 'gift' answered (A1: terms 4000, grabs 0, trust
50→58, pantry −1500, "grief met with grain" said aloud); thin pantry →
'visit' (A2); young link → engine stages its own beat, layer answers (A3);
already-grieving → skipped (A4); grabs spent → cap's refusal holds (A5);
lead road untouched (A6: tribute pressed DOWN ×0.75 as designed); armed
determinism (A7); zero src/js + no RNG/Date (A8). RED→GREEN recorded.

**Panel (§15):** before/after through scripts/balance-panel.js +
scripts/balance-metrics.json — the panel is the instrument, the
pre-registered primary is the judge. Compare .md attached below.

## Method

Layer: scripts/policies/grieftrib.js. On first daily (GRIEFTRIB=1 only) it
persistently wraps `Game.successionCrisis` — the single funnel for
Haven's-speaker-death grief on hierarchy links (via onLeaderDeath ←
registerDeath, and via covenantCrisis for non-peer links). Before
delegating, it stages `pendingRenegotiation = {day, sub: true}` on a
*stageable* mature subordinate-road link (active, Haven subordinate,
≥21d old, not already grieving, grabs left); the engine's coalesce guard
then returns 'grieving'. After delegating, it answers every staged beat on
the subordinate road (gift iff pantry ≥ 1500 + 2×dailyBurn, else visit —
never 'wait'). Peer leagues, the lead road, theirLeaderDied's ×0.75
renegotiation, and spent (2/2) links are untouched.

Sweep: scripts/sweep-grieftrib-20261017.js (SMOKE + DETGATE gates before
spend). Grief instrumentation sits OUTSIDE the layer (wraps
Game._griefLeverage, counts landed grabs + terms — identical both arms).
Per-seed JSONs with canonical wall keys (finding #482):
evidence/2026-10-17/perseed-grieftrib/grieftrib-<policy>-s<seed>-<arm>.json.

## Results

Corpus: 32 runs (8 fresh seeds 9921–9928 × {leadfeast, belongfeast} ×
{control, GRIEFTRIB=1}, 180d death-aware, substrate FEASTSCALE_R13=1
SEATDRIVE=0). Seed-collision assertion clean (no 9921–9928 in evidence/
filenames). Per-seed JSONs:
evidence/2026-10-17/perseed-grieftrib/grieftrib-*.json.

**PRIMARY (belongfeast, n=8/arm): mean subTermsMax control 11,250 →
armed 5,125 kcal/week, ratio 0.46 ≤ 0.75 → GO.** Substrate check: 24 grief
grabs landed on control belongfeast runs (substrate present, strong).
Armed: 0 grabs landed on all 16 armed runs; 61 beats staged, 65 answered
'gift' + 13 'visit' (78 answers — the 17 extra are engine-staged
young-link beats the base policies leave unanswered). The ratchet is fully
converted into played negotiation.

Per policy:
- leadfeast (Haven primary): 0 grabs, 0 staged, terms 0 both arms — the
  layer is inert on the lead road by design (grief finds nothing to
  leverage; their-speaker deaths raise Haven's income, untouched).
  National 8/8 both arms, table 8/8, wins 0/16.
- belongfeast control: 24 grabs, terms 11,250, national 7/8, table 8/8,
  wins 0/16, median survival 158.5d, wave-4+ 0/8.
- belongfeast armed: 0 grabs, terms 5,125, national 8/8, table 8/8,
  wins 0/16, median survival 149d, wave-4+ 2/8.

**GUARDRAILS (all 16/arm):** national 16 armed ≥ 13 (control 15) OK; broken
subordinate-road links 6 ≤ 6 OK (no link collapse); mean end-run trust on
active subordinate links 82.5 ≥ 44.8 (control 49.8 − 5) OK; no new death
mode at n≥3 OK (armed death-mode set ⊆ control's); table 16/16 both,
wins 0/16 both (report-only — the feastscale substrate has no table-modal
driver; see the sim-takeseat finding, unchanged by this layer); exiled 0/32.

Wall numbers (armed / control): national 16/15, table 16/16, wins 0/0,
wave-4 unlocks 3/1, wave-5 unlocks 0/0, median survival 180/180 (all-arm;
belong-only 149/158.5).

Tribute paid totals: armed 1,448,119 vs control 1,713,776 kcal — the
village pays ~265k kcal less because terms never ratchet; the dues are
still paid (no payment verb was touched).

**Panel (§15):** before/after panels built with scripts/balance-panel.js
(8 seeds × {grieftrib-lead, grieftrib-belo} × 180d; both panels valid —
sourcesStable, neutrality proofs match, contract digests identical).
Compare decision: **review_required** (screen only, 8 pairs):
[panel-grieftrib-compare.md](evidence/2026-10-17/panel-grieftrib-compare.md).
Per §15 the panel is the instrument, not the judge — the pre-registered
GO stands; the review_required is an investigation note, recorded here:
- grieftrib-lead: ALL 23 metrics delta 0 (byte-identical trajectories —
  the layer is provably inert on the lead road, as designed).
- grieftrib-belo: one **regression_signal** — "Player named-class access"
  1.0 → 0.5 (−0.5, 95% exploratory interval −0.875 to −0.125), 4/8 seeds
  flipped 1→0 (9922, 9923, 9924, 9927). Investigation: no direct
  mechanism exists (the layer touches tribute terms, trust, and pantry
  kcal only — never godpath, classes, or abilities). The flips do not
  track layer activity (staged counts on flipped seeds: 5, 6, 10, 4 vs
  keeps: 11, 4, 9, 12) and 3/4 flipped after-runs ended earlier than their
  before-pair (fewer bearer-lifetimes to acquire a class); the 4th (9924)
  ran longer (154d vs 128d) with 8 distinct bearers, none of whom acquired
  a class — trajectory divergence on a small-n binary metric. Verdict:
  noise on an 8-pair screen, no plausible causal path; not a re-score
  trigger. A 12–16-seed confirm would be the place to re-check it.
- regression_watch (small, intervals ~include 0): player deaths/run
  +0.375, living NPCs −0.32, hydration<25% +0.021, NPC class access −0.034.
  Community loss rate IMPROVED (−0.125); national access +0.25 (0.75→1.0).
- No metric moved on the lead road; nothing in the panel contradicts the
  sweep's guardrails (national, trust, death modes, no link collapse).

## Telemetry deviation check (loop step 10)

`telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current 'evidence/2026-10-17/perseed-grieftrib/*.json' --metrics
national,table,wins,exiled` fired 3 LOUD lines — all investigated
same-run, all corpus-composition artifacts, NOT treatment effects:
- `national swung 158%: baseline 12 -> current 31` — the baseline's 12
  comes from a smaller/different corpus; this run is 32 courtship-road
  runs where national is near-ubiquitous (31/32). Within-corpus:
  control 15/16, armed 16/16.
- `table swung 100%: baseline 16 -> current 32` — same: 32 runs vs the
  baseline's 16. Within-corpus: 16/16 both arms.
- `wins disappeared: baseline 16 -> current 0` — the baseline corpus was
  built with a table-modal driver (take-seat/modalplay wins); this corpus
  is the plain feastscale substrate (no modal driver → 0 wins by substrate
  design, the documented sim-takeseat gap). Within-corpus: 0/16 both arms.
Baseline NOT rolled forward — rolling a different substrate's counts into
it would corrupt the rolling baseline. Verdict: no wall deviation from
the GRIEFTRIB treatment.

## Metric review

1. The `leverageLandings` instrument (beats matching /leverage/i) is
   contaminated: 8/8 leadfeast runs on BOTH arms count 1 each from the
   national-beat line "a realm isn't leverage — it's seasons"
   (src/js/hierarchy.js:645), not from a grab. The exact instrument is
   `grabsLanded` (wrapping `_griefLeverage`'s return): control 24, armed 0.
   The primary (subTermsMax) is unaffected. Proposed for the next run:
   anchor the regex on "Grief is leverage" / "Grief became leverage" only.
2. Median survival on belongfeast (149 armed vs 158.5 control) reads lower
   armed, but endReasons favor armed (5 lost/3 survived vs 6 lost/2 lost)
   and the layer does not touch the clock (finding #490 n/a) — the delta
   is run-out noise on 8 seeds, not a treatment effect. No guardrail was
   set on survival; none is proposed — the pre-registered guardrails held.
3. The primary's 0.75 bar was generous against the measured 0.46 — the
   layer doesn't just cap the ratchet, it deletes it (grabs 0/16). A future
   run could tighten the bar or test the visit-heavy regime (thin-pantry
   villages where the gift is unaffordable — 13/78 answers here).
4. Per §14: no re-scoring was done; the GO stands on the pre-registered
   primary.

## Village assessment (plain words)

**What the villages looked like.** On the belong road, the first month is
courtship as usual — Stonebridge, Thornfield and the other near fires take
Haven's grain and the links season. Then the deaths start, and on the
control runs the grief turns into arithmetic: "With Haven grieving,
Stonebridge installs their own speaker at the table. Tribute rises to
11,250 kcal/week. Grief is leverage, and they know it." Twice per link,
then the card is spent — but 11,250/week is the number the pantry has to
carry for the rest of the run. On the armed runs the same funerals play
out, and the same new speakers arrive — but Haven's new bearer answers the
same day: "🕊️ Haven sends 1,598 kcal to Stonebridge's fire — grief met
with grain. The new speaker eats with Haven's people and the tribute stays
where it was. (Trust +8.)" When the pantry is thin, no grain goes —
instead "🚶 Haven's speaker rides to Stonebridge's fire for two days — a
face for the grief, not a ledger. The tribute stays where it was. (Trust
+5.)" The feasts keep their honesty too: "The laughter stays low —
somebody's seat is empty, and everybody sees it."

**Who thrived.** The negotiators: trust on subordinate links ends at 82.5
armed vs 49.8 control — the villages that answer their grief are *liked*
better, not just taxed less. National holds 8/8 armed (7/8 control); the
table is reached 16/16 either way. Nobody wins on this substrate (no modal
driver — the known sim-takeseat gap), but the villages live their seasons.

**Who died and why.** The mantle passes constantly on both arms — the
d29–d147 transcript is a roll call of dead bearers (Jerome, Seymour,
Hannah, Dominic, Ruben, Peyton, Diana, Kurt, Ava, Ruth, Luis, Valeria,
James, Kupe). Death causes are violence-led as usual (combat 496–529,
villager-combat ~160, monster ~70–77 per 16 runs); starvation is 2–3.
The layer changes no death mode — it changes what the deaths *cost*.

**What was missing.** Nothing new surfaced: the blank this run filled was
the one it was assigned. The win gap (table reached 16/16, wins 0/16) is
the documented modal-driver gap, not a grief-tribute effect.

**Which blank was filled.** The compoundidx assessment's "grief-leverage
answer on the subordinate road: nothing in the policy negotiates tribute
down or refuses the grab." Now something does — policy-side, zero src/js:
the engine's own renegotiation beat, staged where the grab used to land
automatically, answered the same event with real costs. 24/24 control
grabs → 0/16 armed; terms 11,250 → 5,125.

## Blanks filled / documented

- **Filled:** the grief-leverage negotiation layer
  (scripts/policies/grieftrib.js, GRIEFTRIB=1 default OFF) + proof
  (scripts/test-grieftrib-20261017.js, RED→GREEN) + sweep
  (scripts/sweep-grieftrib-20261017.js + 4 chunk logs) + aggregator
  (scripts/aggregate-grieftrib-20261017.js) + sense script
  (scripts/sense-grieftrib-20261017.js) + sense transcript
  (evidence/2026-10-17/sense-grieftrib-9921-armed.txt). Verdict: GO on the
  pre-registered primary (0.46 ≤ 0.75), all guardrails green.
- **Documented (metric review):** the /leverage/i beats-regex contamination
  (8 artifact counts from the national-beat line); proposed anchored regex
  for the next run. No canon was invented — the beat, the guard, and the
  "grief card is spent" refusal are all engine canon; the layer only moves
  the beat to where the grab lived.
- Reachability: waves 1–3 reachable both arms; wave-4 3/16 armed vs 1/16
  control; wave-5 0/16 both; national 16/16 armed; table 16/16; wins 0/16
  (substrate modal-driver gap, unchanged).
- **Panel (§15):** before/after panels
  (evidence/2026-10-17/panel-grieftrib-before/panel.json.gz,
  panel-grieftrib-after/panel.json.gz) + compare .md/.json
  (evidence/2026-10-17/panel-grieftrib-compare.md) committed per §15
  (panel.json.gz + compare only — the cases/ caches are NOT committed).
  Compare decision review_required; investigation recorded under Panel
  above; pre-registered GO stands.
