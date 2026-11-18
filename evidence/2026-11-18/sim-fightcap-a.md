# sim-fightcap-a — evidence

Run fleshout-20261118T1415Z, Loop A (axis scale-onramp). Branch
`sim-fightcap-a`, base master (substrate merge d03754334 of
`sim-launchparty-sense-a` tip d01eaf0a5; this run's own work in
separate commits after that merge, scripts/evidence/prereg only — NO
src/js changes of its own). Worktree
`~/workspace/worktrees/sim-fightcap-a`. Prereg:
`evidence/2026-11-18/sim-fightcap-a-prereg.md` (frozen 2026-11-18
~14:40 UTC, before any new sim). Analyzer:
`scripts/analyze-fightcap-a.js` (selftest 20/20). Analysis:
`evidence/2026-11-18/fightcap-a-analysis.json` (fresh band),
`evidence/2026-11-18/fightcap-a-1015z-analysis.json` (1015Z
re-analysis).

## 1. The question

**Finding #2538 (the arrival price):** once the sense fix makes the
launch party the meeting party, the gate stops holding them back and
launched parties fight wave-4 monsters — and die. This diag run asks
whether launched parties CAN win wave-4 fights, and decomposes every
engaged launched meeting on two bands: party size/composition, each
member's gear/armor/abilities/HP, monster kind + HP, damage dealt by
the party vs damage taken, rounds, outcome, and whether the gate
should have held them back.

**Substrate (both legs):** the sense fix (HELD branch
`sim-launchparty-sense-a`, merged, not landed by this run) +
`VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 FIGHTALLY2=1`,
`LAUNCHPARTY=1` arm only; competent policy; 150d death-aware. Legs
differ ONLY by env. The coordinator lands only the diag commits,
never the substrate merge.

## 2. Verdict — DIAG-GO (thin pool; the decomposition answers the question)

| Bar | ctl | arm | Requirement | Result |
|---|---|---|---|---|
| Pool floor (trio+ engaged, present) | 0 | 3 | arm ≥ 10 | **FAIL — thin pool** |
| Win share (trio+) | n/a | 0.000 (0/3) | arm ≥ 0.50 | FAIL |
| Community loss | 0.500 (4/8) | 0.250 (2/8) | arm ≤ ctl + 0.125 | PASS |
| Villager starvation | 3 | 5 | arm ≤ ctl + 2 | PASS (exactly at the boundary) |
| Median survival | 145d | 150d | ratio ≥ 0.80 | PASS (1.03) |
| Instrument errors | 0 | 0 | 0 | PASS |

The trio+ pool is thin (3 arm meetings, 0 ctl) — as the prereg
anticipated from the 1015Z band (2 arm / 1 ctl). The frozen
DIAG-GO path applies: the pair-inclusive secondary population
reaches n = 22 arm (≥ 10) with win share 0.182 (< 0.50) and kill
share 0.091 (≤ 0.10) — the decomposition answers the question
decisively on the powered population. **Verdict: DIAG-GO.**

The answer, in one line: **launched parties almost never win
wave-4 fights — and when they do, it is one specific party shape,
not the typical launched party.** The binding link is FIGHT
CAPABILITY (damage output per round vs monster HP), not gate
calibration and not party size. §5 has the numbers; §10 names the
next arm.

## 3. The 1015Z re-analysis (existing corpora, not judged)

Analyzer run on the 1015Z pilot-band corpora (seeds 104401–104408):

| Population (arm leg) | n | Wins | Win share | Kill share |
|---|---|---|---|---|
| Trio+ (size ≥ 3, present, engaged) | 2 | 0 | 0.000 | 0.000 |
| Pair-inclusive (size ≥ 2, present, engaged) | 12 | 2 | 0.167 | **0.000** |
| Ctl pair-inclusive | 5 | 0 | 0.000 | 0.000 |

- No launched expedition party killed a wave-4 monster on either
  leg, in any cut (0/17 engaged launched meetings). The only two
  "wins" are 1-round Stare Down scare-offs (0 damage dealt).
- Damage: vFlee meetings dealt ~34 dmg/round party-wide; at that
  rate they would need ~37 rounds to kill a ~1130-HP monster
  (median 36.6). Canon wave-4 is a 4–6 round fight at ~220
  dmg/round for a godhood build.
