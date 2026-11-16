# sim-gateconfirm-a — PREREG (binding)

Run: fleshout-20261116T0825Z (Loop A), axis scale-onramp (converging,
NOT converged), arm sim-gateconfirm-a — CONFIRM round for the
profile-gate bypass. Branch `sim-gateconfirm-a` (worktree
`~/workspace/worktrees/sim-gateconfirm-a`). Base: master `796fa96ca`
at arm start (fast-forwarded from the coordinator evidence commit
`2b552433e` before this prereg was written). Binding prereg: THIS
file — frozen before any judged sim. The instrument (driver,
analyzer, panel builder, proof test) is built AFTER this commit; no
judged numbers exist yet.

## The question, in plain words

The launchdef-a pilot (run 0645Z, `evidence/2026-11-16/sim-launchdef-a.md`)
went PILOT GO: with a re-landed seed call feeding wave-4+ plans, the
profile-gate bypass launched 6 instances on 4 of 8 seeds vs control 3
on 2, on band 102011–102018, 150d death-aware, tableseat-nowait
baseline. The price was +31 deaths armed (528 vs 497), scholar deaths
25 → 34, and the balanced panel read review_required with a deaths
regression_signal (+3.875/run, concentrated on seed 102018). The
frozen cost bar covered starvation + median only — it had no deaths
term. This confirm re-tests the fix on a fresh 12-seed band with a
pre-registered deaths term, and — unlike the pilot — it tests the fix
AS IT LIVES ON MASTER (see Decision 1), not the gate in isolation.

## Prior art (read first)

- `evidence/2026-11-16/sim-launchdef-a.md` + prereg — the PILOT GO,
  the any-commit launch definition, the skip-reason recorder, the
  bucket definitions reused verbatim here, the deaths price, the
  "landing shape is nearly inert without a seed source" warning.
- `evidence/2026-11-15/sim-profilegate-a.md` + prereg — the PILOT
  NO-GO under the dawn-only metric, the gate fix text, the Diana Osei
  away-as-companion lesson.
- `evidence/2026-11-15/sim-dawnbid-a.md` + prereg — the 24-plan
  decomposition, the two gates, the seed-call text.
- `evidence/2026-11-16/sim-scale-onramp-round-0645.md` (coordinator
  evidence) — the pilot GO record.
- `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md` (wave 4 "The
  Mirror Draft"; readiness wave 4: 3 armored P≥10, 5 armed, 3 tricks,
  1 wave-3+ killer — the bar this chain feeds, not changes),
  `docs/PARTY.md`, `docs/VILLAGER-BRAIN.md` (one-brain contract).

## Correction to the task text (recorded, not disputed)

The task cites "commit ed441db06, 18 insertions 1 deletion" for the
gate fix. `ed441db06` is the launchdef-a EVIDENCE commit (6 evidence
files only). The gate fix itself is `ed542bba4` (= `1b28ad555` after
a rebase; same message, same diff): `src/js/villager-agency.js`,
18 insertions, 1 deletion. The bypass is present on master at
`villager-agency.js:383` (PROFILEGATE marker), verified 2026-11-16
by this arm before this commit.

## Design decision 1 — the legs test the LANDING shape (frozen)

The pilot's Decision 1 re-landed the vetparty seed call on BOTH legs
because "a lever run on pure master would classify ~0 plans: a
vacuous result" — dawnbid's control saw 9 wave-4 seed calls from the
remaining call sites and 0 plan instances opened. This confirm
DELIBERATELY does NOT re-land the seed call, per the coordinator's
leg definition for this round:

- **Armed leg = master as-is** (bypass present, `game.js` seed call
  ABSENT — verified: 0 `winPlanSeedFromFight` hits in `src/js/game.js`
  on master).
- **Control leg = master with ONLY the 18-line PROFILEGATE bypass
  reverted in `src/js/villager-agency.js`** (the revert restores the
  single line `if (prof !== 'wanderer' && prof !== 'explorer')
  continue;` and removes the bypass block; nothing else changes).
  The revert is a working-tree state for the control-leg run only,
  restored immediately after (`git checkout -- src/js/villager-agency.js`
  + verify the PROFILEGATE marker is back); the revert diff is
  recorded verbatim in the evidence file.

