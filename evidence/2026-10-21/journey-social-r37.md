# Journey social r37 — THE MISJUDGED PATH (lane B, 2026-10-21)

Leg 5 (social life), cycle r37. Follows r36 (justice arc measured: 25–27
moots/run, M1–M4 GO; uprising/betrayal opening-turn softlock fixed,
4897ff8b7 [needs-eyes]) and r35 (bond engine: deep bonds form without
suffering, M2 GO 2/4; two L2' parrot blanks fixed).

Rotation-b read 5 at run start (endgame r35 recovery wrote 4→5 at 07:30;
full rotation chain today: r34-recovery→5, r36→6, r37-crisis→7,
succession r34→4, endgame r35→5 — consistent, no anomaly).

## PRE-REGISTER (MEASUREMENT.md §§9–12, 14 — written before any play, 2026-10-21T13:05Z)

**Leg question:** THE MISJUDGED PATH. Steve's moots ruling (2026-10-16):
"villagers can be victims or falsely accused, so justice covers the
wronged and the misjudged, not just the guilty." r36's F1 probe fired
25–27 moots/run and 0 fabricated cases across 4×140d runs. The
false-accusation branch EXISTS (betrayal.js:4457–4464): an enemy with
motive ≥60 and trustInPlayer < 25 can weaponize the moot (25% roll) —
BUT only when there's no real ammunition ("enemies prefer real
crimes"). r36's larceny policy always supplied real ammunition, so the
branch starved by design. Question: under a hostile-but-law-abiding
policy (a strong enemy, zero crimes), does a fabricated case fire, does
the acquittal path work (press accuser → lie exposed → moot clears the
innocent), and does it read like people rather than machinery? Or is
the misjudged half of Steve's ruling unreachable content in practice?

**What would count as interesting:** a fabricated case firing and
reaching a verdict; the defense-tools path (speak / alibi / press)
exercised end to end; a moot transcript that reads honestly about the
misjudged (the room doubting, the accuser exposed, the acquittal
landing with its social cost — r36 established "an accusation leaves a
mark no verdict washes off"). OR the blank: preconditions never arise
or the branch never fires in 560 village-days → documented for Steve,
not re-scored.

**Bindings (a miss is NO-GO, never re-scored):**
- M1 instrument: daily arc snapshots complete on 4/4 runs (no gaps >2d);
  ≥3/4 runs reach the false-accusation preconditions at some point
  (strongestMotiveVsPlayer ≥60 AND trustInPlayer < 25). If the
  preconditions never arise, the question is unanswerable by this policy
  — document, don't re-score.
- M2 misjudged fires: ≥1 fabricated case fires across the 4-run pilot
  AND reaches a verdict (any resolution path). GO = fires. A miss is a
  DOCUMENTED BLANK (560 village-days, 0 fabricated cases → the misjudged
  half of Steve's ruling is unreachable in practice) — not re-scored,
  reported as the finding.
- M3 people: ≥3/4 sense-reads (1 fabricated-case moot transcript if any
  + 2 confront/defense convos) meet the quality bar; 0 fabricated-history
  flags.
- M4 guardrail: ≥3/4 runs end with ≥5 alive and the village not
  scattered.
- L2' standing: verbatim content-beat repeats within one convo =
  finding (informational count + transcript citation).
- F1 informational: NPC-NPC case formation rate (r32: 1/4 seeds formed
  NPC-NPC cases; r27's beloved-village gate — Steve's call on the
  formation gate stands).

**Substrate:** hostile-but-law-abiding policy — competent survival base;
ZERO crimes (no theft, no attacks); fixed rival target (2nd living
villager, re-pinned if they die); cold shoulder every 3rd day; hostile
confronts; broken promise (accept first favor, never fulfill); 1
convo/day from day 3 (deep, gossip forcing GOSSIP_TARGET=2,
confront-priority targeting); moot duty (convene on open cases; HONEST
votes — the player is innocent of every fabricated charge, so acquit;
with-the-room on NPC-NPC cases). DAYCAP=140, death-aware (+10d tail).
**Seeds:** 3401–3404 (fresh, adjacent to r36's 3304–3307).

**Instrument:** scripts/journey-social-r37-20261021.js — r36 driver
forked; policy swapped to hostile-but-law-abiding; fabricated-case
defense-tools layer added (when a fabricated case opens: defendSpeak →
defendAlibi → defendPressAccuser in sequence across days, then convene
and vote honestly); arc snapshots track motive/trustInPlayer
preconditions; same L2'/dry-rate/deflection instrument stack.

**Pilot GO:** M1–M4 all GO (M2's miss clause = documented blank), the
interesting finding articulated. Expand only if the misjudged path
needs multi-seed confirmation.

## Run state

(Pre-reg written 2026-10-21T13:05Z. Pilot results appended after the run.)

## Canon correction (pre-reg cited 2026-10-16; actual: 2026-10-19)

The moots ruling is recorded in docs/DECISIONS.md under "2026-10-19 — Moot
convening for law-abiding villages (Steve's ruling)": Steve answered the
social r27 moot question ("should a law-abiding player ever see a moot?"):
"it depends — sometimes they are the victims or could be falsely accused of
committing crime." Ruling: a law-abiding player SHOULD still see moots — moot
cases must not only arise from the player's own wrongdoing. Villagers can be
victims of crimes or falsely accused of committing them. The beloved-village
gate blocking all NPC-NPC cases under law-abiding play is a design gap, not
a feature — queued for the social-life rotation / findings backlog.

## Pilot results

Driver: `scripts/journey-social-r37-20261021.js` (r36 fork; hostile-lawabiding
policy `scripts/policies/hostile-lawabiding.js`: competent survival, ZERO
crimes, never donates, never comforts; arc layer: fixed rival pinned
goal='lead'-first, hostile convo every 3rd day vs rival, deep convos rotating
otherwise, gossip forcing GOSSIP_TARGET=2, broken promise via favor stash,
fabricated-case defense layer, moot duty). Seeds 3401–3404 × 140d,
death-aware. Smoke (seed 3405 × 10d): PASS — rival pinned (goal='lead'),
motive/trust instrumented, hostile convos ran, 0 thefts, arc complete.

| seed | days | alive | convos (deep/hostile) | thefts | cases | moots | fabricated | maxMotive | minTrust | avgTrust |
|------|------|-------|----------------------|--------|-------|-------|-----------|-----------|----------|----------|
| 3401 | 142 | 7 | 138 (91/47) | 0 | 0 | 0 | 0 | 25 | 11.7 | 91.7 |
| 3402 | 141 | 6 | 138 (93/45) | 0 | 0 | 0 | 0 | 25 | 13.0 | 87.2 |
| 3403 | 141 | 7 | 138 (93/45) | 0 | 3 | 3 | 0 | 25 | 11.6 | 90.7 |
| 3404 | 141 | 10 | 138 (94/44) | 0 | 0 | 0 | 0 | 25 | 15.1 | 91.8 |

Dry rates: 1.50 / 1.73 / 1.93 / 2.04 per 12 NPC turns (r36: 1.87–2.61).
L2' repeats: 0 on all seeds. P1-streaks: 0/0/2/0. Bonds: 91/55/47/56
(deep 38/41/23/39). Gossip convos: 4/4/4/4 (forced picks 3/run +1 organic).

### M1 (preconditions): instrument GO; preconditions 0/4 — MISS, documented

No gaps in arc snapshots. But the false-accusation preconditions
(motive≥60 AND trustInPlayer<25) held on 0 days across 560 village-days.
maxMotive=25 on ALL seeds — ambition (+25 for the goal='lead' rival) ONLY;
grievanceBetween(rival, player) = 0 after 44–47 hostile conversations and a
broken promise. minTrustInPlayer dipped to 11.6–15.1 (early window, before
competent's trust engine compounds) but motive was 25 then too. The question
is unanswerable by this policy — documented, not re-scored (§14).

### M2 (misjudged fires): MISS — DOCUMENTED BLANK

0 fabricated cases in 4×140d (560 village-days). Combined with r36's 0 in
4×140d larceny runs: the false-accusation branch has never fired in ~1120
village-days of social-leg piloting. The misjudged half of Steve's
2026-10-19 moots ruling is unreachable in practice. NOT re-scored —
reported as the finding.

### M3 (people): GO — 7/7 sense-reads meet the quality bar

4 conversation transcripts (Elena gossip, Dale gossip, Jose late-d100, Aki
late-d100) + 3 moot transcripts (3403 case_2/4/6), all read end to end.
Villagers act like people: Elena's withdrawn foraging favor has legible
consequence ("They won't forget. They'll just stop asking."); Jose's lately
no-repeat degrades honestly into fresh content (the Informant screens);
the 3403 murder moot reads dramatically and coherently (the village weighs
Chantal's death, acquits 0–6, "Across the fire, a jaw tightens. The accused
breathe — and they'll remember who stood up."). 0 fabricated-history flags.
0 filler loops. No static menus.

### M4 (guardrail): GO — 4/4 (7/6/7/10 alive, none scattered)

### F1 (NPC-NPC cases, informational): 3 on seed 3403, all acquitted

case_2 (d8, ambush, Tom/Chai/Gerald) → acquitted 1–5. case_4 (d12, ambush,
same trio) → acquitted 1–6. case_6 (d12/13, murder over Chantal's death,
same trio) → acquitted 0–6. The beloved-village gate is NOT absolute:
NPC-NPC cases fire under law-abiding play (r27's "don't form" was a
small-sample read). The player convened all three via the player path and
voted with the room (acquit ×3 — with-the-room on NPC-NPC cases).

## Root cause: the misjudged path is gated behind a catch-22

The false-accusation branch (betrayal.js considerPlayerAccusation) is
correct code — proven by the probe below. Its gates:

1. **motive ≥ 60.** motive = grievance×0.8 + ambition(25)/prove(12)/fear(12).
   Non-criminal grievance sources: conflicts (tension decays −1/day — r33
   proved rivalries can't escalate organically) and a handful of recorded
   kinds (abandoned_alliance 14, voted_guilty 22 — all require other
   systems to fire first). **Cruel conversation choices — the social
   hostility verb — move trust (−1), mood, disposition, and escalation,
   but NEVER record a grievance or create a conflict**
   (resolveConsequence → no recordGrievance path). 45 hostile convos =
   grievance 0. Social hostility is mechanically toothless against the
   justice system.
2. **trustInPlayer < 25.** Reachable early (11.6–15.1 on all seeds) but the
   competent trust engine compounds to ~90 by day 80 — deeds outweigh
   words 10:1. A cold-but-competent player is beloved.
3. **No real crimes** ("enemies prefer real crimes").

The catch-22: the only reliable way to reach trust<25 AND motive≥60 is
criminality — which disables the fabricated branch. A law-abiding player
can be maximally hostile for 140 days and generate zero motive. Steve's
ruling ("law-abiding players should be falsely accused sometimes") has no
reachable path in the current gating.

Design options (Steve's call — tuning sits with him, per r36):
(a) cruel/escalated social hostility feeds grievances (wire
    resolveConsequence's cruel temper into recordGrievance at a threshold);
(b) the fabricated branch keys off the ACCUSER's distrust, not
    village-wide trustInPlayer<25 (one enemy weaponizing the moot is
    individually plausible; the moot then acquits — which is the drama);
(c) leave as is — the misjudged path stays intentionally rare (but then
    the ruling is unimplemented).

## Probe: the machinery works (18/18 GREEN)

`scripts/test-misjudged-path-20261021.js` — forces the preconditions
(grievance 80 → motive 64; trust slots 10 → tip 10; zero crimes), then:
fabricated case opens (accuser = the enemy, charge theft|assault,
2 inconsistencies planted) → defendSpeak moves belief → defendAlibi →
defendPressAccuser exposes a lie seam (accuserExposed) → callMoot runs the
trial → the accused does not vote in their own trial (design,
betrayal.js:1615) → verdict ACQUITTED. The pilot's blank is a reachability
gap, not broken code.

## Driver fix (inherited dead code from r36)

r36's mootDuty had an "HONEST VOTES" branch: fabricated → acquit, real
crime → guilty, for player-accused cases. It never fired — the engine
doesn't let the accused vote in their own trial (betrayal.js:1615:
"player votes if present and not accused"; verified: 24/24 r36
player-accused moots recorded vote=None). The accused player's agency is
the defense tools, not a ballot. Removed the dead branch from the r37
driver (NPC-NPC with-the-room votes still fire — verified vote='acquit'
on r36's case_6). No game-code change; instrumentation honesty only.

## Village assessment (plain words)

Four villages, 140 days each, same cold player, wildly different social
weather — and the same ending: everybody trusts the bastard.

**Seed 3401 — the grieving seven.** 10 dead by day 142 (Nora Tian day 4,
then a bleed through day 28); 7 left. 91 bonds, 38 deep — the densest
social graph of the four. Nobody was ever charged with anything. The
rival (a man in his 60s with calloused knuckles) took 47 hostile
conversations and never lifted a finger back. Trust 91.7.

**Seed 3402 — the quiet six.** 5 dead; 6 left. 55 bonds, 41 deep — fewer
bonds but deeper. The rival (a woman in her 60s with a long braid) is
still there. Trust 87.2. Nothing burned; nothing caught fire.

**Seed 3403 — the accused.** 3 dead; 7 left. The only village where the
justice system woke up: Tom, Chai, and Gerald stood accused three times
in six days — twice for ambush, once for Chantal's murder — and the
village acquitted them three times (1–5, 1–6, 0–6). Chantal's death got
its crisis beat, its System reaction, its moot. The player called all
three moots and voted with the room. Trust 90.7. The village works.

**Seed 3404 — the ten.** 1 dead; 10 alive — the gentlest seed. 56 bonds,
39 deep. Trust 91.8. Nothing happened, and it was fine.

What they knew: the pantry's thinness (Dale's and Elena's foraging
favors — both withdrawn honestly when the player couldn't come; "There
is no playable joint foraging outing yet"), the stray dog that bit two
people, Jose's garden talks, the Informant's screens. What was missing:
no one ever had a motive to hurt the player — the cold shoulder, the
cruel words, the broken promise all landed socially and evaporated
mechanically. The village never produced an enemy, only a cold neighbor
everyone trusts.

## Reachable / fun / winnable (social leg)

- **Reachable:** yes — bonds form (47–91/run, 23–41 deep), gossip threads
  (4/run), NPC-NPC moots convene end-to-end on a law-abiding run (3/3
  acquitted, player-convened, with-the-room votes). The lately no-repeat
  path degrades honestly into fresh content.
- **Fun:** the transcripts are the evidence — the moot ceremonies read
  dramatically, the withdrawn favors have teeth, the gossip is
  village-textured. The misjudged path's absence isn't felt as a hole
  because nothing promises it; but Steve's ruling promises it, and it's
  not there.
- **Winnable:** not this leg's question; all four villages survived to
  day 141+ with social fabric intact (M4 4/4).

## Metric review (§14)

- M1: instrument GO; preconditions 0/4 — MISS, documented not re-scored.
  Proposed revision for the next run: none needed — the metric did its
  job (it proved the preconditions are unreachable, which IS the finding).
- M2: MISS → DOCUMENTED BLANK. The metric's miss clause worked as
  designed. Next run should not re-run the same policy expecting a
  different result; the named next is a Steve decision on the gating.
- M3: GO (7/7 sense-reads). The moot transcripts are now part of the
  standing sense-read set for the social leg.
- M4: GO.
- L2': 0 verbatim repeats across 552 conversations — the r31/r35 parrot
  fixes hold.
- F1: 3 NPC-NPC cases on 1/4 seeds, all acquitted. The beloved-village
  gate is not absolute (revises r27's small-sample read); Steve's call
  on the formation gate stands.
- New standing instrument: the r37 driver (rival pinning, precondition
  snapshots, defense layer, corrected vote logic) is the misjudged-path
  instrument for any future run. The probe
  `scripts/test-misjudged-path-20261021.js` (18/18) is the machinery
  gate: if the gating ever changes, it proves the path still works.
- P1-streaks=2 on 3403: both hit the designed 3-streak wind-down trigger
  (the counter fires at >=3, the fix winds down AT 3) — cap working as
  designed, not a regression. Next run: distinguish ==3 from >3 in the
  instrument.
- P2-reactDry 75–82/run vs r26's 3: absolute count scales with convo
  count (138 vs ~50) and pick mix; dryRate (the rate metric) is
  comparable-or-better than r36 (1.50–2.04 vs 1.87–2.61). Informational
  only; sense-reads show honest dryness.

## Telemetry

Deviation check vs `telemetry-baselines/social.json` (the theft-driver
baseline — r36's binding note: "L3: theft-driver baseline SHOULD bind
(same policy family)"):
- **LOUD: l3.betrayalCases 53 → 0/0/3/0; l3.mootsConvened 53 → 0/0/3/0.**
  Verdict: EXPLAINED, not a bug. The baseline binds the larceny
  (theft-driver) policy family; r37 is hostile-lawabiding (zero crimes).
  Player-crime cases scale with player crimes — 0 crimes → ~0 player
  cases. The 3 on 3403 are NPC-NPC cases (the F1 finding).
- **LOUD: l3.bonds 204 → 47–91; l3.deepBonds 70 → 23–41.**
  Verdict: EXPLAINED. The cold policy suppresses donations (a bond
  engine) and never comforts; larceny donated first, then stole. Fewer,
  shallower bonds are the honest price of the cold neighbor.
- dryRate 1.50–2.04 vs baseline 0 (stale placeholder) — in line with
  r36's measured 1.87–2.61. No action.
- Baseline NOT rolled: it belongs to the theft-driver family. Rolling a
  law-abiding pilot's numbers over it would corrupt the binding r36
  relies on.

## Regressions

- `check.js --only social`: **49 passed, 0 failed** (2026-10-21,
  --cacheDirectory=/tmp/jest-cache-playtest2, 237s).
- Probe `scripts/test-misjudged-path-20261021.js`: 18/18 GREEN.
- No src/js changes this run (driver + policy + probe only).

### Regression found and fixed: test-social-shared-barks (r36's breakage)

`check.js --only social` initially showed 48 passed, 1 failed:
`scripts/test-social-shared-barks.js` — "uprising first cycle has no
cross-speaker template repeat". Bisected: the test PASSES on
4897ff8b7^ (r36's parent) and FAILS on 4897ff8b7 (r36's uprising/
betrayal opening-turn softlock fix, justice.js+party.js). Root cause:
the test installed its pickFresh/tbHostileTurn wrappers AFTER
`G.debugScenario('uprising')` — but since r36's fix, the fight's
opening AI turns run INSIDE startUprising, consuming the fight-scoped
'humanRetaliate' cycle before recording starts. The recorded 16-window
then starts mid-cycle and the no-repeat assertion fails on a
cycle-boundary artifact. The game invariant ("no identical line from
2+ attackers in one scene until all 16 are used", party.js:1044)
HOLDS — the player never hears a repeat. Fix (test-only, no game
code): install both wrappers BEFORE debugScenario so the observation
window aligns with the cycle start. Verified: test green standalone
("ALL PASS: two fresh shared Games") and the full --only social suite
49/49 green after. The r36 softlock fix itself stands untouched.
