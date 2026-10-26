# sim-mealdraw-reprereg-b — PRE-REGISTRATION (written BEFORE any sweep runs)

Run: oversight-flesh-out-loop-b, arm sim-mealdraw-reprereg-b
(20261026T2029Z). MEASUREMENT ONLY: zero src/js changes, no
default flips, no meal or pantry redesign, no instrument
rewrite. The prior arm (sim-mealdraw-b) was NO-GO on a moved
base: its prereg bound its endpoints to the stockdoor corpus's
base without pinning the base commit, and commit 1377d03c3
(conversation.js + villageAgency.js) landed between the two
sweeps and moved the trajectory, so every old-trajectory
number failed. The instrument itself was exonerated by a
control experiment (an unmodified stockdoor-only re-run on
that HEAD reproduced the mealdraw corpus exactly). This arm
is the re-prereg the prior arm's metric review ordered:
pin the base, run a stockdoor-only control sweep on that
HEAD first, then re-judge the residual pair.

## Base pin (binding)

Pinned base commit: f89a9b32d5c652e046caf27c25d2220212673988
("journey-social r57", branch sim-mealdraw-reprereg-b at
prereg time). `git rev-parse HEAD` MUST equal this hash
before the control sweep, between the sweeps, and after the
judged sweep. If it differs at any of those checks, the run
STOPS: no judgment is made, the verdict is NO-GO with leg 0
named, and the evidence reports the base move. No sweep in
this arm runs on any other commit.

## Instrument (reused UNCHANGED)

- `scripts/mealdraw-capture.js` (meal-draw record) reused
  UNCHANGED. Any change to it would require a determinism
  leg first; none is planned and none is permitted silently.
- `scripts/sweep-stockdoor-b.js` (control sweep) and
  `scripts/sweep-mealdraw-b.js` (judged sweep) reused
  UNCHANGED; substrate, inflow, resid, and stockdoor
  captures reused UNCHANGED. The only per-run differences
  are the PERSEED_DIR outputs and the seed band (confirm).
- New analyzer `scripts/analyze-mealdraw-reprereg-b.js`
  (parameterized by corpus directory; it reads control
  numbers from the control corpus AT ANALYSIS TIME and
  compares the judged corpus against them) and new proof
  `scripts/test-mealdraw-reprereg-b.js`. The analyzer
  encodes leg FORMS from this prereg (exact equality,
  residual exactly 0); it hardcodes NO prior corpus's
  numbers. Reading a baseline at analysis time is not
  post-hoc threshold-setting: the thresholds (0 residual,
  exact field equality) are fixed here, before any sweep.

## Band (pilot; identical to the stockdoor/mealdraw bands)

Seeds 9750–9757, competent-nofeast (COMPETENT_FEAST=0,
FEASTSCALE_R13 unset/0, SEATDRIVE=0, PLENTYDEPRI=0,
DEPOSITGATE=1), 100d death-aware (villages that die stop
early; +10d tail max per MEASUREMENT.md §10 — the sweeps
stop at death as built), CAP=1. This 8-seed band IS the
pilot gate. No confirm band is spent unless the pilot
legs (0–5) all pass.

Corpora (new directories; sweep outputs NEVER in /tmp):
- Control: evidence/2026-10-26/
  sim-mealdraw-reprereg-b-control-corpus/
  (stockdoor-b-cap1 files, via PERSEED_DIR override).
- Judged: evidence/2026-10-26/
  sim-mealdraw-reprereg-b-corpus/
  (mealdraw-b-cap1 files, via PERSEED_DIR override).

## Primary metric (binding, MEASUREMENT.md §14)

Primary metric: reconciliation of gross stockSurplus writes
vs surviving pile from meal-draw records, with gross and
surviving pile judged SEPARATELY, on the pinned base.
For a surplus window D (first-cook day D to first-cook day
D+1) on a seed, the surplus class is ('Foraged food', 200,
D+3, granaryDays null, foodState null); the equation is

  after = before + stockdoorWrites(D) − windowDraws(D)

where before/after are that corpus's own dayPantry
first-cook snapshots for days D and D+1, stockdoorWrites(D)
is the summed stockdoor kcal for scholar day D, and
windowDraws(D) is the summed meal-draw kcal from the
surplus class in window D (a draw belongs to window D iff
(day == D and cookLinesSeenToday >= 1) or (day == D+1 and
cookLinesSeenToday == 0), the mealdraw instrument's own
rule). Residual = after − (before + writes − draws).
Gross = stockdoorWrites(D); surviving pile = after.
Both numbers are reported for every judged window; a
night's gross write is NEVER quoted as its surviving pile.

GO threshold — ALL of the following must hold:

0. Base pin: HEAD equals the pinned hash at all three
   checks (before control, between sweeps, after judged).
