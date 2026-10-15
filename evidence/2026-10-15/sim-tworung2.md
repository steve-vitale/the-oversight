# sim-tworung2 — the two-rung bind RE-MEASUREMENT + national hold-duration (2026-10-15)

Worktree: `~/workspace/worktrees/sim-tworung2`. Run: oversight-flesh-out-loop (loop A), scale-onramp axis, lever-2 lens.
Axis lens: scale-onramp / lever 2 (wave unlock pacing). **Instrument-only**: zero src/js changes — diagnostic scripts + evidence only.

Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md, hidden_files/wave4-standing-spec.md.
The rung definitions CHANGED since r17 (readiness-gate v3, landed 7a72b456): the old
two-rung gate (4 wave-3 ledger kill points AND regional+ scale, 0/16 met both in r17) is now
the Standing bar in src/js/standing.js — raw = war (25 × wave-3+ ledger kill pts, per-type
cap 2) + diplomacy (34 × seasoned regional+ links, 30+ days / trust 40+, polity-participating)
+ plenty (20 × major feasts, quality ≥ 1); gated: faced-experience deferral (wave 4 needs
3 distinct wave-3 types faced blow-by-blow, else held at 99; wave 5 needs 2 distinct wave-4
types, else held at 199), plenty cap 100 toward T5=200, monotonic peak ratchet (never re-locks).

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE sims)

- **Question**: does the faced bar move the kill rung? Re-measure the two-rung bind shape on the
  current tip, and close the national hold-duration gap (how long national-rank runs hold, loss modes).
- **Instrument**: scripts/sweep-tworung-20261015.js (sampler) + scripts/tworung-lib-20261015.js
  (read-only readers + rung-bin / hold-loss attribution). Reuses the landed tablerecon/readinessbind
  machinery: sim-harness.js (loadGame/setupGame/runDays), food-coupling-20261013.js
  (attachInstruments/dailyRow/finalize — wall numbers), scale-repro-20261013.js
  (attachScale/scaleRow/finalizeScale — daily rank/link/beat/break telemetry), readinessbind-lib.js
  (standingBreakdown/waveEngaged/trajectoryHash readers). Say/sysSay beat ring + structured
  registerDeath wrap (tablerecon pattern). Sampling proven trajectory-neutral (proof G3).
- **Rung bins** (wave-4 non-unlocks, best-ever progress — the generous read): old-rung successors are
  blood side = war/100 ≥ 0.5 (half a pure-war path) and scale side = diplomacy/100 ≥ 0.5.
  'blood/faced-rung' (bonds ≥ half path, blood < half), 'scale-rung' (blood ≥ half, bonds < half),
  'both' (neither side ≥ half — includes plenty-only), 'neither' (both sides ≥ half but still locked,
  or raw ≥ 100 without release — sub-attributed: deferral-hold / hybrid-gap / unexplained).
  Wave-5 non-unlocks (w4 unlocked): 'cap-hold' / 'defer5-hold' / 'raw-shortfall' / 'unexplained'.
- **National hold**: from daily scaleRank rows — first/last day at national+, holdDays, lossDay;
  lossMode: link-break (breakLink ±3d) / village-death (endReason village-dead/lost ±5d, incl.
  died-at-national) / tribute-collapse (home-link arrears surge +2000 kcal in the 7d before loss) /
  succession-exile (scholar.exiled fired) / succession-collapse (person/scholar death ±3d with
  nothing else firing — the polity dissolves on succession) / held-to-end / unattributed (named honestly).
