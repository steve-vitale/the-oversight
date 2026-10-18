# sim-huntstaff-b4 — hunt-duty staffing layer, the per-pair-collapse-aware re-attempt (ARM sim-huntstaff-b4)

Lever arm, loop B food-economy axis, run fleshout-b-20261018T0830Z.
The fourth attempt at the hunt-duty staffing layer, with the REVISED
starvation guardrail spec from the sim-huntstaff-b3 metric review (per-pair
starvation judging, collapse-seed pairs judged on hunter-fate + food-added
lens, hunter-only gating pinned, noise-scaled survival, hunter-fate
instrument). The line is 0-for-3 on the old guardrail spec:
- b (1940Z): KILLED at pilot on a metric-broken median gate.
- b2 (2320Z): PRIMARY GO (151 assignments, 8/8 seeds) but KILLED on the
  villager-deaths count guardrail (armed 615 vs 564, +51).
- b3 (0648Z): PRIMARY GO (170 assignments, 8/8 seeds, ~1.18M kcal);
  defense guardrail GO (attributed share 0.000, capable excess −1);
  survival PASS (−11.69d); KILLED on the pooled starvation guardrail
  (armed 4 vs bar control+2=3 — all 4 on collapse seed s8282, assigned
  hunter survived, layer ADDED food).

The mechanism engages every time (48/151/170 assignments). The question
is purely whether it survives the HONEST gate. Read
evidence/2026-10-18/sim-huntstaff-b3.md fully (its metric review writes
the b4 spec), evidence/2026-10-17/sim-huntstaff-b2.md ("The layer" —
the rebuild source), and evidence/2026-10-18/sim-huntdefense-b.md
("Revival spec") before judging.

## PRE-REGISTRATION (binding; written BEFORE sims — MEASUREMENT.md §14)

- **PRIMARY (mechanism):** hunt-duty engagement — armed ≥ 48 hunt-duty
  assignments fired across the sweep AND ≥ 4 of 8 seeds engage (≥1
  assignment each), vs control == 0 (no base policy assigns hunt). Kill
  at pilot if the mechanism doesn't engage. (The line has done 48/151/170
  across b/b2/b3; the bar is the mechanism's floor.)
- **STARVATION GUARDRAIL (revised, per-pair, collapse-aware):** per
  seed×policy pair, armed villager starvation (tele kind person/villager
  ONLY — findings #517/#525, monsters pollute the death tele; cause
  starvation; non-player; deduped on (who,day,cause); day < that run's
  villageLostDay) ≤ control + 1. Pooled bound: armed ≤ control + 3 (over
  non-village-lost pairs only). Any village-lost pair (either run ended
  village-lost) is judged on the hunter-fate + food-added lens, not the
  count: (a) zero starvation deaths among ASSIGNED HUNTERS of that run
  (the mechanism the layer controls), and (b) the layer added food
  (huntKcal > 0) — the opposite of the starvation-harm mechanism. A miss
  is NO-GO, never re-scored.
