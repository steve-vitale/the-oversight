# Propose-first probe — Loop B verdict (run fleshout-loop-b-20261106T1130Z, arm sim-proposefirst-b)

Axis: winnability chain (0730Z blank #6 / linkseek blank #5 —
travel-leg marginal value). POLICY-SIDE ONLY, zero src/js. No gate
/ price / deed / readyDemand change. No game-code change. Do NOT
rebuild villager-initiated bonds (separate main-session build).
Do NOT touch Loop A's live arms or trees (sim-mootgate-a,
sim-gorgeharness-a). Do NOT touch the sim-hold-b tree.

## Pre-registration (committed before any judged sim)

Full text: `evidence/2026-11-06/sim-proposefirst-b-prereg.md`
(commit 176e97f1f). In short: two legs per seed on IDENTICAL
seeds — BASELINE `linkseek` (the landed policy), ARMED
`linkseek-proposefirst` (linkseek + propose on first contact,
travel only after acceptance) — 150d death-aware horizon, pilot
band 72001–72008, confirm band 78001–78008 reserved. GO iff
ALL of: (1) median first-proposal day armed <= baseline − 7
days (both legs proposing on >= 6/8 seeds); (2) pooled seasoned
links armed >= baseline; (3) guards: median survival armed >=
0.8x baseline, total wave-4 ledger points armed >= 0.5x baseline
pooled. No canon doc covers link trust / tribute mechanics in
full — the mechanism lives in `src/js/standing.js`
(`_linkRegionalPlus`), `src/js/hierarchy.js` (`polityOf`,
`tendLink`, `linkTick`, `successionCrisis`, `theirLeaderDied`,
`answerRenegotiation`, `_trustGain`, `_linkNeglected`) and the
leadcourt/linkseek policy; no canon invented.

## Verdict — NO-GO (pilot, decided by the wave-4 kills guard)

- Clause 1 (earlier): PASS — median first-proposal day 27 ->
  7, a 20-day gain (bar: >= 7 days). Both legs proposed on 8/8
  seeds.
- Clause 2 (seasoned): PASS — pooled seasoned links 20 armed
  vs 18 baseline.
- Guards: survival PASS (median 87 -> 108 days, ratio 1.24);
  wave-4 ledger FAIL — 2 armed vs 8 baseline (bar: >= 4).
  Per the prereg a miss on any clause is NO-GO, never re-scored
  against a friendlier metric mid-run. NO confirm run follows
  (confirm only on pilot GO); the reserved band 78001–78008
  stays unused.
- The guard miss is concentrated, and the evidence says so
  plainly without re-scoring it: 6 of the baseline's 8 ledger
  points sit on ONE seed (72001, the only baseline leg with
  ready days — 29 — and a wave-5 unlock). The pooled bar still
  fails as written, and that is the verdict.

## THE ANSWER (plain words)

Asking on first meeting works — and it costs you the negotiation.

The ask itself is twenty days earlier: villages are known on day
4, and the new policy proposes on day 7 on all eight seeds (the
three days are the pantry guard — the pantry does not clear
12,000 kcal until day 7 — not travel, not the old day-25 rule).
Villages still say yes: 27 proposals, 20 formed outright, 7
answered with a counter-offer, 0 declines, 0 shut doors, and
every counter was answered the next day and formed a link. More
links form in total, and more of them season (20 vs 18).

But the cold ask changes WHAT forms. A proposal made before the
village has been visited and its codex studied lands in the
counter band far more often (7 of 27, vs 0 of 22 for the warmed
policy), and a counter is not a "no" — it is an offer to flip
the table. The counter's terms, in the game's own words, are:
"They won't bow to Haven. But they'll TAKE Haven — 5,000
kcal/week, them primary." Answering "accept" — which the
policy does whenever the pantry holds 25,000 kcal or less,
i.e. almost always in the first weeks — forms the bond with
Haven as the subordinate. Four of the seven counters were
answered that way, and those four links can never count toward
Haven's realm: the realm needs three seasoned bonds where Haven
is primary. They are also never tended (the tending verb refuses
any bond where Haven is not primary), so they bleed untended
from trust 40 to zero while Haven owes them tribute — the wrong
way round. The three counters answered "sweeten" (pantry rich
enough for the 1,500 kcal gift) re-judged at Haven's terms and
formed Haven-primary, like the outright forms.

