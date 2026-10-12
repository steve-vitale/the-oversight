# Long-run sim — lever 2 r7: wave unlock pacing, W4-GATE CEILING PROBE (2026-10-12)

**Context:** r6 proved the wave bars count villager kills killer-blind (contract
pinned) and fixed the ledger-full beat contradiction. Since r6, four landings:
journey-landing-r8, longsim combat-r8, journey-succession-r10, longsim food-r7.
This run: (1) re-baseline on current master, (2) close r6's open blank — is the
wave-4 gate (4 w3 ledger points + scaleRank >= regional) REACHABLE or
decoration? — with a maximal-effort "w3-farmer" probe, (3) sense re-verify,
(4) villager-XP law light-touch re-verify.

Canon read: docs/CANON.md, docs/MONSTER-WAVES.md, docs/PROGRESSION.md §12,
docs/BALANCING.md. Method: `scripts/sweep-wave-lever.js` 20 seeds × 200d
competent (seeds 1–20, r4/r5/r6 set); probe
`scripts/probe-w3-ceiling-20261012.js` (10 seeds × 200d, two arms).

## 1. RE-BASELINE (current master a3b8d937)

Raw: `sweep-out/wavelever-r7-baseline.json`.

| measure (20 seeds) | r6 | r7 | drift |
|---|---|---|---|
| median survival | 49d | 57d | +8d |
| max days | 158 | 143 | — |
| deaths (20 runs) | 163 | 163 | flat |
| monster+combat share | 62% (34+28) | 63% (59+44) | flat |
| starvation | 28 (17%) | 23 (14%) | −5 |
| wave-2 unlock | 18/20, med 19.5 | 17/20, med 18 | flat |
| wave-3 unlock | 9/20, med 49 | 9/20, med 56 | +7d |
| wave-4 / wave-5 | 0/20 | 0/20 | flat |
| bar→unlock gap | 0 (all 27) | 0 (all 26) | flat |
| day floors | inert | inert | flat |
| counter discoveries | 172 | 188 | +16 |
| counter extras paid | 7 (2 w1 + 5 w2) | 6 (3 w1 + 5 w2→3+3) | flat |
| w1 kills (vill %) | 262 (72%) | 241 (66%) | flat-ish |
| w2 kills (vill %) | 66 (53%) | 70 (53%) | flat |
| w2 types touched | 13 | 14 | — |
| w3 ledger points | 2 | 4 (2 runs × 2) | — |
| w3 villager fights | 85 (66 fl / 13 d / 1 k) | 47 (40 fl / 3 d / 0 k) | fewer, still flee-heavy |
| maxArc 3 | 19/20 | 19/20 | flat |
| national / win / four-realm | 0 / 0 / 0 | 0 / 0 / 0 | flat |

Wave pacing is stable across the four landings: w3 holds 9/20, w4/w5 still
0/20 under competent. Combat-r8's witness reactions are narration-only —
death causes flat, as designed. No lever-2 drift worth chasing.

## 2. W4-GATE CEILING PROBE — the gate is REACHABLE (blank closed)

**Policy** (honest mechanics only, no grants except the labeled arm):
- *Courting* (day 1+): rumors arrive on their own → travel to their fire →
  `studyVillageCodex` (+3 once, real knowledge) → broadcast wins →
  `proposeLink` at judgeLink≥50 as subordinate w/ 3500 kcal/wk tribute →
  **answer counter-offers** with `answerCounter('accept')` (probe bug found
  mid-run: the counter band is the COMMON outcome; the first arm staged
  counters and never answered them — a real player answers the table).
- *Hunting* (from w3 unlock): 4 dedicated thicket/ruin legs/day (capped —
  travelTo is tick-free, so cadence is capped at a real player's, not
  exploited); committed w3 fights (flee only <30% HP or 4× HP bulk), real TB
  via driveFights.
