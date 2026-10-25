# sim-scale-onramp-round-0644 — coordinator evidence (axis scale-onramp — 2 DIAG arms LANDED, merged locally pending ship)

Run: fleshout-20261025T0644Z (Sun 2026-10-25 ~01:44–03:05 CDT). Axis: scale-onramp
(converging). Loop B live on food-economy at run start (claim
fleshout-loop-b-20261025T0630Z, arms sim-awayration-fix-b +
sim-c1scope-b, worktree heartbeat 06:40Z — fresh) — NOT touched. B's
round closed during this run (coordinator evidence f1ec628ee on
master: c1scope landed, awayration-fix killed at pilot); its claim
was deleted by its own closeout, and no B tree, branch, or file was
touched at any point. This run worked the topmost non-converged
axis not named in any live claim: scale-onramp. No sibling claim,
tree, branch, or file was touched; sibling landings below are
master-tip moves only.

## PRE-REGISTRATION (coordinator level, binding)

- Substrate (both arms, shared): tableseat-nowait — leanlinkrescue
  courtship (LEANLINKRESCUE=1) + seat legs only (TABLESEATNOWAIT=1),
  no wait leg. Seeds 73671–73678, 180d death-aware — the SAME band
  as standing99 / vetkill / vetshape / encounter-a / arenadeath /
  wave2enc / fieldfinish / 0337Z / 0535Z, reuse intentional: these
  are re-measurements of those seeds with new instruments, not fresh
  bands.
