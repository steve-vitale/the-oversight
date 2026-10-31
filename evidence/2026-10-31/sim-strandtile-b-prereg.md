# sim-strandtile-b — PRE-REGISTRATION (binding, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-strandtile-b, run
fleshout-loop-b-20261031T2343Z, axis food-economy (strand substrate).
Worktree sim-strandtile-b, branch sim-strandtile-b.
DIAG ONLY (measurement): zero src/js changes, zero policy-default
flips, zero edits to any existing policy file or existing script.
New files only (this prereg, a strand-episode analyzer, its pure
proof test, evidence, corpora, censuses). This worker does NOT push,
bump, verify live, or merge into master; the coordinator merges.
Status to coordinator: committed on branch, pending coordinator merge.

## Canon read before designing

docs/CANON.md first, then docs/MAP.md (creeks run across the map;
~35% of creek tiles need a bridge or a swimmer — a creek tile is a
place, not a bucket class; the way home runs through the same
travelTo pipeline as walking out, orthogonal steps only) and
docs/TIME-ECONOMY.md. No canon doc covers a TILE-criterion strand
episode — stated here instead of inventing canon. Standing rules
that bear on it: perception law (Steve 2026-10-28: decisions from
what the villager senses) and "no silent actions" (the sense test
reads transcripts end to end).

## Prior evidence read in full before designing anything

- evidence/2026-10-31/sim-confirmednight-b.md + prereg (DIAG-GO,
  base c9ac9183): the confirmed-night unit (creek-tile evening +
  a following morning that exists and is away) and the return-story
  split, POLICY-PERFECT — P3 deed-seeking 149/149 NO-ATTEMPT,
  P1 nighttravel-stack 6/6 FAILED-RETURN; 35 camps, ZERO walk-home
  ends. Named strands: P1 F2 17513 (confirmed failed-return camp
  days 5-9, camp 5-10 ending by succession) and 17511 (single
  confirmed failed-return night day 10). This arm reuses the
  confirmed-night definitions VERBATIM (below) and censuses
  FAILED-RETURN nights grouped into strand EPISODES.
- evidence/2026-10-31/sim-buckettile-b.md + prereg (bucket-vs-tile
  mechanism: nighttravel returns 'out-of-reach' before any hop when
  haven is beyond distance-3 travelTargets; tile and bucket must
  NEVER be merged into one creek-evening count). This arm is TILE
  only; no bucket count is pooled into any strand number here.
