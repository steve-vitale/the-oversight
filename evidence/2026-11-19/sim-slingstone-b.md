# sim-slingstone-b — evidence

Run fleshout-20261119T1815Z, Loop A (axis scale-onramp). Branch
`sim-slingstone-b`, base master 16975bb01
(sim-partysurvive-rerun-b; rebased from the registration base
7e0810eea before any judged sim — see §11). Worktree
`~/workspace/worktrees/sim-slingstone-b`.
Prereg: `evidence/2026-11-19/sim-slingstone-b-prereg.md` (frozen
2026-11-19 ~20:40 UTC, before any judged sim). Substrate: the LIVE
master substrate SENSEEXPED — NOT the bowopen LAUNCHPARTY substrate,
which is not on this base. Analyzer: `scripts/analyze-slingstone-b.js`
(selftest 58/58). Analysis:
`evidence/2026-11-19/slingstone-b-analysis.json`. Proof test:
`scripts/test-slingstone-b.js` (49/49).

## 1. The question

**Finding #2608 / #2609.** Slingstone-a answered finding #2600
(the drain is the volley, 47 of 60 stones, 78.3%) but froze
DIAG-NO-GO on two bars: completeness 0.783 < 0.90 and drain pool
18 < 25. Its §5d decomposed the residual exactly: 9 stones of
same-day ordering artifact (the daily census fires mid-day while
fights stamped the same game day can fire after the snapshot, so
a spend lands in the wrong interval) and 4 stones of a
same-day-death analyzer edge (death day == last census day was
missed by a `>` lookup). This arm re-runs the SAME band with the
census-epoch instrument (stamp every fight/departure/duty row
with the last census day seen) and the #2609 window fix (the
analyzer joins day-stamped events to censuses with
[prevRowDay, rowDay], epoch-first), and judges on the SAME frozen
bars as slingstone-a.

## 2. Verdict — DIAG-NO-GO (the instrument is repaired; the drain pool is not)

| Bar | Result | Requirement | Outcome |
|---|---|---|---|
| Delta-attribution completeness | 1.000 | ≥ 0.90 | **PASS** |
| Departure pool (stone-carrying sling departures) | 22 | ≥ 15 | **PASS** |
| Drain pool (intervals with a positive net drain) | 18 | ≥ 25 | **FAIL** |
| Drain split quantified | volley 0.959, craft 0.000, gear 0.000, death 0.041, residual 0.000; duty wraps live (1,065 calls each) | volley + craft shares measured, residual stated | **PASS** |
| Instrument: volley cross-check | 0 violations in 120 sling fights | 0 | PASS (cross-check, not a verdict bar) |

The NO-GO is carried by the drain pool alone, exactly as the
prereg expected. What it means, precisely: the ledger now closes
exactly — 49 drained stones, every one attributed (47 volley,
2 death-carried, 0 residual, 0 unexplained gains), the
completeness bar repaired from 0.783 to 1.000 — but only 18
census-intervals ever drain, below the 25 floor. The split is
measured, the majority cause is named (volley 95.9%), the craft
candidate is zero for the second time running, and the death
share is now measured instead of missed. **No 12-seed confirm**
— the prereg gates the confirm on the pilot passing, and it did
not. The slingstone-a verdict (DIAG-NO-GO) stands frozen and is
NOT re-scored here; this is a new corpus judged on the same
bars.

## 3. The mechanism (what was measured, frozen from code read)

