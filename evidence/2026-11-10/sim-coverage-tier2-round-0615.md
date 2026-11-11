# Coverage Tier 2 round — run fleshout-20261111T0615Z (ADOPTION + 2 arms LANDED, merged locally pending ship)

## Run summary

STALE-LOCK RECOVERY at start: deleted 114-min-old 0421Z lock (travelfirst
tree heartbeat 05:27:56Z, 48 min stale at 06:15Z; last write 05:33:04Z; no
sim procs; trapfirst arm already landed a5ee53c96). 0421Z claim retired to
.DEAD. Loop B live on 0330Z claim at run start (proofrefresh-b3,
talkturn-confirm-b, conjurefix-retune-b) — NOT touched; B later landed
talkturn-confirm-b itself (89fd2cee3) and has a new proofrefresh-b4 tree
in flight, so the hands-off call was correct. Master moved once under
this run (B talkturn landing 89fd2cee3); trade + feast branches rebased
onto explicit SHAs, proofs re-run green after every rebase. No EPERM
flap this run. Pre-flight: main tree clean, disk 38%, worktree-reap ran
(12/16 active, no removals; LOUD lines all other owners' uncommitted
trees).

## Arm 1 — sim-travelfirst-a: ADOPTED + LANDED (b7fe9c03d)

Coverage Tier 2 travel/roads, first numbers. Prereg 190a80481 +
instrument/driver/analyzer/proof 7e35cbbc3 were committed by the dead
0315Z/0421Z runs; corpus (16/16 per-seed files, band 180249–180256) was
uncommitted in the worktree and NO evidence file existed. Coordinator
verified proof 93/93 green in the worktree, verified the corpus 16/16
present, read the analyzer summary (GO allPass, neutrality 8/8), and
wrote the evidence from the summary + per-seed files, then committed via
the worktree copy of safe-commit.sh (ec44067a5), rebased onto explicit
master SHA fc0ffb37c, re-ran proof 93/93 on the rebased tip, merged
--ff-only (b7fe9c03d), released the tree as done-merged, deleted the
branch.

Verdict: GO on instrument validity + complete first-numbers capture.
Headline: the scholar never leaves the home board (0 beyond-edge
crossings, max Chebyshev 4, tryNodeExit 0 in 896 days); road legs 0;
engine walkHome 0; 3,007 travelTo calls, 100 blocked (creek 82); 49
away evenings, causes combat 27 / within-reach 15 / too-far 6 /
blocked-path 1 — backlog #1385 REFUTED on plain competent (screened
60% does not generalize) and marked [fixed]; villager travel is a water
commute (1,835/3,799 departures); a third of scholar deaths happen away
(33/96). Wall: national 0/8, table 0/8, wins 0/8, wave-5 1/8, median
survival 114d. Full numbers: evidence/2026-11-10/sim-travelfirst-a.md.
4 findings appended to the backlog (#1385 fixed + 3 new open).

## Arm 2 — sim-tradefirst-a: LANDED (2312553d6)

Coverage Tier 2 trade/market, first numbers. Band 180265–180272
(worker-shifted from assigned 180257–180264 on a strict freshness
reading: 180259 is named in the travelfirst prereg as a searched-range
endpoint). Proof 87/87. Rebased onto explicit master SHA 89fd2cee3,
proof re-run 87/87, merged --ff-only, tree released, branch deleted.

Verdict: GO on instrument validity + complete first-numbers capture.
Headline: traders come constantly (267 arrivals, 118 trader-days) and
**nobody ever trades** — 0 buys, 0 sells, 0 appraisals, 0 traderPay
calls, trade-sourced gear 0. The cart, tab credit, appraisals, and scams
are proven working by 12 unit tests and the proof fixtures, but in lived
play the shop's door is never opened because no policy ever calls a
trade verb (only livelihood.js `merchant` does; competent/capable call
zero). The river trader arrives day 21 on all 8 seeds and is never fed,
haggled with, or snubbed; riverNews 0/8. The trader persona reads like a
person and its world-news lines arrive as free narration, never as a
purchase. Wall: national 0/8, table 0/8, wins 0/8, wave-5 0/8, median
survival 145.5d; standing 199 on all 8 seeds. Full numbers:
evidence/2026-11-10/sim-tradefirst-a.md. 5 findings appended by the
worker. Prereg correction recorded in evidence: evRiverTrader DOES fire
in the harness (8/8, day 21) — the prereg's "drama stubbed → event dead"
was wrong; only the feed/trade/snub verbs are dead.

## Arm 3 — sim-feastfirst-a: LANDED (5a9f0ed0c)

Coverage Tier 2 feast/tribute, first numbers. Band 180265–180272 —
SHARED with trade (see incident below). Proof 53/53. Rebased onto
explicit master SHA 2312553d6, proof re-run 53/53, merged --ff-only,
tree released, branch deleted.

Verdict: GO on instrument validity + complete first-numbers capture.
Headline: 12 feasts on 3/8 villages (seeds 267: 1, 268: 4, 271: 7); 5
villages never feast — gated by the scholar's giving (271 gave 12,360
kcal by day 40, 265 gave 0) plus dusk timing. Devotion arms on all 8
seeds by days 16–27 (1,063 channels); when feasts fire they pay (9/12
buffs granted, 81 combat uses, 9 draws all faced). Bundle never
completes (max 4/6). Tribute zero by every verb. Pellet: 5 passes.
Wall: national 0/8, table 0/8, wins 0/8, wave-5 0/8, median survival
147d; standing 199 on all 8 seeds = wave-5 readiness-deferral hold, not
a feast shortage. Full numbers: evidence/2026-11-10/sim-feastfirst-a.md.
4 findings appended by the worker.

