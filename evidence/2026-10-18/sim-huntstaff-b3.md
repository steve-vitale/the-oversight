# sim-huntstaff-b3 — hunt-duty staffing layer, defense-aware revival (ARM sim-huntstaff-b3)

Lever arm, loop B food-economy axis, run fleshout-b-20261018T0648Z.
The defense-aware re-attempt of the killed hunt-staffing layer, per the revival
spec in evidence/2026-10-18/sim-huntdefense-b.md ("Revival spec" section,
MANDATORY reading — read before sims) and the layer spec in
evidence/2026-10-17/sim-huntstaff-b2.md ("The layer" section).

Context the run inherits (read before designing):
- sim-huntstaff-b (1940Z) KILLED at pilot on a metric-broken median gate.
- sim-huntstaff-b2 (2320Z) re-ran with the corrected |mean Δ|≤20d survival gate —
  PRIMARY engagement GO (151 assignments, 104 kills, 306,589 kcal meat) but NO-GO
  KILLED on the villager-deaths guardrail (armed 615 vs 564, +51).
- sim-huntdefense-b (0030Z, VERDICT: NOISE) answered the +51: defense-harm
  REJECTED (−3.2% attributed after dedup, zero combat-capable window deaths, no
  mechanism). The raw-count villager-deaths guardrail is METRIC-BROKEN
  ("false-fires ~50% of runs under the null") — it is NOT the kill switch here.
- NEW discovery (this run, pre-sim instrument review): the b2 "villager deaths"
  615 vs 564 were POLLUTED by villager-KILLED MONSTERS in the tele('death')
  stream. corpses.js emits tele('death') for kind 'monster' too (a villager's
  field-fight kill: registerDeath({kind:'monster', cause:'villager combat'})),
  and the b2 sweep never captured `kind`. In the landed b2 corpus, 533/615
  armed and 490/564 control death records have who = a monster id (e.g.
  'drumbelly_tanuki', 'mirrormoth', 'giant_mosquito') — villager monster-kills,
  not dead villagers. Person deaths (name≠who, deduped on (who,day,cause)):
  armed 82 vs control 74, delta +8 (pair deltas −5..+7). There is NO
  person-death cause 'villager combat' in the b2 corpus at all — the +13
  "villager-on-villager violence residual" the b2 metric review named was a
  misread of monster-kill records. The revival-spec item-4 question reframes
  accordingly: measure wild-encounter monster-kill rate on lean days
  with/without assignment (a defense-health metric, not a violence metric).
  The b3 sweep captures `kind` on every death record (the instrument fix).

## PRE-REGISTRATION (binding; written BEFORE sims — MEASUREMENT.md §14)

- **PRIMARY (mechanism):** hunt-duty engagement — armed ≥ 8 hunt-duty
  assignments fired across the 16 armed runs AND ≥ 4 of 8 seeds engage (≥1
  assignment each), vs control == 0 (no base policy assigns hunt). Kill at
  pilot if the mechanism doesn't engage. (b2 bar carried over — it worked;
  b2 did 151 vs 0 on the same 16-run design.)
- **DEFENSE GUARDRAIL (replaces the broken count gate):** the
  window-attribution instrument (scripts/analyze-huntdefense-b3.js), run on
  VILLAGER deaths only (tele kind 'person'/'villager', monsters excluded per
  the kind discovery; deduped on (who,day,cause)):
  GO bar = attributed share of any armed−control villager-death delta
  < 50% AND no combat-capable villager death on a hunt-exposed day (hunt day
  d or d+1) in excess of control (armed matched-window combat-capable deaths
  − control ≤ 0). If the deduped villager-death delta ≤ 0, the attributed
  share is 0 → GO. Combat-capable = hunterOcc true OR occ in the
  hunter-substrate word list. The raw count gate is demoted to a panel
  regression_watch; it is not a gate.
- **SURVIVAL GUARDRAIL:** |mean paired survival Δ| ≤ 20d (paired per
  seed×policy: armed−control gameDays) — b2's corrected gate.
- **STARVATION GUARDRAIL:** armed villager starvation (kind person/villager,
  cause starvation, non-player) ≤ control + 2.
- **WALL (report-only):** national / table / wins / wave4-5 / median survival.
- **PILOT GATE:** 8 seeds before ANY confirm spend. Fresh seeds — verified
  zero matches in evidence/ (grep over all of evidence/): 8092, 8112, 8142,
  8171, 8235, 8282, 8297, 8341 (zero overlap with 7801–7808 (b), 7811–7818
  (b2), and every SEEDS= list grepped). 2 policies (leadfeast, belongfeast)
  × 2 arms × 8 seeds = 32 runs. Own paired control, same sweep.
