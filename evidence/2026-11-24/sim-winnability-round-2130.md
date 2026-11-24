# sim-winnability-round-2130 — Loop B adoption closeout (fleshout-loop-b-20261124T2130Z)

Run fleshout-loop-b-20261124T2130Z, Loop B, axis winnability-chain.
ADOPTION closeout of the 1930Z round's two stranded fresh arms
(allystart + fleecall), both spawned into the write flap and left live
by the 1930Z run with its claim file as the anti-duplication record.
Stale-lock recovery: none needed — no B lock existed at run start
(the 1930Z B lock was deleted by the 2015Z A run at its closeout);
this run created its own lock + claim (2130Z) and adopts the 1930Z
claim (retired to .DEAD at closeout). Loop A live on scale-onramp the
whole run (2115Z round: ammosupply adoption + aidammo + spearopen) —
NOT touched. Master moved 4 times under this run (A landings:
spearopen 2cc1b0e78/f3fdd54df, aidammo a02a127a1/e694593f7); both arms
rebased clean onto the moving tip, proofs re-run green after every
rebase.

## Arm 1 — sim-fleecall-b: DIAG-GO, MERGED 8e709b837

Finding #2602, "WINNABLE FIGHTS END ON THE FLEE CALL, NOT ON DAMAGE"
(basedmg DIAG-GO). DIAG, corpus re-read — no new sims, no game-code
change. The 1930Z worker finished the analysis but its /tmp drafts
were wiped by the 21:32Z machine restart; only the prereg + evidence
survived verbatim in
`hidden_files/fleecall-b-stranded-20261124/`. This run re-derived the
instrument from the frozen prereg and verified it reproduces every
number before landing.

Re-derived instrument: `scripts/analyze-fleecall-b.js`
(selftest 19/19) + `scripts/test-fleecall-b.js` (ALL PASS — live
staged flee parses 41 = engine 41 exactly). Reproduction verified by
the worker AND independently by the coordinator from the committed
state: B1 20/20 classified, 0 unclassified; B2 pool 20; B3 1/20 =
5.0% within one round (109505 d118 Network Note, monster at 95 HP,
one round from a kill); medians lead HP 19, monster HP remaining
963.5, rounds-to-kill 19 (finite n=18); variant split 11 hopeless /
9 floor / 0 learn / 0 committed-floor; full 20-row per-meeting table
0 diffs; correlations −0.64 / +0.45 / −0.64 / +0.52 / −0.57 / −0.57;
died comparison median 1059 HP remaining; determinism byte-identical
across two runs; proof green. One honest footnote, recorded in the
evidence adoption note: determinism stdout is 16,582 chars, not the
stranded draft's 5,279 — that figure described the lost original's
shorter output format, not a judged number.

B4 nuance (coordinator-verified, by design): the analyzer run
standalone WITHOUT `--external selftest,determinism,proof` reports
DIAG-NO-GO B4-INSTRUMENT ("external checks not supplied") — the
selftest itself asserts exactly this shape. With the externals
supplied after they pass, the verdict is DIAG-GO, all four bars.
This is not a discrepancy; it is the instrument refusing to
self-certify.

Verdict meaning: only 1 of 20 fled launched fights ended with the
monster within one round of death. The typical fled fight ended with
the monster at 963.5 HP and 19 rounds from a kill. The flee call does
not track the monster's remaining HP: it fires on the lead's survival
— bravery floor (9/20, median lead HP 19) or the "hopeless" race
(11/20) judged on an IMAGINED fight, as if the lead wore
protection-4 armor, while the leads on this band wear protection
27–37. On live numbers the sharpest case was winning by a wide margin
(monster 0.8 rounds from death, lead 5.7 rounds from dropping) and
still fled. The DOORFLEE2 comment in the same file already names this
failure mode for door fights and sketches a live-numbers hold. Next
arm (named by the evidence, not built here): a BUILD arm giving the
hopeless read the same live-numbers guard, re-measured on this band
(within-one-round share + hopeless-flee count; the guard should move
hopeless flees at high lead HP, not floor flees at 5–10 HP).

