# sim-fightloop-b — fight-loop fix candidate (b), hopeless-decoupling (evidence)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261108T1230Z, axis
scale-onramp / winnability chain (converging, NOT converged). Worker tree:
~/workspace/worktrees/sim-fightloop2-b, branch sim-fightloop2-b.
**Adoption note (coordinator, run fleshout-loop-b-20261108T1530Z): the
1230Z run died by cron timeout before closeout. This evidence file was
written by the adopting coordinator from the worker's timeout report
(recovered verbatim from the worker session transcript,
agent-b4672d4b-2fe7-4a7d-a9b5-6fe15bd83568, message seq 492) plus
independent coordinator verification of every cited number against the
committed corpora below (sits, starvation, medians, all 8 root fights,
proof-test re-runs on the reverted tree). Nothing below is taken on the
worker's word alone where a corpus read could check it.**

Substrate: worktree rebased onto master `715c2918d` at run start
(journey-deepening r119, instrument-only). Baseline leg = unfixed
worktree; candidate leg = same worktree + the fix. Policy: competent
doorwalk leg (`scripts/policies/competent-doorwalk-b`, TAKESEAT_B=1,
door drive off), 150d death-aware. Seeds: 53001–53008, FROZEN — the
bisect's diagnostic band, reused deliberately. Confirm band 53801–53812
re-verified fresh (639 preregs + all evidence `.md` searched; only the
0245Z reservation and a darkwit citation hit) and **NOT spent**.

Full pre-registration (binding): evidence/2026-11-08/sim-fightloop-b-prereg.md.

## The question (re-scoped)

Does decoupling the field-fight hopeless/flee evaluation from mitigated
per-hit damage restore the C1 fight shape? The 0245Z run
(`evidence/2026-11-07/sim-fightloop-fix-b.md`, NO-GO) stopped before
judging because its band bars could not discriminate on current master:
the frozen band is healthy on the baseline leg (median 145d, sits 4/8 on
the 0245Z base — the pre-registered GO bars already met by the baseline).
The mechanism the fix targets is still live: all 8 combatdiv root
fights reproduce EXACTLY on current master, including the 53002 Kieran
day-4 fight at protection 5 never looking hopeless, staying 10 rounds,
killing at 13 HP. Per the 1030Z tracker blank (1), this arm is re-scoped
as a mechanism change judged on the **fight-level property** (the decision
invariant to protection; the 53002 fight returning to the C1 shape) with
band survival as a **secondary non-inferiority bar**. The old band bars
(median ≥120d, sits ≥4/8 as GO) cannot judge a fix on a healthy band and
are NOT reused as GO bars here.

## The fix — candidate (b), exact construction (unchanged from the 0245Z prereg)

In `src/js/fieldFights.js` only, in the `fieldFight` morale block: track
a parallel accumulator of **unmitigated incoming damage** (the
monster-phase `total` as it stands before the `armorReduction` block —
after board/ability modifiers but before armor absorption, `wornDamage`
(shawl avoidance), unbreakable brace, and shield wall). Lead hits
accumulate into `rec.vTakenRaw`; ally hits into `rec.allyTakenRaw`
(leech share split at the mitigated ratio, so the party raw total is
exactly the raw incoming). The current-ally raw total resets when a new
ally is called in. The morale trajectory read uses the raw totals: solo
`mDpr = rec.vTakenRaw / round`; party variant
`rtd = (vHp + allyHp) / ((rec.vTakenRaw + currentAllyRaw) / round)`.
`hopeless = rtd < rtk * 0.85` and `winning = rtk <= rtd * 1.1` unchanged
in form — only their incoming-damage input changes. NOTHING else
changes: `rec.vTaken` (actual damage taken), HP, settlement
(`hurtVillager`/`sealDamageResult`), narration, the floor flee, the
committed-finish hold, trick holds, war cry / rally, and all round caps
are byte-identical in behavior. No RNG draws added or removed, so
baseline and candidate share the same RNG stream until the first morale
decision differs. Player turn-based fight paths are NOT touched.

**Disposition: the fix was built, measured, judged NO-GO, and REVERTED.
It leaves no game-code trace. This branch carries prereg + instruments +
evidence + corpora + panels only. The fix branch is abandoned; the
coordinator must NOT merge any fieldFights.js change from it.**

## Results

### Baseline leg (unfixed, 8/8 seeds, 0 instrument errors)

