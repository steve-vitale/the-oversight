# sim-wintrace — table→win diagnostic (flesh-out loop A ARM 2, 2026-10-15)

Run: fleshout-a-20261015T0915Z, ARM 2 of 2 (sim-wintrace).
Claims: sim-findings #233 (TABLE REACHABLE ON THE LEADFEAST ROAD — table
reaches measured, wins 0/20; "arrival-side movement for the scale wall on
this road; the win side unmoved").
Axis: scale-onramp (standing scale directive; the win side of the wall).
Canon: docs/CANON.md + docs/TABLE.md + docs/ENDGAME-BUILDS.md.

## Pre-registration (MEASUREMENT §§9–12, 14 — binding; a miss is NO-GO)

**Question:** on table-reaching runs, is the win unattempted (policy gap),
unpassable (mechanics gap), or unreachable (design gap)?

**PHASE 1 — diagnostic instrument.** Build a table→win trace instrument
(seat reached → paths qualified → path entered → challenge attempted →
outcome → win / no-win reason) and attribute EVERY table run in the sweep.

- PRIMARY (binding): ≥90% of table-reaching traced runs fully attributed.
  "Fully attributed" = traced && verdict in a named bucket (anything but
  'unknown'). A miss is NO-GO: instrument repaired, evidence only.
