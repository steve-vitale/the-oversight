# sim-vetcount-reconcile-b — prereg: kill-log vs veteran-counter reconciliation (CORRECTNESS FIX, backlog #2077)

- Arm: sim-vetcount-reconcile-b (Loop B, run fleshout-loop-b-20261110T1248Z, axis scale-onramp / winnability chain)
- Branch: sim-vetcount-b; base anchor `7c2591d1f` (worktree `~/workspace/worktrees/sim-vetcount-b`, `git status --short` empty at prereg time)
- Grounding: evidence/2026-11-10/sim-capstoneready-remeasure-b.md § Metric review, instrument notes (a)–(c); evidence/2026-11-10/sim-capstoneready-remeasure-b-prereg.md; scripts/capstoneready-b-driver.js; scripts/capstoneready-b-analyze.js. Canon: NO separate canon doc covers the Standing ladder; the spec is src/js/ladder.js (comments + rules block) and src/data/ladder-capstones.json (`_doc` field) — the 2026-11-07 victory-gating redesign.
- Finding: backlog #2077 — the wave-kill / living-veteran counter disagrees with the kill log per seed, so no veteran lever may be judged on counter numbers alone. The LOG is the single source of truth (finding #2077).

## The three disagreements (as recorded in the re-measure, band 140201–140208)

- (a) `recordPyrrhicKill` writes the log entry but never increments `state.waveKills` (140203: log 2 wave-4 entries, counter 1). Both halves are deliberate at this base: the pyrrhic comment (game.js, sim-pyrrhic 2026-10-17) says pyrrhic kills score NOTHING toward wave bars — "scoreLedgerKill / state.waveKills counts / wave4Slain / checkWaveUnlockBeat" are listed as untouched, steve-call pending. So (a) is NOT fixed by incrementing the counter.
- (b) A same-day repeat kill is deduped from the log while the counter still increments (140208: counter 6, log 5). The log dedupe (gap-phase2 W1) says one body = one log entry; the counter counts the CALL. The counter is the wrong one here.
- (c) The analyzer's veteran-fates table (built from the last daily row's `veterans` list) drops killers who are the current scholar at the end — 3 of 17 distinct killers missing (David Kim 140202, Emma Larsen 140203, visjoin_63 140207). The last row's list deliberately excludes the current scholar (correct for the daily readiness read — the scholar never counts as a living veteran); the fates table asks a different question (who ever killed) and needs the full list.

## What reads what (investigation, pre-fix — this decides the shape)

- `state.waveKills` feeds NO game gate. Readers: metaProgression.js (meta-save count copy), records.js (records display), sim-harness.js (telemetry). Nothing unlocks, prices, or gates on it.
- `state.wave4Slain` feeds ONE gate: `Game.readiness()` (the OLD 2026-10-05 composite, +25 if >0 — a boolean, not a count). A deduped repeat kill can never flip it (the first call already set it >0).
- The wave ledger (`scoreLedgerKill` / `waveLedgerPoints`, the unlock feeder) is per-type capped and is NOT moved by this fix. A duplicate `recordWaveKill` call still feeds the ledger exactly as today (bounded by the per-type cap) — out of scope; changing ledger scoring would be a balance change, not a reconciliation. Noted in metric review, not chased.
- `villageSlain` (per-type teaching count) is NOT gated by this fix: its readers are 1+ thresholds (beasttricks teachable, codex stats) plus a cosmetic most-killed sort (trophy_room.mark). A duplicate call cannot flip any of them. Noted, not chased.
- The readiness reads are ALREADY log-based: `ladderCapstoneReady('military_tribute')` → `_ladderLivingVeterans(4)` reads `state.waveKillLog`; `standing.js` `waveCombatReadiness` reads the same log. NO readiness-read switch is needed — the alternative shape the task allowed (switch the read to the log) is already the live shape. The fix is therefore in the counter + the log stamp + the analyzer/recorder, not in any read.
- `_attrKills === false` (the honesty control, sweep-attr-20261013): the log is not maintained, so no dedupe verdict exists; every call must count exactly as today, or the control's behavior changes. The fix preserves this.

