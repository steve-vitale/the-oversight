# sim-pickband-a — FRESH-BAND WAVE-4 HUNT PICK CENSUS: DIAG-GO

Run: flesh-out loop, run fleshout-20261029T1315Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-pickband-a.
DIAGNOSIS ONLY — zero src/js, zero game-behavior changes, zero
default flips, zero policy changes. No lever was attempted in this
arm, by design: if the band replicates scarcity, that replication
IS the result.
Preregistration (binding, committed BEFORE any judged row):
evidence/2026-10-29/sim-pickband-a-prereg.md (commit 7a6d3a1d6).
VERDICT: DIAG-GO — all five prereg legs pass (8/8 seeds valid,
UNKNOWN 0 <= 1, determinism byte-identical, recorder-neutrality
19/19 comparable fields exact, sense bar at tier 2). No wall
movement is claimed from a fresh band on new seeds.

## Plain words first

On eight new villages, nobody picked a wave-4 hunt. Not once.
That is not a rounding of the funnel-a finding — it is a step
further back. In funnel-a, two women picked the hunt and the
question was what happened next. Here, the hunt was never
picked at all, because in most villages there was nobody to
pick it: only one village in eight ever had a wave-4 field
fight that a survivor could remember, and in that one village
the people who remembered it were, one by one, kept from ever
being offered the trip back.

Here is that one village's story, in order:

- Maya fought a eulogy on day 73 and came home. From the next
  morning she was sheltered — moved inside, behind the
  barricaded door — and she stayed sheltered for every one of
  her 79 recorded picks, choosing water and food and chores
  while the eulogy memory sat in her list growing stale. The
  game will not offer a hunt to someone sheltering, so her
  fresh window (days 74-76) passed with the offer never made.
  She died on day 136 in the arena.
- A homebody fought the same beast on days 127 and 128 and
  picked 29 times with the fresh memory in front of her — but
  her roaming range is zero tiles, so no distance can ever
  satisfy the hunt gate, and she was never offered anything.
  She died on day 169, killed by an eater.
- Nora fought an eater on day 92, rested off the fright for
  one pick, then spent her remaining eight picks as a homebody
  too (range zero). She died on day 97, killed by a monster.
- One villager fought a herald three days running — but all
  three fights happened on the haven tile itself, and a hunt
  back to the tile you are already standing on is not offered
  (the gate needs distance >= 1). Two picks, no offer. She
  died on day 108, killed by a monster.
- The last survivor fought an influencer four days running
  and was offered the hunt back four times — the band's only
  four offers. She chose forage, forage, food, and a visit.
  Nobody in eight villages ever chose the hunt.

So the scarcity has three layers, and the pick census is only
the last one: first, wave-4 field fights themselves are rare
(only one village in eight had any survivor to remember);
second, the survivors who do remember are usually gated out
before an offer can exist (sheltered, homebody, same-tile);
third, the rare offer that does fire still loses — 0 takes
out of 4 offers (n=4, stated, not generalized). A lever that
only raises the hunt's lottery weight would touch none of
the first two layers and almost none of the third, because
on this band there was almost nothing to weigh: 4 offers in
124 memory-holder picks.

## Header (pre-registered) vs result

- GO LEG 1 — 8/8 seeds valid: RESULT 8/8, every row present,
  days > 0, all four recorder channels present with errs 0,
  overflow 0, installed true -> PASS.
- GO LEG 2 — every wave-4 HUNT pick classified, UNKNOWN <= 1:
  RESULT primary n=0, UNKNOWN 0 -> PASS. Stated plainly:
  with zero primary picks, this leg passes vacuously for
  classification completeness — the result is the zero, not
  a distribution. No lag, no departure rate, no stale share
  exists to report for this band, and none is quoted.
- GO LEG 3 — determinism, seed 75117 scratch re-run:
  RESULT byte-identical (cmp clean; scratch dir inside
  this worktree, removed after comparison) -> PASS.
- GO LEG 4 — recorder-neutrality, seed 75117 recorders OFF
  vs ON: RESULT 19/19 comparable fields exact, 0 diffs
  (days, endReason, won, waveReach, maxArc, finalRank,
  maxRank, nationalEver, nationalFinal, table, entered,
  deathTotal, starvationDeaths, deaths summary, finalPop,
  finalPantry, finalKnown, tableState) -> PASS. Recorder
  channels cannot exist in the OFF run by construction, so
  equality is claimed on the comparable snapshot only,
  never on the full row (prereg, stated before the run).
