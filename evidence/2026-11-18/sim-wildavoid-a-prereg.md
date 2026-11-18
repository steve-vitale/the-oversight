# Pre-registration — sim-wildavoid-a (Loop A, run fleshout-20261118T1015Z, axis: scale-onramp)

Committed BEFORE any judged sweep. Judge strictly against this file; a miss
is NO-GO per the verdict mapping below, never re-scored against a friendlier
metric mid-run. Metric doubts go under "metric review" in the evidence file,
for the NEXT run.

## Run identity

- Arm: sim-wildavoid-a (Loop A) · Branch: `sim-wildavoid-a`, based on master
  at the coordinator's registration (tip recorded in the evidence file).
- Finding: #2506 (Loop B arm sim-seekgate-b, run
  fleshout-loop-b-20261118T0026Z, evidence/2026-11-17/sim-seekgate-b.md),
  censused by Loop B arm sim-fightgate-scope-b
  (evidence/2026-11-18/sim-fightgate-scope-b.md, band 104301–104308):
  aid and world-tick meetings never consult the fight gate. The census
  priced the gap: 113 wild wave-4+ meetings vs 47 expedition; the
  expedition gate would have avoided 18 of the 113 wild meetings
  (15.9%, ALL by the outmatched rule; veteran-guard fired nowhere),
  costing 2 villager deaths + 10 flees carrying 288 damage. The Suburb
  slice shows no harm (8 wild Suburb meetings, all round-1 flees, 0
  damage dealt, 0 deaths). The launched-party slice was empty (0 wave-4
  launches on that band).
- Sibling arms run concurrently under the same 1015Z run in their own
  worktrees with their own output files — no shared writes. The sibling
  sim-launchparty-sense-a owns the meeting sense (`party-wiring.js`);
  this arm does NOT touch it.

## Canon (read first)

- docs/CANON.md: read. docs/MONSTER-WAVES.md (leave-counter canon): The
  Suburb — "comfort as a trap — you don't kill it, you ESCAPE it" — and
  monsters.json weaknesses: "you can't kill it — LEAVE. Navigation is
  victory; the fight is a timer". The 'leave' itself is CORRECT
  counterplay per canon. This arm does NOT change monster stats, does
  NOT touch the trick, does NOT touch gates/prices/deeds, and does NOT
  touch the veteran-guard rule (unmeasured — it needs a table-stage
  veteran to exist first).

## The build (frozen design)

An outmatched-avoid on the wild routers, using the SAME rule the
expedition gate uses — scope to the outmatched rule ONLY.

- New env flag `WILDAVOID=1` (node sims only; in the browser `process`
  is undefined, so the lever is off). Helper `wildavoidOn()` in
  src/js/win-plan.js next to `vetreengageOn()`.
- `winPlanFightParty(vid)` (src/js/win-plan.js): the gate's party
  construction extracted verbatim — sensed `[vid] +
  villagerFightAllies(vid)`, plus VETREENGAGE co-tasked plan members
  alive and on an expedition to the SAME target (tx/ty). Returns the
  party array. One source of truth for the party; the gate and the
  wild check both call it.
- `winPlanOutmatched(vid, mdef, party)` (src/js/win-plan.js): the
  expedition gate's OUTMATCHED rule as a pure read — wave >= 4 AND
  (party < 3 OR not all armed OR not all armored) → `{avoid: true,
  reason: 'outmatched', party}` else null. NO plan mutation, NO plan
  seeding, NO bumps, NO veteran-guard, NO SEEK, NO trick-hold. If
  `party` is not passed it is computed via `winPlanFightParty`.
- `winPlanFightGate` refactored to use both helpers for its outmatched
  branch (party computed once, passed in; the branch's existing side
  effects — plan stage fallback, seeding when no plan, `avoidances`
  bump — stay in the gate, on the expedition path only).
  Veteran-guard and SEEK branches untouched, still using the same
  party variable. The refactor must be behavior-preserving: the D3
  replica-vs-live-gate cross-check (below) guards it on BOTH legs.
