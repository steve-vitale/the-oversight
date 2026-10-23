# sim-vetretention — POST-KILL RETENTION lever (run fleshout-20261023T1215Z, axis scale-onramp)

Worker tree sim-vetretention, arm sim-vetretention (the RETENTION half of the
veterans coincidence trap). Policy-side, ZERO src/js changes. Namespaces:
vetretention-* scripts + scripts/policies/vetretention.js; disjoint from the
sibling sim-vetformation arm by design.

Canon read first: docs/CANON.md + docs/MONSTER-WAVES.md (wave-4 = The Mirror
Draft; the defer5 VETERANS bar = 2 living roster members with wave-4+ kills
in state.waveKillLog, src/js/standing.js). Then the vetkill-autopsy evidence
(evidence/2026-10-23/sim-vetkill-autopsy.md), the vetbench evidence
(evidence/2026-10-22/sim-vetbench.md), and the mantlechain DIAG
(evidence/2026-10-22/sim-mantlechain.md, commit 30f93461b). No canon doc
covers village protection rites — stated, not invented.

## The surface

sim-defer5gate proved veterans is the universal binder (short on 16/16
configs). sim-vetkill-autopsy attributed the binder: the killers EXIST then
DIE — 8/10 wave-4+ killer vids died 1–8 days AFTER their kills (mean ~6d) in
later attritional combat (5 aid-crisis raids, 2 haven fights), 0 in the
wave-4 fight itself. 10/16 configs never formed a veteran (formation is the
sibling arm's lane). The wave-5 door opened in 2/16 configs but both
villages died within ~2 weeks — attrition outruns the gate.

## The lever

scripts/policies/vetretention.js (VETRETENTION=1, default-off): named-veteran
protection for a 14-day window after a wave-4+ kill. Blooded vids (living
roster, non-scholar, wave-4+ waveKillLog kill within 14d) get:
  (a) SHELTER when hurt (HP <= 55; release at >= 85 or window lapse) via the
      engine's own shelter verb — mechanically excluded from the raid draft,
      the wild router, and duties (honest cost: lost production);
  (b) TRIAGE priority — the engine's own villagerHealCheck (pharmacy, then
      camp healer) run for the blooded first, proactively each day;
  (c) ESCORT pairing — on raids, v.shielded (the raid draft's own
      back-of-the-line state, written game-side by table.js
      facilitate('shield'): "spend others first"); on expeditions, the
      layer wraps startExpedition and sends a healthy companion on the
      same expedition (engine-honest state, escortFor marked).
The vetbench finding is honored: the game-side muster already shelters
EVERYONE on wave-4+ threat-near-haven days, so this lever targets the
post-kill window on ORDINARY days (named blooded vids, not the wave
window) — it never releases villagers the muster owns. The mantlechain
finding is honored: the chair is the accelerant (8/8 in-scope veteran
deaths as mantle-holder; veterans-at-succession 3/3 dead ≤16d) — the
scholar is never sheltered/shielded, and the moment a blooded vid takes
the mantle, all retention stands down (chair-release traced). The layer
never touches trust, so it cannot feed the succession rule.

## PRE-REGISTRATION (§14 binding — written BEFORE any sims)

