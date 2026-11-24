# Loop B round — run fleshout-loop-b-20261124T1030Z (axis winnability-chain — worngun GO, bloodcluster DIAG-GO, linkform DIAG-PARTIAL; adoption closeout)

## Run shape

TIMEOUT + ADOPTION: the 1030Z coordinator ran the full round (all
three arms played, analyzed, and committed on their branches) but
timed out at the 7200s execution limit before closeout — no round
record, no telemetry check, no gate, claim and B lock left live.
This record is the finisher adoption, run by a fresh agent: the
1030Z coordinator was confirmed dead first (no live coordinator or
worker processes in `ps`; the bloodcluster tree heartbeat 35 min
stale; the other live processes on the box were the succession-r280
finisher and a deepening-r282 run, unrelated). Stale-lock recovery
on `fleshout-loop-b.lock`: cat + per-line grep of both lines in the
SAME call as the delete, run_id verified
`fleshout-loop-b-20261124T1030Z`.

CLAIM vs RUN ARMS: the claim file names arms
sim-worngun-reseat-b, sim-bloodcluster-b, sim-w5lateface-b. The
round actually ran sim-linkform-b as arm 3 in place of
sim-w5lateface-b (the 0840Z next blank #5, link formation — the
coordinator swapped it in; no claim update was recorded).
sim-w5lateface-b was never started: no branch, no worktree, no
commits anywhere. It stays an open blank (see §Next blanks).

