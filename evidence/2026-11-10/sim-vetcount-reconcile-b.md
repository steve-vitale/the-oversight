# sim-vetcount-reconcile-b — kill-log vs veteran-counter reconciliation (CORRECTNESS FIX, backlog #2077)

- Arm: sim-vetcount-reconcile-b (Loop B, run fleshout-loop-b-20261110T1248Z, axis scale-onramp / winnability chain)
- Branch: sim-vetcount-b; base anchor `7c2591d1f` (worktree `~/workspace/worktrees/sim-vetcount-b`)
- Prereg: evidence/2026-11-10/sim-vetcount-reconcile-b-prereg.md (written before any scored seed)
- Instrument: scripts/vetcount-b-driver.js + scripts/vetcount-b-analyze.js (new; derived from the capstoneready instrument + kill-call accounting + the final `killers` table). Proof: scripts/test-vetcount-reconcile-b.js (19/19 legs pass at 30d — determinism, pyrrhic counting, same-day repeat, fates inclusion, neutrality, attr-off control). Ontology: `node scripts/validate-ontology.js` — "All 135 systems validated. Ontology matches code."
- Corpus: evidence/2026-11-10/perseed-vetcount-reconcile-b/before/ + .../after/ (vetcount-b-s14020{1..8}.json, 8 seeds, 150d death-aware, competent policy, 0 recorder errors on either leg)
- Canon: NO separate canon doc covers the Standing ladder. The spec is src/js/ladder.js (comments + rules block) and src/data/ladder-capstones.json (`_doc` field) — the 2026-11-07 victory-gating redesign.
- Context (must-read): the re-measure (evidence/2026-11-10/sim-capstoneready-remeasure-b.md, seeds 140201–140208) found the disagreement in its Metric review: (a) pyrrhic kills log but never count (140203: log 2, counter 1); (b) a same-day repeat kill is deduped from the log while the counter still increments (140208: counter 6, log 5); (c) the analyzer's fates table drops killers who are the current scholar at the end (3 of 17). This arm reconciles all three.

## Verdict: GO (primary metric, judged strictly)

- **Primary metric: log == counter on 8/8 seeds after the fix (all waves 1–5). GO.** Before-leg: 7/8 seeds disagreed (only 140207 agreed); after-leg: 8/8 agree, every wave.
- **Fates complete: 17/17 distinct wave-4+ killers in the after-leg `killers` table** — including all three the old table dropped (David Kim 140202, Emma Larsen 140203, visjoin_63/Antonia Rincón 140207), each flagged SCHOLAR-AT-END. No dropped killer.
- **Cost bar held:** starvation deaths 0 → 0 (bar: after <= before + 2); median survival 125.5d → 125.5d (bar: after >= 0.8x before = 100.4d).

## The fix (src/js/game.js only — no demand numbers, no defaults, no veteran definition)

1. `recordWaveKill`: the per-wave counter (`state.waveKills`), `state.wave4Slain`, and `state.waveKillByChannel` now increment ONLY for a kill that is not a same-key repeat of a log entry already written — the log's own dedupe verdict `(day, mid, by, via, trick)`, computed once up front and reused by the log block. One body = one count. When `_attrKills === false` the verdict is always "not a repeat" (no log to check against), so the honesty control behaves exactly as before. The ledger (`scoreLedgerKill`), codex, tale, beat, and `villageSlain` writes are untouched.
2. `recordPyrrhicKill`: the pushed log entry is stamped `pyrrhic: true`. NO counter change — the steve-call boundary stands (pyrrhic kills score nothing toward wave bars). The stamp only lets the census tell a pyrrhic log entry from a counted one.
3. Reconciliation rule (the LOG is the source of truth): for each wave w, `state.waveKills[w]` == the number of log entries with wave w and `!pyrrhic`. Veteran identity is UNCHANGED: `_ladderLivingVeterans` keeps reading ALL log entries including pyrrhic ones — a villager who killed a wave-4 beast in a lost fight still killed a wave-4 beast.
4. Fates-table gap (c): fixed in the RECORDER, not the analyzer — the analyzer cannot recover what the recorder never saved. The driver records a final top-level `killers` table built from the final `waveKillLog` (every distinct wave-4+ killer INCLUDING the current scholar, with alive/dead, ever-scholar, first/last kill day). `capstoneready-b-analyze.js` prints fates from `o.killers` when present and falls back to last-row `veterans` for the old corpus (verified: a 1-seed capstoneready run on the fixed engine prints "(killers table)" and reproduces 140201 exactly — 138d, tribute ready d90, per-deed blockers identical).
- No readiness-read switch was needed: `ladderCapstoneReady('military_tribute')` → `_ladderLivingVeterans(4)` and `standing.js` `waveCombatReadiness` already read the LOG. The alternative shape the task allowed was already the live shape.

