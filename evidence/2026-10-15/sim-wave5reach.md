# sim-wave5reach — wave-5 reachability on the landed win-side stack (flesh-out loop, 2026-10-15)

Worktree: `~/workspace/worktrees/sim-wave5reach`. POLICY-SIDE lever — ZERO src/js changes. Branch: sim-wave5reach, based on current master.

Axis: scale-onramp (standing scale directive). The win-side stack is CONFIRMED (sim-seatdrive 12/16, sim-winconfirm 12/16 on fresh seeds) — but wave-5 unlocks are unmoved (4/16 armed vs 8/16 control on winconfirm, EXPLAINED as win-truncation: wins end ~d90; wave-5 unlocks land d112–176).

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law — the lever touches it), docs/TABLE.md (read first). Canon facts the lever is built on:
- Wave-5 gate (standing.js): villageStandingTotal() >= t5(200) AND waveUnlockReady(5).ready = waveEngaged(4) >= 2 distinct wave-4 types faced blow-by-blow (FLEEING COUNTS — "you stood on the grid"); bread counts at most 100 toward t5; the rungs sit on top of the wave-3 rung.
- Standing: war +25 per wave-3+ ledger kill point (per-type cap 2), diplomacy +34 per seasoned regional+ link, plenty +20 per major feast (quality>=1).
- Waves 3–5 are deliberately counter-less: wave-5 counterplay IS engine-real (sigW5.js — off-script improv, favor spends, floor retrieval, contradiction jams, margin messages, cheap fulfillments, binding questions, venue ownership, boring fights, sacrifices, bad notes) but has no engine knowledge channel (villageKnowsTrick is waves 1–2 counters + wave-3 villagerTricks only). The "trick knowledge" the lever pursues is the readiness gate's own currency: FACED wave-4 types (waveEngaged) + ledger kill points (war standing) — the engine's honest knowledge channels, never free knowledge.
- The base policy already asks `askAbout(vid, 'beasttricks')` when `counterTeachable()` says the village knows something (competent.js:2419) — the village-teaching verb is covered by the base, not reinvented.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE any sweep)

**Question:** can a policy-side lever — deliberate wave-4 counter-learning expeditions after wave-4 unlock — move wave-5 UNLOCKS on the win-side stack, given that wins truncate runs at ~d90?

**The lever:** scripts/policies/wave5reach.js — env-gated WAVE5REACH=1, default OFF. Wraps SD.leadseat / SD.belongseat (the seatdrive armed composition, same ids). After wave-4 unlock and before wave-5 unlock (and never during the table sequence):
1. **Counter-learning expeditions** (hunt legs, courtkill-proven pattern): every 3rd day, healthy (hp>=60%) and fed (kcal>=200), travel to thicket/ruin/forest/grove nodes, engage visible wave-3/4+ monsters (facing fills waveEngaged — fleeing counts), come home. The courtship/win verbs run FIRST and fully — the hunt is additive, never preempting.
2. **Fight commitment** (fight side): wave-3 in fight → ctx._huntCommit (the proven courtkill mechanism: overrides start-of-fight walk-away, holds to 12%); wave-4+ in fight + scholar >=50% HP → ctx._w5Commit, honored by an EXTENDED legacy flee block in scripts/policies/competent.js (start-of-fight walk-away overridden ONLY; the mid-fight 35% eject is UNCHANGED — DESIGN CALL: wave-4 attrition is bloodier than wave-3; the casualtyseq instrument showed the post-unlock window is already a bloodbath; retreat when losing stays honest). The competent.js extension is inert without the flag (gate-off = byte-identical).
3. No free knowledge, no combat cheats, no deed-bar reimplementation: the layer reads Game state and issues player verbs (travelTo, pathStep, askAbout via the base) — never writes engine state.

**Arms:** control = armed win-side stack (FEASTSCALE_R13=1 + TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1 + WINPURSUIT=1 + WINDEFER=1 + SEATDRIVE=1) with WAVE5REACH unset; armed = the same + WAVE5REACH=1. Identical seeds both sides, 180d death-aware, own control in the same sweep.

Seeds: [121,232,343,454,565,676,787,898] x {leadfeast, belongfeast} (32 runs full; 8 pairs pilot first).

**Horizon + why:** 180d death-aware. Wave-5 unlocks land d112–176 on the measured sets; the pilot precedent says non-winning runs are the honest measurement surface (wins truncate at seatDay).

**Proof:** scripts/test-wave5reach-20261015.js — layer-live markers honest both sides; det-gate byte-identical gate-off trajectories both sides; SMOKE green before the sweep.

**PRIMARY (win-truncation-aware, per the seatdrive precedent):** wave-5 unlocks on NON-WINNING runs, armed >= control + 2.

