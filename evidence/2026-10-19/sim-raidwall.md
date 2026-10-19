# sim-raidwall — hold-Haven raid doctrine lever (flesh-out loop, 2026-10-19, ARM sim-raidwall)

Run: fleshout-20261019T07xxZ, arm sim-raidwall. Axis: scale-onramp (the blocking axis).
LEVER RUN — one new policy-side file (scripts/policies/raidwall.js), zero src/js changes.

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law; "Monster encounters are
fought, not rolled", Steve 2026-10-08), docs/PRESERVATION.md (pantry defense
relevance). The raid system: src/js/havenGrowth.js (havenRaidTick — reactive
raids, wealth draws teeth, the defender draft, lingering gorgers); the
shelter verb: src/js/shelter.js (engine-honest: the raid draft cannot spend
sheltered villagers; the muster discipline is "outlast it," not "feed it").
Named next from the parent task: RAID DEFENSE THAT NEVER MOVES PEOPLE — the
window-survival taxonomy (evidence/2026-10-19/sim-windowsurvive.md) measured
raids as 40/72 window deaths (scholars defending Haven, villagers in
aid-crisis); veteran-production (0-for-11) and window-support (6 variants
NO-GO across 224 runs — field support kills people) are CLOSED.

## Design calls (documented — the doctrine)

While a raid is live (a raid crisis unresolved, or raiders lingering at the
treeline):
1. **HOLD HAVEN** — the scholar does not leave. Outward travel is refused at
   the verb (Game.travelTo wrapper: at-Haven + destination != Haven -> null
   while the raid is live; homeward travel and mid-fight barrier exits always
   delegate). The base daily runs its Haven chores normally — only the
   outward legs (forage trips, hunts, expeditions, the vetrel veteran hunt)
   no-op. No sallies while teeth are at the door.
2. **BAR THE DOOR** — the roster shelters via the engine-honest
   Game.shelterVillagers verb (the raid draft cannot spend them, the wild
   router cannot jump them, duties skip them). Released when the window
   closes (releaseShelter, only the vids this layer sheltered — never the
   game-side wave-4+ muster's). Unmet raiders linger and gorge — the honest
   price, measured by the sweep.
3. **THE BEDROLL FIGHT IS FOUGHT, NOT FLED** — the fight wrapper is pure
   delegation. A raider at the bedroll is static defense; fleeing moves the
   scholar off Haven at night. (Sense-testing reads this as defense, not
   cowardice.)

"No aid parties leave Haven" is already true on the sweep substrate
(helpcall OFF, socialite not in the stack); the doctrine's binding
constraint is (1)+(2). The game-side auto-muster (shelter.js, wave-4+ only)
already endorses the shape — this layer extends the muster to all raids.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the sweep)

**PRIMARY:** raid-channel deaths per run, armed vs control (the taxonomy's
death-channel classifier, identical by construction).

**GO:** >=30% fewer raid-channel deaths on the armed arm.

**GUARDRAILS (all must hold):**
- wave-4 unlocks within ±2/16 runs of control
- median survival no worse than -10d
- no new death mode (a new cause counts at >=2 events — the
  winsupport-decomp metric-review revision, applying to this next run)
- starvation deaths <= control+1

**Horizon:** 180d death-aware (dead villages stop simulating, +10d tail max).

**Seeds:** 8 (63801–63808, the taxonomy seeds for comparability) ×
{leadfeast, belongfeast} × {control, armed} = 32 runs. IDENTICAL seeds on
both arms (paired before/after).

**Policies:** competent-player policy; substrate to match the taxonomy:
pre-seat + windefer, VETREL=1, SEATDRIVE=0.
Stack: withSeatDrive(withWinDefer(withVetrel(withReposition(TF base))))
+ withRaidwall outside on the armed arm only.
Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
WINDEFER=1 NODEWITNESS=1 VETREL=1 SEATDRIVE=0 (+ RAIDWALL=1 armed only).

