# sim-vetkill-autopsy — WAVE-4 KILLER AUTOPSY (run fleshout-20261023T1115Z, axis scale-onramp)

Worker tree sim-vetkill-autopsy, DIAG arm: instrument-only, ZERO src/js changes.
Namespaces: vetkill-autopsy-* scripts; disjoint from siblings.

Canon read first: docs/CANON.md + docs/MONSTER-WAVES.md. The defer5 gate design
lives in src/js/standing.js:184 — waveCombatReadiness(5) demands 4 armored@P>=15,
6 armed, 3 counters, 2 LIVING wave-4+ killers (veterans is the universal binder
per the sim-defer5gate DIAG).

## PRE-REGISTRATION (§14 binding — adopted verbatim from the brief at run start, before any analysis/sims)

- **BINDING QUESTION (#837 named next):** AUTOPSY WHAT KILLS THE WAVE-4 KILLERS.
  The defer5gate DIAG proved veterans is the universal binder (short on 16/16
  configs; only 1/16 ever held 2 living veterans at once; they decayed as
  killers died). What are the death-cause shares on waveKillLog `by` vids?
- **DIAG-GO (binding):** >=90% of identified wave-4+ killer deaths attributed
  to NAMED cause classes (combat vs wave-4, other combat, starvation, disease,
  wound, other) + a ranked death-cause share table + named nexts (which channel
  is the retention lever: killer-mortality vs never-formed).
- A miss is **insufficient-data, not a failure** — this is a DIAG arm.
- **Seeds:** 8 seeds (65511–65518) x {lead, belong} = 16 configs, 180d
  death-aware, substrate FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
  SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 (armorydrive pinned substrate on BOTH
  arms — the richest measured door substrate, where veterans actually form).
- **Offline-route check FIRST:** the retained corpora
  (evidence/2026-10-23/perseed-w5door-b/*/s<seed>.json, 24 configs, plus
  defer5gate-attribution.json) were inspected for waveKillLog `by` vids and
  per-villager death cause/day granularity BEFORE any new sims.
- **METRIC REVIEW section mandatory** (below); §15 panel compare applies IF new
  sims ran (panel is the instrument, the pre-registered bar is the judge —
  DIAG-GO >=90% attribution, not a before/after lever effect).

## VERIFIED GRANULARITY GAP (fail-loud, no invention — checked before building)

- `grep -l waveKillLog evidence/2026-10-23/perseed-w5door-b/*/*.json` → NO hits.
- Every perseed file: `kills: []` (empty list) — the killdisc wrapper's t.kills
  missed wave-4 kills (s65511: veterans bar hit 1, l4Ledger 3, but t.kills=[]).
- deathRows DO exist ({day, who, kind, cause, wave, real}) but name no killer
  vids.
- CONCLUSION: the retained corpora cannot name wave-4+ killer vids or join
  them to death causes. The offline route FAILS. Fresh instrumented census
  authorized per the brief — no attribution invented.

## Method (instrument-only)

- `scripts/vetkill-autopsy-sweep.js`: the census. Retains two NEW sensor
  streams the retained corpora lacked:
  1. state.waveKillLog read DIRECTLY post-run (the SOURCE the veterans bar
     reads — standing.js:278; entries {d, mid, w, by, via, trick}; `by` =
     killer vid, scholar's own vid for the player). Direct read chosen because
     the killdisc t.kills wrapper missed these in w5door-b.
  2. per-villager death rows (lesson #760 shape) via the windowstay
     death-capture layer — {day, who, kind, cause, wave, channel} where
     `who` = villagerId (corpses.js tele('death')) — the exact key space of
     waveKillLog `by`.
  Also retains the daily window trace (r5 veterans bar per day — shows
  veterans forming/decaying), wall numbers, dayHash chain.
- `scripts/vetkill-autopsy-analyze.js`: PURE offline join on vid:
  wave-4+ kill events → killer vid → death row (kind='villager', real) →
  named cause class. Writes evidence/2026-10-23/vetkill-autopsy-attribution.json.
- `scripts/test-vetkill-autopsy.js`: proof — E1 RED→GREEN fixtures
  (missing-sensor fails loud claiming nothing; synthetic corpus attributes
  exactly), E2 analyzer byte-identical DET, E3 sweep env guard exits 2,
  E4 classifyDeathCause unit cases.
- `scripts/sense-vetkill-autopsy.js`: SENSE reads — replays census seeds with
  live narration, prints death beats of wave-4+ killers with voiced context.

## Results

Corpus: 16/16 configs (8 seeds x {lead, belong}-armorydrive), anchor
db7a0456381d (= current master at census time), 180d death-aware. 15 wave-4+
kills recorded in state.waveKillLog, 10 distinct killer vids.

### The autopsy table (killer-death causes, all 16 configs)

| cause class | n | share of killer deaths |
|---|---|---|
| other-combat (combat vs wave-unknown) | 7 | 87.5% |
| other (raw cause 'contest') | 1 | 12.5% |
| combat-vs-wave-4 | 0 | 0% |
| starvation | 0 | 0% |
| disease | 0 | 0% |
| wound | 0 | 0% |

Killer deaths: 8 of 10 killer vids died; 2 survived to end-of-run
(boris_kowalski, ruby_callaghan — both belong arm). Scholar killer deaths: 0
(the scholar held NO wave-4+ kills in this corpus — all 10 killers were
companions/named villagers).

Death detail (all 8):

| vid | arm/seed | wave-4+ kills | death day | gap | raw cause | channel |
|---|---|---|---|---|---|---|
| gen_sqspw45 | belong/s65513 | strike@d155,d157 | 165 | 8d | combat | raid (aid-crisis) |
| gen_khnpw4m | belong/s65515 | strike@d64 | 71 | 7d | combat | raid (scholar-fight-at-haven) |
| victor_lopez | belong/s65515 | algorithm@d94 | 100 | 6d | combat | raid (aid-crisis) |
| tashi_sherpa | belong/s65515 | influencer@d96 | 102 | 6d | combat | raid (aid-crisis) |
| gen_qmv4yhy | belong/s65517 | strike@d87, eulogy@d95 | 102 | 7d | combat | raid (aid-crisis) |
| gen_8nf1t4z | belong/s65517 | algorithm@d103, suburb@d105 | 110 | 5d | combat | raid (aid-crisis) |
| valeria_quispe | lead/s65514 | d112 (1 kill) | 113 | 1d | combat | raid (scholar-fight-at-haven) |
| gen_w46vl95 | lead/s65516 | d158,d166,d166 (3 kills) | 169 | 3d | contest | other (unmapped) |

### Reading the table (the retention story)

1. **Killers die AFTER their kills, never in them.** Zero same-day deaths, zero
   pyrrhic entries. The gap is 1–8 days (mean ~6): a villager bloodies
   themselves on a wave-4 monster, then dies within a week in a LATER fight.
   The wave-4 fight is survived; the attrition is what kills.
2. **The deaths are attritional combat — raids and haven fights.** 5/7 combat
   deaths carry the aid-crisis raid channel; 2/7 are scholar-fight-at-haven.
   Wave granularity is unavailable (death tele `wave` is null on these paths —
   corpses.js doesn't pass it), but the window trace shows wave-4 monsters
   faced on the same days (w4faced 2–6, uw 4–5), so these are plausibly
   wave-4-era fights. NOT reclassified — inference, not sensor.
3. **The wave-5 door opened in 2/16 configs (belong s65515, s65517)** — the
   defer5 gate is NOT the whole story: both villages still died (d102, d116)
   shortly after the door opened. Attrition outruns the gate.
4. **Never-formed dominates the corpus: 10/16 configs had ZERO wave-4 kills.**
   Killer-mortality is the retention lever among formed configs (8/10 dead);
   never-formed is the bigger lever across the corpus.
5. **The scholar never becomes a veteran.** 0/10 killer vids were the scholar.
   (Sense reads confirm the scholar fights alongside but the killing blows go
   to companions — 'via: player'/'companion' in waveKillLog, and the bar
   counts them regardless.)

### DIAG-GO verdict

Pre-registered DIAG-GO: >=90% of killer deaths in named cause classes + ranked
table + named nexts. **GO**: 8/8 killer deaths attributed to named cause
classes (7 other-combat, 1 other with raw cause 'contest' listed), ranked
table above, named nexts below. No death unattributed, none invented.

## Metric review (§14 — the bar held, with one honest caveat)

- The analyzer's internal strict rate (non-catch-all classes only) is 7/8 =
  87.5%: one death sits in the catch-all 'other' (raw cause 'contest', listed).
  The pre-registered metric named 'other' as a class, so GO stands at 8/8 —
  but the informative-share is 87.5%, reported here rather than hidden.
- **Sensor gap for the next DIAG:** 7/7 combat deaths have `wave: null` on the
  death tele (raid/haven death paths in corpses.js don't pass the killer
  monster's wave). If the retention question needs combat-vs-wave-4 precision,
  retain fightStarts + pass wave on those death paths — don't reclassify from
  window-trace w4faced (inference).
- 'contest' as a death cause (lead/s65516 gen_w46vl95 — died d169, 3 days after
  their 3rd wave-4 kill) is a real named channel (played contests kill) that
  the pre-registered classes didn't anticipate. Proposed revision for the next
  run: add 'contest' as its own named class (contest deaths are played, not
  RNG — Steve 2026-10-11 — and a veteran dying in a contest is a design-relevant
  channel). Applied to NEXT run's pre-registration, not this one's.
- §15 panel: no lever was changed (DIAG arm, instrument-only) — no before/after
  compare exists to panel. The pre-registered bar (attribution >=90%) is the
  judge; the panel has nothing to instrument here.

## Named nexts (retention-lever read)

1. **killer-mortality is the confirmed retention channel (formed configs):**
   veterans form then die in attritional combat 1–8 days later (mean ~6d).
   The defer5 gate demands 2 LIVING veterans simultaneously; attrition keeps
   them from overlapping. Any retention lever (heal-after-kill beats, veteran
   protection in raids, grace windows) targets the 5–8 day post-kill window.
2. **never-formed is the bigger lever (corpus level):** 10/16 configs never
   produced a wave-4 kill. The formation problem (villagers don't engage/kill
   wave-4) outweighs the retention problem. A formation DIAG (engagement
   census → kill conversion) is the natural sibling arm.
3. **scholar-veteran gap:** the scholar never holds a wave-4 kill (0/10). If
   the design wants the player-character to blood themselves, that's a blank
   (policy or fight-discipline, not gate math).
4. **wave-null death tele:** instrument gap (metric review) — blocks precision
   on combat-vs-wave-4 for future autopsies.

## Sense verdict (SENSE-TESTING LAW — 3 killer-death transcripts read)

Replays with live narration, deterministic (same seeds → same deaths, same
days):

- belong/s65515: gen_khnpw4m (d71) died in a round-7 TB fight vs "The Eulogy"
  with FEASTED blows and "The gamblers are very quiet." — 7 days after killing
  'strike'. victor_lopez (d100) died vs "The Eater" (a RERUN monster, forage
  swelling narrated, "OH. Oh no."). tashi_sherpa (d102) died vs "The
  Cancellation" with "System favor goes silent — the audience cannot hear you."
- belong/s65517: gen_qmv4yhy (d102) died in a 16-ROUND fight vs pack-leader
  "The Suburb" — 7 days after two wave-4 kills. gen_8nf1t4z (d110) died vs
  "The Reunion" rounds 4–6 — 5 days after killing 'algorithm' and 'suburb'.
- lead/s65516: gen_w46vl95 — the village's only triple wave-4 killer
  ('congregation' ×3, d158/d166) — died d169 in a CONTEST duel: "The
  highlight package is already cut. Duel will replay this forever." /
  "'Not to the death,' they said. The ref-drone logs it as an accident.
  Your opponent doesn't stop shaking for a week." / "The Death Reel will
  be tasteful. It won't be."

VERDICT: earned and coherent. Every killer death is a real named-monster
fight with visible stakes (rounds, feats, audience reactions) — no silent
attrition, no robotic repeats. The fiction notices: "The gamblers are very
quiet" reads as the village/audience registering a blooded fighter's death.
The mantle/overtime context is thin in the immediate lines (no explicit
funeral beat captured in the 8-line window), but the deaths themselves are
meaningful, not mechanical.

## Telemetry deviation check (Steve 2026-10-13)

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current 'evidence/2026-10-23/perseed-vetkill-autopsy/{lead,belong}/*.json'
--metrics national,table,wins,exiled` fired LOUD: lead table 16→5, wins 16→0;
belong national 12→1, wins 16→0.

**Investigated — all EXPLAINED, no bug, baseline NOT rolled forward.** The
scale-wall.json baseline's own `_regime.note` says: "DO NOT compare pre-seat /
courtship / readiness substrates against this baseline — wins are structurally
~0 there and telemetry-check will fire a spurious LOUD 'wins disappeared'."
This corpus is SEATDRIVE=0 (non-seat long DIAG substrate); the baseline is the
winseat regime (SEATDRIVE=1, ~100%-win stack). All four LOUD lines are regime
artifacts. Corpus wall numbers for the record: national 6/16, table 12/16,
wins 0/16, maxWave 5 on 2/16 (belong s65515, s65517 — doors opened, villages
still died d102/d116).

## Convergence note

- Axis scale-onramp: this arm closes the #837 named next (vetkill autopsy).
  The retention story is now measured: formed killers die in attritional
  combat within ~6 days; never-formed dominates 10/16.
- Findings for the backlog (outside this arm's scope, appended):
  - [open] 2026-10-23 — scale-onramp — scholar never holds a wave-4 kill
    (0/10 killer vids across 16 armorydrive configs); the blooded-fighter
    fiction lands entirely on companions (vetkill-autopsy corpus).
  - [open] 2026-10-23 — scale-onramp — wave-5 door opened in 2/16 configs
    (belong s65515/s65517) yet both villages died within ~2 weeks — attrition
    outruns the gate; the gate is not the binding constraint once veterans
    form (vetkill-autopsy corpus).

## Instruments committed (namespace vetkill-autopsy)

- scripts/vetkill-autopsy-sweep.js — the 16-config census (pinned-substrate
  env guard, direct state.waveKillLog retention + windowstay death capture)
- scripts/vetkill-autopsy-analyze.js — pure offline vid-join attribution +
  ranked table
- scripts/test-vetkill-autopsy.js — proof: 5 gates green (E1 RED→GREEN, E2
  DET byte-identical, E3 env-guard exits 2, E4 classifier units)
- scripts/sense-vetkill-autopsy.js — narration-replay killer-death transcripts
- evidence/2026-10-23/perseed-vetkill-autopsy/{lead,belong}/s<seed>.json —
  the corpus (16 files)
- evidence/2026-10-23/vetkill-autopsy-attribution.json — the join output
- evidence/2026-10-23/sim-vetkill-autopsy.md — this file

Anchor: db7a0456381d. Zero src/js changes. Merged locally, pending ship.

