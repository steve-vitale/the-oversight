# Loop A round fleshout-20261120T1705Z — scale-onramp (ADOPTION closeout)

Run fleshout-20261120T1705Z, Loop A, axis scale-onramp. The run timed out at
7200s before closeout; this is the adoption closeout. Coordinator dead
verified (no WT_RUN_ID processes, no live coordinator); lock run_id
fleshout-20261120T1705Z matched (created 2026-11-20T17:05:00Z). Writes probed
OK at adoption start — no flap live. All three arms LANDED, merged locally
pending ship. No push, no version bump, no live verification.

Bases per arm (workers registered at different times): draftmiss on the
committed presence corpus; lend base f43abed42; roll35 base 4f91af362 (ship
version bump). Master at adoption start: d352834ef (lend addendum). Roll35
merged ff-only to 2d12ced4a. Sibling Lane A landed journey-deepening r246
(c4ccc247d) during the adoption; the round-record worktree sits on that tip,
so no rebase was needed for the record.

## Arm 1 — sim-draftmiss-a: NO-GO (DIAGNOSTIC), landed 0b0e2a078

Pure diagnostic on the already-committed presence corpus (band 107051–107058,
150d, competent verbatim). No game code, no new sims. The question: the
presence arm's pool counters claim 21 distinct draft-miss day|mid pairs —
does the lend (gun to the fighters already going) answer what the misses ask?

Reproduction gate PASS, exactly: 64 poolDraftMiss rows collapsing to 21
distinct (seed, day, mid) pairs, the same numbers the presence arm reported.

Classification: (a) sheltered holder 2, (b) post-flee resting 0, (c) stale
pre-tick read 0, (d) duplicate-row inflation 0, (e) no tick fight at the
pooled slots (raid fights) 7, (f) UNCLASSIFIED 12. Primary metric (all 21
classified, 0 unclassified) FAILED — run NO-GO, honestly. Overcount
quantified: 64 rows / 25 distinct joined fights = **2.56x** (3.05x per pair;
pairs undercount fights, 21 pairs carry 25).

In plain words: the "misses" mostly dissolve. Seven pairs are proven
home-defense raid fights — the raid fought the monster and the raid's
defender draft never asks the roaming draft whether the gun-holder should
lead. Twice the gun-holder was correctly locked inside during a muster while
others fought outside. The 12 unresolved pairs lean the same way on
sense-testing (all 16 seed-107052/107054 encounters byte-identical on the
control leg; monsters at or next to the haven; 5 of 7 flagged holder regions
contain the haven; victor out on away-trips on his pair days). The draft's
true failure count is most likely zero — it fired exactly once in the whole
presence corpus.

Verdict on the lend: **it answers a different question than the misses ask
— and a better one.** The misses ask why the holder wasn't drafted into the
tick; the lend asks how the gun gets into the wave-4+ fights actually
happening. The corpus supports the lend's premise (victor_lopez led four
pair-day fights on 107054 while the gun sat with sheltered yuki_mori;
devon_okafor led three while the gun sat with away-tripping victor_lopez).
Two caveats the lend must carry: no transfer path exists in live play (0
inter-villager gun transfers in 16 seeds), and the fights the lend would
feed are largely RAID fights — so its real question is whether the gun
belongs with raid defenders.

Instrument: analyzer selftest 25/25, proof test green. Findings filed:
fightOrigin mislabels raid fights as 'world-tick' (raid side); the raid's
defender draft never consults the presence draft; the 21 pairs diagnosed.
Evidence: evidence/2026-11-20/sim-draftmiss-a.md (+ draftmiss-a-analysis.json).

## Arm 2 — sim-lend-a: NO-GO (PARTICIPATION), landed fe29d8e0c + addendum d352834ef

The lend: at a wave-4+ fight launch, when the picked lead is unarmed-or-empty
and a living armed holder stands in earshot (tile or adjacent) but is not the
lead, the holder lends the gun (+ all its cells) to the lead for that one
fight, returning after. Pilot band 107051–107058, 150d, competent verbatim;
substrate both legs VETREENGAGE/PARTYSIZE4/FLEEREPAIR2/FIGHTALLY2/SENSEEXPED/
BOWOPEN/SPEARGATE/GUNRATE/CELLGATE = 1; ctl LEND unset, arm LEND=1. 16 runs,
0 errors.

