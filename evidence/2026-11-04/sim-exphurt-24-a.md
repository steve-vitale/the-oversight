# sim-exphurt-24-a — VERDICT: GO (SPEC-READY)

Run: oversight-flesh-out-loop, run fleshout-20261104T1836Z (Loop A).
Worker tree: ~/workspace/worktrees/sim-exphurt-24-a. Axis: food-economy.
Arm: EXPHURT 24-seed measurement (findings backlog #1699, claimed by
this arm; the coordinator owns the backlog file — this arm does not
touch it, nor any hidden_files file, nor any sibling worktree, nor
the main tree, nor the scale-onramp axis, nor Loop B arms).
Binding prereg: evidence/2026-11-04/sim-exphurt-24-a-prereg.md
(committed BEFORE any judged sim, 6759a9810; this verdict is judged
against it, §14).
Canon read first: docs/CANON.md; PRESERVATION.md and PARTY.md read
in the prior arm. No canon doc covers away-return timing or
hurt-return narration — that still holds; the mechanism is
code-read, not invented canon. No game-code change in this arm:
MEASUREMENT ONLY. No hook was landed here — a GO here makes the
spec SPEC-READY for a future landing arm, nothing more.

## THE QUESTION, IN ONE SENTENCE

Does the M1 blank (no expedition homecoming line mentions hurt)
persist on a single adequately-powered fresh 24-seed band, with
the judge bar met — i.e., is the drafted hurt-clause spec ready
for a future landing arm?

## VERDICT — GO (SPEC-READY), BY THE PREREG'S OWN RULES

- Instrument health gate (the ONLY gate in this arm): 24/24 seeds
  complete, instrument errors 0, unclassified cases 0 (all 55
  cases in exactly one outcome bucket): PASS.
- D-last denominator: 20 expedition cases with BOTH durations
  present at last hurt, bar >= 8: PASS (met by 2.5x).
- M1 (PRIMARY): 0/16 = 0.000, GO threshold M1 <= 0.20: PASS.
- Prereg rule applied verbatim: D-last >= 8 and M1 <= 0.20 → GO
  (SPEC-READY). The spec is ready for a future landing arm.
  This arm still lands no hook and no game code.

## THE NUMBERS (24 seeds, 55 cases — the judged band, not a pooling)

- By purpose: expedition 20, forage 10, leave 12, water 6,
  visit 6, traps 1. By outcome: returned-hurt 38, died 9,
  healed-away 8.
- Expedition-case rate on this band: 20/24 = 0.83/seed — above
  the pooled prior rate of 0.50/seed, which is why the single
  24-seed band cleared the judge bar where the staged 8-seed
  pilots could not. Budgeting from the pooled rate worked.
