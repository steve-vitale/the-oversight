# sim-confirmednight-b — DIAG: confirmed-night unit argued and censused (GO); creek camps are STRANDS on P1 and CAMPS on P3 — and no creek camp ever ends by walking home

Run: oversight-flesh-out-loop-b, arm sim-confirmednight-b, run
fleshout-loop-b-20261031T2230Z, axis food-economy (strand substrate).
Worktree sim-confirmednight-b, branch sim-confirmednight-b. Base commit
c9ac9183 (worktree HEAD at prereg writing time; NOT strandred's
b26777c16 — see drift section). DIAG ONLY (measurement): zero src/js
changes, zero policy-default flips, zero edits to any existing policy
file or existing script. New files only. This worker does NOT push,
bump, verify live, or merge into master; the coordinator merges.
Status to coordinator: committed on branch, pending coordinator merge.

## Verdict: GO — judged exactly against the prereg bars

The binding prereg (evidence/2026-10-31/sim-confirmednight-b-prereg.md,
commit 817a36f32, written BEFORE any judged leg) set three bars, all
of which must hold:

1. INSTRUMENT GATE: every pilot leg errs 0, decisions == evenings,
   loop-days complete or a game-over with its day recorded — PASSED
   (8/8 pilot legs: errs 0, 30/30 decisions == evenings, all survived).
2. CLASSIFICATION COMPLETENESS: >= 90% of pilot confirmed nights
   carry a FAILED-RETURN or NO-ATTEMPT story — PASSED at 100%
   (50/50 classified, 0 unclassified).
3. COUNT BAR: >= 2 pilot seeds with >= 1 confirmed creek night —
   PASSED at 4 seeds (17504, 17505, 17506, 17508).

GO is met on all three bars with no re-scoring and no metric moved
mid-run. The confirm ran as declared (16 legs) and sharpens the
verdict rather than qualifying it: the return-story split is
POLICY-PERFECT — P3 deed-seeking is 149/149 NO-ATTEMPT across
pilot + confirm, P1 nighttravel-stack is 6/6 FAILED-RETURN — and
across all 35 creek camps on all three cells, ZERO camps end by
walking home.

## The unit argument (as argued in the prereg, now with evidence)

The departure-night unit measures how absences BEGIN; a strand is
about how nights are LIVED and whether home is reachable from
them. The confirmed-night unit — a creek-tile evening PLUS a
following morning that exists and is away — measures the lived
fact directly, contains the departure unit as a subset (camp
opening nights that also departed haven that day), and adds the
continuation nights the departure unit throws away (17504's whole
creek life). The census below is judged under this unit.

One correction to the brief's shorthand, made IN THE PREREG
before any leg ran (not a mid-run re-score): the brief equated
"following away morning" with "genuine-class +
away-continuation-class". That equation is imprecise — an
away-continuation evening is classified by its start and its
evening, not by its following morning, and on this corpus 7
away-continuation creek evenings are followed by haven mornings
and 3 more end the run. Under the strict "waking still away"
reading the P3 F1 30d pilot counts **50 confirmed nights, not
60**: the 60 is the class-based count (9 genuine + 51
away-continuation creek evenings), and the 10-night gap is
itemized below (7 haven-following + 3 end-of-run), not hidden.
Under EITHER count the pilot GO bar (≥ 2 seeds) is met — 4 seeds
under both — so the correction changes the night count, not
the verdict.

## THE CENSUS (judged) — 24 legs

Instrument gate: every leg errs 0, decisions == evenings in count
(30/30 or 60/60, or 57/57 for the village-lost leg), loop-days
complete or a game-over with its day recorded. Gate passed on all
three cells. Horizons death-aware (harness stops at Game.over).

Definitions (prereg, exact): creek-tile evening = evening tile
'creek', NOT atHaven, NOT onRoad. Confirmed night = creek-tile
evening + following morning exists and is away. FAILED-RETURN =
eveningOutcome 'out-of-reach' (or another attempted-travel
outcome) or tripHomeDetours > 0 on that day. NO-ATTEMPT = none
of those fires. Blocked-crossing flag = the day's dayLines
contain "no crossing without a bridge or a swim" (reported
alongside, never promoted to FAILED-RETURN — the line does not
name home as the destination).