Landing: branch sim-fleecall-b, prereg 65fe22642 → hash fill
1ae0beb70 → instrument 72c5839a4 → evidence 9df2cb527. First ff-only
merge attempt refused (master had moved: A's spearopen f3fdd54df);
rebased clean (4 commits, zero overlap — spearopen touches only
spearopen files), proof + selftest + analyzer DIAG-GO re-verified on
the rebased branch, merged ff-only as 8e709b837. Tree released
done-merged, branch deleted, worktree removed. Evidence body below
the adoption note is byte-identical to the stranded file.

## Arm 2 — sim-allystart-b: NO-GO (CONCEPT-DEAD as a kill lever), EVIDENCE-ONLY LANDED

Finding #2600, "ALLIES NEVER START IN THE FIGHT" (basedmg DIAG-GO).
BUILD, default-OFF lever (ALLYSTART=1): `src/js/villager-agency.js`
helper `allyStartAtDoor()` makes `expeditionMonster` pass
`allyFromStart: true`; off-mode byte-identical. The 1930Z worker
built the lever + instrument (proof 31/31) and completed the control
leg (8/8 seeds, 0 errors) before its session ended; this run's
adoption worker ran the arm leg, analyzed, and judged against the
frozen prereg.

Judged (8 seeds 109501–109508, 150d, competent verbatim, frozen
substrate; pair-inclusive engaged launched wave-4+ meetings):

| Bar | Ctl | Arm | Bar | Result |
|---|---|---|---|---|
| Kill share | 0.000 (0/27) | 0.040 (1/25) | ≥ 0.15 | FAIL |
| Median damage/round | 25.7 | 80 | ≥ 60 | PASS |
| Pool floor | n=27 | n=25 | ≥ 10 | PASS |
| Starvation (total / villager) | 1 / 0 | 0 / 0 | ≤ ctl+2 | PASS |
| Median survival | 142.5d | 150d | ≥ 0.8× ctl | PASS |
| Instrument errors / proof / selftest | 0 / 31-31 / 10-10 | — | 0 / green / green | PASS |

§14a: CONCEPT-DEAD as a kill lever. The mechanism fired perfectly —
allies in from round 1 in 25/25 meetings (vs 0/27), median round-1
strikers 0→2, door meetings 0→25, party deaths 7→1, monster flees
0→2, damage more than tripled (median dpr 80 vs 25.7) — and the kill
bar still missed 1/25 vs 0.15. Fights end with the party fleeing at
~76% of monster HP dealt (21/25 vFlee); the binding constraint is now
damage-per-survived-round vs HP and staying power, i.e. arm-2 toggle /
flee-repair territory, not entry timing. The single kill (109503 d122
THE EATER, 11 rounds, 1075 damage) and the single party death (109501
d71 Reunion, Sam reciting a poem mid-fight) both read as people.
Control reproduces the basedmg corpus EXACTLY (0/27, 25.7, 20/27
vFlee) — zero master drift. §15 panel: review_required (community
loss 0.625→0.25; village-deaths regression_watch is
interval-straddling noise; national 0→0, table wins 0→0).
Metric review (evidence §14): the kill-share bar was set against a
mechanism that moves damage, not kills — a future re-judgment should
use damage/round (or wins incl. monster flees) as primary, kill share
secondary; coordinator/Steve call, not a re-score of this run.

Landing (evidence-only, ammosupply precedent): the lever commit is
NOT on master and the branch is NOT merged. Cherry-picked the four
evidence-only commits onto master in order, each verified: prereg
ba7ce0b09, control logs 9fae99e63, control corpus 16023e0d5, arm +
analysis + evidence 55c776319. Verified: lever commits 15ff9f030 /
2f53e7e0c are NOT ancestors of master; main tree clean. Branch
sim-allystart-b HELD (head ceb47d001, rebased onto f3fdd54df, proof
31/31 post-rebase, worktree clean) with its worktree registered and
heartbeated at closeout — the lever stays default-OFF there for a
possible future re-prereg with a damage-based primary bar. Evidence
citation note: the evidence file's corpus-commit hashes (26dc48147 +
e2559f975) are the PRE-rebase originals; both resolve as git objects,
superseded on master by the cherry-picks above.

## Wall numbers (this round's judged corpora)

- Fleecall (basedmg corpus restated): national 0/8, wins 0/8, wave-4
  8/8, wave-5 4/8, median survival 142.5d.
- Allystart ctl: national 0/8, wins 0/8, wave-4 8/8, wave-5 4/8,
  median 142.5d, community lost 5/8, surviving 150d 3/8.
