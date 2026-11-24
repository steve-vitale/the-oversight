# Confirm the standing-gearready pilot on a fresh band — Loop B, run fleshout-loop-b-20261124T0630Z, arm sim-standingconfirm-b (CONFIRM)

Axis: winnability chain. CONFIRM-ONLY arm: zero src/js changes.
Anchor: HEAD `60f6e7436` at prereg time; instruments reused from
branch sim-standing-gearready-b, commit `f74931e6` (verified
identical on this tree's base — `git diff f74931e6 HEAD` empty for
the four instrument files + `scripts/policies/competent.js`;
proof `scripts/test-standing-gearready-b-20261124.js` 31/31 before
the leg). Policy `scripts/policies/competent.js` `{competent}`
VERBATIM, default env. Seeds 109310–109325 (16 — the named band
109309–109324 was NOT fresh: seed 109309 was spent as a dedicated
probe by journey-deepening-r278, so the band was shifted by one;
freshness re-verified, see prereg). Horizon 150 days, death-aware.
Balanced panel (§15): INAPPLICABLE — a re-measure on a fresh band
with the same instrument, no before/after change; no comparison
is fabricated.

Prereg: `evidence/2026-11-24/sim-standingconfirm-b-prereg.md`
(commit `af632cf97`, before any judged sim). Pilot:
`evidence/2026-11-24/sim-standing-gearready-b.md` (8 seeds
109301–109308, DIAG-GO). Pilot numbers are NOT pooled with this
arm's numbers and NOT cited as this arm's baseline; comparisons
below are descriptive only.

## Verdict — CONFIRM-PARTIAL (5 of 6 frozen bars pass; bar 4 FAILS)

| # | Frozen bar | Result |
|---|-----------|--------|
| 1 | 199 stall recurs on ≥ 9/16 seeds | **PASS — 13/16** |
| 2 | ALL 199-hold days defer5 | **PASS — 642/642 defer5, 0 cap, 0 unclassified** |
| 3 | National block classified on every seed, 0 UNCLASSIFIED; no-polity on ≥ 2/3 of regional seeds | **PASS — 16/16 classified, 0 UNCLASSIFIED; no-polity 14/15 regional (93%)** |
| 4 | Wave-5 faced on every unlocked seed | **FAIL — 3/4 faced; 109314 unlocked day 138 and never faced wave 5 in its 12 remaining days** |
| 5 | Diplomacy 0 everywhere (max links ≤ 1) | **PASS — diplomacy 0 on all 16 seeds; max active links 1 (0 on 109316)** |
| 6 | Instrument health (complete decomposition, 0 unclassified deltas / releases / errors / mismatches) | **PASS — 0 on every count, all 16 seeds** |

The pilot's core picture CONFIRMS on a fresh band at twice the
seeds: the 199 stall is the readiness deferral, never the plenty
cap; national is blocked because no polity ever forms; diplomacy
is structurally zero. The one thing that does NOT confirm is the
pilot's 2/2 wave-5-facing rate: on this band the door opens 4
times and wave 5 is faced 3 times. The miss is narrow (one seed,
12 days of post-door runway) and is judged as written — no
in-run re-scoring (§14); the window question is a metric-review
note for the next run's bar, not a rescue of this one.

## Judged leg (current anchor only)

Proof `scripts/test-standing-gearready-b-20261124.js` 31/31
before the leg. Summarizer
`scripts/standingconfirm-b-summarize-20261124.js` (new, this arm)
over the reused analyzer.

Per-seed (ready = readiness-5-ready days; best = best capped
day; end bars = final snapshot; d199 = days at gated 199):

