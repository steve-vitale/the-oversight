# sim-w4lethality — wave-4 lethality census: DIAG-NO-GO on parity, with the damage gap measured and named

Run: fleshout loop, run fleshout-20261027T1926Z. Axis: scale-onramp
(the blocking axis). Worker: sim-w4lethality.
Worktree: `~/workspace/worktrees/sim-w4lethality` (branch sim-w4lethality).
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips, no
game lever, no game-lever proposal. The deliverable is knowledge: a
wave-4 lethality census on seeds 75101-75108, substrate VERBATIM
from the w4channel band (tableseat-nowait, LEANLINKRESCUE=1,
TABLESEATNOWAIT=1, 180d death-aware horizon).

Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-27/sim-w4lethality-prereg.md (commit d4815b50f).
Corpus: evidence/2026-10-27/perseed-w4lethality/ (8 rows +
summary.json + analysis.json + sense-75104.txt). Instruments:
scripts/policies/tbdmg-diag.js (the one new recorder — TB end HP
+ field fighter HP left, read-only observer), scripts/
test-w4lethality-sweep.js (census sweep), scripts/test-w4lethality.js
(proof validator / analyzer), scripts/test-w4lethality-sense.js
(non-measured sense replay, windowed on the seed's wave-4 window).
Detgate: PASS (seed 75101, baseline vs recorders-OFF: days 130/130,
gameDays 130/130, tsNationalDay 77 both, no diag surface, no wraps
installed, post-setup world 0).

## Plain words first

This band's wave-4 fights are almost all hopeless in a very specific
way: the typical fight scratches the monster for about 2% of its
health, and the typical field fight scratches it for about 1-3%.
Out of 56 losing fights that actually exchanged blows, 17 dealt no
damage at all, and the middle fight dealt just 1.9% of the monster's
health. Only two losing fights ever got past half the monster's
health — and the closer of the two is the story of this census: on
seed 75104, the scholar fought a Eulogy down to 66 health out of
942 (7% left) in 5 rounds, and lost. The next day the village met
that same wounded Eulogy twice in the field — at 66 health, twice —
and both times the meeting ended without a single blow, the monster
fleeing; the day after that it was back at full health (900) and
killed a villager. A near-kill in a turn-based fight does not stick:
the monster walks away wounded for a day, nobody finishes it, and
then it is whole again. The band did kill two wave-4 monsters —
both Congregations, both in turn-based fights — so killing wave 4
is possible here; it just almost never happens, and when it does
it takes a fight that deals more than the monster's whole health.

## Verdict: DIAG-NO-GO (binding prereg, no re-score)

GO required all six legs (a)-(f). Five legs compute cleanly; leg
(c) fails outright, and under MEASUREMENT.md §14 a failed leg is
NO-GO, not a re-score. The census data below is therefore reported
as MEASURED, NOT as a judged GO verdict — the numbers are real,
the parity leg is what fails, and the failure is diagnosed, not
hidden:

- (a) 8/8 configs valid: PASS. 8 rows, days > 0, every gate + deed
  + damage field present, recorder errors 0 on all seven
  recorders (raftdraft, spawnsrc, oldcore, w5births, defwound,
  nonworldkill, tbdmg), no overflow. Validator G1 PASS.
- (b) 100% of wave-4 fights have a complete damage record: PASS.
  28/28 TB fights joined start + tbdmg end with monster fighter
  HP at both ends; 33/33 field fights carry defwound damage +
  HP + rounds; field-supplement gaps 0 (every field fight gained
  its vHpLeft). 61/61 fights complete.
- (c) Fight-count parity vs the w4channel band explained: FAIL.
  Every seed diverges (see "Parity failure — the diagnosis"
  below). The divergence is PROVEN to be pre-existing corpus
  drift, not this arm's recorder — but the prereg's leg (c) as
  written requires parity against the committed channel corpus,
  and that parity does not hold. Per the prereg, that is a NO-GO
  diagnosis, and this run stops for coordinator direction rather
  than re-scoring parity against a re-baselined band. The
  re-baselined comparison (this band vs a fresh channel rerun
  on current code) is computed in the diagnosis section as
  evidence for the NEXT run's prereg, never as this run's verdict.
- (d) Damage distribution vs monster max HP computed, closest-loss
  gap NAMED: computed (see below). Closest loss: seed 75104,
  day 162, Eulogy, player-tb-world, 876 damage of 942 max HP
  (93.0%), 66 HP left (7.0%), 5 rounds, fighter HP left -8
  (scholar's fighter dead at fight end). The same fight is the
  closest by HP left AND by % left — there is no second candidate
  to argue about.
- (e) The >50% question answered with counts: YES, twice among
  losing fights (2/56 non-kill fights over 50% of max HP), and
  4/58 counting kills (the literal reading). By channel (non-kill):
  player-tb-world 1/20, non-world-TB 1/3, contest 0/2,
  villager-field 0/22, raid-defender 0/8, other 0/1.
- (f) SENSE: one seed's wave-4 fight thread read in plain words,
  windowed on that seed's wave-4 window: PASS (seed 75104,
  window d105-d168: first arrival d115 minus 10 to last fight
  d168; replay file perseed-w4lethality/sense-75104.txt, 714
  life/gate hits, 25 fight-start lines). Read below.

VERDICT: DIAG-NO-GO, on leg (c) alone. Legs (a), (b), (d), (e),
(f) are reported as measured; no leg is re-scored, and no GO is
claimed from a subset.

## The band (as pre-registered, VERBATIM substrate)

- Seeds 75101-75108, single arm, tableseat-nowait VERBATIM.
- Horizon 180d DEATH-AWARE (runDays stops on death/win; +10d tail
  max). Sweep wall time ~14 min for 8 seeds (plus detgate ~2 min).
- Substrate-activation gate: band courtship combined = 131
  (courtCounters 0, courtAccords, courtNational, courtGlobal,
  tended, defenseCalls, proposedLead per-row in the corpus),
  seeds active 7/8 — GATE PASSES (combined > 0 and >= 6/8 active).
  The one inactive seed is 75105, dead day 30 before courtship
  can start — a timing fact, not a missing substrate.
- Freshness, as disclosed in the prereg (not assumed): a filename/
  content grep over evidence/2026-10-27/ BEFORE sweeping found no
  file mentioning "w4lethality" or "tbdmg", and no .md outside the
  channel/abstain/2357 family mentioning seeds 75101-75108 at all.
  The judged quantities — TB-fight damage, the distribution, the
  closest-loss gap, the >50% answer — did not exist for this band
  anywhere in committed evidence and are FRESH. DISCLOSED PARTIAL
  EXCEPTION (prereg, repeated here so it cannot be mistaken for a
  claim): field-fight damage rows DID exist in the channel corpus
  (defwound rows), and this census re-records them in-band rather
  than importing them; the field rows below are this band's own
  measurement, cross-checked under leg (c) like everything else.

## Wall numbers (THIS band only, never pooled with channel/abstain)

| field | this band (75101-75108) | channel band (committed) |
|---|---|---|
| national ever / final | 6/8 / 3/8 | 7/8 / 6/8 |
| table invited / entered | 6/8 / 3/8 | 5/8 / 5/8 |
| wins (lesser / full) | 3/8 (3 / 0) | 5/8 (5 / 0) |
| wave-4 unlock | 6/8 | 3/8 |
| wave-5 unlock | 0/8 | 0/8 |
| median survival | 130d upper / 127d conventional (days: 30, 101, 114, 124, 130, 168, 171, 180) | 145d |
| starvation deaths | 0 | 1 |
| deaths total | 248 | 221 |

Per-seed ends: 75101 won lesser d130 (wave 4, global); 75102
village-lost d171 (wave 4, regional); 75103 survived d180 (wave 4,
regional, no table); 75104 village-lost d168 (wave 4, regional);
75105 village-lost d30 (wave 1, village); 75106 won lesser d101
(wave 3, global); 75107 won lesser d124 (wave 4, national); 75108
village-lost d114 (wave 4, regional). Arc IV (table entered): 3/8.
Wave-4 kills on this band: 2 (see Kills below) — the channel band's
0 is NOT reproduced here, which is itself a parity divergence, not
a contradiction to smooth over: different trajectories, different
outcomes.

Death-cause shares (248 deaths): villager combat 89 (35.9%),
villager-vs-villager combat 65 (26.2%), player arena 48 (19.4%),
expedition 14, villager monster 10, ambush 7, villager sickness 5,
player contest 2, singles (Choir Toad, wound-that-wouldn't-close,
toad-war-drum, Big Ugly, player sickness, Ugly-Eyes, The Reunion,
the night). Combat in all its forms is 214/248 (86.3%) of all
deaths; starvation is 0 — starvation does not explain anything on
this band either.

## The lethality table (the judged measurement)

61 wave-4 fights with complete damage records: 28 turn-based (TB),
33 field (24 villager-field, 9 raid-defender), of which 3 are
evades (rounds 0, damage 0 — counted in the fight total, excluded
from the loss ranking, per the prereg). 2 fights are kills
(excluded from the loss ranking, reported separately).

### Turn-based fights (28): damage, max HP, HP left, rounds

| seed | day | monster | channel | door | dmg | max | left | %max | rounds | fighter HP left | result |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 75101 | 122 | eulogy | contest | contest-arena | 136 | 1146 | 985 | 11.9% | 6 | -5041* | lost |
| 75101 | 124 | algorithm | player-tb-world | world-bump | 0 | 1443 | 1443 | 0% | 3 | -18 | lost |
| 75101 | 124 | reunion | player-tb-world | world-bump | 20 | 1595 | 1575 | 1.3% | 3 | -41 | lost |
| 75101 | 124 | reunion | player-tb-world | world-bump | 34 | 1620 | 1586 | 2.1% | 2 | -22 | lost |
| 75101 | 124 | reunion | player-tb-world | world-bump | 0 | 1665 | 1665 | 0% | 3 | -53 | lost |
| 75101 | 125 | congregation | player-tb-world | world-bump | 284 | 1371 | 1087 | 20.7% | 12 | -13 | lost |
| 75102 | 96 | eulogy | non-world-TB | feast-draw | 579 | 1005 | 426 | 57.6% | 6 | -4269* | lost |
| 75102 | 113 | reunion | player-tb-world | world-bump | 0 | 1365 | 1365 | 0% | 3 | -32 | lost |
| 75102 | 157 | reunion | non-world-TB | feast-draw | 0 | 2871† | 2871 | 0% | 2 | -18 | lost |
| 75102 | 164 | reunion | player-tb-world | world-bump | 0 | 3193† | 3193 | 0% | 2 | -23 | lost |
| 75103 | 172 | reunion | player-tb-world | world-bump | 210 | 1204 | 994 | 17.4% | 7 | -15 | lost |
| 75104 | 144 | congregation | contest | contest-arena | 215 | 1087 | 872 | 19.8% | 16 | -24 | lost |
| 75104 | 147 | congregation | other | feast-draw | 206 | 1051 | 845 | 19.6% | 18 | -12 | lost |
| 75104 | 151 | audit | player-tb-world | world-bump | 252 | 1296 | 1031 | 19.4% | 8 | -9 | lost |
| 75104 | 161 | congregation | other | feast-draw | 1210 | 999 | -211 | 121.1% | 8 | 76 | WON — KILL |
| 75104 | 162 | eulogy | player-tb-world | world-bump | 876 | 942 | 66 | 93.0% | 5 | -8 | lost |
| 75104 | 163 | eulogy | player-tb-world | world-bump | 10 | 917 | 907 | 1.1% | 3 | -24 | lost |
| 75104 | 164 | eulogy | player-tb-world | world-bump | 418 | 948 | 530 | 44.1% | 6 | -3644* | lost |
| 75104 | 165 | eulogy | player-tb-world | world-bump | 74 | 934 | 860 | 7.9% | 5 | -9 | lost |
| 75104 | 166 | eulogy | player-tb-world | world-bump | 152 | 1093 | 941 | 13.9% | 4 | -4 | lost |
| 75104 | 167 | eulogy | player-tb-world | world-bump | 63 | 1070 | 1007 | 5.9% | 5 | 0 | lost |
| 75104 | 167 | eulogy | player-tb-world | world-bump | 16 | 1035 | 1019 | 1.5% | 5 | -23 | lost |
| 75104 | 168 | eulogy | player-tb-world | world-bump | 56 | 1030 | 974 | 5.4% | 5 | -13 | lost |
| 75108 | 81 | algorithm | non-world-TB | feast-draw | 408 | 1137 | 729 | 35.9% | 6 | -31 | lost |
| 75108 | 90 | congregation | player-tb-world | world-bump | 1090 | 1079 | -22 | 101.0% | 14 | 100 | WON — KILL |
| 75108 | 100 | eulogy | player-tb-world | world-bump | 358 | 1204 | 846 | 29.7% | 6 | -3440* | lost |
| 75108 | 102 | eulogy | player-tb-world | world-bump | 151 | 1300 | 1149 | 11.6% | 5 | -10 | lost |
| 75108 | 103 | eulogy | player-tb-world | world-bump | 43 | 1165 | 1122 | 3.7% | 4 | -33 | lost |

\* Fighter HP left below -3000 on 4 fights (75101 d122, 75102 d96,
75104 d164, 75108 d100): the engine's end-state fighter HP there is
not a playable number — the monster keeps hitting a dead fighter,
or a shared object accumulates damage past death. Reported as
recorded; no verdict uses fighter HP, and the anomaly is logged
for a future instrument look (see Metric review). Ordinary lost
TB fights end with the scholar's fighter at or just below 0
(alive False in the closest-loss end record) — losing a TB fight
means the scholar's fighter dies or breaks at 0, which is why
losing fights also end the scholar's day, not just the monster's.
† Reunion instance HP far above the MONSTER-WAVES def band
(1200-1400): d157 starts at 2871 (three reunion fighters in that
fight) and d164 at 3193 (four fighters). Instance HP is what is
measured; def bands are not caps (veteran/titan scaling, pack
fights). The analyzer's damage for a pack fight is against its
first monster fighter only — all four pack fights here dealt 0,
so no verdict number depends on that choice (see Metric review).

### Field fights (33): the short version (full rows in analysis.json)

- Villager-field (24 fights): damage 0-29, max 4.1% of max HP
  (29/700 herald). Median field damage ~13. Outcomes: 17 vFlee,
  4 vDie, 3 mFlee (of which 2 are the d162 evades below).
- Raid-defender (9 fights): damage 0-31, max 4.4% of max HP
  (31/700 herald). Outcomes: 5 vFlee, 3 vDie, 1 mFlee (evade).
- The field never finishes anything on this band: 0 field kills,
  and the largest single field blow is 31 damage against a
  700-1500 HP monster. A villager meeting a wave-4 monster in the
  field deals, at best, a scratch — and usually dies or flees for
  it (7 vDie across field + raid, against 0 kills).
- One field thread matters: seed 75102's herald (seq 24) is fought
  six times in the field/raid (d123-d132) and its HP falls
  700 → 682 → (gap) 507 → 476 → 447 → 432 → (gap) 415 → 225:
  field damage DOES persist across fights for the same instance,
  unlike TB fighter HP (below). Two gaps of exactly 175 HP
  (682→507, 415→240... precisely, 415→240 start on d132) have no
  recorded fight row between them — a recorder gap or an
  unrecorded damage source, flagged here, not explained. The
  herald's story ends unrecorded after d132 (no later fight row
  for seq 24 in the corpus) — whittling without a finish.

