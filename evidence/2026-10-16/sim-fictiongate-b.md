# sim-fictiongate-b — the cold-shoulder fiction gate (loop B, 2026-10-16)

Voice-only lever on the food-economy axis. Fixes sim-findings #385/#391:
the cold-shoulder journal beat (src/js/justice.js:137 — "The village has
gone quiet around me. I know why.") fires when justice heat arms stage
0→1, but on 13/16 ledgerdiag runs the dated-voluntary ledger was clean
(vn7 >= 0; once with zero voluntary takes and zero gives in the entire
book). The scholar internalizes a charge the village's own bowls
manufactured. And the same beat is true and false in the SAME run (#391:
leadfeast-s214 d14 meal-driven, d28–d113 honest) — a single trigger line
cannot serve both cases.

## PRE-REGISTRATION (MEASUREMENT §§9–12, 14 — binding, written BEFORE sweep spend)

- **Lever** (narration only, zero mechanics change): at the stage 0→1
  transition, gate the honest line on the dated-voluntary ledger agreeing
  — trailing-7d voluntary net < 0 (the freeloader-clock reading, engine
  takeRate7/giveRate7 over the dated takeHist/giveHist; succession resets
  both at ledger.js:841-844). When the dated ledger is clean (meal-driven
  heat), fire a distinct meal-aware line instead of "I know why". The
  stage transition, heat math, timing, the say line, and the journalNote
  cat+key dedup stay byte-identical — only which journal line fires
  changes. Precedent: sim-dawnrefuse-b (voice-only, landed).
- **PRIMARY (binding)**: 0 firings of the honest "I know why" line on a
  clean dated ledger across the sweep. GO: 100% gated — every
  clean-ledger journal firing voices the meal-aware line; every
  honest-ledger journal firing voices the honest line. (The journalNote
  dedup voices the journal line once per run — the first 0→1 transition;
  the say line voices every transition. The LEDGERDIAG instrument records
  journalNote CALLS even when the dedup suppresses them, so scoring uses
  only VOICED lines — those with a "📓 Journal/Codex:" say-echo. See
  metric review.)
- **Sweep**: 8 fresh seeds [137, 248, 359, 470, 581, 692, 803, 914] x
  {leadfeast, belongfeast} armed vs unmodified control on identical seeds,
  180d death-aware, SEATDRIVE=0 explicit, courtship substrate
  (FEASTSCALE_R13+TRIBFLOOR+SUCCGRACE+RAIDDENSITY+WINPURSUIT+WINDEFER).
  Control run first on the unmodified tree; armed after the lever lands.
  Own control in the same sweep design (#247).
- **Guardrails (binding)**: (G1) per-dawn extended trajectory hash
  byte-identical armed vs control on all 16 pairs (voice-only must not
  move mechanics — journal text not in the hash); (G2) stage-transition
  sequences identical; (G3) no crash, instrument recon clean, zero
  instrument errors. SMOKE green before sweep spend.
- **Informational (report-only)**: half-ration rate per day-alive (#384 —
  a voice lever should not change it); wall metrics (national / table /
  wins, wave 4–5 unlocks, median survival, death-cause shares).
- **Proof**: scripts/test-fictiongate-20261016.js — PART A fixtures (a)
  clean-ledger → meal-aware, (b) honest-ledger → honest, (c) stage math
  identical across both (only the journal text differs), (d) fallback
  (unreadable ledger → pre-fix honest line); PART B pilot det-gate
  (trigger exercised, instrument honest). RED→GREEN before/after.
- **Sense-test** (Steve's law): transcript of one clean-ledger firing and
  one honest firing in context, read for coherence — does the meal-aware
  line read as earned fiction, not an excuse?
- **Canon**: docs/CANON.md read. No food-distribution canon doc exists
  (stated per the canon rule); all mechanics read from src/js as-is and
  cited. No canon invented.

## THE LEVER

src/js/justice.js, stage 0→1 cold-shoulder block only:

```js
if (j.stage === 0 && heat >= 25) {
  j.stage = 1;
  this.say('Something has shifted. Conversations stop when you approach the fire. Nobody meets your eyes for long.');
  try {
    if (this.journalNote) {
      // FICTIONGATE (sim-fictiongate-b 2026-10-16, #385/#391): ... (see code)
      let honest = true; // fallback: the pre-fix line when the ledger is unreadable
      try {
        if (typeof this.takeRate7 === 'function' && typeof this.giveRate7 === 'function') {
          const net7 = (this.giveRate7(this.villagerId) - this.takeRate7(this.villagerId)) * 7;
          honest = net7 < 0;
        }
      } catch (e) {}
      this.journalNote('village', 'mood', honest
        ? 'The village has gone quiet around me. I know why.'
        : "The village has gone quiet around me. I don't know why — I've eaten only what was set before me.");
    }
  } catch (e) {}
  return;
}
```

The gate reads the engine's own dated-voluntary window (takeRate7/
giveRate7: e.day >= day-6, bowls never write takeHist — game.js:26632;
succession resets both histories at ledger.js:841-844), keyed on
this.villagerId — the same key justiceHeat uses for the cumulative
ledger. Fallback when the rate functions are unavailable: the pre-fix
honest line (old behavior preserved where the ledger is unreadable).

## PROOF

scripts/test-fictiongate-20261016.js — RED→GREEN on the real engine:

BEFORE the fix (SMOKE): A1 clean-ledger → honest line FIRED (the bug,
FAIL); A3 no journal delta (FAIL); B2 one unknown-text journal beat —
the instrument's journalNote wrap records the call AND the "📓 Codex:"
say-echo as two beats (diagnosed, normalizer added; not a game bug).
A2/A4/B1/B3 passed pre-fix.

AFTER the fix: ALL GREEN (full run: PART A 10/10, PART B 4 firings
across 2 seeds × 2 policies, recon 0, 0 instrument errors):
- A1 clean ledger (cumTakes 16000, takeHist empty, volNet7=0) → the
  meal-aware line; stage 0→1, heat 25, say line all identical to A2.
- A2 honest ledger (same cumulative, volNet7=-3000) → the honest line.
- A3 mechanics parity: heat/stage/say identical; ONLY the journal text
  differs between the clean and honest cases.
- A4 fallback (takeRate7/giveRate7 deleted) → pre-fix honest line.

## RESULTS

Sweep: 16 runs × {control, armed}, 180d death-aware, identical seeds,
both sides EXIT 0. Per-seed: evidence/2026-10-16/perseed-fictiongate-{control,armed}/
(+ .hashes.json). Summaries: fictiongate-control.json / fictiongate-armed.json.
Analyzer: scripts/analyze-fictiongate-20261016.js → **GO**.

### PRIMARY — GO (100% gated, 0 violations)

Armed side, 16 voiced journal lines (one per run — the journalNote dedup):

| ledger | n | line fired |
|---|---|---|
| clean (voluntaryNet7 >= 0) | 8 | meal-aware, 8/8 |
| honest (voluntaryNet7 < 0) | 8 | honest "I know why", 8/8 |

0 honest-line voicings on a clean dated ledger. 0 meal-aware voicings on
an honest ledger. 0 unknown texts. The clean-ledger firings include the
extreme shape from #385 (vn7=0 with mealShare 0.94+, e.g. armed leadfeast
s137 d13: vn7=0, vn=-900, mealShare=0.942 → meal-aware).

Control-side bug census (unmodified code, voiced lines): vn7=0 firings
voiced "I know why" on 8 runs (s137/s248/s359/s803 both policies) — the
filed bug, reproduced on fresh seeds.

### Guardrails — all hold

- **G1**: per-dawn extended trajectory hash (day/health/kcal/roster/
  takes/gives/stage/heat/pantry) byte-identical armed vs control on
  **16/16 pairs** — the voice lever moved no mechanics.
- **G2**: stage-transition sequences identical on **16/16 pairs**.
- **G3**: 32/32 runs completed with endReason; instrument recon
  tr7Mismatch=0 everywhere; 0 instrument errors; 0 say-hook errors.

### Informational (#384 half-ration rate; wall metrics)

- Half-ration rate per day-alive: **identical to 4dp on all 16 pairs**
  (e.g. 0.4488/0.4488 … 1.0000/1.0000) — a voice lever, as predicted,
  does not touch the ration regime.
- Wall (control vs armed): national 14/16 vs 14/16; table 13/16 vs
  13/16; wins 0/16 vs 0/16; exiled 0 vs 0; wave≥4 13/16 vs 13/16; wave5
  9/16 vs 9/16; median survival 126d vs 126d; say-level cold-shoulder
  firings 63 vs 63; death-cause table byte-identical (combat-shaped:
  monster:combat 215, player:combat 89, monster:villager-combat 124).

## SENSE-TEST (Steve's law)

Transcripts: evidence/2026-10-16/fictiongate-sense/ (captured at firing
time; the sweep's post-hoc ring evicted early-day context — see metric
review). Ledger readings from the armed sweep.

**Meal-aware — armed leadfeast s137 d14** (vn7=0, vn=-900, mealShare
0.942; the village had JUST served "Village meal: +1181 kcal (Half
ration — they don't trust you yet.)" then went quiet):

> [d14] Something has shifted. Conversations stop when you approach the fire. Nobody meets your eyes for long.
> [d14] 📓 Codex: The village has gone quiet around me. I don't know why — I've eaten only what was set before me.

Verdict: earned fiction, not an excuse. The scholar searches their
memory and finds nothing — every bite was a served bowl. Bewildered, not
defensive: no "but", no blame-shifting, no claim of innocence as
argument. It mirrors "I know why" structurally, so the two faces are
legible as two faces. The context makes the confusion true: the village
fed them, rationed them for "not trusting", then went quiet around them.

**Honest — armed leadfeast s470 d5** (vn7=-750; the scholar voluntarily
took 750 kcal in the trailing window):

> [d5] Something has shifted. Conversations stop when you approach the fire. Nobody meets your eyes for long.
> [d5] 📓 Journal: The village has gone quiet around me. I know why.

Verdict: unchanged and correct — the drip is real, the scholar knows.

## What the village looked like (assessor's notes)

Sixteen courtship villages on the full win-side substrate (SEATDRIVE=0):
15/16 lost their villages before day 180 (median 126d), one 180d
survivor (belongfeast s581). Deaths combat-shaped (monster:combat 215,
player:combat 89); starvation present but not modal (villager:
starvation 4, player:dehydration 2). The ledger meat-grinder from
sim-ledgerdiag-b continues unchanged (mechanics untouched by design):
successors re-arm the cumulative bar on the bowls within days, the cold
shoulder voices at the say level 63 times across the sweep, half-rations
bite on 12–100% of days-alive depending on the run. Who thrives: early
bearers who take voluntarily AND give (s470's honest armings); who dies:
everyone eventually — the wall numbers say the table is reached
(13/16) but not won (0/16) on this substrate. The blank this run fills:
#385/#391 — the cold shoulder's journal line no longer testifies for the
prosecution on manufactured evidence; the fiction now agrees with the
dated ledger 16/16. The blank it documents: none new — but see the
pre-existing "<redacted>" corruptions note below (not this run's work).

Note (pre-existing, NOT this run's files — flagged, not touched):
the content-pipeline "bearer <X>" redaction has corrupted comments in
committed files: src/js/ledger.js ("the new Bearer <redacted> write",
verified at the byte level — the file literally contains "<redacted>"),
scripts/rearmlat-20261016.js (four "<redacted>" in comments). Per the
run brief I avoided the word entirely in my writes (verified: zero
occurrences in my scripts/evidence); repair of the sibling files is a
coordinator call.

## Wall numbers (standing directive)

national 14/16; table 13/16; won 0/16; wave4 13/16; wave5 9/16;
median survival 126d; max 180d. The scale wall stands: the feast layer
walks courtship roads to the table's door (13/16 invited) but nobody
sits/wins — the table-sitting question belongs to the scale-onramp axis,
not this run.

## Metric review (§14)

1. **Voiced-only scoring (corrected BEFORE armed measurement, no
   re-score).** The pre-registration said "scored on journal-note
   firings"; the LEDGERDIAG journalNote wrap records the CALL even when
   the engine's cat+key dedup suppresses the voicing (no "📓" say-echo).
   Scoring calls would have counted non-voicings as firings. The metric
   (0 honest-on-clean) is unchanged; the operationalization was
   corrected to "voiced lines only" before the lever was applied, and the
   first control run (old recording) was discarded and re-run with the
   corrected recording on the same unmodified code. Transparent, §14
   §14-compliant: the binding bar never moved.
2. **Beat-day offset.** Cold-shoulder beats land on stageEvent.day + 1
   (the ledgerdiag evidence's empirical ±1-day note, confirmed again:
   sweep firings d13, sense transcripts d14). The firing's ledger context
   stays the stageEvent day's row. Unchanged from the diagnostic.
3. **Sense-transcript capture.** The sweep's post-hoc 8000-ring say
   buffer evicted early-day firing context on long runs (s137's d13
   firing lost its context). The sense-test used a dedicated at-firing
   capture script instead (scripts/sense-fictiongate-20261016.js). Future
   voice-lever sweeps should capture sense transcripts at fire time, not
   post-hoc.

## Convergence state

**GO — lever landed locally, pending ship.** The fiction gate is
measured: 16/16 voiced journal lines agree with the dated-voluntary
ledger (8 meal-aware on clean, 8 honest on honest), mechanics
byte-identical (16/16 per-dawn hashes, 16/16 stage sequences),
half-ration rate untouched, wall metrics identical. Findings #385/#391
are fixed by this lever; recommend marking both `fixed` on landing.
