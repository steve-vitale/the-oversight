# sim-regtable-a — the regional-table exception, adjudicated

Run: Loop A worker, axis scale-onramp, run fleshout-20261031T1535Z.
Arm type: DIAG ONLY — measurement, zero src/js changes, zero
policy-default flips, zero gate/demand numbers moved. The deliverable
is the trace + verdict; no lever fix is built here.
Prereg: evidence/2026-10-31/sim-regtable-a-prereg.md (written BEFORE
any judged sims). Base: 18da20b586aeb018d1357170aeb2e2c3176d3ffb
("journey-scale r62: closeout"). Stack: the wavegate win-pursuit
stack (withFullseatDiag(withSeatDrive(withWinDefer(TF leadfeast))),
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 WAVEGATE=1) plus the new regtable-diag recorder
(REGTABLE=1), which records the priced seat, the full-gate
breakdown, the rank, and the table flags every day.
Corpus: evidence/2026-10-31/perseed-regtable/leadfeast/s<seed>.json
(19 seeds); analysis: evidence/2026-10-31/regtable-analysis.json.
Proof: scripts/test-regtable-20261031.js (4/4).

## Verdict: EXPLAINED (DIAG-GO)

The flagged item — "seed 87103 reached the table at regional rank
without national; if the table is supposed to require national
standing, this is a counterexample" — is explained, on two
independent branches, either of which alone settles it:

(a) 87103 DOES NOT REPRODUCE on this base. On base 18da20b5, seed
87103 runs 60 days, unlocks wave 2 only (day 21), reaches regional
rank on day 47, never holds any seat (lesser or full), and dies
village-lost on day 60 with no tableWaiting and no tableDone. The
wavegate milestones (wave 4 day 57, table day 71, lost day 88) are
prior-base numbers; this base's trajectory for the same seed is a
different village's story. The det-gate proves this is base drift,
not instrument error (below).

