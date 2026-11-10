# sim-scholarcount-a — prereg: count scholar kills in the veteran bar (BUILD, Steve RULED 2026-11-10 07:39 CST)

- Arm: sim-scholarcount-a (Loop A, run fleshout-loop-b-20261110T1415Z — run fleshout-20261110T1415Z, axis scale-onramp / winnability chain)
- Branch: sim-scholarcount-a; base anchor `a80b2d789` (worktree `~/workspace/worktrees/sim-scholarcount-a`, `git status --short` empty at prereg time)
- Grounding: evidence/2026-11-10/sim-capstoneready-remeasure-b.md (1142Z re-measure, band 1); evidence/2026-11-10/sim-scholardrain-b.md (drain quantified); evidence/2026-11-10/sim-vetcount-reconcile-b.md (counter/log reconciliation, base of this arm); sim-findings.md entry [ruled] 2026-11-10 SCHOLAR KILLS COUNT. Canon: NO separate canon doc covers the Standing ladder or veteran counting; the spec is src/js/ladder.js (comments + rules block) and src/data/ladder-capstones.json (`_doc` field) — the 2026-11-07 victory-gating redesign. The ruling is Steve's, in MEMORY.md verbatim: the scholar is part of the village and their wave kills count toward the living-veteran bar, same as any villager's. The "scholar drain" was a defect, not a design question.
- Finding: the scholar never counts toward the tribute bar. 15 of 21 wave-4 kills on band 1 were made by the scholar at kill time; 25 of 38 on the two directly-measured bands. Both ready windows on band 1 closed when the pair's members took the scholar's seat. Bridget Crawford killed THREE wave-4 beasts (d62, d75, d77) as scholar, all uncounted; Valeria Quispe killed FOUR (d90–112) on 140210 and the tribute counter never moved.

## What reads what (investigation, pre-fix — this decides the shape)

- The ONLY exclusion of scholar kills is `src/js/ladder.js` `_ladderLivingVeterans(minWave)`: `isLiving` returns `false` when `vid === this.villagerId` (the current scholar). It reads `state.waveKillLog` (all entries, pyrrhic included) and counts distinct living killers. It is called from exactly one place: `ladderCapstoneReady('military_tribute')` (ladder.js:483), which reports `veterans` against the data form's need (2, unchanged).
- `src/js/standing.js` `waveCombatReadiness(w)` ALREADY counts the scholar: its `isLiving` returns `true` for `scholarId` ("the scholar is the current adventurer"). The wave-4/5 unlock veterans bars and the blooded lever (which reads `waveCombatReadiness(5).veterans`) already follow the ruling. NO change there — verified by code read, pinned by a proof leg.
- `src/js/table.js` `ladderDeliverCapstone('military_tribute')` pays 2 living NON-scholar veterans via the one removal choke point `removeVillager(vid, 'tribute')`. The scholar cannot be paid: the scholar is the player character, and `removeVillager` strips roster membership, positions, mentorship, and sick records for a villager who leaves — removing the scholar would remove the player. The price (2 veterans leave Haven) is UNCHANGED by this arm. Consequence, stated before measuring: after the fix, readiness may read ready with a scholar + 1 villager pair while delivery honestly refuses with `veterans-short` (voiced in app.js as "Two living wave-4 veterans must stand for the tribute."). That reopens the leg-3 readiness/delivery gap deliberately, under the ruling — the bar is about the village's strength, the payment is about who can leave. It is filed as an open item (steve-call: what the scholar pays, if anything, when the pair is scholar+1; and the refusal wording, which will read false when scholar+1 stand). This arm does NOT invent a scholar payment. The readiness return gains an additive `payable` field (non-scholar living veterans) so the distinction is observable by the instrument and any future UI.
- No other veteran-identity read excludes the scholar: `villager-goals.js` (own kills by vid), `win-plan.js` (kills by vid), `table.js` seat lines (w4/w5 counts from the log) are identity-neutral. `game.js` `recordWaveKill` / `recordPyrrhicKill` and the vetcount-b counter agreement are UNTOUCHED — do not touch the counter/log agreement.
- `villageLadder()` stage points do NOT read veterans (`_ladderLivingVeterans` is called only from `ladderCapstoneReady`); `ladderTick()` only records stage beats. The competent policy never calls `ladderCapstoneReady` or `ladderDeliverCapstone` (verified: no ladder/capstone/deliver references in scripts/policies/competent.js). The fix is therefore a PURE READ for sim trajectories: the armed leg must reproduce the control trajectories exactly (result days, end reason, deaths, waveKills, maxWave per seed). Any divergence stops the run for investigation.

## Fix shape (chosen BEFORE measuring — preregistered, not discovered mid-run)

