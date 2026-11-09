# sim-fightblend-attrib-b — the endpoint moved AGAIN, into a middle shape (DIAG, zero src/js)

**Arm:** sim-fightblend-attrib-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261109T1030Z (Loop B) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-fightblend-attrib-b, base master `8419eefa4` (rebased onto the explicit SHA before the prereg; branch tip was an ancestor, fast-forward, no conflicts) · **Prereg:** `evidence/2026-11-09/sim-fightblend-attrib-b-prereg.md` (committed `100474349` BEFORE any judged computation) · **Instrument:** DIAG recorder (`scripts/recorder-53007-20261108.js`, unchanged) on the doorwalk baseline leg, 150d death-aware, seed 53007 only. Corpora committed under `evidence/2026-11-09/perseed-fightblend-attrib-b/` (armed L0 + unrecorded control). Proof `scripts/test-fightblend-attrib-b.js` **32 passed, 0 failed, 4 skipped** — the 4 skips are the L1/L2 legs, never run per the stop rule.

## Verdict: ENDPOINT-MOVED-AGAIN — STOP, no attribution (L0 is a MIDDLE SHAPE)

**The current-master endpoint headline moved again, so the attribution does not run.** The prereg's stop rule fires as written: "if L0 does NOT reproduce the NEW headline, STOP and report endpoint-moved-again; do NOT run L1/L2." Seed 53007 on current master `8419eefa4` no longer dies at 138d — it **survives 150 days again, standing 199, seat d90, 1 wave-4 kill, 10 fallen**. The coarse headline (150d, survived, 199, d90) looks like the bisect-b MOVED village, but the kill link does not: MOVED had 2 wave-4 kills across 6 faced types and 9 fallen; this village has **1 wave-4 kill across 2 faced types and 10 fallen**, mechanism mixed/other. It matches neither headline, so per the prereg it is reported as an unjudged **middle shape** — a fourth shape for this seed — never forced into MOVED. The pre leg (`93e7bea26`) and fix leg (`3f405ff78`) were never extracted and never ran; no scratch dir was created. Fightblend is neither fingered nor exonerated. The fightblend question stays open until a stable current-master 53007 headline exists to attribute against — this arm supplies that headline (the MIDDLE shape below), so the next arm re-asks the same question against it.

**What still holds:** the village still sits a lesser seat (d90) and still reaches wave 4. What moved is the ending itself, again: the village that died at 138d on `ba21ca026` now survives the full 150 days with 9 people living and food in the pantry — the death undone, the kill link still thin.

## The re-verification — old vs moved vs new vs L0

| | OLD (53007-a, `6680d7924`) | MOVED (bisect-b, `55b5e5aae`) | NEW (0630Z, `ba21ca026`) | L0 (this arm, `8419eefa4`) |
|---|---|---|---|---|
| Days / end | 150, survived | 150, survived | **138, village-lost** | **150, survived** |
| gameDays | 150 | 151 | 138 | 151 |
| Standing | 584 | 199 | **100** | **199** |
| maxWave / unlocked | 5 / 5 | 4 / 4 | 4 / 4 | 4 / 4 |
| Seat | lesser d95 | lesser d90 | lesser d92 | lesser d90 |
| Wave-4 kills (waveKillLog) | 5 | 2 | **0** | **1** (Congregation d82, companion) |
| Wave-4 faced (types) | 5 | 6 | **8** | **2** (algorithm, congregation) |
| Fallen | 4 | 9 | **15** | **10** |
| Mechanism (analyzer rule) | sickness-first | combat-led | mixed/other * | **mixed/other** * |
| Living at end | 8 | 9 | **2** | **9** |
| Pantry at end | 400 kcal (0.2 food-days) | 29,100 kcal (13 food-days) | **0 kcal (0 food-days)** | **9,302 kcal** |

