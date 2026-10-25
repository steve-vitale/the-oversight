# sim-poolpres-a — pool-presence diag for the raid draft (axis scale-onramp)

Run: fleshout-20261025T1418Z (Sun 2026-10-25 ~09:24 CDT onwards).
Axis: scale-onramp (converging). DIAG ONLY — zero src/js changes,
zero game-code changes, zero default flips. Recorder reuse only:
scripts/policies/raftdraft-diag.js (unchanged) + the raftdraft
sweep's armed mode (unchanged) to collect the corpus; the new
instrument in this run is the analyzer only
(scripts/test-poolpres-diag.js, read-only over the corpus).

## PRE-REGISTRATION (binding, written BEFORE any sweep, judged only against this)

- Question: raftdraft-a (evidence/2026-10-25/sim-raftdraft-a.md)
  answered "pool composition, not draft order" — pool wave-3+
  share 7.2% (103/1,423 pooled per-raid pool counts) vs ~23%
  needed for 1 wave-3+ raider/raid at mean raidN 4.36 — but that
  ~23% used a single mean raidN. This diag re-measures the pool
  on CURRENT master (which now includes the belltoad chorus-break
  fix 818361b41 and the post-flee <=25% rest rule d39228b3e, both
  landed after raftdraft-a) and recomputes the implied presence
  under the ACTUAL draft-size distribution, not one assumed size.
- Substrate (shared, landed pattern): tableseat-nowait —
  leanlinkrescue courtship (LEANLINKRESCUE=1) + seat legs only
  (TABLESEATNOWAIT=1), no wait leg. Seeds 73671–73678, 180d
  death-aware horizon (runDays stops on death/win; 180 is the
  cap, MEASUREMENT §10 reachability horizon 150–200d).
- Corpus: armed rows only (RAFTDRAFT=1, tableseat-nowait +
  raftdraft-diag). Recorder neutrality was proven by raftdraft-a
  (G2 8/8 identical, G1 detgate PASS), so armed trajectories ARE
  the substrate trajectories; re-running 8 baseline rows would
  double compute for no new information. Wall numbers are read
  from the armed rows themselves.
- PRIMARY METRIC: band pool wave-3+ share — pooled per-raid
  living-pool counts summed across raids, same denominator as
  raftdraft-a (each raid drafts from the pool as it stands that
  day, so per-raid pools are the right denominator; this is NOT
  a distinct-monster census, entities carry no stable id).
  Expected precision: with ~1,400 pooled pool monsters, the
  binomial standard error at p~0.07 is ~0.7 percentage points;
  the share is reported to ±2pp.
- DIAG-GO (binding): (a) census complete on 8/8 armed seeds
  with zero recorder errors; (b) all four numbers reported with
  denominators: pool wave-3+ share, raids with >=1 wave-3+
  raider, raiders per raid (raidN distribution), and the
  implied presence for 1 wave-3+ raider/raid computed TWO ways
  — mean-raidN (1/E[raidN]) and raidN-distribution-weighted —
  agreeing within 2pp, plus a hypergeometric check at the
  observed pool sizes; (c) a named next lever with its own
  pre-registration sketch (or none supported). Pilot only:
  8 seeds, no confirm. The pilot IS the band — stated, not
  hidden.
- CONTROL (reported, NOT a pass/fail gate — stated before the
  sweep because the substrate moved): raftdraft-a published
  raids 90, raiders 392, pool wave-3+ share 7.2%, wave-3+
  drafted 8.2%, wall won 4/8, median 150d, national-ever 8/8,
  wave-4 5/8, wave-5 0/8. Two game-code fixes landed on master
  since (belltoad, post-flee threshold), so exact replication
  is NOT expected; any delta is reported as a delta table with
  the substrate move named as the cause candidate, never
  hidden and never used to re-judge the diag.
- HORIZON + WHY: 180d death-aware, identical to raftdraft-a:
  pool presence grows with run age (raftdraft: 2.5% pre-day-90
  vs 14.0% day-90+), so a short horizon would understate late
  presence; death-aware so dead villages stop simulating.
- SENSE: one transcript read — do raid drafts read sensibly
  (does a wave-3+ raider arriving at the palisade feel like an
  escalation, or pass unremarked)? One quoted line.
- Canon read first: docs/CANON.md, docs/MONSTER-WAVES.md (wave
  law: wave 3 = day 25+ and wave-2 ledger; wave 4 = standing >=
  100; wave 5 = standing >= 200 and wave-4 faced; readiness
  gates hold waves 4-5 until armored/armed/tricks/veterans bars
  are met). No haven/raid canon doc exists (raftdraft-a note,
  carried) — the design lives in src/js/havenGrowth.js comments.

