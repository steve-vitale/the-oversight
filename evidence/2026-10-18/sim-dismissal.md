# sim-dismissal — the b2 dismissal-shape census (flesh-out loop DIAGNOSTIC, 2026-10-18)

**Run:** flesh-out loop, run_id fleshout-20261018T0122Z (coordinator-assigned arm sim-dismissal; axis scale-onramp blocking). Claimed in hidden_files/lever-claims/fleshout-20261018T0122Z.json (loop A, axis scale-onramp).
**Type:** READ-ONLY DIAGNOSTIC. ZERO src/js changes, ZERO scripts/policies changes. New scripts/dismissal-instrument-20261018.js + scripts/analyze-dismissal-20261018.js + scripts/sweep-dismissal-20261018.js + scripts/test-dismissal-20261018.js + evidence/2026-10-18/ ONLY.
**Canon:** docs/CANON.md read (this file's task). Monster canon: docs/MONSTER-WAVES.md (via the trickfunnel/attrcensus arms — waves 3–5 deliberately counter-less; the b2 pool is wave-1/2 by construction). Wave-ledger mechanics read from src/js/waveLedger.js + game.js:unlockedWave() (29703-29765) + src/js/standing.js (blood source +25/point, t4=100, t5=200). No new canon invented.
**Steve's DECIDED 2026-10-17 ruling binds:** DO NOT ALIGN TRICK GATES TO FIGHT SHAPE — no gate-widening, no round-1 trick forms. Deed accounting is not gate-widening; this arm is accounting-only (counterfactual replay math, zero game-code change).

## Background (measured, not argued)

The trick funnel's bottom (sim-trickfunnel / sim-attrcensus 2026-10-17): the funnel narrows at cond→perf, but the perf→attr gap is FIGHT SHAPE, not wiring. 80 performed-but-unattributed fights classified 100%: ~49% b1 performer-died (the trick fires, the scholar dies), ~48% b2 target-fled (the trick PERFORMS, the monster disengages — the hushwolf pack scatters after the lead wolf is struck, the lockpick_raccoon takes the offered food and leaves), ~4% a2 pyrrhic path-drop (fixed: recordPyrrhicKill landed — attribution/codex half; the DEED half — should pyrrhic kills scoreLedgerKill — is pending Steve's ruling). The attribution channel is healthy (a1 tag-drop = 0 across 80 fights). The trick-execution window is 0-for-3 on survival-shaped levers (yield / screen / retire — sim-tricksurvive, sim-perfsurvive KILLED at pilot; sim-performretire pending). b2 dismissal is the remaining named blank.

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14 — BINDING, written BEFORE the sweep)

**Question:** for every dismissal fight (trick performs + target flees + 0 kills attributed), what is its deed-relevant shape — and would it have advanced a wave-unlock bar IF dismissal counted as a deed?

**Taxonomy (fixed here, never re-scored mid-run):** each b2 row carries species, trick kind, wave, monster HP state at flight (per-fighter hp/maxHp at tbEnd), counter known at start (the mastery question), result (routed|fled), n perfs.

**Counterfactual (the steve-call input):** replay the run's wave-ledger bars as if each dismissal banked a deed, under scoreLedgerKill's LEGACY semantics (perTypeCap=2 per type per wave, fight order). Two readings, reported separately:
- D1: dismissal scores the kill-base only (1 pt) — "dismissal counts as a deed, but mastery is for kills."
- D2: dismissal scores with the mastery bonus when the counter was KNOWN at fight start (2 pts — the trick was performed and known) — "the trick did the work."
The rung ladder mirrors unlockedWave() exactly (w2: day≥8 && pts1≥5; w3: day≥25 && pts2≥4; w4: w3 && gated≥t4(100); w5: w3 && gated≥t5(200) && w4faced). Standing's war source re-feeds from the counterfactual ledger (+25 per wave-3+ point); readiness bars (armored/armed/tricks/veterans) and peak ratchet are unchanged by deed-counting (trick discovery already fires on performance).

**PRIMARY (diagnostic GO, binding):** 100% of dismissal fights classified into the deed-relevant taxonomy, 0 unattributed, 0 instrument errors, and the counterfactual bar replay computed for every run. A miss is NO-GO — reported as such with the reason. **UNMEASURABLE OUT:** if the dismissal pool is empty on this substrate (0 dismissals across 32 runs), PRIMARY is marked unmeasurable honestly — the instrument is kept and the substrate that WOULD produce the pool is named. No re-scoring.