1. Control gate: the stockdoor-only control sweep
   completes 8/8 seeds with no truncation flag on any file
   (inflow, resid, stockdoor, cook, event) and no write
   failure. The control summary (pre-fourth-door view:
   bound/attributed/unattributed, attribution-flag
   reproduction, lag distribution, median lag, coverage,
   residuals; stockdoor grosses; dayPantry endpoints) is
   recorded VERBATIM from the control corpus. The control
   numbers are DERIVED from the pinned HEAD, not
   pre-specified: requiring any prior corpus's numbers
   here would repeat the stale-baseline error that voided
   the prior arm. The gate is completeness + internal
   consistency, not equality to an old corpus.
2. Determinism / instrument neutrality: the judged corpus
   matches the control corpus on EVERY game-output field
   on all 8 seeds (dayTable classes, attribution flags,
   daysAlive, deaths, deathCauses, rank, waveReach,
   national/table/win, endReason). The ONLY permitted
   per-seed differences are the added `mealDrawRecords`
   field and run timings (instrument output). Any other
   mismatch is an instrument effect and fails this leg.
   This is the correct direction of "the control sweep
   reproduces": on one pinned HEAD, the judged sweep
   reproduces the control sweep exactly.
3. Surplus-window reconciliation (focus seed 9750): every
   CHECKABLE surplus window on seed 9750 closes with
   residual exactly 0. A window is checkable iff
   stockdoorWrites(D) > 0 on day D AND both dayPantry
   endpoints (D and D+1) exist in the judged corpus.
   At least 3 checkable windows are required; fewer is a
   leg failure for lack of evidence, not a pass. Windows
   81, 82, and 83 are reported individually (closed /
   not-checkable / open) because the prior arm's post-hoc
   finding closed exactly those three on its base — but
   the leg does NOT require those specific windows to be
   the checkable ones, since the trajectory on the pinned
   base may place the surplus nights elsewhere. Gross and
   surviving pile are reported separately per window.
4. Residual-pair disposition: the control corpus's
   pre-fourth-door view is computed with the identical
   counting rules of analyze-mealdraw-b.js (three doors
   only: stock, deposit, pantryAdd) and its residual list
   is reported VERBATIM. If the old pair (9750,83) /
   (9750,84) — or any other residual — is present, the
   surplus windows covering those days must close under
   leg 3 (leg 3 already covers every checkable 9750
   window, so this clause is explicit, not additional).
   If NO residual is present, the pair is recorded as
   ABSENT on the pinned base: a finding, not a leg
   failure. Demanding old residuals on a new base is
   exactly the error this re-prereg exists to fix, so
   absence cannot fail this leg — but the evidence must
   say "pair absent on this base" in plain words wherever
   the verdict is quoted, so GO is never misread as
   "the old pair reproduced".
5. Cross-checks (judged corpus): (a) every villager-home
   meal call: freshTaken + spoiledGot == ret.drawn, 0
   mismatches; (b) every drawSpoiled: got == before/after
   diff sum, 0 mismatches; (c) no mealdraw truncation on
   any file; (d) ctxKcalMatch 0 mismatches; (e) resid join
   0 misses.
6. Confirm (ONLY if legs 0–5 pass; otherwise NO confirm
   spend — the pilot gate binds): confirm band seeds
   9780–9795 (16 seeds), same policy/horizon/CAP, control
   + judged sweeps on the pinned HEAD (HEAD re-verified
   before each), into
   sim-mealdraw-reprereg-b-confirm-control-corpus/ and
   sim-mealdraw-reprereg-b-confirm-corpus/. Confirm GO
   requires: (a) neutrality judged==control on all 16
   seeds on every game-output field (same field list as
   leg 2); (b) cross-checks pass as in leg 5; (c) every
   checkable surplus window across all 16 seeds closes
   with residual exactly 0, with at least 8 checkable
   windows in total (fewer is a confirm failure for lack
   of evidence). If any confirm requirement fails, the
   final verdict is NO-GO with the confirm leg named.

GO iff legs 0–6 all hold. Any miss is NO-GO with the
failing leg named, never re-scored; metric doubts go
under "metric review" in the final evidence. The prior
arms' verdicts stand under their own headers; this arm
judges only the re-preregged reconciliation on the
pinned base.

## Horizon / seeds / policies

Horizon 100d death-aware (above). Pilot seeds 9750–9757;
confirm seeds 9780–9795. Policy competent-nofeast as
above. Wall numbers reported from the judged corpus
(pilot) and the confirm judged corpus: national / table /
wins, wave 4–5 reach, median survival, death causes, wave
reach. A sense-test (one full night-meal sequence read
and judged for meaning vs the recorded draws) is
reported in the final evidence, not in this prereg, and
is not a GO leg.

## Balanced panel (MEASUREMENT.md §15)

No balance-panel comparison exists for this arm: §15
panels compare a base Game root against a lever-applied
Game root over panel-driver observer rows, and this arm
applies NO lever and changes NO game code — the before/
after comparison here is instrument-off (control) vs
instrument-on (judged) on identical seeds, judged by
exact per-field equality (leg 2), which is strictly
stronger than a 23-metric panel aggregate for an
instrument-neutrality question. Running panel builds
would compare identical roots through a different
harness and prove nothing about this instrument. The
determinism comparison in legs 2/6a IS this arm's
before/after comparison, and the evidence file states
this rather than attaching a panel compare .md.
