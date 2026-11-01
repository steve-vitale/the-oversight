# sim-strandtile-b — DIAG: TILE-criterion strand-episode census (NO-GO on the count bar); the strand rate lives on two named seeds and nowhere else in 16 seeds

Run: oversight-flesh-out-loop-b, arm sim-strandtile-b, run
fleshout-loop-b-20261031T2343Z, axis food-economy (strand substrate).
Worktree sim-strandtile-b, branch sim-strandtile-b. Base commit
5aa816b4e046cc59c6339ae2d8b957cb2405efb7 (worktree HEAD at prereg
writing time; includes Loop A's sim-twoblow-a landing on top of
the 2230Z base — NOT confirmednight's c9ac9183, see drift
section). DIAG ONLY (measurement): zero src/js changes, zero
policy-default flips, zero edits to any existing policy file or
existing script. New files only. This worker does NOT push, bump,
verify live, or merge into master; the coordinator merges.
Status to coordinator: committed on branch, pending coordinator merge.

## Verdict: NO-GO — judged exactly against the prereg bars

The binding prereg (evidence/2026-10-31/sim-strandtile-b-prereg.md,
commit b6197f96, written BEFORE any judged leg) set five bars, all
of which must hold. Four hold; one misses, and a miss is NO-GO,
never re-scored mid-run:

1. INSTRUMENT GATE: every pilot + confirm leg errs 0,
   decisions == evenings, loop-days complete or game-over
   with day recorded — PASSED (24/24 legs: errs 0 throughout;
   30/30 or 60/60 decisions == evenings, except the one
   village-lost leg at 35/35 with its day recorded).
2. CLASSIFICATION COMPLETENESS: >= 95% of confirmed nights
   carry a FAILED-RETURN or NO-ATTEMPT story — PASSED at
   100% (12/12 confirmed nights classified across pilot +
   confirm, 0 unclassified; the F1 cell contributes 0
   confirmed nights, so it neither helps nor hurts the
   combined rate).
3. STRAND REPRODUCTION: the named P1 F2 strands re-derive
   on current master — PASSED, exactly: 17513 multi-night
   failed-return episode days 5-9, and 17511 single night
   day 10, both reproduced on the pilot cell and again on
   the 60d extension with identical days. No substitution,
   no retirement needed.
4. COUNT BAR: >= 2 pilot seeds with >= 1 failed-return
   strand episode, AND >= 1 confirm seed outside the pilot
   set with >= 1 such episode — FAILED on the second half.
   Pilot half passes (2 seeds: 17513, 17511). Outside-pilot
   half fails: the P1 F1 30d confirm cell (8 fresh seeds)
   contains ZERO creek-tile evenings, zero confirmed
   nights, zero episodes. The 60d extension adds no new
   seed and no new episode either (same 2 episodes, same
   days). A strand rate that exists only on two named
   seeds is, per the prereg's own words, a curiosity, not
   a baseline — and that is what the data shows.
5. SENSE PASS: the sense-read episode reads as a person
   away from home — PASSED (see sense test below; the
   17513 episode reads as a person stuck working a creek
   line, with the standing narration gap stated, not
   hidden).

NO-GO is therefore the verdict, on bar 4 alone. DIAG-NO-GO
authorizes NO src/js fix and NO criterion merge, same as a
DIAG-GO would. What the census DOES deliver is the first
honest strand-rate baseline: on the P1 nighttravel stack,
2 of 16 distinct seeds carry a failed-return strand episode
(12.5%), 4 episodes across 24 legs counting the 60d
re-measurement of the same 2 episodes, episode lengths 1
and 5, ends 1 succession + 1 moved-elsewhere per
measurement (plus the same again on the 60d re-run).

## Definitions (prereg, exact — reused verbatim from confirmednight)

Creek-tile evening = evening tile 'creek', NOT atHaven, NOT
onRoad. Confirmed night = creek-tile evening + following
morning exists and is away. FAILED-RETURN = eveningOutcome
'out-of-reach' (or another attempted-travel outcome) or
tripHomeDetours > 0 on that day. NO-ATTEMPT = none of those
fires. Blocked-crossing flag = the day's dayLines contain
"no crossing without a bridge or a swim" (reported
alongside, never promoted to FAILED-RETURN).

