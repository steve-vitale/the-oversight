# sim-bowopen-a — evidence

Run fleshout-20261119T0615Z, Loop A (axis scale-onramp). Branch
`sim-bowopen-a`, base master b76d65445 (local master tip = the
20261119-054521 batch ship). Worktree
`~/workspace/worktrees/sim-bowopen-a`. Prereg:
`evidence/2026-11-19/sim-bowopen-a-prereg.md` (frozen 2026-11-19
~06:30 UTC, before any new sim). Substrate: the sense fix HELD on
branch `sim-launchparty-sense-a` (tip d01eaf0a5), merged as commit
255682942 (conflicted only in `src/js/villager-brain.js` on the
partyTrios counter — master's newer version subsumes the sense
branch's older hunk; HEAD side kept whole, noted in code). This run's
own work in separate commits after that merge. Analyzer:
`scripts/analyze-bowopen-a.js` (selftest 33/33). Analysis:
`evidence/2026-11-19/bowopen-a-analysis.json`.

## 1. The question

**Finding #2544 (fight capability: damage output).** Launched
parties almost never win wave-4 fights: 2 kills in 34 pair-inclusive
engaged meetings across both fightcap-a bands (kill share 0.059);
the damage arm's band 0/13. The ONLY two kills came from one party
shape: Rage x2.5 on the fighter + a bow opening (~50–60 damage) +
all three members hitting every round, ~111 damage/round. The
Rage/carrier half is Loop B's work — this arm tests ONLY the
ranged-opening half: launched parties stage a bow and arrows at
launch gear-up so the party opens ranged.

## 2. Verdict — NO-GO (the staging never staged a bow; the pilot measures a null, not the opening)

| Bar | ctl | arm | Requirement | Result |
|---|---|---|---|---|
| Pool floor (pair-inclusive engaged, present) | 27 | 27 | arm ≥ 10 | **PASS** |
| Kill share (pair-inclusive) | 0.037 (1/27) | 0.037 (1/27) | arm ≥ 0.25 | **FAIL** |
| Damage/round (pair-inclusive) | 42.4 | 42.4 | arm ≥ 70 | **FAIL** |
| Community loss | 5/8 | 5/8 | arm ≤ ctl + 0.125 | PASS |
| Villager starvation | 4 | 4 | arm ≤ ctl + 2 | PASS (totals 4 vs 4) |
| Median survival | 120.5d | 120.5d | ratio ≥ 0.80 | PASS (1.00) |
| Instrument errors | 0 | 0 | 0 | PASS |
| Mechanism: volley fired | 9/27 | 9/27 | ≥ 0.50 (check) | **FAIL — 0.33, identical both legs** |

The two legs are **bit-identical on every measured number** — same
27 pair-inclusive meetings, same outcomes, same damage, same
per-seed days/standing/wave/deaths (§4). The staging ran 400 times
on the arm leg and **never staged a bow** (§5). So this pilot does
NOT measure whether a ranged opening turns launched parties into
winners — it measures a departure staging that found nothing to
stage. The NO-GO is frozen and stands; the mechanism diagnosis (§5)
is the finding, and the next arm is named in §10.
**No 12-seed confirm** — the prereg gates the confirm on the pilot
passing the sniff test, and it did not.

## 3. The mechanism (what was built)

`Game.villagerStageBow(vid)` (`src/js/game.js`, next to
`villagerPocketAmmo`), called from `startExpedition`
(`src/js/villager-agency.js`) between `villagerGearUp(vid, true)`
and `villagerPocketAmmo(vid)` — at launch gear-up, after the sick
sit-out return, so a villager who stays home stages nothing.
Env-gated `BOWOPEN=1` (off = byte-identical old behavior, no state
writes at all — the ctl corpora carry zero bowOpen telemetry by
design). Staging order, honest sources only: (0) already holds a
ranged weapon → no-op; (1) own stashed ranged weapon; (2) communal
armory deposited ranged weapon (ledgered); (3) ONE craft attempt per
departure from the EXISTING bow / crude_bow recipes, using the SHARED
`v.weaponCraft` knowledge record (no knowledge → no attempt; blind
35%, learned 85%; materials own-carried first, then the communal
pile); (4) nothing available → goes without. PocketAmmo then runs as
today, so a staged bow gets its arrows. Proof test
`scripts/test-bowopen-a.js`: **36/36 green** — every source leg,
both craft outcomes, the no-knowledge / no-materials no-ops, the
fold-in lift (wb 10 → 21 on a bonus-20 melee fighter), a real
wave-4 volley off a staged bow + pocketed arrows, the
startExpedition end-to-end wiring, the player skip, and the Rage
guard (BOWOPEN appears in game.js's stageBow only and nowhere in
godpath.js).

## 4. Fresh pilot — before / after on identical seeds (8 seeds, 105701–105708)

Pilot logs: `bowopen-a-{ctl,arm}.log/.err` (both exit 0, 0
instrument errors, 0 stderr lines). Corpus flags verified per file:
ctl `bowopenOn` false, arm true; `bowopenPresent` true both legs;
`gameSha` c6cc292cab28 both legs; `launchpartyOn` true both legs;
`wiringSha` 159bca02f0a0 both legs (the sense substrate present in
code). Substrate both legs: `VETREENGAGE=1 PARTYSIZE4=1
FLEEREPAIR2=1 FIGHTALLY2=1 LAUNCHPARTY=1`.

| Seed | days / standing / wave | (arm leg — identical) |
|---|---|---|
| 105701 | 83d village-lost, 199, wave 4 | identical |
| 105702 | 34d village-lost, 0, wave 3 | identical |
| 105703 | 150d survived, 199, wave 4 | identical |
| 105704 | 58d village-lost, 145, wave 4 | identical |
| 105705 | 135d village-lost, 365, wave 5 | identical |
| 105706 | 150d survived, 415, wave 5 | identical |
| 105707 | 150d survived, 200, wave 5 | identical |
| 105708 | 106d village-lost, 190, wave 4 | identical |

### 4.1 The populations

| Population | ctl n | arm n | arm wins | arm win share | arm kill share |
|---|---|---|---|---|---|
| Trio+ (size ≥ 3, present, engaged) | 6 | 6 | 0 | 0.000 | 0.000 |
| Pair-inclusive (size ≥ 2, present, engaged) | 27 | 27 | 2 | 0.074 | 0.037 |

Funnel (both legs, identical): 82 launched expedition meetings →
5 no launch plan → 62 pair launches (trio cut) / 0 below pair →
9 party-absent → 41 evades excluded → 27 pair-inclusive engaged
(6 trio+). The 41 evades are the same meetings on both legs — the
population is the sense substrate's, unchanged by the staging
because it never staged.

### 4.2 The damage race — unchanged

Damage per outcome, pair-inclusive (both legs identical):

| Outcome | n | dmg/round (mDealt/rounds) | rounds (mean) | monster HP (mean) |
|---|---|---|---|---|
| vKill | 1 | 105.9 | 10 | — (recorder gap, see §11) |
| vFlee | 23 | 41.4 | 6.3 | ~1100 |
| vDie | 2 | 43.1 | 6.5 | ~1100 |
| mFlee (talk-down) | 1 | 0.0 | 1 | — |

Same ladder as the fightcap bands: typical parties deal ~40–60/
round and flee after ~6 rounds having dealt ~15–20% of monster HP;
the winning shape needs ~111/round. Nothing moved, because nothing
staged.

### 4.3 Losses by monster (both legs identical)

reunion 0–4, congregation 1–3, algorithm 0–3, eulogy 0–3, audit
0–2, eater 0–2, influencer 0–2, strike 0–1, editor 0–1,
cancellation 0–1, suburb 0–1. Broad, not one monster. The gate
never held back a loser (loss gate: null 25, avoid 0, seek 0) — same
as the fightcap bands; the gate still measures size+gear, never
damage.

## 5. Why the staging never staged — three empty sources (the finding)

**Staging ran 400 times on the arm leg and staged zero bows.**
`v.bowOpen` counters, arm leg (ctl: all zero — flag off writes
nothing, by design): alreadyHad 237, noSource 163, fromStash 0,
fromArmory 0, crafted 0, craftedFail 0; 56 distinct villagers
staged-or-checked. Per seed the shape holds (e.g. 105703:
alreadyHad 81 / noSource 43; 105706: 55 / 62). Seed 105702 staged
nothing at all — the village died at day 34 before any departure.

**Source 1 — own stash / armory: villages hold no spare bows.**
Across 400 departures, not one stashed bow and not one deposited
armory bow was available to stage. The bows that exist in the world
are HELD, not stored: 14 of the 27 engaged meetings have the fighter
holding a real ranged weapon (crossbow 4, sling 3, phase_sling 3,
starfall_bow 1, searcaster 1, bow 2) — all of it personal gear
(loot, starting gear, home crafts), none of it reachable at the
departure site. GearUp's armory borrow takes the best weapon by
bonus (usually melee), so even a deposited bow would rarely be the
pick — but the counters say there was never one to pick.

**Source 2 — the craft leg: no departing villager knows a bow
recipe.** `v.weaponCraft` is written in exactly two places in the
codebase: `villager-build.js:1306` (the home duty
`villagerWeaponCraftDay`, which seeds L1 only when the villager has
HANDLED the weapon — and only serves WEAPONLESS villagers) and
`game.js:7893` (this arm's own record initialization — it never
seeds a level). A melee-armed villager never handles a bow, so they
never learn one, so the departure craft can never fire for them —
crafted 0, craftedFail 0 across 400 departures. The knowledge gate
that makes the home duty honest also makes the departure craft
unreachable. Materials were never even reached as a question.

**Source 3 — the "alreadyHad" blind spot: a spear counts as a
ranged weapon.** Of the 27 engaged meetings, 6 fighters hold a
SPEAR in the ranged slot (hunting_spear 3, fire_hardened_spear 3)
and 7 hold NOTHING. The staging no-ops on the spear-holders
(`rangedWeaponOf` returns the ranged-slot entry), but a spear
carries no `weapon.ammo` — the volley block requires ammo, so no
volley ever fires for them. Only 9 of 27 meetings volleyed at all
(share 0.33, mean volley damage 29.3 — exactly the prereg's honest
expectation of ~25–35, and identical on both legs because those 9
are the pre-existing bow/sling holders). The volley-capable
population is 14/27; the other 13/27 (6 spears + 7 none) open with
no volley, and the staging as built cannot reach any of them: the
spear-holders are "alreadyHad", the none-holders are "noSource".

**The next arm's hook (frozen here, for the coordinator):** the
staging gate must ask for a VOLLEY-CAPABLE ranged weapon
(`weapon.ammo != null`), not merely a ranged-slot entry — a spear
in the ranged slot is not a bow — AND the bow source must exist at
departure: either the home duty extends to melee-armed villagers
(bow knowledge for the bowless, not only the weaponless), or the
departure craft seeds L1 the way handling does (carrying the
recipe's materials + seeing a bow is not the same as handling one —
the knowledge rule needs a design call, not a quiet bypass). Either
way, a staging-only arm without a source arm will measure the same
null. Do NOT land another departure-only tweak for this question.

**Secondary observation (from the one kill):** the band's only kill
needs no volley at all. Francisco (105705 d76) holds a SEARCASTER
(bonus 120, range 8, ammo fusion_cell) with ZERO ammo — volley 0
shots — and kills the Congregation in 10 rounds at 105.9
damage/round, because the fold-in (`wb = round((melee + 120)/2)`)
makes his ordinary strikes ~67, doubled to ~134–140 by real Rage.
The bow's bigger half is the fold-in, not the volley — and an
alien-tier ranged weapon proves it from the other direction. The
two vDie meetings show the volley's limit: Catalina's phase_sling
volley lands 73 and she still dies in 11 rounds; the bow volley
(31 damage) precedes a 2-round death.

## 6. §15 balanced panel — review_required (zero deltas)

`scripts/build-bowopen-panels-a.js` + `node
scripts/balance-panel.js compare`. Decision: **review_required**.
8 paired cases; screen only. Every paired delta is exactly 0 (the
legs are identical): national 0 → 0, table win rate 0 → 0, village
deaths per run 82 → 82, community loss 0.625 → 0.625, all
`no_material_signal`. The `review_required` is the screen's default
on a zero-delta panel, not a signal. The panel is the instrument,
the frozen bars (§2) are the judge. Panel files:
`bowopen-a-panel-before.json.gz`, `bowopen-a-panel-after.json.gz`,
`bowopen-a-panel.json`, `bowopen-a-panel.md`.

## 7. Reachability verdict / wall numbers

Wave-4 meetings happen (82 launched meetings/leg); wave-5 unlocks
3/8 both legs; **national 0/8 both legs; table not instrumented
(null, never faked); wins 0/8 both legs.** Median survival 120.5d
both legs. The standing-199 stall persists (105701: 199, lost;
105703: 199, survived). The scale-onramp axis is still blocked
above regional. What this run adds: the ranged-opening question is
still OPEN — the opening was never staged in the engine where these
fights happen, because there was nothing to stage with.

## 8. Village assessment (plain words)

When a party sets out to hunt a wave-4 monster, the party that sets
out is still the party that meets it, and the fight still goes the
same way: about forty points of damage a round against twelve
hundred hit points, and the party gives up after six rounds. This
run was supposed to test whether sending every party out with a bow
turns those fights into wins. It didn't test that at all, because
the village had no bows to send them with.

The staging looked in three places and found nothing in all three.
The villagers' own stashes held no bows. The communal armory held
no bows. And nobody setting out knew how to make one — the village
only teaches bow-making to people with no weapon at all, and the
people going out to hunt already carry a spear or a blade, so they
never learn. Six of the fighters carry a spear where a bow should
go, and the staging counts that as "already has a ranged weapon" —
but a spear has no arrows, so the opening volley never fires for
them either. Seven more carry nothing ranged at all.

The one party that did win shows what the bow is really for. Their
fighter carried an alien searcaster with no ammunition — the bow
opening never fired once — and still killed the monster, because
carrying that weapon made every ordinary strike hit twice as hard.
The bow's real gift is not the few arrows at the start. It is that
holding one makes every blow after it hit harder. But the village
cannot give its hunters that gift, because it has no bows to give
and no one who knows how to make them.

## 9. Sense testing (what the player would see)

Read in full from the arm leg (identical on ctl): the 1 kill, 2
deaths, 1 long flee, 1 talk-down.

- **105705 d76 Francisco vs The Congregation (vKill, 10 rounds):**
  *"Francisco has Searcaster but no arrows — the string stays drawn,
  useless."* — then *"Francisco's eyes go red. Next 3 strikes hit
  twice as hard. (Rage)"* and 134–140-point strikes, *"Francisco is
  losing — shouts for help! Catalina charges in!"* / *"…shouts
  again! Elijah charges in!"* The kill reads like a fight the
  village wins by grinding with an alien weapon and real battle-fury,
  not by a trick. (The "no arrows" line misnames the ammo — a
  searcaster takes fusion cells, not arrows; see §10.)
- **105705 d82 Catalina vs The Eulogy (vDie, 11 rounds):** the
  volley as the fiction promises it — *"Catalina sees The Eulogy
  coming and nocks an arrow — the fight opens at range (4 shots)."*
  Three arrows land (23/26/24), then steady 31–35-point strikes,
  *"Catalina is losing — shouts for help! Dany charges in!"* /
  *"…shouts again! Elijah charges in!"* She dies with the monster
  still standing. Nothing robotic; the log truncates at round 4 of
  11 (the 20-line cap), so the death itself is never in the log.
- **105703 d109 Lena vs The Influencer (vFlee, 11 rounds):** Lena
  holds a STARFALL BOW (bonus 50) but no arrows — *"the string
  stays drawn, useless"* — yet still strikes for 36–37 (the
  fold-in from the starfall bow is doing the work), works the
  monster's trick (*"Lena ignores the ring light and hunts the
  followers — a phone clatters, a fan-creature drops."*), binds a
  wound mid-fight (*"field medicine, +20 HP"*), and flees at 241
  damage dealt. A person fighting smart with an empty quiver. The
  arrows she never got are pocketAmmo's domain (one blind craft
  attempt at departure), not this arm's staging — flagged in §10.