- Gate: all 10 arm losses have gate result `null` (9) or `seek`
  (1) — ZERO losses where the gate said `avoid`. Every losing party
  passed the gate's bars (allArmed + allArmored true; party size 3).
- Fleeing parties took only ~66 damage over ~5.4 rounds and fled
  while alive; the one death (maya_singh vs The Eulogy, 11 rounds,
  2085 taken, 54% of monster HP dealt) stayed and died.
- Abilities do not discriminate: losing meetings average 1.8
  abilities/member; a meeting with 3.67 abilities/member (purify,
  rage, war_cry, pack_hunt) still fled after 5 rounds at 21% damage.

## 4. Fresh pilot — before / after on identical seeds (8 seeds, 104501–104508)

Pilot logs: `fightcap-a-{ctl,arm}.log/.err`. Ctl leg: 8/8 seeds,
DRIVER_EXIT=0, 0 instrument errors. Arm leg: 8/8 seeds,
DRIVER_EXIT=0, 0 instrument errors. Corpus flags verified per file:
ctl `launchpartyOn` false, arm true; `fightally2On` true both legs;
wiringSha 159bca02f0a0 both legs (the sense fix present in code).

| Seed | ctl days / standing / wave | arm days / standing / wave |
|---|---|---|
| 104501 | 150d survived, 305, wave 5 | 150d survived, 330, wave 5 |
| 104502 | 150d survived, 199, wave 4 | 150d survived, 199, wave 4 |
| 104503 | 150d survived, 295, wave 5 | 132d village-lost, 540, wave 5 |
| 104504 | 73d village-lost, 150, wave 4 | 73d village-lost, 150, wave 4 (identical trajectory) |
| 104505 | 140d village-lost, 345, wave 5 | 150d survived, 365, wave 5 |
| 104506 | 138d village-lost, 199, wave 4 | 150d survived, 395, wave 5 |
| 104507 | 92d village-lost, 265, wave 5 | 150d survived, 199, wave 4 |
| 104508 | 150d survived, 400, wave 5 | 150d survived, 450, wave 5 |

**The arrival price did NOT reproduce on this band.** Community
loss is LOWER on the arm (2/8 vs 4/8); the arm survives longer
(median 150d vs 145d) and reaches higher standing on 6/8 seeds.
The 1015Z price (3 extra villages lost) was a band outcome, not a
law of the fix — on fresh seeds the sense fix costs no villages.
Starvation is at the cost-bar boundary (arm 5 vs ctl 3, bar +2):
worth watching, not headroom. One arm village (104503) reached
standing 540 — the band's highest — and still died at 132d.

## 5. The decomposition (fresh band)

### 5.1 The populations

| Population | ctl n | arm n | arm wins | arm win share | arm kill share |
|---|---|---|---|---|---|
| Trio+ (size ≥ 3, present, engaged) | 0 | 3 | 0 | 0.000 | 0.000 |
| Pair-inclusive (size ≥ 2, present, engaged) | 4 | 22 | 4 | 0.182 | 0.091 |

Funnel (arm): 45 launched expedition meetings → 6 no launch plan →
34 pair launches → 0 party-absent → 2 evades → 3 trio+ engaged
(22 pair-inclusive engaged). Ctl: 29 meetings → 3 no plan → 20
pair → 6 party-absent → 0 evades → 0 trio+ engaged (4
pair-inclusive). The sense fix produces more launched meetings
(45 vs 29 encounters) and the launched party is present in all of
them (party-absent 0 arm vs 6 ctl); the trio+ pool stays thin
because most launches are pairs — the gate's planParty usually
reflects a later pair re-launch (plan.party is overwritten on every
re-launch).

### 5.2 The damage race — the binding link

Damage dealt per round (mDealt / rounds), arm pair-inclusive:

| Outcome | n | dmg/round (mean) | rounds (mean) | monster HP (mean) |
|---|---|---|---|---|
| vKill (party kills) | 2 | **111.4** | 10.5 | — (recorder gap, see §11) |
| vFlee (party flees) | 15 | 61.0 | 5.4 | 1201 |
| vDie (fighter dies) | 3 | 39.7 | 5.3 | 1395 |
| mFlee (monster leaves) | 2 | 0.0 | 1 | 969 |

