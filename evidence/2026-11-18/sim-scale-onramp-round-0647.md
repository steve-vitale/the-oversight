# Scale-onramp round — run fleshout-20261118T0647Z (ADOPTION CLOSEOUT)

- Run: `fleshout-20261118T0647Z`, axis scale-onramp, arms
  [sim-notickexact-a, sim-taxonomy2516-a, sim-handoffrec-a].
- Lock `hidden_files/fleshout-loop.lock` = `fleshout-20261118T0647Z`,
  created 2026-11-18T06:47:00Z. Claim
  `hidden_files/lever-claims/fleshout-20261118T0647Z.json`, same arms.
- **Stale-lock / adoption note:** the 0647Z coordinator timed out; its
  occurrence delivered the incomplete report at 08:45:22Z. Arm 1's worker
  was cancelled by the timeout before finishing; Arm 3's worker timed out
  at 08:41:52Z with a final progress update. This round was completed by
  the adoption coordinator (main session) from the arms' committed state —
  no fresh loop run, no re-scoring of any prereg bar. Arm 2 had already
  landed on master before the adoption began and was not touched again.
  Heartbeats for both live arm trees were kept fresh (<15 min) through
  the adoption so the next Loop A occurrence (~09:15Z) saw live work and
  stood down.

## Arm 1 — sim-notickexact-a: BUILD GO, LANDED

- Branch `sim-notickexact-a`, tip `b985f86ee` (rebased onto master
  `6fb98f473`, journey-scale r239 landing). Commits: prereg `03d755d2e`,
  instruments `e03a1ae68`, prereg Correction 1 `b73d7abbb`, BUILD
  [needs-eyes] `5fe00c196`, evidence+analyses+panels `ee7fe24bf`,
  corpora `63dee4650`, test-anchor correction `b985f86ee`.
