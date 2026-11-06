# Link-seeking probe — Loop B verdict (run fleshout-loop-b-20261106T0730Z, arm sim-linkseek-b)

Axis: winnability chain (standaccum-b next blank #1 — why competent
play never forms a link). POLICY-SIDE ONLY, zero src/js. No gate /
price / deed change. No game-code change. Do NOT rebuild
villager-initiated bonds (separate main-session build). Do NOT touch
Loop A's live arms or flee-repair (STEVE CALL).

## Pre-registration (committed before any judged sim)

Full text: `evidence/2026-11-06/sim-linkseek-b-prereg.md`
(commit cf77307bc). In short: two legs per seed on IDENTICAL
seeds — BASELINE `competent` verbatim, ARMED `linkseek`
(competent + travel to known villages + codex study + leadcourt
propose/answer/tend parameters verbatim) — 150d death-aware
horizon, pilot band 56001–56008, confirm band 57001–57008
reserved. GO iff armed forms >= 1 seasoned link on >= 2/8
seeds AND diplomacy standing > 0 on those seeds. Guards:
median survival armed >= 0.8x baseline; total wave-4 ledger
points armed >= 0.5x baseline total (vacuous if baseline 0).

## Verdict — GO (pilot) + GO (confirm, stronger)

Pilot (56001–56008): GO — 4/8 seeds seasoned-link, guards pass
(survival 86 -> 97, ratio 1.13; ledger4 6 -> 3, exactly the
0.5x boundary). Confirm (57001–57008, fresh seeds): GO — 7/8
seeds seasoned-link, guards pass (survival 90 -> 100, ratio
1.11; ledger4 3 -> 9, kills UP). Pooled 16 seeds: seasoned
links on 11/16 armed seeds, 0/16 baseline. The policy IS the
lever (prereg Stage 1): `scripts/policies/linkseek.js` is the
landed competent-variant, committed on this branch with its
measured standing effect; `competent` itself stays the pinned
scale-free baseline (MEASUREMENT.md §2), so the lever lives as
the separate `linkseek` policy + panel-registry entry, not as a
change to competent.

## THE ANSWER (plain words)

Villages were never strangers. They were never asked.

Under competent play the scholar knows other villages by day 4
on 15 of 16 seeds — a rumor delivered on day 2 or 3, or smoke
seen while foraging — and then never once proposes a bond,
because competent contains no ask at all (0 `proposeLink`
calls on 16/16 baseline seeds, pinned by a live 30-day spy
test). When the seeking policy asks, the villages say yes:
47 proposals across pilot + confirm, 45 accepted outright,
2 answered with a counter-offer — and both counters were
answered the next day and formed the link. Nobody declined.
Nobody shut the door. The bond forms at trust 30, seasons at
30 days if trust holds 40+, and the moment the third
subordinate seasons, the realm exists and all three pay at
once: diplomacy jumps 0 -> 102 in a single step. The road was
never blocked at the door. It was never walked.

What still blocks it is the HOLD, not the ask: a new link
starts at trust 30 and must climb to 40 while tribute
shortfalls and deaths bleed it back down. On the seeds where
the third link bled out — trust 40 sliding to 8, or 47 to 6
before the link dissolved — the realm never formed and
diplomacy stayed 0. The ask is free. Keeping the promise is
the work.

## Classification (the prereg question, answered)

Baseline leg, 16/16 seeds: `never-accepted`. Max known
villages 3–7 per seed; first-known day 4 on 15/16 (56003
pilot: day 33, the lone late seed — a rumor delivered day 32).
`never-met` fired on 0/16 seeds. The classification is not
close: knowledge arrives in the first week under ordinary
competent play; the ask never happens.

Armed leg, where links still didn't pay (5/16 seeds):
- `seasoning-blocked` (trust bleed): pilot 56003, 56006;
  confirm 57008. Formations happened, seasoning didn't —
  trust fell below 40 and stayed there (56003: links ending
  trust 15–39; 56006: one link bled 30 -> 0 over 75 days;
  57008: its only link bled 47 -> 6 and dissolved).