- **Substrate**: courtship road — fourthlink (FOURTHLINK=1) + leadfeast/belongfeast (FEASTSCALE_R13=1),
  8 seeds (11/22/33/44/55/66/77/88), 180d death-aware, identical seeds. Own control in the same
  sweep — this IS the current-tip baseline (CONTROL BASELINE DRIFT #247: no inheritance from r17
  or sim-readinessbind/v3 numbers; NARRATION→RNG COUPLING #263: sweep JSONs re-measured on this tree).
- **PRIMARY (diagnostic GO)**: ≥ 80% of wave-4 non-unlocks attributed into rung bins
  (named bins with non-anomaly subs) on the current tip, AND every national reach has
  hold-duration + hold-loss attribution. GO → land the instrument as its own commit (scripts +
  evidence only). MISS → evidence-only, the blank stays open with measured coverage.
- **Det-gate**: proof scripts/test-tworung-20261015.js REAL RED→GREEN (R1 naive-bin RED 3/3,
  R2 naive-probe hash-divergence RED, R3 broken-loss-mode RED 2/2; G1 8/8 bins, G2 6/6 wave-5 bins,
  G3 instrument ON/OFF byte-identical 60d seed 33 leadfeast, G4 10/10 hold-loss fixtures, G5 15d smoke
  × 3 policies) — 34/34 green before sim spend; SMOKE=1 instrument-honesty gate on the sweep
  (named-export unwrap + ≥10 standing samples/policy; LOUD fail on policy-less).
- **Wall numbers every run**: national / table / wins, wave 4–5 unlocks, median survival, death-cause shares.
- **Sense-testing**: ≥ 3 wave-4 unlock / hold-loss moments sampled from transcripts — do they read as
  village story? (SENSE-TESTING LAW.)

## Gates (all green before spend)

- Proof `scripts/test-tworung-20261015.js`: **34/34 GREEN** (pre-sims, independently re-run;
  includes REAL RED phases R1/R2/R3 and the died-at-national + succession-collapse fixtures G4.8–G4.10).
- SMOKE=1: 24 smoke runs (3 policies × 8 seeds × 15d) — all sampling, ids unwrap, no crashes.
- Two instrument bugs caught and fixed before/during the sweep (both LOUD, neither silent):
  1. the sweep's daily wrapper `return`ed the policy's daily before the sampler ran — SMOKE caught it (0 samples);
  2. died-at-national was misread as held-to-end — fixed the loss taxonomy (village-death), re-proved, re-ran;
  3. the beat ring's 600-cap starved late windows on long runs — replaced with a 4000 ring buffer, re-proved, re-ran.

## Results

24 runs (3 policies × 8 seeds, 180d death-aware), deterministic across re-runs.

**GO: PRIMARY MET — 9/9 wave-4 non-unlocks attributed (100% ≥ 80% bar), 13/13 national reaches
with hold-duration + hold-loss attribution (0 unattributed).** Instrument lands as its own commit.

## Rung-bin attribution (wave 4) — the bind shape on the current tip

15/24 unlocked wave 4 (vs 0/16 on the r17 substrate — different policy mix, not a clean before/after).
9 non-unlocks:

| bin | n | who |
|---|---|---|
| both | 8 | villages that died or stalled before building standing: raw best-ever 0–40, days 33–171, war 0–25, bonds 0–34 — neither old-rung side ever reached half a pure path |
| neither | 1 | **fourthlink s88 — deferral-hold**: raw 136 (4 regional+ links, dip 136) ≥ 100 but faced-3 = 0/3 — the faced deferral held a diplomacy-built village at 99 |
| blood/faced-rung | 0 | — |
| scale-rung | 0 | — |

**The old two-rung shape is gone.** No non-unlock sits on exactly one old rung: the Standing bar
merged kills and scale into one bar, and diplomacy alone (3–5 links), plenty alone (5+ feasts), or
hybrids all clear T4. The 8 'both' cases are not a bind at all — they are early death / stagnation
(raw 0 on 4/8: dead by day 33–53). The one genuine gate case is the new rung: the faced-3 deferral.

**Does the faced bar move the kill rung? Yes — it replaced it.** The war road is vestigial:
warPts at the 15 unlocks = 0,1,0,0,4,2,1,1,0,1,1,0,2,1,0 (median 1; nobody built war standing past
125). Meanwhile faced-3 at unlock = exactly 3 on 13/15 (4 on 2/15) — the deferral binds then
releases. s88 is the poster: 4 seasoned links, 136 raw standing, ZERO wave-3 types faced —
held at 99 by the deferral, died at national d103 without wave 4. The diplomacy road can now
reach T4's number without ever standing on the grid with the Final Draft, and the faced bar is
the only thing stopping it. That is the v3 design working as intended — but it also means the
"kill rung" no longer selects for anything: no run in this suite earned wave 4 by blood.

Unlock drivers at first-observed unlock day (latch samples): diplomacy 3–5 links on 10/15,
plenty 4–14 feasts on 11/15, war meaningful (>50) on 2/15 (leadfeast s22: 4 pts + 3 links + 9 feasts,
raw 382; s33: 2 pts + 3 links + 9 feasts, raw 332). Unlock days d51–d144 (median ~d79).

## Wave-5 attribution

6/15 wave-4 unlockers reached wave 5 (all leadfeast except belongfeast s77). All 6 had faced-4
exactly 2/2 at unlock — the deferral bar binds then releases, same pattern as wave 4.
9 w4-unlocked non-w5: **raw-shortfall 5, cap-hold 4, defer5-hold 0, unexplained 0.**
The cap-hold 4 are the plenty-road bind: raw ≥ 200 but plenty capped at 100 toward T5
(belongfeast s77 escaped it via war 75 + dip 34 + capped plenty = 209). No run was held by the
faced-4 deferral without also being raw-short — the T5 bar is a standing bar first, a faced bar second.

## National hold-duration + loss modes

13/13 national reaches fully attributed. Hold-days: **[81,19,21,38,28,88,105,105,98,105,3,81,106],
median 81d.**

| loss mode | n | notes |
|---|---|---|
| village-death | 6 | the village died HOLDING national — the rank never fell (fourthlink s22/s44/s66/s77/s88, leadfeast s22). Died at 94–179d, rank national/global to the end. |
| held-to-end | 5 | 180d survivors still national/global at the horizon (leadfeast s33/s44/s77/s88, belongfeast s88) — censored by the horizon, not proven permanent. |
| succession-collapse | 1 | **belongfeast s44**: scholar Konrad Jarosiński died in combat d74 → "the dead hold no treaties" → "the realm came apart — no polity answers to Haven now" → national lost d75 after a 3d hold. New loss mode, transcript-verified. |
| tribute-collapse | 1 | **belongfeast s77**: home-link arrears 0 → 12,904 kcal in 7d → rank fell national→regional d155. The village SURVIVED the demotion (180d at regional) — rank loss is survivable. |
| link-break | 0 | no national was lost to a deliberate break in this suite. |
| succession-exile | 0 | no exiles. |
| unattributed | 0 | — |

**Separating factors (holders vs losers), named honestly: unconcentrated at the rank level.**
The rank itself has no distinct failure mode — 6/8 losses are the village dying under the rank
(the same combat attrition as everywhere else; r17's "milestone, not failure mode" holds).
The two mechanical demotions (succession-collapse, tribute-collapse) are real but rare (2/13).
The visible separator is the substrate, not the rank: all 5 held-to-end are leadfeast/belongfeast
(the feast machinery's survival effect: leadfeast median 180d vs fourthlink 103d); all 5
fourthlink nationals died holding the rank. With n=13 this is suggestive, not separating.

National-scale activity: lead road (fourthlink/leadfeast) pays 0 tribute out post-national
(subordinates pay Haven); belong road pays 79–213k kcal post-national. Tends post-national:
11–150 on the lead road. Proposals post-national: ~0 (the courting is done by then).

## Wall numbers

| policy | national | table | wins | w4 | w5 | median | max |
|---|---|---|---|---|---|---|---|
| fourthlink (8) | 5/8 | 0/8 | 0/8 | 4/8 | 0/8 | 103d | 179d |
| leadfeast (8) | 5/8 | 6/8 | 0/8 | 6/8 | 5/8 | 180d | 180d |
| belongfeast (8) | 3/8 | 6/8 | 0/8 | 5/8 | 1/8 | 162d | 180d |
| **all (24)** | **13/24** | **12/24** | **0/24** | **15/24** | **6/24** | **153d** | **180d** |

Wins 0/24 — the win path stays blocked (expected: this arm is the unlock gate, not the win).
Table 12/24 with 0 wins: the lesser seat is reachable (belongfeast s55 reached table with NO wave-4
unlock and NO national — the feast road opens the lesser door alone); the full seat's w4/w5
distinct-fought bars + the win flag are the remaining wall. fourthlink reaches national (5/8)
and wave 4 (4/8) but never the table (0/8) — the food-deed rung is the feast machinery's
contribution, confirming r13's diagnosis from the other side.

## Death-cause shares

334 people deaths: **combat 50%, monster 16%, sickness 13%, starvation 6%, contest 4%**,
other 11% (dehydration/lockjaw/ambush/thirst/alien, all n≤3). No new death mode. The profile
matches the r16/r17 courtship baselines — combat attrition dominates at every scale, including
at national (the 6 died-at-national villages show the same mix). Starvation is 6% (18 starveDays
total) — the r6-era starvation-at-scale story is absent on this substrate.

## Village assessment (plain words)

Two kinds of villages. The fourthlink villages court hard and die holding their rank: five
reached national, four unlocked wave 4, and all five nationals died with the rank still on —
s22 lived 179 days, held national 81 of them, died at global rank the day before the horizon.
Their stories are successions and sieges: Carlos dies d81 ("the dead hold no treaties"), the
realm forms d82 ("Four fires. One head"), the System defers then releases wave 4 d83. The
leadfeast villages are the long-lived ones: five 180-day survivors at global rank, feasts every
few days, wave 5 by d160, the table waiting — but nobody wins. The belongfeast villages live
the tribute story: s77 holds national 81 days, misses tribute, watches the realm come apart
d154 ("Arrears: 12,904 kcal. The air changes."), and keeps living at regional to day 180 —
demotion is survivable, and the transcript treats it as a chapter, not an ending. The eight
'both' villages are the short ones: dead by day 33–53 in combat, standing 0, never in the game.
Nobody in this suite earned wave 4 by blood — the war road is a rumor (median 1 kill point at
unlock). The village that came closest to the old bind's shape is s88: four seasoned links,
136 standing, national at d77 — and wave 4 never opened, because it never stood on the grid
with the Final Draft. The faced bar is the bouncer now.

## Sense-testing (SENSE-TESTING LAW — read, not counted)

Four moments sampled, all read as village story:

1. **leadfeast s22, wave-4 unlock (d83)**: the day before, scholar Carlos Diaz dies in combat —
   "🕯️ Carlos is dead — and the dead hold no treaties. Every link Haven has shakes." / "The mantle
   just... transfers." Next day the realm forms ("Four fires. One head. GOVERNANCE LAYER: online"),
   the System defers ("The Mirror Draft is still waiting. Stand on the grid with the Final Draft —
   2 of 3 kinds faced."), then releases ("📡 RATINGS ARE UP... Wave 4 talent has been released.
   The Mirror Draft opens."). Succession, statecraft, and the System's voice in three days. PASS.
2. **leadfeast s22, wave-5 unlock (d99)**: the defer5 beat ("The fifth draft stays in the wings.
   Stand before the Mirror Draft's champions — 1 of 2 kinds faced."), grain aid going out to three
   villages ("Someone's grandmother over there will remember who fed her."), a thin tribute
   arriving ("they sent everything the wagons could carry"), then the greenlight. PASS.
3. **belongfeast s44, succession-collapse (d74–75)**: "🕯️ Konrad is dead — and the dead hold no
   treaties. Every link Haven has shakes." / "With Haven grieving, Emberhold installs their own
   speaker at the table. Tribute rises to 25,313 kcal/week. Grief is leverage, and they know it."
   / "◈ The realm came apart — no polity answers to Haven now, and Haven is a free fire again."
   A 3-day national reign ends in a funeral and a shakedown. PASS.
4. **belongfeast s77, tribute-collapse (d154–155)**: "⚠️ Emberhold notices the missing tribute.
   Arrears: 12,904 kcal. The air changes." → "◈ The realm came apart..." → and then life goes on:
   raids, a beggar at the fire ("Our jars are empty. I'm asking for food."), foraging. The demotion
   reads as a chapter. PASS.

Mild robotic note (filed, not chased): the night-raid beat repeats verbatim across nights
("They carried off ~N kcal from the pantry. Nobody's dead, but the message is clear: the ground
is theirs too, and they're done asking.") and the pantry-check beat repeats with different
names/tasks — template repetition visible in long runs.

## Blanks filled / documented

- **FILLED**: the two-rung bind re-measured on the current tip — the old shape (kills XOR scale,
  0/16 both in r17) is gone; 15/24 unlock wave 4 on diplomacy/plenty/hybrid paths, 8/9 non-unlocks
  are early-death 'both', 1/9 is the faced-3 deferral holding a 4-link diplomacy village.
  The faced bar replaced the kill rung (warPts median 1 at unlock; faced-3 exactly 3 on 13/15 unlocks).
- **FILLED**: national hold-duration gap — median 81d over 13 reaches; loss modes village-death 6,
  held-to-end 5, succession-collapse 1 (new mode: polity dissolves on succession), tribute-collapse 1.
  No link-break or exile losses in this suite.
- **FILLED**: two-rung + hold instrument (scripts/tworung-lib-20261015.js + sweep-tworung-20261015.js;
  proof 34/34 with REAL RED; trajectory-neutral sampler; reusable for future unlock-timing arms).
- **DOCUMENTED (sim-findings.md)**: raid/pantry-check beat template repetition (open, minor);
  beat-ring 600-cap starving late windows (fixed in the instrument); the succession-collapse loss
  mode (measured — new engine beat sequence worth knowing for future arms).

## Metric review

Per §14, the pre-registered bins bind this run — no re-scoring. Two observations for the NEXT run's
metric design (not this run's verdict):
1. The 'both' bin is dominated by early-death villages (4/8 dead by d53, raw 0) rather than genuine
   mid-game binds. A future re-measurement should split 'both' into 'both-early' (dead/stalled
   before day ~60) vs 'both-stalled' (survived but never built standing) — the bind-shape question
   is about the second, and this run's 8 are mostly the first.
2. The 'neither'/deferral-hold sub is doing real work (s88) — keep it; consider promoting the
   deferral bite to a first-class bin if future substrates produce more diplomacy-heavy non-unlocks.

## Convergence

scale-onramp stays the blocking axis. The wall's face on the current tip: the wave-4 gate OPENS
(15/24 on the courtship+feast substrate; the r17 0/16 was the old kill+scale gate), wave 5 opens
for the feast-heavy (6/24), national is reached (13/24) and held a median 81d — but wins are still
0/24 and the full seat's w4/w5 distinct-fought bars are the remaining climb. The war road's
collapse (median 1 kill point at unlock) is the standing directive's next named question: is
blood supposed to be a live path, or is the faced bar its replacement by design? (Steve's call —
the Standing spec's "4 kills = 100: the pure WAR path" is currently unreachable in sims.)

## Telemetry note for coordinator

`evidence/2026-10-15/sim-tworung2-runs.json` summary ≈ {national: 13/24, table: 12/24, wins: 0/24}.
The seeded scale-wall.json baseline is national 8/16 on a different substrate (2×8 courtship-road
files: belongseek/leadcourt without the feast layer). This suite is 3×8 (fourthlink + leadfeast +
belongfeast, FEASTSCALE_R13=1) — the policy mix differs by construction, so a national LOUD line
against that baseline is EXPECTED-up, not a deviation: the feast machinery's survival effect
(median 153d vs the baseline's shorter horizons) is the known driver. Do not roll the baseline
on this suite without a same-substrate decision.
