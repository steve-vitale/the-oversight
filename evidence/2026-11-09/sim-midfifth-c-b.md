# sim-midfifth-c-b — (c) MIDDLE→FIFTH suspect set on the frozen band

Arm: **sim-midfifth-c-b**, Loop B run `fleshout-loop-b-20261109T2130Z`.
Prereg: `evidence/2026-11-09/sim-midfifth-c-b-prereg.md`, committed **before any judged computation** as `ff94dfeb5`.
Worktree: `~/workspace/worktrees/sim-midfifth-c-b`, branch `sim-midfifth-c-b`, base master `7cd52fbb0` (verified `git log --oneline -1` before any judged work).
Band: seeds **53011–53018**, frozen at `fd306cac1`; F0 endpoints in `evidence/2026-11-09/sim-bandfreeze-b.md`.
Method: doorwalk baseline leg, 150d death-aware; `git archive` extraction + frozen 18-file instrument overlay per the bandfreeze prereg; 2-day smoke per extracted tree before any judged seed. DIAG only — zero `src/js`, no default flips, no game-code change.

## Verdicts (binding pair-(b) band rule from the prereg)

| Pair | Commit | File | Verdict |
|---|---|---|---|
| coach | `5e190b6ef` (pre `4c44e35de`) | `src/js/truth.js` | **INERT** |
| medic | `48c93b22b` (pre `0ba20ac1c`) | `src/js/game.js` | **MIXED** |
| reveal | `ae7daf40c` (pre `c6dd255b9`) | `src/js/convo-wants.js` | **INERT** |
| tooltip | `1cc46630c` (pre `d781f354d`) | `src/js/progression.js` | **INERT** |

No summary verdict word beyond the rule's three. A MOVER verdict would say the commit moves band endpoints consistently; none of the four meets it. The medic pair is MIXED (with=3, against=1, anyMove=5) — see the medic section for why that word understates what the fix does.

## Range order (correction to the prereg's listing order)

The range `8419eefa4..0fcff01ea` is a single linear chain of 41 commits (no merge). Old → new, the four suspects sit in this order: **tooltip → reveal → medic → coach**. So each pair's "pre" tree lacks the later fixes: the reveal pair is judged on a pre-medic tree, the tooltip pair on a tree predating all three other fixes. The pairs are still single-commit before/after judgments; the order only matters for reading the cross-checks below.

## F0-reverify (freeze stability on current master `7cd52fbb0`)

F0r re-ran all 8 band seeds on the worktree's own master. Result: **EXACT on all 8 seeds** — identical days/end/standing/seatDay/w4/w4faced/fallen/living/maxWave/readiness AND byte-identical daily rows and fallen lists. The freeze HOLDS on current master: the `fd306cac1`→`7cd52fbb0` src changes (honest-stakes `contests.js`, r122 post-secret `conversation.js`/`convo-dialogue.js`) move NO band endpoint — not a single daily row differs.

F0r endpoints: 53011 150d/784/12 kills; 53012 44d died/125/0; 53013 150d/370/3; 53014 82d died/325/4; 53015 150d/199/0 kills/1 fallen (lesser d109); 53016 150d/384/3; 53017 150d/199/2; 53018 150d/199/3.

## Per-seed tables

Columns: days/end, standing, seatDay (sd, `-` = no seat), w4 kills/faced, fallen count, maxWave. First-divergence is first-row-per-day on (living, pantry, sick, wounded, hungry); `none` = no daily row differs.

### Coach pair — L7 `midfifth-c-pre-coach` → L8 `midfifth-c-coach` — INERT

| seed | pre | fix | firstDiv |
|---|---|---|---|
| 53011 | 150d/surv 784 sd90 w4=12/8 fl=14 mw5 | identical | none |
| 53012 | 44d/lost 125 sd- w4=0/1 fl=9 mw4 | identical | none |
| 53013 | 150d/surv 370 sd90 w4=3/5 fl=9 mw5 | identical | none |
| 53014 | 82d/lost 325 sd- w4=4/6 fl=14 mw5 | identical | none |
| 53015 | 150d/surv 199 sd109 w4=0/1 fl=1 mw4 | identical | none |
| 53016 | 150d/surv 384 sd90 w4=3/3 fl=9 mw5 | identical | none |
| 53017 | 150d/surv 199 sd90 w4=2/7 fl=15 mw4 | identical | none |
| 53018 | 150d/surv 199 sd90 w4=3/6 fl=16 mw4 | identical | none |