So the early ask buys three weeks and spends them on bonds that
point the wrong way. The warmed policy's travel-and-study leg —
walking to the village, studying its codex at the fire for +3
opinion — was not dead time. It was the warming that kept the
ask out of the counter band. Propose-first, as built, is the
wrong leaner seeker: the travel leg's marginal value is the
opinion it banks before the ask, and removing it costs more
realms than the twenty days buy (realms: 3/8 seeds armed vs 6/8
baseline; national+ end rank 3/8 vs 4/8).

The kills guard is the formal NO-GO, and it is real too, not a
measurement artifact: the armed legs faced wave 4 on 5/8 seeds
(vs 6/8), unlocked wave 5 on 0/8 (vs 2/8), and banked 2 wave-4
ledger points against the baseline's 8. Whether that is tribute
flowing the wrong way, scholar time spent commuting to bonded
villages (72–98 travel legs on the heavy seeds), or the
trajectory divergence an early proposal forces (every later
fight rolls on different dice once the policies diverge on day
7), this run does not isolate — and the verdict does not need
it to. The lever as built loses on kills while winning on
earliness, and the prereg said that is NO-GO.

## Per-seed table (pilot 72001–72008)

| seed | base days | base 1stProp (lag) | base prop (outcomes) | base formed/seasoned/dissolved | base peakDiplo | armed days | armed 1stProp (lag) | armed prop (outcomes) | armed formed/seasoned/dissolved | armed peakDiplo | armed ledger4 |
|------|-----------|--------------------|----------------------|-------------------------------|----------------|------------|---------------------|-----------------------|--------------------------------|-----------------|---------------|
| 72001 | 118 | 25 (21) | 3 (3 formed) | 3/3/0 | 102 | 125 | 7 (3) | 3 (2 formed, 1 counter) | 3/3/0 | 102 | 1 (base 6) |
| 72002 | 99 | 27 (23) | 3 (3 formed) | 3/3/0 | 102 | 76 | 7 (3) | 2 (2 formed) | 2/2/0 | 0 | 0 (base 0) |
| 72003 | 30 | 27 (23) | 1 (1 formed) | 1/0/0 | 0 | 103 | 7 (3) | 4 (3 formed, 1 counter) | 4/3/1 | 0 | 0 (base 0) |
| 72004 | 148 | 27 (23) | 3 (3 formed) | 3/3/0 | 102 | 60 | 7 (3) | 2 (2 formed) | 2/1/1 | 0 | 0 (base 1) |
| 72005 | 54 | 45 (41) | 1 (1 formed) | 1/0/0 | 0 | 108 | 7 (3) | 4 (2 formed, 2 counter) | 4/2/3 | 0 | 0 (base 0) |
| 72006 | 75 | 28 (24) | 3 (3 formed) | 3/3/0 | 102 | 150 survived | 7 (3) | 4 (3 formed, 1 counter) | 4/2/1 | 0 | 1 (base 1) |
| 72007 | 87 | 25 (21) | 3 (3 formed) | 3/3/0 | 102 | 75 | 7 (3) | 3 (3 formed) | 3/3/0 | 102 | 0 (base 0) |
| 72008 | 84 | 26 (22) | 3 (3 formed) | 3/3/0 | 102 | 143 | 7 (3) | 4 (2 formed, 2 counter) | 4/4/0 | 102 | 0 (base 0) |