`evidence/2026-11-08/perseed-fightloop-b-baseline/`. Root fights
reproduce P2 **exactly 8/8** (53002 Kieran: 10r, vKill, 87 taken, 13 HP
left, never hopeless). Band: median 133.5d, sits 7/8 (takeseatStats.
seatTaken), starvation 3 (fallen-cause count: 53005 ×2, 53008 ×1). New
master is healthier than the 0245Z baseline (145d, sits 4/8) — the r119
Standing-ladder fields now appear in the corpora.

### Candidate leg (fixed, 8/8 seeds, 0 instrument errors)

`evidence/2026-11-08/perseed-fightloop-b-candidate/`. Band: median
150d, sits 5/8, starvation 4 (53002 ×3, 53004 ×1 — no same-seed
same-day matches with baseline, so arm-only starvation is also 4).

### Primary (a) — the 53002 Kieran day-4 fight: MISSED

| | outcome | rounds | vTaken | vTakenRaw | HP left | fleeHopeless |
|---|---|---|---|---|---|---|
| Baseline (P2) | vKill | 10 | 87 | — | 13 | false |
| Candidate | vFlee | 2 | 18 | 33 | 82 | true |
| Bar (C1 shape) | vFlee + fleeHopeless | 5–7 | — | — | 30–45 | true |

The candidate flees with the right label but at the wrong moment: the
raw read makes the fight look hopeless from round 2 — it judges the
fight as if the fighter wore no armor, harsher than C1's protection-4
judgment. It creates a **third shape** (flee at first sight), not a C1
restoration. Full test: 26 passed, 2 failed on the fixed tree (those 2
= this miss).

### Primary (b) — unit leg (decision invariant to protection): PASSED 8/8

Same scripted field fight at worn-protection 3 vs 5 gives an identical
outcome/rounds/fleeHopeless (`vFlee` 2r, hopeless), vTaken differs (22
vs 18), vTakenRaw identical (34) and > vTaken on both. The decoupling
itself works exactly as designed — the miss is in what the decoupled
judgment DOES to the 53002 fight, not in whether the decoupling holds.

### Primary (c) — all 8 root fights, baseline vs candidate (reporting bar)

| Seed | Fight | Baseline | Candidate |
|---|---|---|---|
| 53001 | Mara Vasquez vs hushwolf, d3 | vKill 3r, 28 taken, 72 HP | vKill 3r, 28 taken, 72 HP (raw 107) |
| 53002 | Kieran Lorenz vs cliffhanger, d4 | vKill 10r, 87 taken, 13 HP | **vFlee 2r, 18 taken, 82 HP, hopeless** |
| 53003 | Jorge Silva vs lockpick_raccoon, d4 | vKill 3r, 9 taken, 91 HP | vKill 3r, 9 taken, 91 HP (raw 33) |
| 53004 | Nora Wilson vs anaconda_empress, d7 | vKill 4r, 26 taken, 74 HP | vKill 4r, 26 taken, 74 HP (raw 66) |
| 53005 | Robin Gordon vs nightcourt, d5 | vKill 6r, 23 taken, 77 HP | vKill 4r, 11 taken, 89 HP, everHopeless |
| 53006 | David ONeill vs drumbelly_tanuki, d7 | vKill 3r, 13 taken, 87 HP | vKill 3r, 13 taken, 87 HP (raw 32) |
| 53007 | Diego Miranda vs nightcourt, d7 | vKill 7r, 64 taken, 56 HP | vKill 7r, 64 taken, 56 HP (raw 104) |
| 53008 | Hassan Ali vs cliffhanger, d5 | vKill 8r, 40 taken, 58 HP | vKill 8r, 40 taken, 58 HP (raw 106) |

7/8 shapes unchanged in outcome/rounds/HP; 53002 flips to the early
flee; 53005 shortens 6r→4r via a hopeless-read shout (everHopeless
true on candidate, outcome still vKill). Raw totals are recorded on
every candidate fight (baseline: null — the fields do not exist
unfixed), and raw always exceeds mitigated taken, as the construction
requires.

### Secondary — frozen-band non-inferiority: MISSED on sits

- Median 150d ≥ 0.8 × 133.5 (= 106.8) — PASS.
- Sits 5/8 vs bar ≥ control−1 = 6 — **FAIL**.
- Starvation totals 4 ≤ 5 (control 3 + 2) — PASS; arm-only 4 ≤ 5 — PASS.
- Scale wall (per leg): baseline national 0/8, wave-5 reach 4/8,
  median 133.5d; candidate national 0/8, wave-5 reach 2/8, median
  150d. The candidate keeps villages alive longer (median +16.5d) but
  fewer take seats (7/8 → 5/8) and fewer reach wave 5 (4/8 → 2/8):
  the early flees trade seat-taking for survival.

