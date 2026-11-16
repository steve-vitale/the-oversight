# sim-companionpool-b — PREREG (binding)

Run: fleshout-loop-b-20261116T0530Z (Loop B), axis winnability chain, arm
sim-companionpool-b — DIAG: the companion-pool decomposition for the
wave-4 re-engagement chain (sim-findings #2404 follow-up; dawnbid next
diagnostic #1). Branch `sim-companionpool-b` (worktree
`~/workspace/worktrees/sim-companionpool-b`). Base: master `97ff03342`
at arm start (coordinator note: master has since moved — journey r220 /
r221 landings, now `3853257d6`; NO rebase mid-run unless the coordinator
says so; the coordinator rebases at landing and re-runs proofs).
Binding prereg: THIS file — frozen before any judged sim. The instrument
(driver, analyzer, proof test) is built AFTER this commit; no judged
numbers exist yet.

## The question, in plain words

Dawnbid proved 11 of 24 seeded wave-4 plans sit at party stage with no
eligible companion (dawn bids `party_wait` instead), and even the one
ranger holder (owen_smith, 49 scored dawns) never found one. This DIAG
decomposes, per scored dawn, WHICH `findCompanion` condition fails — no
ranger at Haven, trust under 15, everyone away or engaged, nobody at the
same node, or someone on expedition — plus the eligible-pool size and the
ranked pick when one exists.

## Prior art (read first)

