# sim-stay-a — staying/morale + free-damage ceiling (scale-onramp axis)

Run: flesh-out loop (loop A), run fleshout-loop-a-20261101T1706Z
(adoption of orphaned 1555Z setup; prereg committed BEFORE any judged
sim, then rebased onto current master c7bf25a51, proofs re-run green).
DIAG ONLY: zero src/js changes, zero policy-default flips, no landing
proposed. Instrument: scripts/policies/holdline.js (crew-enlargement
policy, default OFF), scripts/sim-stay-a-sweep.js,
scripts/sim-stay-a-analyze.js, proof tests
scripts/test-sim-stay-a-*.js (6/6 + 8/8 PASS on the rebased tip).

## Prereg (binding, evidence/2026-11-01/sim-stay-a-prereg.md)

Band VERBATIM from sim-wave4leth-a (sortiedpr PLAYED band):
tableseat-nowait, LEANLINKRESCUE=1, TABLESEATNOWAIT=1, 180d
death-aware, fieldparty-form-diag reused verbatim, sortie-driver
layer in the sweep only. Legs: baseline (tableseat-nowait) +
candidate (holdline, HOLDLINE=1) + det-gate leg (holdline-off on one
seed, must reproduce baseline exactly). Primary metric:
candidate-vs-baseline wave-4 fought-fight decomposition on identical
seeds. PILOT-GO = G1 + G2 + G3 + G4. CONFIRM BARS (fresh seeds
75111–75122): round-4+ surviving fights on >= 2 seeds; >= 1 >=91-HP
damage conversion; median sustained DPR >= 22; death guard (vDie
share <= baseline + 5pp); corpus validity as G1. A miss is NO-GO,
never re-scored. Secondary census: arrow carriage at contact
(backlog #1718 ammo sub-blank), reported not judged.

## Baseline re-registration (drift vs 1415Z, reported not judged)

The 1415Z corpus sat on the 1415Z base; this run re-ran the baseline
on the current base and judges against the FRESH baseline, per prereg.
Drift is real: pilot baseline offered 26 wave-4 fights (1415Z: 67),
fought 25 (1415Z: 65), median sustained DPR 10 (1415Z: 11.0), fled
68% (1415Z: 66%), died 28% (1415Z: 25%). The fresh baseline also
reads markedly stronger wall numbers than the standing scale-wall
picture (pilot: won 3/8, national-ever 7/8; confirm: won 1/12,
national-ever 9/12) — see "wall numbers" below. The drift is
reported; the fresh baseline still governs every comparison here.

## PILOT (seeds 75101–75108) — VERDICT: PILOT-GO

Analyzer: scripts/sim-stay-a-analyze.js, output
evidence/2026-11-01/sim-stay-a-analysis.json. Det-gate: holdline-off
on 75101 reproduces baseline exactly (days 25, wave 2, 0 wave-4
fights, 31 fieldparty meetings) — ok=true.

| Measure | Baseline (fresh) | Candidate (holdline) |
|---|---|---|
| Offered / fought / evades | 26 / 25 / 1 | 69 / 69 / 0 |
| Shares fled / died / drive-off / kill | 68% / 28% / 4% / 0% | 60.9% / 21.7% / 14.5% / 2.9% |
| Rounds distribution | 1:14, 2:10, 3:1 (max 3) | 0:4, 1:26, 2:23, 3:15, 4:1 (max 4) |
| Median sustained DPR (rounds >= 1) | 10 | 7.5 |
| Healthy (>=91 HP) fights / kills / damage conversions | 25 / 0 / 0 | 61 / 0 / 1 |
| Round-4+ fights (survived) | 0 (0) | 1 (1) |
| Component shares leader / ally / volley | 100% / 0% / 0% (424 dmg) | 95.8% / 4.2% / 10.8% (1949 dmg) |
| Leader deaths / joined fights / ally deaths / ally struck | 7 / 2 / 1 / 1 | 15 / 26 / 1 / 2 |

- G1 CORPUS-VALIDITY: PASS. 8/8 rows both legs, days > 0,
  fieldparty errs 0, overflow 0, wrapper errs 0, ammo-diag
  instrumentErrors 0, det-gate ok.
- G2 STAYING SIGNAL: PASS (two of three signals). (a) Round-4+
  surviving fight: Brian Otieno vs The Influencer, s75102 d49, 4
  rounds, vFlee, 93 damage dealt to an 850-HP beast, ally Chantal
  Mukendi joined (12 dmg). (b) >=91-HP damage conversion: Ursula
  Weber vs herald, s75107 d78, 3 rounds, mFlee, 112 damage dealt to
  a 164-HP beast (52 left), volley 0, ally 6 — real damage, not a
  Peacemaker 0-damage drive-off. (c) DPR doubling NOT met (7.5 <
  22) — the bar needs only ANY one signal.
- G3 DEATH GUARD: PASS. Candidate vDie share 21.74% vs baseline
  28.00% = −6.26pp, within baseline + 5pp. Flees did NOT convert to
  deaths at the fight level.
- G4 SENSE LEG: PASS. Transcripts read + quoted + judged below.
- PILOT-GO = all four. Confirm band earned (run below).

Mechanism check (the layer actually fired): candidate leg recorded
1,212 new patrol assignments across 8 seeds (127–210 per seed);
baseline recorded 0 (negative control clean). Joined fights rose
2 → 26. The crew-enlargement mechanism is real, not a no-op.

## CONFIRM (fresh seeds 75111–75122) — VERDICT: NO-GO

Analyzer output evidence/2026-11-01/sim-stay-a-confirm-analysis.json.
Det-gate: holdline-off on 75111 reproduces baseline exactly (days
180, wave 4, 1 wave-4 fight, 186 meetings) — ok=true.

| Measure | Baseline (fresh) | Candidate (holdline) |
|---|---|---|
| Offered / fought / evades | 67 / 64 / 3 | 98 / 93 / 5 |
| Shares fled / died / drive-off / kill | 64.1% / 26.6% / 9.4% / 0% | 64.5% / 30.1% / 5.4% / 0% |
| Rounds distribution | 1:27, 2:29, 3:7, 4:1 | 0:1, 1:35, 2:30, 3:24, 4:2, 8:1 |
| Median sustained DPR (rounds >= 1) | 9 | 5 |
| Healthy (>=91 HP) fights / damage conversions | 61 / 0 | 92 / 0 |
| Round-4+ surviving fights, by seed | 1 seed (75117) | 3 seeds (75114, 75116, 75120) |
| Component shares leader / ally / volley | 97.4% / 2.6% / 0% (1026 dmg) | 93.4% / 6.6% / 6.4% (1751 dmg) |
| Leader deaths / joined fights / ally deaths / ally struck | 17 / 7 / 0 / 0 | 28 / 37 / 1 / 5 |

Confirm bars, judged one by one:
- Round-4+ surviving fights on >= 2 seeds: PASS (3 seeds).
  Honesty note: two of the three are thin — Arina (s75114 d109,
  eulogy, 4 rounds, 0 damage dealt, ally Leo joined) held without
  landing a blow; Diana Osei (s75120 d77, influencer, 8 rounds,
  53 damage) is the real hold (transcript below). Caleb (s75116
  d130, strike, 4 rounds, 54 damage, ally Fatima) is in between.
- >= 1 >=91-HP damage conversion: FAIL (0). The pilot's single
  conversion did not reproduce on 12 fresh seeds; candidate kills
  are 0 in confirm (pilot had 2).
- Median sustained DPR >= 22: FAIL (5, vs pilot 7.5 and baseline 9
  — the candidate's extra fights are longer but weaker per round,
  and the DPR bar was never close in either band).
- Death guard: PASS (30.11% vs 26.56% = +3.55pp, within +5pp).
- Corpus validity: PASS (12/12 both legs, all error counts 0).
- CONFIRM VERDICT: NO-GO. Two of five bars fail. Per prereg this is
  a measurement result, not a lever to re-score: the holdline crew
  layer does NOT earn a landing case. The pilot GO stands as a
  pilot signal only; the confirm band kills the landing case.

## Wall numbers per leg (reported, never claimed as movement)

Wave-5 reach is 0 in every leg of both bands. No leg moves the wall.

Pilot (8 seeds):
- Baseline: won 3/8, national-ever 7/8, national-final 6/8, table
  3/8, entered 3/8, wave-4 reach 7/8, wave-5 0, median survival 166d
  (max 180), deaths 262, starvation deaths 6.
- Candidate: won 1/8, national-ever 4/8, national-final 3/8, table
  4/8, entered 1/8, wave-4 reach 8/8, wave-5 0, median survival 103d
  (max 180), deaths 400, starvation deaths 4.

Confirm (12 seeds):
- Baseline: won 1/12, national-ever 9/12, national-final 2/12,
  table 3/12, entered 1/12, wave-4 reach 11/12, wave-5 0, median
  survival 167d, deaths 470, starvation deaths 3.
- Candidate: won 1/12, national-ever 2/12, national-final 1/12,
  table 7/12, entered 1/12, wave-4 reach 11/12, wave-5 0, median
  survival 104d, deaths 575, starvation deaths 9.

Reading: the candidate leg consistently trades village survival for
fight exposure. Median survival falls ~63 days in both bands
(166→103 pilot, 167→104 confirm) and total deaths rise (262→400,
470→575). The death-cause ledger names the mechanism: "villager:
patrol combat" is 0 in both baselines but 142 (pilot) and 176
(confirm) in the candidate legs — the extra patrol assignments put
more villagers in front of patrol combat, and patrol combat kills
them. Fight-level death share holds (G3) only because the candidate
also fights far more often (69 vs 25 pilot, 93 vs 64 confirm).
Per-fight staying is real; village-level it is a loss-maker.
Table invitations rise in confirm candidate (7/12 vs 3/12) but
entries do not (1/12 both) — invitations without entries, not
progress. National-ever collapses in confirm candidate (2/12 vs
9/12). The scale wall is unmoved: wave 5 never reached, full-seat
wins 0 in every leg.

Oddity, reported not chased: several rows read won=1 with
endReason "over-other" (pilot baseline s75103/s75104/s75106,
confirm baseline s75112, confirm candidate s75120). The won flag
comes from Game.won at snapshot; one such row (pilot baseline
s75103) has tableState path feared / branch light / phase done /
seat lesser — a lesser-seat completion followed by a later game
over. The won count therefore reads "reached a seat outcome,"
not "village alive and won at end." No bar depends on it.

## Secondary ammo census (backlog #1718, reported not judged)

carriedNeeded = amount of the fighter's needed ammo type carried at
contact (0 = dry). Pile = communal pile at fight time.

Pilot: baseline 11 ranged wave-4 fights (6 needing ammo, all 6 dry:
1 departed-before-fight, 5 never-departed); candidate 40 ranged (30
needing ammo, 20 dry: 18 departed-before-fight, 2 never-departed).
Carried>0 share: baseline 0/11, candidate 10/40 (all 10 are
phase_sling stone carriers). Volley: baseline 0 shots / 0 dmg;
candidate 22 shots / 246 dmg. Pile means at fight time: baseline
stone 417 / branch 70; candidate stone 250 / branch 45 — the pile
is not the constraint; carriage is.

Confirm: baseline 31 ranged, carried>0 0/31, volley 0/0; candidate
53 ranged, carried>0 4/53 (sling 3, phase_sling 1), volley 11 shots /
112 dmg. Same shape as pilot: the candidate fields more ranged
fighters (crew enlargement) but dryness persists, and most dry
candidate fighters HAD departed before the fight — departure
pocketing is not converting pile stone into carried ammo for them.
This reproduces sim-ammo-a's finding on the current base and does
not re-litigate it (prereg: not this arm's lever).

## Sense-testing law — transcripts read, quoted, judged

S1 priority (candidate corpus): DIED first, then FLED, then
round-4+/converted. All three pilot transcripts are from the pilot
candidate corpus; the confirm round-8 transcript is quoted as an
observation.

### DIED — Tarek, s75102 d70, algorithm (caller resolve), round 1

> Tarek has Sling but no arrows — the string stays drawn, useless.
> R1: Tarek strikes for 11 (989 left)
> Tarek's gear absorbs 11.
> R1: Recommended For You hits Tarek for 88 (0 left)

Judgment: MIXED, leaning desperate in content, silent in form. The
opening line is human and awful — a villager walking into a wave-4
beast with an empty sling. But the death itself is one arithmetic
line: hit for 88, 0 left, no cry, no witness, no aftermath in the
log. The village never hears about Tarek in this transcript. The
empty-sling line does more storytelling than the kill does.

### FLED — Nompumelelo, pilot candidate corpus, with ally Noah

> R1: Nompumelelo's eyes go red. Next 3 strikes hit twice as hard. (Rage)
> Nompumelelo's gear absorbs 25.
> R1: Your Move hits Nompumelelo for 40 (50 left)
> Nompumelelo's gear absorbs 24.
> R2: Your Move hits Nompumelelo for 40 (10 left)
> R2: Nompumelelo strikes for 48 (x2.0) (1152 left)
> Nompumelelo is losing — shouts for help! Noah charges in!
> Noah answered Nompumelelo's shout, but Nompumelelo is past holding — they run while running still works.

Judgment: DESPERATE. This is the best-shaped flee narration in the
corpus: the Rage ability fires, the fighter trades down to 10 HP,
the shout is answered — and the ally arrives too late, because the
fighter is already past holding. The retreat reads as a decision
made while running still works, not as a silent morale flip. The
tragedy (help came, too late) is legible without explanation.

### ROUND-4+ — Brian Otieno vs The Influencer, s75102 d49, 4 rounds, vFlee

> Brian sees The Influencer coming and nocks an arrow — the fight opens at range (2 shots).
>   loosed — it takes The Influencer for 8 (842 left).
>   loosed — it takes The Influencer for 10 (832 left).
> Brian lowers the bow — The Influencer is on them now. (2/2 hit)
> R1: Brian strikes for 12 (820 left)
> Brian's gear absorbs 27.
> R1: Ratio hits Brian for 28 (60 left)
> Brian's gear absorbs 24.
> R2: Ratio hits Brian for 26 (34 left)
> R2: Brian strikes for 12 (808 left)
> Brian is losing — shouts for help! Chantal charges in!
> R3: Brian strikes for 12 (796 left)
> R3: Chantal strikes for 6 (790 left)
> R3: Ratio hits Chantal for 51 (31 left)
> Brian BELLOWS — not volume, a promise. The Influencer falters. They hold the line a little longer. (War Cry)
> R4: The Influencer hesitates — Brian bought a breath.
> R4: Brian strikes for 12 (778 left)
> R4: Chantal strikes for 3 (775 left)
> R4: Brian strikes for 15 (760 left)
> R4: Chantal strikes for 3 (757 left)
> Brian sees how this ends — and runs while running still works.

Judgment: DESPERATE. The hold is narrated beat by beat — the ranged
open, the shout, the ally joining, the War Cry ("not volume, a
promise"), the bought breath — and then the same clear-eyed
retreat line. A four-round hold against an 850-HP beast that ends
in a chosen retreat, not a rout, is exactly what "staying" should
look like in prose. The prose is ahead of the numbers here: 93
damage against 850 HP is 11%, but the fight reads as a stand.

### Confirm observation — Diana Osei, s75120 d77, influencer, 8 rounds, vFlee

> Diana walks straight into The Ugly Beast. No avoiding it.
> Diana and Hang have bled together — it steadies them.
> R1: Diana strikes for 10 (1020 left)
> R2: Diana ignores the ring light and hunts the followers — a phone clatters, a fan-creature drops. (1 down.)
> Diana holds the line — working the trick, not the damage race.
> R4: Diana ignores the ring light and hunts the followers — a phone clatters, a fan-creature drops. (2 down.)
> Diana is losing — shouts for help! Hang charges in!
> R5: Diana stops mid-fight and binds the wound — field medicine, +20 HP.
> R5: Hang strikes for 6 (1000 left)
> R6: Hang strikes for 5 (995 left)
> R6: Ratio hits Hang for 52 (3 left)
> R7: Hang strikes for 5 (977 left)
> R7: Ratio hits Hang for 40 (0 left)
> Hang goes down!
> R8: Diana ignores the ring light and hunts the followers — a phone clatters, a fan-creature drops. (4 down.)
> R8: Ratio hits Diana for 20 (25 left)
> Diana sees how this ends — and runs while running still works.

Judgment: DESPERATE — and the hardest transcript in the corpus.
Diana works the trick (hunting followers, not the damage race),
binds her wound mid-fight, watches her ally Hang go down beside
her, and still holds to round 8 before the clear-eyed retreat.
Note for the record: Hang is one of the rare struck-and-killed
allies (confirm candidate: 5 ally-struck fights, 1 ally death) —
the "allies are never targeted" fact from 1415Z bends here, it does
not break. Field-death narration (#1719) is OBSERVATION ONLY per
prereg: Hang's death is announced in the fight log ("Hang goes
down!") and nowhere else in this transcript; what the village is
told is not in this corpus and is not chased here.

SENSE VERDICT: DESPERATE overall (one mixed death transcript, two
desperate flee/hold transcripts, one desperate confirm hold). The
fight prose carries desperation; the death prose does not yet.

## Village assessment (plain words)

What the village looked like: with the hold-line crew layer on,
villages send more people out on patrol — the crew is bigger, more
villagers meet wave-4 beasts, more fights happen, and the fights
last longer with allies actually showing up. In the fights
themselves, villagers hold a little longer and sometimes drive a
wounded beast off. But the village as a whole pays for it: the extra
patrols walk villagers into patrol combat that kills them, villages
die about two months earlier on the median, and fewer of them ever
grow toward national. The layer buys fight-level staying with
village-level lives, and the exchange rate is bad. The one honest
bright spot is the prose: when villagers do hold, the game now
shows it — a shout answered too late, a war cry that buys a
breath, an ally going down beside you. The numbers do not yet earn
what the prose promises.

Who thrived and who died and why: patrol assignees died — 142
(pilot) and 176 (confirm) patrol-combat deaths in the candidate
legs against zero in baselines. The scholar-led fight corpus is
still empty of scholar-led wave-4 fights (all leaders villagers),
so nothing here speaks to scholar play. Ursula Weber's damage
drive-off and Diana Osei's eight-round hold are the individual
bright spots; Tarek's empty-sling death is the emblem of the cost.

What knowledge/capabilities were missing: (1) a way to hold that
does not spend patrol lives — crew enlargement is the only honest
policy lever and it taxes the village; (2) ammo carriage for
fighters who depart — dry fighters persist even after departing;
(3) damage output — median sustained DPR 5–7.5 against beasts with
700–1000 HP means even a four-round hold removes ~11% of a beast.

Which blank was filled: none landed — this arm is DIAG only. The
blank documented: crew enlargement produces a real staying signal
at pilot (PILOT-GO) that does not survive confirm (NO-GO on the
conversion and DPR bars), and it costs the village more than the
fights gain. The holdline policy instrument is committed as a
measurement tool, default OFF, not a landing candidate.

## Metric review

- The prereg bars were honored as written; no re-scoring. Pilot GO
  (all four bars) earned the confirm spend; confirm NO-GO (two of
  five bars failed) kills the landing case. The pilot/confirm split
  worked as designed: the pilot signal was real but small (one
  round-4+ fight, one conversion), and the confirm band showed it
  does not scale.
- Bar honesty note: the confirm round-4+ bar counts survival, not
  damage — Arina's 0-damage four-round hold counts toward it. A
  future bar should require damage dealt alongside survival, or the
  bar rewards hiding. Proposed for the NEXT run, not applied here.
- The DPR bar (>= 22, 2x the 1415Z 11.0) was never close in either
  band (candidate 7.5 pilot, 5 confirm) and looks miscalibrated
  against what crew enlargement can do: the layer adds fighters
  and rounds, not damage per round. If a future arm targets DPR, it
  needs a damage lever, not a staying lever. Proposed revision for
  the next run: judge staying arms on rounds + conversions, and
  damage arms on DPR — do not ask one lever to move both.
- The analyzer's wall print hardcodes "/8"; confirm bands have 12
  seeds. Cosmetic only; the JSON counts are correct and this file
  reports /12.
- Baseline drift vs 1415Z (26 vs 67 offered fights on pilot seeds)
  is the largest measurement caveat: the current base plays these
  seeds very differently from the 1415Z base, so cross-round
  comparisons against 1415Z numbers are unreliable. Fresh-baseline
  paired comparisons (what this run judges) are unaffected.
- No panel artifact (standing exception: the panel has no
  census-ingest mode; identical-seed paired tables are the §15
  substitute, as in prior rounds).

## Infrastructure notes

- Adoption: this tree held the orphaned 1555Z worker's uncommitted
  setup; no judged sims had run and no live process owned the tree.
  Verified, committed (fe2a8f84b after rebase), rebased onto current
  master c7bf25a51 cleanly, proofs re-run green. No rebase conflict.
- The 1555Z EPERM write flap had cleared by adoption time:
  safe-commit.sh succeeded first try. The known safe-commit index
  clobber struck on the prereg commit (staged deletions for
  byte-identical files); repaired with git update-index --cacheinfo
  from HEAD blobs, verified git status empty + git diff HEAD empty
  before proceeding. The commit itself was correct throughout.
- Corpus: evidence/2026-11-01/sim-stay-a/{baseline,candidate,
  holdline-off}/ (pilot seeds 75101–75108 + confirm seeds
  75111–75122 + det-gate seeds 75101/75111), analysis JSONs
  sim-stay-a-analysis.json (pilot, PILOT-GO) and
  sim-stay-a-confirm-analysis.json (confirm bands, judged here).
  The sweep's summary.json in each leg dir reflects the confirm
  run (last writer); pilot per-seed files are intact.
- No [needs-eyes]: DIAG only, no feel/combat/UI change, no landing
  proposed. No push, no bump, no live verification — merged
  locally, pending ship (coordinator merges).
