# sim-scholarraid — scholar-only raid hold (flesh-out loop, 2026-10-19, ARM sim-scholarraid)

Run: fleshout-20261019T1400Z, arm sim-scholarraid. Axis: scale-onramp (the blocking axis).
LEVER RUN — one new policy-side file (scripts/policies/scholarraid.js), zero src/js changes.

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law; "Monster encounters are
fought, not rolled", Steve 2026-10-08), docs/PRESERVATION.md (pantry defense
relevance). The raid system: src/js/havenGrowth.js (havenRaidTick — reactive
raids, wealth draws teeth, the defender draft, lingering gorgers); the crisis
chain: src/js/comms.js (aidCrisis, lingering treeline). This arm is the
narrow successor to the KILLED sim-raidwall arm (evidence/2026-10-19/sim-raidwall.md,
killed at pilot on master): hold-Haven reduced scholar-fight-at-haven deaths
-22% — the one working piece — WITHOUT the village-wide hold that breached
the wave-4 guardrail (whole village holding ~9d/run paused expeditions/duties,
tipping timing-marginal runs). The window taxonomy
(evidence/2026-10-19/sim-windowsurvive.md) measured raids as 40/72 window
deaths with scholars dying 42 vs villagers 30, and aid-crisis deaths 98% AT
HAVEN, not in the field.

## Design calls (documented — the doctrine)

While a raid is live (a raid crisis unresolved, or raiders lingering at the
treeline — the same conditions the raidwall probe used):
1. **THE SCHOLAR HOLDS HAVEN** — no outward travel while the raid is live.
   Refused at the verb (Game.travelTo wrapper: at-Haven + destination !=
   Haven -> null while the raid is live; homeward travel and mid-fight
   barrier exits always delegate). The scholar rests/feeds at Haven — the
   base stack's Haven chores run normally because nobody moved them. One
   honest posture beat per raid, then quiet (the refusal itself is silent
   at the verb — the policy, not the engine, chose it).
2. **THE VILLAGE KEEPS WORKING NORMALLY** — pure delegation. No shelter, no
   duty pauses, no expedition gates, no muster of anyone but the scholar.
   This is the de-risk from the killed raidwall: the wave-4 cost came from
   ~9 hold-days/run with no expeditions, no veteran hunts, no villager
   duties. The village's forward motion is what fills the readiness bar.
3. **THE BEDROLL FIGHT IS FOUGHT, NOT FLED** — fight is pure delegation. A
   raider at the bedroll is static defense; fleeing moves the scholar off
   Haven at night. (Sense-testing reads this as defense, not cowardice.)

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE any sims)