1. `src/js/ladder.js` `_ladderLivingVeterans(minWave)`: the scholar counts as living — `isLiving` returns `true` when `vid === this.villagerId`, mirroring `standing.js` `waveCombatReadiness` (the engine's standing convention: the scholar is the current adventurer). The killer must be ALIVE and a VILLAGER: the scholar IS a villager (the ruling); a dead killer never counts (`vpOf` says dead); a log entry whose `by` is not the scholar and has no living villager record (`vpOf` null/dead) never counts. Comments updated to state the new rule and its leg-3 history (readiness used to exclude the scholar so it agreed with delivery; the ruling overrules that agreement for the BAR — delivery still pays non-scholar only).
2. `src/js/ladder.js` `ladderCapstoneReady('military_tribute')`: returns `veterans` (new, scholar-inclusive count) plus additive `payable` (non-scholar living veterans, the old count). Need stays 2. No other deed's return changes.
3. `src/js/table.js` `ladderDeliverCapstone`: NO behavior change. The stale KNOWN GAP comment is corrected to the new state (readiness counts the scholar; delivery still requires 2 payable veterans and refuses honestly otherwise).
4. No win price, deed gate, or `readyDemand` number moves. No demand in `standingCfg()` changes. No counter, ledger, codex, tale, beat, or `villageSlain` write changes.
5. Pyrrhic kills: UNCHANGED. A pyrrhic kill by the scholar counts the killer as a veteran exactly as a pyrrhic kill by any villager does (veteran identity reads all log entries, pyrrhic included — vetcount-b). Pyrrhic still scores NOTHING toward `waveKills` counters (steve-call boundary stands).
6. Succession: under the fix a veteran who takes the scholar's seat KEEPS counting while alive — succession no longer closes ready windows. Only death (or the tribute payment itself) removes a veteran. The succession slice of the drain (61 veteran-days on the scholardrain band, vs 392 death-days) is what this fix recovers; the death slice is untouched. The scholar is still the one out dying (77/106 deaths were scholar deaths on the scholardrain band).

## Instrument

- New driver scripts/scholarcount-a-driver.js (derived from capstoneready-b-driver.js, same daily census + kill-time sampling + final `killers` table): per daily row records `livingVeterans` (NEW engine read), `livingVeteransLegacy` (old rule: non-scholar living veterans, computed from the log + scholarId + alive lookup), `veteransAll` (scholar-inclusive killer list with isScholar flag), and `payable` from the readiness return. Kill-time samples record BOTH counts at the kill moment. Corpus: evidence/2026-11-10/perseed-scholarcount-a/scholarcount-a-s<seed>.json (the driver refuses to overwrite).
- New analyzer scripts/scholarcount-a-analyze.js: judges the primary metric, the legacy guard, trajectory identity vs the control corpus, the cost bar, and the wall numbers; prints per-seed new-vs-legacy tables.
- Proof: scripts/test-scholarcount-a.js (must pass ALL legs before any scored seed): scholar kill counts (engine leg, RED before the fix); dead killer does not count; non-villager kill (unknown id; dead villager) does not count; pyrrhic scholar kill counts as a veteran and moves no counter; `waveCombatReadiness(5)` already counts the scholar (already-true leg); delivery still refuses honestly with scholar+1 standing and succeeds with 2 non-scholar veterans; determinism (same seed twice, recorder-wrapped, identical rows/samples/killers); neutrality (recorder-wrapped competent vs plain competent, identical trajectories).
- Ontology: no new src/js function is added (one existing function modified, no new `provides:` entry) — `node scripts/validate-ontology.js` runs before the measurement commit anyway.

## Primary metric (binds the run)

Control (band 1, vetcount after-leg corpus = current-master behavior, 8 seeds 140201–140208): military_tribute ever-ready **2/8** (140201 d90, 32 ready days; 140208 d135, 3 ready days); peak living veterans (legacy) [2,0,0,0,1,1,0,2] — peak ≥1 on **4/8** seeds; median survival 125.5d; starvation deaths 0; wave-4 kills counter 20 / log 21 (20 counted + 1 pyrrhic); wave-5 unlocked 1/8; national 0/8, table 0/8, wins 0/8.

Prediction from the control corpus (computed this run, read-only, before any scored seed — `/tmp/predict2.js` over the vetcount after-leg daily rows + kill-time samples): the scholar stands as a counted veteran on **99 pooled scholar-veteran days**; predicted new peaks [3,1,1,1,1,1,1,2]; predicted new ever-ready **2/8** (same two seeds — no NEW window opens on this band: the binding constraint here is two killers alive at once, not who counts; ready-days 38 vs 35). The prediction is a guide for the threshold, not a second control — the armed leg measures the real thing, and kill-time sampling may find a sub-day overlap the daily prediction misses (notably 140203 d109, Emma + pyrrhic Lena).

- **(a) Peak living veterans ≥1 (daily snapshot OR kill-time sample) on ≥7/8 seeds** (control 4/8; predicted 8/8 — every seed produced ≥1 wave-4 kill, and at the kill moment the killer is alive).
- **(b) Pooled scholar-veteran days ≥80** (predicted 99; the bar is 81% of prediction, allowing ≤1 day of kill-day snapshot lag per scholar-killer).
- **GO needs (a) AND (b).** A miss on either is NO-GO, never re-scored against a friendlier metric mid-run.
- Guard (part of the verdict, not a side note): legacy (payable, non-scholar) ever-ready stays **2/8** AND legacy peak per seed is identical to control [2,0,0,0,1,1,0,2] — the old bar is preserved exactly as the payable subset. Trajectories identical per seed vs the control corpus (result days, end reason, deaths, waveKills, maxWave). A trajectory divergence or a legacy movement stops the run for investigation.

## Cost bar + secondaries (judged alongside, reported honestly)

- Cost bar (task): total starvation deaths (teleDeaths cause containing "starv") armed <= control + 2 (control 0, so ≤2); arm-only starvation <= control (starvation deaths on seeds whose trajectory changed vs control — with identical trajectories this is 0 by construction); median survival (result days) armed >= 0.8x control (≥100.4d). A cost-bar breach is NO-GO even if the primary metric passes.
- Secondaries (reported, not judging): military_tribute ever-ready (EXPECT 2/8 — no new window predicted; if a kill-time-only window opens, say so plainly and do not re-score); ready-days pooled (expect 38 vs 35); first-ready days (expect same or earlier); deliverable-pair windows (legacy ≥2 — expect 2/8, the payable subset); trade_charter / feast_embassy ever-ready (expect 0/8); wave-5 unlock (expect 1/8 — the wave gate already counts the scholar, so no movement is expected); wave-4 kills counter/log (expect 20/21, unchanged); national / table / wins (expect 0/8).

## Horizon + why

- **150 days, death-aware** (same as the re-measure census: the veteran-banking window needs room past d77; dead villages stop simulating).

## Seeds

- **Band: 140201–140208 (8 seeds), DELIBERATELY REUSED, not fresh.** This is an identical-seed before/after: the same band must run on both legs, so freshness is the wrong test — the band's prior use IS the point. Recorded check (this run, before any scored seed): per seed, evidence `*.md` hits are 2–11 and evidence filenames 3 each — all of them the re-measure evidence/prereg/corpus, the remeasure2 prereg, the scholardrain/vetcount evidence, and the per-seed corpus JSON; scripts/ hits are 0–3 (the remeasure2 driver/test mentions for 140201/140203/140208); `~/memory/` hits are 0–2 (the coordinator's run notes naming the band). No other use of any seed in the band. Used bands NOT reused: 140101–140108 (1030Z baseline), 140209–140216 (band 2, confirm band — see below), 140217–140224 (scholardrain band), 99641–99648, 99591–99598, 99101–99108, 110001–110016, 120101–120116, 53011–53018, 73671–73678.

