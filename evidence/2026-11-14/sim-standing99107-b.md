# Standing accumulation to 199 on gear-ready seeds — Loop B, run fleshout-loop-b-20261114T1430Z, arm sim-standing99107-b

Axis: winnability chain. DIAG-ONLY arm: zero src/js changes.
Anchor: HEAD `c0bbaa071` at pilot time (prereg anchor `7f52e9fac`).
Policy `scripts/policies/competent.js` `{competent}` VERBATIM,
default env. Seeds 99101–99108. Horizon 150 days, death-aware.
Balanced panel (§15): INAPPLICABLE — pure diagnostic, no
before/after change; no comparison is fabricated.

Prereg: `evidence/2026-11-14/sim-standing99107-b-prereg.md`
(commit `adc857a68`, before any judged sim).

## Verdict — DIAG-GO

All five prereg legs pass: 8/8 seeds with a complete per-day
standing decomposition; every standing delta reconciled to a
kill / link-transition / feast event (0 unclassified deltas, 0
breakdown-math mismatches on any seed); the one wave-5 release
classified (peak transition day 117 on 99102, release line
absent only because line capture hit its 400 cap on day 96 —
explained artifact, see metric review); 0 veteran-recount
mismatches, 0 instrument errors. The 99107 pattern as measured
in 11-03 is GONE on current master — and what replaced it is
sharper: standing is no longer the wall at all. **War alone
carries 6/8 seeds past capped 200; readiness-ready days occur
on exactly one seed, and the day they occur the door opens the
same day. The wall past standing is veterans — one living
veteran short, on 317 village-days.**

## Calibration gate — the pattern MOVED (again)

The ready5 arm proved the anchor moved under the 11-03 numbers
(99107: 80 days at 1819 → 38 days at its anchor). It moved
again: at THIS anchor the 99107 smoke seed runs 82 days /
village-lost / maxWave 4 / best capped 150 (all war, 6 kills,
0 diplomacy, 0 feasts), vs 38 days at the ready5 anchor and
80 days at 1819. RE-BASELINE (binding): the 11-03 numbers
(99107 ready days 76–80, standing 150, gearbar median 90d)
are a previous anchor, NOT pooled with this arm's numbers and
NOT cited as this arm's baseline. This arm's baseline is its
own judged leg below.

## Door / release rule, as found in code (not taken on faith)

From `src/js/standing.js`, current anchor (unchanged since
ready5): standing = war (25 per wave-3+ ledger kill point) +
diplomacy (34 per seasoned REGIONAL+ link) + plenty (20 per
major feast, quality >= 1); t4 = 100, t5 = 200; plenty counts
at most 100 toward the t5 bar (capped total). Release to wave
5 requires capped >= 200 AND readiness-5 ready (armored 4 @
P>=15, armed 6, tricks 3, veterans 2 living); while capped >=
200 but not ready the gated total holds at 199. `unlockedWave()
== 5` additionally requires the wave-3 rung (day >= 25 AND
wave-2 ledger >= bar) AND wave-4 faced. The five ladder tracks
(fight/forage/craft/talk/explore) feed the LADDER
(`src/js/ladder.js`), NOT standing; tribute feeds no standing
reader in src/js. Both zeros were VERIFIED empirically below,
not assumed.

## Judged leg (current anchor only)

Proof `scripts/test-standing99107-b-20261114.js` 17/17 before
the leg (decomposition math, per-type cap, link seasoning /
regional+ classification, feast classification, release
classification incl. the capture-cap case, live-harness smoke).
Instruments commit `3ee5224b2`; analyzer fix commit
`c0bbaa071` (wave-5-only release filter, inclusive delta
windows, capture-cap classification — see metric review).

Per-seed (ready = readiness-5-ready days; best = best capped
day; end bars = final snapshot):

