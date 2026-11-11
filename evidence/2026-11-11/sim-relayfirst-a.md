# sim-relayfirst-a — Relay / Network campaign first numbers (Loop A, fleshout-loop-20261111T1115Z)

- **Run:** fleshout-loop-20261111T1115Z, Loop A, arm sim-relayfirst-a
- **Branch:** `sim-relayfirst-a` (base b09cf584e, local master)
- **Prereg:** `evidence/2026-11-11/sim-relayfirst-a-prereg.md` (written 11:35 UTC, before any judged sim)
- **Scripts:** `scripts/relayfirst-instrument-20261111.js`, `scripts/relayfirst-driver-20261111.js`, `scripts/relayfirst-analyze-20261111.js`, proof `scripts/test-relayfirst-a.js` (39/39 GREEN, fixture seed 99104)
- **Corpus:** `evidence/2026-11-11/perseed-relayfirst-a/` — 8 control + 8 neutral per-seed files; summary `evidence/2026-11-11/relayfirst-summary-relayfirst-pilot.json`
- **Verdict: GO** — every pre-registered GO row passes. A GO makes no landing claim and spends no confirm band (measurement arm).

## Canon + code read (first)

Read docs/CANON.md first, then TABLE.md §7 + Overtime/Network/HOSTS, TERMINAL-CAMPAIGNS.md, SCALE.md (Binding), `src/js/network-campaign.js` (full), `finale-campaign.js` header, `relay-ext.js`, `relay-dialogue.js`, `comms.js` switchboard, `src/data/titans.json` (`_overtime`, `the_network`), coverage audit `hidden_files/coverage-audit-20261110.md` §4, sibling pattern files (abilityfirst prereg/evidence/instrument/driver/analyzer/proof), bindingtrace-b evidence + policy, MEASUREMENT.md §§9–12, 14–15.

The relay road, in plain words: once a village is well-connected with the outside world (integration stage 3, or stage 2 plus holding a relay office), one villager can take up the relay — carrying messages between Haven and the wider world. That holder can probe, reroute, deepen, and commune with the System through the relay, and over time the System grants relay abilities (deep-listen, faithful-carry, relay-sight, and others). The office that makes the road possible is the switchboard, which arrives with the regional game. The Network campaign is the endgame clock: once the Table has offered a seat and nobody sits in it, overtime tiers climb, and at tier 3 — if the three great beasts (the Herald, Nielsen, and the Finale) have all been slain — THE NETWORK is summoned: nine wave-6 monsters in a march (4 towers, 4 limbs, 1 heart) that the village must fight node by node. The Binding is the belong road's ceremony: a foreign realm, Haven becoming subordinate, good standing, then the Binding itself.

## Pre-registration

Primary metric: complete first-numbers capture of the relay road + Network campaign in a lived village. GO required ALL of: 0 unclassified relay events; 0 unattributed W6 events; 0 unclassified seeds; each wrap live in pilot or proven live in fixture + marked dead; neutrality 8/8 exact (days + end pantry kcal + deaths); 0 instrument errors; per-seed tables for metrics 1–10 + sense-test scenes; engagement floor ≥1 road-opportunity event band-wide. Horizon 150d death-aware; seeds 190331–190338 (fresh as seed naming — verified across evidence `*.md` and all `sim-*-prereg.md`; same honest caveat as abilityfirst: full-tree `.json` grep not completed); policies: control = competent verbatim, instrument ON; neutral = same policy, instrument OFF.

## Results — GO table

| GO row | Bar | Result | Verdict |
|---|---|---|---|
| relayClassified | 0 unclassified relay events (verbs + grants + ability uses) | 0 (0 events; all 16 relay wraps dead-in-pilot, proven live in fixture) | PASS |
| w6Attributed | 0 unattributed W6 events (spawn + face + kill residue 0) | 0 (no W6 spawn/face/kill anywhere; spawn/face/kill residue 0) | PASS |
| belongClassified | 0 unclassified seeds (every seed B0–B5/none) | 0 (8/8 classified: B0 ×4, none ×4) | PASS |
| wrapsLiveOrDead | each wrap live in pilot or proven live in fixture + marked dead | ledgerAdd/spawnWorldMonster/startCombat/tbEnd/tele live; 16 relay wraps + networkSummon + soundTitanCall dead-in-pilot | PASS |
| neutrality | 8/8 exact (days + pantry + deaths) | 8/8 | PASS |
| instrumentErrors | 0 | 0 | PASS |
| perSeedTables | metrics 1–10 per seed + scenes | below | PASS |
| engagementFloor | ≥1 road-opportunity event band-wide | 7/8 seeds with opportunity | PASS |

