# Standing accumulation on gear-ready seeds — Loop B, run fleshout-loop-b-20261124T0530Z, arm sim-standing-gearready-b

Axis: winnability chain. DIAG-ONLY arm: zero src/js changes.
Anchor: prereg HEAD `e5dd61e96`; instruments committed `f74931e6`
(zero src/js — game code identical); corpus anchor `f74931e6`.
Policy `scripts/policies/competent.js` `{competent}` VERBATIM,
default env. Seeds 109301–109308. Horizon 150 days, death-aware.
Balanced panel (§15): INAPPLICABLE — pure diagnostic, no
before/after change; no comparison is fabricated.

Prereg: `evidence/2026-11-24/sim-standing-gearready-b-prereg.md`
(commit `32a8ec8bc`, before any judged sim).

## Verdict — DIAG-GO

All six prereg legs pass: 8/8 seeds with a complete per-day
standing decomposition AND a complete per-day national
classification; every standing delta reconciled to a kill /
link-transition / feast event (0 unclassified deltas, 0
breakdown-math mismatches on any seed, 0 gated-derivation
mismatches); both wave-5 releases classified (peak transition
day 80 on 109301, day 92 on 109306, each with its release lines
captured in the uncapped stream); 0 veteran-recount mismatches,
0 deferral disagreements, 0 instrument errors; every seed gets
a named national block (6 no-polity, 2 never-regional, 0
UNCLASSIFIED). The 199 stall RECURS on current master — 6/8
seeds sit at gated 199, 311 village-days in total, ALL of them
the readiness deferral (defer5), ZERO the plenty cap — and the
rank step is now decomposed: the polity never forms (at most
ONE link per village, zero counting links, Haven polity size 0
on all 8 seeds), so no national beat ever stages, while a
foreign polity exists in the region (count 1 on all 6 regional
seeds) that Haven never joins. Standing is not the wall; the
rank definition is — exactly as the refreeze band read it, now
with the mechanism named day by day.

## Calibration gate — the pattern moved, the verdict did not

The 99107 numbers (Nov 14) and the refreeze numbers (Nov 22)
are previous anchors, NOT pooled with this arm's numbers and
NOT cited as this arm's baseline. This arm's baseline is its
own judged leg below, on anchor `f74931e6`. What moved since
99107: the door now opens TWICE on an 8-seed band (2/8 vs 1/8)
and wave 5 is now FACED on both unlocked seeds (2/2, vs 0/1) —
but the shape is unchanged: standing piles up in blood, the
door opens the day readiness completes, and the village then
cannot hold two living veterans together.

## Door / release rule, as found in code (not taken on faith)

From `src/js/standing.js` at this anchor (unchanged since the
99107 anchor — `git log --since 2026-11-14` is empty for it):
standing = war (25 per wave-3+ ledger kill point) + diplomacy
(34 per seasoned REGIONAL+ link) + plenty (20 per major feast,
quality >= 1); t4 = 100, t5 = 200; plenty counts at most 100
toward the t5 bar (capped total). Release to wave 5 requires
capped >= 200 AND readiness-5 ready (armored 4 @ P>=15, armed
6, tricks 3, veterans 2 living); while capped >= 200 but not
ready the gated total holds at t5-1 = 199 (`kind: 'defer5'`);
raw >= 200 with capped < 200 holds at 199 as well (`kind:
'cap'`). `unlockedWave() == 5` additionally requires the
wave-3 rung (day >= 25 AND wave-2 ledger >= bar) AND wave-4
faced. The five ladder tracks feed the LADDER
(`src/js/ladder.js`), NOT standing; tribute feeds no standing
reader in src/js. Both zeros were VERIFIED empirically below,
not assumed. National rank (docs/SCALE.md +
`src/js/hierarchy.js`): `scaleRank()` reads the `nationalLive`
flag, set only when a polity stages its played beat
(`state.pendingNational`) and the beat is answered; one rung
per season (national cannot stage until `networkLiveDay + 30`);
seasoned = 30+ days AND trust 40+.

