# sim-lendpool-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-lendpool-a · **Loop A run:** fleshout-20261121T0015Z
**Type:** DIAGNOSIS — finding #2628, the lend-opportunity pool is 0:
why holders never stand in earshot of an unarmed lead. NO lend
re-test, NO game-code change in this arm (read-only instrument).
**Frozen:** 2026-11-21 ~00:50 UTC, before any judged sim.
**Branch:** `sim-lendpool-a` (worktree
`~/workspace/worktrees/sim-lendpool-a`). **Base:** master `faa5d65a9`
(verified with `git log`; all three arm worktrees share this tip).
**Builds on:** `evidence/2026-11-20/sim-lendfix-a.md` +
`sim-lendfix-a-prereg.md` (the v4lendPool counter, LANDED env-gated
OFF), `evidence/2026-11-20/sim-lend-a.md` (the one lend, finding
#2629 FIXED — do not re-work) and `evidence/2026-11-20/sim-presence-a.md`
(the draft-miss population, tick-row based).

## The question (finding #2628 stays OPEN on the opportunity question)

The lendfix arm measured **0 lendable moments on all 8 seeds**
(band 107081–107088): holders exist (87 holder-days, 20 armed
wave-4+ entries, 449 pool-holder-present ticks, 37 draft misses)
but a lendable moment never lines up — a lead going in
unarmed-or-empty with a living armed holder (gun + ≥1 cell, not the
scholar, health > 20, not sheltered, not resting) standing in
earshot at a wave-4+ fight launch. This arm answers WHY: for every
wave-4+ fight launch with an unarmed-or-empty lead, where is the
nearest armed holder, what is it doing, and how far away is it?

## Instrument (frozen design — read-only, no game-code change)

- **Driver:** `scripts/lendpool-driver-a.js` (clone of
  `scripts/lendfix-driver-a.js` — all cell / searcaster census +
  grant wraps + lead-rule + flee-cause instrumentation kept
  verbatim — PLUS the `v4nearMiss` recorder; the `v4lendPool`
  recorder is kept and must re-verify the pool on the fresh band).
  The `v4lends` recorder is kept but must stay EMPTY (lend OFF).
- **`v4nearMiss` recorder** (one row per wave-4+ fight launch that
  becomes a real fight — outcome vKill | mFlee | vFlee | vDie —
  same fight filter as `v4lendPool`): wraps
  `Game.resolveWildMonsterEncounter`, evaluates BEFORE the
  original runs, pure reads, zero `Math.random()` calls, zero
  game-state writes. Row fields: day / seed / mid / wave /
  lead / leadKind (`gun` = lead has no searcaster, `cells` =
  lead carries an empty searcaster, `loaded` = lead already
  carries a loaded searcaster — the lend's own kind logic) /
  raid / livingHolderCount / nearestHolder (vid or null) /
  nearestDist (Chebyshev tiles, null when no living holder) /
  nearestState (classified, see below) / nearestHealth /
  nearestCells / anyArmedEarshot (any LIVING armed holder —
  gun + ≥1 cell, roster, not the scholar — at Chebyshev ≤ 1,
  regardless of shelter/rest/health) /
  anyEligibleEarshot (same, lend-eligible: health > 20, not
  sheltered, not post-flee resting) / lendable (the
  `lendPoolMoment` verdict, cross-checked against `v4lendPool`).
- **Nearest-holder state classes (frozen, priority order — first
  match wins):** `sheltered` (`Game.isSheltered`) >
  `resting` (`Game.isPostFleeResting`) > `low-health`
  (village health ≤ 20) > `on-expedition`
  (`Game.agencyState().exped[hid]`) > `away`
  (`state.village.away[hid]` present — on a trip) >
  `at-home` (on the Haven node AND `Game.npcInside(hid)` —
  inside the hall) > `in-camp` (on the Haven node, outside —
  the grounds) > `out-in-world` (any other node, not on an
  expedition or away — wandering / foraging / exploring).
  When no living armed holder exists: nearestHolder null,
  nearestState `no-living-holder`. `dead` is NOT a
  nearest-holder class (the nearest holder is chosen among
  living armed holders; a dead holder holds no gun the lend
  could use) — it is reported instead as the
  `no-living-holder` share. `fighting-elsewhere` is NOT a
  measured class: fights resolve sequentially in node sims,
  so no holder can be mid-fight when another fight launches;
  stating the class would fake a distinction the engine
  cannot produce at launch time.
- **Earshot base rate:** over ALL wave-4+ real-fight launches
  (any leadKind), the share with `anyArmedEarshot` true, and
  separately the share with `anyEligibleEarshot` true. The
  near-miss breakdown is the same rows restricted to
  leadKind `gun` | `cells`, classified by nearestState and
  bucketed by nearestDist (0 / 1 / 2 / 3 / 4–5 / 6+).
- **Draft-miss population:** presence-a's 37 (lendfix band)
  is tick-row based and overcounts ~3× (presence §4: one row
  per day-part call per fight; the recorder's adjacent list
  does not filter sheltered / post-flee holders). It is NOT
  reused as the near-miss population. This arm measures fresh
  at fight-launch level and cross-checks the tick-level
  `poolDraftMiss` count from the same corpora.
- **Analyzer:** `scripts/analyze-lendpool-a.js` (clone of
  `scripts/analyze-lendfix-a.js`, PLUS `nearMissStats`:
  launch counts, earshot base rates, near-miss breakdown by
  state and distance, `v4lendPool` re-verification,
  `poolDraftMiss` cross-check, wall numbers).
  **Proof test:** `scripts/test-lendpool-a.js`
  (`nearMissMoment` + `classifyHolderState` fixtures,
  RED → GREEN before the pilot).

## Primary metric (BINDING, §14)

**DIAG-GO iff ALL hold:**

1. **Instrument validity — fixtures 100%.**
   `scripts/test-lendpool-a.js` passes every assertion:
   `nearMissMoment` attributes correctly on fixtures
   (unarmed lead + holder at each distance 0/1/2/3, holder
   sheltered / resting / low-health / on-expedition / away /
   at-home / in-camp / out-in-world, no living holder,
   loaded lead, wave-1, raid, 0 draws, pure reads — nothing
   moved), `classifyHolderState` returns the frozen class on
   each staged state, and the analyzer `--selftest` passes
   (judge shapes incl. the classified-breakdown verdict).
2. **Coverage — the near-miss is fully classified.**
   `v4nearMiss` rows exist for ≥ 95% of unarmed-lead
   (leadKind `gun` | `cells`) wave-4+ real fights in the
   corpus, and ≤ 5% of those rows carry an unclassified /
   `unknown` nearestState.
3. **The answer — quantified, with a named dominant cause
   and the earshot base rate.** The evidence reports: the
   near-miss breakdown by nearestState (shares of all
   unarmed-lead launches) and by nearestDist buckets; the
   earshot base rate over ALL wave-4+ launches (armed and
   eligible, separately); and names the dominant cause — the
   largest single nearestState class, with its share — plus
   the named next lever with its premise stated. If the
   largest class holds < 30%, the evidence says so plainly
   ("no single dominant cause — diffuse") and names the top
   two classes instead; the bar is the quantified answer,
   not a particular cause.

**Verdict ladder (frozen):** DIAG-GO = all three hold → the
diagnosis lands (instrument + evidence; no game-code change
to land). DIAG-NO-GO = any bar misses → the diagnosis is
not established (instrument failure = SUBSTRATE finding;
coverage failure = the recorder missed launches — diagnose,
do not ship the breakdown). A DIAG-GO with a diffuse
breakdown (no class ≥ 30%) still names the next lever, but
the lever's premise must say the pool is diffuse, not
single-cause. This arm changes no game behavior, so there is
no guardrail bar on game outcomes; the guardrail is
instrument purity — `v4lends` empty, `v4lendPool`
re-verified, zero draws added (proven by the fixtures).

## Secondary metrics (supporting, never re-scored)

- **Pool re-verification:** `v4lendPool` rows per seed on the
  fresh band (lend OFF). Expected 0 (lendfix measured 0);
  any row > 0 is reported as the pool it is, with its
  (day, mid, lead, lender, kind, from) — it would mean the
  fresh band, not the instrument, differs.
- **Wall numbers every run:** national / table / wins,
  wave-4 and wave-5 unlocks, median survival, per seed.
  Table: not instrumented by this driver — reported as
  null, never faked.
- **Sense-test:** read transcripts — do holders and leads
  ever notice each other, call for help, or move toward a
  fight? (Corpus encounter logs + help-call lines; the
  recorder-timing blind spot of finding #2630 is disclosed
  — the driver reads `rec.log` at fieldFight-return, before
  the hook annotates it — so absence of a line in the corpus
  is not proof the line was never spoken.)

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the lend /
  lendfix / presence bands, for comparability; the wave-4+
  phenomenon lives in the back half). Dead villages stop
  simulating (+10d tail max).
- **Seeds: 107111, 107112, 107113, 107114, 107115, 107116,
  107117, 107118 — FRESH band.** Freshness check (per the
  local_seed_band_freshness skill, recorded here before the
  run): grepped every `evidence/*/sim-*-prereg.md` for
  `107111`–`107118` (exact, no hits); grepped every
  `evidence/**/*.md` for `10711[1-8]` (no hits); grepped the
  goal `hidden_files/` for `10711[1-8]` (hits are kcal /
  pantry amounts in old Oct corpora only — `belongfeast-s6103.json`
  `107114` kcal, panel-case JSON `107113` / `107118` kcal —
  not seed bands); no dedicated forbidden/contaminated band
  list exists in the goal `hidden_files/`; coordinator
  pre-check found no prereg naming this band. **Band FRESH.**
- **Policies:** competent verbatim. **Legs:** ONE leg
  (diagnosis — no lever, no before/after; a control leg
  would be the same game measured twice).
- **Env (exact — the LEND substrate env ON for the counter
  only):** `VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1
  FIGHTALLY2=1 SENSEEXPED=1 BOWOPEN=1 SPEARGATE=1 GUNRATE=1
  CELLGATE=1`; `LEND` unset (the lend itself stays OFF —
  this arm is the pool diagnosis, not the lend); `PRESENCE`
  unset; SEARSUPPLY, BOWCRAFT, FUSIONCELL unset. The
  `v4lendPool` counter runs with the lend OFF, as landed.
- **Instrument:** `scripts/lendpool-driver-a.js`,
  `scripts/analyze-lendpool-a.js`,
  `scripts/test-lendpool-a.js`. **§15 panel:** NO panel
  compare applies — a single-leg diagnosis with no game
  change has no before/after to compare; the panel is the
  instrument for before/after comparisons, and there is
  none here. The wall numbers are reported from the diag
  corpus itself.
- **PILOT ONLY.** 8 seeds is the pilot and the confirm
  here (diag on one band); no 12–16 seed confirm spend.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** the lendfix band saw 187 wave-4+ meetings
   on 8 seeds with 20 armed entries — wave-4+ fights with
   leads happen on this substrate; the near-miss population
   is the unarmed-lead subset of those launches.
2. **Pool sizing:** the bar is coverage (≥ 95% classified),
   not a count — no count floor to mis-price. The expected
   unarmed-lead launch count is ~100+ across the band
   (lendfix: 187 meetings, leads overwhelmingly unarmed).
3. **Verb existence (verified by code read before the
   pilot):** `Game.npcNode` / `npcSetNode` (game.js),
   `Game.isSheltered` (shelter.js), `Game.isPostFleeResting`
   (game.js ~21084), `Game.agencyState().exped`
   (npc-triggers.js:244 uses exactly this read),
   `Game.npcInside` (game.js), `state.village.away`
   (game.js `shouldHurtReturn`), `Game.resolveWildMonsterEncounter`
   (the lendfix wrap point). All exist; the recorder only
   reads them.
4. **Horizon fit:** wave-4 fights occur across the 150d
   window on every prior band in this chain (lend 187
   meetings, lendfix 187) — the window contains the
   phenomenon.

## Canon note

`docs/CANON.md` (manifest) was consulted. **No canon doc
covers the searcaster, the contest-prize area, the lend, or
holder presence at fights** — said here rather than
inventing canon (same as the lend / gunrate / cellgate /
presence / lendfix arms). The prize, grant, equip, volley,
lead, expedition-holder, and world-tick rules are cited
from code (`contests.js` `_cxItemPrize`, `game.js`
`rollAlienLoot` / `alienLootGrant` / `villagerMonsterTick` /
`resolveWildMonsterEncounter`, `equipment.js`
`rangedWeaponOf` / `autoEquip`, `fieldFights.js` volley,
`party-wiring.js` `villagerFightAllies`), not from canon.

## Metric review

(To be written after judging — proposals for the next run,
never a re-score.)