- SENSE LEG — one verbatim pick chain, hierarchy fixed in
  the prereg: RESULT tier 2 (no primary pick exists, so
  the bar is a wave-4 memory-holder pick chain, named as
  such) -> PASS. The chain is quoted below and judged.
- No re-scoring: no metric was changed mid-run. The
  funnel-pick decomposition that follows (124 picks, 4
  offers, gate attribution) is additional analysis of the
  same corpus, not a re-scored metric — the prereg's
  primary metric (pick count + classification
  completeness) is judged above, and the decomposition
  does not move it.

## Census answers (primary universe: wave-4 HUNT picks, n=0)

- COUNT: 0 wave-4 HUNT picks in 8 seeds.
- By outcome class: DEPARTED 0, SUPERSEDED 0, DIED-HOLDING 0,
  HELD-TO-HORIZON 0, UNKNOWN 0. Every class count carries
  its n (n=0) — there is no pick to list a villager, seed,
  pick day/part, or memory age for, and none is invented.
- Lag: no departed picks, so no lag distribution; no
  superseded picks, so no supersession lag. (Departlag's
  n=2 band remains the only measured wave-4 lag: 2d/8p
  departed stale, 0d/3p superseded by dinner.)
- POOLED LINE (secondary only, clearly labeled): funnel-a
  primary n=2 (DEPARTED 1, SUPERSEDED 1) + pickband primary
  n=0 = pooled n=2, by {DEPARTED 1, SUPERSEDED 1}. Pooling
  adds nothing to funnel-a — that sentence IS the
  replication statement. This pooled line is funnel-a +
  pickband only; it is not the funnel-a + lottery pooled
  pickcensus (n=4, 1/1/1/1 split) from the assignment
  context, which pools different corpora and is not
  recomputed here.
- SECONDARY CENSUS (labeled everywhere, NOT judged): all
  HUNT picks by wave-4 memory holders, any wave: n=0 as
  well. The 124 funnel picks below are memory-holder picks
  whose chosen kind was never HUNT — the secondary universe
  counts HUNT picks only, so it is empty alongside the
  primary.

## The decomposition behind the zero (same corpus, not a re-score)

The funnel recorder records a pick whenever the villager held
a wave-4 memory before the pick (fresh or stale) or chose a
wave-4 HUNT. The band holds 124 such picks, all on seed
75117 — the only seed with wave-4 field-channel survivors.
Their chosen kinds: WATER 48, EAT 45, HAVEN_CHORE 17, FORAGE
5, VISIT 4, SEEK 3, HAUL 1, EXPLORE 1, HUNT 0.

Candidate at pick (recomputed by the recorder with the
pick's own position, pure read): non-null on 4/124 picks,
null on 120/124. The 4 offers, all visjoin_156, influencer
at (3,5), memory day 176: d176 part=703 chosen FORAGE,
d178 part=708 chosen FORAGE, d178 part=711 chosen EAT,
d179 part=715 chosen VISIT. Takes: 0/4 (n=4 — an offer
count, not a rate to generalize).

Candidate-null attribution, FIRST blocking gate in
objHuntCandidate's own check order (sheltered, then
post-flee resting, then armed, then range, then
freshness/range — so a pick blocked by two gates is
counted under the first; "staleOnly 0" below does NOT
mean staleness never mattered, only that no pick reached
the freshness check unblocked and failed on staleness
alone; most picks were also stale, e.g. maya's eulogy
entry aged to 58 days in her list):

- SHELTERED 79 (all maya_singh): sheltered at every pick
  from d74 onward; her 5 fresh-memory picks (d74-d76,
  eulogy age 1-3) were blocked by shelter before freshness
  was ever reached.
- MAXD-0 (homebody) 37 (visjoin_125 29, nora_wilson 8):
  roaming range zero, so 1 <= distance <= 0 can never pass.
  visjoin_125's 29 picks span d127-d144 with fresh eulogy
  memories (ages 0-3) in the window — the offer never
  existed for her either.
