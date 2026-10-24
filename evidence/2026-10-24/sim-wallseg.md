# sim-wallseg — wall end-binding re-attribution on the FULL landed substrate (run fleshout-20261024T0215Z, axis scale-onramp)

Worker tree sim-wallseg, DIAG arm: instrument-side, ZERO src/js changes.
Namespaces: wallseg-* (scripts/wallseg-sweep.js, scripts/wallseg-analyze.js,
scripts/test-wallseg.js; evidence/2026-10-24/perseed-wallseg/,
evidence/2026-10-24/wallseg-attribution.json,
evidence/2026-10-24/wallseg-sweep.log). Disjoint from the sibling arm's
namespace (bloodrestraint-*) and from loop-B namespaces (bufferdepri-*,
homecomingvol-*) by design.

Canon read first: docs/CANON.md + docs/SCALE.md (the scale ladder: six
national roads, polity bars — seasoned = 30+ days AND trust 40+, links form
at trust 30; Regional Dawn; tending required) + docs/MONSTER-WAVES.md
(combat readiness gates the standing unlock; defer5 demand: 4 armored@P>=15,
6 armed, 3 counters, 2 LIVING wave-4+ killers — recalibrated 2026-10-18).
No canon doc covers equipment — stated, not invented (same as sibling arms).

## Why this DIAG

