# sim-onlylead2-b — the covenant road on a 200d horizon: PILOT NO-GO (1/8 staged)

Run: fleshout-loop-b-20261115T1130Z (Loop B), arm sim-onlylead2-b
Axis: winnability chain. Covenant-road staging arm — the follow-up to
sim-onlylead-b Stage 2 (killed 1055Z as SUBSTRATE-MISSING on 150d).
Branch: sim-onlylead2-b — worktree ~/workspace/worktrees/sim-onlylead2-b
Base: master at worktree creation (tip 1ca2c257d)
Date: 2026-11-15
Prereg: evidence/2026-11-15/sim-onlylead2-b-prereg.md (binds G1/G2/G3
+ cost bar; substrate probe + instrument changes frozen before the
pilot; pilot band 100421–100428, confirm 100429–100436 + 100441–100448)

## Verdict: PILOT NO-GO — G2 1/8 vs ≥3/8; cost bar also fails (starvation 8 vs 3)

- **G1 INSTRUMENT VALIDITY — GO.** Full per-day link roll +
  shape-candidate roll on all 16 configs, **0 instrument errors**,
  **0 UNCLASSIFIED shapes** across all 40 shape-seed cells per leg
  (bar ≤1 per 8 seeds). Every staged beat classified by shape with
  sat/unsat: 1 covenant beat (100422, answered 'pact', sat) and 6
  baseline lead beats (staged-but-unanswered, sat 0/0 — the
  baseline never answers). The analyzer's new `blockers` array
  names ALL failing gates per shape (see below).
- **G2 THE LEVER — NO-GO.** COVENANT BEATS STAGED on **1/8**
  pilot seeds (bar ≥3/8). The one staging is real — 100422's
  Founding Council, answered 'pact', sat, national held 31 days —
  the first covenant beat EVER staged in live play on a judged
  band. But it does not reproduce: 5/8 seeds never form a single
  peer link, 1/8 forms 2 links and dies before the third, 1/8
  forms 3 links and seasons none. A miss on G2 = NO-GO, never
  re-scored mid-run. **No confirm is spent** (a confirm does not
  rescue a NO-GO); the reserved confirm band 100429–100436 +
  100441–100448 stays fresh and unused.
- **G3 LEVER-ONLY — GO.** Zero `src/js` changes in the branch
  diff; proof tests green (test-covenant-b 33/33 re-verified on
  this tip; test-onlylead2-b 25/25 incl. 200d game smoke +
  determinism; test-onlylead-b 29/29 still green after the
  analyzer extension).
- **COST BAR — FAILS.** Starvation deaths pooled covenant **8**
  vs baseline **3** (bar ≤ baseline + 2 = 5). Median survival
  covenant 133.5d ≥ 0.8× baseline median 121d = 96.8d (passes).
  The starvation is concentrated: 100425 covenant starved 5 (vs
  1 baseline), 100424 covenant starved 3 (vs 0) — both seeds
  formed NO peer links and paid NO tend kcal, so the starvation
  is trajectory divergence between the two policies, not the
  covenant spend (the only tend spend in the band, 27,000 kcal
  across 100422 + 100426, sits on seeds that starved 0). The
  cost bar is judged as written: FAIL. Guardrail (§14c):
  villager combat deaths exceed the before leg by >50% on TWO
  seeds — 100425 (73 vs 38, +92%) and 100428 (96 vs 49, +96%);
  both covenant legs lived longer than their baselines (131 vs
  67 days; 136 vs 130), so longer life bought more fights and
  more combat deaths. Pooled villager combat deaths 531 vs 499
  (+6.4%).

## The answer in one paragraph

The covenant road opens — once. On seed 100422, three villages
swear the covenant in three days, the links season, and on day
128 the speakers sit in a circle with no throne and no kneeling,
swear the war-pact, and Haven becomes a nation of equals, holding
31 days until the village dies. That is the first time the
Founding Council has ever been played instead of unit-tested. But
seven villages out of eight never get there, and the reasons split
three ways: five never even open the gate — opinion 10, the
price of a first proposal, never arrives before the village dies,
even on 100424, which lived 189 days and knocked 66 times; one
forms two links and dies at 81 days, fifteen days before the rung
would even have allowed a beat; and one forms all three links and
seasons none of them, because the village is too poor to pay the
1,500 kcal tend that seasons a link. The road is real, it is
walkable, and it is gated three deep — opinion, pantry, and the
calendar — so on this band it stages once in eight, not three.
The policy stays a proven instrument; the game does not change.

