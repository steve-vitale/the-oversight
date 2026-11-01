# Loop B round 0249Z — STALE-LOCK RECOVERY + ADOPTION LANDING (axis food-economy)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261101T0249Z.
Axis: food-economy (strand substrate). Loop A live on scale-onramp for the
whole run (claim fleshout-loop-a-20261101T0125Z: contactfinish + contactrec2)
— NOT touched. This run ran NO new sims and judged NO new lever: it recovered
and landed the dead 0119Z run's two committed arms, verified them, and closed
the run. Merged locally, pending ship.

## Stale-lock recovery (evidence, not assertion)

Dead run: fleshout-loop-b-20261101T0119Z (lock created 2026-11-01T01:20:24Z,
claim arms sim-strandwide-b + sim-gate2hunt-b, axis food-economy).

Death evidence, all checked before the lock was deleted (02:49Z):
- Registry heartbeats for both B trees 2026-11-01T02:04:26/27Z — 38+ min stale
  at first check (02:42Z), past the body's 15-min guard. (Caveat recorded:
  Loop A's trees showed the same 02:04Z heartbeat stamp while Loop A processes
  were visibly running, so heartbeat age alone was NOT treated as proof —
  see below.)
- NO worker processes for either B tree at 02:42Z, 02:47Z, or 02:55Z (full ps
  scans; only Loop A processes: contactfinish sweep, r81 pilot, plus sleep
  waiters).
- NO file writes in either B worktree after the workers' evidence commits
  (strandwide-b evidence 01:55Z, gate2hunt-b evidence 01:50Z; newest-file
  scans confirm nothing after).
- Both workers' work COMMITTED on branches with final evidence (see below);
  the coordinator steps (merge, round evidence, tracker, claim/lock cleanup)
  never happened: claim still live, lock still present, nothing on master.
- Main tree at run start: only two 0-byte flap-probe .tmp files untracked
  (02:31Z); deleted, tree clean. Disk 21%.

Per the body, the old lock was deleted and the dead claim retired to
`.DEAD` (+ `.DEAD.note`) at 02:49Z, and this run's own lock + claim
(fleshout-loop-b-20261101T0249Z) were created before any merge. Per the
closeout skill, the orphaned work was verified committed (branches below)
before the retirement.

Resolved without this run's intervention: worktree/branch sim-strandwide-r
(registered 2026-11-01T02:04:39Z, owner oversight-flesh-out-loop-b, heartbeat
02:04Z, no processes) held ONLY a duplicate prereg commit (771a74e55, same
message/tree content as strandwide-b's prereg 6c0b469fc, different hash — a
restart from prereg, no judged work), and its worktree prereg file was
truncated to 0 bytes at 02:33Z (container flap damage, same window as the
main-tree flap probes). No claim file ever existed for any "r" run. This
adoption run did NOT touch it (its commands named only the two adopted
trees) — but a registry pass at 03:01:30Z marked it done-abandoned and
removed its worktree, and by closeout its branch was also gone (verified:
no refs, no trees). Nothing is lost: its sole content (the 375-line prereg)
is preserved on master through strandwide-b's landed prereg (b3b017c20,
same content). No action remains on sim-strandwide-r.

## Adopted arms (workers' verdicts, coordinator-verified, NOT re-judged)

### Arm 1 — sim-strandwide-b: GO via the POLICY half (DIAG + policy-side)

Worker branch tip at adoption: 4ce685f90 (prereg 6c0b469fc, instruments
8e584fa2c, evidence 4ce685f90; base ee159dbc3). Rebased onto master
00b1f1da7 as b3b017c20 / 8bf2442af / cc247222f; merged --ff-only.
- Proof re-run post-rebase: scripts/test-creekseek-b.js 9/9,
  scripts/test-strandtile-b.js 9/9 (both green in the worktree before merge).
- Diff guard post-rebase: `git diff --name-only ee159dbc3 -- src/
  scripts/policies/` shows ONLY scripts/policies/creekseek-b.js (new file);
  src/ empty; arm files + corpora byte-identical old-tip vs new-tip
  (diff on arm paths empty).