### Distribution (56 non-kill, non-evade fights)

Single-fight damage as % of the fight's monster max HP, sorted:
0% ×17, 0.8%, 1.0%, 1.1% ×2, 1.3% ×2, 1.4% ×2, 1.5% ×2, 1.8%,
2.1% ×3, 2.2%, 2.4%, 2.6%, 2.8% ×2, 3.1%, 3.7%, 4.1%, 4.4%, 5.4%,
5.9%, 7.9%, 11.6%, 11.9%, 13.9%, 17.4%, 19.4%, 19.6%, 19.8%, 20.7%,
29.7%, 35.9%, 44.1%, 57.6%, 93.0%.
Median 1.9%, max (non-kill) 93.0%. In plain words: half of all
wave-4 fights that exchange blows deal under 2% of the monster's
health; only 5 of 56 deal over 20%; only 2 deal over 50%. The
damage gap is not "fighters are a little short" — the typical
fight is two orders of magnitude short, and the exception (the
93% eulogy fight) is a single fight that still lost.

### The closest loss, in full (leg (d))

Seed 75104, day 162, Eulogy, player-tb-world via world-bump, 5
rounds: 876 damage dealt against a 942-HP fighter, 66 HP left
(7.0% of max), scholar's fighter at -8 HP (dead) at fight end,
result lost. The monster is oldcore seq 30 (maintain source,
arrived d144). What happened next is the finding, not just the
number:

- The TB loss restored the monster to the world (oldcore kind
  re-entry, d162-d167): the world instance's HP after the loss
  was 66/900 — the TB damage DID write back as absolute HP (66
  in both scales) — and the village met it twice in the field
  on d162, both times at 66 HP, both times 0 rounds, 0 damage,
  monster fled (mFlee). Two meetings with a nearly-dead wave-4
  monster, zero blows struck, both times it walked away.
- On d163 the instance was back at full HP (900/900) in the
  field — the lingering restore healed it completely — and it
  killed a villager that day (vDie, 0 damage dealt, 61 taken).
- The same instance was then fought in TB six more times
  (d163-d168), each time with a FRESH fighter HP (917, 948, 934,
  1093, 1070, 1035, 1030 — rebuilt from the def each fight, never
  carrying the 66 forward), losing all six, and on d168 — the
  village's final day — it melted (oldcore kind
  player-fight-melt: lost-fight dissolution, NOT a kill — no
  kill-log entry, no killer, annotated here as required).
- The d151 audit on the same seed tells the same shape faster:
  TB loss (252 damage, 1031 HP left), then melted (lost-fight
  dissolution, not a kill) the same day.

So the damage gap has two layers: (1) single-fight damage is
usually tiny (median 1.9%), and (2) even the rare near-kill does
not accumulate — TB fighter HP is rebuilt every fight, and the
world instance heals to full on the next day's restore. The only
damage that persists is field damage (the herald whittling) —
and field damage caps at ~31 per fight. Nothing in this band
accumulates toward a kill except the two fights that dealt
100%+ in one go.

