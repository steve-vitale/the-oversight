# sim-dmgsurvey-b — damage-question survey: fresh bands under the full landed substrate

**Verdict: GO — designate band 106181–106188 for the next dmgshape run.**

- Prereg: `evidence/2026-11-20/sim-dmgsurvey-b-prereg.md` (frozen 2026-11-20 ~02:32 UTC, commit `b7046daa6`)
- Survey JSON: `evidence/2026-11-20/dmgsurvey-b-survey.json` (analyzer exit 0)
- Base: master `c75503d6f02acfed7eb62cdaf1c81cf793337367` — zero `src/js` changes (evidence-only arm)
- Policy: competent verbatim, sha256 `150229eda010b89e4c73c0e7e68d06d30a7191cc3748778339c81f09e470161a` (first 12 `150229eda010`, git blob `8f8307b54dee`; bowcraft turn-on live)
- Horizon: 150d, death-aware, MODE=vre, recorder ON, 4 legs × 8 seeds = 32 villages
- Instrument: `scripts/dmgsurvey-driver-b.js` + `scripts/analyze-dmgsurvey-b.js` (commit `c5c135ec1`); proof test `scripts/test-dmgsurvey-b.js` **34/34 green**, analyzer selftest **17/17 green**

## Substrate — and the ALLYSLOT3 discrepancy (read first)

The brief designated the substrate as the seven env flags "as landed on master c75503d6f":
`SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1 FIGHTALLY2=1 ALLYSLOT3=1 LAUNCHSURVIVE=1`.
Six of the seven are as landed. **ALLYSLOT3 is not**: the port commit `f4d1100ee` is NOT an
ancestor of HEAD, and `src/js/` contains zero occurrences of `ALLYSLOT3` or `ally3Vid`.
The other five game flags ARE env-gated on master (SENSEEXPED in `party-wiring.js`;
PARTYSIZE4 in `villager-brain.js`/`win-plan.js`; VETREENGAGE in `game.js`/`villager-brain.js`/`win-plan.js`;
FLEEREPAIR2 in `win-plan.js`; FIGHTALLY2 in `fieldFights.js`/`party-wiring.js`).
LAUNCHSURVIVE is driver-local (launch tracker rows; no game-code read).

Decision, recorded in the prereg: proceed WITHOUT porting (porting would violate the brief's
explicit ZERO `src/js` changes rule). Every leg still set `ALLYSLOT3=1` in the environment;
the driver asserts the env var is set and records `allyslot3InSrc: false` on all 32 corpora,
never asserting src presence. Rationale: the survey's primary metric is first-fight
EXISTENCE, which the slot cannot change — it gates only ally3's in-fight damage, never
launch formation or whether a fight is fought. **Consequence: this designation is valid
on the substrate as actually run (six flags live + ALLYSLOT3 env-only).** The next dmgshape
run ports ALLYSLOT3 as dmgshape-rerun-b did and re-verifies its pool on arrival. If the
coordinator rules the designation must be measured WITH the slot live in code, this survey
must be re-run on a ported branch. This is the single largest caveat on the verdict.

## Judged numbers (frozen prereg — primary metric: launched first-fights per 8-seed band, any-origin)

GO bars: (1) best band ≥ 6 first-fights; (2) funnel taxonomy complete (0 `unknown`) on ALL bands;
(3) 8/8 files parse, 0 instrument errors per band; (4) proof test + analyzer selftest + D1/D2 green.
All four bars pass. Ranking: firstFights desc, then launches, then quadLaunches, then median survival.

| Band | Launches | First-fights (distinct) | Fled | Killed | Died | No-fight | Quads | Trios | Instances opened | Binding funnel stage | Unknown |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **106181–106188 ★** | **16** | **9 (6)** | **6** | **0** | **3** | **7** | **9** | **12** | 18 | plan-churned-before-dawn (5) | 0 |
| 106171–106178 | 12 | 8 (7) | 7 | 1 | 0 | 4 | 6 | 9 | 19 | plan-churned-before-dawn (9) | 0 |
| 106161–106168 | 6 | 5 (5) | 2 | 2 | 1 | 1 | 4 | 5 | 11 | candidate-not-bid (3) | 0 |
| 106191–106198 | 6 | 3 (3) | 2 | 0 | 1 | 3 | 4 | 6 | 20 | candidate-not-bid (8) | 0 |
| **Total (32 seeds)** | **40** | **25 (21)** | **17** | **3** | **5** | **15** | **23** | **32** | 68 | — | 0 |

