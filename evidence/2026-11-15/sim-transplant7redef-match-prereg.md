# H1 transplant — REDEFINED family-7 ablation on the MATCHED band (arm sim-transplant7redef-match-a)

Run: fleshout-20261115T1515Z (Loop A), axis scale-onramp (survival collapse).
Arm branch: `sim-transplant7redef-match-a` (worktree `~/workspace/worktrees/sim-transplant7redef-match-a`,
base master `b4343ac9d` — see §Base). Subject branch: `transplant-7redef-subject`
(cut only if the baseline gate passes).
Binding prereg: evidence/2026-11-15/sim-transplant7redef-prereg.md (the 1215Z/1425Z
prereg — ADOPTED UNCHANGED except for the band correction in this file, the
base move, and the step-script fix recorded below) + evidence/2026-11-15/sim-transplant7redef.md
(its evidence: UNMEASURED-substrate, baseline 3/8 on the fresh band, gate STOP)
+ evidence/2026-11-15/sim-scale-onramp-round-1415.md §Coordinator decisions (1)
(the authorizing decision for this rerun: "a 7redef rerun on the MATCHED band
190391–190398 (where the merge reads collapsed 1/8) would put the question back
in the live regime — it needs its own prereg band correction, not a silent band
swap" — this file IS that prereg band correction).
Canon: docs/CANON.md read first; docs/VILLAGER-BRAIN.md §4 (one scoring pass —
"Every dawn decision logs its full consideration breakdown per villager") and
§5 (one arbiter, with commitment — "While a commitment is still valid ...
its candidate's score carries a commitment multiplier ... A villager's choice
does not flip-flop dawn to dawn") read — the family's area. The family is
canon-grounded: it makes the live objective honestly match the dawn
commitment §5 already requires. Nothing here invents canon. (No doc named
OVE-37 exists; OVE-37 is the port branch name for this dawn-brain work, and
the merge message + second parent carry it.)

Written and committed BEFORE cutting the subject or running any judged sim
(proof scripts/test-transplant7redef-match.js, stage 1, green at prereg stage).
The align-test staging runs below (§Family-test leg) were verified during
proof development on the 1215Z baseline tree and re-verified live on THIS
baseline tree by the match proof §7 — they are the proof's stage-1
instrument checks, not judged sims: no subject exists yet, no step leg has
run, no survival number is claimed here.

## What this file supersedes — and what it does not

SUPERSEDED, band only: the 1215Z prereg's band (fresh 190581–190588) is
replaced by the MATCHED band 190391–190398. Everything else in the 1215Z
prereg is adopted unchanged: the ablation set, the gate polarity, the
verdict delta mapping, the sniff design, the family-test leg. Do NOT
re-litigate the ablation-set definition.

CHANGED, base: the arm base moves 1ca2c257d → b4343ac9d (master tip at run
start). The ablation set was RE-VERIFIED at b4343ac9d before any sim (see
§The CURRENT align function): the align function is still
villager-brain.js:892-1006 (115 lines, 4 branches), the single game-code
caller is still finishLottery (villager-objectives.js:682-683), and the 5
removed lines still match verbatim at villager-objectives.js:680-687. The
hunk matches, so the arm proceeds — no improvised ablation set.

CHANGED, tooling: scripts/transplant7redef-step.sh carries the finding-#2381
fix (restore scratch from the step commit instead of deleting tracked
files) — see §Substrate. The step script already took SEEDS from the
environment; the match run passes SEEDS=190391,...,190398 at invocation
(the script's default stays the fresh band).

## The question

Does the brain-side align behavior alone collapse survival? Full family 7
(merge `23245d5d6`, PR #30 dawn honesty, OVE-37 port, OVE-36 Candidate A)
is UNMEASURED: its cherry-pick onto the far end stopped on four unmerged
paths, and its brain-side reverse onto master tip fails on 4 of 5 hunks.
The narrowed objectives-side half (7b) measured NOT-CARRIER. The brain-side
half (the align step itself) is therefore the entire remaining carrier
question for family 7 — and it can now only be measured as a REDEFINED
ablation on master-tip substrate, which HAS the brain module: remove the
align EFFECT from the CURRENT align function, DUTY/ASSIGN branches
included, and measure survival with it gone. This arm measures ONLY the
ablation defined below. Nothing the full-family arm already measured
(nothing — it measured no survival number), nothing else from the merge.

Why the matched band, why now: the 1215Z arm's fresh-band route is CLOSED
(baseline 3/8 ≥ STOP threshold — the collapse regime is gone on
190581–190588). The matched band, where the merge reads collapsed 1/8
(rounds 12–13 read 1–2/8), is the remaining measurement route. The reuse
is DELIBERATE, authorized by the 1415Z coordinator decision quoted above —
a matched comparison in the collapsed regime, not a fresh-band claim.

## Base

- Registered base: master `b4343ac9d` (`b4343ac9da902370ffc44f58423e6e83c9dbfe23`,
  "sim-scale-onramp-round-1415: coordinator evidence"). The arm branch sits
  at this commit with zero unique commits at run start. Master tip at run
  start IS `b4343ac9d` — the arm branch is at the tip, so no rebase is owed
  at adoption. If master moves during the run, rebase onto the current tip
  before finishing and re-run proofs after every rebase.
- Family identity (re-verified by THIS arm at run start, before any sim):
  merge `23245d5d6` (`23245d5d6d91b4b5284e2f503345dcfd1621ff0c`), first
  parent `7041e1bfb`, second parent `a038cf151` ("Align dawn materialize
  with commit after aimed override", 1 commit — `git rev-list --count
  23245d5d6^1..23245d5d6^2` = 1). `23245d5d6` IS an ancestor of master tip
  `b4343ac9d` (verified — the family lives on master today) and is NOT an
  ancestor of the far end `203a32775` (verified — the family is
  origin-side). The merge diff is 6 files, villager-brain.js 56+/3-,
  villager-objectives.js 19+/7-, no scripts/policies file (verified).

## Substrate change since 1215Z — the CASCADE guard (read before judging the gate)

The diff `1ca2c257d..b4343ac9d` touches ONE `src/js` file: `src/js/game.js`,
+16 lines, commit `dc8cbd3f3` (sim-gorgeprice2-b lever base — "lingerer holds
the treeline", recovered guard). It is NOT an ancestor of `b0b171cc8` — the
1215Z baseline ran WITHOUT it; the match baseline runs WITH it. The guard:

```
      // CASCADE (sim-cascade-b, Stage 1 proven): a lingering raider holds
      // the treeline — it is a siege, answered by sortie or endurance
      // (design call #8, Steve 2026-10-16), not a duel. ...
      if (m.lingering) return;
```

in monsterTurn: a lingering raider no longer steps onto the scholar inside
the hall and starts a turn-based fight it always wins solo (the commit
message cites 10 repeat instances, 38/88 scholar deaths in the control
pilot, from this exact path). No other `src/js` file and no
`scripts/policies/` file differs between the 1215Z base and this base
(verified — the rest of the 135-file diff is evidence + scripts).

Consequences, stated up front:

- The match baseline is NOT the same substrate as the 1215Z fresh-band
  baseline, and NOT the same substrate the merge's 1/8 was measured on.
  The "merge reads collapsed 1/8 on the matched band" expectation is a
  PRE-GUARD expectation.
- Direction of effect: the guard removes a scholar-death path, so it
  pushes survival UP on the matched band. A baseline reading ≥3/8 (gate
  STOP) would be consistent with the guard having lifted the floor, not
  with the collapse regime being gone for some other reason — but the gate
  still binds exactly as written: a STOP is a STOP, UNMEASURED-substrate,
  no re-judgment, no re-scoring. The evidence file will discuss the guard
  as the likely mechanism if the gate stops.
- The guard does not touch the dawn path: it lives in monsterTurn (field
  movement/combat), not in vbrainScorePick / vbrainAlignObjective /
  objPick. The pinned align-test cases (§Family-test leg) are dawn
  stagings and are unaffected in principle — the match proof §7 runs
  them live on this baseline tree and confirms they still fire.
- The subject-vs-baseline comparison is still clean: both legs run on
  this base (subject = base + the ablation hunk only), so the guard is
  present on BOTH sides and cancels out of the delta.

## The CURRENT align function (defined from the code, not the merge diff)

`src/js/villager-brain.js:892-1006` (115 lines) at base `b4343ac9d` — RE-VERIFIED
by this arm at run start (identical location and shape to the 1215Z base):
`vbrainAlignObjective(vid, o, hx, hy)`. It runs only when the dawn log
carries an override (`log.override`) and a same-day commit exists
(`c.kind`, `c.day === dayOf`). Four branches, in order:

1. Win-plan holds (`c.winPlanAction` gear_hold / veteran_guard /
   party_wait): `o.kind = c.kind || 'HAVEN_CHORE'`, purpose chore,
   indoor, chore overwritten from the commit (`c.chore` or
   'repair'/'fire'), goal/goalLine from the commit.
2. EXPEDITION (`c.kind === 'EXPEDITION'`): `o.kind = 'EXPEDITION'`,
   purpose chore, indoor hold (so agencyTick can launch without a
   second lottery), chore from the commit if the core objective has
   none, companion/vgoal from the commit.
3. DUTY / ASSIGN (`c.kind === 'DUTY' || 'ASSIGN'`): maps the dutyTask
   onto a real errand — forage/water/hunt/scout/patrol → outdoor
   facing (hash facing via `dawnHashRoll`, no Math.random); cook/
   garden/tend/teach/mend → haven chore; ASSIGN-only gather tasks
   (wood/stone/deadfall/fish) → forage; unknown dutyTask → return
   unchanged. DUTY stamps `o.practiceTask` (OVE-74); ASSIGN clears it.
4. Any-other-override fallthrough: kind/purpose/chore/targetVid/
   companion/vgoal follow the commit; no new draws.

No Math.random anywhere in the function (only `dawnHashRoll`).

## Ablation set definition (adopted from the 1215Z prereg — RE-VERIFIED, not re-defined)

REMOVE THE CALL in `finishLottery` — the single game-code call site:

`src/js/villager-objectives.js:680-687`, exactly these 5 lines removed,
0 added — VERIFIED VERBATIM at base `b4343ac9d` by this arm before any sim:

```
       var finishLottery = function (obj) {
-        try {
-          if (typeof this.vbrainAlignObjective === 'function') {
-            return this.vbrainAlignObjective(vid, obj, hx, hy) || obj;
-          }
-        } catch (e) {}
         return obj;
       }.bind(this);
```

The subject diff is EXACTLY this hunk: one file
(`src/js/villager-objectives.js`), −5/+0, no other game file touched,
no other behavior change. The align function itself STAYS in
`villager-brain.js` (dead code with no caller — its `provides:` line,
rule comments, and the commit-record fields stay as-is); the
`finishLottery` wrapper stays (all 6 objPick return paths still route
through it and get the core objective back unchanged).

Why this form, of the three the 1215Z prereg offers (remove the call /
stub the body / delete the function) — adopted verbatim from the 1215Z
prereg:

- SMALLEST exactly-specified diff: −5/+0 in one place vs −114/+1 to
  stub the body or −115/+0 (plus dangling `provides:`/rule references)
  to delete the function. All three remove the same behavioral effect;
  the call removal is the minimal statement of it.
- SINGLE-CALLER FACT (re-verified by this arm at run start): the only
  game-code caller of `vbrainAlignObjective` in `src/js` is
  `villager-objectives.js:682-683` (grep across `src/js/` — every other
  reference is the definition, header/rule comments, or a test file).
  Removing that call removes the align effect in EVERY branch —
  win-plan, EXPEDITION, DUTY/ASSIGN, fallthrough — because no branch
  can be reached at all.
- KEEPS THE INSTRUMENT WHOLE: the function stays present, so the
  honesty test's setup gate (`typeof Game.vbrainAlignObjective ===
  'function'`) still passes on the subject and the test runs whole —
  its main assertion then FAILS (materialize≠commit), which is the
  pre-registered expected polarity proving the effect is gone.
  Deleting the function would downgrade that to an exit-2 skip and
  lose the instrument; stubbing the body would keep the gate but with
  a 20× larger diff measuring the same change.
- NO RNG-STREAM CHANGE: the align function consumes no Math.random
  (hash only), and the core chore/facing draws in objPick run BEFORE
  finishLottery is called — so the pick, commit, and log are identical
  on baseline and subject for the same seed; only the materialized
  objective differs. The ablation is therefore a pure materialization
  change, not a re-roll.

Rejected forms, recorded: stubbing the body (same behavior, 20× the
diff, no benefit) and deleting the function (same behavior, dangling
references, breaks the honesty-test setup gate).

## Mechanism analysis (pre-registered, adopted from the 1215Z prereg — not a verdict)

What the ablation CAN do on master-tip substrate:

- (a) With the call removed, `finishLottery` returns the core-lottery
  objective unchanged on every objPick return path. Aimed overrides
  (win-plan holds, EXPEDITION hash, DUTY top-score, ASSIGN standing)
  are still recorded on the commitment + log (vbrainScorePick is
  untouched) but no longer materialize in the villager's actual
  errand. The villager's day is decided by the core lottery, not the
  dawn pick — the exact behavior the merge changed.
- (b) The DUTY practiceTask stamp (OVE-74) no longer fires — it lives
  inside the align DUTY branch. That is a CONSEQUENCE of removing the
  align effect, not a separate change: practice accrual via DUTY was
  part of the align step. Recorded here so the evidence file can check
  whether practice accrual moves on the subject leg; it is not judged
  separately.
- (c) The brain module itself stays loaded (`vbrainOwnsDawn()` true,
  `vbrainScorePick` present) and agency still honors the commitment at
  `vbrainExecuteDepart` (a SEPARATE mechanism — the dawn commitment
  still holds the villager at depart; only the objective
  materialization is ablated). The ablation is therefore narrow: it
  isolates the align step from the rest of the brain, including the
  Phase 6 DUTY/ASSIGN handling that lives inside the align function.
- Consequence, stated up front: if the ablation RESTORES survival
  toward the far end's 4/8 from a collapsed master-tip baseline, the
  brain-side align step is a carrier; if survival is unchanged, it is
  not — on THIS substrate, where the brain module exists. The verdict
  is about the align step, not about the whole family (the
  objectives-side half was already judged NOT-CARRIER by 7b).

## Seed band + freshness (MATCHED — deliberate reuse, authorized)

- Band: **190391–190398** (8 seeds), MATCHED. This is the bisect program's
  canonical band — the merge leg, the far-end leg, rounds 12–13, and
  dozens of transplant legs all ran on it. That is the point: the question
  is a matched comparison against the merge's collapsed 1/8 read on these
  exact seeds.
- Freshness search (per local_seed_band_freshness skill), scope:
  (1) word grep for each seed `190391`–`190398` across ALL
  `evidence/*/sim-*-prereg.md` files — they WILL hit, as the matched
  band: **190391: 92 prereg hits, 190392: 14, 190393: 19, 190394: 12,
  190395: 15, 190396: 14, 190397: 11, 190398: 92** (the endpoints read
  92 because the band range "190391–190398" is named in ~92 preregs;
  the middle seeds are named individually in 11–19 preregs each);
  (2) whole-`evidence/`-tree grep for `19039[1-8]` — per-seed corpus
  files across dozens of arms (bisect-anchor, bisect-merge, culpritbisect
  ep-far/ep-merge/t-series, masterregress, transplant t7b/t8b/t8c,
  tendshift, steeple, and more), plus decimal-substring false positives
  in old corpora; (3) filename search (`find evidence -name "*19039*"`)
  — hundreds of per-seed files named `s190391`–`s190398` across the
  bisect/transplant corpora; (4) no file named *forbidden* exists under
  `evidence/` or the goal `hidden_files/` (searched — 0 hits).
- This is NOT a collision and NOT a freshness failure: the hits are the
  expected matched reuse, DELIBERATE and authorized by the 1415Z
  coordinator decision (1) quoted at the top of this file. Do not treat
  the hit counts as contamination — the contamination question does not
  arise for a matched band; the band's prior reads ARE the comparison.
  What the search establishes instead: the band is the canonical matched
  band (no other band is this widely used), and no forbidden-list
  reservation bars it.
- Forbidden bands (task brief, never reused): 190581–190588 (the 1215Z
  fresh band — now itself a used band, closed by the gate STOP),
  190541–190548, 190561–190568, 100301–100316, 100401–100416,
  100421–100436, 73671–73678.
- Step ids: baseline `ep-tip-7redef-match`, sniff
  `ep-tip-7redef-match-sniff`, subject `t7redef-match`. Corpus dir names
  distinct from the 1215Z run's and from 7b/7brain
  (ep-tip-7redef-match, not ep-tip-7redef).

## Measurement plan

- Subject branch `transplant-7redef-subject`, cut from the arm branch
  ONLY after the baseline gate passes (7brain precedent — no subject
  exists on a gate STOP). One subject commit: exactly the ablation
  hunk above. Subject policy == base policy; subject native standing
  == base native standing (sha256 `f9359976...`, see §Substrate).
  Measured diff verified byte-identical to the ablation set: the
  subject diff's added/removed lines must equal exactly the 5 removed
  lines above (−5/+0, one file); `villager-brain.js` untouched.
  The branch was verified NOT to exist at run start (the 1215Z arm
  verified it doesn't; re-checked by this arm — absent).
- BAND-HEALTH PRE-CHECK (4-seed sniff, the 8c lesson): BEFORE the
  full baseline leg, run the step script on the baseline commit with
  seeds 190391–190394 only (STEP `ep-tip-7redef-match-sniff`). The sniff
  judges BAND/ BASE health, not the verdict: if all 4 villages die
  before day 30 (catastrophic early death — inconsistent with every
  prior master read, where deaths come at the door/waves on day 43+),
  STOP and investigate the base/band before spending the subject leg.
  Otherwise proceed to the full 8-seed baseline leg (the sniff seeds
  are re-run inside it; deterministic sims, same result expected).
- BASELINE LEG FIRST: STEP `ep-tip-7redef-match` on base `b4343ac9d`, via
  `scripts/transplant7redef-step.sh` with
  `SEEDS=190391,190392,190393,190394,190395,190396,190397,190398` in the
  environment. Seeds 190391–190398, 150d death-aware, competent verbatim
  own-policy, fix standing swapped in, native restored byte-identical
  afterwards, sha-verified.
- GATE (pre-registered, 7brain polarity — the question is live ONLY in
  the collapsed regime; stated as a RANGE, per the task brief):
  baseline survived 0–2/8 → PROCEED (collapsed regime; the align
  question is live). Baseline survived ≥3/8 → STOP, report
  UNMEASURED-substrate (the collapse regime is gone on current
  master on this band: do NOT re-judge family 7, do NOT cut a subject
  leg). Expected baseline: **0–2/8** — the master-tip regime on the
  matched band reads 1–2/8 pre-guard (merge 1/8, rounds 12–13 read
  1–2/8). CAVEAT (see §Substrate change): the CASCADE guard landed
  after those reads and pushes survival up, so a 3/8 read is a live
  possibility and would be gate-STOP, discussed in the evidence file
  as the guard having lifted the floor. The gate is a range, not a
  point: a 0/8 baseline PROCEEDS (the sniff already guards the
  catastrophic case), and a 2/8 baseline PROCEEDS. The opposite
  polarity from 7b's gate (there ≥3/8 PROCEED, because the far end was
  the healthy baseline) is deliberate and recorded — the two gates
  look alike and judge oppositely.
- SUBJECT LEG: STEP `t7redef-match`, via the same step script with the
  same SEEDS env. Seeds 190391–190398, 150d death-aware, competent
  verbatim own-policy, fix standing swapped in every step, native
  restored byte-identical afterwards, sha-verified.
- Primary metric: survived/8 on the subject leg MINUS the baseline
  leg. Subject − baseline ≥ +2 survivors = CARRIER (the align step
  collapses survival); within ±1 = NOT-CARRIER; subject worse by ≥2
  = INVERTED (report it, do not re-judge). This is the 7brain delta
  mapping, confirmed against the culpritbisect prereg's transplant
  thresholds (the 8c arm's ≤1 CARRIER / 2 AMBIGUOUS / ≥3 NOT-CARRIER
  count mapping applies to a SUBJECT count against a KNOWN-healthy
  4/8 baseline, which this arm does not have — the delta form is the
  applicable one here, and the prereg states that before any leg).
  Secondary (diagnostic only): wave-5 unlocks, median days,
  death-cause shares, standing distribution. Rank read (same bands as
  r10/masterregress): regional ≥5/8 REGIONAL_INTACT; ≤2/8 RANK_STALL;
  3–4/8 RANK_INCONCLUSIVE. No cost guard — measurement arm; nothing
  lands on master from the subject.
- Telemetry: recorder-corpus class — the deviation check REFUSES these
  corpora; record the refusal, never roll the baseline.
- Sense-testing: read vetSays narration from both corpora and judge
  meaning/coherence — census the lines, quote what villagers actually
  do/say, flag anything robotic or repeated.

## Substrate — what the steps run on (verified, not assumed)

- **Harness.** `scripts/sim-harness.js` at base `b4343ac9d` — the
  master-tip harness (no swap; steps run the commit's own harness).
  The step script restores tooling scratch from master (driver +
  shared analyzer + instrument, all present on master — verified by
  this arm) and the redefined analyzer from the ARM branch (it does
  not exist on master — verified: `git show master:scripts/
  transplant7redef-analyze.js` fails; it lives on the arm branches).
- **Standing fix swap.** Every step swaps in the fix `standing.js`
  (`git show 5157782a4:src/js/standing.js`, sha256
  `f8fda4295a99720dcb54d0c69f5fa6836f55cf9d9c8c5d1e51e5f0aa49c43078` —
  verified by this arm) uncommitted, exactly as the culpritbisect
  swap legs did, and restores the commit's native `standing.js`
  byte-identical afterwards (sha256 `f935997640a0c1df1a1eb52d91172c7bc49cc2b9ab58fe9d77f58a17839388e9`
  at base `b4343ac9d` — verified by this arm; IDENTICAL to the 1215Z
  value at `1ca2c257d`, so standing.js is unchanged between the two
  bases). The driver refuses to run unless the on-disk `standing.js`
  carries the ROSTER CHECK marker. The fix file vs base `standing.js`
  differs by the ROSTER CHECK hunk + the BLOODED block (same two
  insertions as on the origin trees); the BLOODED block's live delta
  on this substrate is the roster check, as on the far/merge bases.
- **Policy.** Each step runs its commit's OWN `competent.js`
  (own-policy convention, same as the bisect legs). Policy sha256 at
  base: `74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456`
  (verified by this arm; IDENTICAL to the 1215Z value — the policy is
  unchanged between the two bases). The driver records the policy sha
  per seed and refuses only if the policy file cannot be read.
- **Instrument.** `scripts/vetfirst-instrument-20261111.js` + the live
  shadow old-rule count, exactly as the bisect legs. Restored as
  UNTRACKED scratch at each step commit via `git show master:<path>`
  and deleted before checking the branch back out. Same for the step
  driver/analyzer (they exist only on the arm branch / master).
- **Step script.** `scripts/transplant7redef-step.sh` (this arm,
  modeled on `scripts/culpritbisect-step.sh`): the culpritbisect
  script hardcodes `SEEDS=190391,...,190398` and restores scratch
  from master only, so it cannot run a fresh band or the redefined
  analyzer. The new script takes SEEDS from the environment (default
  the fresh band — the match run passes the matched band in the env),
  restores the driver + shared analyzer + instrument from master and
  the redefined analyzer from the arm branch, swaps the fix standing,
  runs the driver + analyzer, restores native standing byte-identical,
  restores scratch from the step commit, verifies the tracked tree
  is clean. Run from a /tmp copy with REPO passed in (the detached
  checkout would otherwise unlink the running script). It does NOT
  run `git bisect good|bad` — the operator classifies.
- **Step-script fix (finding #2381, FIXED on this arm's branch — part
  of this arm's tooling commit).** The 1215Z script's `restore()`
  deleted its tooling scratch (`scripts/culpritbisect-driver-20261113.js`,
  `scripts/masterregress-analyze-20261113.js`,
  `scripts/vetfirst-instrument-20261111.js`,
  `scripts/transplant7redef-analyze.js`) — but those files are TRACKED
  at the detached step commit, so the delete left the tree dirty and
  the script's own final clean-tree check failed after every leg
  (struck twice on the 1215Z arm, sniff + baseline; sims and summaries
  completed fine both times; recovered with `git checkout --` + branch
  checkout). The fix on this branch: `restore()` now runs
  `git checkout HEAD -- <each scratch file>` (HEAD is the detached step
  commit after a successful checkout, the arm branch if the checkout
  failed) and falls back to `rm -f` only for a file the commit does not
  carry. The script's ARM_BRANCH default is now the match arm
  (`sim-transplant7redef-match-a`, env-overridable). The fix is proven
  by the legs themselves: a leg that ends with the tracked tree clean
  proves the restore path works.
- **Analyzer.** `scripts/transplant7redef-analyze.js` (1215Z arm,
  unchanged on this branch): the culpritbisect analyzer hardcodes
  SEEDS 190391–190398, so it cannot read a fresh band. The new
  analyzer takes STEP + SEEDS from the environment, reads
  `evidence/2026-11-13/perseed-culpritbisect-a-<STEP>/culpritbisect-s<seed>-culpritbisect-pilot-fix.json`,
  reuses `SC.analyzeRows` from `masterregress-analyze-20261113`
  (the shared module — same per-seed fields, wall, death causes,
  instrument errors), classifies the leg (≥3 GOOD / ≤1 BAD / 2
  AMBIGUOUS, the bisect classifier reused as a leg classifier), and
  writes `evidence/2026-11-13/culpritbisect-a-<STEP>-summary.json`
  in the same shape as the bisect summaries. The transplant verdict
  (subject − baseline) is computed by the PROOF (§9), not the
  analyzer.
- **Mode.** `fix` only (the fix is swapped in at every step).
  `loadGame({seed, mode: 'competent-vetphantom'})`, competent
  verbatim, 150d death-aware, seeds 190391–190398.

## Family-test leg (honesty test + targeted align test — pre-registered, adopted)

The honesty test `scripts/test-dawn-materialize-honesty.js`:
- Baseline (base `b4343ac9d`): EXPECTED exit 0, pass:true,
  materialize==commit (HAVEN_CHORE, gear_hold) — verified during
  proof development on the 1215Z baseline tree (same output the 7brain
  arm recorded on master tip: `{"pass":true,"seed":20261108,"materializeNeqCommit":0,
  "honest":{"materialize":"HAVEN_CHORE","commit":"HAVEN_CHORE",
  "override":"win_plan:gear_hold","corePick":"HAVEN_CHORE",
  "purpose":"chore","chore":"repair","indoor":true},
  "controlMismatch":true,"depart":"hold"}`) and re-verified live on
  THIS baseline tree by the match proof §7. Formal run after the
  prereg commit, recorded in the evidence file.
- Subject (call removed): EXPECTED exit 1, fail
  'materialize≠commit on conflict fixture' — the live objective stays
  the core pick while the commit still carries gear_hold. That FAIL
  is the expected polarity (the align effect is gone), not a
  regression. The control stub (direct align call) still passes —
  the function is present, only uncalled from finishLottery.

The targeted align test `scripts/test-transplant7redef-align.js`
(one staged villager per case, live objPick, `--case <name> --seed N`;
exit 0 = target override fired, 2 = did not fire — the proof judges
the polarity). Pinned firing seeds/vids, verified on the 1215Z baseline
during proof development and re-verified live on THIS baseline tree by
the match proof §7 (deterministic — same seed/vid fires on the
subject, because the pick/commit/log are identical up to the align
rewrite: align consumes no Math.random and the core draws run before
finishLottery; the CASCADE guard does not touch the dawn path):

| case | seed | vid | override | corePick | baseline materialize (align ACTIVE) |
|---|---|---|---|---|---|
| gear_hold | 20261109 | gen_2ut3alf | win_plan:gear_hold | VISIT | HAVEN_CHORE, purpose chore, indoor, chore repair (= commit chore) |
| expedition | 20261109 | diana_osei | expedition_hash | HAVEN_CHORE | EXPEDITION, purpose chore, indoor, chore fire |
| duty | 20261108 | gen_wco817u | duty_top_score | HAVEN_CHORE | FORAGE, purpose forage, outdoor (dutyTask forage) |
| assign | 20261108 | gen_wco817u | assign_standing | HAVEN_CHORE | FORAGE, purpose forage, outdoor (assignTask forage) |

- gear_hold staging: explorer profile + win-plan gear_hold (honesty
  fixture). Seed 20261109 is the first seed where the firing
  villager's core pick (VISIT) differs from the commit kind, so kind
  alone distinguishes align-active from align-inert (on 20261108 the
  core pick coincides with the commit kind).
- expedition staging: explorer profile + `potential` boost (w 0.55 →
  0.88, hash chance 0.275 → 0.44) + the `vbrainDisableDutyPick` probe
  seam (duty ads still score; the align effect is downstream of
  which override won). Seed 20261109 is the first seed where a
  villager fires expedition_hash (on 20261108 none of the 11 living
  villagers fires: the 4 indoor-core villagers all hash above the
  chance, the 7 VISIT-core villagers never reach the hash check —
  verified by probe). The hash is per (vid, day), not per game seed,
  so the scan is over seeds because the roster + core picks change
  per seed.
- duty staging: pantry drained to 0 kcal (pantryVeryLow → forage
  DUTY w 3.2, top-scores over any core pick, max 3.0), water kept
  high, no assignment, not gardenKeeper.
- assign staging: `state.village.assignments[vid] = { task: 'forage',
  via: 'assignTask' }` (forage is in the `delegateTasks()` catalog;
  the order already cleared its gate when written — the feeder does
  not re-check obedience).
- Expected SUBJECT values (align INERT — the proof asserts these on
  the subject extract): every case materialize === corePick, with the
  commit still carrying the override (commitKind/override unchanged):
  gear_hold → VISIT (core pick), expedition → HAVEN_CHORE (core
  pick), duty → HAVEN_CHORE (core pick), assign → HAVEN_CHORE (core
  pick). The commit still records the override on the subject — only
  the materialization is gone.

## Proof

`scripts/test-transplant7redef-match.js` (stage 1, before the subject):
the 1215Z proof adapted to the matched band and the new base — same
sections, same classifiers, same live family-test legs. It proves:
family identity (merge NOT an ancestor of the far end, IS an ancestor
of master tip `b4343ac9d`; second parent 1 commit; 6 files, brain 56/3,
objectives 19/7); ablation-set definition (the CURRENT align function
is lines 892–1006, 115 lines, 4 branches inventoried, at base
`b4343ac9d`; the single game-code caller is finishLottery :682-683;
the ablation is exactly the 5 removed lines, −5/+0, one file — the
removed lines are listed verbatim and matched against the live
source; the rejected stub/delete forms are named with reasons);
mechanism (guarded call present at base; align definition present;
finishLottery routes all 6 objPick returns; commit still written by
vbrainScorePick; vbrainExecuteDepart untouched); verdict mapping
(delta classifier, gate classifier with 7brain polarity, sniff rule);
base state (worktree-aware — tip is an ancestor of HEAD, the prereg
names the run id + band, src/js clean on disk, standing == HEAD,
only arm files uncommitted, step tooling present on master + arm
branch, step-script #2381 fix present); seed-band identity (MATCHED
band 190391–190398, step ids ep-tip-7redef-match-sniff /
ep-tip-7redef-match / t7redef-match, subject branch
transplant-7redef-subject, matched-reuse search recorded: per-seed
prereg hits 92/14/19/12/15/14/11/92, corpora across dozens of arms,
no forbidden list — authorized by the 1415Z coordinator decision);
family-test legs (§7: the align script run live on the baseline tree —
all 4 cases fire on their pinned seeds and show align-ACTIVE polarity;
the honesty test runs whole on the baseline); live subject state (§8:
STAGE-1 branch — no subject branch exists yet; after the cut — branch
exists, one commit, diff exactly the ablation set, no other game file
touched, policy + standing == base, align script run live on a /tmp
pathspec extract of the subject shows align-INERT polarity on all 4
cases); step corpora (§9: STAGE-1 branch — no summaries exist;
intermediate branch — baseline summary exists, subject summary missing
(GUARDED read — the §10 crash fix: no uncaught ENOENT, the leg reports
"subject summary missing" and waits); final branch — both exist, gate
judged, delta judged). The §9 intermediate-state leg is FIXED relative
to the 1215Z proof: a gate-STOP terminal state (baseline summary
present, no subject) is a legitimate end state, not a failed
intermediate — the 1215Z proof's "baseline gate is PROCEED" leg
contradicted its own STOP handling and was adjudicated, not waived;
this proof accepts PROCEED or STOP-UNMEASURED there.
`scripts/test-culpritbisect-a.js` (116 legs) re-run on the arm branch
as the reused-tooling check.
The honesty test is run as a diagnostic on the worktree after the
prereg commit (baseline) and on the subject extract after the subject
cut (see §Family-test leg); its outcome is recorded in the evidence
file, not in the proof.

## Canon

docs/CANON.md read first, plus docs/VILLAGER-BRAIN.md §4/§5 (the
family's area). No canon doc covers survival-collapse attribution;
nothing here invents canon.

## Balanced panel (§15) — N/A

Diagnostic transplant, no code change to the live game, no before/after
pair to compare on one base. The before/after comparison IS the
boundary pair (master tip vs subject) on identical seeds, judged by
the analyzer's decision rule. Same standing as masterregress §7,
survivalcontrol-b §7, anchor-a §7, and the r5–r10 cut arms §7.

## Guards (reported, never verdict-flipping post-hoc)

- If any per-seed file is missing or fails to parse, the step is
  INCOMPLETE, not a verdict — re-run the missing seed(s) only.
- If instrument errors > 0 on any seed, record them; the verdict
  stands only if the errors cannot touch the survival read (the
  survival read comes from the harness end state, not the instrument).
- The fix swap is the ONLY permitted uncommitted change during a step
  (plus the untracked tooling scratch). After each step, the original
  `standing.js` is restored byte-identical (sha-verified) before the
  next step or any evidence commit. If a restore fails, FAIL LOUDLY
  and do not commit evidence. After each leg, check the arm branch
  back out (the step script leaves HEAD detached at the step commit).
- This arm does NOT re-judge any prior verdict (family 7 UNMEASURED,
  7b NOT-CARRIER, 8b NOT-CARRIER, 8c UNMEASURED-on-gate, masterregress
  CULPRIT_MERGE / POLICY_EXONERATED_AT_MERGE, and the rest of the
  bisect record) — it measures only the redefined ablation defined
  above.
- /tmp tmpfs is 512M — never a full-tree `git archive` extract; use a
  pathspec extract (src/scripts/index.html/manifest.json/sw.js/
  build-source.json) for the family-test runs on the subject.
- No game-code change is committed by this arm on the arm branch (the
  subject lives on its own branch `transplant-7redef-subject`, left in
  place); no `[needs-eyes]` applies. The arm branch commits only:
  prereg, proof + analyzer + step script, evidence + step corpora.
- Telemetry deviation check (Loop A body step 10): attempted; prior
  bisect arms were REFUSED by the tool (recorder-corpus class). If
  refused again, recorded, not waived, baseline NOT rolled.
- Flap note: a host write flap blocked all writes for ~20 min mid-run
  on the 1215Z arm (~12:47–13:08Z). If the flap returns mid-run, wait
  for it to clear rather than bypassing safe-commit; never route around
  a denial. No flap has struck this arm at prereg time.
- Safe-commit index clobber: watch for it after every safe-commit
  (prior arms: struck on nearly every commit on this tree) — repair
  with the documented `ls-tree -r HEAD -- <paths> | git update-index
  --add --index-info` pipe and verify worktree hash == HEAD blob
  before continuing.

## Metric review (§14 — filled in the evidence file, never re-scored here)

- (to be filled after the run: did the metric set hold, or does a metric
  need revision for the NEXT run?)