**Arms:** 8 FRESH seeds [5501–5508] × {leadfeast, belongfeast} × {control, armed} = 32 runs. Armed = withReposition(vetrelLead/vetrelBelong) with REPOSITION=1 + VETREL=1 — the task's composed dismissal-pool maximizer (reposition.js raised movement-kind performances blindside 15v6 / face_it 2v0 on prior data; vetrel.js adds companion presence on the competent courtship substrate). Control = leadfeast/belongfeast, gates unset. The composition is proven gate-off byte-identical to the bases (proof RED).
**Substrate:** competent courtship pre-seat — SEATDRIVE=0 EXPLICIT, FEASTSCALE_R13=1 (same as the attrcensus re-sweep). 180d death-aware horizon. FRESH = 0 per-seed filename hits across evidence/ (verified 2026-10-18 before the run: 5501–5508).

**Guardrails:** wall metrics within noise of the attrcensus re-sweep on this substrate (national ~3/8, table ~6/8 per 8-seed set, wins 0 — pre-seat by design); no new death mode (death-cause key sets compared); det-gate byte-identical (proof).

**The verdict this arm must produce:** a sharpened steve-call input — is the design intent that dismissal (a trick that works, non-lethally) banks wave-unlock deed credit, the b2 parallel of the a2 pyrrhic ruling? Name the exact rule text a ruling would change, give the numbers (dismissals/run, bar-flips on the counterfactual). Do NOT pick the design call — that is Steve's.

## The exact rule text a ruling would change

1. `src/js/waveLedger.js` header: `ledger_kills_only: true` — "scoreLedgerKill is fed ONLY by recordWaveKill; engagements/flees/evades score nothing."
2. `src/js/game.js` wave-unlock comment (~29703): "Engagements (faced/fled) score nothing — only kills, player or villager, via recordWaveKill -> scoreLedgerKill."
3. (Parallel, pending) `src/js/game.js` recordPyrrhicKill (~30091): pyrrhic kills deliberately do NOT call scoreLedgerKill — the a2 deed question, awaiting Steve's ruling since 2026-10-17.
Downstream of the same call: standing.js's war source (+25 per wave-3+ ledger point) feeds wave-4/5 Standing unlocks.

## Results

### Proof: scripts/test-dismissal-20261018.js — 45/45 GREEN
- PURE: classifyFights over 12 synthetic fixtures — every class (b2 routed/fled, b1, a2, attributed routed/won, won-unattributed, attribution-gap, unattributed, instrument-error, not-in-universe, mixed fight); hpShape (struck lead 30% vs unscathed pack); replayLedger (perTypeCap binding 2,0,0 / 1,1,0, fight order, unknown→1pt, cap-room against actual ledger); rungsOf (the unlockedWave ladder); counterfactual (w2 flip, war-source unmoved on w1/w2-only dismissals, no-flip when full, saturated-cap scores nothing).
- REGRESSION caught by the proof: the instrument's first draft snapshotted the waveKillLog join BEFORE the engine's tbEnd wrote the won-fight entries (s5501 drumbelly_tanuki: 4 perfs, won, entry {d:40, trick:'strike_windup x4'} written post-snapshot — the classifier saw 0 entries and called it won-unattributed). Fixed: the classifier joins over the FINAL waveKillLog at analysis time (the funnel/attrcensus pattern). One fixture pins the fix.
- DET: replay + counterfactual byte-identical across runs.
- RED: gate-off composition byte-identical to the landed bases (armedLead == vetrelLead == leadfeast; armedBelong == vetrelBelong == belongfeast; s204 60d).
- GREEN: 60d armed run records all dismissal fields; 0 unattributed; 0 instrument errors; counterfactual runs over real rows; restore() exact.
- SMOKE: 20d armed run completes schema-clean.

### The census

**PRIMARY: GO.** 32/32 runs finished (180d death-aware, 0 dropped runs). 214 performed-trick fights classified, **54 b2 dismissals**, 0 unattributed, 0 instrument errors. The dismissal pool is non-empty on this substrate (the UNMEASURABLE-OUT is not triggered).

Class mix (the full performed-fight census, pooled): b2-dismissal 54 (25%), attributed 128 (60%), b1-performer-died 32 (15%). No a2 pyrrhic on these seeds (the a2 shape needs 'lost' + a dead monster; recordPyrrhicKill would now tag it — landed).

**The b2 taxonomy (deed-relevant):**

| species / trick kind | wave | n (of 54) | known at start | perfs | HP at flight (min–max%) |
|---|---|---|---|---|---|
| hushwolf / strike_lead | 1 | 25 | 17/25 | 66 | 8–41% (the struck lead is wounded; the pack is not) |
| lockpick_raccoon / offer_food | 1 | 10 | 10/10 | 10 | 100–100% (pure bribe — untouched) |
| nightcourt / move_x2 | 1 | 7 | 7/7 | 9 | 30–100% |
| cliffhanger / eyes | 1 | 5 | 5/5 | 7 | 3–20% (nearly dead — the trick nearly kills) |
| heckler / wait | 2 | 3 | 3/3 | 3 | 12–25% |
| voice_mimic_radio / keep_distance | 2 | 3 | 3/3 | 3 | 16–100% |
| landlord / move_x2 | 2 | 1 | 1/1 | 1 | 100–100% |

