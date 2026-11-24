# sim-winnability-round-1815 — adoption closeout of the timed-out 1815Z round

Run fleshout-loop-b-20261124T1930Z, Loop B, axis winnability-chain.
Adoption of run fleshout-loop-b-20261124T1815Z, which ran all three arms to
completion but timed out at the 7200s limit before closeout (no round
record; claim and B lock left live). This adoption run finished + landed
it, then spawned two fresh arms into an active write flap.

## 1. What the 1815Z run left

- sim-basedmg-b: complete + committed (2 commits: prereg 60affed2c,
  DIAG-GO 6297eb21c), UNMERGED.
- sim-titanmuster-b: merged by the 1815Z coordinator 19:22Z (21b86a9db).
- sim-launchready-b: merged by the 1815Z coordinator 19:35Z (812f7dbdd).
- No round record; claim + B lock left live.

## 2. Stale-lock recovery (this run)

- B lock 1815Z (created 18:15:00Z): its tree (sim-basedmg-b) heartbeat
  31 min stale at run start (19:40:34Z vs 20:11Z), no live coordinator
  or worker processes (ps clean; subagent listing: basedmg worker done,
  no running B-run agents), no node sim processes. The run was DEAD by
  the guard. Deleted the lock (cat + delete in the same call). The lock
  was also past the 90-min fallback (~117 min old). The 1815Z claim was
  retired to .DEAD.
- Loop A live on scale-onramp the whole run (1815Z, then the 2015Z
  round: ammosupply adoption + aidammo + spearopen) — NOT touched.
  Note for A: its 1815Z ammosupply pilot was NO-GO thin-pool, with
  evidence + final commit unfinished at its timeout; its 2015Z adoption
  worker landed it evidence-only (commit flap-blocked).
- The body's re-point queue is STALE and was NOT re-taken: the tracker
  records it fully disposed before this run (arm-2 toggle CLOSED
  2026-11-06; flee-repair is a Steve-call, held branch
  sim-fleerepair-a; standing accumulation answered). The arms below
  come from the 1630Z adoption's next blanks + the 1815Z arms'
  own named follow-ups instead.

## 3. Arms landed / verified

### sim-basedmg-b — DIAG-GO (merged 6297eb21c, ff-only, parent = master tip at merge)

