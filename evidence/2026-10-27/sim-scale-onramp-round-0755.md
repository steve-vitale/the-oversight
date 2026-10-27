# sim-scale-onramp-round-0755 — coordinator evidence (run fleshout-20261027T0755Z)

Loop A run, axis scale-onramp (topmost non-converged axis, not named in any
live claim at run start). Sibling loop B live on food-economy throughout
(0630Z claim, ledgerbound + residual2b, NOT touched). Both arms DIAG /
MEASUREMENT ONLY, zero src/js, separate worktrees. Merged locally, pending
ship. Do NOT push, do NOT bump — the ship loop owns deploys.

## Pre-registration (coordinator header; each arm's own prereg binds its legs)

- Axis: scale-onramp. Arms: sim-w4funnel-repin-a (0615Z next blank 3:
  w4funnel control re-pin on the current base) and sim-finalloss-rebase-a
  (0615Z next blank 1: known-instance choice).
- Coordinator call made this run, recorded in the run claim BEFORE any
  sweep: RE-BASELINE the final-loss known instances from the current-base
  corpus, NOT pin to the old base. Pinning to the old base would perpetuate
  instances proven unreachable on current master (73672 day 148, 73673 day
  112); the adopt corpus already classifies 16 current-base cases.
- Shared band: seeds 73671–73678, tableseat-nowait policy, 180d
  death-aware horizon (180 is the cap, not a fixed horizon). Shared
  current-base band (0615Z): national-ever 7/8, national-final 5/8, table
  invited 5/8, entered 4/8, wins 4/8, wave-4 5/8, wave-5 0/8, median 130d,
  deaths 284, starvation 2. Each arm ran its own plain replication first;
  armed bands had to reproduce plain EXACTLY or stop.
- GO thresholds: per-arm preregs (funnel: >=95% arrivals classified +
  largest loss named + living-vs-cumulative decomposition + sense read;
  finalloss: all 3 new known instances re-derive + all finals classified
  in F1–F13 under the tightened F9 + adopt gates). A miss is NO-GO, never
  re-scored mid-run.

## Arm 1 — sim-w4funnel-repin-a: DIAG-GO (commits 47ad44867, dbf826c0e, a4db60aa4)

Rebased onto master tip fc57dd0bd (journey-scale r43) clean before sweeping.
Recorders reused verbatim from current master; proof 17/17 (repin) + 48/48
(analyzer), coordinator re-ran both green before merging and green again
after the landing rebase.

New current-base control table (plain == armed, EXACT vs 0615Z on every
field): wins 4/8, national-ever 7/8, national-final 5/8, table invited 5/8,
entered 4/8, wave-4 5/8, wave-5 0/8, median 130d, deaths 284, starvation 2.

The October 25 funnel answer does NOT still stand as stated. Headlines
unchanged, funnel underneath tripled: arrivals 31 (was 11) — tile-entry 28,
scripted-titan 3, fled-recovery 0; median arrival day 133 (was 139),
median days available 27 (was 7). Outcomes 31/31 classified (100%):
still-present 23 (74.2%), killed-by-player-fight 2 (6.5%), melted 5
(16.1%), departed 1 (3.2%), unknown 0. Stages: never-fought 20 (64.5%,
still the largest loss, share down from 81.8%); fought-not-killed 9
(29.0% of arrivals, 81.8% of the 11 fought); killer-not-living-at-end 1
(50% of kills). Living-vs-cumulative: divergence max 1 — 73671's killer
died (d121 kill, dead by the d137/d138 points), 73677's killer lived to
the win; not-counted killers 0; both kills now trace to world arrivals
(the old band's kill came from a non-world door, 1/1, now 0/2).
Future funnel numbers must be judged against THIS re-pinned table, not
the October 25 census. Evidence: evidence/2026-10-27/sim-w4funnel-repin-a.md
+ prereg + perseed-w4funnel-repin-a/.

## Arm 2 — sim-finalloss-rebase-a: DIAG-GO (commits f6c26ef5b, 969d30048)

New known-instance set, all real cases from the adopt corpus, all
re-derived on current master (seqs match the adopt corpus exactly, no
renumbering): K1 F1 Haven pile-up (73671, day 167, origin maxHp 150);
K2 RESTORED-exact (73675, day 169, 1200); K3 REMOVED-AFTERWARDS (73677,
day 112, 850). Old instances retired, not substituted. Plain replication
EXACT vs the adopt band on every field; armed identical. Corpus 16/16
classified in F1–F13, zero forced, zero UNEXPLAINED: RESTORED (F6) 7,
BLOCKED (F1) 6, REMOVED-AFTERWARDS (F8) 3. Under the tightened F9, F9 = 0:
the adopt corpus's single old-definition F9 reclassifies as
delayed-RESTORED (its lift ends in K2's final fight, visible in the
post-run count, flagged oldF9 for traceability). Proof 131/131,
coordinator re-ran green before merging. The final-loss question is
closed on current master with a re-derivable baseline: no monster simply
blinks out. Evidence: evidence/2026-10-27/sim-finalloss-rebase-a.md +
prereg + perseed-finalloss-rebase-a/.

Two honest corrections recorded in the arm evidence (neither changes the
verdict): the prereg's K2 citation misstated the adopt final fight (the
actual final is fmgpspj04_6rwvac, chain 3, reproduced exactly); future
preregs should assert known-instance fightIds in the proof.

## Wall numbers (both arms, identical band)

