# sim-wave5door-openers — wave-5 DOOR-OPENERS census (run 2026-10-22, axis scale-onramp)

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE any sweep)

- **PRIMARY (DIAG-GO):** (a) every unlocking run's unlock 100% attributed with
  0 unexplained via scripts/w5gates-lib.js UNMODIFIED; (b) release-path
  classification (live-demand vs grandfathered) COMPLETE for all 6 gates on
  every unlocking run, with the day each bar released. DIAG-GO = (a)+(b) met.
  If ZERO seeds unlock → DIAG insufficient-data (report-only, NOT a failure —
  this is a DIAG arm).
- **THE SHARP QUESTION:** sim-windowreach-r4 (landed 7f6f02487) re-verified a
  wave-5 unlock (s65428/leadfeast, d67) and showed ALL 6 gates met via the
  GRANDFATHERED path at end-of-run (df4/df5 deferred=False, grandfathered=
  True). The open question: HOW does the door open on current master — is the
  grandfathered release the ONLY path, or do gates release on live demand on
  other seeds? A door that opens only through grandfathering is a design fact
  Steve needs to know.
- **RELEASE-PATH DEFINITIONS (engine semantics, src/js/standing.js):**
  - The defer5 hold applies iff `capped >= t5 && !rd5.ready && peak < 5`. On
    the FIRST day the gated total releases wave 5, peak<5 is required — so the
    release MUST have happened with rd5.ready=true (live demand). The
    grandfather clause (peak>=w) only waives FUTURE holds; a released door
    stays open while standing falls.
  - Classification rule (from the daily window trace, no end-state flag):
    peakRecord5Day = first day raw>=200 && capped>=200 && r5.ready (standing
    release day, live demand by construction). w5Day = first day uw>=5
    (door-open day). If peakRecord5Day == w5Day → live-demand open. If
    peakRecord5Day < w5Day → the door OPENED grandfathered (bars fell after
    the standing release; the peak ratchet held it). Same rule for
    defer4 (raw>=100, r4.ready) vs w4Day.
  - End-of-run df5.grandfathered=True is expected on EVERY unlocking run
    (peak>=5 ⇒ waived); it does NOT discriminate the release path. The census
    distinguishes by trace, not by end flag.
- **Seeds:** 65421–65428 × {leadfeast} pilot (8 seeds); if ≥1 unlocks, extend
  to 65429–65432 × {leadfeast} (4 more).
- **Substrate (EXACT windowreach-r4 substrate, FAIL LOUD):**
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1
  KILLDISC=1 POSTWIN=1; SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/
  VGEARBEATS/SURPLUSFEED unset. Policies: VCE.armedFor(leadfeast) via
  scripts/policies/vgearconfirm.js (plain VGEAR winning stack, no armorcatch
  layer). Horizon: 180d death-aware +10d tail (r4 oneRun pattern incl.
  post-win continuation).
- **§15 instrument-parity (DIAG substitute for before/after panels):** paired
  runs instrument-on vs instrument-off byte-identical (DET-GATE, 40d), 0
  instrumentErrors.
- **Non-unlocking runs:** report the binding gate per the lib, 16/16
  attributed or 0 unexplained.

## Context

- sim-windowreach-r4 (landed 7f6f02487) re-verified a wave-5 unlock on
  s65428/leadfeast (d67) and measured reach (4 engagements, 2 won by the
  player). Its gate attribution showed all 6 gates met with df4/df5
  grandfathered at end-of-run — the release PATH (live demand vs
  grandfathered) was never decomposed. This arm is that decomposition.
- DURING THIS RUN a substrate-bible correction was found (see Metric review
  and the findings backlog): r4's per-seed JSON records
  anchorCommit=0b2e2ea3dc3f — the unlock was measured on a STALE BASE, not on
  7f6f02487 as claimed. On true master 7f6f02487, s65428/leadfeast does NOT
  unlock (dies d41, maxWave 2 — reproduced 3×). The census below is measured
  on true master (anchorCommit=7f6f02487da1 in every per-seed JSON).

## Proof

`scripts/test-wave5door-openers-20261022.js` — 16/16 GREEN.
- a1–a6: w5gates-lib attribute() (UNMODIFIED) on synthetic vectors — all-met
  unlock attributed ('all gates met'); grandfathered unlock (peak 5, standing
  fallen) attributed; unexplained unlock NOT attributed; locked runs bind the
  right gate (defer5; stand-raw on low standing); locked-unexplained NOT
  attributed.
- b1–b8: the release-path classifier
  (scripts/wave5door-openers-classify-20261022.js, PURE) on synthetic daily
  traces — live-demand open (peakRecord5Day == w5Day, r5.ready true at open);
  grandfathered open (standing released d60, bars fell d64, door opened d66
  with r5.ready=false via the ratchet); locked (no open); bar-release days;
  grandfathered-hold-open at end of trace.