| seed | days | end | scale | maxW | endUW | ready days | door | best capped (war/diplo/plenty) | best raw | war kills (w3/w4/w5) | feasts | ladder end | d199 (hold) | national block |
|------|------|-----|-------|------|-------|------------|------|-------------------------------|----------|-------------------|--------|------------|-------------|----------------|
| 109310 | 150 | survived* | regional | 4 | 4 | 0 | — | 325 (325/0/0) | 325 | 16 (15/1/0) | 0 | National 59 | 62 (defer5) | no-polity |
| 109311 | 150 | survived* | regional | 5 | 5 | 14 (117–130) | d117 | 500 (400/0/100) | 520 | 17 (12/5/0) | 6 | National 56 | 65 (defer5) | no-polity |
| 109312 | 150 | survived* | regional | 5 | 5 | 61 (89–90, 93–151) | d89 | 675 (575/0/100) | 675 | 26 (16/8/2) | 5 | National 78 | 47 (defer5) | no-polity |
| 109313 | 97 | lost | regional | 5 | 5 | 10 (65–67, 84–90) | d65 | 360 (300/0/60) | 360 | 11 (6/4/1) | 3 | National 60 | 0 | no-polity |
| 109314 | 150 | survived* | regional | 5 | 5 | 0 | d138† | 385 (325/0/60) | 385 | 16 (12/4/0) | 3 | National 63 | 53 (defer5) | no-polity |
| 109315 | 96 | lost | regional | 4 | 4 | 0 | — | 150 (150/0/0) | 150 | 6 (6/0/0) | 0 | Regional 39 | 0 | no-polity |
| 109316 | 49 | lost | village | 3 | 3 | 0 | — | 75 (75/0/0) | 75 | 3 (3/0/0) | 0 | Regional 35 | 0 | never-regional |
| 109317 | 150 | survived* | regional | 4 | 4 | 0 | — | 325 (325/0/0) | 325 | 14 (13/1/0) | 0 | National 59 | 62 (defer5) | no-polity |
| 109318 | 150 | survived* | regional | 4 | 4 | 0 | — | 325 (325/0/0) | 325 | 16 (13/3/0) | 0 | National 75 | 34 (defer5) | no-polity |
| 109319 | 150 | survived* | regional | 4 | 4 | 0 | — | 215 (175/0/40) | 215 | 7 (6/1/0) | 2 | National 79 | 52 (defer5) | no-polity |
| 109320 | 150 | survived* | regional | 4 | 4 | 0 | — | 270 (250/0/20) | 270 | 10 (8/2/0) | 1 | National 57 | 49 (defer5) | no-polity |
| 109321 | 122 | lost | regional | 4 | 4 | 0 | — | 375 (275/0/160) | 435 | 12 (8/4/0) | 8 | National 48 | 75 (defer5) | no-polity |
| 109322 | 150 | survived* | regional | 4 | 4 | 0 | — | 240 (200/0/40) | 240 | 9 (8/1/0) | 2 | National 49 | 24 (defer5) | no-polity |
| 109323 | 68 | lost | regional | 4 | 4 | 0 | — | 205 (125/0/80) | 205 | 5 (5/0/0) | 4 | National 42 | 6 (defer5) | season-gate |
| 109324 | 150 | survived* | regional | 4 | 4 | 0 | — | 300 (300/0/0) | 300 | 13 (13/0/0) | 0 | National 80 | 62 (defer5) | no-polity |
| 109325 | 150 | survived* | regional | 4 | 4 | 0 | — | 225 (225/0/0) | 225 | 10 (8/2/0) | 0 | National 53 | 51 (defer5) | no-polity |

\* "survived" = alive at the 150-day horizon cap, not a win and
not ready. † 109314's door opened with ZERO snapshot-ready days
(see "The door that opened on a dead man's gear" below) — the
release is natural (release lines day 138, peak 5 before the
end-of-run call, `endCallMovedPeak=false`), not an artifact.

