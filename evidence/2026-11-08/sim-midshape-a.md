# sim-midshape-a — the middle shape: protection-4 judgment (evidence)

Run: oversight-flesh-out-loop, run fleshout-20261108T1622Z, axis
scale-onramp / winnability chain (converging, NOT converged). Worker tree:
~/workspace/worktrees/sim-midshape-a, branch sim-midshape-a.
**Verdict: NO-GO — the middle shape is killed as scoped.** The 53002
Kieran day-4 fight does not move at all on the candidate leg (byte-identical
to baseline: vKill, 10 rounds, 87 taken, 13 HP), and the unit leg splits by
protection (P3 flees at round 3 on the floor, P5 kills at round 8). Two
binding primary bars missed. No confirm band spent (53801–53812 stays
fresh). The fix is reverted and leaves no game-code trace.

Substrate: worktree rebased onto explicit master `6680d7924e46911a963e3ad8dd06ab5e28f128c3`
at run start (pellet-boost landed; rebase clean, no stop-at-pick quirk).
Baseline leg = unfixed worktree; candidate leg = same worktree + the fix.
Policy: competent doorwalk leg (`scripts/policies/competent-doorwalk-b`,
TAKESEAT_B=1, door drive off), 150d death-aware. Seeds: 53001–53008, FROZEN
— the bisect's diagnostic band, reused deliberately. Confirm band 53801–53812
re-verified fresh (see prereg) and **NOT spent**.

Full pre-registration (binding): evidence/2026-11-08/sim-midshape-a-prereg.md.

## The question

Does judging the field-fight hopeless/flee trajectory on incoming damage
mitigated **as if protection were 4** (fixed) restore the C1 fight shape?
Candidate (b) (sim-fightloop-b, NO-GO) read fully raw (protection 0) and
over-fled: the 53002 Kieran day-4 fight fled at 2 rounds / 82 HP instead of
the C1 shape (5–7 rounds, 30–45 HP). Live code reads fully mitigated
(protection 5 on Kieran) and never flees. Judge at 4: the C1 value the 53002
fight was won under. This arm is the named next arm from the fightloop-b
evidence — NOT the blend variant (partial mitigation), which is a different
arm and was not substituted.

## The fix — exact construction (as preregistered; implemented cleanly)

In `src/js/fieldFights.js` only, in the `fieldFight` morale path: a parallel
accumulator of **protection-4 incoming damage** — the monster-phase `total`
after board/ability modifiers but before armor absorption, with
`this.armorReduction(4, pierce)` applied in place of the worn value (same
`min(total - 1, round(total * r))` clamp), regardless of actual
`varmor`/`allyArmor` (even 0). `wornDamage` (shawl avoidance), unbreakable
brace, and shield wall are NOT applied to the P4 total (the (b) raw read's
exclusions), and no RNG draw is made. Lead hits accumulate into
`rec.vTakenP4`; ally hits into `rec.allyTakenP4` (leech share split at the
mitigated ratio, so the party P4 total is exactly the P4 incoming); the
current-ally P4 total resets when a new ally is called in. The morale read
uses the P4 totals: solo `mDpr = rec.vTakenP4 / round`; party variant `rtd
= (vHp + allyHp) / max(1, (rec.vTakenP4 + rec.allyTakenP4) / round)`.
`hopeless` and `winning` unchanged in form. NOTHING else changes: actual
`rec.vTaken`, HP, settlement, narration, floor flee, committed-finish hold,
trick holds, war cry / rally, round caps — byte-identical in behavior. No
RNG draws added or removed. Player turn-based fight paths NOT touched.

The armor curve (`armorReduction`, pierce 0 on the cliffhanger): the P4
judgment lands 60% of pre-armor incoming, vs 54.5% live at protection 5 and
100% under candidate (b) — a ~10% harsher denominator than live. The `vHp`
numerator in `rtd` still reads LIVE HP (protection-5 trajectory): the C1
shape came from numerator AND denominator both at protection 4, so this arm
restores only half the C1 condition. That asymmetry is the mechanism of the
miss, below.

## Reproduction note (read before the numbers)