At the fleeing parties' observed rate they would need **~39
rounds** to kill a ~1200-HP monster (median 18.7 — the mean is
dragged by the slowest races). The winning parties dealt ~111
dmg/round and won in 9–12 rounds. The canon godhood bar is ~220
dmg/round for a 4–6 round fight. So the ladder is: typical launched
party ~40–60/round and flees at ~5 rounds; a winning party ~110/
round and wins in ~10 rounds; a godhood build ~220/round and wins
in ~5 rounds. The gap between a typical launched party and a
winning one is ~2× damage output — not 10×, and not a gear or size
gap (below).

Combined across BOTH bands (arm pair-inclusive): n=34, wins 6
(2 kills + 4 scare-offs/talk-downs), **kill share 0.059**,
win share 0.176. Ctl combined: n=9, wins 0, kills 0.

### 5.3 The two wins — one party shape, not the typical party

Both genuine kills are the SAME party on seed 104505, three days
apart — Cooper (gen_licpym3, the fighter on d69) + James
(james_okonkwo, the fighter on d72) + Connor (gen_xukj62v):

- d69 vs The Eulogy: 9 rounds, mDealt 984, vTaken 72. Cooper
  opens with a bow (51 damage over 4 shots), then **Rage: strikes
  for 78 at x2.5**, three rounds running. James joins and strikes
  for 30 at x1.3; Connor joins.
- d72 vs The Suburb: 12 rounds, mDealt 1362, vTaken 53. James
  opens with a bow (63), then steady 21–32/round strikes from all
  three, Cooper's 32s carrying.

What made them win: a **combat-multiplier ability (Rage x2.5)** on
the fighter, a **ranged opening** (bow, ~50–60 damage before melee),
and **three contributors every round** (fighter ~60–80% of strike
damage, allies the rest — no passenger). No other launched party
in either band had that shape. The losing parties' fighters
typically dealt 10–26 per strike with no multiplier, and their
allies contributed ~40% combined — in one 12-round meeting the
allies dealt 0 parsed strikes (104404 d87, 1015Z; see §11).

### 5.4 The losses — the gate never held any of them back

All 18 arm pair-inclusive losses have gate result `null` — ZERO
`avoid`, ZERO `seek`. (Trio+: all 3 losses `null`.) The gate's
bars (party size 3, allArmed, allArmored) pass for every losing
party: min armorP 17.7–28.3, mean armorP 23–35 across the loss
outcomes. The gate cannot be the fix by itself: a party the gate
calls ready still loses 82% of its fights. Gate calibration would
only help if the gate demanded something the losing parties lack
and the winning parties have — and the discriminator in the data is
damage output (Rage + bow + three contributors), which the gate
does not measure at all.

Losses by monster (arm pair-inclusive): reunion 0–4, algorithm
0–3, congregation 0–3, eulogy 1–2, rerun 0–1, spoiler 0–1, audit
0–1, editor 0–1, cancellation 0–1, influencer 0–1. Broad, not one
monster. Wins: eulogy 1, suburb 1, eater 2 (both 1-round
talk-downs).

### 5.5 The near-win death — the race, not the armor

Seed 104506 d92, Mateo vs The Eulogy: 10 rounds, mDealt 888 of 968
monster HP (**92%**), vTaken 2881 — the monster dealt ~288/round
to the party while the party dealt ~89/round. Mateo dies with the
monster at 8% HP. His gear absorbed 37–48 per hit and field
medicine bought him rounds; the race was lost 3:1 on damage output
even while the party nearly killed it. The other two deaths are
fast (3 rounds, 21–70 damage dealt): the party never got going.

### 5.6 Gear and abilities do not discriminate

- Gear: losing parties' min armorP averages 17.7–28.3, mean 23–35
  — the gate's armored bar (P ≥ 10) is cleared with room. The
  104505 d75 9-round loss had min armorP 37 (the best-armored
  losing party in the set) and still fled at 49% damage dealt.
  Armor is not the gap: fleeing parties take only ~73 damage over
  ~5.4 rounds and flee while alive.
