# Loop A round 2315Z — scale-onramp adoption verification (2026-11-01)

Run: fleshout-loop-a-20261101T2315Z. Axis: scale-onramp (converging, NOT
converged). Sibling Loop B live on food-economy throughout (2230Z claim:
gatediseng-confirm + entrywindow; its round evidence bf70579db and
entrywindow-confirm e3cb8f88c landed mid-run) — NOT touched. No Loop A lock
at start. Pre-flight: main tree clean, disk 25%, `worktree-reap.sh` removed
nothing (all live trees dirty or fresh-heartbeated).

## What this run was for (DELIVER OVER MEASURE, Steve 2026-11-01)

Not another measurement round. Two build-lane landings from today, both
already on master and pending ship, were adoption-verified in live sims:

- Build 11ea80917 — muster call generates rosters for unvisited linked
  villages (fixes the freeface finding: rosterless trusted allies sent
  nobody).
- Build 3056aeb4f — Herald drifts Haven-ward (fixes the heraldplace gap:
  symmetric random walk, shared-tile contact on only 1/8 seeds).

Both arms were DIAG/adoption only: zero `src/js` changes in this run, no
gates, stages, deed bars, or win prices touched, nothing from the #1538
steve-call queue built. Claim
`hidden_files/lever-claims/fleshout-loop-a-20261101T2315Z.json` was written
before any sims and is deleted at closeout.

## Arm 1 — sim-musterroster-adopt-a: NO-GO at pilot (mechanism ADOPTED, ceiling still short)

Worker commits (branch sim-musterroster-adopt-a, rebased clean onto
e3cb8f88c, validator re-run on the rebased tip, merged --ff-only as
423634dba): 6ef32f7e prereg (committed BEFORE any judged sim),
a01668f02 evidence + corpora. Proof: validator reproduces the verdict on
the rebased tip.

Live seed 90111, first refused Herald attempt:

- BEFORE (recorded muster3 corpus): day 87, trusted-tier trust 91/84/88,
  quota 6 each, snapshot yield 3, sounded call brought 3 (Emberhold only),
  ceiling 6/10, NOT READY.
- AFTER (current master): trigger day 72, sounded call brought 6
  (2+2+2), Haven commit 3 → 9/10, muster NOT READY. Prereg bars yield ≥10
  FAIL, ready FAIL; Stonebridge/Thornfield responders, link count, and
  instruments all PASS.