Pooled: ready days 85 (on 3 seeds). Door opens 4 (109311 d117,
109312 d89, 109313 d65, 109314 d138). Capped >= 200 on 14/16
seeds. Days at gated 199: 642 — ALL defer5, 0 cap, 0 defer4-days at 199. Ten seeds END at
exactly 199 (109310, 109317, 109318, 109319, 109320, 109321,
109322, 109323, 109324, 109325) — the pilot's count was 4/8. Wave-4 faced 15/16, wave-5 unlocked 4/16, wave-5
faced 3/16, wave-5 kills 4 (109312: 2, 109313: 2). Wins 0/16,
national 0/16 (scaleRank), table 0/16. Median survival 150 days
(CENSORED — 11/16 survived to horizon; sorted 49, 68, 96, 97,
122, 150×11), max 150 (censored). Deaths over 1292
person/villager deaths: "villager combat" 502, "expedition" 424,
"combat" 195, "the wild" 73, "monster" 34, "the arena" 11,
starvation 10, "a wound that wouldn't close" 9, contest 7,
sickness 6, "ambush" 5, "a stranger" 4, thirst 2, "Gavel" 2,
plus 8 singletons ("Buffering", "experiment", "Ad Break",
"Highbeam Deer", "The Focus Group", "the expedition",
"lockjaw", "The Redactor"). Combat-family ("villager combat" +
"combat" + "monster") is 731/1292 = 56.6%; expedition alone is
424/1292 = 32.8%.

## Answers to the frozen bars

### (1) The 199 stall recurs — 13/16, all defer5

Thirteen of sixteen villages sit at gated 199, for 642
village-days in total, first-199 days 42–128. The three that
never stall are the ones that never get there: 109313 opens the
door the day its points cross 200 (never holds at 199),
109315 tops out at 150, 109316 dies at day 49 with 75. The
stall rate (81%) is a touch above the pilot's 75% — the same
shape, twice the seeds.

### (2) The hold is the readiness deferral, every single day

642/642 days at 199 are `defer5`; 0 are the plenty cap. The
plenty cap TRIMS but never BINDS: raw exceeds capped on only two
seeds (109311: 520 vs 500; 109321: 435 vs 375 — the cap eats 20
and 60 points) and on neither seed does raw >= 200 with capped
< 200, so the cap never holds the door at 199. On the
standing-ok-but-not-ready days (703 across the band, ~44/seed —
pilot: 368 over 8, ~46/seed) the short bar is VETERANS on all
703 days, without exception. Armor and weapons are also short
often (109321: weapons 35, armor 13; 109311: armor 15, weapons
14; 109314: weapons 14, armor 14; 109322: armor 21, weapons 24)
— but veterans is the bar that is short on every single held
day on every seed. The 199 is a veterans hold wearing a points
number, confirmed.

### (3) National is blocked by no polity — 14/15 regional seeds

Every seed gets a named block, 0 UNCLASSIFIED: no-polity 14,
never-regional 1 (109316, dead day 49 before any link),
season-gate 1 (109323, dead day 68 with the season gate still
closed until day 84). Among the 15 seeds that reach regional,
14 are no-polity — 93%, over the 2/3 bar with room. Supporting
detail, all 16 seeds: max active links 1 (0 on 109316), max
seasoned links 1 (on 7 seeds), max counting links 0, max Haven
polity size 0, `pendingNational` NEVER present on any snapshot
of any seed (no national beat ever staged), `scaleRefused`
never set, `nationalLive` never set. The season gate was open
for weeks on 14 of the 15 regional seeds — the gate is not the
blocker. And the region is not empty: a foreign polity exists
(count 1) on 15/16 seeds — the BELONG road's precondition, a
realm to join, standing there while Haven, with one link to a
different village, never becomes anyone's subordinate. The
pilot's mechanism (polity never forms) reproduces exactly.

### (4) Wave-5 faced on every unlocked seed — FAILS, 3/4

Three of the four door-openings lead to wave-5 contact:
109311 engages (1 engagement counted by the horizon, 0 kills),
109312 engages (3 engagements, 2 kills — devon_okafor day 109,
luis_fernandez day 126), 109313 engages (3 engagements, 2 kills
— both by gen_wa9lzr8 on day 91). 109314 opens the door day 138
and records ZERO wave-5 engagements in its 12 remaining days to
the horizon. The pilot's 2/2 does not survive the bigger band.
The miss is as narrow as a miss gets — one seed, twelve days —
but the bar as frozen has no post-door window allowance, and it
is judged as written. See metric review for the window question.

### (5) Diplomacy is zero, everywhere, again

