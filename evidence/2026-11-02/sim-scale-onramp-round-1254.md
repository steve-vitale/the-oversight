# Loop A 1254Z round — scale-onramp: creekwood wide screen + closecommit decay trace

Run: fleshout-loop-a-20261102T1254Z, axis scale-onramp. Claim written
before any sims; deleted at closeout. Pre-flight: main tree clean at
b82b298ca, disk 23%, reaper removed nothing sibling-owned (7 active
trees, all correctly refused as dirty/active). Sibling Loop B live on
food-economy at run start (1233Z claim: homeveto-band + vetobudget) —
NOT touched; B's trees and arms were never entered. Master moved under
this run twice (sibling journey-scale r71 landing, then this run's own
creekwide merge); both worker branches were rebased in their own
worktrees before merging (creekwide hit the known stop-at-pick quirk at
pick 2 — worktree clean, pick unapplied — recovered with
`git rebase --continue`, both commits exactly once; closedecay rebased
clean as a single pick). Zero src/js changes in either arm. Merged
locally, pending ship.

## Arm 1 — sim-creekwide-a: WIDE SCREEN COMPLETE, 0 confirm candidates banked

Follow-up to 1155Z blank (1). Map-gen-only geometry probe, one process
per seed, 4 parallel, 5m06s wall, 0 failures. The 59 prior seeds were
NOT re-screened or re-scored.

Pre-registered (worker prereg, committed before any screening):
completed 300-seed screen of 97690–97989 + baseline classification of
every new tier2C_both nomination; a confirm candidate banks ONLY on a
baseline that fails to arrive AND two-creek-wall geometry (lair heard +
>= 1 march + 0 arrivals + >= 1 bridgeBlocked day + lair tile a
needsBridge creek). The confirm itself (creekwood arrival on >= 50% of
confirm seeds) is a FOLLOW-UP run, not this arm; no confirm rate is
claimed from geometry or unclassified nominations.

Result: 300/300 screened (241 new: 97708–97789, 97811–97889,
97910–97989). New nominations (33): tier2C_both [97753]; tierL_64only
18 seeds; tierM_54only 14 seeds. 300-seed totals: tier2C [97753,
97898], tierL 24, tierM 17.

Baseline classification (creekdetour ARM=base, 180d) of the new tier2C
plus every plausible two-creek-wall case on a non-row-4 series:

| seed | baseline verdict |
|---|---|
| 97753 (tier2C) | NEVER-LOCATED — lair null, 0 marches, 0 calls, 0 bridgeBlocked days; 92d, won/national/table |
| 97746 (tierL + row-5 pair) | NEVER-LOCATED — same zeros; 90d, won/national/table |
| 97855 (tierL + row-5 pair + row-4 pair) | NEVER-LOCATED — same zeros; 90d, won/national/table |
| 97844 (tierL + row-5 pair) | ARRIVED — lair (7,4), first march d117, swimmer way, 1 call; 152d, won/national/table |
| 97913 (tierL + row-4 pair) | ARRIVED — lair (8,4), first march d87, detour way, 1 call; 103d, won/national/table |

Bridge-blocked days: 0 on all 5, as on all 10 prior nominations — no
screen baseline has ever recorded one. Remaining new L/M nominations
were NOT baseline-run, with stated reason: single-needsBridge
geometries with no adjacent needsBridge pair anywhere in the corridor
cannot be a two-creek wall on any row.

Confirm candidates banked: 0. The screen found one new two-creek case
(97753), but like the only prior one (97898) it never hears a herald —
its double-creek corridor holds no lair. Two-creek geometry predicts a
lair 0/2; confirm-case yield is 0/300 screened. Banking 12 cases at
this yield needs thousands of seeds, or a nomination signal that
predicts lair hearing, which map-gen alone cannot give. This is a
screening-yield result, not a bridge failure (pilot bridge leg still
1/1). Sense-testing: the never-located villages still win via
national/table (the herald is not the only road); both arrived runs
read coherently (lair found, call sounded, villages answer by name
with trust-holds narration).

Proof + coordinator verification note: worker proof
scripts/test-creekwide-screen-20261102.js ran 13/13 pre-screen. On
the rebased/merged tip it reads 11/13 — investigated, NOT a
regression: the test reads the live ledger and asserts it still has
59 rows, i.e. it is a pre-screen proof that cannot pass once the
merged ledger lands. Independent coordinator check against the
pre-screen ledger in git: all 59 prior rows present byte-identical,
241 new rows added, tier2C [97898] preserved with [97753] added.
Follow-up: that test needs a git-prior read to stay green post-merge;
the merged ledger itself is verified. Commits: prereg+proof
3d09b00b1, screen results 2a1cf6575 (rebased hashes; pre-rebase
0c2014da2 / 76f89f757).

