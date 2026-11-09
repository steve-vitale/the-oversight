# sim-dedupe-beforeafter-b — f496b0072 FINGERED (DIAG, zero src/js)

**Arm:** sim-dedupe-beforeafter-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261109T1030Z (Loop B) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-dedupe-beforeafter-b, base master `8419eefa4` (verified: worktree `git log --oneline -1` reads `8419eefa4` after a clean, conflict-free rebase) · **Prereg:** `evidence/2026-11-09/sim-dedupe-beforeafter-b-prereg.md` (committed `4fdf0eb43` BEFORE any judged computation) · **Instrument:** DIAG recorder (`scripts/recorder-53007-20261108.js`, unchanged) on the doorwalk baseline leg, 150d death-aware, seed 53007 only. Corpora committed under `evidence/2026-11-09/perseed-dedupe-beforeafter-b/` (L0 armed + L0 unrecorded control + L1 armed). Proof `scripts/test-dedupe-beforeafter-b.js` **38 passed, 0 failed, 0 skipped**.

## Verdict: FINGERED — f496b0072 moved seed 53007's endpoint

**The conversation.js foreign-phrase dedupe (`f496b0072`, +20/−2, journey crisis r156) is the mover of the MOVED→NEW step.** Both legs reproduce their headlines exactly, with no tolerance invoked:

- **L0 pre-dedupe** (`f496b0072^` = `c0763d194`) reproduces **MOVED byte-identically**: daily rows sans diag identical to the bisect-b corpus, fallen list identical, 150d survived, standing 199, seatDay 90, 2 wave-4 kills, combat-led.
- **L1 dedupe** (`f496b0072`) reproduces **NEW byte-identically**: daily rows sans diag identical to the fightblend-b current corpus, fallen list identical, waveKillLog identical, 138d village-lost, standing 100, seatDay 92, 0 wave-4 kills, mixed/other.
- The legs differ in exactly one src file (`src/js/conversation.js`, +20/−2; `game.js` hash `cd5416e93f28ef84dd6cb7af1c2fd7c349e38475` is identical on both legs, and the `f496b0072`→`ba21ca026` range contains no further src change). There is no other in-range candidate. The first daily divergence is **d10, confirmed** — pantry 7,807 → 7,982, wounded 5 → 4, hungry 1 → 2, with rows d2–d9 byte-identical.

The suspected mechanism stands as the only mechanism consistent with the evidence: the dedupe un-blocks foreign-phrase lines that previously returned null, conversations that dead-ended now take branches, and the seeded stream diverges from the first affected conversation onward. One honesty limit: the corpus does not retain conversation line text ("They answer at length." occurs 0× in both corpora — the recorder's transcript fields don't capture it), so the *specific* conversation that diverged on d10 is not identified in this run. The finger rests on exact before/after reproduction across a single-commit src difference, not on tracing the line. The mechanism is proven in the only sense a before/after can prove it: change this one commit, the endpoint moves; revert it, the endpoint returns.

## The before/after — MOVED vs NEW vs L0 vs L1

| | MOVED (bisect-b, `55b5e5aae`) | NEW (fightblend-b, `ba21ca026`) | L0 pre (`c0763d194`) | L1 dedupe (`f496b0072`) |
|---|---|---|---|---|
| Days / end | 150, survived | 138, village-lost | **150, survived** | **138, village-lost** |
| gameDays | 151 | 138 | 151 | 138 |
| Standing | 199 | 100 | **199** | **100** |
| maxWave / unlocked | 4 / 4 | 4 / 4 | 4 / 4 | 4 / 4 |
| Seat | lesser d90 | lesser d92 | lesser d90 | lesser d92 |
| Wave-4 kills (waveKillLog) | 2 | 0 | **2** (Strike d107, Audit d113) | **0** |
| Wave-4 faced (finalSeat w4) | 6 | 8 | **6** | **8** |
| Wave-4 faced (distinct types, wavesFaced) | 6 | 7 | **6** (reunion, eulogy, algorithm, eater, strike, audit) | **7** (eulogy, congregation, influencer, reunion, strike, eater, suburb) |
| Fallen | 9 | 15 | **9** | **15** |
| Mechanism (analyzer rule) | combat-led (7/9 violent) | mixed/other * | **combat-led (7/9)** | **mixed/other** * |
| Living at end | 9 | 2 | 9 | 2 |
| Pantry at end | 29,100 kcal (13 food-days) | 0 kcal (0 food-days) | **29,100 kcal** | **0 kcal** |

