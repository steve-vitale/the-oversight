# sim-strikeband4-b — 4th-band screen: 106241–106248, no designation (finding #2605)

**Verdict: NO-GO (survey — the band does not designate). Steps 2–3 NOT RUN.**
**Steps 2–3 blocked:** the judged counterplay-priced decomposition
(step 2) and its ALLYSLOT3-ported run (step 3) need a designated
band. This band clears neither frozen bar, so no band was
designated, no port was performed, and no judged sim ran. The
ALLYSLOT3 port is NOT on this branch (`src/` diff 0 — verified
below). The 4th-band question is now closed for this screen: four
fresh bands screened, none designates.

- **Branch:** `sim-strikeband4-b`, tip `c02411c23` (instrument) at
  screen time; base master `1fcd7edba` (sim-winnability-round-1830
  adoption record)
- **Screen prereg:** `evidence/2026-11-20/sim-strikeband4-b-prereg.md`
  (frozen 2026-11-20 ~21:35 UTC, before the leg; commit
  `ac03dab8f`)
- **Instrument:** `scripts/strikeband4-survey-driver-b.js` +
  `scripts/analyze-strikeband4-survey-b.js` +
  `scripts/test-strikeband4-b.js` (commit `c02411c23`);
  proof test **39/39 green**, analyzer selftest **22/22 green**
- **Survey JSON:** `evidence/2026-11-20/strikeband4-b-survey.json`
  (analyzer exit 1 = NO-GO verdict, not a failure)
- **Leg log:** `evidence/2026-11-20/strikeband4-b-legs.log`
  (8 driver JSON lines; LEG_EXIT:0; 0 `@@FALLBACK`)
- **Corpus:** `evidence/2026-11-20/perseed-strikeband4-b-106241-106248/`
  (8 files, 0 errors)
- **Seeds screened:** 106241–106248 (8 seeds, 150d death-aware,
  competent verbatim policy sha `1884c8852d38`)
- **Leg:** SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1
  FIGHTALLY2=1 ALLYSLOT3=1 (env-only — port NOT an ancestor of
  HEAD, 0 occurrences in `src/js`) LAUNCHSURVIVE=1. Leg runtime:
  ~2.7 min.

## 1. Judged numbers (frozen designation bar, screen prereg)

| Bar | Band 106241–106248 | Bar | Result |
| --- | --- | --- | --- |
| Launches (frozen definition) | 7 | — | — |
| First-fights (counted / distinct) | 3 / 3 | ≥ 6 | **FAIL (3)** |
| Distinct strike-fights (mDealt > 0) | 3 | ≥ 4 | **FAIL (3)** |
| Distinct strike-fights, exact landed-strike reading | 2 (see §5.1) | ≥ 4 | **FAIL (2)** |
| Counterplay first-fights (mDealt = 0) | 0 | — | 0 |
| Fled / killed / died first-fights | 3 / 0 / 0 | — | — |
| No-fight launches | 4 | — | 4 of 7 |
| Quad launches | 3 | — | 3 |
| Funnel taxonomy unknown | 0 | 0 | **PASS** |
| Instrument errors / files | 0 / 8 | 0 / 8 | **PASS** |

The band fails both frozen bars, so the verdict is NO-GO. The bar
was not lowered, moved, or re-scored after seeing the numbers.
The strike bar binds as well as the pool floor this time: 3
first-fights against a floor of 6, 3 distinct strike-fights
against a floor of 4 — and the exact reading (§5.1) drops the
strike count to 2, because one of the three "strike-fights" is
bow-volley-only with zero landed strikes. Unlike the strikeband
screen (where the strike bar never bound — 3 of 3 first-fights
struck), here both bars bind.

## 2. The launch picture — counted launches thin, uncounted launches plentiful

The frozen definition counts 7 wave-4+ launches on this band.
The raw `v4departs` rows tell a wider story: 177 launch rows
across the 8 seeds, of which 15 are launches against a wave-4
target type (algorithm, eulogy, influencer, congregation) with
`targetWave` null — excluded by the frozen `launchesOf`
definition, which requires `(targetWave | 0) >= 4 AND target`.
The 15 uncounted launches outnumber the 7 counted ones more
than 2-to-1:

| Seed | Counted w4+ launches | Uncounted w4-target launches (targetWave null) | All launch rows |
| --- | --- | --- | --- |
| 106241 | 0 | 0 | 11 |
| 106242 | 3 (algorithm) | 2 (algorithm, amina_diallo d90/d94) | 25 |
| 106243 | 0 | 0 | 41 |
| 106244 | 1 (eulogy) | 5 (eulogy, d111 ×2, d115, d116, d119) | 15 |
| 106245 | 1 (influencer) | 1 (influencer, chantal_mukendi d112) | 28 |
| 106246 | 2 (congregation) | 7 (congregation, d61–d85) | 27 |
| 106247 | 0 | 0 | 11 |
| 106248 | 0 | 0 | 19 |
| **Total** | **7** | **15** | **177** |

The uncounted launches are follow-on hunts: a villager who
already knows the target goes after it again, in a pair or
alone (partySize 1–2), after the counted quad launch. Daniyar
Askarov launches four times against the congregation on 106246
(d63, d70, d77, d85) around the counted d65 launch that fought
it on d78. The eulogy on 106244 draws six launches (d107
counted, then d111 ×2, d115, d116, d119 uncounted). The villages
are not idle — 106243 launches 41 times, 106245 28 times — but
most launches are generic hunts (target null) or wave-3 targets
(chorus_line 13 times on 106243; redactor 6 + spool 3 on
106245). The wave-4+ launches that do happen are mostly
follow-ons the frozen definition does not count.

The verdict is robust to this definition question (see §7.2):
even counting all 15 uncounted launches, the distinct
first-fight count stays 3 — the extra launches share the same
three fights — still below the floor of 4. The definition
question is a next-run instrument item, not a re-score.

The binding funnel stage is **candidate-not-bid (19)** — the
same stage that bound bands 2–3 of the strikeband screen —
with plan-churned-before-dawn (7) second. The funnel taxonomy
is complete (0 unknown). Funnel counts beside the join:
launched-fought-no-kill 2, launched-no-meeting 2,
selected-blocked 1, plan-churned-before-dawn 7,
candidate-not-bid 19 — the funnel's "fought" (2) and the
first-fight join (3) differ by definition, as the strikeband
evidence §7.5 documented: the funnel counts a fight outside
the 21-day window or against another monster. Both are
reported; the verdict judges on the first-fight definition.

Repeat-target churn, third sighting: grace_obi launches three
times against the algorithm on 106242 (d85, d90, d94) and never
meets it — the village had already fought the algorithm three
times (d40, d78, d82) before the launches, and never again.
Same shape as the dmgsurvey 'audit' churn and 106237's
network_note churn.

## 3. Per-seed maps (launches / first-fights / fled / killed / died / no-fight)

- 106241 (lost d138, standing 199, wave 4): 0 / 0 — 0 counted
  launches; 11 generic-hunt launch rows, 0 wave-4 targets.
  Reached Arc IV on d64 (see §4).
- 106242 (survived 150d, standing 199, wave 4): 3 / 0 / 0 / 0 / 0 / 3 —
  grace_obi vs algorithm d85, d90, d94, no meeting any time.
- 106243 (lost d148, standing 705, wave 5): 0 / 0 — 41 launch
  rows, 27 generic + 14 wave-3 (chorus_line 13), 0 wave-4
  targets. The highest-standing village on the band never
  launches at wave 4.
- 106244 (lost d135, standing 199, wave 4): 1 / 1 / 1 / 0 / 0 / 0 —
  d107 eulogy (quad) → d126 eulogy fight, vFlee, 37 dealt
  (volley-only — see §5.1).
- 106245 (lost d127, standing 150, wave 4): 1 / 1 / 1 / 0 / 0 / 0 —
  d99 influencer (quad, same-day) → d99 influencer fight,
  vFlee, 50 dealt.