## RESULTS (written after the sweep; the pre-registration above was written before it)

## VERDICT: DIAG-GO

- (a) Census complete 8/8 armed seeds, zero recorder errors
  (diag errs 0 on all 8 rows; no overflow). Analyzer gate
  PASS (scripts/test-poolpres-diag.js --summary exits 0).
- (b) All four pre-registered numbers are below with
  denominators; the two implied-presence methods agree within
  0.74pp (bar: 2pp).
- (c) Next lever named with numbers + pre-registration sketch
  (see "The lever" below). No game code changed in this run.

## THE CENSUS (armed rows, 8 seeds, current master)

- Raids: 85. Raiders drafted: 361 (mean raidN 4.27).
  Per-seed raids/raiders: 73671 16/74, 73672 7/28, 73673 7/30,
  73674 14/65, 73675 13/56, 73676 7/28, 73677 12/45, 73678 9/35.
- RaidN distribution: 3: 13 raids, 4: 36, 5: 36.
  Mean raidN 4.27, median raidN 4.
- Raid-time pool size (living monsters): median 17, mean
  17.6, min 4, max 31. (Above the maintainWorldMonsters cap
  again, as in raftdraft-a — the spawn-source audit blank
  stands, untouched here.)
- Pantry-tier mix is consistent with raftdraft-a's reading
  (raidN follows pantry bands); not re-tabulated here because
  it is not this diag's question — the recorder rows carry
  pantry per raid for any re-check.

## POOL WAVE COMPOSITION — the headline, CONFIRMED

Pool composition, pooled across all 85 raids (sum of per-raid
living pools, n = 1,494):

| wave | pool n | pool share | drafted share |
|---|---|---|---|
| 1 | 1,025 | 68.6% | 65.9% (238/361) |
| 2 | 362 | 24.2% | 24.7% (89/361) |
| 3 | 102 | 6.8% | 9.1% (33/361) |
| 4 | 5 | 0.3% | 0.3% (1/361) |
| 5 | 0 | 0% | 0% |
| wave-3+ total | 107 | 7.16% (SE 0.67pp) | 9.4% (34/361) |

CONFIRMATION of raftdraft-a: pool wave-3+ share 7.16% here vs
7.2% there — a 0.04pp difference, inside the standard error,
on a band whose per-seed trajectories moved substantially
(see control delta below). The pool answer is robust to the
two intervening game-code fixes: the woods still hold ~7%
wave-3+ monsters at raid time. Drafted wave-3+ share 9.4%
vs pool 7.16% — drafting still takes wave-3+ slightly ABOVE
its pool rate (nearest-first mildly favors them, as
raftdraft-a found: drafted mean distance 2.14 tiles vs pool
mean 4.31; wave-3+ mean 3.32 vs wave-1/2 mean 4.38).
Farthest-N control again agrees: farthest raidN monsters are
275 wave-1 / 74 wave-2 / 12 wave-3 (wave-3+ 3.3%),
below the drafted 9.4%.

Presence, not selection, again: 47 of 85 raids (55.3%) had
ZERO wave-3+ monster in the pool. On the 38 raids where
wave-3+ WAS present, 26 (68.4%) drafted at least one.
Wave-3+ pool members: 107 present, 34 drafted (31.8%) —
above the overall draft rate (361/1,494 = 24.2%).
Wave-3+ drafted types: redactor 8, spool 6, callback 5,
terms_of_service 4, focus_group 3, ad_break 3, buffering 2,
chorus_line 2; wave-4: suburb 1. Wave 5 drafted: 0, and
wave 5 present in pools: 0 — not one wave-5 monster stood
in any raid-time pool in the whole census.

## IMPLIED PRESENCE UNDER THE ACTUAL DRAFT-SIZE DISTRIBUTION

Target: 1 wave-3+ raider per raid on average.

- Method A (mean-raidN): p = 1 / E[raidN] = 1 / 4.27 = 23.42%.
- Method B (distribution-weighted): p = E[1/raidN] over raids
  = 24.16%. Per-raidN requirements: raidN 3 → 33.3% (13 raids,
  pool share there 8.1%, 0.38 w3+/raid); raidN 4 → 25.0%
  (36 raids, pool share 6.4%, 0.42 w3+/raid); raidN 5 → 20.0%
  (36 raids, pool share 7.5%, 0.39 w3+/raid).