**Band totals:** 965 village-days; relay events 0; grants 0; ability uses 0; unlocks 0; summons 0; titans slain 0; binding staged 0; binding answered 0; belong links 0; wins 0; national 0; table 0; wave 5 reached 2/8; wave 4 reached 8/8; survivors 2/8; deaths 698; median survival 147d (upper median; sorted days 58, 87, 108, 117, 147, 148, 150, 150).

## Per-seed table (metrics 1–10)

| Seed | Days | End | Wave | Rank | Standing | Deaths | Relay ev | Grants | Abil uses | Unlocks | Summons | Titan calls / slews | Spawns | Faces | Fights | Tele | Snaps | Says | Errors |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 190331 | 108 | village-lost | 4 | regional | 199 | 83 | 0 | 0 | 0 | 0 | 0 | 0 / 0 | 1 | 0 | 0 | 35 | 107 | 200 | 0 |
| 190332 | 87 | village-lost | 4 | regional | 190 | 68 | 0 | 0 | 0 | 0 | 0 | 0 / 0 | 0 | 0 | 0 | 27 | 85 | 200 | 0 |
| 190333 | 150 | survived | 5 | regional | 445 | 94 | 0 | 0 | 0 | 0 | 0 | 0 / 0 | 13 | 43 | 2 | 45 | 149 | 200 | 0 |
| 190334 | 148 | village-lost | 5 | regional | 350 | 135 | 0 | 0 | 0 | 0 | 0 | 0 / 0 | 19 | 24 | 14 | 49 | 146 | 200 | 0 |
| 190335 | 58 | village-lost | 4 | village | 195 | 51 | 0 | 0 | 0 | 0 | 0 | 0 / 0 | 0 | 0 | 0 | 24 | 54 | 151 | 0 |
| 190336 | 147 | village-lost | 4 | regional | 199 | 103 | 0 | 0 | 0 | 0 | 0 | 0 / 0 | 2 | 111 | 0 | 48 | 146 | 200 | 0 |
| 190337 | 117 | village-lost | 4 | regional | 199 | 94 | 0 | 0 | 0 | 0 | 0 | 0 / 0 | 1 | 0 | 0 | 44 | 116 | 200 | 0 |
| 190338 | 150 | survived | 4 | regional | 199 | 70 | 0 | 0 | 0 | 0 | 0 | 0 / 0 | 2 | 36 | 0 | 33 | 150 | 200 | 0 |

Neutrality (control vs neutral, days / end pantry kcal / deaths): 190331 108/0/83 = 108/0/83; 190332 87/0/68; 190333 150/600/94; 190334 148/0/135; 190335 58/40944/51; 190336 147/0/103; 190337 117/0/94; 190338 150/4679/70 — exact on all 8.

## Relay road — the zero, with the door proven open

Competent never takes the relay road. Not once: 0 verbs (probe / reroute / deepen / commune), 0 grants, 0 ability uses, 0 unlock checks that grant anything, on all 8 seeds across 965 village-days. The instrument proves this is a policy fact, not an instrument blind spot: all 16 relay wraps were proven live in the fixture (and `claimRelay`/`appointSwitchboard` were proven to fire their grants path there), and the live wraps (`spawnWorldMonster`, `startCombat`, `ledgerAdd`, `tele`) all fired in the pilot.

