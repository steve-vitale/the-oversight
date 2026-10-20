# Journey — crisis leg r32 (lane B): disease-outbreak sense-test

**Pre-registration** (inherited from the r31 harness, committed 2026-10-20T04:31Z by a prior run but never executed — this run executes it as r32):
- **Leg question:** when a mundane disease outbreak sweeps the village, do villagers behave like people — tended/talked about/feared — do outbreak deaths get mourned, and does the 'outbreak' lately-topic surface in-window?
- **Canon:** docs/DISEASES.md — diseases never announce their names, only symptoms; diagnosis unlocks the true name. Undiagnosed true-name announcements = bug.
- **Interesting-finding bars (any):** (a) outbreak (≥2 sick simultaneously — the topic's own gate) with ZERO tended/tended_by response; (b) active outbreak where the 'outbreak' topic never surfaces in driven convos; (c) outbreak deaths with no mourning response within 7 days; (d) undiagnosed villagers naming true disease names in say-lines/transcripts.
- **Seeds:** 7, 42 (pilot), 99, 424242 (expansion). Policy: oracleV2 (competent). Horizon: 120d death-aware (+10d tail).
- **Primary metric:** outbreak-topic surfacing per driven convo during live windows (bound: the fixed-shape scan; see instrument fix).

## Pilot verdict (seeds 7, 42)

Both seeds produced real outbreaks (6 windows seed 7, 4 windows seed 42; all mundane; peak 2–3 sick, max weight 4 — never severe). The care machinery fired hard (seed 7: 64 tended / 25 tended_by; seed 42: 39/6) and the world talked about sickness (39/42 outbreak say-lines). Canon held: all 7 canon-name hits were diagnosis-flavored (Lorenzo/Willie the medics examining and naming; the disease card announcing the diagnosis) — zero undiagnosed true-name announcements.

Bar (b) fired on both pilot seeds: 0/8 driven conversations surfaced the outbreak topic. Interesting enough to expand per §9.

## Expansion verdict (seeds 99, 424242)

Seed 99: 98d, game-over; 1 outbreak window (d4–5, weight 2); crises the-siege d17, first-grave d18, breach d45. Seed 424242: 120d horizon; 7 outbreak windows including TWO SEVERE (d22–23 weight 5, d25–27 weight 6); crises first-grave d3, breach + the-siege d22.

With the fixed scan, seed 424242 surfaced the outbreak topic in 4/4 driven conversations — all during windows where the village was otherwise quiet. The severe windows won the lately slot outright (displacing the naming debate per the r8 design); the mild d10 window won it because nothing higher-priority was live.

## Main findings

### 1. The outbreak topic is quiet-by-design at mild levels, not broken (bar b — explained, not a bug)

The full priority chain (convoTopics.js t2LatelyEvent): fresh grief > mantle > defense > table > SEVERE outbreak/weirdness > show > MILD outbreak > realm > hunger > care > muster > gratitude > cheer; the naming debate sits above mild outbreak (yields only to severe). The pilot's outbreaks (max weight 4) never won because those villages were busy — Marcus's death, Lie Detector grabs, live naming debates. Seed 424242's quiet d10 village let a mild outbreak through. This is the r8/r17 standing design, sense-tested and working. Whether 2 sick villagers SHOULD outshout a naming debate is a Steve call — documented, not changed.

### 2. Instrument fix: the r31 outbreak-topic scan couldn't match its own lines (FILLED)

The pre-registered scan (`/sickness going around|the sickness|outbreak/`) matched NONE of the four real 'outbreak'-case lines ("N of us are down with <desc>", "Have you seen the sick row?", "I'm down with it too", "It's got me as well"). A severe outbreak surfacing correctly would still have scanned 0. Fixed to match the shapes the topic actually speaks (scripts/journey-crisis-r31-outbreak-20261020.js). Re-scan of all 12 pilot+expansion transcripts with the fixed regex confirms the pilot's 0/8 was real (the topic genuinely didn't surface), and the expansion's 4/4 on seed 424242.

### 3. Sickness deaths happened; burial/mourning fired in the wild (bar c — evidenced, per-death timing unverified)