\* Mechanical class is mixed/other because the classifier's VIOLENT map has no `'the arena'` key (see § Classifier gap, carried from fightblend-b): violent counts 7/15 by the map (monster 1, contest 1, wild 3, stranger 2); the 3 arena deaths sit in OTHER. If `'the arena'` counted as violent, the mix would read 10/15 = 67% combat-led. The evidence reports the mechanical label and names the gap; it does not re-score.

The unrecorded control reproduces the L0 headline exactly (150d, survived, 199, maxWave 4, lesser d90, w4 2) — G2 neutrality PASS, so the reproduction is tree movement, not the recorder. The L0 corpus is byte-identical sans diag to the bisect-b corpus, and the L1 corpus is byte-identical sans diag to the fightblend-b current corpus — both reproductions are exact, not within-tolerance: the ±5 standing tolerance was never invoked on either leg.

**Fallen, L0 (MOVED, identical to bisect-b):** d16 Rafael (sickness), d57 Luz (the wild), d75 Luke (the wild), d77 Klaus (the wild), d80 Se-ri (the wild), d81 Stan (the wild), d84 Katarina (thirst), d85 Riley (the wild), d87 Elena (the wild).
**Fallen, L1 (NEW, identical to fightblend-b):** d31 Luz (the arena), d40 Rafael (monster), d40 Se-ri (sickness), d44 Stan (sickness), d52 Riley (sickness), d56 Diego (sickness), d61 Luke (contest), d62 Klaus (the wild), d62 Elena (a stranger), d63 Katarina (sickness), d67 Boris (the wild), d76 Omar (the wild), d98 Hannah (the arena), d125 Eleazar (a stranger), d130 Wanjiru (the arena).

**First divergence.** The daily rows hold byte-identical (living, pantry, sick, wounded, hungry) through d9, then diverge on **d10** (pantry 7,807 → 7,982; wounded 5 → 4; hungry 1 → 2) — the same day and the same values fightblend-53007-b saw against the 53007-a corpus, now confirmed on the L0/L1 pair itself. The divergence widens immediately (d11: pantry 7,400 → 9,500, wounded 6 → 5, hungry 0 → 1). No wave-4 fight exists that early and the first deaths don't arrive until d31 on L1 — the reshuffle starts in the first ten days, in the daily living state, which is the fingerprint of a conversation-branch change, not a fight-judgment change.

**What else diverges downstream.** On L1 the pellet is held by the player from d66 through d138 (74 rows); on L0 it is never held on any row. The pellet reached the player only on the dedupe trajectory — a downstream consequence of the divergence, not a cause (no pass ever fires on L1, passDay none). Max sick at once is 3 on both legs; the sickness story is not what changed. The seat is taken two days later on L1 (d92 vs d90) and the village then dies anyway, pantry at zero from d133, living 1–2 from d130, two people left at d138.

## Village assessment — what the village looked like

On the pre-dedupe road, Haven is the village bisect-b already described: Rafael dies of wound fever on day 16, the sickness never cascades, and the wild takes the village apart between day 57 and 87 — eight deaths in thirty days, seven of them in the wild — but the village survives it, thinner, nine people alive at day 150 with a full pantry. It faces wave 4 six times and kills twice (a Strike on day 107, the Audit on day 113).

On the dedupe road, the same twelve people start the same way and the first month reads differently from the first grave on: the scholar Luz dies in the arena on day 31 ("Luz Bianchi is dead — the arena. The village stops. Somebody screams. Somebody else starts digging."), then Rafael is killed by a monster on day 40, and a sickness cluster takes five more between day 40 and 63. The arena takes three in total, strangers two, the wild three. The village still earns its seat — the table is set on day 90, the Audit comes on day 92 and names the lesser seat — and then it keeps dying anyway: Hannah in the arena on day 98, Eleazar to a stranger on day 125, Wanjiru in the arena on day 130. By day 132 there is one person left, then two — a joiner, or a return — and the pantry has been at zero for days. The village ends at day 138 with two people still alive and nothing left to eat: not wiped out, walked away from. It faced wave 4 eight times and killed none of them — the door stood open and the village never walked through it as a killer, only as prey.

