# sim-holdsjoin-a — JOINED DEPARTURE-HOLD MEASUREMENT: DIAG-GO (the pick-only supersession hid real overwrites, and the holds move the verdicts exactly where the lever says)

Run: flesh-out loop, run fleshout-20261029T1315Z.
Axis: scale-onramp (blocking axis, converging, NOT converged).
Worker: sim-holdsjoin-a.
Assignment: ONE analyzer joining, per HUNT pick, the departlag lag
class with the departhold verdict channel. DIAG ONLY — zero src/js
changes, zero default flips, zero policy defaults changed. This arm
does NOT re-judge the build lane's hunthold pilot (its P1/G1/G2
NO-GO stands, untouched by this arm) and does NOT rebuild the holds
lever. It supplies the joined measurement that pilot lacked.
Preregistration (binding, committed BEFORE any judged analysis):
evidence/2026-10-29/sim-holdsjoin-a-prereg.md (commit 8bd0968e9).
This evidence judges the arm against that prereg. No metric was
changed mid-run. One implementation bug was fixed against the
prereg's own written rule (see "Implementation correction" below)
— the rule did not change, the code was corrected to match it.

VERDICT: DIAG-GO — all five pre-registered legs pass. The join
answers all three assigned questions on the landed corpora, with
no new sweep (the corpora already carried every channel the join
needs, as the prereg's path decision verified before analysis).

## Plain words first

A villager picks a hunt. Between the pick and the walk, three
things can happen: they walk, they get quietly swapped to indoor
chores, or something else replaces the hunt first. Until now the
two earlier measurements each saw only half the story: the lag
census saw picks and walks but not the doorway verdicts, so a
quiet swap looked exactly like an ordinary replacement. The
verdict recorder saw the doorway but not the pick. This arm joins
them, pick by pick.

What the village looked like: eight villages on each side, same
seeds, same starting conditions, one difference — on one side a
lever lets a villager with a hunt decision WAIT through moderate
danger instead of being swapped to chores. Off side: 81 hunts
were swapped to chores on a danger verdict, every single one
with the verdict recorded (68 "ask", 13 "tighten"). On side:
those swaps nearly vanish (9 left, all after the wait budget ran
out) and 209 waits appear instead. The wait is real, it is
counted exactly, and 13 waits end in a walk — held, then walked.

The caveat is closed on real data, not just on a fixture: of the
8 funnel hunts on the off side, 4 looked like ordinary
replacements to the pick-only census — and 2 of those 4 were
actually danger overwrites. Half the "replaced" hunts were
misread. The famous murkcap pair (one villager, same beast,
swapped twice in two days) reads in the join as what it was:
two verdict overwrites, not two re-picks.

## Header (pre-registered) vs result

Substrate (the corpora's own, verbatim): LEANLINKRESCUE=1,
TABLESEATNOWAIT=1, FIELDPARTY=1, RETURNS=1, FUNNEL=1,
DEPARTHOLD=1, HUNTHOLD=1 (ON) or unset (OFF). Seeds 75101–75108,
180d death-aware. Corpora:
evidence/2026-10-29/perseed-hunthold-off/ and
perseed-hunthold-on/ (8 seed rows + summary.json each).
Analyzer: scripts/test-holdsjoin-a.js (pure reads over both
corpora + src/data/monsters.json wave lookup; writes
evidence/2026-10-29/holdsjoin-a-analysis.json).
Fixtures: scripts/test-holdsjoin-a-fixtures.js (11/11 green,
including the murkcap-style case and an interleaving guard).

- GO LEG 1 — JOIN COMPLETENESS: 100% of funnel HUNT picks in
  both corpora receive a joined class, 0 unknown; 100% of
  evaluation chains receive a terminal class. RESULT: OFF 8/8
  picks, ON 2/2 picks, 0 unknown on either side (lag classes
  also 0 unknown); OFF 236/236 chains, ON 205/205 chains
  classified -> PASS.
- GO LEG 2 — CAVEAT CLOSED: murkcap-style fixture passes AND
  the real murkcap pair appears as overwritten chain terminals
  with verdicts. RESULT: fixture green; real pair in OFF seed
  75106 (visjoin_102, parts 429/432) = two OVERWRITTEN chains,
  both verdict tighten (scores 4 and 5) -> PASS.
- GO LEG 3 — VERDICT CHANNEL COMPLETE: overwriteWithoutVerdict
  == 0 in both arms at eval level; dangerOutside reported
  separately, never fed into a class. RESULT: OFF 0, ON 0;
  chain-level verdict-less overwrites 0 both arms;
  dangerOutside OFF 788 / ON 596, counted separately and
  excluded (OFF 788 matches the departhold corpus exactly —
  the hunthold OFF trajectories reproduce the recorder
  band) -> PASS.
- GO LEG 4 — HUNTHOLD DISTRIBUTION ANSWERED: OFF vs ON verdict
  distribution + chain terminal distribution + held split all
  computed on identical seeds, shift attributed (lever holds
  vs budget-exhausted overwrites, cross-checked against the
  hunthold store). RESULT: all computed (tables below);
  cross-checks exact: ON lever-held evals 209 == hunthold holds
  209; ON overwrites 9 == hunthold exhausted 9 -> PASS.
- GO LEG 5 — HELD SPLIT RECONCILES: every terminal-held chain
  and every never-checked funnel pick in exactly one bucket,
  buckets summing to the totals. RESULT: OFF held 3 = 2
  sick-early + 1 heal, danger 0; ON held 24 = 24 danger-held;
  never-checked picks OFF 2 / ON 1, all bucketed -> PASS.

DIAG-GO requires ALL legs. All five pass.

## Implementation correction (rule unchanged, code fixed to match it)

The prereg specifies chains as evaluations "grouped by (seed,
vid, mid, huntDay), splitting a group at every terminal action".
The first implementation grouped by CONSECUTIVE run in part
order instead — and evaluations interleave across villagers, so
one pick's chain fragmented at every other villager's check
(the eulogy sick-held chain split into a fake "died-holding"
fragment plus a departed fragment). A fixture now guards the
correct behavior (interleaved villagers do not fragment a
chain), the analyzer groups by key, and all numbers below are
from the corrected run. The prereg text was not altered; the
code was brought into compliance with it. The pre-fix numbers
are discarded, not reported as an alternative reading.

## Judged numbers

### (a) Do held picks get danger-overwritten between picks (verdict-less overwrites)?

NO verdict-less overwrites anywhere. Every overwritten evaluation
in both arms carries a danger verdict:

| arm | overwritten evals | with verdict | without verdict |
| --- | --- | --- | --- |
| OFF | 81 | 81 (ask 68, tighten 13) | 0 |
| ON | 9 | 9 (ask 7, tighten 2) | 0 |

At chain level the same: 81 / 9 overwritten chains, 0
verdict-less. What DOES happen to held picks: in ON, the 9
overwrites are budget-exhausted holds — a pick held 6 times
through ask/tighten, then overwritten on the 7th check, still
with a verdict (see held-then-overwritten detail below). So
held picks are overwritten only through the documented
budget end, never silently and never without a verdict. The
silent overwrite the departhold arm proved is real on the OFF
side (81 times) — but "silent" means "no pick record, no
departure record, no narration in the base game", not
"verdict-less in the recorder": the recorder catches every
one, with its verdict.

### The reclassification (the caveat, closed with real numbers)

Funnel HUNT picks, OFF side (all 8 in seed 75106 — funnel
records only picks where the villager held a wave-4 memory or
chose a wave-4 hunt, so the universe is small by design):

| villager | beast (wave) | pick-only lag class | joined class |
| --- | --- | --- | --- |
| catalina_reyes | hushwolf (1) | DEPARTED | departed-pick-linked |
| visjoin_102 | murkcap (1) | SUPERSEDED RE-PICK | OVERWRITTEN-BY-VERDICT |
| visjoin_102 | murkcap (1) | SUPERSEDED OTHER | OVERWRITTEN-BY-VERDICT |
| catalina_reyes | focus_group (3) | DEPARTED | departed-pick-linked |
| visjoin_102 | statickite (2) | SUPERSEDED NEEDS | superseded-by-needs-pick (never-checked: 0 evals) |
| visjoin_113 | eulogy (4) | SUPERSEDED NEEDS | superseded-by-needs-pick (never-checked: 0 evals) |
| visjoin_115 | eulogy (4) | DEPARTED | departed-pick-linked (6 evals: 5 sick-held, then go/1) |
| visjoin_113 | gallowdeer (1) | DEPARTED | departed-pick-linked |

2 of 4 pick-only SUPERSEDED readings were misreads: the
murkcap pair. The other 2 were genuine needs replacements
with zero doorway checks — the hunt was replaced before any
departure check ever ran (never-checked). ON side (2 funnel
picks, seed 75107, trajectories diverged): 1 departed, and 1
flagged linkage case — see "One flagged pick" below.

### (b) Does HUNTHOLD change the verdict distribution vs control on identical seeds?

Yes, and the shift is exactly the lever's shape — waits replace
swaps, one for one, with departures nearly unchanged:

Eval-level verdict distribution (danger verdicts deduped per
evaluation; ON delegated evaluations carry exact-duplicate
danger records from the lever pre-check + engine re-check,
deduped before counting):

| evaluation kind | OFF (456 evals) | ON (489 evals) |
| --- | --- | --- |
| departed, danger go | 151 | 148 |
| overwritten, danger ask | 68 | 7 |
| overwritten, danger tighten | 13 | 2 |
| held-ready, danger ask (lever holds) | 0 | 144 |
| held-ready, danger tighten (lever holds) | 0 | 65 |
| held-ready, no danger (early-return: sick etc.) | 209 | 113 |
| held-ready, danger go (heal sat-out) | 15 | 10 |

Chain terminals (all waves):

| terminal | OFF (236 chains) | ON (205 chains) |
| --- | --- | --- |
| DEPARTED | 151 | 148 |
| OVERWRITTEN | 81 | 9 |
| HELD-TO-HORIZON-OR-UNRECORDED | 3 | 24 |
| DIED-AFTER-LAST-EVAL (see warning) | 1 | 24 |

Cross-checks (exact): ON held-ready ask/tighten evals
144 + 65 = 209 = hunthold holds 209; ON overwrites 9 =
hunthold exhausted 9; ON narrated holds 71 (first-hold lines
only, per the lever's rule). Wave-4 chains: OFF 1 (eulogy,
departed); ON 1 (influencer, departed). The lever moves no
wave-4 chain terminal in this band — the wave-4 story here
is one departed hunt per side, not a holds effect. That is a
band-size fact (n=1 per side), not a lever verdict, and this
arm does not re-judge the pilot.

READING WARNING — the DIED-AFTER-LAST-EVAL jump (1 -> 24) is
NOT evidence that holding kills villagers. The class means
only "last evaluation held, a death recorded later". In ON,
17 of the 24 died chains have a LATER hunt chain for the same
villager — they demonstrably took another hunt afterwards,
so they did not die holding this pick. Death causes for the
24 are away-from-haven deaths (arena 6, wild 7, monster 4,
contest 3, ambush 1, combat 1) plus 1 starvation and 1 with
no matching death record at all — a villager who died in an
arena or contest was out doing something else, not sitting
at haven holding a hunt. The honest reading: holds keep
chains alive instead of overwriting them, so more chains end
in "held, then later life happened", and some of that later
life ends in death. The died-while-holding claim would need
a haven death (sickness/starvation) with no later chain —
at most 1 case in ON meets even that bar. See "metric
review" for the proposed rename and tightening.

### (c) Held split: danger-held vs heal-held vs never-checked

Terminal-held chains (held at the end of their record):

| bucket | OFF (3 held) | ON (24 held) |
| --- | --- | --- |
| danger-held (non-'go' danger verdict, not overwritten) | 0 | 24 |
| heal-held (heal sat-out, no non-'go' danger) | 1 | 0 |
| sick/early-held (early-return only) | 2 | 0 |

Never-checked funnel picks (zero doorway evaluations before
their terminal event): OFF 2 (both genuine needs
replacements), ON 1 (the flagged linkage case below — its
never-checked flag is correct; its joined class is flagged).

Held-then-walked (departed chains that were ever held):
OFF 0 danger-held-then-departed; ON 13 danger-held-then-
departed, 0 heal-held-then-departed both arms. The 13 are
the lever doing its intended job at least sometimes: held
through ask/tighten, then walked on a go. Multi-evaluation
departed chains: OFF 8, ON 20 (sick holds then walks, plus
the lever holds in ON).

### One flagged pick (the join catching a linkage error — post-hoc, not re-scored)

ON seed 75107, visjoin_171, HUNT influencer picked day 177
part 706 (huntDay 176): the pick-only class reads SUPERSEDED
NEEDS (next recorded pick WATER, part 712), but the
departhold class reads departed-pick-linked — because its
linked-departure rule matches on huntMid only, and it linked
a GUARD departure (part 708, kind GUARD, guarding
visjoin_155, carrying the same huntMid/huntDay fields) to
the HUNT pick. A guard departure is not a hunt departure.
The preregistered joined class for this pick is therefore
departed-pick-linked (as the prereg's verbatim rule gives),
but the CORRECTED reading is SUPERSEDED NEEDS, matching the
lag class. This does not change any leg (the pick still has
a class; legs are about coverage, not this pick's label),
and it does not change the ON chain census (the 706 pick
has no evaluations and no chain either way). The fix —
linked departures must require kind HUNT and matching
huntDay, as the lag class already does — is proposed under
"metric review" for the next run, not applied mid-run.

### Held-then-overwritten detail

ON: all 9 overwritten chains were lever-held first (9/9
carry other-held evaluations; 0 single-evaluation
overwrites). Seven of them run exactly 7 evaluations — 6
holds plus the terminal overwrite — the budget edge made
visible; the eighth and ninth carry extra sick-held checks
(one gallowdeer chain runs 24 evaluations: holds plus sick
waits interleaved). Every ON overwrite is therefore a
budget-exhausted hold, never a first-check swap.
OFF: 67 of 81 overwritten chains are single-evaluation
(first danger check swaps the hunt); the other 14 are
multi-evaluation chains whose earlier checks were sick
holds with no danger verdict — the swap still lands on the
first danger verdict the pick ever meets. In OFF, no chain
survives a non-'go' danger verdict: danger-held-then-
overwritten is 0 by construction of the base engine. The
contrast is the lever's mechanism in one line: OFF swaps on
first danger, ON swaps only after 6 holds.

## Sense bar — one verbatim held-pick trace, judged

The cleanest paired trace in the corpora is the same
villager, same beast, same danger score, on the same seed
and part — once without the lever, once with it.

OFF, seed 75101, jorge_silva, murkcap, day 20 part 76:

> danger ask/2 (score 2) -> action overwritten, sub
> tighten-overwrite, post HAVEN_CHORE indoor. No narration,
> no pick record, no departure record.

ON, seed 75101, jorge_silva, murkcap, day 20 part 76:

> danger ask/2 (score 2) -> action held-ready, sub
> other-held, post HUNT ready. The hunt stays decided.

Judged as a person-like decision chain: the OFF trace reads
as a person quietly giving up — the road looks middling
dangerous, so he does housework instead, and nobody (not
even the record) says why. That is the robotic part: not the
choice, but its silence. The ON trace reads as a person
waiting — the decision survives the check, which is the
human shape of "not today, but I'm still going". What
undercuts it: after that single hold, jorge's murkcap chain
goes silent for the remaining 70 days of his village's run
(he lives to day 90, no death, no further evaluation, no
departure). The hold preserved the decision for one check
and then the decision vanished anyway, replaced by
something the recorders never see. A person who waits and
then silently abandons the hunt is still a silent abandonment
— the lever fixes the doorway silence, not the pick-lottery
silence. For contrast, OFF jorge later re-picks murkcap and
departs (day 23 part 90), gets overwritten again (day 104),
and departs a cliffhanger hunt (day 124) before dying in the
wild (day 131): hunts come and go for him either way; the
lever changes one doorway, not his hunting life.

The eulogy chain (OFF seed 75106, visjoin_115, the wave-4
departure) reads the most person-like of all: five
held-ready checks over two days, every one an early return
for sickness with no danger verdict at all, then a go/1 and
a walk on day 137. Sick, waiting, recovering, walking — a
decision chain a person would recognize, and the only
wave-4 departure in the off band's funnel universe.

## Village assessment (plain words)

The villages look the same on the wall numbers either way
(won 3, national 7, table 4/3, wave-4 reach 6/4 across the
band — the hunthold pilot's numbers, not re-measured here).
What this arm adds is the doorway picture: without holds, a
hunt decision is fragile — four out of five doorway checks
that meet danger end in a swap to chores, and half the
"replaced" hunts in the pick census were actually swaps.
With holds, the decision survives moderate danger and the
swaps collapse to the budget edge. But survival at the
doorway is not survival in the village: held hunts still
vanish later without a record (jorge's 70-day silence), and
the wave-4 hunts in this band are one departure per side
regardless. The blank this arm fills is measurement, not
gameplay: the next lever run can now tell a swap from a
replacement, and can tell whether a held hunt walks, waits
to the horizon, or vanishes — instead of guessing from
pick counts. The blank it documents is the pick-lottery
silence: a ready hunt replaced by a non-HUNT pick leaves no
record in any channel, so "held to horizon or unrecorded
supersession" remains one ambiguous class. Closing that
needs a pick-side recorder for non-HUNT replacements, which
is a new instrument, not a tweak to this one.

## Metric review (for the NEXT run, not this one)

1. DIED-HOLDING is a misnomer. As defined ("last evaluation
   held, death recorded later") it mostly counts villagers
   who went on to other hunts and died later (17/24 in ON
   have a later chain; most deaths are away-from-haven).
   Proposed: rename the class DIED-AFTER-LAST-EVAL, and add
   a strict DIED-WHILE-HOLDING claim requiring no later
   chain AND a haven death cause (sickness/starvation/thirst).
2. Departhold linked departures must require objective kind
   HUNT and matching huntDay, not huntMid alone — the
   visjoin_171 GUARD linkage (above) proves the current rule
   over-links. The lag class already does this; the two
   classifiers should agree.
3. Same-key re-pick merging: chains group by (vid, mid,
   huntDay) and split only at terminals, so a held fragment
   followed by an unrecorded supersession and a re-pick of
   the same sighting merges into one chain. Terminal classes
   survive this (the last fragment decides), but chain
   evaluation counts span the gap. A pick-side channel for
   non-HUNT replacements would close it; until then, chain
   nEvals is an upper bound on one pick's checks.
4. The funnel universe stays small by design (wave-4-memory
   picks only: 8 OFF / 2 ON here). The chain universe (236 /
   205) carries the verdict-distribution answer; the pick
   universe carries the reclassification proof. Future joins
   should keep both universes and never report one as the
   other.
5. ON danger counts: delegated evaluations in the ON corpus
   carry exact-duplicate danger records (lever pre-check +
   engine re-check). The analyzer dedupes per evaluation;
   any future counter that sums raw danger lists will
   double-count ON go verdicts. Keep the dedupe.

## Files

- Analyzer: scripts/test-holdsjoin-a.js
- Fixtures: scripts/test-holdsjoin-a-fixtures.js (11/11)
- Analysis JSON: evidence/2026-10-29/holdsjoin-a-analysis.json
- Prereg: evidence/2026-10-29/sim-holdsjoin-a-prereg.md
- Corpora analyzed (not re-run, not modified):
  evidence/2026-10-29/perseed-hunthold-off/ and
  perseed-hunthold-on/