**It fires exactly once in 8 seeds** — seed 107057, day 87: Naran (armed,
adjacent) lends the gun + 2 cells to Yara (picked lead, unarmed) against
algorithm ("Don't-Look", wave 4, 750 HP), aid-routed. Volley fires: 2 shots,
1 hit, 64 damage. Yara dies round 1 — the same fight and death on the
control leg; the lend did not cause the death. **The gun never comes home:**
gunReturned false although the lender was alive and the borrower was alive
at return time — the field engine strips a dead fighter's equipped weapon
during the fight, before the try/finally return runs. The gun was granted
day 86, lent day 87, lost day 87; Naran's 64 holder-days on the control leg
never happened on the arm leg. Seven of eight seeds run byte-identical.

Frozen bars: holder-days 130 vs 194 (floor ≥ 40 PASS — but FELL arm-vs-ctl,
the lend itself consumed the supply bar); armed-holder entries 2 vs floor 3
FAIL; armed volleys 2 vs 1 PASS; guardrail separated — (i) borrower alive
0/1 (0%) FAIL, (ii) deaths/engaged 3.79 ≤ 4.34, median 146d = 146d PASS;
starvation 4 vs 4 PASS. Verdict NO-GO, kind PARTICIPATION (bar 2 fails; bar
4 also fails). Confirm band NOT warranted: one lend in 8 seeds would measure
the same empty pool at greater cost, and the one lent fight already shows the
return-path defect. Balanced-panel compare: review_required (village deaths
+1.125/run, regression_watch — the +9 on 107057 averaged over 8 seeds).

Proofs 41/41 pre-revert (test-lend-a.js); gunrate 39/39, cellgate 12/12
against the rebuilt substrate; analyzer selftest 58/58; fidelity PASS
(control reproduces the cellgate ARM corpus on every simulation field, two
documented base-drift exclusions). Coordinator addendum d352834ef: post-revert
guard in test-lend-a.js — lever-on sections skip cleanly when helpers are
absent; post-revert record 3/41 (2 wave fixtures + analyzer selftest pass),
no assertion loosened. check.js --quick after revert: 339/5, standing
pre-existing profile, none attributable. Game code reverted (0 LEND/GUNRATE/
CELLGATE refs in src/ after revert).

Findings filed: #2628 (the lend fires once in 8 seeds — opportunity-bound,
not logic-bound; the floor was priced from the presence band, not a measured
lend-opportunity pool — the next arm needs the pool counter frozen first);
#2629 (the lent gun is lost when the borrower dies — any re-test must prove
the return from a dead borrower in a fixture first); #2630 (the corpus
encounter log cannot show lend/return lines — recorder-timing blind spot);
#2623, third sighting (searcaster volley still reads as archery).
Evidence: evidence/2026-11-20/sim-lend-a.md (+ prereg, panels, corpora).

## Arm 3 — sim-roll35-a: NO-GO, adoption-landed 2d12ced4a

