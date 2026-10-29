# sim-departlag-a — PICK-TO-DEPARTURE LAG CENSUS: DIAG-GO

Run: flesh-out loop, run fleshout-20261029T1215Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-departlag-a.
Assignment: PICK-TO-DEPARTURE LAG CENSUS (funnel-a ranked blank 3,
lag half only) — measurement ONLY, zero game change. This arm
measures how long a picked wave-4 HUNT waits before it departs,
gets superseded, or dies holding — and how stale the memory is
by the time it departs. It builds no lever and no arrival
mechanism: HUNT-holds belongs to build-pickdepart, arrival
belongs to build-returns, and the lottery lever stays killed
(sim-lottery-a).
Preregistration (binding, committed BEFORE any judged run):
evidence/2026-10-29/sim-departlag-a-prereg.md (commit
2cd0250cb). This evidence judges the census against that
prereg. No metric was changed mid-run.
VERDICT: DIAG-GO — all prereg legs pass (join completeness
2/2 with 0 unknown, determinism byte-identical, neutrality
exact to the row byte, sense bars quoted and judged). No wall
movement is claimed from re-analysis.

## Plain words first

On sixteen villages, only two wave-4 hunts were ever picked —
both on the same morning, both for the same beast, by two
women who had fought it together three days before. One
woman's hunt died within hours, replaced by dinner. The
other woman's hunt waited two days — she was sick, and the
game held her decision while she recovered — then she
walked out, two days past the point her memory was fresh,
and found an empty tile. That is the whole wave-4 lag
story on this band: not a slow pipeline, but two decisions
with opposite fates — one interrupted the same afternoon,
one held through sickness and sent out stale.

The wider picture, from every hunt picked by wave-4 memory
holders (nine picks, the secondary census), says the same
thing more loudly: hunts do not usually wait. Four of five
departures left the same day they were picked, and all four
supersessions happened within a day — three of them within
hours. The wave-4 departure is the only slow one in the
set, and its slowness has a name (sickness, recorded by
departhold-a), not a mystery. And speed does not save the
trip: every single departure in the secondary set, same-day
or two-day, arrived to an empty tile. A faster departure
would not have found the beast either — the beast had
already moved. Lag is real but narrow; arrival is the
wall behind it.

## Header (pre-registered) vs result

Band seeds 75101-75116, tableseat-nowait substrate, 180d
death-aware, LEANLINKRESCUE=1, TABLESEATNOWAIT=1,
FIELDPARTY=1, RETURNS=1, FUNNEL=1 (recorders reused
VERBATIM, never edited). Corpus:
evidence/2026-10-29/perseed-departlag-a/ (16 rows +
summary.json). Analyzer: scripts/test-departlag-a.js.

- GO LEG 1 — join completeness, UNKNOWN <= 1: RESULT
  2/2 primary picks classified, UNKNOWN 0 -> PASS.
- GO LEG 2 — determinism, seed 75106 re-run into a
  scratch dir inside this worktree: RESULT byte-identical
  to the corpus row (cmp clean; scratch dir removed
  after the comparison) -> PASS.
- GO LEG 3 — neutrality, funnel-a wall numbers on
  identical seeds: RESULT exact — wins 4/16 all lesser,
  full 0/16, nationalEver 13/16, nationalFinal 9/16,
  table 10/16, entered 4/16, wave-4 11/16, wave-5 0/16,
  median 180 capped, deaths 600, starvation 4, judgedA
  42, judgedB 31, classes ACCIDENTAL 39 / MEMORY-ONLY
  3 / DELIBERATE 0, chains 13 all STILL-ALIVE, HUNT
  departures 326 (wave-4 1), HUNT true drops 297
  (wave-4 1), per-seed judgedA identical, recorder
  errs 0 (all three recorders), overflow 0, join
  errors 0 -> PASS. Stronger than the prereg asked:
  all 16 corpus rows are BYTE-IDENTICAL to the
  funnel-a rows, not merely channel-equal.
- SENSE LEG — one picked-never-departed chain and one
  departed chain quoted verbatim and judged in plain
  words: RESULT both quoted below, judgments given
  -> PASS.
- No re-scoring: no metric was changed mid-run. The
  one instrument fix made during the run (wave lookup
  returning the true wave for any known monster id,
  commit 3690beaf2) was caught on a predecessor-corpus
  preview BEFORE the judged sweep finished and before
  any judged number was read from the departlag
  corpus; it changed no class, only repaired the
  secondary census, which had collapsed onto the
  primary (n=2) by mislabeling wave-1/2/3 picks as
  unknown-wave. The fix is documented here and in
  the commit message, not hidden.

