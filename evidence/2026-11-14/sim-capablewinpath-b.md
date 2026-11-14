# sim-capablewinpath-b — DIAG: what capable does that competent doesn't

Run: fleshout-loop-b-20261114T1030Z (Loop B), arm sim-capablewinpath-b
Axis: winnability chain. DIAG arm — decomposes a measured divergence; it
changes nothing in the game.
Branch: sim-capablewinpath-b — worktree ~/workspace/worktrees/sim-capablewinpath-b
Base: master 2042cb96c
Date: 2026-11-14
Prereg: evidence/2026-11-14/sim-capablewinpath-b-prereg.md (binds G1/G2/G3)

## Verdict: GO on all three prereg bars

- **G1 INSTRUMENT VALIDITY — GO.** Recorder captured full per-day
  progression on all 32 configs (16 seeds × competent/capable), **0
  instrument errors**, and **every seed classified — 0 UNCLASSIFIED**.
- **G2 DECOMPOSITION — GO.** Ranked divergence list below, each step with
  per-seed numbers on all 16 seeds, naming which capable layer carries
  the win.
- **G3 INSTRUMENT-ONLY — GO.** Zero `src/js` changes in the branch diff;
  proof test green (static 32/32, game 18/18 on smoke seed 98801, rerun
  after the full run — see Commits).