The judged difference between the legs is therefore exactly the
bypass, in the shape in which it ships. The remaining seed sites
(`villager-agency.js` evaded/fled paths, `win-plan.js:512` avoided
path) stay as they are on master and can still open plans; the
driver records every `winPlanSeedFromFight` call from any site, so
the instrument measures whatever forms.

**Vacuity clause (frozen):** if the two legs together open fewer
than 4 plan instances, the run is reported as VACUOUS/NO-GO under
the frozen bar (launches cannot reach ≥3 seeds) — and the verdict's
meaning is stated plainly: the fix AS LANDED is inert on this band
because plans almost never form without a seed source, NOT that the
gate fails when plans exist (the pilot already proved the gate in
isolation WITH a seed source: 6 launched on 4/8 seeds). A vacuous
NO-GO is a finding about the missing seed source, and the seed
call's fate stays the coordinator's decision — this arm does not
revert anything on master and does not re-land the seed call to
rescue the metric. No re-scoring: the bar below is the judge
whether the corpus is rich or thin.

**Landing consequence, stated up front:** if CONFIRM GO, the fix
already lives on master — this arm's commit is evidence + instrument
only. If CONFIRM NO-GO, the fix stays on master (this arm reverts
nothing); the coordinator decides its fate.

## Design decision 2 — baseline policy is tableseat-nowait (frozen)

The baseline is **the tableseat-nowait policy on identical seeds**
(`scripts/policies/tableseat-nowait.js`, wrapping
`scripts/policies/leanlinkrescue.js`). Env pairing for both legs:
`LEANLINKRESCUE=1 TABLESEATNOWAIT=1` (the policy is default-OFF
without them). This is a REAL tableseat-nowait baseline — default
env collapses to competent. The pilot numbers are prior-art
reference only — NOT this arm's control; this arm re-runs its own
baseline on the fresh band.

## Design decision 3 — the gate change, exactly (frozen)

The profile gate is `src/js/villager-agency.js`, `agencyTick`, the
at-home departure loop. The bypass on master (commit `ed542bba4`,
verbatim from profilegate-a):

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

Untouched, by name — every other launch condition stays exactly as
the code has it (this arm tests ONLY the profile gate, as landed):
gear-up at launch, sick stays home, range-0 can't go, hurt <70 HP
needs medicine or a healer at camp, the holder must be at Haven,
it must not be night, the village-danger expedition gate still
applies, the companion must still be launchable by
`startExpedition`. `vbrainExecuteDepart` itself carries no profile
check and is NOT changed. No win-plan stage, bar, gate, price, or
default changes.

## Design decision 4 — the instruments (frozen)

Copied from the launchdef-a instrument (same code paths, new names
— no overwrite of the launchdef files):

- Driver: `scripts/gateconfirm-driver-20261116.js` (the
  launchdef driver copied EXCEPT: arm/run naming `gateconfirm-a`,
  per-seed files `gateconfirm-a-s<seed>-gateconfirm-a-<control|on>.json`,
  outdirs `perseed-gateconfirm-a-control` / `perseed-gateconfirm-a-on`).
  Same vetfirst T-class instrument, same `v4seeds` / `v4departs` /
  `v4gates` / `v4encounters` recorder, same dawnbid capture rows, same
  `agencyTick` skip-reason recorder producing `launchdefSkips` rows
  (row name kept so the analyzer reads the corpora unchanged);
  policy tableseat-nowait; `LAUNCHDEF_RECORDER=off` skip-switch;
  policy sha recorded. The driver refuses to overwrite an existing
  per-seed file.
- Analyzer: `scripts/analyze-gateconfirm-a.js` (the launchdef
  analyzer copied EXCEPT: output file
  `evidence/2026-11-16/gateconfirm-a-analysis.json`, arm label
  `gateconfirm-a`, corpus bar 24 files (12+12), and the GO section
  computing the confirm bar below — primary metric, cost bar, AND
  the new deaths term). The frozen bucket definitions, precedence,
  and classifier are otherwise UNCHANGED from dawnbid/profilegate/
  launchdef (Correction 2 included; any-commit launch definition).