- The 0535Z run killed all three toll remedies at pilot and left
  named next blanks in order: (1) survivability companion for any
  finish lever, own pre-registration, never bundled; (2) field-kill
  narration/gossip beat; (3) raid draft composition diag; (4)
  defender-fight wound manufacture; (5) metric revisions for the
  NEXT run (median win-shortening, wave-4 reach vs wins, toll-step
  recording). This run does NOT repeat a finish remedy. It measures
  the two inputs a companion design needs before another game-code
  arm is burned: what brings wave-3+ monsters to the palisade at
  all (blank 3), and where villagers actually die (blank 1's
  measurement input, plus blank 4's wound-manufacture count).
  Both arms are DIAG ONLY (policy recorders, zero src/js), each
  with its own pre-registered DIAG-GO bar, judged in its own
  evidence file and summarized below — never re-scored here.
- Balanced panel (§15): attempted in the 0535Z sense and established
  there as the known error class (balance-panel.js compare requires
  panel pairs; per-seed recorder corpora are not panel pairs). Both
  arms state this in their evidence and use the G2 neutrality proof
  (baseline vs recorder-armed on identical seeds, trajectories
  identical) as the §15-style comparison. No panel file is attached
  because no lever panel exists to compare in a DIAG run.
- Pilot only: 8 seeds per arm. No confirm spend in this run.
  Back-to-back second round NOT taken: both arms landed, and the
  next step (companion design) needs its own pre-registration, not
  a rushed second round on this run's clock.

## Arm 1 — sim-raftdraft-a (RAID DRAFT COMPOSITION, DIAG ONLY) — LANDED

Worker commit fca42f557 (rebased onto master 2c38f1e69 inside its
worktree, det-gate + summary re-run green post-rebase, merged
--ff-only; proof re-verified on master by the coordinator).
Change: none to game code. New policy recorder
scripts/policies/raftdraft-diag.js (RAFTDRAFT=1) composed on
tableseat-nowait, plus proof scripts/test-raftdraft-diag-sweep.js.
Evidence: evidence/2026-10-25/sim-raftdraft-a.md, sense transcript
sim-raftdraft-a-sense-d9.txt, corpus
evidence/2026-10-25/perseed-raftdraft-a/ (16 rows + summary.json).

- Own control replicates the historic baseline exactly (won 4/8,
  median 150d, national-ever 8/8, final 7/8, table 5/8, entered 4/8,
  wave-4 5/8, wave-5 0/8, starvation 3, deaths 261, all wins lesser
  seat). Zero mismatch.
- DIAG-GO, all legs: census complete 8/8 seeds, zero recorder
  errors; det-gate PASS (73671 recorder-unset == baseline: days
  93/93, ts identical, no diag surface, no wraps); detail-repro
  PASS; G2 neutrality PASS (8/8 identical trajectories).
- Numbers: 90 raids, 392 drafted raiders. Raider waves: wave-1 269
  (68.6%), wave-2 91 (23.2%), wave-3 24 (6.1%), wave-4+ 8 (2.0%);
  wave-1/2 = 91.8%; wave-5 drafted 0. Exactly-1-HP post-toll 216/392
  (55.1%): 97 toll-created, 119 pre-existing 1s (palisade raids
  only). The 216 total and 90-raid count match the 0535Z
  defendfinish corrected counts exactly; the 97 vs 96 attributable
  toll-1s is a 1-row instrument delta, reported not hidden.
- Pool-vs-draft answer: POOL COMPOSITION explains the dominance,
  NOT nearest-draft selection. Pooled raid-time pools (n=1,423):
  wave-1 69.2%, wave-2 23.5%, wave-3 5.3%, wave-4 1.9%, wave-5
  0.07% — the drafted mix matches the pool mix within a point on
  every wave (random drafting would give 28.4 wave-3+ raiders;
  actual 32). The farthest-N control gives only 4.6% wave-3+ vs
  8.2% drafted, so nearest-first mildly FAVORS wave-3+ (mean
  distance 3.32 vs pool 4.26). The binding constraint is presence:
  62 of 90 raids had ZERO wave-3+ monster in the pool; on the 28
  raids where one was present, 24 drafted at least one. Late raids
  (day 90+) already show it: pool wave-3+ share 14.0% vs 2.5%
  early. The single wave-5 pool case in the whole census (73676
  day 170 nielsen, distance 2, rank 5, raidN 3) was NOT drafted —
  the one case where the raidN cut, not the pool, bit.
- Field linkage: 71.5% of wounded raiders later met in a field
  fight at exactly their raid HP (type + HP continuity; entities
  carry no stable instance id — limit stated in the arm evidence).
- Named lever (candidate, NOT tested): POOL PRESENCE. At mean
  raidN 4.36 with pool-proportional drafting, averaging 1 wave-3+
  raider per raid needs pool wave-3+ share ≈23%, vs measured 7.2%
  (14.0% late) — roughly a 3× increase, via heavier wave-3+
  maintenance-spawn weight once unlocked, wave-3+ wandering or
  lingering nearer Haven, or later raids. A draft-order lever is
  NOT supported: even drafting every wave-3+ pool member first
  leaves the 62 empty raids empty.
- Sense read: day-8 raid quoted verbatim in the arm evidence —
  defenders named, 3 hurt, an anaconda comes for the player; reads
  as coherent village life, not a number.
- Checks: check.js --only fieldfight 2 passed, 0 failed;
  check.js --only raid 6 passed, 1 failed —
  test-util-raid-crisis-20261010.js (aidCrisis not a function),
  the known pre-existing failure from 0535Z; zero src/js changed
  here, so it cannot be this arm's.

## Arm 2 — sim-deathcensus-a (VILLAGER DEATH-CONTEXT CENSUS, DIAG ONLY) — LANDED

Worker commit feb640da9 (rebased twice inside its worktree: first
onto master 2c38f1e69, then onto fca42f557 after the raftdraft
merge, det-gate re-run green after each rebase, merged --ff-only;
proof re-verified on master by the coordinator). Change: none to
game code. New policy recorder scripts/policies/deathcensus-diag.js
(DEATHCENSUS=1) composed on tableseat-nowait, plus proof
scripts/test-deathcensus-diag-sweep.js. Evidence:
evidence/2026-10-25/sim-deathcensus-a.md, sense transcript
sim-deathcensus-a-sense.txt, corpus
evidence/2026-10-25/perseed-deathcensus-a/ (16 rows + summary.json).

- Own control replicates the historic baseline exactly (won 4/8,
  median 150d, wins-excluded median 180d, national-ever 8/8,
  final 7/8, table 5/entered 4, wave-4 5/8, wave-5 0/8, death teles
  261). Zero mismatch.
- DIAG-GO, all legs: census complete 8/8 seeds, recorder errors 0,
  unknown-context deaths 0 of 15 combat deaths (share 0.000 <
  0.10); det-gate PASS; G2 neutrality PASS (8/8 identical on
  days/gameDays/ts/starvation/faced/kill-log/death-list); G3 corpus
  PASS (16/16); detail + transcript repro PASS (censusMatch=true).
  check.js --only fieldfight 2 passed, 0 failed.
- THE CORRECTION (read first — it changes how past cost bars read):
  the harness death list mixes THREE populations, because
  registerDeath fires one tele per death. The band's 261 death
  teles decompose as 192 monster deaths + 42 scholar deaths + 27
  villager deaths (kind person/villager, non-scholar). The arm's
  first census was wrong (219 "villager deaths") and was caught and
  corrected before judging. Consequence for 0535Z (NOT a re-score
  — its verdicts stand on its pre-registered bars): its cost leg
  "deaths 261 → 390" was measured on the same mixed total, so the
  +129 in breakexcept was mostly NOT villagers dying — its
  composition is unknown, because those arms' corpora are deleted.
  Any future cost bar that says "villager deaths" MUST filter by
  kind, or it will keep pricing monster kills as village blood.
- Census (27 villager deaths): field 12 (44%), other 12 (44%),
  defender raid fight 1, arena 1, tb fight 1, unknown 0. Combat
  15/27 (56%). "Other" is five channels (ambush 3, sickness 3,
  starvation 3, wounds 2, alien 1), so the single largest
  villager-death SOURCE is FIELD fights (12), ahead of every
  single other channel (next: 3). Field wave-3+: 87 fights, vKill
  0, vDie 6 — exact 0535Z control replication.
- Defender-fight wound manufacture, counted (blank 4's number):
  297 defender fights ended mFlee with a below-line survivor, out
  of 342 raid fights (mFlee 299, vFlee 22, vKill 20, vDie 1). Raid
  defense is the one fight type villagers already win (342 fights,
  1 death, 20 kills) — and it manufactures the stuck population at
  industrial scale. Whether that population is the price of the
  palisade working as designed, or needs its own finish/retreat
  rule, is still undecided (backlog #990 stays open — measured,
  not resolved).
- The 15 combat deaths, in three groups: (a) THE NEARLY DEAD,
  JUMPED — 6 of 9 one-round deaths entered at 6–11% HP and died in
  round 1, mostly dealing 0 damage (no in-fight companion saves
  them; they needed to not be in the fight — evade, flee, or be
  kept home while nearly dead); (b) THE ONE-SHOTS — 3 one-round
  deaths at ≥50% HP to wave-4 damage of 69–103 in a single round
  (eater 103, suburb 87, suburb 69 — need in-fight HP/armor, not a
  gate); (c) the rest — even fights lost over rounds, including
  the plausibly survivable 4-round Priya vs understudy (51 dealt /
  50 taken).
- Named companion target: FIELD fights, covering both mechanisms
  above, and it must NOT break raid defense (342 fights, 1 death,
  20 kills) or the break line's flee protection (the 0535Z
  blood-for-stalemate lesson). A companion that only adds
  in-fight toughness misses group (a); a companion that only
  gates nearly-dead villagers misses group (b). The next companion
  arm needs its own pre-registration covering both, measured
  separately, never bundled with a finish lever.
- Sense read: narration replays diverged on 4/4 seeds, so no
  narration replay can quote a census death (stated, not hidden);
  the transcript taps the census rows themselves: "The Understudy
  killed Priya in 4 rounds" (even fight, plausibly survivable)
  vs "The Ad Break killed Ethan in 1 round" (entered at 9% HP — a
  number, not a fight; the failure happened before the fight
  started).
- Open questions left for future diags (not chased): why the
  belltoad pair dealt 0 damage over 2–3 rounds; whether
  wound-aftermath deaths (2/band) are a companion channel.

## Cross-arm verdict

Two decompositions, one conclusion: the scale wall's next work is
measured, not guessed, and neither answer points at the draft order
or at raid defense.

1. Raids do not draft wave-1/2 monsters because the draft is
   biased — they draft them because the world near Haven mostly
   IS wave-1/2. Fixing draft order cannot move the wave-3 gate;
   only pool presence can (and only ~3× of it).
2. Villagers do not mostly die defending the palisade — they die
   in field fights, and they die in two different ways that need
   two different protections. The old cost bars understated this
   twice over: they counted monster deaths as village blood, and
   they never separated the nearly-dead from the one-shot.
3. Defender fights are simultaneously the village's best fight
   (1 death in 342) and its biggest stuck-monster factory (297
   below-line survivors). Any finish/retreat rule aimed at the
   defender-fight population must be weighed against a defense
   record that is currently excellent — a rule that "fixes" the
   wound population by weakening defense trades the village's one
   working fight for the stuck-state cleanup.

## Village assessment (plain words)

The villages on this band look the same as they have for a week:
they reach the region, they get invited to the table, and a few
sit down and win the lesser seat — but nobody climbs to the full
seat, nobody reaches wave 5, and nobody kills a wave-4 monster.
What changed this run is the explanation for two things the
village could not see. First, the bigger monsters almost never
come to the palisade because they almost never live near Haven —
on most raid nights there is not a single wave-3 monster in the
whole neighborhood to draft. Second, when villagers die, they
mostly do not die heroically at the wall. They die out in the
field, and half the time they were already nearly dead when the
fight found them — the fight was just where the dying finished.
The other deaths are the opposite: healthy villagers flattened in
a single blow by wave-4 monsters. A companion that only makes
villagers tougher will not save the nearly dead, and a companion
that only keeps the nearly dead home will not save the healthy
from the one-shot. Both protections are the next design, and both
need measuring on their own before anyone bolts them onto a
finish lever.

## Wall numbers (this run's judged corpora, 32 configs: 2 arms x 16)

- Controls (both replicate exactly): national ever 8/8, final 7/8,
  table invited 5/8, entered 4/8, wins 4/8 (lesser seat only),
  wave-4 5/8, wave-5 0/8, median survival 150d, wins-excluded
  median 180d.
- Armed pooled (recorders are neutral by proof, so armed ==
  control by design): wins 8/16, national-ever 16/16, wave-5 0/16,
  full seat 0/16, field wave-3+ villager kills 0/16 seeds' worth
  of fights (87 fights, 0 kills).
- Raids (raftdraft armed): 90 raids, 392 raiders, wave-3+ 32
  (8.2%), wave-5 0.
- Villager deaths (deathcensus armed): 27 total; field 12, other
  12, raid 1, arena 1, tb 1; defender-fight below-line survivors
  297.

## TELEMETRY DEVIATION CHECK

Run on each arm's per-seed corpus after merging (baseline
scale-wall.json, metrics national,table,wins,exiled): 2 LOUD lines
per corpus, identical both — "national disappeared: baseline 12
-> current 0 (n=17 files)", "wins disappeared: baseline 16 ->
current 0 (n=17 files)". Both are the known path/regime artifact
class (per-seed rows carry nationalEver/won, not top-level
national/wins paths; WINSEAT baseline regime differs from this
pre-seat substrate). Actuals: national ever 8/8, wins 4/8 both
corpora. Baseline NOT rolled. No new investigation.