## Before/after per-seed table (identical seeds, 150d, competent)

| seed | days | end | w4 counter B→A | w4 log B→A | reconcile B→A | dup calls | pyrrhic calls | tribute B→A | peak vets B→A |
|---|---|---|---|---|---|---|---|---|---|
| 140201 | 138 | village-lost | 5→5 | 5→5 | DISAGREE→agree | 3 | 0 | Y→Y (d90) | 2→2 |
| 140202 | 78 | village-lost | 1→1 | 1→1 | DISAGREE→agree | 7 | 0 | .→. | 0→0 |
| 140203 | 117 | village-lost | 1→1 | 2→2 | DISAGREE→agree | 2 | 1 | .→. | 0→0 |
| 140204 | 109 | village-lost | 1→1 | 1→1 | DISAGREE→agree | 8 | 0 | .→. | 0→0 |
| 140205 | 150 | survived | 3→3 | 3→3 | DISAGREE→agree | 5 | 0 | .→. | 1→1 |
| 140206 | 134 | village-lost | 2→2 | 2→2 | DISAGREE→agree | 3 | 0 | .→. | 1→1 |
| 140207 | 75 | village-lost | 2→2 | 2→2 | agree→agree | 0 | 0 | .→. | 0→0 |
| 140208 | 150 | survived | 6→5 | 5→5 | DISAGREE→agree | 4 | 0 | Y→Y (d135) | 2→2 |

Wave-4 counter total: 21 → 20 (the 140208 duplicate no longer counts). Wave-4 log total: 21 → 21 (20 counted + 1 pyrrhic — Lena Ruiz d109). Every other number is byte-identical before/after: days, end reasons, maxWave, peak stage/scale, peak veterans, tribute ever-ready and first-ready days, kill-call counts, killer counts. The fix changes the counter read and nothing else.

## The disagreement was bigger than wave 4

The re-measure only noticed the wave-4 symptoms. The kill-call accounting shows the duplicate-report problem runs through ALL waves — 32 duplicate `recordWaveKill` calls across the 8 seeds (2–8 per seed; only 140207 had none):

- 140201: d64 paparazzo (player) + d116 nightlight_catfish x2 (contest) — wave-1 counter 36 vs log 34, wave-2 22 vs 21.
- 140202: d54 alone carries 7 dups (belltoad x3, hummice x2, giant_mosquito x2) — wave-1 counter 41 vs log 36.
- 140203: d40 giant_mosquito x2 (contest) + the d109 pyrrhic reunion (Lena Ruiz, via player).
- 140204: d75 belltoad x7 by Ella Johnson via player + d75 giant_mosquito (contest) — wave-1 counter 42 vs log 35. One belltoad kill was counted EIGHT times.
- 140205: d17 hushwolf + anaconda_empress (wild) + d85 belltoad x3 (player).
- 140206: d26 bulldozer, d33 giant_mosquito, d39 mirrormoth.
- 140208: d90 belltoad x3 (player) + d135 congregation by Sam Wilson via companion — the very kill that opened the tribute window (first ready d135) was double-counted: counter 6, log 5.

