# sim-relaydarkcost — judged comparison of the relaydark road's pre-table perturbation cost (flesh-out loop, 2026-10-20, arm sim-relaydarkcost)

Run: fleshout-20261020T2015Z, arm sim-relaydarkcost. Axis: scale-onramp (the blocking axis).
DIAGNOSTIC — zero src/js changes, zero game eval until the sweep, zero RNG in the instrument.
Claims backlog #711 (flesh-out loop; "RELAYDARK ROAD PRE-TABLE PERTURBATION IS REAL" — association from n=1 pairs, needs a judged comparison).

File scope: scripts/sweep-relaydarkcost-20261020.js (new sweep, both arms, no tablepathdriver),
scripts/analyze-relaydarkcost-20261020.js (new attribution instrument + judge),
scripts/test-relaydarkcost-20261020.js (new proof),
evidence/2026-10-20/perseed-relaydarkcost/{control,roadarmed}/{leadfeast,belongfeast}/s<seed>.json (32 per-seed JSONs),
evidence/2026-10-20/relaydarkcost-transcripts/ (per break-pair SAY capture),
evidence/2026-10-20/sim-relaydarkcost.md (this file).

Canon: docs/CANON.md + docs/TABLE.md (the relay path resolves on the leaning meter via real relay verbs, GRADIENT law; grounding tiers and mechanical effects — FRAYING ×0.9 conversions, ESTRANGED ×0.75 + trust decay, HOLLOW ×0.6; the relay's claim price: the village loses the Bearer's hands, grounding erodes while held; deepen is +sysBond, −3 grounding, 25% backfire "a day of messages lost" + −4 grounding).

The audit that motivates this (evidence/2026-10-20/sim-wintrack-audit.md): on 2/7 relay-assigned runs the road-active trajectory broke the win the control got — belong-64205 died in the invitation window (announced d45, collapsed d69; control won feared/light), belong-64207 stalled to d182 without the table ever announcing (national d78, maxWave=3, road completed d60; control sat d154 and won). That corpus confounded the road with the tablepathdriver (door steering). This arm isolates the road: road-armed = SEATDRIVE=1 + RELAYDARK=1 (active on EVERY run), control = SEATDRIVE=1 alone, both driverless.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE any sims)

