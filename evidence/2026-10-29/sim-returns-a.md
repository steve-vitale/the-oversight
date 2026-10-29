# sim-returns-a — DELIBERATE RETURNS: DIAGNOSIS

Run: fleshout loop, run fleshout-20261029T0002Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-returns-a.
DIAGNOSIS ONLY — zero src/js, zero game-behavior changes, zero
default flips, zero policy changes. This arm classifies and
quantifies; it does not build the fix. The blank is a measurement
blank, so this complete, classified census IS the fill.
Preregistration (binding, committed BEFORE any judged census):
evidence/2026-10-29/sim-returns-a-prereg.md (commit ebcdf5a4a).
VERDICT: DIAG-GO — all five prereg legs pass (census valid,
classification 100%, determinism gate, sense reads, ranked next
step). No wall movement is claimed from re-analysis.

## Ordering call (from the assignment, documented per prereg)

Run 2236Z's next blank #4 (deliberate returns) was taken ahead
of the narration-only ghost blank because the scale wall's
binding constraint is kills: chainkill found 13 chains, 0 kills,
and villagers kill 0/87 wave-3+ monsters in the field. Whether
anyone ever deliberately returns decides whether chaining can
become a kill path at all. The ghost blank is NOT closed by
this arm and is NOT claimed closed here.

## Plain words first

Nobody ever goes back for a wave-4 beast on purpose. Not once
in 16 villages. On the same seed band where chainkill found 13
wounded-beast chains, this census checked every one of the 42
wave-4 field meetings for a travel record made BEFORE the
meeting — a HUNT errand to that beast, plus a fight memory of
it — and found zero. Thirty-nine meetings were pure accidents
(a villager out fetching water, guarding a friend, or foraging
who bumped into a beast). Three were near-misses: the villager
HAD fought that beast before, but was out doing something else
when they met it again — guard duty twice, home chores once —
never a hunt for it.

The hunting errand itself is real, just never aimed at wave-4
beasts. Villagers set out on 326 hunts in this band — for
wave-1 beasts mostly (242), then wave-2 (60), wave-3 (23) —
and exactly ONE for a wave-4 beast. That one hunt is the whole
story in miniature: a villager who had fled a eulogy twice
walked back to where she fought it, arrived the same day, and
found the tile empty — the beast had wandered off. She stood
there a day, came home, and never met it again. And even the
hunts that work as trips mostly end this way: 297 of the 326
(91%) arrive to an empty tile, because beasts wander and the
remembered tile is usually empty by the time anyone walks
back to it.

So the chainkill picture sharpens, not softens. Chained beasts
are not being worn down by plan; they are being nibbled by
accident. And the two breaks are now numbered: of 19 villagers
who survived a wave-4 fight with a memory to act on, only 1
ever got a hunt errand for that beast (the funnel break); and
of all hunts in the band, 91% arrive to find nothing there
(the arrival break). Fixing either break alone still leaves
the other, and neither break alone produces a kill — the one
attempt was for a beast its hunter had never once damaged.

## Header (pre-registered) vs result

- CENSUS-VALIDITY BAR: 16/16 rows, errs 0 (both recorders),
  overflow 0, control shape matches (formed 0, kills 0 on
  BOTH judged cuts), join errors 0.
  RESULT: 16/16, errs 0, judgedA 42 formed 0 kills 0,
  judgedB 31 formed 0 kills 0, join 2717/2717 errors 0 →
  PASS. The band reproduces chainkill EXACTLY (per-seed
  judgedA counts identical, chains identical, wall numbers
  identical, deaths 600 identical) — strong evidence the
  new recorder drew no RNG and wrote no game state.
- CLASSIFICATION BAR: 100% of U meetings classified,
  OTHER = 0; 100% of chains classified, OTHER = 0.
  RESULT: 42/42 meetings (39 ACCIDENTAL, 3 MEMORY-ONLY,
  0 DELIBERATE, 0 DELIBERATE-ORPHANED, 0 HUNT-READY-NOT-OUT),
  13/13 chains (all STILL-ALIVE), OTHER = 0 → PASS.
