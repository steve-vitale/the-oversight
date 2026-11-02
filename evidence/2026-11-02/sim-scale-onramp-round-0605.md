# Loop A 0605Z round — scale-onramp: arrears diagnosis (GO) + arrears-route (UNDER-POWERED, killed)

Run: fleshout-loop-a-20261102T0605Z, axis scale-onramp, 2 arms.
Sibling Loop B live on food-economy throughout (0459Z claim closed
mid-run, new 0619Z claim opened: jumpfaithful + stayhome) — NOT
touched. Claim written before any sims. Pre-flight: main tree
clean, disk 27%. Master moved repeatedly under the run (Loop B
0459Z evidence, journey-social r102, journey-establishment r76);
both arms rebased clean onto the moving tip before merging
--ff-only, no merge conflict, no force, no sibling branch touched.
Rotation untouched (convergence-directed axis work supersedes
rotation; rotation stands at 3).

## Arm sim-arrears-a (commits 4343d2cc7 prereg + a8105ad3d
## evidence + d35e5550f corpus, policy-only, zero src/js): DIAGNOSIS GO

Prereg committed BEFORE any judged sim. Validator
scripts/test-arrears-a.js: VERDICT GO, fails=0 (re-run by the
coordinator on master after merge: GO).

The answer: a subordinate fire that falls behind on tribute
NEVER stops being behind on a Haven-primary link. Once arrears
> 0, the debt never shrinks: full current-week payments leave it
standing, DEPOSITGATE waivers leave it standing, renegotiation
only cuts the FUTURE weekly rate, and break/relink inherits the
debt by design. There is no verb in the game that pays off old
debt on a Haven-primary link — and every blocked seed in this
band is Haven-primary, so the one real clearing verb
(Haven-subordinate payTribute, one full week, +3 trust) does not
even apply here. Waiting makes it worse; sounding anyway costs
-8 trust per refusing fire.

Per-seed per-link, first failure (all links Haven-primary, kind
tribute; refusal reason arrears>0 alone, no trust/opinion failure):

- 95447 day 94: Emberhold trust 45 / opin 11 / arrears 9,750 /
  trib 3,000/wk / sub pantry 0 / age 62 — 2 blades lost.
  Stonebridge (0 arrears, gives 2) and Thornfield (0 arrears,
  gives 2) clean.
- 95464 day 128: Emberhold 69 / 6 / 3,000 / 2,250 / 0 / 87 — 2 lost.
  Stonebridge gives 6, Thornfield gives 2.
- 95478 day 104: Emberhold 65 / 22 / 26,000 / 3,000 / 0 / 79 — 2
  lost; Thornfield 49 / 26 / 11,000 / 3,000 / 0 / 77 — 2 lost.
  Stonebridge gives 3 (faces-limited).
- 95512 day 73: Emberhold 83 / 35 / 4,000 / 3,000 / 45,000 / 48 —
  6 lost; Stonebridge 47 / 30 / 16,980 / 3,000 / 0 / 47 — 2 lost;
  Thornfield 54 / 35 / 4,000 / 3,000 / 45,000 / 46 — 2 lost.

Clearing trace, 107 observed blocked link-days: ZERO arrears
decreases, 3 increases (missed weeks, +2,250 each, -2 trust
each). 95447 Emberhold 9,750 -> 12,000 (day 124; 3 waivers,
succession presses 3,000->2,250->1,688, one missed week); link
BROKE day 126 still carrying 12,000. 95464 Emberhold flat
3,000 (single missed week, day 126). 95478 Emberhold flat
26,000 with sub pantry 43,481 at end — rich, still indebted;
Thornfield flat 11,000 (1 waiver). 95512 Emberhold flat 4,000
(full current-week payment day 77, old debt untouched, sub
pantry 45,750); Stonebridge 16,980 -> 21,480 (two missed weeks,
insolvent); Thornfield flat 4,000 (full payment day 84, old
debt untouched).

Cost: there is no price. For Haven-primary arrears the debt is
a permanent refusal flag, not a payable balance — even a
subordinate holding 45,000 kcal against a 4,000 debt never pays
the backlog, because the engine collects only the current week.
A clearing path would require inventing a back-payment verb
(game-code change — flagged as a design gap, not built by this
policy-only arm).

Wait vs route-around: waiting fails on all 4 (trust falls, new
debt accrues — 95447 Thornfield was clean at first failure and
owed 5,626 by run end). Routing around works only on 95464 (9
at first failure, one short; full 3-blade Haven commit reaches
11). 95447 needs Stonebridge tended 67->70 trust (quota 2->6,
total 11); 95478 (max 6) and 95512 (max 3) are unroutable as-is.

