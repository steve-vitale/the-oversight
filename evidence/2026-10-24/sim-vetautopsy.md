# sim-vetautopsy — wave-4 killer autopsy on the defer5-rediag band (DIAG, instrument-only)

Run: fleshout-20261024T0446Z · arm sim-vetautopsy · axis scale-onramp · worker tree sim-vetautopsy
Date: 2026-10-24 · DIAG arm: zero src/js, zero game change. Instrument namespace `vetautopsy-*`
(scripts + evidence/2026-10-24/perseed-vetautopsy/). Disjoint from the sibling
vetkill-autopsy namespace (the 2026-10-23 #837 census on the 65511–65518 band,
armorydrive-only substrate) and from bloodrestraint-*, wallseg-*, vetcontact-*,
loop-B namespaces.

## Canon read

docs/CANON.md (full). docs/MONSTER-WAVES.md: wave law; waveKillLog as the
veterans-bar source in standing.js; combat readiness gates the standing unlock
(design call #4, 2026-10-16; defer5 demand recalibrated 2026-10-18: 4 armored@P>=15,
6 armed, 3 counters, 2 LIVING wave-4+ killers). No canon doc covers succession /
the office / the mantle — stated, not invented (the bloodrestraint evidence
states the same).

## Why this DIAG (backlog #859)

