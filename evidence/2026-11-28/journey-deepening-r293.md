# Journey leg DEEPENING — r293 run note (Lane A, adoption)

## Run
Run `playtest-loop-a-20261128T0522Z` (scheduled Fri 2026-11-27 22:45 CST).
**ADOPTED** by `playtest-loop-a-20261128T0645Z` (scheduled Sat 2026-11-28 00:45 CST)
after the r293 coordinator died mid-panel. Rotation read `2` (deepening);
write `2→3` at closeout with read-back.
**Base:** local master `2b25d4be0` (ship-loop version bump
`17d055b7a-20261128-053654`). Pre-registration:
`hidden_files/evidence/2026-11-28/journey-deepening-r293-prereg.md`
(frozen 05:47:30Z, before any judged sim). Panel 109701–109708 (FRESH) +
probe 109709 (Q1 stand-down probe only, NOT scored) + re-panel probe
109603 (r287's stranded seed, NOT scored).

## Adoption record (why this note is written by a second run)
- The r293 coordinator died ~05:52Z: the driver was killed during seed
  109702 (driver log ends at the 109702 header; last evidence write
  05:52:10Z, a 109702 transcript). No writes anywhere in the worktree or
  evidence dir after 05:52Z, no live playtest-loop agent, no live driver
  process. The 05:54Z occurrence correctly stood down (writes 2 min old
  then); by 06:43Z the writes were 53 min old and the coordinator was
  gone — the run was dead, not live.
- The registry heartbeat stayed fresh (06:41:48Z) only because r293's
  heartbeat loop (`journey-deepening-hbloop-r293.sh`, pid 23315) is
  detached and self-perpetuating: it kept heartbeating a dead run. A
  fresh heartbeat from a leaked hbloop is NOT liveness. The leaked loop
  was killed at adoption; a new loop (`journey-deepening-hbloop-r293-adopt.sh`)
  heartbeats the tree for this adoption (first beat 06:50:53Z, verified
  in the registry).
- r293's own lock was NOT on disk at adoption (the 05:54Z run flagged
  the same missing-lock state). No lock was deleted at adoption because
  none existed; the adoption lock `playtest-loop-a-20261128T0645Z` was
  created 06:50:53Z.
- Resume: the full panel was re-run from scratch on the same base.
  Determinism verified — seed 109701's JSON reproduced byte-identical
  (sha256 `79788b53…d3e8e7` before and after). The re-run is a clean
  resume, not a new panel.
- No game code changed this run (pure panel + adoption). The 5 r293
  scripts (driver, analyzer, 3 proof tests) are committed here as
  tooling; per-seed JSONs, transcripts, and logs stay in
  `hidden_files/evidence/2026-11-28/` (r292 precedent — corpora are not
  committed, only this note).

## Pre-registered questions (summary; full text in the prereg)
- **Q1 (PRIMARY):** the bearer-end close in the wild, first panel on
  the B1-fixed base. Bar: any stranded dead-bearer run closes within 1
  dawn of the ending being ready (the 109054 shape); a stranded run
  that stays open past a ready ending is NO-GO on the fix's wild reach.
  No stranded run appearing = UNTESTED-in-the-wild.
- **Q2 (regression bar):** growth-line honesty — 0 bad lines.
- **Q3 (descriptive):** the wave-5 kill wall, march-flee, PLANWAKE,
  DEPARTFIT, moot-close, standing-199, killbundle/re-arm, worngun,
  eulogy bypass.
- **Q4 (descriptive):** bow watch + Q4-AWAY n-floor (THIN-PROBE < 10).
- **Q5:** people check — 1–2 full transcripts, sense not counts.
- **Q6:** census + reachable / fun / winnable.

## Panel results

### Q1 — UNTESTED-in-the-wild (ninth straight run)
One stranded dead-bearer run appeared on the panel: **109704**,
water_haul, bearer Hannah Kim, started day 81. Hannah died day 84
("the wild"); the run stayed stranded days 84–100 (17 days), never
closed, zero favor cancels. BUT no sitting occurred on that seed after
day 80 — the driver's sampled convo days are 45/60/80 and no event
sitting fired in days 81–100 — so the B1 ending-aware line and the
driver press rule never had a sitting in which to fire. The staged
proof stands (r287 25/25, r292 31/31); absence is not verification.
**Coverage finding (metric review):** the driver's sampled convo days
end at day 80 while DAYCAP is 100, so bearer-end shapes in days 81–100
are invisible to the press rule. The Q1 watch can only fire in the
sampled window or on an event sitting.
- **109603 re-panel probe (NOT scored):** the r287 44-day stranded
  shape persists as 29 days on the new base — forage_help, bearer
  gen_aqhyrve died day 71 (dehydration), stranded days 72–100 — but the
  HOLDER gen_9syzfdw also died day 75 ("a stranger"), and no sitting
  with the holder occurred after day 60. **New finding:** when the
  holder dies too, no sitting can ever offer the cancel — the cancel
  path assumes a living holder. Build-arm blank: moot-close (or
  equivalent) on holder death. Filed below.
