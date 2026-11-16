# sim-launchdef-a — PREREG (binding)

Run: fleshout-20261116T0645Z (Loop A), axis scale-onramp, arm
sim-launchdef-a — LEVER re-test + instrument: re-test the
profile-gate bypass under a corrected (any-commit) launch metric,
with a skip-reason recorder. Branch `sim-launchdef-a` (worktree
`~/workspace/worktrees/sim-launchdef-a`). Base: `a3462c4f2` at arm
start. Binding prereg: THIS file — frozen before any judged sim.
The instrument (driver, analyzer, panel builder, proof test) is
built AFTER this commit; no judged numbers exist yet.

## The question, in plain words

The 0446Z profilegate pilot judged the gate fix NO-GO because its
frozen metric counted only dawn launches — and the armed leg launched
0 of 8 seeds by that definition. But the fix DID work: on seed
100877 the non-ranger gen_gmvcrwd's mid-day (part-1) `party_launch`
commits on days 65 and 78 launched both expeditions (target
influencer, companion gen_r6qd5mu), while the identical commits in
control produced zero depart rows. The metric missed the lever's
actual effect. This arm re-tests the SAME gate fix under a corrected
metric — a wave-4+ plan counts as launched on ANY commit (dawn or
mid-day refresh) — and adds the missing instrument: a skip-reason
recorder that says WHY a `party_launch` commit produces no execute
row, decomposing the `selected-not-executed` composite bucket.

## Prior art (read first)

- `evidence/2026-11-15/sim-profilegate-a.md` + prereg — the PILOT
  NO-GO, the gate fix text, the matched pair (gen_gmvcrwd, seed
  100877), the Diana Osei away-as-companion lesson, the day-70
  unrecorded blocker. This arm re-lands the gate fix EXACTLY as
  profilegate-a built it (reverted in `f5dee2331`).
- `evidence/2026-11-15/sim-dawnbid-a.md` + prereg — the 24-plan
  decomposition, the frozen bucket definitions (reused verbatim
  except the `launched` definition, corrected here), the seed call
  text, the 8/8 selected-blocked non-rangers.
- `evidence/2026-11-15/sim-scale-onramp-round-0446.md` (coordinator
  evidence) — the cross-arm policy lesson (a REAL tableseat-nowait
  baseline needs `TABLESEATNOWAIT=1 LEANLINKRESCUE=1`; default env
  collapses to competent), the cost bar, the metric review.
- `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md` (wave 4
  "The Mirror Draft"; readiness wave 4: 3 armored P≥10, 5 armed,
  3 tricks, 1 wave-3+ killer — the bar this chain feeds, not
  changes), `docs/PARTY.md`, `docs/VILLAGER-BRAIN.md` (one-brain
  contract: Phase 1 dawn scorer; §9 win prices / deed gates /
  readiness bars untouched; perception law).

## Claims (sim-findings.md)

This arm claims, at start (2026-11-16):

- `#2414` MID-DAY PARTY_LAUNCH COMMITS LAUNCH WAVE-4 PARTIES,
  DAWN-ONLY METRIC MISSES THEM — the any-commit launch definition
  in this prereg answers it; marked `[claimed]`, updated to
  `[fixed]` with the evidence link if this arm's metric + result
  answer it.
- `#2415` AGENCYTICK SKIP REASON UNRECORDED — the skip-reason
  recorder in this prereg answers it; marked `[claimed]`, updated
  to `[fixed]` with the evidence link if the recorder classifies
  the blocked days.

## Design decision 1 — the subject only exists with the seed call (frozen)

Same as profilegate-a, unchanged. On current master the world-tick
seed call is GONE (vetparty lever touch point 1, reverted by
`7ba893b4b`; dawnbid re-landed it for measurement and reverted it
again by `ce393ec75`; profilegate-a re-landed it and reverted it by
`f5dee2331`). Dawnbid's control leg saw 9 wave-4 seed calls from the
remaining call sites (gate-'avoided' path, expedition path) and **0
plan instances opened** — every one bounced off a hunt-stage
target-null plan. A lever run on pure master would classify ~0
plans: a vacuous result.

