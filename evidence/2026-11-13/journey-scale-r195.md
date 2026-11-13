# journey-scale r195 — RUN NOTE (lane A, leg 3 SCALE, national on-ramp on current master)

**Run id:** `playtest-loop-a-20261113T1927Z` (lock run_id `2026-11-13T19:27:31Z`).
**Run:** scheduled Fri 2026-11-13 12:45 CST; lock created 19:27:31Z (started
~42 min late — scheduler/queue delay). Pre-flight: main tree clean, disk
34%, lock absent (no stale-lock recovery), `git pull` FAILED (connection
reset by peer — transient; local master e2e35630c is the r194-adopted tip,
run proceeded on it; retry the pull at merge time). Reap: nothing removed;
9/16 active; 8 dirty trees LOUD (owners must commit/release — none mine).
**Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success only.**
**Base:** local master `e2e35630c` (r194 endgame addendum).
**Worktree:** `journey-scale` (registered ~19:32Z; register took 3.6 min —
restat under heavy sibling load). Heartbeat at registration + hbloop
`/tmp/journey-scale-hbloop-r195.sh` (setsid PID 167724, 10-min cadence,
verified alive at each phase). **Prereg:** `evidence/2026-11-13/journey-scale-r195-prereg.md`
(committed BEFORE any judged sim: instruments commit 52e2a4805).
**Corpus:** `hidden_files/evidence/2026-11-13/journey-scale-r195-*` (159
files, goal store — moved from the repo evidence subdir to follow the r188
pattern; analyzer verdicts verified identical after the move).
**Driver:** `scripts/journey-scale-r195-20261113.js` (r134 clone).
**Analyzer:** `scripts/analyze-journey-scale-r195-20261113.js` (+ Q1
NATIONAL section). **Proof:** `scripts/test-journey-scale-r195-analyzer-20261113.js`
(29/29 green — see §Analyzer fixes).

## Panel (seeds 135101–135104, DAYCAP=140, policy scalecourt-traderoad-r113-linkraise-sit)

| seed | days | over | pop | rank | peakStage | lesser | wave-4 kills | deaths (top cause) |
|---|---|---|---|---|---|---|---|---|
| 135101 | 141 | alive | 10/10 | regional | 3 (d36) | d71 | 4 (scholar 3, villager 1) | 11 (the wild 6) |
| 135102 | 96 | over | 5/5 | regional | 3 (d31) | d46 | 1 (villager 1) | 11 (the wild 6) |
| 135103 | 62 | over | 0/0 | regional | 3 (d33) | d33 | 0 | 14 (the wild 12) |
| 135104 | 93 | over | 0/0 | regional | 3 (d35) | d48 | 3 (scholar 3) | 15 (the wild 13) |

Lived-days 392 vs r134 band 471 (-16.8%, guardrail ±25%: HOLD). Lesser
seat priced 4/4 (bar ≥3/4: HOLD). Books close on all 4 seeds;
unattributed 0; teleOnly 0. Fights (startCombat count): 23/38/18/33 = 112;
wave-4 fights 14/29/13/16 = 72; **wave-5 fights 0 on all seeds** (the
wave-5 door never opened). Tribute: military_tribute ready d134 on 135101,
delivered 0/7 attempts (r194's tribute-road finding echoes: ready but
never delivered).

## Q1 (PRIMARY) — NATIONAL ON-RAMP: NO-GO on the wall, blocker named per seed (interesting)

National 0/4 — no village reached national (a polity). Per the
pre-registered interesting-finding rule, 0/4 with a named per-seed blocker
IS the informative outcome:

- **135101 (alive d141):** closest road LEAD 2/3 seasoned (3 active) —
  needs 1 more seasoned subordinate. Second road: BELONG reads GOOD
  (trust 100, arrears 0, age 115) but the primary's realm is null, so
  BELONG cannot fire either. The living village is one seasoning away
  from LEAD and realm-less for BELONG.
- **135102:** COLLAPSE — village over d96 before national (final: LEAD
  2/3 seasoned).
- **135103:** COLLAPSE — village over d62 before national (final: LEAD
  0/3 seasoned).
- **135104:** COLLAPSE — village over d93 before national (final: LEAD
  1/3 seasoned).

The wall stands on a fresh band: survived 1/4, regional 4/4, national 0/4,
table 0/4, wins 0/4, wave-5 0/4. The collapse is combat-driven, not
food-driven: 37 of 51 deaths are "the wild", and the dead seeds died with
full pantries (135103: pantry 10,650 kcal at pop 0/0). Nothing in this
panel overturns the picture; nothing re-proves it either — it corroborates
the collapse band on fresh seeds, and the living seed names the exact
one-link gap.

## Q2 — REGRESSION GUARDS: all GO/HOLD (exit 0)

- Spoken-raise (r134 fix): 6 talks — 5 properly answered, 1 counter, 0
  not-offered-spoken, 0 not-offered-unspoken. GO. The Henry shape fired
  twice (Hunter 135101 d27, Willow 135104 d13 — raise + trap-line invite
  follow-on) and was answered at once both times.
