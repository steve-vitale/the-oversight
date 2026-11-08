# sim-fightloop-fix-b — evidence

**Arm:** sim-fightloop-fix-b (game-code BUILD — candidate (b), hopeless-decoupling) · **Run:** fleshout-loop-b-20261108T0245Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (1) · **Findings:** #1885 · **Branch:** sim-fightloop-b, base master `c9fea16ee` (worktree HEAD == main-tree master tip at prereg time) · **Prereg:** `evidence/2026-11-07/sim-fightloop-fix-b-prereg.md` (commit `bb885b7b3`, before any judged sweep) · **Corpus:** `evidence/2026-11-07/perseed-fightloop-fix-b-baseline/` (8/8 seeds, 0 instrument errors).

## Verdict: NO-GO — reproduction gate failed at band level; the fix is NOT built and NOT judged

The premise of this arm is stale on current master. The frozen band 53001–53008 is **not collapsed** on the code this arm ran: the baseline leg (current master, retune live, no fix) gives **median 145d, sits 4/8** — against the combatdiv P2 shape the arm was built to repair (median 76d, sits 2/8) and close to the healthy C1 shape (median 150d, sits 5/8). The pre-registered GO bars (median ≥120d, sits ≥4/8) are already met by the baseline itself, so they cannot discriminate a fix: any candidate result would "pass" trivially. Per the binding prereg ("if the baseline leg fails to reproduce the collapse shape, the metric is not wrong, the base/instrument is — that is a NO-GO with cause, and the arm stops before judging the candidate"), this arm stops here. **No game-code change was made. No candidate sweep was run. No confirm band was spent** (53801–53812 stays fresh for the next arm). The fix — candidate (b) — remains unbuilt and unjudged, not killed: the mechanism it targets is still live (see below), only the band-level collapse it was meant to repair is gone.

## The two-level reproduction — the split that decides the verdict

| Level | What was checked | Result |
|---|---|---|
| Fight level (mechanism) | The 8 combatdiv root fights on current master vs the P2 numbers | **REPRODUCED EXACTLY, 8/8** — same fighter, same day, same vTaken / vHpLeft / rounds / outcome to the point |
| Band level (collapse) | Median survival, sits, on current master vs P2 (76d, 2/8) | **NOT REPRODUCED** — median 145d, sits 4/8 |

The driver and policy are unchanged since combatdiv-b (`scripts/combatdiv-20261107.js` last touched by the combatdiv instrument commit itself; `competent-doorwalk-b` untouched since the doorwalk arm), and the items blob in the baseline corpora is `a56a60af5671` — the P2 retune blob, verified. The retune is live; the instrument is the same; only the game code moved. The mechanism reproduces; the collapse does not. Something landed between the bisect (`50881fbf2`, 2026-11-05) and master `c9fea16ee` changed the downstream cascade so the villages no longer die from the thinning — the early wound is the same, the recovery is different.

## Baseline leg (current master, retune live, no fix) — the numbers

| Seed | Days | Standing | Scale | maxWave | Seat | End |
|---|---|---|---|---|---|---|
| 53001 | 105 | 275 | regional | 5 | none | village-lost |
| 53002 | 140 | 199 | regional | 4 | none | village-lost |
| 53003 | 65 | 199 | regional | 4 | none | village-lost |
| 53004 | 150 | 199 | regional | 4 | lesser d90 | survived |
| 53005 | 150 | 199 | regional | 4 | lesser d99 | survived |
| 53006 | 150 | 199 | regional | 4 | lesser d90 | survived |
| 53007 | 50 | 75 | regional | 3 | none | village-lost |
| 53008 | 150 | 199 | regional | 4 | lesser d97 | survived |

Median **145d**, sits **4/8** (all lesser, d90–d99). Against the bars: median ≥120d ✓ (already), sits ≥4/8 ✓ (already) — the bars cannot judge a fix on this band. Starvation 1 total (P2: 4). No national, no wins on either side; wave-5 unlocks 1/8 (53001), wave-4 unlocks 7/8.

## Fight-level reproduction table (mechanism still live)

Every combatdiv root fight, baseline leg on current master vs the P2 reference — identical on all 8:

| Seed | Fight | P2 reference | This baseline |
|---|---|---|---|
| 53001 | d3 Mara Vasquez vs hushwolf | vTaken 28, vHpLeft 72, vKill, 3r | 28 / 72 / vKill / 3r |
| 53002 | d4 Kieran Lorenz vs cliffhanger | vTaken 87, vHpLeft 13, vKill, 10r | 87 / 13 / vKill / 10r |
| 53003 | d4 Jorge Silva vs lockpick_raccoon | 9 / 91 / vKill / 3r | 9 / 91 / vKill / 3r |
| 53004 | d7 Nora Wilson vs anaconda_empress | 26 / 74 / vKill / 4r | 26 / 74 / vKill / 4r |
| 53005 | d5 Robin Gordon vs nightcourt | 23 / 77 / vKill / 6r | 23 / 77 / vKill / 6r |
| 53006 | d7 David ONeill vs drumbelly_tanuki | 13 / 87 / vKill / 3r | 13 / 87 / vKill / 3r |
| 53007 | d7 Diego Miranda vs nightcourt | 64 / 56 / vKill / 7r | 64 / 56 / vKill / 7r |
| 53008 | d5 Hassan Ali vs cliffhanger | 40 / 58 / vKill / 8r | 40 / 58 / vKill / 8r |

The Kieran fight's record fields say the mechanism plainly: `everHopeless: False`, `everWinning: True`, `minHpFrac: 0.13`, worn protection 5. At C1 (protection 4) the same fight read hopeless and he fled at 38 HP; at protection 5 it never looks hopeless at all — it looks *winning* — so he stays ten rounds and walks away at 13 HP. The armor is still doing exactly what the combatdiv arm said it does: it changes the decision, not just the damage. That decision is still live in the code. What changed is what happens *after*: the village that used to thin out and starve now absorbs the same early wounds and recovers.

