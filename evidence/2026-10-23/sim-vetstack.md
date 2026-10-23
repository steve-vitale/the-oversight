# sim-vetstack — COMPOSITION: VETFORMATION=1 + VETRETENTION=1 (run fleshout-20261023T1515Z, axis scale-onramp)

Worker tree sim-vetstack. Arm: the COMPOSITION arm — do the two veterans-half
levers (formation: sim-vetformation, GO, landed e7fc8824e; retention:
sim-vetretention, mechanism proven 49/49, pilot NO-GO on thin formation)
compose into the defer5 veterans leg when stacked on the formation seed band?
Policy-side, ZERO src/js changes. Namespaces: vetstack-* scripts + evidence
only; the retention policy file is SWEEP-ONLY (copied from branch
sim-vetretention, deleted before any commit — this branch contains ZERO
policy edits).

Canon read first: docs/CANON.md + docs/MONSTER-WAVES.md (wave-4 = The Mirror
Draft; defer5 VETERANS bar = 2 living roster members with wave-4+ kills in
state.waveKillLog, src/js/standing.js waveCombatReadiness(5); the wave-5 door
is a momentary coincidence — defer5gate evidence; defer4 = 1 living w3+
killer — defer4gate evidence, veterans 5/5).

Sibling evidence read: evidence/2026-10-23/sim-vetformation.md (formation GO:
10 vs 6 distinct wave-4+ killer vids on seeds 68805–68810/68812/68814 x
{leadfeast, belongfeast}); sim-vetretention (branch sim-vetretention, pilot
NO-GO, mechanism proven 49/49, 14d blooded-vid protection; the chair ate the
gains); sim-defer4gate.md (defer4=veterans 5/5; the coincidence trap).

## DEPENDENCY (sweep-only, documented per brief)

The retention policy is NOT YET ON MASTER. This arm takes it sweep-only:
`git show sim-vetretention:scripts/policies/vetretention.js >
scripts/policies/vetretention.js`, runs the sweep against it, then DELETES
the file before any commit. instruments + evidence only on this branch.
If the sibling landing arm lands retention on master first, this sweep's
substrate is identical by construction (same file, same 14d protection).

## PRE-REGISTRATION (§14 binding — written BEFORE any sims)

- **BINDING QUESTION (tracker's standing finding):** "the armor half of the
  coincidence trap is now a proven wall-mover; the veterans half is
  attributed (post-kill attrition + never-formed) but unleveled." Both
  halves now exist as layers. Do they COMPOSE into the defer5 veterans leg —
  simultaneity, not just formation?
- **PRIMARY (binding):** defer5 veterans-bar co-satisfaction: armed (stack)
  configs with 2 living wave-4+ killers simultaneously (read
  state.waveKillLog DIRECTLY post-run, autopsy method; living = not in the
  run's deathRows.who — the engine's own isLiving() reads vp.dead; post-run
  the dead-set join is the offline equivalent) >= control + 2, AND >=1 armed
  config satisfying. A miss is NO-GO, never re-scored.
- **SECONDARY:** wave-5 doors opened (stack vs control); defer4 bar (1 living
  w3+ killer) co-satisfaction reported.
- **GUARDRAILS:** median survival paired diff >= -15d; starvation <=
  control+2; no new death kinds; report wall (national/table/wins,
  wave4/5, median survival) both arms.
- **COMPARE against retained single-half corpora:** vetformation 10 vs 6
  distinct vids (this seed band, this substrate); vetretention 2/16 formed
  (different seed band 68601–68608). The composition question is whether
  SIMULTANEITY happens, not just formation.
- **SEEDS:** 68805–68810, 68812, 68814 x {leadfeast, belongfeast} x
  {control, stack} = 32 configs, 180d death-aware — the formation seed band
  (the band where formation formed 10 vids). Paired design cancels seed
  effects.
- **SUBSTRATE (pinned BOTH arms):**
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
  KILLDISC=1 ARMORYDRIVE=1 + VETFORMATION=1 + VETRETENTION=1 (stack only).
  control = AD.armedFor(base); stack = VR.withVetRetention(VF.formedFor(nb))
  (retention OUTSIDE formation OUTSIDE armorydrive).
- **Attribution via scripts/w5gates-lib.js (PURE)** where possible.
  Before/after through scripts/balance-panel.js per §15 (panel is the
  instrument, the pre-registered threshold is the judge).
- METRIC REVIEW section mandatory; a miss is NO-GO, never re-scored.

## Convergence state

**NO-GO** (§14 binding — both halves work, they don't compose into
simultaneity). scale-onramp stays converging (NOT converged).

## Design (scripts/vetstack-sweep.js)

The composition: retention OUTSIDE formation OUTSIDE armorydrive
(`VR.withVetRetention(VF.formedFor(nb), '<tag>-vetstack', ...)`), gates
VETFORMATION=1 + VETRETENTION=1 on the stack arm only. Control =
AD.armedFor(base), gates unset. Both layers already proved their own
env-gates (vetformation 38/38, vetretention 49/49); this arm proves the
COMPOSITION's gate (E1: stackFor 60d byte-identical to AD.armedFor with
gates off — both layers delegate cleanly) and measures simultaneity.

