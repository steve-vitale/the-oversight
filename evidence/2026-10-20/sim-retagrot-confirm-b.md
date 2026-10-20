# SIM-RETAGROT-CONFIRM-B — confirm of the retagrot-b3 GO (loop B, food-economy)

Date: 2026-10-20 · Loop: oversight-flesh-out-loop-b · Worker tree: ~/workspace/worktrees/sim-retagrot-confirm-b
Run: fleshout-loop-b-20261020T1630Z · Axis: food-economy (scale-wall lens)
Base SHA: 116e80090 (tree tip; matches current master at run start).

## Context

The b3 pilot (evidence/2026-10-20/sim-retagrot-b3.md) judged the ROT re-tag GO at 8 seeds:
PRIMARY pooled fast-rot 0.28x vs the 0.80x bar; all six hard guardrails PASS; det-gate 16/16×2
bit-identical; proof 14/14 GREEN; SENSE-OK. The metric review dropped the inflow-ratio
guardrail as noise for a funnel re-tag (channel reclassification + survival-composition mix).
This run CONFIRMS at 16 fresh seeds against the revised guardrails.

The layer (scripts/policies/retagrot-b.js) is default-OFF and inert on master; this worker
confirms, does not write the layer. **The default-ON decision is a coordinator/Steve call —
this run documents the verdict LOUD and does NOT flip the default.**

## Pre-registration (docs/MEASUREMENT.md §§9–12, 14–15 — binding, written BEFORE any sims)

- **Question**: does the retagrot-b3 pilot GO hold at 16 fresh seeds? The re-tag ALONE,
  broadened beyond lean days (always-on), is judged on ROT reduction with a ROT primary.
