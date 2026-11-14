# journey-landing r132 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon d28)

**Run id:** loop-a-20261114T121445Z (scheduled Sat 2026-11-14 05:45 CST, started 12:14Z).
Rotation read 0 → write 0→1 at run start (verified by read-back).
**Base:** local master `237fb445f` (journey-scale r197 merged; r131 HEED fix ON master via
63c051206 "warn_you warning now engages the want"). `git pull --ff-only` in main
tree: already up to date at start of this run. Main tree clean at start; disk 40%.
**Lock:** created 12:14:45Z, run_id `loop-a-20261114T121445Z`. Heartbeat loop after
registration (PID 40876, every 10 min).
**Worktree** `~/workspace/worktrees/journey-landing-r132` (branch `journey-landing-r132`)
registered via `scripts/worktree-register.sh`.
**Slug-collision note (this run):** the body's `journey-landing` slug is occupied by
branch `journey-landing` (r129 terrain-pocket fix, commit 59ad7c479, NOT on master,
awaiting Steve's (a)-re-baseline / (c)-leave-unmerged call). The first register
call checked that branch out; the tree was removed cleanly (branch intact at
6b99d6a90, verified) and re-registered under the per-run slug, as r131 did.
The registry entry for the first (wrong) registration was lost when a concurrent
reaper rewrote the registry mid-run (release reported "slug 'journey-landing' not
registered") — the reaper lock-contention issue (2026-11-12) is still live: the
reaper held REGISTRY.lock ~12:13–12:24Z and skipped 4 consecutive runs on it.
Registration of r132 itself took ~8 min (`git worktree add` under heavy box load;
ship loop was mid version-bump at the same time).
**Delete lock at closeout, even on failure.**
**Numbering note:** Lane A leg counters are per-leg; the last landing run was r131, so this run is r132.
The r131 run fixed HEED (landed on master, 63c051206) and re-seeded the landing
telemetry baseline. This run takes the carried nod loop up as its primary mission
and regression-checks HEED on the same band.

## Seed bands — DELIBERATE REUSE (carried panel band, sanctioned)

**Panel seeds 1142–1151 (the r121 band, 12th run).** The landing leg's carried
bindings are judged on this band by every landing run since r121; reuse is
sanctioned by the r121–r131 preregs, which name the band as the carried panel.
**Freshness check (local_seed_band_freshness skill, this run, before any
scored seed):** grepped `evidence/*/journey-landing-r1*-prereg.md` for
`1142–1151` — named in r126–r131 preregs (carried band). Grepped
`evidence/2026-11-1*/sim-*-prereg.md` for `1142` — the only hit names band
140201–140208, not this band. No forbidden-band list names 1142–1151.
Reservation explicitly released for this run's carried-panel use. Recorded
here per the skill.

**Design — single-side AFTER panel on fixed code (§9, §15):** driver is the r131
driver verbatim except OUTDIR/header (`scripts/journey-landing-r132-20261114.js`),
seeds 1142–1151, DAYS=28 (days 1–14 judged, horizon d28, as r131). No BEFORE
side: the r131 corpus (`landing-r131-after/`, goal hidden_files) IS the BEFORE —
same seeds, same driver shape, unfixed code for the nod loop (the HEED fix does
not touch the nv: gesture paths). PILOT FIRST: 3 seeds (1143, 1144, 1150 — all
have a commNone villager in the r131 corpus) with the repeat-nod probe; expand
to the full 10 only if the pilot reproduces the loop with no surprise.
Analyzers (as r131, DIR via argv where supported):
scripts/analyze-landing-q1-dialogue.js (HEED/D3/D2/D1 counter);
scripts/analyze-landing-r118-outingchain.js;
scripts/analyze-landing-r126-presshop.js;
scripts/analyze-landing-r125-personal-bridge.js;
scripts/analyze-landing-r126-bridge-pools.js;
scripts/analyze-landing-r104-20261105.js;
scripts/analyze-landing-r112-practice.js;
scripts/analyze-landing-r117-huntpractice.js;
scripts/analyze-landing-r117-zerodmg-v2.js;
scripts/analyze-landing-r120-scholar-turns.js;
scripts/analyze-landing-r107-commit-offer.js (WITH the r122 settled-favor
exclusion); scripts/analyze-landing-r127-topic-dwell.js;
scripts/analyze-landing-r128-move-refusals.js.
NEW this run: scripts/analyze-landing-r132-nodloop.js (per-sitting same-gesture
max streak, nv picks, mime shown?, winddown surfaced?, ended-by) — parses the
driver transcripts directly.
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or
gate change in this run. **Perception law (2026-10-28) stands** — all
instruments read-only; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** Q1 is a fix for the carried nod-loop
defect (third band running); Q4 is the standing telemetry check. A
game-code/content fix is in scope where the instrument shows a defect the
policy cannot fix alone. The r129 terrain-pocket fix and the D1 menu-label fix
are OUT OF SCOPE — they live in commit 59ad7c479 on branch journey-landing,
awaiting Steve's call; this run documents their absence on master, never
re-fixes or cherry-picks them.

## Canon

docs/CONVERSATIONS.md binds Q1: no shared language → "the conversation is
nonverbal (gesture choices with varying outcomes)"; "a 3-exchange conversation
that feels real beats a 10-exchange loop." Steve's SENSE-TESTING LAW
(2026-10-11) binds Q1: conversations must have meaning — no filler loops, no
static menus. No canon doc covers the nv: gesture pools directly; the spec is
`src/js/conversation.js` (nv: handler ~line 7666, menu ~5058, winddown ~4993)
plus `src/js/convo-dialogue.js` (bare acknowledgments never flip substantive).
If no doc covers a target, say so in the run note instead of inventing.

## Questions

### Q1 (PRIMARY) — NOD LOOP: the same bare gesture repeats with no progression

**Carried observation, third band running** (Herve 5× r196, Xue 3×, Mariko 4×
r197): in a no-shared-words sitting with no mime shown, the player can only
nod/smile/point/listen; the scale driver's Mariko sitting (135303 d90-nv)
picked nv:nod 4× with agreement lines and no progression — "the purest filler
shape this band." The r131 landing corpus shows the landing-window shape:
8 deliberate nv sits, 4–7 picks each, all-nv streaks, winddown surfacing on
the turn before the last pick, all ending via leave — but the landing driver's
NV_PROBE alternates gestures (it excludes lastPickId), so it CANNOT reproduce
the same-gesture repeat; the r197 shape needs a repeat probe.
**Mechanism pinned in code (this run, before any edit).** The nv:nod handler
(conversation.js, `choiceId.indexOf('nv:') === 0` branch): speaks one of 3
rotating acknowledgment lines via convoPickCycle (`nv:nod` pool: "They nod
back, slowly…", "They nod. A small, careful acknowledgment.", "Nod returned.
The ice thins a fraction.") +1 trust via resolveConsequence — with NO state
change: no counter, no progression, no winddown arm. convoPickCycle cycles
the 3-line pool without immediate repeats, so the loop is semantic, not
verbatim: four nods, four "they nod back" acknowledgments, nothing new.
- **M-Q1a (pilot, driver-only):** repeat-nod probe — in deliberate nv sits,
  pick nv:nod on EVERY turn (up to the 8-turn probe cap), env
  `NV_REPEAT_NOD=1`. Pilot seeds 1143, 1144, 1150. Pre-registered bar for the
  loop: a sitting where the same nv gesture is picked ≥3× consecutively with
  no new content (no mime, no winddown, no speak_back, no progression) =
  filler loop. BEFORE (pilot on unfixed code) count recorded; AFTER (same
  probe on fixed code) bar: **0**.
- **M-Q1b (fix):** minimal game-side change — after the 2nd consecutive
  identical nv gesture, the villager's response acknowledges the repetition
  and arms the winddown (reuse the r19 nv winddown contract: surface, then
  the next gesture ends naturally), so the sitting thins instead of looping.
  Proof test `scripts/test-journey-landing-r132-nod-loop.js` (see M-Q1c).
- **M-Q1c (proof):** proof test GREEN on fixed code; FAIL-control RED on a
  pristine-HEAD scratch copy (repeat-nod sitting: 4 identical nods with no
  winddown pre-fix; winddown armed after the 2nd identical nod post-fix).
- **M-Q1d (panel, no-regression):** full 10-seed panel on fixed code with
  the standing picker (alternating gestures): nv sits still run 4–7 picks,
  winddown still surfaces, sittings still close gracefully via leave; the
  repeat-nod probe re-run on fixed code shows 0 loop sittings.
**Interesting finding (pre-registered):** the repeat-nod probe sitting ends
by winddown after ≤2 identical repeats, with a distinct second-repeat line;
no other nv gesture regresses (smile/pointself/listen still cycle).

**Out of scope for this fix (note if reproduced):** the same "bare
acknowledgment without progression" shape in fluent sittings ('more'/'agree'/
'joke' filler) — the nod fix is scoped to nv: gestures only. Also out of
scope: teaching the shared chooser to take nv:accept (r197 lane decision
owed) and the Omar repeat-raise shape (scale leg).

### Q2 (carried) — PRACTICE / HUNT

r131: movedCells d1→d28=98, seedsWithMove 10/10, skill0→pos 47, practiceReps
2814. Hunt reps **0** (15th panel running — H1-ESTABLISHED carries).
**M-Q2a:** movedCells ≥50, 10/10 seeds moving. **M-Q2b (watch, not a fail):**
huntReps count; >0 would be interesting; 0 is the carried shape, not a fail.
**M-Q2c:** kills total (r131: 229).

### Q3 (carried) — BINDINGS, judged fresh on this panel

- **M1 ALIVE-D14:** ≥9/10 villages alive at d28 (r131: 10/10).
- **M2 SYSTEM CONTACT:** 10/10 by d9 (r131: 10/10, d8).
- **M3 FIGHT-LOG:** 0 unknown/mixed trigger (zerodmg-v2 byTrigger {}).
- **M5 PEOPLE:** sense-read PASS on sampled transcripts; HEED/D2/D3/D1
  recurrence counts reported, not re-scored as fixed.
- **HEED regression (r131 fix, on master):** WARNED-BUT-UNRESOLVED bar **0**
  (r131 AFTER: 0). D3 bar 0 (r131: 0). D2 bar 0 (r131: 0).
- **Zero-DMG invariant:** `test-landing-r115-zerodmg-invariant.js` PASS.
- **Pocket watch (regression, unfixed code):** pocketFights count + stuckTurns
  (r131: 0/0; defect seed 1209 is NOT in this band — expect 0; any pocket
  fight on this band is a NEW finding).
- **D1 watch (out of scope, document only):** garbled label "We never
  finished — themselves." expected to still render on master (fix is in
  59ad7c479, not on master). Count occurrences; do NOT fix.
- **Personal bridge (r125 fix):** 0 repeats in a sitting. **Small bridge
  (r127 fix):** 0 repeats. **Q1 r126 (combat-interrupted evening chain):**
  presshop farUnreached — bar: "identical to the previous panel (r131: 1)".
- **Outingchain (r118):** CHAIN-COMPLETES-FAR shape reported, not gated.
- **Move-refusals (r128):** byReason {} expected.
- **1130-d6 amnesia shape:** 0 recurrences (transcript grep).
- **Miriam line:** 0 "That's settled".
- **R66 HUNGRY:** starvation deaths 0.
- **Mantle latency:** vacuous unless a mantle pass fires.

### Q4 (standing) — TELEMETRY CHECK

`telemetry-check.js` on the r132 panel vs `landing-split.json` (re-seeded r131).
Bar: no LOUD lines; any LOUD line is a same-run investigation item before the
baseline rolls forward.

## Metric review (to fill at closeout)

- Presshop bar: "identical to the previous panel (r131: 1)" — carried from r131.
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

- Rotation `journey-rotation-a.txt`: read 0, write 0→1 at run start.
- Lock `playtest-loop.lock` (run_id `loop-a-20261114T121445Z`) deleted at closeout
  after run_id verification.
- Evidence (repo): `evidence/2026-11-14/journey-landing-r132-prereg.md`,
  `journey-landing-r132.md`, driver `scripts/journey-landing-r132-20261114.js`.
- Corpora (goal hidden_files, outside repo):
  `evidence/2026-11-14/landing-r132-after/` (pilot, then full panel if expanded),
  `evidence/2026-11-14/landing-r132-pilot-nodloop/` (repeat-nod probe BEFORE).
- Bonus, only after the leg mission is committed: complete the r129 fixed-side
  probe detail (which errand Chantal picks instead on day 28 on fixed code);
  delete the stale `~/workspace/scratch-fixed/` tree (0-byte game.js/convo-scene.js)
  if the probe is not completed this run; do not trust its contents either way.
