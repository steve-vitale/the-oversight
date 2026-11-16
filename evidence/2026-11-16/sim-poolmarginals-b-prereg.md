# sim-poolmarginals-b — PREREG (binding)

Run: fleshout-loop-b-20261116T0730Z (Loop B), axis winnability chain, arm
sim-poolmarginals-b — DIAG: the companion-pool PER-CONDITION MARGINALS
(companionpool's named next diagnostic #3). Branch `sim-poolmarginals-b`
(worktree `~/workspace/worktrees/sim-poolmarginals-b`). Base: master
`9b04ae9b7` at arm start (the worktree HEAD; `git branch --contains`
includes `master` — the base IS current master; no rebase mid-run unless
the coordinator says so; the coordinator rebases at landing and re-runs
proofs).
Binding prereg: THIS file — frozen before any judged sim. The instrument
(driver, analyzer, proof test) is built AFTER this commit; no judged
numbers exist yet.

## The question, in plain words

Companionpool proved the companion pool fails on profile (notRanger
593/1430 checks, 41.5%, binding on 91/161 empty-pool dawns) and away
(400, 28.0%, binding on 54), with trustLow / notAtHaven / engaged /
onExped / dead all ZERO as first fails. But those zeros are FIRST-FAIL
zeros: a member failing `away` may also have trust < 15 or be a
non-ranger, and the instrument could not see past the first failure.
This DIAG measures the MARGINALS: for each roster member at each scored
dawn, record the FULL profile (profile, trust, node, away, engaged,
expedition, alive) so the analysis can say how often trust < 15
co-occurs with away/notRanger, and how often each condition binds alone
vs only in combination.

## Prior art (read first)

- `evidence/2026-11-16/sim-companionpool-b.md` + prereg — the instrument
  this arm EXTENDS (extend `scripts/companionpool-driver-20261116.js`,
  `scripts/analyze-companionpool-b.js`, `scripts/test-companionpool-b.js`;
  don't rebuild). Its metric review names the gap this arm closes:
  "The zeros need their precise reading: first-fail zeros, not 'never
  happens' zeros. ... A next diagnostic that wants per-condition
  marginals (not first-fails) would need per-member full profiles in the
  row — the `fails` map already records first-fail per member, so the
  extension is small."
- `evidence/2026-11-15/sim-dawnbid-a.md` + prereg — the dawnbid
  instrument this family extends.
- `docs/CANON.md` (read first), `docs/MONSTER-WAVES.md` (wave 4 "The
  Mirror Draft"; the doc lists 9 wave-4 ids, the data has 10 and the data
  rules), `docs/PARTY.md`, `docs/VILLAGER-BRAIN.md` (one-brain contract:
  Phase 1 dawn scorer; the brain owns dawn).

## Design decision 1 — the subject only exists with the seed call (frozen)

Same as companionpool/dawnbid (verified on this tree before this prereg:
on current master the world-tick seed call is GONE — reverted by commit
`7ba893b4b`; `grep winPlanSeedFromFight src/js/game.js` returns nothing).
The instrument leg re-lands ONLY the vetparty seed call, verbatim — the
13-line block removed by `7ba893b4b` in `resolveWildMonsterEncounter`,
`src/js/game.js`, beside the existing return-to-fight sighting block
(blob `a66d45a5e`), inserted immediately before
`if (rec.outcome === 'alreadyDead') {` (line ~20935 on this tree):

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
(`7ba893b4b`, revert of `f0fb6fc18`; companionpool re-landed it as
`a5dfd6b34` and reverted as `9f65d6eda`).

## Design decision 2 — the two findCompanions, and which one is recorded (frozen)

Carried verbatim from the companionpool prereg (re-read from the code
before this prereg; unchanged on this tree):

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

## Design decision 3 — the members extension (frozen)

The companionpool driver's `poolReplica(Game, vid)` computes the
first-fail counts by walking the roster once in the brain loop's check
order, `continue`-ing at the first failing check. This arm restructures
that walk WITHOUT changing what it computes: for each roster member it
first reads EVERY field the checks use — alive (`getPerson` dead flag),
away (`v.away[cid]`), trust (`v.trust[cid]`, undefined defaulting to 10),
node (`npcNode(cid)`, null when unreadable), engaged (`isEngaged(cid)`),
profile (`npcRangeProfile(cid)`, null when unreadable), onExped
(`agencyState().exped[cid]`) — each read in its own try/catch exactly
as the original loop does, then applies the SAME first-fail order to the
SAME effective values to produce the SAME `counts` / `fails` /
`eligible` / `rankedOrder` / `rankedPick`. The row gains one new field:

- `members`: one entry per roster member, in roster order:
  `{id, profile, trust, trustRaw, node, away, engaged, onExped, alive,
  firstFail}` where `trust` is the EFFECTIVE trust (undefined → 10, the
  value the check uses), `trustRaw` is the stored value or null when
  undefined, `node` is `{nx, ny}` or null when unreadable, `profile` is
  the range profile or null when unreadable, and `firstFail` is the
  member's entry in the `fails` map (one of selfOrScholar / dead / away /
  trustLow / notAtHaven / engaged / notRanger / onExped / eligible).

Consistency rule (frozen): the marginal flags are computed from the
SAME effective values the first-fail loop uses (trust default 10,
node-null → not-at-Haven, profile-null → not-ranger), so marginals and
first-fails are two readings of one consistent snapshot, never two
different snapshots. The raw values (`trustRaw`, `node`, `profile`) are
recorded alongside so the analyzer can audit the defaults and count
unknown-node / unknown-profile members separately.

File shape (family precedent — dawnbid → companionpool was a NEW file
per arm extending the previous driver, not an edit in place; this arm
follows it):

- Driver: `scripts/poolmarginals-driver-20261116.js` (new — the
  companionpool driver extended, not rebuilt: same vetfirst T-class
  instrument, same `v4seeds` / `v4departs` / `v4gates` / `v4encounters`
  recorder, same `dawnbidScores` / `dawnbidDeparts` / `dawnbidCensus` /
  `dawnbidStarts` / `companionPool` capture, PLUS the `members` field on
  every pool row). Recorder env var `POOLMARGINALS_RECORDER` (`off`
  skips installing the wraps, D2 leg). `RUN=poolmarginals-b`,
  `OUTDIR=perseed-poolmarginals-b-<mode>`, `arm: 'poolmarginals-b'`.
  The driver refuses to overwrite an existing per-seed file.
- Analyzer: `scripts/analyze-poolmarginals-b.js` (new). REQUIRES
  `scripts/analyze-companionpool-b.js` (not copied) and reuses its
  `classifyPool` + `summarizePool` for the classification, first-fail
  decomposition, eligible histogram, per-seed table, and wall numbers —
  then computes the marginal table from the raw pool rows' `members`
  arrays joined to the classified dawns. `analyze-companionpool-b.js`
  itself is NOT modified by this arm.
- Drift check: reuse `scripts/vetparty-drift-check.js` verbatim (it
  reads `v4seeds` + the T-class daily fingerprints — this driver's
  corpora carry both). First divergence must fall on/after the first
  `v4seeds` day per seed.
- Proof: `scripts/test-poolmarginals-b.js` (new; see below). GREEN on
  the instrument tip before the instrument leg runs; GREEN again
  post-revert with `POOLMARGINALS_SEED_CALL=off` (not-built shape).

## Frozen definitions

Reused from the companionpool prereg (not redefined — the same join,
the same classifier):

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
  rosterN, its eligible array matches counts.eligible, its rankedPick
  is non-null whenever eligible > 0, and — whenever the dawn's score
  row carries a `party_launch` bid — `agree` is true (the replica's
  ranked pick equals the real `findCompanion` pick the scorer saw).
  AND (this arm's addition): the row's `members` array is present,
  has length == rosterN, every entry carries `id` + `firstFail`, every
  entry's `firstFail` matches the row's `fails` map for that id, and
  the per-condition tallies of `firstFail` over `members` equal the
  row's `counts` for every condition. Any scored dawn failing any of
  these is `unknown` (new reasons: `members-missing`,
  `members-length`, `members-fails-mismatch`, `members-counts-mismatch`).

New definitions (this arm — frozen):

- **Member population**: for each classified scored dawn, the pool
  row's `members` array. Self/scholar members (`firstFail ==
  selfOrScholar`, i.e. the holder and the scholar) are EXCLUDED from
  the condition populations — they never reach the checks — and are
  counted separately as roster context only.
- **Pop-A** (all non-self members): `members` minus selfOrScholar.
  The `dead` marginal is reported over Pop-A: count(alive == false) /
  |Pop-A|.
- **Pop-B** (living non-self members): Pop-A minus the dead. The
  remaining six condition flags are reported over Pop-B, computed from
  the effective values (Decision 3): `away` (away true), `trustLow`
  (trust < 15), `notAtHaven` (node null OR node != haven tile),
  `engaged` (engaged true), `notRanger` (profile not wanderer/explorer),
  `onExped` (onExped true).
- **Marginal share** per condition: count(flag true) / population
  size (Pop-A for dead, Pop-B for the other six).
- **Co-occurrence** (over Pop-B, for each pair trustLow×away,
  trustLow×notRanger, away×notRanger): count(both true), share of
  Pop-B, and both conditional shares P(A|B) and P(B|A).
- **Alone vs in combination** (over Pop-B, per condition C among the
  six): `alone` = C true and all other five flags false; `inCombo` = C
  true and >= 1 other flag true. Reported as counts and as shares of
  C-true members.
- **Instrument error:** any non-empty `instrumentErrors`, any
  per-seed file failing to parse, any seed whose unlock/kill fields
  disagree (same rule as the vetparty/dawnbid preregs).

## Primary metric + GO bar (frozen)

Primary metric: **share of plan-holder scored dawns classified WITH
full per-member profiles** (pool decomposition complete AND the members
extension valid, unknown 0).

GO (instrument validity) iff ALL hold:

1. **>=90% of plan-holder scored dawns classified with full
   per-member profiles, 0% in `unknown`.** (One pool row per scored
   dawn is expected, so 100% is expected; the 90% bar allows
   analyzer-edge misses, but `unknown` must be exactly 0.)
2. **Corpus 16/16 files parse** (8 control + 8 instrument legs,
   identical seeds).
3. **Neutrality proven:** drift smoke clean (no pre-seed divergence
   on any seed) AND determinism legs green (D1 + D2 below).
4. **Proof test `scripts/test-poolmarginals-b.js` green.**

This is a DIAG: GO means the instrument is valid and the marginals are
measured. It is NOT a lever GO — no game change is judged, and
nothing ships from this arm except the instrument + evidence.

## Secondary (reported, not judged)

- Marginal co-occurrence table (trust<15 × away, trust<15 ×
  notRanger, away × notRanger, each condition alone vs in
  combination); per-condition marginal shares over Pop-A/Pop-B.
- Eligible-pool histogram (reused from companionpool) + first-fail
  counts (comparability with companionpool's 196 dawns — same table,
  this band's numbers beside it).
- Per-seed table: plan instances opened, seed calls, scored dawns,
  classified dawns, eligible==0 dawns, launches.
- Wall numbers (both legs): national — report BOTH fields, end
  standing >= 200 AND final scaleRank, naming which is which (per the
  0530Z reconciliation); table; wins; wave-4/5 unlocks; median
  survival.
- Sense check: quote 2–3 wave-4 fight lines (`log[]`) from the
  instrument leg and judge whether the fights read like fights (as
  dawnbid/companionpool did).

## Seed bands (verified fresh per the seed-band-freshness skill)

- Pilot: **102131–102138** (8 seeds), control leg first (recorder
  only, instrument tip — no seed call), then instrument leg (seed call
  + recorder, instrument tip), identical seeds, same policy/horizon.
- NEVER 100621–100636, 100861–100868, 100821–100828, 100721–100728,
  100761–100768, 10100–10139, 190391–190398, 190621–190628,
  190631–190638, 190541–190548, 190561–190568.
- Freshness check (2026-11-16, verified by this arm before this
  commit — scope and result): ZERO hits for the exact seeds
  102131–102138 in (a) all `*.md` under `evidence/` — every dated
  prereg, evidence file, and note (`grep -rlE "10213[1-8]"`, filenames
  only); (b) `scripts/*.js` (driver band literals — zero hits);
  (c) per-seed filenames under `evidence/`
  (`find evidence -name "*10213[1-8]*"` returns nothing);
  (d) the goal `hidden_files/` tracker, lever-claims, and findings
  `.md` (`grep -rlE "10213[1-8]"` — the ONLY hit is this arm's own
  brief `hidden_files/arm-briefs-20261116/sim-poolmarginals-b.md`
  naming the band). The only other hits anywhere are the known
  false-positive class the coordinator reported: the 5-DIGIT seed
  10213 from the Oct 30 sicktele census band 10211–10218
  (`grep -rlw "10213" evidence --include="*.md"` →
  `evidence/2026-10-30/sim-sicktele-b-20261031T0007Z.md` with seeds
  10211/10212/10213/10214/10215/10216/10217/10218, and one mention in
  `evidence/2026-10-30/sim-food-economy-round-0007-b.md` — "10213,
  david_kim, day 126 contest death" — the same 5-digit seed, not this
  band). Neighbouring used bands: 102001–102008 (companionpool pilot,
  this run), 100861–100868 (dawnbid pilot), 100821–100828 (vetparty
  pilot), 100621–100636 (courtship reconfirm). Band 102131–102138 is
  FRESH — a fresh band is preferred here as an independent replication
  of companionpool's decomposition, and no reuse of 102001–102008 is
  needed.

## Horizon, policy, death-awareness, legs

- Horizon 150 days, death-aware (dead villages stop simulating),
  policy **competent verbatim** (`scripts/policies/competent.js`, sha
  `74a890f0844ebc19fce2ac24da360f114b1f366fdb33a185a122f891dc2f0456`
  — verified by this arm with sha256sum before this commit; the
  driver's own-policy record carries the sha it ran under). The
  standing fix marker (`ROSTER CHECK`) is present in
  `src/js/standing.js` on this tree — no swap is needed.
- Control anchor = the instrument commit (driver + analyzer + proof
  test, seed call ABSENT); instrument anchor = the seed-call commit
  (instrument + the 13-line seed call). Both SHAs are recorded in the
  evidence file. The judged comparison is control (recorder only) vs
  instrument (recorder + seed call), identical seeds.

## Determinism legs (frozen — neutrality proof)

- **D1 (repeatability):** instrument tip, seed 102131, 60d, recorder
  ON, run twice → identical per-seed JSON (deaths/days/endReason/
  vet5 + all dawnbid + companionPool rows identical, INCLUDING the
  members arrays).
- **D2 (wrap neutrality):** instrument tip, seed 102131, 60d,
  recorder ON vs recorder OFF (`POOLMARGINALS_RECORDER=off`) →
  identical trajectories (deaths/days/endReason/standing/vet5 +
  daily fingerprints). The seed call is game code, not a wrap, so it
  is present in both legs — D2 isolates the wraps only.
- **D3 (drift smoke):** `scripts/vetparty-drift-check.js` over the
  two corpora — first divergence on/after the first `v4seeds` day per
  seed; NO PRE-SEED DRIFT. (The seed call is the instrument's first
  possible divergence cause, so the smoke's "first lever-action day"
  is the first `v4seeds` day, exactly as in the vetparty/dawnbid arms.)

## Proof test

`scripts/test-poolmarginals-b.js` proves, on synthetic fixtures and
live in-memory runs (no corpus numbers):

- Static: the seed call is present in `src/js/game.js` (verbatim
  VETPARTY block) when `POOLMARGINALS_SEED_CALL=on` (default), absent
  when `off` (post-revert shape — the check records "not-built-yet",
  it does not crash); the driver wraps exist (`vbrainScorePick`,
  `vbrainExecuteDepart`, `winPlanSeedFromFight`, `startExpedition`,
  `companionPool`, `poolReplica`, `members` — driver-side); the diff
  for game code touches exactly `src/js/game.js` (the seed call only);
  the scripts worktree diff is poolmarginals-* files only (the
  companionpool analyzer is required, not modified); the wave-4 id set
  matches `src/data/monsters.json` wave 4 exactly (10 ids).
- Unit (marginal classifier, synthetic fixtures): one fixture per
  failing condition as the SOLE blocker (first-fail comparability —
  same counts as companionpool's fixtures); co-occurrence fixtures
  (trustLow×away both true; trustLow×notRanger; away×notRanger;
  trustLow alone; away alone; notRanger alone — alone vs in-combo
  tallies); members-shape unknowns (missing members array →
  unknown; members length != rosterN → unknown; a member's firstFail
  disagreeing with the fails map → unknown; firstFail tallies not
  matching counts → unknown); eligible-pool cases (eligible 0 / 1 /
  2+ with ranked pick = first ranked id); replica agreement
  (bidCompanion == rankedPick → classified; mismatch → unknown).
- Recorder: synthetic fixtures for the pool row + members shape; a
  live in-memory run proves the `vbrainScorePick` wrap records pool
  rows WITH members without changing the pick.
- Replica live: `poolReplica` against live game state returns members
  with full fields (profile/trust/node/away/engaged/onExped/alive/
  firstFail) and firstFail tallies equal to counts.
- Determinism: D1 + D2 as frozen above (seed 102131, 60d).
- GREEN on the instrument tip before the instrument leg runs; GREEN
  again post-revert with `POOLMARGINALS_SEED_CALL=off`.

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
- Prior evidence: `evidence/2026-11-16/sim-companionpool-b.md` (§"The
  answer: profile first, away second, everything else zero" — this
  DIAG's subject) and `evidence/2026-11-15/sim-dawnbid-a.md` (§"Gate 2
  — no companion to go with").

## Metric review (to be filled in the evidence file)

Pre-registered here: if the marginals show trust < 15 hiding behind
earlier fails (e.g. a large share of away members also trustLow), the
review will name the co-occurrence counts and what they mean for the
trust floor's real bindingness; if a condition binds alone far more
than in combination (or vice versa), the review will name the split;
if the members extension disagrees with the first-fail counts on any
dawn (it cannot — the shape check fails the dawn first), the review
will name the dawns; if the instrument leg's plan-instance count is
far below companionpool's 31 (different seed band, no party/gate
lever), the review will say so with both counts — the marginals are
judged on the scored dawns that occur, not on matching 31. No
re-scoring mid-run: the definitions above are the judge.