### Kills (2) — killer identity, with its caveat

| seed | day | monster | channel | door | dmg / max | rounds | log by / via | end-state of killer |
|---|---|---|---|---|---|---|---|---|
| 75104 | 161 | congregation | other | feast-draw | 1210 / 999 | 8 | onni_korhonen / player | in fallen, vp dead, gateLiving false |
| 75108 | 90 | congregation | player-tb-world | world-bump | 1090 / 1079 | 14 | ines_duarte / player | in fallen, vp dead, gateLiving false |

CAVEAT (stated, not hidden): killer identity here is the kill-log
`by` vid against the END scholar vid. A killer who was the scholar
at kill time but died and was succeeded reads as non-scholar at
end — so "villager" vs "scholar at kill time" cannot be settled
from the end snapshot alone, and no claim is made either way. What
is settled: both kills are TB fights (via 'player'), both monsters
are Congregations, both killers are dead by run end (in fallen) —
so neither kill feeds a living-veterans bar at end, and the
wave-5 veterans bar stays 0 on both seeds. The census family's
"scholar is the only recorded killer identity" is neither
replicated nor contradicted in its strict form: these two kills
have villager vids in the log, but kill-time scholar identity is
unrecorded, so the family statement stands unamended with this
caveat attached.

### The >50% answer (leg (e))

