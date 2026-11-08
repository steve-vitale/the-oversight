# sim-healerbisect-b — midpoint #14 full-8 (`2bc17d793`, alien expansion: roster 8 → 12 meddlers)

**Arm:** sim-healerbisect-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261108T1030Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (3) · **Findings:** #1885 · **Branch:** sim-healerbisect-mid14-b (tip `246ce6dc2`, base master `8dc3d16d2` lineage) · **Prereg:** `evidence/2026-11-08/sim-healerbisect-b-prereg.md` (+ Amendment A1, + Amendment B `sim-healerbisect-b-prereg-amendment-b.md`, commit `af93aa2df`, before any judged sweep at #14) · **Instrument:** doorwalk driver, BASELINE leg only (TAKESEAT_B=1, DOORWALK_B off), 150d death-aware, frozen band 53001–53008, full 8 per Amendment B. Corpora committed under `evidence/2026-11-08/perseed-healerbisect-mid14-b/`. Proof `scripts/test-healerbisect-b.js` **17/17 green**; screen module `scripts/healerbisect-screen-20261108.js`.

## Verdict: AMBIGUOUS on the full-8 bars — the alien expansion heals nothing new

Midpoint #14 `2bc17d793` (alien expansion: roster 8 → 12 meddlers — Quill, Kess, Howl, Bibi; `meddlerMoves` wired into `apContestInterference`, verdict-only; canon `docs/ALIEN-PLAYERS.md`) reads **AMBIGUOUS**: median **103d**, sits **4/8**. The sits bar passes (≥4/8) but the median bar fails (<120d). Per the prereg's flip bars, a commit counts as HEALED only if median ≥120d AND sits ≥4/8 — #14 meets one of the two. It is not the healer, and no landing is fingered yet.

The staircase so far, full-8 medians: collapsed control 70.5d → #8 100d → #9 108.5d → **#14 103d** → healed control 145d. Sits: 0/8 → 2/8 → 4/8 → **4/8** → 4/8. #14 steps the median *back* 5.5 days from #9 while holding the sits. The alien expansion is a flat step on the staircase, not a riser.

## Per-seed table — midpoint #14 `2bc17d793`, full 8

| Seed | Days | End | Standing | maxWave | Seat | w4 kills | w5 kills | vs #9 | vs healed |
|---|---|---|---|---|---|---|---|---|---|
| 53001 | 67 | village-lost | 199 | 4 | — | 2 | 0 | identical (67d) | 105d → 67d |
| 53002 | 139 | village-lost | 100 | 4 | lesser d90 | 0 | 0 | 150d → 139d (worse) | 140d → 139d, sits now |
| 53003 | 45 | village-lost | 84 | 3 | — | 0 | 0 | identical (45d) | 65d → 45d |
| 53004 | 150 | survived | 199 | 4 | lesser d90 | 9 | 0 | identical days/seat/stand; w4 3 → 9 | exact days/seat/stand; w4 3 → 9 |
| 53005 | 54 | village-lost | 199 | 4 | — | 1 | 0 | identical (54d, exactly collapsed) | 150d → 54d |
| 53006 | 150 | survived | 675 | 5 | lesser d90 | 11 | 8 | identical (150/d90/675, w4 11, w5 8) | 150d, overshoots (675 vs 199, w5 8 vs 0) |
| 53007 | 59 | village-lost | 134 | 4 | — | 0 | 0 | identical (59d) | 50d → 59d |
| 53008 | 150 | survived | 199 | 4 | lesser d141 | 1 | 0 | identical (150/d141) | 150d, late sit (healed d97, w4 3) |

0 instrument errors on all 8 seeds. Full-8 median 103d, sits 4/8. Smoke (53004 alone, 10:39:46–10:40:54Z, ~68s) validated the instrument before any judged seed; the other 7 seeds ran in one invocation (10:41:09–10:49:40Z, ~8.5 min). Total sim time ~9.5 min.

