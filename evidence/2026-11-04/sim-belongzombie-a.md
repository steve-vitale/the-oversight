# BELONG-zombie census — Loop B, arm sim-belongzombie-a

Axis: scale-onramp / winnability chain (the recovery leg of the
polityfrag diagnosis). This arm ran STEP 1 (census) ONLY. Step 2
(the BELONG-direction clear probe) did NOT run: the census did
not meet its pre-registered bar, so no rule was built, no
hierarchy.js change exists on this branch, and nothing is
reported as ready-to-merge. Gates, win prices, deed numbers,
the 12,000-kcal proposal gate, and all trust numbers are
untouched. The held Haven-primary rule on branch
sim-recovery-zombie-b was NOT touched.

## Pre-registration (committed before any census leg)

Full text: `evidence/2026-11-04/sim-belongzombie-a-prereg.md`
(commit eee498aa9, before any census leg). In short:

- Policy: scripts/policies/leadcourt.js {leadcourt} VERBATIM,
  default env. Same diplo instrument reused verbatim,
  300d death-aware horizon.
- Census band (8 seeds, survival-screened fresh): 99023
  (213d), 99008 (163d), 99006 (135d), 99004 (132d), 99013
  (132d), 99016 (127d), 99009 (121d), 99017 (116d) — the
  top 8 of a 24-seed screen (99001–99024), chosen on
  survival alone; the screen driver recorded NO link data,
  so it cannot have selected on clears. Freshness verified
  before the screen: 0 hits for 99001–99024 in
  evidence/2026-11-04/*.md and in perseed corpus filenames.
- BELONG zombie: primary !== 'haven', subordinate ===
  'haven', trust <= 0 while 'active' on a snapshot BEFORE
  the village's death day (death-day snapshots excluded).
- ADDRESSABLE zombie: postZeroLife >= 35 days AND pantry
  >= 12,000 kcal on >= 1 in-life snapshot in
  (firstZero, firstZero+35].
- CENSUS BAR (binding): GO-TO-STEP-2 iff >= 2 seeds carry
  >= 1 addressable zombie. 0 zombie links =
  SUBSTRATE-MISSING; >= 1 zombie link but < 2 addressable
  seeds = INSUFFICIENT-DATA. Neither is a kill of the
  concept, and no rule is landed in either case.
- Step-2 GO (conditional, same prereg): >= 1 armed seed
  with a BELONG clear + a re-proposal or re-link to the
  cleared village after the clear (direction-agnostic —
  leadcourt never proposes BELONG-intent) + survival
  after clear >= 35d + a post-clear diplomacy recovery
  with snapshot pantry >= 12,000; cost guardrails
  (starvation armed <= control + 2 total and per-seed
  excess, median >= 0.8x control) breach = NO-GO.

## §14b substrate checklist (as pre-registered)

1. Contact PASS: BELONG trust-0 in life occurs under
   leadcourt — stored corpora: 99808 (3 links), 99401
   (1 link). Judged census below adds a third seed.
2. Pool sizing: stored pool 4 zombie links / 2 seeds /
   16 leadcourt seeds; the bar (>= 2 addressable seeds
   on 8 survival-selected seeds) is the same order of
   magnitude, not a 30x-pool bar.
3. Verb existence PASS with a stated partial: breakLink
   + say exist; proposeLink exists; the linkWith
   active-only, direction-agnostic duplicate guard is
   code-verified. PARTIAL: leadcourt never proposes
   BELONG-intent and never pays BELONG tribute, so a
   BELONG link forms only via counter-accept flip, and
   a step-2 re-proposal could only be a LEAD
   re-proposal to the same village or a new
   counter-flip — never a BELONG-intent re-formation
   under this policy.
4. Horizon fit PASS: firstZero historically d85–d103;
   300d death-aware fits a 35d window (death ends runs,
   cap never bound except on survivors).

## Survival screen (pre-pilot probe, days-only)

Fresh seeds 99001–99024, leadcourt verbatim, 300d:
days 18, 24, 34, 36, 41, 45, 48, 49, 62, 67, 72, 82, 83,
90, 96, 106, 116, 121, 127, 132, 132, 135, 163, 213.
Median 86.5, max 213 (99023 — the only >= 200d village
in 24, 1/24). Prior bands for comparison: 994 median
109 / max 146; 998 median 76.5 / max 161. A band of
eight >= 200d leadcourt seeds is not obtainable by
screening within this run's budget (hit rate ~1/24);
the census band is therefore the survival-ranked top
8, median 129.5d — longer-lived than both prior bands
on median and max, containing one true >= 200d seed.
Census legs reproduced the screen days EXACTLY on all
8 seeds (213/163/135/132/132/127/121/116), confirming
the instrument does not perturb trajectories.

## Census legs — per-seed table (0 instrument errors, 8/8)

| seed | days | trajectory | end rank | maxWave | BELONG zombies | addressable |
|------|------|------------|----------|---------|----------------|-------------|
| 99023 | 213 | collapses | regional | 4 | 0 (0 BELONG links formed) | — |
| 99008 | 163 | never | regional | 4 | 2 (village_1, village_2) | YES x2 |
| 99006 | 135 | holds-to-death | global | 4 | 0 | — |
| 99004 | 132 | never | regional | 4 | 0 | — |
| 99013 | 132 | collapses | national | 4 | 0 | — |
| 99016 | 127 | holds-to-death | global | 4 | 0 | — |
| 99009 | 121 | holds-to-death | global | 4 | 0 | — |
| 99017 | 116 | holds-to-death | global | 4 | 0 | — |

Census judge (analyzer, same code as the proof):
zombie links 2, zombie seeds [99008], addressable
seeds [99008], bad seeds 0 → verdict
INSUFFICIENT-DATA (bar: >= 2 addressable seeds).
Judged exactly as pre-registered; no metric moved, no
extra seeds swept, no expansion to 12–16.

## Finding 1 — the pool is real but concentrated in one seed

99008 is the census band's only BELONG seed — and both
of its BELONG links are addressable zombies:

- village_1: formed d32 (counter-accept flip after a
  d31 LEAD proposal returned 'counter'), trust 40 ->
  0 by d59 (27 days of unpaid decay: -6/week, no
  tribute paid, no tends — leadcourt's tend loop
  touches Haven-primary links only; this seed's
  tendLink events run d35–d155 to LEAD links only).
  FirstZero d59, 71 in-life trust-0 snapshots,
  flickering 0 <-> 1–9 through d126, then solid 0 to
  the break at d156 — 97 days from firstZero to
  break, 104 days to the village's death at d163.
  Pantry gate opens inside the window: d71 12,660
  kcal and d85 12,660 kcal (a thin margin — 660 kcal
  over the 12,000 gate).
- village_2: formed d33 (same flip shape), firstZero
  also d59, 62 in-life trust-0 snapshots, break also
  d156, postZeroLife also 104d, same pantry window.
- Both links break d156, seven days BEFORE the
  village dies (d163) — via the succession path, not
  on the death day (unlike 99808/99401, whose breaks
  land on the death day itself). So a weekly-boundary
  clear rule would have had ~97 days of zombie
  window on this seed to act in, not a 1-day window.
- Proposals to either zombie village while active:
  ZERO — but this behavioral record is CONFOUNDED, and
  is reported as such: leadcourt stopped proposing
  entirely after d34 on this seed because it already
  held 3 Haven-primary subordinates (village_0,
  village_3, one splinter), hitting its subs >= 3
  stop. The pair-slot block is therefore CODE-proven
  (linkWith guard + !linkWith candidate filter) but
  NOT behaviorally separated from the subs stop on
  this seed: the policy would not have proposed to
  village_1/village_2 after d34 with or without the
  zombie. A future arm that wants a behavioral
  blocking proof needs a policy that keeps proposing
  past 3 LEAD subs (or a seed where the zombie's
  village is the only unlinked candidate left).

## Finding 2 — formation is the bottleneck, not zombieing

Across all three leadcourt corpora now in hand, the
conditional rate is stark:

- BELONG links formed: 6 total (99401: 1, 99808: 3,
  99008: 2) — all via counter-accept flips, never via
  a direct BELONG proposal (leadcourt proposes LEAD
  only; competent proposes nothing).
- Of those 6, BELONG zombies in life: 6/6. Every
  untended BELONG link reached trust 0 in life.
- Seeds carrying any BELONG link: 3 of 24 leadcourt
  seeds (994 + 998 + 990 census bands pooled for this
  descriptive count only — the judged census verdict
  above uses the 990 band alone).
- The other 7 census seeds formed ZERO BELONG links:
  all their proposals were direct LEAD accepts (plus
  splinters on 99023/99006/99009). No counter, no
  flip, no BELONG link, nothing to zombie.

So the BELONG-zombie question splits in two: (a) the
zombie state itself is near-certain once an untended
BELONG link exists (6/6), with windows of 12–104
days of post-zero life; (b) the addressable pool for
a clear-rule pilot is gated by counter-flip formation
(~1 in 8 leadcourt seeds), not by zombieing. A clear
rule judged on leadcourt bands will almost always
report "pool too small" — the substrate that could
actually test a BELONG clear at scale is a
BELONG-intent proposing policy (belongseek, which
proposes asSubordinate and pays tribute), where
BELONG links form by design rather than by accident.
That is the named next substrate, not a conclusion
about the rule.

## Finding 3 — near-misses (reported, not scored)

- 99004's LEAD link to village_1 ends at trust 5 —
  close to zero but Haven-primary, not BELONG, and
  still active at death: not a zombie by any
  definition here.
- 99023, the 213-day seed, forms zero BELONG links
  and collapses on diplomacy (firstDiplo d114, 97
  diplo days, 0 recoveries) with all three LEAD links
  still active at death (trust 96/45/39): long life
  alone does not produce BELONG zombies.
- 99008's pantry at the break (d156: 308 kcal) vs
  inside the window (12,660 kcal): a clear at the
  first weekly boundary after d59 would have opened
  the table while grain was available; the actual
  break at d156 opened it when the pantry was empty.
  Timing, not just clearing, is the recovery variable.

## Wall numbers (census legs, not wall movement)

Wins 0/8. Villages lost 8/8, survived to horizon 0/8.
End scaleRank: global 4/8 (99006, 99016, 99009,
99017), national 1/8 (99013), regional 3/8 (99023,
99008, 99004), village 0/8. Table: not instrumented
(stated, not faked); no win flag on any seed. Wave-5
unlocks 0/8, wave-5 faced 0/8, wave-4 faced 8/8,
wave-4 unlocks 8/8 (maxWave 4 on all 8, endUnlockedWave
4 on all 8). Readiness-5-ready days 0 on all 8 seeds;
veterans max 1 on four seeds, 0 on four. Median
survival 132 days (sorted 116, 121, 127, 132, 132,
135, 163, 213), max 213. Deaths 571 total: villager
combat 224, combat 144 (combat share 368/571 = 64%),
monster 62, the wild 58, expedition 41, starvation 4,
sickness 3, dehydration 3, the arena 10, a wound that
wouldn't close 7, ambush 3, contest 2, alien 2, named
beasts and oddities 6, a stranger 1, the night 1.
Villages die fighting, not starving, same shape as
0930Z/1030Z — and this band faces wave 4 on every
seed without unlocking wave 5 on any.

## Sense-testing (SENSE-TESTING LAW — transcripts, not counts)

No faded line fires on this band (no rule exists) —
the sense finding is about the zombie's silence:

- 99008's two BELONG bonds decay 40 -> 0 in 27 days
  with no line naming the decay: the captured say
  sample around firstZero (d59) contains no bond,
  tribute, or arrears line for either village. The
  bonds rot silently for three months.
- Their breaks at d156 are equally silent: no line
  names either village's bond breaking. The only bond
  line near the break is d155, about a DIFFERENT
  village (the Hungry Road splinter): "The Hungry
  Road's fire is drifting from ours — their speaker
  doesn't linger at the gate the way they used to,
  and nobody over there says why. Bonds don't mend
  themselves; a tended fire remembers who fed it."
  That line reads as a true, human observation about
  neglect — and it lands on the wrong bond: the two
  bonds that actually break the next day get no such
  line. A player watching 99008 would see two
  relationships die without a word, then the village
  die a week later.
- The one narrated BELONG-adjacent beat is the
  counter itself, which the instrument does not
  capture as a say line (leadbelong-b's Finding 5:
  zero proposal/counter lines captured on 8/8 seeds).
  The flip that creates the zombie is silent, the
  decay is silent, the break is silent. If a clear
  rule lands, its faded line would be the FIRST
  audible beat in this whole arc — which is an
  argument for the line's wording (it must name the
  village and the consequence, as the held rule's
  line does), not for the rule itself.

## Village assessment (plain words)

Picture eight villages that mostly never meet the
question this arm asked. Seven of them ask only as
head, are answered at once, and live or die with
bonds they lead — one of them living 213 days, the
longest village in this whole recovery series, and
still never kneeling to anyone, still never meeting
the fifth wave. The eighth village asks the same way
and gets a different answer twice: kneel instead.
It says yes twice, and then — like the village
before it — simply never sends grain to the bonds
it now owes, because its policy only feeds the bonds
it heads. Both kneeling bonds bleed to nothing in
under a month, then sit at nothing for three months,
flickering, while the village lives on, courts
nothing more, and dies a week after they finally
break. The pantry even holds enough grain, twice,
in the month after the bonds die, to have courted
again — but the table never opens, because the dead
bonds still count as live ones. What is missing is
not a better clear. It is, first, a village that
kneels on purpose and feeds what it owes, so the
question can be asked at scale — and second, a
voice that says when a bond has died, because right
now it dies in silence.

## Metric review (§14 — no in-run re-scoring)

- The census bar was judged exactly as written;
  no metric moved. The verdict is INSUFFICIENT-DATA
  (pool: 2 zombie links, 1 zombie seed, 1 addressable
  seed; bar: >= 2 addressable seeds). Per §14a this
  is NOT a CONCEPT-DEAD kill: the mechanism (a
  BELONG clear freeing a pair slot) was never
  staged, so it cannot have failed on its merits;
  and it is not METRIC-BROKEN either (the bar is
  within an order of magnitude of the observed pool).
  It is a pool verdict: one addressable seed short.
- Proposed revision for the NEXT run (not applied
  here): split the census bar into a formation leg
  and an addressable leg — report "BELONG links
  formed per seed" alongside "addressable seeds",
  because on leadcourt the formation rate (~1/8
  seeds) dominates the addressable rate, and a bar
  on addressable seeds alone hides whether the
  substrate or the rule is the scarce thing. Also:
  a behavioral-blocking bar needs a policy that
  keeps proposing past 3 LEAD subs, or the blocking
  record will always be confounded the way 99008's
  is (subs stop + pair block indistinguishable).
- The 300d horizon was never binding (max 213d);
  death, not the cap, ends these runs — same lesson
  as 0930Z/1030Z, now on a third band.
- Panel note: the census has no before/after change,
  so the balanced panel is inapplicable in substance;
  a compare attempt on identical input returned
  review_required (degenerate, not a verdict, not
  cited as one). The paired per-seed table above
  stands as the comparison discipline for the
  census legs (each leg is its own control-behaviour
  record; step 2 would have supplied the armed leg).

## Verdict — INSUFFICIENT-DATA (pilot census, NOT a kill)

The BELONG-zombie pool on a survival-first leadcourt
band is 2 links on 1 seed, 1 addressable seed short
of the pre-registered bar of 2. Step 2 (the
BELONG-direction clear probe) does NOT run on this
worker's authority — the prereg's conditional is
explicit, and running the rule on a 1-seed pool
would be exactly the outcome-hunting the prereg
forbids. No rule is built, no rule is landed, and
the concept is NOT killed: an untended BELONG link
zombies 6/6 times across all corpora in hand, with
windows up to 104 days of post-zero life. What the
pool verdict blocks is a leadcourt-band pilot, not
the idea. Recommendation to the coordinator: point
the next BELONG arm at (1) a belongseek substrate
(BELONG links formed by design, tended by design —
the formation bottleneck disappears, and the clear
can be judged where BELONG links actually live),
and/or (2) a second survival-screened leadcourt band
whose addressable seeds could pool with 99008's
toward the bar — pooled ONLY if pre-registered as
such before its census legs, never by adding seeds
after seeing this verdict.

## Telemetry deviation check

Attempted: `node scripts/telemetry-check.js --baseline
.../hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-11-04/perseed-belongzombie-a/*.json'
--metrics national,table,wins,exiled`. The tool
REFUSED for field-shape reasons, recorded verbatim:
"telemetry-check: refusing recorder-corpus input: all 8
--current rows carry top-level anchorCommit, so they are
sweep recorder rows, not runs. Recorder corpora are
compared with sweep-compare tables, never against a run
baseline here." No compare was fabricated; the
--allow-recorder-corpus escape was NOT used, for the
same reason as 0930Z/1030Z. The baseline was NOT
rolled. The paired per-seed table above stands as
the comparison.

## Balanced panel (§15)

Attempted as a supplement (compare mode on identical
input, since the census has no armed leg): decision
review_required, degenerate — NOT a panel verdict
and not cited as one. The census comparison is the
per-seed table above; step 2 would have supplied
the armed leg for a real panel.

## Findings for the backlog (reported, NOT chased)

1. BELONG formation bottleneck: under leadcourt,
   BELONG links form only via counter-flip (~1/8
   seeds); a BELONG-clear pilot needs a belongseek
   substrate or a pooled pre-registered band.
2. Silent BELONG arc: flip, decay, and break of
   BELONG links are all unnarrated in the captured
   sample (leadbelong-b Finding 5 + this census's
   d156 silent breaks); the held rule's faded line
   would be the first audible beat — narration gap
   for a future pass, not this lever.
3. Behavioral blocking confound: on any seed where
   leadcourt already holds 3 LEAD subs, pair-slot
   blocking cannot be separated from the subs stop;
   a blocking proof needs a still-proposing policy.
4. 99008's pantry-gate margin (12,660 vs 12,000) is
   thin: a re-proposal window that opens by 660 kcal
   is a fragile recovery leg — a future GO should
   record the margin, not just the binary gate.

## Proof and landing

- Proof: `scripts/test-belongzombie-20261104.js` —
  17/17 PASS (zombie detection incl. flicker and
  death-day exclusion, Haven-primary/peer exclusion,
  addressable gate, census judge, faded-clear
  detection, step-2 GO judge, cost bar, blocking
  record). Re-run after the census legs: still 17/17
  (analyzer untouched since prereg).
- Arm commits on branch sim-belongzombie-a
  (coordinator merges; committed on branch, pending
  coordinator merge — no push, no bump, no live
  verification by this worker):
  - eee498aa9 sim-belongzombie-a prereg (before any
    census leg) + instruments + proof 17/17
  - (this landing) census corpus + evidence
- Files: prereg + evidence in `evidence/2026-11-04/
  sim-belongzombie-a*.md`; per-seed JSON in
  `evidence/2026-11-04/perseed-belongzombie-a/` (8
  files: census legs, RUN=belongzombie-census);
  scripts `test-belongzombie-driver-20261104.js`,
  `test-belongzombie-analyze-20261104.js`,
  `test-belongzombie-20261104.js` (reusing
  `diplo-instrument-20261104.js` verbatim — not
  modified, not claimed as this arm's file).
- Index-clobber note: safe-commit.sh left bogus staged
  deletions in the worktree index after the prereg
  commit; repaired via HEAD-blob `update-index
  --cacheinfo` and verified `git status` empty +
  `git diff HEAD` empty. The commit itself was correct.
- Worktree state at handoff: only committed work
  after this landing commit (verified before reporting).
- Heartbeats: worktree heartbeated during the run
  (registry `sim-belongzombie-a` alive through the run).
