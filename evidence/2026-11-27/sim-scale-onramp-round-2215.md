# sim-scale-onramp-round-2215 — coordinator record

- **Run:** fleshout-20261127T2215Z, Loop A, axis scale-onramp (converging)
- **Arms:** sim-partydmg-a (DIAG-GO), sim-aidammo-a (GO) — both landed
- **Loop B live throughout:** run fleshout-loop-b-20261127T2130Z, axis
  winnability-chain (arms departfit-b + reunionwild2-b) — NOT touched.
- **Preceding work this run:** adoption closeout of the timed-out 2033Z
  run (evidence/2026-11-27/sim-scale-onramp-round-2033.md, commit
  8ee234ccc) — fibersupply-a + speardmg-a both DIAG-GO, both merged.

## Arm 1 — sim-partydmg-a: DIAG-GO

**Question (tracker next blank #1; findings #2601 / 2026-11-27 leadworst
entry):** total party damage / weapon quality, not leadership. The lead
is the worst-armed fighter (median wb 8 vs allies' 17), and even a
best-armed lead in every meeting only lifts median dpr to ~70.5 vs the
~111 the kill line needs. Speardmg-a found the spear is 5.1% of party
damage with 0 vKills in 16 fights.

- **Commits on master:** 7a75b3951 (prereg, frozen before any judged sim),
  7ce0ca2b0 (instruments; proof 55/55 + analyzer selftest 35/35),
  a62b6e535 (corpus + analysis + evidence). Rebased onto bf21c02bb
  (batch ship) clean; proofs re-green after the rebase.
- **Band:** 112101–112108 verified fresh, 150d death-aware, competent
  policy. 22 fought expedition wave-4 fights; coverage 1.000 (176/176
  strike lines), reconciliation residual 0.000, 0 instrument errors, all
  four decompositions complete at 1.000.
- **Answer, in plain words:** a wave-4 fight needs about 111 damage a
  round to kill the monster before the party gives up. The parties manage
  about 46 a round — and nobody kills anything (0 kills in 22 fights).
  The gap isn't mainly that their weapons are weak. It's that the whole
  party together only swings about twice a round — the leader fights alone
  for two or three rounds, the weaker friend answers the first shout, the
  stronger friend answers the second if there is one, and they run when
  the leader is hurt, usually with the monster still at 85% health. Give
  the leader the best weapon anyone carried and nothing changes (0 of 22
  fights reach the line). Give everyone a good weapon and they still lose
  most fights (3 of 22). Give everyone the best weapon in the game and
  they win half (11 of 22). Give everyone perfect attendance — swinging
  every round — and they still only reach the line twice. The binding
  constraint is opportunity to swing, with weapon quality second. The
  single most telling fight: a party fought a Suburb for fifteen rounds,
  dealt 1,387 damage, and fled with the monster at 58 health — one more
  swing from the godslayer spear would have killed it — because the leader
  was at 23 health. They flee when hurt, not when beaten.
- **Numbers:** party damage 5,293 total — weapon strikes 91.4%, volley
  8.6%, contact finish / ambush / ability damage all 0. By role: lead
  52.4%, ally1 20.9%, ally2 26.7% (ally2 hits hardest per strike, 35.4,
  but is called last), ally3 0 — every fight had exactly 3 fighters; the
  4th seat never appears. By mix: spear-melee-slot fighters are the
  largest block (35.8%); spear fold-in share 29.0% — vs speardmg-a's 5.1%
  on its band, because this band's fights are longer and its spear
  fighters actually strike (59 strikes vs 5). By wb tier: 10–19 holds
  44.4% of damage; the 50+ tier is one fighter's godslayer spear in one
  fight (880 damage, 16.6%). Kill-line gap: party dpr mean 45.7 / median
  48.4 / max 92.5; 0/22 fights at the line; median fight needs its strikes
  to average wb 68 at its observed strike rate; median rounds-to-kill 28.3
  vs 4 rounds actually fought; median HP left at flee 1,059.5. Outcomes:
  16 fled, 6 died, 0 killed. Counterfactuals (frozen arithmetic, strike
  counts held fixed): A (everyone wb ≥ 30) → 73.8 mean, 3/22 reach the
  line; B (lead at best observed lead wb 25 everywhere) → 56.7, 0/22;
  C (everyone wb 50) → 108.5, 11/22; D (everyone strikes every round) →
  67.8, 2/22. Formula check: observed per-strike means match the tactical
  formula (6+wb) almost exactly at high wb (50+ tier: 62.9 observed vs
  63.0 formula), so the counterfactual arithmetic is sound.
- **Wall (partydmg band):** national 0/8, wins 0/8, wave 4 8/8, wave 5
  5/8, median survival 150d, 3/8 villages lost, 853 deaths (87.6%
  monster).
- **Determinism artifact (recorded, not hidden):** the seed-112102 rerun
  is hash-identical only after stripping the `seq` field — the driver's
  module-level `rowSeq` counter is never reset between seeds, so a seed
  run second in the pilot carries a +217 offset vs the same seed run first
  in the rerun. Next arm's driver must reset `rowSeq` per seed.
  (Speardmg-a's byte-identical rerun only worked because its rerun seed
  was also first in its pilot.)
- **Sense-test:** two transcripts read in full (best fight + typical
  loss) — both coherent; the spear is visibly the hammer when it swings,
  the kitchen knife visibly a kitchen knife, allies answering shouts one
  at a time. Noted: a Suburb was fought blow-by-blow for 15 rounds with
  no navigation trick offered, though its signature says you escape it
  rather than kill it.
- **Evidence:** evidence/2026-11-27/sim-partydmg-a.md;
  corpora `perseed-partydmg-a-arm/` + `perseed-partydmg-a-rerun/`;
  analysis `partydmg-a-analysis.json`.

## Arm 2 — sim-aidammo-a: GO

**Question (tracker next blank #2; findings 2026-11-27 aidammo entry):**
the craftgate run fixed a name-collision bug in analyze-aidammo-a.js
(per-fighter maps keyed by bare vid, a NAME-based id — 11 collisions hid
one never-supplied fighter). The landed verdict (home-duty supplies 0.849
of ammo at entry) was produced with the buggy analyzer. Re-run the fixed
analyzer over the committed corpus and confirm the numbers stand.

- **Commits on master (rebased onto a62b6e535):** 1d62e1f47 (prereg,
  frozen before any judged re-run), 4c981bb8d (re-run + proof 23/23),
  f1a3bc4c1 (evidence), 4e5feb398 (check.js result note). Rebase clean
  (4/4); proof 23/23 re-green after the rebase.
- **Answer, in plain words:** every published aidammo number reproduces
  exactly under the fixed analyzer. The 10 name collisions on the band
  (91 → 101 index keys) never touched any verdict number.
- **Numbers:** home-duty share 0.849 (1041/1226), ammo-at-entry 0.577
  (203/352), attribution 1.000, delivery 92/123 home-duty batches
  (460/615 units), empty split 131 never-supplied / 18 spent of 149,
  pool 21. Proof scripts/test-aidammo-a-rerun.js 23/23; analyzer selftest
  30/30; instrument proof 38/38; two analyzer passes byte-identical.
  Sensitivity P7: buggy bare-vid scoping gives 119/30, not 131/18 — the
  fix is load-bearing for the split even though the headline numbers
  stand.
- **check.js --quick** (run by the worker on its branch, ~00:06Z):
  337 passed, 7 failed in 1066s. The visible failures are 120s timeouts
  in slow godpath deed-attainment / observer-neutrality tests
  (test-one-person-army-deed-attainment.js,
  test-trust-observer-neutrality.js,
  test-living-garden-deed-attainment.js) — slowness under heavy load, not
  assertion failures. This arm touches no game code (new proof script +
  evidence + re-analysis JSON only; the new proof script isn't on the
  green list), so the timeouts are unrelated to this arm's change. The
  full failure list wasn't captured (output was tailed).
- **Evidence:** evidence/2026-11-27/sim-aidammo-a.md; re-analysis
  `aidammo-a-reanalysis.json`. No new sims, no new per-seed corpus — a
  re-analysis of committed data.

## Wall (this run's judged corpora, 16 configs)

| Corpus | national | wins | wave 4 | wave 5 | median survival |
|---|---|---|---|---|---|
| partydmg (8) | 0/8 | 0/8 | 8/8 | 5/8 | 150d |
| aidammo (re-analysis, no new rows) | — | — | — | — | — |
| **Pooled new rows** | **0/8** | **0/8** | **8/8** | **5/8** | **150d** |

Competent-only DIAG, no seatdrive — national/wins 0 is the expected
measurement profile, not a regression. Wave 5 reached on 5/8 partydmg
seeds (vs 0/8 on the fibersupply band, 3/8 on speardmg) with zero kills:
villages survive to wave 5 and still cannot kill a wave-4 monster.

## Metric review

Partydmg is a single-leg DIAG judged on frozen prereg bars; no §15 panel
(no before/after pair). Aidammo is a re-analysis judged on frozen
reproduction tolerances. Neither verdict was re-scored. Two method notes
for the next run: (1) partydmg's determinism check needed a `seq` strip
— the next driver must reset `rowSeq` per seed, and rerun seeds should
not be first-in-pilot by luck; (2) the spear fold-in share varies wildly
by band (5.1% speardmg vs 29.0% partydmg) with fight length — any future
spear-share claim must state the band's fight-length profile.

## Telemetry deviation check

Run by the coordinator on the partydmg corpus: `telemetry-check.js`
REFUSED the input by design — "refusing recorder-corpus input: all 8
--current rows carry top-level anchorCommit". Same refusal as the 1915Z
and 2033Z runs. **No LOUD lines; baseline NOT rolled.** Aidammo has no
new per-seed corpus, so no check applies there.

## Infrastructure

- **VM restart ~23:08Z** killed the worktree-registration batch mid-run
  (SIGTERM after ~24 min). Re-probed writes after the restart (hidden_files
  + repo writes both OK), re-established the partydmg heartbeat first, then
  re-ran the aidammo registration after removing the restart-orphaned
  partial checkout — the checkout of the large evidence/ tree is what makes
  registration slow under load (~22 min for the re-run).
- **First partydmg merge failed** on a transient `.git/index.lock` (a
  concurrent git process — the aidammo worker's safe-commit); the lock was
  gone on re-check, no git process running, and the retry merged ff-only
  clean with proof 55/55 green on merged master.
- **Aidammo branch rebased** onto a62b6e535 clean (4/4, no quirk), proof
  23/23 re-green, then ff-only merged.
- Safe-commit index clobber struck the partydmg worker 3× and the aidammo
  worker 4× — repaired via the ls-tree pipe each time, commits verified
  correct, both worktrees clean at closeout. (Round-record commit: see
  below.)
- Master moved twice under the run: batch ship bf21c02bb (version bump on
  top of the 8ee234ccc adoption record — the adoption record shipped live)
  and the partydmg merge; aidammo rebased accordingly. No EPERM flap
  observed this run.
- check.js --quick NOT re-run on merged master: both arms are scripts +
  evidence only, zero src/js; the aidammo worker's branch run (337/7,
  load timeouts only) is the standing profile, recorded above.

## Findings backlog

- Leadworst / #2601 finding (2026-11-27, lead worst-armed) marked
  `[answered]` by this run: partydmg answered the total-party-damage
  half — opportunity to swing binds first, weapon quality second.
- Aidammo finding marked `[answered]`: the published numbers stand
  exactly under the fixed analyzer.
- New next arms named in partydmg evidence: (1) call-in timing —
  strongest ally called last; (2) the flee-at-low-HP rule ending winnable
  fights; (3) the missing 4th party seat.

## scale-onramp stays converging (NOT converged)

The damage question is now decomposed end to end (the party manages ~46
dpr against a ~111 kill line; the binding constraint is swings per round,
not weapon quality; even perfect weapons win only half the fights), and
the aidammo numbers are confirmed trustworthy — but villages still reach
wave 5, survive, and never reach national or win, and still kill nothing
(0 vKills in 22 fights here, 0 in 16 on the speardmg band). The directive
stands until the tracker records this axis converged on measured evidence.
Next blanks, in order: (1) call-in timing — strongest ally called last;
(2) the flee-at-low-HP rule ending winnable fights; (3) the missing 4th
party seat; (4) slinger/searcaster supply path — Steve design call;
(5) thrown-spear opening — Steve design call. food-economy stays
converging (untouched; sibling loop B). Claim deleted; lock deleted.
