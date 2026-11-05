# Fresh-kill inversion DIAG — DIAG-NO (arm sim-freshkill-a)

Run: fleshout-20261105T1515Z (Loop A). Axis: scale-onramp / winnability
chain (wild ally-join → wave-4 kills → veterans → readiness-5 release →
wave-5 facing → full seat). Prereg:
`evidence/2026-11-05/sim-freshkill-a-prereg.md` (committed BEFORE any
judged sim). Instrument: `scripts/grindfinish-instrument-20261105.js`
reused VERBATIM from grindfinish-b (its proof, 26/26, covers the
capture). Driver: `scripts/freshkill-driver-20261105.js`. Analyzer:
`scripts/freshkill-analyze-20261105.js` (channel classifier + ±1-day
kill matcher). Proof: `scripts/test-freshkill-a.js` 34/34 (classifier
fixtures, ±1-day matcher fixtures, verdict fixtures incl. GO / NO /
UNDERPOWERED / GO-over-UNDERPOWERED, live smoke, off/on neutrality,
live determinism). Corpus:
`evidence/2026-11-05/perseed-freshkill-a/` (8 files, seeds 99351–99358,
150d, competent policy verbatim, 0 instrument errors).

## Verdict — DIAG-NO. The inversion does not reproduce as a channel difference.

The wild fight and the siege fight are NOT measurably different fights
on this band — because the wild fight barely happens at all. Channel A
(pending-live wanderer fresh-entry) appeared exactly ONCE in 27 TB
fights; the siege (channel B, lifted) is 23 of 27. The band's only
kill came through the SIEGE, not the wild fight — the reverse of
grindfinish's shape, on n = 1 kill. No channel pair clears the
prereg's ≥8-fights-per-channel leg, so the GO bar fails on sample,
not just on gap.

| Pre-registered rule | Measured | Holds? |
|---|---|---|
| DIAG-GO: some channel pair differs by ≥15pp with ≥8 fights in each channel | Best pair gap 4.3pp (B 1/23 = 4.3% vs A 0/1, C 0/1, D 0/2); NO pair has ≥8 fights in both channels (only B clears 8) | **NO** |
| UNDERPOWERED: total wave-4 TB fights < 20 (unless GO met) | Total TB fights = 27 | No — powered |
| **DIAG-GO** | | **NO** |

No Stage 2: the prereg runs a lever only on DIAG-GO. No game-code change
was made at any point; no gate, price, deed-gate, readyDemand, VETSHAPE,
flee/retreat, or food change. DIAG ONLY. Loop B's adopted vetrest /
tbretreat arms are untouched by this arm.

## The channel table (±1-day join; the verdict table)

| Channel | Fights | Kills | Kill rate | Entry fracHi median | Damage frac median | Rounds median | Party median | Solo fights / solo kills |
|---|---|---|---|---|---|---|---|---|
| A — pending-live wanderer fresh-entry | 1 | 0 | 0% | 0.925 | 0.133 | 7 | 1 | 1 / 0 |
| B — lifted-siege | 23 | 1 | 4.3% | 0.650 | 0.054 | 5 | 1 | 12 / 0 |
| C — wounded-entry | 1 | 0 | 0% | 0.239 | 0.011 | 9 | 1 | 1 / 0 |
| D — other | 2 | 0 | 0% | 0.875 | 0.093 | 7 | 1 | 2 / 0 |
| **TB total** | **27** | **1** | **3.7%** | — | 0.059 | 5 | 1 | 16 / 0 |
| Field (no channel) | 15 | 0 | 0% | — | 0.054 | 2 | 3 | — |

Same-day-only table (grindfinish rule, comparability secondary):
identical — A 0/1, B 1/23, C 0/1, D 0/2. The ±1-day join matched
ZERO kills on the +1 day (killsMatchedNextDay 0, sameDayMatched 1);
the staypolicy midnight-spanning concern does not bite on this
corpus, and the verdict is the same under either rule.

Pairwise gaps: A–B 4.3pp (1/23 fights), B–C 4.3pp (23/1), B–D 4.3pp
(23/2), A–C 0, A–D 0, C–D 0. No pair has bothGe8. The GO bar fails
twice over: the biggest observed gap (4.3pp) is far under 15pp, and
only one channel is populated enough to compare at all.

## What the channels actually were

- **A, the one wild fight** (99354 d75, algorithm): solo visjoin_44,
  entry 1110 (fracHi 0.925), 7 rounds, 148 damage dealt, death. The
  scholar-initiated wild fight exists — it just almost never happens:
  villages meet wave-4 beasts as sieges, not as wanderers.
