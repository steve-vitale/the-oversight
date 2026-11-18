# Loop B 1430Z round evidence — winnability chain (1 DIAG-GO LANDED + 1 BUILD HELD, merged locally pending ship)

Run `fleshout-loop-b-20261118T1430Z`, axis winnability chain, base master
`f97a529b1` → final master `430b849d2` (master moved twice under the run:
Loop A 1415Z addendum `8bfd1874d`, journey-deepening r237). Loop A live at
run start on scale-onramp (`fleshout-20261118T1415Z`: fightcap-a +
wildavoid-confirm-a, NOT touched); A closed mid-run (fightcap DIAG-GO
landed cherry-picked, wildavoid-confirm NO-GO landed, round evidence
`f97a529b1` + addendum `8bfd1874d`). Registration hazard (recorded, no
work lost): the second worktree registration ran while A's landing
moved HEAD, so `sim-aidleave-b` was created at A's branch tip
`2f5de6260`; the coordinator reset it to master before any work, then
re-based both trees onto the new tip `f97a529b1` — verified clean.

## Arm 1 — sim-aidleave-b — DIAG-GO, LANDED `86e78fb1a`

No `src/js` change. Prereg + driver `406f25ef0`, analyzer + panel builder
+ proof `7da0f3d6d`, evidence + analysis + panel `368b526d3`, corpora
`86e78fb1a`. Proof `scripts/test-aidleave-b.js` ALL PASS on the rebased
tip and again on merged master (verified by the coordinator);
analyzer selftest ALL PASS.

Mechanism (A): the aid-path leave-hit IS the #2500 parting hit, not an
aid-path defect. Band 104411–104418, 150d, competent verbatim,
substrate VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1, identical
seeds both legs (ctl FLEEREPAIR3 off, arm on). Aid-origin, trick-known
Suburb wise leaves: n 7 → 5, total damage **109 → 0** (mean 15.57 →
0, max 25 → 0), parting hits **7 → 0**, wise-leave deaths **1 → 0**.
All 7 control meetings were the 104417 chain (days 94–98), reproduced
exactly. Parting-hit damage 100% of control damage, monster-first 0%,
coverage 1.0. Trick-unknown aid meetings cost 36.5/meeting (rounds
4–7) vs 15.57 known — the known leave is ~2.3x cheaper. Zero
world-tick Suburb meetings on either leg; the phenomenon is
aid-concentrated here. Staged probe P1: an aid-shaped fight takes the
parting hit OFF and none ON (same RNG seed) — FLEEREPAIR3 covers the
aid path's `fieldFight` call. P2 counterfactual: avoiding all 7
meetings saves 109 damage / 1 death — exactly what the fix already
saves, so **a trick-hold consult on the aid path would buy 0
additional damage or deaths on this band**. P3: gate held 13/11 seeks
on trick-UNKNOWN targets; it never touches a trick-known meeting, as
designed.

Wall (identical both legs): national standing 3/8, rank 0, table 0,
wins 0, wave-4 7/8, wave-5 3/8, median survival 132.5d. Band deaths
705 → 697. Panel `review_required` (screen-only), no
`regression_signal`; the one `regression_watch` (community loss
0.625 → 0.75) is investigated — a single-seed 104417 trajectory
re-roll after the saved death (fewer deaths on that seed, 119 →
111), not a lever cost. Instrument CLEAN (8/8 files both legs, 0
errors, missingHp 0, recMismatch 0/0). Fresh ctl reproduces the
archived wildavoid ctl exactly (same slices, wall, 705 deaths).

Sense-test PASS: control logs read "They walk out. (Navigation is
victory.)" followed by a hit line; arm logs show the leave line and
nothing after it. Village assessment (plain words): seed 104417's
village learns the Suburb's trick, answers Haven's call seven times
in five days, does the right thing every time — and pays in blood
until one of its own dies walking out of a street she had already
left. With the fix on, the same village walks out clean five times
and the death never happens. The rest of the band is unchanged.

Finding #2539 ANSWERED (mechanism): FLEEREPAIR3 already covers the
aid path; no separate aid fix needed. The trick-hold consult question
stands as a Steve-call with measured value 0 beyond the fix. New
observation (not a defect claim): bow-armed villagers who know the
trick still loose their opening arrows at the Suburb before walking
out — arrows spent on a fight resolved by the walk-out.

## Arm 2 — sim-partyquads-b — BUILD HELD, NOT merged

Branch `sim-partyquads-b` tip `c89825c87` (fix `3e7b33f2e`, pilot
`e1a945e40`, rebased onto master `430b849d2`; proof re-run green
after the rebase; coordinator verified proof 26/26 + 1 documented
skip on the rebased tip, and verified the code facts below). No
merge: the counter is placed correctly, but no quad can launch on
this tip to prove it counts. Analyzer NO-GO / NO-QUAD-POOL, as the
prereg predicted before the sweep.

The correction that decided the run (verified by the coordinator):
the bump's firing site does not exist on master. `PARTYSIZE4`
occurs nowhere in `src/js`; the PARTYSIZE4 lever (commit
`6f15dbc2b`) never landed (partysize-b pilot NO-GO, lever HELD); no
candidate sets `companion3` (only a read at
`villager-brain.js:664` and a comment saying no candidate sets it);
no `winPlanThirdCompanion` exists; both launch paths cap at a trio.
The faithful extraction is a bump inside a new `if
(launched.length > 2)` guard — placing it in the trio block would
have counted every trio as a quad. Fix (17 lines): `win-plan.js`
`stateOf` default `partyQuads: 0` + null-guard (partyTrios pattern);
`villager-brain.js` `vbrainExecuteDepart` new `launched.length > 2`
block with the `035034c9f` one-liner through the canonical
`winPlanStats()` accessor. Depart-path bump, candidates, gates,
flags, narration untouched.