DESIGN CALLS (Steve 2026-10-07: figure it out yourself, document it):
1. Retention wraps formation (not the reverse): the retention daily beat
   reads the blooded set the formation's fights produce; wrapping outside
   keeps formation's fight wrapper innermost, closest to the engine.
2. The co-satisfaction sensor mirrors the engine: waveKillLog DIRECT +
   living join (engine's isLiving reads vp.dead; offline the dead-set join
   is the equivalent). Per-pair-sum counting for the formation contrast
   (the formation arm's own PRIMARY convention).

## Proof (scripts/test-vetstack.js)

**21 PASS, 0 FAIL** (2026-10-23):
- E0: sweep-only retention dependency present (VR_WINDOW=14,
  withVetRetention, vrOn); stackFor id tags 'vetstack', desc names both
  levers.
- E1 det-gate: gates unset → stackFor 60d byte-identical to AD.armedFor
  on leadfeast + belongfeast (the composition delegates cleanly).
- E2 env-gate: vfOn/vrOn true with gates set, false after unset.
- E3 analyzer RED→GREEN: dedupe, dead-killer exclusion, w=3 vs w>=4,
  scholar-as-living, perPairSum convention.
- E4: 60d stack run deterministic re-run.
- E5: sweep smoke (control + stack, 20d) completes, writes JSONs with
  waveKillLog + vf/vr traces + the dependency note.

## Sweep

32/32 configs complete (seeds 68805–68810, 68812, 68814 x
{leadfeast, belongfeast} x {control, stack}, 180d death-aware, pinned
substrate FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1
SEATDRIVE=0 KILLDISC=1 ARMORYDRIVE=1; anchor 404e93e34d51 on all 32).
Corpus: evidence/2026-10-23/perseed-vetstack/{control,stack}/.
Analyzer: scripts/vetstack-analyze.js (offline judge; verdict read from
its stdout — see Metric review for why the on-disk verdict.json is
unreliable this run).

## Results (scripts/vetstack-analyze.js)

### PRIMARY (binding): defer5 veterans-bar co-satisfaction — NO-GO
- control: 0/16 configs with 2 living wave-4+ killers simultaneously
- stack: 0/16 configs
- Bar: control+2 = 2 AND >=1 stack config → **NO-GO** (0 < 2). Never
  re-scored.

### SECONDARY (reported)
- Wave-5 doors: control 1/16 (68812-lead, village-lost d166) vs stack
  2/16 (68812-belong d135 + 68812-lead d132, both village-lost) — the
  defer5gate "momentary coincidence" again: doors opened, villages died
  within the run.
- defer4 bar (1 living w3+ killer): control 5/16, stack 3/16.

### Formation contrast (the composition question)
- Distinct wave-4+ killer vids, per-pair sum (formation arm's PRIMARY
  convention): control 6 → stack 9. Formation-alone on this identical
  seed band: 10. So the stack forms MORE than control (9 vs 6) but
  slightly FEWER than formation-alone (10) — the retention layer may
  mildly suppress formation (sheltered blooded vids can't form; shielded
  vids stand at the back of the raid draft). Within corpus noise
  (control anchor drift was nil: 6 vs 6); named next, not a claim.
- Engagement (wave-4 fights with >=2 formation-affirmed companions):
  control 0/16 configs, stack 9/16 configs — the formation leg fired
  (vfTele: 10 formation days, 3 commits, 5 w4Fights with companions,
  24 softens, 3 overshoot holds).
- Retention engagement: 4/16 stack configs with >=1 named retention
  action (68806-belong [shield,unshield], 68806-lead [shield],
  68812-belong [7: shield×2, heal, unshield×2, shield, unshield],
  68812-lead [shield,unshield]) — the retention leg fired where blooded
  vids survived the kill day.

### Why no simultaneity (autopsy)
- 68806-belong / 68806-lead: Jordan blooded d165/d178, SHIELDED by the
  layer, alive at d181 (village SURVIVED). One living veteran each —
  formation never produced a second one on these configs.
- 68808-lead: Felix + Tashi blooded d133, both DEAD d133, village-lost
  d133 — retention never fired (vrTrace 0): the kills happened on the
  day the village died. Retention cannot protect against village-loss.
- 68812-belong: Ethel d72, Logan d79, Landon d83, Ethel d107 — all DEAD,
  village-lost d135. Retention fired 7 actions (both shielded, one
  healed) but the whole village died — attrition protection ≠ village
  survival.
- 68812-lead: Logan d75/d80, Miguel d89 — all DEAD, village-lost d132,
  retention shielded/unshielded. The door opened d89 (the coincidence)
  and the village was gone d132.
- The composition's bind: formation makes ~1 veteran per config (thin),
  never 2 living at once; where formation made 3–4 (s68812), the village
  died outright — the retention mechanism's target scenario (days of
  post-kill attritional combat) never arose on this band.