- D-open: 3/20 = 0.150 (exped-shorter 3/20, median signed gap 0).
- D-last (judged denominator): 3/20 = 0.150 (exped-shorter 3/20,
  median signed gap 0). D-open and D-last agree exactly — same
  3 cases, same gaps at open and at last hurt. No during-episode
  cap divergence was observed on this band (unlike the prior
  arm's Abderrazak case): Owen s99943 (13 vs 17, gap 4),
  Carolina s99948 (2 vs 16, gap 14), Mateo s99951 (2 vs 19,
  gap 17). All three are exped-shorter; all three are
  returned-hurt.
- M1 (PRIMARY): 0/16 = 0.000 — not one announced expedition
  homecoming line mentions hurt.
- M1-all: 0/17 = 0.000 (the one unannounced returned-hurt
  expedition case counts as a miss, as pre-registered).
- M2: 16/17 = 0.941 — every announced hurt expedition return
  IS covered by the landed hurthome line, as in both prior
  arms. The hurt is always spoken — just never by the
  homecoming line itself.
- M3: 16/17 = 0.941 announced — the single unannounced case is
  Bill s99946 (see "Out-of-scope findings" below).
- Latency (descriptive only, NOT a primary in this arm): among
  17 returned-hurt expedition cases, 4 closed 0 parts after the
  hurt event and 13 closed 1 part after — the landed hurthome
  fix's prompt return, fourth confirmation running.
- Instrument health: errors 0, unclassified 0, hurt-return
  lines 40, retro-opened 0. Coverage note: hurt-return lines
  40 vs returned-hurt cases 38 — lines also fire for
  non-expedition purposes, so the counts are not expected to
  match exactly; the expedition closing-part capture is the
  judged record (16 announced of 17).

## SENSE TEST — RETURN-LINE PAIRS, QUOTED

All 16 announced returned-hurt expedition returns follow the
identical pattern: a true hurt line, then a celebration that
erases it in the same tick. Five representative pairs (the
other 11 are the same shape — full list in the analyzer output
under evidence/2026-11-04/sim-exphurt-24-a-analysis.txt):

1. Carolina, s99948 (hp 1, the gap-14 disconnect case):
   "🧭 Carolina returns from the wilds hurt (health 1/100) —
   the trip cut short." then "🧭 Carolina is back from past
   the south (6 stories, a new scar) (Ask them what they saw.)"
   A return at 1 health, remembered as six stories and a scar.
2. Mateo, s99951 (hp 5, gap 17): hurt line, then "🧭 Mateo is
   back from past the east (+1891 kcal for the pantry,
   4 stories, a new scar) (Ask them what they saw.)"
3. Earl, s99937 (hp 6, twice — two separate expeditions, same
   shape both times): hurt line, then "🧭 Earl is back from
   far past the north (+1058 kcal for the pantry, strange
   meat (unknown flesh — test it cautiously), 5 stories)
   (Ask them what they saw.)" and later "🧭 Earl is back from
   far past the north (+2188 kcal for the pantry, 1 story)
   (Ask them what they saw.)" Repetition is the point: this
   is not one seed's quirk, it is the template.
4. Raul, s99939 (hp 2): hurt line, then "🧭 Raul is back from
   past the west (2 stories, a new scar) (Ask them what they
   saw.)" Two stories for a return at 2 health.
5. Pavel, s99954 (hp 2, one of three Pavel hurt returns this
   band): hurt line, then "🧭 Pavel is back from past the
   north (+2250 kcal of meat, strange meat (unknown flesh —
   test it cautiously), 6 stories, a new scar) (Ask them what
   they saw.)"

Judgment, unchanged from both prior arms and now adequately
powered: the homecoming line is the return's lasting meaning,
and it never carries the hurt — not at hp 6, not at hp 1, not
with a clock disconnect, not without one. The narration blank
does not depend on the disconnect. A hurt clause appended to
that line (the drafted spec: word "hurt" present, healthy
returns byte-identical) would fix exactly the line a player
skims and remembers. The tonal contradiction is present in
16/16 announced cases; the one silent case is a different
blank (see below), not a counterexample.

## REACHABILITY + VILLAGE ASSESSMENT (plain words, diag window)

Window honestly stated: competent policy, 100d death-aware cap,
seeds 99933–99956 — an early/mid window, not a full-arc run,
and a DIAG corpus, not a scale panel. Nothing here claims
scale verdicts.
- Survived to 100d: 8/24; village-lost: 16/24 (days 14–94).
  Median daysAlive 88 (sorted: 14, 31, 37, 38, 45, 51, 52, 61,
  61, 66, 70, 87, 88, 88, 91, 94, 100 x8). Max 100 (capped).
- Wave reach: wave 4 on 14/24, wave 3 on 8/24, wave 2 on 2/24,
  wave 5 on 0/24. National / table / wins: 0/24, rank village
  on all 24 — the scale wall is untouched by this measurement
  arm, as expected.
- Deaths recorded: 283 across 24 seeds. Death-cause shares
  (from the corpus death records): "the wild" 116 (41.0%),
  monster 58 (20.5%), starvation 28 (9.9%), sickness 20 (7.1%),
  "a wound that wouldn't close" 14 (4.9%), ambush 8, "the
  arena" 8, contest 5, "a stranger" 3, thirst 2, Highbeam Deer
  2, Choir Toad 2, "the night" 2, Ad Break 2, The Terms of
  Service 2, and 11 singletons (named monsters, contest
  entities, combat, dehydration, "Inspiration") at 1 each.
  Hurt travelers are again a small part of that story: only
  9 of 55 hurt cases died, and every hurt expedition return
  made it home within 1 part. The village dies to the wider
  world — the wild, monsters, starvation — not to hurt
  returns lingering. The behavior fix holds; the remaining
  blank is what the homecoming SAYS, and this band proves
  that blank persists at adequate N.
- Who thrived / died and why: nobody in particular — survival
  tracks early pantry/monster luck, not return narration.
  The blank this run confirms is the record itself: hurt
  returns are narrated twice in one tick, and the second,
  lasting line forgets the hurt, 16 times out of 16.

## §15 BALANCED PANEL — DECLARED INAPPLICABLE (prereg-bound)

No panel compare file is attached, deliberately, for the same
reason as both prior arms: the panel driver runs its own
scorecard/cohort sims and cannot ingest event-case corpora;
it measures scale/cohort metrics, not return-line text.
Declared in the prereg BEFORE the sims. The applicable
before/after comparison (matched-seed re-run on identical
seeds) belongs to a LAND arm, which this run did not become.

## WHAT LANDS, WHAT DOES NOT

- LANDS ON THIS BRANCH (coordinator merges; worker does not
  push, bump, or verify live): prereg (6759a9810); 24-a
  instrument + proof test (3fd9af4e); the 24-a corpus (24
  per-seed JSONs + sweep summary under evidence/2026-11-04/
  perseed-exphurt-24-a/, plus the sweep log and analyzer
  output); this evidence file.
- DOES NOT LAND: no game-code change; no hook; no hurthome-rule
  change; no gate/price/deed change; no clock write-back; no
  sibling files; no hidden_files files. No [needs-eyes]
  commit: nothing player-facing changed.
- Instrument note, stated plainly: the prereg said the
  analyzer would be the confirm analyzer "unchanged except
  a filename-pattern parameter." What actually landed is a
  copy, scripts/analyze-exphurt-24-a.js, with the directory
  and filename pattern changed and the metrics byte-identical
  in behavior; the prior analyzer file is untouched. This is
  a file-layout choice, not a metric change — the judged
  numbers come from the unchanged libs (hurthome-b,
  exphurt-a, exphurt-confirm-a).

## PROOF

- scripts/test-exphurt-24-a.js: 22/22 green (band exactness,
  refusal of every other list including both confirm halves
  and the prior pilot band, D-last denominator rule, M1
  denominator rule, M1-all silent-as-miss, prereg verdict
  rule branches including the null-M1 guard).
- scripts/test-exphurt-confirm-a.js: 19/19 green (prior lib
  unchanged). scripts/test-exphurt-a.js: 21/21 green.
- Instrument errors: 0 across all 24 judged seeds. No
  unclassified cases. Retro-opened 0 (consistent with the
  sweep's hurtVillager wrapper catching cases before the
  retro path is needed on this band).
- Sweep wall time ~18 min for 24 seeds under sibling load
  (sim time 0.3–2.4s/seed; the rest is harness load under
  concurrent loop work). No re-run was spent to obtain a
  cleaner result: the corpus is complete with 0 errors.
- No node scripts/check.js run is claimed for this arm: this
  arm touches zero src/ files (git diff HEAD -- src/ empty),
  and the prior arm's check note (282 passed / 8 load-related
  failures under sibling load) is not re-litigated here.
  The coordinator's landing checks cover the merged branch.