L8 is byte-identical to L7 on all 8 seeds (daily rows AND fallen lists). The `coachPriorDeflect` pool change never fires on the doorwalk leg: the prior-deflect branch is a player-initiated doubt confrontation the bot never presses, so the new `drawTruthLine` RNG draw never happens and no trajectory shifts. The RNG-visibility worry in the prereg does not materialize on this band. Judge: with=0, against=0, anyMove=0, dir all 0.

### Medic pair — L9 `midfifth-c-pre-medic` → L10 `midfifth-c-medic` — MIXED

| seed | pre | fix | firstDiv |
|---|---|---|---|
| 53011 | 66d/lost 199 sd- w4=0/4 fl=15 mw4 | 150d/surv 784 sd90 w4=12/8 fl=14 mw5 | d58 pantry 2665→1200 |
| 53012 | 44d/lost 125 sd- w4=0/1 fl=9 mw4 | identical | none |
| 53013 | 62d/lost 284 sd- w4=3/4 fl=4 mw5 | 150d/surv 370 sd90 w4=3/5 fl=9 mw5 | d38 pantry 7695→5895; sick 1→0; wounded 6→5; hungry 7→6 |
| 53014 | 82d/lost 325 sd- w4=4/6 fl=14 mw5 | identical | none |
| 53015 | 150d/surv 495 sd90 w4=5/8 fl=13 mw5 | 150d/surv 199 sd109 w4=0/1 fl=1 mw4 | d4 pantry 30450→30560 |
| 53016 | 150d/surv 559 sd93 w4=6/8 fl=15 mw5 | 150d/surv 384 sd90 w4=3/3 fl=9 mw5 | d4 sick 1→0 |
| 53017 | 148d/lost 695 sd- w4=12/8 fl=26 mw5 | 150d/surv 199 sd90 w4=2/7 fl=15 mw4 | d5 pantry 27300→27000; sick 0→1; wounded 2→1; hungry 0→1 |
| 53018 | 150d/surv 199 sd90 w4=3/6 fl=16 mw4 | identical | none |

Judge: with=3, against=1, anyMove=5, dir={standing:−1, w4:−1, fallen:−1}. Per-seed: 53011 none, 53012 none, 53013 **against**, 53014 none, 53015 with, 53016 with, 53017 with, 53018 none. Field moves: standing 53011 +1, 53013 +1, 53015 −1, 53016 −1, 53017 −1; w4 53011 +1, 53015 −1, 53016 −1, 53017 −1; fallen 53011 −1, 53013 +1, 53015 −1, 53016 −1, 53017 −1.

**What MIXED means here, plainly:** the medic fix moves the band hard in BOTH directions, seed by seed. On 53011 and 53013 it rescues collapsed villages (66d→150d, 62d→150d, standing 199→784 and 284→370). On 53015/53016/53017 it cools overheated villages back down (495→199, 559→384, 695→199; w4 kills 5→0, 6→3, 12→2). The pair direction read off the data is DOWN on all three fields (3 down vs 2 up on standing), so the two rescue seeds do not count as "with" and 53013 counts as "against" — because its fallen count rose 4→9. That rise is a whole-run-count artifact of living longer: the same four people die later (Penelope d58→d70, Alejandro d55→d73, Mateo d60→d74) plus five more over the extra 88 days the village now survives. The rule binds — the verdict is MIXED, not MOVER — but the word should not be read as "weak effect."

**The stronger fact, measured separately from the verdict:** L10 (medic fix) reproduces the F0 freeze **byte-identically on all 8 seeds** — daily rows AND fallen lists. The medic-duty widen alone accounts for the ENTIRE pre-medic → frozen gap on this band. The pre-medic tree diverges from F0 on 5/8 seeds (first divergences d4–d58); applying the single medic commit closes every one of them exactly. The other three fixes are inert on the band, so there is no other candidate for the gap.

Mechanism, pinned at the earliest divergence: on 53016 day 4, pre-medic has Aroha sick with tick fever (4 days left); with the fix, nobody is sick at d4 — same pantry (31,440), same living (12). A trained villager is on medic duty from the first days. On 53011 the first divergence is d58 pantry (2,665→1,200 — the fix spends pantry tending), then living gaps at d63 (7 vs 10) as the pre-medic village collapses d63–66 while the fixed one holds. See Sense-test below.

### Reveal pair — L11 `midfifth-c-pre-reveal` → L12 `midfifth-c-reveal` — INERT