## Judged leg (current anchor only)

Proof `scripts/test-standing-gearready-b-20261124.js` 31/31
before the leg (decomposition math, per-type cap, link
seasoning / regional+ classification, feast classification,
release classification incl. the uncapped release stream,
gated / hold-kind derivation, national-blocker classification,
standard median, live-harness smoke). Instruments commit
`f74931e6`.

Per-seed (ready = readiness-5-ready days; best = best capped
day; end bars = final snapshot; d199 = days at gated 199):

| seed | days | end | scale | maxW | endUW | ready days | door | best capped (war/diplo/plenty) | best raw | war kills (w3/w4/w5) | feasts | ladder end | d199 (hold) | national block |
|------|------|-----|-------|------|-------|------------|------|-------------------------------|----------|-------------------|--------|------------|-------------|----------------|
| 109301 | 126 | lost | regional | 5 | 5 | 8 (80–87) | d80 | 325 (225/0/120) | 345 | 10 (6/4/0) | 6 | National 56 | 11 (defer5) | no-polity |
| 109302 | 119 | lost | regional | 4 | 4 | 0 | — | 435 (375/0/60) | 435 | 16 (10/6/0) | 3 | National 59 | 53 (defer5) | no-polity |
| 109303 | 104 | lost | regional | 4 | 4 | 0 | — | 280 (200/0/80) | 280 | 8 (6/2/0) | 4 | Regional 44 | 43 (defer5) | no-polity |
| 109304 | 74 | lost | village | 4 | 4 | 0 | — | 100 (100/0/0) | 100 | 4 (4/0/0) | 0 | Regional 37 | 0 | never-regional |
| 109305 | 36 | lost | village | 3 | 3 | 0 | — | 50 (50/0/0) | 50 | 2 (2/0/0) | 0 | Regional 36 | 0 | never-regional |
| 109306 | 150 | survived* | regional | 5 | 5 | 42 (92–113, 132–151) | d92 | 615 (575/0/40) | 615 | 34 (28/5/1) | 2 | National 147 | 41 (defer5) | no-polity |
| 109307 | 150 | survived* | regional | 4 | 4 | 0 | — | 385 (325/0/60) | 385 | 13 (10/3/0) | 3 | National 63 | 73 (defer5) | no-polity |
| 109308 | 150 | survived* | regional | 4 | 4 | 0 | — | 265 (225/0/40) | 265 | 14 (11/3/0) | 2 | National 44 | 90 (defer5) | no-polity |

\* "survived" = alive at the 150-day horizon cap, not a win and
not ready.

Pooled: ready days 50 (on 2 seeds). Door opens 2 (109301 d80,
109306 d92). Capped >= 200 on 6/8 seeds. Days at gated 199:
311 — ALL defer5, 0 cap, 0 defer4-days at 199 (defer4 binds
at 99, never at 199). Four seeds END at exactly 199 (109302,
109303, 109307, 109308) — the same 4/8 count as the refreeze
band. Wave-4 faced 7/8, wave-5 unlocked 2/8, wave-5 faced 2/8,
wave-5 kills 1 (109306, day 101, an editor, killed by
gen_xr2eeuc in a player fight). Wins 0/8, national 0/8
(scaleRank), table 0/8. Median survival 122.5 days (sorted 36,
74, 104, 119, 126, 150, 150, 150), max 150 (censored — 3
survived to horizon). Deaths over 781 person/villager deaths:
"expedition" 293, "villager combat" 281, "combat" 91,
"monster" 41, "the wild" 37, contest 5, "a wound that
wouldn't close" 6, thirst 4, "the arena" 4, starvation 5,
"a stranger" 2, "The Moderator" 2, "Gavel" 2, "the night" 1,
sickness 1, "The Eater" 1, dehydration 1, "alien" 2,
lockjaw 1. Combat-family ("villager combat" + "combat" +
"monster") is 413/781 = 53%; expedition alone is 293/781 =
37.5% — the largest single cause, up from 50/543 (9%) on the
99107 band (see metric review).

