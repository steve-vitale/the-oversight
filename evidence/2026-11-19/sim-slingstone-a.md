# sim-slingstone-a — evidence

Run fleshout-20261119T1415Z, Loop A (axis scale-onramp). Branch
`sim-slingstone-a`, base master de9bb3c22 (journey-succession r248;
rebased from the registration base ce94f8ff3 before any judged sim —
see §11). Worktree `~/workspace/worktrees/sim-slingstone-a`.
Prereg: `evidence/2026-11-19/sim-slingstone-a-prereg.md` (frozen
2026-11-19 ~09:05 UTC, before any new sim). Substrate: the LIVE
master substrate SENSEEXPED (landed 97e78670d, finding #2583) —
NOT the bowopen LAUNCHPARTY substrate, which is not on this base.
Analyzer: `scripts/analyze-slingstone-a.js` (selftest 27/27).
Analysis: `evidence/2026-11-19/slingstone-a-analysis.json`. Proof
test: `scripts/test-slingstone-a.js` (41/41).

## 1. The question

**Finding #2600.** Sling carriers hold ~0 stones on 93.5% of days
(mean 0.33), phase_slings on 82.0% (mean 0.93), yet depart armed
(13 pile-stone top-ups in the arrowsupply band). What drains
carried stones between departures — volley spend vs weapon-craft
consumption are both candidates? This DIAG carries a per-villager
stone ledger across the day boundary — departure top-up → volley
spends in fights → weapon-craft consumption → other drains (gift /
drop / death?) → next census count — and attributes every stone
delta.

## 2. Verdict — DIAG-NO-GO (the split is answered, the bars are not met)

| Bar | Result | Requirement | Outcome |
|---|---|---|---|
| Delta-attribution completeness | 0.783 | ≥ 0.90 | **FAIL** |
| Departure pool (stone-carrying sling departures) | 22 | ≥ 15 | **PASS** |
| Drain pool (intervals with a positive net drain) | 18 | ≥ 25 | **FAIL** |
| Drain split quantified | volley 0.783, craft 0.000, gear 0.000, death 0.000, residual 0.217; duty wraps live (1,029 calls each) | volley + craft shares measured, residual stated | **PASS** |
| Instrument: volley cross-check | 0 violations in 116 sling fights | 0 | PASS (cross-check, not a verdict bar) |

The NO-GO is frozen and stands; it is NOT re-scored. What it
means, precisely: the ledger attributes 47 of 60 drained stones
to the volley (78.3% — a majority cause, named), craft takes
exactly ZERO stones in 1,029 duty-days, and no stones die with a
holder on the frozen count — but 13 stones sit in the residual,
and the drain pool (18 intervals) is thinner than the floor (25).
§5 decomposes the residual: 9 of the 13 are a same-day ordering
artifact of the instrument (paired ±1/±2 residuals on adjacent
days — the census snapshot fires mid-day and fights stamped the
same day land after it), and the other 4 are a same-day-death
analyzer edge (a carrier who dies carrying 2 stones on the same
day as their last census row). The residual is therefore an
instrument story, not a game drain — but the frozen verdict does
not depend on that diagnosis, and the sensitivity note in §5 shows
the verdict would still be NO-GO (on the drain pool) even under
the corrected attribution. **No 12-seed confirm** — the prereg
gates the confirm on the pilot passing, and it did not.

## 3. The mechanism (what was measured, frozen from code read)

One stone is one unit of sling ammo, taken from the communal pile
at departure (cap 6, `villagerPocketAmmo`, game.js:8025 — it never
removes stones, read in full). Each volley shot costs 1 stone from
the lead fighter's own pack (fieldFights.js:960–1064; max
min(ammo, clamp(1+floor(range/speed),1,4)) = 4 shots per fight;
allies never volley; an evade can precede the volley, leaving it
null). The candidate drains, frozen:

1. **Volley spend** — the named candidate. Measured live: every
   fieldFight call whose lead fighter holds a sling/phase_sling,
   all waves, all origins.
2. **Weapon-craft consumption** — the named candidate, but the
   code as read makes it a non-candidate: `villagerWeaponCraftDay`
   serves WEAPONLESS villagers only and takes materials from the
   crafter's OWN pack first. The duty wraps prove the zero rather
   than asserting it (1,029 calls, 0 takes — §5b).
