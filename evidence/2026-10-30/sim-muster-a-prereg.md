# sim-muster-a — PREREGISTRATION (binding, committed BEFORE any new sims)

Run: flesh-out loop, run fleshout-20261030T1747Z, worker sim-muster-a.
Axis: scale-onramp (blocking axis, converging, NOT converged).
Backlog #1546 (claimed by this run): MUSTER NEVER FORMS ON HERALD
FACES — sim-refusalsay-a (evidence/2026-10-30/sim-refusalsay-a.md,
pilot DIAG-GO + confirm GO) proved 197/197 refused Herald faces
are muster-gate refusals with have=0 / need=10, on every seed,
both bands. This arm answers the mechanism behind the zero.

DIAG ONLY. No game change is planned. No src/js change, no gate
move, no deed-bar move, no default flip, unless a clear-cut bug
with a proof test is found during the work — in that case the
fix stays tiny, is committed separately, and is said loudly in
the evidence file. The instrument is a NEW policy-side recorder
(scripts/policies/muster-diag.js, MUSTER=1) layering on the
untouched refusalsay sweep: it wraps Game.say to snapshot
titan-muster state at each muster-refusal utterance, and wraps
the muster verbs to count attempts. It delegates, records after,
never throws into the engine, draws no RNG, writes nothing to
game state (snapshots live on the policy store, dumped to a
separate per-seed file — never into the fresh row, so the fresh
rows stay substrate-comparable to the refusalsay corpus).
No [needs-eyes]: nothing about feel, combat, or UI changes —
it only records.