Lag = first-proposal day minus first-known day (first-known day 4
on all 16 legs). "Seasoned" counts links that seasoned at ANY
point (ever-seasoned, derived from snapshot transitions) — see
"The hold" for why ever-seasoned overstates realms. Baseline
first-proposal days 25–45 (median 27); armed 7 on all 8 seeds.
Baseline proposals 22, all formed outright, 0 counters. Armed
proposals 27: 20 formed, 7 countered, 0 declined, 0 shut-door;
all 7 counters answered the next day and formed (3 sweeten, 4
accept). Travel legs: baseline 1–57 per seed; armed 0–98.
Studies (codex +3, once per village): baseline >= 1 on 7/8
seeds; armed 0 on 4/8 seeds (72001, 72002, 72004, 72008) despite
heavy travel — see "The study that never fires".

## The delay, decomposed (the prereg's DIAG question)

Per-village first-known -> first-propose lags (analyzer table):
- BASELINE first village: lag 21–41 days. That is the day>=25
  floor (21 days of it) plus the pantry>12000 guard (72005's
  lag 41: the pantry did not clear 12,000 until day 45).
  Baseline LATER villages: lag 0–3 days once day 25 had passed
  (72001 village_1 known d30, proposed d30; village_2 known
  d34, proposed d33 — the lag -1 is a first-known-day artifact:
  the village became known DURING day 33's play, after the
  morning snapshot, and was proposed the same day). Travel time
  and scholar position delay NOTHING in the baseline: proposing
  needs only knowledge, and later villages are proposed the day
  they are known.
- ARMED first village: lag 3 days on all 8 seeds (known d4,
  proposed d7). The 3 days are the pantry guard alone — the
  pantry clears 12,000 kcal on day 7. Armed later villages: lag
  0–6 days (one proposal per day + 7-day cooldown + pantry).
  One exception: 72003's splinter, known d29, proposed d60
  (lag 31 — the 3-subordinate cap was full until a link
  dissolved).
- ANSWER: of the linkseek run's 25–58 day first-proposal delay,
  the travel leg accounts for ~0 days. The day>=25 floor was
  ~21 days and the pantry guard the rest. Proposing on first
  contact removes the floor and leaves only the 3-day pantry
  lag — but the ask goes out cold, and the coldness is the cost
  (see below).

## The cold-ask cost (grounded in code, not inferred)

- `judgeLink` (hierarchy.js): base 38 + representative
  standing/2 (max 20) + opinion/2 + allied 15 + strength diff
  (max 15) + subordinate 10 + generosity 8 + R()*20-10. Score
  >= 55 forms; 35–54 stages a counter. The +3 opinion from a
  codex study is worth +1.5 score — small alone, but the armed
  legs also lose the representative-standing and opinion the
  baseline's travel weeks accumulate, and the early game's
  standing is thin. Net: 7/27 armed proposals countered vs
  0/22 baseline.
- `_stageCounter` (hierarchy.js:679): the counter ALWAYS sets
  `asSubordinate: true` — the other village takes Haven as its
  subordinate — with tribute 5,000 kcal/week (our case: the
  original proposal was asSubordinate:false). The terms line
  says so aloud (quoted in "THE ANSWER").
- `answerCounter('accept')` (hierarchy.js:703): forms the link
  ON THEIR TERMS (`_formLink` with `c.asSubordinate`). The
  policy answers 'accept' when pantry <= 25,000 (leadcourt's
  rule, verbatim) — in the first weeks that is nearly always.
  4 of 7 armed counters were accepted: 72003 village_2,
  72005 village_1 + village_2, 72006 village_2 (first link),
  72008 village_0. First-observed trust on those links: 40.
- `answerCounter('sweeten')` (hierarchy.js:720): spends 1,500
  kcal, re-judges at YOUR terms (score + 12 >= 45), forms
  Haven-primary. 3 of 7 armed counters were sweetened: 72001
  village_0, 72008 village_1 (first-observed trust 48 — the
  gift's re-judgment plus same-day ticks; the formation line
  itself says trust starts at 30, so 40/48 are first-observed
  values, not formation constants). Sweeten needs a pantry over
  25,000 — the early game rarely has it.
