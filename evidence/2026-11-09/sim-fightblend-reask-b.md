# sim-fightblend-reask-b — the endpoint moved a FOURTH time, into a fifth shape (DIAG, zero src/js)

**Arm:** sim-fightblend-reask-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261109T1739Z (Loop B) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-fightblend-reask-b, base master `0fcff01ea` (verified: worktree `git log --oneline -1` reads `0fcff01ea`; worktree tree clean, 0 untracked) · **Prereg:** `evidence/2026-11-09/sim-fightblend-reask-b-prereg.md` (committed `16d731e4a` BEFORE any judged computation) · **Instrument:** DIAG recorder (`scripts/recorder-53007-20261108.js`, unchanged) on the doorwalk baseline leg, 150d death-aware, seed 53007 only. Corpora committed under `evidence/2026-11-09/perseed-fightblend-reask-b/` (L0 armed + L0 unrecorded control). Proof `scripts/test-fightblend-reask-b.js` **60 passed, 0 failed, 4 skipped** — the 4 skips are the L1–L4 legs, never run per the stop rule.

## Verdict: DIAG-STOP (endpoint-moved-again) — a FIFTH SHAPE, single-seed attribution RETIRED

**The current-master endpoint headline moved a fourth time, so the attribution does not run.** The prereg's stop rule fires as written: "if L0 reads NEITHER MIDDLE nor NEW — or reads NEW — STOP." Seed 53007 on current master `0fcff01ea` survives 150 days again with 1 wave-4 kill and 10 fallen — the same counts as MIDDLE — but it is a different village: standing **184** (15 below MIDDLE's 199, outside the ±5 tolerance), **6** wave-4 faced types (was 2), **0** living veterans (was 1), living 8 (was 9), pantry 4,274 kcal (was 9,302), and **not one grave in common** with MIDDLE (first death Se-ri d17 to a Hushpuppy, where MIDDLE's first death was Luz d31 in the arena). The coarse survival shape looks like MIDDLE; the village underneath does not. Per the prereg it is reported as an unjudged **fifth shape** — never forced into MIDDLE, even though days, survival, seat day, w4 kills, and fallen count all match MIDDLE exactly. The four attribution legs (L1–L4, `b98ac0730` and `e3ef2b612`) were never extracted and never ran; no scratch dir was created. `b98ac0730` and `e3ef2b612` are neither fingered nor exonerated. The fightblend question stays open — and, by this arm's decision rule, it no longer gets re-asked on the single lead seed: **the single-seed attribution route is retired** (see § Frozen band, below).

**What still holds:** the village still sits a lesser seat (d90) and still reaches wave 4 with one kill. What moved is the village itself, again: the reshuffle now starts on **day 4** — the earliest divergence yet (MOVED→NEW was d10, NEW→MIDDLE was d17) — in the first week, before any death, any fight, any wave.

## The re-verification — old vs moved vs new vs middle vs L0

| | OLD (53007-a, `6680d7924`) | MOVED (bisect-b, `55b5e5aae`) | NEW (0630Z, `ba21ca026`) | MIDDLE (1030Z, `8419eefa4`) | L0 fifth shape (this arm, `0fcff01ea`) |
|---|---|---|---|---|---|
| Days / end | 150, survived | 150, survived | **138, village-lost** | 150, survived | **150, survived** |
| gameDays | 150 | 151 | 138 | 151 | **151** |
| Standing | 584 | 199 | **100** | **199** | **184** |
| maxWave / unlocked | 5 / 5 | 4 / 4 | 4 / 4 | 4 / 4 | 4 / 4 |
| Seat | lesser d95 | lesser d90 | lesser d92 | lesser d90 | **lesser d90** |
| Wave-4 kills (waveKillLog) | 5 | 2 | **0** | **1** (Congregation d82, companion) | **1** (Strike d89, player) |
| Wave-4 faced (types) | 5 | 6 | **8** | **2** (algorithm, congregation) | **6** (eater, eulogy, reunion, algorithm, herald, strike) |
| Fallen | 4 | 9 | **15** | **10** | **10** |
| Mechanism (corrected rule *) | sickness-first | combat-led | combat-led | mixed/other | **combat-led (8/10)** |
| Mechanism (frozen rule) | sickness-first | combat-led | mixed/other | mixed/other | **combat-led (7/10)** |
| Living at end | 8 | 9 | **2** | **9** | **8** |
| Pantry at end | 400 kcal (0.2 food-days) | 29,100 kcal (13 food-days) | **0 kcal (0 food-days)** | **9,302 kcal** | **4,274 kcal** |
| Wave-5 readiness | — | — | armor/weapons/veterans short | veterans 1/2 short | **veterans 0/2 short** |

\* Corrected rule: `'the arena'` registered VIOLENT in this arm's classifier (as e18f did); frozen rule is the analyzer as overlaid. L0 reads combat-led under both rules — and under a third reading that counts the monster-name cause as violent (9/10). The mechanism label is not a binding headline field (the rule changed by instruction); both labels are reported.

The unrecorded control reproduces the L0 headline exactly (150d, survived, 184, maxWave 4, lesser d90, w4 1) — G2 neutrality PASS, so the movement is master movement, not the recorder. The proof's headline legs PASS on the fifth shape (L0 armed and unrecorded both read OTHER; L0 differs from NEW on all six binding fields and from MIDDLE on standing, w4 faced, veterans, pantry, and living).

**Fallen, L0:** d17 Se-ri (Hushpuppy), d36 Rafael (monster, Gavel), d46 Luz (the wild), d46 Luke (the wild), d65 Klaus (the wild), d68 Stan (the arena), d74 Quinn (starvation), d88 Diego (the wild), d144 Omar (a stranger), d151 Riley (contest).

Not one of these ten graves matches a MIDDLE grave in day, name, and cause together — the same twelve people start, and by day 17 the village is already a different village. The kill side tells the same story in reverse: this village kills **5 wave-3 monsters** (focus_group d31, buffering d38, chorus_line d38, chorus_line d39, terms_of_service d40) — between NEW's 4 and MIDDLE's 7 — and its one wave-4 kill comes from the scholar himself (Omar puts down the Strike on day 89, via player), where MIDDLE's came via a companion. The pellet is never held on any row of this road (0 rows; the NEW road held it d66–d138) — a third distinct pellet pattern for this seed.

**First divergence.** The daily rows hold byte-identical (living, pantry, sick, wounded, hungry) through d2 — the d2 rows are byte-identical to MIDDLE's — then diverge on **d4** (pantry 27,550 → 28,500 on MIDDLE's side; sick 0 vs 1, Katarina with a bad belly on MIDDLE; wounded 1 vs 2; ladderCounted 10 vs 11). The reshuffle starts in the first week, in the daily living state, with no wave-4 fight anywhere near it: the first death is still two weeks away (d17), the first wave-3 kill four weeks away (d31). The d4 divergence is a sickness-and-pantry wobble, not a fight judgment.

