# sim-freezeline-a — PACK-LEADER FREEZE LINE (arm sim-freezeline-a, run fleshout-20261113T0715Z)

## Verdict: GO (fix) — CHECK REPRODUCES, fix lands, narration-only

- **Step 1 CHECK (current master tip f7352f946): REPRODUCES.** The line
  "…is still frozen from your scream." repeated on 6/9 check seeds:
  total 44 lines, worst 9 on one seed-day (190396 d130, 190398 d138).
  The old-base shape (63–64 on one seed/day) is smaller on current
  master but the same defect: the line fires once per monster per round
  while War Cry re-stuns every round.
- **Step 2 FIX: GO.** One-line-class dedup in `tbMonsterTurn`
  (src/js/game.js): the freeze line now fires once per monster per
  fight. After-leg on the same 9 seeds, same driver: total 44 → 21,
  worst same-text group 9 → 1 (the one remaining group of 4 is 2 fights
  × 2 monsters, diagnostic-proven). Survival/wave numbers
  BYTE-IDENTICAL on all 9 seeds (days, endReason, maxWave, standing,
  scaleRank, endPantryKcal, full deaths arrays) — narration-only, as
  required. Proof test scripts/test-freezeline-a.js: 19/19 instrument +
  12/12 game-level, RED→GREEN demonstrated (G1 3x→1x, G2 4x→2x,
  G2b 4x→1x, G3 2x→1x).
- **Convergence:** converged (this arm's defect is fixed; the sibling
  applyStatus repeat is a new backlog blank, not this arm).

## Preregistration (evidence/2026-11-13/sim-freezeline-a-prereg.md)

- Primary metric: freeze-line repeats — total count + max per seed-day.
- Check rule (pre-registered): REPRODUCES if maxPerDay ≥ 2 on ANY check
  seed; KILLED-ON-CHECK if maxPerDay ≤ 1 everywhere.
- Seeds: matched band 190391–190398 (8) + targeted 190407 (the exact
  old-base observation seed). WHY both: the old-base phenomenon was
  seed-concentrated (all 64 on one seed/day); the band tests generality,
  190407 tests the exact instance.
- Policy: competent VERBATIM (scripts/policies/competent.js as on
  master; sha256 74a890f0844ebc19… recorded per seed).
- Horizon: 150d death-aware (§10: reachability-class; observed day d72).
- Anchor: f7352f946 (driver refuses any other HEAD).
- Fix GO bar (pre-registered): after-leg maxPerDay ≤ 1 on every seed AND
  total ≤ number of distinct stunned-monster fights; survival/wave
  numbers BYTE-IDENTICAL on the same seeds or the fix is rejected.
  **CORRECTION — see "Metric review" below: the maxPerDay ≤ 1 clause
  was wrong and was corrected before judging the after-leg.**

## The defect (mechanism)

- Emit site: src/js/game.js `tbMonsterTurn`, the `m.stunned > 0`
  branch (~line 43252): every monster turn while stunned, decrement
  and say "…is still frozen from your scream."
- Every stun source applies exactly 1 turn (War Cry bellow,
  abilityActions.js war_cry.bellow: applyStatus stun turns:1, ~60% fail
  per enemy; villager scream, paparazzo flash, game.js:38264/40563/
  42559/42870/43770 — all turns:1). The competent policy bellows
  nearly every round, so the same leader is re-stunned round after
  round and the line fires once per leader per round.
- Old base (203a32775, band 190401–190408): 64 lines, ALL on 190407
  d72 — one Focus Group fight (2 pack-leaders + 8 eye-heads).
  Recounted from the tendexact corpus this run (the evidence file says
  63; the recount is 64 — the 400-line vetSays cap may have clipped one
  in the original count).
- Current master: the repetition is NOT pack-leader-specific. The
  check-leg repeats came from RERUN Congregation/Influencer/Algorithm,
  Big Loud, and Reunion 1/2/3 — any monster re-stunned by repeated
  bellows. The pack-leader instance was just the loudest case.
- Canon: no canon doc covers the scream-stun narration
  (MONSTER-WAVES.md has no scream/stun lines; CANON.md manifest
  checked). The fix is narration hygiene, not a canon change.

## Step 1 — CHECK (before leg, f7352f946, fix absent)