Unchanged from slingstone-a: one stone is one unit of sling
ammo, taken from the communal pile at departure (cap 6,
`villagerPocketAmmo`, game.js:8025 — it never removes stones).
Each volley shot costs 1 stone from the lead fighter's own pack
(fieldFights.js volley block; max 4 shots per fight; allies
never volley; an evade can precede the volley, leaving it
null). `villagerWeaponCraftDay` serves WEAPONLESS villagers only
and takes from the crafter's OWN pack; `villagerAmmoCraftDay`
continues unless the ammo id is `arrow` or `bolt`; armor recipes
are bark/hide only; `villagerGearDay` moves weapons/armor, never
materials; stones die with the holder (measured via the
`registerDeath` pre-read). The b-delta is instrument-only: the
driver keeps the day of the last census snapshot taken and
stamps `censusEpoch` on every stone-ledger row
(`stoneFights`, `ammoDeparts`, `stoneDutyTakes`, `stoneLoot`,
`stoneDeaths`); the analyzer joins an event to the interval
whose opening census day equals its epoch, falling back to the
#2609 closed-left day window [prevRowDay, rowDay] for epoch-less
rows only. On the judged corpus the fallback never fired:
**epochlessRows 0**. The instrument is pure reads + driver-local
writes; every game function runs exactly once, untouched — so
the instrument cannot move trajectories (see §4 for the
trajectory deltas, which come from the base move).

## 4. Fresh pilot — before / after on identical seeds (8 seeds, 107021–107028)

Single leg (DIAG, no lever). Pilot logs:
`slingstone-b-sweep.log/.err` (exit 0, 0 instrument errors, 0
stderr lines; ~11 min for 8 seeds). Corpus flags verified per
file: `senseexpedOn` true, `bowopenOn` false, `anchorCommit`
16975bb01 on all 8. The band is the SAME seed set as the
slingstone-a band, deliberately re-instrumented (see the prereg
— not claimed as fresh).

**Trajectories are NOT bit-identical to slingstone-a.** The base
moved (de9bb3c22 → 16975bb01) and carries landed game-code
changes, including the bowcraft fix for finding #2597
(ef1c81094: serve ranged-less villagers + seed bow knowledge
from seeing) and the journey-landing r148 changes
(moderator-mute guard + link-accept rotation, cf17e4dd6). Three
seeds moved; five reproduce exactly:

| Seed | a: days / standing / wave | b: days / standing / wave | end |
|---|---|---|---|
| 107021 | 137d, 199, wave 4 | 137d, 199, wave 4 | village-lost |
| 107022 | 104d, 150, wave 4 | 104d, 150, wave 4 | village-lost |
| 107023 | 150d, 290, wave 5 | 150d, 199, wave 4 | survived |
| 107024 | 150d, 199, wave 4 | 150d, 199, wave 4 | survived |
| 107025 | 104d, 199, wave 4 | **140d**, 199, wave 4 | village-lost |
| 107026 | 150d, 199, wave 4 | 150d, 199, wave 4 | survived |
| 107027 | 150d, 365, wave 5 | 150d, **515**, wave 5 | survived |
| 107028 | 85d, 199, wave 4 | 85d, 199, wave 4 | village-lost |

The ledger is self-contained per seed (inflows and outflows
recorded inside the same run), so a base drift cannot bias
attribution — and the headline ledger totals land exactly where
the a-sensitivity note predicted (D = 49, completeness 1.000,
volley 47, death 2). The departures (22) and stones pocketed
(55) are byte-identical to the a-band despite the drift, which
is the strongest sign the sling numbers are stable under the
base move: the moving seeds changed how long villages lived and
how far they climbed, not how slings are armed or spent.

## 5. The numbers

### (a) The ledger — the books close exactly

1,140 alive census-intervals across the band; total drain D = 49
stones; residual drain 0, unexplained gains 0.

| Category | Stones | Share of D |
|---|---|---|
| Volley (47 shots in 120 sling fights) | 47 | **0.959** |
| Weapon / ammo / armor craft takes | 0 | 0.000 |
| Gear / gift takes | 0 | 0.000 |
| Death-carried | 2 | 0.041 |
| Residual (unexplained drain) | 0 | 0.000 |
| **Total drain D** | **49** | 1.000 |

Inflows over the band: 55 stones pocketed at departure (22
departures), 0 loot gains, 0 duty gains. Unexplained gains: 0.

