# journey-scale r131 — PRE-REGISTER (lane A, leg 3 SCALE, readiness phantom-veteran fix)

**Run id:** `playtest-loop-a-20261111-1143Z` (lock run_id `2026-11-11T11:43:36Z`).
**Run:** scheduled Wed 2026-11-11 05:45 CST (11:45 UTC); this run 11:43Z–.
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only**
(a pilot-gate stop is not success; rotation stays 3).
**Base:** local master `b09cf584e` (r130 deepening: favour-block line rotation).
**LOUD — origin/master diverged:** `git pull --ff-only` fails ("Not possible to
fast-forward"); known standing condition (ship blocked on it since 2026-11-08;
reconcile-forward in flight, main session owns). This run works on LOCAL
master only: no push, no rebase onto origin, no divergence repair. Flagged
here, not fixed here.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, nor
gate change in this run. The fix below changes no demand, no number, no bar:
it aligns one reader's liveness test with the shared rule so the gate reads
the same living veterans the ladder reads. The veteran demand (1 for wave 4,
2 for wave 5) is untouched.
**Perception law (2026-10-28) stands.**
**DELIVER OVER MEASURE (2026-11-01):** this run BUILDS the fix for the
vetfirst-b named next (the 190305 bar disagreement). It does not re-prove
the veteran census (vetfirst-b just measured it: 56 killers, 54 dead, 2
living at end of band) or the succession voicing (r130 settled).

## Standing context (read before scoring)

- **r130 scale (landed fc0ffb37c, adopted 2026-11-11 ~04:45–06:10Z):**
  succession voicing fix; scale reachable 4/4 (regional links, ladder
  stage 3, lesser seat priced 4/4), fun yes; winnable unchanged — 0/4 full
  seat, national never live; the living-veteran pair is still the wall.
- **vetfirst-b (Loop B, landed today, f19ac4bf5; evidence/2026-11-11/
  sim-vetfirst-b.md):** veterans first numbers, seeds 190301–190308, 150d.
  56 distinct villagers made a wave-3+ kill; 54 died before the run ended;
  only 2 living veterans stand at the end of the whole band. Wave-4
  readiness reached 8/8 (d27–47); wave-5 readiness 2/8, unlocked 2/8;
  military tribute never ready 0/8; the wave-5 bar was veteran-short for
  78–148 days per seed. Verdict NO-GO on one genuine engine disagreement:
  seed 190305 — `waveCombatReadiness(4).veterans` = 1 while
  `_ladderLivingVeterans(4)` = 0 and the instrument recomputation = 0.
  **Named next (vetfirst §9): "a targeted fixture (kill a veteran in
  combat on the final day, read both functions)".** This run builds it.
