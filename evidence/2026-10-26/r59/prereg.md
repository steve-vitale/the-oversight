# Journey social r59 — PRE-REGISTER (lane B, 2026-10-26)

Written before any r59 seed ran. Leg 5 (social life), cycle r59.
Rotation-b read 5 at run start. This run ADVANCES rotation-b to 6
at closeout: r58's metric review named r59 as the displacement-fix
arm, and this run carries it — the r57→r58→r59 arc closes here,
unlike r58's hold (where r57 had named r58's question before r58
ran). If the fix arm fails its bars, the hold question re-opens
and rotation stays 5 with the reason recorded.

## Follows

r58 (lane B, 2026-10-26): residual split v3, unexplained 0/1147.
The mechanism: `partyConvoChoices` (src/js/party-formal.js) splices
the party item (party_name / party_role) at index 1 of a full
subject menu and trims to MAXC=7 from the end, cutting 'ask:others'
(and 9 other items) — displacedParty 1008/1147 (87.9%), all
in-party, displacedOther 0. Linger conversion 55.6% (r57: 53.1%).
r58 shipped NO menu fix: its job was the trace. Its metric review
named r59's question: protect 'ask:others' from the party trim
(or rank it above the party item) and measure before/after on
matched seeds.

## Design call (this run makes it, per FIGURE-IT-OUT-YOURSELF)

Party business outranking village talk is the wrong priority
when the menu is full. 'ask:others' is how the village remembers
each other — the social leg's core verb, converting at 55.6% when
offered — and the party item is a one-tap management action the
player can reach any other turn. The fix: when the party trim
displaces from a full menu, it skips 'ask:others' (displaces the
last non-'leave', non-'ask:others' choice instead). The party item
still lands at index 1; 'leave' still stays last; the list stays
bounded (degenerate all-protected menus keep at most one extra
slot — an 8th row beats losing the verb, and reactive menus
already vary MAXC). Scope is deliberately 'ask:others' ONLY, not
all topic asks: the r58 finding names one verb, and a one-verb
fix keeps the funnel measurement clean. If the funnel shows other
topic asks getting eaten next, that is a new named question, not
scope creep for this run.

## Leg questions

- (Q1) On matched seeds 5401-5404 (same policy, same driver as
  r58), does the fix cut the displacedParty share of the
  same-pick + inBuilt=false residual to near zero?
- (Q2) Does linger conversion hold (>= r58's 55.6% bar, not
  re-scored down) and do M1/M3/M4 hold?
- (Q3) Do party functions survive — party_name / party_role
  items still offered, still playable (proof test + funnel
  party-item counts)?

## Arms (seeds 5401-5404, smoke 5405 30d, DAYCAP=140, death-aware)

FIX arm only (all linger, seeded-speaker steering ON, constant,
excluded from the natural funnel, as r56-r58). Control = r58's
recorded per-seed JSONs (evidence/2026-10-26/r58/) — matched
seeds, same policy, same driver. Villages may diverge from r58's
turn-for-turn after the first protected menu (menu change ->
different picks -> different RNG path), so the comparison is
SHARE-level (displacedParty share, linger conversion), NOT
turn-identity. That divergence is expected and is not a
regression signal by itself.

## Bindings (a miss is NO-GO, never re-scored)

- F1 displacedParty share of the residual < 10% (r58: 87.9%).
  Residual defined exactly as r58: same-pick probes with
  inBuilt=false (post-wrapper list lacks 'others').
- R2 linger conversion >= 25% (r58: 55.6%; the bar is the floor,
  the comparison is the r58 value).
- M1 deep2 >= 10/seed; M3 pooled late TP >= 40%; M4 same-speaker
  knack = 0/seed; M5 5 sense-reads, 0 fabricated-history flags,
  <= 1 weak; M6 report-only (villages alive at horizon).
- P1 party items survive: party_name/party_role offered counts
  > 0 in the funnel, and the proof test shows the party item
  present + 'leave' last + list bounded after the trim.
- NO-REGRESSION: check.js --quick at the standing profile
  (r58 recovery: 278 passed / 9 failed, all pre-existing).
- Smoke gate (before full seeds): smoke PASS (bond census +
  t2pickOther wrap + funnel live) AND trace census live
  (builds > 0, every smoke probe trace-attached) AND proof
  test green on fixed code + red on HEAD code (before/after).

## Metric review (carried)

- r58's T1/T2 bars are retired for r59: the trace question is
  answered (T2 PASS 0.0% unexplained). r59 judges the FIX (F1),
  not the trace. Re-scoring the old bars on new data would be
  drift; the new bar F1 is preregistered here instead.
- Telemetry metric set stays r57's exact set (l3.bonds,
  l3.deep2, dryRate) — r58's spurious-LOUD lesson: keys outside
  l3 are a metric-selection error, not a deviation.