| seed | pre | fix | firstDiv |
|---|---|---|---|
| 53011 | 66d/lost 199 sd- w4=0/4 fl=15 mw4 | identical | none |
| 53012 | 44d/lost 125 sd- w4=0/1 fl=9 mw4 | identical | none |
| 53013 | 62d/lost 284 sd- w4=3/4 fl=4 mw5 | identical | none |
| 53014 | 82d/lost 325 sd- w4=4/6 fl=14 mw5 | identical | none |
| 53015 | 150d/surv 495 sd90 w4=5/8 fl=13 mw5 | identical | none |
| 53016 | 150d/surv 559 sd93 w4=6/8 fl=15 mw5 | identical | none |
| 53017 | 148d/lost 695 sd- w4=12/8 fl=26 mw5 | identical | none |
| 53018 | 150d/surv 199 sd90 w4=3/6 fl=16 mw4 | identical | none |

L12 is byte-identical to L11 on all 8 seeds. The first-reveal guard in `engageBeat` never changes a trajectory on the doorwalk leg — the curious-first-reveal beat either never fires under this policy or fires identically. The analyzer-fix confound noted in the prereg is neutralized by the frozen overlay (the overlay replaces the analyzer in both legs), so the pair judges the src change only. Judge: with=0, against=0, anyMove=0.

### Tooltip pair — L13 `midfifth-c-pre-tooltip` → L14 `midfifth-c-tooltip` — INERT

Identical table to the reveal pair (same pre-shape endpoints on all 8 seeds). L14 is byte-identical to L13 on all 8 seeds. The FEASTED tooltip flag is read only for that text; no trajectory moves, as expected. Judge: with=0, against=0, anyMove=0.

## Wall numbers (every leg; doorwalk baseline leg, 8 seeds)

National / lesser seats / full seats / wins / wave-4 unlocks / wave-5 unlocks / wave-5-ready / median survival / survived / kill link (w4 kills ÷ w4 faced, band totals). Seat kind from `finalSeat.seat`; national from top-level `scaleRank`; wave-5-ready from end `readiness5.ready`.

| Leg | national | lesser | full | wins | w4 unlock | w5 unlock | w5-ready | median | survived | kill link |
|---|---|---|---|---|---|---|---|---|---|---|
| F0 (freeze) | 0/8 | 6/8 | 0/8 | 0/8 | 8/8 | 4/8 | 0/8 | 150d | 6/8 | 27/37 |
| F0r | 0/8 | 6/8 | 0/8 | 0/8 | 8/8 | 4/8 | 0/8 | 150d | 6/8 | 27/37 |
| L7 pre-coach | 0/8 | 6/8 | 0/8 | 0/8 | 8/8 | 4/8 | 0/8 | 150d | 6/8 | 27/37 |
| L8 coach | 0/8 | 6/8 | 0/8 | 0/8 | 8/8 | 4/8 | 0/8 | 150d | 6/8 | 27/37 |
| L9 pre-medic | 0/8 | 3/8 | 0/8 | 0/8 | 8/8 | 5/8 | 1/8 | 115d | 3/8 | 33/45 |
| L10 medic | 0/8 | 6/8 | 0/8 | 0/8 | 8/8 | 4/8 | 0/8 | 150d | 6/8 | 27/37 |
| L11 pre-reveal | 0/8 | 3/8 | 0/8 | 0/8 | 8/8 | 5/8 | 1/8 | 115d | 3/8 | 33/45 |
| L12 reveal | 0/8 | 3/8 | 0/8 | 0/8 | 8/8 | 5/8 | 1/8 | 115d | 3/8 | 33/45 |
| L13 pre-tooltip | 0/8 | 3/8 | 0/8 | 0/8 | 8/8 | 5/8 | 1/8 | 115d | 3/8 | 33/45 |
| L14 tooltip | 0/8 | 3/8 | 0/8 | 0/8 | 8/8 | 5/8 | 1/8 | 115d | 3/8 | 33/45 |

Notes:
- The doorwalk leg never walks a door and never wins by design; national/table/wins are wall numbers, not judged.
- The pre-medic shape is the only one with a wave-5-ready village: **53015** (armored 6/4, armed 8/6, tricks 22/3, veterans 3/2). The medic fix removes it — the hotter pre-medic trajectory over-produces veterans/tricks on that seed. Readiness, not a facing: the leg cannot show a wave-5 fight.
- The pre-medic shape kills MORE wave-4s (33 vs 27) and faces more (45 vs 37) — it is a hotter, bloodier band, not a weaker one in the kill count. The medic fix cools it back to the frozen 27/37. The kill link is not a monotonic goodness meter.
- Median survival: 150d on every frozen-shape leg, 115d on every pre-medic-shape leg. The medic fix restores the full 150d median by itself.