- DETERMINISM GATE: re-run seed 75106 into a scratch dir;
  row JSON byte-identical to the corpus row.
  RESULT: byte-identical (scratch dir removed after the
  diff; tree verified clean) → PASS.
- SENSE BAR: >= 1 corpus chain thread read + quoted (S1)
  AND the fixture mechanism read + quoted (S2).
  RESULT: longest chain thread + HUNT lottery + verbatim
  departure line, all quoted below → PASS.
- DIAG-GO BAR: all legs + one ranked next step named with
  numbers. RESULT: all five → DIAG-GO.
- No re-scoring: no metric was changed mid-run. Metric
  doubts are under "metric review" below, for the next run.

## Q1 — the primary question: do villagers EVER deliberately return?

No. Cleanly, on this band, under the prereg's strict rule
(travel intent + prior memory, both recorded before the
meeting — never inferred from the outcome).

- DELIBERATE meetings: 0 / 42 judgedA meetings.
- DELIBERATE-ORPHANED (HUNT errand live, memory link
  broken): 0.
- HUNT-READY-NOT-OUT (HUNT picked, not travelling): 0.
- MEMORY-ONLY (knew the beast, out on another errand): 3.
- ACCIDENTAL (no memory, no HUNT for this beast): 39.
- Outcomes by class: ACCIDENTAL — 22 vFlee, 17 vDie, 0
  kills, 0 drive-offs; MEMORY-ONLY — 3 vFlee, 0 kills.
  Deliberate returns contribute 0 kills because deliberate
  returns contribute 0 meetings.
- Orthogonal flags: ALLY-KNOWER 0 (no joined ally ever
  held the memory while the leader did not — unsurprising
  on a band where formed parties are 0); HUNT-OTHER-MID 2
  (villagers travelling on a hunt for a different beast
  who met a wave-4 beast by accident — see below).

## Q2 — do deliberate returns convert? (The attempt census)

There is almost nothing to convert, and what exists converts
to an empty tile:

- HUNT departures, all waves: 326 (wave-1 242, wave-2 60,
  wave-3 23, wave-4 1).
- HUNT drops (arrived, quarry gone — dropped=true only):
  297 (wave-1 220, wave-2 53, wave-3 23, wave-4 1).
  91% of HUNT trips in the band end at an empty tile.
  (Drop CALLS total 911 — the arrival block re-fires each
  day-part while the villager lingers at the tile, returning
  false after the first true spend. Only the 297 true spends
  count as arrivals; quoting 911 as attempts would be wrong.)
- DELIBERATE meetings paired to a prior HUNT departure: 0
  (vacuous — no deliberate meetings exist to pair).
- Chains containing >= 1 DELIBERATE meeting: 0 / 13.
  Chains with a DELIBERATE terminal meeting: 0 / 13.
  DELIBERATE meetings outside any chain: 0 (there are none
  to lose to HP-trail censoring — the zero is not a
  censoring artifact).

## The funnel, step by step (where exactly it breaks)

- 42 judgedA meetings → 25 survived (vFlee), 17 died
  (vDie). Death removes 40% of fighters from any return
  before memory can matter.
- 26 distinct leaders → 19 distinct survivor triples
  (seed, villager, beast type) with a memory to act on.
- Of those 19, exactly 1 ever got a HUNT departure for
  that beast: (75106, visjoin_115, eulogy). Conversion
  survivor → attempt: 1/19 (5%).
- That 1 attempt: departed d137 for the d132 fight's tile
  (5,3), arrived d137, quarry gone, memory spent. 0
  meetings followed from it. Conversion attempt → meeting:
  0/1.
- Leaders were armed at meeting time in 42/42 meetings —
  the armed gate is NOT the wave-4 blocker (at meeting
  time; pick-time armed status is a sub-gate the next
  diag should check, not assumed).