Driver scripts/freezeline-check-driver-20261113.js (anchor-guarded,
competent verbatim, 150d, writeRobust, refuse-overwrite). Per-seed JSON:
evidence/2026-11-13/perseed-freezeline-a-check/. Analyzer
scripts/freezeline-check-analyze-20261113.js → verdict REPRODUCES,
total 44, worst maxPerDay 9.

| seed | days | end | maxWave | standing | rank | freeze | max/day | worst day |
|------|------|-----|---------|----------|------|--------|---------|-----------|
| 190391 | 65 | village-lost | 4 | 145 | regional | 1 | 1 | d63 |
| 190392 | 143 | village-lost | 4 | 199 | regional | 3 | 3 | d121 |
| 190393 | 126 | village-lost | 4 | 199 | regional | 4 | 4 | d61 |
| 190394 | 128 | village-lost | 4 | 199 | regional | 3 | 3 | d54 |
| 190395 | 150 | survived | 4 | 199 | regional | 1 | 1 | d107 |
| 190396 | 140 | village-lost | 4 | 199 | regional | 14 | 9 | d130 |
| 190397 | 135 | village-lost | 4 | 199 | regional | 0 | 0 | — |
| 190398 | 139 | village-lost | 5 | 370 | regional | 12 | 9 | d138 |
| 190407 | 133 | village-lost | 4 | 199 | regional | 6 | 6 | d123 |

Same-text groups in the check leg (what the counts are made of):
- 190392 d121: 3 lines = 3 DIFFERENT monsters (Reunion 1/2/3, once
  each) — already correct, no repeat.
- 190393 d61: Reunion 2 ×2 + Reunion 1/3 ×1 — one true repeat.
- 190396: Congregation ×9 (d130) + Big Loud ×5 (d89) — all repeats.
- 190398: Influencer ×9 (d138) + Reunion 1/2 + Editor ×1 — repeats.
- 190407: Algorithm ×6 (d123) — all repeats.
- Sibling stun-family lines (Freeze Tag rooted / Bind strains): 0 on
  all 9 seeds — the competent policy never presses freeze_tag/bind in
  these runs (consistent with the backlog finding that freeze_tag is
  held by nobody), so the sibling class is unexercised here, not
  absent. Out of scope either way (different emit sites).
- Double veteran-kill announcement (old-base 190406 d40, one instance):
  NOT reproduced — zero duplicate veteran-kill lines on either leg
  (all 9 seeds, both legs). Sense note only, as briefed; the backlog
  item stands as observed-on-old-base only.

## Step 2 — FIX (design + proof)

Design (final, as landed): announce the freeze once per monster per
fight. Flag `f._stunAnnounced[m.key]` on the fight object (fresh per
fight — `this.tbfight` is assigned anew in startCombat; fight id
`f…` per fight), keyed by fighter key, so a second monster in the same
fight still announces once and a new fight re-announces. The stun
MECHANIC is untouched: `m.stunned` still decrements and the monster
still loses its turn every stunned round; only the narration dedups.

