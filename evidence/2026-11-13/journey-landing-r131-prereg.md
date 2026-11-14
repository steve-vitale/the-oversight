# journey-landing r131 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon d28)

**Run id:** playtest-loop-a-20261114T0354Z (scheduled Fri 2026-11-13 21:45 CST, started 03:54Z).
Rotation read 0 → write 0→1 at run start (verified by read-back).
**Base:** local master `8c83b6a9a` (journey-scale r196 merged; r130 D3 fix ON master via
6ccdc325e "ask:village injured question gets an injured answer"). `git pull --ff-only`
in main tree: already up to date at start of this run. Main tree clean at start; disk 39%.
**Lock:** created 03:54:34Z, run_id `2026-11-14T03:54:34Z`. Heartbeat loop after registration.
Worktree `~/workspace/worktrees/journey-landing-r131` (branch `journey-landing-r131`)
registered via `scripts/worktree-register.sh`. Slug differs from the body's
`journey-landing` because branch `journey-landing` is occupied by the r129
terrain-pocket fix (commit 59ad7c479, NOT on master, awaiting Steve's
(a)-re-baseline / (c)-leave-unmerged call) — this run must not touch it.
**Delete lock at closeout, even on failure.**
**Numbering note:** Lane A leg counters are per-leg; the last landing run was r130, so this run is r131.
The r130 run fixed D3 in-branch (now on master), closed D2 by audit, and CARRIED the
warn_you heed-cycle loop (HEED) with a panel rate (1/104 sittings) as a design call.
This run takes HEED up as its primary mission: the mechanism is now pinned in code
(see Q1), and a minimal, proof-tested state-transition fix is in scope.

## Seed bands — DELIBERATE REUSE (carried panel band, sanctioned)

**Panel seeds 1142–1151 (the r121 band, 11th run).** The landing leg's carried
bindings are judged on this band by every landing run since r121; reuse is
sanctioned by the r121–r130 preregs, which name the band as the carried panel.
**Freshness check (local_seed_band_freshness skill, this run, before any
scored seed):** grepped `evidence/*/journey-landing-r1*-prereg.md` for
`1142–1151` — named in r121–r130 preregs. Grepped `evidence/*/sim-*-prereg.md` for
`1142` — hits are timestamps (`1142Z` run ids) and unrelated seeds (11429, 11439),
none naming this band. No forbidden-band list names 1142–1151 (checked `evidence/`
for band lists: sim-trajband-a, sim-vet2mfg-a, sim-fullseat-recheck-a preregs — none
names it). Reservation explicitly released for this run's carried-panel use.
Recorded here per the skill.