The duplicates cluster as bursts — same day, same monster, same killer, same channel, up to 7 extra reports of one kill. That reads as one kill re-fired through the choke point several times (one fight's kill re-reported per round/tick or per channel), not as seven identical kills. WHY the engine re-fires is a separate question (filed in the findings backlog — see below); the log's standing rule (one body = one entry) is the source of truth, and the counter now follows it.

## The pyrrhic, pinned (140203)

The method accounting names it: the extra log entry is `recordPyrrhicKill`, d109, reunion, by Lena Ruiz, via player. Lena killed the Reunion on the fight's dying tick and died the same day (the wild); the scholar lost the fight, so the kill scored nothing toward wave bars — but the village learned it (codex 'slain', villageSlain) and the log kept it. Emma Larsen's d109 reunion, also via player, is the counted one. In the after-leg the fates table marks Lena `pyrrhicKills=1` and the reconciliation reads counter 1 == non-pyrrhic log 1, log-all 2. The steve-call boundary (pyrrhic scores nothing) is untouched; the stamp only makes the two reconcilable.

## The fates table, repaired

Before (re-measure): 14 killers in the table, 3 missing — all three were the current scholar at the end. After: 17/17, with the scholar-at-end flag on each of the three:

- David Kim, 140202 — 1 kill (d75), alive at end, ever-scholar 3d, SCHOLAR-AT-END.
- Emma Larsen, 140203 — 1 kill (d109), alive at end, ever-scholar 8d, SCHOLAR-AT-END.
- visjoin_63 / Antonia Rincón, 140207 — 1 kill (d74 eulogy), died d75 (the wild), ever-scholar 3d, SCHOLAR-AT-END.

The kill-time samples match the re-measure corpus exactly (same days, monsters, killers on every seed), so the before-leg ran the identical trajectories — the repair is in the recording, not in the game.

## Secondaries (expected unchanged — confirmed)

- Military tribute ever-ready: 2/8 → 2/8 (140201 d90, 32 ready days; 140208 d135, 3 ready days). The tribute read is log-based; the fix does not move it.
- Peak living veterans: [0,0,0,0,1,1,2,2] → [0,0,0,0,1,1,2,2] (daily and kill-time identical).
- Trade charter ever-ready 0/8 → 0/8; feast embassy 0/8 → 0/8; sealed charters 0; feast bundles 0.
- Wave-4 kills (counter): 21 → 20 — the fix working, not a game change (the duplicate no longer counts).
- Median survival 125.5d → 125.5d; starvation deaths 0 → 0.

## Scale-wall numbers (every run)

- National: 0/8 | table (won): 0/8 | wins: 0/8
- Wave 4 unlocked: 8/8 | wave 5 unlocked: 1/8 (140208 only)
- Median survival: 125.5 days (75, 78, 109, 117, 134, 138, 150, 150)
- Deaths per seed (telemetry deaths): same as the re-measure (trajectories identical); top causes across seeds: villager combat, expedition, combat, the wild.

## Sense-test: what the numbers mean (seed 140208, the duplicate that mattered)

Sam Wilson kills a Congregation on day 135, as a companion in the scholar's fight — the kill that finally puts two living veterans on the field (Pasquale Pascual, d122, still standing) and the tribute reads ready for the first time on that seed. The counter said 6 wave-4 kills; the log said 5. The sixth was Sam's own kill, counted twice: the choke point fired twice for one body. Nothing in the village was wrong — the fight happened once, the kill happened once, the tribute window (d135–d137) was real. Only the counting was wrong, and it was wrong in the flattering direction: the village looked one kill stronger than it was. After the fix the counter says 5, the log says 5, the window is unchanged, and the story reads the same. That is the whole point of the reconciliation: the numbers a veteran lever is judged on should describe the village that actually lived, not the re-fires of its fights.

## Balanced panel (§15) — attempted, as preregistered

- Before/after panels through the real instrument (capable policy, seeds 140201–140202, 150d, observer on/off proof cases): before panel 2 cases, after panel 2 cases, compare decision `review_required` — 2 pairs is "insufficient" for a statistical verdict, BUT every metric's paired delta is exactly 0 (all rows byte-identical before/after: deaths, population, standing, gear, abilities, luck — the full scorecard). The panel's verdict is "cannot judge on 2 pairs"; its data is "nothing moved". Compare files: evidence/2026-11-10/vetcount-panel-compare.md + .json.
- The primary metric is a deterministic invariant, not a distributional comparison — the panel is not its judge. The judge is the analyzer's direct per-seed equality (8/8), backed by the identical-trajectory before/after and the 19/19 proof legs.

## Telemetry deviation check (investigated same-run)

- Ran: `node scripts/telemetry-check.js --baseline <goal>/hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-11-10/perseed-vetcount-reconcile-b/after/vetcount-b-s*.json' --metrics national,table,wins,exiled --sweep-rows --allow-recorder-corpus`
- Output: `wall: won=0/8` + three LOUD lines: national 12→0, table 16→0, wins 16→0 — identical to the re-measure run.
- Investigation: NOT a game finding — the same regime artifact the re-measure documented (the scale-wall baseline is the winseat full win-side stack; this census is a pre-seat readiness substrate; the per-seed files carry no `nationalEver`/`table` fields, so national/table read 0 by absence). The `wins` 0/8 is measured and is the expected value for this regime. No action.

## check.js --quick (run on the fixed code)

- 293 passed, 7 failed. Baseline check (same 7 scripts on the clean base, fix stashed): 6 of the 7 fail identically WITHOUT the fix — pre-existing (mobile-combat-cadence Continue wrap, occupation-panels CLI workflow, phone-frame-proof stale receipts, establishment-r20 racks-voice daily gate, measurement-proof-update + measurement-workflow stale-proof pair). One newly failed with the fix: `test-measurement-cache-flags.js` ("both actual CLI configurations complete valid neutral panels") — same stale-proof root cause as the pre-existing pair. All three proof tests pass after the measurement-proof refresh below; the other 4 still fail identically and are unrelated to this arm.

## Measurement-proof refresh

- `src/js/game.js` changed, so the retained observer-neutral maintenance proof had to be refreshed (AGENTS.md: changed Game/controller/harness inputs require a fresh real proof). The proof was ALREADY stale at base (the proof-update + workflow failures reproduced on the clean base), and the fix newly broke a third test (`test-measurement-cache-flags.js`, same root cause).
- Refresh: full default panel (16 seeds × capable/risk-aware/socialite/winseeker, 150d, observer on/off proof cases — 64 cases, 0 cached, ~22 min) → `evidence/2026-11-10/neutral-vetcount-b.json.gz` → `node scripts/balance-proof-update.js` (exit 0; `scripts/balance-proof.json` now points at the new panel).
- After the refresh, all three proof tests pass: `test-measurement-proof-update.js` exit 0, `test-measurement-workflow.js` 9/9, `test-measurement-cache-flags.js` 4/4.
- The remaining 4 quick-check failures (mobile-combat-cadence, occupation-panels, phone-frame-proof, establishment-r20) still fail identically after the refresh — pre-existing, unrelated to this arm, left alone.

## Metric review

- **The primary metric judged what it claimed to judge, and the verdict is GO.** The before-leg reproduced the disagreement on the band (7/8 seeds, both named shapes plus 30 more duplicate calls the re-measure never saw because it only compared wave 4). The after-leg agrees on 8/8 seeds across all waves 1–5, with trajectories byte-identical — the fix is a pure counting correction. The fates leg is part of the verdict and is met (17/17, all three scholars recovered).
- **The dup scope was wider than the prereg assumed.** The prereg framed (b) as a wave-4 symptom (140208's one repeat). The accounting shows duplicates at every wave, 32 calls, heavily wave 1–2 — the counter was overcounting routine kills all along, and any past reading of `state.waveKills` as "kills" (meta progression counts, records displays, harness telemetry) inherited the inflation. The fix corrects all of them at once because they all read the same counter.
- **Dedupe-key limitation (known, not chased):** the (day, mid, by, via, trick) key cannot distinguish a re-reported kill from a second beast of the same type killed the same day by the same killer via the same channel with the same trick. The log's standing rule (one body = one entry) governs; the counter follows it. If a future arm needs the distinction, the key needs a beast-instance id — filed in the findings backlog.
- **Ledger note (known, not chased):** a duplicate `recordWaveKill` call still feeds `scoreLedgerKill` (bounded by the per-type cap), exactly as before the fix. The ledger can therefore score a re-fired kill twice up to the cap room. Changing ledger scoring would be a balance change, not a reconciliation — left alone, flagged here.
- **Cap note:** at the 1000-entry log cap, a real kill still increments the counter (the counter is honest about the kill) though no entry is kept. The cap is never reached in a 150d census (~60 entries). Log == counter holds below the cap, which is every run that matters.
- **Steve ruling arriving mid-run (NOT in this arm's scope):** during this run MEMORY.md gained "SCHOLAR COUNTS AS A VILLAGER (Steve 2026-11-10 07:39 CST): RULED — the player character (the scholar) is part of the village, and their wave kills count toward the village's living-veteran bar, same as any villager's. The 'scholar drain' was a defect, not a design question. Fix direction: count scholar kills in the veteran bar." It is also filed in the findings backlog as [ruled] 2026-11-10, naming this reconciliation as the companion half ("and reconcile the kill-log vs veteran-counter disagreement"). This arm does NOT implement it: the task preregistered "do NOT change who counts as a veteran", the prereg binds the run, and the scholar-counts change (ladder.js `_ladderLivingVeterans` + standing.js readiness + the table.js delivery agreement) is a separate build with its own re-measure (the backlog entry names the 140201–140216 bands). Flagged here for the coordinator to queue as the next arm. The reconciliation in this arm is unaffected by the ruling — log == counter holds regardless of who counts as a veteran — and the ruling changes nothing in this arm's numbers: the tribute ever-ready rates reported above are under the current (non-scholar) bar, as preregistered.
- **Balance-panel note:** the panel compare's `review_required` is a sample-size verdict (2 pairs), not a movement signal — all paired deltas are 0. A full 16-seed panel compare was not run for the secondaries because the same-instrument before/after already proves byte-identical trajectories on the measured band; the small panel was the preregistered attempt through the real instrument, and its data agrees.
- **Proof-test note:** the first proof run died silently (exit 1, no output past the reconcile legs) because `quietLog` was called without `await` inside synchronous checks — it silences `console.log` until a microtask boundary, swallowing the PASS/FAIL lines. Fixed by calling the engine functions directly in the sync checks; the rerun printed all 19 legs. Worth remembering: never fire-and-forget `quietLog` in a sync context.

## Findings backlog

- Appended: `- [open] 2026-11-10 — combat/telemetry — KILL CHOKE POINT RE-FIRED UP TO 8x PER KILL (sim-vetcount-reconcile-b, evidence/2026-11-10/sim-vetcount-reconcile-b.md § The disagreement was bigger than wave 4): ...` — the caller-side question (which paths re-fire `recordWaveKill` for one kill; bursts cluster same-day/same-killer/same-monster, e.g. 140204 d75 belltoad x7, 140202 d54 x7 across three types). The counter now follows the log, so the symptom is contained; the re-fire itself is unexamined.

## Files

- Prereg: evidence/2026-11-10/sim-vetcount-reconcile-b-prereg.md
- Evidence (this file): evidence/2026-11-10/sim-vetcount-reconcile-b.md
- Corpus: evidence/2026-11-10/perseed-vetcount-reconcile-b/before/vetcount-b-s14020{1..8}.json + .../after/vetcount-b-s14020{1..8}.json
- Driver: scripts/vetcount-b-driver.js (new)
- Analyzer: scripts/vetcount-b-analyze.js (new)
- Proof: scripts/test-vetcount-reconcile-b.js (19/19)
- Fix: src/js/game.js (`recordWaveKill` counter gating, `recordPyrrhicKill` pyrrhic stamp)
- Fates fix: scripts/capstoneready-b-driver.js (final `killers` table) + scripts/capstoneready-b-analyze.js (fates from `killers`, old-corpus fallback)
- Panel compare: evidence/2026-11-10/vetcount-panel-compare.md + .json
- Measurement-proof refresh: evidence/2026-11-10/neutral-vetcount-b.json.gz (full 16×4 panel) + scripts/balance-proof.json (re-pointed at it)