- POST-FLEE RESTING 1 (nora_wilson d92, the eater fight day).
- FRESH-BUT-OUT-OF-RANGE 3, all distance 0: the fight
  happened on the haven tile (4,4) itself, and the gate
  needs distance >= 1. visjoin_104's herald fights
  (d106-d108, picks d106-d107) and visjoin_156's first
  influencer fight (d175, pick d175) — a hunt back to
  where you stand is not offered.
- OFFERED 4 (above). 79 + 37 + 1 + 3 + 4 = 124.
- Fresh-memory picks (any wave, age 0-3) total 37/124; of
  those, only 7 reached the freshness/range evaluation
  (4 offered + 3 distance-0) — the other 30 fresh-memory
  picks were blocked earlier by shelter, range, or
  post-flee rest. Freshness is not the binding block on
  this band; the earlier gates are.

Departhold verdict context: no primary pick exists, so no
verdict join applies. visjoin_156 holds 0 departhold
evaluations (she never held a ready HUNT objective — her
4 offered picks chose other errands, so no departure
evaluation ever covered her as a HUNT holder). Band
departhold totals: evaluations 393, overwritten 88,
departed 144, held 161, dangerOutside 765 (the recorder's
expected second-caller class — gossip-retarget danger
rows, counted separately, never fed into any
classification; depart/heal/tightenOutside 0).

Why the other 7 seeds hold zero funnel picks (not a
recorder gap — the recorder fires on wave-4 memory
holders, and these seeds produced none):

- Seeds 75118, 75119, 75120, 75121, 75124: zero wave-4
  meetings of any kind in the fieldparty channel.
- Seed 75122: one wave-4 meeting (audit, d165), outcome
  evade — evades record no memory (MONSTER-WAVES.md:
  evade records nothing), so no memory-holder exists.
- Seed 75123: three wave-4 meetings, all channel "other"
  (expedition, not field): two evades (aki_tanaka, eulogy,
  d160/d163) and one vFlee (suburb, d180, the horizon day)
  with NO note record — expedition-channel fights sit
  outside the funnel's judged universe (field channel,
  resolve/patrol/aid), and the d180 fight leaves no pick
  window after it in any case. It is not counted as a
  missed pick; it is out of universe, stated here so the
  next analyzer does not "find" it.
- Band fieldparty meetings 1319; wave-4 meetings 18
  (75117: 14, 75122: 1, 75123: 3); judgedA (wave-4, field,
  resolve/patrol/aid, non-scholar) 11, all on 75117;
  judgedA formed 0, kills 0.

## Sense-testing law (transcripts read, beats quoted)

Verdict: the chains read as played sequences — and the
shelter chain reads as a person kept inside, not a counter
ticking. The full maya trace (every pick, departure, drop,
note, and death for the villager) is produced by
scripts/test-pickband-a-sense.js (PICKBAND-SENSE PASS,
TIER-2-MEMORY-HOLDER); the decision windows below are
verbatim excerpts, not summaries.

Transcript S1 — maya_singh's fresh window, s75117 (the hunt
that was never offered):

- NOTE d73 part=291 maya_singh eulogy @(4,3) refreshed=false
  evicted=[["heckler",3,4,65,3]] — the fight that made the
  memory.
- PICK d74 part=292 chosen=WATER candidate=null
  gates={armed:true, sheltered:true, postFleeResting:false,
  maxD:3} pre=[["drumbelly_tanuki",7,2,69,2],
  ["mirror_stag",6,2,70,3],["sanjun",6,2,70,3],
  ["eulogy",4,3,73,3]] — fresh eulogy, day after the fight,
  sheltered, no offer.
- PICK d75 part=296 chosen=HAVEN_CHORE candidate=null
  (same gates, same memories); PICK d75 part=298 chosen=EAT
  candidate=null; PICK d76 part=300 chosen=HAVEN_CHORE
  candidate=null; PICK d76 part=303 chosen=EAT candidate=null
  — the whole fresh window, five picks, chores and food,
  sheltered throughout, candidate null every time.
- The same preSightings list, unchanged, recurs at every
  pick through d131: the eulogy entry never leaves her list
  (cap-4 store, no newer fight notes to evict it), so the
  recorder keeps recording her as a "wave-4 memory holder"
  for 58 days after the memory went stale. The 124-pick
  count is honest about what the recorder records and
  misleading if read as 124 opportunities — the
  opportunities were the fresh-window picks, and on this
  band most of those were gate-blocked before the offer.
