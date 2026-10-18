# sim-huntdefense-b — defense-coverage decomposition of the huntstaff-b2 +51 (DIAGNOSTIC, read-only)

Run fleshout-b-20261018T0030Z, loop B food-economy axis. Zero src/js changes, zero
policy changes, zero new sims. Instrument: scripts/analyze-huntdefense-b.js (deterministic,
stable-stringified, byte-identical re-run proven) + scripts/test-huntdefense-b.js (ALL GREEN:
determinism, read-only corpus checksums, invariant checks). Machine output:
evidence/2026-10-18/huntdefense-b-analysis.json.

Canon read: docs/CANON.md (this run). Hunting is human-skill lane; the staffing layer assigns
LABOR, never an alien ability. No canon doc covers village defense coverage — there is no
defense-roster concept in canon or in the engine (see Mechanism note below).

The question (from sim-huntstaff-b2's metric review): the hunt-staffing layer engaged
(151 assignments, 104 kills, 306,589 kcal) and NO-GO'd per §14 on villager deaths
615 vs 564 (+51, +9%), with 0 hunt-attributable deaths among the 151 assigned hunters.
Is the +51 (a) INDIRECT LAYER HARM — hunters pulled from village defense, (b) COMBAT NOISE,
or (c) something else?

## PRE-REGISTRATION (binding; written BEFORE analysis — MEASUREMENT.md §14)

- **PRIMARY:** share of the +51 armed−control villager-death delta attributed to
  defense-absence = Σ_pairs (armed combat-ish non-assigned-hunter deaths on
  hunt-exposed days − control deaths on matched days) / extra deaths.
  Hunt-exposed day = hunt-assignment day d, or d+1. Combat-ish cause = combat |
  monster | ambush | named-monster cause. Combat-capable = hunterOcc true OR occ in
  the hunter-substrate word list. **GO ≥ 80% attributed.**
  (Denominator note, same-run discovery: the raw +51 includes tele-duplicate records;
  the honest deduped extra-death count is +31. Both denominators reported; neither
  reaches the bar.)
- **Lenses:** (i) timing — armed extra deaths on hunt-assignment days vs control matched
  days; (ii) cause shares — is the delta combat/monster or other; (iii) who died —
  occupation/combat-capability of the extra dead vs the hunters' defense role;
  (iv) raid outcomes on hunt days vs non-hunt days.
- **Verdict classes (judged in order):** 1. DEFENSE-HARM  2. NOISE (no timing/cause/who
  pattern; delta consistent with the substrate's combat-noise band — b-pilot band cited)
  3. UNRESOLVED-BUT-SCOPED.
- **HORIZON/SEEDS/POLICIES:** inherited from the b2 corpus — 32 runs, seeds 7811-7818 ×
  {leadfeast,belongfeast} × {armed,control}, 180d death-aware, FEASTSCALE_R13=1/SEATDRIVE=0.
- **COMPLETION GATES:** analyzer runs clean on the landed corpus, byte-identical re-run,
  proof test green, corpus untouched (sha1-verified before/after).

## Same-run discovery: the +51 is inflated by tele-duplication (instrument artifact)

The hunter-fate instrument records every `Game.tele('death')` event. The engine
re-emits the death tele on some kill paths — the same (who, day, cause) recorded up to
**9×** (armed-belongfeast-s7811: `ducks_in_a_row` d94 'combat' ×9). A villager dies once;
dedup on (who, day, cause) is legitimate. No record lacks who/day/cause.

- Raw (as the b2 guardrail saw it): armed 615 vs control 564, **+51**.
- Deduped: armed 562 vs control 531, **+31**.
- Duplicate extra records: armed 53, control 33 — the duplication is bursty and
  asymmetric in realization (+20 net to the delta) but present in both arms.
- Both the raw +51 and the deduped +31 are consistent with the noise band (below);
  the verdict does not depend on which denominator is used.

## Attribution breakdown (the four lenses)

**PRIMARY: −3.2% attributed (deduped +31 denominator; −2.0% of the raw +51).**
Window combat deaths (combat-ish, non-assigned-hunter, on hunt-exposed days):
armed **31** vs control **32** on matched days → attributed −1. **Zero of the 31 armed
window combat deaths were combat-capable** (no hunterOcc, no hunter-word occupation).
GO bar ≥80% missed by two orders of magnitude. Verdict class 1 (DEFENSE-HARM) rejected.

**(i) Timing.** Within-armed, death rate on hunt-window days is elevated: 0.308/day
(65 deaths / 211 window-days) vs 0.221/day elsewhere. But control on the SAME calendar
days is flat: 0.232 vs 0.234 — the days are not per-seed dangerous days, and the
controlled comparison shows armed windows are NOT deadlier than control's (31 vs 32
combat deaths). The within-armed elevation is a lean-day confound: the layer fires
exactly when the village is lean (gate a: pantryFreshDays<4 or scholar kcal low), and
lean days are desperate days — the window excess is villager combat +12, combat +8,
expedition +3, while plain 'monster' deaths are LOWER in armed windows (−8). A
defense-absence story predicts +monster/+combat, not +villager-on-villager killing.

**(ii) Cause shares (deduped).** The +31 = combat +13, **villager combat +13**,
the phoenix link +7, named monsters +4, minus small negatives (contest −3, expedition −3,
monster −1...). Two facts kill the defense story: (a) 'villager combat' —
villager-on-villager violence (corruption/psychosis/fights) — has no defense-absence
mechanism and contributes +13; (b) 'the phoenix link' +7 is a SINGLE mass-death event
(one run, armed-7814-leadfeast, d121, 7 villagers incl. a Butcher, an ER nurse and a
nurse) — an ability-chain event that fired in armed and not control by butterfly luck,
pure substrate burst. (c) something else, scoped: the residual villager-combat
clustering on lean/hunt days is a bounded unknown — lean-day desperation confound is
the leading hypothesis; assignment-friction (assignTask → leadershipFriction) is the
alternative. Either way it is not defense harm.

**(iii) Who died.** Deduped occupation delta is dominated by occ-less villagers +23
(random villagers, not defenders); named occupations contribute ≤+4 each (Fisherman +4,
blacksmith/farmer/line cook/mechanic/musician/street artist/trail crew lead +2 each).
Hunter-occupation deaths: armed 12 vs control 9 (+3 — the hunter-fate instrument's own
number, unchanged by dedup). No defender-profile pattern: the extra dead are not the
fighters who would "hold the line."

**(iv) Raid outcomes on hunt days vs non-hunt days: NOT MEASURABLE** — the per-seed
schema carries no raid telemetry (key list verified in the analyzer). Scoped as a
revival-spec item, but see the Mechanism note: there is no raid-on-Haven mechanic
whose outcomes could be measured.

**Mechanism note (read from src/js, no changes): the layer CANNOT pull defenders.**
`villagerHuntResolve` (game.js 6164+) never moves the villager — no moveVillager /
setVillagerTile call; the duty resolves abstractly against a prey tile. Village
"defense" is not a roster: `villagerMonsterTick` hits whoever stands on a monster's
tile, and the `_outdoorCrew` mechanic (game.js 6074) actually gives assigned hunters
ALLIES in wild fights. Defense-harm is not just unmeasured — it is mechanistically
implausible in this engine version.

**Noise band (independent):** the b pilot (same layer spec, seeds 7801-7808, schema
huntstaff-wall/1) gives 16 paired villager-death deltas with sd **12.87**, mean −2.81.
b2's deduped mean +1.94 is **0.60σ from zero** under that band; b2-vs-pilot
diff-of-means z = 1.09. The identical layer PASSED this same count guardrail in the
pilot (mean −2.81) and FAILED it in b2 (mean +3.19) — a one-sided count gate on a
±13 sd substrate flips sign run-to-run on pure noise. No dose-response either:
heaviest engagement (7818 belongfeast, 33 assignments) → +26, but 17 assignments →
−21 and 14 assignments → −3.

## VERDICT: NOISE

Class 2 of 3, judged in order. Defense-harm rejected (−3% attribution, zero
combat-capable window deaths, no mechanism). The +51 (+31 honest) is the combat
lottery plus a tele-duplication artifact plus one phoenix-link burst — all inside the
substrate's measured noise band.

**Guardrail judgment (as the brief requires): the villager-deaths guardrail as
specified (armed ≤ control, one-sided count gate) is METRIC-BROKEN, not salvageable
in its current form.** Under the null it false-fires ~50% of runs; it flipped on the
identical layer between pilot and b2. Salvage paths for a revival: (a) replace the
global count gate with the mechanism-specific attribution instrument built here
(pre-register "hunt-window combat deaths armed−control on matched days ≤ small bar" —
this run measured −1); (b) demote raw villager-death counts to a §15 panel
regression_watch instead of an every-gate kill switch; (c) any death-count gate must
dedup on (who,day,cause) — the sweep counter double-counts today. The count gate's
intent (don't let a layer kill villagers) is right; its specification measures noise.

## Revival spec (what a defense-aware staffing re-attempt must gate on)

1. Per-seed schema must add raid/wild-encounter telemetry (encounters per day, tile,
   participants) — lens (iv) is currently unmeasurable.
2. Death instrument must dedup on (who,day,cause) before any count gate.
3. Pre-register the window-attribution instrument (scripts/analyze-huntdefense-b.js)
   as the defense guardrail, not raw counts; GO bar on attributed share, not totals.
4. Measure the villager-combat-on-lean-days confound explicitly (lean-day
   villager-combat rate with/without assignment) — the one bounded residual.
5. Note for the revival: the engine has no defense-coverage state; a "defense-aware"
   variant cannot gate on coverage that doesn't exist — the honest revival question
   is whether hunt-day *desperation* (lean-day firing) raises villager conflict.

## Metric review (mandatory)

- PRIMARY answered exactly: −3.2% attributed (deduped), −2.0% of raw +51; GO ≥80%
  missed. The instrument worked as designed — the defense-coverage question the b2
  metric review named is now answered.
- The dedup discovery changes the guardrail's input (+51 → +31) but not its
  conclusion; both are noise. Reported both, per §14 honesty.
- The |mean Δ|≤20d survival gate (b2's corrected gate) is unaffected by this run.
- The timing lens's within-armed elevation (0.308 vs 0.221) is reported with its
  confound analysis rather than hidden — the controlled comparison is the judge.
- No metric was re-scored mid-run. The villager-deaths guardrail critique above is
  a revision proposal for the NEXT run, per §14.

## Sense-test (law)

Read the death beats of extra-death cases on hunt days (7818 belongfeast, +26 pair,
33 assignments — heaviest engagement; 7814 belongfeast window cluster):

- d29: `nightcourt` — combat. d29: `hushwolf` — villager combat. d30: `rut_king` —
  combat. d31: Ursula Weber the Mortician — monster. d31: `bright_idea` — villager
  combat. d55: `cliffhanger` — villager combat. d62: `lockpick_raccoon` — villager
  combat. None of the assigned hunters. Nobody reads as "the hunters were away so
  the monsters overran the walls" — the village's hunt-day problem is its own
  people killing each other (villager combat) and ordinary wild encounters, i.e.
  ordinary chaos on desperate lean days. The one genuinely alarming beat — 7 dead
  of 'the phoenix link' on d121 — is a single ability-chain burst, unrelated to
  hunting, that happened to fire in the armed run.
- The hunting fiction itself is coherent (b2 sense-test stands): named hunters,
  real kills, meat the village eats. The deaths do not read as the hunt going wrong.

## Wall numbers (standing directive — from the b2 corpus, unchanged by this run)

national 14/16 armed vs 11/16 control · table 14/16 both · wins 0/16 both ·
wave-4 1/16 vs 0/16 · wave-5 0/16 both · Arc IV 14/16 both · starvation deaths 1 vs 2 ·
median survival 169.5d vs 150.5d (b2 evidence). The scale wall is unmoved by hunt
staffing; the food-economy on-ramp question is untouched by this diagnostic.

## Village assessment

Sixteen villages staffed their hunters on lean days — 151 assignments across 14 of 16
armed runs, 104 real kills, 306,589 kcal of meat into pantries that the villages ate
(starvation deaths 1 vs 2). The hunters came home: 0 hunt-attributable deaths, and the
12 hunter-occupation deaths (vs 9 control) were ordinary combat days after assignment.
Who died extra: random occ-less villagers, a Fisherman here, a line cook there —
fighters, foragers, and nobodies in the proportions the combat lottery always deals.
The +51 that killed the layer decomposes into a tele-duplication artifact (+20 net),
one phoenix-link burst (+7), and ordinary combat/villager-combat scatter (+13/+13) —
all inside the substrate's measured ±13 sd noise band, which the identical layer had
already demonstrated by passing the same gate in the pilot. The blank I filled: the
defense-coverage instrument the b2 metric review asked for — built, proven
deterministic, and it answers the question: the village did not bleed for lack of
defenders; there was no defense to deplete. What I could not fill: raid-outcome
telemetry doesn't exist in the per-seed schema, and the villager-combat-on-lean-days
residual is scoped, not solved — both are specified for the revival.

## Findings backlog

- Appended: tele-duplication of death records (open; instrument area).
