# Run fleshout-20261021T0015Z — flesh-out loop, axis scale-onramp (the blocking axis)

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14)

- **Axis:** scale-onramp (blocking, converging). The STANDING DIRECTIVE (2026-10-12) overrides the lever rotation; the convergence tracker is the authority and records scale-onramp as converging, not converged.
- **Arms (3):**
  - sim-deathliturgy-fix — GAME-CODE fix for backlog item DEATH-LITURGY TEMPLATING BLANKS. GO = RED→GREEN proof (all 3 blanks) + det-gate byte-identical + sense PASS (beats read as grief, quoted before/after). [needs-eyes] (player-visible fiction).
  - sim-folkname-map — INSTRUMENT-ONLY (zero src/js) for backlog item FOLK-NAME DEATH CAUSES CAN'T JOIN THE KILLER-WAVE MAP. GO = RED→GREEN proof + DET byte-identical + regression taxonomy identical on the real corpus.
  - sim-villagersense — DIAGNOSTIC (mission item 4: villagers act like people). GO = coverage gate (≥40 judged excerpts across ≥8 runs × policies) + every flag filed to sim-findings.md with transcript evidence, 0 fabricated.
- **No wall-metric sims this run:** all three arms are fix/instrument/diagnostic. Wall numbers are carried from the recovered windowseat corpus (dead run fleshout-20261020T2145Z). No new lever was judged against the wall.
- **Backlog hygiene (verified against git log BEFORE claiming):** the planned sim-killbeat-fix arm was CANCELLED pre-spawn — the blank was already filled 2026-10-20 by commit 5898e0238 (killbeat misattribution, proof 24/24, evidence/2026-10-20/sim-killbeat.md). SILENT ARMING BEATS was likewise already filled by eba11e13d (sim-vgearbeats). Both backlog items marked [fixed]; the backlog was stale.

## STALE-LOCK RECOVERY

Lock fleshout-20261020T2145Z existed (created 2026-10-20T21:53:36Z); its run's worktree heartbeat was 65 min stale → DEAD per protocol, no matter how fresh the lock. Deleted the lock, marked the claim `.DEAD`, noted here.