\* Mechanical class is mixed/other because the classifier's VIOLENT map has no `'the arena'` key (see § Classifier gap): violent counts 4/10 by the map (monster 1, contest 1, combat 1, arena 1 unmapped — the map keys `'arena'`, the game emits `'the arena'`); sickness 3, wounds 2, thirst 1. If `'the arena'` counted as violent, the mix would read 5/10 = 50%, still under the 60% combat-led bar. The evidence reports the mechanical label and names the gap; it does not re-score.

The unrecorded control reproduces the L0 headline exactly (150d, survived, 199, maxWave 4, lesser d90, w4 1, 10 fallen, mixed/other) — G2 neutrality PASS, so the movement is master movement, not the recorder. The proof's headline legs PASS on the middle shape (L0 armed and unrecorded both read MIDDLE; L0 differs from NEW on all five discriminating fields and from MOVED on w4 kills, fallen, and w4 faced).

**Fallen, L0:** d31 Luz (the arena), d40 Rafael (monster, Spool), d40 Se-ri (sickness), d44 Stan (sickness), d54 Riley (a wound that wouldn't close), d60 Luke (contest), d75 Elena (combat), d79 Hannah (sickness), d80 Riana (thirst), d83 Benoit (a wound that wouldn't close).

The first two graves are identical to NEW (Luz in the arena d31, Rafael to a Spool d40) — the early village is the same village. Then it diverges: NEW lost five more to sickness by d63 and kept dying into the arena and the wild; this village loses only one more to sickness (Hannah d79), stops at 10 fallen, and lives. The kill side tells the same story in reverse: NEW killed 4 wave-3 monsters and 0 wave-4; this village kills **7 wave-3 monsters** (redactor d37, focus_group d45, chorus_line d54, spool d54, ad_break d58, callback d82, buffering d121) **and 1 wave-4** (congregation d82, via a companion). The village on this master kills more and dies less.

**First divergence.** The daily rows hold byte-identical (living, pantry, sick, wounded, hungry) through d16 against the 0630Z NEW corpus, then diverge on **d17** (pantry 9,468 → 9,411 — a single pantry number, everything else identical). The reshuffle starts in the third week — later than the MOVED→NEW divergence (d10), and again with no wave-4 fight anywhere near it: the first death is still d31, the first wave-3 kill still d37. The early divergence is a small pantry wobble that compounds into a different village by d54.

## What moved it (suspect SET, NOT proven)

Only **three src commits** sit between `ba21ca026` (NEW) and `8419eefa4` (this arm): the conversation.js secret-response fix (`b98ac0730`, journey-deepening r120, +100), the food.js specialist-rung steepening (`e18f72dce`, journey-establishment r116, +22), and the villager-agency.js place-line fix (`e3ef2b612`, journey succession r161, +15). No driver-chain file changed in the same range; no `src/data/` change. The mover of the NEW→MIDDLE step is one (or a combination) of those three — this arm does NOT finger one without a bisect, and the prereg's POST-FIX MOVER clause does not fire (it requires L1/L2, which never ran). The most mechanistically plausible candidate is the **food.js specialist rung** (`e18f72dce`): it steepens self-taught specialist progression (5/15/30), which is the kind of change that makes villagers kill more wave-3 monsters (7 vs 4) and survive — but that is a hypothesis, not a finding. Proving it needs a before/after on `e18f72dce` itself (run 53007 at `e18f72dce^` vs `e18f72dce`), which is a different arm.

The fightblend question is untouched by this move: fightblend landed before `55b5e5aae`, and the NEW→MIDDLE step is fully explained in range by the three journey commits alone. The OLD→MOVED step — the one fightblend could have caused — is still unattributed.

## Village assessment — what the village looked like

Haven starts with twelve people and the same names as always, and this time the first month reads like the last run's: the scholar Luz dead in the arena on day 31, Rafael killed by a Spool on day 40, sickness taking Se-ri and Stan in the same week. But then the village steadies. Riley dies of a wound that won't close on day 54, Luke falls in a contest on day 60 — and after that, only four more graves in ninety days. The village that died at 138 days last run now has nine people alive at day 150 with 9,302 kcal in the pantry, and it did something the dead village never did: it killed a wave-4 monster. A companion killed the Congregation on day 82 — the village's first wave-4 kill since the moved master, and its only one. It faced the Algorithm too, and let it go. The table is set on day 90 and the Audit names the lesser seat the same day, and the village keeps living afterward — the seat is not the end of the story, just a chair taken while the dying slows. At the end the wave-5 readiness bars read armored 6/4, armed 9/6, tricks 26/3, veterans 1/2 — only the veterans bar is short, one living veteran where two are needed. One veteran, one wave-4 kill, and the door to wave 5 stays shut on a single missing veteran.