- The census pins WHERE the funnel narrows (survivor →
  attempt, 1/19) but not WHICH sub-gate dominates among
  staleness (3-day freshness vs multi-day trips), memory
  overwrite (cap 4), death-before-pick, never-home-at-dawn,
  or lottery loss. That decomposition is the ranked next
  step below, not a claim made here.

## The three MEMORY-ONLY meetings (the near-misses, read closely)

- s75106 d99 catalina_reyes, influencer 580→555, vFlee,
  objective GUARD/out (guarding gen_qhsj2el). She fought
  the same influencer at the haven tile (4,4) on d97 while
  on a SEEK errand at home — the beast came to the
  doorstep — then met it again at (5,3) two days later
  while guarding someone else. Memory existed; travel
  intent did not. Chain #1's second meeting.
- s75106 d132 visjoin_115, eulogy 900→900, vFlee,
  objective GUARD/out (guarding visjoin_113). She fought
  a eulogy at (5,4) on d127 while fetching water, then
  met one at (5,3) five days later while guarding. Memory
  existed but was 5 days old — past the 3-day HUNT
  freshness window even before the lottery. Chain #4.
- s75106 d144 visjoin_115, eulogy 675→675, vFlee, caller
  aid, objective HAVEN_CHORE/indoor. She was home doing
  chores when a (different, wounded) eulogy came to the
  haven door; her surviving memory was the d127 (5,4) one
  — the d132 (5,3) memory had been spent on the d137
  empty-tile arrival. Unchained singleton (HP trail broken
  by censored damage: 675 matches no prior mHpLeft).

## The ONE wave-4 HUNT attempt, end to end (visjoin_115, s75106)

- d127: on a WATER trip, meets a eulogy at (5,4), deals 0
  damage, flees. Memory recorded: eulogy (5,4), day 127.
- d132: on a GUARD trip (guarding visjoin_113), meets a
  eulogy at (5,3), deals 0 damage, flees. Memory recorded:
  eulogy (5,3), day 132. (Her d132 meeting is MEMORY-ONLY
  via the d127 memory; the beast at (5,3) may be the same
  wandered beast or another — HP 900 both ways, and the
  census does not claim identity beyond the chain rule.)
- d137: HUNT departure to (5,3) — the d132 memory, picked
  within its freshness window (huntDay 132 on the
  objective) but departed 5 days after the memory: pick-
  time freshness is NOT departure-time freshness, and
  departure can lag the pick through danger/heal gates.
  Arrival d137, day-part 1: drop, dropped=true — quarry
  gone from (5,3). Three further drop calls (d137 parts
  2–3, d138 part 0) return false: she lingered at the
  tile while the arrival block re-fired, and the beast
  never came back during her linger. No meeting followed.
- d144: aid fight at the haven door (4,4) vs a 675-HP
  eulogy, 0 damage, flees. The d127 (5,4) memory is still
  on her record (never spent — she never hunted back to
  (5,4)); the d132 memory is gone.
- Judgment: this is a genuine deliberate attempt by the
  code's own definition — a picked HUNT errand, departed,
  walked to the remembered tile — and it reads, in the
  numbers, as a person going back for a beast she never
  hurt. She fled it twice without landing a blow; the
  third trip found nothing. The attempt's story is told
  nowhere a player could follow it (see narration blanks).

## The two HUNT-OTHER-MID meetings (hunters meeting the wrong beast)

- s75115 d112 app_mgpspj23354, reunion 1200→1189, vFlee,
  on a HUNT for anaconda_empress (a wave-2 beast, by the
  monsters.json wave field) — met a reunion instead.
- s75115 d113 chantal_mukendi, reunion 1189→1164, vFlee,
  on a HUNT for bright_idea — met the same reunion chain's
  second meeting instead.