Why once-per-fight and not once-per-stun-application: every stun
source is 1 turn, so each bellowing round IS a fresh application —
per-application dedup would have changed nothing (the 64× case would
still fire 64×). The bellow itself announces each fresh stun ("N of
them flinch, losing their next turn"), so the player is told at
application time; the skipped-turn line is a reminder that needs
saying once. If the monster recovers, acts, and is re-stunned later in
the same fight, it stays silent (proof G2b) — the bellow line carries
that announcement.

What was NOT changed: the wording of the first announcement (kept
verbatim — "still frozen" reads fine as the reminder it is); no
worn-off line was added (the stun never had one; adding narration is
out of minimal scope); Freeze Tag / Bind per-round lines untouched
(different emit sites, unexercised in these runs).

Proof test scripts/test-freezeline-a.js (shared kit godpath/lib.js,
seeded harness; `--game` runs the game-level section):
- §1–§6 instrument: regexes match exactly the freeze line (not the
  sibling lines), countByDay reproduces the old-base shape (64, all
  d72, from the tendexact corpus), judge boundaries (2 reproduces,
  1 kills), anchor pin f7352f946, emit site present. 19/19.
- G1 (RED→GREEN): one hushwolf, stunned 3 turns → line 3x pre-fix,
  1x post-fix; stun consumed 3→0; scholar unhurt; monster unmoved
  (mechanic intact).
- G2: pack-leader Focus Group via the engine-real feast-draw veteran
  path (seed 7 draws pack-leader deterministically) — lead + packmate,
  each stunned 2 turns → 4x pre-fix, 2x post-fix (once each).
- G2b: re-stun after recovery in the same fight → 4x pre-fix, 1x
  post-fix total.
- G3: new fight re-announces once (dedup is per-fight, not global).
  12/12 GREEN post-fix; G1/G2/G2b/G3 all FAILED pre-fix (RED observed
  before the fix was applied).

## After leg (same 9 seeds, same driver, fix on disk, fixPresent: true)

Per-seed JSON: evidence/2026-11-13/perseed-freezeline-a-after/.

| seed | freeze before → after | max/day before → after | survival |
|------|----------------------|------------------------|----------|
| 190391 | 1 → 1 | 1 → 1 | identical |
| 190392 | 3 → 3 | 3 → 3 | identical |
| 190393 | 4 → 3 | 4 → 3 | identical |
| 190394 | 3 → 3 | 3 → 3 | identical |
| 190395 | 1 → 1 | 1 → 1 | identical |
| 190396 | 14 → 2 | 9 → 1 | identical |
| 190397 | 0 → 0 | 0 → 0 | identical |
| 190398 | 12 → 7 | 9 → 4 | identical |
| 190407 | 6 → 1 | 6 → 1 | identical |
| **total** | **44 → 21** | **worst 9 → 4** | **9/9 identical** |

Survival identity verified field-by-field (days, endReason, won,
maxWave, standing, scaleRank, endPantryKcal, FULL deaths arrays) —
9/9 identical. The fix moves no trajectory: say() consumes no RNG
and the stun still eats the turn.

Why 190392/190394 stay at 3: those were already 3 distinct monsters
announcing once each — correct, and the fix leaves them. Why 190398
d138 stays at 4 (the one group > 1): diagnostic /tmp/diag-190398.js
(seed 190398 replay, tbMonsterTurn-wrapped, fight id + monster key
per freeze line) shows the 4 lines are TWO fights × TWO monsters
(fight fmgpsplbv_751ki8: m_0 + m_crew_1; fight fmgpsplci_17ua9i:
m_0 + m_crew_1 — the Influencer plus its crew member, both
displaying as "The RERUN ×2 The Influencer"). Every (fight, monster)
pair announces exactly once; 4 is the honest floor for that day.
The remaining 21 lines across the band are 21 distinct (fight,
monster) first-announcements — zero repeats.

## Sense-testing (transcripts)

Targeted replay of 190396 (fix live), full say capture on the two
freeze days (d89 Big Loud, d130 Congregation), filtered to the fight
family — 218 kept lines. The fix reads correctly in the live
transcript: "The Big Loud is still frozen from your scream." fires
once on d89 and "The RERUN ×1 The Congregation is still frozen from
your scream." fires once on d130, while the scholar bellows ~10 times
each fight and the monster is re-stunned round after round. The bellow
line announces every fresh stun, so the player is never left
wondering why the monster skipped its turn. The d130 fight itself is
a long, consequential brawl (multiple scholar deaths/successions
mid-fight — Chantal, then Ngozi, then Brian joins; the Congregation
falls to a kitchen knife) and the narration stays coherent through it.

New sense findings from this read (filed in the backlog):
1. The applyStatus stun line "X is frozen — War Cry. (stunned: no
   movement)" repeats ~10× per fight — same repetition class, one
   layer down from the fixed line (different emit site: the stun
   application, not the skipped turn). Next blank for a future arm.
2. Strike-after-fall ordering: "The RERUN ×1 The Congregation falls."
   is followed by "You STRIKE the congregation for 18 (Kitchen
   knife)." — a strike narrated against a monster that just fell.
   One instance, d130. Pre-existing coherence glitch, out of scope.
3. "The square SCREAMS — static made solid…" fires twice identically
   in a row on d89 (evidence §Sense only — possibly two separate
   triggers; not filed, needs a look before any claim).

## Metric review

