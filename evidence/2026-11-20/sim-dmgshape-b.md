# sim-dmgshape-b — the damage-per-launch re-measurement on the designated band (finding #2605; tracker blank #1)

**Verdict: NO-GO, kind METRIC-BROKEN** — the pool floor PASSES on
both legs (9 launches with a first fight vs floor 6; 6 fled
first-fights vs floor 4), the instrument is green (reconciliation
0.0%, 0 errors, 8/8 files), and the decomposition bars
"pass" — but the classification bar FAILS hard: **3/9 first-fights
classify (0.333 vs the 0.90 bar)**. Four of the six DISTINCT
first-fights dealt ZERO damage — three Eulogy fights where the
fighter spent every round on the "contradict" counter-trick instead
of striking, and one Eater fight where the Rage holder died before
landing a blow. A fight with no landed strike has no P_mean to
price from, so the decomposition cannot score it — by the frozen
design, not by accident. The judged decomposition therefore rests
on TWO distinct strike-fights (Hassan's Eulogy, Emma's network_note),
and its "passing" numbers are degenerate (accounted 1.236, top
179% of gap, base-rate ceiling NEGATIVE). The pool the survey
designated reproduced EXACTLY under the ported slot (16 launches,
9 counted / 6 distinct first-fights — the same counts as the
survey), so the designation transferred; what the pool contains
is mostly fights the decomposition was never built to price.

- **Branch:** `sim-dmgshape-b`, tip `96728fb9f` (instrument) at leg
  time; base master `0d925556a` + ported ALLYSLOT3 slot `a1cd6cdc0`
  (cherry-pick of `f4d1100ee`) + prereg `8be39e1c3` + instrument
  `96728fb9f`
- **Prereg:** `evidence/2026-11-20/sim-dmgshape-b-prereg.md`
  (frozen 2026-11-20 ~06:40 UTC, before any judged sim; commit
  `8be39e1c3`)
- **Analysis:** `evidence/2026-11-20/dmgshape-b-analysis.json`
  (analyzer exit 0; log `dmgshape-b-analysis.log`)
- **Panel:** `evidence/2026-11-20/dmgshape-b-panel.json` +
  `dmgshape-b-panel.md` — compare RAN, decision
  `review_required`, no material signal on any observed metric
  (see §4)
- **Corpus:** `evidence/2026-11-20/perseed-dmgshape-b/`
  (8 seeds, 150 days, 0 instrument errors)
- **Seeds:** 106181–106188 (the FULL designated band, never a
  subset)
