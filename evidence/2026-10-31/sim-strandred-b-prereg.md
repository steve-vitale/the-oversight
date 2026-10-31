# sim-strandred-b — PRE-REGISTRATION (binding, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-strandred-b, run
fleshout-loop-b-20261031T2130Z, axis food-economy (strand substrate).
Worktree sim-strandred-b, branch sim-strandred-b.
DIAG ONLY (measurement): zero src/js changes, zero policy-default
flips, zero edits to any existing policy file or existing script.
New files only (this prereg, a creek-tile analyzer, its pure proof
test, evidence, corpora, censuses). This worker does NOT push, bump,
verify live, or merge into master; the coordinator merges. Status
to coordinator: committed on branch, pending coordinator merge.

## Canon read before designing

docs/CANON.md first, then docs/MAP.md (creeks run across the map;
~35% of creek tiles need a bridge or a swimmer — a creek tile is a
place, not a bucket class) and docs/TIME-ECONOMY.md. No canon doc
covers a creek-evening strand criterion — stated here instead of
inventing canon. Standing rules that bear on it: perception law
(Steve 2026-10-28: decisions from what the villager senses) and
"no silent actions" (the sense test reads transcripts end to end).

## Prior evidence read in full before designing anything

- evidence/2026-10-31/sim-absencehunt-b.md + prereg (DIAG-GO:
  genuine overnight absence EXISTS on current master at its base
  a3e57bfc1 — 171 genuine departure-days on 96 legs; P3
  deed-seeking 15/16 seeds; P1 nighttravel stack 3/16 seeds
  17507/17511/17513; raw creek evenings 0 on all 12 censuses;
  creek-TILE away evenings 100 across the two 30d P3 bands, e.g.
  17505 F1 creek camp days 5-9+, 17504 F1 creek evenings
  days 11-16 and 19-28; caveat stated there: tile counts are
  NOT woodcarry-bucket counts, P3 runs no woodcarry wrapper).
- hidden_files/sim-findings.md #1653 (absence precondition
  satisfied, parking condition lifted; named bands P3 F1
  17501-17508 with creek camps 17505/17504 first, or P1
  17507/17511/17513) and #1647 (strand set empty on current
  master at the 1430Z/1630Z bases; 15215 no longer strands).
- evidence/2026-10-31/sim-strandbank-b.md (old strand criterion:
  woodcarry-bucket creek evenings, 0 on its wider sweep).
- The 2030Z closeout lifted the strand parking condition, but
  woodcarry-bucket creek evenings remain 0 everywhere — this
  arm re-derives whether a LIVE strand substrate exists on
  CURRENT master, not whether any parked strand design
  revives. No parked design (fedevening branch-fire, axefirst
  joint proof) is revived by this arm under any outcome.

## Base commit (pinned)

Base commit for every leg in this arm: b26777c16
(worktree HEAD at prereg writing time). This census is a fresh
measurement on THIS base, never a reuse of absencehunt corpora
(their base a3e57bfc1 is an ancestor; intervening landings
may have moved trajectories — that drift is exactly what is
being re-derived).

## The question

On CURRENT master, does a live creek-evening substrate exist
that a future strand arm could build on — and in which
criterion, tile or bucket?

## Creek-evening criterion (defined here, in one place)

All counts are per loop-day from the absencehunt driver
(morning snap at the START of that day's daily() call,
evening snap after daily(), before the harness's sleep).
atHaven is the absencehunt haven-checked definition
(insideHaven true OR tile 'haven' OR map position equals
the village (px, py) node). The analyzer implements exactly
these; the absencehunt analyzer's class labels (genuine,
genuine-end-of-run, sleep-return, away-continuation,
away-return, day-trip, multi-hop, road-absence) are reused
unchanged.

- CREEK-TILE evening (PRIMARY for this arm): an evening
  snap whose tile is 'creek' AND which is NOT atHaven AND
  NOT onRoad (roadActive/roadOnRoad false). This is a
  place the vessel slept, not a bucket label.
- GENUINE creek-tile evening (PRIMARY metric unit): a
  creek-tile evening whose absencehunt class is 'genuine'
  or 'genuine-end-of-run' — i.e. the following morning is
  also away, or the run ended that night. A creek-tile
  evening followed by a haven morning is a SLEEP-RETURN
  creek evening, reported separately, never counted in
  the primary.