- **Mechanism (read in code this run, not just inferred):**
  `ladder.js` `countLivingVeterans.isLiving` requires roster membership
  (`roster.indexOf(vid) < 0 → false`) and then checks `vp.dead`.
  `standing.js` `waveCombatReadiness.isLiving` has NO roster check —
  `vp && !vp.dead` only. The TB combat death path (`game.js`
  `tbVillagerFalls`, ~39954) removes the villager from `v.roster` and
  `v.villagers` and pushes a fallen row, but NEVER sets `rec.dead = true`
  — unlike `removeVillager('killed'/'ambushed')` (`betrayal.js:1233-1238`,
  "DEAD IS DEAD (2026-10-08): vpOf(vid).dead is read by game code ... and
  must not lie about a corpse"). So a veteran who falls in a TB fight
  keeps a live-reading vp record and is counted by readiness from then
  on, while the ladder (roster check) correctly counts 0. The 190305
  phantom is Tama King, d121 'combat' (her wave-3 kill lifts
  readiness(4) but not readiness(5) — readiness(5) read 0, as it should).
  Both modules' comments demand agreement — ladder.js: "_ladderLivingVeterans
  ... the same read standing.js uses for its readiness veterans bar
  (living only)" and standing.js blooded: "read through
  waveCombatReadiness(5) so the two can never drift apart" — but the
  reads differ, so the comment is false today. The fix makes it true.
  `waveUnlockReady()` reads `waveCombatReadiness()`, so the phantom can
  wrongly show a wave ready and wrongly trigger `villageBlooded()`.
- **Second vetfirst finding (CARRIED, not this run's):** monster-veteran
  +3 damage is in the canon comment (`game.js:35087` "+50% HP, +3 damage,
  +1 speed") and in Steve's ruling, but NO damage path applies it — TB
  setup (`game.js:35215, 35271`) applies HP×1.5 and spd+1 only; every TB
  damage read takes `mdef.attack.damage` directly. Adding +3 is a
  difficulty change on the hardest monsters; it needs a Steve call /
  sized prereg, not a silent fix. Documented here with locations; not
  changed this run.
- **The wider lie (CARRIED, not this run's):** `tbVillagerFalls` leaves
  `vp.dead` unset for every TB-fallen villager, not just veterans — the
  vp record lies about a corpse for all other `vp.dead` readers (party
  skips, System fragments, record filters). Marking dead at the TB path
  is the root fix, but it touches every `vp.dead` reader and needs a
  panel to adjudicate; this run fixes the readiness reader only (the
  load-bearing gate the vetfirst NO-GO names).

## The fix (one task, one commit)

`src/js/standing.js` `waveCombatReadiness.isLiving`: add the roster check
before the vp check, mirroring `ladder.js countLivingVeterans`:

```js
if (roster.indexOf(vid) < 0) return false; // not a villager of this village (ladder.js countLivingVeterans rule)
```

`roster` is already in scope in that function. Nothing else changes: the
scholar still counts (scholarId → true first, same as ladder); demands,
numbers, bars untouched.

## Proof (before/after, same test)

`scripts/test-journey-scale-r131-phantom-veteran-20261111.js` — harness
game (seed 131100), a roster villager given a wave-3 kill in
`state.waveKillLog`. Sections:
1. Alive: `waveCombatReadiness(4).veterans` = 1 and
   `_ladderLivingVeterans(3)` = 1.
2. After `tbVillagerFalls`: UNFIXED readiness = 1 (phantom) vs ladder = 0
   — RED; FIXED both 0 — GREEN. (The defect.)
3. `vp.dead` still unset after `tbVillagerFalls` — the mechanism,
   documented, not fixed here.
4. Control: `removeVillager('killed')` marks dead and both read 0 on
   UNFIXED code — the divergence is TB-path-specific.
5. A living second veteran keeps both counts at 1 after the first falls
   (the fix does not undercount).
6. Wave-4 kill + TB fall: readiness(5) vs `_ladderLivingVeterans(4)`
   agree after the fix (and disagree 1-vs-0 before it).

## The panel (fresh, on the fixed engine)

- **Driver:** `scripts/journey-scale-r131-20261111.js` (r130 driver cloned,
  labels/EVIDIR/seed list/DAYCAP only, PLUS a daily vetbar recorder:
  `waveCombatReadiness(4/5).veterans`, the shadow old-rule counts (the
  same kill-log scan with the pre-fix `vp`-only liveness test),
  `_ladderLivingVeterans(3/4)`, `villageBlooded()`, unlock state, roster
  size). Same instruments (regionalstep, ladder, traderoad, deathcensus,
  scholarcount) and the same policy (scalecourt-traderoad-r113-linkraise-sit).
- **Seeds: FRESH 131101–131104.** Freshness: 0 mentions in dated preregs
  (grep over `evidence/` `*prereg*`, completed 12:4xZ). Full-tree sweep
  over all of `evidence/` completed: exactly 10 files contain the
  strings, ALL false positives on inspection — float substrings
  (`23.3131104…`, `24101.3169131104`, `566.5644849131104`,
  `223.1311038932763`, `0.00961311035594244`, `19.131103099071133`) or a
  cumulative counter (`"dgEasedCum":131104` — a kcal total, not a seed).
  No `.md`/`.js` file names any of 131101–131104 as a seed. These seeds
  were never played as a journey band. Fixture seed 131100: 0 mentions
  in dated preregs and no full-tree hit as a seed.
- **Horizon:** DAYCAP=140 (the leg window d80–140), death-aware stop
  (+10d tail max on a dead village — MEASUREMENT.md §10).
- **Pilot:** seed 131101 first. Pilot gates (r130's, plus vetbar): crash,
  census errors > 0, 0 census rows, reconciliation residual != 0,
  teleOnly > 0, 0 trustset rows by d60, 0 national-gate rows, or no
  vetbar rows by d60 → STOP and diagnose (INCOMPLETE, not a verdict).

## Questions (binding)

- **Q1 PHANTOM REPRO + FIX (primary):** the fixture is RED on unfixed
  code (readiness 1, ladder 0 after a TB fall) and GREEN on fixed code
  (both 0), all six sections green; the removeVillager control reads 0/0
  on unfixed code. **GO: all hold.** A section failing after the fix is
  NO-GO as written — report it, do not re-score.
- **Q2 PANEL VETBAR:** on the fixed engine, zero days where readiness
  veterans != ladder veterans (per wave 4 and wave 5), on all 4 seeds.
  The shadow old-rule count is reported per seed: phantom-days found
  (shadow > fixed) name whether any wave-unlock or blooded read fell on
  a phantom day — a phantom day with a gate read is a bigger finding,
  a phantom day with no gate read is still a clean fix. Either way the
  fixed-engine disagreement count is the bar. **GO: zero disagreements
  on the fixed engine.**
- **Q3 TRAJECTORY SHAPE (guardrail):** the panel's lived-days total stays
  within ±25% of the r130 band's 473, and no seed flips alive↔dead vs the
  r130 band's pattern (2 alive / 2 dead) without an attributed cause in
  the deathcensus; lesser seat priced ≥3/4 (r130: 4/4). A liveness
  alignment must not move trajectories beyond seed noise.
- **Q4 PEOPLE CHECK:** read the fresh panel's d90/d120 transcripts in full
  (r125/r126/r127/r130 Q4 protocol); senseless count 0 for clean. Note
  whether the two carried defects (Baraka unvoiced raise, trap-line
  invitation swallowed) fire — carried, not this run's to build.
- **Q5 CENSUS:** plain-words village assessment per seed; ladder stage,
  lesser seat, national, full seat; books close on all four seeds.

## Telemetry + checks

- `telemetry-check.js` vs `scale.json` baseline, metrics fightsTotal,
  fightsByWave.4, maxGameDay (same as r125/r126/r127/r130). LOUD lines are
  same-run investigation items (expect the regime-mismatch LOUD; EXPLAINED,
  baseline NOT rolled forward — the re-label is still owed).
- `node scripts/check.js --quick` (the fix touches src/js — mandatory).
  Full `check.js` before merge if the quick gate shows anything beyond
  the known standing failures.

## Metric review

(To fill at closeout — metrics held, or the revision proposed for the
next run. A miss is a miss; never re-score.)

## Carried (not this run's to build)

Monster-veteran +3 damage gap (locations above — Steve call / sized
prereg); `tbVillagerFalls` vp.dead lie (wider fix, needs a panel across
all vp.dead readers); Baraka unvoiced raise; Stella/Nathan trap-line
invitation swallowed by the raise-answer template; guest-death (Bing)
prereg; survival-collapse cause (combat side); scholar-payment open item
(steve-call); scale.json baseline regime re-label; origin/master divergence
(ship loop owns); 1415Z 17-failure gate attribution (partially done r130 —
8 attributed on base b09cf584e's parent); unfixed-engine control panel
(not run — the fix's trajectory effect is bounded by code reading: it can
only lower the readiness count, hence only delay an unlock/blooded, never
accelerate one; the panel's daily shadow counts are the before/after
evidence instead).
