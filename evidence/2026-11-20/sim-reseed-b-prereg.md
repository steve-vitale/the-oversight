# sim-reseed-b — PREREG (frozen before any judged sim)

**Arm:** sim-reseed-b — BUILD + guardrail confirm: the #2626 re-seed lever
(finding #2626, sim-findings.md). A dissolved plan (dead target) never
re-seeds unless its holder fights a wave-3+ beast, and the dawn pass keeps
committing party_launch for the targetless plan, so the holder launches
targetless on later days (12 post-block targetless launches on the
deadsuppress armed leg). This arm is a DIFFERENT theory of the cost from
the two held fixes: re-seed the plan BEFORE committing, so blocked hunters
get back to real hunts instead of stalling (on 106081 the two blocked
hunters never fought again and the village stalled at standing 199).

**Branch:** `sim-reseed-b` (worktree
`~/workspace/worktrees/sim-reseed-b`). Base: master `e103a64cc`
(journey-crisis r257 adoption closeout).

## Read first (not re-measured)

- `evidence/2026-11-20/sim-deadsuppress-b.md` + prereg and
  `evidence/2026-11-20/sim-targetless-b.md` + prereg (read from the held
  branches `sim-deadsuppress-b` / `sim-targetless-b` via `git show` —
  they are NOT in this tree): the same-day suppression (HELD unmerged)
  and cross-day suppression (HELD unmerged) already close the hole as
  defined. This arm does NOT port them and does NOT merge them.
- sim-findings.md entries #2626 and #2621 (quoted in the task brief).
- docs/CANON.md + docs/MONSTER-WAVES.md (read before building).
- CANON GAP (inherited, stated not invented): no canon doc covers
  expedition destination picking (haventarget CANON GAP) — the re-seed
  picks a TARGET TYPE from what the holder has heard, never a
  destination tile; the destination stays the existing ranging logic
  (plan.node when set, else the usual ranging target).

## STEP 0 — WHAT SHIPS (frozen design)

**PRIMARY: rumor-based re-seed at the commit point.** When a plan's
target is dead at commit time, re-seed the plan's target from rumors
the holder has actually heard — perception-gated: only monsters the
holder has sensed or heard about, never the global roster. The
re-seed fires at the COMMIT point (both departure paths), not at the
dawn bid: the dawn pass still bids, the commit decides.

**FALLBACK: plan expiry.** If no re-seedable rumor exists, the plan
expires (dissolves with a fireside beat) instead of lingering
targetless. The expiry carries its own commit-point hold for the
expired plan (see decision 5) — it is part of THIS lever, not a port
of the held suppression.

**Why re-seed is primary (coordinator's brief + this arm's call):**
the targetless arm proved the hold-until-re-seed risk is real
(106081: two held hunters never hunt again, village stalls at
standing 199) and that the re-seed path works in live play two ways
(companion mirror, lived fights) — but only when a lived fight finds
the holder. A rumor-based re-seed gives the holder a live trail
immediately, from knowledge they already hold, instead of waiting
for a fight that may never come. Expiry alone would be the
suppression by another name; the re-seed is the new theory.

### Coordinator design decisions (recorded here, not re-litigated mid-run)

1. **SCOPE: dead targets and this lever's own expiries ONLY.**
   The commit check fires only when (a) the plan has a target that
   is dead per the liveness rule below, or (b) the plan carries THIS
   lever's expiry stamp (`plan.reseedExpiryDay` set) and is still
   targetless. Never-targeted targetless plans are NOT touched: on
   control, targetless launches run 16–46 per seed — HavenTick-seeded
   plans launching before any fight-seed, the village's normal
   wandering shape. Blocking ALL targetless `party_launch` would idle
   every plan that never got a fight-seed and is a different, much
   bigger lever, not this fix.
2. **LIVENESS RULE (re-implemented fresh on master, same rule as the
   held gate's — stated, not silently bundled).** The plan's target
   TYPE is dead when the village has slain 1+ of it
   (`state.villageSlain`) AND no sighting of the type has been noted
   since the kill day (`state.villageLastSeenDay`, stamped by the new
   `winPlanNoteSighting` from `fieldFight` on every live contact;
   dated kill day from `state.waveKillLog`). A sighting ON the kill
   day does not re-open the type (day granularity cannot order
   same-day events). An undated kill fails OPEN. Type-level, not
   instance-level: the plan store holds a target type, never a
   monster instance identity. This rule + stamp are part of THIS
   lever because a re-seed that cannot tell dead from live is
   meaningless; the code is written fresh on master — no held-branch
   file is copied or merged, and the held gate
   (`winPlanGateDeadTarget`), same-day suppression
   (`winPlanDeadTargetHeldToday`), and cross-day dissolved hold
   (`winPlanDeadTargetDissolved`) are NOT built here. The re-seed
   mechanism is judged on its own bars; the expiry's hold (decision
   5) is the stated precondition that keeps an expired plan from
   re-creating #2626, and it is this lever's own code on its own
   stamp.
3. **RE-SEED CANDIDATES (perception-gated, ranked, deterministic —
   no RNG).** Wave floor: candidate wave ≥ max(3, `plan.needWave`
   || 3) — never hunt below the plan's own wave. Sources, in order:
   (1) the holder's own fought species — `agencyState().know[vid]
   .fought`, most recent first (species they actually fought);
   (2) the holder's own fight memories —
   `state.village.monsterSightings[vid]`, most recent day first
   (earned only by actually fighting a living world monster at that
   tile; never gossip, never the monster list);
   (3) village fire knowledge — `state.villageLastSeenDay` keys,
   most recent first (types the village has seen alive in a fight;
   the deed talk tells everyone, per the HavenTick engagement
   comment). NO freshness window on rumors: liveness is the filter —
   a type fought 40 days ago with no kill since is still live
   (monsters keep spawning); requiring freshness would shrink the
   pool for no reason. Exclusions: the dead target itself (fails
   liveness anyway); `suburb` when FLEEREPAIR2=1 (same leave-counter
   rule as `winPlanSeedFromFight`); a candidate with no monster def
   (wave unknown — fail closed). First passing candidate wins.
   On re-seed: `plan.target` = candidate, `plan.needWave` =
   candidate wave, `plan.node` = null (the old node points at the
   dead target's tile; the launch re-ranges), `plan.party` = []
   (re-form for the new target), `plan.reseedExpiryDay` = null
   (clear any old stamp), bump `planReseeds`, fire the re-seed beat.
   Stage is unchanged (the launch advances it to `'hunt'`).
4. **EXPIRY (fallback).** No re-seedable rumor → dissolve:
   `plan.target` = null, `plan.node` = null, `plan.party` = [],
   `plan.stage` = `'party'`, `plan.holdSinceDay` = -1,
   `plan.reseedExpiryDay` = day, bump `planExpiries`, fire the
   expiry beat, return `'expired'` — the caller returns `'normal'`
   (the plan is gone; the villager's day proceeds, same semantics
   as the held gate's block). The plan record PERSISTS (deleting it
   would let HavenTick seed a fresh targetless plan the next day
   with no stamp — the same hole one day later via a fresh plan).
   A later lived wave-3+ fight can still re-seed the expired plan
   via `winPlanSeedFromFight` (it retargets stage-`'party'` plans;
   the stamp is inert once a target exists — the commit check only
   consults it while targetless).
5. **EXPIRY HOLD (this lever's own, on its own stamp).** A later
   commit for an expired-targetless plan re-attempts the re-seed
   first (new rumors may have arrived since the expiry); if none,
   return `'held'` — stay at Haven for that commit, silent, no
   bump, no second beat. This is NOT the held suppression: different
   stamp (`reseedExpiryDay`, not `deadTargetHoldDay`), different
   trigger (this lever's expiry, not the held gate's dissolve), and
   it re-attempts the re-seed on every commit instead of holding
   blind. Without it, expiry would recreate #2626 on the next dawn.
6. **BEATS (no silent actions — Steve's law; the dissolve beat was
   already owed from #2621).** One deterministic line per re-seed
   and per expiry via `this.say`, holder named (`disp`), types named
   as the village knows them (`monsterNoun` + `articlePhrase`),
   SYSTEM prefix when `systemArrived` — same pattern as the
   deadsuppress beat. Both lines contain "put down" contiguously so
   the driver's `SAY_RE` filter keeps them in the corpus transcript
   (the deadsuppress beat was dropped by the filter for wording
   "put that kind down" — this arm words around it). No
   `Math.random` anywhere in the new code path.
7. **MECHANISM — commit point, both departure paths, flag-gated
   (`PLANRESEED=1`).** New method `winPlanCommitDeadTarget(vid)`
   (win-plan.js) returns `'reseeded'` | `'expired'` | `'held'` |
   null (null = flag off, no plan, live target, never-targeted
   plan, or nothing to do — proceed as before). Callers: (a) brain
   path — `vbrainExecuteDepart`'s `party_launch` branch, before the
   first `startExpedition` (`'expired'` → `'normal'`, `'held'` →
   `'hold'`); (b) `winPlanDepart`, after the `'gear'` stage advance,
   before the stage launch block (same mapping). The method reads
   the plan WITHOUT creating it (never the spark that ignites the
   plan system). `winPlanNoteKill`, `winPlanFightGate`,
   `winPlanCands` (dawn bid), and `winPlanSeedFromFight` are
   untouched — the bid still fires; the commit decides.
8. **NO other behavior change.** No new stat bump besides
   `planReseeds` / `planExpiries` (holds bump nothing); the expiry
   clears the target in exactly ONE place in win-plan.js
   (`plan.target = null` occurs exactly once file-wide — the expiry
   branch; the re-seed never clears the target, it retargets it);
   no RNG added; the sighting stamp is the only `fieldFight`
   addition (2 call sites: evade return + final return; the
   `alreadyDead` early return never stamps). [CORRECTION at build
   time, before any judged sim: the first draft of this prereg
   guessed the count as two; the built code has exactly one
   `plan.target = null` — the expiry branch. The design is
   unchanged; only the pin count is corrected.]

## Primary metric (FROZEN — §14 metric binding)

**Dead-target share of launches, control vs armed, identical
seeds**, classified by the reseed analyzer
(`scripts/analyze-reseed-b.js`, ported from the deadtarget analyzer
+ reseed/expiry counting — see below) from the recorder corpus.

- **GO: dead-target share → 0 armed with armed launches ≥ 6
  (dead 0 AND launches ≥ 6 — the 8-seed floor was ≥ 4; 12/8 × 4 =
  6).** The control leg is expected to reproduce the held control
  corpus closely on the 106081–106088 slice (6 launches, dead 2/6,
  the 106084 d136/d141 herald re-launch pair) — but NOT necessarily
  launch-for-launch: the policy moved under us (competent.js sha
  `150229eda010` → `1884c8852d38`, journey-landing r149
  reachability pre-check in `beastDodgeMove`; game-code delta
  between bases is only `build.js` (1 line) + `convo-beats.js` (15
  lines) — no departure/fight-gate file touched). A control that
  differs on the slice is a recorded delta, not a STOP: the
  armed-vs-control comparison ON THIS BASE is the verdict. The
  control leg IS the baseline for this base.
- **Guardrail (REVISED — coordinator decision, recorded verbatim):**
  "the guardrail missed by exactly 1 seed (survived 5→4) and 3 days
  median on two independent arms (deadsuppress, targetless) with
  DIFFERENT seeds flipping — the signature of an 8-seed noise floor,
  not lever harm; starvation improved 2→1 on both. Revised guardrail
  for this arm, judged on a 12-seed band: survived >= control−1 AND
  median survival >= control−5d AND starvation <= control+1."
  Judged on median survival (gameDays) AND survived-count AND
  starvation deaths together as stated — a miss on any one is a
  guardrail miss.
- **POST-BLOCK BAR (GO-gating): post-expiry targetless-launch count
  of 0 across the whole run**, counted by the analyzer from
  `dawnbidDeparts` rows after any expiry. An expiry is a
  `dawnbidDeparts` row with result `'normal'`, `winPlanAction`
  `'party_launch'`, stage `'party'`, target null, `vidExped`
  false, `companionExped` false (same row shape as the held gate's
  block, cross-checked against `winPlanStats.planExpiries` — a
  mismatch means the expiry set is suspect: STOP and investigate,
  never silently count). A post-expiry targetless launch is a
  `dawnbidDeparts` row with result `'launch'`, target null, day
  strictly after an expiry day for the same vid, deduped by (vid,
  day). If the count is not 0, the run is NO-GO regardless of the
  launch share.
- **RE-SEED BAR (GO-gating): the mechanism must fire in live play
  AND rescue holders.** (a) ≥ 1 rumor re-seed launch on the armed
  leg (a `dawnbidDeparts`/`v4departs` launch row whose
  `gate.targetBefore` differs from the row target — the re-seed
  retargeted at commit). (b) ≥ 2/3 of expired holders re-seed onto
  a live target within 7 days of their expiry (counting commit-time
  rumor re-seeds AND lived-fight retargets via `winPlanSeedFromFight`
  `v4seeds` rows). If ZERO expiries occur on the armed leg, the
  re-seed bar is METRIC-BROKEN (the lever never fired — no evidence
  either way; report, do not pass on zero evidence).
- **HOLDERS-FIGHT-AGAIN BAR (GO-gating): ≥ 2/3 of expired holders
  fight a wave-3+ beast within 14 days of their expiry** (counted
  from `v4encounters` rows with vid == holder, `v4seeds` rows with
  vid == holder, or a re-seed launch by the holder). The 106081
  stall this prices: on the targetless armed leg 2 of 4 blocked
  holders never fought again.

## Secondary (reported, not GO bars)

- The 106084 re-launch pair (d136/d141) must not recur armed.
- `planExpiries` (per-seed `winPlanStats`) must fire on the armed
  leg: ≥ 1 expected.
- Post-expiry hold rows ≥ 1 expected on the armed leg (reported,
  not GO): `dawnbidDeparts` rows with result `'hold'`, target null,
  stage `'party'`, day after an expiry day for the same vid —
  evidence the expiry hold fired on later days.
- Re-seed beats + expiry beats visible in the corpus transcript
  (`vetSays`, SAY_RE-matched "put down") and proven live (§F live
  check).
- Scale-wall numbers every leg (national / table / wins, wave 4–5
  unlocks, median survival, starvation).

## Horizon, seeds, policies, substrate (FROZEN)

- **Horizon: 150d, death-aware** (same as the held run).
- **Seeds: 106081–106092** (106081–106088 as before + 106089–106092
  fresh — freshness verified below).
- **Policy: competent verbatim** (scripts/policies/competent.js;
  policy sha256[:12] verified on this base BEFORE the freeze:
  `1884c8852d38` — differs from the held legs' `150229eda010`
  because the base moved; see Primary metric).
- **Substrate (both legs, verified on master e103a64cc):**
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1`
  (all five flag readers present in `src/js`).
  `ALLYSLOT3` and `LAUNCHSURVIVE` verified absent from `src/js`
  (no references); keep both legs identical. The driver enforces
  all of this at runtime — a stop is a loud failure, never a
  re-scope.
- **Legs:** control (`PLANRESEED` unset) and armed
  (`PLANRESEED=1`), each 12 seeds, same driver
  (`scripts/reseed-driver-b.js`, ported from the deadgate driver,
  MODE=reseed), same analyzer (ported + extended, see below). RUN
  names `reseed-b-control` / `reseed-b-armed`; OUTDIRs:
  `perseed-reseed-b-control` / `perseed-reseed-b-armed`.
  Before/after comparison through the balanced panel
  (`scripts/balance-panel.js` via
  `scripts/build-reseed-b-panels.js`, `--out
  evidence/2026-11-20/reseed-b-panel`) per §15.
- **Chunking:** sweeps chunked to ≤ 8 seeds per exec call (12-seed
  legs run as 8 + 4).

## Seed-band freshness check (recorded at freeze)

Band 106081–106088 is a **DESIGNATED REUSE** — designated for
exactly this chain by the 0130Z adoption closeout (tracker blank
#2). Prior uses are the #2617 chain itself (diag, gate, gate-replace,
deadsuppress, targetless) plus sibling arms that measured the same
launch population. No unrelated fresh band is consumed; the reuse is
deliberate (same-band reproduction of the diag/control is the point
of the run). Seeds 106089–106092 are **FRESH**: grep of every dated
prereg under `evidence/*/sim-*-prereg.md` in this tree (base
e103a64cc) for `106089|106090|106091|106092` returns NOTHING, and a
second grep for `10608[0-9]|10609[0-9]` returns only the eight
106081–106088 seeds (named in 8 preregs). The held-branch preregs
(sim-deadsuppress-b, sim-targetless-b) are not in this tree but are
known from the findings log to name only 106081–106088. No
forbidden/contaminated band list names this band (searched the
tracker + `hidden_files/` for "forbidden band" / "contaminated
band" — no single list file exists; the tracker cites band
reservations inline).

## Analyzer extension (port + extend, do not rewrite)

`scripts/analyze-deadtarget-b.js` is ported to
`scripts/analyze-reseed-b.js` (launch classification, gate
cross-check, block-rule, post-block count — unchanged in
semantics) with:
- `files` bar 8 → **12**; `BARS.poolLaunches` floor 4 → **6**.
- `blocksOf` → `expiriesOf` (same row rule; cross-check vs
  `winPlanStats.planExpiries` instead of `deadTargetHolds`).
- `reseedsOf(d)`: launch rows (both `dawnbidDeparts` and
  `v4departs`) with a `gate` snapshot whose `targetBefore` is
  non-null and differs from the row target — the commit-time
  retarget. Returns rows + per-seed counts + from→to pairs.
- `reseededWithin(d, expiries, days)`: for each expiry, whether
  the holder has a live target within `days` — a re-seed launch
  row for that vid, or a `v4seeds` row for that vid (lived-fight
  retarget). Returns per-expiry {re-seeded, day, via}.
- `holdersFightAgain(d, expiries, days)`: for each expiry,
  whether the holder records a wave-3+ fight within `days` —
  `v4encounters` row with vid == holder, `v4seeds` row with vid ==
  holder, or a re-seed launch by the holder.
- Judge gains bars: `post-block` (post-expiry targetless 0),
  `reseed` (≥ 1 re-seed launch AND ≥ 2/3 re-seeded within 7d;
  METRIC-BROKEN when 0 expiries), `holders-fight-again` (≥ 2/3
  within 14d), `expiry-rule` (rule-expiries == planExpiries on
  every seed). Selftest gains §F (reseed rows, within-7d,
  fight-again) with the existing §A–§E kept green.

## Proof tests (before judged sims)

New `scripts/test-reseed-b.js` (the held gate test is NOT ported —
it tests held-branch code that does not exist here):
(a) CODE PINS: `winPlanCommitDeadTarget` exists, is flag-gated
(`planreseedOn` first, no state read when off), reads the plan
WITHOUT creating it; the commit hook runs before the first
`startExpedition` on the brain `party_launch` branch and before
the stage launch block in `winPlanDepart`; `winPlanNoteSighting`
exists and is flag-gated; the stamp is called exactly twice in
`fieldFights.js` (evade + final return; `alreadyDead` never
stamps); `plan.target = null` file-wide count pinned after the
build; no `Math.random` in the new code path; beats contain
"put down"; `winPlanNoteKill` / `winPlanFightGate` /
`winPlanCands` / `winPlanSeedFromFight` untouched by the lever
(no `reseed`/`planReseed` reference).
(b) LIVENESS: slain + kill, no sighting → dead; post-kill
sighting → live; same-day sighting → dead; never slain → live;
slain but undated kill → live (fail open).
(c) RE-SEED PICK: fought-species first (most recent), then
sightings, then village sightings; wave floor enforced (a wave-2
fought species does not re-seed a needWave-4 plan); suburb
excluded; dead candidate skipped; no rumor → null; flag off →
null.
(d) COMMIT (both paths, staged 106084-shape fixtures): dead
target + rumor → `'reseeded'`, plan retargeted, node cleared,
party cleared, `planReseeds` 1, beat fired once, launch proceeds
on the NEW target; dead target + no rumor → `'expired'`, plan
targetless stage `'party'`, stamp set, `planExpiries` 1, expiry
beat once, caller returns `'normal'`, nobody departs; expired +
no rumor (later commit) → `'held'`, silent, no bump, no second
beat; expired + new rumor → `'reseeded'`; never-targeted plan →
null (untouched, launches targetless as before); live target →
null; flag off → null everywhere, old behavior launches.
(e) STAMP: `winPlanNoteSighting` stamps the day (flag on) and is
a no-op (flag off); live fieldFight stamps on a loaded game (§F
live check, one-off script, as deadsuppress did).
(f) DRIVER SMOKE: control + armed 1-seed smokes through the
ported driver reproduce the expected shapes (control launches
the dead target; armed re-seeds or expires).

## Metric review (carried from targetless, plus new)

1. The analyzer's `live` class means "last seen alive in a
   fight", not "alive now" — unchanged.
2. Same-day kill-then-sighting is conservatively blocked —
   unchanged.
3. The gate's `villageLastSeenDay` stamp covers every `fieldFight`
   contact including arena/contest fights — unchanged (this arm's
   stamp is the same two call sites).
4. The armed launch count may fall below the control's — the bar
   is "dead 0 AND launches ≥ 6", no fixed denominator — unchanged
   in shape, floor scaled 4 → 6 for the 12-seed band.
5. **Guardrail REVISED (coordinator decision, verbatim in Primary
   metric above): survived >= control−1 AND median >= control−5d
   AND starvation <= control+1, judged on the 12-seed band.** This
   replaces the no-noise-allowance bar the last two arms failed on
   the same numbers.
6. **Review carried forward:** on an 8-seed band the guardrail
   turned on a single village; the 12-seed band + stated allowance
   is the answer decided BEFORE these legs run, not after.
7. **Instrument note:** the recorder's `SAY_RE` filter drops beats
   not matching veteran/blooded/put down/etc. This arm words both
   beats with "put down" contiguously so they survive the filter;
   the beat is proven live (§F) regardless.
8. The analyzer's median is over `gameDays`, not raw `days` —
   same instrument as the held run; both legs judged on it.
9. Follow-up left OPEN (do NOT build here): ally-holder learning
   of kills (`winPlanNoteKill` killer-only) — unchanged.
10. The `dawnbidDeparts` `'normal'` rows with a targetless plan
    are NOT all expiries: stale commits (commit day ≠ today)
    return `'normal'` with the companion already out. The expiry
    rule (`companionExped` false) separates them — validated on
    the held corpora by the targetless arm and re-validated here
    against `planExpiries`.
11. **NEW — the re-seed changes the plan's target mid-commit:**
    the analyzer reads the re-seed from `gate.targetBefore` vs the
    row target. A re-seed that launches is counted as a launch on
    the NEW target (its class is judged by the new target's last
    fight, not the dead one's).
12. **NEW — the hold-until-re-seed risk is the thing this arm
    prices:** if blocked holders still do not fight again (the
    106081 stall), the re-seed bar + holders-fight-again bar fail
    and the arm is NO-GO even if the guardrail passes — the theory
    is the re-seed, not the hold.
13. **NEW — control reproduction is a comparison, not a STOP:**
    the policy moved (competent.js sha changed) between the held
    base and this base; the control leg on this base is the
    baseline. The 8-seed slice is still compared to the held
    corpus launch-for-launch in the evidence file.

## Convergence state

Axis: winnability chain (wild ally-join → wave-4 kills → veterans
→ readiness-5 release → wave-5 facing → full seat), dead-target
gate step (#2626 re-seed). Status at freeze: **PREREG FROZEN,
BUILD + LEGS OWED** (this prereg freezes the re-seed design; the
build, proofs, and judged legs follow it). The gate + suppressions
stay HELD, unmerged, on their branches (sim-deadgate-replace-b
tip d75366901, sim-deadsuppress-b tip 3e7cf93d0,
sim-targetless-b — NOT merged).