46/54 (85%) fired with the counter KNOWN at fight start — the D2 mastery reading applies to the large majority. All 54 are wave-1/2 (waves 3–5 are counter-less by design — the dismissal deed question cannot touch the standing blood source, which reads wave-3+ ledger points only; verified: the counterfactual moved the war source on 0/29 runs).

Dismissals per run: 54/32 = **1.7/run** (control 2.0/run, armed 1.4/run — see the pool-shrink finding below).

**The counterfactual (the steve-call numbers):**

- D1 (dismissal = 1pt deed): 20 deed-points scored across 29 runs with ≥1 dismissal; 35 deeds scored 0 (per-type cap saturated).
- D2 (dismissal = 2pt when counter known): 29 deed-points scored; 35 scored 0 (cap).
- **Bar flips: 0** — on w2, w3, w4 AND w5, under both readings, on all 29 runs.
- Why: the wave-1 bar (5 pts) was FULL at run end on **all 32 runs**; the wave-2 bar (4 pts) likewise. The dismissal deeds are 100% redundant with kill deeds on this substrate — kills fill the bars first, and the per-type cap (2/type/wave) binds 65% of dismissal deeds anyway (hushwolf is 46% of the pool and saturates its type cap by kills alone).
- The wave-4/5 readiness replay: **no movement possible.** Readiness bars (armored/armed/tricks/veterans) are unchanged by deed-counting — trick discovery already fires on dismissal performances (the village learns the counter when the trick works; see sense read 1). The standing war source moved on 0 runs (dismissals are w1/w2 only). Two armed runs reached wave 4 via the vetrel companion mechanism, not dismissals.

**The sharpened steve-call input:**

1. **The question:** is dismissal — a trick that works non-lethally (the village learns the counter, the monster leaves, nobody dies) — a wave-unlock DEED? The b2 parallel of the pending a2 pyrrhic ruling (should pyrrhic kills scoreLedgerKill?).
2. **The exact rule text a ruling would change:** `src/js/waveLedger.js` (`ledger_kills_only: true` — "scoreLedgerKill is fed ONLY by recordWaveKill; engagements/flees/evades score nothing") and the wave-unlock comment in `src/js/game.js` (~29703: "Engagements (faced/fled) score nothing — only kills, player or villager, via recordWaveKill -> scoreLedgerKill."). A "yes" would add a dismissal feed — most honestly shaped as D2 (mastery: the trick was performed AND known, 46/54) with the existing perTypeCap=2 binding it.
3. **The numbers:** 1.7 dismissals/run; 85% known-at-start; D2 would bank ~0.9 deed-points/run; 0 bar flips on this substrate.
4. **The substrate caveat (the honest part):** on the competent courtship substrate the answer changes NOTHING — kill deeds already saturate the wave-1/2 bars. The ruling would only bite on kill-starved substrates — which is exactly the scale-wall substrate (national 0 / table 0 / wins 0, villages starving mid-ambition), where kills are scarce and 0.9 deed-points/run might be the difference between the w1 bar filling or not. **The deed question is scale-wall-relevant, not courtship-relevant.**
5. **Not a gate change (Steve's DECIDED ruling respected):** this is deed accounting — which ledger entries count — not trick-gate widening. No round-1 trick forms, no cond/perform changes. The a2 ruling and this one are the same class of call and could be decided together: "do non-lethal and pyrrhic resolutions of real fights bank wave-unlock credit?"

I do NOT pick the call. That is Steve's.

### The pool-shrinker (secondary, paired — the composition did not maximize)

The armed "dismissal-pool maximizer" (reposition+vetrel) produced FEWER dismissals than control: paired b2 diff −10 (32→22), performed-fight diff −70 (125→89) across 16 paired seeds. The reposition layer did fire (blindside 2, face_it 1 performances on armed vs 0/0 control) but the vetrel companion presence shrinks performed-fight opportunities faster than reposition adds them — the same displacement mechanism the perfsurvive arm measured (companions shorten fights / land killing blows before trick windows open). The dismissal pool is not purchasable by adding fighters to the scholar's fights. Filed to sim-findings.

### Wall metrics (guardrails)

| | control (16) | armed (16) | attrcensus ref (per 16) |
|---|---|---|---|
| national | 10 | 13 | ~6 |
| table | 14 | 15 | ~12 |
| wins | 0 | 0 | 0 |
| village-lost | 7 | 1 | ~8 |

Armed beats control on survival (lost 1 vs 7, combat deaths 42 vs 100) — the vetrel companion-screen secondary, consistent with sim-perfsurvive's secondary finding; not this arm's claim. Control vs the attrcensus re-sweep reference (3/8 & 6/8 on different fresh seeds): higher, but the reference is n=8 on different seeds; within seed-noise plus the reposition-adjacent instrument difference (control here is plain leadfeast/belongfeast — no instrument contact with outcomes). No new death mode: armed death-cause keys are a strict subset of control's (lockjaw/sickness/"the expedition" appear only on control — rare-cause sampling artifacts, same class as the perfsurvive note). Guardrails PASS.

### Metric review (§14)

- **PRIMARY bound the run: GO.** 54/54 dismissals classified into the deed-relevant taxonomy, 0 unattributed, 0 instrument errors, counterfactual computed for all 29 runs with dismissals. No re-scoring: the zero-flip result is reported as measured, not re-framed as a different metric.
- The UNMEASURABLE-OUT was not triggered (pool non-empty: 54).
- The counterfactual's rung ladder mirrors unlockedWave() exactly (verified against the four rung cases in the proof's PURE fixtures). The day-dimension (would dismissals fill bars EARLIER?) was not pre-registered and is not scored — the header asked "would it have advanced a wave-unlock bar", answered as rung flips at run end. An earlier-fill analysis would need the full kill+deed timeline replay — named as a possible next, not done here.
- The armed/control split was a pool-maximizer, not a lever: no GO/KILL threshold applied to it (diagnostic). Its pool-shrink is reported honestly as a secondary.