Strand episode (this arm's one new definition): a maximal
run of consecutive loop-days, each a confirmed FAILED-RETURN
night, for ONE vessel. A haven morning always breaks an
episode (it makes the prior evening unconfirmed); a vessel
change breaks it even while still away; singletons are
episodes of length 1. Episode end is classified from the
exit day (first day after the episode's last confirmed
night that is not itself a confirmed FAILED-RETURN night
of the same vessel): HORIZON / VILLAGE-DEATH / SUCCESSION /
WALK-HOME / MOVED-ELSEWHERE / ATTEMPT-STOPS / SLEEP-RETURN /
UNCLASSIFIED-EDGE, in the prereg's order. Death-aware
caveat, stated on every citation below: a horizon end is
not a return, a village-death end is not a return, a
succession end is a death, not a return.

## THE CENSUS (judged) — 24 legs, P1 nighttravel-stack only

Instrument gate: every leg errs 0, decisions == evenings in
count (30/30, 60/60, or 35/35 village-lost), loop-days
complete or a game-over with its day recorded. Gate passed
on all three cells. Horizons death-aware (harness stops at
Game.over).

Per-seed table — P1 F2 30d (pilot, judged for GO):

genAbs = genuine overnight absences (absencehunt primary);
crTile = creek-tile evenings; conf = confirmed nights;
FR = failed-return nights; blk = confirmed nights carrying
the blocked-crossing flag; unconf = unconfirmed creek
evenings (S/H/E = sleep-return / haven-following /
end-of-run); eps = strand episodes (days, end story).

| seed | genAbs | crTile | conf | FR | blk | unconf S/H/E | eps |
|------|--------|--------|------|----|-----|--------------|-----|
| 17511 | 1 | 1 | 1 | 1 | 1 | 0/0/0 | [10] MOVED-ELSEWHERE |
| 17512 | 0 | 0 | 0 | 0 | 0 | — | — |
| 17513 | 1 | 6 | 5 | 5 | 5 | 0/1/0 | [5-9] SUCCESSION |
| 17514 | 0 | 0 | 0 | 0 | 0 | — | — |
| 17515 | 0 | 0 | 0 | 0 | 0 | — | — |
| 17516 | 0 | 0 | 0 | 0 | 0 | — | — |
| 17517 | 0 | 0 | 0 | 0 | 0 | — | — |
| 17518 | 0 | 0 | 0 | 0 | 0 | — | — |
| TOTAL | 2 | 7 | 6 | 6 | 6 | 0/1/0 | 2 episodes: 1 singleton, 1 length-5 |

17513's episode (days 5-9) sits inside camp 5-10: day 10's
evening is also creek + out-of-reach, but unconfirmed (the
following morning is at haven with a different vessel), so
it is the camp-final night, not an episode night. The
episode end is SUCCESSION via that exit day (day 10 creek
evening, following morning vessel-changed). 17511's
singleton (day 10) exits on day 11 to a forest-floor
evening, same vessel, still away — MOVED-ELSEWHERE.

Per-seed table — P1 F1 30d (confirm, outside-pilot seeds):

| seed | genAbs | crTile | conf | FR | eps |
|------|--------|--------|------|----|-----|
| 17501–17506, 17508 | 0 each | 0 | 0 | 0 | — |
| 17507 | 1 | 0 | 0 | 0 | — |
| TOTAL | 1 | 0 | 0 | 0 | 0 episodes |

The F1 cell is not a near-miss: it is a zero. One genuine
absence in 8 legs (17507) never touches a creek tile in
the evening at all. Nothing on this band is strand-shaped
on P1 in 30 days.

Per-seed table — P1 F2 60d (confirm, pilot seeds extended):

Identical to the 30d pilot on every strand number: creekTile
7, confirmed 6, FR 6, episodes [17511: day 10
MOVED-ELSEWHERE; 17513: days 5-9 SUCCESSION], camps 1
(5-10 succession). NO new episode appears in days 31-60 on
any seed, and no pilot episode lengthens past its 30d days.
The 60d legs are a re-measurement, not new strand
population. The one non-surviving leg in the whole arm is
17518 60d, village-lost day 35 (35/35 decisions ==
evenings, errs 0) — it carries no creek evenings at all,
so the death does not truncate any episode; it is noted
here because it is the only death-aware horizon in the
arm, and it changes nothing about the strand numbers.

### Strand-rate baseline (first one the program has)

- Pilot P1 F2 30d: 2/8 legs with >= 1 episode (25%),
  2 episodes, 0.25 episodes/leg, lengths {1: 1, 5+: 1},
  ends {SUCCESSION: 1, MOVED-ELSEWHERE: 1}.
- Confirm P1 F1 30d: 0/8 legs, 0 episodes.
- Confirm P1 F2 60d: 2/8 legs (same seeds), 2 episodes
  (same episodes), 0 new episodes in days 31-60.
- Distinct seeds with >= 1 episode across all cells:
  2 of 16 (17513, 17511). Failed-return nights in episodes
  = 12 across pilot + 60d re-measurement (6 + 6, the same
  6 nights measured twice) and 0 on F1 — by construction
  every failed-return night sits in exactly one episode,
  so this equals the failed-return night count and is
  reported as a consistency check, not a second metric.
- No episode ends by WALK-HOME, ATTEMPT-STOPS,
  SLEEP-RETURN, HORIZON, or VILLAGE-DEATH on this corpus.
  No UNCLASSIFIED-EDGE end fired anywhere (the
  no-record-exit reconciliation in the analyzer never
  fired either — every episode had a recorded exit day).

## Drift vs confirmednight (base c9ac9183 -> 5aa816b4e): ZERO

The shared cell (P1 F2 30d) was re-derived through the
confirmednight analyzer verbatim on this arm's pilot
corpus and compared seed-for-seed against
sim-confirmednight-b.md's P1 F2 30d table: per-seed
genuine, creek-tile, confirmed, FR, NA, unclassified,
blocked-crossing, unconfirmed kinds, confirmed-day lists,
and camp day-lists + end stories — 0 mismatches on every
field on every seed. The intervening landings (including
sim-twoblow-a) did NOT move any absence/creek trajectory
on this band. Confirmednight's tile counts and named
strands remain current; no old name is retired, no new
named strand is substituted. (The 1430Z lesson — old sets
15215/15009 voided by a base move — does NOT repeat here:
this base move left the F2 trajectories untouched.)

## SENSE TEST (law) — PASS, with the standing gap stated

Read end to end from THIS arm's pilot corpus:

- 17513, episode days 5-9 (STRAND — reads as a person
  stuck away from home). Day 5 leaves haven in the
  morning, wanders forest floor to creek, works the creek
  line ("A kingfisher works the far bank, patient as a
  tax collector"), sees Emberhold smoke — then the
  unbridged creek refuses, three times in one day ("The
  creek runs fast here — no crossing without a bridge
  or a swim"), and the evening outcome is out-of-reach.
  Days 6-9 repeat the shape with the same vessel: creek
  mornings, three refusals a day, foraging unknown
  berries, meeting Valeria (Spanish only, "just eyes,
  hands, and patience"), learning counters (Highbeam Deer
  MOVE-don't-stare, Cliffhanger eyes, Living Wire out of
  the water), gaining Green Thumb — a person living and
  learning at the creek because the way home is refused
  every evening. Day 10 repeats the refusal a final time;
  day 11 dawns at haven with a different vessel ("Haven.
  7 days. The palisade looks smaller than you remembered,
  or you got bigger. Somebody by the fire: 'Knew you'd
  walk back in. You always do.'") — the camper died and
  the mantle passed; the episode ends by succession, not
  by return. A villager who tries the crossing, is
  refused three times a day for five days, and sleeps at
  the creek night after night reads as stuck, not as
  camping.
- The gap, stated plainly (same as confirmednight's):
  no line says "she turned for home" — the failed return
  is an outcome record (out-of-reach, travelledHome
  false) plus blocked crossings, not a narrated homeward
  attempt. The sense pass rests on outcome + refusal +
  repetition, not on narration. A future strand arm that
  wants narrated attempts must narrate the out-of-reach
  outcome or ground home-directed movement another way.
- The ambient "fragments by the fire" gossip lines still
  fire while camped away (days 5, 6, 10) — texture note
  #1660, recurring, not re-filed.
- 17511, singleton day 10 (one night, then walks on).
  Day 10: forest floor morning, creek evening,
  out-of-reach, three blocked crossings, unknown shoots
  foraged. Day 11: still the same vessel, morning at the
  creek, evening on the forest floor (still out-of-reach
  on the day's travel, but the evening tile moved) —
  MOVED-ELSEWHERE. One creek night, then the villager
  walks on to other wild tiles. It reads as a night spent
  out, not as a strand camp — which is exactly why the
  length distribution matters: a baseline built on
  singletons would read differently from one built on
  5-night episodes, and this corpus has one of each.

Judgement: the sense-read episode reads as a person away
from home, stuck by a refused way home — SENSE PASS. The
failing bar is the count bar, not the sense bar, and the
two must not be conflated: the strands are real, they are
just rare.

## Reachability verdict

TILE-criterion strand episodes ARE reached on current
master — on exactly two seeds of sixteen. Waves 1-5,
Arc II/III/IV, regional → national, the table, and the win
flag are not in scope of this census and none is claimed
either way.

## Village assessment, in plain words

Picture sixteen nighttravel villages, and only two of them
ever sleep at a creek. In one, the scholar walks out on day
5, finds the creek, and cannot get back across it: five
evenings in a row the way home is refused, three blocked
crossings a day, and she makes a life of it anyway —
foraging, learning the monsters' counters, meeting a
stranger who speaks no shared language — until she dies
out there and someone else wakes up in the hall. In the
other, the scholar spends a single night at the creek and
walks on. In the other fourteen villages, nobody ever
sleeps at a creek at all in thirty days — one village has
a single night out somewhere else, and the rest sleep at
home every night. Extending the two creek villages to
sixty days adds nothing: no new creek night, no longer
episode, no later strand. So the strand program does not
have a population to design for yet; it has two specimens.
A strand fix built and tested on 17513/17511 alone would be
tuned to specimens, not to a population — the next strand
arm needs either a wider seed band, a policy that actually
puts villagers at creeks, or both, before any strand
mechanism can be measured as a rate rather than admired
as a specimen.

## Named strands (unchanged — no substitution, no retirement)

- 17513, P1 F2: episode days 5-9 (length 5), end
  SUCCESSION (exit day 10 creek evening, following
  morning vessel-changed at haven). Inside camp 5-10.
- 17511, P1 F2: episode day 10 (length 1), end
  MOVED-ELSEWHERE (exit day 11 forest-floor evening,
  same vessel, still away).
- Retired: none. New named strands: none (F1 produced
  zero; 60d produced no new episodes).

## Wall numbers

NOT RE-MEASURED BY THIS CENSUS — reported as last
measured, never fabricated. Full seat 0 / wave 5 reached 0
(Loop A lane, last measured). This pre-seat census does
not re-measure the wall and its numbers must not be
presented as wall numbers. Observed survival on judged
legs: 23 of 24 legs survived their window; the single
village-lost leg is P1 F2 60d 17518 (day 35, no creek
involvement). Median survival is window-censored (most
legs survive the full window).

## Blanks filled or documented

- Filled (this arm, measured): the first strand-rate
  baseline under the TILE criterion — episodes, not
  nights: pilot 2/8 legs, F1 0/8, 60d 2/8 (same seeds),
  distinct seeds 2/16, lengths 1 and 5, ends succession
  and moved-elsewhere. The baseline's headline is its
  thinness: the rate is real but specimen-thin.
- Filled (this arm, measured): ZERO DRIFT between
  c9ac9183 and 5aa816b4e on the shared P1 F2 30d cell
  (per-seed, all fields, 0 mismatches). Confirmednight's
  counts and named strands remain current.
- Filled (this arm, measured): CAMP-FINALS for every
  strand episode — 17513 SUCCESSION, 17511
  MOVED-ELSEWHERE, on both the 30d and 60d measurements;
  zero walk-home ends, zero horizon ends, zero
  village-death ends among episodes. (The arm's only
  village death, 17518 60d day 35, truncates no episode.)
- Documented (this arm, NOT a fix): the count-bar miss
  is a population finding, not an instrument failure —
  the instrument is clean (gate 24/24, completeness
  100%), the named strands reproduce exactly, and the
  fresh band is simply empty of creek evenings. The next
  strand arm's design question is where creek evenings
  come from on P1, not whether the census works.
- Documented (this arm, sense nuance, recurring): the
  P1 failed return is an outcome record plus blocked
  crossings, not a narrated homeward attempt — no
  dayLine says the villager turned for home.
- Documented (this arm, NOT re-filed): #1660 (creek-night
  narration residue — fire-gossip lines while camped
  away) recurs in the sense test and is not re-filed.
- No sim-findings.md append: nothing outside this arm
  arose that is not already filed (#1660) or already
  this arm's own finding (the thin rate, reported here).

## Metric review (revisions apply to the NEXT run, never mid-run)

- Prereg GO bars (gate + >= 95% classification + strand
  reproduction + count bar + sense pass): FOUR OF FIVE
  MET (gate 24/24 clean, completeness 100%, reproduction
  exact, sense pass). The count bar's outside-pilot half
  MISSED (F1 0 episodes) and was NOT rescued by pooling
  the 60d re-measurement (same seeds), by counting
  nights instead of episodes, or by any other re-score —
  the verdict is NO-GO on bar 4 alone.
- Whether a singleton failed-return night should count
  as a strand episode: YES under this prereg (singletons
  are episodes of length 1, and the length distribution
  keeps them visible). The corpus has exactly one
  singleton and one length-5 episode, so the question
  stays live for the next prereg: a length>=2 episode
  bar would cut this baseline from 2 episodes to 1.
- Whether ATTEMPT-STOPS / SLEEP-RETURN should pool with
  other ends: moot on this corpus — neither end fired.
  Both stay separate in the taxonomy for the next run.
- Whether the bridge-refusal line should ever promote a
  night to FAILED-RETURN: NO under this prereg (it does
  not name home as the destination). It fires on 6/6
  pilot confirmed nights as a flag only — every
  failed-return night here also carries the flag, but
  the flag never creates a failed return by itself.
- Whether camp-final nights followed by succession
  mornings should count as confirmed: NO under this
  prereg (inherited from confirmednight). 17513's day-10
  night is the live example: out-of-reach, creek evening,
  but unconfirmed — it bounds the episode at 5 nights
  rather than 6, and the evidence states that plainly.
- Carried doubt for the NEXT run: the count bar as
  written demands an outside-pilot confirm seed with an
  episode, but on a policy where creek evenings are this
  rare (7 in 24 legs, all on 2 seeds), an 8-seed fresh
  band can come up empty by seed luck alone. The next
  prereg should either widen the fresh band or pre-state
  a rate-based bar (e.g. episodes per leg across a
  stated band) rather than a single-seed existence bar —
  but that revision is for the NEXT run; this run is
  judged on the bar it pre-registered.

## §15 panel (non-applicability declaration)

scripts/balance-panel.js runs sweep-compare registry policies
on 150-day horizons with its own scorecard and observer
contract. It cannot express the nighttravel+woodcarry+woodwarm
stack, a 30/60-day per-day creek census, or a census with no
variant — the same declaration every prior strand arm made.
The comparison here is a census across bands on identical
seeds through the census analyzers, never labeled a panel
comparison. No panel result is fabricated; the panel tool
was not invoked on this corpus. No lever comparison arose
(DIAG only).

## Telemetry deviation check (investigated, baseline NOT rolled)

`node scripts/telemetry-check.js --baseline
telemetry-baselines/scale-wall.json --current
sim-strandtile-b-census-p1-f2-30d.json --metrics
national,table,wins,exiled` prints LOUD "national/table/
wins disappeared: baseline 12/16/16 -> current 0 (n=1
files)". Investigated as a missing-field artifact, same
class as confirmednight's round: this census carries no
national/table/wins/exiled fields at all (keys: corpusDir,
policy, horizonDays, legs, seeds, totals, episodes,
perSeed) — the check ingests a census file where the
baseline expects per-seed sweep rows, so 0 means "field
absent", not "wall moved". No genuine LOUD signal.
Baseline NOT rolled.

## Infrastructure findings (for the coordinator — NOT game findings)

1. Safe-commit index clobber hit BOTH pre-leg commits
   (prereg file, then both instrument files: committed
   files showing staged-as-deleted while byte-identical
   in the worktree). Repaired each time via
   `git update-index --add --cacheinfo` from HEAD blobs;
   `git status --short` empty + `git diff HEAD` empty
   verified after each repair. The commits themselves
   were never in doubt (blob hashes match). The
   coordinator should verify the same way after the
   final commit below.
2. EPERM flap: NOT observed on file writes in this window
   (all splitter writes landed first-try, all analyzer
   writes landed first-try). One heartbeat retry note:
   the coordinator's warning said heartbeat.sh fails with
   EPERM on fsync; this worker's heartbeat attempt at run
   start printed normally — flap impact on this arm: none
   observed beyond the coordinator's warning. Heartbeat
   retries were not needed after the first attempt
   succeeded; the tree was registered 23:45Z with ~4h
   reaper runway.
3. Judged corpora were never staged in /tmp (jsonl lived
   in evidence/ until split, then deleted, per the rule —
   no .jsonl leftovers of this arm's at evidence time).
4. Diff guard at evidence time: `git diff --name-only
   5aa816b4e -- src/ scripts/policies/` is EMPTY — no
   game code, no policy file moved under measurement.

## Proof

scripts/test-strandtile-b.js: pure 9/9 (episode grouping
incl. gap/vessel-change breaks and singleton episodes;
exit-day classification for horizon, village-death,
succession, walk-home, moved-elsewhere, attempt-stops,
sleep-return, and the unclassified-edge contradiction).
scripts/test-confirmednight-b.js re-run: 4/4 (reused
analyzer unchanged). Corpus checks: every leg errs 0,
decisions == evenings (30/30, 60/60, or 35/35
village-lost), 24/24 legs complete or game-over with its
day recorded. 60d-prefix consistency: 30d episode lists
are identical to the 60d episode lists on every seed
(same days, same ends — no episode lengthens past 30d).
Drift check: 0 mismatches vs confirmednight's P1 F2 30d
table on every per-seed field. Diff guard:
`git diff --name-only 5aa816b4e -- src/
scripts/policies/` EMPTY at evidence time.

## Files

- Prereg (binding, before judged legs):
  evidence/2026-10-31/sim-strandtile-b-prereg.md
  (commit b6197f96)
- Evidence (this file): evidence/2026-10-31/sim-strandtile-b.md
- Instruments: scripts/analyze-strandtile-b.js,
  scripts/test-strandtile-b.js (instruments commit
  c9da718c; absencehunt driver/analyzer/splitter and
  strandred + confirmednight analyzers reused verbatim
  from the base)
- Judged corpora (8 files each + stderr logs):
  evidence/2026-10-31/sim-strandtile-b-corpus-p1-f2-30d,
  sim-strandtile-b-corpus-p1-f1-30d,
  sim-strandtile-b-corpus-p1-f2-60d
- Censuses (analyzer output, one per corpus, plus the
  confirmednight re-derivation census for the pilot cell):
  evidence/2026-10-31/sim-strandtile-b-census-p1-f2-30d.json,
  sim-strandtile-b-census-p1-f1-30d.json,
  sim-strandtile-b-census-p1-f2-60d.json,
  sim-strandtile-b-census-p1-f2-30d-confirmednight.json
- No compare .md exists (no paired lever comparison — this
  is a DIAG census, never labeled a panel comparison).
- No sim-findings.md append: nothing outside this arm
  arose that is not already filed (#1660, recurring, not
  re-filed) or this arm's own finding (reported here).