- `tendLink` (hierarchy.js:1147): REFUSES any link where Haven
  is not primary ("There is no bond of ours to tend there").
  The four accept-formed links are therefore never tended by
  the policy. Their trust trajectories, from the snapshots:
  72005 village_1 40 -> 0 (dissolved), village_2 40 -> 0
  (dissolved); 72006 village_2 (first link) 71 peak -> 4, never
  seasoned; 72003 village_2 77 peak -> 24, never seasoned;
  72008 village_0 (accept-formed, first-observed 40) — the one
  accept-formed link that seasoned (it is counted in 72008's
  4 seasoned; it seasoned DESPITE never being tended, on
  tribute/trust ticks alone — the exception that shows the
  bleed is a tendency, not a certainty).
- `payTribute` (hierarchy.js:1020s): tribute walks OUT of the
  payer's pantry toward the primary. On a reversed link Haven
  OWES 5,000 kcal/week to the other village — the direction the
  linkseek run's tribute economy ran the other way. The
  policy never calls `payTribute` (neither does linkseek — the
  engine's weekly tick settles it), so reversed links accrue
  arrears against Haven while bleeding trust.

## The hold (why ever-seasoned overstates realms)

Seasoned counts in the per-seed table are EVER-seasoned. The
realm needs THREE seasoned Haven-primary subordinates AT ONCE.
Armed seasons more ever (20 vs 18) but holds fewer at once:
peak diplomacy 102 on 3/8 armed seeds vs 6/8 baseline, and
armed dissolved 6 links vs baseline 0. The trust trajectories
show why — links season, then bleed back below 40:
- 72006 armed (the 150-day survivor, 0 diplomacy): all three
  early links seasoned at some point (peaks 68/71/73), then
  bled to 24/4/23 by the end; a fourth link formed day 130
  reached trust 39 at day 150, one point short. Three bonds,
  150 days, never three seasoned together.
- 72005 armed: the two reversed links bled 40 -> 0 and
  dissolved; the two Haven-primary links peaked 52/47 and ended
  32/12 — seasoned twice (2 ever-seasoned) but never together
  at 40+.
- 72003 armed: village_0 seasoned and held at 61; the other
  three peaked 77/50/39 and ended 24/34/21 — one seasoned at a
  time, never three.
- The success cases hold instead of bleeding: 72001 armed
  (trust 80/77/75 at end), 72007 armed, 72008 armed — all three
  reach diplomacy 102. What distinguishes them is not visible
  in the court log (tends are not in it — the same
  instrumentation gap linkseek named as its next blank #1).
  The HOLD is still the open problem, now sharpened: early
  links season and then un-season.

## The study that never fires

Armed studies: 0 on 72001, 72002, 72004, 72008 — despite 72,
50, 0, 98 travel legs on those seeds. The travel leg walks to
the nearest LINKED village each day, but `competent.daily`
pulls the scholar home, so the seeker commutes: it walks
toward the village, gets pulled back, walks again, and never
closes to the 2 tiles the codex study needs. (Linkseek noted
the same commute for unlinked targets — 57007 walked to
Thornfield six times — but its travel persisted toward ONE
target until arrival, and it studied on 14/16 seeds.) In the
armed leg the study — the +3 opinion climb verb — is absent
twice over: no pre-proposal study (by design) AND no
post-acceptance study on half the seeds (by commute). The
opinion the baseline banks before asking never gets banked at
all. A leaner seeker that proposes first AND studies would need
to solve the commute, not just re-target the travel.

## Wall numbers (this run, pilot 8 seeds per leg)

End-of-run scale rank (analyzer; "national" = national or
global end rank):

| leg | wins | national+ (end) | global (end) | table (end) | wave-4 unlock | wave-4 faced | wave-5 unlock | median days | survivors (150d) |
|-----|------|-----------------|--------------|-------------|---------------|--------------|---------------|-------------|------------------|
| baseline (linkseek) | 0/8 | 4/8 | 4/8 | 0/8 | 7/8 | 6/8 | 2/8 | 87 | 0/8 |
| armed (proposefirst) | 0/8 | 3/8 | 3/8 | 0/8 | 5/8 | 5/8 | 0/8 | 108 | 1/8 |

- Wins 0/8 both legs; table ENTERED 0/8 both (end rank 'table'
  0/8 both). The table is TOUCHED (peak) on 4/8 baseline vs 3/8
  armed legs in the balanced panel below — the analyzer's wall
  counts end rank only, so its "table 0/8" is the sitting count,
  not the touch count. No sitting anywhere.
- Wave-5 unlock: baseline 2/8 (72001, 72004 — both with
  standing 627/247 and peak wave 5) vs armed 0/8. The door still
  needs 2 living veterans: ready days baseline 29 (all on
  72001) vs armed 0 on all 8 seeds. End veterans 1 on 72001
  both legs, 1 on 72006 armed, 0 elsewhere.
- Wave-4 ledger points (last snapshot, summed): baseline 8
  (6 on 72001 + 1 + 1) vs armed 2 (1 + 1). The guard bar was
  >= 4. Total wave-kill-log entries (all waves): baseline 66/
  33/14/70/37/41/47/31 = 339; armed 45/30/35/29/42/55/41/62 =
  339 — IDENTICAL pooled totals. The kill difference is wave-4
  specific, not a general fighting collapse: the armed legs
  kill as much overall and face wave 4 nearly as often (5/8 vs
  6/8), but bank fewer wave-4 ledger points. (Ledger points are
  the last-snapshot `waveLedgerPoints(4)`; the kill log is a
  cumulative count — the two count different things, and the
  prereg's guard is the ledger, judged as written.)
- Median survival UP on armed (108 vs 87) despite fewer wave-4
  kills — the guard that passed and the guard that failed point
  in opposite directions, which is why the prereg's AND matters:
  living longer while killing less at wave 4 is not a GO.

## Village assessment (plain words)

Eight villages, each played twice — once by a scholar who walks
to the neighbors, studies their books, and asks on day 25 or so,
and once by a scholar who asks the moment she learns their
names, on day 7. The early asker gets her answer three weeks
sooner, and the villages still say yes — nobody declines, nobody
shuts the door. But the early ask is a cold ask, and cold asks
get counter-offers, and a counter-offer is a trap with a polite
name: accept it and your village is the one bowing. Four times
in eight villages the early asker ended up subordinate to the
village she courted, paying them tribute while the bond bled
out untended, because the tending hand only reaches bonds where
Haven stands primary. The patient asker kept her villages
bowing to her, and on six of eight her three bonds hardened into
a realm. The early asker's villages lived longer — a median of
108 days against 87, one of them the full 150 — but they killed
less of what mattered, and none of them ever opened the fifth
wave's door. The lesson is not that early is wrong. It is that
the walk to the neighbor's fire was never the delay — it was
the warming. The next seeker should keep the early ask AND the
warmth: propose on first contact, but answer every counter with
a sweetener, not an acceptance — or warm the village first and
ask second, as the old policy did.

## Sense-test (quoted lines)

Formation, counter, and tribute lines are coherent against the
numbers on every sampled seed — and the counter line states the
flip plainly enough that a player can see it:

- "⛓️ Emberhold doesn't say no. They say: \"They won't bow to
  Haven. But they'll TAKE Haven — 5,000 kcal/week, them
  primary. That's the offer.\" The table is set — accept their
  terms, sweeten the offer, or walk away." (72001 armed d7 —
  the counter on the very first proposal; answered with a
  sweetener the next day.)
- "⛓️ Grace brings it home: Emberhold bows to Haven — one
  organization, us primary. Tribute: 4,000 kcal/week. The
  relationship starts at trust 30. Everything from here is
  earned." (72001 armed d8 — the sweeten-answered counter,
  Haven primary.)
- "⛓️ Gina brings it home: Haven bows to Stonebridge — one
  organization, them primary. Tribute: 5,000 kcal/week. The
  relationship starts at trust 30. Everything from here is
  earned." (72005 armed d9 — the accept-answered counter, Haven
  subordinate, 5,000 owed the wrong way. The game says the
  direction aloud; the policy just doesn't act on it.)
- "🌾 Haven sends 1,500 kcal of grain to Emberhold's fire —
  not tribute, the other way around. Someone's grandmother over
  there will remember who fed her. (Trust +8.)" (72001 armed
  d8 — the weekly tend, landing on a Haven-primary link.)
