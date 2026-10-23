# Journey Endgame r44 — THE FULL SEAT IN THE ENDGAME WINDOW (Lane B)

**Run id:** playtest-loop2-20261023-1700 (oversight-playtest-loop-2, lane B).
**Worktree:** `journey2-endgame`. **Base:** master 71a8f0197 (pulled at run start).
Rotation-b read 4 at start (endgame); this run plays leg 4.

## PRE-REGISTRATION (MEASUREMENT.md §§9–12, 14 — written before the sweep ran)

**Leg question:** FULL-SEAT REACH IN THE ENDGAME WINDOW. Two findings point here:
(1) scale-leg F2 NO-GO (2026-10-23, lane A r24): wave-5 never unlocked inside the
scale window; the full seat's w5≥2 bar stayed unoffered. Metric review: "the
full-seat bar is mis-scoped for the scale leg — it belongs to lane B's endgame
(wave-5 unlocks land d112–176 even with wave-seeking play, per the flesh-out
loop's measurement)." (2) r43 wave-deed census (lane B endgame, 2026-10-23):
w5=0 on all 3 sitting seeds; 85015 died TO a wave-5 ("Big Ugly") at the
horizon's edge — touched, not cleared.

**The question:** under wave-seeking competent play (deed-seeking policy —
patrols 3x/week for encounters, engages at fight start, competent's mid-fight
eject), inside the 140d+ endgame window (180d horizon, death-aware), can the
FULL seat be earned? If not, WHICH components bind — read from the engine's
own deedGateReady bars via the fullseat-diag pure-read layer (flesh-out loop,
sim-fullseat, backlog #710).

**What would count as interesting:** ≥1/5 full seat earned (the bar is
reachable, just rare — TABLE.md says the full seat keeps the national bar, so
rare is correct); 0/5 with w5 deeds nonzero (touchable but not fillable — the
unlock chain lags the window); 0/5 with w5=0 (the gate never opens in the
endgame window even under wave-seeking play — the "aspirational" bar is out of
reach of the window it's designed for); the voicing control failing (a real
regression on the canonical test); the full-seat binding blockers being
non-wave (contests/crises/stage/foodDeeds — a different design conversation).

**Bindings (a miss is NO-GO, never re-scored mid-run):**
- M1 GUARD (r43 metric-review restatement): ≥4/5 seeds reach the window
  (announceDay != null) OR resolve via a voiced non-table path (reactor
  honesty beat / honest death-scatter / key-deferral) — counting coherent
  resolution, not just sitting.
- M2 FULL-SEAT REACH: ≥1/5 seeds earns the FULL seat (diag firstFullSeatDay
  != null). 0/5 = the bar is unreachable in the endgame window under
  wave-seeking play — a design finding, never re-scored.
- M3 WAVE-5 CONTACT: ≥1/5 seeds faces ≥1 wave-5 (diag max.w5 ≥ 1) —
  distinguishes "the gate blocks" from "can't fight it".
- M4 VOICING CANONICAL (carried): 86015 (forcedrift) — bandCrossings ≥1 AND
  noticedCount ≥1.
- M5 PEOPLE: ≥2 beats sense-read in full, 0 senseless flags.
- REG (inherited, binding): r35 auditNamed on sat seeds with nonzero w4/w5;
  r37 satPenalty present + voiced match on sat seeds.

**Seeds:** fresh 86011–86015. **Plans:** 86011–86014 'waves' (deed-seeking +
FULLSEAT=1 diag); 86015 'forcedrift' (deed-seeking + relaygrey FORCEDRIFT=1 +
FULLSEAT=1 — the canonical voicing control, carried). **Horizon:** 180 days,
death-aware (+10d tail max). **Env (before any require):** FULLSEAT=1,
RELAYGREY=1, TELEMETRY_FULL=1. (RELAYGREY_FORCEDRIFT managed per-seed inside
runSeed — '1' on the forcedrift plan only. FID mode unsets FULLSEAT/RELAYGREY.)

**Instrument:** scripts/probe-endgame-r44-20261023.js (r43 probe machinery +
deed-seeking base + withFullseatDiag outside everything; the waves plans never
wrap relaygrey; competent has no relay road so no ownership conflict).
Verdict: scripts/analyze-endgame-r44-20261023.js. Gates: DET (full instrument
on twice byte-identical), FID (FULLSEAT/RELAYGREY unset: wrapped ==
pure deed-seeking).

## RESULTS
(to be filled after the sweep)

## RESULTS (5/5 seeds, 180d, death-aware)

Sweep completed 2026-10-23 ~22:32Z. Analyzer verdict:
`scripts/analyze-endgame-r44-20261023.js`. Instrument gates: DET GREEN
(byte-identical, 2x120d), FID GREEN (FULLSEAT/RELAYGREY unset: wrapped ==
pure deed-seeking, byte-identical). SMOKE GREEN (pipeline end-to-end).

| seed | plan | announce | sat | end | alive | full-seat max reach |
|------|------|----------|-----|-----|-------|---------------------|
| 86011 | waves | — | — | village-lost (famine scatter d99) | 7 | w1=16 w2=11 w3=5 w4=0 w5=0, standing 45 |
| 86012 | waves | — | — | village-lost (combat extinction d144) | 0 | w1=22 w2=8 w3=7 w4=0 w5=0, standing 25 |
| 86013 | waves | — | — | village-lost (combat extinction d155) | 0 | w1=11 w2=9 w3=4 **w4=2** w5=0, standing **199** |
| 86014 | waves | — | — | village-lost (famine scatter d60) | 8 | w1=17 w2=5 w3=0 w4=0 w5=0, standing 0 |
| 86015 | forcedrift | — | — | survived d180, reactor priced refusal voiced | 11 | w1=14 w2=9 w3=6 w4=0 w5=0, standing 99 |

Binding blockers (from max reach, deedGateReady bars): every seed binds on
w4/w5 — 86011 [w4:0/3, w5:0/2], 86012 [w4:0/3, w5:0/2, foodDeeds:no-surge],
86013 [w4:2/3, w5:0/2], 86014 [w3:0/4, w4:0/3, w5:0/2, no-surge],
86015 [w4:0/3, w5:0/2, no-surge]. w1/w2/w3/contests/crises/stage all clear
easily on the wave-seeking road.

- **M1 GUARD: GO 5/5** — 4 honest deaths (2 famine scatters: "Haven couldn't
  hold... The scattering, again."; 2 combat extinctions: "Nobody is left...
  the way villages end when the teeth find them first.") + 1 reactor priced
  refusal, all voiced. The restated guard counts coherent resolution.
- **M2 FULL-SEAT: NO-GO (binding)** — 0/5 earned the full seat. The closest
  approach: 86013 (standing 199 = t5−1, w4=2/3) died in combat at d155.
- **M3 WAVE-5 CONTACT: NO-GO (binding)** — 0/5 faced a wave-5.
- **M4 VOICING CANONICAL: NO-GO (binding)** — 86015 (forcedrift): 0
  crossings, 0 notices. DIAGNOSED as instrument misdeployment, not a voicing
  regression (see metric review): the relaygrey layer never claimed the
  office — `switchboardAvailable()` needs `networkLive` (Regional Dawn),
  which needs a 21-day-old bond, which needs COURTSHIP. deed-seeking
  (competent base) never courts; the office never arrived (claimWaiting 180,
  firstAvailableDay null). The control measured nothing.
- **M5 PEOPLE: GO** — 2 beats sense-read in full (below), 0 senseless.
- **REG r35 / r37:** vacuous GO (no sat seeds).
- **PRIMARY: NO-GO** (M2, M3, M4 binding). **ALL: NO-GO.**

## Village assessment (census in plain words)

**86011 — the hungry.** Scattered at day 99 on the third hungry day — 7
alive walked "in different directions. The scattering, again." It had filled
w1–w3 (16/11/5) and 13 contests, but the pantry was an echo: 3x/week
farthest-first patrols burned what the village couldn't replace. Deeds
without bread.

**86012 — the bled.** Extinct at day 144, 0 alive. Filled w1=22 (the most
wave-1 deeds in any endgame seed this lane) and w3=7, but never unlocked
the wave-4 rung (standing 25). The fights were won; the war was lost.

**86013 — the almost.** Extinct at day 155, 0 alive. The closest any
wave-seeking seed has come: standing 199 (ONE short of the t5=200 wave-5
gate), w4=2/3, foodShared 161, score 434. Six villagers died in one night
stretch under treeline siege (Loud-Eyes, The Ugly Beast, The Eater gorging
600–1,350 kcal/night) before the third wave-4 could be faced.

**86014 — the starved.** Scattered at day 60, 8 alive, w3=0, standing 0.
The patrols outran the pantry before the wave ladder even started.

**86015 — the cold spot.** Survived to day 180, 11 alive, never announced.
The bearer holds the fusion reactor (pellet); the table priced the run
aloud and withdrew: "WE PRICED THE RUN. NO HUNGER ON THE RECORD — THE
PELLET HUMS WHERE THE FIRE SHOULD BE... The ledger still wants: a regional
standing; the food-thesis deeds. The mantle may pass to hungrier hands."

Who leads: the bearer on all five — no succession. Who is miserable: the
dead, honestly. What is missing: nothing structural in the beats; the
finding is the road itself (see Reachable).

## People check (SENSE-TESTING LAW — full reads)

1. **The famine scatter (86011, full read).** Escalation is legible:
   "⚠ STARVING: health and energy falling. The spiral has started." →
   "◈ CRISIS — THE HUNGER WINTER... The pantry is an echo." → the System's
   alien note ("Organic units require fuel. Noting. Noting loudly. The
   audience is very quiet, which for them is screaming.") → "Haven couldn't
   hold... The scattering, again." Villagers act like people throughout:
   Francisco teaches Datura unprompted, the pantry debate is real ("We don't
   raise The Palisade on empty shelves — 0 of 14,000 kcal"), Francisco sits
   with feverish Ruby ("cool cloth, bitter tea, watching the breathing").
   The death is a consequence, not a surprise.
2. **The extinction (86013, full read).** Six burials in one night stretch,
   each named: "That night, they bring Ines home... Giulia... Lucas...
   Somchai... Casey... Chantal. Nobody asks you to help carry; nobody has
   to. By morning the grave is dug by the fire, and the body is laid out
   beside it. The filling of it is yours." Then: "Nobody is left. Not
   scattered, not gone looking for food — dead, every one, and the fire has
   nobody left to warm." The litany repeats the burial line six times — it
   reads as deliberate, each named villager getting their own line. The
   design law ("deaths hit hard") is working on screen. 0 senseless flags.

## Blanks

1. **DOCUMENTED (design, for Steve): the full seat is unreachable on the
   pure wave-seeking road — survival, not deeds, is the gate.** The binding
   blockers are w4/w5 on every seed, but the mechanism is mortality: 4/5
   villages died before the window (2 famine scatters d60/d99, 2 combat
   extinctions d144/d155). The wave-seeking road fills w1–w3 fast (86012:
   w1=22) and then dies — of hunger (patrols outrun the pantry without
   courtship tribute) or of treeline siege (86013: 600–1,350 kcal/night
   gorges while climbing). Contrast r43's capable road: 3/5 reached the
   window with w4=4–6 deeds and lived. The full seat's wave bars are
   reachable only via the COURTSHIP road (regional dawn → standing →
   unlocks → tribute-fed survival), not the pure wave-seeking road the bars
   seem to ask for. The bar isn't mis-set; the road to it isn't the road
   the metric imagined. This is the design conversation the scale leg's F2
   finding was pointing at: wave-5 unlocks land d112–176 with wave-seeking
   play *in sims that court*; without courtship the climbers die first.
2. **DOCUMENTED (instrument, for the next endgame run): the canonical
   voicing control requires a courting substrate.** FORCEDRIFT on
   deed-seeking measured nothing (0 verbs, 0 crossings) because the relay
   office never arrives without the Regional Dawn (21-day bond). Next run:
   keep the voicing control on the capable substrate (r41–r43's deployment),
   keep the wave-seeking question on deed-seeking. The control is not
   broken; its substrate requirement is now explicit.
3. No game-code blanks found this run: no senseless dialogue in 2 full
   beat reads, no dead ends, no unfireable beats observed, all five
   resolutions voiced (4 deaths + 1 reactor refusal). Nothing to fix in
   src/js.

## Reachable / Fun / Winnable

- **REACHABLE:** the full seat 0/5 on the wave-seeking road — NO-GO as
  pre-registered. The lesser seat was never even approached (no announces).
  The wave-4 rung is touchable (86013: w4=2, standing 199); wave-5 contact
  is 0/5. On the courtship road (r43) the window is reachable 3/5 — the
  leg's business splits by road.
- **FUN:** the beats are the game's best writing under pressure — the
  six-burial litany and the reactor refusal ("A COLD SPOT AT EVERY TABLE:
  THE WORDS WERE ON THE WRAPPER") are live, priced, and specific. The
  famine spiral is legible three warnings out.
- **WINNABLE:** 0/5 on this road, by design of the metric. Cumulative
  endgame (r40–r44): the table is winnable on the courtship road
  (12/13 sat seeds won since r40); the pure wave-seeking road wins 0 and
  dies 4/5 before the window.

## Metric review (§14)

1. **M1's restatement held.** Counting voiced non-table resolution (4
   honest deaths + 1 reactor refusal) instead of sits-only gave GO 5/5 —
   the guard now measures what the game actually does. Keep the restated
   form.
2. **M2's 0/5 is the finding, not a metric failure.** The bar (≥1/5 full
   seat) was honest: zero wave-seeking runs reached it, and the
   binding-blocker datum (w4/w5 on all five, closest 86013 at t5−1) says
   exactly where the road ends. No revision proposed — the metric did its
   job.
3. **M3's distinction paid off.** 0/5 wave-5 contact + the 86013 datum
   (standing 199, w4=2) separates "the gate blocks" (w5 gate never cleared)
   from "can't fight it" (w4 fights are being fought and survived, 2/3 on
   the closest seed). Keep.
4. **M4's control needs its substrate stated.** The voicing itself is not
   suspect — r43 proved it fires on a crossing. The r44 deployment put the
   control on a substrate where the office can't arrive. PROPOSAL for the
   next endgame run: voicing control on capable (courting) as in r41–r43;
   note the substrate requirement in the probe header.
5. **The wave-seeking policy as "competent play" — a caveat for the next
   run.** deed-seeking died 4/5, but a real player would notice the pantry
   emptying and stop patrolling (86011/86014) or answer the treeline siege
   (86013). The policy is "competent at deeds," not "competent at
   survival" — its death rate measures the road's cost, not a player's
   ceiling. The next wave-seeking run should pair it with the capable
   road's courtship (or note the confound explicitly).
6. **Telemetry deviation check:** 1 LOUD line — maxTier baseline 16 →
   current 0. EXPLAINED: the overtime clock only runs after the announce;
   zero r44 seeds announced, so the tier never started. Baseline NOT
   rolled (it describes sitting runs). satPenalty.* absent for the same
   reason — same verdict.

## Regressions / checks

- DET (full instrument on twice, 2x120d, seed 86011): GREEN byte-identical.
- FID (FULLSEAT/RELAYGREY unset: wrapped == pure deed-seeking): GREEN
  byte-identical (mini-summary).
- SMOKE (86011, 120d): GREEN — pipeline end-to-end.
- Proof tests: none new (no src/js changes; instrument gates above are the
  proof).
- Existing suites: check.js --quick 282 passed, 5 failed in 1154s —
  all 5 in scripts/godpath/test-phone-frame-proof.js (retained
  phone-playtest receipts stale vs current src; this run touches zero
  src/js/index.html — pre-existing base failure, identical to the 282/5
  recorded earlier today, unrelated). Ran concurrently with lane A's own
  --quick (different worktree, different --cacheDirectory); no
  cross-contamination observed — the 5 failures match the known pre-existing
  set exactly.
- No src/js changes. Tooling: probe-endgame-r44-20261023.js (deed-seeking
  + fullseat-diag composition), analyze-endgame-r44-20261023.js (M1–M4 +
  binding-from-max reach table). Both committed under scripts/.

## Evidence

- evidence/2026-10-23/journey-endgame-r44.md (this note)
- evidence/2026-10-23/perseed-endgame-r44/endgame-r44-{86011..86015}.json
- evidence/2026-10-23/perseed-endgame-r44/endgame-r44-{86011..86015}-transcript.txt
- scripts/probe-endgame-r44-20261023.js
- scripts/analyze-endgame-r44-20261023.js

**Game-code changes this run:** none. **Tooling:** r44 probe/analyzer (new).