Note on the retired screen rule: the old subset {53004, 53005, 53006, 53008} at #14 reads 3/4 reaching 150d — the old rule would have called this HEALED. Amendment B exists precisely because that reading is misleading: the same 3/4 already healed at #9, and the remaining climb (53001, 53002, 53003, 53005, 53007) did not move at #14. The full-8 verdict above is the binding one.

## Flip tables (analyzer)

Collapsed control → mid14: `A collapsed-control: n=8 median=70.5d sits=0/8 verdict=COLLAPSED; B mid14-2bc17d793: n=8 median=103d sits=4/8 verdict=AMBIGUOUS; seeds with moved death day: 7/8; instrument errors A=0 B=0`. Moved: 53001 −21, 53002 +55, 53003 −23, 53004 +77, 53006 +84, 53007 −4, 53008 +58. Unmoved: 53005 only (54d, exactly collapsed).

| Seed | Collapsed days | Mid14 days | Δdays | Collapsed seat/sat | Mid14 seat/sat | Collapsed stand | Mid14 stand | Collapsed w4 | Mid14 w4 | end |
|---|---|---|---|---|---|---|---|---|---|---|
| 53001 | 88 | 67 | −21 | — | — | 199 | 199 | 3 | 2 | village-lost → village-lost |
| 53002 | 84 | 139 | +55 | — | lesser d90 | 100 | 100 | 0 | 0 | village-lost → village-lost |
| 53003 | 68 | 45 | −23 | — | — | 120 | 84 | 0 | 0 | village-lost → village-lost |
| 53004 | 73 | 150 | +77 | — | lesser d90 | 199 | 199 | 2 | 9 | village-lost → survived |
| 53005 | 54 | 54 | 0 | — | — | 199 | 199 | 1 | 1 | village-lost → village-lost |
| 53006 | 66 | 150 | +84 | — | lesser d90 | 190 | 675 | 1 | 11 | village-lost → survived |
| 53007 | 63 | 59 | −4 | — | — | 125 | 134 | 0 | 0 | village-lost → village-lost |
| 53008 | 92 | 150 | +58 | — | lesser d141 | 199 | 199 | 3 | 1 | village-lost → village-lost |

Healed control → mid14: `A healed-control: n=8 median=145d sits=4/8 verdict=HEALTHY; B mid14-2bc17d793: n=8 median=103d sits=4/8 verdict=AMBIGUOUS; seeds with moved death day: 5/8; instrument errors A=0 B=0`. 53004/53006/53008 match the healed endpoint on days and seat; 53001/53003 die earlier than both endpoints; 53005 dies exactly as collapsed while the healed endpoint sits it d99; 53002 sits d90 but dies d139, one day short of the healed endpoint's 140d.

| Seed | Healed days | Mid14 days | Δ | Healed seat/sat | Mid14 seat/sat | Healed stand | Mid14 stand | Healed w4 | Mid14 w4 |
|---|---|---|---|---|---|---|---|---|---|
| 53001 | 105 | 67 | −38 | — | — | 275 | 199 | 5 | 2 |
| 53002 | 140 | 139 | −1 | — | lesser d90 | 199 | 100 | 1 | 0 |
| 53003 | 65 | 45 | −20 | — | — | 199 | 84 | 1 | 0 |
| 53004 | 150 | 150 | 0 | lesser d90 | lesser d90 | 199 | 199 | 3 | 9 |
| 53005 | 150 | 54 | −96 | lesser d99 | — | 199 | 199 | 2 | 1 |
| 53006 | 150 | 150 | 0 | lesser d90 | lesser d90 | 199 | 675 | 3 | 11 |
| 53007 | 50 | 59 | +9 | — | — | 75 | 134 | 0 | 0 |
| 53008 | 150 | 150 | 0 | lesser d97 | lesser d141 | 199 | 199 | 3 | 1 |

## What this means for the bisect

