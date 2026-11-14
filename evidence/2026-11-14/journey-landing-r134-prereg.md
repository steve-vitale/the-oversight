# journey-landing r134 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon d28)

**Run id:** loop-a-20261114T164500Z (scheduled Sat 2026-11-14 16:45 CST, started 22:43Z).
**Recovery at start (stale-lock + r133 abort):** no lock file existed at run start.
Registry showed `journey-landing` ACTIVE with heartbeat 2026-11-14T21:56:09Z (~47 min
stale), run_id 2026-11-14T21:52:50Z — the r133 run, which died in registration
(git reset --hard hung under load; see memory 2026-11-14, 16:03 CST entry). No live
processes, no writes newer than the 21:52Z checkout → dead by the 15-min rule.
Retired the stale claim with `worktree-release.sh journey-landing abandoned`
(23:50Z read-back: done-abandoned); the reaper then removed the worktree dir with
the branch KEPT (r129 branch `journey-landing` intact at 6b99d6a90, verified).
Re-registered under the fresh per-run slug `journey-landing-r134` from master, as
r131/r132 did and as the r133 note directed ("retries registration from master").
Registration took ~16 min (git worktree add under heavy box load — balance-panel
children at 20%+ CPU each); the run waited it out instead of dying at this step.
Heartbeat landed 23:06:35Z (read back from registry); hbloop every 10 min
(`~/workspace/worktrees/journey-landing-hbloop-r134.sh`).
**Base:** local master `007c61738` (sim-transplant16-a evidence fix). `git pull
--ff-only` in main tree: already up to date. Main tree clean at start; disk 41%.
**Lock:** created 22:44:57Z, run_id `loop-a-20261114T164500Z`.
**Worktree** `~/workspace/worktrees/journey-landing-r134` (branch
`journey-landing-r134`) registered via `scripts/worktree-register.sh`.
**Rotation:** read 0, write 0→1 at run start (verified by read-back).
**Numbering note:** Lane A leg counters are per-leg; the last landing run was r132,
the aborted one r133, so this run is r134.
**src/js delta since the r132 fix (3bffd4752):** Reunion arena balance ONLY
(e17c08d78, 0d8d3650a, ee8292e0b — arena-only clone, wild Reunion untouched) plus a
version bump. No landing-window code changed since the r132 nod-loop fix landed.
Everything else since is evidence-only. The r129 terrain-pocket fix is still NOT
on master (branch `journey-landing`, awaiting Steve's call).

## Seed bands — DELIBERATE REUSE (carried panel band, sanctioned)

**Panel seeds 1142–1151 (the r121 band, 13th run).** The landing leg's carried
bindings are judged on this band by every landing run since r121; reuse is
sanctioned by the r121–r133 preregs, which name the band as the carried panel.
**Freshness check (local_seed_band_freshness skill, this run, before any scored
seed):** grepped `evidence/*/journey-landing-r1*-prereg.md` for `1142–1151` —
named in r126–r132 preregs (carried band). Grepped goal hidden_files for
forbidden/banned lists naming 1142 — no list names this band (only unrelated
tracker mentions of other bands). No forbidden-band list names 1142–1151.
Reservation explicitly released for this run's carried-panel use. Recorded here
per the skill.

**Design — single-side AFTER panel on current master (§9, §15):** driver is the
r132 driver verbatim except OUTDIR/header (`scripts/journey-landing-r134-20261114.js`),
seeds 1142–1151, DAYS=28 (days 1–14 judged, horizon d28, as r131/r132). No BEFORE
side: the r132 corpus (`landing-r132-after/`, goal hidden_files) IS the BEFORE —
same seeds, same driver shape, same fixed code for the nod loop (the only src/js
change since is arena-only). PILOT FIRST: 3 seeds (1143, 1144, 1150 — all have a
commNone villager in the r131/r132 corpus) with the repeat-nod probe; expand to
the full 10 only if the pilot shows no surprise (0 loop sittings, bindings
holding). Analyzers (as r132): scripts/analyze-landing-q1-dialogue.js;
scripts/analyze-landing-r118-outingchain.js; scripts/analyze-landing-r126-presshop.js;
scripts/analyze-landing-r125-personal-bridge.js; scripts/analyze-landing-r126-bridge-pools.js;
scripts/analyze-landing-r104-20261105.js; scripts/analyze-landing-r112-practice.js;
scripts/analyze-landing-r117-huntpractice.js; scripts/analyze-landing-r117-zerodmg-v2.js;
scripts/analyze-landing-r120-scholar-turns.js; scripts/analyze-landing-r107-commit-offer.js
(with the r122 settled-favor exclusion); scripts/analyze-landing-r127-topic-dwell.js;
scripts/analyze-landing-r128-move-refusals.js; scripts/analyze-landing-r132-nodloop.js.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or gate
change in this run. **Perception law (2026-10-28) stands** — all instruments
read-only; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** Q1 is a regression verification of a fix
that landed this morning, on a master that has since moved; if the pilot
surfaces a NEW defect, it becomes the fix candidate (game-code/content fix in
scope where the instrument shows a defect the policy cannot fix alone). The r129
terrain-pocket fix and the D1 menu-label fix are OUT OF SCOPE — they live in
commit 59ad7c479 on branch journey-landing, awaiting Steve's call; this run
documents their absence on master, never re-fixes or cherry-picks them.

## Canon

docs/CONVERSATIONS.md binds Q1: no shared language → "the conversation is
nonverbal (gesture choices with varying outcomes)"; "a 3-exchange conversation
that feels real beats a 10-exchange loop." Steve's SENSE-TESTING LAW
(2026-10-11) binds Q1: conversations must have meaning — no filler loops, no
static menus. No canon doc covers the nv: gesture pools directly; the spec is
`src/js/conversation.js` (nv: handler, menu, winddown) plus
`src/js/convo-dialogue.js` (bare acknowledgments never flip substantive).
If no doc covers a target, say so in the run note instead of inventing.

## Questions

### Q1 (PRIMARY) — NOD-LOOP FIX REGRESSION + FRESH PEOPLE CHECK

The r132 fix (repeat nv: gesture thins the sitting: after the 2nd consecutive
identical nv gesture the villager acknowledges the repetition and arms the
winddown) landed on master this morning (3bffd4752) with panel LOOP=0, proof
13/13. Master has since moved (Reunion arena tuning, scale adoption). This run
re-proves the fix on the current master and does a fresh full-transcript people
check on the pilot seeds.
- **M-Q1a (pilot, driver-only):** repeat-nod probe — in deliberate nv sits,
  pick nv:nod on EVERY turn (up to the 8-turn probe cap), env
  `NV_REPEAT_NOD=1`. Pilot seeds 1143, 1144, 1150. Bar: **0** loop sittings
  (a sitting where the same nv gesture is picked ≥3× consecutively with no new
  content = filler loop).
- **M-Q1b (panel, standing picker):** full 10-seed panel on current master:
  nv sits still run 4–7 picks, winddown still surfaces, sittings still close
  gracefully via leave; the repeat-nod probe re-run shows 0 loop sittings.
- **M-Q1c (people check):** read full transcripts on the pilot seeds — do
  villagers act like people (want something, options engage/deflect, endings
  resolve/plant/owe)? Sense-read PASS/FAIL recorded per sitting sampled.
**Interesting finding (pre-registered):** a NEW defect surfaced in the pilot
transcripts (named, with the sitting/seed/day) becomes the fix candidate; if
none surfaces, the run closes as a verification run and says so plainly.

**Out of scope for this fix (note if reproduced):** the same "bare
acknowledgment without progression" shape in fluent sittings ('more'/'agree'/
'joke' filler); teaching the shared chooser to take nv:accept (r197 lane
decision owed); the Omar repeat-raise shape (scale leg).

