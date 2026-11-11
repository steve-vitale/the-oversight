# Corruption / cannibalism — first numbers (arm sim-corruptfirst-a)

Run fleshout-20261111T1408Z, Loop A. Coverage Program Tier 3 (Steve
order 2026-11-10 11:11 CST "Measure all"). **Verdict: GO** — all 7
pre-registered GO rows pass (analyzer output below). This is a
MEASUREMENT arm: a GO makes no landing claim and spends no confirm
band; there is no lever here to land.

- **Base / anchor:** pilot anchor ae53134ae (prereg base). The dead
  1315Z run's pilot corpus (7 control legs, seeds 190381–190387) was
  adopted by this run; the missing legs (control 190388 + neutral
  190381–190388) were finished on the SAME band, same driver, same
  instrument (with the dead worker's foil fix committed — see below).
  No seed re-picked, no GO bar re-scored (§14).
- **Instrument fix (adopted, committed here):** the dead worker's
  uncommitted fix to `scripts/corruptfirst-instrument-20261111.js` —
  the foil recorder only records a trust drag when scholar corruption
  >= 30 and recovers the corruption-attributable drag from the final
  value (implied base = returned / (1 - c/250)). The pre-fix rule
  (`returned < base`) counted the base progressive curve itself as a
  drag (1,370–2,138 false events at corruption 0 on the first two
  trial seeds). The fix predates the pilot corpus files (instrument
  mtime 14:29Z, first pilot file 14:41Z), so the corpus is already
  fixed-instrument; no leg needed re-running. Proof re-run green
  63/63 with the fix (see below).
- **Horizon:** 150d, death-aware. **Seeds:** 190381–190388 (8).
  **Policies:** control (competent verbatim, instrument ON) +
  neutral (same policy, instrument OFF) on identical seeds.
- **Proof:** `node scripts/test-corruptfirst-a.js` → **63/63 green**
  (re-run by the adopting worker on the branch tip, pre-rebase; see
  rebase note for the post-rebase re-run).
- **Analyzer:** `node scripts/corruptfirst-analyze-20261111.js` →
  summary `evidence/2026-11-11/corruptfirst-summary-corruptfirst-pilot.json`,
  corpus `evidence/2026-11-11/perseed-corruptfirst-a/` (16 files:
  8 control + 8 neutral).

## Primary metric + GO threshold (prereg binding spec)

Primary metric: complete first-numbers capture of corruption /
cannibalism in a lived village (prereg §"Primary metric").

| GO check | Bar | Result | Verdict |
|---|---|---|---|
| Every addCorruption / addNpcCorruption event classified by who + reason | 0 unclassified | 22 events, 0 unclassified | PASS |
| Every corpseButcher / eatCannibal call classified by outcome | 0 unclassified | 0 slope calls, 0 unclassified | PASS |
| Every wrapped method's call path verified live or marked dead | each wrap live in pilot, or proven live in fixture + marked dead | 15/24 live in pilot; 9 dead-in-pilot, all 9 proven live in the fixture proof (63/63) and marked dead-under-competent below | PASS |
| Neutrality: OFF leg matches instrumented leg | days + end pantry kcal + deaths match exactly, 8/8 | 8/8 exact | PASS |
| Instrument errors | 0 | 0 on all seeds, all legs | PASS |
| Complete first-numbers capture | per-seed tables for metrics 1–10; sense-test scenes quoted | tables + scenes below | PASS |
| Engagement floor | snapshot trajectory complete on 8/8 seeds AND corruptionTick invoked on 8/8 seeds | snapshotsComplete=true, corruptionTick 297–600 calls/seed on 8/8 | PASS |

**GO: GO** (analyzer `band.go.allPass = true`).

Dead-in-pilot wraps (all proven live on fixtures in
`scripts/test-corruptfirst-a.js`, marked dead-under-competent):
`addCorruption` (scholar never gains corruption — competent refuses
human meat, no other scholar source fires), `corpseButcher` /
`eatCannibal` (slope never attempted), `corruptionThresholdBeat`
(scholar max 20 < 30), `discoverNpcCannibalism` (no NPC feeds to
discover), `addFear` / `fearWeakness` / `intimidate` (fear economy
never runs under competent), `darkShowBeat` (no threshold crossings).
`trustGainProgressive` is live (1,249–3,506 calls/seed) with 0 foil
drags — the foil cannot apply below corruption 30.

## Wall numbers (metric 10 + scale wall)

| | |
|---|---|
| National / table / wins | **0 / 0 / 0** (8 seeds) |
| Wave 4 unlocks | 8/8 seeds |
| Wave 5 unlocks | 3/8 seeds (190381, 190382, 190387) |
| Median survival | **119d** (range 75–150d; 1/8 survived to 150d) |
| Deaths | **708** over 908 village-days |
| Standing (end) | 120–435 (median ~195) |
| Scale | regional 8/8 — **the scale wall holds**: no seed reached national |

## The first numbers, in one paragraph

Corruption and cannibalism essentially do not happen in a lived
village under competent play — not because the engine is absent (the
fixture proves every verb live) but because the substrate never
arises. Across 908 village-days: **zero** butcher calls, **zero**
eaten human meals, **zero** human-meat units ever in the scholar's
inventory, **zero** NPC cannibal feeds, **zero** temptations,
**zero** dark care packages, **zero** cravings, **zero** foil drags,
**zero** Trembles. The only corruption in the whole band is one seed
(190386) where four villagers drift +1/day for seven hungry days
("hunger erodes", +22 total, max 7). The scholar's corruption is 0
on five seeds and exactly 20 — the psycho starting value — on three,
never growing. Psycho violence is the one dark system that DOES
live: three villagers escalate theft → threat → assault on their own
(11 stage advances, 11 of the 13 booked crimes), and all three later
inherit the scholar's mantle and fire the psycho intro. Meanwhile
neighbouring villages keep splitting cannibal factions (the Red
Table, on 6 of 8 seeds) that petition at Haven's fire — and the
competent scholar never answers them: no moot, no questions, they
wait three days and walk away, every time.

## Per-seed tables (metrics 1–10)

Days / end / wave / standing / scale / deaths / pantry (control leg;
neutral leg matches exactly on days + pantry + deaths, 8/8):

| seed | days | end | wave | standing | scale | deaths | pantry kcal |
|---|---|---|---|---|---|---|---|
| 190381 | 150 | survived | 5 | 435 | regional | 103 | 7,848 |
| 190382 | 129 | village-lost | 5 | 325 | regional | 108 | 0 |
| 190383 | 83 | village-lost | 4 | 190 | regional | 84 | 64,346 |
| 190384 | 75 | village-lost | 4 | 145 | regional | 60 | 385 |
| 190385 | 119 | village-lost | 4 | 199 | regional | 122 | 7,646 |
| 190386 | 104 | village-lost | 4 | 120 | regional | 67 | 0 |
| 190387 | 146 | village-lost | 5 | 230 | regional | 65 | 0 |
| 190388 | 102 | village-lost | 4 | 175 | regional | 99 | 0 |

### Metric 1 — corruption trajectory

| seed | scholar corr end/max | village corr end/max | NPC corr max ever | norm days exile/horror/power | starving days |
|---|---|---|---|---|---|
| 190381 | 20/20 | 2.5/3.3 | 0 | 145/4/0 | 4 |
| 190382 | 0/0 | 0/0 | 0 | 117/10/0 | 10 |
| 190383 | 20/20 | 20/20 | 0 | 79/2/0 | 2 |
| 190384 | 20/20 | 20/20 | 0 | 71/2/0 | 2 |
| 190385 | 0/0 | 0/0 | 0 | 112/5/0 | 5 |
| 190386 | 1/1 | 5.5/5.5 | 7 | 79/24/0 | 24 |
| 190387 | 0/0 | 0/0 | 0 | 140/4/0 | 4 |
| 190388 | 0/0 | 0/0 | 0 | 96/4/0 | 4 |

- Scholar corruption: 0 on 190382/85/87/88; exactly 20 (psycho
  starting value, via mantle inheritance — see metric 7) on
  190381/83/84; 1 on 190386 (mantle-carried drift, see below).
  No scholar ever crosses 30/60/85. No threshold beats anywhere.
- Village corruption: 0 on four seeds; 2.5–5.5 where the scholar or
  drifters contribute. The 20/20 readings on 190383/84 are a
  single-person mean: `villageCorruption()` is the mean of scholar +
  living roster, so when the roster empties near village-loss the
  scholar's 20 alone reads as "village corruption 20" while every
  NPC sits at 0. Read with care (finding 10).
- Norm: exile dominates (96–145 days/seed); horror days equal
  starving days exactly on every seed (55 total); **power 0 days
  everywhere** — village corruption never approaches the 45 bar
  (max 20, and that only via the empty-roster mean).
- Corruption adds: 22 total, all on 190386, all NPC, all reason
  `"hunger erodes"`, +1 each. Zero player adds. Zero unclassified.

### Metric 2 — the slope (butcher → meat → eat)

| seed | butcher calls (granted) | eat calls (granted) | meals | meat created | human meat max in inventory | trauma / corr gain |
|---|---|---|---|---|---|---|
| all 8 | 0 (0) | 0 (0) | 0 | 0 | 0 | 0 / 0 |

- The slope is never attempted: no butcher call, no refusal reason
  ever recorded, no human-meat unit ever created or carried. The
  competent policy refuses human meat in three places (prereg) and
  the pilot confirms the zero is policy, not engine absence — the
  fixture proves `corpseButcher` grants meat and `eatCannibal`
  applies the canon first-meal slope (trauma +35, corruption +14).
- Substrate: person-corpses seen 10–17 per seed (12–17), 0
  butchered, 0 NPC-fed. The corpses are there; nobody touches them.

### Metric 3 — NPC crossings

| seed | npcCannibalTick calls | feeds | discoveries | normShift end |
|---|---|---|---|---|
| 190381 | 600 | 0 | 0 | 0 |
| 190382 | 513 | 0 | 0 | 0 |
| 190383 | 327 | 0 | 0 | 0 |
| 190384 | 297 | 0 | 0 | 0 |
| 190385 | 473 | 0 | 0 | 0 |
| 190386 | 415 | 0 | 0 | 0 |
| 190387 | 580 | 0 | 0 | 0 |
| 190388 | 403 | 0 | 0 | 0 |

- `npcCannibalTick` runs every part (297–600 calls/seed) and never
  feeds once. The crossing substrate never arises: starving days
  with a corrupt (≥35) candidate present = **0 on all 8 seeds**
  (max NPC corruption anywhere: 7). No cannibalism rumors seeded,
  no gossip, `normShift` 0 everywhere.

### Metric 4 — temptation + dark show

- `temptTick`: 297–600 calls/seed, **0 meat parcels offered**.
- `darkCarePackageTick`: 297–600 calls/seed, **0 packages
  delivered**. (Ordinary fan care packages rain down constantly in
  the say-lines — "WE LOVE YOU!" — but none is a dark package; the
  dark lane never fires because nobody is dark enough.)
- `darkShowBeat`: 0 events. Threshold-beat lines: none fired.

### Metric 5 — cravings

- `cravingTick`: 297–600 calls/seed, **0 energy drains**. Nobody
  reaches 60+ corruption (scholar max 20, NPC max 7), so the
  hunger-with-a-voice never speaks. No craving lines in the corpus.

### Metric 6 — fear economy

| seed | addFear events | fear added total | intimidate calls | yielded_dread | collapses | avgFearOf scholar end/max |
|---|---|---|---|---|---|---|
| all 8 | 0 | 0 | 0 | 0 | 0 | 0/0 |

- The fear economy is entirely silent: `addFear` never called,
  `intimidate` never called, no dread anywhere, `avgFearOf` the
  scholar 0 on every seed. Yet fear-flavoured narration fires
  constantly — "You notice the village gives you room on the path
  now. Not fear, exactly. Room." (every seed) and "Out there they
  call you the Feared" (every seed). The latter is the ledger's
  combat frame (`feared = might*2 + killed*2 + betrayed`,
  `src/js/ledger.js:274`), not corruption: a competent scholar who
  kills monsters earns "the Feared" with corruption 0. Coherent
  once you know the frame system; it reads as a dark tell in the
  transcript (sense-test note below).

### Metric 7 — psycho spawns + violence

| seed | malicious-dark max | psycho intros | mantle watches | stage advances | stages reached |
|---|---|---|---|---|---|
| 190381 | 1 | 1 (d97) | 13 | 3 | Rosa Mendez 1→2→3 |
| 190382 | 0 | 0 | 10 | 0 | — |
| 190383 | 2 | 1 (d82) | 5 | 6 | Oliver Moore 1→2→3, Jovan Milic 1→2→3 |
| 190384 | 1 | 1 (d57) | 9 | 2 | gen_xy6gfm3 1→2 |
| 190385 | 0 | 0 | 14 | 0 | — |
| 190386 | 0 | 0 | 2 | 0 | — |
| 190387 | 0 | 0 | 13 | 0 | — |
| 190388 | 0 | 0 | 10 | 0 | — |

- **All 3 psycho intros fired via mantle inheritance, none at
  genesis.** The scholar dies (or the mantle passes) and the new
  bearer is a malicious villager: Rosa Mendez (d97, s190381),
  Jovan Milic (d82, s190383), gen_xy6gfm3 / Lucas Agarwal (d57,
  s190384). Each intro sets corruption 20 + darkPath; the
  corruption then never grows.
- **The arc is the telling part:** in all three seeds the intro
  fires on a villager who had ALREADY escalated through psycho
  violence as an NPC — Rosa stole d5, threatened d14, assaulted
  d21, then inherited the mantle d97; Jovan stole d19, threatened
  d26, assaulted d40, then inherited d82; gen_xy6gfm3 stole d21,
  threatened d36, then inherited d57. The psycho is a person the
  village already knew, not a stranger the System invents.
- Stage gaps fit the canon 7-day cooldowns (Rosa: d5 → d14 →
  d21). No psycho ever reaches a fourth stage (there is none —
  3 is the top).
- `mantleWatch` is the busiest psycho-path call (2–14/seed):
  the mantle passes constantly as scholars die.

### Metric 8 — consequences (crime, justice, foil)

| seed | crimes (types) | witnessed / hidden | justice stage end | heat max | exiles | foil drags (trust calls) |
|---|---|---|---|---|---|---|
| 190381 | 3 (theft 1, threat 1, assault 1) | 3 / 0 | 0 | 25 | 0 | 0 (3,506) |
| 190382 | 1 (assault 1) | 1 / 0 | 0 | 25 | 0 | 0 (2,616) |
| 190383 | 6 (theft 2, threat 2, assault 2) | 4 / 2 | 0 | 25 | 0 | 0 (2,562) |
| 190384 | 2 (theft 1, threat 1) | 2 / 0 | 0 | 25 | 0 | 0 (1,249) |
| 190385 | 0 | — | 0 | 25 | 0 | 0 (2,135) |
| 190386 | 1 (threat 1) | 0 / 1 | 0 | 25 | 0 | 0 (1,347) |
| 190387 | 0 | — | 0 | 25 | 0 | 0 (2,972) |
| 190388 | 0 | — | 0 | 25 | 0 | 0 (1,424) |

- 13 crimes total. 11 of 13 are psycho-escalation stages (same
  villain, same seed, theft→threat→assault). The other 2 have
  `vis_*` villains (s190382 assault d13, s190386 threat d22 hidden)
  with no psycho stage advance — a crime path outside the psycho
  ticks, most plausibly visitors/petitioners (finding 9).
- Justice never moves: stage 0 on every seed, heat max 25
  everywhere (`justiceHeat` called 433–882 times/seed but heat
  sits at 25), no moots held on any booked crime, no exiles, no
  uprisings. The moots in the say-lines are assault accusations
  between villagers that re-announce and lapse (see sense test).
- Trust foil: 0 drags across 18,811 `trustGainProgressive` calls —
  structurally impossible under competent (foil needs corruption
  ≥30; scholar max 20). Corruption vs trust at end is unmeasurable
  here because corruption never gets high enough to bend trust.
- Snapshot reconciliation: crime residue 0 on all seeds (final
  snapshot crime count == last `recordCrime` crimesAfter). NPC
  corruption residue **1 on s190386, 0 elsewhere** — explained,
  not a gap: villager gen_z67yfso drifted +1 on d92, then
  inherited the scholar's mantle on d93, carrying that +1 onto
  the scholar (scholar corruption end = 1). The instrument
  captured both events; the analyzer's mantle rule deletes the
  OLD bearer (`bearerBefore`) from the expectation while the
  carried villager is the NEW bearer (`bearerAfter`), so the
  reconciliation counts it as unexplained. Analyzer fix for the
  next run (metric review).

### Metric 9 — disease (Trembles)

- `contractDisease` calls: 24 across the band (1, 2, 0, 1, 10, 0,
  6, 4 per seed). **Trembles contracted: 0. Trembles cases alive
  at end: 0. Trembles deaths: 0.** No human meat was ever eaten,
  so the prion roll (15%/meal) never rolls. The incurable disease
  is unexercised in lived play for the same reason the slope is.

### Metric 10 — wall numbers

See "Wall numbers" above. Median survival 119d vs sibling
first-numbers corpus shape (abilityfirst-a: median 116d, 1/8
survived, 630 deaths over 851 village-days) — this band is a
touch longer-lived (908 village-days, 708 deaths) with the same
shape: 7/8 villages lost, regional everywhere, national nowhere.

## Sense-test scenes (SENSE-TESTING LAW — read, judged, quoted)

**Scene 1 — the psycho intro lands (s190381, d97).** After Rosa
Mendez stole, threatened and assaulted her neighbours across three
weeks, the mantle passes to her and the game finally names what she
is:

> "FLASHBACK — before the scattering, there was an incident. People
> who knew you then use careful words about it now. You remember it
> differently than they do. You remember it clearly."
>
> "People will notice: watches people's hands, not their faces —
> like appraising tools. Let them. It's useful, being underestimated
> — or feared."
>
> "INNER VOICE: the others are already afraid. Fear is a kind of
> respect that doesn't ask for anything back. You could build
> something here — not on trust. On what people will do to stay on
> your good side. (Corruption starts at 20. The slope is yours to
> walk — or not.)"

Verdict: coherent and genuinely chilling — the fiction acknowledges
what you are without handing you a villain manual, exactly as canon
wants. The one sour note: the intro fires on d97, three months
after Rosa's crimes, so the "incident" flashback reads as backstory
for violence the player already watched happen. The arc still works
because the village knew her first.

**Scene 2 — the Red Table petitions, nobody answers (s190382,
d24–27; same shape on 190384, 190385, 190386, 190387, 190388).**

> "💔 A faction of Thornfield has turned cannibal — and split. The
> eaters walked. The Red Table is a new fire in the world now — 2
> people under Wren."
>
> "They're named, every one: Ellis Delgado, Sanne Haddad. Your move
> — ask them questions (up to three), call a MOOT on it, or turn
> them away at the edge of the firelight."
>
> "They waited three days at the edge of your fire. Nobody called
> the moot. Ellis nods — not angry, just done — and they walk."

Verdict: the prose is excellent and the choice is real — but under
competent play the choice is never made. The scholar is offered a
named cannibal faction at the fire's edge six times across the band
and answers with silence every time, because the competent policy
has no branch for petitioners. The darkest content in the game
arrives as a decision and leaves as a shrug. This is the
measurement's sharpest finding: the cannibal decision is
unexercised, not absent.

**Scene 3 — the moot that never ends (s190381, d15–27).** Naran
stands accused over Natalia. The accusation is announced "days
late", the moot is called, the fire is built, "the moot turns to
you" — then silence, "the count is taken without you" — then the
whole cycle repeats, verbatim, five times in twelve days (d15, d16,
d17, d21, d23, d24, d25). Verdict: robotic. A moot that lapses
should stay lapsed, or escalate; re-announcing the same accusation
as fresh news every two days reads as a stuck record, not a village
arguing.

**Scene 4 — the audience turns, forty times at once (s190387,
d114, d145, d146).** The same line fires 10–40 times in a single
day:

> "📱 1 follower turn the audience — care packages thin, the
> System's favor trickles away. (-1 favor.)"
> "📱 2 followers turn the audience … (-2 favor.)"
> "📱 3 followers turn the audience … (-3 favor.)"
> "📱 4 followers turn the audience … (-4 favor.)" (× ~30)

Verdict: incoherent as narration. One day's favour loss should be
one line (or one line per follower with distinct content); forty
identical lines is a log leak wearing a costume. Same shape on
s190381 (d92), s190382 (d121), s190388 (d68).

**Scene 5 — the keepsake that won't stop talking (s190386 d23–90;
s190388 d97–101).** "You hold Lucky Coin. Worn smooth. James
flipped it before every hard thing…" repeats verbatim 5–7 times
per run, always ending "The feast was the weapon." (truncated
mid-sentence by the 600-char say cap). Verdict: a good line worn
out by repetition — it should fire once per bearer, or vary.

