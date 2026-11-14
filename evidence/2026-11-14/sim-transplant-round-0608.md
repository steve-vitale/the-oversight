# H1 transplant — adoption round 0608Z: families 8, 9, 10, 10b LANDED (run fleshout-20261114T0608Z)

Run: fleshout-20261114T0608Z (Loop A), axis scale-onramp (survival collapse).
Claim: adoption of the dead 0337Z run's four arms (see §Recovery). No new
sims ran in this run; no new family was measured. Every verdict below is
the dead run's worker verdict, re-verified by this coordinator (proofs
re-run on the rebased tip AND on merged master) before landing.

## Recovery — stale-lock + flap (read first)

STALE-LOCK RECOVERY at run start. The 0337Z lock (created 03:37Z) was
2h31m old at recovery (05:39Z→06:08Z window); all four of its trees'
heartbeats were 97+ min stale (transplant8 03:45, transplant9 03:49,
transplant10 04:02, transplant10b 04:31); the dead claim's last update
was 04:35Z. Per the guard the run was DEAD. Lock deleted, claim retired
to `.DEAD` (after the orphaned work was safely committed — see below),
new lock + claim written (fleshout-20261114T0608Z). Loop B live on
winnability chain throughout (0330Z claim, rageprecheck-b arm) — NOT
touched; its trees' heartbeats were also stale (03:49Z) but that is
Loop B's own recovery, not this run's.

FLAP EPISODE ~05:29–06:08Z (~39 min). The main tree was dirty at run
start with BOTH docs/ONTOLOGY.md and sw.js truncated to 0 bytes
(mtimes 05:29:52Z / 05:32:06Z) — the host write flap, same class as
2026-10-24 / 2026-11-12 / 2026-11-13. `git checkout HEAD --` failed
repeatedly (EPERM writing the files AND .git/index.lock); `git show`
redirects failed the same way for ~35 min (writes refused at write(),
files left 0 bytes; small 5-byte probes intermittently succeeded —
the flap flips within seconds, not minutes). Recovery: a 20s-interval
retry loop caught a clear window at 06:08:21Z (ONTOLOGY.md) and
06:08:28Z (sw.js); both restored HASH-IDENTICAL to HEAD
(ONTOLOGY.md 5d6fe6026…, 2198 lines; sw.js 89c2cd539…, 252 lines).
No sibling work was at risk — both files were 0 bytes, content is
HEAD content. Flap-watch log corroborates (A/B/G/H FAIL EPERM
05:40–06:04Z, strace rc=0 at 06:08:16Z). No EPERM hit on any git or
file write after 06:08Z for the rest of this run.

ORPHANED WORK. Three arms were committed on their branches but
unmerged (8, 9, 10). The fourth (10b) had its prereg committed but
its results evidence UNCOMMITTED in its worktree (sim-transplant10b.md
+ driver log + summary + 8 per-seed JSONs + test run log +
scripts/test-transplant10b.js). This coordinator committed that
evidence verbatim (b59c44323, safe-commit; the safe-commit index
clobber struck — all 14 files staged-as-deleted post-commit —
repaired with the documented `git ls-tree -r HEAD | git update-index
--add --index-info` pipe, verified status/diff empty). Only after
that commit was the dead claim retired to `.DEAD`.

## Arms landed (all ff-only, proofs re-run on rebased tip + merged master)

Arm 1 sim-transplant10b (LANDED 9d2173c05, rebased from b59c44323):
MEASURED NOT-CARRIER 3/8. Narrowed family 10b (PR #4 person-trust-map,
STEP t10b-fbb9c53ed, subject 4d7351b72). Per-seed days
132/120/130/102/150/150/150/93; survivors 190395/190396/190397;
wave-5 5/8 (far end 2/8), wave-4 8/8, regional 8/8, national 0,
table 0, wins 0, deaths 708, standing 199–470, blooded 3/8,
tribute-ready 1/8 (190396 only). The step's per-seed days are
byte-identical to narrowed 4b's — the person-trust module is the
same blob in both subjects (family 4 contains it as a sub-family),
so this is a second independent NOT-CARRIER read on the same
module: live (person_trust tele events fire every seed, bonds
proposed 408×) yet survival-neutral on this band. Proof 94/94 in
worktree and on the rebased tip; on merged master 92/94 — the only
2 failures are branch-identity legs asserting the ORIGINAL prereg
commit e67a3088c is an ancestor of HEAD; the rebase rewrote it to
a179c05cb (which IS an ancestor). All 92 measurement legs pass.
Finding filed in sim-findings.md (rebase-aware branch-identity
legs); same class as the 0215Z finding, different shape (hash
rewrite, not branch name).