That run's 3 arms had all finished as concurrent finishers:
- sim-vgearseat — KILLED-AT-PILOT, already on master as 0301f2450 (vgear × seatdrive composition moves nothing; the seat win truncates the veteran channel; named nexts are Steve-calls).
- sim-contestcensus — DIAG-GO, already on master as 9903dfb36 (contest share 3/28 post-kill deaths, 10.7%, all one d79 sweep; haven-encounter 19/28 dominant).
- sim-windowseat — committed e9a1836a2 but UNLANDED. Recovered in-run: rebased onto the true master tip (after correcting my own mis-targeted rebase onto the worktree's stale origin/master — reset + cherry-pick), proof re-run 31/31 GREEN with the exact Usage-header env (RED 5/5, SMOKE, DET 4/4 byte-identical), ff-merged as a202738cf. Tree released/removed, branch deleted.

## ARM RESULTS

### 1. sim-deathliturgy-fix → 64737ff99 [needs-eyes] — GO
All three death-liturgy templating blanks fixed in src/js (game.js, havenGrowth.js, villager-objectives.js):
- (a) `villageSicknessTick` captures `_wasDead` before `hurtVillager` — a villager already dead from another cause earlier in the pass gets their sick record cleaned silently. James's "died of thirst" + "succumbed to the fever" double is gone.
- (b) Root cause of the doubled grief beat: `registerDeath` fires `villageEvent('death')` internally AND all four vDie sites fired it directly (field-fight, raid, wound, sortie). New `Game.deathGriefBeat(vid)` gates on the `deathSeen` registry; all four sites route through it. One death = one beat.
- (c) All three death lines (starvation / wound / sickness) render through a new `grief` pool in `AMBIENT_BEATS` + `griefLine()` renderer, rotated by the pure (vid, day) `ambientPick` — no RNG draws, det-gate safe. Cause narration kept; the coda is the village's grief.

Proof `scripts/test-deathliturgy-20261021.js`: RED 8/11 failing pre-fix → GREEN 11/11 post-fix. Det-gate 8/8 identical on the NEW base (re-run post-rebase; digest honestly excludes Game.log/awayNews text — fiction rewrite by design — plus `village.needs`/`village.grief`, where the dedupe intentionally removes one duplicate fear/social bump: that's the fix working, documented in the evidence metric-review). Regression: test-corpses.js 38/38, test-death-pack-bonded 4/4.

Before → after (real fixture beats):
- `💀 Ethel succumbed to the fever. The village is 11 now.` (after the thirst line) → thirst line alone.
- 2 × "Nobody's talking much. The fire feels smaller tonight." → 1.
- `…starved. Slowly. The village is 11 now.` → `…starved. Slowly. Nobody eats much tonight. The pot stays full and nobody touches it.`

### 2. sim-folkname-map → 7ff27b3d0 — DIAG-GO
Closed the instrument gap: 'The Big Bastard' death cause = the village's own monsterDisplayName (`state.codex.monsters[mid].villageName` — bold-temperament `generateMonsterName` pool / curated lists), never in monsters.json. `WSI.folkNameMap(Game)` (pure read, post-last-hash, no RNG, no state writes) persists the per-seed map; the analyzer joins folk-name causes first (run truth beats static truth), then static lookup, then fight-start fallback.

Proof `scripts/test-folkname-map-20261021.js`: RED 4/4 → GREEN 7/7 (joins: killerMid gallowdeer, killerWave 1, killerVia 'folk-name-map'), UNIT 5/5, PERSISTENCE 2/2 on real 30d runs, DET 2/2 byte-identical — 20/20, re-verified 20/20 post-rebase. Regression: taxonomy on the real 2026-10-20 corpus byte-identical to the committed summary. check.js --quick 265/3 — the 3 failures are pre-existing test-phone-frame-proof.js receipt staleness vs convo files changed by other lanes (zero src/js in this arm).

### 3. sim-villagersense → 5eaf2270d — DIAG-GO
Villager-personhood sense audit on the winning SEATDRIVE default-on substrate, mined from committed corpora only (zero new sims): 58 excerpts judged (≥40 gate met) across 9 runs (66004/66005/66006, 64304, 64202, 8805, 9501–9503) × {leadfeast, belongfeast, competent}. Sampler instrument `scripts/sample-villager-sense.js` (345 excerpts, repeat-ledger). 13 findings filed to sim-findings.md (F1–F13), all [open], fixable, none steve-call:
F1 stock routine departures verbatim; F2 subordinate mourning beat 3×/day verbatim (hierarchy.js); F3 gossip lines verbatim across villagers AND runs; F4 monster-naming debate two-line template; F5 mantle-transfer liturgy one template; F6 anonymous "Whatever that thing was" (game.js:21420); F7 passerby noun-swap template (betrayal.js); F8 journey gossip stock; F9 "— comedy." tone-tag leak inside quoted spoken dialogue (conversation.js:2250, filter 722–729); F10 shared expedition companion barks (party.js:358); F11 teach-gossip single template; F12 water-haul into a full cistern unnoticed; F13 "Quick version — Short version" filler merge artifact.

## WALL NUMBERS (recovered windowseat corpus, seatdrive default-on substrate)

national 10/16, table 7/16, wins 10/16, wave-4 11/16, wave-5 0/16, median survival 90d, max 163d. Door is leadfeast-only (7/8 vs 0/8). Window deaths: haven-encounter 16, starvation 2, attrition 2, expedition 1, contest 1 — 0 unexplained. #695 answered (0 noFlee deaths in 16 runs).

The wave-5 door remains the binding wall on every substrate. The veteran channel is closed on the winning substrate (vgearseat: the seat win lands ~d90–134 and the run ends before villagers can blood themselves; named nexts are Steve-calls).

## VILLAGE ASSESSMENT (plain words)

The village on the winning substrate is a competent, grieving, winning village. It reaches national in 10 of 16 runs and wins through the feared/light doors in 10 — the scale wall gates the *indispensable* door (wave-5), not the win. What it looked like up close: scholars still die alone at Haven to wave-3/4 haven-encounters (16 of 22 window deaths) — the wall is window survival, not path design. The dead are now mourned honestly (this run's fix): one cause line per death, one village beat per death, grief that reads as grief instead of a headcount. The kill log and the fiction now agree on who killed what (folk-name map), and the personhood audit found the villagers' voices are the next blank — 13 verbatim-template findings filed, from stock departure lines to gossip repeated word-for-word across runs. Blanks filled this run: 3 death-liturgy (fix), 1 instrument gap (fix), 2 stale backlog items corrected, 13 narration blanks documented for future arms.

## TELEMETRY DEVIATION CHECK

Ran `telemetry-check.js` vs `telemetry-baselines/scale-wall.json` (winseat regime) on the recovered windowseat corpus (16 files). LOUD lines:
- `wins disappeared: baseline 16 -> current 0` — SCHEMA ARTIFACT: the corpus records wins nested under `wall.wins` (= 10), not top-level `wins`; missing path counts as 0. Same class as the documented nested-key artifacts.
- `table swung -69%/-87%`, `national swung -75%` — REGIME ARTIFACTS: the winseat baseline carries VETREL=1/REPOSITION=1; the windowseat substrate doesn't. Corpus numbers (national 10/16, table 7/16) match the committed summary exactly.
Baseline NOT rolled. Verdict: no real deviation; the check confirms the corpus is what the summary claims.

## METRIC REVIEW (§14)

- The lever-rotation index (`longsims-rotation.txt` = 3) was NOT advanced: the standing directive overrides the rotation, and the tracker (the authority) records scale-onramp as converging, not converged.
- Directive-lift note for Steve: the directive's original trigger ("until a run shows villages reaching national/table in sims") is now technically met on the winning substrate (national 10/16, table 7/16, wins 10/16) — but per the convergence protocol the tracker state governs, and it says converging. Lift remains his call; not acted on here.
- The deathliturgy det-gate's digest exclusions (Game.log/awayNews + the intentionally-removed duplicate fear/social bump) are the fix working as designed, not a gate weakness — recorded here, not re-scored.
- Infra note: my landing command chained `worktree-release.sh` after `git merge --ff-only` with `;`, so the release ran despite the ff-only failure (mid-run master movement by the playtest loop). Recovered by re-registering the tree, rebasing, re-verifying the proof, and re-releasing. Lesson: gate the release on the merge exit code.
