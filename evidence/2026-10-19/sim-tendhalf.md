# sim-tendhalf — TEND-ONLY window support (flesh-out loop, 2026-10-19, ARM sim-tendhalf)

Run: fleshout-20261019T1015Z, arm sim-tendhalf. Axis: scale-onramp (the blocking axis).
TENDHALF LEVER RUN — isolates the ONE unindicted half of the KILLED sim-winsupport-decomp layer
(evidence/2026-10-19/sim-winsupport-decomp.md, named next #2).
New policy-side file: scripts/policies/tendhalf.js (TEND-ONLY layer). Zero src/js changes.
Reuses wsWindowLive from scripts/policies/winsupport.js (parked file — NOT modified).

Lineage: sim-windowsurvive named window SURVIVAL support (field recovery for wave-4-engaged
fighters, raid defense during deferral); sim-winsupport built the two-half layer (post-fight
triage extract+tend + raid-night posture rest); sim-winsupport-decomp KILLED it concept-dead —
all 4 variants NO-GO on 160 fresh-seed runs (evidence/2026-10-19/sim-winsupport-decomp.md):
(a) the parked +15d median-survival signal did NOT replicate on fresh seeds (seed noise);
(b) window deaths ROSE on every armed variant — the layer adds window activity without saving anyone;
(c) the triage arm's travelTo EXTRACT flow is indicted (wild deaths 49 vs 41, raid 76 vs 59);
(d) the posture rest verb is unhelpful (-6d, guardrail-clean);
(e) the pantry-floor gate proved the 40-kcal rest verb is NOT the cost carrier.
The ONE unindicted half is TEND (tending wounded companions at haven) — never isolated from extract.

QUESTION TO ANSWER: is TEND-ONLY safe and effective in the def5 window — does the cheapest
defense half move median survival without moving anyone?

Canon: docs/CANON.md, docs/MONSTER-WAVES.md (wave law; wave-4 bands 35–95 dmg / 850–1500 HP;
the readiness gate; the def5 window is where this layer lives).

## Design calls (documented — the tend-only isolation)

1. **Window gate:** reuses `wsWindowLive` from scripts/policies/winsupport.js (the parked file —
   NOT modified). `standingDeferral(5).deferred` is the def5 window the windowsurvive diagnostic
   attributed (median 78d, 72 deaths). No drift surface: the predicate is imported, not copied.
2. **TEND-ONLY:** window live + at haven → wounded party companions (<70 on the village health map)
   get the real `Game.tendVillager` verb (+25 wound heal, 32 ticks of real care), capped 2/day.
   The wounded stay where they are; nobody is moved. The scholar's own vid is never tended.
3. **NOTHING ELSE:** no travelTo extract (the decomp indictment is why this layer exists),
   no rest verb (posture proved unhelpful), no fight recording (the fight path is pure delegation —
   no _wsFight keys, no triage flags, nothing in ctx but the tend counter).
4. **Env gate:** TENDHALF=1 opts in (default OFF). Gate off = pure delegation on every path
   (proof-pinned); DET pins TENDHALF=1 byte-identical to unset while the window never opens.
5. **Zero src/js changes.** Policy-side only.

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the sweep)

**Arms (2, paired on identical seeds):**
- control — the substrate only, re-swept on current master
- tendhalf — TENDHALF=1 (the TEND-ONLY layer), same substrate

**PRIMARY:** median survival days, armed vs the re-swept control
(pooled: 16 seeds × {leadfeast, belongfeast} = 32 runs/arm).

**GO:** median survival +10d armed vs control (the parked/decomp bar).