(b) THE REGIONAL TABLE ITSELF IS DESIGNED, not a counterexample.
Across the full 19-seed band on this base, 10 seeds reach the table
at regional rank — and ALL 10 sit in a LESSER seat with the full
gate false, exactly as src/js/table.js tableSeat() designs: the
lesser seat needs regional+ (w1>=4, w2>=4, w3>=3, 2+ contests,
2+ crises, stage>=2, food deeds), while only the FULL seat carries
the national/global bar (src/js/progression.js:613 deedGateReady,
scale enforced in `ok` per the 2026-10-27 ruling). The "table
requires national" framing was true of the full seat only; the
table as a whole never required it (docs/TABLE.md "The seat: full /
lesser / none", Steve 2026-10-11: "the table prices the run, never
gates on godhood"). No seed on this band holds a full seat at any
rank — fullOk is false on all 16 table days and firstFullDay is
null on all 19 seeds — so there is no case, regional or otherwise,
of a full seat granted below national. COUNTEREXAMPLE CONFIRMED
would have required a full seat at regional rank, or a table with
seat 'none'; neither occurs anywhere in the corpus.

In plain words: a regional village CAN be invited to the table —
to the lesser seat, priced for what it built. The national bar
guards only the full seat, and on this band nobody earns the full
seat at all, because the wave bars (w4>=3, w5>=2 distinct fought)
are unmet on every seed, not because of scale.

## DIAG-GO check (prereg primary metric)

- 87103 trace complete: 60 rows, day 2..60, recorder errors 0,
  seat + rank + full-gate recorded on every row and at end.
- Det-gate PASSED: recorder ON vs OFF on 87103 and 87121 —
  dayHash arrays byte-identical (60 vs 60; 90 vs 90) and end
  fields identical (gameDays, won, national, table, maxWave,
  endScaleRank, endReason) on both seeds. The recorder does not
  move trajectories.
- Determinism leg PASSED: judged 87103 JSON is byte-identical to
  the det ON 87103 JSON (118,394 bytes, `cmp` clean).
- Confirm scan classifies all 19 band seeds (table? seat at table
  day? rank at table day? ever-regional-no-table?) — table below.
- Cross-check (i): my tableDay agrees with the wavegate-row
  tableWaiting/tableDone derivation on the same run for all 16
  table seeds (both recorders run together; the analyzer's
  tableDay comes from regtable rows and the sweep's end `table`
  flag matches on every seed). Cross-check (ii): det-gate passed.
  Cross-check (iii): recorder errors 0 and wavegate errors 0 on
  every seed. Derived final unlockedWave == post-run engine
  unlockedWave() on all 19 seeds.
- GO threshold met: verdict determinacy achieved (see verdict).

## 87103 day-by-day trace (this base — the flagged seed, settled)

| Day | What the rows show |
|---|---|
| 2 | Village rank, seat none, arc below 4, wave 1. |
| 21 | Wave 2 unlocks (derived uw 2 from here to the end). |
| 2–46 | Village rank, seat none every day. Contests and crises
accumulate (6 contests, 3 crises by the end), stage reaches 3,
food deeds banked — but wave deeds stall: w2 distinct fought
never passes 2 (lesser bar 4), w3 stays 0 (bar 3). |
| 47 | Regional rank (networkLive). Still seat none: the scale bar
for the lesser seat is now met, but the wave bars are not. |
| 47–60 | Regional, seat none, arc 3, tableWaiting false,
tableDone false, tableAnnounced false, winFloorOk false (day
< 90 throughout). |
| 60 | Village-lost (endReason; the last daily row, day 60, still
shows villageLost false — the fatal tick lands after the last
daily snapshot). End row: rank regional, seat none, w1 11 / w2 2
/ w3 0 / w4 0 / w5 0, contests 6, crises 3, stage 3, foodDeeds
true. 30 deaths sampled, combat-dominated like wavegate's
prior-base read. |

What 87103 lacked was fights, not standing: even the lesser seat
needs 4 distinct wave-2 and 3 distinct wave-3 monsters fought
blow-by-blow, and this village fought 2 and 0. It reached regional
at day 47 and died 13 days later still short on wave blood. Its
prior-base story (wave 4 at 57, table at 71) is not this village
anymore — see Base drift.

## Band table (this base, 19 seeds — seat and rank AT table day)

| Seed | Table | Rank@table | Seat@table | FullOk@table | Win | End (days, rank, seat) |
|---|---|---|---|---|---|---|
| 87103 | — | — | none (never) | — | — | village-lost (60, regional, none) |
| 87104 | 159 | global | lesser | false | 159 | over-other (159, global, lesser) |
| 87107 | 60 | regional | lesser | false | 90 | over-other (90, global, lesser) |
| 87109 | — | — | none (never) | — | — | village-lost (146, global, none) |
| 87115 | 87 | global | lesser | false | 90 | over-other (90, global, lesser) |
| 87119 | 64 | regional | lesser | false | 90 | over-other (90, global, lesser) |
| 87120 | 90 | global | lesser | false | 103 | over-other (103, global, lesser) |
| 87121 | 75 | regional | lesser | false | 90 | over-other (90, global, lesser) |
| 87123 | 104 | global | lesser | false | 110 | over-other (110, global, lesser) |
| 87124 | 47 | regional | lesser | false | 92 | over-other (92, global, lesser) |
| 87126 | 57 | regional | lesser | false | 90 | over-other (90, global, lesser) |
| 87127 | 127 | global | lesser | false | 127 | over-other (127, global, lesser) |
| 87128 | 50 | regional | lesser | false | 91 | over-other (91, regional, lesser) |
| 87132 | 59 | regional | lesser | false | 90 | over-other (90, global, lesser) |
| 87134 | 73 | regional | lesser | false | 90 | over-other (90, regional, lesser) |
| 87135 | — | — | none (never) | — | — | village-lost (144, national, none) |
| 87137 | 80 | regional | lesser | false | — | village-lost (89, regional, lesser) |
| 87138 | 47 | regional | lesser | false | 90 | over-other (90, global, lesser) |
| 87140 | 197 | national | lesser | false | 197 | over-other (197, national, lesser) |

Counts: table 16/19 (10 regional + 6 national/global at table
day); every table seat lesser, fullOk false on all 16 table days;
full seats 0/19 (firstFullDay null everywhere). Won 15/19 — all
through lesser seats, including two wins that END at regional
rank (87128, 87134: won without ever reaching national). The two
seeds that end at regional with a table but no win: 87137
(table 80, died 89 — invited, never sat, like the prior-base
87103 story but with the seat now proven lesser) and, by contrast,
87103 itself (no table at all).

## Why the full seat never appears (the wave bars, not scale)

On all 16 table days the full gate fails on `waves` — and on
nothing else except scale on the 10 regional tables. Full needs
w1>=5, w2>=5, w3>=4, w4>=3, w5>=2 distinct fought. Observed at
table day: w5 is 0 on all 16; w4 peaks at 2 (87120) and is 0–1
elsewhere. Contests, crises, stage, and food deeds all pass on 14
of 16 table days (exceptions: 87121 crises 2/3, 87124 and 87132
contests 2/3 — those fail the FULL contests bar but pass the
lesser 2-bar, which is why they sit lesser). Scale passes on all 6
national/global tables and fails, as designed, on the 10 regional
ones. So on this band the full seat is unreachable for a wave
reason: no village fights 3 distinct wave-4 monsters, let alone 2
distinct wave-5 ones. Wave 5 unlocks 0/19; wave 4 unlocks 13/19.

## The no-table seeds (why no seat at all)

- 87103 (regional, died 60): waves (w2 2/4, w3 0/3) + scale
  (full-scale fails, but the binding miss for ANY seat is waves).
- 87109 (global, died 146): waves ONLY — w3 2/3, ONE distinct
  wave-3 fight short of the lesser bar, despite global rank, 14
  contests, 3 crises, stage 3, food deeds banked, and 5 distinct
  wave-4 fights. A global village that fought wave-4 monsters but
  never faced a third distinct wave-3 monster never gets invited
  at all. (Echoes the journey-scale r24 note: a global village
  one wave-2 fight short of a seat.)
- 87135 (national, died 144): food deeds ONLY — waves 18/11/5,
  22 contests, 3 crises, stage 3, national rank, but foodDeeds
  false (never sentimentTaught + feastSurgeUsed together). The
  food-thesis bar alone holds this village out of any seat.

## The regional-no-table question (prereg adaptation, answered)

The brief asked for a regional-no-table contrast seed from the
band; none exists as an END-rank case except through the scan, and
the scan answers it band-wide. Ever-regional-but-never-table
(any daily row rank regional, tableDay null): 87103, 87109, 87135.
Note the 87109 nuance: it passed THROUGH regional to global without
ever holding a seat (w3 2/3 throughout) — regional-no-table is a
phase, not just an end state, and the daily rows catch it. The
pilot's planned contrast roles collapsed on this base (87104 and
87107 both reach table and win, so neither is a no-table contrast
anymore); the scan classification, not the single-seed contrast,
carries the question — see Metric review.

