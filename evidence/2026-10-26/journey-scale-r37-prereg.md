# journey-scale r37 — PRE-REGISTRATION (lane A, leg 3 SCALE, days 80–140 + post-national tail)

**Run id:** oversight-playtest-loop-20261026T0324Z. Rotation read 3 → leg 3 SCALE;
write 3→0 on completion. **Base:** master at run start (bdabb563d — the
sim-driveoff-clean-a landing, which arrived between the pre-flight worktree
list and registration; the journey-scale branch was cut from it, so the base
is current, not stale). Rebase if a sibling lands mid-run; proof re-run after
any rebase. **Arm:** r36 blank (a) — BETRAYAL-ACCEPT LANDING, MEASUREMENT
ONLY. No src/js change is pre-planned: r37 measures what an accept DOES
(state consequence + ending wording) so r38 can judge a fix, not invent one.
**Driver:** `scripts/journey-scale-r37-20261026.js` — the r36 driver with
ONLY run label / EVIDIR / mode changed, PLUS a read-only betrayal
instrument (accept detection in runConversation + daily person snapshots
for accepted subjects; no engine inputs change, no policy change, no new
convo days). **Analyzer:** `scripts/analyze-scale-r37-20261026.js` (r36
analyzer + BETRAY section, labels/EVIDIR only). **Policy:**
`scripts/policies/scalecourt-nogate.js` — UNCHANGED. Standing scalecourt.js
untouched.

## Leg question (r36's named next arm, verbatim in substance)

r36 proved betrayal:accept ENGAGES (85004-d120 Dorothy, ask_favor stage 2)
but lands in the same generic close as r35 ("Alright. One thing at a
time.") — no date, no condition, no debt, no departure state visible.
r37's question: **when a villager's betrayal want is accepted, does
anything in the world change afterwards — and does the ending say what
changed?** The accept line itself ("All right. Let's go.") plus the
trap-line walk scene promise a departure; r37 checks whether the promise
is kept in state, in later lines, or nowhere.

## Pre-registered metrics (BINDING — §14; a miss is NO-GO, never re-scored)

- **BETRAYAL-ENCOUNTER:** betrayal wants engaged (betrayal:accept picked)
  across matched seeds 85001–85004. If zero are encountered, BETRAY is
  reported NOT-ENCOUNTERED (not a pass, not a fail) and the run still
  delivers BOOK-POOL-WILD + census + people check.
- **ACCEPT-CONSEQUENCE (measurement-binding):** for EVERY accept, the
  villager's state is recorded at accept day, +7d, +14d, and seed end
  (alive? still on roster? village trust? death entry?) plus every later
  capture line naming that villager with leave/depart/go/gone. Bar: 100%
  of accepts measured; an unmeasured accept is a NO-GO on the run's
  method. The verdict on the GAME is judged, not passed/failed by
  existence: a consequence is either a named state change or a
  documented none — both are findings, neither is re-scored.
- **ENDING-JUDGE:** each accept ending is read in full. LANDED = the
  closing names a date, condition, debt, or departure. MISSING = the
  generic close (r36's finding carried). No middle grade is invented
  mid-run.
- **BOOK-POOL-WILD (secondary, inherited from r36):** every
  covenantTick −4 pool-short event in the wild must carry a matching
  `[pool]` book entry (same link, note containing `came up short`,
  snapDay within [eventDay, eventDay+1]). Bar: 100% booked IF any fire;
  zero firings = NOT-ENCOUNTERED (r36's outcome, carried, not stretched
  into a pass).
- **BOOK-TITAN (secondary, regression watch):** every titanEscalate −5
  still 100% booked (r36's fix must hold on the new base).
- **PICK-G (picker-cap guard, inherited):** max consecutive
  dlg:more/goon ≤ 1 on every transcript; post-deflect goon = 0. Any
  violation is a regression, not a metric to re-tune.
- **NO-NUMBER-CHANGE (driver parity):** per-seed outcome lines vs r36
  within instrument tolerance — the driver adds reads only, so outcomes
  must not move. Any moved line is first checked against sibling
  landings since r36 (notably bdabb563d), not assumed to be the arm's
  fault.
- **BONDS/NATIONAL (report-only, as r32–r36):** third bond by d110,
  national by d140, lesser/full seat, wave reached, post-national days.

## What would count as an interesting finding

- An accept after which the villager leaves, dies, loses trust, or gains
  a debt — and whether any of it is ever SAID (state without wording is
  a different blank than wording without state).
- An accept after which literally nothing changes in any measured field
  through seed end — the promise evaporates (r36's suspicion, proven).
- A pool-short firing in the wild at last (r36's open half) — booked or
  unbooked, either verdict closes a run-long open item.
- A betrayal want whose accept ending DOES land (a counterexample to
  r36/r35) — that splits the blank by want/stage instead of by run.

## Seeds, horizon, pilot gate

- **Seeds:** MATCHED to r30–r36: 85001–85004. Same world-gen, new base.
- **Horizon:** DAYCAP=180 loop-days, death-aware stop.
- **PILOT GATE:** seed 85001 runs first; if it crashes or pilgrimages
  == 0, STOP and report — do not launch the other three.

## Metric review (to be filled after the run — never mid-run)

- No metric re-scored mid-run. Revisions proposed here apply to r38.
