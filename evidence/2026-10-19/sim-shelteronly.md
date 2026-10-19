# sim-shelteronly — bar-the-door raid doctrine lever (flesh-out loop, 2026-10-19, ARM sim-shelteronly)

Run: fleshout-20261019T1555Z, arm sim-shelteronly. Axis: scale-onramp (the blocking axis).
LEVER RUN — one new policy-side file (scripts/policies/shelteronly.js), zero src/js changes.

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law; "Monster encounters are
fought, not rolled", Steve 2026-10-08), docs/PRESERVATION.md (pantry defense
relevance). The raid system: src/js/havenGrowth.js (havenRaidTick — reactive
raids, wealth draws teeth, the defender draft, lingering gorgers); the
shelter verb: src/js/shelter.js (engine-honest: the raid draft cannot spend
sheltered villagers; the muster discipline is "outlast it," not "feed it").
This arm is the OPEN other half of the raidwall decomposition named next
(evidence/2026-10-19/sim-raidwall.md, KILLED at pilot: -18.2% raid deaths vs
the 30% bar; wave-4 guardrail breached 13 vs 16). The hold-only half was
tested separately (evidence/2026-10-19/sim-scholarraid.md, KILLED at pilot:
-17.0% vs 30% bar, ALL guardrails pass) — its diagnosis is required reading:
the wave-4 cost was isolated to the village-wide hold, the residual is the
forced bedroll fight, aid-crisis deaths are 98% AT HAVEN. The window taxonomy
(evidence/2026-10-19/sim-windowsurvive.md) measured raids as 40/72 window
deaths with scholars dying 42 vs villagers 30.

## Design calls (documented — the doctrine)

While a raid is live (a raid crisis unresolved, or raiders lingering at the
treeline — the same conditions the raidwall probe used):
1. **BAR THE DOOR** — the roster shelters via the engine-honest
   Game.shelterVillagers verb (the raid draft cannot spend sheltered
   villagers, the wild router cannot jump them, duties skip them). The
   scholar is never sheltered (the engine's verb skips the scholar's vid).
   One posture beat per raid, then quiet.
2. **RELEASE ONLY OURS** — released with releaseShelter when the window
   closes — ONLY the vids this layer sheltered, tracked in the layer's
   ledger. Never the game-side wave-4+ muster's (the engine's
   shelterMusterCheck shelters and stands down on its own; if the muster
   holds, the village stays mustered until the engine's own all-clear).
3. **PURE DELEGATION ELSEWHERE** — NO scholar travel-hold (that half was
   the wave-4-cost suspect and scholarraid tested it separately — do not
   re-add it). No expedition gates, no duty pauses beyond what the
   engine's sheltered flag already does (duties skip sheltered — the
   engine-honest cost of the posture, same as the game's own muster).
   The bedroll fight is fought, not fled (pure delegation).