Sense-test: "— Emberhold REFUSES. debts unpaid between you.
(trust -8 — refusals are remembered.)" Honest and human, but
names no amount or week. The gap is the waiver line — "Tribute
wagons from Emberhold turn at the gate… 'That IS your tribute
this week.' (Trust +1.)" — which reads as forgiveness while the
old debt still refuses the call. Any future clearing verb must
name the backlog explicitly.

Control / drift: ZERO drift. In-run current-code control
reproduces the old sumconfirm corpus exactly at the decision
moment (first-failure days 94/128/104/73, every
trust/opinion/arrears value) and the 0445Z no-call screen band
exactly on all 6 seeds. The sumdeploy landing moved no no-call
trajectory, and the census reads perturb nothing.

Qualification (disclosed, not buried): the prereg's "30 days"
ran to run end on three seeds — full 30 days only on 95447
(94–124); 95464 10 days, 95478 6 days, 95512 18 days (runs
ended). The never-clears verdict rests on 107 link-days with
zero decreases + direct observations of waivers and full
payments failing to clear + a code audit showing no zeroing
site exists for this direction — structural, not
window-limited.

Index clobber struck all three worker safe-commits (known
class); commits verified correct, index repaired via HEAD-blob
cacheinfo each time. EPERM write flap hit the contrast re-run
(recovered without redirects; ~15 min lost, no data lost).

## Arm sim-arrears-route-a (commits 470d81654 prereg + 76a5033e8
## evidence, policy files DELETED on kill, zero src/js at tip):
## UNDER-POWERED — arm killed, waiting rule untested, not refuted

Prereg committed BEFORE any judged sim. Policy: when readiness
fails SOLELY on arrears links (trust/opinion pass everywhere),
defer sounding, re-check weekly up to 28 days; sound if ready
within 28 days, otherwise stand down without sounding.

Pilot 1 — fresh band 97101–97108 (verified unspent; 954xx band
not reused), DAYS=180, frozen sumtrigger stack: 5/8 seeds never
attempted the herald at all (including a 181d survivor and a
138d winner); 3/8 refused with READY first checks (97105 total
15 day 86, 97106 total 16 day 70, 97107 total 16 day 80) — all
links arrears 0; 162 check rows, max arrears 0. Wall identical
both arms: national 6/8, table 7/8, won 6/8, wave-4 8/8, wave-5
0/8, median 95.5d, max 181d.

Pilot 2 — documented second pilot, fresh band 97201–97208:
7/8 never attempted the herald; 97202 alone refused, first
check day 81, total 16, READY, arrears 0 on all links. Wall
identical both arms: national 7/8, table 8/8, won 7/8, wave-4
6/8, wave-5 0/8, median 100d, max 138d.

Bars: (a) POWER 0/8 both pilots vs bar >=3/8 — FAIL /
under-powered. (b) CONVERSION vacuous (0 blocked sounded).
(c) NO-HARM passes vacuously on medians (delta 0d both
pilots; death causes identical: pilot 1, 250 deaths; pilot 2,
254 deaths; no new shape) — but with no deferral ever firing,
no-harm proves the armed arm is a correct no-op, not that
waiting is safe. (d) GUARDRAILS / (e) SENSE vacuous by the same
token: no sound exists to guardrail, no deferral line exists to
judge — the analyzer's mechanical PASS on zero events is a
validator flaw, recorded in metric review, and must NOT be
cited as a pass. No confirm was run, per the prereg.

Drift: first-check rows match baseline-vs-armed EXACTLY on all
16 seeds (total + per-link trust/opinion/arrears/contribution);
gameDays, walls, end reasons, death counts identical.

No deferral/sound/stand-down line ever fired, so no transcript
line is quoted — and none is fabricated. The designed,
never-fired deferral line reads: "⏳ The call waits. <Fire>
cannot answer while <N> kcal of debts unpaid between you —
Haven waits, and counts again in a week, rather than sounding
into a refusal." Whether it reads humanly is unjudged.
Instrument flaw noted: the capture regex /waits/ also catches
routine villager lines ("Water first. Everything else waits.")
— anchor to the ⏳ marker next time.

Killed arm leaves no trace: policy/replay/split/test files
deleted before the evidence commit; the merged branch tip is
evidence + corpus only. No push, no version bump, no
[needs-eyes] (policy measurement only, arm dead). /tmp EPERM
flap blocked safe-commit twice (retries passed, no
--force-delete); index clobber struck both safe-commits
(repaired; a retry loop first made 6 duplicate commits,
squashed on the private branch only after reflog verification
— tree hash verified identical). check.js not run by the worker
(zero src/js changes, new files not on green list, concurrent
jest forbidden while sibling loops run).