- `seasoned-no-diplo` (realm threshold, NOT a bug): pilot
  56001, 56002 — two links seasoned (trust 52–75) but
  diplomacy 0, because LEAD regional+ needs
  `polityOf('haven')`, which needs >= 3 SEASONED
  subordinates (code: standing.js `_linkRegionalPlus`,
  hierarchy.js `polityOf`). Two seasoned bonds are a pact,
  not a realm; the third seasoning pays all three at once.
  On the four pilot GO seeds the third link seasoned on day
  63–90 and diplomacy went 0 -> 102 that same day or days
  later. This resolves the pilot's apparent paradox in code,
  not in the metric.

## Per-seed tables

### Pilot 56001–56008

| seed | base days | base known (first) | base peak gated | armed days | armed prop (outcomes) | travel/study | formed/seasoned/dissolved | armed peak diplo | armed peak gated | armed class |
|------|-----------|--------------------|-----------------|------------|----------------------|--------------|---------------------------|------------------|------------------|-------------|
| 56001 | 71 | 6 (d4) | 199 | 67 | 3 (3 formed) | 32/0 | 3/2/0 | 0 | 180 | seasoned-no-diplo |
| 56002 | 108 | 6 (d6) | 175 | 92 | 3 (3 formed) | 13/3 | 3/2/0 | 0 | 100 | seasoned-no-diplo |
| 56003 | 74 | 5 (d33) | 199 | 97 | 3 (3 formed) | 3/2 | 3/1/0 | 0 | 25 | seasoned-no-diplo* |
| 56004 | 111 | 3 (d4) | 250 | 90 | 3 (3 formed) | 37/3 | 3/3/0 | 102 | 199 | seasoned-link |
| 56005 | 86 | 5 (d4) | 185 | 82 | 3 (3 formed) | 21/2 | 3/3/0 | 102 | 99 | seasoned-link |
| 56006 | 83 | 3 (d4) | 125 | 129 | 3 (3 formed) | 12/3 | 3/1/0 | 0 | 199 | seasoned-no-diplo* |
| 56007 | 86 | 5 (d4) | 160 | 132 | 3 (3 formed) | 55/3 | 3/3/0 | 102 | 199 | seasoned-link |
| 56008 | 121 | 5 (d4) | 199 | 138 | 3 (3 formed) | 23/5 | 3/3/0 | 102 | 199 | seasoned-link |

*56003/56006 are the trust-bleed seeds (seasoning-blocked in
substance; the classifier calls them seasoned-no-diplo because
>= 1 link seasoned but peak diplomacy stayed 0 — the realm
never formed). 56001/56002 are the pure two-seasoned realm
threshold. All four share peak diplomacy 0 for different
reasons; the distinction is in the trust trajectories, §"The
hold".

### Confirm 57001–57008

| seed | base days | base known | base peak gated | armed days | armed prop (outcomes) | travel/study | formed/seasoned/dissolved | armed peak diplo | armed peak gated | armed class |
|------|-----------|------------|-----------------|------------|----------------------|--------------|---------------------------|------------------|------------------|-------------|
| 57001 | 90 | 4 | 140 | 100 | 3 (3 formed) | 1/2 | 3/3/0 | 102 | 199 | seasoned-link |
| 57002 | 90 | 4 | 155 | 79 | 3 (3 formed) | 35/0 | 3/3/0 | 102 | 199 | seasoned-link |
| 57003 | 76 | 5 | 140 | 78 | 3 (3 formed) | 49/2 | 3/3/0 | 102 | 177 | seasoned-link |
| 57004 | 79 | 7 | 75 | 150 survived | 3 (3 formed) | 37/1 | 3/3/0 | 102 | 199 | seasoned-link |
| 57005 | 150 survived | 4 | 199 | 147 | 3 (3 formed) | 7/3 | 3/3/0 | 102 | 199 | seasoned-link |
| 57006 | 69 | 4 | 150 | 82 | 3 (3 formed) | 14/2 | 3/3/0 | 102 | 152 | seasoned-link |
| 57007 | 108 | 4 | 199 | 113 | 4 (3 formed, 1 counter) | 8/1 | 4/3/1 | 102 | 199 | seasoned-link |
| 57008 | 96 | 3 | 25 | 69 | 1 (1 counter) | 1/1 | 1/0/1 | 0 | 25 | seasoning-blocked |

