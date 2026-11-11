# sim-siegefirst-a — SIEGE first numbers (coverage program, Tier 2)

Worktree: `~/workspace/worktrees/sim-siegefirst-a`. Run: oversight-flesh-out-loop,
run fleshout-20261111T1118Z, axis coverage (siege). ARM: sim-siegefirst-a
(measurement only — NO siege system is landed in this run).

## PRE-REGISTRATION (written BEFORE any sims)

- **Primary metric (binding): INSTRUMENT VALIDITY — every recorded row
  classified, zero unclassified rows, zero residue.** The instrument records
  siege-adjacent events in eight classes (raids, pillages, lingerer
  episodes, aid crises, the-siege crisis fires, siege contests, shelter
  verbs, deaths-by-location) plus siege say lines. The analyzer classifies
  every row; any row that fits no class is counted `unclassified` and the
  run is NO-GO on instrument validity.
- **GO threshold:** unclassified rows = 0 AND residue rows = 0 AND every
  wrap live on the proof fixture or the pilot (a dead wrap's zero is never
  treated as evidence — it is named in the evidence and its class is
  reported as UNKNOWN, not 0).
- **Horizon:** 150d, death-aware (runDays stops on Game.over / village-dead
  tail). Why 150d: raids need pantry ≥3000 kcal + 3+ living world monsters
  (a wealth phase, typically day 20+); a lingerer episode runs ~6 nights;
  the siege contest is wave-3-gated (day 25+ ledger); the-siege crisis
  needs a raid crisis resolved 'fought'. 150d covers the full
  raid → linger → gorge → drift/sortie arc while staying inside the
  observed competent-policy survival distribution. Same horizon as the
  sibling first-numbers runs (trapfirst-a, fishfirst-a).
- **Seeds:** 210401–210408 (8 seeds, competent policy verbatim).
- **Seed-band freshness check** (skill local_seed_band_freshness): searched
  `evidence/2026-11-1*/` and `evidence/2026-10-*/sim-*.md` for `210401` —
  zero matches. Searched all of `evidence/` for `2104` — only hit is the
  commit hash `c2104f8` (2026-10-07 run note), no seed use. Searched for
  `1904[0-9][0-9]` — zero matches in evidence .md files (the `1904` hits
  elsewhere are the single seed 1904 and corpus files `s51904`/`s71904`,
  different seeds). No forbidden/contaminated band list names 2104xx.
  Band 210401–210408 is FRESH.
- **Policies:** `scripts/policies/competent.js` verbatim (skill-ceiling seed).
  Two legs on the same seeds; the ONLY difference is the instrument:
  control (instrument ON, the judged leg) vs neutral (instrument OFF —
  end-of-run wall numbers only), for trajectory-neutrality.