**PRIMARY:** scholar raid-channel deaths per run, armed vs control on identical
seeds, PAIRED DELTAS. (Attributed deaths with `player && channel === 'raid'`
— the taxonomy's classifier, identical by construction.)

**GO:** >=30% fewer scholar raid-channel deaths on the armed arm.

**GUARDRAILS (all must hold):**
- wave-4 unlocks within ±2/16 runs of control (the de-risked guardrail vs
  raidwall — the village must keep progressing)
- median survival no worse than -10d
- no new death mode (a new cause counts at >=2 events — the revised rule)
- starvation deaths <= control+1 (paired per run)

**SECONDARY (report, don't judge):** scholar mean HP/condition at
bedroll-fight start; all-scholar combat deaths; wall numbers
(national/table/wave-4/wave-5/wins).

**Horizon:** 180d death-aware (dead villages stop simulating, +10d tail max).

**Seeds:** pilot 8 (63801–63808, the taxonomy seeds for comparability) ×
{leadfeast, belongfeast} × {control, armed} = 32 runs. IDENTICAL seeds on
both arms (paired before/after).

**Policies:** competent-player policy; substrate to match the taxonomy:
pre-seat + windefer, VETREL=1, SEATDRIVE=0.
Stack: withSeatDrive(withWinDefer(withVetrel(withReposition(TF base))))
+ withScholarRaid outside on the armed arm only.
Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
WINDEFER=1 NODEWITNESS=1 VETREL=1 SEATDRIVE=0 (+ SCHOLARRAID=1 armed only).

**Instrument:** scripts/probe-scholarraid-20261019.js (reuse-fork of
probe-raidwall-20261019.js: identical policy stack + identical pure
death-capture reads + identical death-channel classifier; the deliberate
changes: the scholarraid layer outside on the armed arm, the ARM dimension,
the winarm tag, Game.state.srLedger capture),
scripts/analyze-scholarraid-20261019.js (arm-shift comparison against the
pre-registered bars), scripts/scholarraid-transcripts-20261019.js (SAY-line
probe around raid events for sense-testing), scripts/build-scholarraid-panels.js
(§15 balanced-panel compare builder),
scripts/test-scholarraid-20261019.js (proof: GATE + RAID-ACTIVE +
TRAVEL-GUARD + SMOKE + DET + VERDICT — GATE pins layer-off == bare stack,
DET pins repeat byte-identical).

**Balanced panel (§15):** the before/after comparison runs through
scripts/balance-panel.js — the panel is the instrument, the GO threshold
above is the judge. Compare .md attached below.

**No [needs-eyes]:** policy-side sim lever, no player-facing change.

## Metric review

(pre-registered doubts — for the NEXT run if the metric proves wrong; the GO bar above binds THIS run, §14)
1. **Scholar raid deaths are clustered within runs** (the taxonomy: 63808
   lost 4 scholars in 3 days). 30% fewer scholar raid deaths could come from
   2 quiet runs, not a real effect. The per-run distribution is reported
   alongside the pooled count; a confirm would use per-run survival as primary.
2. **Classifier noise in the raid channel** (raidwall diagnosis #4): the
   d88 "raid" death (Mai, killed by the Stranger) counted as raid-channel
   because a raid crisis happened to be live. The scholar-raid channel
   inherits this noise; the primary is conservative (some counted deaths
   were never addressable by scholar hold). Named next: killer-join
   hardening for the raid channel (raidwall named next #2).
3. **Night-1 draft**: the raid fires at endDay; the policy holds from the
   raid-live read onward. Night-1 bedroll deaths are unpreventable
   policy-side — the doctrine only reaches post-night-1 bedroll fights +
   scholar field deaths. If the pilot shows the residual is all night-1,
   that's the named next (a proactive posture), not a re-score.
4. **The scholar may not be the one meeting the bedroll raider every time**:
   if the scholar is away at Haven when the raid fires, there's no bedroll
   fight — the wrapper's away-scholar rule (all travel allowed) matches the
   raidwall contract, and the base daily handles muster.

## Results

32/32 sweep complete (8 seeds 63801–63808 × {leadfeast, belongfeast} ×
{control, armed}, 180d death-aware, 0 bad per-seed files). The pilot MISSES
GO — KILLED per protocol (see Verdict).

| dimension | control | armed | delta |
|---|---|---|---|
| PRIMARY scholar raid-channel deaths | 100 (6.25/run) | 83 (5.19/run) | **-17.0% (GO ≥30%: MISS)** |
| all-raid deaths (context) | 110 (6.88/run) | 86 (5.38/run) | -21.8% |
| raid by rule: scholar-fight-at-haven | 64 | 48 | -25.0% |
| raid by rule: aid-crisis | 46 | 38 | -17.4% |
| aid-crisis atHaven / inField (control) | 45 / 1 | — | — |
| aid-crisis atHaven / inField (armed) | — | 37 / 1 | — |
| wall: national | 13 | 14 | +1 |
| wall: table | 13 | 12 | -1 |
| wall: wins | 0 | 0 | +0 |
| wall: wave-4 | 16 | 15 | **-1 (guardrail ±2: PASS — de-risked)** |
| wall: wave-5 | 0 | 0 | +0 |
| wall: exiled | 0 | 0 | +0 |
| median survival | 122.5d | 124d | +1.5d (guardrail ≥112.5d: PASS) |
| starvation deaths | 0 | 1 | (guardrail ≤1: PASS) |
| new death modes (≥2 events) | — | none | PASS |
| doctrine engaged | — | 16/16 runs, 125 hold-days, 444 travel refusals, 41 beats | — |
| unattributed deaths | 0 | 0 | — |

Paired deltas (armed − control scholar-raid deaths per seed): leadfeast
−6/−1/−1/−1/0/−1/−1/+1, belongfeast −2/+1/0/0/−4/0/−2/0. Direction
consistent (13/16 runs armed ≤ control) but modest in size — no single-run
outlier drives it. The one loud win: leadfeast-63801 (7→1, survived to
d182 with 3 deaths total vs control's 11 at d96).

§15 balanced panel (evidence/2026-10-19/scholarraid-panel-primary.md):
decision=review_required; the only non-descriptive signal is table
regression_watch on belongfeast (delta=−0.125, CI [−0.375,0] — touches 0;
the same pattern as raidwall's panel). The panel corroborates the
analyzer: no material improvement.

SECONDARY (report, don't judge): all-scholar combat deaths 118→99
(−16.1%); scholar raid-death mean pantry 28,980→26,575 kcal, hungry
streak 0 both arms (they die rich, not starving — the taxonomy finding
holds). Scholar HP/condition at bedroll-fight start was not instrumented
(this sweep's instrument reads deaths, not fight-start state) — see
metric review.

## Verdict

**NO-GO — KILLED AT PILOT (primary miss; guardrails all pass).**

- PRIMARY MISS: −17.0% scholar raid-channel deaths vs the pre-registered
  ≥30% bar. The mechanism is real and direction-consistent (13/16 runs
  armed ≤ control) but not enough.
- GUARDRAILS ALL HOLD: wave-4 16→15 (within ±2 — the de-risk vs raidwall
  worked: no village-wide hold, no progression pause); median survival
  +1.5d; starvation 0→1 (within band); no new death modes.
- The narrow arm kept everything raidwall lost: the doctrine engaged on
  16/16 runs (125 hold-days, 444 travel refusals) with zero wave-4 cost.
  The wave-4 breach was in the village-wide hold, not the scholar hold —
  the decomposition named next from raidwall is confirmed: shelter-only
  and hold-only separated cleanly.

**KILL PROTOCOL EXECUTED:** scripts/policies/scholarraid.js deleted
zero-trace (this commit). Instruments (proof test with KILL-PROTOCOL
INFO-SKIP, probe, analyzer, transcripts, panel builder) + evidence +
corpus kept. Proof test green post-kill via KILL-PROTOCOL INFO-SKIP.

## Diagnosis (for the next arm)

1. **The effect is real but small — same as raidwall's working piece.**
   Scholar-fight-at-haven deaths fell 64→48 (−25%, matching raidwall's
   −22% on the whole doctrine). The hold meets the forced bedroll raider
   rested and fed instead of wounded from the day's expedition — the
   mechanism is confirmed twice now, and it is not enough.
2. **The bedroll fight comes in waves, and the scholar meets them all.**
   The armed leadfeast-s63801 transcript: on d8 the held scholar fought
   FOUR consecutive raid fights at Haven (Hushpuppy, Sunbasker, Hummice
   ×4, Drum-Belly) — rested, fed, counter-armed (wound-the-lead landed)
   — and died on the fourth. The hold buys a fairer fight, not safety.
3. **The residual is the forced bedroll fight itself.** The control
   transcript's d80–81 cluster: a 5-raider wave-4 raid (The Reunion at the
   bedroll) kills THREE scholars in one day (Aurora, Sanh, Devon). The
   doctrine deliberately doesn't touch the bedroll fight (fought, not
   fled — fleeing reads as cowardice). raidwall named next #6 stands: a
   bedroll-fight-discipline arm needs its own pre-registration and
   sense-testing, not a tweak.
4. **Scholar aid-crisis deaths are the untouchable half of the primary.**
   46→38 (−17%): these are scholars dying AS the Haven defenders during a
   live crisis (98% at Haven) — the scholar hold doesn't reduce defender
   deaths because the scholar is still the defender. The hold only
   removes the expedition-wound disadvantage.
5. **Control confirms the mechanism contrast.** The control scholar camps
   wild during raids and sleeps exposed in cold snaps (d55–56: "You camp
   wild tonight", "The cold got in — no healing, and it took its cut")
   while lingerers gorge at the treeline — exactly what the hold removes.
   But wounded-vs-rested is a small share of why scholars die at Haven;
   being the last line is the big one.
6. **The village kept working — the wave-4 de-risk held.** Wave-4 16→15,
   national 13→14, median survival +1.5d. The armed villages progress
   identically to control while losing fewer scholars. The progression
   cost in raidwall was the village-wide hold, confirmed isolated.

**Named next:** the scholar-raid avenue as built (hold-only, no flee) is
closed — it will not reach a 30% bar on any realistic tuning, because the
residual is the bedroll fight the doctrine won't touch. Two live nexts:
(a) bedroll-fight discipline (flee-early/party-defense) as its own
pre-registered arm with its own sense-testing — a design call, not a
tweak; (b) killer-join hardening for the raid channel (the Stranger case
from raidwall stands — the channel still over-counts). The shelter-only
half of the raidwall decomposition remains open (not this worker's
assignment).

## Village assessment

Plain words: sixteen villages on the pre-seat win-side stack, rich and
raid-battered. They die at a median 122d with full pantries — not starving,
but bled at the door. On control, the signature is the scholar succession
cascade: leadfeast-63801 loses 7 scholars to raids in 24 days (d57–d81),
culminating in a d81 triple-death when a 5-raider wave-4 raid brings The
Reunion to the bedroll. The control scholar sleeps rough in the wild during
raids — exposed to cold snaps, camped far from the hall — and meets the
raiders wounded.

On armed, the doctrine fires on every run (16/16 engaged): the posture beat
sounds ("🛡️ Teeth at the door — the scholar holds Haven until it clears.
No outward legs, no exceptions. The village works on."), the scholar stays
home, sleeps by the fire, eats the village meal. Raid deaths fall 17% —
fewer bedroll kills of wounded scholars — but the scholar still dies at
Haven, because the raiders come to the bedroll in waves and the scholar is
the one who answers the door. The village around them keeps working:
water runs, fishing, foraging, the feast — no paused duties, no
progression cost. Three armed runs reach national that their controls
didn't; wave-4 held at 15/16. Nobody starves. The scale wall stands: wins
0/32, wave-5 0/32 on both arms.

Who thrived and who died and why: scholars still die most — the bedroll
fight is fought, not fled, and wave-4 raids kill rested scholars too.
Villagers die in the draft and to lingerers. The armed leadfeast-63801
village thrived — 182 days, 3 deaths, national, table-waiting — because
Maria Osmeña's succession stuck after Gerald's d8 death and the village
never lost its forward motion. The missing capability is unchanged from
the taxonomy: veterans (0 at every death), armor, weapons.

## Sense-testing (SENSE-TESTING LAW)

Read: 2 transcripts — armed leadfeast-s63801 (810 SAY lines, d6–10, the
loud-win run: 1 scholar raid death, survived d182), control
leadfeast-s63801 (3,640 SAY lines, d55–95, the cascade: 7 scholar raid
deaths in 24 days, village-lost d96).

**The posture beat reads as defense, not cowardice.** It fires once per
raid: "🛡️ Teeth at the door — the scholar holds Haven until it clears. No
outward legs, no exceptions. The village works on." It names the scholar's
duty and the village's continuity together. The bedroll fight, when it
comes, is fought ("One of them is coming for YOU — ... eyes on your
bedroll").

**The held scholar dies like a hero, not a statistic.** Armed d8: the
raid hits at night, the scholar wakes at Haven, and meets FOUR fights in
a row — wounds the lead (the counter, landed), drops the Sunbasker, drops
all four Hummice (wave-ledger 3/5), then goes down to the Drum-Belly on
the fourth fight. The transcript's death liturgy fires fully — Codex
page-turn, mantle transfer to Maria Osmeña, grief. This is the design
truth the numbers can't show: the hold gives the scholar a fair fight,
and sometimes the raid is just five raiders.

**Villagers act like people on both arms.** Teaching by the fire
("remember it" — word gets around), gossip that decorates itself as it
travels, the tribute press after each scholar death, water crews with
their "the well won't fill itself" rounds, feast debates, the System's
unhinged commentary. The death liturgy, the treaty shakes ("the dead hold
no treaties"), the mantle transfer — all fire. Nothing robotic.

**Blanks / notes:**
1. The travel-guard refusal is SILENT (returns null, no SAY) — same note
   as raidwall. The posture beat covers the posture, not each refusal;
   a player-facing version would need the honest "no — not while teeth
   are at the door" beat per refusal.
2. The control scholar sleeps exposed in the wild DURING raids while
   lingerers gorge at the treeline (d55–56) — the engine lets the scholar
   sleep rough in a cold snap mid-raid. A player-facing posture system
   would want the bedroll itself to matter (who sleeps where during a
   raid) — out of scope for a policy arm, noted for the design owner.
3. Classifier noise stands (raidwall diagnosis #4): the scholar-raid
   primary inherits the Stranger-type coincidences — killer-join
   hardening is still the instrument next.

## Named nexts

1. **Bedroll-fight discipline as its own arm** (pre-registered,
   sense-tested separately): the residual is the forced bedroll fight,
   which this doctrine deliberately doesn't touch. Flee-early trades the
   "never moves people" coherence; party-defense (waking defenders) is
   engine-side. This needs a design call, not a tweak.
2. **Killer-join hardening for the raid channel** (instrument): the
   aid-crisis ctx needs the killer identity before any raid lever sizes
   effects — the Stranger case (raidwall) proves the channel over-counts.
3. **Shelter-only decomposition** (open, not this arm): the raidwall named
   next #1's other half — shelter-only may keep the aid-crisis reduction
   without pausing vetrel hunts. This worker's arm (hold-only) is closed.

## Out-of-arm findings

(Appended to
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md`;
not chased — staying on axis.)
- Bedroll-placement matters (see sense-testing blank #2): the engine lets
  the scholar sleep rough in the wild during a live raid (control d55–56:
  sleeping exposed in a cold snap while lingerers gorge at the treeline).
  A player-facing raid posture would want the bedroll's location to be a
  real decision during raids. Out of scope for a policy arm — noted for
  the design owner.

## Metric review

(pre-registered doubts, revisited)
1. **Clustering confirmed**: the primary moved 100→83 with paired deltas
   showing direction consistency (13/16 runs armed ≤ control) — not
   outlier-driven. A confirm would still use per-run survival as primary.
2. **Classifier noise stands**: the scholar-raid channel inherits the
   Stranger-type coincidence; the −17% is conservative (some counted
   deaths were never addressable by scholar hold). Killer-join hardening
   (named next #2) before any raid lever re-sizes.
3. **Night-1 draft**: the residual is not night-1 — it's the forced
   bedroll fight in waves (armed d8: four consecutive fights). The night-1
   posture next is superseded by the bedroll-fight-discipline next.
4. **Scholar-HP-at-bedroll-fight-start (secondary) was not instrumented.**
   The sweep instrument reads deaths, not fight-start state — the
   mechanism plausibility ("rested and fed") rests on transcript reads
   (armed d7: "You are full enough", "You wake rested"), not a measured
   mean. A future bedroll arm should instrument scholar HP at fight-start
   directly. Proposed metric revision for the NEXT run: mean scholar HP
   at bedroll-fight start, armed vs control, via a fight-start probe.
   This run stays judged on its registered primary (§14).

## Convergence

Axis: scale-onramp. This arm: **killed-at-pilot** (primary −17.0% vs ≥30%
bar; all guardrails PASS — wave-4 16→15, the de-risk vs raidwall held).
The scholar-hold avenue as built (hold-only, no bedroll-fight change) is
closed: real but insufficient effect, zero progression cost. The
decomposition named next from raidwall is confirmed (hold-only ≠
shelter-only; the wave-4 cost was in the village-wide hold). The scale
wall stands: wins 0/32, wave-5 0/32 on both arms. Live nexts: (a)
bedroll-fight discipline as a design-call arm; (b) killer-join hardening
for the raid channel; (c) shelter-only decomposition (open).

## Files

- scripts/policies/scholarraid.js — the lever (DELETED zero-trace per kill
  protocol; this commit carries the deletion)
- scripts/test-scholarraid-20261019.js — proof (this run; KILL-PROTOCOL
  INFO-SKIP path verified green post-kill)
- scripts/probe-scholarraid-20261019.js — sweep fork (this run)
- scripts/analyze-scholarraid-20261019.js — arm-shift comparison (this run)
- scripts/scholarraid-transcripts-20261019.js — SAY-line probe (this run)
- scripts/build-scholarraid-panels.js — §15 panel compare builder (this run)
- evidence/2026-10-19/perseed-scholarraid/{control,armed}/{leadfeast,belongfeast}/s63801–s63808.json — 32 per-seed JSONs (this run)
- evidence/2026-10-19/scholarraid-corpus-summary.json — corpus + arm-shift (this run)
- evidence/2026-10-19/scholarraid-panel-primary.{json,md} + .json.gz pair — §15 panel compare (this run)
- evidence/2026-10-19/scholarraid-transcripts/ — sense-testing transcripts (this run)
- evidence/2026-10-19/sim-scholarraid.md — this file
- ZERO src/js changes (policy-side only)