#14 moves exactly **one** seed against #9: 53002, 150d → 139d. The other seven seeds are identical to #9 on days, seat, and standing — 53001/53003/53005/53007 on the same death days, 53004/53006/53008 on the same survival+sit. The alien expansion therefore contributes no healing step of its own: the #9→#14 interval (landings #10 betrayal softlock, #11 mantle language arc, #12 opener-skip, #13 version bump, #14 alien expansion) nets to a 5.5-day median *loss* on the one seed it touches. The remaining climb — 53001 67d → 105d, 53002 139d → 140d (and surviving, not just sitting), 53003 45d → 65d, 53005 54d → 150d, 53007 59d → 50d (already past the healed endpoint on days, but it never sits anywhere) — must come from #15..#17, or from a combination. The next midpoint is **#16 `685dc9ec4`** (pellet pass — the pellet moves to hungrier hands at dawn), the midpoint of the #14..#17 half and the strongest a-priori candidate for the remaining climb, since the control analysis showed the healing signature is starvation disappearing (7 → 0) and the pellet pass directly moves food to hungry hands. #15 (`e6ddaf32a`, specialist first rung 10 → 5 XP) sits between #14 and #16 in the same interval; if #16 reads HEALED the flip is in #15..#16 and #15 is the next screen.

Per-seed healer map (full-8, #8/#9/#14):
- 53004 heals at #8, stays healed at #9 and #14 (150d, lesser d90 throughout).
- 53006 heals at #8, overshoots at #9 and #14 identically (150d, lesser d90, standing 675, 8 wave-5 kills).
- 53008 heals at #9, stays healed at #14 (150d, lesser d141 both).
- 53002 heals at #9 only (150d, lesser d90); at #14 it sits d90 but dies d139.
- 53001 survives at #8 (150d, no seat), dies 67d at #9 and #14.
- 53003 lives longest at #8 (108d), dies 45d at #9 and #14.
- 53007 never heals; best 63d (collapsed / #8), 59d at #9 and #14.
- 53005 never heals anywhere in #1..#14; exactly collapsed at #5, #7, #8, #9, and #14.

There is still no single healer landing in #1..#14. The prereg's COMBINATION clause governs: the minimal flipping set must be named and proven by construction once #15..#17 are mapped; this run does not attempt it.

## 53005 reading

53005 stays exactly collapsed at #14 (54d; fallen list identical to the collapsed control day/name/cause with wall-clock villagerIds stripped — Robin ambushed d13, Joshua killed by The Callback d26, Cheryl lost in the wild d29, Caleb dead in combat d36, Desmond dies of a wound that won't close d39, Patrick of sickness d43, Aki to a monster d48, then five villagers starve on d50–51, Brian dies in combat d52, village gone d54). It is now exactly collapsed at every screened point (#5, #7, #8, #9, #14). Its healer, if any single landing heals it, sits in #15..#17, or the full heal is a combination. Do not declare the healer found on any screen that leaves 53005 collapsed.

## Mechanism — what the alien expansion does, and what it does not do

The #14 landing touches only `src/data/alienPlayers.json` (roster 8 → 12) and `src/js/alienPlayers.js` (four new personas + `meddlerMoves` wired into `apContestInterference`, verdict-only per canon). Verdict-only contest meddling should not move village survival — and on seven of eight seeds it does not move a single day. The two trajectory differences it does produce are both RNG-reshuffle signatures, not mechanism:

- **53002** gains the seat (lesser d90; the healed control never sat it) but loses the village at d139 — arena deaths d116/d128 and a stranger d129 after sitting. It dies one day short of the healed endpoint's 140d, seated where the endpoint was unseated. A reshuffle that trades survival for a seat, not a heal.
- **53004** keeps its exact healed shape (150d, lesser d90, standing 199) but kills **9 wave-4 monsters** instead of 3 (influencer d46, congregation d50/d55, eater d57, strike d85/d86/d91/d112, eulogy d118 — all via the player channel in the kill log). Same village, same seat, same standing, three times the wave-4 kills: the new meddlers' contest draws change which fights the scholar walks into, and this village walks into more of them and wins. It is not a survival change — the village already survived — but it shows the expansion is not trajectory-neutral even where the headline numbers do not move.

53006's wave-5 overshoot is unchanged from #9 (8 wave-5 kills, same mids: editor ×3, spoiler, network_note, rerun, timeslot ×2; standing 675; end-state `readiness5` still reads veterans 0, short of the 2 demanded — the open readiness question from #9, still open, logged in the findings backlog).

Death-cause census, mid14 full-8 (fallen counts from the corpora): 'the wild' dominates the early deaths on the five lost villages; starvation appears only in 53005 (5 deaths, d50–51) — the same single-village starvation signature as #9. The healed control's starvation-0 shape is still not reached: the band starves in exactly one village, and it is always the same one.

## Village assessment — what the villages looked like

Three villages out of eight live out the 150 days at #14, and all three sit down at the lesser table; a fourth (53002) sits and then dies anyway, eleven days short of the horizon. The other four die on the same schedule the collapse always used. Nothing about the villages' daily life changes at #14 — no new face at the table, no new kind of death, no village that was starving now eating. The four new alien meddlers are visible only in the contest margins: a seat gained here, a fight won there, a village that kills nine wave-4 monsters instead of three and still ends the run in exactly the same place. The expansion is a cast change in the audience, not a change in the village's fortunes.

Sense-check: sit days read from `takeseatStats.seatDay` (taken day), not the daily `tableSeat()` rows — 53005's corpus shows `seatDays.lesser: 20` with `tsTaken: 0`, i.e. the table *priced* a lesser seat from d36 but nobody ever took it; it counts as no sit, correctly. 53002's sit (d90) followed by village loss (d139) is the first seated-then-lost seed in the staircase — the seat is not a survival guarantee, and the median (not the sits) is what keeps #14 AMBIGUOUS. No dialogue in these corpora reads robotic on its face; the death lists cohere with #9 where the seeds did not move.

## Wall numbers (mid14, full 8)

- National 0/8, table sits 4/8 (lesser only), wins 0/8 (baseline leg never walks a door).
- Wave-4 unlocks 8/8, wave-5 unlocks 1/8 (53006 only — standing 675, 8 w5 kills).
- Median survival 103d; max 150d; min 45d.
- Telemetry deviation check: not run — DIAG screen, no lever before/after; the classification is the validity check.

## Method note

- CANON.md read first; alien-expansion canon is `docs/ALIEN-PLAYERS.md` (roster 8 → 12, meddlers not contestants, verdict-only `meddlerMoves`).
- Flap probes passed before the amendment commit (10:38:22Z), before extraction, before the smoke (10:39:46Z), and before the full sweep (10:41:09Z). No flap observed this run.
- Worktree heartbeat landed (exit 0, 10:38Z) — unlike the 0530Z/0830Z runs where it hung.
- Old code extracted read-only with a single `git archive 2bc17d793 src scripts index.html manifest.json version.json | tar -x -C scratch-2bc17d793/` (after `mkdir -p`; tar requires the target dir to exist — the one deviation from prior runs' single-command form). `version.json` stamp `09e57528e-20261107-233501` (the #13 bump — consistent with #14 sitting after #13). Code identity verified: scratch roster is 12 personas including Quill/Kess/Howl/Bibi; scratch `src/js/alienPlayers.js` contains `meddlerMoves` (5 refs).
- The three frozen instrument files were overwritten from branch tip `246ce6dc2` via `git show` (driver, doorwalk policy, analyzer) and verified byte-identical to the worktree tip copies. Instrument-freshness check: zero commits in `e9399e09e..HEAD` touch any instrument file and `git diff e9399e09e HEAD` on them is empty — the frozen copies are byte-identical to the ones used by the #5/#7/#8/#9 runs.
- Require closure verified BEFORE the smoke: 18 files (driver + the 5 REPO-joined requires + their transitive set, including `stageally-instrument-20261106`, `bankkiller-instrument-20261105`, `killerdeath-instrument-20261105`, `competent`, `idle`, `vinebank`, `snareteach`, `conversation-pages`, `competent-feastdrive-b`, `competent-linkdrive-b`), none missing. The full `src`+`scripts` archive includes the closure by construction; the smoke passed on the first try (0 errors).
- Anchor reads `246ce6dc22f13` (the worktree tip) in every corpus JSON. The SHA under test is recorded here (`2bc17d793`), not inferred from the anchor.
- The safe-commit index clobber hit the Amendment B commit (file shown as D + ?? after a correct commit `af93aa2df`); repaired via HEAD-blob cacheinfo, hashes verified, status clean — same class as the 0530Z run.
- Scratch dir `scratch-2bc17d793/` left untracked in the worktree (extraction of `2bc17d793`, frozen instrument copies inside it), per the #5/#7/#8/#9 precedent.

## Metric review

- The full-8 bars were applied without re-scoring: #14 meets the sits bar (4/8) and fails the median bar (103d < 120d) → AMBIGUOUS. The retired screen rule would have called it HEALED (3/4 subset reach 150d) — Amendment B, committed before any judged sweep at #14, is what prevents that false HEALED from ending the bisect. The amendment's reasoning is validated by the result: the subset that healed at #9 cannot tell #14 from #9, and the full 8 shows #14 is in fact a step back on the median.
- No metric change proposed. The median bar (≥120d) is doing real work for the third time: without it, #9 and now #14 would both be declared the healer while half the band still dies early.
- One correction to the prereg's expectation, not the metric: the prereg's bisect narrative assumes a single landing flips the whole band. At #14 the flip is still split — seven seeds identical to #9, one worse. The staircase is the verdict, not a switch, and the COMBINATION clause is now the governing shape.

## Convergence state

scale-onramp stays **converging** (NOT converged): the staircase is mapped through #14 (70.5 → 100 → 108.5 → 103 → 145d) with no single healer in #1..#14 and 53005 unhealed throughout. The next blank, in order: midpoint #16 `685dc9ec4` (pellet pass) on the full 8 — see adoption handoff.

## Adoption handoff — midpoint #16 may proceed

1. Midpoint #14 `2bc17d793` reads **AMBIGUOUS** on the full 8 (median 103d, sits 4/8). The flip is not in #10..#14 as a single landing; the remaining climb must come from #15..#17 or a combination. Next midpoint **#16 `685dc9ec4`** (pellet pass: the pellet moves to hungrier hands at dawn) on the full 8 seeds {53001..53008} per Amendment B — same driver invocation, same extraction method (this run's method note above — full archive, `mkdir -p` first, frozen instrument overwrite, 18-file closure check before smoke). If #16 HEALED → flip in #15..#16, next #15 `e6ddaf32a`; if COLLAPSED → flip in #16..#17, next #17 `b1dc80086`; if AMBIGUOUS → run #15 and #17 (the two remaining unmapped points) on the full 8 before any combination proof.
2. Carry the 53005 caveat: track 53005's days separately at every screen. If the flip interval narrows while 53005 stays collapsed, its healer is a second question or a combination — do not declare the healer found on any screen that leaves 53005 collapsed.
3. The flip point is confirmed on all 8 seeds (both bracketing commits, full sweeps) + balanced panel before any verdict, per the prereg. Budget this run: ~9.5 min total sim time for the full-8 sweep at #14 — the box is quiet; a full-8 confirm is affordable in the next window.
4. Worktree `~/workspace/worktrees/sim-healerbisect-mid14-b`, branch `sim-healerbisect-mid14-b` (tip: Amendment B `af93aa2df` + this evidence commit). Scratch dir `scratch-2bc17d793/` left untracked in the worktree (extraction of `2bc17d793`, frozen instrument copies inside it).