So BOTH legs of this arm re-land **ONLY the vetparty seed call,
verbatim** (the 13-line block from `ccf6d869c`, blob `a66d45a5e`,
in `resolveWildMonsterEncounter`, `src/js/game.js`, beside the
existing return-to-fight sighting block): after a `fieldFight` /
`aidFight` vs a wave-4+ monster ending `vFlee`, call
`winPlanSeedFromFight(vid, mdef, 'fled')`; excluded for raids
(`opts.raid`) and aid fights (`wViaAid`); wave-gated inside the
seed (wave ≥ 3). The seed call is the DIAG-reproduction subject
enabler, NOT the lever under test: control leg = seed call ON +
gate intact; armed leg = seed call ON + gate bypass. The judged
difference between the legs isolates the gate, and ONLY the gate.

Disposition (dawnbid/vetparty/profilegate precedent): after
measurement the seed call is REVERTED on the branch; the
instrument, analyzer, panel builder, proof test, corpora, and
evidence merge evidence-only plus the gate fix if GO (below). The
seed-call text is preserved verbatim in this prereg and in git
history, so any follow-up re-lands it in one step.

**Landing consequence, stated up front:** if the gate fix is GO,
it lands as its own commit — but on master without a seed source
it is nearly inert (plans almost never form; dawnbid control: 0
instances in 8 seeds). Whether the seed call lands WITH the gate
fix, as a chain repair, is a separate coordinator decision, NOT
made by this arm. This arm judges only the gate. The report and
evidence will say so in plain words.

## Design decision 2 — baseline policy is tableseat-nowait (frozen)

The baseline is **the tableseat-nowait policy on identical seeds**
(`scripts/policies/tableseat-nowait.js`, sha `a11a1abc672e`,
wrapping `scripts/policies/leanlinkrescue.js`, sha
`53f310aba27a`; competent sha `74a890f0844e` for reference).
Env pairing for both legs: `LEANLINKRESCUE=1 TABLESEATNOWAIT=1`
(the policy is default-OFF without them). This is a REAL
tableseat-nowait baseline — default env collapses to competent,
which confounded the 0446 seedattach wall numbers; do not repeat
that. The 0446Z profilegate numbers (wins 6/8, national 6/8,
median 91.5d/90d, competent-collapsed seedattach 0/8) are
prior-art reference only — NOT this arm's control; this arm
re-runs its own baseline on the fresh band.

## Design decision 3 — the gate change, exactly (frozen)

The profile gate is `src/js/villager-agency.js`, `agencyTick`,
the at-home departure loop. Re-land EXACTLY as profilegate-a
built it (reverted in `f5dee2331`; the armed-leg anchor was
`a56cce6f6`, 18 insertions, 1 deletion):

```js
var prof = this.npcRangeProfile(rid);
if (prof !== 'wanderer' && prof !== 'explorer') {
  // PROFILEGATE (sim-profilegate-a): a bid-and-selected
  // party_launch plan is a commitment the dawn scorer already
  // made; the profile gate must not veto it. The holder still
  // faces every other launch condition downstream (Haven,
  // night, danger, objectives, and startExpedition's
  // sick / range-0 / hurt<70 checks) — only the profile
  // skip is bypassed, and only for today's party_launch
  // commit. The commit is read only; no new state, no RNG.
  var _pgLaunch = false;
  try {
    if (typeof this.vbrainCommit === 'function') {
      var _pgc = this.vbrainCommit(rid);
      _pgLaunch = !!(_pgc && _pgc.day === ((this.state.scholar || {}).day || 0) && _pgc.winPlanAction === 'party_launch');
    }
  } catch (e) {}
  if (!_pgLaunch) continue;
}
```

Untouched, by name — every other launch condition stays exactly
as the code has it (the arm tests ONLY the profile gate):
gear-up at launch, sick stays home, range-0 can't go, hurt <70 HP
needs medicine or a healer at camp, the holder must be at Haven,
it must not be night, the village-danger expedition gate still
applies, the companion must still be launchable by
`startExpedition`. `vbrainExecuteDepart` itself carries no
profile check and is NOT changed. No win-plan stage, bar, gate,
price, or default changes.

## Design decision 4 — the instruments (frozen)

### 4a. Any-commit launch definition (NEW)

