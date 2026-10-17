# sim-vetdemand — counterfactual veteran-demand diagnostic (2026-10-17)

Run: flesh-out loop diagnostic sim-vetdemand (run_id fleshout-20261017T1315Z), axis scale-onramp (blocking).
Canon: docs/CANON.md (read first). ZERO src/js changes, ZERO sims re-run — read-only analyzer over the existing vetcompose corpus.
Worktree: ~/workspace/worktrees/sim-vetdemand.

## The question (sharpened from sim-vetcompose)

The wave-4 census: veterans is the binding bar on 29/34 non-winning win-side-stack runs — demand (2 living veterans) never met on any run. The vetcompose arm proved the companion-kill channel works on the win substrate (+8 companion wave-3 kills, mechanism GO) but the win truncates the horizon the channel needs (primary NO-GO, +1 vs +3). The named next is a design call for Steve: loosen the 2-living-veteran demand (standingCfg calls it a "sim starting point"), or count veteran kills rather than living veterans. This diagnostic answers it with measurement, not a ruling: on the 32-run vetcompose corpus, how many runs flip wave-4 unlock under (ii) cumulative wave-3+ kills ≥2 (not necessarily living) or (iii) living ≥1 ∧ cumulative kills ≥2, versus (i) the engine's current 2-living-veterans rule?

## Pre-registration (docs/MEASUREMENT.md §14 — BINDING, written BEFORE analysis)