- Allystart arm: national 0/8, wins 0/8, wave-4 8/8, wave-5 4/8,
  median 150d, community lost 2/8, surviving 150d 6/8.
- Villages still reach wave 5, survive, and never reach national or
  win on this band. The arm makes them survive longer and die less in
  fights; it does not make them kill wave-4 monsters or climb scale.

## Telemetry deviation check

`node scripts/telemetry-check.js` on the allystart per-seed globs:
REFUSED (recorder-corpus input — all rows carry top-level
anchorCommit; same refusal as basedmg/tbrefuse in the 1630Z/1930Z
runs). No LOUD lines; baseline NOT rolled. Fleecall corpus is the
same basedmg recorder corpus already refused in the 1930Z run.

## Infrastructure

- Write flap: cleared on the 21:32Z machine restart; coordinator
  probes (/tmp, worktree, git ref) green at 22:18Z; NO recurrence
  this run. The 1930Z flap window (~19:48Z–21:32Z) is what stranded
  both arms; this run is the recovery.
- Registration: sim-fleecall-b took ~8 min — the `git worktree add`
  checkout (`git reset --hard`) ran 2:22 CPU under load ~9.5 before
  completing. Not stuck, just slow; the register script's reap-first
  step is the known stall under load (AGENTS.md 2026-11-23).
- Reaper: skipped on a held registry lock (8 consecutive skips at
  run start; the 2015Z A run recorded the same jam). No cleanup this
  run; recorded, not fixed here.
- Safe-commit index clobber struck on ALL fleecall landing commits
  and on the allystart worker's commits; repaired each time via the
  `git ls-tree -r HEAD | git update-index --add --index-info` pipe,
  commits verified correct, no work lost.
- Rebase stop-at-pick quirk did NOT strike (one clean fleecall
  rebase, one clean allystart rebase).
- Loop A's 2115Z tracker entry reports "main-tree dirt" (uncommitted
  allystart files seen 23:15–23:17Z): that was this run's
  evidence-only cherry-pick in flight (CP4 stages ~1.1M lines before
  committing); the files are committed as 55c776319 and the main tree
  was verified clean immediately after. Not dirt, not a sibling
  edit — transient staging, now landed.
- No full-repo check.js gate (zero src/js landed; fleecall proofs
  green on merged master, allystart proof 31/31 green on its held
  branch).

## Findings

- #2600 (allies never start): ANSWERED — the lever built on it is
  CONCEPT-DEAD as a kill lever (sim-allystart-b NO-GO, evidence on
  master). Mechanism proven; kill claim dead. Next territory is
  damage/staying power, not entry timing.
- #2602 (winnable fights end on the flee call): ANSWERED — measured
  cleanly (sim-fleecall-b DIAG-GO, 1/20 within one round; P4
  hypothetical is the mechanism). Next arm is the live-numbers
  guard BUILD on the hopeless read.

## Tracker state

winnability-chain stays converging (NOT converged): the entry-timing
lever is killed as a kill lever and the flee call is measured (it is
the last wall on only 1/20 fights), but villages still reach wave 5,
survive, and never reach national or win. Next blanks, in order:
(1) arm-2 toggle run — the field-fight damage+staying toggle
(re-point queue item 1, tracker blank #4, still without a verdict);
(2) flee-repair build — the tbfinish wasted turns (failed flees that
never succeed, zero-tile moves, rage re-pressed instead of striking);
(3) live-numbers guard on the hopeless flee read (fleecall's named
next build); (4) call-sounding muster instrument (titanmuster: the
call is never sounded, muster count structurally 0); (5)
launch-fitness fresh band (departure-stamping driver: HP + weapon +
loaded state + ammo per member); (6) standing accumulation on
gear-ready seeds (re-point queue item 3 — check
sim-standing-gearready-b first; a standing DIAG landed today).
scale-onramp stays converging (untouched; sibling loop A).

Merged locally, pending ship: fleecall-b 8e709b837 (full merge) +
allystart-b evidence-only ba7ce0b09 / 9fae99e63 / 16023e0d5 /
55c776319. Lever held on branch sim-allystart-b (head ceb47d001).
Claim 1930Z retired to .DEAD; claim 2130Z + B lock deleted at
closeout.