### Q2 (carried) — PRACTICE / HUNT

r131/r132: movedCells d1→d28=98, seedsWithMove 10/10, skill0→pos 47, practiceReps
2814. Hunt reps **0** (15th panel running — H1-ESTABLISHED carries).
**M-Q2a:** movedCells ≥50, 10/10 seeds moving. **M-Q2b (watch, not a fail):**
huntReps count; >0 would be interesting; 0 is the carried shape, not a fail.
**M-Q2c:** kills total (r131/r132: 229).

### Q3 (carried) — BINDINGS, judged fresh on this panel

- **M1 ALIVE-D14:** ≥9/10 villages alive at d28 (r131/r132: 10/10).
- **M2 SYSTEM CONTACT:** 10/10 by d9 (r131/r132: 10/10, d8).
- **M3 FIGHT-LOG:** 0 unknown/mixed trigger (zerodmg-v2 byTrigger {}).
- **M5 PEOPLE:** sense-read PASS on sampled transcripts; HEED/D2/D3/D1
  recurrence counts reported, not re-scored as fixed.
- **HEED regression (r131 fix, on master):** WARNED-BUT-UNRESOLVED bar **0**
  (r131/r132 AFTER: 0). D3 bar 0 (r131/r132: 0). D2 bar 0 (r131/r132: 0).
