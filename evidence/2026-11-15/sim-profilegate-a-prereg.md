# sim-profilegate-a — PREREG (binding)

Run: fleshout-20261116T0446Z (Loop A), axis scale-onramp, arm
sim-profilegate-a — LEVER: launched party plans (bid + selected,
at party_launch stage) bypass the non-ranger profile gate in the
depart path. Branch `sim-profilegate-a` (worktree
`~/workspace/worktrees/sim-profilegate-a`). Base: master
`d39ce6e8c` at arm start. Binding prereg: THIS file — frozen before
any judged sim. The instrument (driver, analyzer, panel builder,
proof test) is built AFTER this commit; no judged numbers exist yet.

## The question, in plain words

Villagers who survive a run-in with a wave-4 monster do remember it,
and at dawn they pick the return trip every single time it is offered
— but the wanting never becomes going. The 0315Z dawnbid DIAG
(`evidence/2026-11-15/sim-dawnbid-a.md`) decomposed 24 seeded
wave-4+ plans: launched 1 (4.2%), target-killed 2, selected-blocked
8, candidate-not-bid 13. ALL 8 selected-blocked holders were
non-rangers: the dawn scorer bids `party_launch` for any plan holder,
but the departure loop (`agencyTick` in `src/js/villager-agency.js`)
skips anyone who is not a wanderer/explorer BEFORE it ever calls
`vbrainExecuteDepart` — so the commit can never execute. Brian
Otieno bid 21/21 dawns over 40 days and never departed. The one
launcher was a ranger.

