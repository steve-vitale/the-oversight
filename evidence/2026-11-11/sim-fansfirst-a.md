# Fans / audience — first numbers: evidence (arm sim-fansfirst-a)

Run fleshout-20261111T0715Z, Loop A. Coverage Program Tier 3 (Steve
order 2026-11-10 11:11 CST "Measure all"). **Verdict: GO** — complete
first-numbers capture, neutrality 8/8, zero instrument errors, every
GO-table row passed. A GO here makes NO landing claim and spends NO
confirm band: this is a measurement arm, there is no lever to land.

Adoption note: this arm was built by the dead 1315Z run (prereg +
instrument + driver + analyzer + proof committed as c8df75d65) and
adopted by a fresh worker at 09:38 CST. The dead worker left two
uncommitted analyzer fixes (classifiers for show-win / show-cheer /
ratings-stunt whys, trial-complete / follower / standings say classes,
and the fan-leafed-tree false-positive guard) and an incomplete pilot
corpus (neutral leg missing seeds 190376–190378). The adopter kept
the fixes, verified the proof still green (95/95, up from 87/87 with
8 new checks), finished the three missing neutral legs on the SAME
band with the existing driver, and judged the completed corpus.
No prereg rewrite, no new seed band, no re-scored GO bar.

## Header (pre-registered, from sim-fansfirst-a-prereg.md)

- **Primary metric:** complete first-numbers capture of fans /
  audience in a lived village — every favor move classified by lane +
  why; every care-package attempt classified by outcome; every
  club-boon attempt classified; every feed attempt classified; every
  audience trial classified by offer/completion/expiry; every
  contest-interference call classified; viewership trajectory
  captured; metrics 1–10 counted or explicitly marked unmeasurable.
- **GO threshold:** the GO table below (instrument validity +
  complete capture). A miss on any row is NO-GO (§14, never
  re-scored mid-run).
- **Horizon: 150d, death-aware** (dead villages stop, +10d tail
  max). Fans are a whole-life question (favor accumulates across a
  season of shows, trials recur post-40, viewership is a season-long
  arc); sibling first-numbers pilots ran 150d with median survival
  116–140d.
- **Seeds: 190371–190378 (8 seeds).** Freshness search recorded in
  the prereg; band unchanged by the adoption.
- **Policies (two legs, identical seeds):** control = competent
  verbatim, default env, instrument ON (the judged leg); neutral =
  control policy, instrument OFF (end-of-run wall numbers + days +
  end pantry kcal + deaths only). No src/js change.
- **Anchor base: 28875b1b1** (the base the pilot ran on). Rebase
  check: `git log 28875b1b1..master -- src/js/alienPlayers.js
  src/js/contests.js` is EMPTY — neither instrumented file moved
  in the rebase range — so the existing corpus is judged as-is and
  no post-rebase re-run was needed. Master at adoption was
  8445ab97f (journey-scale r131); the branch is rebased onto that
  explicit SHA before the final commit, proof re-run green.
- **Balanced panel (§15):** none — measurement arm with no lever
  change and no before/after arms, same position as
  sim-trustfirst-a / sim-abilityfirst-a / sim-titanfirst-a /
  sim-relayfirst-a. The control/neutral legs are the neutrality
  proof, not a panel.

## GO table — judged row by row