Diplomacy points are 0 on every seed at every snapshot. Fifteen
seeds form exactly ONE link each (a plain haven↔village link,
kind null); 109316 forms none in 49 days. A seasoned link
appears on 7 seeds — seasoned, but one lone link can never be a
realm (`polityOf('haven')` needs >= 3 seasoned subordinates),
so it scores 0. No seed ever has 2 links, let alone 3. War is
the whole bar on 14 seeds (best-day splits run 150–575 war, 0
diplomacy, 0–160 plenty); feasts pay the rest (47 major feasts
across 16 seeds, ~1 per 51 village-days). The link-forming
rate, not the seasoning rate, is the zero — third band in a row
to say so (99107, gearready pilot, this confirm).

### (6) Instrument health — clean

0 unclassified standing deltas, 0 instrument errors, 0
unclassified release/door events, 0 veteran-recount mismatches
(`mismatchDays` 0 on all 16), 0 deferral mismatches, 0
reconciliation mismatches. Every peak transition to 5 carries
its release lines (2 each, both wordings, same day). Ladder
track totals and tribute markers recorded on all 16 seeds (0
tribute-standing contributions found, as in the pilot — tribute
feeds no standing reader).

## The door that opened on a dead man's gear (109314)

The one seed that breaks the pilot's clean story deserves its
own paragraph, because it is a real mechanism, not a data
quirk. 109314 sits at 199 for 53 days, then on day 138 the
door opens — release lines stamped, peak 4→5 — while the
instrument's readiness derivation says the village was NEVER
ready on ANY snapshot (0 ready days; day-138 snapshot short on
armor, weapons, AND veterans, with 1 living veteran). The
instrument calls the engine's own `waveCombatReadiness(5)`, so
this is not a derivation drift: it is TIMING. The day-by-day
record pins it. Day 137: visjoin_136 kills a wave-4 monster in
an aid-crisis fight and becomes the village's second veteran
while omar_farouk is still alive — two living veterans, the
first time the pair exists. Day 138: omar_farouk dies "the
wild", and tashi_sherpa dies "the wild" the same day. The
release check (`villageStandingTotal()`, called during play)
ran on day 138 BEFORE those deaths, when the village
momentarily had 2 living veterans and — the two dead men were
carrying the missing armor and weapons — 4 armored and 6 armed.
By the day-138 snapshot both men are dead, the bars are short
again, and the village that opened the door no longer exists.
The door is one-way (peak ratchet), so it stays open — onto a
village with 1 veteran, 2 armored, 4 armed, which then never
meets wave 5 in 12 days. Two consequences: (a) the door can
open on a readiness state that lasts less than a day, and daily
snapshots cannot see it — a named instrument limitation; (b) a
door opened this way opens onto nothing, which is exactly the
bar-4 miss. The pilot's "door opens the same day readiness
completes" is true for 3 of 4 doors here (109311, 109312,
109313 all open on ready days); the fourth opens the same day
readiness completes AND dies.

## The four door openings, day by day

109311: capped >= 200 from day 52, held at 199 for 65 days.
Day 117: 2 living veterans, all bars met, capped 500 — peak
4→5 (release lines stamped day 116, the day-before case). 14
ready days, then readiness breaks again (veterans back to 1);
0 wave-5 kills in 1 engagement by the horizon. Holds to day
150 with capped 500, still regional, still no polity.

109312: capped >= 200 from day 42, held 47 days. Day 89: all
bars met, capped 675 — peak 4→5. The village HOLDS: 61 ready
days, veterans rise to 3, and it kills TWO wave-5 monsters
(devon_okafor day 109, luis_fernandez day 126) across 3
engagements. Richest standing on any band in this program
(capped 675), still regional, still no polity, still no table.

109313: never sits at 199 — readiness completes the same day
capped crosses 200, day 65, and the door opens at once. 10
ready days across two runs (65–67, 84–90); kills TWO wave-5
monsters, both by gen_wa9lzr8 on day 91, across 3 engagements;
loses the village day 97. The door without the hold: when the
people are ready, the points are never the wait.

109314: see above — the door opens day 138 on a readiness
state that dies the same day; 0 wave-5 engagements in 12 days.

