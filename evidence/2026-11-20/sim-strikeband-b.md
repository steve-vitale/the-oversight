# sim-strikeband-b — strike-band search: three fresh bands, no designation (findings #2605 + #2620)

**Verdict: NO-GO (survey — no band designates). Steps 2–3 NOT RUN.**
**Steps 2–3 blocked:** the judged counterplay-priced decomposition
(step 2) and its ALLYSLOT3-ported run (step 3) need a designated
band. None of the three screened bands clears the frozen
designation bar, so no band was designated, no port was performed,
and no judged sim ran. The ALLYSLOT3 port is NOT on this branch
(`src/` diff 0 — verified below). The next run on the damage
question needs a coordinator decision: screen a fourth band
(106241–106248, scoped-fresh — see §7) or fix the launch engine
first (see §7.1).

- **Branch:** `sim-strikeband-b`, tip `ce02edc79` (instrument) at
  screen time; base master `057bfa60f` (journey-social-life r256)
- **Survey prereg:** `evidence/2026-11-20/sim-strikeband-b-survey-prereg.md`
  (frozen 2026-11-20 ~16:06 UTC, before any screening leg; commit
  `20bd56c68`)
- **Instrument:** `scripts/strikeband-survey-driver-b.js` +
  `scripts/analyze-strikeband-survey-b.js` +
  `scripts/test-strikeband-survey-b.js` (commit `ce02edc79`);
  proof test **39/39 green**, analyzer selftest **22/22 green**
- **Survey JSON:** `evidence/2026-11-20/strikeband-b-survey.json`
  (analyzer exit 1 = NO-GO verdict, not a failure)
- **Legs log:** `evidence/2026-11-20/strikeband-b-legs.log`
  (24 driver JSON lines; LEG1_EXIT:0, LEG2_EXIT:0, LEG3_EXIT:0)
- **Corpora:** `evidence/2026-11-20/perseed-strikeband-b-106211-106218/`,
  `perseed-strikeband-b-106221-106228/`,
  `perseed-strikeband-b-106231-106238/` (8 files each, 0 errors)
- **Seeds screened:** 106211–106218, 106221–106228, 106231–106238
  (24 seeds, 150d death-aware, competent verbatim policy sha
  `150229eda010`)
- **Legs:** SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1
  FIGHTALLY2=1 ALLYSLOT3=1 (env-only — port NOT an ancestor of
  HEAD, 0 occurrences in `src/js`) LAUNCHSURVIVE=1. Leg runtimes:
  band 1 ~13.4 min, band 2 ~9.9 min, band 3 ~6.7 min.

## 1. Judged numbers (frozen designation bar, survey prereg)

| Bar | Band 1 106211–106218 | Band 2 106221–106228 | Band 3 106231–106238 ★ | Bar | Result |
| --- | --- | --- | --- | --- | --- |
| Launches | 2 | 1 | **6** | — | best 6 |
| First-fights (counted / distinct) | 0 / 0 | 1 / 1 | **2 / 2** | ≥ 6 | **FAIL (2)** |
| Distinct strike-fights (mDealt > 0) | 0 | 1 | **2** | ≥ 4 | **FAIL (2)** |
| Counterplay first-fights (mDealt = 0) | 0 | 0 | 0 | — | 0 everywhere |
| Fled / killed / died first-fights | 0 / 0 / 0 | 1 / 0 / 0 | 1 / 1 / 0 | — | — |
| No-fight launches | 2 | 0 | 4 | — | 6 of 9 |
| Quad launches | 0 | 1 | 2 | — | 3 |
| Funnel taxonomy unknown | 0 | 0 | 0 | 0 | **PASS** |
| Instrument errors / files | 0 / 8 | 0 / 8 | 0 / 8 | 0 / 8 | **PASS** |

★ Best band by the frozen ranking (firstFights desc, launches
desc, quads desc, median survival desc): **106231–106238** — 2
first-fights, 2 distinct strike-fights. Both bars fail, so the
verdict is NO-GO. The bar was not lowered, moved, or re-scored
after seeing the numbers; the 4th-band question goes in "metric
review" (§7).