## What moved it (suspect SET, NOT proven)

Only **four src commits** sit between `8419eefa4` (MIDDLE) and `0fcff01ea` (this arm), across 4 files, no `src/data/` change: the truth.js coach prior-deflect no-repeat fix (`5e190b6ef`, journey-social-life r163, +17/−1), the game.js medic-duty widening to trained villagers (`48c93b22b`, sim-wideduty-a, +66/−20), the convo-wants.js curious first-reveal guard (`ae7daf40c`, journey-landing r121, +16), and the progression.js feast-tooltip-once-per-keepsake fix (`1cc46630c`, journey-endgame r162, +21/−2). The mover of the MIDDLE→FIFTH step is one (or a combination) of those four — this arm does NOT finger one without a bisect, and the prereg's STOP rule means no bisect runs here. The most mechanistically plausible candidates are the **medic-duty widening** (it changes who tends and cures the sick — and the divergence opens with a sickness difference on d4, Katarina ill on MIDDLE and healthy here) and the **coach prior-deflect fix** (a conversation-branch change, the same class as the fingered dedupe `f496b0072`) — but both are hypotheses, not findings. Proving it needs a before/after on the frozen band, which is a different arm.

The fightblend question is untouched by this move: fightblend landed before `55b5e5aae`, and the MIDDLE→FIFTH step is fully explained in range by the four journey/sim commits alone. The OLD→MOVED step — the one fightblend could have caused — is still unattributed, and it now waits on the frozen band.