## Policies

- Plain competent (`scripts/policies/competent.js`, no env arms) — the same policy the re-measure census used. The recorder wraps `daily()` plus the two kill-log choke points; it performs no game actions, consumes no RNG, and writes no game state (neutrality proven in scripts/test-scholarcount-a.js).

## Confirm (if pilot GO)

- Band **140209–140216**, re-checked for freshness at confirm time (it is the remeasure2 band; the reuse is again a deliberate identical-seed before/after against the remeasure2 control corpus). Confirm GO needs: peak ≥1 on **≥4/5 kill-producing seeds** (control 3/5 — kill-producing seeds are 140209, 140210, 140212, 140214, 140215; the other three never produced a wave-4 kill, so ≥7/8 is impossible on this band by construction) AND legacy ever-ready unchanged **0/8** AND the cost bar held. Scholar-veteran days reported with an expectation of ≥40 (estimated from the remeasure2 narrative: Valeria ~23d + Mara ~14d + Katana ~7d + Fatima ~8d) — an expectation, not a judging bar, because band 2's control corpus has no scholarId rows to predict from exactly.

## Balanced panel (§15)

- The primary metric is a deterministic counting invariant (the scholar counts in the live read) judged by the analyzer on identical seeds — the balanced panel measures distributions, so it is not the judge here. A `balance-panel.js` compare will be attempted for the secondaries (same shape as vetcount-b's 2-seed attempt); if its corpus shape does not fit this census, that is recorded in metric review and is not a verdict change.

## Verdict rule

- GO = primary (a) AND (b) AND legacy guard AND trajectory identity AND cost bar held. A miss on any leg is NO-GO, never re-scored.

## Metric review

- (To be filled after the run: did the metric judge what it claimed to judge; did the armed leg realize the prediction; did the panel attempt fit.)
