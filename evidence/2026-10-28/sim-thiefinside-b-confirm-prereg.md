# sim-thiefinside-b — CONFIRM ADDENDUM (committed BEFORE any confirm run)

Pilot verdict (see sim-thiefinside-b.md, proof
scripts/test-thiefinside-b.js PROOF-GREEN): GO — 8/8 seeds
reached the inside thief tap, 36/36 inside taps read access
'inside', outcomes 18 clean / 18 caught. The pilot prereg
(sim-thiefinside-b-prereg.md) authorizes a confirm of 12–16
seeds on pilot GO. This addendum fixes the confirm band and
bar BEFORE the confirm run; it changes nothing about the
pilot verdict, which is already judged.

## Confirm band

- Seeds: 10050–10065 (16 fresh seeds, non-overlapping with
  the pilot/thiefhall band 10040–10047).
- Same substrate (COMPETENT_FEAST=0 SEATDRIVE=0
  PLENTYDEPRI=0 DEPOSITGATE=1), same 2 lead + 5 tap days,
  same evening procedure, same genuine thief tap, same
  button-handler-equivalent entry disclosure.
- Output: evidence/2026-10-28/sim-thiefinside-b-confirm-corpus/
  (separate from the pilot corpus; never mixed into it).
- Check: scripts/test-thiefinside-confirm-b.js (same legs as
  the pilot proof, minus the thiefhall-determinism leg, which
  cannot apply to fresh seeds with no thiefhall row).

## Confirm verdict rule (pilot bar scaled, not re-scored)

- CONFIRM-GO: >= 12/16 seeds reach the inside thief tap
  (75%, the pilot bar's proportion), havenStoresAccess()
  reads 'inside' on 100% of inside thief taps, and every
  inside tap's outcome is recorded. Verdict line carries
  the button-handler label, as in the pilot.
- CONFIRM-NO-GO: fewer than 12/16 seeds, or any inside tap
  reading access != 'inside', or any inside tap outcome
  unrecorded — with the blocking step named per failing
  seed, as in the pilot.
- The pilot verdict stands on its own band regardless of
  the confirm outcome; a confirm NO-GO would qualify the
  generality of the pilot finding, not erase it.