The defer5-rediag census (evidence/2026-10-23/sim-defer5-rediag.md, DIAG-GO 22/22)
proved veterans are the sole universal binder of the defer5 gate — villages
blood wave-4 killers but never hold 2 LIVING ones at once (9/10 binding configs
never-met, peaks 0–1; the 10th met-then-lost-without-coincidence) — but the sweep
stored counts only, so nobody knows WHAT KILLS THE VETERANS on the current
substrate. The 2026-10-23 vetkill-autopsy (#837) answered it on the OLD band
(65511–65518, armorydrive-only): 8/10 killer vids died 1–8d after their kills in
later attritional combat (5 aid-crisis raids, 2 haven fights, 1 televised contest
duel); 0 died in the wave-4 fight itself; 10/16 configs never formed a veteran.
Since then the substrate moved (armorvillage landed + the defer5-rediag band is
the current census band), the mantlechain DIAG proved the CHAIR is the accelerant
(8/8 in-scope veteran wave-4 deaths as mantle-holder), and bloodrestraint measured
13/18 blooded vids dying as mantle-holders within 14d of first kill. This arm
re-runs the autopsy on the defer5-rediag band with per-death-row telemetry that
separates the chair from the fight: for every vid with ≥1 wave-4+ kill, a death
row carrying firstKill day, death day, days blood-to-death, cause string,
opponent (monster id/wave if combat), hp/armor state, starvation state,
mantle-holder / 14d-blood-window / picked-successor flags, and village context
(national?, wave5 live?).

## PRE-REGISTRATION (§14 binding — written BEFORE any sims)

- **BINDING QUESTION:** What kills the wave-4+ killers on the defer5-rediag
  band (70111–70122 × {leadfeast, belongfeast}, armorvillage+armorydrive pinned
  substrate, current master)? The deliverable is the attribution table: what
  kills the veterans, by channel share, with the single biggest channel named
  and quantified.
- **SUBSTRATE (pinned, identical to the defer5-rediag census):**
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=0
  KILLDISC=1 ARMORYDRIVE=1 ARMORVILLAGE=1; policy = AV.armedFor(base)
  (armorvillage's armedFor wraps armorydrive's). VETFORMATION, LINKFORM,
  FEASTDISC/HOMECOMING/SCHOLARDIST families unset (sibling namespaces
  untouched). BLOODRESTRAINT explicitly unset: the hook exists on current
  master (env-gated, default OFF) but did not exist at the rediag anchor;
  unset reproduces the rediag census behavior exactly.
- **SEEDS (the rediag band, deliberately re-swept — not fresh):** 70111–70122
  × {leadfeast, belongfeast} = 24 configs, 180d death-aware (dead villages
  stop, +10d tail max). The C1 freshness gate does not apply: this is a
  re-instrumentation of the same band, not a new corpus.
- **DIAG-GO (binding):** ≥90% of wave-4+ killer deaths in the corpus get a
  fully-attributed row — a named cause class (chair/combat/starvation/
  disease/wound/other) PLUS the channel's mechanism evidence attached — with
  the remainder in an explicit "unexplained" bucket. If the unexplained bucket
  exceeds 10%, DIAG-NO-GO with the reason named (that's the finding, not a
  failure).
- **Channel taxonomy (exclusive, pre-registered priority):**
  1. `chair` — died as the mantle-holder (player death). The mantlechain DIAG
     proved the chair is the accelerant; a scholar killed by a wave-4 monster
     is classified chair (the funnel is the office, not the monster's weapon),
     with the combat context carried in the mechanism evidence.
  2. `combat` — non-mantle-holder death with a combat-class cause
     (combat/villager combat, split-fight:*, raid*, patrol combat, monster
     name). Sub-channels in the row: vs-wave-4+, aid-crisis, haven, contest,
     patrol/wild.
  3. `starvation` — cause 'starvation'.
  4. `disease` — the windowstay DISEASE_IDS + DISEASE_RES taxonomy (verbatim;
     both pools, pool named in the row).
  5. `wound` — wound/infection causes.
  6. `other` — explicit fallback; every unmapped raw cause is listed so the
     ≥90% bar stays honest.
  7. `unexplained` — the explicit bucket: (a) killer vid dead (absent from the
     final roster, kills predate run end) but no death row joined;
     (b) death row exists but cause unknown AND no fight basis AND not
     mantle-holder; (c) named channel but the channel's mechanism evidence is
     missing (e.g. combat with no opponent and no fight basis).
- **Mechanism-evidence requirements per channel (pre-registered):**
  chair → mantle flags (pickedSuccessor, bloodWindow14d, succession trust at
  pick); combat → opponent mid/wave + fight basis (live-tbfight / same-day /
  aid) ; starvation → hungryStreak + pantry at death; disease → disease id +
  pool; wound → raw cause; other → raw cause + village context.
- **The wallseg metric-review gap (documented, not chased):** wave-4 fight
  EXPOSURE vs CONVERSION can't be separated without per-fight outcome
  telemetry (sim-wallseg.md:355). What this instrument CAN see: exposure
  (combat_start rows with party vids, all waves), conversions (waveKillLog
  kills by vid/day/mid/via), and terminal outcomes (death rows). What it
  CANNOT see: per-fight non-conversion outcomes — a fight a killer vid was
  exposed to that produced neither a kill nor a death leaves no per-vid
  outcome trace (fled, drove-off, routed-via-trick are not recorded per
  fight). The instrument counts exposure events and conversions; it does not
  claim to know what happened in the non-converting fights.
- **hp/armor at death (instrument capability, probed 2026-10-24):** the death
  tele fires BEFORE roster removal — getPerson(who) is readable at tele time
  (18/18 villager deaths on the probe). armor = S.equipment.armorOf on the
  worn-equipment view (villagers: person.equipped; the SCHOLAR:
  state.scholar.equipped via the armorBonus() read path — the person
  record's equipped is empty for the scholar; fixed mid-run, see Sweep).
  hp = state.village.health[wid] ?? 100 (villagers), state.scholar.health
  (scholar). Villager person records carry no hp field — not invented.
  Starvation state = pantry kcal live + hungryStreak at death (per-vid
  hunger is not a person field — not invented).
- **GUARDRAILS:** wall block (national/table/wins, wave4/5, median survival);
  no new death kinds (≥2-event rule); instrument-error count 0.
- **INSTRUMENTS:** scripts/vetautopsy-instrument.js (NEW: tele death+combat_start
  capture, mantleBecome succession capture, aidFight capture; RNG-neutral,
  zero game-state writes) + direct state.waveKillLog read. w5gates-lib and
  instr-windowstay NOT imported (self-contained namespace, no cross-arm
  dependency). Per-seed JSONs written to evidence/2026-10-24/perseed-vetautopsy/
  with sha256-after-write readback. Sweep outputs to the worktree evidence dir,
  NEVER /tmp. Resume-safe: existing per-seed JSONs with matching anchor are
  skipped (determinism-verified identical), mismatched anchors are re-run LOUD.
- **§15:** panel judged inapplicable for zero-src/js DIAG arms per the
  doorcensus precedent — the identical-seed corpus on unmodified instruments
  is the instrument, the ≥90% bar the judge.
- **METRIC REVIEW section mandatory** (below).
- **Master drift note:** the rediag corpus anchor is a083fb04d3d0
  (2026-10-23); this census runs on current master (anchor recorded per
  seed). 30 commits separate them (bloodrestraint hook, journey r38–r42,
  crisis r46, deepening r39). Trajectory divergence vs the rediag corpus is
  expected and is NOT claimed as an effect — same band, same substrate,
  current master.

## Design calls (Steve 2026-10-07: figure it out yourself, document it)

1. Chair-priority classification (above): the question is what eats the
   veterans; the mantlechain 8/8 makes the office the first cut.
2. Veteran = ≥1 wave-4+ kill (standing.js's own definition, same as
   mantlechain/bloodrestraint).
3. 14d blood window = [firstKill, firstKill+14] inclusive (bloodrestraint's
   window; boundary d=now-15 not held per its E1).
4. pickedSuccessor = appears as newId in the run's succession records
   (initial scholar excluded — recorded at install time).
5. Death→fight opponent linkage: live-tbfight first (Game.tbfight at tele
   time, monster fighters), combat-cause-gated same-day fallback
   (mantlechain's combatCause gate — a same-day starvation death is never
   mis-scored). Aid fights captured via aidFight wrap + ctx.aid.
6. Dedup on (day, who, cause) keeping the richest row (windowstay lesson #1);
   phantom check via roster liveness (lesson #3).
7. No daily trace: everything the death row needs is readable at tele time
   (probe-verified); the sweep reads waveKillLog post-run.

## Convergence state

DIAG-GO. scale-onramp stays converging (the wall stands: wins 0/24).

## Sweep

24/24 configs complete (12 seeds 70111–70122 × {leadfeast,
belongfeast} — the deliberately re-swept rediag band), 180d death-aware,
one anchor (84d390816755 — verified identical on all 24 per-seed JSONs). Per-seed JSONs in
evidence/2026-10-24/perseed-vetautopsy/ with sha256-after-write readback
(all 24 green). 0 instrument errors.

Infra notes (two, both recovered, both documented classes):
- The background runner died silently after config 12 (no error, no node
  process — the same silent-background-death class the defer5-rediag
  evidence documents). The corpus was untouched (worktree evidence dir,
  12 valid per-seed JSONs) and the sweep resumed cleanly for the remaining
  12 configs (resume-safe: anchor-matched files skipped).
- The EPERM-on-evidence-write flap hit the s70122-lead per-seed write
  (SWEEP FAILED: EPERM at writeFileSync — the documented 2026-10-24
  container class). Recovered per the AGENTS.md recipe: re-swept the 2
  remaining configs to a /tmp EVID dir, copied into evidence/ with a
  retry loop in the SAME command (copy verified byte-identical, first
  attempt), /tmp dir removed.
- Instrument fix mid-run (documented, not silent): the scholar-armor read
  initially used S.equipment.armorOf(getPerson(scholarVid)) — which
  misreads 0 because the scholar's armor lives on state.scholar.equipped
  (game.js armorBonus() reads there; the person record's equipped is empty
  for the scholar). Fixed to replicate armorBonus()'s pure part
  (armorOf on {equipped: sch.equipped} + armor.flat modifier; armorBonus()
  itself NOT called — it runs migrateEquipment, a write). The 5 configs
  with killer deaths were deleted and re-swept deterministically (same
  seed+env+anchor → byte-identical on all judged fields except the
  repaired armor/armorSource). Verified: the 6 chair deaths genuinely wore
  nothing (eq=[], armor 0 via the correct path) — the finding is real,
  not a read artifact.

## Attribution — PRE-REGISTERED DIAG-GO: 6/6 named, 0 unexplained → DIAG-GO

Analyzer: scripts/vetautopsy-analyze.js (pure offline join of waveKillLog
w≥4 killer vids to deduped person death rows; chair-priority taxonomy per
the pre-registration).

- Denominator: 6 wave-4+ killer deaths (7 wave-4+ kills by 7 distinct vids;
  1 killer survived to end). Named: 6. Unexplained: 0. Exceeds the ≥90% bar.
- 0 collapsed dupes, 0 multi-row vids, 1 phantom (s70117-belong d145
  giulia_bianchi, cause 'monster' w4 — person death tele for a
  roster-living vid; excluded per windowstay lesson #3, counted; not a
  killer, no effect on the DIAG).
- Death→fight linkage: 5/6 live- or same-day-attributed to a wave-4
  opponent (eulogy, suburb, algorithm ×2, congregation); 1/6 combat with no
  fight row (gen_7zji70w — inTb=true at death, no combat_start that day;
  honestly labeled combat-no-opp inside the chair channel).

## The attribution table

What kills the veterans, by channel share (6 killer deaths):

| channel | n | share | mechanism |
|---|---|---|---|
| **chair** (died as mantle-holder) | **6** | **100%** | all picked-successors, all in the 14d blood window, all in wave-4 combat, all armor 0 |
| combat (non-mantle-holder) | 0 | 0% | — |
| starvation | 0 | 0% | — |
| disease | 0 | 0% | — |
| wound | 0 | 0% | — |
| other | 0 | 0% | — |
| unexplained | 0 | 0% | — |

**The single biggest channel: the CHAIR — 6/6 (100%).** Every wave-4+
killer who died, died as the mantle-holder: picked as successor by the
trust-order succession (6/6 picked-successor, 0/6 initial scholars), dead
within 14 days of their first wave-4+ kill (blood-to-death 0,1,2,4,7,10d;
median 4d), in wave-4 combat (5/6 opponent-attributed: eulogy, suburb,
algorithm ×2, congregation; 5/6 during aid-crisis haven defense),
wearing no armor (0/6, verified via the correct scholar armor path).

The six death rows:

| config | killer (first kill) | blood→death | death | opponent |
|---|---|---|---|---|
| s70113-belong | nikos_papadopoulos (strike d104, player) | 7d | d111 combat, mantle-holder | eulogy w4 (aid, haven) |
| s70118-lead | marcus_webb (congregation d66, player) | 4d | d70 combat, mantle-holder | suburb w4 (aid, haven) |
| s70119-belong | gen_zcwrr90 / Cesar (influencer d138, player) | 2d | d140 combat, mantle-holder | algorithm w4 (aid, haven) |
| s70119-belong | nikolai_volkov (influencer d162, **companion**) | 10d | d172 combat, mantle-holder | algorithm w4 (aid, haven) |
| s70119-lead | gen_7zji70w / Wagiyem (congregation d103, player) | 1d | d104 combat, mantle-holder | unattributed (inTb, no fight row) |
| s70122-lead | jovan_milic (congregation d147, player) | 0d | d147 combat, mantle-holder | congregation w4 (aid, haven) |

The 1 survivor: s70114-lead's killer (survived 180d to end).

Formation half (for the record): 18/24 configs never formed a veteran
(0 wave-4+ kills) — the wallseg "formation, not exposure" finding holds on
this band. Of the 6 configs that formed ≥1 veteran, 5/6 lost every killer
they made; only s70114-lead retained its killer to end (and still never
fielded 2 living veterans at once).

## Sense read (SENSE-TESTING LAW)

Read the death rows of 4 veterans end to end via narration replay
(scripts/vetautopsy-sense.js, same seed+policy+substrate — trajectory-safe).
Verdict: the deaths read as things that happened to people, not as count
numerology. Every one is a real played fight, blow-by-blow, with companions
alongside — and every one is the scholar leading from the front.

- **Cesar (s70119-belong, gen_zcwrr90).** Killed an Influencer d138 as the
  scholar (picked d16 at trust 70, not yet blooded). d140: ROUND 8–9 vs The
  Algorithm — "You STRIKE the algorithm for 94 (Phase blade). ... Giulia's
  turn — Giulia strikes the Algorithm. Omar's turn — Omar strikes the
  Algorithm. ROUND 9! ... OH. Oh no. ...The gamblers are very quiet." Two
  days blood-to-death. His death triggers a four-scholar cascade the same
  day (Cesar→Lucas→Sean→Giulia→Omar) — the village buries its scholar and
  three successors before dinner. Coherent, consequential, terrible.
- **Nikolai (s70119-belong, nikolai_volkov).** The companion-to-chair story:
  killed an Influencer d162 as a COMPANION (via=companion), was picked as
  successor d172 at trust 85 with the kill on his record (w4k-at-pick=1),
  died d172 — the same day — striking the Algorithm with a Harvest Scythe
  (43, 45) before it killed him. Ten days blood-to-death, zero days in the
  chair. This is the exact funnel the bloodrestraint hook was built for:
  the village looked to its blooded killer and handed him the journal, and
  the chair killed him within hours.
- **Nikos (s70113-belong, nikos_papadopoulos).** Killed a Strike d104.
  d111: ROUND 6 vs a Eulogy — "You STRIKE the eulogy for 50 (Hunting
  spear). Miguel's turn — Miguel strikes the RERUN ×1 The Eulogy. You
  STRIKE the eulogy for 53. ...The gamblers are very quiet." Seven days
  blood-to-death, fighting at the haven during an aid crisis, spear in
  hand, no armor.
- **Jovan (s70122-lead, jovan_milic).** Killed a Congregation d147 and died
  d147 — ROUND 27 of the same day's fighting: "⛪ RERUN ×4 The
  Congregation's turn ... Congregation's Absolution hits you for 37. ...
  The gamblers are very quiet." Zero days blood-to-death: blooded and
  killed in the same 27-round slugfest.

Meaning check: none of these read as the game being unfair OR the veteran
being careless. They read as the fiction working as designed — the scholar
must answer wave-4 haven assaults in person (the restraint-b finding: the
engagements come to the haven), the succession rule hands the journal to
the trusted (who are increasingly the blooded), and the chair puts them in
front of the next wave-4 monster unarmored. The horror is structural, not
numerical — which is exactly why a restraint (not a stat lever) is the
honest next move. One fiction blank, inherited from the mantlechain sense
finding and not re-proven here: the succession beats are canned — the game
never marks that the same chair killed four trusted people in 24 hours.

## Village assessment

What the villages looked like: 24 villages on the armorvillage substrate,
median survival 145d. Seven survived the full 180 days (s70114 ×2,
s70117-belong, s70118-belong, s70120-lead, s70121-belong, s70122-belong);
seventeen were lost, most to combat attrition (807 combat/villager-combat
deaths across the corpus — the villages fight constantly and the fighting
is what kills them). Seven reached national, seventeen reached the table,
none won, twenty-one unlocked wave 4, none unlocked wave 5.

Who thrived: the villages that survived did it by NOT blooding wave-4
killers as much as by keeping them — 18/24 never formed a veteran at all,
and 6 of the 7 full survivors are in that group. The one survivor that
formed a veteran (s70114-lead) kept its killer alive to end — the only
retained veteran in the corpus — and still never fielded 2 living
veterans at once.

Who died and why: the veterans. Seven wave-4+ kills by seven distinct
vids; six of the seven killers died, all six as the mantle-holder, all
six within 14 days of first blood (median 4d), five of six in aid-crisis
haven defense against a named wave-4 monster, all six wearing no armor.
The succession rule (trust decides) picked all six — including Nikolai,
blooded as a companion ten days before he took the chair and dead the
same day he took it.

What knowledge/capabilities were missing: armor on the scholar. The
armorvillage economy fills the village's armor leg (the rediag finding),
but the blooded scholar — the one person the wave-4 monsters come for —
fights naked. 0/6 wore anything. Whether the policy should dress the
scholar, or the fiction wants the scholar exposed, is a design question;
the measurement is that the readiness gate's ARMORED bar can read 7–10
while the person actually facing the Eulogy reads 0.

Which blank I filled: the autopsy itself (backlog #859) — per-death-row
telemetry for wave-4+ killers on the current band, DIAG-GO 6/6. Which I
documented: the aid-crisis haven-defense channel (5/6), the unarmored
scholar (0/6), the never-formed 18/24 (formation half), the phantom
tele class (1).

## Wall numbers (the wall doesn't move)

national 7/24, table 17/24, wins 0/24, wave4 21/24, wave5 0/24, median
survival 145d, max 181d. (Master drift note: the rediag band on the old
anchor measured national 8/24, table 19/24, wave5 1/24, median 151d —
same band, same substrate, current master. The direction is not claimed
as an effect; the wall stands either way: wins 0/24.)

## Metric review

- The pre-registered DIAG-GO (≥90% fully-attributed, remainder in the
  explicit unexplained bucket) was met at 6/6 with 0 unexplained and 0
  instrument errors. No metric revision: the bar worked as designed.
- Instrument refinement (pre-analysis, documented): the combat evidence
  rule's hasLink now also accepts ctx.atHaven and 'contest' cause as
  mechanism evidence — the windowstay cross-arm taxonomy treats
  ctx.atHaven + combat-cause as a raid classification with the ctx as the
  why, and a 'contest' cause names the venue the way a monster name names
  the killer. This did not change any of the 6 attributions (all 6 are
  chair by the priority rule); it is recorded so the classifier's exact
  rule is auditable. The DIAG-GO bar itself is unchanged.
- Instrument fix (mid-run, documented above): scholar armor misread 0 via
  getPerson().equipped — repaired to the armorBonus() read path (pure
  part only). The 5 affected configs were re-swept deterministically.
  Lesson for future instruments: probe EVERY person class you will read
  (the probe covered villager armor, not scholar armor).
- Denominator honesty: 6 killer deaths is a small n. The 100% chair share
  is stark but the confidence interval is wide — the finding CONFIRMS the
  mantlechain/bloodrestraint direction (8/8 and 13/18) rather than
  standing alone. The never-formed 18/24 is the larger-n half of the
  story (formation, not retention).
- Exposure vs conversion (the wallseg gap): this corpus carries per-fight
  exposure (combat_start rows with party vids, all waves) and conversions
  (waveKillLog kills). What it cannot see: non-conversion outcomes per
  fight — a killer vid exposed to a wave-4 fight that produced neither a
  kill nor a death leaves no per-vid outcome trace. Exposure events are
  counted, conversions are counted, the rest is honestly unknowable from
  this telemetry.
- Guardrails: death-cause shares — combat:584, villager combat:223,
  expedition:58, monster:32, sickness:23, starvation:17, contest:12,
  ambush:10, 'a wound that wouldn't close':5, The Eater:2, 'a toad like a
  war drum, throat swelling':2 (both ≥2-event unusual causes grep-verified
  in src/data/monsters.json — the established unknown-monster flavor and
  the wave-4 monster name). **No new death kinds** (≥2-event rule).

## Blanks filled / documented

- FILLED (measured): the wave-4 killer autopsy on the current band — the
  CHAIR is 6/6 (100%) of wave-4+ killer deaths: picked successors, dead
  within 14d of first blood (median 4d), in wave-4 combat, unarmored. The
  defer5-rediag's documented gap ("nobody knows WHAT KILLS THE VETERANS")
  is closed on this band.
- FILLED (measured): the unarmored-scholar finding — all 6 died with
  nothing equipped (verified via the correct armorBonus read path, not a
  misread). The armorvillage economy arms the village; the blooded scholar
  does not wear it. (Whether the policy should dress the scholar is a
  design question, not a bug — documented, not chased.)
- DOCUMENTED (finding for sim-findings.md): the aid-crisis haven-defense
  channel — 5/6 chair deaths happened during aid-crisis fights at the
  haven (ctx.aid + atHaven + inTb). Wave-4 engagements SEEK THE SCHOLAR
  (the restraint-b finding: "they come to the haven") and the chair
  answers the door unarmored.
- DOCUMENTED: 18/24 never-formed (0 wave-4+ kills) — the formation half
  remains the larger wall segment on this band.
- DOCUMENTED: 1 phantom (s70117-belong d145 giulia_bianchi 'monster' w4 —
  person death tele for a roster-living vid; phantom/cheat-death class;
  excluded per windowstay lesson #3, counted).

## Convergence note

Axis scale-onramp. This DIAG closes backlog #859 (the defer5-rediag named
next: "the wave-4 killer autopsy needs death rows"). The veterans wall now
has both halves measured on the current band: FORMATION — 18/24 configs
never blood a wave-4 killer (the wallseg finding); RETENTION — the 6/24
that do, lose 6/6 killers to the chair within 14 days (median 4d), all as
picked successors, all in wave-4 combat, all unarmored. The succession
rule (trust decides) systematically feeds the village's proven killers
into the office, and the office — which must answer wave-4 haven assaults
in person — kills them. The bloodrestraint hook (landed as an instrument)
is the named restraint for exactly this funnel. The scale wall stands:
wins 0/24.

## Instruments committed (namespace vetautopsy)

- scripts/vetautopsy-instrument.js — the death-row recorder (tele +
  combat_start + mantleBecome + aidFight wraps; RNG-neutral, zero writes)
- scripts/vetautopsy-sweep.js — the 24-config census composer (resume-safe,
  hash readback)
- scripts/vetautopsy-analyze.js — the judge (pure offline join + classifier)
- scripts/test-vetautopsy.js — the proof (E1/E4/E5/E6 fast gates;
  E2 determinism + E3 manual-audit agreement behind VETAUTOPSY_FULL=1)
- scripts/vetautopsy-audit.json — the hand audit (6/6 killer deaths,
  blind packets from scripts/vetautopsy-audit-sample.js)
- scripts/vetautopsy-sense.js — the narration replay for the sense read
- scripts/vetautopsy-probe.js — the instrument-design probe (death-time
  readability; kept as the capability record)
- evidence/2026-10-24/perseed-vetautopsy/ — the corpus (24 files)
- evidence/2026-10-24/sim-vetautopsy.md — this file