## Wall numbers (judged band, this base)

National reached 15/19 (nationalDay non-null; 87103, 87128, 87134,
87137 never national — 87128/87134 still win at regional). Table
16/19. Won 15/19, all lesser, full 0/19. Wave 4 unlock 13/19, wave 5
0/19. Median survival 90 days, max 197. Deaths: 4 villages lost
(87103, 87109, 87135, 87137); the other 15 won. These are THIS
base's numbers only — they are not comparable to wavegate's
prior-base band (national 15/19, table 7/19, won 6/19 there), because
the base moved; the comparison that matters here is within-base
(seat vs rank at table day), and it is unanimous.

## Base drift (why 87103 changed — documented, not smoothed)

Wavegate anchor 4c92bbb04 → this base 18da20b58: 29 commits,
including lootabilities Arms 1–6 (loot pool wire-in, tier shape,
ruins carry gear, ability field coverage, villager self-craft —
all game-code changes). Those commits themselves record seeded
generation re-rolls (party-opening seed 7→64, capable-bot seed
8→9, conversation seed 42→43, skill-teaching seed changes). A
seeded-generation re-roll changes village composition, which
changes trajectories wholesale — so pilot-seed drift of this size
is expected, not suspicious. Pilot drift table (wavegate
prior-base → this base):