## Per-seed per-shape table (covenant leg — the judged leg)

`q` = days the shape qualified (its engine predicate non-null);
`nat` = first national day; `held` = national held days. The
`blockers` column names ALL failing gates (the onlylead2
improvement); the primary blocker is first. Baseline leg (lead
road): lead staged-but-unanswered on 6/8 seeds (100422, 100423,
100425, 100426, 100427, 100428 — pending 6–86 days, never
answered); 100421 subs-short:0, 100424 subs-short:2; all other
shapes' blockers on the baseline are the DIAG's (conquest /
covenant / trade no-attempts 8/8; belong split, now multi-gated —
see below).

| seed | lead | conquest | belong | covenant | trade | nat / held | days | end |
|------|------|----------|--------|----------|-------|------------|------|-----|
| 100421 | lead-subs-short:0 (q0) | conquest-no-raids (q0) | belong-no-sub-link (q0) | covenant-no-peer-links (q0) | trade-no-peer-links (q0) | — / 0 | 93 | lost |
| 100422 | lead-subs-short:1 (q0) | conquest-no-raids (q0) | belong-no-sub-link (q0) | **STAGED sat (q32, first q127)** | trade-no-peer-links (q0) | 128 / 31 | 158 | lost |
| 100423 | lead-subs-short:0 (q0) | conquest-no-raids (q0) | belong-no-sub-link (q0) | covenant-no-peer-links (q0) | trade-no-peer-links (q0) | — / 0 | 100 | lost |
| 100424 | lead-subs-short:0 (q0) | conquest-no-raids (q0) | belong-no-sub-link (q0) | covenant-no-peer-links (q0) | trade-no-peer-links (q0) | — / 0 | 189 | lost |
| 100425 | lead-subs-short:0 (q0) | conquest-no-raids (q0) | belong-no-sub-link (q0) | covenant-no-peer-links (q0) | trade-no-peer-links (q0) | — / 0 | 131 | lost |
| 100426 | lead-subs-short:0 (q0) | conquest-no-raids (q0) | belong-no-sub-link (q0) | covenant-seasoned-short:2-of-2 (q0) | trade-no-peer-links (q0) | — / 0 | 81 | lost |
| 100427 | lead-subs-short:0 (q0) | conquest-no-raids (q0) | belong-no-sub-link (q0) | covenant-seasoned-short:0-of-3 (q0) | trade-no-peer-links (q0) | — / 0 | 162 | lost |
| 100428 | lead-subs-short:0 (q0) | conquest-no-raids (q0) | belong-no-sub-link (q0) | covenant-no-peer-links (q0) | trade-no-peer-links (q0) | — / 0 | 136 | lost |

Blocker rollup (covenant leg, 8 seeds): lead subs-short:0 ×6,
subs-short:1 ×2; conquest no-raids 8; belong no-sub-link 8;
covenant staged 1, no-peer-links 5, seasoned-short:2-of-2 ×1,
seasoned-short:0-of-3 ×1; trade no-peer-links 8. UNCLASSIFIED 0.
Lead beats on the covenant leg: 0 (isolation held — the leg
proposes no lead links; the single seasoned Haven-primary sub on
100422/100427 is engine-formed, see below).

## The covenant road, seed by seed (propose timeline)

Band-wide on the covenant leg: **462 proposeCovenant calls** (all
policy-called; 0 engine calls), **454 prerequisite refusals**
(opinion <10 — the engine refuses before judging, no -5, no
cooldown), **8 accepted, 0 counters, 0 declines, 0 shut doors**.
8 peer links formed (all via proposeCovenant); 18 tends paid
(27,000 kcal — all on 100422 + 100426). The verb table settles
the DIAG's question in live play: the policy walks the road now,
and the engine still never proposes a peer link or raids on its
own (0 proposeTrade / raidVillage calls by either caller).