- Abilities: losing meetings average 2.4–3.1 abilities/member;
  the two mFlee talk-downs average 4.7–6.0. A meeting with 3.67
  abilities/member (purify, rage, war_cry, pack_hunt) fled after 5
  rounds on the 1015Z band. The abilities present are mostly
  non-combat (green_whisper, beast_calm, lucky_rock, bird_whisperer)
  or low-impact in the fight; the one combat multiplier in the data
  (Rage x2.5) is on the winning party. **Count of abilities does
  not predict winning; having a damage multiplier does.**
- The fighter is usually the strongest damage dealer (fighter
  damage share 0.64 on vFlee, 0.81 on vKill) — but on the 104505
  d75 loss the fighter (Petra) dealt 10–14/round while her ally
  Cooper dealt 38–40. The launch holder is not always the best
  fighter in the party.

## 6. §15 balanced panel — review_required (watch only)

`scripts/build-fightcap-panels-a.js` + `node
scripts/balance-panel.js compare`. Decision: **review_required**.
8 paired cases; screen only.

| Metric | Before | After | Paired delta | 95% exploratory interval | Status |
|---|---|---|---|---|---|
| National scale access | 0 | 0 | 0 | 0 to 0 | no_material_signal |
| Table win rate | 0 | 0 | 0 | 0 to 0 | descriptive |
| Village deaths per run | 85 | 88.5 | +3.5 | −7.875 to 16.875 | regression_watch |
| Village deaths per 100 calendar days | 66.67 | 64.77 | −1.90 | −16.73 to 12.98 | no_material_signal |
| **Community loss** | **0.5** | **0.25** | **−0.25** | −0.625 to 0.25 | **no_material_signal** |

The `review_required` is carried by one watch metric (village
deaths per run, +3.5 with an interval crossing zero) — not a
signal. Community loss IMPROVED on the arm (0.5 → 0.25), which
corroborates §4: the arrival price did not reproduce. The panel is
the instrument, the frozen bars (§2) are the judge; all frozen cost
bars pass. Panel files: `fightcap-a-panel-before.json.gz`,
`fightcap-a-panel-after.json.gz`, `fightcap-a-panel.json`,
`fightcap-a-panel.md`.

## 7. Reachability verdict / wall numbers

Wave-4 meetings happen on both legs (45 arm / 29 ctl launched
meetings); wave-5 unlocks 5/8 both legs; **national 0/8 both legs;
table not instrumented (null, never faked); wins 0/8 both legs.**
The standing wall stands: arm seeds reach standing 330–540 and
wave 5 but stay regional (104503: 540, lost; 104508: 450). The
standing-199 stall persists (104502 both legs at 199; 104507 arm
at 199). The scale-onramp axis is still blocked above regional.
What this run adds: the launched party CAN kill wave-4 monsters
(2 kills, one party, one seed) — the win chain beyond the launch is
no longer zero, but it is one party shape on one seed, not a
reliable capability.

## 8. Village assessment (plain words)

When a party sets out to hunt a wave-4 monster now, the party that
set out is the party that meets it — that part is settled. What
happens next is a damage race the village usually loses. A typical
launched party of three hits the monster for about fifty points of
damage a round while the monster has about twelve hundred hit
points; at that pace the fight would take forty rounds, and the
party gives up and runs after five. The monster does not have to
kill them. It just has to still be standing.

Twice, on one seed, a party won — and the wins show what winning
takes. Cooper's party had a fighter whose strikes hit two and a
half times as hard, opened the fight with a bow, and had all three
people hitting every round. They killed a Eulogy and a Suburb three
days apart. Nobody else in either band had that shape: the other
parties' fighters hit for ten or twenty a strike with no multiplier,
their allies contributed a little, and they ran.

The village's own caution is no help here. It looks at a party of
three, all armed and armored, and says go — and it is right by its
own measures, because the measures are size and gear. But size and
gear are not what decides the fight. Damage decides it, and the
village's caution does not measure damage at all. So the gate lets
ready-looking parties walk into fights they lose four times out of
five, and the parties that do win are the exception that proves the
rule: they win because one person hits much, much harder than the
rest.

## 9. Sense testing (what the player would see)

Fresh band, 2 lost + 2 won read in full (plus the 1015Z 4 in the
prereg):