**The strike bar was never the binding failure.** All three
first-fights in the whole screen struck (mDealt 59, 135, 123) —
zero counterplay fights anywhere in 24 seeds. The designation
fails on pool SIZE (2 first-fights vs floor 6), not on fight
shape. Had any band delivered 6 first-fights, the strike bar
would very likely have cleared with them: the dmgshape
population's shape problem (4 of 6 distinct fights 0-damage)
does not reproduce here. What reproduces is thinner: the
villages barely launch at all.

## 2. The launch drought (the finding of this screen)

| | This screen (24 seeds) | Dmgsurvey survey (32 seeds) |
| --- | --- | --- |
| Launches | **9** (0.375/seed) | 40 (1.25/seed) |
| First-fights | **3** (0.125/seed) | 25 (0.78/seed) |
| Launches per band | 2, 1, 6 | 6, 12, 16, 6 |
| First-fights per band | 0, 1, 2 | 5, 8, 9, 3 |
| Depart rows per launch | 431 rows → 9 launches (2.1%) | — |

Nine launches from 431 `v4departs` rows. The villages deliberate
constantly — 192 depart rows on band 1, 107 on band 2, 132 on
band 3 — and almost never set out. Thirteen of 24 seeds launch
nothing at all (band 1: 106211, 106212, 106214, 106216, 106217,
106218; band 2: all but 106221; band 3: 106232, 106235, 106236).
Two seeds (106226, 106227) deliberate for 90–110 days (119 and
28 dawn-bid departs) and fight zero wave-4+ encounters. The
binding funnel stages: **plan-churned-before-dawn** on band 1
(5 instances), **candidate-not-bid** on bands 2 (5) and 3 (6) —
the same two stages the launchfunnel survey named, in the same
order. Plans are made and churned before dawn, or candidates
never get bid at all.

This is finding #2627 (filed to `sim-findings.md`): the launch
rate collapsed ~3× against the dmgsurvey survey on the same
policy and the same seven-flag substrate. The only `src/` change
between the survey base (`c75503d6f`) and this base
(`057bfa60f`) is the journey-social-life conversation.js
gossip-ask fix — which touches no launch/fight code — so the
collapse reads as band variance on a lumpy launch engine, not a
substrate regression. But it is a reading, not a proof: the two
surveys ran on different seed sets, and launch richness is
lumpy by seed (one or two engine seeds carry each band — here
only band 3 has any engine at all, and it is thin). The
coordinator's call is whether to keep screening fresh bands for
a launch-rich outlier or to fix the launch engine first — the
screen as designed can only find pools, not make them.

## 3. Per-seed maps (launches / first-fights / fled / killed / died / no-fight)

Band 106211–106218 — launches 2, first-fights 0:
- 106211 (survived 150d, standing 199, wave 4): 0 / 0 — 0 departs rows.
- 106212 (survived 150d, standing 199, wave 4): 0 / 0 — 83 departs rows, 0 launches.
- 106213 (lost d117, standing 199, wave 4): 1 / 0 / 0 / 0 / 0 / 1 — d106 congregation, no meeting.
- 106214 (survived 150d, standing 175, wave 4): 0 / 0.
- 106215 (survived 150d, standing 550, wave 5): 1 / 0 / 0 / 0 / 0 / 1 — d143 editor (wave 5), no meeting.
- 106216 (lost d117, standing 199, wave 4): 0 / 0.
- 106217 (lost d136, standing 199, wave 4): 0 / 0.
- 106218 (lost d135, standing 199, wave 4): 0 / 0.

Band 106221–106228 — launches 1, first-fights 1:
- 106221 (lost d147, standing 145, wave 4): 1 / 1 / 1 / 0 / 0 / 0 — d141 algorithm (quad), same-day world-tick fight, vFlee.
- 106222 (lost d93, standing 175, wave 4): 0 / 0.
- 106223 (survived 150d, standing 100, wave 4): 0 / 0 — 94 launch-track rows, 3 departs rows, 0 launches.
- 106224 (survived 150d, standing 199, wave 4): 0 / 0 — 22 departs rows, 0 launches.
- 106225 (lost d147, standing 199, wave 4): 0 / 0.
- 106226 (lost d93, standing 100, wave 4): 0 / 0 — 119 dawn-bid departs, 0 wave-4+ encounters.
- 106227 (lost d110, standing 125, wave 4): 0 / 0 — 0 wave-4+ encounters.
- 106228 (lost d42, standing 20, wave 3): 0 / 0 — never reached wave 4.