## Census answers (primary universe: wave-4 HUNT picks, n=2)

Both picks: seed 75106, eulogy, huntDay 132, picked d135
part 536 — visjoin_113 and visjoin_115, the funnel-a
pair. The picked-never-departed population on this band
is 1, and the departed population is 1. No wave-4 HUNT
pick died holding and none held to the horizon.

(a) LAG DISTRIBUTION, departed picks: n=1, so the
    distribution IS the single value — lag 2 days,
    8 parts. Same-day share 0/1, 2+ days share 1/1.
    Quartiles are reported as the sorted values
    themselves (median 2, q1 2, q3 2) per the prereg's
    small-n discipline — no smoothed distribution is
    claimed from one departure.
(b) SUPERSESSION RATE AND LAG: 1/2 picks superseded
    (50%, n=2). Lag-to-supersession: 0 days, 3 parts
    (same day, same afternoon). Sub-kind: NEEDS (EAT).
(c) STALENESS AT DEPARTURE: the single departure left
    with memory age 5 days — past the 3-day fresh
    window — having been picked at age 3, the last
    fresh day. Stale share 1/1 (n=1). The mechanism is
    the known one: departure never re-checks age, so a
    pick made fresh can depart stale; here the two
    days of waiting (sickness hold, departhold-a
    verdict chain: 5 held-ready evaluations, reason
    sick, then danger go/1) carried it past freshness.
(d) EMPTY-TILE OUTCOME BY LAG BUCKET (descriptive
    only — lag is NOT claimed to cause empty tiles):
    the 2+ day bucket holds the single departure, and
    it dropped true (empty tile) d137 at (5,3). The
    0-day and 1-day buckets are empty in the primary
    universe, so no cross-bucket comparison exists
    here; the secondary census supplies the comparison
    (below): same-day departures ALSO arrive empty,
    4/4.
(e) PICKED-NEVER-DEPARTED, split by sub-cause:
    SUPERSEDED 1 (NEEDS, same-day), DIED-HOLDING 0,
    HELD-TO-HORIZON 0. Total 1 — the same pick
    funnel-a classed PICKED-NEVER-DEPARTED, now with
    its lag (0 days, 3 parts) attached.

## Secondary census (reported, NOT judged): all HUNT picks by wave-4 memory holders, n=9

Labeled a subset everywhere it appears (funnel picks
are recorded only for wave-4 memory holders). All 9
picks: 8 on seed 75106, 1 on seed 75115.

- DEPARTED 5/9 (56%): lag days [0,0,0,0,2], median 0,
  same-day share 4/5 (80%), 2+ days share 1/5 (20%).
  Lag parts: 0, 0, 1, 1, 8. The only 2-day lag is the
  wave-4 eulogy departure — the wave-4 case is the
  outlier, not the shape. Stale-at-departure 1/5
  (20%): again only the eulogy pick (age 5); the
  other four departed at ages 1, 1, 2, 3 (all fresh).
  True drops: 5/5 (100%) — every departure in the
  secondary set arrived to an empty tile, including
  all four same-day departures. By lag bucket: 0-day
  4/4 dropped, 2+ day 1/1 dropped. Speed does not
  rescue arrival on this band; that sentence is
  descriptive (the beast wanders independently), not
  a causal claim about lag.
- SUPERSEDED 4/9 (44%): by sub-kind RE-PICK 1, OTHER
  1, NEEDS 2. Lag days [0,0,0,1], median 0 — every
  supersession landed within a day, three within
  hours (3, 3, 3 parts). Supersession is fast; it is
  not a slow fade.
- DIED-HOLDING 0, HELD-TO-HORIZON 0, UNKNOWN 0.
- The 9, in order: catalina_reyes hushwolf d107
  DEPARTED same-part; visjoin_102 murkcap d108
  SUPERSEDED-by-re-pick (3 parts); visjoin_102 murkcap
  d108 (re-pick) SUPERSEDED-by-FORAGE next day;
  catalina_reyes focus_group d118 DEPARTED (1 part);
  visjoin_102 statickite d120 SUPERSEDED-by-EAT
  (3 parts); visjoin_113 eulogy d135 SUPERSEDED-by-EAT
  (3 parts); visjoin_115 eulogy d135 DEPARTED (2d/8p);
  visjoin_113 gallowdeer d136 DEPARTED same-part;
  app_mgpspj23354 anaconda_empress d112 DEPARTED
  (1 part).