- **Won — 104505 d69 Cooper vs The Eulogy (vKill, 9 rounds):**
  *"Cooper sees The Eulogy coming and nocks an arrow — the fight
  opens at range (4 shots)."* Three arrows land (15/17/19), then
  *"Cooper's eyes go red. Next 3 strikes hit twice as hard. (Rage)"*
  and 78-point strikes at x2.5. *"Cooper is losing — shouts for
  help! James charges in!"* — the ally join is voiced as someone
  coming when called. Coherent, consequential, and the Rage line
  tells the player exactly why this fight is winnable.
- **Won — 104505 d72 James vs The Suburb (vKill, 12 rounds):**
  the same party, bow opening (3/4 hit), steady 21–32 strikes,
  *"James is losing — shouts for help! Cooper charges in!"* /
  *"James is still losing — shouts again! Connor charges in!"*
  The Suburb's attacks are named as its fiction (Property Tax, HOA
  Fine). Reads like a fight the village wins by grinding, not by a
  trick.
- **Lost — 104506 d92 Mateo vs The Eulogy (vDie, 10 rounds):**
  4/4 arrows land, 48-point strikes, field medicine mid-fight
  (*"Mateo stops mid-fight and binds the wound — field medicine,
  +20 HP"*), Enrique and Ava charge in on the shouts — and Mateo
  still dies with the monster at 8% HP. The tragedy is legible in
  the transcript: one more round and they had it. Nothing robotic.
- **Lost — 104505 d75 Petra vs The Congregation (vFlee, 9 rounds):**
  Petra strikes for 10–14 while her ally Cooper strikes for 38–40
  — the transcript itself shows the launch holder is the weakest
  hitter in her own party. They flee at 49% damage dealt.
- **Won-by-talk — 104506 d116 Ellie vs The Eater (mFlee, 1 round):**
  *"Ellie walks in open-handed, talking — low, steady, unafraid.
  And impossibly, it listens. It stands down. (Peacemaker: Walk
  In)"* — a real ability-driven non-violent resolution, correctly
  voiced. It is a win by the metric, not a fight win; the evidence
  never counts it as one (§5.2 separates kills from talk-downs).
- No new player-facing text was added by this arm (diag only).
  The transcripts read like people throughout — shouts, charges,
  medicine, misses — with one instrument limit: encounter logs are
  capped at ~20 lines, so fights longer than ~4 rounds are
  truncated mid-fight (the death itself is never in the log).

## 10. Findings filed / updated (for the coordinator to file — this arm does not edit sim-findings.md)

- **#2538 (arrival price: the gate lets launched parties walk into
  wave-4 fights and they die) — REFINED, not confirmed as a law.**
  On the fresh band the price does NOT reproduce: community loss
  arm 2/8 vs ctl 4/8, median survival 150d vs 145d, all cost bars
  pass. The 1015Z price (3 extra villages lost) was a band
  outcome. What DOES reproduce on both bands is the fight outcome:
  launched parties lose ~82% of engaged wave-4 meetings and kill
  ~6% (combined bands: 2 kills / 34 pair-inclusive meetings).
  The finding's next arm is unchanged in direction but sharper in
  mechanism: **fight capability, specifically damage output**.
- **NEW — the winning shape (damage multiplier + ranged opening +
  three contributors).** The only two kills in 34 launched meetings
  across both bands come from one party: Rage x2.5 on the fighter,
  a bow opening (~50–60 damage), all three members hitting every
  round, ~111 dmg/round, wins in 9–12 rounds. Typical parties deal
  ~40–60/round and need ~39 rounds. Next arm: test whether a
  damage-multiplier carrier (or equivalent: better weapons, the
  strongest fighter as holder) turns launched parties into winners.
  Candidates for the next arm, in order: (a) launch parties carry a
  combat-multiplier ability (Rage or equivalent) — measure kill
  share; (b) the gate demands a damage proxy (e.g. best-strike or
  party damage/round estimate) instead of size+gear alone; (c)
  ranged opening for all launched parties (bow/arrows staged by the
  launch gear-up). (a) first: it is the mechanism the wins exhibit.
- **#2515 (the 4th seat) — unchanged, still OPEN.** The trio+
  population is the engine's full expression; quads arrive as
  fighter + 2-of-3. Nothing in this run touches it.