★ Designated band: **106181–106188** — 9 first-fights clears the floor of 6, with the most
launches (16) and the most quad launches (9) of any band. Runner-up 106171–106178 also clears
the floor (8 first-fights, 12 launches) and is the honest fallback if the designated band
is ever disqualified (e.g. by the ALLYSLOT3 question above).

First-fight definition (dmgshape-rerun-b verbatim): earliest `v4encounters` row with
`mid === launch.target` (monster TYPE id; no instance id), day in `[launch.day, launch.day+21]`,
fought (`rounds > 0` or `mDealt > 0`), ANY origin, ANY fighter. Earliest day wins; file order
breaks same-day ties. Two launches may share one fight; the distinct count is reported beside
the counted count. Launch = `v4departs` row with `result: 'launch'` and `targetWave >= 4`.
Quad launch = `partySize >= 4`. Same-day first-fights: band 1: 3, band 2: 1, band 3: 2, band 4: 1.

First-fight origins on the designated band: expedition 3, world-tick 5, aid 1 — i.e. most
counted first-fights are fights the launched party did not itself start on expedition; they
are the launched target being fought by someone, somewhere, inside the window. That is the
prereg's any-origin definition (0030Z decision), and it is what the pool counts. The next
dmgshape run decomposes on its own corpora; it should expect ~6 distinct fights on this
band, mostly fled, and should not assume the launched party fought them.

## Per-seed map (launches / first-fights / fled / killed / died / no-fight)

Band 106161–106168 — launches 6, first-fights 5:
- 106161 (survived 150d, standing 425, wave 5): 2 / 2 / 1 / 1 / 0 / 0 — engine seed.
- 106162 (lost d135, standing 199, wave 4): 0 / 0.
- 106163 (survived 150d, standing 565, wave 5): 0 / 0.
- 106164 (lost d141, standing 325, wave 5): 1 / 0 / 0 / 0 / 0 / 1.
- 106165 (survived 150d, standing 199, wave 4): 3 / 3 / 1 / 1 / 1 / 0 — engine seed.
- 106166 (lost d92, standing 199, wave 4): 0 / 0.
- 106167 (lost d131, standing 199, wave 4): 0 / 0 — 115 v4departs rows but 0 launches (all holds/other results).
- 106168 (lost d129, standing 199, wave 4): 0 / 0.

Band 106171–106178 — launches 12, first-fights 8:
- 106171 (survived 150d, standing 199, wave 4): 3 / 2 / 2 / 0 / 0 / 1.
- 106172 (lost d107, standing 199, wave 4): 0 / 0.
- 106173 (lost d139, standing 560, wave 5): 0 / 0.
- 106174 (survived 150d, standing 500, wave 5): 6 / 4 / 3 / 1 / 0 / 2 — the band's engine: 86 v4departs, 56 encounters, 222 deaths.
- 106175 (survived 150d, standing 199, wave 4): 0 / 0 — 58 v4departs rows but 0 launches.
- 106176 (survived 150d, standing 325, wave 5): 0 / 0.
- 106177 (survived 150d, standing 300, wave 5): 3 / 2 / 2 / 0 / 0 / 1.
- 106178 (survived 150d, standing 199, wave 4): 0 / 0.

Band 106181–106188 ★ — launches 16, first-fights 9:
- 106181 (survived 150d, standing 199, wave 4): 0 / 0.
- 106182 (survived 150d, standing 425, wave 5): 1 / 1 / 1 / 0 / 0 / 0.
- 106183 (survived 150d, standing 199, wave 4): 0 / 0.
- 106184 (survived 150d, standing 199, wave 4): 6 / 4 / 3 / 0 / 1 / 2 — engine seed: 4 first-fights, all vs The Eulogy.
- 106185 (lost d117, standing 155, wave 4): 0 / 0.
- 106186 (lost d145, standing 199, wave 4): 2 / 2 / 0 / 0 / 2 / 0 — both first-fights ended in a villager death.
- 106187 (lost d60, standing 99, wave 3): 0 / 0 — never reached wave 4.
- 106188 (survived 150d, standing 515, wave 5): 7 / 2 / 2 / 0 / 0 / 5 — launched most, met least: 5 no-fight launches, all re-launches against 'audit'.