## Village assessment (plain words)

Sixteen villages playing competently for one to five months.
Thirteen of them sit at exactly 199 for weeks on end — the
number itself a holding pattern: the points are there, the
people are not. They kill their way to standing and by two
months in most have bought the fifth draft twice over in blood
alone, and the System's door stays shut because the village
cannot field two living people who have killed the fourth
draft's monsters at the same time. Four villages manage it —
two killers alive together — and the door swings open every
time. One of those villages (109313) kills two of the fifth
draft's monsters and then dies anyway; one (109312) holds, kills
two, and rides out the horizon with nearly seven hundred
standing points and no realm to spend them in; one (109311)
opens the door and never converts; and one (109314) opens it on
the strength of two men who die the same day, and meets nothing
at all. Nobody builds a second bond with another village —
fifteen villages manage one link each, one manages none — so
the bonds half of the standing bar stays at zero everywhere,
and the one link that ripens is a lone courtship, not a realm,
and scores nothing. A foreign realm exists in the region the
whole time, and nobody in Haven ever walks over to join it.
Feasts are rare treats, not a road. The villages explore
constantly and all that exploring moves the seat ladder to
National while the rank itself never moves at all. That is the
wall now, stated plainly and confirmed on a second band: not
standing, not the door — veterans alive together, and a polity
that never forms.

## Wall numbers (this confirm)

Wins 0/16. Villages lost 5/16, survived to horizon 11/16.
National (scaleRank) 0/16, table 0/16. Wave-5 unlocks 4/16,
wave-5 faced 3/16, wave-5 kills 4 (two seeds, two monsters
each). Wave-4 faced 15/16. Readiness-5-ready snapshots 85, on
3 seeds (109311: 14, 109312: 61, 109313: 10), 0 on the other 13
seeds. Capped >= 200 on 14/16 seeds. Days at gated 199: 642
(all defer5). Median survival 150 days (censored; max 150,
censored). These are the confirm's own numbers on anchor
`60f6e7436`, not pooled with the pilot.

## Sense-test