- **100421 — the gate never opens (probe-confirmed).** 58
  proposes, ALL prereq refusals. Max known opinion 8 (probe),
  village lost day 93. No link, no tend, nothing to season.
- **100422 — THE STAGING (the road works).** First non-prereq
  day 95: village_2 accepts, then village_spl_31_13426 (d96) and
  village_1 (d97) — three links in three days. 9 tends paid
  (13,500 kcal). All three seasoned; the shape first qualifies
  day 127 (32 qualified days); the Founding Council stages day
  128, is answered 'pact' the same day, sat; national day 128,
  held 31 days; village lost day 158. First regional day 61,
  rung day 91 — the rung was passed well before the links
  seasoned. The gap between the probe (opinion 10 first reached
  day 48, competent-only) and the pilot (first accept day 95)
  is explained, not a divergence: on day 39 the ENGINE formed
  a lead link with village_0 directly (Haven primary, trust 30)
  — the probe's opinion leader — taking it out of the covenant
  candidate pool, and the policy then knocked on village_2's
  door from day 40 until its opinion reached 10 on day 95 (see
  "The engine courts too", below).
- **100423 — the gate never opens.** 53 proposes, ALL prereq
  refusals. Lost day 100.
- **100424 — the gate never opens, even with 189 days.** 66
  proposes, ALL prereq refusals — the longest-lived village in
  the band, and opinion 10 never arrived. Lost day 189.
  (Pantry was the binding constraint on attempts too:
  proposeBlockedPantry 114 days.)
- **100425 — the gate never opens.** 45 proposes, ALL prereq
  refusals. Lost day 131. Starved 5 (cost-bar driver — see
  verdict).
- **100426 — two links, dead before the rung.** First accept
  day 47 (village_0), second day 48 (village_2); both seasoned
  (9 tends, 13,500 kcal). But the village died day 81 — and the
  rung day was 96 (first regional day 66). Even a third link
  formed day 50 and seasoned day 80 could not have staged a
  beat before death: the rung, not the links, is the binding
  gate here. The analyzer names seasoned-short:2-of-2 (the
  road-state read); the rung is the silent second gate (see
  metric review #4).
- **100427 — three links, none seasoned (the pantry gate).**
  Links formed day 69, 87, 144 — but **0 tends paid** all run:
  the tend gate (pantry > 20,000 kcal) never opened on a village
  whose pantry sat under 12,000 kcal on 89 propose-blocked days.
  Trust stayed at 30, below the 40+ seasoned bar, so
  seasoned-short:0-of-3. The rung (day 93) had passed; with
  tends the beat could have staged ~day 117. The road here is
  gated by the pantry, not by opinion or the calendar.
- **100428 — the gate never opens.** 83 proposes — the most
  knocks in the band — ALL prereq refusals. Lost day 136.

## The blockers, shape by shape

- **COVENANT — the judged shape: 1/8.** Three failure
  families, not one: (a) opinion-never-10, 5/8 (100421, 100423,
  100424, 100425, 100428) — 454 prereq refusals band-wide, 0
  declines, 0 counters: the villages are never asked and never
  refuse; they just never know Haven well enough to be asked.
  The 1055Z probe's ~2 opinion points per 30 days does NOT hold
  band-wide — on 100424 opinion never reached 10 in 189 days.
  (b) rung + death, 1/8 (100426) — two links seasoned, village
  dead 15 days before the rung. (c) tend/pantry, 1/8 (100427) —
  three links formed, zero tended, none seasoned. The staging
  bar needed three villages to clear ALL THREE gates; only one
  did.
- **LEAD — isolation held, 0 staged on the covenant leg.**
  Max 1 seasoned Haven-primary sub (100422, 100427 — both
  engine-formed links, see below); 0 on the other six. The
  baseline leg stages lead 6/8 (unanswered). The covenant leg
  never shadows lead and lead never shadows it — the two roads
  were run clean apart.
- **CONQUEST — never attempted, 8/8.** 0 conquered subs, 0
  raidVillage calls by either caller. Unchanged from the DIAG.
- **BELONG — never a subordinate on the covenant leg, 8/8
  no-sub-link.** On the baseline leg the multi-gate improvement
  pays off immediately: 100421's link fails TWO gates
  (`belong-arrears:30000` + `belong-foreign-small:2`), 100424's
  fails two (`belong-arrears:5000` + `belong-foreign-small:0`),
  and 100426's fails THREE (`belong-trust-short:48` +
  `belong-arrears:5000` + `belong-foreign-small:0`) — the DIAG
  named only the first gate on each. blockedByAll counts the
  full picture: belong-arrears:5000 on 2 seeds, foreign-small:0
  on 2, foreign-small:2 on 1, trust-short:48 on 1. Belong's
  lever is still arrears-paying / counter-farming, not a road
  walk — not this arm.