- Correctly classified ACCIDENTAL for the wave-4 meeting:
  travel intent existed, but toward a different beast.
  They prove HUNT travel is a live behavior in this band
  — it just never aims at wave-4 beasts (1/326).

## Sense-testing law (transcripts read, beats quoted)

Verdict: ACCIDENTAL-ONLY for wave-4 — with one genuine
attempt that found nothing, and no narration thread for any
of it.

Transcript S1 — longest corpus chain thread, s75108 eulogy,
4 meetings over 2 days, 11 damage, terminal 889, all
ACCIDENTAL, flagged AMBIGUOUS (zero-damage HP sharing):

- d86 diana_osei 900→889 vFlee [ACCIDENTAL, FORAGE/out]
- d86 diana_osei 889→889 vFlee [ACCIDENTAL, FORAGE/out]
- d87 ava_garcia 889→889 vFlee [ACCIDENTAL, FORAGE/out]
- d88 app_mgpsphm923 889→889 vFlee [ACCIDENTAL, TRAPS/out]
- HUNT departures in the thread window (d85–d89) for these
  villagers: 0. HUNT drops in window: 0. DELIBERATE meetings
  in thread: 0/4.
Judgment: four foragers/trappers bumping into the same
eulogy around the same tiles, dealing 11 damage between
them, each walking away. Nothing in any record marks any
of these as a return: no HUNT errand, no departure, no
memory at the first three meetings (the first meeting
cannot have a memory — it IS the first meeting — but
neither do the repeats carry a travel record; the repeats
are same-area coincidence, and the zero-damage repeats
make even the HP-identity weak, as chainkill disclosed).
A player watching these four fights would see four
separate scares, not one wearing-down — and would be
right, by every record the game keeps.

Transcript S2 — HUNT mechanism fixture, base code
(scripts/test-returns-a-sense.js, RETURNS-SENSE PASS):
seeded villager gen_anixv6h at haven (4,4), fresh armed
in-range memory (influencer at (5,4), day 1), gates all
green (armed=true, maxD=3, sheltered=false,
postFleeResting=false, huntCandidate={mid influencer,
tx 5, ty 4, day 1}):

- Lottery, 200 objPick draws: HUNT 22 (11%), VISIT 20,
  HAVEN_CHORE 26, WATER 90, SEEK 37, EXPLORE 5. The HUNT
  offer is real and fires about one pick in nine for a
  memory-holder in this fixture — but WATER dominates
  (90/200), so competing needs swamp the HUNT weight in
  this fixture; 11% is this fixture's draw under its
  needs, not a universal offer rate.
- Departure line, quoted verbatim (driven through the real
  objDepart with narration on — see the fixture note
  below): "A person, maybe 30s, with thick glasses sets
  out to hunt the someone the light loves. 'It was there.
  Going back for it.'" The beast is named by its village
  descriptor ("the someone the light loves"), never its
  true name — the knowledge gate holds in the line itself.
Judgment: the mechanism reads as a person deciding to go
back — the line says so, plainly. What does NOT read is
any corpus instance of it for wave-4 beasts: the line
exists, the lottery fires, and in 16 villages the wave-4
version happened once and found nothing. The fixture also
exposes a narration trap the census had to work around:
sim-harness stubs G.say to a no-op unless narration:true
(sim-harness.js: "Silence narration/audio/drama for sims"),
so the first fixture run captured no line at all despite a
clean departure (state 'out', away set, return true). The
line was real; the harness was deaf. The fixture now loads
with narration:true (documented harness option); the
census sweep keeps narration off, exactly as chainkill did.

What would read as DELIBERATE-RETURNS-READ (not observed
for wave-4): a corpus meeting whose pre-meeting record
shows a HUNT objective for that beast, plus a departure
line a player at haven could have heard, plus an arrival
that meets the beast — the visjoin_115 attempt has the
first two (departure record; line template) and fails the
third (empty tile, silent drop).

