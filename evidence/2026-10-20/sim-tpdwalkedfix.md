# sim-tpdwalkedfix — TPD `walked` recorder learns the relay door's phase transition (flesh-out loop, 2026-10-20, arm sim-tpdwalkedfix)

Run: fleshout-20261020T2015Z, arm sim-tpdwalkedfix. Axis: scale-onramp (the blocking axis).
Backlog #709 (claimed by this run). POLICY-SIDE INSTRUMENT FIX — zero src/js changes.
File scope: scripts/policies/tablepathdriver.js (the recorder, ~L313),
scripts/test-tpdwalkedfix-20261020.js (new, proof), evidence/2026-10-20/sim-tpdwalkedfix.md (this file).

Canon: docs/CANON.md + docs/TABLE.md (the relay resolves on the leaning
meter — the GRADIENT law, Steve 2026-10-11; "Dark conscript: offered to
relay walkers whose hand is forward dark") + the wintrack audit
(evidence/2026-10-20/sim-wintrack-audit.md, named next 1: the TPD `walked`
recorder misses the relay door — walked=[] on 5/5 relay/dark wins,
branchMargins absent there too; the relay door's phase transition is not
paths→challenge).

## The finding (from sim-wintrack-audit, pinned, not re-derived)

The wintrack audit pinned the 100%-attribution path (doorEvents +
finalsEvents + the canonical endRec.tb record — all agreed 12/12) and
showed the TPD layer's own `walked` recorder + its branchMargins
instrument never fire for the relay door: walked=[] on 5/5 relay/dark
wins (belongfeast-s64203, leadfeast-s64203/64204/64206/64208), and
branchMargins absent on the same 5 (the audit's leg-4 instrument gap).

## The relay door's actual phase transition (read, not guessed)

`src/js/table.js`, `tableStartPath(pathId)` (read-only investigation; no
engine edits):

1. L624: `T.path = pathId; T.phase = 'challenge'; T.beat = 0;` — the
   normal door entry, paths→challenge.
2. L682–700 (PODS WEIGHT — DARK CONSCRIPT): for `darkConscriptPaths =
   {feared: 1, relay: 1}`, when the walk is dark
   (`isDark = (T.branch === 'dark') || (pathId === 'relay' &&
   (T.band === 'dark' || relayLean() < 0))`), the engine diverts:
   `T.phase = 'conscript'` and offers the dark-conscript choice before
   the challenge beats (refusing returns to 'challenge', L607–611).

So a dark relay walk's actual transition is **paths → conscript**, not
paths → challenge. The recorder's condition
(`before.phase === 'paths' && after.path && after.phase === 'challenge'`)
can never fire there. ('conscript' is only ever entered from a door pick
in tableStartPath — L688 is the sole writer — and the modal is past the
door, so paths→conscript IS the door entry.)

The branch-margin side has a second gap in the same block:
`MARGIN_PATHS` lists only the 6 ledger doors — even a fixed recorder
would capture no relay margin, and the relay resolves on the leaning
band, not the binary ledger (`tableBranch('relay')` returns
{branch, dark, light, notes, band, lean} — the GRADIENT signal).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE any sims)

**PRIMARY (GO):** the walked recorder fires on relay/dark wins and
branchMargins covers the relay margin. Re-run the 5 corpus relay/dark
wins on IDENTICAL seeds with the fixed driver (full
SEATDRIVE=1+TABLEPATHDRIVER=1+RELAYDARK=1 substrate via
scripts/probe-tablepathdriver-20261020.js runOne, noWrite — the corpus's
own composition):
seeds {belongfeast: 64203; leadfeast: 64203, 64204, 64206, 64208}.
GO threshold: **5/5 with walked=[{path:'relay', branch:'dark'}]
(day/pick agreeing with the committed doorEvents) AND
branchMargins.relay present with band/lean numbers.** A miss is NO-GO,
never re-scored (§14).

**DET-GATE (GO):** non-relay paths byte-identical before/after. Re-run
the 7 corpus non-relay wins on identical seeds
{belongfeast: 64201, 64202 (fallback witness), 64206, 64208; leadfeast:
64202, 64205, 64207}: walked deep-equal to the committed corpus,
branchMargins deep-equal to the committed corpus, day-hashes deep-equal
(the instrumentation is pure reads — zero RNG/stream perturbation).
GO threshold: **7/7 on all three comparisons.**

**RED baseline (pinned, not re-run):** the committed corpus itself is
the RED — walked=[] on the 5 relay runs with the old recorder (the
audit's named next 1). The proof asserts the corpus RED before asserting
the GREEN.

**Horizon:** the corpus's own 180d death-aware (runs end on win/death);
the measurement is the tpdSummary at run end — no fixed horizon needed
beyond it. **Policies:** the tablepathdriver rotation
(indispensable/witness probes + relay/defiant concentration), env per
the probe header. **Seeds:** 64201–64208 × {leadfeast, belongfeast}
(subset 12 runs for this arm).

## Results

**Verdict: GO.** All pre-registered thresholds met.

Proof: `scripts/test-tpdwalkedfix-20261020.js` — **ALL GREEN (43/43)**.

### Part A — recorder unit proof (mock Game, REAL `drainTable`, no game eval): 13/13
- A1: the relay door's real transition (paths→conscript, the dark-conscript
  divert) records the walk exactly once: `walked=[{path:'relay',
  branch:'dark', door:'path:relay', fellBack:false}]`, day agreeing with
  the door event; `branchMargins.relay = {band:'dark', lean:-48, dark, light,
  notes}`; all 7 door keys present; the drain's later
  conscript→challenge→finals→done beats do NOT double-record.
- A2: the normal transition (paths→challenge) records exactly as before
  (feared/light); non-relay margin records keep their exact old shape
  (6 ledger keys, `{branch, dark, light, notes}` — no band/lean, no relay key).
- A3: a non-door transition (challenge→finals) never records a walk.

### Part B-RED — the pinned RED (no sims): 1/1
The committed corpus (`evidence/2026-10-20/perseed-tablepathdriver/`)
has walked=[] on the 5 relay/dark wins with endRec.tb=relay/dark — the
audit's named next 1, asserted as the baseline.

### Part B' — old-vs-new on the CURRENT base, identical seeds: 29/29
(Corpus replay was designed first and ABANDONED: the corpus was generated
on fd896c2ea and game-code drift since then moves trajectories — door
days and day-hashes diverge even between identical old-driver runs and
the corpus. Before/after on the same base is the honest comparison;
12 seeds re-ran under the old driver and under the fixed driver via
`scripts/probe-tablepathdriver-20261020.js runOne`, noWrite. Raw JSONs:
`~/workspace/tpdwalkedfix-oldruns.json`,
`~/workspace/tpdwalkedfix-newruns.json`.)
- Trajectory neutrality: day-hashes byte-identical old-vs-new on all 12
  seeds — the instrumentation is pure reads, zero RNG/stream effect.
- RED on current base: old driver walked=[] on 5/5 relay/dark wins.
- **GREEN (GO = 5/5):** fixed driver records `walked=[{path:'relay',
  branch:'dark', door:'path:relay', fellBack:false}]` on 5/5 (day/pick
  agreeing with doorEvents, endRec.tb=relay/dark agreeing), and
  `branchMargins.relay` is present on 5/5 with the gradient numbers —
  e.g. leadfeast-s64203: `{branch:'dark', dark:6, light:4,
  notes:['the protected outnumber the killed','the food truth was
  shared'], band:'dark', lean:-100}`.
- **DET-GATE (GO = 7/7):** the 7 non-relay runs are byte-identical
  old-vs-new — walked, branchMargins AND doorEvents all deep-equal
  (incl. the belongfeast-s64202 fallback-witness walk and two
  base-drift non-wins, which agree with each other).

### Sense — is paths→conscript the right moment to record the walk?
Read the engine's dark-conscript beat (`src/js/table.js` L684–700): the
door is entered first (`T.path='relay'`, `T.branch='dark'` set at L624),
THEN the conscript offer is presented ("The System waits. The pods wait.
The mourners — somewhere below the light — have gone very still.")
before the challenge beats; refusing returns to 'challenge' (L607–611).
The conscript beat is a beat *within* the walk, not a pre-door step —
recording the walk at paths→conscript captures the door entry with the
branch already resolved. Semantically the right moment, and the only one
the old condition could never see.

### What changed (policy-side only, zero src/js)
`scripts/policies/tablepathdriver.js`:
1. The walk recorder now fires on `paths→challenge` OR
   `paths→conscript` (the relay door's actual transition; a dark feared
   walk takes the same divert and is now recorded too — also a real walk).
2. `branchMargins(Game, walkedPath)` captures the walked path's margin in
   addition to the 6 ledger paths, plus the relay's `band`/`lean` when
   present (only the relay's signal object carries them — every other
   door's record is byte-identical).

### Out-of-scope observation (not chased)
The sibling's `scripts/test-tablepathdriver-20261020.js` (39/39 at its
landing) now fails on the RELAYDARK REAL-VERB block
(darkUses=0/lean=0/grounding=100 in its crafted harness, then a FATAL at
L223) — verified IDENTICAL with the old (HEAD) driver on this base, so
it is base drift in the relaydark road's verb surface, not this fix.
Not touched (relaydark.js is outside this arm's file scope); flagged for
the relaydark lane / next run.

## Metric review

The pre-registered PRIMARY (walked fires + margins present on 5/5
relay/dark wins) and DET-GATE (7/7 non-relay byte-identical) both held
as written — no re-scoring, no metric revision needed. One design
correction mid-run, recorded honestly: the first Part B design (replay
the committed corpus on the current base) conflated game-code base drift
with the fix and was abandoned in favor of old-vs-new on the same base;
the corpus remains the pinned RED baseline only. Metric binding (§14)
held throughout: the miss was in the comparison design, not the metric.

## Convergence note

scale-onramp stays converging. This run is an instrument fix: no lever
changed, no wall movement claimed. The wintrack audit's named next 1 is
closed — the ledger-dark margin instrument (branchMargins) now covers
the relay door, so the next wintrack-style audit can attribute relay
walks through the TPD layer itself instead of leaning on
doorEvents+finalsEvents+endRec.tb alone.

## Wall numbers (unchanged by this run — instrument-only)
national / table / wins, wave 4–5 unlocks, median survival: not re-measured;
the 12 re-run seeds are the arm's own composition, not a wall census.