## Infrastructure

- Master moved 4 times under the run from sibling lanes (journey
  landing r48, B awayration round 0630, journey succession r45 x2)
  — zero file overlap with either arm; raftdraft rebased once,
  deathcensus rebased twice, all clean; the second deathcensus
  rebase was forced by the raftdraft merge itself (sequential
  --ff-only merges), verified by det-gate re-run, worktree clean.
- The coordinator's own --summary re-runs taught a tooling lesson,
  recorded here so the next run does not repeat it: --summary
  rewrites per-seed armed rows (raftdraft: only the `generated`
  timestamp; deathcensus: an added `awayNewsLast: null` field on
  fight rows). Both worktrees were restored to their verified
  commits with `git checkout --` before merging — the committed
  corpora are the workers' corpora, not the coordinator's
  rewrites. Future coordinators: verify with --detgate only, or
  restore after --summary.
- Safe-commit index clobber hit both worker commits — repaired via
  cacheinfo each time, commits verified correct. No EPERM flap
  blocked this run. Worktree registration took ~2 min total.
- check.js --quick NOT re-run on master: nothing but DIAG
  recorders, proofs, and evidence merges; targeted suites are
  reported per arm above (fieldfight 2/2 both arms; raid 6/7 with
  the 1 known pre-existing failure). The standing 280/7 profile
  from 0337Z is unchanged by this run.