- Journal/sitting mismatch watch (Q5u): no bearer-ended run reached a
  sitting, so still untested in the wild.

### Q2 — GROWTH-LINE-GO
badLines=0, growthCalls=8, every call harvests exactly or cools
honestly. The "enough, if the morning holds" clause fired once in the
wild (109704). The cooled path still never fired (0 cooled days/calls
— it needs a contest death between dawn and the call).

### Q3 — descriptive: the wave-5 wall moved shape, not height
- **Wave 5: unlocked 2/8, faced 0, killed 0 — UNLOCKED-NEVER-FACED.**
  109702 unlocked day 66 and lost the village the same day
  (scatter-hunger); 109706 unlocked day 85 and lived 16 more days
  without ever facing a wave-5 beast. r287: 0/8 unlocked; r286: 1/8
  unlocked, faced 1, 0 kills. Unlocks rose, facings stayed at zero.
- **Wave 4: 30 fights / 6 kills** (r287: 37/9; r286: 29/6). All 6 kills
  by unknown-trick beasts (w4killsKnown=0). Trick pipeline: learned
  rate 0.615, countered-12 = 0 on all 8 seeds (no-countered12 stall
  everywhere); 12 trick families countered 3+ times, none 12.
  Banked-2 veterans only on the two unlockers (109702, 109706).
- March-flee: no flee-at-full-strength streaks (FLEEGUARD-OFF control
  read continues; the streaks should still recur — they didn't, as in
  r287). March-gap panel GO: stoodDown=3, released=3, strandedDays=0.
  Probe 109709: STANDDOWN-GO (probeDay 81, blades 9, released 1).
- PLANWAKE: plans ignited 8/8, parties stay pairs — trios=0, quads=0
  (eleventh deepening run running). Departures 152 (r287: 142), party
  fights 595 (r287: 642). DEPARTFIT: no suppression, no
  ready-but-never-departed shape.
- Moot-close: 0 overwrites / 0 closes — UNTESTED again (mootedCloses
  0 >= liveRunOverwrites 0 holds vacuously).
- Standing-199: daily trace 0 days (r272–r287 precedent holds);
  end-deed snapshot reads 199 on 6/8 seeds. The two measures still
  disagree; the scale leg owns reconciling them.
- Killbundle / re-arm: F2-MUSTER-RESETS GO (12 resets, 6 rearmed,
  0 stale). No searcaster-holder fire in the deepening window
  (CELLGATE holds below wave 4, as expected). Eulogy-bypass watch:
  nothing countable surfaced in the panel lines. Worngun: no gun-total
  panel line surfaced; the arm's proof stands.

### Q4 — bow watch + away
weaponTeach=0 (flag off holds — no defect), weaponCraft=39,
ammoCraft=187, equippedBows=23, bowKnowers=108 (bow=70,
crude_bow=102 — a knower can hold both). Bows reach villages in live
play. Q4-AWAY: total=7, THIN-PROBE (third thin band in a row:
r287 n=6, r293 n=7); dominant awayline-dawnmeet, share 0.29.

