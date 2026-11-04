# Loop B 1830Z coordinator evidence — tendbelow CONFIRM NO-GO + standaccum DIAG-GO (merged locally, pending ship)

Run: fleshout-loop-b-20261104T1830Z. Axis: scale-onramp (winnability-chain
re-point). Loop A live on food-economy throughout (1836Z at run start,
then 1933Z exphurt-land) — NOT touched. No gate/price/deed change in
either arm. Zero src/js in both arms.

## Why these arms

Re-point queue check at run start: (1) arm-2 toggle run DONE
(togglepin-b, MORALE CREDITED, on master); (2) flee-repair build DONE
(fleerepair-a landed and confirmed GO 0820Z, on master). This run takes
(3) standing accumulation on gear-ready seeds, plus the freshest prior
B-run next blank, the tendbelow CONFIRM (1735Z run: tendbelow PILOT GO
banked, confirm owed).

## Arm 1 — sim-tendbelow-confirm-b: CONFIRM NO-GO (leg (a) only)

Prereg f9a778bc6 (before any judged sim): third fresh band 91301–91316,
16 seeds, 300d death-aware, baseline default leadcourt vs tendbelow
policy (decision-time classifier), guards (a)–(e) verbatim from the
pilot plus NEW leg (f) rung guard (armed rung downgrades <= baseline
rung downgrades, paired end-state scaleRank).

Verdict, judged exactly against the prereg (no re-scoring):
(a) FAIL — regressions 91301 (100→97d, C→D, loses the band's only
baseline wave-5 facing) and 91310 (111→72d, C→D, global→regional, the
pilot-91506 shape, now counted by leg (f)); (b) PASS — median delta 0
(bar >= −5); (c) PASS — pooled hold-share 0.997 vs 0.993; (d) PASS —
W4 13 vs 13, W5 2 vs 1; (e) PASS — drops 1 vs 1; (f) PASS — 1 downgrade
vs 5 upgrades. The pilot GO does not survive the confirm: tendbelow
is NO-GO as a lever, not banked, not killed as a mechanism — the
restriction still cuts tend calls 689→252 (−31% paid kcal) and saves
one collapsing seed (see below), but it regresses two bands, so it
must not be cited as the tend fix and must not ship as a default.

What matters beyond the verdict:
- Collapsing-seed question answered on n=1 — SAVED. Baseline 91311
  collapses day 96 (weak link trust 43→35, pantry 910, late grain to
  links at trust 89–91 while the weak link got unpaid attempts);
  armed 91311 holds to death at global (early below-bar grain banked
  the weak link to trust 59–63). Counterpoint: armed 91307 forms a
  polity that never formed under baseline, then collapses day 127
  with pantry 10,930 — a decay-timing collapse, not an empty-pantry
  one. Net drops unchanged (1 vs 1).
- Timeline divergence caveat: three never-seeds (91305, 91307, 91315)
  form polities only under armed, so paired deltas mix restriction
  effects with downstream divergence; armed ends with 11 diplomacy
  seeds vs baseline 8.
- Sense-test: baseline 91311's collapse is narrated but never names
  the bare pantry or unpaid attempts; armed 91311 has no collapse
  lines at all — the saved polity reads as an absence. Armed 91310's
  rung downgrade has no narration line, same as pilot 91506 — which
  is why leg (f) exists.
- Balance-panel compare returned "not a balanced-panel verdict / 0
  paired cases" on this recorder corpus; the per-seed table is the
  panel output for this trajectory metric, per prereg — no compare
  fabricated.

Wall (base → armed, 16 seeds): wins 0→0; survived to 300d 0→0;
national+ 5→9; global 5→9; regional 9→5; village 2→2. Table: not
instrumented (stated, not faked). Wave-5 unlocks 1→3; wave-5
ever-faced 1→2; wave-4 unlocks 13→13; wave-4 ever-faced 13→13.
Median survival 80.5→93.0d; max 111→166d. Deaths 920→972; combat
share 61%→63%; starvation 7→7. Readiness-5-ready days 22→10
(secondary, reported only).

Commits (rebased onto master 7bf600b90 clean, proof green, merged
--ff-only): dfe3fdafc prereg, 95bf01d2b instruments + proof 26/26,
148c4d65c evidence + 32-file corpus. Proof re-run green on merged
master (26/26). Arm evidence evidence/2026-11-04/sim-tendbelow-confirm-b.md;
corpus perseed-tendbelow-confirm-b/ (32 files).

## Arm 2 — sim-standaccum-b: DIAG-GO

Prereg 798a5fe3f (before any judged sim). DIAG recorder, zero src/js:
8 seeds (gearbar band 99101–99108 re-run on current master), 150d
death-aware, competent policy, ~860 daily snapshots, 0 instrument
errors, proof 13/13 (fixture + live smoke + determinism leg).

Verdict, judged against the prereg: (1) trajectory classified 8/8 —
7 mixed-shortfall, 1 war-starved; (2) top missing standing-income
source named with counts 8/8 — diplomacy on 7/8, war on 1/8;
(3) gear-ready days identified 8/8 (14–111 days each). DIAG-GO.