Band 106231–106238 ★ — launches 6, first-fights 2:
- 106231 (survived 150d, standing 265, wave 5): 1 / 0 / 0 / 0 / 0 / 1 — d139 cancellation (quad, wave 5), no meeting.
- 106232 (survived 150d, standing 199, wave 4): 0 / 0.
- 106233 (survived 150d, standing 275, wave 5): 1 / 1 / 0 / 1 / 0 / 0 — d117 herald (quad) → d121 herald kill.
- 106234 (lost d147, standing 199, wave 4): 1 / 1 / 1 / 0 / 0 / 0 — d111 herald → d111 herald flee (same day).
- 106235 (lost d128, standing 520, wave 5): 0 / 0.
- 106236 (survived 150d, standing 199, wave 4): 0 / 0 — 47 departs rows, 0 launches; 141 kill-calls, 139 deaths.
- 106237 (survived 150d, standing 325, wave 5): 2 / 0 / 0 / 0 / 0 / 2 — d145 + d149 network_note, same holder (miguel_santos), no meeting either time.
- 106238 (survived 150d, standing 710, wave 5): 1 / 0 / 0 / 0 / 0 / 1 — d111 reunion, no meeting.

Repeat-target churn, second sighting: 106237's holder launches
twice in four days against network_note and never meets it — the
same shape as the dmgsurvey 'audit' churn (106188, five launches,
no meeting). And the dead-target family is adjacent: 106233's
holder fought the herald on d115 (577 dealt), launched d117
against the same type, and Sari finished it d121.

## 4. Wall numbers (per band + total)

| Band | Wins | National (scaleRank ≥ 2) | National (standing ≥ 200) | Table seats | Wave 5 reached | Wave 4 reached | Median survival (d) | Survived (days ≥ 150) | Total deaths | Starvation deaths | Standing 199 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 106211–106218 | 0 | 0 | 1 | 0 | 1/8 | 8/8 | 143 | 4/8 | 694 | 8 | **6/8** |
| 106221–106228 | 0 | 0 | 0 | 0 | 0/8 | 7/8 | 128 | 2/8 | 496 | 11 | 2/8 |
| 106231–106238 | 0 | 0 | 5 | 0 | 5/8 | 8/8 | 151 | 6/8 | 677 | 1 | 3/8 |
| **Total (24 seeds)** | **0** | **0** | **6/24** | **0** | **6/24** | **23/24** | — | **12/24** | **1,867** | **20** | **11/24** |

No wins, no national standing, no table seats on any band — the
endgame wall is untouched by this screen, as expected; the screen
measures the launch→fight pool, not the win chain. Deaths are
overwhelmingly combat: `villager combat` + `expedition` +
`combat` account for ~84% of all deaths on every band
(band 1: 293+159+129 = 581/694; band 2: 240+104+70 = 414/496;
band 3: 278+164+148 = 590/677); starvation is 20 of 1,867
(1.1%). The villages are not starving — they are being killed,
mostly by monsters, mostly on expeditions and in village
defense. The 199 stall is still the visible ceiling: 11 of 24
villages end at exactly standing 199 (band 1 is 6 of 8, the
worst band in this screen on that count). Band 3 is the
healthiest band in the screen (5/8 past 200, 5/8 wave 5,
6/8 survived) and still produces only 2 first-fights — wall
health and launch richness are not the same thing.

## 5. Sense-test: reading the fights (all three, in full)

All three first-fights read end to end from the corpus logs.

