# sim-honeststakes-b — the honest-stakes ledger fix (BUILD, game-code)

**Arm:** sim-honeststakes-b (small game-code build) · **Run:** fleshout-loop-b-20261109T1930Z (Loop B) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) · **Branch:** sim-honeststakes-b, base master `fd306cac1` · **Prereg:** `evidence/2026-11-09/sim-honeststakes-b-prereg.md` (committed `716dd376d` before any judged computation; no corrections after) · **Parent finding:** `evidence/2026-11-09/sim-arenadecomp-b.md`, finding (b) · **Proof:** `node scripts/test-honeststakes-b.js` — **71/71 green, 0 failed, 0 skipped** · **Check:** `node scripts/check.js --quick` — **296 passed / 4 failed** (final run after the proof refresh — exactly the standing profile; the standing 4 only). Full story in "Check status" below.

## Verdict: GO

**All three pre-registered GO conditions met.** The ledger now counts the arena deaths that previously read `{}` — band total 0 → 10, exactly the arenadecomp join, per seed and per contest — with byte-identical fingerprints before/after on all 8 seeds (deaths, days, outcomes, every headline field unchanged), and the choice screen now tells the truth where it lied: on seed 43008, Sal is offered The Pit on d28 and the screen reads "This one has killed 1 before" instead of "No one has died in this one yet" — seven days after Howard died in The Pit in the same village. The fix changes the CHOICE, not the death rate.

## The fix (one write, same keying, same counting)

`src/js/contests.js`, `_contestArenaAfter`, the `lost` branch (+23 lines, the only `src/js` change). The arena-lost path never wrote `contestDeathsById`; only `_contestDie` (player, non-arena) and `_cxKillContestant` (villager) did. The new write copies `_contestDie`'s expression exactly — `dl[contest.id] = (dl[contest.id] || 0) + 1`, where `contest` is the already-computed `_cxScaledContest(ac)` in that function — so the key the choice screen reads at `contests.js:2306` is the key the death writes. Two guards, both mirroring existing idioms:

1. **Once per contest object** (`ac._arenaDeathLedgered`, mirroring `_contestDie`'s `ac._dieLanded`): a re-entrant call can never write twice. (Re-entrancy via the public path is already impossible — the branch nulls `state.activeContest` — but the flag makes it structural, not incidental.)
2. **Only when the death actually landed**: tbEnd's phoenix-link hold routes a lost arena fight through `_contestArenaAfter(arc, 'lost')` WITHOUT calling `playerDeath` — the fire holds the death. The ledger counts deaths, not holds, so the write is skipped while a player-bearing phoenix link is pending (`state.phoenixLink && bearerIsPlayer !== false`, the same condition tbEnd uses). The benevolent-lifeline save never reaches this branch (it clears the arena routing and calls `_contestEnd`).

No change to the death rate, any contest outcome, any other ledger, the choice-screen text template, or the billing. The read side (`contests.js:2306`) is untouched — only the ledger contents changed.

Why the phoenix guard matters (found while reading the path, not from a failure): without it, a phoenix-held loss would have written a death for a scholar who lived. The guard was verified by fixture (F4/F4b/F5): held → no write; link cleared → the same loss writes; a villager-bearing link does not block the player's death write.

## Before/after numbers (winseek, 150d, seeds 43001–43008, identical seeds)

The before leg ran on unmodified code at base `fd306cac1` and reproduced the parent band exactly (days, ends, deaths, takes, choice offers — every seed). The after leg ran the same instrument with the fix. Corpora: `evidence/2026-11-09/perseed-honeststakes-b/before/` and `.../after/` (8 winseek corpora + 8 bare fingerprints each + `sweep-winseek-before.json` / `sweep-winseek-after.json`).

| Seed | Days | End | Ledger before | Ledger after | Fingerprint before vs after |
|---|---|---|---|---|---|
| 43001 | 82 | village-lost | `{}` | `{"pit":1}` | identical |
| 43002 | 68 | village-lost | `{}` | `{}` | identical |
| 43003 | 76 | village-lost | `{}` | `{"siege":1}` | identical |
| 43004 | 80 | village-lost | `{}` | `{"pit":2,"gauntlet":1}` | identical |
| 43005 | 91 | village-lost | `{}` | `{"pit":1}` | identical |
| 43006 | 150 | survived | `{}` | `{}` | identical |
| 43007 | 60 | village-lost | `{}` | `{"siege":1}` | identical |
| 43008 | 85 | village-lost | `{}` | `{"pit":3}` | identical |

**Band ledger total 0 → 10**, exactly the arenadecomp arena-death join (Pit 7, Siege 2, Gauntlet 1 across the band). Ledger keys are contest ids (`pit`/`siege`/`gauntlet`), never names — a name-keyed write would have failed the L1b equality. Ledger totals equal the arena-lost counts per seed (L1e) — a write on won/fled, or a double-write, would have inflated past the join. Fingerprints (daysAlive, endReason, rank, maxWave, national, table, win, deathCauses, deathKeys, finalPop) are byte-identical before/after on all 8 seeds, and recorded == bare inside each leg (L2a/b/c) — the instrument is neutral and the fix is neutral on everything except the ledger.

## Wall numbers (before and after — identical)

- Floor-reach **2/8** (43005 d91, 43006 d150 — the only survivor).
- National **0/8**, table **0/8**, wins **0/8**.
- Wave-4 unlocks **8/8**, wave-5 unlocks **0/8**.
- True median survival **81d** (sorted 60, 68, 76, 80, 82, 85, 91, 150). (The proof test's L4 prints 82 — the upper-median index — in both legs; the equality is what it judges.)
- Sit-verb calls across the band: **0** (both legs).

## Sense test — the d28 offer, read aloud (uncapped sense recorder)

The arenadecomp recorder caps `sysSayLines` at 400 (first-400 sample), so the d28 choice screen never reaches the committed corpora on 43008 (its lines stop at d21). A focused sense recorder (`scripts/sweep-honeststakes-sense-b.js`, seed 43008, winseek, 150d, uncapped capture of exactly the record lines) ran once per leg. The two legs are a controlled pair: same 6 offers, same days, same contests, same billing, same HP — the d28 Pit line is the ONLY record line that changes:

**Before (the lie):**
- d16 Windfall — "MEDIUM RISK — people have been hurt in this one. / No one has died in this one yet. That you know of. / You are at 100 health."
- d22 The Iron Pantry — "HIGH RISK — people die in this one. Regularly. / No one has died in this one yet. That you know of. / You are at 100 health."
- **d28 The Pit — "HIGH RISK — people die in this one. Regularly. / No one has died in this one yet. That you know of. / You are at 100 health."** — false. Howard died in The Pit on d21, grabbed, hushwolf, 96 rounds, and the village buried him.
- d36 Duel, d44 Lie Detector, d60 The Alibi Chain — all "No one has died in this one yet", all true (no prior arena deaths in those contests).

**After (the truth):**
- d16, d22, d36, d44, d60 — byte-identical to before, all still true.
- **d28 The Pit — "HIGH RISK — people die in this one. Regularly. / This one has killed 1 before. / You are at 100 health."** — true. Howard d21 is counted; Sal participates anyway and dies d29 (the choice is his, with open eyes — exactly the design's rule: "No silent risks; the player decides with open eyes").

Every record line in the after corpora was also joined against prior arena deaths (L3: 7 lines in the capped corpora; L3e: all 6 sense lines) — each "killed N" count equals the prior lost count for that contest, each "No one" has zero prior. The full d28 texts are in `evidence/2026-11-09/perseed-honeststakes-b/sense-43008-before.json` and `sense-43008-after.json`.

## Village assessment — what the band's villages looked like (plain words)

Nothing about the villages changed — that is the point. The same eight villages live and die the same eight deaths on the same days: seven lost, one still standing at the 150-day horizon, the wild taking 88 of 101 pre-floor deaths and the arena its same 10. The only thing that changed is the record the show keeps of its own killing. Where the old code let the System look a new scholar in the eye and say nobody had died in the contest that buried the last scholar a week earlier, the ledger now remembers, and the choice screen says so in plain words. Sal still walks into The Pit on d28 — the fix does not save him, and it was never meant to. It lets him walk in knowing. That is the whole of the change, and it is enough: the design's own honesty rule now holds on the one path where the engine broke it.

## Reachability verdict

Unchanged from the parent band (the fix moves no reachability): waves 1–4 reached on 8/8 seeds, wave 5 on 0/8, regional on 8/8, national on 0/8, table on 0/8, wins on 0/8 under winseek. The axis stays NOT converged.

## Check status

`node scripts/check.js --quick` — run TWICE (the box was heavily loaded by sibling runs; the first run took 923s, the second 805s):

- **Run 1: 292 passed, 8 failed in 923s.** Full failure list not captured (output was piped through `tail -15`); the visible tail showed the pre-existing `establishment-r20-fixes` racks-full failure, and the two slowest entries were exactly 120s — the per-test timeout (`scripts/check.js:40`, `TIMEOUT_MS = 120s`).
- **Run 2 (full log `/tmp/honeststakes-checkquick.log`, also summarized here): 293 passed, 7 failed in 805s.** The count moved between runs (8 → 7) with no code change in between — the failure set is load-sensitive, not deterministic.
  - **Standing 4 (pre-existing, NOT chased):** `test-mobile-combat-cadence.js` (Continue wraps the announced round), `test-occupation-panels.js` (real CLI workflow), `test-phone-frame-proof.js` (phone receipt source stale — index.html), `test-establishment-r20-fixes-20261020.js` (racks-full voice gate). All four match the 1739Z standing profile.
  - **NEW — 3 measurement-family failures, ONE shared root cause (this arm's src/js change, via proof staleness, NOT via behavior):** `test-measurement-proof-update.js` ("Proof source inputs are not current"), `test-measurement-workflow.js` ("retained neutrality proof covers the current Game/controller/harness inputs"), `test-measurement-cache-flags.js` ("both actual CLI configurations complete valid neutral panels"). The retained observer-neutrality proof (`scripts/balance-proof.json` → `evidence/2026-11-09/neutral-measureproof-refresh-b.json.gz`) was built on inputs without this fix; changing `src/js/contests.js` moved a Game input, so the proof no longer covers the current tree. This is the repo's prescribed maintenance step (AGENTS.md: "Changed Game/controller/harness or collector/contract inputs require a fresh real observer-neutral maintenance proof. Refresh it with scripts/balance-proof-update.js"), not a behavior regression — the proof test fails at load before running anything, and the three ledger-touching tests (`test-contest-fear-20261011.js` 21/21, `test-arenadeath-diag.js` 21 checks, `test-arenadecomp-b.js` 68/68) all pass with the fix. **Resolution: fresh real neutral panel built on the fixed tree and the proof re-pointed (see "Proof refresh" below); the three tests are re-verified individually and the full check re-run after.**
  - **Run-1-only 8th failure (not in run 2):** `test-trust-observer-neutrality.js` hit the 120s timeout in run 1 (slowest entry, exactly 120s) and passed in run 2 (83s) — a load timeout, not a break.
- **Final run (after the proof refresh): 296 passed, 4 failed in 744s — exactly the standing profile.** The 4 failures are exactly the standing 4 (mobile-combat-cadence, occupation-panels, phone-frame-proof, establishment-r20-fixes). The three measurement failures are gone, no timeout flaked (slowest entry 98s, under the 120s limit). Full log: `/tmp/honeststakes-checkquick-final.log` (read work, not committed).

## Proof refresh (maintenance for the src/js change)

Per `docs/SIMULATING.md` (same procedure as the r162 refresh and today's `sim-measureproof-refresh-b` arm):

- `node scripts/balance-panel.js --out /tmp/neutral-honeststakes-b --seeds 7 --policies capable,risk-aware,socialite,winseek --days 150` — log: `evidence/2026-11-09/neutral-honeststakes-b.log` ("Saved /tmp/neutral-honeststakes-b; 4 cases, 0 cached jobs", ~2 min). Panel verified before use: 4 rows, `sourcesStable: true`, neutrality all four cohorts `match: true`, 0 warnings, 0 observer errors, `sourceHeadStart == sourceHeadEnd == 716dd376d` (worktree HEAD at generation time).
- Copy `.balance` panel → `evidence/2026-11-09/neutral-honeststakes-b.json.gz`
- `node scripts/balance-proof-update.js evidence/2026-11-09/neutral-honeststakes-b.json.gz` — **accepted**; new `scripts/balance-proof.json` panelDigest `6608cb7f5c82a627b9457f1b241354bbb90cbc69aa09a8beb106420fd531a052`, all eight normalized sources recorded.
- Re-verified individually after the refresh: `test-measurement-proof-update.js` **9/9 PASS**, `test-measurement-workflow.js` **9/9 PASS**, `test-measurement-cache-flags.js` **4/4 PASS** — all three NEW failures resolved by the refresh, confirming the root cause was proof staleness, not behavior.
- Final `node scripts/check.js --quick` re-run after the refresh — **296 passed / 4 failed in 744s (exactly the standing profile; the standing 4 only)**. Full log `/tmp/honeststakes-checkquick-final.log`.
- **Sequencing note for the coordinator:** the panel is built on THIS tree state (base `fd306cac1` + prereg + fix + proof/sense scripts). If another arm's game-code change lands into master before this arm merges, the proof will go stale again on the merged tree (any src/js move invalidates it) and the refresh must be re-derived on the final merged master — the sibling refresh-b arm hit the same sequencing and held its final panel for exactly this reason.

## Metric review

- **Metrics held.** All three pre-registered GO conditions were judged exactly as written: ledger == join per seed (10 total, 43008 pair present), fingerprints byte-identical on all 8 seeds, the d28 line now reads "killed 1 before". No friendly re-scoring anywhere in this verdict. The guardrails held: no change to the death rate, contest outcomes, or any other ledger; choice-screen lines changed only where a prior arena death in the same contest exists (exactly one line on the sense pair).
- **No balanced-panel compare (§15) — a decision, recorded in the prereg, not an oversight.** The change writes one ledger counter in a terminal death branch, consumes no RNG, and touches no outcome path; the identical-seed fingerprint equality is the neutrality proof, and it is stronger than a panel tolerance check for this change class (a panel could only show "no material signal" where the fingerprint shows "byte-identical").
- **Median convention note:** the proof test's L4 `medianDays` is the upper-median index (82) while this file reports the true median (81), matching the parent evidence's convention. Both legs agree under either convention; the equality is what L4 judges.
- **Sense-instrument divergence (instrument note, verdict-neutral):** the focused sense recorder's trajectory runs 84 days against the sweep instrument's 85 on seed 43008 (same seed, same policy, same fix state) — the village dies a day earlier and never takes the d85 "quiet" contest. The two instruments agree exactly through d60 (identical takes, days, contests, and the same three arena deaths), and the sense run reproduces itself deterministically. The known cause is the harness's own documented order-sensitivity: `sim-harness.js` freezes `Date.now()` as a per-load counter, and "at least one consumer is order-sensitive" — the two instruments make different numbers of `Date.now()` calls (different wrapper sets), so their ID streams shift and the end-day can flip by one. This does not touch the judged comparison: both judged legs use the IDENTICAL sweep instrument, and recorded == bare inside each leg on all 8 seeds. A future arm that compares trajectories across different instruments should compare through the shared day, not the tail.
- **sysSay cap note (carried from the parent):** `sysSayLines` caps at 400 (first-400 sample). On long seeds the choice screens after ~d21 never reach the corpus — the sense recorder exists because of it. A future arm needing full System transcripts should raise the cap or count-only.
- **Phoenix-held loss (known edge, by design):** if a phoenix link holds an arena death, the contest closes as a loss with the death held — the ledger does not count it, and if the link later resolves in death at the dawn fuse, that death is not attributed to the contest either (the contest already closed). The ledger counts arena deaths that landed, which is the honest reading of the record; attributing a dawn-fuse death back to the contest would need a cross-day attribution the engine does not have. Named here so the next arm that touches the phoenix resolution knows the gap exists.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json --current 'evidence/2026-11-09/perseed-honeststakes-b/after/arenadecomp-b-winseek-s*.json' --metrics national,table,wins,exiled` printed the same three LOUD lines as the parent arms (national 12→0, table 16→0, wins 16→0). Verdict: EXPLAINED REGIME ARTIFACT, not a bug — winseek never sits or wins by design, and the baseline was seeded from a different regime. No investigation item. The baseline was NOT rolled forward.

## Findings for the backlog (coordinator appends — this worker does NOT edit sim-findings.md)

- **HONEST-STAKES LEDGER FIXED (this arm, BUILD-GO).** `contestDeathsById` now counts arena deaths: 0 → 10 on the 43001–43008 band, exactly the arenadecomp join, fingerprints byte-identical, d28 Pit offer now reads "This one has killed 1 before". The parent finding (b) is closed. The fix is one write in `_contestArenaAfter` (`lost`), same keying/counting as `_contestDie`, with a once-per-contest flag and a phoenix-hold guard.
- **PHOENIX-HELD ARENA LOSS CLOSES AS A DEATH IT ISN'T (this arm, instrument/design note).** When a phoenix link holds an arena death, tbEnd routes the loss through `_contestArenaAfter(arc, 'lost')` without calling `playerDeath` — and the branch still narrates a death ("the beast", the death line, the Death Reel), counts the contest held, and grants 'died' knowledge, while the scholar lives. The ledger guard in this fix correctly skips the write, but the branch's narration/knowledge accounting over-states a held death. Pre-existing, out of this arm's scope (the fix is the ledger, not the branch), named for the next arm that touches the phoenix resolution.
- **SENSE VS SWEEP INSTRUMENTS DIVERGE BY ONE DAY (this arm, instrument note).** Two "pure observation" instruments on the same seed/policy/fix state end a day apart (84 vs 85) with identical histories through d60 — the harness's documented `Date.now()` order-sensitivity (sim-harness.js). Judged comparisons must use one instrument on both legs; cross-instrument trajectory comparisons should compare through the shared day, not the tail.

## Convergence state

**converging** — the parent arm's named honesty follow-up (finding (b)) is now closed with a landed fix and a 71/71 proof; the axis (scale-onramp / winnability chain) is NOT converged: national stays 0/8, wave-5 stays 0/8, wins stay 0/8 under winseek. Next work on this axis is the flee-repair build and the standing-accumulation arm (per the Loop B queue), not more death measurement.

## Proof

`node scripts/test-honeststakes-b.js` — **71/71 green, 0 failed, 0 skipped** (fixture legs F1–F8 on the live harness: arena-lost writes, accumulates, no re-entrant double-count, phoenix-held no-write / link-cleared writes / villager-link does not block, won/fled no-write, `_cxKillContestant` + `_contestDie` watch branch still write exactly once; live legs L1–L4 on the committed before/after corpora: ledger == join per seed, keys are ids, totals == lost counts, fingerprints identical before/after and recorded == bare in both legs, every record line truthful, the d28 sense pair with only that line changing, wall numbers identical). `node scripts/check.js --quick` — final run **296 passed / 4 failed** (exactly the standing profile; see "Check status" above).

## Files committed with this evidence

- `evidence/2026-11-09/sim-honeststakes-b-prereg.md` (already committed: `716dd376d`)
- `src/js/contests.js` (the fix — one write + two guards in `_contestArenaAfter`, `lost`)
- `scripts/test-honeststakes-b.js`, `scripts/sweep-honeststakes-sense-b.js` (new: proof + sense recorder)
- `evidence/2026-11-09/perseed-honeststakes-b/` (before/after winseek corpora + bare fingerprints + `sweep-winseek-before.json` / `sweep-winseek-after.json` + `sense-43008-before.json` / `sense-43008-after.json`)
- `evidence/2026-11-09/neutral-honeststakes-b.json.gz` + `neutral-honeststakes-b.log` (fresh real neutral panel for the proof refresh) and `scripts/balance-proof.json` (re-pointed at it)
