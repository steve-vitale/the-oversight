# sim-profileshadow-a — PREREG (binding)

Run: fleshout-20261116T1631Z (Loop A), axis winnability chain, arm
sim-profileshadow-a — DIAG: the SHADOW NUMBERS for the profile-gate
design call (tracker blank #2 — companion pool / the profile-gate
design call). Branch `sim-profileshadow-a` (worktree
`~/workspace/worktrees/sim-profileshadow-a`). Base: worktree HEAD
`35686d860` at arm start (sim-seasoning-b: corpora + analysis +
evidence — DIAG GO; the coordinator rebases at landing and re-runs
proofs).
Binding prereg: THIS file — frozen before any judged sim. The
instrument (driver, analyzer, proof test) is built AFTER this commit;
no judged numbers exist yet.

## The question, in plain words

The companion-pool DIAG is DONE. Poolmarginals proved profile is the
only condition that binds alone at scale: 819/1,043 living members are
non-rangers, 592 bind on profile alone; trust 1.3% never alone, away
never alone, expedition members are all rangers out in the world.
Poolmarginals named the profile gate a DESIGN CALL owned by Loop A:
any fix must move the non-rangers. This arm does NOT decide the gate.
It produces the SHADOW NUMBERS Steve needs to decide it: at each
scored dawn (the same capture points as poolmarginals: the
`vbrainScorePick` wrap), compute the companion pool under three shadow
relaxations by PURE READS ONLY — never write game state, never change
trajectories.

- **S0**: current gates, replicating poolReplica exactly (alive, not
  away, trust >= 15, at Haven, not engaged, profile
  wanderer/explorer, not on expedition).
- **S1**: profile gate DROPPED (any living, non-away, trust >= 15,
  at-Haven, non-engaged, non-expedition member eligible regardless
  of profile).
- **S2**: profile gate WIDENED to admit foragers as well as
  wanderers/explorers.

For each shadow, per scored dawn: eligible count, eligible-0 dawn
share, and would-be-biddable dawns (holder has a live plan + >= 1
shadow-eligible companion). Report per-shadow tables plus the
comparison against ACTUAL launches on the same band. Secondary: the
would-be companion identity distribution under S1/S2 (which profiles
would actually be picked — foragers? homebodies? — via companionRank
on the shadow-eligible set, pure-read).

## Prior art (read first)

