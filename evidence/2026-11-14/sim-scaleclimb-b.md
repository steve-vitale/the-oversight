# sim-scaleclimb-b — BUILD: competent + LEAD propose/accord/tend — NO-GO

Run: fleshout-loop-b-20261114T1430Z (Loop B), arm sim-scaleclimb-b
Axis: winnability chain. BUILD arm — teaches the COMPETENT policy
capable's diplomacy behaviors and measures before/after on identical
seeds. Policy-side only: one new policy file, zero src/js changes.
Branch: sim-scaleclimb-b — worktree ~/workspace/worktrees/sim-scaleclimb-b
Base: master 8491b132b
Date: 2026-11-14
Prereg: evidence/2026-11-14/sim-scaleclimb-b-prereg.md (binds G1/G2/G3)

## Verdict: NO-GO on G2 (and G1 on the letter — see metric review)

- **G1 INSTRUMENT VALIDITY — NO-GO (letter) / instrument sound
  (substance).** The driver captured a full per-day link roll on all
  16 configs, **0 instrument errors**, and **every link classified
  — 0 UNCLASSIFIED** (33 armed links + 8 baseline links). But the
  attribution arithmetic fails its own bar: total diplomacy
  unattributed = **−408** (98803 −204, 98804 −102, 98808 −102) and
  **2 of 98803's +34 steps name no link** (empty `links` array).
  The cause is measured, not missing data: diplomacy FLICKERS on
  150-day legs — it rises as links count, then FALLS as links
  un-season and the polity dissolves, so end-of-run diplomacy is
  lower than the sum of the attributed +34 steps, and re-counts
  after an un-seasoning have no new `countedDay` for the analyzer
  to name. The recorder captured every step; the metric assumed
  diplomacy only rises (true on capable's win-truncated ~90d legs,
  false on 150d legs). See metric review §2 for the revision owed.
- **G2 THE LEVER — NO-GO.** Half 1 FAILS: diplomacy points > 0 at
  end of run on **2/8** armed seeds (need ≥6/8). Half 2 PASSES:
  ≥3 Haven-primary seasoned subs at once on **5/8** armed seeds
  (need ≥2/8). A miss on either half is NO-GO, never re-scored.
  The fuller picture (not the verdict): diplomacy was positive
  MID-RUN on 5/8 seeds (peaks 136/136/102/102/102), held 6–83 days
  per seed, and the scale climb itself closed — regional day median
  70 → 32. The lever climbs; it does not HOLD. Root cause pinned
  below (§Holding).
- **G3 LEVER-ONLY — GO.** Zero `src/js` changes in the branch diff;
  proof test green (static 41/41, game 23/23 on smoke seed 98801).

No confirm band was spent. The prereg licenses a 12–16 seed confirm
only on a clear GO; the pilot is a NO-GO, so the pilot IS the result.
The follow-up is a BUILD question (holding), not a measurement one.

## The answer in one paragraph

Teach competent to court the LEAD road — propose subordinates from
day 10, answer the first accord with the gift, tend below the
seasoned bar — and the village climbs exactly like capable does:
regional in 32 days instead of 70, four links where there was one,
three seasoned, three counted, a realm standing on five of eight
seeds, diplomacy as high as 136. And then, on three of those five,
the realm quietly comes apart again: the pantry runs too thin to
pay the 1,500 kcal weekly tend (194 blocked tends on 98803 alone),
succession haircuts and shortfalls drag trust back under 40, the
third seasoned bond un-seasons, and the polity dissolves — day 121
on 98804, day 124 on 98803, day 76 on 98808 (there a link broke
outright). Capable never sees this because its runs end at the
day-90 win, before the long grind eats the bonds. The courtship
works. The marriage doesn't — yet. Holding is the next lever, and
it is a pantry problem first, a tend problem second.

## Before / after (paired seeds, 150d)

