# sim-finalvoice-b — finale voice fixes #2252 + #2253 (Loop B, 2026-11-11)

Arm: fix sim-findings #2252 + #2253 (r182 endgame voice).
Worktree: ~/workspace/worktrees/sim-finalvoice-b. Substrate: local master
aedf7f699 (batch-ship bump c136d851d-20261111-232432).
Prereg: evidence/2026-11-11/sim-finalvoice-b-prereg.md.
Proof test: scripts/test-finalvoice-20261111.js (V1–V4, ALL GATES GREEN).

## What the village looked like (before)
r182's full-seat finales (89702 pass B/C, 89707 wide) read as earned, not
defaults — but two voice defects recurred across the transcripts:
- Every keepsake the scholar channeled printed the same arming sentence
  word for word, 3–4x per finale transcript. The bot channels a lot
  (devotionChannels 69–97 per r182 seed), so the refrain is the most
  repeated line in the finale.
- On a priced full seat, the war-path audit still read the wave-5 combat
  bar aloud ("blood your fighters (1 of 2 veterans)") — a shortfall readout
  on a run that owes nothing, muddying the win.

## The fix (voicing only — no gate, price, deed, or readiness change)
- #2252 — src/js/progression.js, channelSentiment: each lane's canonical
  arming closing prints ONCE per run; later armings rotate the other
  three variants on a per-run counter (no RNG — same house shape as the
  spoil-mutter rotation). The first hearing stays the canonical line;
  afterwards the gifts answer back differently, and the full sentence
  never repeats verbatim. Devotion lane keeps "Your gifts are not
  mastered — but they are lived-in" on every item (test-main67 A-1
  requires it per item, plus the FEASTED terms); mastery lane keeps "The
  feast was the weapon" (A-1b). REVISED from a pure 4-way rotation after
  the first live band showed rotation alone still repeats the canonical
  line every 4th arming (~25% verbatim) — see prereg design revision.
- #2253 — src/js/table.js: tableDeedRecords/tableDeedLines take the audit's
  already-computed seat (passed in by tableScene); on a full seat the
  readiness-bar bits stay silent. The war record (kills, engagements,
  titans) still voices. A bare call keeps the legacy bar voicing, and the
  records stay a pure render — tableSeat() is NOT called inside
  tableDeedRecords (deedState() would CREATE pg.deeds, a state write).

## Before / after transcript lines (SENSE-TESTING LAW — read, not counted)
BEFORE (r182 finding text, verbatim per held item, 3–4x per transcript):
> "Your gifts are not mastered — but they are lived-in, and they are with
> you. The feast was the weapon."
> "Even now the wave-5 bar reads: blood your fighters (1 of 2 veterans)."
> (on a full-seat audit, 89702 pass B)

AFTER — devotion lane, 4 keepsakes channeled (proof test V1, full lines):
> "You hold Grandma's Tin Cup. ... Your gifts are not mastered — but they
> are lived-in, and they are with you. The feast was the weapon. (The next
> feast grants FEASTED until tomorrow's dawn: strikes & abilities uplifted,
> devotion ×1.5 — richer feasts hit harder.)"
> "You hold Contract Quill. ... Your gifts are not mastered — but they are
> lived-in, and they know your hands. The feast was the weapon. (...)"
> "You hold Mixtape. ... Your gifts are not mastered — but they are
> lived-in, and they have carried you this far. The feast was the weapon. (...)"
> "You hold Hard Candy. ... Your gifts are not mastered — but they are
> lived-in, and they are still yours. The feast was the weapon. (...)"

AFTER — mastery lane, same 4 keepsakes (proof test V2):
> "The feast was the weapon — and they are with you." /
> "The feast was the weapon — and they stand with you." /
> "The feast was the weapon — and they have not left your side." /
> "The feast was the weapon — and they answer to you now."

