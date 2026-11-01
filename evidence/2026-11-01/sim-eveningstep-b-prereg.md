# sim-eveningstep-b — PRE-REGISTRATION (binding, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-eveningstep-b, run
fleshout-loop-b-20261101T0545Z, axis food-economy (evening-step
leg decomposition). Worktree sim-eveningstep-b, branch
sim-eveningstep-b. Base: worktree HEAD 2debb6756 at prereg
writing time. This arm is DIAG ONLY (measurement): zero src/js
changes, zero policy-default flips, zero edits to any existing
policy file or existing script. New files only: this prereg,
one new analyzer (scripts/analyze-eveningstep-b.js), one pure
proof test (scripts/test-eveningstep-b.js), evidence, compare,
censuses, and drift-check corpora. The absencehunt driver
(scripts/absencehunt-trace-b.js), creekseek driver
(scripts/creekseek-trace-b.js), absencehunt analyzer,
awayeve analyzer, confirmednight analyzer, and strandtile
analyzer are REUSED VERBATIM from the base (no edits). This
worker does NOT push, bump, verify live, merge into master,
or touch the sibling Loop A tree/branch, any journey-* tree/
branch, or the main tree; the coordinator merges. Status to
coordinator: committed on branch, pending coordinator merge.

## Canon read before designing

docs/CANON.md first, then docs/MAP.md (creeks are places, not
bucket classes; the way home runs through the same travelTo
pipeline as walking out, orthogonal steps only, NO TELEPORT
ever; ~35% of creek tiles need a bridge or a swimmer) and
docs/TIME-ECONOMY.md (one clock; node travel is free; the day
has a fixed 512-tick budget; day-parts derive from ticks).
No canon doc covers an evening-step leg taxonomy — the leg
taxonomy below is read off the policy code itself
(scripts/policies/nighttravel.js nightStep,
scripts/policies/insideevening.js eveningStep), cited
branch by branch, not invented as canon. Standing rules
that bear on it: perception law (Steve 2026-10-28: every
census field is read from the villager's own evening snap,
its own day lines, and its own following morning, never
from a roster or list feed) and "no silent actions" (the
sense test reads transcripts end to end).

## Prior evidence read in full before designing anything

- evidence/2026-11-01/sim-awayeve-b.md + prereg (DIAG-GO,
  base 6409c1312): the away-evening census. Anchor fact,
  quoted: seed 17563 day 5 — on BARE the villager ends day
  5 at forest_floor (5,3) (away evening, part of the [4-9]
  episode); on P1 the same villager, same morning tile,
  ends day 5 at haven (outcome walk-no-path) — the evening
  step walked her home, breaking a longer episode. Day 4
  on the same seed is the corpus's only travel-refused
  outcome (both stacks, (4,3) hop refused, same fight
  live at the evening snap). Awayeve also showed P1 away
  nights return-attempted 30/31 vs BARE no-return-step
  35/37, and P1 WALK-HOME 2/7 episodes vs BARE 0/7 — but
  pooled shares flip by band, so pooled shares must NEVER
  be read as the evening step creating N away evenings.
  P1 WALK-HOME episodes in the pooled census: 17549
  [9-11] and 17563 [4]. BARE episodes on 17563: [4-9]
  and [11-19], both SUCCESSION; creekseek on 17563: [4]
  WALK-HOME, [6-12] SUCCESSION.
- Goal tracker closeout for run 0435Z (convergence-
  tracker.md tail): next blanks, in order: (1)
  evening-step leg decomposition via seed-day pairs
  (17563 day 5); (2) 17549 death-cause; (3) H5/H6
  refusal cells, still UNRUN; (4) patrol-departure
  narration (design surface); (5) a 120d window only
  if a new horizon-cut episode appears. THIS arm takes
  blank (1) only. Blanks (2)-(5) are NOT chased here.

## The question

WHICH leg of the evening step moves a seed's evenings —
the hop offer, the hop itself, the lodge entry, the
wood-wrapper daytime costs, or something else?
Decompose 17563 days 4-5 (and the [4-9] episode
context) leg by leg on P1 vs BARE vs creekseek, with
transcript quotes for each leg, then decompose at
least 2 additional seed-day pairs from the awayeve
pooled censuses (other WALK-HOME episodes) the same
way, so the finding is not a single-seed anecdote.
Do NOT flip any lever or default. Pooled shares are
never evidence here: only seed-day pairs, each with
its own morning, evening, and following morning.

## Leg taxonomy (read off nighttravel.js + insideevening.js)