- CAVEAT, stated plainly: SUPERSEDED-by-re-pick can
  hide a danger overwrite between picks. The murkcap
  pair is the proof: departhold-a recorded
  tighten-overwrites at parts 429 and 432 for those
  two picks, but this census (which joins picks,
  departures, and deaths only) sees them as re-pick
  and forage supersessions. The outcome classes are
  correct; the verdict underneath two of them is
  departhold's, not this census's. Any lever that
  assumes supersession means "changed her mind"
  must join the departhold verdict channel first.

## Sense-testing law (transcripts read, beats quoted)

Verdict: both chains read as played sequences, and
they read differently — one as waiting, one as
interruption. The full verbatim traces (every pick,
departure, drop, and death for each villager) are
produced by scripts/test-departlag-a-sense.js
(DEPARTLAG-SENSE PASS); the decision windows are
quoted here.

DEPARTED chain — visjoin_115, s75106, eulogy (waiting):

- PICK d133 part=528 chosen=HAVEN_CHORE candidate=
  eulogy@(5,3)/day132; d133 part=530 EAT; d133 part=531
  EAT; d134 part=532 HAVEN_CHORE; d134 part=535 EAT
  (five offered picks refused for chores and food)
- PICK d135 part=536 chosen=HUNT/eulogy huntDay=132
  candidate=eulogy@(5,3)/day132 (the take, last fresh
  day)
- DEP d137 part=544 HUNT eulogy huntDay=132 -> (5,3)
- DROP d137 part=545 eulogy @(5,3) dropped=true;
  parts 546/547/548 dropped=false (lingering)
- PICK d138 part=549 chosen=HAVEN_CHORE candidate=null
  pre=[["eulogy",5,4,127,3]] — the (5,3) memory spent
- DEATH d146 cause=the wild

Judgment: WAITING, not forgetting. She never re-picked
between d135 and d137 — the decision survived two days
untouched — and departhold-a's verdict chain says why
she waited (sick, five held-ready evaluations, then
danger go). She did not forget the beast (the memory
was still offered at every pick in the window); she
was kept home by her body, then walked to a tile the
beast had already left. The wait reads as a person
held up, not a decision decaying.

PICKED-NEVER-DEPARTED chain — visjoin_113, s75106,
eulogy (interrupted):

- PICK d135 part=536 chosen=HUNT/eulogy huntDay=132
  candidate=eulogy@(5,3)/day132 pre=[...,[eulogy,5,3,
  132,2],[gallowdeer,3,4,133,3]]
- PICK d135 part=539 chosen=EAT candidate=eulogy@
  (5,3)/day132 (same afternoon, 3 parts later — the
  hunt is still offered; dinner takes the pick)
- PICK d136 part=540 chosen=HUNT/gallowdeer huntDay=
  133 candidate=gallowdeer@(3,4)/day133
- DEP d136 part=540 HUNT gallowdeer huntDay=133 ->
  (3,4) — same part as the pick
- DROP d136 part=541 gallowdeer @(3,4) dropped=true
- (Later died d145 cause=the wild; the eulogy memory
  still listed in pre through d141, never re-offered
  as a take after d135.)

Judgment: INTERRUPTED, not forgetting and not waiting.
Three parts after choosing the eulogy hunt, she chose
dinner — while the eulogy was still the offered
candidate, so this is not a memory expiring, it is a
need outranking a decision within one afternoon. The
next morning she departed instantly (same part) on a
different beast's hunt, which proves the departure
machinery was never the blocker for her: the eulogy
decision died of interruption, and a day later a
different decision walked out the door without delay.
The contrast is the finding in miniature — same woman,
same week, one hunt interrupted in hours, another
departed in zero parts.

## Fresh-band wall (16 seeds; reported, NOT claimed as movement)

Identical to funnel-a (neutrality is exact, not
approximate): wins 4/16, all lesser, full seat 0/16.
National ever 13/16, final 9/16. Table invited 10/16,
entered 4/16. Wave-4 reach 11/16, wave-5 0/16. Median
days 180 — HORIZON-CAPPED (same caveat as funnel-a:
the median is the cap, not a survival gain). Deaths
600, starvation deaths 4. Death-cause shares match
funnel-a exactly (see the sweep summary in the run
log; analyzer wall output agrees).

