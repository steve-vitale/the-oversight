# Loop B run fleshout-loop-b-20261104T1330Z — coordinator evidence

Run: fleshout-loop-b-20261104T1330Z. Axis: scale-onramp (winnability-chain
re-point, Steve 2026-11-03 21:13). One arm, merged locally pending ship.

## Run-start state
- No B lock existed at run start. Loop A live throughout on scale-onramp
  (1326Z claim: approachbranch + belongzombie) — NOT touched; its claim,
  lock, and tree (sim-approachbranch-a) left alone. Loop A's arms are the
  1245Z next blanks #1 (true approach geometry) and #3 (BELONG zombie
  clear) in all but name, so this run deliberately did NOT take them.
- Re-point queue disposition at run start: item (1) toggle had its verdict
  (0330/0445/0550Z); item (2) flee-repair confirmed GO by Loop A 0820Z;
  item (3) standing led via standacc/diplo to competent-plus-ask, done by
  Loop A. This run therefore took the 1245Z next blank #4: the floored
  tend-through variant with death-day deltas + wave-facing guard.
- Pre-flight: main tree clean at run start, disk 26%. Reaper removed
  nothing sibling-owned (9/16 active at closeout; streakfree-b,
  fleerepair-a, fracchoice-b, journey2-crisis-r126 flagged uncommitted
  and left alone). Claim written before any sims; deleted at closeout.
  Lock deleted at closeout.

## Arm — sim-tendfloor-b: GO-THIN (pilot, policy-only measurement tool)
- Branch commits, rebased onto local master tip 62a67de7d (journey
  crisis r126 landed mid-run, zero file overlap) and merged --ff-only:
  9ac3f1c05 prereg (committed before any judged sim) + 10c38cdeb
  instruments/proof + 596ecf829 pilot/evidence. Zero src/js diff,
  leadcourt.js and leadcourt-tendthrough.js untouched, no gate/price/
  deed change. The new policy file lands as a measurement tool only;
  no default flip is proposed.
- Variant: leadcourt-tendfloor-b.js = tend-through with exactly one
  change: tend only while pantry > 13,500 kcal (12,000 proposal gate +
  one 1,500 tend). Baseline: tend-through verbatim, re-run on the same
  fresh seeds 99001–99008, 300d death-aware, diplo instrument verbatim.
  0 instrument errors on all 16 runs.
- Judged exactly against the prereg (all four legs pass, so GO; the
  thinness is reported, not re-scored): (a) survival-band regressions
  0; (b) median death-day delta +0.5d (deltas −7, 0, 0, 0, +1, +50,
  +78, +115; bar ≥ −5); (c) pooled hold-share 0.957 vs baseline 1.000
  (bar ≥ 0.950 — passes by 0.007); (d) wave guard: wave-4 ever-faced
  6 vs 4, wave-5 0 vs 0 (bar: within 1 each) — PASS.
- The finding behind GO-THIN: drops go 0 → 3 while pooled hold still
  passes. 99001 flickers (drop d103, recovery d115); 99002 collapses
  after a 47-day below-floor tending gap; 99008 collapses at death
  after a 132-day gap. Longer lives add held snapshots, so the pooled
  number flatters a polity that ended collapsed. Per §14 the verdict
  stands (drop count was not a prereg guard), but NO confirm is run
  on this metric as written — confirming a GO a drop-count guard
  might overturn would be confirming the wrong bar. The worker
  correctly did not run the confirm; the pre-stated confirm band
  99009–99024 stays fresh for a future run with a drop-guard
  addendum committed before its sims.
- What the floor buys: tend totals 378 → 199 (−47%); median survival
  76 → 118.5d, max 135 → 195d; three band gains (99004 D→C, 99006
  D→C, 99008 D→B); one new polity (99006 never → holds-to-death,
  global). Floored-band tends 86 — the lever fired in the band it
  opens. What it costs: the three late drops above, and starvation
  deaths 6 → 7 (binding deaths here are combat deaths in longer
  lives, not starvation). Scope limit, stated not buried: this band
  had zero baseline-collapsing seeds, so the floor-on-a-collapsing-
  seed question — the actual 0930Z question — is still untested.
  Do NOT cite this GO as "the floor fixes the 0930Z cost."
- Proof: scripts/test-tendfloor-20261104.js 41/41 PASS, re-run green
  by the coordinator on the rebased branch and on merged master.
  No jest run (no jest in this arm).
- Sense-test: baseline polity reads as a consequence of tending;
  armed drops and the 99006 new polity are narrated as realm events
  but the narration never names tending as the cause. Minor flag:
  armed 99001 d103 pairs "the bond dips, but holds" with "the realm
  came apart" the same day. Tend lines still not captured by SAY_RE
  (carried limit).
- Worker evidence: evidence/2026-11-04/sim-tendfloor-b.md +
  sim-tendfloor-b-prereg.md; corpus perseed-tendfloor-b/ (16 files);
  policy scripts/policies/leadcourt-tendfloor-b.js.
- Safe-commit index-clobber phantoms hit the worker's commits;
  repaired via HEAD-blob update-index --cacheinfo, commits verified
  correct. No clobber on the coordinator merge (ff-only).

## Scale-wall numbers (this run's judged corpus)
Wins 0/8 both legs, national 0/8 at end, table not instrumented,
full seat 0, wave-5 unlocks 0/8, wave-5 faced 0/8, wave-4 faced 4 → 6/8,
readiness-5 days 0, median survival 76 → 118.5d, max 135 → 195d.
Full seat still unwon, wave-5 kills still 0 in normal play. In plain
words: putting a floor under the grain lets villages live much
longer and even build a realm they never had — but the realms they
already held come apart late, quietly, after months of silence.
The floor moves the trade instead of solving it.

## Telemetry deviation check
ATTEMPTED by the worker and REFUSED by the tool itself
(recorder-corpus field shape, same as 0930Z/1030Z/1212Z/1245Z).
No compare fabricated, no --allow-recorder-corpus workaround used,
baseline NOT rolled.

## Origin check (repo push discipline)
`git fetch origin master` before merging: origin/master d8164a1aa
(batch ship bump) is an ANCESTOR of local master 62a67de7d — local
master is ahead with unpushed local landings, the normal
merged-locally-pending-ship state. No stale-base revert risk in
this merge (worker branch rebased onto the local tip, zero file
overlap with the journey landing). No push made; ship loop owns
deploys.

## Next blanks, in order
1. A floor run WITH a pre-registered drop-count guard (e.g. armed
   drops ≤ baseline drops + 1), ideally screened on a fresh band
   containing baseline-collapsing seeds, so the floor is judged
   where tend-through actually saves polities. Confirm band
   99009–99024 is pre-stated but needs the guard addendum first.
2. The pre-registered sensitivity: tend-through only for links
   below the seasoned bar.
3. BELONG-tending gap — belongseek panel with a policy that tends
   subordinate links (still open; tend-through and the floor both
   tend Haven-primary links only).
4. 99101 hold-beat case re-finding per anchor (carried).
5. wave5faced label rename (carried).
NO gate/price/deed arm follows.

## Disposition
- scale-onramp stays converging (NOT converged): the floored
  tend-through is GO-THIN on a holding band, the floor-on-a-
  collapsing-seed question is untested, the full seat is still
  unwon, and wave-5 kills are still 0.
- food-economy stays converging (untouched; sibling Loop A).
- Worker tree released done-merged, branch deleted. Main tree
  clean at closeout. Claim deleted; lock deleted.
- Merged locally, pending ship (no push, no bump, no live
  verification — ship loop owns deploys).