**Sense-test.** The mourning beats cohere and the names rotate correctly; the table-set (d90) → Audit (d90) sequence reads as cause and consequence. Two bisect-b findings do NOT recur here either: Sam of The Red Table begs zero times and there are zero "Thumbnails" trailer lines in the captured transcript. Both absences are trajectory artifacts (a different village, different days), not fixes — neither is claimed as one. One new texture: "The Audit" as a monster wanders the village d118–121 ("Something moves out there — The Audit." / "You turn to leave — behind you, The Audit stirs." ×4) — the wave-4 Audit showing up as a field presence after the seat is taken, which reads correctly as the Mirror Draft lingering, not as a bug.

## Wall numbers (this run — one seed, doorwalk baseline leg)

- National 0/1, table sits 1/1 (lesser only), wins 0/1 (baseline leg never walks a door).
- Wave-4 unlocks 1/1, wave-5 unlocks 0/1 (veterans bar short, 1/2).
- Survival 150d (n=1); max 150d; min 150d.
- Wave-4 kill link: 1 kill / 2 faced types on the lead seed (was 0/8 on NEW, 2/6 on MOVED).
- Telemetry deviation check: not run — DIAG re-verification, no lever before/after; the per-leg headline reproduction is the validity check.
- Balanced panel (§15): not run — DIAG recorder corpus, same standing as 53007-a/bisect-b; `balance-panel.js` refuses recorder corpora by design (recorded, not forced).

## Proof

`node scripts/test-fightblend-attrib-b.js` — **32 passed, 0 failed, 4 skipped** (run after the corpora were committed-present):

- G1 det-gate — PASS on fixtures + committed corpora (P1 sickness-first, healed sickness-first, collapsed mixed/other, broken-classifier sensitivity, attrition/combat fixtures, night-only mixed/other; headline predicate synthetics for old/moved/new/middle/endpoint + the ±5 standing boundary at 193; committed endpoint/53007-a/bisect-b/0630Z corpora read endpoint/old/moved/new respectively).
- G2 neutrality — PASS on the L0 pair (armed == unrecorded, same master `8419eefa4`, all headline fields + fallen + waveKillLog identical; `neutralityCompare` ok, 0 diffs).
- G3 integrity — PASS on both new corpora (armed: 149 rows d2..d151, diag on all rows, gap d2→d4 only, 0 instrument errors; unrecorded: same rows sans diag, 0 errors).
- The endpoint-moved-again signal is a PASSING leg, not a failure: L0 reads MIDDLE and differs from NEW on days, end, standing, seatDay, and w4 kills, and from MOVED on w4 kills, fallen, and w4 faced — the proof verifies the new headline is real and reproducible, and the evidence file carries the verdict.
- The 4 SKIPped legs are the L1/L2 legs (pre/fix corpora + headlines) — never run, per the stop rule.

## GO bars (binding)

