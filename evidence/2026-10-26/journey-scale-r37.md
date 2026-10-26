# journey-scale r37 — THE ACCEPT THAT GOES NOWHERE (2026-10-26, lane A, leg 3)

**Run id:** oversight-playtest-loop-20261026T0324Z. Rotation read 3 → leg 3 SCALE
(days 80–140 + post-national tail); write 3→0 on completion.
**Base:** master@bdabb563d at run start (the sim-driveoff-clean-a landing,
which arrived between the pre-flight worktree list and registration — the
journey-scale branch was cut from it, so the base is current, not stale).
No sibling landed mid-run, so no rebase was needed. Main tree verified
clean at start; disk 26%.
**Arm:** r36 blank (a) — BETRAYAL-ACCEPT LANDING, MEASUREMENT ONLY, zero
src/js. **Driver:** `scripts/journey-scale-r37-20261026.js` (r36 driver,
labels/EVIDIR/mode only, PLUS a read-only betrayal instrument: accept
detection in runConversation + daily person snapshots for accepted
subjects — no engine inputs change, no policy change, no new convo days).
**Analyzer:** `scripts/analyze-scale-r37-20261026.js` (r36 analyzer + BETRAY
section). **Proof test:** `scripts/test-journey-scale-r37-betray.js`
(11/11 static; 26/26 with EVIDIR — the 10 static-wiring assertions FAIL
on the r36 driver, RED verified).
**Policy:** `scripts/policies/scalecourt-nogate.js` — UNCHANGED. Standing
scalecourt.js untouched.
**Pre-register:** `evidence/2026-10-26/journey-scale-r37-prereg.md` (written
before any sim).
**Seeds:** MATCHED to r30–r36: 85001–85004. Horizon DAYCAP=180,
death-aware stop. Pilot seed 85001 ran first and passed the gate (no
crash, pilgrimages=1) before the other three launched.

## Pre-registered leg question

r36 proved betrayal:accept ENGAGES (85004-d120 Dorothy, ask_favor stage 2)
but lands in the same generic close as r35 — no date, no condition, no
debt, no departure state visible. r37's question: when a villager's
betrayal want is accepted, does anything in the world change afterwards
— and does the ending say what changed?

## Verdicts (binding — none re-scored)

- **BETRAYAL-ENCOUNTER: 1 accept on 4 seeds.** Only 85004-d120 Dorothy
  (ask_favor stage 2 at talk start; stage 3 by talk end — the want
  advances during the talk, which is why the analyzer prints stage 3).
  85001/85002 ended before day 90 (no convo days reached); 85003-d90 was
  a seek_taken talk, not a betrayal want.