- **Corpus (fixed, no new sims):** the 32 vetcompose per-seed JSONs (evidence/2026-10-17/perseed-vetcompose/, 8 seeds × {leadseat,belongseat} × {armed,control}, 180d death-aware, wins truncate) + the 32 beat captures (evidence/2026-10-17/vetcompose-beats/). Nothing re-run; nothing in src/js touched.
- **Rules:** (i) living veterans ≥2 — the engine's current rule, measured directly as the sweep's own `vet2peak` (any daily snapshot with `Game.waveCombatReadiness(4).veterans ≥ 2`). (ii) cumulative wave-3+ waveKillLog entries ≥2 (`w3kills ≥ 2` — the sweep's decomposition of `state.waveKillLog`, entries with `w ≥ 3`, any `via`, living-or-dead killers). (iii) `maxVeterans ≥ 1 ∧ w3kills ≥ 2`.
- **PRIMARY (binding):** share of the ARMED-16 corpus where (ii) or (iii) is satisfied but (i) is not — GO if ≥4/16 (non-trivial verdict change; informs the steve-call either way). A miss is NO-GO, never re-scored.
- **Gate-level (report-only):** for each bar-flip run, would the full wave-4 gate actually have released? Modeled from the engine's deferral beats (see Method). Cannot change the PRIMARY verdict.
- **Metric-review note (from sim-vetcompose):** never read scholar.day as survival when treatments touch the clock — this diagnostic uses endReason (village-lost rate) and death-cause shares for context only; the verdicts use veteran/kill/beat state exclusively.

## Method — the engine's own gate, modeled faithfully (read, not changed)

Read from src/js/standing.js, src/js/game.js (`unlockedWave`), src/js/waveLedger.js:

1. Wave-4 unlock = `unlockedWave() >= 4` = w3-rung (day ≥ 25 ∧ wave-2 ledger ≥ 5) AND `villageStandingTotal() >= t4 (100)`.
2. The gated total holds at t4−1 while the combat-readiness deferral bites: `deferred = (raw >= t4 && !ready)` (standing.js `standingDeferral`). A defer4 hold beat ("The next act is…", with the `_readinessBarLine` bar list) fires ONLY while deferred — so its existence proves **raw standing ≥ 100 at that snapshot**, and its bar list names exactly the short bars then. A **veterans-only** hold beat proves: raw ≥ 100, armor/weapons/tricks all met, veterans the sole blocker — the gate releases at that snapshot if the veteran bar is satisfied.
3. **Timing lemma (wave-3 kills):** the "WAVE LEDGER — wave 3 is halfway there (2/4)" beat fires at `waveLedgerPoints(3) ≥ 2`. Every scoring kill flows through `recordWaveKill` → writes the waveKillLog entry; `monsterCounterKnown` requires the monster def to carry a `counter` field and **0/9 wave-3 defs do** (src/data/monsters.json) — so the mastery bonus can never fire on wave-3 kills: every wave-3 scoring kill = exactly 1 point. Halfway-at-day-D therefore proves **≥2 cumulative wave-3 waveKillLog entries by day D**. (Pyrrhic kills write entries without scoring — they only raise the true entry count.)
4. Gate-level counterfactual: rule (ii) releases at the first veterans-only hold beat V with V ≥ ledgerHalf3day (other bars met, raw ≥ 100, ≥2 kills banked). Rule (iii) additionally needs that beat's living count ≥ 1 ("blood your fighters (X of 2 veterans)"). maxWave ≥ 3 proves the w3 rung; wave45 = 0 on all 32 runs proves no prior release (no grandfathering).
5. Modeling choice (documented, not hidden): rule (ii) counts kill ENTRIES (w3kills ≥ 2), not distinct killer vids — the corpus persists the decomposition, not per-entry `by` vids. Entries ≥ distinct killers, so this is the most permissive reading of "count veteran kills"; the engine's VETSHAPE instrument (standing.js, distinct living-or-dead killer vids) is stricter and would flip ≤ what (ii) flips here.

## Results — per-run counterfactual table

`end` = endReason, `gd` = gameDays, `vet2` = vet2peak, `maxV` = maxVeterans, `w3k` = w3kills, `I/II/III` = bar-level rule verdicts, `flip` = (II∨III)∧¬I, `gII/gIII` = gate-level release day or 0, `lastHold` = last defer4 snapshot.

| run | end | gd | vet2 | maxV | w3k | w3by | I | II | III | flip | gII | gIII | lastHold |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| belongseat-armed-s2271121 | over-other | 90 | 0 | 0 | 0 | {} | 0 | 0 | 0 | 0 | 0 | 0 | d85[armor+veterans] |
| belongseat-armed-s2381233 | over-other | 90 | 0 | 0 | 0 | {} | 0 | 0 | 0 | 0 | 0 | 0 | d86[armor+veterans] |
| belongseat-armed-s2491345 | survived | 78 | 0 | 1 | 1 | {companion:1} | 0 | 0 | 0 | 0 | 0 | 0 | d78[armor+veterans] |
| belongseat-armed-s2601457 | survived | 82 | 1 | 4 | 5 | {companion:4,player:1} | 1 | 1 | 1 | 0 | 0 | 0 | d68[armor+veterans] |
| belongseat-armed-s2711569 | village-lost | 90 | 0 | 1 | 1 | {player:1} | 0 | 0 | 0 | 0 | 0 | 0 | d85[armor+veterans] |
| belongseat-armed-s2821681 | over-other | 90 | 0 | 1 | 2 | {player:2} | 0 | 1 | 1 | 1 | 0 | 0 | d89[armor+veterans] |
| belongseat-armed-s2931793 | over-other | 90 | 0 | 1 | 1 | {companion:1} | 0 | 0 | 0 | 0 | 0 | 0 | d85[veterans] |
| belongseat-armed-s3041905 | over-other | 90 | 0 | 1 | 2 | {player:2} | 0 | 1 | 1 | 1 | 0 | 0 | d87[armor+veterans] |
| belongseat-control-s2271121 | over-other | 95 | 0 | 0 | 0 | {} | 0 | 0 | 0 | 0 | 0 | 0 | d90[armor+veterans] |
| belongseat-control-s2381233 | over-other | 90 | 0 | 0 | 0 | {} | 0 | 0 | 0 | 0 | 0 | 0 | d86[armor+veterans] |
| belongseat-control-s2491345 | over-other | 90 | 0 | 0 | 0 | {} | 0 | 0 | 0 | 0 | 0 | 0 | d80[armor+weapons+veterans] |
| belongseat-control-s2601457 | village-lost | 86 | 0 | 0 | 0 | {} | 0 | 0 | 0 | 0 | 0 | 0 | d85[armor+weapons+veterans] |
| belongseat-control-s2711569 | over-other | 90 | 0 | 1 | 2 | {player:2} | 0 | 1 | 1 | 1 | d78 | d78 | d85[veterans] |
| belongseat-control-s2821681 | over-other | 90 | 0 | 1 | 4 | {player:4} | 0 | 1 | 1 | 1 | 0 | 0 | d89[armor+veterans] |
| belongseat-control-s2931793 | over-other | 90 | 0 | 0 | 0 | {} | 0 | 0 | 0 | 0 | 0 | 0 | d90[veterans] |
| belongseat-control-s3041905 | over-other | 90 | 0 | 1 | 2 | {player:2} | 0 | 1 | 1 | 1 | d71 | d71 | d85[veterans] |
| leadseat-armed-s2271121 | over-other | 90 | 0 | 0 | 0 | {} | 0 | 0 | 0 | 0 | 0 | 0 | d85[armor+veterans] |
| leadseat-armed-s2381233 | over-other | 90 | 0 | 0 | 0 | {} | 0 | 0 | 0 | 0 | 0 | 0 | d85[armor+veterans] |
| leadseat-armed-s2491345 | over-other | 90 | 0 | 1 | 1 | {companion:1} | 0 | 0 | 0 | 0 | 0 | 0 | d86[armor+veterans] |
| leadseat-armed-s2601457 | over-other | 90 | 0 | 1 | 4 | {companion:1,player:3} | 0 | 1 | 1 | 1 | 0 | 0 | d90[armor+veterans] |
| leadseat-armed-s2711569 | over-other | 90 | 0 | 0 | 0 | {} | 0 | 0 | 0 | 0 | 0 | 0 | d85[veterans] |
| leadseat-armed-s2821681 | over-other | 136 | 0 | 0 | 0 | {} | 0 | 0 | 0 | 0 | 0 | 0 | d135[armor+veterans] |
| leadseat-armed-s2931793 | over-other | 151 | 0 | 1 | 2 | {player:2} | 0 | 1 | 1 | 1 | 0 | 0 | d148[armor+veterans] |
| leadseat-armed-s3041905 | over-other | 106 | 0 | 1 | 1 | {player:1} | 0 | 0 | 0 | 0 | 0 | 0 | d106[armor+veterans] |
| leadseat-control-s2271121 | over-other | 90 | 0 | 1 | 1 | {player:1} | 0 | 0 | 0 | 0 | 0 | 0 | d85[armor+veterans] |
| leadseat-control-s2381233 | over-other | 90 | 0 | 0 | 0 | {} | 0 | 0 | 0 | 0 | 0 | 0 | d85[armor+veterans] |
| leadseat-control-s2491345 | over-other | 90 | 0 | 0 | 0 | {} | 0 | 0 | 0 | 0 | 0 | 0 | d86[armor+veterans] |
| leadseat-control-s2601457 | over-other | 90 | 0 | 1 | 1 | {player:1} | 0 | 0 | 0 | 0 | 0 | 0 | d84[armor+veterans] |
| leadseat-control-s2711569 | over-other | 90 | 0 | 1 | 3 | {player:3} | 0 | 1 | 1 | 1 | d78 | d78 | d85[armor+veterans] |
| leadseat-control-s2821681 | over-other | 158 | 0 | 1 | 3 | {player:3} | 0 | 1 | 1 | 1 | 0 | 0 | d156[armor+veterans] |
| leadseat-control-s2931793 | over-other | 150 | 0 | 1 | 1 | {player:1} | 0 | 0 | 0 | 0 | 0 | 0 | d148[armor+veterans] |
| leadseat-control-s3041905 | over-other | 117 | 0 | 0 | 1 | {player:1} | 0 | 0 | 0 | 0 | 0 | 0 | d113[veterans] |

Summary: armed-16 — ruleI 1, ruleII 5, ruleIII 5, flips **4**, gateII 0, gateIII 0. Control-16 — ruleI 0, ruleII 5, ruleIII 5, flips 5, gateII 3, gateIII 3.

## PRIMARY verdict: GO (4/16, at threshold)

The bar-level verdict change on the armed-16 corpus is **4/16 ≥ 4/16 — GO**. The four flips: belongseat-armed-s2821681, belongseat-armed-s3041905 (both: scholar's 2 wave-3 kills, 1 living veteran, won day 90), leadseat-armed-s2601457 (4 kills incl. 1 companion, 1 living veteran, won day 90), leadseat-armed-s2931793 (scholar's 2 kills, 1 living veteran, won day 151). On every one of the 32 runs, rule (ii) and rule (iii) agree exactly (all 10 rule-II runs have maxVeterans ≥ 1) — the living≥1 condition never binds on this corpus.

## Gate-level counterfactuals (report-only — do not change the PRIMARY)

The bar flips, but on the **armed corpus the gate releases on 0/4 flips**: every observed deferral snapshot on all four flip runs names armor alongside veterans (last holds d89/d87/d90/d148 all `[armor+veterans]`, and no veterans-only beat exists on three of them). The veteran demand change alone would NOT have opened wave 4 on the composed stack — the census's armor-fragility co-binder is the second lock, and it holds at every snapshot.

On **control, 3/5 flips would release**: belongseat-control-s2711569 (d78), belongseat-control-s3041905 (d71 — same-day ordering caveat vs the ledger beat, conservative d78), leadseat-control-s2711569 (d78). All three are scholar's-own-kill runs: 2–3 wave-3 kills banked, veterans-only deferral snapshots with 1 living veteran, raw standing ≥ 100, other bars met — under (ii) or (iii) the gate opens 12–19 days before the day-90 win.

The asymmetry is the finding: the veteran demand is the binding bar where the rest of the gate is open (control side), but on the win-side composed stack the armor bar co-binds everywhere the veteran bar flips. Loosening the veteran demand fires into a still-locked gate unless armor fragility is addressed alongside it.

## Metric review (§14 — binding, never re-scored)

1. **PRIMARY GO is real but thin.** 4/16 exactly at threshold. The four flips are all day-90 (or later) winners — villages that did everything right and never saw wave 4. The verdict change is non-trivial and directionally consistent (control flips 5/16 the same way).
2. **(ii) vs (iii) indistinguishable here.** Rule (iii)'s living≥1 never binds on this corpus — every run with ≥2 cumulative kills shows a living killer-vid at some snapshot. The choice between them is a fiction call (see Sense-testing), not a measurement call, on this evidence.
3. **(ii) is the permissive reading.** Kill-entry count ≥ distinct-killer count. If Steve's intent is the VETSHAPE distinct-killer definition, flips can only stay flat or shrink — the GO stands as an upper bound.
4. **Kill-timing lemma limits.** The ledger-halfway timing proof is rigorous only because no wave-3 def carries counter data (verified 0/9 in src/data/monsters.json) — a future content change adding wave-3 counter defs would break it. Same-day ordering caveat on belongseat-control-s3041905's d71 (conservative release d78). Hold beats are weekly: release days are first-observed qualifying snapshots, conservative by up to ~7d.
5. **No scholar.day-as-survival read.** Survival context uses endReason + death-cause shares only: village-lost 1/16 armed, 1/16 control (the matched belongseat-s2601457 pair); wins 13/16 armed, 15/16 control per the corrected vetcompose aggregates.
6. **Corpus ceiling.** The raw waveKillLog (per-entry day/by) was not persisted by the sweep — only the decomposition. A future corpus should persist entry days (or run the VETSHAPE=1 instrument) to close the timing question and test the distinct-killer reading directly. No re-scoring of this run's verdicts against such a corpus — that would be a new run.

## Village assessment (plain words)

These are winning villages that never get to use their veterans. The modal flip village: national by ~day 80, standing past 100 (the System is actively holding the draft back — the hold beats fire, it isn't ignoring them), two wave-3 kills banked — usually the scholar's own, the blooded companions mostly dead by then — one living veteran at the last snapshots, and armor short by one to three fighters. The System names it honestly every week: "armor the village (2 of 4 fighters armored); blood your fighters (1 of 2 veterans)." Then the win arrives at day 90 and the story ends with the draft still held.

Who died: the blooded, again. The hold beats flicker (1 of 2 veterans) → (0 of 2 veterans) as killers die between snapshots — the exact killer-mortality mechanism vetcompose diagnosed, now visible as the reason the living count never compounds. The one run that beat it (belongseat-armed-s2601457, maxVeterans=4) is the only (i)-satisfier in 32 runs, and it never won — it had the horizon the winners didn't.

What was missing, per this diagnostic: not kills (banked), not standing (past 100), not wins (13/16 armed) — but living killers and intact armor at the same snapshot. Two locks, one key each; the veteran key alone doesn't turn.

## Sense-testing (SENSE-TESTING LAW — transcript read)

Read: evidence/2026-10-17/vetcompose-sense-belongseat-s2601457.txt (d50–d85 war passages).

The transcript's veteran kills are COLLECTIVE fiction: "📺 Rahmat, Sanne, Meera, Tariq, Yuki brought down The Anaconda Empress. Together. (The village watches the broadcast. Nobody blinks.)" — five names, together — and the village retells them: "You catch Cauã telling the fire about Sanne. 'Sanne, Meera, Tariq, Yuki, Ines brought down The Landlord. Together.' The story's already growing." The village REMEMBERS kills as shared history; the engine counts one `by` vid per entry and demands the killers LIVING.

Judgment on the counterfactuals against that fiction:

- **Rule (ii) (cumulative kills, dead count)** honors the fire's memory — the village did kill twice, and the story survives the killer — but it **betrays the hold-beat frame "blood your fighters."** That demand is present-tense: fighters who can face the NEXT draft. Two dead killers opening a war nobody living has survived reads wrong against the transcript's own horror — the blooded keep dying (Ethan kills the Loud-Eyes alone at d47, "Word travels fast. The village cheers," and then the hold beats quietly fall back to (0 of 2)). The vetcompose sense verdict already named the gap: the beats don't mourn the blooded who die between snapshots. Rule (ii) would mechanize the forgetting: the ledger moves on, the village never has to have anyone left who did it.
- **Rule (iii) (living ≥1 ∧ kills ≥2)** honors both. One living blooded fighter — someone who did it and lived, who can lead the next draft — plus the village's cumulative record filling the second slot. It reads as the System saying: "one of you has done this and lived; the village has done it twice." That matches the transcript's shape exactly: the crew kills together, the fire remembers, and at least one of the blooded is still standing when the draft comes.

The numbers give no reason to prefer (ii) over (iii) — they agree on all 32 runs — and the fiction gives a clear one: **(iii)**.

## Sharpened recommendation for the steve-call

1. **The veteran demand change is real but insufficient alone.** PRIMARY GO (4/16 armed flips at bar level), but gate-level 0/4 on the composed stack: armor co-binds at every observed snapshot. If Steve loosens the veteran demand, pair it with the armor-fragility work (census co-binder) or the gate stays locked and the change is invisible to players.
2. **Prefer (iii) over (ii).** Identical measurement on this corpus, better fiction: one living killer keeps "blood your fighters" honest; the cumulative count honors the fire's memory. (ii) alone lets the dead open wars.
3. **The control-side result sharpens the question the census asked.** On the uncomposed stack, (ii)/(iii) would have released wave 4 on 3/16 runs — 12–19 days before the win — on the scholar's own kills. The demand isn't just a vetrel-composition problem; it binds competent scholar-led villages too.
4. **Next measurement if Steve wants it:** a corpus persisting waveKillLog entry days (or a VETSHAPE=1 instrument run) to test the distinct-killer reading and close the timing caveats — as a NEW pre-registered run, not a re-score of this one.

## Files

- scripts/analyze-vetdemand.js — the diagnostic (pure node, no game load; det-gate: two runs, byte-identical sha256 5dd2f26a5c4781025a5161c5547345c757d288bb95a196aabeeef1657f88cb65)
- evidence/2026-10-17/vetdemand-analysis.json — machine-readable per-run verdicts + summary (written by the script)
- evidence/2026-10-17/sim-vetdemand.md — this file
- Validation: hand-checked belongseat-control-s2711569 against raw per-seed JSON + raw beat text (6 veterans-only holds d50–85, living 0/0/0/1/1/1, ledger-half d75 → gateII/gateIII d78; ruleI=0, II=1, III=1, flip=1) — analyzer output matches exactly.
- ZERO src/js changes, ZERO scripts/policies changes, no sims re-run. Read-only over evidence/2026-10-17/perseed-vetcompose/ + vetcompose-beats/.