## Metric review (for the NEXT run — never a mid-run re-score)

- PRIMARY-UNIVERSE SIZE: n=2 cannot support a lag
  distribution, only two dated facts. The next
  departure prereg should EITHER keep wave-4-only
  and accept anecdote-scale lag (with the secondary
  census as the shape), OR pre-register a
  matched-triple design (same anchor stories across
  arms) to give departure work a stabler lag
  population. What it must not do is quote the
  primary 1/1 stale share or 2-day median as a rate
  without its n — this evidence never does.
- LAG IN PARTS vs DAYS: a same-day supersession in
  3 parts and a next-dawn supersession are different
  waits, and this census reports both but judges
  neither. A future prereg could weight by parts
  (the 3-part dinner replacement is a sharper
  interruption story than "0 days").
- VERDICT JOIN OWED: this census deliberately does
  not join the departhold verdict channel, so held
  picks cannot split into danger-held vs heal-held
  vs never-checked, and re-pick supersessions can
  hide overwrites (murkcap pair). The HUNT-holds
  prereg (build-pickdepart) should join lag +
  verdicts in one analyzer, or it will re-inherit
  this blind spot.
- DEPARTURE-DAY DEATH RULE: the UNKNOWN rule for a
  departure on the death day fired nowhere on this
  band (0 unknown). It stays in the analyzer as a
  guard for larger bands, where day-granular deaths
  will eventually collide with a departure day.
- PANEL NOTE (standing): scripts/balance-panel.js has
  no census-ingest mode; identical-seed before/after
  corpora are the section 15 substitute, as in
  returns-a / funnel-a / lottery-a. No panel artifact
  faked, no panel verdict claimed.