### GUARDRAILS: all PASS
- median survival paired diff: 0d (bar >= -15d) — PASS
- starvation: control 15 vs stack 12 (bar <= control+2) — PASS
- new death kinds: The Algorithm (1 event), dehydration (2), thirst (1).
  dehydration hits the ≥2-event rule exactly — but starvation (the
  binding food guardrail) is DOWN on stack and the water deaths are 3
  events across 32 configs with no food path (retention's honest cost is
  lost production while sheltered, documented in the retention header).
  Filed as a watch item for the next run, not lever harm.
- §15 panel (descriptive-by-construction, env-gated):
  decision=review_required; regression_watch on table (-0.125) and
  communityLost (+0.125) on leadfeast only — denominator noise on 8
  cases each, same class as the formation arm. Panel .md attached:
  evidence/2026-10-23/vetstack-panel-primary.md.

### WALL (both arms)
- control: national 4/16, table 7/16, wins 0/16, wave4 11/16, wave5 1/16, median 133d
- stack: national 5/16, table 6/16, wins 0/16, wave4 11/16, wave5 2/16, median 132d
- The wall doesn't move on wins (structural on SEATDRIVE=0); the door
  count doubles (1→2) but both doors are coincidences over dead villages.

## Sense verdict (SENSE-TESTING LAW) — PASS

scripts/sense-vetstack.js replayed s68812-lead (stack) with live
narration; transcript at evidence/2026-10-23/sense-vetstack-68812-lead.txt.

- d75 kill: "Logan strikes the Eater. FEASTED ×2.03: Logan's blow carries
  the feast. Logan hits eater for 107. The Eater falls." → "Logan just
  put down The Eater... on CAMERA. That's a veteran kill, folks. REMEMBER
  the name." Earned, visible, feasted.
- d75 retention: "🛡️ Logan is blooded — the watch marks them shielded:
  the village's fights will spend others first. Logan hears the order and
  goes quiet. 'You want me breathing for the door that matters.'" People
  protecting people, in their own register.
- The hold beats are knowledge-gated: "📡 The fifth draft stays in the
  wings — blood your fighters (0 of 2 veterans)" → "(1 of 2 veterans)" —
  the wave title is never named; the bar is the fiction.