## Shared-band incident (trade + feast, 180265–180272)

The trade worker shifted off its assigned band (180257–180264) onto
180265–180272 for strict freshness; the feast worker was assigned
180265–180272 and had already run its judged sims before the
coordinator's shift notice arrived. Both arms therefore measured the
same 8 seeds. Disposition: KEPT, recorded in both arms' preregs and
evidence as a shared band — same seeds, different instruments, different
systems, independent measurement, NOT contamination of either arm's
numbers (both instruments record-only; neutrality 8/8 exact on both
arms). A later reader comparing the two arms' per-seed files should
expect identical days / end pantry kcal / deaths per seed and different
system counts. Lesson for the next run: assign bands AFTER the first
arm's freshness shift lands, or hold a two-band reservation in the claim
file. No re-run was spent; the shared band cost nothing but the record.

## Wall numbers (this run's judged corpora, 24 seeds)

National 0/24, table 0/24, wins 0/24; wave-5 unlocks 1/24 (travelfirst
seed 180256 only); median survival 114d / 145.5d / 147d per arm. The
scale wall stands above all three first-numbers arms — as expected for
measurement arms. Standing 199 on 21/24 seeds (the defer5-veterans gate
per standing199-a, reproduced a third time).

## Telemetry deviation check

REFUSED, not a failure: telemetry-check.js refuses the feastfirst corpus
(all 16 --current rows carry top-level anchorCommit, so they are sweep
recorder rows, not runs — "Recorder corpora are compared with
sweep-compare tables, never against a run baseline here"). Same handling
as the sibling first-numbers arms. Baseline NOT rolled, no LOUD lines,
no investigation item.

## Metric review (for the NEXT run, §14)

- The travelfirst roster-away share (90.8%) is recorded, not trusted:
  re-measure with return-time stamps before citing it.
- Trade's engagement floor (≥5 arrivals) passed by 53× — future trade
  arms should pre-register a per-verb floor (e.g. ≥1 trade verb call) or
  a different substrate (merchant/maker policy) instead of arrivals.
- Feast's "5 villages never feast" splits on scholar giving, not pantry:
  a feast-gating arm should measure the give decision, not the feast.
- Shared-band bookkeeping (above) — reserve both bands in the claim
  file when two arms run in one round.

## Infrastructure

- Worktree registration was slow this run (~6 min per tree under heavy
  sibling load: journey-landing check.js + repeated reaps; `git reset
  --hard` 30–84s CPU per tree). Not stuck, not a flap — just a loaded
  box. Heartbeat script contended on the registry lock; both trees were
  already registered active, so the feast worker was spawned without
  waiting on it.
- Safe-commit index clobber hit the travelfirst adoption commit (repaired
  via `git ls-tree -r HEAD | git update-index --add --index-info`,
  commit verified correct) and all worker commits (repaired by workers,
  verified clean). No clobber on either coordinator merge.
- check.js --quick NOT re-run: zero src/js in all three arms (purely
  additive scripts + evidence); standing profile 294 passed / 6 failed,
  all pre-existing, recorded by the 0230Z run hours earlier.
- Loop B's talkturn-confirm-b adoption landed mid-run (89fd2cee3); both
  fresh arms rebased onto it cleanly. B's proofrefresh-b4 tree is in
  flight at closeout — NOT touched.

scale-onramp stays converging (NOT converged): wins still 0 everywhere
in this run's corpora, national 0, table 0; the 199 gate is reproduced
once more and the veteran bar remains the wave-5 choke (fightplay-b).
food-economy stays converging (untouched; sibling B loop). Tier 2
trapping [x] (a5ee53c96), travel/roads [x] (b7fe9c03d), trade/market [x]
(2312553d6), feast/tribute [x] (5a9f0ed0c). Next blanks, in order: (1)
conversations first numbers (next unchecked Tier 2 item); (2) wave-5
facing measurement (wrap a wave-5 engagement entry point); (3) fishing
follow-ups — no-water staffing fix, scholar fishing verbs, fishing XP
question; (4) COUNTER_ANSWER default call (Steve/coordinator); (5)
measurement-proof refresh after r129 (owed; B's proofrefresh-b4 may
cover it — check before claiming). Claim deleted; lock deleted.
Evidence: evidence/2026-11-10/sim-coverage-tier2-round-0615.md (this
file).