- **TRADE — never attempted, 8/8.** Identical to covenant's
  absence, one road further down. Trade is the next road after
  covenant, not this arm.
- **SHADOWING — none observed.** No non-covenant shape ever
  qualified on the covenant leg (q0 everywhere except 100422's
  covenant q32), so no shape was ever shadowed. The priority
  order never had to choose.

## The engine courts too (finding — the d39 lead link)

On 100422, day 39, the ENGINE formed a lead link with village_0
directly (`_formLink` via engine-direct, Haven primary, trust 30)
— a link the policy never proposed. Village_0 was the probe's
opinion leader (opinion 12 at day 60, 16 at day 90 competent-only)
and the policy's own first pick (proposed days 10–39). Once
linked, the policy skips it (one organization, one link) and
moves to village_2 — whose opinion took until day 95. Two
consequences: (1) the probe (competent-only opinion trajectory)
is an approximation of the covenant leg, not a prediction — the
engine's own courtship removes candidates from the covenant pool
mid-run; (2) the engine DOES court Haven (lead links), just never
peer links. The DIAG's "engine never proposes" holds for peer
proposals and raids only. Filed to the backlog: a covenant policy
that cannot see engine courtship wastes its best candidate on a
village that just left the pool — and an engine lead link is a
competing claim on the same village, not a neutral event.

## Wall numbers (scale wall, every run)

| | baseline (scaleclimb) | covenant (covenant-b) |
|---|----------|-------|
| National ever | 0/8 | **1/8 (100422, covenant)** |
| National at end | 0/8 | 1/8 |
| Table / wins | 0 / 0 | 0 / 0 |
| Wave 4 reached | 8/8 | 8/8 |
| Wave 5 reached | 2/8 | 4/8 |
| Median survival | 121d | 133.5d |
| Survived horizon (200d) | 0/8 | 0/8 |
| Wave kills (w1/w2/w3/w4/w5) | 242/161/56/23/2 | 222/136/72/24/2 |
| Total deaths | 592 | 632 |
| Villager combat deaths | 499 | 531 |
| Starvation deaths | 3 | **8** |

No seed won, no seed reached the table on either leg. National
moved: 0/8 → 1/8, and for the first time the national is a
COVENANT national — a league of equals, not a realm of
subordinates. Wave 5 doubled (2/8 → 4/8) and median survival
rose 12.5 days, but every village still dies of the same fights
before day 200. The scale wall has a second rung now — one
village climbed it as equals — but it has not fallen: standing
past national, the table, and the win still never fire in 200
days.

Per-seed before/after (days, end, scale, natEver, firstNat, natHeld,
starv, deaths, vCombat, maxW, standing — B = baseline, A = covenant):