## Answers to the prereg questions

### (a) Does the 199 stall recur, and what holds it?

Yes — 6/8 seeds, 311 days, first-199 days 51–79, and the hold
is the readiness deferral on every single day: defer5 311,
cap 0. The plenty cap never binds (cap-bite days 0 on all 8
seeds); no seed ever has raw >= 200 with capped < 200. The
199 is a veterans hold wearing a points number: on the
standing-ok-but-not-ready days the short bar is veterans on
nearly every day (109308: 90/90 days; 109307: 71/73; 109302:
53/53; 109303: 43/43; 109301: 50/50; 109306: 41/59), with
armor and weapons also short often (109302: armor 35,
weapons 42; 109308: weapons 40, armor 10). At its best day
109306's only short bar is weapons — the one seed that ever
gets within one bar of ready without veterans being the
blocker, and even it spends 41 days veteran-short.

### (b) What standing income is missing — the decomposition

Standing is a one-source bar on this band, again. Per-seed
best-day splits (war/diplomacy/plenty): 225/0/120, 375/0/60,
200/0/80, 100/0/0, 50/0/0, 575/0/40, 325/0/60, 225/0/40.
War is 50–575 points on every seed; diplomacy is 0 on every
seed; plenty is 0–120.

WAR — the whole bar. First war points land day 27–42 on all
8 seeds. Capped 200 is first reached day 51 (109306), 62
(109308), 63 (109303), 68 (109302), 69 (109301), 79 (109307);
never on 109304/109305. War points by wave at end: wave-3
2–17, wave-4 0–6, wave-5 0–1. 98 wave-3+ kills scored 71
ledger points — the per-type cap (2 per monster type) ate the
rest: 109306 killed 34 beasts but scored only 23 points (28
wave-3 kills → 17 points); 109301 killed 10 → 9 points;
109302 killed 16 → 15 points. Breadth, not farming. War
income is lumpy but ample: the three 150-day survivors sit
at capped 265–615 on war alone, up to triple the door.

DIPLOMACY — exactly zero, everywhere, by the regional+ filter,
not by a lack of links. Seven seeds form exactly ONE link each
(a plain haven↔village link, kind null); 109305 forms none in
36 days. A seasoned-but-not-regional+ link appears on 5 seeds
(109301, 109302, 109303, 109306, 109307) — seasoned, but one
lone link can never be a realm (`polityOf('haven')` needs >= 3
seasoned subordinates), so it scores 0. No seed ever has 2
links, let alone 3. Diplomacy income is missing because
villages never build the polity the filter demands — the
link-forming rate, not the seasoning rate, is the zero. The
same answer as 99107, on a fresh band and a new anchor.

PLENTY — thin because feasts almost never happen. 20 major
feasts across 8 seeds: 109301 feasts 6 times; 109303 four
times; 109302/109307 three times; 109306/109308 twice;
109304/109305 zero. Plenty is the smallest source not because
a feast pays little (20 points each) but because competent
play hosts ~1 feast per 45 village-days. The plenty cap (100
toward t5) NEVER bound: cap-bite days 0 on all 8 seeds.

### (c) When standing is >= 200, what blocks national rank?

The polity never forms — classified per seed, 0
UNCLASSIFIED. National blocks: no-polity 6/8, never-regional
2/8. Supporting detail, all 8 seeds: max active links 1 (0
on 109305), max seasoned links 1, max counting links 0, max
Haven polity size 0, `pendingNational` NEVER present on any
snapshot of any seed (no national beat ever staged),
`scaleRefused` never set, `nationalLive` never set. The
one-rung-per-season gate was open for weeks on all 6 regional
seeds (season-gate open days 71–90; regional first days
42–61) — the gate is not the blocker either. The end links
tell the same story in miniature: 109306's single link sits
at trust 35 at the horizon (seasoning needs trust 40+, so it
is not even seasoned at the end); 109302's single link is
seasoned (trust 54) and still scores nothing, because a lone
link is not a realm. And the region is not empty: a foreign
polity exists (foreignPolities count 1) on all 6 regional
seeds — the BELONG road's precondition, a realm to join, is
standing there while Haven, with one link to a different
village, never becomes anyone's subordinate in good standing.
That last step (does Haven's link ever point at the foreign
primary?) is NOT in this corpus — the instrument recorded the
foreign count, not its membership — and is the named next
blank, not a claim made here.

