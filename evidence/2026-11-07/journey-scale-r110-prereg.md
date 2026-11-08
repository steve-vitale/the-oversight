# journey-scale r110 — PRE-REGISTER (lane A, leg 3 SCALE, days 80–140 + tail)

**Run id:** laneA-20261107T2045Z (scheduled 20:45 CST 2026-11-07).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only
(a pilot-gate stop is not success; rotation stays 3).
**Base:** master@fc2cdb0b6 at first scored seed.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price,
nor gate change in this run.
**Perception law (2026-10-28) stands** — raise answers read only live
pending raises from named villagers, answered in a real conversation
with the raiser; the sit drive reads only the engine's own preview.
**DELIVER OVER MEASURE (2026-11-01):** this run diagnoses the wall
r109 named — the feast surge is never used — to its mechanism. A lever
built blind (force feasts, force channels) without the break point
would repeat the parked-Phase-1 pattern (two blind tuning fixes, no
design question answered). The DIAG's deliverable is the named break
stage per seed + the lever target for the next run.

## Standing context (read before scoring)

- **r109 (today, band 97001–97004): NO-GO — the wall is PRICING, not
  sitting.** `feastSurgeUsed` False on 4/4 seeds; every other
  lesser-seat bar met on every seed (waves 4/4/3 distinct, 2+
  contests, 2+ crises, regional+, stage ≥ 2, sentiment taught). The
  sit+modal drive is proven and fired 0 times — nothing was ever
  priced. Raise talks visible (21 read in full). Mutlaq's unanswerable
  raise is a design question, not re-litigated here. Accept echo is
  cosmetic. Realm dissolve/re-stage 2× on 97001.
- **r97 carried, NOT this run's question:** the overnight hydration
  drain (first-attempt ~58–64 vs retry ~14 at the same tile) — still
  open. Its instrument is a different snapshot (pack water / tent /
  tile water at sleep); it is carried again, not bolted onto this run.
- **Canon:** no FEAST canon doc exists — CANON.md registers no feast
  doc, and no doc covers the target. The chain below is read from code
  headers (feastBuff.js, game.js hostFeast, progression.js
  channelSentiment) + docs/TABLE.md:77 (food-thesis deeds), never
  invented. Noted here per the loop body instead of inventing canon.

## The chain (read from code, not invented)

- **S0 lesson:** `teachSentiment()` fires at slot moment t=60
  (progression.js:226) → `pg.sentimentTaught`.
- **S1 keepsake:** `channelReadyKeepsakes()` non-empty — the scholar
  holds a keepsake in the pack.
- **S2 arming:** `channelSentiment` arms when 3+ abilities at L3 OR
  `surgeResonance >= 35` (ability use +1, level-up +5, synergy +10);
  sets `prog.feastSurge`. Policy: competent `channelDevotion` daily
  (trauma < 8, sentiment taught, keepsake ready) — the focused-
  practice branch feeds resonance.
- **S3 feast:** `hostFeast` at Haven, dusk, 1/day, pantry ≥
  max(1500, 400×(heads+1)) kcal, real pantry cost. Policy:
  competent `eveningFeast` (armed cadence 7d, unarmed 14d,
  recentGives7 ≥ 1500 kcal, have ≥ cost×1.5) + `surplusFeast`.
- **S4 grant:** `grantFeastBuff` refuses if the fusion reactor is
  online ("the engine that never hungers never feasts") or if
  unarmed (devotion gate). A fresh grant draws a scavenger to the
  haven's edge (pending encounter, faced or driven off).
- **S5 window:** FEASTED for 2 dawns (`feastedActive`).
- **S6 use:** a strike or ability resolved while feasted AND in
  combat → `noteFeastedCombatUse` → `prog.feastSurgeUsed = true`
  (tbDamage hook game.js:38686; `applyFeastedForm`).
- **S7 seat:** `tableSeat` foodDeeds = sentimentTaught &&
  feastSurgeUsed.

