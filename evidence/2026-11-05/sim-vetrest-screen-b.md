# Evidence — arm sim-vetrest-screen-b (Loop B run fleshout-loop-b-20261105T1830Z)

BUILD arm. Axis: scale-onramp / winnability chain. First-killer survival.
The 32-seed screen the vetrest pilot proposed as its next run
(evidence/2026-11-05/sim-vetrest-b.md, "Named next blank #1").

Prereg: evidence/2026-11-05/sim-vetrest-screen-b-prereg.md (binding).
Pilot prereg + pilot evidence: evidence/2026-11-05/sim-vetrest-b-prereg.md,
evidence/2026-11-05/sim-vetrest-b.md. Corpus:
evidence/2026-11-05/perseed-vetrest-screen-b/ (64 per-seed JSONs, 32
seeds x 2 legs, band 99511–99542). Analysis:
evidence/2026-11-05/sim-vetrest-screen-b-analysis.json (analyzer
scripts/vetrest-analyze-20261105.js, run 2026-11-05, exit 0).

## Verdict: NO-GO — kill class CONCEPT-DEAD (analyzer)

Powered: true (5 banking seeds per leg, >= 3 observed exits).
Primary: first-killer median survival (observed exits only) baseline
5.5d, armed 5d — bar >= 19d. **MISS.** Pair clause: >= 1 banking
seed with >= 1 day of 2 living killers — 99532 on both legs, **PASS**.
Cost bars: all **PASS**, legs identical (median village survival
79.5d = 79.5d; starvation deaths 23 = 23; village losses 31 = 31;
median non-scholar fallen 8.5 = 8.5). Instrument errors: 0 on all 64
legs. Verdict reason (analyzer): "median 5d < 19d".

Banking seeds (both legs, identical list): 99513, 99514, 99515,
99532, 99539. Baseline first-killer exits (days): 1, 9, 5, 6
(median 5.5d, 1 censored). Armed exits: 1, 5, 6 (median 5d, 2
censored).

## Mechanism measures (reported, per prereg)

- Skips fired: baseline 0, armed 6 across 2 seeds (99515, 99532),
  0 skip violations. The mechanism DID engage.
- Paired survival: 0 up, 0 down (observed exits only). The 5
  banking pairs are identical except 99515 (below).
- Days with >= 1 living killer (m1 L1 total): 26 baseline → 37
  armed. Days with >= 2 living killers (m1 L2 total): 1 → 1 — no
  gain where the bar lives.
- Second-killer production (m3): multi-killer banking seeds 1 → 1;
  post-first-blood fights 22 → 19, kills 1 → 1.
- Readiness-5-ready days (m4): 0 → 0.
- Death channels among first killers: wild 5 baseline / 3 armed
  (the armed leg's two censored killers were still living at
  village end, not dead elsewhere).

## Wall numbers (per leg, identical)

Wins 0, national 0, table 0, wave-4 unlocks 21, wave-4 faced 20,
wave-4 kills 6, wave-5 unlocks 0, wave-5 faced 0, median survival
79.5d. The screen moves nothing on the wall.

## Sense test — seed 99515, Elijah Scott (longest-lived first killer)

Elijah killed a wave-4 beast on day 66 (not the scholar at the
time). He held 96–100 HP through day 74. On day 75 a Haven
assault chain killed eight scholars in the wild at Haven, in
combat. Three vetrest skips fired that same day, each passing
over Elijah as the fresh killer while the Codex moved to
gen_rxzxhhk, then ingrid_vik, then hassan_ali. On the armed leg
Elijah was still living at village end; on the baseline leg the
same man died in a fight on day 75, nine days after his kill.

The story makes sense: the village passed the Codex around the
man who had only just bled for them, three times in one bad day,
and he lived through it. But it is one censored case. The median
did not move (5.5d → 5d), the pair-days did not move (1 → 1),
and no second killer was produced on that seed. The skip fires
and reads correctly; it does not save killers at the rate the bar
needs, because the killers still die in the wild shortly after —
the death channel the skip cannot touch.

## Kill-class note (read this before re-using the label)

The analyzer reports CONCEPT-DEAD. The prereg's METRIC-BROKEN
needs "skips > 0 AND paired survival up on >= 1 banking seed",
where the analyzer's paired-up count covers observed exits only —
Elijah's censored survival (alive at end vs dead at 9d on
baseline) does not register as up. The mechanism fired (6 skips)
but produced no observed-exit gain and no movement in the median
or the pair-days. Whether that is called CONCEPT-DEAD or
METRIC-BROKEN, the pre-registered action is the same: on NO-GO
the lever is reverted. This evidence records the analyzer's
label and the facts behind it rather than re-scoring the metric.

## Action taken: lever REVERTED (prereg NO-GO action)

- src/js/ledger.js: the VETREST_MANTLE_SKIP block (51 lines) and
  its skip narration block removed by reverse-applying the lever
  commit's ledger hunk. `grep VETREST_MANTLE_SKIP src/js/` = 0,
  `grep vetrestSkips src/js/` = 0 — no src/js trace remains.
- scripts/test-vetrest-20261105.js: updated the tbretreat way
  (commit 7f7475f59 pattern) — LEVER_PRESENT detection on
  ledger.js, the 4 lever-dependent live legs (skip-fires-pick /
  -trace / -said, skip-window-45) SKIP with a printed reason
  while the lever is absent; analyzer fixtures and neutrality
  legs still run. Post-revert: **26 passed, 0 failed, 4 skipped**
  (30/30 pre-revert, recorded in the prereg).
- Driver (scripts/vetrest-driver-20261105.js), analyzer
  (scripts/vetrest-analyze-20261105.js) and the proof stay as
  tooling, the way the tbretreat arm kept its analyzer and
  instrument after its revert. No balanced panel: owed only on GO.

## Metric review

The pilot prereg's §14b warning was right: the >= 19d median
bar is unachievable for this mechanism alone. The skip addresses
only the NPC-at-kill minority (~29% of banked killers) and only
at succession moments; the bar needs the scholar-at-kill majority
to move, and first killers die in the wild within days either
way (baseline median 5.5d). The screen's real questions were
the mechanism measures, and they answer clearly: the skip fires
cleanly (6 skips, 0 violations) and reads correctly on camera,
but it buys no pair-days and no median. The next lever for
first-killer survival has to address the wild death channel
itself (where killers actually die), not the succession pick.
Do not re-run this screen on a new band expecting a different
median; the mechanism is measured.

## Closeout note

The 1830Z coordinator timed out at 7200s before this arm's
analysis. The corpus was in fact complete (64/64 — the resume
loop finished seeds 99541–99542 before dying); only the
analysis, evidence, and revert were missing. All three were
done in the main session per INSPECT HELD WORK: analyzer run
2026-11-05 (exit 0), evidence written here, lever reverted,
proof re-run green post-revert (26/0/4). Branch
sim-vetrest-screen-b merged to master after rebase; worktree
released; claim + lock deleted by the closeout.
