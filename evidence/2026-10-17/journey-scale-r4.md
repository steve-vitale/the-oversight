# Journey SCALE R4 (2026-10-17) — the BELONG road on the new tip

**Run id:** 2026-10-17T00:45:00-05:00 (oversight-playtest-loop). Worktree: `journey-scale`.
**Base:** master@1d565b52.

## PRE-REGISTRATION (MEASUREMENT.md §§9–12, 14 — written before the pilot ran)

**Leg question:** On the new tip (readiness-gated waves 4/5, deepening-r14+, endgame
work), does the BELONG road — joining another kingdom as a subordinate, Steve's
"legitimate earned outcome" ("you may NOT end at the top") — stage, play, and hold
national in the days 80–140 window? Do the belong mechanics — The Binding
(SWEAR/SERVE/WALK), weekly oath tribute (real food), the primary's demands
answered/refused aloud, the consolidator switch (or its exile-aware hold) — fire
and read as people?

**Binding metrics (shape-aware per r3's metric review; a miss is NO-GO, never
re-scored mid-run; metric doubts go under "metric review"):**
- M1 national (belong shape): ≥2/8 seeds stage The Binding by d140.
- M2 hold: of seeds staging national, ≥half still hold nationalLive at run end.
- M3 belong mechanics: ≥1/8 seeds fire a belong mechanic — a tribute week paid,
  a demand answered/refused aloud, or a clean consolidator switch (or its
  exile-aware hold, logged).
- M4 people: ≥8 transcripts sense-read (The Binding beat + conversations),
  0 senseless flags.
- M5 winnable: ≥3/8 seeds end with national held OR reach d140 (death-aware).

**Interesting-finding bar:** The Binding staging; a demand refused aloud with
real consequences; tribute weeks at ×1.25 logistics once national; the realm
dissolving ALOUD; a switch that breaks cleanly vs one that holds because the
persona can't re-court.

**Horizon:** DAYCAP=140, death-aware stop (+10d tail max). **Seeds:** 8701–8708
(fresh; r3 used 8501–8508, deepening-r15 used 8801–8808).
**Policy:** belongseek + BELONG_V3=1 (exile-aware switch + opinion-building
climb + score-gated break; v3 ≥ v2 proven 2026-10-12; pure decision, no extra
RNG draws). Harness answers pendingNational with 'swear' at The Binding.

**Prior legs for context:** r1/r2 (LEAD): national 5/8, held 5/5, global 1–2/8,
table 0/8. r3 (COVENANT): national 4/8 at the one-rung-per-season gate, held
4/4, defense calls answered 8× across 3 seeds, crises 7/8. Carried blanks:
table 0/16 across r2+r3 (win-path axis); mood homogeneity (3rd confirmation);
neglected subordinate tribute (policy coverage gap).

## PILOT (3 seeds: 8701–8703)

- **8701: village-lost d29 (sickness avalanche).** 5 villagers died of sickness
  d6–d21, the scholar died of dehydration d11, the village starved and
  scattered d29 ("Haven couldn't hold... The scattering, again"). Never
  reached scale. Early sickness may be hot on harsh seeds — watch in the full run.
- **8702: BELONG national staged and held.** Subordinate link to village_3 d20
  (accord gift, tribute weeks 5.0–7.7k), demands honored d29/d43/d57, The
  Binding → SWEAR d72, national ON d72–d126 (end: survived, 8/8 alive). A
  succession-renegotiation beat landed: the primary's speaker died, Haven let
  silence answer, tribute ×1.5 (7.6k→11.4k) said aloud. Zero villager deaths.
- **8703: BELONG staged twice with a live dissolve between.** Subordinate to
  village_3 d20, second link to village_2 d55, Binding → SWEAR d72, national
  ON; village_3's link broke pre-d100; village_2 carried national until
  arrears (8.4k) broke good standing d120 → "The realm came apart" said
  aloud (engine line confirmed in hierarchy.js; the r4 harness's marker set
  missed it — fixed to match 'realm came apart'); arrears cleared, Binding
  re-staged → SWEAR d133, national ON at end (survived d134, 7/8 alive).
- Pilot verdict: the leg's question shows a LIVE polity (stage → hold →
  dissolve aloud → re-stage). Full 8-seed run justified. M1 already 2/3.
- Harness fix in-run: polityDissolve markers added 'realm came apart'.

## RESULTS (8 seeds × 140d, death-aware; belongseek + BELONG_V3=1)

| seed | days | end | scale | national | global | pop |
|------|------|-----|-------|----------|--------|-----|
| 8701 | 29 | village-lost | village | — | — | scattered d29 |
| 8702 | 126 | survived | national | ON (d72–) | — | 8/8, 0 villager deaths |
| 8703 | 134 | survived | national | ON (d72–, re-staged d133) | — | 7/8 |
| 8704 | 134 | survived | **global** | ON (d72–) | ON | 8/8, 0 deaths |
| 8705 | 142 | survived | regional | ON d72, OFF d141 (arrears) | — | 10/10, 0 deaths |
| 8706 | 142 | survived | national | ON (d72–) | — | 8/8 |
| 8707 | 126 | survived | **global** | ON (d72–) | ON | 7/7 |
| 8708 | 104 | village-lost | **global** | ON at death | ON at death | 5/6 |