**Design — single-side AFTER panel on fixed code (§9, §15):** driver is the r130
driver verbatim except OUTDIR/header (`scripts/journey-landing-r131-20261114.js`),
seeds 1142–1151, DAYS=28 (days 1–14 judged, horizon d28, as r130). No BEFORE
side: the r130 corpus (`landing-r130-after/`, goal hidden_files) IS the BEFORE —
same seeds, same driver shape, unfixed code for HEED (the D3 fix does not touch
the HEED paths; r130's fixed-1150 re-run reproduced HEED byte-identically).
PILOT FIRST: 3 seeds (1150, 1142, 1146 — 1150 is the defect seed). Expand to the
full 10 only if the pilot shows the fix working (1150 sitting engaged) with no
regression. Analyzers (as r130, DIR via argv where supported):
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
**Gating freeze (2026-10-27 16:53) stands** — no threshold, bar, price, or
gate change in this run. **Perception law (2026-10-28) stands** — all
instruments read-only; pickers press offered menu items only.
**DELIVER OVER MEASURE (2026-11-01):** Q1 is a fix for r130's carried HEED
defect; Q4 is the owed telemetry-baseline maintenance from r130's metric
review. A game-code/content fix is in scope where the instrument shows a
defect the policy cannot fix alone. The r129 terrain-pocket fix and the D1
menu-label fix are OUT OF SCOPE — they live in commit 59ad7c479 on branch
journey-landing, awaiting Steve's call; this run documents their absence on
master, never re-fixes or cherry-picks them.

## Canon

No canon doc covers landing dialogue pools directly; the spec is
`src/js/convo-wants.js` (want pools), `src/js/convo-scene.js` (sitting
flow), `src/js/convo-thread.js` (thread labels). Steve's SENSE-TESTING LAW
(2026-10-11) binds Q1: conversations must have meaning — the NPC wants
something, options engage or deflect it, endings resolve/plant/owe. No
filler loops, no static menus. If no doc covers a target, say so in the run
note instead of inventing.

## Questions

### Q1 (PRIMARY) — HEED: the warn_you want's content is delivered without engaging the want

**Mechanism pinned in code (this run, before any edit).** The warn_you want's
engageBeat (the actual warning, `convoWantWarning`) is spoken by TWO paths that
never advance the want stage — while the want-menu path (dlg:details) does:
- `alive:want` handler (conversation.js, WANT RESUME branch, stage 1–2): speaks
  `c.want.def.engageBeat` and then sets `c.want.stage = Math.max(stage, 1)` —
  stage stays 1. Its own comment cites the arc ("0 selected -> 1 surfaced ->
  2 engaged, code: convoWantEngage") but never calls it.
- `alive:thread` handler with thread 'want' (conversation.js): speaks
  `convoThreadBeat` (t==='want' routes to engageBeat) with no stage change.
The r130 transcript proves it in the wild (1150 d6 Dauletkhan, 21 turns): the
warning is delivered TWICE — turn 5 via [alive:thread:want] ("I don't know
what's moving out there...") and turn 19 via [alive:want:warn_you]
("Something's been moving out past the treeline...") — while the want sits at
stage 1 the whole sitting and ends stage 3 'unresolved'. The menu keeps
offering dlg:details ("Tell me.") as if the warning had never been told.
- **M-Q1-HEEDa (fix):** on both paths, when the engageBeat line is actually
  delivered (non-null), call `convoWantEngage(vid, 'engage')` — the exact
  transition dlg:details performs, and the exact guard pattern the
  dlg:more/askwhy/comfort handlers already use ("THREAD-COHERENT ENGAGEMENT",
  gap-closure 2026-10-17: engaging with the want's thread engages the want).
  Settled-favor and stage-0-opener branches untouched (not engageBeat);
  null beats never engage. Proof test
  `scripts/test-journey-landing-r131-heed-engage.js` (see M-Q1-HEEDb).
- **M-Q1-HEEDb (proof):** proof test GREEN on fixed code; FAIL-control RED on
  a pristine-HEAD scratch copy (the 1150 d6 sitting replayed: want ends stage 1
  'unresolved' pre-fix, stage ≥2 'engaged' post-fix).
- **M-Q1-HEEDc (panel):** warned-but-unresolved sittings on the AFTER panel —
  a warn_you sitting where a warning line was delivered (THEM) but the want
  ends unresolved/abandoned (stage 1 at close) — bar: **0** (r130 BEFORE,
  re-counted with the same instrument: 1 — the 1150 d6 sitting). The 1150 d6
  sitting specifically must end stage ≥2 ('engaged'), not stage 3
  'unresolved'. The legacy HEED count (long dodging sittings: ≥10 turns,
  heed/details offered ≥3×, never taken) is reported as a watch metric, not
  the gate — a long sitting whose want properly engaged is a dodging player,
  not a stuck want; the defect is the stage, not the turn count.
- **Instrument update (pre-registered, before any scored run):**
  `scripts/analyze-landing-q1-dialogue.js` gains the warned-but-unresolved
  count (warning delivered ≥1 AND final resolution unresolved/abandoned) and
  the `warnStuck10` line is corrected to read the LAST stage in the sitting
  (its label says "ending stage 1", but the r130 version counted any stage-1
  line anywhere, including the opening turns). The BEFORE side (r130 corpus)
  is re-counted with the SAME updated instrument, so the comparison is fair.

**Interesting finding (pre-registered):** the 1150 d6 sitting ends 'engaged'
with the warning counted as delivered; the warned-but-unresolved count drops
to 0; no new dialogue defect appears on the panel (D2/D3/D1 counts reported).

**Out of scope for this fix (note if reproduced):** the same "beat spoken
without stage" shape in the gq resumeOffer path and the dlg:react 60%
continuation (both speak convoThreadBeat without engaging). Fix only if the
panel shows them producing stuck-want sittings; otherwise file as follow-up.

### Q2 (carried) — PRACTICE / HUNT

r130: movedCells d1→d28=97, seedsWithMove 10/10, skill0→pos 46, practiceReps
2757. Hunt reps **0** (14th panel running — H1-ESTABLISHED carries).
**M-Q2a:** movedCells ≥50, 10/10 seeds moving. **M-Q2b (watch, not a fail):**
huntReps count; >0 would be interesting; 0 is the carried shape, not a fail.
**M-Q2c:** kills total (r130: 223).

### Q3 (carried) — BINDINGS, judged fresh on this panel

- **M1 ALIVE-D14:** ≥9/10 villages alive at d28 (r130: 10/10).
- **M2 SYSTEM CONTACT:** 10/10 by d9 (r130: 10/10, d8).
- **M3 FIGHT-LOG:** 0 unknown/mixed trigger (zerodmg-v2 byTrigger {}).
- **M5 PEOPLE:** sense-read PASS on sampled transcripts; HEED/D2/D3/D1
  recurrence counts reported, not re-scored as fixed.
- **Zero-DMG invariant:** `test-landing-r115-zerodmg-invariant.js` PASS.
- **Pocket watch (regression, unfixed code):** pocketFights count + stuckTurns
  (r130: 0/0; defect seed 1209 is NOT in this band — expect 0; any pocket
  fight on this band is a NEW finding).
- **D1 watch (out of scope, document only):** garbled label "We never
  finished — themselves." expected to still render on master (fix is in
  59ad7c479, not on master). Count occurrences; do NOT fix.
- **Personal bridge (r125 fix):** 0 repeats in a sitting. **Small bridge
  (r127 fix):** 0 repeats. **Q1 r126 (combat-interrupted evening chain):**
  presshop farUnreached — the bar is re-worded per r130's metric review to
  "farUnreached identical to the previous panel (r130: 1)"; the regression
  check binds, not the old "stays 0" wording.
- **Outingchain (r118):** CHAIN-COMPLETES-FAR shape reported, not gated.
- **Move-refusals (r128):** byReason {} expected.
- **1130-d6 amnesia shape:** 0 recurrences (transcript grep).
- **Miriam line:** 0 "That's settled".
- **R66 HUNGRY:** starvation deaths 0.
- **Mantle latency:** vacuous unless a mantle pass fires.

### Q4 (owed maintenance) — TELEMETRY BASELINE RE-SEED

r130's metric review proposed re-seeding `landing-split.json` from the
r129/r130 panels (10-seed totals + per-seed means) so the baseline stops
crying scale on every run. **M-Q4a:** rebuild the baseline from the r129
BEFORE + r130 panel aggregates (same band, same driver shape); document the
re-seed in the run note. **M-Q4b:** `telemetry-check.js` on the r131 panel vs
the re-seeded baseline — bar: no LOUD lines; any LOUD line is a same-run
investigation item before the baseline rolls forward.

## Metric review (to fill at closeout)

- Presshop bar re-worded per r130 proposal (see Q3) — applied this run.
- M-PR1 (commit-offer): judge against the BEFORE shape, not the AFTER
  divergence (r130 proposal) — applied this run.
- Any other metric that proves wrong goes here with a revision proposal for
  the NEXT run. A miss is NO-GO, never re-scored mid-run (§14).

## Telemetry

After writing evidence, run `node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/landing-split.json
--current '<per-seed-evidence-glob>' --metrics <key-metrics>` (baseline
re-seeded this run per Q4; do NOT roll it forward on a LOUD line without
investigating first).

## Run bookkeeping

- Rotation `journey-rotation-a.txt`: read 0, write 0→1 at run start.
- Lock `playtest-loop.lock` (run_id `2026-11-14T03:54:34Z`) deleted at closeout
  after run_id verification.
- Evidence (repo): `evidence/2026-11-13/journey-landing-r131-prereg.md`,
  `journey-landing-r131.md`, driver `scripts/journey-landing-r131-20261114.js`.
- Corpora (goal hidden_files, outside repo):
  `evidence/2026-11-13/landing-r131-after/` (pilot, then full panel if expanded).
- Bonus, only after the leg mission is committed: complete the r129 fixed-side
  probe detail (which errand Chantal picks instead on day 28 on fixed code).
  Delete the stale `~/workspace/scratch-fixed/` tree (0-byte game.js/convo-scene.js)
  if the probe is not completed this run; do not trust its contents either way.