Arm 2 sim-transplant9 (LANDED d551f0044, rebased from 9775da006):
MEASURED NOT-CARRIER 4/8. Family 9 (PR #14 favor-debt-help-coherence,
merge e44b0206e, STEP t9-e44b0206e, subject 291934f7e). Per-seed days
86/144/150/43/150/87/150/150 — IDENTICAL to the far-end endpoint
days, same survivors, same median (150d): the subject reproduces
the far end seed-for-seed. Wave-5 2/8, wave-4 8/8, regional 7/8,
national 0, table 0, wins 0, deaths 629 (combat/expedition 83%),
standing 150–325, blooded 4/8, tribute-ready 1/8. Mechanism read:
the family's new lines NEVER FIRE under the competent policy (0
mentions of the unfinished-outing lines across 98,590 sayCount
lines) — the bot never presses Help mid-outing, so the coherence
repair has no path to act in sim. Proof 113/113 in worktree, on
rebased tip, and on merged master; culpritbisect 116/116 throughout.

Arm 3 sim-transplant8 (LANDED 88cc57d33, rebased from 0e545bcd0):
UNMEASURED (conflict-STOP). Family 8 (PR #22 live-thread-dry-engage,
merge 713eb7545, js=2). Cherry-pick conflicted in exactly the two
predicted src/js game-code files (conversation.js 1 hunk,
convo-dialogue.js 3 hunks) — the far end's later journey work (r120
secret replies, sociallife blocked-repeat, favor settlement) rewrote
the same conversation-grammar lines. The narrowed-tooling rule does
NOT apply (game code, not tooling). Sixth family to stop on
divergence; new wall shape: the same-lines-rewritten wall. Proposed
narrowed 8b (coordinator decision, own prereg): the clean-hunks
subset (new methods + goon + dlg:more, excluding the three
conflicted regions). Proof 84/84 in worktree and on rebased tip,
86/86 on merged master (two merged-state legs run only on master);
culpritbisect 116/116 throughout.

Arm 4 sim-transplant10 (LANDED 333d7a7b5, rebased from 6a161b30c):
UNMEASURED (conflict-STOP, tooling-only). Family 10 (PR #4
person-trust-map, merge fbb9c53ed, js=2). Cherry-pick conflicted in
exactly the two predicted tooling files (balance-proof.json,
green-list.txt); all 10 other family files staged cleanly,
including the NEW module and both loader files. The narrowed 10b
route authorized by the dead run's coordinator measured the family
(arm 1 above: NOT-CARRIER 3/8). Seventh family to stop on
divergence. Proof 85/85 in worktree, on rebased tip, and on merged
master; culpritbisect 116/116 throughout.

## Wall (this run's judged corpora — carried, no new sims)

Judged: 9 → survived 4/8, wave-5 2/8; 10b → survived 3/8, wave-5
5/8. Pooled judged corpora: survived 7/16, national 0, table 0,
wins 0, wave-5 7/16, median 132–150d. Carried: far end 4/8, wave-5
2/8; merge 1/8, wave-5 0/8; national 0, table 0, wins 0 on the
collapse band. Measured families now six: 2b AMBIGUOUS (2/8 twice,
suspect list), 4b NOT-CARRIER (3/8), 5b NOT-CARRIER (4/8), 9
NOT-CARRIER (4/8), 10b NOT-CARRIER (3/8). Unmeasured: 1, 2, 3, 6,
7, 8, 10 (10 measured via narrowed 10b). No carrier identified.

## Sense-testing (SENSE-TESTING LAW — carried from the arms)