| Seed | Before: competent (days, end, scale, maxW, stand, w1/w2/w3/w4) | Armed (days, end, scale, maxW, stand, w1/w2/w3/w4) | dip end (peak, held d) | polity bar day | regional day |
|---|---|---|---|---|---|
| 98801 | 147, lost, regional, 4, 199, 24/16/11/2 | 150, survived, regional, 5, 591, 29/16/15/4 | 136 (136, 83) | 69 | 76 → 39 |
| 98802 | 86, lost, regional, 4, 199, 22/14/4/2 | 109, lost, regional, 4, 199, 34/22/5/2 | 0 (0, 0) | — | 61 → 32 |
| 98803 | 90, lost, regional, 4, 125, 20/18/5/0 | 150, survived, regional, 4, 199, 57/36/13/0 | 0 (136, 78) | 46 | 74 → 32 |
| 98804 | 145, lost, regional, 4, 199, 22/15/7/2 | 138, lost, regional, 4, 199, 38/25/8/2 | 0 (102, 79) | 42 | 80 → 32 |
| 98805 | 87, lost, regional, 5, 205, 30/15/4/2 | 116, lost, regional, 5, 390, 49/20/14/3 | 0 (0, 0) | — | 68 → 33 |
| 98806 | 80, lost, regional, 4, 199, 21/15/10/2 | 101, lost, regional, 4, 199, 34/17/7/4 | 0 (0, 0) | — | 66 → 33 |
| 98807 | 130, lost, regional, 4, 199, 27/16/10/5 | 100, lost, regional, 4, 199, 25/8/3/1 | 102 (102, 23) | 78 | 69 → 32 |
| 98808 | 131, lost, regional, 4, 199, 32/15/11/1 | 129, lost, regional, 4, 199, 36/22/6/3 | 0 (102, 6) | 70 | 71 → 32 |

Pooled wave kills — competent 198/124/62/16/0 (waves 1–5),
armed 302/166/71/19/0. Median survival 110d → 122.5d; survived
0/8 → 2/8 (98801, 98803 to 150d). Gated standing median 199 →
199 (the 199 park holds: the armed villages sit at t5−1 even
with diplomacy earned — 98801's 591 is the exception, not the
rule; its raw split is war + diplomacy 136 + plenty, past the
gate). National 0/8 both; table/wins 0/8 both (by design — no
seat-taking in this lever).

## The verb table (armed leg, 8 seeds)

| verb | calls | trust moved | first-crossings | refused |
|---|---|---|---|---|
| proposeLink (LEAD) | 28 | — | — | 0 declined, 0 shut |
| └ accepted outright | 23 | — | — | — |
| └ countered | 5 | — | — | — |
| answerCounter ('accept') | 5 | — | — | 0 |
| answerAccord ('gift' +10) | 22 | +220 | 21† | 0 |
| tendLink, policy (+8/week) | 98 | +448 (56 paid) | 3† | 42 (n=0) |
| tendLink, engine — villagers' own drive | 22 | +176 | 4† | 0 |
| payTribute | 0 | 0 | 0 | 0 |
| hostFeast / devotion channel | — | 0 (no link) | 0 | — |

\* Trust moved sums the recorder's per-event dTrust where the wrapper
captured it; accord +10 is the engine's rule (2,000 kcal). †
First-crossing split over the 28 armed seasoned links is computed
the diplo-verb way (verb event at trust 38+ within ±1d of the
trust-40 day): accord 21, tend-policy 3, tend-engine 4, tick/other 0
— the accord is the crossing verb on this leg even more cleanly than
on capable's (24/30 there). Tend-policy carried 3 first-crossings
and 8 further re-crossings (links dipping below 40 and climbing
back); tend-engine 4 first-crossings.
Propose judge worked exactly as designed: **0 cold declines in 28
calls** (det ≥ 45 guarantees ≥ 35 post-draw — the counter floor).
The 5 counters were all answered the next day and formed BELONG
links (engine rule: a counter always flips Haven to subordinate).
Propose blocks (days): pantry 191, 3-sub cap 198, pending
counter/accord/national 327 (mostly unanswered national beats —
the policy does not answer them by design; proposing is already
done by then on most seeds), not-ready (no judged candidate) 177.
Tends paid: 84,000 kcal across the pilot (98 policy tends × 1,500
+ engine tends).