1. L0 current-master re-verification reproduces the NEW headline — **FAILED: endpoint moved again** (150d survived, standing 199, seatDay 90, 1 w4 kill — a middle shape, neither NEW nor MOVED). STOP fires; the run ends here.
2. Each judged leg produces a full daily corpus with an end snapshot — **MET for L0** (armed + unrecorded); L1/L2 not run (stop rule).
3. Leg headlines judged against the decision tree — **MIDDLE headline recorded**, neither OLD, MOVED, nor NEW; no middle shape forced (MIDDLE is the prereg's named unjudged outcome for L0).
4. G1 det-gate — **PASS** (proof 32/0/4).
5. G2 recorder neutrality — **PASS** on the L0 pair (armed == unrecorded on `8419eefa4`).
6. G3 corpus integrity — **PASS** on both new corpora.

## Method note

- CANON.md read first; MONSTER-WAVES.md for the wave/fight context (wave-4 gate standing ≥ 100; wave-5 gate standing ≥ 200 AND wave-4 faced; "Monster encounters are fought, not rolled"). No canon doc covers seed attribution — the question was answered from measurement.
- Rebase: branch tip `ff8b9869f` was an ancestor of `8419eefa4`; rebase fast-forwarded, no conflicts. Base verified with `git log --oneline -1` = `8419eefa4` before any judged work.
- Flap: probe-gated every git write; probes passed throughout (prereg commit 11:49Z, this commit — no write was refused, no retry observed on corpus writes). Corpus writes went through the retry preload (`scripts/flap-retry-preload-20261109.js`, written via the flap-proof write path, never committed, deleted after use — same pattern as the bisect-b arm: unique temp + rename + read-back verify, 180 × 2s `Atomics.wait` retries).
- Safe-commit index clobber struck the prereg commit (file showed staged-deleted with the worktree copy intact) — repaired via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, hash-object matched the HEAD blob before repair, status clean + `git diff HEAD` empty after.
- Code identity: the L0 run used the worktree's `src/` directly; `src/js/game.js` hash `cd5416e93f28ef84dd6cb7af1c2fd7c349e38475` matches the `8419eefa4` blob (same hash the 0630Z arm recorded for `ba21ca026` — game.js unchanged between the two masters, consistent with the src diff being conversation/food/villager-agency only), and `git diff 8419eefa4 HEAD -- src/ scripts/` is empty (the prereg commit touched evidence only). The corpus `anchorCommit` reads the worktree tip (`100474349`), not `8419eefa4` — the known anchor quirk; the SHA under test is recorded here (`8419eefa4`).
- No midpoint was extracted and no scratch dir was created (the stop rule fired before any extraction work). No game-code change. `git diff HEAD -- src/` is empty.

## Metric review

- The primary metric is the per-leg headline, judged against the decision tree — and the tree held: the L0 headline (150d, survived, standing 199, 1 w4 kill) was reported as MIDDLE, a named unjudged outcome, never forced into MOVED even though five of six coarse fields match MOVED exactly. The ±5 standing tolerance was not invoked (all headline fields are exact point values).
- The stop rule's trigger deserves one note: the endpoint moved BACK toward MOVED on the coarse fields (150d, survived, 199, d90) while staying distinct on the kill link (1 vs 2 w4 kills, 2 vs 6 faced). A headline judge that only read survival + standing + seat day would have called this MOVED — the w4-kill and w4-faced fields are what keep the verdict honest. The kill link is the discriminating field now, not survival.
- The doorwalk baseline leg never walks a door and never wins by design; national/table/wins are reported as wall numbers, not judged.
- Classifier note carried forward: the VIOLENT map keys `'arena'` but the game emits `'the arena'` — the next prereg using this classifier should register `'the arena'` (and audit the other keys against actual cause strings) or the mechanism label undercounts violent deaths. The label is reported as the rule computes it, not as it "should" read. (On this leg the gap does not change the verdict: even counting the arena death as violent, 5/10 stays under the 60% combat-led bar.)
- One metric note carried from 53007-a/bisect-b: the `deathSays` filter catches "deadfall" (it contains "dead") — the first deathSays entries are deadfall-gathering lines, not deaths. A future instrument should filter `deadfall` out of the death regex. It did not affect any judgment here.

## Findings for the backlog

- Classifier gap (carried, still open): the 53007-a classifier's VIOLENT map keys `'arena'` but the game emits the cause string `'the arena'` — 1 arena death in this run sits in OTHER. Register `'the arena'` in the next classifier prereg (and audit the remaining keys against emitted cause strings); never silently bucket.
- The NEW→MIDDLE step's suspect set is the three journey commits in `ba21ca026`→`8419eefa4` (`b98ac0730` conversation secret-response, `e18f72dce` food specialist rung, `e3ef2b612` villager-agency place-line) — most plausible first bisect target is the food.js specialist rung (villagers kill more wave-3 monsters, 7 vs 4, and survive), but that is a hypothesis: a `e18f72dce^` vs `e18f72dce` before/after on 53007 would prove it.
- Sam's begging ×3 and the Thumbnails ×20 spam (bisect-b findings) do NOT recur on this trajectory either (Sam ×0, Thumbnails ×0) — trajectory-dependent, not fixed; keep both findings open.
- 53007 faces wave 4 only twice and kills once on current master (was 8 faced / 0 killed on NEW, 6 faced / 2 killed on MOVED) — the wave-4 kill link on the lead seed is now 1/2, better than NEW's 0/8 but thinner than MOVED's 2/6, and the village ends one veteran short of wave 5. The kill link remains the chain's binding number to watch, not just survival.
- Root-decay note (third strike): the 53007 attribution has now been blocked three times by endpoint movement (bisect-b, 0630Z, this arm) — each time a different headline. The lead seed's endpoint is not a stable instrument on a moving master; the next arm should re-verify on its own current master before attributing, and consider whether the attribution needs a frozen-band seed set rather than a single lead seed.

## Convergence state

scale-onramp stays **converging** (NOT converged): the 53007 attribution is BLOCKED a third time — the endpoint moved under it again, this time from death back to survival in a middle shape that shares MOVED's coarse fields but not its kill link. The next blanks, in order: (1) re-ask the fightblend attribution against the MIDDLE headline as the current-master endpoint (prereg shape: L0 re-verifies MIDDLE on the next current master; L1 pre must reproduce OLD and L2 fix must reproduce MOVED to finger fightblend for the OLD→MOVED step — the MIDDLE headline is the re-verification target, not the attribution target); (2) the `e18f72dce` food-rung before/after, if the NEW→MIDDLE mechanism wants proving; (3) the wave-4 kill link at 1/2 faced on the lead seed, with wave 5 held open by a single missing veteran, is a winnability-chain signal worth its own arm.

## Adoption handoff

1. **Verdict: ENDPOINT-MOVED-AGAIN — STOP (MIDDLE SHAPE).** The attribution did not run. Current-master 53007 (`8419eefa4`): 150d, survived, lesser d90, standing 199, maxWave 4, w4 1 (Congregation d82, companion), w4 faced 2 types, 10 fallen, mechanism mixed/other (classifier gap: `'the arena'` ×1 unmapped). The NEW headline (138d, village-lost, 100, 0 w4) is not reproduced; neither is MOVED (2 w4 kills, 6 faced, 9 fallen). Unrecorded control matches exactly (G2 PASS) — the movement is master movement.
2. **No pre/fix leg ran.** `93e7bea26` (pre) and `3f405ff78` (fix) are neither fingered nor cleared. The fightblend question stays open.
3. **Suspect set for the NEW→MIDDLE step:** the three journey commits in `ba21ca026`→`8419eefa4` — `b98ac0730` (conversation secret-response), `e18f72dce` (food specialist rung, most plausible — 7 w3 kills vs 4), `e3ef2b612` (villager-agency place-line). First daily divergence d17 (pantry only); first death identical (Luz d31 arena).
4. **Proof:** 32 passed, 0 failed, 4 skipped (L1/L2 legs). G1/G2/G3 all PASS on what ran.
5. **Findings backlog:** five items under § Findings for the backlog above (`'the arena'` classifier gap; `e18f72dce` before/after owed; Sam/Thumbnails non-recurrence is trajectory-dependent; wave-4 kill link 1/2 with wave 5 one veteran short; root-decay note — third blocked attribution).
6. Worktree `~/workspace/worktrees/sim-fightblend-attrib-b`, branch `sim-fightblend-attrib-b`. No game-code trace: prereg + proof + 1 armed corpus + 1 unrecorded control. The flap-retry preload was deleted after use (never committed). No scratch dir was created.