**Scene 6 — "the Feared" on a clean scholar (s190388, d48).**

> "◈ WORD TRAVELS — riders from Stonebridge bring talk of Haven.
> Out there they call you the Feared. The show's narration lingers
> on your hands."

The scholar on this seed has corruption 0, has never threatened
anyone, never touched human meat — and the village already calls
them the Feared. Verdict: coherent once you know the ledger frame
(kills + might), but in the transcript it reads as a corruption
tell. A player who has played clean will reasonably conclude the
game thinks they are dark. The epithet's source (combat) and its
flavour ("lingers on your hands") pull in different directions.

**Scene 7 — the one real corruption moment (s190386, d92–98).**
Four villagers — a joiner, an applicant and two visitors — each
gain +1 corruption a day for seven days while the village starves
("hunger erodes"), reaching 7. One of them (gen_z67yfso) then
inherits the scholar's mantle, carrying that single point of
corruption onto the player. Verdict: the drift mechanic works
exactly as designed — hunger erodes, slowly, one point a day — and
at that rate it would take a month of starvation to reach even 30.
The numbers say the slope's on-ramp is starvation, and starvation
kills the village first (24 starving days, village lost d104).

## Village assessment (plain words)

Eight villages, one story with local variations: a competent
scholar keeps people fed and learning for two to five months, the
village reaches regional standing and wave 4 or 5, then dies —
usually with the pantry empty and the roster thin. The dark side of
the game is a rumour from elsewhere: neighbouring villages split
into cannibal factions and knock on Haven's door, psychos steal and
threaten and hit people in the camp, and three times the darkness
moves into the scholar's own chair. But nobody in Haven itself ever
eats a person, nobody is tempted, nobody is exiled, and the
corruption number — the dark mirror of trust — sits at zero almost
everywhere. The game has built a whole terrible bargain (power at
the price of cravings, brittle loyalty, exile risk, prion death)
and then, under the way a competent player actually plays, never
offers the bargain to anyone. The one exception proves the rule:
the only corruption that exists in 908 village-days comes from
hunger itself, one point a day, and it arrives too slowly to matter
before the village dies of that same hunger.