Baseline leg for contrast: competent proposes 0, accords 0, tends
0, forms exactly 1 link per village (ladder reward), seasons 0,
counts 0 — the diplo-verb finding, reproduced exactly (see
reproduction check below).

## The holding failure, seed by seed

The polity bar (3 Haven-primary seasoned subs at once) was reached
on 98801 (d69, held to end), 98803 (d46), 98804 (d42), 98807 (d78,
held to end — run ended d100), 98808 (d70). It dissolved on three:

- **98803** — polity lead/4 d46, lead/5 d76–124, **null d124**.
  End trusts 58/23/28/28: only one link still seasoned. The tend
  maintenance stopped: 194 blocked tends (pantry-gated), only 2
  successful policy tends all run, 84,000-kcal tend spend band-wide
  but 3,000 kcal on this seed. Pantry reads 4–12k kcal on most
  sampled days against the 20k tend gate. The links decayed under
  succession haircuts and shortfalls with nothing holding them.
  Diplomacy peaked 136 (d76), held 78 days, ended 0.
- **98804** — polity lead/4 d42, **null d121**. End trusts 38/42/68:
  one link one point short of the bar. Pantry collapses after d80
  (3,440 → 646 by d130); no successful tend after d35. Diplomacy
  peaked 102, held 79 days, ended 0.
- **98808** — polity lead/4 d70, **null d76**. The village_1 link
  BROKE (endStatus broken, endTrust 10) — a succession break, six
  days after the polity stood — and the third counted link was a
  splinter (d40) that seasoned late. Tends at d76–78 returned n=0
  (mourning choke: the speaker was being buried). Diplomacy peaked
  102, held 6 days, ended 0.