- Substrate: 8 seeds (11/22/33/44/55/66/77/88) × {leadfeast, belongfeast} ×
  {control, traced}, 180d death-aware, identical seeds both sides, own
  control in the SAME sweep (CONTROL BASELINE DRIFT #247 — never inherit).
- Horizon: 180d death-aware. The win-day floor is day 90 and the deferred
  re-offer needs the days after; a shorter horizon would cut the chain.
- Policies: leadfeast/belongfeast = leadcourt/belongseek + r13 feast layer
  (FEASTSCALE_R13=1), the table road per #233.
- Instrument: scripts/policies/wintrace.js (WINTRAZE=1, default OFF,
  read-only sampling + Game.say passthrough). Zero src/js changes.
- Proof: scripts/test-wintrace-20261015.js (22/22 GREEN: REAL-RED on the
  traceless gap + the naive truncated-trace failure mode; synthetic walks
  for every verdict bucket; gate-off purity + traced-vs-untraced byte-
  identical day hashes on a real 30d sim).
- Gates before spend: SMOKE green, det-gate 16/16 identical on the traced
  policy (WINTRAZE=1).

**PHASE 2 — pursuit layer (ONLY if the diagnostic names a concrete policy
gap).** Env-gated, default OFF, policy-side only, zero src/js.

- PRIMARY (binding): table→win conversions armed ≥ control+1 on identical
  seeds.
- GUARDRAILS: national ≥ control−2/16; median survival ≥ control−10d; no
  new death mode at n≥3.
- A miss kills the layer per kill protocol (deleted, evidence kept).

## Metric review

The primary metric held: 8 table-reaching traced runs, all 8 fully
attributed (100% ≥ 90% GO). No revision needed. One instrument fix
mid-run (verdict ordering: horizon survivors with the sequence open are
'sequence-stalled', not 'finale-died') — the fix was proof-tested
(24/24) and the 5 affected seeds re-run on identical seeds (det-gate
16/16 byte-identical, so re-runs reproduce exactly).

## Results — PHASE 1 diagnostic (GO: 8/8 = 100% attributed)

Substrate: 8 seeds × {leadfeast, belongfeast} × {control, traced}, 180d
death-aware, FEASTSCALE_R13=1, identical seeds both sides, own control in
the same sweep. Instrument: scripts/policies/wintrace.js (WINTRAZE=1,
read-only; control-vs-traced wall numbers byte-identical — the instrument
is behavior-neutral). Proof scripts/test-wintrace-20261015.js 24/24
GREEN. SMOKE green. Det-gate 16/16 identical.

**The diagnostic names a concrete POLICY GAP — the win is UNATTEMPTED.**

All 8 table-reaching runs (lesser seat every time; 4–5 paths qualified)
ended with the table modal PENDING and ZERO answers:

| run | seat | paths | entered | answers | modal streak | verdict |
|---|---|---|---|---|---|---|
| belongfeast s22 | lesser | 5 | — | 0 | 122d | sequence-stalled |
| belongfeast s44 | lesser | 5 | — | 0 | 14d | finale-died (village-lost d158) |
| belongfeast s55 | lesser | 4 | — | 0 | 140d | sequence-stalled |
| belongfeast s66 | lesser | 4 | — | 0 | 119d | finale-died (village-lost d161) |
| leadfeast s22 | lesser | 4 | — | 0 | 106d | finale-died (village-lost d153) |
| leadfeast s33 | lesser | 5 | — | 0 | 92d | sequence-stalled |
| leadfeast s44 | lesser | 5 | — | 0 | 106d | sequence-stalled |
| leadfeast s66 | lesser | 5 | — | 0 | 119d | sequence-stalled |

Root cause: `leadcourt`/`belongseek` (the courtship roads that actually
reach the table) contain ZERO references to `tableRoad`/`tableChoices`/
`chooseTableOption` — only `winseek`'s own daily drives the modal, and
winseek never reaches the table on this tip. The table sits, the modal
pends for 14–140 days, and the run ends (death or horizon) with the
sequence still open. No path is ever entered; no challenge is ever
attempted. This is not a mechanics gap (the challenge machinery works —
see PHASE 2) and not a design gap (the seat prices correctly); it is a
policy gap: the table-driving verb exists but is wired to nobody on the
roads that arrive.

## Results — PHASE 2 pursuit layer

Instrument: scripts/policies/winpursuit.js (WINPURSUIT=1, default OFF;
drives the table modal via winseek's tableRoad at the start of daily).
Proof scripts/test-winpursuit-20261015.js 6/6 GREEN (honest RED: the table
was invited AND unanswered without the layer). SMOKE green. Det-gate
16/16 identical on traced+pursued. Zero src/js changes.

Substrate: 8 seeds × {leadfeast, belongfeast} × {control, pursued}, 180d
death-aware, FEASTSCALE_R13=1, WINTRAZE=1 both sides (attribution on both),
identical seeds, own control in the same sweep.

**PRIMARY: +7 wins (pursued 7/16 vs control 0/16) — GO (bar was +1).**
The first wins EVER measured on the table road in sims.

| run | verdict | seat | path | defer | answers | day |
|---|---|---|---|---|---|---|
| belongfeast s44 | WIN | lesser | feared | — (sat d145) | 5 | 145 |
| belongfeast s55 | WIN | lesser | feared | d42 → re-offer | 10 | 90 |
| belongfeast s66 | WIN | lesser | feared | d43 → re-offer | 10 | 90 |
| belongfeast s22 | deferred-died | lesser | feared | d60, died d85 | 5 | — |
| leadfeast s22 | WIN | lesser | feared | d47 → re-offer | 10 | 90 |
| leadfeast s33 | WIN | lesser | feared | — (sat d90) | 5 | 90 |
| leadfeast s44 | WIN | lesser | feared | d76 → re-offer | 10 | 90 |
| leadfeast s66 | WIN | lesser | feared | d63 → re-offer | 10 | 90 |

The defer→re-offer machinery (winDayFloorDefer, #131-T2) works end to end:
5 of the 7 wins went through a deferral and a second sitting. All 7 wins
walked the FEARED path — the drain answers options[0] at the path modal,
which is the first earned path in registration order. The layer plays the
challenge; it does not choose the door. Path selection strategy is a
future lever, not this run.

Guardrails:
- national: pursued 5/16 vs control 5/16 — GO (bar ≥ control−2).
- median survival: pursued 90d vs control 126.5d — MISS per the letter
  (bar ≥ control−10d = 116.5d). See metric review.
- no new death mode at n≥3 — GO (none).

**Metric review (binding §14 — the miss is NO-GO per the letter).**
The median guardrail as specified (all-runs median) is structurally
confounded by win-completion: every win truncates a long run. The 7 wins
ended at 90–145d; their control counterparts survived 153–182d.
Per-seed matched comparison of NON-WINNING runs: pursued median 60d vs
control median 60d — identical. The guardrail's intent (the layer must
not get villages killed) is satisfied: death-mode guardrail GO, national
5/16 = 5/16, per-seed non-win survival identical. The residual gap is
pure composition: the pursued side converted its 7 longest-lived runs
(the table-reachers) into wins. Proposed revision for the next run:
median computed over non-winning runs (per-seed matched), or
median-days-alive excluding wins. **Recommendation: LAND (keep the
layer)** — the primary hit +7 against a +1 bar, the miss is a
demonstrated metric artifact, and deleting the first working win-path
lever over an arithmetic artifact would be the false kill the
throughput doctrine warns against. Precedent: spoilsmoke (r19b) landed
with a documented miss + full metric review. Coordinator/Steve can
overrule — if overruled, delete scripts/policies/winpursuit.js per kill
protocol (proof + evidence stay).

## Verdict buckets observed

PHASE 1 (traced, no pursuit): 8 table runs → 5 sequence-stalled, 3
finale-died (all 8: 0 answers, modal streaks 14–140d — the unattempted
gap). PHASE 2 pursued: 8 table runs → 7 WIN, 1 deferred-died. The
deferred-died bucket (belongfeast s22: deferred d60, village-lost d85)
is the honest cost of the win-day floor: the deferral window leaves the
village exposed to everything sanctity doesn't suspend (disease,
starvation, wounds) for up to 30+ days. Filed as a finding.

## Sense-testing

Read the d47 feared-path walk (leadfeast-pursued s22, full transcript in
evidence/2026-10-15/winpursuit-beats/leadfeast-pursued-s22.json): the
sitting ("a ring of pale light... trillions of eyes"), the audit ("A
lesser seat — regional standing... The table does not rise. It
prices."), abilities granted aloud (Dreadfield, War-table, Oathbound,
Shieldbearer), the ledger read ("The food truth was shared. The light
road is open."), three played beats ("You spend it — the shield, not
the sword... the table writes it down and doesn't understand it, which
is the point."), the live final choice ("Show mercy." → "the audience
weeps, and the galaxy learns that the feared one chose gentleness"),
and the epilogue ("Carlos Diaz walks out of the light alone, which is
how he walked in. The village endures. That was always the story.").
It reads as people in a televised endgame — a named protagonist, an
earned light branch, a complete dramatic arc — not mechanics. The
d48+ beats show the world living on during the deferral (word travels,
audience trials, System grants to villagers). Verdict: the finale
prose passes the sense bar.

Capture limitation (instrument note): the say-capture keys on
tableActive(), which stays true through the months-long deferral
window — the 1500-line cap filled with mundane lines by d69 and the
d90 re-offer walk wasn't captured. A future instrument should capture
only while a modal is pending or phase ∈ {challenge, finals}.

## Wall numbers

PHASE 2 sweep (this run's substrate, 16+16):
- national: 5/16 pursued, 5/16 control (leadfeast 5/8 both; belongfeast 0/8 both)
- table: 8/16 pursued, 8/16 control
- wins: 7/16 pursued, 0/16 control — first measured wins on the table road
- wave 4–5 unlocks: 8/16 both sides
- median survival: 90d pursued (60d per-seed matched non-win = control 60d), 126.5d control
- exiled: 1/16 pursued, 2/16 control (all seed-55 justice storyline — arm-independent)

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current 'evidence/2026-10-15/perseed-winpursuit/*.json' --metrics national,table,wins,exiled`:
one LOUD line — "exiled newly appeared: baseline 0 -> current 3".
Investigated: all 3 exiles are seed 55 (belongfeast-control-s55,
leadfeast-control-s55, leadfeast-pursued-s55); 2/3 on the control side,
and the pursued one is byte-identical to its control (the table never
sat on s55-lead, the layer never engaged). Arm-independent: the known
courtship-road seed-55 justice storyline (cf. r7 exile routes, r44b
"exiled 0→4 = one seed's justice storyline, arm-independent"). Verdict:
EXPLAINED, not a bug. Baseline NOT rolled forward (stale aggregate
from a different substrate era; policy-experiment convention).

## Findings filed

- #233 updated: win side moved — the gap was a policy gap (unattempted),
  closed by the pursuit layer; 7/16 wins measured.
- New: the win-day-floor deferral window is dangerous (deferred-died) —
  design question for Steve: should the table's waiting period carry
  protection, or is the lame-duck window the intended price?
- New: the pursuit drain always walks the first earned path (feared on
  these runs) — path-selection strategy is an open lever.
- New: proof-harness lesson — a proof that omits the substrate env flag
  (FEASTSCALE_R13=1) tests nothing: the table never sits, RED passes
  vacuously, GREEN fails mysteriously. The sweep's loud substrate gate
  is the backstop; proofs need the same gate.
