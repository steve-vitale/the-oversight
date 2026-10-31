# sim-rosterlot-a — the roster-lottery census (DIAG-GO)

Run: Loop A worker, arm sim-rosterlot-a, axis scale-onramp, run
fleshout-20261031T1850Z. Answers patrolsilent N2 (measurement, not a
fix): how often does a village START with zero combat occupations AND
no kills pathway — the 85107 shape.
DIAG ONLY: zero src/js changes, zero policy changes, zero lever build.
Worktree branch: sim-rosterlot-a. Base anchor: the worktree HEAD at
sweep time, recorded per-seed in the corpus (`anchorCommit`).
Pre-registration: evidence/2026-10-31/sim-rosterlot-a-prereg.md
(committed BEFORE any judged sims, commit ac46da478; no amendments).
Instrument: scripts/rosterlot-sweep-20261031.js (generation-time
roster read, no days run, no policy) + scripts/rosterlot-analyze-20261031.js
(derives every judged number from the per-seed JSONs only).
Proof: scripts/test-rosterlot-20261031.js — 32/32 GREEN (pure
functions, synthetic corpus, live pool scans, live gate: seed 85201
re-run in a fresh process byte-identical to the committed corpus).
No [needs-eyes] (measurement only; nothing player-facing ships).
Panel (§15): NOT APPLICABLE, none fabricated — single-base DIAG
census, not a before/after lever comparison (same declaration as
patrolsilent-a). A later lever arm reusing this corpus as its
baseline runs the panel then.

## Verdict: DIAG-GO (judged exactly against the prereg)

1. Pilot cleanliness — GO. 8/8 pilot seeds complete: roster 12,
   askable 11, personMissing 0, recorder errors 0, nonzero kills 0.
2. Determinism — GO. Seed 85201 re-run in a fresh process yields a
   byte-identical roster table (ids, occupations, order, scholar id,
   shape flag) to the committed corpus.
3. Extension completeness — GO. All 24 seeds (85201–85224) have a
   roster table in the corpus; the analyzer derives every judged
   number from those JSONs only.
4. Sense test — GO. Two rosters read in full (85201 shape, 85207
   contrast) — see §Sense test.
5. Reporting — GO. Counts AND proportion, Wilson interval,
   holder-count distribution, holders by occupation and source,
   trap-knowledge secondary count, player-is-combat count,
   full-roster holder count, and the wall-numbers paragraph below.

## The answer, in plain words

Most villages start with nobody the leader is allowed to send to the
treeline. On 14 of 24 fresh starting rosters (58.3%), none of the 11
villagers the leader can ask wears a combat uniform — and since
nobody has killed anything yet on day one, nobody qualifies by a
kill either. That is the 85107 shape, and it is not a rare accident:
it is what the starting draw produces most of the time.

There is no hidden weighting to find. The draw is 6 generated
villagers (4 combat occupations in a 78-occupation pool) plus 6
background survivors (the same 4 uniforms among 100 seeds), and the
naive-draw expectation from those pool sizes alone is 0.5934 —
against 14/24 = 0.5833 observed. The lottery IS the draw. A village
that starts shape-shaped is not broken; it is the common case, and
its only routes to a patrol are the ones patrolsilent already saw
happen mid-run: somebody earns a kill on an expedition (any
occupation can — mechanic, farmer, street artist, paramedic, ESL
teacher all did), or a newcomer arrives carrying a uniform
(drifter applicants can literally be a `hunter`; later background
applicants can be a soldier, firefighter, officer, or guard).

Two sharper edges inside the headline:

(a) THE UNIFORM CAN BELONG TO THE ONE PERSON WHO CANNOT BE ASKED.
    Seed 85220 starts with exactly one combat occupation in the
    whole village — and it is the scholar's. Among the askable 11
    the seed is shape-shaped; counting the full roster it is not.
    Any census that counts the full roster overstates askable
    coverage by exactly this case (1/24 here).
(b) FIVE VILLAGES START WITH NEITHER UNIFORM NOR TRAP KNOWLEDGE.
    5/24 shape seeds also have zero trap-knowledge villagers among
    the askable (no hunting guide, farmer, trail crew lead, fishing
    guide, exterminator, rancher, forager, bush pilot, or soldier).
    Trap knowledge is NOT a kills gate — patrolsilent's
    kills-earned holders prove kills come without it — but the
    overlap shows how thin the starting treeline bench can be: no
    uniform, no snare-knower, no kill, day one.

