# sim-vetretention-restage — POST-KILL RETENTION RE-STAGE (axis scale-onramp)

Worker tree sim-vetretention, branch sim-vetrestage. Re-stage of the
sim-vetretention pilot per the 1215Z metric review: "the bars, not the
lever, may be wrong; next run re-stages with revised bars." Policy-side,
ZERO src/js changes. New namespace vetrestage-* (scripts/policies/
vetrestage.js, VETRESTAGE=1, default-off); disjoint from vetretention-*
(the landed baseline NO-GO layer) and from the sibling arms
(sim-links-diag, sim-vetstack, loop-B food-economy).

Canon read first: docs/CANON.md + docs/MONSTER-WAVES.md (wave 4 = The
Mirror Draft; the defer5 VETERANS bar = 2 living roster members with
wave-4+ kills in state.waveKillLog, src/js/standing.js). Then the
vetkill-autopsy evidence (evidence/2026-10-23/sim-vetkill-autopsy.md),
the vetformation evidence (evidence/2026-10-23/sim-vetformation.md), the
baseline pilot (evidence/2026-10-23/sim-vetretention.md — the re-staged
run), and the mantlechain DIAG (evidence/2026-10-22/sim-mantlechain.md).
No canon doc covers village protection rites — stated, not invented.

## The surface

sim-defer5gate proved veterans is the universal binder (short on 16/16
configs). sim-vetkill-autopsy attributed it: the killers EXIST then DIE —
8/10 wave-4+ killer vids died 1–8 days AFTER their kills (mean ~6d) in
later attritional combat, 0 in the wave-4 fight itself. The baseline
sim-vetretention pilot built the retention mechanism (14d blooded-vid
protection: shelter when hurt, triage priority, escort pairing — proof
49/49 GREEN) but NO-GO'd on formation-thin seeds (2/16 configs formed)
with the chair eating both armed gains (both blooded vids died as
mantle-holders, +3d/+24d post-succession). Per kill discipline the lever
was NOT killed: the miss was substrate-thin formation + chair
acceleration, not a broken mechanism. The sibling formation arm has
since PROVEN the formation half (sim-vetformation GO: 10 vs 6 distinct
wave-4+ killer vids, all guardrails pass).

## The lever (mechanism UNCHANGED by design)