- `evidence/2026-11-16/sim-poolmarginals-b.md` + prereg — the marginals
  table, the `members` extension, poolReplica; the instrument this arm
  EXTENDS (extend `scripts/poolmarginals-driver-20261116.js`,
  `scripts/analyze-poolmarginals-b.js`,
  `scripts/test-poolmarginals-b.js`; don't rebuild).
- `evidence/2026-11-16/sim-companionpool-b.md` + prereg — the
  first-fail decomposition; the two findCompanions (brain
  `villager-brain.js:129` party_launch path; win-plan
  `win-plan.js:177` depart-gate twin, eligibility-equivalent).
- `evidence/2026-11-16/sim-seedland-b-prereg.md` — the verbatim
  13-line seed call + frozen definitions; seedland-b itself was NO-GO
  (0 launched-party kills) and the seed call was REVERTED, so the base
  carries NO seed call (verified below).
- `docs/CANON.md` (read first), `docs/PARTY.md`,
  `docs/MONSTER-WAVES.md` (wave 4 "The Mirror Draft"; the doc lists 9
  wave-4 ids, the data has 10 and the data rules).
- CANON GAP (recorded in the seedpaths prereg, not invented): no
  CANON-registered doc covers companion-pool seed paths, departure
  gates, or the pick lottery.

## Enumerated profile values (read from the code, not assumed)

`npcRangeProfile(vid)` (`src/js/villager-agency.js:323-347`) returns
exactly four values, from a score (temperament + goal + age +
ranging aptitude + potential): score >= 5 `explorer`, >= 2
`wanderer`, >= -1 `forager`, else `homebody`. The value is cached in
`agencyState().profiles[vid]`. There is no fifth profile: S2 admits
exactly the `forager` profile on top of S0, and S1 admits all four
(including `homebody` and profile-null members that pass every other
gate — profile-null counts as not-ranger in S0/S2 per the poolReplica
consistency rule, and as eligible in S1 when all other gates pass;
the analyzer reports how many S1-eligible members are profile-null,
so a null-profile windfall is visible, not hidden).

## Design decision 1 — the seed call is INSTRUMENT ONLY (frozen)

Same as poolmarginals/companionpool (verified on this tree before
this prereg: on current base the world-tick seed call is ABSENT —
`grep winPlanSeedFromFight src/js/game.js` returns nothing; the
seedland landing was NO-GO and reverted). The instrument leg re-lands
ONLY the vetparty seed call, verbatim — the 13-line block removed by
`7ba893b4b` in `resolveWildMonsterEncounter`, `src/js/game.js`,
beside the existing return-to-fight sighting block (blob
`a66d45a5e`), inserted immediately before
`if (rec.outcome === 'alreadyDead') {` (line 20935 on this tree,
re-located fresh):

```js
      // VETPARTY (sim-vetparty-a): a villager who FACED a wave-4+ beast
      // and lived — fought it and fled — now knows the type is real,
      // where it is, and that they survived it. That lived knowledge
      // seeds a win-plan re-engagement: go back after that type, with
      // a party. Only vFlee seeds: a kill already advances the plan
      // through winPlanNoteKill, a death ends the villager, a fleeing
      // monster was never faced, and raids/aid fights are defence, not
      // a place to return to. Wave-gated inside the seed (wave >= 3).
      try {
        if (!opts.raid && !wViaAid && rec && rec.outcome === 'vFlee' && this.winPlanSeedFromFight) {
          this.winPlanSeedFromFight(vid, mdef, 'fled');
        }
      } catch (e) {}
```

This is a DIAG reproduction of the subject, NOT a balance change: it
changes no number, no bar, no gate, no price, no default. After
measurement the seed call is REVERTED on the branch; the instrument,
analyzer, proof test, corpora, and evidence merge evidence-only. The
seed-call text is preserved verbatim above and in git history
(`7ba893b4b`, revert of `f0fb6fc18`; poolmarginals re-landed it as
`0f1dc8b80` and reverted as `b9120c1f`).

## Design decision 2 — PROFILEGATE bypass present (pre-condition, verified)

The PROFILEGATE bypass (`ed542bba4`, in `src/js/villager-agency.js`
depart path, line 383 on this tree) is PRESENT on this base, verbatim:
a bid-and-selected `party_launch` commit bypasses the
wanderer/explorer profile skip only; all other launch conditions
still apply. Verified by reading the block before this commit. If it
had been absent this arm would have stopped here. It is present.

## Design decision 3 — the shadow computation (frozen)

The poolmarginals driver's `poolReplica(Game, vid)` computes the
first-fail counts plus the `members` array (one entry per roster
member with the FULL profile: alive, away, trust effective,
trustRaw, node, engaged, profile, onExped, firstFail), read BEFORE
the first-fail order is applied, from the same effective values.
This arm adds, in the SAME `vbrainScorePick` wrap, at the SAME scored
dawn, a `shadow` object on every companionPool row, computed ONLY
from `pool.members` + the row's `haven` tile + the pure-read
`Game.companionRank` (companion-score.js, OVE-54: no `Math.random`,
no writes — verified by reading the module header):

- **S0**: eligible = non-self members with firstFail `eligible`
  (equivalently: alive, not away, trust >= 15, at Haven, not
  engaged, profile wanderer/explorer, not on expedition). Ranked via
  `companionRank(vid, elig, {context: 'party'})`, roster-first
  fallback exactly as poolReplica does. S0 MUST reproduce
  poolReplica's `eligible`/`rankedPick` exactly — the analyzer
  checks set-equality on every classified dawn (see Frozen
  definitions).
- **S1**: eligible = non-self members passing every S0 gate EXCEPT
  profile (alive, not away, trust >= 15, at Haven, not engaged, not
  on expedition). Ranked the same way.
- **S2**: eligible = non-self members passing every S0 gate with the
  profile check widened to wanderer/explorer/forager. Ranked the
  same way.
- Per shadow, the row records: `eligible` (roster order),
  `rankedOrder` ([{id, s}]), `rankedPick`, `rankedVia`,
  `pickProfile` (the ranked pick's profile from the members map,
  null when no pick), `profileCounts` (eligible members by profile
  value: explorer/wanderer/forager/homebody/null).
- Self/scholar members are never shadow-eligible (they never reach
  the checks). Dead members are never shadow-eligible. A member with
  profile null counts as not-ranger in S0/S2 and as eligible in S1
  when all other gates pass.
- The shadow computation writes NOTHING to game state: it reads
  `members` (already captured), calls `companionRank` (pure), and
  writes only to driver-local arrays. D2 must prove identical
  trajectories with the shadow on vs off.

File shape (family precedent — a NEW file per arm extending the
previous driver, not an edit in place):

- Driver: `scripts/profileshadow-driver-20261116.js` (new — the
  poolmarginals driver extended, not rebuilt: same vetfirst T-class
  instrument, same `v4seeds` / `v4departs` / `v4gates` /
  `v4encounters` recorder, same dawnbid bid/census capture, same
  companionPool first-fail + members capture, PLUS the `shadow`
  object on every pool row). Recorder env var
  `PROFILESHADOW_RECORDER` (`off` skips installing the wraps, D2
  leg). `RUN=profileshadow-a`,
  `OUTDIR=perseed-profileshadow-a-<mode>`, `arm: 'profileshadow-a'`.
  The driver refuses to overwrite an existing per-seed file.
- Analyzer: `scripts/analyze-profileshadow-a.js` (new). REQUIRES
  `scripts/analyze-poolmarginals-b.js` (not copied) and reuses its
  `classifyMarginals` + `summarizeMarginals` for the classification,
  first-fail decomposition, marginals, eligible histogram, per-seed
  table, and wall numbers — then computes the shadow tables from the
  raw pool rows' `shadow` objects joined to the marginal-classified
  dawns. `analyze-poolmarginals-b.js` itself is NOT modified by this
  arm.
- Drift check: reuse `scripts/vetparty-drift-check.js` verbatim (it
  reads `v4seeds` + the T-class daily fingerprints — this driver's
  corpora carry both). First divergence must fall on/after the first
  `v4seeds` day per seed.
- Proof: `scripts/test-profileshadow-a.js` (new; see below). GREEN on
  the instrument tip before the instrument leg runs; GREEN again
  post-revert with `PROFILESHADOW_SEED_CALL=off` (not-built shape).

## Frozen definitions

Reused from the poolmarginals prereg (not redefined — the same join,
the same classifier):

- **Wave-4 monster ids** (from `src/data/monsters.json`, wave 4; 10,
  re-read live by the driver): `congregation`, `strike`, `influencer`,
  `audit`, `reunion`, `suburb`, `eulogy`, `algorithm`, `eater`,
  `herald`.
- **A seeded wave-4+ plan instance**: exactly the dawnbid definition
  (Correction 2 applied): opens on a `v4seeds` row with wave >= 4
  whose holder does NOT already hold a live wave-4 plan (same vid,
  same target = a refresh; different target while open closes the old
  as `churned-retargeted`); a seed row while the holder's plan is at
  stage hunt/standing/table opens NOTHING (non-opening seed). Wave-5
  targets (seed gate wave >= 3) count as instances, as in dawnbid;
  the wave-4-only split is reported as a secondary cut.
- **A scored dawn** (pool denominator): a `dawnbidScores` row with
  part 0 for the holder while the plan instance is live (day >=
  seedDay, day <= closeDay when closed), with the row's plan target
  equal to the instance target.
- **A classified scored dawn**: exactly one `companionPool` row joins
  to it (same day, part 0, vid), the row parses, its counts sum to its
  rosterN, its eligible array matches counts.eligible, its rankedPick
  is non-null whenever eligible > 0, and — whenever the dawn's score
  row carries a `party_launch` bid — `agree` is true (the replica's
  ranked pick equals the real `findCompanion` pick the scorer saw);
  AND the row's `members` array is present, has length == rosterN,
  every entry carries `id` + `firstFail`, every entry's `firstFail`
  matches the row's `fails` map, and the per-condition tallies of
  `firstFail` over `members` equal the row's `counts` for every
  condition. Any scored dawn failing any of these is `unknown`.
- **Member populations**: Pop-A = non-self members; Pop-B = living
  non-self members (as in poolmarginals).

New definitions (this arm — frozen):

- **A shadow-classified scored dawn**: a marginal-classified dawn
  whose pool row ALSO carries a valid `shadow` object: `shadow.s0`,
  `shadow.s1`, `shadow.s2` each present with `eligible` (array),
  `rankedPick` (id or null), `rankedVia` (string), `pickProfile`
  (string or null), `profileCounts` (object); S0's `eligible` set
  equals the row's `eligible` set AND S0's `rankedPick` equals the
  row's `rankedPick`; each shadow's `rankedPick` is non-null whenever
  its eligible list is non-empty; each shadow's `eligible` list is a
  subset of the row's non-self living members; S0 ⊆ S2 ⊆ S1 as sets
  (S0 eligible ⊆ S2 eligible ⊆ S1 eligible — the relaxations nest);
  each shadow's `profileCounts` sums to its eligible count. Any
  scored dawn failing any of these is `unknown` (new reasons:
  `shadow-missing`, `shadow-s0-mismatch`, `shadow-no-pick`,
  `shadow-not-nested`, `shadow-counts-mismatch`,
  `shadow-shape`).
- **Eligible-0 dawn share (per shadow)**: shadow-eligible-0 dawns /
  shadow-classified dawns. The PRIMARY METRIC compares S1 vs S0.
- **Would-be-biddable dawn** (per shadow): a shadow-classified dawn
  with >= 1 shadow-eligible companion. Every scored dawn is a live
  plan holder by construction, so would-be-biddable = eligible >= 1
  on that dawn. Reported as a count and a share of
  shadow-classified dawns, per shadow.
- **S0 agreement**: on every shadow-classified dawn whose score row
  carries a `party_launch` bid, S0's ranked pick equals the bid
  companion (the same check classifyPool already performs on the
  row's `agree` field, re-asserted on the shadow object). Must be
  100%.
- **Would-be companion identity distribution** (per shadow, S1/S2):
  over shadow-classified dawns with >= 1 eligible, the profile of
  the shadow ranked pick (`pickProfile`): counts + shares for
  explorer/wanderer/forager/homebody/null. PLUS the pooled eligible
  profile counts (`profileCounts` summed over all classified dawns).
- **Actual launches (comparison)**: the dawnbid instance buckets
  from the same corpora (reused classifier): `launched` instances
  on the band, vs would-be-biddable dawns per shadow. A launch is
  the real departed party; a would-be-biddable dawn is a dawn the
  shadow says COULD have bidded. The gap between them is the number
  Steve's design call must close — reported, not judged.
- **Guard metric** (report, do not judge): expedition deaths +
  total village deaths per leg — death rows (`deaths[]`) with
  `cause === 'expedition'` vs all death rows. Seedland found the
  seed call raises expedition deaths 98 → 189; report both legs
  alongside the bars.
- **Instrument error:** any non-empty `instrumentErrors`, any
  per-seed file failing to parse, any seed whose unlock/kill fields
  disagree (same rule as the vetparty/dawnbid preregs).

## Primary metric + GO bar (frozen)

Primary metric: **eligible-0 dawn share under S1 vs S0** (the shadow
tables complete for S0/S1/S2 on all scored dawns).

GO (instrument validity) iff ALL hold:

1. **Instrument valid: 8/8 corpora parse, 0 instrument errors, S0
   agreement with the real findCompanion pick on 100% of biddable
   dawns.** (S0 agreement is the `agree` check the classifier
   performs on every dawn with a `party_launch` bid, re-asserted on
   the shadow object.)
2. **Shadow tables complete for S0/S1/S2 on all scored dawns
   (unknown 0).** (One shadow object per scored dawn is expected, so
   100% shadow-classified is expected; the bar allows no misses —
   `unknown` must be exactly 0.)
3. **Proof test `scripts/test-profileshadow-a.js` green on the
   instrument tip AND in the post-revert shape.**
4. **Neutrality proven:** D1 + D2 green (proof test) AND D3 drift
   smoke clean (no pre-seed divergence on any seed). D2 must show
   identical trajectories with the shadow on vs off — the shadow is
   pure-read.

This is a DIAG: GO means the instrument is valid and the shadow
numbers are measured. It is NOT a lever GO — no game change is
judged, and nothing ships from this arm except the instrument +
evidence. This arm does NOT decide the profile gate — it gives Steve
the numbers (eligible-0 dawns and would-be launches under each
relaxation) for the design call.

## Secondary (reported, not judged)

- Per-shadow tables: eligible histogram (0/1/2/3+), eligible-0
  count + share, would-be-biddable dawns (count + share), per-shadow
  S0/S1/S2 comparison on the same dawns (paired: how many dawns move
  0→1+ under each relaxation).
- Would-be companion identity distribution under S1/S2 (picked
  profile counts + shares; pooled eligible profile counts).
- Actual launches on the band vs would-be-biddable dawns per shadow.
- Eligible-pool histogram (S0, reused from companionpool) + first-fail
  counts + marginals (comparability with poolmarginals on the same
  band family — this band is fresh, so the numbers are this band's
  own).
- Per-seed table: plan instances opened, seed calls, scored dawns,
  classified dawns, shadow-classified dawns, eligible==0 dawns per
  shadow, launches.
- Wall numbers (both legs): national — report BOTH fields, end
  standing >= 200 AND final scaleRank, naming which is which; table;
  wins; wave-4/5 unlocks; median survival.
- Guard metric: expedition deaths + total village deaths per leg.
- Sense check: quote 2–3 wave-4 fight lines (`log[]`) from the
  instrument leg and judge whether the fights read like fights (as
  dawnbid/companionpool/poolmarginals did).

## Seed bands (verified fresh per the seed-band-freshness skill)

- Pilot: **102401–102408** (8 seeds), control leg first (recorder
  only, instrument tip — no seed call), then instrument leg (seed call
  + recorder, instrument tip), identical seeds, same policy/horizon.
  This is the SAME band as the sibling arm sim-launchsurvive-a in
  this run, so the two arms' numbers are comparable.
- NEVER 100621–100636, 100861–100868, 100821–100828, 100721–100728,
  100761–100768, 10100–10139, 190391–190398, 190621–190628,
  190631–190638, 190541–190548, 190561–190568, 102001–102008
  (companionpool pilot), 102131–102138 (poolmarginals pilot),
  102141–102148 (seedland pilot), 102201–102208 (Loop B trickteach /
  14cwatch band).
- Freshness check (2026-11-16, verified by this arm before this
  commit — scope and result): ZERO seed namings for `10240[1-8]` in
  (a) all `*.md` under `evidence/` (`grep -rlE "10240[1-8]"
  evidence/ --include="*.md"` — no hits); (b) `scripts/*.js`
  (driver band literals — no hits); (c) per-seed filenames under
  `evidence/` (`find evidence -name "*10240[1-8]*"` — nothing);
  (d) the goal `hidden_files/` tracker, lever-claims, and findings
  (ripgrep over the 3.9G tree). The ONLY hits in (d) are: this run's
  own claim file
  `hidden_files/lever-claims/fleshout-20261116T1631Z.json` and the
  sibling Loop B claim
  `hidden_files/lever-claims/fleshout-loop-b-20261116T1730Z.json`,
  both naming band 102401–102408 for THIS run (the Loop B claim
  notes it as NOT touched); plus incidental digit substrings inside
  floating-point numbers in archived JSON corpora (e.g.
  `0.0010240372823154284`, `183.7026102404784` — not seed namings).
  The coordinator's report matches: zero seed namings in any prereg;
  the 102401 hits in evidence are incidental kcal/pantry numbers
  only. Band 102401–102408 is FRESH.

## Horizon, policy, death-awareness, legs

- Horizon 150 days, death-aware (dead villages stop simulating),
  policy **competent verbatim** (`scripts/policies/competent.js`, sha
  `74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456`
  — verified by this arm with sha256sum before this commit; the
  driver's own-policy record carries the sha it ran under). This is
  the geared-scholar-with-party policy — never stage a fresh
  un-geared solo scholar.
- Control anchor = the instrument commit (driver + analyzer + proof
  test, seed call ABSENT); instrument anchor = the seed-call commit
  (instrument + the 13-line seed call). Both SHAs are recorded in the
  evidence file. The judged comparison is control (recorder only) vs
  instrument (recorder + seed call), identical seeds.

## Determinism legs (frozen — neutrality proof)

- **D1 (repeatability):** instrument tip, seed 102401, 60d, recorder
  ON, run twice → identical per-seed JSON (deaths/days/endReason/
  vet5 + all dawnbid + companionPool rows identical, INCLUDING the
  shadow objects).
- **D2 (wrap neutrality):** instrument tip, seed 102401, 60d,
  recorder ON vs recorder OFF (`PROFILESHADOW_RECORDER=off`) →
  identical trajectories (deaths/days/endReason/standing/vet5 +
  daily fingerprints). The seed call is game code, not a wrap, so it
  is present in both legs — D2 isolates the wraps (including the
  shadow computation) only.
- **D3 (drift smoke):** `scripts/vetparty-drift-check.js` over the
  two corpora — first divergence on/after the first `v4seeds` day per
  seed; NO PRE-SEED DRIFT. (The seed call is the instrument's first
  possible divergence cause, so the smoke's "first lever-action day"
  is the first `v4seeds` day, exactly as in the vetparty/dawnbid arms.)

## Proof test

`scripts/test-profileshadow-a.js` proves, on synthetic fixtures and
live in-memory runs (no corpus numbers):

- Static: the seed call is present in `src/js/game.js` (verbatim
  VETPARTY block) when `PROFILESHADOW_SEED_CALL=on` (default), absent
  when `off` (post-revert shape — the check records "not-built-yet",
  it does not crash); the driver wraps exist (`vbrainScorePick`,
  `vbrainExecuteDepart`, `winPlanSeedFromFight`, `startExpedition`,
  `companionPool`, `poolReplica`, `members`, `shadow` — driver-side);
  the diff for game code touches exactly `src/js/game.js` (the seed
  call only); the scripts worktree diff is profileshadow-* files only
  (the poolmarginals analyzer is required, not modified); the wave-4
  id set matches `src/data/monsters.json` wave 4 exactly (10 ids);
  `companionRank` is a pure read (no `Math.random` in
  `src/js/companion-score.js`).
- Unit (shadow classifier, synthetic fixtures): S0/S1/S2
  classification incl. edge profiles — forager eligible in S2 not
  S0; homebody eligible only in S1; profile-null eligible only in
  S1; trust boundary (trust 15 eligible, 14 not — in all three
  shadows); away / onExped / dead / self exclusions (in all three);
  notAtHaven exclusion (in all three); nesting S0 ⊆ S2 ⊆ S1;
  would-be-biddable counting (eligible 0 → not biddable, >= 1 →
  biddable); S0-vs-findCompanion agreement (bidCompanion ==
  S0 rankedPick → classified; mismatch → unknown); shadow shape
  unknowns (missing shadow → unknown; S0 eligible mismatch vs the
  row → unknown; S0 rankedPick mismatch vs the row → unknown;
  S1/S2 not nested → unknown; profileCounts not summing to eligible
  → unknown; rankedPick null with eligible > 0 → unknown);
  identity distribution (S1 pick profile = forager/homebody counts;
  S2 pick profile never homebody).
- Recorder: synthetic fixtures for the pool row + shadow shape; a
  live in-memory run proves the `vbrainScorePick` wrap records pool
  rows WITH shadow objects without changing the pick.
- Replica live: `poolReplica` + shadow computation against live game
  state returns shadows with S0 == poolReplica eligible/pick and
  S0 ⊆ S2 ⊆ S1.
- Determinism: D1 + D2 as frozen above (seed 102401, 60d).
- GREEN on the instrument tip before the instrument leg runs; GREEN
  again post-revert with `PROFILESHADOW_SEED_CALL=off`.

## Sense-testing

Quote the wave-4 fight lines the recorder captures
(`v4encounters[].log[]`) for 2–3 wave-4 fights in the instrument leg
and judge whether the fights read like fights — and whether the PARTY
reads like a party. Name the fight lines' source (seed, day, fighter,
monster) and the counts searched. Do not invent fight narrative from
kill counts.

## Balanced-panel review note (why no panel)

No balanced panel for this DIAG, same as dawnbid, companionpool, and
poolmarginals. The panel (`scripts/balance-panel.js`) measures a
lever's effect on wins / survival across policies; this arm ships no
game change — the seed call is reverted, the instrument is
observation-only, and the prereg bar is the judge. A panel on both
legs would measure the seed call's noise, not a lever. The neutrality
proof (D1/D2/D3) is the panel's substitute here, and it must be clean.

## Telemetry deviation check

After writing evidence, run `node scripts/telemetry-check.js
--baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current '<per-seed-evidence-glob>' --metrics
national,table,wins,exiled` and record the outcome; if it refuses
recorder corpora, record the refusal — do NOT work around it with
`--allow-recorder-corpus` and do NOT roll the baseline.

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
- Prior evidence: `evidence/2026-11-16/sim-poolmarginals-b.md`
  (§"The answer: profile alone, everything else only in combination"
  — this DIAG's subject) and `evidence/2026-11-16/sim-companionpool-b.md`.

## Commit sequence (frozen order)

1. This prereg (this commit).
2. Instrument: driver + analyzer + proof test.
3. The seed call (13 lines, verbatim) — its own commit.
4. Judged pilot: control leg, then on leg, 8 seeds each.
5. Evidence + analysis + corpora; then REVERT the seed call
   (evidence-only, `src/` diff 0 vs base); proof re-run post-revert.

## Metric review (to be filled in the evidence file)

Pre-registered here: if S1's eligible-0 share is still high (the
pool is empty even with the profile gate dropped — e.g. away +
notAtHaven dominate once profile is out of the way), the review will
name the residual blocker from the S1-eligible-0 dawns' member
flags; if S2 moves almost nothing over S0 (few foragers at Haven),
the review will name the forager-at-Haven count; if S1's picks are
overwhelmingly homebodies (not foragers), the review will say so
with the identity distribution — the design call then faces a
different question than "admit foragers"; if the instrument leg's
plan-instance count is far below poolmarginals' 35 (different seed
band, no party/gate lever), the review will say so with both counts
— the shadows are judged on the scored dawns that occur, not on
matching 35. No re-scoring mid-run: the definitions above are the
judge.