The 35% blind craft roll on the spear-serve path (finding #2590): raise the
first-make roll from 35% to a learned 60% (85% once the bow is known) for
spear-holders crafting the crude bow from departure-site materials. Pilot
band 107051–107058, 150d, competent verbatim; 16 runs, 0 errors.

**The roll works; the volleys don't follow.** Fail share in the scoped class
0.667 → 0.286 (scoping exact); servings 5 → 10. But **0 served-bow volleys**
in 17 pair-inclusive engaged meetings. The ammo wall: 5 engaged served
fights all entered with 0 ammo; the two best-armed served leads (5 and 8
arrows) both evaded. Consistency bar FAILS (residual 4, departures +9.3%) —
adjudicated a day-2-cascade metric artifact, with a rates-based revision
proposed for the next run. Guardrail + starvation PASS. Game code reverted;
instrument + evidence only.

Proof record on the pre-revert base: test-roll35-a.js 41/41 GREEN, analyzer
selftest 73/73. Adoption re-run on the rebased tip (2d12ced4a, onto
d352834ef): analyzer selftest 73/73; test-roll35-a.js 14 passed / 27 failed
— every failure a flag-on check requiring the reverted ROLL35 code (same
precedent as depmat); test-depmat-a.js 22 passed / 21 failed — every failure
a flag-on check requiring the reverted DEPMAT code. The verdict holds on the
rebased tip. Branch diff vs master: instrument + evidence only, 0 src/js
changes.

Wall (band 107051–107058): national 0/8 both legs, table 0, wave 4 8/8,
wave 5 4/8, median survival 148.5d ctl / 150d arm, deaths 775/774,
community lost 4/3. Next lever for #2590 in order: (1) ammo, (2) evade.
Evidence: evidence/2026-11-20/sim-roll35-a.md (+ prereg, panels, corpora).

## Wall (round, judged corpora)

| arm | national | table | wins | wave 4 | wave 5 | median survival | deaths |
| --- | --- | --- | --- | --- | --- | --- | --- |
| lend-a (8 seeds × 2 legs) | 0/8 both | 0 | 0/8 both | — | maxWave 5 → 4 on 107057 only | 146d both legs | 829 → 838 |
| roll35-a (8 seeds × 2 legs) | 0/8 both | 0 | 0/8 both | 8/8 | 4/8 | 148.5d → 150d | 775 → 774 |

Nothing reaches national or the table on either band. Draftmiss ran no sims
(pure read of the presence corpus).

## Gate status

No fresh full `check.js --quick` run on the merged tip in this adoption —
the round-record commit is evidence-only (one .md file, no src/js change)
and each arm carried its own gate: lend 339/5 after revert (standing
pre-existing profile, 0 attributable); roll35 proofs re-run on the rebased
tip reproducing the evidence record exactly (see above). No gate-relevant
failure is attributable to this round.

## Telemetry

`telemetry-check.js` refused recorder-corpus input on both arms' per-seed
corpora (exit 2, designed refusal — same as the 0515Z adoption): recorder
corpora are compared with sweep-compare tables, never against a run baseline.
No LOUD lines, no baseline rolled. The arms carry their own balanced-panel
compares (both review_required, no material signal beyond the lend's deaths
regression_watch, which the frozen guardrail adjudicates).

## Held vs landed

LANDED (evidence-only; both levers reverted): sim-draftmiss-a 0b0e2a078,
sim-lend-a fe29d8e0c + d352834ef, sim-roll35-a 2d12ced4a. HELD from this
round: nothing. Standing held items unchanged (sim-targetless-b,
sim-deadsuppress-b, and the other held branches).

## Infrastructure (adoption)

- sim-lend-a cleanup: its worktree dir was a partially-deleted leftover
  (18,861 files, 0 dir-only, all 27 arm files hash-matched to the merged
  branch blobs) — dir removed, branch deleted (was d352834ef).
- sim-roll35-a: rebased cleanly onto d352834ef (2 picks, no sequencer
  quirk), proofs re-run on the rebased tip, ff-merge exit 0 to 2d12ced4a,
  released done-merged, worktree removed, branch deleted.
- Round-record worktree: the first registration attempt was killed by the
  ~12-min exec-session SIGTERM mid-checkout (registry lock held by a live
  19:08Z reaper run whose `git status` sat D-state 6+ min) and left a
  partial-checkout husk (evidence/ only, 7.0G, no .git) — removed per the
  1030Z precedent (fresh worktree from the branch, never repair in place).
  The second attempt queued behind a sibling Lane A journey-scale
  registration (checkout 8+ min); restarted detached via setsid nohup and
  completed. Worktree on master c4ccc247d.
- Safe-commit index clobber check on the round-record commit: see commit
  note (repaired via the ls-tree -r pipe if struck).

## Next blanks, in order

1. **#2599 contact — the raid-defender question.** The raid picks defenders
   by health/proximity and never consults the armed holder standing next to
   the fight; the lend's real question is whether the gun belongs with raid
   defenders. Before any lend re-test: fix the borrower-death sink (#2629 —
   prove the return from a dead borrower in a fixture first) and freeze a
   lend-opportunity pool counter (the participation floor was priced from
   the presence band, not a measured pool).
2. **#2590 serve — ammo first, then evade.** A served bow needs arrows at
   departure (5 engaged served fights entered with 0 ammo); then evade on a
   served, quivered bow. Do NOT re-test the roll (proven: 60% doubles
   servings) or knowledge seeding (proven non-binding — the wall is
   materials, not knowledge).
3. **Instrument:** raid telemetry in the recorder (raid firing, drafted
   monsters, defender draft) + the presence draft's own fired-row telemetry
   — to resolve the 12 unclassified draft-miss pairs; roll35's rates-based
   consistency revision for the next run.
4. **Standing walls unchanged:** launch decision + damage, deed gate after
   national, standing-199 stall.

## Merge

- sim-draftmiss-a 0b0e2a078 — ancestor of master (landed by the run).
- sim-lend-a fe29d8e0c + d352834ef — ancestors of master (landed by the run).
- sim-roll35-a 2d12ced4a — ff-merged by this adoption.
- Round record: this file (commit TBD at merge time).
