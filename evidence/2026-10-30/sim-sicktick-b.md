# sim-sicktick-b — SICKNESS-TICK STEP-UP, attributed (Loop B, 2026-10-30)

Run: oversight-flesh-out-loop-b, arm sim-sicktick-b — DIAG ONLY.
Parent: loop-B arm sim-starveplenty-b, run fleshout-loop-b-20261030T1030Z,
evidence/2026-10-30/sim-starveplenty-b.md observation 3 (sickness tick
−3/day → −5/day in the starving phase on seed 9983, cause label
'sickness' both phases, unexplained by the meal trace).

Branch: sim-sicktick-b (worktree ~/workspace/worktrees/sim-sicktick-b).
Prereg (committed BEFORE any judged leg): evidence/2026-10-30/sim-sicktick-b-prereg.md
(commit 1f7d9495f). Zero src/js changes, zero policy-default flips.

## Verdict: DIAG-GO

Both pre-registered clauses hold:
(a) The step-up reproduces on 9983 under the recorder with day-level
    attribution naming the cause (below — a new, worse illness
    replacing an expired mild one, in villageSicknessTick).
(b) The same attribution holds on 3 fresh seeds with clean
    (healer-unchanged) sev1→sev2 steps (10105, 10106, 10108),
    plus 10101 with the same record transition under a coarser
    healer flag. The bar needed 2; it got 3 clean + 1 more.

## Plain-words answer first

The villager did not get sicker from starving, and the game did not
change how hard one illness hits. He got a SECOND, worse illness.
He had a mild tick fever (−3 a day). It ran its course and ended on
day 35. The next day, with his health still low from a monster wound
(36), an open wound turned feverish — a new wound fever (−5 a day).
Its first daily hit landed on day 37, which also happened to be his
first starving day, so the two looked connected. They were not: the
new fever was already in his record on day 36, a day he ate enough
and took no starvation hit. In the fresh seeds the same step-up
happens with nobody starving at all. The 'sickness' label is the
same in both phases because the game files every villager illness
under that one label — one tick function, two different illnesses
in sequence, not two ticks sharing a label.

## The code path (read before running; the recorder confirms it)

villageSicknessTick (src/js/game.js, ~line 31535) is the ONLY caller
that hurts a villager with cause 'sickness'. Its damage formula is
sickDmg = max(1, 1 + severity×2 − (healer ? 1 : 0)):
sev1 → 3 (no healer) / 2 (healer); sev2 → 5 / 4. Starvation appears
nowhere in the formula. A new illness can only start once the old
one is gone (the tick's vector phase skips villagers already in
v.sick), and the wound-fever vector fires only at health < 40
(15% a day, 7.5% under triage hygiene). Treatment only LOWERS
severity — nothing raises a record's severity in place.

## Leg 1 — 9983, gen_a29exbk, days 28–39 (recorder fidelity: PASS)

Fidelity gate: the recorder run reproduces the wall corpus /
wound-probe death sequence EXACTLY — 39 days, village-lost, all 14
deaths identical (day, kind, who, cause). The recorder did not
perturb the trajectory. No healer was present at haven or in the
field on any day 28–39 (campHealerId null throughout) — hence the
clean 3/5 values rather than the healer-discounted 2/4.

| day | sick record at tick (before → after) | sickness hit | starving that day | what happened |
|-----|--------------------------------------|--------------|-------------------|---------------|
| 28 | none → none | — | no | healthy |
| 29 | none → tick fever sev1 dl6 | — | no | tick fever caught (vector phase) |
| 30 | sev1 dl6 → dl5 | −3 | no | |
| 31 | sev1 dl5 → dl4 | −3 | no | |
| 32 | sev1 dl4 → dl3 | −3 | no | monster wound −40 this day (79→39) |
| 33 | sev1 dl3 → dl2 | −3 | no | health 36–39: wound-fever vector now eligible (hp<40) |
| 34 | sev1 dl2 → dl1 | −3 | no | |
| 35 | sev1 dl1 → NONE (expired) | −3 (last tick) | no | mild illness ends |
| 36 | NONE → wound fever sev2 dl5 | — (no hit; record created in vector phase) | no | NEW illness: wound fever. No starvation hit this day. |
| 37 | sev2 dl5 → dl4 | −5 (first tick) | YES (−8 meal, −4 famine) | step-up day — but the record predates starvation by a day |
| 38 | sev2 dl4 → dl3 | −5 | YES | |
| 39 | sev2 dl3 → NONE (dead) | −5 row post-mortem* | YES (−8, died) | died of starvation, not sickness |

