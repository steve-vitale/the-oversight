# sim-fightblend-53007-b — the endpoint moved AGAIN (DIAG, zero src/js)

**Arm:** sim-fightblend-53007-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261109T0630Z (Loop B) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-fightblend-53007-b, base master `ba21ca026` (current master at spawn) · **Prereg:** `evidence/2026-11-09/sim-fightblend-53007-b-prereg.md` (committed `91f749b16` BEFORE any judged computation) · **Instrument:** DIAG recorder (`scripts/recorder-53007-20261108.js`, unchanged) on the doorwalk baseline leg, 150d death-aware, seed 53007 only. Corpora committed under `evidence/2026-11-09/perseed-fightblend-53007-b/` (armed L0 + unrecorded control). Proof `scripts/test-fightblend-53007-b.js` **29 passed, 0 failed, 4 skipped** — the 4 skips are the L1/L2 legs, never run per the stop rule.

## Verdict: ENDPOINT-MOVED-AGAIN — STOP, no attribution

**The current-master endpoint headline moved again, so the attribution does not run.** The prereg's stop rule fires as written: "if L0 does NOT reproduce the MOVED headline, STOP and report endpoint-moved-again; do not attribute." Seed 53007 on current master `ba21ca026` no longer survives 150 days at all — it **dies at 138d, village-lost, standing 100, 0 wave-4 kills, maxWave 4, seat taken d92**. The headline the attribution was to judge against — the bisect-b village (150d, lesser d90, standing 199, 2 w4 kills) — no longer exists, and neither does the 53007-a village it moved from. The pre leg (`93e7bea26`) and fix leg (`3f405ff78`) were never extracted and never ran; no scratch dir was created. Fightblend is neither fingered nor exonerated. The fightblend question stays open until a stable current-master 53007 headline exists to attribute against — this arm supplies that headline (the NEW shape below), so the next arm re-asks the same question against it.

**What still holds:** the village still sits a lesser seat (d92) and still reaches wave 4 (faces 8 wave-4 monsters). What moved is the ending itself: the village that survived 150 days on both earlier masters now dies at 138 days with 2 people still living and an empty pantry — the hunger-scattering shape, the same terminal-event family as the healed endpoint's death.

## The re-verification — old vs moved vs new headline

| | OLD (53007-a, `6680d7924`) | MOVED (bisect-b, `55b5e5aae`) | NEW (this arm, `ba21ca026`) |
|---|---|---|---|
| Days / end | 150, survived | 150, survived | **138, village-lost** |
| gameDays | 150 | 151 | 138 |
| Standing | 584 | 199 | **100** |
| maxWave / unlocked | 5 / 5 | 4 / 4 | 4 / 4 |
| Seat | lesser d95 | lesser d90 | lesser d92 |
| Wave-4 kills (waveKillLog) | 5 | 2 | **0** |
| Wave-4 faced (finalSeat w4) | 5 | 6 | **8** |
| Fallen | 4 | 9 | **15** |
| Mechanism (analyzer rule) | sickness-first | combat-led | **mixed/other** * |
| Living at end | 8 | 9 | **2** |
| Pantry at end | 400 kcal (0.2 food-days) | 29,100 kcal (13 food-days) | **0 kcal (0 food-days)** |

\* Mechanical class is mixed/other because the classifier's VIOLENT map has no `'the arena'` key (see § Classifier gap): violent counts 7/15 by the map (monster 1, contest 1, wild 3, stranger 2); the 3 arena deaths sit in OTHER. If `'the arena'` counted as violent, the mix would read 10/15 = 67% combat-led. The evidence reports the mechanical label and names the gap; it does not re-score.

The unrecorded control reproduces the new headline exactly (138d, village-lost, 100, maxWave 4, lesser d92, w4 0, 15 fallen) — G2 neutrality PASS, so the movement is master movement, not the recorder. The proof's headline legs PASS on the new shape (L0 armed and unrecorded both read NEW; L0 differs from MOVED on all five discriminating fields).

**Fallen, new:** d31 Luz (the arena), d40 Rafael (monster, Spool), d40 Se-ri (sickness), d44 Stan (sickness), d52 Riley (sickness), d56 Diego (sickness), d61 Luke (contest), d62 Klaus (the wild), d62 Elena (a stranger), d63 Katarina (sickness), d67 Boris (the wild), d76 Omar (the wild), d98 Hannah (the arena), d125 Eleazar (a stranger), d130 Wanjiru (the arena).

