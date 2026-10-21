# sim-windowreach-r3 — post-unlock-window census, round 3 (arm sim-windowreach-r3, DIAG, instrument-only)

Run: flesh-out loop, axis scale-onramp. Arm: sim-windowreach-r3 (DIAG-GO candidate).
Round 3 of the post-unlock window census. Round 2 (evidence/2026-10-21/sim-windowreach-r2.md)
got 1/32 unlocking runs (belongfeast s64858, d81; won d90 via THE FEARED; wave-5 fought once,
a timeslot evade) → DIAG-insufficient-data (minimum was 2). Separately sim-w5drift
(evidence/2026-10-21/sim-w5drift-20261021.md, DIAG-GO) bisected a drift: Codex direct-push
commit 00412b13f ("partial pantry gifts") changed the s64858 spawn census 22→6 (d54 partial
donation 770 kcal → first divergence d55 → scholar TB w3+ 6→0 → wave-4 unlock d71→never).
Known-unlocking seeds may no longer unlock on current master.

This arm's named next from r2: pre-screen on known-unlocking seeds OR post-win continuation.

INSTRUMENT-ONLY DIAGNOSTIC: ZERO src/js changes, ZERO scripts/policies changes. The window
layer installs ON TOP of the killdisc v2 base (scripts/killdisc-instrument-20261021.js, on
master, proven non-perturbing — NOT modified). Pure reads, zero game-state writes, zero RNG
draws.

This arm's files (all NEW — r2's files untouched):
- scripts/windowreach-r3-instrument-20261021.js — r3 window layer (r2's layer + per-day
  scaleRank + maxRank tracking; winTrack read post-run by the sweep)
- scripts/windowreach-r3-sweep-20261021.js — three-phase sweep (below)
- scripts/windowreach-r3-analyze-20261021.js — attribution analyzer + winTrack/#760 fields
- scripts/windowreach-r3-sense-20261021.js — narration-live sense re-runs for unlocking runs
- scripts/test-windowreach-r3-20261021.js — proof (E0-E4 + D2, all GREEN before any sweep)

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15)

**PRIMARY (DIAG-GO):** attribution completeness on unlocking runs — 100% of wave-4+
engagements AND wave-5 engagements attributed (known mid + resolvable wave from data +
taxonomy shape + captured fight-id joined to a kill record OR to a tbOutcome OR explicit
unresolved reason: fled/aborted/unrecorded); 0 unexplained, 0 instrumentErrors. Definitions
identical to r2 (sim-windowreach-r2.md). Wave-5 kill attributed = day + mid + resolvable
wave + killer + via. Unexplained = unresolvable wave OR engagement without fight-id AND
without day+mid fallback kill match. instrumentErrors = any entry in the instrument's
error sink (shared with the killdisc base).

**GO:** every unlocking run 100% attributed, 0 unexplained, 0 instrumentErrors.
**MINIMUM:** ≥2 unlocking runs (across phases 1+2). Below 2 = insufficient-data:
report-only, NOT a failure (diagnostic, no lever killed).
**Unit:** the run (6 + 32 + phase-3). No baseline-vs-variant contrast — diagnostic arm.
**SECONDARY (report, never judge):** wall numbers (national/table/wins, wave-4/5 unlocks,
median/max survival, exiled); wave-5 fights (by whom, outcomes); deaths by mechanism in the
post-unlock window; window survival days; did the unlock change the village's fate;
winTrack{path,seat} + regional-at-win + ever-national (fills backlog instrument gap #760 —
the vgear/twovets instruments never recorded them).
**SENSE-TESTING LAW (mandatory):** re-run unlocking runs narration-live and READ the
post-unlock window transcripts — judge meaning, coherence, relevance. Never the silenced
sweep capture for sense reads.
**Phases:**
- Phase 1 (reproducibility screen): seeds s64406, s64703, s64858 × {leadfeast, belongfeast}
  = 6 runs, 180d death-aware. Tests whether the measured unlocks survive the drift
  (sim-w5drift showed s64858's spawn census collapsed 22→6; expectation: s64858 likely
  no longer unlocks — reported honestly either way).