scripts/policies/vetrestage.js (VETRESTAGE=1, default-off): the same
proven 14d blooded-vid protection — (a) SHELTER when hurt (HP <= 55,
release >= 85) via the engine's own shelter verb; (b) TRIAGE priority
(the engine's own villagerHealCheck, proactively each day); (c) ESCORT
pairing (v.shielded raid back-of-the-line + expedition companion wrap).
The scholar is never sheltered/shielded; the layer stands down the
moment a blooded vid takes the mantle (chair-release traced); it never
touches trust, so it cannot feed the succession rule. New namespace so
the re-stage's proof, trace tags, and evidence are cleanly separable
from the landed vetretention baseline. The mechanism is IDENTICAL on
purpose: the hypothesis under test is "the bars were wrong," and
changing the mechanism simultaneously would confound it.

## What's revised (the bars, not the lever)

(a) SEED BAND: 65511–65518 (the vetkill-autopsy band). 10 distinct
wave-4+ killer vids formed on the EXACT control substrate (armorydrive
stack, {lead,belong}) across 16 configs, 8/10 dying 1–8d post-kill —
the richest measured formation+attrition substrate. The baseline's
68601–68608 band formed on only 2/16 configs: the retention lever
cannot be measured where veterans never form.

(b) PRIMARY: 14d-window survival share among blooded vids (first-kill
index), replacing median days-alive-post-kill. Deaths as mantle-holder
inside the window are CHAIR-CENSORED (excluded from numerator and
denominator — the layer stands down at the mantle by design, E3g-proven;
the chair is the mantlechain DIAG's separate channel), counted in a
chair diagnostic. Incomplete windows (firstKill+14 > run end) excluded.
The baseline's primary conflated fighter-attrition deaths with
chair-accelerated scholar deaths — the metric measured the chair, not
the retention. (Both baseline armed vids survived their 14d windows;
they died +17d/+31d post-kill as scholars.)

(c) MANTLE-RESTRAINT: considered, DECLINED — design call below.

## Design call — the mantle-restraint (Steve 2026-10-07: make the call, document it)

The brief proposed considering blooded-vid mantle-ineligibility during
the 14d window (mantlechain DIAG: 8/8 in-scope veteran wave-4 deaths as
mantle-holder). CALL: **not built in this re-stage.**

1. No honest policy-side seam exists. Succession candidacy is
   trust-sorted game-side (ledger.js playerDeath: candidates =
   this.npcIds() sorted by v.trust descending). The policy-reachable
   interventions are: touching trust (FORBIDDEN — "the retention layer
   must never touch trust, it cannot feed the succession rule"),
   filtering npcIds() (global blast radius — npcIds feeds every NPC
   system, not just succession), or wrapping playerDeath (an invasive
   death-handling override smuggled through a policy — dishonest
   layering; a bug there corrupts death handling).
2. The restraint changes WHO becomes scholar — a whole-trajectory
   causal footprint. Composed with retention, an armed win could not be
   attributed to the retention actions vs the restraint.
3. The revised primary already de-confounds the chair (see (b) above):
   it measures the layer's actual claim — protect blooded fighters
   through the attrition window.
4. The restraint stays a NAMED NEXT for a game-side arm: it needs a
   candidacy hook in ledger.js playerDeath (skip in-window blooded vids
   as succession candidates, voiced as the village holding its blooded
   back from the office while they recover — people-plausible), and it
   changes feel → [needs-eyes] when built. It composes with the
   mantlechain DIAG's own named next (new-scholar restraint window:
   a fresh successor does not lead wave-4 parties).

## PRE-REGISTRATION (§14 binding — written BEFORE any sims)

- BINDING QUESTION: on a veteran-forming seed band, does the 14d
  post-kill retention layer raise blooded-vid 14d-window survival?
- PRIMARY: blooded-vid 14d-window survival share (analyzer:
  scripts/vetrestage-analyze.js — first-kill index, chair-censored,
  incomplete-window excluded): armed − control ≥ +25pp AND ≥6
  evaluable blooded vids per arm (else NO-GO thin). A miss is NO-GO,
  never re-scored.
- ENGAGEMENT: ≥6/8 seeds have ≥1 blooded vid receiving a named
  retention action (shelter/heal/escort/sitout/shield) within 14d
  post-kill (vsTrace proves it fired).
- GUARDRAILS: median survival paired diff ≥ −10d; starvation ≤
  control+2; no new death kinds (≥2-event rule); report wall
  (national/table/wins, wave4/5, median survival) both arms.
- SEEDS: 65511–65518 × {lead, belong} × {control, armed} = 32
  configs, 180d death-aware, paired identical seeds.
- SUBSTRATE (pinned BOTH arms): FEASTSCALE_R13=1 TRIBFLOOR=1
  WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 —
  the autopsy corpus, comparable. control = VS.substrateFor
  (armorydrive stack, VETRESTAGE unset); armed = VS.armedFor
  (same stack + VETRESTAGE=1).
- HORIZON: 180d death-aware (kills happen late; the 14d window needs
  room). Dead villages stop simulating (+10d tail max). Never a fixed
  200d.
- PILOT: the 32-config sweep IS the pilot (8 seeds). Confirm (12–16
  fresh seeds) ONLY if pilot GO. A miss is NO-GO, never re-scored.
- §15: before/after through scripts/balance-panel.js
  (scripts/build-vetrestage-panels.js) — the panel is the instrument,
  the bars above are the judge.
- METRIC REVIEW section mandatory (below).

## Convergence state

NO-GO at pilot (§14 binding — primary missed on the pre-registered thin
rule, never re-scored). Guardrails all PASS. scale-onramp stays
converging (NOT converged): the retention mechanism is proven working
(proof 49/49 + live-fire traces), but the re-stage's central finding is
that the retention layer's addressable population is scope-starved — the
chair dominates blooded-vid mortality, and the layer by design never
touches the scholar. Per kill discipline, the lever is NOT killed: the
mechanism works where it fires (3/3 shielded blooded fighters survived
their windows on both arms); the miss is scope, not a broken mechanism.

## Proof

scripts/test-vetrestage.js — **49 PASS, 0 FAIL** (new namespace,
mechanism identical to the proven vetretention layer by design):
- E0 shape (4/4): exports, VS_WINDOW=14, id tags (armed ids carry
  `vetrestage`; control tags clean).
- E1 env-gate (3/3): vsOn reads VETRESTAGE exactly.
- E2 DET (2/2): VETRESTAGE unset → armedFor trajectories byte-identical
  to substrateFor (seeds 65511/lead, 65512/belong × 60d).
- E3 synthetic RED→GREEN (28/28): blooded classification; hurt blooded
  → shelter verb + shield + trace + beats once each; healthy blooded →
  shield only; triage heal and sitout; gate-off pure delegation;
  window-lapse release; chair transition (shield cleared, shelter
  released, 'chair'/'chair-release' traced — retention never funnels
  anyone toward the chair); muster-active no-new-shelter; expedition
  escort; gate-off no-wrap.
- E4: 180d VETRESTAGE=1 run completes + D2 deterministic re-run
  (digest match).
- E5: real Game — injected wave-4 kill for a real roster vid → shield
  set + traced on the live engine.
- Analyzer join verified on synthetic fixtures (survivor / window-death
  / chair-censored via player flag / incomplete-window / scholar-kill
  exclusion all classify correctly; thin rule fires). One analyzer bug
  caught and fixed during analysis (incomplete-window was checked before
  deaths — a vid who died INSIDE the window is an observed outcome even
  when the run ends before windowClose; incomplete applies only to vids
  alive at run end).

## Sweep

32/32 configs complete (seeds 65511–65518 × {lead,belong} × {control,
armed}, 180d death-aware, pinned substrate FEASTSCALE_R13=1 TRIBFLOOR=1
WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1; anchor
e9bce3b685e9 on all 32 — the re-stage branch tip, no base drift).
Corpus: evidence/2026-10-23/perseed-vetrestage/. Analyzer:
scripts/vetrestage-analyze.js (offline join; synthetic-fixture tested).
§15 panel: evidence/2026-10-23/vetrestage-panel-primary.md
(decision review_required — the instrument confirms no broad-balance
footprint; the pre-registered bars below are the judge).

## Results

### PRIMARY (binding): NO-GO (thin)

14d-window survival share among blooded vids (first-kill index,
chair-censored, incomplete-window excluded):
- control: 3/3 survivors (100%) — boris_kowalski (s65514), ruby_callaghan
  (s65517), gen_qmv4yhy (s65517)
- armed: 2/2 survivors (100%) — boris_kowalski (s65514), ruby_callaghan
  (s65517)
- Bar: armed − control ≥ +25pp AND ≥6 evaluable/arm → **NO-GO (thin)**:
  3 and 2 evaluable (< 6/arm). A miss is NO-GO, never re-scored (§14).

### The chair dominates (the re-stage's central finding)

Chair diagnostic (deaths inside the 14d window as mantle-holder,
player-flagged, excluded from the primary per the pre-registration):
- control: 7 chair-censored, 0 window-deaths as fighter,
  1 post-window scholar death
- armed: 6 chair-censored, 0 window-deaths as fighter,
  1 post-window scholar death

**Zero** blooded vids died as fighters inside their windows on either
arm. Every in-window death was as the mantle-holder. The autopsy's
"attritional combat" deaths (8/10 killers, 1–8d post-kill) were, on the
player-flag join, CHAIR deaths — the blooded vids had taken (or were
about to take) the mantle.

The layer's addressable population is scope-starved: on the ARMED arm,
the retention trace shows the layer shielded only 3 vids across all 32
configs (boris_kowalski s65514, tashi_sherpa s65515, ruby_callaghan
s65517 — shield→unshield, the chair transition traced). The other 7
control blooded vids were never in the layer's blooded set — they were
the scholar (or became scholar before the next daily) at kill time.
All 3 shielded fighters survived their windows (on both arms — the
control twins also survived, so this is not a lever effect, it's the
scope statement).

In other words: the retention layer works where it fires, but on the
richest formation band the blooded population is 70% scholars. The
layer by design never touches the scholar — so it cannot address the
dominant mortality channel. The 1215Z "bars, not the lever" hypothesis
is half-right: the bars were wrong (the baseline's days-alive metric
measured the chair), but the lever's SCOPE is also wrong for the
measured population. The binding lever is the one declined in the
design call: succession restraint for blooded vids (game-side,
mantlechain DIAG's lane).

### ENGAGEMENT (binding): NO-GO

3/8 seeds (65514, 65515, 65517) had a blooded vid receiving a named
retention action within 14d post-kill; bar ≥6/8 → **NO-GO**. The
engagement miss is the scope miss: the layer fired on every blooded
FIGHTER it found (3/3 shielded), but blooded fighters formed on only
3/8 seeds — the rest of the blood was on scholars.

### GUARDRAILS: all PASS

- Median survival paired diff: 0d (bar ≥ −10d) — 16 pairs.
- Starvation: control 23 vs armed 25 (bar armed ≤ control+2).
- New death kinds: none (≥2-event rule).
- §15 panel: review_required, no broad-balance footprint.

### Wall (both arms — the scale wall stands)

| arm | national | table | wins | wave4 | wave5 | medSurv |
|---|---|---|---|---|---|---|
| control | 6/16 | 12/16 | 0/16 | 12/16 | 2/16 | 121d |
| armed | 6/16 | 12/16 | 0/16 | 12/16 | 1/16 | 121d |

Wave-5 door opened on 3/32 configs (2 control, 1 armed); wins 0/32
(structural on the SEATDRIVE=0 substrate). National/table unmoved.

## Metric review (§14 — the bars bound the run; honest caveats)

1. The PRIMARY bar (+25pp, ≥6 evaluable/arm) MISSED as NO-GO (thin):
   3 vs 2 evaluable, delta 0.0pp. The thin rule was pre-registered for
   exactly this outcome — it is not re-scored. The pilot's real result
   is "the retention layer's addressable population is scope-starved on
   the richest formation band," which §14 records as NO-GO, not as
   evidence against the mechanism (proof 49/49 + 3/3 shielded fighters
   surviving where the layer fired).
2. The CHAIR-CENSOR is doing load-bearing work the pre-registration
   didn't fully anticipate: 7/10 control and 6/8 armed blooded vids died
   as mantle-holders inside their windows (vs 0 window-deaths as
   fighters). The autopsy's "attritional combat" deaths are, on the
   player-flag join, chair deaths. The censor is honest (the layer
   stands down at the mantle by design), but it reveals the metric's
   blind spot: the analyzer's "blooded vid" includes scholars the layer
   never protects. A future arm should pre-register the addressable
   population explicitly (non-scholar at kill time) rather than
   discovering it in the chair diagnostic.
3. Analyzer bug caught mid-analysis (fixed, re-run, documented in
   Proof): incomplete-window was checked before deaths, misclassifying
   two in-window chair deaths as incomplete. The fix is mechanical
   (observed deaths always classify); the verdict is unchanged
   (still thin).
4. The ENGAGEMENT bar (≥6/8) assumed blooded fighters form. On this
   band the blood forms on scholars — the bar measured the substrate's
   succession dynamics, not the lever's firing discipline (the layer
   fired on 3/3 blooded fighters it found). Next run: pre-register
   engagement conditional on the addressable set.
5. n=33 in the telemetry glob (32 per-seed + vetrestage-analysis.json
   in the perseed dir — the baseline's pattern). Harmless; the LOUD
   line is the regime artifact either way.
6. §15 panel: review_required, no broad-balance footprint — the
   instrument confirms the layer is balance-neutral at the village
   level; the pre-registered bars (not the panel) are the judge, and
   they say NO-GO (thin).

## Sense verdict (SENSE-TESTING LAW) — PASS with a sharp edge

scripts/sense-vetrestage.js replayed s65517-belong (VETRESTAGE=1) with
live narration; transcripts at
evidence/2026-10-23/sense-vetrestage-65517-belong.txt (180d) and
evidence/2026-10-23/sense-vetrestage-65517-belong-d100.txt (100d,
retention window in-frame). The trace byte-matches the sweep
(d80 shield, d82 escort, d93 escort-none, d95 unshield window-lapsed).

The retention beats read as people protecting people — PASS:
- d80: "🛡️ Ruby is blooded — the watch marks them shielded: the
  village's fights will spend others first. Ruby hears the order and
  goes quiet. 'You want me breathing for the door that matters.'"
  (Ruby just killed The Influencer on camera; the village's response
  is immediate, named, and costly-sounding — "the village's fights
  will spend others first.")
- d82: "🎒 Tunu shoulders a pack to walk with Ruby. 'You're not going
  out there alone — not this week.'" (A named person, Tunu, walks
  into real stakes. The engine's own expedition lines carry the
  departure; the beat names the pairing.)

The sharp edge — the story the numbers told, voiced:
- d95: the window lapses (traced, unbeaten — the layer stands down
  quietly).
- d96: "The Codex doesn't pause for grief. Ruby blinks — and it's
  already there, overlaying everything, syncing. No pen. No paper.
  The mantle just... transfers." / "The Codex turns a page:
  Austin Beck, 96 days. The mantle passes to Ruby Callaghan."
- d97: Ruby dies as the scholar (analyzer: post-window scholar death).

The village shields Ruby for fourteen days, then hands her the Codex,
and she dies the next day. The retention arc is coherent and the
succession beat is the same canned two-liner the mantlechain DIAG
flagged across 157 successions — the game never marks the irony that
the blooded fighter it just protected is now the scholar walking into
the chair's hazard. That blank is filed (mantlechain DIAG's finding);
this run's fiction doesn't make it worse, but it doesn't mark it
either. The beats themselves are meaningful, not mechanical — no
robotic repeats, no false claims (the escort beat names Tunu, who
actually walked).

VERDICT: PASS. The layer's voice is people; the chair's voice is the
known canned-beat blank.

## Village assessment

The villages on the autopsy band (65511–65518) are villages where the
blood flows and the chair collects. Wave-4 kills happen (10 distinct
blooded vids on control across 16 configs — the band reproduced the
autopsy's formation almost exactly, same vids, same kill days), but
the village's response to blood is succession, not protection: 7 of
10 blooded vids were scholars within 14 days of their first kill, and
all 7 died as mantle-holders. The three who stayed fighters (boris,
ruby for a while, gen_qmv4yhy) survived their windows on both arms —
the retention layer's shield touched them, and they lived.

The village that protects its blooded watches the protection expire
and then promotes them. Ruby's arc (blooded d80, shielded d80,
escorted d82, mantle d96, dead d97) is the run in miniature: the
mechanism works, the succession undoes it. The blank this run fills:
retention is scope-starved — the veterans leg doesn't need better
post-kill protection, it needs the blooded kept out of the chair
(the declined mantle-restraint, now measured as the binding lever)
or a survivable chair (the mantlechain DIAG's new-scholar restraint).

## Named nexts

1. **Mantle-restraint for blooded vids (game-side).** The declined
   design call is now the measured binding lever: 13/18 blooded vids
   across both arms died as mantle-holders within 14d of their first
   kill. Needs a candidacy hook in ledger.js playerDeath (skip
   in-window blooded vids as succession candidates), voiced as the
   village holding its blooded back from the office while they
   recover. Feel change → [needs-eyes] when built. Composes with the
   mantlechain named next (new-scholar restraint window).
2. **Addressable-population pre-registration.** The next retention arm
   should pre-register on non-scholar-at-kill-time blooded vids
   explicitly, instead of discovering the scope in the chair
   diagnostic. The instrument exists (vsTrace = the layer's own
   blooded set).
3. **The scholar's haven defense** (already filed — sim-havencontact
   steve-call): 48/53 havencontact fights happen during an active
   muster that excludes the scholar by construction. The chair's
   hazard is the scholar's exposure; the muster is the village's
   shield that doesn't cover the bearer.
4. **Confirm only if a game-side restraint lands first.** A confirm
   of the retention layer on fresh seeds is not the next step — the
   pilot proved the scope, not the mechanism. The next run belongs to
   the restraint.

## Convergence note

- Axis scale-onramp: this re-stage closes the 1215Z metric review's
  named next ("the bars, not the lever, may be wrong; next run
  re-stages with revised bars"). The re-stage measured: the bars were
  half the story — the revised primary de-confounded the chair
  (both baseline armed vids would have been window-survivors), but
  the lever's addressable population is 30% of the blooded. The
  veterans leg now has: formation PROVEN (vetformation GO 10 vs 6),
  retention PROVEN-but-scope-starved (this run), and the chair as the
  measured binding constraint (13/18 in-window blooded deaths as
  mantle-holder). The defer5 coincidence trap's veterans half needs
  the succession restraint before retention can matter.
- The scale wall stands (wins 0/32 both arms — structural on this
  substrate; national 6/16 both; the door moved 2/16 vs 1/16 on
  noise).

## Instruments committed (namespace vetrestage)

- scripts/policies/vetrestage.js — the layer (VETRESTAGE=1,
  default-off, zero src/js; mechanism identical to the proven
  vetretention layer by re-stage design)
- scripts/test-vetrestage.js — proof (49/49 GREEN: E0 shape, E1
  env-gate, E2 DET, E3 synthetic RED→GREEN, E4 180d + D2, E5 real
  Game)
- scripts/det-vetrestage.js — determinism probe
- scripts/vetrestage-sweep.js — the 32-config census (pinned
  substrate env guard, direct waveKillLog + windowstay death capture
  + vsTrace)
- scripts/vetrestage-analyze.js — the judge (14d-window survival
  join: first-kill index, chair-censor via player flag,
  incomplete-window exclusion, thin rule; engagement; guardrails;
  wall; chair diagnostic)
- scripts/sense-vetrestage.js — narration replay
- scripts/build-vetrestage-panels.js — §15 balanced-panel compare
- evidence/2026-10-23/perseed-vetrestage/ — the corpus (32 files)
- evidence/2026-10-23/vetrestage-analysis.json — the join output
- evidence/2026-10-23/vetrestage-panel-primary.{md,json,json.gz}
  — §15 panel (review_required)
- evidence/2026-10-23/sense-vetrestage-65517-belong{,-d100}.txt
  — sense transcripts
- evidence/2026-10-23/sim-vetretention-restage.md — this file

Anchor: e9bce3b685e9 (re-stage branch tip). Zero src/js changes.
Merged locally, pending ship.