## Village assessment — what the village looked like

Haven starts with twelve people and the same names as always, and this time the village starts dying in the second week: Se-ri is killed by a Hushpuppy on day 17 — the first grave, dug while the village is still learning the place can kill you — and Rafael falls to a Gavel on day 36. The wild takes Luz and Luke together on day 46, Klaus on day 65, Diego on day 88. Stan dies in the arena on day 68, Quinn starves on day 74. But the village kills back: Omar puts down the Focus Group on day 31, on camera — "That's a veteran kill, folks. REMEMBER the name." — and then, on day 89, Omar himself kills the Strike, a wave-4 monster, in the field. The table is set on day 90 and the Audit names the lesser seat the same day, reading back 6 wave-4 fought, 6 contests survived, 3 crises weathered. After that the village steadies: only Omar himself dies, to a stranger on day 144, and Riley falls in a contest on the last day, day 151. Eight people are alive at the end with 4,274 kcal in the pantry — thinner than MIDDLE's nine with 9,302, but alive. At the end the wave-5 readiness bars read armored 7/4, armed 8/6, tricks 31/3, veterans 0/2 — every bar met except veterans, and there are zero living veterans to meet it with. The door to wave 5 stays shut on an empty veterans bar.

**Sense-test.** The mourning beats cohere and the names rotate correctly; the table-set (d90) → Audit (d90) sequence reads as cause and consequence, and the Audit's "6 wave-4 fought" agrees with `finalSeat.detail.w4` (6) on this leg — the faced-accounting gap from the NEW leg (Audit 7 vs finalSeat 8) does NOT recur here. The d88 grief-card beat reads as cause and consequence too (Stonebridge and Ashford both install speakers and reach for the spent grief card; tribute stays at 9,000 kcal/week). Two bisect-b findings split on this trajectory: Sam of The Red Table begs zero times (still absent — trajectory-dependent, not fixed), but the "Thumbnails" trailer lines recur ×17 in the captured transcript (bisect-b saw ×20; fightblend/dedupe/e18f saw ×0) — trajectory-dependent, not fixed. One new texture: the d17 double death line — "Hushpuppy is dead. You didn't ask. It knew." immediately followed by "Se-ri Bong is dead." — the Codex announcing the killer's death and the victim's in the same breath, which reads correctly as the kill being recorded, not as a bug.

## Wall numbers (this run — one seed, doorwalk baseline leg)

- National 0/1, table sits 1/1 (lesser only), wins 0/1 (baseline leg never walks a door).
- Wave-4 unlocks 1/1, wave-5 unlocks 0/1 (veterans bar empty, 0/2).
- Survival 150d (n=1); max 150d; min 150d.
- Wave-4 kill link: 1 kill / 6 faced types on the lead seed (was 1/2 on MIDDLE, 0/8 on NEW, 2/6 on MOVED).
- Telemetry deviation check: not run — DIAG re-verification, no lever before/after; the per-leg headline reproduction is the validity check.
- Balanced panel (§15): not run — DIAG recorder corpus, same standing as 53007-a/bisect-b; `balance-panel.js` refuses recorder corpora by design (recorded, not forced).

## Proof

`node scripts/test-fightblend-reask-b.js` — **60 passed, 0 failed, 4 skipped** (run after the corpora were committed-present):