- `evidence/2026-11-15/sim-dawnbid-a.md` + prereg — the instrument this
  arm EXTENDS (reuse `scripts/dawnbid-driver-20261115.js`,
  `scripts/analyze-dawnbid-a.js`, `scripts/test-dawnbid-a.js`,
  `scripts/vetparty-drift-check.js`; extend, don't rebuild). Dawnbid
  result: 24 instances — launched 1, target-killed 2, selected-blocked 8
  (all `selected-not-executed`, all non-ranger holders),
  candidate-not-bid 13 (11 `no-companion-party`, 2 `not-scored`).
- `evidence/2026-11-15/sim-vetparty-a.md` + prereg — the 106-seed result,
  the armed/control corpora, the drift-check pattern.
- `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md` (wave 4 "The
  Mirror Draft"; the doc lists 9 wave-4 ids, the data has 10 and the data
  rules), `docs/PARTY.md`, `docs/VILLAGER-BRAIN.md` (one-brain contract:
  Phase 1 dawn scorer; the brain owns dawn).

## Design decision 1 — the subject only exists with the seed call (frozen)

Same as dawnbid (verified on this tree before this prereg: on current
master the world-tick seed call is GONE — reverted by commit
`7ba893b4b`). The instrument leg re-lands ONLY the vetparty seed call,
verbatim — the 13-line block removed by `7ba893b4b` in
`resolveWildMonsterEncounter`, `src/js/game.js`, beside the existing
return-to-fight sighting block (anchor `94721f769`, blob `a66d45a5e`):
after a `fieldFight` / `aidFight` vs a wave-4+ monster ending `vFlee`,
call `winPlanSeedFromFight(vid, mdef, 'fled')`; excluded for raids
(`opts.raid`) and aid fights (`wViaAid`); wave-gated inside the seed
(wave >= 3). This is a DIAG reproduction of the subject, NOT a balance
change: it changes no number, no bar, no gate, no price, no default.
After measurement the seed call is REVERTED on the branch; the
instrument, analyzer, proof test, corpora, and evidence merge
evidence-only. The seed-call text is preserved verbatim in the dawnbid
prereg and in git history (commit `f0fb6fc18`); this prereg records the
source commit `ccf6d869c` / anchor `94721f769` again so the re-land is
one step.

## Design decision 2 — the two findCompanions, and which one is recorded (frozen)

Read from the code before this prereg (not assumed):

- `src/js/villager-brain.js:129` `findCompanion(self, vid, hx, hy)` —
  called by `winPlanCands` (same module, line 215), which feeds the dawn
  scorer through `vbrainFeedExtras`. THIS is the party_launch path: the
  dawn bid `party_launch` exists exactly when this function returns a
  companion for a party/hunt/standing/table-stage plan. The decomposition
  is recorded against THIS definition.
- `src/js/win-plan.js:177` `findCompanion(self, vid, hx, hy)` — called by
  `winPlanDepart`'s `launchParty` (line 359), the depart gate. A second
  definition exists; the two are ELIGIBILITY-EQUIVALENT (verified by
  reading both loops): same roster order, same check order (self/scholar,
  alive, away, trust >= 15 with undefined defaulting to 10, same node,
  not engaged, profile wanderer/explorer, not on expedition), same
  `companionRank` ranking. The only differences are mechanical: the
  brain version reads the node via `self.npcNode(cid)` directly (and
  `continue`s on exception), the win-plan version via its local `atHaven`
  helper (which is the same `npcNode` nx/ny equality); the brain version
  reads dead via `self.getPerson(cid)`, the win-plan version via its
  local `alive` helper (same `getPerson` + `!dead` read). No semantic
  difference in any check. Noted here so a later reader does not mistake
  the twin for a second gate.
- Reference node: `hx, hy` is the Haven tile (`v.px ?? 4, v.py ?? 4` —
  `villager-objectives.js` `objTick`), NOT the holder's node. The driver
  replica reads the Haven tile from `Game.state.village.px/py`
  (fallback 4,4) and records the holder's own node separately, so a
  holder away from Haven is visible in the row.
- Ranking: `Game.companionRank(vid, elig, {context: 'party'})`
  (`src/js/companion-score.js`, OVE-54) is a pure read — no
  `Math.random`, no writes — so the recorder may call it to obtain the
  ranked pick without perturbing the run. The driver records the full
  ranked order `[{id, s}]` plus the pick.

## Design decision 3 — the pool capture needs NO game-code hook (frozen)

Same pattern as dawnbid: the driver wraps `vbrainScorePick` (the Game
method that receives the full candidate list) and, for a wave-4+ plan
holder at a scored dawn (part 0), computes the pool replica from pure
reads AFTER the original call returns (scoring writes no roster/trust/
away state, so the post-call read is the scoring-time pool). No hook is
added to `findCompanion` (module-internal in both modules) or to the
scorer. The only game-code touch in this arm is the seed call of
Decision 1.

## The instrument (frozen)

- Driver: `scripts/companionpool-driver-20261116.js` (new — the dawnbid
  driver extended, not rebuilt: same vetfirst T-class instrument, same
  `v4seeds` / `v4departs` / `v4gates` / `v4encounters` recorder, same
  `dawnbidScores` / `dawnbidDeparts` / `dawnbidCensus` /
  `dawnbidStarts`, PLUS the companion-pool rows below). Recorder wraps
  are pure reads plus writes to driver-local arrays — no game-state
  writes, no RNG. The driver refuses to overwrite an existing per-seed
  file. `COMPANIONPOOL_RECORDER=off` skips installing the wraps (used
  by determinism leg D2).
- Companion-pool rows (`companionPool`) — one per scored dawn (part 0)
  for a plan holder while a wave-4+ plan is live (same liveness rule as
  the dawnbid classifier: `planIsWave4`, plan target matches the open
  instance): {day, part, vid, target, stage, holderProfile
  (`npcRangeProfile(vid)` — record only; the profile gate is Loop A's
  arm, this arm DOES NOT change depart behavior), holderNode
  (`npcNode(vid)`), haven {nx, ny}, rosterN, counts (first-fail per
  roster member, IN the brain `findCompanion` check order):
  selfOrScholar, dead, away, trustLow, notAtHaven, engaged,
  notRanger, onExped, eligible; eligible [vids, roster order];
  rankedOrder [{id, s}], rankedPick (or null); bidCompanion (the
  `party_launch` candidate's companion on that dawn, if bid, else
  null); agree (rankedPick === bidCompanion whenever a bid exists)}.
  First-fail order is the brain loop's order: a member failing an
  earlier check is counted there, never at a later check — so the
  counts sum to rosterN and each condition's count is the number of
  members it alone excludes at its position.
- Analyzer: `scripts/analyze-companionpool-b.js` (new). Reuses the
  dawnbid classifier (`scripts/analyze-dawnbid-a.js` `classifySeed`,
  imported, not copied) for the plan-instance buckets, then decomposes
  the pool rows joined to those instances (definitions below), prints
  the per-condition table + eligible-pool histogram + per-seed table +
  wall numbers, writes
  `evidence/2026-11-16/companionpool-b-analysis.json`, exits non-zero
  on any `unknown` scored dawn.
- Drift check: reuse `scripts/vetparty-drift-check.js` verbatim (it
  reads `v4seeds` + the T-class daily fingerprints — this driver's
  corpora carry both). First divergence must fall on/after the first
  `v4seeds` day per seed.
- Proof: `scripts/test-companionpool-b.js` (new; see below). GREEN on
  the instrument tip before the instrument leg runs; GREEN again
  post-revert with `COMPANIONPOOL_SEED_CALL=off` (not-built shape).

## Frozen definitions

- **Wave-4 monster ids** (from `src/data/monsters.json`, wave 4; 10,
  re-read live by the driver): `congregation`, `strike`, `influencer`,
  `audit`, `reunion`, `suburb`, `eulogy`, `algorithm`, `eater`,
  `herald`. (Doc drift carried from vetparty/dawnbid:
  `docs/MONSTER-WAVES.md` lists 9, no herald; the data has 10 and the
  data rules.)
- **A seeded wave-4+ plan instance**: exactly the dawnbid definition
  (Correction 2 applied): opens on a `v4seeds` row with wave >= 4 whose
  holder does NOT already hold a live wave-4 plan (same vid, same
  target = a refresh; different target while open closes the old as
  `churned-retargeted`); a seed row while the holder's plan is at stage
  hunt/standing/table opens NOTHING (non-opening seed). Wave-5 targets
  (seed gate wave >= 3) count as instances, as in dawnbid; the
  wave-4-only split is reported as a secondary cut.
- **A scored dawn** (pool denominator): a `dawnbidScores` row with
  part 0 for the holder while the plan instance is live (day >=
  seedDay, day <= closeDay when closed), with the row's plan target
  equal to the instance target — the same join the dawnbid classifier
  uses for `myScores`.
- **A classified scored dawn**: exactly one `companionPool` row joins
  to it (same day, part 0, vid), the row parses, its counts sum to its
  rosterN, and — whenever the dawn's score row carries a
  `party_launch` bid — `agree` is true (the replica's ranked pick
  equals the real `findCompanion` pick the scorer saw). Any scored
  dawn failing any of these is `unknown`.
- **Per-condition failure shares** (secondary, reported): pooled
  first-fail counts per condition over all classified scored dawns,
  as a share of all roster-member checks (sum of rosterN over dawns)
  AND as a share of dawns where the condition is the binding blocker
  (eligible == 0 and the condition has the largest fail count on that
  dawn; ties name all tied conditions).
- **Eligible-pool size distribution**: histogram of `eligible` counts
  per classified scored dawn (0, 1, 2, 3+), plus the share of dawns
  with eligible == 0 split by holder profile (ranger vs non-ranger).
- **Instrument error:** any non-empty `instrumentErrors`, any
  per-seed file failing to parse, any seed whose unlock/kill fields
  disagree (same rule as the vetparty/dawnbid preregs).

## Primary metric + GO bar (frozen)

Primary metric: **share of plan-holder scored dawns classified**
(pool decomposition complete, unknown 0).

GO (instrument validity) iff ALL hold:

1. **>=90% of plan-holder scored dawns classified, 0% in
   `unknown`.** (One pool row per scored dawn is expected, so 100%
   is expected; the 90% bar allows analyzer-edge misses, but
   `unknown` must be exactly 0.)
2. **Corpus 16/16 files parse** (8 control + 8 instrument legs,
   identical seeds).
3. **Neutrality proven:** drift smoke clean (no pre-seed divergence
   on any seed) AND determinism legs green (D1 + D2 below).
4. **Proof test `scripts/test-companionpool-b.js` green.**

This is a DIAG: GO means the instrument is valid and the decomposition
is measured. It is NOT a lever GO — no game change is judged, and
nothing ships from this arm except the instrument + evidence.

## Secondary (reported, not judged)

- Per-condition failure shares (both denominators above); the
  decomposition table the next lever arm reads first.
- Eligible-pool size distribution (histogram + ranger split).
- Per-seed table: plan instances opened, seed calls, scored dawns,
  classified dawns, eligible==0 dawns, launches.
- Wall numbers (both legs): national / table / wins, wave-4/5
  unlocks, median survival.
- Sense check: quote 2–3 wave-4 fight lines (`log[]`) from the
  instrument leg and judge whether the fights read like fights (as
  dawnbid did).

## Seed bands (verified fresh per the seed-band-freshness skill)

- Pilot: **102001–102008** (8 seeds), control leg first (recorder
  only, instrument tip — no seed call), then instrument leg (seed call
  + recorder, instrument tip), identical seeds, same policy/horizon.
- NEVER 100621–100636, 100861–100868, 100821–100828, 100721–100728,
  100761–100768, 10100–10139, 190391–190398, 190621–190628,
  190631–190638, 190541–190548, 190561–190568.
- Freshness check (2026-11-16, verified by this arm before this
  commit — scope and result): ZERO hits for the exact seeds
  102001–102008 (word-boundary grep) in (a) all `*.md` under
  `evidence/` — every dated prereg, evidence file, and note; (b)
  `scripts/*.js` (driver band literals); (c) per-seed filenames under
  `evidence/` (`find evidence -name "*10200*"` returns nothing);
  (d) the goal `hidden_files/` tracker, lever-claims, and findings
  `.md` (word-boundary grep: no match). The only hits anywhere are
  this arm's own prereg (naming the band) and the known false-positive
  class the coordinator reported: `pantryKcal` / `need` values of
  10200 and a "Garden harvest" of 102000 inside October census JSONs
  (`evidence/2026-10-12/kcal-r8-*.json`,
  `evidence/2026-10-13/feastscale-r13-pilot.json`,
  `plentyb-sweep.json`, `r6-baseline.json`, `sim-action-telemetry.json`,
  `sim-courtkill-b.json`) — kcal values, not seeds. Neighbouring used
  bands: 100861–100868 (dawnbid pilot), 100821–100828 (vetparty pilot),
  100621–100636 (courtship reconfirm). Band 102001–102008 is FRESH.

## Horizon, policy, death-awareness, legs

- Horizon 150 days, death-aware (dead villages stop simulating),
  policy **competent verbatim** (`scripts/policies/competent.js`, sha
  `74a890f0844e` — verified by this arm with sha256sum before this
  commit; the driver's own-policy record carries the sha it ran
  under). The standing fix marker (`ROSTER CHECK`) is present in
  `src/js/standing.js` on this tree — no swap is needed.
- Control anchor = the instrument commit (driver + analyzer + proof
  test, seed call ABSENT); instrument anchor = the seed-call commit
  (instrument + the 13-line seed call). Both SHAs are recorded in the
  evidence file. The judged comparison is control (recorder only) vs
  instrument (recorder + seed call), identical seeds.

## Determinism legs (frozen — neutrality proof)

- **D1 (repeatability):** instrument tip, seed 102001, 60d, recorder
  ON, run twice → identical per-seed JSON (deaths/days/endReason/
  vet5 + all dawnbid + companionPool rows identical).
- **D2 (wrap neutrality):** instrument tip, seed 102001, 60d,
  recorder ON vs recorder OFF (`COMPANIONPOOL_RECORDER=off`) →
  identical trajectories (deaths/days/endReason/standing/vet5 +
  daily fingerprints). The seed call is game code, not a wrap, so it
  is present in both legs — D2 isolates the wraps only.
- **D3 (drift smoke):** `scripts/vetparty-drift-check.js` over the
  two corpora — first divergence on/after the first `v4seeds` day per
  seed; NO PRE-SEED DRIFT. (The seed call is the instrument's first
  possible divergence cause, so the smoke's "first lever-action day"
  is the first `v4seeds` day, exactly as in the vetparty/dawnbid arms.)

## Proof test

`scripts/test-companionpool-b.js` proves, on synthetic fixtures and
live in-memory runs (no corpus numbers):

- Static: the seed call is present in `src/js/game.js` (verbatim
  VETPARTY block) when `COMPANIONPOOL_SEED_CALL=on` (default), absent
  when `off` (post-revert shape — the check records "not-built-yet",
  it does not crash); the driver wraps exist (`vbrainScorePick`,
  `vbrainExecuteDepart`, `winPlanSeedFromFight`, `startExpedition`,
  `companionPool` — driver-side); the diff for game code touches
  exactly `src/js/game.js` (the seed call only); the wave-4 id set
  matches `src/data/monsters.json` wave 4 exactly (10 ids).
- Unit (pool classifier, synthetic fixtures): one fixture per failing
  condition (selfOrScholar, dead, away, trustLow, notAtHaven, engaged,
  notRanger, onExped) as the sole blocker; eligible-pool cases
  (eligible 0 / 1 / 2+ with ranked pick = first ranked id; ranked
  order respected, not roster order); replica agreement (bidCompanion
  == rankedPick → classified; mismatch → unknown); missing pool row
  for a scored dawn → unknown; counts not summing to rosterN →
  unknown; precedence (a dawn with a bid AND an eligible pool is
  still classified by the pool row, not by the bid).
- Recorder: synthetic fixtures for the pool row shape; a live
  in-memory run proves the `vbrainScorePick` wrap records a pool row
  without changing the pick.
- Determinism: D1 as frozen above (seed 102001, 60d, twice —
  identical deaths/days/endReason/vet5 + identical dawnbid +
  companionPool rows).
- GREEN on the instrument tip before the instrument leg runs; GREEN
  again post-revert with `COMPANIONPOOL_SEED_CALL=off`.

## Sense-testing

Quote the wave-4 fight lines the recorder captures
(`v4encounters[].log[]`) for 2–3 wave-4 fights in the instrument leg
and judge whether the fights read like fights — and whether the PARTY
reads like a party. Name the fight lines' source (seed, day, fighter,
monster) and the counts searched. Do not invent fight narrative from
kill counts.