And the door was open. The switchboard office — the relay road's prerequisite — was available on 7/8 seeds, for 20–108 days each (first available day 41–68; 190333: 104 days from day 49; 190336: 108 days from day 41; 190338: 100 days from day 53). End-of-run integration read 100 on all 8 seeds — the integration-stage gate (stage 3) is satisfied everywhere. System bond stayed 0 and grounding stayed 100 everywhere, because nothing ever engaged the relay. So: the road is reachable in the fiction (office present, integration maxed), and no villager ever walks it under competent play. This is the capable-only-in-practice finding the audit predicted, now measured: `relayRoad` lives in `scripts/policies/capable.js:828` and nowhere in competent, and the pilot confirms competent produces exactly 0 relay verbs in 965 days.

## Binding chain — stops at B0, and the substrate forms one link

| Seed | Stage | Foreign realm (day) | Max foreign size | Belong link | Good | Qualify | Staged | Answered | Counters | Links ever |
|---|---|---|---|---|---|---|---|---|---|---|
| 190331 | B0 | d64 | 4 | — | — | — | — | — | 0 | 1 primary |
| 190332 | none | — | 3 | — | — | — | — | — | 0 | 1 primary |
| 190333 | B0 | d64 | 6 | — | — | — | — | — | 0 | 1 primary |
| 190334 | B0 | d57 | 5 | — | — | — | — | — | 0 | 1 primary |
| 190335 | none | — | 0 | — | — | — | — | — | 0 | 0 |
| 190336 | B0 | d50 | 5 | — | — | — | — | — | 0 | 1 primary |
| 190337 | none | — | 3 | — | — | — | — | — | 0 | 1 primary |
| 190338 | none | — | 3 | — | — | — | — | — | 0 | 1 primary |

The Binding never starts: 0 belong links, 0 counters staged, 0 good-standing days, 0 qualifies, 0 staged, 0 answered, on all 8 seeds. On the 4 seeds where a foreign realm forms (B0), the chain stops at the first step — Haven never becomes subordinate. This matches sim-bindingtrace-b's finding (0 counters, 0 subordinate links on its substrate) on a different substrate, and adds a substrate fact: under plain competent, each village forms exactly one Haven-primary link (7/8 seeds; 0 on the seed that died day 58) and never a second. With one link, the ladder's "three seasoned subordinate links" arithmetic can never begin. Note also: scaleRank reads "regional" on 7/8 seeds while each village holds exactly 1 link — the rank is not a link count, and anyone reading scale as hierarchy progress should know that.

## Network gate — the tier leg is met; the titan leg is not, and the field kill doesn't count

The Table was announced on day 90 (the earliest possible day) on 5/8 seeds and waited, unanswered, for 20–63 days (190331: 20d; 190333: 63d; 190334: 59d; 190336: 59d; 190338: 63d). Nobody ever sat (table 0/8; `pg.table` an empty object at every run end). While the seat waited, overtime accrued: tier 1 by day 107–114 on 4 seeds, tier 2 on 3, **tier 3 on 2 seeds** (190333 day 150, the last day; 190336 day 144). The Network key needs overtime ≥ 3 AND herald + nielsen + finale all slain. The tier leg was met on 2/8 seeds. The titan leg was met on 0/8.