- **HUNTER-ONLY GATING:** the layer assigns ONLY hunter-substrate
  villagers (formerOccupation matches the hunt word-list — the engine has
  no separate hunter flag; the word-list IS the substrate definition).
  Pinned by proof fixture (test-huntstaff-b4.js PART A, three pin checks).
  Any non-substrate assignment in the sweep corpus = hard NO-GO (the
  gate is the layer's identity, not a tuning number).
- **DEFENSE GUARDRAIL:** the b3 window-attribution instrument
  (scripts/analyze-huntdefense-b3.js, deterministic) on VILLAGER deaths
  only (kind person/villager, deduped on (who,day,cause)): GO bar =
  attributed share of any armed−control villager-death delta < 50% AND
  no combat-capable villager death on a hunt-exposed day (hunt day d or
  d+1) in excess of control (armed matched-window combat-capable deaths
  − control ≤ 0). If the deduped villager-death delta ≤ 0, attributed
  share is 0 → GO. Combat-capable = hunter-substrate word-list match.
  The raw count gate stays demoted to regression_watch.
- **SURVIVAL GUARDRAIL:** |mean paired survival Δ| ≤ 20d (paired per
  seed×policy: armed−control gameDays) — noise-scaled, not ±10d.
- **WALL (report-only):** national / table / wins / wave4-5 / median
  survival / Arc reach / four-realm formation.
- **PILOT GATE:** 8 seeds before ANY confirm spend. Fresh seeds —
  verified zero seed-usage matches in evidence/ (grep over all of
  evidence/ for s<seed>/SEEDS=/seed-patterns): 8450, 8473, 8496, 8518,
  8541, 8566, 8589, 8612 (fresh vs 7801–7808 (b), 7811–7818 (b2),
  8092–8341 (b3)). 2 policies (leadfeast, belongfeast) × 2 arms × 8
  seeds = 32 runs. Own paired control, identical seeds both sides,
  FEASTSCALE_R13=1/SEATDRIVE=0 explicit (pre-seat), 180d death-aware.
- **CONFIRM:** only if pilot GO on every gate: 12–16 seeds.
- **ALSO MEASURED:** item 1 — per-seed wild-encounter telemetry
  (encounters/day/tile/participants/outcome; read-only wrap,
  zero RNG draws); item 4 — lean-day wild-encounter monster-kill rate
  with/without assignment; hunter-fate instrument (assigned-hunter
  deaths, 0 hunt-attributable target); finding #528 — per-day
  v.taskLeads snapshots alongside the assignTask wrap (engine hunt
  duties bypass the instrument — the b3 "control == 0" caveat, now
  measured); villageLostDay per run (bounds the starvation count).
- **§15 balanced panel:** per-seed panel-schema JSONs (schema
  'huntstaff-wall/4') via scripts/build-huntstaff-panels-b4.js; compare
  .md attached. (Deviation noted: the official panel driver cannot
  express per-pair collapse-aware gates, so the panel carries the wall
  metrics only; the pre-registered gates are judged from the per-seed
  corpus + analyzer output. The panel is the instrument, the
  pre-registered thresholds are the judge.)
- **SENSE-TESTING LAW:** read a hunt day's beats for 2–3 villagers
  (departure, the hunt, the return) — judge people-like behavior, not
  counts. 2 short sense-reads below.
- **VERDICT:** GO / NO-GO-KILLED. A guardrail miss is NO-GO per §14 —
  never re-scored mid-run; metric doubts go under "metric review" for
  the next run. GO → layer lands default OFF (HUNTSTAFF=1), instruments
  + evidence commit. NO-GO → delete the layer zero-trace, INFO-SKIP the
  proof, commit instruments + evidence as KILLED.

## Canon read

- docs/CANON.md (this run). Hunting is human-skill lane — the layer assigns
  LABOR, never an alien ability. Human skills ≠ alien abilities: no System
  slot, no magic.
- docs/PRESERVATION.md (b2 run): hunt returns 'Game meat' — first rung of
  the preservation ladder; the layer only puts meat in the pipeline.
- docs/BEAR.md (b run): the safety argument for gates (b)/(c) —
  only hunter-substrate, HP≥40, trust≥40, one hunter at a time; the
  engine's HP/in-person/obedience gates stay as the last word.
- docs/TIME-ECONOMY.md (b2 run): assignTask is a 2-tick social move.
- No canon doc covers village defense coverage; per the huntdefense-b
  mechanism note the engine has no defense-roster concept (villagerMonsterTick
  hits whoever stands on the monster's tile; _outdoorCrew gives assigned
  hunters allies in wild fights). havenRaidTick EXISTS (havenGrowth.js:478
  — reactive raids: 3+ world monsters, 3k+ pantry kcal, 7-day cooldown,
  18% roll; raiders linger, answered by sortie or the 6-day valve) —
  corrected in b3. Raid-day outcome comparison remains scoped future work.

## Results (32/32 runs complete, 2026-10-18)

Sweep: seeds 8450, 8473, 8496, 8518, 8541, 8566, 8589, 8612 ×
{leadfeast,belongfeast} × {armed,control}, 180d death-aware,
FEASTSCALE_R13=1/SEATDRIVE=0, base 28408259. 0 instrument errors.
Corpus: evidence/2026-10-18/perseed-huntstaff-b4/ (32 JSONs, schema
'huntstaff-wall/4'). Analyzer: scripts/analyze-huntdefense-b3.js →
evidence/2026-10-18/huntdefense-b4-analysis.json (deterministic).
Panel: scripts/build-huntstaff-panels-b4.js →
evidence/2026-10-18/huntstaff-panel-b4.{json,md} (+ before/after .json.gz).
Proof: scripts/test-huntstaff-b4.js — ALL GREEN (17 fixture pins incl.
3 HUNTER-ONLY pins, det-gate 4/4 byte-identical, smoke).

**PRIMARY (mechanism): GO** — 110 hunt-duty assignments fired (bar ≥48),
5/8 seeds engaged (bar ≥4), control 0. 187,103 kcal of meat into pantries.
Per-seed armed assignments (lead/belong): s8450 0/0 (village-lost d25) ·
s8473 10/10 · s8496 0/0 (village-lost d29–40) · s8518 0/6 · s8541 0/13 ·
s8566 2/10 · s8589 0/0 (survived 180d both policies — no lean days, no
eligible-hunter window) · s8612 0/59 (lead village-lost d113; belong
survived 180d). Assignment occupations: bush pilot 53, hunting guide 20,
trail crew lead 19, fishing guide 14, Rancher 4 — all word-list substrate.

**STARVATION GUARDRAIL (revised, per-pair, collapse-aware): GO** —
5 non-village-lost pairs (s8518×2, s8589×2, s8612 belongfeast): armed 0 /
control 0 on every pair (bar ≤ control+1 — all OK). Pooled bound over
non-lost pairs: armed 0 ≤ control+3 = 3 — OK. 11 village-lost pairs judged
on the hunter-fate + food-added lens: (a) zero starvation deaths among
assigned hunters — OK on all 11; (b) huntKcal > 0 where the layer fired
(s8473×2: 47,345 each; s8541 belong: 13,868; s8566 lead: 1,793; s8566
belong: 28,222). The 5 zero-fire lost pairs (s8450×2, s8496×2, s8541 lead,
s8612 lead — layer never engaged, hunts impossible) have no mechanism to
judge; their starvation counts are symmetric (s8450: armed 1 / control 1
with 0 assignments both sides) or zero — nothing layer-caused.

**HUNTER-ONLY GATING: GO** — all 110 assignments match the hunter-substrate
word-list ('hunting guide', 'fishing guide', 'trail crew', 'rancher',
'forager', 'bush pilot', 'exterminator', 'soldier'). Zero non-substrate
assignments in the sweep corpus. The three proof pins hold.

**DEFENSE GUARDRAIL: GO** — villager deaths (kind person/villager only,
deduped): armed 97 vs control 91, delta +6. Attributed share of the delta:
0.000 (bar <0.50). Combat-capable villager deaths on hunt-exposed days
(d/d+1): armed 0 vs control 0 on matched days, excess 0 (bar ≤0).
Instrument verdict: NOISE. The s8473 pair deltas (+7/+5) are driven by
non-window, non-combat-capable deaths — the single window death on those
pairs was Petra Novak (glazier, cause 'monster', d17, not an assigned
hunter). hunterOcc deaths: armed 4 vs control 3. Encounter lens (item 1):
hunt-exposed days 190 encounters / 9 villager kills / 2 villager deaths /
3 allied fights vs matched control days 169 / 3 / 1 / 0 — the _outdoorCrew
ally mechanic again shows on armed hunt days. Item 4: armed lean+assigned
days (84): 1.30 fights/day, 0.071 kills/day, 0.024 vdeaths/day; armed
lean+unassigned (558): 1.15 / 0.070 / 0.023; control lean (673):
1.01 / 0.055 / 0.021 — assignment days fight and kill more, no elevated
villager-death rate.

**SURVIVAL GUARDRAIL: PASS** — mean paired Δ = −12.62d (bar |mean| ≤20d).
Pair deltas (armed−control gameDays): 0, 0, −133, −75, 0, 0, 0, 0, 0, 67,
−23, −38, 0, 0, 0, 0. The −133/−75 are the early-collapse s8473 pairs
(identical collapse substrate both arms; armed lost the workforce sooner).

**Hunter-fate instrument:** 110 assigned-hunter records; 5 distinct
assigned hunters died: Ayaan Oommen (sickness, d26), Pavel Dubinin
(combat, d130), Catalina Reyes (combat, d112), Leo Martin (combat, d81),
Ethan Hunt (combat, d116). Instrument huntAttributable (/hunt/i on cause):
0. The four combat deaths are late-run wave-3+ fights, none on a
hunt-exposed day (window capable excess 0). The Ayaan case needs honest
handling — see metric review (the wound→fever chain the regex cannot see).

**Finding #528 (engine task-lead duties):** 10 task-lead 'hunt' day-rows,
all on armed s8473 (both policies, d23–27) — the engine's contender-
challenge hunt domain fired right after the layer's last assignment
(d21) as Ayaan declined. Engine behavior, present alongside the layer;
control == 0 holds for the layer's own firing.

**Wall (pre-seat, report-only):** national 9/16 vs 9/16 · table 10/16 vs
11/16 · wins 0/16 both · wave-4 1/16 both · wave-5 0/16 both · Arc II
16/16 both · Arc III 16/16 both · Arc IV 10/16 vs 11/16 · four-realm 0/16
both · median survival 119d vs 144.5d · max 182d both. Wave-4 reached
once per arm (report-only — the wall barely moved).

**§15 panel:** decision review_required. leadfeast: national regression_
watch −0.125, survival60 regression_watch −0.125, communityLost
regression_watch +0.125. belongfeast: table regression_watch −0.125,
playerDeaths regression_watch +0.75 (ci [−1.5, 3]), playerDeaths100Days
regression_watch +0.29 (ci [−0.72, 1.31]), communityLost regression_watch
+0.125. Zero regression_signal; every exploratory interval includes 0.
Compare .md attached: evidence/2026-10-18/huntstaff-panel-b4.md. (The
panel carries wall metrics only; the per-pair collapse-aware gates are
judged from the corpus + analyzer, per the pre-reg deviation note.)

## VERDICT: GO

All five pre-registered gates GO/PASS. The layer lands default OFF
(HUNTSTAFF=1): scripts/policies/huntstaff.js + instruments + evidence
committed. The Ayaan wound→fever chain is documented below as a metric-
review item with a concrete instrument revision for the next run — it is
not re-scored against a gate this run (§14).

## Metric review (mandatory)

- The revised starvation guardrail (per-pair, collapse-aware) worked as
  designed: the 5 surviving pairs judged on counts (0/0 everywhere), the
  11 village-lost pairs on hunter-fate + food-added, the zero-fire pairs
  correctly out of the count. The b3 collapse-seed blindness is cured —
  no single seed can decide the gate.
- The window-attribution defense instrument reproduced its b3 verdict
  class (NOISE): attributed 0.000, capable excess 0, byte-deterministic.
  It remains the template for labor-assignment revivals.
- The |mean Δ|≤20d survival gate held (−12.62d, no false-fire); the
  pooled-count starvation gate is gone and good riddance.
- **The hunter-fate instrument's "hunt-attributable" regex is too narrow**
  (the honest miss of this run). Ayaan Oommen (s8473 belongfeast) was
  assigned d17 and d18; the hunt resolves wounded them (−29 HP, −27 HP);
  the wounds went febrile ("a cut gone hot and angry", d23); no healer at
  haven; death d26 cause 'sickness' — /hunt/i does not match, so the
  instrument reports 0 hunt-attributable. The chain is visible only in
  the narrative. The layer's HP gate read 60 at both check times (the
  v.health map recovers overnight, masking the person's true decline —
  narrative HP was 68→60→36 while the map read 86→60→36 end-of-day). Two
  revisions for the next run: (1) wound-chain attribution — an assigned-
  hunter death within ~7d of a wounding hunt resolve, where the fatal
  condition's onset followed the wound, counts as hunt-attributable;
  (2) the HP gate should read the person-level health, not the map, or
  refuse re-assignment within 2d of a wounding resolve. Neither changes
  this run's gates — they are specified for the next arm.