Pilot: fresh band 105001–105008, 150d, competent verbatim,
substrate VETREENGAGE=1 + PARTYSIZE4=1 + FLEEREPAIR2=1, identical
seeds both legs. Launches 9/9, all trios, all brain path; observed
quads 0/0; `partyQuads` 0/0; `partyTrios` 9 vs 9 (untouched);
no-misfire PASS; trajectory diff 0 differences on all 8 seeds;
starvation 4 vs 4, median survival 150d vs 150d. Proof
`scripts/test-partyquads-b.js` 26 passed, 0 failed, 1 documented
skip (§5q quad-fire leg — unreachable on this tip, owned by the
PARTYSIZE4 lever arm); 10+ checks fail on pre-fix code (negative
control). Analyzer selftest 13/13. Panel `review_required`
(screen-only), every observed metric delta exactly 0.

Wall: national 0/8, table 0/8, wins 0/8, wave-4 unlock 8/8, wave-5
unlock 3/8, survived 6/8, median 150d, standing ≥200: 3/8.
Standing-199 stall on 4 seeds. HP recorder repair status (checked,
not bundled): already lives on master in successor drivers
(partytrios, expedroster, fightallycap, fightgate-scope); the
original `partysize-driver-20261117.js` never landed. Sense-test:
350 `vetSays` rows, 0 doubled articles; the 8 "four" hits are one
scripted System wave-4 line per seed.

The branch holds the correctly-placed bump, proof, and instruments
for the PARTYSIZE4 lever arm to pick up. Findings: #2548 (quad
launch path absent — counter re-land rides WITH the PARTYSIZE4
lever, not before), #2549 (depart-path quad bump missing too — the
lever arm must add both paths' bumps), #2550 (gate parties reach 4,
launches cap at 3 — a future lever must decide whether gate-4s
count), #2551 (HP recorder repair lives on master in successor
drivers — informational, no re-landing). Coordinator correction:
the arm evidence's "finding #2540 'The The Pack-leader'" citation
is the doubled-article finding #2540; the aid-path finding is
#2539 (this round answers it).

## Wall (pooled, 16 seeds across the two arms' bands)

National standing 3/16, rank 0/16, table 0, wins 0, wave-4 unlock
15/16, wave-5 unlock 6/16, median survival 132.5–150d. Standing-199
stall persists on both bands (4 seeds on the partyquads band alone).

## Telemetry deviation check

REFUSED recorder-corpus input on both corpora (all 8 rows carry
top-level anchorCommit; same documented refusal as prior runs) —
baseline NOT rolled.

## Infrastructure

Registry-lock contention all run (each registration/release took
~2–4 min; the reaper skipped on held locks). Safe-commit index
clobber hit every worker commit and the aidleave merge's evidence
commits — repaired each time with the documented `ls-tree -r HEAD
| update-index --add --index-info` pipe, commits verified correct.
A `D` + `??` pair on Loop A's round-evidence file in the main tree
during A's closeout cleared on its own (file committed as
`f97a529b1`); left untouched. One partyquads `check.js --quick`
re-run was killed when found running concurrently with a sibling's
`check.js` (shared-repo jest concurrency); the first run's 336/6
stands (same count as the partytrios tip; one visible row matches
the known pre-existing set; full failure-name list not captured,
not claimed). `/tmp` wiped mid-run (partyquads file backups lost);
the fix was restored from its commit — no work lost. No write-flap
EPERM observed this run. Main tree clean at closeout.

## Findings touched this run

- #2539 ANSWERED (mechanism A; FLEEREPAIR3 covers the aid path;
  trick-hold consult is a Steve-call with measured value 0).
- #2548 (open): quad launch path absent — counter re-land rides
  with PARTYSIZE4.
- #2549 (open): depart-path quad bump missing.
- #2550 (open): gate-4 vs launch-3 counting question.
- #2551 (open, observation): bow volley before a known-trick
  walk-out.

## Next blanks, in order

1. #2538 fight capability — can launched parties WIN wave-4 fights
   (A's fightcap DIAG-GO landed this cycle: parties lose ~82%; the
   winning shape is Rage+bow+3 contributors; the gate never held a
   losing party back — the next arm is a BUILD on that shape, not
   another diag).
2. PARTYSIZE4 lever re-attempt, carrying the partyQuads counter
   with it (both launch paths' bumps + a live quad-fire proof;
   branch `sim-partyquads-b` tip `c89825c87` holds the placed bump
   + proof + instruments).
3. Veteran-guard BUILD decision (#2541) — Steve-call on the shape
   first.
4. Scholar plan machinery (#2542) — Steve-call whether intended
   or gap.
5. #2515 4th seat — 3rd-ally-slot arm in `fieldFights.js`, after
   fight capability exists (sense fix stays HELD until parties can
   win; gate-4s now raise the counting question #2550).
6. #2510 steering call (accept closed-by-instrument vs stage
   deliberately — now with two independent confirmations).
7. Trick-hold consult on the aid path — Steve-call (measured value
   0 beyond FLEEREPAIR3 on this band).

Winnability chain stays converging (NOT converged). Scale-onramp stays
converging (Loop A closed this cycle: fightcap DIAG-GO + wildavoid-confirm
NO-GO landed). Food-economy stays converging (parked). Claim deleted;
lock deleted. Aidleave merged locally pending ship; partyquads HELD on
branch `sim-partyquads-b` (`c89825c87`), tree left registered with a
fresh heartbeat for the PARTYSIZE4 arm.