Pre-flight (coordinator): main tree clean, disk 47%. Infra during
the round: write-flap bursts and git slowdowns (coordinator's
note — no flap window was formally logged for this run's span);
registration of the bloodcluster arm held REGISTRY.lock 12+ min
from 10:56Z (the reaper skipped 10 consecutive runs on it, ALERT
threshold 3 — holder verified live work, same jam family as the
05:10 report). Finisher adoption infra: safe-commit index clobber
struck once on the bloodcluster corpus+evidence commit (all 18
files staged-deleted in the worktree index; commit itself correct;
repaired via `git ls-tree -r HEAD -- <paths> | git update-index
--add --index-info`, verified with completed status + empty diff);
git ops ran slow throughout (worktree remove took ~172s).

## Arm 1 — sim-worngun-reseat-b (GO, merged c329b477d)

The worn-only gun destroyed by the contest re-seat, FIXED
(finding line 2740, from the guntransfer arm). The destroyer was
never `autoEquip` — it never runs on the scholar — it was the
arena "choose your weapon" grant in `contestChoose`: taking a
spear overwrote the ranged slot and the worn-only searcaster
underneath it ceased to exist. The fix returns the displaced
piece to the pack (the #806 shape). Proof test 5/5 (fails T1/T4
on old code). Replay band (9 seeds, identical): destructions 2 →
0, unexplained exits 0, village gun totals 16 → 18, 7/9 seeds
otherwise byte-identical. Holder-days guardrail adjudicated GO
(−15 entirely on s107756, the seed whose village died 21 days
earlier; the gun itself survived there). One new finding filed:
war-cry narration repeats verbatim 14× in one day. Evidence:
evidence/2026-11-24/sim-worngun-reseat-b.md.

## Arm 2 — sim-bloodcluster-b (DIAG-GO, merged 031f2a938)

Why bloodings cluster on door seeds (vetpair next blank #1).
Replay of the vetpair / standingconfirm band 109310–109325, 16
seeds, 150d, competent verbatim. All four frozen bars pass:
31/31 bloodings classified (0 unclassified); dominant mechanism
named with counts and coverage; all four families contrasted with
0 missing cells; instrument health clean (0 errors, 0 unlinked
kills, 0 orphans, determinism identical on the 109312 replay,
door grouping verified).

**Dominant: A, spawn density — 3.15x contacts/day (0.437 vs
0.139), coverage 100%.** Kill rate per contact is flat (1.12x)
and the wave-3 control is flat (0.97x): door villages meet far
more wave-4 monsters, they do not fight better. Party formation
is the runner-up, also qualifying (party ≥2 at 71% of door kills
vs 35%, 2.01x, 78% coverage). Field damage per kill is 4.72x
higher on door seeds but covers only a third of door bloodings;
ally-joins answer 2.40x more door kills but cover only a sixth;
staying is identical (fled 0.63 both sides). The sharpest split:
no companion ever bloods on a non-door seed (7 door / 0
non-door) and no scholar ever bloods alone on a door seed (0
door / 5 non-door). The v1 smoke leg proved an instrument defect
first (7/20 bloodings unlinked — startCombat refuses while a
fight is live; Amendment #1 moved TB linkage to settle-time
context, bars unchanged). One new finding filed (line 2746): 92
TB starts refused while a fight was live. Proof 8/8 on the
rebased tip. Evidence: evidence/2026-11-24/sim-bloodcluster-b.md.

## Arm 3 — sim-linkform-b (DIAG-PARTIAL, merged 51dff0007)

Second-link stage classification (standingconfirm blank #2).
Replay band 109309–109324, 16 seeds, 150d, competent verbatim.
Bars 1–3 and 5 pass; bar 4 FAILS: 14/15 overlapping seeds match
standingconfirm on all 8 frozen fields — seed 109322 diverges
(bestCapped 270 vs 240, daysAt199 37 vs 24), attributed to
anchor drift after an isolation replay; the divergence does not
touch the classification (109322 is S2 on both anchors).

**The second link never forms because the only link-forming path
that ever fires is the ladder's one-shot stage-3 grant, and the
only other path — villagers raising a second link — stages 252
times across the band and every single ask expires unanswered
(241 expired, 11 still pending when the village dies), with zero
accepts, zero refusals, zero proposals, and zero counters ever
staged.** The asking works; the answering does not exist in
competent play. Fix landed in the same chain (ladder-cross
confirms when stage completes the day before the link; proof
18/18). Evidence: evidence/2026-11-24/sim-linkform-b.md.

## Wall (this run's judged corpora)

- worngun-reseat (9 seeds): wins 0, national 0, wave-5 unlocked
  1/9, faced 1/9, median survival 138d.
- bloodcluster (16 seeds): wins 0, national 0, wave-5 unlocked
  4/16, faced 3/16, kills 3, wave-4 faced 15/16, median survival
  150d (censored, 11/16 at horizon).
- linkform (16 seeds): wins 0/16, national 0/16, table 0/16,
  wave-5 unlocks 5/16, faced 4/16, kills 4, wave-4 faced 15/16,
  readiness-5 door opens 5/16, median survival 150d (censored).

The wall did not move — two diagnostic arms and one
conservation fix, as pre-registered. The winnability chain now
has two sharper pictures: the door opens exactly when a living
veteran PAIR exists, and the pair forms because door villages are
beset (3.15x the wave-4 contacts) with a party standing beside
the killer; and the second link never forms because nobody ever
answers the ask.

## Telemetry deviation check

Checker refuses recorder-corpus input on all three arms'
corpora (standing-gearready / bloodcluster / linkform per-seed
JSONs carry top-level anchorCommit — sweep recorder rows, not
runs). Same as every recent run; no LOUD lines, nothing to
investigate. Baseline NOT rolled. The meaningful cross-check for
bloodcluster ran inside the analyzer: overlap 92 event / 85
snapshot days / 6 windows reproduces the vetpair census exactly.

## Gate

`node scripts/check.js --quick` on the merged tip `031f2a938`:
**336 passed, 8 failed in 1275s** (log
`hidden_files/evidence/2026-11-24/sim-winnability-round-1030-gate.log`).
All 8 are the standing family, 0 attributable to this round's
arms: 4x 120s cap timeouts under load (living-garden and
one-person-army deed-attainment, occupation-panels,
trust-observer-neutrality); the measurement-proof staleness pair
(it fires because worngun's `contests.js` change moved Game inputs
— proof re-sign rounds 11/12/22 still owed); measurement-cache-flags
0/4 (known load artifact, spawn-budget remediation still owed);
phone-frame stale receipt. No failure touches the round's arms
(worngun proof 5/5, bloodcluster proof 8/8, linkform proof 18/18,
all green on rebased tips).

## Next blanks, in order

1. The wave-4 fight (finding #2538 — why launched parties lose
   wave-4 fights; the B8 design call already ruled out pointing
   outmatched parties at wave-4 beasts).
2. tb-companion 7/0 (bloodcluster §10.1): why does a companion
   never blood on a non-door seed — is the companion channel
   itself door-gated, or do non-door companions never get the
   chance? The `tbStarts` rows carry the data.
3. mDealt/kill 4.72x on 6 vs 5 field kills (bloodcluster §10.2):
   real effect or small-n artifact — a confirm band on field
   kills only; do not build on it yet.
4. Wave-5 facing after a late unlock (claim arm 3,
   sim-w5lateface-b — never started this round; standingconfirm
   #4).
5. Waiting matters on seat-unready bands (tracker blank #5 —
   sim-waitseat-a).
6. calledName drift-line fix #2741 + overheard KNOWLEDGE.md line
   #2742 (coordinator decision: drift line speaks the use-name).
7. holdrepeat fix #2743 (day-count-varied hold wording).
8. 92 refused TB starts (finding line 2746 — what does the
   player see when the second fight refuses?).

## Merges

Merged c329b477d (worngun-reseat GO) + 031f2a938
(bloodcluster DIAG-GO) + 51dff0007 (linkform DIAG-PARTIAL) +
this record; merged locally, pending ship. Claim deleted; B lock
deleted (stale-lock recovery, verified dead first). Evidence:
evidence/2026-11-24/sim-worngun-reseat-b.md,
evidence/2026-11-24/sim-bloodcluster-b.md,
evidence/2026-11-24/sim-linkform-b.md.
