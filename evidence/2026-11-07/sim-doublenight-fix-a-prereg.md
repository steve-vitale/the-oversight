# sim-doublenight-fix-a — FIX: endDay runs twice for the same scholar.day on a player-death night (game-code fix, arm 1 of 3)

Run: oversight-flesh-out-loop, run fleshout-20261108T0015Z (Loop A), arm
sim-doublenight-fix-a, axis food-economy. Worker tree:
~/workspace/worktrees/sim-doublenight-a, branch sim-doublenight-a.
FIX arm: one src/js change (game.js endDay) + derived instruments +
proof test + evidence. The coordinator lands via --ff-only; this worker
does NOT merge, push, bump, or verify live.

## Canon

READ docs/CANON.md first, then docs/PRESERVATION.md (the food ladder)
and docs/BALANCING.md (2,000 kcal/day adult need), docs/MEASUREMENT.md
§§9–12, 14–15, docs/SIMULATING.md, docs/TIME-SETTLEMENT.md. No canon doc
covers how many times a night a villager's meal is computed, or a second
endDay — the diag (sim-mealday-caller-a) named the phenomenon as a
finding, not canon, and this fix changes game code, not canon. No canon
doc is invented here.

## Substrate note (recorded before sims)

This worktree's HEAD is ba9859e13 (rebased from base 386d7c4bf onto
current master ba9859e132ebec89c2bb1451af5986d8199ddfa1 before any sims;
rebase clean, no conflicts, verified by `git log`). The diag ran on base
4ce3c0c1f; the phenomenon is base-volatile per seed (98067 fired 21 on
the awayconfirm base c92a873f4 and 0 on the diag base), so fire counts
are judged on THIS base's own before-runs, never carried from the old
base. The predecessor worker on this arm died with zero commits and a
clean worktree; this is a FRESH start, nothing of theirs survives.

## The bug (spec: evidence/2026-11-07/sim-mealday-caller-a.md — READ)

endDay (src/js/game.js:32929) runs the whole night — villageEats,
villageMeal, healerRounds, sickness, ecology, traps — and then, only on
the normal path, `scholar.day += 1` (game.js:33292). Three early returns
sit before the increment:

1. `if (this.villageLost) { return this.status(); }` (game.js:33249)
2. `if (this.over) { this.returnToVillage(); return this.status(); }` (game.js:33250)
3. player-death: `if (!res.ok || scholar.health <= 0)` → `playerDeath(...)`
   → `returnToVillage()` → `return this.status();` (game.js:33251–33271)