The faces problem IS fixed on a real timeline: the call now reaches
Stonebridge (Kira Reyes, Ibrahim Costa) and Thornfield (Omar Frost,
Deshawn Santos) plus Emberhold (Kenji Ford, Elena Kowalski), every
responder verified as a named living adult on its village's roster, link
count unchanged 3→3, transcript reads sensibly ("Stonebridge answers!
Kira Reyes and Ibrahim Costa will march…").

Why the ceiling still misses: the Herald-steer build moved first contact
from day 87 to day 72, before trust reached the trusted tier — so quotas
are base-2, not trusted-6. The two builds interact: steering the Herald
in sooner means the call goes out while trust is still young. Proven
non-instrument: the unmodified muster3 sweep re-run on current master
reproduces the day-72 / trust-69-48-57 / quota-2 pre-trigger state
exactly. The cross-base before/after (day-87 trusted vs day-72 base) is
NOT a clean comparison, and the arm evidence says so plainly.

Control 85106: NOT JUDGED. Zero Herald attempts and zero muster snapshots
on current master in both the replay and the diagnostic sweep — the old
"reachable control (5→9)" no longer describes 85106. Next run needs a
fresh refused-Herald screen on current master.

Other findings (documented, not chased): trust bleeds across the refusal
window (69→4, 48→0, 57→0 by day ~102; no active links left by day 103) —
a doom loop where refusals erode the trust needed for trusted-tier quota.
Tail observation only (n=1): intervened 90111 died day 107 / maxWave 4 vs
unintervened diagnostic day 140 / maxWave 5. Pilot wall numbers
(intervened): 90111 maxWave 4, national 0, table 0, won 0, 107d; 85106
maxWave 4, national 1 (ever-national), table 0, won 0, 181d; band median
survival 144d, max 181d. No confirm spend, per the prereg pilot gate.

Evidence: evidence/2026-11-01/sim-musterroster-adopt-a.md; corpus
evidence/2026-11-01/perseed-musterroster-adopt/; instruments
scripts/musterroster-adopt-replay-20261101.js,
scripts/test-musterroster-adopt-a.js.

## Arm 2 — sim-heraldsteer-adopt-a: GO (Herald-steer adoption verified in live seeds)

Worker commits (branch sim-heraldsteer-adopt-a, rebased clean onto the
musterroster-merged master, own proof test 10/10 on the rebased tip,
merged --ff-only as 524907e13): 3f4da1b6f prereg (committed BEFORE any
judged sim), 6c9bd1581 pilot+confirm corpora + evidence, 4ed25abba
heraldarr2 reference analysis. DIAG only, zero `src/js`.

Prereg judged exactly: screen from 95401, cap 72 scanned, 24 qualifiers
(gameDays > 120 AND won == 0 — the heraldarr2 lesson, since lesser-seat
wins on days 90–100 censor the titan window). Pilot = 8 qualifiers,
confirm = 16. Same tableseat-nowait + fullseat-diag + wavegate-diag stack,
heraldarr2 instrument reused unmodified, DAYS=180 death-aware.

| Measure | BEFORE (recorded) | AFTER pilot (8) | AFTER confirm (16) |
|---|---|---|---|
| Contact-seed rate | heraldplace 1/8; heraldarr2 pilot 2/8 | 4/8 (bar ≥ 3/8) | 9/16 |
| Total Herald contacts | heraldplace 30; heraldarr2 pilot 81 | 147 (142 scholar + 5 villager) | 445 (393 scholar + 52 villager) |
| Haven windows | heraldarr2 pilot 4, confirm 1, all raidPin | 11, all raidPin, chain-continuous | 22, all raidPin, chain-continuous |
| Herald raid drafts | heraldarr2 pilot 6, confirm 1 | 12 | 29 |
| Linger re-pins (moved + held) | heraldarr2 pilot 18 | 65, 0 missing days | 107, 0 missing days |
| Pooled mean dawn distance to Haven | heraldarr2 pilot 3.51 (same instrument) | 1.89 | 1.74 |
| Teleports / wander Haven landings | 0 / 0 | 0 / 0 | 0 / 0 |

Pooled 24-seed band: contacted 13/24, 33 Haven windows across 14 seeds,
all raidPin. Band wall numbers (screened band only, never pooled with
arm 1): won 0/24, national 11/24, table 5/24, wave-4 20/24, wave-5 2/24
(95425, 95440), median survival 181d. No wave-5 fight chain completes in
this Herald-only instrument (95440 pairs wave-5 reach with 41 Herald
contacts; 95425 pairs it with zero contacts — neither is a recorded
wave-5 fight).

Guardrails intact: neutrality on first contacted seed 95402 (ON vs OFF
end fields identical 8/8); determinism (95402 ON re-run byte-identical
except anchorCommit); steer proof PASS + non-Herald control
(MONSTER=gallowdeer) PASS. Base drift, reported not smoothed: this HEAD
differs from the heraldarr2 corpus base (steer + later journey commits);
the re-screen drops 95404 (now dies day 103; it was heraldarr2's star
seed) and adds 95402/95411 (both contacted here). 13/16 heraldarr2
qualifiers still qualify. No old code was checked out to fake a baseline.

Proof exception, documented not hidden: the arm's own adopt test passes
(pilot 313/313, confirm 601/601), but the reused heraldarr2 test on the
confirm corpus scores 3036/3037 — the single failure is that test's
hardcoded `corpus-has-8-seeds` leg, a pilot-size assumption failing by
construction on a 16-seed confirm corpus (the 16===16 seed-count leg
passes, all census legs pass). The worker did NOT edit the test to force
green; the exception is in the arm evidence (bar 7, metric review (g)).
The next reuse needs a confirm-size parameter.

Sense-test: arrivals are loud, named, priced (raid line names The Herald,
"Nobody met" linger line, nightly gorge with real kcal). Two honest
wrinkles, both repeats of known ones: 95413 day-180 gorge "0 kcal", and
the "~6 nights" drift promise over-promising across re-drafts. No
teleporting, no list feed — the steer reads only the Herald's own tile
and Haven's map tile.

New secondary finding (not chased): villagers now KILL the Herald — 5
times across the band (95402, 95433, 95438, 95439, 95440, each with a
removal record and no re-placement) — and DIE to it twice (95423 days
174–175, both on the Haven tile). Heraldarr2 saw zero Herald deaths
either way. Scholar contacts: 535 across the band, ALL refused — facing
is still gated through the call (#1538 pending, untouched). Unattributed
windows (17, all non-haven) and travel mismatches (48, follow+nested
collapse class) touch no Haven landing.

Evidence: evidence/2026-11-01/sim-heraldsteer-adopt-a.md.

## Wall numbers (this run — bands kept separate, never pooled)

- Full seat: 0 everywhere in this run. Wave-5 fight chain completed: 0.
  Wave-5 reached: 2/24 on the heraldsteer band (no fight recorded).
- Muster ceiling on the failing cluster seed: 9/10 (was 6/10) — faces
  fixed, quota timing now binds.
- Herald contact: 13/24 screened seeds contacted (was 1/8 / 2/8 on the
  reference bands); 33 Haven windows, all raidPin.
- scale-onramp stays CONVERGING, NOT converged. The two builds move the
  wall's two known mechanisms (faces, contact) in live sims, but no game
  change in this run and no wave-5 fight chain completes. food-economy
  untouched (sibling Loop B lane).

## Village assessment, in plain words

The village can now hear from allies it has never visited — real named
people answer the call — but it calls too early, while trust is still
young, so each ally sends two fighters instead of six and the muster
falls one blade short. And the Herald now actually comes to town: it
circles Haven, gets pinned by raids, lingers, and is met far more often.
But meeting it is not fighting it — every scholar contact is still
refused through the call, and the one time the village does kill it,
nobody puts it back. The wall moved from "nobody answers, nobody comes"
to "they answer, he comes — and the numbers still don't close."

## Telemetry deviation check (coordinator, post-merge)

- Musterroster pilot glob (`perseed-musterroster-adopt/pilot-s*.json`,
  n=2) against scale-wall.json: 3 LOUD lines (national 12→0, table
  16→0, wins 16→0). VERDICT: documented regime artifact, NOT a
  deviation. The baseline file's own `_regime` note says it is a WINSEAT
  regime (SEATDRIVE=1, wins 16/16) and "DO NOT compare pre-seat
  substrates against this baseline — telemetry-check will fire a
  spurious LOUD 'wins disappeared'." This corpus is a 2-seed pre-seat
  adoption pilot; wins/table are structurally 0 here. Baseline NOT
  rolled. Counting note for the next prereg: the tool's national count
  (0) differs from the worker's ever-national count on 85106 (1); with
  n=2 neither count moves any wall claim, but the metric definition
  must be named in the next prereg.
- Heraldsteer corpus: telemetry-check REFUSED the pilot glob by design
  ("recorder-corpus input: all 8 rows carry top-level anchorCommit …
  compared with sweep-compare tables, never against a run baseline").
  NOT forced with --allow-recorder-corpus — that would repeat the
  forbidden cross-regime comparison. Same precedent as the muster3 /
  latewin recorder refusals. Baseline NOT rolled.

## Metric review (for the NEXT run, not this one)

1. Judge the muster call at a competent player's trigger moment, not at
   the first refused Herald attempt: the trigger moved (day 87→72) and
   took the quota tier with it. A future adoption prereg must define
   trigger (e.g. first call at trusted tier, or first call a competent
   player would sound) before judging yield.
2. Re-baseline befores after movement builds: any build that moves when
   contact happens invalidates day-anchored befores. Re-screen controls
   on the current master (85106 and 95404 are both stale as controls).
3. Reused tests need a confirm-size parameter: the heraldarr2 test's
   hardcoded 8-seed leg must take the corpus size before its next reuse.
4. Telemetry national metric: name ever-national vs end-national in
   the prereg; the tool and the worker counted different things on
   85106.
5. Panel (§15): not applicable to either arm as preregistered — both
   comparisons are DIAG censuses against recorded reference corpora on
   a moved base; none fabricated.

## Next blanks, in order

1. Muster quota-at-trigger: the binding constraint is now quota timing,
   not faces — instrument trust-building before the call, and/or judge
   the call at the trusted-tier moment (see metric review 1).
2. Trust-bleed doom loop: refusals erode trust (69→4, 48→0, 57→0 by
   day ~102 on 90111) — instrument whether anything recovers trust
   after a refusal, before proposing a fix.
3. Fresh refused-Herald screen on current master: 85106 (muster control)
   and 95404 (heraldarr2 star seed) are both stale as controls.
4. Herald-killed / Herald-kills: villagers kill the Herald 5× (removal,
   no re-placement) and die to it 2× — instrument whether killing the
   Herald helps or hurts the titan road.
5. #1538 steve-call queue — still open, not a build: sounded-but-short
   muster meaning, re-sound after a lost muster-fight, links-require-
   approach (note: the build lane chose call-generates-rosters as a
   coordinator call under figure-it-out-yourself, documented for
   Steve's overrule; if he rules the other way, revert titanAlliedFaces
   and the ceiling problem returns to the link-creation question).
6. #1595 Herald HP drop remainder (350); heraldarr2 instrument
   follow-ups (unattributed non-haven windows, follow+nested mismatches)
   — instrument-only.
7. Field-death narration blank (observation only).
8. By-design-or-drift ruling on lesser-wins-before-the-titan-road
   (steve-call, filed 1935Z).

## Landing record

- Musterroster branch rebased onto e3cb8f88c clean (2/2 picks); validator
  re-run on rebased tip reproduces the verdict exactly (90111 FAIL
  yield≥10 + ready, all other bars PASS, 85106 N/A); merged --ff-only
  423634dba; tree released merged, worktree removed, branch deleted.
- Heraldsteer branch rebased onto 423634dba clean (3/3 picks); own proof
  test 10/10 on rebased tip; merged --ff-only 524907e13; tree released
  merged, worktree removed, branch deleted.
- Coordinator evidence landed via its own branch + --ff-only merge (no
  direct master commit). No push, no version bump, no live verification
  — the ship loop owns deploys. Merged locally, pending ship.

## Infrastructure notes

- Worktree registration is SLOW under sibling load: the first register
  attempt hung >6 min on REGISTRY.lock contention (flock verified free
  afterwards); recovered by removing the unregistered tree (no work in
  it) and re-registering — both trees then registered in ~2–3 min each.
  Do not mistake a slow register for a failed one; check the tree and
  the registry before retrying.
- Safe-commit index clobber struck both workers' commits (known lesson);
  both repaired via --add --cacheinfo from HEAD blobs, commits verified
  intact via `git show`. No clobber on the coordinator merge path.
- Master moved twice during landing (Loop B round evidence + entrywindow
  confirm); both branches rebased cleanly with proofs re-run on each
  rebased tip before --ff-only merges. Merges verified alone before any
  chained release/remove step.
- No container EPERM write flap this run (contrast the 2030Z run).
- check.js --quick NOT re-run: zero src/js, zero policy-default flips
  (instruments + evidence only).

Claim deleted; lock deleted.
Merged locally, pending ship.