The village loses its scholar first (Luz, d31, in the arena — the starting scholar `gen_u769uqn`, who died d39 in the wild on the old master and d57 in the wild on the moved master), then Rafael to a Spool on d40, then a sickness cluster (Se-ri, Stan, Riley, Diego, Katarina — 5 of 15), then the wild and the arena and strangers pick off the rest. The last week is a slow emptying: living 1–2 from d132, pantry 0 from d133, hungry 3, wave 4 throughout, seat lesser — two people left at d138 when the village is lost with food at zero. No scattering line was captured by the driver's death/table regexes, so the terminal trigger is reported by its shape (village-lost with living people + empty pantry), the same trigger family 53007-a established for the healed endpoint — not by a quoted line.

**First divergence.** The daily rows hold byte-identical (living, pantry, sick, wounded, hungry) through d9 against the 53007-a corpus, then diverge on **d10** (pantry 7,807 → 7,982; wounded 5 → 4; hungry 1 → 2). The reshuffle starts in the first ten days — a small divergence that compounds into a different village by d31. That early divergence is the fingerprint of a conversation-branch change (see § What moved it), not of a fight-judgment change: no wave-4 fight exists that early, and the first deaths don't arrive until d31.

## What moved it (suspect, NOT proven)

Only **one** src change sits between `55b5e5aae` (bisect-b) and `ba21ca026` (this arm): the conversation.js foreign-phrase dedupe (`f496b0072`, +20/−2, journey crisis r156). No driver-chain file changed in the same range; no `src/data/` change. The dedupe fix is pure string normalization (no RNG draws added or removed — `normPick`/`norm` are pure functions), but it un-blocks foreign-phrase lines that previously returned null forever after one said phrase ("They answer at length." repeated 12× in 3 no-words sittings). Conversations that previously dead-ended now take branches — different choices, different outcomes downstream — and the seeded stream diverges from the first affected conversation onward. That is a plausible mechanism for a d10 divergence from a conversation-only change, and it is the only candidate in the range. It is NOT proven: proving it would need a before/after on `f496b0072` itself (run 53007 at `f496b0072^` vs `f496b0072`), which is a different arm.

The fightblend question is untouched by this move: fightblend landed before `55b5e5aae`, and the MOVED→NEW step is fully explained in range by the conversation change alone. The OLD→MOVED step — the one fightblend could have caused — is still unattributed.

## Village assessment — what the village looked like

Haven starts with twelve people and the same names as always, but this time the first grave is different: not Rafael sick on day 16, but the scholar Luz dead in the arena on day 31, and Rafael killed by a Spool on day 40 — the village's first month is fights and contests, not sickness. The sickness still comes (five dead of it between day 40 and 63), but it is one pressure among several: the arena takes three, strangers take two, the wild takes three. The village still earns its seat — the table is set on day 90, the Audit comes on day 92 and names the lesser seat — and then it keeps dying anyway: Hannah in the arena on day 98, Eleazar to a stranger on day 125, Wanjiru in the arena on day 130, each with the full mourning beat (the village stops, somebody screams, somebody else starts digging, keepsakes buried). By day 132 there is one person left, then two — a joiner, or a return — and the pantry has been at zero for days. The village ends at day 138 with two people still alive and nothing left to eat: not wiped out, walked away from. It faced wave 4 eight times and killed none of them — the door stood open and the village never walked through it as a killer, only as prey.

**Sense-test.** The mourning beats cohere and the names rotate correctly; the table-set (d90) → Audit (d92) sequence reads as cause and consequence. Two bisect-b findings do NOT recur here: Sam of The Red Table begs only once (d63, single line — no verbatim ×3 repeat) and there are zero "Thumbnails" trailer lines in the captured transcript. Both absences are trajectory artifacts (a different village, different days), not fixes — neither is claimed as one.

## Wall numbers (this run — one seed, doorwalk baseline leg)

- National 0/1, table sits 1/1 (lesser only), wins 0/1 (baseline leg never walks a door).
- Wave-4 unlocks 1/1, wave-5 unlocks 0/1.
- Survival 138d (n=1); max 138d; min 138d.
- Telemetry deviation check: not run — DIAG re-verification, no lever before/after; the per-leg headline reproduction is the validity check.
- Balanced panel (§15): not run — DIAG recorder corpus, same standing as 53007-a/bisect-b; `balance-panel.js` refuses recorder corpora by design (recorded, not forced).

## Proof

`node scripts/test-fightblend-53007-b.js` — **29 passed, 0 failed, 4 skipped** (run after the corpora were committed-present):