Titan omens staged but never resolved: herald omen stage 2 on 6/8 seeds, nielsen stage 2 on 3/8, finale stage 2 on 2/8. Titans slain: 0 on all 8 seeds. The Herald was placed on the map (tile 7,4 — the fiction's lair line matches the instrument exactly) on 4 seeds (days 52–69) and Nielsen on 2 (day 140 on 190333).

**The finding: villagers can kill the Herald in the field, and it does not count.** On 3/8 seeds a villager killed the Herald outside any muster fight — 190333 day 80 (killer `visjoin_77`), 190334 day 122 (`app_mgpspj8y32`), 190336 day 129 (`visjoin_125`). Each time the village told the tale at the fire (`killer_tale` tele) and the Herald left the map the next day (on-map days end 79 / 120 / 127). Yet `titansSlain` stayed empty on all three seeds. The mechanism: only `titanVictory` — the muster fight's resolution — sets `slain[herald]`; a field kill removes the world monster without ever touching the titan record. So the Network key's Herald leg can never be satisfied by a field kill, and on this band every Herald death was a field kill. (Corroborated by sim-killdisc, 2026-10-21: "The Herald (w4 titan) refuses solo entry 38× — muster gate, no fight" — the muster gate is the only road to a counted slay, and competent never musters.)

## Network march / W6 census — all zero, with opportunity proven

- W6 spawns: 0 (no `network_tower`, `network_limb`, or `network_heart` spawned anywhere).
- W6 faces: 0. W6 kills: 0. Network summon tele: 0. `networkFallen`/`networkLost`: 0. Network campaign record: never created on any seed.
- The 38 spawn events that did occur are all non-W6 and reconciled with 0 residue: herald ×4, nielsen ×2, finale_crew ×2, editor ×12, timeslot ×5, rerun ×5, spoiler ×2, cancellation ×1, `network_note` ×2 (a note, not a node), plus 3 more escort kinds across the band. No W6 kind appears in any spawn, face, fight, or kill record.

This zero is interpretable, not an instrument failure: the engagement floor is met (7/8 seeds with opportunity — switchboard available, or table announced, or titan omen stage ≥1, or overtime tier ≥1). Villages reached the stage where the road opens; the road was never walked because the gate's titan leg never closed.

## Finale march — the crew arrives, is refused 12 times, never fights

The finale titan's crew piece was placed on day 97 on seed 190333 (`finaleCampaignPlace` via `titanAdvanceOmen`), and the scholar faced it 12 times across days 125–126 — every one refused by the muster gate (`titanEntryGate`). The finale campaign record exists on 190333 and 190334 but reads `{started: false, crew: false, opening: false}` at run end: the march never started. No finale_crew / finale_opening / finale fight happened on any seed.

## Faces and refusals — 214 attempts, 199 refusals, 0 titan fights

| Seed | Faces | Refused | Non-refused | Fights |
|---|---|---|---|---|
| 190331 | 0 | 0 | 0 | 0 |
| 190332 | 0 | 0 | 0 | 0 |
| 190333 | 43 | 41 | 2 | 2 |
| 190334 | 24 | 11 | 13 | 14 |
| 190335 | 0 | 0 | 0 | 0 |
| 190336 | 111 | 111 | 0 | 0 |
| 190337 | 0 | 0 | 0 | 0 |
| 190338 | 36 | 36 | 0 | 0 |
| **Band** | **214** | **199** | **15** | **16** |

Refusals by kind: herald 186, finale_crew 12, cancellation 1. The 15 non-refused faces are all ordinary wave-5 wild fights (editor, timeslot, rerun, spoiler) — 2 won on 190333 (editor, days 99 and 101), 14 fought on 190334 (won 2, lost 5, routed 7). No titan fight ever started: `soundTitanCall` 0 calls on all 8 seeds; the muster count the refusal line reports is 0 every time.

The refusals are an engine loop, not a policy choice: the stacks show `monsterTurn` (game.js:24228/24195) calling `startCombat` every turn while the scholar stands on or beside the titan's tile, and the titan wrap refuses each time. On seed 190336 the scholar attempted the Herald 111 times (up to 12 in a single day) and was refused every time. The village never musters and never walks away — it hammers a locked door for weeks.

One anomaly, recorded honestly: 16 fights vs 15 non-refused faces. The extra fight (seed 190334, day 134, cancellation, routed) has no `startCombat` face at all — it started through a path that bypasses `startCombat`. Direct `this.tbfight = {...}` constructions exist in `encounters.js:2775`, `game.js:9798` and `game.js:35331`, `justice.js:848`, `party.js:690` — a second fight-entry path the instrument's `startCombat` wrap does not cover. Face→fight attribution is still 0 residue (every face is attributed); fight→face coverage is 15/16. The single same-day cancellation face was refused by the already-in-a-fight guard (`startCombat` returns bare `undefined` when a fight is live, which the instrument's `ret == null` rule records as refused) — a classification blur worth fixing in the next instrument: distinguish the titan/muster refusal from the already-in-a-fight guard.

## Sense-testing — the fiction is coherent; the loop that repeats is the refusal