## Metric review (§14 — never re-scored, for the NEXT run)

1. **The metric set held.** Every GO row judged as written; no row
   was re-scored, no threshold moved. The zeros are findings, not
   metric failures — the instrument would have caught a meal (the
   fixture proves it), so zero meals is a measured zero.
2. **Revision proposed — analyzer mantle reconciliation:** the
   `reconcileNpcCorruption` rule should drop the carried vid
   (`bearerAfter` when it was an NPC) instead of the old bearer
   (`bearerBefore`). As written it reports residue 1 on s190386
   for a fully-explained carry-over. One-line fix; the GO table
   has no residue bar, so this changes no verdict.
3. **Revision proposed — a dark-policy leg is needed for metrics
   2/4/5/6/8-foil/9.** Under competent play those metrics are
   structurally zero: the policy refuses human meat, never calls
   a moot on petitioners, never intimidates, never reaches
   corruption 30. First numbers under competent are the right
   baseline, but they cannot measure cravings, the foil, fear, or
   Trembles — those need a policy leg that actually walks the
   slope (or a fixture-driven policy that attempts butchery when
   a person-corpse is near). Recommend the next corruption run
   add a "willing" policy leg on the same seeds.
4. **Revision proposed — petitioner engagement is a metric, not
   a scene.** The Red Table petitions 6+ times per band and the
   competent answer is always silence. A future run should count
   petitioner outcomes (moot called / questions asked / turned
   away / admitted) as a first-class metric — the cannibal
   decision is currently the game's most-offered and least-taken
   choice.