| GO check | Bar | Result | Verdict |
|---|---|---|---|
| Every apAdjustFavor call classified by lane + why, none 'unclassified' | 0 unclassified | 200 favor events, 0 unclassified | **GO** |
| Every apCarePackage attempt classified by outcome, none 'unclassified' | 0 unclassified | 289 attempts (82 sent / 119 gate-blocked / 88 cooldown-blocked), 0 unclassified | **GO** |
| Every apClubBoon attempt classified by outcome, none 'unclassified' | 0 unclassified | 801 attempts (18 fired / 605 gate-blocked / 65 cooldown-blocked / 113 roll-blocked), 0 unclassified | **GO** |
| Every apFeedMessage attempt classified, none 'unclassified' | 0 unclassified | 801 attempts (325 fired / 475 roll-blocked / 1 cooldown-blocked), 0 unclassified | **GO** |
| Every wrapped method's call path verified live or marked dead | each wrap live in the pilot, or proven live in a fixture and marked dead under competent / dead-under-harness | all 16 wraps live on all 8 seeds (say, sysSay, tele, checkStruggle, apDailyTick, offerAudienceTrial, apFeedMessage, apClubBoon, apPersonaPackage, apCarePackage, apAdjustFavor, completeTrial, apWackyGift, apPackageClubLine, apGrantItem, apContestInterference); no dead wraps, no fixture fallback needed | **GO** |
| Neutrality: OFF leg matches instrumented leg | days + end pantry kcal + deaths match exactly, 8/8 seeds | 8/8 exact, including pantry 40,017 kcal (s190372) and 30,505 kcal (s190374) matching to the kcal | **GO** |
| Instrument errors | 0 on all seeds, all legs | 0 | **GO** |
| Complete first-numbers capture | per-seed tables for metrics 1–10; sense-test scenes quoted | tables below; scenes quoted | **GO** |
| Engagement floor | ≥5 favor events band-wide, else uninterpretable | 200 favor events | **GO** |

Overall: **GO**.

## Wall numbers (control leg, 8 seeds)

- national: **0/8** (all 8 scaleRank regional; nationalLive false
  every day on every seed)
- table: **0/8** (no seed reached the table)
- wins: **0/8**
- wave unlocks: wave 4 **8/8**; wave 5 **2/8** (s190376, s190378)
- median survival: **112d** (control days sorted:
  66, 72, 83, 103, 121, 132, 148, 150; 1/8 survived to 150d)
- deaths: **645** control (monster 516, villager 120, person 9);
  1,290 across both legs
- standing: max 450 (s190378); **five seeds end at exactly 199**
  (s190371, s190372, s190373, s190375, s190377) — see findings
- scale: the wall stands. Regional is the ceiling in this corpus;
  nothing in the fan system moves the scale needle — fans are a
  showbiz-side economy that never touches standing, scale, or the
  table in lived play (Beloved-path testimony needs the table,
  which no village reached).

## Metric 1 — Favor flow (200 events)

| Seed | Days | Favor events | By lane (F/Su/So/Sh) | Net by lane (F/Su/So/Sh) | Max lane (F/Su/So/Sh) | Days lane ≥12 (Sh) | Days lane ≥25 (Sh) | Days favor ≥25 |
|---|---|---|---|---|---|---|---|---|
| 190371 | 150 | 40 | 4/0/2/34 | 30/0/14/100 | 14/0/8/62 | 70 | 56 | 56 |
| 190372 | 72 | 12 | 1/1/0/10 | 8/6/0/29 | 8/6/0/13 | 6 | 0 | 0 |
| 190373 | 121 | 27 | 5/2/0/20 | 38/14/0/52 | 22/8/0/21 | 45 | 0 | 0 |
| 190374 | 66 | 17 | 2/1/1/13 | 14/6/6/50 | 8/6/6/35 | 19 | 11 | 11 |
| 190375 | 83 | 17 | 2/1/4/10 | 10/2/14/24 | 8/2/6/15 | 27 | 0 | 0 |
| 190376 | 132 | 31 | 3/0/1/27 | 24/0/6/116 | 11/0/6/79 | 102 | 85 | 85 |
| 190377 | 103 | 26 | 2/1/1/22 | 4/8/8/53 | 6/8/8/26 | 52 | 3 | 3 |
| 190378 | 148 | 30 | 3/1/3/23 | 12/8/16/83 | 8/8/8/42 | 89 | 46 | 46 |
| **Band** | **875** | **200** | **22/7/12/159** | — | **22/8/8/79** | — | — | — |

