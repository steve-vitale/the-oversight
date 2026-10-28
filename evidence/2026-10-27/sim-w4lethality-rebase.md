# sim-w4lethality-rebase — wave-4 lethality re-measured on the post-wound2 base: GO on all legs, near-kills still do not accumulate

Run: fleshout loop, run fleshout-20261028T0221Z. Axis: scale-onramp
(the blocking axis). Worker: sim-w4lethality-rebase.
Worktree: `~/workspace/worktrees/sim-w4lethality-rebase` (branch
sim-w4lethality-rebase).
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips, no
game lever, no game fix proposed. The deliverable is knowledge: a
wave-4 lethality census re-measured on the post-tackle-wound2 base,
as the next blank named by run fleshout-20261028T0144Z, judged ONLY
against the fresh rebaseline corpus — never against the retired
w4channel-a corpus, never re-scoring the w4lethality DIAG-NO-GO or
the rebaseline GO.

Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-27/sim-w4lethality-rebase-prereg.md (commit
732c4ebe7). Corpus: evidence/2026-10-27/perseed-w4lethality-rebase/
(8 rows + summary.json + analysis.json + sense-75104.txt +
sense-75103.txt). Instruments (copies only, originals untouched):
scripts/test-w4lethality-rebase-sweep.js,
scripts/test-w4lethality-rebase.js (proof validator / analyzer,
exit 0), scripts/test-w4lethality-rebase-sense.js,
scripts/policies/tbdmg-rebase-diag.js (verbatim recorder copy).
Detgate: PASS (seed 75101, baseline vs recorders-OFF: days 132/132,
gameDays 132/132, tsNationalDay 77 both, no diag surface, no wraps
installed, post-setup world 0).

## Plain words first

On the post-wound2 base, wave-4 fights are still almost all hopeless
in the same specific way — and the wound change did not fix the
accumulation problem, because the wound change was never aimed at
the monster's side of the fight. The typical fight scratches the
monster for about 1.6% of its health; half of all fights deal
under 2%. Two fights got past half the monster's health — a
feast-draw Influencer fought down to 279 of 897 health (31% left),
and an Audit fought down to 499 of 1214 (41% left) over 17 rounds.
Neither became a kill, and neither left a wounded monster behind
to finish: the Influencer's fight was a non-world feast fight with
no world instance at all, and the Audit dissolved after the loss
(melted — lost-fight dissolution, not a kill). The band killed
zero wave-4 monsters in 67 fights. And the wound picture has a
sting in it: the scholar walks into turn-based fights already
wounded (as low as 9 health out of 100 on one seed), while the
monster always walks in fresh — its fight health rebuilt from
scratch every time, even when the world monster standing on the
tile is already hurt. Wounds accumulate against the village, never
against the monster.

## Verdict: GO (binding prereg, no re-score)

GO required all six legs (a)-(f). All six pass:

- (a) 8/8 configs valid: PASS. 8 rows, days > 0, every gate + deed
  + damage field present, recorder errors 0 on all seven
  recorders (raftdraft, spawnsrc, oldcore, w5births, defwound,
  nonworldkill, tbdmg-rebase), no overflow. Validator G1 PASS.
- (b) 100% of wave-4 fights have a complete damage record: PASS.
  28/28 TB fights joined start + tbdmg end with monster fighter
  HP at both ends; 39/39 field fights carry defwound damage +
  HP + rounds; field-supplement gaps 0 (every field fight gained
  its vHpLeft). 67/67 fights complete.
- (c) Fight-count/headline parity vs the rebaseline corpus
  explained: PASS (exact). Per-seed days, gameDays, won,
  waveReach, nationalEver/Final, table, entered, deathTotal,
  courtship combined, AND wave-4 fight counts by channel all
  match the rebaseline corpus exactly, under one shared
  vocabulary (see "Parity" below). Detgate PASS proves recorder
  neutrality (132/132, tsNationalDay 77 both).