## Cross-checks (identity)

- **L10 == F0** byte-identically (daily + fallen) on all 8 seeds. The medic fix alone closes the whole pre→frozen gap.
- **L9 == L11 == L13** byte-identically on all 8 seeds. Three independent "pre" trees (pre-medic, pre-reveal, pre-tooltip — different SHAs, different points in the range) produce the identical pre-medic shape. The commits between them (reveal fix, same-tick duty-cure recorder fix, others) move nothing on the band.
- **L7 == F0** byte-identically on all 8 seeds (pre-coach tree already contains the medic fix and reproduces the freeze).
- **L8 == L7, L12 == L11, L14 == L13** byte-identically on all 8 seeds (the three INERT pairs).
- Code identity per leg verified at extraction: distinguishing file blob + `game.js` blob match the commit under test; the 18-file frozen overlay hash-matches the worktree tip on every leg. `bankkiller-instrument`'s required `scripts/killerdeath-instrument-20261105.js` is byte-identical (blob `085eed65…`) across `fd306cac1` and all 8 pair SHAs, so no confound.

## Sense-test (medic pair, seed 53011 — read the transcript, not just the counts)

Pre-medic 53011 and medic 53011 run identically through d57. The divergence opens at d58 on pantry, then the village's fate splits:

- **Without the fix**, days 63–66 are a funeral cascade. Quinn screams in a fight on d63 ("a sound like milk curdling in fast-forward"), dies d64 "the wild"; Mara dies d65; Maureen dies d65. The transcript voices each death the same way every time ("The village stops. Somebody screams. Somebody else starts digging." / "What Quinn kept close goes into the ground with them — keepsakes are buried, never taken from the body."), and the graveside ritual lines stack up — Maureen, Victor, Mara speaking for Nino, then for Mara — as the village loses 15 people and dies on d66. The sick list tells the mechanism: at d63 Quinn is sick with tick fever, 1 day left, and nobody is tending her.
- **With the fix**, the same people last longer: Quinn dies d68 (not d64), Maureen is still alive speaking at graves on d68, and the village survives the full 150 days to a lesser seat on d90 with 12 wave-4 kills. At d63 the sick list is empty where pre-medic had Quinn feverish. The fix does not make anyone immortal — Quinn still dies "the wild" four days later — it keeps the village's people alive through the window where the unfixed village collapses.