- Call sites (src/js/game.js ONLY):
  - `resolveWildMonsterEncounter`: after the post-flee rest guard,
    before the aidFight/fieldFight branch — if WILDAVOID is on AND
    NOT `opts.raid` AND the helper says avoid → say one line
    (`<First> sees <beast> and gives it room — not ready alone, going
    back for help.`), bump `wildAvoids`, return
    `{avoided: true, reason: 'outmatched', viaAid, wave, mid}`.
    The monster stays in the world; an open aid crisis stays open
    (another responder may answer); no plan is seeded or mutated.
  - `resolvePatrol`: after the gear-up / heal-check gates, before the
    aidFight/fieldFight branch — same check, same line, same bump,
    same sentinel return. (Patrol carried 0 wave-4+ meetings on the
    census band and the fleerepair2 band; it is included because the
    census's own gate-shape recommendation names
    `resolveWildMonsterEncounter / resolvePatrol` as the wild routers,
    and a future band could stage a patrol meeting. Expected effect
    on this band: none.)
- NOT touched: src/js/party-wiring.js, the meeting sense,
  src/js/comms.js (`aidFight`), the expedition path
  (`expeditionMonster`, already gated), the raid path (`opts.raid`
  exempt — defence at the haven door, like the post-flee rest guard),
  src/js/havenGrowth.js:917 (cornered raid defence), the veteran-guard
  rule, the Suburb trick, monster stats, gates/prices/deeds.

## Scope decisions (frozen, with the measurement that watches each)

1. **Foreign aid allies are NOT counted in the avoid's party.** The
   avoid judges the gate's party (sensed villagers + counted) ONLY —
   the same rule, same inputs the census priced. No gear read exists
   for foreign faces at the door, and inventing one would be a new
   rule. On the census band this is moot: none of the 18 would-avoid
   meetings had foreign help at the door (all 11 aid rows show
   `allyFromStart: false`, one sensed villager ally). The driver
   records `helpAtDoor` (foreign faces present) on every avoid row;
   if avoids-with-help > 0 on the panel, that is a metric-review item
   for the next run, not a re-score of this one.
2. **The avoid seeds no plan and mutates no plan.** The expedition
   gate's outmatched branch seeds a plan when none exists and falls
   the plan back to party/gear — that is expedition "go back for
   help" machinery, and carrying it onto the wild paths would move
   launches through a channel the census never priced. The wild avoid
   is the fight avoided, the line said, the count bumped — nothing
   else. Whether a wild avoid should seed a re-engagement plan is a
   design question for a later arm (VETREENGAGE already seeds on
   vFlee; an avoid is not a flee).
3. **The Suburb learning path is provably untouched by the rule on the
   census band.** All 8 census Suburb meetings carried partySize 3,
   allArmed, allArmored — the outmatched rule would NOT have fired on
   any of them, including the two pre-learning maulings (d89–90) that
   taught the trick. The B4 guard below measures this on the fresh
   band instead of assuming it.
4. **The one honest exception stands.** The census's would-avoid kill
   (104302 d127, a duo killing a Herald with the opening volley)
   shows an outmatched party can still win. The gate avoids the
   fight; it does not predict it. The panel reports wild wave-4+
   kills ctl vs arm as a reported metric so a kill collapse is
   visible; it is not a GO bar (one kill is noise).

## Calibration (frozen, from the census band 104301–104308)

- Wild wave-4+ meetings 113 (world-tick 62, aid 51, patrol 0);
  would-avoid 18 (world-tick 7, aid 11; ALL party-size or gear, 16
  eulogies, 2 deaths, 10 flees / 288 damage, 1 kill).
- Would-avoid shapes: aid 11/11 partySize 2, armed+armored (fires on
  size alone); world-tick mixed — 1 unarmed/unarmored trio (97
  taken), 1 duo kill, duos, 2 solos.
