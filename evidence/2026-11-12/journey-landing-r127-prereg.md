# journey-landing r127 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon d28)

**Run id:** playtest-loop-a-20261112T0210Z (scheduled Wed 2026-11-11 19:45 CST, started ~02:10Z).
Rotation read 0 → leg 0 LANDING; write 0→1 at run start (verified by read-back).
**Base:** local master `d897eab1f` (sim-voice-adopt-round-0130 landed). `git pull --ff-only` in main tree: already up to date (checked at run start; the origin/master divergence standing since r120–r125 was NOT re-checked this run — see run note).
**Lock:** created 02:10:19Z, run_id `2026-11-12T02:10:00Z`. Heartbeat loop `/tmp/hbloop-r127.sh` (every 10 min) after registration. **Delete lock at closeout, even on failure.**
**Numbering note:** Lane A leg counters are per-leg; the last landing run was r126, so this run is r127.

## Seed band — DELIBERATE REUSE (defect band, 5th run)

**Seeds 1142–1151 (the r121 band, reused on purpose).** The Q1 defect reproduces deterministically on this band: seed 1151 d28, scholar vs The Focus Group + 2 eye-heads, 0 strikes / 3 failed moves to (6,6) (r126 run note, mechanism confirmed from the r126 AFTER census fight log). The judge is the WITHIN-RUN before/after delta on identical seeds (§15), never a cross-run comparison, so the reuse cannot contaminate the verdict.
**Freshness check (local_seed_band_freshness skill, this run, before any scored seed):** grepped `evidence/` preregs for `1142` / `1142–1151` — named in journey-landing r121–r126 preregs and journey-establishment r117/r118/r127/r128/r131/r132 preregs; no forbidden-band list names 1142–1151. Reuse is sanctioned here by r126's run note, which names the scholar-turns fix "for the owning run" — this run IS that owning run (landing leg owns the scholar-turns watch) and the fix below is that named fix. Reservation explicitly released for this run's named remainder. Recorded here per the skill.

**Design — BEFORE/AFTER on matched seeds (§15, §9):** both drivers run the SAME seeds 1142–1151, DAYS=28. BEFORE = r126 AFTER driver verbatim except OUTDIR/header + the policy require pointed at the FROZEN pre-fix policy (`scripts/policies/competent-r126.js`, a byte copy of `competent.js` at base — the fix lives in the policy file both drivers load, so the freeze is what makes BEFORE a true baseline). AFTER = the same driver verbatim except OUTDIR/header, loading the FIXED `scripts/policies/competent.js`. No other delta between the drivers.
Analyzers: scripts/analyze-landing-r118-outingchain.js; scripts/analyze-landing-r126-presshop.js; scripts/analyze-landing-r125-personal-bridge.js; scripts/analyze-landing-r126-bridge-pools.js; scripts/analyze-landing-r104-20261105.js (DIR via argv); scripts/analyze-landing-r112-practice.js (DIR via argv); scripts/analyze-landing-r117-huntpractice.js; scripts/analyze-landing-r117-zerodmg-v2.js; scripts/analyze-landing-r120-scholar-turns.js; scripts/analyze-landing-r107-commit-offer.js (WITH the r122 settled-favor exclusion); scripts/analyze-landing-r127-topic-dwell.js (NEW — Q2, see below).
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or gate change in this run. **Perception law (2026-10-28) stands** — all instruments read-only; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** Q1 is the fix for r126's named remainder (the scholar-turns miss). A game-code fix is in scope ONLY for Q2, and only if the serving-rate read shows a pool that serves often enough to repeat (r124/r125 voice-pass rule: one pool at a time, each with its own proof).

## Canon

docs/CANON.md read at run start. docs/CONVERSATIONS.md is the canon doc for Q2 — it promises "No repeats, never": `convoPick` tracks said lines by TEXT across ALL threads per villager; generic pools "cycle in varying order". No canon doc covers the competent-policy fight approach (Q1) — that is sim-harness policy, not game code; the fix changes only how the sim player walks, never game rules.

## Q1 (PRIMARY) — THE SCHOLAR WHO WALKS NOWHERE: beastStrikeTarget failed-move fallback