- **CORRECTION (binding, recorded here per §14, before judging the
  after-leg):** the prereg's fix GO bar said "after-leg maxPerDay ≤ 1
  on every seed". That clause is WRONG and the check-leg data itself
  proves it: 190392's 3 lines on d121 were already 3 DIFFERENT
  monsters announcing once each — a correct fix leaves all 3, so
  maxPerDay 3 on that seed is the honest post-fix number, not a
  failure. The corrected bar, judged here: (a) freeze total never rises
  on any seed; (b) every (day, line-text) group's size equals its
  distinct (fight, monster) count — verified by the 190398 diagnostic
  for the only group > 1; (c) survival/wave numbers byte-identical on
  all 9 seeds. The prereg file is left as written (the record of what
  was pre-registered); this section is the correction. No metric was
  re-scored after seeing the after-leg: the correction was forced by
  the CHECK-leg data (190392's three distinct monsters), read before
  the after-leg ran.
- The check rule itself (maxPerDay ≥ 2 reproduces) held: it fired on
  190392/190393/190394/190396/190398/190407.
- §15 note: the check leg is a single-leg reproduction measurement,
  not a before/after lever comparison — no balanced-panel compare
  applies to it. The before/after comparison here is the same driver
  on the same seeds with the fix as the only change (a narration-only
  change, proven trajectory-identical), which is the panel's
  identical-seeds requirement met directly.
- The old-base "63" vs recount "64": the evidence file's 63 was likely
  clipped by the 400-line vetSays cap; the corpus recount is 64. The
  backlog entry's number stands corrected in the fix note.

## Tooling (what was built this run)

- scripts/freezeline-check-driver-20261113.js — check/after driver
  (anchor guard f7352f946, competent verbatim, freeze/sibling/vetkill
  capture, writeRobust, OUTDIR + fixPresent for the after leg).
- scripts/freezeline-check-analyze-20261113.js — judges the check leg
  against the prereg (REPRODUCES / KILLED-ON-CHECK).
- scripts/test-freezeline-a.js — 19/19 instrument + 12/12 game-level
  (`--game`), RED observed pre-fix, GREEN post-fix.
- /tmp/diag-190398.js + /tmp/sense-190396.js + /tmp/probe-packleader.js
  — one-off probes, not committed (diagnostic + sense replay +
  pack-leader seed probe); outcomes recorded here.

## Fix commit

- src/js/game.js — tbMonsterTurn stunned branch: once-per-monster-
  per-fight dedup via `f._stunAnnounced[m.key]` (see code comment).
  Commit message carries [needs-eyes] (narration/feel change Steve
  should see). Ready to merge; coordinator lands.
- Check: `node scripts/check.js --quick` — ran TWICE (first run
  interrupted by a runtime restart at 5m17s with no confirmed result;
  re-ran to completion): **335 passed, 5 failed in ~830s, identical
  both runs.** The 5 failures are all pre-existing on pristine
  f7352f946, verified by restoring HEAD's game.js and re-running the
  three fast ones directly (all three fail identically without the
  fix):
  - test-measurement-proof-update.js — "Proof source inputs are not
    current" (retained neutrality proof stale).
  - test-measurement-workflow.js — "retained neutrality proof covers
    the current Game/controller/harness inputs" (1 sub-check).
  - test-phone-frame-proof.js — stale phone receipt (its inputs are
    index.html + data files + alienPlayers.js; game.js is NOT an
    input, so this fix cannot affect it).
  - test-one-person-army-deed-attainment.js + test-living-garden-
    deed-attainment.js — 120s TIMEOUTs in check.js (8-seed sims
    under a loaded box; a sibling arm was running heavy sims).
    Direct re-run with a 900s budget: BOTH PASS (exit 0) —
    one-person-army ~4 min, living-garden ~13 min. Load artifacts,
    not failures.
  None of the five is an assertion about game behavior, and none
  touches the changed code path (a say() call inside tbMonsterTurn's
  stunned branch). The inffight regression net (green-list line 453,
  the tbMonsterTurn area) PASSED in both check runs with the fix.
  Refreshing the stale measurement/phone proofs is a separate
  maintenance job (scripts/balance-proof-update.js /
  scripts/phone-frame-proof-update.js), not this arm — the proofs
  were already stale on the base the arm checked out, before any
  fix existed.
- Inffight regression (tbMonsterTurn area):
  `node scripts/test-inffight-20261014.js` — covered by the green
  list; passed in both check.js --quick runs above.