- c1–c2: DET-GATE — instrument-on vs instrument-off, s65428, 40d,
  byte-identical day-hash sequences, 0 instrumentErrors.
- BONUS (beyond pre-reg, run during the divergence investigation): narration
  on vs off byte-identical 95d on s65423 (firstDiff=-1) — voiced lines do not
  perturb trajectories; instrument on vs off byte-identical 120d on s65423
  (firstDiff=-1, both end at the d95 win stop) — the census instrument is
  neutral on the unlocking seed too.

## Sweep

`scripts/sweep-wave5door-openers-20261022.js` (r4 sweep pattern: killdisc v2
+ windowreach window layer + death capture + w5gates-lib, post-win
continuation hook) + `scripts/analyze-wave5door-openers-20261022.js`
(release-path census via the classifier). Per-seed JSONs (incl. death rows)
under evidence/2026-10-22/perseed-wave5door-openers/leadfeast/ — 12 runs,
0 errors, 0 instrumentErrors, anchorCommit=7f6f02487da1 throughout.

## Results — the door-open path census

**Unlocks: 1/12.** Only s65423/leadfeast opens the wave-5 door (d109).

### s65423 — the door opens on LIVE DEMAND
- Door-open day d109; peakRecord5Day = 109 = w5Day → **live-demand open**;
  r5.ready=true at d109 (bars {armored:4, armed:9, tricks:21, veterans:2}).
- defer4: live-demand too (peakRecord4Day=79=w4Day, r4.ready=true).
- Bar releases (demand5 = {armored:4@P>=15, armed:6, tricks:3, veterans:2}):
  armed d2, tricks d11, veterans d102, **armored d109 — the last bar, filled
  the very day the door opened.** (demand4: armored d2, armed d2, tricks d11,
  veterans d79.)
- The other gates, all live: w3rung d71 (day floor + ledger), stand-raw d79,
  plenty-cap d79, w4faced d94.
- w5gates-lib: unlocked, attributed=true, 'all gates met', 0 unexplained;
  df4/df5 grandfathered=true at end (expected — peak>=5 waives future holds),
  peak=5.
- End of run: uw=5 but r5.ready=FALSE (bars collapsed to
  armored:1/armed:2/tricks:23/veterans:0) → the door is **held open
  grandfathered** after release. The r4 evidence's "grandfathered path"
  described this end-state, not the opening mechanism.