- Vetbar: 0 disagreements on all 4 seeds. GO.
- Trap-line: HOLD — 1 sitting, answered (Boris 135102 d90: mime shown,
  nv:accept taken, stockpile gifted +4 wood +4 fiber — the fix live with
  a real consequence). See §Analyzer fixes for why the first draft
  reported SILENT.
- Betrayal sibling: 0 turn-0 offers, 0 defects. HOLD.
- Lived-days HOLD; lesser 4/4 HOLD.

## Q3 — DAILY-PLAY MIME (read-only, carried)

Daily-play mimes 26 (capture 27 minus 1 driver sitting with a mime);
daily-play accepts proven 0 (walk-line lower bound; 0 off-day events in
the betray watch). The gap stands: the shared chooser never takes
`betrayal:accept` / `nv:accept` in daily play. Baraka re-check: one
comm-'none' villager in the band — **Boris** (Polish-only blacksmith,
135102), mime shown and answered in the driver sitting; his second
sitting (the extra -nv one) is nods only, no mime, no English YOU lines.
Lane decision still owed: teach the shared chooser to take
betrayal:accept + nv:accept when offered, or keep proving fixes only
where the driver looks.

## Q4 — PEOPLE CHECK: PASS (all transcripts + all 6 raise talks read in full)

- **LaToya 135101 d90** (exterminator, trust 92): "Have you ever hurt
  someone? Since all this started." — answered honestly, met with grace
  ("Thank you for telling me. That couldn't have been easy to say.") and
  her own philosophy on score-keeping. Real people, real weight.
- **Miguel 135101 d120** (dockworker, trust 27): old-life skills — the
  player's "Patience... waiting, without fidgeting — that's a superpower
  now" lands; he answers with his own read-people skill and plants a
  follow-up ("come find me").
- **Boris 135102 d90** (Polish-only): the mime answered, the walk
  happens, the stockpile is shared. A promise without words at the close.
- **Chantal 135104 d90** (pharmacist, trust 86): perfect-Saturday talk —
  "The free things. Turns out they were the expensive ones, friend."