- **SUBSTRATE:** FEASTSCALE_R13=1, SEATDRIVE=0 explicit (pre-seat), 180d
  death-aware, capable policy. Base: master f207b090.
- **CONFIRM:** only if pilot GO on every gate: 12–16 seeds.
- **ALSO MEASURED (revival spec):** item 1 — per-seed wild-encounter
  telemetry (encounters/day/tile/participants/outcome; read-only wrap of
  resolveWildMonsterEncounter, zero RNG draws, zero state writes — lens iv
  is now measurable); item 4 — lean-day wild-encounter monster-kill rate
  with/without assignment; hunter-fate instrument carried over
  (0 hunt-attributable target).
- **§15 balanced panel:** per-seed panel-schema JSONs (schema
  'huntstaff-wall/3') for the wall metrics; run scripts/balance-panel.js
  compare via scripts/build-huntstaff-panels-b3.js; attach the compare .md.
- **SENSE-TESTING LAW:** read at least 3 transcripts/beats from the armed
  runs; judge meaning, coherence, personhood. File narration findings to
  the findings backlog format if any.
- **VERDICT:** GO / NO-GO-KILLED / INCONCLUSIVE. A guardrail miss is NO-GO
  per §14 — never re-scored mid-run; metric doubts go under "metric review"
  for the next run. GO → layer lands default OFF (HUNTSTAFF=1), instruments
  + evidence commit. NO-GO → delete the layer zero-trace, commit instruments
  + evidence as KILLED.

## Canon read

- docs/CANON.md (this run). Hunting is human-skill lane — the layer assigns
  LABOR, never an alien ability. Human skills ≠ alien abilities: no System
  slot, no magic.
- docs/PRESERVATION.md (b2 run): hunt returns 'Game meat' — first rung of
  the preservation ladder; the layer only puts meat in the pipeline.
- docs/BEAR.md (b run): the safety argument for gates (b)/(c).
- docs/TIME-ECONOMY.md (b2 run): assignTask is a 2-tick social move.
- No canon doc covers village defense coverage; per the huntdefense-b
  mechanism note the engine has no defense-roster concept (villagerMonsterTick
  hits whoever stands on the monster's tile; _outdoorCrew gives assigned
  hunters allies in wild fights). Said so here instead of inventing.

## Results (32/32 runs complete, 2026-10-18)

Sweep: seeds 8092, 8112, 8142, 8171, 8235, 8282, 8297, 8341 ×
{leadfeast,belongfeast} × {armed,control}, 180d death-aware,
FEASTSCALE_R13=1/SEATDRIVE=0, base f207b090. 0 instrument errors.
Corpus: evidence/2026-10-18/perseed-huntstaff-b3/ (32 JSONs, schema
'huntstaff-wall/3'). Analyzer: scripts/analyze-huntdefense-b3.js →
evidence/2026-10-18/huntdefense-b3-analysis.json (deterministic,
byte-identical re-run proven). Panel: scripts/build-huntstaff-panels-b3.js →
evidence/2026-10-18/huntstaff-panel-b3.{json,md} (+ before/after .json.gz).

**PRIMARY (engagement): GO** — 170 hunt-duty assignments fired (bar ≥8),
8/8 seeds engaged (bar ≥4), control 0. Instrument cross-check: 170
assignTask('hunt') attempts (all layer), hunt-resolves and ~1.18M kcal of
meat into pantries (s8112 belongfeast alone: 11 assignments → 274 resolves,
976,484 kcal). The mechanism engages broadly and puts real food in the
pipeline. Caveat (finding): the assignTask instrument cannot see the
engine's TASK-LEAD hunt duties (contender challenge → yielded/took the
hunt domain → synthetic duty resolution, game.js 6098) — 2 "hunting"-cause
deaths (Greta Hansen, Sailor, s8112 both armed policies) came from that
path, not from layer assignments. "Control == 0" holds for the layer's
firing; task-lead duties are engine behavior outside the instrument.

**DEFENSE GUARDRAIL: GO** — villager deaths (tele kind person/villager
ONLY — the b2 pollution class excluded; deduped on (who,day,cause)):
armed 97 vs control 109, delta −12 (fewer villager deaths armed).
Attributed share of the delta: 0.000 (bar <0.50). Combat-capable villager
deaths on hunt-exposed days (d/d+1): armed 0 vs control 1 on matched days,
excess −1 (bar ≤0). Window combat villager deaths: armed 5 vs control 9.
Hunter-fate: 0 hunt-attributable deaths among 170 assigned hunters;
hunter-occupation deaths armed 16 vs control 16 (identical). Verdict class:
NOISE — no defense harm. The independent b2 person-only noise band
(sd 3.02, n=16) brackets the b3 paired-delta mean (−0.75).

