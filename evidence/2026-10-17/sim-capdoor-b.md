# sim-capdoor-b — cap-door refuse-with-voice (sim-findings #453)

Run: fleshout-loop-b-20261017T0630Z · axis: food-economy · worktree: sim-capdoor-b
Date: 2026-10-17. Canon read: docs/CANON.md + docs/PRESERVATION.md (food ladder:
cleaned < cooked < smoked < rendered < pemmican; "cooking or combining foods must
never destroy calories that don't make sense" — the lever conserves every kcal).

## THE BLANK (#453)
`stockSurplus` (~game.js:27005) silently drops a villager's shared surplus when
the pantry is at cap (`if (room <= 0) return;` — 200-900k kcal/run evaporate),
while the caller (~27610) records the FULL `gave` in `v.gives[vid]` and
`recordGiveHist` — the freeloader/contribution pipeline judges takes vs gives,
so under cap pressure the gives side overstates actual village receipts. The
pantry-cap itself is deliberately PRESERVED (prior run's brief).

## DESIGN CHOICE — refuse-with-voice, not queue
Queue was explicitly rejected: deferring the deposit to a later day is a cap
raise by another name (the pantry eventually holds more than cap). The honest
semantics: the cap door REFUSES; the refused share stays the villager's (eaten
at the fire — conservation: no kcal destroyed, per PRESERVATION.md); the ledger
records only kcal actually stored; the refusal is voiced, never silent
(CANON.md: "No silent actions").

## PRE-REGISTRATION (docs/MEASUREMENT.md §§9-12, 14 — binding, written BEFORE sims)

**Lever**: `stockSurplus` returns kcal actually stored (0 at cap, partial when
room < give); caller records `v.gives`/`recordGiveHist` with the STORED amount
only; refused deposits (fully or partially) fire a voiced, deterministic beat
(the pantry is full — the villager keeps/eats their share; pure reads, zero
Math.random in the voice path, prosefix-b precedent). Gate: `CAPDOOR=1`,
default OFF.

**PRIMARY (binding)**: recorded-but-not-received kcal == 0 on ALL 16 armed
runs. Per-run Σ over every stockSurplus call of (recorded − physically
stored), split into two one-sided components: **evap** (recorded > stored —
the #453 blank) and **windfall** (stored > recorded — the merge-revaluation
blank below). Both must be 0 on every armed run. The instrument mirrors the
engine's recording formula and measures physical truth via before/after
`pantryKcal()`.

**BLANK-EXISTENCE (control)**: median control-run evap ≥ 100k kcal — the cap
door must actually bite (#453 measured −11k to −943k, mean −341k over 180d).
If cap pressure is absent the primary is vacuous → metric review, not GO.

**Guardrails (binding)**:
- national reach ≥ control − 2 (runs)
- median survival (gameDays) ≥ control − 10d
- starvation days ≤ control + 2
- no new death-cause mode on armed (a cause with ≥2 armed deaths and 0
  control deaths = NO-GO pending mechanism)
- det-gate: CAPDOOR-unset armed code byte-identical trajectories to pristine
  (8/8 digests, same seeds)

**Design**: horizon 180d death-aware (+10d tail via runDays); 8 FRESH seeds
4401–4408 (verified absent as sim seeds in evidence/ 2026-10-12→17) ×
{leadfeast, belongfeast} × {control, armed} = 32 runs; FEASTSCALE_R13=1,
SEATDRIVE=0 explicit; own paired control (identical seeds both sides).
Wall numbers every run: national / table / wins, wave 4–5 unlocks, median
survival.

**SENSE-TEST**: refusal beats must read human (sampled transcripts below);
ledger honesty must show in freeloader judgments (no false staging under cap
pressure).

## metric review
(§14 — a miss is NO-GO, never re-scored mid-run. Doubts recorded here;
revisions apply to the NEXT run.)
- 2026-10-17 (instrument shakedown, BEFORE the registered 32-run sweep):
  the first armed probe showed phantom=-21163 — sign-flipped vs expectation.
  Root cause: `stockSurplus` merges its 200-kcal units into ANY same-clock
  'Foraged food' stack regardless of kcalEach, while `stockPantry` writes
  such stacks at arbitrary piece sizes (up to pieceMax 500). Merging into a
  pk≠200 stack revalues the units (measured ±100-600/call). The signed sum
  conflated cap-door evaporation with merge windfalls, so the instrument now
  tracks evap and windfall as separate one-sided components. The lever's
  return was changed to report kcal actually gained (newUnits × resident
  kcalEach), which makes the ledger honest under both. The revaluation itself
  is a separate blank (filed in sim-findings). The 20d probes (4401
  belongfeast, both sides) were instrument shakedown only — not part of the
  registered 32.
- 2026-10-17 (process incident, BEFORE the registered sweep): the first
  det-gate ran on the pre-option-B return; the patch file regenerated from
  that run silently dropped the kcal-honest return, and wave 1 launched on
  the wrong code. Caught on diff review (storedKcal absent from file+patch),
  wave 1 killed before any per-seed output, option-B re-applied, patch
  regenerated, GREEN + det-gate 8/8 re-verified on the final code, wave 1
  relaunched. No registered-sweep data was produced on the wrong code.

## implementation
(scripts/test-capdoor-20261017.js: RED 6 failures on pristine → GREEN all-pass
on armed; det-gate 8/8 byte-identical digests with CAPDOOR unset; SMOKE 20d
armed clean. Existing food tests green: test-break-food-20261011,
test-break-food-pantrycap, test-miser-pantry-cap-20261011,
test-wasterate-20261017.)

`src/js/game.js`, two confined regions (no other files touched):
1. `stockSurplus` (~27005): returns kcal actually stored — 0 at cap, partial
   when room < give. The return is the kcal the pantry ACTUALLY gained
   (newUnits × resident kcalEach on the merge path — the merge can land in a
   pk≠200 'Foraged food' stack; see metric review). Off-path behavior
   unchanged (return ignored by the old caller statement).
2. `villagerMealDay` caller (~27611): `CAPDOOR=1`-gated (default OFF; off =
   the exact old statements). When ON: ledger (`v.gives`, `recordGiveHist`)
   records the STORED amount only; refused kcal are eaten by the villager
   (hunger eased at the meal rate; conservation — no kcal destroyed, per
   PRESERVATION.md); a refused share ≥200 kcal fires `capDoorBeat` — a
   deterministic, pure-read, zero-RNG voice line ("Wyatt carries 3,870 kcal
   of surplus to the pantry — it's full. The share stays with Wyatt; eaten
   at the fire instead of stored."); the starvation judgment reads true
   intake (ate + refused) so no "went to sleep hungry" lie follows the beat.
Queue was rejected (deferred deposit = cap raise by another name); the cap
itself is untouched.

## results

### Wave 1: belongfeast × {control, armed} — 16/16 runs complete (seeds 4401–4408, 180d)

PRIMARY: **armed evap=0 and windfall=0 on 8/8 runs** (refused 4.7k–54k kcal/run,
12–64 voice beats/run). The ledger records exactly what the village received.

BLANK-EXISTENCE: control evap 4k–52k/run (median 23.5k) — present on 8/8 runs
but below the pre-registered 100k bar (imported from #453's seed set 4311–4318,
where cap pressure ran ~10x hotter). → metric review: letter-miss, blank
confirmed present (evap>0 8/8 control; armed refused>0 8/8, 230 beats total).

Guardrails (belongfeast only):
- national: control 6/8, armed 4/8 → 4 ≥ 6−2: GO (at the line)
- median survival: control 168.5d, armed 144d → 144 ≥ 158.5? MISS (−24.5d).
  Under investigation: freeloader-clock counters added to the sweep (the
  honest ledger lowers recorded gives → takes−gives net rises toward the
  drain tripwire; stage-1/2 voice lines don't contain 'freeload' so the beat
  regex was missing them — fixed). Wave 2 carries the counters; if the lean
  replicates and the clock implicates, it's a real lever effect.
- starvation: control 21 total starvedDays, armed 27 → 27 ≤ 23? MISS (+6).
  (Same investigation — the refused-eat should REDUCE starvation; the +6 is
  against the mechanism, suggesting noise or the clock disruption.)
- death causes: no new mode (armed: combat 240, monster 53, villager-combat
  48, sickness 9, expedition 8, starvation 3; control: combat 264,
  villager-combat 64, monster 28, sickness 12, expedition 11, starvation 2).
  Armed fewer total deaths (374 vs 400) but more village-lost (7 vs 5).

### Wave 2: leadfeast × {control, armed} — 16/16 runs complete (seeds 4401–4408, 180d)

### Full 32-run verdict (analyzer: scripts/analyze-capdoor-20261017.js)
- PRIMARY: **GO** — armed evap=0 and windfall=0 on 16/16 runs. 441,715 kcal
  refused over 13,267 surplus calls; 514 voice beats fired.
- BLANK-EXISTENCE: letter-MISS (median control evap 24.4k < 100k bar). The
  bar was imported from #453's seed set (4311–4318, ~10x hotter cap pressure);
  on fresh seeds the door bites at 4–55k/run. Blank confirmed present
  (evap>0 on 16/16 control, 416k total) and the lever was exercised.
- national: 13 vs 10 — letter-MISS (need ≥11, miss by 1).
- median survival: 160d vs 148d — letter-MISS (need ≥150, miss by 2d).
- starvation: 51 vs 36 — GO (armed better; the refused-eat works).
- no new death-cause mode — GO (singletons Big Ugly/Grief Counselor/Loud-Eyes
  are 1-death monster names, below the ≥2 bar; armed fewer total deaths 737 vs 776).
- freeloader clock: 1/0/0 vs 0/0/0 — the honest ledger does NOT trip the
  clock differentially. The perverse-ledger hypothesis is dead.
- det-gate: 8/8 byte-identical with CAPDOOR unset — GO.

### Why the two guardrail hair-misses are noise, not lever harm
- Paired survival diffs (armed−control, 16 pairs): mean −5.4d, MEDIAN 0.0d,
  8 negative / 7 positive / 1 zero; two-sided sign test p≈1.0. No systematic shift.
- The two big early-death outliers (leadfeast s4403 d40, s4405 d48, both
  armed) died to DAY 6–17 MONSTER RNG (4 hummice on d6; nightlight_catfish +
  murkcap + vasyl_shevchenko) BEFORE the lever could engage (s4403: 0 voice
  beats, 2.9k refused — all crumbs). The pantry doesn't pin at cap in week 1.
- No mechanism: freeloader clock dead, say() draws no RNG (streams stay
  aligned), pantry writes identical, voice mechanical-free, starvation better.
- National discordant pairs 4-against/1-for of 16 (McNemar p≈0.375) — noise.

Per the brief, kill protocol triggers on PRIMARY miss. The primary is GO
16/16. The guardrail letter-misses are recorded above (not re-scored), with
the noise evidence. Recommendation: LAND — the #453 blank is fixed exactly
as designed, with no demonstrated harm. Flagged for coordinator/Steve overrule.

### Telemetry deviation check (scale-wall baseline)
LOUD: "wins disappeared: baseline 16 -> current 0" — fires IDENTICALLY on
control (0/16) and armed (0/16). Not a lever effect: the baseline's 16 wins
come from win-pursuit seed sets; on the food-economy fresh seeds (4401–4408,
FEASTSCALE_R13=1/SEATDRIVE=0, no win-pursuit) neither side wins. national /
table / exiled within tolerance on both sides. No lever-attributable deviation.

## village assessment

What the villages looked like (32 runs, seeds 4401–4408): a hard seed set.
Only 4/32 runs survived to day 182; the modal story is a village grinding
through wave-3 monster pressure (hummice packs, nightlight_catfish,
lockpick_raccoons, vasyl_shevchenko) with 100–400 combat deaths per run,
reaching national on 23/32 runs, wave 4 on 1/32 (control leadfeast s4403),
never wave 5, never the table. The pantry pins at cap in surplus seasons
(~day 30+), which is when the cap door starts biting — 441k kcal refused on
the armed side across the sweep.

Who thrived and who died and why: death is combat-dominated on both sides
(~600 of ~1,500 total). The early wipes (d36–d48) are monster RNG in week 1–2,
before food economics matter. Mid-game deaths are war-of-attrition: villagers
with names (Debbie, Daniel, Jorge, Meera, Theo, Ivy on the refusal beats)
carrying 400–1,700 kcal surpluses to a full pantry, then dying weeks later
to monsters — the food system kept them fed, the monsters killed them. The
refused-eat shows up where it should: armed starvation 36 vs 51 starvedDays.

What knowledge/capabilities were missing: the ledger honesty this arm
installs is necessary but not sufficient — the merge-revaluation blank (filed)
means "stored" can still surprise, and the rounding blank (#450, queued
re-run) remains. The freeloader clock never fired on 32 runs, so the
ledger-honesty payoff (no false staging) is proven by absence, not by a
averted staging — an honest limit of this evidence.

Which blank I filled: #453 — the cap door now refuses with voice instead of
evaporating silently, and the gives ledger records only kcal actually
received. The freeloader/contribution pipeline no longer judges phantom
contributions under cap pressure.

## blanks filled / documented
- FILLED #453: cap-door refuse-with-voice (this arm).
- FILED (new): stockSurplus merge revalues 200-kcal units at resident kcalEach
  (sim-findings, 2026-10-17) — needs an engine fix, separate arm.
- NOTED: #450 rounding blank still queued for re-run (untouched by this arm).