| seed | days | end | scale | maxW | endUW | ready days | door | best capped (war/diplo/plenty) | best raw | war kills (w3/w4) | feasts | ladder end |
|------|------|-----|-------|------|-------|------------|------|-------------------------------|----------|-------------------|--------|------------|
| 99101 | 150 | survived* | regional | 4 | 4 | 0 | — | 415 (375/0/40) | 415 | 17 (11/6) | 2 | National 67 |
| 99102 | 139 | lost | regional | 5 | 5 | 7 (117–123) | d117 | 500 (400/0/140) | 540 | 21 (17/4) | 7 | National 63 |
| 99103 | 65 | lost | village | 4 | 4 | 0 | — | 210 (150/0/60) | 210 | 7 (6/1) | 3 | Regional 35 |
| 99104 | 116 | lost | regional | 4 | 4 | 0 | — | 200 (200/0/0) | 200 | 11 (7/4) | 0 | National 45 |
| 99105 | 125 | lost | regional | 4 | 4 | 0 | — | 245 (225/0/20) | 245 | 10 (9/1) | 1 | National 57 |
| 99106 | 150 | survived* | regional | 4 | 4 | 0 | — | 395 (375/0/20) | 395 | 16 (12/4) | 1 | National 81 |
| 99107 | 82 | lost | village | 4 | 4 | 0 | — | 150 (150/0/0) | 150 | 6 (5/1) | 0 | Regional 31 |
| 99108 | 74 | lost | village | 4 | 4 | 0 | — | 175 (175/0/0) | 175 | 7 (6/1) | 0 | Regional 34 |

\* "survived" = alive at the 150-day horizon cap, not a win and
not ready.

Pooled: ready days 7 (all on 99102). Door opens 1 (99102,
day 117). Capped >= 200 on 6/8 seeds. Wave-4 faced 8/8,
wave-5 unlocked 1/8, wave-5 faced 0/8. Wins 0/8, national
0/8 (scaleRank), table 0/8. Median survival 120.5 days
(sorted 65, 74, 82, 116, 125, 139, 150, 150), max 150
(censored — 2 survived to horizon). Deaths over 543
person/villager deaths: "villager combat" 266, "combat" 110,
"the wild" 65, "expedition" 50, "monster" 21, contest 6,
starvation 4, "a stranger" 4, "the arena" 4, "the night" 2,
"Gavel" 2, ambush 2, "a wound that wouldn't close" 3, "the
expedition" 1, "alien" 2, dehydration 1. Combat deaths
("villager combat" + "combat") are 376/543 = 69%.

## Answers to the prereg questions

### (a) What standing income is missing — the decomposition

Standing is a one-source bar on this band. Per-seed best-day
splits (war/diplomacy/plenty): 375/0/40, 400/0/140, 150/0/60,
200/0/0, 225/0/20, 375/0/20, 150/0/0, 175/0/0. War is
150–400 points on every seed; diplomacy is 0 on every seed;
plenty is 0–140.

WAR — the whole bar. First war points land day 27–35 on all
8 seeds. Capped 200 is first reached day 58 (99102, 99103),
64 (99101), 66 (99105), 79 (99106), 106 (99104); never on
99107/99108. War points by wave at end: wave-3 5–12, wave-4
1–6, wave-5 0. 95 wave-3+ kills scored 82 ledger points —
13 kills (14%) paid 0 because their monster type had already
hit the per-type cap of 2 (breadth, not farming: 99102 killed
21 beasts but only 16 points; 99101 17 kills → 15 points).
Types touched per seed: 5–10; types capped at 2: 0–6. War
income is lumpy but ample: the two 150-day survivors sit at
capped 375–415 on war alone, nearly double the door.

DIPLOMACY — exactly zero, everywhere, by the regional+ filter,
not by a lack of links. Six seeds form exactly ONE link each
(a plain haven↔village link, kind null); 99107/99108 form none
in 82/74 days. The single seasoned link on the band is
99106's (trust 41, day 37) — seasoned, but NOT regional+:
one lone link can never be a realm (`polityOf('haven')`
needs >= 3 seasoned subordinates), so it scores 0. No seed
ever has 2 links, let alone 3. Diplomacy income is missing
because villages never build the polity the filter demands —
the link-forming rate, not the seasoning rate, is the zero.

PLENTY — thin because feasts almost never happen. 14 major
feasts across 8 seeds: 99102 feasts 7 times (d18, 29, 41, 63,
70, 96, 113); 99103 three times (d22, d30 bundle q2, d38);
99101 twice (d129, 136 — both in the last three weeks);
99105 once (d80); 99106 once (d85); 99104/99107/99108 zero.
Plenty is the smallest source not because a feast pays little
(20 points each) but because competent play hosts ~1 feast
per 60+ village-days. The plenty cap (100 toward t5) NEVER
bound: cap-bite days 0 on all 8 seeds (raw >= 200 with capped
< 200 never occurred). 99102's raw 540 vs capped 500 shows
the cap trimming 40 points above the bar — but capped still
cleared 200, so the cap gated nothing.