**PRIMARY (DIAG-GO):** attribution completeness — the same 100%-attribution path the wintrack audit used (doorEvents + finalsEvents + the canonical endRec.tb record; NOT the tablepathdriver walked recorder — a sibling arm is fixing that recorder this run):
- every run (32) mechanism-attributed: WIN → endRec.tb.path/branch non-null (the engine's own win record; missing = UNEXPLAINED, never guessed); NON-WIN → one of {pre-table-collapse, invitation-window-collapse, no-invitation-stall}.
- every WIN DELTA between paired runs (control vs road-armed, same seed×policy) attributed day-exact, with the road's role judged per the criteria below.
- GO threshold: **32/32 attributed, every delta attributed, 0 unexplained.** A miss is NO-GO, never re-scored (§14).

**Road-role judgment criteria (pre-registered):**
- CAUSED: the road was active pre-break (verbs > 0 or held), AND there is a day-exact chain from the road's DESIGNED effects to the break mechanism (claim price — lost Bearer <redacted>, 14-day mood mod; deepen −3 grounding, backfire −4 grounding + a day of messages lost; grounding-tier conversion decay ×0.9/×0.75 + trust decay; relay held altering comms/table systems), AND the control contrast is coherent with that chain. Butterfly/RNG divergence alone does not qualify.
- CONTRIBUTED: road active and on the path to the break, but a butterfly/RNG explanation cannot be ruled out — judged honestly, mechanism described.
- RULED-OUT: break precedes any road activity; the same mechanism breaks the control run; the road never claimed (e.g., no linked village all run); or the road went quiet (table preview staged) well before the break with no coherent pre-table chain.

**Secondary (the verdict, REPORTED not killed):** the road's COST = the count and rate of pairs where control won and road-armed lost with the break judged CAUSED (CONTRIBUTED reported separately, never folded in). The inverse (road-armed won what control lost) is reported symmetrically. The question "is the cost paid on a road players can actually walk?" is answered by the sense-test: read every win-break pair's SAY transcript and judge whether the road's verbs read as a coherent player-shaped road (choices with consequences) or as a policy-only artifact.

**Substrate (identical to the wintrack audit, minus the driver):**
FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 NODEWITNESS=1 KILLDISC=1. Seeds 64201–64208 × {leadfeast, belongfeast}. Control: RELAYDARK unset (layer delegates byte-identically). Road-armed: RELAYDARK=1 with the layer active on every run (relaydarkAll mode — one verb per day, claim → deepen → reroute-efficient → rewrite/skim, completion lean ≤ −44 / grounding ≤ 48 / darkUses ≥ 6, quiet once tablePreview() is non-null, grounding floor 32). TABLEPATHDRIVER unset in both arms. Horizon: 180d death-aware, never fixed.

**Instrument:** scripts/sweep-relaydarkcost-20261020.js (composition withSeatDrive(withWinDefer(withRelayDark(base, {active}))) — NO tablepathdriver; death-channel taxonomy copied VERBATIM from probe-tablepathdriver-20261020.js, identical-by-construction), scripts/analyze-relaydarkcost-20261020.js (pairing, deltas, the judge, the report). Sense: transcript re-runs with Game.say wrapped + sysSay restored, capture from road-claim-day through run end.

## Convergence note

scale-onramp stays the blocking axis. This run is diagnostic: no lever changed, no wall movement claimed. The verdict on the road's cost informs whether the relaydark road is judged beyond pilot.

## Results

**PRIMARY: 32/32 runs attributed, every win delta attributed, 0 unexplained — DIAG-GO.**

32 runs (8 seeds × {leadfeast, belongfeast} × {control, roadarmed}), 180d death-aware, 0 instrument errors, 0 unverifiable deaths. Wins attributed via the canonical endRec.tb.path/branch (all non-null); non-wins via the three stall classes. Delta classes: BOTH-WIN 12, BREAK 1, FIX 2, SAME-LOSS 1.

Corpus: evidence/2026-10-20/perseed-relaydarkcost/{control,roadarmed}/{leadfeast,belongfeast}/s<seed>.json. Pair bundles + per-pair judgments: evidence/2026-10-20/relaydarkcost-judgment.json. Transcripts: evidence/2026-10-20/relaydarkcost-transcripts/ (3 break/fix pairs, FIDELITY-OK).

### The judged deltas

**BREAK — leadfeast s64205: control won d90 (feared/light), armed collapsed d76 (invitation-window-collapse; announced d65, never sat). Judged: RULED-OUT (butterfly, not road-caused).**
- Road active pre-break (first claim d47 per transcript, 30 verbs: 2 deepens, 19 efficients, 5 rewrites, 4 skims). Claim chain d47→d52→d59→d76 as scholars died and successors re-claimed (claimDay in the corpus is the LAST claim — instrument note).
- The break mechanism is a pantry collapse d65→d75 (33.9k→0) into a starvation spiral (dehydration d58, starvation d64/d74/d76, thirst d72) plus combat attrition. Control's pantry held ~32–42k through the same window.
- Designed-effect audit (src/js/relay-ext.js): grounding 99 at end — fully restored by the base's human verbs, so no conversion decay (×1.0, not ×0.9); skim is +500 kcal/use food-POSITIVE (+2000 total here); 0 backfires on 2 deepens; reroute/rewrite are counters + lean + narration only (no kcal/time cost); the claim price ("loses your hands") is fiction-only — no mechanical exclusion from forage/duties anywhere in src/js. None of these can move 30k kcal.
- Pantry trajectories are byte-identical through d45 (pre-first-verb d47), then smooth compounding divergence — the RNG-butterfly signature: the road's verbs re-drew the engine's seeded stream and the armed run drew a worse forage/raid lottery. Per the pre-registered criteria (and the loop's perturbation precedent, backlog #186/#187/#225), butterfly alone does not qualify for CAUSED.
- Sense: the transcript reads as a coherent player-shaped road — claim beats, deepens, 19 efficient reroutes, rewrite/skim unlocks, holder-death successions ("Pasquale is out of the relay — the holder died"). The road is walkable; it just didn't cause this break.

**FIX — belongfeast s64201: control collapsed d90 pre-table (7 raid deaths), armed won d144 (feared/light). Judged: NOT-ROAD-CAUSED (butterfly).** The road's designed benefits (+7000 kcal from 14 skims, grounding 92) cannot explain surviving a 22-death raid grind. The armed run drew a survivable raid lottery after the desync. Symmetric standard with the BREAK.

**FIX — belongfeast s64206: control collapsed d52 pre-table (5 sickness + 1 alien), armed won d90 (feared/light). Judged: NOT-ROAD-CAUSED (butterfly).** Identical disease deaths d35–d42 in both runs (shared pre-desync trajectory); the armed run survived the surrounding lottery. Road's 21 verbs + intact grounding too small to explain surviving a 5-sickness outbreak.

**SAME-LOSS — belongfeast s64204:** both sides pre-table-collapse (d48/d49, wave 2) — no delta.

### The verdict (reported, not killed)

- **The road's COST (win-break rate attributable to the road): 0/16 CAUSED, 0/16 CONTRIBUTED.**
- Fixes judged road-caused: 0/2. Net judged road effect on wins: **0** (1 butterfly break, 2 butterfly fixes).
- The wintrack audit's 2/7 association does NOT reproduce with the driver confound removed: driverless, the road broke 1/16 and fixed 2/16 — no systematic cost signal. The audit's belong-64205/64207 associations were driver-confounded (door steering + road active only on relay-assigned runs).

### Secondary findings

1. **[instrument → relaydark.js owner] QUIET-CONTRACT GAP.** The road's "goes quiet once the invitation is staged" is implemented as `tablePreview() != null`, but `tablePreview()` is null before day 90 (the `winDayFloorOk` gate) even when the invitation IS staged (`pg.tableWaiting`). On 3/16 armed runs the invitation staged pre-d90 (d42/d49/d65) and the road kept acting through the window (`stoppedTable=0`; the quiet fired on only 2/16, both post-d90 invitations). It did not cause the break here (window verbs were benign), but the implementation under-covers the design intent. For the sibling arm that owns relaydark.js — do not fix here.
2. **The road is walkable.** 16/16 runs claimed (a linked village existed every run; 40–54 waiting days first), 9/16 completed (done=1), verbs 8–95 through the real surface (claim → deepen → reroute-efficient → rewrite/skim), lean dark (≤−40) on 13/16, darkUses 8–27. Transcripts read as a coherent player road with consequences (holder deaths, lean/garden beats, unlock narration).
3. **[observation] The two-way cost is currently near-zero in practice.** Grounding floor (32) never engaged (0/16); grounding 92–100 at end on 14/16 (31 and 46 on the other two) — the base policy's human verbs (shared meals etc.) fully out-restore the erosion (tick −1/day, deepen −3, verb −4). The dark road's pre-table price, as simmed, is paid almost entirely in RNG perturbation, not in grounding. Whether the intended "dark relay becomes what forgot food" bite should land harder pre-table is a design question for the axis, not this diagnostic.
4. **Instrument note:** `rdSummary.claimDay` is the LAST claim (scholar succession re-claims overwrite it); first-claim was recovered from transcripts for the judged pairs. Future arms needing day-exact road onset should record first-claim in the layer or read the transcript.

### Metric review

The pre-registered metric (attribution completeness, GO = 100%) held: 32/32, 0 unexplained — no re-scoring was needed or done (§14). The verdict (COST 0/16) is a judged report against the pre-registered CAUSED/CONTRIBUTED/RULED-OUT criteria, applied symmetrically to breaks and fixes. Instrument limitations recorded honestly: (a) claimDay = last claim (see note 4); (b) no per-day road state (grounding trajectory) in the daily recs — judged from end state + verb counts + transcript; (c) the butterfly-vs-designed distinction rests on the src/js designed-effect audit plus the loop's perturbation precedent, not on a second instrument.

## Convergence note

scale-onramp stays the blocking axis. This run is diagnostic: no lever changed, no wall movement claimed. Findings for the axis: (1) the relaydark road carries no measured pre-table win cost (0/16 judged) — the wintrack audit's 2/7 association was driver-confounded; (2) the road's quiet contract under-covers pre-d90 invitations (named next for the relaydark.js owner); (3) the two-way grounding cost is fully offset by the base's human verbs in sims — the dark road is currently near-free pre-table, which bounds how much "cost" it can ever exact without a design change.