3. **Ammo-craft consumption** — excluded by construction:
   `villagerAmmoCraftDay` continues unless the ammo id is `arrow`
   or `bolt`. Proven zero the same way.
4. **Armor craft** — bark/hide recipes only, no stone. Proven zero.
5. **Gear moves** — `villagerGearDay` moves weapons/armor, never
   materials. Proven zero.
6. **Death** — stones die with the holder. Measured via a
   `registerDeath` pre-read (carried stone at death).
7. **Kill loot** — the alien table only; no stone gain recorded.
8. **Forage / other inflows** — no NPC forage-to-pack path, no
   villager `Game.craft` call, no hunt-action stone consumption
   found by grep; the ledger's unexplained-GAIN side is the check.

The driver wraps all of the above with pre/post carried-stone
reads (pure reads + driver-local writes; every game function runs
exactly once, untouched) and anchors the ledger on the daily
census (every living roster villager's ranged kit + carried/stashed
stone) plus a day-0 baseline.

## 4. Fresh pilot — before / after on identical seeds (8 seeds, 107021–107028)

Single leg (DIAG, no lever). Pilot logs:
`slingstone-a-sweep.log/.err` (exit 0, 0 instrument errors, 0
stderr lines; ~24.5 min for 8 seeds). Corpus flags verified per
file: `senseexpedOn` true, `bowopenOn` false, `gameSha`
matching the rebased base, `anchorCommit` de9bb3c22. The band is
the SAME seed set as the parent arrowsupply band, deliberately
re-instrumented (see the prereg — not claimed as fresh).

**Determinism:** the trajectories reproduce the parent band
exactly on every judged dimension — days 137/104/150/150/104/
150/150/85, standings 199/150/290/199/199/199/365/199, wave
4/4/5/4/4/4/5/4, sling departures 22, stones pocketed 55. The
r244→r248 base move changed nothing on this band. (Census row
counts differ by 4 sling rows out of 1,215 — 0.3%, a boundary-
cadence wobble, immaterial.)

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

## 5. The numbers

### (a) The ledger — the volley is the drain; craft takes nothing

1,197 alive census-intervals across the band; total drain D = 60
stones.

| Category | Stones | Share of D |
|---|---|---|
| Volley (47 shots in 116 sling fights) | 47 | **0.783** |
| Weapon / ammo / armor craft takes | 0 | 0.000 |
| Gear / gift takes | 0 | 0.000 |
| Death-carried (frozen count) | 0 | 0.000 |
| Residual (unexplained drain) | 13 | 0.217 |
| **Total drain D** | **60** | 1.000 |

Inflows over the band: 55 stones pocketed at departure (22
departures), 0 loot gains, 0 duty gains. Unexplained gains: 11
stones (see §5d — the other half of the boundary artifact).

**The volley is the majority cause (78.3%).** The weapon-craft
candidate is dead twice over: the code excludes sling carriers
(armed → skipped; own-pack-only takes), and the instrument watched
1,029 weapon-craft days, 1,029 ammo-craft days, 1,029 armor-craft
days and 1,029 gear days and recorded ZERO stone takes on any of
them. A craft lever cannot drain what the craft never touches.

### (b) The volley in detail — most sling fights never reach it

116 sling-carrier fights (lead fighter), 47 shots, 49 volley-nulls
(42% — the fight evades before the volley block runs).

| Wave | Fights | Shots | Volley-null (evade) |
|---|---|---|---|
| 1 | 58 | 21 | 29 |
| 2 | 40 | 14 | 14 |
| 3 | 17 | 12 | 4 |
| 4 | 3 | 0 | 2 |

| Origin | Fights | Shots |
|---|---|---|
| expedition | 68 | 35 |
| world-tick | 33 | 12 |
| aid | 1 | 0 |
| other:_cxBlood (sealed-arena blood contests) | 16 | 0 |

The 16 contest fights all enter with **0 stones** (ammoAtEntry 0
on every one) — 0 shots is honest, not a volley suppression; the
contestant's pouch is empty before the bout starts. They also
arrive in near-identical same-day triples (e.g. 107023 d53 ×3
vKill, 107024 d61 ×3 vKill) — one contest's three bouts, recorded
per fieldFight call; noted, not chased. Wave-4 sling fights: 3 —
two evaded with a full 6-stone pouch (the volley never gets its
chance), one fought with 0 stones. The volley cross-check holds
perfectly: 0 rows where ammoLeft ≠ ammoAtEntry − shots.