A wave-4+ plan instance counts as **launched** when a
`party_launch` commit for the instance on a given day — dawn
(part 0) OR mid-day refresh (part 1 / part 2) — leads to a
`vbrainExecuteDepart` row that day with result `launch` and BOTH
the inviter's and the companion's expeditions started
(`vidExped && companionExped`). Every launch records its commit
kind: `dawn` (part 0), `mid-day part-1`, or `mid-day part-2`
(the part of the score row whose commit the launch consumed).
A `launch` row with the companion left behind is NOT launched —
it is `selected-blocked` with sub-reason
`companion-not-started`. The dawn-only definition is kept as a
secondary count alongside, so the 0446Z numbers stay comparable.

### 4b. Skip-reason recorder (NEW)

The driver wraps `Game.agencyTick` (in addition to the existing
dawnbid wraps). `agencyTick` runs once per day-part, after
`npcNodeTravel`, so a tick is the unit in which a commit either
reaches `vbrainExecuteDepart` or is skipped. At each tick the
recorder snapshots, for every live wave-4+ plan holder holding
TODAY's `party_launch` commit (read via `vbrainCommit`):

- profile (`npcRangeProfile`), node vs Haven (`npcNode`),
  expedition standing (`agencyState().exped[vid]`), away status
  (`v.away[vid]`), night (`isNight()`), engaged (`isEngaged`),
  indoor objective (`objOf`), danger gate
  (`npcTrigger(rid, 'expedition_launch')` — a pure predicate read,
  `objVillageDanger >= 4`), holder alive, holder plan stage/party,
  commit kind, day part.

The `vbrainExecuteDepart` wrap marks which vids it was called
for during the current tick and with what return value. After
the tick, for each snapshotted holder where execute was NOT
called during that tick, the recorder writes one `launchdefSkips`
row with the reason derived from the pre-tick snapshot, in the
same order `agencyTick` checks them:

1. `holder-dead` — the holder's person record is dead.
2. `engaged` — `isEngaged(rid)` at tick time.
3. `away-as-companion` — an expedition stands for the holder
   while their own plan is still at party stage (the Diana Osei
   lesson: the holder is out on somebody else's trip; the scorer
   bids a return trip for a holder who is already away). The
   recorder captures holder-away status at each commit — the
   plan stage at tick time is the discriminator.
4. `away-on-expedition` — an expedition stands for the holder
   AND their own plan has already advanced to hunt stage (they
   are out on their own launched plan).
5. `profile-gate-veto` — profile is not wanderer/explorer AND
   the leg is control (in the armed leg the bypass applies to a
   `party_launch` commit, so this reason never fires there; the
   recorder knows the leg from `MODE` and records the leg on
   every row, plus the raw profile, so the analyzer can audit
   the leg-dependence).
6. `not-at-haven` — node missing or not at the Haven node.
7. `night` — `isNight()` at tick time (day part 3).
8. `indoor-objective` — indoor objective in indoor state with
   no EXPEDITION brain commit (the code's own carve-out is
   replicated: a `party_launch` commit has kind EXPEDITION, so
   this reason is expected to read 0 — it is recorded anyway so
   a non-zero count would be visible, not silently dropped).
9. `danger-gate` — `npcTrigger(rid, 'expedition_launch')` true
   (village danger ≥ 4).
10. `execute-returned-normal` — execute WAS called during the
    tick but returned `'normal'` (commit kind not EXPEDITION, or
    commit day mismatch): the commit never became a launch.
11. `other` — execute not called and no reason above fired; the
    row carries the full raw snapshot so the cause is
    diagnosable, not hidden.

A commit-day with NO depart row and NO skip row is resolved by
the analyzer as `no-tick-after-commit` when the day's last
`party_launch` commit is part 2 or later (no daytime tick left
after the commit — the profilegate day-58 Diana case), else
`selected-not-executed` (legacy unexplained — expected 0; any
count is an instrument gap, reported, not hidden).

The recorder wraps are pure reads plus writes to driver-local
arrays — no game-state writes, no RNG. `LAUNCHDEF_RECORDER=off`
skips installing the wraps (determinism leg D2). The `agencyTick`
wrap itself must not change the tick: it calls the original once
and records around it.

### 4c. Driver / analyzer / panel (adapted, not rebuilt)