- TELEMETRY DEVIATION CHECK (loop body step 10):
  corpus path for the coordinator's check is
  evidence/2026-10-29/perseed-departlag-a/*.json
  (metrics national,table,wins,exiled; baseline
  .../telemetry-baselines/scale-wall.json). Expected
  artifact class if LOUD lines appear, as in
  funnel-a: the baseline's regime does not match
  this substrate, and per-seed rows carry
  nationalEver/entered/won, not top-level
  national/table/wins paths. The band's true wall
  numbers are nationalEver 13/16, entered 4/16,
  wins 4/16. Baseline NOT rolled by this arm; the
  coordinator judges any LOUD lines.

## Blanks filled or documented

- FILLED (diagnosis, not a fix): the lag half of
  funnel-a ranked blank 3 is now measured on the
  funnel band verbatim: wave-4 pick -> departure
  lag 2d/8p (n=1, sick-held, departed stale age 5);
  pick -> supersession lag 0d/3p (n=1, dinner);
  picked-never-departed population 1 (superseded),
  died-holding 0, held-to-horizon 0; secondary lag
  shape (n=9: departures mostly same-day, supersessions
  within a day, stale departures 1/5, empty-tile
  arrivals 5/5 regardless of lag). The departure
  work now has numbers to design against instead of
  the single d135->d137 anecdote.
- DOCUMENTED (for the next arm, not built here):
  (a) the HUNT-holds prereg should judge on
  pick-linked departures AND on stale-at-departure
  share, with the departhold verdict channel joined
  (this census's held/sick story is the baseline a
  hold lever must beat, not a number it can ignore);
  (b) the arrival question stands untouched and
  sharpened: even zero-lag departures arrive empty
  (secondary 4/4 same-day dropped true), so a
  departure fix alone cannot produce meetings —
  build-returns' arrival mechanism is still the
  binding constraint behind lag; (c) the murkcap
  overwrite-hiding caveat — supersession classes
  from pick-only joins must not be read as
  "changed her mind" without verdicts.
- NOT re-judged: funnel-a DIAG-GO, pickdepart-a
  DIAG-NO-GO (narrow, leg 2), departhold-a DIAG-GO,
  lottery-a NO-GO (killed) all stand as published.
  Funnel-a's numbers are reproduced byte-identically,
  not revised.

## Village assessment in plain words

The village's hunters do not dither. When they pick a
hunt, it either walks out the door the same day or
dies the same afternoon — usually to dinner. The one
wave-4 hunt that waited did so because its hunter was
sick, and when she recovered she walked out anyway,
two days late, to nothing. Nobody on this band picked
a wave-4 hunt and then sat on it until the horizon;
nobody died while holding one. Who thrived: the
villagers whose hunts departed at once — though
"thrived" is generous, since every one of them also
found an empty tile. Who died: visjoin_113, ten days
after dinner talked her out of the eulogy hunt, out
in the wild; visjoin_115, nine days after her empty
arrival, the same way. Missing capabilities, in order:
a picked hunt that survives dinner (the interruption
problem, owned by the holds work); a way to find a
beast that moved (the arrival problem, owned by
build-returns — lag work cannot substitute for it,
because same-day departures already arrive empty);
and a story beat for the interrupted hunt, which
currently exists only in a recorder, never in a line
a player could hear.

## Test and infrastructure notes

- `node --check` clean on all four new files;
  scripts/test-departlag-a-fixtures.js exits 0 with
  FIXTURES PASS (18/18, incl. huntDay-key, death-day
  departure UNKNOWN, and supersession-outranks-death
  cases); scripts/test-departlag-a.js exits 0 with
  DEPARTLAG-LEGS PASS (join + neutrality; determinism
  separate); scripts/test-departlag-a-sense.js exits 0
  with DEPARTLAG-SENSE PASS (verbatim departed +
  non-departed chains); sweep wrapper refuses a
  conflicting EVID/SEEDS override.
- Determinism gate: seed 75106 re-run into a scratch
  dir inside this worktree byte-identical to the
  corpus row (cmp clean; scratch removed after the
  comparison). Full-corpus byte check: all 16 rows
  byte-identical to the funnel-a rows.
- Analyzer fix (commit 3690beaf2, before any judged
  number was read): the wave lookup first returned
  null for every non-wave-4 id, collapsing the
  secondary census onto the primary and reporting
  7 false unknownWave. Caught on a predecessor-corpus
  preview, fixed to return the true wave for any
  known id (unknownWave only for ids absent from
  monsters.json), re-verified with fixtures 18/18
  and the preview (secondary n=9, unknownWave 0).
  No judged corpus number was read before the fix.
- EPERM flap, one hit, absorbed: the sweep's
  flap-patient writer retried s75114-fresh.json after
  a first-attempt EPERM and verified the row by
  read-back; no seed was lost, no row predates the
  prereg commit. Safe-commit index clobber hit all
  three commits on this branch (staged-deletion twins
  of byte-identical files, including a staged +
  worktree MM variant on the analyzer-fix commit);
  repaired via HEAD-blob `git update-index --add
  --cacheinfo` with status-empty + diff-HEAD-empty +
  hash-match verification, never `git reset`. No ref
  surgery, no force, no push, no bump, no live
  verification (ship-loop line).
- Zero src/js diff on this branch (verified at
  closeout); zero policy files added or changed
  except no new recorder at all (funnel + returns
  reused verbatim); no other arm's corpus touched
  (predecessor corpora read-only; the departlag
  corpus lives in its own dir, perseed-departlag-a/).
  No push, no bump, no live verification. Ready for
  coordinator merge, pending ship — via the
  coordinator.

## Proposed backlog lines (for the coordinator — this arm does NOT edit sim-findings.md)

- [open] 2026-10-29 — departlag — wave-4 HUNT pick -> departure lag 2d/8p (n=1, sick-held, departed stale age 5); pick -> supersession 0d/3p (n=1, dinner); secondary lag shape n=9: departures mostly same-day, supersessions within a day, empty-tile arrivals 5/5 regardless of lag (sim-departlag-a).
- [open] 2026-10-29 — departlag — SUPERSEDED-by-re-pick can hide a danger overwrite between picks (murkcap pair: tighten-overwrites at parts 429/432 read as re-pick/forage supersessions in a pick-only join); HUNT-holds prereg must join the departhold verdict channel (sim-departlag-a).

## Commits

- 2cd0250cb prereg (before any judged run).
- 83ce34b1d instruments (analyzer + fixtures + sense
  + sweep wrapper).
- 3690beaf2 analyzer fix (wave lookup; before any
  judged number was read).
- Corpus + analysis + sense + this evidence: final
  commit(s) on this branch (hashes in the run report
  to the coordinator).

## Convergence

scale-onramp stays converging (NOT converged): the
pick-to-departure lag blank is now measured end to
end on the funnel band (wave-4 lag 2d stale, supersession
0d dinner, secondary shape with same-day departures
and universal empty-tile arrivals) with ranked next
work (HUNT-holds with verdicts joined; arrival
mechanism behind it) — but no wave-4 field party has
yet killed in the field, the full seat stays 0, wave 5
stays 0. The directive stands until the tracker
records this axis converged on measured evidence.