### (b) Which tracks contribute and which sit at 0

Tracks: ALL FIVE contribute 0 to standing — verified, not
assumed: every standing delta on all 8 seeds reconciled to
war/diplomacy/plenty only (0 unclassified deltas, 0
breakdown-math mismatches on ~700 daily snapshots). What the
tracks DO is fill the ladder: end totals 31–81, stage
Regional on 99103/99107/99108, National on the other five —
while scaleRank stays village/regional and standing's
diplomacy sits at 0. Explore dominates every ladder (20–44
of each total; 99102: explore 40 of 63; 99106: 44 of 81);
fight 3–8, talk 4–14, forage 0–12, craft 0–10. So the
village's busiest work — exploring — moves the seat ladder
and moves standing not at all.

Tribute: 0 as well. `tributePaidWeek` stays at its -1
never-paid sentinel on every link on every seed — no tribute
was ever paid on this band (6 seeds carry the marker field,
0 carry a payment). Tribute contributes 0, as designed (no
standing reader exists for it).

### (c) Does any seed reach 199/200, and do readiness-ready days occur?

Yes to 200, on 6/8 seeds (best capped 200–500). Readiness-
ready days occur on exactly ONE seed: 99102, 7 days
(117–123). The other seven seeds have 0 ready days — not
because standing is short (99101 sat at capped >= 200 for 88
days, 99106 for 73, 99105 for 60, 99104 for 12, 99103 for 8)
but because readiness never completes. The 99107 pattern
(ready for days, standing short) does not reproduce on
current master: NO seed has a ready day with capped < 200
(readyBlockedStandingDays 0 on all 8).

### (d) When readiness-ready days occur, does standing still gate release?

No — the one time readiness completes, the door opens the
same day. On 99102's ready days capped was 475–500, and the
peak released to 5 on day 117 itself (peakBeforeEndCall 5,
endCallMovedPeak false — a natural release, not an end-call
artifact). Standing did not gate release anywhere on this
band; readiness gated it on 317 village-days (standing-ok-
but-not-ready days: 99101: 88, 99102: 76, 99106: 73, 99105:
60, 99104: 12, 99103: 8, 99107/99108: 0), and on all 317 the
short bar is veterans — 99101's short bars are veterans on
all 88 days (11 armored, 11 armed, 20 tricks, 1 veteran at
its best day); 99106's on all 73 (7/8/23/1).

## The 99102 release, day by day (the band's one door)

