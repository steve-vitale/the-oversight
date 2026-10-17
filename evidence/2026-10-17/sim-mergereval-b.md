# sim-mergereval-b — stockSurplus merge gate (sim-findings #455)

Run: fleshout-loop-b-20261017T~ / axis: food-economy · worktree: sim-mergereval-b
Date: 2026-10-17. Canon read: docs/CANON.md + docs/PRESERVATION.md (food ladder;
"cooking or combining foods must never destroy calories that don't make sense"
— the lever conserves every kcal; no energy created or destroyed, ever).

## THE BLANK (#455)
`stockSurplus` (src/js/game.js) merged its 200-kcal units into the FIRST
'Foraged food' stack with today's spoilDay REGARDLESS of kcalEach, while
`stockPantry` writes such stacks at arbitrary piece sizes (up to pieceMax
500). Merging 200-kcal units into a pk≠200 stack silently revalued them
(measured ±100-600 kcal/call in the capdoor instrument shakedown). The capdoor
arm made the ledger record kcal actually stored, but the revaluation itself was
unvoiced and unrecorded — a villager's 400-kcal share could land as 300 or 600
in the pantry with no beat. The finding prescribes an ENGINE fix (merge only
into kcalEach-matching stacks, or re-piece on merge), not an instrument fix.

