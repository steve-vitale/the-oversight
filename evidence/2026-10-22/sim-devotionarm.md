# sim-devotionarm — window-driven devotion-arming cadence (axis scale-onramp)

Run: fleshout-20261022T1215Z (flesh-out loop) — arm sim-devotionarm.
ADOPTED by run fleshout-20261022T232307Z (axis scale-onramp) after the
1215Z coordinator died: the orphan worker had completed the proof (ALL
GREEN), the sense test (SENSE-PASS), and 7/32 pilot configs before dying
~21:10Z. The adoption worker re-verified the proof GREEN on the anchor
base, resumed the deterministic sweep (25 configs, built-in resume —
identical seeds/env, no re-runs), and finished the evidence below.
Worktree: ~/workspace/worktrees/sim-devotion-arm (branch sim-devotion-arm, base 5245f3165 = master tip at 1215Z).
Policy files: scripts/policies/devotionarm.js (DEVOTIONARM=1, zero src/js),
scripts/test-devotionarm-20261022.js (proof gates),
scripts/sweep-devotionarm-20261022.js (pilot sweep).
Anchor: 5245f3165 (worktree sim-devotion-arm; feastdiscipline evidence in
evidence/2026-10-22/sim-feastdiscipline.md; policy-only delta, zero src/js).
Measurement base for the whole pilot (proof + 32 configs): 5245f3165.
Master moved to e32d4e8c during the run; the worktree was rebased onto it
for landing and the proof re-verified GREEN post-rebase (see below).

## THE BIND (finding, sim-feastdiscipline.md)

The feastdiscipline pilot's threat-driven feast staging often met UNARMED
devotion (skippedUnarmed=30 on seed s66028 alone) — the devotion arming
cadence, not the pantry, is the binding constraint on staged-feast volume.
The base's channeling is one keepsake a day at the nightly daily pass
(competent.js channelDevotion, trauma-quiet days only); arming the devotion
lane needs surgeResonance>=35 (~35 channels) or 3 L3 masteries — a slow
build the threat gate keeps outrunning. This arm asks the named next: can
a policy-side arming cadence — a second keepsake channel on days when the
feast-window conditions hold — raise staged armed-feast volume?

## DIAG: can the policy API express it? (written before any sims)