Villagers act like people in the traces that matter here: they
kill, retell the kills at the fire by name ("Luke has been
quiet all evening, and now everyone knows why. 'Rut King — I
put it down today.'", 109310 d16; "Ivy has been quiet all
evening... 'Drum-Belly — I put it down today.'", 109313 d12),
and the System holds the fifth draft open with the honest short
bar. Three small oddities, all voice, none a standing finding:
(1) the door fires TWO release lines on the same day, both
saying the same thing in different words, on all 4 doors —
the doubled announcement the pilot already filed; (2) the
fire-beat frame repeats verbatim ("has been quiet all evening,
and now everyone knows why") with only the name and beast
changing — the same repeated-frame class the pilot filed;
(3) kill beats sometimes name the killer by description instead
of name ("the man in his 60s has been quiet all evening...",
109311 d7; "the woman in her 50s, with a scarred cheek...",
109315 d7; "the person in their 50s...", 109319 d7) — the
village knows the person well enough to tell their story and
not well enough to say their name. None is chased here.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- BAR 4 AND THE POST-DOOR WINDOW: the frozen bar ("wave-5
  faced on every unlocked seed") has no minimum post-door
  window. 109314's door opened day 138 with 12 days to the
  horizon — wave 5 may simply not have arrived yet, and the
  band cannot distinguish "never faces" from "hasn't faced
  YET". The miss stands as judged. The next run's bar should
  judge facing only on seeds whose door opened with ≥ 30 days
  of runway (or before day 120), and should record
  post-door-days-to-first-engagement as its own number.
- TRANSIENT READINESS (109314): the door can open on a
  readiness state that lasts less than a day; daily snapshots
  cannot see it. The release is still classified correctly
  (natural release, lines + peak agree, end-call did not move
  the peak), but the instrument's "ready days" count UNDERSTATES
  door-opening readiness on seeds where the ready state dies
  the same day. A future instrument could snapshot on the
  release event itself (readiness at the moment of the release
  line). Appended to sim-findings.md as an open observation.
- DOOR WITHOUT THE HOLD (109313): a village can open the door
  without ever sitting at 199, when readiness completes the
  same day capped crosses 200. The 199 stall is one path to the
  door, not the only path; the stall rate (13/16) and the door
  rate (4/16) are different numbers and should stay that way.
- MEDIAN: 150 is CENSORED (11/16 survived to the horizon).
  Report it as "150 (censored)", never as a survival claim.
  The pilot's 122.5 was uncensored in the same sense only
  because 5/8 died; the two medians are not comparable as
  survival numbers.
- PLENTY CAP: cap-bite days 0 on all 16 seeds, in the pilot's
  sense (no day where raw >= 200 with capped < 200). But raw
  EXCEEDS capped on 2 seeds (109311 by 20, 109321 by 60) —
  the cap trims the total, it never holds the door. The two
  senses should be named separately in future evidence
  ("cap trims X points" vs "cap holds the door Y days").
- SEASON-GATE (109323): the classifier names season-gate when a
  seed dies with the gate still closed (regional day 55, gate
  day 84, died day 68). That is the prereg's definition,
  honored — but it means season-gate here is a statement about
  dying young, not about the gate blocking a live village.
- DEATH-CAUSE SHAPE: expedition 32.8% (pilot 37.5%),
  combat-family 56.6% (pilot 53%) — the same shape within
  noise. The pilot's open question (anchor move vs labeling
  shift) stands, unresolved by this corpus.
- SNAPSHOT CADENCE / DAY DRIFT: as in the pilot, snapshots are
  ~daily but not strictly calendar-daily (149 snapshots over
  150 game days on 109310; 151-day last snapshots on survived
  runs); wall counts use the analyzer's `days` field, as
  frozen.

## Next blanks, in order

1. Veterans alive TOGETHER (the binding bar, 703 days): why
   villages hold at most 1 living veteran for months — killers
   die within days of blooding (109314's pair dies the day the
   door opens), pairs never overlap. Same blank as the pilot's
   #1, now confirmed on 16 seeds. Coordinate with, do not
   duplicate, the win-fielddmg and win-allyjoin lanes.
2. Diplomacy is structurally zero: villages form at most ONE
   link in 49–150 days, and one link can never be regional+.
   Third band to say so. The build question (link formation)
   is the open item.
3. BELONG road, unjoined: a foreign polity (count 1) exists on
   15/16 seeds while Haven's polity stays null. Next arm:
   record foreign-polity MEMBERSHIP (is Haven's one link to
   the foreign primary? what would joining cost?) — this arm
   recorded the count only, as the pilot did.
4. Wave-5 facing after unlock is now PARTLY open again: 3/4
   faced, 1 un-faced with only 12 days of runway. The open
   question is whether a village that opens the door late can
   face wave 5 at all — the next confirm's bar needs the
   post-door window, and the conversion question (kills, not
   contact) now has 4 kills on 2 seeds to build from.

## Proof and landing

- Proof: `scripts/test-standing-gearready-b-20261124.js` — 31/31
  PASS (reused, re-run before the leg). Summarizer:
  `scripts/standingconfirm-b-summarize-20261124.js` (new, this
  arm; thin wrapper over the reused analyzer, no instrument
  change).
- Commits (this worktree branch sim-standingconfirm-b;
  coordinator merges via --ff-only; ready to merge, pending
  ship — no push, no bump, no live verification by this
  worker):
  - `af632cf97` sim-standingconfirm-b prereg (before any judged sim)
  - (corpus + evidence commits follow)
- Files: prereg + evidence in
  `evidence/2026-11-24/sim-standingconfirm-b*.md`; per-seed JSON
  in `evidence/2026-11-24/perseed-standing-gearready-b/` (16
  files, `-standingconfirm-b` in the RUN slot, anchor
  `60f6e7436`).
- Telemetry deviation check (body step 10): NOT APPLICABLE in
  the pilot's sense — the same refusal applies (sweep recorder
  rows carry top-level anchorCommit; the scale-wall baseline
  carries a DO NOT compare note for pre-seat substrates).
  The wall numbers above are the report.