- PRIMARY: wave-4+ killer vid post-kill survival — join state.waveKillLog
  `by` vids (read DIRECTLY post-run, per the autopsy method) to
  per-villager death rows; median days-alive-post-kill:
  armed(VETRETENTION=1) >= control + 4d. A miss is NO-GO, never re-scored.
  (daysAlive = deathDay − last wave-4+ kill day on/before death; survivors
  censored at run end-day — the autopsy's gap convention.)
- ENGAGEMENT: >=6/8 seeds have >=1 blooded vid receiving a named retention
  action (shelter/heal/escort/sitout/shield) within 14d post-kill (trace
  instrument proves it fired).
- GUARDRAILS: median survival paired diff >= -10d; starvation <=
  control+2; no new death kinds (>=2-event rule); report wall
  (national/table/wins, wave4/5, median survival) both arms.
- SEEDS: 68601–68608 x {leadfeast, belongfeast} x {control, armed} = 32
  configs, 180d death-aware. Substrate pinned BOTH arms:
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
  KILLDISC=1 ARMORYDRIVE=1 (the autopsy corpus — comparable).
- PILOT: the 32-run sweep IS the pilot (8 seeds). Confirm (12–16 fresh
  seeds) ONLY if pilot GO. A miss is NO-GO, never re-scored.

## Convergence state

NO-GO at pilot (§14 binding — both bars missed, never re-scored). Guardrails
all PASS. scale-onramp stays converging (NOT converged): the retention
mechanism is proven working (proof 49/49 + live-fire traces), but the
corpus formed too few veterans to measure it (2/16 configs), and both
armed blooded vids died as mantle-holders — the chair ate the retention
gains. Per kill discipline, the lever is NOT killed: the miss is
substrate-thin formation + chair acceleration, not a broken mechanism.

## Proof

scripts/test-vetretention.js — **49 PASS, 0 FAIL** (final code, re-run
post-edit):
- E0 shape (4/4): exports, VR_WINDOW=14, id tags.
- E1 env-gate (3/3): vrOn reads VETRETENTION exactly.
- E2 DET (2/2): VETRETENTION-off armedFor trajectories byte-identical to
  substrateFor (seeds 68601/lead, 68602/belong × 60d).
- E3 synthetic RED→GREEN (28/28): blooded classification (w4 kill 3d ago
  found; stale/w3-only/scholar/dead excluded); hurt blooded → shelter
  verb + shield + trace + beats once each; healthy blooded → shield only;
  triage heal (60→85 HP via medic) and sitout (no medic); gate-off pure
  delegation; window-lapse release; chair transition (shield cleared,
  shelter released, 'chair'/'chair-release' traced); muster-active
  no-new-shelter + deferred release; expedition escort (same tx/ty,
  escortFor, 🎒 beat), escort-none, gate-off no-wrap.
- E4: 180d VETRETENTION=1 run completes + D2 deterministic re-run
  (digest match).
- E5: real Game — injected wave-4 kill for a real roster vid → shield
  set + traced on the live engine.

## Results

Corpus: 32/32 configs (seeds 68601–68608 × {leadfeast, belongfeast} ×
{control, armed}), 180d death-aware, pinned substrate
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
KILLDISC=1 ARMORYDRIVE=1, anchor 5d18ac937cfe. Per-seed JSONs:
evidence/2026-10-23/perseed-vetretention/. Analyzer:
scripts/vetretention-analyze.js (offline join; synthetic smoke-tested).
§15 panel: evidence/2026-10-23/vetretention-panel-primary.md
(decision review_required, all broad-balance metrics no_material_signal —
the instrument confirms no broad-balance footprint; the pre-registered
bars below are the judge).

### PRIMARY (binding): NO-GO

Median days-alive-post-kill over wave-4+ killer vids (autopsy join):
control n=2, median 37d (james_okonkwo s68604: kill d145 → d179, 34d;
owen_smith s68605: kill d65 → d105, 40d) vs armed n=2, median 24d
(james_okonkwo: kill d145 → d176, 31d; owen_smith: kill d65 → d82, 17d).
Bar: armed >= control + 4d → **NO-GO** (delta −13d on n=2/arm).

The n is the finding: only 2/16 configs formed a wave-4+ killer on this
seed band (vs 6/16 on the autopsy's 65511–65518 band) — the retention
lever cannot be measured where veterans never form. This reproduces the
autopsy's "formation > retention" attribution on fresh seeds.

### The chair ate the retention gains (diagnosis, not a re-score)

Both armed blooded vids survived their post-kill hurt window under
retention, then died AS THE SCHOLAR:
- owen_smith (armed s68605): blooded d65 → shield d65 → shelter d71
  (47 HP) + heal d71 → release d76 (87 HP, healed) → mantle d79 →
  contest death d82 (+3d as scholar). Control: raid death d105 as a
  plain fighter.
- james_okonkwo (armed s68604): blooded d145 → shield d145 → sitout
  d145 (9 HP) / d146 (52 HP) → heal d147 → mantle d152 → raid death
  d176 (+24d as scholar). Control: lockjaw d179 as a plain fighter.

The layer stood down correctly at each chair transition (traced
'chair'/'chair-release'; the scholar is never sheltered/shielded). The
layer adds no trust — succession (highest trust, blood +25) handed the
mantle to the retained veterans, and the mantlechain accelerant
(veterans-at-succession die ≤16d; here +3d and +24d) converted both
retention saves into scholar deaths. Retention without succession
protection feeds the chair.

### ENGAGEMENT (binding): NO-GO

2/8 seeds (68604, 68605) had a blooded vid receiving a named retention
action within 14d post-kill; bar ≥6/8 → **NO-GO**. Where blooded vids
formed, the layer fired every time (5/5 trace actions on each engaged
seed: shield, shelter, heal/sitout, release, unshield). The engagement
miss is the formation miss, not a firing miss.

### GUARDRAILS: all PASS

- Median survival paired diff: 0d (bar ≥ −10d) — 16 pairs.
- Starvation: control 13 vs armed 12 (bar armed ≤ control+2).
- New death kinds: none (≥2-event rule).
- §15 panel: review_required, no_material_signal on every observed
  broad-balance metric (national/table/wins/survival identical).

### Wall (both arms — the scale wall stands)

| arm | national | table | wins | wave4 | wave5 | medSurv |
|---|---|---|---|---|---|---|
| control | 4/16 | 11/16 | 0/16 | 11/16 | 0/16 | 156d |
| armed | 4/16 | 11/16 | 0/16 | 11/16 | 0/16 | 151d |

Wave-5 door shut on all 32 configs. National/table/wins unmoved.

## Metric review

1. The PRIMARY conflates fighter-attrition deaths with chair-accelerated
   scholar deaths. On this corpus both armed deaths were mantle-holder
   deaths (+3d, +24d post-succession) — the metric measured the chair,
   not the retention. Next run: bind the primary to non-scholar
   post-kill survival (exclude deaths as mantle-holder), or pair the
   retention arm with the mantlechain named next (new-scholar restraint
   window) so the chair doesn't eat the measurement.
2. The ENGAGEMENT bar (≥6/8) assumes formation. On thin-formation seed
   bands the bar measures the substrate, not the lever. Next run: gate
   the pilot on formation first (adaptive seed scan for blooded-vid
   configs, autopsy method) or pre-register engagement conditional on
   formed configs.
3. n=2/arm is below any measurement dignity — the pilot's real result is
   "substrate too thin to judge," which §14 records as NO-GO, not as
   evidence against the mechanism.

## Sense verdict

**PASS** (scripts/sense-vetretention.js, s68605 armed/belong replay;
trace byte-matches the sweep). The retention beats read as people
protecting people:
- d65: "🛡️ Owen is blooded — the watch marks them shielded: the
  village's fights will spend others first. Owen hears the order and
  goes quiet. 'You want me breathing for the door that matters.'"
- d71: "🚪 Owen is hurting (47 HP) — the watch walks them inside and
  bars the hall door. 'You bled for us once this week. That's enough
  for now.'" followed in-beat by the engine's own triage ("You patch
  them up before they head out. (47 → 72 HP)").
- d76: "📯 Owen is back on their feet — the hall door unbars for them,
  and the village goes back to work around them."
- d79: the mantle passes to Owen Smith — the chair transition the
  layer stands down for, then the contest takes him d82.
Sense note (pre-existing, not the lever): d74 "Owen came back from the
treeline white-faced" while sheltered — ambient haven contact
bypassing shelter (the havencontact class, sim-havendraw-b). Flagged,
not fixed here.

## Village assessment

The villages on this seed band are thin-formation villages: wave-4
kills are rare (2/16 configs), early collapses common (belong d37/d40),
and the ones that blood a killer lose them to the chair, not the
attrition the autopsy measured. The retention layer, where it fired,
did exactly its job — both blooded vids walked out of their hurt
window alive (47 HP → 87 HP sheltered+healed; 9 HP → healed via
sitout+triage). The village that protects its blooded watches them
take the mantle and die in it. The blank this run fills: retention is
necessary but not sufficient — the veterans leg needs the formation
channel (sibling arm) AND the succession restraint (mantlechain named
next) composed with it, or the chair converts every save into a
scholar's death.

