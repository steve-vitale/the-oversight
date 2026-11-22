# sim-scale-onramp-round-0615 — Loop A lever round (ADOPTION)

Run `fleshout-20261122T0615Z`, axis scale-onramp. Base `bda6ff495` (the
1115Z round record). The run timed out at its 7200s execution cap during
closeout — cellcheck landed, needwave unmerged, telemetry / tracker /
findings / gate unrun. This adoption finished the closeout. Both arms are
the tracker's next blanks from the 1115Z review, in order: (1) the cell
supply / re-arming diagnosis (#2650 follow-up); (2) the needWave copy in
the companion plan sync (leadgate-a's named next lever).

## Arm 1 — sim-cellcheck-a: CELL SUPPLY / RE-ARMING DIAGNOSIS (DIAG-GO)

Finding #2650 follow-up (the evidence header cites #2672 — that is the
findings-file line number of the #2650 entry). Evidence:
`evidence/2026-11-22/sim-cellcheck-a.md`.

- Prereg `6ec6d4401` (fresh band 107367–107374, 150d, competent verbatim,
  GUNRATE=1 substrate identical to killrate-a). Instrument: driver +
  `scripts/analyze-cellcheck-a.js` + proof test
  `scripts/test-cellcheck-a.js` (37/37, analyzer 25/25, regression
  test-fusioncell-a 40/40), commit `84dbeb8a6`.
- **Verdict: DIAG-GO — all five frozen bars pass.** Attribution 5/5 (3
  searcaster + 2 fusion_cell grants, every grant explained at grant +
  prize level); grant-bundle table reported; lost-volley count reported
  (0); wall numbers reported.
- **The answer, in plain words:** a contest gun does NOT arrive dry.
  Every searcaster granted arrived with exactly 2 fusion cells beside
  it (grant-level delta +0, prize-level delta +2 on all 3 searcaster
  grants; the 2 fusion_cell grants +1/+1), and no holder ever went dry:
  3 holders, 43 holder-days, all 43 with cells, zero dry days, zero
  cells ever spent in combat. The re-arm question answers itself:
  nothing re-armed because nothing needed re-arming — the gun never
  fired because no gun holder ever entered a wave-4+ fight (98 wave-4+
  fights on the band, 84 fought, zero with a searcaster participant).
  Lost volleys: 0 — by an empty pool, not by armed holders winning
  fights. The wall moved one step down the chain: supply is solved
  under GUNRATE=1 and the wall is still participation — the people
  holding the guns are not the people fighting the wave-4 monsters.
- One holder's gun vanished from his pack mid-expedition with no
  recorded cause (evidence §4.3) — named, not hidden; the
  vanish-tiling tracer fix (vanishtile-a) is the instrument for that
  class.
- Merge: `ffc70261e` (by the run, before the timeout). Worktree
  released done-merged, branch deleted by the run. Verified an ancestor
  of HEAD by the adoption.
- Findings: #2650 updated with the DIAG-GO answer (supply solved under
  GUNRATE=1; wall is participation).
- Wall: wins 0/8, national 0/8, wave-5 1/8, wave-4 8/8, median survival
  147.5d, 4 communities lost (all regional).

## Arm 2 — sim-needwave-a: needWave COPY IN THE COMPANION PLAN SYNC (NO-GO)

Finding #2685 (companion sync drops needWave). Evidence:
`evidence/2026-11-22/sim-needwave-a.md`.

- Prereg `57f19d1b9` (frozen before any judged run; fresh band
  107375–107382, 150d, competent verbatim, gunlife substrate).
  Instrument: driver + `scripts/analyze-needwave-a.js` + proof test
  `scripts/test-needwave-a.js` + panel builder, commit `7696e4398`.
- The lever (commit `587ce525d`, reverted by `7166408b1`): copy
  `needWave` in the companion plan sync — one line per companion, three
  syncs per site, at BOTH sites: `src/js/win-plan.js` `launchParty`
  (DEAD in sims — the brain owns dawn and `agencyTick` never reaches
  it — but the copy belongs there so the two paths cannot drift apart
  again) and `src/js/villager-brain.js` `vbrainExecuteDepart` (the live
  path: all 18 launches on this band came through it).
- **Verdict: NO-GO on det-gate (prereg bar 2).** The intended effect
  works where it fires, and the primary, trio, beat, starvation and
  survival bars all pass — null launches 4/11 → 1/7 (bar ≤ 0.25),
  trio+ 0.36 → 0.43, departure beats 0.64 → 0.86, starvation flat 5 →
  5, median survival 149.5d → 139.5d (bar ≥ 0.8× control). But the
  determinism gate fails on 2 of 8 seeds, and the failure is a real
  side-effect of the lever as written, not harness noise: a leader
  whose own plan has no wave target wipes a companion's good wave
  number when they set out together. Seed 107377: Mia (null) leads a
  day-58 departure with Jason as companion and wipes his seeded wave
  4, so his day-63 launch goes from a spoken four-person party to a
  silent pair (village lost 33 days sooner, 118d vs 151d). Seed
  107378: a wave-3 holder's needWave wiped day 67 the same way. The
  band's launch total fell 11 → 7.
- The instrument was blind to the wipe in two ways
  (`scripts/needwave-driver-a.js`, `diffNeedWaves`): it drops every
  change whose new value is null (`a != null` filter) and skips the
  leader's own plan — so the det-gate's first-copy bound was 60 days
  late (107378: bound day 127, true divergence day 67) or absent
  (107377: no copy ever recorded). The det-gate failure is a genuine
  catch, not harness noise.
- The game-code change is reverted zero-trace per kill protocol
  (instrument + evidence kept; adoption verified the src/ diff between
  the rebased tip and master is empty). The fix for the fix — copy only
  when the leader's wave number is set, never erase one that is already
  there — is a follow-up arm (sim-needwave-b), not a re-score of this
  one.
- Proof status on the rebased tip (adoption re-ran BEFORE the guard
  flip below): proof test `scripts/test-needwave-a.js` 15/23 on the
  reverted code AS DESIGNED (8 fail: companion wave number stays
  null, beat hook silent); 23/23 on the new code per the evidence.
  Analyzer selftest 19/19 re-green on the rebased tip. The proof test
  is NOT in the check.js suite (verified: no mention in
  scripts/check.js or green-list.txt), so its designed failure could
  not fail the gate.
- GUARD FLIP (live 1415Z run, after this adoption's proof re-run):
  the 1415Z Loop A occurrence adopted this branch itself and flipped
  the proof test into a NO-GO revert guard (commit `512f86760`):
  the test now proves the unguarded copy is ABSENT on both launch
  paths and that a companion's set wave number survives departing
  with a null-wave leader (§B2W wipe guard). Adoption verified the
  flipped test on the reverted code: **26/26 pass, 0 fail**. A guarded
  copy (sim-needwave-b, being registered by the 1415Z run) replaces
  this guard with a lever proof of its own. The frozen arm record
  (23/23 on the lever code) stands in sim-needwave-a.md §9.
- Panel comparison (§15): decision review_required. Wins 0 → 0,
  national 0 → 0, deaths per run 96 → 97.75 (+1.75,
  regression_watch), deaths per 100 days 70.0 → 73.3 (+3.27,
  regression_watch), community loss 0.375 → 0.5 (+0.125,
  regression_watch). The panel is the instrument; the frozen bars in
  the evidence §2 are the judge. No scale movement; the death uptick
  stays inside the frozen guardrails.
- Merge: evidence-only (instrument + evidence + prereg; no game-code
  change). Adoption rebased 5/5 clean onto current master
  `4dc7cb454`, no stop-at-pick quirk; proofs re-run on the rebased
  tip as above. **NOT merged by this adoption** — the live 1415Z Loop
  A run adopted this branch itself (guard flip `512f86760` + follow-up
  arm sim-needwave-b) while this adoption was gating, so the merge,
  release, and branch delete are theirs. The branch is left HELD on
  tip 8c919556e + the correction below, worktree registered and clean.
  Do NOT merge from this record alone — the 1415Z run owns the
  closeout.
- Findings filed: [open] null-holder wipe (the companion sync copies
  needWave unconditionally); [open] diffNeedWaves blind to null wipes.
- Wall: wins 0 → 0, national 0 → 0, wave-5 reached 3 → 3 villages,
  wave-4 reached 8 → 8, median survival 149.5d → 139.5d, villages
  lost 3 → 4.

## Wall (arm legs)

| | cellcheck | needwave (ctl → arm) |
| --- | --- | --- |
| Wins | 0/8 | 0 → 0 |
| National | 0/8 | 0 → 0 |
| Table | not instrumented | not instrumented |
| Wave-5 reached | 1/8 | 3 → 3 |
| Wave-4 reached | 8/8 | 8 → 8 |
| Median survival | 147.5d | 149.5d → 139.5d |
| Village-lost | 4/8 | 3 → 4 |

All seeds regional; the scale wall still binds everywhere. The
gun-supply question is now answered and the lead question is answered
one level up from the gun — the next lever is the GUARDED needWave
copy, not another gun change.

## Telemetry

`telemetry-check` ran against the scale-wall baseline
(`--allow-recorder-corpus`, metrics national,table,wins,exiled) on
both arms' per-seed corpora (cellcheck
`evidence/2026-11-22/perseed-cellcheck-a-diag/*.json`; needwave
`evidence/2026-11-22/perseed-needwave-a-arm/*.json`): exactly the
same 3 LOUD regime lines on both (national 12 -> 0, table 16 -> 0,
wins 16 -> 0) — EXPLAINED, regime artifact (the baseline is the
winseat regime; these corpora are a pre-seat competent-policy
substrate where wins are structurally ~0), baseline NOT rolled.
Exiled quiet. Same artifact as 0815Z/0215Z/1115Z.

## Gate

`node scripts/check.js --quick` on the rebased tip `229a9d8bd` (log
`hidden_files/check-quick-0615-adoption.log`, run in the needwave
worktree via a detached script, serialized — no other gate running at
launch): **339 passed, 5 failed in 697s, 0 attributable.** All 5 are
exactly the standing set, identical to 1115Z/0815Z:
test-measurement-proof-update.js + test-measurement-workflow.js (the
measurement-proof staleness pair), test-phone-frame-proof.js (stale
receipt), test-living-garden-deed-attainment.js +
test-one-person-army-deed-attainment.js (120s timeouts under load).
The proof test `scripts/test-needwave-a.js` is not in the check suite
and its designed 15/23 on the reverted code cannot fail the gate
(verified: no mention in scripts/check.js or green-list.txt).

## Flap / restart

- The run timed out at its 7200s execution cap during closeout
  (cellcheck landed, needwave unmerged, telemetry / tracker /
  findings / gate unrun). No flap window was reported during the run's
  work; the adoption saw no flap window either — writes clear
  throughout (heartbeat + gate log writing cleanly).
- The 1415Z Loop A occurrence claimed `fleshout-loop.lock` at
  15:15:30Z, minutes before the adoption started; the adoption did
  not touch its work. Registry-lock serialization: none needed — the
  needwave worktree was intact and clean, no re-registration.

## Lock / claim

- Claim file `hidden_files/lever-claims/fleshout-20261122T0615Z.json`
  did NOT exist at adoption start (already retired by the run or its
  timeout path) — nothing to retire.
- Lock `hidden_files/fleshout-loop.lock` was NOT the 0615Z lock at
  adoption start: it read run_id `fleshout-20261122T1415Z`, created
  2026-11-22T15:15:30Z (the live 1415Z Loop A occurrence). The
  adoption did NOT delete the lock — it belongs to a live run, and the
  per-line run_id guard refused the delete as designed. The 0615Z
  lock itself was already gone (replaced by the 1415Z claim).

## Closeout mechanics (for the record)

- Master moved during the run: `bda6ff495` -> `ffc70261e` (cellcheck
  evidence) -> `4dc7cb454` (journey-landing r154 gate record). The
  needwave branch rebased 5/5 clean onto `4dc7cb454` during the
  adoption, no stop-at-pick quirk; scope verified (needwave touches
  scripts/ + evidence/ only; the only src/ change in the range was
  journey's convo-beats.js dialogue + the r154 proof test).
- Index clobber: none struck on the adoption's safe-commits (checked
  with full `git status --short` after each commit).
- Seed bands: cellcheck 107367–107374, needwave 107375–107382, both
  verified fresh in their preregs.
- The 49-seed kill-loot searcaster arrival band stays unrun (deferred
  with rationale in the 1115Z record: the fixture already judged the
  volley and killrate sized the rate at ~4.6%/seed).

## Commits

- sim-cellcheck-a: prereg `6ec6d4401`, instrument `84dbeb8a6`,
  evidence `ffc70261e` (merge tip, by the run).
- sim-needwave-a: prereg `f9f6e43bd` (rebased), instrument
  `882099e9c` (rebased), lever `f0485969f` (rebased, reverted by
  `870f61e19`), evidence `229a9d8bd` (rebased tip), guard flip
  `512f86760` (by the live 1415Z run), record `8c919556e` + handover
  correction (this commit). Branch HELD — merge is the 1415Z run's.
- Round record: this commit (follows the needwave evidence tip
  `229a9d8bd`) + the handover correction below (the record's own
  commit). The merge tip is the 1415Z run's to record, not this
  adoption's.

## Handover correction (adoption closeout)

While this adoption was gating (gate launched 15:20Z, finished
15:32:48Z), the live Loop A 1415Z occurrence adopted this branch
itself: it committed the proof-test guard flip `512f86760` at
15:26:52Z and began registering the follow-up arm sim-needwave-b
(guarded copy) at ~15:31Z. The adoption's proof re-run (15/23 as
designed) predates the flip; the flipped test was verified by this
adoption after the fact (26/26 on the reverted code). The gate
(339/5 in 697s, 0 attributable) ran on the pre-flip tip — the flip
touches only `scripts/test-needwave-a.js`, which is not in the check
suite, so the gate numbers stand. This adoption yields the merge,
release, and branch delete to the 1415Z run and does NOT delete the
Loop A lock (it belongs to the 1415Z run). The branch is left clean
on this correction commit, worktree registered and heartbeated.