### (c) The departures are concentrated on two seeds

All 22 stone-carrying departures and all 47 volley shots come from
TWO seeds. The other six seeds' sling carriers never depart and
never fire a shot — they fight at home with empty pouches.

| Seed | Sling departs | Pocketed | Sling fights | Shots |
|---|---|---|---|---|
| 107025 | 16 | 37 | 59 | 31 |
| 107026 | 6 | 18 | 31 | 16 |
| 107021 / 107022 / 107023 / 107024 / 107027 / 107028 | 0 | 0 | 3 / 0 / 5 / 11 / 9 / 0 | 0 |

One villager, gen_vqdtcb2 (107025), departs 16 times in 104 days
— an expedition regular whose pouch is topped to 6 at the door,
spent in the field, and topped again. gen_xwziftr (107026)
departs 6 times. Everybody else's sling is a home-defense weapon
that never leaves Haven and therefore never gets stones: the
top-up happens ONLY at departure, so a carrier who never departs
can never be armed. The "slings live empty" finding is, more
precisely, "slings live at home."

### (d) The residual, decomposed — an instrument story, not a game drain

Residual drain 13 stones; unexplained gains 11 stones. Both
concentrate on the same two expedition regulars
(gen_vqdtcb2, gen_xwziftr) — the only carriers with stones in
motion — and decompose exactly:

- **9 stones: same-day ordering artifact (paired ±).** The
  residual arrives in ± pairs on ADJACENT intervals of the same
  villager: vqdtcb2 (17,18] −1 then (18,19] +1; (52,53] −2 then
  (53,54] +2; (54,55] −2 then (55,56] +2; (56,57] −1 then
  (57,58] +1; (67,68] −1 then (68,69] +1; xwziftr (52,53] −2
  then (53,54] +2. Net over each pair: exactly 0. The mechanism
  is visible in the raw rows: census day 18 shows vqdtcb2 at 6
  stones while a day-18 fight spent 1 (the interval records the
  outflow but the census does not reflect it, R = −1); census
  day 19 shows 5 (the spend lands, R = +1). The daily census
  fires in `policy.daily`'s finally block — mid-day — and fights
  stamped the same game day can fire AFTER the snapshot. A fight
  and a census that share a day stamp are not ordered, so the
  spend lands in the wrong interval. Every paired residual is
  this artifact; none of it is a missing game drain.