| Seed | Prior-base | This base |
|---|---|---|
| 87103 | 88d, w4 57, table 71, regional, lost | 60d, w2 only, no table, regional, lost |
| 87121 | nat 77, w4 139, table 143, win 143 | nat 79, table 75 (regional, lesser), win 90 |
| 87104 | nat 78, survived 201, no table | nat 77, table 159 (global, lesser), win 159 |
| 87107 | village, 111d, lost, no table | table 60 (regional, lesser), win 90 |

The det-gate rules out the recorder as the cause (ON vs OFF
byte-identical on both det seeds). The drift is in the game, and
it is the reason this arm judges only its own corpus: re-running
wavegate's band on a new base re-measures everything, including
the exception.

## Sense-testing read (SENSE-TESTING LAW)

Two sense findings, one about the recorder and one about the game.

1. THE RECORDER'S sysSay CAPTURE CANNOT HEAR THE ENDGAME TABLE.
The judged recorder captures sysSay lines containing 'table' —
and on table seeds those lines are almost entirely OTHER tables:
contest copy ("the table is unavoidable" — the Long Odds dice
table), the Red Table splinter village, and other villages'
tables ("speaks at Emberhold's table now"). The endgame table's
own voice goes through say(), not sysSay(), so the judged beats
contain zero endgame-table lines (87107: 0 beats; 87121: 1
contest-ish line). A sense read from the judged beats alone would
conclude the table never speaks. It does — through a channel this
instrument does not capture. The fix, proven by a scratch probe
below: wrap say(), not sysSay(). (Wrapping Game.emit captures
nothing in this harness — internal code does not route through
the returned object's emit — while wrapping say() captures all
8,320 narration lines on 87107. Future table-voice instruments
should wrap say().)

2. WHAT A REGIONAL TABLE ACTUALLY SOUNDS LIKE (scratch say-probe,
87107, NOT judged corpus — end fields verified identical to the
judged 87107: 90d, won, table, global). The village earns the
lesser seat on day 59 (regional) and tableWaiting sets on day 60
— and hears NOTHING about the endgame table for 18 days. Then:
day 77, the System: "There's a table, little fires. A big one. Far
away. And it is LOOKING at you." Day 78: "You are not at the table
yet. But the table has your name now." Day 79, a villager by the
fire: "The table's set. The ring of pale light — it's just sitting
there. Waiting on them. What do you think they'll tell it?" —
villagers gossiping about the table like people, before they sit.
Day 90, the floor passes and everything lands at once: "THE TABLE
IS SET. A ring of pale light waits — take your seat from Haven
when you are ready. Nothing is final until you sit." Then the
audit, which is the honest pricing this arm's verdict rests on:
"A lesser seat — global standing, waves 1–3 faced (17/8/6), 10
contests survived, 3 crises weathered. The table does not rise. It
prices." (Counts grown since table day 60's 16/7/3 — the village
kept fighting while it waited.) Then the Feared path plays, and:
"You won. Say it plainly: you won. The village endures. The table
signed."

Judged on meaning: the lesser seat is voiced HONESTLY at sitting
— the audit names the real seat, the real standing, the real
counts, and the pricing metaphor ("does not rise, it prices")
matches what the code does. The 18-day silence between earning
the seat (day 59) and first hearing of it (day 77) is the one soft
spot: the deferral is by design (the table waits for day 90), but
a village holding an unannounced invitation for 18 days hears
nothing until the System's teaser — no "the table waits for
ninety dawns" line lands in this window on this seed. That is a
voicing gap worth a note, not a verdict-changer: the invitation
was real (tableWaiting true from day 60), the sitting was real,
and the audit told the truth.

87103's own table approach, in the same terms: it never got an
approach. No teaser, no gossip, no audit — because it never
earned a seat. It died at day 60 still short on wave blood, the
same shape as 87109's one-fight-short global village, except
earlier and smaller. The honest sentence for 87103 is not "the
table rejected it" but "the table never had its name" — arc 3,
seat none, to the end.

## Pilot gate

Recorder fired on all 4 pilot seeds with zero recorder errors;
per-seed JSONs valid (rows present for every daily call, day
range 2..end); gate decomposition (seat/rank/full-gate at table
day + road/end classification) computable on every pilot seed.
Pilot GO met — and the pilot alone already contained two
regional-table cases (87107, 87121), both lesser, before the
confirm scan added eight more.

## Metric review (for the next run)