## Narration blanks (findings, NOT built — this arm is diag only)

- No fight log marks a beast as the same wounded one
  (chainkill blank, confirmed again: 0/42 meetings carry
  any return/recognition marker, because the engine writes
  none — the recorder has no such field to read).
- The HUNT departure line exists but only narrates when
  the player is at haven at departure time; a player out
  in the world hears nothing, and in sims narration is
  stubbed off entirely. The band's one real wave-4 attempt
  would have been invisible to an absent player.
- The empty-tile arrival is silent in code: objAwayStep
  spends the memory with no say, no beat, no "it was gone"
  line. The villager lingers and comes home, and the
  fiction never explains the failed return.
- No chain thread is narrated anywhere: visjoin_115's
  d127→d132→d137→d144 sequence is reconstructable only
  from HP arithmetic plus recorder joins, never from a
  line the player could follow.

## Ranked next step (single first lever, per prereg)

1. SURVIVOR-FUNNEL DIAG — FIRST. Trace each of the 19
   survivor triples (seed, villager, beast) from its
   surviving fight to its next dawn/idle pick: died before
   pick? left the village? memory overwritten (cap 4)?
   stale at pick (> 3 days)? at haven but lottery lost?
   HUNT picked but departure delayed past freshness?
   The instrument must record PICK time, not just
   departure time — this census proves the two differ
   (huntDay 132, departure d137). Judge on the decomposed
   funnel, not the 1/19 headline: whichever sub-gate owns
   most of the 18 losses is the lever, and a funnel diag
   that cannot decompose them repeats this census.
2. EMPTY-TILE ARRIVAL — SECOND. 91% of HUNT trips (297/326)
   arrive to nothing, because beasts wander 35%/tick and
   the remembered tile is a stale address. Any return lever
   must answer the arrival question lawfully (perception:
   tracks, sound, following — never a magic roster or
   live-monster lookup; the memory's knowledge gate is
   the design to preserve, not bypass). At current arrival
   rates, even perfect survivor conversion (19/19 attempts)
   yields ~2 beast meetings, not kills — so this rank
   cannot be skipped by fixing the funnel alone.
3. KILL SIDE STANDS — THIRD, unchanged from chainkill:
   the tile-present party (every ally on the tile joins)
   remains the kill-side lever, judged on kills of beasts
   at observed terminal HPs. Returns raise meetings-per-
   beast only after ranks 1–2 move; a return that meets a
   beast still needs a party that can finish it, and the
   band's one attempt was for a beast its hunter had
   never damaged (0 damage across her two fights).

## Fresh-band wall (16 seeds; reported, NOT claimed as movement)

Identical to chainkill's fresh band (same seeds, same
substrate, recorder proven non-perturbing):

- Wins 4/16, all lesser, full seat 0/16. National ever
  13/16, final 9/16. Table invited 10/16, entered 4/16.
  Wave-4 reach 11/16, wave-5 0/16. Median days 180 —
  HORIZON-CAPPED (same caveat as chainkill: the median is
  the cap, not a survival gain).
  Deaths 600, starvation deaths 4.
- Death-cause shares (all deaths): villager combat 235,
  villager-vs-villager combat 160, player the wild 87,
  villager expedition 35, villager monster 32, villager
  ambush 8, villager wound-that-wouldn't-close 7, player
  contest 6, player the arena 6, villager sickness 6,
  player sickness 2, villager starvation 2, player
  starvation 2, villager alien 2, player a stranger 2,
  player the night 2, villager thirst 1, villager a toad
  like a war drum 1, villager The Heckler 1, villager
  The Algorithm 1, villager Loud-Eyes 1, villager Big
  Ugly 1.
- Per-seed judgedA (reproduces chainkill exactly): 75106:
  15, 75108: 9, 75109: 8, 75115: 5, 75116: 4, 75110: 1,
  all other seeds 0.

## Village assessment in plain words

