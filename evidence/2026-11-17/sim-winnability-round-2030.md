# sim-winnability-round-2030 — Loop B run fleshout-loop-b-20261117T2030Z

**Axis:** winnability chain (wild ally-join → wave-4 kills → veterans →
readiness-5 release → wave-5 facing → full seat) · **Loop:** B
**Run:** fleshout-loop-b-20261117T2030Z (scheduled 14:30 CST) ·
**Master at start:** 1aba45367 · **Master at closeout:** 5079bee22
(before this round file) · **Claim:**
`hidden_files/lever-claims/fleshout-loop-b-20261117T2030Z.json`

## Stale-lock recovery (run start)

The 1830Z Loop B lock was 120 min old at guard (20:58Z); its trees'
heartbeats were 43 min (sim-fightallycap-b) and 92 min
(sim-partysize-b) stale — dead by the 15-min guard and past the 90-min
fallback. Lock deleted, 1830Z claim retired to `.DEAD` with a note.
Both 1830Z workers were DONE with committed work; the coordinator had
died before closeout. Loop A was live on scale-onramp the whole run
(2025Z claim: profilegate adoption + conditional confirm) — NOT touched.

## Arm 1 (recovery) — sim-fightallycap-b: pilot GO, LANDED db8a289bf

Adoption of the dead 1830Z run's arm 2. Verdict per its frozen prereg
(B1 PRIMARY mean joining allies ≥ 1.5, B3 guardrail, B4 proof, B5
panel, instrument clean; B2 unjudged): **GO on all frozen bars —
READY TO LAND**. B1 1.625 (n=8) vs control exactly 1.0 (n=18); 37
second-ally joins across 6 of 8 seeds; B2 unjudgeable (n=1); B3 PASS
(total deaths 665 vs 744, expedition 191 vs 237); B4 22/22; B5 PASS
with investigation (community-loss watch 1/8 → 3/8, no lever mechanism
found); instrument CLEAN (missingHp 0/0). Wave-5 unlocks 5/8 vs 2/8,
national standing 5/8 vs 2/8 on the pilot band — see the confirm arm
below for why that wall claim does not carry forward.

Landing: branch base adad111ca was an ancestor of master; master had
moved to 1aba45367 (convoTopics.js only in `src/`, zero overlap with
fieldFights.js/party-wiring.js). Rebasing the branch onto 1aba45367
was clean (new tips dded39f58 + db8a289bf). Coordinator re-proof on
the rebased tip: `test-fightallycap-b.js` 22/22 green;
`check.js --only fight` 10 passed / 4 failed — the 4th failure was
`test-real-fights` timing only (100 fights 2080ms vs the <2s bar);
re-run standalone 15/15, 601ms — load flakiness under sibling sweeps,
not a regression. The other 3 fail identically on pristine base
(zombie-fight `Text is not defined`, inffight-class sense failures,
break-monsters3 24/2). ff-merged as db8a289bf; worktree released
done-merged, branch deleted. One untracked partial gate log
(`sim-fightallycap-b-gate.log`, 1 line, killed `check.js --quick`
attempt) was removed, not committed. Full evidence:
`evidence/2026-11-17/sim-fightallycap-b.md`.

## Arm 2 (recovery, held) — sim-partysize-recorder-b: NO-GO, lever HELD

The dead 1830Z run's arm 1. Frozen-band re-run judged **NO-GO on
revised B2** (size-4 mean share 0.0574, n=4 < 0.10); instrument CLEAN
(missingHp 0, recMismatch 0); B1/B3/B4/B5 pass. The recorder repair
worked; the damage answer is no — the 4th seat adds no damage because
it cannot join the fight (the ally cap, fixed by arm 1 above). **NOT
merged.** Branch sim-partysize-b held at tip 9950cc998 at recovery;
worktree heartbeated and kept for the re-judgement arm below. Full
evidence: `evidence/2026-11-17/sim-partysize-recorder-b.md`.

## Arm 3 (this run) — sim-partysize-allycap-b: NO-GO (B2 unjudgeable), HELD