- Literal (all complete non-evade fights, kills included): YES,
  4/58 over 50% of max HP (the 2 kills + the 93.0% eulogy loss +
  the 57.6% eulogy loss).
- Substantive (losing fights only): YES, but barely — 2/56
  (93.0% eulogy, player-tb-world; 57.6% eulogy, non-world-TB
  feast-draw). No contest, field, raid, or other-channel fight
  ever exceeds 19.8% (contest) or 4.4% (field/raid). On the start-HP
  basis the answer is identical (2/56) — no previously-wounded
  monster inflates the count here, because TB fighters start at
  full fighter HP each fight.
- The 44.1% eulogy fight (75104 d164, same seq-30 instance, the
  day after the 93% loss) is the third-closest loss and the last
  fight in which that instance was seriously threatened.

## Parity failure — the diagnosis (leg (c))

The analyzer's parity table (lethality band vs committed channel
corpus, same seeds/policy/substrate) diverges on ALL 8 seeds, not
on one outlier:

- 75101: days 130 vs 131, won 1 vs 0, table 1 vs 0, entered 1 vs 0,
  deaths 25 vs 41, courtship 18 vs 26, fights 6 vs 8.
- 75102: days 171 vs 90, won 0 vs 1, wave 4 vs 3, nationalFinal
  0 vs 1, entered 0 vs 1, deaths 49 vs 27, courtship 30 vs 10,
  fights 25 vs 0.
- 75103: days 180 vs 168, won 0 vs 1, nationalFinal 0 vs 1,
  table 0 vs 1, entered 0 vs 1, courtship 8 vs 15, fights 1 vs 0.
- 75104: days 168 vs 165, table 1 vs 0, deaths 50 vs 29,
  courtship 30 vs 17, fights 21 vs 13.
- 75105: days 30 vs 34, deaths 5 vs 10.
- 75106: days 101 vs 96, deaths 19 vs 26, courtship 8 vs 9.
- 75107: days 124 vs 145, wave 4 vs 3, deaths 23 vs 16,
  courtship 10 vs 8.
- 75108: days 114 vs 169, won 0 vs 1, wave 4 vs 3,
  nationalEver 0 vs 1, nationalFinal 0 vs 1, entered 0 vs 1,
  deaths 39 vs 34, courtship 27 vs 14, fights 8 vs 0.

That is total trajectory divergence, not a wobble. The cause was
isolated BEFORE judging, in three steps, and it is NOT this arm's
recorder:

1. DETGATE (this arm, pre-sweep): baseline (plain tableseat-nowait,
   no recorders) vs wrapped-but-OFF (all seven recorders composed,
   every on-switch unset) on seed 75101: days 130/130, gameDays
   130/130, tsNationalDay 77 both, no diag surface, no wraps —
   PASS. Recorders-OFF do not move the trajectory.
2. CHANNEL RERUN (this arm, diagnostic, same script the channel
   band used, NO tbdmg anywhere): seed 75101 armed on current
   checkout: days 130, won 1, seat lesser, courtship 18, deaths
   25 — EXACTLY this arm's lethality row for 75101, and exactly
   the detgate baseline — and NOT the committed channel row
   (131, lost, courtship 26, deaths 41). A second identical rerun
   produced a byte-identical row (deterministic in this
   environment). So the channel script itself, on current code,
   reproduces THIS band, not the committed corpus.
3. CODE IDENTITY CHECK: git diff between the channel branch tip
   (b693d049a) and this branch tip shows NO differences in
   index.html, src/, scripts/sim-harness.js, or
   scripts/policies/ — only this arm's new files. The committed
   channel corpus is therefore NOT reproducible from the
   committed code on this checkout, for a reason outside this
   arm: either the channel worker's sweep ran against uncommitted
   state in its worktree at 2147Z, or its corpus was carried
   through the coordinator's double rebase from a base whose
   code differed from the rebased tip's code (the rebase replays
   instrument + corpus commits onto a new base; a corpus
   generated on the old base is not re-generated on the new
   one). Either mechanism is pre-existing drift in the census
   family, and it is LOUD here because this arm is the first to
   re-run the same seeds/policy/substrate and compare
   mechanically rather than by eye.