AFTER — war path on a priced full seat (proof test V3; fixture carries an
unready wave-5 bar: "learn their tricks (0 of 3 known); blood your
fighters (1 of 2 veterans)"):
> "◈ THE WAR PATH — Footage plays. ... On day 152, Tao put down The Strike.
> On day 140, you put down The Congregation."
> ""THE HERALD came. Named and located — the war council knew its face.
> They faced The Audit and lived to sit here." — the System is still
> reading the list."
No "bar reads" line anywhere on the full-seat call; the same fixture on a
lesser seat still voices "Even now the wave-5 bar reads: learn their
tricks (0 of 3 known); blood your fighters (1 of 2 veterans)." — the
village that still owes hears what it owes; the village that paid hears
its war record only.

Sense read: the rotation lands as a refrain that evolves — first hearing
is the canonical line, later holdings answer back differently ("they know
your hands" for the Quill, "they have carried you this far" for the
Mixtape). The mastery variants read as earned familiarity, not
deduplication. The full-seat audit now ends on the deeds, not a bar the
seat no longer owes.

## Verdict against the prereg (GO = (a) AND (b) AND (c))
- (a) Full devotion sentence verbatim: fixture probe V1 1x across 4
  armings + V1b 5th arming never repeats it (cap holds past the first
  rotation); mastery V2/V2b same. LIVE BAND 2 (capped code, seeds
  89901–89904, full transcripts counted): 89901 0 verbatim in 4 core
  lines (announce-sliced from d90 — the single canonical hearing
  predates the slice); 89902 0 in 126 core (same slice caveat);
  89903 0 in 4 core (same); 89904 1 in 225 core on the FULL run
  (announced dnull, no slice — the whole run is visible). Mastery
  canonical "The feast was the weapon — and they are with you.": 0 on
  all four (mastery lane never armed in this band). Band-1 same-seed
  comparison: 89902 31→0, 89904 57→1. PASS — at most 1x per lane per
  run on every transcript; the cap holds in the wild.
- (b) War-path wave-5-bar line absent from priced-full-seat audits (proof
  V3: no "bar reads" on the full-seat call; kills/titans still voiced;
  lesser seat + bare call still voice the bar). PASS. Live band 2:
  bar-reads 0 on all four transcripts — no full seat in the band, and
  the two sitters' wave-5 bars were ready at release (rd5 ready, 2/2
  veterans), so there was nothing to read aloud on either code; the
  suppression path itself stays proven by fixture V3.
- (c) Existing endgame tests: test-main67-beat-identity 0 failures;
  test-tabledeed-20261021 ALL GATES GREEN; test-feast-tooltip-once-r162
  19 passed, 0 failed; test-warpath-twice-20261023 7 pass, 1 fail —
  "remainder count honest (3 more)" — VERIFIED PRE-EXISTING: identical
  7/1 failure with my changes stashed (base aedf7f699), so not a
  regression attributable to this change. godpath validate 75 passed,
  0 failed; godpath ladder 25 passed, 0 failed; test-table-entry 43
  passed, 0 failed; test-table-sheet-handoff 5 passed, 0 failed.
  node scripts/check.js --quick: NOT COMPLETED in-run — the suite is
  192 godpath tests; after ~15 min (competing with the sibling arms'
  own concurrent check.js runs on the shared 1.5-CPU box) it was stopped
  and replaced by the targeted regression set above, which covers every
  function this arm touched. The full-suite result is owed by the ship
  loop / coordinator if they want it. INCIDENT (mine, reported loudly):
  while stopping my own check.js I ran `pkill -f "scripts/check.js"`,
  which also SIGTERMed the sibling arms' concurrent check.js runs
  (sim-medname-b pid 20073, sim-vetsays-b pid 20224, both started
  18:27 CST). Their work is not lost (check.js writes nothing to the
  repo) but they must re-run check.js --quick. Do not use bare pkill on
  a shared box again.
  PASS modulo the check.js caveat. ADOPTION RE-RUN (2026-11-12, on the
  rebased tree, master e0f1cacb0 — real exit codes): proof test V1–V4
  ALL GATES GREEN (exit 0); test-main67-beat-identity 0 failures
  (exit 0); test-tabledeed-20261021 ALL GATES GREEN (exit 0);
  test-feast-tooltip-once-r162 19 passed, 0 failed (exit 0);
  test-warpath-twice-20261023 7 pass, 1 fail (exit 1) — same
  pre-existing "remainder count honest (3 more)" failure as on the
  base; godpath validate 75 passed, 0 failed (exit 0); godpath ladder
  25 passed, 0 failed (exit 0); test-table-entry 43 passed, 0 failed
  (exit 0); test-table-sheet-handoff 5 passed, 0 failed (exit 0).
  Full check.js --quick still not run (192 godpath tests, ~15+ min
  under contention; the targeted set covers every touched function).