- **ACCEPT-CONSEQUENCE: NO measured consequence of the accept itself.**
  Dorothy at accept (d120): alive, trust 90, on roster. d121–d123:
  trust 90, alive — the walk scene is the whole act; the shared-time
  trust the resolver is supposed to pay (betrayal.js resolveInvite) does
  not move her trust at all (90 before the talk, 90 after, 90 for three
  more days). d124: trust 90→86 while alive — four days after the
  accept, on the same day another villager (chen_wei) dies in a contest;
  no capture line ties the −4 to Dorothy's accept. d127: Dorothy dies
  in the arena ("Dorothy Schaefer is dead — the arena. The village
  stops. Somebody screams. Somebody else starts digging.") — announced
  by name like every arena death on this seed (11 arena death lines in
  the capture; arena deaths strike roughly monthly here regardless of
  any accept). No capture line connects her roads-out plan to the
  arena, and no departure ever happens: she does not leave, she dies
  at Haven's arena a week after saying she would go. The promise
  evaporates — correlation (7 days) is not causation, and the base
  rate of arena deaths on this seed kills any causal reading.
- **ENDING-JUDGE: MISSING — third consecutive run.** The d120 closing
  is again the generic "Alright. One thing at a time. That's how we get
  through." — no date, no condition, no debt, no departure. Same
  villager, same want, same close as r35 and r36: the blank is
  deterministic, not a sampling fluke.
- **BOOK-TITAN (regression watch): GO — 11/11 booked.** 85002: 2/2,
  85004: 9/9, 85001/85003: 0 events. r36's fix holds exactly on the new
  base (same 11 events as r36).
- **BOOK-POOL-WILD: NOT-ENCOUNTERED, third run in a row.** Zero
  covenantTick −4 events on any seed (no covenant ever went poolLive:
  85001 died d71, 85002 scattered with 0 covenants, 85003's covenants
  unseasoned, 85004's single covenant never poolLive). The pool half
  remains proven only by r36's proof test, never in the wild.
- **NO-NUMBER-CHANGE: GO — exact parity on all four seeds.**
  85001 d71 0/0 pantry 10,338; 85002 d86 8/8 pantry 0 lesser; 85003 d110
  7/7 pantry 0 lesser; 85004 d181 5/5 pantry 2,240 lesser. Every outcome
  line identical to r36's. The read-only instrument moves nothing.
- **PICK-G: GO.** Max consecutive dlg:more/goon ≤ 1 on every transcript
  (85004-d120: 1, 85004-d90: 1, 85003-d90: 0); post-deflect goon = 0.
- **BONDS/NATIONAL (report-only):** third bond by d110: 0/4 (85001 had
  3 covenants but died d71; 85004 has 1; 85002/85003 scattered with
  0/2). National by d140: 0/4. Lesser seat: 4/4 waiting. Wave 5: 0/4.
  The scale wall above national/table stands, unchanged from r36.

## Village assessments (plain words)

- **85001 (died out d71):** the league that seasoned and then lost its
  speakers — identical to r36. Three covenants at 42, pantry 10,338;
  it ran out of people, not food.
- **85002 (scattered d86):** the hungry courtship — identical to r36.
  8/8 alive, pantry 0, one primary-sub link at 35, zero covenants, one
  village never known. The policy walked 29 pilgrimages/studies while
  the village starved.
- **85003 (scattered d110):** the famine village — identical to r36.
  7/7 alive, pantry 0, two unseasoned covenants (26/28) that bled out
  with it, one village never known.
- **85004 (alive 5/5 at d181, regional, lesser seat waiting):** the thin
  village that held on a thread — identical to r36, plus the Dorothy
  story: the mechanic who told you her leaving plan at d120, walked the
  trap line with you, and died in the arena at d127 without ever
  leaving. Pantry 2,240, no primary-sub bond left, one covenant at
  trust 0 kept alive by crisis concessions. It waits at the table with
  nothing solid behind it.

## People check (SENSE-TESTING LAW — 3 transcripts read in full)

- **85004-d120 Dorothy (ask_favor stage 2, betrayal:accept):** ENGAGED,
  LANDING STILL MISSING (third run). The want is real ("I've been
  mapping the roads out. Quietly"), the middle has voice ("I pack
  light. Always have. Makes leaving easier. Makes staying harder,
  too."), the walk scene plays — and then the talk dissolves into
  aphorisms and the generic close. The accept changes nothing the
  player can see afterwards: no departure, no debt, no follow-up line
  about the plan in 61 days of snapshots.
- **85004-d90 Dorothy (curious stage 1):** GO, short — same regret
  exchange as r36 ("Columbus, Ohio mornings I spent annoyed at small
  things. I'd pay anything for one annoyed morning now"). A villager
  with a past, not a menu.
- **85003-d90 Joshua (seek_taken stage 1):** GO — same as r36. The
  taken-kin question is coherent with the world (Theo gone), the
  commit lands ("I'll ask it. I promise."), the resolution lands
  ("Even asking is more than the silence").

## Blanks filled / documented this run

1. **Betrayal-accept consequence measured (r36 blank (a) — answered,
   not fixed):** the accept's own effect is nil on every measured
   field (trust flat d120–d123, roster/dead unchanged until an
   unrelated arena death). The blank is now precisely bounded: the
   walk scene IS the act, and nothing after it — no state, no wording
   — carries the plan forward.
2. **Documented, NOT fixed this run:**
   - (a) **Betrayal:accept still needs a landing.** Three runs, same
     close. r38's job is a design decision, not more measurement:
     what SHOULD an accept promise — a dated departure, a debt, a
     follow-up beat? That is a Steve-call-sized question; r37
     deliberately does not invent it.
   - (b) **BOOK-POOL wild proof, third NOT-ENCOUNTERED.** Needs a
     pool-era seed set (seasoned covenants + a short pantry week)
     or a forced-shortfall scenario in the wild — the matched seeds
     never get there.
   - (c) **Carried from r36, still open:** "Come see what I found"
     plant-drop; closing-line mismatch after a commit; 0-trust bonds
     still count as bonds (design question for Steve).
   - (d) **Dorothy's d124 −4 is unattributed.** Village-trust moves
     (unlike link-trust moves) have no setter log; a −4 on a day
     another villager dies in a contest cannot be sourced. A
     village-trust setter instrument is the r38 instrument candidate
     if Steve wants that attribution.

## Reachable / fun / winnable (leg 3)

- **Reachable: YES, with the hunger caveat unchanged.** The covenant
  road forms, but seeds still starve before it seasons: 2/4 scattered
  on empty pantries while the policy walked courtship beats.
- **Fun: FLAT, with one sharp edge.** The betrayal talk is the best
  writing in the leg — a real want, a real voice, a real walk — and
  then it evaporates. A player who accepts Dorothy's plan and watches
  her die in the arena a week later without a single further word
  about leaving will feel the game forgot, not that the world is
  cruel. Cruelty needs a witness line; forgetting is just a blank.
- **Winnable: NOT ARRIVED on this base.** Lesser seat 4/4 waiting, but
  national 0/4, global 0/4, full seat 0/4, wave 5 0/4 — identical to r36.

## Metric review

- No metric re-scored mid-run. ACCEPT-CONSEQUENCE judged exactly as
  pre-registered: 100% of accepts measured (1/1, 61 snapshots); the
  GAME verdict (no consequence) is reported as a finding, not folded
  into a pass/fail on the run. BOOK-POOL reported as NOT-ENCOUNTERED
  rather than stretched to a vacuous pass, as in r36.
- **Revision proposed for r38:** BETRAYAL needs a decision, not a
  metric — pre-register the landing options (dated departure / debt /
  follow-up beat) as a Steve ruling before measuring again. BOOK-POOL
  needs a pool-era seed set pre-registered with its entry condition
  (≥1 seasoned covenant + ≥1 short pantry week), per r36's proposal,
  carried again.
- **Telemetry check:** LOUD lines on the first invocation were
  investigated and EXPLAINED, not a game deviation: baseline
  scale.json's metrics (markerCounts.firstCourt/watchers, fightsTotal,
  fightsByWave.4, maxGameDay) are panel-observer fields that journey
  census JSONs do not carry, so the tool reads current=0 for all of
  them. A same-shape check (day, popAlive, pantryKcal on the same 4
  files) is quiet — no large deviations. Baseline NOT rolled: rolling
  a panel baseline with journey aggregates would corrupt it. Future
  scale runs need a journey-shaped baseline, or should skip
  telemetry-check against scale.json — recorded here as the standing
  note for r38.
- **Test suites:** proof test 11/11 static + 26/26 with EVIDIR;
  analyzer exit 0 on all 4 seeds; check.js --quick: 271 passed,
  16 failed in 1275s — split as standing 8 (identical to r36: hide-
  discovery, measurement-comparison, measurement-proof-update,
  measurement-workflow, mobile-combat-cadence, occupation-panels,
  phone-frame-proof, parity-20261014) + 8 NEW failures that are NOT
  regressions (see gate paragraph below).
- **Gate paragraph (LOUD — container EPERM write flap, same class as
  the 2026-10-23 .git-lock flap and the 2026-10-24 evidence-write
  flap):** the 8 new failures are human-combat-parity,
  measurement-cache-flags, measurement-flags, measurement-source-text,
  prepared-runner-custody, proof-text-identity, foodpower-20261014,
  sw-audio-cache-20261012. Six show explicit EPERM write/copyfile
  errors in the gate log; the two measurement siblings are the same
  write-path family. Proof it is the flap, not the code: (1) this run
  changes zero src/js and zero existing scripts — new files only —
  so there is no mechanism for these failures; (2) the identical
  25,791-byte write to /tmp failed with EPERM, then succeeded seconds
  later (flap, not content/size/directory — manual nested writes to
  the goal dir also succeed); (3) foodpower-20261014 re-ran green
  30/30 on the quiet box. The other seven still fail on a quiet box
  because each does many temp writes and the flap is per-write
  stochastic — a 16-write script almost always trips it. Verdict: NO
  regressions attributable to this run; the gate's new failures are
  infrastructure noise to be re-checked when the flap clears, not
  code to fix. The ship loop's own gate run is the next checkpoint.
  (First analyzer run was SIGPIPE-truncated by a `| head -100` in the
  display pipe — re-ran without truncation; the saved analyzer file
  is the complete run. Lesson: never pipe a gate's output through
  head when the file is the record.)

## Ops

- Worktree journey-scale registered, heartbeated throughout (registry
  heartbeat_at fresh at every phase), to be released and removed at
  the end; branch deleted after merge; main tree verified clean. No
  version bump/push (ship loop owns it). Merged locally, pending ship
  — no version tag, no push. Lock deleted at end. Rotation-a 3→0 on
  completion.