- **Raise talks:** Hunter d24 (a counter — the proposal went to Emberhold
  and came back countered, a proper answer); Benjamin d128 (the strongest
  exchange in the band — "Did you leave someone behind?... 'Me too.' A
  long quiet." — loss, then the raise, answered); Natalie d24, Frank d10,
  Willow d13 — all clean.
- Senseless 0 for the raise-answer class. Observations carried (not
  defects): (a) the generic-question "Yeah?" filler appears 2× in the
  Benjamin sitting (r134 saw 3×; each gets a real reply here); (b) the
  closer "Well. That happened." lands flat after LaToya's weighty d90
  exchange; (c) the r134 raise-talk/transcript attribution split persists
  at the file level (mime lines unattributed in transcripts).

## Q5 — CENSUS (plain words)

- **135101 — the one that lived.** Ten of ten alive at d141. They know
  Emberhold, Stonebridge, The Bloodied (links raised and answered);
  they banked a military tribute (ready d134, never delivered); the
  scholar killed 3 wave-4 beasts, a villager 1. What they lack: one
  seasoned subordinate (LEAD 2/3) and a primary with a realm (BELONG
  good but realm-less). They reached National Standing on points (stage
  3, d36) and priced the lesser seat (d71) — but no polity, no table.
- **135102 — ended d96, five alive at the end.** They knew Thornfield
  (link answered d24) and priced the lesser seat d46. They died fighting
  in the wild, not hungry.
- **135103 — ended d62, nobody left.** They knew Stonebridge (link
  answered d10) and priced the lesser seat d33. Twelve of fourteen deaths
  were "the wild". The pantry held 10,650 kcal when the last person died.
- **135104 — ended d93, nobody left.** They knew Stonebridge (link
  answered d13), priced the lesser seat d48, the scholar killed 3 wave-4
  beasts. Thirteen of fifteen deaths were "the wild".

## The blank filled: analyzer fixes (tooling, proven by the proof test)

Reading the panel corpus against the instrument found THREE analyzer bugs
— all in the instrument, none in the game — fixed in the worktree and
pinned by `scripts/test-journey-scale-r195-analyzer-20261113.js` (29/29):

1. **Natgate booleans:** the first draft parsed `nat=(\d)`; the driver
   writes `nat=true/false`. The Q1 section parsed NOTHING (every seed
   read as lastDay d0, no blocker). Fixed the regex (accepts true/false/
   1/0); proof case (1)/(2) now use the real boolean format.
2. **Trap-line glob:** the first draft globbed only `*-nv.txt`; a
   nonverbal-threaded sitting can land in the regular day90/day120 file
   (Boris 135102 d90 — the mime answered in a driver sitting). The guard
   reported SILENT on a band with a live answered mime. Glob now covers
   both transcript classes; proof case (10).
3. **Header scan + Baraka filter:** transcripts open with a pre-talk line;
   the header is line 1, not line 0 (the first draft fell back to the
   filename as the villager's name). And the broadened glob pulled
   English-speaking villagers into the Baraka map — now filtered to
   `open thread: nonverbal` sittings. Proof cases (8)/(9)/(11).
4. **Blocker honesty:** a dead village's frozen road state is detail, not
   the cause — the blocker for an over seed is now COLLAPSE (village over
   dN) with the final road state as detail. Proof case (1).

No src/js change this run: no game defect was found with a narrow fix.
The tribute-ready-but-undelivered shape (r194's finding, echoed here
0/7) is the endgame leg's question, not scale's — documented, not built.

## Telemetry check: 2 LOUD lines — investigated, baseline NOT rolled

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/scale.json
--current '.../journey-scale-r195-trust-*.json' --metrics
fightsTotal,fightsByWave.4,maxGameDay` → LOUD: fightsTotal -75%
(446→112), fightsByWave.4 -75% (289→72). maxGameDay quiet (392 vs 646,
-39%, under the bar).

Investigation (same-run, before any roll): the drop is NOT attributable
to a single landing — nothing landed since r134 touches combat
initiation (steeple/strikefall are narration-only; r193/r135/r85 are
conversation/agency; the bisect arms change no src). The world still
stages wild encounters at volume (231 wild wave-4 fights on the alive
seed 135101 — vs 56 in the one saved r134 log line). What fell is
turn-based `startCombat` calls: villagers flee wild wave-4 (19/22 fled
on 135101) instead of fighting turn-based, the scholar never fought
wave-4 in the wild on the alive seed (scholW4=0), and three seeds died
early (392 vs 471 lived-days). The metric is also high-variance across
4-seed bands (r133 446 → r134 245 → r195 112; r134's total was driven by
one 102-fight seed) — a 50%-ish LOUD bar will fire on ordinary band
variation. **Verdict: explained as collapse + flee-behavior + band
noise; no bug established; baseline NOT rolled.** Metric-review proposal
for the next run: re-base scale.json on a larger panel or widen the LOUD
bar for fightsTotal — 4-seed bands are too noisy for it. A matched
same-seeds before/after panel would be needed to attribute any combat
change properly.

## Metric review

- Q1: the interesting-finding rule held as written (0/4 national + named
  per-seed blockers = informative). The `over`-based COLLAPSE blocker
  (analyzer fix §4) is a metric correction made BEFORE the panel was
  judged — the first draft's road-state blocker would have misread dead
  seeds; the proof test pins the corrected rule.
- Q2: the guards held as written. The trap guard's SILENT first reading
  was an instrument bug (glob), not a panel property — fixed and
  re-proven before judging.
- Q3/Q4/Q5: as written. The Q2 walk-line lower bound is weak: the one
  driver accept this band resolved via a stockpile gift, not a walk line,
  so 0 walk lines proves nothing about daily accepts either way. The
  bound stays a lower bound; a better daily-accept signal (capture YOU
  picks) is owed.
- Telemetry: see above — fightsTotal needs a re-based baseline or a
  wider bar; do not re-label scale.json on this run.

## Verdicts

- **Reachable: YES.** Regional 4/4, ladder stage 3 on points 4/4, lesser
  seat priced 4/4, raise answers work, the mime walk works with real
  consequences.
- **Fun: YES.** Conversations read as people (Benjamin d128, LaToya d90,
  Boris's stockpile); the scale climb is visible — links form, tribute
  arrives, the lesser seat prices.
- **Winnable: NO (this leg).** 0/4 national, 0/4 full seat, 3/4 villages
  end before d100; the binding constraint is collapse (death in the
  wild), and on the one living village, one unseasoned subordinate plus
  a realm-less belong road.

## Gate / landing

- Proof test `test-journey-scale-r195-analyzer-20261113.js`: 29/29 green
  (re-run after every analyzer change).
- `check.js --quick`: [TO FILL — started in background at closeout;
  see status below.]
- Commits on branch `journey-scale`: 52e2a4805 (instruments + prereg),
  2c69b0097 (R134→R195 summary label), [TO FILL — analyzer fixes +
  run note].
- Merge/release/rotation: [TO FILL at closeout.]

## Carried (not this run's to build)

Daily-play chooser never takes invites — lane decision owed; tribute
ready-but-undelivered (r194's finding, echoed 0/7 here); belong-good-but-
realm-less on the living village (correct per canon — BELONG needs a
realm, not a defect); wave-5 door never opened on any seed (0 wave-5
fights); "Yeah?" filler 2× (Benjamin d128); flat closer "Well. That
happened." (LaToya d90); raise-talk/transcript attribution split
(file-level); telemetry fightsTotal baseline re-base (next run);
culpritbisect round 12 (tracker blank #1 — a bisect step, not a journey
leg); proof refresh rounds 11 + 12 (still owed).
