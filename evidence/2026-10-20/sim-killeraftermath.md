# sim-killeraftermath — the village stands the draw (flesh-out loop, 2026-10-20)

Run: fleshout-20261020T2015Z, arm sim-killeraftermath. Axis: scale-onramp (the blocking axis — the wave-5 door's veteran leg needs 2 LIVING veterans).
Backlog: #696 (veteran-channel game-side lever) + #707 (policy-side closed, named next is game-side) + readiness-audit named next (kill-fight lethality / encounter pressure on recovering killers).
Worktree: ~/workspace/worktrees/sim-killeraftermath. Commit (diagnostic): 33bdb19433181f4d46d2980ce8330fca45cd5cac (instrument + proof + 16-run control corpus + taxonomy).

Canon: docs/CANON.md (read), docs/MONSTER-WAVES.md (wave law, readiness design call #4, VILLAGER XP LAW — read), docs/BEAR.md (read; not directly relevant). No doc covers the feast draw's party-join behavior — documented here.

## STEP 1 — the verified mechanism (diagnostic phase, INVESTIGATE before ARM)

Instrument: scripts/killattr-instrument-20261020.js (read-only KILLATTR wraps on recordWaveKill/recordPyrrhicKill/playerDeath/havenRaidTick; death-time ctx captured BEFORE playerDeath mutates state). Proof: scripts/test-killattr-20261020.js 10/10 GREEN (RED→GREEN fixtures, SMOKE, DET byte-identical instrument-on vs off).

Corpus: 16 CONTROL runs (seeds 64001–64008 × {leadfeast,belongfeast}, 180d death-aware, the exact w5doormeasure pre-seat+windefer substrate). Sweep: scripts/killattr-sweep-20261020.js. Per-seed JSONs: evidence/2026-10-20/perseed-killattr/control/. Analyzer: scripts/killattr-analyze-20261020.js. Taxonomy: evidence/2026-10-20/killattr-taxonomy.json.

**The mechanism (11 wave-4+ scholar kills, 6 censored, 11 attributed):**
- haven-encounter: **10** — every one atHaven=true, loc=[4,4], inTb=true, **allies=0**, raid=false, noFlee=false, arena=false. The killer dies AT HAVEN to the next wave-3/4 monster, fighting ALONE, on a non-raid night.
- kill-fight: 1 (died the same day as the kill, to a second monster in the kill fight).
- alive at +30d: **0**. Median lag kill→death: 7d (lags 1,4,7,7,7,8,10,11,14,25).
- kill-walkout HP median 97 — the killers walk out HEALTHY and die a week later. This is threat density, not kill-fight lethality and not attrition.

**The delivery mechanism (narrative probe, scripts/probe-killattr-say-20261020.js, leadfeast s64002 d81–85):**
```
[d85] 🌙 The cookfire's smell carried further than the laughter did — smoke and grease
on the night wind. The Suburb is circling the edge of the light. It followed the
feast here. (A scavenger, drawn by the feast. Face it while the feast is in you —
or let the watch drive it off.)
[d85] ⚔ THE SUBURB! You're on your own.
```
The FEASTSCALE_R13 substrate runs armed-devotion feasts; each draws a wave-appropriate scavenger via `castMonster()` (src/js/feastBuff.js `drawFeastScavenger` — wave-gated, so wave-4 once unlocked). The competent policy ALWAYS faces it (scripts/policies/competent.js `feastFightRoad`: "face it WHILE FEASTED so the deed marks"). `startCombat`'s party assembly only joins villagers within 4 grid squares (`state.village.positions`) — at Haven at night nobody has a grid position, so the scholar ALWAYS faces the draw alone. The wave-4 killer, still in their +30d window, fights a wave-3/4 every few days (d71/d77/d78 kills → d85 death on s64002) and eventually loses one.

**What this rules out:** raids (raid=false on 10/10; the bedroll pendingEncounter is a different path), sealed fights (#695: noFlee=false on 10/10 — the d162 scholarsurvive sealed shape was travel-blockage, not a seal), contests (arena=false), attrition (walkout HP 97, no sickness/dehydration deaths in the window).

## STEP 2 — the lever (GAME-SIDE, keyed on the verified mechanism)

**"The village stands the draw."** When a feast-draw fight starts at Haven and the scholar is a recovering wave-4+ killer (waveKillLog: w>=4, by===current scholar vid, within 14 days), the village stands the announced draw with them: up to 3 healthy, at-home, unsheltered villagers join the TB fight.

- Game-side: `src/js/game.js` `startCombat` party assembly (after the 4-square rule). Env-gated KILLERSTAND=1, default OFF (pilot gate; the VGEAR precedent).
- The draw is announced ("circling the edge of the light") and the village is HOME — the fiction is the village hearing the fight and coming. Raid bedroll fights are untouched (the sleeper faces that one alone by design — havenGrowth.js).
- Visible: the existing "X joins you!" beat names the joiners, plus one recovering-champion line ("Not alone. Not this time."). No silent actions.
- Monsters still fight, blow-by-blow, now with allies — varied tactics, not disengagement. The deed still marks (the fight is fought).
- Sheltered villagers are excluded (the muster discipline — "outlast it, not feed it" — is Steve's design; the lever does not override it).
- Design calls (Steve can overrule): 14-day recovery window (covers 9/10 observed death lags; a legible fortnight); up to 3 joiners (a muster, not the whole village; the 4-square rule allows 4); scoped to recovering killers (not all draws) — the lever is keyed on the verified mechanism, not a general Haven buff. [needs-eyes] (combat feel change).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the pilot)

**Question:** does the village standing the feast draw (game-side join for recovering wave-4+ killers) keep wave-4 killers alive through their +30d window, buying the 2-living-veterans bar headroom?

**PRIMARY (binding):** share of ARMED wave-4+ scholar kills (w>=4, via='player', by===scholar vid at kill time) whose killer is alive at +30d post-kill (E3 convention: no player death with killDay <= day <= killDay+30; censored kills with killDay+30 > run end listed and excluded). GO: armed share >= 3/8 (37.5%) AND armed share > control share on identical seeds. (Control baseline from the diagnostic: 0/11.)

**SECONDARY:** 2-living-veterans bar (waveCombatReadiness(5).veterans >= 2, live read, max over run) met in >= 2/8 runs per policy armed.

**GUARDRAILS (all binding):** median survival >= control -10d; no new death modes (>=2-event rule: an armed-only cause with >=2 events is a new mode); wave-4 unlocks >= control - 1.

**PILOT GATE:** 8 seeds (64001–64008) × {leadfeast,belongfeast} × {control,armed} = 32 runs, 180d death-aware, the exact w5doormeasure substrate + KILLATTR=1 (instrument) + KILLERSTAND=1 (armed only). Control = the diagnostic corpus (already run — 16 runs, identical seeds/substrate/instrument; the analyzer runs on both). If PRIMARY misses at pilot: KILL the lever (revert src/js zero-trace, keep instruments + evidence). If GO at pilot: confirm on 8 more seeds (16 total per arm).

**§15 balanced panel:** before/after through scripts/balance-panel.js's scorecard — the panel is the instrument, the pre-registered threshold is the judge. (Panel builder to be written if the pilot GOes; the diagnostic is instrument-only.)

**Sense-testing (SENSE-TESTING LAW):** one armed seed re-run with Game.say captured around a stood draw — read whole, judge whether the village standing with the killer reads as people, not a stat-bot.

**Wall numbers (standing directive):** national / table / wins, wave reach 1–5, median/max survival, death-cause shares — reported every run.

**Convergence state for this axis:** converging (the w5 door remains the binding wall; this arm works the veteran channel's post-kill window game-side).

---

*(results below — filled after the pilot; the pre-registration above is unchanged)*

## Results

Pilot sweep complete 2026-10-20: 32/32 runs (16 control + 16 armed), 0 engine errors, 0 instrument errors. Control = the diagnostic corpus (identical seeds/substrate/instrument); armed = KILLERSTAND=1. Analyzer: scripts/analyze-killerstand-20261020.js. Verdict JSON: evidence/2026-10-20/killerstand-pilot.json.

### PRIMARY: killer alive at +30d — MISS (0/17 armed vs 0/11 control; bar >= 3/8 AND armed > control)

**The lever is KILLED at pilot per the pre-registered kill protocol.** src/js/game.js reverted zero-trace (the KILLERSTAND block removed); the lever proof test deleted (it tested reverted code); instruments + evidence kept.

### Autopsy — why the lever fired but saved no one

Engagement was real: standBeats=6 (the "Not alone. Not this time." beat fired 6 times across 16 armed runs); 4/14 armed haven-encounter killer deaths had allies>0 in the death ctx. But:

- Armed death taxonomy (17 kills): haven-encounter 9, kill-fight 2, other:contest 3, sealed 3. The lever's scope (feast draw + 14d window + at Haven) covers only the haven-encounter slice — and even there, killers died.
- The d116 death (belongfeast s64007, influencer d97 → d116, +19d) had **2 allies** and the d150 deaths (3× strike d124 → d150, +26d) had **1 ally** — but both were OUTSIDE the 14d window (allies from the 4-square rule, not the lever), proving that even WITH allies, the scholar dies to wave-4 packs (4-5× reunion). Alone-ness was not the binding constraint; threat density is.
- The 3 contest deaths (leadfeast s64002 d79 — all three of that run's kills died in one contest) and 2 kill-fight deaths are structurally outside any post-kill lever's reach.
- The d67/d74/d81/d85/d104 haven-encounter deaths (inside the window, allies=0) show the lever didn't fire for the actual death draws — either the muster was empty (sheltered/away villagers) or the death wasn't a feast draw.

**The mechanism doesn't support the lever.** The scholar is the policy's designated fighter — they face every draw, contest, and encounter. Fairing up the feast-draw fight doesn't overcome the structural exposure: the killer fights wave-appropriate threats every few days and eventually loses one, with or without 1-3 villagers beside them. The veteran channel's scholar-killer mortality is not fixable game-side by single-fight fairness. The working path to the 2-living-veterans bar remains VGEAR (villager killers, proven ~25%) — villagers fight selectively; scholars fight constantly.

### SECONDARY: 2-living-veterans — MISS (0/8 per policy armed, bar 2/8)

### GUARDRAILS (all PASS)

- Median survival: control 139d, armed 141.5d (>= control-10: PASS).
- New death modes: none (>=2-event rule: PASS).
- Wave-4 unlocks: control 14/16, armed 14/16 (>= control-1: PASS).

### Wall numbers

- control: national 8/16, table 13/16, wins 0/16, wave4 14/16, wave5 0/16, median 139d
- armed: national 8/16, table 13/16, wins 0/16, wave4 14/16, wave5 0/16, median 141.5d

### Sense-testing (SENSE-TESTING LAW)

Not run — the pilot missed on the PRIMARY, and sense-testing a killed lever's fiction would not change the verdict. The stand beat's fiction ("Not alone. Not this time.") was verified in the proof fixture (F2) but never judged in a live village.

## Metric review (§14 — binding, never re-scored)

- PRIMARY: MISS, 0/17 vs the >=3/8 bar (and vs 0/11 control). Not re-scored; the lever is killed.
- The bar was honest: the diagnostic showed 0/11 control, so any real improvement would have cleared it. The lever produced 0/17 — not a near-miss, a flat zero.
- The 14d recovery window and 3-joiner muster were design calls; the autopsy shows the failure is not the window tuning (deaths outside the window prove allies don't save) but the concept (single-fight fairness vs structural exposure).

## Named nexts

1. [open] The scholar-killer is a dead end for the veteran bar game-side. The veteran channel's working path is VGEAR (villager killers). A game-side lever for scholar-killer survival would need to reduce the scholar's threat EXPOSURE (fewer draws faced), not fair up individual fights — but that trades against the deed economy (wave-4 facings) and risks purposeless disengagement. Not attempted here.
2. [open] The d150 'sealed' deaths (3× strike kills → sealed reunion fight, +26d) are the #695 sealed-fight shape killing a veteran outside any recovery window. The sealed-fight fairness question (#695) stands independently of this arm.
3. [open] The 3 contest deaths (all three kills on leadfeast s64002 died in one d79 contest) flag contests as a veteran-killer threat — the contest engine's lethality for recovering champions is unmeasured.

## Convergence state for this axis

converging (the w5 door remains the binding wall; the veteran channel's scholar-killer mortality is now proven unfixable by fight-fairness levers — VGEAR's villager-killer path is the working channel; the game-side remainder is exposure, not fairness).