- Panel: `scripts/build-gateconfirm-panels-20261116.js` (the
  launchdef panel builder adapted: before=control leg, after=armed
  leg, PAIRED seeds, pseudo-policy `gateconfirm-a`, seeds
  102021–102032, 150d). The §15 balanced panel
  (`scripts/balance-panel.js`) is the instrument; the pre-registered
  threshold below is the judge. The compare `.md` is attached to the
  evidence file.
- Drift check: reuse `scripts/vetparty-drift-check.js` verbatim
  (reads `v4seeds` + the T-class daily fingerprints). First
  divergence must fall on/after the first `v4seeds` day per seed in
  the armed leg. (With no seed call on either leg, `v4seeds` days
  are the remaining call sites' days; the smoke still rules out
  pre-seed substrate drift. If a seed has zero `v4seeds` rows on
  both legs, the smoke reads it as identical trajectories — the
  analyzer's seed-call counts make that visible, not hidden.)
- Proof: `scripts/test-gateconfirm-a.js` (new; see below). GREEN on
  the armed tip (gate present, seed call absent) before the armed
  leg runs; GREEN again on the control tip (gate reverted, seed call
  absent) before the control leg runs; GREEN again after the bypass
  is restored.

## Frozen definitions

- **Wave-4 monster ids** (from `src/data/monsters.json`, wave 4;
  10, re-read live by the driver): `congregation`, `strike`,
  `influencer`, `audit`, `reunion`, `suburb`, `eulogy`,
  `algorithm`, `eater`, `herald`. (Doc drift carried from dawnbid:
  `docs/MONSTER-WAVES.md` lists 9, no herald; the data has 10 and
  the data rules.)
- **A seeded wave-4+ plan instance** opens on a `v4seeds` row with
  wave ≥ 4 whose holder does NOT already hold a live wave-4 plan
  (same vid, same target = a refresh, counted once; a later seed
  row for the same vid with a DIFFERENT target while the old
  instance is still open closes the old instance as
  `churned-retargeted` and opens a new instance). A seed row that
  arrives while the holder's plan is at stage hunt/standing/table
  opens NOTHING — recorded as a non-opening seed, not a plan
  instance. Wave-5 targets count as instances (the seed gate is
  wave ≥ 3; the frozen definition counts them — the primary metric
  is "wave-4+ plans", and the wave-4-only count is reported
  alongside).
- **Launched** (the primary-metric event): any-commit per the
  launchdef prereg §4a — a `party_launch` commit for the instance
  on a given day (dawn part 0 OR mid-day refresh part 1 / part 2)
  leads to a `vbrainExecuteDepart` row that day with result
  `launch` and BOTH the inviter's and the companion's expeditions
  started. Dawn-only launched is reported alongside as a secondary
  count.
- **Skip reasons**: the 11-reason taxonomy from the launchdef
  prereg §4b, recorded per (vid, day, part).
- **Starvation cost** (per `scripts/analyze-scale-costbar.js` B3):
  totals = starvation-caused deaths across the 12 seeds
  (`deaths[].cause === 'starvation'`); arm-only = armed-leg
  starvation deaths minus those matched same-seed same-day in the
  control leg.
- **Deaths term (NEW — see GO bar):** total deaths =
  `deaths[].length` summed across the 12 seeds per leg; scholar
  deaths = `deaths[].player === true` summed per leg. A **new death
  mode** = a `deaths[].cause` value present on the armed leg and
  absent from the control leg that is NOT a monster name/id (matched
  case-insensitively against `src/data/monsters.json` ids and names)
  — i.e. a generic/system cause (starvation, thirst, combat,
  expedition, disease, ...) appearing only on the armed leg. Named-
  monster causes (`The Eater`, `Gavel`, ...) are the same class on
  either leg and do not count as a new mode (pilot precedent: armed
  `The Eater` / `Big Big` / `The Suburb` vs control `Gavel` /
  `Hushpuppy` / `The Static Kite`).
- **Median survival**: median `gameDays` across the 12 seeds per
  leg; ratio = armed / control.
- **Wall numbers**: national / table / wins, wave-4/5 unlocks,
  median survival — reported BOTH ways: the analyzer's
  standing-based wall (national = standing ≥ 200) AND the panel's
  scaleRank-based national (scaleRank ≥ 2, end + ever from the
  corpora). The scaleRank number is the run's canonical "national
  reached".

## Primary metric + GO bar (frozen)

Primary metric: **launched wave-4+ plans per seed, any-commit
definition** (analyzer `launched` bucket, per-seed counts, armed
leg).

CONFIRM GO iff ALL hold:

1. **Launched plans on ≥3 of 12 seeds** (at least one `launched`
   instance in at least 3 seeds — the same absolute ≥3-seed bar as
   the pilot, now on 12 seeds).
2. **Cost bar clean:** median survival ratio ≥ 0.8 (B1) AND armed
   starvation totals ≤ control + 2 (B3 totals) AND armed arm-only
   starvation ≤ control arm-only + 2 (B3 arm-only).
3. **Deaths term clean (NEW):** armed−control total deaths ≤ +24
   over 12 seeds (≤ +2.0/run) AND scholar-death delta ≤ +12 AND
   no new death mode (per the frozen definition above). The pilot
   measured +31 deaths over 8 seeds (+3.875/run) and scholar +9 —
   the pilot's rate would BREACH this bar; the confirm's bar is
   deliberately harder, and a breach is CONFIRM NO-GO even if
   launches hold.
4. **Instrument valid:** analyzer classification bars green
   (≥90% classified, 0% `unknown`, 24/24 files parse, 0
   instrument errors), drift smoke clean, proof test green on both
   tips.
5. **Skip-reason coverage:** every `selected-blocked` commit-day
   in the armed leg carries a recorded skip reason or a depart-row
   blocker (no bare `selected-not-executed` days). If the corpus
   opens zero instances this bar is vacuously true and is reported
   as such, not as evidence.

Confirm 12 seeds before/after. A miss is NO-GO — never re-score
against a friendlier metric mid-run; put metric doubts under
"metric review" in the evidence file. If GO, the fix already lives
on master — this arm's commit is evidence + instrument only. If
NO-GO, the fix stays on master; the coordinator decides its fate.

## Secondary (reported, not judged)

- Full bucket decomposition per leg (all six buckets +
  sub-reasons), per-seed table: plan instances opened, seed calls,
  bid rate, selections, launches (any-commit AND dawn-only),
  churns, departs.
- Skip-reason decomposition per leg (all 11 reasons +
  `no-tick-after-commit` inference), with the holder-away status at
  each commit.
- Wave-4-only launched count alongside wave-4+ (see frozen
  definitions).
- Wall numbers (both legs, both national definitions):
  national / table / wins, wave-4/5 unlocks, median survival.
- Death-cause shares; starvation per-seed; scholar deaths; total
  deaths per seed (the deaths term, per-seed, so a single-seed
  concentration like the pilot's 102018 is visible).
- Sense check: quote 2–3 wave-4 fight / depart lines (`log[]`)
  from the armed leg and judge whether launched parties go
  somewhere sensible (a real target, companions present) rather
  than departing to nowhere. Name the fight lines' source (seed,
  day, fighter, monster) and the counts searched. If the armed leg
  launches nothing, sense-test the closest real wave-4 fight in
  the corpora instead and say so plainly.

## Seed bands (verified fresh per the seed-band-freshness skill)

- Confirm: **102021–102032** (12 seeds), armed leg first (master
  as-is), then control leg (bypass reverted), identical seeds, same
  policy/horizon. (Order flipped vs the pilot — the armed leg is
  the untouched tip, so it runs first; the control leg needs the
  working-tree revert.)
- Shared with NO sibling arm (Loop B uses DIFFERENT bands —
  102001–102008, 102101–102108, 102131–102138 — do not use them).
- NEVER 100521–100536 (gorgeprice2 CONFIRM), 190391–190398
  (7redef/guardablate), 190621–190628 (2b-fresh),
  190631–190638 (guardablate-fresh), 190541–190548,
  190561–190568 (task-forbidden bands).
- Freshness check (2026-11-16, verified by this arm before this
  commit, re-verified with `rg` — the coordinator's check
  confirmed independently): zero hits for the exact seeds
  102021–102032 in (a) all `*.md` under `evidence/` (all dated
  preregs included), (b) `scripts/*.js`, (c) per-seed filenames
  under `evidence/` (no files match), (d) `*.md` under goal
  `hidden_files/` — one hit only, and it is NOT a seed:
  `hidden_files/evidence-archive/2026-10-07/run-flesh-out-loop-20261007-0508.md:21`
  names version tags `102032` and `102025` from a 2026-10-07 bump.
  Raw-substring hits in old `.json`/`.jsonl` corpora are floats, not
  seeds (e.g. `28.741020215970007` contains `102021` as a substring;
  the coordinator's `pantryKcal: 102029` example is the same class).
  Neighbouring used bands: 102011–102018 (launchdef pilot),
  102001–102008 (Loop B), 100871–100878 (profilegate/seedattach
  pilot), 100861–100868 (dawnbid pilot).

## Horizon, policy, death-awareness, legs

- Horizon 150 days, death-aware (dead villages stop simulating),
  policy **tableseat-nowait** (env `LEANLINKRESCUE=1
  TABLESEATNOWAIT=1` for both legs). The standing fix marker
  (`ROSTER CHECK`) is present in `src/js/standing.js` on this
  tree — no swap is needed.
- Armed leg on the master tip (gate present, seed call absent);
  control leg on the same tip with ONLY the bypass reverted in
  the worktree. Identical seeds. Both SHAs + the revert diff are
  recorded in the evidence file. The judged comparison is control
  vs armed, identical seeds, identical policy.
- Sibling-file note: the control leg touches `src/js/villager-agency.js`
  only (the 18-line revert, working-tree state, restored after);
  the armed leg touches no game code. All gateconfirm files are new
  names under `scripts/gateconfirm-*` and
  `evidence/2026-11-16/*gateconfirm*` — no overwrite of the
  launchdef/profilegate/dawnbid instrument files.

## Determinism legs (frozen — neutrality proof)

- **D1 (repeatability):** armed tip, seed 102021, 60d, recorder
  ON, run twice → identical per-seed JSON (deaths/days/endReason/
  vet5 + all dawnbid rows identical).
- **D2 (wrap neutrality):** armed tip, seed 102021, 60d, recorder
  ON vs recorder OFF (`LAUNCHDEF_RECORDER=off`) → identical
  trajectories (deaths/days/endReason/standing/vet5 + daily
  fingerprints). The gate fix is game code, not a wrap, so it is
  present in both legs — D2 isolates the wraps only. The
  `agencyTick` wrap is included in D2: recorder OFF must produce
  byte-identical trajectories.
- **D3 (drift smoke):** `scripts/vetparty-drift-check.js` over the
  two corpora — first divergence on/after the first `v4seeds` day
  per seed; NO PRE-SEED DRIFT. (The gate fix's earliest possible
  effect is the first launched party after the first seed, so the
  smoke's "first lever-action day" is the first `v4seeds` day,
  exactly as in the launchdef arm. Seeds with zero `v4seeds` rows
  on both legs read as identical trajectories.)

## Proof test

`scripts/test-gateconfirm-a.js` proves, on synthetic fixtures and
live in-memory runs (no corpus numbers):

- Static: the `game.js` seed call is ABSENT on both tips
  (the landing shape — `VETPARTY (sim-vetparty-a)` marker not in
  `src/js/game.js`); the gate carve-out is present in
  `src/js/villager-agency.js` (PROFILEGATE marker +
  `party_launch` commit check) when `GATECONFIRM_GATE=on`
  (default, armed tip), absent when `off` (control shape); the
  game-code worktree diff is the gate only (no `src/js/game.js`
  change); the wave-4 id set matches `src/data/monsters.json`
  wave 4 exactly (10 ids).
- Unit (classifier, synthetic fixtures — reuses the analyzer's
  `classifySeed`): one fixture per bucket, carried from the
  launchdef proof, PLUS the new-definition fixtures — the
  mid-day-only launch classifies `launched` under any-commit and
  `selected-blocked` under dawn-only; one fixture per skip reason;
  precedence (blocked-then-launched → launched; skip reason
  recorded on a blocked day beats bare `selected-not-executed`);
  retarget closes the old instance and opens a new one;
  same-target re-seed refreshes (one instance); non-opening seed
  at hunt stage opens nothing.
- Deaths term (NEW, unit): synthetic per-seed death lists prove
  the term computation — total-delta, scholar-delta, and the
  new-mode detector (an armed-only generic cause breaches; an
  armed-only named-monster cause does not; a control-only cause
  does not breach).
- Gate (live in-memory): on the armed tip, a non-ranger holder
  with a party_launch commit for today at Haven is NOT skipped by
  the profile gate — `agencyTick` reaches `vbrainExecuteDepart`
  for them (proven by a wrapped execute call recording the
  holder), while the same holder with no party_launch commit IS
  skipped (execute never called). Control-shape check: on the
  control tip (gate reverted) the same holder is skipped even with
  the commit. (If the live gate fixture cannot be staged
  deterministically in-memory, the proof falls back to the two-leg
  corpus comparison and the fallback is named in the evidence
  file, not hidden.)
- Recorder: synthetic fixtures for the skip-row shape (all 11
  reasons + raw state); a live in-memory run proves the
  `agencyTick` wrap records a skip row with a real reason for a
  committed holder who cannot depart (e.g. a holder away on
  expedition at tick time records `away-as-companion` or
  `away-on-expedition`), AND proves the recorder counts a real
  mid-day launch on old-vs-new definition; a live in-memory run
  proves the `vbrainScorePick` wrap records the bid + pick
  without changing the pick.
- Determinism: D1 + D2 as frozen above (seed 102021, 60d).
- GREEN on the armed tip before the armed leg runs; GREEN again
  on the control tip (gate reverted) before the control leg runs;
  GREEN again after the bypass is restored.

## Sense-testing

Quote the wave-4 fight / depart lines the recorder captures
(`v4encounters[].log[]`, `dawnbidDeparts`) for 2–3 launched
parties in the armed leg and judge whether the parties read like
parties going somewhere real — a named target, companions
present, a fight that reads like a fight. Name the lines' source
(seed, day, fighter, monster) and the counts searched. If the
armed leg launches nothing, sense-test the closest real wave-4
fight in the corpora instead and say so plainly. Do not invent
fight narrative from kill counts.

## Canon grounding (read before building)

- `docs/CANON.md` — read first.
- `docs/MONSTER-WAVES.md` — wave 4 "The Mirror Draft"
  (standing ≥ 100; bands damage 35–95, HP 850–1500, pierce
  0.2–0.5; readiness wave 4: 3 armored P≥10, 5 armed, 3 tricks,
  1 wave-3+ killer). Wave 5 "The Producers" (standing ≥ 200 AND
  wave-4 faced). Doc drift noted: the doc lists 9 wave-4
  monsters; the data has 10 (herald).
- `docs/PARTY.md` — the party concept this chain test-cases.
- `docs/VILLAGER-BRAIN.md` — the one-brain contract: Phase 1
  (dawn scorer; drive candidates as scorer candidates), §9 (win
  prices / deed gates / readiness bars untouched; perception law).
- Prior evidence: `evidence/2026-11-16/sim-launchdef-a.md` (§"The
  lever, in plain words" + §"Metric review" — this arm's subject
  and its deaths-term gap) and
  `evidence/2026-11-15/sim-dawnbid-a.md` (§"The answer: two
  gates" — the gate's origin).

## Metric review (to be filled in the evidence file)

Pre-registered here: the GO bar's launched-seeds threshold (≥3/12)
is the pilot's absolute ≥3-seed bar carried onto 12 seeds — the
control leg's launched count on the fresh band is unknown until it
runs, and the bar is judged on the ARMED leg alone, not on the
armed-minus-control delta. If the control leg launches on ≥3 seeds
by itself (a policy effect, not a gate effect), the review will say
so and the GO will be re-read as "gate adds launches beyond the
control leg's baseline" before any landing. The deaths term is new
and deliberately harder than the pilot's observed price (+3.875/run
would breach +2.0/run): if it breaches while launches hold, the
verdict is NO-GO and the review must say whether the price is
concentrated (one seed, like the pilot's 102018) or spread — the
concentration shapes the coordinator's next call. If the corpus
opens ~0 instances, the review must say the confirm tested the
landing shape and the fix is inert without a seed source — not
that the gate fails. No re-scoring mid-run: the bars above are
the judge.