- **Secondary (reported, not judged):** wall numbers (national / table /
  wins, wave 4–5 unlocks, median survival); per-seed counts for every
  siege-adjacent class; deaths at home vs away; siege say-line sense
  sample (SENSE-TESTING LAW — read, don't just count).

## SUBSTRATE AUDIT (code read before the pilot)

There is NO dedicated SIEGE canon doc (CANON.md manifest has none;
MONSTER-WAVES.md §Wave 6+ scaffolds "the siege" as fiction only, numbers
TBD). What DOES exist is fragmented siege-adjacent substrate in five
separate senses of the word — the audit below is grounded only in code
read this run:

1. **Siege CONTEST** (`src/js/contests.js` `_contestSiege`, data
   `src/data/contests.json` id `siege`): blood/extreme, wave-3-gated
   (`pickContest` filters it out while `unlockedWave() < 3`), "THREE
   WAVES. HOLD THE LINE" — a chokepoint hold with 3 real arena fights,
   health carrying between waves. EXISTS and is playable.
2. **THE SIEGE crisis** (`src/js/progression.js` CRISIS_BEATS
   `'the-siege'`): fires only when a RAID aid crisis resolves `'fought'`
   (`src/js/comms.js` `resolveAidCrisis`, once per run via fireCrisis
   dedupe). The peaceful-stable run's crisis: wealth drew teeth, teeth
   were answered. EXISTS.
3. **Lingering raiders / the treeline siege** (`src/js/havenGrowth.js`
   `havenRaidTick` + `havenGrowthDaily`, `src/js/game.js` `tbEnd`
   lingerer restore): raids fire reactively (3+ living world monsters,
   pantry ≥3000 kcal, 7-day cooldown, 18% roll; 3 raiders base, +1 above
   12k, +1 above 24k, cap 5). Raiders nobody meets LINGER at the Haven
   tile and gorge nightly (500–1500 kcal via `raidPillage`) until driven
   off or drifting after ~6 nights. A fled/lost fight against a lingerer
   puts it back on the treeline wounded ("the siege goes on"). The
   Palisade (Haven tier 2) deals 25% max-HP wall damage to raiders coming
   over. EXISTS — this is the closest thing to a siege system.
4. **Shelter/evacuate verb** (`src/js/shelter.js`, landed after
   sim-siegeroster 2026-10-15): `shelterVillagers()` moves villagers to
   Haven, inside the hall, behind a barricaded door; the wild router,
   raid draft, and duty loops exclude them. Threat gate is a wave-4+
   monster within radius 2 of Haven (stand-down past radius 3).
   EXISTS — the siege answer's defensive half.
5. **Wave-6+ siege scaffold** (`docs/MONSTER-WAVES.md`): "past wave 5 the
   waves keep coming... the siege leads to the egg" — FICTION ONLY, no
   engine. The heralds exist as DATA only: `src/data/monsters.json` has
   3 wave-6 defs (`network_tower`, `network_limb`, `network_heart`).
   No wave-6 spawn path was found in code read this run.

Prior siege work (read, not re-measured): sim-siegeroster (muster beat
fired, no shelter verb — verb now exists), sim-siegedef2/2r (scholar
protected, village died around them — the roster-level wall), sim-siegedef3
(pilot NO-GO, policy deleted per kill protocol), sim-besiegeanswer
(successor-death guard), sim-raidassess / sim-wallbase-a /
sim-treeline-20261017 / sim-gorgeharness-a (gorge + drift + sortie
harness). This run does NOT re-litigate those verdicts; it takes the
first census of the whole siege-adjacent substrate in one place.

## RESULTS

**Verdict: NO-GO on the literal pre-registered bar — by one row.** Two
scorings, both reported (the metric did not change; the classifier's
knowledge of the engine was corrected to match it, on the same corpus,
with no re-simulation):

- **As pre-registered (original analyzer): unclassified 73, residue 6 →
  NO-GO.** The 73 were all `contest-id:tick` rows; the 6 were all
  `linger-unexplained-end`.
- **After diagnosed analyzer fixes (same 16 per-seed files):
  unclassified 0, residue 1 → still NO-GO on the literal bar.** The one
  residue row is seed 210405, redactor m271 (firstDay 94, lastDay 95,
  vanished day 96). It vanished the same day its twin the reunion was
  fought by the scholar and lost (day-96 fight vs reunion, php 100 →
  −20); there is no death row for the redactor, no aid-crisis resolve
  on days 95–96, and no raid that day. Its clearing path is not in the
  instrument's telemetry. It is named here, not hidden, and carried as
  a finding below — one unexplained ending in 89 episodes, not a
  hidden miss.

**What the two NO-GO clusters turned out to be — analyzer knowledge,
not lost data.** (1) The 73 unclassified rows were real engine SHOWS
served by the same `contestTick` scheduler: the analyzer knew only
`src/data/contests.json`, but `contestTick` also serves the inline TV-show
pool `G.showPool()` in `src/js/contests.js` plus the `__summons`
pseudo-contest. The instrument recorded them faithfully. Fix: the
analyzer now extracts the show ids from the `showPool` block and counts
shows separately — 279 ticks classify as 206 contests + 63 shows + 10
summons. (2) The 6 residue rows were three verified engine paths the
analyzer's ending rules did not know: `fieldFight` kills emit no
`combat_start` (sortie/patrol/raid-defense kills are visible only in
death rows — chorus_line d96, murkcap d51 → new `killed` rule); a
`fought` aid-crisis resolve on the end day proves the treeline went
clear with no death (sortie mFlee — buffering d71, alien_tick d85,
herald d85 → new `driven-off` rule); the moved-on safety valve
(`comms.js:828–837`) clears ALL lingering flags when a crisis ages past
6 days, whatever each raider's own clock says (→ new `moved-on-valve`
rule, which closed the gap though it classified 0 of these 6). The
lingerer endings are now: met-in-fight 52, drifted 28, killed 2,
driven-off 3, unexplained-end 1, still-lingering 3 (89 episodes).