- **Gate calibration — demoted from co-equal to secondary.** The
  gate never held back a losing party on either band (0 avoids
  among 28 arm losses combined). A gate arm is only meaningful
  AFTER a capability arm shows what a winning party looks like —
  the gate needs a damage bar to demand, and only the capability
  arm can supply it.

## 11. Blanks, limits, and things not done

- **Table sittings not instrumented** by this driver — reported as
  null, never faked. The panel shows table-entry/sitting rates as
  `not_observed`.
- **mHpStart is null on both vKill meetings** (fresh band) — the
  recorder does not capture starting HP for those kills, so the
  kill damage share is uncomputed (mDealt 984 / 1362 stands alone).
  The vKill damage/round (~111) uses mDealt/rounds, which is
  unaffected. A future recorder should stamp mHpStart on every
  fight resolution, not only on the paths the recorder wraps.
- **Encounter logs cap at ~20 lines** — fights longer than ~4
  rounds are truncated, so per-fighter parsed strike totals
  UNDERSTATE damage in long fights (e.g. the Suburb kill: parsed
  122 vs mDealt 1362). All damage-rate claims in this evidence use
  mDealt/rounds, never the parsed totals; parsed totals are used
  only for fighter-vs-ally shares within the shown lines.
- **Per-fighter attribution gaps:** two vDie meetings have parsed
  strike damage no roster name resolves to (104506 d141: 21 damage
  unattributed; 104508 d65: 58 of 70 unattributed). The fighter
  dealt 0 parsed strikes in 3 rounds in both — either the fighter
  genuinely did not strike, or the strikes were logged under a name
  the roster map misses (app_… joiners). Flagged, not resolved;
  it does not change any judged number (outcomes and mDealt stand).
- **The 1015Z 12-round meeting where allies dealt 0 parsed strikes**
  (104404 d87) is the same log-cap artifact family: the shown
  lines cover ~4 rounds; the allies may have struck later. Not a
  finding, noted here so a later reader does not over-read it.
- **Rounds=0 "vKill" rows** (mHpStart null, mDealt ~12–27) are
  excluded by the engaged filter (rounds > 0) and counted as fight
  wins nowhere. They are likely off-screen/environmental kill
  attributions; a future recorder should label their path.
- **No 12–16 seed confirm in this run** — pilot only (8 seeds);
  the coordinator decides. The combined two-band n (34 arm
  pair-inclusive meetings) is the strongest statement available at
  pilot scale: kill share 0.059.
- **No check.js run** (no src/ change; the substrate merge is
  prior work). The analyzer selftest is 20/20; the panel builder
  ran clean on the fresh corpora.
- **Launch counts differ between legs** (45 arm vs 29 ctl launched
  meetings). Same trajectory-divergence caveat as the sense run:
  the fix changes who is sensed at a meeting, not who departs —
  but the arm's parties also MEET more because they arrive as
  parties. It is a population difference, not a lever effect, and
  the per-meeting decomposition (not the counts) carries the
  verdict.

## 12. Files

- Prereg: `evidence/2026-11-18/sim-fightcap-a-prereg.md`
- This evidence: `evidence/2026-11-18/sim-fightcap-a.md`
- Analysis: `evidence/2026-11-18/fightcap-a-analysis.json`
  (fresh band), `evidence/2026-11-18/fightcap-a-1015z-analysis.json`
  (1015Z re-analysis)
- Corpora: `evidence/2026-11-18/perseed-fightcap-a-ctl/` (8 files),
  `evidence/2026-11-18/perseed-fightcap-a-arm/` (8 files)
- Pilot logs: `evidence/2026-11-18/fightcap-a-{ctl,arm}.log/.err`
- Panel: `evidence/2026-11-18/fightcap-a-panel-{before,after}.json.gz`,
  `fightcap-a-panel.json`, `fightcap-a-panel.md`
- Analyzer: `scripts/analyze-fightcap-a.js` (selftest 20/20)
- Panel builder: `scripts/build-fightcap-panels-a.js`
- Code under judgement (unchanged by this arm):
  `src/js/party-wiring.js` (sense fix, substrate),
  `src/js/villager-brain.js` (partyTrios bump, substrate)
- Tests: `scripts/analyze-fightcap-a.js --selftest` (20/20)