### Panel (§15)

`evidence/2026-11-08/fightloop-b-panel-before/` (32 cases),
`evidence/2026-11-08/fightloop-b-panel-after/` (32 cases),
compare `evidence/2026-11-08/fightloop-b-panel-compare.md` —
decision **review_required** (screen only). Watches: capable table wins
0.875 → 1.0; risk-aware player deaths/run 8.5 → 10.875
(regression_watch); socialite hydration regression_signal; player
named-class access 0.875 → 0.625 on capable and risk-aware
(regression_watch). The panel is the instrument; the pre-registered GO
bars above are the judge — and they already miss on two bars, so the
panel does not rescue or overturn anything.

### Proof

`scripts/test-fightloop-fix-b.js` — on the FIXED tree: **26 passed, 2
failed** (the 2 = the 53002 C1-shape miss; unit leg 8/8 green). On the
REVERTED (unfixed) tree, re-run by the adopting coordinator:
**20 passed, 8 failed** — the 6 unit-leg failures are the instrument
working as designed (it fails on unfixed code: P3 vFlee 2r vs P5 vKill
8r, vTakenRaw null), and the same 2 53002 legs fail (they read the
corpora, not live code). The test file stays on this branch as the
proof instrument; it is NOT on the green list and `check.js --quick`
does not run it, so merging this branch does not break the suite.

### No-regression (check.js --quick)

- First full run on the fixed tree: **288 passed, 6 failed**
  (failure identities not recorded by the worker — a gap, stated here).
- Re-run to file on the fixed tree (finished after the worker's timeout
  report; log `/tmp/check-quick-fixed-full.log`): **285 passed, 9
  failed in 1163s**. The 9: test-measurement-proof-update.js,
  test-measurement-workflow.js (retained neutrality proof covers current
  inputs), test-mobile-combat-cadence.js (Continue wraps the announced
  round a second time), test-occupation-panels.js (real CLI workflow),
  test-measurement-cache-flags.js (cache-flag isolation),
  test-phone-frame-proof.js (retained browser inputs stale),
  test-trust-observer-neutrality.js (TIMEOUT 120s),
  test-capable-bot-20261014.js (TIMEOUT 120s),
  test-establishment-r20-fixes-20261020.js (racks-full voice gate:
  next-day voices once more, expected 2 got 1).
- Attribution (coordinator): the two 120s timeouts are load flakiness
  under sibling load. The proof-update/workflow pair is the stale-proof
  class (this tree's base 715c2918d predates Loop A's neutral-proof
  refresh d80f972a2). Phone-frame is the stale phone-receipt class.
  Cache-flags, occupation-panels, and establishment-r20 touch no
  fieldFights path (harness cache identity, CLI workflow, racks voice)
  and are recorded as unattributed-but-unrelated, not as fix-caused.
- **Combat-area item resolved by the coordinator:** the worker flagged
  test-mobile-combat-cadence.js as the one to treat with most caution.
  Re-run on the REVERTED (unfixed) tree: **13 passed, 2 failed** — the
  SAME two failures ("enemy is announced before its action runs" and
  "Continue does not wrap the announced round a second time") as on the
  fixed tree. The failure is pre-existing on unfixed code; the fix
  causes zero new failures there.
- The 4 fight-area check failures are byte-identical on unfixed and
  fixed trees (worker verification: inffight 3, inffight-class 4,
  break-monsters3-fieldfights 2, zombie-fight `Text is not defined`
  harness error).

## Verdict

**NO-GO** — primary (a) missed (2r/82 HP vs 5–7r/30–45 HP) AND
secondary sits missed (5/8 vs ≥6/8). Two binding bars missed. No
confirm band spent (53801–53812 stays fresh). No landing — the fix is
reverted and leaves no game-code trace. Per §14, never re-scored
against a friendlier metric mid-run.

Kill classification (§14a): **CONCEPT-DEAD as scoped, not
METRIC-BROKEN.** The decoupling mechanism works (unit leg 8/8), but
the decoupled judgment itself over-flees: reading fully raw incoming
is harsher than the C1 judgment it was meant to restore. Candidate
(b) as built is the wrong shape — a middle shape (partial mitigation
in the judgment, or the C1 protection-4 value) is a NEW arm with its
own pre-registration, not a tuning pass on this one. The 53002 fight
is the decisive exhibit: the fix must make Kieran stay six rounds,
not two.

## Metric review

