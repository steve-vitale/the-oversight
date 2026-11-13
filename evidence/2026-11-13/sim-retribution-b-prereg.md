# sim-retribution-b — prereg

Run: fleshout-loop-b-20261113T2230Z (Loop B), arm sim-retribution-b
Axis: winnability chain (backlog open item RETRIBUTION NARRATED AFTER ITS
KILL, filed by Loop A arm sim-strikefall-a; see evidence/2026-11-13/
sim-strikefall-a.md §Sense-testing)
Branch: sim-retribution-b — worktree ~/workspace/worktrees/sim-retribution-b
Base: master 95dbf07f3 (95dbf07f338ea35fda771659ea76906c9b749500)
Date: 2026-11-13
Anchor commit (check leg): the prereg commit on this branch (recorded in
each per-seed JSON as anchorCommit; driver refuses any other HEAD via
EXPECTED_ANCHOR).

## Finding under check

RETRIBUTION NARRATED AFTER ITS KILL: abilityActions.js
`retribution.unleash` runs its tbDamage loop over adjacent enemies
first, then says "RETRIBUTION: N damage erupts outward — K enemies
caught in it." If the shockwave kills, "X falls." precedes the
Retribution summary line. Same inversion class as the fixed #2303
(strike-after-fall), different verb. Note the full emit order in the
current code: BA.unleash (buildarounds.js) says "RETRIBUTION: N erupts
outward — and M stays with you." BEFORE the loop, the tbDamage loop
says falls lines inline, then the impl says the summary line. The
inversion is judged between the unleash line and the summary line: a
falls line strictly between them, in the same fight, is one inversion
instance.

## Check leg (before any fix) — Stage 0 probe FIRST

Driver scripts/retribution-check-driver-20261113.js, competent
verbatim, 150d death-aware. Stage 0 probes the steeple band
190391–190398 (the observation band of the sibling arm — the finding
was filed from its stream, not from a retribution observation, so
contact there is NOT assumed). The probe counts retribution contact
(summary / unleash / stored / no-adjacent lines) and inversions.

Band rule (pre-registered):
- If the Stage 0 probe shows retribution inversions > 0 on the steeple
  band, the check/after band IS the steeple band (190391–190398) —
  reuse is justified by demonstrated contact.
- Else probe the fresh band 190441–190448 (verified fresh 2026-11-13:
  no mention in any evidence/*.md, no matching per-seed filenames).
  If inversions occur there, that band is the check/after band.
- If NEITHER band shows a retribution unleash with a kill, that is a
  SUBSTRATE finding (§14b: zero contact) — report it, do not claim a
  fix on zero contact. The staged fixture (proof test) is then the
  primary proof and the band is the regression check only.

Definitions (the judge):
- RETRIBUTION-KILL INVERSION: a monster "falls." line (non-person)
  with seq strictly between a RETRIBUTION unleash line and the
  following RETRIBUTION summary line in the same fight. Falls lines
  AFTER the summary line are correct order (the blow first, its kill
  second) and never count. Fallback: if a summary line has no unleash
  line before it in the same fight, the run of falls lines directly
  preceding it (adjacent seqs ending at summary.seq - 1) counts
  instead, reported separately as fallback inversions.
- Contact: retribution summary / unleash / stored / no-adjacent
  counts per seed.
- Controls (must not move on the after leg): freezeline count
  ("still frozen from your scream"), applyStatus freeze count
  ("is frozen — ... (stunned: no movement)"), bellow count. These pin
  the narration-only character of any fix.

## Fix leg (only if the check leg reproduces inversions > 0, or the
## fixture reproduces them — see substrate rule above)

Same opt-in shape as the strikefall fix (#2303): pass
`{quiet:true, deferDeathLines:true}` to the tbDamage call(s) in
`retribution.unleash`, and flush via `game.tbFlushDeathLines()`
immediately after the RETRIBUTION summary say. Mechanics untouched
(damage, kills, counts, the 25% self-hit identical); only narration
order moves. Fail-open behavior preserved (no live fight, or a fight
already over, says immediately — a kill is never silent). The
death-throes line stays inline deliberately (documented remainder
from #2303 — do not touch it). The "no one adjacent" branch says
before any damage and needs no flush (nothing queued; flush is a
no-op there — the fix still calls it only on the hit path, after the
summary say, to keep the no-hit path byte-identical).

## GO bars (pre-registered; judge the after leg against these)

- (a) RETRIBUTION-KILL INVERSIONS 0 on the after leg (was N on the
      check leg, recorded in the evidence table).
- (b) Falls / retribution counts unchanged check vs after on all 8
      seeds: fallsCount, retribSummaryCount, retribUnleashCount,
      retribStoredCount identical per seed.
- (c) Survival/wave numbers BYTE-IDENTICAL check vs after on all 8
      seeds: days, gameDays, endReason, won, over, villageLost,
      scaleRank, maxWave, unlockedWave, standing, endPantryKcal, FULL
      deaths arrays.
- (d) Proof test scripts/test-retribution-b.js RED→GREEN on the fix
      commit (instrument legs + game-level legs: killing unleash
      orders summary-then-falls for 1 and 2 kills; non-killing unleash
      unchanged; no-adjacent refusal spends nothing; mechanics pinned
      — stored number, hit count, 25% self-hit, battery drains once).
- (e) Controls unchanged: freezeline count, applyStatus count, bellow
      count identical check vs after on all 8 seeds.

## Method notes

- Seeds are nearly free; the check and after legs run the same 8-seed
  band, 150d, competent, identical driver.
- The say stream is the instrument: every line carries day + sequence
  + fight id. No line is dropped from the record (the analyzer judges
  the kept stream, not a filtered one).
- Canon: NO canon doc covers retribution narration order (CANON.md
  manifest checked 2026-11-13; docs/SYSTEMS.md covers abilities in
  general, not narration ordering). The ordering fix is engine work,
  not canon work — nothing is invented here.
- Metric review: if a metric proves wrong (e.g. the unleash→summary
  sandwich over- or under-counts), write it under "metric review" in
  the evidence file and propose the revision for the NEXT run; never
  re-score mid-run.

## Files

- scripts/retribution-check-driver-20261113.js — check/after driver.
- scripts/retribution-check-analyze-20261113.js — analyzer (judge).
- scripts/test-retribution-b.js — proof test (RED first, then GREEN).
- evidence/2026-11-13/perseed-retribution-b-check/ — 8 check-leg JSONs.
- evidence/2026-11-13/perseed-retribution-b-after/ — 8 after-leg JSONs.
- evidence/2026-11-13/sim-retribution-b-prereg.md — this file.
- evidence/2026-11-13/sim-retribution-b.md — evidence (written at end).