- CREEK CAMP: a maximal run of >= 2 consecutive loop-days
  whose evening snaps are creek-tile evenings (away).
  Camp days are counted from evening snaps; a camp whose
  evenings are all genuine-class is a genuine camp.
- WOODCARRY-BUCKET creek evening (OLD strand criterion,
  SECONDARY, P1 legs only): the absencehunt analyzer's
  raw bucket 'creek' evening (woodcarry store bucket ==
  'creek'), with its haven-checked count reported
  alongside (bucket creek AND eveningAway AND NOT onRoad).
  P3 legs run NO woodcarry wrapper, so no bucket count
  exists for them — stated, not hidden, and tile counts
  are NEVER cited as bucket counts.
- A seed "shows" a genuine creek-tile evening if its
  genuine-creek-tile count is >= 1 in the 30d pilot.

What this arm does NOT claim: a creek-tile evening is not
a strand. The old strand was a woodcarry-bucket creek
evening sequence (guard nights 7-9 / ON nights 7-16 on
15215, now gone). A genuine creek-tile evening is a
substrate candidate — a night the vessel actually slept
at a creek — that a future strand arm's own prereg must
still convert into a strand criterion of its own.

## Policies (existing files only, no edits, no default flips)

- P3 deed-seeking (pilot, judged): competent.daily +
  deedPatrol (far patrol, no walk home after) + surgeUpkeep.
  This is the policy that produced the 100 creek-tile
  evenings in absencehunt.
- P1 nighttravel-stack (bucket diagnostic, judged for the
  bucket criterion only, NOT for the tile GO bar):
  withWoodwarm(withWoodcarry(nighttravel)), WOODWARM=1.
  This is the only stack on which the bucket criterion is
  observable.

Substrate env asserted FATAL in the driver for ALL legs:
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
MORNINGCARRY/WINDOWCARRY/STRANDFIX/PRESSB/FEDEVENING unset/0.
P1 additionally WOODCARRY=1, WOODWARM=1; P3 WOODCARRY/WOODWARM
unset/0. Instruments are the absencehunt driver/analyzer
verbatim (scripts/absencehunt-trace-b.js,
scripts/analyze-absencehunt-b.js, scripts/split-absencehunt-jsonl-b.js);
the ONLY new instrument is scripts/analyze-strandred-b.js,
which reads the same per-seed corpora and adds the
creek-tile counts above without redefining any absencehunt
class. Its pure proof test (scripts/test-strandred-b.js)
must pass before any judged leg runs.

## Search grid (declared fully, run exactly)

Seed bands (the absencehunt bands, reused deliberately so
drift vs a3e57bfc1 is measurable seed-for-seed):

- Band F1: 17501, 17502, 17503, 17504, 17505, 17506, 17507, 17508
- Band F2: 17511, 17512, 17513, 17514, 17515, 17516, 17517, 17518

PILOT (8 seeds before any confirm spend, MEASUREMENT §9):
P3 F1 x 30d = 8 legs. INSTRUMENT GATE before any confirm:
every leg errs 0, decisions == evenings in count, loop-days
complete or a game-over with its day recorded. If the gate
fails, STOP and report — no confirm spend on a broken
instrument. Pilot bucket diagnostic (same gate, reported
separately, NOT judged for GO): P1 F1 x 30d = 8 legs.

CONFIRM (only on a pilot GO, MEASUREMENT §9 Stage 2):
P3 F1 x 60d = 8 legs (same seeds, extended trajectory —
tests whether creek-tile substrate persists past 30d) AND
P1 F2 x 30d = 8 legs (covers the named P1 band seeds
17511/17513 for the bucket criterion on a fresh band).
Confirm total 16 legs. No judged band is ever below 8 seeds.