- DAY CONTINUITY: the prereg's "unbroken daily row series"
  criterion, read as strictly-consecutive day numbers, MISFIRES
  on every seed by construction. The harness's day numbers are
  not consecutive: day 2 fires twice, day 3 has no row on ANY
  seed, day 4 fires twice, and 87126/87128 have 1–2 extra missing
  mid-run days (87126 day 39; 87128 days 77, 80). The corrected
  continuity check, used in the analyzer, is: rows present for
  every daily call the harness made (row count ≈ gameDays on
  every seed), with the missing-day list reported. No
  classification is affected: ranks and seats on the rows
  bracketing every extra missing day are identical (87126 day
  38/40 both village/none; 87128 day 76/78 and 79/81 both
  regional/lesser), and tableWaiting is sticky — a table set on
  an unmeasured day would still show on the next row. The
  missing-day list is carried in the analysis JSON per seed.
  Next run: pre-register the missing-days form, not strict +1.
- CONTRAST ROLES: pre-registering contrast roles from a prior
  base's labels does not survive a base move. On this base the
  national-no-table and village-no-table roles collapsed (both
  contrasts reached table and won). Next run: define contrast
  roles from the CURRENT base's pilot rows, or pre-register the
  band-wide classification (as the scan did) instead of
  single-seed roles.
- VOICE CHANNEL: sysSay capture is the wrong channel for the
  endgame table's voice (finding 1 above). Next table-voice
  instrument wraps say(), with a det leg on the say wrapper.
- The wavegate "table" metric (tableWaiting || tableDone) is
  CONFIRMED as a both-seats metric by this arm's rows: tableDay
  always follows firstLesserDay by 0–1 days (seat first, waiting
  next dawn), and tableDone fires at the sitting. No correction
  to wavegate's metric is needed — only to its framing (the 7/19
  "table" count was never a national count; 6 of its 7 were
  national-seed tables, but the seat split was unmeasured there
  and is lesser-or-unknown, not full).

## What this arm leaves for the next run (not chased here)

- The full seat is 0/19 on this band for a wave reason (w5 0
  everywhere, w4 max 2). Whether any stack/seed reaches w4>=3 +
  w5>=2 distinct fought is the open full-seat question — it is
  NOT answered here, and this arm's 0/19 must not be quoted as
  "the full seat is unreachable," only as "unreached on this
  band."
- 87109 (global, one wave-3 fight short, died 146) and 87135
  (national, food deeds missing, died 144) are the two sharpest
  no-seat stories; both are single-bar misses, and both are
  documented here for whichever arm takes the seat question next.
- The 18-day unannounced-invitation window (87107 days 60–77)
  is a voicing note for a future pass, not a lever.

## Method note (runner discipline, kept)

Stdout runner + idle splitter throughout: the game-loaded sweep
printed one JSON line per seed to stdout (foreground exec,
stdout→file + stderr→file, never a backgrounded pipe); the
splitter (no game loaded) wrote the per-seed JSONs. Judged
corpora were never staged in /tmp. Scratch dirs
(scratch-regtable-det/, scratch-regtable-transcript/) are
deleted before commit; the transcript probe script itself is
committed (scripts/regtable-transcript-probe-20261031.js) so the
sense read is reproducible, with its scratch-only status in its
header.

## Files

- Prereg: evidence/2026-10-31/sim-regtable-a-prereg.md
- Evidence (this file): evidence/2026-10-31/sim-regtable-a.md
- Corpus: evidence/2026-10-31/perseed-regtable/leadfeast/s<seed>.json
  (19 seeds)
- Analysis: evidence/2026-10-31/regtable-analysis.json
- Raw stdout records: evidence/2026-10-31/regtable-pilot.jsonl,
  regtable-confirm.jsonl (+ .log files)
- Recorder: scripts/policies/regtable-diag.js
- Sweep / splitter / analyzer / det / probe:
  scripts/regtable-sweep-20261031.js,
  scripts/regtable-split-20261031.js,
  scripts/regtable-analyze-20261031.js,
  scripts/regtable-det-20261031.sh,
  scripts/regtable-transcript-probe-20261031.js
- Proof: scripts/test-regtable-20261031.js (4/4)