"No aid parties leave Haven" is already true on the sweep substrate
(helpcall OFF, socialite not in the stack). Unmet raiders linger and gorge
— the honest price, measured by the sweep. The game-side auto-muster
(shelter.js, wave-4+ only) already endorses the shape — this layer extends
the shelter to all raids (sub-wave-4 raids the engine muster doesn't cover).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the sweep)

**PRIMARY:** raid-channel deaths per run, armed vs control on IDENTICAL
seeds, PAIRED DELTAS (the taxonomy's death-channel classifier, identical
by construction).

**GO:** >=30% fewer raid-channel deaths on the armed arm.

**GUARDRAILS (all must hold):**
- wave-4 unlocks within ±2/16 runs of control
- median survival no worse than -10d
- no new death mode (a new cause counts at >=2 events — the revised rule)
- starvation deaths <= control+1 (paired per run)

**SECONDARY (report, don't judge):** scholar-fight-at-haven vs aid-crisis
split (does shelter move the aid-crisis half?); wall numbers
(national/table/wave-4/wave-5/wins); shelter engagement (shelter-days,
sheltered-vid-days).

**Horizon:** 180d death-aware (dead villages stop simulating, +10d tail max).

**Seeds:** pilot 8 (63801–63808, the taxonomy seeds for comparability) ×
{leadfeast, belongfeast} × {control, armed} = 32 runs. IDENTICAL seeds on
both arms (paired before/after).

**Policies:** competent-player policy; substrate to match the taxonomy:
pre-seat + windefer, VETREL=1, SEATDRIVE=0.
Stack: withSeatDrive(withWinDefer(withVetrel(withReposition(TF base))))
+ withShelterOnly outside on the armed arm only.
Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
WINDEFER=1 NODEWITNESS=1 VETREL=1 SEATDRIVE=0 (+ SHELTERONLY=1 armed only).

**Instrument:** scripts/probe-shelteronly-20261019.js (reuse-fork of
probe-scholarraid-20261019.js: identical policy stack + identical pure
death-capture reads + identical death-channel classifier; the deliberate
changes: the shelteronly layer outside on the armed arm, the ARM dimension,
the winarm tag, Game.state.soLedger capture),
scripts/analyze-shelteronly-20261019.js (arm-shift comparison against the
pre-registered bars), scripts/shelteronly-transcripts-20261019.js (SAY-line
probe around raid events for sense-testing), scripts/build-shelteronly-panels.js
(§15 balanced-panel compare builder),
scripts/test-shelteronly-20261019.js (proof: GATE + RAID-ACTIVE +
SHELTER + RELEASE-OURS + NO-TRAVEL-GUARD fixtures, SMOKE, DET —
proof test verified before the sweep; DET pins byte-identical trajectories
until the first shelter morning; KILL-PROTOCOL INFO-SKIP path verified
green post-kill).

**Balanced panel (§15):** the before/after comparison runs through
scripts/balance-panel.js — the panel is the instrument, the GO threshold
above is the judge. Compare .md attached below.

**No [needs-eyes]:** policy-side sim lever, no player-facing change.

## Metric review

(pre-registered doubts — for the NEXT run if the metric proves wrong; the GO bar above binds THIS run, §14)
1. **Raid deaths are clustered within runs** (the taxonomy: 63808 lost 4
   scholars in 3 days). 30% fewer raid deaths could come from 2 quiet runs,
   not a real effect. The per-run distribution is reported alongside the
   pooled count; a confirm would use per-run survival as primary.
2. **Classifier noise in the raid channel** (raidwall diagnosis #4): the
   d88 "raid" death (Mai, killed by the Stranger) counted as raid-channel
   because a raid crisis happened to be live. The metric inherits this
   noise; the primary is conservative (some counted deaths were never
   addressable by raid defense). Named next: killer-join hardening for the
   raid channel (raidwall named next #2).
3. **Night-1 draft**: the raid fires at endDay; the policy shelters on the
   morning daily after. Night-1 defender deaths are unpreventable
   policy-side — the doctrine only reaches post-night-1 deaths + the draft
   on later raid days. If the pilot shows the residual is all night-1,
   that's the named next (a proactive posture), not a re-score.
4. **Shelter economics**: bar-the-door trades defender deaths for gorge +
   paused villager duties while sheltered (the engine's sheltered-flag
   cost). If the pantry can't carry it, the starvation guardrail fires —
   that's the honest price signal, not a reason to re-score.
5. **The game-side muster already covers wave-4+ raids** (raidwall
   diagnosis #3): the policy shelter only adds value on sub-wave-4 raids.
   On wave-4+ the layer should find everyone already sheltered (n=0 new).

## Results

(FILLED AFTER THE SWEEP — pre-registration above binds this run.)

## Verdict

**KILLED AT PILOT (NO-GO).** Primary: raid-channel deaths 94→78 (-17.0%, vs ≥30% GO bar). MISS.

Per-run: control [7,5,7,5,9,1,7,3,8,11,5,1,13,2,6,4], armed [6,4,4,4,9,1,7,3,8,9,5,3,3,2,6,4]. The effect is real but small and uniform — no single run drives it.

**Diagnosis:** the shelter-only doctrine trims the raid tail but cannot reach the night-1 draft deaths or the haven-concentrated aid-crisis deaths (raidwall diagnosis: 98% AT HAVEN). Policy-side raid defense is exhausted as a lever — this is the third raid-defense arm killed at pilot (raidwall -18.2%, scholarraid -17.0%, shelteronly -17.0%). The residual is structural, not doctrinal.

(Run interrupted before closeout; verdict computed from corpus summary by recovery pass 2026-10-19.)

## Diagnosis (for the next arm)

## Village assessment

## Sense-testing (SENSE-TESTING LAW)

## Named nexts

## Out-of-arm findings

## Convergence

## Files

- scripts/policies/shelteronly.js — the lever (this run)
- scripts/test-shelteronly-20261019.js — proof (this run)
- scripts/probe-shelteronly-20261019.js — sweep fork (this run)
- scripts/analyze-shelteronly-20261019.js — arm-shift comparison (this run)
- scripts/shelteronly-transcripts-20261019.js — SAY-line probe (this run)
- scripts/build-shelteronly-panels.js — §15 panel compare builder (this run)
- evidence/2026-10-19/perseed-shelteronly/{control,armed}/{leadfeast,belongfeast}/s63801–s63808.json — 32 per-seed JSONs (this run)
- evidence/2026-10-19/shelteronly-corpus-summary.json — corpus + arm-shift (this run)
- evidence/2026-10-19/shelteronly-panel-primary.{json,md} + .json.gz pair — §15 panel compare (this run)
- evidence/2026-10-19/shelteronly-transcripts/ — sense-testing transcripts (this run)
- evidence/2026-10-19/sim-shelteronly.md — this file
- ZERO src/js changes (policy-side only)
