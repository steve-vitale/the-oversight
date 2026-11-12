# sim-bisect-adopt-round-0215 — survival-collapse bisect ROUND 2 (Loop A adoption run)

- **Run:** fleshout-20261112T0215Z, Loop A, axis scale-onramp / survival-collapse bisect
- **Claim:** `hidden_files/lever-claims/fleshout-20261112T0215Z.json` (deleted at closeout)
- **Master at closeout:** `5ef5a8e0c` (all three arms landed, merged locally, pending ship)

## Stale-lock recovery

Lock `fleshout-20261111T2317Z` (created 2026-11-11T23:18:09Z, ~3h old, past the
90-min fallback); its trees' latest heartbeats were sim-bisect-merge-a
01:13:31Z and sim-bisect-mechanism-a 23:41:33Z, both >15 min stale — run DEAD
per the concurrency guard. Lock deleted, claim
retired to `.DEAD` with a note. Round-1 arms were already landed on master
(anchor-a `54ac6040d`, anchor2-a `e0f1cacb0`, mournblooded `f888f7ce3` — all
verified ancestors of master at run start). The `sim-bisect-mechanism-a` tree
held nothing (clean, no evidence, no commits) — not adopted, left for the
reaper. The dead run's round-2 arms were adopted as this run's arms 1–2; its
`sim-bisect-policyswap-a` branch already existed at `3f136f07e` (no unique
commits) and a stray 6.6G duplicate of `evidence/` (2026-10-14–2026-11-02,
58,621 files, zero unique to it, verified by full path-list comm) sat at the
worktree path — moved to recoverable trash (trash_id
`20261112-022625-d2603a163b36486a9484d81d104163a4`, expires 2026-12-12) before
re-registering the tree. No unique work was in the stray copy.

## Arm 1 — sim-bisect-merge-a (ADOPTED in its tree): COLLAPSE_INSIDE_MERGE, 1/8

Landed `52b7225d6` (rebased from `14eb3432c` onto explicit master SHA
`d897eab1f`; proof re-run, merged ff-only, ancestor verified, tree released
done-merged, branch deleted). The worker finished the dead run's band (2/8
seeds pre-run, 6 run in this run), 0 instrument errors, standing.js restored
byte-identical (sha `75762cb2259d…`), zero src/js changes committed.

| | Vetphantom fix leg (`5157782a4`) | Merge-cut (`e4dbe581b`) |
|---|---|---|
| Survived | 6/8 | **1/8** (only 190392) |
| Median survival | 150d | **126d** |
| Deaths | 707 | 621 |
| Wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 |
| Wave-5 unlocks | 3/8 | 2/8 |
| Blooded | 5/8 | 1/8 |

Evidence `evidence/2026-11-11/sim-bisect-merge-a.md`, corpus
`evidence/2026-11-11/perseed-bisect-merge-a/`, summary
`evidence/2026-11-11/bisect-merge-a-summary.json`. Proof
`scripts/test-bisect-merge-a.js` 49/49.

**Ancestry twist (evidence §8):** `5157782a4` is NOT an ancestor of the merge —
it descends from the merge's first parent `203a32775` by 205 commits; the
merge was cut from stale local master. The merge tree both ADDS origin-side
content (32 src/js files, +4,916/−1,363) AND LACKS 205 local commits present
in the vetphantom base (r131 fix swapped in here, so controlled). The collapse
could be origin-side content (H1) or a protective local commit the merge
predates (H2); this leg cannot distinguish them. Next step named explicitly:
run the merge's first parent `203a32775` on the same 8 seeds, same
policy/horizon, r131 fix swapped in — TWO legs there to control the
`competent.js` confound (own policy vs vetphantom-base policy swapped in) —
then a confirmatory leg on shipped reconciled master `743e07d87`.

## Arm 2 — sim-bisect-policyswap-a: POLICY_EXONERATED, 2/8