Band 106191–106198 — launches 6, first-fights 3:
- 106191 (lost d114, standing 199, wave 4): 0 / 0.
- 106192 (lost d135, standing 585, wave 5): 1 / 1 / 1 / 0 / 0 / 0.
- 106193 (survived 150d, standing 375, wave 5): 1 / 1 / 1 / 0 / 0 / 0.
- 106194 (survived 150d, standing 490, wave 5): 2 / 0 / 0 / 0 / 0 / 2.
- 106195 (survived 150d, standing 199, wave 4): 0 / 0.
- 106196 (survived 150d, standing 510, wave 5): 1 / 0 / 0 / 0 / 0 / 1.
- 106197 (survived 150d, standing 190, wave 4): 0 / 0.
- 106198 (survived 150d, standing 300, wave 5): 1 / 1 / 0 / 0 / 1 / 0.

Launch richness is lumpy everywhere, as in launchfunnel-b: one or two engine seeds carry
each band (106165, 106174, 106184/106188), and 13 of 32 seeds launch nothing at all.
Four seeds (106167, 106175, and others) show dozens of `v4departs` rows with zero launches —
the village deliberates about wave-4 fights constantly and almost never actually sets out.

## Wall numbers (per band)

| Band | Wins | National (scaleRank ≥ 2) | National (standing ≥ 200) | Table seats | Wave 5 reached | Wave 4 reached | Median survival (d) | Survived (days ≥ 150) | Total deaths | Starvation deaths |
|---|---|---|---|---|---|---|---|---|---|---|
| 106161–106168 | 0 | 0 | 3 | 0 | 3/8 | 8/8 | 138 | 2/8 | 629 | 4 |
| 106171–106178 | 0 | 0 | 4 | 0 | 4/8 | 8/8 | 150.5 | 6/8 | 800 | 2 |
| 106181–106188 | 0 | 0 | 2 | 0 | 2/8 | 7/8 | 150 | 5/8 | 713 | 4 |
| 106191–106198 | 0 | 0 | 5 | 0 | 5/8 | 8/8 | 151 | 6/8 | 678 | 1 |
| **Total** | **0** | **0** | **14/32** | **0** | **14/32** | **31/32** | — | **19/32** | **2,820** | **11** |

No wins, no national standing, no table seats on any band — the endgame wall is untouched
by this survey, as expected; the survey measures the launch→fight pool, not the win chain.
Deaths are overwhelmingly combat: villager combat + combat + expedition account for roughly
four-fifths of all deaths on every band; starvation is 11 of 2,820 (0.4%). The villages are
not starving — they are being killed, mostly by monsters, mostly on expeditions and in
village defense.

## Village assessment (plain words)

Thirty-two villages lived 150 days under the full landed substrate, and the picture is
consistent across all four bands. Every village reached wave 4 except one (106187, dead
on day 60 at wave 3). Fourteen of 32 reached wave 5. But almost none of them got anywhere
near the endgame: zero wins, zero national standing, zero seats at the table. The villages
survive or die at regional standing — and a remarkable number of them end parked at exactly
199 standing: 15 of 32 seeds finish at standing 199 (five of eight on band 1 alone), with
two more at 190 and 155. The 199 stall is still the place where villages go to wait: strong
enough to live, never quite strong enough to move up.

What the villages DO do is launch hunting parties — sometimes. Sixteen launches on the best
band, but they cluster: one or two villages per band do nearly all the launching, and
thirteen villages never launch once in 150 days. When a party does set out after a wave-4
monster, it usually does meet it — 25 first-fights from 40 launches — but the meeting
usually ends badly for the villagers: 17 of the 25 fights end with the villagers running
away, 5 end with a villager dead, and only 3 end with the monster killed. On the designated
band itself, not one launched first-fight ends in a kill: 6 fled, 3 died. That is exactly
the pool the damage question needs — launched parties reaching fights and then not dealing
enough damage to finish them — but the next run should go in knowing the pool is fled
fights, not kills.

The other thing that stands out is how often a launch goes nowhere: 15 of 40 launches
produce no fight inside the 21-day window. The worst case is seed 106188, which launches
seven times and meets its target twice — five launches chase 'audit', a wave-4/5 monster
type, over and over without ever fighting it. And the launches themselves are often
re-hunts: on seed 106182 the village kills The Eulogy on day 107, then launches a fresh
party after The Eulogy on day 114 anyway. The village does not seem to remember that it
already killed one.