### (d) When readiness-ready days occur, does standing still gate release?

No — the two times readiness completes, the door opens the
same day. On 109301's ready days capped was 275–295 and the
peak released to 5 on day 80 itself (the release line is
stamped day 79, the day-before case the classifier accepts:
the release fires after that day's snapshot). On 109306's
ready days capped was 495–615 and the peak released day 92.
ReadyBlockedStandingDays is 0 on both seeds — no ready day
was ever standing-gated. The 11-03 pattern (ready for days,
standing short) does not reproduce on current master either:
it is now 0 ready days with capped < 200 across the whole
band. Standing never gates release anywhere here; readiness
gates it on 368 standing-ok-but-not-ready village-days.

### (e) Wave-5 unlock vs faced

Unlock is not facing — and on this band, both unlocked seeds
DO face wave 5, which answers the 99107 blank 4 in the
affirmative (small-sample: 2/2). 109301 engages wave 5 the
day after the door opens (engagement count 1 on day 81,
rising to 4 by day 107) but kills 0 wave-5 monsters in 46
days under the open door. 109306 engages 3 times and kills
exactly 1 (day 101, editor, gen_xr2eeuc, player fight). The
door opens onto real wave-5 contact now — and onto a village
that mostly cannot convert it.

## The two door openings, day by day

109301: capped >= 200 from day 69 (first-199 day), held at
199 by defer5 for 11 days while the System holds the fifth
draft open aloud ("blood your fighters (1 of 2 veterans)").
Day 80: a second living veteran lands — 2 living veterans,
all four bars met, capped 275 — peak 4→5, wave 5 unlocked.
The village then loses both veterans within 8 days (veterans
2 on days 80–87, 0 from day 88, never recovering past 1) and
collapses day 126. Wave 5 is engaged 4 times, killed 0 times.
The door opens onto a village that cannot hold it — the same
shape as 99102 on the 99107 band, now with the veteran-loss
day pinned: day 88.

109306: capped >= 200 from day 51, held at 199 for 41 days.
Day 92: 2 living veterans, all bars met, capped 495 — peak
4→5. The village HOLDS this time: veterans rise to 4 by day
102 (the day after the wave-5 editor kill), dip to 3, and sit
at 2 for the rest of the run; readiness completes twice more
(days 92–113 and 132–151, 42 ready days total) with a gap at
days 114–131 when another bar (weapons, then armor) goes
short while veterans stay at 2. It survives to the horizon
with capped 615 — the richest standing on any band in this
program — still regional, still no polity, still no table.
The difference between the two doors is not standing (both
had it in multiples) and not the door itself: it is whether
the second veteran survives the fortnight after the opening.

## Village assessment (plain words)

Picture eight villages playing competently for one to five
months. They are not starving for standing: they kill their
way to it, and by two months in most have bought the fifth
draft twice over in blood alone — four hundred points of dead
beasts, and the System's door still shut, because the village
cannot field two living people who have killed the fourth
draft's monsters at the same time. Six of them sit at exactly
199 for weeks on end, the number itself a holding pattern:
the points are there, the people are not. Two villages manage
it — two killers alive together — and the door swings open
both times, the same day, without a moment of standing
hesitation. One of those villages loses both killers inside
eight days and falls apart; the other holds, kills one of the
fifth draft's monsters, and rides out the horizon with six
hundred standing points and no realm to spend them in. Nobody
builds a second bond with another village — seven villages
manage one link each, one manages none — so the bonds half of
the standing bar stays at zero everywhere, and the one link
that does ripen is a lone courtship, not a realm, and scores
nothing. A foreign realm exists in the region the whole time,
one polity strong, and nobody in Haven ever walks over to
join it. Feasts are rare treats, not a road. The villages
explore constantly — it is most of what they do — and all
that exploring moves the seat ladder to National while the
standing bar it was supposed to feed never notices, and the
rank itself never moves at all. That is the wall now, stated
plainly: not standing, not the door — veterans alive
together, and a polity that never forms.

## Wall numbers (this pilot)

Wins 0/8. Villages lost 5/8, survived to horizon 3/8.
National (scaleRank) 0/8, table 0/8. Wave-5 unlocks 2/8,
wave-5 faced 2/8, wave-5 kills 1 (one seed, one monster).
Wave-4 faced 7/8. Readiness-5-ready snapshots 50, on 2
seeds (109301: 8, 109306: 42), 0 on the other 6 seeds.
Capped >= 200 on 6/8 seeds. Days at gated 199: 311 (all
defer5). Median survival 122.5 days (max 150, censored).
These are the baseline the next arm measures against, not a
claim that the wall moved.

## Sense-test

Villagers act like people in the traces that matter here:
they kill, retell the kills at the fire by name ("Karl has
been quiet all evening, and now everyone knows why. 'The
Mountain Lord — I put it down today.'", 109301 d10; "Crimthann
has been quiet all evening... 'Highbeam Deer — I put it down
today.'", 109306 d10), and the System holds the fifth draft
openly with the honest short bar ("blood your fighters (1 of
2 veterans)", weekly). Two small oddities, both voice, neither
a standing finding: (1) the door fires TWO release lines on
the same day, both saying the same thing in different words
("the Producers have greenlit the fifth draft. Wave 5 talent
has been released." + "RATINGS ARE UP! ... Wave 5 talent has
been released into your sector.") — a doubled announcement,
not a contradiction; (2) the fire-beat frame repeats
verbatim ("has been quiet all evening, and now everyone knows
why") with only the name and beast changing — the same
repeated-frame class as the pantry-check line already filed
(2026-11-14). Neither is chased here; the doubled release
line is appended to sim-findings.md as a voice note.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- ANALYZER FIXES (instrument fixes, not metric changes — both
  made and proofed BEFORE the judged leg, proof 31/31): (1)
  holdKindDays counted only 199 days, which hid defer4 days
  (gated 99) from the tally — now every hold kind is counted
  on its own days; (2) the national-blocker ordering put
  reached-national above polity-dissolved, so a seed that
  reached national and then lost it would misclassify — a
  lost national now classifies as polity-dissolved. Neither
  fix changed any verdict: no defer4 days and no dissolved
  polity occur on this band.
- CONFIRM RULE (pre-registered, honored): no 12–16-seed
  confirm spend. The triggers were not met: 6/8 seeds stalled
  (not 0/8), every 199-hold kind classified (all defer5), every
  national block classified (0 UNCLASSIFIED). The 8-seed pilot
  IS the judged leg; the named confirm band 109309–109324 is
  unspent.
- MEDIAN: the analyzer now reports the standard median
  (122.5 on this band). The 99107 metric-review note is closed.
- LINE CAPS: standingLines peaked at 482 (109307) against the
  raised 2000 cap — the raise was unneeded on this band, and
  the uncapped releaseLines stream captured both door lines (2
  each) regardless. saySample still saturates at 200 (by
  design — a sample, not a transcript).
- SNAPSHOT CADENCE / DAY DRIFT: snapshots are ~daily but not
  strictly calendar-daily (124 snapshots over 126 game days on
  109301; 149 over 151 on 109306), first snapshot day 2, and
  driver days vs gameDays drift ±2 on survived runs (109306:
  days 150, gameDays 151, last snapshot day 151) — the same
  drift the refreeze band flagged; wall counts use the
  analyzer's `days` field, as frozen.
- DEATH-CAUSE SHAPE: "expedition" is the top cause here
  (293/781 = 37.5%) vs 50/543 (9%) on the 99107 band, while
  "villager combat" holds at 281/781 (36%). Whether the
  expedition share is an anchor move (more deaths happening
  away from Haven) or a labeling shift in the death hook is
  NOT established by this corpus — appended to sim-findings.md
  as an open observation, not claimed as a regression.
- The prereg's "gear-ready" framing is retired in both
  directions: ready days with standing short occur 0 times,
  and standing-ok days with readiness short occur 368 times.
  The 99107 pattern as originally phrased (standing short)
  does not exist on current master; the live pattern is
  standing ample, readiness (veterans) short, rank (polity)
  absent.

## Next blanks, in order

1. Veterans alive TOGETHER (the binding bar, 368 days):
   why villages hold at most 1 living veteran for months —
   killers die within days of blooding (109301's pair dies
   8 days after the door opens), pairs never overlap. The
   vetbar blank 1 (kill conversion + killer survival) is now
   the whole wall, not one blank among three. Coordinate with,
   do not duplicate, the win-fielddmg and win-allyjoin lanes.
2. Diplomacy is structurally zero: villages form at most ONE
   link in 36–150 days, and one link can never be regional+.
   The build question (link formation) is the open item; the
   diplo-verb answer (first-gesture accord gift, 1 link per
   village, 0 tends) stands corroborated on a fresh band.
3. BELONG road, unjoined: a foreign polity (count 1) exists
   on all 6 regional seeds while Haven's polity stays null.
   Next arm: record foreign-polity MEMBERSHIP (is Haven's one
   link to the foreign primary? what would joining cost?) —
   this arm recorded the count only.
4. Wave-5 facing after unlock is answered (2/2 faced, 1 kill
   in 3 engagements on 109306, 0 kills in 4 on 109301): the
   open question is now conversion, not contact — whether a
   village that holds its veterans can kill wave 5 at all.

## Proof and landing

- Proof: `scripts/test-standing-gearready-b-20261124.js` — 31/31
  PASS (16 carried fixture tests: breakdown math, per-type
  cap, link seasoning / regional+ classification, feast
  classification, plenty-cap bite, ready blocked splits, door
  classification incl. capture-cap and day-before-line cases,
  faced flags, veteran-to-kill linkage, unclassified-delta
  detection incl. the same-day-after-snapshot case; plus 14
  new fixture tests: gated/hold-kind derivation (defer5, cap,
  defer4, lying-gated flag, deferral-mismatch recording),
  national-blocker classification (7 cases), uncapped
  release-stream door, standard median; plus the live harness
  smoke with gated + national fields and a live analyzer
  reconcile). Re-run post-commit below.
- Commits (this worktree branch sim-standing-gearready-b;
  coordinator merges via --ff-only; ready to merge, pending
  ship — no push, no bump, no live verification by this
  worker):
  - `32a8ec8bc` sim-standing-gearready-b prereg (before any judged sim)
  - `f74931e6` sim-standing-gearready-b instruments: standing
    decomposition + gated/hold-kind + national-blocker census +
    driver + analyzer + proof 31/31 (zero src/js)
  - (evidence commit follows)
- Files: prereg + evidence in
  `evidence/2026-11-24/sim-standing-gearready-b*.md`; per-seed JSON
  in `evidence/2026-11-24/perseed-standing-gearready-b/` (8 files,
  anchor `f74931e6`).
- Telemetry deviation check (body step 10): `node
  scripts/telemetry-check.js --baseline .../scale-wall.json
  --current 'evidence/2026-11-24/perseed-standing-gearready-b/*.json'
  --metrics national,table,wins,exiled` REFUSED the corpus:
  "refusing recorder-corpus input: all 8 --current rows carry
  top-level anchorCommit, so they are sweep recorder rows, not
  runs." No LOUD line fired; no deviation is claimed. The
  baseline itself (`scale-wall.json`, regime "winseat",
  national 12/16 / wins 16/16) carries a DO NOT compare note
  for pre-seat substrates — wins are structurally ~0 there and
  the check would fire a spurious LOUD. The check is not
  applicable to this corpus shape; the wall numbers above are
  the report.