- 106246 (survived 150d, standing 465, wave 5): 2 / 1 / 1 / 0 / 0 / 1 —
  d56 congregation (quad, no meeting); d65 congregation → d78
  congregation fight, vFlee, 556 dealt in 11 rounds.
- 106247 (survived 150d, standing 570, wave 5): 0 / 0 — 11
  generic-hunt launch rows, 0 wave-4 targets; 65 wave-4+
  encounters, all fought at the door or on world ticks.
- 106248 (lost d105, standing 199, wave 4): 0 / 0 — 19 launch
  rows, 18 generic + 1 wave-3 (buffering).

Four of eight seeds launch nothing at wave 4+; two of the
three first-fights come from the only two seeds that launch
twice. The launch engine is lumpy by seed, as the dmgcheck
verdict already established — this band's engine seeds are
106242, 106244, 106245, 106246, and even there the pool is 3.

## 4. Wall numbers

| | Band 106241–106248 |
| --- | --- |
| Wins | 0 |
| National (scaleRank ≥ 2) | 0 |
| National (standing ≥ 200) | 3/8 |
| Table seats | 0 |
| Wave 5 reached | 3/8 |
| Wave 4 reached | 8/8 |
| Median survival (d, analyzer) | 142.5 |
| Survived (days ≥ 150) | 3/8 |
| Total deaths | 758 |
| Starvation deaths | 3 |
| Standing 199 | 4/8 |

No wins, no national standing, no table seats — the endgame
wall is untouched by this screen, as expected. Deaths are
overwhelmingly combat: `villager combat` 262 (34.6%) +
`expedition` 249 (32.8%) + `combat` 118 (15.6%) = 629/758
(83.0%); starvation is 3 of 758 (0.4%). The villages are not
starving — they are being killed, mostly by monsters, mostly
on expeditions and in village defense. The 199 stall is still
the visible ceiling: 4 of 8 villages end at exactly standing
199.

Reachability note: seed 106241 — a village that never launches
at wave 4+ — reaches **Arc IV** on d64 ("ARC IV — THE
INEFFICIENCY ... They finally see it. The thing they laughed
at — needing to EAT — is the engine."). Arc reach does not
wait on the launch engine. Wave 5 opened on 3/8 seeds
(106243, 106246, 106247), all three past standing 200.

## 5. Sense-test: reading the fights (all three, in full)

All three first-fights read end to end from the corpus logs.
One instrument limit bites here: fight logs are capped at 20
lines in the recorder (max log length 20 across all 203
encounters on this band; 52 hit the cap), so the 11-round
congregation fight below reads only through round 5 — the
numbers (rounds 11, mDealt 556) are authoritative, the
round-by-round text is not complete.

- **106244, Raj vs The Eulogy, d126, aid, vFlee, 1 round,
  37 dealt / 22 taken — volley-only (see §5.1).** "Raj sees
  The Big Stare coming and nocks an arrow — the fight opens at
  range (3 shots)." "loosed — it takes The Big Stare for 19
  (366 left)." "loosed — it takes The Big Stare for 18 (348
  left)." "loosed wide — the arrow buries itself in the dirt.
  (spent)" "Raj lowers the bow — The Big Stare is on them now.
  (2/3 hit)" "R1: Raj contradicts the narration — it says Raj
  runs — Raj advances." "Raj's gear absorbs 31." "R1: Final
  Chapter hits Raj for 22 (22 left)" "Raj is past holding —
  they run while running still works." The same day, a second
  eulogy row for Raj: "Raj has Bow but no arrows — the string
  stays drawn, useless." "R1: Raj contradicts the narration —
  it says Raj runs — Raj advances." "Raj's gear absorbs 28."
  "R1: Epitaph hits Raj for 20 (2 left)" — the gear-without-
  ammo beat again (Sari's sling on 106233, Emma's bow on
  106188). The counterplay works — Raj contradicts the
  narration and advances — but one round at 22 HP left is a
  flee, not a fight. Four days later (d130) Raj dies to the
  same eulogy (vDie, 38 dealt, 15 taken).
- **106245, Valentin vs The Influencer, d99, world-tick,
  vFlee, 5 rounds, 50 dealt / 62 taken — the same-day fight.**
  The launched holder is visjoin_90; the fighter is
  visjoin_79 (Valentin) — the any-origin definition working as
  designed. "Valentin has Bow but no arrows — the string stays
  drawn, useless." "R1: Valentin walks in open-handed — and it
  goes wrong. It doesn't want peace. They're exposed,
  off-balance. (Walk In — failed)" "still off-balance from the
  failed parley, Valentin takes it worse. (Peacemaker —
  exposed)" "R1: Ratio hits Valentin for 12 (72 left)" "R2:
  Valentin ignores the ring light and hunts the followers — a
  phone clatters, a fan-creature drops. (1 down.)" "Valentin
  holds the line — working the trick, not the damage race."
  "R3: Valentin strikes for 26 (x1.2) (824 left)" "R4:
  Valentin ignores the ring light and hunts the followers — a
  phone clatters, a fan-creature drops. (2 down.)" "R5:
  Valentin strikes for 24 (x1.3) (800 left)" "R5: Ratio hits
  Valentin for 13 (22 left)" — then Valentin flees (the log
  ends without a flee line; the outcome is vFlee). This is a
  counterplay-shaped fight that still strikes: Valentin works
  the Influencer's trick (hunt the followers) across all five
  rounds and lands two real strikes (26 + 24 = 50). The same
  day, Owen fights the same Influencer (3 rounds, 67 dealt,
  29 + 30 strikes, help arrives twice) — the grind shape in
  miniature, two villagers against one monster on one day.
  The failed parley opening reads honestly — walking in
  open-handed against the Influencer goes wrong, and the game
  says so.
