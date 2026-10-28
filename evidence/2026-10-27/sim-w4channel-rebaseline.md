# sim-w4channel-rebaseline — the fresh wave-4 channel census: GO, and the new parity baseline

Run: fleshout loop, run fleshout-20261028T0144Z. Axis: scale-onramp
(the blocking axis). Worker: sim-w4channel-rebase.
Worktree: `~/workspace/worktrees/sim-w4channel-rebase` (branch
sim-w4channel-rebase).
DIAG / MEASUREMENT ONLY — zero src/js changes, zero default flips, no
game lever, no demand/deed number moved, no game fix proposed. The
deliverable is knowledge: a FRESH faced → engaged → killed census by
channel, with killer identity first-class, on current code — and, on
GO, the census family's new parity baseline.

Preregistration (binding, committed BEFORE any judged sweep):
evidence/2026-10-27/sim-w4channel-rebaseline-prereg.md (commit
2cd2665b0). Corpus: evidence/2026-10-27/perseed-w4channel-rebaseline/
(8 rows + summary.json + analysis.json + sense-75104.txt).
Instruments (copies only, originals untouched):
scripts/test-w4channel-rebaseline-sweep.js,
scripts/test-w4channel-rebaseline.js (proof validator / analyzer,
exit 0), scripts/test-w4channel-rebaseline-sense.js. The copies
differ from the originals ONLY in default corpus dir, labels, and
the loadGame mode label (manifest only).
Detgate: PASS (seed 75101: baseline vs recorders-OFF days 132/132,
gameDays 132/132, tsNationalDay 77 both, no diag surface, no wraps
installed, post-setup world 0). The original channel script's
detgate on this checkout gives the same 132/132 — the copies are
faithful, and the 132 vs the lethality band's 130 is checkout drift
(see "Headline divergence" below), not a copy error.

## Plain words first

This band meets wave-4 monsters a lot more than the old band did —
51 Mirror Draft monsters are born into the world across four seeds,
29 of them are fought — and kills none of them. Not one. The
funnel's narrowest part is, again, the kill itself: 29 engaged
arrivals, 0 killed, 0 fights lethal out of 69. The other four seeds
never meet a wave-4 monster at all: three of them win through the
lesser seat before wave 4 ever arrives (75101 at day 132, 75104 at
day 90, 75105 at day 162), and one survives the whole horizon at
wave 3 (75107). So the fresh picture has two halves: villages that
never reach the Mirror Draft because the lesser seat ends their
story first, and villages that reach it, fight it dozens of times,
and kill nothing.

## Verdict: GO (binding prereg, no re-score)

GO required legs (a)-(e) plus the detgate leg and the
baseline-declaration leg:

- (a) 8/8 configs valid: PASS. 8 rows, days > 0, every gate + deed
  + channel field present, recorder errors 0 on all six
  recorders, no overflow. Validator G1 PASS.
- (b) >= 95% of wave-4 arrivals classified into a known outcome:
  PASS. 51/51 (100%): still-present 34, melted 12, departed 5,
  unknown 0.
- (c) Channel attributed for >= 90% of wave-4 fights and 100% of
  wave-4 kills: PASS. 69/69 fight events attributed (100%); 0
  wave-4 kills, so the kill-attribution clause holds vacuously —
  stated plainly, not hidden: there were no kills to attribute,
  and the empty kill table IS the finding (the zero-kill branch
  in the prereg applies: the census completes, there is NO
  second judged band).
- (d) Narrowest funnel stage named with counts and shares: PASS.
  ENGAGED → KILLED, 0/29 engaged arrivals killed (0.0%), 0/69
  fights lethal, against arrivals → engaged 29/51 (56.9%).
  Faced-type count alongside, labelled per-type, never merged:
  21 per-seed faced-type counts (8 distinct types band-wide:
  influencer, audit, reunion, eulogy, suburb, eater, strike,
  algorithm).