**The volley is the drain (95.9%).** The weapon-craft
candidate is dead for the second time running: the code excludes
sling carriers (armed → skipped; own-pack-only takes), and the
instrument watched 1,065 weapon-craft days, 1,065 ammo-craft
days, 1,065 armor-craft days and 1,065 gear days and recorded
ZERO stone takes on any of them. A craft lever cannot drain what
the craft never touches. The death share is now measured: 2
stones died with gen_xwziftr (§5d), 4.1% of D.

### (b) The volley in detail — most sling fights never reach it

120 sling-carrier fights (lead fighter), 47 shots, 49 volley-nulls
(41% — the fight evades before the volley block runs).

| Wave | Fights | Shots | Volley-null (evade) |
|---|---|---|---|
| 1 | 58 | 21 | 29 |
| 2 | 40 | 14 | 14 |
| 3 | 15 | 12 | 4 |
| 4 | 7 | 0 | 2 |

| Origin | Fights | Shots |
|---|---|---|
| expedition | 68 | 35 |
| world-tick | 34 | 12 |
| aid | 2 | 0 |
| other:_cxBlood (sealed-arena blood contests) | 16 | 0 |

The 16 contest fights all enter with **0 stones** (ammoAtEntry 0
on every one) — 0 shots is honest, not a volley suppression; the
contestant's pouch is empty before the bout starts. Wave-4 sling
fights rose 3 → 7 on the longer 107025 life, all with 0 shots:
two evaded with a full 6-stone pouch, the rest fought with empty
pouches. The volley cross-check holds perfectly: 0 rows where
ammoLeft ≠ ammoAtEntry − shots.

### (c) The departures are concentrated on two seeds — unchanged

All 22 stone-carrying departures and all 47 volley shots come from
TWO seeds. The other six seeds' sling carriers never depart and
never fire a shot — they fight at home with empty pouches.

| Seed | Sling departs | Pocketed | Sling fights | Shots |
|---|---|---|---|---|
| 107025 | 16 | 37 | 56 | 31 |
| 107026 | 6 | 18 | 31 | 16 |
| 107021 / 107022 / 107023 / 107024 / 107027 / 107028 | 0 | 0 | 3 / 0 / 10 / 11 / 9 / 0 | 0 |