- (d) Damage distribution vs monster max HP computed, closest-loss
  gap NAMED: computed (see below). Closest loss: seed 75101,
  day 131, Influencer, non-world-TB, 618 damage of 897 max HP
  (68.9%), 279 HP left (31.1%), 9 rounds, fighter HP left -36
  (scholar's fighter dead at fight end). The same fight is the
  closest by HP left AND by % left — there is no second
  candidate to argue about.
- (e) The >50% question answered with counts: YES, twice among
  losing fights (2/67, kills 0 so the literal reading is the
  same 2/67). By channel: non-world-TB 1/2, player-tb-world
  1/25, villager-field 0/35, raid-defender 0/4, other 0/1.
- (f) SENSE: PASS (with the prereg's fallback applied, disclosed
  below). Fixed seed 75104 carries NO wave-4 thread on this
  band (0 arrivals, 0 faced types, won lesser d90 at wave 3),
  so the sense read supplements it with 75103 (9 engaged
  arrivals on both corpora) in this same evidence file — never
  an empty window reported as a reading.

VERDICT: GO. The census is complete; parity holds on the fresh
baseline; the wound2 questions are answered with numbers.

## The band (as pre-registered, VERBATIM substrate)

- Seeds 75101-75108, single arm, tableseat-nowait VERBATIM.
- Horizon 180d DEATH-AWARE (runDays stops on death/win; +10d tail
  max). Sweep wall time ~15 min for 8 seeds (plus detgate ~2 min
  and sense replays).
- Base: e7e7e3472, POST-wound2 — tackle-wound2 (ac9f1987b) is an
  ancestor of the base, and the base also carries the 0144Z
  rebaseline commits. Master did not move under this run; no
  rebase was needed.
- Substrate-activation gate: band courtship combined = 121
  (courtCounters 0, courtAccords 24, courtNational 9, courtGlobal
  5, tended 59, defenseCalls 0, proposedLead 24), seeds active
  8/8 — GATE PASSES (combined > 0 and >= 6/8 active). No inactive
  seed on this band. The courtship total is identical to the
  rebaseline band's (121, 8/8), as exact parity requires.
- Freshness, as disclosed in the prereg (not assumed): this band's
  quantities are re-measured on the post-wound2 base — the
  lethality band's numbers exist on pre-tackle code, not on this
  base, so this corpus is fresh by construction (new sweep, new
  rows). Its headlines diverge from the lethality band on
  trajectory (see "Headline comparison", finding only) while
  matching the rebaseline corpus exactly.

## Wall numbers (THIS band only, never pooled)

| field | this band (75101-75108) | rebaseline band | lethality band |
|---|---|---|---|
| national ever / final | 7/8 / 5/8 | 7/8 / 5/8 | 6/8 / 3/8 |
| table invited / entered | 6/8 / 3/8 | 6/8 / 3/8 | 6/8 / 3/8 |
| wins (lesser / full) | 3/8 (3 / 0) | 3/8 (3 / 0) | 3/8 (3 / 0) |
| wave-4 unlock | 5/8 | 5/8 | 6/8 |
| wave-5 unlock | 0/8 | 0/8 | 0/8 |
| median survival | 162d upper / 154d conventional (days: 90, 114, 132, 146, 162, 177, 180, 180) | 162d upper / 154d conventional | 130d upper / 127d conventional |
| starvation deaths | 2 (both 75108) | 2 | 0 |
| deaths total | 299 | 299 | 248 |

Per-seed ends: 75101 won lesser d132 (wave 4, national); 75102
village-lost d177 (wave 4, global); 75103 survived d180 (wave 4,
regional, table invited, never entered); 75104 won lesser d90
(wave 3, national); 75105 won lesser d162 (wave 3, global); 75106
village-lost d146 (wave 4, regional); 75107 survived d180 (wave 3,
global, never tabled); 75108 village-lost d114 (wave 4, regional).
Arc IV (table entered): 3/8. All three wins are lesser-seat wins.
The full seat is still nobody's story; wave 5 is still unreached.

Death-cause shares (299 deaths): villager combat 106 (35.5%),
villager-vs-villager combat 80 (26.8%), player arena 53 (17.7%),
expedition 22, villager monster 19, ambush 4, villager sickness 3,
player the night 2, player sickness 2, player contest 2, villager
starvation 2, singles (villager alien, The Algorithm, a toad like
a war drum, thirst). Combat-family deaths (villager combat +
villager-vs-villager + player arena + villager monster) are
258/299 (86.3%) of all deaths; starvation is 2 — starvation does
not explain anything on this band either.

## The lethality table (the judged measurement)

67 wave-4 fights with complete damage records: 28 turn-based (TB),
39 field (35 villager-field, 4 raid-defender), of which 0 are
evades and 0 are kills. Every fight below is a loss.

### Turn-based fights (28): damage, max HP, HP left, rounds

| seed | day | monster | channel | door | dmg | max | left | %max | rounds | fighter HP left | result |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 75101 | 131 | influencer | non-world-TB | feast-draw | 618 | 897 | 279 | 68.9% | 9 | -36 | lost |
| 75102 | 166 | audit | player-tb-world | world-bump | 308 | 1211 | 832 | 25.4% | 8 | -3 | lost |
| 75102 | 172 | reunion | player-tb-world | world-bump | 129 | 1203 | 1074 | 10.7% | 4 | -35 | lost |
| 75102 | 172 | reunion | player-tb-world | world-bump | 103 | 1367 | 1264 | 7.5% | 3 | -11 | lost |
| 75102 | 172 | reunion | player-tb-world | world-bump | 0 | 1342 | 1342 | 0% | 5 | -21 | lost |
| 75102 | 172 | reunion | player-tb-world | world-bump | 42 | 1362 | 1320 | 3.1% | 4 | -14 | lost |
| 75102 | 172 | reunion | player-tb-world | world-bump | 16 | 1329 | 1313 | 1.2% | 5 | -32 | lost |
| 75102 | 174 | reunion | player-tb-world | world-bump | 47 | 1200 | 1153 | 3.9% | 3 | -2 | lost |
| 75102 | 176 | eulogy | player-tb-world | world-bump | 74 | 974 | 900 | 7.6% | 5 | -21 | lost |
| 75102 | 177 | suburb | player-tb-world | world-bump | 68 | 1380 | 1312 | 4.9% | 5 | -33 | lost |
| 75103 | 117 | audit | player-tb-world | world-bump | 715 | 1214 | 499 | 58.9% | 17 | -16 | lost |
| 75103 | 118 | eater | player-tb-world | world-bump | 216 | 1060 | 844 | 20.4% | 8 | -11 | lost |
| 75103 | 126 | eulogy | non-world-TB | feast-draw | 367 | 1095 | 728 | 33.5% | 7 | -3639* | lost |
| 75103 | 129 | suburb | player-tb-world | world-bump | 104 | 1438 | 1334 | 7.2% | 11 | -15 | lost |
| 75103 | 159 | algorithm | player-tb-world | world-bump | 0 | 2374 | 2374 | 0% | 3 | -25 | lost |
| 75103 | 160 | suburb | player-tb-world | world-bump | 84 | 2638 | 2554 | 3.2% | 4 | -8 | lost |
| 75103 | 178 | suburb | player-tb-world | world-bump | 0 | 3688 | 3688 | 0% | 2 | -23 | lost |
| 75106 | 89 | eulogy | player-tb-world | world-bump | 80 | 999 | 919 | 8.0% | 6 | -4413* | lost |
| 75106 | 90 | reunion | player-tb-world | world-bump | 58 | 1208 | 1150 | 4.8% | 7 | -24 | lost |
| 75106 | 91 | reunion | player-tb-world | world-bump | 18 | 1325 | 1307 | 1.4% | 5 | -62 | lost |
| 75106 | 99 | algorithm | player-tb-world | world-bump | 0 | 1002 | 1002 | 0% | 5 | -13 | lost |
| 75106 | 129 | eulogy | player-tb-world | world-bump | 174 | 914 | 740 | 19.0% | 4 | -3 | lost |
| 75106 | 130 | eulogy | player-tb-world | world-bump | 23 | 1072 | 1049 | 2.1% | 3 | -3 | lost |
| 75106 | 143 | audit | other | feast-draw | 157 | 1298 | 1111 | 12.1% | 7 | -50 | lost |
| 75106 | 145 | eulogy | player-tb-world | world-bump | 16 | 1158 | 1142 | 1.4% | 4 | -32 | lost |
| 75106 | 146 | eater | player-tb-world | world-bump | 41 | 1281 | 1240 | 3.2% | 5 | -18 | lost |
| 75108 | 100 | reunion | player-tb-world | world-bump | 35 | 1214 | 1179 | 2.9% | 3 | -27 | lost |
| 75108 | 110 | eulogy | player-tb-world | world-bump | 0 | 1034 | 1034 | 0% | 2 | -7 | lost |

\* Fighter HP left below -3000 on 2 fights (75103 d126, 75106 d89):
the same instrument-read anomaly the lethality band logged (the
engine's end-state fighter HP there is not a playable number —
the monster keeps hitting a dead fighter, or a shared object
accumulates damage past death). Reported as recorded; no verdict
uses fighter HP. Ordinary lost TB fights end with the scholar's
fighter at or just below 0 — losing a TB fight means the scholar's
fighter dies or breaks at 0.

### Field fights (39): the short version (full rows in analysis.json)

- Villager-field (35 fights): damage 0-28, max 3.2% of max HP.
  Median field damage 1.05% of max HP. Outcomes: 25 vFlee,
  10 vDie.
- Raid-defender (4 fights): damage 0-33, max 3.5% of max HP
  (30/850 influencer raid; the 33-damage blow is a 1200-HP
  reunion raid at 2.8%).
  Outcomes: 3 vFlee, 1 vDie.
- The field never finishes anything on this band: 0 field kills,
  and the largest single field blow is 33 damage against a
  1200-HP monster. A villager meeting a wave-4 monster in the
  field deals, at best, a scratch — and usually dies or flees
  for it (11 vDie across field + raid, against 0 kills).
- Field damage DOES persist across fights for the same instance
  (see "Wound2 answers" below): the 75106 influencer is whittled
  637 → 607 → 580 → 555 across d96-d99 with no gaps, and the
  75108 eulogy holds its 11 damage (900 → 889) across six
  meetings. But field damage caps at ~33/fight, so persistence
  without a finish is whittling, not accumulation toward a kill.

### Distribution (67 non-kill, non-evade fights — all fights, kills 0)

Single-fight damage as % of the fight's monster max HP, sorted:
0% ×21, 0.7%, 0.9%, 0.9%, 1.1%, 1.1%, 1.1%, 1.2%, 1.2%, 1.4%,
1.4%, 1.5%, 1.6%, 1.6%, 1.7%, 1.7%, 1.8%, 2.2%, 2.2%, 2.2%,
2.6%, 2.8%, 2.9%, 2.9%, 3.1%, 3.1%, 3.2%, 3.2%, 3.5%, 3.9%,
4.8%, 4.9%, 7.2%, 7.5%, 7.6%, 8.0%, 10.7%, 12.1%, 19.0%, 20.4%,
25.4%, 33.5%, 58.9%, 68.9%.
Median 1.6%, TB-only median 4.4%, field-only median 1.1%, max
(non-kill) 68.9%. In plain words: half of all wave-4 fights deal
under 2% of the monster's health; only 5 of 67 deal over 20%;
only 2 deal over 50%. The damage gap is not "fighters are a
little short" — the typical fight is two orders of magnitude
short, and the two exceptions both lost.

### The closest loss, in full (leg (d))

Seed 75101, day 131, Influencer, non-world-TB via feast-draw, 9
rounds: 618 damage dealt against an 897-HP fighter, 279 HP left
(31.1% of max), scholar's fighter at -36 HP (dead) at fight end,
result lost. The same fight is the closest by HP left AND by %
left — no second candidate exists. Its follow-up is nothing: a
non-world feast fight has no world instance, and the run ends
the next day (won lesser d132). The second-closest loss is the
75103 d117 Audit (715 damage, 499 HP left, 41.1% left, 17 rounds)
— and its follow-up is the mechanism finding below.

### Kills (0) — killer identity, with its caveat

Killer identity table: EMPTY. 0 wave-4 kills, so 0 rows in every
identity class and 0 living wave-4 killers at end on every seed
(killerStatus.killers empty on all 8 rows). The wave-5 veterans
bar stays 0 on all 8 seeds — not because killers died (the
lethality band's shape), but because there are no killers at
all on this band, exactly the rebaseline band's shape. The
kill-time scholar-identity question is therefore UNANSWERABLE
from this band (no kills to identify); the lethality band's
caveat — kill-log `by` vid against the END scholar vid cannot
settle kill-time scholar identity — stands unamended, and a
future census that wants killer identity must record the
scholar vid at kill day (or fight start) in the recorder.

### The >50% answer (leg (e))

- Literal (all complete non-evade fights, kills included): YES,
  2/67 over 50% of max HP — the same 2 fights, because kills
  are 0 on this band.
- Substantive (losing fights only): YES, but barely — 2/67
  (68.9% influencer, non-world-TB feast-draw; 58.9% audit,
  player-tb-world). No villager-field, raid-defender, or other
  fight ever exceeds 12.1% (other) or 3.5% (field/raid). On the
  start-HP basis the answer is identical (2/67) — no
  previously-wounded monster inflates the count here, because
  TB fighters start at full fighter HP each fight (see below).

## Parity (leg (c)) — exact, and the 69-vs-67 reconciliation

The analyzer's parity table (this band vs the rebaseline corpus,
same seeds/policy/substrate, one shared vocabulary) matches
EXACTLY on all 8 seeds: days, gameDays, won, waveReach,
nationalEver/Final, table, entered, deathTotal, courtship
combined, and wave-4 fight counts by channel — per-seed fight
totals 1/1, 9/9, 14/14, 0/0, 0/0, 25/25, 0/0, 18/18. Raw row
counts agree too: nonworldkill wave-4 starts 1/9/7/0/0/9/0/2 and
defwound wave-4 rows 0/0/7/0/0/16/0/16 on both corpora, seed by
seed. The detgate (132/132, tsNationalDay 77 both) proves the
rebase recorder stack is trajectory-neutral, and the armed
75101 row equals the detgate baseline 75101 (132) — so
recorders-ON is neutral as well.

One headline needs reconciling, stated plainly so it cannot be
mistaken for a parity gap: the rebaseline evidence reports 69
fight events, while this census counts 67 fights. The difference
is exactly the 2 unlinked raftdraft wave-4 fieldFights the
rebaseline evidence itself flags as a recorder-gap measure
(75102: 1 raft wave-4 row vs 0 defwound rows; 75103: 8 raft
rows vs 7 defwound rows). The lethality analyzer counts fights
from nonworldkill starts + defwound rows, not from raftdraft
fieldFights — so under the parity vocabulary the count is 67
on both sides, and the 2 extra raft rows are present in BOTH
corpora (this band's rows carry the same 1 + 8 raft counts).
Parity is exact; the 69 is a different counting rule, not a
divergence.

## Headline comparison vs the lethality band (finding only)

This run does NOT re-judge the lethality arm. The comparison
below is a finding about checkout drift, reported because the
task requires it. Per-seed headlines, lethality → this band
(days / won / wave / deaths / courtship / wave-4 fights):

- 75101: 130 → 132, won 1 → 1, wave 4 → 4, deaths 25 → 34,
  court 18 → 7, fights 6 → 1.
- 75102: 171 → 177, won 0 → 0, wave 4 → 4, deaths 49 → 42,
  court 30 → 8, fights 25 → 9.
- 75103: 180 → 180, won 0 → 0, wave 4 → 4, deaths 50 → 50,
  court 8 → 8, fights 1 → 14.
- 75104: 168 → 90, won 0 → 1, wave 4 → 3, deaths 50 → 24,
  court 30 → 24, fights 21 → 0.
- 75105: 30 → 162, won 0 → 1, wave 1 → 3, deaths 5 → 36,
  court 0 (inactive) → 27, fights 0 → 0.
- 75106: 101 → 146, won 1 → 0, wave 3 → 4, deaths 19 → 40,
  court 8 → 23, fights 0 → 25.
- 75107: 124 → 180, won 1 → 0, wave 4 → 3, deaths 23 → 31,
  court 10 → 12, fights 0 → 0.
- 75108: 114 → 114, won 0 → 0, wave 4 → 4, deaths 39 → 42,
  court 27 → 12, fights 8 → 18.

No seed matches the lethality band fully; days match on only
2/8 (75103, 75108). That is total trajectory divergence from the
pre-tackle band — and it is EXPECTED, not mysterious: this band
measures post-wound2 code (tackle landings in it, including the
joint-foraging-outing system and field/convo changes the
rebaseline run already diagnosed as the drift source), while the
lethality band measured pre-tackle code. The rebaseline band is
the correct comparison for this base, and it matches exactly.

## Wound2 answers (measured, not assumed)

### 1. TB monster fighter HP is rebuilt per fight — proven in the start record itself

For every world-origin TB fight, the start record carries BOTH
the world instance (tileMonster hp/maxHp) and the TB fighter
(monster fighter hp/maxHp) — and they differ, every time the
world instance is wounded:

- 75103 d117 audit: world instance 825/1100, TB fighter
  1214/1214. The TB fight starts the monster at full fighter
  HP (1214), ignoring the world instance's 825.
- 75102 d172 reunion (same seq 21, five fights one day): world
  instance 300/1200 at the first fight, TB fighters
  1203/1367/1342/1362/1329 — five fresh fighters, 290 total
  damage across them, zero accumulation.
- 75106 eulogy seq 55/57: world instance 675/900 at every TB
  fight, TB fighters 914/1072/1158 — rebuilt each time, never
  carrying the 675 forward.

TB damage therefore cannot accumulate across fights by
construction: each fight starts the monster whole, whatever
the world says. (Fighter maxHp itself varies fight to fight —
1214 vs 1100 world max for the audit — because fighter HP is
built from the def plus fight scaling, not copied from the
world instance. Def bands are not caps and not copies.)

### 2. Player fighter HP DOES carry wounds into TB fights — the asymmetry

The scholar's fighter enters TB fights below max HP in 10/28
fights: 75 (75101 d131), 78 (75102 d177), 80/95/98/77 (75103
d117/d129/d159/d178), 46/90 (75106 d89/d99), 57/9 (75108
d100/d110). The lowest, 75108 d110, walks into a eulogy fight
at 9/100 HP and deals 0 damage in 2 rounds. CAVEAT (stated, not
hidden): this band alone cannot prove wound2 CAUSED these
below-max entries — the lethality evidence reports TB fighter
HP only at fight END, so no pre-wound2 TB-start-HP table exists
to compare against. What this band proves is the ASYMMETRY:
whatever wounds the scholar, the scholar carries them into the
next TB fight, while the monster never does. A future arm that
wants the causal wound2 claim needs a pre/post TB-start-HP
comparison on identical seeds, not this band's snapshot.

### 3. World-instance HP persists across field fights — but with unrecorded drops

Field chains by instance (seq) show exact persistence wherever
fights are adjacent: 75106 influencer 637 → 607 → 580 → 555
(d96 raid, d97, d99 — every start equals the previous end);
75108 eulogy 900 → 889 held across six meetings; 75103 strike
1000 → 984 → 966. Field damage persists. But five inter-fight
drops have NO recorded fight row between them — the gap class
from the lethality band, recurring on new instances:

- 75106 seq 47 algorithm: d96 991 → d97 741 (delta -250).
- 75106 seq 55 eulogy: d127 900 → d129 740 (delta -160).
- 75106 seq 57 eulogy: d140 900 → d144 675 (delta -225).
- 75108 seq 28 reunion: d95 1154 → d100 854 (delta -300).
- 75108 seq 29 reunion: d89 1170 → d98 870 (delta -300).

No TB start for those seqs falls inside the gap intervals
(checked), so the drops are not TB damage written back — they
are an unrecorded damage source or unrecorded fights, same
class as the lethality band's herald gaps, different
magnitudes. One within-day wobble sharpens the point: 75106
seq 55 reads 740 in the field and 675 in TB on the same day
(d129) — the world instance's HP moved 65 points between two
same-day readings with no row explaining it.

### 4. Near-kills do not accumulate — the two >50% fights, followed

- 75101 d131 influencer (68.9%): non-world feast fight, no
  world instance, run ends d132 in a lesser win. Nothing to
  accumulate into, and nothing follows.
- 75103 d117 audit (58.9%, 715 damage, 499 left): oldcore
  tbEnd d117 seq 48, kind player-fight-melt, restored FALSE.
  The instance dissolved after the loss — the 499 HP did not
  persist anywhere, and no later audit fight on 75103 exists.
  The near-kill's damage died with the fight.
- The same shape repeats everywhere a TB loss ends an instance:
  75103's eater (20.4%, d118) was restored (re-entry) but then
  departed d119 (departure-lost-trail), never fought again;
  75102's reunion seq 21 was fought six times (d172 ×5, d174)
  and melted d174; 75103's suburb seq 43 melted d129, algorithm
  seq 59 melted d159, suburb seq 64 melted d179. On this band,
  a TB loss ends in melt (dissolution) or departure far more
  often than in a wounded instance left to finish — and a
  melted instance cannot be finished at all.

So the wound2 answer, in one sentence: field-wound carryover
changed the HUMAN side of the accumulation picture (the
scholar enters fights wounded), but the MONSTER side is
unchanged from the lethality band — TB fighter HP rebuilt per
fight, world instances melting or departing after TB losses,
field damage persisting but capped at ~33/fight. Near-kills
still do not accumulate.

### 5. Herald check: NOT FOUND (with the reason, never silently dropped)

The open backlog item — Herald 175-HP unexplained drops between
recorded field fights on 75102 — does NOT recur on this band,
because there is no herald fight thread to recur in: ZERO
herald field rows and ZERO herald TB starts on all 8 seeds,
even though heralds are born on three seeds (75102 seq 23 d155,
75103 seq 39 d82, 75106 seq 48 d97) and are still present at
run end at full 700 HP on all three. The herald on this band
never fights the village at all: it raids allied villages at
night (see Sense) and stands at the treeline at full health.
The 175-HP drops themselves are therefore NOT re-checked —
nothing on this band plays the herald's lethality-band role —
but the GAP CLASS recurs on five other instances (see §3
above), with drops of -160/-225/-250/-300/-300. The backlog
item should be re-framed, not closed: the question is no longer
"the herald's 175-HP drops" but "unrecorded inter-fight damage
on wave-4 instances generally."

## Sense-testing read — leg (f)

Seed rule per this prereg: fixed seed 75104, with the 0144Z
fallback. Non-measured narration replays (say/sysSay taps);
replay text proves wording and presence only, never counts —
and the replay trajectory can shift from the judged run, so
beats below are the village's story in words, not day-exact
claims about the corpus.

### 75104: the absence (window d60-d90, replay file sense-75104.txt)

Corpus facts for 75104 on this band: 0 wave-4 arrivals, 0 faced
types, won lesser d90 at wave 3. The replay agrees: ZERO
mentions of the Mirror Draft or wave 4 across the window, 3
fight-start lines (d66, d78, d85 — all pre-wave-4 fights), and
the ending beat on d90: "◈ THE AUDIT — the System reads your
run back to you, and the galaxy listens. A lesser seat —
national standing, waves 1–3 faced (16/7/5), 9 contests
survived, 3 crises weathered. The table does not rise. It
prices." The village wins before wave 4 exists for it — the
lesser seat is an exit from the funnel, not a step through it
(same finding as the rebaseline sense read, same seed, same
days). The people pass the sense test around the gap: Emilio
cooks, checks a full pantry (~41 days fresh), and turns the
foraging party back; the village argues about names for things
and keeps sowing while wave-3 monsters pace the treeline.

### 75103: the supplement (window d60-d180, replay file sense-75103.txt)

Corpus facts for 75103 on this band: 15 wave-4 arrivals, 9
engaged arrivals (strike, suburb, audit, eater, influencer,
algorithm, suburb, eulogy, suburb — the same 9 as the
rebaseline corpus), 14 lethality-vocabulary fights, 0 kills.
The replay carries a real wave-4 thread:

- The opening is marked: d68, "📡 RATINGS ARE UP... Wave 4
  talent has been released. The Mirror Draft opens." and "We've
  been watching you for a LONG time. Your faiths. Your formats.
  Your little institutions. So we built something out of...
  well. Out of YOU. Say hello to the MIRROR DRAFT."
- The monsters pace and threaten in character: the Strike
  musters the village inside on d70 ("it is beyond us. Everyone
  inside. No one walks the treeline alone"); the Eater "stops
  at the treeline — pacing, unwilling. The walls end the
  argument. It's still out there" (d114-d118); the Eulogy is
  drawn by the feast on d126 ("It followed the feast here. ...
  Face it while the feast is in you — or let the watch drive
  it off.").
- The fight thread reads true at the strike level on the
  corpus-matched days: TB fights open d117 and d118 in the
  replay, the corpus's audit and eater fight days — though the
  replay's strike numbers are its own (the replay trajectory
  shifts; counts are never taken from it).
- The Herald is the thread's ghost: it raids allied villages
  at night again and again — Thornfield, Stonebridge, Emberhold
  (trust -5, repeatedly, d92-d177) — while the village itself
  never fights it. That matches the corpus exactly: herald
  present at full 700 HP at end, zero herald fights. The
  village hears about the Herald constantly and never meets
  it; the allies bleed while the coalition talks.
- The cost is marked by name: "💀 The Algorithm killed Elijah
  in 1 round. The village mourns." The village that fights
  wave 4 and kills nothing still buries people to it.
- What the replay does NOT show: any beat marking a near-kill
  — no "we almost had it," no villager routed to finish a
  wounded monster, no mention of the 499-HP audit after d117.
  The sense gap and the census gap are the same gap: the
  village can wound a wave-4 monster badly, and it has no
  language — and no behavior — for finishing it.

Sense findings (not verdict items): (1) the cook-line chorus
— "Everett cooked for the haven — meals stretched." repeats
several times per day, same class as the rebaseline sense
finding; (2) the keepsake echo — "Your gifts are not mastered
— but they are lived-in... The feast was the weapon." repeats
verbatim daily; (3) the treeline chorus — "stops at the
treeline — pacing, unwilling. The walls end the argument.
It's still out there." repeats for monster after monster,
which reads as dread the first time and as a template the
tenth; (4) the fight-start line is identical every time
("Turn-based now. Tap a tile to move — speed is squares.
Then act.", 33 times on 75103) — functional, but robotic as
a line. The window reads as people with routines, teaching,
rivalries, grief, and a priced ending — and a Mirror Draft
that wounds them, melts away, and is never finished.

Sense judgment: the villagers act like people everywhere
except the one place the census measures: they do not finish.

## Village assessment (plain words)

Three of these eight villages win through the lesser seat and go
home — one of them (75104) in just 90 days, without ever meeting
a wave-4 monster. Three more die (75102 after a long wave-4 war
at day 177, 75106 at day 146, 75108 at day 114), and two survive
the horizon without ever sitting the table (75103, invited but
never entered; 75107, never even invited). Five reach wave 4,
none reaches wave 5, and the full seat is still nobody's story.
The villages that DO reach wave 4 fight it hard — 75106 fights
25 wave-4 fights across 13 arrivals, 75108 fights 18 across 15,
75103 fights 14 across 15 — and kill nothing. The monsters that
die on this band die in no channel, because there are no deaths
to channel. If wave 4 is supposed to be the System building
monsters out of us, on this band it built them, introduced them
to four villages, let those villages wound two of them past
half health — and watched every single one of them walk away,
melt, or depart, unkilled. And the other four villages never met
them at all, because the lesser seat ended their stories first
or the horizon ended them at wave 3. Wound2 changed who walks
into the fight hurt. It did not change whether the monster can
be finished.

## Blanks filled or documented

- FILLED (answered, with numbers): the 0144Z round's named next
  blank — the wave-4 lethality census re-measured on the
  post-wound2 base: per-fight damage, rounds, monster HP left,
  fighter HP left, by channel, on a fresh measurement of the
  75101-75108 band (67 fights, 100% complete records); the
  distribution of single-fight damage vs monster max HP (median
  1.6%, max non-kill 68.9%); the closest-loss gap named in plain
  words (279 HP left, 31.1%, 75101 d131 Influencer); the >50%
  question answered (2/67, both losses, 0 kills); parity vs the
  fresh rebaseline corpus proven exact.
- FILLED (mechanism, read from code + corpus): TB monster
  fighter HP is rebuilt from the def every fight (tileMonster
  vs fighter HP mismatch inside single start records); player
  fighter HP enters TB fights below max in 10/28 fights (the
  wound-carryover asymmetry, with its causal caveat stated);
  world-instance HP persists across field fights but with
  unrecorded inter-fight drops; TB losses end in melt or
  departure, not in wounded instances left to finish.
- FILLED (negative, measured): field and raid channels never
  exceed 3.5% of a wave-4 monster's max HP in one fight (0/39
  over 50%); the other channel never exceeds 12.1% (0/1 over
  50%). The damage gap is a TB story with a field footnote,
  not a field story.
- DOCUMENTED, NOT FIXED (named next blanks): (1) the unrecorded
  inter-fight damage class — five drops (-160/-225/-250/-300/
  -300) with no recorded fight row between them, plus a
  same-day 65-HP wobble on 75106 seq 55 (the herald item
  re-framed, not closed — see Herald check); (2) the deeply-
  negative TB fighter HP on 2 fights (instrument-read anomaly,
  no verdict impact); (3) the sense-replay repetition notes
  (cook line, keepsake echo, treeline chorus, identical
  fight-start line); (4) the TB-start-HP causal gap — whether
  wound2 caused the below-max player entries needs a pre/post
  TB-start-HP comparison on identical seeds, which no prior
  band recorded.
- CARRIED (not chased here): the empty nonat x w4 class
  (w5chain-a); the panel corpus-ingest mode (tooling blank,
  see below); the live rule-(3) firing band (per the 2026-10-27
  16:02 call, no more low-defiance substrates are burned).

## Metric review (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. The run was judged exactly
against its six pre-registered GO legs: (a) PASS, (b) PASS,
(c) PASS (exact), (d) computed, (e) answered, (f) PASS (with
the prereg's fallback applied and disclosed). The verdict is
GO. Two judgment notes, both disclosed, neither a re-score:

1. PARITY VOCABULARY. Leg (c) is judged under the lethality
   analyzer's vocabulary (nonworldkill starts + defwound rows),
   applied identically to both corpora. The rebaseline
   evidence's headline 69 counts 2 additional raftdraft
   fieldFight rows that carry no seq join; those rows are
   present in both corpora and are not fights in the parity
   vocabulary. A future prereg that wants the raft rows counted
   should define fight-counting to include them explicitly —
   this run does not re-define the count mid-run.
2. SENSE FALLBACK. Leg (f) was satisfied via the prereg's own
   fallback (75104 absent → 75103 supplement), not via a
   re-reading of the leg. The fallback was pre-registered in
   this run's prereg (carried from the rebaseline metric-review
   note 1), so it is a prereg application, not a revision.

Doubts recorded for the NEXT run, never applied here:

1. TB-START-HP CAUSAL CLAIM. A future arm that wants to say
   "wound2 causes X" needs TB-start-HP recorded on a pre-wound2
   band for comparison. This band's below-max player entries
   (10/28) are a snapshot, not a before/after.
2. UNRECORDED DAMAGE. The five inter-fight drops need a
   recorder that sees what moves world HP between field rows
   (offscreen fights? TB write-back? decay?) before any gap is
   closed. The drops are measured; their cause is not.
3. KILL-TIME SCHOLAR IDENTITY. Still unrecorded (see Kills).
   A future census that wants killer identity should record
   the scholar vid at kill day in the recorder.
4. PACK FIGHTS. Multi-monster TB fights (reunion packs) need a
   total-damage definition before a band with pack damage is
   judged — this band's pack fights (75102 d172 reunion ×5,
   75103 suburb packs) dealt damage through single-monster
   fighter rows only, and the analyzer attributes damage to
   the fought monster's first fighter, as the lethality arm
   did. No verdict number depends on a pack total here.
5. PANEL. scripts/balance-panel.js has NO corpus-ingest mode
   for a single-arm census corpus (standing exception,
   fourth-plus round): the tool builds panels from live roots,
   not census rows. No panel artifact was faked; the sweep
   tables + analyzer outputs are the comparison of record.
6. TELEMETRY DEVIATION CHECK (loop body step 10):
   `node scripts/telemetry-check.js --baseline .../telemetry-
   baselines/scale-wall.json --current
   'evidence/2026-10-27/perseed-w4lethality-rebase/*.json' --metrics
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
   nationalEver 7/8, table entered 3/8, wins 3/8. No exiled LOUD
   line.

## Infrastructure notes

- Sweep: scripts/test-w4lethality-rebase-sweep.js, 8 seeds,
  ~15 min wall + detgate ~2 min + sense replays. Corpus:
  evidence/2026-10-27/perseed-w4lethality-rebase/ (8 rows +
  summary.json + analysis.json + sense-75104.txt +
  sense-75103.txt). Analyzer: scripts/test-w4lethality-rebase.js
  (proof validator; exit 0, all gates PASS). Sense:
  scripts/test-w4lethality-rebase-sense.js (NON-MEASURED replay
  only; 75104 window d60-d90, 75103 window d60-d180).
- Run logs kept alongside the evidence (not in the corpus dir):
  evidence/2026-10-27/sim-w4lethality-rebase-detgate.log,
  sim-w4lethality-rebase-sweep.log,
  sim-w4lethality-rebase-analyzer.txt,
  sim-w4lethality-rebase-sense.log.
- Safe-commit index clobber hit the prereg commit (bogus staged
  deletions for all 5 files, commit itself correct) — repaired
  via HEAD-blob cacheinfo, verified status empty + diff HEAD
  empty, before any sweep ran. The evidence commit below must
  be checked the same way before this run is called done.
- No EPERM flap blocked this run's writes; all rows wrote first
  try. Launch pattern: explicit subshell groups
  `(nohup bash -c '...' > log 2>&1 &)` throughout, per the
  census-family note.
- Proof-timestamp hygiene: the analyzer ran ONCE for judging;
  analysis.json's `generated` field is that run's timestamp and
  was not rewritten after. No timestamp churn to strip.
- No jest run: zero src/js changed, and the arm proofs are the
  attributable verification (per the census-family precedent
  for DIAG-only runs). No [needs-eyes] flag applies
  (measurement only, no narration or behavior added — the sense
  script only READS beats on a replay, it adds none to the game).
- Commit: sim-w4lethality-rebase, GO on all legs, zero src/js
  diff. Branch ready, pending coordinator merge; NOT pushed,
  NOT bumped, live NOT verified (coordinator/ship-loop line,
  not this arm's).
- Heartbeats: tree heartbeat after registration, mid-sweep,
  and after sense — all landed ("heartbeat
  sim-w4lethality-rebase").

## Findings for the coordinator (NOT appended by this worker)

- [open] 2026-10-27 — unrecorded inter-fight damage on wave-4
  instances — five drops (-160/-225/-250/-300/-300) between
  recorded field fights with no recorded fight row between them,
  plus a same-day 65-HP wobble (this run's wound2 §3; the
  herald-175 item re-framed, not closed).
- [open] 2026-10-27 — TB-start-HP causal gap for wound2 — below-max
  player fighter entries (10/28) need a pre/post comparison on
  identical seeds before any causal wound2 claim (this run's
  wound2 §2 caveat).
- [open] 2026-10-27 — herald never fought on the post-wound2 band
  — heralds born on 3 seeds, still present at full 700 HP at end,
  zero herald fights (this run's Herald check).
