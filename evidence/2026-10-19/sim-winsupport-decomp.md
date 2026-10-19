# sim-winsupport-decomp — decomposing the parked window-support arm (flesh-out loop, 2026-10-19, ARM sim-winsupport-decomp)

Run: fleshout-20261019T08xxZ, arm sim-winsupport-decomp. Axis: scale-onramp (the blocking axis).
DECOMP LEVER RUN — decomposes the PARKED sim-winsupport arm (landed ad23720f3, evidence/2026-10-19/sim-winsupport.md).
New policy-side file: scripts/policies/winsupportdecomp.js (split-gate layer). Zero src/js changes.

Lineage: sim-windowsurvive named window SURVIVAL support (field recovery for wave-4-engaged fighters, raid defense during deferral).
The parked layer (scripts/policies/winsupport.js, WINSUPPORT=1, default OFF) has two halves:
(a) POST-FIGHT TRIAGE (wave-4+ fight recorder; scholar takes ≥25% maxHp in one wave-4+ fight → 2-day triage: EXTRACT wounded fighters home via honest travelTo, TEND wounded companions at haven, capped 2/day)
(b) RAID-NIGHT POSTURE (one honest rest/day at Haven when scholar wounded and rest can heal: doAction('rest'), +5 HP, 96 ticks, 40 kcal).
Parked verdict: PRIMARY GO (+15d median survival 116 vs 101, bar +10d — first real window-axis signal); guardrail breaches
(table 9/16 vs 11/16, 1 starvation death on belongfeast-s64008) classified METRIC-BROKEN (knife-edge at n=16, within noise).

QUESTION TO ANSWER: which half carries the starvation/table cost — triage (travel-to-Haven) or posture (rest verb)? Does the pantry-floor gate remove it?

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law; wave-4 bands 35–95 dmg / 850–1500 HP; the readiness gate + VETERANS bar — design call #4;
the def5 window is where this layer lives).

## Design calls (documented — the decomposition)

**Split gate (mine):** `WINSUPPORT_ARM=triage|posture|gated` on top of `WINSUPPORT=1` selects the decomposition arm in
scripts/policies/winsupportdecomp.js. Gate-off (WINSUPPORT unset) = pure delegation for every arm, ctx untouched (proof-pinned).
The parked file scripts/policies/winsupport.js is NOT modified — the `winsupport-full` arm runs it as-is, so "as-is" is auditable.
The decomp layer reuses the parked file's exported primitives (raidPosture, triageDay, recordFightStart, closeFightRecord,
winsupportOn, wsWindowLive) — no logic duplicated, no drift surface.
- **triage:** fight → recordFightStart + base.fight; daily → base.daily + closeFightRecord + (window live ? triageDay); upkeep → base.upkeep only. The posture half is entirely absent — no rest verb ever fires from this arm.
- **posture:** upkeep → base.upkeep + raidPosture; daily → base.daily; fight → base.fight. No fight recording at all — the triage half is entirely absent (the recorder is inert without triageDay, so skipping it keeps the arm honest).
- **gated:** the full parked stack + PANTRY-FLOOR GATE on the rest verb: skip the 40-kcal doAction('rest') when the engine's own live pantry read
  `Game.pantryKcalLive(Game.state.village)` is below 4000 kcal — the engine's own "stores running thin" line (game.js talkReason: villagers raise
  "The stores. Have you looked at the stores? We're running thin." below 4000). If the read throws, fail OPEN to parked behavior (treat as no floor)
  and count it. The gate covers the rest verb only — the finisher's named next #2 names the rest verb, not travel; if triage turns out to be the
  cost carrier, a rest-only gate not removing the cost is an honest, reportable result.

**Seed budget (mine):** 16 seeds/arm — the finisher's "16–24 for guardrail reads" — × {leadfeast, belongfeast} = 32 runs/arm, 160 runs total across
5 arms. Justification: doubles the parked corpus (16/arm) for the tolerance-band guardrails; 160 runs × ~3–4s/seed-run ≈ 10 min compute in
10 parallel processes (5 arms × 2 policies, separate node processes — never two harnesses in one process).

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the sweep)

**Arms (5, paired on identical seeds):**
- control — the parked substrate re-swept on current master (no WINSUPPORT)
- winsupport-full — WINSUPPORT=1, the parked layer as-is (replication check: should reproduce the parked direction on fresh seeds)
- winsupport-triage — WINSUPPORT=1 + WINSUPPORT_ARM=triage (triage half only)
- winsupport-posture — WINSUPPORT=1 + WINSUPPORT_ARM=posture (posture half only)
- winsupport-gated — WINSUPPORT=1 + WINSUPPORT_ARM=gated (full + pantry-floor gate on the rest verb)