The two holds: 98801 (polity d69, lead/5 d85, dip 136 held 83
days to end) and 98807 (polity d78, dip 102 held 23 days to the
village's death at d100). What distinguishes them: the pantry
stayed fat enough to tend (98801: 16,500 kcal of tends paid) and
no link broke.

The tend predicate is NOT the hole: it tends whenever a link is
below the seasoned bar (age < 30 OR trust < 40), so a decayed
seasoned link IS tended — when the pantry allows. The hole is the
pantry gate itself (20k) plus the pantry's collapse in the long
grind. A follow-up arm should test holding verbs that do not need
a fat pantry (tend at a lower gate? tend-through-seasoning is
already the predicate — the gate is the thing), or a pantry-first
arm (the village must bank grain before the courtship can hold).
That is the coordinator's call, not this run's — the prereg froze
this lever, and it is judged as frozen.

## The two seeds that never counted (and why)

- **98802** — 3 links formed, 2 seasoned, max 2 Haven-primary
  seasoned at once: the third link was a BELONG (counter-answer)
  or seasoned too late / broke (1 broke). No polity, dip 0.
  Regional still came at d32 (vs 61).
- **98805** — 4 links formed, 4 seasoned, max 2 at once: the
  seasoned links never overlapped three-at-once (two seasoned
  early, two late; the early ones un-seasoned before the late ones
  seasoned). Counter-answers 2 (both BELONG). Dip 0. Regional d33.
- **98806** — 4 links formed, 3 seasoned, max 2 at once; 1 broke.
  Dip 0. Regional d33.

The polity needs three seasoned AT ONCE. Stagger kills it as
surely as decay does: propose early and together, or the windows
never overlap. (Capable's band shows the same shape — 98804/98808
seasoned 3–4 links and scored 0 — but there the misses were
BELONG links; here they are stagger + decay.)

## Per-seed link table (armed leg)

`seas` = seasoned day; `count` = first day counted; `cross` = verb
that carried the first trust-40 crossing; `end` = end trust/age.

| seed | link | formed | t40 | seas | count | cross | end |
|---|---|---|---|---|---|---|---|
| 98801 | village_2 | d17 propose | d18 | d47 | d69 | accord | 52/134 |
| 98801 | village_0 | d24 propose | d25 | d54 | d69 | accord | 74/127 |
| 98801 | spl_21 | d39 propose | d44 | d69 | d69 | tend:policy | 58/112 |
| 98801 | village_1 | d55 propose | d56 | d85 | d85 | tend:engine | 58/96 |
| 98802 | village_0 | — | — | — | — | — | (2 seasoned, max 2 at once) |
| 98803 | village_0 | d10 propose | d11 | d40 | d46 | accord | 58/141 |
| 98803 | village_1 | d11 propose | d12 | d41 | d46 | accord | 23/140 |
| 98803 | village_2 (BELONG) | d13 propose→counter | d13 | d43 | — | accord | 92/138 |
| 98803 | village_3 | d16 propose | d17 | d46 | d46 | accord | 28/135 |
| 98803 | spl_27 | d46 propose | d56 | d76 | d76 | tend:engine | 28/105 |
| 98804 | village_2 | d10 propose | d11 | d40 | d42 | accord | 38/128 |
| 98804 | village_0 | d11 propose | d12 | d41 | d42 | accord | 42/127 |
| 98804 | village_1 | d12 propose | d13 | d42 | d42 | accord | 68/126 |
| 98805 | — | — | — | — | — | — | (4 seasoned, max 2 at once) |
| 98806 | — | — | — | — | — | — | (3 seasoned, max 2 at once; 1 broke) |
| 98807 | village_0 | d10 propose | d11 | d41 | d78 | accord | 44/90 |
| 98807 | village_2 | d11 propose | d12 | d50 | d78 | accord | 40/89 |
| 98807 | village_1 | d46 propose | d56 | d76 | d78 | tend:policy | 65/54 |
| 98808 | village_1 | d10 propose | d43 | d43 | d70 | tend:engine | 10/119 broke |
| 98808 | village_0 (BELONG) | d12 propose→counter | d12 | d42 | — | accord | 20/117 |
| 98808 | village_2 | d12 propose | d13 | d42 | d70 | accord | 58/117 |
| 98808 | spl_25 | d40 propose | d43 | d70 | d70 | tend:engine | 33/89 |

Dip steps (each +34 named to its link; re-counts after an
un-seasoning show `links: []` — the analyzer names only the FIRST
counted day, see metric review): 98801 d69 +102 (3 links), d85
+34; 98803 d46 +102, d76 +34, d106 +34 (re-count), d115 +34
(re-count); 98804 d42 +102; 98807 d78 +102; 98808 d70 +102.
Polity days (LEAD, first day the realm stood): 98801 d69 (4 fires,
then 5); 98803 d46 (4, then 5, lost d124); 98804 d42 (4, lost
d121); 98807 d78 (4); 98808 d70 (4, lost d76); 98802/98805/98806
never.

## Wall numbers (scale wall, every run)

- National / table / wins: armed reaches national on **0/8**,
  takes the table on **0/8**, wins **0/8**; competent national
  **0/8**, table **0/8**, wins **0/8**. No village reaches the
  table as a distinct step — by design, this lever never sits.
- Wave 4–5 reach: wave 4 unlocked 8/8 both policies; wave 5
  unlocked 1/8 competent (98805), **2/8 armed** (98801, 98805).
  Pooled wave kills — armed 302/166/71/19/0 (waves 1–5),
  competent 198/124/62/16/0.
- Median survival: competent **110d** (80–147; 8/8 village-lost);
  armed **122.5d** (100–150; 2 survived to 150d, 6 village-lost).
- Death causes (§14c co-primary): villager (non-scholar) combat
  deaths pooled **570 armed vs 426 competent** (+34%). Per-seed
  armed exceeds the before leg by >50% on three seeds — 98803
  (104 vs 43, +142%), 98804 (78 vs 48, +63%), 98805 (87 vs 53,
  +64%) — named here per the prereg guardrail. The increase is
  exposure, not a deadlier day: the armed villages live longer
  (median +12.5d, two to 150d) and fight far more (wave kills
  302/166/71/19 vs 198/124/62/16). Deaths per 100 game-days:
  47.5 → 57.4. The panel's paired read agrees: villageDeaths
  +16.25/run (regression_signal, CI 0.75–32.5),
  villageDeaths/100d +5.8 (regression_watch, CI straddles 0).
  The win is not bought with fewer deaths — same shape as
  capablewinpath (902 vs 883 on 16 seeds).

## Balanced panel (§15 — instrument, not judge)

`evidence/2026-11-14/scaleclimb-panel.md` (+ .json, .json.gz pair;
pseudo-panels built from the driver's per-seed JSONs, linkdrive
pattern — the real balance-panel.js compare cannot judge a policy
contrast, see prereg): decision **review_required** (8 paired
cases, screen only). National 0 → 0 (no_material_signal); wins
0 → 0 (descriptive); survival30/60 1.0 → 1.0
(no_material_signal); villageDeaths/run 64.875 → 81.125
(regression_signal, CI [0.75, 32.5]); villageDeaths/100d 59.82 →
65.62 (regression_watch, CI straddles 0); communityLost 1.0 →
0.75 (no_material_signal). Per §15 this does NOT override the
prereg verdict (already NO-GO on G2); the panel's signals are
consistent with the paired story — the lever moves scale, seats
nothing, and costs more deaths because its villages live longer
and fight more, which the contract metrics do not price. Panel
limitation (stated in the prereg): the pseudo-panel covers only
contract metrics mappable from the driver JSONs (won, national,
survival30/60, communityLost, villageDeaths); playerDeaths, gear,
luck, and NPC metrics are null, never faked. Diplomacy itself is
NOT a contract metric — the panel cannot see the lever's primary
effect at all.

## Village assessment

The same eight villages, twice. The competent villages each
receive exactly one gift from the game itself — a link, handed
over by the ladder around day 50 — and then nothing happens to
it. The armed villages court: they propose from day 10, answer
every first gesture the morning after it is staged (the gift,
2,000 kcal, "They count it, and they remember who sent it"),
tend weekly while the pantry holds, and by day 32–39 they are
regional — the same climb capable makes in 38 days. Three fires
bow to Haven on five seeds, and the System starts counting: 34
points a link, 102 the morning the third one seasons. And then
the long grind does what the long grind does: the pantry thins,
the grain stops walking, funerals shave 8 points at a time, and
on three seeds the realm that stood at day 42–70 is gone by day
76–124 — not with a line marking the loss (the break is an
engine event; the captured sample ends at day ~28), but in the
numbers, trust 23 and 28 where 40 once stood. The two villages
that held their realm to the end are the two whose pantries
stayed fat enough to keep tending. The courtship is solved. The
keeping is not.

## Sense-testing (SENSE-TESTING LAW)

The courtship reads like a played relationship, not a meter. The
first gesture (98803, day 11): "🎁 Haven's first gesture: 2,000
kcal walks to Emberhold's fire — a gift, no strings. They count
it, and they remember who sent it. (Trust +10.)" The tend
(98802, day 11): "🌾 Haven sends 1,500 kcal of grain to
Emberhold's fire — not tribute, the other way around. Someone's
grandmother over there will remember who fed her. (Trust +8.)"
The link itself (98801, day 17): "⛓️ Colton brings it home:
Thornfield bows to Haven — one organization, us primary.
Tribute: 4,000 kcal/week. The relationship starts at trust 30.
Everything from here is earned." The realm line (98804, day 12):
"Three fires bow to Haven. But a realm isn't leverage — it's
seasons. These bonds are young; tend them, keep the trust, and
the court will come." The counter, honestly played (98808, day
11): "Emberhold doesn't say no. They say: 'They won't bow to
Haven. But they'll TAKE Haven — 5,000 kcal/week, them primary.
That's the offer.'" The neighbors answer in kind (98802, day 16):
"🏃 Wren of Thornfield walks into Haven unannounced, pack-mules
behind. 'Heard your bins are echoing. Thornfield has grain to
spare — 1,556 kcal, no tribute, no ceremony. Say the word.'"
And the world notices grief (98808, day 10): "Stonebridge watches
to see if Haven holds without its dead. The bond is young —
they're still deciding what Haven is, and grief delays the
verdict." Villager dialogue in the captured lines is coherent and
specific (Mila confessing she was a piano tuner, not a pharmacist;
Diana calling out Nino's story) — people reacting to named
events, not filler. Two recorder limits, both inherited from
diplo-verb: the say capture caps at 150 lines per run and fills
with early meal/tribute chatter (last captured day 19–28), so the
Regional Dawn announcement, the drift warning, and the polity
LOSS lines were not captured on this band (they exist in code;
the cap is a sampling limit, not an absence) — the polity's
dissolution is visible only in the numbers, never in a line.

## Reproduction check vs diplo-verb corpus (98801–98808)

End-state columns (days, endReason, won, maxWave, standing,
waveKills) checked against
evidence/2026-11-14/perseed-diploverb-b/: **8/8 exact, 0 diffs.**
The BEFORE leg reproduces the diplo-verb competent legs exactly
on all 8 seeds — the recorder is neutral and the base is stable
across the two arms (same base commit family; no game-code change
between the corpora).

## Metric review (§14)

1. The metrics half-held. G3 held (zero src/js, proof green).
   G2's polity half held (5/8 ≥ 3 subs). G2's diplomacy half
   failed on its own terms (2/8 end-positive vs the 6/8 bar) —
   but the bar's READ was wrong, not just the lever: end-of-run
   diplomacy is the wrong read for a quantity that flickers.
   Diplomacy was positive mid-run on 5/8 seeds and held 6–83
   days; the end-state read calls 98803 (held 78 days, peak 136)
   a zero. The next run should judge diplomacy by HELD-DAYS (days
   with dip > 0) and EVER-COUNTED (polity ever stood), with the
   end-state read reported alongside, never as the judge.
2. G1's attribution arithmetic assumed diplomacy only rises.
   It does not: links un-season (trust < 40) and polities dissolve,
   so endDip < attributedDip (−408 total) and re-counts after an
   un-seasoning have no new `countedDay` for the analyzer to name
   (98803 d106/d115 steps show `links: []`). The recorder captured
   every step; the analyzer needs two fixes for the next run: (a)
   track dip DECREMENTS and name the link that un-counted each
   time; (b) record a counted-day per counting EPISODE, not just
   the first. With those, G1's "0 unattributed" bar is testable on
   flickering legs instead of failing by construction.
3. The prereg's H-guess (implicit in G2's shape) — that seasoning
   three links is the hard part — was HALF right: forming and
   seasoning work (median 4 formed / 3.5 seasoned / 3 counted);
   HOLDING is the hard part (3 of 5 polities dissolved). The
   tend predicate was exonerated: it fires whenever a link sits
   below the bar; the PANTRY gate (20k) is the choke (194 blocked
   tends on 98803; pantry 4–12k most days). A follow-up arm that
   only retunes the tend predicate would change nothing — the
   pantry must be fixed first, or the tend must cost less than
   the pantry can carry.