The evening step (nighttravel.daily: competent.daily,
then nightStep as the LAST step before the harness's
sleep; creekseek replaces nighttravel with its own
imported nightStep plus a pre-step creek visit) has
these legs, in code order. Each leg's corpus signature
is stated so the classification is checkable from the
corpus alone (the corpus stores ctx._ntLast.outcome as
eveningOutcome and ctx._ntLast.travelledHome as
travelledHome; the full _ntLast record is NOT stored,
so offer/hop/entry are recovered from outcome +
travelledHome + positions by the code's own branching
— each outcome below is reachable by exactly one
branch, which is what makes the recovery exact):

- L0 NO-STEP (BARE competent-only): eveningOutcome
  'policy-no-record', travelledHome false. No evening
  machinery runs; the day's end position is whatever
  competent.daily left.
- L1 GUARD: nightStep returns before any travel.
  Signatures: outcome 'game-over' (Game.over);
  'blocked-combat' (combatLive at step time);
  'blocked-tent' (insideTent true). No hop attempted,
  no entry attempted. NOTE: the evening snap's
  inCombat is taken AFTER the step (driver order:
  baseDaily, then snap), so snap inCombat may differ
  from step-time combatLive; both are reported and
  any mismatch is itemized, never smoothed over.
- L2 OFFER: away only, haven node verified type
  'haven', haven in Game.travelTargets()? Signature
  'out-of-reach' = NOT offered: the step ran, home
  was not offered, villager sleeps away. No hop, no
  entry.
- L3 HOP: offered, one Game.travelTo(hx, hy), judged
  by position change, not return value. Signatures:
  'travel-refused' = offered, position unchanged
  (block object / null recorded; detour gate is OFF,
  so any detour-* outcome is an instrument surprise);
  travelledHome true = offered, position moved to
  the haven node. Node travel is free (no ticks, no
  kcal by engine law); the hop's own narration is
  the "Travel N tiles to Haven." day line.
- L4 ENTRY: arrived home outside, not in combat:
  insideevening.eveningStep (lodge walk + 'Go
  inside'). Signatures: 'completed' /
  'already-inside' = entry succeeded (inside true at
  snap); 'walk-no-path' = no lodge-adjacent walk
  found, or walked but no adjacent lodge pick
  (insideevening.js: walked null, or lodgePick
  null); 'no-go-inside-button' / 'entry-refused' /
  'walk-interrupted-combat' = entry attempted and
  failed by that branch. CRITICAL for this arm:
  awayeve's atHaven is position-based (inside true
  OR tile 'haven' OR map position equals the village
  node), so an entry failure on the haven node
  STILL yields a haven evening. Entry success is
  therefore NOT necessary for a haven evening; only
  the hop is.
- L5 WOOD-WRAPPER DAYTIME COSTS (P1/CS only, NOT
  part of nightStep): woodcarry morning carry
  (pre-daily, only if the day starts at haven: logs
  from the pile, 2 ticks) and woodcarry evening
  bridge attempt (post-daily, ONLY on
  travel-refused evenings); woodwarm warmth attempt
  (post-daily, ONLY on travel-refused creek
  evenings). Signatures: evening row woodcarry /
  warmth records (null = no wrapper action that
  evening). Wrapper costs can move a seed's
  TRAJECTORY across days (morning kcal/ticks,
  forage yields, morning tile), so for every pair
  the analyzer reports morning kcal/dayTicks and
  evening kcal/dayTicks per policy and states
  whether the morning tile still matched. A wrapper
  action ON the pair day itself is checked
  explicitly (woodcarry/warmth records non-null);
  trajectory divergence from EARLIER days is
  reported as divergence, never as a day-of leg.
- LX OTHER: 'travel-arrived-combat' (hop succeeded,
  fight live after hop, NO entry attempt),
  'travel-died' (hop killed the player),
  'haven-unknown' (haven node type not 'haven'),
  'step-error'. Any LX outcome on a judged pair is
  itemized as its own leg, never folded into L1-L5.

Deciding-leg rule (per pair, stated before judging):
for a P1-vs-BARE pair on one seed-day, the deciding
leg is the FIRST leg in the P1 path whose success
is necessary for the P1 evening class AND absent
on BARE: if P1 ends haven and BARE ends away, and
P1 travelledHome is true, the deciding leg is L3
HOP (entry outcome is then reported as necessary
or not: if P1 inside is false, entry is proven
NOT necessary); if P1 ends away, the deciding leg
is the leg that kept it away (L1 guard, L2 offer-
no, or L3 hop-no), stated with its signature. If
no leg can be isolated from outcome +
travelledHome + positions + records (e.g. an
instrument-surprise outcome, or a missing record),
the pair is recorded UNISOLATED and counts AGAINST
the GO bar — never re-scored, never dropped.

## Pairs (selection rules, fixed before judging)

- PAIR 0 (anchor, mandatory): seed 17563, day 5,
  P1 vs BARE vs creekseek, with day 4 (travel-
  refused context, both stacks) and the [4-9]
  episode context (BARE days 4-9; P1 days 4, 6-8;
  creekseek days 4, 6-12) decomposed alongside.