- Two arms × 10 seeds: **natural** (gear as the competent run develops it)
  and **grant** (GRANT_MID=1: the canon mid-anchor gear — fire-hardened spear
  wb 15, hide/skull/boots/bindings P≈58 — granted at w3 unlock, loudly
  documented; no HP/ability grants).

**Results** (raw: `sweep-out/w3ceil-r7c.json` natural, `sweep-out/w3ceil-r7d.json` grant):

| | natural arm | grant arm |
|---|---|---|
| wave-4 UNLOCKS | 1/10 (seed 8, **day 150**) | 1/10 (seed 8, **day 99**) |
| 3/4 w3 points | 1/10 (seed 9) | 1/10 (seed 9) |
| regional reached | 6/10 (dawn d24–26) | 7/10 (dawn d24–26) |

**The scale half is fast and reliable:** court from day ~2–6 (propose at
judgeLink≥50; counters accepted, not feared) → bond ages 21 days → Regional
Dawn ~day 24–26. Real costs: 3500 kcal/week tribute as subordinate, the
fiction of bowing, weeks of tending. 13/20 across both arms.

**The ledger half is the earned half:**
- Natural (seed 8): w3 unlock d66 → 136 hunting legs → 4 w3 fights → **4 kills
  (100% on committed fights)** → points d81, d81, d105, d150 → w4 unlock d150
  (regional already met). Gear at unlock: wb 45, P 0 — a strong weapon and
  selective fighting beat armor.
- Grant (seed 8): w3 unlock d66 → 49 legs → 4 w3 fights → 4 points by d99
  (d82, d82, d90, d99) → w4 unlock d99.
- Encounter rate ≈ 10–12% of hunting legs produce a w3 fight; perTypeCap=2
  held (breadth: 2+ types required, satisfied).

**Verdict: REACHABLE, not decoration.** A maximal-effort run unlocks wave 4
~day 99 (designed mid gear) to ~day 150 (natural gear) — inside the deep-game
window, past the ~100-day target for typical play. The gate binds on honest
axes: encounter rate, committed w3 fighting, real courtship with real costs.
**No retune.** Weakening the bar would collapse "reached wave 4" into "played
wave 3"; the 2026-10-10 pacing audit's "w5 ~day 77–93" was optimistic, but
that audit assumed fight throughput no sim policy achieves — the measured
ceiling (~day 99–150 for w4) is the honest number, and it is a deep-game
number, which is what The Mirror Draft is.

## 3. SENSE (Steve 2026-10-11)