Band by why: contest-win 80, show 54, show-cheer 14, ratings-stunt
9, show-win 5, highlight 4, fight-outcome 2, other:watchparty 11
("watch-party snacks"), other:the 15 (free-text show/contest
choice whys — "the pudding truce", "the gracious swap", "the
ninety-second nap", "the beatless ballad", "the couch confession",
"the dusk dance", "the elbow masterclass", "the honest tour",
"the proud tour", "the silent day"), other:went 1, other:found 1,
other:sold 1, other:claimed 1, other:stood 1, other:comfort 1.
Zero unclassified. Negative favor moves: exactly 2 band-wide, both
"lost to the stranger" (−2 fight, s190377 d76, s190378 d65).
Drift: apDailyTick −1/3d moves reconciled exactly — snapshot
reconciliation residue 0 on every lane on all 8 seeds.

The shape: **showbiz is the whole favor economy.** 159/200 events
(80%) are showbiz; survival got 7 events, social 12, fight 22.
Showbiz is the only lane that ever reaches 25 (max 79); fight
peaks at 22, survival 8, social 8. Favor comes from being watched
— contest wins on camera (80) and show results (54+14+9+5) — not
from fighting, surviving, or talking. The "cheering for <villager>"
whys (14) name villagers, never fans.

## Metric 2 — Care packages (289 attempts, 82 sent)

| Seed | Attempts | Sent | Gate-blocked (<12) | Cooldown-blocked | Direct (show/contest win) | Daily-tick | Snack kcal |
|---|---|---|---|---|---|---|---|
| 190371 | 57 | 14 | 26 | 17 | 5 | 9 | 325 |
| 190372 | 18 | 2 | 15 | 1 | 2 | 0 | 116 |
| 190373 | 39 | 14 | 8 | 17 | 7 | 7 | 409 |
| 190374 | 27 | 4 | 16 | 7 | 2 | 2 | 77 |
| 190375 | 24 | 4 | 15 | 5 | 1 | 3 | 158 |
| 190376 | 43 | 20 | 4 | 19 | 9 | 11 | 719 |
| 190377 | 21 | 8 | 8 | 5 | 4 | 4 | 257 |
| 190378 | 60 | 16 | 27 | 17 | 7 | 9 | 444 |
| **Band** | **289** | **82** | **119** | **88** | **37** | **45** | **2,505** |

Daily-tick roll accounting (apDailyTick pkgRoll): gate-blocked 345,
called 204, cooldown-blocked 171, roll-blocked 149. So of the days
the roll could have fired, the 25% roll failed 149 times — the
roll, not the gate, is the usual reason a day passes without a
package once favor clears 12.
Gifts: 29 distinct wacky ids across 82 sent packages (tiers: 24
tier-1, 19 tier-2, 64 tier-3 — the wacky pool leans high-tier);
most common: wrong_bandage 7, shard_spear 7, audience_token 6,
spare_battery 5. Vault-shy: 0 (every apWackyGift call returned a
gift). Snack kcal total 2,505 (~31 kcal per package — a snack, never
dinner, as canon requires). Club credit line: 48/82 packages named
the club; gate verified exactly — `apPackageClubLine` returns ""
below 20 and " — your showbiz fans" at ≥20, **0 violations in 82
calls**; top lane was showbiz on 74 calls, fight on 8.
No package ever came from a named fan: every note is the generic
line (see sense-test).

## Metric 3 — Club boons (801 attempts, 18 fired)

| Outcome | Band |
|---|---|
| fired-showbiz (wacky curio) | 18 |
| gate-blocked (top lane <25) | 605 |
| roll-blocked | 113 |
| cooldown-blocked | 65 |

Per seed fired: s190371 4, s190376 9, s190378 5, all other seeds 0.
**Every fired boon is showbiz.** The fight (+10 health),
survival (+300 pantry), and social (+1 unity) boons never fired
in the pilot because those lanes never reached 25 (max 22/8/8).
The boon gate, not the roll, is the binding constraint: 605 of
801 attempts died at the gate. When a boon does fire, the line is
always the same curio line (see sense-test).