- **Leg:** single diagnostic leg, substrate SENSEEXPED=1,
  PARTYSIZE4=1, VETREENGAGE=1, FLEEREPAIR2=1, FIGHTALLY2=1,
  ALLYSLOT3=1 (slot PORTED — coordinator's call), LAUNCHSURVIVE=1.
  Competent verbatim (policy sha256 first-12 `150229eda010`),
  150-day death-aware. Leg log `dmgshape-b-legs.log` (exit 0,
  ~9.3 min for 8 seeds, 06:52–07:01 UTC).

## EVIDENCE-ONLY — the ported lever never merges

The ALLYSLOT3 slot on this branch is a port of held commit
`f4d1100ee` (partysurvive's own port of sim-allyslot3-b
`7efbf26a8` via sim-fightcap-b `5a5343363`), cherry-picked clean
as `a1cd6cdc0` (auto-merged `src/js/game.js`, no conflicts).
Verification: `ALLYSLOT3` 12× in `fieldFights.js`, 3× in
`game.js`, 3× in `party-wiring.js`; `ally3Vid` 31× in
`fieldFights.js` — identical counts to the 1230Z and 2130Z
ports. Proof test `scripts/test-allyslot3-b.js`: **18/18**. It
exists ONLY so this diagnostic could run on the fightcap arm
substrate. It must NEVER be merged to master as a game change:
the coordinator lands evidence-only or releases the branch
done-abandoned.

**Worktree note (recorded in the prereg):** the
coordinator-registered worktree arrived holding the 1230Z run's
branch tip (`35ff44e43`, base `e1f00206`, NOT the brief's base
master `0d925556a`). The branch was reset to master `0d925556a`
(worktree clean, nothing uncommitted lost); the 1230Z tip is
preserved as branch `sim-dmgshape-b-1230Z` at `35ff44e43`, and
the 1230Z evidence is already on master.

## 1. Judged numbers (frozen bars, §14 of the prereg)

| Bar | Measured | Bar | Result |
| --- | --- | ---: | --- |
| Pool: launches with a first fight | **9** (16 launches, 6 distinct) | ≥ 6 | **PASS** |
| Pool: fled first-fights | **6** (4 distinct) | ≥ 4 | **PASS** |
| Instrument errors / files | 0 / 8 | 0 / 8 | PASS |
| Classification (gloss reading) | **3/9 = 0.333** | ≥ 0.90 | **FAIL** |
| Classification (strict reading, beside) | 3/9 = 0.333 | — | reported (same — see §2) |
| Reconciliation (exact identity) | **0.0%** | ≤ 15% | PASS |
| Accounted share | **1.236** | ≥ 0.70 | PASS (degenerate — see §2) |
| Top contributor | **allyDelayLoss 149.2/round = 179.3% of gap** | ≥ 25% | PASS (degenerate — see §2) |

GO required the pool floor + classification + accounted + top +
reconciliation + instrument. The classification bar fails, so the
verdict is NO-GO, kind METRIC-BROKEN. The accounted/top passes
are reported, not banked: they rest on two distinct strike-fights
and the decomposition inverts on this population (base-rate
ceiling negative, §2).

### The judged decomposition (n=6 counted fled first-fights, 29 rounds, 1337 damage; 4 distinct)

| Component | /round | Share of gap (83.2) |
| --- | ---: | ---: |
| (a) Verb loss — fighter rounds spent on verbs, not strikes | 6.02 | 7.2% |
| (b) Miss loss — zero-damage strikes | 0.00 | 0.0% |
| (c) Ally-delay loss — empty striker slots | 149.24 | 179.3% |
| (d) Base-rate ceiling — 111 − P_mean × 4 | −52.35 | −62.9% |
| **Accounted** | **102.91** | **123.6%** |
| D_meas (mean of per-fight rates) | 27.77 | — |
| Gap G = 111 − D_meas | 83.23 | — |

Reconciliation (exact identity): (a′)+(b′)+(c′)−echo = 119.70 vs
`P_mean × 4 − D_strike` = 119.70 → error **0.0%**. The identity
holds because it is an identity — it does not bless the
components' meaning. P_mean is 40.84/landed strike, so four
strikes a round at this quality would deal 163.4/round — ABOVE
the 111 winning shape — and the base-rate ceiling goes negative.
The party lands 1.07 strikes a round out of 4 possible (31
attempted, 31 landed, hit rate 1.000). The gap is a strike-QUANTITY
problem (too few strikes), and none of (a)–(d) prices strike
quantity: (c) tries, but it prices 76 empty slot-rounds at the
late allies' mean (see §2), which is how it reaches 179% of the
gap.

### The nine first-fights (the whole judged population)

| Launch | First fight | Rounds | Dealt / HP | /round | Outcome | Classified |
| --- | ---: | ---: | ---: | ---: | --- | --- |
| 106182 d114 Frank (trio) → eulogy | d114 eulogy vs Hassan, expedition | 5 | 329 / 1023 | 65.8 | **vFlee** | yes |
| 106184 d102 Tashi (quad) → eulogy | d110 eulogy vs Tashi, world-tick | 3 | 0 / 675 | 0.0 | mFlee | no (0 strikes) |
| 106184 d112 Tashi (trio) → eulogy | d127 eulogy vs Daniyar, aid | 1 | 0 / 675 | 0.0 | vFlee | no (0 strikes) |
| 106184 d127 Tashi (quad) → eulogy | d127 eulogy vs Daniyar, aid | 1 | 0 / 675 | 0.0 | vFlee | no (same fight as above) |
| 106184 d131 Tashi (quad) → eulogy | d133 eulogy vs Tashi, aid | 2 | 0 / 225 | 0.0 | vFlee | no (0 strikes) |
| 106186 d47 (quad) → eater | d50 eater vs Thong, expedition | 2 | 0 / 952 | 0.0 | vDie | no (0 strikes) |
| 106186 d49 (pair) → eater | d50 eater vs Thong, expedition | 2 | 0 / 952 | 0.0 | vDie | no (same fight as above) |
| 106188 d125 Sari (pair) → network_note | d130 network_note vs Emma, world-tick | 10 | 504 / 750 | 50.4 | **vFlee** | yes |
| 106188 d129 Sari (pair) → network_note | d130 network_note vs Emma, world-tick | 10 | 504 / 750 | 50.4 | **vFlee** | yes (same fight as above) |

Per-fight components (classified fights only): d114 eulogy —
verb 7.30, ally-delay 44.8, baseCeiling −3.67, kill-gap 694 HP
(6.3 rounds at 111); d130 network_note — verb 6.9, ally-delay
205.2, baseCeiling −72.27, kill-gap 246 HP (2.2 rounds). The
three 0-damage fled fights and the 0-damage death have all four
components null (unclassified). Per-member (fled set, counted):
fighter 698 (55.1%), ally1 398 (31.4%), ally2 170 (13.4%),
**ally3 0 (0.0%)** — of 1266 roundsDetail damage. Strikes: 31
attempted, 31 landed, 0 zero — hit rate 1.000, 1.07 attempts a
round. Ability-touch damage 146 (10.9%), excess 26.8 (2.0%).
Volley/pre-round 71 (5.3%). Tricks 6 in 6 rounds (all
"contradict", §5). Median fled fight: 3.5 rounds. Mean kill-gap
460.2 HP — 4.1 more rounds at 111/round. Rage: 0 fights in the
fled set (the one Rage fight is the d50 death — fire round 1,
not late; see secondary below).

**The two classified fights are also the only expedition first-fights
that strike** (origins: expedition 3, world-tick 3, aid 3). The
any-origin definition is still what finds anything at all on
106184/106188 — but note the origin mix shifted from the survey
(expedition 3, world-tick 5, aid 1) because the fights themselves
are different events (§2), not the same fights re-routed. The
d112/d127 launches' first fight is Daniyar's 1-round fight, not
the launcher Tashi's own 3-round fight the same day: Daniyar's
row precedes Tashi's in file order, so the tiebreak picks
Daniyar's. The launch's target is fought by someone else — the
any-origin definition working as designed, and the reason the
"first fight" is not always the launched party's fight.

## 2. Why classification fails — and why the "passing" bars are degenerate

**The 0-damage fights are counterplay, not missing data.** Four
of the six distinct first-fights dealt no damage at all:

- **d110 Eulogy, Tashi, 3 rounds, mFlee.** Tashi spends all
  three rounds on "contradicts the narration" — the Eulogy's
  signature counter (MONSTER-WAVES.md: interrupt the story) —
  and the MONSTER flees. The fight dealt 0 damage because the
  correct play deals no damage, and it worked: the Eulogy left.
  The engine narrates it as such: "Tashi holds the line —
  working the trick, not the damage race."
- **d127 Eulogy, Daniyar, 1 round, vFlee.** Daniyar contradicts
  once, takes 20 damage (21 → 1 HP — he entered the fight
  nearly dead), and runs. One round, one contradict, no strike.
- **d133 Eulogy, Tashi, 2 rounds, vFlee.** Two contradicts,
  15 + 18 taken (46 → 13 HP), shouts; Daniyar arrives into the
  flee.
- **d50 Eater, Thong, 2 rounds, vDie.** Rage fires round 1
  ("Thong's eyes go red. Next 3 strikes hit twice as hard"),
  but the Eater hits 55/round and Thong dies in two rounds
  having never struck. The Rage holder fired and died before
  landing a blow — the same beat the survey caught.

The prereg anticipated a 0-damage fight as a failure mode ("a
0-damage first fight like nina's survey meetings") and designed
the classification bar to price it. What it did not anticipate
is that the 0-damage fights would be the MAJORITY of the pool
and would be the Eulogy's authored counterplay succeeding. The
decomposition's premise — "fights that had damage but no kill"
— does not hold for them. They are not unclassifiable for lack
of data; they are a different KIND of fight, and the bar as
frozen honestly refuses them. A future prereg needs a separate
class for counterplay fights (see §7.1).

**The strict reading equals the gloss here (3/9 both).** The
three classified fights each have all four components non-null
(their allies all landed at least one strike), so the
rerun's gloss-vs-strict split does not recur. The failure is
not a borderline pricing rule — it is six fights with no landed
strike to price from.

**The "passing" decomposition inverts.** On the three counted
classified fights, P_mean is 40.84 — high because the only
strikes in the set are good ones (Hassan 36–38s, Emma 32–38s,
Aki 90/93s). Four strikes a round at that quality is 163/round,
so the base-rate ceiling is −52.35: the model says strike
quality is already MORE than enough, and the gap is entirely
that the party only lands ~1 strike a round. But ally-delay —
the term meant to capture that — prices 76 empty slot-rounds at
the allies' mean, and the allies' mean is itself inflated by
late arrival: Aki's 90- and 93-damage strikes (BLOODED 1.5×,
§5) arrive in rounds 9–10, and the term prices rounds 1–8 as
if Aki had been dealing 90 a round since the opening. The
result (149.2/round, 179% of gap) is arithmetic, not a loss.
The rerun's metric review (§7.3) already warned that (c)
understates when allies never strike; here it OVERSTATES when
they strike late and hard. Neither pricing is the phenomenon:
the phenomenon is 1.07 strikes a round.

**The third ally never shows up.** Six of the 16 launches are
quads (partySize ≥ 4), and the slot is live in code (proof test
18/18 proves a launched quad CAN return a third companion in a
staged fight) — but across all 156 recorded wave-4+ encounters
in this corpus, **zero rows carry ally3Vid and ally3Dealt is 0**.
No first-fight row has a third ally; the d130 fight's ally3 slot
is empty (Aki is ally1, Aroha ally2). The "4th member's damage"
question — the reason this diagnostic ports the slot — is
unmeasurable from live first-fights, not because the pool is
thin but because the fourth member never reaches a wave-4+
fight in live play. The staged test proves the slot; live play
never invokes it. That is a finding about the SENSE (whether a
launched quad's sense ever returns a third companion), not
about the slot (see §8).

**The pool reproduced EXACTLY — in counts, not in identity.** 16
launches, 9 counted / 6 distinct first-fights, 6 fled, 0 killed,
2 died + 1 mFlee (the survey: 3 died, 0 other) — the same counts
the survey measured on the slot-env-only substrate. But the
events underneath are different: on 106184 the survey's launches
fell on d102/d106/d106/d116/d144/d147 and this leg's on
d102/d112/d127/d131/d136/d140, and the fights differ with them
(survey: Jorge's d102 strike-fight, 16 dealt; Daniyar's d120
death, 20 dealt; this leg: Tashi's d110 monster-flee, Daniyar's
d127 1-round flee). The designation transferred across the port
step in the only sense a designation can promise — the pool's
SIZE — while every constituent event re-rolled. Finding #2616
(a designation is a property of a (substrate, policy) pair) does
NOT bite here, because the substrate step that changed (the slot
going live in code) did not move the pool's size. The one outcome
class that moved is died → mFlee on 106184: the survey's died
first-fight is Daniyar's d120 death (3 rounds, 20 dealt); this
leg's other is Tashi's d110 monster-flee (3 contradicts, 0
dealt), with Nikos's 2-round death the same day, second in file
order. Same-day first-fights: 2 (d114, d127), as in the survey.

## 3. Exploratory: the all-first-fights decomposition (NOT the verdict)

The frozen verdict stands on the n=6 counted fled set. The same
decomposition over ALL first-fights regardless of outcome
(n=9, fled + died + mFlee), labeled exploratory, never a
re-score:

| | All 9 first-fights |
| --- | --- |
| D_meas (mean of per-fight rates) | 18.51/round |
| Gap vs 111 | 92.49/round |
| (a) Verb loss | 4.85/round (5.2%) |
| (b) Miss loss | 0.00/round (0.0%) |
| (c) Ally-delay loss | 120.22/round (130.0%) |
| (d) Base-rate ceiling | −52.35/round (−56.6%) |
| Accounted | 0.786 |
| Reconciliation error | 1.8% |

Adding the three 0-damage fights (d110 mFlee, d50 death ×2)
drags D_meas from 27.8 to 18.5 and pulls the accounted share
below 1 — but the shape is the same: verb ~5%, miss 0%,
ally-delay over 100% of gap, base-rate ceiling negative. Read
both tables together: the miss term contributes nothing in
either (hit rate 1.000 — zero 0-damage strikes in 31 attempts
across the whole population), and the verb term is small
(5–7%). Whatever lifts a launched party toward 111/round, it
is not hitting more often or spending fewer rounds on verbs —
it is landing more strikes per round, which is the term the
decomposition does not have. Rage (exploratory set): 1 distinct
fight (d50 Eater, counted twice), fire round 1, late 0 — the
late-Rage pin is observed-absent: the only Rage fight fires in
round 1 and the holder dies in round 2.

## 4. Reachability (waves 1–5, national/table/wins, median survival)

| | This leg | Dmgsurvey (same band) |
| --- | ---: | ---: |
| Full wins | 0/8 | 0/8 |
| National scale | 0/8 | 0/8 |
| Table | 0/8 | 0/8 |
| Wave 5 reached | 3/8 | 2/8 |
| Wave 4 reached | 7/8 | 7/8 |
| Standing ≥ 200 | 3/8 | 2/8 |
| Survived 150d (gameDays) | 5/8 | 5/8 |
| Median survival (gameDays) | 150.5d | 150d |
| Community loss | 3/8 | 3/8 |
| Starvation (villager deaths) | 4 | 4 |
| Total deaths | 711 | 713 |

Per-seed (days / gameDays / end / maxWave / standing / rank /
deaths): 106181 150/151 survived / 4 / 199 / regional / 81;
106182 150/150 survived / 5 / 425 / regional / 115; 106183
150/151 survived / 4 / 199 / regional / 92; 106184 150/151
survived / 5 / 530 / regional / 119; 106185 117/116
village-lost / 4 / 155 / regional / 56; 106186 145/144
village-lost / 4 / 199 / regional / 81; 106187 60/61
village-lost / 3 / 99 / village / 49; 106188 150/151 survived /
5 / 515 / regional / 118.

The wall moved on exactly one seed: **106184 went from
standing 199 / wave 4 (survey) to standing 530 / wave 5 (this
leg)** — the only trajectory divergence on the band. What drove
it: 106184 killed twice this leg where the survey had zero
kills — a d135 Eulogy contact finish (Tashi, 12 damage with a
kitchen knife on a monster ground down to ~12 HP across the
d110–d133 grind, §5) and a d145 Influencer kill (Jorge Silva,
10 rounds, 202 dealt). Two wave-4+ kills are worth far more
than the 199 stall: the village crossed the 200 release bar and
unlocked wave 5. Every other seed is unchanged from the survey
to the point (same end day, same standing, same wave). The
199 stall is still the visible ceiling: 106181, 106183, 106186
sit at exactly 199, one point short of release.

Band-wide villager death causes (711 death rows): `villager
combat` 289 (41%), `expedition` 197 (28%), `combat` 106 (15%),
`the wild` 32, `monster` 25, `a wound that wouldn't close` 8,
`sickness` 7, `thirst` 6, `a stranger` 6, `contest` 5,
starvation 4, `the arena` 4, `ambush` 3, dehydration 2, disease
2, `alien` 2, Gavel 2, The Eater 2, `the night` 2, and 1 each
(`the expedition`, Big-Eyes, The Ugly Beast, wound_fever,
experiment, The Eulogy, The Spoiler). Combat in its three named
forms is 83% of deaths; starvation is 4 of 711 (0.6%). The
villages are not starving — they are being killed, mostly in
fights and on expeditions, as in every prior leg.

### Balanced panel (instrument, not judge) — RAN

The builder (`scripts/build-dmgshape-b-panels.js`, adapted from
the rerun builder: before = dmgsurvey designated-band corpus,
after = this corpus) wrote both panels cleanly, and the compare
ran: `node scripts/balance-panel.js compare --before
evidence/2026-11-20/dmgshape-b-panel-before.json.gz --after
evidence/2026-11-20/dmgshape-b-panel-after.json.gz --out
evidence/2026-11-20/dmgshape-b-panel` → decision
**review_required**, 8 paired cases (exit 2 is the panel's
`review_required` status code, not a failure). No material
signal on any observed metric: wins 0 → 0, national 0 → 0,
village deaths 89.125 → 88.875 (−0.25, interval −0.75 to 0),
community loss 0.375 → 0.375. Full table in
`evidence/2026-11-20/dmgshape-b-panel.md`. Caveat: the panel
contract carries no wave-5 or standing metric, so the 106184
movement (standing 199 → 530, wave 5 unlocked) is invisible
to it — the compare sees two identical walls and calls no
signal. The reproducibility reference is therefore the direct
wall-number comparison in the table above, not a panel delta.

### Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-20/perseed-dmgshape-b/*.json' --metrics
national,table,wins,exiled` — refused, verbatim:
"telemetry-check: refusing recorder-corpus input: all 8
--current rows carry top-level anchorCommit, so they are sweep
recorder rows, not runs. Recorder corpora are compared with
sweep-compare tables, never against a run baseline here." (Same
refusal as the rerun, §4 there.) No deviation recorded; wall
numbers above are reported directly.

## 5. Sense-test: reading the fights

All six distinct first-fights read in full (uncapped logs).

- **d114 Eulogy, Hassan (106182, expedition, vFlee, 5 rounds,
  329 dealt) — the one fled first-fight end to end.** Day 114,
  a trio launches from the brain: Frank leads Si-chan and
  Hassan Ali after The Eulogy (wave 4). The same day, Hassan
  walks straight into it: "Hassan walks straight into
  Ugly-Eyes. No avoiding it." (The log calls the Eulogy
  "Ugly-Eyes" — a nickname the row's `mid` does not carry; the
  same double-naming family as "Big Big", below.) Bow opening:
  4 shots, 3 land (22, 24, 25). "R1: Hassan strikes for 36
  (x1.2) (916 left)" — Final Chapter hits Hassan for 21. "R2:
  Hassan strikes for 36 (x1.2) (880 left)" — Epitaph hits
  Hassan for 13. "Hassan is losing — shouts for help! Frank
  charges in!" "R3: Hassan strikes for 38 (x1.3) (842 left)"
  — "R3: Frank strikes for 11 (831 left)" — Epitaph hits
  Hassan for 15. "Hassan is still losing — shouts again!
  Si-chan charges in!" "R4: Hassan stops mid-fight and binds
  the wound — field medicine, +20 HP." — "R4: Frank strikes
  for 10 (821 left)" — "R4: Si-chan strikes for 40 (781
  left)". "R5: Hassan strikes for 36 (x1.2) (745 left)" —
  "R5: Frank strikes for 11 (734 left)" — "R5: Si-chan
  strikes for 40 (694 left)" — Final Chapter hits Hassan for
  16 (36 left). "Hassan sees how this ends — and runs while
  running still works." Five rounds, 329 damage dealt to a
  ~1,023-HP monster, 79 taken, and Hassan runs at 36% HP. The
  launched party found its monster, fought it properly — bow
  opening, called help twice, field medicine mid-fight — and
  still dealt about a third of its health before fleeing. That
  is the damage gap, in one fight, on the designated band. The
  same fight, same numbers, as the survey's sense-test — the
  port did not touch it.
- **d110 Eulogy, Tashi (106184, world-tick, mFlee, 3 rounds, 0
  dealt).** Three rounds of contradicting the narration — "it
  says Tashi runs — Tashi advances", "it says Tashi falters —
  Tashi stands straighter", "it says Tashi begs — Tashi
  laughs" — taking 15/15/13, and the MONSTER leaves. "Tashi
  holds the line — working the trick, not the damage race."
  repeats twice. The counterplay is the fight: no strikes were
  ever the plan, and the plan worked. The same day, Nikos
  fights the same Eulogy and dies in 2 rounds doing the same
  thing (contradict, contradict, 18 + 25 taken from 43 HP) —
  the trick is not safe, it is just the only move that ever
  wins this fight without damage.
- **d127 Eulogy, Daniyar (106184, aid, vFlee, 1 round, 0
  dealt).** One contradict, 20 taken (21 → 1 HP), flee. Daniyar
  entered the fight at 21 HP — nearly dead already — and the
  single round he had went to the trick, not a strike. Tashi's
  own 3-round fight the same day (contradict ×3, 10/15/11
  taken, Malik arriving into the flee) is the same shape with
  more HP to spend.
- **d133 Eulogy, Tashi (106184, aid, vFlee, 2 rounds, 0
  dealt).** Two contradicts, 15 + 18 taken (46 → 13 HP),
  shouts; Daniyar arrives into the flee. The Eulogy's HP across
  these meetings tells the grind story the first-fights do not:
  mHpStart 675 (d110) → 450 (d127 Tashi) → 225 (d133) → ~12
  (d135 contact finish). The village ground this Eulogy down
  across meetings through fights outside the first-fight set —
  the first-fights are the 0-damage contradict meetings, and
  the kill (d135, "Tashi does not let it slip away — they close
  in and strike with the kitchen knife for 12 — Big Big falls.
  (Contact finish)") is the cleanup. The contact-finish line
  calls the Eulogy "Big Big" — the monster's log name and its
  type id disagree, the same double-naming wrinkle the rerun
  caught on the herald ("Big Beast").
- **d50 Eater, Thong (106186, expedition, vDie, 2 rounds, 0
  dealt).** Identical to the survey's read: "Thong walks
  straight into The Eater. No avoiding it." / "R1: Smack-Rush
  hits Thong for 55 (45 left)" / "R1: Thong's eyes go red. Next
  3 strikes hit twice as hard. (Rage)" / "R2: Gorge hits Thong
  for 55 (0 left)". The Rage holder fires and the villager
  still dies before landing a blow. Rage is an ability that
  fires; it is not a strike.
- **d130 network_note, Emma (106188, world-tick, vFlee, 10
  rounds, 504 dealt).** The longest fled first-fight, and the
  richest log: "Emma has Crude bow but no arrows — the string
  stays drawn, useless." R1: "Emma leans to the memo: 'the wolf
  should be SMALLER.' It writes it down." (the bad_note trick).
  Then eight solo rounds, 32–38 a strike, field medicine in R4
  ("NOTE: 'THE WOLF SHOULD HAVE LASERS NOW' — and then it
  does. (+25%.)" — the memo buffs itself three times), "Emma
  holds the line — working the trick, not the damage race."
  repeating five times (R2–R8) — the same flat repetition the
  rerun caught ("holds the line" ×5). Aki charges in on R9 and
  strikes for 90, then 93 (BLOODED 1.5× is live: "Blooded —
  the village knows where the Producers bleed"); Aroha charges
  in on R10 for 45. Emma flees at 14 HP having dealt 504 of
  750. Ten rounds of real fighting and the monster still stands
  with 246 HP — the kill-gap is 2.2 rounds at 111, the closest
  any fled first-fight comes, and it still fled. The allies'
  late arrival is the whole story of this fight: 8 solo rounds,
  then 2 rounds with help.

**Double-naming:** two instances in six fights — the Eulogy is
"Ugly-Eyes" in Hassan's fight and "Big Big" in the d135 contact
finish, while the rows carry `mid` eulogy. The fiction wrinkle
that DOES recur is the repeated "holds the line — working the
trick, not the damage race" sentence (×2 on d110, ×5 on d130)
and the "answered the shout, but past holding" beat (d127
Tashi, d133 Tashi): both are content-depth notes, not
diagnostic failures. Nothing reads robotic; the Eulogy fights
read as villagers playing the trick the monster was built for.

## 6. Village assessment, in plain words

Eight villages, same seeds the survey watched launch sixteen
times — and under the ported slot they launch sixteen again,
meet their targets nine times, and kill nothing. The villages
that do launch fight for real — ten rounds, five hundred
damage, a companion stepping in to land a ninety-damage blow —
but the damage is small because the strikes are few (about one
a round out of four possible) and the companions arrive after
the fight is decided or into the flee. And half the distinct
fights never deal damage at all, because the village keeps
launching Tashi after the Eulogy — and Tashi keeps answering
it the only way the Eulogy can be answered, by contradicting
its story instead of hitting it. Three times he contradicts it
into leaving; once he finishes it with a kitchen knife. That
is not a failed fight. It is the monster working as designed,
and the damage question has no grip on it: you cannot decompose
a fight whose correct play deals no damage.

The binding picture is one level up from the rerun's: the pool
is no longer thin — nine first-fights clear the floor — but the
pool is the wrong SHAPE for the instrument. The decomposition
was built for strike-fights, and this band's launched fights
are mostly trick-fights and one death. The two fights that DO
strike say the same thing from the other side: the strikes are
good (28–46 a hit, allies hitting 90s), the gap is that there
are too few of them, and the instrument has no term for "too
few strikes". The wall numbers moved the other way: one village
(106184) crossed from 199 to 530 and unlocked wave 5 on the
back of two kills, but none of the eight wins, reaches national,
or takes a seat, and three of them sit one standing point short
of release.

## 7. Metric review (for the NEXT run — this run is judged as frozen)

1. **The classification bar did what it was designed to do —
   but the failure mode is not the anticipated one.** The prereg
   priced the bar for "a 0-damage first fight like nina's survey
   meetings" — a no-contact evade. The actual 0-damage fights
   are the Eulogy's authored counterplay succeeding (three
   contradicts, monster flees) and a Rage holder dying before
   striking. The bar treats them as pool poison, which is honest
   for THIS verdict, but the wrong taxonomy going forward: a
   counterplay fight is not missing data, it is a different
   KIND of fight. A future prereg should classify first-fights
   into strike-fights (decomposable) and counterplay-fights
   (judged on the trick, not the damage) BEFORE the pool floor
   is applied — or the floor should be priced on distinct
   CLASSIFIED fights, not on launches with a first fight.
2. **The decomposition inverts when P_mean × 4 > W.** The
   base-rate ceiling goes negative (−52.35) and the ally-delay
   term, priced at the late allies' mean, exceeds the gap
   (179%). The rerun's §7.3 note (price (c) at the pooled mean)
   does not fix this: the problem is the ceiling itself. When
   strike quality is high but strike QUANTITY is ~1/round, the
   binding term is attempts/round, and the decomposition has no
   such component. A future decomposition needs a fifth
   component (strike-rate loss: 4 − attempts/round, priced at
   P_mean) or a different W. Not re-scored here (metric
   binding): the accounted/top "passes" are reported, not
   banked.
3. **Counted vs distinct, again — and now it bites twice.**
   9 counted / 6 distinct first-fights; the classified counted
   (3) rest on 2 distinct fights. Any future floor should be
   priced on DISTINCT classified fights. The survey's
   designation ("9 first-fights") reads as a pool of nine; the
   decomposition stands on two.
4. **The designation transferred in counts, not in identity
   (§2).** Same counts (16/9/6), different launches, different
   fights, different fighters. A designation promises a pool
   SIZE under a (substrate, policy) pair — it cannot promise
   the same fights. The 106184 trajectory divergence (2 kills,
   standing 199 → 530) is the same lesson from the other side:
   identical counts, one village across the wave-5 line.
5. **Target matching is by TYPE, not instance — and the
   Eulogy grind shows the cost.** mHpStart 675 → 450 → 225 →
   ~12 across d110–d135 fits one Eulogy ground down across
   meetings, but the instrument cannot prove it (no instance
   id), and the first-fights in the set dealt 0 of that damage
   — the grinding happened in fights outside the set. The
   "first fight against the target" is the first fight against
   the target TYPE; whether it is the individual the village
   has been grinding is unknowable from the corpus. The
   evidence names the type beside every first fight so this
   stays auditable.
6. **Day granularity:** two first-fights are same-day (d114,
   d127). The family's convention (day ≥ launch.day) is kept;
   the same-day rows are flagged in the per-launch table (§1).
   Two of nine rows rest on it.
7. **Panel / telemetry:** panel RAN (review_required, no
   material signal, §4); telemetry refused recorder corpora
   (verbatim, §4). No LOUD lines from either.
8. **No `check.js` gate was run** — the port is evidence-only
   substrate, never to be merged; the proof tests
   (`test-dmgshape-b.js` 9/9, analyzer selftest 43/43,
   `test-allyslot3-b.js` 18/18) are the gate for this arm.

## 8. Blanks and findings notes for the coordinator

- **JUDGED VERDICT: NO-GO, kind METRIC-BROKEN** — classification
  3/9 = 0.333 (bar 0.90) on a pool that PASSES both floor legs
  (9 first-fights, 6 fled). The question "what lifts a launched
  party toward ~111 damage/round" has no judged answer on this
  band because the population is mostly fights the decomposition
  cannot price — the exploratory tables (§3) carry the shape
  instead: verb ~7%, miss 0%, ally-delay degenerate, base-rate
  ceiling negative, strike quantity ~1/round the missing term.
- **Finding #2605 — ANSWERED IN PART, pool-shape-blocked:** the
  re-measurement ran clean, the pool floor passed, and the
  designation transferred in counts — but the judged bars cannot
  be carried on this band under this policy because 4 of 6
  distinct first-fights are 0-damage counterplay/death fights.
  The next run on this question needs a band whose first-fights
  STRIKE, or a decomposition that prices counterplay (§7.1–7.2).
- **NEW — the third ally never reaches a live wave-4+ fight
  (coordinator to file):** 6 quad launches, 0/156 recorded
  wave-4+ encounters carry ally3Vid, ally3Dealt 0. The slot is
  live and staged-proven (18/18), but live play never invokes
  it. The "4th member's damage" question is unmeasurable from
  live first-fights until the SENSE returns a third companion
  for a launched quad. This is a sense-side investigation, not
  a slot fix — filed to `sim-findings.md` as well.
- **NEW — counterplay fights need their own class
  (coordinator to file):** the Eulogy's contradict counter
  wins fights with 0 damage dealt (d110 mFlee). The damage
  decomposition cannot price that, and the classification bar
  counts it as pool failure. A future dmgshape prereg should
  classify strike-fights vs counterplay-fights before the pool
  floor is applied. Filed to `sim-findings.md` as well.
- **Finding #2616 QUALIFIED — designation transferred in
  counts:** 16 launches / 9 first-fights / 6 distinct on both
  the survey substrate (slot env-only) and this leg (slot
  ported), same policy. The slot-port step did not move the
  pool's size — but the events underneath re-rolled entirely
  (different launch days, different fighters, different
  outcomes on 106184). A designation promises a pool size, not
  the same fights.
- **106184 crossed the wave-5 line on two kills:** standing
  199 → 530, wave 4 → 5 (d135 Eulogy contact finish, d145
  Influencer kill). The panel is blind to it (no standing/wave
  metric in the contract) — the wall comparison, not the panel,
  carries it.
- **Standing-199 stall, 3/8 seeds.** 106181, 106183, 106186 sit
  at exactly 199, one point short of the 200 release bar. Same
  stall the program has seen before; still the visible ceiling
  on this band.
- **Wave 5 opened on 3/8** (was 2/8 on the survey). Survival
  5/8, median 150.5d — the wall is otherwise unchanged.
- **Out-of-scope gap (note only):** `villager combat` (41%) +
  `expedition` (28%) + `combat` (15%) = 83% of villager deaths
  are combat classes; the unstoried `the wild` + `monster` are
  8%. Same note as finding #2607's family; no new mechanism
  claimed here.
- **Instrument note:** the analyzer merge (prereg, Design) is
  verified, not assumed: decomposition blocks are
  byte-identical to the 1230Z module, selection/judging blocks
  byte-identical to the rerun analyzer, selftest 43/43
  (rerun 28 + retained decomposition fixtures 15). The merged
  analyzer keeps exporting `decomposeEncounter`/`aggregate`/
  `WIN_SHAPE`, so the existing import chains keep working.
- **Write flap:** QUIET this run — the leg wrote all 8 corpora
  on first write (0 `@@FALLBACK` in the legs log), the analyzer
  output wrote first try, and the panel builder + compare wrote
  cleanly. The VM restart ~05:42Z preceded the run (brief
  note); the worktree reset ran slow (~60s for 889 files) but
  completed. No corpus recovery from logs was needed.
- **Safe-commit index clobber struck twice** on this branch
  (after the prereg commit `8be39e1c3` — committed file showed
  staged-deleted — and the instrument commit `96728fb9f` — all
  three files showed MM). Repaired both times with the
  documented `git ls-tree -r HEAD -- <paths> | git
  update-index --add --index-info` pipe; verified by `git
  status` empty + `git diff HEAD` empty + hash-object == HEAD
  blob per file.
- **Panel / telemetry:** panel RAN (review_required, no material
  signal, §4); telemetry refused recorder corpora (verbatim,
  §4). No LOUD lines.
- **No `check.js` gate was run** (see §7.8). The ported lever
  must NEVER be merged to master as a game change.