**Proof test: 81 passed, 0 failed** (`node scripts/test-siegefirst-a.js`;
was 66/3 — the three failures were instrument/test bugs, not engine
bugs: `raiseAidCrisis` stores the wave as `wave` with no `raiders` field
until after it returns; raider identity by tile breaks when raiders move;
the pillage-caller filter missed the `Object.` receiver prefix. All fixed
in place with new assertions B1f/B2d/B2e, plus 15 more for the analyzer
fixes: show-roster extraction (A14–A19) and the lingerer-ending rules
(A20–A28). All four scripts pass `node --check`.)

**Trajectory neutrality: PERFECT.** Control vs neutral match exactly on
every seed — days, endReason, maxWave, standing, scaleRank, deaths.
The instrument changes nothing about the game.

**Wrap liveness:** 14 of 15 wraps live on the pilot (8/8 seeds each):
tele, havenGrowthDaily, havenRaidTick, contestTick, spawnWorldMonster,
raiseAidCrisis, fireCrisis, resolveAidCrisis, fireContest,
shelterVillagers, shelterEveryoneBut, raidPillage, releaseShelter (5/8),
shelterAllClear (5/8). **shelterMuster never fired on any seed** — its
class is UNKNOWN per the prereg, not 0.

**Pooled control census (8 seeds):** raids 962 calls / 80 fired
(non-fire: roll 351, cooldown 465, pantry-too-low 46, too-few-monsters
20); raiders 366 (waves 1:109, 2:59, 3:100, 4:98); wall damage 31,067
kcal over 264 rows, 65 palisade raids, big raider in all 80 raids;
re-drafted raiders 42, died in draft 0. Pillages 355 calls, ALL gorge —
394,788 kcal over 355 nights (max episode 19 nights). Lingerers 89
episodes (see endings above). Aid crises 80 raised / 77 resolved
(fought 58, moved-on 19), 0 echoes. Crisis fires 304: the-siege 58
(8/8 seeds), breach 212, first-grave 29, hunger-winter 4, blood-on-air 1.
Contests 279 fired: siege 12 (5 seeds, seen on 6), duel 18, gauntlet 14,
whoate 12, hide 10, pit 10, longodds 10, tithe 10. Shelter 40 calls
(28 with a real threat, 12 without). Spawns 494 (w1 169, w2 103, w3 98,
w4 123, w5 1, w6 0). Fights 221 (won 93, lost 99, routed 29; wave-4
fights 104). Deaths 579 (home 415, away 164; by cause-kind monster 447,
villager 128, person 4; the scholar died 103 times). Say lines 1,600
(200/seed, capped on all 8 — see SENSE SAMPLE for the cap's cost).
Snapshots 952, malformed 0, instrument errors 0.

**Per-seed (control):**

| seed | days | end | standing | deaths | raids | raiders | wall dmg | pillage kcal | linger eps | siege contest | the-siege |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 210401 | 118 | village-lost | 199 | 96 | 10 | 45 | 3,871 | 36,286 | 9 | yes | yes |
| 210402 | 150 | survived | 199 | 82 | 11 | 53 | 4,771 | 47,011 | 8 | yes | yes |
| 210403 | 78 | village-lost | 199 | 47 | 8 | 36 | 2,421 | 64,163 | 9 | no | yes |
| 210404 | 150 | survived | 199 | 68 | 12 | 60 | 4,516 | 47,415 | 11 | yes | yes |
| 210405 | 124 | village-lost | 100 | 75 | 10 | 49 | 3,675 | 89,027 | 18 | no | yes |
| 210406 | 135 | village-lost | 199 | 71 | 11 | 49 | 6,138 | 36,100 | 9 | yes | yes |
| 210407 | 88 | village-lost | 199 | 55 | 6 | 31 | 1,769 | 47,386 | 11 | yes | yes |
| 210408 | 124 | village-lost | 199 | 85 | 12 | 43 | 3,906 | 27,400 | 14 | no | yes |

**Run notes.** (a) Run-id labels differ across files: this prereg's
header says fleshout-20261111T1118Z while the adoption assignment says
fleshout-20261111T1815Z. The pilot ran under this prereg's seeds, policy,
and horizon either way; the arm + seed band identify the run. (b) The
control leg hit a host write flap (writes ≥~200B refused for ~15 min):
only seed 210401's file landed on disk; seeds 210402–210408 were
recovered whole from the driver's stdout fallback log with readback
verification, and all 16 per-seed files were re-verified (seed/mode/
days/endReason/maxWave/standing/scaleRank/errors). The neutral leg ran
clean after the flap cleared. (c) The flap also truncated the analyzer's
summary file to 0 bytes mid-write; the analyzer's `--out` write is now
atomic (temp file + fsync + rename) and the summary was regenerated
from the intact per-seed files.

## WALL NUMBERS

- **Wins: 0. National: 0. Table: 0.** No village won, no village reached
  national standing, no table was offered or taken.
- **Wave 4: 8/8 seeds. Wave 5: 0/8** (one wave-5 monster spawned in 494
  spawns; no wave-5 unlock). **Regional: 8/8.**
- **Median survival: 124 days.** Survivals: [78, 88, 118, 124, 124, 135,
  150, 150]. Six villages lost, two survived to the 150-day horizon.
- **Deaths: 579** across the 8 seeds (47–96 per seed).
- **Standing parks at 199 on 7/8 seeds** (210405 stuck at 100). The
  villages climb to regional and stop: the last step to national never
  comes before the roster bleeds out. The scale wall stands — same
  picture as every sibling first-numbers run.

## VILLAGE ASSESSMENT (plain words)

Every village starts with 12 living people and ends with 0–8. Six of
the eight are lost; the two that reach day 150 are shells (3 and 7
people left). The shape of every run is the same: a slow bleed to day
30 (11–12 alive), faster losses through days 30–90 (5–9 alive), then an
endgame played with whoever is left.

People die in fights, not from hunger. 447 of the 579 deaths are by
monsters, led by "villager combat" (24–45 per seed), expeditions, and
"the wild." The scholar — the player character — dies about 13 times
per village (103 total): succession is the norm, not the exception.
Nobody grows into a durable hero; the village keeps inheriting the next
body.

Food is not what kills these villages. Two of them never ran the pantry
dry — 210406 never dropped below 9,086 kcal and ended with 25,664 in
store; 210405 peaked at 112,510 kcal — and both still lost everyone.
210405 is the sharpest case: the biggest pantry in the panel, the most
lingerer episodes (18), the most food gorged away (89,027 kcal), and
still village-lost at day 124 with standing stuck at 100. It starved
for fighters, not calories. The pantry swings wildly everywhere else
too (peaks of 39k–119k, but five seeds end at zero, and three seeds
spend 14–15 days at zero).

The siege itself is a real tax, not a flavor event. Raiders hit Haven
80 times; lingerers camped the treeline for 355 nights and ate 394,788
kcal out of the stores — on 210403 the gorge (64,163 kcal) took more
than the biggest pantry that village ever held at once (40,110). The
palisade does real work (31,067 kcal of wall damage across 65 raids),
and defenders do meet the raiders (58 of 80 crises resolved by
fighting). But the village never turns the corner: fights run 93 won /
99 lost / 29 routed, and wave-4 fights (104 of 221) are where the
roster bleeds out. The village survives by enduring the siege, never
by beating it — and endurance runs out of people first.

What was missing: nobody reaches wave 5; nobody gets strong enough to
stop the bleed; standing parks at 199 and the national step never
comes. The siege is survivable as a siege. It is not survivable as a
road to anywhere.

## SENSE SAMPLE (siege say lines, read not counted)

Sample: 1,600 lines (200/seed, capped on all 8). Read across buckets:
treeline 1,069, raid 360, palisade 110, hold-line 50, siege-word 8,
gorge 3. **Cap warning: the sample is front-loaded** — the last
captured day is 74–114 per seed (runs lasted 78–150 days), so late-run
siege language (day 115+, the wave-4-heavy endgame) is unobserved.

**The-siege crisis line — strong, but one template for the whole panel:**
> [210401 d16] "◈ CRISIS — THE SIEGE. They came in the night for the
> pantry — and the village met them at the door with blades and fire
> and drove them back into the dark. Wealth has a scent. So does
> defiance."
Identical on all 8 seeds, days 9–21, once each. Good line — but the
crisis fires 58 times and its voice fires once per seed. The other 50
fires say nothing distinct.

**The gorge-event line — the best situational line in the sample:**
> [210404 d114] "🌙 Night. The lingering The Eater gorges at the
> treeline — 600 kcal gone from the stores. Endure it (they drift off
> within ~6 nights — the gorge is the price), or send a sortie:
> fighters, rations, real risk."
Names the real monster, the real kcal, the real choice, the real clock.
Same shape on 210405 d87 (The Herald, 979 kcal). Note the bucketing
quirk: this line lands in **treeline**, not gorge (treeline matches
first). The 3 lines the analyzer did bucket as gorge are actually Codex
ability text — "📖 Codex: Gorge — gives no warning — it just moves and
hits. You won't forget this." [210405 d71] — a false positive, not a
gorge event.

**Hold the line — a workhorse template, repeated to numbness:**
> "The watch holds the wall. You sleep through the worst of it — or
> would have, if the shouting had let you."
47 of the 50 hold-line lines are this one sentence, on nearly every
raid night, identical on every seed. Coherent, but a player reads it
dozens of times and stops reading. The two exceptions are genuinely
informative (a Rally ability grant: "📖 LEARNED: Rally (Level 1). …
you look at the people standing with you and you do not run."
[210402 d60]) and one striking outlier whose context is unclear:
> [210408 d53] "THE WALL OF HEADS GROWS. EACH ONE TEACHES THE NEXT
> ONE HOW TO DIE."

**Palisade — mostly situational, and the numbers are real:**
> [210401 d8] "◈ SYSTEM: 'RATINGS DIP. The audience wants STAKES —
> pointed ones. A PALISADE. Stockpile 14,000 kcal, 350 wood and 60
> stone. Walls make such good television.'"
> [210401 d16] "🗣️ Sam to Ruby, by the fire: 'The pantry's the
> thing. We don't raise The Palisade on empty shelves — 10,200 of
> 14,000 kcal.'"
> [210401 d27] "🐗 RAID — 3 raiders (Big Loud, The Bright Bastard,
> Spool) hit Haven in the night, drawn by the smell of the pantry!
> The palisade's stakes take their toll as they come over the wall."
The SYSTEM quest voice is in-fiction and consistent (day 8 on every
seed; "PALISADE: ONLINE. Pointy!" follows when the stockpile lands).
Villager lines carry real counts (stone needed 44–58; pantry 4,700–
11,892 of 14,000). Raid lines name the actual raiders — but twins
read as duplicates ("The Reunion, The Reunion" [210401 d72];
"Don't-Look, Don't-Look" [210402 d24]), so the reader cannot tell two
beasts from one. The pre-palisade raid template is correctly distinct
("No walls. No warning but the noise."). One template over-fires:
"Full shelves, full bellies. Mending the palisade today — the fence
won't fix itself." repeats whenever the pantry is full, before and
after the wall is built.