4. The no-national-answers exclusion throttles late proposing:
   pending national beats blocked proposing on 327 days band-wide
   (98803: 89). The early proposes (all links formed by ~d55) are
   unaffected, so this does not touch the verdict — but a later
   arm that wants late splinter links must either answer the beats
   or lift the pending-national block.
5. Counter-answers (5) all formed BELONG links, as the engine
   dictates — none counted toward the polity bar, and none
   blocked it either. The diplo-verb warning holds: answering
   counters is a proposal-unblocker, not a climb verb.
6. Say-capture cap (150 lines/run) fills by day ~28 with early
   meal/tribute chatter; late beats (Regional Dawn, drift warning,
   polity loss) were not sampled. A future recorder should filter
   the say stream to link/polity lines only, or raise the cap —
   the polity's dissolution currently has no played line in the
   evidence at all.

## Evidence files

- Prereg: evidence/2026-11-14/sim-scaleclimb-b-prereg.md
- Policy: scripts/policies/competent-scaleclimb-b.js (new)
- Driver: scripts/scaleclimb-driver-20261114.js (new)
- Analyzer: scripts/analyze-scaleclimb-b.js (new)
- Panel builder: scripts/build-scaleclimb-panels-20261114.js (new)
- Proof: scripts/test-scaleclimb-b-20261114.js (new; static 41/41,
  game 23/23 on smoke seed 98801)