## Arm 2 — sim-closedecay-a: DECAY ISOLATED — succession eats the committed blades

Follow-up to 1155Z blank (4). Pre-registered: daily gate
decomposition call→contact on 97330; GO = the decaying component
named with dated values on call day, a mid-window day, and refusal
day, reproduced on an identical second run. GO MET.

Daily gate decomposition, 97330 closecommit (1155Z figures reproduce
exactly — call d97, gate 11, 12 MUSTER-GATE refusals d110, 0 fights):

| day | allied (living) | Haven valid | judged gate | ready |
|---|---|---|---|---|
| d97 call | 8 | 3 | 11 | yes |
| d98–d102 | 8 | 3 | 11 | yes |
| d103 | 8 | 2 | 10 | yes |
| d104–d105 | 8 | 2 | 10 | yes |
| d106 | 8 | 0 | 8 | NO |
| d110 refusal | 8 | 0 | 8 | NO |

Mechanism: the allied coalition does NOT decay — 8 living blades on
every traced day d97–d122, so post-call trust/opinion/arrears
movement (muster hungry daily at 0 kcal fed, trust bleeding, arrears
appearing d106, Emberhold quota 6→2 by d109) is excluded as a cause:
the muster list is fixed at call. The decaying component is Haven
only, via succession. d103: the bearer dies in the wild and the
mantle passes to Vera, a committed blade — dawn
`titanReconcileBearer` drops the new bearer from `muster.haven`
(bearer exclusion: the new bearer is the player now, not "one of
Haven's committed"). Vera is alive and in roster on d103; she stops
counting by becoming the bearer, not by dying. d106: three bearer
deaths in one day — Vera dies, mantle to Nora (committed blade 2),
Nora dies, mantle to Aroha (committed blade 3), Aroha dies — and the
one-episode commit leg never re-taps, so the gate never recovers.
Full daily gate series reproduces identically on a second 97330 run
under the identical arm.

Second seed check, 97338: call d113 gate 9 — already short (only
Thornfield answers 6; Emberhold/Stonebridge refuse on arrears
4508/4000 despite trust 84 — the primary-arrears trap, unchanged).
Commit adds 3 → 9, then the same chain runs (d115 bearer death →
mantle to committed Dmitri, 9→8; d117 Dmitri, Clinton, Elif fall,
8→6; refusals d118 at gate 6). Allies constant 6. On 97338 the gate
could never have closed anyway (6 allied + 3 Haven cap = 9 < 10) — a
ceiling, not a decay.

Policy prototype measured, NO-GO: `commitrefresh` (re-commit on drop,
perception-lawful: own muster record + verb only, no roster reads —
asserted in proof). v1 never fired (bug disclosed in arm evidence:
early return while gate met meant the drop was never recorded;
fixed in v2, v1 record kept). v2 on 97330: d106 commits exactly 1
blade (Ivy — only 1 volunteer free), gate 9, still short; d107 Ivy
becomes bearer and drops out the same way; refresh finds "No one is
free to march"; contact refused at gate 8, 0 fights. Refresh restores
1 blade for 1 day, then the chain eats the replacement and the pool
is empty.

Disposition note (read before reusing these files): this arm lands
two policy files on master as trace/prototype scaffolding, NOT as
landed game changes — `scripts/policies/musterclose.js` (recovered
verbatim from deleted-branch commit ef378b534; its 1155Z killed
verdict stands) and `scripts/policies/commitrefresh.js` (measured
NO-GO). Neither is in any default policy stack; no game behavior
changed. Proof: scripts/test-closedecay-a.js 29/29 on the rebased
tip. Commit: 3f8d5568f (pre-rebase 01bb814ce).

## Village assessment (plain words)

Two villages, two lessons. The creek village's map holds a second
double-creek corridor — but no monster ever calls from behind it, so
the village marches nowhere and still wins another way; a bridge
 nobody needs is not a road. The muster village does everything
right — eleven blades counted aloud, friends fed, debts named — and
then loses the fight before it starts, not because its friends
leave, but because its own people keep becoming the hero: each time
the bearer falls, the mantle lands on one of the three villagers
pledged to march, and the pledge dies with the promotion. By the
day the army should meet, all three pledged villagers are gone —
one promoted, then all three dead — and no refresh can replace
them, because the village has no one left free to march.

## Reachability verdict

- Two-creek lair arrival via takeWood-funded bridges: unchanged —
  reachable (97396, 1155Z); this run banks no new confirm case.
- Trusted-link close of the muster gap: NOT demonstrated — and now
  explained one layer deeper: even a closed gate (11) is eaten by
  bearer succession before contact on 97330.
- Full seat / wave-5 fought in normal play: unchanged by this run
  (wall metrics 0 on all screen baselines' pre-seat windows except
  the pre-existing won/national/table on non-herald roads; full
  seat 0, wave-5 fought 0 in this run's judged legs).

## Telemetry deviation check

Both invocations (plain and --sweep-rows) REFUSE the input:
"recorder-corpus input: all 23 --current rows carry top-level
anchorCommit, so they are sweep recorder rows, not runs" — the same
refusal class as 1030Z/1135Z/1155Z. No LOUD deviation lines, no
metric deviation to investigate, baseline NOT rolled (reseeding a
scale-wall baseline from recorder corpora would be wrong).

## Balanced panel (§15 — limitation reported)

No panel compare .md attached, deliberately, for the same reason as
mustergap/titanroute/creekdetour/creekwood: the panel registry has
no creekwide/closedecay composition, so running it would measure
something else. Instrumented driver records are the measurement;
wall metrics above are reported from them.

## Metric review (for the NEXT run, not these verdicts)

- Creekwood's confirm bar (bridge-assisted arrival on >= 50% of
  two-creek-wall confirm seeds) stands, but its case-yield plan must
  change: 0/300 at map-gen yield means the next screen needs a
  lair-predicting signal or a thousands-seed budget, not another
  300-seed band. Future screens should also flag adjacent-NB pairs
  on ANY corridor row (this run's row-5 series and (6,4)-(7,4) pair
  were invisible to row-4-only tiers).
- The closecommit gate decomposition replaces "coalition decay" with
  "succession eats commitment" as the muster-gap mechanism on
  97330/97338. A refresh-style fix cannot close it while the
  replacement pool is 1 blade and the chain eats replacements.
- The creekwide proof test's 59-row assumption is stale post-merge
  (see Arm 1 note): a post-merge-green proof must read the prior
  ledger from git, not the live file.
- check.js --quick NOT re-run: zero src/js in both arms, standing
  280/7 pre-existing profile recorded by sibling runs this cycle,
  both arm proofs green on merged master (creekwide 11/13 explained
  above; closedecay 29/29).

## Infrastructure

- safe-commit index clobber hit worker commits on both arms
  (repaired via HEAD-blob cacheinfo, commits verified correct, main
  tree clean) and the creekwide rebase; coordinator commit verified
  clean after.
- Rebase stop-at-pick quirk (creekwide pick 2, both done and todo
  lists) recovered with `git rebase --continue` per the repo lesson;
  all commits exactly once on current master.
- Sibling build tree build-lootflee appeared mid-run (loot taper +
  flee fix, per the 2026-11-02 monster-commitment ruling) — not
  touched, no file overlap with either arm.
- Final reap: no sibling trees touched; main tree clean at closeout.

## Next blanks, in order

1. STEVE-CALL candidate: should a committed blade be allowed to
   become the bearer (and thereby leave the muster)? This run proves
   the mechanism; it does not rule whether succession-eating-muster
   is the village's story working as designed or a leak. No src/js
   fix proposed until ruled. (Also appended to sim-findings.md.)
2. Succession-order rule: why the mantle passes through committed
   blades first on both seeds (party order? standing?) — decides
   whether the chain is systematic or seed luck.
3. Creekwood confirm case-yield plan: lair-predicting signal, or a
   thousands-seed screen budget — not another 300-seed band.
4. Primary-arrears trap (forgiveness/settlement verb, steve-call
   candidate) — unchanged, still blocking 97338-class closes.
5. Roster-cap / free-adult constraint on trusted quotas.
6. Tend saturation / saturated week.
7. Surprise-refusal seed for refusal-memory (still unfired in sim).
8. Bridge-walk narration line (voice queue); why a march stops one
   tile short.
9. Muster upkeep draws the scholar's pack, not village stores (0
   kcal fed daily while the pantry holds thousands) — trust-bleed
   blank, not a gate blank. (Also appended to sim-findings.md.)
10. Why 12 contact attempts fire on d110 vs 3–4 on route-arm contact
    days (recorded, not isolated).
11. Carried from 1155Z: call standing-cost trace; 97489-style
    no-contact arrivals; blocked-then-arrived mechanism (97369,
    97409).

scale-onramp stays converging (NOT converged): the road to the lair
is solved and its confirm screen is now complete at 300 seeds with
zero banked cases, but the muster that must follow it is eaten by
the village's own succession before contact — and the full seat
stays unreached. food-economy untouched (sibling Loop B lane).
Rotation left at 3 (convergence work does not cycle it).
Claim deleted; lock deleted.
Merged locally, pending ship (both arms landed; refresh prototype
NO-GO, musterclose scaffolding only).
Coordinator evidence: evidence/2026-11-02/sim-scale-onramp-round-1254.md
(this file).