## Village assessment — what the villages looked like

Death-cause census (all 8 seeds, 96 fallen — P2 had 89, C1 had 95, so the death count barely moved): 'the wild' 39, monster 16, sickness 9, "a wound that wouldn't close" 6, the arena 5, combat 4, contest 4, ambush 4, betrayal 2, 'a stranger' 2, the night 2, the expedition 1, The Callback 1, **starvation 1** (P2: 4). First deaths run d9–d40 (53002 and 53006 lose someone on day 9, as P2 did). The villages still bleed people at about the P2 rate — the difference is the endgame: at P2 the thinning compounded into starvation and the village folded; here four villages hold 150 days and sit at the lesser table on d90–d99 while still losing a dozen people each. In plain words: Haven takes the same early knocks, its fighters still stay in fights too long on better armor, and this time there are enough hands left in the second month to keep the garden weeded and the pantry full. The wound is the same; the recovery is what healed.

## What healed the band — unidentified (open, next arm)

Intervening landings between the bisect and `c9fea16ee` that touch the downstream cascade (from `git log --since 2026-11-07 -- src/js/`): the journey-crisis betrayal softlock fix (`d6b3c6d0b`), the specialist-ladder fix — foodXp buys skill from zero, village work grants foodXp (`4e6fa44ab`), the committed-finish for beasts met below their break line (`8a4ce0eab`, finishersize), the patrol deed (`7943fd58a`), the PLENTY-WEEK revert (`820b6146d`, net zero vs master), and the finishLog instrument (`37fc7489b`). Which of these — or what combination — lets the villages recover is **not established by this arm**; attributing it needs a bisect between the P2 construction and `c9fea16ee`, which is a DIAG arm of its own. Do not credit any single landing on this evidence. The honest statement is: the collapse is gone on current master, the mechanism is not, and the healer is unknown.

## Sense-test: the 53002 Kieran fight, read as a fight

The log ends: "R10: the man in his 30s strikes for 11 (0 left)" / "The lead falls — the pack's coordination shatters. The rest scatter or die." He kills the cliffhanger and walks away at 13 HP — and the record says the fight *never looked hopeless to him*, it looked winning. That reads like a person misjudging a fight because the blows hurt less than they should have: each hit stung less, so the shape of the fight never turned legible to him, and he stayed four rounds past the point where the less-armored version of himself ran. The decision is the story here, not the numbers — which is why the fix was aimed at the decision. The fight still reads that way on current master. It just no longer kills the village.

## Scale-wall numbers (baseline leg)

National 0/8, table sits 4/8 (lesser only), wins 0/8, wave-4 unlocks 7/8, wave-5 unlocks 1/8, median survival 145d. No village reaches national on this band; no win (baseline leg never walks a door). The wall moved since the bisect without this arm touching it: sits 2/8 → 4/8, median 76d → 145d, wave-5 unlocks 1/8 (unchanged).

## What was NOT done, and why (per the binding prereg)

- **The fix was not implemented.** The prereg's reproduction gate failed at band level; implementing and sweeping a candidate would be judging it against bars the baseline already passes — a verdict that could not discriminate. No `src/js` file was modified; `git diff HEAD -- src/` is empty.
- **No candidate sweep, no panel compare.** The §15 panel compare needs a before/after pair; with no candidate there is no after. The proof test (`scripts/test-fightloop-fix-b.js`) was not written — it tests the fix, and there is no fix to test. Writing it against unfixed code would have been a fixture with no subject.
- **No confirm band spent.** 53801–53812 was verified fresh (zero hits in all `sim-*-prereg.md` and all `sim-*.md`; 53201–53212 and 53701–53712 recorded as used) and remains fresh.
- **No tracker update by this arm beyond this evidence file** — the coordinator updates the tracker; the recommendation below is the handoff.

## Metric review

- The pre-registered bars held without re-scoring: the reproduction gate is a band-level bar (median ~76d, sits ~2/8), and it failed — recorded as NO-GO with cause, not re-scored against the fight-level reproduction, which is a different level of evidence. No friendlier metric was consulted. The GO bars themselves were never applied to a candidate because there is no candidate.
- One correction to the prereg's expectation, not the metric: the prereg assumed the baseline would reproduce the collapse and the fight-level check was only a diagnostic. In fact the two levels split — fight-level exact, band-level gone. The prereg's gate as written (band-level) is what binds, and it failed; the split is the finding, recorded here, not a reason to re-judge.
- The cost bars (starvation ≤ control+2, median ≥0.8× control) were never evaluated against a candidate; the baseline's own starvation count (1) is recorded above for the next arm's control.

## Convergence state

scale-onramp stays **converging** (NOT converged): the frozen band is healthy on current master, but the mechanism that collapsed it — protection feeding the flee/hopeless decision — is still live in the code, and the landing that healed the band is unidentified. The next blanks, in order: (1) a DIAG bisect between the P2 construction and `c9fea16ee` to name what healed the band (so the next fix arm knows whether the healing is load-bearing or accidental); (2) the fight-loop fix (candidate (b)) re-pointed at a band where the collapse is still live on current master, or re-scoped as a mechanism change judged on the fight-level property (decision invariant to protection; the 53002 fight returning to the C1 shape) with band survival as a secondary non-inferiority bar; (3) the XP-half early-death probe (P1's 3/8), still open.

**Ready to merge, pending ship:** branch `sim-fightloop-b` at the evidence commit (see report). NOTHING merged — report ready-to-merge; the coordinator lands it. No game-code trace on the branch: prereg + baseline corpus + this evidence only.