The village does hunt — just never the beasts that matter
for the scale wall. Its hunters walk out after wave-1 and
wave-2 beasts all the time (302 of 326 hunts), and nine
times in ten they walk back to an empty tile, because the
woods moved while they walked. The wave-4 beasts are
different: they are met by villagers who mostly die (17 of
42 meetings) or walk away hurt, and the ones who live
almost never come home in time to choose the hunt — three
days is a short memory for people who spend days out on
the water run or guarding a friend. The one woman who did
go back had never hurt her beast at all; she went back to
a tile, not a kill. Who thrived: villagers who met a beast,
hit it once, and walked away — same as chainkill. Who died:
the ones who met a beast twice, or met one already wounded
and still could not finish it. Missing capabilities, in
order: a memory that survives long enough to act on (or a
pick that happens while the fighter is still home), a way
to find a beast that moved (not just its old tile), and —
still — a party that can finish what it meets. And a story
beat that tells the player when someone goes back for a
beast, and what they found when they got there — right now
even the one real attempt would pass in silence.

## Metric review (for the NEXT run — never a mid-run re-score)

- PICK TIME vs DEPARTURE TIME: this census records
  departures, not picks. The d137 departure proves the
  gap matters (huntDay 132, departure 5 days later) — a
  pick recorded at dawn could be fresh while its
  departure is stale. The next funnel diag must record
  objPick outcomes per villager (or the objective's
  pick day), or it cannot decompose the 18/19 losses.
- DROP CALLS vs TRUE DROPS: 911 drop calls vs 297 true
  spends. The arrival block re-fires while the villager
  lingers, returning false after the first spend. Future
  arms must quote true spends, never call counts.
- OBJECTIVE SNAPSHOT CAVEAT: the objective at fight time
  is the engine's current objective, which for haven-tile
  meetings (4,4) can be indoor (SEEK/chore) — coherent
  (the beast came to the doorstep), not a misclassification
  risk: HUNT is never indoor, so the DELIBERATE test is
  unaffected. One judgedA-adjacent meeting (catalina d96,
  influencer at (4,4)) sits OUTSIDE judgedA because its
  fieldparty channel is raid, not field — the chainkill
  universe definition, applied verbatim, excludes it; the
  chain starting at d97 (607) is therefore the same chain
  chainkill reported, not a truncated one.
- DAYPART RANGE: observed dayPart values run 0–4, not
  just 0–3. Pre-meeting comparisons use the same field on
  both sides (memory stamp vs meeting stamp), so ordering
  is consistent regardless of range — but the next prereg
  should not assume a 0–3 range.
- MEMORY FRESHNESS vs MEMORY EXISTENCE: MEMORY-ONLY
  counts a sighting entry regardless of age (the store
  keeps entries past 3 days; only the HUNT offer filters
  by age). The d132 visjoin_115 meeting is MEMORY-ONLY
  on a 5-day-old memory — correctly NOT deliberate, since
  no HUNT offer could have fired on it. A future arm
  that reports "villagers remember" must say which
  memory it means (stored vs offerable).
- PANEL NOTE (standing): scripts/balance-panel.js has no
  census-ingest mode; identical-seed before/after corpora
  are the §15 substitute, as in prior rounds. No panel
  artifact faked, no panel verdict claimed.