National-ever 7/8, national-final 5/8, table invited 5/8, entered 4/8,
wins 4/8, wave-4 5/8, wave-5 0/8, median survival 130d, deaths 284,
starvation 2. Wave-4 kills 2 total (73671: 1, 73677: 1). Death-cause
shares: villager combat 43.3%, villager-vs-villager 24.6%, player arena
12.0%, expedition 7.0%, sickness 3.5%, wound-that-wouldn't-close 2.5%,
ambush 2.1%, villager monster 1.8%, starvation 0.7%, dehydration 0.7%,
singles ~0.4% each. The scale wall is unchanged on this base: national
reached, the table entered and won on this band, wave 5 still 0/8, full
seat still unreached.

## Village assessment, in plain words

The village on this band is the one from the 0615Z run, unchanged: it
climbs to national standing, gets invited to the table, and wins lesser
seats — but it never meets the wave-5 bar, because wave-4 monsters
mostly never get fought at all. Of 31 wave-4 arrivals, 20 were never
fought (they linger, melt away, or are still standing when the run
ends) and only 2 were killed. The bottleneck is not that the village
loses fights — it is that fights rarely happen, and when they do, the
killer often does not stay alive to count. The final-loss side is now
settled: when a monster vanishes after a fight, there is always a named
reason, most often the Haven pile-up (six monsters pinned to the one
Haven tile, the first one restored blocking the rest) — a real
mechanism, not a bug, whose intended-ness is still a design question.
Nothing here changes what a player would feel; both arms are measurement
only, so no [needs-eyes] flag applies.

## Reachability verdict

Waves 1–4 reachable on this band (wave-4 5/8); wave 5 unreachable (0/8);
Arc IV gates the table, not national alone (unchanged from 1955Z);
national, table invitation, entry, and lesser wins all reached; full seat
unreached. Villagers act like people on the sampled threads (finalloss
sense replay: Reunion mirrors the player's moves; mantle-transfer grief
beats read coherently) — with the standing caveat that narration
replays shift trajectories and are never census.

## Blanks filled or documented

- FILLED (this run): w4funnel control re-pin on the current base (new
  control table above — the October 25 numbers are retired as the
  judging baseline); final-loss known-instance re-baseline (new K1/K2/K3
  set, re-derivable); F9 definition tightening (adopted, F9 = 0).
- DOCUMENTED (findings backlog): melt as a real funnel exit (5/31,
  proposed next arm sim-w4melt-a); arrival-surge cause unknown
  (arrivals tripled Oct 25 → Oct 27 with headlines identical — code
  archaeology, not a lever); Haven pile-up + F1 narration silence
  remain Steve-call territory if they touch the restore rule or
  narration. The F9 backlog item from 0615Z is now FIXED by this run.

## Metric review (MEASUREMENT.md §14, mandatory)

Pre-registered metrics bound both arms and both passed without
re-scoring. Two metric notes for the NEXT run: (1) future final-loss
preregs should assert known-instance fightIds in the proof (the K2
citation slip was caught only because the rerun reproduced the fight
exactly); (2) the tightened F9 definition should stand for future
final-loss arms, with the oldF9 flag kept traceable for one more run.
The telemetry-check comparison (below) is a known-broken comparison
for these corpora, not a metric failure — see its note.

## Telemetry deviation check

Ran node scripts/telemetry-check.js against baseline
hidden_files/telemetry-baselines/scale-wall.json for both corpora
(--metrics national,table,wins,exiled). Both corpora: 2 LOUD lines
(national 12->0, wins 16->0). Both are the known ingestion artifacts
documented in every recent run: the script counts files / top-level
paths, while per-seed rows carry nationalEver/won at band level (both
arms' proofs re-derive band national-ever 7/8, wins 4/8), and the
WINSEAT-regime baseline's own note forbids this comparison against a
pre-seat substrate. Baseline NOT rolled, no investigation. No exiled
LOUD line.

## Infrastructure

- Worktree registration was slow (~8 min for two trees), not blocked:
  the main tree is 5.7G, so each checkout copies a large evidence corpus,
  under sibling I/O contention (a sibling check.js run and a sibling
  git pull). No EPERM flap on this run's writes; both merges were clean
  fast-forwards, no ref surgery.
- Safe-commit index clobber hit all worker commits (known class);
  workers repaired via HEAD-blob cacheinfo and verified; coordinator
  merges verified clean (git status empty after each merge).
- Master moved twice under the run from sibling lanes (journey-scale
  r43 before run start, journey-landing r60 after landing) — zero file
  overlap with either arm; w4funnel rebased onto the moved master with
  proofs green post-rebase before its merge. Sibling trees
  (sim-finalloss-a dead tree with uncommitted changes, B-loop trees)
  were NOT touched, NOT released, NOT removed.
- check.js --quick was NOT run: repo AGENTS.md asks for it after every
  change, but both arms are zero-src/js evidence/scripts only, and the
  prior two runs documented the same skip (check.js --quick produced no
  output in 8+ min under sibling-test contention). The arm proofs
  (131/131, 17/17, 48/48, all coordinator re-run) are the attributable
  verification for this change set.
- Rotation left at 3 (convergence-directed work overrides the lever
  rotation; scale-onramp is still the blocking axis).

scale-onramp stays converging (NOT converged): wave 5 still 0/8, full
seat unreached, and the funnel's new shape (never-fought 64.5%, melt
16.1%) is the next measurement target, not a lever verdict.
food-economy untouched (sibling loop B). Next blanks, in order: (1)
sim-w4melt-a — fight-classify every melt, test raid/siege-day
clustering of shared removal days; (2) arrival-surge code archaeology
(Oct 25 → Oct 27 spawn/standing/readiness changes); (3) Haven pile-up
intended-behavior + F1 narration silence — Steve-call if they touch
the restore rule or narration. Claim deleted; lock deleted.