- **106246, Daniyar vs The Congregation, d78, expedition,
  vFlee, 11 rounds, 556 dealt / 64 taken — the biggest
  first-fight in the whole strikeband family.** "Daniyar walks
  straight into The Congregation. No avoiding it." "R1:
  Daniyar strikes for 21 (954 left)" "R1: Absolution hits
  Daniyar for 9 (74 left)" "R2: Daniyar strikes for 18 (936
  left)" "Daniyar is losing — shouts for help! DeShawn charges
  in!" "R3: Daniyar strikes for 18 (918 left)" "R3: DeShawn
  strikes for 26 (892 left)" "R3: Absolution hits Daniyar for
  12 (50 left)" "Daniyar is still losing — shouts again! Maya
  charges in!" "R4: Daniyar stops mid-fight and binds the
  wound — field medicine, +20 HP." "R4: DeShawn strikes for 24
  (868 left)" "R4: Maya strikes for 19 (849 left)" "R4:
  Absolution hits Daniyar for 10 (60 left)" "R5: Daniyar
  strikes for 21 (828 left)" "R5: DeShawn strikes for 22 (806
  left)" — and the log cuts there (20-line cap). The fight
  ran six more rounds to 556 dealt total (~50/round, the
  closest any screened first-fight has come to the 111 shape)
  and Daniyar walked away alive. Entry HP ~975 (band floor
  850–1500) reads as a fresh fight, not a grind cleanup —
  the first fresh full-HP first-fight the family has measured
  at this scale. The party fights properly: bow-less opening
  strike, called help arriving in rounds 2–3, field medicine
  mid-fight, three fighters dealing 18–26 a hit. What it
  lacks is damage per strike, not strikes: 11 rounds at
  ~50/round against a 975-HP monster is a flee at the end of
  a long fight, not a rout.

### 5.1 The volley-only proxy catch + the grind, third confirmation

