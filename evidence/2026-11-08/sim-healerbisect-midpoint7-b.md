# sim-healerbisect-b — midpoint #7 screen (`820b61496`, prodstore revert)

**Arm:** sim-healerbisect-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261108T0830Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (3) · **Findings:** #1885 · **Branch:** sim-healerbisect-mid5-b (base master `e9399e09e`) · **Prereg:** `evidence/2026-11-08/sim-healerbisect-b-prereg.md` (+ Amendment A1) · **Instrument:** doorwalk driver, BASELINE leg only (TAKESEAT_B=1, DOORWALK_B off), 150d death-aware, screen subset {53004, 53005, 53006, 53008}. Corpora committed under `evidence/2026-11-08/perseed-healerbisect-mid7-b/`. Proof `scripts/test-healerbisect-b.js` **17/17 green**; screen module `scripts/healerbisect-screen-20261108.js`.

## Verdict: COLLAPSED on the screen rule — flip is in #7..#9 (as predicted for a no-op step)

Midpoint #7 `820b61496` (sim-prodstore-a: revert of the PLENTY-WEEK lever, pilot NO-GO, killed arm leaves no trace) screens **COLLAPSED**: 0/4 subset seeds reach 150d, 4/4 die before d100. This is the expected reading, not a surprise: `git diff 19ee88466..820b61496 -- src/js src/data` is **empty** — #7's game code is byte-identical to #5's (`diff -r` of the two extracted `src/` trees confirms it). A no-op step cannot flip anything, and it did not: all four subset seeds reproduce the collapsed control **exactly, day for day** (73/54/66/92d), with fallen lists identical to #5's (verified: `JSON.stringify(fallen)` equal on all four seeds) and to the collapsed control's (day/name/cause identical; only wall-clock-derived `villagerId` strings differ on two entries).

The value of this screen is as a **determinism control**: the same frozen instrument, run on two different checkouts with identical game code (#5 and #7), produces identical trajectories. The bisect's readings are reproducible, not noise. Had #7 read anything other than COLLAPSED, that would have been an instrument/base problem — re-examine, do not credit — per the prereg. It read COLLAPSED, so the instrument stands.

## Per-seed table — midpoint #7 `820b61496` (this run)

| Seed | Days | End | Standing | maxWave | Seat | w4 kills | w5 kills | vs collapsed | vs healed |
|---|---|---|---|---|---|---|---|---|---|
| 53004 | 73 | village-lost | 199 | 4 | — | 2 | 0 | exact (73d) | 150d → 73d |
| 53005 | 54 | village-lost | 199 | 4 | — | 1 | 0 | exact (54d) | 150d → 54d |
| 53006 | 66 | village-lost | 190 | 4 | — | 1 | 0 | exact (66d) | 150d → 66d |
| 53008 | 92 | village-lost | 199 | 4 | — | 3 | 0 | exact (92d) | 150d → 92d |

0 instrument errors on all 4 seeds. Screen classifier: `{n: 4, healed: 0, collapsed: 4, verdict: "COLLAPSED"}`. Subset median 69.5d, sits 0/4. Smoke (53004 alone, 08:43:56–08:44:30Z, ~34s) validated the instrument before any judged seed; remaining 3 seeds ran in one invocation (~105s — contention rising). Total sim time ~2.5 min.

## 53005 reading

53005 stays exactly collapsed at #7 (54d, identical fallen list to #5 and to the collapsed control). Same as #5: at this point in the bisect the whole band is unhealed, so 53005 is not yet special. It becomes special at #8/#9, where the other three seeds heal and it does not (see `sim-healerbisect-midpoint8-b.md` and `sim-healerbisect-midpoint9-full8-b.md`).

## Wall numbers (mid7 screen, 4 seeds)

- National 0/4, table sits 0/4, wins 0/4 (baseline leg never walks a door).
- Wave-4 unlocks 4/4, wave-5 unlocks 0/4.
- Median survival 69.5d (subset); max 92d; min 54d.
- Telemetry deviation check: not run — DIAG screen, no lever before/after; the screen classification is the validity check.

## Method note — same as midpoint #9 / #5

- Flap probe passed before the sweep (08:43:20Z). Probes passed throughout the run.
- Old code extracted read-only with a single `git archive 820b61496 src scripts index.html manifest.json version.json | tar -x -C scratch-820b61496/` — first try (~24s). `version.json` stamp `eac2bfc4d-20261107-175416`.
- The three frozen instrument files were overwritten from branch tip `e9399e09e` via `git show` (driver, doorwalk policy, analyzer) and verified byte-identical to the worktree tip copies.
- Require closure: the full `src`+`scripts` archive includes the 17-file closure by construction (verified explicitly at #5); the smoke passed on the first try (0 errors).
- Anchor reads `e9399e09e943` (the worktree tip) in every corpus JSON. The SHA under test is recorded here (`820b61496`), not inferred from the anchor.

## Metric review

- The screen rule held without re-scoring: COLLAPSED at 4/4 dying before d100, met exactly at 4/4.
- No metric change proposed. The #7 screen's role was determinism verification, and it passed exactly as the prereg's no-op analysis predicted.

## Convergence state

scale-onramp stays **converging** (NOT converged): #7 COLLAPSED as predicted for the no-op step; the flip interval is #7..#9, resolved further in `sim-healerbisect-midpoint8-b.md` (#8 AMBIGUOUS) and `sim-healerbisect-midpoint9-full8-b.md` (#9 AMBIGUOUS on the full 8). No landing is fingered yet; 53005's healer is still entirely unknown.

## Adoption handoff

See `sim-healerbisect-midpoint5-b.md` § Adoption handoff — the same handoff applies, with #7 now recorded COLLAPSED. Next bisect step is into #10..#17 (next midpoint #14 `2bc17d793`, alien expansion), since #9 is AMBIGUOUS on the full-8 bars, not HEALED — the flip point has not been found yet.