The defer5-rediag DIAG (evidence/2026-10-23/sim-defer5-rediag.md) drew the
wall map on 24 configs: end bindings defer5 10, stand-raw 8, plenty-cap 4,
w3rung 1, unlocked 1. BUT that census ran WITHOUT the since-landed levers
TRUSTBUFFER=1 (sim-trustbuffer 2026-10-23: dip lever, GO, moved national
16/24→20/24 and table 14/24→18/24) and VETFORMATION=1 (sim-vetformation,
landed e7fc8824e: companion kill-formation for wave-4 fights, GO on
10 vs 6 distinct wave-4+ killer vids). The wall map is STALE: both landed
levers attack exactly the segments the map named (stand-raw's dip channel,
defer5's veterans channel). Meanwhile the sibling arm (sim-bloodrestraint)
is building the game-side succession restraint for the veterans leg — this
DIAG covers the OTHER live segments. This run re-draws the wall on the full
landed substrate and re-attributes every config's end binding, decomposing
stand-raw into dip-driven vs links-driven.

## PRE-REGISTRATION (§14 binding — written BEFORE any sims)

- **BINDING QUESTION:** On the FULL landed substrate, which end-binding
  binds most often NOW (defer5 / stand-raw / plenty-cap / w3rung / unlocked
  census), and for stand-raw, is the shortfall DIP-driven (post-formation
  dissolution standing loss — the trustbuffer mechanism's domain) or
  LINKS-driven (the diplomatic layer never formed — dip+links ≈ zero)?
- **SUBSTRATE (pinned, ONE substrate across the whole sweep):**
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
  KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1 VETFORMATION=1 TRUSTBUFFER=1
  LINKFORM=2.
  SUBSTRATE NOTE (documented deviation from the dispatch env list): the
  dispatch list omits LINKFORM. TRUSTBUFFER=1's buffer tend pass requires
  LINKFORM=2 — at mode 0 trustbuffer.daily delegates to linkform.daily →
  leadcourt.daily and the buffer pass never fires (linkform.js:36-44,
  trustbuffer.js gate). The trustbuffer lever LANDED as LINKFORM=2 +
  TRUSTBUFFER=1; without LINKFORM=2 the "full landed substrate" claim
  would be false and the dip channel would be unmeasured. LINKFORM=2 is
  in. KILLDISC=1 is honored game-side (no policy layer needed).
  Policy (composed, policy-side only, zero src/js):
  leadfeast: VF.withVetformation(TB.trustbufferArmedFor(), 'wallseg-lead',
  '...') — the trustbuffer census chain (feastscale→tribfloor→windefer→
  seatdrive→armorydrive→armorvillage, LINKFORM=2 + TRUSTBUFFER=1) with the
  vetformation formation/finishing layer OUTSIDE (VETFORMATION=1).
  belongfeast: VF.withVetformation(TB.trustbufferBelongArmedFor(),
  'wallseg-belong', '...'). At LINKFORM=2 the lead/belong dim is inert
  (trustbuffer metric review: the mode-2 road courtships collapse to one
  code path) — the dim is replication, effective n=12 seeds.
- **SEEDS (fresh — C1 freshness gate):** 70201–70212 × {leadfeast,
  belongfeast} = 24 configs, 180d death-aware (dead villages stop, +10d
  tail max; never a fixed 200d). Verified fresh 2026-10-24: 0 hits for
  s70201–s70212-*.json across all evidence/**/perseed-* corpora. The sweep
  refuses any seed in a banned block (all blocks used by prior corpora:
  68901–68912, 68501–68508, 68401–68408, 65511–65522, 65611–65618,
  65721–65729, 65801–65808, 66301–66316, 66401–66416, 66501–66516,
  67501–67532, 67601–67608, 67701–67708, 68301–68308, 68601–68608,
  68805–68814, 69001–69012, 70111–70122, 92801–92816).
- **DIAG-GO (binding):** iff (a) all 24 configs classified into end
  bindings with 0 unexplained, (b) the stand-raw dip/links split quantified
  with the rule documented, (c) a lever spec named for the binding segment.
  A miss is DIAG-NO-GO, never re-scored.
- **END-BINDING CLASSIFIER:** reuse of scripts/defer5rediag-analyze.js
  classify() (required, not copied) — recomputeEndBinding from the final
  trace row (w3rung / stand-raw / plenty-cap / defer4 / defer5 / w4faced /
  unlocked), then the named channels for defer4/defer5 (bar-never-met:<bars>
  / met-but-not-simultaneous / overlap-before-standing / gate-released).
  Any UNEXPLAINED return fails bar (a).
- **STAND-RAW DIP/LINKS RULE (documented, applied per stand-raw config):**
  standing raw = war + diplomacy + min(plenty,cap) (standing.js:351);
  diplomacy = 34 × seasoned regional+ links (standing.js:36,126-144).
  The w5gates-lib daily trace records t.dip (diplomacy points) and t.links
  per day; gateVector carries end dip/links. Per config:
  dipPeak = max daily dip; endDip, endLinks = final-trace values;
  dissolutionMag = dipPeak − endDip; dissolution events = single-day dip
  drops with magnitude ≥ 102 after formation (the trustbuffer revised
  classifier).
  1. dissolutionMag ≥ 102 → **dip-driven**: the village built the
     diplomatic layer (≥3 links' worth) and LOST it post-formation —
     the funeral correlated-shock / succession channel, the trustbuffer
     mechanism's domain.
  2. else, endLinks ≤ 0 AND dipPeak < 102 → **links-driven**: the village
     never built a seasoned regional+ diplomatic layer — dip+links ≈ zero
     all run; the diplomatic layer is the missing standing.
  3. else → **stand-other (war/plenty)**: diplomacy largely intact (or
     partially eroded < 102) but raw < 200 anyway — the shortfall sits in
     war/plenty, not the diplomatic layer. Honest escape hatch, never
     "unexplained".
  Bar (b) passes iff every stand-raw config lands in exactly one of the
  three with the rule above — 0 unnamed.
- **GUARDRAILS:** wall block (national/table/wins, wave4/5, median/max
  survival, death-cause shares); no new death kinds (≥2-event rule).
- **INSTRUMENTS:** scripts/w5gates-lib.js UNMODIFIED (dailyGateTrace +
  gateVector; verified unmodified via git diff — empty) + direct
  state.waveKillLog read (dedup on (d,mid,by,via,trick) per backlog #844).
  Per-seed JSONs written ONCE to evidence/2026-10-24/perseed-wallseg/ with
  sha256-after-write readback (the selective write-denial class is real;
  24/24 written, 0 zero-byte). Sweep outputs to the worktree evidence dir,
  NEVER /tmp.
- **PROOF (before the census):** scripts/test-wallseg.js — classifier unit
  tests on synthetic standing trajectories for each end-binding class
  (defer5 bar-never-met:veterans, met-but-not-simultaneous,
  overlap-before-standing, gate-released, stand-raw, plenty-cap, w3rung,
  unlocked, never-bound) + the UNEXPLAINED trap + the three stand-raw
  sub-classes + determinism (same seed → same classification, two 2-day
  sims on the FULL landed substrate, in-memory) + the freshness gate
  (banned seeds refused, fresh band accepted) + env-guard refusals
  (LINKFORM≠2 → exit 2, missing TRUSTBUFFER → exit 2). 20/20 GREEN before
  the census.
- **§15:** panel judged inapplicable for zero-src/js DIAG arms per the
  doorcensus/defer5rediag precedent — the identical-seed corpus on
  unmodified instruments is the instrument, the DIAG-GO bar the judge.
- **METRIC REVIEW section mandatory** (below).
- **SENSE:** one config per major end-binding — read the trajectory and
  report whether the classification matches the story the sim tells
  (SENSE-TESTING LAW).

## Census

24/24 configs complete (12 fresh seeds 70201–70212 × {leadfeast,
belongfeast}), 180d death-aware, one anchor (c76a52480b09 — verified
identical on all 24). Per-seed JSONs in
evidence/2026-10-24/perseed-wallseg/ with sha256-after-write readback (all
24 green). 0 instrument errors. Lead/belong pairs byte-identical on every
seed (the mode-2 inertness holds — effective n=12).

## Attribution — PRE-REGISTERED DIAG-GO: 24/24 named, 0 unexplained → DIAG-GO

Analyzer: scripts/wallseg-analyze.js (defer5rediag's classify() REQUIRED,
not copied; stand-raw sub-classifier per the pre-registered rule; end
binding from the trace-recomputed final row; 0 stored-vs-recomputed
mismatches).

**End-binding census (the wall, re-drawn):**

| end binding | now (full landed) | stale map (defer5-rediag) |
|---|---|---|
| defer5 | **14** | 10 |
| unlocked | **8** | 1 |
| defer4 | 2 | 0 |
| stand-raw | **0** | 8 |
| plenty-cap | 0 | 4 |
| w3rung | 0 | 1 |

Channels: gate-released (door-opened) 8; bar-never-met:veterans 16 (14
defer5 + 2 defer4). 0 UNEXPLAINED. Denominator 24, named 24.

**The defer5 binder (bar-by-bar, 14 binding configs):**

| bar | binds | never-met | met-then-lost |
|---|---|---|---|
| veterans (2 living w4+ killers) | **14/14** | **14** | 0 |
| armed (6) | 12/14 | 0 | 12 |
| armored (4 @P≥15) | 10/14 | 0 | 10 |
| tricks (3) | 0/14 | 0 | 0 |

Veterans is the SOLE binder and it hardened: 14/14 never-met (was 9/10).
Armor and weapons now bind ONLY via decay (met-then-lost — gear stripped by
combat deaths); tricks never binds. The defer4 bind (2 configs, seed 70207
both policies) is bar-never-met:veterans on the defer4 demand (1 living
w3+ killer — standing.js counts e.w ≥ w−1, so the wave-4 readiness bar is
blooded at wave 3).

**The defer5 kill autopsy (per-config wave-4+ kills on the 14 binding configs):**
10/14 configs scored ZERO wave-4+ kills all run (25–71 days of
wave-4-unlocked time each); 2/14 scored 1 (scholar); 2/14 scored 1
(companion). This is a FORMATION bind, not just retention: the villages
fight (~43 combat-ish deaths/config, vs 48 on the unlocked configs —
exposure is not the gap) but never land the killing blow at wave 4.
Contrast the 8 unlocked configs: 34 wave-4+ kills, 22/34 via=companion —
the staged-formation channel converts when it engages.

**Coincidence overlap:** 0 days on 16/24; 5–17 days on the 8 unlocked
configs (first overlap = the door-opening day in each case). The
coincidence trap still holds shut on the binding configs, but the door now
opens 8× as often as on the stale substrate (1→8).

**The stand-raw dip/links split:** 0 stand-raw configs — the split's
denominator is empty. The rule is documented (above) and the classifier ran
(subClassifyStandRaw unit-tested P2a–P2f, 6/6); 0 unnamed of 0. The dip
channel measured DIRECTLY instead: 22/24 configs formed the diplomatic
layer (dipPeak ≥ 102), **0/24 suffered a dissolution event** (no single-day
dip drop ≥ 102), mean endDip 144.5, max dipPeak 170. The trustbuffer depth
lever didn't just reduce dissolutions — on this seed band it eliminated the
post-formation dissolution channel entirely, and with it the stand-raw end
binding (8→0). Bar (b) passes vacuously with the mechanism measured
directly; see metric review.

## Wall numbers

national **20/24** (stale: 8/24), table **22/24** (stale: 19/24), wins
**0/24** (unchanged — the win wall stands), wave4 **22/24** (stale: 18/24),
wave5 **8/24** (stale: 1/24), median survival 130d (stale: 151d), max 182d.

Defer5 first-fire days on the 14 binding configs cluster d51–d75 (the hold
bites earlier than the stale band's median ~122 — the villages reach
capped≥200 faster on the landed substrate, then wait on veterans).

## Sense reads (one per major end-binding — the classification matches the story)

**UNLOCKED — s70204-lead (door opened d104, village-lost d121).** d97: the
defer5 hold fires (capped hits 200, veterans=1 — the hold names the short
second veteran for 7 days). d104: luis_fernandez kills an Influencer (w4,
via=companion — the formation channel) → veterans 1→2 while capped=275;
all four bars coincide (5/8/18/2) → the door OPENS (uw 5, peak-5 ratchet),
overlap window [104,120] = 17 days. d104–120: the village lives in wave 5,
standing climbing to 530/350. d121: catastrophe in a single day — armored
7→1, armed 8→1, veterans 2→1; the kill log shows the village fighting a
congregation (w4, killed by both luis_fernandez and the scholar) and an
editor (w5, killed by the scholar) — wave-5 content killed the village the
day it was faced. Table reached WITHOUT national (table 1, national 0) —
the table path does not require the national rank. The
gate-released/door-opened classification is exactly what the trace says.

**DEFER5 — s70203-lead (bar-never-met:veterans).** The classic bind, now
with the dip story attached: dip rose to 136 (4 seasoned links) by d105
and HELD to the end — no dissolution, the trustbuffer mechanism visible in
the trajectory. One wave-4+ kill all run (d88, suburb, scholar via=player).
Armor/armed/tricks all met then decayed. national 1, table 1, wave 5 never
unlocked, village-lost d115. The village had everything except the second
living veteran. Bar-never-met:veterans is the honest label.

**DEFER4 — s70207-lead (bar-never-met:veterans, the quiet village).** The
village SURVIVED to d181 (end: survived) at national with dip 170 (5
links), 10 armored, 11 armed, 20 tricks — and ZERO wave-3+ kills all run
(17 kills, all wave 1–2). The defer4 readiness bar (1 living w3+ killer)
never met → wave 4 deferred the entire run (peak stuck at 0, uw never left
3). A thriving national village that never saw wave 4 because it never
blooded anything at wave 3. Only 4 combat-ish deaths in 181 days — this
village didn't fight; it gardened its way to national while the draft
waited. The defer4 classification names the trap exactly.

## Lever spec — the named next (bar (c))

**Binding segment:** defer5-veterans — 14/14 binding configs never field 2
living wave-4+ killers; 10/14 never score a single wave-4+ kill despite
25–71d of wave-4-unlocked time and full combat exposure. The sibling arm
(bloodrestraint) owns the RETENTION half (succession restraint for blooded
vids). This spec is the FORMATION half's missing piece.

**Measured grounding for the mechanism:** the landed sim-havencontact DIAG
(2026-10-23) measured 80.3% of wave-4+ player exposure as havencontact
(ambient contact at the haven tile). Vetformation's formation beat stages
only on `wave4Imminent` — a wave-4+ monster on a TRAVEL TARGET — and
requires atHaven; the dominant exposure channel (the monster AT the haven
tile) never triggers staging. The finishing discipline then has no staged
companions to hand kills to. That is the formation gap the defer5 zeros
are consistent with.

**VETCONTACT=1 — the havencontact formation lever** (policy-side, zero
src/js; formation-side — does NOT touch succession/retention, the sibling's
lane):
- Mechanism (ONE DELTA): when the staging window is live (wave-4 unlocked
  && the wave-5 veterans bar unmet — the same live reads vetformation
  uses) AND a wave-4+ monster sits on the haven tile (the havencontact read:
  Game.monsterAt(haven) — the channel the sim-havencontact DIAG named),
  stage the kill-formation AT Haven immediately: the best armed fighter as
  anchor paired with the best armed non-veterans (a veteran's repeat kill
  forms nothing), up to 3, consent-based invites (Game.inviteToParty —
  personality/goals decide, VGEAR protocol shape), NEVER dismisses,
  non-suicidal (armed, hp ≥ 40%, trust ≥ 20) — the same gates as
  vetformation's formationBeat, minus the travel-target threat requirement.
  Fires only when vetformation's own travel-target signal is COLD (one
  delta, no double-staging). The landed finishing discipline operates in
  the resulting TB fight unchanged. Env gate VETCONTACT=1 opts in; gate off
  = pure delegation, byte-identical to the wrapped stack (det-gate pinned
  in the proof, same pattern as vetformation/trustbuffer).
- Design calls (Steve 2026-10-07: made, documented, overrulable): stage at
  the haven rather than sallying out (the fight is coming anyway —
  havencontact is ambient, not a siege; sallying would change the exposure
  the DIAG measured); the 3-fighter cap mirrors the formation size;
  no new beats beyond the formation commit line (the brave-things voice
  already exists).
- PRE-REGISTERED PRIMARY (binding): wave-4+ kills per config, armed vs
  control, paired identical seeds, 8-seed pilot (16 configs), 180d
  death-aware, the full landed substrate + VETCONTACT=1. GO iff armed
  total − control total ≥ +4 kills AND armed ≥ control on ≥6/8 pairs.
- ENGAGEMENT: contactStages (formations staged for havencontact) > 0 on
  ≥6/8 armed configs; staged wave-4 fights armed > control.
- GUARDRAILS: median survival paired diff ≥ −10d; starvation ≤ control+2;
  no new death kinds (≥2-event rule); wall block (national/table/wins,
  wave4/5, median survival).
- Namespace: vetcontact-* (do not collide with bloodrestraint-*,
  wallseg-*, or loop-B namespaces).

## Metric review

- **Bar (b) passed vacuously — and that IS the finding.** The pre-registered
  dip/links split assumed stand-raw would still bind. It doesn't: 0/24
  stand-raw end bindings (was 8/24), because the dissolution channel the
  split was built to decompose fired 0 times on 24 configs (22/24 formed
  the layer, 0/24 dissolved, mean endDip 144.5). Per §14 the bar is not
  re-scored: (b) is satisfied as stated (0 unnamed of 0, rule documented,
  classifier unit-tested), and the direct dip-channel measurement replaces
  the split as the evidence. Revision for the NEXT run: the dip/links split
  only has a denominator on a substrate where stand-raw binds; a future
  DIAG that wants the split should run it against a pre-trustbuffer
  substrate or a seed band where dissolutions still occur.
- **The lead/belong policy dim is inert (again).** All 12 seeds
  byte-identical across the dim (bindings, overlaps, wall fields) —
  effective n=12, same as the trustbuffer metric review. A future lever
  that wants a live policy contrast must vary a dimension the mode-2 layer
  actually reads.
- **Defer5 first-fire moved earlier (d51–75 vs stale median ~122).** Not a
  claim — different seed band (70201–70212 vs 70111–70122); noted, not
  compared as an effect.
- **Guardrails:** death-cause shares — combat:734, villager combat:198,
  monster:60, expedition:60, starvation:14, ambush:8, sickness:6, 'a wound
  that wouldn't close':6, dehydration:4, Highbeam Deer:2, Choir Toad:2,
  lockjaw:2, thirst:2, 'a gold flash in the grass, gone when you look':2,
  the night:2, Spool:2, contest:2, alien:2. Every ≥2-event cause string
  grep-verified present in src/js or src/data (the 'gold flash' string is
  the established unknown-monster death flavor in src/data/monsters.json)
  — **no new death kinds**. Starvation 14 total (0 on the unlocked
  configs).
- **TELEMETRY DEVIATION CHECK:** 2 LOUD lines — national 12→20 (EXPLAINED:
  the landed levers moved the wall; the baseline predates
  trustbuffer/vetformation) and wins 16→0 (REGIME artifact, the known
  class: WINSEAT full-stack baseline vs this SEATDRIVE=0 pre-seat census —
  same precedent as the 1930Z/2030Z/2330Z runs). Baseline NOT rolled.

## Blanks filled / documented

- FILLED (measured): the wall re-drawn on the full landed substrate —
  defer5 14 (all bar-never-met:veterans, hardened from 9/10), unlocked 8
  (was 1), defer4 2, stand-raw 0 (was 8), plenty-cap 0 (was 4), w3rung 0
  (was 1). The trustbuffer lever eliminated the stand-raw end binding on
  this band (0/24 dissolutions); vetformation + the retained veterans
  opened the wave-5 door 8× as often.
- FILLED (measured): the defer5 kill autopsy — 10/14 binding configs with
  ZERO wave-4+ kills despite 25–71d wave-4-unlocked windows and full combat
  exposure; the bind is formation (conversion), not exposure volume.
- DOCUMENTED (finding, appended to sim-findings.md): the post-unlock
  retention trap — all 8 unlocked villages died 17–65d after the door
  opened (s70204: 17d, s70201/s70202: 31d, s70209: 65d). Opening the door
  is no longer the wall; SURVIVING wave 5 is the next wall. The named next
  after the VETCONTACT lever.
- DOCUMENTED (finding, appended to sim-findings.md): the defer4
  quiet-village trap — s70207 survived 181d at national with dip 170 and
  never unlocked wave 4 (0 wave-3+ kills all run; the readiness bar needs 1
  living w3+ killer). A peaceful national village the draft never comes
  for. Whether that's a bug or a valid pacifist path is a design call.
- DOCUMENTED (gap, not chased): wave-4 fight exposure vs conversion can't
  be separated from this corpus (no per-fight telemetry) — the VETCONTACT
  spec carries the engagement instrument that separates them.

## Convergence note

Axis scale-onramp. The re-DIAG closes the defer5-rediag named-next on the
full landed substrate: the wall's shape changed decisively. The diplomatic
layer (stand-raw/dip) is FIXED — trustbuffer holds it to end on every
config. The armor/weapons legs are filled (bind only via decay). What
remains is essentially ONE bar: the defer5 veterans coincidence (14/14
never-met) plus its defer4 little sibling (2/2 never-met) — villages fight
for weeks at wave 4 and never land two living wave-4+ killers. The sibling
arm (bloodrestraint) is on the retention half; the VETCONTACT spec above is
the formation half's named next (havencontact is 80% of wave-4 exposure
and the current formation beat doesn't stage for it). Behind the veterans
bind waits the next wall, already visible: 8/8 door-openings ended in
village death 17–65 days later. The scale wall stands: wins 0/24, national
20/24, table 22/24.

## Instruments committed (namespace wallseg)

- scripts/wallseg-sweep.js — the 24-config full-substrate census composer
  (env guard: LINKFORM=2 required for TRUSTBUFFER=1; BLOODRESTRAINT
  explicitly off; C1 freshness gate with the extended banned list)
- scripts/wallseg-analyze.js — the judge (defer5rediag classify() required,
  not copied; pre-registered stand-raw dip/links sub-classifier; wall
  block; attribution JSON)
- scripts/test-wallseg.js — the proof (20/20 GREEN pre-census: P1
  classifier units on synthetic trajectories incl. the UNEXPLAINED trap,
  P2 dip/links sub-classifier units, P3 determinism on the real harness
  path, P4 freshness gate + env-guard refusals)
- evidence/2026-10-24/perseed-wallseg/ — the corpus (24 files, 0 zero-byte)
- evidence/2026-10-24/wallseg-attribution.json — the attribution
- evidence/2026-10-24/wallseg-sweep.log — the sweep log
- evidence/2026-10-24/sim-wallseg.md — this file