Confirm notes: 57007's counter (d25) was answered d26 and
formed the link; a fourth link formed d80 after the first
dissolved (the 3-sub cap counts ACTIVE subs). 57008's only
proposal countered d27, was answered and formed d28, then
bled 47 -> 6 and dissolved; the village died d69. 57004
armed is the run's only armed survivor (150d). Baseline
57005 also survived 150d.

## The lever, measured

- Proposals: 47 pooled (24 pilot + 23 confirm). 45 formed
  outright, 2 countered, 0 declined, 0 shut-door. Both
  counters answered the next day and formed (57007 d25->d26,
  57008 d27->d28). First proposal day 25–58 (leadcourt's
  day>=25 rule; the late seeds waited on the pantry>12000
  guard — see next blanks).
- Links formed: 47 pooled (24 pilot + 23 confirm). Seasoned
  links: 18 pilot + 21 confirm = 39. Dissolved: 0 pilot,
  2 confirm (57007's first link, 57008's only link).
- Diplomacy: baseline 0 on 16/16 seeds. Armed peak 102 on
  11/16 seeds (4 pilot + 7 confirm). The 102 arrives as a
  step, not a slope: 0 until the third subordinate seasons,
  then 34 x 3 at once.
- Travel leg: 3–55 travel legs per armed seed; studies 0–5.
  Travel does not always arrive (walkTo stops on refusal;
  competent.daily pulls the scholar home, so the seeker
  commutes — 57007 walked to Thornfield on d15, d17, d19,
  d20, d21, d23, d29). Presence is NOT needed to propose —
  proposals form remotely on knowledge alone — so travel's
  payoff is the codex study (+3 opinion, real knowledge:
  "You study Emberhold's codex (fisher). Learned: Taro
  (L2), Water Chestnut (L2), Colocasia..."). Studies fired
  on 14/16 armed seeds.
- Guards: median survival pilot 86 -> 97 (1.13x), confirm
  90 -> 100 (1.11x). Wave-4 ledger points pilot 6 -> 3
  (exactly the 0.5x boundary — thin, see metric review),
  confirm 3 -> 9 (kills UP), pooled 9 -> 12.

## The hold (trust trajectories — the next problem)

Links form at trust 30 and need 40+ at day 30. Weekly
tending (+8, leadcourt's rule, pantry>20000) lifts them —
56003's Emberhold link hit 49 by day 39 — and then a slow
bleed eats it back: -1 to -2 every few days, past 40, past
30, to 15 or 0. The bleed's named eaters in code are tribute
shortfalls (the subordinate's own pantry pays 4,000
kcal/week; a shortfall costs trust and accrues arrears),
speaker deaths (-8, 7-day mourning choke on gains), and
neglect. Which eater dominates per link-week was NOT
instrumented in this run (tends are not in the court log) —
that is next blank #1. Examples: 57007's Emberhold link
40 -> 8 over 86 days and never seasoned while its two
sisters hit trust 100 and 88; 57008's only link 47 -> 6 in
37 days, then dissolved; 56006's Emberhold link 30 -> 0.

## Wall numbers (this run, pilot + confirm pooled)

End-of-run scale rank (analyzer, 16 seeds per leg):

| leg | wins | national+ (end) | table (end) | wave-4 unlock | wave-4 faced | wave-5 unlock | median days | survivors (150d) |
|-----|------|-----------------|-------------|---------------|--------------|---------------|-------------|------------------|
| baseline | 0/16 | 0/16 | 0/16 | 14/16 | 14/16 | 1/16 | 88 | 1/16 |
| armed (linkseek) | 0/16 | 8/16 | 0/16 | 13/16 | 13/16 | 0/16 | 99 | 1/16 |

- End-rank national+: armed 8/16 (pilot 56004 global +
  56005 national; confirm 57001/02/04/05/07 global +
  57003 national) vs baseline 0/16. National is now
  reachable on the diplomacy road in this probe's terms.
- Peak rank (balanced panel, pilot only): armed national+
  4/8 (56004 global, 56005/07/08 national) vs baseline
  0/8 — 56007/56008 peaked at national and ended regional
  when a link un-seasoned. National is a LIVE state, not a
  title: it clears when the realm dissolves.
- Table (panel, pilot): ever-reached 3/8 armed (56001,
  56004, 56006) vs 0/8 baseline; ENTERED 0/8 both legs.
  The table is touched, never sat.
- Wave-5 unlock: baseline 1/16 — pilot 56004 unlocked wave
  5 at ~day 110 (gated 199 -> 250) with NO snapshot showing
  readiness-5 met (veterans 1 at d110, armed 5 of 6). The
  unlock window fell between daily snapshots: a wave-4 kill
  on d110 most likely made the second living veteran, the
  readiness flickered true, wave 5 unlocked, and the village
  collapsed the next day (veterans 0 at d111, village lost).
  Reported as observed with the mechanism as between-
  snapshot inference, not as a named day/bar. Armed
  wave-5 unlocks 0/16 — diplomacy pays the standing, but
  the door still needs 2 living veterans, and the armed
  legs faced wave 4 on 13/16 seeds without banking them.
- Death causes (panel observer, pilot): armed legs kill
  more monsters (villager:monster 45 vs 30; monster:combat
  143 vs 118) and lose more villagers in combat (221 vs
  199); starvation deaths appear only on armed legs
  (villager:starvation 5 vs 0) while deaths in the wild
  fall (player:the wild 49 vs 74). Travel costs food and
  fights; it does not cost the run (median survival up
  both cells).

## Village assessment (plain words)

Sixteen villages, each played twice — once by a scholar who
never asks, once by one who walks to the neighbors' fires and
asks. The ones who never ask know the neighbors' names by the
first week and die without ever shaking their hands. The ones
who ask are answered: three bonds each, tribute wagons at the
gate, grain going the other way, a grandmother over there who
remembers who fed her. On eleven of sixteen, the three bonds
harden into a realm and the System counts it: 102 standing
that was never there before, villages climbing from village
rank to national and even global, three of them touching the
table's edge. And still nobody wins — the fifth wave's door
still wants two living fighters who have killed its beasts,
and the bonds don't fight that fight. The village that
survived longest (57004 armed, the full 150 days) had its
realm and its standing and still never faced wave 5. What the
probe filled is the diplomacy blank: bonds are a live road
now, measured. What it leaves is the holding of them — trust
bleeding out faster than grain can buy it back — and the
veterans the door still waits for.

## Sense-test (quoted lines)

Formation, tending, and tribute lines are coherent against
the numbers on every sampled seed:

- "⛓️ Autumn brings it home: Ashford bows to Haven — one
  organization, us primary. Tribute: 4,000 kcal/week. The
  relationship starts at trust 30. Everything from here is
  earned." (56001 armed d25 — matches the link formed that
  day at trust 30.)
- "🌾 Haven sends 1,500 kcal of grain to Ashford's fire —
  not tribute, the other way around. Someone's grandmother
  over there will remember who fed her. (Trust +8.)"
  (56001 armed d26/d28 — the weekly tend, landing as the
  trust trajectory shows.)
- "🌾 Tribute wagons from Ashford turn at the gate — our
  shelves are full past tomorrow. 'Eat well,' we send back.
  'That IS your tribute this week.' (Trust +1.)" (56001
  armed d28.)