- **M1 national (belong) GO 7/8** (bar ≥2/8). Every surviving seed staged The
  Binding at d72 (the one-rung-per-season gate: regional ~d21 + 30d season +
  deed) and swore the oath (3,000 kcal, trust +12).
- **M2 hold GO 6/7** (bar ≥half). 8705 lost national at d141 to arrears
  (37,970) — said aloud via the live-state check; the rest held to run end.
  8703 dissolved and re-staged (see below).
- **M3 belong mechanics GO 7/7** (bar ≥1/8). Tribute weeks paid on every
  national seed (220 tribute markers); demands honored aloud 3–4× per seed
  (251 demand markers); oath sealed; succession-renegotiation leverage fired
  (×1.5 tribute, said aloud); The Binding staged 8× across 7 seeds.
- **M4 people GO** — 8 transcripts sense-read + The Binding beat text read
  from source; 0 senseless flags (2 soft notes below, both investigated and
  withdrawn-or-filed).
- **M5 winnable GO 7/8** (bar ≥3/8). National held at end or d140 reached on
  7 seeds; 8701 never reached scale.

**The arcs, in plain words:**
- 8702 is the clean road: subordinate to village_3 d20, tribute weeks,
  demands honored, Binding d72, national held d72–d126, village intact.
- 8703 is the live-polity arc: two subordinate links (village_3 d20,
  village_2 d55); village_3's realm dissolved off-screen; national dropped
  d120 when arrears broke good standing ("The realm came apart" — said
  aloud, engine line verified); arrears cleared; Binding re-staged d133 with
  village_2; national ON at end.
- 8704/8707 reached GLOBAL via the belong road (first journey measurement
  of belong→global): The Watchers staged on viewership ≥32, answered, global
  held while viewership decayed to ~19 — deed-reactive, consistent.
