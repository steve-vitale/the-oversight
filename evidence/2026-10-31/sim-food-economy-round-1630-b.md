# Loop B round 1630Z — coordinator evidence (RECOVERED CLOSEOUT)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T1630Z,
axis food-economy. This file was written by the FOLLOW-UP run
fleshout-loop-b-20261031T1830Z as a recovered closeout: the 1630Z
coordinator died after all three arms landed on master but before
writing coordinator evidence or a tracker entry. All three arm
branches were already merged (tips on master, branches deleted);
nothing below re-judges any arm — it records the round headline
from the landed arm evidence files, verbatim in verdict.

Stale-lock recovery (1830Z run, before this file): the 1630Z lock
was 102 minutes old (past the 90-minute fallback), with no registry
entry, no worktree, no branch, and no worker processes. Claim
retired to
`hidden_files/lever-claims/fleshout-loop-b-20261031T1630Z.json.DEAD`
with a recovery note. Loop A was not live at takeover (1702Z claim
already retired, no Loop A lock); Loop A's lane was not touched.

## Arms landed (all on master before recovery)

Arm 1 — sim-strandbank-b (prereg 1161983db, census e77f63ab4,
evidence c0f96fb86): DIAG, strand re-derivation census on pinned
base f536e3ad3. Verdict: SUBSTRATE-MISSING STANDS. Across the full
swept width — 18 seeds, 36 legs (stage 1: 10-seed bank x guard+ON;
stage 2: 8 fresh seeds x guard+ON, triggered by the prereg's own
rule because stage 1 yielded 0 strands) — ZERO still-creek
evenings and ZERO genuine creek evenings on either leg. The old
strand set (15215 guard [7,8,9] / ON [7..16]) stays VOID. The
fedevening branch-fire design and the axefirst joint proof stay
PARKED. Secondary: the looser "slept away, any cause, wood < 4"
metric is ALSO 0 on all 36 legs, so it would not have produced a
set either. Proof: scripts/test-strandbank2-b.js 111/111.
Evidence: evidence/2026-10-31/sim-strandbank-b.md (+ prereg,
censuses, corpora in the same directory).

Arm 2 — sim-departdiag-b (prereg b587ea4bb, instruments 802f75e53,
evidence 49868352e): DIAG-GO. The departure gate is the return leg,
not the road out. 0 overnight departures on all 16 judged legs (8
seeds x guard + ON, 480 loop-days, 480 stays, 0 away-origin days,
0 creek evenings) — but the vessel leaves Haven on 210 of 240 days
per leg and comes home for supper every night. Gate traced to two
named paths: needTrip (competent.js:949-964) holds the vessel home
on 30 mornings, and forageTripSeedFirst's trailing walkHome
(competent.js:1487) returns it on the other 210 mornings. Trip
driver is contribution, not hunger (give-rule present on 207/210
trip days, pantry-only on 3, vessel-hunger on 0). Fedevening
doubt #3 ANSWERED: a competent policy that never departs
overnight is a vessel that leaves daily and returns nightly, not
a vessel that never leaves. One bounded residue: which routine leg
moves the vessel on 2 needTrip-false travel days (15221 days
27-28 multi-hop leg, stoneRun prime suspect, not claimed) — does
not touch the gate (both days ended at haven). Proof:
scripts/test-departdiag-b.js 162/162.
Evidence: evidence/2026-10-31/sim-departdiag-b.md (+ prereg,
census, corpora in the same directory).

Arm 3 — sim-corpsehome-b (prereg 5fe2c68f4, instruments f773bc15d,
evidence 0c123fdc8): DIAG-GO. Fresh-bearer re-proof of the
corpse-home mechanism on current master. On seed 15001, Lucia Shin
dies away from Haven and her body comes home on exactly the
recoverBearer <redacted>: pending day 8, succession morning
loop-day 9 (Tomas Reynolds holds the mantle, corpse first reads
at node (3,0), mx 0, my 8, recovered false, looted false), evening
loop-day 9 same readings with the same 8 item stacks, morning
loop-day 10 node (4,4) Haven, recovered true, looted false, items
identical, pending entry cleared — the move segment is the single
overnight gap evening 9 -> morning 10. Say line verbatim in the
morning-10 gap: "That night, they bring Lucia home." Search band
15000-15059 plus corpsemove stragglers (65 seeds, 46 deaths, 13
away); search and full-capture bracket legs agree byte-for-byte
on the bracketing snapshots. The sim-findings corpse item is
flippable from open to fixed on this evidence (coordinator owns
that edit; done in the 1830Z closeout). Proof:
scripts/test-corpsehome-b.js 22/22.
Evidence: evidence/2026-10-31/sim-corpsehome-b.md (+ prereg,
table, corpora in the same directory).