- G1 det-gate — PASS on fixtures + committed corpora (P1 sickness-first, healed sickness-first, collapsed mixed/other, broken-classifier sensitivity, attrition/combat fixtures, night-only mixed/other; headline predicate synthetics for old/moved/new/endpoint + the ±5 standing boundary at 193; committed endpoint/53007-a/bisect-b corpora read endpoint/old/moved respectively).
- G2 neutrality — PASS on the L0 pair (armed == unrecorded, same master `ba21ca026`, all headline fields + fallen + waveKillLog identical).
- G3 integrity — PASS on both new corpora (armed: 137 rows d2..d138, diag on all rows, gap d2→d4 only, 0 instrument errors; unrecorded: same rows sans diag, 0 errors).
- The endpoint-moved-again signal is a PASSING leg, not a failure: L0 reads NEW and differs from MOVED on days, end, standing, seatDay, and w4 kills — the proof verifies the new headline is real and reproducible, and the evidence file carries the verdict.
- The 4 SKIPped legs are the L1/L2 legs (pre/fix corpora + headlines) — never run, per the stop rule.
- Two proof legs were corrected during authoring (both my test bugs, neither a data problem): the `'the arena'` fixture first used 3 deaths that hit the 60% violent bar via the other two causes (now 4 deaths, 2/4 violent, mixed/other); the standing-boundary synthetic first used 194, which is inside the ±5 tolerance of 199 (now 193, outside it). Both fixes are in the committed proof; the re-run is 29/0/4.

## GO bars (binding)

1. L0 current-master re-verification reproduces the MOVED headline — **FAILED: endpoint moved again** (138d village-lost, standing 100, seatDay 92, 0 w4 kills). STOP fires; the run ends here.
2. Each judged leg produces a full daily corpus with an end snapshot — **MET for L0** (armed + unrecorded); L1/L2 not run (stop rule).
3. Leg headlines judged against the decision tree — **NEW headline recorded**, neither OLD nor MOVED; no middle shape forced (NEW is a named third headline with exact fields).
4. G1 det-gate — **PASS** (proof 29/0/4).
5. G2 recorder neutrality — **PASS** on the L0 pair (armed == unrecorded on `ba21ca026`).
6. G3 corpus integrity — **PASS** on both new corpora.

## Method note

- CANON.md read first; MONSTER-WAVES.md for the wave/fight context (wave-4 gate standing ≥ 100; wave-5 gate standing ≥ 200 AND wave-4 faced; "Monster encounters are fought, not rolled"). No canon doc covers seed attribution — the question was answered from measurement.
- Flap: probe-gated every git write; probes passed throughout (prereg commit 07:00Z, this commit — no write was refused, no retry observed on corpus writes). Corpus writes went through the retry preload (`scripts/flap-retry-preload-20261109.js`, written via the flap-proof write path, never committed, deleted after use — same pattern as the bisect-b arm: unique temp + rename + read-back verify, 180 × 2s `Atomics.wait` retries).
- Safe-commit index clobber struck the prereg commit (file showed staged-deleted with the worktree copy intact) — repaired via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, hash-object matched the HEAD blob before repair, status clean + `git diff HEAD` empty after.
- Code identity: the L0 run used the worktree's `src/` directly; `src/js/game.js` hash `cd5416e93f28ef84dd6cb7af1c2fd7c349e38475` matches the `ba21ca026` blob, and `git diff ba21ca026 HEAD -- src/` is empty (the prereg commit touched evidence only). The corpus `anchorCommit` reads the worktree tip (`91f749b16`), not `ba21ca026` — the known anchor quirk; the SHA under test is recorded here (`ba21ca026`).
- No midpoint was extracted and no scratch dir was created (the stop rule fired before any extraction work). No game-code change. `git diff HEAD -- src/` is empty.

## Metric review

- The primary metric is the per-leg headline, judged against the decision tree — and the tree held: the L0 headline (138d, village-lost, standing 100, 0 w4 kills) was reported as NEW, a named third headline, never forced into MOVED. The ±5 standing tolerance was not invoked (all headline fields are exact point values).
- The stop rule's trigger deserves one note: the survival itself no longer holds — this is a bigger move than bisect-b's (a shape change within survival); the village now dies. The attribution question (OLD→MOVED) is unchanged by it, but the next arm must re-verify the NEW headline on its own current master before attributing — roots decay with every src change, and this run proves the decay can be a death, not just a reshuffle.
- The doorwalk baseline leg never walks a door and never wins by design; national/table/wins are reported as wall numbers, not judged.
- Classifier note carried forward: the VIOLENT map keys `'arena'` but the game emits `'the arena'` — the next prereg using this classifier should register `'the arena'` (and audit the other keys against actual cause strings) or the mechanism label undercounts violent deaths. The label is reported as the rule computes it, not as it "should" read.
- One metric note carried from 53007-a/bisect-b: the `deathSays` filter catches "deadfall" (it contains "dead") — the first deathSays entries are deadfall-gathering lines, not deaths. A future instrument should filter `deadfall` out of the death regex. It did not affect any judgment here.