**Basis (read pre-panel, confirmed from the r126 AFTER corpus, seed 1151 d28):** fight vs The Focus Group (wave 3, 248 HP) + 2 eye-heads, ally Nadia. Fight log (census `fights81[3]`, 5 rounds, routed): scholar `player-move to (7,7) moved:true`, then THREE `player-move to (6,6) moved:false` turns, 0 strikes; Nadia deals all 90 damage (25+23+19+23); monster hits scholar once for 23. Root cause, read in code (`scripts/policies/competent.js:2332` `beastStrikeTarget`): out of range, the policy picks ONE best adjacent tile (lowest Chebyshev distance from the scholar), steps toward it with `Game.tbPlayerMove(dx,dy)`, and IGNORES the result — `tbPlayerMove` returns false (no path / too far for this turn's movement / destination blocked) but the policy still calls `endTurn()` and returns `'moved'`, and still increments `ctx.closed` as if the approach worked. Next round the positions are unchanged, so the same tile is picked again: three identical failed steps, zero strikes.
**Fix (policy, NO src/js change):**
- Build ALL 8 adjacent tiles (interior 1..7, unoccupied), sorted by Chebyshev distance from the scholar; try each in order: compute the affordable path step (same terrain-priced walk as today), record the scholar's position before the move, call `Game.tbPlayerMove`, and accept the move ONLY if the scholar's position actually changed (position check, not the return value — `tbPlayerMove` returns true without moving under the moderator's verb block). Stop retrying if it is no longer the player's turn.
- On a successful move: `ctx.closed` increments (only now — a failed move must not count as a closed approach), `endTurn()`, return `'moved'` (turn-ending behavior unchanged for the working path).
- If every candidate fails: `endTurn()`, return `'stuck'`, and record `ctx.stuckTurns` (+1) and `ctx._strikeStuck = {from:[px,py], target:[tmx,tmy]}` so the analyzer can see it. The caller already returns true on any non-'struck' result, so a stuck turn spends exactly one turn and the next round re-tries with (possibly) changed positions.
- The in-range strike path is untouched.
**Proof test (NEW):** `scripts/test-journey-landing-r127-strike-fallback.js` — loads the real `beastStrikeTarget` export against a stub Game/fight (no full harness needed: the function takes Game, f, ctx, p, px, py, tgt, endTurn as arguments). Cases, each in its own process: (1) `first-tile-blocked`: the best tile's `tbPlayerMove` refuses but the second tile succeeds — scholar moves, returns `'moved'`, `ctx.closed` = 1; on unfixed code the policy returns `'moved'` with the scholar unmoved and `ctx.closed` = 1 → FAIL. (2) `all-blocked`: every move refuses — returns `'stuck'`, `ctx.stuckTurns` = 1, `ctx.closed` = 0; on unfixed code returns `'moved'` with `ctx.closed` = 1 → FAIL. (3) `control`: best tile succeeds — returns `'moved'`, scholar moved, `ctx.closed` = 1 (pins the untouched path). Must FAIL on unfixed code (cases 1–2), ALL GREEN after.
**Pre-registered metric (binding):** on the AFTER corpus, ZERO fights with a living scholar, ≥3 scholar moves, and 0 strikes (the r126 scholar-turns watch definition) AND the 1151 d28 fight (or its seed-1151 equivalent) shows the scholar striking ≥1×, OR the fight is adjudicated by case in the run note with the stuck record read. If the 0-strike shape persists on AFTER, the fix is NO-GO — do not re-score. Carried bindings (below) must hold.

## Q2 — VOICE PASS: WHY DO grief/cheer/past/secret SERVE 0–1× WHILE personal SERVES 23×?

**Basis (r126 metric review):** 20 servings across 9 pools in 102 sittings; personal 23 servings (its own analyzer counts the r125 fix's pool separately — the 9-pool analyzer's 20 is the other pools). A repeat needs 3 servings of one pool in one sitting — nearly impossible at this serving rate. The binding question is NOT pool size now, it is serving rate: a bridge pool serves only when the player changes subject FROM that topic (`convo-beats.js:555`: `fromTopic = c.thread || lastBeat.topic || 'small'`). So the serving rate is the topic-dwell rate: how often a sitting is ON grief/cheer/past/secret when `dlg:subject` is pressed.
**Instrument (NEW):** `scripts/analyze-landing-r127-topic-dwell.js` — reads the BEFORE corpus transcripts + the driver log's subject-change lines: per topic, sittings where the topic was the thread at a subject change (serving opportunity), servings, and per-topic dwell share. Run on BEFORE first (the decision point), then AFTER.
**Fix (CONDITIONAL — only if a pool serves ≥3× in one sitting on the BEFORE corpus):** expand THAT pool (only that one) 2→6 lines in its own voice, with its own proof test modeled on r125's. If no pool reaches the trigger — the expected outcome — Q2 is measurement-only: report the per-topic dwell shares and answer WHY the four pools starve (topic rarely the thread at subject-change time vs. topic rarely offered at all), and name whether the starvation is a content gap (those topics never surface) or a picker artifact (the driver never dwells there). No src change on a starved pool: expanding a pool that serves 0–1× per 100 sittings changes nothing the player hears.
**Pre-registered metric (binding):** if a fix lands — proof test ALL GREEN post-fix AND 0 verbatim repeats of the expanded pool's lines in a sitting on the post-fix AFTER corpus → GO. If no pool triggers — report the dwell table and call Q2 MEASURED (no fix owed this run).

## Q3 — PRACTICE (carried)

movedCells d1→d28, attributed, seedsWithMove, skill0→pos, practiceReps.
Hunt reps 0 watch (r117 hunt-assignment policy question carries — tenth panel running).
**Bar:** GO if movedCells ≥ 50 with 10/10 seeds moving (r121: 97, r122: 103, r123: 95, r124: 95, r125: 96, r126: 100).

## Carried bindings (judged fresh on the post-fix AFTER corpus)

- **M1 ALIVE-D14:** 10/10 villages alive at d28.
- **M2 SYSTEM CONTACT:** 10/10 (systemDay d8–d9).
- **M3 FIGHT-LOG:** 0 unknown/mixed trigger.
- **M5 PEOPLE:** PASS (sense-read below — read full transcripts).
- **Zero-DMG invariant:** 0 violations.
- **Miriam line:** 0 "That's settled".
- **R66 HUNGRY:** report hungry share + starvation deaths (r126: 5/10, 0 deaths).
- **R73 narrow windows:** report NARROW / kept-inside-narrow.
- **Mantle latency:** report max (r126: VACUOUS — zero holder deaths).
- **1130-d6 amnesia shape:** 0 recurrences.
- **Scholar-turns watch:** verb totals; no living 0-strike ≥3-move fight (this run's Q1 — see above).
- **Deflect-fallback repetition:** worst sitting count (r126: 1×).
- **6394 flat fall-through:** 0 occurrences.
- **Kill-mean trend:** report per-seed mean (r126: 33.4).
- **Poison re-test:** count live re-tests (r126: 0).
- **Scholar-eats-first:** held design question, not changed.
- **Q6 M7 GOAROUND:** R84 prompt arrival ≥80% = GOAROUND-HOLDS; R85 complete == skips = RESCUE-GO.
- **Personal bridge (r125 fix):** 0 repeats in a sitting on the AFTER corpus.
- **Q1 r126 (combat-interrupted evening chain):** presshop farUnreached stays 0 on AFTER (regression check on the r126 fix).

## Seeds, pilot, shape

- Panel: seeds 1142–1151 (deliberate reuse — see above), DAYS=28, OUTDIR landing-r127-before (BEFORE driver, frozen policy) and landing-r127-after (AFTER driver, fixed policy), both under goal hidden_files evidence/2026-11-12/.
- PILOT FIRST: 3 seeds (1142, 1148, 1150 — includes the Q1 defect-adjacent seeds), BEFORE driver, before expanding. The pilot validates (a) seeds run; (b) the practice snapshots present in census JSON; (c) the outingchain analyzer runs on the pilot corpus; (d) the invariant test passes; (e) ≥1 forage_help favor observed; (f) ≥1 evening together attempt on a far node (d≥4); (g) the Q1 defect reproduces in the pilot corpus (1151 is NOT in the pilot — the defect check rides on the full panel; instead the pilot checks the frozen-policy BEFORE driver runs byte-identical to the r126 AFTER driver on the pilot seeds: same census headline numbers); (h) the Q2 topic-dwell analyzer runs on the pilot corpus. If the pilot shows 0 favors, document and still run the panel only if the carried bindings need the panel — the pilot decides; do not burn a full run on a dead question.
- Shape: the r118 outingchain analyzer runs on BOTH corpora as-is. The r126 presshop analyzer compares the two corpora for the outing shape (r126-fix regression check). The invariant test re-runs on the AFTER panel corpus as the after-proof. Q1 is measured by the scholar-turns analyzer + the 1151 fight-log read. The Q2 topic-dwell analyzer runs on BEFORE first, then AFTER.

## Metric review (filled at closeout, never mid-run)

- (to be filled)