## Findings for the next round

1. The 0445Z arrears finding is BAND-DEPENDENT. It came from a
   screen-selected long-survivor band; two unselected fresh
   bands give 0/16 arrears-blocked. Arrears-blocking may be a
   property of long-survivor bands, not of the game in general.
2. On fresh bands the binding constraint is CONTACT, not
   arrears: 12/16 villages never attempted the herald; the 4
   that did were all ready and keep refusing on MUSTER-GATE
   (no muster exists because nothing ever sounds), not on debt.
3. The waiting rule stands UNTESTED in sim. The next move is
   either (a) screen for seeds whose refused attempts carry
   arrears > 0 (fresh range, arrears filter, pre-registered)
   and re-run the waiting pilot on that selected set, or
   (b) investigate why this stack yields arrears 0 everywhere.
   Running more unselected bands is the wrong spend.
4. The structural gap is now named, not just measured: there
   is NO back-payment verb for Haven-primary arrears. Clearing
   one requires a game-code design decision (what pays old
   debt, what it costs, what it says aloud) — a candidate
   steve-call, not a policy tweak.

## Telemetry

telemetry-check.js REFUSED the arrears-route corpus by design
(recorder rows carry top-level anchorCommit; sweep-compare
tables, never run baselines) — same refusal class as
0445Z/0250Z. No override, no baseline reseed, baseline NOT
rolled. No LOUD deviation line.

## Metric review

- Route-arm validator's mechanical PASS on zero events for
  guardrails/sense must be fixed before reuse: zero-event bars
  report VACUOUS, never PASS. Applies to the NEXT run's
  validator, not re-scored here.
- The arrears-a "30 days" window ran to run end on 3 of 4
  seeds (see qualification above); the structural argument
  (code audit + 107 link-days) carries the verdict, and the
  window wording should be "30 days or run end, whichever
  first" in future diagnosis preregs.
- Pilot power bars worked as designed: 0/8 twice killed a
  lever before confirm spend. The cost was two pilots, not a
  confirm — the staged method doing its job.

## Convergence state

scale-onramp stays converging (NOT converged): the
when-to-sound rule is deployed in game code, and the arrears
block is now decomposed to a structural gap — Haven-primary
old debt can never be paid — but no clearing verb exists, no
full-seat win is shown, and wave 5 reached stays 0 on every
fresh band (1/12 on the screened confirm band, 0/16 here).
Wall (bands kept separate, never pooled): arrears-a confirm
band national 9/12 / table 6/12 / won 5/12 (0445Z screen, not
re-measured here); route pilot 1 national 6/8 / table 7/8 /
won 6/8 / wave-5 0/8; pilot 2 national 7/8 / table 8/8 / won 7/8
/ wave-5 0/8. Next blanks, in order: (1) screened arrears band
for the waiting pilot (arrears filter, pre-registered) OR a
back-payment verb design decision (steve-call candidate);
(2) herald-contact gap on fresh bands (12/16 never attempt —
why nothing ever sounds); (3) sum-trigger CONFIRM re-run on a
fresh band only after an arrears lever lands; (4) Layer-2
titan meaning (steve-call); (5) replay history-stream 40-entry
cap instrument fix; (6) full-seat bars w4>=3 + w5>=2
reachability on any stack (still 0).

## Infrastructure (coordinator, disclosed)

- MERGE-CHAINING ERROR, recovered: both worker branches were
  rebased onto master tip 09d042cb9, then the first merge moved
  master, so the second --ff-only merge correctly refused
  ("Not possible to fast-forward"). The route worktree had
  already been removed and its branch-delete correctly refused
  (unmerged), so no work was lost: the branch was re-registered
  under the same slug, rebased onto the new tip (which had
  moved again via a sibling measurement landing), merged
  --ff-only clean, and released. Lesson for the next run:
  rebase the second branch AFTER the first merge, not before.
  The release script had marked route-a "done-merged" before
  the failed merge; the re-registration + successful merge
  corrected the record — the registry now reads done-merged
  truthfully.
- check.js --quick NOT re-run by the coordinator (both arms
  zero src/js at tip; arrears validator re-run GO on master;
  sibling loops running, concurrent jest forbidden).
- Sibling Loop B trees and claims untouched throughout.

Coordinator evidence: evidence/2026-11-02/sim-scale-onramp-round-0605.md
Merged locally, pending ship (arrears-a: diagnosis + instruments;
arrears-route: measurement record only, arm killed).