- Phase 2 (fresh-seed unlock screen): 16 FRESH seeds × {leadfeast, belongfeast} = 32 runs,
  120d horizon (door opens d75–97, wins truncate ~d90–130 — this is a screen, not a census).
- Phase 3 (window census): every run that unlocks (from either phase) gets the full window
  census at 180d + 10d tail. Phase-1 unlocking runs already ran 180d — they serve as their
  own census; phase-2 unlocking runs are re-run at 180d (deterministic rerun: the first
  120 days are trajectory-identical, so this is a true extension).
**Seeds:** phase 1 = 64406, 64703, 64858. Phase 2 = 65001–65016 — verified unused: no
s<seed>.json in any evidence/2026-10-21/perseed-* or evidence/2026-10-20/perseed-* corpus
(used sets include 64851–64866 r2, 64871–64878, 65111–65118, 64401–64408, 64501–64508,
64201–64208, 64001–64008, 66001–66008, 81301–81312, 975–982), and no collision with any
other seed-block naming in the evidence tree.
**Policies:** VCE.armedFor (VGEAR=1 winning substrate, scripts/policies/vgearconfirm.js,
pinned — read before the sweep). Armed only; no control (diagnostic).
**Substrate env:** FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1
KILLDISC=1 (asserted up front; SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT unset). Sweep
FAILS LOUD unless env matches exactly.
**Horizon:** phase 1: 180d death-aware (+10d tail max); phase 2: 120d; phase 3: 180d
(+10d tail max). Wins truncate (Game.over stops the harness day loop — see below).
**§15 note:** no before/after comparison — diagnostic with no intervention and no control
arm (§15 panel is for lever before/after; same unit note as r2).

### Post-win continuation (harness capability — documented per brief)