The say corpus is capped at 200 lines per seed and exhausts around day 60–80 (190331 day 60, 190333 day 64, 190334 day 69, 190336 day 73, 190338 day 80), so the overtime/Network window (days 80–150) is blind in the say corpus — the scenes below are what the corpus does capture, and the counts are what the events prove. The corpus is also noisy: the broad keywords (`table`, `seat`, `network`) fill it with keepsake lines ("You hold Dog tags…") and the four-ways-to-call SYSTEM RELAY line, which is the aid-call relay, not the switchboard road. The scenes that are genuinely about this arm:

Herald arrival, seed 190333 day 60:
> "📻 The old ones point at the horizon and don't speak. The System, for once, is quiet too. Then: the Herald. It heralds the apocalypse the way dawn heralds the day."

The lair is found, seed 190333 day 62 (also 190336 day 52, 190337 day 68, 190338 day 65):
> "🗺️ Scouts found its lair — tile 7,4. THE HERALD — the sky, getting bigger. It is WAITING. You cannot face it alone. Sound the call."

Tile 7,4 is exactly where the instrument recorded the Herald's spawn. Fiction and measurement agree.

The Herald raids while the village waits, seed 190336 days 52 and 62 (also 190338 day 65, Emberhold):
> "🌪️ THE HERALD struck Thornfield in the night. They bled while the coalition talked. (trust −5 — they notice who wasn't there.)"

The refusal, seed 190336 day 72 — the whole competent story in one line:
> "⛔ THE HERALD does not notice you the way prey notices a hunter. It notices you the way weather notices a field. You cannot face this alone — sound the call, muster 10 allied blades (you have 0). This is…"

A muster beat that is not the titan muster, seed 190334 day 45 — the village does know how to muster against lesser threats:
> "📯 MUSTER — scouts report The Spoiler hunting near Haven, and it is beyond us. Everyone inside. No one walks the treeline alone — the garden crews double up, the hunters stand down. We outlast it."

Judgement: the omen and refusal lines land — the Herald reads as weather, not prey, and the raid line makes the cost of waiting legible (trust −5, named villages bleeding). What does not read well is the repetition the instrument proves but the corpus mostly misses: the same refusal line firing up to 12 times in a day, for weeks, while the scholar stands on the Herald's tile and the village neither musters nor leaves. One refusal is a clear gate; 111 is a stuck loop. And the field-kill tale — a villager kills the Herald and the village celebrates at the fire — sits oddly against the gate: the beast is dead, the tale is told, and the Network key still reads "Herald: not slain." The fiction says the village won; the ledger says nothing happened.

## Wall numbers

- Survival: median 147d (upper median), 2/8 survived to day 150, 6/8 village-lost (days 58–148).
- Standing: max 445 (190333), then 350 (190334); all other seeds 190–199. Scale rank regional 7/8, village 1/8; national 0/8.
- Waves: wave 4 on 8/8, wave 5 on 2/8. Wins 0/8. Table announced 5/8, sat 0/8.
- Deaths: 698 total across 965 village-days (0.72/day). By kind: monster 574 (82%), villager 118 (17%), person 6. By cause: villager combat 294, expedition 178, combat 103, the wild 72, monster 20, arena 9, ambush 5, contest 4, a wound that wouldn't close 4, the phoenix link 2, Gavel 2, thirst 1. Starvation: 0.

## Balanced panel

Measurement arm, no lever, no before/after — no panel comparison to fabricate (same position as abilityfirst/trustfirst). Control/neutral legs are the neutrality proof (8/8 exact).

## Telemetry deviation check (§10)

`node scripts/telemetry-check.js --baseline ~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/scale-wall.json --current 'evidence/2026-11-11/perseed-relayfirst-a/relayfirst-s*-relayfirst-pilot-control.json' --metrics national,table,wins,exiled` **refused the input**: "refusing recorder-corpus input: all 8 --current rows carry top-level anchorCommit, so they are sweep recorder rows, not runs. Recorder corpora are compared with sweep-compare tables, never against a run baseline here." No LOUD lines were produced, and no baseline was rolled.