Re-judgement of PARTYSIZE4 with the ally cap lifted: frozen band
103601–103608, 150d, competent; legs ctl `VETREENGAGE=1 PARTYSIZE4=1`
vs arm `+FIGHTALLY2=1`; prereg frozen 21:26Z before sims.
**NO-GO — B2 unjudgeable (n=1 < 3); lever stays HELD, not killed.**
B1 PASS (7 quad launches; c3 13→13); B2: 3 size-4 launched fought
meetings, only 1 captured share — a vKill of a 21-HP Eater finished
solo by Ella Johnson (seed 103607, day-127 quad, no ally struck); the
other two were no-contact evades. The analyzer's printed VERDICT
reads GO (its formula treats unjudged B2 as GO); the frozen prereg
overrules it — B2 must be judged AND pass, so a single kill cannot
pass the damage question. B3 PASS (expedition 207 ≤ 282.7, total 676
≤ 811.8); B4 PASS (test-partysize-b.js 52/0,
test-partysize-recorder-b.js PASS, test-partysize-allycap-b.js 11/0);
B5 PASS with review (community-loss watch 0.375→0.5 investigated, no
lever mechanism); instrument CLEAN (missingHp 0/0; recMismatch 1 ctl
/ 5 arm, Pack Hunt — finding #2497). The launched-mean share 0.40
(n=5) is a trap metric (one vKill at 1.0 dominates) and was not used.
**NOT merged.** Branch sim-partysize-b tip a4d06edf4 (after the
coordinator renumber commit below); worktree clean, heartbeated, kept
for a future re-judgement. What a GO needs: a band (or a lever) that
produces ≥3 size-4 *fought* meetings with captured shares. Full
evidence: `evidence/2026-11-17/sim-partysize-allycap-b.md`.

## Arm 4 (this run) — sim-fightallycap-confirm-b: GO, LANDED 871e3aaa0

Fresh-band 12-seed confirm of the landed FIGHTALLY2 (measurement-only,
no src change, no default flipped). Fresh band 103801–103812 (verified
fresh), 150d, competent; ctl `VETREENGAGE=1` vs arm `+FIGHTALLY2=1`.
**GO on all frozen bars.** B1 PASS — mean joining allies **1.9**
(n=10; 9 meetings with 2 allies, 1 with 1) vs control exactly 1.0
(n=14), stronger than the pilot's 1.625. B2 PASS, judged this time —
launched fought-meeting mean share **0.2547** (n=6) vs control 0
(n=1); pilot was unjudgeable on n=1. B3 PASS, wide margin — total
deaths 812 vs 1044 (limit 1148), expedition 99 vs 323 (−69%, limit
355). B4 PASS — proof 22/22 on the final tip. B5 PASS with
investigation — panel decision `review_required` with **zero
regression rows**; community loss flat 0.5 → 0.5; village deaths/run
87 → 67.67. Instrument CLEAN — 12/12 files both legs, 0 errors,
missingHp 0/0, recMismatch 0/0. Second-ally joins all origins: 65
(control 0); second ally dealt 2,902 total damage.

**Wall caveat — the pilot's wall gains did NOT replicate.**
Wave-5 unlocks 6/12 armed vs 8/12 control; national standing 6/12 vs
8/12; median survival 143 vs 147.5 days; survival even 6/12 both; no
table, no wins either leg. The frozen bars don't judge the wall, so
the verdict stands — but the pilot's wall claim (wave-5 5/8 vs 2/8,
national 5/8 vs 2/8) must not be carried forward. The death split
explains it: home-front deaths flat (721 → 713) while expedition
deaths collapse. The lever saves hunters, not the village at home.

Landing: branch rebased onto master 3ba09cec4 (master had moved past
its 4f360b67f base via profilegate NO-GO revert + journey-landing
r143); coordinator re-ran proof 22/22 on the rebased tip, ff-merged
as 871e3aaa0; worktree released done-merged, branch deleted. One
incident: the pilot's analyzer hardcoded an 8-seed file-count gate,
so the first confirm run said NO-GO on file-count alone with all bars
passing; repaired by parameterizing `EXPECTED_FILES` (default 8,
pilot behavior unchanged) — measurements byte-identical between runs.
Full evidence: `evidence/2026-11-17/sim-fightallycap-confirm-b.md`.

## Wall numbers (this run's judged corpora)

| Corpus | National (standing ≥200) | National rank | Table | Wins | Wave 4 | Wave 5 | Median survival |
|---|---|---|---|---|---|---|---|
| fightallycap pilot, ctl (8) | 2/8 | 0/8 | 0/8 | 0/8 | 7/8 | 2/8 | 151d |
| fightallycap pilot, arm (8) | 5/8 | 0/8 | 0/8 | 0/8 | 8/8 | 5/8 | 150d |
| partysize-allycap, ctl (8) | 1/8 | 0/8 | 0/8 | 0/8 | 7/8 | 1/8 | 151d |
| partysize-allycap, arm (8) | 4/8 | 0/8 | 0/8 | 0/8 | 8/8 | 4/8 | 148.5d |
| fightallycap confirm, ctl (12) | 8/12 | 0/12 | 0/12 | 0/12 | — | 8/12 | 147.5d |
| fightallycap confirm, arm (12) | 6/12 | 0/12 | 0/12 | 0/12 | — | 6/12 | 143d |

No village reaches the table or wins on any leg. The win is still
gated far above what a second ally alone moves.

## Village assessment, in plain words