**Raid bucket mixes two different raids.** Monster raids ("🐗 RAID — 4
raiders (Choir Toad, Drum-Belly, Flashbulb Moth, Highbeam Deer) hit
Haven in the night…" [210405 d13]) share the bucket with inter-village
raids: "🌙 Raid — Thornfield came in the night from the east. They
carried off ~750 kcal from the pantry. Nobody's dead, but the message
is clear: the ground is theirs too, and they're done asking. (Trust
-10.)" [210406 d5]. Both are coherent on their own terms; the bucket
conflates them. The big-raider warning is good and situational:
"🐗⚠️ One of them is bigger than the usual teeth at the door — Spool
came with this raid, and the wall was not built for its kind."
[210401 d27]. The aid-crisis prompt is voiced by a named villager:
"🛟 Ricardo looks up from the fire. 'And now a raid, on top of it all.
The options stand — pick, before we lose the chance.'" [210404 d9].

**Treeline — named and situational, drowned in two filler templates.**
404 distinct lines of 1,069. The per-monster lines work ("The Loud
Thing stops at the treeline — pacing, unwilling. The walls end the
argument. It's still out there." [210402 d90]; "Nobody met The Eulogy
— it's still out there at the treeline. It'll gorge every night until
it's driven off." [210405 d87, recurring]). But two templates are 28%
of the whole bucket: "Night. The treeline is just a sound now. The
fire is the whole argument against it." (183×) and "The village is
rattled. Everyone's jumpy — eyes on the treeline." (114×). They say
nothing about the night's events and they say it 297 times.

**One coherence wrinkle:** "Nobody met X — it's still out there at the
treeline. It'll gorge every night until it's driven off." promises the
lingerer only leaves if driven off — but the gorge-event line says
"they drift off within ~6 nights." Both are true (drift ends it; driving
it off ends it sooner), but a player reading the two side by side gets
contradictory instructions about whether to act.

**Verdict:** the siege's voice is strongest where it names real things
(real raiders, real kcal, real choices, real villagers) and weakest
where it repeats itself: one the-siege template for 58 fires, one watch
line for 47 raid nights, two treeline fillers for 28% of the night
voice. Nothing in the sample is nonsensical or out of fiction; the
problem is repetition, not incoherence.

## METRIC REVIEW

**Was "zero unclassified rows" the right bar for a first-numbers
census? Yes — it did its job.** A looser bar (e.g. "classify 95%") would
have let the analyzer silently drop 73 of 279 contest ticks — a quarter
of the tick stream — and 6 of 89 lingerer endings, and the census would
have reported contest and lingerer numbers that were wrong by
construction. The strict bar forced the analyzer to learn the engine's
real vocabulary instead of grading its own ignorance as clean. The
failure it produced was diagnostic, not fatal: the instrument's data was
complete in both clusters; the classifier's knowledge was incomplete.
The bar is worth keeping for the next first-numbers arm — with one
amendment: the verdict should name the *kind* of gap (missing roster
vs missing telemetry path), because the fix for each is different.

**Instrument gaps found (all in the analyzer's knowledge, not the
instrument's data — except the last):**
- The tick serves two rosters (contests.json + G.showPool) and a
  pseudo-contest (__summons). The analyzer knew one. Fixed by
  extracting show ids from the showPool block at load.
- `fieldFight` emits no `combat_start` telemetry, so villager/sortie/
  patrol kills are invisible to any fight-row census. Death rows are
  the only witness. Fixed in the analyzer (death-row `killed` rule);
  the engine gap itself is a finding, not an analyzer bug.
- The moved-on safety valve clears young lingerers; the drift rule
  alone misses it. Fixed (`moved-on-valve` rule).
- Say bucketing is first-match, not semantic: gorge-event lines land in
  treeline, the gorge bucket catches Codex ability text, and the raid
  bucket mixes monster raids with inter-village raids. The counts are
  unaffected (they come from instrument rows, not say buckets), but the
  SENSE SAMPLE had to be read bucket-aware. Future arms should bucket
  say lines by their source event, not by keyword.
- The 200-line say cap front-loads the sample (last captured day 74–
  114; runs lasted to 150). Late-run siege language is unobserved. Raise
  the cap or sample across the run, not just the first 200 lines.
- `shelterMuster` never fired in 8 seeds: its class stays UNKNOWN. A
  dead wrap's zero is never evidence — the prereg's rule held.
- The instrument still misses a re-drafted raider that takes NO damage
  in its raid (no palisade, unmet): nothing observable changes, so it
  is not recorded. Documented in the instrument header; the count of
  re-drafts (42) is a floor, not a ceiling.
- Twin identity: death rows and say lines carry the def id, so a
  `killed` call can misattribute among twins and raid lines print the
  same name twice. Census-level, noted, not fixed.
- The analyzer's `--out` write was not atomic and the flap truncated
  the summary to 0 bytes. Now temp-file + fsync + rename; the summary
  was regenerated from intact per-seed files. Lesson: measurement tools
  must not be able to destroy their own prior output.

**What the bar did not catch:** nothing in this run suggests the
instrument over-counts or misattributes a class it claims — the
trajectory-neutrality check (control ≡ neutral on all 8 seeds) and the
proof fixture (81/81) both held. The one genuinely unexplained row
(210405 redactor) is a telemetry gap in the engine's fight paths, not a
bar failure: no rule can classify an ending the instrument never saw.

## FINDINGS (for the coordinator to append to hidden_files/sim-findings.md)

- ShowPool roster was missing from analyzer knowledge — the contest tick serves contests.json AND G.showPool() plus __summons; fixed in-analyzer, but future census arms must classify ticks against both rosters (sim-siegefirst-a).
- fieldFight emits no combat_start telemetry — villager/sortie/patrol kills are invisible to fight censuses; death rows are the only witness (sim-siegefirst-a).
- Moved-on safety valve (comms.js:828–837) clears young lingerers — the ~6-night drift rule alone misses it (sim-siegefirst-a).
- One lingerer ending genuinely unexplained: seed 210405 redactor m271 (days 94–95, vanished day 96 with its twin reunion in the scholar's lost fight; no death row, no resolve) — needs an instrument-level witness for the clearing path (sim-siegefirst-a).
- Say-line cap (200/seed) front-loads the sample; late-run (day 115+) siege language unobserved — raise the cap or sample across the run (sim-siegefirst-a).
- Say bucketing misfiles by keyword: gorge-event lines land in treeline, the gorge bucket catches Codex ability text, the raid bucket mixes monster raids and inter-village raids (sim-siegefirst-a).
- Treeline filler: two templates are 28% of all treeline lines (183× + 114×) — the night voice repeats itself (sim-siegefirst-a).
- Twin names duplicate in raid lines ("The Reunion, The Reunion") — the reader cannot tell two beasts from one (sim-siegefirst-a).
- shelterMuster never fired in 8 seeds — the muster beat is unobserved; its class is UNKNOWN, not 0 (sim-siegefirst-a).
- No wave-6 spawns in 494 spawns; one wave-5 spawn total — the wave-6 siege scaffold remains fiction-only (data only) (sim-siegefirst-a).
- The gorge took 394,788 kcal in 355 nights — the treeline tax is real and largest on the richest village (210405: 89,027 kcal) (sim-siegefirst-a).
- The-siege crisis fired on 8/8 seeds (58×) but its say line fired once per seed — the crisis is common, its voice is a single template (sim-siegefirst-a).
- Villager-caused deaths are 128 of 579 (22%) — what kills villagers at villagers' hands needs its own census (sim-siegefirst-a).
- Standing parks at 199 on 7/8 seeds — the scale wall stands (regional 8/8, national 0/8) (sim-siegefirst-a).
- Trajectory neutrality confirmed: instrument changes nothing (control ≡ neutral on all 8 seeds) (sim-siegefirst-a).
- The "Nobody met X — it'll gorge every night until it's driven off" line contradicts the gorge line's "they drift off within ~6 nights" — a player reading both gets contradictory instructions about whether to act (sim-siegefirst-a).