What this census does NOT show: that starting shape-shaped blocks
scale. Patrolsilent's band reached national/table on its policy
substrate despite 3 silent seeds, and this census runs no days at
all — it cannot speak to whether a shape-shaped village recovers
by kills or joiners, or how fast. The scale question stays with
the long-run arms; this arm prices the starting condition only.

## Definitions (exact; full text in the prereg)

- STARTING ROSTER: `state.village.roster` immediately after
  `setupGame` (harness start, `loadGame` seed + `setupGame`, same
  substrate call as patrolsilent, zero days run). Size 12 on all
  24 seeds: 6 generated + 6 background, every seed.
- ASKABLE POOL: roster minus the scholar (`Game.villagerId`) = 11
  on all 24 seeds. Delegate never asks the scholar.
- COMBAT OCCUPATION: the delegate regex verbatim on lowercased
  `formerOccupation`:
  `/(hunter|soldier|police|marine|ranger|security|firefighter|boxer|mma)/`.
  Persons read from `Game.data.villagers` (post-`newGame` this holds
  generated + hydrated background survivors), never via
  `Game.getPerson`. Kills read RAW from agency stats when present,
  else null — absent/zero on all 24 seeds (0 nonzero kills).
- 85107 SHAPE (generation-time): ZERO combat-occ holders among the
  11 askable. The kills clause is satisfied trivially at generation
  (kills are zero/absent for everyone by construction) — stated,
  not hidden. Mid-run kills rescue and fit-first trapping are
  separate, already-measured phenomena, never folded into this rate.
- Edge cases kept OUT of the holder count: `hunting guide`
  (regex-negative — /hunter/ does not match "hunting guide";
  carries knowsSnare + knowsPit, reported under trap-knowledge
  only); the `marine` / `ranger` / `boxer` / `mma` regex arms match
  NO occupation in either pool (pool scan pinned in the proof
  test); mid-run drifter `hunter` applicants (membership.js
  `genApplicant` light list) and later background applicants are
  rescue channels, not starting villagers.

## Band numbers (judged band, 24 fresh seeds 85201–85224, this base)

- 85107 SHAPE: 14/24 = 58.3%, Wilson 95% [0.3883, 0.7553].
  Shape seeds: 85201, 85202, 85203, 85204, 85206, 85208, 85210,
  85212, 85213, 85214, 85215, 85218, 85219, 85220.
  Naive-draw expectation 0.5934 (generated part 0.7630 x
  background part 0.7777) — observed 0.5833 sits on it.
- Holder-count distribution (askable): 0 holders 14 seeds, 1 holder
  9 seeds, 2 holders 1 seed (85207), 3+ holders 0 seeds.
- Holders by occupation (11 total askable holders): night security
  guard 5, Police officer 3, infantry soldier 2, Firefighter 1.
- Holders by source: generated 6, background 5 — balanced; neither
  half of the draw carries the coverage.
- Full-roster holders (incl. player): 0 holders 13 seeds, 1 holder
  10 seeds, 2 holders 1 seed. The 13-vs-14 gap is seed 85220
  (scholar-only uniform, §(a) above).
- Player-is-combat seeds: 1/24 (85220 only).
- Trap-knowledge askable distribution: 0 on 8 seeds, 1 on 8, 2 on
  6, 3 on 2. Shape AND zero trap-knowledge askable: 5/24
  (85201, 85214, 85218, 85219, 85220).
- Completeness: judged 24/24, failed seeds none, personMissing 0
  on every seed, recorder errors 0 on every seed, nonzero kills
  at generation 0 on every seed.
- Pool scans (proof test, live against current data files):
  generated pool 78 occupations, exactly 4 combat (firefighter,
  police officer, infantry soldier, night security guard);
  background pool 100 seeds, exactly 4 combat (same 4 names);
  trap-knowledge occupations in the generated pool exactly 9
  (hunting guide, farmer, trail crew lead, fishing guide,
  exterminator, rancher, wild food forager, bush pilot, soldier).

## Seed-by-seed table (from the analyzer; holders = askable holders)

- s85201 SHAPE: holders 0, trap 0. Roster: mushroom grower,
  pottery instructor, tailor, aquarium keeper, veterinarian, dry
  cleaner (generated) + chimney sweep, social worker, ESL teacher,
  beekeeper, fisherman, truck driver (background).
