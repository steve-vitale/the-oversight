# SURVGEAR joint counterfactual — Loop B verdict (run fleshout-loop-b-20261104T2330Z, arm sim-survgear-b)

Axis: winnability chain, vetshape's named next blank #2 (the
vetshape proposal). INSTRUMENT ONLY, zero src/js. No default
flip, no VETSHAPE flip, no gate, price, deed, or readyDemand
change. The counterfactual is computed OFFLINE from the
recorder + kill log + fallen list, never by changing what the
engine counts.

## Pre-registration (committed before any judged sim)

Full text: `evidence/2026-11-04/sim-survgear-b-prereg.md`
(commit 997489ce4). In short: vetprod/vetshape's band/seeds/
policies exactly (seeds 99101–99108, competent policy verbatim,
default env), 150d death-aware horizon (+10d tail max), fresh
re-runs with the vetprod instrument reused verbatim. PRIMARY
metric: counterfactual ready days under joint (E, G), where E
= days added to each dead killer's life (deathDay + E) and G =
days a met gear leg stays met after its last met day (see
prereg for the exact minE/minG reduction). Verdict DIAG-GO for
a joint lever iff some single pair (E <= 28, G <= 30) yields
>= 1 ready day on >= 3/8 error-free seeds; otherwise
DIAG-NO-CANDIDATE; INSUFFICIENT-DATA only if > 2 seeds carry
instrument errors. Balanced panel (§15): INAPPLICABLE for a
pure diagnostic counterfactual — stated, not fabricated.

## Grounding verified in code before the pilot (not assumed)

- `src/js/standing.js` `waveCombatReadiness(w)`: VETERANS =
  DISTINCT killer vids with a wave-(w-1)+ kill in
  `state.waveKillLog`, LIVING only by default. Wave 5 demands
  4 armored (P >= 15), 6 armed, 3 tricks, 2 veterans (wave-4+
  kills). Gear legs are read from the snapshot COUNTS
  (armored/armed vs demand), not the engine short list, whose
  names vary between 'armor'/'weapons' and 'armored'/'armed'.
- `src/js/game.js` `recordWaveKill`: the per-kill choke point;
  the log is append-only and survives the killer's death.
  Death days/causes come from the engine's fallen list via
  vetprod's `killerFates` (single source of truth, reused).
- Canon: `docs/MONSTER-WAVES.md` ("Standing opens the wave
  door; combat readiness decides whether the village walks
  through"; VETERANS = living roster members with a
  wave-(w-1)+ kill). No canon invented.
- Release proxy: RAW standing >= 200, never gated — vetshape's
  lesson (the engine caps gated standing at 199 while a
  village is held, so gated >= 200 can never fire on a held
  seed). Tricks uses its actual daily count; it is not held.

## Verdict — DIAG-NO-CANDIDATE (judged strictly against the prereg)

- No single pair (E <= 28, G <= 30) yields a ready day on
  >= 3/8 seeds. In fact no pair in the whole scan grid yields
  a ready day on even 2 seeds within those bounds: the best
  in-bounds pair, (28, 30), releases exactly 1 seed (99101,
  21 ready days). The prereg bar (3/8) is not met — and not
  close. No re-scoring against a friendlier bar.
- The only shared pair in the full grid is (60, 30): it
  releases 2/8 seeds (99101, 99104) — outside the GO bounds
  on E, and still short of 3/8 at any scanned E/G.
- Instrument errors 0 on all 8 seeds (860 daily snapshots,
  42 wave-4 fight events, 8 wave-4 kills, full fallen lists).
- Proof: `scripts/test-survgear-20261104.js` — 11/11 PASS
  (fixture tests for overlap, hold expiry, same-day
  kill-and-die, the 99104 d147–149 table, survival-only /
  gear-only separation, the gated cap; analyzer determinism;
  live determinism + on/off neutrality on seed 99108 at 30d).

## Reproduction check (fresh corpus vs vetshape, seed by seed)