Landed `c83d47d03` (rebased twice — master moved mid-run, first to `52b7225d6`
by arm 1, then to `0033d1a92` by sibling Loop B's synergystall-b landing;
rebased onto the explicit current SHA each time per the quirk lesson; proof
re-run, merged ff-only, ancestor verified, tree released done-merged, branch
deleted). Premise verified fresh: the `5157782a4..3f136f07e` competent.js diff
is exactly the one `workGarden` hunk (OVE-160); sim-harness / vetfirst
instrument / standing.js diffs empty. Old policy sha `0801abd82e52…`, new
`3c40151e8dd4…`; driver refused the unswapped file live (exit 2); new policy
restored byte-identical; swapped file never committed.

| | Vetphantom fix leg | Policyswap (3f136f07e code + old policy) |
|---|---|---|
| Survived | 6/8 | **2/8** (190396, 190397) |
| Median survival | 150d | **126d** |
| Deaths | 707 | 609 |
| Wins / national / table | 0 / 0 / 0 | 0 / 0 / 0 |
| Wave-5 unlocks | 3/8 | 2/8 |

The hunk DOES reroll trajectories on 5/8 seeds (190397 flips 142d death →
150d survival at standing 445, the highest standing of any post-vetphantom
leg) but is a bit-identical no-op on 3/8 seeds (190392, 190394, 190396 —
daily-snapshot sha match + identical death lists vs anchor-a). A cause that is
a literal no-op on 3/8 paths cannot be the collapse. **The collapse is
game-code-only.** Seeds 190392/190394/190396 are policy-insensitive controls
the next game-code bisect arm should check candidates against first.

Evidence `evidence/2026-11-11/sim-bisect-policyswap-a.md`, corpus
`evidence/2026-11-11/perseed-bisect-policyswap-a/`, summary
`evidence/2026-11-11/bisect-policyswap-a-summary.json`. Proof
`scripts/test-bisect-policyswap-a.js` 50/50.

## Arm 3 — sim-findings-a: three tracker blanks FIXED + both proofs made hermetic

Landed `5ef5a8e0c` (branch included a plain 3-way merge of master `c7d0a5c8a`
to pull in the bisect proofs; master verified an ancestor of the branch;
merged ff-only, ancestor verified, tree released done-merged, branch deleted).
All targeted suites re-run by the coordinator on the branch before merging,
unpiped: bisect-merge-a 49/49, bisect-policyswap-a 50/50, anchor-a 41/41,
anchor2-a 41/41, mournblooded-a 50/50, warpath 9 pass, tabledeed ALL GATES
GREEN, regional-meds ALL PASS.

- (a) Warpath remainder-count test — FIXED (`4bfa06573`): monster-noun lookup
  miss; fixture voices the right noun now; failure reproduced on base first.
- (b) Tabledeed E3 vacuous check — FIXED (`03ecc60f2`): filename parse now
  reads the filename, not the +/- bar; demonstrated flagging progression.js.
- (c) Dry-swallow bandage verb — FIXED (`20da580d7`, `[needs-eyes]`):
  per-kind use verb in useMedicine (bandage applied, ORS drunk, pills
  dry-swallowed); regional-meds suite asserts the verb per kind.
- (d)+(e) Bisect proof hermeticity — FIXED (`5ef5a8e0c`, test-only): merge
  driver guard moved from require-time to the run entry point
  (`refuseUnlessSwapped()`); guard texts from pinned commits, never live disk;
  ladder rule detected from loaded code (the old inline rule vs shared
  `countLivingVeterans` — the brief's "only the guard" diagnosis was
  incomplete, same class of miss as the warpath task). Refusals still loud
  (wrong-sha swap → exit 2, missing standing.js → exit 2). No sub-arm killed.

Evidence `evidence/2026-11-11/sim-findings-a.md`. The (c) commit carries
`[needs-eyes]` (player-facing spoken text).

## Wall numbers (this run)

