# journey-landing r130 — PRE-REGISTER (Lane A, leg 0 LANDING, days 1–14 judged, horizon d28)

**Run id:** playtest-loop-a-20261113T2218Z (scheduled Fri 2026-11-13 15:45 CST, started 22:18Z).
Rotation read 0 → write 0→1 at run start (verified by read-back).
**Base:** local master `6df2519b9` (proofrefresh-b11 landed; culpritbisect round 13 merged
941eecdce). `git pull --ff-only` in main tree: already up to date at start of this run
(master moved 941eecdce → 6df2519b9 between the pull and the worktree registration;
worktree is at 6df2519b9, verified). Main tree clean at start; disk 36%.
**Lock:** created 22:18:21Z, run_id `2026-11-13T22:18:21Z`. Heartbeat loop
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/hbloop-r130.sh`
(every 10 min) after registration.
Worktree `~/workspace/worktrees/journey-landing-r130` (branch `journey-landing-r130`)
registered via `scripts/worktree-register.sh`. Slug differs from the body's
`journey-landing` because branch `journey-landing` is occupied by the r129
terrain-pocket fix (commit 59ad7c479, NOT on master, awaiting Steve's
(a)-re-baseline / (c)-leave-unmerged call) — this run must not touch it.
**Delete lock at closeout, even on failure.**
**Numbering note:** Lane A leg counters are per-leg; the last landing run was r129, so this run is r130.
The 14:45 CST slot pivoted entirely to the r129 option-(b) forage probe and produced
no leg mission; this run is the owed landing-leg assessment.

## Seed bands — DELIBERATE REUSE (carried panel band, sanctioned)

**Panel seeds 1142–1151 (the r121 band, 10th run).** The landing leg's carried
bindings are judged on this band by every landing run since r121; reuse is
sanctioned by the r121–r129 preregs, which name the band as the carried panel.
**Freshness check (local_seed_band_freshness skill, this run, before any
scored seed):** grepped `evidence/*/journey-landing-r1*-prereg.md` for
`1142–1151` — named in r121–r128 preregs (r129's prereg is branch-only, same
band). Grepped `evidence/*/sim-*-prereg.md` for `1142` — hits are timestamps
(`1142Z` run ids) and unrelated seeds (11429, 11439), none naming this band.
No forbidden-band list names 1142–1151 (checked `evidence/` for band lists:
sim-trajband-a, sim-vet2mfg-a, sim-fullseat-recheck-a preregs — none names it).
Reservation explicitly released for this run's carried-panel use. Recorded here
per the skill.

**Design — single-side panel on current master (§9, §15):** driver is the r128
AFTER driver verbatim except OUTDIR/header (`scripts/journey-landing-r130-20261113.js`),
seeds 1142–1151, DAYS=28 (days 1–14 judged, horizon d28, as r129). No BEFORE
side: the r129 fix is not on master, so this panel IS the current-game baseline;
the r129 AFTER panel (fixed code) is the comparison corpus, not a same-run control.
PILOT FIRST: 3 seeds (1142, 1146, 1150 — r129's pilot pick; 1150 is the
defect-rich seed: warn_you loop, D3, presshop). Expand to the full 10 only if
the pilot shows something interesting (a carried defect reproducing, a new
defect, or a binding moving).
Analyzers (as r129, DIR via argv where supported):
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
**DELIVER OVER MEASURE (2026-11-01):** Q1 is the fix for r129's filed
dialogue defects (D2 pool audit, D3 mis-answer routing, warn_you heed-cycle
loop). A game-code/content fix is in scope where the instrument shows a
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

### Q1 (PRIMARY) — r129's filed dialogue defects: reproduce, pin, fix what is safely fixable

r129 filed three dialogue defects in `sim-findings.md`, all on the AFTER
(fixed-code) corpus — the dialogue code is untouched by the pocket fix, so
all three should reproduce on current master. The pilot's job is to reproduce
them on unfixed code and pin each mechanism:

- **Q1-D2 — warn_you verbatim repeat (carried from r128).** The same warning
  line at turn 5 and turn 19 of one sitting (1150 d6). The pool was not
  changed in r129; the repeated line is not in `src/js/convo-wants.js` — its
  pool home needs pinning. **M-Q1-D2a (pool audit):** locate the line's pool
  home and count its variants. **M-Q1-D2b (fix, only if the pool is a single
  line):** add 1+ variant lines to that pool + proof test (repeat impossible
  across two turns of one sitting). If the pool already has variants and the
  repeat is a same-sitting re-draw, the fix is a different shape — document,
  do not force a content fix.
- **Q1-D3 — ask:village "How are the injured doing?" answered with leadership
  tension.** Same sitting 1150 d6, turn 3, on AFTER. The answer belongs to a
  live tension event, not the question asked. **M-Q1-D3a (routing pin):** name
  the mechanism that lets a live-event answer serve a different question.
  **M-Q1-D3b (fix, only if a clear mis-route is found):** route the answer
  to the question asked (or the tension to its own prompt) + proof test.
- **Q1-HEED — warn_you heed-cycle filler loop (NEW in r129).** The same 1150 d6
  sitting runs 20 turns without the want advancing past stage 1; the policy
  picks `[dlg:subject]` six times plus `[menu:more]` paging and `[observe]`;
  the NPC cycles brush-offs while `[dlg:heed]` / `[dlg:details]` are offered
  at turns 0, 6, 10, 14, 18, 20 and never picked; the sitting ends unresolved
  (stage 3) only when the R55 wind-down surfaces at turn 20. The want has no
  exit pressure against a dodging player. **M-Q1-HEEDa (recurrence count):**
  count heed-cycle sittings (≥10 turns, want stuck at stage 1, heed/details
  offered ≥3 times and never taken) across the pilot/full panel.
  **M-Q1-HEEDb (fix, only if a minimal safe change exists):** a heed that
  lands, a details beat that advances the want, or a wind-down that arrives
  sooner — content/design work; land only a small, proof-tested change, else
  document and carry.

**Interesting finding (pre-registered):** any of D2/D3/HEED reproducing on
master with its mechanism pinned; a fix landing with proof green both
directions; or any of the three NOT reproducing (divergence worth naming).

### Q2 (carried) — PRACTICE / HUNT

AFTER (r129): movedCells d1→d28=93, seedsWithMove 10/10, skill0→pos 45,
practiceReps 2483. Hunt reps **0** on both sides (twelfth panel running —
the hunt-assignment policy question carries). **M-Q2a:** movedCells ≥50,
10/10 seeds moving. **M-Q2b (watch, not a fail):** huntReps count; >0 would
be interesting; 0 is the carried shape, not a fail. **M-Q2c:** kills total
(r129: 212).

### Q3 (carried) — BINDINGS, judged fresh on this panel

- **M1 ALIVE-D14:** ≥9/10 villages alive at d28 (r129: 10/10).
- **M2 SYSTEM CONTACT:** 10/10 by d9 (r129: 10/10, d8–d9).
- **M3 FIGHT-LOG:** 0 unknown/mixed trigger (zerodmg-v2 byTrigger {}).
- **M5 PEOPLE:** sense-read PASS on sampled transcripts; D2/D3/HEED
  recurrence counts reported, not re-scored as fixed.
- **Zero-DMG invariant:** `test-landing-r115-zerodmg-invariant.js` PASS.
- **Pocket watch (regression, unfixed code):** pocketFights count + stuckTurns
  (r129 AFTER: 0/0; r129 BEFORE panel: 0/0; defect seed 1209 is NOT in this
  band — expect 0; any pocket fight on this band is a NEW finding).
- **D1 watch (out of scope, document only):** garbled label "We never
  finished — themselves." expected to still render on master (fix is in
  59ad7c479, not on master). Count occurrences; do NOT fix.
- **Personal bridge (r125 fix):** 0 repeats in a sitting. **Small bridge
  (r127 fix):** 0 repeats. **Q1 r126 (combat-interrupted evening chain):**
  presshop farUnreached — base carries 1 on both r129 sides; the regression
  check (identical to r129's number) binds, not the "stays 0" wording
  (metric-review note carried from r129).
- **Outingchain (r118):** CHAIN-COMPLETES-FAR shape reported, not gated.
- **Move-refusals (r128):** byReason {} expected.
- **1130-d6 amnesia shape:** 0 recurrences (transcript grep).
- **Miriam line:** 0 "That's settled".
- **R66 HUNGRY:** starvation deaths 0.
- **Mantle latency:** vacuous unless a mantle pass fires.

## Metric review (to fill at closeout)

- Q1 r126 presshop farUnreached bar "stays 0" — carried from r129: the base
  carries 1 on both r129 sides, so the bar as written is not met on either
  side; the regression check (identical before/after) is what binds.
- Any other metric that proves wrong goes here with a revision proposal for
  the NEXT run. A miss is NO-GO, never re-scored mid-run (§14).

## Telemetry

After writing evidence, run `node scripts/telemetry-check.js --baseline
~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/telemetry-baselines/landing.json
--current '<per-seed-evidence-glob>' --metrics <key-metrics>` (baseline exists
from r129; do NOT roll it forward on a LOUD line without investigating first).

## Run bookkeeping

- Rotation `journey-rotation-a.txt`: read 0, write 0→1 at run start.
- Lock `playtest-loop.lock` (run_id `2026-11-13T22:18:21Z`) deleted at closeout
  after run_id verification.
- Evidence (repo): `evidence/2026-11-13/journey-landing-r130-prereg.md`,
  `journey-landing-r130.md`, driver `scripts/journey-landing-r130-20261113.js`.
- Corpora (goal hidden_files, outside repo):
  `evidence/2026-11-13/landing-r130-after/` (pilot, then full panel if expanded).
- Bonus, only after the leg mission is committed: complete the r129 fixed-side
  probe detail (which errand Chantal picks instead on day 28 on fixed code)
  — the flap that blocked it has cleared. Delete the stale
  `~/workspace/scratch-fixed/` tree (0-byte game.js/convo-scene.js) if the
  probe is not completed this run; do not trust its contents either way.