- "🌾 Tribute wagons from Emberhold turn at the gate — our
  shelves are full past tomorrow. 'Eat well,' we send back.
  'That IS your tribute this week.' (Trust +1.)" (72005 armed
  d7 — tribute arriving from a Haven-primary subordinate.)
- Filter noise (instrument note, not a game finding): the say
  filter's "counter" still matches pantry-counter lines ("1
  unprocessed haul onto the counter") — the same limitation
  linkseek recorded. The 200-line cap fills early on long legs,
  so late-run lines are under-sampled; the quoted lines above
  are all from the first ~10 days, where the courtship happens.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- The GO bar held as written. Clause 1 passed by 20 days
  (bar 7); clause 2 passed by 2 links (20 vs 18); the kills
  guard failed 2 vs 4. The verdict is NO-GO on the guard alone.
- The ledger-4 guard is pooled, and one seed supplies 75% of
  the baseline total (72001: 6 of 8). A pooled guard with a
  single-seed driver is fragile in both directions: a future
  arm should pre-register a per-seed or median ledger guard
  alongside the pooled one, or a larger band, before leaning on
  it. The verdict here is NOT re-scored — the fragility is
  recorded for the next run's prereg.
- The analyzer's `endVets` read `(r5.veterans || {}).have`,
  but `readiness5.veterans` is an INT (count), not an object —
  endVets was always undefined. Fixed in the analyzer
  (veterans int read directly) and re-run; no verdict field
  used it. Same re-run fixed the wall's `national` count,
  which had counted only `scaleRank === 'national'` while the
  engine's end ranks here are 'global'/'regional'/'village' —
  'national' never appears as an end rank. Corrected wall:
  national+ = national or global (baseline 4/8, armed 3/8).
  The first analyzer run's wall (0/8 both) was wrong; the
  corrected run is the one attached.
