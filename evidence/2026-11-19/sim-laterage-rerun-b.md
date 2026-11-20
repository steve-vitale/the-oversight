# sim-laterage-rerun-b — late Rage firing on the holder-rich band

**Verdict: DIAG-GO** — all frozen bars pass on the designated band.
**12 observable Rage fights** (floor 8), taxonomy complete (0
unclassified, 0 anomalies), dominant delay cause named with counts,
0 instrument errors. The answer to the question is stark: **Rage
never fires late here — 0 of 12 late (≥ R2), 0 of 12 at the
dmgshape cut (≥ R4).** Every Rage fight fires on round 1. The
post-fire delay is short — mean 1.5 rounds, median 1.5, never more
than 2 — and the whole delay is one cause: Brawler's Instinct,
a self-buff round, 6 of 6 delay rounds, all on one fighter (Luis,
seed 106158). The Fatima shape (Rage firing R4) does not reproduce
on this band. And a correction to the survey that designated this
band: Rage holders DO kill wave-4 monsters here — three times, all
on seed 106158, all Luis — but only one is a fought kill, against
the smallest monster in the pool (a 300-HP herald) with a full
party finishing it.

- **Branch:** `sim-laterage-rerun-b`, base master `1cb6ce2e1`
  (batch ship version bump on journey-establishment r244
  `8bd330f22`; the bump touches only index.html / build.js /
  sw.js / version.json — no game logic). Rebased onto local
  master at run start per the task (master moved from the
  registration base `8bd330f22` before the judged sims).
- **Prereg:** `evidence/2026-11-19/sim-laterage-rerun-b-prereg.md`
  (frozen 2026-11-20 01:09 UTC, BEFORE any judged sim; commit
  `8c63ce0d2`)
- **Analysis:** `evidence/2026-11-19/laterage-rerun-b-analysis.json`
  (analyzer exit 0 on the DIAG-GO verdict)
- **Corpus:** `evidence/2026-11-19/perseed-laterage-rerun-b/` (8
  seeds, 150 days, 0 instrument errors; judged leg log
  `laterage-rerun-b-judged.log`, survey log
  `laterage-rerun-b-survey.log`)
- **Seeds:** 106151–106158 (the designated band — deliberate
  re-use; see prereg for the freshness check + release)
- **Leg:** single diagnostic leg, substrate SENSEEXPED=1,
  PARTYSIZE4=1, VETREENGAGE=1, FLEEREPAIR2=1, FIGHTALLY2=1
  (all landed code on this master). Competent verbatim, 150-day
  death-aware. No RAGEFREE/FIELDCAPDMG carrier, no FREESTRIKE
  port, no ALLYSLOT3 port, no game-code change of any kind.
- **Proofs:** `test-laterage-b.js` 11/11 green on this tip after
  the rebase (analyzer selftest 16/16 inside it); driver exit 0
  on both legs; 0 instrument errors.

## EVIDENCE-ONLY — no game code, nothing to merge as a change

This arm adds instrument + evidence only (the instrument itself
is already on master from laterage-b; this branch adds the prereg,
the survey + judged corpora, the analysis, and this file). The
coordinator lands evidence-only (tooling/prereg/evidence
cherry-pick, as ragepreempt-b and dmgshape-b were handled) or
releases the branch done-abandoned. There is no lever here to land
or to hold.

## 0. Survey-first reproduction (before freezing)