## Metric review (required, §14)

- KIND-FILTER (new, binding for the NEXT run): the 0535Z cost leg
  "deaths 261 → 390" and every historic "deaths 261" headline were
  measured on mixed death teles (192 monster + 42 scholar + 27
  villager on this band). Future cost bars that say "villager
  deaths" MUST filter by kind (person/villager, non-scholar) and
  state the filter. This run's verdicts are NOT re-scored under
  any revision; 0535Z's verdicts stand on their pre-registered
  bars, with this correction attached to their reading.
- MEDIAN (decided for the NEXT run, per the 0535Z order): primary
  cost median = WINS-EXCLUDED median (control 180d on this band),
  with the all-runs median (150d) reported alongside. The
  all-runs median punishes winning early (wins end days 90–135);
  the wins-excluded median prices only the villages that died.
- WAVE-4 GUARD (decided for the NEXT run, per the 0535Z order):
  guard = wave-4 reach ≥ control OR wins ≥ control wins (a win
  that skips wave-4 passes the guard on the win leg, reported as
  such — not hidden inside a reach number).
- TOLL-STEP RECORDING (carried from 0535Z): future toll arms must
  record the toll step itself (pre/post per drafted raider), not
  tick diffs. Raftdraft does exactly this (97 toll-created vs 119
  pre-existing 1s); the instrument error class is now closed for
  toll arms.