- TELEMETRY DEVIATION CHECK (loop body step 10): corpus
  path for the coordinator's check is
  evidence/2026-10-29/perseed-returns-a/*.json (metrics
  national,table,wins,exiled; baseline
  .../telemetry-baselines/scale-wall.json). Expected
  artifact class if LOUD lines appear, as in chainkill:
  the baseline's regime does not match this substrate,
  and per-seed rows carry nationalEver/entered/won, not
  top-level national/table/wins paths. The band's true
  wall numbers are nationalEver 13/16, entered 4/16,
  wins 4/16. Baseline NOT rolled by this arm; the
  coordinator judges any LOUD lines.

## Blanks filled or documented

- FILLED (diagnosis, not a fix): the deliberate-returns
  blank (run 2236Z blank #4, chainkill rank-3 item) is now
  measured: 0 deliberate returns in 42 wave-4 field
  meetings across 16 seeds; 1 wave-4 HUNT attempt in 326
  HUNT departures, ending at an empty tile; survivor→
  attempt funnel 1/19; arrival-empty rate 91% (297/326).
  Deliberate returns for wave-4 beasts are not happening
  — both the absence and its two breaks are now numbers.
- DOCUMENTED (for the findings backlog, not chased here):
  (a) chain-thread + return-attempt narration blanks —
  no recognition line, no return line for absent players,
  no empty-arrival line, no thread a player could follow;
  (b) pick-vs-departure freshness gap — departure-time
  freshness understates pick-time freshness, so funnel
  decomposition needs pick records; (c) the 91%
  empty-tile arrival rate — a return system aimed at a
  remembered tile mostly aims at nothing, which bounds
  any return lever until arrival is solved lawfully.
- NOT re-judged: chainkill DIAG-GO, fieldfeed
  pilot-GO-only, shoutgate NO-GO, perceptform NO-GO all
  stand as published. Chainkill's chains are reproduced
  exactly, not revised.

## Test and infrastructure notes

- `node --check` clean on all five new files;
  scripts/test-returns-a-fixtures.js exits 0 with
  FIXTURES PASS (33/33); scripts/test-returns-a.js exits 0
  with MACHINE LEGS PASS (census, join, control-shape,
  classification); scripts/test-returns-a-sense.js
  RETURNS-SENSE PASS (corpus thread + lottery + verbatim
  departure line, narration:true per sim-harness docs);
  scripts/test-returns-a-sweep.js exits 0 with
  CONTROL-SHAPE PASS on 16 seeds (22 min for the band;
  slower than chainkill's 10.8 min — the returns recorder
  wraps objDepart/objDrop on top of fieldFight and rows
  carry departures + drops).
- Determinism gate: seed 75106 re-run byte-identical
  (diff empty; scratch dir removed; tree verified clean).
- Safe-commit index clobber hit the prereg commit and the
  instruments commit (staged-deletion twins of
  byte-identical files); repaired via HEAD-blob
  `git update-index --add --cacheinfo` with status-empty +
  diff-HEAD-empty + hash-match verification, never
  `git reset`. No .git EPERM flap this run. No ref surgery.
- Sense-fixture fix (not a census change): the fixture
  first ran with narration off and captured no departure
  line despite a clean departure — root cause found in
  sim-harness.js (G.say stubbed to no-op unless
  narration:true). Fixture now loads with narration:true;
  census sweep unchanged (narration off, as chainkill).
  The probe script used to find this was deleted; tree
  verified clean after removal.
- Zero src/js diff on this branch (verified at closeout);
  zero policy files added or changed except the new diag
  recorder (scripts/policies/returns-diag.js, RETURNS=1
  gated, off = no wraps); no other arm's corpus touched
  (predecessor corpora read-only). No push, no bump, no
  live verification (ship-loop line). Ready for
  coordinator merge, pending ship — via the coordinator.

## Commits

- ebcdf5a4a prereg (before any judged census).
- dd3e6c65 instruments (recorder + sweep + analyzer +
  fixtures + sense).
- Corpus + analysis + sense + this evidence: final commits
  on this branch (hashes in the run report to the
  coordinator).

## Convergence

scale-onramp stays converging (NOT converged): deliberate
returns are now measured end to end (0 deliberate meetings,
1 empty-tile attempt, funnel 1/19, arrival-empty 91%) with
a ranked next step (survivor-funnel diag with pick records,
then lawful arrival) — but no wave-4 field party has yet
killed in the field, the full seat stays 0, wave 5 stays 0.
The directive stands until the tracker records this axis
converged on measured evidence.