### Per-seed table — P3 F1 30d (pilot, judged for GO)

genAbs = genuine overnight absences (absencehunt primary);
crTile = creek-tile evenings; conf = confirmed nights;
FR = failed-return nights; NA = no-attempt nights;
blk = confirmed nights carrying the blocked-crossing flag;
unconf = unconfirmed creek evenings (kind: vessel-changed?);
camps = creek camps (runs of >= 2 consecutive creek-tile
evenings) with end story + confirmed nights inside.

| seed | genAbs | crTile | conf | FR | NA | blk | unconf | camps (end, conf) |
|------|--------|--------|------|----|----|-----|--------|-------------------|
| 17501 | 8 | 0 | 0 | 0 | 0 | 0 | — | — |
| 17502 | 5 | 0 | 0 | 0 | 0 | 0 | — | — |
| 17503 | 5 | 0 | 0 | 0 | 0 | 0 | — | — |
| 17504 | 4 | 16 | 14 | 0 | 14 | 3 | 16:H-vessel-changed, 28:H-vessel-changed | 11-16 succession/5, 19-28 succession/9 |
| 17505 | 4 | 25 | 21 | 0 | 21 | 7 | 9:H-changed, 16:H-changed, 22:H-changed, 30:end-of-run | 5-22 succession/15, 24-30 horizon/6 |
| 17506 | 5 | 16 | 12 | 0 | 12 | 5 | 6:H-changed, 12:H-changed, 22:sleep-return-changed, 30:end-of-run | 5-6 succession/1, 8-12 succession/4, 15-18 moved-elsewhere/4, 24-25 moved-elsewhere/2, 29-30 horizon/1 |
| 17507 | 6 | 0 | 0 | 0 | 0 | 0 | — | — |
| 17508 | 4 | 4 | 3 | 0 | 3 | 1 | 30:end-of-run | 24-25 moved-elsewhere/2, 29-30 horizon/1 |
| TOTAL | 41 | 61 | 50 | 0 | 50 | 16 | 1 sleep-return, 7 haven-following, 3 end-of-run | 11 camps: 5 succession, 3 horizon, 3 moved-elsewhere, 0 walk-home |

Confirmed days, pilot: 17504: 11-15, 19-27; 17505: 5-8, 10-15,
17-21, 24-29; 17506: 5, 8-11, 15-18, 24-25, 29; 17508: 24-25, 29.
Every haven-following unconfirmed night in the pilot coincides
with a vessel change (8/8 including the sleep-return night) —
a succession morning, not a walk home. Every end-of-run night
is a horizon night (day 30, no following morning exists).

### Per-seed table — P3 F1 60d (confirm)

| seed | genAbs | crTile | conf | FR | NA | blk | unconf | camps (end) |
|------|--------|--------|------|----|----|-----|--------|-------------|
| 17501 | 13 | 14 | 10 | 0 | 10 | 5 | 31:H-changed, 39:H-changed, 50:H-changed, 58:H-changed | 36-39 succession, 47-50 succession, 54-58 succession |
| 17502 | 10 | 0 | 0 | 0 | 0 | 0 | — | — |
| 17503 | 11 | 1 | 1 | 0 | 1 | 0 | — | (single night day 37, no camp) |
| 17504 | 7 | 36 | 31 | 0 | 31 | 3 | 16:H-changed, 28:H-changed, 44:H-changed, 54:H-changed, 60:end-of-run | 11-16 succession, 19-28 succession, 31-44 succession, 51-54 succession, 59-60 horizon |
| 17505 | 9 | 25 | 21 | 0 | 21 | 7 | 9:H-changed, 16:H-changed, 22:H-changed, 30:H-changed | 5-22 succession, 24-30 succession |
| 17506 | 9 | 33 | 27 | 0 | 27 | 16 | 6:H-changed, 12:H-changed, 22:sleep-return-changed, 37:H-changed, 56:H-changed, 57:end-of-run | 5-6 succession, 8-12 succession, 15-18 moved-elsewhere, 24-25 moved-elsewhere, 29-39 moved-elsewhere, 43-44 moved-elsewhere, 50-51 moved-elsewhere, 54-57 horizon |
| 17507 | 12 | 0 | 0 | 0 | 0 | 0 | — | — |
| 17508 | 9 | 11 | 9 | 0 | 9 | 4 | 46:H-changed, 60:end-of-run | 24-25 moved-elsewhere, 29-30 moved-elsewhere, 33-35 moved-elsewhere, 45-46 succession, 59-60 horizon |
| TOTAL | 80 | 120 | 99 | 0 | 99 | 35 | 1 sleep-return, 17 haven-following, 3 end-of-run | 23 camps: 12 succession, 3 horizon, 8 moved-elsewhere, 0 walk-home |