- **w3 drop sequence re-verified on new master** (sense-wave-drops, seed 7):
  r6's fix holds — no day-floor contradiction. The scale pointer is honestly
  planted in the fiction: "I can't stage it with ONE fire — there's not
  enough of you to REFLECT, you feel me? Get me a NETWORK." Then RATINGS →
  Final Draft → treeline narration → two fire-side reactions (James: "We
  mark it, we tell everyone, we don't go alone." / David: "Don't go near the
  treeline alone anymore. Promise me." — distinct temperaments, no echo).
  PASS.
- **w4 unlock beat — first sim-observed** (sense-w4-unlock, seed 8, d99):
  ledger-full ("wave 3's bar is full (4/4 — kills only, not near-misses).
  Wave 4's talent is cleared for release — watch the treeline.") → "A REGION!
  Look at you! The ratings department is doing a little DANCE over here!"
  (the scale half, acknowledged) → RATINGS ARE UP → "We've been watching you
  for a LONG time. Your faiths. Your formats. Your little institutions. So
  we built something out of... well. Out of YOU. Say hello to the MIRROR
  DRAFT." → 🔥 Omondi, at the fire: "It wears our faces? Then we don't trust
  faces after dark." — a behavioral takeaway, present-tense, consequential.
  Coherent, ordered, meaningful. PASS.
- **Fight summaries** (280 samples, 20 runs): 239 distinct templates; repeats
  are per-instance numbers inside a consistent voice ("stood down the
  Lockpick and kept walking — 3 rounds, bloodied but breathing"). Nothing
  robotic. Villager w3 fights stay sensible (flee 85% — w3 is a mid-build
  fight, villagers aren't mid-build).

## 4. VILLAGER-XP LAW (Steve 2026-10-11 22:06) — light-touch re-verify

`test-wave-bar-counting-20261012.js` 21/21 × 3 seeds on the new base. The
counting didn't move. In-sim: w1 kills 66% villager, w2 53% villager — the
village still does most of the killing on every bar.

## 5. LEVER PLAYED? No.

The evidence does not demand it. The w4 gate is reachable at maximal effort
and correctly hard; the scale half is fast, the ledger half is earned. Small
changes would only move the deep-game window without new information.

## Village assessment (plain words)

The villages fight like villages and court like villages. Two-thirds of the
wave-1 killing is villagers; the ledger counts every one of them at full
value. A farmer who actually walks to the neighbors' fire, sits with their
book, and answers the counter-offer is regional by the end of the first
month — the System even dances about it. And a hunter who walks the
thickets every day with a good spear can put four wave-3 monsters in the
ledger and see the Mirror Draft arrive — it wears your faces, and the
village says so out loud at the fire. Nobody stumbles into wave 4; it is
earned, twice over (kills AND scale), exactly as the gate is written. The
typical village never gets there — 0/20 on the competent baseline — which is
correct for deep content, and now measured rather than assumed.

## Blanks filled

1. **W4-gate ceiling measured** (the open r6 blank): reachable — 2/20 unlocks
   (d99 mid-gear, d150 natural), 2/20 at 3/4 points, 13/20 regional. No retune.
2. **Probe bug found and fixed**: counter-offers are the common courtship
   outcome; the first probe arm never answered them. `answerCounter('accept')`
   is now part of the farmer. (Also fixed a hunting-spot sort that walked to
   the farthest unrevealed tiles instead of near known thickets.)
3. **test-wave3-5-20261010.js stale roster asserts repaired** (56→59,
   53→54): titan flags moved to titans.json (herald/nielsen/finale), plus 2
   campaignOnly exclusions (finale_crew, finale_opening). 215/215 ×3 seeds.
4. **First sim-observed wave-4 unlock beat** captured and sense-read (PASS).

## Documented (not fixed)

- **w5 gate** (3 w4 points + national): still unmeasured — needs a w4-farmer
  probe. Next round's blank.
- Typical competent play never reaches wave 4 (0/20) — by design (deep
  content), now measured.
- The 2026-10-10 pacing audit's "w5 ~day 77–93" estimate is optimistic vs the
  measured ceiling (~day 99–150 for w4 at maximal effort).
- The ceiling runs are a race: farmer villages die ~day 100–170; seed 8's
  natural-gear unlock (d150) survived to 200, the exception.
- Sweep sense-capture still truncates (first 60 say lines; 14 fight samples
  fill with w1) — wave-3+ beats need the sense-* tools. Documented r6, still true.

## Tests & commits

- NEW `scripts/probe-w3-ceiling-20261012.js` — w3-farmer ceiling probe
  (natural + GRANT_MID arms; exports `farmer` for reuse)
- NEW `scripts/sense-w4-unlock-20261012.js` — wave-4 unlock beat capture
- FIXED `scripts/test-wave3-5-20261010.js` — 215/215 ×3 seeds
- Regressions on new master: wave-ledger 31/31, wave-kill-channels 17/17,
  wave-bar 13/13, wave-drop-reactions 14/14, reach-wavebeat 8/8,
  wave-extra-cap 15/15, wave45-coherence 24/24, wave-bar-counting 21/21
- Sweeps: `sweep-out/wavelever-r7-baseline.json` (20×200d competent),
  `sweep-out/w3ceil-r7c.json` + `w3ceil-r7d.json` (10×200d farmer, both arms)
- `[needs-eyes]`: none — no player-facing copy/mechanics changed this run