## Sense-testing

The transcripts read like the game, not like a log file. The System's voice is intact and
the villages' days cohere — water runs, door defense, veteran-kill callouts on camera:

- Seed 106182, day 26: 📺 "Oh, you survived the AUDIENCE NOTES? Cute. We've stopped
  pretending these are animals now. That was the FINAL DRAFT, folks — what comes out of
  the treeline next was never alive the way you mean it."
- Seed 106182, day 26: 📺 SYSTEM: "Oh — OH. Everybody saw that, right? Milo just put down
  Spool... on CAMERA. That's a veteran kill, folks. REMEMBER the name."
- Seed 106184, day 1: A woman, maybe 30s, with a burn-scarred forearm heads out for water.
  "Thirst doesn't negotiate. Going." The pantry won't fill itself.
- Seed 106188, day 30: 📺 SYSTEM: "Oh — OH. Everybody saw that, right? Lena just put down
  The Callback... on CAMERA. That's a veteran kill, folks. REMEMBER the name."
- Seed 106182, day 107: 📺 SYSTEM: "Oh — OH. Everybody saw that, right? Nathan just put
  down The Eulogy... on CAMERA. That's a veteran kill, folks. REMEMBER the name." — and
  then, a week later, the village launches after The Eulogy again (see below).
- Seed 106182, day 110: 🛡️ "Frank, Nathan and Ana met them at the door — 1 put down,
  1 barely walked away. Ana didn't come back. Nathan is hurt."

### One launched first-fight end to end (seed 106182, The Eulogy, day 114)

Day 114, a trio launches from the brain: Frank (`app_mgpspjrm599`) leads Si-chan
(`gen_kla7sfr`) and Hassan Ali after The Eulogy (wave 4). The same day, Hassan walks
straight into it — the fight the launch was for:

- "Hassan walks straight into Ugly-Eyes. No avoiding it."
- "Hassan sees Ugly-Eyes coming and nocks an arrow — the fight opens at range (4 shots)."
  Three of four arrows land (22, 24, 25 damage); one buries itself in the dirt.
- "R1: Hassan strikes for 36 (x1.2) (916 left)" — Final Chapter hits Hassan for 21.
- "R2: Hassan strikes for 36 (x1.2) (880 left)" — Epitaph hits Hassan for 13.
  "Hassan is losing — shouts for help! Frank charges in!"
- "R3: Hassan strikes for 38 (x1.3) (842 left)" — "R3: Frank strikes for 11 (831 left)"
  — Epitaph hits Hassan for 15. "Hassan is still losing — shouts again! Si-chan charges in!"
- "R4: Hassan stops mid-fight and binds the wound — field medicine, +20 HP."

Five rounds, 329 damage dealt to a ~1,023-HP monster, 79 taken, and Hassan runs at 36% HP.
The launched party found its monster, fought it properly — bow opening, called help twice,
field medicine mid-fight — and still dealt about a third of its health before fleeing.
That is the damage gap, in one fight, on the designated band.

Two more fights on the designated band show the same gap from the other side:

- Seed 106188, day 130: Emma vs the wave-5 network_note, 10 rounds, **504 damage dealt**,
  still fled at 14% HP ("Emma leans to the memo: 'the wolf should be SMALLER.' It writes
  it down." / "NOTE: 'THE WOLF SHOULD HAVE LASERS NOW' — and then it does. (+25%.)").
  Ten rounds of real fighting and the monster still stands.
- Seed 106186, day 50: Thong vs The Eater, 2 rounds, **110 damage taken, 0 dealt** —
  "R1: Smack-Rush hits Thong for 55 (45 left)" / "R1: Thong's eyes go red. Next 3 strikes
  hit twice as hard. (Rage)" / "R2: Gorge hits Thong for 55 (0 left)". The Rage holder
  fires and the villager still dies before landing a blow.

Instrumentation note: the fight log text in the corpus truncates after R4 on the 106182
fight (rounds 5, mDealt 329, fled at 36% HP come from the encounter row, not the log text).
Counts in this file rest on the encounter rows, which is what the prereg's definition uses.

## Metric review

- **The floor was priced from the same substrate.** The GO floor (≥ 6 first-fights) comes
  from dmgshape-rerun-b's last leg on the designated band under the full substrate + current
  policy, which delivered 4 first-fights — 6 sits above that reference, not imported from
  another substrate. The designated band's 9 clears it with room; the runner-up's 8 clears
  it too. The floor was not lowered, moved, or re-scored after seeing the numbers.
- **Counted vs distinct.** The prereg's primary metric counts launches, and two launches may
  share one fight. On the designated band that inflates 9 → 6 distinct (106184's d102 and
  d106 launches share the d110 fight; 106188's d125 and d129 launches share the d130 fight;
  106186's d47 and d49 launches share the d50 fight). The distinct count (6) still meets
  the floor of 6 exactly. The next run should plan its pool on the distinct number.
- **Fled is the pool.** 17 of 25 first-fights across the survey end in flight, 3 in a kill,
  5 in a death. The designated band has zero killed first-fights. This is good news for
  the damage question (fled fights are the dmgshape pool — dmgshape-b and dmgshape-rerun-b
  each had only 3), but the re-run must not expect kills from this band.
- **No-fight launches are still common.** 15 of 40 launches (37.5%) produce no fight in
  the window, and the designated band is the worst offender (7 of 16). Five of those seven
  are seed 106188 re-launching 'audit' — the same target type, launched five times across
  days 132–143, never fought. The re-run's decomposition should treat repeat-target
  no-fight launches as their own class, not as noise.
- **The launch rate did not recover to launchfunnel levels.** 40 launches across 32 seeds
  (1.25/seed) vs 17 launches on 8 seeds (2.1/seed) in launchfunnel-b's designated band.
  The survey found bands worth measuring, but the launch engine is thinner than the
  launchfunnel survey suggested — the designation is a pool that exists, not a launch
  rate that recovered.
- **What this survey does NOT judge.** Survey corpora carry NO `roundsDetail`, so no
  damage decomposition is judged here — counts only. The re-run decomposes on its own
  corpora. Target matching is by TYPE, not instance (a launch can "meet" a different
  instance of the same type, including one already killed before — see 106182's Eulogy).
  Day granularity only; same-day fights are flagged, not resolved.

## Findings notes for the coordinator

- **Designation (finding #2605 prerequisite): band 106181–106188 is GO for the next dmgshape
  run.** 9 first-fights (6 distinct), 16 launches, 9 quad launches. Runner-up 106171–106178
  (8 first-fights, 12 launches, 6 quads) is the fallback. Per finding #2616, this designation
  is valid ON THE SURVEY SUBSTRATE — six flags live in code + ALLYSLOT3 env-only, policy
  `150229eda010`, base `c75503d6f` — not a property of the seeds.
- **The next dmgshape run must port ALLYSLOT3 first** (as dmgshape-rerun-b did) and re-verify
  its pool on arrival. The slot gates ally3's in-fight damage, so the damage numbers it
  measures will move with the port; the pool's existence (launches → fights) should not,
  but that is a claim to re-check, not assume. If the coordinator instead requires the
  designation itself to be measured with the slot live, this survey needs a re-run on a
  ported branch — say so before the dmgshape run starts, not after.
- **Expect a fled pool, not a kill pool.** Designated band: 6 fled, 3 died, 0 killed. Plan
  the decomposition around fled fights (per-round damage, rounds survived, flee HP
  fraction); there will be no killed first-fights to decompose on this band.
- **Plan on 6 distinct fights, not 9.** Three of the nine counted first-fights are
  second launches sharing an already-counted fight. The re-run's prereg should state
  whether it counts launches or distinct fights, before it runs.
- **The 'audit' churn on 106188 is a lever candidate, not survey noise.** Five launches
  against one target type in 11 days with no meeting, on a seed that otherwise launches
  well. If the next run wants more pool, the cheapest place to look is why a launched
  party never meets its target — not more seeds.
- **The 199 stall deserves its own line in the next executive update.** 15 of 32 villages
  end at exactly standing 199; band 1 is 5 of 8. Villages survive to regional and stop.
  This survey did not set out to measure it, but no band in this survey escapes it.
- **No band is launch-rich across all eight seeds.** Even the designated band has three
  seeds that launch nothing (106181, 106183, 106185) and one that never reaches wave 4
  (106187). The dmgshape run should not drop "dead" seeds mid-run to chase pool — the
  prereg's band is the band.

## Infrastructure notes

- **Write flap still active, then eased.** The prereg commit was delayed ~02:35–02:45 UTC
  by two safe-commit refusals (see prereg). During the legs (~03:00–03:30 UTC) the flap
  eased: all four legs ran back-to-back with no write failures, all 32 corpus files landed
  on first write (0 `@@FALLBACK` blocks in the legs log, 32/32 parse clean), and the
  analyzer wrote the survey JSON on first attempt. No corpus recovery from logs was needed.
- **Legs log quirk:** `evidence/2026-11-20/dmgsurvey-b-legs.log` holds the 32 driver JSON
  lines only — the `LEG1_EXIT:0` … `LEG4_EXIT:0` echoes went to the exec stdout, not the
  tee. All four legs exited 0 (confirmed in the run records); the log is missing the exit
  lines, not the results.
- **Survived off-by-one (wall definition):** the analyzer's wall `survived` counts
  `gameDays >= 150`, while the driver's `days` field can read one higher (seed 106163:
  `days` 150 / `gameDays` 149, endReason survived). Band 1's wall therefore says survived
  2/8 while 3/8 villages end with endReason `survived`. The judged wall number is the
  analyzer's; the discrepancy is definitional, not a miscount, and it does not touch the
  verdict (survival is not a GO bar).
- **Safe-commit index clobber:** struck after both earlier commits on this branch
  (b7046daa6, c5c135ec1) and repaired the same way each time
  (`git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, then verify
  status/diff/hash-object). Check `git status --short` after the final commit below and
  repair if it strikes a third time.
- **Flag-refusal check passed:** with `ALLYSLOT3` omitted from the environment the driver
  exits 2 with `DMGSURVEY STOP: ALLYSLOT3=1 required` before running any seed. The frozen
  substrate is enforced by the instrument, not by convention.
- **Leg runtimes:** band 1 ~5.4 min, band 2 ~5.0 min, band 3 ~2.8 min, band 4 ~4.5 min.
  Total judged sim time ~18 min for 32 villages. No leg needed a retry.

## Files

- `evidence/2026-11-20/sim-dmgsurvey-b-prereg.md` — frozen prereg (commit `b7046daa6`)
- `evidence/2026-11-20/sim-dmgsurvey-b.md` — this file
- `evidence/2026-11-20/dmgsurvey-b-survey.json` — analyzer output, verdict GO
- `evidence/2026-11-20/dmgsurvey-b-legs.log` — 32 driver JSON lines (one per seed; exit echoes in run records)
- `evidence/2026-11-20/perseed-dmgsurvey-b-106161-106168/` — 8 corpora
- `evidence/2026-11-20/perseed-dmgsurvey-b-106171-106178/` — 8 corpora
- `evidence/2026-11-20/perseed-dmgsurvey-b-106181-106188/` — 8 corpora (designated band)
- `evidence/2026-11-20/perseed-dmgsurvey-b-106191-106198/` — 8 corpora
- `scripts/dmgsurvey-driver-b.js` — survey driver (commit `c5c135ec1`)
- `scripts/analyze-dmgsurvey-b.js` — survey analyzer (commit `c5c135ec1`)
- `scripts/test-dmgsurvey-b.js` — proof test, 34/34 green (commit `c5c135ec1`)

## Proof recap

- Proof test `scripts/test-dmgsurvey-b.js`: **34/34 green** — frozen base resolves to
  `c75503d6f`, src diff 0, substrate env gates present, ALLYSLOT3 absent from src verified,
  analyzer selftest green, live 5d shape run on seed 106161 (0 errors), D1 repeatability +
  D2 wrap neutrality at 30d on 106161, policy sha `150229eda010`.
- Analyzer selftest: **17/17 green**.
- Instrument bars: 32/32 files parse, 0 instrument errors across all four bands, taxonomy
  0 `unknown` on all four bands.
- Observable effect (not just green assertions): the designated band's corpora contain
  16 real launches and 9 counted launched first-fights — e.g. seed 106182 day 114, Hassan
  vs The Eulogy, 5 rounds, 329 damage dealt, fled at 36% HP — counted from the corpora
  by the frozen definition, with the survey JSON as the record.