**GUARDRAILS (REVISED per sim-winsupport-decomp metric review #3):**
- table ≥ control − 2
- no new death modes — a new cause counts only at ≥2 events; named-monster-lottery causes exempt
  (nameToWave lookup hits — the monster lottery is present in the design by definition)
- survival floor: armed median ≥ control median − 10d
- national not degraded (armed ≥ control)
- wave-4 not degraded (armed ≥ control)
- (wave-5 reported informational — the wall census is the axis read)

**Horizon:** 180d death-aware (dead villages stop simulating).

**Seeds:** 16 FRESH 65201–65216 (verified: zero filename hits in evidence/2026-10-19/perseed-*/ and scripts/;
no mentions outside this run's own new files). IDENTICAL seeds on both arms (paired before/after).

**Substrate:** withSeatDrive(withWinDefer(withVetrel(withReposition(TF base)))) on {leadfeast, belongfeast}
(+ tendhalf layer outside on the armed arm), SEATDRIVE=0,
env FEASTSCALE_R13=1 TRIBFLOOR=1 SUCCGRACE=1 RAIDDENSITY=1 WINPURSUIT=1 WINDEFER=1 NODEWITNESS=1 VETREL=1,
TENDHALF=1 on the armed arm only.

**Base-relativity:** the control is RE-SWEPT on current master alongside the armed arm, never compared
against any parked corpus.

**Pilot gate:** 8 seeds (65201–65208) before/after before ANY confirm spend. Kill fast on a clear miss.
(Confirm = remaining 8 seeds 65209–65216.)

**Instrument:** scripts/probe-tendhalf-20261019.js (2-arm sweep fork of probe-winsupportdecomp-20261019.js:
identical policy stack + identical death-capture instrument + identical death-channel classifier),
scripts/analyze-tendhalf-20261019.js (2-arm shift comparison against the pre-registered bars —
REVISED guardrails), scripts/build-tendhalf-panels.js (1 × §15 balanced-panel compare:
control vs tendhalf — the panel is the instrument, the pre-registered threshold is the judge),
scripts/tendhalf-transcripts-20261019.js (SAY-line probe for sense-testing, committed this run —
the decomp run lost its probe script uncommitted; not repeated here),
scripts/test-tendhalf-20261019.js (proof: GATE + TEND + TEND-BOUND + NOTHING-ELSE fixtures, SMOKE, DET;
KILL-PROTOCOL INFO-SKIP + verdict pin added at finish).

**No [needs-eyes]:** policy-side sim lever, no player-facing change.

## Metric review

(pre-registered doubts — for the NEXT run if the metric proves wrong; the GO bar above binds THIS run, §14)
1. **Median survival may under-read a window lever** (carried from sim-winsupport-decomp metric review
   #4): if the layer converts window deaths into later non-window deaths, median survival moves less
   than the window-death count. The taxonomy per arm is the secondary read — the GO bar stays median survival.
2. **The +10d bar vs the −58d vetrel cost** (carried): +10d stays deliberately modest for a pure-defense half.
3. **Leadfeast/belongfeast asymmetry** (carried): the window is a leadfeast phenomenon. Pooled median is
   the pre-registered judge; the per-policy split is reported honestly.
4. **The replication lesson** (new): sim-winsupport-decomp showed the parked +15d did not replicate on
   fresh seeds. The tendhalf question stands on its own fresh-seed corpus — no parked point estimate
   is carried as an expectation; the +10d bar is the bar, not a prediction.

## Results

Pilot sweep complete: 2 arms x 16 runs (8 fresh seeds 65201–65208 x {leadfeast, belongfeast}, paired on identical seeds, 180d death-aware, 0 bad per-seed files). TENDHALF NO-GO against the binding pre-registered bars:

| variant | control med | armed med | delta | primary +10d | guardrails | verdict |
|---|---|---|---|---|---|---|
| tendhalf | 117d | 110d | -7d | NO-GO | all PASS (noNewDeathModes; exempt: dehydration x1 singleton) | **NO-GO (primary miss, guardrails hold — killed)** |

KILL-PROTOCOL executed at pilot: the +10d bar was missed by 17d in the wrong direction — a clear miss per the pilot gate ("Kill levers that fail the sniff test — never run 12–16 seeds on an invisible effect"). No confirm spend. scripts/policies/tendhalf.js deleted zero-trace; instruments + evidence land only.

Wall numbers (pilot corpus, 16 runs/arm): wins 0/16 on BOTH arms (control included); wave-5 0/16 on both; national 11 control / 12 tendhalf; table 13/13; wave-4 14/14; exiled 0/0. The scale wall is intact on both arms — the def5 window eats 17–18 of every 20 door-reachers (control: 8 died of 10 door-reachers; tendhalf: 9 of 10).

§15 balanced panel (control vs tendhalf, 16+16 rows, pilot corpus): decision=review_required on both policies; no regression_signal anywhere; every observed metric no_material_signal (national +0.125 leadfeast, CI 0 to 0.375 — touches 0; table invitation 0.875 vs 0.875 identical; survival30/60 1.0 vs 1.0 / 0.875 vs 0.875). The panel instrument corroborates the analyzer: nothing moved.

The deeper read: the window was live on both arms (10/16 door-reachers each; the layer had opportunity — tend lines fire in the armed transcripts). Window deaths were FEWER on tendhalf (57 vs 63 control) yet median survival was LOWER (110 vs 117). The scholar share of window deaths rose (36 vs 32) while villager deaths fell (21 vs 31). Channels: raid 40 vs 42, wild 11 vs 9, expedition 2 vs 3 — no movement pathology (the layer moved nobody by design). Tending healed wounds; the window kept killing through fresh violence faster than tending could compound.

Telemetry deviation check (loop step 10): baseline scale-wall.json (WINSEAT regime, ~100%-win) fires spurious LOUD "wins disappeared" on any pre-seat corpus — the regime artifact its own _regime block warns about; NOT a deviation. Against the correct regime baseline scale-wall-preseat.json (decomp control, 32 runs: national 21, table 24, won 0, exiled 0), my per-policy slices show only the n-mismatch scale artifact (observed 5–6/8 national ≈ 10.5–12/16 scaled vs 21/32 baseline; 6–7/8 table vs 24/32; won 0; exiled 0) — no real deviation on either arm. Baseline NOT rolled forward (pilot-kill corpus; the decomp control baseline stands).

## Village assessment

Plain words: the villages look the same with or without the layer. They are rich when they die (pantry 28k–50k at the recorded deaths, hungry-streak 0 — they do not starve; they get raided and ambushed). The def5 window opens ~day 57 and the raids come: scholars die to raid/combat at haven, villagers to wild/monster on expeditions and hunts. Tending happened — "You clean Harpreet's wound properly — boiled water, a steady hand, wrapped tight. It'll have a chance now." — and Harpreet went back out and died in the wild to combat eight days later anyway. The layer is honest care that changes nothing: the wound channel (haven/"a wound that wouldn't close") is a trickle; the window kills by violence, not by untreated wounds. Villagers act like people throughout — hauling, gossiping, vouching chains, teaching, dying on expeditions to named monsters — and the village assessment the loop asks for is: the window-support avenue is now fully closed on measured evidence. Tend-only was the last unindicted half; it is indicted as ineffective, not as harmful.

## Sense-testing (SENSE-TESTING LAW)

Staged 4 transcripts in evidence/2026-10-19/tendhalf-transcripts/ (2 tendhalf + 2 control window runs; committed this run — the decomp gap is not repeated) and read them. Coherent throughout:

- tendhalf/leadfeast-s65208 (4566 SAY lines): door d57, window d57–98, 8 window deaths. Tend lines fire on d57–59, window-gated, haven-bound ("You clean Harpreet's wound properly — boiled water, a steady hand, wrapped tight. It'll have a chance now."; also Pavel). Harpreet is tended, goes ranging, dies d65 to wild/combat: "The Codex turns a page on its own. Harpreet Murugesan is dead. You didn't ask. It knew." / "Harpreet was under your wing — learning, getting sharper — and now they're gone. The village doesn't say it, but you feel the trust go. (Village trust -8.)" / "The mantle passes to Pavel Dubinin." A meaningful tragedy, not a silent counter. The village keeps a vouching chain, a teaching moment ("Harpreet was watching. Now they know Giant Water Lily too."), pantry triage ("The pantry can't take more; the wild will keep.").
- control/leadfeast-s65204 (6897 SAY lines): door d57, window d57–118, 17 window deaths — the heaviest window in the pilot. Scholars die to raids at haven (Jae d89, Dale d97, Jovan d99, Ivy + Omar d118); villagers to wild/monster and raid/monster; Njuguna dies haven/"a wound that wouldn't close" d108 — the exact wound surface TEND targets, untreated on control, and it bought one death in 17. The System voice is intact ("You bind the wound and hope. The altar considers. Hoping is not a currency the altar accepts — but it lets you walk.").
- tendhalf/belongfeast-s65208, control/belongfeast-s65208: same window shape, same coherence.

No senselessness found. The mechanism is honest and legible; it just doesn't move survival. The villagers are people either way.

## Named nexts

1. The window-support avenue is CLOSED on measured evidence: full (parked, non-replicated), triage (indicted — extraction kills), posture (unhelpful), gated (pantry floor not the carrier), and now tend-only (ineffective, not harmful — 5/5 NO-GO across 192 runs). Do not revive any variant of "support the window with window verbs."
2. The remaining window signal is the window-death taxonomy itself: raids are ~40/60 window deaths, scholars die more than villagers, and they die rich not starving. The next window attempt must be a raid-defense mechanism that doesn't move people — or the window is accepted as the scale tax and the on-ramp work moves elsewhere (levers 0/2/8 as lenses on the scale wall directly, per the standing directive).
3. The sim-presencetend sibling arm (presence join + tend-only, same seeds/policies) is still live in this run's claim — its recombined result will say whether tend has any interaction value at all; watch that verdict before closing the tend book entirely.

## Metric review (addition from the finish)

5. **The revised no-new-death-modes guardrail behaved as designed.** It exempted exactly one singleton ("dehydration" x1, tendhalf/belongfeast) and fired on nothing — the named-monster exemption was untested this run (no named-monster singletons appeared). The revision holds for the next run.
6. **Median survival vs window deaths diverged again** (decomp metric review #4, now inverted): tendhalf had FEWER window deaths (57 vs 63) but LOWER median survival (110 vs 117). The +10d bar judged the arm correctly anyway (the bar is the bar), but the taxonomy and the median are now disagreeing in both directions across runs — the next window arm should pre-register a joint primary (median survival AND window deaths) or accept that the median is a noisy judge for window work.

## Out-of-arm findings

(none — stayed on axis. The panel's "Bearer <redacted>" display in the compare md is a display-layer redaction of the contract label "bearer survives"; bytes on disk are clean — verified, no action.)

## Convergence

Axis: scale-onramp. This arm: **killed at pilot (concept-dead)**. scale-onramp stays converging: the entire window-support avenue is now closed on measured evidence (5/5 variants NO-GO across 192 runs, including this tend-only isolation); the veteran-production avenue is closed (0-for-10 line, presence-confirm NO-GO); the window-survival surface is measured (raids first, scholars die, rich-not-starving, the window eats ~9/10 door-reachers). The wall numbers are unchanged: wins 0/16, wave-5 0/16, national 11–12/16, table 13/16. The sim-presencetend sibling arm is the remaining live window bet. Directive lift remains a Steve call.

## Files

- scripts/policies/tendhalf.js — the TEND-ONLY layer (this run; DELETED per kill protocol if NO-GO)
- scripts/test-tendhalf-20261019.js — proof (this run; KILL-PROTOCOL INFO-SKIP + verdict pin added at finish)
- scripts/probe-tendhalf-20261019.js — 2-arm sweep fork (this run)
- scripts/analyze-tendhalf-20261019.js — 2-arm shift comparison, REVISED guardrails (this run)
- scripts/build-tendhalf-panels.js — 1 × §15 panel compare (this run)
- scripts/tendhalf-transcripts-20261019.js — SAY-line probe (this run; COMMITTED — the decomp lesson)
- evidence/2026-10-19/perseed-tendhalf/{control,tendhalf}/{leadfeast,belongfeast}/s65201–s65216.json — 64 per-seed JSONs (this run)
- evidence/2026-10-19/tendhalf-corpus-summary.json + tendhalf-arm-shift.md (this run)
- evidence/2026-10-19/tendhalf-panel-primary-before.json.gz + tendhalf-panel-primary-after-tendhalf.json.gz + tendhalf-panel-primary-control-vs-tendhalf.{json,md} — §15 panel compare (this run)
- evidence/2026-10-19/tendhalf-transcripts/{control,tendhalf}-<policy>-s<seed>.txt — sense-testing transcripts (this run)
- evidence/2026-10-19/sim-tendhalf.md — this file
- ZERO src/js changes (policy-side only)