- Driver: `scripts/launchdef-driver-20261116.js` (new — the
  profilegate driver adapted: same vetfirst T-class instrument,
  same `v4seeds` / `v4departs` / `v4gates` / `v4encounters`
  recorder, same dawnbid capture rows, PLUS the `agencyTick`
  skip-reason wrap producing `launchdefSkips` rows and the
  per-launch commit-kind record; policy tableseat-nowait, arm/run
  naming `launchdef-a`, `LAUNCHDEF_RECORDER=off` skip-switch,
  policy sha recorded). The driver refuses to overwrite an
  existing per-seed file.
- Analyzer: `scripts/analyze-launchdef-a.js` (new — the
  profilegate analyzer copied EXCEPT: output file
  `evidence/2026-11-16/launchdef-a-analysis.json`, arm label
  `launchdef-a`, the `launched` definition corrected to
  any-commit (4a), the resolution of each commit-day against
  depart rows AND skip rows (4b), a skip-reason decomposition
  table per leg, and the GO section computing the primary metric
  and the cost bar — see below). The frozen bucket definitions,
  precedence, and classifier are otherwise UNCHANGED from
  dawnbid/profilegate (Correction 2 included: stage advancement
  is history, not churn; `target-killed` bucket;
  `selected-not-executed` sub-reason).
- Panel: `scripts/build-launchdef-panels-20261116.js` (new — the
  profilegate panel builder adapted: before=control leg,
  after=armed leg, PAIRED seeds, pseudo-policy `launchdef-a`,
  seeds 102011–102018, 150d). The §15 balanced panel
  (`scripts/balance-panel.js`) is the instrument; the
  pre-registered threshold below is the judge. The compare `.md`
  is attached to the evidence file.
- Drift check: reuse `scripts/vetparty-drift-check.js` verbatim
  (reads `v4seeds` + the T-class daily fingerprints — this
  driver's corpora carry both). First divergence must fall
  on/after the first `v4seeds` day per seed in the armed leg.
  The gate fix can only act after a plan exists, which requires
  a seed — so any earlier divergence is substrate drift, not a
  lever effect.
- Proof: `scripts/test-launchdef-a.js` (new; see below).
  GREEN on the seed-call tip (control anchor) before the
  control leg runs; GREEN again on the gate-fix tip before the
  armed leg runs; GREEN again post-revert with
  `LAUNCHDEF_SEED_CALL=off` (not-built shape).

## Frozen definitions

- **Wave-4 monster ids** (from `src/data/monsters.json`, wave 4;
  10, re-read live by the driver): `congregation`, `strike`,
  `influencer`, `audit`, `reunion`, `suburb`, `eulogy`,
  `algorithm`, `eater`, `herald`. (Doc drift carried from
  dawnbid: `docs/MONSTER-WAVES.md` lists 9, no herald; the
  data has 10 and the data rules.)
- **A seeded wave-4+ plan instance** opens on a `v4seeds` row
  with wave ≥ 4 whose holder does NOT already hold a live
  wave-4 plan (same vid, same target = a refresh, counted once;
  a later seed row for the same vid with a DIFFERENT target
  while the old instance is still open closes the old instance
  as `churned-retargeted` and opens a new instance). A seed row
  that arrives while the holder's plan is at stage
  hunt/standing/table opens NOTHING — recorded as a non-opening
  seed, not a plan instance. Wave-5 targets count as instances
  (the seed gate is wave ≥ 3; the frozen definition counts
  them — dawnbid's metric-review note, carried forward: the
  primary metric is "wave-4+ plans", and the wave-4-only count
  is reported alongside).
- **Launched** (the primary-metric event, CORRECTED): any-commit
  per 4a. Dawn-only launched is reported alongside as a
  secondary count.
- **Skip reasons**: the 11-reason taxonomy in 4b, recorded per
  (vid, day, part). A commit-day's blocked reason is the first
  skip row that day in part order, unless a depart row was
  reached (then the depart blocker governs: `inviter-*` /
  `companion-not-started:*`).
- **Starvation cost** (per `scripts/analyze-scale-costbar.js`
  B3): totals = starvation-caused deaths across the 8 seeds
  (`deaths[].cause === 'starvation'`); arm-only = armed-leg
  starvation deaths minus those matched same-seed same-day in
  the control leg (a matched starvation death is the same
  village dying the same way on the same day, not a new cost).
- **Median survival**: median `gameDays` across the 8 seeds
  per leg; ratio = armed / control.
- **Wall numbers**: national / table / wins, wave-4/5 unlocks,
  median survival — reported BOTH ways: the analyzer's
  standing-based wall (national = standing ≥ 200) AND the
  panel's scaleRank-based national (scaleRank ≥ 2, end + ever
  from the corpora). The scaleRank number is the run's
  canonical "national reached".