The fresh survgear corpus reproduces vetshape's shared numbers
EXACTLY on every compared field, all 8 seeds: days, peak gated
standing, wave-4 fight counts, wave-4 kill counts, killer
identities, killer first-kill days, and killer death days.
The instrument did not perturb the trajectories it measured,
and the band is deterministic across runs for the third time
(vetprod → vetshape → survgear).

| seed | days | end | peak gated | peak raw | w4 fights | w4 kills | killers ever |
|------|------|-----|------------|----------|-----------|----------|--------------|
| 99101 | 150 | survived | 199 | 355 | 13 | 3 | 3 |
| 99102 | 116 | lost | 199 | 215 | 0 | 0 | 0 |
| 99103 | 121 | lost | 180 | 180 | 17 | 1 | 1 |
| 99104 | 150 | survived | 199 | 225 | 8 | 3 | 2 |
| 99105 | 52 | lost | 140 | 140 | 4 | 1 | 1 |
| 99106 | 59 | lost | 150 | 150 | 0 | 0 | 0 |
| 99107 | 72 | lost | 50 | 50 | 0 | 0 | 0 |
| 99108 | 48 | lost | 20 | 20 | 0 | 0 | 0 |

## THE JOINT ANSWER, in three columns (never conflated)

Survival-only (E, G = 0): NO seed has a solution at any
E <= 120. Gear-only (E = 0, G): NO seed has a solution at any
G <= 90. Joint (E, G): exactly 2 seeds have any solution at
all within E <= 120, G <= 90. Each column alone is empty; the
conjunction is necessary — and still only reaches 2/8.

| seed | survival-only min E (G=0) | gear-only min G (E=0) | joint minimal (E, G) | joint ready day(s) |
|------|--------------------------|----------------------|---------------------|--------------------|
| 99101 | none | none | (18, 18) on d123; also (32, 17) on d137 for min-G | d123 at (18,18); 21 days at (28,30) |
| 99104 | none | none | (29, 1) on d149 | d149 only at (29,1); 3 days (149–151) at (60,7) |
| 99102 | none | none | none | — |
| 99103 | none | none | none | — |
| 99105 | none | none | none | — |
| 99106 | none | none | none | — |
| 99107 | none | none | none | — |
| 99108 | none | none | none | — |

Scan grid (ready-day counts; E rows x G columns):

| seed | (0,*) | (7,*) | (14,*) | (28,30) | (60,7) | (60,30) |
|------|-------|-------|--------|---------|--------|---------|
| 99101 | 0 everywhere | 0 everywhere | 0 everywhere | 21 | 0 | 27 |
| 99104 | 0 everywhere | 0 everywhere | 0 everywhere | 0 | 3 | 3 |
| all others | 0 | 0 | 0 | 0 | 0 | 0 |

(Full grid E in {0, 7, 14, 28, 60} x G in {0, 7, 14, 30} is in
the analyzer output; every cell not shown above is 0.)

Why survival-only is empty even on the killer seeds:
- 99101: the weapons leg was last met on d120, three days
  BEFORE the second killer is banked (d123). No survival
  extension can create a day when both gear legs are
  actually met and two killers are alive, because after
  d123 the weapons leg is never actually met again.
- 99104: the gear legs were jointly met on d147–d148, when
  only ONE killer had been banked. No survival extension
  can help those days — there is no second killer yet.
Why gear-only is empty on every seed: living veterans never
reach 2 on any seed (max living 1, vetprod/vetshape), so no
gear hold, however long, can satisfy the veterans leg at
E = 0. That is a computed result, not an assumption — the
analyzer evaluates it and finds nothing.

## Anatomy of the two joint solutions

- 99101, minimal (18, 18) on d123: the first killer died
  d106 and the second is banked d123 — the first needs +18
  days of life to still stand on d123. The armor leg was
  last met on d105 — it needs +18 days of hold to still
  count on d123. (The weapons leg was last met d120, inside
  the same hold.) Both numbers are 18 by coincidence of the
  calendar, not by construction: the armor slip (d105) and
  the first death (d106) happen one day apart, and the
  second banking (d123) is 18 days after both. The
  alternative minimal-G pair (32, 17) on d137 trades a
  longer survival extension (the first killer must survive
  to d137) for a shorter hold (armor is actually met again
  on d137; weapons held 17 days from d120).