**Sense-test.** The mourning beats cohere and the names rotate correctly on both legs; the table-set (d90) → Audit (d92) sequence reads as cause and consequence on L1. The d31 tribute beat reads as cause and consequence too (Stonebridge installs its own speaker, tribute rises to 6,000 kcal/week — "Grief is leverage, and they know it"). Two bisect-b findings do NOT recur on L1: Sam of The Red Table's begging and the "Thumbnails" trailer spam are absent from the captured transcript fields on this trajectory — trajectory artifacts, not fixes, same as fightblend-b found.

## Wall numbers (this run — one seed, doorwalk baseline leg, per leg)

- National 0/1, table sits 1/1 (lesser only), wins 0/1 (baseline leg never walks a door) — both legs.
- Wave-4 unlocks 1/1, wave-5 unlocks 0/1 — both legs.
- Survival: L0 150d, L1 138d (n=1 each).
- Telemetry deviation check: not run — DIAG attribution, no lever before/after; the per-leg headline reproduction is the validity check.
- Balanced panel (§15): not run — DIAG recorder corpus, same standing as 53007-a/bisect-b/fightblend-b; `balance-panel.js` refuses recorder corpora by design (recorded, not forced).

## Proof

`node scripts/test-dedupe-beforeafter-b.js` — **38 passed, 0 failed, 0 skipped** (run after the corpora were committed-present):