## Metric 4 — The feed (801 attempts, 325 fired)

| Outcome | Band |
|---|---|
| fired-watching (favor −29..24) | 245 |
| fired-growing (favor ≥25) | 80 |
| fired-restless (favor ≤−30) | 0 |
| roll-blocked | 475 |
| cooldown-blocked | 1 |

Favor never fell to −30, so the restless band is unheard in lived
play under competent. The 1/day feed cap almost never binds (1
cooldown-block); the 40% roll is the throttle (475 roll-blocks).
Feed-growing fires had favor at call 25–78. Say-line classes:
feed-watching 204, feed-growing 43, feed-lane 30, other-fan 1,510
(the long tail of audience chatter — see metric 9).

## Metric 5 — Audience trials (86 offers, 22 completions)

| Seed | Offers (audience/milestone) | Tasks (haul_small/haul/identify) | Completions | Expiries | Still open at end |
|---|---|---|---|---|---|
| 190371 | 16 (15/1) | 5/4/7 | 4 | 12 | 0 |
| 190372 | 7 (7/0) | 2/3/2 | 3 | 4 | 0 |
| 190373 | 11 (11/0) | 5/2/4 | 1 | 10 | 0 |
| 190374 | 6 (5/1) | 4/1/1 | 1 | 4 | 1 (died d66, expires d68) |
| 190375 | 8 (7/1) | 2/3/3 | 2 | 6 | 0 |
| 190376 | 14 (13/1) | 8/1/5 | 5 | 8 | 1 (died d132, expires d132) |
| 190377 | 10 (10/0) | 3/6/1 | 3 | 7 | 0 |
| 190378 | 14 (13/1) | 8/3/3 | 3 | 11 | 0 |
| **Band** | **86 (81/5)** | **37/23/26** | **22** | **62** | **2** |

Completions by task: haul_small 15, haul 7, **identify 0/26**.
The identify task (fully identify 3 plants at knowledge 3 within
3 days) was never completed once in 26 offers — under competent
play it reads as uncompletable in-window, not merely hard.
Struggle-path offers: **0**. checkStruggle ran 869 times across
the band and never offered a trial; every offer was an
audience/milestone encore. The trial the prereg's prior art
recorded ("offered and expired unplayed" in the abilityfirst-a
corpus) is the norm here too: 62 of 86 offers expired unplayed.
Trial completions grant +15 integration and a lesson (see
sense-test). End-of-run trial state: null on 6 seeds, one open
trial on each of the two seeds whose village died mid-window.

## Metric 6 — Contest interference (16 calls)

| Seed | Calls | forPlayer (winMod 0 — verdict-only fiction) | Against-player, winMod +0.08 | Against-player, winMod 0 | Death saves |
|---|---|---|---|---|---|
| 190371 | 2 | 1 | 1 | 0 | 0 |
| 190372 | 1 | 1 | 0 | 0 | 0 |
| 190373 | 1 | 1 | 0 | 0 | 0 |
| 190374 | 0 | 0 | 0 | 0 | 0 |
| 190375 | 4 | 2 | 0 | 2 | 0 |
| 190376 | 3 | 0 | 2 | 1 | 0 |
| 190377 | 1 | 0 | 0 | 1 | 0 |
| 190378 | 4 | 2 | 0 | 2 | 0 |
| **Band** | **16** | **9** | **3** | **4** | **0** |

The prereg's prediction held live: the forPlayer path skips the
favor lean by construction, so 9 of 16 calls are verdict-only
fiction (winMod 0). Fan favor bent a verdict 3 times — all
+0.08, all when favor ≥40 ("The crowd is CHANTING your name").
The benevolent lifeline never fired: 0 death saves in the pilot
(it needs a death roll plus a 40% draw plus a clear 7-day
cooldown). Meddler packages are kept separate: 4 of 178
apPersonaPackage attempts returned a package (s190377 1/26,
s190378 3/24) — meddler personas, not fans, never conflated.