- DEATH d136 maya_singh cause=the arena (deaths-list
  player flag reads true for this villager-kind row — the
  funnel-a TELEFLAG anomaly, same class; the flag is not
  used anywhere in this census).

Transcript S2 — the band's only offers, visjoin_156, s75117
(verbatim, all four):

- PICK d176 part=703 chosen=FORAGE
  candidate=influencer@(3,5)/day176 gates={armed:true,
  sheltered:false, postFleeResting:false, maxD:1}
- PICK d178 part=708 chosen=FORAGE candidate=influencer@
  (3,5)/day176 (same gates)
- PICK d178 part=711 chosen=EAT candidate=influencer@
  (3,5)/day176 (same gates)
- PICK d179 part=715 chosen=VISIT candidate=influencer@
  (3,5)/day176 (same gates)

Judgment: four offers, four refusals, all within the fresh
window (memory day 176, picks d176-d179), all by a villager
who was armed, unsheltered, in range (maxD 1, tile (3,5)
one step from haven (4,4)) — the only villager on the band
for whom every gate passed. She chose forage twice, food
once, a visit once. That reads as a person with a life to
attend to, not a lottery artifact: the offer fired cleanly
and lost to ordinary needs and errands, four times. But
n=4 offers cannot carry a take-rate claim — it carries
only this: on this band, the offer is rarer than the take
is low. The funnel-a lottery story (22 offered picks, 0
takes in its lottery triples) is not contradicted; it is
not replicated either, because this band barely reached
the lottery at all.

## Fresh-band wall (8 seeds; reported, NOT claimed as movement)

Fresh seeds, no baseline — these numbers make the corpus
comparable to funnel-a, they do not measure a change:
wins 0/8 (full 0/8, lesser 0/8). National ever 6/8, final
5/8. Table invited 2/8, entered 0/8. Wave-4 reach 6/8,
wave-5 0/8. Median days 180 — HORIZON-CAPPED (5/8 seeds
survived to day 180; the median is the cap, not a survival
gain). Deaths 298, starvation deaths 3 (player starvation
2, villager starvation 1). Death-cause shares (n=298):
villager combat 146, villager-vs-villager combat 63, player
the wild 41, villager ambush 8, villager expedition 9,
villager wound-that-wouldn't-close 7, villager sickness 7,
villager monster 6, player contest 3, player a stranger 2,
player starvation 2, player sickness 1, player the arena 1,
player dehydration 1, villager starvation 1.
Per-seed: s75117 180d survived wave4 natEver 1 table 1
entered 0 deaths 57 starv 0; s75118 180d survived wave4
natEver 1 table 0 deaths 34; s75119 180d survived wave3
natEver 1 deaths 27; s75120 161d village-lost wave4
natEver 0 table 1 deaths 38; s75121 114d village-lost
wave4 natEver 1 deaths 25; s75122 180d survived wave4
natEver 1 deaths 42; s75123 180d survived wave4 natEver 1
deaths 32; s75124 104d village-lost wave3 natEver 0
deaths 43 starv 3.

## Metric review (for the NEXT run — never a mid-run re-score)

- EMPTY-PRIMARY LEGS: leg 2 passes vacuously at n=0.
  The next pick-band prereg should decide whether an
  empty primary universe should still pass leg 2, or
  whether it should be its own verdict class
  (e.g. DIAG-GO-EMPTY) — this evidence passes it as
  written, but a future reader should not mistake a
  vacuous pass for a measured distribution.
- SENSE-BAR HIERARCHY (new in this prereg, used as
  written): with no primary pick, tier 2 carried the bar.
  The next prereg should say whether a memory-holder
  chain still counts when the primary is empty, or
  whether an empty primary should itself fail sense —
  this run followed its own hierarchy and names the
  tier, so the question is preserved, not hidden.
- FUNNEL-PICK COUNT vs OPPORTUNITIES: the recorder
  records memory-holders regardless of freshness, so a
  stale entry inflates the pick count (maya: 79 picks,
  5 in the fresh window). The next census prereg should
  pre-register a FRESH-WINDOW pick count alongside the
  raw pick count (this band: 37 fresh-memory picks,
  7 reaching the freshness/range evaluation, 4 offered)
  so "124 picks" is never misread as 124 chances.