- G1 det-gate — PASS on fixtures + committed corpora (P1 sickness-first, healed sickness-first, collapsed mixed/other, broken-classifier sensitivity, attrition/combat/night-only fixtures, `'the arena'` gap fixture; headline predicate synthetics for old/moved/new/endpoint + the ±5 standing boundary at 193/194 (moved) and 94/105 (new); firstDivergence synthetics — d10 found, null on identical rows; committed endpoint/53007-a/bisect-b/fightblend-b corpora read endpoint/old/moved/new respectively).
- G2 neutrality — PASS on the L0 pair (armed == unrecorded, same leg tree `c0763d194`, identical headline + trajectory) and on synthetic pairs (stripDiag neutral; one-life drift fails).
- G3 integrity — PASS on all three new corpora (L0 armed: 149 rows d2..d151, diag on all rows, gap d2→d4 only, 0 instrument errors, Elena d87 living note join-masked; L0 unrecorded: same rows sans diag, 0 errors; L1: 137 rows d2..d138, diag on all rows, gap d2→d4 only, 0 errors, Diego d56 living note join-masked).
- The FINGERED verdict is carried by passing legs, not failures: L0 reads MOVED, L1 reads NEW, first divergence d10 (within the prereg's d2–d30 window).

## GO bars (binding)

1. L0 pre-dedupe reproduces the MOVED headline — **MET, exact** (150d, survived, 199, seatDay 90, 2 w4 kills, combat-led; byte-identical to the bisect-b corpus sans diag). No STOP.
2. Each judged leg produces a full daily corpus with an end snapshot — **MET for all three** (L0 armed + unrecorded, L1 armed).
3. Leg headlines judged against the decision tree — **MET: L0 MOVED, L1 NEW**; no middle shape forced (no leg read middle).
4. G1 det-gate — **PASS** (proof 38/0/0).
5. G2 recorder neutrality — **PASS** on the L0 pair (armed == unrecorded on `c0763d194`).
6. G3 corpus integrity — **PASS** on all three new corpora.

## Method note

- CANON.md read first; MONSTER-WAVES.md for the wave/fight context (wave-4 gate standing ≥ 100; wave-5 gate standing ≥ 200 AND wave-4 faced; "Monster encounters are fought, not rolled"). No canon doc covers seed attribution — the question was answered from measurement.
- Branch base: rebased onto explicit current master `8419eefa4` at run start (clean, no conflicts); `git log --oneline -1` verified the base before any judged work. The worktree base only matters for tooling/evidence commits — both judged legs are git-archive extractions, not the worktree itself.
- Extraction: `git archive <sha> src scripts index.html manifest.json version.json | tar -x -C scratch-dedupe-<leg>/` under the worktree (deleted after use; reproducible from `git archive`). Frozen current-tip instruments overlaid onto each extraction (driver, recorder, analyzer, sim-harness, sitstep/stageally/bankkiller instruments, all 12 policy files); overlay hash-verified (driver `e5c1d9d2…` identical on tip and both legs). Code identity: `game.js` hash `cd5416e93f28ef84dd6cb7af1c2fd7c349e38475` matches the commit blob on BOTH legs; `conversation.js` is the only src difference between legs (+20/−2); `index.html` identical across legs. Require-closure 2-day smokes passed on both extracted trees (0 errors) before any judged seed; smoke corpora written to /tmp and discarded.
- Flap: probe-gated every git write; probes passed throughout (prereg commit ~11:48Z; no write refused, no retry observed on corpus writes). Corpus writes went through the retry preload (`scripts/flap-retry-preload-20261109.js`, written via temp+rename, never committed, deleted after use — same pattern as bisect-b/fightblend-b: `fs.writeFileSync` wrapped with bounded EPERM retry, 180 × 2s `Atomics.wait`, + read-back verify).
- Safe-commit index clobber struck the prereg commit (file showed staged-deleted with the worktree copy intact) — repaired via `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, hash-object matched the HEAD blob before repair, status clean + `git diff HEAD` empty after.
- Code identity / anchor quirk: the corpora's `anchorCommit` reads the worktree tip (`4fdf0eb43`, the prereg commit), not the leg SHA — the driver runs `git rev-parse HEAD` in REPO and the scratch dir sits under the worktree, so the anchor resolves upward. The SHAs under test are recorded here (`c0763d194` pre, `f496b0072` dedupe), as 53007-a/bisect-b/fightblend-b did with their anchor quirks.
- No game-code change. `git diff HEAD -- src/` is empty. No midpoint was extracted (the range is a single commit; there is no midpoint) and no further bisect was run, per the prereg.

## Metric review

- The primary metric is the per-leg headline, judged against the decision tree — and the tree held: L0 read MOVED and L1 read NEW, each exactly, with no middle shape and no tolerance invoked. The ±5 standing tolerance was not needed on either leg (both standings are exact point values, 199 and 100).
- The deterministic-sim premise held twice over: L0 reproduced the bisect-b corpus byte-identically sans diag, and L1 reproduced the fightblend-b current corpus byte-identically sans diag — two independent exact reproductions on two different trees, which is stronger than the prereg's tolerance-based bar.
- The first-divergence check held: d10, the same day and values fightblend-b reported against the 53007-a corpus, now confirmed on the L0/L1 pair itself. The proof's divergence window (d2–d30) was a guard, not a prediction — d10 sits inside it.
- The doorwalk baseline leg never walks a door and never wins by design; national/table/wins are reported as wall numbers, not judged.
- Classifier note carried forward (unchanged): the VIOLENT map keys `'arena'` but the game emits `'the arena'` — the next prereg using this classifier should register `'the arena'` (and audit the other keys against actual cause strings) or the mechanism label undercounts violent deaths. The label is reported as the rule computes it, not as it "should" read.
- Wave-4 faced accounting note: `finalSeat.detail.w4` reads 8 on L1 while the distinct-type count from `wavesFaced` keys reads 7 (`herald` is present in `wavesFaced` with count 4 and is not in the wave-4 filter list used here; the seat Audit is absent from L1's `wavesFaced` entirely). The established convention (fightblend-b) is the `finalSeat` count, reported here as 8; the 1-count gap is an instrument-accounting question, not a verdict item. A future instrument should reconcile `finalSeat.detail.w4` against `wavesFaced` keys + wave fields.
- One metric note carried from 53007-a/bisect-b/fightblend-b: the `deathSays` filter catches "deadfall" (it contains "dead") — the first deathSays entries are deadfall-gathering lines, not deaths. A future instrument should filter `deadfall` out of the death regex. It did not affect any judgment here.

## Findings for the backlog

- **f496b0072 FINGERED for the MOVED→NEW step** — the conversation.js foreign-phrase dedupe moves seed 53007 from survival (150d, standing 199, 2 w4 kills) to death (138d, standing 100, 0 w4 kills) via a d10 divergence. The fightblend question (OLD→MOVED) is untouched by this finger: fightblend landed before `55b5e5aae`, and the MOVED→NEW step is fully explained in range by the conversation change alone. The OLD→MOVED step — the one fightblend could have caused — is still unattributed.
- Classifier gap (carried, still open): the 53007-a classifier's VIOLENT map keys `'arena'` but the game emits the cause string `'the arena'` — 3 arena deaths in this run sit in OTHER and the mechanism reads mixed/other where the cause mix (10/15 violent) reads combat-led. Register `'the arena'` in the next classifier prereg (and audit the remaining keys against emitted cause strings); never silently bucket.
- Pellet divergence (new observation): on the dedupe trajectory the pellet is held by the player from d66 through d138 (74 rows); on the pre trajectory it is never held on any row. The pellet reaching the player is a downstream consequence of the d10 divergence, not a cause — but a lever that changes who holds the pellet changes the village's food story, and this is the first 53007 leg pair where the pellet's presence itself differs between legs.
- Wave-4 faced accounting (new instrument note): `finalSeat.detail.w4` (8 on L1) and the distinct-type count from `wavesFaced` keys (7 on L1) disagree by one; `herald` sits in `wavesFaced` unclassified and the seat Audit is absent from L1's `wavesFaced`. Reconcile the two counts in the next recorder prereg.
- 53007 faces wave 4 eight times and kills none of them on the dedupe leg (was 2 kills pre-dedupe, 5 on the old master) — the wave-4 kill link in the winnability chain is now 0/8 on the lead seed's current trajectory. That is the chain's binding link moving the wrong way, and it is the number the next arm should watch, not just the survival.
- Sam's begging ×3 and the Thumbnails ×20 spam (bisect-b findings) do NOT recur on this trajectory either (absent from the captured transcript fields on L1) — trajectory-dependent, not fixed; keep both findings open.

## Convergence state

scale-onramp stays **converging** (NOT converged): the 53007 attribution chain is now one step shorter — the MOVED→NEW step is proven (f496b0072 fingered, exact reproduction on both legs), but the OLD→MOVED step is still unattributed (fightblend is neither fingered nor exonerated; its before/after arm still needs a stable current-master headline to re-ask against, and the current-master headline is now NEW, not MOVED). The next blanks, in order: (1) re-ask the fightblend attribution against the NEW headline as the current-master endpoint (prereg shape: L0 re-verifies NEW on the next current master; L1 pre must reproduce OLD and L2 fix must reproduce MOVED to finger fightblend for the OLD→MOVED step); (2) the wave-4 kill link at 0/8 on the lead seed is a winnability-chain signal worth its own arm; (3) the pellet-presence divergence (held d66–d138 on the dedupe road, never held pre-dedupe) is a new lever-adjacent observation for the pellet arc.

## Adoption handoff

1. **Verdict: FINGERED — f496b0072 moved seed 53007's endpoint.** L0 pre-dedupe (`c0763d194`) reproduces MOVED byte-identically (150d, survived, 199, d90, 2 w4 kills, combat-led); L1 dedupe (`f496b0072`) reproduces NEW byte-identically (138d, village-lost, 100, d92, 0 w4 kills, mixed/other). First divergence **d10, confirmed** (pantry 7,807 → 7,982, wounded 5 → 4, hungry 1 → 2; rows d2–d9 identical). Legs differ in exactly one src file (conversation.js +20/−2); no other candidate exists in range.
2. **Proof:** 38 passed, 0 failed, 0 skipped. G1/G2/G3 all PASS on what ran. Standing tolerance never invoked (both exact).
3. **Fightblend is untouched by this finger** — the OLD→MOVED step is still open; the next fightblend arm re-asks against NEW as the current-master endpoint.
4. **Findings backlog:** six items under § Findings for the backlog above (f496b0072 fingered; `'the arena'` classifier gap carried; pellet-presence divergence; wave-4 faced accounting gap; wave-4 kills 0/8 on the lead seed; Sam/Thumbnails non-recurrence is trajectory-dependent).
5. Worktree `~/workspace/worktrees/sim-dedupe-beforeafter-b`, branch `sim-dedupe-beforeafter-b`. No game-code trace: prereg + proof + 3 corpora (L0 armed, L0 unrecorded, L1 armed) + this evidence. The flap-retry preload was deleted after use (never committed). Scratch dirs deleted after use (reproducible from `git archive`).