The harness's runDays loop is `for (day = 1; day <= days && !Game.over; day++)`
(scripts/sim-harness.js:546): it stops the day loop the moment Game.over is set. A table
win sets `this.over = true; this.won = true` (table.js), so runs end at the win.
Continuing past the win flag would require clearing Game.over/Game.won and undoing
this.wipe() — game-state writes that violate this arm's read-only instrument discipline.
**Verdict: the harness does NOT support post-win continuation within the DIAG read-only
constraint.** The post-unlock window on a winning run is therefore truncated at the win
day — reported as window survival days = win day − unlock day. The non-winning unlocking
run is the honest window observation (r2's w5gates s64406 died d170 in the window). A
no-win policy (finding #748's other branch) is a separate arm, not this one.

## Design deltas vs r2

1. winTrack{path,seat} + regional-at-win + ever-national on every run (#760 gap).
   winTrack: post-run reads of Game.won → tableState().{path,branch,resolution,phase}
   (every win variety sets these before won=true; wipe() only deletes the save blob, not
   Game.state — verified). seat: Game.tableSeat() post-run (pure read; proven by the D2
   re-run byte-identity). regional-at-win: scaleRank() post-run (scale flags survive the
   win). ever-national: max scaleRank across the daily trace (village<local<regional<
   national<global).
2. Phase 1 reproducibility screen on the three known-unlocking seeds (the drift question).
3. Phase 2 fresh-seed screen at 120d (cheaper than 180d for a screen).
4. Sense-testing per unlocking run (not just one).

## Results

(PENDING — filled after the proof gates go green and the sweeps run.)

### Proof gates

`scripts/test-windowreach-r3-20261021.js` — 47 passed, 0 failed (run 2026-10-21,
exact substrate env, ~81s). E0 shape (8: install/uninstall on a real harness game,
window fields complete incl rank/maxRank, no errors) · E1 det-gate (9: instrument-on
vs off byte-identical trajectories, armed substrate, leadfeast+belongfeast s65001 ×
60d, noinstr-vs-noinstr stability pre-check; rank trace captured) · E2 RED→GREEN on
synthetic fixtures (21: RED unresolvable-wave / no-fight-id-no-kill-match / unresolved
fieldFight / wave-5-kill-without-killer all flagged; GREEN unlock-day detection,
rank/maxRank ladder, roster, w4faced, kill-join, outcome-join, TB-refused, unrecorded,
day+mid fallback, wave-5 kill attribution, #760 winTrack/seat/rank/everNational carried
through the analyzer) · E3 read-only static scan of the new r3 instrument source (3: no
RNG draws, no Game.<x> assignments outside install wraps, no Game.state writes) ·
E4+D2 (6: 180d armed run through the real r3 sweep completes, zero instrument errors,
window trace populated, #760 fields present, deterministic re-run byte-identical).
All gates GREEN before any sweep — the sweep is authorized.

### Phase 1 — reproducibility screen

6/6 runs completed, 0 errors, 0 instrumentErrors. **0/6 unlocked wave-5** — none of the
three known unlocks reproduced on current master:

| run | end | days | maxWave | w5 | won | path | seat | rank | everNat |
|---|---|---|---|---|---|---|---|---|---|
| leadfeast s64406 | over-other | 90 | 3 | — | 1 | feared | lesser | national | 1 |
| belongfeast s64406 | over-other | 90 | 3 | — | 1 | feared | lesser | global | 1 |
| leadfeast s64703 | over-other | 141 | 4 | — | 1 | feared | lesser | national | 1 |
| belongfeast s64703 | over-other | 175 | 4 | — | 1 | feared | lesser | national | 1 |
| leadfeast s64858 | over-other | 93 | 3 | — | 1 | feared | lesser | national | 1 |
| belongfeast s64858 | over-other | 95 | 4 | — | 1 | feared | lesser | regional | 0 |

s64406/belongfeast (w5gates: unlocked d97, died d170 in the window) now wins d90 with
maxWave=3 — the win truncates before the door (d97) can open. s64703/leadfeast
(vgearconfirm: unlocked ~d75, won d90) now wins d141 with maxWave=4. s64858/belongfeast
(r2: unlocked d81, won d90) now wins d95 with maxWave=4 — exactly the drift's V3 row
(standing caps at 125, door shut). The drift is reproduced, not just bisected: the
partial-pantry-gifts commit didn't only change s64858's spawn census, it removed all
three measured unlocks from the seed set.

6/6 wins via THE FEARED (light road), lesser seat — the table prices the run while the
door stays shut. everNational 5/6; one run (s64858/belongfeast) won at regional.

Corpus: evidence/2026-10-21/perseed-windowreach-r3/phase1/.

### Phase 2 — fresh-seed unlock screen

32/32 runs completed, 0 errors, 0 instrumentErrors. **1/32 unlocked wave-5: belongfeast
s65013 (unlock d89, won d92).** Seeds 65001–65016 were verified fresh (no s<seed>.json in
any evidence/2026-10-21/perseed-* or evidence/2026-10-20/perseed-* corpus; no collision
with any other seed block in the evidence tree). 120d horizon.

Wall (32 runs): national 28 · table 21 · wins 19 · everNational 29 · wave-4 unlocks 21 ·
wave-5 unlocks 1 · endReasons over-other 19 / survived 6 / village-lost 5. All 19 wins via
THE FEARED (light road), lesser seat. Win ranks: global 11 / national 12 / regional 2
(phase-2 only; see combined below).

Corpus: evidence/2026-10-21/perseed-windowreach-r3/phase2/.

### Phase 3 — window census

The single unlocking run (belongfeast s65013) re-run at 180d: deterministic extension —
won d92 again (maxWave=5, w5Day=89), proving the window is genuinely truncated at the
win, not at the horizon. There is no post-win window to observe through runDays
(Game.over stops the day loop; see the post-win-continuation verdict in the
pre-registration). Census on the 180d record:

- Unlock d89: raw 409 / capped 309, 2 living veterans, 3 wave-4 types faced, 9 living /
  0 dead, rank global.
- Wave-5 fought? **No**: 0 wave-5 engagements, 0 villager field fights, 0 wave-5 kills.
  The door opened and nobody walked through.
- Window deaths (d89–d92): 2, both monster combat on d89 — killed by **The Influencer**
  (wave-4) and **Inspiration** (wave-2). The village bled on unlock day and won 3 days
  later.
- Wave-4 engagement census: 11 total — herald 7 (all TB-REFUSED, the tutorial titan's
  hard gate holding), influencer 2 (1 won, 1 fled), strike 1 (won), eulogy 1 (won).
  3 wave-4 kills, all scholar-side.
- Did the unlock change the village's fate? No — the village was already global with the
  table set (THE TABLE IS SET d90, one day after the unlock). Window survival: 3 days.

Corpus: evidence/2026-10-21/perseed-windowreach-r3/phase3/.

### PRIMARY verdict — insufficient-data (report-only)

38 independent runs (6 + 32; the phase-3 rerun is a deterministic extension of the same
trajectory, deduped — counting it twice would be metric gaming under §14). **1/38 runs
unlocked wave-5** — below the pre-registered minimum of 2. Per the pre-registration:
report-only, NOT a failure, no lever judged.

The instrument itself is healthy: on the single unlocking run, 11/11 wave-4 engagements
+ 0/0 wave-5 engagements/field-fights/kills attributed (100% on the letter), 0
unexplained, 0 instrumentErrors. Across all 39 records (incl. the phase-3 rerun): 0
instrumentErrors, 0 unexplained anywhere.

### SECONDARY (report, don't judge)

**Wall numbers (38 independent runs):** national 33/38 · table 27/38 · wins 25/38 ·
everNational 34/38 · wave-4 unlocks 25/38 · **wave-5 unlocks 1/38** · median survival
94d · max 175d · min 73d · endReasons over-other 25 / survived 8 / village-lost 5.
**Win tracks (all 25):** THE FEARED / light / lesser seat — unanimous. Win ranks:
global 11, national 12, regional 2. (exiled was not recorded by the r3 sweep — see
metric review.)

**The pattern across three measured unlocks on this substrate family** (vgearconfirm
s64703/leadfeast won d90 no wave-5 faced; w5gates s64406/belongfeast died d170 in the
window; r2 s64858/belongfeast won d90, one timeslot evaded; r3 s65013/belongfeast won
d92, zero Producer contact): **the wave-5 door is a lagging indicator of a village
about to win, not a new survival test.** Three of the four unlocked within days of a
scheduled table win; the one that died in the window (s64406) died to waves 1–3
attrition, never to Producers. No measured run has yet fought a Producer blow-by-blow
and lived to tell it — wave-5 REACH remains unmeasured.

**Village assessment (s65013/belongfeast):** a rich global village at its peak — raw
409/capped 309 standing, 2 living wave-4+ veterans, blooded fighters (influencer,
strike, eulogy kills), paying the Herald's nightly gorge (600–1,880 kcal/night) as the
price of doing business. It opened the fifth draft on d89 and sat at the table on d92.
Nobody fought a Producer. The village didn't need the door — it was already global,
already feasting, already winning.

### SENSE-TESTING

Narration-live re-run of belongfeast s65013 (FROMDAY=80), 68 voiced lines d80+ read in
full. Judgment:

- The readiness hold beat lands honestly (d81/d88: "The fifth draft stays in the wings —
  blood your fighters (1 of 2 veterans)"), then the release on d89: "RATINGS ARE UP...
  the Producers have greenlit the fifth draft. Wave 5 talent has been released." +
  "You've gotten too big for the story... Meet the PRODUCERS." Coherent escalation on a
  village at its peak — the fiction reads.
- The d92 audit line: "A lesser seat — global standing, waves 1–3 faced (13/9/3), with
  3 wave-4 fought, 12 contests survived, 2 crises weathered." The audit never mentions
  the fifth draft, released 3 days earlier — finding #738 (audit fiction's wave-4/5
  deed silence) is audible here again. The table doesn't know, or doesn't care, that
  the Producers were released.
- THE FEARED path voices fully and coherently ("Look what eating built.", "You won. Say
  it plainly: you won."), the light-road resolution reads earned.
- The Herald dominates the window's texture: nightly gorges, the d84 raid (Herald +
  Loud-Eyes ×2 + Big-Eyes + Paparazzo), the titan-refusal beats ("muster 10 allied
  blades (you have 0). This is not courage. This is arithmetic."), "It's still out
  there." The tutorial titan eats the realm while the village wins — the gate holds
  perfectly (7 herald engagements, 0 started, 0 kills), and the fiction is consistent:
  some things you don't fight, you outlast.
- The window reads as the village's fate NOT changing: the door opens, the table is
  set the next day, the village wins. Wave-5 arrives as narrative punctuation on a
  decided game.

## Metric review

1. The pre-registered minimum (≥2 unlocking runs) missed again: 1/38 (2.6%) on current
   master, vs r2's 1/32 (3%). The miss is a SAMPLE-SIZE + DRIFT question, not an
   instrument question (the one unlocking run is 100% attributed, 0 errors; 0
   instrumentErrors across all 39 records). Phase 1's reproducibility screen is the
   sharper finding: 0/6 known-seed reproductions — sim-w5drift's bisect is confirmed
   end-to-end, and the three measured unlocks are gone from the seed set. No metric
   was re-scored mid-run.
2. The analyzer's first full-tree pass double-counted s65013 (phase-2 120d + phase-3
   180d records) and printed a spurious DIAG-GO. Caught before writing the verdict:
   the analyzer now dedupes by (policy, seed), keeping the longest-horizon record —
   phase 3 is a deterministic extension, not a new run. The corrected verdict is
   insufficient-data. The spurious file was overwritten by the corrected run, not
   deleted-and-hidden: the attribution JSON in the perseed dir is the corrected one.
3. The analyzer was patched post-proof (main-block dedupe + w4ff in the perRun
   summary). The proof's E2-tested exported pure functions are unchanged; the new
   main-block logic was verified by the corrected full-tree run (38 runs, 1 unlock,
   insufficient-data as pre-registered). Next round should re-pin the proof or fold
   the dedupe into it.
4. exiled is not recorded by the r3 sweep (carried term from the brief's secondary
   list; r2 didn't record it either). Proposed: add an exiled read to the next round's
   sweep.
5. The sweep's per-run timing print shows negative/huge seconds (e.g. -32202363.5s) —
   cosmetic: the harness's deterministic sim clock (Date.now mock from the detfix)
   breaks wall-time arithmetic. Display-only; game-days are the honest duration.
6. Post-win continuation: documented as UNSUPPORTED within the DIAG read-only
   constraint (runDays stops at Game.over; clearing it would be a game-state write).
   The window on winning runs is truncated at the win day. Finding #748's other
   branch — a no-win policy variant — remains the route to a genuine post-unlock
   window census, and is a separate arm, not this one.

## Convergence

**Converging.** The instrument is proven (det-gate green, 0 errors on 39 records, full
attribution on the only unlocking run; winTrack{path,seat} + regional-at-win +
ever-national now recorded on every run — backlog gap #760 filled at the instrument
level). The window is measured once more and the pattern holds across all four
measured unlocks on this substrate family: the wave-5 door opens on a village about to
win and the village wins through it without fighting wave-5. The drift finding is now
reproduced, not just bisected: 0/6 known-seed reproductions on current master.

Named next (for the coordinator / findings): the no-win-policy variant of #748 — the
only honest route to a true post-unlock window census — or accept the standing result
that the wave-5 door on the VGEAR=1 winning substrate is a lagging indicator of an
imminent table win.

## Repo check

`node scripts/check.js --quick` after the arm's files were written: 284 passed, 3
failed (904s). All 3 failures are phone-frame proof freshness ("current phone evidence
is required", "every retained browser input matches current source") — pre-existing on
master, unrelated to this arm: the arm's diff is 5 new scripts/* files + evidence/*,
zero src/, zero index.html, zero UI. No green-list test touched by this arm failed.
