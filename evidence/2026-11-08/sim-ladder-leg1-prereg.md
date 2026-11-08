# Victory-gating ladder, LEG 1 — PRE-REGISTRATION (written BEFORE any proof run)

Build: Standing ladder core (brief
`~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/victory-gating-build-brief-draft.md`,
§§(b.0), (b.2), (b.3), (c), (d), (f) + main-session calls on (f)).
Steve approved the build 2026-11-07 19:28 CST. Coordinator: parent
(coord-victory-gating). Leg 1 builder only; legs 2–4 are separate builders.

## Base

- Master at build start: `a04a6c0fc52bfc9b10f6148c1fe020d9ae9ba5b7`
  (verified `cat .git/refs/heads/master` in `~/workspace/the-scattering`
  at 2026-11-08 03:44Z; re-read at worktree creation, unchanged).
- Worktree: `~/workspace/worktrees/build-ladder-leg1`, branch
  `build-ladder-leg1`, registered owner `coord-victory-gating`,
  purpose "ladder core". Registration was slow (~17 min, registry-lock
  contention + a 9.8 GB checkout under sibling sim load) but clean on
  first attempt; heartbeat verified by read-back.
- Appendix file map re-verified against this base: every file the
  brief names exists (`src/js/progression.js`, `table.js`, `game.js`,
  `feastBuff.js`, `overtime.js`, `app.js`, `membership.js`,
  `metaProgression.js`, `src/data/tracks.json`, `titans.json`,
  `feast-surge.json`, `src/js/standing.js`, `hierarchy.js`, `tracks.js`,
  `waveLedger.js`); `src/js/ladder.js` is absent, as expected (new file).

## Scope (leg 1 ONLY)

- NEW `src/js/ladder.js`: `ladderCfg()`, `villageLadder()`,
  `ladderStage()`, `ladderLine()`, `ladderStageBeat()`,
  `ladderCapBeat()`, capstone checks (`ladderCapstones()`,
  `ladderCapstoneReady()`, `ladderCapstoneDelivered()`), plus a daily
  `ladderTick()` wired via the established `Game.endDay` wrap chain
  (overtime.js precedent) so the beats fire in live play. The ladder
  reads existing state only and never writes its own counters
  (standing.js discipline); the only writes are the beat markers
  (`state._ladderStageBeat`, `state._ladderCapBeat`), mirroring
  standing.js's peak/hold beat markers. Banked-points store is leg 3,
  NOT this leg.
- `src/data/tracks.json`: optional `ladder` tag per deed ONLY
  (data-first split of field deeds into forage vs explore by deed id;
  default = the track's own ladder name). No threshold/kit changes.
- NEW `src/data/ladder-capstones.json`: the capstone deed definitions
  (Q6 — see below). `ladder.js` reads `this.data.ladderCapstones`
  when present and falls back to an in-code mirror (presentation.js /
  waveLedgerCfg precedent). The `game.js` init-list entry that loads
  the file in the browser is leg 2's surgery (game.js is leg 2's file);
  flagged as owed in the run note.
- `index.html`: one `<script>` tag for `ladder.js` after `standing.js`
  (load path; the sim harness reads script order from index.html).
- NEW `scripts/test-ladder-*.js` unit proofs (shared kit:
  `scripts/sim-harness.js` / `scripts/godpath/lib.js`; never copied
  eval boilerplate, never hardcoded absolute paths).
- This prereg + `evidence/2026-11-08/sim-ladder-leg1-run-note.md`.
- No other `src/js` file is touched. No `progression.js`, `table.js`,
  `game.js`, `overtime.js`, `app.js`, `membership.js`,
  `metaProgression.js` change (legs 2–3 own them). No pellet-pass,
  mirror-cap, or alien files. No balanced panel in this leg (leg 4
  owns calibration panels). No fresh seed band needed: the unit proofs
  use rigged states, not seeds.

## Numbers (brief §(c), starting values)

- Thresholds cumulative: Village 12 / Regional 26 / National 40.
- Per-track cap: 60% of the current cumulative threshold
  (7 @ 12; 15 @ 26; 24 @ 40), floored.
- Minting (§(b.2)): Fight 1pt/2 wave-ledger pts, waves 3–5 only;
  Forage 1pt/12 summed field XP excl. discovery; Craft 1pt/12 summed
  craft XP; Talk 2pts/seasoned regional+ link + 1pt/contest survived;
  Explore 1pt/4 discovery deeds + 1pt/4 breadth above ~8 + 1pt/active
  link.

## Drift notes (recorded, not re-decided)