- Fix (exact-population no-tick deferral, `src/js/villager-brain.js`
  only, +50/−1): a part-3 `party_launch` commit is held when the plan
  target is set AND `needWave >= 4`. This is the third scoping of the
  no-tick fix — the part-≥2 deferral (sim-notickfix-a) and the part-3
  deferral of every late bid (sim-notickfix3-a) are both CONCEPT-DEAD
  (findings #2498-adjacent entries); this one scopes to the exact
  population the diag measured (all 8 no-tick selections were part-3,
  wave-4 targeted) and fires only 5 times.
- Numbers (fresh band 103541–103548, 150d, VETREENGAGE=1 +
  PROFILEGATE=1 both legs): no-tick instances **5 → 0** (primary PASS,
  contact 5); launched instances 6 → 8; wave-4 events 21 → 19 (90.5%,
  bar ≥90% PASS, barely); deferred bids 5 (cap 20, ≥1 PASS); late
  commits 12 → 4; median survival 139.5d → 144d (ratio 1.032);
  starvation 3 → 3, arm-only 0 → 0; trajectory PASS all 8 seeds
  (103543 def135/div137, 103544 def52/div53, 103547 def96/div97,
  103548 def119/div—); D1 GREEN (seed 103541 60d run twice, identical
  minus file path); D2 GREEN (recorder ON vs OFF fingerprints identical:
  days 60, standing 199, maxWave 4, deaths 69, survived, pantry 38171,
  killLog 68, vetsW4 0, roster 11); panel `review_required` (NOT
  regression_signal; one regression_watch — deaths/100d +0.38, interval
  straddles 0, absolute deaths/run fell −2.125, explained by longer
  median survival); proof test `scripts/test-notickexact-a.js` 41/41
  green on the rebased tip.
- Adoption work: at timeout the armed leg was 4/8 seeds — the adoption
  coordinator ran seeds 103545–103548 with the identical command
  (anchor `eba0da8d6` on all 8 files); reverted the PROFILEGATE bypass
  (uncommitted diff) so the `src/` diff vs base is exactly the fix; ran
  the analyzer (GO bars all true); ran D1/D2 and deleted scratch dirs
  after comparison; built panels + balance-panel compare; wrote the
  evidence file `evidence/2026-11-18/sim-notickexact-a.md`.
- **Test-anchor correction** (recorded in the arm evidence): after the
  rebase, the proof test's static confinement check failed because it
  diffed `src/` against prereg base `03c53bf6e`, which predates the
  muster growth line (`titans.js` + `game.js`) landed on master — the
  fix is byte-identical across the rebase (verified by diff); the test
  was corrected to anchor on `git merge-base HEAD master` (same
  strictness: exactly `src/js/villager-brain.js`), re-run 41/41.
- **Gate:** `node scripts/check.js --quick` on the rebased tip
  `b985f86ee`: **335 passed, 6 failed in 863s** — the 6 failures are
  the standing set (measurement-proof staleness pair, two 120s
  deed-attainment timeouts, phone-frame stale receipt, ladder-bundle
  ambient-raid control), 0 attributable to this branch. The gate ran
  twice: once on the pre-rebase tip `22f161520` (335 passed, 6 failed
  in 770s — the same six) and once on the final tip after master moved
  to `6fb98f473` (scale r239 landing, no overlap with notickexact
  files); the second run is the recorded one. Proof test re-run on the
  final tip: 41/41. Log
  `evidence/2026-11-18/notickexact-a-gate.log/.err`, committed with
  the evidence amendment.
- **Verdict:** BUILD GO. The no-tick-after-commit slice of finding
  #2498 (selected-blocked) is closed on this band: 5 → 0, launches
  held, footprint 5. The finding as a whole stays open — range-0 is
  still the dominant block (see the handoffrec classification below).
- Wall on this band: national 2/8 both legs, rank 0, table 0, wins 0,
  wave-4 7/8, wave-5 2/8, survived 3 → 4.

## Arm 2 — sim-taxonomy2516-a: DONE/GO, LANDED BEFORE THE ADOPTION

- Master `91264af52` (fix) + `07facd8d9` + `b30a6367b`. Finding #2516
  re-read: the stale "exactly 2" hunt-entry anchor is re-frozen (3 hunt
  entries per file, cplan2 third entry shape, competent sha
  df9b7dff4de4; proof test-seedattach-a 89/0). Backlog line 2527 marked
  [fixed]. Not touched by the adoption.

## Arm 3 — sim-handoffrec-a: NO-GO (bar 1, ≥1 clause), HELD

- Branch `sim-handoffrec-a`, tip `c450bae63`. Recorder fix (score-time
  `companionPool` snapshot on every scored call for wave-4 holders, any
  part) + (day,part) join analyzer.
- Fresh band 103541–103548 produced **0** range-0-holder blocked
  selections (frozen classifier: 9 instances, 14 selections,
  resolutions 6 undefined / 3 other / 2 inviter-hurt / 2
  no-tick-after-commit / 1 night / **0 inviter-range-0**), so bar 1's
  ≥1 clause (≥1 selection backed by a mid-day pool row) fails; unknown
  = 0 vacuously. Bar 2 PASS (frozen reproduction exact: 79 selections,
  per-instance 1+8+28+24+5+10+3, tally 28/0/47/4, same 4 unknowns);
  bar 3 PASS (firing 100% on wave-4 scored calls + depart days, zero
  pool-path instrument errors); D1/D2 GREEN; proof test 32 passed /
  1 failed (F6 only).
- Adoption work: the worker's missing pieces were completed in the
  worktree — D1 repeatability, full proof test, evidence file
  `evidence/2026-11-18/sim-handoffrec-a.md`, analysis JSON, commit of
  corpora/logs (`c450bae63`). No `src/` change ever. Judged strictly
  by the prereg bar — **not re-scored**.
- **Verdict:** NO-GO on bar 1's ≥1 clause, HELD. The recorder works
  (bar 3) and reproduces the frozen classification (bar 2), but the
  fresh band staged zero range-0-holder blocked selections, so the
  instrument was never exercised on its target population. Follow-up
  owed (filed in `hidden_files/sim-findings.md`): re-run the
  classification on a band that stages ≥1 range-0-holder blocked
  selection.
- Wall on this band: national 2, rank 0, table 0, wins 0, wave-4 7,
  wave-5 2, median 136d.

## Wall (scale-onramp, this round)

- The launch decision + damage wall stands: launched parties still deal
  ≤11–25% of a wave-4 monster's health, and the deed gate after
  national still does not open (national reached 2/8 on both fresh
  bands, rank 0, table 0, wins 0, wave-5 2/8). Standing-199 stall
  dominates both bands (the D2 fingerprint shows standing 199 at day
  60 on seed 103541). The no-tick edge is closed; the range-0 holder
  block is still the dominant selected-blocked cause on the frozen
  corpus (79/113) and needs a band that stages it before the recorder
  can close the unknown-4.
- Next blanks for the scale-onramp axis: (1) #2515 confirm (corrected
  primary = companion-slot fill rate, 0.00 → 0.25) — Loop B; (2)
  expedroster re-judge — DONE, landed `911c8db0c`; (3) #2518 trio
  drought — Loop B; (4) sim-fightgate-scope-b — Loop B 0130Z adoption;
  (5) #2516 taxonomy re-read — DONE, landed `b30a6367b`; (6)
  handoffrec re-run on a band staging ≥1 range-0-holder blocked
  selection (new follow-up, this round).

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-17/perseed-notickexact-a-armed/*.json' --metrics
national,table,wins,exiled`: **REFUSED recorder-corpus input** (all 8
rows carry top-level anchorCommit — sweep recorder rows, not runs; same
documented refusal as the 1729Z/2025Z/2030Z/2230Z/2315Z/0026Z/0112Z/
0221Z/0330Z/0441Z/0430Z rounds). Baseline NOT rolled. No LOUD lines
beyond the refusal.

## Infrastructure

- Registry-lock contention severe all morning (heartbeats/registrations
  queued minutes; one heartbeat took ~5.5 min to acquire the lock at
  ~09:01Z). The adoption kept both arm trees' heartbeats fresh by
  re-checking, not by force.
- The notickexact gate ran twice: once on the pre-rebase tip
  `22f161520` (335 passed, 6 failed — all 6 the standing set) and once
  on the final rebased tip `b985f86ee` after master moved to `6fb98f473`
  (scale r239 landing, no file overlap with the arm); the second run is
  the one recorded in the arm evidence.
- Write-flap windows 02:00 + 02:28 CST Nov 18 (reported briefly to
  Steve); no flap during this adoption's work.
- Reaper: sim-seekgate-b removed 02:08Z (branch kept, verified on
  disk); nothing else removed during this adoption.