- s85202 SHAPE: holders 0, trap 1.
- s85203 SHAPE: holders 0, trap 2.
- s85204 SHAPE: holders 0, trap 2.
- s85205: holders 1 — night security guard (generated), trap 1.
- s85206 SHAPE: holders 0, trap 2.
- s85207: holders 2 — Firefighter (generated), infantry soldier
  (background), trap 3. Contrast roster, see §Sense test.
- s85208 SHAPE: holders 0, trap 1.
- s85209: holders 1 — Police officer (background), trap 1.
- s85210 SHAPE: holders 0, trap 1.
- s85211: holders 1 — night security guard (generated), trap 0.
- s85212 SHAPE: holders 0, trap 1.
- s85213 SHAPE: holders 0, trap 2.
- s85214 SHAPE: holders 0, trap 0.
- s85215 SHAPE: holders 0, trap 3.
- s85216: holders 1 — Police officer (generated), trap 0.
- s85217: holders 1 — infantry soldier (generated), trap 2.
- s85218 SHAPE: holders 0, trap 0.
- s85219 SHAPE: holders 0, trap 0.
- s85220 SHAPE (askable): holders 0, trap 0, full holders 1 —
  the scholar alone holds the combat occupation.
- s85221: holders 1 — night security guard (background), trap 2.
- s85222: holders 1 — night security guard (background), trap 1.
- s85223: holders 1 — Police officer (generated), trap 0.
- s85224: holders 1 — night security guard (background), trap 1.

## Sense test (SENSE-TESTING LAW, two rosters read in full)

Both rosters read as varied people, not a degenerate lottery. The
shape seed (85201) is a coherent civilian village: a mushroom
grower who "knows mycelium like a friend," a potter who reads a
student's week by shaking hands on clay, a tailor, an aquarium
keeper, a veterinarian who "reads an animal that cannot say where
it hurts," a dry cleaner, a chimney sweep of thirty-five years, a
social worker, an ESL teacher, a beekeeper, a fisherman, a truck
driver. Ages 23–63, goals from lead to belong to heal to feed.
Nothing about it reads broken — its lottery failure is narrow and
specific: no uniform, no kill, and not even a trap-knower. The
veterinarian is the sharpest illustration of the rule's narrowness:
the closest thing to a treeline reader in the village, invisible to
a regex that only recognizes uniforms and kills.