- evidence/2026-10-31/sim-strandred-b.md + prereg (strandred band
  re-derivation; the strict departure-night unit is superseded for
  strand purposes by the confirmed-night unit — see confirmednight
  prereg's unit argument, adopted here, not re-argued).
- The old strand sets (15215 / 15009) are NOT reused: the 1430Z
  round showed the next base move re-rolled the shared RNG stream
  and voided them. Everything here is re-derived on THIS base
  (below); the drift section names what moved, if anything.

## Base commit (pinned)

Base commit for every leg in this arm: 5aa816b4e046cc59c6339ae2d8b957cb2405efb7
(worktree HEAD at prereg writing time; includes Loop A's
sim-twoblow-a landing on top of the 2230Z base). This is NOT
confirmednight's base c9ac9183: intervening landings may have
moved trajectories, so every count here is a fresh measurement
on THIS base, never a reuse of confirmednight corpora. Drift vs
confirmednight's shared cell is reported seed-for-seed, not
assumed.

## The question

Census failed-return STRANDS under the TILE criterion and give
the strand program its first strand-rate baseline: not nights,
episodes — maximal runs of consecutive confirmed failed-return
nights for one vessel, with how each episode ends, death-aware.
A strand rate that exists only on two named seeds is a
curiosity, not a baseline; the count bar below says so plainly.

## Definitions (exact, from the confirmednight prereg — reused verbatim)

All counts are per loop-day from the absencehunt driver
(morning snap at the START of that day's daily() call,
evening snap after daily(), before the harness's sleep).
atHaven is the absencehunt haven-checked definition
(insideHaven true OR tile 'haven' OR map position equals
the village (px, py) node). The absencehunt analyzer's
class labels are reused unchanged.

- CREEK-TILE evening: an evening snap whose tile is
  'creek' AND which is NOT atHaven AND NOT onRoad
  (roadActive/roadOnRoad false). Same definition as
  strandred and confirmednight.
- CONFIRMED creek night (PRIMARY metric unit): a
  creek-tile evening whose following morning EXISTS and
  is AWAY (not atHaven). In class terms: class 'genuine'
  (which guarantees a following away morning) OR class
  'away-continuation' WITH a following away morning.
  Excluded, and reported separately, never counted in
  the primary: class 'sleep-return'; away-continuation
  creek evenings whose following morning is at haven
  (camp-final nights); class 'genuine-end-of-run' (no
  following morning exists to confirm the night); road
  creek evenings (excluded from creek-tile evenings
  already).
- FAILED-RETURN: a confirmed night whose day attempted
  return home and the attempt failed. Signals, any one
  of which suffices (the firing signal is recorded per
  night): eveningOutcome == 'out-of-reach' (nighttravel
  policy: home travel not offered — too far / no path;
  the policy's evening return step ran and the game
  refused it); eveningOutcome in {travel-refused,
  detour-stopped, detour-nopath, detour-died,
  travel-died}; ctxDelta.tripHomeDetours > 0.
- NO-ATTEMPT: a confirmed night on which none of the
  above fires.
- UNCLASSIFIED: a confirmed night whose day record is
  missing or internally inconsistent (no evening record,
  no outcome field at all). This bucket exists so
  classification completeness is honest; a night lands
  here only on instrument failure, never on ambiguity
  of story.
- BLOCKED-CROSSING flag (secondary, never promoted):
  the day's dayLines contain "no crossing without a
  bridge or a swim". It evidences a blocked crossing,
  not a failed return, and never promotes a night to
  FAILED-RETURN by itself.

## Episode rule (stated here, before any judged leg — the one new definition)

A STRAND EPISODE is a maximal run of consecutive loop-days,
each a confirmed FAILED-RETURN night, for ONE vessel (the
night's vessel is its morning snap's vesselId). Rules:

- CONSECUTIVENESS: days must be consecutive integers; a
  gap day that is not a confirmed FAILED-RETURN night
  ends the episode. No joining across gaps, ever.
- SINGLE HAVEN MORNINGS: a haven morning after a creek
  evening makes that evening UNCONFIRMED (following
  morning not away), so it can never sit inside a
  confirmed run. Episodes NEVER join across a haven
  morning: a haven morning always breaks the episode,
  whether the next morning's vessel is the same person
  (a return happened) or a different person (succession).
- VESSEL CHANGE: a morning vessel change breaks the
  episode even when the new morning is still away — the
  episode belongs to one vessel, and a new vessel starts
  a new episode (if its own nights qualify).
- SINGLETONS COUNT: an episode of length 1 is an episode
  (17511's single night is an episode, not a non-episode).
  Episode lengths are reported in full, so a baseline
  built on singletons reads as singletons, not as camps.
- END-OF-RUN TRUNCATION: a leg's last creek evening is
  always unconfirmed (no following morning exists), so an
  episode is truncated at its last confirmed night. If
  the exit day (below) is itself an end-of-run creek
  evening, the episode end is HORIZON — a horizon end is
  not a return, and is never reported as one.
- VILLAGE-DEATH TRUNCATION: if the exit day's evening
  record carries gameOver, or the leg's endReason is a
  village loss and the episode's days reach the leg's
  daysAlive, the episode end is VILLAGE-DEATH. A
  village-death end is not a return either. Horizons
  are death-aware throughout: dead villages stop
  simulating (+10d tail max is the harness's own end
  handling); never a fixed horizon that pretends a dead
  village kept stranding.

EPISODE END (the exit day X is the first loop-day after
the episode's last confirmed night that is not itself a
confirmed FAILED-RETURN night of the same vessel;
classified in this order, first match wins):

1. X has no decision record at all -> HORIZON.
2. X's evening record carries gameOver -> VILLAGE-DEATH.
3. X's morning vessel differs from the episode vessel
   -> SUCCESSION.
4. X's evening snap is atHaven (same vessel, started
   away) -> WALK-HOME.
5. X's evening snap is non-creek, non-haven (still away)
   -> MOVED-ELSEWHERE.
6. X's evening is a creek-tile evening:
   a. X is a confirmed NO-ATTEMPT night -> ATTEMPT-STOPS
      (still camped at the creek; return attempts ceased).
   b. X is unconfirmed haven-following and the morning
      after X has the same vessel -> SLEEP-RETURN (the
      villager returned overnight via the sleep step,
      not by a day's walk home — reported separately
      from WALK-HOME, never pooled into it).
   c. X is unconfirmed haven-following and the morning
      after X has a different vessel -> SUCCESSION.
   d. X is unconfirmed end-of-run -> HORIZON.
   e. Anything else -> UNCLASSIFIED-EDGE, itemized
      night by night (a bucket for instrument surprise,
      never a silent default).
7. X's morning is at haven with the same vessel -> this
   contradicts the last night's confirmed status
   (following morning away); if ever seen, it is
   UNCLASSIFIED-EDGE, itemized, and investigated, never
   smoothed over.

CAMP-FINALS (brief's term, this arm's meaning): the
episode-end classification above, itemized for EVERY
strand episode, with the death-aware caveat stated on
every citation (a horizon end is not a return; a
village-death end is not a return; a succession end is
a death, not a return).

STRAND RATE (the baseline this arm reports, per cell):
episodes total; episodes per leg; seeds with >= 1
episode; episode-length distribution (1 / 2-4 / 5+);
failed-return nights in episodes (by construction every
failed-return night sits in exactly one episode, so this
equals the failed-return night count — reported as a
consistency check, not as a second metric); episodes by
end story.

## Policies (existing files only, no edits, no default flips)

- P1 nighttravel-stack (ALL judged cells): competent.daily
  + nighttravel + withWoodcarry + withWoodwarm,
  WOODWARM=1, WOODCARRY=1. The only stack on which the
  evening return step runs (eveningOutcome 'out-of-reach'
  is observable here), and the stack of 17513's days 5-10
  camp and 17511's day-10 night. P1 FIRST, per the brief;
  no other policy cell is judged in this arm (P3's
  no-attempt population is confirmednight's camp
  population, not strands — a P3-based strand without a
  return mechanism would mislabel camps, and this arm
  does not re-measure it).

Substrate env asserted FATAL in the driver for ALL legs:
COMPETENT_FEAST=0, SEATDRIVE=0, PLENTYDEPRI=0, DEPOSITGATE=1,
MORNINGCARRY/WINDOWCARRY/STRANDFIX/PRESSB/FEDEVENING unset/0,
WOODCARRY=1, WOODWARM=1. Instruments are the absencehunt
driver/analyzer/splitter verbatim plus the strandred and
confirmednight analyzers verbatim; the ONLY new instrument
is scripts/analyze-strandtile-b.js, which reads the same
per-seed corpora, reuses classifyConfirmed, and adds
episode grouping + episode-end classification WITHOUT
redefining any absencehunt, strandred, or confirmednight
class. Its pure proof test (scripts/test-strandtile-b.js)
must pass before any judged leg runs.

## Search grid (declared fully, run exactly)

Seed bands (the absencehunt/strandred bands, reused
deliberately so drift vs confirmednight is measurable
seed-for-seed):

- Band F2: 17511, 17512, 17513, 17514, 17515, 17516, 17517, 17518
- Band F1: 17501, 17502, 17503, 17504, 17505, 17506, 17507, 17508

PILOT (8 seeds before any confirm spend, MEASUREMENT §9):
P1 F2 x 30d = 8 legs, including the named seeds 17513 and
17511. INSTRUMENT GATE before any confirm: every leg errs
0, decisions == evenings in count, loop-days complete or
a game-over with its day recorded. If the gate fails, STOP
and report — no confirm spend on a broken instrument.

DRIFT CHECK (after the pilot, before the confirm is
judged): re-derive the confirmednight census on this base
for the shared cell (P1 F2 30d — the pilot cell itself)
through the confirmednight analyzer verbatim, and compare
seed-for-seed against sim-confirmednight-b.md's P1 F2 30d
table (per-seed genuine, creek-tile, confirmed, FR, NA,
unconfirmed kinds, camp day-lists). Zero drift is
expected if the base is clean; ANY drift is reported with
its cause, not smoothed over. If the base moved the named
strands, the drift section names the new named strands
with seed/day and retires the old names explicitly — a
silent substitution is a FAIL (GO bar 3).

CONFIRM (only on a pilot GO, MEASUREMENT §9 Stage 2):
P1 F1 x 30d = 8 legs (wider seeds — the outside-pilot
cell the count bar needs) AND P1 F2 x 60d = 8 legs (same
pilot seeds, extended trajectory — tests whether strand
episodes persist past 30d). Confirm total 16 legs. No
judged band is ever below 8 seeds. Pilot cells are kept
identical for before/after comparability; the 60d legs
extend the pilot trajectories, they do not replace them.

Horizons are death-aware (MEASUREMENT §10): the harness
stops at Game.over; dead villages stop simulating (+10d
tail max is the harness's own end handling). Never a
fixed 200d. The 30d horizon matches confirmednight so the
re-derivation is seed-comparable; 60d tests persistence,
not reachability.

## Primary metric + verdict bars (judged exactly as written)

Primary metric: strand episodes per seed in the P1 F2 30d
pilot, with episode-end classification for every episode.

GO BARS (pre-registered exactly, ALL FIVE must hold):
1. INSTRUMENT GATE: every pilot + confirm leg errs 0,
   decisions == evenings, loop-days complete or game-over
   with day recorded.
2. CLASSIFICATION COMPLETENESS: >= 95% of confirmed
   nights carry a FAILED-RETURN or NO-ATTEMPT story (0
   unclassified beyond the prereg's stated edge cases,
   each itemized). Judged on pilot + confirm combined.
3. STRAND REPRODUCTION: the named P1 F2 strands re-derive
   on current master (17513 multi-night failed-return
   episode and 17511) OR, if the base moved them, the
   drift section names the new named strands with
   seed/day and the old names are retired explicitly —
   a silent substitution is a FAIL.
4. COUNT BAR: >= 2 pilot seeds with >= 1 failed-return
   strand episode, AND >= 1 confirm seed outside the
   pilot set with >= 1 such episode (a strand rate that
   exists only on two named seeds is a curiosity, not a
   baseline).
5. SENSE PASS: the sense-read episode reads as a person
   away from home (or the evidence states plainly why it
   does not, with quotes — a failed sense-read is a
   documented finding, not a GO).

- GO: verdict = STRANDTILE CENSUS COMPLETE; the strand
  rate baseline is reported per cell (episodes, episodes
  per leg, seeds with episodes, length distribution, end
  stories); DIAG-GO authorizes NO src/js fix and NO
  criterion merge.
- NO-GO (miss is NO-GO, never re-scored mid-run per
  MEASUREMENT §14): verdict = STRANDTILE CENSUS NOT
  COMPLETE on this band on current master; the failing
  bar is named exactly, with numbers.
- HELD: instrument blocked — the block is stated, no
  verdict is claimed.

Secondary reported counts (every leg, never pooled across
bands in verdict counts): creek-tile evenings, confirmed
nights, return-story split with firing signals,
blocked-crossing flag counts, unconfirmed creek evenings
by kind, confirmednight camps + camp-end stories,
genuine overnight absences (absencehunt primary, for
drift comparison), errs, game-overs.

## Staging

- PREREG (this file): committed BEFORE any judged leg.
- INSTRUMENTS: strand-episode analyzer + pure proof
  test, committed before judged legs. Pure proof must
  pass before any judged leg runs.
- JUDGED LEGS: stdout-runner transport (sim prints one
  JSON line per seed to stdout; stdout -> file in
  evidence/ in a foreground exec; idle splitter splits
  into per-seed files; jsonl deleted after split).
  Judged corpora are NEVER staged in /tmp, and judged
  legs NEVER write files from a game-loaded process.
- DRIFT CHECK: confirmednight analyzer verbatim on the
  pilot corpus, compared seed-for-seed to
  sim-confirmednight-b.md's P1 F2 30d table, reported
  before the confirm is judged.
- SENSE TEST (law): read one full strand episode's
  transcript/dayLines end to end from THIS arm's corpus
  (17513 days 5-9 if reproduced, else the longest
  episode) and judge meaning/coherence: does the record
  read as a person stuck away from home, or as a
  bookkeeping artifact? Quote the lines. A counts-only
  report FAILS the sense-testing law.
- CAMP-FINALS: itemize how every strand episode ends
  (succession / moved-elsewhere / horizon /
  village-death, plus walk-home / attempt-stops /
  sleep-return if seen), with the death-aware caveat
  stated on every citation.
- EVIDENCE: evidence/2026-10-31/sim-strandtile-b.md —
  verdict judged against prereg, census tables, drift
  section, sense-read with quotes, camp-finals, metric
  review section, village assessment in plain words.

## §15 panel (non-applicability declaration, checked before judged legs)

scripts/balance-panel.js runs sweep-compare registry policies
on 150-day horizons with its own scorecard and observer
contract. It cannot express the nighttravel+woodcarry+woodwarm
stack, a 30/60-day per-day creek census, or a census with no
variant — the same declaration every prior strand arm made.
The comparison here is a census across bands on identical
seeds through the census analyzers, never labeled a panel
comparison. No panel result is fabricated; the panel tool
is not invoked on this corpus. If a lever comparison arises
(none is planned — this arm is DIAG only), it will run
through scripts/balance-panel.js and the compare .md will
be attached.

## Metric review (open questions noted before any judged leg, not resolved by re-scoring)

- Whether a singleton failed-return night should count as
  a strand episode or only as a strand night: YES under
  this prereg (singletons are episodes of length 1, and
  the length distribution keeps them visible) — a future
  prereg can argue a length>=2 episode bar with this
  distribution as evidence.
- Whether ATTEMPT-STOPS should count as a strand end or
  as a camp continuation: it is an episode end under this
  prereg (the return attempts stopped), reported separately
  from moved-elsewhere and walk-home, so a future arm can
  re-read it either way.
- Whether SLEEP-RETURN (creek evening followed by a haven
  morning, same vessel) should pool with WALK-HOME: NO
  under this prereg — different mechanisms (sleep step vs
  day's walk), reported separately, never pooled.
- Whether camp-final nights followed by succession
  mornings should count as confirmed: NO under this
  prereg (inherited from confirmednight — the following
  morning's vessel is a different person at haven, so
  "waking still away" fails), itemized as haven-following
  unconfirmed nights.
- Whether the bridge-refusal line should ever promote a
  night to FAILED-RETURN: NO under this prereg (inherited
  from confirmednight — it does not name home as the
  destination). It is a flag only.
