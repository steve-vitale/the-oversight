# Loop B 0330Z coordinator evidence — killerdeath NO-GO + encounterprod DIAG-NO-CANDIDATE (merged locally, pending ship)

Run: fleshout-loop-b-20261105T0330Z. Axis: scale-onramp, winnability-chain re-point.
Loop A live on food-economy throughout (2215Z strandnarr/spoilname, landed adeeb7f39) — NOT touched.
No gate/price/deed/readyDemand/VETSHAPE change in either arm. Zero src/js in both arms.
Shared method: staged per docs/MEASUREMENT.md §§9-12, 14-15; pilot 8 seeds before any confirm;
competent policy verbatim; 150d death-aware horizons; prereg committed before any judged sim;
metric binding (§14) — misses are NO-GO, never re-scored. Balanced panel (§15) inapplicable to
both arms (pure diagnostics + policy-side probes, no Game-root change) — stated, not fabricated.

## Stale-lock recovery (done first)
B run 0139Z declared dead (heartbeats never advanced past 01:43/01:46Z, no processes);
lock deleted, claim retired to .DEAD with a note; NOTHING destroyed. During this run a closeout
landed that run's held work (standaccum2 evidence ea233331c, strandnight evidence 971b01f0b).
The trigger BUILD itself remains uncommitted in sim-triggerbuild-b — still held, NOT touched.

## Arm 1 — sim-killerdeath-b: NO-GO (commits 923eb112c / 170750f18, proof 14/14)
Fresh band 99131–99138. PRIMARY: seeds with >= 1 snapshot day with living wave-4 killers >= 2.
Baseline 0/8; retention probe (fresh killers sit out wild sorties 30d after banking) 0/8;
GO required >= 2/8 — not met, no confirm owed. Retention demonstrably applied (99136 Yuki:
full 30 days retained, 66 days past first blood vs baseline 2 days, village survived to horizon)
yet no second killer was ever blooded in 13 wave-4 fights. 99138 near-miss: kills 12 days apart,
never overlapping. Kill-to-death median baseline 2.5d (n=2), retention 11d (n=3). Death-cause split
100% (0 unsplit 'the wild' residuals). Wall (baseline): wins 0/8, national 0/8, table 0/8,
wave-4 unlocks 5/8, faced 5/8, wave-5 0/8, ready days 0/8, median survival 71d (retention 89d).
Evidence evidence/2026-11-05/sim-killerdeath-b.md (+ prereg); corpus perseed-killerdeath-b/ (16 files).

## Arm 2 — sim-encounterprod-b: DIAG-NO-CANDIDATE (commits 99ff7d0a3 / da3b8f27d, proof 15/15)
Fresh band 99141–99148. Baseline census: 6 UNLOCKED-FACED / 0 UNLOCKED-UNMET / 2 NEVER-UNLOCKED.
The old band's unlocked-but-unmet shape did NOT reproduce; every unlocked seed faced wave 4
(7–15 fights each, 62 wild of 69, 4 kills). Never-unlocked: 99145 STANDING (75 fights, 35 kills,
gated peak 20) / 99147 LEDGER (died day 36, w2pts 1/5). Seek probe: 0/8 faced vs baseline 6/8
(needed >= 8/8) — FAILED decisively; 82 seek calls, 69 arrived, 1 fight; remembered tiles go stale
and the pre-step sortie displaces the dawn/home routine; seek median survival 43d vs baseline 89.5d.
Clause A met on the letter only (tied 1/1), clause B failed — no BUILD candidate, no confirm.
Wall (baseline): wins 0/8, national 0/8, table 0/8, wave-4 unlocks 6/8, faced 6/8, wave-5 0/8,
median run-days 89.5. Evidence evidence/2026-11-05/sim-encounterprod-b.md (+ prereg);
corpus perseed-encounterprod-b/ (16 files).

## Wall (both baselines agree)
Wins 0/8, national 0/8, table 0/8, wave-5 unlocks 0/8, faced 0/8, readiness-5-ready days 0/8.

## Metric review
Both preregs held without revision. Killerdeath's GO bar (>= 2/8 pairs) was the right bar: the
probe applied cleanly and still produced zero pairs, so the NO-GO is a lever verdict, not a
measurement failure. Encounterprod's two-clause GO correctly blocked a BUILD claim on a tied
clause A plus a failed clause B. No metric revision proposed for the next run; the next arms
need new primary metrics (second-killer production rate; standing-flatline mechanism), not
revisions of these.

## Infrastructure (all handled, none blocking)
EPERM flap active all run: registration blocked on git ref writes (7+ failures, then cleared);
one lock file flap-truncated to 0 bytes (repaired on retry); one service restart mid-registration
(left an orphan branch + an evidence-only dir at ~/workspace/worktrees/sim-encounterprod-b:
37,835 files, evidence/ 2026-10-20..2026-11-01, all mtimes 03:57Z, no .git, no registry entry —
LEFT UNTOUCHED for closeout inspection; arm 2 re-registered as sim-encounterprod2-b).
Safe-commit index clobber hit all four worker commits (repaired via HEAD-blob cacheinfo each time,
commits verified correct). Master moved 4+ times under the run; every merge ff-only after clean
rebase with zero file overlap, proofs green after every rebase and on merged master.
Telemetry deviation check on both corpora: REFUSED by the tool (recorder-corpus shape, same class
as 1830Z/2015Z/2125Z/2330Z); baseline NOT rolled, no compare fabricated, no investigation item.

## Next blanks (in order)
(1) Second-killer PRODUCTION — why a second kill is rarely blooded while the first killer lives
(kill-rate per fight: 4/69 here, 13/131 standaccum2; party/damage instrument on wild fights,
NOT another retention window). (2) Standing accumulation, part 3 — the flat-20-while-dying
mechanism (99145). (3) BUILD the trigger — still held uncommitted in sim-triggerbuild-b, NOT this
run's to claim. (4) Carried: veteran-word collision naming, lost-trail wording note, tend
band-count rule, LIVE-SIM fallback firing, approach guardrail re-test prereg revision, BELONG clear
on a belongseek substrate, 99101 hold-beat re-finding per anchor, wave5faced label rename.
NO gate/price/deed arm follows. Context, NOT chased: Steve's 2026-11-04 22:32 CST
villager-initiated-bonds ruling (MEMORY.md, landed during this run) answers the linkseek
who-should-ask question; building it belongs to the diplomacy lane.

## Convergence
scale-onramp: converging (NOT converged). Retention does not create pairs, facing is not the
blocker on fresh bands, full seat still unwon, wave-5 kills still 0, readiness-5-ready days 0/8.
Merged locally, pending ship: killerdeath 923eb112c + 170750f18, encounterprod 99ff7d0a3 +
da3b8f27d, coordinator evidence (this file). No push, no bump, no live verification (ship loop
owns deploys). Main tree clean after every merge. Both worker trees released done-merged,
worktrees removed, branches deleted. Claim + lock deleted at closeout.