### Sense-testing (3 dismissal transcripts read as stories)

**Read 1 — the routed pack, discovery in the rout (belongfeast-s5501, seq 1, d6, hushwolf/strike_lead, knownAtStart=0, 4 perfs):** "The dog-shaped silence at the treeline breaks and runs! It got away. No meat, no trophy — but you're breathing, and now you know its moves." The COUNTER LEARNED beat fired in the same fight ("Wound the lead and the pack breaks"). Verdict: fully coherent — the trick worked (the lead was wounded, the pack broke), the village learned, nobody died. This is the b2 shape at its cleanest: dismissal AS the trick's success mode.

**Read 2 — the bribed raccoon (belongfeast-s5504, seq 10, d40, lockpick_raccoon/offer_food, 1 perf):** "You toss Burdock. It CANNOT resist — drops your Hatchet mid-scamper and stuffs its cheeks instead... 📺 +10 style — bought off the thief... It got away. No meat, no trophy — but you're breathing, and now you know its moves." Verdict: coherent and true to the trick's own text ("A bribe is cheaper than a chase"). The raccoon leaves at 100% HP — the purest dismissal: nothing was even hurt.

**Read 3 — the second pack (belongfeast-s5501, seq 5, d23, hushwolf/strike_lead, knownAtStart=1, 2 perfs):** "The Loud Beast breaks and runs!" Verdict: the known trick, executed, routes the pack. Reads as a routed pack, not an RNG table.

All three read as the trick succeeding non-lethally. The funnel loses them at perf→attr because dismissal isn't death, and the channel correctly attributes nothing — the question is purely whether the ledger should count them.

### Findings / named nexts

- **Filed to sim-findings:** the dismissal-pool maximizer didn't maximize (paired −10 b2, −70 perf fights armed vs control) — companion presence displaces performed-fight opportunities; the displacement is now measured twice (perfsurvive + this census).
- **Filed to sim-findings:** the waveKillLog join must run over the FINAL log at analysis time, never at the pre-ledger tbEnd snapshot (the proof's regression: won-fight entries are written by the engine after the snapshot). Any future tbEnd instrument must take this as given.
- **Named next (steve-call):** the b2 dismissal deed ruling — paired with the pending a2 pyrrhic deed ruling. Suggested framing for Steve: "do non-lethal and pyrrhic resolutions of real fights bank wave-unlock credit?" Numbers above; substrate caveat included.
- **Named next (measurement):** the day-dimension counterfactual (would dismissal deeds fill the w1/w2 bars EARLIER?) needs the kill+deed timeline replay — not pre-registered here, available as a follow-up on the same per-seed JSONs (rows carry day/seq; wkl carries kill days).

### Telemetry deviation check

`node scripts/telemetry-check.js --baseline hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-10-18/perseed-dismissal/*.json' --metrics national,table,wins,exiled` fired 3 LOUD lines — all EXPLAINED, baseline kept (not rolled):
- wins 16→0: substrate-mismatch — the recurring pre-seat LOUD class (SEATDRIVE=0 explicit; baseline is the full win-side stack). Same as the trickfunnel/attrcensus/perfsurvive runs.
- national 12→23, table 16→29: rate-identical, not deviations — baseline 12/16 (75%) vs current 23/32 (72%); baseline 16/16 (100%) vs current 29/32 (91%). The LOUD fires on raw-count swing; the proportions match the baseline.
- Verdict: explained, no bug. Baseline kept.