A party that travels together can now actually fight together — the
second ally slot works, and on a fresh band it works better than the
pilot showed (1.9 joining allies, a quarter of a wave-4 monster's
health per launched fight, expedition deaths down by two-thirds). But
the villages are not safer at home: the same number of villages
collapse, and the pilot's hint that the lever lifts villages up the
ladder vanished on fresh seeds — armed villages reach wave 5 and
national standing *less* often than their control twins. The lever
saves hunters. It does not save the village. And the fourth seat is
still waiting for its verdict: three times now a party of four has
walked out the gate and the damage question has come back thin — once
for a broken recorder, once for a measured shortfall, now for too few
fights that actually engage. The launched parties that do meet their
monster too often turn and run in the first round without landing a
blow; that is the next thing to fix.

## Findings

- **#2497 [open]** — Pack Hunt damage is a second channel the HP
  recorder doesn't count (Loop B arm sim-partysize-allycap-b).
  Beastmaster Pack Hunt harries for 2–4/round, not in `rec.mDealt`;
  6/6 recMismatch rows explained exactly from fight logs (≤2.7%
  denominator effect, touches no B2 row). Fix: fold the pack-harry
  total (or a `rec.mPackDealt` field) into the recovery.
- **#2500 [open]** — Launched parties meet a wave-4 monster and flee
  in round 1 without landing a blow, six times in four days (Loop B
  arm sim-partysize-allycap-b). Control leg, seed 103602: a trio
  launched day 90 vs The Suburb, met it 6 times over days 90–93 —
  every fight 1 round, 0 damage, vFlee (five) or vDie (one), monster
  HP unmoved at 581. The flee-repair arm's territory (tbfinish wasted
  turns). Next arm: flee-repair build (re-point queue item #2).
- **Numbering collision, resolved:** my worker filed the flee finding
  as #2498, colliding with Loop A's selected-blocked #2498 (filed in
  the same window; Loop A's entry sits at sim-findings.md line 2498,
  its homebody-fiction #2499 at line 2499). Renumbered the flee
  finding to **#2500** in sim-findings.md and in the held branch's
  evidence (commit a4d06edf4 on sim-partysize-b); Loop A's #2498
  (selected-blocked) and #2499 stand as filed. The tracker entries
  citing #2498 for selected-blocked (Loop A 2025Z) and #2500 for the
  flee finding (this run) now agree with the file.

## Telemetry deviation check

`telemetry-check.js` on the confirm corpus: REFUSED recorder-corpus
input by design (exit 0, same documented refusal as the 1729Z and
2025Z rounds — recorder corpora are compared with sweep-compare
tables, never against a run baseline). Baseline NOT rolled. Wall
numbers above are reported directly from the analyzers.

## Infrastructure

- Registry-lock contention: the confirm worktree registration took
  534s (a sibling heartbeat held REGISTRY.lock); the script completed
  cleanly (exit 0) once the lock cleared — no retry, no manual edit.
- Runtime restarts killed two arm legs mid-sweep (confirm arm driver
  after 5 seeds; allycap arm leg at 5/8 seeds); both resumed for the
  missing seeds only, exact, with the driver's refuse-to-overwrite
  guard catching one smoke file first.
- Safe-commit index clobber struck 6 times this run (2× confirm
  worker, 3× allycap worker, 1× coordinator renumber commit);
  repaired with the documented `ls-tree -r` pipe each time, commits
  verified correct. Main-tree index clobber also
  hit Loop A's just-landed round file
  (`sim-scale-onramp-round-2025.md`, staged-deleted + untracked,
  byte-identical to HEAD blob d463755a1) — repaired the same way;
  status and diff HEAD empty after.
- Rebase stop-at-pick quirk: NOT struck this run (3 clean rebases).
- No EPERM flap this run. Git very slow under sibling load (status
  176s-class delays seen by the 1729Z run's note; worktree remove
  82s, registration 534s).
- Observation (not mine to fix): Loop A's 2025Z claim file is still
  present on disk although its round evidence (5079bee22) says
  "Claim deleted; lock deleted." Its coordinator evidently died after
  the tracker update. Left untouched — the next Loop A run's guard
  will retire it.

## Convergence state

Winnability chain stays **converging (NOT converged)**: the second
ally slot is built, proven, and confirmed on a fresh band — parties
now fight as parties — but no launched party has killed a wave-4
beast on any band, the table is unreached, wins are 0 everywhere,
and the fourth seat's damage question is still unjudged after three
attempts. Scale-onramp stays converging (Loop A live, untouched);
food-economy stays converging (parked). Next blanks, in order: (1)
**flee-repair build** (re-point queue item #2; finding #2500 is its
territory — launched parties that will not fight waste the launch);
(2) partysize B2 re-judgement on a band/lever that produces ≥3
size-4 *fought* meetings (more seeds is the blunt option; the evade
side is the sharper one); (3) Pack Hunt recorder fix (#2497) before
any future damage bar that uses recovered HP; (4) selected-blocked
classification is Loop A's blank #1 — do NOT duplicate. Claim
deleted; lock deleted. Evidence: this file.
Arms merged locally, pending ship: fightallycap-b (db8a289bf),
fightallycap-confirm-b (871e3aaa0). Held, unmerged:
sim-partysize-b (tip a4d06edf4).