- **106221, Sam vs The Algorithm, d141, world-tick, vFlee, 3
  rounds, 59 dealt / 86 taken.** A quad launches (holder
  `app_mgpsphpp395`) and the same day Sam Wilson walks into the
  Algorithm on a world tick — the launched party's fight is
  fought by someone else, the any-origin definition working as
  designed. Bow opening: 2 shots, 1 lands (12). "R1: Sam strikes
  for 11 (929 left)" — "Recommended For You hits Sam for 27 (66
  left)". "R2: Sam strikes for 13 (916 left)" — "Engagement hits
  Sam for 34 (32 left)". "Sam is losing — shouts for help!
  Declan charges in!" "R3: Recommended For You hits Sam for 25
  (7 left)" — "R3: Sam strikes for 13 (903 left)" — "R3: Declan
  strikes for 10 (893 left)" — "Sam is still losing — shouts
  again! Sofia charges in!" — "Declan answered Sam's shout, but
  Sam is past holding — they run while running still works."
  Sam flees at 7 HP having dealt 59 of ~952. The fight reads as
  a real fight: the monster's attacks are named for what it is
  (a recommender — "Recommended For You", "Engagement"), gear
  absorbs 24/29/21 across the rounds, help is called twice and
  arrives. The one flat beat is the "answered the shout, but
  past holding" line — the same content-depth note dmgshape
  caught on d127/d133. Nothing reads robotic. The damage gap in
  miniature: 59 damage in 3 rounds is ~20/round against the 111
  shape, and the fighter was nearly dead when he ran.
- **106233, Sari vs the herald, d121, world-tick, vKill, 4
  rounds, 135 dealt / 50 taken — the screen's only kill.** "Sari
  has Sling but no stones — the string stays drawn, useless."
  (the gear-without-ammo beat, same family as Emma's bow on
  106188). "R1: The Naming hits Sari for 22 (52 left)" — "R1:
  Sari strikes for 12 (111 left)". "R2: Second Omen hits Sari
  for 8 (44 left)" — "R2: Sari strikes for 9 (102 left)" —
  "Sari is losing — shouts for help! Nikolai charges in!" "The
  Herald is wounded past its line — and holds its ground. It is
  not leaving. (Committed)" "R3: The Naming hits Sari for 20
  (24 left)" — "R3: Sari strikes for 12 (90 left)" — "R3:
  Nikolai strikes for 37 (53 left)" — "Sari is still losing —
  shouts again! Natalie charges in!" "R4: Sari strikes for 9
  (44 left)" — "R4: Nikolai strikes for 38 (6 left)" — "R4:
  Natalie strikes for 18 (0 left)" — "The lead falls — the
  pack's coordination shatters. The rest scatter or die."
  Sari's own strikes are weak (9–12 a hit) and the kill is the
  companions' work (Nikolai 37 + 38, Natalie 18). But the
  numbers underneath are the real story (see §5.1): the herald
  entered this fight at ~123 HP, not its 700–900 band — another
  villager had dealt it 577 six days earlier. This kill is a
  cleanup, not a fresh full-HP fight. Read straight, 135 damage
  in 4 rounds (~34/round) killed a wave-4 monster; read with
  the grind, the village dealt 712 across two meetings and the
  launch's party finished what the village started.
- **106234, Zandile vs the herald, d111, world-tick, vFlee, 4
  rounds, 123 dealt / 53 taken.** "R1: First Omen hits Zandile
  for 12 (59 left)" — "R1: Zandile strikes for 12 (577 left)".
  "R2: Zandile strikes for 13 (564 left)" — "R2: First Omen
  hits Zandile for 17 (42 left)" — "Zandile is losing — shouts
  for help! Abdelhak charges in!" "R3: Second Omen hits
  Zandile for 11 (31 left)" — "R3: Zandile strikes for 13
  (551 left)" — "R3: Abdelhak strikes for 24 (527 left)" —
  "Zandile is still losing — shouts again! Magda charges in!"
  "R4: Second Omen hits Zandile for 13 (18 left)" — "R4:
  Zandile strikes for 12 (515 left)" — "R4: Abdelhak strikes
  for 25 (490 left)" — "R4: Magda strikes for 24 (466 left)"
  — "Zandile sees how this ends — and runs while running still
  works." Four rounds, 123 damage (~31/round), the herald still
  standing at 466 HP. The same damage-gap shape as dmgshape's
  fled fights, with the same help-arriving-late shape: two solo
  rounds, then help in rounds 3–4. The holder here IS the
  fighter (Zandile launched d111 and fought d111) — the one
  first-fight in the screen where the launched party's holder
  fought the target herself.

