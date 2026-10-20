# sim-relaymantle — the relay mantle-succession + grounding-floor study (flesh-out loop, 2026-10-20, ARM sim-relaymantle)

Run: fleshout-20261020T0215Z (parent), arm sim-relaymantle. Axis: scale-onramp (the blocking axis).
POLICY-SIDE — zero src/js changes. File scope: scripts/policies/relaymantle.js (new),
scripts/probe-relaymantle-20261020.js (new), scripts/analyze-relaymantle-20261020.js (new),
scripts/build-relaymantle-panels.js (new), scripts/relaymantle-transcripts-20261020.js (new),
scripts/test-relaymantle-20261020.js (new), evidence/2026-10-20/sim-relaymantle.md +
evidence/2026-10-20/perseed-relaymantle/ + relaymantle-panel* + relaymantle-transcripts/.
NEVER edited: scripts/policies/tablepathdriver.js, scripts/policies/relaydark.js,
scripts/probe-tablepathdriver-20261020.js, scripts/analyze-tablepathdriver-20261020.js,
scripts/tablepathdriver-transcripts-20261020.js, scripts/build-tablepathdriver-panels.js
(the pilot's landed 20261020 tablepathdriver instruments — composed upon, never modified).

Canon: docs/CANON.md + docs/TABLE.md (the table prices the run, never gates on godhood;
the relay's GRADIENT law: light/dark/grey bands on the leaning meter, earned through
relay verbs never a menu choice; grounding tiers — 100–75 GROUNDED full food
conversions, 74–50 FRAYING ×0.9, 49–25 ESTRANGED ×0.75, 24–0 HOLLOW ×0.6; dark relay
ability use erodes grounding per use; human verbs (shared meals, comforted grief, kept
favors, teaching) restore; the dark relay literally becomes what forgot food;
trial-by-combat the single opt-in existential risk; death passes the mantle —
the village continues; failure resolves the story, never deletes the run).

Named nexts answered (sim-tablepathdriver, 2026-10-20):
  #4 — Relay mantle-succession study. 4/5 dark walks passed the mantle mid-road — the
  mechanism works (lean persists in relay state) but the burn rate is the price of the
  road. A dedicated look at whether the grounding floor-stop (≤32) is too permissive
  would be worth one arm.
  #5 — Probe hygiene. Fix the `walked` derivation and the done-before-invitation
  ordering before the next table-path sweep reuses this instrument.

Backlog checked before designing: (a) sim-pathselect KILLED 2026-10-15 (door-variety
gap is in build composition, not door choice); (b) WIN-PATH CONCENTRATION 30/30 FEARED
(steve-call); (c) BUILD THE WITNESS EXPOSURE SOURCE — DECIDED 2026-10-17, LANDED
3e6b44d17, superseded by the pilot; (d) modalplay's door rule (a door never offered
cannot be taken). The ledger-dark road and the indispensable road are other arms'
business — not chased here.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE any sims)

**PRIMARY (GO): the floor verdict — is the ≤32 grounding floor-stop too permissive?**

Arms — all on the tablepathdriver substrate (SEATDRIVE=1 + TABLEPATHDRIVER=1; the
7-door driver drains the modal after sitting). The relaymantle road REPLACES relaydark
in the composition; the road is active on ALL runs of the road arms
(RELAYMANTLE_ALL=1 — the floor question needs road samples, and the door rotation
still provides door variety for the win-side):
  A0 control: RELAYMANTLE=0 — road off (TABLEPATHDRIVER=1 only). The no-road baseline
     for burn attribution and win-side impact.
  A1 floor32: RELAYMANTLE=1, RELAYMANTLE_FLOOR=32, targets {lean ≤ −44, grounding ≤ 48,
     darkUses ≥ 6, bond ≥ 2} — the pilot's exact numbers; replication on the fixed
     instruments.
  A2 floor44: same targets, RELAYMANTLE_FLOOR=44.
  A3 floor56: same targets, RELAYMANTLE_FLOOR=56.
Per arm: 16 runs (seeds 64201–64208 × {leadfeast, belongfeast}), 180d death-aware,
identical seeds across arms. Env per arm: FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1
RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 KILLDISC=1
TABLEPATHDRIVER=1 + RELAYMANTLE=(0|1) + RELAYMANTLE_FLOOR=(32|44|56) +
RELAYMANTLE_ALL=1 (road arms).