- **4 stones: a same-day-death analyzer edge.** gen_xwziftr
  (107026) is censused at 4 stones on day 70, fights that day
  (2 shots), and dies the same day carrying 2 stones ("Big
  Loud"). The death lookup requires the death day to be AFTER
  the last census day, so a death ON the last census day is
  missed: the ledger files the carrier as "vanished" with 4
  stones lost. The directly measured death-carried is 2 (the
  other 2 are the day-70 volley shots, already counted in the
  47). The second death row, gen_rc3zr79 (107025, d25, "a wound
  that wouldn't close"), carries 0 stones and is harmless to the
  totals — same edge, zero weight.

**Sensitivity note (NOT a re-score — the frozen NO-GO stands).**
Under the corrected attribution the books close exactly:
residual drain 0, death-carried 2, D = 47 + 2 = 49,
completeness 1.000, split volley 47/49 = 0.959, death 2/49 =
0.041, craft 0. The verdict would STILL be DIAG-NO-GO, because
the drain pool (18 intervals) is a census-derived count that
re-attribution cannot change — it stays below the 25 floor. The
NO-GO is carried by the thin pool, not by the residual. The next
run (named in §10) fixes the instrument and re-judges on the
same frozen bars.

### (e) Census re-check — the parent numbers reproduce exactly

1,215 sling/phase_sling carrier-days: 91.7% at zero stones,
mean 0.43.

| Weapon | carrier-days | zero share | mean stones |
|---|---|---|---|
| sling | 1,021 | 0.935 | 0.33 |
| phase_sling | 194 | 0.820 | 0.93 |

Identical to the parent band (0.935 / 0.33; 0.820 / 0.93) to
three decimals. StashAmmo is 0 on every sling census row — there
is still no stash sink; stones live in the pack or the pile,
nowhere else.

### (f) Deaths, switches, and the two stoneDeaths rows

- Deaths with a stoneDeaths row: 2 (xwziftr d70 carrying 2,
  rc3zr79 d25 carrying 0). Frozen ledger deaths: 0 — the
  same-day edge (§5d).
- Weapon-switches: 8 carriers trade the sling for another weapon
  (6 stones carried out of the ledger — not a drain, still in
  the pack, no longer counted).
- Vanished: 2 rows (rc3zr79, 0 stones; xwziftr, 4 stones — the
  same-day-death edge).
- Loot stone rows: 0. No stone ever arrived by loot, gift, or
  duty in 150 days on 8 seeds.

## 6. §15 balanced panel — review_required (zero deltas, by construction)

`scripts/build-slingstone-panels-a.js` + `node
scripts/balance-panel.js compare`. Decision:
**review_required** (compare exit code 2 is the tool's
review_required code, not an error). 8 paired cases; screen only.
Every paired delta is exactly 0 (before==after is the same corpus
— a DIAG carries no lever to compare): national 0 → 0, table win
rate 0 → 0, village deaths per run 76.625 → 76.625 (identical to
the parent band), community loss 0.5 → 0.5, all
`no_material_signal`. The panel is the instrument, the frozen bars
(§2) are the judge. Panel files:
`slingstone-a-panel-before.json.gz`,
`slingstone-a-panel-after.json.gz`, `slingstone-a-panel.json`,
`slingstone-a-panel.md`.

## 7. Reachability verdict / wall numbers

Wave-4 meetings happen; wave-5 unlocks 2/8; **national 0/8; table
not instrumented (null, never faked); wins 0/8.** Median survival
143.5d. Community lost 4/8. The standing-199 stall persists
(107021, 107024, 107025, 107026, 107028 all end at 199). The
scale-onramp axis is still blocked above regional. What this run
adds: the sling-stone drain is the volley, the craft candidate is
proven zero, and the reason slings live empty is that their
carriers almost never depart — the top-up only happens at the
door, and the door is where the stones are spent.

## 8. Village assessment (plain words)

A sling carrier's pouch empties the honest way: they shoot. Six
stones at the door, a fight or two in the field, and the pouch is
empty again — forty-seven shots across eight villages, and not
one stone went anywhere else. Nobody's workbench ate a stone.
Nobody gifted one away. Nobody died rich — the one carrier who
died with stones in his pouch carried two, and the fight that
morning had already spent the other two.

The real story is who ever gets stones at all. On six of the
eight villages, a sling carrier never once walks out the door
with stones in a hundred and fifty days — they stay home, they
fight off what comes to the village with an empty string, and the
village never arms them, because arming only happens at the
departure. Two villagers break the pattern: one walks out sixteen
times, topping up to six stones every time, and spends them all
in the field. The sling isn't a weapon the village keeps ready.
It's a weapon one or two restless people keep using.

And the village never talks about any of it. The voice of the
village mentions stones only when someone pries one out of the
creek for the building pile. Nobody says "I need stones," nobody
says "my string is drawn and useless" — except the fight itself,
once, when Nichaporn stands in front of a wave-4 monster with an
empty pouch and the game says so plainly.

## 9. Sense testing (what the player would see)

Read in full from the corpus: all 116 sling fights (by wave /
origin), both death rows, the 281 sampled `vetSays` lines.

- **107025 d99 Nichaporn vs Big Big (wave 4, 0 stones):**
  "Nichaporn has Sling but no stones — the string stays drawn,
  useless." — the no-ammo line fires, and it names the ammo
  correctly ("stones", not "arrows"). Finding #2593 (the line
  misnames non-arrow ammo) is NOT re-observed as a misnaming
  here; the line names the weapon's actual ammo. Then the fight
  continues honestly on the tripwire and the melee strike. A
  player watching this fight learns exactly why the volley never
  fired.
- **107025 d50 / 107026 d42 (wave-4 sling evades, full pouch):**
  "Nicolás saw The Eulogy in time and gave it room." / "Mai saw
  The Reunion in time and gave it room." — a carrier with six
  stones walks away from a wave-4 monster before the string is
  ever drawn. The evade reads like a person choosing not to die,
  and the six stones stay in the pouch for a fight that never
  comes. Nothing robotic; the evade is the story.
- **107026 d70 gen_xwziftr (phase_sling) dies carrying 2 stones:**
  censused at 4 that morning, spends 2 in an expedition fight,
  dies to "Big Loud" carrying 2. The ledger reconstructs the day
  exactly; the death is a fight death, not a drain mystery.
- **The village voice on stones (4 lines, all 107023):** every
  one is a villager prying a stone from the creek bed for the
  building pile ("The building pile grows. (2 stone now.)").
  Stones enter the village's speech as building material, never
  as ammunition. Of 281 sampled lines, none is a villager
  wanting, making, lacking, or losing sling stones. The silence
  is the measurement, as with the bow story: a player watching
  a village would never learn from its voice that slings are
  empty; they would learn it from the fights, where the string
  stays drawn.

No new player-facing text was added by this arm (a DIAG adds no
game code). The transcripts read like people throughout — the
evades, the named line, the creek-bed gathering all read.

## 10. Findings filed / updated (for the coordinator to file — this arm does not edit sim-findings.md)

- **#2600 (slings live empty) — ANSWERED, narrowed.** The drain
  is the volley: 47 of 60 drained stones (78.3%, majority cause),
  craft takes 0 in 1,029 duty-days, gear takes 0, loot 0. The
  weapon-craft candidate is dead (code-excluded AND
  instrument-proven). The deeper shape: only 2/8 seeds' carriers
  ever depart (22 departures, 55 stones); the other six seeds'
  carriers fight at home with empty pouches because the top-up
  happens ONLY at departure. The frozen verdict is DIAG-NO-GO
  (completeness 0.783 < 0.90 on a same-day ordering artifact;
  drain pool 18 < 25) — the question is answered but the bars
  are not met. Next arm (named precisely): **sim-slingstone-b**
  — DIAG re-run on the same band with the census-epoch
  instrument (stamp every fight/departure/duty row with the last
  census day seen, so same-day fights attribute to the interval
  they belong to; death lookup `>=` the last census day) and
  judge on the same frozen bars. Do NOT fold this into the
  bow/arrow work; it is a different question from the departure
  craft.
- **NEW — the census-boundary attribution artifact (instrument,
  sim-slingstone-a).** The daily census fires mid-day
  (`policy.daily`'s finally block) while fights stamped the same
  game day can fire after the snapshot, so a fight's spend lands
  in the wrong ledger interval. Signature: exact ± pairs on
  adjacent intervals (9 stones here, net 0). Any ledger that
  joins day-stamped events to day-stamped censuses needs a
  census epoch on the event rows, not just the day. Next arm:
  sim-slingstone-b (above). Affects any future per-villager
  ledger built on this census (arrows, bows, medicine).
- **NEW — sling departures concentrate on expedition regulars
  (sim-slingstone-a).** One villager (gen_vqdtcb2, 107025)
  departs 16× in 104 days; a second (gen_xwziftr, 107026) 6×;
  the other six seeds' sling carriers depart 0× in 150 days.
  Stone supply is not village-wide — it is two restless people.
  A fix arm that arms slings at home (not only at departure)
  would change the other six seeds, not these two.
- **NEW — contest blood fights enter with empty pouches
  (sim-slingstone-a).** 16 sealed-arena sling fights, all with
  ammoAtEntry 0 (0 shots, honest). Contestants are never
  pocketed for — the departure top-up serves expeditions, not
  the arena. Whether the arena should arm its fighters is a
  design question for the contest line, named here not built
  here.
- **#2593 (the "no arrows" line misnames non-arrow ammo) — NOT
  re-observed as a misnaming.** The line fires once on this band
  for a sling and names the ammo correctly ("no stones"). Still
  open from bowopen-a for the bow/bolt case; the sling case is
  correct as measured.

## 11. Blanks, limits, and things not done

- **Rebase before judged sims (recorded, not hidden):** the
  branch was registered at ce94f8ff3 (journey-deepening r244)
  and rebased onto local master de9bb3c22 (journey-succession
  r248, 10 commits, linear descendant, clean, no picks) before
  any judged sim ran. The trajectories reproduce the parent
  band exactly (§4), so the rebase changed nothing measured.
  Origin/master (b76d65445, a batch-ship version bump) does NOT
  contain de9bb3c22 — local master runs ahead of origin between
  ships, as usual; the rebase target was local master, the
  branch the coordinator merges into.
- **No 12–16 seed confirm** — gated off by the NO-GO (see §2).
- **Analyzer edge (same-day death):** the death lookup requires
  death day AFTER the last census day, so both death rows on
  this band (death day == last census day) missed the death
  interval and one filed as "vanished" (§5d). The frozen verdict
  does not depend on it (the sensitivity note shows the verdict
  stands either way), and the fix (death lookup `>=`, plus the
  census-epoch stamp) is named for sim-slingstone-b, not applied
  here — applying it now would be re-scoring.
- **No check.js run** (the round addendum owns the merged-master
  check; this arm ran the targeted suites instead: proof 41/41,
  analyzer selftest 27/27, panel builder clean, telemetry-check
  refusal recorded).
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
- **Telemetry deviation check:** `node scripts/telemetry-check.js
  --baseline …/telemetry-baselines/scale-wall.json --current
  'evidence/2026-11-19/perseed-slingstone-a-diag/*.json' --metrics
  national,table,wins,exiled` — REFUSED recorder-corpus input
  (all 8 rows carry top-level anchorCommit; exit 2 with the
  refusal message) — same documented refusal as the bowopen-a /
  arrowsupply-a / bowsource-a runs. Recorder corpora are compared
  with sweep-compare tables, never against a run baseline here.
  Baseline NOT rolled.

## 12. Metric review

- The frozen bars judged as written; the DIAG-NO-GO stands and
  is not re-scored. The split bar passed with a named majority
  cause (volley 78.3%); the departure pool passed (22 ≥ 15); the
  completeness bar (0.783 < 0.90) and the drain-pool bar
  (18 < 25) failed.
- **The completeness bar measures the instrument, not the
  world, on this band.** The residual's 13 stones decompose into
  9 of boundary artifact (paired ±, net 0 — §5d) and 4 of the
  same-day-death analyzer edge. The sensitivity note shows the
  corrected attribution closes the books exactly (completeness
  1.000, volley 95.9%, death 4.1%). The bar did its job anyway:
  it caught a real instrument weakness (day-stamped events vs
  day-stamped censuses need an ordering key) instead of letting
  a clean-looking split through on a leaky ledger. The fix is
  named for the next run (census-epoch stamping), not applied
  here.
- **The drain-pool floor was mis-sized** — the same class of
  error the arrowsupply arm recorded for its departure pool.
  It assumed drain intervals scale with carrier-days (1,215
  sling carrier-days), but carriers sit at zero 93% of days, so
  only 18 intervals ever drain. A future drain-pool floor should
  be sized on departures (22 on this band), not carrier-days —
  i.e. a ≥25 drain-interval floor needs a band with ~30+
  stone-carrying departures, or the floor should count
  departure-to-empty cycles rather than census intervals.
  Proposed for the next run, not applied here.
- **The split-quantified bar worked as designed:** the craft
  share is 0.000 with the wraps proven live (1,029 calls per
  duty), so 0 is a measurement, not an absence of data. The
  majority-cause clause fired on the volley (78.3%).
- The mechanism check (volley cross-check) did its job: 0
  violations in 116 fights — the volley numbers are the fight
  engine's own, and the ledger's spend side is internally
  consistent. The thinness is in the world (few departures),
  not the recorder.
- No metric is re-scored here. The DIAG-NO-GO is the verdict;
  the substantive answers (§5, §10) are the deliverable.

## 13. Files

- Prereg: `evidence/2026-11-19/sim-slingstone-a-prereg.md`
- This evidence: `evidence/2026-11-19/sim-slingstone-a.md`
- Analysis: `evidence/2026-11-19/slingstone-a-analysis.json`
- Corpora: `evidence/2026-11-19/perseed-slingstone-a-diag/` (8 files)
- Pilot logs: `evidence/2026-11-19/slingstone-a-sweep.log/.err`
  (judged sweep, exit 0, 0 instrument errors)
- Panel: `evidence/2026-11-19/slingstone-a-panel-{before,after}.json.gz`,
  `slingstone-a-panel.json`, `slingstone-a-panel.md`
- Analyzer: `scripts/analyze-slingstone-a.js` (selftest 27/27)
- Driver: `scripts/slingstone-driver-a.js`
- Panel builder: `scripts/build-slingstone-panels-a.js`
- Tests: `scripts/test-slingstone-a.js` (41/41)
- Telemetry check: `evidence/2026-11-19/slingstone-a-telemetry.log`
  (refusal, baseline not rolled)
- Code under judgement: none (DIAG — no game-code change).
  Instrument reads `src/js/game.js` (`villagerPocketAmmo`,
  `villagerKillLoot`, `registerDeath`), `src/js/villager-build.js`
  (the four build duties), `src/js/fieldFights.js` (volley),
  `src/js/contestEngine.js` (`_cxBlood` origin).
