# Journey social r62 — PRE-REGISTER (lane B, 2026-10-28)

Written before any r62 seed ran. Leg 5 (social life), cycle r62.
Rotation-b read 5 at run start. This run ADVANCES rotation-b to 6
at closeout if it lands: leg 5's named-next question from r61's
metric review is the B7 fix-scoring run, which this run carries.
(Rotation note: r61 advanced 5 -> 6, but the file read 5 again at
this run's start — the endgame r59 adoption's 4 -> 5 write landed
after r61 and clobbered it, the same class as the r59/r60/r61
clobbers. The fleet's latest intent before this run was therefore
social-next, and leg 5 also carries the named-next question.)

## Follows

- r61 (lane B, 2026-10-27, merged 1e33e53e1): FULL dry-family
  census on the PRE-B7 base — pooled 1707 convos, 2.245 dry/convo,
  dry9 99.8% of dry lines, end-on-dry 65.7%, train-line rate 0.912/
  convo, guardrails no-offer 10.8%, late picks 399, deep2 125,
  alive 8/0/9/10 (5602 died d124, arena wipe). M5: 5 reads, 0
  fabricated-history flags, 4 weak endings (carried as the fix
  run's baseline). r61's metric review fired all three
  interesting-finding rules and proposed the fix run's bars:
  dry-family < 1.0/convo AND end-on-dry < 20% AND cold-open dry
  measured (new instrument: dryTurns turn-0 rate — r61's driver
  records turn numbers only in transcript headers, so the fix
  run needs the turn-0 rate persisted per seed). This run
  ADOPTS those bars (see Bindings) and the instrument.
- B7 fix (gap-social, 43753f5b0, in master, 7 commits newer than
  r61's census commit): "exempt conversation grammar from the
  run ledger" — src/js/conversation.js + convo-beats.js +
  convo-dialogue.js + convo-mood.js. Its own probe test
  (scripts/test-dryfall-probe.js) PASSES on this run's base
  (checked before seeds ran): 24-convo forced fixture, dry
  turns/convo 0.000 (was 1.208 pre-fix), 0/24 end-on-dry (was
  17/24). That fixture is silence-heavy (177 silence picks) and
  forced, not a natural full run — so it is the unit gate, not
  the verdict. This run asks whether the fix transfers to
  natural full-run conversation.
- Commits landed between r61's census and this run's base that
  touch conversation-adjacent systems: none known to change
  dry-line logic (endgame r59 instrument-only, tackle-teach
  ledger teaches, sim arms measurement-only). Any r62-vs-r61
  move is attributed to B7 first, with other landings named if
  the move's shape does not match B7's mechanism (ledger
  exemption should cut dry9 first, self3 last).

## Leg questions

- (Q1) FIX SCORE: on fresh seeds, does B7 move the full
  dry-family census — dry/convo, share of conversations with
  >= 1 dry line, per-convo histogram, pool split (first-9
  run-ledger dry vs last-3 self-repeat)?
- (Q2) ENDINGS: does B7 move the end-on-dry share, and the
  train-line rate for direct comparison to r61's 0.912?
- (Q3) COLD OPEN (new instrument, first measurement): what
  share of conversations OPEN on a dry line — defined as the
  conversation's first NPC ('them') transcript line matching
  one of the 12 convoDeflectionLines — per seed and pooled?
  Reported, no bar (no baseline exists; r62 IS the baseline).
- (Q4) PEOPLE: do the sense-reads still read like people —
  0 fabricated-history flags — and does the weak-ending count
  fall from r61's 4?
- (Q5) GUARDRAILS (report-only): does r59's fix hold on fresh
  seeds — no-offer rate, late picks, deep2 formation, villages
  alive — in r61's range?

## Arms (fresh seeds 5701-5704, smoke 5705 30d, DAYCAP=140, death-aware)

ALL linger, seeded-speaker steering ON (constant, excluded from
the natural funnel, as r56-r61). No control arm: r61's per-seed
JSONs are the share-level comparison. No turn-identity comparison
is claimed (fresh seeds; B7 changes trajectories chaotically).
Policy is r61's policy verbatim except the r62 seed list,
evidence dir, and the cold-open instrumentation (driver-only,
zero src/js): every conversation records coldOpenDry (null
until its first 'them' line, then true/false) + coldOpenLine,
persisted per conversation and aggregated per seed into
dryCensus (coldOpenDryConvos / coldOpenSeenConvos /
coldOpenDryRate); one cold-open conversation is saved per seed
for the sense set.

## Bindings (a miss is NO-GO, never re-scored)

- F1 dry-family < 1.0/convo pooled (r61: 2.245). A miss is a
  NO-GO for B7 as a sufficient fix, not a game regression —
  B7's unit gate already passed; a pooled rate in [1.0, 2.245)
  is PARTIAL (report the remaining burden and its pool split),
  >= 2.245 is NO-EFFECT on this band.
- F2 end-on-dry < 20% pooled (r61: 65.7%). Same NO-GO reading
  as F1; both bars must pass for a B7 GO.
- M5 people: 5 sense-reads, 0 fabricated-history flags, weak
  <= 1 (the historical floor, r57; r61 baseline 4 weak
  endings). At least 2 of the 5 must be dry-bearing or
  cold-open conversations. A weak count of 2-4 with F1+F2
  passing is reported as endings-improved-but-weakness-remains,
  not a re-score of the floor.
- COLD: cold-open rate reported per seed and pooled, with the
  cold-open line class (which dry line opens). A seed with
  zero cold-open-seen conversations fails COLD (instrument
  broken, not a finding).
- D1/D2 census completeness (r61's bars, carried): census
  reported for all 4 seeds (total convos, total dry lines,
  dry/convo, share with dry, histogram, pool split, train-line
  rate) + mechanism split (preceding-pick distribution, follow
  classes, end-on-dry share, engine-counter cross-check).
  A seed with zero instrumented conversations fails D1.
- G guardrails (report-only, not bars): no-offer rate, late
  picks, deep2 pairs, villages alive at horizon — reported
  against r61 (10.8%, 399, 125, 8/0/9/10).
- NO-REGRESSION: check.js --quick at the standing profile
  (278/9). Any NEW failure vs the standing set fails the run.
- Bars explicitly NOT adopted: any dry-family threshold other
  than 1.0, any cold-open threshold (first measurement), any
  train-line threshold (reported for comparison only).

## Interesting-finding rule (pre-registered)

- dry < 1.0 AND endDry < 20% => B7 GO: the fix transfers to
  natural runs; the dry wart is closed pending the ship loop.
- dry in [1.0, 2.245) => PARTIAL: name the remaining pool
  (dry9 vs self3) and the remaining ending shape as the next
  blank; do not lower the bar to call it GO.
- dry >= 2.245 => NO-EFFECT on this band: B7's fixture win
  does not transfer; the next run must find why (fixture vs
  wild pick mix is the first suspect — B7's fixture is
  silence-heavy; wild picks are topic-heavy per r61's
  prePick split).
- cold-open rate >= 10% => cold opens are a wart of their own
  and the next run must pre-register a cold-open bar.
- Otherwise: report the census as measured; no bar invented
  after the fact.

## Metric review (§14 — mandatory section in the evidence file)

Pre-registered metrics bind the run — a miss is NO-GO, never
re-scored against a friendlier metric mid-run. Metric doubts
go here for the NEXT run. In particular: r61's numbers are a
share-level baseline only (fresh seeds); no matched-seed or
turn-identity claim is made; the cold-open instrument has no
baseline by design (first measurement); B7's probe-test PASS
is a unit gate, never a substitute for the wild census.

## Telemetry

Deviation check vs telemetry-baselines/social.json (metrics
l3.bonds, l3.deep2, dryRate — r57-r61's exact set) after the
evidence is written. A LOUD line is a same-run investigation
item before any baseline roll; r61's l3.deep2 LOUD line was
an EXPLAINED schema artifact (baseline predates the deep2
key) and the baseline was NOT rolled — the same practice
applies here unless a LOUD line is a real deviation.

## What would count as an interesting finding

Any of: B7 GO on both bars; B7 partial with a clean pool
split (dry9 collapses, self3 stands); B7 no-effect with a
wild-vs-fixture pick-mix explanation; a cold-open rate that
names a new wart (a conversation that OPENS by losing its
train of thought is a different failure than one that drifts
there); a sense-read where a dry line lands as character
rather than filler.