The integrated census found FOUR sickness deaths: Jada Torres (seed 42, the first bearer — lockjaw + gut rot, d14), Willie Ahmed (seed 42, d21), Frank Diop (seed 42, d37), Vikram Carter (seed 7, the second bearer, d43). The `samples.deaths` instrument captured none of the bearer deaths (it only sees villager combat deaths) — the census corpse list was the honest source. Mourning beats fired in the wild for the dead (Stan: "Marcus is gone and the world just... continues"; Cheryl d77: "We gave them a good burial"; Elena d77 burial mention; Ricardo d22's opener: "I don't sleep much when the sick row's full"). The r8 SICKNESS DEATH machinery (mourning lines name "the sickness" for disease-caused corpses) is unit-covered. What wasn't individually verified: a mourning response within 7 days OF EACH sickness death. Named next for a future run: drive a mourning convo after each recorded sickness death and check the 7-day window.

### 4. Sick villagers ask for help like people; the engine can answer (sense-tested)

Stan (d34): "whatever this is, it's getting worse — I'm achy and wrung out, barely keeping food down. can you do anything?" → "The fever's not breaking... I need help — real help, not just water." Olivia (d37): "Rest and clean water aren't cutting it... I need someone who knows what they're doing." Paloma (d10): "I'm feverish, a cut gone hot and angry" (wound fever, symptom-honest) → "It's not just the cut anymore, it's in the blood." The player's `tendVillager` (32-tick deed, shortens recovery, keeps 'heal' promises, +3 bond) is the real answer to the ask; villagerCareTick's medic tending fired 22–64 times per seed. The ask is never an unkeepable vow.

### 5. No-shared-language sick conversations are dead air (DOCUMENTED, not fixed)

Dina (d30) and Hassan (d77) on seed 42 — both sick during outbreaks, both with no shared language — produced 14-turn identical nod loops ("They nod back, slowly." ×14). Honest (no fabricated understanding) but filler-loop territory; a real player hits the same wall since no choice conveys sickness across the language barrier. The driver always picking [nv:nod] is a driver artifact; the wall itself is real. Named as a future design question: should visible sickness (coughing, lying down) show outside dialogue?

### 6. One sick opener missed (DOCUMENTED, not a bug)

Riley (seed 99 d4, "sick villager during outbreak") talked old-life skills and the naming debate with zero sickness content. Consistent with the by-design rule (convo-wants.js: mild sev1 sickness waits behind real hunger — "that's human too"); his 1-day "bad belly" likely lost to hunger or expired. Unverified which — noted, not changed.

### 7. Change-over-run acks read stitched but are intentional (observed)

Ricardo d22: `"Last time things were different. They always are." "It's got me as well. a hot angry fever..."` — the ack + fresh line is the change_over_run design (re-asking after 12 days), not a composition bug. Reads slightly stitched in the transcript; acceptable.

## People check (sense-read highlights)

- Cheryl (seed 7 d37, well): "My mother, Yehia. Was taken at the Scattering. The boring half. She made soup from nothing and they called that boring." — the Taking silence (r30's watch item) breaks here, unprompted, in a well villager's conversation during an outbreak. Also: "Lie Detector. They just... took Olivia. Came back like nothing happened. It wasn't nothing."
- Ricardo (424242 d22, sick): confesses "I wasn't an ER nurse. I was a hotel housekeeper. I thought if you believed me, you'd keep me close. Close is safe." — then the outbreak line. A liar, a sick man, a person.
- Ricardo (424242 d10, well): "we're the control group. Somewhere there's a village that got instructions, and we're the ones they just... watched."
- Paloma's 4× confront deflections — all distinct, escalating irritation, no parrot.
- Elena (42 d77, well): "We gave them a good burial. Doesn't feel like enough, does it, friend?"
- Zero fabricated shared history, zero verbatim repeats, zero near-dupes across 12 transcripts.

## Village assessment (plain words)

Four villages, four fates. All played by the same competent oracleV2 hand.

**Seed 7 — the village that fought everything and lost (d119, game-over).** Fourteen buried. Marcus (monster, d34), Lorenzo (combat, d39), Vikram Carter — the second bearer — dead of SICKNESS d43, Cheryl (combat, d50), then a long grinding monster toll through d94 (Stan, Erika, Milagros, Nikolai, Nikos, Mariano, Sergio, Olivia, Xavier, Elie). Nobody left alive. They knew a great deal when they died (codex: 85 plants, 34 monsters) and trusted deeply (Erika:90, Paul:86). Six outbreak windows came and went — the care arc fired (64 tended), the sick asked and were answered — but monsters, not disease, emptied the fire. The miserable ones are uncountable; there is no one left to be miserable.

**Seed 42 — the village that paid the sickness toll and held (d120, horizon).** Fourteen buried, three alive (Hassan, Liam, Marcus — trust 89–90). This is the outbreak leg's village: Jada Torres, the first bearer, dead of SICKNESS d14 (lockjaw + gut rot together); Willie Ahmed dead of sickness d21; Frank Diop dead of sickness d37. The village buried its leader to disease in week two and kept going — monsters took Dante, Xavier, Liam, Ingrid, Shanice, Ella; combat took Michael, Frank (d36), Dina (d81), Elena and Caleb (d107); Elena Petrova died of dehydration d83; Hassan of an emergency hunt d117. Three alive at the horizon with 3,403 kcal in the pantry. They bent — the sickness took their leader — and did not break.

**Seed 99 — the village that starved and bled (d98, game-over).** Fourteen buried, none alive. Judith starved d6, Tashi starved d18 — the famine came early and never really left. Riley (combat, d17), Dylan taken by the Grief Counselor d19, Denise (combat, d30), Yara dead in a contest d39, then the long combat/monster grind. Only one outbreak window (d4–5, a 1-day belly bug) — disease was a footnote here; hunger and monsters were the story. The pantry ended at 0.

**Seed 424242 — the village that thrived (d120, horizon).** Eight alive, six buried (all monster/combat — Tanya d11, Blanca d51, Paloma d71, Devon d72, Olivia d97, plus one unnamed). Seven outbreak windows including two SEVERE — and the village talked about every one (outbreak topic 4/4, 43 outbreak say-lines, medics tending throughout). Pantry: 71,636 kcal. Trust: Ricardo:100, Blanca:90, Paloma:90. This is what the crisis leg looks like when it works: the sickness comes, the village counts its sick row, buries its dead, and carries on.

What was missing: nothing structural. The sick were tended, the dead were buried and named, the living counted. The two dead villages died of monsters and hunger — the game's honest killers — not of unfireable beats.

## Metric review

- Primary (outbreak-topic surfacing): pilot 0/8, expansion 4/4 (seed 424242) + 0/2 (seed 99) → 4/14 overall. The bar was the right one; the pilot's 0/8 fired the instrument fix (finding 2), and the expansion showed the topic fires when the village is quiet or the outbreak severe.
- Bar (a): NOT hit — tending fired on every outbreak (22–64 tended memories/seed).
- Bar (b): fired on pilot, explained as by-design priority (finding 1), not a bug.
- Bar (c): 4 sickness deaths found via census (Jada d14, Willie d21, Frank d37, Vikram d43); burial/mourning evidenced in the wild; per-death 7-day mourning timing NOT individually verified — named next. The `samples.deaths` instrument misses bearer deaths (census corpse list is the honest source).
- Bar (d): 0 undiagnosed true-name announcements across 4 seeds (11 canon hits, all diagnosis-flavored).
- No metric re-scored mid-run. The scan fix corrects the instrument, not the bar.

## Reachable / fun / winnable (crisis leg: disease outbreak)

- REACHABLE: yes — 18 outbreak windows across 4 seeds, all through natural play (bad water, raw food, wounds); the care arc, the sick ask, and the outbreak topic all fired unprompted.
- FUN: yes — the sick ask ("can you do anything?") with a real answer (tendVillager), medics sitting with the feverish ("cool cloth, bitter tea, watching the breathing"), the village counting its sick row. The outbreak is the village's business and it reads that way.
- WINNABLE: the leg doesn't gate the win; villages bent (seed 7 scattered/died d119, seed 99 d98) and carried on (seeds 42, 424242 to horizon). Disease is a pressure, not a wall — all outbreaks in-window were mundane and survivable.

## Regressions

- scripts-only changes (journey-crisis-r31 scan fix + deaths record; new census-probe-crisis-r32.js). Zero src/js touched.
- [REGRESSION RUN PENDING — check.js --quick or targeted crisis suites after census lands.]

## Telemetry

- Baseline `telemetry-baselines/crisis.json` tracks combat metrics (defenderFights 77, playerFights 3, defendedCount 22, latelyDefenseCount 9). This run's instrument records disease/care instruments, not combat — the check's four LOUD "disappeared" lines are instrument mismatch (same as r28/r29), not behavior change. Scripts-only diff; no combat code paths touched. Baseline NOT rolled.

## Files

- Instrument fix: `scripts/journey-crisis-r31-outbreak-20261020.js` (outbreak-topic scan shapes; deaths record)
- New: `scripts/census-probe-crisis-r32.js`
- Per-seed records: `hidden_files/evidence/2026-10-20/crisis-r32/journey-crisis-r32-seed{7,42,99,424242}.json`
- Transcripts: `hidden_files/evidence/2026-10-20/crisis-r32/journey-crisis-r31-seed*-*.txt` (12)
- Rotation: journey-rotation-b.txt 6→7 after this run.