Coherence check: the same graveside ritual lines appear in both corpora, shifted by the divergence (e.g. "speak for Quinn" precedes Quinn's death by a day in pre-medic and by three days in medic). Deaths are voiced, named, and consequential — not silent counters. The d55 lines are identical in both (pre-divergence), as they should be.

## Metric review

- **Band rule applied as preregistered.** The medic verdict (MIXED) follows mechanically from the data: pair direction DOWN on all three fields (3 down vs 2 up on standing; 3 down vs 1 up on w4; 4 down vs 1 up on fallen), with=3, against=1. The rule's MOVER bar (≥5 with, 0 against) is not met. The evidence reports the byte-identity finding alongside because the rule's three words cannot express "restores the frozen trajectory exactly in both directions" — that is a measured fact, not a verdict override.
- **Fallen is a whole-run count.** A fix that extends a village's life can raise its fallen count (53013: 4→9 while surviving 62d→150d). The band rule reads fallen naively; on life-extension fixes the fallen field will point the "wrong" way. Future pair rules should consider fallen-per-day-alive or deaths-before-a-fixed-day alongside the raw count.
- **`finalSeat` is an object, not a string.** The corpus stores `{seat, detail}`; the harness stdout flattens it to `"lesser"`. Wall-number code must read `finalSeat.seat` (and `takeseatStats.seatDay` for the seat day). An earlier draft of the analysis counted `finalSeat !== 'none'` on the object and reported tableSeats=8 with lesser=0 — self-contradictory, caught by inspection before writing. The numbers in this file use the object fields.
- **First-divergence needs first-row-per-day on both sides.** The naive form (first row of A vs last row of B per day) reports a spurious final-day divergence on byte-identical corpora: the last day carries a closing-duplicate row whose living/sick/wounded counts differ from the day's first row (e.g. 53012 d44: living 5→4 within the same corpus). Fixed in the analysis; the proof script's `firstDivergence` is only exercised on synthetic single-row-per-day fixtures, so its G1 legs are unaffected — but it should not be reused on real corpora as written.
- **No balanced panel** (§15: `balance-panel.js` refuses recorder corpora by design). No telemetry deviation check (DIAG attribution; per-leg headline reproduction is the validity check).

## Infrastructure notes (for the next arm)

- **EPERM flap** (2026-11-09, active through the run): O_EXCL and plain writes flap independently — probe-gate with a PLAIN-write probe (`/tmp/plain-probe.js`: open `'w'` + write + readback + unlink, unique name, unlink on every outcome). Corpus writes are plain writes. During a flap, redirecting node stdout/stderr to a FILE kills node silently (rc=1, empty log) — node must inherit the caller's pipe. Preload retry budget 900×1s in the worktree-local preload script.
- **`head -N` kills a long chain.** The first chain launch was piped through `head -100`; once output hit 100 lines, head closed the pipe and the next write SIGPIPE-killed the chain mid-L9 (3 corpora written, leg failed, chain stopped; pipeline exit code was still 0 because it was head's). Relaunched without the pipe; the chain is resume-safe and completed. Never pipe a long-running chain through `head`.
- **Runtime restart mid-L14** (00:19 UTC 2026-11-10): the chain died with 71/72 corpora (only L14 seed 53018 missing); `/tmp` was wiped (plain-probe + analysis scripts recreated from source). Resume re-ran the chain; completed legs skip in ~20s each. Scratch dirs L7–L14 survived the restart and were re-extracted over cleanly.
- **Safe-commit index clobber** struck the prereg commit (`ff94dfeb5`): file showed staged-deleted with the worktree copy intact; repaired via `git ls-tree -r HEAD -- <path> | git update-index --add --index-info`; hash-object matched the HEAD blob; status clean after. Check `git status --short` after EVERY safe-commit.

## Findings (for the backlog — listed here, `sim-findings.md` NOT edited)

1. **Medic-duty widen is the (c) set's mover in substance, MIXED by the rule.** `48c93b22b` restores the F0 freeze byte-identically on all 8 seeds; it is the only (c) commit that moves the band at all. The band rule calls it MIXED because it restores collapsed seeds upward and overheated seeds downward. If the MIDDLE→FIFTH step needs a single-commit explanation, this is it — but the rule as written cannot finger a two-direction restorer. (Backlog: consider a "restores-freeze" read alongside the band rule for future arms.)
2. **Coach deflect, first-reveal guard, feast tooltip are INERT on the frozen band.** All three pairs are byte-identical on all 8 seeds. Their code paths do not fire (coach/reveal) or cannot move a trajectory (tooltip) under the doorwalk baseline policy. This exonerates them for the MIDDLE→FIFTH step on this band — it does not prove they never matter (a policy that presses doubt confrontations or curious reveals could fire them; the tooltip is text-only by construction).
3. **Fallen-as-a-field misleads on life-extension fixes** (see Metric review). 53013's fallen 4→9 while the village goes from lost-at-62d to surviving 150d. Future pair rules should pair the raw fallen count with a per-day-alive or fixed-horizon read.
4. **The pre-medic shape over-produces wave-5 readiness.** One pre-medic seed (53015) is wave-5-ready (veterans 3/2, tricks 22/3) where the freeze has none. The medic fix cools it. The readiness bar, not the kill count, is the binding number on this band (freeze kill link 27/37, wave-5-ready 0/8).
5. **First-divergence helper in `scripts/test-midfifth-c-b.js` is naive on real corpora** (first-vs-last row per day; closing-duplicate artifact). It is only exercised on synthetic fixtures, so the proof stands — but do not reuse it on real corpora without the first-row-per-day fix.
6. **`head -N` on a chain pipe is a silent killer** (see Infrastructure notes). Any future chain launch must not pipe through `head`; use a wait-loop on corpus files instead.

## Proof

`node scripts/test-midfifth-c-b.js` — **142 passed, 0 failed, 0 skipped**. G1 det-gate (classifier on the judged corpora + broken-classifier/broken-recorder sensitivity + 'the arena' registration + 'Hushpuppy' monster-name cause + headline predicate + band-rule judge synthetics + pantry/sick-list recorder sensitivity), G3 corpus integrity on all 72 corpora, all four pair verdicts computed on the real corpora, F0r drift legs report EXACT.

Corpora: `evidence/2026-11-09/perseed-midfifth-c-b/` — 72 files (F0r + L7–L14 × 8 seeds).