- DRIFT-1 (role-formation `taskXp`) — CORRECTED 2026-11-08, pre-proof:
  the task handoff said `taskXp` exists now (grep found it in
  `betrayal.js`, `ledger.js`, `progression.js`, `villager-agency.js`).
  That grep does NOT reproduce at this base: a case-insensitive grep
  for `taskXp` / `task_xp` over the whole `src/js/` tree returns
  NOTHING, in both the main tree and this worktree at `a04a6c0fc`
  (the coordinator's grep likely ran in a sibling tree carrying
  uncommitted role-formation work, or on another base). The brief's
  statement stands at this base: the role-formation taskXp store
  does not exist. Q3 still governs: summed track XP (`npcXp` +
  scholar) is the source. No source switch.
- DRIFT-2 (Q11, armory/pharmacy): the coordinator already checked
  and did NOT find `armoryDonations` in `src/js/`. The leg-1 check
  covers `scripts/` and the endgame pilots (see run note for the
  verdict and evidence). If it does not read cleanly, Craft is summed
  craft XP only.

## AMENDMENT 1 (2026-11-08, pre-proof — code reading, no scored run):
### Explore (i) — discovery deeds have no lifetime store at this base

- Finding: the brief's Explore (i) — "1 point per 4 discovery deeds
  summed across the roster" — cannot be read from existing state at
  this base. `npcXp(vid)` holds per-TRACK totals only (one `field`
  number mixing foraging, hunting, fishing, trapping, preserving,
  gardening AND discovery); the per-deed books (`scholar.deedDay`,
  `village.npcDeedDay`) hold TODAY's counts only (per-day caps).
  The three discovery call sites (`game.js` scout-reveal,
  `game.js` markSeen-visited, `villager-agency.js` expedition leg)
  all credit into that mixed field total. No lifetime per-deed count
  exists anywhere in state.
- The brief's own rule (b.0) forbids the fix inside leg 1: "The
  ladder never writes its own counters" — accumulating today's
  discovery deeds into a ladder-owned total would be a third
  exception (only the feast-bundle record and the banked-points
  record are excepted), and a `tracks.js` lifetime deed-count store
  is a hot-path change outside leg-1 scope (it would also need a
  fresh observer-neutral measurement proof).
- Leg-1 implementation (honest, no deed counted twice): the WHOLE
  summed field total counts as Forage (discovery XP included there,
  once); Explore mints from breadth + links only (ii)+(iii); the
  `ladder: "explore"` tag on the `discovery` deed is in `tracks.json`
  so the split is a one-line change the moment a per-deed lifetime
  store exists. Explore (i) = 0 in leg 1.
- Follow-up owed (not leg 1): a per-deed lifetime store in
  `tracks.js` (or a main-session call to add a third ladder-counter
  exception), then the split moves discovery XP out of Forage into
  Explore (i). The leg-4 calibration panel reads Explore from
  breadth + links only until then.
- Bar L1 is amended accordingly (below): "minting per track" means
  Fight / Forage (whole field total) / Craft / Talk / Explore
  (breadth + links), plus a proof that discovery XP is counted
  exactly once (in Forage) and never double-counted.

## Q6 capstone deed forms (to verify/define in this leg)

- Feast embassy: grounded (feast-log `bundle` flag + National stage;
  the `bundle` flag itself is leg 2's write — leg 1's check reads it
  and returns false until leg 2 lands it).
- Trade charter: verify against the existing Charter national beat
  (`hierarchy.js` — trade league, ≥3 trade bonds, sign/bargain,
  `link.chartered = true`).
- Military tribute: verify against existing deeds; if none exists,
  define the deed in `src/data/ladder-capstones.json`, not code.

## Bars (metric binding — MEASUREMENT.md §14: a miss is NO-GO, never re-scored)

- L1-unit: every `scripts/test-ladder-*.js` proof passes
  (cap binds, minting per track, stage transitions at 12/26/40,
  `ladderLine` names capped tracks). "Minting per track" is per
  Amendment 1: Fight / Forage (whole field total, discovery XP
  included once) / Craft / Talk / Explore (breadth + links only);
  plus a proof that discovery XP is counted exactly once (in Forage)
  and never double-counted in Explore.
- L2-rigged-cap: a village fed only Fight points (rigged
  single-track state) does NOT open Village stage — the stage
  refuses, by the cap, even with Fight total far above 12.
- L3-line-names-caps: `ladderLine()` names every capped track and
  shows counted-vs-total ("Fight 9 → 7 · capped"); the cap is never
  silent.