## Metric 7 — Viewership

| Seed | Start | Max | End | Days ≥40 (SCALE bar) | Days ≥25 |
|---|---|---|---|---|---|
| 190371 | 12 | 60.0 | 43.8 | 109 | 132 |
| 190372 | 12 | 47.4 | 46.3 | 29 | 56 |
| 190373 | 12 | 32.7 | 30.5 | 0 | 26 |
| 190374 | 12 | 47.9 | 45.1 | 9 | 41 |
| 190375 | 18.5 | 98.7 | 83.4 | 73 | 79 |
| 190376 | 12 | 47.9 | 47.9 | 3 | 102 |
| 190377 | 12 | 45.0 | 45.0 | 5 | 55 |
| 190378 | 12 | 69.9 | 38.5 | 121 | 141 |
| **Band** | **12** | **98.7** | — | **349** | — |

Viewership starts at the drift floor of 12 on 7/8 seeds and
climbs with deeds; the band spent 349 village-days at or above
the SCALE provisional bar of 40 — the audience IS watching, in
numbers. The trajectory is sticky and deed-reactive as canon
says (ledger.js): s190378 peaked at 69.9 and fell to 38.5 by
death; s190375 peaked at 98.7, the band high. No fan/favor tele
type exists (teleFanEvents 0 on all seeds, as the prereg
predicted — the absence is asserted honestly, not cross-checked
into existence).

## Metric 8 — Named fans (the canon check): measured zero