Game-over in the 60d cell: 17506 ends village-lost day 57 (the
only non-surviving leg in the whole arm) — while camped at the
creek (evenings 54-57 all creek; day 57 is an end-of-run
unconfirmed night). Same leg, same day as strandred.

### Per-seed table — P1 F2 30d (confirm, nighttravel stack)

| seed | genAbs | crTile | conf | FR (signal) | NA | blk | unconf | camps (end) |
|------|--------|--------|------|-------------|----|-----|--------|-------------|
| 17511 | 1 | 1 | 1 | 1 (out-of-reach, day 10) | 0 | 1 | — | (single night, no camp) |
| 17513 | 1 | 6 | 5 | 5 (out-of-reach, days 5-9) | 0 | 5 | 10:haven-following-changed | 5-10 succession/5 |
| others (6 seeds) | 0 | 0 | 0 | 0 | 0 | 0 | — | — |
| TOTAL | 2 | 7 | 6 | 6 | 0 | 6 | 0 sleep-return, 1 haven-following, 0 end-of-run | 1 camp: 1 succession, 0 walk-home |

Bucket counts (P1 only, strandred analyzer): raw bucket creek 0,
haven-checked bucket creek 0 — the divergence from #1659 is
re-derived on this base too, but it is the sibling arm's
question and is NOT answered or pooled here.

### The return-story split, stated plainly