\* Day-39 post-mortem row: after the −8 starvation death, one more
sickness row (damage 5, healthBefore null → 95) is recorded against
the corpse; the tick then deletes the record. Seen in both this
recorder and the parent wound probe, so it is pre-existing, not a
recorder artifact. Observed only, not chased (no ongoing effect —
the record is deleted in the same tick).

Hypothesis adjudication (prereg H1/H2/H3):
- H1 (new sev2 record replaces expired sev1): CONFIRMED, with the
  exact days: expiry day 35, reinfection day 36, first −5 tick
  day 37. The day-36 gap with no sickness row — the parent probe's
  unexplained hole — is the seam between the two illnesses.
- H2 (same record's severity raised in place): REFUTED. Name,
  severity, and daysLeft all change discontinuously (dl1 → dl5
  reset), and no code path raises severity in place.
- H3 (two different ticks sharing the 'sickness' label): REFUTED
  as the step-up's explanation. All 782 sickness hurt rows across
  all 9 traces come from one caller, villageSicknessTick. The
  label IS shared — across successive illnesses, not across ticks.

Starvation causation is additionally refuted by the fresh band:
every confirming step-up there has starving=false on both sides.

## Leg 2 — FRESH BAND, seeds 10101–10108, competent, 180d death-aware

Same instrument, one process per seed. 7/8 seeds survived to the
180d cap; 10108 ended village-lost day 170. Sickness step-ups
found: 19 across 5 seeds (10102/10103/10104: none). Every step-up
is a new-record-after-gap transition; none is a same-record
severity change except the healer-loss steps noted below.

Clean confirmations of the 9983 mechanism (sev1 tick fever →
sev2 wound fever, healer unchanged, new-record shape):

| seed | villager | step | gap |
|------|----------|------|-----|
| 10105 | gen_xwswagk | d43 −2 → d54 −4 | 11d |
| 10105 | gen_acekfp6 | d35 −2 → d61 −4 | 26d |
| 10105 | victor_lopez | d23 −2 → d61 −4 | 38d |
| 10106 | gen_hz8zeiu | d83 −2 → d105 −4 | 22d |
| 10108 | gen_a7z6e74 | d124 −2 → d133 −4 | 9d |

(2→4 rather than 3→5 because a healer was present on those seeds:
sev1 with healer = 2, sev2 with healer = 4. Same formula, same
transition shape.) 10101 adds 3 more sev1→sev2 wound-fever steps
(2→4) where the coarse healer flag also moved, and 10105 adds a
2→5 step (gen_ke3jht1) where healer loss and severity rise stack.
10105 also shows the mechanism is common, not rare: 5 sev1→sev2
steps on one seed.

## Secondary observations (LISTED, NOT chased — DIAG scope)

1. Healer-loss steps are real and distinct: same-record damage
   rises by exactly 1 when the healer leaves (sev1 2→3, sev2 4→5),
   e.g. 10107 hannah_kim d21 −4 → d22 −5, 10106 gen_8tn62yv
   d166 −2 → d167 −3, 10108 chantal_mukendi d168 −2 → d169 −3.
   This is the ONLY same-record step-up shape in the band, and
   9983 is excluded from it (healer null throughout, flag false).
   It is a second, already-understood step-up mechanism, not a
   rival explanation for 9983.
2. Reinfection IS narrated, symptom-only, per canon (diseases never
   announce names): the vector phase says "🤒 <first> is feverish,
   a cut gone hot and angry. Rest and clean water — or it gets
   worse." A player watching the feed sees a new fever line the
   day before the harder ticks start; the hurt-label view alone
   hides the change. That is an observability note, not a bug.
3. Wound fever, not gut rot, is the step-up disease in every
   confirming case (all new sev2 records are wound fever) —
   consistent with the hp<40 wound vector and with wounded
   villagers being the ones whose ticks step up.

## Named next fix (documented, NOT landed — DIAG arm)

NONE needed as a game change. The step-up is the formula working
as designed: a worse illness replaces a milder one, and the damage
values are exactly the formula's outputs. If a future worker wants
to make the transition more legible, the honest lever is the
hurt-label/telemetry view (carry the illness name or severity
alongside 'sickness' in diag output), NOT a damage-formula change
— and any such change is a design call, not a fix this arm makes.

## Convergence state

converging (diag, not a lever). The parent arm's observation 3 is
closed: the step-up is attributed to a named condition transition
in a named code path, reproduced on 9983 and confirmed on 3 fresh
seeds. No lever lands from this arm (DIAG ONLY by brief).

## Proof

scripts/test-sicktick-b.js: 9/9 GREEN — 9983 deaths equal the
wound-probe deaths; 9983 step is −3→−5 tick-fever/sev1 →
wound-fever/sev2, same caller, healer unchanged, new-record shape;
3 fresh seeds confirm; all 782 sickness rows from
villageSicknessTick; no src/js file differs from HEAD. No
concurrent jest was run; this proof is a node script, not a jest
suite. Instrument note: an early recorder version mislabeled the
caller (stack-frame off-by-one); it was fixed before the judged
band ran, and the 9983 trace was re-run with the fixed recorder
(deaths still exact).

## Files

- Prereg: evidence/2026-10-30/sim-sicktick-b-prereg.md
- Recorder: scripts/trace-sicktick-b.js
- Analyzer: scripts/analyze-sicktick-b.js
- Proof: scripts/test-sicktick-b.js
- Traces: evidence/2026-10-30/sim-sicktick-b-trace-9983.json,
  sim-sicktick-b-trace-10101.json … -10108.json (9 files)
- Summary: evidence/2026-10-30/sim-sicktick-b-summary.json

## Metric review (§14 — required section)

- Pre-registered metrics bind this run; no re-scoring occurred.
  Clause (b) was judged on the prereg's "equivalent step" rule
  (damage increase + same record-transition shape): the fresh
  2→4 steps count because the healer discount shifts both ends
  of the same sev1→sev2 transition (2 = sev1+healer, 4 =
  sev2+healer), and the analyzer verifies name, severity, shape,
  and healer-unchanged for each counted step. The 2→5 mixed step
  (healer loss + severity rise) is reported, not counted as clean.
- Metric issue 1 (analyzer shape bucket): the first analyzer
  version labeled 9983 "record-changed-in-place-or-replaced"
  because its gap test required an invocation with the villager
  absent both before AND after; day 36 has the villager absent
  before but present after (the reinfection tick itself). Fixed
  before judging: a previous tick ending with the record deleted
  now classifies as new-record-after-gap. The fix changed a
  label, not any damage, record, or caller datum, and the 9983
  snapshot table was verified by hand against the trace.
- Metric issue 2 (say-line filter): the recorder's mend/succumb
  filter did not capture gen_a29exbk's day-35 recovery line
  (ambient mend renderings vary beyond the filter words). No
  verdict depends on that line — expiry is proven by the
  before/after sick-record snapshots (dl1 → absent). Proposed
  revision for the NEXT run: capture all say lines for the
  focus villager, or widen the filter to the ambient pool's
  renderings.
- Metric issue 3 (healer flag is coarse): the analyzer's
  healerChanged compares haven OR here healer ids, while the
  tick uses only the villager's place. Clean confirmations were
  therefore restricted to healerChanged=false steps, which is
  stricter than the prereg required; 10101's steps are reported
  separately, not counted as clean.
- No metric revision is applied to this run's numbers. All
  revisions above are proposals for the NEXT run.
