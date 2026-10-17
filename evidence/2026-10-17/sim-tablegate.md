# sim-tablegate — table-arrival attribution diagnostic (flesh-out loop, 2026-10-17)

Axis: scale-onramp. Run: fleshout-loop-20261016T2000Z (arm). Master 0c39d8d0.
Sharpens finding #435 (evidence/2026-10-17/sim-wallcensus-b.md): on the
SEATDRIVE=0 base-courtship substrate (FEASTSCALE_R13=1, {leadcourt,
belongseek}, 8 fresh seeds 4201–4208, 180d death-aware): national 15/16,
median survival 182d, the food economy is NOT the wall — but table 0/16,
wins 0/16, wave-4 0/16, wave-5 0/16. The scale wall sits BETWEEN NATIONAL
AND THE TABLE. This arm sharpens the open steve-call ("is table-arrival
meant to be reachable by base courtship alone, or is the seat the
intended on-ramp?") with measured evidence — it does NOT answer the call
and builds NO lever.

## Pre-registration (binding, MEASUREMENT.md §§9–12, 14)
Written BEFORE the sweep. DIAGNOSTIC — read-only instrument, zero
behavior change (scripts/* only; src/js, src/data, policies untouched).
- SUBSTRATE: FEASTSCALE_R13=1, SEATDRIVE=0 EXPLICIT (unset now means
  driver ON after c004b9dd — the sweep pins the driver OFF, same as the
  census it sharpens). Base courtship policies only (leadcourt,
  belongseek — verified present in scripts/policies/), no policy layers.
  180d death-aware. Asserted up front by
  scripts/sweep-tablegate-20261017.js (SWEEP STOP on mismatch).
- SEEDS: 8 FRESH seeds 3801–3808 x {leadcourt, belongseek} = 16 runs,
  identical-seed lead/belong pairs. Fresh = 0 filename hits across
  evidence/ (verified 2026-10-17).
- PRIMARY (diagnostic GO) = ≥14/16 national-arrival runs get a named
  single blocking gate (≥90% attribution of national runs). The
  classifier (scripts/tablegate-instrument-20261017.js, classifyGate)
  walks docs/TABLE.md's arrival chain in order: seat-bar (tableSeat)
  → Arc IV → tableWaiting (invitation staged) → announced (day≥90)
  → tableTakeSeat verb (the driver) → tableScene. The SINGLE first gate
  that never fires is the run's gate; an internally inconsistent chain
  is "unattributed" (loud, by design).
- COMPLETION gates: 16/16 runs complete; det-gate byte-identical
  (instrumented vs uninstrumented, 4 paired 60d runs); 0 instrument
  errors.
- Also captured per run: seat offers/invites (tableWaiting/announced
  days, beat captures), tableTakeSeat calls (the verb base courtship
  lacks — wrapped read-only, records only), whether the scholar ever
  sits, knowledge prerequisites (codexBreadth), deeds/standing bars at
  best-seat day (w1/w2/w3 faced, contests, crises, scale, stage,
  foodDeeds), realm-negotiation state (hierarchyState: active links,
  subordinates), villageStandingTotal, national-arrival day.

## Instruments
- scripts/tablegate-instrument-20261017.js — read-only attach: say/sysSay
  table-beat capture (regex, capped), tableTakeSeat wrap (records call +
  engine return, never alters), daily pure-read sample (tableSeat(),
  progState, scaleRank, codexBreadth, integrationStage,
  villageStandingTotal, hierarchyState). Trickfunnel instrument pattern:
  hook, capture, never alter. Exact restore().
- scripts/sweep-tablegate-20261017.js — 16-run sweep on the census
  substrate, per-seed JSONs evidence/2026-10-17/perseed-tablegate/,
  beats evidence/2026-10-17/tablegate-beats/.
- scripts/analyze-tablegate-20261017.js — attribution + verdict over the
  per-seed JSONs (no sims).
- scripts/test-tablegate-20261017.js — proof: classifyGate fixtures with
  RED-pinned adversarial cases (inconsistent chain → unattributed;
  numeric-count capture → still classifies; null → unattributed),
  4-pair det-gate byte-identical, SMOKE schema + 0-error.

## Metric review
Per §14 the pre-registered metrics bound the run; the miss stands, never
re-scored. PRIMARY said "≥14/16 national-arrival runs get a named single
blocking gate (≥90% attribution)". What happened: national arrived
13/16 (one short of the 14-count expectation — within the census's
15/16 ±1 noise), and ALL 13 national runs got a named single blocking
gate (13/13 = 100% attribution, ≥ the 90% bar). The attribution half of
the PRIMARY is GO; the count expectation missed by one run. No metric
proved wrong in a way that changes the verdict — but for the NEXT run,
pre-register the PRIMARY as "≥90% of national-arrival runs named" (the
attribution ratio), not an absolute national count, since national
arrival is substrate noise the diagnostic doesn't control. Completion
gates (16/16, det-gate byte-identical, 0 instrument errors) all GO.

## Results
Sweep ran 2026-10-17 ~21:00–21:15 UTC (13 min wall for 16 runs — the
read-only instrument is cheaper than the census's beat-heavy stack).
Substrate asserted up front (FEASTSCALE_R13=1, SEATDRIVE=0 explicit).

COMPLETION gates (all GO):
- 16/16 runs completed (7 survived the full 182d horizon; 9
  village-lost — death-aware horizons working; median survival 170.5d).
- 16/16 per-seed JSONs schema-clean (gate/national/table/wins/seatEver
  all present; wall keys numeric).
- Det-gate: 4/4 paired 60d runs byte-identical trajectory hashes
  (leadcourt+belongseek × s3801/s3802, instrumented vs uninstrumented).
- 0 instrument errors across all 16 runs.
- One instrument-neutrality probe (same seed, with/without instrument):
  identical bearer count, identical end flags — the instrument does not
  steer the run.

ATTRIBUTION (the diagnostic's payload):

| road | national | table | wins | gate |
|---|---|---|---|---|
| leadcourt | 7/8 | 0/8 | 0/8 | seat-never-earned 8/8 |
| belongseek | 6/8 | 0/8 | 0/8 | seat-never-earned 8/8 |

**16/16 runs attribute to ONE gate: `seat-never-earned`. 13/13 national
runs named (100% attribution ≥ the 90% bar).** The table's invitation
never stages on base courtship — not because the driver is missing, but
because the seat bar itself (tableSeat(), docs/TABLE.md) is never met.
Arc IV is never reached either (arc=3 on all 16 runs — checkArc's
want=4 needs the seat bar first, so the whole downstream chain is dead
code on this substrate).

The missing sub-bar, seat-never-earned × 16/16: **foodDeeds only**.
Every other lesser-seat bar holds on the national runs:

| run | w1 | w2 | w3 | contests | crises | rank | stage | missing |
|---|---|---|---|---|---|---|---|---|
| belongseek-s3801 | 17 | 8 | 3 | 4 | 3 | regional | 3 | foodDeeds |
| belongseek-s3802 | 15 | 13 | 3 | 7 | 3 | national | 3 | foodDeeds |
| belongseek-s3804 | 21 | 9 | 3 | 20 | 3 | national | 3 | foodDeeds |
| belongseek-s3805 | 15 | 8 | 3 | 12 | 3 | national | 3 | foodDeeds |
| belongseek-s3806 | 13 | 4 | 3 | 6 | 3 | national | 3 | foodDeeds |
| belongseek-s3808 | 17 | 10 | 3 | 15 | 3 | global | 3 | foodDeeds |
| leadcourt-s3801 | 18 | 8 | 3 | 9 | 2 | regional | 3 | foodDeeds |
| leadcourt-s3802 | 14 | 5 | 3 | 5 | 3 | regional | 3 | foodDeeds |
| leadcourt-s3804 | 14 | 8 | 3 | 10 | 4 | national | 3 | foodDeeds |
| leadcourt-s3805 | 17 | 7 | 3 | 12 | 2 | national | 3 | foodDeeds |
| leadcourt-s3806 | 14 | 9 | 3 | 14 | 3 | global | 3 | foodDeeds |
| leadcourt-s3807 | 15 | 4 | 0 | 3 | 3 | regional | 3 | w3<3, foodDeeds |
| leadcourt-s3808 | 18 | 7 | 3 | 5 | 4 | regional | 3 | foodDeeds |

foodDeeds = `pg.sentimentTaught && s.prog.feastSurgeUsed`
(progression.js:622, table.js:97). The conjunction splits, measured on
5 sampled runs (leadcourt s3801/s3802/s3804, belongseek s3801/s3802 —
end-of-run flags, separate probe):
- **sentimentTaught FIRES 5/5** — slot moment 60 teaches it (e.g.
  leadcourt-s3804: fired day 18, "◈ RESONANCE HARMONICS"; all 5 end
  integration 100, stage 3, slotMoments 20/40/60/70/80).
- **feastSurgeUsed NEVER fires 0/5 (and foodDeeds 0/16 in the sweep)**
  — `noteFeastedCombatUse()` (feastBuff.js:397) marks only when the
  PLAYER fighter ('p') lands a strike/ability on a monster/hostile
  while feasted (game.js:33661:
  `_ps && (_fk === 'monster' || _fk === 'hostile')`). The scholar
  feasts (the buff arms — "The feast was the weapon") but never fights
  feasted on base courtship. The deed is scholar-combat-gated and the
  courtship policies never field the scholar that way.

Realm-negotiation state at end (national runs): leadcourt holds 3
active subordinate links (Emberhold, Stonebridge, Ashford — the
courtship road's three), belongseek holds 1. Codex breadth 78–179,
standing 0–199. The villages are diplomatically complete — the realm
plays; only the table's food-thesis deed is missing.

Beat capture note (instrument honesty): the table-beat regex was tuned
for staging lines that never fire on this substrate, so
tablegate-beats/ holds 1 file / 1 beat (a feast-table line, not the
galactic table). The sense-read below uses the sibling census's beats
(same substrate, seeds 4201–4208) — flagged here, not hidden.

## Village assessment — what "national without the table" FEELS like
Sense-read (SENSE-TESTING LAW) of the courtship beats at national
(sibling census beats, same substrate — the tablegate-beats capture was
tuned for staging lines that never fire; flagged honestly above):

- d25–27: "The village feels it before they understand it: Haven isn't
  just Haven anymore. Katharina speaks at Emberhold's table now —
  earned, not appointed. And the other fire is watching what Haven does
  FIRST." The realm transition has a real moment — earned, not
  appointed. It reads.
- d76: "👑 Speakers from Emberhold, Stonebridge, Ashford ride in for the
  first court — and every one of them is measuring you. FEAST them from
  a shared granary (5,000 kcal, no strings), HOST the cour[t]…"
  National life is courts, tribute, measuring speakers — the realm
  machinery works and feels political, not decorative.
- d76: "💛 You hold Contract Quill. Your gifts are not mastered — but
  they are lived-in, worn smooth by use, and they are with you. The
  feast was the weapon. (The next feast grants FEASTED until
  tomo[rrow])" — and d178: "📺 'THE TABLE IS SET. THE VILLAGE IS ONE
  ANIMAL. IT IS VERY WELL FED AND IT WOULD LIKE TO HIT SOMETHING.'"
  The only "table is set" in the whole corpus is a feast-table beat.
  The irony the transcript hands you: "The feast was the weapon" — and
  the weapon is armed feast after feast and never fired in the
  scholar's hands. The game never remarks on it.

Judgment: the village at national reads like a polity — courts,
tribute, feasts, neighbors measuring you. Nothing about it reads
broken or robotic. What it reads as is a story that reached the top
of the world it knows and then kept running the court circuit forever.
No beat ever says the galactic table is coming, or that something is
missing, or that the seat is unearned — the absence is silent, not
voiced. If Steve intends the food-thesis deed as the gate, the silence
is the design gap worth naming: a run can do everything the realm asks
and never be told what the table wants.

## The sharpened steve-call
Finding #435's open call was: "is table-arrival meant to be reachable
by base courtship alone, or is the seat the intended on-ramp?" Measured
evidence sharpens it to ONE named gate:

**Blocking gate: `seat-never-earned` — 16/16 runs, 13/13 national runs
(100% attribution). The missing sub-bar is `foodDeeds`, and within it
specifically `feastSurgeUsed`: the scholar must land a feasted
strike/ability in real combat (game.js:33661, feastBuff.js:397).
Measured: the lesson half (sentimentTaught) fires 5/5; the combat half
fires 0/5 — base courtship never fields the scholar feasted. Every
other lesser-seat bar (waves 4/4/3, 2+ contests, 2+ crises,
regional+, stage ≥ 2) is met on the national runs.**

Steve's call, sharpened: **is the food-thesis deed INTENDED to require
the scholar's own hands in combat — making the table unreachable for
pure courtship/diplomacy play — or should the deed be earnable by the
village's feasting life (feasts held, fighters feasted, the weapon
fired by someone)?** Corroboration: the sibling seatdrive composition
reaches table 13/16 and wins 13/16 on its feast-heavy stack — the seat
bar IS reachable, just not by base courtship. The driver opens a door
the base game never builds; the missing brick is the feasted blow, not
the driver.

## Blanks filled / documented
- **MEASURED (diagnostic)**: 16-run table-arrival attribution on the
  census substrate (8 fresh seeds 3801–3808 × {leadcourt, belongseek},
  180d death-aware, SEATDRIVE=0, FEASTSCALE_R13=1). Completion gates all
  GO. 100% single-gate attribution (16/16 `seat-never-earned`).
- **NAMED**: the blocking sub-bar is `foodDeeds`, split 5/5 vs 0/5
  (sentiment taught / surge never used) — the steve-call above.
- **VERIFIED**: instrument neutrality — det-gate 4/4 byte-identical
  (60d pairs) + a same-seed with/without probe identical on bearer
  count and end flags. The probe also caught and corrected a
  misreading mid-run (sentiment DOES fire; the surge half is the gap).
- **DOCUMENTED (instrument honesty)**: the tablegate-beats capture was
  tuned for staging lines that never fire on this substrate — 1 file /
  1 beat. Sense-read used the sibling census's beats (same substrate);
  flagged, not hidden. Next table-path diagnostic should widen the
  beat regex to realm/court lines.
- **FILED to sim-findings.md**: the sharpened steve-call (food-thesis
  combat half as the named gate).