RE-RUN BAND COMPARISON (diagnostic, for the NEXT run's prereg —
NOT this run's verdict): the full channel band was re-run on
current code with the channel script itself (NO tbdmg anywhere;
diagnostic rows in a scratch dir, deleted after comparison; the
rerun log sweep-w4channel-rerun.log is kept). Result: EXACT match
on all 8 seeds between this lethality band (tbdmg ON) and the fresh
channel rerun (tbdmg absent) — per-seed days, gameDays, won,
waveReach, nationalEver/Final, table, entered, deathTotal,
courtship combined, AND wave-4 fight counts by channel, all equal,
with fight totals 6/6, 25/25, 1/1, 21/21, 0/0, 0/0, 0/0, 8/8.
Band summaries agree exactly too (n=8, won 3, median 130d,
nationalEver 6, nationalFinal 3, table 6, entered 3, wave4 6,
wave5 0, deaths 248, courtship 131). Two conclusions follow, both
for the coordinator, neither re-scored into this run's verdict:
(1) the tbdmg recorder ON is trajectory-neutral across the whole
band, not just OFF-neutral on the detgate seed — the parity
failure cannot be laid at this arm's recorder; (2) a future
prereg that judges parity against THIS rerun (or against a
re-proven channel corpus) would pass leg (c) on these exact
numbers, so the damage-gap measurement above is ready to be
judged GO under a re-baselined parity leg. This run does not
grant itself that re-baseline — it reports the numbers and stops.

What leg (c) failure does and does not mean: it does NOT mean
this band's lethality numbers are wrong — they are internally
consistent (detgate PASS, G1 PASS, 61/61 complete, rerun-matched
on 75101) and they answer the damage-gap question on current
code. It DOES mean the prereg's parity leg, as written against
the committed channel corpus, cannot pass, and §14 forbids
re-scoping it mid-run. The coordinator's decision for the next
run is therefore one of: (i) re-baseline parity against a fresh
channel rerun on current code (making this band's numbers the
comparison's second side, not a failed first side), or (ii)
treat the channel corpus as superseded and re-run the channel
census itself. This arm does not make that call — it reports
the diagnosis and stops, per its prereg.

## Sense-testing read (seed 75104, window d105-d168) — leg (f)

Seed rule: closest-loss fight → 75104. Non-measured narration
replay (say/sysSay taps, window d105-d168); replay text proves
wording and presence only, never counts — and the replay
trajectory can shift from the judged run, so beats below are the
village's story in words, not day-exact claims about the corpus.

What the replay actually shows, in the wave-4 window, reads as a
village living its ordinary life next to an unmet horror — and,
unlike the channel band's sense read, with a kill in it:

- The people pass the sense test around the gap: Pamela waters
  and weeds, checks a full pantry ("~216 days of fresh on hand")
  and turns the foraging party back; David and Najat work the
  cookpot, tasting off the spoon; Pamela teaches, Yara learns,
  strangers by the road teach Wound Care and Cordage. Word
  travels (Thornfield festivals, Emberhold riders, the village
  called "the Indispensable"). The village argues about names
  for things and keeps sowing burdock while the monsters pace
  the treeline.
- The wave-4 thread itself reads as dread with one marked
  exception: the Herald "stops at the treeline — pacing,
  unwilling. The walls end the argument. It's still out there"
  (d136, d139, d140), raids allied villages at night while the
  coalition talks (trust -5, repeatedly), and the muster warning
  fires in long identical runs — "You cannot face this alone —
  sound the call, muster 10 allied blades (you have 0). This is
  not courage. This is arithmetic." — repeated dozens of times
  across d137-d147. That repetition is the replay's one robotic
  note: a warning that should fire once fires as a chorus, and
  it drowns the thread it warns about. (Logged as a sense finding,
  not a verdict item.)
- The fight thread reads true at the strike level: on d144 the
  scholar strikes the Congregation for 45, 39, 45, 45, 41 with a
  hunting spear — five strikes totalling 215, exactly the
  census's d144 congregation TB total (215 damage, 16 rounds,
  lost). The replay and the corpus agree on the shape of a
  losing TB fight: many small strikes, monster still standing.
- The kill IS marked: on d161 the replay carries "◈ The Records:
  An apex thing died by village hands: The Congregation. The
  Records hold it up to the light." — the village's one wave-4
  kill on this seed is narrated as a record, not silenced. And
  the cost is marked too: on d163, "💀 The Loud Beast killed
  Aaliyah in 1 round. The village mourns." — the day after the
  kill, a villager dies to a wave-4 monster and the village
  mourns by name.
- What the replay does NOT show: any beat marking the 66-HP
  eulogy (the closest loss) as a near-kill — the village never
  says "we almost had it," and no villager is routed to finish
  it. The sense gap and the census gap are the same gap: the
  village can kill a wave-4 monster (and the Records say so),
  but it has no language — and no behavior — for finishing a
  wounded one.

Sense judgment: the window reads as people with routines,
teaching, rivalries, grief, and one recorded kill — and a monster
that is fought to 66 health, met twice at 66 health without a
blow, healed to full, and never finished. The villagers act like
people everywhere except the one place the census measures: they
do not finish.

## Village assessment (plain words)

Three of these eight villages win through the lesser seat and go
home; four die (one before day 35, one on day 171 after a long
wave-4 war); one survives the horizon without ever sitting the
table. Six reach wave 4, none reaches wave 5, and the full seat is
still nobody's story. The village that fights the most wave-4
fights, 75104, kills one Congregation, nearly kills a Eulogy, and
then dies on the day that Eulogy melts — not killed, just gone,
because a lost fight against a non-lingering monster deletes it
(melted — lost-fight dissolution, not a kill). The village that
fights the second-most, 75102, spends 40 days meeting a Herald
over and over in the field, scratching it from 700 down toward
225, and never finishes it either. If wave 4 is supposed to be
the System building monsters out of us, on this band it built
them, introduced them, let us wound two of them badly — and
watched us finish only the ones we could kill in a single fight.

## Blanks filled or documented

- FILLED (answered, with numbers): the 2357Z round's named next
  blank — the wave-4 lethality census: per-fight damage, rounds,
  monster HP left, fighter HP left, by channel, on a fresh
  measurement of the 75101-75108 band (61 fights, 100% complete
  records); the distribution of single-fight damage vs monster
  max HP (median 1.9%, max non-kill 93.0%); the closest-loss gap
  named in plain words (66 HP left, 7.0%, 75104 d162 Eulogy);
  the >50% question answered (2/56 losing fights, 4/58 counting
  kills); the two kills named with their killer-identity caveat.
- FILLED (mechanism, read from code + corpus): TB fighter HP is
  rebuilt from the def every fight (seq-30 eulogy TB starts
  942/917/948/934/1093/1070/1035/1030 across d162-d168, never
  carrying the 66 forward), while world HP persists across
  field fights (herald 700→225) and TB damage writes back as
  absolute HP (66) before the lingering restore heals to full
  (900) the next day. That is why near-kills do not accumulate
  in TB fights — and why the only accumulating damage (field,
  ≤31/fight) cannot finish either.
- FILLED (negative, measured): field and raid channels never
  exceed 4.4% of a wave-4 monster's max HP in one fight (0/30
  over 50%); contest never exceeds 19.8% (0/2 over 50%). The
  damage gap is a TB story with a field footnote, not a
  field story.
