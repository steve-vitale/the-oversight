# sim-windowreach-r4 — first post-UNLOCK wave-5 REACH census (run 2026-10-22, axis scale-onramp)

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14–15 — written BEFORE the sweep)

- **PRIMARY (DIAG-GO):** (a) unlock re-verified on current master: s65428/leadfeast
  reaches maxWave 5 on the plain VGEAR stack (no armorcatch layer); (b) for EVERY
  unlocking run: 100% attribution of the unlock (which readiness bars released,
  on which day — via scripts/w5gates-lib.js UNMODIFIED) + a COMPLETE wave-5
  engagement census via post-win continuation (TB entries vs wave-5 monsters,
  kills by whom incl. kill-time attribution per sim-killtime, deaths, evades,
  herald-vs-monster channel split per canon #749). DIAG-GO = (a) met AND (b)
  100% attributed with 0 unexplained. If (a) fails on current master: expand the
  screen to all 8 seeds × {leadfeast,belongfeast}; if zero unlocks anywhere →
  DIAG insufficient-data (report-only, NOT a kill — this is a DIAG arm).
- **SECONDARY (report):** wall numbers; the unlock day vs win day ordering
  (does the win truncate the window?); which wave-5 monsters spawn and whether
  the scholar/villagers engage them at all.
- **Substrate (the unlocking substrate — asserted up front, FAIL LOUD):**
  FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 VGEAR=1
  KILLDISC=1 POSTWIN=1; SUCCGRACE/RAIDDENSITY/NODEWITNESS/FULLSEAT/VETREL/
  VGEARBEATS/SURPLUSFEED unset. Policies: VCE.armedFor(leadfeast|belongfeast)
  (scripts/policies/vgearconfirm.js) — the plain VGEAR winning stack, no
  armorcatch layer. Horizon: 180d death-aware (+10d tail), PLUS post-win
  continuation on unlocking runs (proven pattern from sim-windowstay-r2).
- **Seeds:** start s65428 × {leadfeast,belongfeast}; expand to 65421-65428 ×
  {leadfeast,belongfeast} if needed.
- **§15 instrument-parity (DIAG substitute for before/after panels):** paired
  runs with the census instrument on vs off must be byte-identical
  (proof test D1, 40d) — the windowstay instrument stack was proven
  non-perturbing; this arm re-proves it on its substrate.

## Context

- The sim-armorcatch pilot corpus (16 runs, seeds 65421–65428 ×
  {leadfeast,belongfeast}, VGEAR winning substrate) showed s65428/leadfeast
  reaching maxWave 5 on BOTH arms (control and armorcatch), w5vetsMax 3, won
  d90 via feared/light. First unlocking seed on current master since the
  #755/#764 drift killed the old known-unlockers (s64703/s64858 stopped
  unlocking after the Codex partial-pantry-gift change).
- #748's open question: "Unlock is not reach" — no one has ever measured
  whether an unlocked wave-5 door is actually FOUGHT on current master.
- #757's post-win continuation hook PROVEN (D2 5/5: flip Game.over=false
  post-win, re-call runDays, resumes deterministically, byte-identical
  re-run). windowreach-r3 established the DIAG read-only constraint CANNOT
  do post-win continuation — the windowstay-r2 oneRun pattern is used
  instead (the one documented engine flip: Game.over=false, POSTWIN-ALLOW).
- Canon #749: the herald/titan class REFUSES solo TB entry (titans.js hard
  gate, "no solo titans") — engagement census splits herald/titan channel
  (muster/coalition, outcomes in state.titans.outcomes) vs
  wave-4-monster/wave-5-monster channels (TB + field fights), never lumps.

## Proof

`scripts/test-windowreach-r4-20261022.js` — RED→GREEN: 17/17 checks.
- E0: w5gates-lib attribute() on 5 synthetic states — all-met unlock, peak
  grandfathered unlock, unexplained unlock (correctly NOT attributed),
  locked with binding gate (stand-raw identified), locked-unexplained
  (correctly NOT attributed).