- 99104, minimal (29, 1) on d149: the first killer died
  d121 and the second is banked d149 — the first needs +29
  days of life. The weapons leg was met d148 and slips
  d149 — it needs +1 day of hold. This misses the prereg's
  E <= 28 bound by exactly ONE day. Post-hoc observation,
  NOT a re-score: a (30, 30) pair — a calendar month of
  extra killer life plus a month of gear hold — would
  release both 99101 and 99104. That is 2/8 seeds, still
  short of the 3/8 bar, and outside the pre-registered
  bounds; it is recorded here so the NEXT arm can
  pre-register it honestly, not so this verdict moves.

## Why the other six seeds cannot be helped by this lever at all

- 99103, 99105: only ONE killer ever banked. A survival
  extension cannot create a second killer, and a gear hold
  cannot either. 99103's raw standing also never reaches
  200 (peak 180), so no (E, G) could release it regardless.
  99105's village dies d52, one day after its only veteran
  is blooded.
- 99102, 99106, 99107, 99108: ZERO killers ever. 99102 is
  the sharpest case: it holds 15 raw >= 200 days with ONLY
  veterans short — the door is open and the gear is in
  order — but no killer exists for any extension to keep
  alive. The joint lever is moot where no kill is ever made.

## 99104 one-day miss, re-checked (fresh corpus, day by day)

Vetshape's d147–d149 account REPRODUCES exactly:

| day | raw | gated | armored | armed | tricks | living vets | engine short | shape | minE | minG |
|-----|-----|-------|---------|-------|--------|-------------|--------------|-------|------|------|
| 147 | 200 | 199 | 4 | 6 | 24 | 0 | [veterans] | 1 | — | 0 |
| 148 | 200 | 199 | 4 | 6 | 24 | 0 | [veterans] | 1 | — | 0 |
| 149 | 225 | 199 | 4 | 5 | 24 | 1 | [weapons, veterans] | 2 | 29 | 1 |
| 150 | 225 | 199 | 4 | 4 | 24 | 0 | [weapons, veterans] | 2 | 30 | 2 |

On d147–d148 everything but veterans is met and only one
killer is banked; on d149 the second killer arrives the
very day the weapons leg slips (armed 6 → 5) and the first
killer has been dead 28 days. The miss is one day of gear
hold AND 29 days of killer life, jointly — neither alone
closes it, which is exactly the conjunction this arm was
built to measure.

## Killer survivorship (re-confirming vetprod/vetshape)