- PAIR 1 (mandatory): the OTHER P1 WALK-HOME
  episode end from the awayeve pooled census:
  seed 17549, episode [9-11] — the walk-home day
  (the first day after the last away evening on
  which the same vessel ends at haven), P1 vs BARE
  vs creekseek, same leg-by-leg treatment. If
  that day's walk home proves to be a DAYTIME walk
  (travelledHome false, evening outcome from the
  haven-tile entry branch), that IS the finding
  for the pair: not every WALK-HOME episode end is
  an evening-step hop.
- PAIR 2 (mandatory): the FIRST same-morning-tile
  P1-haven / BARE-away seed-day in the awayeve
  pooled corpora in seed order, excluding 17563
  and excluding any day already covered by pairs
  0-1. Same-morning-tile means P1 and BARE morning
  snaps agree on (tile, mapPx, mapPy) for that
  seed-day. If NO such pair exists, the fallback
  is the first P1-away / BARE-away seed-day where
  P1's leg path is L2 offer-no (out-of-reach) in
  seed order, excluding 17563 — a pair that shows
  a different leg deciding. The fallback, if used,
  is declared as fallback in the evidence, with
  the empty search stated.
- No other pairs are judged. Wider-band pooled
  shares are reported only as the awayeve census
  already reported them, never as new evidence.

## Analysis corpus + drift check (NOT judged)

Judged decomposition reads the AWAYEVE corpora
already on master in this worktree
(evidence/2026-11-01/sim-awayeve-b-corpus-pilot-*
and -confirm-*), base 6409c1312 — the exact
corpora the anchor fact cites. No judged leg is
re-run: re-running on this worktree's base
(2debb6756) would re-roll trajectories and could
move the cited pairs, which is why the anchor
pairs are judged on their own corpus.
DRIFT CHECK (reported, never judged, same pattern
as awayeve's base check): re-derive seed 17563
30d on P1, BARE, and creekseek on THIS base with
the verbatim drivers, and report whether days 4-5
outcomes, travelledHome, and evening positions
match the awayeve corpus exactly. Drift is
REPORTED, never silently substituted, and does
NOT gate the judged decomposition.

## Primary metric + verdict bars (judged exactly as written)

Primary metric: number of seed-day pairs where the
deciding leg is isolated with transcript evidence
(outcome + travelledHome + positions + wrapper/
creekseek records + quoted day lines per leg).

GO BARS (ALL must hold):
(a) PAIR 0 COMPLETE: 17563 day 5 fully decomposed
  on P1 vs BARE vs creekseek, deciding leg named
  by the deciding-leg rule, with a transcript
  quote for each leg (guard/offer/hop/entry/
  wrapper-daytime as applicable; a leg that did
  not run is quoted as absent via its null record,
  not asserted silently).
(b) TWO MORE PAIRS: pairs 1 and 2 (by the selection
  rules above) decomposed the same way, each with
  its deciding leg named and transcript quotes.
(c) INSTRUMENT COMPLETENESS: every evening in
  every judged pair day carries exactly one leg
  path (L0/L1/L2/L3/L4/L5-combination/LX); zero
  UNISOLATED pairs; zero instrument-surprise
  outcomes on judged pair days (any surprise is
  itemized and fails this bar).
(d) SENSE PASS: the decomposed days read end to
  end in transcript as a person coming home or
  failing to come home (or the evidence states
  plainly why a day does not, with quotes — a
  failed sense-read is a documented finding and
  fails this bar).

- GO: verdict = EVENINGSTEP DECOMPOSED; the
  deciding leg per pair, the transcript evidence,
  and the sense read are reported. A GO here is
  still DIAG: it authorizes NO src/js fix and NO
  default change.
- NO-GO (miss is NO-GO, never re-scored mid-run
  per MEASUREMENT §14): verdict = EVENINGSTEP NOT
  DECOMPOSED on this corpus; the failing bar is
  named exactly, with numbers. A documented
  failure to isolate any leg is a NO-GO.
- HELD: instrument blocked (bar (c) fails on
  missing records) — the block is stated, no
  verdict is claimed.

Secondary reported items (every judged pair day,
never pooled into a verdict count): morning/
evening kcal and dayTicks per policy, forage-trip
deltas, woodcarry/warmth/creekseek records,
following-morning snap (does the haven evening
stick, or does the villager go out again next
day), and the [4-9] episode context for 17563.

## Staging

- PREREG (this file): committed BEFORE any judged
  leg and before any drift-check leg.
- INSTRUMENTS: eveningstep analyzer + pure proof
  test, committed before judged legs. Pure proof
  must pass before any judged leg is decomposed.
  The proof test covers: leg-path classification
  for every outcome in the taxonomy (guard
  combat/tent/game-over, offer-no, hop-no,
  hop-yes-entry-yes, hop-yes-entry-no,
  no-travel-entry, no-step, travel-arrived-
  combat, detour surprise, haven-unknown,
  step-error); the deciding-leg rule on synthetic
  pairs (hop-decides with failed entry, offer-
  decides, hop-refusal-decides, guard-decides,
  daytime-walk-home vs evening-hop distinction);
  wrapper-record presence/absence handling; and
  analyzer wiring on a synthetic corpus dir.
- PILOT GATE (MEASUREMENT §§9-12, mapped to a
  decomposition arm): decompose PAIR 0 + PAIR 1
  first. If the instrument-completeness check
  (bar (c)) fails on either pilot pair, STOP and
  report — no wider pair spend on a broken
  instrument. PAIR 2 is the confirm spend.
- JUDGED PAIRS: read from the awayeve corpora in
  this worktree (no new sim transport for judged
  pairs). Judged analyzer output is written to
  evidence/2026-11-01/sim-eveningstep-b-census-*
  .json; pair tables to sim-eveningstep-b-compare
  .md. Drift-check corpora (if run) live under
  evidence/2026-11-01/sim-eveningstep-b-corpus-
  driftcheck-*, split per seed, jsonl deleted
  after split, never staged in /tmp.
- SENSE TEST (law): read each judged pair day's
  transcript/dayLines end to end from the corpus
  and judge meaning/coherence: does the record
  read as a person coming home (or failing to),
  or as a bookkeeping artifact? Quote the lines.
  A counts-only report FAILS the sense-testing
  law. Also sample villager behavior generally
  out of the decomposed days (goals, routines,
  dialogue, reactions) and flag anything robotic,
  static, or repeated.
- EVIDENCE: evidence/2026-11-01/sim-eveningstep-
  b.md — verdict judged against prereg, pair
  decompositions with quotes, drift section,
  sense-read with quotes, compare .md attached,
  metric review section, village assessment in
  plain words, wall numbers reported as "not
  measured by this pre-seat census" (never
  invented).