- Ordering: win d95 (feared) BEFORE unlock d109 — the door opened 14 days
  post-win, in the post-win window. The win does not truncate the window;
  the door is a lagging indicator on the winning substrate (consistent with
  r4's windowreach pattern).
- Release-path mix across the corpus: {defer4:live-demand/defer5:live-demand: 1}.
  Doors held open grandfathered at end-of-run: 1/1.

### The 11 locked runs — 11/11 attributed, 0 unexplained
- Binding gates: defer5 8/11 (the wave-5 readiness gate — veterans/armored
  bars never fill), defer4 1/11 (s65421), stand-raw 1/11 (s65431),
  w3rung 1/11 (s65428 — died d41).
- defer5 is the binding gate on 8 of 11 locked runs: the wave-5 door is
  readiness-bound (veterans + armored@P>=15), not standing-bound.

### Wall numbers (the corpus)
- runs=12, national=9, table=9, wins=7 at end (8 winDays — s65422 won d134
  then died post-win), wave-5 unlocks=1.
- Wave reach: 1:12, 2:12, 3:11, 4:10, 5:1. Median survival 159d, max 181d.
- Death causes (top): combat 156, villager combat 52, monster 23,
  starvation 7, sickness 6, expedition 5.
- 0 instrumentErrors across the corpus.

### PLAIN-WORD VERDICT
**The wave-5 door is a live-demand door on current master — not a
grandfathered door.** The one unlock in the census opened the day its last
readiness bar filled (armored@P>=15, d109), with every gate met live. The
grandfather clause only keeps the door open afterwards (bars collapsed by
end of run, door still open via the peak ratchet). A door that opens ONLY
through grandfathering does not occur — and structurally cannot occur for
the FIRST release (peak<5 is required to record the release, which forces
rd5.ready=true). Steve's question gets its answer: the grandfathered
release is not the only path; on the measured evidence it is not a release
path at all — it is the hold-open path.

## Village assessment (s65423 — the unlocking run)

- The scholar died d94 in expedition combat (chan=expedition) — the same day
  wave-4 was first faced. A successor won the table d95 via feared/light:
  **a posthumous win.** The door opened d109 under the successor.
- What the door cost: the successor died of dehydration d113; then a raid
  cascade d119–d123 killed six named villagers (victor_lopez, chantal_mukendi,
  sigrun_eiriksdottir, nikolai_volkov, and two generated) — village-lost d131.
- The two veterans who filled the veterans bar (d102) died in that cascade;
  the armored bar collapsed with them. The door stayed open over a dying
  village.
- Reach: ZERO wave-5 engagements, zero wave-5 kills. A wave-5 Timeslot
  arrived d119 ("Something moves out there — The Timeslot. It followed you.")
  but stopped at the boundary, pacing, while the village was mid-collapse —
  never entered TB, so the instrument (correctly) records no engagement.
  The herald refused muster d88 (0 of 10 blades) and fed on the stores
  d104/d109/d119 ("It is eating the realm while you deliberate").
- Who thrived: Sigrun and Chantal stood down wave-4 monsters twice each
  (Paparazzo, Ad Break) and bloodied the veteran bar; the village won four
  post-win contests (Tide Clock, Windfall, The Oath, Riddle Me This) even as
  it died. The village was competent and doomed — the classic post-win
  window shape.

## Sense test (SENSE-TESTING LAW — meaning, not counts)

Two narrated transcripts on the unlocking seed (trajectory-verified:
instrument on/off byte-identical 120d; narration on/off byte-identical 95d):

1. **Wave-4 window (d70–d95):** the release beat lands ("📡 RATINGS ARE UP...
   Wave 4 talent has been released. The Mirror Draft opens.") and the hold
   beats are honest about the short bars ("armor the village (2 of 4 fighters
   armored); blood your fighters (0 of 2 veterans)"). The herald refusal is
   arithmetic, not cowardice ("You cannot face this alone — sound the call,
   muster 10 allied blades (you have 0). This is not courage. This is
   arithmetic."). Contests read as shows, not rolls. Coherent.
2. **Wave-5 window (d100–d131):** the hold beats count down the bars
   (d100: 3/4 armored + 1/2 veterans → d107: only armored short → d109
   release: "the Producers have greenlit the fifth draft" + "You've gotten
   too big for the story... Meet the PRODUCERS."). The fiction tracks the
   mechanism exactly: the door opens when the last named bar fills. After
   the release, the beats keep faith — the herald eats the stores while the
   village deliberates, the Timeslot arrives as the village collapses. The
   garden keeps honest books through it all (untended plots die on schedule).
   The window reads as a dying village's last days, not a victory lap.

No robotic dialogue, no filler loops, no fabricated shared history in either
window. The System's register (big brother + chilling benefactor) holds.

## Metric review

- The pre-registered DIAG-GO ((a) 100% attribution, 0 unexplained; (b)
  release-path classification complete for all 6 gates) was met exactly as
  written: s65423 attributed 'all gates met', 0 unexplained; all 6 gates
  classified with release days. No metric revision needed.
- Corpus note: pre-reg said "16/16 attributed or 0 unexplained" for
  non-unlocking runs; the actual corpus is 12 runs / 11 locked — 11/11
  attributed, 0 unexplained. The binding holds at the observed n.
- The pre-reg's sharp question assumed r4's s65428 unlock as the substrate
  baseline. The stale-base correction (below) supersedes that assumption but
  does not change the DIAG-GO evaluation — the census question ("how does
  the door open") is answered on the true-master corpus.
- Instrument neutrality was proven beyond the pre-reg (40d/s65428): paired
  on/off byte-identical 120d on the unlocking seed s65423, and narration
  on/off byte-identical 95d. The mid-run divergence scare (sense run
  maxWave=4) was root-caused to the missing post-win hook in the sense
  driver, not to narration or the instrument — the stock harness stops at
  the win flag, and the d109 unlock lives in the post-win window.

## Blanks filled / documented

- **Filled:** the release-path classifier
  (scripts/wave5door-openers-classify-20261022.js) — trace-based, engine-
  semantics-grounded, proof-tested 8/8 on synthetic fixtures.
- **Filled:** the stale-base verification method — a DIAG claiming "current
  master" must have per-seed anchorCommit == the landing commit; verified by
  re-running the known-unlocker on a scratch worktree at the recorded base.
- **Documented (findings backlog):** r4's "unlock re-verified on current
  master" was measured on 0b2e2ea3dc3f; on true master 7f6f02487 s65428 dies
  d41 (game-code commits df66ebaff, 5d8f5d551/eb45a5c53, 42d328d35 sit
  between the bases — not bisected, this arm's scope is the census).
- **Documented:** on current master the wave-5 unlock is rarer than r4
  reported (1/12 here, post-win only) and the old known-unlocker is dead —
  the scale-onramp axis should treat s65428 as retired.

## Convergence note

- Axis: scale-onramp. This arm answered "how the door opens": live-demand,
  structurally (the first release cannot be grandfathered). The blocking
  question under the wave-5 door moves from mechanism (answered) to rate:
  1/12 unlocks, readiness-bound (defer5 binds 8/11 locked runs), unlocks
  arriving post-win on the winning substrate.
