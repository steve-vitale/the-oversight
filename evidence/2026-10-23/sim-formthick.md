# sim-formthick — PAIR-THEM: FORMATION-THICKENING (run fleshout-20261023T1515Z, axis scale-onramp)

Worker tree sim-formthick. Arm: the THICKENING half of the veterans
coincidence trap — the vetstack named next #1. Policy-side layer, ZERO
src/js changes. Namespaces: formthick-* scripts + `scripts/policies/formthick.js`
(FORMTHICK=1).

Canon read first: docs/CANON.md + docs/MONSTER-WAVES.md (wave 4 = The
Mirror Draft; the readiness gate's VETERANS bar = 2 living roster members
with wave-4+ kills in state.waveKillLog; the hold never names the wave's
title — knowledge-gate discipline). No canon doc covers equipment —
stated, not invented (same as the sibling arms).

Sibling evidence read: evidence/2026-10-23/sim-vetstack.md (composition
NO-GO: formation works, retention works, simultaneity doesn't — 0/16
co-satisfaction both arms; named next #1 is this arm), sim-vetformation.md
(formation GO: 10 vs 6 distinct wave-4+ killer vids on seeds
68805–68810/68812/68814 x {leadfeast, belongfeast}; the finishing hold's
yield band is conservative — its named next #2, not this arm's),
scripts/policies/vetformation.js (the formation layer's actual seams).

## PRE-REGISTRATION (§14 binding — written BEFORE any sims)

- **BINDING QUESTION (vetstack named next #1):** "a second forming slot
  that fires when the first veteran is already blooded — the 'pair them'
  beat, measured on this same band with the same co-satisfaction primary."
  The defer5 bar needs 2 LIVING veterans at once; the stack never produced
  2 on one config.
- **PRIMARY (binding):** defer5 veterans-bar co-satisfaction — armed
  configs with 2 living wave-4+ killers simultaneously (read
  state.waveKillLog DIRECTLY post-run, deduped on (d, mid, by, via,
  trick) per backlog #844, living = not in deathRows.who):
  armed >= control + 2 AND >=1 armed config satisfying. GO requires both.
  A miss is NO-GO, never re-scored.
- **SECONDARY:** distinct wave-4+ killer vids, per-pair sum (the formation
  arm's PRIMARY convention) — formation contrast (control=formation-alone
  did 10 on this band); engagement (paired slot fires: count
  configs/days); guardrails; wall.
- **VETSTACK NAMED NEXT #2 (measured while here):** does thickening change
  formation counts vs formation-alone (the 9-vs-10 retention-interference
  question, now for thickening)?
- **GUARDRAILS:** median survival paired diff >= -15d; starvation <=
  control+2; no new death kinds (>=2-event rule); report wall
  (national/table/wins, wave4/5, median survival) both arms.
- **SEEDS:** 68805–68810, 68812, 68814 x {leadfeast, belongfeast} x
  {control, armed} = 32 configs, 180d death-aware, paired identical
  seeds. Dead villages stop (+10d tail max).
- **SUBSTRATE (pinned BOTH arms):** FEASTSCALE_R13=1 TRIBFLOOR=1
  WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1;
  control = VETFORMATION=1 (formation-alone, the proven GO layer);
  armed = VETFORMATION=1 + FORMTHICK=1. One delta only.
- **§15:** before/after through scripts/balance-panel.js — the panel is
  the instrument, the bars above are the judge.
- **METRIC REVIEW section mandatory** (below).

## Design (scripts/policies/formthick.js)

THE MECHANISM: a thickening beat composing OUTSIDE vetformation's
withVetformation. On threat days when a blooded LIVING veteran is staged
with the formation and the formation's own pick left the second forming
slot empty (thin: <2 forming companions in the party), the beat drafts the
next-best eligible non-veteran into the paired slot — consent-based invite
(Game.inviteToParty — personality/goals decide), NEVER dismisses, party cap
respected. Non-suicidal (armed, hp >= 40%, trust >= 20 — the formation's
own bar). Voiced once per draft: the BLOODED VETERAN names the second
fighter. Deterministic lines (no RNG), knowledge-gated (the wave's title
is never named).

DESIGN CALLS (Steve 2026-10-07: figure it out yourself, document it):
1. The beat thickens THE FORMATION — it requires BOTH gates
   (FORMTHICK=1 && VETFORMATION=1). Formation off + thickening on is a
   silent no-op (nothing to thicken), never a standalone staging.
2. The veteran-presence trigger reads the LIVE PARTY, not the roster: the
   veteran must be staged for the upcoming fight for the pairing to be
   real. (The formation's anchor is the best fighter even if veteran, so
   the blooded veteran is usually the anchor already.)
3. The fight belongs to the formation's finishing discipline — this layer
   stages, it does not close. fight() purely delegates to base. A
   fight-side "steadiness" extension was considered and REJECTED: two
   mechanisms would muddy attribution, and the hold bounds are the
   formation arm's own territory (its named next #2).
4. The draft extends ctx.vfFormationVids (the formation's affirmed set) so
   the fight trace counts the drafted fighter as formed.
5. The beat fires only when the formation beat affirmed TODAY
   (ctx._vfFormDay === day). The formation beat sets its day marker before
   its skip checks, and its skips (window/threat/haven) are a subset of
   this beat's — so the marker plus this beat's own checks means a fresh
   affirmation, never a stale one.

## Proof (scripts/test-formthick.js)

**28 PASS, 0 FAIL** (2026-10-23, full Usage-header env):
- E0 shape: thickFor/controlFor tag correctly, unknown base throws,
  exports present.
- E1 det-gate: FORMTHICK unset (VETFORMATION=1 both sides) → thickFor
  60d byte-identical to VF.formedFor on leadfeast + belongfeast; tele
  untouched.
- E2 env-gate: ftOn false/true on unset/1.
- E3 RED→GREEN fixtures: gate off → pure delegation (stub base runs,
  thickening silent, ctx untouched); FORMTHICK=1 + VETFORMATION unset →
  silent (nothing to thicken); GREEN: veteran staged + thin forming bench
  → drafts the next-best non-veteran (form2_vid), the beat voiced BY THE
  VETERAN naming the drafted fighter, knowledge-gated (never names the
  wave title), affirmed set extended for the fight trace; no veteran →
  silent; already thick (2 forming) → silent; party full → silent, never
  dismisses; no eligible candidate → silent; refusal → silent beat,
  counted; no threat → silent; stale formation affirmation → silent; one
  pass per day; fight → pure delegation either way (the close belongs to
  the formation).
- E4 armed determinism 60d (FORMTHICK=1 + VETFORMATION=1, same seed twice);
  D2 180d armed completes + deterministic re-run. (First run was 27/28 —
  the party-full fixture's filler vid counted as a forming companion and
  hit skippedThick instead of skippedFull; fixture fixed to stage a
  second blooded veteran, re-run 28/28 green. Test bug, not a policy bug.)
- D2 tele (seed 4244 belongfeast): pairDays=33, skippedNoVet=33,
  pairDrafts=0 — the beat's checks fire on threat days; no staged veteran
  on that seed.

## Sweep

32/32 configs complete (seeds 68805–68810, 68812, 68814 x
{leadfeast, belongfeast} x {control, formthick}, 180d death-aware, pinned
substrate FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1 VETFORMATION=1 (both arms);
FORMTHICK=1 armed only; anchor 520dbbd7ac2c on all 32).
Corpus: evidence/2026-10-23/perseed-formthick/{control,formthick}/.
Analyzer: scripts/formthick-analyze.js (offline judge; verdict read from
its stdout).

INFRASTRUCTURE NOTE: the VM rebooted mid-sweep (uptime reset; both sweep
processes killed after 12/16 configs each, seeds 68805–68810). All 24
completed files verified valid (anchor + waveKillLog + seed/arm present);
the remaining 8 configs (seeds 68812, 68814 — the critical ones) were
re-run to completion after the reboot. 32/32 valid.

## Results (scripts/formthick-analyze.js)

### PRIMARY (binding): defer5 veterans-bar co-satisfaction — NO-GO
- control (formation-alone): 0/16 configs with 2 living wave-4+ killers
- armed (FORMTHICK=1): 0/16 configs
- Bar: armed >= control+2 = 2 AND >=1 armed config → **NO-GO** (0 < 2).
  Never re-scored.
- Only s68806 (both bases, both arms) has a living veteran at end
  (gen_k5lv2zk, 1 living) — identical both arms.

### THE KILL FINDING: the pair-them slot fired on 0/16 configs
- pairDays=175, drafts=0, refused=0, beats=0 across the armed corpus.
- Skip breakdown: skippedNoVet=150 (no blooded veteran staged in the
  party), skippedThick=24 (veteran staged but the bench already holds 2+
  forming companions), skippedThin=1 (veteran staged, thin bench, no
  eligible candidate left), skippedFull=0.
- Autopsy (s68812-belong armed): 4 veterans blooded d72/79/83/92, dead
  d107/103/87/96. The beat considered 20 threat days: 11 skippedNoVet
  (veterans dead or hurt/unstaged), 8 skippedThick, 1 skippedThin.
- The named next's premise is FALSE on this band: when a blooded veteran
  IS staged, the formation layer's own 3 slots already pair them with 2
  forming fighters (24/25 veteran-staged days). The "second forming slot"
  has nothing to thicken — the formation already does the pairing. The
  remaining gap is veteran attrition (blooded killers die within ~4–15d),
  not thin staging.

### SECONDARY: formation contrast — 10 vs 10 (no change)
- Distinct wave-4+ killer vids, per-pair sum: control 10, armed 10.
  (Retained formation-arm corpus: formation-alone 10 vs its control 6.)
- Vetstack named next #2 ANSWERED: thickening does not change formation
  counts vs formation-alone — trivially, because the lever never fires.
  No interference, no suppression, no addition.
- Damage-majority villager kills: control 7, armed 7 (identical rows).

### GUARDRAILS: all PASS
- median survival paired diff: 0.0d (bar >= -15d) — PASS
- starvation: control 15 vs armed 15 (bar <= control+2) — PASS
- new death kinds (>=2-event rule): none — PASS
- §15 panel (descriptive-by-construction, env-gated):
  decision=review_required; every metric delta=0 / no_material_signal —
  the trajectories are identical because the lever never fired. Panel
  .md attached: evidence/2026-10-23/formthick-panel-primary.md.

### WALL (both arms — identical)
- control: national 4/16, table 6/16, wins 0/16, wave4 11/16, wave5 2/16,
  median 116d, max 181d
- armed: national 4/16, table 6/16, wins 0/16, wave4 11/16, wave5 2/16,
  median 116d, max 181d
- The wall doesn't move (structural on SEATDRIVE=0); the lever is
  trajectory-neutral.

## Sense verdict (SENSE-TESTING LAW) — VACUOUS (honest)

The pair-them beat fired 0 times across 32 configs, so there is no
pair-them transcript to judge for meaning/coherence. The sense finding is
the silence itself: the lever is a dead letter on this band — it voices
nothing, stages nothing, changes nothing. A sense replay would show only
the formation layer's own beats (already judged PASS in sim-vetformation).
No transcript was fabricated to fill the gap; the analyzer's beats=0 is
the sense evidence.

## Metric review (§14 — the bars held)

1. The PRIMARY bar (armed >= control+2 AND >=1) was set against an
   unknown control; control came in at 0/16 — the bar (2) was fair, not
   tuned. NO-GO stands as measured, never re-scored.
2. The engagement metric (paired slot fires: configs/days) was
   pre-registered as secondary; it came in at 0/16 configs, 0 drafts in
   175 pair-days. This is the kill signal, not a metric failure — the
   metric correctly reported the mechanism's non-engagement.
3. The dedupe on (d, mid, by, via, trick) per backlog #844 was applied;
   no duplicate-driven distortion (the formation contrast 10 vs 10 is
   deduped).
4. No metric proved wrong this run. Nothing re-scored; the bars above
   are the verdict.

## Telemetry deviation check (Steve 2026-10-13)

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current 'evidence/2026-10-23/perseed-formthick/<arm>/*.json'
--metrics national,table,wins,exiled` fired LOUD on both arms:
national 12→4, table 16→6, wins 16→0.

**Investigated — all EXPLAINED, no bug, baseline NOT rolled.** Same
regime artifact as every arm on this substrate (formation, vetstack,
vetkill-autopsy, feastdisc-confirm, armored15-confirm): the
scale-wall.json baseline's own `_regime.note` says wins are structurally
~0 on the non-seat substrate; this corpus is SEATDRIVE=0 (the table win
lands ~d90-134 and the run ENDS before villagers blood themselves);
the baseline is the winseat regime (SEATDRIVE=1). All LOUD lines are
regime artifacts.

## Village assessment

The villages on the formation band are exactly where the formation arm
left them: formation stages killers (10 distinct vids), but the defer5
bar's simultaneity never arrives. The thickening lever was built for a
phenomenon that doesn't occur — a blooded veteran staged with a thin
forming bench. In the wild, staged veterans already have 2 forming
fighters beside them (the formation's own 3 slots do the pairing), and
unstaged veterans are dead or hurt. The 4-veteran burst on s68812-belong
(d72–92) is the closest the band comes to simultaneity, and all four
were dead by d107 with the village gone at d108. The wall's binder is
unchanged: village survival through the wave-4 window, not veteran
staging density.

## Named nexts

1. **The "third forming slot" (unbuilt, needs its own pre-registration).**
   On the 24 skippedThick days the party already held a veteran + 2
   forming fighters with room to spare (partyMax 4–5 after day 14/30).
   A lever that drafts a THIRD forming fighter into the spare party
   capacity when a veteran is staged would actually fire. Different
   mechanism than briefed here — do not smuggle it into this arm's
   verdict.
2. **Veteran attrition, not staging, is the veterans-half binder.**
   Blooded killers die within ~4–15d on this band (s68812: 4/4 dead).
   The retention half (sibling's lane) owns the post-kill window; the
   composition question (vetstack) stands answered: formation works,
   retention works, simultaneity doesn't.
3. **The formation's anchor pick already pairs veterans.** Any future
   "pair them" design must start from the formation's actual affirmed
   sets (24/25 veteran-staged days already thick), not from the assumed
   thin slot.

## Blanks filled / documented

- FILLED (measured): the vetstack named next #1 is ANSWERED — a
  formation-thickening "pair them" lever does not produce defer5
  co-satisfaction on the formation band (0/16 both arms, 0 drafts in 175
  pair-days). The named next's premise is false: the formation already
  pairs staged veterans with 2 forming fighters.
- FILLED (measured): vetstack named next #2 — thickening changes
  formation counts not at all (10 vs 10); no interference.
- DOCUMENTED: the VM-reboot mid-sweep recovery (24 files verified, 8
  re-run); the party-full fixture bug in the proof (test bug, fixed,
  28/28 green).
- steve-call: none — the NO-GO is a measurement, not a fork.

## Kill protocol (NO-GO)

Per kill discipline: `scripts/policies/formthick.js` DELETED zero-trace.
Kept: proof (scripts/test-formthick.js, 28/28 green — documents the
tested mechanism), instruments (sweep, analyzer, sense, panel builder),
corpus (32 per-seed JSONs), this evidence file. The formation layer
(scripts/policies/vetformation.js, landed) is untouched.

## Instruments committed (namespace formthick)

- scripts/test-formthick.js — proof (28/28 GREEN; the policy it proves
  is killed zero-trace per the verdict above)
- scripts/formthick-sweep.js — the 32-config census
- scripts/formthick-analyze.js — the judge
- scripts/sense-formthick.js — narration replay (vacuous this run: 0 beats)
- scripts/build-formthick-panels.js — §15 panel builder
- evidence/2026-10-23/perseed-formthick/{control,formthick}/ — the corpus (32)
- evidence/2026-10-23/formthick-panel-primary.{json,md} — §15 compare
- evidence/2026-10-23/sim-formthick.md — this file
- DELETED per kill protocol: scripts/policies/formthick.js

## Convergence note

- Axis scale-onramp: the vetstack named next #1 is closed with a clean
  kill — formation-thickening does not move the veterans half. The
  coincidence trap's veterans half now reads: formation proven (GO),
  retention proven (mechanism), composition measured (NO-GO on
  simultaneity), thickening killed (premise false). The remaining
  binding constraint is village survival through the wave-4 window
  (vetstack named next #3 — lever-1 combat & death share territory).
- scale-onramp stays converging (NOT converged).
