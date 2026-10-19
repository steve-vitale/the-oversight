# sim-raidstand — the stand-at-the-treeline raid doctrine lever (flesh-out loop, 2026-10-19, ARM sim-raidstand)

Run: fleshout-20261019T1815Z, arm sim-raidstand. Axis: scale-onramp (the blocking axis).
LEVER RUN — one new policy-side file (scripts/policies/raidstand.js), zero src/js changes.

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law; "Monster encounters are
fought, not rolled", Steve 2026-10-08), docs/PRESERVATION.md (pantry defense
relevance). The raid system: src/js/havenGrowth.js (havenRaidTick — reactive
raids, wealth draws teeth, the defender draft, lingering gorgers); the fight
verb: src/js/game.js resolveWildMonsterEncounter(vid, m, {raid:true}) — the
engine's own raid fight (plants the 'defended' crisis memory; a lingering
raider during a crisis routes through aidFight blow-by-blow, allies at the
door from round one); the readiness vocabulary: src/js/standing.js
waveCombatReadiness (armor WORN via S.equipment.armorOf, weapon TO HAND via
meleeWeaponOf/rangedWeaponOf or carried weapon items).
This arm is the LAST UNTESTED quadrant of the raid decomposition:
- sim-raidwall: KILLED at pilot (-18.2% raid deaths vs 30% bar; wave-4 guardrail breached 13 vs 16) — the village-wide hold cost.
- sim-scholarraid: KILLED at pilot (-17.0% vs 30% bar; all guardrails pass) — the hold-only half, de-risked.
- sim-shelteronly: KILLED at pilot (-17.0% vs 30% bar; all guardrails pass; wave-4 cost isolated to the village-wide hold).
Three consecutive arms missed the 30% bar at 15–18% with all guardrails passing
— the mechanism is real, the bar may be too high. This arm judges the REVISED
20% bar AND supplies the fourth data point for the metric review.
The window taxonomy (evidence/2026-10-19/sim-windowsurvive.md) measured raids
as 40/72 window deaths (scholars die 42 vs villagers 30 — they die rich, not
starving).

## Design calls (documented — the doctrine)

While a raid is live (an unresolved raid crisis OR raiders lingering at the
treeline — the SAME conditions the raidwall probe used):
1. **STAND AT THE TREELINE** — combat-capable villagers ENGAGE raiders with
   engine-honest combat: Game.resolveWildMonsterEncounter(vid, m, {raid:true}),
   the same verb and flag the engine's own night-1 defender draft uses.
   Fought blow-by-blow (aidFight for lingering raiders, allies at the door),
   never rolled; no stat edits, no fake kills, no re-equipping (the base
   gearUp equips — this layer only reads its output), no re-drafting what
   the game-side wave-4+ muster owns (sheltered villagers are never
   candidates).
