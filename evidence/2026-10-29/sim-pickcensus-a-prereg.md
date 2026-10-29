# sim-pickcensus-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261029T0915Z.
Axis: scale-onramp (blocking axis, converging, NOT converged).
Worker: sim-pickcensus-a (arm sim-pickcensus-a, expanded wave-4 HUNT pick census).
Assignment: READ-ONLY DIAGNOSTIC on existing corpora — NO new sims,
NO game-code changes, NO policy changes. Classify EVERY wave-4 HUNT
pick in the larger existing corpora using sim-pickdepart-a's exact
classification scheme, to test whether pickdepart's 1/1/1/1 tie at
n=4 breaks on a bigger sample.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law). CANON GAP
(restated from sim-pickdepart-a, NOT filled with invention): no
CANON-registered doc covers departure gates, the pick lottery,
travel-to-known-monsters, or field-fight returns. docs/MAP.md
covers the map/travel surface generally, not these gates. The
classification below is derived from code (verified in
pickdepart: src/js/villager-objectives.js objPick,
objHuntCandidate, objMaybeDepart, objDepart, objDanger,
objHealGate) and from the funnel recorder code
(scripts/policies/funnel-diag.js, read before this prereg).
Nothing here is invented canon.

## Prior result being tested

sim-pickdepart-a (evidence/2026-10-29/sim-pickdepart-a.md,
prereg sim-pickdepart-a-prereg.md): DIAG-NO-GO on ONE narrow leg.
Completeness passed (4/4 classified, 0 unknown); single-class
dominance failed on a 1/1/1/1 tie at n=4 across
departed-pick-linked / superseded-by-needs-pick /
superseded-by-re-pick / candidate-null-after-pick. Family rollup,
NOT substituted for the leg: replaced-before-departure 3/4 = 75%;
departed 1/4 = 25%. The pickdepart universe was only the lottery
pilot band (seeds 75101-75108, base + arm). This census expands
that universe to every corpus whose records support the
classification, and judges whether the tie breaks.

## Corpus inventory (structural, verified before this prereg — no class split computed)

Classification needs, per seed row: funnel pick records
(funnel.picks), returns departure records (returns.departures),
and deathsList (for the died-before-departure class). Checked
per corpus (row keys + record presence, seed ranges):

- perseed-funnel-a/ — INCLUDE (primary base-code universe).
  16 seeds, 75101-75116, 183 funnel picks total. Has funnel.picks,
  returns.departures, deathsList. NOTE: the task brief said "10
  seeds, 75101-75110"; the corpus on disk is 16 seeds,
  75101-75116. The disk is the authority; all 16 are included.
- perseed-lottery-base/ — EXCLUDE from the pooled count, USE as
  re-proof cross-check only. 8 seeds, 75101-75108, 92 funnel picks.
  Sampled rows (75101, 75104, 75106) are byte-identical to the
  same-seed funnel-a rows (funnel picks, returns departures, and
  full row equal) — the lottery base sweep was built to reproduce
  the funnel corpus exactly (lottery evidence, GO leg 3). Pooling
  it with funnel-a would double-count identical picks. The
  analyzer asserts byte-identity of all 8 rows before excluding;
  if any row differs, the difference is reported in the evidence
  and that row is STILL not pooled (its seeds are a subset of the
  funnel-a band; pooling a subset band with its superset band is
  double-counting under either outcome).
- perseed-lottery-arm/ — INCLUDE as a separate stratum (lever-code
  second population, same role as in pickdepart; the lever is
  already killed, nothing here re-judges it). 8 seeds, 75101-75108,
  20 funnel picks total. Has funnel.picks, returns.departures,
  deathsList. Reported per-stratum AND in the pooled total, with
  the substrate mix flagged wherever the pooled number appears.
- perseed-returns-a/ — EXCLUDE. 16 seeds, 75101-75116, but NO
  funnel.picks and NO deathsList (returns.departures present).
  Departures alone cannot classify picks: there is no pick record
  to classify, and no death record for the died class. Saying why
  matters: this corpus measures returns, not picks.
- perseed-w4dpr2/ — EXCLUDE. 16 seeds, 75101-75116, but NO
  funnel.picks, NO returns.departures, NO deathsList (only a w4dpr
  meetings channel). It carries none of the three record types
  the classification needs.

POOLED DEFINITION (binding, unconditional): pooled = funnel-a
(16 base-code seeds) + lottery-arm (8 lever-code seeds), each pick
counted once, per-stratum splits always reported alongside the
pooled number. Lottery-base is never pooled (duplicate band).

## Recorder coverage — verified against the recorder code before this prereg