- P3 deed-seeking: **149 confirmed nights, 0 failed returns.**
  The policy has no evening walk-home step (eveningOutcome
  'policy-no-record' throughout, tripHomeDetours 0 throughout),
  so no return is ever attempted on a creek day. These are
  CAMPS, not strands — however long they last (17504's
  14-night 60d camp 31-44 is a camp, not a strand, under
  this arm's rule).
- P1 nighttravel-stack: **6 confirmed nights, 6 failed
  returns.** Every creek night on the original stack carries
  eveningOutcome 'out-of-reach': the policy's evening return
  step ran and the game refused it. These are STRANDS by
  the arm's rule — the villager tried to get home and could
  not. (Honest nuance, from the sense test: the refusal is
  recorded in the outcome, not narrated as a homeward
  sentence — the transcript shows the blocked crossings,
  not "she turned for home".)
- Camp ends, all cells: **35 camps, 0 walk-home, 0
  woke-at-haven-same-vessel.** 18 end by succession (the
  camper dies; the next morning's vessel is a different
  person at haven), 11 by moved-elsewhere (the vessel
  walks on to a non-creek tile, still not home), 6 by
  horizon (the run ends mid-camp). In 24 judged legs, no
  creek camper ever walks home. The camp-final haven
  mornings that strandred's class-based count treats as
  confirmed are, without exception on this corpus,
  succession mornings.

## Drift vs strandred (base b26777c16 -> c9ac9183): ZERO

Every strandred count re-derived here matches its b26777c16
value exactly, seed for seed, on all three cells: P3 F1 30d
creekTile 61 / genuineCreek 9 / genuine absences 41 / camps 11;
P3 F1 60d 120 / 13 / 80 / camps 23; P1 F2 30d 7 / 1 / 2 / camps 1
(per-seed genuine, creek-tile, genuine-creek, sleep-return,
and camp day-lists all compared, 0 mismatches). The
intervening landings did NOT move any absence/creek
trajectory on these bands. Strandred's tile counts may be
quoted as current; its "60 confirmed" shorthand is
corrected above to the strict 50 (pilot) by definition,
not by drift.

## SENSE TEST (law) — PASS, with the camp-vs-strand judgement

Read end to end from THIS arm's corpus:

- P1 17513, camp days 5-10 (STRAND — reads as stuck). Day 5
  wanders forest floor to creek, a kingfisher, Emberhold
  smoke, then the unbridged creek refuses ("no crossing
  without a bridge or a swim") and the evening outcome is
  out-of-reach: the return step ran and was refused. Days
  6 and 10 repeat the refusal three times each, working
  the creek line, followed by the striped thing, cold
  ground sleeps, stiff dawns ("Dawn. You wake stiff and
  cold."). Day 11 dawns wrung out and unrepaired — and
  the morning vessel is a different person at haven: the
  camper died, and the camp ends by succession, not by
  return. A villager who tries the crossing, is refused,
  and sleeps rough night after night reads as stuck,
  not as camping. The gap, stated: no line says "she
  turned for home" — the failed return is an outcome
  record plus blocked crossings, not a narrated
  homeward attempt.
- P3 17504, camp days 11-16 (CAMP — reads as living there).
  Day 11 starts already away (trail_edge), walks to the
  creek, forages blackberries, eats, practices gifts — a
  working day that ends at the creek. No home mention,
  no return machinery, no refusal outcome. Day 12 is the
  same shape (grove forage, back to creek). Day 16, the
  camp-final night, is another working day; the sleep
  step ends "You wake with a start — something is wrong"
  and the mantle passes to Bill Peterson: the camper
  died in the night/dawn (wolves, per strandred's read of
  the same episode). She was not trying to leave; she
  was living at the creek, and the camp ends by death,
  not return. The ambient "fragments by the fire" gossip
  lines still fire while camped away (strandred texture
  note #1660, recurring here, not re-filed).
- Judgement: on P1 the villager reads as STRANDED (attempt
  + refusal + rough nights); on P3 the villager reads as
  CAMPING (no attempt at all — the policy never walks
  home, so "chose to camp" overstates it: more precisely
  she lives at the creek because nothing brings her home,
  and the camp ends when she dies or walks on elsewhere,
  never when she walks home).

## Reachability verdict

Confirmed creek nights ARE reached on current master: 50 in
the 30d P3 pilot, 99 in the 60d confirm, 6 on the P1 stack.
Confirmed camps (2+ consecutive creek evenings containing
confirmed nights) are reached on both policies. No wave-4/5
reach, no regional/national/table content is in scope of
this census, and none is claimed either way.

## Village assessment, in plain words

Picture two kinds of creek life. On the patrol villages, the
scholar walks far ground looking for deeds, and the creek
becomes her address: she forages it, eats from it, practices
her gifts beside it, sleeps on its cold ground night after
night — and nothing ever calls her home, because the patrol
has no walk home in it. Her camps end the way lives end out
there: she dies at the creek and a stranger wakes up in the
hall, or she walks on to some other wild tile. She never,
in twenty-four runs, walks back into the haven from a creek
camp. On the old nighttravel villages, the scholar is the
opposite: every single creek night, the evening tries to
bring her home and the game says out-of-reach. She works
the same creek line, hits the same unbridged crossing three
times a day, sleeps stiff and cold — and her camp ends the
same way, by death and succession, not by getting home.
So the next strand arm does not have one creek population
to build on, it has two: failed-return nights (the P1
strand candidates, named below) and no-attempt nights (the
P3 camp population, which is a strand only if a future
design first gives the villager a reason — and a way — to
try to leave). A strand arm that judges on P3 nights without
a return mechanism would be measuring camps and calling
them strands.

## Named seeds/bands for the next strand arm

- STRAND candidates (failed-return nights, original stack):
  P1 F2 17513 (confirmed failed-return camp days 5-9, camp
  5-10 ending by succession) and 17511 (single confirmed
  failed-return night day 10).
- CAMP candidates (no-attempt nights, patrol policy): P3 F1
  17504 (longest creek life: 31 confirmed nights in 60d,
  camps to day 44) and 17506 (27 confirmed in 60d, camps
  past day 30), then 17505 (21 confirmed, creek life ends
  by day 30) and 17508 (9 confirmed in 60d).
- The next strand arm still needs its own prereg; this arm
  judges no strand fix. It must also choose its unit
  knowing the strict-vs-class-based gap (pilot 50 vs 60)
  and the camp-end fact (0 walk-home ends in 35 camps).

## Wall numbers

NOT MEASURED BY THIS CENSUS — reported, never fabricated.
Observed survival on judged legs: 23 of 24 legs survived
their window; the single village-lost leg is P3 17506 60d
(day 57, listed above). National 0, table 0, wins 0
(structurally unreachable in this band, not a wall
measurement); median survival is window-censored (most
legs survive the full window). Wave reach is not reported
as a wall number here because this census measures creek
nights, not wave progression; maxWaveUnlocked per leg is
in the corpora, not summarized as reach.

## Blanks filled or documented

- Filled (this arm, measured): #1658 ANSWERED — the
  confirmed-night unit is argued explicitly in the prereg
  (it supersedes the departure unit for strand purposes:
  it measures lived nights, contains departure nights as
  a subset, and adds the continuation nights the
  departure unit discards) and censused under it on
  current master: pilot 50 confirmed nights on 4 seeds,
  100% return-story classified.
- Filled (this arm, measured): THE RETURN-STORY SPLIT IS
  POLICY-PERFECT — P3 149/149 no-attempt (pilot + confirm),
  P1 6/6 failed-return. Creek camps are CAMPS on the
  patrol policy and STRANDS on the nighttravel stack.
  Any future strand design must name which population it
  builds on; a P3-based strand without a return mechanism
  would mislabel camps as strands.
- Filled (this arm, measured): NO CREEK CAMP EVER ENDS BY
  WALKING HOME — 0 walk-home ends in 35 camps across
  both policies and all bands. Camp ends are succession
  (18), moved-elsewhere (11), horizon (6). Every
  haven-following creek evening on this corpus coincides
  with a vessel change (succession morning).
- Filled (this arm, measured): ZERO DRIFT between
  b26777c16 and c9ac9183 on these bands (per-seed,
  all three cells). Strandred's tile counts remain
  current; its "60 confirmed" shorthand is corrected to
  the strict 50 (pilot) by definition.
- Documented (this arm, NOT re-filed): #1659 (bucket-vs-
  tile divergence) is the sibling arm's question —
  re-derived as still 0/0 on P1 here, not answered, not
  pooled. #1660 (creek-night narration residue) recurs
  in the sense test (fire-gossip lines while camped
  away) and is not re-filed.
- Documented (this arm, sense nuance): the P1 failed
  return is an outcome record plus blocked crossings,
  not a narrated homeward attempt — no dayLine says the
  villager turned for home. A future strand arm that
  wants narrated attempts must either narrate the
  out-of-reach outcome or ground home-directed movement
  another way.
- Documented (this arm, metric-review item for the NEXT
  run): whether camp-final nights followed by succession
  mornings should count as confirmed under a death-aware
  unit — NO under this prereg (the waker is a different
  person at haven), itemized as haven-following
  unconfirmed nights so a future prereg can argue it
  with evidence.

## Metric review (revisions apply to the NEXT run, never mid-run)

- Prereg GO bars (gate + >= 90% classification + >= 2
  pilot seeds with >= 1 confirmed night): ALL THREE MET
  (gate 8/8 clean, completeness 100%, 4 seeds). No metric
  was re-scored mid-run. The grid ran exactly as declared
  (pilot 8 + confirm 16 = 24 legs).
- The brief's "60 confirmed nights" shorthand: corrected
  IN THE PREREG (before any leg) to the strict 50, with
  the 10-night gap itemized. The correction is definitional
  and pre-registered, not a re-score: the GO bar was judged
  on the strict count and met under either count.
- Carried doubt (from strandred, sized here): the
  sleep/upkeep-window gap — unexplained away mornings
  are not part of this census's bars; the analyzer reuses
  absencehunt classes unchanged, and no new window gap
  was observed on these bands.
- Whether the bridge-refusal line should ever promote a
  night to FAILED-RETURN: NO under this prereg (it does
  not name home as the destination). It fires on 16/50
  pilot confirmed nights and 35/99 60d confirmed nights
  as a flag only — a future arm could re-argue it with
  home-directed movement evidence, but this census does
  not.
- Whether P3's NO-ATTEMPT story means "chose to camp":
  the census measures the absence of attempts; the sense
  test judges it as "lives at the creek because nothing
  brings her home" rather than a choice. A future arm
  wanting chosen camps must evidence settling intent.

## §15 panel (non-applicability declaration)

scripts/balance-panel.js runs sweep-compare registry policies
on 150-day horizons with its own scorecard and observer
contract. It cannot express the deed-seeking far patrol, the
nighttravel+woodcarry+woodwarm stack, a 30/60-day per-day
creek census, or a census with no variant — the same
declaration every prior strand arm made. The comparison
here is a census across policies on identical seeds through
the census analyzers, never labeled a panel comparison. No
panel result is fabricated; the panel tool was not invoked
on this corpus. No lever comparison arose (DIAG only).

## Telemetry deviation check (investigated, baseline NOT rolled)

`node scripts/telemetry-check.js --baseline
telemetry-baselines/scale-wall.json --current
sim-confirmednight-b-census-p3-f1-30d.json --metrics
national,table,wins,exiled` prints LOUD "national/table/
wins disappeared: baseline 12/16/16 -> current 0 (n=1
files)". Investigated as a missing-field artifact, same
class as strandred's round: this census carries no
national/table/wins/exiled fields at all (keys: corpusDir,
policy, horizonDays, legs, seeds, totals, perSeed) — the
check ingests a census file where the baseline expects
per-seed sweep rows, so 0 means "field absent", not
"wall moved". No genuine LOUD signal. Baseline NOT
rolled.

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
2. No EPERM flap observed in this window: all stdout
   transports split first-try, all splitter writes
   landed first-try. The stdout transport rule was
   followed anyway (judged legs never wrote from a
   game-loaded process).
3. Judged corpora were never staged in /tmp (jsonl lived
   in evidence/ until split, then deleted, per the rule
   — no .jsonl leftovers of this arm's at evidence time;
   the .jsonl files present in evidence/2026-10-31 belong
   to other arms).
4. Diff guard at evidence time: `git diff --name-only
   c9ac9183 -- src/ scripts/policies/` is EMPTY — no
   game code, no policy file moved under measurement.

## Proof

scripts/test-confirmednight-b.js: pure 4/4 (confirmed-night
counting incl. haven-following/end-of-run exclusion,
FAILED-RETURN via out-of-reach and via tripHomeDetours,
blocked-crossing flag without promotion, camp-end
succession/walk-home/horizon, analyzeDir wiring).
scripts/test-strandred-b.js re-run: 5/5 (reused analyzer
unchanged). Corpus checks: every leg errs 0, decisions ==
evenings (30/30, 60/60, or 57/57 village-lost), 24/24 legs
complete or game-over with its day recorded.
60d-prefix consistency: 30d confirmed-day lists are subsets
of the 60d lists on every seed (day-30 kind differences are
the expected following-morning-exists effect, not drift).
Diff guard: `git diff --name-only c9ac9183 -- src/
scripts/policies/` EMPTY at evidence time.

## Files

- Prereg (binding, before judged legs):
  evidence/2026-10-31/sim-confirmednight-b-prereg.md
  (commit 817a36f32)
- Evidence (this file): evidence/2026-10-31/sim-confirmednight-b.md
- Instruments: scripts/analyze-confirmednight-b.js,
  scripts/test-confirmednight-b.js (instruments commit
  ba1b66764; absencehunt driver/analyzer/splitter and
  strandred analyzer reused verbatim from the base)
- Judged corpora (8 files each + stderr logs):
  evidence/2026-10-31/sim-confirmednight-b-corpus-p3-f1-30d,
  sim-confirmednight-b-corpus-p3-f1-60d,
  sim-confirmednight-b-corpus-p1-f2-30d
- Censuses (analyzer output, one per corpus, plus the
  strandred re-derivation census per corpus):
  evidence/2026-10-31/sim-confirmednight-b-census-p3-f1-30d.json,
  sim-confirmednight-b-census-p3-f1-60d.json,
  sim-confirmednight-b-census-p1-f2-30d.json,
  sim-confirmednight-b-census-p3-f1-30d-strandred.json,
  sim-confirmednight-b-census-p3-f1-60d-strandred.json,
  sim-confirmednight-b-census-p1-f2-30d-strandred.json
- No compare .md exists (no paired lever comparison — this
  is a DIAG census, never labeled a panel comparison).
- No sim-findings.md append: nothing outside this arm arose
  (#1659 is the sibling's, #1660 recurs and is not re-filed).