- DOCUMENTED, NOT FIXED (named next blanks): (1) the parity
  failure itself — the census family's committed corpora are not
  reproducible on current HEAD (see diagnosis; coordinator
  decision needed); (2) the herald's two unexplained 175-HP drops
  between recorded field fights (a recorder gap or an unrecorded
  damage source); (3) the deeply-negative TB fighter HP on 4
  fights (instrument-read anomaly, no verdict impact); (4) the
  Herald muster warning's verbatim repetition across days
  (sense finding: a warning that should fire once fires as a
  chorus); (5) pack-fight damage attribution (first-monster-
  fighter only — all pack fights here dealt 0, so no number
  depends on it yet, but a future band with pack damage will).
- CARRIED (not chased here): the empty nonat x w4 class
  (w5chain-a); the panel corpus-ingest mode (tooling blank,
  seventh round — see below); the live rule-(3) firing band (per
  the 2026-10-27 16:02 call, no more low-defiance substrates
  are burned).

## Metric review (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. The run was judged exactly
against its six pre-registered GO legs: (a) PASS, (b) PASS,
(c) FAIL (parity, diagnosed above), (d) computed, (e) answered,
(f) PASS. The verdict is DIAG-NO-GO on leg (c) alone. Two
instrument corrections were made AFTER the sweep and BEFORE
judging, both disclosed here (neither touches the corpus rows,
which are byte-identical to the sweep output):

1. ANALYZER CORRECTION, INSTRUMENT-ONLY, CORPUS UNTOUCHED. The
   analyzer's first pass ranked a KILL (75104 d161 congregation,
   end HP -211) as the "closest loss," because its ranking filter
   excluded evades but not kills. The prereg defines closest loss
   as NON-KILL, non-evade — so the analyzer was fixed to exclude
   kill fights (TB: nonworldkill end newLog w==4 join, or end HP
   ≤ 0; field: kill-log day+mid join, or end HP ≤ 0) and to
   report kills separately. After the fix: closest loss 75104
   d162 eulogy (66 HP left), kills 2, distribution n=56
   (not 58). The sweep corpus was not re-run and no number was
   hand-edited; the analyzer re-derives everything from the raw
   rows, and the corrected analyzer output is the corpus of
   record (analysis.json).
2. PARITY FIELD-NAME FIX, INSTRUMENT-ONLY. The first analyzer
   pass compared a per-seed field named `deaths` against the
   channel row's `deathTotal`, printing lethality=undefined for
   every seed's death comparison. Fixed by carrying `deathTotal`
   explicitly in per-seed rows. The corrected divergences above
   use real death totals (25 vs 41 on 75101, etc.).

Doubts recorded for the NEXT run, never applied here:

1. PARITY BASELINE. A future lethality prereg should pre-register
   its parity baseline as a FRESH rerun on current code (or
   require the channel corpus to be re-proven reproducible
   before parity is judged against it) — judging parity against
   a committed corpus that current code cannot reproduce makes
   leg (c) fail for reasons outside the arm. The re-run band
   comparison in the diagnosis section is the template.
2. KILL-TIME SCHOLAR IDENTITY. The kill log's `by` vid against
   the END scholar vid cannot settle whether a killer was the
   scholar at kill time. A future census that wants killer
   identity should record the scholar vid at kill day (or at
   fight start) in the recorder, not infer it at end.
3. PACK FIGHTS. Multi-monster TB fights (reunion packs of 3-4
   fighters) need a total-damage definition (sum across monster
   fighters, or per-fighter table) before a band with pack damage
   is judged — this band's pack fights all dealt 0, so the gap
   is latent, not active.
4. FIGHTER HP NEGATIVES. Four TB fights show fighter HP below
   -3000 at end. If fighter HP left is ever a verdict input
   (it is not here), the recorder must first establish what
   negative end HP means in the engine (post-death accumulation
   vs shared object) — otherwise the column is descriptive only.
5. PANEL. scripts/balance-panel.js has NO corpus-ingest mode
   for a single-arm census corpus (seventh round with this
   standing exception): the tool builds panels from live roots,
   not census rows. No panel artifact was faked; the sweep
   tables + analyzer outputs are the comparison of record. Same
   standing exception as the census-family corpora.
6. TELEMETRY DEVIATION CHECK (loop body step 10):
   `node scripts/telemetry-check.js --baseline .../telemetry-
   baselines/scale-wall.json --current
   'evidence/2026-10-27/perseed-w4lethality/*.json' --metrics
   national,table,wins,exiled` → 3 LOUD lines (national 12→0,
   table −62% 16→6, wins 16→0, n=10 files). Verdict: KNOWN
   ARTIFACT, no investigation, baseline NOT rolled. Two
   independent reasons, both documented (same as the census
   family): (a) the baseline's own regime note forbids this
   comparison (a ~100%-win winseat suite vs a tableseat-nowait
   census substrate); (b) the field-shape artifact repeats
   (per-seed rows carry nationalEver/entered/won, not top-level
   national/table/wins paths; summary.json + analysis.json are
   the 9th and 10th files). The corpus's real wall numbers are
   nationalEver 6/8, table entered 3/8, wins 3/8. No exiled LOUD
   line.

## Infrastructure notes

- Sweep: scripts/test-w4lethality-sweep.js, 8 seeds, ~14 min
  wall + detgate ~2 min. Corpus: evidence/2026-10-27/
  perseed-w4lethality/ (8 rows + summary.json + analysis.json +
  sense-75104.txt). Analyzer: scripts/test-w4lethality.js
  (proof validator; exit 1 SOLELY on leg (c) parity — all other
  gates PASS, and the analysis.json it writes is complete).
  Sense: scripts/test-w4lethality-sense.js (NON-MEASURED replay
  only, windowed d105-d168).
- Safe-commit index clobber hit the prereg commit (bogus staged
  deletions for all 5 files, commit itself correct) — repaired
  via HEAD-blob cacheinfo, verified status empty + diff HEAD
  empty, before any sweep ran. The evidence commit below must be
  checked the same way before this run is called done.
- No EPERM flap blocked this run's writes; all rows wrote first
  try. One launch-pattern note (for the next worker): a
  `cd X && nohup cmd > log &` line backgrounds the WHOLE cd
  chain (the `&` binds the list, not the command) — the detgate
  launch initially looked dead for that reason and was in fact
  running; the sweep launches used an explicit subshell group
  `(nohup bash -c '...' > log 2>&1 &)` and behaved.
- No jest run: zero src/js changed, and the arm proofs are the
  attributable verification (per the census-family precedent
  for DIAG-only runs). No [needs-eyes] flag applies
  (measurement only, no narration or behavior added — the sense
  script only READS beats on a replay, it adds none to the game).
- Commit: sim-w4lethality, DIAG-NO-GO on leg (c) parity
  (diagnosed as pre-existing corpus drift, not a recorder
  failure), zero src/js diff. Branch ready, pending coordinator
  merge; NOT pushed, NOT bumped, live NOT verified
  (coordinator/ship-loop line, not this arm's).
- Heartbeats: tree heartbeat after registration, mid-sweep, and
  after telemetry — all landed ("heartbeat sim-w4lethality").

## Findings appended to backlog

- [open] census-family corpus reproducibility (this run's leg-(c)
  diagnosis — committed channel corpus not reproducible on
  current HEAD; coordinator decision needed on re-baselining).
- [open] wave-4 near-kill non-accumulation (this run's mechanism
  finding — TB fighter HP rebuilt per fight, world instance
  healed to full on lingering restore; field damage persists
  but caps at ~31/fight).
- [open] herald 175-HP unexplained drops (two gaps of exactly
  175 HP between recorded field fights for seq-24 herald on
  75102, no recorded fight row between them).