Per-arm measures:
  (a) road done rate: done/16
  (b) mid-road bearer-death rate: scholar deaths while the road is active and the
      table not yet invited, /16 — with grounding-at-death, cause, day
  (c) dark-band sitting rate: sittings with relayAtSit.band === 'dark', /16
  (d) mantle-pass rate: among dark-band sittings, the fraction with a mid-road
      bearer death before sitting
  (e) dark-walk terminal resolution: dark-branch walks reaching phase 'done'
  (f) win-side: wins/16, national/16, table/16

REPLICATION BAR (A1 must meet, else KILLED-AT-PILOT): done ≥ 3/16 AND dark-band
sittings ≥ 3/16. (Pilot: 5 dark walks on 7 road-active runs; 3/16 is the
conservative floor on 16 road-active runs.)

FLOOR VERDICT (judged A2 vs A1):
  - "≤32 TOO PERMISSIVE" iff A2.done ≥ A1.done − 1 AND A2.darkSit ≥ A1.darkSit − 1
    AND A2.bearerDeaths ≤ A1.bearerDeaths − 2.
    (The depth wasn't needed: the road completes above 44 with less burn.)
  - "BURN IS THE PRICE OF THE ROAD" iff A2.done ≤ 1 AND A1.done ≥ 3.
    (The targets are unreachable above 44; ≤32 stands.)
  - Else INCONCLUSIVE — documented, never re-scored (§14).

LANDING:
  - Verdict "too permissive" → GO: commit the relaymantle layer (floor 44 as the
    road's new floor) + instruments + evidence.
  - Verdict "burn is the price" → DIAG-GO: commit instruments + evidence only
    (the layer adds nothing over landed relaydark; ≤32 stands).
  - Replication bar missed → KILLED-AT-PILOT: delete relaymantle.js zero-trace;
    keep instruments + evidence.

**GUARDRAILS (all binding):**
- no crashes, no softlocks, zero engine errors on all runs
  (walkError/verbError/rmError/instrumentErrors counted)
- no new death mode vs A0 control (death-channel taxonomy
  identical-by-construction with the pilot probe)
- invitation→sitting conversion ≥ 70% per arm
- national/table within ±2 of control per arm
- DET: road-ON twice byte-identical (no unseeded RNG in the new layer)
- FIDELITY: road-OFF byte-identical to the pilot's road-off probe on the same
  seeds (the new instrument perturbs nothing when the road is off)

**DIAGNOSTIC MISS:** DET/FIDELITY fail, the walk-capture wrapper perturbs
trajectories, or done never fires in any road arm (instrument failure). A miss
is NO-GO, never re-scored (§14).

**Horizon:** 180d death-aware (dead villages stop simulating — same surface as
the pilot and its control).

**Instrument:** scripts/policies/relaymantle.js (the road — parameterized
floor/targets; THE #5 FIX: the completion check is a pure read evaluated BEFORE
the invitation-stop, so done/doneDay is truthful when the invitation stages the
same day the road completes — the s64203 artifact; the layer still goes quiet
once the invitation is staged, no verbs past it; records minGrounding while
active, for the burn-depth distribution),
scripts/probe-relaymantle-20261020.js (the sweep instrument — pilot-probe
lineage, death taxonomy copied verbatim identical-by-construction; THE #5 FIX:
walk capture at the source via a Game.chooseTableOption wrapper — a walk is a
'path:X' choice the engine ACCEPTED (after.path set, after.phase ≠ 'paths'),
with branch + the engine's live tableBranch(pathId) signals captured at walk
time; dailyRec carries relay state (lean/band/grounding/darkUses/held/bond) +
the road's daily snapshot for the mantle join; SMOKE/DET/FIDELITY modes),
scripts/analyze-relaymantle-20261020.js (per-arm attribution + floor verdict),
scripts/relaymantle-transcripts-20261020.js (seated-window SAY capture for the
sense-read), scripts/build-relaymantle-panels.js (§15: A0 control → A1 floor32
and A1 floor32 → A2 floor44 through scripts/balance-panel.js),
scripts/test-relaymantle-20261020.js (proof: the ordering fix, walk capture
incl. the conscript transition, floor parameterization, SMOKE + DET).

**Probe-hygiene fixes (#5), in MY instruments (the pilot's files are never edited):**
1. `walked` derivation — the pilot's drain recorded a walk only when
   after.phase === 'challenge'; the relay/feared-dark door transition goes
   paths → 'conscript' FIRST (the dark-conscript offer in table.js
   tableStartPath), so relay walks were never recorded in `walked`. The real
   fix: capture at the choice source — a Game.chooseTableOption wrapper in the
   probe records every table choice with before/after tableState; a walk is a
   door choice the engine accepted into any non-'paths' table phase. Branch and
   the engine's tableBranch(pathId) signals are captured at walk time — this
   also fixes the pilot's missing relay margins row (its capture covered only
   the 6 ledger paths).
2. done-before-invitation — the pilot's relayDarkDaily checked the
   invitation-stop before the completion check, leaving done=0 on s64203 though
   the state was fully dark at sitting. The real fix: the completion check
   (pure read) is evaluated BEFORE the invitation-stop; the layer still goes
   quiet once the invitation is staged (no verbs past it) — only the RECORD is
   ordered first.

**§15:** before/after comparisons run through scripts/balance-panel.js:
(i) A0 control → A1 floor32 (the replication treatment); (ii) A1 floor32 →
A2 floor44 (the floor verdict's instrument). The compare .md files are attached.
The panel is the instrument, the pre-registered bar is the judge.

**Telemetry deviation check:** node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-10-20/perseed-relaymantle/<arm>/s*.json' --metrics
national,table,wins,exiled (regime artifact expected, per the pilot).

**No [needs-eyes]**: instrument + policy layer only, no player-facing change
(policy-side only, zero src/js).

---
*(results below — filled after the sweep; pre-registration above is unchanged)*

## Results

Sweep complete 2026-10-20: 64/64 runs (4 arms × 16, seeds 64201–64208 ×
{leadfeast, belongfeast}), zero engine errors, horizon 180d death-aware.
Armed = SEATDRIVE=1 + TABLEPATHDRIVER=1 + RELAYMANTLE=(0|1) +
RELAYMANTLE_ALL=1; A0 control = road off.

**Infrastructure note:** a service restart wiped /tmp mid-sweep and killed
all 4 sweep processes at 10/16 runs each (the /tmp-wipe lesson, AGENTS.md
2026-10-14 — logs were on /tmp). All 40 per-seed JSONs survived (evidence/
is not /tmp). Resumed with SEEDS="64206,64207,64208" per arm, logs to
~/workspace/sweep-logs/, to 16/16. No data lost; the completed runs were
not re-run.

**Wall (per arm):**
| arm | national | table | wins | wave4 | wave5 | sat/inv | median | max |
|-----|----------|-------|------|-------|-------|---------|--------|-----|
| control | 12/16 | 9/16 | 12/16 | 10/16 | 0/16 | 12/9 | 90d | 154d |
| floor32 | 11/16 | 9/16 | 9/16 | 11/16 | 0/16 | 9/9 | 91d | 182d |
| floor44 | 11/16 | 9/16 | 9/16 | 11/16 | 0/16 | 9/9 | 91d | 182d |
| floor56 | 11/16 | 9/16 | 10/16 | 11/16 | 0/16 | 10/9 | 91d | 182d |

**PRIMARY — REPLICATION (A1 floor32):** done=13/16 ≥3 PASS;
darkSit=9/16 ≥3 PASS. The pilot replicates on the fixed instruments (the
pilot had 5 dark walks on 7 road runs; here 9 dark-band sittings on 16
road-active runs).

**PRIMARY — FLOOR VERDICT (A2 vs A1):** A1 done=13 darkSit=9
bearerDeaths=1; A2 done=13 darkSit=9 bearerDeaths=1; A3 done=0 darkSit=9
bearerDeaths=14. **INCONCLUSIVE on the pre-registered bar** — floor44 is
BYTE-IDENTICAL to floor32 on all 16 seeds (done/doneDays/minG identical),
so the "too permissive" condition (which needs A2 to differ) cannot be
met, and "burn is the price" (A2.done ≤ 1) does not apply (A2.done=13).

**The substantive findings (what the bar couldn't say):**

1. **The ≤32 floor never binds — the question dissolves.** Min grounding
   across the 16 floor32 runs: 44 (range 44–82). The road completes at
   grounding 44–48 via its OWN targets (lean ≤ −44, grounding ≤ 48,
   darkUses ≥ 6, bond ≥ 2) before the floor is ever reached. The floor is
   an inert backstop, not an active control. A future study of road depth
   should vary the COMPLETION TARGETS (grounding ≤ 48), not the floor —
   or use a substrate where the road drives deeper.

2. **Zero grounding-burn deaths.** Across 287 scholar deaths in 64 runs,
   exactly ONE was at grounding ≤ 60 (floor56/leadfeast/s64208, day 81,
   grounding@43, combat — on the aborted-road arm, where the passive
   −1/day holding erosion continued past the verb stop; the floor stops
   verbs, not the holding tick). Every road-phase death on floor32 (1),
   floor44 (1) and floor56 (14) was at grounding@100 — background mortality
   (raids/combat/contests), not road-caused. The pilot's "4/5 mid-road
   deaths" re-measures here as 1/16 road-phase deaths (floor32) under the
   honest definition (post-claim, pre-done, pre-invitation) — the rest was
   background mortality inside the road's window.

3. **The mantle mechanism works and the lean is sticky.** floor56 (aborted
   road, done=0/16, floorStops=14/16) still yields 9/16 dark-band sittings
   and 6 mantle passes — once the lean is dark it persists across bearer
   deaths; successors sit dark. 5 dark walks, all terminal, all won-or-
   priced.

4. **Dark walks:** floor32 4 dark-walk runs (relay/dark, all terminal, all
   won); floor44 identical; floor56 5 dark-walk runs (all terminal);
   control 0. Per-path terminal resolution holds everywhere the road
   walks.

5. **Win-side:** no arm differs from control beyond noise. §15 panel
   control→floor32: belongfeast won −0.5 / communityLost +0.375 /
   npcHungry +0.375 regression_signal on 8 seeds — investigated: no
   starvation-driven mechanism (starvation deaths 1–2/run in both arms;
   all road-phase deaths at grounding 100); leadfeast moved opposite
   (wins 5→6); judged noise on small n, not a road effect. Panel
   floor32→floor44: zero metric differences (byte-identical corpora) —
   the instrument confirms the floor doesn't bind.

**Guardrails:** all GREEN — 0 engine errors on 64 runs; no new death modes
vs control (taxonomy identical-by-construction); invitation→sitting
conversion ≥70% (control 133%*, floor32 100%, floor44 100%, floor56 111%
— *the known invitation-counting artifact, carried from the pilot);
national/table within ±2 of control.

**Probe hygiene (#5) — both fixes proven and live:**
1. Walk capture at the source (Game.chooseTableOption wrapper): 64/64
   runs walkConsistency ok (source-captured walks == drain doorEvents);
   the pilot's missed relay walks are now captured (`relay/dark via
   conscript`), with the engine's live tableBranch signals at walk time
   (the missing relay margins row is fixed).
2. Done-before-invitation: the reordering is in relaymantle.js and proven
   by the ORDERING unit tests (37 pass pre-sweep). No s64203-style
   artifact in this sweep — done/doneDay truthful on all 13 completing
   runs per arm.

**Village assessment.** The road is legible to the village without
breaking it: 13/16 roads complete, bearers die of the same raids and
contests as everyone else (grounding 100 at death — the road doesn't
single them out), and the mantle passes quietly — the successor sits with
the lean intact. The floor56 arm is the honest stress case: the road
aborts, the lean stays dark, and the village still walks the dark door
and wins. The dark road is a property of the relay state, not the
bearer — which is exactly TABLE.md's two-way-integration law (the
machine keeps what you put into it).

**Sense-testing (SENSE-TESTING LAW).** floor32-leadfeast-s64203 read in
full (295 SAY lines, FIDELITY-OK) —
evidence/2026-10-20/relaymantle-transcripts/floor32-leadfeast-s64203.txt.
Stan dies day 73 (raid); Sofia Chen sits day 95 with lean −100 / band
dark / grounding 40 / darkUses 9 and walks relay/dark to a win. The
mantle pass is voiced in the epilogue ("Sofia Chen reached into the
light and the light reached back"). The dark walk is its own genre (the
merge, televised; the cockpit verbs "already in your hands"; the ledger-
read line voices the RELAY band: "The dark road is open"; the dark
conscript refused through the mourners exhaling; backfire grounding
jolts). Villagers act like people throughout (Seo-hyun's Spanish,
Sandeep's heroics, Lucas's relief organization, Peter's refused
food-begging). The successor looting Stan's pack (+6 trauma, "Your hands
know what they did") lands as grief, not a bug.

## Metric review

(§14: the bars above are judged as pre-registered; these are doubts for
the NEXT run, not re-scores of this one.)

1. **Road-phase death operationalization refined.** The probe's raw
   midRoadDeaths counted any bearer death while the layer was gated on —
   with RELAYMANTLE_ALL=1 the gate is on from day 1, so day-12 dehydration
   deaths counted as "mid-road". The analyzer refines to ROAD-PHASE:
   post-claim, pre-done, pre-invitation, applied uniformly to all arms.
   The pre-reg bar is relative (A2 vs A1) so the comparison stands, but
   the absolute "4/5" pilot number is not comparable to the refined "1/16".
2. **The floor verdict's binary framing assumed the floor binds.** It
   doesn't (finding 1). A future depth study should move the completion
   targets, not the floor.
3. **Belongfeast win dip** (panel regression_signal, 8 seeds): investigated
   as noise (no mechanism, opposite move on leadfeast). The next run
   inherits it as a prior, not a finding.
4. **The floor stops verbs, not the holding tick.** The one g@43 death
   (floor56) came from passive −1/day relay-holding erosion after
   floorStop. If a future design wants a HARD grounding floor, the tick
   needs the same gate — filed as a design note, not a bug (canon: the
   two-way cost is real).

## Named nexts

1. **The floor question is answered: no change.** ≤32 stays as the inert
   backstop. The road's depth is set by its completion targets; a future
   arm that wants a shallower road should raise the grounding target
   (≤48), not the floor.
2. **The burn question is answered: zero grounding-burn.** The pilot's
   "burn rate" was background mortality. No lever needed.
3. **Probe hygiene (#5) is DONE.** Both fixes are proven and committed in
   the new instruments; the next table-path sweep should reuse
   probe-relaymantle-20261020.js's walk capture and relaymantle.js's
   ordering (or port them — the pilot's files remain untouched).

## Out-of-arm findings

(To be appended to
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/sim-findings.md`
by the coordinator; not chased mid-run.)

- **The ≤32 grounding floor never binds** on the tablepathdriver
  substrate (min grounding 44/16 runs) — the road completes via its own
  targets first. Depth studies should move the completion targets.
- **The relay holding tick (−1 grounding/day) ignores the verb floor** —
  grounding can erode past the floor after floorStop. Design note for a
  future hard-floor.
- **Belongfeast win dip on 8 seeds** (panel regression_signal): judged
  noise, inherited as a prior.
- **Service restart wiped /tmp mid-sweep**, killing 4 sweep processes at
  10/16 (recovered via SEEDS resume; logs now go to ~/workspace/sweep-logs/).

## Convergence

- relay/dark — EXERCISED (13 dark-band sittings on floor32, 4 dark walks
  terminal; the mantle study's mechanism confirmed).
- The mantle-succession question — ANSWERED (lean persists across bearer
  deaths; 6/9 mantle passes on the aborted-road arm; the burn is not
  grounding-caused).
- The floor question — ANSWERED (inert; no change).
- Probe hygiene #5 — DONE (both fixes proven, committed).

Arm work done when this evidence commits — pending ship, no push.

## Files

- scripts/policies/relaymantle.js — the road, parameterized floor/targets
  + the #5 done-before-invitation fix (the fixed successor to relaydark.js)
- scripts/probe-relaymantle-20261020.js — the sweep instrument (pilot-probe
  lineage; the #5 walk-capture fix at the source; relay state + road
  snapshot in dailyRec; SMOKE/DET/FIDELITY modes)
- scripts/analyze-relaymantle-20261020.js — per-arm attribution + floor
  verdict (refined road-phase deaths)
- scripts/build-relaymantle-panels.js — §15: control→floor32,
  floor32→floor44
- scripts/relaymantle-transcripts-20261020.js — seated-window SAY capture
- scripts/test-relaymantle-20261020.js — proof (46 pass: ORDERING/WALKCAP/
  FLOOR/DELEGATION/REAL-VERB/SMOKE/DET + COMPLETE=1 gate)
- evidence/2026-10-20/perseed-relaymantle/{control,floor32,floor44,floor56}/
  {leadfeast,belongfeast}/s64201–s64208.json — 64 per-seed JSONs
- evidence/2026-10-20/relaymantle-panel-control-floor32.* +
  relaymantle-panel-floor32-floor44.* — §15 compares
- evidence/2026-10-20/relaymantle-transcripts/floor32-leadfeast-s64203.txt
  — the sense-read transcript (FIDELITY-OK)
- evidence/2026-10-20/sim-relaymantle.md — this file

## Telemetry deviation check (Steve 2026-10-13)

Ran per-policy per arm:
`node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json
--current 'evidence/2026-10-20/perseed-relaymantle/<arm>/<policy>/s*.json'
--metrics national,table,wins,exiled`.
All four arms LOUD on national/table/wins — INCLUDING the A0 control
(control leadfeast: table −69%, wins −69%; belongfeast: national −67%,
table −75%). VERDICT: regime artifact, same as the pilot's — the
scale-wall baseline's `_regime` is the winseat regime (wins 16/16); this
substrate is the seatdrive-win-side regime. The baseline was NOT rolled.
(The tool's glob supports `*` in the basename only — ran per policy dir.)