scripts/policies/funnel-diag.js records one pick record per
objPick call where EITHER the villager held a wave-4 fight memory
before the pick OR chose a wave-4 HUNT. A wave-4 HUNT pick therefore
always satisfies the second disjunct: the pickdepart coverage claim
HOLDS for the pick itself — no wave-4 HUNT pick can hide from the
recorder. Coverage limits, stated honestly (they bound what the
census can claim):

1. FIRST-LATER-PICK GAP: a "first later pick" is the first later
   RECORDED pick. If a villager's wave-4 memory is evicted (cap-4
   oldest-drop, recorded in funnel.notes) or spent (arrival drop)
   between the HUNT pick and the next pick, and the next pick
   neither holds a wave-4 memory nor chooses a wave-4 HUNT, that
   next pick goes unrecorded and the class is read off a later
   recorded pick (or horizon/gate-blocked if none exists). Effect:
   supersession lag may be overstated and, in the worst case, a
   superseded pick could misread as horizon. Mitigation (declared
   extension E1 below): the analyzer flags every pick whose
   pick-to-first-later-pick (or corpus-end) window contains a
   notes eviction of the hunt mid, and reports the count.
2. DEPARTURE JOIN: the returns recorder's departures are the
   departure side of the join; the census inherits whatever the
   returns recorder captures (pickdepart used the same join, so
   this census is comparable to it, not independent of it).
3. DEATH GRANULARITY: deaths carry day, not part (pickdepart
   caveat, carried verbatim): a death on the pick's own day is
   flagged SAME-DAY and the class rests on "no later pick record
   exists".
4. SUBSTRATE MIX: the pooled total mixes base-code trajectories
   (funnel-a) with lever-code trajectories (lottery-arm, where the
   lever rerouted villages from the first animal fight onward per
   lottery evidence). The pooled dominance leg is judged as
   pre-registered below, but any pooled claim is reported with its
   per-stratum split so a stratum-driven result cannot hide.

## Classification rules (copied from pickdepart, binding)

PRIMARY UNIVERSE: every pick record in the pooled corpora whose
chosen.kind == 'HUNT' and whose chosen.huntMid maps to a wave-4
monster in src/data/monsters.json (wave field). Picks whose
huntMid is absent from monsters.json are reported as unknown-wave,
not silently dropped. Each pick gets EXACTLY ONE class, by the
first rule that fires in this priority order (all comparisons
within the same seed row, same vid, ordered by part):

1. departed-pick-linked — a returns departure exists with same
   vid, same huntMid, dep.part >= pick.part, AND no intervening
   pick by that vid with part strictly between pick.part and
   dep.part.
2. died-before-departure — the row's deathsList records that
   villager's death (who == vid, day >= pick.day), and no later
   pick by that vid and no linked departure exists before it.
   Same-day deaths flagged SAME-DAY (see coverage limit 3).
3. superseded-by-needs-pick — the first later pick by that vid
   (any part > pick.part, before any linked departure) has
   chosen.kind in {EAT, WATER}.
4. candidate-null-after-pick — the first later pick by that vid
   (before any linked departure, not a needs pick) shows
   candidate null for this memory (candidate == null, or
   candidate.mid != this mid), while the memory is still listed
   in that pick's preSightings (or was listed on the HUNT pick
   itself). The analyzer names the closed gate(s) from the later
   pick's gates record plus memory age (age = pick day - memory
   day; offer window age 0-3), exactly as pickdepart did.
5. superseded-by-re-pick — the first later pick by that vid
   (before any linked departure, not a needs pick) still shows
   candidate.mid == this mid and chose anything else (including
   a same-mid HUNT re-pick, per pickdepart).
6. gate-blocked — no later pick, no linked departure, the
   villager is alive at corpus end, AND the HUNT pick's own gates
   record shows a blocking flag (postFleeResting true, sheltered
   true, armed false, or maxD < distance to the hunt tile).
   The analyzer names the flag.
7. horizon — no later pick, no linked departure, villager alive
   at corpus end, gates green at pick time: censoring class, not
   a mechanism claim.
8. unknown — anything not covered above.

DECLARED EXTENSIONS (do not change any class above):
- E1 (eviction flag, diagnostic only): for each classified pick,
  report whether a funnel.notes eviction of the hunt mid for
  that vid falls strictly between pick.part and the first later
  recorded pick's part (or corpus end if none). Reported as a
  count + pick list; classes are NOT changed by it.
- E2 (other-with-named-gate): if a pick lands in gate-blocked or
  horizon with a readable gate state that pickdepart's rule 6
  would not name (e.g. candidate-state flags on the pick itself),
  the evidence reports it as a named-gate note under that class,
  not as a new class. No new class is invented mid-run.