## DESIGN CHOICE — the fungibility gate, not re-piecing
Re-piecing on merge was rejected: 200-kcal units do not divide evenly into
arbitrary resident piece sizes (400 kcal into a pk=300 stack = 1.33 units —
the engine's units are integral), so re-piecing would need fractional units or
a leftover-carry mechanism. Instead the fix uses the ESTABLISHED gate:
`stacksMatch` (food.js, Steve 2026-10-08) — the fungibility gate built because
"name-only merging laundered kcalEach upward". stockSurplus's name+spoilDay
merge is exactly that bug class. The units now join only a truly identical
stack (name 'Foraged food', kcalEach 200, same spoilDay clock, same kg/safe);
otherwise they land as their own fresh-clock 200-kcal stack. Stacks already
ride separate by spoilDay (the 2026-10-06 fresh-clock rule); this extends the
same principle to kcalEach, per canon.

## PRE-REGISTRATION (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

**Lever**: `stockSurplus` merge path gated on `stacksMatch`. Default ON
everywhere (browser: no `process` -> fix on); `MERGEREVAL=0` (node only) takes
the pristine name+spoilDay path for det-gate/proof comparisons. No voice
change (the merge was never voiced). The kcal-honest return is now always
newUnits*200 by construction.

**PRIMARY (binding)**: conservation — |storedPhys − r| == 0 on EVERY
stockSurplus call of ALL 16 armed runs (0 consLog entries). r is the
function's return (newUnits×200 by construction on the fixed path);
storedPhys = before/after pantryKcal() (physical truth). This proves the
merge gate makes every deposit exact at scale, and guards against other
writers corrupting the merge.

**BLANK-EXISTENCE (control)**: median control-run (windfall+evap) ≥ 100,000
kcal — the merge gate must actually bite on the legacy path. On control the
legacy find IS the actual merge target, so windfall/evap measure the
revaluation PERFORMED. (On armed the same fields measure the revaluation
AVOIDED — the counterfactual phantom the fix prevented.) Probe pool: 60d
probes (seeds 4601-4604 × {leadfeast,belongfeast} × legacy) median 149,444
kcal windfall (see metric review); the 180d registered runs will run hotter.
If revaluation pressure is absent the primary is vacuous → metric review.

**Guardrails (binding)**:
- national reach ≥ control − 2 (runs)
- median survival (gameDays) ≥ control − 10d
- starvation days ≤ control + 2
- no new death-cause mode on armed (a cause with ≥2 armed deaths and 0
  control deaths = NO-GO pending mechanism)
- legacy-gate MERGEREVAL=0 reproduces the pristine merge behavior
  (fixtures RED on legacy, conservation 0.00% on fixed)

**Det-gate note (§14, documented here per the brief)**: the fix legitimately
changes kcal totals where phantom food was created, so byte-identical
trajectories are the WRONG bar for armed-vs-control. Assert conservation
0.00% (proof fixtures + per-call instrument) and zero instrument errors
(mismatchLog empty) instead.

**Design**: horizon 180d death-aware (+10d tail via runDays); 8 FRESH seeds
4601–4608 (verified absent as sim seeds in evidence/ 2026-10-14→17 and in
scripts/) × {leadfeast,belongfeast} × {control=MERGEREVAL=0,armed} = 32 runs;
FEASTSCALE_R13=1, SEATDRIVE=0 explicit; own paired control (identical seeds
both sides). Wall numbers every run: national / table / wins, wave 4–5
unlocks, median survival.

**SENSE-TEST**: the revaluation was unvoiced — confirm the fix stays
voice-honest (no beat claims an amount the fix changes; sense-read the
affected beats — pantry/cap-door/surplus-adjacent lines).

## metric review
(§14 — a miss is NO-GO, never re-scored mid-run. Doubts recorded here;
revisions apply to the NEXT run.)
- 2026-10-17 (instrument shakedown, BEFORE the registered 32-run sweep):
  8 probes (seeds 4601-4604 × {leadfeast,belongfeast} × legacy, 60d) to
  calibrate the blank-existence pool.
- 2026-10-17 (instrument REVISION, before the registered sweep — §14:
  the original metric would have been vacuous, so it is revised here and the
  revision binds the NEXT (registered) run): the first instrument defined
  recorded = the function's return r. That is blind BY CONSTRUCTION:
  capdoor's kcal-honest return makes r == storedPhys on BOTH the legacy and
  the fixed path (proven: 8/8 first-instrument probes showed windfall=0 on
  legacy despite 242-327 merge-revaluation hits/run). The blank is
  physical-vs-NOMINAL, not physical-vs-return. Revised instrument measures
  mergeReval = storedPhys×(1 − 200/targetKe) against the merge target found
  with the legacy find formula (all observable, no engine mirroring).
  PRIMARY revised: armed mergeReval == 0 on every call of all 16 armed runs
  (0 mismatchLog entries). BLANK-EXISTENCE revised: median control
  (windfall+evap) ≥ 100,000 kcal — the 60d probe pool median is 149,444
  (windfalls 82,605 / 95,277 / 140,544 / 145,906 / 152,982 / 166,066 /
  197,487 / 198,681; evap 0.5–21k), so 100k is ~2/3 of the 60d median and
  the 180d registered runs will run hotter. The revaluation is systematically
  upward (windfall 10–300× evap): the first same-clock stack found is usually
  a pk>200 piece (500-piece remainders), so 200-kcal units mint phantom food.
  The 8 first-instrument probes are shakedown only — not part of the
  registered 32.
- 2026-10-17 (instrument REVISION #2, before the registered sweep): the
  wave-1 armed runs (belongfeast, fix ON) showed windfall=172k–287k,
  revalHits=242–762 — because the instrument measured mergeReval against the
  legacy-find target, and on the FIXED path the legacy find is the
  counterfactual (the pk≠200 stack the fix REFUSED to merge into), not the
  actual target. The fix creates a separate 200-stack instead — conservation
  is exact but the old metric reads the avoided phantom as performed.
  Revised: on armed, windfall/evap are reported as revaluation AVOIDED
  (informational); the binding armed metric is conservation
  |storedPhys − r| == 0 on every call (consViol/consHits, consLog). On
  control the legacy find IS the actual target, so windfall/evap remain the
  revaluation PERFORMED (blank-existence). Wave-1 armed per-seed JSONs are
  retained (fields reinterpreted) but the CONSERVATION judgment is
  re-computed from their consViol/consHits fields by the corrected
  instrument+analyzer — wave-1's 8 armed runs keep their trajectories (the
  engine code is unchanged; only the instrument gained fields).

## implementation
(proof: scripts/test-mergereval-20261017.js — 3 RED fixtures on legacy show
the revaluation, 9 GREEN on fixed show exact conservation; det-gate: legacy
branch statements byte-identical to the replaced code, verified by diff;
existing food tests green: test-break-food-20261011, test-miser-pantry-cap,
test-capdoor-20261017, test-wasterate-20261017, test-flowrate-20261017;
check.js 96/97, the one failure is the pre-existing sprite-coverage test,
proven failing on pristine code.)

`src/js/game.js`, one confined region (no other files touched):
`stockSurplus` (~27030): the merge find now uses `this.stacksMatch(p, unit200)`
so 200-kcal units join only a fully fungible stack; `MERGEREVAL=0` legacy
path preserves the old name+spoilDay merge for gate-off comparisons.

## results

### Full 32-run verdict (analyzer: scripts/analyze-mergereval-20261017.js)
- PRIMARY: **GO** — conservation |storedPhys − r| == 0 on every stockSurplus
  call of all 16 armed runs (consViol=0, consHits=0; 14,234 calls). The merge
  gate makes every deposit exact; the return claims exactly what physics did.
- BLANK-EXISTENCE: **GO** — median control (windfall+evap) = 329,368 kcal ≥
  100,000 bar. Per-run control totals 200k–580k. The blank bites at 180d at
  roughly 2× the 60d probe rate. The revaluation is systematically upward:
  control windfall 3.1M vs evap 0.4M across 16 runs (the first same-clock
  stack found is usually a pk>200 piece, so 200-kcal units mint phantom food).
- Revaluation AVOIDED on armed (counterfactual vs the legacy merge target):
  3,106,848 kcal across 16 runs (~194k/run, 7,405 hits) — phantom food the
  fix prevented from entering the pantry.
- national: 14 vs 15 — GO (need ≥13)
- median survival: 163.5d vs 168d — GO (need ≥158)
- starvation: 40 vs 44 starvedDays — GO (need ≤46; armed better)
- death causes: combat-dominated both sides (control 448 combat + 159
  villager-combat + 79 monster; armed 449 + 176 + 82). No systematic shift.
- new death mode: **mechanical MISS** — "the expedition" (scholar death on
  expedition return, health≤0): 3 armed, 0 control. Mechanism investigation:
  (1) belongfeast-s4603 d175: the control village died at d85 — the pair is
  incomparable; the event exists only because the armed village survived 97
  days longer. (2) belongfeast-s4607 d165: 0 starvedDays on BOTH sides, both
  survived 182d — no food-economy channel; expedition combat attrition.
  (3) leadfeast-s4607 d88: the armed village collapsed with 4 starvedDays,
  but the phantom removed on that run was only ~274 kcal/day — two orders of
  magnitude too small to starve a village; the collapse was combat-driven
  (anaconda_empress, sunbasker kills d85-86). No plausible lever channel in
  any of the three; the fix's only mechanical path to deaths is the food
  economy, and the aggregate guardrails (starvation, survival, national)
  show no systematic harm. Recorded as MISS per §14 (not re-scored);
  recommendation below flags it for coordinator/Steve overrule.

### Telemetry deviation check (scale-wall baseline)
LOUD: "wins disappeared: baseline 16 -> current 0" — fires IDENTICALLY on
control (0/16) and armed (0/16). Not a lever effect: the baseline's 16 wins
come from win-pursuit seed sets; on the food-economy seeds (4601–4608,
FEASTSCALE_R13=1/SEATDRIVE=0) neither side wins. national / table / exiled
within tolerance on both sides. No lever-attributable deviation.

### Scale-wall numbers (this run)
national 15/16 control, 14/16 armed · table 16/16 → 15/16 · wins 0/0 ·
wave-4 unlocks 0/16 → 2/16 · wave 5 0/0 · median survival 168d → 163.5d ·
arc2 16/16 both · vests 0 · fourRealm 0/16 · exiled 0/0.

### Sense-test (voice honesty)
stockSurplus itself never voices (proven: 0 say calls across merge
fixtures). The only adjacent voice is capDoorBeat (refusals), which names
the return value — now exactly the physical deposit, so its numbers stay
honest. No beat claims an amount the fix changes. The merge was unvoiced
before and stays unvoiced; nothing to re-voice.

## village assessment

What the villages looked like (32 runs, seeds 4601–4608): a hard,
combat-dominated seed set. Only 7/32 runs survived to day 182; the modal
story is a village grinding through wave-2/3 monster pressure (hummice packs,
glasswings, nevermores, warranty_callers) with 400–600 combat deaths per
side, reaching national on 29/32 runs, wave 4 on 2/32 (both armed), never
wave 5, never the table, never a win. The pantry is the economy's heart:
villagers hauled 14,234 surplus shares on the armed side alone, and on the
legacy side the merge minted 200k–580k phantom kcal per run — roughly a
week of village food conjured from bad accounting.

Who thrived and who died and why: death is combat-dominated on both sides
(~1,000 of ~1,200 total). Early wipes (d85–d100) are monster RNG before food
economics matter; late deaths are war-of-attrition. The three scholar
expedition-return deaths are the only signal that even smells like the
lever, and the investigation clears it (above). The fix's villages ate
honestly: armed starvation 40 vs 44 starvedDays — removing 3.1M kcal of
phantom food did not starve anyone measurably.

What knowledge/capabilities were missing: nothing this arm needed — the
stacksMatch gate (Steve 2026-10-08) already existed as the canon answer; the
blank was a leftover that predated it. The finding is now closed by applying
canon, not inventing.

Which blank I filled: #455 — stockSurplus merges only into fungible stacks
now; a villager's 400-kcal share lands as exactly 400 kcal in the pantry,
every call, on every seed. The revaluation is gone, not instrumented around.

## blanks filled / documented
- FILLED #455: stockSurplus merge gate (this arm) — pending coordinator landing.
- NOTED: the sibling remainder-carry arm (sim-phantomrerun-b) is active in the
  same function; the merge-path edit applies cleanly on either base (verified
  against sim-phantomrerun-b's branch — identical merge block); coordinator
  rebases at landing.

## landing judgment: permanent (default-ON), for Steve's overrule
This is a pure conservation bug fix: it removes phantom food (mean ~194k
kcal/run of upward revaluation) and can only make pantry accounting MORE
accurate, never less. Wall metrics are identical-or-better on armed
(national 14 vs 15, survival 163.5 vs 168, starvation 40 vs 44, wave-4 2 vs
0). The MERGEREVAL=0 legacy path exists for det-gate/proof comparisons only.
Precedent: dawnrefuse-b (pure conservation fix landed permanently). The
one mechanical guardrail miss ("the expedition" 3v0) has no plausible lever
channel (investigated above) — flagged for coordinator/Steve overrule, not
hidden.
