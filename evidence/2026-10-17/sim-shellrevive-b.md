# sim-shellrevive-b — REVIVAL of the killed shelltask-b arm (loop B, run fleshout-b-2026-10-17, axis food-economy)

Revives sim-shelltask-b (evidence/2026-10-17/sim-shelltask-b.md, finding #479):
the policy-side camp-shelling layer (SHELLCAMP=1, default OFF; Game.shellNuts,
4 honest ticks, pack batch, net 75% of gross). The arm was KILLED on a
guardrail the metric review judged too literal (armed starvation 25 vs
control 24, literal <= bound, while 14/16 pairs were identical and the
mechanism was exonerated as pure gain). This run re-pins the layer and
re-judges it under the corrected §14 pre-registration.

## PRE-REGISTERED (binding, docs/MEASUREMENT.md §§9–12, 14–15)

- PRIMARY (both must hold):
  - (a) shelled-kcal converted >= 1k ON STARVATION DAYS across the armed
    side (mechanism engagement; control never shells);
  - (b) paired pantry-draw displacement >= 0 — sum over identical-seed
    pairs of (control scholarPantryTakes − armed scholarPantryTakes), the
    scholar's cumulative pantry draws in kcal from the engine's v.takes[vid]
    ledger. The pure-gain exoneration: the shelling must not divert village
    food (armed draws must not exceed control).
- GUARDRAILS: starvation deaths armed <= control+2 (NOISE MARGIN, replacing
  the killed run's literal <= bound); national >= control−2; median survival
  >= control−10d; no new death mode; det-gate byte-identical with the gate
  OFF (trajectories identical to pristine).
- HORIZON: 180d death-aware (runDays stops on village death +10d tail).
- SEEDS: 7601–7608 (FRESH; banned/used: 7001-7008, 4801-4808, 4101-4108,
  6101-6108, 9701-9708, 5201-5208, 931-938, 1801-1808, 4201-4208, 3801-3808,
  107-884, 1940809, 4701-4708, 7101-7108).
- POLICIES: {leadfeast, belongfeast} (FEASTSCALE_R13=1 substrate),
  SEATDRIVE=0 EXPLICIT. Own in-sweep control, identical seeds. Pairs stay
  inside one process (the sweep alternates arms per seed; the det-gate pins
  in-process identical trajectories).
- PROOF FIRST: scripts/test-shelltask-b.js re-pinned on the rebuilt layer —
  RED-verified (gate-on fixture fails pre-edit behavior check), GREEN
  post-edit; det-gate 16/16 byte-identical gate-off; SMOKE green.
- KILL FAST: if the mechanism cannot engage on fresh seeds, KILL at pilot
  and say so.
- §15: the official balance-panel driver cannot express this arm
  (policy-side layer, FEASTSCALE_R13 substrate, leadfeast/belongfeast are not
  panel policies; the contract lacks exiled/median-survival/starvation/
  shelled-kcal/pantry metrics; fabricating its validity gates would be
  dishonest). Per the escape hatch: light per-seed panel-schema JSONs for
  the wall metrics (evidence/2026-10-17/panel-shellrevive/) + the panel's
  own compareMetric paired-interval statistics on the contract-overlapping
  metrics (won/table/national/survival30/60); pre-registered metrics judged
  directly. Deviation noted under "metric review".

## The lever (policy-side, scripts/policies/shelltask-b.js, SHELLCAMP=1 default OFF)

Rebuilt per the sim-shelltask-b spec (the killed run's file was deleted
zero-trace; this is a fresh write against the same spec, re-pinned by the
retained proof test). `withShellTask(base)` wraps the feastscale policies:
- upkeep hook: at Haven camp — playerAtHaven, scholar can act, lean day,
  time to spare → Game.shellNuts() once/day;
- daily hook: bedding down wherever, pre-sleep (before base.daily), same
  gates.
- Gates: SHELLCAMP=1; scholar alive (exiles allowed); no tbfight (tickAction
  no-ops mid-fight); no active contest; lean day = kcal < kcalCap AND no
  edible pack food AND ≥1 in-shell nut item; time to spare =
  dayTicks + 4 + 64 < TICKS_PER_DAY (never rolls the day, never enters the
  sleep-refusal window); once per day (ctx._stShellDay).
- Telemetry on ctx: stShellDays, stShelledKcal (engine-formula net 75%),
  _stShellDay.
- Zero src/js changes. No new narration — the layer voices only the
  engine's normal task fiction via Game.shellNuts() (no [needs-eyes]).

## Proof (scripts/test-shelltask-b.js) — 14/14 GREEN on the rebuilt layer

- PART A (gate-logic units, 9/9): shellableNuts finds in-shell nuts / ignores
  edible food; leanDay true only when hungry + nuts-only pack; timeToSpare
  true mid-day, false with the day nearly spent; layerOn() default OFF.
- PART B (RED->GREEN fixture, live engine, constructed lean camp state):
  RED — base belongfeast upkeep leaves in-shell nuts untouched (behavior
  absent pre-edit). GREEN — wrapped upkeep (SHELLCAMP=1) shells the pack
  batch at Haven, then the engine's normal pack-eat verb eats them.
- PART C (det-gate): wrapped policy with SHELLCAMP unset vs unwrapped base,
  per-day trajectory hashes, 60d x 8 seeds x 2 policies — 16/16
  byte-identical, no layer-attributable divergence.
- PART D (SMOKE): 2 seeds x 2 policies x {control,armed}, 12d — 8/8 no
  exceptions.

## Before / after (pilot: 32 runs, seeds 7601–7608 x 2 policies x {control,armed}, 180d death-aware)

| metric | control (16) | armed (16) |
|---|---|---|
| shell days | 0 | 3 |
| shelled kcal converted (total) | 0 | 376 |
| shelled kcal ON STARVATION DAYS (primary a) | 0 | 0 |
| eat kcal on shell days (proxy) | 0 | 9,239 |
| scholar pantry takes, kcal (engine v.takes[vid]) | 486,500 | 451,179 |
| paired pantry-draw displacement, control−armed (primary b) | — | +35,321 |
| starvation deaths | 7 | 7 |
| player starvation deaths | 0 | 0 |
| paired starvation sign (better/worse/tied) | — | 0 / 0 / 16 |
| national | 13/16 | 13/16 |
| table | 15/16 | 15/16 |
| wins | 0 | 0 |
| exiled | 0 | 0 |
| wave4 / wave5 | 1 / 0 | 1 / 0 |
| arc2 / arc3 / arc4 | 16 / 16 / 15 | 16 / 16 / 15 |
| fourRealm | 0 / 16 | 0 / 16 |
| median survival | 162d | 157d |
| max survival | 182d | 182d |

Death-cause histogram matched almost exactly (combat 433/423, villager
combat 141/140, monster 80/78, expedition 41/41, wound-that-wouldn't-close
9/9, sickness 8/8, starvation 7/7, contest 5/5) — the layer moved nothing
about how villages die.

Engagement by run (armed): s7605-leadfeast 2 days / 226 kcal;
s7608-belongfeast 1 day / 150 kcal; all other 14 armed runs 0. Control
never shells (0 by construction and by measurement).

## Panel compare (evidence/2026-10-17/panel-shellrevive/compare-shellrevive-b.md)

Light per-seed panel-schema JSONs (control.json / armed.json) for the wall
metrics (national/table/wins/exiled/survivalDays/starvationDeaths) plus arm
metrics (shelledKcal/shelledKcalStarvDays/scholarPantryTakes). The panel's
own compareMetric paired-interval statistics on the contract-overlapping
metrics: won/table/national/survival30/survival60 all delta +0.000 with
status descriptive/no_material_signal (16/16 paired cases, >= minimumPairs
8). Compare .md attached in panel-shellrevive/.

## Verdict: NO-GO — KILLED at pilot (pre-registered kill-fast condition)

PRIMARY(a) MISSED: 0 kcal shelled on starvation days vs the ≥1k GO
threshold. Per MEASUREMENT.md §14 the miss binds — NO-GO, never re-scored
mid-run. The pre-registration named the exact condition: "if the mechanism
cannot engage (nuts never in pack on lean days on fresh seeds), KILL at
pilot and say so." The layer (scripts/policies/shelltask-b.js) is deleted
zero-trace; instruments + evidence kept and committed.

Guardrail note (all HOLD, for the record): starvation 7 <= 7+2 (16/16
pairs tied); national 13 >= 13−2; median survival 157d >= 162−10d;
no new death mode; det-gate 16/16 byte-identical gate-off; PRIMARY(b)
pantry displacement +35,321 kcal >= 0. The arm died on engagement, not on
harm — exactly the fast kill the pre-registration was designed for.

## Telemetry deviation check

`telemetry-check.js` vs scale-wall.json baseline
({national:12, table:16, wins:16, exiled:0}), n=32 files: three LOUD
lines — national 12→26, table 16→30, wins 16→0. Hand-verified per the
schema-gap finding: BOTH arms agree identically (national 13/13, table
15/15, wins 0/0, exiled 0/0). This corpus (seeds 7601–7608, pre-seat
r13-only substrate, FEASTSCALE_R13=1/SEATDRIVE=0) reaches wave 4 once and
never wins — wins are a corpus/substrate property (no modal driver on the
feastscale road; the takes​eat stack is separate), not an arm effect.
TRIAGED AS EXPLAINED substrate-mismatch per the brief; baseline NOT rolled.

## Metric review (mandatory)

1. ENGAGEMENT SUBSTRATE IS SEED-SPORADIC. The PRIMARY(a) threshold (≥1k
   kcal on starvation days) correctly killed this arm — but note the shape:
   the 7001–7008 corpus engaged 39 days / 41,404 kcal, dominated by one
   seed (s7003: 26 days). The fresh 7601–7608 corpus engaged 3 days /
   376 kcal. The "nuts in pack on lean days" state does not transfer across
   seed sets. A future revival should not assume engagement from an old
   corpus; the pilot on fresh seeds IS the honest screen (and it worked).
   The threshold itself needs no revision — it did its job.
2. GATE AUDIT EXONERATES THE LAYER. scripts/diag-shellrevive-gates.js
   (s7605-leadfeast-armed, 138d): hungryNutDays=2, leanTrue=2,
   blockedAct=0, blockedTime=0, fired=2 — the layer fired on 100% of lean
   days. Zero missed opportunities; the non-engagement is pure substrate
   (nuts almost never in pack on lean days), not a layer bug. The proof
   (14/14) + gate audit jointly close the "wired wrong" question for this
   arm.
3. PANTRY-DISPLACEMENT INSTRUMENT WORKS. PRIMARY(b) (control − armed
   scholar pantry takes ≥ 0) held at +35,321 kcal over 16/16 pairs, with no
   nulls. Caveat: on a non-engaging arm this mostly measures trajectory
   noise, not displacement — the instrument is validated, but its
   exoneration power is proportional to engagement. Keep the instrument for
   future food arms.
4. BRIEF PARENTHETICAL AMBIGUITY. The corrected pre-registration read
   "(armed pantry kcal/day >= control — the pure-gain exoneration)". I
   implemented displacement = (control − armed) ≥ 0 per the stated
   rationale ("the shelling must not divert village food"; armed draws
   must not exceed control). The alternative literal reading (armed draws
   ≥ control) would REWARD village-food diversion and contradicts the
   exoneration — treated as a typo, flagging here.
5. §15 DEVIATION. The official balance-panel driver cannot express this
   arm (policy-side layer; FEASTSCALE_R13 substrate; leadfeast/belongfeast
   are not panel policies; the contract lacks exiled/median-survival/
   starvation/shelled-kcal/pantry metrics; its validity gates
   (neutrality, sourcesStable) cannot be honestly satisfied by a light
   emission). Per the task's escape hatch: light per-seed panel-schema
   JSONs emitted for the wall + arm metrics, the panel's own
   compareMetric paired-interval statistics run on the contract-overlapping
   metrics (won/table/national/survival30/survival60 — all no_material_signal),
   and the pre-registered metrics judged directly. Deviation noted here.

## Reachability verdict

Policy-side food lever; no content gates touched. Wall numbers on this
corpus (both sides): national 13/16, table 15/16, wins 0/16, wave-4 1/16,
wave-5 0/16, median survival ~160d, fourRealm 0/16. The wave-4/5 near-zeros
and the win zero are corpus/substrate properties (pre-seat r13 road, no
modal driver) — both sides agree identically, so the arm changed nothing
about reachability.

## Village assessment (plain words)

Two kinds of villages on this corpus, and the shelling mattered to
neither. The thriving kind (s7601-leadfeast, s7603 runs, s7607-leadfeast:
d182 survived, national, table, Arc 4): deep runs where the pantry held
and the scholar never went hungry with nuts in hand — the layer never had
a lean day to answer. The dying kind (s7602-leadfeast: d82 village-lost,
6 starvation deaths both arms; s7606-belongfeast: d71): famine and combat
killed these villages while the scholar's pack held no nuts to crack —
the hunger was real and the ladder's first rung was simply absent from the
pack. The one place the layer did fire (s7605-leadfeast d91/d94,
s7608-belongfeast) reads like a person taking stock (see sense-test), but
3 days across 16 runs is a footnote, not a lever. Combat remains the
standing killer (~430 combat deaths a side); starvation is the margin
(7 a side, 16/16 pairs tied). The blank from #479 stands: scholars still
have no camp food processing, and on this corpus they didn't even have
the nuts.

## Sense-test (SENSE-TESTING LAW — transcript read)

Read s7605-leadfeast-armed d91/d94 (evidence/2026-10-17/sense-shellrevive-s7605.txt,
the only firing days on the fresh corpus). It reads like a person, not a
script: groundnut rots overnight ("beyond saving — you leave it for the
flies"), hunger gnaws, the engine's honest refusal ("Nothing edible.
(White Oak Acorns (in shell), unknown nuts — not food yet: Needs shelling
— crack and pick the nutmeats. (Shell action).)"), then the act ("You
crack and pick 1 lot of nuts. Shells everywhere — the net is less than
the gross looked. (4 ticks)"), then foraging with practiced hands (9×
White Oak Acorns), and around the fire Farid teaching Beechnut ("See the
leaves? Like that. Don't mix it up." — the Codex grows the human way).
The d91 beat even carries the starvation warning honestly ("You went to
bed on an empty stomach") alongside an Emberhold tribute beat with real
trust consequences. Villagers act like people where sampled: teaching,
noticing, paying. The mechanism is coherent and human — it just almost
never gets the chance. The fiction deserves an engagement substrate, not
a burial of the idea: the kill is on the seed set, not the design.