Capped >= 200 from day 58, but readiness-5 is not ready —
veterans stuck at 1 — so the System holds the fifth draft
openly, weekly: "The fifth draft stays in the wings. It wants
a village that can fight — blood your fighters (1 of 2
veterans)" (d58, d65, d72, d79, d86, d93). The first veteran
is the scholar themself: gen_hwa0gst kills the Algorithm on
day 58 and dies in the wild the next day (succession to
gen_nbxccc9) — the hold beat's silence about that loss is by
design (MOURNBLOODED skips scholar deaths: succession fiction,
playerDeath's own beat). A second killer lands day 100
(app_mgpsphhk682 kills a herald, wild) but the count stays 1
— one of the pair is always dead or gone. Day 117:
gen_iw0q5ci kills an eater in a player fight — 2 living
veterans, all four bars met (5 armored / 8 armed / 28 tricks /
2 veterans), capped 475 — peak 4→5, wave 5 unlocked. The
village then collapses under the open door: veterans 1 on
day 124, 0 on day 129; living roster 3 → 1 → 0 by day 139.
Wave 5 is unlocked but NEVER faced: `waveEngaged(5)` is 0 on
every snapshot of every seed, 0 wave-5 kills on the band. The
door opens onto an empty village.

## Village assessment (plain words)

Picture eight villages playing competently for two to five
months. They are not starving for standing: they kill their
way to it. By day two months in, most villages have bought
the fifth draft twice over in blood alone — four hundred
points of dead beasts, and the System's door still shut,
because the village cannot field two living people who have
killed the fourth draft's monsters at the same time. One
village manages it for exactly seven days: two killers alive
together, the door swings open, and then both killers are
dead within a fortnight and the village follows them. Nobody
builds a second bond with another village — six villages
manage one link each, two manage none — so the bonds half of
the standing bar stays at zero everywhere, and the one link
that does ripen is a lone courtship, not a realm, and scores
nothing. Feasts are rare treats, not a road: one village
feasts seven times, three never feast at all. The villages
explore constantly — it is most of what they do — and all
that exploring moves the seat ladder to National while the
standing bar it was supposed to feed never notices. The
village that survives to the horizon does so with eleven
armored fighters and a full ledger, one veteran short of the
door, for eighty-eight days. That is the wall now: not
standing — veterans, alive together.

## Wall numbers (this pilot)

Wins 0/8. Villages lost 6/8, survived to horizon 2/8.
National (scaleRank) 0/8, table 0/8. Wave-5 unlocks 1/8,
wave-5 faced 0/8, wave-4 faced 8/8. Readiness-5-ready
snapshots 7, all on seed 99102 (days 117–123), 0 on the
other 7 seeds. Capped >= 200 on 6/8 seeds. Median survival
120.5 days (max 150, censored). These are the baseline the
next arm measures against, not a claim that the wall moved.

## Sense-test

Villagers act like people in the traces that matter here:
they kill, retell the kills at the fire by name ("Gavel — I
put it down today"), hold the fifth draft's wait aloud in
System voice with the honest short bar, and the System's
stage line names the three sources plainly ("Get me STANDING
— blood, bonds, or bread"). Two recurring oddities, both
voice/repetition, neither a standing finding: (1) the daily
pantry-check line repeats near-verbatim for days on end
("Lena checks the pantry before heading out — the shelves
are full, ~5 days of fresh on hand… leaves the harvest
standing and turns to the wood run instead", d2–d8 on 99107
and across seeds) — a routine beat with no variation; (2)
possession lines repeat identically day after day ("You hold
Contract Quill. It has signed three leases, two loans, and
one terrible contract you still regret…", d60–d63 on 99101).
Both are appended to sim-findings.md, not chased here.

## Metric review (for the NEXT run, §14 — no in-run re-scoring)

- ANALYZER FIX 1 (release classification, instrument fix not
  a metric change): the first analyzer build classified a
  peak-to-5 transition as "unclassified" unless a wave-5
  release line appeared the SAME day. On 99102 the peak moved
  day 117 with no release line anywhere after day 96 — because
  the instrument's standingLines capture hit its 400 cap on
  day 96 (99106 also hit 400, last line day 135). The release
  itself is proven in the raw data (peak 4→5 between
  snapshots, ready + capped 475 that day, second veteran kill
  day 117, peakBeforeEndCall 5, endCallMovedPeak false).
  The classifier now accepts a release line on the transition
  day or the day before (a release can fire after that day's
  snapshot), and classifies a cap-hit absence as the explained
  artifact `peak-to-5-line-capped`. The verdict does not
  change — the door opened day 117 either way — but the
  classification is now honest about WHY no line is on file.
  Proof grew 14 → 17 with fixtures for both cases.
- ANALYZER FIX 2 (faced vs unlocked, metric correction
  recorded here, not re-scored): the first pooled summary
  counted maxWave >= 5 as "wave-5 faced". Unlock is not
  facing: 99102 unlocked wave 5 and faced 0 wave-5 monsters
  (`waveEngaged(5)` 0 on every snapshot, 0 wave-5 kills).
  Pooled `wave5faced` now reads engagement/kills, not the
  unlock number (1 → 0). The per-seed numbers are unchanged;
  only the pooled label was wrong.
- ANALYZER FIX 3 (delta windows, instrument fix): the first
  build used half-open windows (prev.day, cur.day] for kill /
  feast attribution, which flagged 2 "war-no-kill-event"
  deltas on the 99107 smoke — kills stamped prev.day that
  landed AFTER that day's snapshot. Windows are now inclusive
  [prev.day, cur.day]; the strict check (ledger/log delta ==
  standing delta) is unchanged and still exact. Proof fixture
  added.
- MEDIAN NOTE: the analyzer's pooled median uses the
  upper-middle value (125). The evidence reports the standard
  median 120.5 (sorted 65, 74, 82, 116, 125, 139, 150, 150).
  Next arm: make the analyzer report the standard median.
- SNAPSHOT CADENCE: snapshots are ~daily but not strictly
  calendar-daily (149 snapshots over 151 game days on 99101;
  138 over 139 on 99102). Day-counts in this file (ready days,
  standing-ok-not-ready days, hold beats) are snapshot-days.
  The 1-day kill-to-snapshot traces are unaffected (the
  inclusive-window fix above handles same-day-after-snapshot
  events).
- INSTRUMENT CAP (for the next arm): standingLines caps at
  400 and saySample at 200 — both saturate on long runs
  (99102's sample ends day 51, its standing lines day 96).
  The caps protected the JSON size but cost the release line
  on the band's one door. Next arm: raise the standing-line
  cap (or keep a separate uncapped release-line stream) and
  say so in its prereg.
- The prereg's "199" framing is retired: the door needs
  capped 200, and 199 is the hold value. No seed on this band
  sat at the 199 hold — holds are readiness holds (peak 4,
  capped >= 200), not cap holds.

## Next blanks, in order

1. Veterans alive TOGETHER (the binding bar, 317 days):
   why villages hold at most 1 living veteran for months —
   killers die the day after they blood (99102's first
   veteran), pairs never overlap. The vetbar blank 1 (kill
   conversion + killer survival) is now the whole wall, not
   one blank among three. Coordinate with, do not duplicate,
   the win-fielddmg and win-allyjoin lanes.
2. Diplomacy is structurally zero: villages form at most ONE
   link in 65–150 days, and one link can never be regional+.
   NOTE — answered the same day by Loop B arm sim-diplo-verb-b
   (run fleshout-loop-b-20261114T1130Z, evidence
   evidence/2026-11-14/sim-diplo-verb-b.md, sim-findings entry
   "DIPLOMACY STANDING 0 ON 16/16 COMPETENT RUNS" + answer):
   the verb is the first-gesture accord gift; competent forms
   exactly 1 link per village (ladder stage-3 reward), tends
   0 times, and the polity never forms. This band corroborates
   that answer on seeds 99101–99108 (1 link max, 0 diplomacy,
   1 seasoned-but-not-regional+ link). No fresh DIAG is owed;
   the build question (link formation) is now the open item.
   Standing needs bonds or bread to matter; today it is a
   war-only bar with two dead sources.
3. Plenty is feast-starved, not feast-capped: ~1 feast per
   60+ village-days under competent play. The cap never binds;
   the feast rate is the plenty story.
4. Wave 5 unlocked-but-unfaced: 99102 opened the door day 117
   and met zero wave-5 monsters in 22 days before collapsing.
   After blank 1, re-measure whether an unlocked wave 5 is
   actually faced, or whether collapse outruns the spawn.

## Proof and landing

- Proof: `scripts/test-standing99107-b-20261114.js` — 17/17
  PASS (16 fixture tests: breakdown math, per-type cap,
  link seasoning / regional+ classification, feast
  classification, plenty-cap bite, ready blocked splits,
  door classification incl. capture-cap and day-before-line
  cases, faced flags, veteran-to-kill linkage, unclassified-
  delta detection incl. the same-day-after-snapshot case;
  plus the live harness smoke: gate == recount, capped math,
  peak-stable snapshot, live wave-3 kill event, ledger /
  feast / ladder reads). Re-run post-commit below.
- Commits (this worktree branch sim-standing99107-b;
  coordinator merges via --ff-only; ready to merge, pending
  ship — no push, no bump, no live verification by this
  worker):
  - `adc857a68` sim-standing99107-b prereg (before any judged sim)
  - `3ee5224b2` sim-standing99107-b instruments: standing
    decomposition + driver + analyzer + proof 14/14 (zero src/js)
  - `c0bbaa071` sim-standing99107-b analyzer fix: wave-5-only
    release filter + inclusive delta windows + capture-cap
    classification (proof 17/17)
  - (evidence commit follows)
- Files: prereg + evidence in
  `evidence/2026-11-14/sim-standing99107-b*.md`; per-seed JSON
  in `evidence/2026-11-14/perseed-standing99107-b/` (8 files,
  anchor `c0bbaa071`).
- Telemetry deviation check (body step 10): `node
  scripts/telemetry-check.js --baseline .../scale-wall.json
  --current 'evidence/2026-11-14/perseed-standing99107-b/*.json'
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