Intervals (kill-to-death, first kill to death day), all seeds:
[0, 0, 2, 5, 7, 14] days — median 3.5 days, exactly
vetprod's and vetshape's number, re-confirmed on a third
fresh corpus. Death causes: the wild x3, the arena x1,
contest x1, a wound that wouldn't close x1. One killer alive
at end of run (99105's, blooded d51, village lost d52).

## Binding-leg day counts (actual legs, E = 0, G = 0)

On raw >= 200 days — the days when standing is no longer the
blocker — the short-set is veterans-involved on every day of
every seed that reaches 200: 99101: veterans-only 8,
armor+veterans 15, armor+weapons+veterans 26,
weapons+veterans 5; 99102: veterans-only 15; 99104:
veterans-only 9, weapons+veterans 22. Tricks is essentially
never the blocker (demand 3 vs counts in the 20s); the
binding legs are veterans first, gear second, standing never
once raw reaches 200. (Full all-days binding tables are in
the analyzer output.)

## Wall numbers (this corpus, baseline observations, not wall movement)

Wins 0/8. National 0/8, table 0/8 (scaleRank "village" on all
8; no seed leaves village scale). Wave-4 unlocks 6/8, wave-4
faced 4/8 (99101, 99103, 99104, 99105), wave-4 kills 8 total,
wave-5 unlocks 0/8, wave-5 faced 0/8, wave-5 kills 0.
Readiness-5-ready days 0/8 (engine `ready` flag never true on
any daily snapshot). Median run-days 94 (days sorted
48 / 52 / 59 / 72 / 116 / 121 / 150 / 150; 2 seeds censored at
the 150d horizon: 99101, 99104 survived). Death-cause shares
for villages generally: not instrumented by this arm — not
reported, not guessed. Killer death causes (above) are the
only death-cause numbers this arm owns.

## Reachability verdict

Waves 1–4 are reached and faced; wave 5 is unlocked on no
seed, faced on no seed, and killed on no seed. Regional →
national, the table, and the win flag are unreached on all 8
seeds. The wall has not moved on this band: the door to
wave 5 stays shut because the release conditions never
coincide, not because any single leg is unreachable in
isolation — standing reaches 200+ raw, gear legs are met on
many days, killers are banked — but never all at once.

## Village assessment (plain words)

Picture eight villages playing competently. Two of them come
close enough that you can name the exact joint fix: one
needs its first blooded fighter to live eighteen days longer
while its armor stays in order for eighteen days, and the
other needs its first fighter to live twenty-nine days
longer while its weapons hold for a single extra day. Those
are real, modest-sounding numbers — and they are the whole
story only for those two villages. The other six cannot use
the fix at all: four never blood a fighter, one bloods a
single fighter and dies the next day, one bloods a single
fighter and never climbs to the standing it needs. A lever
that keeps killers alive and gear steady is a lever for the
villages that already kill. For most villages on this band,
the missing thing is still the kill itself — the encounter
that never comes, or the fight that never turns into a
second veteran. The bar is not one lock with one key, and it
is not two locks with two keys either. It is two keys for
two villages, and no key at all for the other six.

What knowledge/capabilities were missing: not measured as
knowledge here — the missing capabilities are kill
production (encounters that yield a second killer),
killer simultaneity (two blooded fighters alive together),
and gear-leg stability through the banking window, in that
order across the band. No villager behavior was flagged as
robotic by this arm's corpus.

## Sense-test (this arm's own corpus, judged for meaning)

- The veteran-word collision REPRODUCES for the third time
  in this arm's own corpus, verbatim: the System celebrates
  wave-3 kills as "veteran kills" ("Naran just put down
  Spool... on CAMERA. That's a veteran kill, folks. REMEMBER
  the name." — d44, 99101; same line for The Focus Group,
  The Redactor, The Loud Beast, and others across seeds),
  while the same corpus warns of monster veterans ("A
  Scarred veteran" d98, "A Elder veteran" d138, 99101) and
  the readiness bar wants villager veterans. A player told
  to "blood your fighters (0 of 2 veterans)" while fighting
  "veterans" in the wilds and hearing "veteran kill" for a
  Spool is being given a riddle, not an instruction. This
  arm's counterfactual sharpens the cost of the confusion:
  even a player who correctly banks two real wave-4 killers
  (dead) would still not have opened the door.
- Village voice reads as people deliberating, not robots:
  "Half rations for three days, voted and held — or a hard
  hunt now, hungry, to fill the bins before it's choosing-
  who-eats." (d150, 99101) — a genuine dilemma, voted on,
  with the stakes named. Mourning lines are specific, not
  templated grief ("The Big Loud killed Zhanar in 1 round.
  The village mourns." d144, 99101).
- Say-sample note: the filter matches vetshape's (cap 300);
  captured 96 lines on 99101 (sayCount 14846) and 48 on
  99104 (sayCount 14339). The sample is combat-filtered by
  design.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- PRIMARY metric held up and refused the lever cleanly: no
  in-bounds pair reaches 3/8, and the only shared pair in
  the grid reaches just 2/8 at (60, 30). The verdict does
  not depend on the secondary definitions.
- The minE/minG reduction is the right instrument for this
  question: each snapshot day collapses to the smallest E
  and smallest G that would make it ready, so the exhaustive
  search over E <= 120 / G <= 90 is exact, not sampled —
  and the fixture tests pin the edge semantics (same-day
  kill-and-die, hold expiry, never-met legs, the gated cap).
- Snapshot-day granularity: ready days are evaluated only
  on snapshot days (one per day, plus the driver's post-run
  snapshot, which lands on d151 for 99104). That extra day
  adds ready days only to the large-E grid cell (60, 7);
  no minimal pair depends on it (d123, d149), so the
  verdict is unaffected — but a future arm should either
  drop the post-run snapshot or state its horizon rule in
  the prereg.
- The (28, 30) GO bound deserves a note for the next
  prereg, not a revision of this one: 99104's minimal E is
  29, one day over. If the next arm wants to test a
  calendar-month survival extension (E = 30), it should
  pre-register E <= 30 explicitly and keep the >= 3/8
  seed bar — lowering the seed bar to 2/8 after seeing
  this result would be re-scoring, and this arm does not do
  it.
- Gear-leg hold semantics held up: a hold that extends a
  met leg for G days after its last met day is the natural
  reading of "legs held at their peak-met state," and the
  99101 anatomy (armor last met d105, weapons last met
  d120, both bridging to d123) shows the two legs need
  different holds — a single "gear stability" number would
  hide that. A future lever design should specify per-leg
  holds, not one blanket G.

## Next blanks, in order (proposals only — this arm builds nothing)

1. Two-track work, restated with joint numbers (NOT a joint
   lever alone): track A, kill production / encounter
   opportunity for the six no-solution seeds (99102, 99103,
   99105, 99106, 99107, 99108 — unlocked-but-unmet, single-
   killer, and never-unlocked alike; a survivorship+gear
   lever cannot help a village with fewer than two killers
   ever); track B, the joint hold itself, pre-registered
   honestly — e.g. E <= 30, G <= 30, >= 3/8 seeds — on a
   band where more than two seeds bank two killers, since
   on this band even a perfect joint lever caps at 2/8.
   Do NOT move readyDemand numbers on this evidence, and
   do NOT flip the VETSHAPE default: vetshape showed it
   releases 0/8, and this arm shows the joint fix still
   caps at 2/8 here.
2. Standing accumulation, part 2 (standaccum blank 3, still
   open): after blanks 1–2, re-measure whether a village
   that both meets wave 4 and keeps two killers alive
   reaches 200 gated AND ready — the release this arm, like
   vetshape, never observed in the engine (only
   counterfactually).
3. Veteran-word collision (sense-test finding, naming pass,
   not mechanics): the game calls hardened monsters, wave-3
   kills, and blooded villagers all "veterans" on screen.
   Needs a design eye, not a sim.

## Proof and landing

- Proof: `scripts/test-survgear-20261104.js` — 11/11 PASS
  (fixture tests + analyzer determinism + live determinism
  and on/off neutrality on seed 99108 at 30d).
- Commits (this worktree branch sim-survgear-b; coordinator
  merges via --ff-only; merged locally, pending ship — no
  push, no bump, no live verification by this worker):
  - 997489ce4 sim-survgear-b prereg (before any judged sim)
  - 9e37fbf89 sim-survgear-b instruments + proof 11/11 (zero src/js)
  - (pilot + evidence commit below)
- Files: prereg + evidence in `evidence/2026-11-04/
  sim-survgear-b*.md`; per-seed JSON in
  `evidence/2026-11-04/perseed-survgear-b/` (8 files,
  survgear-pilot run); pilot driver log
  `evidence/2026-11-04/survgear-pilot-driver.log`; scripts
  `survgear-driver-20261104.js`,
  `survgear-analyze-20261104.js`,
  `test-survgear-20261104.js` (vetprod instrument reused
  verbatim, zero src/js anywhere in this arm).
- Index-clobber note: safe-commit.sh left bogus staged
  deletions in the main index after both commits;
  repaired each time via HEAD-blob `update-index
  --cacheinfo` and verified `git status` empty +
  `git diff HEAD` empty. The commits themselves were always
  correct.
- Worktree state at handoff: only committed work; no
  uncommitted leftovers beyond the pilot + evidence commit
  below (verified before reporting).