## METRIC REVIEW (for the NEXT run, not a revision of this one)

- The single un-staged band with an instrument-health-only
  gate worked exactly as the prior metric review prescribed:
  it removed the rate-gate failure mode that stopped two
  consecutive runs, and the pooled-rate budget (24 seeds at
  0.50/seed → expected ~12) delivered 20 expedition cases.
  Future exphurt-style arms should keep this design: one
  un-staged band, gate on instrument health only, judge bar
  on the denominator — never a rate-based pilot gate on a
  thin, variable unit.
- D-open vs D-last: they agree exactly on this band (both
  3/20, same cases). The prior arm's during-episode
  divergence did not recur here either, but the pair costs
  nothing to report — keep both, keep D-last judged.
- M1/M1-all/M2/M3 worked exactly as designed. M1-all earned
  its keep this band: it caught the one silent expedition
  return (Bill s99946) that M1's denominator excludes. Keep
  the quartet for the landing arm's re-run.
- Latency no longer discriminates anything (0–1 parts every
  time, four confirmations running): future arms should not
  re-measure it as a primary. It stays descriptive only.
- Convergence state for this axis (food-economy, exphurt
  blank): BEHAVIOR FIXED (hurthome fix, 1220Z), NARRATION
  MEASURED + SPEC DRAFTED (1445Z), CONFIRM STOPPED TWICE ON
  INADEQUATE N (1445Z, 1647Z), NOW SPEC-READY ON A
  SINGLE ADEQUATELY-POWERED BAND (this arm: D-last 20,
  M1 0/16). The next step is a LAND arm (hook + matched-seed
  re-run judged at M1 >= 0.80, per the confirm prereg's LAND
  section), not another measurement band.
- Descriptive pooling, NOT judged: across all three arms,
  M1 is 0/23 (0/5 + 0/2 + 0/16) on announced expedition
  returns. This pooling is reported for context only; the
  verdict above rests solely on this band's pre-registered
  numbers, as §14 requires.

## OUT-OF-SCOPE FINDINGS (for the coordinator — not chased)

1. Silent player-at-Haven expedition return (Bill, s99946):
   a returned-hurt expedition case (hp 2 at event, monster,
   closed 1 part later) with ZERO closing-part return lines
   captured, even though playerAtHavenAtClose is true. The
   silence branch was previously observed only player-away
   (Meera, s99906 visit-silence). Either the silence branch
   is not purely a player-away phenomenon, or this is a
   capture gap for this close path. M1-all counts it as a
   miss, so the verdict is unaffected — but a future arm
   should look at this close path before assuming silence
   only happens when the player is away.
2. Walk-out (leave) cases carry awayDuration 999 (12 cases,
   outcomes healed-away/died): a sentinel, not a duration.
   They are a separate population and were excluded from
   D denominators by the purpose filter, as designed — noted
   here only so a future reader does not mistake 999 for a
   real 999-part trip.
3. Death-cause "the wild" (41.0%) dominates this band's death
   records and is a bucket, not a cause: a future
   food-economy arm that wants death-cause precision will
   need that bucket decomposed before it can judge anything
   from it.

## SENSE-TESTING LAW — SCOPE NOTE

Beyond the hurt-return corpus: no wider dialogue verdict is
claimed — transcript capture was instrumented for hurt-traveler
lines, return lines, and lines naming case villagers only. No
new silence-branch instance was observed for any purpose other
than the Bill expedition case above; the prior arm's Meera
visit-silence instance stands as the other observed case.
