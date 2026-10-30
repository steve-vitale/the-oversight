# sim-chainfinish-a — CHAIN-FINISH / ZERO-DEALT DECOMPOSITION, WILD WAVE-4 ONLY

Run: flesh-out loop, run fleshout-20261030T0420Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-chainfinish-a.
Finding #1462, ranked next by run fleshout-20261030T0320Z.
DIAG arm, MEASUREMENT ONLY — zero src/js game changes, no default
flip, no deed-bar move, no gate change.
Preregistration (binding, committed BEFORE any judged analysis):
evidence/2026-10-29/sim-chainfinish-a-prereg.md (commit b32400c4c).
Instruments: commit 60304611f (sweep + analyzer + fixtures).
VERDICT: DIAG-NO-GO — decided SOLELY by one completeness sub-leg
(the shoutrec final-equality clause; see "Header vs result"). Every
judged quantity in this file rests on breakline/w4dpr, which agree
975/975. The NO-GO is an instrument-leg miss, not a data miss: the
prereg demanded final-total equality from a snapshot series that
provably lags the final round (root-caused below). The coordinator
re-judges with the corrected leg; this arm does NOT re-score itself.

## Plain words first

Wild wave-4 meetings chain — the same beast comes back, wounded, days
later — but the chain never finishes. On this band's own corpus, all
11 wild wave-4 meetings happen on one seed (75102), days 55–79, as
5 beasts: an eulogy met 4 times and an algorithm met 4 times, plus
single meetings of a herald, an audit, and a reunion. Wounds persist
exactly: every re-meeting opens at the previous meeting's closing HP,
with no healing break inside any wild chain. But 4 of the 11 meetings
deal zero damage, and the damage that does land is tiny against
850–1,200 HP. At each chain's observed median rate, the eulogy needs
75 more meetings and the algorithm 160 more to finish; even at each
chain's BEST-observed single meeting, they need 36 and 34 more. The
village that hosts all of this dies on day 86 — seven days after the
last wave-4 meeting. The chain recurs (gaps of 1–3 days); the finish
does not arrive inside any lifetime this band shows. Chain-finish at
current rates is a real recurrence pattern and a fantasy finish.

The four zero-dealt meetings split evenly, two and two: two are the
eulogy narrating the fighter's turns away (the fighter "contradicts
the narration" instead of striking — signature play, not failure),
and two are fighters carrying ONLY an arrowless ranged weapon (a
sling or a bow with no arrows and no melee fallback — they literally
cannot strike). No wild meeting has a leader who dealt zero while an
ally dealt damage: leader-zero-ally-positive is 0, so the
beast-zero/leader-zero distinction, though defined and checked,
changes nothing on this band — every zero is a whole-fight zero.

## Header (pre-registered) vs result