- Suburb: 8 meetings, partySize 3 / armed / armored on all 8, 0
  deaths, 49 damage taken total, trick known from d91.
- Expedition: 47 meetings, would-avoid 0, 26 live avoid/outmatched
  gate calls. Launches: 0 wave-4. Wall: national standing 3/8, rank
  0, table 0, wins 0, wave 4 8/8, wave 5 3/8, median survival 150.5d.
- Expectation for the fresh band (NOT a bar): ~10–20 wild
  would-avoids on ctl, ~2–3 avoids per seed on arm, Suburb slice
  untouched, launches unchanged (0 on the census band — the launch
  bar B2 is therefore judged on wave-3+ launch events as well as the
  wave-4 events; see B2).

## Pre-registered metrics (frozen)

Two legs, identical seeds, one shared baseline: MODE=ctl
(WILDAVOID unset) vs MODE=arm (WILDAVOID=1). Substrate both legs:
VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1, SEEKGATE unset, FIGHTALLY2
unset. Policy: competent verbatim. Horizon: 150d death-aware.

- **B1 (the avoid fires):** armed-leg wild avoids (`v4avoids` rows,
  wave >= 4, origin world-tick/aid/patrol) >= 50% of the control
  leg's would-avoid wild meetings (analyzer `classifyWouldAvoid`
  verbatim on ctl `v4encounters`). Contact precondition: ctl
  would-avoid wild meetings >= 8, else METRIC-BROKEN (population
  absent — the question is unanswered, not answered-no).
- **B2 (no launch loss):** wave-4 launch events (`dawnbidDeparts`
  rows with `result === 'launch'` and a wave-4 plan) armed >= 90%
  of ctl, AND launched instances (any-commit, frozen classifier)
  armed >= 90% of ctl. The census band staged 0 wave-4 launches, so
  the events half is judged on whatever the band stages (0/0 passes
  by the 90% rule only if both legs stage 0 — reported, not hidden);
  the instances half carries the bar when wave-4 events are absent.
- **B3 (the price banks):** armed-leg wild wave-4+ deaths (vDie
  outcomes on wild origins) <= ctl AND armed-leg wild vFlee damage
  (sum of `vTaken` over wild vFlee rows) <= ctl. Reported alongside:
  the avoided-slice counterfactual — ctl would-avoid deaths and
  flee-damage vs arm avoids (the banked price estimate).
- **B4 (Suburb harmless):** armed-leg wild Suburb deaths == 0 AND
  every armed wild Suburb meeting ends in vFlee / mFlee / avoid (no
  vDie) AND seeds where the village knows the Suburb trick at run
  end (`trickSuburbKnown`, driver final-state read) armed >= ctl - 1.
- **B5 (instrument):** 8/8 files per leg, exactly the frozen seed
  list, 0 instrument errors, missingHp 0, recMismatch 0, D3
  replica-vs-live-gate agreement >= 0.95 on expedition rows (n >= 5)
  on BOTH legs (guards the gate refactor). Trajectory control: the
  first diverging day per seed (daily-snapshot fingerprint) must be
  >= that seed's first avoid day, or no divergence when no avoid —
  the avoid is the only src change, so ctl vs arm must not diverge
  before its first effect.
- **Panel (§15):** `scripts/balance-panel.js compare` on the built
  panels must not return `regression_signal`. Any `regression_watch`
  line is investigated in the evidence file, not waived.

**Verdict: GO iff B1 && B2 && B3 && B4 && B5 && panel clean.**
**NO-GO iff any B fails with population present.**
**METRIC-BROKEN iff ctl would-avoid wild meetings < 8, or ctl wild
wave-4+ meetings < 40, or D3 n < 5 on either leg** (population
absent — unanswered, not answered-no). No re-scoring.

Reported (not gated): wild wave-4+ kills ctl vs arm; wild meetings
by origin ctl vs arm; avoids by origin/rule on arm; avoids with
foreign help at the door; wild deaths by origin; Suburb slice
(meetings, outcomes, trick-known seeds, damage taken); wall numbers
(national / table / wins, wave 4–5 unlocks, median survival) both
legs; sense-testing notes from transcripts.

