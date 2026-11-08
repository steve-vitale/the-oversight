# sim-healerbisect-b — midpoint #5 screen (`19ee88466`, r111 Q2 convoNextMenu)

**Arm:** sim-healerbisect-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261108T0830Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (3) · **Findings:** #1885 · **Branch:** sim-healerbisect-mid5-b (base master `e9399e09e`) · **Prereg:** `evidence/2026-11-08/sim-healerbisect-b-prereg.md` (+ Amendment A1) · **Instrument:** doorwalk driver, BASELINE leg only (TAKESEAT_B=1, DOORWALK_B off), 150d death-aware, screen subset {53004, 53005, 53006, 53008}. Corpora committed under `evidence/2026-11-08/perseed-healerbisect-mid5-b/`. Proof `scripts/test-healerbisect-b.js` **17/17 green**; screen module `scripts/healerbisect-screen-20261108.js`.

## Verdict: COLLAPSED on the screen rule — flip is in #5..#9

Midpoint #5 `19ee88466` (journey-establishment r111 Q2: convoNextMenu returns the current line — a pagination tap no longer blanks the inline dialogue box) screens **COLLAPSED**: 0/4 subset seeds reach 150d, 4/4 die before d100 (bar ≥3/4). The flip interval narrows to **#5..#9**; the next midpoint was **#7 `820b61496`** (run in this same window — see `sim-healerbisect-midpoint7-b.md`).

Seed-level truth: #5 reproduces the collapsed control **exactly, day for day and death for death**. All four subset seeds die on the same days as the collapsed control (73/54/66/92d), with identical fallen lists (day, name, cause — verified entry by entry against the committed collapsed-control corpora; the only differences anywhere in the JSON are wall-clock-derived `villagerId` strings on two entries, e.g. `app_mgpspiiw229` vs `app_mgpspiiv229`). Standing and wave-4 kills are likewise identical to the collapsed control on all four seeds. The conversation-menu change moves nothing: no death day moves, no village survives a day longer. That is the expected shape for a UI-only return-value change — and it is also a determinism check that passed: the frozen instrument reproduces the collapsed shape bit-for-bit in game terms.

## Per-seed table — midpoint #5 `19ee88466` (this run)

| Seed | Days | End | Standing | maxWave | Seat | w4 kills | w5 kills | vs collapsed | vs healed |
|---|---|---|---|---|---|---|---|---|---|
| 53004 | 73 | village-lost | 199 | 4 | — | 2 | 0 | exact (73d) | 150d → 73d |
| 53005 | 54 | village-lost | 199 | 4 | — | 1 | 0 | exact (54d) | 150d → 54d |
| 53006 | 66 | village-lost | 190 | 4 | — | 1 | 0 | exact (66d) | 150d → 66d |
| 53008 | 92 | village-lost | 199 | 4 | — | 3 | 0 | exact (92d) | 150d → 92d |

0 instrument errors on all 4 seeds. Screen classifier: `{n: 4, healed: 0, collapsed: 4, verdict: "COLLAPSED"}`. Subset median 69.5d, sits 0/4. Smoke (53004 alone, 08:42:06–08:42:14Z, ~8s) validated the instrument before any judged seed; remaining 3 seeds ran in one invocation (~19s). Total sim time ~27s — the box is quiet this run.

## Flip table: collapsed control (full-8, committed) → mid5

| Seed | Collapsed days | Mid5 days | Δdays | Collapsed seat/sat | Mid5 seat/sat | Collapsed stand | Mid5 stand | Collapsed w4 | Mid5 w4 | end |
|---|---|---|---|---|---|---|---|---|---|---|
| 53004 | 73 | 73 | 0 | — | — | 199 | 199 | 2 | 2 | village-lost → village-lost |
| 53005 | 54 | 54 | 0 | — | — | 199 | 199 | 1 | 1 | village-lost → village-lost |
| 53006 | 66 | 66 | 0 | — | — | 190 | 190 | 1 | 1 | village-lost → village-lost |
| 53008 | 92 | 92 | 0 | — | — | 199 | 199 | 3 | 3 | village-lost → village-lost |

Analyzer (collapsed control vs mid5 subset): `A collapsed-control: n=8 median=70.5d sits=0/8 verdict=COLLAPSED; B mid5: n=4 median=69.5d sits=0/8 verdict=COLLAPSED; seeds with moved death day: 0/8; instrument errors A=0 B=0`. Analyzer (healed control vs mid5): `A healed-control: n=8 median=145d sits=4/8 verdict=HEALTHY; B mid5: n=4 median=69.5d sits=0/8 verdict=COLLAPSED; seeds with moved death day: 4/8` (all four subset seeds, healed → collapsed).

## 53005 reading

53005 stays exactly collapsed at #5 (54d, fallen list identical to the collapsed control day-for-day: Robin ambushed d13, Joshua killed by The Callback d26, Cheryl lost in the wild d29, five starve d50–51, village gone d54). But at #5 **all four** subset seeds are exactly collapsed, so 53005 is not special here — the whole band is unhealed. The 53005 caveat from #9 still stands for the flip as a whole: at #9 it stayed collapsed while the other three healed, so its healer (if any single landing heals it) sits in #10..#17 or in a combination.