The contrast seed (85207) reads the same way — vintner, dispatcher,
truck driver, interpreter, arborist, florist, trail crew, dentist,
journalist — except two people happen to carry the recognized
uniforms: Addison the firefighter ("ran into burning buildings for
the Columbus fire department for eleven years... they know what
fear sounds like in their own head and how to walk through it")
and Vasyl the soldier ("Two tours. Doesn't talk about them.
Watches the tree line."). The fiction even gestures at the patrol
job; the rule sees these two and no one else. The difference
between the two villages is two job titles in a twelve-person draw,
not a difference in kind.

One sense nit, reported not chased (DIAG arm, outside this axis):
Leo Martin, 16, trail crew lead, "spent six seasons building trail"
— six seasons at sixteen means starting at ten. Age/backstory
tension in one generated line; a generation-coherence note for a
future arm, not a census input (his occupation counts as drawn).

## Wall numbers (NOT observable here — stated, never fabricated)

This is a generation-time census: national / table / wins and wave
reach are NOT observable on it, and no long-horizon follow was run
(no follow was pre-committed; scope discipline). Patrolsilent's
band numbers (national 10/16, table 11/16, wins 11/16 on its policy
substrate) are NOT this arm's numbers and are not re-claimed here.
Arc reach, four-realm formation, trap acquisition by source,
counter discovery/kill rates, and young-link succession survival
are NOT instrumented in this substrate and are NOT reported.

## Instrument notes (read before reusing)

- The census reads AFTER `setupGame` (which calls `Game.depart()`
  internally) — that is the start-of-play roster, the roster a
  player actually starts with. No days, no policy, no upkeep beats.
- Persons MUST be read from `Game.data.villagers`: post-`newGame`
  it holds generated chars plus hydrated background survivors, so
  the patrolsilent instrument's `personMissing` worry does not
  arise here (0 missing on all 24 seeds). `Game.getPerson` is still
  never called (hydration side effects).
- Kills at generation are null (agency object absent), never 0 —
  the sweep records null and the analyzer counts only numeric
  nonzero kills. A future reader that coerces null to 0 would
  still get the same shape rate, but would lose the
  absent-vs-zero distinction.
- Sweep resumes valid per-seed outputs and rewrites 0-byte /
  unparseable ones; writes are atomic (tmp + rename) with retries
  for the container EPERM write flap. No EPERM episode actually
  hit this arm's writes; the retries are belt-and-braces carried
  from patrolsilent's run.
- Check hygiene note: `node scripts/check.js --quick` was started
  after the evidence draft and produced no output in ~7 minutes, so
  it was killed (SIGTERM) rather than left running. This arm changes
  no src/js, no data, and no shared tooling — only new scripts/ and
  evidence/ files — and its own proof test is 32/32 GREEN, so the
  hung quick-check is recorded here, not treated as a gate or a
  failure of this measurement. If the coordinator's landing check
  runs quick/full, a hang there is pre-existing tooling behavior,
  not something this commit introduces.
- Index-clobber note: the prereg safe-commit left the worktree
  index showing the prereg file as deleted + untracked (the known
  safe-commit index-clobber class). Repaired with
  `git update-index --add --cacheinfo` from the HEAD blob
  (worktree hash matched HEAD); commit ac46da478 verified correct
  before any sims ran. The coordinator's landing check should
  still confirm `git status --short` empty after merge.

## Findings for the coordinator (reported here, NOT edited into hidden_files/sim-findings.md — coordinator owns that file)

- N2 ANSWERED: the 85107 shape at generation is 14/24 = 58.3%
  (Wilson 95% [0.3883, 0.7553]), matching the naive-draw
  expectation 0.5934. Patrol silence at start is the common case,
  not an anomaly — no hidden weighting, no pool bug.
- Implication for N1 (NOT built — DIAG ONLY): the kills-cred
  override matters against this background — most villages must
  EARN their first cred holder through a kill, so a rule that
  hides kills-earned cred behind fit-first occupations (85111/
  85114) blocks the main rescue path for the majority shape.
  Pricing N1's value starts from 58%, not from the 3/16 silent
  rate.
- Implication for scale-onramp (open, not a verdict): whether
  starting shape-shaped delays or blocks scale is unmeasured
  here — it needs a long-run arm that starts from shape seeds
  and watches kills/joiners rescue patrol, not another census.
- Sense nit (open, minor): age/backstory tension on young
  generated villagers with long work histories (Leo Martin, 16,
  six seasons) — generation-coherence backlog material.
- Adjacent note (not chased): the scholar-only-uniform case
  (85220) means any full-roster holder count overstates askable
  coverage; future censuses must split askable vs full, as this
  one does.

## Metric review (for the NEXT run, never a re-score of this one)

1. The prereg's "kills pathway" phrasing risked implying a
   generation-time kills measure exists. It does not: at
   generation kills are absent for everyone, so the shape reduces
   to the occupation draw, with the kills clause trivially
   satisfied. Future preregs should define the kills clause as
   "absent-by-construction, reported as such" up front, as this
   one did in its definitions — the phrasing in the brief ("AND
   no kills pathway") should not be quoted without that gloss.
2. The trap-knowledge secondary count proved more informative
   than expected (5/24 shape-and-no-trap) and is worth keeping
   in future roster censuses as the "thin bench" indicator — but
   it must keep its label: it is NOT a kills-pathway measure
   (patrolsilent's kills-earned holders disprove any gate).
3. The Wilson interval ([0.39, 0.76] at n=24) is wide enough that
   a future arm wanting a ±5pp rate needs ~4x the seeds; n=24
   settles "common case vs rare accident" (it is the former) and
   nothing finer. Do not over-read the second decimal.
4. The naive-draw expectation matched almost exactly (0.5934 vs
   0.5833). Future censuses on a changed pool (new occupations,
   new background seeds) must recompute the expectation from
   the pool scan, not carry 0.59 forward.

## Convergence state

converging — the scale-onramp axis measurement: the N2 question
is answered with a priced rate on this base (14/24 shape at
generation, expectation-matched), and the next lever (N1) is now
priced against a 58% background, not a 3/16 anecdote. No game
change landed in this run (measurement only).

## Files

- Pre-registration: evidence/2026-10-31/sim-rosterlot-a-prereg.md
- Evidence: evidence/2026-10-31/sim-rosterlot-a.md (this file)
- Census sweep: scripts/rosterlot-sweep-20261031.js
- Analyzer: scripts/rosterlot-analyze-20261031.js
- Proof: scripts/test-rosterlot-20261031.js (32/32 GREEN)
- Corpus: evidence/2026-10-31/perseed-rosterlot-a/
  s85201–s85224.json (24 files)
- Sense probe (NOT committed, /tmp): /tmp/rosterlot-sense.js