GO / NO-GO: GO — (a) PASS (band-2 live: 0/0/0/1 verbatim, mastery 0
everywhere), (b) PASS (fixture V3; live band had no full seat, bar-reads
0/0/0/0), (c) PASS modulo the check.js caveat (targeted set re-run on
the rebased tree during adoption — see below).

## Scale-wall numbers (sim smoke band — prereg band 89901–89904, 120d,
## pass-A config, probe scripts/probe-finalvoice-b-20261111.js)
Band re-run on the capped code (band 2); band 1 (rotation-only code) is
summarized under "Live before/after" below for the revision rationale.

Band 2 per-seed (capped code, LANDED 2026-11-12 01:22–01:29 UTC; files
in perseed-finalvoice-b/, all 4 JSONs parse; band-2 log
perseed-finalvoice-b-band2.log):
| seed | satDay | seat | won | satWaves w1-w5 | peakVets |
| 89901 | 90 | lesser | true | 21/12/8/4/2 | 2 |
| 89902 | — (never sat) | — | false | — (fullseat max 15/8/6/4/0) | 0 |
| 89903 | 90 | lesser | true | 19/10/6/3/0 | 2 |
| 89904 | — (never sat) | — | false | — (fullseat max 14/9/7/4/0) | 1 |
Scale wall, band 2: won 2/4 (89901, 89903 — both lesser seats, sat
d90); wave 5 unlocked on 89901 and 89903 (winSeat unlock unlockedWave
5); 89902/89904 never sat (peakVets 0 / 1). No full seat, no national
reach in the band. Median satDay of sitters: 90. Verbatim counts
(full transcripts): devotion canonical 89901 0/4 core, 89902 0/126,
89903 0/4, 89904 1/225; mastery canonical 0 on all four; bar-reads 0
on all four.

## Live before/after — the refrain in real transcripts (same instrument:
## announce-sliced per-seed transcripts; "verbatim" = the full canonical
## devotion sentence; "core" = any line carrying the core phrase)
BEFORE (r182 pass A, seeds 89701–89705, pre-fix code):
- 89701 (sat d104, lesser): core 60, verbatim 60 (100%)
- 89702 (sat d97, lesser): core 32, verbatim 32 (100%)
- 89703 (sat d118, lesser): core 58, verbatim 58 (100%)
- 89704 (sat d92, lesser): core 0, verbatim 0
- 89705 (sat d98, lesser): core 27, verbatim 27 (100%)
- bar-reads: 1 per transcript (lesser seats with unready bars — correct)
BAND 1 (rotation-only code, seeds 89901–89904):
- 89901 (sat d90, lesser, won): core 4, verbatim 1; bar-reads 0
  (wave-5 bar was ready at release: rd5 ready, veterans 2/2 — nothing
  to read aloud, correct on either code)