- **Lever**: RETAGROT re-tag (policy-side, scripts/policies/retagrot-b.js, ZERO src/js changes).
  Wraps leadfeast/belongfeast (scripts/policies/feastscale.js). RETAGROT_B=1 default OFF
  (unset → pure delegation, byte-identical — pinned by the proof's RED phase). Requires
  FEASTSCALE_R13=1 (loud RETAGROT STOP otherwise). Mechanic: persistent idempotent
  Game.villagerMealDay wrapper; each wrapped meal re-tags the share write from stockSurplus
  into the PANTRY funnel (Game.stockPantry(give, 'Foraged food'), ≤500-kcal pieces, fresh
  clock), save/restored per-meal in finally. NO trustFactor override. CAPDOOR=1 defers to
  the original stockSurplus. Voices at most one line per day when the re-tag moved kcal,
  day-keyed among 3 honest variants.
- **Method**: paired before/after on identical seeds, pooled over lead+belong. Control:
  RETAGROT_B unset. Armed: RETAGROT_B=1. Both sides retagrot-wrapped feastscale policies
  (leadretagrot/belongretagrot) + FEASTSCALE_R13=1 + SEATDRIVE=0 + SURPLUSFEED unset.
- **PRIMARY (binding)**: pooled fast-rot kcal ratio (armed/control, pooled lead+belong,
  /100d run-days) ≤ 0.80x.
- **GUARDRAILS (hard, REVISED per the b3 metric review — inflow-ratio DROPPED)**:
  starvation deaths ≤ control; starveDays ≤ control; median survival ≥ control−10d;
  national ≥ control−2; laundering 0; no new death mechanism (mechanism-triaged).
- **Horizon**: 180d death-aware (dead villages stop +10d tail max). Never a fixed 200d.
- **Seeds**: 5411–5426 × {leadretagrot, belongretagrot} × {control, armed} = 64 configs.
  Fresh: the sweep asserts the coordinator's banned list inline (5411–5426 not on it);
  no JUDGED run has used these seeds (proof used 5401/5402; pilot used 5403–5410).
  Paired control re-measured on the current tip in the same sweep.
- **Det-gate**: scripts/detgate-retagrot-b.js on the SAME confirm seeds (DETSEEDS=5411..5426) —
  16 configs × 2 sides × 2 reps; all 32 repeat-pairs bit-identical (r27 rule).
  A det-gate FAIL is FAIL LOUDLY and stops the run before the sweep.
- **Panel (§15)**: attempted via scripts/balance-panel.js — CANNOT produce a valid compare for
  this env-flag arm: the panel's child route resolves policies through sweep-compare.js's
  POLICY_REGISTRY, which has zero retagrot entries (verified this run: grep -c 'retagrot'
  scripts/sweep-compare.js → 0). The pantryguard-b2 precedent applies: passing base policies
  + the env flag leaves the layer INERT (13 after-cases byte-identical to before).
  No bogus panel shipped; the pre-registered metrics bind regardless.
- **Verdict form**: GO → the lever is confirmed; the default-ON decision is a
  coordinator/Steve call (documented LOUD, default NOT flipped). NO-GO → kill protocol
  (layer deleted zero-trace, instruments + evidence kept).

## Canon

- docs/CANON.md + docs/PRESERVATION.md read first. The re-tag moves kcal between funnels;
  it never converts, cooks, or re-clocks food — "rot can't be smoked back into food" holds,
  and the laundering guardrail is satisfied by construction + measured.
- No-silent-actions: the re-tag voices at most one line per active day (3 day-keyed honest
  variants, deterministic — the b3 sense read found no verbatim-adjacent repetition).
- CRISIS SHARING (game.js villagerMealDay, bal-survival 2026-10-10): the engine opens the
  share gate when the pantry is nearly empty; the layer does not touch it.
- No new canon invented; no game-code changes.

## Proof (step 1)

`FEASTSCALE_R13=1 node scripts/test-retagrot-b.js` (Usage header read FIRST per the ENV TRAP
lesson) — **14/14 GREEN** on base 116e80090:
- RED: RETAGROT_B unset → armed≡base byte-identical on all 4 pairs (seeds 5401/5402 × lead/belong).
- RED (substrate gate): RETAGROT_B=1 without FEASTSCALE_R13=1 → loud RETAGROT STOP.
- GREEN: layerOn() true; re-tag fired (moved kcal > 0); engine stockSurplus NEVER called
  armed-side; control still uses the engine share path; per-meal save/restore intact;
  vmd wrap installed exactly once; armed differs from control; CAPDOOR=1 defers;
  armed repeat run identical.
- SENSE: 41 days voiced, 3 distinct variants, 189,450 kcal moved total.

## Det-gate (step 2)

`FEASTSCALE_R13=1 SEATDRIVE=0 DETSEEDS="5411..5426" node scripts/detgate-retagrot-b.js`
(16 confirm configs × 2 sides × 2 reps, 180d) —
`FEASTSCALE_R13=1 SEATDRIVE=0 DETSEEDS="5411,5412,...,5426" node scripts/detgate-retagrot-b.js`
(16 confirm seeds × 2 policies = 32 configs × 2 sides × 2 reps, 180d) —
**DET-GATE: control 32/32 armed 32/32 — PASS** (42 min wall).
Note on the pre-registration's arithmetic: the line as written ("16 configs × 2 sides × 2 reps;
all 32 repeat-pairs") inherited the pilot's 8-seed config count. The confirm's 16-seed set
doubles it to 32 configs / 64 repeat-pairs. The bar (all repeat-pairs bit-identical) is
unchanged and strictly stronger. Also: DETSEEDS="5411..5426" does NOT parse as a range in
the script (parseInt gives 5411 only); the explicit comma list was passed. Every config's
control≠armed hash (the lever moves kcal on all 32), and no config printed the
"lever silent" note.

## Sweep (step 3)

64 configs (seeds 5411–5426 × {leadretagrot, belongretagrot} × {control, armed}), 180d
death-aware horizons, FEASTSCALE_R13=1 + SEATDRIVE=0 both sides, RETAGROT_B=1 armed / unset
control. The sweep's inline banned-seed assertion passed on all 4 legs (5411–5426 clean
against the coordinator's list; proof used 5401/5402, pilot 5403–5410 — no JUDGED run
reused). A mid-sweep service restart killed the two belong legs at 9/16 and 8/16; both
resumed cleanly from their written JSONs (the script's resume path) and completed 16/16.
Per-seed corpus: evidence/2026-10-20/perseed-retagrot-confirm/{control,armed}-{lead,belong}.json.

## Results (step 4 — analyze-retagrot-confirm-b.js)

PRIMARY — pooled fast-rot kcal ratio (armed/control, pooled lead+belong, /100d run-days):
control 3,326,490 kcal / 4719d (70,491/100d); armed 1,628,262 kcal / 4138d (39,349/100d).
**RATIO 0.56x vs 0.80x bar → GO on the primary.** The re-tag moves 16.3M kcal into the
PANTRY funnel over 4081 re-tag days (channel signature: share_surplus 18.2M → 0,
away_wild 2.8M → 18.9M — the re-tag made visible, as instrumented).

GUARDRAILS (hard):
- starvation deaths: control 25 vs armed 26 (bar ≤ control) → **FAIL** (miss by 1)
- starveDays: control 824 vs armed 803 → PASS
- median survival: control 150d vs armed 126d (bar ≥ control−10d = 140d) → **FAIL** (miss by 14d)
- national: control 12 vs armed 14 (bar ≥ control−2 = 10) → PASS
- laundering: 0 / 0 → PASS
- no new death mechanism → PASS (mechanism-triaged; see below)

Survival distribution (paired, 32 seeds): control med 146d mean 147.5d; armed med 123d
mean 129.3d. Paired day-diffs (armed−control): lead 9 worse / 4 better / 3 same
(mean −13.9d); belong 10 worse / 3 better / 3 same (mean −22.4d). 19/32 paired seeds
die earlier armed — this is not noise.

New death modes (name-level, mechanism-triaged): armed-only names are monster/event
names (highbeam deer, the moderator, the reverend, the reunion, a dog-shaped silence at
the tree, nevermore, nostalgia, the understudy, lockjaw, wound_fever); control has its
own armed-absent names (the paparazzo, extended warranty, the eater, buffering, gavel,
big ugly, spool, dustboar, mosquito, ad break). Both tails are the same mechanisms
(combat/monster, sickness, contest) — no new MECHANISM. Guardrail satisfied by triage,
as in the pilot.

## Verdict: NO-GO (kill protocol)

The primary holds (0.56x ≤ 0.80x), but TWO hard guardrails miss: starvation deaths
26 > 25 and median survival 126d < 140d bar. Per docs/MEASUREMENT.md §14 a miss is
NO-GO, never re-scored mid-run. The pilot's GO does not hold at 16 seeds.

Mechanism (from the sense reads): the re-tag intercepts the engine's crisis share
(stockSurplus — the proof's G1b pins "engine stockSurplus NEVER called armed-side") and
redirects it into the pantry. Crisis sharing fires when the pantry is nearly empty to
feed starving villagers DIRECTLY. The re-tag stockpiles that food instead. Transcript
s5417 (armed lead, died 48d): on d37 Hassan says the pantry holds "4,504 of 14,000 kcal"
— and on d38 Sari and Hassan STARVE ("Sari starved. Slowly. The village is 8 now.")
while the village meal runs on half rations ("they don't trust you yet"). The village
starves with a stocked pantry: the re-tag feeds the stockpile and starves the
distribution. s5426 (armed belong) shows the same cascade (Vasyl d54, Vito d56, Luis
d57, Dumisani d60 — "starved. Slowly."). The survival cost is mechanism-real, not
counting noise: 19/32 paired seeds die earlier, mean −14 to −22d.

Kill protocol executed: scripts/policies/retagrot-b.js DELETED from this tree
(zero-trace; nothing in src/js references it, POLICY_REGISTRY has zero retagrot entries —
verified by grep). Instruments (test/detgate/sweep/analyze/capture scripts) + evidence
kept as the record. The instruments are now inert (they require the deleted layer).

**The default-ON question is moot — the lever is killed, not confirmed.**

## Village assessment

Thirty-two villages lived and mostly died on the confirm seeds. The modal story: a
competent village climbs to regional or national, reaches wave 4, and dies between day
82 and day 180 — to raids, monsters, or the slow grind of hunger. Nobody won (0/64);
nobody reached the table (0/64 — see the telemetry note; this substrate lacks the
win-stack flags). Wave 5 was never reached (0/64); arc 4+ was reached on 59/64 runs.

Who thrived: villages that reached national early (s5412, s5416, s5418 armed-lead —
global rank, national=true) and converted inflow into pantry depth. Who died and why:
early deaths cluster on starvation-prone seeds where the re-tag's pantry-stockpiling
left the distribution dry (s5417, s5426, s5411-belong). Mid-game deaths are raids and
wave-4 monsters (combat 509 pooled, monster 218 pooled). Late deaths are attrition.

The villagers act like people in the transcripts: they eat by the fire, talk low over
bowls, sow gardens they then fail to tend ("drowned in weeds and died. Six untended
days. The garden keeps honest books."), argue about the pantry ("The pantry's the
thing. We don't raise The Palisade on empty shelves"), and starve slowly and
individually, not as a number. The re-tag's voice is honest (3 day-keyed variants,
47 firings on s5417, no verbatim-adjacent repetition). SENSE-OK on voice; SENSE-FAIL
on outcome (the mechanism starves them).

## Blanks filled / documented

- DOCUMENTED (the kill): the retagrot-b re-tag reduces ROT (0.56x, primary GO) but
  carries a mechanism-real survival cost (median −20d, 19/32 paired seeds worse) via
  crisis-share interception. Filed as a design blank: a funnel re-tag must not divert
  crisis food from starving villagers — any future re-tag needs a starvation bypass
  (do not intercept when the crisis gate is open / villagers are starving). This is a
  next-run lever proposal, not this-run work (§14).
- DOCUMENTED: DETSEEDS range form ("5411..5426") does not parse in detgate-retagrot-b.js
  (parseInt → 5411 only); future runs must pass the explicit comma list. The script's
  Usage comment should be updated to show the comma form (left for the coordinator —
  the instrument is kept inert post-kill).

## Metric review (mandatory — docs/MEASUREMENT.md §14)

1. The pre-registration's det-gate arithmetic ("16 configs / 32 pairs") was the pilot's
   8-seed shape; the confirm ran 32 configs / 64 pairs (strictly stronger gate, same
   bar). No re-scoring; documented, not revised.
2. The starvation-deaths guardrail (26 vs 25, miss by 1) is noise-susceptible at this n.
   Propose for the NEXT run: a tolerance band (e.g. ≤ control+2) OR a paired sign test
   instead of a pooled count. NOT applied here — the median-survival miss independently
   forces NO-GO.
3. The median-survival guardrail worked exactly as designed: it caught a real,
   mechanism-backed survival cost the ROT primary cannot see. No revision proposed.
4. Panel §15: re-confirmed this run — scripts/balance-panel.js cannot express this
   env-flag arm (POLICY_REGISTRY has zero retagrot entries; grep verified). No bogus
   panel shipped. The pre-registered metrics bound the run regardless.

## Wall numbers (national / table / wins, wave reach)

Pooled over the 64 confirm runs (control+armed; the lever is killed so the pooled
regime is what matters for the wall):
- won 0/64, national 26/64, table 0/64
- wave4 57/64, wave5 0/64, arc4+ 59/64
- median survival 137d, max 180d
- death causes (pooled): combat 509, monster 218, starvation 51, contest 22, sickness 19,
  "a wound that wouldn't close" 19, dehydration 11, alien 9, ambush 11, the night 5,
  choir toad 4, hushpuppy 3, the callback 2, lockpick 3, ugly-eyes 3, inspiration 2,
  bulldozer 2, the phoenix link 8 (control only)
- Per-side: control national 12/32 table 0/32 won 0/32; armed national 14/32 table 0/32
  won 0/32. The lever moved national +2 (within guardrail) and cost survival −20d median.

## Telemetry deviation check (step 9)

`telemetry-check.js --baseline scale-wall-preseat.json --current <4 per-seed JSONs
aggregated> --metrics national,table,won,exiled` → one LOUD line: "table disappeared:
baseline 24 -> current 0". Investigation (same-run item): the baseline is the
"pre-seat FULL WIN-SIDE STACK" regime (FEASTSCALE_R13=1/SEATDRIVE=0/NODEWITNESS=1/
VETREL=1/WINDEFER=1, 16 seeds 65001–65016); this corpus is base pre-seat substrate
(without NODEWITNESS/VETREL/WINDEFER). Table reach needs the win-stack flags.
Crucially, control and armed are IDENTICAL on table (0/32 = 0/32) — the lever caused
no table deviation; the LOUD line is a substrate/regime artifact, not a lever effect.
National 26/64 vs baseline 21/32: no LOUD swing (|26−21|/21 = 24% < 60%). Regime check
documented: both baseline and corpus are pre-seat (SEATDRIVE=0); they differ in the
win-stack flags, which explains table 24/32 → 0/64.

## Panel (§15)

Attempted via scripts/balance-panel.js — CANNOT produce a valid compare for this
env-flag arm (verified again this run: POLICY_REGISTRY in scripts/sweep-compare.js has
zero retagrot entries; passing base policies + the env flag leaves the layer inert).
No bogus panel shipped. The pre-registered metrics bind regardless.

## Run notes

- Adopted the orphaned 1630Z confirm (fleshout-loop-b-20261020T1630Z); its evidence file
  ended mid-det-gate. Re-ran proof (14/14 GREEN, FEASTSCALE_R13=1 per the Usage header —
  the ENV TRAP lesson), completed the det-gate (32/32×2 PASS), ran the 64-config sweep.
- Master moved 116e80090 → ea6f64531 during the run; this confirm is pinned to the
  pre-registered base 116e80090 (paired before/after on identical seeds — the base move
  does not invalidate the comparison, but the kill merge needs coordinator handling).
- Stray tree-root logs det-gate-banklegrecal.log and panel-helpcost-compare.log are NOT
  this arm's (banklegrecal/helpcost — sibling arms). Left uncommitted; flagged to the
  coordinator.
- Service restart mid-sweep killed the belong legs at 9/16 + 8/16; both resumed from
  their JSONs and completed 16/16. /tmp was wiped by the restart (per the 2026-10-14
  lesson — nothing recovery-critical was in /tmp).