- L4-scope: `git show --stat` for every leg-1 commit touches no
  `src/js` file outside `ladder.js`, no `src/data` file outside
  `tracks.json` (+ new `ladder-capstones.json`), and `tracks.json`
  changes no threshold or kit. `index.html` change is the one script
  tag only.
- L5-wired: `node scripts/check-wired.js src/js/ladder.js` shows
  nothing unwired; `node scripts/validate-ontology.js` passes after
  the new module is added.
- L6-green: `node scripts/check.js --quick` is green in the worktree
  after the change (run only in a free gate slot — never concurrent
  with another gate; the journey-scale `check.js --quick` was running
  at 04:00Z when this prereg was written).

## NOT in this prereg (leg 4 owns them)

- Calibration panel bars P1 (every track can carry), P2 (cap binds
  on panels), P4 (no regression) live in the leg-4 prereg, not here.
  Thresholds 12/26/40 stand as starting values; the panel may move
  them ±30% via prereg amendment (Q7), never a mid-run retune.

## AMENDMENT 2 (2026-11-08, attempt #2 adoption — pre-merge, no scored run)

Attempt #1 was SIGTERMed by a runtime restart drain at 2026-11-08
07:24Z, and the coordinator's recovery check concluded it had produced
nothing durable. That conclusion was wrong about the BRANCH: the
worktree was mid-rebase (onto `8dc3d16d2`, 0 of 4 picks applied) with a
clean tree at the old base, but branch `build-ladder-leg1` held all four
attempt-#1 commits (`7150ea43e` prereg + run note + neutral panel,
`2b6ef5d2b` ladder core, `ea219f610` unit proofs + green-list,
`a08550122` ontology + offline assets + neutral proof). Attempt #2
ADOPTED that branch rather than rebuilding: aborted the stale rebase,
rebased onto current master `1cac498d5` (verified `cat
.git/refs/heads/master` in `~/workspace/the-scattering` + `git fetch
origin master` at 2026-11-08 ~07:30Z). Rebase conflicts were version-tag
churn only (attempt #1's tag `09e57528e-20261107-233501` vs current ship
tag `2ce918e0e-20261108-053200`): `index.html` (re-added the one
`ladder.js` script line after `standing.js` with the current tag) and
`sw.js` (re-added the two ladder asset lines with the current tag).
Rebased SHAs: `38685ecd9`, `019aa799a`, `df31b3028`, `d4036f1b2`.

- Base move `8dc3d16d2` → `1cac498d5` is evidence/scripts ONLY (4 files:
  sim-healerbisect-b prereg + note + screen + proof test). No `src/js`,
  no `index.html` — the observer-neutral proof inputs are unchanged, so
  the refreshed `scripts/balance-proof.json` still covers current inputs.
- DRIFT-1 re-checked at `1cac498d5` by attempt #2: `taskXp` /
  `task_xp` STILL returns NOTHING over `src/js/`, in this worktree AND
  in the main tree. The attempt-#2 handoff's claim (grep found it in
  `betrayal.js`, `ledger.js`, `progression.js`, `villager-agency.js`)
  does not reproduce at this base. Q3 still governs (summed track XP).
- Q6/Q11 re-verified by attempt #2 (own greps, not assumed):
  charter — `link.chartered = true` set in `hierarchy.js:2884,2898`
  (sign/bargain); tribute — only `table.js:1478`
  `demandprice:tribute` (12,000 kcal failure price), no military deed;
  `armoryDonations` — zero hits in `src/js/`, only in
  `scripts/probe-endgame-r*.js` (policy-side probes). Q11 verdict
  stands: Craft is summed craft XP only.
- Re-verification on the REBASED tree (attempt #2, own runs):
  `test-ladder-cap.js` 25/25, `test-ladder-minting.js` 34/34,
  `check-wired.js src/js/ladder.js` 0 unwired (20 functions),
  `validate-ontology.js` 135/135. `node
  scripts/build-offline-assets.js` re-run: it moved
  `ladder-capstones.json` to its canonical alphabetical slot among
  data files (attempt #1's hand-resolved sw.js position was wrong);
  kept, as a rebase-resolution correction in the adoption commit.
- Bars unchanged. L6 (`check.js --quick` green) is re-run by attempt #2
  in a free gate slot before merging; the phone-frame proof refresh
  remains OWED to a browser-capable agent (see run note) and the gate
  stays red on that one test until it lands.

## Env

- None. Unit proofs run under the shared harness with fixed seeds
  (rigged states, not policy sims). No `COMPETENT_FEAST` / panel env.