| seed | days B/A | end B/A | scale B/A | natEver B/A | firstNat A | natHeld A | starv B/A | deaths B/A | vCombat B/A | maxW B/A | stand B/A |
|------|----------|---------|-----------|-------------|-----------|-----------|----------|-----------|------------|-------------|-----------|--------------|
| 100421 | 69/93 | lost/lost | regional/regional | no/no | — | 0 | 0/0 | 66/62 | 57/46 | 4/4 | 125/199 |
| 100422 | 117/158 | lost/lost | regional/national | no/yes | 128 | 31 | 0/0 | 104/94 | 89/74 | 5/5 | 547/702 |
| 100423 | 147/100 | lost/lost | regional/regional | no/no | — | 0 | 1/0 | 73/84 | 63/71 | 5/4 | 437/195 |
| 100424 | 125/189 | lost/lost | regional/regional | no/no | — | 0 | 0/3 | 118/79 | 108/69 | 4/5 | 199/225 |
| 100425 | 67/131 | lost/lost | regional/regional | no/no | — | 0 | 1/5 | 43/79 | 38/73 | 4/4 | 177/175 |
| 100426 | 87/81 | lost/lost | regional/regional | no/no | — | 0 | 0/0 | 65/59 | 53/49 | 4/4 | 199/199 |
| 100427 | 126/162 | lost/lost | regional/regional | no/no | — | 0 | 1/0 | 56/65 | 42/53 | 4/5 | 199/275 |
| 100428 | 130/136 | lost/lost | regional/regional | no/no | — | 0 | 0/0 | 67/110 | 49/96 | 4/5 | 199/325 |

Three covenant legs lived notably longer than their baselines
(100424 +64d, 100425 +64d, 100422 +41d); one lived notably
shorter (100423 −47d). Pending-national days: covenant 1 (the
100422 beat, answered the same day); baseline 305 (six lead
beats, 6–86 days each, never answered).

## Village assessment (plain words)

Eight villages, twice each — once climbing the way they always
have, once walking the league road — and the story is the same
shape as the last band, with one village breaking it. The
villages that climb the old way climb the same way: three fires
courted young, and six of them hear themselves called a realm,
though nobody ever answers the court — the beat sits pending for
weeks, up to 86 days on 100423, while the village dies around
it. The villages that walk the league road mostly never get a
hearing at all: they knock, day after day — 454 knocks across
the band — and the answer is always the same silence, "they
barely know Haven's name." Five villages knock themselves out
against a door that never opens. One village, 100426, gets two
friends sworn and dies fifteen days before the season would
have let them sit together. One, 100427, gets all three friends
and cannot afford to feed the friendship — the grain to season
a link never stretches far enough. And one village, 100422,
does it all: three fires swear in three days, the links are
tended, the council sits, the pact is sworn, and for thirty-one
days Haven is a nation of equals — until the village dies of
the same fights, a death in the family shaking every link the
day the pact is sworn. Nobody wins, nobody sits at the table.
The wall has a second rung now, and one village stood on it.
But a road that opens once in eight villages is a rumor, not a
route.

Who thrived: 100422, the only village that turned courtship into
a league — and 100424, which lived 189 days, the longest season
in the band, without ever opening the covenant gate. Who died:
the villages that lost their fighters to wave-4 and wave-5
monsters before courtship could matter (100421 dead at 93,
100423 at 100), and the village that did everything right and
ran out of calendar (100426, dead at 81 with two seasoned
links). The binding constraint is no longer "can the road be
walked" — it is "can opinion, pantry, and calendar all hold
long enough, on the same village, at the same time."

## Sense-testing (SENSE-TESTING LAW)

The Founding Council reads like a played ceremony — and this
time it was played, on seed 100422, days 127–128. The staging
line (truncated at 400 chars by the recorder, not by the game):