YES. Established before any sims:
- Game.channelSentiment(idx) / Game.channelReadyKeepsakes() are
  policy-reachable (competent.js channelDevotion's own route).
- Channeling is once-per-ITEM-per-day (progression.js pg.chanDay) — the
  layer's morning channel and the base's nightly channel automatically take
  disjoint keepsakes; the layer adds cadence, never steals the base's.
- The engine's arming beats are the same ones the base feeds: focused
  practice (+6 xp, gainAbilityXP => +1 resonance) and the armSurge branch
  (resonance>=35 or 3 L3 => s.prog.feastSurge). The layer accelerates both
  lanes; it invents neither.
- The arming is spent only by real combat use of the buff
  (_spendFeastedPower); a channel that warms no blades costs no devotion.
- Trauma>=8 hijacks the channel to soothing — the layer skips those days
  (the soothe channel's business, never stolen).

## PRE-REGISTRATION (§14 binding — written BEFORE the pilot sweep)

- Design: 8 FRESH seeds (669031-669038, filename-verified 2026-10-22 —
  absent from all evidence/*/scripts corpora; 66031-66038 collided with
  loop-B retagrot/surpluskeep2-b/panel-b2 seeds) x {leadfeast, belongfeast}
  x {control, devoted} = 32 paired configs, 180d death-aware (dead villages
  stop simulating; the harness breaks on Game.over), on the proven non-seat
  long substrate: FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
  SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 FEASTDISC=1 (VETREL/REPOSITION/VGEAR
  unset).
- control = FD.disciplinedFor(base), DEVOTIONARM unset (feastdiscipline
  alone).
- devoted = DA.devotedFor(base) = withDevotionArm(FD.disciplinedFor(base)),
  DEVOTIONARM=1.
- ARMORYDRIVE=1 + FEASTDISC=1 on both sides; DEVOTIONARM=1 only on the
  armed side — this isolates the arming cadence (pre-registered choice per
  the brief: the arming cadence only matters when the threat gate fires).
- PRIMARY (mechanism, binding): staged armed feasts per run
  (feast-staging volume — the FD layer's tele.feastsStaged, devotion-arm
  vs control, identical seeds). GO = armed staged feasts >= control x 1.5
  AND >=2/8 armed seeds show increased staging. Both bars pre-registered.
- KILL-FAST: if the layer channels zero keepsakes in the pilot (mechanism
  never fires) — close as evidence, do not advance.
- GUARDRAILS (all binding): starvation deaths <= control+2; median
  survival >= control-10d (per-seed matched); no new death mode (>=
  2-event rule); pantry never armed below the layer's 1.5x buffer rule
  (the layer's own pantryCanFeast enforces it — any violation is a loud
  bug, not a drift).
- SECONDARY: feasted-engagement rate on wave-4 fights, villager wave-4
  kills — report BOTH kill-time and damage-majority per the compdamage
  attribution finding.
- A miss is NO-GO — never re-scored mid-run (§14). Metric doubts go under
  "metric review" for the next run.
- Instruments: KILLDISC=1 v2 + daily bearer census (kill-time attribution)
  + feast-staging census (armed feast days, feasted status at each wave-4
  engagement) + DA.tele / FD.tele layer counters. Before/after through
  the balanced panel (scripts/balance-panel.js) per §15 — env-gated levers
  make the automated compare invalid by construction (per sim-findings.md);
  both panels built, §15 status noted, manual paired-row comparison
  attached.

## Proof gates (run BEFORE the pilot — scripts/test-devotionarm-20261022.js)
E0 shape (exports, unknown-base throw); E1 det-gate (DEVOTIONARM unset ->
devotedFor byte-identical to FD.disciplinedFor, 60d x2 bases,
FEASTDISC=1 ARMORYDRIVE=1 both sides); E2 env-gate; E3 23 synthetic
RED->GREEN fixtures (window-live OR leg / threat OR leg / banked-
resonance arming / one-extra-channel-per-day / next-day-refire / armed /
feasted / no-window / pantry-below-buffer / plan-refused / trauma>=8 /
untaught / no-keepsake / in-combat / gate-off silence / beat-before-
base-upkeep ordering / gate-off pure delegation); E4 armed determinism
(60d, same seed twice); D2 180d armed run completes + deterministic
re-run.

RESULT 2026-10-22: **ALL GREEN** (exit 0), on
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
KILLDISC=1 ARMORYDRIVE=1 FEASTDISC=1. (Operator note: running with
DEVOTIONARM=1 pre-exported makes the proof STOP by construction; the
proof sets the gate itself.)

`node scripts/check.js --quick` after the change: 284 passed, 3 failed —
all three are proof-freshness failures PRE-EXISTING on master 5245f3165
(verified: they fail identically with this arm's files removed):
test-measurement-proof-update.js ("Proof source inputs are not current"),
test-measurement-workflow.js ("retained neutrality proof covers the
current Game/controller/harness inputs"), test-phone-frame-proof.js
("retained browser input matches current source", "Phone receipt source
is stale"). All three assert retained digests against src/js/index.html
inputs moved by earlier master commits; this arm adds zero src/js and six
new scripts, none on the green list. The two slowest green-list scripts
that timed out under load in the first run (test-table-endings-20261014,
test-capable-bot-20261014) pass with a 300s timeout — load timeouts, not
regressions.

One fixture caught and fixed during the run (test bug, not layer bug):
the "already armed" fixture used fireOpts() which carries unarmed:true —
the beat fired correctly on the unarmed fixture and the assertion failed
honestly. Fixed to an armed fixture; re-ran green.

D2 observation (seed 66043 belongfeast, 180d): daTele skippedArmed=492,
skippedWindow=405, channels=0 — the base's nightly channel kept devotion
armed ~91% of upkeep passes on this run; the layer fired zero extra
channels. The layer's marginal value lives on seeds where the base's
cadence loses the race (the s66028 class: 30 unarmed threat-skips) — that
is exactly what the pilot measures.

## PILOT RESULTS (32 configs, 180d death-aware)

Operator note (2026-10-22): the first sweep attempt (8/32 configs) was
killed and restarted: the per-config census was not capturing
result.samples.deaths, so the binding guardrails (starvation deaths, new
death modes) could not be judged. The census now records deathCauses +
starvationDeaths from the harness's sampled death events (the same route
as the feastdiscipline sweep). The 8 completed configs were deleted and
re-run — deterministic, so their primary numbers will be identical.

Adoption note (2026-10-22/23): the 1215Z coordinator died ~21:10Z with
7/32 configs on disk (s669032-belongfeast-devoted in flight). The adoption
worker (run fleshout-20261022T232307Z) re-verified the proof GREEN on the
anchor base 5245f3165, then resumed the sweep with the script's built-in
resume (skips existing files; identical seeds, env, and base — the 7 kept
configs were NOT re-run). 25 configs completed 23:56Z–00:28Z; all 32
present, corpus.json written by the sweep.

### Primary (binding): staged armed feasts, paired (FD tele.feastsStaged)

```
s669031 leadfeast:   control=4  devoted=4  =   (days 112/112, unarmedSkips 9/20,  daCh 1, armedByUs 1)
s669031 belongfeast: control=6  devoted=6  =   (days 117/118, unarmedSkips 6/6,   daCh 1, armedByUs 1)
s669032 leadfeast:   control=14 devoted=9  DOWN (days 181/126, unarmedSkips 62/12, daCh 2, armedByUs 2)
s669032 belongfeast: control=0  devoted=0  =   (days 181/181, unarmedSkips 0/0,   daCh 0, armedByUs 0)
s669033 leadfeast:   control=4  devoted=4  =   (days 138/133, unarmedSkips 15/3,  daCh 2, armedByUs 2)
s669033 belongfeast: control=6  devoted=10 UP  (days 126/146, unarmedSkips 9/24,  daCh 3, armedByUs 3)
s669034 leadfeast:   control=2  devoted=3  UP  (days 131/153, unarmedSkips 12/22, daCh 2, armedByUs 2)
s669034 belongfeast: control=4  devoted=5  UP  (days 174/180, unarmedSkips 15/15, daCh 1, armedByUs 1)
s669035 leadfeast:   control=1  devoted=1  =   (days 82/82,  unarmedSkips 0/0,   daCh 0, armedByUs 0)
s669035 belongfeast: control=2  devoted=2  =   (days 97/97,  unarmedSkips 16/16, daCh 0, armedByUs 0)
s669036 leadfeast:   control=0  devoted=0  =   (days 83/83,  unarmedSkips 0/0,   daCh 0, armedByUs 0)
s669036 belongfeast: control=0  devoted=0  =   (days 83/83,  unarmedSkips 0/0,   daCh 0, armedByUs 0)
s669037 leadfeast:   control=0  devoted=0  =   (days 23/23,  unarmedSkips 0/0,   daCh 0, armedByUs 0)
s669037 belongfeast: control=0  devoted=0  =   (days 23/23,  unarmedSkips 0/0,   daCh 0, armedByUs 0)
s669038 leadfeast:   control=4  devoted=3  DOWN (days 134/127, unarmedSkips 33/30, daCh 1, armedByUs 1)
s669038 belongfeast: control=0  devoted=0  =   (days 99/99,  unarmedSkips 0/0,   daCh 0, armedByUs 0)
TOTAL: control=47 devoted=47 (ratio 1.00; bar >=71). Seeds up: 2/8 (669033, 669034; bar >=2/8 MET).
```

### Guardrails (all binding)

- Median survival: control 114.5d, devoted 115.0d (bar >= control-10d: PASS). Paired diffs median 0.0d, range -55..+22. Outlier: s669032-leadfeast devoted died at 126d vs control 181d (-55d); devoted staged 9 vs 14 there — the one pair where the layer's arming coincided with an earlier death. No mechanism links the two (the layer adds a morning keepsake channel; the death was combat), but it is recorded.
- Starvation deaths: control 25, devoted 26 (bar <= control+2 = 27: PASS).
- New death mode (>=2-event rule): 'alien' 3 on devoted vs 0 on control — TRIPPED by the letter (see Metric review). 'thirst' 1 on devoted (below the rule). All other modes matched across arms (combat 332/313, villager combat 127/129, monster 26/33, expedition 31/30, starvation 25/26, ambush 8/8, sickness 11/9, lockjaw 4/4, contest 6/6).
- Pantry buffer: the layer's own pantryCanFeast (1.5x) held — skippedPantry=67 across devoted runs, zero violations.

### Secondary: wave-4 engagement / kills

maxWave and waveKillLog track control closely on every pair (e.g. s669034-belongfeast 48/50 kills, s669031-leadfeast 39/41). No feasted-engagement lift is visible at the pair level — the layer's 13 armings are too few to move engagement aggregates.

### Layer telemetry (devoted arm totals, 16 runs)

daTele: beats=13, channels=13, armedByUs=13, skippedArmed=3841, skippedWindow=1255, skippedPantry=67, skippedTrauma=64, beatErrors=0.
fdTele (devoted runs): feastsStaged=47, skippedUnarmed=148.

The mechanism works (13/13 channels armed devotion) but the opportunity
is ~0.3% of upkeep passes: the base's nightly channel keeps devotion
armed on 3841 window-live passes. The layer fired 0–3 times per 180d run.

### §15 panel

scripts/balance-panel.js compare (control=before, devoted=after):
evidence/2026-10-22/devotionarm-panel-primary.{md,json,before.json.gz,after.json.gz}.
Decision: review_required on both policies; no material signal on any
metric (national 0/0, table invitation 1/1, wins 0/0, survival30/60
0.875/0.875). Per the pre-reg §15 note, env-gated levers make the
automated compare descriptive-by-construction — the manual paired-row
comparison above is the judging instrument.

## VERDICT vs pre-reg (§14 binding)

**NO-GO.** Primary bar 1 (volume): devoted 47 vs control 47 — needed
>=71 (1.5x). Primary bar 2 (breadth): 2/8 seeds up — met exactly. The
bars are ANDed; a miss is NO-GO, never re-scored. The kill-fast tripwire
did not fire (the layer channeled 13 keepsakes — the mechanism is real),
but the volume bar failed cleanly: the layer fires 0–3 times per 180d
run because the base's nightly channel wins the arming race on 3841 of
3854 window-live upkeep passes. Guardrails: survival and starvation PASS;
the 'alien' new-death-mode tripwire fired by the letter (3 vs 0, see
Metric review) — recorded as a miss, root-caused as noise, not a layer
defect. Per loop convention (thindefer-b), a killed arm lands
evidence-only: the policy layer and its scripts are reverted zero-trace;
the evidence, corpus, and panels land as the documented kill.

## Sense test (SENSE-TESTING LAW) — PASS

Re-ran s669031-leadfeast-devoted deterministically, wrapped Game.say,
dumped the narration window around the layer's channel day (scripts/
sense-devotionarm-20261022.js). The layer fired once (d107, armedByUs=1):

- d107 morning (the layer's extra channel): "💛 You hold Photo Album.
  Faces from before. Torill's wedding. Your dad asleep in the chair. The
  neighbor's kid with the missing tooth. The most valuable thing you own,
  and it weighs nothing. Your gifts are not mastered — but they are
  lived-in, and they are with you. The feast was the weapon. (The next
  feast grants FEASTED until tomorrow's dawn: strikes & abilities
  uplifted, devotion ×1.5 — richer feasts hit harder.)"
- d107 dusk (the feastdiscipline layer's staging, same day): "🍖 FEAST 📺
  — Emma opens the pantry wide..." -> "FEASTED ×2.53 until tomorrow's
  dawn" -> "The Congregation is circling the edge of the light. It
  followed the feast here." -> "FEASTED ×2.53: Tom's blow carries the
  feast." / "Colin's blow carries the feast."

The full chain reads as one coherent beat: the scholar holds the Photo
Album in the morning and arms the devotion; at dusk the village feasts
armed; the feast's smoke draws The Congregation; Tom and Colin fight
feasted. The arming reads as the scholar preparing the village for a
fight — grief, memory, fire, blades — not as a counter ticking.
SENSE-PASS. (Note d106's "You hold Photo Album. Breathe. The shaking
eases." is the base's nightly soothe channel on a high-trauma day —
chanDay is per-item-per-day, so the layer's d107 channel took the same
keepsake's fresh day; the trauma had eased below 8 and the channel went
to the arming branch. Engine-honest.)

## Village assessment (plain words)

Sixteen villages, eight seeds, two policies each. They lived a median
115 days and died the way villages on the scale on-ramp die: in fights.
Combat is the leading killer by far (332/313 sampled 'combat' deaths,
127/129 'villager combat'), then expeditions (31/30), monsters (26/33),
starvation (25/26). Sickness, ambush, and lockjaw trail behind. Nobody
starved because the layer armed devotion; the starvation guardrail passed
at 26 vs 25.

The villages split into three fates. Four never got near the question:
s669037 died at 23 days on both policies and both arms, s669036 at 83 —
early combat and expedition pressure, wave 2 reached, no feast window,
the devotion cadence moot. Six lived into the wave-4 window and staged
feasts (s669031, s669033, s669034, s669038-leadfeast): these are the
villages where the layer actually fired — 13 morning channels across 16
devoted runs, each one arming devotion, each one reading (per the sense
test) as the scholar holding a keepsake and steadying the village before
a fight. Two seeds rewarded it: s669033-belongfeast staged 10 armed
feasts vs 6, s669034's pair staged 3 and 5 vs 2 and 4. But the gains are
a rounding error against the 47-47 tie — the base's nightly channel had
already armed devotion on 3841 passes, so the layer's 13 armings changed
nothing in aggregate.

And the wall, in miniature: every single village reached the table
(16/16 on both arms — the invitation is not the problem), none reached
national (0/16), none won (0/16). Three seeds touched wave 5
(s669031-belongfeast, s669035-leadfeast, s669038-leadfeast) on both arms
identically. The villages can see the table; they cannot pay its price.
That is the scale wall, and the devotion cadence does not move it.

The human texture, from the sense test's d107 chain (s669031-leadfeast
devoted): the scholar holds the Photo Album in the morning — Torill's
wedding, the neighbor's kid with the missing tooth — and arms the
devotion; at dusk Emma opens the pantry wide and the village feasts
armed; the feast-smoke draws The Congregation; Tom's and Colin's blows
carry the feast. Grief, memory, fire, blades — one coherent beat. The
layer's narration never existed (the beats read as the scholar preparing
the village), which is why its failure is clean: nothing about the
village felt wrong; the cadence was simply unneeded.

## Metric review (§14)

1. The two primary bars diverged in the informative way: breadth met
   exactly (2/8 seeds up) while volume failed flat (47 vs 71). A real
   but tiny effect trips the breadth bar without moving volume. For the
   NEXT run on an arming-style lever, pre-register a per-opportunity
   metric (armed-feast rate per threat-gate firing) alongside volume, or
   a minimum-firing gate (e.g. layer must fire >=20 times across the
   pilot) before the volume bar binds. This run is judged NO-GO on the
   bars as written — no re-scoring.
2. The >=2-event new-death-mode tripwire fired on 'alien' (3 devoted vs
   0 control, both on seed 669034's devoted runs). Root cause: not a
   layer defect. The layer channels keepsakes at haven in the morning —
   it touches no disease vector, no water, no meat. The 669034 devoted
   runs survived +22d/+6d longer than their controls (more exposure to
   everything) and fought slightly more wave-4 (waveKillLog 40/50 vs
   34/48). With 32 runs, a 3-event rare mode trips the wire by noise.
   Proposal for next run: require a new mode to be mechanistically
   plausible for the intervention, or raise the policy-side bar to >=5
   events. Recorded as a guardrail miss by the letter; it does not change
   the NO-GO (the primary failed on its own).
3. The s669032-leadfeast -55d paired survival outlier (devoted 126d vs
   control 181d) is recorded but not attributed: the death was combat,
   the layer's only action that run was 2 morning channels. Median-based
   guardrails absorbed it (median diff 0.0d). No metric change proposed —
   the median construction did its job.

## Wall numbers (scale-onramp)

| | control (16) | devoted (16) |
|---|---|---|
| national | 0 | 0 |
| table (invitation) | 16 | 16 |
| wins | 0 | 0 |
| wave-5 reach | 3 (seeds 669031-bf, 669035-lf, 669038-lf) | 3 (same seeds) |
| median survival | 114.5d | 115.0d |
| max survival | 181d | 181d |

The wave-5 door stands: 3/16 seeds touch wave 5 identically on both
arms; national 0/16; wins 0/16. The devotion arming cadence is ruled OUT
as the door's blocker — the threat gate's unarmed skips (148 across the
devoted runs) are a resonance-economy problem (surgeResonance>=35 or 3 L3
masteries build at one channel a day), not a cadence problem. Armor
remains the measured sole blocker (28/28d, run fleshout-20261022T1717Z).

## Blanks filled / documented

- DOCUMENTED (this run, the kill with teeth): the feastdiscipline
  pilot's named blank — "the threat gate often meets unarmed devotion"
  — is NOT fixable by arming cadence. The base's nightly keepsake
  channel keeps devotion armed ~99.7% of window-live upkeep passes; a
  second daily channel fires 0–3 times per 180d run and moves staged
  volume 47 -> 47. The binding constraint is the arming ECONOMY
  (resonance accumulation rate), not the cadence. Named next for the
  axis: resonance-economy levers, or accepting unarmed skips as the
  price of the threat gate's selectivity.
- FILLED (orphan worker, preserved): the policy-layer mechanism itself —
  DIAG'd, proof-gated (28/28 GREEN), sense-passed — as a reusable
  pattern for future cadence layers, even though this instance was
  killed.
- DOCUMENTED: table invitation 16/16 with 0 wins and 0 national on a
  32-config pilot — the scale wall's shape at the feastdiscipline
  operating point.

## Convergence (scale-onramp axis)

Axis state: **converging** (not converged). This arm closes one named
hypothesis with a clean NO-GO: unarmed devotion at the threat gate is a
real phenomenon (148 unarmed skips on the devoted side) but not a
cadence-fixable one. The wave-5 door's blockers, measured: armor
(28/28d, sole blocker per the 1717Z run) stands; devotion cadence ruled
out. The STANDING DIRECTIVE holds — every run keeps attacking the scale
wall until the tracker records national reached in sims. Next arms on
this axis should work the resonance economy or the armor drive, not
another cadence variant.

## Files

LANDED (evidence-only; the arm was killed — policy + scripts reverted zero-trace per loop convention):
- evidence/2026-10-22/sim-devotionarm.md — this file
- evidence/2026-10-22/perseed-devotionarm/ — pilot corpus (32 configs)
- evidence/2026-10-22/devotionarm-panel-primary.md — §15 panel compare (review_required, no material signal)
- evidence/2026-10-22/devotionarm-panel-primary.json — panel report
- evidence/2026-10-22/devotionarm-panel-primary-before.json.gz — control panel
- evidence/2026-10-22/devotionarm-panel-primary-after.json.gz — devoted panel

REVERTED (not landed — killed arm leaves no trace):
- scripts/policies/devotionarm.js — the layer (DEVOTIONARM=1)
- scripts/test-devotionarm-20261022.js — proof gates (ALL GREEN pre- and post-rebase)
- scripts/sweep-devotionarm-20261022.js — pilot sweep
- scripts/analyze-devotionarm-20261022.js — paired analysis (§15 manual instrument)
- scripts/build-devotionarm-panels-20261022.js — §15 panel builder
- scripts/sense-devotionarm-20261022.js — sense probe (SENSE-PASS)