**Instrument:** scripts/probe-raidwall-20261019.js (reuse-fork of
probe-windowsurvive-20261019.js: identical policy stack + identical pure
death-capture reads + identical death-channel classifier; the deliberate
changes: the raidwall layer outside on the armed arm, the ARM dimension,
the winarm tag, Game.state.rwLedger capture),
scripts/analyze-raidwall-20261019.js (arm-shift comparison against the
pre-registered bars), scripts/raidwall-transcripts-20261019.js (SAY-line
probe around raid events for sense-testing), scripts/build-raidwall-panels.js
(§15 balanced-panel compare builder),
scripts/test-raidwall-20261019.js (proof: GATE + RAID-ACTIVE +
TRAVEL-GUARD + SHELTER fixtures, SMOKE, DET — 34/34 pass; DET pins
byte-identical trajectories until the first raid-response morning).

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
2. **The taxonomy base moved**: the 40/72 figure was measured on base
   8433576dc; this sweep re-sweeps the control on current master. The GO
   bar reads against the re-swept control, never the taxonomy corpus.
3. **Shelter economics**: bar-the-door trades defender deaths for gorge +
   paused production. If the pantry can't carry it, the starvation
   guardrail fires — that's the honest price signal, not a reason to
   re-score.
4. **Night-1 draft**: the raid fires at endDay; the policy shelters the
   morning after. Night-1 defender deaths are unpreventable policy-side —
   the doctrine only reaches post-night-1 deaths + scholar field deaths.
   If the pilot shows the residual is all night-1 + bedroll, that's the
   named next (a proactive posture), not a re-score.

## Results

32/32 sweep complete (8 seeds 63801–63808 × {leadfeast, belongfeast} ×
{control, armed}, 180d death-aware, 0 bad per-seed files). The pilot MISSES
GO and breaches a guardrail — KILLED per protocol (see Verdict).

| dimension | control | armed | delta |
|---|---|---|---|
| PRIMARY raid-channel deaths | 110 (6.88/run) | 90 (5.63/run) | **-18.2% (GO ≥30%: MISS)** |
| raid by rule: scholar-fight-at-haven | 64 | 50 | -21.9% |
| raid by rule: aid-crisis | 46 | 40 | -13.0% |
| aid-crisis atHaven / inField (control) | 45 / 1 | — | — |
| aid-crisis atHaven / inField (armed) | — | 39 / 1 | — |
| wall: national | 13 | 13 | +0 |
| wall: table | 13 | 12 | -1 |
| wall: wins | 0 | 0 | +0 |
| wall: wave-4 | 16 | 13 | **-3 (guardrail ±2: BREACH)** |
| wall: wave-5 | 0 | 0 | +0 |
| wall: exiled | 0 | 0 | +0 |
| median survival | 122.5d | 120.5d | -2d (guardrail ≥112.5d: PASS) |
| starvation deaths | 0 | 0 | (guardrail ≤1: PASS) |
| new death modes (≥2 events) | — | none | PASS |
| doctrine engaged | — | 16/16 runs, 146 hold-days, 498 travel refusals, 133 villagers sheltered (14/16 runs), 38 releases | — |
| unattributed deaths | 0 | 0 | — |

§15 balanced panel (evidence/2026-10-19/raidwall-panel-primary.md):
decision=review_required; the only non-descriptive signal is table
regression_watch on belongfeast (delta=-0.125, CI [-0.375,0] — touches 0).
The panel corroborates the analyzer: no material improvement, table
slightly soft.

Per-run raid deaths (control → armed): the reduction is consistent in
direction (13/16 runs armed ≤ control) but modest in size; no single-run
outlier drives it. The three armed runs above control: leadfeast-63806
(5→7), belongfeast-63804 (1→6), leadfeast-63808 (3→4).

## Verdict

**NO-GO — KILLED AT PILOT (primary miss + guardrail breach).**

- PRIMARY MISS: -18.2% raid-channel deaths vs the pre-registered ≥30% bar.
  The doctrine moves the needle in the right direction but not enough.
- GUARDRAIL BREACH: wave-4 unlocks 16→13, outside the ±2 band. The
  doctrine's hold (~9 hold-days/run median: no expeditions, no vetrel
  hunts, villager duties paused) slows readiness-bar progression enough
  to tip timing-marginal runs. The three misses (leadfeast-63801,
  leadfeast-63803, belongfeast-63801) died at 91d/145d/142d without
  unlocking wave-4; their controls unlocked it.
- Other guardrails hold: median survival -2d (≥-10d), starvation 0=0, no
  new death modes.