**PRIMARY (per armed variant):** median survival days, armed vs the re-swept control (pooled: 16 seeds × {leadfeast, belongfeast} = 32 runs/arm).

**GO (per armed variant):** median survival +10d armed vs control (the parked bar).

**GUARDRAILS (per armed variant — the finisher's revised metric, tolerance bands):**
- table ≥ control − 2
- no new death modes (the armed cause-space introduces no cause absent on control)
- survival floor: armed median ≥ control median − 10d
- national not degraded (armed ≥ control)
- wave-4 not degraded (armed ≥ control)
- (wave-5 reported informational — the parked run gated it; the wall census is the axis read)

**Horizon:** 180d death-aware (dead villages stop simulating).

**Seeds:** 16 FRESH 65001–65016 (verified: zero filename hits in evidence/2026-10-19/perseed-*/ and scripts/; the 64xxx space is crowded — spikechar-b, windowsurvive, vetrel1 all drew there).
IDENTICAL seeds on all 5 arms (paired before/after).

**Substrate:** withSeatDrive(withWinDefer(withVetrel(withReposition(TF base)))) on {leadfeast, belongfeast} (+ the arm layer outside), SEATDRIVE=0,
env FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 NODEWITNESS=1 VETREL=1, WINSUPPORT=1 on armed arms only,
WINSUPPORT_ARM={triage,posture,gated} on the decomp arms only.

**Base-relativity:** the control is RE-SWEPT on current master alongside the armed arms, never compared against the parked corpus numbers.

**Instrument:** scripts/probe-winsupportdecomp-20261019.js (fork of probe-winsupport-20261019.js: identical policy stack + identical pure
death-capture reads + identical death-channel classifier — the one deliberate change: the 5-arm dimension replacing the 2-arm one; the original
is untouched), scripts/analyze-winsupportdecomp-20261019.js (5-arm shift comparison against the pre-registered bars),
scripts/build-winsupportdecomp-panels.js (4 × §15 balanced-panel compares: each armed variant vs control — the panel is the instrument,
the pre-registered threshold is the judge), scripts/winsupportdecomp-transcripts-20261019.js (SAY-line probe for sense-testing),
scripts/test-winsupportdecomp-20261019.js (proof: GATE + ARM-SPLIT + TRIAGE + POSTURE + TEND + EXTRACT + PANTRY-FLOOR fixtures, SMOKE, DET).

**No [needs-eyes]:** policy-side sim lever, no player-facing change.

## Metric review

(pre-registered doubts — for the NEXT run if the metric proves wrong; the GO bar above binds THIS run, §14)
1. **Median survival may under-read a window lever** (parked doubt #1, carried): if the layer converts window deaths into later non-window deaths,
   median survival moves less than the window-death count. The taxonomy per arm is the secondary read — the GO bar stays median survival.
2. **The +10d bar vs the −58d vetrel cost** (parked doubt #2, carried): +10d stays deliberately modest for pure-defense halves.
3. **Leadfeast/belongfeast asymmetry** (parked doubt #3, carried): the window is a leadfeast phenomenon. Pooled median is the pre-registered judge;
   the per-policy split is reported honestly.
4. **The full-replication arm may not reproduce +15d** (new): the parked +15d was on seeds 64001–64008; fresh seeds re-draw the noise. If
   winsupport-full lands far from +15d, the decomp read (which half carries the cost) still stands on the fresh-seed corpus — the question is
   about the cost halves, not re-proving the parked point estimate.

## Results

160 runs complete (5 arms x 32: 16 fresh seeds 65001–65016 x {leadfeast, belongfeast}, paired on identical seeds, 180d death-aware, 0 bad per-seed files). All four armed variants NO-GO against the binding pre-registered bars:

| variant | control med | armed med | delta | primary +10d | guardrails | verdict |
|---|---|---|---|---|---|---|
| winsupport-full | 110d | 103d | -7d | NO-GO | national FAIL (20 vs 21), table FAIL (20 vs 24, band >=22), wave-4 FAIL (25 vs 26) | **NO-GO (guardrail breach — killed)** |
| winsupport-triage | 110d | 111d | +1d | NO-GO | new death mode: "The Reunion" (1 event) | **NO-GO (guardrail breach — killed)** |
| winsupport-posture | 110d | 104d | -6d | NO-GO | all PASS | **NO-GO (primary miss, guardrails hold — killed)** |
| winsupport-gated | 110d | 103d | -7d | NO-GO | same breaches as full | **NO-GO (guardrail breach — killed)** |

Wall numbers: wins 0/32 on ALL arms (control included); wave-5 0/32 except triage 1/32 (informational single event); national 20–22/32; table 20–24/32.

§15 balanced panels (4 x control-vs-variant, built from the committed corpus this finish): full and gated show `table: regression_signal` (delta=-0.3125, CI [-0.5625,-0.0625]) on leadfeast; triage and posture show only `regression_watch` (CI touches 0). The panel instrument corroborates the analyzer's guardrail verdicts.

The decomp question is answered, and the headline is the replication failure: **the parked +15d did not replicate** — winsupport-full on fresh seeds is -7d, and winsupport-gated (full + pantry-floor gate) is byte-identical in outcome (-7d, same guardrail breaches). The pantry-floor gate did NOT remove the cost, so the 40-kcal rest verb is NOT the cost carrier (metric review #4 anticipated exactly this). Triage introduced one new death mode ("The Reunion", expedition channel, day 97 — see sense-testing: reads as named-monster lottery noise, not a layer pathology). Posture was guardrail-clean and simply did nothing (-6d).

The deeper read: window deaths INCREASED on every armed variant (full 129, triage 139, posture 126, gated 128 vs control 113; raids 59→76–84). The layer adds window activity — extraction travel, posture rests, fight recording — without saving anyone. The window-support concept as built is killed concept-dead, not metric-broken.

## Village assessment

Plain words: the villages look the same with or without the layer, just slightly shorter-lived with it. They are rich when they die — pantry 28k–50k at the recorded deaths, hungry-streak 0 — they do not starve; they get raided and ambushed. The def5 window eats 15–18 of every 20 door-reachers (median 40d hold, per the w5path census). National arrives 20–21/32, the table 20–24/32, wins 0/32 everywhere — the scale wall is intact on every arm. The triage arm's extraction (travelTo wounded fighters home) moved people during the raid-heavy window and the window killed more of them in the wild (49 vs 41) and to raids (76 vs 59). The posture arm's once-a-day rest never moved anyone and never helped anyone. Villagers act like people throughout — they haul, they rest, they die on expeditions to named monsters — the layer just gave them more ways to be in the wrong place.

## Sense-testing (SENSE-TESTING LAW)

Read the parked run's staged transcript (control-belongfeast-s64008, 4356 SAY lines, the seed with the starvation death): coherent throughout. The System voice is intact ("You move it yourself, one quiet trip at a time through the dark. Slow. Your back files a formal complaint."), show beats land (The Cache win, care package, synergy discovery), combat reads clean ("You STRIKE the wolf for 76 (Hardlight knife)"), loot-as-action is honored ("search the body if you want the meat... meat rots where it lies"), and villagers react like people ("You came back bloody. Nobody asks. Someone saves you the good seat by the fire."). Nothing senseless.

Read the triage "new death mode" record (triage/leadfeast/s65015): Catalina, a villager, day 97, on expedition, killed by "The Reunion" (named monster), village pantry 50,424 kcal, hungry-streak 0, roster 10, scholar alive. This reads as the named-monster lottery — an expedition party meeting a named monster mid-window — not a pathology of the triage layer. The guardrail fired on a single draw at n=32; see metric review.

HONEST GAP: the SAY-line probe script (scripts/winsupportdecomp-transcripts-20261019.js) was lost with the removed worktree before commit — no fresh armed-arm transcripts were ever staged. Sense-testing for this arm rests on the parked control transcript + corpus death-attribution reads, not fresh armed transcripts. A future window arm must stage its transcripts before the tree is released.

## Named nexts

1. The window-support concept as built (post-fight triage extract/tend + raid-night posture rest) is KILLED concept-dead. Do not revive in this form — neither half moves the needle and the combination increases window deaths.
2. TEND-ONLY is the one unindicted half: tend wounded companions at haven (cap 2/day), NO travelTo extract, NO rest verb. It isolates whether tend itself is safe and effective. Pre-register with the revised guardrail (metric review #3).
3. Whatever the next window attempt is, it must not MOVE people during the window — the vetarm line (moving fighters kills them) and this kill (extraction increases wild/raid deaths) agree.
4. The window-survival surface is still the axis target: raids are 59/113 control window deaths, scholars die more than villagers (61–79 vs 50–65 across arms), and they die rich, not starving.

## Metric review (addition from the finish)

3. **The no-new-death-modes guardrail needs a frequency qualifier.** It fired on ONE "The Reunion" expedition death — a named-monster lottery draw, not a layer pathology. At n=32, single-draw noise will keep firing this. Proposed revision for the NEXT run: a new cause counts only at >=2 events, or named-monster causes are exempt (they're the monster lottery, present in the design by definition). This revision applies to the next run, not this one (§14).
4. **Median survival under-reads window levers — confirmed again.** Triage's +1d pooled median hides 139 vs 113 window deaths; the taxonomy is the honest instrument for window work. The +10d bar stands as the judge, but the taxonomy must be reported alongside, not as a footnote.

## Out-of-arm findings

(none new — stayed on axis. The replication failure is recorded in the tracker review, not the findings backlog.)

## Convergence

Axis: scale-onramp. This arm: **killed (concept-dead)**. scale-onramp stays converging: the window-support avenue is now closed on measured evidence (4/4 variants killed on 160 fresh-seed runs, parked signal not replicated); the veteran-production avenue is closed (0-for-10 line, presence-confirm NO-GO); the window-survival surface itself is measured (raids first, scholars die, rich-not-starving). The named next is tend-only or another no-movement window design. Directive lift remains a Steve call.

## STALE-LOCK RECOVERY / coordinator finish (2026-10-19 ~10:41–11:00Z)

The owning run (fleshout-20261019T0815Z) stalled with its last heartbeat at 09:27Z; at 10:41Z the heartbeat was 73 min stale, the lock was absent, and the claim was marked DEAD per the 15-min liveness rule — a false positive: the run's finisher woke at ~10:41Z, committed the kill (549a640cd), merged --ff-only at 10:41:21Z, released the tree as done-merged at 10:41:26Z, and removed it. No work was disturbed; the .DEAD marking stands as the record.

The finisher's landing was incomplete: the proof test crashed on master (no kill-protocol skip after the layer deletion), the 4 x §15 panel compares were never built, the SAY-line probe script was lost with the tree, and Results / Village assessment / Sense-testing / Named nexts / Convergence were left "(TO BE FILLED)". This commit (finish worktree sim-decompfinish) completes it: KILL-PROTOCOL INFO-SKIP + KILLED-VERDICT section added to the proof test (now 5/5 green, layer-dependent sections INFO-SKIP), verdictFor exported from the analyzer, the 4 panel compares built from the committed corpus, and this write-up. Zero src/js changes throughout.

## Files

- scripts/policies/winsupportdecomp.js — the split-gate layer (this run; DELETED per kill protocol in 549a640cd)
- scripts/test-winsupportdecomp-20261019.js — proof (this run; KILL-PROTOCOL INFO-SKIP + KILLED-VERDICT section added in the coordinator finish — 5/5 green post-kill)
- scripts/probe-winsupportdecomp-20261019.js — 5-arm sweep fork (this run)
- scripts/analyze-winsupportdecomp-20261019.js — 5-arm shift comparison (this run; verdictFor exported in the finish)
- scripts/build-winsupportdecomp-panels.js — 4 × §15 panel compares (this run; RUN in the coordinator finish — outputs below)
- ~~scripts/winsupportdecomp-transcripts-20261019.js~~ — LOST: left uncommitted in the removed tree, never landed (see STALE-LOCK RECOVERY note)
- evidence/2026-10-19/perseed-winsupportdecomp/{control,winsupport-full,winsupport-triage,winsupport-posture,winsupport-gated}/{leadfeast,belongfeast}/s65001–s65016.json — 160 per-seed JSONs (this run)
- evidence/2026-10-19/winsupportdecomp-corpus-summary.json + winsupportdecomp-arm-shift.md (this run)
- evidence/2026-10-19/winsupportdecomp-panel-primary-before.json.gz (control panel) + winsupportdecomp-panel-primary-after-{winsupport-full,winsupport-triage,winsupport-posture,winsupport-gated}.json.gz + winsupportdecomp-panel-primary-control-vs-{...}.{json,md} — §15 panel compares (built in the coordinator finish from the committed corpus)
- evidence/2026-10-19/winsupport-transcripts/control-belongfeast-s64008.txt — sense-testing read (parked run's staged transcript; no fresh armed transcripts were staged — see gap note)
- evidence/2026-10-19/sim-winsupport-decomp.md — this file (write-up completed in the coordinator finish)
- ZERO src/js changes (policy-side only)