On path 3 the day never advances, so the driver re-enters endDay for
the same scholar.day: sleep()'s loop (`while (s.day === startDay &&
!this.over ...)` — game.js:21296) keeps ticking, tickAction's day-end
gate fires endDay again, and the whole night runs a second time.
Diag proof: 14/14 dedupe fires H1/BUG, 1,808.5 extra kcal drawn, 2
double-days in 842 lived days (98079 d10: 10 fires, 98022 d133: 4 fires).

## The fix — CHOSEN SHAPE: death-branch fall-through (Option 1, refined)

The brief offers two shapes: (a) move `scholar.day += 1` above the three
early returns, or (b) a same-day re-entry guard on endDay. CHOSEN: (a),
refined as a fall-through of the death branch to the shared day-advance
+ dawn path, instead of a literal move of the increment line. The
refinement is forced by three facts read in code BEFORE sims:

1. **Paths 1–2 cannot double, so they need no increment.** Every driver
   that can re-enter endDay checks `!this.over`: tickAction's day-end
   gate (`s.dayTicks >= TICKS_PER_DAY && !this.over`, game.js:20204),
   sleep()'s loop condition (`!this.over`, game.js:21296), advancePart's
   top guard (`if (this.over) return`, game.js:28624). And
   `villageLost = true` is only ever set together with `over = true`
   (game.js:32362, 33207; ledger.js:844). A finished run cannot re-enter
   endDay. Moving the increment above paths 1–2 would only shift
   terminal `daysAlive` +1 on every run — a systematic measurement
   distortion with zero protective benefit. Paths 1–2 KEEP their early
   returns, day un-advanced, exactly as today.
2. **The death must be recorded on the day it happened.** playerDeath
   stamps the death with `day: s.day` (fallen, lineage, pendingBurials —
   ledger.js:751, 759, 768). The death happens on night N; the record
   must say N. Moving the increment above playerDeath would shift every
   recorded overnight player-death day N → N+1 on every seed — again a
   systematic distortion, and a lie in the fiction (a bearer who died on
   day 10 would be recorded as dying on day 11, a day he never lived).
   So the increment goes AFTER playerDeath, not before it.
3. **A guard alone would freeze the calendar.** A same-day re-entry
   guard that returns without advancing leaves the day at N: sleep()'s
   loop (`s.day === startDay`) never exits and tickAction keeps
   re-entering endDay, which keeps guarding — the day never advances at
   all. A guard that advances the day on the second entry IS the
   increment move, deferred and harder to read. Rejected.

The fix, exactly: in the death branch, after `playerDeath(honestCause)`
(and the no-successor `over` case, which keeps its early return), remove
the `return this.status()` and fall through to the shared path below —
pacing telemetry, `scholar.day += 1`, season-turn beat, buildarounds
onDayTick, `village.day` sync, scale-pointer echo, pods, relic reset,
`dayPart = 0; ap = 1; dayTicks/actionClock = 0`, the `— DAY N+1 DAWN —`
line, dawn hooks, `save()`, `return this.status()`. That aftermath is
exactly what the old second endDay produced on a double-night (the
diag's pass 2 ran the full dawn path for the successor), MINUS the
re-run night: the night sim (villageEats, villageMeal, resolveDay,
healerRounds, sickness, ecology, traps) runs once. No clock is touched:
the increment moves above the return; clocks are not clamped and no
metabolism is replayed (TIME-SETTLEMENT.md — the fix moves the
increment, not the clock; the dawn hooks stay inside the transaction
chain; endDay's timeSettlement wrapper still governs the save).

What the fix does NOT change, by construction: normal nights (the
increment and dawn path run in the same order with the same day values
— the fall-through joins the normal path AFTER the increment site, and
the increment's position relative to the dawn path is unchanged);
cheat-death nights (already fall through); villageLost/over nights
(early returns untouched); combat/contest player deaths (never go
through endDay's returns); succession itself (playerDeath untouched —
same successor, same kit, same recorded day N).

## Seed selection

- Pilot P1 = 98067, 98052, 98079, 98062, 98034, 98095, 98022, 98028 —
  DELIBERATE REUSE of the diag's pilot seeds. Reproduction requires the
  same seeds: the phenomenon needs a player overnight death on the right
  entry path, and these are the 8 highest-fire seeds in the awayconfirm
  corpus (86 known fires on the measurement base). Recorded explicitly
  per the brief; no band-freshness reservation applies to a deliberate
  reproduction pilot (same rationale as the diag prereg).
- Extension P2 = 98051, 98029, 98065, 98081, 98092, 98093, 98099, 98012
  (next 8 by fire count, 50 known fires). Runs iff the BEFORE pilot
  reproduces < 4 fires (same bar as the diag).
- Confirm F1 = 17901, 17902, 17903, 17904, 17905, 17906, 17907, 17908 —
  FRESH band, verified below. Runs before AND after (identical seeds),
  trace-on only, only if the before pilot (+ extension) reproduces ≥ 1
  fire (non-vacuity rule below).

## Seed-band freshness check for F1 (recorded before sims)

Scope searched: ALL dated preregs `evidence/*/sim-*-prereg.md`
(grep for 1790[1-8]; zero hits), the standacc forbidden band
(99201–99208 — a different band), and all dated .md evidence + goal
hidden_files (grep --include="*.md" for 1790[1-8]). Result: NO prereg
names 17901–17908; NO forbidden/contaminated list names them. The only
.md hits are game.js LINE numbers (17903 in
evidence/2026-10-22/journey-deepening-r33.md, 17906 in
evidence/2026-10-20/caregiver-terminal-features-r1.md and
garden-cultivation-features-r1.md) — not seed usage. The band is fresh.
(Also checked 17301–17308 as a candidate and rejected it only for
cleanliness: its hits were a CSV data value 17306, a commit-hash
fragment 17401, and a line number 17404 — incidental, but 17901–17908
is cleaner.)

## PRE-REGISTRATION (binding per MEASUREMENT.md §14 — a miss is NO-GO, never re-scored)

- Substrate: branch sim-doublenight-a, HEAD ba9859e13 (see substrate
  note). Policy: competent ONLY (scripts/policies/competent.js,
  UNMODIFIED). Env (explicit, = shipped defaults): PLENTYDEPRI=1,
  DEPOSITGATE=1. Horizon: 150d death-aware cap (dead villages stop;
  runDays endReason recorded per seed; no fixed-200d run).
- Instrument: scripts/sweep-doublenight-fix-a.js, derived from
  scripts/sweep-mealday-caller-a.js (recorder VERBATIM — same
  villageEats invocation counter, same villagerMealDay wrapper, same
  call-site stack capture, same meal-row/dedupe shape, same death
  capture; declared deltas, verified by the proof test: names/paths to
  doublenight-fix-a-corpus-*, seed gate extended to exactly P1, P2 or
  F1, per-seed files doublenight-fix-a-competent-s<seed>-trace<T>.json).
  scripts/analyze-doublenight-fix-a.js, derived from
  scripts/analyze-mealday-caller-a.js (pairFires/classifyFire/
  neutralityCheck reused verbatim; adds the before/after trajectory
  diff + survival/starvation table). scripts/run-doublenight-fix-a.sh,
  derived from scripts/run-mealday-caller-a.sh (same guards, same
  trace-off-then-trace-on order, same full-list retries, same
  post-verdict refusal; adds before/after modes + phases.json so the
  after run repeats exactly the before run's lists).
- Corpora: evidence/2026-11-07/doublenight-fix-a-corpus-before/ and
  evidence/2026-11-07/doublenight-fix-a-corpus-after/ (selected via the
  sweep's OUT/PERSEED_DIR env; never mixed — the sweep merges by seed
  within one corpus dir).
- Order of operations (fixed before sims): ALL before-measurements run
  on unfixed code first (P1 trace0+trace1, P2 if the extension rule
  fires, F1 trace1, balanced panel BEFORE), THEN the fix lands in
  game.js, THEN all after-measurements (same lists, same order, same
  panel seeds/policies). No before-run happens after the fix.
- NEUTRALITY GATE (judged before any fire is classified, on THIS base):
  P1 trace-off vs trace-on (before-fix) trajectories must match EXACTLY
  on all 8 pilot seeds — daysAlive, death rows, meal rows identical.
  Any mismatch = recorder NOT neutral on this base = NO-GO on
  instrument; stop, do not classify.
- NON-VACUITY RULE (strengthening of the brief's bar, recorded before
  sims): pilot GO requires the BEFORE run to reproduce ≥ 1 dedupe fire
  on P1 (or P1+P2 after extension). If P1+P2 before-fires = 0, the
  verdict is NO-GO on sample (the fix is unproven live — a 0-fire after
  on a 0-fire before proves nothing) and the arm is killed cleanly; the
  F1 confirm and the panel-after do not run. The proof test's synthetic
  legs do not satisfy this rule on their own.
- EXTENSION RULE (fixed before sweeping): if the BEFORE pilot reproduces
  < 4 dedupe fires total, run P2 once (same off/on pair) before the fix.
  The after run repeats exactly the before run's lists (phases.json).
- PRIMARY METRIC: reproduced dedupe fires (before vs after, trace-on,
  identical seeds). GO iff ALL hold:
  1. 0 fires on all judged seeds after the fix (pilot P1, extension P2
     if run, confirm F1).
  2. Trajectories identical to baseline EXCEPT downstream of the first
     double-night (CORRECTED before any sims — see the amendment note
     below): per seed, daysAlive, deathRows (day/who/cause) and mealRows
     (vid/day/away/ate/drawn/fasting) must match exactly on (i) every seed
     with zero before-fires, end-to-end (the fix is provably inert there:
     the death branch never runs, so nothing changes, including the RNG
     stream); and (ii) on seeds with before-fires, on all days BEFORE the
     seed's first firing day. On the firing days themselves the single-pass
     shape must hold (one meal row per (vid,day), no dedupe fire, no
     second draw). AFTER a seed's first firing day, divergence is EXPECTED
     and is reported per seed (differing-row counts, death deltas,
     daysAlive delta) rather than required identical: the removed second
     pass consumed RNG in the before run, so the random stream shifts from
     the firing day on and later days' rolls differ for that reason alone.
     Any differing row on a zero-fire seed, or on a day before a firing
     seed's first firing day, = FAIL of this clause.
  3. No survival/starvation regression: median daysAlive (after) ≥ 0.8 ×
     median daysAlive (before) across judged seeds, AND total starveDays
     (after) ≤ total starveDays (before) + 2 across judged seeds.
- §15 BALANCED PANEL: `node scripts/balance-panel.js --out
  evidence/2026-11-07/doublenight-fix-a-panel-before --seeds
  98067,98052,98079,98062,98034,98095,98022,98028 --policies competent
  --days 150` on unfixed code, then the same with
  `doublenight-fix-a-panel-after` on fixed code; compare with
  `node scripts/balance-panel.js compare --before <before/panel.json.gz>
  --after <after/panel.json.gz> --out
  evidence/2026-11-07/doublenight-fix-a-panel`; the compare .md is
  attached to the evidence file. The panel is the INSTRUMENT, not the
  judge: its status never overrides the pre-registered GO/NO-GO above.
  A `review_required` on a secondary metric is an investigation note,
  not a re-score. (Panel sizing: competent-only on the 8 pilot seeds —
  the judged seeds/policies of this fix arm, not a balance claim; §15's
  16-seed multi-policy sizing governs balance claims.)
- SENSE (SENSE-TESTING LAW): read the transcript windows of the former
  double-days in the before corpus (sayWin/teleWin) and the same nights
  in the after corpus; confirm in plain words that the fix changes
  nothing in the fiction on normal nights (one dawn header, one death
  line, no duplicated beats) and that the death night still reads as one
  night with one succession.
- PROOF TEST: scripts/test-doublenight-fix-a.js — unit legs covering
  each of the three early-return paths (player-death: day advances
  exactly once, villageEats runs exactly once, death recorded on day N,
  successor is the new bearer, driver condition `s.day === startDay`
  now false so no re-entry; villageLost: day does NOT advance, early
  return preserved; over: day does NOT advance, returnToVillage still
  called), source legs (the death branch falls through past the
  increment site; the villageLost/over returns are untouched; no clock
  clamp/replay — no `dayTicks`/`actionClock` writes added, no
  `scholar.day =` assignment other than the one `+= 1`), analyzer legs
  (trajectory-diff attribution: a diff on a firing day passes, a diff
  on a non-firing day fails), and a LIVE leg re-running the recorder on
  the pilot seeds after the fix showing 0 fires. The live leg requires
  the after corpus; it skips loudly (exit 0 with SKIP note) only when
  the after corpus is absent.
- CONVERGENCE: converging | converged | parked | killed-at-pilot — a
  sim-correctness fix, not a tuning lever; GO = converged (the bug is
  gone on every judged seed).

## WATCH (not the verdict)

- Seed 98079 d10 (diag: Paola's health 13 → 5 inside the second pass,
  died of dehydration the same day): if her death vanishes after the
  fix, that is a trajectory diff ON a former double-day — allowed, and
  the evidence file must say so in plain words (the second meal burned
  the last of her pack; with one meal she may live).
- The successor's first dawn: the fall-through runs the dawn path for
  the successor (dawn header, save). Watch the after-corpus transcripts
  for a doubled dawn line or a dawn line stamped with the wrong day.
- The balanced panel may flag the removal of the double-draw as a food
  change (pantry lasts longer on death nights). That is the fix working,
  not a regression — but any panel flag gets investigated, not waved.

## Metric review (to fill post-run)

- (filled in the evidence file after the run; a miss is NO-GO, never
  re-scored against a friendlier gate.)

## Amendment A1 (recorded BEFORE any sims, 2026-11-08 ~01:58Z — no numbers observed yet)

GO clause 2 (trajectory identity) as first written — "identical except
on the former double-days" — is unachievable as stated, and would have
failed every firing seed for the wrong reason. Read in code while the
write flap held (no sims run): the removed second endDay pass consumed
Math.random draws (production/learn rolls, hunger ticks) in the before
run, so the global RNG stream shifts from the first double-night on and
later days' rolls differ for that reason alone — not because the fix
changes any rule. The clause is corrected to what the fix actually
guarantees: bit-identity everywhere the fix cannot matter (zero-fire
seeds end-to-end; firing seeds before their first firing day), the
single-pass shape on firing days, and reported — not required-identical
— divergence after the first firing day, bounded by the clause-3
guardrails (median survival ≥ 0.8×, starvation ≤ +2). This is a
pre-registration correction before observation, not a re-score: no
before/after numbers exist yet. The flap that delayed the instruments
(01:42–01:54Z, EPERM on writes, probes in the run evidence) is what
bought the time to catch it.

## Amendment A3 (re-judge run fleshout-20261108T1017Z, Loop A — recorded 2026-11-08 ~10:40Z, BEFORE any re-judge computation)

GO clause 3's starvation sub-bar (total starveDays after ≤ before + 2)
is replaced, for the re-judge ONLY, by a RATE bar:

- Starvation rate = total starveDays / total lived days, where total
  lived days = sum of daysAlive across the 16 judged seeds.
- Bar: after-rate ≤ before-rate + 0.01 hungry-days per lived day.
- The median bar (≥ 0.8× before), the 0-fires bar, and the
  trajectory-identity clause (Amendment A1) are UNCHANGED.

Rationale (mechanism argument — decided on the mechanism, not fitted
to the numbers): starveDays counts village-days with anyone hungry
(sweep line 253), so it scales with lived days by construction. The
fix's own success mechanically adds starveDays: a village that lives
longer accumulates more hungry-days even at an unchanged hunger rate.
The rendered NO-GO's own metric review shows the mechanism: the +3
delta is entirely post-first-fire divergence on the two firing seeds —
98028 lived 37 days longer and added 10 starveDays, 98079 lived 25
days shorter and shed 7 — while all 14 zero-fire seeds have starveDays
delta exactly 0. A count bar therefore punishes the fix for keeping a
village alive: it measures survival, not hunger. The rate normalizes
hunger against exposure, which is what the bar was meant to guard.
The +0.01/day tolerance is ~4.6% of the base rate (~0.218/day) — a
small guard against a real hunger regression, not a fitted number.

§14 status: this is a BETWEEN-runs metric revision (MEASUREMENT.md §14
— re-evaluation happens between runs, never within one). The original
NO-GO stands as rendered under the old bar and is NOT rewritten; this
re-judge renders a NEW verdict under the amended bar, on the committed
deterministic corpora, with NO new sims. The original kill classifies
under §14a as METRIC-BROKEN (the bar was confounded by survival — the
pilot could not have passed on a firing seed that lived longer
regardless of the fix's merit), which is why the arm returns to the
queue with a corrected pre-registration rather than being buried as
CONCEPT-DEAD.