- **The proxy over-counts, and this band catches it.**
  The 106244 eulogy "strike-fight" (mDealt 37) is bow-volley
  damage only: 19 + 18 from the opening volley, zero landed
  strikes (the single round is a contradict, no strike line).
  The frozen proxy (`mDealt > 0`) counts it as a strike-fight;
  the exact landed-strike reading does not. By the exact
  reading the band has 2 distinct strike-fights, not 3. The
  verdict does not change — 2 < 4 as surely as 3 < 4 — and
  the prereg's proxy caveat named exactly this case. The
  judged run's exact re-classification (landed-strike
  `pMean != null`) remains mandatory.
- **The grind, third confirmation.** The 106244 eulogy was
  fought before the launch's first fight: d105, Marcus Webb,
  3 rounds, 49 dealt; d106, Aria Thompson, 1 round, 16
  dealt; then the d126 first-fight entered at ~385 HP (first
  volley: "19 (366 left)") against a band of 850–1500 — the
  monster was already ground down to under half before the
  launched party ever met it. Raj dies to it on d130. The
  strikeband §5.1 rule stands: entry HP must be carried by
  any future decomposition, or cleanups and fresh fights are
  not comparable populations. The 106246 congregation fight
  (entry ~975) is the counter-example that proves the rule's
  value: fresh fights read differently, and only entry HP
  tells them apart.

### 5.2 Transcripts (vetSays)

The villages' days cohere; the System's voice is intact:

- 106241, day 25: "Oh, you survived the AUDIENCE NOTES? Cute.
  We've stopped pretending these are animals now. That was the
  FINAL DRAFT, folks — what comes out of the treeline next was
  never alive the way you mean it."
- 106241, day 53: "We've been watching you for a LONG time.
  Your faiths. Your formats. Your little institutions. So we
  built something out of... well. Out of YOU. Say hello to the
  MIRROR DRAFT."
- 106241, day 44: "Oh — OH. Everybody saw that, right?
  Leonard just put down The Callback... on CAMERA. That's a
  veteran kill, folks. REMEMBER the name."
- 106241, day 64: "Four waves. FOUR. The producers are — okay,
  I'm saying it: FINALES need a NATION. You've got a region;
  now make it a REALM. Bind fires under one head, or bend the
  knee to someone who has. The higher-ups are watching. ...Did
  I say higher-ups? I said NOTHING. Forget the higher-ups."
- 106241, door defense, days 9–131: "Leonard, Asher, Andres
  and Kaewta met them at the door — 3 put down, 1 driven off.
  Leonard, Asher, Andres, Kaewta are hurt." (repeated across
  days with different combinations — the same named villagers
  holding the door is the village's routine, not a repeated
  line; by d131 it is Hinewai alone — "Hinewai met them at the
  door — 1 put down. Hinewai is hurt." — the village thinning
  to one defender reads as the story of its end.)

## 6. Village assessment, in plain words

Eight villages lived 150 days, and the picture is the same one
the strikeband screen drew, one band further along: the villages
survive or die at regional standing, and almost none of them ever
go hunting after the big monsters. Seven times in eight villages
a party sets out after a wave-4 monster under the frozen
definition — and four of those seven times it never meets the
thing it set out after. The three times a party does meet its
target, the fights are real: a one-round contradiction against
a monster already beaten half to death, a five-round trick-
working fight against the Influencer, and an eleven-round
stand against the Congregation where three villagers dealt 556
damage and still walked away. That last fight is the closest
any screened band has come to the winning shape — fifty damage
a round, eleven rounds, a fresh monster, a party that fights
properly — and it still ends in a flee, because the strikes
are eighteen to twenty-six a hit and the monster has nearly a
thousand health.

The striking thing, again, is not the fights. It is the
launches that the screen does not count. Fifteen times on this
band a villager sets out after a wave-4 monster the frozen
definition ignores — in a pair, alone, after a target the
village already knows — and the villages launch 177 times in
total, mostly after nothing in particular or after wave-3
monsters. The highest-standing village on the band (106243,
standing 705, wave 5) launches forty-one times and never once
at a wave-4 target. The villages are not cowardly — they fight
at the door every day, they kill wave-3 monsters on camera,
three of eight reach wave 5, one reaches Arc IV without ever
launching at wave 4. They just do not go out after the big
monsters in the counted way. The plan is made, and then the
candidate is never bid at all — nineteen times on this band
alone. The damage question — what lifts a launched party
toward 111 damage a round — still has no pool to measure on,
because there is no launched party to measure. Four fresh bands
screened now, none designates. The screen as designed can only
find pools, not make them; the next move on the damage question
belongs to the launch engine, not to a fifth band.

