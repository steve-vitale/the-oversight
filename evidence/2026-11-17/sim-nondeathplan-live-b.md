# sim-nondeathplan-live-b — GO on all five frozen bars (live observation)

Run: fleshout-loop-b-20261117T1521Z (Loop B), axis winnability chain,
arm sim-nondeathplan-live-b — ADOPTION of the stranded 1409Z arm.
Branch `sim-nondeathplan-live-b` (worktree
`~/workspace/worktrees/sim-nondeathplan-live-b`). Base: local master
`0668af726` (the landed fix `446a96ef4` verified present before any
work). Frozen prereg:
evidence/2026-11-17/sim-nondeathplan-live-b-prereg.md.
Verdict: **GO — every non-death removal how fired LIVE through its
real game trigger, the leaver's plan died with them, nothing
lingered 10 days later, no ignition, proof green.**
Bars 1–5 all hold (see §Bars). No game-code change in this arm.

## The question, in plain words

The leave-cleanup fix says a villager's win-plan dies when they
leave the village alive. It was proven only in unit fixtures:
in 8×150d competent sims nobody ever left alive, so the hook never
fired in a real running game. This arm staged each way of leaving
inside a live sim and watched the hook fire: driven off, walked
out after losing a leadership fight, exiled by the moot, paid away
as tribute, named for the relay, and a betrayer who broke and ran
mid-fight. In every case the plan died with the leaver, their name
left every living holder's party, and ten days later no ghost
remained — in the data or in the village's talk.

## Per-how live results (all REAL TRIGGER, none direct-call, none UNSTAGED)

Each case: a fresh seeded game, holder + companion holding
`hunt`-stage winPlans naming each other, the removal driven through
its real trigger, then 10 competent days in the live loop. The
"10d" column is deaths recorded by the harness in those 10 days
(mostly monster kills on expeditions — see §Cost).

| How | Real trigger | Seed | Holder (display name) | removalCleanups | 10d end / deaths | Lingering @10d |
| --- | --- | --- | --- | --- | --- | --- |
| fled | `intimidate` → break point (fear 100) | 103241 | owen_smith, "A man, maybe 30s, with a missing fingertip" | +1 | survived / 14 | 0 entries, 0 refs |
| splinter | `_maybeResolveContendArc` → leave (21 attempts) | 103243 | gen_axvhy5l, "A person, maybe 40s, with a long braid" | +1 | survived / 11 | 0 entries, 0 refs |
| exiled | `freeloadVote` (8–3 moot vote) | 103244 | gen_o0066nj, "A man, maybe 20s" | +1 | survived / 16 | 0 entries, 0 refs |
| tribute | `ladderDeliverCapstone('military_tribute')` (2 staged wave-4 veterans) | 103245 | gen_thhc4jn + gen_6sf1cl5 | +2 | survived / 0 | 0 entries, 0 refs (both) |
| relay | defiant path: `tableStartPath` → `tableChoose('beat:grain')` → `tableChoose('beat:name')` | 103246 | gen_i1txvus, "Ray" / "A man, maybe 60s" | +1 | survived / 11 | 0 entries, 0 refs |
| tbEnd fled | `npcBetrays` → hostile at 20% HP → `tbHostileTurn` flee → `tbEndCheck` | 103247 | "A woman, maybe 60s, with grey-streaked hair" | +1 | survived / 8 | 0 entries, 0 refs |

Every case, at the removal instant: leaver off the roster, leaver
plan deleted, companion party purged, companion `hunt` plan fell
back to `party` stage, `deathCleanups` untouched, exiles ledger
carries the leaver (removal, not death), leaver person record (where
retrievable) reads not-dead. The trial-sentence path
(betrayal.js:2220) was NOT staged separately: it is the same
`'exiled'` how through a second caller, and the moot vote-out is
the staged real trigger for that how (frozen in the prereg).

## Bars (frozen — coordinator follow-up)

1. **Live firing per how: PASS.** `removalCleanups > 0` for every
   how through a real trigger: fled +1, splinter +1, exiled +1,
   tribute +2, relay +1, tbEnd-fled +1. No how was fixture-proven
   only; no how fell back to a direct `removeVillager` call; no
   how is UNSTAGED.