## Fix shape (chosen BEFORE measuring — preregistered, not discovered mid-run)

1. `src/js/game.js` `recordWaveKill`: `state.waveKills[wave]`, `state.wave4Slain`, and `state.waveKillByChannel` increment ONLY for a kill that is not a same-key repeat of a log entry already written — the log's own dedupe verdict `(day, mid, by, via, trick)`, computed before the increments and reused by the log block. One body = one count. When `_attrKills === false` the verdict is always "not a repeat" (no log to check against), so the control behaves exactly as today. The ledger, codex, tale, beat, and `villageSlain` writes are untouched.
2. `src/js/game.js` `recordPyrrhicKill`: the pushed log entry is stamped `pyrrhic: true`. NO counter change — the steve-call boundary stands (pyrrhic kills score nothing toward wave bars). The stamp only lets the census tell a pyrrhic log entry from a counted one. The channel counter on the pyrrhic path is gated on the same non-repeat verdict, matching (1).
3. Reconciliation rule (the LOG is the source of truth): for each wave w, `state.waveKills[w]` == the number of log entries with wave w and `!pyrrhic`. Veteran identity is UNCHANGED: `_ladderLivingVeterans` keeps reading ALL log entries including pyrrhic ones — a villager who killed a wave-4 beast in a lost fight still killed a wave-4 beast, and who counts as a veteran does not change. No demand number moves, no default flips.
4. Fates-table gap (c): fixed in the RECORDER, not the analyzer — the analyzer cannot recover what the recorder never saved (the last row's `veterans` list is the only killer list in the old corpus, and it excludes the current scholar by construction). The driver (capstoneready-b-driver.js, additive + backward-compatible, and the new vetcount driver derived from it) records a final top-level `killers` table built from the final `waveKillLog`: every distinct wave-4+ killer INCLUDING the current scholar, with alive/dead, ever-scholar, first/last kill day, kill count, waves. capstoneready-b-analyze.js prints fates from `o.killers` when present and falls back to last-row `veterans` for the old corpus.

## Instrument

- New driver scripts/vetcount-b-driver.js (derived from capstoneready-b-driver.js): the same daily census (competent policy, 150d death-aware) PLUS kill-call accounting — every `recordWaveKill` / `recordPyrrhicKill` call records `{method, day, mid, by, via, logged, dup}` — PLUS the final `killers` table (fix 4) PLUS a per-wave log-vs-counter summary in each per-seed file. Corpus: evidence/2026-11-10/perseed-vetcount-reconcile-b/before/ and .../after/ (the driver refuses to overwrite).
- New analyzer scripts/vetcount-b-analyze.js: per-seed reconciliation table (counter vs non-pyrrhic log entries per wave, waves 1–5), fates from `killers`, wall numbers, and a before/after delta table (`PERSEED_DIR=.../before COMPARE_DIR=.../after`).
- Proof: scripts/test-vetcount-reconcile-b.js (must pass ALL legs before any scored seed): determinism; pyrrhic counting (log entry stamped `pyrrhic: true`, counter unchanged, veteran read still counts the killer); same-day repeat (second identical call: no second log entry, counter increments once, channel counter once); fates inclusion (driver `killers` table includes the current scholar); neutrality (before/after state identical except the counter/readiness read — same seed, recorder-wrapped competent vs plain competent, identical trajectories; plus `_attrKills=false` control: counter increments per call exactly as before the fix).
- Ontology: no new src/js function is added (two existing functions modified, no new `provides:` entry) — `node scripts/validate-ontology.js` runs before the measurement commit anyway.
- The capstoneready driver/analyzer changes (fix 4) are additive and backward-compatible; scripts/test-capstoneready-b.js must still pass after them (the sibling arm reuses this instrument).

## Primary metric (binds the run)

- **Log == counter on 8/8 seeds after the fix.** For each seed, for each wave 1–5: final `state.waveKills[w]` equals the count of `waveKillLog` entries with wave w and `!pyrrhic`. GO iff all 8 seeds agree on all waves. A miss is NO-GO, never re-scored.
- Before-leg must reproduce the disagreement on the same seeds: expect 140203 log>counter by 1 at wave 4 (pyrrhic) and 140208 counter>log by 1 at wave 4 (same-day repeat), with the kill-call accounting naming the method of each (pyrrhic vs duplicate call). If the before-leg does NOT reproduce on this band, the run stops and the prereg is revised — no fresh band is hunted silently.
- Fates completeness (part of the primary verdict, not a side note): the after-leg `killers` table holds all 17 distinct wave-4+ killers the re-measure counted (re-measure total; per-seed counts re-derived from the after corpus), including every killer who is the current scholar at the end. A dropped killer is a NO-GO.

## Cost bar + secondaries (judged alongside, reported honestly)

- Cost bar: total starvation deaths (teleDeaths cause containing "starv") after <= before + 2 across the 8 seeds; median survival (result days) after >= 0.8x before median. A cost-bar breach is NO-GO even if the primary metric passes.
- Secondaries: military_tribute ever-ready + peak living veterans + wave-4 kill totals before/after. EXPECTED UNCHANGED (the tribute read is log-based and the fix does not move it; the counter on 140208 drops 6→5 to match the log — that is the fix working, not a game change). Report the direction honestly; any other movement is investigated same-run, not explained away.

## Horizon + why

- **150 days, death-aware** (same as the re-measure census: the veteran-banking window needs room past d77; dead villages stop simulating).

## Seeds

- **Band: 140201–140208 (8 seeds), DELIBERATELY REUSED, not fresh.** This is an identical-seed before/after: the same band must run on both legs, so freshness is the wrong test — the band's prior use IS the point. Recorded check (this run, before any scored seed): per seed, evidence `*.md` hits are 1–5 and evidence filenames 1 each — all of them the re-measure evidence/prereg/corpus itself (sim-capstoneready-remeasure-b.md + prereg, sim-capstoneready-remeasure2-b.md + prereg, sim-winnability-round-1142.md, and the per-seed corpus JSON); scripts/ hits are 0 except 140201/140208 (1 each — the remeasure2 driver/test mentions); `~/memory/` hits are 0 except 140201/140208 (1 each — the coordinator's run note naming the band). No other use of any seed in the band. Used bands NOT reused: 140101–140108 (1030Z baseline), 99641–99648, 99591–99598, 99101–99108, 110001–110016, 120101–120116, 53011–53018, 73671–73678.

## Policies

- Plain competent (`scripts/policies/competent.js`, no env arms) — the same policy the re-measure census used. The recorder wraps `daily()` plus the two kill-log choke points; it performs no game actions, consumes no RNG, and writes no game state (neutrality proven in scripts/test-vetcount-reconcile-b.js).

## Balanced panel (§15)

- The primary metric is a deterministic invariant (log == counter), not a distributional comparison — the balanced panel measures distributions, so it is not the judge here. The before/after secondary comparison runs through the vetcount analyzer's delta table on identical seeds (the same comparison shape the re-measure census used). A `balance-panel.js` compare will be attempted for the secondaries; if its corpus shape does not fit this census, that is recorded in metric review and is not a verdict change.

## Verdict rule

- GO = primary metric met (log == counter on 8/8 seeds, all waves 1–5) AND fates complete (no dropped killer) AND cost bar held. A miss on any leg is NO-GO, never re-scored against a friendlier metric mid-run.

## Metric review

- (To be filled after the run: did the metric judge what it claimed to judge; did the before-leg reproduce; did the panel attempt fit.)