The finding (#2321) reproduces exactly on current master: capable wins
**16/16 by ~day 90**, competent wins **0/16** on identical seeds
98801–98816, 150d. The reproduction check against the stage-2 AFTER-leg
corpus matches **32/32, 0 diffs** (days, endReason, won, maxWave,
standing, waveKills) — the recorder is neutral and the finding is stable
across the rebase.

## The answer in one paragraph

Competent loses because **it never sits down at the table**. It earns a
lesser seat on 15 of 16 seeds — the invitation stands open, the preview
reads ready for a median of ~33 days (up to 59) — and it never takes it:
`competent.js` contains no call to `tableTakeSeat` at all, and the
recorder logged 0 seat-takes in 16 runs. Capable sits the first morning
the seat can be taken (day 90, the table's day floor) and wins the same
morning through a lesser-seat door. That is the whole win gap. The
second divergence sets the win *day*: capable reaches regional scale —
the binding seat bar on nearly every seed — at median day 38 against
competent's day 71, so capable holds the seat by day ~42 while competent
holds it by day ~71. The scale climb comes from capable's leadfeast
courtship/link layer, which also seasons links into diplomacy standing
(capable median 102 at the win; competent 0 on all 16 runs even at day
150). Nothing else diverges enough to matter: contests, crises, the
food-thesis deed, the ladder, and arcs II/III are within days of each
other, and the win needs no wave-4/5 kills at all — 6 of 16 capable wins
have zero wave-4 kills, and the thinnest win (98804) has one wave-3 kill
and none of wave 4.

## Classification (per seed)

| seed | policy | class | days | end | won | seatDay | path |
| 98801 | capable | won-table | 90 | over-other | true | 32 | beloved |
| 98801 | competent | qualified-never-sat | 147 | village-lost | false | 76 | — |
| 98802 | capable | won-table | 92 | over-other | true | 47 | beloved |
| 98802 | competent | qualified-never-sat | 86 | village-lost | false | 61 | — |
| 98803 | capable | won-table | 90 | over-other | true | 46 | beloved |
| 98803 | competent | qualified-never-sat | 90 | village-lost | false | 74 | — |
| 98804 | capable | won-table | 91 | over-other | true | 57 | beloved |
| 98804 | competent | qualified-never-sat | 145 | village-lost | false | 80 | — |
| 98805 | capable | won-table | 104 | over-other | true | 34 | feared |
| 98805 | competent | qualified-never-sat | 87 | village-lost | false | 68 | — |
| 98806 | capable | won-table | 89 | over-other | true | 48 | witness |
| 98806 | competent | qualified-never-sat | 147 | village-lost | false | 76 | — |
| 98807 | capable | won-table | 90 | over-other | true | 49 | beloved |
| 98807 | competent | qualified-never-sat | 150 | survived | false | 73 | — |
| 98808 | capable | won-table | 90 | over-other | true | 37 | beloved |
| 98808 | competent | qualified-never-sat | 131 | village-lost | false | 71 | — |
| 98809 | capable | won-table | 93 | over-other | true | 42 | beloved |
| 98809 | competent | qualified-never-sat | 120 | village-lost | false | 64 | — |
| 98810 | capable | won-table | 92 | over-other | true | 36 | beloved |
| 98810 | competent | died-before-90 | 53 | village-lost | false | — | — |
| 98811 | capable | won-table | 90 | over-other | true | 34 | beloved |
| 98811 | competent | qualified-never-sat | 138 | village-lost | false | 68 | — |
| 98812 | capable | won-table | 89 | over-other | true | 42 | feared |
| 98812 | competent | qualified-never-sat | 104 | village-lost | false | 74 | — |
| 98813 | capable | won-table | 90 | over-other | true | 42 | feared |
| 98813 | competent | qualified-never-sat | 118 | village-lost | false | 95 | — |
| 98814 | capable | won-table | 90 | over-other | true | 47 | beloved |
| 98814 | competent | qualified-never-sat | 82 | village-lost | false | 60 | — |
| 98815 | capable | won-table | 89 | over-other | true | 32 | beloved |
| 98815 | competent | qualified-never-sat | 125 | village-lost | false | 62 | — |
| 98816 | capable | won-table | 90 | over-other | true | 55 | feared |
| 98816 | competent | qualified-never-sat | 150 | survived | false | 70 | — |

Counts: won-table 16 (all capable), qualified-never-sat 15 (all
competent), died-before-90 1 (competent 98810, dead day 53, scale never
left village). Day note: harness days throughout; the recorder's
seat-take log reads `scholar.day`, which runs exactly one ahead
(scholar.day starts at 1), so a harness-day-90 win shows as a
scholar-day-91 sitting. A one-day counter offset, not a delay.

## The ranked divergence

### 1. The seat-taker gap — DECISIVE (H1 confirmed, sharpened)

Competent never takes the seat. Not "rarely" — never: 0 `tableTakeSeat`
calls in 16 runs, 0 table choices, 0 table lines answered. The code
reason is visible by grep before any sim runs: `competent.js` has zero
references to `tableTakeSeat`, `tablePreview`, `tableSeat`, or
`deedGateReady`. The sim reason is measured: competent earns a lesser
seat on 15/16 seeds (first-seat day median 71), the invitation
(`tableWaiting`) fires the same day the seat is earned, the table is
announced at day 90, and the preview then reads ready on 12/16 seeds —
first ready day 90–95, with **1–59 ready days per seed** (98816: 59,
98804: 48, 98801: 43, 98811: 43). Competent sits on a ready, open
invitation for weeks and dies (13/16) or survives to 150 days (2/16)
without ever answering it. Capable takes the seat 16/16 times, the
first morning it can (taken day 90–93 on 15 seeds; 98805 at 104, see
§8), and wins the same morning. If competent sat, it would win on the
seeds where it qualifies — capable proves the sitting wins, on the same
lesser seat, on the same day floor. **Layer: capable's `tableRoad`
(layer 3, scored choices).** No other layer needs to fire for the win
gap to close; this one step is the whole 0/16 vs 16/16.

### 2. The scale-climb gap — sets the win DAY (H2 confirmed)

The binding lesser-seat bar is **regional scale** on 13/16 capable
seeds and 14/15 competent qualified seeds (the rest: wave-3 faced on 5
capable seeds, contests on 98811 capable, crises on 98804 capable).
Capable reaches regional at **median day 38**; competent at **median
day 71**. First lesser seat: capable median **day 42**, competent
median **day 71**. Arc IV tracks the seat exactly (capable 42.5,
competent 71). Everything else in the seat bars is within days:
sentimentTaught 14 vs 15, stage 2 at 8.5 vs 10, ladder peak at 8 vs 7,
contests at 29 vs 27.5, crises at 16.5 both, wave-3 bar at 36 vs 44
(deedHunt helps, ~8 days). The scale climb is the only bar with a
33-day gap — and it comes from the leadfeast courtship/link layer
(layer 5), which competent lacks. This gap decides *when* capable can
win (the day-90 floor), not *whether* — competent qualifies too, just
later, and then never sits.

### 3. The diplomacy-standing gap — the same layer, deeper (H4 revised)

Standing at first-seat day is war + plenty for both policies
(diplomacy 0 everywhere at that early day). By the end of the run the
split has diverged completely: **capable diplomacy median 102** (14/16
non-zero; 102/136/170/204 — multiples of 34, i.e. 3–6 seasoned
regional+ links) against **competent diplomacy 0 on 16/16 runs**, even
on the two 150-day survivors. Capable raw standing median 477 (war 225
+ diplomacy 102 + plenty 140); competent median 245 (war 225 +
diplomacy 0 + plenty 20). Same war, ~2× the total — carried by
diplomacy and plenty, not killing. Competent reaches regional scale
(via links) but its links never season into regional+ polities, so they
score no diplomacy standing. Which leadfeast verb seasons a link is
not visible in this recorder's data — an open mechanism question for a
follow-up (see Findings). Standing does not gate the lesser seat, so
this gap is corroboration of layer 5's depth, not a second cause.

### 4. The door — lesser, light, and thin (H3 confirmed)

All 16 wins are **lesser seats, light branch, self as seat-taker**;
paths **beloved 11 / feared 4 / witness 1**; finals **audience 9 /
quiet 2 / pledge 3 / mercy 1 / charges 1**. One win (98805) came via a
downgrade: the witness path failed and the table offered feared, which
won (8 table choices instead of the usual 5). No win needs wave-4/5
kills: **6/16 capable wins have zero wave-4 kills** (98803, 98804,
98807, 98812, 98813, 98815), 11/16 have zero wave-5 kills, and the
thinnest win — 98804, beloved/light, day 91 — has **one wave-3 kill,
zero wave-4 kills, standing 165, regional scale**. The full seat is
never reached (0/32); the audit line on 98801 names the shortfall
aloud: "only 0 of 2 different wave-5 monsters faced; standing is
regional — the full seat asks for national standing or higher; no
capstone deed delivered." The win path is the reachable lesser door,
not the full seat and not the wave-4/5 chain.

### 5. The wave-kill track — parallel, not causal

Capable kills wave 4 earlier (first wave-4 kill median day 51.5 vs
competent 85.5) and unlocks wave 4/5 earlier (42 vs 56; 57.5 vs 103.5),
but the win does not go through kills: capable's pooled wave-4 kills
(31) barely exceed competent's (26) while its wins go 16–0, and the
wave-5 unlock sits at 6/16 for both policies. The readiness gate, not
the kill count, is what the standing total measures — see §7.

### 6. The ability-sheet gap — same story, smaller

Capable holds a **full 6-slot sheet by seat day (median 6, range 4–6)**
against competent's **median 4 (range 2–6)**. The top abilities overlap
(`lucky_rock` on 10 competent / 8 capable seat-days, `green_whisper`,
`echo_location` on both) — the difference is that capable's scored
offers fill the sheet while competent's first-pick stalls at four.
Not a seat bar (the seat doesn't read abilities), but the same
"capable plays the game" divergence, layer 3. Ability uses on winning
seeds: 14–93 per run; signature counter verbs 0–37; flee exits 0–6.

### 7. The 199 park — the veteran bar holds wave 5, not the win

The gated standing total parks at **199 (t5−1) on 9/16 capable and
7/16 competent end-states**. The short readiness bar on the capable
wins is **veterans**: `rd5short=["veterans"]` on 98801/98803/98816 at
the win (living wave-4 veterans 0 at seat day on most wins; median
vet4 2, vet5 0). The village can win the lesser seat while still
unable to open wave 5 for lack of living veterans — the winnability
chain's veteran link gates the *wave-5 door*, not the *win*. Competent
98801 is worse off still: its wave-4 readiness is also short
(`rd4short=["armor","weapons"]` at day 147), though the wave-4 unlock
itself had already fired and ratcheted.

### 8. The 98805 delay — travel friction, not a bar

98805 capable qualified day 34 and sat day 104 — the only win past day
93. The preview block reasons across days 90–104 split evenly: 7 days
"Return to Haven to take your seat." (away from Haven) and 7 days
"Finish the current encounter before taking your seat." (mid-fight).
The seat can only be taken from Haven, and capable's tableRoad only
fires when the preview reads ready — a bot away from Haven waits. Not a
seat bar, not a defect; a 14-day friction tax on one seed.

### 9. What does NOT diverge

Contests survived (median day 29 vs 27.5), crises (16.5 both),
sentimentTaught (14 vs 15), integration stage 2 (8.5 vs 10), ladder
peak (8 vs 7), arcs II/III (day 9 / 17.5 both), feast surge (34 vs 29;
never on 1/16 capable vs 4/16 competent). The food-thesis deed and the
ladder are **not** the gap — competent has them too. Deed hunt
(layer 6) fires on every capable win (sorties 3–30, wave fights 1–5)
and pulls the wave-3 bar ~8 days earlier, but competent reaches the
bar as well — it is a helper, not the cause.

## Milestone medians (days; never-count in parens)

| milestone | competent median | capable median | competent never | capable never |
| regionalDay | 71 | 38 | 1/16 | 0/16 |
| nationalDay | — | 76 | 16/16 | 3/16 |
| arc2Day | 9 | 9 | 0/16 | 0/16 |
| arc3Day | 17.5 | 17.5 | 0/16 | 0/16 |
| arc4Day | 71 | 42.5 | 1/16 | 0/16 |
| w1Day | 13 | 11 | 0/16 | 0/16 |
| w2Day | 27.5 | 21 | 0/16 | 0/16 |
| w3Day | 44 | 36 | 0/16 | 0/16 |
| contDay | 27.5 | 29 | 0/16 | 0/16 |
| crisDay | 16.5 | 16.5 | 0/16 | 0/16 |
| stage2Day | 10 | 8.5 | 0/16 | 0/16 |
| sentDay | 15 | 14 | 0/16 | 0/16 |
| surgeDay | 29 | 34 | 4/16 | 1/16 |
| ladDay | 7 | 8 | 0/16 | 0/16 |
| w4KillDay | 85.5 | 51.5 | 2/16 | 6/16 |
| w5KillDay | 114 | 62 | 13/16 | 11/16 |
| unlock4Day | 56 | 42 | 0/16 | 0/16 |
| unlock5Day | 103.5 | 57.5 | 10/16 | 10/16 |
| firstSeatDay | 71 | 42 | 1/16 | 0/16 |
| previewReadyDay | 90 | —* | 4/16 | 16/16* |
| seatTakenDay | — | 90 | 16/16 | 0/16 |
| winDay | — | 90 | 16/16 | 0/16 |

\* Capable's preview-ready day is structurally unobservable in the
daily snapshot: the seat is taken the same morning the preview turns
ready, before the snapshot runs. The `tableTakeSeat` wrapper is the
authoritative record (16/16 taken, days 90–104). Future recorders
should snapshot before `policy.daily()` as well as after.

## Per-seed milestone table

| seed | pol | seatDay | seat | takenDay | path/branch | winDay | regional | national | sent | ladPeak | w3bar | cont | cris | stage2 | w4kill | w5kill | unlock4 | unlock5 | vet@seat | standing@seat (w/d/p) | villDeaths |
| 98801 | capa | 32 | lesser | 91 | beloved/light | 90 | 32 | — | 12 | 8 | 31 | 26 | 11 | 8 | 48 | — | 41 | — | 3/0 | 75 (75/0/0) | 60 |
| 98801 | comp | 76 | lesser | — | — | — | 76 | — | 16 | 10 | 42 | 28 | 43 | 11 | 62 | — | 49 | — | 6/1 | 305 (225/0/80) | 68 |
| 98802 | capa | 47 | lesser | 92 | beloved/light | 92 | 47 | 77 | 12 | 6 | 34 | 24 | 19 | 10 | 49 | 62 | 42 | 57 | 3/0 | 115 (75/0/40) | 72 |
| 98802 | comp | 61 | lesser | — | — | — | 61 | — | 16 | 6 | 40 | 31 | 24 | 10 | 46 | — | 38 | — | 0/0 | 205 (125/0/80) | 43 |
| 98803 | capa | 46 | lesser | 91 | beloved/light | 90 | 46 | 76 | 19 | 12 | 30 | 28 | 12 | 13 | — | — | 42 | — | 2/0 | 135 (75/0/60) | 56 |
| 98803 | comp | 74 | lesser | 90 | — | — | 74 | — | 17 | 13 | 43 | 29 | 12 | 13 | — | — | 54 | — | 2/0 | 125 (125/0/0) | 43 |
| 98804 | capa | 57 | lesser | 92 | beloved/light | 91 | 30 | — | 19 | 8 | 55 | 31 | 57 | 13 | — | — | 86 | — | 0/0 | 60 (0/0/60) | 44 |
| 98804 | comp | 80 | lesser | — | — | — | 80 | — | 19 | 9 | 46 | 32 | 19 | 14 | 108 | — | 55 | — | 1/0 | 125 (125/0/0) | 48 |
| 98805 | capa | 34 | lesser | 104 | feared/light | 104 | 32 | 62 | 10 | 8 | 34 | 25 | 12 | 8 | 69 | — | 54 | — | 2/0 | 70 (50/0/20) | 100 |
| 98805 | comp | 68 | lesser | — | — | — | 68 | — | 18 | 7 | 48 | 25 | 16 | 12 | 72 | — | 47 | 73 | 2/0 | 155 (75/0/80) | 53 |
| 98806 | capa | 48 | lesser | 90 | witness/light | 89 | 48 | 78 | 16 | 7 | 33 | 31 | 32 | 8 | 50 | — | 34 | — | 2/0 | 225 (125/0/100) | 45 |
| 98806 | comp | 76 | lesser | 90 | — | — | 76 | — | 15 | 7 | 45 | 27 | 11 | 10 | 100 | 114 | 77 | 106 | 3/0 | 95 (75/0/20) | 44 |
| 98807 | capa | 49 | lesser | 90 | beloved/light | 90 | 49 | 79 | 12 | 8 | 43 | 39 | 16 | 8 | — | — | 58 | — | 2/0 | 50 (50/0/0) | 57 |
| 98807 | comp | 73 | lesser | 90 | — | — | 73 | — | 12 | 5 | 46 | 23 | 54 | 8 | 98 | 142 | 60 | 99 | 5/0 | 150 (150/0/0) | 47 |
| 98808 | capa | 37 | lesser | 90 | beloved/light | 90 | 34 | — | 18 | 6 | 37 | 31 | 28 | 8 | 53 | 68 | 38 | 58 | 1/0 | 85 (25/0/60) | 77 |
| 98808 | comp | 71 | lesser | 91 | — | — | 71 | — | 14 | 7 | 59 | 22 | 13 | 10 | 98 | — | 71 | — | 3/0 | 120 (100/0/20) | 64 |
| 98809 | capa | 42 | lesser | 93 | beloved/light | 93 | 38 | 68 | 19 | 9 | 42 | 26 | 21 | 12 | 47 | 53 | 32 | 52 | 3/0 | 175 (75/0/100) | 40 |
| 98809 | comp | 64 | lesser | 91 | — | — | 64 | — | 15 | 8 | 31 | 22 | 10 | 10 | 74 | — | 57 | — | 6/0 | 175 (175/0/0) | 97 |
| 98810 | capa | 36 | lesser | 92 | beloved/light | 92 | 33 | 63 | 11 | 6 | 36 | 30 | 11 | 9 | 73 | — | 43 | 90 | 1/0 | 45 (25/0/20) | 48 |
| 98810 | comp | — | none | — | — | — | — | — | 16 | 5 | 35 | 24 | 20 | 8 | 38 | — | 34 | — | — | — | 38 |
| 98811 | capa | 34 | lesser | 90 | beloved/light | 90 | 32 | 83 | 13 | 7 | 33 | 34 | 17 | 11 | 53 | 60 | 34 | 59 | 2/0 | 120 (100/0/20) | 56 |
| 98811 | comp | 68 | lesser | 90 | — | — | 68 | — | 17 | 8 | 46 | 34 | 14 | 8 | 77 | 109 | 61 | 101 | 3/0 | 145 (125/0/20) | 69 |
| 98812 | capa | 42 | lesser | 90 | feared/light | 89 | 38 | 68 | 13 | 8 | 42 | 27 | 8 | 8 | — | — | 48 | — | 2/0 | 75 (75/0/0) | 42 |
| 98812 | comp | 74 | lesser | 90 | — | — | 74 | — | 8 | 8 | 60 | 20 | 13 | 8 | 92 | — | 65 | — | 1/0 | 115 (75/0/40) | 46 |
| 98813 | capa | 42 | lesser | 90 | feared/light | 90 | 42 | 72 | 16 | 11 | 39 | 32 | 24 | 13 | — | — | 51 | — | 1/0 | 65 (25/0/40) | 35 |
| 98813 | comp | 95 | lesser | 95 | — | — | 95 | — | 14 | 10 | 37 | 27 | 28 | 13 | 79 | — | 39 | — | 3/0 | 175 (175/0/0) | 48 |
| 98814 | capa | 47 | lesser | 90 | beloved/light | 90 | 47 | 77 | 16 | 11 | 36 | 38 | 9 | 9 | 37 | 63 | 36 | 45 | 5/2 | 250 (150/0/100) | 81 |
| 98814 | comp | 60 | lesser | — | — | — | 60 | — | 13 | 6 | 37 | 33 | 17 | 8 | — | — | 44 | — | 2/0 | 125 (125/0/0) | 57 |
| 98815 | capa | 32 | lesser | 90 | beloved/light | 89 | 32 | 62 | 10 | 5 | 30 | 25 | 27 | 8 | — | — | 33 | — | 2/0 | 95 (75/0/20) | 34 |
| 98815 | comp | 62 | lesser | 90 | — | — | 62 | — | 15 | 6 | 40 | 39 | 12 | 12 | 112 | — | 60 | 111 | 5/0 | 145 (125/0/20) | 56 |
| 98816 | capa | 55 | lesser | 90 | feared/light | 90 | 55 | 85 | 15 | 11 | 52 | 25 | 11 | 8 | 89 | — | 52 | — | 2/0 | 110 (50/0/60) | 55 |
| 98816 | comp | 70 | lesser | 90 | — | — | 70 | — | 9 | 6 | 48 | 30 | 18 | 8 | 102 | — | 69 | 144 | 3/0 | 125 (125/0/0) | 62 |

Standing@seat is the RAW total (war/diplomacy/plenty) at first-seat day;
diplomacy is 0 there for both policies and grows later for capable only
(§3). Competent's standing@seat is higher on most seeds — it qualifies
later, after more war standing accrues — and still never sits.

## Capable layer counters on the winning seeds

seatTaken 1/1 on all 16; tableAnswers 5 (8 on 98805, the downgrade win);
huntSorties 3–30, huntWaveFights 1–5, huntFeastFights 0–1; offersChosen
4–10; abilityUses 14–93; sigUses 0–37; fleeExits 0–6; convosHeld
164–197; relayClaimed 0–2; relayAppointed 0–3; **keepsakesWorn 0 on
16/16** — the keepsake layer never fires on this band (no keepsakes
worn; whether none were found or the wear rule never fired is not
distinguishable in this data — see Findings). Per-seed counters are in
the analyzer output (`capablewinpath-b-analysis.json`).

## Wall numbers (scale wall, every run)

- National / table / wins: capable reaches national on **13/16**,
  takes the table on **16/16**, wins **16/16**; competent reaches
  national on **0/16**, takes the table on **0/16**, wins **0/16**.
  No village reaches the table as a distinct step except through the
  sitting — the wins ARE the sittings.
- Wave 4–5 reach: wave 4 unlocked 16/16 both policies; wave 5 unlocked
  6/16 both. Wave-4 kills pooled: capable 31, competent 26 (after-leg
  numbers, reproduced exactly). Wave-5 kills: capable 14, competent 5.
- Median survival: competent **119d** (13 village-lost, 2 survived to
  150d, 1 dead day 53); capable **90d** (win-truncated — the run ends
  the morning the table is won).
- Death causes (§14c co-primary): villager (non-scholar) combat deaths
  pooled **902 capable vs 883 competent** (~56/run each). The win is
  not bought with fewer deaths — the capable villages bleed just as
  much; they just sit down at the end of it. Scholar deaths are the
  same shape both ways (the village-lost ends are roster collapses,
  not scholar deaths alone).

## Village assessment

The same sixteen villages, twice. The competent villages grind: they
court a little, fight a lot (wave-1/2 kills in the dozens), bury their
dead (43–97 villager combat deaths a run), climb to regional standing
around day 71, and earn the lesser seat — and then nothing happens.
The table is set, the System announces it at day 90, the preview
reads ready for weeks, and nobody walks over to it. Three of them even
survive to day 150 with the seat in hand. The capable villages do the
same grind faster — they court in earnest (regional by day 38,
diplomacy standing where competent has none), fill their ability
sheets, hunt the wave bars — and on the morning of day 90 they sit
down, answer five questions, and win: mostly the Beloved, light,
because the village protected more than it killed and shared its food.
The thinnest winner (98804) barely fought at all — one wave-3 kill,
no wave-4 kills, standing 165 — and still won, because the seat never
asked for kills. The win is a door, not a war.

## Sense-testing (SENSE-TESTING LAW)

The table narration reads like a played ending, not a flag flip. The
announcement (98801, day 90): "◈ THE TABLE IS SET. A ring of pale
light waits — take your seat from Haven when you are ready. Nothing is
final until you sit." The audit reads the run back aloud and prices
the shortfall honestly: "A lesser seat — regional standing, waves 1–3
faced (17/8/6), with 3 wave-4 fought, 9 contests survived, 4 crises
weathered. … For a full seat, the ledger still wants: only 0 of 2
different wave-5 monsters faced; standing is regional — the full seat
asks for national standing or higher; no capstone deed delivered."
The Beloved beat: "The audience is chanting. You don't know the
words — it isn't a language with words — but you know the feeling."
The branch line: "More promises broken than kept; the protected
outnumber the killed; the food truth was shared. The light road is
open." One repetition note: the homecoming line "You came back bloody.
Nobody asks. Someone saves you the good seat by the fire." fires 8+
times in a single run (98801: days 27, 41, 48, 64, 65, 67, 75, 83) —
the same sentence after every bloody return, which reads as a repeated
beat in a transcript even if each return is a real event. Villager
dialogue in the captured lines is coherent and specific (Débora
speaking at Thornfield's table, June weeping over gifted food, Nino
and Valeria by the fire) — people reacting to named events, not
filler.

## Reproduction check vs stage-2 AFTER corpus

**match 32 / diff 0 / no-prior 0.** Every end-state column (days,
endReason, won, maxWave, standing, waveKills) reproduces the
stage-2 after-leg corpus
(`evidence/2026-11-14/perseed-rageprecheck-b-confirm-after/`) exactly
on all 32 configs — including the per-seed swings (98811 competent
138d/standing 395, 98806 competent 147d/320, 98816 competent 150d
survived/400). The recorder changed no outcome; the finding is stable
across the rebase to master 2042cb96c. No balanced panel (§15): this is
a DIAG, not a before/after lever — there is no second game root to
compare; the reproduction check is the corroboration.

## Metric review (§14)

1. The metrics held. G1/G2/G3 measured the decomposition as designed;
   no re-scoring was needed. The one structural blind spot found: the
   daily snapshot runs AFTER `policy.daily()`, so capable's
   preview-ready morning is unobservable in the series (the seat is
   taken before the snapshot). The `tableTakeSeat` wrapper covered it,
   but the next recorder should snapshot before `daily()` as well.
2. The "standing" column in prior tables is the GATED total; the
   decomposition needed the RAW split (war/diplomacy/plenty) and the
   seat-day vs end-of-run reads. Future arms should quote the split and
   the day it was read — a single standing number hides the diplomacy
   gap entirely (0 at seat day, 102 at the win).
3. H4 as written ("different source carries capable to the seat") was
   wrong in its timing: at seat day the sources are the same (war +
   plenty); the diplomacy divergence appears only after the seat, as
   links season. The prereg's prior-guess section records the miss
   honestly; the verdicts did not depend on it.
4. The classification taxonomy needed no UNCLASSIFIED escape hatch in
   practice, but the `seat-taken-but-not-won` UNCLASSIFIED leg in the
   proof test is the right tripwire for future bands (a sitting that
   loses would land there and demand a look, not a quiet bucket).

## Evidence files

- Prereg: evidence/2026-11-14/sim-capablewinpath-b-prereg.md
- Driver: scripts/capablewinpath-driver-20261114.js (new)
- Analyzer: scripts/analyze-capablewinpath-b.js (new)
- Proof: scripts/test-capablewinpath-b.js (new; static 32/32, game 18/18)
- Per-seed JSON: evidence/2026-11-14/perseed-capablewinpath-b/ (32 files)
- Analysis JSON: evidence/2026-11-14/capablewinpath-b-analysis.json
- Evidence: this file

## Commits (branch sim-capablewinpath-b)

- 5342641de prereg (G1/G2/G3 bars)
- 1661273f1 instrument: recorder driver + analyzer + proof test (static 32/32, game 18/18 on smoke seed 98801)
- (this commit — full-run evidence + corpora + analysis JSON)

## Findings for the backlog (coordinator owns sim-findings.md)

1. **#2321 DECOMPOSED (this arm).** Capable 16/16 vs competent 0/16
   is the seat-taker gap (competent never calls `tableTakeSeat`;
   qualifies on 15/16, holds a ready invitation a median ~33 days)
   plus the scale-climb gap (regional day 38 vs 71, leadfeast
   courtship). The win needs no wave-4/5 kills, no national scale, no
   full seat. The natural follow-up is a BUILD arm, not more
   measurement: give competent (or the game) a seat-taking path — a
   Steve-call on whether competent-the-policy should sit, or whether
   the game should prompt a human harder — and a scale-climb lever for
   the 33-day gap.
2. **Diplomacy standing 0 on 16/16 competent runs** (even 150-day
   survivors) while capable reaches median 102: competent's links never
   season into regional+ polities. Open mechanism question: which
   leadfeast verb seasons a link (tend? feast? devotion channel?) —
   worth a small DIAG before any build touches link seasoning.
3. **The 199 park / veterans bar.** The gated total holds at t5−1 on
   9/16 capable wins with `rd5short=["veterans"]` — the veteran link
   gates the wave-5 door, not the win. A later arm on veterans should
   start here, not from the win numbers.
4. **Keepsakes never worn (0/16).** `capKeepsakesWorn` is 0 on every
   winning seed. Either no keepsakes were found on this band or the
   wear rule never fires — needs a look before the layer is relied on.
5. **Repeated homecoming line.** "You came back bloody. Nobody asks.
   Someone saves you the good seat by the fire." fires 8+ times per
   run verbatim — sense-testing note for a variation/dedup pass.
6. **The win costs as many lives as the grind.** 902 vs 883 villager
   combat deaths pooled. Any "capable wins more cheaply" reading is
   wrong; the win is a sitting, not a saving.

## Convergence state

DIAG — no lever, no convergence verdict. The arm documents; the
finding's fix (if any) is a later arm's prereg.