- **105707 d45 Adaeze vs The Audit (mFlee, 1 round):**
  *"Adaeze walks in open-handed, talking — low, steady, unafraid.
  And impossibly, it listens. It stands down. (Peacemaker: Walk
  In)"* — a real ability-driven non-violent resolution, correctly
  voiced. It is a win by the metric, not a fight win; the evidence
  never counts it as one (§4.2 separates kills from talk-downs).

No new player-facing text was added by this arm's staging (it never
fired). The transcripts read like people throughout — shouts,
charges, medicine, misses, trick-work.

## 10. Findings filed / updated (for the coordinator to file — this arm does not edit sim-findings.md)

- **#2544 (fight capability: damage output) — REFINED, still OPEN.**
  The ranged opening was never tested: the staging found no bow to
  stage in 400 departures. The binding question is unchanged in
  direction but the mechanism moved again: the gate must demand a
  VOLLEY-CAPABLE ranged weapon (ammo-bearing), not a ranged-slot
  entry, AND a bow source must exist at departure (home-duty
  knowledge for the bowless-but-armed, or a departure craft that
  can seed). Next arm: fix the gate + the source together and
  re-measure kill share on the same frozen bars; detect staging
  from the `v.bowOpen` counters + the encounter row's volley, as
  this arm does. Do NOT land another departure-only staging tweak.