- Per-seed JSON: evidence/2026-11-14/perseed-scaleclimb-b/ (16 files)
- Analysis JSON: evidence/2026-11-14/scaleclimb-b-analysis.json
- Pilot log: evidence/2026-11-14/scaleclimb-b-pilot.log
- Panel: evidence/2026-11-14/scaleclimb-panel.{json,md}
  (+ -before/-after .json.gz pair)
- Evidence: this file

## Commits (branch sim-scaleclimb-b)

- 7113f11ec prereg (G1/G2/G3 bars)
- 29a794df6 instrument: policy + driver + analyzer + panel builder
  + proof test (static 41/41, game 23/23 on smoke seed 98801)
- (this commit — pilot corpora + analysis JSON + panel + evidence)

## Findings for the backlog (coordinator owns sim-findings.md)

1. **Holding is the next lever, not forming.** The scale-climb
   lever climbs (regional 70→32d, polity 5/8) but does not hold:
   3 of 5 polities dissolve by day 76–124 as trust decays below
   40. Root cause is the PANTRY, not the tend predicate: 194
   blocked tends on 98803 (pantry 4–12k vs the 20k tend gate);
   the tend predicate already fires on any below-bar link. A
   follow-up arm should test a pantry-first hold or a cheaper
   tend — retuning the predicate alone changes nothing.