- The re-scope held: the fight-level primary discriminated where the
  old band bars could not (baseline already met median/sits GO on a
  healthy band), and the secondary non-inferiority bar caught the
  sits cost the primary alone would have missed. No re-scoring was
  available or used.
- The unit leg's fixed-code prediction (both legs `vFlee` ~2 rounds)
  was a prediction, not a second bar — the bar was identity of outcome
  across protections, which passed. The 53002 leg (C1 shape) was the
  decisive bar and it failed.
- The `finalSeat` vs `takeseatStats` gap is unresolved but immaterial
  to the verdict: 53004's `finalSeat` prices "lesser" while it never
  took a seat (died d100 baseline / d52 candidate). "Sits" throughout
  means `takeseatStats.seatTaken`, matching the 0245Z table.
- First-run check identities (288/6) were not recorded by the worker;
  the re-run (285/9) is fully listed above. The 6→9 delta is not
  attributed beyond the two 120s timeouts (load flakiness).

## Sense (SENSE-TESTING LAW)

On the candidate leg Kieran runs at round 2 with 82 HP — he reads the
cliffhanger as hopeless the moment its blows land unsoftened by armor
in his judgment, and walks away from a fight the less-armored version
of himself would have stayed in for six rounds. The decision now
over-flees rather than under-flees. In plain words: the fix tells the
fighter to ignore his armor when deciding whether he can win — and a
fighter who ignores his armor thinks every hard fight is lost before
it starts. The C1 fighter judged with protection 4 in mind and stayed
six rounds; the candidate judges with protection 0 and leaves after
two. The village assessment follows: villages live longer (the
fighters come home) but fewer take seats and fewer reach wave 5 — the
fix buys survival with the very boldness the win chain needs.

## Village assessment in plain words

Eight villages, same eight as before, with one change in how fighters
judge a fight. The villages lived longer — a median of 150 days
instead of 133.5, and three villages that died before day 100 on the
baseline (53002, 53004, 53006) still died, only sooner or later in
different patterns (53002 died day 69 instead of surviving; 53004 day
52 instead of 100; 53006 day 68 instead of 94 — the early flees did
not save the villages that were already failing). The villages that
survived still never got near national, the table, or a win — the
scale wall stands untouched by this arm, as expected; a fight-judgment
change does not build a nation. What changed: fighters walk away
earlier, so fewer die in the field, but the village also takes fewer
seats (5 of 8 instead of 7) — the boldness that wins seats is the
same boldness that gets fighters killed, and this fix spent it.

## Blanks filled or documented

- FILLED (measured): candidate (b) judged NO-GO on its binding bars —
  the hopeless-decoupling shape is killed as scoped; the 53002 fight
  is the exhibit.
- FILLED (measured): the unit-leg instrument proves the decoupling
  itself works; the failure is in the judgment shape, not the wiring.
- DOCUMENTED (not built): a middle-shape judgment (partial mitigation
  in the morale read, or the C1 protection-4 value) is the named next
  arm — see sim-findings.md (coordinator append).
- DOCUMENTED: 53005 shortens 6r→4r via a hopeless-read shout with
  everHopeless true — the raw read moves fights that do not flip.
- DOCUMENTED: `finalSeat` vs `takeseatStats` gap (53004 prices a
  lesser seat it never took).

## Findings for the backlog (coordinator appends — this worker does NOT edit sim-findings.md)

(to be appended by the coordinator at closeout)

## Convergence

scale-onramp stays converging (NOT converged): the fight-loop fix
candidate (b) is killed as scoped, the frozen band is healthy on
current master, the full seat is still unreached (0 everywhere this
run), wins still come only through the lesser seat, wave 5 is 2–4/8 on
the frozen band. food-economy stays converging (untouched; sibling
Loop A live at closeout — medicduty landed on master d910dc6da by the
1515Z closeout run; the 1315Z closeout itself is live Loop A work, NOT
touched by this run).
Claim deleted; lock deleted. Evidence: this file (commit: see footer).

## Footer (coordinator adoption)

- Worker verdict recovered from the timeout report + session
  transcript (see Adoption note). Corpora, panels, sits/starvation/
  medians, all 8 root fights, and both proof-test runs verified
  independently by the adopting coordinator on the reverted tree.
- Branch sim-fightloop2-b: prereg + instruments (a7b6b34a4) + this
  evidence + both corpora + both panels + compare. Zero src/js diff
  after the revert (verified `git diff HEAD -- src/` empty).
- Rebase onto explicit master SHA (see coordinator round evidence),
  proof re-run on the rebased tip, merged --ff-only (see round
  evidence for the merge commit).
