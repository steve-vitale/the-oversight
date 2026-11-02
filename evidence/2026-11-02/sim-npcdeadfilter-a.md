# sim-npcdeadfilter-a — npcIds() dead filter BUILD (Loop A 20261102, axis scale-onramp)

Arm: sim-npcdeadfilter-a, run fleshout-loop-a-20261102T1515Z,
follow-up (i) from sim-deadid-a. Scope ONLY: exclude dead-marked
ids from npcIds() (src/js/betrayal.js), consulting the same death
records deadMarked() uses — all three, per the deadid evidence.
Do NOT touch debate-notices-death, the live-sim refusal
transcript bundle, or genApplicant (already landed). No policy
changes. No [needs-eyes]: a pure membership filter; nothing in
normal play changes when no dead id sits on a roster, and no new
narration is added.

## Verdict: GO (pilot) — confirm owed, not automatic

All pre-registered primary items hold post-fix, all four pilot
guardrails hold, and the proof test is RED pre-fix (7 failures,
all P1/P2) and GREEN post-fix (14/14). Per the prereg, pilot GO
does NOT trigger a confirm automatically: the pilot verdict is
reported and the coordinator decides on a 12-16 seed confirm.
This report recommends the coordinator run that confirm, because
the pilot's live band cannot show the filter working in the wild
(see below) — but the recommendation is the coordinator's call,
not a spend made here.

## Why the pilot band cannot show the filter working in the wild

On current code the entry gates from deadid already hold: the
pilot baseline shows ZERO dead draws, ZERO dead walk-ins, ZERO
reappearances, and ZERO npcIds dead returns on all 8 seeds. No
live pilot seed puts a dead id on the roster through any other
path, so the baseline and post-fix bands are byte-identical
(see below). That is good news about the game (no other live
path is currently feeding succession a dead candidate on these
seeds) and a limit of this measurement (the filter's wild
effect is unobserved, not zero). The filter is therefore proven
where it can be proven: the harness injection cases, which
construct exactly the corrupt-roster state the filter exists
for — a dead id on the roster, with top trust, at succession
time. The pilot's job here is no-harm, and it passes cleanly.

## Prereg

evidence/2026-11-02/sim-npcdeadfilter-a-prereg.md, committed
(ebc0299db) BEFORE any judged sim and before the fix was
written. The pre-prereg harness repro (seed 42, /tmp script,
disclosed in the prereg) confirmed the hole on current code
before the prereg was written. No threshold was re-scored
mid-run; the only prereg note that needed care was the 97331
chain, which is documented in the prereg as NOT reproducing as
a live chain on current code (the entry gates already kill
it) — and the pilot baseline confirms that: 97331 post-entry-
gates is 69d, village-lost, 11 applications, 8 walked, zero
dead anything, identical on both sides.

## The fix (src/js/betrayal.js, +27/−1)

npcIds() was `(roster).filter(id !== villagerId)`. It is now
the same filter plus a dead check per id: use Game.deadMarked
when available, with the identical triple-source check inline
as fallback (data.villagers record, background_survivors
record, vpOf/rosterChars) so the filter does not depend on
method load order (betrayal.js loads before membership.js)
or on a partial harness. The villagerId exclusion is
unchanged, no RNG is consumed, and on a clean roster the
output is byte-identical — which is why the pilot bands
match exactly. Every npcIds() caller inherits the filter:
succession candidates (ledger.js playerDeath), voters,
gossip hearers, witnesses. A dead id now cannot vote,
witness, or inherit, by any path.

## Primary results — harness injection (seed 42, live harness)

Pre-fix proof run: 7 passed, 7 failed, 0 skipped — every P1
and P2 case failed, every guardrail passed. Post-fix: 14
passed, 0 failed, 0 skipped.

- P1a: real kill path — X killed via removeVillager('killed')
  (deadMarked true, dropped from roster), pushed back onto
  the roster to simulate "any other path": pre-fix npcIds()
  returned X; post-fix it does not.
- P1b: villagers-record-only dead mark (boris_kowalski):
  excluded post-fix.
- P1c: background_survivors-record-only dead mark (same id):
  excluded post-fix.
- P1d: vpOf-only dead mark (gen_1xo47zu): excluded post-fix.
  (The vp mark sticks in harness, so this case is genuinely
  tested, not skipped.)