The standing answer, in plain words: on gear-ready days, standing is
whatever war and bread built — because bonds contribute nothing, on
every seed. Diplomacy isn't short, it's absent: 0 links ever created
on all 8 seeds (linkTotal 0 on every snapshot). There is no
near-miss pool to tend: no link a week from seasoning, none a few
trust from 40, none waiting on a polity. Links are born only through
player conversation answers, and competent play never accepts one;
no village-visit line appears in any seed's say sample. War carries
the climb (peak war 150/175/100/200/100/150/50/0) and bread helps
(peak plenty 60/40/80/0/40/0/0/20, never near its 100 gate-cap). In
the 30 days before each peak, diplomacy moved +0 on all 7 windows
with a window; war moved +50 to +150 via 2–6 ledger gains. Three
seeds clear 200 raw standing (355, 215, 225) yet sit at gated 199 —
the System says so aloud ("bonds 0… HELD… 0 of 2 veterans") —
because readiness-5's only short bar at peak is veterans.
Readiness-5-ready days: 0/8. Gear bars are met from day 2 on most
seeds, when standing is 0–20; the 99107 pattern from gearbar does
NOT recur on current master (99107 now peaks at 50, never faces
wave 4) — only this run's numbers are cited.

Wall (8 seeds): wins 0/8, national 0/8, table 0/8 (scaleRank
"village" on all 8). Wave-4 unlocks 6/8, wave-4 faced 4/8, wave-5
unlocks 0/8, wave-5 faced 0/8. Median run-days 116 (99101 and 99104
survived to the 150d horizon; the rest lost). Death causes were not
instrumented by this arm and are not reported.

Commits (rebased onto master 148c4d65c clean, proof green, merged
--ff-only): ee4d2040d prereg, fcd811a6b instruments + proof 12/12,
7bfd53559 pilot + evidence, dd3618ee0 evidence hash note (its
recorded hashes are pre-rebase hashes; rebased tips are the ones
cited here). Proof re-run green on merged master (13/13). Arm
evidence evidence/2026-11-04/sim-standaccum-b.md; corpus
perseed-standaccum-b/ (8 files). Finding appended to
hidden_files/sim-findings.md (diplomacy-absent item).

## Telemetry deviation check

REFUSED by the tool on both corpora (recorder-corpus shape, same as
the pilot and prior runs); baseline NOT rolled, no LOUD lines, no
investigation item. No --allow-recorder-corpus workaround used.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- The rung guard (leg f) worked as designed: it caught the 91310
  global→regional downgrade as a counted event even though the arm
  still passed leg (f) on the aggregate (1 downgrade vs 5 upgrades).
  Future diplo preregs keep leg (f); the open question is whether a
  single rung downgrade should fail a confirm by itself — this run
  did not need to decide it, because leg (a) already failed.
- Tendbelow's confirm failure is a two-band story, not a one-seed
  story: the pilot band passed (a) clean while this band regressed
  two seeds. A future tend variant must pre-register a band-count
  rule (e.g. must pass (a) on two of three bands) rather than
  re-litigating single bands.
- Standaccum's gear-ready-day definition (all four readiness bars
  met on a snapshot) is the right unit for the standing question;
  its 30-day prior-window deltas cleanly separate war income from
  diplomacy absence. The next standing arm should reuse the
  recorder, not rebuild it.

## Infrastructure

- Master moved once under the run (Loop A 1836Z landing 7bf600b90);
  both branches rebased clean (zero file overlap), proofs green
  after every rebase and on merged master.
- Coordinator error, recovered with nothing lost: after the
  standaccum worker finished, the coordinator ran
  worktree-release.sh as done-merged BEFORE the --ff-only merge
  succeeded (it had failed on the moved master), then removed the
  worktree. The branch (all 4 commits) survived intact; recovery
  was a fresh registered landing worktree (sim-standaccum-land-b),
  checkout of the stranded branch, clean rebase, proof green,
  merge, release, branch deletion. Lesson: never release before
  the merge output is verified — release is the last step, not
  part of the merge attempt.
- Worktree registration slow again (~7 min first tree, ~13 min
  second, ~4 min landing tree) — slow, not failed.
- Safe-commit index clobber hit all worker commits + (per worker
  reports) repaired via HEAD-blob cacheinfo each time; commits
  verified correct. No clobber on the coordinator commit (verified
  below).
- Both trees released done-merged, branches deleted, final reap
  run, main tree clean at closeout. No push, no bump, no live
  verification (ship loop owns deploys).

## Scale-wall numbers (this run's judged corpora, 48 runs)

Wins 0/48. National+ 5→9 on the tendbelow band (diplomacy ranks,
not scale-onramp national); standaccum national 0/8. Table 0
everywhere it was instrumented. Wave-5 faced: tendbelow 1→2,
standaccum 0/8. Full seat: 0 everywhere. The wall did not move:
the tend lever fails its confirm, and standing's missing income
is now named (bonds never form) rather than measured as a
shortfall.

## Next blanks, in order

1. A link-seeking probe: why competent play never forms a bond
   (standaccum blank 1). Until bonds form, every tend lever works
   on an empty pool.
2. Veterans-production, sharpened as the real 199-hold cause
   (standaccum blank 2): three seeds clear 200 raw standing and
   hold only on veterans.
3. A future tend variant, if any, pre-registers a band-count rule
   for leg (a) (two of three bands) instead of single-band
   re-litigation; tendbelow as measured is NO-GO and must not ship.
4. Carried: LIVE-SIM fallback firing, 12-seed guardrail re-test of
   the approach variant on 99601–99612, BELONG clear on a
   belongseek substrate, 99101 hold-beat re-finding per anchor,
   wave5faced label rename. NO gate/price/deed arm follows.