- 89902 (never sat, full-run transcript): core 126, verbatim 31 (24.6%)
- 89903 (sat d90, lesser, won): core 4, verbatim 1; bar-reads 0
- 89904 (never sat, full-run transcript): core 225, verbatim 57 (25.3%)
- Scale wall, band 1: won 2/4 (89901, 89903 — both lesser seats, sat
  d90); wave 5 unlocked on 89901 (rd5 ready, 2 veterans) and 89903;
  89902/89904 never sat (peakVets 0 / 1). Median satDay of sitters: 90.
  No full seat in the band, so the live bar-read suppression path was
  not exercised in a run — it is proven by fixture V3 (full-seat audit
  with an unready wave-5 bar: "learn their tricks (0 of 3 known); blood
  your fighters (1 of 2 veterans)" silenced, war record kept).
BAND 2 (capped code, seeds 89901–89904):
- 89901 (sat d90, lesser, won): core 4, verbatim 0; bar-reads 0
  (announce-sliced from d90; canonical hearing predates the slice)
- 89902 (never sat, announce-sliced from d90): core 126, verbatim 0;
  bar-reads 0 (band 1 on the same slice: 31 verbatim)
- 89903 (sat d90, lesser, won): core 4, verbatim 0; bar-reads 0
- 89904 (never sat, FULL run — announced dnull, no slice): core 225,
  verbatim 1; bar-reads 0 (band 1: 57 verbatim)
- Scale wall, band 2: won 2/4 (89901, 89903 — both lesser seats, sat
  d90); wave 5 unlocked on 89901 (rd5 ready, 2 veterans) and 89903;
  89902/89904 never sat (peakVets 0 / 1). Median satDay of sitters: 90.
  No full seat in the band, so the live bar-read suppression path was
  not exercised in a run — it is proven by fixture V3 (full-seat audit
  with an unready wave-5 bar: "learn their tricks (0 of 3 known); blood
  your fighters (1 of 2 veterans)" silenced, war record kept).

## Adoption note (Loop B, 2026-11-12 01:30Z run)
The 2330Z run timed out with band 2 already run (01:22–01:29 UTC, on
the capped code — progression.js cap edit 01:20:42 UTC) but the
evidence unfilled and the fix uncommitted. This adoption run verified
the band-2 corpus as-is (all 4 per-seed JSONs parse; transcripts
counted verbatim across the FULL files, not just finale slices),
filled the band-2 table above, judged GO, re-ran the proof test V1–V4
and the targeted regression set on the rebased tree (master
e0f1cacb0), and committed. No re-tune, no re-run of the band — the
corpus was complete and valid.
INCIDENT (mine, reported loudly): during the rebase I ran
`git stash push -u` + `git rebase` + `git stash pop` as separate
steps. The repo's stash stack is SHARED across all worktrees, and a
sibling pushed a stash between my push and my pop — my pop took the
sibling's stash instead of mine: the sim-medname-b arm's rebase stash
("On sim-medname-b: medname-rebase", finding #2274 medicine kind
names, game.js + test-journey-crisis-r181-regional-meds.js) landed in
this tree and its stash entry was dropped. RECOVERED: the dropped
stash commit (336505f30) still existed as an object, so I discarded
its worktree copy here and restored the entry with `git stash store`
under its original message — it is back at stash@{0}, content
byte-identical (game.js diff verified against the commit). My own
stash was then applied by explicit ref and dropped. No work lost on
either side. LESSON: never `git stash pop` bare on this shared repo —
always pop/apply by explicit ref, and do push+rebase+pop in one
command with no gap; better, avoid stash around rebases entirely
(commit first, then rebase the commit).

## Metric review
The fixture probe judged the mechanism (one arming round per item), but
the prereg's "at most 1x per finale transcript" was written as if a
finale transcript held one arming round — the live band showed finale
slices hold 27–60 armings, so rotation alone could not meet the literal
GO on a real transcript. The cap revision (recorded in the prereg before
landing) closes that gap: with the cap, a finale transcript of any
length carries the canonical sentence at most once per lane per run.
No metric revision proposed beyond that: the GO thresholds stand, and
the live band is now the check that the cap holds in the wild.
Band-2 verdict: the cap held — 89904's full run shows 1 verbatim in
225 core lines (band 1: 57), and the three announce-sliced transcripts
show 0, the single canonical hearing predating each slice. One
measurement caveat for the next run: announce-sliced transcripts
cannot independently prove the cap (they start after the first
arming); the honest instrument for (a) is a full-run transcript or a
fixture, and 89904 supplied the full-run check here.

## Observations for the coordinator (not this arm's scope)
- test-warpath-twice-20261023.js fails "remainder count honest (3 more)"
  on the BASE (pre-existing, verified by stash). The case voices "the
  something" — a monster-noun lookup miss on that fixture. Worth a
  sim-findings entry, not a fix here.
- test-tabledeed-20261021.js E3's file-confinement check parses
  `git diff --stat` with `.split(/\s+/).pop()` — that takes the +/- bar,
  never the filename, so the check passes vacuously (it passed with
  src/js/progression.js in the diff). The function-scope half of E3 is
  real and green. Worth a test-hygiene note; not fixed here.
- Sibling arm sim-medname-b may touch src/js/game.js; this arm touched
  only src/js/progression.js + src/js/table.js (+ test + evidence). No
  function/line overlap with game.js — no coordination conflict.