- d89: "📡 RATINGS ARE UP... the Producers have greenlit the fifth draft.
  Wave 5 talent has been released." — the door opens as a moment, while
  the village is visibly fraying (Miguel dead d109, tribute presses from
  three linked villages after Landon's death).

CAVEAT (honest): the replay diverged from the sweep trajectory (replay:
Miguel kills Spool d77 + Nino kills d103; sweep JSON: Miguel d89 only).
Cause: the sense policy id ('-vetstack-sense') differs from the sweep's
('-vetstack') — policy ids can steer engine decisions. The beats are the
same beats the engine voices; the transcript is sense evidence, not a
re-run of the corpus. Filed to the findings backlog.

VERDICT: PASS. The composition reads as brave people being protected by
their village — and the village still losing them to the larger collapse.

## Metric review (§14 — the bars held; the instrument had a bad day)

1. The PRIMARY bar (stack >= control+2 AND >=1) was set against an
   unknown control; control came in at 0/16 co-satisfactions — the bar
   (2) was fair, not tuned. NO-GO stands as measured, never re-scored.
2. **Write-denial incident (infrastructure, not the metric):** during
   analysis, `fs.writeFileSync` to
   evidence/2026-10-23/perseed-vetstack/vetstack-verdict.json silently
   stopped landing (proven with a canary probe: write reported success,
   content unchanged — the selective write-denial class that destroyed
   the convergence tracker twice today). The on-disk verdict.json was
   STALE (its `guardrails.pass:false` contradicts the code's own
   in-memory computation, `pass:true` on pairedDiff=0) and has been
   DELETED (verified absent via find+ls) so no one reads it. All numbers
   in this evidence file are read from the analyzer's STDOUT, the
   trustworthy channel. Next run: write verdicts to two paths or hash
   the file after write.
3. The new-death-kinds guardrail (≥2-event rule, inherited from the
   retention arm): dehydration hit exactly 2 events. The rule held as a
   flag, not a fail — reported as a watch item. No metric change.
4. The sense-replay divergence (policy id steering): the formation arm's
   trajectory-safety claim for narration:true replays assumed identical
   policy construction; this run shows the id matters. Next sense run:
   build the sense policy with the EXACT sweep id.
5. No metric proved wrong this run. Nothing re-scored; the bars above
   are the verdict.

## Telemetry deviation check (Steve 2026-10-13)

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale-wall.json
--current 'evidence/2026-10-23/perseed-vetstack/<arm>/*.json'
--metrics national,table,wins,exiled` fired LOUD on both arms:
control: national 12→4, wins 16→0; stack: table 16→6, wins 16→0.

**Investigated — all EXPLAINED, no bug, baseline NOT rolled.** Same
regime artifact as every arm on this substrate (formation,
vetkill-autopsy, feastdisc-confirm, armored15-confirm): the
scale-wall.json baseline's own `_regime.note` says wins are structurally
~0 on the non-seat substrate; this corpus is SEATDRIVE=0 (the table win
lands ~d90-134 and the run ENDS before villagers blood themselves);
the baseline is the winseat regime (SEATDRIVE=1). All four LOUD lines
are regime artifacts (+ n-mismatch).

## Village assessment

The villages on the formation band are formation-rich and retention-poor
targets: the stack forms veterans (9 vs 6 per-pair-sum) and the retention
layer fires (4/16 configs, 12 named actions), but the two never meet in
one living moment. On the configs that blood killers, the village either
survives with exactly one veteran (68806 — the shield held, nobody else
stepped up) or dies outright (68808, 68812 — retention's protections are
real but the village is gone). The defer5 bar asks for TWO living
veterans; the band produces one-or-zero, or a graveyard. The coincidence
trap's veterans half is now measured end-to-end: formation works,
retention works, simultaneity doesn't — the missing piece is either
thicker formation (2+ veterans per config) or village survival through
the wave-4 window (the retention layer's protections end where village
collapse begins).

## Named nexts

1. **Formation thickness, not just formation.** The defer5 bar needs 2
   LIVING veterans at once. The stack never produced 2 on one config.
   Next arm: a formation-thickening lever (a second forming slot that
   fires when the first veteran is already blooded — the "pair them"
   beat), measured on this same band with the same co-satisfaction
   primary.
2. **Retention vs formation interference (9 vs 10).** Formation-alone
   formed 10 distinct vids on this band; the stack formed 9. The
   retention shelter pulls blooded vids out of the fight pool. One-vid
   delta, within noise — but a formation-thickening arm should measure
   whether retention actively suppresses the second formation.
3. **Village-loss swallows retention.** On 3/5 blooded stack configs the
   village died outright. The retention mechanism's target (attritional
   post-kill combat) never arose. The wall's real binder may be village
   survival through the wave-4 window, not veteran survival — lever-1
   (combat & death share) territory.
4. **dehydration watch (2 events, ≥2-event rule).** Named for the next
   run's guardrail check; below concern now.
5. **Sense-replay policy-id steering.** Filed to the findings backlog —
   narration:true replays must use the EXACT sweep policy id.

## Blanks filled / documented

- FILLED (measured): the composition does NOT produce defer5
  co-satisfaction (0/16 both arms) — the veterans-half levers don't
  compose into the defer5 leg on the formation band. Both halves work
  (formation 9 vs 6, retention fires 12 actions on 4 configs); the
  missing piece is simultaneity.
- DOCUMENTED: retention may mildly suppress formation (9 vs 10); the
  sense-replay policy-id divergence; the write-denial incident and its
  workaround (verdicts from stdout).
- steve-call: none — no design ruling needed; the NO-GO is a
  measurement, not a fork.

## Instruments committed (namespace vetstack)

- scripts/vetstack-sweep.js — the 32-config census (stackFor composition)
- scripts/vetstack-analyze.js — the offline judge (living-join, per-pair
  sum, engagement, guardrails, wall)
- scripts/test-vetstack.js — proof (21/21 GREEN)
- scripts/sense-vetstack.js — narration replay
- scripts/build-vetstack-panels.js — §15 panel builder
- evidence/2026-10-23/perseed-vetstack/{control,stack}/ — the corpus (32)
- evidence/2026-10-23/vetstack-panel-primary.{json,md} — §15 compare
- evidence/2026-10-23/sense-vetstack-68812-lead.txt — sense transcript
- evidence/2026-10-23/sim-vetstack.md — this file
- NOTE: scripts/policies/vetretention.js is SWEEP-ONLY (from branch
  sim-vetretention) and is DELETED before commit — this branch carries
  ZERO policy edits.