- (e) SENSE: one seed's wave-4 thread read in plain words: PASS
  WITH A STATED ABSENCE (see "Sense-testing read" below). The
  fixed seed 75104 carries NO wave-4 thread on this band (0
  arrivals, 0 faced types, run ends day 90 at wave 3 via the
  lesser seat), so the sense read covers the seed's actual late
  thread and reports that absence as the finding. The replay
  window was adapted to the seed's real horizon (DAYS=90,
  window d60-d90) because the instrument's default window
  (d150+) is empty — the run ends at day 90. This adaptation
  is disclosed here, not hidden; see Metric review for the
  prereg flaw it exposes.
- DETGATE LEG: PASS (above).
- BASELINE-DECLARATION LEG: TRIGGERED. On this GO, this corpus
  (evidence/2026-10-27/perseed-w4channel-rebaseline/) BECOMES
  the parity baseline for the census family, replacing the
  retired w4channel-a corpus for parity purposes. Future arms
  judge parity against THIS corpus, not the retired one. (The
  retired corpus's conversion-zero finding still stands on its
  own base; only its use as a parity baseline was retired, and
  this run does not re-judge it.)

VERDICT: GO. The census is complete; the conversion it measures
is zero; the corpus is the new parity baseline.

## The band (binding design, as pre-registered)

- Seeds 75101-75108, as assigned. Single arm:
  scripts/policies/tableseat-nowait.js VERBATIM, LEANLINKRESCUE=1,
  TABLESEATNOWAIT=1, recorder on-switches RAFTDRAFT=1, SPAWNSRC=1,
  OLDCORE=1, W5BIRTHS=1, DEFWOUND=1, NONWORLDKILL=1.
- Horizon 180d DEATH-AWARE (runDays stops on death/win; +10d tail
  max). Sweep wall time ~15 min for 8 seeds (plus detgates ~4 min
  for both the copy and the original-script check).
- Substrate-activation gate: band courtship combined = 121
  (courtCounters 0, courtAccords 24, courtNational 9, courtGlobal
  5, tended 59, defenseCalls 0, proposedLead 24), seeds active 8/8
  — GATE PASSES (combined > 0 and >= 6/8 active). No inactive
  seed on this band.
