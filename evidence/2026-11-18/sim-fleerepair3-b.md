# sim-fleerepair3-b — FLEEREPAIR3 leave ends the fight (finding #2500) — BUILD GO

Run: fleshout-loop-b-20261118T1030Z, axis winnability-chain. Adoption
closeout — the run coordinator timed out; the armed leg was completed by
the adoption (seed 103601 finished before the arm worker was cancelled;
seeds 103602–103608 resumed by the adoption).

## The fix

`src/js/fieldFights.js`, the 'leave' trick branch, env-gated
`FLEEREPAIR3=1` (default OFF): after the leave log line,
`if (fleerepair3On()) break;` — the fight ends, so the monster phase
never lands a parting hit. Canon: leaving the Suburb is correct
counterplay ("you can't kill it — LEAVE"); the defect is only that the
fight doesn't end. Commits: prereg `541fdd656`, fix `472179562`.

## Proof (re-run by the adoption on the branch tip)

`scripts/test-fleerepair3-b.js` — 14/14 PASS. Flag OFF leave-first
vTaken 13 → ON vTaken 0 (same RNG seed); outcome still
vFlee/fleeWise/rounds 1/dealt 0, no hit line after the leave.
Monster-first hit preserved on both legs. Wounded leaver OFF vDie
(vTaken 44) → ON vFlee vTaken 0. Trick-unknown and strike fights
identical OFF vs ON.

## Panel

8 seeds 103601–103608, 150d, competent verbatim, substrate
VETREENGAGE=1 + PARTYSIZE4=1, FLEEREPAIR2 unset both legs, FIGHTALLY2
unset. Control 8/8, armed 8/8. Analyzer
`scripts/analyze-fleerepair3-b.js` on
`perseed-fleerepair3-b-ctl` vs `perseed-fleerepair3-b-arm` →
`fleerepair3-b-analysis.json`, verdict **GO**:

- B1 parting hits 13 → 0 (armed 0; control 13 ≥ 1, calibration gate
  met). Leave-first meetings 13 → 10, mean damage taken on
  leave-first 12.92 → 0. Wise-leave deaths 2 → 0.
- B2 wave-4 kills 4 → 6 (armed ≥ control).
- B3 deaths 698 → 694, expedition deaths 230 → 232 (within ×1.10).
- B4 proof green (above).
- Instrument CLEAN: 8/8 files both legs, 0 errors, missingHp 0,
  recMismatch 1/1 on both legs.
- B5 balanced panel (`build-fleerepair3-b-panels.js` +
  `balance-panel.js compare`): decision `review_required` — the
  standard screen-only outcome for an 8-seed panel
  (confirmationSized false), not a flagged regression. Every observed
  metric is `no_material_signal` or descriptive with delta 0 or tiny:
  village deaths 87.25 → 86.75, community loss 0.375 → 0.375,
  survival unchanged, wins 0 on both legs. No uninvestigated
  regression.

Extra (descriptive): wave-5 faced 1 → 2, national-standing villages
1 → 2, launched suburb meetings 6 → 3 (trajectories re-roll once
fights end differently — the bar is parting hits, which is 0).
Launched-meeting mean damage share is reported for continuity only
(leave correctly deals 0): ctl 0.0077 (n=7).

## Smoke-analysis NO-GO is an artifact, not a panel verdict

`fleerepair3-b-smoke-analysis.json` says NO-GO because it was run
with `ctlDir == armDir == perseed-fleerepair3-b-smoke`, which contains
only the ctl 103602 file — both legs analyzed the same file (armed
partingHits 8 = control 8 → B1 fails trivially). The full-panel
analysis above supersedes it.

## Verdict

**BUILD GO.** Finding #2500 FIXED on landing. The fix is one gated
`break` in the leave branch; the panel shows the defect gone
(parting hits 0, wise-leave deaths 0) with no cost elsewhere
(deaths, expedition deaths, kills, survival all flat or better).