- P2: driven succession — dead X on the roster with trust 90
  against 0 for every living roster id: pre-fix the
  ledger-ordered candidate list put X first and driven
  playerDeath made X bearer; post-fix the candidate list
  contains no dead id, its first entry is living
  gen_yglp2zr, and driven playerDeath makes gen_yglp2zr
  bearer. The dead id never inherits.
- P3: clean-roster guardrail — npcIds() equals
  roster-minus-bearer in order before, between, and after
  all injection cases.

## Pilot results — before/after on identical seeds, 180d cap

Closecommit stack verbatim from deadid (tribfloor leadfeast +
windefer + seatdrive + fullseat-diag + titanroute +
musterclose + mustergap commit-own; env FEASTSCALE_R13=1
TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1
HERALD=1). Seeds: 97330, 97331, 97332, 97333, 97334, 97335,
97336, 97338. Driver: scripts/npcdeadfilter-driver-20261102.js
(deadid driver plus an npcIds() return trap, a succession-
candidate trap at playerDeath, and a daily rosterDead snap;
new per-seed dir perseed-npcdeadfilter-a, so the deadid
judged files are untouched).

Per-seed baseline → post-fix (gameDays, endReason, deaths,
applications, walked; every other trapped field identical):

- 97330: 136d, village-lost, 6 deaths, 5 apps, 2 walked → identical.
- 97331: 69d, village-lost, 1 death (d57 Diego → Onni), 11 apps,
  8 walked → identical.
- 97332: 23d, village-lost, 0 deaths, 3 apps, 0 walked → identical.
- 97333: 92d, over-other, 11 deaths, 5 apps, 2 walked → identical.
- 97334: 90d, village-lost, 4 deaths, 4 apps, 1 walked → identical.
- 97335: 62d, village-lost, 11 deaths, 5 apps, 2 walked → identical.
- 97336: 110d, over-other, 3 deaths, 7 apps, 4 walked → identical.
- 97338: 90d, over-other, 2 deaths, 3 apps, 0 walked → identical.

Band totals: applications 43 → 43, walked 19 → 19, refused
0 → 0, dead draws 0 → 0, dead walk-ins 0 → 0, reappearances
0 → 0, bearer-after-death 0 → 0, npcIds dead returns 0 → 0
(call count 0 both sides), dead succession candidates 0 → 0,
driver errors none → none. Full per-seed JSONs are identical
once the run label (baseline/postfix) is stripped — not
just the summaries. These totals match the deadid post-fix
band exactly (43/19), as expected: this arm changes nothing
on clean rosters.

## Guardrails

G1. NO LIVING-FLOW LOSS — PASS. No seed loses applications,
    walked arrivals, or succession events; band totals equal.
G2. DET-GATE (corrected form) — PASS. Zero divergence on any
    seed, so the "only on dead-return seeds" allowance was
    never needed; all 8 seeds are byte-identical.
G3. ZERO DEAD RETURNS POST-FIX — PASS (vacuously on live
    seeds: zero both sides; substantively in harness: the
    injection cases prove exclusion where a dead id IS
    present). The vacuity is disclosed, not hidden — see
    "Why the pilot band cannot show the filter working."
G4. NO NEW ERROR CLASS — PASS. Driver errors empty on all
    16 pilot runs.

## Proof results

- scripts/test-npcdeadfilter-a.js: RED pre-fix (7 failed),
  GREEN post-fix — 14 passed, 0 failed, 0 skipped.
- scripts/test-deadid-a.js: 23 passed, 0 failed, 1 skipped
  (unchanged; the skipped case is its pre-existing
  harness limitation, documented in that test).
- scripts/test-rosterreturn-a.js: 29/29 GREEN after a
  documented flip (design changed on purpose, repo rule):
  its live assertion that a dead-flagged roster id "is
  STILL an npcIds candidate" and its code-property assertion
  that npcIds() "has no dead filter" both pinned the old
  behavior this arm deliberately removes. Both now pin the
  filtered behavior; the driver-JSON part (historical
  97330 chain analysis) is untouched. The flip is marked
  A-FLIP-2 in the test header.
- scripts/test-membership-20261007.js (green-listed):
  43/43 GREEN.
- Pre-existing failures, proven NOT mine by re-runs with
  betrayal.js reverted to HEAD: test-village-membership.js,
  test-membership-depth-20261007.js, and
  test-recruit-person-20261013.js (green-listed) all crash
  identically without the fix (genRoster/setup errors,
  seekReadmission error — untouched code paths). Reported
  here, not fixed — outside this arm's area, same profile
  the deadid arm recorded.