- **NEW — spear-in-ranged-slot blinds the staging gate.** A spear
  (melee type, range 2) sits in the ranged slot when its carrier
  holds no real ranged weapon, so `rangedWeaponOf` returns it and
  every ranged check (staging, pocketAmmo's "has a ranged weapon")
  treats the fighter as ranged — but the volley needs ammo, which
  a spear never has. 6/27 engaged meetings open with a spear and no
  volley. Any ranged-gated mechanism must check `weapon.ammo`,
  not the slot.
- **NEW — bow knowledge is unreachable for the armed.** The only
  seeder of `v.weaponCraft` is the home duty, which serves the
  weaponless only. A melee-armed villager can never learn a bow
  recipe, so no departure craft can ever fire for them. This is a
  knowledge-design question (Steve-call if the fix seeds knowledge
  at departure), not a tuning knob.
- **NEW — villages hold no spare bows.** 0 stashed bows, 0 armory
  bows across 400 departures on 8 seeds. Bows are held personal
  gear, never stored. Any arm that stages bows from stock is
  staging from an empty shelf — the source must be crafting (see
  above) or loot, not the pile.
- **NEW — the "no arrows" line misnames non-arrow ammo.**
  Field-fight narration says "has Searcaster but no arrows" when
  the weapon takes fusion cells (105705 d76), and the same generic
  line covers crossbows (bolts) and slings (stones). The line is
  honest about the volley not firing but names the wrong consumable
  — a one-line narration fix in fieldFights.js, not a lever.
- **NEW — a starfall bow with an empty quiver.** Lena (105703 d109)
  carries a bonus-50 starfall bow and meets a wave-4 monster with
  zero arrows; pocketAmmo's single blind departure craft (35%)
  evidently failed or never ran with materials. The arrow-supply
  side of the opening is a separate, live gap from the bow-staging
  side — worth its own measurement, not folded into this verdict.
- **#2538 — unchanged.** The arrival price question is untouched
  by this arm (identical legs, no cost movement).

## 11. Blanks, limits, and things not done

- **The stageBow commit (2b29076e7) should NOT land as a live
  change on its own.** It is env-gated off by default and changes
  nothing in the measured population, but landing it would put a
  never-firing staging path on master. Recommendation: the
  coordinator lands tooling + evidence only (like the fightcap-a
  cherry-picks) and HOLDS the stageBow commit for the gate+source
  port arm, which reuses the mechanism + proof test; revert it
  instead if the coordinator prefers a clean tree. The SUBSTRATE
  commit (255682942, sense fix) is likewise HELD, never to land
  from this arm.
- **No 12–16 seed confirm** — gated off by the NO-GO (see §2).
- **No check.js run** (the round addendum owns the merged-master
  check; this arm ran the targeted suites instead: proof 36/36,
  analyzer selftest 33/33, panel builder clean).
- **Table sittings not instrumented** by this driver — reported as
  null, never faked. The panel shows table-entry/sitting rates as
  `not_observed`.
- **Encounter logs cap at ~20 lines** — fights longer than ~4
  rounds are truncated; all damage-rate claims use mDealt/rounds,
  never parsed totals.
- **mHpStart is null on the vKill meeting** (recorder gap, known
  from fightcap-a) — the kill damage share is uncomputed (mDealt
  1059 stands alone). The vKill damage/round (105.9) uses
  mDealt/rounds, which is unaffected.
- **bowOpenByVid item ids are not exported in the corpus** — the
  per-seed files carry the counters + staged-vid count only, so
  the alreadyHad breakdown (spear vs real bow) is read from the
  encounter rows' rangedId, not from the staging telemetry. A
  future driver should export the by-vid item ids.
- **Telemetry deviation check:** `node scripts/telemetry-check.js
  --baseline …/telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-19/perseed-bowopen-a-arm/*.json' --metrics
  national,table,wins,exiled` — REFUSED recorder-corpus input (all
  8 rows carry top-level anchorCommit; exit 0 with the refusal
  message) — same documented refusal as the 1415Z/1515Z runs.
  Recorder corpora are compared with sweep-compare tables, never
  against a run baseline here. Baseline NOT rolled.

## 12. Metric review

- The frozen bars judged as written; the NO-GO stands and is not
  re-scored. The pair-inclusive primary performed as designed
  (pool floor met at n=27/arm) — the trio+ floor would have failed
  again (n=6), confirming the fightcap metric review.
- The mechanism check (volley fired ≥ 0.50) did its job: it fired
  at 0.33 identically on both legs, which is exactly how the null
  was caught — the staging telemetry (alreadyHad 237 / noSource
  163 / staged 0) names the cause. The check stays as written for
  the next arm.
- The kill-share (≥ 0.25) and damage/round (≥ 70) bars were the
  right bars for the question as staged; they now apply unchanged
  to the gate+source arm. No metric is re-scored here.
- One instrumentation gap to fix before the next arm: export
  `bowOpenByVid` (item ids) in the corpus, so the staging source
  breakdown does not have to be reconstructed from encounter rows.

## 13. Files

- Prereg: `evidence/2026-11-19/sim-bowopen-a-prereg.md`
- This evidence: `evidence/2026-11-19/sim-bowopen-a.md`
- Analysis: `evidence/2026-11-19/bowopen-a-analysis.json`
- Corpora: `evidence/2026-11-19/perseed-bowopen-a-ctl/` (8 files),
  `evidence/2026-11-19/perseed-bowopen-a-arm/` (8 files)
- Pilot logs: `evidence/2026-11-19/bowopen-a-{ctl,arm}.log/.err`
- Panel: `evidence/2026-11-19/bowopen-a-panel-{before,after}.json.gz`,
  `bowopen-a-panel.json`, `bowopen-a-panel.md`
- Analyzer: `scripts/analyze-bowopen-a.js` (selftest 33/33)
- Driver: `scripts/bowopen-driver-a.js`
- Panel builder: `scripts/build-bowopen-panels-a.js`
- Code under judgement: `src/js/game.js` (`villagerStageBow`),
  `src/js/villager-agency.js` (`startExpedition` call site)
- Substrate (HELD, never to land from this arm): `src/js/party-wiring.js`
  (sense fix), `src/js/villager-brain.js` (partyTrios counter)
- Tests: `scripts/test-bowopen-a.js` (36/36)