- No metric was re-scored mid-run. Both DIAG verdicts stand on
  their pre-registered bars.

## Next blanks, in order

1. Survivability companion design, now scoped to FIELD fights in
   two mechanisms — (a) nearly-dead entry protection (behavioral:
   evade/flee/kept-home for villagers entering at ~6–11% HP) and
   (b) wave-4 one-shot protection (in-fight HP/armor) — own
   pre-registration, measured separately, never bundled with a
   finish lever.
2. Pool-presence lever for raid draft (wave-3+ maintenance-spawn
   weight once unlocked, wave-3+ lingering nearer Haven, or later
   raids) — candidate from raftdraft, own pre-registration; draft
   order is NOT a supported lever.
3. Defender-fight wound manufacture (297 below-line survivors):
   is that population the price of the palisade working as
   designed, or does it need its own finish/retreat rule? Measured
   (deathcensus), not resolved — weighs against a 342-fight / 1-
   death defense record.
4. Field-kill narration/gossip beat (carried from 0337Z/0535Z — a
   finish nobody remarks on is a finish the village never learns
   from).
5. Metric revisions above are adopted for the NEXT run's
   pre-registration (kind-filter, wins-excluded median, wave-4-
   or-win guard) — not applied retroactively to any prior verdict.

scale-onramp stays converging (NOT converged): no fix has landed,
wins still come only through default-OFF courtship + seat
instruments on the lesser seat, the full seat is still unreached,
wave 5 is still 0, and no wave-4 kill exists on this band. The
directive stands until the tracker records this axis converged on
measured evidence. food-economy stays converging (untouched;
sibling B loop's round closed during this run with its own
evidence f1ec628ee). Rotation left at 3 (convergence work does not
cycle it).
Claim deleted; lock deleted.
Evidence (this file): coordinator only — arm evidences and corpora
are on master in the arm commits (raftdraft fca42f557, deathcensus
feb640da9).