- The analyzer's "seasoned" is ever-seasoned (a link that
  seasoned then bled below 40 still counts). The realm needs
  three seasoned AT ONCE. A future analyzer should also report
  simultaneously-seasoned Haven-primary links at peak — that
  number, not ever-seasoned, is what diplomacy pays on.
- Say filter: "counter" must go (pantry noise) or the cap must
  rise with per-week sampling; as run, the corpus is
  front-loaded to the first weeks (less costly here than in
  linkseek, since the courtship IS the first weeks).
- Balanced panel (§15): BUILT and clean — combined panel
  `evidence/2026-11-06/panel-proposefirst-both/` (16 cases,
  both policies, 8 pilot seeds, 150d; validity sourcesStable
  true, neutrality proofs match on both policies, 0 cached
  jobs). The panel is observer-neutral and corroborates the
  paired comparison on every column: median days 85.5 -> 105.5,
  national+ 4/8 -> 3/8, table-touched 4/8 -> 3/8, entered 0/8
  both, wave-4 reach 7/8 -> 5/8, wave-5 reach 2/8 -> 0/8, total
  deaths 459 -> 467, villager:monster kills 33 -> 35. The
  `compare` subcommand was also attempted on the two
  single-policy panels (`panel-proposefirst-before/` and
  `panel-proposefirst-after/`): it returns "invalid — unmatched
  policies / unmatched cases", as in the linkseek run — that is
  the tool's flag-flip shape, not a failure of the comparison:
  `comparePanels` matches identical policy sets across two
  panels (a flag on/off), while this run compares two POLICIES.
  Per the sim-awayeve-b precedent, the §15 instrument for
  policy-vs-policy is the matched-seed paired comparison
  (identical seeds, same harness, same instrument) that this
  analyzer performs, and the combined panel above is attached
  for the observer-neutral rows. The two single-policy panels
  and the compare output are kept in `evidence/2026-11-06/` as
  the record of the attempt.

## Next blanks, in order

