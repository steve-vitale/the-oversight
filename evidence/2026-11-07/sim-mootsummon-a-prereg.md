# sim-mootsummon-a — PRE-REGISTRATION (re-pin arm, committed BEFORE any judged sim)

Worker: sim-mootsummon-a (Loop A, food-economy / narration).
Run: fleshout-2026-11-07T0715Z, axis food-economy, arm sim-mootsummon-a.
Assignment as briefed: DIAGNOSIS of moot-turns-to-you summons reaching
stranded scholars (findings-backlog #1793), reproduce the shape, count
summon-to-stranded windows, trace the delivering call, name the fix.

## Status on arrival — the assigned work is already landed

This arm arrived to find its entire assignment ALREADY COMPLETE in
master, twice over:

- DIAGNOSIS: evidence/2026-11-06/sim-mootsummon-a.md (run
  fleshout-20261106T0821Z, merged ed819c29b): DIAG-GO. Trial moots
  summon stranded scholars 1/22 stranded sleep windows (4.5%) vs
  43/2,185 non-stranded (2.0%); the hit quoted verbatim (48006
  loop-day 9, forest floor, starving); delivering call traced
  (npcMootTick → callMoot → conductTrial → tallyVotes, no position
  gate anywhere, only exile excluded); response surface read
  (trial vote is conversation-only at the fire; no defer, no
  return-time vote, no remote vote); resolutions traced (52/56 via
  the 2-day backstop); fix NAMED (gate trial-moot convening on the
  scholar being at Haven).
- FIX: evidence/2026-11-06/sim-mootgate-a.md (run
  fleshout-20261106T1115Z, fix e53e86531, `mootConveneHeld()` gate
  in src/js/betrayal.js, +34 lines, exile exception, fail-open):
  verdict GO on the full 40-seed band 48001–48040 before/after —
  stranded summons 1 → 0 (of 22 stranded loop-days), convening
  56 → 58 events, median survival 60 → 60. The fix is an ancestor
  of current HEAD (verified this run: e53e86531 is an ancestor of
  f043aa772; `mootConveneHeld()` at betrayal.js:5447, called at
  5496 and 5536).
- sim-findings.md line 1814 marks #1793 [fixed].

Re-running the full 40-seed census as a fresh diagnosis would be
re-proving a proven constraint (Steve 2026-11-01: deliver over
measure). This arm is therefore scoped, by the coordinator's brief
as read against the landed record, to a RE-PIN: verify the fixed
shape still holds on the CURRENT master (f043aa772 — master moved
since the mootgate after-leg; journey-establishment r109 landed),
using the existing instruments verbatim, and record the verdict so
the finding is not re-assigned again. Zero src/js in this arm.
No new diagnosis is claimed; no new fix is named — the named fix
is already built, landed, and verified.

## Canon

docs/CANON.md read first (this run). No canon doc covers moots /
trial / endDay delivery — the manifest registers no moot doc, and
the 11-06 prereg established the same. No canon is invented here.
The design facts are the 11-06 code reads (betrayal.js conductTrial
~1932, tallyVotes ~1854, trialVoteTick ~5526-5540; villageAgency.js
conductPetitionMoot ~802; app.js ~320 petition buttons), verified
again this run only insofar as the gate calls exist (above).

## Questions for the re-pin

(a) PRIMARY: on current master, do any moot-turns-to-you summons
fire inside a stranded scholar's sleep window on the pilot band?
Expected: 0 (the gate holds convening until the scholar returns).
(b) NON-VACUITY: are stranded windows still observed on the pilot
band (so a 0 is a held gate, not an absent stranding)? Expected:
yes — 48006 stranded 4 nights on both 11-06 legs.
(c) INSTRUMENT: does the existing proof test (33/33) still pass
on current master, including the 17021 re-pin and the 15003
gossip anchor? Any drift is reported as a finding, not silently
re-anchored (per the 11-06 prereg).
(d) DELIVERING CALL (re-verified, not re-derived): the gate sits
at npcMootTick / playerCaseTick via `mootConveneHeld()`; confirm
from the code that no other convening path bypasses it (grep for
callMoot / conductTrial call sites).

## Primary metric

Stranded sleep-window summons on the pilot band (windows holding
>= 1 summons line / windows), with the loop-day rate alongside
(per the mootsummon metric review item 1 — loop-day is the right
primary for moots; the sleep rate is kept for comparability with
the 11-06 census). Upkeep reported as a mechanism check only
(expected 0).

- POWER / NON-VACUITY BAR (pre-registered): >= 1 stranded sleep
  window observed on the pilot, across >= 1 stranding seed. If
  the pilot observes ZERO stranded windows, the re-pin is
  INSUFFICIENT-DATA (a 0/0 cannot confirm the gate) and the
  pre-registered screen below runs.
- VERDICT RULE (pre-registered): RE-PIN-GO iff the proof test is
  green on current master AND the pilot shows 0 stranded-window
  summons with the non-vacuity bar met. Any stranded-window
  summons on the pilot = REGRESSION: the arm expands to the full
  40-seed screen and the evidence reports a regression finding
  (the gate no longer holds on current master), with the
  verbatim window quoted.
- SENSE TEST: any stranded-window summons is quoted verbatim with
  its full sleep window read. A 0 needs no verbatim (there is
  nothing to quote); the per-seed table carries the zeros.

## Horizon, seeds, policies (death-aware, never fixed-200d)

- Horizon: 60 loop-days (same substrate as the census family;
  dead villages stop simulating, so 60 is a cap, not a sentence).
- Policies: bankfood(warmed(woodcarry(nighttravel))) over
  competent, env gates COMPETENT_FEAST=0 SEATDRIVE=0 PLENTYDEPRI=0
  DEPOSITGATE=1 POLICY=nighttravel WOODCARRY=1 WOODWARM=0 BANKFOOD=1
  STRANDNARR=1 (the census leg, verbatim). COMPETENT_TALK unset
  (default OFF — same disclosed limitation as the 11-06 census:
  no trial vote is ever cast in sims).
- PILOT (8 seeds, judged first, before any confirm spend):
  48001–48008. Driver scripts/mootsummon-trace-a.js, OUTDIR
  evidence/2026-11-07/sim-mootsummon-a-repin-corpus (NOT the
  11-06 corpus dir — the driver default would overwrite committed
  corpus; the OUTDIR override is the only driver change, and it
  is an env var, not a code edit).
- SCREEN (pre-registered, runs ONLY if the pilot regresses OR
  the non-vacuity bar fails): the same driver over 48009–48040
  (32 fresh-to-this-arm seeds). Every seed in the band runs, so
  the screen cannot inflate the rate by selection.
- BALANCED PANEL (§15): not run — this is a re-pin census on
  current master with zero game-code change; there is no
  before/after to compare. The mootgate before/after IS the
  comparison for this defect, already landed.

## Band freshness (no new band claimed)

NO new seed band is assigned by this arm. The pilot reuses the
judged band 48001–48008 — deliberate before/after reuse, not a
fresh-band claim, per the mootgate precedent (its claim file
records "Bands are deliberate before/after reuse, not fresh-band
claims"). The band's namings are the 11-06 mootsummon prereg
(judged band 48001–48040, extension 48065–48088 unused) and the
mootgate prereg/claim (before/after reuse of 48001–48040). The
freshness skill's concern is fresh verdicts on fresh bands; a
re-pin on the judged band is the instrument re-run on the same
ground, and the prereg states the reuse explicitly so no later
worker mistakes it for a fresh claim. No 48xxx token search is
re-run for a band this arm does not claim; the 11-06 search
(zero 48xxx tokens in any dated prereg at that time) stands in
that prereg.

## Det-gate / anchors (in the proof test, before the pilot)

- scripts/test-mootsummon-a.js (33/33 on 11-06): unit classifiers
  + kind classification + follow-up tracking + det-gate (seed
  17021, instrument ON vs OFF identical) + 17021 re-pin (60d
  SURVIVED, 0 stranded nights, per enddaybeats-a) + 15003
  loop-day-7 gossip anchor. Run with the substrate env gates
  before the pilot. A miss is reported as a finding (substrate
  drift), not silently re-anchored.
- scripts/test-mootgate-a.js (60/60 on 11-06, with the substrate
  env set; without it 15 seed-leg checks SKIP): run alongside as
  the gate's own proof on current master.

## Metric binding

Pre-registered metrics bind this run. A miss is NO-GO /
INSUFFICIENT-DATA / REGRESSION per the rules above, never
re-scored against a friendlier metric mid-run. If a metric proves
wrong, it goes under "metric review" in the evidence file with a
revision proposed for the NEXT run. Every evidence file carries a
"metric review" section.

## Wall numbers (carried, NOT re-measured)

This is a narration re-pin corpus; it records no scale outcomes.
Carried state from the 1041Z round (0915Z run, 24 distinct seeds):
wins 0/24, national 0/24, table 0/24, wave-5 0/24,
readiness-5-ready days 0/24. Consistent with the 0028Z round
(evidence/2026-11-05/sim-winnability-round-0030.md): wins
lesser-only, full seat 0, wave-5 kills 0.

## Deliverables

- evidence/2026-11-07/sim-mootsummon-a-prereg.md (this file,
  committed BEFORE any judged sim)
- evidence/2026-11-07/sim-mootsummon-a.md (re-pin verdict, pilot
  rates with denominators, per-seed table, gate-path re-verification,
  metric review, wall numbers)
- evidence/2026-11-07/sim-mootsummon-a-repin-corpus/ (per-seed
  JSON for the pilot; screen corpus only if the screen triggers)
- Zero src/js. Zero instrument change (existing driver/proof
  reused verbatim). No push, no bump, no live verification
  (coordinator merges; ship loop owns deploys).
- Base HEAD at prereg time: f043aa772 (branch sim-mootsummon-a,
  2026-11-07 ~07:15Z). Run: fleshout-2026-11-07T0715Z.