2. **End-state diplomacy misjudges a flickering quantity.**
   Diplomacy was positive mid-run on 5/8 seeds (peaks to 136,
   held up to 83 days) and 0 at end on 3 of them. Future arms
   should judge held-days + ever-counted, with the end-state read
   alongside, never as the judge. (Metric revision owed; see
   metric review §§1–2.)
3. **The polity needs three seasoned AT ONCE.** Stagger kills it
   as surely as decay: 98805 seasons 4 links and scores 0 because
   no three ever overlap. Propose early and together.
4. **Unanswered national beats throttle late proposing** (327
   blocked-propose days band-wide). A later arm wanting late
   splinter links must answer the beats or lift the block.
5. **Say-capture cap fills by day ~28.** The polity's dissolution
   has no played line in the evidence — future recorders should
   filter to link/polity lines only.

## Convergence state

BUILD — NO-GO against the preregged G2 bar (diplomacy > 0 at end
on 2/8 vs the 6/8 bar; polity half passed 5/8). The axis line
updates from this run's numbers only: the scale climb is closed
(regional 70→32d, polity 5/8); the hold is open (end diplomacy
2/8, 3 of 5 polities dissolved). No confirm band is licensed.
The next arm on this axis is a HOLDING lever (pantry-first or
cheaper tend), not a re-measure of forming.