Pre-registered metrics bind the run (docs/MEASUREMENT.md §14):
a miss is NO-GO, never re-scored against a friendlier metric
mid-run; metric doubts go under "metric review" in the evidence
file, and the evidence file carries a "metric review" section.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; the Herald
is wave 4) and docs/TABLE.md (the table prices the run; titan
slaying feeds the table's titanFinale line). NO CANON-registered
doc covers the Herald muster mechanism in detail — the
mechanism below is read from code (src/js/titans.js, src/data/
titans.json) and stated exactly so it can be checked, and is
NOT canon. docs/ABILITY-REFUSALS.md covers ability-action
refusals, not titan entry gates, and is not a source here.

## Mechanism, read from code (leads, NOT findings)

Gate (src/js/titans.js, titanWrapCombat, the startCombat
wrapper for a titanDef mid):
- titanEntryGate(titanId) (src/js/finale-campaign.js) returns
  null for every titanId except 'finale', so for herald there
  is NO campaign override and the flat hard gate applies.
- The hard gate checks titanMusterReady('herald'). Failing it,
  the wrapper says the muster text (need = def.minAllies = 10
  from src/data/titans.json herald def; have = raw
  (state.titans.musters.herald || {allies: []}).allies.length
  — RAW allies only, NOT unique-alive-filtered, NOT plus
  Haven blades), records titanRecordOutcome('herald',
  'refused', {gate: 'muster', have, need}), and returns null
  WITHOUT calling core startCombat.

Ready (src/js/titans.js, titanMusterReady): unique alive
allied blades (titanUniqueAllies: deduped by villageId:vid,
alive, health > 0 or undefined, hp > 0 if defined) PLUS
valid Haven blades (titanHavenBlades: muster.haven entries
on the Haven roster, excluding the scholar, deduped) >=
def.minAllies (10 for herald).

Muster formation — the ONLY two writers of
state.titans.musters.<tid>:
1. soundTitanCall(titanId) (titans.js): creates the muster,
   then for each ACTIVE hierarchy link (titanAlliedLinks:
   hierarchyState() filtered status 'active') — refuses the
   link aloud if trust < 25 OR opinion < -10 OR arrears > 0
   (and trust −8 on refusal); otherwise quota = 6 if
   trust >= 70 AND opinion >= 10, else 2 (from
   titans.json _coalition: trustedBlades 6, trustedAt 70,
   trustedOpinion 10, baseBlades 2); takes up to
   quota-minus-already free faces from that village's roster
   (titanAlliedFaces: alive adults age >= 18 or ageless,
   health > 0 or undefined, not already committed anywhere)
   and appends them to muster.allies. Does NOT auto-commit
   any Haven blades (2026-10-13 rule, in the code comment).
2. titanCommitOwn(titanId) (titans.js): appends up to 3
   Haven blades (total cap 3) to muster.haven, two-tap
   (first tap stages pendingCommit + says the cost; second
   tap commits). Requires omen stage >= 2 ("nothing
   located to march against" otherwise) and free volunteers
   (titanVolunteers: roster members, not the scholar, not
   away/traveling/engaged).

Player surface (titans.js, titanSelfActions / titanSelfDo):
the call and commit buttons exist ONLY when the omen stage
is >= 2 (stage < 2 → no actions at all for that titan);
the call button shows when alliedN == 0 OR the muster is
not ready. Both verbs are camp self-bar buttons (app.js);
in headless sims nothing presses buttons unless a policy
does — and no policy does (see below).

Callers audit (leads to verify by grep + counters):
- No src/js caller of soundTitanCall / titanCommitOwn /
  titanSelfDo outside titans.js itself, finale-campaign.js
  (finaleReinforce calls soundTitanCall('finale') only),
  network-campaign.js (wraps soundTitanCall for the
  network), and app.js (UI buttons). No dawn tick, no
  daily hook, no encounter handler auto-sounds a call.
- No policy file calls any titan verb: grep over
  scripts/policies/*.js for soundTitanCall|titanCommitOwn|
  titanSelfDo|titanWarCouncil|titanMuster returns only
  diag recorders (which never call them) — verified for
  the run's policy chain specifically: tableseat-nowait.js
  (0 titan mentions) → leanlinkrescue.js →
  competent.js (0 titan mentions each); leanlink.js (0).
  The sweep's call counters will prove the zero at
  runtime, not just by grep.

## Components of the zero (what each snapshot must carry)

At every muster-refusal utterance, the snapshot records:
- C0 call attempts so far: counters for soundTitanCall,
  titanCommitOwn, titanSelfDo (split call/commit ids),
  titanWarCouncil, each split by titanId (herald vs other).
- C1 muster existence: state.titans.musters.herald present?
- C2 allies raw: muster.allies.length (the exact number the
  gate prints as have).
- C3 allies unique-alive: titanUniqueAllies-equivalent
  count (the number titanMusterReady counts).
- C4 Haven blades valid: titanHavenBlades-equivalent count
  (0–3; NOTE: the gate's printed have EXCLUDES these, so a
  Haven-only muster would still print have=0 — the
  snapshot separates C2 from C4 so that case cannot hide).
- C5 active links: count + per-link {village, trust,
  opinion, arrears, quota, free faces, wouldRefuse,
  wouldYield = min(quota, free faces) if not refusing}.
- C6 hypothetical call yield: sum of C5 wouldYield (the
  blades a call sounded at that instant would have added,
  before Haven commit).
- C7 omen stage: state.titans.omens.herald.stage (null if
  no omen) — stage < 2 means no call/commit button was
  even offered (per titanSelfActions).
- C8 offered flags (derived, not by calling SelfActions,
  which runs titanRepairPlacements): callOffered =
  omenStage >= 2 (at a refusal, ready is false, so the
  call button shows iff stage >= 2); commitOffered =
  omenStage >= 2 AND havenValid < 3.
- C9 ready check: C3 + C4 >= 10, plus Game.titanMusterReady
  ('herald') when available, as a cross-check (any
  disagreement is a finding, reported, not smoothed).

The zero-component question is answered per component: which
of C0–C8 is structurally 0 (or blocking) on the refused
faces, and why — e.g. C0 = 0 because no caller exists;
C1 absent because the muster object is only created by a
call/commit; C5 = 0 because no active links; C6 = 0
because every link refuses or has no free faces; C7 < 2
because the omen never locates; C8 false because the
button was never offered. A component that is merely LOW
is reported as low, not named the structural zero.

## Prior corpora (reused FIRST, no new sims spent on them)

- evidence/2026-10-30/perseed-refusalsay-a/ (pilot band
  75101–75108): 120 dissolved rows, all refusal:muster,
  have=0 need=10, per seed 75101: 0, 75102: 32, 75103: 0,
  75104: 45, 75105: 43, 75106: 0, 75107: 0, 75108: 0.
- evidence/2026-10-30/perseed-refusalsay-a-confirm/
  (confirm band 75117–75128): 77 rows, same 0/10 picture
  (75119: 3, 75120: 74, rest 0).
- Combined prior fact: 197/197 refused faces, have=0.
  The old corpora carry NO muster-state components (no
  links, no omen stage, no call counters) — that absence
  is exactly why this arm spends a pilot band.

## The build (NEW files only)

- scripts/policies/muster-diag.js (new; zero edits to any
  existing recorder, policy, or game file): MUSTER=1 gated;
  install at sweep setup + daily AFTER the refusalsay
  install. Wraps Game.say (snapshot on muster-refusal
  text only, regex /muster (\d+) allied blades \(you have
  (\d+)\)/ plus the 'does not notice you' marker), and
  wraps soundTitanCall / titanCommitOwn / titanSelfDo /
  titanWarCouncil with per-titanId counters (delegating,
  recording return kind for commit: 'confirm' vs muster
  vs null). All wraps idempotent via __musterWrapped
  flags; a missing function is a counted diag error, never
  a crash; snapshot reads never call a mutator (no
  titanState() creation call — state.titans is read
  directly; titanMusterReady is called only in try/catch
  as a cross-check and its result is recorded, never
  trusted over the manual C3+C4 count).
- scripts/sweep-muster-a.js (new): VERBATIM copy of
  scripts/sweep-refusalsay-a.js with exactly these
  deltas: default EVID dir perseed-muster-a; MUSTER=1 set
  in runOne; muster install at setup + daily AFTER the
  refusalsay install; at run end, write
  muster-s<seed>.json (store refusals + call counters +
  end muster/omen/outcomes state) alongside census +
  fresh row (fresh row itself is NOT extended — no new
  field, so substrate comparison to the refusalsay corpus
  is a clean row comparison). Same seeds (pilot band
  75101–75108 via SEEDS env), same 180d death-aware
  horizon, same tableseat-nowait policy, same env set as
  the refusalsay sweep.
- scripts/analyze-muster-a.js (new): joins muster
  snapshots to the refusalsay pilot analysis (seed +
  chronological order + day + have/need), tabulates every
  component C0–C9 across all snapshots, checks the
  reproduced refusal counts per seed against the
  refusalsay pilot counts, recomputes wall numbers from
  the fresh rows, and prints the zero-component verdict
  inputs. Fixtures: scripts/test-muster-a.js.

## Corpus and matching rule (binding)

- Pilot sweep: seeds 75101–75108, 180d death-aware
  horizon, tableseat-nowait policy, env as in the sweep
  delta above. EVID:
  evidence/2026-10-30/perseed-muster-a/ (fresh dir; the
  refusalsay corpora are READ-ONLY and untouched).
- Matching: a reproduced refusal is a muster snapshot in
  chronological order on the same seed. The sweep
  reproduces the refusalsay pilot population iff per-seed
  snapshot counts equal the refusalsay per-seed dissolved
  counts (0/32/0/45/43/0/0/0) AND every snapshot's
  have/need equals 0/10 AND the snapshot days fall on the
  refusalsay refusal days for that seed. Day-level
  equality is checked per seed; any seed whose count
  differs is reported seed-by-seed, never averaged away.
- Confirm band (75117–75128) is spent ONLY if the pilot
  attribution is < 100% or the zero-component is
  ambiguous between two components (stated in the pilot
  verdict, not decided mid-run by feel). If the pilot
  meets every GO leg below at 100%, the pilot verdict
  stands alone and no confirm band is run — the prior
  arm's confirm band already proved the 0/10 picture
  generalizes (77 rows, second band), and this arm's
  question is the mechanism, not the count.

## GO thresholds (binding) — DIAG-GO requires ALL of:

- (a) Muster-count code site(s) cited: the gate's have
  expression AND titanMusterReady AND both muster writers
  AND the SelfActions offer gate, each with file +
  function, quoted or line-referenced by function name
  (line numbers drift; function names are the citation).
- (b) Per-refused-face component breakdown on >= 8 seeds
  covering 100% of refused rows in the pilot band (or
  >= 95% attribution with every remainder individually
  explained): snapshot present for every reproduced
  refusal, each snapshot carrying C0–C9; attribution =
  snapshots matched to refusalsay pilot rows /
  refusalsay pilot rows (120). A snapshot with a missing
  component counts as unattributed for that row.
- (c) The zero-component mechanism named: which input is
  structurally 0 (or blocking) and why — stated as a
  mechanism (caller absence, creation rule, refusal bar,
  quota math, omen gate, or routing absence), not as a
  restatement of have=0. If two inputs are jointly
  structural (e.g. no caller AND no offer), both are
  named, with the ordering (which one blocks first)
  stated.
- (d) A concrete next lever OR a named Steve-call: a
  lever names the file/function it would touch, the
  policy-or-game side it lives on, and what it must NOT
  do under Steve's perception law (no magic roster or
  list-fed muster — if the honest mechanism would need
  a roster, the deliverable is the Steve-call, not a
  build). A Steve-call names the exact question for
  Steve (cf. backlog #1538 refused-face routing).
- Pilot gate: fixtures green + 8/8 seeds valid (days > 0,
  muster errs 0, installed true, census sorted + lastDay
  within 1) + reproduced refusal counts matching the
  refusalsay pilot counts per seed (see matching rule)
  + wall numbers recomputed from the fresh rows and
  checked against the refusalsay pilot wall numbers
  (won 6, nationalEver 6, nationalFinal 6, tableReached 7,
  tableEntered 6, wave 1:8 2:8 3:7 4:5 5:0, median 114d,
  deaths 232) — any divergence reported, never smoothed.
- Sense: at least 2 refusal chains read end to end on the
  pilot band (a same-seed day-cluster of snapshots plus
  the component values: does the zero read as a missing
  call, a missing coalition, a refused coalition, or an
  unlocated omen? does anything read as a melt?).
- No game-code change in the judged run (a clear-cut bug
  fix, if any, is judged separately from the DIAG legs
  and never retroactively changes them).

DIAG-NO-GO on any failed leg above, including a reproduced
count mismatch that cannot be explained seed-by-seed, or
a zero-component claim resting on grep alone without the
runtime counters. A miss is NO-GO, never re-scored
against a friendlier metric mid-run.

## Method (staged, binding order)

1. This prereg, committed BEFORE any new sims.
2. Muster policy + sweep copy + analyzer + fixtures,
   committed before the judged analysis is run (fixture
   bar green first).
3. Pilot: seeds 75101–75108 — fixtures + per-seed
   validity + matching rule + component tabulation —
   before any confirm spend is even considered.
4. Evidence evidence/2026-10-30/sim-muster-a.md with a
   prereg-legs table, the component breakdown in full
   (per-component distributions, not just the zero),
   the mechanism in plain words, the policy-attempt
   verdict (attempted vs never attempted, with counters),
   the perception-law constraint applied to the next
   step, wall numbers (recomputed, pilot vs refusalsay),
   plain-words village assessment, metric review, and
   ranked next.
5. No src/js change (unless the loud clear-cut-bug
   exception above), no push, no bump, no live
   verification, no merge to master by this worker (the
   coordinator merges; sibling loop B may move master
   under this branch — rebase cleanly at the end and
   re-run the proof; rebase conflict = FAIL LOUDLY, no
   force, no merge).

## Node harness

The sweep runs through scripts/sim-harness.js (the shared
kit: seeded Math.random before eval, full src/js list in
index.html order minus DOM-only files, window stubbed
then deleted for sync combat, never stubbing Game.save).
No jest is run by this arm; any jest invocation would use
--cacheDirectory=/tmp/jest-cache-sim-muster-a and never run
concurrently with another jest.