> 🤝 The founding council: speakers from Thornfield, The Red
> Table II, Stonebridge sit in a circle — no throne, no kneeling.
> This league needs its first act. Swear the war-PACT (mutual
> defense — any member's call is answered, or refused aloud),
> found the shared POOL (2,000 kcal a week from every fire into
> one granary, drawn in famine), or WALK from this table for now.
> Or REFUSE the scale itself — st…

The answer, the next morning:

> 🤝 The war-pact is sworn — no throne, no kneeling, just hands
> on the table. When any member's treeline burns, the league
> answers: Haven sends hands (two villagers, three days) or
> refuses aloud and the whole league hears it. Thornfield, The
> Red Table II, Stonebridge — equals, now, in war as in council.
> The shared granary opens beside it: 2,000 kcal a week from
> every fire. (Trust +8 each.)

And the league is tested the same day it is sworn — a death in
the family shakes every link, and both partners test the
covenant in the chaos:

> 🕯️ Yuki is dead — and the dead hold no treaties. Every link
> Haven has shakes.
>
> 🕯️ Haven grieves — and Thornfield tests the covenant in the
> chaos. Their speaker wants new terms, or out. CONCEDE, HOLD,
> or RELEASE. (Trust -10.)
>
> 🕯️ Haven grieves — and Stonebridge tests the covenant in the
> chaos. Their speaker wants new terms, or out. CONCEDE, HOLD,
> or RELEASE. (Trust -10.)

Two days later, a villager says what the road means, in her own
words:

> Maya, at the fire, not quite believing it: "Four fires, no
> head. The pool's open and the pact's sworn. Ask me in a season
> if leagues work."

The tend lines read like a relationship too — the policy's weekly
grain is a played gift, nine times on 100422:

> 🌾 Haven sends 1,500 kcal of grain to The Red Table II's fire
> — not tribute, the other way around. Someone's grandmother
> over there will remember who fed her. (Trust +8.)

The other roads still have NO played lines in the captured
stream — not the Charter, not the Binding, not the Iron Court.
But the covenant road now has three kinds of played lines: the
council and its answer, the tends, and the grief-tests. The
Charter and the Binding remain code-only.

Two blemishes, filed to the backlog. First, the refusal copy —
"They barely know Haven's name — and a covenant is a
relationship, not a handshake…" — never reaches the captured
corpus at all: the driver's say-filter predates the covenant
road (no 'covenant'/'charter'/'handshake'/'codex' term in it),
so 454 played refusals left zero lines. The line is quoted here
from the engine source (`_proposePeer`), verified, not from a
captured line. Second, repetition: the Dead Phone line ("You
hold Dead Phone. Cracked screen, 2% forever…") fires 39 times
in 100422's 158-day record — 4.3% of the whole corpus, the same
line with three rotating endings — and the Muscadine sowing
line fires 19 times. A player living those days would hear the
same two sentences over and over. The village life around the
council is otherwise dense and human: aid offers arrive
unannounced ("Heard your bins are echoing…"), raids trample
gardens at night, runners beg for food, and a grieving
villager keeps setting out an extra bowl.

## Metric review (§14)

1. **G2 was the right bar, and the pilot earned its NO-GO.**
   1/8 staged with a real sat answer is not a borderline — it
   is a road that opens once. The bar (≥3/8) distinguished a
   working road from a rumor. No re-score is owed or attempted.
2. **The probe was an approximation, and the pilot proved why.**
   The probe (competent-only) said opinion 10 arrives day 48 on
   100422; the pilot's first accept came day 95. The gap is
   explained by the engine's own courtship (the d39 lead link
   with village_0 removed the probe's opinion leader from the
   pool), not by RNG divergence — `_proposePeer` refuses before
   judging, drawing no RNG. Lesson for future road arms: a
   substrate probe under the BASE policy does not predict the
   judged leg when the engine itself moves pieces on the board.
   The probe still did its §14b job (it kept the arm from
   stopping on a false SUBSTRATE-MISSING, and the pilot was not
   a foregone conclusion), but the next probe should record the
   opinion trajectory ON the judged leg (a daily max-known-
   opinion read in the driver), not on a neighboring policy.
3. **The cost bar failed on starvation the lever did not spend.**
   Covenant starved 8 vs baseline 3, driven by 100425 (5) and
   100424 (3) — seeds with zero links and zero tend kcal. The
   bar is judged as written (FAIL), but the mechanism is policy-
   trajectory divergence, not covenant spend: the only tend
   spend (27,000 kcal) sits on seeds that starved 0. A future
   cost bar for a policy-contrast arm should separate lever
   spend (tend kcal) from trajectory starvation, or the bar will
   keep judging the weather, not the lever.
4. **The rung is a silent second gate the analyzer does not
   name.** On 100426 the analyzer names seasoned-short:2-of-2,
   but the rung day (96) sits past the village's death (81) —
   even a third seasoned link could not have staged a beat.
   The `blockers` array now names all gates that fail on the
   road state, but the rung is a calendar gate, not a road-state
   gate, and it is invisible in the classification. Proposed
   revision for the NEXT run: when a shape's road state is one
   link short AND the rung day is past the village's death (or
   past the horizon), name the rung alongside the road blocker.