- COMPLETENESS: 8/8 valid seeds AND all six recorders errs 0 with
  overflow empty AND joins 100% AND mDealt agreement across
  breakline/w4dpr/shoutrec at every wild wave-4 row AND every
  beast-zero wild meeting assigned exactly one taxonomy class AND
  OTHER = 0.
  RESULT: 8/8 rows valid; all six recorders errs 0, overflow empty;
  joins 975/975, 0 errors; breakline-vs-w4dpr mDealt agreement
  975/975 band-wide (0 wild wave-4 mismatches); every beast-zero
  wild meeting classified, OTHER = 0. BUT shoutrec final-equality
  fails on 1 wild wave-4 row (d74 audit: roundTotals final 36 vs
  final total 58) and 85 rows band-wide. Root cause (proven, not
  assumed): shoutrec roundTotals is a MORALE-ENTRY snapshot series
  (src/js/fieldFights.js: pushed "at morale entry, after the action
  phase"), and a fight that ends before the next morale entry never
  records its final round — so the series lags the final round
  whenever that round deals damage. Prefix-consistency holds 368/368
  (every snapshot entry non-decreasing and <= the final total). The
  prereg's final-equality clause demanded something this instrument
  never promised. Per metric binding this is recorded as a miss, not
  re-scored: COMPLETENESS = FAIL on this sub-leg alone.
- DETERMINISM GATE: one seed re-run into a scratch EVID dir; row JSON
  byte-identical.
  RESULT: seed 75102 re-ran byte-identical in full; scratch dir
  removed after the diff → PASS.
- SENSE BAR: all wild wave-4 transcripts read end to end when the
  wild count is <= 40 (pre-stated stratified rule for > 40, unused).
  RESULT: all 11 fought wild wave-4 logs read end to end (11/11,
  both zero causes, all outcome classes present: vFlee 6, vDie 5)
  → PASS.
- FIXTURE BAR: taxonomy mapping (including priority order), the
  beast-vs-leader zero split, chain splitting on an HP break,
  meetings-to-finish arithmetic at median and best rates (ceil,
  n>=2 price rule), and re-meeting intervals proven on synthetic
  rows before judging.
  RESULT: FIXTURES-PASS (35 checks, 0 fails) → PASS.
- CHAIN-PRICE BAR (reported, not a GO leg alone): a price for every
  chain with n >= 2.
  RESULT: 2 chains priced (eulogy, algorithm); 3 single-meeting
  chains correctly unpriced → reported, not a failure.
- INSUFFICIENT-DATA: not triggered for wild (n=11). Raid (n=2) and
  other (n=0) are INSUFFICIENT-DATA, counts only, no lever judgment.
- VERDICT: DIAG-NO-GO, decided by the completeness shoutrec sub-leg.
  Determinism PASS, sense PASS, fixtures PASS, taxonomy OTHER = 0,
  chains priced. Nothing else failed.

## Wall numbers (this band, own corpus, 8 seeds, 180d, report-only)

Same upper-middle median convention as the 0320Z round.

- Wins: 6/8, all lesser seats (full 0). National ever: 6/8.
  National final: 6/8. Table reached: 7/8. Table entered: 6/8.
- Wave reach: wave 1: 8/8, wave 2: 8/8, wave 3: 7/8, wave 4: 5/8,
  wave 5: 0/8. (Reach is the unlock flag — contact is 1/8 seeds,
  seed 75102 only; see below.)
- Median survival: 114d (days sorted [31, 86, 90, 101, 114, 115, 115,
  165]; statistical median 107.5d, noted for comparability).
- Deaths: 232 total. Starvation: 2.
- Death causes (232): villager:combat 90, villager:villager combat
  73, player:the wild 23, villager:expedition 15, villager:monster
  11, rest small. This band does not starve; it is killed in combat.
- Drift diagnostic (not a GO leg): this corpus reproduces the
  w4shape corpus exactly on every wall field, every per-seed day /
  death / meeting count, and every per-seed wave-4 count (975
  meetings band-wide). The base did not move between the two runs;
  per finding #1457 these numbers are still cited ONLY as this
  run's own corpus, never as w4shape's.

## Q(a) — the zero-dealt class, per cause (wild wave-4 only)

Definitions (binding, from the prereg): BEAST-ZERO means the beast
took 0 damage in the meeting (mDealt == 0, totalled over leader +
ally). LEADER-ZERO means leaderDealt = mDealt - allyDealt == 0. A
meeting with leaderDealt == 0 AND mDealt > 0 would be
LEADER-ZERO-ALLY-POSITIVE: not beast-zero, counted separately.
Universe: 11 wild wave-4 meetings, all seed 75102.

| Cause (first-match priority order) | n | Meetings |
|---|---:|---|
| PRE-CONTACT-SCATTER (rounds<1, mFlee) | 0 | — |
| PRE-CONTACT-FLEE (rounds<1, vFlee) | 0 | — |
| PRE-CONTACT-DEATH (rounds<1, vDie) | 0 | — |
| NARRATION-SUPPRESSED (log/trickLog contradicts-narration) | 2 | d57 eulogy (DEATH r2), d59 eulogy (FLEE r1) |
| NO-USABLE-WEAPON (armed false, or melee null + ranged + 'no arrows') | 2 | d67 algorithm (DEATH r2), d71 algorithm (DEATH r2) |
| TURN-CONSUMED-OTHER (no strike line, none above) | 0 | — |
| STRIKE-WITHOUT-DAMAGE (strike line, mDealt 0) | 0 | — |
| OTHER | 0 | — |
| BEAST-ZERO TOTAL | 4 | 4/11 wild meetings (36%) |
| LEADER-ZERO-ALLY-POSITIVE (not beast-zero) | 0 | — |

Every zero-dealt wild meeting lands in exactly one class; OTHER = 0.
No wild meeting scatters or flees before contact (0 pre-contact in
any class) — the w4shape shape finding holds on this corpus: wild
wave-4 meetings always become fights. No meeting records a strike
without damage, and no meeting's turns are consumed by medicine or
ability activation alone (those lines appear, but always alongside
a higher-priority cause — see overdetermination note).

Overdetermination note (honest limit of first-match classes): the
four zero meetings are each consistent with MORE than one cause,
and priority order decides the label, not exclusive causation.
d59 is narration-suppressed AND arrowless (sling, no arrows).
d67 is arrowless AND spends a turn on Rage activation (R1 shows the
Rage line, no strike). d71 is arrowless AND spends R1 on field
medicine before dying in R2 without striking. A future arm that
wants exclusive causes must vary one factor at a time (e.g. an
arrowed sling fighter vs the eulogy); this decomposition prices
the classes as observed, it does not prove exclusivity.

Zero-dealt detail (all 4, own corpus):

| Day | Beast | Fighter | Outcome/Rounds | Taken | Tile | Cause |
|---:|---|---|---:|---:|---:|---|
| 57 | eulogy | Aria | DEATH r2 | 82 | 4 | NARRATION-SUPPRESSED |
| 59 | eulogy | Daniyar | FLEE r1 | 30 | 1 | NARRATION-SUPPRESSED |
| 67 | algorithm | Daniyar | DEATH r2 | 66 | 2 | NO-USABLE-WEAPON (sling, no arrows) |
| 71 | algorithm | Ursula | DEATH r2 | 161 | 2 | NO-USABLE-WEAPON (bow, no arrows) |

All four zero meetings end in death except d59 (floor flee). All
four fighters were tile-mate-present yet unjoined (calledHelp false,
no ally) — the zero is a whole-fight zero, not a leader who watched
an ally work: allyDealt is 0 in all four, and
leader-zero-ally-positive is 0 band-wide.

Non-zero wild meetings for contrast (7): d55 eulogy 23, d56 eulogy
24 (ally 6), d65 algorithm 29 (ally 5), d70 algorithm 12, d74 herald
21, d74 audit 58 (ally 4), d79 reunion 15. Even the best wild meeting
(58, the joined audit fight) is 5% of that beast's remaining HP.

## Q(b) — per-beast chains (identity-tracked, wild universe only)

A chain is a maximal run of same-mid meetings on one seed where each
meeting opens at the previous meeting's closing HP. A break starts a
new chain. All 5 wild chains below are unbroken: NO wild chain shows
healing (no meeting opens above the previous close) and NO wild chain
shows an HP discontinuity. Wound persistence is exact, not
approximate.

| Chain (seed 75102) | Meetings (day: dealt, HP) | Remaining HP | Median rate | Best rate | Price at median | Price at best |
|---|---|---:|---:|---:|---:|---:|
| eulogy | d55: 23 (900→877), d56: 24 (877→853), d57: 0 (853→853), d59: 0 (853→853) | 853 | 11.5 | 24 | 75 more meetings | 36 more meetings |
| algorithm | d65: 29 (1000→971), d67: 0 (971→971), d70: 12 (971→959), d71: 0 (959→959) | 959 | 6 | 29 | 160 more meetings | 34 more meetings |
| audit | d74: 58 (1066→1008) | 1008 | 58 (n=1) | 58 | not priced (n<2) | not priced (n<2) |
| herald | d74: 21 (700→679) | 679 | 21 (n=1) | 21 | not priced (n<2) | not priced (n<2) |
| reunion | d79: 15 (1200→1185) | 1185 | 15 (n=1) | 15 | not priced (n<2) | not priced (n<2) |

Prices are prices, not predictions: ceil(remaining / rate), zeros
included in the median (zeros ARE meetings). A median of 6 for the
algorithm is the honest consequence of half its meetings dealing
zero — the mean of its two middle values (0 and 12).

Universe-relative chain caveat: chains are defined INSIDE the wild
universe. The wild audit chain opens at 1,066 HP not because a fresh
audit spawns at 1,066, but because the RAID audit meeting on d73
(outside this universe) closed at 1,066. Likewise the wild algorithm
chain is separate from the raid algorithm meeting on d64 (1,000→986):
raid and wild meetings of one type are different chains in this
analysis by construction, and any future cross-shape chain price
must join them explicitly, not assume it.

Supplementary arithmetic (labeled, NOT a judged leg): even if every
zero meeting had dealt at its chain's non-zero median, the prices
stay beyond any observed window — eulogy non-zero median 23.5 →
ceil(853/23.5) = 37 more meetings; algorithm non-zero median 20.5 →
ceil(959/20.5) = 47 more. Eliminating zeros alone does not close a
chain; the per-hit damage scale is the binding constraint, with
zeros roughly doubling the eulogy price (75 vs 37) and more than
tripling the algorithm's (160 vs 47).

## Q(c) — re-meeting frequency: does the chain recur inside a run?

Yes, fast — and still not fast enough. Re-meeting gaps (days between
consecutive meetings of one chain):

| Chain | Gaps | Span (first→last meeting) |
|---|---|---|
| eulogy | 1, 1, 2 | d55→d59 (5 days, 4 meetings) |
| algorithm | 2, 3, 1 | d65→d71 (7 days, 4 meetings) |
| Band (6 gaps) | 1, 1, 1, 2, 2, 3 — median 1.5 | — |

The chain genuinely recurs inside a run: a beast re-meets every
1–3 days while the village lives. But the finish does not fit the
window that recurrence lives in. Seed 75102's wave-4 window runs
d55–d79 (25 days, 11 wild meetings) and its village is lost d86 —
seven days after the last wave-4 meeting. At the eulogy's observed
pace (4 meetings per 5 days), 75 more median-rate meetings need
~94 days; 36 best-rate meetings need ~45 days. At the algorithm's
pace (4 per 7 days), 160 median-rate meetings need ~280 days; 34
best-rate need ~60 days. No price computed here fits inside the
25-day wave-4 window, the 7-day tail after it, or the 86-day village
lifetime. Chain-finish is therefore a real recurrence pattern and a
fantasy finish at current rates: the question for the next arm is
not whether beasts re-meet (they do, in days) but what per-meeting
damage closes a chain inside a village lifetime.

## Q(d) — wall numbers (report-only, above)

Won 6/8 (full 0), national ever 6/8, national final 6/8, table 7/8,
entered 6/8, wave reach 8/8–8/8–7/8–5/8–0/8, median survival 114d
(upper-middle; statistical median 107.5d), deaths 232, starvation 2.
Full death-cause shares in the header section above.

## Census counts only (no lever judgment)

- Raid wave-4: 2 (d64 algorithm, DEATH r2, 1,000→986, dealt 14;
  d73 audit, FLEE r2, 1,100→1,066, dealt 34). INSUFFICIENT-DATA.
- Other wave-4: 0. INSUFFICIENT-DATA.
- Wild wave-4 per seed: 75102: 11 (vFlee 6, vDie 5); all other seeds: 0.
  Unlock (5/8) still overstates contact (1/8) fivefold.

## Sense-testing law (all 11 wild wave-4 transcripts read end to end)

S1 — d57 Aria vs eulogy, death r2, zero-dealt (narration): both
rounds are "Aria contradicts the narration — it says Aria runs /
falters — Aria advances / stands straighter", then Epitaph hits for
42, 40. The fight reads as a contest of narration, not of weapons:
Aria spends both turns refusing the story instead of striking. It
is coherent as signature play — and it is exactly why the eulogy's
zero meetings are not a bug to fix by "giving her a better weapon":
she HAS a kitchen knife and never swings it. The counter is the
trick (interrupt the story), not the gear.

S2 — d59 Daniyar vs eulogy, floor flee r1, zero-dealt (narration):
the no-arrows line opens the log, then the contradict line, then one
30-damage hit and the floor flee at 24 HP. Two candidate causes in
one log (arrowless sling, narration) — the transcript cannot tell
which one cost the strike, which is why the taxonomy's priority
order is disclosed rather than hidden. Either way the fighter leaves
with the beast untouched.

S3 — d67 Daniyar vs algorithm, death r2, zero-dealt (weapon): the
sling line opens; R1 is absorbs + a 31 hit + the Rage activation
line; R2 is absorbs + a killing 35 hit. No strike line anywhere.
Daniyar's Rage — a real ability firing — buys nothing because the
weapon it would double cannot fire. The ability and the weapon fail
together, legibly.

S4 — d71 Ursula vs algorithm, death r2, zero-dealt (weapon): the bow
line opens; R1 is a hit for 84, then field medicine (+20 HP); R2 is
a hit for 77, dead. The medicine beat is real play — and it buys
less than one round against 77–84 damage hits. The zero here is not
passivity: Ursula acts (medicine) and still never strikes, because
the bow has no arrows and she carries no melee weapon.

S5 — d65 Daniyar vs algorithm, joined, 29 dealt (the algorithm's
best): Rage doubles a strike to 24, Stan joins for 5, Daniyar binds
a wound mid-fight, and still flees at 20 HP. The fullest wild
algorithm fight — ability, medicine, join — totals 29 against 971
HP remaining. The join adds 5; the scale gap is ~30x.

S6 — d74 Mateo vs audit, joined, 58 dealt (the band's best wild
meeting): three rounds of 18-damage strikes, Terrence joins for 4,
Mateo dies to 41 anyway with the beast at 1,008/1,100. The best
wild wave-4 fight on the band still ends in death at 92% beast HP.
This is the number the next arm must beat: a chain-closing fight
needs an order of magnitude more than 58 per meeting, not a
marginal gain.

Cross-cutting sense findings: (1) every wild wave-4 fight is decided
in rounds 1–3 and ends in flee or death — no drive-offs, no kills;
(2) the flee lines land legibly (hopeless/floor lines present);
(3) the ammo gap is audible in 6 of 11 wild logs (sling/bow with no
arrows; no volley line appears in any of the 11 wild logs read here);
(4) signature mechanics cost damage by design (eulogy narration)
while weapon gaps cost damage by loadout (arrowless ranged-only) —
different causes, same zero, different fixes, and only the second
is a loadout problem.

## RANKED NEXT (with numbers — no lever built here)

1. CHAIN-CLOSE TARGET (the bridgeable question this arm prices).
   Price the per-meeting damage that closes a wild wave-4 chain
   inside a real window: the eulogy needs 853 HP over the meetings a
   village lifetime actually contains (at its 4-per-5-days pace, the
   27 days from its last meeting d59 to the d86 village loss hold
   ~21 more meetings → ~41 damage per meeting, vs observed median
   11.5 / best 24). A lever that cannot move per-meeting damage
   toward that order of magnitude cannot finish a chain, however it
   treats zeros.
2. ZERO-CAUSE EXCLUSIVITY PROBE. The 4 zero meetings are
   overdetermined (narration+weapon, weapon+Rage, weapon+medicine).
   Next measurement: do arrowed ranged fighters strike through the
   eulogy's narration, and do melee fighters strike on Rage turns?
   Until one factor varies alone, the 2/2 split is a first-match
   label, not an exclusive-cause verdict.
3. JOIN EFFECTIVENESS AT WAVE-4 SCALE (carried, unjudged here).
   Joined wild fights add 6, 5, and 4 ally damage vs 853–1,008 HP
   remaining. A party lever must change ally output at this scale,
   not just add a party member.
4. RAID-SHAPE WAVE-4 — INSUFFICIENT-DATA (n=2). Do not judge any
   raid-shape lever from 2 meetings.
5. AMMO AT WAVE 4 (carried, below chain work). 6/11 wild logs carry
   the no-arrows line; 0 volleys. Ammo is a real gap but, per the
   supplementary arithmetic, fixing it alone leaves prices at
   37/47 — it is not the front door to a chain finish.

## Findings-backlog items found (reported to the coordinator; NOT appended to sim-findings.md by this worker)

- F-1 (instrument, metric-review-linked): shoutrec roundTotals is a
  morale-entry snapshot series that lags the final round whenever
  the final round deals damage (85/975 rows band-wide; 1 wild
  wave-4 row). Any future arm using roundTotals as final totals
  will misread damage. Proposed corrected leg in Metric review.
- F-2 (measurement gap): zero-dealt causes are overdetermined in
  transcripts (narration+weapon, weapon+Rage, weapon+medicine);
  first-match taxonomy labels them but cannot prove exclusivity.
  Needs a single-factor-variation measurement (ranked next #2).
- F-3 (design question, steve-call candidate): the eulogy's
  narration-suppressed meetings spend the fighter's turns refusing
  the story — if the intended counter is "interrupt the story",
  no transcript in-band shows a successful interrupt dealing
  damage. Whether narration turns should ever deal damage, or
  always cost the turn, is a design ruling, not a measurement.
- F-4 (carried observation): wild wave-4 contact remains a one-seed
  phenomenon (1/8 seeds, 75102 only) while unlock is 5/8 — the
  encounter-rate gap is unchanged on this corpus and bounds every
  wave-4 claim to one village's 25-day window.

## Guards (reported, not judged — this arm changes nothing)

- Death causes (232 total) and wall numbers are reported above; no
  guard moves under a measurement-only arm.
- No guard can move under a measurement-only arm.

## Metric review (for the NEXT run — nothing re-scored here)

- SHOUTREC FINAL-EQUALITY LEG (the leg that decided this NO-GO):
  as written it is WRONG about the instrument. roundTotals is
  documented in src/js/fieldFights.js as "per-round cumulative
  damage totals at morale entry" — a snapshot series, not final
  totals. A fight ending before the next morale entry (death,
  flee, or kill decided in later phases of the final round) never
  records its final round. Proposed revision for the next run:
  replace final-equality with (a) breakline==w4dpr final agreement
  (975/975 here) AND (b) shoutrec prefix-consistency: roundTotals
  entries non-decreasing, each <= the final total (368/368 here,
  0 violations). The coordinator re-judges this arm's verdict
  under the corrected leg; this arm does not re-score itself.
- MEDIAN-DAYS CONVENTION (carried): the analyzer reports the
  upper-middle row (114d); the statistical median is 107.5d. This
  evidence quotes 114d for comparability and notes 107.5d here.
- CHAIN DEFINITION (wild-universe-relative): chains here are
  defined inside the wild universe only, so a wild chain's opening
  HP can be inherited from a raid meeting (audit 1,066). Future
  chain arms must state their universe in the chain definition, or
  cross-shape chains will silently double-count or misprice.
- MEDIAN-WITH-ZEROS: chain medians include zero meetings by design
  (zeros are meetings). The supplementary non-zero-median prices
  (37/47) are reported alongside precisely so a reader can see both
  the honest median price and the zero-eliminated price — neither
  is substituted for the other.
- SENSE-BAR WORDING: the "read all when <= 40" clause worked (11/11
  read). Keep it; the stratified rule for > 40 stays pre-stated
  and unused.

## Convergence note

Scale-onramp stays converging, NOT converged. This arm moves no wall
number — by design, it is diagnosis — but it replaces the w4shape
chain sketch (illustrative per-beast arithmetic on the full 13) with
a wild-only, per-cause, per-chain price on its own corpus: zeros
decompose 2 narration / 2 weapon, leader-zero-ally-positive is 0,
wounds persist exactly, chains recur every 1–3 days, and no price
fits inside the hosting village's lifetime — even with zeros
removed. The next arm that claims movement on this axis must move
one of those measured quantities — a finished beast, a per-meeting
damage rate near the ~41/meeting window scale, a zero cause
eliminated by single-factor evidence — not re-describe them.

## Infrastructure notes

- No container EPERM flap on the sweep itself (13.5 min wall under
  sibling load, ~1 min/seed; faster in quiet conditions).
- Safe-commit index clobber hit both worker commits (prereg,
  instruments) — repaired via HEAD-blob cacheinfo each time with
  hash verification, never reset, never forced, commits verified
  correct. Same clobber class as the 2026-10-29 loop notes.
- Scratch dir (determinism re-run of s75102) removed after its diff;
  the worktree holds only committed work plus the corpus committed
  with this file.
- Analyzer exits 1 on the completeness sub-leg ONLY (shoutrec
  final-equality); fixtures FIXTURES-PASS (35 checks, 0 fails);
  determinism DETERMINISM-PASS; sense read 11/11 logs (SENSE-OK by
  reading).
- No live verification, no push, no bump: this arm reports "ready
  for coordinator merge, pending ship" per assignment. The batch
  ship job owns pushes.

## Files

- Corpus: evidence/2026-10-29/perseed-chainfinish-a/s75101–s75108-fresh.json
  (8 rows) + summary.json (corpusOk true) + analysis.json (analyzer
  output: census, zero-by-cause, chains, wall).
- Analyzer: scripts/analyze-chainfinish-a.js (wild universe, beast-zero
  taxonomy, chains, prices, intervals, wall).
- Sweep: scripts/sweep-chainfinish-a.js (w4shape sweep pattern verbatim,
  corpus perseed-chainfinish-a).
- Fixtures + determinism: scripts/test-chainfinish-a.js (35 checks;
  --determinism <seed> re-runs one seed to scratch and diffs).
- Prereg: evidence/2026-10-29/sim-chainfinish-a-prereg.md (b32400c4c).
- Instruments: scripts/sweep-chainfinish-a.js +
  scripts/analyze-chainfinish-a.js + scripts/test-chainfinish-a.js
  (60304611f).