## 7. Metric review (for the NEXT run — this run is judged as frozen)

1. **Both bars bound this time.** On the strikeband screen the
   strike bar never bound (3 of 3 first-fights struck); here
   the pool floor binds (3 vs 6) AND the strike bar binds (3
   vs 4; 2 vs 4 on the exact reading). The bar structure is
   vindicated twice over: it separates a thin pool from a
   strike-poor one, and this band is both.
2. **The 4th-band question is closed.** Four fresh bands
   screened under the same protocol (106211–106218,
   106221–106228, 106231–106238, 106241–106248): best bands
   2 and 3 first-fights against a floor of 6. The screen's
   cap (one band, this prereg) binds and the question is
   answered: fresh bands do not designate on this engine. A
   fifth band would be a fourth lottery ticket; the
   coordinator's call now is the launch engine (why
   candidates are never bid — 19 times on this band — and why
   plans churn before dawn), not another screen.
3. **The uncounted-launch definition question (new).** The
   frozen `launchesOf` requires `(targetWave | 0) >= 4 AND
   target`; 15 launches against wave-4 target types carry
   `targetWave` null and are excluded. These are follow-on
   hunts (partySize 1–2) by villagers who already know the
   target, distinct from the counted quad launches. The
   verdict is robust to the question — counting all 15 leaves
   distinct first-fights at 3, still below the floor of 4 —
   but the next instrument revision should decide, before
   freezing, whether follow-on hunts count as launches: they
   are 2× the counted launches on this band, and the
   "launch drought" reads differently if they count. Do NOT
   re-score this run; the question goes to the next prereg.
4. **The volley-only proxy catch (§5.1).** The frozen proxy
   (`mDealt > 0`) over-counted once on this band: the 106244
   eulogy fight is volley-only, zero landed strikes. The
   prereg's proxy caveat named exactly this case, and the
   judged run's exact re-classification remains mandatory.
   No bar changes follow — the verdict fails on both
   readings.
5. **Fight-log cap (instrument limitation, new).** Encounter
   `log` arrays cap at 20 lines (max 20 across all 203
   encounters; 52 hit the cap). Long fights cannot be read
   end to end from the corpus — the 11-round congregation
   fight reads only through round 5. The numbers (rounds,
   mDealt) are authoritative; the text is partial. A future
   instrument revision should raise or remove the cap if
   sense-testing long fights matters.
6. **Funnel-vs-join gap, same as strikeband §7.5:** the
   funnel reports launched-fought-no-kill 2 while the join
   finds 3 first-fights. The two definitions answer different
   questions; the evidence reports both and judges on the
   first-fight definition.
7. **Panel / telemetry:** no panel compare was run — there is
   no before/after here (a survey designates; it does not
   compare) and no band designates, so there is nothing to
   compare against. Telemetry was not run for the same reason
   (the check compares a run corpus against a baseline; the
   survey corpora are recorder corpora and the check refuses
   them — the dmgshape-b precedent). Wall numbers above are
   reported directly.
8. **No `check.js` gate was run** — this step is evidence-only
   survey instrument, never to be merged as a game change; the
   proof tests (`test-strikeband4-b.js` 39/39, analyzer
   selftest 22/22) are the gate for this step. The judged
   prereg (step 2) was NOT written — it needs a designated
   band, and there is none.

## 8. Blanks and findings notes for the coordinator

- **JUDGED VERDICT: NO-GO — the band does not designate.**
  106241–106248: 7 launches, 3 first-fights (floor 6), 3
  distinct strike-fights by proxy / 2 by exact reading
  (floor 4). Taxonomy complete (0 unknown) and instrument
  clean (8/8 files, 0 errors); proof test 39/39; selftest
  22/22. The screen itself ran clean — the pool is not there.