### 5.1 The herald grind — confirmation of the dmgshape suspicion

The dmgshape evidence (§2.5) suspected — but could not prove —
that first-fights against a type are often cleanups of a grind:
the Eulogy's HP fell 675 → 450 → 225 → ~12 across meetings, but
the recorder carries no instance id. This screen proves the
shape twice over, from encounter rows alone:

- **106233:** d115, `app_mgpsphp2508` vs herald, world-tick,
  8 rounds, **577 dealt**, vFlee. d117, the SAME villager
  launches a quad against herald. d121, Sari vs herald,
  world-tick, 4 rounds, **135 dealt, vKill** — the monster
  entered at ~123 HP (first strike: "12 (111 left)"). 577 + 135
  = 712 against a 700–900 HP band: one herald, ground down
  across two meetings by two different villagers, finished by
  the launch's party.
- **106234:** Zandile (`visjoin_102`) vs herald, world-tick:
  d109, 4 rounds, **111 dealt**; d111 (the first-fight), 4
  rounds, **123 dealt** — entered at ~589 HP; d117, 6 rounds,
  82 dealt; d119, 1 round, 15 dealt; d143, 1 round, 11 dealt,
  vDie. Five meetings with the same type by the same villager
  in 34 days, the same holder launching d111 between the first
  two. The d111 first-fight's 123 damage is a grind installment,
  not a fresh fight.

Consequence for the damage question (finding #2605, update
filed): a first-fight's `mDealt/rounds` does not measure what a
fresh full-HP fight would cost. The 106233 kill at ~34/round
looks like a party beating the 111 shape's inverse — it killed
at a third of the winning rate — only because the target was
already nearly dead. Any future decomposition that prices
first-fights must carry the target's entry HP (or a
fresh-vs-ground-down flag); without it, kills and fled fights
are not comparable populations. The dmgshape instrument
records `mHpStart` in its own corpora; the survey instrument
does not — the judged run's analyzer must use it.

### 5.2 Transcripts (vetSays)

The villages' days cohere; the System's voice is intact:

- 106221, day 1: A man, maybe 40s, with a scarred cheek heads
  out for water. "Thirst doesn't negotiate. Going." The pantry
  won't fill itself.
- 106221, day 2: "Why should I listen to you?" (Trust too low.)
  / "Good. I'll take the first rotation. Somebody has to."
- 106233, day 27: "Oh, you survived the AUDIENCE NOTES? Cute.
  We've stopped pretending these are animals now. That was the
  FINAL DRAFT, folks — what comes out of the treeline next was
  never alive the way you mean it."
- 106233, day 37: "Oh — OH. Everybody saw that, right? Nikolai
  just put down The Callback... on CAMERA. That's a veteran
  kill, folks. REMEMBER the name."
- 106234, day 28: "This one is different — scarred, braced,
  waiting for your opening. A Scarred veteran." / "Oh — OH.
  Everybody saw that, right? Lucia just put down Spool... on
  CAMERA. That's a veteran kill, folks. REMEMBER the name."
- 106233/106234, door defense: "Jenny, Cesar, Natalie and Dias
  met them at the door — 4 put down. Jenny, Cesar, Natalie,
  Dias are hurt." (repeated across days with different
  combinations — the same named villagers holding the door is
  the village's routine, not a repeated line).

## 6. Village assessment, in plain words

Twenty-four villages lived 150 days, and the picture is
consistent across all three bands: the villages survive or die
at regional standing, and almost none of them ever go hunting.
Nine times in 24 villages a party sets out after a wave-4
monster — and six of those nine times it never meets the thing
it set out after. The three times a party does meet its target,
the fights are real and short: three or four rounds, sixty to
a hundred and thirty-five damage, and then the villagers run —
or, once, finish a monster another villager had already beaten
nearly to death six days before. The villages that do launch
fight properly — bow openings, called help, companions charging
in — but the damage is small because the strikes are few and
weak (nine to thirteen a hit from the fighters themselves; the
companions land the heavy blows when they arrive, and they
arrive late).