## Wall numbers (mid5 screen, 4 seeds)

- National 0/4, table sits 0/4, wins 0/4 (baseline leg never walks a door).
- Wave-4 unlocks 4/4, wave-5 unlocks 0/4.
- Median survival 69.5d (subset); max 92d; min 54d.
- Telemetry deviation check: not run — this is a DIAG screen with no lever before/after; the screen classification is the validity check (same as both control runs).

## Method note — same as midpoint #9

- Flap probe (`git update-ref refs/heads/probe-sim-healerbisect-mid5-b HEAD`, then delete) passed first try at 08:41:11Z. Probes repeated before each sweep and passed throughout.
- Old code extracted read-only with a single `git archive 19ee88466 src scripts index.html manifest.json version.json | tar -x -C scratch-19ee88466/` — first try. `version.json` stamp `eac2bfc4d-20261107-175416` (the #4 bump — consistent with #5 sitting after #4). Code identity verified: scratch `src/js/conversation.js` contains the r111 `convoNextMenu` change (`line:cur` in both return paths); `git show 19ee88466` confirms the landing touches only `src/js/conversation.js` (12 lines).
- The three frozen instrument files were overwritten from branch tip `e9399e09e` via `git show` (driver, doorwalk policy, analyzer) and verified byte-identical to the worktree tip copies.
- Require closure verified BEFORE the smoke: all 17 files the driver needs (the same 17 as #9, including the three transitive instrument requires `stageally-instrument-20261106`, `bankkiller-instrument-20261105`, `killerdeath-instrument-20261105` plus the deeper transitive set). The full `src`+`scripts` archive includes the closure by construction; the smoke passed on the first try (0 errors).
- Anchor reads `e9399e09e943` (the worktree tip) in every corpus JSON. The SHA under test is recorded here (`19ee88466`), not inferred from the anchor.
- `scripts/worktree-heartbeat.sh sim-healerbisect-mid5-b` — heartbeat cadence kept per task (run at start; see midpoint8 file for the run's heartbeat record).

## Metric review

- The screen rule held without re-scoring: COLLAPSED at 4/4 dying before d100, met exactly at 4/4. No friendlier metric was consulted.
- The exact reproduction (0 moved death days vs the collapsed control) strengthens the instrument: the same frozen driver, run twice hours apart on different checkouts, reproduces the collapse bit-for-bit in game terms. A bisect that cannot reproduce its own control would be noise; this one can.
- No metric change proposed. The screen subset continues to discriminate cleanly: at #5 all four seeds sit on the collapsed side, at #9 three sit on the healed side.

## Convergence state

scale-onramp stays **converging** (NOT converged): the bisect has narrowed twice in this window — #5 COLLAPSED, #7 COLLAPSED (no-op step, see `sim-healerbisect-midpoint7-b.md`), #8 AMBIGUOUS on the full 8 (see `sim-healerbisect-midpoint8-b.md`), #9 HEALED on the screen with a full-8 run in progress at write time. No landing is fingered yet; the flip interval is #7..#9 with #8 ambiguous between them, and 53005's healer is still entirely unknown.

## Adoption handoff — what is done vs pending

1. Midpoint #5 `19ee88466` screens COLLAPSED (4/4 die before d100, exact collapsed reproduction). Flip in **#5..#9**.
2. Midpoint #7 `820b61496` screens COLLAPSED (identical days to #5, as expected for the prodstore-revert no-op step). Flip in **#7..#9**. See `sim-healerbisect-midpoint7-b.md`.
3. Midpoint #8 `007203566` screens **AMBIGUOUS** on the subset (2/4 heal: 53004/53006; 53005/53008 still exactly collapsed) and **AMBIGUOUS on the full 8** (median 100d, sits 2/8). See `sim-healerbisect-midpoint8-b.md`.
4. Midpoint #9 `4e6fa44ab` screens HEALED (3/4, from the 0730Z run). The full-8 run at #9 (seeds 53001/53002/53003/53007, plus the committed mid9 subset corpora) was in flight at the time this file was written — its result belongs in `sim-healerbisect-midpoint9-full8-b.md` or as an addendum to `sim-healerbisect-midpoint9-b.md` in the adopting run.
5. The flip is therefore **split, not single**: #8 heals 53004/53006 (and lifts 53001 to survival, 53003 to 108d), #9 heals 53008 on top of that. 53005 heals at neither — its healer, if any single landing heals it, sits in #10..#17, or the full heal is a combination. No verdict rests on the subset alone: the flip point still needs its full-8 confirm + balanced panel before any landing is fingered, per the prereg.
6. Worktree `~/workspace/worktrees/sim-healerbisect-mid5-b`, branch `sim-healerbisect-mid5-b` (base master `e9399e09e`). Scratch dirs `scratch-19ee88466/`, `scratch-820b61496/`, `scratch-007203566/`, `scratch-4e6fa44ab/` left untracked in the worktree (extractions of the screened SHAs, frozen instrument copies inside them).