- **Zero-DMG invariant:** `test-landing-r115-zerodmg-invariant.js` PASS.
- **Pocket watch (regression, unfixed code):** pocketFights count + stuckTurns
  (r131/r132: 0/0; defect seed 1209 is NOT in this band — expect 0; any pocket
  fight on this band is a NEW finding).
- **D1 watch (out of scope, document only):** garbled label "We never
  finished — themselves." expected to still render on master (fix is in
  59ad7c479, not on master). Count occurrences; do NOT fix.
- **Personal bridge (r125 fix):** 0 repeats in a sitting. **Small bridge
  (r127 fix):** 0 repeats. **Q1 r126 (combat-interrupted evening chain):**
  presshop farUnreached — bar: "identical to the previous panel (r131/r132: 1)".
- **Outingchain (r118):** CHAIN-COMPLETES-FAR shape reported, not gated.
- **Move-refusals (r128):** byReason {} expected.
- **1130-d6 amnesia shape:** 0 recurrences (transcript grep).
- **Miriam line:** 0 "That's settled".
- **R66 HUNGRY:** starvation deaths 0.
- **Mantle latency:** vacuous unless a mantle pass fires.

### Q4 (standing) — TELEMETRY CHECK

`telemetry-check.js` on the r134 panel vs `landing-split.json` (re-seeded r131).
Bar: no LOUD lines; any LOUD line is a same-run investigation item before the
baseline rolls forward.

## Metric review (to fill at closeout)

- Presshop bar: "identical to the previous panel (r131/r132: 1)" — carried from r131.
- M-PR1 (commit-offer): judge against the BEFORE shape, not the AFTER
  divergence (r130 proposal, applied r131) — applied this run.
- Any other metric that proves wrong goes here with a revision proposal for
  the NEXT run. A miss is NO-GO, never re-scored mid-run (§14).

## Telemetry

After writing evidence, run `node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/landing-split.json
--current '<per-seed-evidence-glob>' --metrics <key-metrics>` (baseline
re-seeded r131; do NOT roll it forward on a LOUD line without investigating
first).

## Run bookkeeping

- Rotation `journey-rotation-a.txt`: read 0, write 0→1 at run start (done,
  read back).
- Lock `playtest-loop.lock` (run_id `loop-a-20261114T164500Z`) deleted at closeout
  after run_id verification.
- Evidence (repo): `evidence/2026-11-14/journey-landing-r134-prereg.md`,
  `journey-landing-r134.md`, driver `scripts/journey-landing-r134-20261114.js`.
- Corpora (goal hidden_files, outside repo):
  `evidence/2026-11-14/landing-r134-after/` (pilot, then full panel if expanded),
  `evidence/2026-11-14/landing-r134-pilot-nodloop/` (repeat-nod probe pilot).
- Bonus, only after the leg mission is committed: complete the r129 fixed-side
  probe detail (which errand Chantal picks instead on day 28 on fixed code);
  delete the stale `~/workspace/scratch-fixed/` tree (0-byte game.js/convo-scene.js)
  if the probe is not completed this run; do not trust its contents either way.
