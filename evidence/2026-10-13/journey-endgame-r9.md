# Journey Endgame r9 — Leg 4 (Endgame): Standing-bar wave-4 unlock on organic runs

**Run:** 2026-10-13 · Worktree `journey-endgame` (base `e02c10a1`, includes Standing-bar build `e7c18b85`) · belongseek × seeds 11/22/33/44/55/66/77/88, 150d death-aware
**Harness:** `scripts/journey-endgame-r9-20261013.js` (r8 harness + Standing breakdown + unlockedWave sampling every 10d; convo driver stays OUT of the daily loop — r8 hang bug)

## Pre-registered question (MEASUREMENT.md §11)

Does the Standing-bar build (`e7c18b85`: +25/wave-3+ kill pt, +34/seasoned regional+ link, +20/major feast; T4=100, T5=200+w4 faced; full seat drops scale rung) make **wave 4 unlock organically** on competent-policy sims? Does any seed now approach the table?

- **Primary metric:** runs with `unlockedWave >= 4` at any point.
- **GO:** ≥2/8 unlock wave 4 (spec tuning target ~30–50% of day-80+ runs — an obvious effect on 8 seeds). Secondary: ≥1/8 table approach.
- **Horizon:** 150d death-aware (+10d tail) — reachability lever (§10).
- **Seeds:** 11/22/33/44 (identical to r8 — direct before/after power) + 55/66/77/88. **Policy:** belongseek.

## Pilot results — NO-GO (0/8 wave-4 unlocks)

| Seed | End | Standing max (day) | Sources w/l/f | Seat | Notes |
|------|-----|-------------------|---------------|------|-------|
| 11 | survived 150 | 34@50 | 0/1/0 | none | 5 living; regional; w1-3 rungs 8/7/5 |
| 22 | lost 129 | 34@50 | 0/1/0 | none | 1 survivor (Chloe); combat deaths 11 |
| 33 | lost 77 | 34@60 | 0/1/0 | none | scholar exiled ~d52; 1 survivor (Benoit) |
| 44 | lost 118 | 34@50 | 0/1/0 | none | 1 survivor (Divya) |
| 55 | lost 47 | 0 | 0/0/0 | none | sickness/wounds/combat |
| 66 | lost 44 | 0 | 0/0/0 | none | wounds/combat |
| 77 | lost 46 | 0 | 0/0/0 | none | sickness/starvation |
| 88 | lost 73 | 34@50 | 0/1/0 | none | 3 survivors |

Wall: national 0/8, table 0/8, won 0/8, seatApproach 0/8, median 77d, exiled 1/8.

**This reproduces the standing sweep's belongseek result (0/8 there too) — no discrepancy.** The bar is unreachable on this policy's trajectory: every long-lived seed plateaus at **34 = exactly 1 seasoned link**. Zero war points on all 8 seeds (no wave-3+ ledger kills — the policy fights wave-3 but never kills), zero major feasts (belongseek never hosts quality≥1). The three pure paths (4 kills | 3 links | 5 feasts = 100) are all 3–5× away. Per the kill rule: document, move on. The sweep already measured the policy split (leadcourt 6/8 diplomacy unlocks, competent 1/8 war, belongseek 0/8); this pilot independently confirms the belongseek leg.

## Blank 1 VERIFIED (not broken): the wave-4 unlock beat under Standing

Nobody had sense-checked what the game SAYS when Standing — not kills — crosses the bar. Probe: `scripts/wave4-beat-probe-20261013.js`, leadcourt seed 33 (t4day=57 in the sweep, died d101).