## Canon grounding (read before building)

- `docs/CANON.md` — read first.
- `docs/MONSTER-WAVES.md` — wave 4 "The Mirror Draft" (standing >=
  100; readiness wave 4: 3 armored P>=10, 5 armed, 3 tricks, 1
  wave-3+ killer). Doc drift noted: the doc lists 9 wave-4 monsters;
  the data has 10 (herald).
- `docs/PARTY.md` — the party concept this chain test-cases (System
  unlock day 7; trust is not a safety gate for invites — note: the
  win-plan companion path DOES gate on trust >= 15, a different rule
  for a different path).
- `docs/VILLAGER-BRAIN.md` — the one-brain contract: Phase 1 (dawn
  scorer; drive candidates as scorer candidates), Phase 4 (one shared
  `companionScore`; eligibility stays at call sites).
- Prior evidence: `evidence/2026-11-15/sim-dawnbid-a.md` (§"Gate 2 —
  no companion to go with" — this DIAG's subject) and
  `evidence/2026-11-15/sim-vetparty-a.md` (the 106-seed result).

## Metric review (to be filled in the evidence file)

Pre-registered here: if the decomposition lands mostly on one
condition (e.g. notRanger dominating the eligible==0 dawns), the
review will name it with the per-dawn counts and the ranger split; if
the replica disagrees with the real bid on any dawn, the review will
name the dawns and the diverging picks (a replica bug, not a game
result); if the instrument leg's plan-instance count is far below
dawnbid's 24 (different seed band, no party/gate lever), the review
will say so with both counts — the decomposition is judged on the
scored dawns that occur, not on matching 24. No re-scoring mid-run:
the definitions above are the judge.