The survey leg on this tip reproduced the designation survey
EXACTLY: **136 wave-4+ encounters, 33 holder-fights, 19 contact,
12 Rage fires, 0 errors** (designation survey, base `5e38f3f7b`,
policy sha `150229eda010`: 136 / 33 / 19 / 12). Per-seed
encounter counts identical on the two engine seeds (106151: 22,
106158: 33). The designation SURVIVES the base move (finding
#2616 EXTENDS, base form: NOT triggered here) — the holder rate
did not collapse. The judged leg then reproduced the survey
leg exactly again (136 / 33 / 19 / 12, 0 errors, per-seed counts
22/22/4/15/0/17/23/33) — determinism confirmed across three legs
on two bases. Per the prereg, the survey corpus is deleted now
that the judged leg reproduced its pool count; the judged corpus
is the record (survey log kept).

## 1. Judged numbers (frozen bars, §14 of the prereg)

| Bar | Measured | Bar | Result |
| --- | --- | --- | --- |
| Pool: observable Rage fights | **12** | ≥ 8 | **PASS** |
| Taxonomy complete | 0 unclassified, 0 anomalies | 0 / 0 | **PASS** |
| Dominant delay cause named | brawler_instinct (6 of 6 delay rounds) | named + counts | **PASS** |
| Instrument errors | 0 | 0 | **PASS** |

GO requires pool floor + taxonomy complete + dominant cause
named. All four bars pass, so the verdict is **DIAG-GO**.

### The primary metric, as measured (n=12)

| Quantity | Value |
| --- | --- |
| Rage fights in corpus | 12 of 136 wave-4+ encounters |
| Fire-round distribution | { R1: 12 } |
| Late-fire share (≥ 2) | 0/12 |
| Late-fire share, dmgshape cut (≥ 4) | 0/12 |
| Mean delay to first doubled strike | 1.5 rounds (median 1.5; dist {1: 6, 2: 6}) |
| Never-landed share | 0/12 |
| Doubled strikes landed | 3 in 11 fights, 2 in 1 fight |
| 0-damage Rage-fight share | 0/12 |
| Damage/round, late-fire vs R1-fire | null (no late fights) vs 61.4 |
| Foregone damage estimate | 48 (one fight — see §2) |
| Total damage, Rage fights | 4,210 (mean 350.8/fight) |
| Total damage, contact holder fights | 4,537 over 19 (mean 238.8/fight) |
| Total damage, all holder fights | 4,560 over 33 (mean 138.2/fight) |

Every Rage fight fires R1 — `preStrikeDmgs` is empty in all 12
rows: no holder ever strikes before firing. The delay floor of 1
is the mechanism itself (Rage consumes the fire round — the
fighter does not strike on R1); the only delay beyond that floor
is one Brawler's Instinct round in 6 of the 12 fights. No fight
waits 3+ rounds for its first doubled strike. Every doubled
strike that was available landed except one (Luis vs herald d86
vFlee, 2 of 3 — the fight ended after R4).

### The 12 Rage fights

| Seed | Day | Fighter | Monster | Rounds | Dealt | Fire | Delay | Doubled | Outcome |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 106151 | 92 | Luiz | Eulogy | 4 | 155 | R1 | 1 | 3/3 | vFlee |
| 106151 | 95 | Nina | Cancellation | 5 | 388 | R1 | 1 | 3/3 | vFlee |
| 106151 | 100 | Luiz | Suburb | 12 | 588 | R1 | 1 | 3/3 | vFlee |
| 106151 | 118 | Luiz | Network Note | 5 | 339 | R1 | 1 | 3/3 | vFlee |
| 106151 | 145 | Farid | Audit | 5 | 211 | R1 | 1 | 3/3 | vFlee |
| 106158 | 79 | Luis | Eulogy | 4 | 250 | R1 | 1 | 3/3 | vFlee |
| 106158 | 81 | Luis | Algorithm | 7 | 407 | R1 | 2 | 3/3 | vFlee |
| 106158 | 86 | Luis | Herald | 4 | 225 | R1 | 2 | 2/3 | vFlee |
| 106158 | 86 | Luis | Herald | 5 | 316 | R1 | 2 | 3/3 | **vKill** |
| 106158 | 106 | Luis | Reunion | 6 | 320 | R1 | 2 | 3/3 | vFlee |
| 106158 | 109 | Luis | Suburb | 6 | 597 | R1 | 2 | 3/3 | vFlee |
| 106158 | 114 | Luis | Reunion | 6 | 414 | R1 | 2 | 3/3 | vFlee |

Five fights on 106151 (Luiz ×3, Nina, Farid), seven on 106158
(all Luis). The other six seeds contribute zero Rage fights —
the lumpiness the survey warned about, reproduced exactly.

## 2. The dominant delay cause: Brawler's Instinct (6 of 6)

All six delay rounds are the same shape: Luis, seed 106158,
round 2, immediately after an R1 Rage fire — "Luis reads the
fight as it moves — the body tells them what the mouth won't.
Quicker from here. (Brawler's Instinct: +2 speed)". No trick
delay, no field-medicine delay, no godpath-verb delay, no silent
round appears anywhere in the corpus. Laterage-b's single delay
round was field_medicine; the taxonomy's first wild sighting of
brawler_instinct is this arm's.

What the cause IS matters for the reading: Brawler's Instinct is
a self-buff, not a wasted round. It consumes the round (no
strike on R2, so the first doubled strike lands R3), but it
buys +2 speed for the rest of the fight. The delay is real in
rounds — the doubled window opens one round later — but the
round is not lost the way a heal round is. Two caveats: (a) all
six instances are the SAME fighter on the SAME seed, so "the
dominant cause" is a description of Luis's kit, not a population
fact — 6 rounds from 1 fighter is a thin base for a cause call,
and the prereg's bar is met in letter (named + counts) while the
generality is weak; (b) the delay-1 fights (the other 6) have NO
delay round at all — the window opens on the first possible
round. The honest summary: on this band the post-fire wait is
either zero or one self-buff round, never more.

### Foregone damage (estimate, one fight)

Total 48, from a single row: Luis vs herald d86 (vFlee), 2 of 3
doubled landed, unit 48 (the fight's own doubled-strike damage),
basis "own doubled strike (48)". The corpus mean doubled strike
is 64.75. No fight falls to the 2× pre-fire-mean rung (no
pre-fire strikes exist anywhere in the corpus) and none falls to
no-basis — every fight landed at least 2 doubled strikes, so the
estimate is fully based. The foregone total is small because
almost nothing was foregone: 35 of 36 available doubled strikes
landed.

## 3. The fights, read in full (sense-testing)

**Luis vs the Herald, seed 106158, day 86 — the Rage kill
(5 rounds, 316 dealt, vKill).** The only fought kill with Rage
in the whole laterage line. Full log:

> R1: Luis's eyes go red. Next 3 strikes hit twice as hard. (Rage)
> R2: Luis reads the fight as it moves — the body tells them what
> the mouth won't. Quicker from here. (Brawler's Instinct: +2 speed)
> R3: Luis strikes for 54 (blood trail +2) (x2.0) (246 left)
> R3: Sam strikes for 39 (207 left)
> R4: Luis strikes for 56 (blood trail +2) (x2.0) (151 left)
> R4: Sam strikes for 39 (112 left) / Miguel strikes for 20 (92 left)
> The Herald is wounded past its line — and holds its ground.
> It is not leaving. (Committed)
> R5: Luis strikes for 48 (blood trail +2) (x2.0) (44 left)
> R5: Sam strikes for 42 (2 left) / Miguel strikes for 18 (0 left)
> The lead falls — the pack's coordination shatters.

`roundsDetail` confirms it: monster 300 → 0 over R3–R5
(93/115/108 dealt per round, Luis + two allies). Sense-test:
everything reads true — Rage fires, one buff round, three
doubled strikes land, the pack arrives when Luis shouts, and
the killing blow is Miguel's, not Luis's (Luis leaves it at 44,
Sam at 2, Miguel finishes). The honest shape: Rage + a party
of three + the smallest monster in the pool (300 HP vs the
Eater's 989, the Cancellation's ~1967). Rage alone did not kill
it — the pack did 117 of the 300 damage. A kill, but a small
one, and the only one.

**Luis vs the Algorithm, seed 106158, day 81 — the brawler-delay
shape (7 rounds, 407 dealt, vFlee).** R1 Rage, R2 Brawler's
Instinct, R3–R5 doubled strikes 46/50/46 while Austin and Miguel
join, R6–R7 normal strikes 25/26, flee at 44 HP with the
Algorithm at 343. The delay round is visible in the transcript
as a read of the fight, not a stall — and the fight still ends
in flight with the monster at a third of its health. The delay
cost one round of doubled damage; the fight was lost on damage,
not on the delay.

**Nina vs the Cancellation, seed 106151, day 95 (5 rounds, 388
dealt, vFlee).** The richest fight in the corpus. R1 Rage,
Blooded ("the village knows where the Producers bleed — strikes
hit 1.5× as hard"), R2 83 (x2.5 — Blooded stacking on the Rage
doubling), R3 field medicine while Amina charges in, R4 98
(x2.5) with "THE STAMP FALLS — on empty air. Nina has no script
to cancel. (Off-script.)", R5 98 (x2.5), flees at 29 HP with the
Cancellation at 1579 of ~1967. Two systems talking to each other
— village knowledge, the holder's Rage, the companion's arrival,
the wound that needs binding — and still a flight. A holder can
deal 388 damage to a wave-4 monster and not kill it. That is the
damage wall, stated as a fight rather than a number.

**Luiz vs the Suburb, seed 106151, day 100 (12 rounds, 588
dealt, vFlee).** The longest holder fight: doubled strikes land
round after round (34, 36, …), Rafael fights beside him, the
Suburb's HOA Fine and Property Tax lines keep their deadpan
menace. 588 damage — the most any holder deals — and the fight
still ends in flight. If the question wants a kill, it needs
more than a holder who fires.

**The never-fire contact holders (7 of 19 contact fights).**
Farid vs the Rerun d142 (4 rounds, 197 dealt, vFlee — strikes
for 48 twice, never fires: the monster is never above the gate,
or the gate never opens in four rounds); Farid vs the Eulogy
d80 on 106156 (1 round, 0 dealt, vFlee); Luis vs the Eulogy d81
(3 rounds, 0 dealt) and d82 (1 round, 0 dealt) and vs the
Algorithm d84 (1 round, 0 dealt); Elena vs the Eulogy d122
(3 rounds, 27 dealt, mFlee). The gate is not the only way a
holder contributes — Farid deals 197 without ever firing — and
the never-fire fights are mostly one-round flights: the holder
meets the monster, takes one look, and leaves. The 1-round,
0-damage never-fires read as a fighter who knows they cannot
win that fight, not as a broken gate.

**The other two holder kills (both Luis, both pre-wounded
monsters, neither a fought Rage kill).** Luis vs the Eulogy d86,
rounds 0: "Luis does not let it slip away — they close in and
strike with the sharpened stick for 23 — The Eulogy falls.
(Contact finish)" — a finishing blow on an already-wounded
monster before round 1. Luis vs the Algorithm d87, 8 rounds,
103 dealt, vKill, no Rage: a wounded 69-HP Algorithm finished
over eight rounds of tanking ("stands there and takes it soft —
deliberately"), committed-finish holds, and Brawler's Instinct —
the kill lands R8 for 27 (0 left). Both read as real fights
against monsters someone else had already hurt, not as Rage
doing the killing.

**Fiction wrinkle (note only, same as before):** the evade
lines use the village's knowledge-gated nicknames ("Nina saw
The Audit in time and gave it room") while the mechanics lines
use the true names. Minor; no action owed.

**Holder-fight outcomes, all 33:** evade 13, vFlee 16, vKill 3,
mFlee 1. Fourteen of 33 holder-fights never reach contact — the
second leak in the pool, unchanged from the survey.

## 4. Reachability (waves 1–5, national/table/wins, median survival)

| | This leg | Laterage-b (reference) | Designation survey (band) |
| --- | --- | --- | --- |
| Full wins | 0/8 | 0/8 | 0/8 |
| National scale | 0/8 | 0/8 | 0/8 |
| Table | not instrumented (0 wins) | not instrumented | not instrumented |
| Wave 5 reached | 3/8 (106151, 106157, 106158) | 2/8 | 3/8 |
| Wave 4 reached | 8/8 | 7/8 | 8/8 |
| Survived 150d (driver days) | 6/8 | 3/8 | 6/8 |
| Median survival | 150d | 137d | 150d |
| Community loss | 2/8 | 5/8 | 2/8 |
| Standing exactly 199 | 3/8 (106152, 106153, 106154) | 5/8 | 3/8 |
| Deaths (all seeds) | 836 | — | 836 |
| Starvation deaths | 7 of 836 | — | 7 of 836 |

Three of eight seeds sit at exactly standing 199 (106152,
106153, 106154) — the standing-199 stall again, same as
laterage-b and freestrike's leg. Seed 106156 loses the village
by day 96 at wave 4, standing 175; seed 106154 by day 139,
standing 199. Nothing moves. The wall stands exactly where
laterage-b left it — the holder-rich band is unremarkable on
the wall (same numbers as the survey band, as it should be:
same seeds, deterministic).

### Telemetry deviation check

`node scripts/telemetry-check.js --baseline
.../telemetry-baselines/scale-wall.json --current
'evidence/2026-11-19/perseed-laterage-rerun-b/*.json' --metrics
national,table,wins,exiled` — refused, verbatim:
"telemetry-check: refusing recorder-corpus input: all 8
--current rows carry top-level anchorCommit, so they are sweep
recorder rows, not runs. Recorder corpora are compared with
sweep-compare tables, never against a run baseline here. Pass
--allow-recorder-corpus for a same-shape recorder-vs-recorder
compare, or --update-baseline to reseed a baseline from these
files." (exit 2.) Same refusal as laterage-b / dmgshape-b /
ragepreempt-b. No deviation recorded; wall numbers above are
reported directly.

## 5. Village assessment, in plain words

On this band the villages finally have Rage holders in their
fights — twelve times a holder's eyes go red in front of a
wave-4 monster — and the answer is that Rage is never late.
Every single time it fires on the first round, and the doubled
strikes land one or two rounds later, almost all of them: 35 of
36 available doubled strikes land, and nobody deals zero damage.
The wait after firing is either nothing or one round spent
reading the fight and getting faster. The one thing Rage cannot
do here is finish the job: eleven of the twelve fights end with
the holder running, and the one kill is against the smallest
monster in the pool, finished off by the holder's friends. The
villages around the holders are still dying the same way — two
of eight lose the village, nobody wins, nobody reaches national,
three sit stuck at exactly 199 standing. The question this arm
asked — how often does Rage fire late, and what does the wait
cost — now has a measured answer on a holder-rich band: it
doesn't fire late, and the wait costs almost nothing. The
binding constraint was never the firing or the waiting. It is
the damage: a holder can land every doubled strike they have
and still walk away from a monster with two-thirds of its
health left.

## 6. Metric review (for the NEXT run — this run is judged as frozen)

1. **The pool floor priced from the contact rate worked.**
   The prereg priced the floor of 8 against the survey's 19
   contact holder-fights, not the headline 33 — and the judged
   pool came in at 12 fires, above the floor but below the
   contact count (19 contact → 12 fires; 7 contact holders
   never fire). The floor was honest about the margin: 12
   carries a distribution, barely. A future re-run on a thinner
   band should price from the FIRE rate, not the contact rate —
   the survey's own metric review said so, and this leg proves
   it: contact 19, fires 12, a 37% gap between the two pools.
2. **The taxonomy is now proven at scale, on n=12 — with a
   caveat.** 0 unclassified, 0 anomalies across 12 fights, and
   the first wild sighting of brawler_instinct as a delay cause.
   But the dominant-cause call rests on one fighter (Luis, 6
   rounds) — a cause call carried by a single kit is a
   description, not a population fact. The next run on this
   question should not assume brawler_instinct generalizes; it
   should re-prove the cause rollup on a pool spread across
   more fighters.
3. **The foregone estimate's no-basis case never engaged — and
   the second rung never did either.** Every fight landed ≥2
   doubled strikes, so the estimate is fully based on own
   doubled strikes (48, one fight). No fight has pre-fire
   strikes at all (Rage is always the first action), so the
   "2 × own pre-fire mean" rung is dead weight in this
   instrument — a future revision can drop it or keep it as a
   documented never-used rung.
4. **"Silent" is still untested in the wild.** No delay round
   in this corpus was silent — all six were a verb. The
   prereg's note stands: if silent ever dominates a rollup,
   split it with a stun recorder instead of re-scoring.
5. **The late-fire phenomenon is 0-for-13 in live play.**
   Laterage-b: 0/1 late. This leg: 0/12 late. The only late
   fire ever observed is the dmgshape sighting (Fatima d118,
   R4) — one fight in a staged-ish corpus on a different
   substrate. The question "how often does Rage fire late" is
   now answered as "essentially never on master substrate" —
   the next arm on this question should ask WHY the gate
   never slips (the firing gate is the monster's HP, never the
   holder's; nothing ahead of Rage in fieldAct fires often
   enough to displace it), or move on: the delay is not the
   binding constraint. Do not run a third laterage leg hoping
   for late fires.
6. **The survey's kill claim was wrong — correct it in the
   record.** The designation survey said "no holder fight in
   the survey kills its monster." The judged corpus on the
   identical seeds shows three holder kills (all Luis, all
   106158): one fought Rage kill (herald d86, pack finish),
   one contact finish (eulogy d86, pre-wounded, 23 damage),
   one trick finish (algorithm d87, pre-wounded 69-HP, no
   Rage). The survey's narrative under-reported kills because
   it read only the fights it sense-tested. The damage wall
   still stands — the big monsters are never killed — but "no
   kills" is false, and the correction belongs in the survey's
   record (coordinator: annotate
   `sim-rageholder-survey-b.md`, do not re-run the survey).

## 7. Blanks

- No 12–16-seed confirm: pilot DIAG-GO at 8 seeds; the prereg
  gates the confirm on GO, and a confirm on this question would
  re-prove a 0/12 late-fire rate at 12–16 seeds — the metric
  review (§6.5) says the next step is a WHY arm or a move-on,
  not a bigger count of the same zero. No confirm is run here;
  the coordinator decides.
- No panel compare: single diagnostic leg, no before/after —
  none promised (a cross-band compare is structurally invalid;
  laterage-b §4).
- Telemetry check refused recorder corpora (verbatim, §4).
- `node scripts/check.js --quick` was NOT run on this tip: the
  branch carries diagnostic tooling + evidence only, no `src/`
  change — same as laterage-b / ragepreempt-b / dmgshape-b. The
  proofs that bind this arm all ran green on the tip:
  `test-laterage-b.js` 11/11 (analyzer selftest 16/16, 5-day
  driver smoke, mislabel guards), analyzer exit 0 on the
  DIAG-GO verdict, driver exit 0 on both legs, 0 instrument
  errors.
- Survey corpus deleted after the judged leg reproduced its pool
  count exactly (136 encounters, 33 holders, 19 contact, 12
  fires; per-seed counts identical); the survey and judged
  driver logs are kept (`laterage-rerun-b-survey.log`,
  `laterage-rerun-b-judged.log`).

## 8. Findings notes for the coordinator (file these; do not edit sim-findings.md)

- **Late Rage firing — ANSWERED, DIAG-GO:** on the holder-rich
  designated band (106151–106158), 12 observable Rage fights,
  ALL fire R1 (0/12 late ≥2, 0/12 ≥4). Mean post-fire delay
  1.5 rounds (dist {1: 6, 2: 6}), never-landed 0/12, zero-damage
  0/12, 35/36 doubled strikes land. The Fatima R4 shape does
  not reproduce. Late fire is essentially never on master
  substrate; the post-fire wait costs almost nothing.
- **Dominant delay cause — BRAWLER'S INSTINCT (6 of 6 delay
  rounds):** first wild sighting of this cause; all six rounds
  are Luis (106158) R2 self-buffs (+2 speed) after an R1 Rage
  fire. The round is not wasted — it buys speed — but it does
  push the first doubled strike to R3. Caveat: one fighter
  carries the whole cause call; do not generalize it to a
  population fact.
- **CORRECTION to the rageholder survey:** the survey said "no
  holder fight kills its monster." Three holder kills exist on
  the identical seeds: Luis vs herald d86 (fought Rage kill,
  300-HP herald, pack finish — Miguel lands the killing blow),
  Luis vs eulogy d86 (contact finish, pre-wounded, 23 dmg,
  rounds 0), Luis vs algorithm d87 (trick finish, pre-wounded
  69-HP, no Rage, 8 rounds). Annotate the survey record; the
  damage wall still stands (big monsters never killed), but
  "no kills" is false.
- **The damage wall inside holder fights:** Rage fights deal
  4,210 total (mean 350.8/fight); the biggest single fight
  (Luiz vs Suburb, 588) still ends in flight. 11/12 Rage fights
  end vFlee. A holder landing every doubled strike still leaves
  a wave-4 monster with most of its health. The binding
  constraint is damage, not firing or waiting.
- **Never-fire contact holders are visible and real:** 7 of 19
  contact holder-fights never fire (Farid d142 Rerun, 197 dealt
  without firing, is the sharpest case). The gate is not the
  only way a holder contributes.
- **Standing-199 stall recurs:** 3/8 seeds at exactly 199,
  same as laterage-b / freestrike. Still the wall.
- **Designation survives the base move:** survey-first leg on
  `1cb6ce2e1` reproduced the designation survey's band totals
  exactly (136/33/19/12) — finding #2616 EXTENDS (base form)
  NOT triggered here. The survey-first pattern works.
- **EVIDENCE-ONLY:** this branch holds prereg + evidence only
  (instrument already on master from laterage-b); nothing in it
  is a game change. The coordinator lands evidence-only or
  releases the branch done-abandoned.
- **Next-blank pointer:** the 2130Z round record's next-blank
  (1) is now answered; blanks (2) damage question, (3) #2617
  dead-target launch, (4) standing-199 stall remain, in order.

## Files

- Prereg: `evidence/2026-11-19/sim-laterage-rerun-b-prereg.md`
  (commit `8c63ce0d2`)
- Evidence (this file): `evidence/2026-11-19/sim-laterage-rerun-b.md`
- Analysis: `evidence/2026-11-19/laterage-rerun-b-analysis.json`
- Corpus: `evidence/2026-11-19/perseed-laterage-rerun-b/` (8 files)
- Logs: `evidence/2026-11-19/laterage-rerun-b-survey.log`,
  `evidence/2026-11-19/laterage-rerun-b-judged.log`
- Instrument (on master, reused unchanged):
  `scripts/laterage-driver-b.js`,
  `scripts/analyze-laterage-b.js`, `scripts/test-laterage-b.js`