- Say corpus searched: **2,318 fan/audience lines** (instrument's
  uncapped fanSaysFull), 0 named-fan lines. The finder's
  false-positive guards were exercised live: the "fan-leafed tree"
  botany line (s190371 d77, "Wei showed Fatima the fan-leafed
  tree…") is correctly NOT a fan, and generic club nouns ("your
  fight fans", "your fan club is GROWING") are correctly NOT names.
- State searched: daily snapshots carry no fan roster, pool, or
  draw — no fan-persona state exists anywhere in the corpus.
- Signed care-package notes: **0**. Every package note is the
  generic "WE LOVE YOU!" (see sense-test).
- Fan arcs: none — no per-fan feeling state exists.
- **The canon gap is confirmed by measurement, not assumed:**
  FANS.md promises 4–6 named, recurring fan personas per run with
  arcs, signed notes, and club figureheads; the code delivers four
  anonymous per-lane audience segments. A zero here is a measured
  zero.

## Metric 9 — Say-line coherence (2,318 lines, 0 unclassified)

| Class | Band |
|---|---|
| other-fan (audience chatter tail) | 1,510 |
| feed-watching | 204 |
| follower (Influencer fight) | 124 |
| favor-announce | 103 |
| trial-offer | 86 |
| package | 82 |
| trial-expired | 62 |
| feed-growing | 43 |
| standings | 34 |
| feed-lane | 30 |
| trial-complete | 22 |
| boon | 18 |
| interference / persona-package / restless / package-club-credit | 0 (see notes) |

Coherence spot-checks (each verified against live state, not
assumed):
- Package line vs lane value: club credit appears exactly when
  the top lane is ≥20 (0 gate violations in 82 calls).
- Feed line vs favor band: all 80 fired-growing events had favor
  25–78 at call; all 30 feed-lane lines fired on days a lane was
  ≥25 (30/30).
- Favor-announce vs live favor: sampled lines state the favor the
  engine held that day ("📈 your showbiz fans +4 — You won The
  Wrong Map on camera (favor: 4)", s190371 d23).
- Boon line vs boon type: all 18 boon lines are the showbiz
  curio line, matching the 18 fired-showbiz boons.
- Trial line vs trial offered: 86 trial-offer lines for 86
  offers; 22 trial-complete lines for 22 completions; 62
  trial-expired lines for 62 expiries — exact 1:1:1.
- **Incoherence found (1): the follower favor-drain lines.**
  124 follower lines narrate a favor loss that never happens (see
  sense-test). Everything else checked is coherent.
- Repetition: the package line is byte-identical on all 82
  sends; the boon line byte-identical on all 18 fires; the
  trial-expired line byte-identical on all 62 expiries; the
  standings line repeats verbatim every 24 days ("Haven sits 1st
  of 8…"). The audience's voice is one line per event, repeated,
  never varied — consistent with anonymous segments, not personas.

## Metric 10 — Wall numbers

See "Wall numbers" above. Fans do not move the wall: the
showbiz favor economy is lively (200 favor events, 82 packages,
325 feed fires, 86 trial offers) while national/table/wins stay
0/8 and every village ends regional. The audience watches a
village that dies regional.

## Sense-test scenes (quoted verbatim from the corpus)

**The package that never gets personal (s190371, d44 / d67 / d86 /
d90 / d95 / d101 — the same line six times):**
> "📦 A care package drops from the sky with a little parachute.
> There's a note: \"WE LOVE YOU!\""
and, once showbiz clears 20, the only variation the system ever
produces:
> "📦 A care package drops from the sky with a little parachute.
> There's a note: \"WE LOVE YOU! — your showbiz fans\""
A package from a fan who watched you starve should read
differently from one who watched you win (FANS.md). In 82
packages it never does. The "signed, personal" note is one
shouted generic line plus an optional segment credit.

**The boon that apologizes for having no note (all 18 fires,
e.g. s190371 d103, d119, d132, d148; s190376 d57–d76):**
> "📦 Your showbiz fans voted: a wacky curio, gift-wrapped, no
> note. The note would have explained it. There is no note."
The system lampshades its own missing canon: the note would
have explained it. There is no note. Four boons in one village,
same sentence four times.

**The follower drain that never drains (s190371 d103, the
Influencer fight — three follower lines in one day):**
> "📱 The ring light BRIGHTENS — a new follower crawls out of
> the glow, phone-first, already filming. (1 followers. Each one
> sharpens the Ratio and drinks your favor.)"
> "📱 1 follower turn the audience — care packages thin, the
> System's favor trickles away. (-1 favor.)"
> "📱 The ring light BRIGHTENS — a new follower crawls out of
> the glow, phone-first, already filming. (2 followers. Each one
> sharpens the Ratio and drinks your favor.)"
> "📱 2 followers turn the audience — care packages thin, the
> System's favor trickles away. (-2 favor.)"
> "📱 3 followers turn the audience — care packages thin, the
> System's favor trickles away. (-3 favor.)"
The favor on s190371 d103 is 34 before and 34 after — the
snapshot, the favor events (none that day), and the
reconciliation (residue 0) all agree nothing moved. Code check:
`sigW4.js:345` calls `game.drainFavor(I.followers)` guarded by
`if (game.drainFavor)` — and `drainFavor` exists nowhere in
`src/js/`, so the guard skips it and the say line fires anyway.
The audience is told the favor is trickling away; it is not.
124 such lines band-wide.

**The trial that keeps expiring (s190371 d9–d39):**
> "◈ AUDIENCE TRIAL — SYSTEM: \"The audience wants an encore.
> A trial, then — smaller this time, but televised.\" Haul 1,000
> kcal to the pantry within 3 days. Reward: integration, and a
> lesson."
> "The trial window closed. The audience makes a disappointed
> sound, like wind."
> "◈ AUDIENCE TRIAL — SYSTEM: \"A trial, broadcast live. The
> audience loves a trial.\" Fully identify 3 plants (knowledge
> level 3) within 3 days. Reward: integration, and a lesson."
> "The trial window closed. The audience makes a disappointed
> sound, like wind."
Two offers, two expiries, four days apart; the third offer
(haul 3,000) completes:
> "◈ TRIAL COMPLETE — the audience applauds, which sounds like
> static. (+15 integration, gift: a lesson: Bodyguard)"
The trial voice is coherent and characterful — the one fan
system that talks like a person. But it talks mostly to an empty
room: 62 of 86 offers close unplayed, and the identify task never
completes.

**The standings that never change (s190371 d24 / d48 / d72 / d96):**
> "📊 THE STANDINGS — Haven sits 1st of 8. Haven leads. The
> audience has a favorite, and it's you."
Same sentence every 24 days, all four times. Haven is 1st of 8
from day 24 to day 96 while the village is, by every other
measure, dying regionally. The standings line is a fixed
compliment, not a measurement.

**The crowd that only cheers (favor-announce samples):**
> "📈 your showbiz fans +4 — You won The Wrong Map on camera
> (favor: 4)"
> "📈 your moot crowd +6 — You won The Oath on camera (favor: 6)"
Numbers match live state; the voice is a scoreboard, not a
person. No fan ever boos by name, no fan ever has a feeling
about the player that survives the day — because there is no
fan to have it.

## Village assessment (plain words)

Eight villages, one season each. Every village got watched —
viewership climbed past 40 on most of them, the audience cheered
contest wins, care packages rained wacky curios from the sky,
and the System kept offering televised trials. And every village
died regional, at a median of 112 days, with the audience still
watching. The fans are real as a scoreboard and absent as people:
they have no names, no faces, no memory, no signed notes, no
feelings that last past the day. The showbiz club is the whole
story — fight, survival, and social fans barely exist (22/7/12
favor events against showbiz's 159), and their boons never fire.
The most human thing the audience does is offer trials, and the
village mostly lets them expire. The blank this arm fills is the
measurement itself: before today there were zero fan numbers in
evidence; now the canon gap is a counted zero, and the next build
knows exactly what it has to build (named fans) and exactly what
already works (packages, feed, trials, the favor engine).

## Metric review (§14 — never re-scored, for the NEXT run)

- The GO bar held as written; no metric needs revision to judge
  this run. Two instrument notes for the next run:
  1. `classifyFavorWhy`'s `other:<first-token>` residue classes
     (other:the 15, other:watchparty 11, plus six singletons)
     are classified, never unclassified — but the taxonomy is
     coarse. The residue is free-text `do.fanLane` choice whys
     from contests.js; a next run could add named classes for
     them ("the pudding truce" etc.) instead of first-token
     buckets. No data was lost; the raw whys are in the corpus.
  2. `apGrantItem` attribution did not resolve: the instrument's
     context flag for fan package/boon was never set, so all
     grant events carry context "?" (19 on s190371). Nothing is
     lost for metric 2 — package events record giftId directly —
     but a next run that wants the grant cross-check should wire
     the flag or drop the wrap.
- The driver's 300-line say cap hit on 5 of 8 control seeds
  (fanSays capped at 300; s190377 stopped at 239 uncapped). The
  instrument's uncapped fanSaysFull (2,318 lines) is the census
  source, as the prereg warned; the driver cap is a lower bound
  only. A next run could raise the driver cap, but the census
  does not depend on it.
- Feed cooldown-blocked fired once in 801 attempts: the 1/day
  cap is not the throttle; the 40% roll is. A next run measuring
  feed pacing should watch the roll, not the cooldown.
- The engagement floor (≥5 favor events) was set from the pool's
  nature in case the band produced almost nothing; the band
  produced 200. The floor was far too low to discriminate — but
  it was a validity floor, not a quality bar, and it did its job.

## Findings (lines for the coordinator to append to sim-findings.md)

- [open] 2026-11-11 — fans/audience — canon gap CONFIRMED by measurement: FANS.md promises 4–6 named recurring fan personas per run with arcs, signed notes, club figureheads; the code has four anonymous per-lane segments. Measured zero named fans in 2,318 fan say lines + full state search (arm sim-fansfirst-a, evidence/2026-11-11/sim-fansfirst-a.md).
- [open] 2026-11-11 — fans/audience — Influencer follower lines narrate a favor loss that never happens: sigW4.js:345 calls game.drainFavor guarded by if (game.drainFavor), but drainFavor exists nowhere in src/js/, so 124 band-wide "(-N favor.)" lines describe a drain of 0; favor snapshots + reconciliation confirm nothing moves (arm sim-fansfirst-a).
- [open] 2026-11-11 — fans/audience — audience-trial identify task never completed: 0/26 identify offers completed vs 22/60 haul offers; "fully identify 3 plants at knowledge 3 within 3 days" reads uncompletable in-window under competent play (arm sim-fansfirst-a).
- [open] 2026-11-11 — fans/audience — struggle-path audience trial never offered: 869 checkStruggle calls, 0 struggle offers; all 86 trial offers were audience/milestone encores (arm sim-fansfirst-a).
- [open] 2026-11-11 — fans/audience — club boons are showbiz-only in lived play: all 18 fired boons were showbiz curios; fight/survival/social lanes never reached 25 (max 22/8/8), so their boons (+10 health / +300 pantry / +1 unity) never fired (arm sim-fansfirst-a).
- [open] 2026-11-11 — fans/audience — care-package notes are one generic line: "WE LOVE YOU!" verbatim on all 82 packages (plus an optional segment credit at lane ≥20); boon lines all read "gift-wrapped, no note. The note would have explained it. There is no note." — canon requires signed, personal notes (arm sim-fansfirst-a).
- [open] 2026-11-11 — fans/audience — benevolent lifeline never fired: 16 apContestInterference calls, 0 death saves; favor bent 3 verdicts (+0.08 at favor ≥40) and the forPlayer path is verdict-only fiction as designed (arm sim-fansfirst-a).
- [open] 2026-11-11 — standing — five of eight control seeds end at exactly standing 199 (s190371/72/73/75/77); recurring exact value smells like a cap or a plateau, not a coincidence — for the standing arm to check, not this arm's axis (arm sim-fansfirst-a).

## Proof + files

- Proof: `node scripts/test-fansfirst-a.js` — **95 passed, 0
  failed** (87/87 at commit c8df75d65, +8 new checks from the
  adopted analyzer fixes, re-run green after adoption and again
  post-rebase).
- Prereg: evidence/2026-11-11/sim-fansfirst-a-prereg.md
- Evidence: evidence/2026-11-11/sim-fansfirst-a.md (this file)
- Band summary: evidence/2026-11-11/fansfirst-a-band-summary.json
- Per-seed corpus: evidence/2026-11-11/perseed-fansfirst-a/
  (16 files: 8 control + 8 neutral, seeds 190371–190378)
- Instrument: scripts/fansfirst-instrument-20261111.js
- Driver: scripts/fansfirst-driver-20261111.js
- Analyzer: scripts/fansfirst-analyze-20261111.js (adopted fixes
  committed here)
- Proof: scripts/test-fansfirst-a.js (adopted fixes committed here)

## Process deviations (disclosed honestly)

- Adopted arm, not built: prereg/instrument/driver/analyzer/proof
  are the dead worker's commit c8df75d65; the adopter's own
  changes are the two analyzer/proof fixes (kept, not rewritten),
  the three finished neutral legs, the band summary, and this
  evidence file.
- Corpus judged on anchor base 28875b1b1: the rebase-range check
  found no movement in src/js/alienPlayers.js or
  src/js/contests.js, so no post-rebase pilot re-run was required
  by the task's rule. The branch itself is rebased onto explicit
  master SHA 8445ab97f before the final commit.
- The neutral legs for 190376–190378 were run by the adopter
  AFTER the control legs (same driver, same band, same base);
  neutrality still matched 8/8 exactly, so the ordering is
  immaterial to the verdict.
- No panel comparison (§15): measurement arm, no lever, no
  before/after — recorded honestly in the prereg.
