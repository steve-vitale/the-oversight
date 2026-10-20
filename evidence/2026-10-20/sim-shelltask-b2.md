# sim-shelltask-b2 — PACK-shelling revival #3 on the frozen base (loop B, run fleshout-b-2026-10-20, axis food-economy)

Revives sim-shelltask-b (evidence/2026-10-17/sim-shelltask-b.md, finding
#479): the policy-side camp-shelling layer (SHELLCAMP=1, default OFF;
Game.shellNuts, 4 honest ticks, whole pack batch, net 75% of gross).

The shelltask line so far:
1. sim-shelltask-b (2026-10-17): KILLED at pilot on the literal starvation
   guardrail 25>24 (noise-level; 14/16 pairs identical; mechanistic
   exoneration: pack-first eating displaces pantry draws).
2. sim-shellrevive-b (2026-10-17, finding #500): KILLED AT PILOT ON
   ENGAGEMENT — fresh seeds 7601–7608 carried no nuts on lean days (376
   kcal, 0 on starvation days).
3. sim-shellrevive-b3 (2026-10-18): KILLED at step-4 on the frozen base —
   engagement miss (16,830 < 30,000), pantry displacement miss (−25,664:
   supplementation not substitution, the pure-gain theory refuted), median
   survival miss (102d vs 125d). Harm signal NOT reproduced (2 vs 2).

This run re-pins the layer faithfully on the frozen base and re-judges it
under the task's revised §14 pre-registration (starvation noise margin +
paired pantry-draw displacement), on FRESH seeds.

## PRE-REGISTERED (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written before any sim)

- BASE FROZEN: `09123a854` (recorded by `git rev-parse HEAD` in the worker
  tree; cross-base corpora are invalid per the shellharm-b revival spec).
- PRIMARY (mechanism engagement): shelled-kcal converted on lean days > 0
  armed vs 0 control (control never shells), AND >= 1k kcal shelled-and-eaten
  on starvation days across the armed side.
- STARVATION GUARDRAIL (metric-review revised): armed starvation deaths <=
  control+2 (noise margin), PLUS paired pantry-draw displacement: per-pair
  pantry draws (armed − control) <= 0 (no diversion; the scholar eats pack
  nuts INSTEAD of pantry draws — the mechanistic exoneration re-measured).
- OTHER GUARDRAILS: national >= control−2; median survival >= control−10d;
  no new death mode (death-cause compare); det-gate byte-identical with gate
  OFF; laundering 0.