- "You see smoke on the horizon. Thornfield — 10 people, 3
  days in. foragers, by the look of it. They know 4 plants
  — 4 new to you. They've been here the whole time."
  (56004 armed d3 — the first-sight line names a real
  village, a real population, real knowledge; it is the
  moment the village becomes known.)
- "You study Emberhold's codex (fisher). Learned: 🌿 Taro
  (L2), 🌿 Water Chestnut (L2), 🌿 Colocasia (A..."
  (56004 armed study — the travel leg's payoff is real
  knowledge, not a flag.)
- No decline, counter-refusal, or shut-door line appears in
  any armed seed's corpus — matching the 0 declines in the
  court log. The counter band's one firing in each cell was
  answered and formed; the negotiation is played, and the
  lines say so.
- Filter noise (instrument note, not a game finding): the
  say filter's "counter" matches pantry-counter lines
  ("2 unprocessed hauls onto the counter") and the 200-line
  cap fills by ~day 5 on baseline seeds, so late-run
  standing-door lines were never sampled (baseline 56004's
  wave-5 unlock has no sampled standing line). See metric
  review.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- The GO bar held as written (seasoned event + peak
  diplomacy > 0 on the seed). The pilot's 4/8 and the
  confirm's 7/8 are both GO; pooled 11/16.
- The ledger-4 guard's pilot margin was exactly the
  boundary (3 vs 6 = 0.5x). Pooled it is 12 vs 9 (kills
  up), so the guard is not a concern in aggregate — but a
  future arm with a thinner margin should not lean on a
  single cell's 0.5x landing.
- Say filter: "counter" must go (pantry noise) or the cap
  must rise with per-week sampling; as run, the baseline
  corpus is front-loaded to the first week.
- Balanced-panel `compare`: returned "invalid — unmatched
  policies / unmatched cases". That is the tool's flag-flip
  shape, not a failure of the comparison: `comparePanels`
  matches identical policy sets across two panels (a flag
  on/off), while this run compares two POLICIES. Per the
  sim-awayeve-b precedent, the §15 instrument for
  policy-vs-policy is the matched-seed paired comparison
  (identical seeds, same harness, same instrument) that
  this analyzer performs — and the combined panel
  (both policies, one panel) is attached for the
  observer-neutral 23-metric rows. The two single-policy
  panels and the invalid compare output are kept in
  evidence/2026-11-06/ as the record of the attempt.
- Telemetry deviation check: LOUD lines for national /
  table / wins "disappeared" (baseline 12/16/16 -> current
  0). Investigated, NOT a regression: (1) the baseline
  file's own `_regime` note says never to compare pre-seat
  / courtship substrates against the winseat full-win-stack
  regime — wins are structurally ~0 there and the check
  fires spuriously; (2) my per-seed schema has no
  top-level `national`/`table`/`wins` fields (scaleRank is
  nested; `won` is a boolean), so the checker counted
  missing paths as 0. The real wall comparison is the
  analyzer + panel above.
- Confirm band is 8 seeds, not the 12–16 standard — the
  reserved band held 8. Pooled pilot + confirm = 16 seeds,
  which meets the standard in aggregate; cite the pooled
  n, not either cell alone, for the headline.
- `check.js --quick`: 283 passed, 7 failed (measurement
  proof-update, measurement-workflow neutrality, mobile
  combat cadence, occupation panels, phone-frame proof,
  capable-bot food deed, establishment r20 voice gate).
  All 7 are pre-existing on the pristine base: stashing
  the registry edit and re-running the measurement
  workflow test reproduces its failure ("retained
  neutrality proof covers the current Game/controller/
  harness inputs"). None touches sweep-compare, linkseek,
  standing, or hierarchy. My change is scripts-only.
- Analyzer note: `linkseek-analyze-20261106.js` reads
  SEEDS from the environment when set (pilot default
  56001–56008); the confirm run used RUN=linkseek-confirm
  SEEDS=57001..57008.

## Next blanks, in order

1. The HOLD — trust bleed (this arm's finding): links form
   at 30, need 40+ at day 30, but trust bleeds faster than
   weekly +8 tends on ~half the seeds. Next arm: instrument
   per link-week (tribute shortfall vs speaker death vs
   defense refusal vs neglect) and test a hold lever
   (tend cadence, tribute sizing, or demand answering).
2. Veterans-production + killer survival (vetbar blank 1,
   still open, now sharpened): diplomacy pays 102, but the
   199-hold on the three 199-held pilot seeds and the 0/16
   armed wave-5 unlocks are a veterans problem wearing a
   standing costume. Standing opened the door; veterans keep
   it shut.
3. First-proposal delay (25–58 days): why 56006/56008
   proposed 3–5 weeks late — pantry guard, travel time, or
   scholar position? Name it before tuning the day>=25 rule.
4. Splinter nuance (correction to standaccum's shorthand):
   a seasoned splinter link DOES count once the polity
   exists (57007's splinter seasoned d112, regional d113) —
   `polityOf` counts any seasoned subordinate. What a
   splinter cannot do alone is create the polity; the
   shorthand "splinter scores 0" is wrong as stated.
5. Travel-leg marginal value: proposals form remotely on
   knowledge alone; travel's payoff is the codex study.
   A leaner seeker (propose-first, travel-only-to-study)
   is the next policy variant to test against this one.

## Proof and landing

- Proof: `scripts/test-linkseek-20261106.js` — 11/11 PASS
  (pickTarget perception gate x4, classification rules x2,
  link-event derivation, live instrument smoke, live
  10-day linkseek run with zero instrument errors,
  determinism leg, baseline pin: competent makes ZERO
  proposeLink calls in 30 live days). Re-run post-registry
  edit: still 11/11.
- `check.js --quick`: 283 passed, 7 failed — all 7
  pre-existing (see metric review).
- Balanced panel: combined panel
  `evidence/2026-11-06/panel-linkseek-both/` (16 cases,
  validity sourcesStable true, neutrality proofs match on
  both policies, cohort issues none). Single-policy panels
  `panel-linkseek-before/` and `panel-linkseek-after/` plus
  the invalid `sim-linkseek-b-compare.{json,md}` kept as
  the record of the compare attempt (see metric review).
- Commits (this worktree branch sim-linkseek-b; coordinator
  merges via --ff-only; merged locally, pending ship — no
  push, no bump, no live verification by this worker):
  - cf77307bc sim-linkseek-b prereg (before any judged sim)
  - 6939c4e70 sim-linkseek-b instruments + proof 11/11
    (zero src/js)
  - 8a05463c1 sim-linkseek-b register linkseek in panel
    registry (additive, pattern as leadcourt)
  - (pilot + confirm + evidence commit below)
- Files: prereg + evidence in `evidence/2026-11-06/
  sim-linkseek-b*.md`; per-seed JSON in
  `evidence/2026-11-06/perseed-linkseek-b/` (16 pilot +
  16 confirm legs + 2 analysis JSONs); panels in
  `evidence/2026-11-06/panel-linkseek-*/`; scripts
  `policies/linkseek.js`, `linkseek-instrument-20261106.js`,
  `linkseek-driver-20261106.js`,
  `linkseek-analyze-20261106.js`,
  `test-linkseek-20261106.js`; registry entry in
  `scripts/sweep-compare.js` (additive try/catch).
- Index-clobber note: safe-commit.sh left bogus staged
  deletions in the main index after the prereg, instruments,
  and registry commits (and a staged removal after a
  stash pop); repaired each time via HEAD-blob
  `update-index --cacheinfo` and verified `git status`
  empty + `git diff HEAD` empty. The commits themselves
  were always correct.
- Worktree state at handoff: only committed work; no
  uncommitted leftovers beyond the pilot + confirm +
  evidence commit below (verified before reporting).