- Census re-read from the landed files (not the worker's prose): P1 G1
  8 creek evenings / 7 confirmed / 7 failed-return / 1 episode; creekseek G1
  13 / 11 / 11 / 2 episodes; G2 both cells 1 / 1 / 0 / 1 no-attempt; gateOk
  all legs; classification completeness 1. Matches the worker evidence
  exactly, including the pooled POLICY-half pass (creekseek 14 vs P1 9 creek
  evenings; 2 creekseek episodes, both on 17523) and the BAND-half miss
  (1 fresh P1 seed vs the 2-seed bar).
- Verdict carried, not re-scored: GO via POLICY half. DIAG + policy-side
  only — NO src/js change, NO default flip, NO criterion merge authorized.
  Combined P1 strand population now 3/40 seeds (17513, 17511, 17523);
  creekseek created 1 new episode on an existing episode seed (17523 days
  18–21), not a new episode seed. Binding scarcity named by the worker:
  away evenings, not creek proximity (policy fired 2 moves in 712 evenings).

### Arm 2 — sim-gate2hunt-b: GO, gate-2 measured as a band (DIAG only)

Worker branch tip at adoption: bc286f651 (prereg d2546bb77, instruments
4f27f0c9, evidence bc286f651; base ee159dbc3). Rebased onto master
cc247222f (post-strandwide) as ca2b08635 / 9b9fba901 / 460d14b6b;
merged --ff-only.
- Proof: scripts/test-gate2hunt-b.js 14/14 — green post-rebase AND on the
  retry loop's first success (02:55:30Z; see Infrastructure). The 9 pure
  checks passed on every attempt; the 5 /tmp band-bar checks were blocked
  by the container write flap until it cleared (never an assertion failure).
- Diff guard post-rebase: `git diff --name-only ee159dbc3 -- src/ scripts/
  scripts/policies/` shows ONLY scripts/analyze-gate2hunt-b.js and
  scripts/test-gate2hunt-b.js (new files); src/ empty; arm files + corpora
  byte-identical old-tip vs new-tip.
- Census re-read from the landed files: control 0 refusals; BARE H1 7
  (17703, fallen_tree, D=0); H2 0; H3 7 (17724, creek, 7/7); H4 13 on
  [17734, 17737], bandBar true, D=11, gate2 11/11, gatePass true on all
  cells; 1,200 evenings judged, 27 refusals, probe agrees 27/27, narrated
  27/27. Matches the worker evidence exactly. H5/H6 UNRUN per the stop rule.
- Verdict carried, not re-scored: GO. Gate 2 is now MEASURED as a band
  measurement (H4 11/11), superseding the 2343Z "untested as a band"
  status — by a fresh-band measurement, not by re-reading 17606's 37/37.
  The (4,3) chokepoint finding stands: every refusal in H1/H3/H4 (and
  17606's) is blocked at tile (4,3); only the blockage type varies by seed.

## Wall numbers

NOT re-measured by these pre-seat censuses — reported as last measured,
never fabricated. Last measured (Loop A lane): full seat 0 / wave 5 reached
0. These arms' corpora carry no national/table/wins fields, so no wall
number in this file comes from them. Observed survival on judged legs:
strandwide 54/56 legs survived their window (17542 village-lost day 22 on
both policies); gate2hunt 40/40 survived 30d.

## Village assessment, in plain words

Two villages' worth of night stories, both about the same gap north of home.
In the strand villages, almost nobody ever sleeps out: twenty-four fresh
villages, and only two ever sleep at a creek. One scholar walks out, finds
the creek, and cannot get back across it for seven nights — she learns
monster lore and green-thumb work out there until she dies and someone else
wakes up at home — and then the same village does it again on purpose, a
drink at the creek before night turning into four more nights out. In the
refusal villages, the night step knows exactly one jump, straight home, and
when that jump is refused the villager simply stays: one woman camps in the
wetland a week, walks home in daylight, goes out again, and is refused four
more nights; another ranges far all month and only on the second-to-last
night finds a fallen tree across her short way home, still out there when
the month ends. The creek between a villager and home is real, it is
narrated, and the instrument that names it now agrees with the engine every
single time. What is still scarce is not the creek — it is a day that ends
away from home at all.

## Telemetry deviation check (this run, both corpora, baseline NOT rolled)

`node scripts/telemetry-check.js --baseline
telemetry-baselines/scale-wall.json --current
evidence/2026-11-01/sim-gate2hunt-b-census-bare-h4.json --metrics
national,table,wins,exiled` and the same on
sim-strandwide-b-census-p1-g1-30d.json: 3 LOUD lines each (national 12->0,
table 16->0, wins 16->0). INVESTIGATED as the known missing-field artifact
both workers predicted: neither census carries national/table/wins/exiled
fields (key lists verified), so 0 means "field absent", not "wall moved".
No genuine LOUD signal. Baseline NOT rolled.

## Blanks filled or documented (by the adopted arms; coordinator files below)

- FILLED (measured): first policy-created strand episode with a clean
  causal read (creekseek day-18 moved-to-creek on 17523 -> episode 18–21;
  episode 7–13 byte-identical across policies).
- FILLED (measured): wider-band P1 strand rate 1/24 fresh seeds; combined
  3/40 distinct P1 seeds carry an episode.
- FILLED (measured): gate 2 AS A BAND MEASUREMENT — H4 11/11, D=11; the
  2343Z held item is closed by this hunt's own numbers.
- FILLED (proved): 17518 sleep-step instrument gap — corrected gate
  predicate, 14/14 pure + real-corpus proof, refusal counts unchanged.
- DOCUMENTED (measured): (4,3) chokepoint; refusal bands not rare on fresh
  BARE bands (3 of 4 hunt cells carried refusals); H5/H6 unrun and fresh.
- DOCUMENTED (measured): two refusal runs end unresolved at the horizon
  (17724, 17737) — a 30d window cuts stranded stories off mid-run.
- DOCUMENTED (measured): away evenings are the binding scarcity (P1 ends
  days at haven; P3 ends days out — 38 vs 8 creek evenings on G1 seeds).
- DOCUMENTED (sense nuance, recurring): succession mornings narrated as
  returns ("walk back into Haven") while the census classifies them as
  deaths (vessel change); already filed in the backlog class (#1633 and
  narration-residue items) — NOT re-filed here.
- DOCUMENTED (texture, counted not designed): double block line on every
  first-refusal evening (daytime attempt + night hop, undistinguished);
  haven-business lines firing on stranded evenings; a stranded evening
  never says it is spending the night out because the way home is blocked.

## Metric review (this adoption run)

No metric was set or re-scored by this run: both arms were judged by their
workers against preregs committed BEFORE their judged legs, and this
coordinator carried those verdicts after verifying proofs, censuses, and
diff guards — it did not re-judge corpora. Carried for the NEXT run's
preregs (from the workers' metric reviews, not decided here): (1) the
strand POLICY bar should demand a per-band delta or pre-state the pooled
delta as the bar (G2's delta was zero); (2) whether a future band GO
should also require an agreement value (priors now 11/11 band, 37/37
single-seed); (3) whether the band bar should require a minimum per seed
(17737 contributes only 2 of H4's 13); (4) the next strand prereg should
measure the away evening itself (what ends days away, on which policies)
rather than only its creek subset.

## Next blanks, in order (food-economy / strand program)

1. Away-evening census: what ends days away from home, on which policies
   (strandwide's carried doubt — the binding scarcity is now a question
   with numbers, not an impression).
2. Longer window on a refusal band (H4 seeds 17734/17737, or fresh H5/H6):
   do unresolved refusal runs resolve by daytime walking, as 17734's and
   17606's did?
3. Narrated homeward attempts (design decision; counts supplied by
   strandtile/strandwide/gate2hunt).
4. Death-aware camp-final unit + refusedband sleep-step gameOver-flag
   predicate fix (carried from 2343Z; the gate2hunt corrected predicate is
   the instrument fix, the camp-final unit question is separate).

## Infrastructure findings (for the next run — NOT game findings)

1. Container EPERM write flap ACTIVE across this run (~02:42–02:56Z+):
   registry atomic writes failed (worktree-reap traceback, two
   worktree-heartbeat failures — heartbeats stayed 02:04Z, trees NOT
   reaped: 4h reaper threshold not reached, run finished well inside it);
   /tmp writes failed intermittently (sort temp, python tempfile, and the
   gate2hunt proof's /tmp seed files); a background retry loop (20 x 60s)
   caught the proof green on attempt 1 at 02:55:30Z. No ref surgery, no
   force, no registry hand-edits anywhere in this run. Retry, don't force.
2. Safe-commit index clobber hit BOTH workers' pre-leg commits (reported in
   both arm evidences, repaired by the workers via --add --cacheinfo).
   No clobber on either rebase or either merge in this run; main tree
   verified clean after every step.
3. worktree-release.sh for the adopted trees ran long (registry lock
   contention, same class as the gate2hunt worker's hung heartbeat) but
   completed: both trees released as done-merged, worktrees removed,
   branches deleted (verified: worktree list + branch list clean at
   closeout). The same 03:01:30Z registry pass marked sim-strandwide-r
   done-abandoned; its branch deletion followed before closeout.
4. Master moved under the adoption only via the adoption itself (journey
   r64 was already tip at run start; Loop A did not land during this run).
   No fetch, no push (local-only merge per loop procedure; ship loop owns
   pushes).

## Files (landed on master by this run)

- Arm 1: b3b017c20 (prereg), 8bf2442af (instruments), cc247222f (evidence)
  — evidence/2026-11-01/sim-strandwide-b-prereg.md, sim-strandwide-b.md,
  sim-strandwide-b-compare.md; scripts/policies/creekseek-b.js,
  scripts/creekseek-trace-b.js, scripts/test-creekseek-b.js; 6 corpora +
  6 censuses + split/stderr logs under evidence/2026-11-01/.
- Arm 2: ca2b08635 (prereg), 9b9fba901 (instruments), 460d14b6b (evidence)
  — evidence/2026-11-01/sim-gate2hunt-b-prereg.md, sim-gate2hunt-b.md;
  scripts/analyze-gate2hunt-b.js, scripts/test-gate2hunt-b.js; 5 corpora +
  5 censuses + stderr logs under evidence/2026-11-01/.
- This file: evidence/2026-11-01/sim-food-strandwide-gate2hunt-round-0249-b.md
  (coordinator evidence; committed as this run's coordinator commit).

## Proof (coordinator re-runs, post-rebase)

- scripts/test-creekseek-b.js 9/9 + scripts/test-strandtile-b.js 9/9
  (strandwide worktree, post-rebase, before merge).
- scripts/test-gate2hunt-b.js 14/14 (gate2hunt worktree, post-rebase, before
  merge; also 14/14 on background retry loop 02:55:30Z).
- Census re-reads above match both worker evidences exactly (numbers
  quoted from landed files, not from prose).
- Merges: --ff-only both; master 00b1f1da7 -> cc247222f (strandwide) ->
  460d14b6b (gate2hunt); main tree clean after each merge.