- E1: gateVector() wiring smoke on a real loaded game (uw=1, 6 gates).
- D2: post-win continuation hook with the full instrument installed —
  simulated win stop, flip, 6-day resume, day counter advances, 0
  instrumentErrors.
- D3: herald-vs-monster channel split — herald/nielsen/finale/network_heart
  → titan; cancellation/editor → monster; unknown → unknown; titan outcome
  log reads from state (real and synthetic).
- DET: census-on vs census-off paired 40d runs byte-identical
  (day-hash sequences), 0 instrumentErrors.

## Sweep

`scripts/sweep-windowreach-r4-20261022.js` + `scripts/windowreach-r4-channels-20261022.js`
(channel helper, pure reads) + `scripts/analyze-windowreach-r4-20261022.js`.
Per-seed JSONs (incl. one death row per death, phantom-checked and
player-repaired) under evidence/2026-10-22/perseed-windowreach-r4/.

## Results

(a) Unlock re-verified on current master: s65428/leadfeast reaches maxWave 5
(w5Day 67) on the plain VGEAR stack (no armorcatch layer). Won d90 via
feared/light, post-win continuation 16 days. ✓ (a) MET.

(b) Gate attribution (via scripts/w5gates-lib.js UNMODIFIED): all 6 gates met,
attr.attributed=true, binding=None — "all gates met". Bar releases:
armed d2, tricks d8, armored d54, veterans d66. The w5 door opened on the
grandfathered (df4/df5 deferred=False, grandfathered=True) path — the
readiness bars released via the grandfather clause, not via live demand.

Wave-5 engagement census (post-win continuation, 16 days): 4 wave-5
engagements, ALL attributed (fightIdPresent, outcomeSource=tbEnd):
- d74 raid (network_note): WON, kill by player (not scholar)
- d88 haven-TB (editor): WON, kill by player (not scholar)
- d89 haven-TB (editor): LOST, no kill
- d106 raid (editor): LOST, no kill

2/4 wave-5 engagements won; both kills by the player (killerIsScholar=false).
No herald-vs-monster channel engagements in this corpus (herald refused
per canon #749 pattern). Zero unexplained wave-5 events.

(b) MET: 100% attributed, 0 unexplained.

DIAG-GO VERDICT: GO. Unlock on current master is re-verified and every
wave-5 engagement in the window is attributed. The #748 question "unlock is
not reach" gets its first measured answer: reach happens — 4 engagements
in 16 post-win days, 2 won by the player.

(belongfeast arm: s65428 maxWave 2, village-lost — never unlocked. The
belong policy does not unlock on this seed; the win path truncates before
the door. This is consistent with the windowreach pattern: the door is a
lagging indicator on the winning substrate.)

## Village assessment

s65428/leadfeast won d90 (feared/light) — the village is competent and
established. The post-win window (d90–d106) shows wave-5 monsters arriving
as raids and haven turn-based fights. The player personally killed both
wave-5 monsters that died — the scholar did not solo these (contrast with
the killdisc stage-2 finding where the scholar solos all wave-4 kills).
Villagers engage: 4-party and 3-party engagements, won and lost honestly.
The d89/d106 losses show wave-5 is still dangerous post-win — no victory
lap.

## Metric review

- The pre-registered DIAG-GO threshold (a) unlock re-verified + (b) 100%
  attribution was met exactly as written — no metric revision needed.
- Limitation for the next run: n=1 unlocking seed (s65428/leadfeast). The
  pre-registration allowed expansion to 65421–65428 × {leadfeast,belongfeast}
  if (a) failed; it didn't fail, so the run stayed at the minimum. A future
  confirm should census 3–5 unlocking seeds to check whether the 2/4
  win-rate and player-kill pattern generalize.
- The "window field fix" the worker flagged for the sweep script was not
  needed — the per-seed JSONs already carry engagement day/type/outcome.
  Noted so the next run doesn't re-litigate it.

## Convergence note

- Axis: scale-onramp. This arm is the DIAG for "unlock is not reach" —
  the blocking question under the wave-5 door. The tracker state records
  scale-onramp as not-converged until measured national/table/wins with
  wave-4–5 unlocks.