2. **COMBAT-CAPABLE** (read-only): living roster minus scholar minus
   sheltered minus away minus health<=40 (the engine draft's own bar), with
   weapon TO HAND and armor WORN. Shielded villagers stand at the back of
   the stand line (the engine draft's rule, mirrored). One villager per
   lingering raider per day; each villager at most one engagement per day
   (they have normal duties). More raiders than fighters: the rest stay
   lingering — the honest gap.
3. **NOBODY MOVES** — no sheltering, no scholar travel-hold, no expedition
   gates, no duty pauses, no travelTo wrapper (homeward travel and
   mid-fight barrier exits always delegate, by construction). The village
   works its normal day; the stand runs after the base daily. The bedroll
   fight is fought, not fled (pure delegation).
4. **ONE HONEST POSTURE BEAT PER RAID, THEN QUIET** — the fiction must read
   as defense, not a muster. Canon: violence is desperate and traumatic.

The stand's marginal surface vs baseline: the engine already drafts
defenders on raid night-1; the engine does NOTHING against lingering
raiders on later raid days (they gorge until driven off, the 6-day valve,
or the player's sortie). The stand engages live lingering raiders daily
while the raid is live.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the sweep)

**PRIMARY:** raid-channel deaths per run (the taxonomy's death-channel
classifier, identical by construction), armed vs control on IDENTICAL seeds,
paired deltas.

**GO:** >=20% fewer raid-channel deaths on the armed arm (REVISED bar —
three consecutive 30%-bar misses at 15–18% with all guardrails passing; the
metric review holds the 30% bar itself suspect. If this misses at 20% but
lands in the 15–18% band again, file it as the fourth data point — the
concept may be metric-broken, not concept-dead).

**GUARDRAILS (all must hold):**
- wave-4 unlocks within ±2/16 runs of control
- median survival no worse than -10d
- no new death mode (a new cause counts at >=2 events — the revised rule)
- starvation deaths <= control+1 (paired per run)

**SECONDARY (report, don't judge):** scholar raid deaths specifically;
villager raid deaths; fight counts; wall numbers (national/table/wave-4/
wave-5/wins); stand engagement (stand-days, engagements, vid-days engaged).

**Horizon:** 180d death-aware (dead villages stop simulating, +10d tail max).

**Seeds:** pilot 8 (63901–63908) × {leadfeast, belongfeast} × {control,
armed} = 32 runs. IDENTICAL seeds on both arms (paired before/after).
NOTE: these seeds coincide with the sibling vetrel1 arm's sweep seeds
(evidence/2026-10-19, probe-vetrel1-20261019.js). Different substrate and
different perseed dir — no file collision — and the control arm doubles as
a second measurement of vetrel1's armed substrate on identical seeds.

**Policies:** competent-player policy; substrate to match the taxonomy:
pre-seat + windefer, VETREL=1, SEATDRIVE=0.
Stack: withSeatDrive(withWinDefer(withVetrel(withReposition(TF base))))
+ withRaidstand outside on the armed arm only.
Env: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1
WINDEFER=1 NODEWITNESS=1 VETREL=1 SEATDRIVE=0 (+ RAIDSTAND=1 armed only).

**Instrument:** scripts/probe-raidstand-20261019.js (reuse-fork of
probe-shelteronly-20261019.js: identical policy stack + identical pure
death-capture reads + identical death-channel classifier; the deliberate
changes: the raidstand layer outside on the armed arm, the ARM dimension,
the winarm tag, Game.state.rsLedger capture, seeds 63901–63908),
scripts/analyze-raidstand-20261019.js (arm-shift comparison against the
REVISED 20% bar), scripts/raidstand-transcripts-20261019.js (SAY-line
probe around raid events for sense-testing), scripts/build-raidstand-panels.js
(§15 balanced-panel compare builder),
scripts/test-raidstand-20261019.js (proof: GATE + RAID-ACTIVE + STAND +
NO-TRAVEL-GUARD + SMOKE + DET + VERDICT — GATE pins layer-off == bare
stack, DET pins RAIDSTAND=1 vs unset byte-identical until the first
engagement morning; KILL-PROTOCOL INFO-SKIP path pins green post-kill).

**Balanced panel (§15):** the before/after comparison runs through
scripts/balance-panel.js — the panel is the instrument, the GO threshold
above is the judge. Compare .md attached below.

**No [needs-eyes]:** policy-side sim lever, no player-facing change.

## Metric review

(pre-registered doubts — for the NEXT run if the metric proves wrong; the GO bar above binds THIS run, §14)
1. **Raid deaths are clustered within runs** (the taxonomy: 63808 lost 4
   scholars in 3 days). The per-run distribution is reported alongside the
   pooled count; a confirm would use per-run survival as primary.
2. **Classifier noise in the raid channel** (raidwall diagnosis #4): deaths
   during a live raid crisis count as raid-channel even when the killer was
   unrelated (e.g. the d88 Stranger kill). The primary is conservative
   (some counted deaths were never addressable by the stand).
3. **Night-1 draft**: the raid fires at endDay; the stand engages from the
   first raid-live morning. Night-1 bedroll deaths are unpreventable
   policy-side — the doctrine only reaches lingering-raider fights and the
   draft on later raid days.
4. **The engagement floor**: combat-capable (weapon + armor worn, read-only)
   may find zero candidates on poor runs — the ledger measures engagement,
   and zero engagement is the honest diagnosis, not a sweep failure.
5. **The 20% bar is itself the hypothesis under test** (metric-review
   fourth data point). Three arms at 15–18% with all guardrails passing
   suggest the 30% bar was wrong, not the mechanism. If this arm lands in
   the 15–18% band, the metric review decides: converge the bar or keep
   hunting the residual.

## Results

32/32 sweep complete (8 seeds 63901–63908 × {leadfeast, belongfeast} ×
{control, armed}, 180d death-aware, 0 bad per-seed files). The pilot MISSES
GO — KILLED per protocol (see Verdict).

| dimension | control | armed | delta |
|---|---|---|---|
| PRIMARY raid-channel deaths | 70 (4.38/run) | 72 (4.50/run) | **-2.9% (GO ≥20%: MISS)** |
| scholar raid deaths (context) | 67 (4.19/run) | 63 (3.94/run) | -6.0% |
| villager raid deaths (context) | 3 (0.19/run) | 9 (0.56/run) | +6 deaths |
| raid by rule: scholar-fight-at-haven | 39 | 42 | +3 |
| raid by rule: aid-crisis | 31 | 30 | -1 |
| aid-crisis atHaven / inField (control) | 30 / 1 | — | — |
| aid-crisis atHaven / inField (armed) | — | 29 / 1 | — |
| wall: national | 11 | 12 | +1 |
| wall: table | 11 | 11 | +0 |
| wall: wins | 0 | 0 | +0 |
| wall: wave-4 | 13 | 13 | +0 (guardrail ±2: PASS) |
| wall: wave-5 | 0 | 0 | +0 |
| wall: exiled | 0 | 0 | +0 |
| median survival | 97.5d | 96d | -1.5d (guardrail ≥87.5d: PASS) |
| starvation deaths | 4 | 4 | (guardrail ≤5: PASS) |
| new death modes (≥2 events) | — | none | (PASS) |
| doctrine (armed): stand days / engagements / vid-days / beats / runs engaged | — | 119 / 40 / 40 / 15 / 10 | the doctrine acted |
| unattributed | 0 | 0 | — |

Paired deltas (armed−control per seed): leadfeast [-1,-1,0,+4,0,+1,0,-1],
belongfeast [-2,0,0,+1,0,0,0,+1] — scattered around zero, no direction; the
+2 net comes from leadfeast-63904 (+4: control died d75, armed lived to
d107 and accumulated more raid exposure).

Balanced panel (§15): raidstand-panel-primary.{json,md} + .json.gz pair —
decision=review_required, no material signal on any metric (national,
table, survival, community loss all no_material_signal or descriptive).
The panel is the instrument; the 20% threshold is the judge: NO-GO.

## Verdict

**KILLED AT PILOT (NO-GO).** Primary: raid-channel deaths 70→72 (-2.9%,
vs ≥20% GO bar). MISS. All guardrails pass (wave-4 13→13, median survival
-1.5d, starvation 4→4, no new death modes).

**Diagnosis:** the stand doctrine is real and engaged (119 stand days, 40
engagements, 10/16 runs engaged, 15 honest beats) but it cannot touch the
dominant death channel. Scholar-fight-at-haven — the forced bedroll fight,
unreachable policy-side — is the single largest channel (39→42) and did
not move. The aid-crisis half moved 31→30 (−1). The stand's marginal
surface was exactly the lingering-raider fights, and it paid for them in
the honest currency: villager raid deaths 3→9 (+6) while scholar raid
deaths fell 67→63 (−4) — the stand trades scholar deaths for villager
deaths at roughly 1:1, net ~zero. Violence is desperate and traumatic;
the sweep measured the trauma.

This is the FOURTH data point for the metric review, and it does NOT land
in the 15–18% band:
- raidwall: −18.2% (hold + shelter; breached the wave-4 guardrail)
- scholarraid: −17.0% (hold only; all guardrails pass)
- shelteronly: −17.0% (shelter only; all guardrails pass)
- raidstand: −2.9% (stand; all guardrails pass)

The three arms that REMOVED people from fights all landed 15–18%; the one
arm that ADDED fights landed at ~0. The pattern is now mechanism, not
noise: policy-side raid defense reduces deaths only by removing exposure,
and its ceiling is the 15–18% band. The residual is structural, not
doctrinal: the night-1 draft, the forced bedroll fight (the largest
single channel), and haven-concentrated aid-crisis deaths (98% at Haven
per the raidwall diagnosis). The revised 20% bar was judged against a null
the stand confirmed — it is not "metric-broken," the lever is exhausted.
Policy-side raid defense is CLOSED as a lever for the scale wall.

## Metric review

1. **The 20% bar hypothesis is resolved, not confirmed.** The
   pre-registration held the 30% bar suspect and offered the 15–18% band
   as the alternative shape. The stand missed at −2.9% — outside the band
   — so the band is not "the true bar"; the band is the measured CEILING
   of the remove-exposure mechanism, and adding exposure (the stand)
   returns ~0. The metric review's open question is answered: the
   concept is exhausted, not metric-broken.
2. **The stand traded death channels.** Scholar −4 / villager +6 is not
   noise — 8 armed runs show villager raid deaths vs 1 control run. A
   confirm would need per-person survival, not pooled raid deaths; the
   pooled primary masked the channel trade. The next raid-adjacent arm
   (if any) should pre-register channel-split primaries.
3. **Classifier noise persists** (raidwall diagnosis #4, inherited): the
   d88-Stranger class of coincidence deaths still counts as raid-channel.
   The killer-join hardening named next stands.
4. **Clustering stands** (metric doubt #1): the paired deltas show the
   verdict does not hinge on one run — but neither does the null; the
   null is uniform, which is itself the finding.

## Village assessment

What the villages looked like: 16 villages on the w5path substrate with
VETREL=1 (leadfeast/belongfeast, 180d death-aware, fresh 63901–63908
seeds). They reach national 11–12/16 and the table 11/16 but wins 0/16,
wave-5 0/16 — the scale wall's outer markers hold. Median survival ~97d.
They are the same rich villages that die fighting: raid deaths dominate,
96% of them scholars on the control arm (67/70).

Who thrived and who died and why: the scholar remains the combatant of
last resort — 96% of control raid deaths are scholars, dying at the
bedroll ("One of them is coming for YOU — Hushpuppy, inside the haven,
eyes on your bedroll") or answering the treeline. On the armed arm the
stand put villagers into the treeline fights: 40 engagements, and the
villagers died there instead (9 villager raid deaths across 8 runs vs 3
across 1 run on control). Erich's arc on armed-leadfeast-63906 is the run
in miniature: stands at the treeline as a villager on d78 ("Erich stands
at the treeline — the village works behind them"), takes the mantle, dies
as scholar on d110. The village functions behind the fighters — duties,
teaching (Thorn Apple identified and taught the same day), gossip,
hauling — exactly the "village keeps working" the doctrine promised.

What was missing: nothing the stand could supply. At every death the
missing piece was the same as the three prior arms: veterans (0 living at
nearly every death), armor (~1 fighter), and — the one the stand could
not touch — any answer to the forced bedroll fight.

## Sense-testing (SENSE-TESTING LAW)

Read: 2 transcripts — armed leadfeast s63906 (16,050 SAY lines buffered,
5,535 captured; 36 stand days, 25 engagements, 5 beats) and control
leadfeast s63903 (9,277 buffered, 4,753 captured; 8 scholar raid deaths,
village-lost d78).

**The stand reads as defense, not a muster.** The beat fires once per
raid ("🛡️ Erich stands at the treeline — the village works behind
them"), then quiet; the village's duties continue visibly around it
(fishing, cooking, hauling, teaching). The gorge continues for unmet
raiders ("The lingering Loud-Eyes gorges at the treeline — 817 kcal gone
from the stores") — the honest price is legible in the same day's lines.
No muster language anywhere; the fiction holds.

**Deaths read as meaningful tragedy, not counters.** The full liturgy
fires (Codex page-turn, "the dead hold no treaties", tribute shake,
mantle transfer). Somyot's d107 stand death has the complete grief
sequence. The control transcript's bedroll deaths are the counterpoint:
the fiction names the unreachable channel honestly ("eyes on your
bedroll").

**Villagers act like people.** Teaching chains (Ella teaches Thorn
Apple), fire-gossip, hauling, "Marcus is staring into the fire like it
owes them answers", inter-village food begging (Fatima of Stonebridge).
The cascade-grief templating noted in sim-windowsurvive persists
("Someone in your party saw it happen" ×3 in one cascade) — carried as
an out-of-arm finding.

## Named nexts

1. **The bedroll channel is the open surface** (scholar-fight-at-haven,
   ~55% of raid deaths across all four arms) — but "the bedroll fight is
   fought, not fled" is deliberate doctrine, so the lever is pre-raid
   posture (palisade/wall investment), never a behavior change. Filed as
   a design question, not a lever claim.
2. **Metric review (coordinator):** the raid-decomposition is complete
   (4/4 quadrants). The review decides whether the 15–18% band becomes
   the converged ceiling for remove-exposure raid levers, or whether the
   bar stays open. The stand's data point: adding fights returns ~0.
3. **Killer-join hardening for the raid channel** (raidwall named next
   #2, inherited by all four arms): coincidence deaths during live raid
   crises still count as raid-channel.

## Out-of-arm findings

- Cascade-grief templating repeats verbatim per death in multi-death
  days (carried from sim-windowsurvive; still present).
- The armed arm's wall numbers (national 12, table 11, wave-4 13) match
  control within noise — the scale wall did not move on this lever; the
  axis remains blocked on veteran production and the window, not raids.
- Panel-builder cosmetic: balance-metrics.json metric names containing
  "bearer" render as "bearer <redacted>" in the generated .md (the
  pipeline's bearer-token redaction applied to display text). Cosmetic
  only, identical across arms, not arm-specific.

## Convergence

**killed-at-pilot.** The raid decomposition is complete: hold+shelter
(−18.2%, guardrail breach), hold-only (−17.0%, clean), shelter-only
(−17.0%, clean), stand (−2.9%, clean). Policy-side raid defense is
exhausted as a lever for the scale wall. The axis (scale-onramp) remains
blocked; the wall numbers are unchanged by this arm.

## Files

- scripts/policies/raidstand.js — the lever (this run)
- scripts/test-raidstand-20261019.js — proof (this run)
- scripts/probe-raidstand-20261019.js — sweep fork (this run)
- scripts/analyze-raidstand-20261019.js — arm-shift comparison (this run)
- scripts/raidstand-transcripts-20261019.js — SAY-line probe (this run)
- scripts/build-raidstand-panels.js — §15 panel compare builder (this run)
- evidence/2026-10-19/perseed-raidstand/{control,armed}/{leadfeast,belongfeast}/s63901–s63908.json — 32 per-seed JSONs (this run)
- evidence/2026-10-19/raidstand-corpus-summary.json — corpus + arm-shift (this run)
- evidence/2026-10-19/raidstand-panel-primary.{json,md} + .json.gz pair — §15 panel compare (this run)
- evidence/2026-10-19/raidstand-transcripts/ — sense-testing transcripts (this run)
- evidence/2026-10-19/sim-raidstand.md — this file
- ZERO src/js changes (policy-side only)
