# sim-arrowsupply-a — evidence

Run fleshout-20261119T1215Z, Loop A (axis scale-onramp). Branch
`sim-arrowsupply-a`, base master ebea87dfb. Worktree
`~/workspace/worktrees/sim-arrowsupply-a`. Prereg:
`evidence/2026-11-19/sim-arrowsupply-a-prereg.md` (frozen 2026-11-19
~07:05 UTC, before any new sim; one amendment ~07:35 UTC, also
before any judged sim — see §11). Substrate: the LIVE master
substrate SENSEEXPED (landed 97e78670d, finding #2583) — NOT the
bowopen LAUNCHPARTY substrate, which is not on this base (see the
prereg amendment). Analyzer: `scripts/analyze-arrowsupply-a.js`
(selftest 28/28). Analysis:
`evidence/2026-11-19/arrowsupply-a-analysis.json`. Proof test:
`scripts/test-arrowsupply-a.js` (52/52).

## 1. The question

**Finding #2594.** Lena (105703 d109) carries a bonus-50 starfall
bow and meets a wave-4 monster with ZERO arrows; pocketAmmo's
single blind departure craft (35%) evidently failed or never ran
with materials. She still strikes 36–37 (the fold-in) and flees at
241 damage dealt. The arrow-supply side of the ranged opening is a
separate, live gap from the bow-staging side — worth its own
measurement. This DIAG quantifies it: how often departing archers
leave with zero matching ammo, why, where ammo comes from, and what
the lost opening volley costs in the fight.

## 2. Verdict — DIAG-NO-GO (thin pools; the question is half-answered, and the half that answered points elsewhere)

| Bar | Result | Requirement | Outcome |
|---|---|---|---|
| Departure pool (ammo-bearing-archer departures) | 31 | ≥ 50 | **FAIL** |
| Decisive answer | zero-ammo 1/31 (rate 0.032); single reason craft-failed 100% (n=1) | one reason ≥ 50% OR rate ≤ 0.10 | **PASS** (via the rare-rate path) |
| Encounter read (pair-inclusive engaged meetings with an ammo-bearing fighter) | 0 (armed 0, zero-ammo 0) | ≥ 8 | **FAIL** |
| Instrument: craft seen | departure attempts 3 (ok 1), home-duty attempts 92 (ok 44), tele ammo_craft 95 | > 0 | PASS (cross-check, not a verdict bar) |

The NO-GO is frozen and stands; it is NOT re-scored. What it
means, precisely: the departure pool is thin (31, not 50), and the
encounter read has no population at all (0 meetings with an
ammo-bearing fighter). But the diag is not empty — the two failures
are themselves findings (§5, §10). The departure that does exist
says departing archers are almost never zero-ammo (1/31), and the
encounter failure says the launched-party fighter is never an
archer on this band, so there is no volley-loss cost to measure in
the launched-party population. **No 12-seed confirm** — the prereg
gates the confirm on the pilot passing, and it did not.

## 3. The mechanism (what was measured, frozen from code read)

Two craft beats write the SHARED `v.ammoCraft` record (blind 35%,
learned 85%; a blind success teaches; a failed craft spends the
materials):

1. **Departure — `villagerPocketAmmo`** (game.js:8025, from
   `startExpedition` and `resolvePatrol`): own stash first, then
   the communal pile (stones taken directly; arrows/bolts are NEVER
   taken from the pile — there is no pile arrow stock, only a
   craft), then ONE craft attempt per departure for arrow/bolt from
   PILE materials only. Cap: stones to 6, crafted ammo to one batch
   (5); the cap gates the ATTEMPT, not the batch. Fusion cells have
   no recipe and no pile source — the searcaster can never be
   pocketed for. Spears carry no `weapon.ammo` — pocketAmmo returns
   immediately.
2. **Home — `villagerAmmoCraftDay`** (villager-build.js,
   build-arrow-make 2026-11-01 Arm 5): a bow/crossbow carrier AT
   HOME with <5 ammo crafts one batch from own carried materials
   first, then the pile; at most 1 attempt per villager per 3 days.

The driver wraps both beats with pre/post reads (ranged weapon,
ammo id, carried/stash/pile counts, the `out` return), wraps
`villagerKillLoot` for ammo/ranged drops and `Game.craft` for
player arrow/bolt crafts, and takes a daily ammo census (every
living roster villager's ranged kit + carried/stashed ammo;
communal pile recipe materials) plus a day-0 baseline. Failure
reasons are classified from the pre/post reads, never guessed.
Tele cross-check: VF `teleCounts['ammo_craft']` = 95, exactly the
wrap attempt total (departure 3 + home-duty 92) — the instrument
agrees with itself.

## 4. Fresh pilot — before / after on identical seeds (8 seeds, 107021–107028)

Single leg (DIAG, no lever). Pilot logs:
`arrowsupply-a-sweep2.log/.err` (exit 0, 0 instrument errors, 0
stderr lines; the first sweep's logs are `arrowsupply-a-smoke.log`
+ `arrowsupply-a-sweep.log` — superseded by the instrument repair,
see §11). Corpus flags verified per file: `senseexpedOn` true,
`bowopenOn` false, `gameSha` d249628bf937, `wiringSha`
07f60700a747, `anchorCommit` ebea87dfb6f6. Determinism: the re-run
reproduced all 8 seeds bit-identically on days / endReason /
standing / wave / deaths / v4encounters / ammoDeparts / ammoCensus
(checked against the first run's logs before the files were
replaced).

| Seed | days / standing / wave | end |
|---|---|---|
| 107021 | 137d, 199, wave 4 | village-lost |
| 107022 | 104d, 150, wave 4 | village-lost |
| 107023 | 150d, 290, wave 5 | survived |
| 107024 | 150d, 199, wave 4 | survived |
| 107025 | 104d, 199, wave 4 | village-lost |
| 107026 | 150d, 199, wave 4 | survived |
| 107027 | 150d, 365, wave 5 | survived |
| 107028 | 85d, 199, wave 4 | village-lost |

Per-seed extremes worth naming: 107024 has ZERO archer
departures but 427 home-duty rows (bow carriers at home every day
who never depart); 107027 has 64 archer departures but ZERO
home-duty rows (its archers are all sling carriers — the home duty
serves arrow/bolt only). The two seeds are opposite supply shapes
of the same system.

## 5. The numbers

### (a) Departures — archers leave armed; spear-holders dominate the "ranged" departure

129 ranged-holder departures: **31 ammo-bearing (24%), 98 spear
(76%)**. The spear is the modal "ranged" departure and can never
volley (#2591, again).

| Weapon | departures | zero-ammo |
|---|---|---|
| sling | 16 | 0 |
| phase_sling | 6 | 0 |
| bow | 4 | 0 |
| crude_bow | 4 | 1 |
| crossbow | 1 | 0 |
| starfall_bow / apex_bow / searcaster | 0 | — |

**Zero-ammo departures: 1/31 (3.2%).** The one: Aki Tanaka,
107028 d83, crude_bow, blind departure craft failed with
materials present (`craft-failed`). No wave-4 plan holder departed
holding an ammo-bearing ranged weapon in 8 seeds (5 plan
departures carried spears; 0 carried an ammo-bearing weapon).

By outcome (31 ammo-bearing departures): already-full 15,
pile-stone 13, craft-ok 1, already-had 1, craft-failed 1.
**Stash-pocketed units: 0** — no departure ever drew arrows or
bolts from a personal stash; stashed ammo does not exist in
practice. Pile stones pocketed: 55 units.

### (b) The two craft beats — the home duty does the work; the departure craft is vestigial

**Departure craft: 3 attempts in 8 seeds** (1 ok, 2 failed — one
failure still left arrows in the pack, `already-had`). The
departure craft almost never runs because departing archers are
usually already stocked (15 already-full) or slings (13 pile
stones). It is not the supply — it is a backstop that fires ~once
per 43 departures.

**Home duty: 1,232 rows, 92 attempts, 44 successes (48%)** —
consistent with the 35% blind / 85% learned mix. By weapon:
bow 45 att / 21 ok, crossbow 19 / 11, crude_bow 16 / 7,
starfall_bow 12 / 5. Non-attempt reasons: already-stocked 717,
away 310, cooldown 86, no-materials 24, not-attempted-unknown 3
(0.2% — residual instrument noise, named in §11). The home duty
is the supply: **44 batches = 220 arrows/bolts** over the band,
against the departure craft's 1 batch (5).

**Why failures happen:** the only zero-ammo departure is a blind
35% roll lost (materials present, attempt ran). No-materials never
produced a zero-ammo departure; the pile is not scarce on average
(means: stick 94.7, stone 306.7, fiber 22.4, vine 1.3, wood 20.2,
branch 38.6) — the 24 home-duty no-materials rows are
village-days when the pile was locally short, not a systemic
shortage.

### (c) Acquisition by source + stock over time — bows stay stocked, slings live empty, searcasters never eat

| Source | batches / events | units |
|---|---|---|
| Home-duty craft | 44 batches | 220 arrows/bolts |
| Departure craft | 1 batch | 5 arrows |
| Kill loot (ammo) | 0 | 0 |
| Kill loot (ranged) | 1 (phase_sling) | — |
| Player craft (arrow/bolt) | 0 | 0 |
| Starting stock (day 0) | 11 archers, ALL at zero | 0 |

Daily census (2,515 archer-days): **54.6% at zero ammo, mean
2.81 carried** — but the aggregate misleads; the weapon split is
the finding:

| Weapon | archer-days | zero share | mean ammo |
|---|---|---|---|
| sling | 1,017 | 0.935 | 0.33 |
| phase_sling | 194 | 0.820 | 0.93 |
| crude_bow | 103 | 0.243 | 4.46 |
| bow | 672 | 0.121 | 5.67 |
| crossbow | 280 | 0.121 | 5.45 |
| starfall_bow | 152 | 0.164 | 4.93 |
| searcaster | 97 | **1.000** | **0.00** |

Bow-family carriers are stocked ~85% of days (the home duty
works). Sling carriers hold ~0 stones on 93.5% of days — they are
armed only in the departure moment (pile stones at the door) and
empty the rest of the time; what drains carried stones between
departures is NOT established by this instrument (volley spend and
weapon-craft consumption are both candidates — a named unknown,
§10). **The searcaster never has a cell: one holder (chen_wei)
for 97 census-days, 0 fusion cells on every single one, 0
acquisition events of any kind.** Fusion cells have no source in
the game as measured — an alien-tier ranged weapon that can never
volley. Zero share by day bucket: d0–30 0.698, d31–60 0.451,
d61–100 0.482, d101+ 0.568 — no late-game improvement.

### (d) Volley-loss cost — UNPOWERED (no population)

Pair-inclusive engaged meetings: **9** (vFlee 7, vDie 2, vKill 0,
mFlee 0; damage/round 28.1). Fighter's ranged kit: spear 3,
nothing 6 — **0 ammo-bearing fighters, so the armed-vs-zero
split has no rows on either side**. Volley fired: **0/9**. Trio+
population: 0 meetings. Across ALL 32 expedition wave-4+
meetings: ranged kit is hunting_spear 8, none 18, sling 1,
phase_sling 1, fire_hardened_spear 4; ammo>0 in 2 — and **both
armed meetings EVADED** (rounds 0, volley null). No volley fired
from an armed archer in any wave-4+ expedition meeting on this
band. The cost question cannot be answered from launched-party
fights because the launched-party fighter never holds an
ammo-bearing ranged weapon — that absence is the finding, not a
gap in the instrument (0 instrument errors; the funnel is fully
accounted: 32 encounters → 32 joined → 2 no-launch-plan → 0
pair-cut → 6 party-absent → 15 evades → 9 engaged).

## 6. §15 balanced panel — review_required (zero deltas, by construction)

`scripts/build-arrowsupply-panels-a.js` + `node
scripts/balance-panel.js compare`. Decision:
**review_required** (compare exit code 2 is the tool's
review_required code, not an error — `balance-panel.js:357` sets
exit 2 for any decision other than `no_material_signal`). 8 paired
cases; screen only. Every paired delta is exactly 0 (before==after
is the same corpus — a DIAG carries no lever to compare):
national 0 → 0, table win rate 0 → 0, village deaths per run
76.625 → 76.625, community loss 0.5 → 0.5, all
`no_material_signal`. The panel is the instrument, the frozen bars
(§2) are the judge. Panel files:
`arrowsupply-a-panel-before.json.gz`,
`arrowsupply-a-panel-after.json.gz`, `arrowsupply-a-panel.json`,
`arrowsupply-a-panel.md`.

## 7. Reachability verdict / wall numbers

Wave-4 meetings happen (85 v4encounters: 32 expedition, 29
world-tick, 24 aid); wave-5 unlocks 2/8; **national 0/8; table
not instrumented (null, never faked); wins 0/8.** Median survival
143.5d. Community lost 4/8. The standing-199 stall persists
(107021, 107024, 107025, 107026, 107028 all end at 199). The
scale-onramp axis is still blocked above regional. What this run
adds: the ranged opening's supply side is not the wall — departing
archers are armed, and the launched-party fighter never carries
the bow in the first place.

## 8. Village assessment (plain words)

When a hunter sets out with a bow, they almost always set out
with arrows — thirty times out of thirty-one. The village does
not arm them at the door. It arms them at home, days before: the
workbench duty quietly makes batch after batch, forty-four of
them across eight villages, while the departure craft — the one
everyone blamed for Lena's empty quiver — fired exactly three
times. Lena's case is real but rare: one blind craft, one bad
roll, one empty quiver. The departure is not where the gap lives.

The gap lives in two other places. The first is the searcaster: a
villager carries the strongest ranged weapon in the game for
ninety-seven days and never once holds the cell that fires it,
because nothing in the world makes or gives fusion cells. The
second is the sling: sling carriers walk around with no stones
nineteen days out of twenty, armed only in the moment they leave
the door. And the third thing is not a gap in supply at all — it
is that the people who walk out to hunt wave-4 monsters never
carry a bow. Three of the nine launched-party fighters carry a
spear where a bow should go, and six carry nothing ranged at all.
The volley never fires in those fights because there is no
archer in them to fire it. The question this run was asked — what
does a lost volley cost? — has no answer in launched-party
fights, because the archer is never there to lose it.

## 9. Sense testing (what the player would see)

Read in full from the corpus: all 9 pair-inclusive meetings, the
2 armed expedition meetings, the zero-ammo departure.

- **107028 d83 Aki Tanaka (the one zero-ammo departure):** no
  narration marks it — a blind craft fails silently at the door
  (the failure is witnessed only if the player is at Haven; the
  departure craft has no say line). Aki departs with a crude bow
  and no arrows, and nothing in the log says so. The silence is
  honest to the code (pocketAmmo never narrates) but the player
  would not know.
- **107021 d134–135 Omar vs The Strike / The Audit:** the long
  flee reads like a fight (11 rounds, 243 dealt, "Omar's gear
  absorbs 28" throughout), then the next day he walks into The
  Audit and dies in one round — "Assessment hits Omar for 11 (0
  left)" after his gear absorbs 64. He entered the meeting already
  nearly dead. The same shape kills Wanjiru (107026 d36, "Gorge
  hits Wanjiru for 28 (0 left)"). Both 1-round deaths are
  fighters entering a meeting hurt, not the fight killing a healthy
  person — the log is honest about it, and it is a different
  question from this arm (not chased).
- **107027 Sam Wilson vs The Audit / The Influencer (twice):**
  "Sam walks in open-handed — and it goes wrong. It doesn't want
  peace. They're exposed, off-balance. (Walk In — failed)" — a
  real ability-driven non-violent attempt failing honestly, twice,
  with the exposed penalty carried into the fight. Nothing
  robotic; the parley, the failure, and the cost all read.
- **107027 d56 Stanley vs The Congregation:** "Stanley walks
  straight into The Congregation. No avoiding it." / "Stanley
  strikes for 18 (stalker's opening +4)" — a person walking into
  a fight they did not choose, with the opening bonus named.
- **The 2 armed meetings (107025 d50 sling, 107026 d42
  phase_sling):** both EVADE before any volley — "the string stays
  drawn, useless" never appears because the fight never starts.
  The armed archer's volley is lost to the evade, not to the
  quiver.

No new player-facing text was added by this arm (a DIAG adds no
game code). The transcripts read like people throughout — shouts,
failed parleys, gear absorbing blows, medicine unmentioned here
because no fight lasted long enough to need it.

## 10. Findings filed / updated (for the coordinator to file — this arm does not edit sim-findings.md)

- **#2594 (a starfall bow with an empty quiver) — ANSWERED,
  narrowed.** A bow-holder departing with zero arrows is RARE
  (1/31 departures; the one case is a blind departure craft
  failing with materials present). The home duty arms bow-holders
  first (stocked ~85% of days), so the departure craft is rarely
  the decider. Lena's case stands as the exemplar of the rare
  path, not the typical one. The arrow-supply side is NOT the
  binding gap for the ranged opening.
- **NEW — a searcaster that can never fire.** One holder
  (chen_wei) carries a searcaster 97 census-days with ZERO fusion
  cells on every one; 0 acquisition events of any kind (no recipe,
  no pile source, no loot, no player craft). An alien-tier ranged
  weapon whose volley can never fire. **Next arm (named precisely):
  sim-fusioncell-a** — DIAG first: quantify fusion-cell supply
  (holders, acquisition events, volley opportunities lost) on the
  same band shape; if the diag confirms zero supply, the fix arm
  adds a source (loot-table weight vs ruin salvage is a design
  call — cells are alien tech, so the source must be alien-side,
  not a village craft). Do NOT fold this into the bow/arrow work;
  it is a different supply chain.
- **NEW — slings live empty.** Sling carriers hold ~0 stones on
  93.5% of days (mean 0.33) and phase_slings on 82.0% (mean 0.93),
  yet depart armed (13 pile-stone top-ups). What drains carried
  stones between departures is unestablished (volley spend vs
  weapon-craft consumption are both candidates). **Second
  candidate arm: sim-slingstone-a** — DIAG tracing stone loss
  between departure top-up and the next census (carry the
  stone count across fights and crafts per villager).
- **NEW — the launched-party fighter is never an archer.**
  0/9 pair-inclusive engaged meetings have an ammo-bearing
  fighter; 0/32 expedition wave-4+ meetings have a bow/crossbow/
  starfall fighter at all. The volley-loss cost has no population
  in launched-party fights. The composition question belongs to
  the party/fightcap line (why plan holders and fighters are
  melee-only — gearUp picks by bonus, and the bow's fold-in bonus
  is not what seats the fighter).
- **NEW — the departure craft is vestigial.** 3 attempts in 8
  seeds; the home duty out-produces it 44 batches to 1. Any arm
  that tunes the departure craft rate is tuning a backstop. The
  lever, if one is wanted, is the home duty (attempt cadence,
  cooldown, materials) — named here, not built here (DIAG arm:
  no game-code fix lands).
- **#2593 (the "no arrows" line misnames non-arrow ammo) — NOT
  re-observed.** No "no arrows" line fires in this band's logs
  (no ranged fighter in any pair-inclusive meeting; both armed
  meetings evade before the volley). Still open from bowopen-a.
- **#2591 / #2592 — confirmed again.** Spear departures 98/129
  (76%); stashed ammo pocketed 0 units — villages hold no spare
  arrows in personal stashes, and the spear still blinds every
  ranged gate it touches.

## 11. Blanks, limits, and things not done

- **Prereg amendment (substrate), before any judged sim:** the
  as-frozen substrate (`LAUNCHPARTY=1`) is not on master
  ebea87dfb — the old sense fix was superseded by SENSEEXPED
  (landed 97e78670d) and `LAUNCHPARTY` appears nowhere in
  `src/js/`. The smoke run stopped at the substrate assert with
  no corpus written; the prereg was amended to the live master
  substrate (`SENSEEXPED=1 + PARTYSIZE4=1 + VETREENGAGE=1 +
  FLEEREPAIR2=1 + FIGHTALLY2=1`) and the driver ported to assert
  it. Bars, band, and horizon are untouched. A consequence to
  carry: the bowopen band (LAUNCHPARTY substrate) and this band
  (SENSEEXPED substrate) are NOT directly comparable populations
  — bowopen saw 82 launched meetings / 27 pair-inclusive; this
  band sees 32 / 9. Whether the funnel thinning is the substrate,
  the seeds, or both is unestablished here.
- **Instrument repair (home-duty reasons), after the first sweep:**
  the first sweep's home-duty rows carried 938
  `not-attempted-unknown` — the wrap had not mirrored the duty's
  own gates (away villagers; already-stocked carriers). The driver
  was fixed (`classifyHomeDutyRow`, pure + proof-tested 52/52),
  the corpus deleted, and all 8 seeds re-run. Determinism
  verified: all 8 seeds reproduce identically on days / endReason
  / standing / wave / deaths / v4encounters / ammoDeparts /
  ammoCensus — the repair changed labels only, never the game.
  Residual `not-attempted-unknown`: 3 rows (0.2%), reported as
  instrument noise. The verdict bars do not depend on home-duty
  reasons, so the repair is not a re-scoring.
- **No 12–16 seed confirm** — gated off by the NO-GO (see §2).
- **No check.js run** (the round addendum owns the merged-master
  check; this arm ran the targeted suites instead: proof 52/52,
  analyzer selftest 28/28, panel builder clean, telemetry-check
  refusal recorded).
- **Table sittings not instrumented** by this driver — reported as
  null, never faked. The panel shows table-entry/sitting rates as
  `not_observed`.
- **Encounter logs cap at ~20 lines** — fights longer than ~4
  rounds are truncated; all damage-rate claims use mDealt/rounds,
  never parsed totals.
- **The 1-round vDie meetings** (Omar 107021 d135, Wanjiru
  107026 d36) are fighters entering at near-zero HP — observed,
  not chased; the arrival-HP question belongs to another arm.
- **Telemetry deviation check:** `node scripts/telemetry-check.js
  --baseline …/telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-19/perseed-arrowsupply-a-diag/*.json' --metrics
  national,table,wins,exiled` — REFUSED recorder-corpus input (all
  8 rows carry top-level anchorCommit; exit 2 with the refusal
  message) — same documented refusal as the bowopen-a run.
  Recorder corpora are compared with sweep-compare tables, never
  against a run baseline here. Baseline NOT rolled.

## 12. Metric review

- The frozen bars judged as written; the DIAG-NO-GO stands and is
  not re-scored. The decisive-answer bar passed on the rare-rate
  path (1/31 = 0.032 ≤ 0.10) — but the "dominant reason 100%"
  beside it is vacuous at n=1 and is NOT claimed as a cause; the
  pass rides on rarity, and the evidence says so.
- **The pool floor was mis-sized.** It assumed bowopen's 400
  departures with ~1/4 archers; the archer share held (31/129 =
  24% of ranged-holder departures) but bowopen's 400 counted ALL
  departures while this wrap records ranged holders only. A
  future departure-pool floor should be sized on ranged-holder
  departures (~130/8 seeds), i.e. a ≥50 archer floor needs ~16
  seeds or a wider departure definition — proposed for the next
  run, not applied here.
- **The encounter floor measures the wrong population for this
  question.** The launched-party fighter is never an archer, so
  no band size fixes the ≥8 bar on the pair-inclusive population.
  A future volley-cost arm needs a different population (e.g. all
  expedition meetings with an archer present, or a staged
  fixture) — proposed for the next run, not applied here.
- The mechanism check (craft seen) did its job: departure 3 +
  home 92 = 95, exactly the tele count — the instrument is
  internally consistent, and the thinness is in the world, not
  the recorder.
- No metric is re-scored here. The DIAG-NO-GO is the verdict;
  the substantive answers (§5, §10) are the deliverable.

## 13. Files

- Prereg: `evidence/2026-11-19/sim-arrowsupply-a-prereg.md`
- This evidence: `evidence/2026-11-19/sim-arrowsupply-a.md`
- Analysis: `evidence/2026-11-19/arrowsupply-a-analysis.json`
- Corpora: `evidence/2026-11-19/perseed-arrowsupply-a-diag/` (8 files)
- Pilot logs: `evidence/2026-11-19/arrowsupply-a-sweep2.log/.err`
  (judged sweep); `arrowsupply-a-smoke.log`,
  `arrowsupply-a-sweep.log` (superseded first sweep — determinism
  record only)
- Panel: `evidence/2026-11-19/arrowsupply-a-panel-{before,after}.json.gz`,
  `arrowsupply-a-panel.json`, `arrowsupply-a-panel.md`
- Analyzer: `scripts/analyze-arrowsupply-a.js` (selftest 28/28)
- Driver: `scripts/arrowsupply-driver-a.js`
- Panel builder: `scripts/build-arrowsupply-panels-a.js`
- Tests: `scripts/test-arrowsupply-a.js` (52/52)
- Telemetry check: `evidence/2026-11-19/arrowsupply-a-telemetry.log`
  (refusal, baseline not rolled)
- Code under judgement: none (DIAG — no game-code change).
  Instrument reads `src/js/game.js` (`villagerPocketAmmo`),
  `src/js/villager-build.js` (`villagerAmmoCraftDay`),
  `src/js/villager-agency.js` (`startExpedition`),
  `src/js/fieldFights.js` (volley + strike fold-in).