Design call (coordinator's, Steve can overrule): a bid-and-selected
`party_launch` plan is a commitment the dawn scorer already made;
the profile gate should not veto it. This arm tests ONLY that gate:
does letting a committed party_launch holder past the profile check
turn selected-blocked plans into launched parties, without the
village paying for it in starvation or survival?

## Prior art (read first)

- `evidence/2026-11-15/sim-dawnbid-a.md` + prereg — the 24-plan
  decomposition, the instrument, the frozen bucket definitions
  (reused verbatim here), the seed call text.
- `evidence/2026-11-15/sim-vetparty-a.md` + prereg — the 106-seed
  result, the T-class instrument, the drift-check pattern.
- `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md` (wave 4
  "The Mirror Draft"; readiness wave 4: 3 armored P≥10, 5 armed,
  3 tricks, 1 wave-3+ killer — the bar this chain feeds, not
  changes), `docs/PARTY.md`, `docs/VILLAGER-BRAIN.md` (one-brain
  contract: Phase 1 dawn scorer; the brain owns dawn; §9 win
  prices / deed gates / readiness bars untouched; perception law).

## Design decision 1 — the subject only exists with the seed call (frozen)

On current master the world-tick seed call is GONE (vetparty lever
touch point 1, reverted by `7ba893b4b`; dawnbid re-landed it for
measurement and reverted it again by `ce393ec75`). Dawnbid's
control leg saw 9 wave-4 seed calls from the remaining call sites
(gate-'avoided' path, expedition path) and **0 plan instances
opened** — every one bounced off a hunt-stage target-null plan.
A lever run on pure master would classify ~0 plans: a vacuous
result, exactly as dawnbid's prereg warned.

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

Disposition (dawnbid/vetparty precedent): after measurement the
seed call is REVERTED on the branch; the instrument, analyzer,
panel builder, proof test, corpora, and evidence merge
evidence-only plus the gate fix if GO (below). The seed-call text
is preserved verbatim in this prereg and in git history, so any
follow-up re-lands it in one step.

**Landing consequence, stated up front:** if the gate fix is GO,
it lands as its own commit — but on master without a seed source
it is nearly inert (plans almost never form; dawnbid control: 0
instances in 8 seeds). Whether the seed call lands WITH the gate
fix, as a chain repair, is a separate coordinator decision, NOT
made by this arm. This arm judges only the gate. The report and
evidence will say so in plain words.

## Design decision 2 — baseline policy is tableseat-nowait (frozen)

The task brief names the baseline explicitly: **the
tableseat-nowait policy on identical seeds — RE-RUN it on this
band**. This is the loop-standard baseline (convergence tracker:
"shared tableseat-nowait band", "baseline tableseat-nowait on
identical seeds, scalemetric cost bar"). It is NOT competent:
dawnbid ran competent verbatim; this arm runs tableseat-nowait
(`scripts/policies/tableseat-nowait.js`, sha `a11a1abc672e`,
wrapping `scripts/policies/leanlinkrescue.js`, sha
`53f310aba27a`; competent sha `74a890f0844e` for reference).
Env pairing for both legs: `LEANLINKRESCUE=1 TABLESEATNOWAIT=1`
(the policy is default-OFF without them; the seat legs only run
at national+ and the wait leg is omitted entirely — see the
policy header). The 0315Z numbers (national 3/8, table 0,
wins 0, median 138.5d, competent, dawnbid control leg) are
prior-art reference only — NOT this arm's control; this arm
re-runs its own baseline on the fresh band.

## Design decision 3 — the gate change, exactly (frozen)

The profile gate is `src/js/villager-agency.js`, `agencyTick`,
the at-home departure loop:

```js
var prof = this.npcRangeProfile(rid);
if (prof !== 'wanderer' && prof !== 'explorer') continue;
```

Planned change (ONLY this gate): before the `continue`, check
whether this villager holds TODAY's dawn commit with
`winPlanAction === 'party_launch'` (read via the existing
`this.vbrainCommit(rid)` — commit records carry `.day`,
`.kind`, `.winPlanAction`, `.companion`; see
`writeCommit` in `src/js/villager-brain.js`). If so, do NOT
skip: the holder proceeds down the SAME path a ranger takes
(node at Haven, night check, indoor-objective carve-out for
EXPEDITION commits, village-danger gate, `winPlanHavenTick`,
`vbrainExecuteDepart`). The gate check reads the commit only —
no new state, no RNG, no re-decision.

Untouched, by name — every other launch condition stays exactly
as the code has it (the arm tests ONLY the profile gate):
- gear-up at launch (the scorer's `gear_hold` stage; the
  executor's party gear reads),
- sick stays home (`startExpedition` refuses the sick),
- range-0 can't go (`npcMaxDist` 0 → `startExpedition` refuses),
- hurt <70 HP needs medicine or a healer at camp
  (`villagerHealCheck` inside `startExpedition`),
- the holder must be at Haven, it must not be night, the
  village-danger expedition gate still applies, the companion
  must still be launchable by `startExpedition`.
`vbrainExecuteDepart` itself carries no profile check and is NOT
changed. No win-plan stage, bar, gate, price, or default changes.

## The instrument (frozen)

- Driver: `scripts/profilegate-driver-20261115.js` (new — the
  dawnbid driver adapted, not rebuilt: same vetfirst T-class
  instrument, same `v4seeds` / `v4departs` / `v4gates` /
  `v4encounters` recorder, same dawnbid capture rows
  (`dawnbidScores` / `dawnbidDeparts` / `dawnbidCensus` /
  `dawnbidStarts`), with ONLY these changes: policy
  `tableseatNowait` (env pairing above), arm/run/file naming
  `profilegate-a`, `PROFILEGATE_RECORDER=off` skip-switch, and
  the policy sha recorded from tableseat-nowait.js +
  leanlinkrescue.js. Recorder wraps are pure reads plus writes
  to driver-local arrays — no game-state writes, no RNG. The
  driver refuses to overwrite an existing per-seed file.
- Analyzer: `scripts/analyze-profilegate-a.js` (new — the
  dawnbid analyzer copied verbatim EXCEPT: output file
  `evidence/2026-11-15/profilegate-a-analysis.json`, arm label
  `profilegate-a`, plus a GO section computing the primary
  metric and the cost bar from the two corpora — see below).
  The frozen bucket definitions, precedence, and classifier are
  UNCHANGED from dawnbid (Correction 2 included: stage
  advancement is history, not churn; `target-killed` bucket;
  `selected-not-executed` sub-reason). The analyzer takes
  `<armedDir> [controlDir]`; its classification bars are
  instrument-validity bars, not the GO bar.
- Panel: `scripts/build-profilegate-panels-20261115.js` (new —
  the vetparty panel builder adapted: before=control leg,
  after=armed leg, PAIRED seeds, pseudo-policy
  `profilegate-a`, seeds 100871–100878, 150d). The §15 balanced
  panel (`scripts/balance-panel.js`) is the instrument; the
  pre-registered threshold below is the judge. The compare `.md`
  is attached to the evidence file.
- Drift check: reuse `scripts/vetparty-drift-check.js` verbatim
  (reads `v4seeds` + the T-class daily fingerprints — this
  driver's corpora carry both). First divergence must fall
  on/after the first `v4seeds` day per seed in the armed leg.
  The gate fix can only act after a plan exists, which requires
  a seed — so any earlier divergence is substrate drift, not a
  lever effect.
- Proof: `scripts/test-profilegate-a.js` (new; see below).
  GREEN on the seed-call tip (control anchor) before the
  control leg runs; GREEN again on the gate-fix tip before the
  armed leg runs; GREEN again post-revert with
  `PROFILEGATE_SEED_CALL=off` (not-built shape).

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
- **Launched** (the primary-metric event): a dawn `party_launch`
  commit for the instance AND the execute call started
  expeditions for BOTH the inviter and the companion (the
  dawnbid bucket definition, unchanged). A `launch` row with
  the companion left behind is NOT launched — it is
  `selected-blocked` with sub-reason `companion-not-started`.
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

Primary metric: **launched wave-4+ plans per seed** (analyzer
`launched` bucket, per-seed counts, armed leg).

GO iff ALL hold:

1. **Launched plans on ≥3 of 8 seeds** (at least one `launched`
   instance in at least 3 seeds — the dawnbid instrument leg
   launched on 1 of 8 seeds under competent; the gate must move
   more than the one-ranger baseline).
2. **Cost bar clean per scalemetric:** median survival ratio
   ≥ 0.8 (B1) AND armed starvation totals ≤ control + 2 (B3
   totals) AND armed arm-only starvation ≤ control arm-only + 2
   (B3 arm-only).
3. **Instrument valid:** analyzer classification bars green
   (≥90% classified, 0% `unknown`, 16/16 files parse, 0
   instrument errors), drift smoke clean, proof test green on
   both tips.

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
  calls, bid rate, selections, launches, churns, departs.
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

- Pilot: **100871–100878** (8 seeds), control leg first (seed
  call + recorder, gate intact), then armed leg (seed call +
  gate fix + recorder), identical seeds, same policy/horizon.
- Shared with sibling arm sim-seedattach-a (DIAG, instrument
  only — no game-code change, disjoint file names
  `seedattach-*` vs `profilegate-*`; no merge sequencing
  needed). Noted here per the task brief.
- NEVER 100521–100536 (gorgeprice2 CONFIRM), 190391–190398
  (7redef/guardablate), 190621–190628 (2b-fresh),
  190631–190638 (guardablate-fresh), 190541–190548,
  190561–190568 (task-forbidden bands). Confirm band NOT
  spent: this is a lever pilot; no confirm exists for the
  gate fix.
- Freshness check (2026-11-16, verified by this arm before
  this commit): zero hits for the exact seeds 100871–100878
  in (a) all `*.md` under `evidence/`, (b) `scripts/*.js`,
  (c) per-seed filenames under `evidence/` (no `10087*`
  file). A broad `10087[1-8]` sweep over goal
  `hidden_files/` returns only decimal-fragment false
  positives in old October corpus JSON (a kcal float, a
  `"pantry": 100878` kcal value, `"dutyPreserved": 100876`)
  and zero seed-band usage. Neighbouring used bands:
  100821–100828 (vetparty pilot), 100841–100856 (vetparty
  confirm, reserved), 100861–100868 (dawnbid pilot).

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
  The sibling arm sim-seedattach-a is instrument-only — no
  divergent game-code commits to sequence. All other
  profilegate files are new names under `scripts/profilegate-*`
  and `evidence/2026-11-15/*profilegate*` — no overwrite of the
  dawnbid instrument files.

## Determinism legs (frozen — neutrality proof)

- **D1 (repeatability):** armed tip, seed 100871, 60d,
  recorder ON, run twice → identical per-seed JSON
  (deaths/days/endReason/vet5 + all dawnbid rows identical).
- **D2 (wrap neutrality):** armed tip, seed 100871, 60d,
  recorder ON vs recorder OFF
  (`PROFILEGATE_RECORDER=off`) → identical trajectories
  (deaths/days/endReason/standing/vet5 + daily fingerprints).
  The seed call and the gate fix are game code, not wraps,
  so both are present in both legs — D2 isolates the wraps
  only.
- **D3 (drift smoke):** `scripts/vetparty-drift-check.js` over
  the two corpora — first divergence on/after the first
  `v4seeds` day per seed; NO PRE-SEED DRIFT. (The gate fix's
  earliest possible effect is the first launched party after
  the first seed, so the smoke's "first lever-action day" is
  the first `v4seeds` day, exactly as in the dawnbid arm.)

## Proof test

`scripts/test-profilegate-a.js` proves, on synthetic fixtures
and live in-memory runs (no corpus numbers):

- Static: the seed call is present in `src/js/game.js`
  (verbatim VETPARTY block) when `PROFILEGATE_SEED_CALL=on`
  (default), absent when `off` (post-revert shape — the check
  records "not-built-yet", it does not crash); the gate
  carve-out is present in `src/js/villager-agency.js`
  (PROFILEGATE marker + `party_launch` commit check) when
  `PROFILEGATE_GATE=on` (default), absent when `off`
  (control shape); the diff for game code touches exactly
  `src/js/game.js` (seed call) + `src/js/villager-agency.js`
  (gate); the wave-4 id set matches `src/data/monsters.json`
  wave 4 exactly (10 ids).
- Unit (classifier, synthetic fixtures — reuses the copied
  analyzer's `classifySeed`): one fixture per bucket —
  launched; selected-blocked × each named sub-reason;
  bid-not-selected; plan-churned-before-dawn × each churn
  sub-reason; candidate-not-bid × each sub-reason;
  precedence (blocked-then-launched → launched);
  retarget closes the old instance and opens a new one;
  same-target re-seed refreshes (one instance); non-opening
  seed at hunt stage opens nothing. (Fixtures mirror the
  dawnbid proof; the classifier is copied unchanged, so the
  fixtures prove the copy, not a new classifier.)
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
- Recorder: synthetic fixtures for the three dawnbid row
  shapes (score / depart / census); a live in-memory run
  proves the `vbrainScorePick` wrap records the bid + pick
  without changing the pick.
- Determinism: D1 + D2 as frozen above (seed 100871, 60d).
- GREEN on the seed-call tip before the control leg runs;
  GREEN again on the gate-fix tip before the armed leg runs;
  GREEN again post-revert with `PROFILEGATE_SEED_CALL=off`
  (and `PROFILEGATE_GATE=off` for the NO-GO shape).

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
- Prior evidence: `evidence/2026-11-15/sim-dawnbid-a.md`
  (§"The answer: two gates" — this arm's subject) and
  `evidence/2026-11-15/sim-vetparty-a.md` (the seed call's
  origin as a lever touch point); coordinator evidence
  `evidence/2026-11-15/sim-scale-onramp-round-0315.md`.

## Metric review (to be filled in the evidence file)

Pre-registered here: the GO bar's launched-seeds threshold
(≥3/8) is set against the dawnbid instrument leg's 1/8 under
competent — under tableseat-nowait the control leg's launched
count is unknown until it runs, and the bar is judged on the
ARMED leg alone, not on the armed-minus-control delta. If the
control leg launches on ≥3 seeds by itself (a policy effect,
not a gate effect), the review will say so and the GO will be
re-read as "gate adds launches beyond the control leg's
baseline" before any landing. No re-scoring mid-run: the bars
above are the judge.
