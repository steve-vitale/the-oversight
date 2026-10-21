# sim-fullseat — full-seat decomposition DIAG (flesh-out loop, 2026-10-21, arm sim-fullseat)

Run: fleshout-20261021T0146Z, arm sim-fullseat. Axis: scale-onramp (the blocking axis).
INSTRUMENT-ONLY — zero src/js changes. Reads the engine's own gate state (table.js, progression.js, table-indispensable.js) and records per-component reach + distance-to-full per run.

Canon: docs/CANON.md + docs/TABLE.md (the table prices the run, never gates on godhood; full seat keeps the national bar per TABLE.md — NOTE: code supersedes doc; see decomposition below) + docs/MONSTER-WAVES.md (wave unlock law).

Named next this DIAG answers (backlog #710): the INDISPENSABLE door is the only never-earned table door (0/16 in the wintrack audit, evidence/2026-10-20/sim-wintrack-audit.md). The sibling DIAG (sim-indispensable, 2026-10-20) measured the binding component as the wave-4/5 deed bars (full seat 0/16, w4≥3 fails 14/14, w5≥2 fails 14/14). THIS arm decomposes the FULL SEAT into exact components and measures each component's reach + distance-to-full on fresh seeds.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE the sweep, 2026-10-21T02:03Z)

**PRIMARY (DIAG-GO): attribution completeness** — every run's full-seat/indispensable outcome fully attributed to component states (which sub-gates failed and by how much), 0 unexplained runs. A run is EXPLAINED iff its record carries the full-seat component vector (all 9 bars: w1..w5, contests, crises, stage, foodDeeds), the indispensable sub-gates (foodShared>0, score≥10), and the wave-4/5 unlock-chain context (standing vs t4/t5, w3-rung, w4 faced). GO threshold: **16/16 attributed, 0 unexplained.** A miss is NO-GO, never re-scored (§14).

**Non-binding (report, not judged):** per-component reach distributions; which component binds most often; how far the closest run got; whether any win-track run was ever close to a full seat (record endRec.tb door + gate state AT THE WIN as well as at run end, since the win ends the measurement window).

**Instrument:** scripts/policies/fullseat-diag.js (new, FULLSEAT=1; pure reads, zero RNG, zero game-state writes) — per-daily snapshot of the engine's OWN gate state, max-reach per component over the run, first-seat-full / first-indispensable moments, win-day snapshot. Sweep: scripts/probe-fullseat-20261021.js. Analyzer: scripts/analyze-fullseat-20261021.js. Proof: scripts/test-fullseat-diag-20261021.js (RED→GREEN component-state detection + det-gate paired seeds byte-identical). Transcripts: scripts/fullseat-transcripts-20261021.js (sense-testing: invitation/audit fiction vs instrument states).

**Substrate:** withFullseatDiag(withSeatDrive(withWinDefer(TF base))) on {leadfeast, belongfeast} tribfloor bases — the SEATDRIVE=1 winning substrate (~10/16 wins) + FEASTSCALE_R13=1. Env: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1. NO tablepathdriver, no relaydark (this is the natural track, not the driven one).
**Seeds:** 64501–64508 × {leadfeast, belongfeast} = 16 runs. **Horizon:** 180d death-aware (dead villages stop simulating; wins truncate — gate states recorded at the win AND at run end).

## FULL-SEAT DECOMPOSITION (the code is authoritative — read 2026-10-21T02:03Z)

**Full seat = `deedGateReady().ok`** (src/js/progression.js:613, via tableSeat() at src/js/table.js:76):

| # | Component | Bar | Source in code |
|---|---|---|---|
| 1 | w1 distinct monsters fought blow-by-blow | ≥5 | deedState().wavesFaced, progression.js:615–626 |
| 2 | w2 distinct monsters fought | ≥5 | same |
| 3 | w3 distinct monsters fought | ≥4 | same |
| 4 | w4 distinct monsters fought | ≥3 | same |
| 5 | w5 distinct monsters fought | ≥2 | same (`w5 >= 2`) |
| 6 | contests survived | ≥3 | deeds.contestsSurvived, progression.js:628 |
| 7 | crises weathered | ≥3 | Object.keys(pg.crises).length, progression.js:630 |
| 8 | integration stage | ≥2 | integrationStage() (systemArrived + integration≥40), progression.js:132–140 |
| 9 | food-thesis deeds | both | pg.sentimentTaught (progression.js:256) AND s.prog.feastSurgeUsed (feastBuff.js:418) |

**Deliberately NOT in the full seat (open design question, progression.js:635–642):** `scale` (national/global rank) is REPORTED in the breakdown but excluded from `ok` since the 2026-10-13 Standing change ("Scale is NOT added here (open design question)"). TABLE.md's "the full seat keeps the national bar" is STALE vs the code — the code wins.

**Indispensable door** (src/js/table-indispensable.js:47–55), in gate order:
- (a) seat.seat === 'full' — the full seat above
- (b) foodShared > 0 ("You never shared the food truth...")
- (c) brokerage + might + foodShared ≥ 10 ("Your standing isn't load-bearing yet...")
- strength = min(100, 30 + foodShared×3 + brokerage×2)

**Wave 4–5 unlock chain** (the deeper distance behind bars 4/5 — src/js/game.js:30670 unlockedWave()):
- Wave 4: w3-rung (day≥25 AND wave-2 ledger kill points ≥5) AND villageStandingTotal() ≥ t4(100)
- Wave 5: w3-rung AND standing ≥ t5(200) AND wave-4 faced (bread counts ≤100 toward t5 — the plenty cap)
- Standing sources (game.js comments): blood (+25 per wave-3+ ledger kill point), bonds (+34 per seasoned regional+ link), bread (+20 per major feast)
- Readiness deferral (design call #4, 2026-10-16, src/js/standing.js:150–200): wave 4/5 release only when waveCombatReadiness(w).ready (armor worn, weapons to hand, counters known, veterans alive with wave-(w-1)+ kills); while deferred the gated total holds at t4-1/t5-1 with the hold beat naming the short bars aloud.

## Results

**PRIMARY (DIAG-GO): 16/16 attributed, 0 unexplained — DIAG-GO.** Every run's
full-seat/indispensable outcome is attributed to component states: the
full-seat component vector (all 9 bars), the indispensable sub-gates, and
the wave-4/5 unlock-chain context including the hold-kind inference
(cap vs defer5 vs below-bar). Instrument errors: 0.

Corpus (evidence/2026-10-21/perseed-fullseat/, 16 runs: seeds 64501–64508 ×
{leadfeast, belongfeast}, SEATDRIVE=1 + FEASTSCALE_R13=1, 180d death-aware):
- **Full seat: 0/16. Indispensable door: 0/16.** Wins: 13/16 (all feared/light,
  all lesser seat). National: 13/16. 3 village deaths (d65, d75, d115); wins
  truncate ~d90–154.

Per-component reach (max reach per run; bar → runs at bar):
- w1 (≥5): 16/16 | w2 (≥5): 15/16 | w3 (≥4): 7/16 | **w4 (≥3): 3/16** |
  **w5 (≥2): 0/16** | contests (≥3): 15/16 | crises (≥3): 16/16 |
  stage (≥2): 16/16 | foodDeeds: 16/16 (sentiment 16/16, surge 16/16)
- Indispensable sub-gates: score≥10: 16/16; foodShared>0: 14/16
- **Binding component (at closest approach): w4 9/16, w5 7/16.**
- Closest run: **leadfeast s64506 — totalDist=2** (w3=5✓ w4=4✓, only w5
  short by 2; won feared/light d90). Next: s64504/s64507 (dist 3).

Wave-4/5 unlock chain (the deeper why — 0/16 wave-5 unlocks):
- hold-kind at run end: **defer5 8/16, cap 2/16, below-bar 6/16.**
- defer5 (all 8 leadfeast): raw standing 207–392 (past 200!), capped 207–252
  (clears the plenty cap too) — but **waveCombatReadiness(5) not ready**:
  short bars named by the engine: **veterans 8/8**, armor 3/8, weapons 1/8.
  Wave 4 unlocked and was fought (w4faced=true on 5 runs, w4 up to 5
  distinct) — but readiness-5 demands veterans with wave-4+ KILLS, and the
  deed bar counts FACED. s64508 fought 5 distinct wave-4s and died d115
  still short on veterans.
- cap (2 belongfeast): raw 284/239 but capped 184/159 < 200 — the plenty cap
  ("bread alone cannot buy the fifth draft"): war+diplomacy < 100.
- below-bar (6): raw standing itself < 200 (belongfeast: war 0–50,
  diplomacy 0–34 — the belong road earns fewer bonds).

Win-track (gate state AT THE WIN vs at run end): all 13 wins feared/light
on the lesser seat; distAtWin == distAtEnd on all 13 (the win-day snapshot
confirms no post-win drift — the measurement window ends at the win).
**A win-track run came within 2 wave-5 fights of a full seat** (s64506).

Telemetry deviation check: quiet. Baseline scale-wall.json (winseat regime:
national 12/16, wins 16/16) vs this corpus (national 13/16, won 13/16) —
swings 8%/19%, under the 60% LOUD bar. The two "LOUD: won newly appeared"
lines are a metric-name artifact (baseline key is `wins`, records carry
`won`), not a regime deviation. No baseline roll (DIAG-only run).

## Analysis

The indispensable door's gate decomposes into three nested locks, and the
sweep names exactly which one binds:

1. **The dependence sub-gates do NOT bind** (score≥10: 16/16, foodShared>0:
   14/16). A village that teaches the food truth once and has any
   brokerage/might clears them. The "galaxy must need you" fiction measures,
   on this substrate, as already-earned.
2. **The full seat binds on the wave-4/5 deed bars** (w4 9/16, w5 7/16 as
   the worst unmet component; w5=0 on all 16 runs).
3. **The wave-5 unlock binds on combat readiness, not standing.** On the
   leadfeast road the village EARNED the standing (raw up to 392) — the
   plenty cap is not the binding hold there (cap binds only 2/16, both
   belongfeast). What holds wave 5 at 199 is **defer5: no living veterans
   with wave-4+ kills** (8/8), plus armor/weapons shortfalls. The village
   can face wave-4 monsters (5 distinct on s64508) without producing the
   veterans readiness-5 demands — faced ≠ killed, and the deed bar rewards
   the former while the unlock demands the latter.

In one line: **the indispensable door is gated on wave-5 fights; wave-5
fights are gated on veterans; the feast road doesn't manufacture veterans.**
The wintrack audit's "wave-5 door shut" is now mechanized: it's the
readiness deferral (design call #4, 2026-10-16), not the standing bars.

Note the asymmetry this exposes: deedGateReady counts wave-4 FACED (w4≥3
met on 3/16), but wave-5's unlock needs wave-4 KILLS-by-veterans. A village
can satisfy the w4 deed bar through defensive engagements and still be
readiness-blocked from ever seeing wave 5. The two systems measure
different things (exposure vs capability) by design — but it means the
w4 bar is a misleadingly soft prerequisite for the w5 bar.

## Sense-testing (invitation/audit fiction vs instrument states)

Two transcripts (evidence/2026-10-21/fullseat-transcripts/):
leadfeast-s64506 (the closest run, d78–102) and belongfeast-s64501 (d140–156).

Verdict: **the audit fiction matches the instrument exactly on the
lesser-seat components** — s64506: "A lesser seat — global standing, waves
1–3 faced (14/9/5), 5 contests survived, 3 crises weathered" vs instrument
w=14/9/5, contests=5, crises=3, rank=global. s64501: "(14/9/3), 18 contests,
5 crises, regional" — exact. The System reads the run back honestly.

**The gap: the audit never voices wave-4/5 deeds at all.** The template
(table.js:485–486) names only waves 1–3 + contests + crises. s64506 had
w4=4 — the full-seat wave-4 bar MET — and was 2 wave-5 fights from a full
seat; the audit reads as if wave 4 never happened. For the door whose
entire gate IS the wave-4/5 deed bars, the audit is silent about exactly
the deeds that matter. Villager anticipation dialogue ("The table's set.
The ring of pale light — it's just sitting there. Waiting on them.",
d79/d88, before the d90 invitation) reads as rumor and is people-like.

## Metric review (§14 anti-drift)

The pre-registered metric (attribution completeness, GO = 16/16) held —
16/16 attributed, 0 unexplained. No re-scoring was done or needed.

Instrument notes for the NEXT run (not this one):
1. The probe's `require.main` guard was missing — importing the probe
   executed the sweep (harmless here: resume skipped all 16, rewrote the
   summary). Fixed: `if (require.main === module)`.
2. The analyzer's `distAtMax` initially omitted the foodDeeds distance (NaN
   risk in the closest-run score) — fixed before the sweep.
3. telemetry-check's single-`*`-in-basename glob can't take
   `perseed-fullseat/*/*.json`; ran per-policy-dir. Consider teaching it
   `**` or multi-dir.
4. The winTrack record's `seat` field came back null (endingKey doesn't
   carry the seat); seat is read from the winSnap instead — sufficient.

## Named nexts

1. **[instrument]** The audit fiction (table.js:485–486) never voices
   wave-4/5 deeds — the exact bars the full seat (and the indispensable
   door) gate on. A run 2 fights from full hears nothing of its wave-4
   deeds at the audit. Policy-side can't fix fiction; file for the
   table-text lane (small: extend the seatLine template with w4/w5 faced
   when >0).
2. **[axis]** The veteran-manufacturing question is now the sharp end of
   the scale wall: wave-5 readiness needs living veterans with wave-4+
   kills; the feast road faces wave-4s (w4faced 5/16) without producing
   them. What manufactures veterans on this substrate — and whether the
   readiness demand (design call #4) is tuned right — is the next
   scale-onramp arm.
3. **[observation]** The belong road's standing mix (war 0–50, diplomacy
   0–34) never reaches raw 200 on 4/8 runs — below-bar is a belong-side
   phenomenon; leadfeast clears raw 200 on 8/8. Bonds (diplomacy) is the
   belong road's missing standing leg.
4. **[design]** w4 deed bar (faced) vs wave-5 readiness (veteran kills)
   measure different things; the w4 bar can fill without moving the w5
   unlock at all. Worth a Steve-call whether that's the intended
   relationship.

## Files

- scripts/policies/fullseat-diag.js — the component-recorder layer (FULLSEAT=1; pure reads, no RNG, no game-state writes)
- scripts/probe-fullseat-20261021.js — the DIAG sweep (SMOKE/DET/sweep + resume; require.main-guarded)
- scripts/test-fullseat-diag-20261021.js — proof (RED→GREEN; 14/14: component-state detection 9/9, guard, read-only 2/2, det-gate 2/2)
- scripts/analyze-fullseat-20261021.js — per-component reach/distribution + binding verdict + hold-kind
- scripts/fullseat-transcripts-20261021.js — sense-testing capture (invitation/audit fiction)
- evidence/2026-10-21/perseed-fullseat/{leadfeast,belongfeast}/s64501–s64508.json — 16 per-seed JSONs
- evidence/2026-10-21/fullseat-corpus-summary.json — the corpus summary
- evidence/2026-10-21/fullseat-transcripts/leadfeast-s64506.txt — closest-run transcript
- evidence/2026-10-21/fullseat-transcripts/belongfeast-s64501.txt — belong-side transcript
- evidence/2026-10-21/sim-fullseat.md — this file (pre-registration + results)