- FIRST-GATE ATTRIBUTION: the gate counts above name
  the first gate objHuntCandidate checks, not the only
  gate blocking that pick. A future decomposition that
  wants per-gate marginals must record all failing gates
  per pick, not just the first — the recorder already
  carries the gate flags to do it; this analyzer did not.
- SAME-TILE BLOCK (new mechanism detail, not a bug
  claim): a fight on the haven tile (4,4) can never
  produce a hunt offer (distance must be >= 1). Three
  picks on this band hit exactly that block. Whether
  that is intended is a Steve-call; the number is
  small but the mechanism is clean and worth a ruling
  before any band design assumes every survivor can be
  offered.
- SHELTER DURATION (not chased): maya stayed sheltered
  for 79 consecutive picks (d74 through at least d131).
  This arm does not judge whether long sheltering is
  intended — it records that, while sheltered, a
  villager keeps picking water/food/chores and never
  hunts. A band design that wants picks needs survivors
  who are not sheltered, or a ruling that sheltering
  should not block the offer.
- PANEL NOTE (standing): scripts/balance-panel.js has no
  census-ingest mode; identical-substrate fresh-band
  corpora are the section 15 substitute, as in funnel-a
  / departlag-a. No panel artifact faked, no panel
  verdict claimed.
- TELEMETRY DEVIATION CHECK (loop body step 10): corpus
  path for the coordinator's check is
  evidence/2026-10-29/perseed-pickband-a/*.json
  (metrics national,table,wins,exiled; baseline
  .../telemetry-baselines/scale-wall.json). Expected
  artifact class if LOUD lines appear, as in funnel-a /
  departlag-a: the baseline's regime does not match
  this substrate, and per-seed rows carry
  nationalEver/entered/won, not top-level
  national/table/wins paths. The band's true wall
  numbers are nationalEver 6/8, entered 0/8, wins 0/8.
  Baseline NOT rolled by this arm; the coordinator
  judges any LOUD lines.

## Blanks filled or documented

- FILLED (diagnosis, not a fix): the fresh-band pick
  census the assignment ordered — 8 new seeds, funnel
  substrate verbatim, all recorders on, every wave-4
  HUNT pick censused: the count is 0 (n=0), UNKNOWN 0,
  with the full funnel-pick decomposition (124 picks,
  4 offers, 0 takes, gate attribution) that explains
  the zero without re-scoring it. The scarcity finding
  (tracker blank 4) is replicated on fresh seeds and
  deepened: the binding scarcity on this band is not
  the lottery (funnel-a's layer) but the two layers
  before it — rare wave-4 field fights (1/8 seeds with
  survivors) and gate-blocked survivors (120/124 picks
  candidate-null).
- DOCUMENTED (for the next arm, not built here):
  (a) the shelter gate — 79/124 picks shelter-blocked,
  including a whole fresh window; (b) the homebody gate
  — 37/124 picks maxD-0, the funnel-a homebody question
  now measured on a fresh band (Steve-call whether
  homebodies should ever hunt); (c) the same-tile block
  — 3/124 picks, fights on (4,4) never offerable
  (Steve-call); (d) the offer itself — 4/124 offered,
  0/4 taken, so any lottery lever still has almost no
  offers to work on.
- NOT re-judged: funnel-a DIAG-GO, departlag-a DIAG-GO,
  and all prior verdicts stand as published. Funnel-a's
  numbers are recomputed from its corpus for the pooled
  line only (n=2, unchanged), not revised.

## Village assessment in plain words

Eight villages lived, fought, and mostly survived — five
reached day 180 — but only one ever met a wave-4 beast in
the field and lived to remember it, and that village's
rememberers were a sheltered woman, a homebody, another
homebody, a woman whose fights happened at her own front
door, and one woman who was offered the trip four times
and chose her life instead. Who thrived: the villages
that reached national standing (6/8 ever) without ever
fighting wave 4 — scaling and wave-4 hunting are, on this
band, barely the same story. Who died: three villages
lost outright (days 161, 114, 104), and on the one village
that produced hunters, four of the five wave-4 survivors
died after their fights (days 97, 108, 136, 169) while the
fifth — the only one ever offered the hunt back — survived
to the horizon. Missing
capabilities, in order: wave-4 field fights that actually
happen and are survived (the meeting layer); survivors
who are not sheltered, not homebound, and not fighting
on their own doorstep when the offer window opens (the
gate layer); and only then an offer that can compete with
forage, food, and a visit (the lottery layer, funnel-a's
finding, unmoved here because it was barely reached).
And a story beat for the sheltered survivor: maya's 79
picks currently exist only in a recorder — a player
would see her fetching water for two months and never
know she carries a eulogy's address in her pocket.

## Next band design (NOT a lever — the assignment forbids a fix here)

The next run that wants to grow the wave-4 pick population
should change the BAND, not the game: it needs a band
where more villagers survive a wave-4 fight and get the
offer. Concretely, in order: (1) seed-screen for bands
with wave-4 field survivors (this band's hit rate was
1/8 seeds — a pre-screen on judgedA > 0, or a longer
horizon, before committing a census band); (2) prefer
bands whose survivors are unsheltered and roaming
(maxD >= 1, not shelter-flagged in the fresh window) —
the gate layer, not the lottery, is what starved this
band; (3) keep the same census (primary + gate
attribution + fresh-window pick count, per the metric
review) so the new band is comparable to this one. What
the next run must NOT do is pool a screened band silently
with this unscreened one — screened and unscreened counts
are different populations and must stay labeled.

## Test and infrastructure notes

- `node --check` clean on all five new files;
  scripts/test-pickband-a-fixtures.js exits 0 with
  FIXTURES PASS (11/11); scripts/test-departlag-a-
  fixtures.js exits 0 with FIXTURES PASS (18/18, join
  rule reused by import, not copied);
  scripts/test-pickband-a.js exits 0 with PICKBAND-LEGS
  PASS (validity + classification; determinism /
  neutrality / sense separate); scripts/test-pickband-a-
  sense.js exits 0 with PICKBAND-SENSE PASS
  (TIER-2-MEMORY-HOLDER); scripts/test-pickband-a-
  neutrality.js 75117 exits 0 with PICKBAND-NEUTRALITY
  PASS (19/19 fields, 0 diffs); sweep --summary exits 0
  with corpus 8/8 ok.
- Determinism gate: seed 75117 re-run into a scratch dir
  inside this worktree byte-identical to the corpus row
  (cmp clean; scratch removed after the comparison).
- Recorder errors: 0 on all four channels, all 8 seeds;
  overflow 0 everywhere. Departhold dangerOutside 765
  band-wide is the recorder's expected second-caller
  class (gossip-retarget), never a classification input.
- No EPERM flap hit on this run (contrast funnel-a /
  departlag-a): all 8 seeds ran in one sweep (~6.5 min),
  all rows verified by read-back on first write.
- Safe-commit index clobber hit BOTH pre-sweep commits
  (staged-deletion twins of byte-identical files);
  repaired via HEAD-blob `git update-index --add
  --cacheinfo` with status-empty + diff-HEAD-empty +
  hash-match verification, never `git reset`. No ref
  surgery, no force, no push, no bump, no live
  verification (ship-loop line).
- Zero src/js diff on this branch (verified at closeout);
  zero policy files added or changed (all recorders
  reused verbatim); no other arm's corpus touched
  (predecessor corpora read-only; the pickband corpus
  lives in its own dir, perseed-pickband-a/). No push,
  no bump, no live verification. Ready for coordinator
  merge, pending ship — via the coordinator.

## Commits

- 7a6d3a1d6 prereg (before any judged run).
- 269979cb4 instruments (sweep + analyzer + sense +
  neutrality + fixtures).
- Corpus + analysis + sense + this evidence: final
  commit(s) on this branch (hashes in the run report to
  the coordinator).

## Convergence

scale-onramp stays converging (NOT converged): the fresh-
band pick census replicates scarcity harder than funnel-a
(0 wave-4 HUNT picks in 8 seeds, 4 offers in 124
memory-holder picks, 0 takes) and decomposes it into
three layers (rare wave-4 field fights, gate-blocked
survivors, rare offers) with a ranked band design for the
next run (seed-screen for survivors, prefer unsheltered
roaming survivors, keep the census comparable) — but no
wave-4 field party has yet killed in the field, the full
seat stays 0, wave 5 stays 0. The directive stands until
the tracker records this axis converged on measured
evidence.