## Design (seeds, policy, horizon, instruments)

- Pilot band: **104411–104418** (8 seeds, FRESH — verified
  2026-11-18: word-boundary grep of every
  `evidence/*/sim-*-prereg.md` for 104411–104418 returns 0 hits;
  word-boundary grep of all `evidence/**/*.md` returns 0 hits; the
  only "10441" substring hits anywhere are inside a long hash
  (`104417670682734`, evidence/2026-10-16/overtimedeath-summary.json).
  No forbidden/contaminated band list names this band. Rejected
  collisions found during the check: 104301–104308 is the
  fightgate-scope census band; 104201–104208 belongs to the sibling
  arm sim-expedroster-b; 103601–103608 is the seekgate/fleerepair2
  band; 103901–103908 is the launchparty band. Per the seed-band
  skill, a named band counts as used even without a judged corpus.)
- Horizon: 150d death-aware (the census horizon; the wall numbers
  and the avoid price are 150d phenomena — eulogy clusters run
  d129–150). Policy: competent verbatim
  (scripts/policies/competent.js).
- Substrate: VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 (the seekgate
  substrate, so the census calibration applies). FIGHTALLY2 unset.
  SEEKGATE unset (not on this base).
- Instruments (new files, distinct names — never modify shared
  analyzers or the sibling census files):
  `scripts/wildavoid-driver-a.js` (fightgate-scope driver copy:
  same recorder; MODE=ctl|arm, WILDAVOID validated per leg; wraps
  `resolveWildMonsterEncounter` + `resolvePatrol` to record `v4avoids`
  rows — day, vid, mid, wave, origin, viaAid, helpAtDoor, wild
  snapshot — from the avoid sentinel; adds the run-end
  `trickSuburbKnown` read per seed),
  `scripts/analyze-wildavoid-a.js` (fightgate-scope analyzer copy:
  same census tables per leg; adds the avoid tables, the B1–B5
  frozen judges, the trajectory control, and the Suburb guard;
  `classifyWouldAvoid` copied verbatim),
  `scripts/build-wildavoid-panels-a.js` (panel builder over the two
  corpora, same shape as the notickexact panel builder),
  `scripts/test-wildavoid-a.js` (proof: §1 live outmatched-avoid on
  both routers with trick-known / trick-unknown Suburb cases; §2
  helper-vs-gate agreement table incl. veteran-guard non-fire and
  SEEK non-fire; §3 raid exemption + post-flee-rest precedence; §4
  analyzer incl. --selftest; §5 driver exports).
- No confirm spend before the pilot verdict. IF the pilot is GO, a
  confirm may run in the same run (back-to-back rule) on a fresh
  16-seed band, verified fresh at that time and recorded in the
  evidence file — it is not pre-registered here and does not change
  the pilot verdict.
- PILOT GATE: the 8-seed two-leg sweep IS the pilot. A 1-seed 30d
  driver smoke precedes it (seed 104411, arm leg, same substrate)
  to prove the recorder writes `v4avoids` rows and the avoid fires;
  the smoke output is discarded, not judged — the judged corpora are
  the 8-seed 150d legs only.
- D-checks (instrument validity, run before the judged sweep):
  D1 repeatability — seed 104411, 60d, recorder ON, arm leg, run
  twice; output files identical except the `file` path. D2 wrap
  neutrality — same seed/days, recorder ON vs recorder OFF on the
  armed tip: daily fingerprints identical. D3 (in-analyzer, both
  legs) — replica vs live gate >= 0.95, n >= 5 (B5).
- Encounter-gear rule (Steve 2026-11-13): the panel stages the
  competent policy (geared scholar with a party) — never a fresh
  un-geared solo scholar. The proof test stages a geared scholar
  with a party for the live Suburb cases.