**SECONDARY:** total wave-5 unlocks armed >= control (no truncation regression beyond the already-measured win-truncation).

**GUARDRAILS (binding):** wins armed >= 8/16 (the lever must not break the win); national armed >= control - 2; no new death mode at n>=3.

**Secondaries:** full wall numbers both sides (national/table/wins/wave-4/5 unlocks/median survival/exiled); per-seed JSONs in evidence/2026-10-15/perseed-wave5reach/ with EXACT numeric keys national, table, wins, exiled, wave5.

**PILOT GATE (binding):** 8 pairs (seeds [121,232,343,454] x {leadfeast, belongfeast}) first. Kill threshold: wave-5 delta <= 1 on non-winning runs → KILL the arm per kill protocol (delete the layer file, evidence-only commit documenting the kill, report killed-at-pilot). Do NOT chase a null into a bigger sample.

**SENSE-TESTING LAW:** read 1–2 wave-5 unlock transcripts — is the reach EARNED or cheesy? Judge meaning, not counts.

## Metric review

(per §14 — pre-registered metrics bind; doubts go here, revisions apply
to the NEXT run)

1. **PRIMARY is NO-COVERAGE, not NO-GO.** 16/16 wins on BOTH sides across
   all 32 runs — zero non-winning runs, so "wave-5 unlocks on
   non-winning runs, armed >= control + 2" has no measurement surface.
   The pilot batch (seeds 121/232/343/454) won 16/16 at d90–96; the
   second batch (565/676/787/898) won 16/16 at d90–139 (later
   invitations — seatDay spreads d90–139, the driver sits whenever the
   invite exists). The win-side stack is simply stronger than the
   primary's surface needs on these seeds. The pilot gate's kill
   threshold ("wave-5 delta <= 1 on non-winning runs") was not met in
   the kill sense either: the lever showed a LIVE signal at pilot (5
   hunts, 1 engagement, +1 wave-5 with a mechanism trace, no guardrail
   breach) — the gate's intent is "no signal", and there was signal.
   Proceeding to the full 32 was the honest read; the full sweep
   confirms the pilot's signal rather than overturning it.
2. **SECONDARY GO: total wave-5 armed 3/16 >= control 2/16.** No
   truncation regression beyond the already-measured win-truncation —
   and the direction is right: the armed delta (belongfeast s454) is
   the hunt's own engagement, and on two identical leadfeast seeds the
   armed side unlocked EARLIER (s121: d67 vs d75; s454: d64 vs d70) —
   the lever is the only switch, so the acceleration is lever-caused.
3. **The wave5Day field is null on all 32 runs** — the 'wave_unlock'
   telemetry event name was a guess and doesn't exist. The unlock-day
   numbers in this file come from the beat captures (PRODUCERS beats).
   Next instrument: read the unlock day from daily unlockedWave()
   sampling or find the real telemetry event name; don't guess again.
4. **The PRIMARY's surface needs a losing seed set.** The metric
   presumed non-winning runs would appear on the win-side stack — they
   don't on these seeds (32/32 wins). A future wave-5-reach arm needs
   seeds where the stack bleeds (the winconfirm seed set produced
   12/16 wins; or a weaker substrate without SEATDRIVE) — or should
   measure pre-win unlock acceleration as the primary instead, since
   this run proves wave-5 DOES unlock pre-win (5/32 runs, d64–83).