The striking thing is not the fights. It is the silence around
them. One village deliberated 119 times at dawn and never once
sent anyone out. Another fought nothing for 110 days and died.
A third village's busiest member launched twice in four days
after the same monster and met it neither time. The villages
are not cowardly — they fight at the door every day, they kill
wave-3 monsters on camera, five of eight villages on the best
band reached wave 5. They just do not go out after the big
monsters. The plan is made, and then it churns before dawn, or
the candidate is never bid at all. The damage question — what
lifts a launched party toward 111 damage a round — cannot even
be asked on these bands, because there is no launched party to
measure. The binding constraint moved one step upstream from
where the last run left it: not the shape of the fights, but
whether the fights happen.

## 7. Metric review (for the NEXT run — this run is judged as frozen)

1. **The designation bar did what it was designed to do — and
   the failure is a different one than it was built for.** The
   strike bar (≥4 distinct strike-fights) was added because
   dmgshape's pool was strike-poor (2 of 6 distinct). Here the
   strike bar never binds: 3 of 3 first-fights strike. What
   binds is the pool floor itself (2 vs 6) — the launches are
   not there. The bar structure is vindicated, not refuted: on
   a launch-rich band it would separate a strike-poor pool from
   a strike-rich one. Keep both bars for the next screen.
2. **The 4th-band question.** The brief allows 2–4 bands; this
   prereg froze the cap at 3 ("at most 3 legs"), and the cap
   binds — a 4th band now would be a post-hoc extension of a
   frozen cap, the drift §14 forbids. The coordinator may
   authorize a fresh screen (new prereg, new cap) on band
   **106241–106248**: scoped-fresh per the survey protocol
   (zero hits in any prereg, zero seed-field hits in any sim
   `.md` / script, zero in goal `hidden_files/*.md`, zero
   filenames in the worktree or `hidden_files/` — full-tree
   bounded content check not re-run for this band). But the
   three screened bands maxed at 2 first-fights against a
   floor of 6, so a 4th band is a lottery ticket, not a plan:
   the launch engine, not the seed draw, is the binding
   constraint now.
3. **Launch rate is the question, not band choice.** The
   dmgsurvey survey (base `c75503d6f`) measured 40 launches /
   32 seeds; this screen (base `057bfa60f`) measures 9 / 24.
   The only `src/` change between the bases is a
   conversation.js gossip-ask fix, which touches no launch
   code — so the collapse is read as band variance on a lumpy
   engine, but the two surveys ran on different seed sets and
   the launch engine's band-to-band variance is itself
   unmeasured (dmgsurvey's bands ranged 6–16 launches; these
   range 1–6). A cheap decisive check exists and is owed
   before the next screen: re-run the dmgsurvey instrument on
   ITS designated band (106181–106188) on THIS base and compare
   launch counts — if the band still launches 16 times, the
   collapse is band variance; if it drops, something in the
   base moved the launch engine and the diff is the story.
4. **The grind changes what a first-fight measures (§5.1).** A
   kill at ~34/round and a fled fight at ~31/round look alike
   until entry HP is known. The judged run's analyzer must
   carry entry HP (the dmgshape corpora record `mHpStart`;
   the survey corpora do not) and report fresh-vs-ground-down
   beside every first fight. Without it, the decomposition
   mixes cleanups with fresh fights.
5. **Funnel taxonomy note:** band 1's analyzer line reports
   `launched-fought-no-kill: 1` while the first-fight join
   finds 0 first-fights — the funnel's "fought" counts a fight
   that is not the launch's first fight against its target
   (outside the 21-day window, or against another monster).
   The two definitions answer different questions; the evidence
   reports both and judges on the first-fight definition.
6. **Panel / telemetry:** no panel compare was run — there is
   no before/after here (a survey designates; it does not
   compare) and no band designates, so there is nothing to
   compare against. Telemetry was not run for the same reason
   (the check compares a run corpus against a baseline; the
   survey corpora are recorder corpora and the check refuses
   them — the dmgshape-b precedent). Wall numbers above are
   reported directly.
7. **No `check.js` gate was run** — this step is evidence-only
   survey instrument, never to be merged as a game change; the
   proof tests (`test-strikeband-survey-b.js` 39/39, analyzer
   selftest 22/22) are the gate for this step. The judged
   prereg (step 2) was NOT written — it needs a designated
   band, and there is none.