- G1 det-gate — PASS on fixtures + committed corpora (P1 sickness-first, collapsed mixed/other, attrition/combat/night-only fixtures, `'the arena'` registration legs, the `'Hushpuppy'` monster-name-cause fixture legs — label combat-led under the frozen rule (7/10), the corrected rule (8/10), and counting the monster-name death as violent (9/10); headline predicate synthetics for old/moved/new/middle/endpoint + the ±5 standing boundary at 193/194 (middle), 184 (the L0 case, reads other), and 105/106 (new); firstDivergence synthetics — d10 and d4 found, null on identical rows; rowsEqualOnDays synthetics; committed endpoint/53007-a/bisect-b/fightblend-b/fightblend-attrib-b corpora read endpoint/old/moved/new/middle respectively; MIDDLE-vs-NEW first divergence reproduces d17 through the helper).
- G2 neutrality — PASS on the L0 pair (armed == unrecorded, same master `0fcff01ea`, all headline fields + fallen + waveKillLog identical; `neutralityCompare` ok, 0 diffs) and on synthetic pairs (stripDiag neutral; one-life drift fails).
- G3 integrity — PASS on both new corpora (armed: 148 rows d2..d151, diag on all rows, gaps d2→d4 and d21→d23 enumerated, 0 instrument errors, 0 living notes; unrecorded: same rows sans diag, 0 errors).
- The endpoint-moved-again signal is a PASSING leg, not a failure: L0 reads OTHER and differs from NEW on all six binding fields and from MIDDLE on standing (Δ15), w4 faced (6 vs 2), veterans (0 vs 1), pantry, and living — the proof verifies the new headline is real and reproducible, and the evidence file carries the verdict.
- The 4 SKIPped legs are the L1–L4 legs (pre-secret, secret, pre-place, place) — never run, per the stop rule.

## GO bars (binding)

1. L0 current-master re-verification reproduces the MIDDLE headline — **FAILED: endpoint moved again** (150d survived, standing 184, seatDay 90, 1 w4 kill, 6 faced, 0 veterans — a fifth shape, neither MIDDLE nor NEW). STOP fires; the run ends here.
2. Each judged leg produces a full daily corpus with an end snapshot — **MET for L0** (armed + unrecorded); L1–L4 not run (stop rule).
3. Leg headlines judged against the decision tree — **FIFTH SHAPE recorded**, neither OLD, MOVED, NEW, nor MIDDLE; no shape forced.
4. G1 det-gate — **PASS** (proof 60/0/4).
5. G2 recorder neutrality — **PASS** on the L0 pair (armed == unrecorded on `0fcff01ea`).
6. G3 corpus integrity — **PASS** on both new corpora.

## Frozen band (the single-seed route is retired)

Seed 53007's endpoint has now moved on **four consecutive current-master re-verifications** (OLD→MOVED→NEW→MIDDLE→FIFTH), each time a different headline. A fifth re-ask on the same seed is not an instrument. The replacement instrument is a frozen 8-seed band, pre-registered in this arm's prereg (not invented after the outcome):