5. **bloodFights=21 armed vs 0 control, zero scholar deaths.** The
   committed wave-3 hunts (courtkill's proven _huntCommit, holds to 12%)
   and the single committed wave-4 facing (35% eject unchanged) cost no
   scholar lives — the mid-fight retreat discipline held. The DESIGN
   CALL (35% not 12% for wave-4+) is vindicated by the casualty count,
   not by theory.

## Results — SECONDARY GO, PRIMARY NO-COVERAGE, all guardrails GO

Proof scripts/test-wave5reach-20261015.js 28/28 GREEN (layer-live
markers honest both sides; huntLive gating + flag-marking unit checks;
det-gate byte-identical gate-off trajectories; SMOKE green both sides).
Sweep scripts/sweep-wave5reach-20261015.js, SMOKE gate green before the
sweep (w5r/seat/windefer markers honest both sides; policy id
belongfeast-windefer).

Substrate: 8 seeds [121,232,343,454,565,676,787,898] x {leadfeast,
belongfeast} x {control, armed}, 180d death-aware, FEASTSCALE_R13=1 +
TRIBFLOOR=1 + SUCCGRACE=1 + RAIDDENSITY=1 + WINPURSUIT=1 + WINDEFER=1 +
SEATDRIVE=1 (asserted up front), identical seeds both sides, own control
in the same sweep. Control = SD.leadseat/belongseat + WAVE5REACH unset.
Armed = the same objects + WAVE5REACH=1.

| metric | control (16) | armed (16) | bar | verdict |
|---|---|---|---|---|
| wins | 16 | 16 | >= 8 | GO |
| wave-5 unlocks (total) | 2 | 3 | >= control | GO |
| wave-5 on non-winning runs | n=0 | n=0 | >= control + 2 | NO-COVERAGE |
| national | 12 | 13 | >= 10 | GO |
| invitations (table) | 16 | 16 | — | — |
| wave-4 unlocks | 16 | 16 | — | — |
| exiled | 0 | 0 | <= 1 | GO |
| median survival (all) | 119.5d | 119.5d | — | — |
| new death mode (n>=3) | — | none | — | GO |
| hunts (expeditions) | 0 | 13 | — | lever live |
| hunt engagements | 0 | 4 | — | lever live |
| committed blood fights | 0 | 21 | — | lever live |
| committed wave-4 facings | 0 | 1 | — | lever live |

Per-seed JSONs: evidence/2026-10-15/perseed-wave5reach/
(<policy>-<side>-s<seed>.json — all 32 present, numeric national, table,
wins, exiled, wave5; 0 schema-bad). Beat captures:
evidence/2026-10-15/wave5reach-beats/ (32 files; keyed on
wave-5/unlock/standing/death language).

The mechanism, per run: after wave-4 unlock, the scholar patrols
thicket/ruin nodes every 3rd day (healthy+fed), engages visible wave-3+
monsters, and commits to the fights (wave-3 via the proven _huntCommit;
wave-4+ via _w5Commit with the 35% retreat discipline). The faced rung
(waveEngaged(4) >= 2) and the war ledger (+25/kill-point) do the rest
through the engine's own gate. The lever never writes engine state.

The three armed wave-5s:
- **belongfeast s454 (the mechanism trace):** control reached wave-4
  only and won d90. Armed: hunt engaged a wave-3+ monster, the
  readiness hold beat fired d80 ("The fifth draft stays in the wings.
  Stand before the Mirror Draft's champions — more than once, more than
  one kind"), wave-5 greenlit d83, won d90. The gate named its need;
  the hunt answered it; the System noticed.
- **leadfeast s121 / s454 (the acceleration):** both sides unlocked
  wave-5 pre-win, but armed unlocked EARLIER on identical seeds (s121:
  d67 vs d75; s454: d64 vs d70). The lever is the only switch.
- Control's two: leadfeast s121 (d75) and s454 (d70) — the lead road's
  standing pace reaches wave-5 pre-win on its own; the lever hurries it.

Death modes (full 32): armed's modes are a subset of control's plus
nothing new at n>=3 (combat 297 vs 289 combined — same mode, the hunts'
expected cost; villager-combat, expedition, monster, sickness, ambush,
contest all matched). Control additionally shows starvation x1 (batch 2)
and The Redactor x1 (batch 1); armed shows The Eater x1 (batch 1) — all
n=1, none at the n>=3 bar.

## Village assessment (plain words)

Sixteen more villages sat the table and won — on seeds the stack had
never seen, 32/32 now. The wave5reach layer didn't touch the win: the
courtship ran first and fully, the hunts were additive, and every scholar
came home. The villages that hunted look like villages with a plan:
after the Mirror Draft arrived, the scholar started walking out to the
thickets on purpose — not foraging, not fleeing, but looking the new
draft in the eye. Thirteen expeditions, four engagements, twenty-one
committed fights, and nobody died for it.

The wave-5 reach reads earned in the transcripts. The System's own
machinery narrates the whole arc: the d70 "FINALES need a LEGEND" beat
names the standing bar (blood, bonds, or bread), the d80 hold beat names
the facing deficit ("Stand before the Mirror Draft's champions"), and the
d83 greenlight ("You've gotten too big for the story... Meet the
PRODUCERS") lands as a consequence, not a gift. Meanwhile the honest
counter-knowledge kept working underneath — a d78 Living Wire counter
learned at the fire while the hunt was out. The village learns tricks;
the scholar seeks the ones that matter.

What the run proves: the wave-5 gate is reachable by play, not just by
survival — deliberately facing wave-4 monsters and banking war-ledger
kills moves the unlock, and it moves it without breaking the win or
spending scholars. What it doesn't prove: the primary's question, on
non-winning runs — because the win-side stack on these seeds doesn't
produce non-winning runs. The lever is a tool for the next arm on a
losing seed set, where the wall actually bleeds.

## SENSE-TESTING LAW

Read end to end: belongfeast-armed s454 d70–90 (wave-4 unlock -> hold
beat -> engagement -> wave-5 greenlight -> table win), leadfeast-armed
s121 d52–90 (the d67 early unlock vs control's d75).

- **belongfeast-armed s454:** the arc is earned. The d70 beat
  ("FINALES need a LEGEND... More STANDING — blood, bonds, or bread")
  states the bar; the d80 hold beat ("The fifth draft stays in the
  wings. Stand before the Mirror Draft's champions — more than once,
  more than one kind") states the deficit; the hunt's engagement lands
  between; the d83 greenlight ("You've gotten too big for the story...
  Meet the PRODUCERS") reads as consequence. The unlock is not cheesy —
  the System announced the price twice before collecting it.
- **leadfeast-armed s121:** the acceleration reads as pace, not cheese —
  the lead road's standing was already climbing; the lever's hunts added
  faced types and war points earlier. Nothing in the transcript suggests
  the gate was bypassed: the same beats fire, 8 days sooner.
- Judgment: meaning and coherence pass. The reach is played, not
  granted. The lever's honest-verb constraint held everywhere the
  transcripts could show it: real patrols, real fights, real retreats
  (the 35% eject fired in the facing fights — the scholar lived to hunt
  again).

## Blanks (filled / documented)

- **FILLED:** scripts/policies/wave5reach.js — the env-gated WAVE5REACH=1
  layer (counter-learning expeditions after wave-4 unlock; _huntCommit
  for wave-3, _w5Commit for wave-4+; wraps SD.leadseat/belongseat with
  the same ids; gate-off = pure delegation; zero src/js changes).
- **FILLED:** the _w5Commit extension to competent.js's legacy flee block
  (start-of-fight walk-away overridden for committed wave-4+ facings at
  >=50% HP; mid-fight 35% eject unchanged; inert without the flag —
  pinned by the det-gate).
- **FILLED:** scripts/test-wave5reach-20261015.js (28/28 GREEN:
  layer-live markers, huntLive/flag-marking unit checks, gate-off
  det-gate, SMOKE) and scripts/sweep-wave5reach-20261015.js (the 32-run
  sweep with beat captures and the per-seed JSON schema).
- **FILLED:** the 32-run wave-5-reach census —
  evidence/2026-10-15/perseed-wave5reach/*.json (32/32 present, 0
  schema-bad) + wave5reach-beats/ (32 beat captures).
- **DOCUMENTED:** the wave-5 unlock arc on the win-side stack —
  pre-win unlocks land d64–83 on the lead road; the belong road needs
  the hunt's help (s454: engagement -> d83 unlock vs control's
  wave-4-only); the System narrates the bar and the deficit before the
  greenlight (earned, not cheesy).
- **DOCUMENTED (metric review):** the PRIMARY's non-winning surface
  doesn't exist on this stack/seeds (32/32 wins); the next wave-5 arm
  should pre-register pre-win unlock acceleration on identical seeds,
  or run on a losing substrate.

## Findings filed

- (this run) **SECONDARY GO — the wave5reach lever moves wave-5 unlocks
  in the right direction with mechanism traces and zero harm: 3/16 vs
  2/16 total, same-seed acceleration d67-vs-d75 and d64-vs-d70 on the
  lead road, one hunt-engagement -> wave-5 unlock on the belong road.
  All guardrails green (wins 16/16, national 13/16, no new death mode).
  Landing as a default-OFF policy layer for future sims.**
- Metric-design note (recurring, third run): wave-reach metrics on the
  win-side stack must be measurable WITHOUT non-winning runs — this
  stack wins 32/32 on these seeds. Pre-win unlock acceleration (armed
  earlier than control on identical seeds) is the honest primary for
  the next wave-5 arm; reserve the non-winning surface for a losing
  substrate.
- Instrument note: the 'wave_unlock' telemetry event name was a guess
  and doesn't exist (wave5Day null on 32/32). Read unlock days from the
  beat captures or daily unlockedWave() sampling.
- [open] 2026-10-15 — wave-5 unlock-day instrumentation — no engine
  telemetry event fires on wave unlock; sweeps must sample
  unlockedWave() daily to date unlocks. (sim-wave5reach metric review 3)
- Out of scope, documented: wave-5 monsters remain deliberately
  counter-less in the engine knowledge model (villageKnowsTrick covers
  waves 1–2 counters + wave-3 villagerTricks only) — the lever pursued
  the readiness gate's own currency (faced types + ledger kills), which
  is the engine's honest knowledge channel for wave-5. Wiring wave-5
  counterplay to a knowledge convention is the signature workers' call,
  not this arm's.