Horizons are death-aware (MEASUREMENT §10): the harness
stops at Game.over; dead villages stop simulating (+10d
tail max is the harness's own end handling). Never a
fixed 200d. The 30d horizon matches absencehunt so the
re-derivation is seed-comparable; 60d tests persistence,
not reachability.

## Primary metric + verdict bar (judged exactly as written)

Primary metric: number of P3 F1 30d pilot seeds with >= 1
genuine creek-tile evening.

GO BAR (pre-registered exactly): >= 2 seeds in the P3 F1
30d pilot show >= 1 genuine creek-tile evening.
- GO: verdict = CREEK-TILE SUBSTRATE RE-DERIVED on current
  master; report the qualifying seeds and their creek
  camps first (17505/17504 expected from absencehunt, but
  the verdict counts what THIS base shows, not what
  absencehunt showed); confirm runs as declared above;
  name the qualifying seeds/bands for the next strand arm.
- NO-GO (miss is NO-GO, never re-scored mid-run per
  MEASUREMENT §14): verdict = CREEK-TILE SUBSTRATE NOT
  RE-DERIVED on this band on current master; NO confirm
  spend; the next strand arm must NOT cite absencehunt's
  100 creek-tile evenings as current. Bucket results are
  reported either way but NEVER rescue a tile miss: a
  bucket GO with a tile NO-GO is still a tile NO-GO, with
  the bucket count reported as its own secondary finding.
- A bucket-only GO (P1 bucket creek evenings >= 1 on >= 2
  seeds while tile misses) would be reported as
  BUCKET-SUBSTRATE-ONLY, not as a primary GO.

Secondary reported counts (every leg, never pooled across
policies/bands in verdict counts): creek-tile evenings,
genuine creek-tile evenings + days, sleep-return creek
evenings, creek camps (genuine camps flagged), raw + 
haven-checked bucket creek evenings (P1 only), genuine
overnight absences (absencehunt primary, for drift
comparison vs a3e57bfc1), errs, game-overs.

## Staging

- PREREG (this file): committed BEFORE any judged leg.
- INSTRUMENTS: strandred analyzer + pure proof test,
  committed before judged legs. Pure proof must pass
  before any judged leg runs.
- JUDGED LEGS: stdout-runner transport (sim prints one
  JSON line per seed to stdout; stdout -> file in
  evidence/ in a foreground exec; idle splitter splits
  into per-seed files; jsonl deleted after split).
  Judged corpora are NEVER staged in /tmp, and judged
  legs NEVER write files from a game-loaded process.
- SENSE TEST (law): if genuine creek-tile evenings exist,
  read at least one qualifying seed's creek evening
  transcripts end to end (departure day, creek night,
  following morning, and the village's while-you-were-gone
  beat if any): transcripts, dialogue, meaning/coherence.
  A creek night that reads as camping is a PASS on what
  exists, with narration gaps stated, not hidden. If no
  genuine creek-tile evening exists, sense-read haven-bound
  days on at least two P3 seeds (days 1-7 closely, rest
  skimmed) and state what the patrol did instead.
- EVIDENCE: evidence/2026-10-31/sim-strandred-b.md —
  per-seed creek-evening counts (tile vs bucket
  separately), GO/NO-GO verdict exactly as judged, named
  seeds/bands for the next strand arm (if any), wall
  numbers ONLY if the corpus actually measures them
  (otherwise "not measured by this pre-seat census"),
  metric review, §15 declaration.

## §15 panel (non-applicability declaration, checked before judged legs)

scripts/balance-panel.js runs sweep-compare registry policies
on 150-day horizons with its own scorecard and observer
contract. It cannot express the deed-seeking far patrol, the
nighttravel+woodcarry+woodwarm stack, a 30/60-day per-day
creek census, or a census with no variant — the same
declaration every prior strand arm made. The comparison
here is a census across policies on identical seeds through
the census analyzers, never labeled a panel comparison. No
panel result is fabricated; the panel tool is not invoked
on this corpus. If a lever comparison arises (none is
planned — this arm is DIAG only), it will run through
scripts/balance-panel.js and the compare .md will be
attached.

## Metric review (open questions noted before any judged leg, not resolved by re-scoring)

- Whether a creek-tile evening should require the vessel to
  have ARRIVED at the creek that day (vs a continuation
  evening inside a camp): NO under this prereg — camp
  continuations are genuine creek-tile evenings too, and
  camps are reported as runs so a future prereg can argue
  arrival-only with evidence.
- Whether sleep-return creek evenings (evening at creek,
  morning at haven) should count toward substrate: NO
  under this prereg — the night must survive to the next
  morning away, matching absencehunt's genuine definition.
- Whether the morning snap (after upkeep, per the
  harness's day shape) undercounts creek nights that end
  in the sleep/upkeep window: carried from absencehunt's
  metric review (P4 diagnostic 25 mornings); on P3 the
  unexplained-morning diagnostic sizes the gap here too.
- Whether bucket and tile criteria should ever be merged
  into one "creek evening" count: NO — they are different
  claims (a place vs a bucket label) and this arm keeps
  them in separate columns throughout.