5. **Say-cap caveat (unchanged from siblings):** the 200-line
   per-seed cap never bound (max 125 lines, s190387), but the
   cap can exhaust early on long runs; the audience-spam scenes
   show the cap is spent on repeats, not signal.

## Findings (for the coordinator to append to sim-findings.md)

- [open] 2026-11-11 — corruption/petitioners — the competent scholar never answers a cannibal petition: Red Table factions petition at Haven's fire on 6/8 seeds and every time nobody calls the moot, nobody asks questions, and the petitioners walk after 3 days; the exile/power decision is unexercised in lived play (sim-corruptfirst-a, evidence/2026-11-11/sim-corruptfirst-a.md).
- [open] 2026-11-11 — corruption/substrate — the NPC cannibal-crossing substrate never arises under competent: max NPC corruption 7 vs the 35 gate, 0 starving days with a ≥35 candidate, 0 NPC feeds in 908 village-days; drift is +1/day ("hunger erodes") and starvation kills the village first (sim-corruptfirst-a).
- [open] 2026-11-11 — corruption/slope — the scholar slope is zero by policy, not by engine: 0 butcher calls, 0 meals, 0 human-meat units in 908 village-days; person-corpses seen 10–17/seed, 0 butchered; fixture proves the verbs live, so a "willing" policy leg is needed to measure the slope at all (sim-corruptfirst-a).
- [open] 2026-11-11 — corruption/psycho — psycho intros fire only via mantle inheritance (3/3: d57, d82, d97), never at genesis in this band, and each fires on a villager who had already escalated theft→threat→assault as an NPC; genesis psycho spawn rate is unmeasured (sim-corruptfirst-a).
- [open] 2026-11-11 — corruption/fear — the fear economy never runs under competent (0 addFear, 0 intimidate, avgFear 0 on all seeds) while fear-flavoured lines fire constantly; "the Feared" epithet is the kills/might ledger frame, not corruption, and reads as a dark tell on a clean scholar (sim-corruptfirst-a).
- [open] 2026-11-11 — corruption/crimes — 2 of 13 booked crimes have vis_* villains with no psycho stage advance (s190382 assault d13, s190386 hidden threat d22): a crime path outside the psycho-violence ticks, most plausibly visitors/petitioners (sim-corruptfirst-a).
- [open] 2026-11-11 — corruption/analyzer — analyzer mantle reconciliation drops the wrong bearer (bearerBefore instead of bearerAfter), reporting residue 1 on s190386 for a fully-explained carry-over (gen_z67yfso +1 drift d92, mantle d93, scholar corruption 1) (sim-corruptfirst-a).
- [open] 2026-11-11 — corruption/norm — villageCorruption reads 20 when the roster empties (mean over scholar alone, n=1) while every NPC sits at 0; the "village corruption" number is a single-person mean at village-loss, not a village state (sim-corruptfirst-a).
- [open] 2026-11-11 — moot/repetition — the same moot accusation re-announces verbatim every few days (s190381 Naran/Natalia: d15–d25, five cycles) after lapsing for silence; a lapsed moot should stay lapsed or escalate, not re-announce as fresh news (sim-corruptfirst-a).
- [open] 2026-11-11 — audience/spam — audience-favour loss spams the identical line 10–40× in a single day (s190387 d114/d145/d146, s190381 d92, s190382 d121, s190388 d68); one day's favour loss should be one line (sim-corruptfirst-a).
- [open] 2026-11-11 — keepsake/repetition — the keepsake L2 line "You hold Lucky Coin… The feast was the weapon." repeats verbatim 5–7× per run (s190386, s190388); it should fire once per bearer or vary (sim-corruptfirst-a).