## Round headline

All three arms are DIAG-only (zero src/js, zero policy-default
flips, zero game change). The round's combined picture:

- The strand line is now doubly blocked on current master: the
  strand set is empty on a wider sweep than any prior arm (36
  legs, 0 strands), AND the departure gate that would have to
  fail for a strand to form never fails on this band (return
  210/210 narrated, needTrip + walkHome both traced).
- The corpse-home mechanism, by contrast, is re-proved on a fresh
  bracket on current master — the 1430Z corpsemove mechanism
  naming now has a fresh-bearer proof behind it.
- No lever was judged in this round. Nothing here licenses a
  strand lever, a departure lever, or a corpse-mechanism change.

## Named next work (carried to the 1830Z run, not decided here)

1. Strand-loss bisection: which landing(s) between the
   strand-era base and f536e3ad3 voided the 15215 strand
   trajectory (strandbank metric review names lootabilities w2
   field-fight ability coverage and w3 villager self-craft as
   candidates; a census arm does not bisect).
2. Return-failure substrate question (departdiag metric review):
   if walkHome + nighttravel-hop succeed on every band, no strand
   arm can ever re-derive an overnight absence on current master
   — strand work needs a return-failure substrate (blocked-path
   trips, late returns) first, or a wider absence search proving
   overnight absence exists somewhere on current master.
3. Standing pre-step (strandbank): the next strand arm must
   re-derive AGAIN on ITS base before judging — the 1430Z
   directive is now a standing pre-step, not a one-time repair.
4. Departdiag prereg refinement for the next departure census:
   count THREE things separately — overnight departures (this
   census: 0), day trips out-and-back (210/leg), multi-hop
   non-forage excursions (2/leg).

## Wall numbers

NOT OBSERVABLE on these 30/60-day pre-seat DIAG bands — reported,
never fabricated. Strandbank band: all legs alive at day 30,
national 0, table 0, wins 0 (structurally unreachable in this
band, not a wall measurement), median survival 30d (ceiling).
Departdiag band: same structural profile (wins 0 in this band).
Corpsehome band: not a national/table/wins reachability band; no
wall numbers are claimed from it. Overall wall UNCHANGED: full
seat 0, wave 5 reached 0 stands (Loop A 1702Z wall: national
14/19, table 16/19 all lesser, wins 15/19 all lesser, wave 4
12/19, wave 5 0/19, full 0/19, median 90d).

## Telemetry deviation check

§15 panel non-applicable to all three arms (declared in each
arm's evidence: DIAG censuses, zero game-root changes, no
before/after game delta for scripts/balance-panel.js to compare).
No compare .md exists for this round and none is fabricated. No
telemetry baseline roll: no LOUD-line investigation item arises
from a census-only round.

## Infrastructure

- Recovery verified by ancestry: all three arm commits are
  ancestors of master at recovery time; branches already deleted
  by the 1630Z run itself before it died (no branch cleanup was
  needed or performed by the recovery).
- No EPERM flap observed during the recovery window (lock/claim
  file operations + this file's write landed first-try).
- Main tree clean before this commit; coordinator commit only
  (this file); no worker worktrees touched.

food-economy stays converging (NOT converged): the strand
substrate is empty, the departure gate is explained, the corpse
mechanism is re-proved — but no food-economy default flipped, no
balance change landed, and no strand lever has been judged on a
live substrate. scale-onramp stays converging (untouched;
sibling Loop A lane). Merged locally, pending ship.