## Primary metric + GO bar (frozen)

Primary metric: **launched wave-4+ plans per seed, any-commit
definition** (analyzer `launched` bucket, per-seed counts, armed
leg).

GO iff ALL hold:

1. **Launched plans on ≥3 of 8 seeds** (at least one `launched`
   instance in at least 3 seeds — the dawnbid instrument leg
   launched on 1 of 8 seeds under competent, the profilegate
   armed leg launched on 1 of 8 seeds under any-commit; the
   gate must move more than the one-seed mid-day baseline).
2. **Cost bar clean per scalemetric:** median survival ratio
   ≥ 0.8 (B1) AND armed starvation totals ≤ control + 2 (B3
   totals) AND armed arm-only starvation ≤ control arm-only + 2
   (B3 arm-only).
3. **Instrument valid:** analyzer classification bars green
   (≥90% classified, 0% `unknown`, 16/16 files parse, 0
   instrument errors), drift smoke clean, proof test green on
   both tips.
4. **Skip-reason coverage:** every `selected-blocked` commit-day
   in the armed leg carries a recorded skip reason or a
   depart-row blocker (no bare `selected-not-executed` days —
   the day-70 gap must not recur); the recorder must classify
   at least one away-as-companion day if any occur (the Diana
   lesson is the recorder's reason to exist).

Pilot 8 seeds before/after; confirm (12–16 seeds) only if pilot
GO. A miss is NO-GO — never re-score against a friendlier metric
mid-run; put metric doubts under "metric review" in the evidence
file. If GO, the gate fix lands as its own commit (proof test +
evidence section); the seed call is reverted first (Decision 1).
If NO-GO, the gate fix is reverted too, before the final commit,
so no trace remains except evidence + instrument.

## Secondary (reported, not judged)

- Full bucket decomposition per leg (all six buckets +
  sub-reasons), per-seed table: plan instances opened, seed
  calls, bid rate, selections, launches (any-commit AND
  dawn-only), churns, departs.
- Skip-reason decomposition per leg (all 11 reasons +
  `no-tick-after-commit` inference), with the holder-away
  status at each commit.
- Wave-4-only launched count alongside wave-4+ (see frozen
  definitions).
- Wall numbers (both legs, both national definitions):
  national / table / wins, wave-4/5 unlocks, median survival.
- Death-cause shares; starvation per-seed; scholar deaths.
- Sense check: quote 2–3 wave-4 fight / depart lines (`log[]`)
  from the armed leg and judge whether launched parties go
  somewhere sensible (a real target, companions present) rather
  than departing to nowhere. Name the fight lines' source
  (seed, day, fighter, monster) and the counts searched.

## Seed bands (verified fresh per the seed-band-freshness skill)

- Pilot: **102011–102018** (8 seeds), control leg first (seed
  call + recorder, gate intact), then armed leg (seed call +
  gate fix + recorder), identical seeds, same policy/horizon.
- Shared with NO sibling arm (Loop B uses a DIFFERENT band,
  102001–102008 — do not use it).
- NEVER 100521–100536 (gorgeprice2 CONFIRM), 190391–190398
  (7redef/guardablate), 190621–190628 (2b-fresh),
  190631–190638 (guardablate-fresh), 190541–190548,
  190561–190568 (task-forbidden bands). Confirm band NOT
  spent: this is a lever pilot; no confirm exists for the
  gate fix.
- Freshness check (2026-11-16, verified by this arm before
  this commit): zero hits for the exact seeds 102011–102018
  in (a) all `*.md` under `evidence/` (all dated preregs
  included), (b) `scripts/*.js`, (c) per-seed filenames under
  `evidence/` (one glob false positive:
  `evidence/2026-10-30/sim-sicktele-b-trace-10201.json` — the
  number is 10201, not in this band), (d) `*.md` under goal
  `hidden_files/`. Neighbouring used bands: 100871–100878
  (profilegate/seedattach pilot), 100861–100868 (dawnbid pilot),
  100821–100828 (vetparty pilot), 100841–100856 (vetparty
  confirm, reserved).

## Horizon, policy, death-awareness, legs

- Horizon 150 days, death-aware (dead villages stop
  simulating), policy **tableseat-nowait**
  (tableseat-nowait.js sha `a11a1abc672e`,
  leanlinkrescue.js sha `53f310aba27a`; env
  `LEANLINKRESCUE=1 TABLESEATNOWAIT=1` for both legs).
  The standing fix marker (`ROSTER CHECK`) is present in
  `src/js/standing.js` on this tree — no swap is needed.
- Control leg on the seed-call tip (instrument + seed call,
  gate intact); armed leg on the gate-fix tip (instrument +
  seed call + gate bypass). Identical seeds. Both SHAs are
  recorded in the evidence file. The judged comparison is
  control vs armed, identical seeds, identical policy.
- Sibling-file note: the control leg touches `src/js/game.js`
  (13-line seed-call insertion at `resolveWildMonsterEncounter`,
  verbatim from `ccf6d869c`); the armed leg additionally touches
  `src/js/villager-agency.js` (the profile-gate carve-out only).
  All other launchdef files are new names under
  `scripts/launchdef-*` and `evidence/2026-11-16/*launchdef*` —
  no overwrite of the profilegate/dawnbid instrument files.

## Determinism legs (frozen — neutrality proof)

- **D1 (repeatability):** armed tip, seed 102011, 60d,
  recorder ON, run twice → identical per-seed JSON
  (deaths/days/endReason/vet5 + all dawnbid rows identical).
- **D2 (wrap neutrality):** armed tip, seed 102011, 60d,
  recorder ON vs recorder OFF
  (`LAUNCHDEF_RECORDER=off`) → identical trajectories
  (deaths/days/endReason/standing/vet5 + daily fingerprints).
  The seed call and the gate fix are game code, not wraps,
  so both are present in both legs — D2 isolates the wraps
  only. The `agencyTick` wrap is included in D2: recorder OFF
  must produce byte-identical trajectories.
- **D3 (drift smoke):** `scripts/vetparty-drift-check.js` over
  the two corpora — first divergence on/after the first
  `v4seeds` day per seed; NO PRE-SEED DRIFT. (The gate fix's
  earliest possible effect is the first launched party after
  the first seed, so the smoke's "first lever-action day" is
  the first `v4seeds` day, exactly as in the dawnbid arm.)

## Proof test

`scripts/test-launchdef-a.js` proves, on synthetic fixtures
and live in-memory runs (no corpus numbers):

- Static: the seed call is present in `src/js/game.js`
  (verbatim VETPARTY block) when `LAUNCHDEF_SEED_CALL=on`
  (default), absent when `off` (post-revert shape — the check
  records "not-built-yet", it does not crash); the gate
  carve-out is present in `src/js/villager-agency.js`
  (PROFILEGATE marker + `party_launch` commit check) when
  `LAUNCHDEF_GATE=on` (default), absent when `off`
  (control shape); the diff for game code touches exactly
  `src/js/game.js` (seed call) + `src/js/villager-agency.js`
  (gate); the wave-4 id set matches `src/data/monsters.json`
  wave 4 exactly (10 ids).
- Unit (classifier, synthetic fixtures — reuses the analyzer's
  `classifySeed`): one fixture per bucket, carried from the
  profilegate proof, PLUS the new-definition fixtures — a
  mid-day-only launch (dawn commit overwritten, part-1
  `party_launch` commit + launch depart row) classifies
  `launched` with commit kind `mid-day part-1` under the
  any-commit definition and `selected-blocked` under the
  dawn-only definition (the proof runs both definitions on the
  SAME fixture and asserts the difference — this is the
  100877-style matched pair at fixture level); one fixture per
  skip reason (`away-as-companion`, `away-on-expedition`,
  `profile-gate-veto`, `not-at-haven`, `night`,
  `danger-gate`, `execute-returned-normal`,
  `no-tick-after-commit`, `other`); precedence
  (blocked-then-launched → launched; skip reason recorded on a
  blocked day beats bare `selected-not-executed`); retarget
  closes the old instance and opens a new one; same-target
  re-seed refreshes (one instance); non-opening seed at hunt
  stage opens nothing. (Fixtures mirror the profilegate proof;
  the classifier's bucket machinery is copied, so these prove
  the copy plus the new definition.)
- Gate (live in-memory): on the armed tip, a non-ranger
  holder with a party_launch commit for today at Haven is
  NOT skipped by the profile gate — `agencyTick` reaches
  `vbrainExecuteDepart` for them (proven by a wrapped
  execute call recording the holder), while the same holder
  with no party_launch commit IS skipped (execute never
  called). Control-shape check: on the seed-call tip (gate
  intact) the same holder is skipped even with the commit.
  (If the live gate fixture cannot be staged deterministically
  in-memory, the proof falls back to the two-leg corpus
  comparison — control leg `selected-not-executed` instances
  for non-rangers vs armed leg launches — and the fallback is
  named in the evidence file, not hidden.)
- Recorder: synthetic fixtures for the skip-row shape (all 11
  reasons + raw state); a live in-memory run proves the
  `agencyTick` wrap records a skip row with a real reason for
  a committed holder who cannot depart (e.g. a holder away on
  expedition at tick time records `away-as-companion` or
  `away-on-expedition`), AND proves the recorder counts a real
  mid-day launch on old-vs-new definition (a proof that only
  shows no-throw proves plumbing, not effect); a live
  in-memory run proves the `vbrainScorePick` wrap records the
  bid + pick without changing the pick.
- Determinism: D1 + D2 as frozen above (seed 102011, 60d).
- GREEN on the seed-call tip before the control leg runs;
  GREEN again on the gate-fix tip before the armed leg runs;
  GREEN again post-revert with `LAUNCHDEF_SEED_CALL=off`
  (and `LAUNCHDEF_GATE=off` for the NO-GO shape).

## Sense-testing

Quote the wave-4 fight / depart lines the recorder captures
(`v4encounters[].log[]`, `dawnbidDeparts`) for 2–3 launched
parties in the armed leg and judge whether the parties read
like parties going somewhere real — a named target, companions
present, a fight that reads like a fight. Name the lines'
source (seed, day, fighter, monster) and the counts searched.
Do not invent fight narrative from kill counts.

## Canon grounding (read before building)

- `docs/CANON.md` — read first.
- `docs/MONSTER-WAVES.md` — wave 4 "The Mirror Draft"
  (standing ≥ 100; bands damage 35–95, HP 850–1500, pierce
  0.2–0.5; readiness wave 4: 3 armored P≥10, 5 armed, 3
  tricks, 1 wave-3+ killer). Wave 5 "The Producers" (standing
  ≥ 200 AND wave-4 faced). Doc drift noted: the doc lists 9
  wave-4 monsters; the data has 10 (herald).
- `docs/PARTY.md` — the party concept this chain test-cases.
- `docs/VILLAGER-BRAIN.md` — the one-brain contract: Phase 1
  (dawn scorer; drive candidates as scorer candidates),
  §9 (win prices / deed gates / readiness bars untouched;
  perception law).
- Prior evidence: `evidence/2026-11-15/sim-profilegate-a.md`
  (§"Why the gate fix did not convert selections" — this arm's
  subject) and `evidence/2026-11-15/sim-dawnbid-a.md`
  (§"The answer: two gates" — the gate's origin);
  coordinator evidence
  `evidence/2026-11-15/sim-scale-onramp-round-0446.md`.

## Metric review (to be filled in the evidence file)

Pre-registered here: the GO bar's launched-seeds threshold
(≥3/8) is set against the dawnbid instrument leg's 1/8 under
competent and the profilegate armed leg's 1/8 under any-commit
on the 100871–100878 band — under tableseat-nowait on the fresh
band the control leg's launched count is unknown until it runs,
and the bar is judged on the ARMED leg alone, not on the
armed-minus-control delta. If the control leg launches on ≥3
seeds by itself (a policy effect, not a gate effect), the review
will say so and the GO will be re-read as "gate adds launches
beyond the control leg's baseline" before any landing. No
re-scoring mid-run: the bars above are the judge.