## 8. Blanks and findings notes for the coordinator

- **JUDGED VERDICT (step 1): NO-GO — no band designates.**
  Best band 106231–106238: 2 first-fights (floor 6), 2
  distinct strike-fights (floor 4). Taxonomy complete (0
  unknown) and instrument clean (8/8 files, 0 errors) on all
  three bands; proof test 39/39; selftest 22/22. The screen
  itself ran clean — the pools are not there.
- **Steps 2–3 NOT RUN (blocked, not skipped):** no designated
  band exists, so the counterplay-priced decomposition prereg
  was not frozen and the ALLYSLOT3 port was not performed.
  `src/` diff on this branch is 0 lines. Do not merge anything
  from this branch as a game change; the coordinator lands
  evidence-only or releases the branch done-abandoned.
- **Finding #2605 — STILL BLOCKED, now upstream:** the damage
  question still has no judged answer, and the blocker moved
  from fight shape (dmgshape-b: pool passed, shape failed) to
  launch formation (this screen: no pool at all). The
  counterplay classification + strike-rate decomposition from
  the brief's step 2 remains the right instrument — it now
  needs a pool first. Update filed to `sim-findings.md`.
- **NEW finding #2627 — THE LAUNCH DROUGHT (coordinator to
  file):** 9 launches / 24 seeds (0.375/seed) vs 40 / 32
  (1.25/seed) on the dmgsurvey survey; 431 depart rows → 9
  launches; 13/24 seeds launch nothing; binding stages
  plan-churned-before-dawn (band 1) and candidate-not-bid
  (bands 2–3). Filed to `sim-findings.md`.
- **Herald-grind confirmation (finding #2605 update):** two
  proven grind-then-cleanup sequences (§5.1) — 106233 (577
  then a 135 kill at ~123 entry HP) and 106234 (111, 123, 82,
  15, 11 across five meetings). Entry HP must be carried by
  any future decomposition. Filed as an update to #2605.
- **Repeat-target churn, second sighting:** 106237 launches
  twice in four days against network_note, no meeting either
  time — the same shape as the dmgsurvey 'audit' churn. The
  no-fight launches are 6 of 9 here (vs 15 of 40 in the
  survey); the churn is not the binding failure (launches
  are), but it is where a third of the scarce launches go.
- **Standing-199 stall, 11/24 seeds.** Band 1 is 6/8. Same
  stall the program has seen on every band; still the visible
  ceiling. Band 3 shows the stall is not a wall-health
  problem: 5/8 past 200, 5/8 wave 5 — and still only 2
  first-fights.
- **Wave 5 opened on 6/24** (band 3: 5/8). Survival 12/24,
  median 128–151d by band — the wall is otherwise unchanged.
- **Out-of-scope gap (note only):** `villager combat` (41–48%)
  + `expedition` (21–24%) + `combat` (14–22%) = ~84% of
  villager deaths are combat classes on all three bands; the
  unstoried `the wild` + `monster` are ~9%. Same note as
  finding #2607's family; no new mechanism claimed here.
- **Instrument note:** the strike-fight extension is verified,
  not assumed: analyzer selftest §D proves counted-vs-distinct
  strike separation on synthetic fixtures, and the proof test
  §2b proves it end-to-end through `firstFightStats` on real
  temp-dir corpora. The designation proxy (`mDealt > 0`) was
  never the binding failure — all three first-fights struck.
- **Write flap:** QUIET this run — the prereg, instrument, all
  24 corpora, and the survey JSON wrote on first attempt (0
  `@@FALLBACK` in the legs log). The VM did not restart during
  the run.
- **Safe-commit index clobber struck twice** on this branch
  (after the prereg commit `20bd56c68` — committed file showed
  staged-deleted — and the instrument commit `ce02edc79` — all
  three files showed staged-deleted). Repaired both times with
  the documented `git ls-tree -r HEAD -- <paths> | git
  update-index --add --index-info` pipe; verified by `git
  status` empty + `git diff HEAD` empty + hash-object == HEAD
  blob per file. The corpora/evidence commits below must be
  checked the same way.
- **No `check.js` gate was run** (see §7.7). The ported lever
  was never performed — there was nothing to port it for.