- **B, the siege** (23 fights): entry fracHi median 0.65 — the lift
  carries moderately wounded beasts into TB, as grindfinish measured
  (lifted-entry median 0.60 there). 12 of 23 solo; the one kill was
  the band's only party-of-4 fight. Lift fidelity 23/24 (see below).
  13/23 carry worldOrigin (titan/lingering). Strict field→TB links:
  4 (99351 d74 algorithm 911→911 after 6d; 99354 d75 eulogy 849→849;
  99354 d77 algorithm 835→835; 99358 d121 influencer 758→758) — the
  lift carries field wounds into TB, reproducing grindfinish's
  mechanism check.
- **C, the one wounded entry** (99354 d55, suburb): lifted lingering
  beast, entry 359 (fracHi 0.239), 9 rounds, **4 damage dealt**,
  death. The grind tail WAS reached on this band — the previous
  fight (99354 d54, party of 3, 17 rounds) ground the same suburb
  1205→359, 846 damage, the biggest single-fight damage on the band
  — and the next scholar, facing a 359-HP beast, dealt 4 damage in
  9 rounds and died. Wounded entries are still thin (1 fight, same
  as grindfinish's 3), and this one says finishing at the tail is
  the problem, not reaching it.
- **D, the residual** (2 fights): both algorithm, non-lifted
  non-pending, fracHi 0.875, solo, death. Sub-counts:
  pendingLive-nonfresh 0, veteran 0, doorFled 0, contestOrTrial 2.
  No veteran TB fights on the band (veteranTb 0); no door-flee
  re-engages (0).

## The one kill (99355 d74, influencer — channel B)

Party of 4 (scholar Pavel Dubinin + Giulia Bianchi, Nina Petrova,
companion gen_e4nonj6 "Thoa"), 11 rounds, 580 damage = 100% of entry
HP, killer Thoa (companion — the scholar did not land it). Entry 580
(fracHi 0.55, middle) against a pre-call alias read of 594 — the
lift-fidelity mismatch (see below). The beast had been met in the
field two days earlier (d72, entry 850 → 807, fled) — but the TB
entry (580) is NOT the field exit (807), so this is not a strict
field→TB link; the world entity lost 213 HP between the field exit
and the TB alias read with no recorded fight between (same #1169
class as grindfinish's unexplained drops). Thoa lived 20 days as a
veteran (killed d74, died d94 "the wild") — the band's only living
killer at any point, and dead by the run's end (living killers at
end: 0).

Near-kills that were not: 99353 d93 influencer, SOLO, 13 rounds, 448
damage (70% of entry HP), death. 99354 d75 eulogy, party of 5, 5
rounds, 260 damage (31%), death. Two TB fights ended with the scholar
dealing ZERO damage (99355 d69 reunion, 3 rounds; 99355 d104 eater,
5 rounds) — scholars dying without landing a hit.

## Per-seed table

| seed | days | end | w4 fights (F/TB) | w4 kills | TB by channel A/B/C/D | killers (living) | rank | standing |
|---|---|---|---|---|---|---|---|---|
| 99351 | 91 | village-lost | 6 (3/3) | 0 | 0/2/0/1 | 0 (0) | village | 125 |
| 99352 | 93 | village-lost | 1 (0/1) | 0 | 0/0/0/1 | 0 (0) | village | 100 |
| 99353 | 94 | village-lost | 11 (3/8) | 0 | 0/8/0/0 | 0 (0) | village | 100 |
| 99354 | 78 | village-lost | 11 (4/7) | 0 | 1/5/1/0 | 0 (0) | village | 115 |
| 99355 | 150 | survived | 9 (3/6) | 1 | 0/6/0/0 | 1 (0) | village | 190 |
| 99356 | 55 | village-lost | 0 (0/0) | 0 | — | 0 (0) | village | 25 |
| 99357 | 141 | village-lost | 0 (0/0) | 0 | — | 0 (0) | village | 99 |
| 99358 | 122 | village-lost | 4 (2/2) | 0 | 0/2/0/0 | 0 (0) | village | 140 |
| BAND | med 93.5 | 7 lost, 1 surv | 42 (15/27) | 1 | 1/23/1/2 | 1 (0) | — | — |

## Wall numbers

Wins 0/8, national 0/8, table 0/8, wave-4 unlocks 6/8, wave-4 faced
6/8, wave-5 unlocks 0/8, wave-5 faced 0/8, readiness-5-ready days 0
(band total), median survival 93.5d (range 55–150d; 7 villages lost,
1 survived to the horizon). TB endings band-wide: death 26,
kill-or-rout 1, fled 0. Field endings: flee 14, death 1, kill 0.
Scholar deaths are not instrumented as a cause share by this arm
(not reported, not guessed).

Two seeds never reached wave 4 at all: 99356 died at day 55
(standing 25, maxWave 3) and 99357 lived 141 days at standing 99 —
one point short of the wave-4 door for the whole run. 99355 survived
to the 150d horizon at standing 190, still 10 short of the wave-5
door and 0 ready days.

## Per-seed chains (the grind read)

- **99353 reunion, day 93 alone**: SEVEN TB fights in one day against
  the same reunion — 900→864, 1200→1149, 900→852, 852→772, 772→655,
  655→613, 613→545 — every one a scholar's death, party sizes 1–2.
  The village threw seven people at one beast in a single day and
  the beast ended the day at 545 HP. The grind works; its price is
  a life per step (grindfinish's headline, reproduced).
- **99354 suburb, days 53–55**: 1300→1253→1205→359→355 — the 17-round
  party fight that did 846 damage, then the 4-damage tail fight.
- **99354 eulogy, day 75**: field 900→849 (flee), TB 849→589 in 5
  rounds with a party of 5 — the biggest party on the band, still a
  death.
- **99355 influencer, days 72–74**: field 850→807 (flee), TB
  580→KILL (party of 4, 11 rounds) — the band's only kill, and the
  only TB fight where damage reached 100% of entry HP.
- **99355 suburb, days 95–96**: 975→942→901 across two days, both
  deaths — the grind continuing at its usual pace.
- **99358 influencer, days 120–121**: field 850→758 (flee), TB
  758→713 (death, 10 rounds, solo) — a strict field→TB link that
  still ended in death.

## Sense-testing (narration)

Read the seed-99355 kill day (d74) and the seed-99354 death days
(d54–55, d75) end to end. The kill passes WITHOUT a triumph beat —
reproducing grindfinish's gap exactly: on d74 the captured lines
mourn Lena Ruiz ("🕯️ Lena Ruiz is dead — the wild. The village
stops. Somebody screams. Somebody else starts digging.") and bury
her keepsakes, while the influencer kill that same day gets no line
at all — no "we killed it," no naming of the beast. The kill fight's
own signature IS legible, though: "Giulia SCREAMS — a sound like
milk curdling in fast-forward. The The Influencer freezes.
(stunned)" and the follower-turn cascade (-1 to -4 favor, with -4
appearing twice). The village's fiction notices deaths and keepsakes
and raids, but not the one wave-4 kill in eight villages — and it
never notices the grind either: on 99353's day 93, seven scholars
die to the same reunion and no line names the beast or its remaining
HP (545). One bright spot: d70, "⚔️ Thoa stood down the Redactor
and kept walking — 3 rounds, bloodied but breathing. It's still out
there, somewhere." — a survived wave-3 fight gets a proper beat.
The d75 triple death on 99354 (Dylan, Catalina, Nikolai, all in one
day) reads as a village bleeding out, coherently and grimly.

## Metric review

- The DIAG-GO bar was NOT judgeable as a comparison: total TB fights
  = 27 (≥ 20, so the band is powered by the prereg's rule), but only
  ONE channel (B, 23 fights) clears the ≥8-fight leg. The verdict is
  DIAG-NO on the rule as written, but the operative fact is a
  distribution fact, not a rate fact: the wild fight is a 1-in-27
  event. A future arm that wants to compare A vs B needs the wild
  fight to happen — either a fatter band (more seeds) or a
  longer-lived substrate (villages that survive to meet more
  wanderers), not a re-run of this 8-seed shape.
- The ±1-day join changed NOTHING on this corpus: 0 kills matched
  on the +1 day, same-day table identical. The staypolicy
  midnight-spanning concern is real in principle and unbitten here;
  the rule stays as the better default for the next run.
- Precedence check (A > C > B > D): ONE B fight carried pendingLive
  as well (99358 d121, influencer — lifted AND pendingLive, entry =
  alias HP exactly). It is counted B because A requires !lifted.
  Moving it to A would make A 0/2 and B 1/22 — no verdict input
  moves by ≥ 5pp, and no pair gains an ≥8 channel. The precedence
  did not decide the verdict. The D residual is small (2 fights,
  both contestOrTrial) and needs no split.
- Lift fidelity 23/24: the one mismatch IS the kill fight (99355
  d74 influencer entered TB at 580 against a pre-call alias read of
  594, −14 HP) — same unexplained class as grindfinish's 99315
  6-HP mismatch (877 → 871), larger scale. No verdict input depends
  on it (the fight counts B either way and its entry frac is as
  recorded), but the second sighting of a pre-fight HP discrepancy
  on the kill fight itself deserves a code read before anyone
  explains it. Also the 99355 influencer lost 213 HP between its
  d72 field exit (807) and its d74 TB alias read (594) with no
  recorded fight between — #1169-class unexplained drop.
- TB fights are all-in for the third band running: 0/27 fled (and
  0/34 on grindfinish). The competent policy never retreats a TB
  fight; every grind step is death-or-win. This is Loop B's
  tbretreat arm's territory, not this arm's.
- The 150d horizon bound one seed (99355 survived to it) and no
  other; median survival 93.5d. The horizon did not bind the
  measurement.

## Telemetry / balanced panel

- Telemetry check: attempted; the tool REFUSED the recorder corpus
  ("refusing recorder-corpus input: all 8 --current rows carry
  top-level anchorCommit, so they are sweep recorder rows, not runs.
  Recorder corpora are compared with sweep-compare tables, never
  against a run baseline here."). No LOUD lines, no deviation to
  investigate — the tool declines this corpus shape. No
  `--update-baseline` was run (reseeding a baseline from a DIAG
  corpus would be wrong). Wall numbers are reported directly above,
  never fabricated into a compare.
- Balanced panel (§15): no compare `.md` is attached. A DIAG corpus
  has no before/after pair to panel (same limit as dmground /
  grindfinish recorded).

## Next blank (per the prereg's diagnostic-intermediates rule)

**The wild fight is nearly absent — the village never gets to choose
it.** On this band the question "which fight should the village
choose" has no choice in it: 23 of 27 TB fights are lifted sieges,
1 is a wild wanderer fight, 1 is a wounded entry. The next work on
this question is NOT another 8-seed channel comparison — it is either
(a) a powered A-vs-B comparison on a fatter band / longer-lived
substrate, so channel A actually shows up, or (b) the fight-interior
work: the siege grind reaches its tail (359 HP) and the next scholar
deals 4 damage in 9 rounds — finishing, not reaching, is what fails
there. The adopted vetrest/tbretreat arms (Loop B) attack
survival-per-TB-fight from the other side. Do NOT re-run a
channel-plumbing probe: the lift, the pending-live capture, and the
±1-day join are all measured working.

## Findings outside this arm (for the coordinator to append to sim-findings.md — NOT edited here)

- Fresh-kill inversion does NOT reproduce as a channel difference:
  channel A 0/1, channel B 1/23 on a fresh band; the only kill came
  through the lifted siege. The wild fight is a 1-in-27 event.
- Lift-fidelity mismatch, second sighting: 99355 d74 influencer
  entered TB at 580 vs alias 594 (−14 HP), on the kill fight itself.
  Same unexplained class as grindfinish's 99315 −6 HP.
- Unexplained HP drop, #1169 class: 99355 influencer 807 (field
  exit d72) → 594 (TB alias d74) with no recorded fight between.
- Zero-damage TB deaths: 2 scholars died in 3–5 rounds dealing 0
  damage (99355 reunion d69, eater d104).
- Grind-tail finishing failure: 99354 suburb ground to 359 HP (17
  rounds, 846 damage, party of 3); the next scholar dealt 4 damage
  in 9 rounds and died.
- Kill without a triumph beat (second sighting): 99355 d74 influencer
  kill gets no line; the same day's death (Lena Ruiz) is mourned
  instead. The grind is invisible in the fiction (99353: seven
  scholars die to one reunion in one day, no line names it).
- 99357 sat at standing 99 for 141 days — one point short of the
  wave-4 door for the whole run.
- TB fights all-in, third band running: 0/27 fled.
- Data/canon note: `src/data/monsters.json` carries TEN wave-4 defs,
  not the nine MONSTER-WAVES.md names — the tenth is `herald`
  [700, 900]. No herald fight appeared on this band; the analyzer
  counts it as wave 4 like the engine does.

## Files

- Prereg (committed BEFORE any judged sim): 0e0bae753d38d6c957472116fb29cdf7c916632e
- Instrument (reused verbatim from grindfinish-b) + driver + analyzer
  + proof (34/34): 31cd0527dea686356d170989c02985237662024d
- Corpus: `evidence/2026-11-05/perseed-freshkill-a/` (8 files).
- This file: `evidence/2026-11-05/sim-freshkill-a.md`.
- DIAG ONLY: zero src/js changes, zero default flips, zero
  combat-code changes. No [needs-eyes] flag: measurement only.
  Ready for coordinator merge, pending ship (coordinator merges via
  --ff-only; no push, no bump, no live verification by this worker).