- Finding #528 is now measured: the engine's task-lead hunt duties fired
  10 day-rows on armed s8473 (d23–27) — the "control == 0" caveat from b3
  is quantified, not just noted. Engine hunts cluster right after layer
  hunts stop; future sweeps should keep the taskLeadsDays snapshot.
- The s8589 villages (180d survived, 0 assignments both policies) show
  the layer is a genuine lean-day instrument: no lean days, no firing —
  not an always-on staffing drive (proof Part C's smoke test pins this).

## Sense-test (law)

Two hunt-day arcs read with narration live (s8473 belongfeast, s8612
belongfeast):

1. **Ayaan Oommen (hunting guide), s8473** — departure, the hunt, the
   return, and the cost. d10: `📋 Ayaan — 🏹 Hunt. They'll report back
   by next part.` → `🏹 Ayaan brings down a Virginia Opossum — clean
   kill, +720 kcal to the pantry.` The same day: `⚔️ Ayaan stood down
   the Mountain Lord and kept walking — 3 rounds, bloodied but
   breathing.` Ayaan is a person first: teaches Bacaba and Pedunculate
   Oak Acorn by the fire, shows Henry the snares ("...Want to actually
   SEE one?"), tells stories that get better in the retelling, takes
   Echo Location at Field 1, discovers Apex Sense (synergy), teaches
   Reading Tracks to Miguel, Henry, Ruby. d17–18: the hunts wound them
   (−29, −27); `🩹 Ayaan is still hurting (36 HP) — no healer at haven.`
   d23: `🤒 Ayaan is feverish, a cut gone hot and angry.` d26: `📖 The
   Codex turns a page on its own. Ayaan is dead.` `💀 Ayaan succumbed to
   the fever. The village is 9 now.` d27: `You take bark armor, hunting
   spear, snare wire from Ayaan. Your hands know what they did.
   (+18 trauma)`. Nobody reads as a robot — the hunter's death reads as
   a village losing its hunter to the wild's interest payments, and the
   fiction is honest about it. This is the wound-chain case in the
   metric review.
2. **Pavel Dubinin (bush pilot), s8612** — the hunter-of-record. 59
   assignments across d26–d116, and Pavel stays a whole person around
   them: teaching Huckleberry and Murumuru, drawing plants in the dirt,
   checking snares ("Wire doesn't lie."), hauling water, bartering,
   foraging between hunts (`🌿 Pavel returns from foraging the wilds:
   +420 kcal`), weathering the d28 storm ("Pavel is already tying things
   down — rope, tarps, the chicken situation"), being patched up by the
   player (`🩹 You make rounds — Pavel gets bound up properly. (49 →
   64 HP)`), muttering at the sky ("Smile for the sky, they said. I hate
   how easy it was to start doing it."). Hunt beats are honest variance:
   raccoon +1080, beaver +3600, and the misses (`stalks a Great Horned
   Owl all morning — it winds them and it's gone`). The layer picked the
   same eligible hunter repeatedly rather than rotating — a "hunt
   champion" emerges, which reads as village specialization, not a bug.

No narration blanks. One finding filed (the wound-chain instrument gap).

## Village assessment

Eleven of sixteen armed villages never needed the layer; five did, and
those five got a hunter. 110 assignments, 187k kcal of meat, and the
mechanism fired exactly when pantries ran lean — never on a full
pantry. Pavel Dubinin's village (s8612 belongfeast) is the showcase: 59
lean-day hunts across four months, 40k kcal, the village survived the
full 180 days. Ayaan Oommen's village (s8473) is the caution: the layer
fired 10 times into a village losing its workforce, the hunter came
home wounded twice, and the wounds killed them — the food kept flowing
but the hunter didn't. The four late combat deaths (Pavel d130,
Catalina d112, Leo d81, Ethan d116) are wave-3+ wild fights, not hunt
duty — the defense instrument clears the layer (NOISE, attributed
0.000). The scale wall barely moved (national 9/9, table 10/11, wave-4
1/1): hunt staffing feeds the village, it doesn't scale it — that was
never its job. The blank I filled: the §14 escape-hatch re-run of a
twice-killed layer, now through an honest gate — the kind-aware death
instrument (b3), the per-pair collapse-aware starvation guardrail (new
here), the window-attribution defense lens (proven again), and the
finding-#528 engine-duty lens. What I could not fill: the wound→fever
attribution hole (specified for the next run), and whether the "hunt
champion" concentration (one hunter, 59 assignments) is optimal — the
one-hunter-at-a-time rule is BEAR.md canon, but a wounded champion has
no backup plan.