The manual comparison is also the wrong comparison, and the baseline says so itself: scale-wall.json is the **winseat** regime (national 12/16, table 16/16, wins 16/16) with the note "DO NOT compare pre-seat / courtship / readiness substrates against this baseline — wins are structurally ~0 there and telemetry-check will fire a spurious LOUD 'wins disappeared'." This arm is plain competent, a pre-seat substrate: national 0/8, table 0/8, wins 0/8 is the regime artifact the note warns about, not a deviation. No baseline action taken.

## Metric review

1. **GO is valid but vacuous on the relay rows.** 0 unclassified relay events and 0 unattributed W6 events pass because 0 events occurred. That is the correct first-numbers result (the road is not walked), not a defect — but the GO does not prove the instrument would classify a relay event if one happened. The fixture proof (39/39, every wrap live on seed 99104, RED checks passing) is the evidence the instrument can see the road; the pilot proves nobody walks it.
2. **The engagement floor did its job.** 7/8 seeds had road opportunity (switchboard available 20–108 days, table announced, omens staged, overtime tiered). Only 190335 (died day 58, no switchboard, no table, no omens) had none. The zero is interpretable.
3. **The say corpus is the weakest instrument here.** The 200-line cap exhausts at day 60–80 on a 150-day horizon, and the broad SAY_RE fills it with keepsake/water/SYSTEM RELAY lines. The late-game road (overtime tiers 110–150) has no say coverage. A future relay arm should raise the cap or narrow the regex to relay/Network-specific lines and record the refusal line's repeat count from `say` directly.
4. **The `ret == null` refusal rule blurs two refusals.** The titan/muster refusal and the already-in-a-fight guard (bare `return` in `startCombat`) both read as `refused: true`. One event (190334 day 134 cancellation) shows the blur matters. A future instrument should read the refusal reason.
5. **The fight-entry path is wider than `startCombat`.** One fight (190334 day 134) started with no `startCombat` face; direct `tbfight` constructions exist in at least five places. A census that only wraps `startCombat` undercounts fights by this path (1/16 here).
6. **Median convention.** The analyzer reports the upper median (sorted[4] = 147d); the two-middle mean would be 132d. Same convention as sibling analyzers; the sorted list is printed above so either can be read.
7. **No re-scoring.** The GO bar was fixed in the prereg and never re-scored mid-run. The herald field-kill finding was discovered in the pilot data, not in the prereg — it is reported as a finding, not a GO-row change.

## Findings

- The relay road is capable-only in practice under competent play: 0 verbs/grants/ability uses in 965 village-days, with the switchboard available 20–108 days on 7/8 seeds and integration at 100 on all 8. The door is open; nobody walks through it.
- A villager field-kill of the Herald does not count toward the Network key: 3/3 Herald deaths on this band were field kills (days 80/122/129), the Herald left the map each time, and `titansSlain` stayed empty — only the muster fight sets slain. The Network summon is unreachable by the only path through which the Herald actually dies under competent play.
- The muster gate is hammered, never used: 199 refused titan faces, 0 muster calls, 0 titan fights; the engine re-offers the fight every monster turn while the scholar camps the titan's tile (111 attempts on seed 190336).
- The Binding stops at B0 on this substrate: foreign realm on 4/8, 0 counters, 0 belong links — and competent forms exactly one Haven-primary link per seed, so the three-seasoned-links arithmetic never begins.
- The finale march never starts: crew placed day 97, faced 12 times, refused 12 times, campaign record `{started: false, crew: false, opening: false}`.
- Scale rank reads "regional" with exactly 1 link held — the rank is not a hierarchy count.

## Convergence state

Coverage Program Tier 2 (Steve 2026-11-10 "Measure all"): relay/network first numbers are now measured on plain competent. Prior state was Partial (capable-only relayRoad, 10 relay tests, no panel metric) + sim-bindingtrace-b (Nov 10, tableseat-nowait substrate). This arm adds: the relay road is 0 under competent with availability proven; the Network gate's binding leg is the titan slay, and the only observed Herald deaths are field kills that don't count; W6 is 0 everywhere on this band; the Binding fails at B1 on this substrate too, with a one-link ceiling. No lever to land; no confirm band spent. Next work, if Steve wants it, is a design question, not a measurement question: who musters, and does a field kill of a titan count?