**KILL PROTOCOL EXECUTED:** scripts/policies/raidwall.js deleted
zero-trace (this commit). Instruments (probe, analyzer, transcripts,
panel builder, proof test) + evidence + corpus kept. Proof test green
post-kill via KILL-PROTOCOL INFO-SKIP.

## Diagnosis (for the next arm)

1. **The effect is real but small.** -18% raid deaths, consistent across
   runs, mechanism-plausible: (a) the shelter reduces aid-crisis deaths
   (-13%) by keeping defenders/patrollers out of the draft; (b) hold-Haven
   reduces scholar-fight-at-haven deaths (-22%) — the scholar meets the
   forced bedroll raider rested and fed instead of wounded from the
   day's expedition. Neither mechanism reaches the 30% bar alone or
   together.
2. **The aid-crisis deaths are 98% at Haven, not in the field**
   (45/46 control, 39/40 armed). The taxonomy's "aid-crisis" ctx means
   "a raid crisis was live at death", NOT "died answering a crisis in the
   field". The hold-Haven travel gate addressed ~1 death. The design
   premise ("scholars die in aid-crisis in the field") was wrong — the
   instrument corrected it.
3. **The game-side auto-muster already covers wave-4+ raids.**
   shelter.js's shelterMusterCheck (daily, wave-4+ within radius 2)
   shelters the village before the policy's morning daily on wave-4+
   raids — on leadfeast-63802 the layer found n=0 (everyone already
   inside). The policy shelter only adds value on sub-wave-4 raids
   (14/16 runs sheltered 133 villagers total).
4. **Classifier noise in the raid channel.** The d88 "raid" death
   (armed-leadfeast-63802, Mai) was killed by the Stranger — a distinct
   entity/event — while a raid crisis happened to be live. The
   raid-channel metric includes such coincidences; the 18.2% is
   conservative (some counted deaths were never addressable by raid
   defense). Metric doubt #2 from the pre-registration, confirmed.
5. **The wave-4 cost is the progression pause, not the gorge.**
   Starvation 0=0 — the pantry carries the gorge fine. The cost is time:
   ~9 hold-days/run with no expeditions, no veteran hunts, no villager
   duties. The readiness bar fills slower; marginal runs miss wave-4.
6. **The bedroll fight is the residual.** scholar-fight-at-haven is still
   50/90 armed raid deaths. The doctrine deliberately doesn't touch it
   (fought, not fled — fleeing moves the scholar off Haven at night).
   A future arm could try bedroll-fight discipline (flee-early), but
   that trades the doctrine's coherence ("never moves people") and
   reads as cowardice — it needs its own pre-registration and
   sense-testing, not a tweak.

**Named next:** decompose the doctrine — shelter-only vs hold-only arms
on fresh seeds, each pre-registered, to isolate which mechanism carries
the death reduction vs the wave-4 cost. If shelter-only keeps the -13%
aid-crisis reduction without the progression pause (no travel gate →
vetrel hunts continue), it may pass a narrower bar. The full doctrine as
built is killed; do not revive it in this form.

## Village assessment

Plain words: sixteen villages on the pre-seat win-side stack, rich and
raid-battered. They die at a median 122d with full pantries — not starving,
but bled by raids. On control, the scholar succession cascade is the
signature: leadfeast-63805 loses 9 scholars in 54 days (d20–d74), each
falling to raiders at Haven with "No walls. No warning but the noise."
The village functions between deaths — teaching, gossiping, crafting —
but its leadership is ground down at the door.