Arm 9's corpus reads as people, not counters: veteran kills called
on camera with names remembered; defense lines name who met the
monsters at the door and who came back hurt; a villager notices a
ground-elder stand and its fruiting unprompted. Arm 10b's corpus:
door fights are named group efforts with hurt carried, veterans
called on camera, Blooded voiced when it lands, the show layer in
voice throughout; no bond spam, no trust-gated weirdness. Nothing
robotic, static, or repeated beyond the game's own formulaic
door-fight narration. Arms 8/10 ran no step — nothing to
sense-test.

## Metric review (§14)

Pre-registered metrics judged every arm in the dead run before this
adoption: 9 and 10b met their NOT-CARRIER thresholds outright (no
re-score, no re-run leg exercised); 8 and 10 stopped on the binding
conflict rule before any judged sim (UNMEASURED is the verdict, not
a metric miss). No threshold change proposed. Two metric-adjacent
notes carried from 10b for the NEXT run, not this one: (1) the
10b/4b corpus identity shows the band's trajectories are coarse —
two different families produce byte-identical death-days, so a
family can be fully live yet invisible to the survival count;
survival alone cannot see small social effects, only collapse.
(2) The person_trust teleCount does not discriminate module
presence — a future arm needing a module-liveness read must
instrument the map directly (census entries/maxTrust per seed).

## Telemetry

Deviation check attempted at coordinator level on the 10b perseed
corpus and REFUSED by the tool itself (recorder-corpus class):
"refusing recorder-corpus input: all 8 --current rows carry
top-level anchorCommit, so they are sweep recorder rows, not runs."
Same refusal the arms recorded for 9/10b. Baseline NOT rolled.
Arms 8/10 have no corpus — nothing to check.

## Infrastructure

- Host write flap ~05:29–06:08Z (see §Recovery): blocked the run
  start ~40 min (main-tree restore), then cleared; no EPERM on any
  arm write, rebase, proof, merge, or release after 06:08Z.
- Safe-commit index clobber struck the 10b adoption commit only —
  repaired with the documented pipe, commit verified correct.
  No clobber on any other commit (all four merges were ff-only
  merges, not safe-commit).
- Rebase stop-at-pick quirk did NOT strike (4 clean rebases).
- Reaper: `bash scripts/worktree-reap.sh` at pre-flight SKIPPED —
  registry lock held by another reaper run (consecutive skips: 1);
  no cleanup this run; all four adopted trees were protected by
  fresh heartbeats (06:08:44Z) and released as done-merged by this
  run. No transplant worktrees remain.
- Master moved only by this run's four landings after the run-start
  tip f59b4b674 (10b 9d2173c05 → 9 d551f0044 → 8 88cc57d33 → 10
  333d7a7b5). No sibling landed during the adoption. No pushes, no
  version bumps, no live verification (ship loop owns deploys).
- check.js --quick NOT re-run: zero src/js, zero green-list files;
  all arm proofs + culpritbisect 116/116 green on merged master
  (10b 92/94 on the two rebase-hash branch-identity legs only).

scale-onramp stays converging (NOT converged): two more families
measured NOT-CARRIER and the program's first social/trust family
measured twice over, but no carrier is identified and
national/table/wins remain 0 on the collapse band. Next blanks, in
order: (1) family 11 (0f55a928c, PR #26 voice-line-decoration-stack,
js=1) in table order, then families 12–16; (2) narrowed 8b (clean-
hunks subset) — needs its own prereg + coordinator decision; (3)
family 6b + narrowed 7b — proposed, each needs its own prereg +
coordinator decision; (4) family 2b AMBIGUOUS stays on the suspect
list; (5) proof refresh round 15 (Loop B, owed after the next
manifest change per the b14 closeout); (6) headcount-ceiling
(Steve-call); (7) Reunion mirror pack in the wild (Steve design
call). food-economy stays converging (untouched; parked).
Rotation left at 4 (convergence work does not cycle it). Claim
fleshout-20261114T0608Z deleted at closeout; lock deleted.
Evidence: evidence/2026-11-14/sim-transplant-round-0608.md (this file).