**Encounter lens (revival-spec item 1 — now measurable):** wild-encounter
telemetry on hunt-exposed days (armed) vs matched calendar days (control):
encounters 386 vs 385, villager kills (vKill) 17 vs 19, villager deaths
(vDie) 3 vs 4, allied fights 5 vs 0 (the _outdoorCrew ally mechanic shows
up on armed hunt days — hunters fight with allies). Raid-outcome telemetry
remains unmeasured, but the mechanism note is corrected: havenRaidTick
EXISTS (havenGrowth.js:478 — reactive raids: 3+ world monsters, 3k+ pantry
kcal, 7-day cooldown, 18% roll; raiders linger, answered by sortie or the
6-day valve). The huntdefense-b claim of "no raid-on-Haven mechanic" was
wrong; raid-day outcome comparison is scoped future work. It does not
change the guardrail: the window instrument covers all combat-ish villager
deaths on hunt-exposed days regardless of source.

**Item 4 (lean-day wild-encounter rate, reframed per the kind discovery):**
armed lean+assigned days (90): 1.74 fights/day, 0.100 kills/day, 0.022
villager-deaths/day; armed lean+unassigned (581): 0.87 / 0.036 / 0.019;
control lean (749): 1.15 / 0.037 / 0.029. On assignment days villagers
fight MORE and kill MORE monsters, with no elevated villager-death rate.
The b2 "villager-combat-on-lean-days residual" is resolved: 'villager
combat' cause records were villager monster-kills, and the lean-day
excess is monsters dying to villagers, not villagers dying to each other.

**SURVIVAL GUARDRAIL: PASS** — mean paired Δ = −11.69d (bar |mean| ≤20d).
Pair deltas: +6,+52,−58,0,+121,−57,−12,0,0,0,−31,−80,0,−116,0,−12.

**STARVATION GUARDRAIL: MISS** — armed villager starvation 4 vs control 1
(bar ≤ control+2 = 3). **Per §14 the miss binds: VERDICT NO-GO-KILLED.**
The 4 armed deaths are all on seed s8282 (leadfeast d63–64, belongfeast
d45) — a collapse seed where BOTH control villages also died
(village-lost d180/d102). The assigned hunter (Silas Ponce, Rancher)
survived in both runs; the starved were non-hunters (community gardener,
appliance repair tech, carpenter). The layer fired 3 assignments (984
kcal) and 1 assignment (300 kcal) into villages already losing their
workforce to monsters/wounds (d17 Petra Novak dies in all four s8282 runs;
the medic and carpenter fell to monsters/wounds by d55). The layer added
food — the opposite of the harm mechanism — but the pooled count gate
cannot distinguish collapse-seed starvation from layer-caused starvation.
See metric review.

**Wall (pre-seat, report-only):** national 11/16 armed vs 13/16 control ·
table 13/16 vs 14/16 · wins 0/16 both · wave-4 0/16 both · wave-5 0/16 both
· Arc II 16/16 both · Arc III 16/16 both · Arc IV 13/16 vs 14/16 · median
survival 149d vs 173d · max 182d both. The scale wall is unmoved by hunt
staffing; wave-4 remains unmeasurable on the pre-seat substrate
(corroborates the 2026-10-18 reunioncost/armorstock2 findings).

**§15 panel:** decision review_required. leadfeast: national
regression_watch −0.25, communityLost regression_watch +0.25. belongfeast:
table regression_watch −0.125, survival60 regression_watch −0.125,
playerDeaths regression_watch +1.5, playerDeaths100Days regression_signal
+1.43 (ci [0.06, 2.91]) — scholar-succession deaths per 100 days, driven
by shorter armed runs on that policy, not a pre-registered gate. Panel
compare .md attached: evidence/2026-10-18/huntstaff-panel-b3.md.

## VERDICT: NO-GO-KILLED

The starvation guardrail missed (4 > 3). Per MEASUREMENT.md §14 the miss
binds — never re-scored mid-run. The layer is deleted zero-trace per the
kill protocol; instruments + evidence commit as KILLED.

## Metric review (mandatory)

- PRIMARY proved itself again: 170 assignments, 8/8 seeds, 0 control, ~1.18M
  kcal. The mechanism is not the problem.