On armed, the doctrine fires on every run (16/16 engaged): the alarm
sounds, villagers bar the hall door ("🚪 ... hurry inside and bar the
hall door"), the scholar stays home. Raid deaths fall 18% — fewer
defenders die at the treeline, fewer scholars fall at the bedroll — but
the village's forward motion pauses with the muster: no expeditions, no
veteran hunts, no duties while the teeth are at the door. Three villages
that would have unlocked wave-4 miss it. The window still eats them;
they just die slightly less often to raids, and slightly less ready.

Who thrived and who died and why: scholars still die most — the bedroll
fight is fought, not fled, and non-raid threats (the Stranger) kill
during live crises. Villagers die less in the draft. Nobody starves.
The missing capability is unchanged from the taxonomy: veterans (0 at
every death), armor, weapons — the legs the doctrine's pause slows.

## Sense-testing (SENSE-TESTING LAW)

Read: 2 transcripts — armed leadfeast-s63802 (2,919 SAY lines, d10–92),
control leadfeast-s63805 (3,915 SAY lines, d18–76).

**The doctrine reads as defense, not cowardice.** The raid alarm fires
("🐗 RAID — 5 raiders ... hit Haven in the night"), the crisis is raised
("The village looks to you. Four ways to call"), unmet raiders linger
("Nobody met Hushpuppy — it's still out there at the treeline"), and the
village bars the door. The scholar holds their post; the bedroll fight,
when it comes, is fought ("One of them is coming for YOU — ... eyes on
your bedroll"). The fiction's own muster discipline ("We outlast it")
is honored.

**Villagers react like people.** Between raids: teaching by the fire
("See the leaves? Like that. Don't mix it up."), synergy discoveries,
gossip, the tribute press after each scholar death ("Emberhold watches
to see if Haven holds without its dead"). The death liturgy fires fully
— Codex page-turn, treaty shake, mantle transfer ("You'll have to earn
this face"), grief.

**Blanks / notes:**
1. The travel-guard refusal is SILENT (returns null, no SAY). For the
   sim policy this is fine; a player-facing version would need the
   honest "no — not while teeth are at the door" beat.
2. Classifier noise (diagnosis #4): the d88 Mai death reads as a Stranger
   kill in the transcript but counts as raid-channel — the "aid-crisis"
   ctx is crisis-live, not killed-by-raider. Future raid metrics should
   join the killer, not just the crisis.
3. The d74 armed raid shows all five raiders unmet ("Nobody met ...")
   on the raid night — the village was depleted from prior raids, not
   sheltered yet (shelter comes the morning after). Night-1 is the
   doctrine's blind spot (pre-registration doubt #4, confirmed).

## Named nexts

1. **Decompose the doctrine** (shelter-only vs hold-only, fresh seeds,
   pre-registered): isolate which mechanism carries the death reduction
   vs the wave-4 cost. Shelter-only may keep the aid-crisis reduction
   without pausing vetrel hunts.
2. **Killer-join hardening** for the raid channel (instrument): the
   aid-crisis ctx needs the killer identity before any raid lever sizes
   effects — the Stranger case proves the channel over-counts.
3. **Night-1 posture** (design): the raid fires at endDay; the policy
   shelters the morning after. A proactive posture (or an engine-side
   hook) is the only route to night-1 defender deaths — out of scope
   for a policy arm.

## Out-of-arm findings

(Appended to
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md`;
not chased — staying on axis.)
- (none new — stayed on axis. The classifier-noise and night-1 notes
  are recorded under Named nexts for the instrument/design owners.)

## Convergence

Axis: scale-onramp. This arm: **killed-at-pilot** (primary -18.2% vs
≥30% bar; wave-4 guardrail 13 vs 16 breached). The raid-defense avenue
as built (hold-Haven + bar-the-door) is closed: real but insufficient
effect, measurable progression cost. The scale wall stands: wins 0/32,
wave-5 0/32 on both arms. The named next is the decomposition
(shelter-only vs hold-only), not a revival.

## Files

- scripts/policies/raidwall.js — the lever (this run)
- scripts/test-raidwall-20261019.js — proof (this run)
- scripts/probe-raidwall-20261019.js — sweep fork (this run)
- scripts/analyze-raidwall-20261019.js — arm-shift comparison (this run)
- scripts/raidwall-transcripts-20261019.js — SAY-line probe (this run)
- scripts/build-raidwall-panels.js — §15 panel compare builder (this run)
- evidence/2026-10-19/perseed-raidwall/{control,armed}/{leadfeast,belongfeast}/s63801–s63808.json — 32 per-seed JSONs (this run)
- evidence/2026-10-19/raidwall-corpus-summary.json — corpus + arm-shift (this run)
- evidence/2026-10-19/raidwall-panel-primary.{json,md} + .json.gz pair — §15 panel compare (this run)
- evidence/2026-10-19/raidwall-transcripts/ — sense-testing transcripts (this run)
- evidence/2026-10-19/sim-raidwall.md — this file
- ZERO src/js changes (policy-side only)