The policy stack HAS every verb: the scale policy calls
`competent.daily`, which runs channelDevotion, eveningFeast,
surplusFeast and the feast-fight road. So the break is downstream
of the verbs — arming, pantry, reactor, or the fight in the window
— and this run names which one, per seed.

## Q1 — WHERE DOES THE FEAST-SURGE CHAIN BREAK? (binding DIAG)

New instrument `scripts/feastchain-instrument-20261107.js` (require,
not a copy — same pattern as the regionalstep recorder): a read-only
daily snapshot + pure-delegation wrappers, installed by the driver
after setupGame.

Daily snapshot (`feastWatch`, same point as tableWatch — after
baseDaily, before endDay): day, sentimentTaught, slot60,
keepsakesReady, resonance, l3count, armed, armedValue,
reactorOnline, pantry, givesCum, feastDay, feasts, surplusFeasts,
devotionChannels, feasted (raw `s.feastBuff` + day < untilDay —
never calls `feastedActive()`, so the snapshot cannot fire the
engine's lazy expiry line), buffUsed, buffUntilDay, surgeUsed,
feastPlan { ok, why, cost, have } (pure read — the plan draws on a
pantry COPY per its header).
Wrappers (each logs its call and forwards exactly; same pattern as
the driver's `sayOncePerFight` wrapper): hostFeast { day, ok, why },
grantFeastBuff { day, granted, why, refreshed, quality },
channelSentiment { day, resonanceAfter, armedAfter },
noteFeastedCombatUse { day } (the deed marking), startCombat
{ day, monsterId, feasted }.
Driver `scripts/journey-scale-r110-20261107.js` (r109 driver clone,
labels/seeds/EVIDIR only + the feast instrument + feast counters in
the census). Analyzer `scripts/analyze-journey-scale-r110-20261107.js`
(r109 analyzer clone + feast-chain section, single leg — no
before/after). Proof `scripts/test-journey-scale-r110-feastchain-20261107.js`
(fake-Game: every wrapper forwards args and returns the original's
return verbatim; snapshot fields read as expected; uninstall restores
originals). Proof green BEFORE any scored seed runs; plus a live
smoke leg (seed 97001, EVIDIR /tmp, discarded) asserting 0
instrument errors and feast-chain rows present.

Policy: r109's sit policy
(`scalecourt-nogate-morntrace3-linkraise-sit.js`), unchanged — the
sit/modal layers are inert without a priced seat (proven byte-
identical in r109), and reusing it keeps the panel comparable to
r109. Single leg: this is a DIAG, not a lever test — the instrument
is read-only + delegating wrappers, so no baseline leg is needed.

Two legs are NOT run. The verdicts below are judged on the one leg.

**Verdicts (checked in order):**
- **FINDING** — every seed's stall stage named with counts: the
  first stage S0–S7 the chain never passes, per seed, with the
  counter evidence (e.g. "S2: resonance peaks 12/35 on 4/4, 0 arms"
  / "S3: 0 feasts on 4/4, plan.why = pantry-short on N days" /
  "S4: 6 armed feasts refused, reactor online" / "S6: 4 grants, 0
  fights in window"). The lever target for the next run is named.
- **CHAIN-COMPLETES** — `feastSurgeUsed` marks on ≥ 1 seed: the wall
  is elsewhere (report which stage completed and where the seat
  still fails). The r109 finding overturns.
- **INCOMPLETE** — the instrument fails to attribute a stall on any
  seed (gap named, no verdict claimed).

**What counts as interesting:** one shared stall stage across 4/4
seeds (the wall has one name); a split (different stages per seed —
the wall is a funnel, not a gate); a CHAIN-COMPLETES (the r109
finding overturns).

## Q2 — CENSUS CONTINUITY (report-only; r93–r109 metric unchanged)

Seasoned-peer count AND scatter-day gap; national/global staging;
seat priced; end cause per seed.

## Q3 — PEOPLE CHECK (sense law)

CONVO_DAYS [90, 120] transcripts read in full + ALL raise-answer
talks read in full. Mutlaq re-check: if a no-shared-words raise
recurs, count it (carried design question, not re-litigated).

## Secondaries (report-only, not judged)

- **National/global staging** (natGate watch, as r103–r109).
- **Table approach** (tableWatch + seat ledger).
- **Village assessment:** census in plain words.
- **D-THING / bonds / betrayals:** carried from the r106 analyzer
  as report-only counts.
- **Raise ledger:** per seed, from the policy stats + raiseHistory.
- **Realm dissolve / re-stage** (r108 documented blank): count per
  seed from natGateWatch / tableWatch rank transitions.

## Seed-band freshness (mandatory, per local_seed_band_freshness)

- Band 97001–97004, DELIBERATE §15 REUSE of r107/r108/r109's band —
  the same matched seeds, exactly as r108 reused r107's. The reuse
  IS the design: this run's instrument is read-only, so no new band
  is consumed and the panel stays comparable to r109.
- Search scope: ALL dated preregs (`evidence/*/sim-*-prereg.md` +
  `evidence/*/journey-scale-*-prereg.md`) grepped for `9700[1-4]`.
  Result: named in exactly three earlier preregs, all today, all
  journey-scale — `evidence/2026-11-07/journey-scale-r107-prereg.md`,
  `evidence/2026-11-07/journey-scale-r108-prereg.md`, and
  `evidence/2026-11-07/journey-scale-r109-prereg.md` — plus no
  forbidden/contaminated list.
- Near-miss, checked not assumed: the four-digit seeds 9700–9711
  (contaminated range quoted in `evidence/2026-11-06/
  sim-killerwild-b-prereg.md:67`) are disjoint from the five-digit
  seeds 97001–97004. No collision.

## Method

- PILOT GATE: baseline seed 97001 runs first. Crash, recorder errors
  > 0, or a reggate file with 0 rows → STOP, do not score the band.
  Then the remaining seeds.
- DAYCAP=180, death-aware (a dead/scattered village stops; +10d tail
  max). Horizon reason (§10): reachability lever (national, table,
  wins) — 150–200d band; r107–r109 used the same cap on the same
  band.
- Telemetry: `telemetry-check.js` against
  `telemetry-baselines/scale.json` after evidence is written (metrics:
  firstCourt, watchers, tableTele, fightsTotal, fightsByWave.4,
  maxGameDay). Any LOUD line is a same-run investigation item before
  the baseline rolls forward. (r107/r108/r109 caveat stands: the
  per-seed files may not carry those metrics in resolvable form —
  report honestly, do not roll a zeroed baseline forward.)
- **Gate note (carried, not hidden):** the full `check.js --quick`
  gate will NOT run inside this run unless it completes quickly — the
  r114 gate (284/6, all adjudicated pre-existing) ran on the line
  this base descends from, and this run changes ZERO src/js (scripts
  + evidence only). The r110 proof tests + pilot evidence are the
  regression cover, as for r107–r109. `check.js --quick` is attempted
  at the end and its result (green or timed-out) is reported honestly.

## Pre-registered metrics (bind the run — §14)

- PRIMARY: per-seed first-day-reached per stage S0–S7 (or never),
  max resonance, keepsakes-ready days, feast attempts / grants /
  refusals by reason, feasted days, fights-in-window, deed-marked
  day, surgeUsed. A miss is INCOMPLETE, never re-scored against a
  friendlier metric mid-run.
- SECONDARY (report-only): survived days, end cause, pop alive/end,
  national/global, seat priced, transcript senseless count (must be 0
  to claim the people check clean), raise-talk senseless count (must
  be 0), dissolve/re-stage count per seed.
- Every run note carries a "metric review" section; if a metric proves
  wrong, the revision is proposed for the NEXT run.