2. **No lingering: PASS.** Entries 0 and party refs 0, 10 days
   after each staged removal (the frozen bar asked 7+ days; the
   runs observed 9–10 days: fled and tbEnd ran day 1→10, the rest
   day 1→11).
3. **No ignition: PASS.** Strong form: seed 103241's `setupGame`
   leaves NO winPlan store (`winPlan: false, winPlanStats:
   false`); a plan-less villager exiled by `freeloadVote` gained
   no store from the removal calls alone (key set unchanged,
   `removalCleanups` did not bump), and the village still survived
   the 10 following days.
4. **Proof green: PASS.** `scripts/test-nondeathplan-live-b.js`
   **103/103** on the final tip (run 3; runs 1–2 were 102/103 —
   the single failure was the branch-diff allowlist, fixed as a
   documented prereg deviation, see §Prereg deviation).
5. **Cost: PASS.** All 10-day runs completed without throwing,
   all ended `survived`, no death row for any leaver in the 10
   days (the staging removes, never kills). Deaths in the 10-day
   windows are ordinary competent-play deaths, overwhelmingly
   monster kills on expeditions (e.g. belltoad, drumbelly_tanuki,
   anaconda_empress); the only villager deaths were two ambushes
   (`yara_haddad` in the exiled run, `gen_8r3zfui` in the
   no-creation run). The tribute run recorded ZERO deaths in 10
   days — the delivery opens the mercy window (`tableActive`
   holds), so no raid or roaming monster can kill villagers
   between delivery and the seat, exactly as designed.

## The splinter staging lesson (probe finding, frozen into the design)

The splinter trigger nearly looked unstageable: 120 attempts with
trust pinned once never left, although `canLeave` read true on
every call. The mechanism: a `respect` resolution bumps trust +4,
so re-rolling the same arc without re-pinning trust closes the
`canLeave` (`trust <= 25`) window after ~4 resolutions — the
leave roll never gets a live chance again. Forcing
`Math.random` to 0.1 proved the branch itself fires (leave at
once); re-pinning trust to 10 before EVERY attempt staged the
leave in 21 attempts. The re-pin maintains the staged
precondition (a low-trust leadership loser) across retries; it
never touches the roll. Recorded here so the next worker does not
re-discover it by burning attempts.

## Sense-testing (mandatory)

Captured say lines naming each leaver on/after the removal day;
the ghost tripwire (still planning / still walking / joins the
party) tripped on none of them. What the village actually said:

- **fled** (2 lines, both day 1): the shakedown ("You step into
  [his] space. 'Your food. Now.'") and the flight ("[He] doesn't
  answer. They just... back away. Then run — into the trees, away
  from Haven, away from you."). Correct: the village watched him
  run, and nobody plans with him after.
- **splinter** (12 lines, all day 1): the rivalry's own closing
  lines from the 21 resolution attempts ("The rivalry is over —
  or at least, they've set it down", "I'm out of the running.
  I'd rather do real work."). These fired while the contender was
  still present (earlier the same day, before the leave) — they
  narrate the rivalry ending, not a ghost planning. Nothing names
  them on days 2–11.
- **exiled** (3 lines, day 1): the vote ("We've carried [him] long
  enough"), the schism crisis ("[He] is cast out. ... Fewer
  chairs around the fire tonight."), the journal ("was exiled for
  freeloading"). Correct, and the village feels the cut.
- **tribute** (2 lines, day 1): the tribute itself ("walk out of
  Haven in the table's service, two fighters the galaxy asked for
  by name. The village is smaller tonight.") and a journal line
  that an old argument "ended — one of them is gone." Correct.
- **relay** (0 lines matching the descriptor scan): the naming line
  itself uses the first name ("You name Ray. They nod — they've
  known since the price list slid across. The relay gets its
  hands. The village loses its steadiest."), which the
  descriptor-based scan did not match — so the 0 is a scan
  artifact, not silence. No line on days 2–11 treats Ray as still
  planning or still present; the village simply does not mention
  them again in 10 days. That silence is an observation, not a
  ghost: nobody plans with them, nobody waits for them.
- **tbEnd fled** (10 lines, all day 1): the fight itself ("[Her]
  control snaps. Not calculation — fury.", "breaks and runs —
  sobbing, stumbling, gone into the trees.") and the aftermath
  ("They got away. Into the trees."). Correct: the fight is the
  story, the running is the ending.

Across all six cases: **zero lines on days 2–11 name any leaver
at all.** No ghost talk — but also no mourning, no "we miss
them", no plan to fetch them back. The village moves on in
silence. That is the honest read: the cleanup is correct in data
and in talk, and the talk has nothing more to say about the gone.

## Finding #2482 — deadplan slot-count classifier (in scope, FIXED)

The fix (frozen design): in `scripts/analyze-deadplan-b.js` (c-i),
a party ref counts only when `deathDay[pid] < r.day` (strict) —
the daily census snapshot precedes the death within the day, so a
ref to someone who dies LATER that same day named a living
villager at snapshot time and is not stale. A ref on the day AFTER
the death is still a linger. No holder-days >= 2 threshold was
applied (the exclusion subsumes it for the observed instances).

- Baseline (frozen, pre-fix): `classify` on
  `evidence/2026-11-17/perseed-nondeathplan-b-armed/` = COSTLY,
  poolTotal 0, slotTotal 3 (103244 `catalina_reyes` naming
  `gen_8noj3cq` d114; 103247 two holders naming `katarina_novak`
  d65; all single-day death-day rows).
- Post-fix: same corpora = **slotTotal 0, verdict NOISE-ONLY**
  (poolTotal 0, validityOk true); control leg likewise 0 /
  NOISE-ONLY.
- Synthetic proof (in the proof test): death-day-only refs → 0
  holders; refs on the death day AND the day after → 1 holder
  with `days: 1` (the post-death row is a linger); refs 2 days
  after → `days: 2`.
- The fix moved two D4/D8 fixtures in `scripts/test-deadplan-b.js`
  that encoded the old inclusive counting (see §Fixture update).
  No other consumer asserts slot values: `test-deathcleanup-b.js`
  asserts `holderDays === 0` on a live armed run (monotone-safe
  under a narrowing fix — a corpus that read 0 still reads 0),
  and `analyze-nondeathplan-b.js` reads only wave kills from
  `analyzeOne`.

## Fixture update (test-deadplan-b.js D4/D8 — same commit as the fix)

`test-deadplan-b.js` D4 and D8 encoded the old rule (the death
day's row counted). Per the repo rule (a design change made on
purpose updates its test in the same commit), the FIXTURES were
extended to the corrected semantics while keeping their strength:

- D4: v2 dies day 21. v1's rows extended to day 23 and its launch
  moved to day 23 (first post-death ref day 22, launch after);
  v3's rows extended to day 22 (first post-death ref day 22,
  launch day 21 — before it, not after). Expectations UNCHANGED:
  2 holders, 3 holder-days, v1 `launchedAfter` true, v3 false.
  The check name now says "launched before its first post-death
  ref" for v3.
- D8: h2's rows extended to day 13 (h3 dies day 11), so the 2
  holder-days are 12 and 13; expectation UNCHANGED. The death-day
  row (11) is excluded with a comment.
- The gate confirms: `test-deadplan-b.js` now 86 passed, 3 failed
  — the 3 failures are the known pre-existing artifacts (see
  §Regression gate), D4/D8 pass.

## Proof

`scripts/test-nondeathplan-live-b.js` **103/103** on the final tip
(run 3, EXIT=0; runs 1–2 were 102/103, the single failure the
branch-diff allowlist — see §Prereg deviation):

- Static: the fix is present (leave method, else-branch hook,
  party.js choke-point routing, `removalCleanups` bump line); the
  deathcleanup pins still hold (exactly two `delete
  v.winPlan[vid]` spellings, death bump line exact); the #2482
  strict-`<` spelling is present and no `<=` remains; the branch
  diff touches ONLY prereg + evidence + this proof + the
  classifier fix (+ its test-deadplan-b.js fixture update) — NO
  game-code change.
- Per-how live legs (6): staged through real triggers, immediate
  assertions (off roster, plan deleted, party purged, stage
  fallback, exact `removalCleanups` bump, exiles ledger, person
  record not-dead) + 10-day live observation (lingering 0,
  endReason recorded, no death row for the leaver) + sense
  tripwire.
- No-creation live case (strong form, seed 103241).
- #2482 classifier proof (synthetic corpora + real-band
  re-classify, both legs).
- Regression gate: `test-deadplan-b.js` run as a child — see below.

Baseline (for the record, not a gate): `scripts/test-nondeathplan-b.js`
re-run on this tip = **63/64**, the single failure the known
branch-diff static-check artifact (empty branch diff post-merge),
exactly as the 1409Z closeout predicted. Not a regression.

## Regression gate (test-deadplan-b.js as a child)

The gate runs `test-deadplan-b.js` and fails ONLY on a failure
outside the 3 known pre-existing artifacts — checks frozen to
the deadplan arm's era that fail on ANY current-master branch:

1. `scripts worktree diff is deadplan-* files only` — this arm
   adds its own proof test, so the diff is not deadplan-only
   (branch artifact).
2. `exactly ONE delete of a winPlan entry exists in src/js` —
   the deathcleanup landing added the second delete spelling;
   this arm touches no src files, so the count is byte-identical
   to master (pre-existing).
3. `static reader check: winPlan lives only in ...` — betrayal.js
   is a sanctioned winPlan reader since deathcleanup; this arm
   touches no src files, so the reader list is byte-identical to
   master (pre-existing).

Gate result: **86 passed, 3 failed, all 3 known artifacts, 0
unknown failures.** The D4/D8 semantic checks pass under the
corrected fixtures.

## Prereg deviation (recorded, not silent)

The frozen prereg's static section did not anticipate that the
#2482 fix would need to update the D4/D8 fixtures in
`scripts/test-deadplan-b.js` — that file was not in the frozen
branch-diff allowlist, so runs 1–2 failed the allowlist check
(102/103). The fixture update is part of the classifier fix
(same commit, same deliberate design change, per the repo rule),
so the allowlist in the proof test was amended to include it,
with the reason in a code comment. No GO bar changed, no
re-scoring: the bars were judged exactly as frozen. The prereg
file itself was left untouched (frozen).

## Telemetry deviation check

Documented refusal (same as the nondeathplan arm):
`telemetry-check.js` refuses recorder-corpus input — "all 8
--current rows carry top-level anchorCommit, so they are sweep
recorder rows, not runs. Recorder corpora are compared with
sweep-compare tables, never against a run baseline here."
Baseline NOT rolled, per the prereg's instruction not to work
around a refusal.

## Wall numbers (report every run)

The staged fixtures are 10-day proofs, not 150d wall sims — the
wall numbers are the parent band's (sim-nondeathplan-b, both legs
identical): national by standing 2/8, national by scaleRank 0/8,
table 0/8, wins 0/8, wave-4 reached 8/8, wave-5 reached 2/8,
wave-4 kills 15, wave-5 kills 3, median survival 143d, deaths
570. The staged sims change nothing about the wall.

## Infrastructure

- WRITE FLAP: no flap observed this run (writes all clean).
- Safe-commit index clobber struck the prereg commit (staged-
  deleted + untracked ghosts, commit itself correct) — repaired
  via `git ls-tree -r HEAD` + `git update-index --add
  --index-info`; status clean + diff HEAD empty afterwards. The
  remaining commits did not clobber.
- Runtime: proof runs 1–3 took ~5–14 min each (the regression-gate
  child runs the full deadplan proof, ~11 min standalone).
- No balanced panel: fixture/proof arm on an already-landed fix,
  not a lever comparison (per the brief + frozen prereg).

## Metric review (fill in at evidence time; do NOT re-score mid-run)

- Every how fired through its real trigger; none fell back to a
  direct call; none went UNSTAGED. The trial-sentence path was
  deliberately not staged separately (same `'exiled'` how).
- The stage fallback (`hunt` → `party` on empty) fired on every
  removal at the removal instant. Companion re-seek within the 10
  days was NOT measured in the judged runs (the 10-day check
  asserts lingering only); the /tmp probe showed the exiled case's
  companion back at `hunt` by day 11, so re-seek works on at least
  one seed — a re-seek timing read is future work, not this arm's
  bar.
- No say line after any removal treats the leaver as still
  planning or still present. The silence on days 2–11 (zero
  mentions of any leaver) is the remaining observation: the
  village does not mourn, remember aloud, or plan to fetch anyone
  back. Filed as a finding (see below) — a talk question, not a
  cleanup defect.
- The no-creation case held in its strong form live (no store at
  setup, none created by the removal).
- The classifier fix changed no other verdict: the deathcleanup
  test's slot assertions are monotone-safe (0 stays 0), the
  nondeathplan analyzer reads only wave kills from `analyzeOne`,
  and both real-band legs read NOISE-ONLY.
- 10 days was the right observation window for the 7-day rule
  (9–10 days observed per case, all `survived`).

## Findings appended / updated

- #2481 → [fixed]: live observation delivered (this arm).
- #2475's "needs a live observation" (filed as #2476, "NON-DEATH
  REMOVALS LEAVE PLANS LINGERING" — see §Findings-number note)
  → [fixed]: live-proven per how.
- #2482 → [fixed]: classifier excludes the death day; band
  103241–103248 reads NOISE-ONLY on both legs.
- [open] 2026-11-17 — win-plan lifecycle / village talk — after a
  non-death removal the village never mentions the leaver again
  in 10 days (sim-nondeathplan-live-b): zero say lines on days
  2–11 name any of the six staged leavers (fled / splinter /
  exiled / tribute / relay / tbEnd-fled); the relay's person is
  not even named again after the naming line. No ghost talk — the
  cleanup is correct — but no mourning, remembering, or fetching
  back either. A talk question (do leavers deserve an echo?), not
  a cleanup defect. Needs a Steve-call before any work.

## Findings-number note (frozen in the prereg)

The closeout and the nondeathplan evidence cite the lingering
finding as #2475, but `sim-findings.md` carries that text under
**#2476** ("NON-DEATH REMOVALS LEAVE PLANS LINGERING"), with
#2475 being the 52-day party-stage wait (a different finding,
untouched by this arm). The status update below was applied to
the #2476 LINE (the lingering finding), and this note is left so
the next reader does not chase a phantom #2475.

## Evidence artifacts

- Prereg: evidence/2026-11-17/sim-nondeathplan-live-b-prereg.md
- Proof: scripts/test-nondeathplan-live-b.js (103/103 on final tip)
- Classifier fix: scripts/analyze-deadplan-b.js (strict `<`)
- Fixture update: scripts/test-deadplan-b.js (D4/D8, same commit)
- Full proof logs (scratch, not committed):
  /tmp/test-live-b-run3.log (final, 103/0),
  /tmp/test-deadplan-b-after.log (gate child, 86/3 known artifacts),
  /tmp/baseline-nondeathplan-b.log (63/64 baseline)

## Ship call

No game-code change in this arm — nothing to ship. The classifier
fix + fixture update are tooling (`scripts/`), excluded from the
PWA deploy (`.vercelignore`). Ready to merge, pending ship
(coordinator merges to local master via --ff-only).

## Adoption verification (Loop B run fleshout-loop-b-20261117T1729Z)

The 1521Z run died before committing; this arm was adopted by the
1729Z run. Verified, not re-measured (per the adoption brief):

- Proof re-run on the adopted tip (base 0668af726 + the
  uncommitted classifier fix, fixture update, proof test, and
  this evidence): `scripts/test-nondeathplan-live-b.js`
  **103/103, EXIT=0** (log /tmp/test-live-b-adopt.log). The
  regression gate inside it again reads `test-deadplan-b.js`
  86 passed / 3 failed, all 3 the known pre-existing artifacts.
- Classifier fix verified independently of the proof: `classify`
  on the frozen corpora in the main tree (read-only)
  `evidence/2026-11-17/perseed-nondeathplan-b-armed/` and
  `-control/` reads slotTotal 0 / NOISE-ONLY on both legs
  (poolTotal 0, validityOk true) — matches the claim above.
- Findings correction: the dead run had appended a duplicate
  tail `[fixed]` line for #2482 while leaving the original
  [open] line open. Corrected in `sim-findings.md`: the original
  #2482 line is now `[fixed]` in place (fix note appended), and
  the duplicate tail line was removed. #2476 and #2481 were
  already correctly `[fixed]` with their live-observation notes.
  The `[open]` village-talk line (leavers never mentioned again)
  was already present and is unchanged.
- Scratch `oexcl-test.txt` (0 bytes) deleted, not committed.
- Commit: one commit (classifier fix + fixture update + proof
  test + evidence) via safe-commit.sh; rebased onto current
  master afterwards with the proof re-run on the rebased tip
  (see the adoption run's report for the rebased tip hash and
  proof result).