- **Steps 2–3 NOT RUN (blocked, not skipped):** no designated
  band exists, so the counterplay-priced decomposition prereg
  was not frozen and the ALLYSLOT3 port was not performed.
  `src/` diff on this branch is 0 lines. Do not merge anything
  from this branch as a game change; the coordinator lands
  evidence-only or releases the branch done-abandoned.
- **Finding #2605 — STILL BLOCKED, now four bands deep:** the
  damage question still has no judged answer. Four fresh bands
  screened, none designates; best bands 2 and 3 first-fights.
  The blocker is launch formation, not fight shape — and this
  band sharpens it: the binding stage is candidate-not-bid
  (19), and the villages launch 177 times but mostly at
  nothing or at wave 3. Update filed to `sim-findings.md`.
- **NEW instrument question — uncounted wave-4-target
  launches:** 15 launches against wave-4 target types carry
  `targetWave` null and fall outside the frozen definition
  (7 counted). Whether follow-on hunts count as launches is
  a next-prereg decision, not a re-score (verdict robust:
  distinct first-fights stay 3 either way). Noted in
  `sim-findings.md` as an update to #2605.
- **Volley-only proxy catch:** the 106244 eulogy "strike-fight"
  is bow-volley-only (37 dealt, zero landed strikes). The
  prereg's proxy caveat predicted exactly this; the judged
  run's exact re-classification stays mandatory. Noted in the
  #2605 update.
- **Herald-grind shape, third confirmation (§5.1):** the
  106244 eulogy was ground down across d105 (49) + d106 (16)
  before the d126 first-fight entered at ~385 HP; Raj dies to
  it d130. Entry HP must be carried by any future
  decomposition. The 106246 congregation (entry ~975) is the
  fresh-fight counter-example.
- **Repeat-target churn, third sighting:** grace_obi launches
  three times against the algorithm (d85/d90/d94), no meeting
  — the village had already fought it three times before.
- **Standing-199 stall, 4/8 seeds.** Same stall the program
  has seen on every band; still the visible ceiling.
- **Wave 5 opened on 3/8** (106243, 106246, 106247). Survival
  3/8, median 142.5d — the wall is otherwise unchanged.
- **Arc IV reached on a no-launch seed (106241, d64).** Arc
  reach does not wait on the launch engine.
- **Out-of-scope gap (note only):** `villager combat` (34.6%)
  + `expedition` (32.8%) + `combat` (15.6%) = 83.0% of
  villager deaths are combat classes; starvation 3/758
  (0.4%). Same note as finding #2607's family; no new
  mechanism claimed here.
- **Instrument note:** the strike-fight extension is verified,
  not assumed: analyzer selftest §D proves counted-vs-distinct
  strike separation on synthetic fixtures, and the proof test
  §2b proves it end-to-end through `firstFightStats` on real
  temp-dir corpora. The volley-only catch is a proxy limit
  the prereg already named, not an instrument failure.
- **Write flap:** QUIET this run — the prereg, instrument,
  all 8 corpora, and the survey JSON wrote on first attempt
  (0 `@@FALLBACK` in the legs log). The VM restarted ~21:21Z
  before this run (registry-lock contention on heartbeats);
  no work was lost.
- **Safe-commit index clobber struck twice** on this branch
  (after the prereg commit `ac03dab8f` — committed file showed
  staged-deleted — and the instrument commit `c02411c23` —
  all three files showed staged-deleted). Repaired both times
  with the documented `git ls-tree -r HEAD -- <paths> |
  git update-index --add --index-info` pipe; verified by
  `git status` empty + `git diff HEAD` empty + hash-object ==
  HEAD blob per file. The evidence/corpus commits below must
  be checked the same way.
- **No `check.js` gate was run** (see §7.8). The ported lever
  was never performed — there was nothing to port it for.