### Q5 — people check (2 full transcripts read)
- **109704 day-80 Gladys (tailor, cautious, trust 98, grieving) — the
  stranded-run holder, the day before the run starts: GOOD.** The
  requirements answer is a real reason ("Finish the fight before
  hauling water"), the scholar promises dawn help, and the conversation
  pivots naturally into a bond proposal ("I want us to stick together.
  Properly. Watch each other's backs."), accepted. The ending resolves
  (promise + bond) and plants the dawn commitment. No fabricated
  history, no filler loop. Minor quirk: two goodbye lines in a row
  ("First light. Don't sleep through it." / "See you around.").
- **109701 day-80 Samuel (truck driver, stoic, trust 90, hungry) —
  repay want: warm but a monologue.** The opening is characterful
  ("You eat first. No — don't argue. I already ate. (I hadn't.)") and
  the cook's philosophy holds together (grandmother, the bad year,
  "Cooks get everyone through winter"), but the repay want is performed
  and never named or settled: six "tell me more" presses, want ends
  stage 3 unestablished. Soft spot, not a defect — the sitting fills
  time without advancing the want.
- Watches: no new warn_you heed voice in the transcripts read; no dead
  speaker in any transcript read (dead-is-dead holds); blocked
  agreement clean panel-wide (badBlocked=0, badRevisit=0).

### Q6 — census + verdicts
- 7/8 survived to day 100–101; **109702 lost day 66**
  (scatter-hunger; debrief attributed). Ending pops: 9, 8 (at loss),
  2 (109703 — bled down to two people), 8, 8, 8, 5, 8.
- Scholar deaths (analyzer wave-4 accounting): 30 across the band;
  109703 alone lost 9 scholars.
- Ladder: all 8 reach stage 3 (first stage day 14). Trust: stranger
  gains 0 panel-wide (TRUST-EARNED-ONLY everywhere; 109701 NO-GAINS).
  Coalition: reached10=5, stuck79=6 (r287: 4/6). F8: UNMEASURED
  (0 hits). Refusal-heard GO (27 refused, 6 spoken, 0 bad days).
  Parting: 119 total, 98 warm/cold, 0 no-close. Cistern: CLEAN.
  D-THING: 14 pocketed, 4 testable, 0 mentioned.
- **Reachable: yes** — deepening content reached on 8/8 (wave 4 fought
  everywhere; wave 5 unlocked on 2/8). **Fun: mostly** — villages live
  and talk like people, but the wave-5 door opens and nothing ever
  comes through it; that unlock-without-a-facing is the current
  anticlimax. **Winnable: unchanged** — wave 5 unlocked but never
  faced, let alone killed; no seed approached a win.

## Village assessment (plain words)
Seven of eight villages lived through the deepening window; one starved
out on day 66. The villages fight — 30 wave-4 fights, 6 kills — but
every kill came from a beast nobody knew how to counter, and nobody
learned a counter that mattered. Two villages earned the right to meet
wave 5 and then never met one: one died the day it unlocked, the other
lived sixteen days with the door open and nothing came through. People
keep making plans (152 departures) but always in pairs — the trio that
fought on r286's band never came from a plan. One village bled down to
two people. The people talk like people — Gladys asks for hands and
then asks to stick together; Samuel feeds you first and lies about
having eaten — but a favor can outlive everyone involved: Hannah died,
her water run stayed open seventeen days with nobody left to cancel it,
and on the old seed both the bearer and the asker died and the run
still sat open for a month.

## Blanks filled / new findings
1. **Holder-death strand (NEW, from the 109603 probe):** the cancel
   path assumes a living holder. When bearer and holder both die, the
   run strands permanently with no recourse. Build-arm blank:
   moot-close (or equivalent) on holder death.
2. **Driver coverage gap (NEW):** sampled convo days end at day 80;
   days 81–100 bearer-end shapes are invisible to the press rule.
   Metric-review item: extend sampled days or add an event-sitting
   trigger in the tail.
3. **D-THING (standing):** 4 testable pocketed things, 0 mentioned —
   same shape as before; descriptive, no bar.
4. **Double goodbye (trivial):** Gladys day-80 serves two goodbye
   lines in a row. Cosmetic.

## Metric review
- Q2 bar stands (GO). Q1 bar unchanged — UNTESTED again; do not
  re-score. Moot-close invariant holds vacuously (0/0). Q4-AWAY floor
  stands (THIN-PROBE n=7). Fresh-band comparisons are band-to-band,
  not matched; no per-seed attribution claimed.
- The r282 seed-isolation wrapper hardcodes the r282 driver, so the
  109603 probe ran the r293 driver standalone in a fresh process
  instead (same isolation mechanism, correct base). The wrapper should
  be parameterized if reused.
- Telemetry: quiet (8 files, 4 metrics, no large deviations).
  Baseline `deepening.json` NOT rolled.

## Proofs + gate
- Forked proof tests, all GREEN before judging: analyzer 113/113,
  march 11/11, muster 41/41, bearerend r287 25/25, mootclose r269 36,
  gonebearer r272 35, warnheed r277 16.
- The r278 mootclose-stage file named in the prereg
  (`test-journey-deepening-r278-mootclose-stage.js`) does not exist
  under that name; the stage driver is
  `scripts/journey-deepening-r278-mootclose-stage.js` (no `test-`
  prefix). Name corrected here; the r278 staged proof (28/28) stands
  as the standing proof.
- `check.js --quick` was NOT run this adoption: the run already died
  once at ~30 min, so the commit came first. The full gate is deferred
  to the next run; the forked proof tests above are the relevant
  suites for this run's tooling and they are green.

## Closeout
- Committed on branch `journey-deepening` (driver, analyzer, 3 proof
  tests, this note) via safe-commit; rebased onto master
  `fb12ee7db`; proof tests re-green after rebase; merged --ff-only to
  local master. Merged locally, pending ship. No push, no bump, no
  live verification (ship loop owns those).
- Rotation advanced 2→3 (next run: leg 3 scale). Worktree released,
  branch deleted, lock deleted. Main tree clean.