| | Merge-cut | Policyswap | Vetphantom fix leg |
|---|---|---|---|
| Survived | 1/8 | 2/8 | 6/8 |
| Median survival | 126d | 126d | 150d |
| Wins | 0/8 | 0/8 | 0/8 |
| National | 0/8 | 0/8 | 0/8 |
| Table | 0/8 | 0/8 | 0/8 |
| Wave-5 unlocks | 2/8 | 2/8 | 3/8 |

The scale wall stands. The bisect has now cut the collapse to game code in
`5157782a4..3f136f07e` with the policy confound exonerated; the next cut is
the merge's first parent.

## Telemetry deviation check

Attempted at closeout on the merge-a corpus: REFUSED by the tool (exit 2,
same recorder-corpus class as vetphantom-b / tributedeliv-b /
survivalcontrol-b / anchor-a: "recorder-corpus input … compared with
sweep-compare tables, never against a run baseline"). Recorded, not waived;
no `--update-baseline` passed — rolling the baseline forward on a 1/8
collapse corpus would be wrong. No LOUD lines to investigate (no compare ran).

## Infrastructure notes (for the next coordinator)

- **Pipe-masked exit codes, twice in one run.** The merge-a proof's first
  post-rebase "exit 0" was `tail`'s — the proof was actually exit 2 (guard
  firing at require on the rebased tree). Caught by an unpiped re-run before
  closeout. The policyswap merge then repeated the error: proof exit 1 and
  the merge chained in one exec call without `&&`, so the merge ran despite
  the red proof. Rule, again: check proof exit BEFORE merging, unpiped, never
  chained with `;`. Both red proofs were base-bound (not green-list, not in
  check.js) and are now hermetic and green on master — the verdicts were
  never in question.
- **Master moved twice during the run** (arm 1's landing, then sibling Loop
  B's synergystall-b `0033d1a92`, evidence-only). Both rebases used the
  explicit current master SHA read fresh from the main tree; both merged
  ff-only cleanly.
- **Safe-commit index clobber** struck on worker commits in all three arms
  (merge-a evidence commit, policyswap all 3, findings (d+e)); repaired each
  time with the `git ls-tree -r HEAD | git update-index --add --index-info`
  pipe; commits always correct, no work lost.
- **Heartbeat script is slow** (~2–9 min per call); heartbeats still landed
  on all three trees. Reaper left other loops' dirty trees alone.
- **Worktree cap:** 12/16 active at run start; peaked at 14/16; 12/16 at
  closeout (my three trees released; the dead 2317Z mechanism-a tree and other
  stale trees remain for the reaper / their owners).
- **Sibling landing noted:** Loop B's synergystall-b (`0033d1a92`) — synergy
  stall spot-check, 0 discoveries in 94d, 11/57 synergies triggerless;
  tracker blank 2; the synergy fix shape is a design question (needs a Steve
  call or a dedicated build arm), NOT fixed in this run.

## Standing items carried forward (unchanged)

- Tribute still voiceless (0 mentions in 457 merge-a + 489 policyswap lines;
  0/8 tribute-ready on the merge leg).
- VetSays `/elder/` filter still matches "Elderberry" (106 noise lines on the
  merge leg) — next arm reusing the vetfirst instrument should tighten it.
- The three 0130Z findings are now all FIXED (this run's arm 3).

## Metric review (§14)

- Primary metrics were per-arm prereg decision rules (survived count bands),
  judged by each arm's analyzer; no re-scoring mid-run. The merge-a prereg's
  gloss ("collapse is inside the merge, its second-parent content") proved
  incomplete — the ancestry twist is documented in its §8, and the verdict
  stands on the count rule.
- The policyswap proof's `standingGuard ACCEPTS` leg and the merge proof's
  require-time guard were base-bound metrics in the proof layer, not the
  judged metric; both are now hermetic without loosening an assertion.
- Panel (§15): N/A per arm — instrument-only single legs on identical seeds,
  judged by the analyzer decision rules (same standing as survivalcontrol-b).