## Adoption note (process deviation, disclosed honestly)

- Adopted arm from the dead 1315Z run. Corpus as found: 7 control
  legs only (190381–190387). Finished control 190388 + all 8
  neutral legs on the same band with the existing driver; total
  pilot wall time for the finished legs ~36 min (9 legs). No seed
  re-picked, no prereg rewritten, no GO bar touched.
- The dead worker's foil fix was uncommitted; kept, proof re-run
  green 63/63, committed here. The fix predates the pilot corpus
  files, so no leg was re-run.
- One redundant `worktree-heartbeat.sh` invocation hung ~7 min
  (hot-tree git slowness) and was killed with SIGTERM; the run's
  own heartbeat at start had already landed, and no sim work
  depended on the killed call. No work lost.
- Rebase note: see the rebase section below (filled at landing).

## Rebase

- Pilot anchor: ae53134ae. Rebase target: 488506a47aa5fc930444cfd504bd2e7c7f6fc6d7 (master SHA read immediately before rebasing).
- `src/js/corruption.js` moved in ae53134ae..master: NO — zero commits in the range touched it (8 commits in range, none in corruption.js). No post-rebase pilot re-run required; the corpus is judged on anchor base ae53134ae.
- Post-rebase proof: <result — filled after the rebase + proof re-run>.