- check.js --quick: NOT green, NOT failed — the run was
  killed by a 150s timeout while still printing progress
  dots, no summary line (same stall class under heavy
  sibling load the deadid arm saw; re-running it would
  contend with siblings' jest/sims). Not claimed. The
  arm's verification rests on the proof test, the 16
  judged sweep runs, and the neighbouring proof suites
  above, all of which ran clean.

## Sense check (transcript, SENSE-TESTING LAW)

No pilot transcript changed — the bands are byte-identical,
so there is no new line to judge and no old line lost. The
harness succession case reads correctly in state terms:
with the dead id filtered, the village picks its next
most-trusted living member (gen_yglp2zr) instead of
installing a corpse with a preserved trust score. No
narration was added, so there is no new fiction to check;
the refusal line from deadid still covers the walk-in case.

## Reachability verdict

This fix adds no content and blocks no content. Scale
reachability is unchanged: the pilot band's end reasons are
identical in kind (village-lost / over-other), and no
won/table/national flag from any measurement substrate is
cited as reach. The scale wall itself is untouched by this
arm — it removes a corruption of succession accounting (a
dead candidate could still have won the mantle through any
non-entry path), but no new national/table/win path is
opened. The wall numbers for this run: national 0 / table 0
/ wins 0 in the closecommit sweep band (substrate flags not
cited, per the task instruction).

## Village assessment (plain words)

The village used to have one more hole in its bookkeeping:
the application office now crosses out the dead, but the
list the village reads when choosing its next leader still
had dead names on it. If any other accident put a dead
person back on that list — and the game has already shown
such accidents happen — the village would have handed its
leadership to someone already buried, because that person's
old trust score was still the highest number on the page.
Now the list itself is checked: dead names never appear on
it, so the village always picks a living person to lead,
no matter how the dead name got there. In the villages
actually simulated this run, no dead name ever reached the
list — the earlier fix is holding — so daily village life
looks exactly the same, day for day. The protection is for
the accident that hasn't happened yet on these seeds, and
it is proven to work when that accident is staged.

## Metric review (for the NEXT run, not this verdict)

- G3 as written is vacuous when the entry gates hold: a
  live band with zero dead-on-roster seeds cannot
  distinguish "filter works" from "filter never invoked."
  The NEXT arm that needs wild filter evidence should
  either seed a corrupt-roster state into the driver
  (deliberately place a dead id on the roster mid-run and
  watch succession) or accept harness injection as the
  judged instrument, as this arm does. Do not re-run 8
  clean seeds expecting a different answer.
- The confirm question for the coordinator: a 12-16 seed
  confirm of this filter would most likely reproduce the
  same byte-identical no-op (clean rosters), so its value
  is confirming no-harm at wider scale, not demonstrating
  the filter. If confirm is run, it should include at
  least one corrupt-roster seed or be judged explicitly
  as a no-harm band.
- Follow-ups, NOT built here: (ii) a live-sim transcript
  of the accepted-before-death refusal line (proven in
  harness only — no pilot sim produced it, gate 1 fires
  first); (iii) whether debate should notice a pending
  applicant's death (design question for the narration
  arm). Follow-up (i) — this arm — is now built.

## Canon

docs/CANON.md read first. No canon doc covers npcIds(),
succession ordering, or membership intake specifically
(MONSTER-WAVES.md covers wave law, not membership). The
rules above are code-read from src/js/betrayal.js,
src/js/ledger.js, and src/js/membership.js, not invented
canon. No new narration was added, so the "no silent
actions" standing rule needs no new line: filtering a
return list drops no event.

## Files (this arm, to be committed on branch sim-npcdeadfilter-a)

- src/js/betrayal.js — the fix (npcIds dead filter, +27/−1).
- scripts/test-npcdeadfilter-a.js — proof (RED pre-fix,
  GREEN post-fix).
- scripts/npcdeadfilter-driver-20261102.js — sweep instrument
  (deadid driver + npcIds/succession traps).
- scripts/test-rosterreturn-a.js — A-FLIP-2: two assertions
  flipped for the intentional behavior change (documented
  in-file).
- evidence/2026-11-02/sim-npcdeadfilter-a-prereg.md (already
  committed, ebc0299db).
- evidence/2026-11-02/sim-npcdeadfilter-a.md (this file).
- evidence/2026-11-02/perseed-npcdeadfilter-a/nf-s<seed>-
  <baseline|postfix>.json (16 judged runs).