1. The counter-answer rule (this arm's finding): 'accept'
   whenever pantry <= 25,000 flips Haven into the subordinate
   seat on cold asks. Next variant: propose-first + ALWAYS
   SWEETEN counters (or walk away when the pantry cannot cover
   the gift) — never accept a counter that makes Haven
   subordinate. That is a one-line policy change with this run's
   mechanism behind it.
2. The HOLD, sharpened: links season and then UN-season (72006
   armed: three links seasoned, then bled to 24/4/23 over 150
   days, never three at once). Instrument per link-week (tribute
   shortfall vs speaker death vs defense refusal vs neglect) —
   the gap linkseek named and this run re-finds.
3. The commute: travel to a LINKED village never closes to the
   2 tiles the codex study needs on half the armed seeds
   (studies 0 despite 72–98 travel legs). A seeker that studies
   after bonding needs a travel leg that ARRIVES, not one that
   commutes.
4. Wave-4 kills on the diplomacy road: armed legs kill as much
   overall (339 = 339 pooled wave-kill-log entries) but bank
   fewer wave-4 ledger points and face wave 4 less (5/8 vs
   6/8). Whether tribute direction, scholar travel time, or
   trajectory divergence drives it is NOT isolated by this run.

## Proof and landing

- Proof: `scripts/test-proposefirst-20261106.js` — 12/12 PASS
  (pickTarget / pickLinkedTarget perception gates x5,
  village-lag derivation, median, live instrument smoke, live
  10-day run zero instrument errors, determinism, propose-first
  order pin: first propose d7 vs linkseek d25 on seed 56001,
  first travel d15 — after acceptance).
- Analyzer fix: endVets + national+ wall corrections (see
  metric review); analyzer re-run after the fix, verdict
  unchanged (NO-GO on the kills guard).
- `check.js --quick`: 283 passed, 7 failed — the SAME 7 as the
  linkseek run (measurement proof-update, measurement-workflow
  neutrality, mobile combat cadence, occupation panels,
  phone-frame proof, capable-bot food deed, establishment r20
  voice gate). All 7 are pre-existing on the base (linkseek
  verified the same set; none touches sweep-compare,
  linkseek-proposefirst, standing, or hierarchy). A first run
  under heavy box load read 282/8; the re-run with full output
  to a file reads 283/7, so the 8th was load flakiness, not a
  regression — the re-run is the cited result.
- Balanced panel: combined panel
  `evidence/2026-11-06/panel-proposefirst-both/` (16 cases,
  validity sourcesStable true, neutrality proofs match on both
  policies, cohort issues none). Single-policy panels
  `panel-proposefirst-before/` and `panel-proposefirst-after/`
  plus the `compare` output kept as the record of the compare
  attempt (see metric review — "invalid — unmatched policies",
  the flag-flip shape, not a comparison failure).
- Commits (this worktree branch sim-proposefirst-b; coordinator
  merges via --ff-only; ready to merge, pending ship — no push,
  no bump, no live verification by this worker):
  - 176e97f1f sim-proposefirst-b prereg (before any judged sim)
  - b2a3e37ac sim-proposefirst-b instruments + proof 12/12
    (zero src/js)
  - (pilot + evidence commit below)
- Files: prereg + evidence in `evidence/2026-11-06/
  sim-proposefirst-b*.md`; per-seed JSON in
  `evidence/2026-11-06/perseed-proposefirst-b/` (16 pilot legs
  + 1 analysis JSON); panels in
  `evidence/2026-11-06/panel-proposefirst-both/`; scripts
  `policies/linkseek-proposefirst.js`,
  `proposefirst-driver-20261106.js`,
  `proposefirst-analyze-20261106.js`,
  `test-proposefirst-20261106.js`; registry entry in
  `scripts/sweep-compare.js` (additive, pattern as linkseek).
- Index-clobber note: safe-commit.sh left bogus staged
  deletions in the main index after the prereg and instruments
  commits; repaired each time via HEAD-blob
  `update-index --cacheinfo` and verified `git status` empty +
  `git diff HEAD` empty. The commits themselves were always
  correct.
- Worktree state at handoff: only committed work; no
  uncommitted leftovers beyond the pilot + evidence commit below
  (verified before reporting).