- Trace: standing 34→68→102 across d55–57 (links seasoning); `unlockedWave` 2→4 on d57.
- The beat FIRED on d58 (one day after the crossing, via the next fight's `checkWaveUnlockBeat` — reactive, acceptable): 📺 RATINGS beat + `waveUnlockBeat(4)` MIRROR DRAFT lines ("We've been watching you for a LONG time... Say hello to the MIRROR DRAFT."). Reads well; the fiction fits a diplomacy-earned escalation (the System noticed your institutions, built something out of YOU).
- The `scalePointerW4` re-voiced line ("Get me STANDING — blood, bonds, or bread") exists for the pre-unlock pointer. Villager drop reactions are wired in the same choke point.
- **Verdict: the diplomacy path announces correctly. No bug.** The beat is reactive (not timer-driven) and idempotent.

## Blank 2 FILLED: exile pantry-refusal narration spam

**Found** in the beat-probe transcript (leadcourt s33, scholar exiled ~d52): the policy retried `takeFromPantry` ~81×/day for 20 days, and **every attempt printed the full dramatic exile line** — ~1,600 identical story beats ("The pantry is not yours anymore. Exile means exile — membership had no check-ins, but it had exactly one way to lose it.").

**Fix** (`src/js/membership.js`, `_blockIfExiled`): the full line reads ONCE per exile episode per place (pantry/stash tracked separately); repeats get the short refusal ("The pantry is closed to you."). Every refusal still narrates — no silent actions. The flag re-arms on `rejoinMembership` and on fresh `exilePlayer`.

**Proof:** `scripts/test-exile-refusal-throttle-20261013.js` **12/12** (RED-verified pre-fix: the 3 throttle assertions fail with the full line repeated). Regressions: test-membership-20261007 43/43, test-village-membership 53/53 (one expectation updated to the new intended short-on-repeat behavior), test-exile-grace ALL GREEN, test-exile-selfeed clean, ontology 94/94. test-exile-routes has a PRE-EXISTING villageCard failure (fails identically on pristine HEAD — verified via patch round-trip, not my change).

## Blank 3 DOCUMENTED: `curious`-want conversations meander (people check)

Two day-62 convo-probe transcripts (`scripts/convo-probe-20261013.js`; transcripts captured OUTSIDE the day loop per the r8 hang finding):

- **s11, Deirdre (mushroom grower, dry, trust 90)**, want=`curious`: opens with a real question ("Are you angry? At whoever did this..."), then drifts — gossip non-sequitur, then verbatim filler closings.
- **s22, Jesse (line cook, withdrawn, trust 90)**, want=`curious`: strong hook ("some people here are performing, not surviving") — **the thread is planted and then abandoned**; no follow-up, no name, no payoff. Same verbatim filler.

**Against the quality bar:** the `curious` want has no concrete object — the NPC never wants anything specific. Two template lines repeat VERBATIM across both NPCs ("That's... pretty much all of it, honestly." / "Well." A breath. "That's where things stand.") — robotic, not person-specific. The gossip line is a name-swapped template ("<Name> sees in the dark. Not well — but better than you. Better than me."). Endings resolve nothing, plant nothing (the one planted thread is dropped), owe nothing. **Verdict: villagers do NOT fully act like people in the endgame window on `curious` wants** — contrast r8's `ask_favor` transcripts which were strong. The conversation system is the social loop's active domain (r10/r11 today); filing with transcript evidence, not fixing here.

## Village assessment (plain words)

Eight villages, seven collapses and one 150-day survivor. The survivor (s11: Lucas the police officer, Chloe the interpreter, Fatima the paramedic, Maya the ER nurse, Onni the chimney sweep) held regional for 100 days with 5 living — a real polity, not a remnant. The dead ones all broke the same way: combat in tight windows (wave-1/2/3 monsters), leaving 1–3 living behind — collapse, not extinction. Sickness and unhealed wounds took the early seeds (d44–47). One scholar was exiled mid-run (s33, ~d52) and the village still seasoned 3 links and would have unlocked wave 4 on the leadcourt policy — exile doesn't stop the village's standing, which is the design working. Nobody feasted (0 major feasts, 0 feast-buffs) and nobody killed a wave-3 monster — the plenty and war sources of Standing are dead letters on this policy; only diplomacy moves, and it caps at one seasoned link.

## Reachable / fun / winnable (endgame leg)

- **Reachable:** The wave-4 unlock is REAL and ANNOUNCED on the diplomacy path (verified end-to-end with the beat). On belongseek it's unreachable (0/8, matches the sweep); on leadcourt it's 6/8. The table itself: 0 approaches on this policy — the lesser seat's food-deed rung still binds (r8's finding stands).
- **Fun:** The MIRROR DRAFT beat reads well. The exile-spam fix removes a narration wart from the exact window where wave 4 lands. Sims can't judge fun; nothing else in the beats reads broken.
- **Winnable:** NOT YET. 0/8 table approaches, 0 wins. Blocked on survival (median 77d; the endgame window is 100d+) and the food-deed policy gap. Win-path stays blocked on scale-onramp per the tracker.

## Telemetry deviation check

`telemetry-check.js` vs `telemetry-baselines/endgame.json` (national/table/wins/exiled/seatApproach): **quiet** — no LOUD lines. (1/8 exiled within tolerance.)

## INFRASTRUCTURE INCIDENT (LOUD): stash cross-contamination across worktrees

During RED-verification I used `git stash push -- src/js/membership.js` + `git stash pop` in my worktree. The stash is repo-global and another loop's worker was stashing concurrently: **my pop applied THEIR stash** (trapline `snare_wire` data changes appeared in my `src/data/*.json`) and **my stash was popped into THEIR tree** (`sim-snaremat/src/js/membership.js` contained my exact fix text). Recovered: `git checkout HEAD --` the 3 data files in my tree (their newer versions are intact in their tree — verified), re-applied my 3 edits, re-verified proof 12/12. The sibling appears to have cleaned their tree (their membership.js is back to original — verified by diff). **New rule for AGENTS.md: NEVER `git stash push`/`pop` on the hot shared repo — use `git diff > /tmp/x.patch` + `git checkout -- <file>` + `git apply` for RED-verification instead.** The patch-file round-trip was used for the test-exile-routes pre-existing check and worked cleanly.

## Files

- `scripts/journey-endgame-r9-20261013.js` — pilot harness (Standing + wave sampling)
- `scripts/convo-probe-20261013.js` — standalone convo probe (never in the day loop)
- `scripts/wave4-beat-probe-20261013.js` — unlock-beat sense probe
- `scripts/test-exile-refusal-throttle-20261013.js` — proof 12/12 (RED-verified)
- `scripts/test-village-membership.js` — 1 expectation updated to intended behavior
- `src/js/membership.js` — the throttle fix
- `evidence/2026-10-13/journey-endgame-r9-*.json` (8 pilot seeds), `-beatprobe-leadcourt-s33.txt`, 2 convo transcripts