- HORIZON: 180d death-aware (runDays stops on village death +10d tail).
- SEEDS: 8001–8008 (FRESH; verified 0 hits in evidence/*/sim-*.md and
  scripts/sweep-*.js for 8001–8601 before running).
- POLICIES: {leadfeast, belongfeast} (FEASTSCALE_R13=1 substrate),
  SEATDRIVE=0 EXPLICIT. Own in-sweep control, identical seeds.
- PROOF FIRST: scripts/test-shelltask-b2.js — RED-verified pre-edit (base
  belongfeast upkeep leaves in-shell nuts untouched), GREEN post-edit;
  det-gate 16/16 byte-identical gate-off; SMOKE green.
- KILL FAST: pilot is the verdict; confirm (12–16) only on pilot GO. On
  NO-GO the layer is deleted zero-trace per kill protocol; instruments +
  evidence kept.
- §15: the official balance-panel driver cannot express this arm
  (policy-side layer; FEASTSCALE_R13 substrate; leadfeast/belongfeast are not
  panel policies; the contract lacks starvation/shelled-kcal/pantry
  metrics). Light per-seed panel-schema JSONs + compare .md in
  evidence/2026-10-20/panel-shelltask-b2/; pre-registered metrics judged
  directly. Deviation noted under "metric review".

## The lever (policy-side, scripts/policies/shelltask-b2.js, SHELLCAMP=1 default OFF)

Fresh write against the sim-shelltask-b spec (the killed shelltask-b.js was
deleted zero-trace; the -b2 filename keeps this run's evidence from
clobbering the retained instruments). `withShellTask(base)` wraps the
feastscale policies. The CAMP BEAT, once per day, when the scholar is making
camp — at Haven (upkeep hook) or bedding down wherever they are (daily hook,
pre-sleep, before base.daily): on a day the pack-eat flow would call
"nothing edible" (still hungry: scholar.kcal < kcalCap(), no edible pack
food, >=1 in-shell nut item), with time to spare, the scholar shells the
whole pack batch with the engine's Game.shellNuts() (4 honest ticks, engine
fiction). The base policy's own eat flow (competentEat — pack-first) then
eats the shelled nuts honestly; the shelling re-arms the nothing-edible
pack-key gate (key covers name/kcalEach/foodState/edible), so the follow-up
eat is honest, not forced.

Gates (the full list from sim-shelltask-b): SHELLCAMP=1; scholar alive
(exiles allowed — no exile gate); no tbfight (tickAction no-ops mid-fight);
no active contest; lean day = kcal < kcalCap AND no edible pack food AND ≥1
in-shell nut item; upkeep hook requires at-Haven (playerAtHaven), daily hook
fires pre-sleep wherever; time to spare = dayTicks + 4 + 64 <
TICKS_PER_DAY; once per day (ctx._stShellDay). Telemetry on ctx: _stShellDay,
stShellDays, stShelledKcal (engine-formula net 75%, per-unit). Zero src/js
changes. No new narration.

## Proof (scripts/test-shelltask-b2.js) — 17/17 GREEN

- PART A (gate-logic units, 12/12): shellableNuts finds in-shell nuts /
  ignores edible food; ediblePackFood true on berries, false on nuts-only;
  leanDay true only when hungry + nuts-only pack; timeToSpare true mid-day,
  false with the day nearly spent; layerOn() default OFF.
- PART B (RED->GREEN fixture, live engine, constructed lean camp state):
  RED — base belongfeast upkeep leaves in-shell nuts untouched (verified
  pre-edit: states=in_shell,in_shell). GREEN — wrapped upkeep (SHELLCAMP=1)
  shells the pack batch at Haven (telemetry stShelledKcal>0 recorded), no
  in-shell nuts remain, remainder shelled+edible, then the engine's normal
  pack-eat verb eats them.
- PART C (det-gate): wrapped policy with SHELLCAMP unset vs unwrapped base,
  per-day trajectory hashes, 60d x 8 seeds x 2 policies — 16/16
  byte-identical, no layer-attributable divergence.
- PART D (SMOKE): 2 seeds x 2 policies x {control,armed}, 12d — 8/8 no
  exceptions.

## Before / after (pilot: 32 runs, seeds 8001–8008 x 2 policies x {control,armed}, 180d death-aware)

Per-seed JSONs: evidence/2026-10-20/perseed-shelltask-b2/ (32 files, top-level
wall keys). Panel compare: evidence/2026-10-20/panel-shelltask-b2/compare-shelltask-b2.md
(decision NO-GO, pre-registered adjudication). Sweep log:
evidence/2026-10-20/sweep-shelltask-b2.log. 0 instrument errors.

| metric | control (16) | armed (16) | bar | verdict |
|---|---|---|---|---|
| shelled kcal (lean days) | 0 | 19,360 | armed>0, control=0 | **MET** |
| shell days | 0 | 15 | — | mechanism engages |
| shelled kcal on starvation days | 0 | 0 | >= 1,000 | **MISS** |
| starvation deaths | 5 | 8 | <= control+2=7 | **BREACH** |
| player starvation deaths | 2 | 6 | — | (paired 0/2/14) |
| pantry displacement (control−armed) | — | +6,586 kcal | >= 0 | **HOLD** |
| national | 14/16 | 14/16 | >= control−2 | HOLD |
| table | 14/16 | 14/16 | — | — |
| wins | 0/16 | 0/16 | — | corpus property |
| wave4 / wave5 | 16 / 1 | 16 / 0 | — | — |
| arc2 / arc3 / arc4 | 16 / 16 / 14 | 16 / 16 / 14 | — | — |
| four-realm | 0 / 16 | 0 / 16 | — | — |
| median survival | 158d | 173d | >= control−10d | HOLD |
| max survival | 182d | 182d | — | — |
| death modes (mode level) | — | — | no new mode | HOLD |
| det-gate | 16/16 byte-identical gate-off (proof Part C) | — | HOLD | |
| laundering | 0 instrument errors | — | HOLD | |

Engagement by run (armed): s8004-leadfeast 6 days; s8003-leadfeast 3 days;
s8003-belongfeast 3 days / 3,450 kcal; s8001-leadfeast 1 day; s8008-leadfeast
1 day; s8008-belongfeast 1 day / 2,100 kcal; s8002/s8005/s8006/s8007: 0 days.
Control never shells (0 by construction and by measurement).

## Verdict: NO-GO (guardrail breach + engagement miss) — layer killed zero-trace

Two independent pre-registered misses, either binding per §14:

1. **PRIMARY(b) MISS — the kill-fast condition.** The mechanism engages on
   lean days (15 days, 19,360 kcal, control 0) but shelled 0 kcal on
   starvation days (scholar kcal < 500 at firing) — 0 < 1,000. The layer's
   trigger requires in-shell nuts IN THE PACK; on genuine starvation days
   the nuts are on the prep-stash counter rotting (see sense-test), not in
   the pack. The honest niche is early lean days when the scholar carries
   nuts — a snack, not a starvation intervention.
2. **STARVATION GUARDRAIL BREACH.** Armed 8 > control+2 = 7 (player: 6 vs 2;
   paired sign 0/2/14 — the two worse pairs are s8003-belongfeast 0→1 and
   s8008-belongfeast 0→2).

The displacement guardrail HOLD (+6,586 kcal: the armed scholar draws LESS
pantry food than control) rules out the pantry-diversion mechanism; the
shellharm-b perturb null instrument rules out the 4-tick timing vector; the
sense read shows the starvation deaths arriving in late collapse famines
temporally disconnected from the early shelling days. The breach reads as
famine-trajectory noise — but per §14 the pre-registered guardrail binds
regardless, and PRIMARY(b) is an independent miss.

Kill protocol: layer scripts/policies/shelltask-b2.js deleted zero-trace;
instruments (test/sweep/analyze/sense/panel-builder) + evidence kept and
committed. The proof test INFO-SKIPs when the layer is absent (same pattern
as the retained test-shelltask-b.js).

## Sense-test (SENSE-TESTING LAW — transcript reads)

Read: evidence/2026-10-20/sense-shelltask-b2-s8003.txt (s8003-belongfeast
armed: 3 shell days d8/d9/d11; village lost d114, 1 scholar starvation
death); plus a targeted d136–d157 famine read on s8008-belongfeast armed.

s8003 reads coherent and in-fiction: the scholar works a hickory patch
("You work the patch with practiced hands: 7× Hickory Nuts (in shell —
shell them to eat)"), hears the honest refusal ("Nothing edible. (Hickory
Nuts (in shell) — not food yet: Needs shelling — crack and pick the
nutmeats.)"), cracks ("You crack and pick 1 lot of nuts. Shells everywhere
— the net is less than the gross looked. (4 ticks)"), eats ("You eat
Hickory Nuts (1050 kcal)"), and drives the game's own mastery system ("★
Deeper knowledge: Hickory Nuts. Parts: nut meat (eat), shells (smoke
flavor), bark (tea). Crack carefully. (Yield +50%)."). A person taking
stock, not a robot. The starvation death comes ~100 days later in a
collapsed village — temporally disconnected from the shelling.

s8008 is the indictment of the TRIGGER, not the layer's voice: the scholar
starves from d136 while the beats read "Overnight, White Oak Acorns (in
shell) went bad — beyond saving" and "Overnight, Hickory Nuts (in shell)
went bad — beyond saving" night after night, "⚠ Haven's pantry is empty.
Day 1–5 of hunger," and "🕯️ Boris Kowalski is dead — starvation." The nuts
are on the counter (the #484 blank), not in the pack — the pack layer's
gate never opens on these days, so PRIMARY(b) = 0. The counter-shelling
layer (shellrevive-b.js, LANDED) is the instrument that covers this case;
the pack layer cannot reach it by design.

## Telemetry deviation check

`telemetry-check.js` vs scale-wall.json baseline: three LOUD lines —
national 12→28, table 16→28, wins 16→0 (n=32 files). Triaged as the known
substrate-mismatch: both arms agree identically (national 14/16 both, table
14/16 both, wins 0/16 both). The 8001–8008 corpus on the pre-seat
courtship road caps below wins (wave4 16/16 both sides, wave5 1/32) — a
corpus/substrate property, not an arm effect. The layer changed nothing
about win reachability.

## Metric review (mandatory)

1. PRIMARY(b) is the binding screen and it worked as designed: the layer
   engages on lean days but cannot convert on starvation days — the exact
   question the kill-fast condition asked. 0/1000 is not a near-miss; the
   trigger pool (nuts in pack) and the starvation pool (nuts on counter)
   are disjoint sets on this corpus. Any future pack-shelling work must
   close that gap first (or concede the counter layer owns it).
2. The starvation guardrail (control+2 noise margin) fired on 8 vs 7 — a
   one-death breach with a 0/2/14 paired sign and a HOLD displacement. The
   b3 metric review's warning stands: pooled starvation on a famine-prone
   corpus is trajectory noise unless a mechanism attaches. No mechanism
   attaches here (displacement +, timing inert, sense shows temporal
   disconnection). The guardrail is coarse by design; it did its job as a
   tripwire, not as a diagnosis.
3. The displacement result (+6,586, HOLD) partially rehabilitates the
   pure-gain exoneration on THIS corpus (b3 refuted it on 7001–7008 with
   −25,664): the scholar's intake response is corpus-dependent, not a layer
   constant. Neither direction is a lever.
4. §15 DEVIATION (unchanged from the pre-registration): the official
   balance-panel driver cannot express this arm (policy-side layer,
   FEASTSCALE_R13 substrate, leadfeast/belongfeast not panel policies, the
   contract lacks starvation/shelled-kcal/pantry metrics). Light per-seed
   panel-schema JSONs (control.json/armed.json) + compare-shelltask-b2.md in
   evidence/2026-10-20/panel-shelltask-b2/; pre-registered metrics judged
   directly.

## Reachability verdict

REACHABLE but not at lever scale — same verdict as b3. The layer fires on
the frozen base (15 shell days across 16 armed runs, control 0) and the
proof fixture demonstrates the honest mechanism end-to-end. What does not
reach is the pre-registered STARVATION-DAY scale: 0 vs the 1k bar. The
shell channel's honest size on the current base is a lean-day snack — and
the starvation-day case belongs to the landed counter layer.

## Village assessment (plain words)

Sixteen villages, and the pack-shelling scholar is a cameo in most of
them. On s8004-leadfeast the scholar cracks nuts six nights running and
the village dies at d139 anyway; on s8003 the early cracking (d8–d11,
3,450 kcal) is a footnote in a village that collapses at d114; on s8008
the scholar watches the counter rot while starving. The villages that
thrive (s8001/s8002/s8003-leadfeast, s8005: d182 survived, national,
table, Arc 4) do it on pantry food and wave-4 deeds — the shelling is
invisible in their ledgers. Nobody is saved by it; nobody is killed by it
(the 8 vs 5 is famine noise with no mechanism). The wall stands where the
corpus puts it: national and table routine (14/16 both arms), wave 4 open
(16/16), wave 5 a rumor (1/32), wins 0/32 — a scale-wall property, not an
arm effect.

## Design calls (Steve can overrule)

1. Faithful re-implementation, no gate changes vs the killed layer — the
   revival tests the ORIGINAL spec, not a tuned variant. (Decision: mine;
   overrule = retune the trigger, e.g. fire on counter nuts too — but that
   duplicates the landed shellrevive-b.js.)
2. Env var kept as SHELLCAMP=1 (same as the original); the -b2 suffix lives
   on the filename only, keeping retained analyzers' expectations stable.
3. Telemetry keys ctx.stShellDays / ctx.stShelledKcal / ctx._stShellDay kept
   identical to the original arm so the retained sweep/analyzer code reads
   them unchanged.
4. No spoilage gate on the nut batch (faithful to the original; the
   engine's eat flow discards rot, and the original ran 39 shell days with
   no rot incident). The s8008 sense read shows rot happening on the
   counter, which the pack layer never sees — a spoilage gate would not
   have changed PRIMARY(b).
5. The daily (pre-sleep) hook fires wherever the scholar beds down, not
   just at Haven — per the spec ("bedding down wherever they are"); the
   once-per-day guard keeps it to one firing.
6. Kill executed at pilot per the pre-registered kill-fast protocol: layer
   deleted zero-trace; instruments + evidence kept. The line now reads:
   killed (noise guardrail) → revival killed (engagement) → revival killed
   (engagement+displacement+survival) → revival killed (starvation-day
   engagement + guardrail). Recommend the findings backlog mark the pack
   shelling line CLOSED — the counter layer (landed) owns the starvation
   case.