- 8705 is the tribute-trap arc: zero deaths, 10/10 alive, pantry 71.6k→0 —
  five grief-leverage ×1.5 escalations (primary's speakers kept dying)
  stacked tribute 5k→35k/week until arrears (37,970) broke good standing
  and national fell d141. The village thrived and priced itself out of its
  own realm. Filed as a balance note (uncapped stacking), not a bug.
- 8708: the realm outlived the village — national+global live at d104 while
  Haven scattered after 5 scholar deaths. The polity is a live relationship;
  it doesn't die with the bearer.
- 8701: harsh-seed collapse — 5 sickness deaths d6–21, scholar dehydration
  d11, scattering d29. Outlier (other seeds: 0–1 villager deaths).

**Double-vassalage pattern:** 6/7 national seeds held TWO subordinate links
in parallel (second courted d55 as realms churned). Canon doesn't forbid it;
the v3 deliberate break never visibly fired — first links broke at high
trust (68–100), consistent with foreign-realm dissolution, not policy breaks.

**Wave-4 wall:** engaged.w4 = 0 on all 8 seeds; finalWave 3 everywhere. The
readiness gate defers wave 4 (belong villages are diplomacy-heavy,
combat-light). Same LOUD as r3's covenant run. Tension to note: the endgame
deed gate wants all 5 waves faced — the belong road doesn't naturally build
the combat readiness that unlocks wave 4. Endgame leg owns the table; flagged
for the road, not fixed here.

## VILLAGE ASSESSMENT (census in plain words)

- **8702 (national, 8/8):** Mara and Amy know 48 plants each — the knowledge
  core. Occupations: social worker, army medic, mortician, trail crew lead,
  taxi driver, street artist, HVAC tech, physical therapy aide. Moods
  steady/lonely. Nobody died. A village that talks (Amy's guilt/dream
  conversations) and teaches.
- **8704 (global, 8/8):** Wei (54 plants) and Nikos (52) are the forager
  scholars. Beekeeper, firefighter, musician, mechanic, roofer, aquarium
  keeper, bartender. Eli (trail crew lead) wants a door he can close — "Home
  isn't a place. It's people who notice when you're quiet."
- **8705 (regional, 10/10):** The thriving village — Ursula/Chantal/Ines at
  ~51 plants, pharmacist + cook + farmer + florist + dentist. Grew to 10
  (recruits joined). Zero deaths. Killed by its own tribute bill, not by
  the wild.
- **8708 (global at death, 5/6):** Tom (44 plants) and Sari (42) carried the
  knowledge. Leo died d66 (alien cause). Five scholars died in succession
  (starvation, sickness, dehydration, contest, combat) — the mantle passed
  four times, then there was no one left. Moods: grieving.
- **8701 (scattered d29):** Never became a village — sickness took five in
  the first three weeks, the first scholar died of dehydration d11.

## PEOPLE CHECK (sense-testing; 8 transcripts + beat reads)

- **The Binding beat (source-read):** "You are not the head of this. That is
  the point." SWEAR: "kneels at [X]'s court and swears the oath — sealed with
  3,000 kcal of Haven's harvest. The realm has its fires now, and one of them
  is yours." Real cost, real voice. Played, not silent.
- **8702 d100 (Amy, social worker):** guilt opener → "We're all doing math
  that doesn't add up" → gossip → kindness ledger. Want curious 1→3,
  engaged. Human.
- **8702 d120 (Amy):** "I left. Walked back in like I'd never left,
  apparently." — investigated: this is the engine's `return`-gossip
  self-render (game.js:4586), fired from a real departure/return event, not
  fabricated. Flag withdrawn.
- **8703 d120 (Benoit, baker, sick):** "Never mind the sickness I'm fighting
  — we got it handled" with want=ask_favor — investigated: the favor went
  moot between seed and sitting (convo-wants.js:1439); the opener is the
  honest settlement line, and the conversation pivoted to real teaching
  (Sassafras/Spicebush/Dandelion). Designed behavior (r7 fix). Flag withdrawn.
- **8704 d80 (Eli):** "I want a door I can close. Not to keep people out —
  just to know I could." / "I rearranged the bunks again last night. Nobody
  noticed." Specific, voiced, non-repeated. The bar met.
- **8707 d100 (Bakhyt, firefighter, trust 100):** want=seek_taken, 8 turns of
  "be remembered" variations — coherent but a filler loop; the want never
  touches the actual Taking. Soft flag → documented blank (seek_taken
  content narrowness), not a senselessness NO-GO.
- **8702 d80 / 8703 d80 / 8703 d100:** strong openers (first week, distrust),
  grounded gossip ("Ava/Sofia/Grace just walked away" — real departure
  events), tails thin out after gossip exhaustion ("So.", nodding). Noted as
  polish, not a blank.

## BLANKS

1. **Filled (harness):** polityDissolve markers missed the engine's actual
   line ("The realm came apart") — added 'realm came apart' to the marker
   set. The dissolve was always said aloud; only the instrument was deaf.
2. **Documented (design, for Steve):** succession/renegotiation grief-leverage
   (×1.5) stacks without cap — 8705's tribute went 5k→35k/week across five
   primary-side deaths, draining a 71k pantry to zero and costing national to
   arrears. Fiction-coherent ("grief is leverage"), but uncapped stacking
   priced a zero-death village out of its realm. Balance call, not a bug.
3. **Documented (content):** seek_taken want pool is all "be remembered"
   variants — never grounds in the Taking itself. Narrow, not broken.
4. **Carried:** table 0/8 on the belong road (win-path axis; endgame leg
   owns it); wave-4 readiness wall on diplomacy roads (see above).

## VERDICTS

- **REACHABLE: yes.** 7/8 seeds staged The Binding; the road is the most
  reliable national path yet measured (lead 5/8, covenant 4/8, belong 7/8).
  The precondition (foreign 4-realm via engagement-driven consolidation)
  fired on every surviving seed.
- **FUN: yes.** The polity is alive: tribute weeks tick, demands arrive and
  are answered aloud, grief becomes leverage (×1.5, said aloud), realms
  dissolve aloud and re-form. 8703's dissolve-and-restage and 8705's
  tribute-trap are stories, not spreadsheets.
- **WINNABLE: partial.** National is winnable and holdable on this road
  (6/7 holds); global reachable (2/8). The table is 0/8 — the downstream
  walls are wave-4 readiness (0/8 unlocked) and the seat, both owned by
  other legs/axes.

## METRIC REVIEW

- The shape-aware metrics worked: M1–M5 all GO without re-scoring. Keep them
  for the next road (trade/conquest/refuse).
- The v3 "clean consolidator switch" clause of M3 never visibly fired — the
  policy double-courts instead of breaking-and-recourting, and first-link
  breaks read as realm dissolutions. If the next run wants to measure the
  switch, it needs a seed where the consolidator outpaces while the old realm
  stands (rare in this sample: 0/8 deliberate breaks).
- Baseline: r3's proposal adopted — per-road baselines. scale.json (lead)
  left untouched; seeded `telemetry-baselines/scale-belong.json` from this
  run. Next scale run: use the road-matching baseline.

## TELEMETRY CHECK

Ran `telemetry-check.js` against scale.json (lead baseline) with belong-aware
metrics. LOUDs, all investigated:
- `firstCourt 5→0`: road-shaped (belong stages The Binding). Explained.
- `binding/theBinding/tribute/demand newly appeared`: road-shaped (belong
  mechanics). Explained.
- `polityDissolve 0→3`: design-honest — 8703/8704/8705 realms dissolved aloud;
  national is a live state. Explained.
- `fightsByWave.4 3→0`: readiness gate defers wave 4 on diplomacy-heavy
  belong villages (engaged.w4 = 0 all seeds; same LOUD as r3). Explained —
  and flagged as the road's downstream wall (see Results).
Baseline NOT rolled over scale.json; seeded scale-belong.json instead (see
Metric Review).