## Horizons (death-aware, never fixed 200d)

The judged window is the awayeve 30d window: the
harness stops at Game.over; dead villages stop
simulating. No 60d/200d extension is planned: a
seed-day decomposition answers its question
in-window, and any episode open at day 30 is
reported as still-away-at-horizon by the awayeve
census, not extended. The drift check uses the
same 30d horizon.

## §15 panel (non-applicability declaration, checked before judged legs)

scripts/balance-panel.js runs sweep-compare
POLICY_REGISTRY policies on 150-day horizons with
its own scorecard and observer contract. It cannot
express the nighttravel+woodcarry+woodwarm stack,
a per-seed-day leg decomposition, evening-step
leg paths, or policies that are not in the
registry (creekseek, BARE-competent as a census
stack) — the same declaration every prior strand
arm made. The comparison here is a matched
seed-day pair decomposition across policies on
identical seeds through the new eveningstep
analyzer, attached as
evidence/2026-11-01/sim-eveningstep-b-compare.md,
never labeled a panel comparison. No panel result
is fabricated; the panel tool is not invoked on
this corpus. If a lever comparison on panel terms
arises (none is planned — this arm's lever is a
decomposition, not a survival lever), it will run
through scripts/balance-panel.js and the compare
.md will be attached.

## Metric review (open questions noted before any judged leg, not resolved by re-scoring)

- Whether the hop offer can be recovered exactly
  from outcome + travelledHome + positions: YES
  by the code's branching (each outcome reachable
  by exactly one branch), PROVIDED the corpus
  outcome is the nightStep record (driver order
  confirms: eveningOutcome = ctx._ntLast.outcome).
  If a judged pair day shows an outcome whose
  branch is ambiguous (e.g. walk-no-path with
  travelledHome false AND a morning away from
  haven — entry-only vs travelled-then-returned),
  the pair is UNISOLATED and bar (c) fails; the
  ambiguity is not resolved by assumption.
- Whether snap inCombat differing from step-time
  combatLive undermines the guard leg: NO for the
  deciding leg (the step's own outcome is the
  record), but any mismatch is itemized because
  it affects how the awayeve end-cause ordering
  (combat first) reads against the step path.
- Whether wrapper daytime costs can be the
  deciding leg on a pair day: ONLY if a wrapper
  record is non-null ON that day and its effect
  is necessary for the evening class; prior-day
  trajectory divergence is reported as divergence,
  never promoted to a day-of leg.
- Carried doubt for the NEXT run: if the hop
  decides 17563 day 5 while entry fails, the next
  question is whether entry failure on the haven
  node has any gameplay consequence at all (the
  villager sleeps outside on the haven tile?) —
  but that is for the NEXT run; this run is
  judged on the decomposition it pre-registered.
