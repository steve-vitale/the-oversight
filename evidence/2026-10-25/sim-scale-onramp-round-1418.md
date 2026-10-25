# sim-scale-onramp-round-1418 — coordinator evidence (run fleshout-20261025T1418Z)

Axis: scale-onramp (converging, NOT converged). No live lock or claim at
run start; sibling loop B has no live claim at run start (its 1329Z claim
was deleted on landing) — B landed mid-run (coordinator 3cf0dc443) and
journey-scale r34 (1b7bbcb13) moved master twice under this run; neither
was touched, and both arms handled the moves (poolpres merged before the
moves; belltoad rebased clean onto 1b7bbcb13 in its own worktree, arm diff
verified identical to the worker commit).

Backlog items claimed by this run:
- 1332Z next blank (1), belltoad candidate 2 — worked as sim-belltoad-morale-a,
  KILLED on this band (measurement record merged, lever NOT landed).
- 1332Z next blank (2), pool-presence lever for raid draft — worked as
  sim-poolpres-a DIAG ONLY (confirms the lever's premise on current master,
  does not build the lever; the lever itself is the next run's arm).
- 1332Z next blanks (3) defender-fight wound manufacture and (4) narration
  beats are carried, not worked here.

## Arm 1 — sim-poolpres-a: DIAG-GO, LANDED c5f92fc5e (+ clobber-note 4f99a66b6)

DIAG ONLY, zero src/js, no default flips. Re-measures the raftdraft-a
pool finding on current master (belltoad chorus-break + post-flee ≤25%
both landed since raftdraft-a) and recomputes the implied presence under
the ACTUAL raid-size distribution. Pre-registration in the worker evidence
header, written before the sweep; judged exactly against it.

Seeds 73671–73678, 180d death-aware, tableseat-nowait + raftdraft-diag
recorder (reused unchanged); new instrument is the analyzer only
(scripts/test-poolpres-diag.js).

| Metric | Raftdraft-a (pre-fix master) | This run (current master) |
|---|---|---|
| Raids / raiders | 90 / 392 | 85 / 361 (mean raidN 4.27; raidN 3:13, 4:36, 5:36) |
| Pool wave-3+ share (pooled per-raid pools, n=1,494) | 7.2% | 7.16% (SE 0.67pp) — 0.04pp apart, inside error |
| Drafted wave-3+ share | 8.2% | 9.4% (34/361; nearest-first still mildly favors wave-3+) |
| Raids with ≥1 wave-3+ raider | — | 26/85 drafted; 38/85 had wave-3+ in pool; 47/85 had ZERO wave-3+ in pool |
| Implied presence for 1 wave-3+ raider/raid | ~23% (single mean) | 23.42% (mean-raidN) / 24.16% (distribution-weighted) — agree within 0.74pp (bar 2pp) |
| Observed wave-3+ per raid | — | 0.400 (40% of target, at 30% of required presence) |
| Wave-5 pool presence | — | 0 / 1,494 — not one wave-5 monster stood in any raid-time pool |
| Pool wave-3+ share by raid day | 2.5% pre-90 / 14.0% 90+ | <60d: 0.45% / 60–89: 3.2% / 90–119: 10.2% / 120+: 16.9% (0.94 w3+/raid, still short of 23–24%) |
| Wall (band) | won 4/8, national-ever 8/8, wave-4 5/8, wave-5 0/8, median 150d | won 4/8 (all lesser seat), national-ever 7/8, national-final 6/8, table 4/8, wave-4 6/8, wave-5 0/8, median 135d, deaths 234, starvation 5 |

Hypergeometric check: at measured p=7.16%, random drafting predicts
29.1% of raids draft ≥1 wave-3+ vs observed 30.6% — pool share, not
draft-rule subtleties, governs the hit rate. At p=23.4%, only 73.7% of
raids would draft ≥1 — the 23–24% bar buys one wave-3+ raider per raid
ON AVERAGE, not one in every raid; the next arm must not re-describe it
as "a big monster at every raid."

Per-seed trajectories moved a lot under the two intervening fixes
(73671 lost→survived, 73675 survived→won, 73676 won→lost d70, 73677
won→lost, 73678 won d150→won d116) while the pool share reproduced to
0.04pp — the pool finding is NOT an artifact of one trajectory set.

Sense (replay trajectory diverges from census trajectory, stated in
the worker evidence — the quote is about the transcript surface, not
the census raid): a wave-3 Focus Group at the palisade passes UNREMARKED
as a raid event; the escalation is only the monster's own fight
mechanics ("THE MURMUR DELIBERATES — you can HEAR it..."). A
palisade-escalation beat does not exist yet — a narration blank, filed
below, not chased here.

NEXT LEVER + PRE-REGISTRATION SKETCH (for the NEXT run, not built here):
wave-3+ weight in maintenance spawns once wave 3 is unlocked; substrate
tableseat-nowait, seeds 73671–73678, 180d death-aware, raftdraft-diag
recorder reused verbatim; PRIMARY band pool wave-3+ share (same pooled
per-raid denominator); GO bar pool share ≥23% AND wave-3+ per raid
≥0.9; GUARD wins ≥3/8, national-ever ≥6/8, death total within ±20% of
234. If the mechanism cannot reach 23% inside the guard, the honest next
step is a second mechanism, not a lowered bar. Wave-5 presence is NOT a
bar for this lever (separate standing/readiness question).

Post-merge proof: coordinator re-ran the analyzer --summary on a scratch
copy of the corpus — DIAG-GO reproduced exactly (share 7.16%, implied
23.42%/24.16%, hypergeometric 29.1%/73.7%). Worktree verified clean
before merge; commit verified correct.

## Arm 2 — sim-belltoad-morale-a: KILLED at pilot, measurement record merged 6d6ed3cf9

Game-code arm, candidate 2 ONLY (candidate 3, strike-or-flee fallback
after the 2-shout cap, is a later run's arm, never bundled). Lever:
trick-aware morale must not hold a NON-PROGRESSING trick. Pre-registered
definition (written before any armed sweep): lift the hold when trickLog
≥2 entries AND mDealt = 0 AND lead HP unchanged AND no termination
counter advancing (redactor/focus/tos/eulogy/spool/nielsen counters)
AND outcome unset; 2-shout cap, candidate-1 chorus break, and the >25%
hold floor untouched. KILL CLAUSE pre-registered: PRIMARY miss by
absence of target (guarded death sets identical + zero hold→vDie in
DIAG) = KILLED, not NO-GO; a PRIMARY miss WITH a changed death set
would be NO-GO.

Seeds 73671–73678, 180d death-aware, tableseat-nowait, deathcensus
recorder. Three armed sweeps ran (v1 superseded by a post-outcome
outcome-guard fix; v2 the clean run; v3 moving only the spool flee from
round 2 to round 3). Final v3 corpus is the result of record.

| Leg | Bar | Control | Armed (v3) |
|---|---|---|---|
| PRIMARY: other 0-dealt multi-round deaths | 1 → 0 | 1 (73674 d90 paparazzo diana_osei, rounds=2, pre-morale) | 1 (identical row) — MISS by absence of target |
| Belltoad engage-intent deaths | staying ≤ control | 1 (73677 d38 liam_davis, rounds=2, dealt 8 — not a trick death) | 1 (identical row) |
| Guard: death set in class identical to control | identical | — | PASS (no new death class) |
| Total villager deaths | ≤ 202 | 200 | 197 (all delta is the 73671 spool cascade) |
| National-ever | ≥ 5/8 | 7/8 | 7/8 |
| Wins-excluded median | ≥ 144d | 180d | 180d |
| Wave-4 reach | ≥ 5/8 | 6/8 | 5/8 (73671 cascade) |
| Starvation/sickness /100vd | ≤ 2.114 | 1.914 | 1.914 |
| Wall | — | won 4/8, table 4/8, wave-5 0/8, median 135d | won 4/8, table 4/8, wave-5 0/8, median 135d |

DIAG: zero hold→vDie fights in the band (22 hold fights, all vFlee/
mFlee). Candidate 2's target — a death CAUSED by morale holding a
non-progressing trick — does not occur on seeds 73671–73678. Both
deaths the run was supposed to address died in round 2, before the game
ever asked whether they should hold or run. A lever about holding
cannot save someone who never got to the decision.

THE SPOOL FINDING (the one lift, a definition misfire, not a fix):
seed 73671 d173, Dale Hoffman vs a spool, entry 49 HP. Control: 5
rounds, dealt 19, taken 26, fled at 23 HP. Armed v3: lift at round 3
(recording complete 3/3, still 0 dealt, still untouched) and Dale fled
at 49 HP before ever striking. The spool's trick is a timed setup
(record 3, then replay, then strike); at the check the trick is
complete but unpaid, and the hopeless formula is degenerate at 0
damage taken (divides by max(1, 0) and calls an unharmed fighter
hopeless). The "non-progressing" label misfires on exactly the trick
whose progress is deferred past the check. A future revisit must
exclude spool entirely (or require vTaken > 0) AND must first find a
band where a hold actually precedes a death — otherwise it re-proves
this kill. No fourth sweep was run to polish this: the verdict does
not depend on it, and sweeping until the corpus looks clean would be
tuning, not measurement.

Sense: the lift LINES read as a person ("Dale sees the trick is
getting nowhere — no damage, nothing moved — and stops working it...
runs while running still works") but the DECISION does not: the spool
told him twice in the log that it was recording (1/3, 2/3), hit him
for nothing — a fighter watching a machine record him, unharmed, is
watching a trick work, not fail. Contrast, hold correctly kept:
Chantal boring a focus_group to sleep over three rounds (bus
schedules, ceiling tiles, paint drying) while holding the line —
the trick working, round by round, to a payoff she can see coming.
The counter-exclusion list, not the lift, is the load-bearing part
of candidate 2.

Side findings (filed in sim-findings.md, not chased): post-outcome
morale log line (terms_of_service mFlee fights still carry "holds the
line" after the trick already ended the fight; whether the monster
phase also acts after a trick-set outcome is unproven); gavel confess
repeatability unaudited (gate checks no fired flag, could repeat like
spool/nielsen; no gavel fight in this band); 2-round pre-morale kills
as their own blank.

Game code REVERTED before commit (kill protocol) — this branch carries
measurement only (evidence + analyzer + 16-file corpus), zero src/js
diff vs base, verified by the coordinator. Post-rebase + post-merge
proof: analyzer --analyze reproduces the kill signature (fail=1, the
PRIMARY line only; every guard PASS). The 0730Z precedent applies:
killed arms merge as measurement records, lever NOT landed.

## Wall numbers (this run's judged corpora, pooled)

- Poolpres band (8 seeds): national-ever 7/8, wins 4/8 (lesser seat
  only), wave-4 6/8, wave-5 0/8, full seat 0/8, median 135d.
- Belltoad band (8 seeds, control): national-ever 7/8, wins 4/8
  (lesser seat only), wave-4 6/8, wave-5 0/8, full seat 0/8, median
  135d; armed differs only by the 73671 spool cascade (wave-4 5/8).
- Pooled: national-ever 14/16, wins 8/16 (lesser seat only), wave-5
  0/16, full seat 0/16. The scale wall above national/table is
  untouched by either arm, as it should be: one is a diag, the other
  a killed fight-morality lever. Wins still come only through
  courtship + seat instruments on the lesser seat.

## Village assessment in plain words

The villages on these bands are the same kind of villages as last run
— most reach the region, a few sit at the lesser seat, nobody reaches
the full seat or wave 5 — and this run explains two more pieces of why
the door never delivers a big monster. First, the woods at raid time
hold about 7% big monsters against the roughly 24% needed for one per
raid, and hold literally zero of the biggest kind — early in a run the
pool is almost entirely small animals, and even in the oldest runs it
only climbs to about 17%. A raid can only draft what the woods hold.
Second, the village does not notice candidate 2 at all: on seven of
eight seeds the village is indistinguishable with or without it, and
on the eighth one healthy villager walks away from a spool three
rounds early and the later days reshuffle around that absence. The
fight-morality lever has no death to fix here, because the deaths it
was built for happened before the decision it changes.

## Telemetry deviation check

SKIPPED on purpose per the standing 1027Z instruction: telemetry-check
reads 0 wins/national on per-seed recorder rows whose analyzer-proven
counts are wins 4/8 and national-ever 7/8 on both bands, and the
scale-wall baseline itself warns against comparing courtship substrates
to its WINSEAT regime. Baseline NOT rolled. Do not re-run
telemetry-check on recorder rows without a counting fix or a
regime-segregated baseline.

## Balanced panel

No compare .md attached: balance-panel.js is a live-sim observer
instrument with no corpus input and cannot compare recorder corpora
(same ingestion class as prior runs). Each arm's pre-registered
analyzer, coordinator-reproduced post-merge, is this run's comparison.

## Metric review

- No metric was re-scored mid-run. Poolpres DIAG-GO is judged exactly
  as pre-registered, including the control delta being reported rather
  than gated (stated BEFORE the sweep because the substrate moved).
- Belltoad PRIMARY judged as pre-registered (1 → 0); the miss is
  reported literally (1 → 1) and the verdict follows the pre-registered
  KILL CLAUSE, not a re-score. The analyzer initially encoded a stale
  "staying 0" wording for the belltoad guard and a gated control==0
  check; both were corrected to the pre-registered forms before the
  verdict was read (the pre-registration text predates all armed sweeps
  and governs; the script was the bug, not the bar).
- Poolpres estimand clarification, recorded for the NEXT run: 23–24%
  buys one wave-3+ raider per raid ON AVERAGE (73.7% of raids get ≥1
  at 23.4%), not one in every raid. The next arm must pre-register the
  mean-count bar, not the every-raid bar.
- Belltoad G4 note (first armed sweep, superseded): a one-day miss on
  a composition artifact (one more win shrank the wins-excluded set
  4→3 seeds); the final sweep's G4 passes exactly (180=180). Visible,
  not gating.

## Infrastructure notes (coordinator, read before the next run)

- Master moved twice under the run (sibling B landing 3cf0dc443 +
  journey-scale r34 1b7bbcb13, zero file overlap with either arm
  except none at all). Poolpres merged before the moves; belltoad's
  ff-only merge was correctly refused by the moved master, rebased
  clean in its own worktree (arm diff verified identical to the worker
  commit), re-proved, merged — no force.
- Safe-commit index clobber hit the poolpres worker commit (bogus
  staged deletions, repaired via ls-tree -r + per-file cacheinfo,
  commit verified correct, worktree verified clean) and the belltoad
  worker commit (worker-reported, repaired, verified: worktree clean,
  0 diff vs HEAD at handoff). No clobber on either coordinator merge.
- No EPERM ref-write flap blocked this run's ref writes; both
  registrations ran slow (~2–2.5 min) under sibling load and
  succeeded. No coordinator sweep-script accident this run (no
  --help probes; read-only analyzer modes used for verification,
  with the poolpres analyzer run against a scratch copy).
- No back-to-back second round: one arm landed (diag) and one was
  killed, so the fallback clause (second round only when every arm is
  killed fast) does not apply, and the run is past 30m elapsed.

scale-onramp stays converging (NOT converged): the pool-presence
premise is now confirmed twice on independent trajectories, but no
presence lever has been built or tested; candidate 2 is killed on this
band; wins are still lesser-seat only, the full seat still unreached,
wave 5 still 0. The directive stands until the tracker records this
axis converged on measured evidence. Next blanks, in order:
(1) pool-presence lever for wave-3+ at raid time (sketch above; GO bar
pool share ≥23% + w3+/raid ≥0.9, guard wins ≥3/8, national-ever ≥6/8);
(2) belltoad candidate 3 (strike-or-flee fallback after the 2-shout
cap) — the only remaining belltoad candidate, untested; (3) wave-5
pool presence zero (0/1,494) as its own question (standing/readiness
gates, not spawn weights, are the candidate cause); (4) defender-fight
wound manufacture (carried); (5) field-kill / field-save narration
beat + palisade-escalation beat for wave-3+ raids (carried + new).
food-economy stays converging (untouched; sibling B loop).
Rotation left at 3 (convergence work does not cycle it).
Claim deleted; lock deleted. Merged locally, pending ship.
Evidence: this file (coordinator) + sim-poolpres-a.md +
perseed-poolpres-a/ (commits c5f92fc5e, 4f99a66b6) +
sim-belltoad-morale-a.md + perseed-sim-belltoad-morale-a/ (commit
6d6ed3cf9).