- Agreement: 0.74pp — inside the pre-registered 2pp bar.
  The two methods answer slightly different questions (A: p
  such that the MEAN raid drafts 1 w3+; B: the average of
  each raid's own requirement), and they nearly coincide
  because the raidN mix is concentrated at 4–5. The
  raftdraft-a single-mean estimate (~23%) is REVISED only
  trivally: 23.4–24.2% under the real distribution. The
  "≈23%" headline stands.
- Observed: 0.400 wave-3+ raiders per raid at 7.16% presence
  — 40% of the way to the target, at 30% of the required
  presence. (The ratio is not exactly proportional because
  nearest-first drafting favors wave-3+.)
- Hypergeometric check (random drafting at candidate p,
  each raid's observed pool size and raidN): at the measured
  p = 7.16%, the predicted share of raids drafting >=1 w3+
  is 29.1% vs observed 30.6% — the random-draft model
  predicts the observed hit rate to within 1.5pp, confirming
  that pool share, not draft-rule subtleties, governs the
  hit rate. At the implied p = 23.4%, the model predicts
  only 73.7% of raids would draft >=1 w3+ — a presence of
  ~23% buys one wave-3+ raider PER RAID ON AVERAGE, not one
  in every raid. Any future arm that wants "a big monster
  at nearly every palisade" must pre-register a higher bar
  (or a different estimand) than 23%; the 23% bar is the
  mean-count bar, stated exactly so the next run does not
  over-claim it.

## POOL COMPOSITION OVER TIME — presence grows, never enough

| raid-day bucket | raids | pool n | pool w3+ share | w3+ per raid | raids with w3+ in pool |
|---|---|---|---|---|---|
| <60 | 32 | 444 | 0.45% (2) | 0.03 | 1/32 |
| 60–89 | 20 | 374 | 3.2% (12) | 0.15 | 8/20 |
| 90–119 | 17 | 314 | 10.2% (32) | 0.88 | 13/17 |
| 120+ | 16 | 362 | 16.9% (61) | 0.94 | 16/16 |

Late runs (120+) come closest and still sit ~6–7pp short of
the 23–24% bar, at 0.94 w3+ per raid. Before day 60 the pool
is essentially wave-3-free (0.45%): early palisades can
only ever draft small animals, whatever the draft rule.
Per-seed pool shares: 73671 9.6%, 73672 7.1%, 73673 3.8%,
73674 5.7%, 73675 2.7%, 73676 0% (village lost d70, before
wave-3 presence builds), 73677 9.6%, 73678 11.1%. No seed
reaches the bar on its own band average.

## CONTROL DELTA (reported, not gated — substrate moved)

| headline | raftdraft-a (pre-fix master) | this run (current master) |
|---|---|---|
| raids / raiders | 90 / 392 | 85 / 361 |
| pool w3+ share | 7.2% | 7.16% |
| w3+ drafted share | 8.2% | 9.4% |
| won | 4/8 | 4/8 |
| median survival | 150d | 135d |
| national-ever | 8/8 | 7/8 |
| national-final | 7/8 | 6/8 |
| table invited / entered | 5/8 / 4/8 | 4/8 / 4/8 |
| wave-4 / wave-5 | 5/8 / 0/8 | 6/8 / 0/8 |
| starvation total | 3 | 5 |
| death total | 261 | 234 |

Per-seed, trajectories moved a lot under the two fixes
(73671: lost d93 → survived 180d; 73675: survived 180d →
won lesser d135; 73676: lost d174 → village-lost d70 with 4
starvation deaths; 73677: won lesser d98 → village-lost
d143; 73678: won lesser d150 → won lesser d116), while
the band headlines barely moved (wins still 4/8, all
lesser-seat; wave-5 still 0/8; full seat still 0/8) and the
pool share reproduced to 0.04pp. Two readings, both stated:
(1) the pool finding is NOT an artifact of one trajectory
set — it survives a band-wide trajectory reshuffle; (2)
per-seed trajectory churn on this band is large, so
single-seed stories (like 73676's early loss) must not be
read as lever effects — only band numbers and the pooled
pool share carry weight here. The churn's cause candidate
is the belltoad fix (a chorus-wide shout changes pack-fight
survival, which cascades through villager survival and
standing); the post-flee threshold touches only exact-25%
flees and cannot explain band-wide churn. This attribution
is a candidate, not a proven decomposition — no arm in
this run isolates it, and none is claimed.

## WALL NUMBERS (this run's band, armed rows)

- national-ever 7/8, national-final 6/8, table invited 4/8,
  entered 4/8, wins 4/8 — all lesser seat, all path "feared"
  where recorded (73672 d97, 73673 d124, 73675 d135, 73678
  d116). Full seat 0/8.
- wave reach: wave-3 8/8, wave-4 6/8, wave-5 0/8.
- median survival 135d (gameDays median also 135d); max
  180d. Deaths 234 total, starvation 5.
- The scale wall above national/table is untouched by a
  diag, as it should be: this run changed no game code.
  Wins still come only through courtship + seat instruments
  on the lesser seat; wave 5 is still 0 everywhere, and now
  additionally: wave-5 pool presence at raid time is 0/1,494.

## SENSE-TESTING READ (transcript, not just counts)

Sense replay: seed 73672, truncated to day 51 (narration
ring holds only the last 240 lines). File:
evidence/2026-10-25/sim-poolpres-a-sense.txt. Stated
plainly: the narration replay's trajectory DIVERGES from
the census trajectory (its raids: 4, first day 9; the census
seed-73672 raids: 7, with the wave-3 raid on day 50) —
narration shifts trajectories, as raftdraft-a warned, so
the replay's Focus Group fight on day 51 is NOT the census
day-50 raid, and is not presented as it. What the replay
does show, honestly, is how a wave-3 monster reads when
it arrives in play: through its signature mechanic, with
no raid-arrival escalation beat at all. Quoted verbatim:

> [d51] 📊 THE MURMUR DELIBERATES — you can HEAR it: they
> LOVE your WAIT, they HATE your STRIKE. (Loved: the System
> buffs it — but the mouths ANSWER it. Hated: safe, but
> suppressed.)

Judgment: a wave-3+ raider at the palisade passes
UNREMARKED as a raid event. Nothing in the transcript
marks "a bigger thing has come to the wall" — the
escalation, when it lands, is the monster's own fight
mechanics (the murmur rating your actions, mouth-heads
popping), which read identically whether you meet the
Focus Group at the palisade or in the field. If the design
wants a palisade raid by a wave-3+ monster to FEEL like an
escalation, that beat does not exist yet — it is a
narration blank, not a numbers blank. (Carried as a
backlog item below, not chased here.)

## VILLAGE ASSESSMENT (plain words)

The villages on this band are the same kind of villages as
last run — most reach the region, a few sit at the lesser
seat, nobody reaches the full seat or wave 5 — but their
individual stories shuffled under the two fixes while the
band stayed put. What this run adds is a second, firmer
measurement of why the palisade never delivers a big
monster to the door: the big monsters are not out there
when the raid comes, on two separate counts. Wave-3
monsters are at 7% of the pool against the ~24% needed for
one per raid, and wave-5 monsters are at literally zero —
not one stood in any raid-time pool. Early in a run the
pool is almost entirely small animals (under 1% wave-3
before day 60), and even in the oldest runs it only climbs
to about 17%. A raid can only draft what the woods hold,
and the woods hold small animals until late, and never
hold the Producers at all.

## THE LEVER (named with numbers — a candidate, not a tested change)

POOL PRESENCE, confirmed as the binding constraint for the
second time on independent trajectories. The next arm must
move a measured pool share, not a draft rule.

NEXT LEVER + PRE-REGISTRATION SKETCH (for the NEXT run,
not implemented here):
- Lever: wave-3+ weight in maintenance spawns once wave 3
  is unlocked (the spawn-weight mechanism — e.g. raising
  the wave-3+ share of maintainWorldMonsters top-ups — is
  the candidate mechanism; the arm pre-registers the exact
  weight change it tests, it does not invent it here).
- Substrate: tableseat-nowait, seeds 73671–73678, 180d
  death-aware, raftdraft-diag recorder (this run's
  instrument, reused verbatim).
- PRIMARY METRIC: band pool wave-3+ share (same pooled
  per-raid denominator as here).
- GO BAR: pool wave-3+ share >= 23% (the mean-raidN bar
  23.42%, rounded down, so the arm must clear the bar, not
  touch it) AND wave-3+ per raid >= 0.9, on the pilot band
  of 8 seeds. Secondary (reported, not gated): raids with
  >=1 wave-3+ raider, wave-5 pool presence (any nonzero
  count is a finding, not a bar — wave-5 presence is a
  separate standing/readiness question, and this lever
  should not be judged on it).
- GUARD: wall numbers must not regress vs this run's band
  (wins >= 3/8, national-ever >= 6/8, death total within
  ±20% of 234) — a presence lever that buys big monsters
  by killing villages is a different, worse lever.
- If the arm's mechanism cannot reach 23% without breaking
  the guard, the honest next step is a second mechanism
  (e.g. wave-3+ lingering nearer Haven, or later raid
  timing), not a lowered bar — the bar is the measurement,
  not the wish.
- Companion blank (narration, separate from the numbers
  lever): a palisade-escalation beat for wave-3+ raiders —
  the raid line should name the escalation when the draft
  contains one, so the player feels it before the fight
  mechanics carry it. Pre-register: a wave-3+ raid line
  distinct from the all-wave-1 line, judged by transcript
  read, not by counts.

## METRIC REVIEW (required, §14)

- No metric was re-scored mid-run. DIAG-GO is judged
  exactly as pre-registered above, including the control
  delta being reported rather than gated (stated BEFORE
  the sweep because the substrate moved).
- Mean-count vs every-raid bar: the 23–24% bar buys one
  wave-3+ raider per raid ON AVERAGE (hypergeometric:
  73.7% of raids get >=1 at 23.4%). The next run must not
  re-describe 23% as "a big monster at every raid" — that
  is a different bar and would need a higher presence.
  Recorded here so the next arm pre-registers the right
  estimand.
- Pool-share pooling choice (carried from raftdraft-a):
  per-raid pool counts are summed across raids, so
  long-lived pools contribute repeatedly. Right for "what
  does a raid draft from"; NOT a distinct-monster census.
- Sense divergence (stated, not hidden): the narration
  replay trajectory differs from the census trajectory, so
  the sense quote is from the replay's own Focus Group
  fight, not from the census raid. The judgment (no
  raid-escalation beat exists) is about the transcript
  surface, which the replay does show — it does not depend
  on the replay matching the census day.
- None of these change the verdict. DIAG-GO stands.

## CONVERGENCE + NEXT BLANKS

scale-onramp stays converging (NOT converged): this run is
a diag, not a lever — it confirms the next lever (pool
presence) on current master but tests none, the full seat
is still unreached, wave 5 is still 0/8, and wins are still
lesser-seat only. The standing directive stands until the
tracker records this axis converged on measured evidence.

Next blanks, in order:
1. Pool-presence lever for wave-3+ at raid time (sketch
   above; GO bar pool share >= 23% + w3+/raid >= 0.9).
2. Wave-5 pool presence is zero (0/1,494): a separate
   question from wave-3 presence — standing/readiness
   gates, not spawn weights, are the candidate cause.
   (NEW — this run's census.)
3. Spawn-source audit for the above-cap raid-time pool
   (median 17 vs maintain cap 8): which spawn paths fill
   the pool past the cap, and do they favor wave-1/2?
   (Carried from raftdraft-a.)
4. Palisade-escalation narration beat for wave-3+ raids
   (NEW — this run's sense read).
5. Defender-fight wound manufacture (carried).
6. Field-kill narration/gossip beat (carried).

## INFRASTRUCTURE + CORPUS

- No EPERM flap blocked this run; all 8 rows wrote first
  try. Safe-commit index clobber DID hit this run's commit
  (bogus staged deletions in the main index after an
  otherwise-correct commit; a first repair pass used a
  non-recursive ls-tree and briefly mangled index paths —
  both repaired via ls-tree -r + per-file cacheinfo; the
  commit itself was verified correct with git show --stat,
  and the worktree was verified clean with git status
  --short empty and git diff HEAD empty before handoff).
- No sibling tree, branch, claim file, tracker, or lock
  touched. Telemetry-check NOT run, per the standing
  instruction in the 1332Z coordinator evidence (recorder
  rows are not panels).
- Corpus (committed with this run): per-seed rows +
  summary.json in evidence/2026-10-25/perseed-poolpres-a/
  (~660 KB total); sense transcript
  evidence/2026-10-25/sim-poolpres-a-sense.txt; this file.
  Analyzer: scripts/test-poolpres-diag.js (read-only over
  the corpus; --summary / --check modes only — it never
  runs a sweep and never writes outside EVID).
- Recorder + sweep reused unchanged:
  scripts/policies/raftdraft-diag.js,
  scripts/test-raftdraft-diag-sweep.js (--one armed mode).
  This run's new code is the analyzer only; zero src/js
  changes, so no check.js suite is attributable to this
  run — the raftdraft-a targeted suites (fieldfight 2
  passed; raid 6 passed / 1 known pre-existing failure in
  test-util-raid-crisis-20261010.js, aidCrisis not a
  function) are carried, not re-proven from scratch, and
  no claim about them is made here beyond that carry.