One villager, gen_vqdtcb2 (107025), departs 16 times in 140 days
— an expedition regular whose pouch is topped to 6 at the door,
spent in the field, and topped again. gen_xwziftr (107026)
departs 6 times. Everybody else's sling is a home-defense weapon
that never leaves Haven and therefore never gets stones: the
top-up happens ONLY at departure, so a carrier who never departs
can never be armed. The "slings live empty" finding is, more
precisely, "slings live at home." (107023's sling fights rose
5 → 10 with 0 shots — Amelia's empty-sling wave-4 fights, §9.)

### (d) The residual, decomposed — zero, and the two a-artifacts close exactly

Residual drain 0 stones; unexplained gains 0 stones. The
analyzer's residual detail is empty (0 rows). Both a-artifacts
are gone, and each closes on the exact stones the a-evidence
predicted:

- **The 9-stone paired-± artifact: gone.** No adjacent-interval
  ± pairs remain anywhere in the 1,140 intervals. The epoch join
  attributes every same-day fight to the interval it belongs to:
  a fight stamped day d with epoch d lands in (d, d+1]; with
  epoch d−1 it lands in (d−1, d]. The proof test's unit cases and
  the analyzer selftest's epoch fixture (58/58) both reproduce
  the a-artifact shape and show it closing to residual 0 under
  the b-join — and the a-analyzer run on the same fixture still
  shows the artifact (residual drain 6 + gain 4), proving the
  join, not the fixture, fixes it.
- **The same-day-death edge: closed.** gen_xwziftr (107026) is
  censused at 4 stones on day 70, fights that day after the
  census (2 shots, epoch 70, wave-3 callback expedition fight,
  outcome vDie), and dies the same day carrying 2 stones ("Big
  Loud"). The `>=` death lookup finds the death; the death
  interval joins the post-census fight by epoch: O=4, X=2,
  carried=2, R=0. The directly measured death-carried is 2 —
  exactly the a-sensitivity note's number.

### (e) Census re-check — the parent numbers reproduce

1,158 sling/phase_sling carrier-days: 91.3% at zero stones,
mean 0.449.

| Weapon | carrier-days | zero share | mean stones |
|---|---|---|---|
| sling | 964 | 0.932 | 0.353 |
| phase_sling | 194 | 0.820 | 0.928 |

The phase_sling row is identical to the a-band to three decimals
(194 days, 0.820, 0.928). The sling row moved slightly (1,021 →
964 carrier-days, 0.935 → 0.932, 0.33 → 0.353) because 107025
lived 36 days longer with its carrier departing and spending —
more armed days in the denominator. StashAmmo is 0 on every
sling census row — there is still no stash sink; stones live in
the pack or the pile, nowhere else.

### (f) Deaths, switches, and the three stoneDeaths rows

- Deaths with a stoneDeaths row: 3 (all found by the `>=`
  lookup; a found 0). xwziftr d70 carrying 2 (the death share);
  gen_rc3zr79 (107025, d25, "a wound that wouldn't close")
  carrying 0; app_mgpspl60298 / Amelia (107023, d136,
  "monster") carrying 0 — she fought wave-4 heralds, eulogies
  and eaters with an empty sling for two weeks before dying
  (§9). Vanished: 0 (a: 2 — both were the same-day-death edge).
- Weapon-switches: 9 carriers trade the sling for another weapon
  (6 stones carried out of the ledger — not a drain, still in
  the pack, no longer counted).
- Loot stone rows: 0. No stone ever arrived by loot, gift, or
  duty in 150 days on 8 seeds.

## 6. §15 balanced panel — review_required (zero deltas, by construction)

`scripts/build-slingstone-panels-b.js` + `node
scripts/balance-panel.js compare`. Decision:
**review_required** (compare exit code 2 is the tool's
review_required code, not an error). 8 paired cases; screen only.
Every paired delta is exactly 0 (before==after is the same corpus
— a DIAG carries no lever to compare): national 0 → 0, table win
rate 0 → 0, village deaths per run 83.25 → 83.25, community loss
0.5 → 0.5, all `no_material_signal`. (Village deaths per run is
83.25 here vs 76.625 on the a-band — the base move's longer
107025 life and extra wave-4 fights, not a lever: before==after
is the same corpus, so the delta is 0 either way.) The panel is
the instrument, the frozen bars (§2) are the judge. Panel files:
`slingstone-b-panel-before.json.gz`,
`slingstone-b-panel-after.json.gz`, `slingstone-b-panel.json`,
`slingstone-b-panel.md`.

## 7. Reachability verdict / wall numbers

Wave-4 meetings happen; wave-5 unlocks 1/8 (107027 only — 107023
lost its wave-5 unlock in the base move, §4); **national 0/8;
table not instrumented (null, never faked); wins 0/8.** Median
survival 145d. Community lost 4/8. The standing-199 stall
persists (107021, 107023, 107024, 107025, 107026, 107028 all end
at 199; 107027 breaks out to 515 at wave 5). The scale-onramp
axis is still blocked above regional. What this run adds: the
sling-stone drain is the volley at 95.9% with a clean ledger,
the craft candidate is proven zero twice over, and the death
share is measured at 4.1% — the question #2600 is now answered
on a fully attributed ledger.

## 8. Village assessment (plain words)

A sling carrier's pouch empties the honest way, and now the
books prove it with nothing left over: they shoot. Six stones
at the door, a fight or two in the field, and the pouch is empty
again — forty-seven shots across eight villages, two stones
carried to one grave, and not one stone went anywhere else.
Nobody's workbench ate a stone. Nobody gifted one away. The
one carrier who died with stones in his pouch carried two, and
the fight that morning had already spent the other two — the
ledger reconstructs his last day exactly, and the residue is
zero.

The real story is still who ever gets stones at all. On six of
the eight villages, a sling carrier never once walks out the
door with stones in a hundred and fifty days — they stay home,
they fight off what comes to the village with an empty string,
and the village never arms them, because arming only happens
at the departure. Two villagers break the pattern: one walks
out sixteen times, topping up to six stones every time, and
spends them all in the field. The sling isn't a weapon the
village keeps ready. It's a weapon one or two restless people
keep using.

And the village never talks about any of it. The voice of the
village mentions stones only when someone pries one out of the
creek for the building pile. Nobody says "I need stones,"
nobody says "my string is drawn and useless" — except the fight
itself, sixteen times on this band, when a fighter stands in
front of a wave-4 monster with an empty pouch and the game says
so plainly.

## 9. Sense testing (what the player would see)

Read in full from the corpus: all 120 sling fights (by wave /
origin), all three death rows, the 4 sampled `vetSays` stone
lines, and the 16 no-ammo fight lines.

- **107026 d70 gen_xwziftr (phase_sling) dies carrying 2 stones:**
  censused at 4 that morning, spends 2 in a wave-3 expedition
  fight against a callback (2 hits, 49 damage, outcome vDie),
  dies to "Big Loud" carrying 2. The ledger reconstructs the
  day exactly; the death is a fight death, not a drain mystery.
  This is the a-evidence's edge case, now closed by the
  instrument instead of diagnosed around it.
- **107023 Amelia (app_mgpspl60298) vs wave-4, empty pouch:**
  "Amelia has Sling but no stones — the string stays drawn,
  useless." — five times across days 125–136 (herald, eulogy,
  eater), then she dies on day 136 carrying 0 stones. The line
  names the ammo correctly ("stones", not "arrows"). Finding
  #2593 (the line misnames non-arrow ammo) is NOT re-observed
  as a misnaming here either; across all 16 no-ammo lines on
  this band the line names each weapon's actual ammo ("no
  stones" for slings, "no arrows" for bows — Sanne's crude bow
  ×7, Charlotte's and Hannah's bows, Precious's bow).
- **107023 d133–148 Sanne (crude bow, no arrows):** the same
  line fires seven times for a bow carrier — the bow side of
  the same empty-pouch story, and the line is correct there too.
- **The village voice on stones (4 lines, all 107023):** every
  one is the same villager prying a stone from the creek bed
  for the building pile ("The building pile grows. (2 stone
  now.)"), identical to the a-band. Stones enter the village's
  speech as building material, never as ammunition. Of the
  sampled lines, none is a villager wanting, making, lacking,
  or losing sling stones. The silence is the measurement, as
  with the bow story: a player watching a village would never
  learn from its voice that slings are empty; they would learn
  it from the fights, where the string stays drawn.

No new player-facing text was added by this arm (a DIAG adds no
game code). The transcripts read like people throughout — the
evades, the named line, the creek-bed gathering all read.

## 10. Findings filed / updated (for the coordinator to file — this arm does not edit sim-findings.md)

- **#2600 (slings live empty) — CLOSED.** The drain is the
  volley: 47 of 49 drained stones (95.9%, majority cause),
  death-carried 2 (4.1%), craft takes 0 in 1,065 duty-days,
  gear takes 0, loot 0, residual 0 on a fully attributed ledger
  (completeness 1.000). The weapon-craft candidate is dead
  twice over (code-excluded AND instrument-proven, on two
  bands). The deeper shape stands: only 2/8 seeds' carriers
  ever depart (22 departures, 55 stones); the other six seeds'
  carriers fight at home with empty pouches because the top-up
  happens ONLY at departure. The frozen verdict is DIAG-NO-GO
  (drain pool 18 < 25) — the question is answered, the bar is
  not met. The bar, not the question, is what is left: see the
  drain-pool proposal below.
- **#2608 (census-epoch instrument) — CLOSED (proven).** The
  epoch stamp + epoch join repairs the ledger exactly as
  predicted: completeness 0.783 → 1.000, residual drain 13 →
  0, unexplained gains 11 → 0, vanished 2 → 0, deaths found
  0 → 3. Epoch-less rows on the judged corpus: 0 (the #2609
  fallback never fired). Any future per-villager ledger built
  on this census should carry the epoch from the start.
- **#2609 (closed-left join window) — APPLIED.** The analyzer
  joins epoch-less rows with [prevRowDay, rowDay]. It never
  fired on judged data (0 epoch-less rows); its documented
  caveat stands — a boundary-day epoch-less row shared by two
  intervals would join both. The epoch is the primary key; the
  window is a legacy fallback only.
- **NEW — the drain-pool floor is mis-sized (slingstone-b,
  confirms slingstone-a §12).** The floor (≥25 drain intervals)
  was sized on carrier-days (1,158 sling carrier-days), but
  carriers sit at zero ~91% of days, so only 18 intervals ever
  drain — the same count on both bands, because the departure
  count (22) is the same. A future drain-pool floor should be
  sized on departures, or count departure-to-empty cycles
  rather than census intervals: a ≥25 drain-interval floor needs
  a band with ~30+ stone-carrying departures, or the floor
  should be redefined. Proposed for the next run, not applied
  here (the frozen bars were judged as written).
- **NEW — the base move moved trajectories, not the sling
  numbers (slingstone-b).** Between de9bb3c22 and 16975bb01 the
  bowcraft fix (#2597, ef1c81094) and journey-landing r148
  changes landed; 107023 lost its wave-5 unlock (standing
  290 → 199), 107025 lived 36 days longer (104 → 140d), 107027
  climbed 365 → 515 — yet departures (22), pocketed stones
  (55) and volley shots (47) are byte-identical to the a-band.
  The sling supply chain is stable under the base move; the
  moving pieces are village survival and standing, not stone
  flow.
- **#2593 (the "no arrows" line misnames non-arrow ammo) — NOT
  re-observed as a misnaming.** 16 no-ammo lines on this band
  (5 sling, 11 bow) all name the weapon's actual ammo. Still
  open from bowopen-a for the bow/bolt case; the sling case is
  correct as measured, twice.

## 11. Blanks, limits, and things not done

- **Rebase before judged sims (recorded, not hidden):** the
  branch was registered at 7e0810eea (sim-winnability-round-1530
  adoption closeout) and rebased onto local master 16975bb01
  (sim-partysurvive-rerun-b, 4 commits, linear descendant,
  clean, no picks) before any judged sim ran. Origin/master
  (17bb496df, a batch-ship version bump) does NOT contain
  16975bb01 — local master runs ahead of origin between ships,
  as usual; the rebase target was local master, the branch the
  coordinator merges into.
- **No 12–16 seed confirm** — gated off by the NO-GO (see §2).
- **Trajectory drift vs slingstone-a (§4):** the base move
  changed three seeds' trajectories (107023 wave 5 → 4,
  107025 104 → 140d, 107027 standing 365 → 515). The ledger is
  self-contained per seed, so attribution is unbiased, and the
  headline totals match the a-sensitivity prediction exactly —
  but a strict before/after on identical trajectories is not
  what this run is: the base moved under it, and the drift is
  recorded here rather than hidden.
- **No check.js run** (the round addendum owns the merged-master
  check; this arm ran the targeted suites instead: proof 49/49,
  analyzer selftest 58/58, panel builder clean).
- **Telemetry deviation check: NOT RUN — the baseline file is
  absent.** `scripts/telemetry-check.js` needs
  `telemetry-baselines/scale-wall.json`; the file exists nowhere
  in this worktree or the main tree (checked by find + direct
  ls). The a-arm's run REFUSED recorder-corpus input; this
  arm's run could not start. Baseline NOT rolled. Recorder
  corpora are compared with sweep-compare tables, never
  against a run baseline here.
- **Table sittings not instrumented** by this driver — reported
  as null, never faked. The panel shows table-entry/sitting rates
  as `not_observed`.
- **Encounter logs cap at ~20 lines** — fights longer than ~4
  rounds are truncated; all damage-rate claims use mDealt/rounds,
  never parsed totals. The stoneFights rows carry no logs (the
  volley + outcome are the record); sense reads use the
  v4encounter logs and vetSays.
- **The `_cxBlood` triples** (same-day ×3 vKill/mFlee rows) are
  one contest's three bouts as recorded per fieldFight call —
  observed, not decomposed.
- **The #2609 fallback caveat** (see §10): an epoch-less event
  stamped exactly on a shared boundary day would join both
  adjacent intervals. It never fired on judged data
  (epochlessRows 0), so no judged number is affected; the
  caveat is a property of the fallback rule, stated in the
  analyzer header, not a live defect.

## 12. Metric review

- The frozen bars judged as written; the DIAG-NO-GO stands and
  is carried by the drain pool alone. The prereg's expectation
  was exactly right (completeness repaired to 1.000, D = 49,
  volley 0.959, death 0.041, drain pool still 18) — and the
  verdict follows the bars, not the expectation: had the drain
  pool cleared 25, the verdict would be GO.
- **The completeness bar measured the instrument, and the
  instrument is now proven.** The residual's 13 stones in a
  decomposed into 9 of boundary artifact and 4 of the
  same-day-death edge; both are gone (residual 0, gains 0,
  vanished 0). The epoch join is validated three ways: the
  live corpus closes exactly, the analyzer selftest's epoch
  fixture closes while the a-analyzer on the same fixture still
  shows the artifact, and the proof test's unit cases close.
  The bar did its job in a (it caught a real instrument
  weakness) and now certifies the fix in b.
- **The drain-pool floor is the remaining mis-sizing, confirmed
  on a second band.** It assumed drain intervals scale with
  carrier-days, but carriers sit at zero ~91% of days, so only
  the two expedition regulars' departure-to-empty cycles ever
  drain — 18 intervals on both bands, because the departure
  count (22) is the same on both bands. The floor needs a
  departure-sized band (~30+ stone-carrying departures) or a
  redefinition in terms of departure-to-empty cycles. That is
  a proposal for the next run, not a re-barring here.
- **The split-quantified bar worked as designed, twice:** the
  craft share is 0.000 with the wraps proven live (1,065 calls
  per duty), so 0 is a measurement, not an absence of data. The
  majority-cause clause fired on the volley (95.9%), and the
  death share is now a measured 4.1% instead of a missed 0.
- The mechanism check (volley cross-check) did its job again:
  0 violations in 120 fights — the volley numbers are the fight
  engine's own, and the ledger's spend side is internally
  consistent. The thinness is in the world (few departures),
  not the recorder.
- No metric is re-scored here. The DIAG-NO-GO is the verdict;
  the repaired instrument and the fully attributed split (§5,
  §10) are the deliverable.

## 13. Files

- Prereg: `evidence/2026-11-19/sim-slingstone-b-prereg.md`
- This evidence: `evidence/2026-11-19/sim-slingstone-b.md`
- Analysis: `evidence/2026-11-19/slingstone-b-analysis.json`
- Corpora: `evidence/2026-11-19/perseed-slingstone-b-diag/` (8 files)
- Pilot logs: `evidence/2026-11-19/slingstone-b-sweep.log/.err`
  (judged sweep, exit 0, 0 instrument errors)
- Panel: `evidence/2026-11-19/slingstone-b-panel-{before,after}.json.gz`,
  `slingstone-b-panel.json`, `slingstone-b-panel.md`
- Analyzer: `scripts/analyze-slingstone-b.js` (selftest 58/58)
- Driver: `scripts/slingstone-driver-b.js`
- Panel builder: `scripts/build-slingstone-panels-b.js`
- Tests: `scripts/test-slingstone-b.js` (49/49)
- Code under judgement: none (DIAG — no game-code change).
  Instrument reads `src/js/game.js` (`villagerPocketAmmo`,
  `villagerKillLoot`, `registerDeath`), `src/js/villager-build.js`
  (the four build duties), `src/js/fieldFights.js` (volley),
  `src/js/contestEngine.js` (`_cxBlood` origin).