- Freshness, as disclosed in the prereg (not assumed): this band
  is the same seed band as w4channel-a and w4lethality, but the
  quantities are re-measured on current code — the corpus is
  fresh by construction (new sweep, new rows), and its headlines
  diverge from the lethality band on every seed (see "Headline
  divergence"), which is itself the proof that it is not a copy
  of any prior corpus.

## Wall numbers (THIS band only, never pooled)

| field | this band (75101-75108) | lethality band | channel band (retired) |
|---|---|---|---|
| national ever / final | 7/8 / 5/8 | 6/8 / 3/8 | 7/8 / 6/8 |
| table invited / entered | 6/8 / 3/8 | 6/8 / 3/8 | 5/8 / 5/8 |
| wins (lesser / full) | 3/8 (3 / 0) | 3/8 (3 / 0) | 5/8 (5 / 0) |
| wave-4 unlock | 5/8 | 6/8 | 3/8 |
| wave-5 unlock | 0/8 | 0/8 | 0/8 |
| median survival | 162d upper / 154d conventional (days: 90, 114, 132, 146, 162, 177, 180, 180) | 130d upper / 127d conventional | 145d |
| starvation deaths | 2 (both 75108) | 0 | 1 |
| deaths total | 299 | 248 | 221 |

Per-seed ends: 75101 won lesser d132 (wave 4, national); 75102
village-lost d177 (wave 4, global); 75103 survived d180 (wave 4,
regional, table invited, never entered); 75104 won lesser d90
(wave 3, national); 75105 won lesser d162 (wave 3, global); 75106
village-lost d146 (wave 4, regional); 75107 survived d180 (wave 3,
global, never tabled); 75108 village-lost d114 (wave 4, regional).
Arc IV (table entered): 3/8. All three wins are lesser-seat,
feared-path wins (tableState.path feared on all three). The full
seat is still nobody's story; wave 5 is still unreached.

Death-cause shares (299 deaths): villager combat 106 (35.5%),
villager-vs-villager combat 80 (26.8%), player arena 53 (17.7%),
expedition 22, villager monster 19, ambush 4, villager sickness 3,
player the night 2, player sickness 2, player contest 2, villager
starvation 2, singles (villager alien, The Algorithm, a toad like
a war drum, thirst). Combat in all its forms is 239/299 (79.9%)
of all deaths; starvation is 2 — starvation does not explain
anything on this band either.

## The funnel (the judged measurement)

Arrivals → engaged → killed, by channel. Arrivals are world
births only (51); faced-type counts are per-type deed quantities
and are NOT merged into the per-instance funnel.

| stage | count | share |
|---|---|---|
| arrivals (world births, wave 4) | 51 | — |
| engaged (>= 1 seq-linked fight row) | 29 | 56.9% of arrivals |
| never-engaged | 22 | 43.1% of arrivals |
| engaged, not killed | 29 | 100% of engaged |
| killed arrivals | 0 | 0.0% of engaged, 0.0% of arrivals |
| all wave-4 kills (incl. non-arrival) | 0 | — |

Fight events (69, all attributed) by channel:

| channel | fight events | share | kills in channel |
|---|---|---|---|
| villager-field | 37 | 53.6% | 0 |
| player-tb-world | 25 | 36.2% | 0 |
| raid-defender | 4 | 5.8% | 0 |
| non-world-TB | 2 | 2.9% | 0 |
| other | 1 | 1.4% | 0 |
| contest | 0 | 0% | 0 |
| trap | 0 | 0% | 0 |

Per-channel conversion (kills / fights): 0% on every channel.
Engaged arrivals by channel (an arrival can carry more than one
channel across fights, so these sum past 29): player-tb-world 18,
villager-field 16, raid-defender 4. The two non-world-TB fight
events (75101 influencer, 75103) produced no kill and no engaged
arrival attribution beyond the event itself; the single `other`
event is 75106's origin-unresolved TB row.

Per-seed funnel:

| seed | days | wave | arrivals | engaged | faced types | fight events | kills |
|---|---|---|---|---|---|---|---|
| 75101 | 132 | 4 | 0 | 0 | 1 (influencer) | 1 (non-world-TB) | 0 |
| 75102 | 177 | 4 | 8 | 4 | 4 | 10 | 0 |
| 75103 | 180 | 4 | 15 | 9 | 7 | 15 | 0 |
| 75104 | 90 | 3 | 0 | 0 | 0 | 0 | 0 |
| 75105 | 162 | 3 | 0 | 0 | 0 | 0 | 0 |
| 75106 | 146 | 4 | 13 | 9 | 6 | 25 | 0 |
| 75107 | 180 | 3 | 0 | 0 | 0 | 0 | 0 |
| 75108 | 114 | 4 | 15 | 7 | 3 | 18 | 0 |

Outcomes for the 51 arrivals: still-present 34, melted 12,
departed 5, unknown 0. The 12 melted are lost-fight dissolutions,
not kills — no kill-log entry, no killer. The most-fought
monster shape on this band: 75103's suburb is fought across
channels (villager-field + player-tb-world) and departs; 75106's
eulogy line is fought repeatedly (villager-field + player-tb-world
across d127-d131) and melts. No arrival is fought to a kill in any
channel.

Killer identity table: EMPTY. 0 wave-4 kills, so 0 rows in every
identity class (scholar-player 0, villager 0, player-literal 0,
unknown 0) and 0 living wave-4 killers at end on every seed. The
wave-5 veterans bar stays 0 on all 8 seeds — not because killers
died (the lethality band's shape), but because there are no
killers at all on this band.

Recorder-gap measures (not channels): unlinked fieldFights 2
(75102, 75103 — raftdraft fieldFights wave 4 with no seq join);
unpaired tbEnds 0; wave-4 raiders 24, all 24 traced to a spawn
seq. Arrival reconciliation: spawn-only arrivals 0, birth-only
arrivals 0 (oldcore wave-4 births == spawnsrc wave-4 spawns
joined on seq, on all four arrival seeds).

## Headline divergence vs the lethality rerun band (finding only)

This run does NOT re-judge the lethality arm. The comparison below
is a finding about checkout drift, reported because the task
requires it — and it is the reason this re-baseline exists.

Per-seed headlines, lethality → rebaseline (days / won / wave /
table-invited / entered / deaths / courtship / wave-4 fight events):

- 75101: 130 → 132, won 1 → 1, wave 4 → 4, table 1 → 1, entered
  1 → 1, deaths 25 → 34, court 18 → 7, fights 6 → 1.
- 75102: 171 → 177, won 0 → 0, wave 4 → 4, table 0 → 0, entered
  0 → 0, deaths 49 → 42, court 30 → 8, fights 25 → 10.
- 75103: 180 → 180, won 0 → 0, wave 4 → 4, table 0 → 1, entered
  0 → 0, fights 1 → 15. (Days match; the table invitation and
  the fight count do not.)
- 75104: 168 → 90, won 0 → 1, wave 4 → 3, table 1 → 1, entered
  0 → 1, deaths 50 → 24, court 30 → 24, fights 21 → 0.
- 75105: 30 → 162, won 0 → 1, wave 1 → 3, deaths 5 → 36, court
  0 (inactive) → 27, fights 0 → 0.
- 75106: 101 → 146, won 1 → 0, wave 3 → 4, deaths 19 → 40, court
  8 → 23, fights 0 → 25.
- 75107: 124 → 180, won 1 → 0, wave 4 → 3, deaths 23 → 31, court
  10 → 12, fights 0 → 0.
- 75108: 114 → 114, won 0 → 0, wave 4 → 4, deaths 39 → 42, court
  27 → 12, fights 8 → 18. (Days, win, and wave match; deaths,
  courtship, and fight counts do not.)

No seed matches fully; days match on only 2/8 (75103, 75108).
That is total trajectory divergence, not a wobble — and it is
DIAGNOSED, not mysterious. The cause is game code that moved
under the band between the original lethality lineage and this
branch: diffing the original lethality prereg commit (d4815b50f)
against this branch's rebased copy (4207ac845) shows game-code
changes in the rebase base — a new src/js/favor-forage.js (257
lines, the joint-foraging-outing system), fieldFights.js,
villager-build.js, betrayal.js, and conversation/convo files.
This branch measures current code (with the tackle landings in
it); the lethality band measured pre-tackle code. The drift is
therefore in the same class as the retired channel corpus's
drift, one generation later — which is exactly why parity must
now be judged against THIS corpus, on this code, and why any
future rebase that lands game code must re-prove the baseline
before parity is judged against it again.

What the divergence does NOT mean: it does not mean this band's
numbers are wrong. Internal consistency is proven three ways:
(1) detgate PASS (baseline == recorders-OFF, 132/132); (2) armed
75101 == detgate baseline 75101 (132), so recorders-ON is also
neutral; (3) the ORIGINAL channel script's detgate on this
checkout also gives 132/132, so the rebaseline copies are
faithful and the difference sits in the checkout, not the
instruments.

## Sense-testing read (seed 75104, window d60-d90) — leg (e)

Seed rule per this prereg: fixed seed 75104, to match the prior
sense thread. Non-measured narration replay (say/sysSay taps);
replay text proves wording and presence only, never counts — and
the replay trajectory can shift from the judged run, so beats
below are the village's story in words, not day-exact claims
about the corpus. Corpus facts for 75104 on this band: 0 wave-4
arrivals, 0 faced types, won lesser d90 at wave 3.

What the replay actually shows, d60-d90, reads as a village living
its ordinary life all the way to a lesser seat — with no Mirror
Draft in it at all:

- The people pass the sense test around the gap: Emilio cooks
  for the haven, works the smoke racks, teaches Food Preservation
  and Field Dressing; Pamela hunts Buffering and Gavel and is
  named "Stalker of the Apex Predator" at the fire; Courtney
  waters and weeds; the village argues about names for things
  ("Big Loud," "Loud-Eyes," "The Big Beast") and keeps sowing
  burdock while wave-3 monsters pace the treeline (Buffering,
  Callback, Gavel, Redactor, Spool — all named, all "still out
  there").
- The other village is a real relationship, not a number: The
  Bloodied begs (Sanne, "thinner than pride allows," 1,363 kcal,
  then 1,616, then 1,604), is fed honestly counted food ("The
  fire network. That's what it's FOR."), raids the stores when
  the scholar is away (800 kcal, then 900 kcal — "The village
  will talk about this for a long time"), and sends tribute
  wagons back. Trust moves are spoken in the moment (+4, +8,
  +10 with each realm at the shared granary).
- Grief is specific: the wedding ring keepsake ("Gold band, worn
  thin. Inside: initials and a date. You remember the day — the
  rain, the borrowed suit, the laughter during the vows. Grief
  is just love with nowhere to go.") and Liam sitting down to
  "Just... talk. Like people used to." People talk low, "Not
  business. Just people."
- The ending is marked, and it explains the whole band's shape:
  on d90, "◈ THE AUDIT — the System reads your run back to you,
  and the galaxy listens. A lesser seat — national standing,
  waves 1–3 faced (16/7/5), 9 contests survived, 3 crises
  weathered. The table does not rise. It prices." And in the
  same breath: "Even now the wave-4 bar reads: blood your
  fighters (0 of 1 veterans). Even now the wave-5 bar reads:
  blood your fighters (0 of 2 veterans)." The village wins
  before wave 4 exists for it — the lesser seat is an exit from
  the funnel, not a step through it.
- What the replay does NOT show: any wave-4 monster, any
  wave-4 beat, any mention of the Mirror Draft. The absence is
  total and consistent with the corpus (0 arrivals). The
  village never meets the thing the census measures, because
  its story ends first.

Sense judgment: the window reads as people with routines,
teaching, rivalries, grief, and a priced ending — and no wave-4
thread whatsoever. The villagers act like people everywhere the
replay looks; the wave-4 thread on this seed is not robotic or
broken, it is absent, and the absence is the finding: on current
code, a village can win the lesser seat at day 90 without ever
meeting wave 4.

Sense findings (not verdict items): (1) the keepsake echo —
the Contract Quill / Wedding ring / Carpenter's square lines
repeat verbatim every day ("Your gifts are not mastered — but
they are lived-in... The feast was the weapon."), dozens of
times across the window; a keepsake that should speak once
speaks as a chorus. (2) The cook line repeats several times per
day ("Emilio cooked for the haven — meals stretched."). Both
are repetition notes, same class as the lethality band's muster
warning chorus — the village reads as people in spite of them,
not because of them.

## Village assessment (plain words)

Three of these eight villages win through the lesser seat and go
home — one of them (75104) in just 90 days, without ever meeting
a wave-4 monster. Three more die (75102 after a long wave-4 war
at day 177, 75106 at day 146, 75108 at day 114), and two survive
the horizon without ever sitting the table (75103, invited but
never entered; 75107, never even invited). Five reach wave 4,
none reaches wave 5, and the full seat is still nobody's story.
The villages that DO reach wave 4 fight it hard — 75103 fights
15 wave-4 fights across 15 arrivals, 75106 fights 25 across 13,
75108 fights 18 across 15 — and kill nothing. The monsters that
die on this band die in no channel, because there are no deaths
to channel. If wave 4 is supposed to be the System building
monsters out of us, on this band it built them, introduced them
to four villages, let those villages fight them 69 times — and
watched every single one of them walk away, melt, or depart,
unkilled. And the other four villages never met them at all,
because the lesser seat ended their stories first.

## Blanks filled or documented

- FILLED (answered, with numbers): the 1926Z round's ordered
  next blank #1 — the formal wave-4 channel-census RE-BASELINE:
  a fresh faced → engaged → killed census by channel, with
  killer identity first-class, on current code (51 arrivals, 29
  engaged, 0 killed; 69 fights, all channel-attributed; empty
  kill table; wall numbers; sense read). On GO, this corpus is
  the census family's parity baseline.
- FILLED (mechanism, read from git + corpus): the headline
  divergence vs the lethality band is diagnosed to rebase-base
  game-code movement (favor-forage outing system,
  fieldFights/villager-build/betrayal/convo changes between
  d4815b50f and 4207ac845), not to this arm's instruments —
  proven by detgate PASS, armed-75101 == detgate-75101, and the
  original script's detgate also giving 132/132 on this checkout.
- DOCUMENTED, NOT FIXED (named next blanks): (1) the fixed-seed
  sense rule's failure mode (see Metric review); (2) the
  keepsake-echo and cook-line repetition in the sense replay
  (sense findings above); (3) the 2 unlinked wave-4 fieldFights
  (recorder-gap measure, not a channel); (4) the lesser seat as
  a funnel exit — villages winning at day 90 without meeting
  wave 4 is a scale-onramp fact for the axis, not a lever for
  this arm to pull.
- CARRIED (not chased here): the empty nonat x w4 class
  (w5chain-a); the panel corpus-ingest mode (tooling blank,
  eighth round — see below); the live rule-(3) firing band (per
  the 2026-10-27 16:02 call, no more low-defiance substrates
  are burned).

## Metric review (§14 — binding, no mid-run re-scores)

No metric was re-scored mid-run. The run was judged exactly
against its pre-registered GO legs: (a) PASS, (b) PASS, (c)
PASS (kill clause vacuous, stated), (d) PASS, (e) PASS WITH
STATED ABSENCE (below), detgate PASS, baseline-declaration
TRIGGERED. The verdict is GO.

Doubts recorded for the NEXT run, never applied here:

1. FIXED-SEED SENSE RULE. Fixing the sense seed to 75104 for
   comparability selects a seed that, on the fresh band, has no
   wave-4 thread at all — so leg (e) as written ("one seed's
   wave-4 thread read") cannot be satisfied literally, only by
   reading the seed's actual thread and reporting the absence.
   This run judged (e) PASS on that reading, disclosed in full
   above. A future prereg should carry a fallback: if the fixed
   seed has zero wave-4 arrivals AND zero faced types, read the
   seed with the most wave-4 engaged arrivals as a supplement
   (here that would be 75103, 9 engaged arrivals) and say so.
   The fallback applies to the NEXT run, never retroactively
   to this one's verdict.
2. SENSE WINDOW MECHANICS. The sense instrument's window is
   DAYS-30, so a seed whose run ends before the window opens
   yields an empty replay (the first 75104 replay, d150+, was
   empty). The window adaptation (DAYS=90, d60-d90) is disclosed
   above; a future sense script should window on the seed's
   actual end day (min(DAYS, run end)) rather than on DAYS
   alone.
3. BASELINE FRESHNESS ON REBASE. This run proves the class
   again: any rebase that lands game code invalidates a corpus
   as a parity baseline, even when the branch history looks
   continuous (rebased commit hashes differ — 4207ac845 vs
   d4815b50f — and the base carries new game code). A future
   parity prereg should require a same-checkout detgate +
   armed-seed match (as done here for 75101) as a baseline
   freshness proof, not just a corpus path.
4. PANEL. scripts/balance-panel.js has NO corpus-ingest mode
   for a single-arm census corpus (eighth round with this
   standing exception; grep: 0 hits for ingest/corpus; it
   builds before/after panels from two live roots). A panel
   compare was ATTEMPTED (the tool errors without --out and
   requires two live-root panels) and reported honestly; no
   panel artifact was faked. The sweep tables + analyzer
   outputs are the comparison of record.
5. TELEMETRY DEVIATION CHECK (loop body step 10):
   `node scripts/telemetry-check.js --baseline .../telemetry-
   baselines/scale-wall.json --current
   'evidence/2026-10-27/perseed-w4channel-rebaseline/*.json'
   --metrics national,table,wins,exiled` → 3 LOUD lines
   (national 12→0, table −62% 16→6, wins 16→0, n=10 files).
   Verdict: KNOWN ARTIFACT, no investigation, baseline NOT
   rolled. Two independent reasons, both documented (same as
   the census family): (a) the baseline's own regime note
   forbids this comparison (a ~100%-win winseat suite vs a
   tableseat-nowait census substrate); (b) the field-shape
   artifact repeats (per-seed rows carry nationalEver/entered/
   won, not top-level national/table/wins paths; summary.json
   + analysis.json are the 9th and 10th files). The corpus's
   real wall numbers are nationalEver 7/8, table entered 3/8,
   wins 3/8. No exiled LOUD line.
6. G5 DEMAND NOTE. The analyzer does not separately assert the
   rd5 4/15/6/3/2 / rd4 3/10/5/3/1 demand tuples; the w5births
   daily rows carry the live gate objects (armed/armored/
   tricks/veterans/ready/short) on every row, same recorder and
   same code path as the channel band. G5 is carried by
   construction, not separately re-asserted in this analyzer's
   output — stated here rather than claimed.

## Proof gates (STOP gates, per the prereg)

- G1 corpus integrity: PASS (8/8 rows, days > 0, every gate +
  deed + channel field present, recorder errors 0, no overflow).
- G2 arrival reconciliation: PASS (spawn-only 0, birth-only 0;
  every wave-4 raider traces to a spawn seq, 24/24).
- G3 kill reconciliation: PASS vacuously (0 wave-4 kills; the
  per-kill table is empty and the analyzer's kill list is
  empty — there is nothing to reconcile, and nothing hidden).
- G4 channel recompute: PASS by construction (the analyzer
  derives every channel from raw rows, never trusting a
  sweep-side label; the sweep stores raw rows only).
- G5 demand vs live code: CARRIED (see Metric review note 6).
- G6 substrate gate: PASS (courtship combined 121, 8/8 seeds
  active).
- G7 daily series: PASS (w5births daily rows present on all
  rows; days non-decreasing; 75103 gameDays 181 vs days 180
  is the known loop-day/game-day +1 shape, same as the
  channel family's G7 allowance).
- G8 killer-identity recompute: PASS vacuously (0 kills; the
  recompute runs over an empty kill list).

## Infrastructure notes

- Sweep: scripts/test-w4channel-rebaseline-sweep.js, 8 seeds,
  ~15 min wall + detgates ~4 min. Corpus: evidence/2026-10-27/
  perseed-w4channel-rebaseline/ (8 rows + summary.json +
  analysis.json + sense-75104.txt). Analyzer:
  scripts/test-w4channel-rebaseline.js (proof validator; exit
  0, GO-candidate sans sense = true; sense leg judged in this
  file). Sense: scripts/test-w4channel-rebaseline-sense.js
  (NON-MEASURED replay only; the committed sense-75104.txt is
  the DAYS=90 run, window d60-d90 — the DAYS=180 run's d150+
  window was empty and is disclosed above, not committed as
  the sense file).
- Run logs kept alongside the evidence (not in the corpus dir):
  evidence/2026-10-27/perseed-w4channel-rebaseline-sweep.log
  (judged sweep + summary) and
  evidence/2026-10-27/perseed-w4channel-rebaseline-analyzer.txt
  (validator console record).
- Safe-commit index clobber hit the prereg commit (bogus staged
  deletions for all 4 files, commit itself correct) — repaired
  via HEAD-blob cacheinfo, verified status empty + diff HEAD
  empty, before any sweep ran. The evidence commit below must
  be checked the same way before this run is called done.
- No EPERM flap blocked this run's writes; all rows wrote first
  try. One launch-pattern note (carried from the lethality
  arm, verified again here): a `cd X && nohup cmd > log &`
  line backgrounds the WHOLE cd chain — the sweep launches
  used an explicit subshell group `(nohup bash -c '...' > log
  2>&1 &)` and behaved.
- No jest run: zero src/js changed, and the arm proofs are the
  attributable verification (per the census-family precedent
  for DIAG-only runs). No [needs-eyes] flag applies
  (measurement only, no narration or behavior added — the sense
  script only READS beats on a replay, it adds none to the game).
- Commit: sim-w4channel-rebase, GO on all legs (sense with
  stated absence), zero src/js diff. Branch ready, pending
  coordinator merge; NOT pushed, NOT bumped, live NOT verified
  (coordinator/ship-loop line, not this arm's).
- Heartbeats: tree heartbeat after registration, mid-sweep,
  and after analysis — all landed ("heartbeat
  sim-w4channel-rebase").
- Timestamp note: summary.json and analysis.json carry their
  single-run `generated` timestamps (same as the prior corpora);
  the analyzer was NOT re-run after the corpus was written, so
  no timestamp-only churn exists to strip.

## Findings appended to backlog

- None appended by this worker. Per the task, the coordinator
  owns tracker/backlog updates; findings for the coordinator to
  consider appending: (1) rebase-base game-code movement
  re-invalidating parity baselines (this run's divergence
  diagnosis); (2) the fixed-seed sense-rule failure mode
  (Metric review note 1); (3) the lesser seat as a funnel exit
  (villages winning at day 90 without meeting wave 4).