The baseline leg does NOT reproduce all 8 of the prereg's 0245Z root fights
on this master — 4 of them no longer occur, because the frozen band's early
trajectories diverged between master `715c2918d` (fightloop-b base) and
`6680d7924` (this arm's base). Between those SHAs, medicduty landed
(`d910dc6da`: Haven Medic Duty — dawn duty ticks, **departure blocks**) and
the pellet boost landed. On this master: Mara Vasquez (53001) has 0 field
fights and dies day 6 by ambush (fightloop-b: fought a hushwolf day 3);
Nora Wilson (53004) has 0 fights and dies day 9 by ambush; David ONeill
(53006) fights 5 times but never the day-7 drumbelly_tanuki; Hassan Ali
(53008) fights twice but never the day-5 cliffhanger. The DECISIVE fight
(53002 Kieran) reproduces P2 **exactly** (10r, vKill, 87 taken, 13 HP), as
do the 53003/53005/53007 roots. The control is this run's baseline leg, not
the fightloop-b numbers, per the prereg — and the root table below reports
each seed's FIRST field fight (gseq 1) on this master, which is the
first-divergence fight in both corpora (its identity is fixed before the
first morale decision, so the candidate corpus must contain the same 8
fights; only their outcomes may move). The 53002 assertions stay as
preregistered. **Lesson for the next prereg: the band is seed-frozen, not
trajectory-frozen — re-verify root fights on the current master before
binding to them.**

## Results

### Baseline leg (unfixed, 8/8 seeds, 0 instrument errors)

`evidence/2026-11-08/perseed-midshape-a-baseline/`. Band: median 150d, sits
4/8 (`takeseatStats.seatTaken`), starvation 3 (fallen-cause count: 53002
d60 Dale ×1, 53005 d81 Roberto + Emily ×2). Scale wall: national 0/8,
wave-5 reach 3/8 (53003, 53004, 53007), wins 0. Deaths: 68 fallen total;
top causes the wild 28, monster 10, ambush 5, sickness 5, arena 4. The
`finalSeat` vs `takeseatStats` gap persists: 53001/53002/53005 price a
"lesser" final seat while `seatTaken` is 0 (same gap fightloop-b noted).

### Candidate leg (fixed, 8/8 seeds, 0 instrument errors)

`evidence/2026-11-08/perseed-midshape-a-candidate/`. Band: median 129.5d,
sits 6/8, starvation 5 (53002 d12 Kieran ×1, 53005 d50/53/54 ×3, 53006 d108
Sara ×1 — no same-seed same-day matches with baseline, so arm-only
starvation is also 5). Scale wall: national 0/8, wave-5 reach 2/8 (53002,
53003), wins 0. Deaths: 91 fallen total (+23 vs baseline); top causes the
wild 33, a wound that wouldn't close 9 (baseline 2), the phoenix link (ash)
8 (baseline 0), monster 7, sickness 7, a stranger 6, arena 6.

### Primary (a) — the 53002 Kieran day-4 fight: MISSED (no movement at all)

| | outcome | rounds | vTaken | vTakenP4 | HP left | fleeHopeless |
|---|---|---|---|---|---|---|
| Baseline (P2) | vKill | 10 | 87 | — | 13 | false |
| Candidate | vKill | 10 | 87 | 96 | 13 | false |
| Bar (C1 shape) | vFlee + fleeHopeless | 5–7 | — | — | 30–45 | true |

The candidate fight is **byte-identical** to the baseline (same tail log:
"R10: the man in his 30s strikes for 11 (0 left)"). The P4 read works as
designed — `vTakenP4` 96 > `vTaken` 87, i.e. the judgment lands 60% of the
~160 raw incoming (mDpr ≈ 9.6/round vs live 8.7) — but the trajectory never
turns hopeless: the kill comes into sight by round 8 (monster HP ~19, rtk
≈ 2.0, `winning` true) while the fighter still stands at ~30 HP. The
denominator-only nudge cannot restore a shape that came from numerator +
denominator together. Full test: the 3 C1-shape assertions fail on the fixed
tree (see Proof).

### Primary (b) — unit leg (decision invariant to protection): FAILED

Same scripted field fight (seed 53002, HP 70, sharpened_stick, cliffhanger,
`rng: () => 0.5`) at worn-protection 3 vs 5, on the FIXED tree:

| | outcome | rounds | vTaken | vTakenP4 | HP left | fleeHopeless |
|---|---|---|---|---|---|---|
| Prot 3 | vFlee | 3 | 33 | 30 | 37 | false |
| Prot 5 | vKill | 8 | 63 | 70 | 7 | false |

The P3 leg flees at round 3 **on the floor, not on hopeless**
(`everHopeless` false, `everWinning` true): at round 2 the P4 read has it
*winning* by a hair (rtd ≈ 4.8 vs rtk ≈ 5.27, `winning` = 5.27 ≤ 4.8×1.1 =
5.28 — a 0.01 margin), so the floor drops to 5%; at round 3 it is neither
winning (rtk 4.27 > rtd 3.7×1.1 = 4.07) nor hopeless (rtd 3.7 vs threshold
rtk×0.85 ≈ 3.63 — missed by 0.07), the floor returns to the fighter's
break line (~40%), and 37/100 HP is below it — the floor fires. The P5 leg
rides the winning line to the kill at 7 HP (its HP falls slower than the
monster's, so `winning` holds every round and the floor stays at 5%). The
mechanism is the prereg's predicted asymmetry, measured: the `vHp`
numerator still differs by worn protection, so a fixed-4 denominator cannot
make the decision invariant — the less-armored fighter's HP collapses into
the floor before the judgment turns hopeless, while the armored one never
leaves the winning line. The `vTakenP4`-identity assertion fails with it
(30 vs 70 — different fight lengths, so the totals necessarily differ; the
"vTakenP4 > worn-5 taken" assertion fails on the same dependence).

### Primary (c) — all 8 root fights, baseline vs candidate (reporting bar)

| Seed | Fight | Baseline | Candidate |
|---|---|---|---|
| 53001 | Declan Baumann vs hushwolf, d8 | vKill 7r, 50 taken, 70 HP | vKill 7r, 50 taken, 70 HP (P4 130) |
| 53002 | Kieran Lorenz vs cliffhanger, d4 | vKill 10r, 87 taken, 13 HP | vKill 10r, 87 taken, 13 HP (P4 96) |
| 53003 | Jorge Silva vs lockpick_raccoon, d4 | vKill 3r, 9 taken, 91 HP | vKill 3r, 9 taken, 91 HP (P4 20) |
| 53004 | David Kim vs hushwolf, d6 | vKill 4r, 45 taken, 55 HP | vKill 4r, 45 taken, 55 HP (P4 75) |
| 53005 | Robin Gordon vs nightcourt, d5 | vKill 6r, 23 taken, 77 HP | vKill 6r, 23 taken, 77 HP (P4 51) |
| 53006 | Rosa Mendez vs gallowdeer, d5 | vKill 8r, 57 taken, 43 HP | **vKill 5r, 15 taken, 85 HP, everHopeless** (P4 44, ally P4 60) |
| 53007 | Diego Miranda vs nightcourt, d7 | vKill 7r, 64 taken, 56 HP | vKill 7r, 64 taken, 56 HP (P4 64) |
| 53008 | Frank Giordano vs sanjun, d5 | vKill 6r, 22 taken, 78 HP | vKill 6r, 22 taken, 78 HP (P4 60) |

7/8 shapes byte-identical in outcome/rounds/HP; the one mover is 53006 (see
below). Two internal-consistency checks hold: on 53007 Diego wears
protection 4, and `vTakenP4` (64) equals `vTaken` (64) exactly — at worn
protection 4 the P4 read IS the live read, as the construction requires; and
on every candidate fight `vTakenP4` exceeds `vTaken` exactly where worn
protection exceeds 4, and sits below it where worn protection is below 4
(53006 Rosa wears 24: P4 44 vs taken 15 — the judgment reads far harsher
than the armor she actually wears). No root fight shows the ally-tanking
shape (finding #1461 — ally tanks everything, leader incoming exactly 0,
leader still flees): the one party fight (53006) has leader P4 44, not 0.

**The 53006 mover, in full:** Rosa Mendez (varmor 24, wb 15) vs gallowdeer,
2 allies available. On the candidate leg her P4 read turns hopeless
mid-fight (`everHopeless` true) — with help near, the hopeless branch
SHOUTS instead of fleeing: Olivia Bennett joins (`allyVid`
olivia_bennett, `allyDealt` 55), and the party kills in 5 rounds with Rosa
taking 15 (baseline: solo 8 rounds, 57 taken, 43 HP). The P4 judgment's
single visible effect on the frozen band is a faster, cheaper kill via the
shout — not a flee, and not on the fight the arm exists for.

### Secondary — frozen-band non-inferiority: PASSED (all three)

- Median 129.5d ≥ 0.8 × 150 (= 120) — PASS (barely).
- Sits 6/8 vs bar ≥ control−1 = 3 — PASS.
- Starvation totals 5 ≤ 5 (control 3 + 2) — PASS (exactly at the bar);
  arm-only 5 ≤ 5 — PASS.
- Scale wall (per leg): baseline national 0/8, wave-5 reach 3/8, median
  150d; candidate national 0/8, wave-5 reach 2/8, median 129.5d. The
  candidate takes MORE seats (6/8 vs 4/8 — the 53001/53002 villages survive
  to 150d and sit, where the baseline lost both before day 70) but lives
  shorter on the median and reaches wave 5 less: the extra sits come from
  two villages surviving longer, not from the fight judgment working.

### Panel (§15)

`evidence/2026-11-08/midshape-a-panel-before/` (32 cases),
`evidence/2026-11-08/midshape-a-panel-after/` (32 cases),
compare `evidence/2026-11-08/midshape-a-panel-compare.md` —
decision **review_required** (screen only). Watches, all leaning negative:
capable table win/entry/sitting/national 0.875 → 0.625 (regression_watch),
community loss 0.125 → 0.375; risk-aware player deaths/run 8.125 → 10.75
(regression_watch); winseek hydration regression_signal (0.0255 → 0.0555).
The panel is the instrument; the pre-registered GO bars above are the
judge — and they already miss on two primaries, so the panel does not
rescue or overturn anything. It agrees in direction: the fix costs more
than it buys at panel scale.

### Proof

`scripts/test-midshape-a.js` — on the FIXED tree: **22 passed, 7 failed**
(the 7 = the 4 unit-leg identity failures + the 3 53002 C1-shape failures;
all 16 root-presence assertions pass). On the UNFIXED tree, the unit leg
alone: **3 passed, 6 failed** (outcome/rounds/fleeHopeless diverge,
`vTakenP4` null) — the instrument fails on unfixed code as designed. The
test file stays on this branch as the proof instrument; it is NOT on the
green list and `check.js --quick` does not run it, so merging this branch
does not break the suite.

### No-regression (check.js --quick)

Two full runs on the fixed tree (sibling load high both times):

- First run: **290 passed, 10 failed in 1363s**. The tail kept only the last
  failure block: `test-establishment-r20-fixes-20261020.js` (racks-full
  voice gate: next-day voices once more, expected 2 got 1) — the same
  failure fightloop-b recorded on BOTH fixed and unfixed trees.
- Second run (full output captured to `check-quick-fixed.log`, since
  deleted after extraction): **289 passed, 11 failed in 1179s**. The 11:
  `godpath/test-measurement-proof-update.js` (exit 1, 2.6s),
  `godpath/test-measurement-workflow.js` (exit 1, 2.8s),
  `godpath/test-mobile-combat-cadence.js` (exit 1, 5.9s),
  `godpath/test-occupation-panels.js` (exit 1, 1.9s),
  `godpath/test-phone-frame-proof.js` (exit 1, 4.2s),
  `godpath/test-trust-observer-neutrality.js` (TIMEOUT 120s),
  `test-synergy-stall.js` (TIMEOUT 120s),
  `test-throttlefeast-20261014.js` (TIMEOUT 120s),
  `test-capable-bot-20261014.js` (TIMEOUT 120s),
  `test-table-endings-20261014.js` (TIMEOUT 120s),
  `test-establishment-r20-fixes-20261020.js` (exit 1, 4.4s).
- Attribution (verified on the REVERTED tree after the fix was reverted —
  the 6 deterministic failures re-run there, each by plain `node`):
  - 2 are fix-caused but MECHANICAL, stale-proof class:
    `test-measurement-proof-update.js` ("Proof source inputs are not
    current") and `test-measurement-workflow.js` ("retained neutrality
    proof covers the current Game/controller/harness inputs") — changing
    `src/js/fieldFights.js` invalidates the retained neutrality proof's
    inputs, which is the expected consequence of any game-code change
    (the proof must be refreshed with `scripts/balance-proof-update.js`
    after a source change lands). Both pass 9/9 on the reverted tree.
    No refresh is owed: the fix does NOT land, and the revert restores
    the proof's inputs exactly.
  - 4 are pre-existing, failing identically on the reverted tree:
    `test-mobile-combat-cadence.js` (same 2 failures: enemy announced
    before its action; Continue wraps the announced round a second time),
    `test-occupation-panels.js` (real CLI workflow),
    `test-phone-frame-proof.js` (stale retained browser inputs),
    `test-establishment-r20-fixes-20261020.js` (racks-full voice gate:
    next-day voices once more, expected 2 got 1).
  - The 5 timeouts are load flakiness (the set flips run to run: the first
    run timed out capable-bot + trust-observer only, and failed
    `test-measurement-cache-flags.js` instead of throttlefeast/table-endings;
    the second run timed out 5).
  **No fieldFights/combat-area failure appears in either run: the fix
  causes zero new gameplay failures.**
- The 4 fight-area check failures fightloop-b recorded as byte-identical
  on unfixed and fixed trees (inffight 3, inffight-class 4,
  break-monsters3-fieldfights 2, zombie-fight `Text is not defined`
  harness error) do not appear as failures in either run here — the quick
  list's composition moved with the master, but nothing in the combat area
  regressed.

## Verdict

**NO-GO** — primary (a) missed (53002 byte-identical to baseline: vKill 10r
87 taken 13 HP, never hopeless) AND primary (b) failed (unit legs split:
P3 vFlee 3r on the floor vs P5 vKill 8r). Two binding primary bars missed;
the secondary passes but cannot rescue a primary miss. No confirm band
spent (53801–53812 stays fresh). No landing — the fix is reverted and
leaves no game-code trace. Per §14, never re-scored against a friendlier
metric mid-run.

Kill classification (§14a): **CONCEPT-DEAD as scoped, not METRIC-BROKEN.**
The construction works exactly as designed (`vTakenP4` reads correctly on
every fight; at worn protection 4 it equals the live read; the 53006 shout
proves the judgment moves real fights) — but the judgment it implements is
the wrong shape. A denominator-only middle cannot restore a C1 shape that
came from numerator + denominator together: the fighter's live HP
trajectory still carries his worn protection, so the less-armored fighter
falls into the floor before the judgment turns hopeless and the armored one
rides the winning line to the kill. The middle shape joins candidate (b)
as killed: raw (0) over-flees, protection-4 under-flees, and the gap
between them is not a judgment value — it is the HP trajectory itself. The
named next arm is the blend variant (partial mitigation) or a
numerator-aware shape (judge on the HP trajectory as if protection were 4,
not just the incoming) — a NEW arm with its own pre-registration, not a
tuning pass on this one.

## Metric review

- The re-scope held: the fight-level primary discriminated where band bars
  could not (the secondary passes while both primaries miss — the
  non-inferiority bar alone would have called this a GO). No re-scoring was
  available or used.
- The unit leg's identity bar proved to be a genuine judgment, not a
  construction guarantee, exactly as the prereg predicted: the `vHp`
  numerator differs by worn protection, so two protections cross the
  hopeless line in different rounds — and here they do not cross it at all
  in the same way (floor vs kill). The prereg's round-by-round prediction
  (P3 hopeless at round 4, P5 at round 5) was wrong in the detail — the
  floor fired first on P3 at round 3 — but right in the shape: the legs
  split by a round, and the bar as written judges that a NO-GO.
- The `winning` read shares the `rtd` input with `hopeless`, so it moves
  with the fix too — that is the same decision input, not a second change.
  The floor flee reads live HP, not the trajectory, so it is untouched by
  design — and it is the floor, not the judgment, that decides the P3
  unit leg. That interaction (a fighter whose HP collapses into the floor
  never gets to be "hopeless") is a design note for the next arm, not a
  bar change here.
- The baseline itself moved between masters (median 150d, sits 4/8, starv 3
  vs fightloop-b's 133.5d, 7/8, 3): medicduty + pellet-boost landed in
  between. The control is this run's baseline leg, per the prereg — the
  comparison is clean on identical seeds and identical code except the fix.
- One known limit, stated before the read: the pilot reuses the frozen band
  the collapse was diagnosed on; the fresh-band confirm is what would show
  generalization. A pilot NO-GO spends no confirm band.

## Sense (SENSE-TESTING LAW)

On both legs Kieran fights the cliffhanger on day 4 and kills it in ten
rounds, taking 87 damage and standing at 13 HP — the same fight, blow for
blow, the same last line ("R10: the man in his 30s strikes for 11 (0
left)"). The protection-4 judgment watches the same blows land a little
harder in its own arithmetic (96 instead of 87) and still cannot call the
fight lost: the cliffhanger is visibly dying by round 8, and a fighter who
can see the kill coming does not run. In plain words: the fix tells the
fighter to judge the fight as if his armor were a little thinner — and a
little thinner is not enough to change his mind when the beast is already
bleeding out. The C1 fighter fled because he was actually taking the
protection-4 blows, his health falling with them; this fighter only
imagines them. The one fight the judgment does move is Rosa's, and it moves
the wrong way for the story this arm tells: she shouts, a friend charges
in, and the gallowdeer dies faster — the judgment makes her braver, not
wiser. The village assessment follows: the candidate villages take more
seats (6 of 8 instead of 4 — two villages that died young on the baseline
live to sit) but bleed more people doing it (91 dead instead of 68, wounds
that won't close 9 instead of 2) and reach wave 5 less (2 of 8 instead of
3). The scale wall stands untouched by this arm, as expected; a
fight-judgment change does not build a nation.

## Village assessment in plain words

Eight villages, same eight as before, with one change in how fighters judge
a fight. On the baseline leg, three villages die before day 90 (53001 day
69, 53002 day 60, 53005 day 89) and five live to day 150; four take seats.
On the candidate leg the two youngest deaths survive instead — 53001 and
53002 both live to 150 days and sit — but 53005 dies younger (day 54
instead of 89), 53006 dies at 109 instead of living to 150, and 53008 dies
at 61 instead of 150. The villages that live still never get near national,
the table, or a win. What changed underneath: fighters judge a little
harsher, one shouts for help and kills faster, and the villages' later
trajectories scatter — more wound-fever deaths, more starvation (5 instead
of 3), a strange run of deaths on the phoenix link (8 where the baseline had
none). At eight seeds that scatter reads as cascade noise from changed
fights, not a judged effect of the fix — but it is the direction the fix
pushes, and the panel's watches point the same way.

## Blanks filled or documented

- FILLED (measured): the middle shape judged NO-GO on its binding bars —
  the protection-4 judgment is killed as scoped; the 53002 fight is the
  exhibit (byte-identical, never hopeless).
- FILLED (measured): the unit leg proves the decision is NOT invariant to
  protection under a fixed-4 denominator — the floor, not the judgment,
  decides the less-armored leg. The asymmetry the prereg named is the
  mechanism of the miss.
- FILLED (measured): the 53006 shout — a P4-hopeless read with allies near
  shortens a fight (8r→5r, 57→15 taken) instead of fleeing it. The
  judgment's one visible effect is a faster kill, not a wiser flight.
- FILLED (measured): at worn protection 4 the P4 read equals the live read
  exactly (53007: 64 == 64) — the construction's internal consistency.
- DOCUMENTED (not built): the blend variant (partial mitigation) or a
  numerator-aware shape (judge the HP trajectory as if protection were 4)
  is the named next arm — see Findings for the backlog.
- DOCUMENTED: the frozen band is seed-frozen, not trajectory-frozen — 4/8
  prereg roots don't occur on current master (medicduty departure blocks
  and/or pellet boost moved the early trajectories). Future preregs must
  re-verify root fights on the current master.
- DOCUMENTED: `finalSeat` vs `takeseatStats` gap persists (53001/53002/
  53005 price "lesser" while `seatTaken` is 0).
- DOCUMENTED: candidate villages bleed more (91 vs 68 fallen; wound-fever
  9 vs 2; phoenix link 8 vs 0) — observed, not judged (n=8 cascade noise
  possible).

## Findings for the backlog (coordinator appends — this worker does NOT edit sim-findings.md)

- The middle shape (protection-4 judgment) is killed as scoped — next arm:
  blend variant or numerator-aware shape (this evidence).
- Frozen-band roots must be re-verified on the current master before
  binding a prereg to them — 4/8 0245Z roots don't occur on 6680d7924
  (medicduty departure blocks / pellet boost moved early trajectories).
- `finalSeat` vs `takeseatStats` gap (lesser priced, never taken) — still
  present on this master.
- The hopeless/floor interaction: a fighter whose HP collapses into the
  floor never gets to be "hopeless" — the floor decides the less-armored
  leg (unit leg, P3 round 3).
- Candidate-leg bleed (91 vs 68 fallen; wound-fever 9 vs 2; phoenix link
  8 vs 0) — watch item for the next fight-judgment arm.

## Convergence

scale-onramp stays converging (NOT converged): the middle-shape fix is
killed as scoped alongside candidate (b); the frozen band is healthy-ish on
current master (median 150d baseline, sits 4/8); the full seat is still
unreached (0 everywhere this run), wins still come only through the lesser
seat, wave 5 is 2–3/8 on the frozen band. food-economy stays converging
(untouched; sibling Loop A live at closeout — not touched by this run).

## Infrastructure notes (for the coordinator)

- **EPERM flap, active all run (~17:00–19:00Z):** git O_EXCL ref writes
  refused intermittently (probe `git update-ref refs/heads/probe HEAD`
  failed at 17:24, 18:17; passed at 17:38, 18:47-window). The first
  panel-before attempt died on a writeFileSync EPERM at 17:19 (26 cases
  kept, 4 `.tmp` leftovers); the retry also exited 1 silently in ~3 min
  with an empty log (cause undetermined — no error file, no stack; the
  third attempt, reusing 22 cached cases, completed). The baseline sweep
  lost seed 53008's write to EPERM (0-byte file; re-ran the single seed
  direct-piped — the `> log 2>&1` redirected single-seed runs died silently
  at startup twice, cause undetermined; direct piped runs work). The
  candidate sweep then failed 5 consecutive per-seed writes (18:44–18:49)
  while ad-hoc 1MB probe writes in the same directory succeeded seconds
  apart — the flap flickers at sub-minute granularity. **Fix applied in
  this arm:** `scripts/combatdiv-20261107.js` gained `writeFileFlap`
  (retry the per-seed write in-process, 60×5s, EPERM-only) — the candidate
  sweep then completed 8/8. The helper is instrument-only, write-robustness,
  no sim-content effect; it rides with the instrument commit.
- **safe-commit index clobber struck once** (prereg commit 7e25ca671):
  files staged-as-deleted after commit; repaired via `git ls-tree HEAD --
  <paths> | git update-index --add --index-info`, verified status empty +
  diff HEAD empty. The commit itself was correct.

## Footer

- Branch sim-midshape-a: prereg + instruments (7e25ca671) + [fix commit /
  revert + evidence + corpora + panels + compare — to be filled at
  closeout]. Zero src/js diff after the revert (to be verified
  `git diff HEAD -- src/` empty).
- Baseline corpus: `evidence/2026-11-08/perseed-midshape-a-baseline/` (8/8,
  0 instrument errors). Candidate corpus:
  `evidence/2026-11-08/perseed-midshape-a-candidate/` (8/8, 0 instrument
  errors). Panels: `evidence/2026-11-08/midshape-a-panel-before/` (32
  cases), `evidence/2026-11-08/midshape-a-panel-after/` (32 cases),
  compare `evidence/2026-11-08/midshape-a-panel-compare.md`
  (review_required).
- Proof: `scripts/test-midshape-a.js` — fixed tree 22 passed, 7 failed (the
  7 = the NO-GO bars); unfixed tree unit leg 3 passed, 6 failed.
- No confirm band spent. No landing. Report: ready-to-merge (NO-GO record
  only).