## Findings for the backlog

- Classifier gap (new): the 53007-a classifier's VIOLENT map keys `'arena'` but the game emits the cause string `'the arena'` — 3 arena deaths in this run sit in OTHER and the mechanism reads mixed/other where the cause mix (10/15 violent) reads combat-led. Register `'the arena'` in the next classifier prereg (and audit the remaining keys against emitted cause strings); never silently bucket.
- The conversation.js foreign-phrase dedupe (`f496b0072`) is the sole src change in `55b5e5aae`→`ba21ca026` and the only in-range candidate for the MOVED→NEW step — a conversation-only change that reshuffles a seeded trajectory from d10. Worth a named before/after arm if Steve wants the mechanism proven rather than suspected (run 53007 at `f496b0072^` vs `f496b0072`).
- Sam's begging ×3 and the Thumbnails ×20 spam (bisect-b findings) do NOT recur on this trajectory (Sam ×1, Thumbnails ×0) — trajectory-dependent, not fixed; keep both findings open.
- 53007 faces wave 4 eight times and kills none of them on current master (was 5 kills on the old master, 2 on the moved master) — the wave-4 kill link in the winnability chain is now 0/8 on the lead seed. That is the chain's binding link moving the wrong way, and it is the number the next attribution arm should watch, not just the survival.

## Convergence state

scale-onramp stays **converging** (NOT converged): the 53007 attribution is BLOCKED a second time — the endpoint moved under it again, this time from survival to death, and the frozen band's shape is stale on the new master twice over (53007-a warned this; bisect-b proved it for the lead seed; now the lead seed dies). The next blanks, in order: (1) re-ask the fightblend attribution against the NEW headline as the current-master endpoint (prereg shape: L0 re-verifies NEW on the next current master; L1 pre must reproduce OLD and L2 fix must reproduce MOVED to finger fightblend for the OLD→MOVED step — the NEW headline is the re-verification target, not the attribution target); (2) the `f496b0072` conversation-dedupe before/after, if the MOVED→NEW mechanism wants proving; (3) the wave-4 kill link at 0/8 on the lead seed is a winnability-chain signal worth its own arm.

## Adoption handoff

1. **Verdict: ENDPOINT-MOVED-AGAIN — STOP.** The attribution did not run. Current-master 53007 (`ba21ca026`): 138d, village-lost, lesser d92, standing 100, maxWave 4, w4 0, 15 fallen, mechanism mixed/other (classifier gap: `'the arena'` ×3 unmapped). The bisect-b headline (150d, d90, 199, w4 2) is not reproduced. Unrecorded control matches exactly (G2 PASS) — the movement is master movement.
2. **No pre/fix leg ran.** `93e7bea26` (pre) and `3f405ff78` (fix) are neither fingered nor cleared. The fightblend question stays open.
3. **Sole in-range candidate for the MOVED→NEW step:** conversation.js foreign-phrase dedupe (`f496b0072`, +20/−2) — the only src change in `55b5e5aae`→`ba21ca026`; first daily divergence d10; mechanism plausible (un-blocked foreign lines → different conversation branches → seeded-stream divergence), NOT proven. A `f496b0072^` vs `f496b0072` before/after would prove it.
4. **Proof:** 29 passed, 0 failed, 4 skipped (L1/L2 legs). G1/G2/G3 all PASS on what ran.
5. **Findings backlog:** four items under § Findings for the backlog above (`'the arena'` classifier gap; `f496b0072` before/after owed; Sam/Thumbnails non-recurrence is trajectory-dependent; wave-4 kills 0/8 on the lead seed).
6. Worktree `~/workspace/worktrees/sim-fightblend-53007-b`, branch `sim-fightblend-53007-b`. No game-code trace: prereg + proof + 1 armed corpus + 1 unrecorded control. The flap-retry preload was deleted after use (never committed). No scratch dir was created.
