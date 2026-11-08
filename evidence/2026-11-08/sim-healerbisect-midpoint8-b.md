# sim-healerbisect-b — midpoint #8 screen (`007203566`, r153 conversation-repeats fix)

**Arm:** sim-healerbisect-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261108T0830Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (3) · **Findings:** #1885 · **Branch:** sim-healerbisect-mid5-b (base master `e9399e09e`) · **Prereg:** `evidence/2026-11-08/sim-healerbisect-b-prereg.md` (+ Amendment A1) · **Instrument:** doorwalk driver, BASELINE leg only (TAKESEAT_B=1, DOORWALK_B off), 150d death-aware, screen subset {53004, 53005, 53006, 53008}. Corpora committed under `evidence/2026-11-08/perseed-healerbisect-mid8-b/` (all 8 seeds — the screen went AMBIGUOUS, so the full 8 were run per the prereg). Proof `scripts/test-healerbisect-b.js` **17/17 green**; screen module `scripts/healerbisect-screen-20261108.js`.

## Verdict: AMBIGUOUS on the screen rule AND on the full-8 bars — the heal is split, not single

Midpoint #8 `007203566` (journey-social r153: fix conversation repeats — cross-key pool exhaustion + opener double-speaking, `src/js/conversation.js` only) reads **AMBIGUOUS** twice over:

- **Screen (subset):** 2/4 reach 150d (53004, 53006), 2/4 die before d100 (53005, 53008). Neither the HEALED bar (≥3/4 reach 150d) nor the COLLAPSED bar (≥3/4 die before d100) is met.
- **Full 8 (run per the prereg's AMBIGUOUS rule):** median **100d**, sits **2/8**. Neither the HEALED bar (median ≥120d AND sits ≥4/8) nor the COLLAPSED bar (median ≤90d AND sits ≤2/8) is met — the median sits between the bars while the sits count sits exactly on the collapsed bar.

The prereg's bisect narrative assumed a single landing flips the whole band. #8 breaks that assumption in plain view: the r153 conversation fix heals two seeds outright, lifts two more partway, and leaves two exactly collapsed. The flip is a staircase, not a switch.

## Per-seed table — midpoint #8 `007203566`, full 8 (this run)

| Seed | Days | End | Standing | maxWave | Seat | w4 kills | w5 kills | vs collapsed | vs healed |
|---|---|---|---|---|---|---|---|---|---|
| 53001 | 150 | survived | 350 | 5 | — (never announced) | 6 | 0 | 88d → 150d | 105d → 150d |
| 53002 | 50 | village-lost | 100 | 4 | — | 0 | 0 | 84d → 50d (worse) | 140d → 50d (worse) |
| 53003 | 108 | village-lost | 199 | 4 | — | 0 | 0 | 68d → 108d | 65d → 108d |
| 53004 | 150 | survived | 199 | 4 | lesser d90 | 4 | 0 | 73d → 150d, exact healed match | exact (150/d90/199) |
| 53005 | 54 | village-lost | 199 | 4 | — | 1 | 0 | exact (54d) | 150d → 54d |
| 53006 | 150 | survived | 620 | 5 | lesser d90 | 7 | 0 | 66d → 150d | 150d, overshoots (620 vs 199) |
| 53007 | 63 | village-lost | 125 | 4 | — | 0 | 0 | exact (63d) | 50d → 63d |
| 53008 | 92 | village-lost | 199 | 4 | — | 3 | 0 | exact (92d) | 150d → 92d |

0 instrument errors on all 8 seeds. Screen classifier (subset): `{n: 4, healed: 2, collapsed: 2, verdict: "AMBIGUOUS"}`. Subset median 121d (misleading — the two survivors pull it up), sits 2/4. Full-8 median 100d, sits 2/8. Smoke (53004 alone, 08:46:56–08:47:54Z, ~58s) validated the instrument before any judged seed; the other 3 subset seeds ran in one invocation (~159s); the 4 non-subset seeds ran in a second invocation (~200s). Total sim time ~7 min — contention rising through the run.

## Flip tables (analyzer)

Collapsed control → mid8 (full 8): `A collapsed-control: n=8 median=70.5d sits=0/8 verdict=COLLAPSED; B mid8: n=8 median=100d sits=2/8 verdict=AMBIGUOUS; seeds with moved death day: 5/8; instrument errors A=0 B=0`. Moved: 53001 +62, 53002 −34, 53003 +40, 53004 +77, 53006 +84. Unmoved: 53005 (54d), 53007 (63d), 53008 (92d) — exactly collapsed, day for day.

Healed control → mid8 (full 8): `A healed-control: n=8 median=145d sits=4/8 verdict=HEALTHY; B mid8: n=8 median=100d sits=2/8 verdict=AMBIGUOUS; seeds with moved death day: 6/8; instrument errors A=0 B=0`. 53004 and 53006 match the healed endpoint exactly on days/seat (53004: 150/d90/199/w4 3→4; 53006: 150/d90, standing 620 vs 199, w4 7 vs 3).

## Mechanism — what the r153 fix does, and what it does not do

The r153 landing changes only `src/js/conversation.js`: a cross-key reset that frees exhausted reply/voice pools (the `dlg:more` continuer had been served "Tell me more." 9 times in one wild conversation because pool variants recorded under several keys never freed) and an opener-carried skip that stops the same line being spoken twice in a row. It is a conversation-quality fix, not a survival lever on its face — yet at #8 two villages that died now live and sit, one survives without sitting, and one lives 40 days longer.

The honest mechanism reading: conversation changes consume RNG differently and, more importantly, change what villagers *do* with their days — talk is a dawn decision input, and unblocking stuck dialogue threads unblocks the days attached to them. The per-seed split is the evidence: 53004/53006 heal exactly, 53001 survives (standing 350, wave 5 unlocked, 6 wave-4 kills) but never sits — its seat was never announced (`takeseatStats`: 449 "not-announced" skips; `finalSeat` detail shows `foodDeeds: false`, the feast deed undone, so the table never priced the run) — 53003 lives to 108d, and 53005/53007/53008 do not move at all. A single conversation fix cannot be *the* healer for the whole band when three seeds are untouched by it; it is one step of a staircase.

Two warnings inside the table: 53002 dies at 50d at #8 — earlier than BOTH endpoints (collapsed 84d, healed 140d). A conversation change reshuffles downstream RNG draws, and on this seed the reshuffle lands badly. That is expected chaos in a deterministic-but-sensitive sim, not an indictment of the fix — but it is why no verdict rests on the subset alone, and why the full-8 bars exist. 53006 also overshoots the healed endpoint (standing 620, wave 5 unlocked, 7 wave-4 kills, 0 wave-5 kills — the wave-5 road opens but no Producer dies by d150; readiness5 short only on veterans, 1 of 2 demanded, same shape as #9's veterans-0 question).

## 53005 reading

53005 stays exactly collapsed at #8 (54d, fallen list identical to the collapsed control day/name/cause). It is now the **only** subset seed unhealed at both #8 and #9 (see `sim-healerbisect-midpoint9-full8-b.md`): 53004/53006 heal at #8, 53008 heals at #9, 53005 heals at neither. Its healer — if any single landing heals it — sits in #10..#17, or the full heal is a combination. Do not declare the healer found on any screen that leaves 53005 collapsed.

## Village assessment — what the villages looked like

Three villages out of eight live out the 150 days at #8; two of them sit down at the lesser table on d90. The other five die on the same schedule the collapse always used, except 53003, which holds on 40 days longer than it ever did. The most legible village is 53001: it survives, reaches wave 5, kills 6 wave-4 monsters, stands at 350 — and never gets offered the seat at all, because the feast deed was never done. It is a village strong enough to live and too poor in feasts to be priced: the same feast-gate story the pellet-bearer fix was built for, visible here one landing before the ladder lands.

Sense-check: sit days read from `takeseatStats.seatDay` (taken day). 53004/53006 both sit d90, matching the healed control exactly. No dialogue in these corpora reads robotic on its face; the death lists cohere with the collapsed control where the seeds did not move.

## Wall numbers (mid8, full 8)

- National 0/8, table sits 2/8 (lesser only), wins 0/8 (baseline leg never walks a door).
- Wave-4 unlocks 8/8, wave-5 unlocks 2/8 (53001, 53006).
- Median survival 100d; max 150d; min 50d.
- Telemetry deviation check: not run — DIAG screen, no lever before/after; the screen classification is the validity check.

## Method note — same as midpoint #9 / #5

- Flap probes passed before each sweep (08:46Z, 08:51Z). No flap observed this run.
- Old code extracted read-only with a single `git archive 007203566 src scripts index.html manifest.json version.json | tar -x -C scratch-007203566/` — first try. `version.json` stamp `eac2bfc4d-20261107-175416`.
- The three frozen instrument files were overwritten from branch tip `e9399e09e` via `git show` (driver, doorwalk policy, analyzer) and verified byte-identical to the worktree tip copies.
- Require closure: the full `src`+`scripts` archive includes the 17-file closure by construction (verified explicitly at #5); the smoke passed on the first try (0 errors).
- Anchor reads `e9399e09e943` (the worktree tip) in every corpus JSON. The SHA under test is recorded here (`007203566`), not inferred from the anchor.
- `scripts/worktree-heartbeat.sh sim-healerbisect-mid5-b` **hung** this run (no output after 75s+; killed with SIGTERM per the task rule — the hang is the script, not git, as in prior runs). The registry heartbeat is therefore stale from the coordinator's registration; the branch and evidence commits are the durable record.

## Metric review

- The screen rule held without re-scoring: AMBIGUOUS at 2 healed / 2 collapsed, exactly the neither-bar case the prereg defines. The prereg's AMBIGUOUS rule was followed literally: the full 8 were run at #8 and classified on the 8-seed bars, which also read AMBIGUOUS (median 100d, sits 2/8).
- One correction to the prereg's expectation, not the metric: the prereg's bisect narrative assumes a single landing flips the whole band. At #8 the flip is visibly partial — two seeds heal, three do not move, one gets worse, one survives without sitting. The screen rule still narrows the interval correctly (#7..#9 with #8 ambiguous between them), but the adopting run must not treat "first HEALED screen" as "the healer found": #9's screen HEALED also fails the full-8 median bar (see `sim-healerbisect-midpoint9-full8-b.md`).
- Open question, not chased: 53006 unlocks wave 5 at #8 (and #9) while its end-state `readiness5` reads veterans short of the 2 demanded (1 at #8, 0 at #9). Either the wave-4 killers died before the end (veterans are living-roster only) or the gate released on a different read. Logged in the findings backlog at #9; still open.

## Convergence state

scale-onramp stays **converging** (NOT converged): #8 is AMBIGUOUS on both the screen and the full 8 — the heal is a staircase across #8 and #9 at least, and the full heal (median 145d, sits 4/8) is not reached until somewhere in #10..#17. No landing is fingered yet; the next bisect step is into #10..#17 (next midpoint #14 `2bc17d793`, alien expansion).

## Adoption handoff

See `sim-healerbisect-midpoint5-b.md` § Adoption handoff. Add: #8's full-8 corpora are committed under `evidence/2026-11-08/perseed-healerbisect-mid8-b/`; #9's full-8 corpora under `evidence/2026-11-08/perseed-healerbisect-mid9full8-b/`. The bisect's next midpoint is #14 `2bc17d793` on the screen subset (same extraction method, same driver invocation). If #14 screens HEALED (≥3/4 reach 150d) the flip is in #10..#14; if COLLAPSED, in #14..#17; if AMBIGUOUS, run its full 8 as was done here.