The base-damage question (finding #2544). Fresh band 109501–109508,
27 engaged launched meetings, pooled parsed-vs-mDealt residual 0.000.
Median meeting 25.7/round vs Cooper ~111; binding component base
(best observed wb 60 → 83.6/round, shortfall 27.4; robust p90 wb 43 →
62.1/round); no single component closes the gap; honest Cooper shape
96.5–106.4. The gap is a combination problem — and the cheapest half
of it is not damage at all, it is getting all three fighters into the
fight from the first round instead of the third (allies never start in
the fight; see below).
Wall: national 0/8, wins 0/8, wave 4 8/8, wave 5 4/8, median survival
142.5d, villages lost 5/8, kill share 0/27.
Findings filed by the arm: #2600 allies never start in the fight
(allyFromStart false 54/54), #2601 lead is the worst-armed fighter
(median wb 8 vs allies 17), #2602 winnable fights end on the flee
call (20/27 vFlee).
Proof 27/27 green on the branch; on merged master 26/27 twice during
the flap (§4 blocked by /tmp EPERM — see §6), then 27/27 green at
21:41Z after the flap cleared on the restart.
Tree released done-merged, branch deleted.

### sim-titanmuster-b — DIAG-GO (already on master 21b86a9db)

The muster count is structurally 0 — the titan call is never sounded
(0 soundings on the 16-seed tbrefuse band; have 0 on 76/76 refusals),
so no muster record ever exists for the gate to count. Villages had
5–10 living people on refusal days, so the zero is not "no people".
Next arm is a call-sounding instrument (a policy that sounds the call,
or a staged probe that builds a muster and reads the count) — NOT
another corpus re-read. Branch deleted by this run (0 commits ahead,
verified ancestor of master).

### sim-launchready-b — DIAG-NO-GO on B1 (already on master 812f7dbdd)

The existing corpus cannot answer launch fitness — dawn-census join
rate 0.047/0.081 vs the 0.80 floor (the census covers dawn-bid holders
only; most departures are not dawn bids). Next arm is the fresh-band
departure-stamping driver (HP + weapon + loaded state + ammo per
member at the departure instant, as ragecarry §10 prescribes). Lead:
launched parties are half-armed at departure (median 0.5 armed share
on 255 arm + 286 ctl launches). Branch deleted by this run (0 commits
ahead, verified ancestor of master).

## 4. Telemetry deviation check

basedmg corpus REFUSED by scripts/telemetry-check.js (recorder input:
all 8 --current rows carry top-level anchorCommit, so they are sweep
recorder rows, not runs; recorder corpora are compared with
sweep-compare tables, never against a run baseline). No LOUD lines.
Same as tbrefuse in the 1630Z adoption. Baseline NOT rolled.

## 5. Fresh arms spawned this run

### sim-allystart-b — BUILD (finding #2600) — IN FLIGHT at closeout

Allies-from-start lever: does the trio fighting from round 1 move
kill share? Worker (spawned 20:39Z) was still running at closeout,
doing read-only prep + registration retries through the flap; its
/tmp drafts were wiped by the 21:32Z restart and it was told to
register + re-create from context while the window is open. Claim
stays live for the next run to adopt/land — do NOT re-take the arm
fresh.

### sim-fleecall-b — DIAG-GO (finding #2602) — DONE, UNLANDED at closeout

Verdict DIAG-GO on all four frozen bars: B1 20/20 fled meetings
classified, 0 unclassified; B2 pool 20 (floor 10); B3
within-one-round share 1/20 = 5.0% (stated with its denominator);
B4 instrument health (0 parse errors; analyzer selftest 19/19;
determinism byte-identical on re-run; proof test run owed
in-worktree — §1/§2 logic verified directly: live staged flee parses
41 = engine's own fleeHpFrac×100 exactly).

Answer: only 1/20 fled fights ended with the monster within one
round of a kill. The typical fled fight ended with the monster at
963.5 HP (median; range 95–1253) and 19 rounds from a kill (median;
range 1–189) — the party was not one blow short, it was most of a
fight short. The flee call does not track the monster's remaining HP
at all: it fires on the lead's survival, either the bravery floor
(9/20 — the lead "past holding", median lead HP 19 at flee, range
5–57) or the "hopeless" race (11/20 — "sees how this ends"). The
hopeless race is judged on an imagined fight: the engine compares
rounds-to-kill against rounds-until-the-lead-drops as if the lead wore
protection-4 armor (fieldFights.js FIGHTBLEND-B, vTakenP4), while the
leads on this band wear protection 27–37. On live numbers the
sharpest case was winning by a wide margin (monster 0.8 rounds from
death, lead 5.7 rounds from dropping) and still fled, because on the
imagined protection-4 numbers the lead was already ~195 HP
underwater. The flee call is a mechanical tripwire with a real human
face: the lines read like a sensible hurt leader pulling out, but the
decision underneath never looks at the monster's remaining HP or the
party's real armor.
Sense-test: 2 of 4 transcripts read as tripwires (the two high-damage
fights), 2 as sensible (the 5-HP floor flee; the genuinely losing
race). Second sample (fightcap-recheck): 0/5 within one round
(closest 6 rounds); lead HP unrecoverable there (truncated logs).
The DOORFLEE2 comment names this exact failure mode for door fights
and sketches a live-numbers hold — env-gated, door-only, default off.
Next arm: BUILD a live-numbers guard on the hopeless read for wild
fights, then re-measure the within-one-round share + hopeless-flee
count on this band (baseline split 11 hopeless / 9 floor).
Blanks: vTaken is lead-only damage taken (verified on all 20);
lead max HP is 100 on all 20; P4 totals are not in the corpus (a
future driver should copy vHpHypoLeft + vTakenP4 into the row);
no learn-first withdrawals among launched meetings.

Drafts (prereg, analyzer, proof test, evidence) were in
/tmp/fleecall-draft/ — WIPED by the 21:32Z machine restart. The
prereg + evidence texts are preserved from the worker's checkpoint
handoff + the coordinator's read in
hidden_files/fleecall-b-stranded-20261124/ (reconstruction note
inside). The analyzer (27,646 B) + proof test (13,385 B) were NOT
preserved (never read) and must be re-derived from the prereg on
landing. Next run: register sim-fleecall-b, copy the preserved prereg
+ evidence, re-derive analyzer + proof, run proof, commit prereg →
instrument → evidence, report ready to merge.
Wall (restated from sim-basedmg-b): national 0/8, wins 0/8, wave 4
8/8, wave 5 4/8, median 142.5d; kill share 0/27.

## 6. Infrastructure

- Write flap: active ~18:53Z, cleared ~4 min at 20:22:53Z (the
  basedmg merge + this run's lock/claim creation landed in that
  window), back 20:26Z–21:32Z, cleared on the 21:32Z machine
  replacement (git + /tmp probes pass from 21:33Z). Appends to
  existing files worked throughout the flap (tracker entry + memory
  note landed during it; verified by read-back); fresh-file writes
  and git ref writes refused. The flap flickers — workers' file-tool
  writes into /tmp got through at 21:03–21:11 while git probes kept
  failing.
- VM restarted ~19:29Z and again ~21:32Z (uptime 1 min at 21:33Z).
  The 21:32Z restart wiped /tmp (fleecall + allystart drafts lost).
- basedmg proof on merged master: 26/27 twice during the flap (§4
  analyzer selftest blocked by /tmp EPERM on a file-open — not an
  assertion; the worker's branch run was 27/27 green on identical
  content). Re-ran at 21:41Z after the flap cleared: **27/27 green**.
  Owed item closed.
- Registry lock: Loop A 2015Z also registering/landing through the
  flap; no jam observed by this run. No full-repo check.js gate
  (zero src/js in the adopted arms).

## 7. Owed to the next run (in order)

1. Land sim-fleecall-b from hidden_files/fleecall-b-stranded-20261124/
   (re-derive analyzer + proof test from the preserved prereg; run
   proof; commit prereg → instrument → evidence; merge).
   Finding #2602 → fixed on landing.
2. Adopt/land sim-allystart-b (worker in flight at this closeout;
   check its state + any re-created drafts; its claim is live in
   fleshout-loop-b-20261124T1930Z.json — DO NOT re-take the arm
   fresh, adopt it). Finding #2600 → fixed on landing.
3. (DONE 21:41Z) basedmg proof re-run on master: 27/27 green.
4. Mark findings #2600/#2602 in sim-findings.md (claimed at this
   closeout; #2602 → fixed on fleecall landing).
5. Write the sim-winnability-round-1930 record once the fresh arms
   land (this file is the 1815Z adoption record).

## 8. Wall numbers (this round)

- basedmg: national 0/8, wins 0/8, wave 4 8/8, wave 5 4/8, median
  142.5d. tbrefuse: wins 0/16, national 0/16, wave-5 unlocked 6/16,
  faced 5/16, 7 wave-5 kills, median 150d. ragecarry confirm:
  national 0/12, wins 0/12.
- winnability-chain stays converging (NOT converged): the
  base-damage question is answered (combination problem, no single
  component closes it) and the muster question is answered
  (structurally 0, call never sounded), but villages still reach wave
  5, survive, and never reach national or win. Next blanks, in order:
  (1) the allystart lever — does the trio fighting from round 1 move
  kill share; (2) the fleecall landing + the live-numbers hopeless
  guard BUILD; (3) the call-sounding muster instrument; (4) the
  launch-fitness fresh band. scale-onramp stays converging
  (untouched; sibling loop A).

Merged 6297eb21c (basedmg-b DIAG-GO) + verified 21b86a9db
(titanmuster-b) + 812f7dbdd (launchready-b); merged locally, pending
ship. Claim file (1930Z) LEFT LIVE at closeout (fresh arms stranded /
in flight — next run adopts, does not re-take). B lock deleted at
closeout. Evidence: this file + evidence/2026-11-24/sim-basedmg-b.md
+ sim-titanmuster-b.md + sim-launchready-b.md +
hidden_files/fleecall-b-stranded-20261124/ (preserved fleecall prereg
+ evidence). Tracker entry: convergence-tracker.md, run
fleshout-loop-b-20261124T1930Z.