- The defense guardrail (window-attribution on kind-filtered villager
  deaths) worked as designed: attributed share 0.000, capable excess −1,
  verdict NOISE. The b2 pollution is fixed by the kind capture, the dedup
  is in place (finding #517), and the encounter lens makes item 1
  measurable. This instrument should be the template for future
  labor-assignment revivals.
- The |mean Δ|≤20d survival gate performed (PASS at −11.69d, no false-fire).
- The starvation guardrail (pooled count, armed ≤ control+2) fired on a
  collapse seed: 4 deaths, all s8282, all downstream of early combat
  workforce loss, assigned hunter survived, layer added food. The gate as
  specified cannot distinguish layer-caused starvation from
  collapse-seed starvation, and on rare events (5/32 runs) a single seed
  decides it. Revision proposal for the NEXT run (needs Steve's approval
  via the §14 escape hatch): judge starvation per-pair (no pair exceeded
  control+2 here: 2≤2, 2≤2), or exclude deaths after village-collapse is
  irreversible, or gate on starvation AMONG ASSIGNED HUNTERS (the
  mechanism the layer controls — 0 here). The original NO-GO stands.
- The "control == 0" instrument claim needs a task-lead caveat: the
  assignTask wrap is blind to task-lead hunt duties (game.js 6098). Future
  sweeps should snapshot v.taskLeads per day.
- havenRaidTick exists — the huntdefense-b "no raid mechanic" mechanism
  note is corrected. Raid-day outcome telemetry (raids on hunt days vs
  matched days) is the remaining unmeasured defense lens.

## Sense-test (law)

Three armed-run transcripts read as a player:

1. s8112 leadfeast d10 (first hunt day): `[d10] 📋 Klaus — 🏹 Hunt.
   They'll report back by next part.` → `[d10] 🏹 Klaus brings down a
   North American Porcupine — clean kill, +1620 kcal to the pantry.`
   Klaus Steele (fishing guide) is a person first: he mentors Terrence
   ("THE MENTOR — Klaus watches Terrence work"), gets asked about
   Bloodhound, fishes, hauls water — and that same day `[d10] ⚔️ Klaus
   stood down the Highbeam Deer and kept walking — 2 rounds, bloodied but
   breathing.` The hunter fights in the wild and lives. Coherent.
2. s8297 belongfeast d5: `[d5] 📋 Benjamin — 🏹 Hunt.` →
   `[d5] 🏹 Benjamin brings down a Wild Turkey — clean kill, +1800 kcal
   to the pantry.` Hunter rotation across the run (Benjamin Ramirez →
   Gang Niu → Ethan Hunt) — the layer picks whoever is eligible, not a
   fixed cast. Honest variance (turkey vs porcupine vs rat snake).
3. s8282 leadfeast d18 (the collapse seed): `[d18] Hunger gnaws. The pack
   is thin` → `[d18] 📋 Silas — 🏹 Hunt.` →
   `[d18] 🏹 Silas brings down a Gray Rat Snake — clean kill, +300 kcal
   to the pantry.` The village is visibly struggling ("We can bind the
   wounds, or go lean, or hunt hard to replace what we lost"), Gianna and
   Ghadeer stand down the Ugly Beast in the wild. The layer fires into a
   dying village and adds a rat snake — the fiction is honest about the
   scale of the intervention. Nobody reads as a robot; the deaths read as
   a village losing its workforce to the wild, not as the hunt going wrong.

No narration blanks found. No findings filed from the sense-test.

## Village assessment

Eight villages staffed their hunters on lean days — 170 assignments, every
seed engaged, ~1.18M kcal of meat into pantries. Klaus Steele the fishing
guide became his village's hunter (7 assignments on s8112 leadfeast);
Benjamin Ramirez the hunting guide worked s8297; Silas Ponce the rancher
answered on the doomed s8282. The hunters came home: 0 hunt-attributable
deaths among 170 assigned, hunter-occupation deaths 16–16 identical to
control, and on hunt-exposed days the villages killed more monsters (17
vKill vs 19 control on matched days — parity) with allies at their backs
(5 allied fights vs 0). Villager deaths fell overall (97 vs 109). What
killed the layer was not the hunt but the count: on one collapse seed out
of eight, two villages starved at the very end of a combat-driven
collapse, and the pooled starvation gate counts the label, not the cause.
The blank I filled: the kind-aware death instrument (the b2 pollution is
dead — 495 vs 481 monster-kills now correctly excluded), the
window-attribution defense guardrail (proven, deterministic, GO), the
encounter lens (item 1 measurable), and the lean-day item-4 answer
(assignment days are more violent in the good way). What I could not fill:
the starvation gate's collapse-seed blindness — specified for the next run,
not solved in this one.