- E3 (secondary census): the same taxonomy applied to ALL HUNT
  picks (all waves) in the pooled corpora, reported separately,
  to give the all-wave vs wave-4 contrast (funnel-recorded picks
  only: picks by wave-4 memory holders or wave-4 HUNT choosers —
  labeled as such, exactly as pickdepart labeled it).

## Pre-registered DIAG-GO threshold (binding — a miss is DIAG-NO-GO)

PRIMARY METRIC: single-class dominance on the POOLED classified
n (funnel-a + lottery-arm, lottery-base excluded as duplicate).
DIAG-GO iff ALL of:
  (1) COMPLETENESS: 100% of wave-4 HUNT picks in the pooled
      universe are classified into a named mechanism (classes
      1-7), with no more than 1 pick left 'unknown' across the
      pooled corpora (pickdepart leg 1, carried);
  (2) DOMINANCE: pooled n >= 10 AND the largest single class
      holds share >= 0.50 of the pooled classified n.
      The bar is set BEFORE analysis and is not moved after
      seeing the split. The family rollup (replaced-before-
      departure = classes 3+4+5) is reported alongside but is
      NOT substituted for this leg — pickdepart's metric review
      (a) is honored by reporting both, judging by the leg.
OVERALL: DIAG-GO requires BOTH legs. If either fails, the verdict
is DIAG-NO-GO and the DIAG-NO-GO from pickdepart STANDS on the
larger sample. If pooled n < 10, leg (2) fails by definition
(INSUFFICIENT-DATA for dominance, verdict still DIAG-NO-GO, not
GO — a small universe proves nothing about dominance).

SECONDARY REPORTS (reported, not re-scored into DIAG-GO):
- Per-stratum splits (funnel-a alone, lottery-arm alone) and the
  pooled split, with shares.
- Replaced-before-departure share (classes 3+4+5) and departed
  share, pooled and per stratum.
- All-wave vs wave-4 contrast (E3).
- Whether the 1/1/1/1 tie breaks: the pooled split is reported
  as tied iff all non-zero classes hold equal counts; otherwise
  the tie is broken and the winning class is named. (Descriptive,
  not a GO leg — a broken tie with max share < 0.50 still fails
  leg (2).)
- E1 eviction-flag count.
- SENSE BAR: >= 1 full pick->departure OR pick->supersession
  trace quoted VERBATIM from a corpus, with a judgment of
  whether the villager reads like a person making a choice or an
  errand queue overwriting a decision (SENSE-TESTING LAW).
- Guards restated from the rows (NOT re-scored): starvation
  deaths, median survival, wave-4 reach, wins, per stratum.

## Instruments (new, scripts/ only)

- scripts/test-pickcensus-a.js: pure-read analyzer. Reuses
  pickdepart's classifyPick verbatim in logic (copied, not
  imported across branches — same file layout, same priority
  order). Proof duties, all machine-checked: (a) RE-PROOF:
  run against perseed-lottery-base + perseed-lottery-arm it
  re-derives pickdepart's 4-pick classification exactly
  (base 2: needs 1, departed 1; arm 2: re-pick 1,
  candidate-null 1; pooled 1/1/1/1); (b) DEDUP: all 8
  lottery-base rows byte-identical to same-seed funnel-a rows,
  asserted before exclusion; (c) DETERMINISM: two runs,
  byte-identical output; (d) WAVE-LOOKUP coverage: every
  huntMid resolved or listed unknown-wave; (e) the pooled
  classification itself (funnel-a + lottery-arm) with per-pick
  class + reason, per-stratum and pooled counts and shares,
  E1 flags, E3 all-wave census, guards.
- No new sims. No game-code, policy, or recorder changes. The
  analyzer reads corpora read-only and writes only its --out
  JSON (outside the corpora dirs).

## Metric review (for the NEXT run — never a mid-run re-score)

Doubts go in the evidence file's "metric review" section, for
the next run's prereg. Anticipated before analysis: (a) whether
the pooled dominance leg should stay per-class or whether the
family rollup should become the judged metric on a future run
(pickdepart review (a) — this run judges per-class as
pre-registered and reports the family alongside, it does not
settle the question); (b) whether the pooled mix of base-code
and lever-code strata should ever be the judged population, or
whether future censuses should judge the base-code stratum
alone with the arm as context; (c) whether the first-later-pick
rule understates departure lag (pickdepart review (e) — lags
reported alongside every class); (d) the E1 eviction-gap limit
and whether a future recorder should capture unrecorded picks
in the gap.