5. **The multi-gate improvement worked, and caught a third
   case the old code misnamed.** Belong's best link on the
   baseline leg fails 2–3 gates on three seeds (100421, 100424,
   100426), all now named. And the new code refuses to name a
   gate that is not failing: a fully-passing best link that
   never qualified now classifies UNCLASSIFIED instead of
   misnaming 'belong-foreign-small:5' (the old code's fall-
   through). No such case occurred in the pilot band, but the
   proof test pins the behavior (test-onlylead2-b §1h).
6. **The 900-line linkLines cap STILL binds (3/16 records).**
   100422 covenant, 100423 baseline, and 100428 baseline all
   hit exactly 900 lines. The cap raise (600 → 900) bought the
   beat — 100422's lines run to day 156 of 158, and the council
   at day 127–128 IS captured — but the tail of the longest
   records is still cut. The next arm should either scale the
   cap with the horizon or filter harder (the Dead Phone /
   Muscadine repeats are 58 of 100422's 900 lines).
7. **The refusal-line blind spot is an instrument gap, not a
   game gap.** The say-filter (LINK_LINE_RE) predates the
   covenant road; 454 played refusals left zero captured lines.
   The fix (add covenant/charter/handshake/codex terms) is a
   one-line instrument change for the next arm — it was NOT made
   mid-run, and the pilot's judged numbers do not depend on
   linkLines.
8. **Telemetry check:** `scripts/telemetry-check.js` refuses
   recorder-corpus input by design (per-seed JSONs carry
   anchorCommit — they are sweep recorder rows, not runs). No
   LOUD line; the check does not apply to this corpus shape.
   The §15 panel is the deviation read instead (below).

## Balanced panel (§15)

Pseudo-panel compare (answercourt precedent — the real
balance-panel.js compare cannot judge a policy contrast; the
preregged G2 bar is the judge). Builder:
scripts/build-onlylead2-panels-20261115.js. Files:
evidence/2026-11-15/onlylead2-b-panel.{json,md} (+ `-before` /
`-after` `.json.gz`). Decision: **review_required** (8 paired
cases, screen only). National scale access 0 → 0.125
(no_material_signal — the single covenant national). Village
deaths per run 74 → 79 (regression_watch, 95% exploratory
interval −12.125 to 22.25 — includes 0). Village deaths per 100
calendar days 70.63 → 63.30 (no_material_signal — the covenant
leg lives longer, so deaths per day fall even as deaths per run
rise). Table win rate 0 → 0. The panel agrees with the
preregged verdict: one national, no win movement, no material
signal either way. The panel is the instrument; G2 is the judge.

## Evidence files

- Prereg (binding): evidence/2026-11-15/sim-onlylead2-b-prereg.md
- Substrate probe: scripts/opinion-probe-20261115.js;
  evidence/2026-11-15/onlylead2-b-opinion-probe.json
- Instrument substrate (on master, unchanged):
  scripts/policies/competent-scaleclimb-b.js (baseline) and
  scripts/policies/competent-covenant-b.js (covenant road)
- Driver: scripts/onlylead-driver-20261115.js (extended: dirStem
  per RUN + linkLines cap 900)
- Analyzer: scripts/analyze-onlylead-b.js (extended: `blockers`
  array — all failing gates per shape; `blockedByAll` rollups)
- Proof: scripts/test-onlylead2-b.js (25/25: static multi-gate
  + 200d game smoke + determinism);
  scripts/test-covenant-b.js (33/33, re-verified on this tip);
  scripts/test-onlylead-b.js (29/29, still green after the
  analyzer extension)
- Panel builder: scripts/build-onlylead2-panels-20261115.js (new)
- Per-seed JSON: evidence/2026-11-15/perseed-onlylead2-b-control/
  (8 files) and evidence/2026-11-15/perseed-onlylead2-b-on/
  (8 files)
- Analysis: evidence/2026-11-15/onlylead2-b-analysis.json
- Panel: evidence/2026-11-15/onlylead2-b-panel.{json,md} +
  onlylead2-b-panel-before.json.gz / onlylead2-b-panel-after.json.gz
- Pilot log: evidence/2026-11-15/onlylead2-b-pilot.log (+ .err)
- Evidence: this file

## Commits (branch sim-onlylead2-b)

- 8471404fed9901a9dea8ef968afb71e28cc66e4b prereg (binding;
  substrate probe SPLIT, pilot proceeds; pilot band 100421–
  100428, confirm 100429–100436 + 100441–100448 fresh)
- 9d80d18055a25cd3cbacca1a5087070872773249 instrument (analyzer
  multi-gate + driver dirStem/cap + test-onlylead2-b 25/25)
- (this commit — pilot corpora + analysis + panel + evidence)

## Findings for the backlog (coordinator owns sim-findings.md)

1. **OPINION IS STILL THE BINDING SUBSTRATE (5/8).** The
   courtship-deeds lever from the 1055Z finding #2 stands
   unbuilt: on 5/8 pilot seeds opinion 10 never arrives before
   the village dies (100424: 189 days, 66 knocks, never 10).
   The covenant road cannot reproduce until opinion-building
   exists — visits, gifts, aid, contest wins where the region
   hears.
2. **THE ENGINE COURTS TOO — AND COMPETES WITH THE COVENANT
   POOL.** On 100422 day 39 the engine formed a lead link with
   village_0 directly, removing the best-opinion village from
   the covenant candidate pool and delaying the first accept to
   day 95. A covenant policy that cannot see engine courtship
   wastes its best candidate. Next arm: surface engine-formed
   links to the policy (or teach the policy to prefer the
   second-best known village when its first pick is linked).
3. **THE TEND GATE STARVES THE ROAD ON POOR VILLAGES.** 100427
   formed all 3 links and tended 0 (pantry chronically ≤20,000
   kcal), so none seasoned. The tend gate (20k) is stricter than
   the propose gate (12k) — on a poor village the road forms
   and then stalls. Next arm: tend on a lower pantry gate, or
   tend in kind (grain, not kcal), or season links by time
   alone when trust is tended by deeds.
4. **THE RUNG IS A SILENT SECOND GATE.** 100426 died day 81
   with two seasoned links; the rung day was 96. The analyzer
   should name the rung alongside road-state blockers when the
   rung sits past the village's death (metric review #4).
5. **DEAD PHONE / MUSCADINE REPETITION (sense).** The Dead
   Phone line fires 39 times in 100422's 158-day record (4.3%
   of the corpus); the Muscadine sowing line 19 times. Same
   sentences, day after day — narration repetition blemish.
6. **LINK_LINE_RE BLIND SPOT (instrument).** The covenant
   refusal copy never reaches the corpus — the say-filter
   predates the covenant road. Add covenant/charter/handshake/
   codex terms to the filter on the next arm.

## Convergence state

Covenant-road staging arm on a 200d horizon — PILOT NO-GO:
covenant beats staged 1/8 (bar ≥3/8); cost bar fails (starvation
8 vs 3, bar ≤5); G1/G3 GO. The road is PROVEN OPEN in live play
for the first time (100422: three links d95–97, all seasoned,
Founding Council d128, 'pact', sat, national held 31 days) but
does not reproduce at the bar: opinion-never-10 on 5/8, rung +
death on 1/8, tend/pantry on 1/8. No confirm spent; confirm band
100429–100436 + 100441–100448 stays fresh. No game change; the
covenant policy remains a proven instrument (policy-side, no
default flip, no src/js). The axis line updates from this run's
numbers only: covenant is the second road proven staged in live
play (lead 32 across the bands — 21 pilot+confirm, 5 DIAG, 6
here; covenant 1); conquest, belong,
and trade remain unit-proven only. The next step for the road is
an opinion-building lever, not another propose variant.