- **Band: 53011–53018** (8 seeds). Why these: 8 seeds is the pilot-gate size (§9); they sit adjacent to the 53001–53008 doorwalk family, so the same driver/policy/substrate applies unchanged; and they are verified unused (see freshness check below).
- **Freshness check (done before the prereg, per `~/workspace/custom-skills/local_seed_band_freshness/SKILL.md`):** searched all 677 files matching `evidence/*/sim-*-prereg.md`, all `evidence/**/*.md`, `scripts/*.js`, and per-seed corpus filenames for `53011`–`53018` — zero hits. Collisions found and avoided: `53101–53108` (used by a leadfeast arm — s53104/s53106/s53107 in evidence), `53201–53212` (doorwalk confirm band, named in `evidence/2026-11-07/sim-doorwalk-b-prereg.md` and `evidence/2026-11-07/sim-combatdiv-b.md`), `53701–53712` (named alongside 53201–53212 in the reservation context). No forbidden-band list file was found in `evidence/`; the prereg + evidence-md + scripts + corpus-filename search is the recorded scope.
- **What the next run measures:** each seed's current-master endpoint on the doorwalk baseline leg (150d death-aware, same driver/recorder), recorded per seed as the frozen reference (days, end, standing, seatDay, w4 kills, fallen). The freeze master is whatever master that run re-verifies on, stated in its prereg.
- **Proposed band rule (the next run's prereg binds the final rule):** a commit fingers only if it moves the endpoint the same direction on a majority of the band with no seed moving the opposite direction; a single-seed move is a trajectory note, never a finger. The band is re-frozen (endpoints re-measured) whenever master moves under it, never assumed stable.
- **What the band is for, first:** the fightblend OLD→MOVED attribution, re-asked against the band (L1 pre must reproduce the band's OLD-side reference and L2 fix the MOVED-side reference, per seed); and the NEW→MIDDLE step, whose single-commit suspects (`b98ac0730`, `e3ef2b612`) this arm never got to test.

## Method note

- CANON.md read first; MONSTER-WAVES.md for the wave/fight context (wave-4 gate standing ≥ 100; wave-5 gate standing ≥ 200 AND wave-4 faced; "Monster encounters are fought, not rolled"). No canon doc covers seed attribution — the question was answered from measurement.
- Base verified with `git log --oneline -1` = `0fcff01ea` before any judged work. Range verification (before the prereg): `8419eefa4`→`0fcff01ea` is 41 commits, 4 src commits, 4 files, no `src/data/` change; instrument drift over the frozen set is zero. Suspect-range ancestry verified from git: `b98ac0730` src == `8419eefa4` src (empty diff); `b98ac0730^` src == `e18f72dce` src (empty diff); `e3ef2b612^` src == `ba21ca026` src (empty diff); `e3ef2b612` src == `ba21ca026` + villager-agency.js only.
- Flap: probe-gated every git write; probes passed throughout (prereg commit ~17:5xZ; no write was refused, no retry observed on corpus writes). No flap-retry preload was needed (no write was refused).
- Safe-commit index clobber struck the prereg commit (file showed staged-deleted with the worktree copy intact) — repaired via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, hash-object matched the HEAD blob before repair, status clean + `git diff HEAD` empty after.
- Code identity: the L0 run used the worktree's `src/` directly at `0fcff01ea`; `git diff HEAD -- src/` is empty (no game-code change). The corpus `anchorCommit` reads the worktree tip (the prereg commit `16d731e4a`), not `0fcff01ea` — the known anchor quirk; the SHA under test is recorded here (`0fcff01ea`).
- No midpoint was extracted and no scratch dir was created (the stop rule fired before any extraction work). No game-code change. `git diff HEAD -- src/` is empty.

## Metric review

- The primary metric is the per-leg headline, judged against the decision tree — and the tree held: the L0 headline (150d, survived, standing 184, 1 w4 kill) was reported as a fifth shape, a named unjudged outcome, never forced into MIDDLE even though five of six coarse fields match MIDDLE exactly. The ±5 standing tolerance was not invoked (184 is 15 below 199 — a clean miss, not a tolerance case).
- The stop rule's trigger deserves one note: this is the first move where the kill-link counts did NOT discriminate — L0 matches MIDDLE on days, survival, seat day, w4 kills, and fallen count, and differs only on standing (Δ15), w4 faced (6 vs 2), veterans (0 vs 1), pantry, and living. A headline judge that read only survival + kills + fallen count would have called this MIDDLE. Standing is the discriminating field this time, and the fallen list — not one grave in common — is what confirms the villages are different underneath the matching counts. Counts matching is not identity.
- The first-divergence check moved earlier again: d4, the earliest yet (d10, then d17, now d4). The divergence opens with a sickness difference (Katarina ill on MIDDLE, healthy here) plus a pantry wobble — before any death or fight. A first-divergence match is mechanism evidence, not attribution (e18f's lesson stands); a d4 divergence only says the reshuffle starts in the first week.
- The doorwalk baseline leg never walks a door and never wins by design; national/table/wins are reported as wall numbers, not judged.
- Classifier note (this arm's change, carried forward): `'the arena'` is registered VIOLENT in this arm's classifier — L0 reads combat-led (8/10) under the corrected rule and combat-led (7/10) under the frozen rule. New gap, named not bucketed: the game emits a monster's NAME as the death cause (`'Hushpuppy'`, monsterId hushwolf) — neither map keys it, so it sits in OTHER. The label is robust here (9/10 even counting it violent), so the gap does not change any verdict; a future arm should register monster-name causes (or map cause→monsterId) in the shared analyzer with a proof refresh. The frozen analyzer is unchanged.
- G3 note (new): this is the first corpus in the 53007 chain with a second daily gap — d21→d23, a skipped day-change snapshot on d22, in addition to the standard d2→d4 gap. Gaps are enumerated, not failed; the missing day is a coverage note, not a verdict item.
- Wave-4 faced accounting note (carried, narrowed): on this leg the d90 Audit narration ("6 wave-4 fought") AGREES with `finalSeat.detail.w4` (6) — the NEW leg's disagreement (Audit 7 vs finalSeat 8) does not recur. The gap is trajectory-dependent.
- Ladder/scaleRank note (carried, not new): the finalSeat ladder line reads "National Standing reached" while `scaleRank` reads 'regional' — on BOTH L0 and MIDDLE. A standing-accounting question, not a verdict item.
- One metric note carried from 53007-a/bisect-b/fightblend-b/dedupe-b/e18f-b: the `deathSays` filter catches "deadfall" (it contains "dead") — the first deathSays entries are deadfall-gathering lines, not deaths. A future instrument should filter `deadfall` out of the death regex. It did not affect any judgment here.

## Findings for the backlog

- **DIAG-STOP (endpoint-moved-again) — single-seed attribution RETIRED.** Seed 53007's endpoint moved a fourth time (fifth shape: 150d survived, standing 184, seatDay 90, 1 w4 kill, 6 faced, 0 veterans, pantry 4,274). The frozen-band replacement is 53011–53018 (freshness-checked in the prereg); the next run freezes each seed's current-master endpoint on the doorwalk baseline leg and re-asks the fightblend attribution against the band.
- **`b98ac0730` and `e3ef2b612` still untested as single movers** — the STOP fired before their legs ran, so neither is fingered nor exonerated. The NEW→MIDDLE question stays open and now waits on the frozen band, not the lead seed.
- **Suspect set for the MIDDLE→FIFTH step** (hypothesis, not proven): the four src commits in `8419eefa4`→`0fcff01ea` — `5e190b6ef` truth.js coach prior-deflect no-repeat, `48c93b22b` game.js medic-duty widen to trained villagers, `ae7daf40c` convo-wants.js curious first-reveal guard, `1cc46630c` progression.js feast-tooltip-once-per-keepsake. Most plausible: medic-duty widen (the divergence opens with a d4 sickness difference) and coach prior-deflect (conversation-branch class, same as the fingered dedupe). A before/after on the frozen band would prove it.
- **Classifier gap (new): monster-name causes.** The game emits the monster's name as the death cause (`'Hushpuppy'`, monsterId hushwolf, d17) — neither VIOLENT map keys it, so it sits in OTHER. Label robust here (combat-led under frozen 7/10, corrected 8/10, and 9/10 counting it violent). A future arm should register monster-name causes (or map cause→monsterId) in the shared analyzer with a proof refresh; never silently bucket.
- **Classifier gap (carried, still open in the frozen analyzer):** `'the arena'` registered VIOLENT in this arm's classifier (as e18f did); the frozen analyzer still keys `'arena'`.
- **Thumbnails ×17 recurs on this trajectory** (bisect-b ×20; absent on fightblend/dedupe/e18f roads) — trajectory-dependent, not fixed; keep the finding open.
- **Sam's begging ×0 again** — trajectory-dependent, not fixed; keep the finding open.
- **Audit-vs-finalSeat w4 agreement on this leg (6=6)** vs disagreement on NEW (7 vs 8) — the faced-accounting gap is trajectory-dependent; keep open.
- **Ladder/scaleRank disagreement (carried, not new):** ladder reads "National Standing reached" while `scaleRank` reads 'regional' on both L0 and MIDDLE. Standing-accounting question for a future instrument arm.
- **G3 gap note (new):** first 53007 corpus with a second daily gap (d21→d23, d22 snapshot skipped) beyond the standard d2→d4. Enumerated, not failed.
- **Pellet never held on this road** (0 rows; NEW road held d66–d138) — third distinct pellet pattern for this seed; trajectory-dependent pellet presence, not a lever.
- **Wave-4 kill link on the lead seed's current trajectory: 1/6 faced, veterans 0/2** (was 1/2 MIDDLE, 0/8 NEW, 2/6 MOVED) — wave 5 held open by zero living veterans. The kill link remains the chain's binding number to watch, not just survival.
- **Root-decay note (fifth strike):** the 53007 attribution has now been blocked four times by endpoint movement (bisect-b, 0630Z, 1030Z, this arm) — each time a different headline, and this time the counts matched MIDDLE while the village underneath did not. The lead seed is retired as an attribution instrument; the band is the instrument now.

## Convergence state

scale-onramp stays **converging** (NOT converged): the 53007 attribution is BLOCKED a fourth time — the endpoint moved under it again, this time into a fifth shape that shares MIDDLE's coarse counts but not its standing, its faced types, its veterans, or a single grave. The single-seed route is retired by this arm's decision rule, and the frozen band 53011–53018 is specified for the next run. The next blanks, in order: (1) freeze the 53011–53018 band's current-master endpoints and re-ask the fightblend attribution against the band; (2) the `b98ac0730` / `e3ef2b612` single-commit before/afters, re-asked on the band once it is frozen; (3) the wave-4 kill link at 1/6 faced on the lead seed, with wave 5 held open by zero living veterans, is a winnability-chain signal worth its own arm.

## Adoption handoff

1. **Verdict: DIAG-STOP (endpoint-moved-again) — FIFTH SHAPE.** The attribution did not run. Current-master 53007 (`0fcff01ea`): 150d, survived, lesser d90, standing 184, maxWave 4, w4 1 (Strike d89, by Omar via player), w4 faced 6 types, 10 fallen, mechanism combat-led (7/10 frozen, 8/10 corrected), living 8, pantry 4,274 kcal, veterans 0/2. MIDDLE (150d, 199, 1 w4, 2 faced, 10 fallen) is not reproduced; neither is NEW. Unrecorded control matches exactly (G2 PASS) — the movement is master movement.
2. **First divergence d4** (pantry 27,550 vs 28,500, sick 0 vs 1, wounded 1 vs 2) — earliest yet; d2 rows byte-identical to MIDDLE. No grave in common with MIDDLE.
3. **No pre/secret/place leg ran.** `b98ac0730` (conversation secret-response) and `e3ef2b612` (villager-agency place-line) are neither fingered nor cleared. The fightblend question stays open.
4. **Suspect set for the MIDDLE→FIFTH step:** the four src commits in `8419eefa4`→`0fcff01ea` — `5e190b6ef` (truth.js coach deflect), `48c93b22b` (game.js medic-duty widen, most plausible alongside the coach fix), `ae7daf40c` (convo-wants.js first-reveal guard), `1cc46630c` (progression.js feast tooltip). Hypothesis only.
5. **Single-seed attribution RETIRED; frozen band 53011–53018 specified** (freshness-checked: zero hits across 677 preregs + all evidence .md + scripts + corpus filenames; 53101–53108, 53201–53212, 53701–53712 avoided as used). Next run freezes the band's current-master endpoints and re-asks fightblend against the band.
6. **Proof:** 60 passed, 0 failed, 4 skipped (L1–L4 legs). G1/G2/G3 all PASS on what ran. Standing tolerance never invoked (184 is 15 below 199 — a clean miss).
7. **Findings backlog:** twelve items under § Findings for the backlog above (DIAG-STOP + retirement; b98f/e3ef untested; MIDDLE→FIFTH suspect set; monster-name-cause classifier gap; 'the arena' gap carried; Thumbnails ×17 recurs; Sam ×0; Audit/finalSeat agreement; ladder/scaleRank; d22 gap; pellet never held; wave-4 kill link 1/6 with veterans 0/2; root-decay note, fifth strike).
8. Worktree `~/workspace/worktrees/sim-fightblend-reask-b`, branch `sim-fightblend-reask-b`. No game-code trace: prereg + proof + 2 corpora (L0 armed, L0 unrecorded) + this evidence. No scratch dir was created; no flap-retry preload was needed. No midpoint was extracted.
