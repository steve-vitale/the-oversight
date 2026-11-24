# Journey — social life r277 (Lane B, leg 5)

Run: `playtest-loop-2-20261124T0000Z` adopting the timed-out
`playtest-loop-2-20261123T1700Z` (r277). Base at adoption: master
`1a7a5b647` (fleshout-20261123T2015Z adoption); master has since moved
to `f5d2c3caa` (batch ship) — rebase before merge, gate on the rebased
tip. Worktree `journey2-social`, branch `journey2-social`.
Rotation-b read 5 at run start (social life); this run plays 5 and
writes 6 at closeout.

## Adoption / stale-lock recovery

- Lock `playtest-loop-2.lock` held `playtest-loop-2-20261123T1700Z`
  (created 22:55:50Z). Registry heartbeat for its tree
  `journey2-social` was 23:16:34Z — 40 min stale at check (~23:56Z).
- Liveness check before recovery (AGENTS.md stale-lock lesson): `ps`
  showed no process with cwd in `journey2-social` and no sim node
  process; `subagent.list` showed no live agent owned by
  `oversight-playtest-loop-2`; file writes in the tree had stopped
  (last write 23:53:53Z, none in the 7+ min before the decision).
  The 1700Z run is DEAD. Lock deleted in the same call that verified
  its run_id; new lock `playtest-loop-2-20261124T0000Z` written.
- Recovered state: the dead run had finished 3 of 4 panel seeds
  (45845, 45846, 45847), the Arm A proof test, driver, analyzer and
  helper — all UNCOMMITTED in the worktree. It died before seed 45848,
  the determinism re-run, analysis, gate and closeout. This run
  finished them: seed 45848 run (d135 survived, 3 alive), determinism
  re-run of 45845 to `/tmp/r277-determinism`, analyzer run, verdict.
- Registry-lock jam (shared infra, NOT this run's fault): the
  `REGISTRY.lock` has been held since ~23:58Z by Loop A's
  `worktree-register.sh sim-pickreturn-a` (pid 1996; its `flock -x 200`
  holder pid 2403, 16+ min, no child doing work — its `git worktree
  add` child is gone and the tree was never created). Three heartbeat
  attempts timed out at the 120s flock cap (23:5x, 00:0x, 00:1xZ);
  a Loop B `sim-rearm-witness-b` registration and a
  `journey-landing` heartbeat are queued behind the same lock.
  The tree's registry heartbeat is stale since 23:16:34Z — reaper
  margin is ~4h (until ~03:16Z), so the adoption is safe, but the
  heartbeat MUST be re-established when the lock clears and the
  release step may need the same retry. Do NOT kill Loop A's live
  register process to clear it.
- Flap note from the dead run (prereg infra section): write-flap
  window ~23:28–23:37Z; the control re-run of the r268 driver died at
  its JSON write, truncating the worktree copy of
  `journey-social-life-r268-45829.json` to 0 bytes; it was re-run at
  23:53:53Z and is byte-identical to master again (no `M` flag in
  worktree status). VM restart ~23:30Z killed the dead run's first
  register attempt and first heartbeat loop.

## Pre-registration (see journey-social-life-r277-prereg.md)

**Leg question:** does social life hold up across a full run — and do
the r226 F6 fix, r231 C3d, r234 DRY2, r235 DRY3, r236 TRAILTALK, r237
OUTING-SEEK, r238 repay-fallback, r256 gossip-ask fix, r260 M4
discourse-opener strip, r262 M12 escalator cap + "You asked me that
before" strip, and r268 convoLiveBeat resume fix hold in the wild on
FRESH seeds — AND does the joint-outing chain actually get promised,
now that r268 showed it never even attempting?

**Seeds:** 45845–45848 (FRESH — band check in prereg; backup
45849–45852 unused). DAYCAP 140. Driver
`scripts/journey-social-life-r277-20261123.js`, analyzer
`scripts/analyze-journey-social-r277-20261123.js` (r268 files verbatim
except seeds, OUTDIR, filenames/mode, + PANTRY-DAWN snapshot +
Arm A pick-helper wiring).

**Binding metrics:**
- OUTING attempts ≥ 4 panel-wide (NEW — Arm A bar)
- TRAIL distinct ≥ 6 AND max recurrence per seed ≤ 4
- F6 dry 0 panel-wide
- F5W total ≥ 1 panel-wide
- M4-SPLIT conversational ≤ 12 panel-wide
- M12-NATIVE: threeTimes maxPerSitting ≤ 1, sittings2plus = 0,
  exits ≥ 1
- M1–M12, B5, B6: same bars as r268

**Arm A (GAME-adjacent driver fix, binding):** the r268 0-attempts
mystery, diagnosed in code + probe BEFORE the panel: favors reach
`asked` and never `promised`; `dlg:commit` offered 198 times on the
probe seed, pressed 0 times — the driver had no commit rule, so the
standard favor menu's first choice (`favor_requirements`, never spent)
was pressed forever. Fix: `pickConversationChoice` in
`scripts/journey-social-r226-helpers.js` with a commit rule (press
`dlg:commit` on forage_help / water_haul favors, after questions and
details, before the generic fallback), wired into
`driveConversation`. Proof test
`scripts/test-journey-social-life-r277-driver-commit-20261123.js`
9/9 GREEN (verified by this adoption run).

## Verdict: NO-GO

| Metric | Bar | Result | Verdict |
|---|---|---|---|
| OUTING attempts | ≥ 4 | **49** (kept 7, 5,065 kcal) | GO |
| TRAIL distinct / max recurrence | ≥ 6 / ≤ 4 | **11 / 3** (27 presses) | GO |
| F6 dry | 0 | **1** | NO-GO |
| F5W total | ≥ 1 | **0** | NO-GO |
| M4-SPLIT conversational | ≤ 12 | **25** (17 / 3 / 1 / 4) | NO-GO |
| M12-NATIVE | max ≤ 1, 0 sittings 2+, exits ≥ 1 | **max 1, 0, 178 exits** | GO |

Three of six binding bars pass. The headline is real progress: the
driver commit fix unblocked the outing chain (r268: 0 attempts →
r277: 49) and the trail press fired for the first time (r268: 0 →
27 presses, 11 distinct lines). The three misses are diagnosis
items, not re-scores (metric binding §14).

## Panel

- 45845: d138 survived, 8 alive, 146 full convs, 110 natural ends,
  19 feasts, 2 moots.
- 45846: d129 village-lost, 1 alive, 128 full convs, 116 natural
  ends, 18 feasts, 0 moots.
- 45847: d90 village-lost, 2 alive, 77 full convs, 70 natural ends,
  12 feasts, 1 moot.
- 45848: d135 survived, 3 alive, 118 full convs, 105 natural ends,
  26 feasts, 1 moot.
- Panel: 458 transcripts, 169 near-dup flags (144 instructional, 25
  conversational). Bonds proposed 122 — ALL villager-initiated
  (122/122; accepted 39, refused 10, staged 54, expired 19).
  Successions 29. Plots 2, both grievance-linked at arming (2/2).
  Springs 2 (killed 1, hurt 1). Moots 4. Feasts 75. Villages past
  d100: 3/4.
- Watch: B6 GO (552 resolutions, 0 deflected from stage 0). M6 GO
  (re-aligned gate definition; strict on-tile away total 55 reported
  as the known metric/gate discrepancy, does not fail M6). M9 HOLDS
  (recap cap fires; maxPresses 3, 0 cap failures). M10 HOLDS (no
  NARR coach verbatim repeats). FACE HOLDS. M11 recap-empty 0 of 169
  (bar ≥ 10 would land the job-B1 pool fix — no trigger). M12
  door-req 88 of 169 (19.21% of conversations; r189 anchor 86/143).
  B5: 14 funerals, full 11 / partial 2 / none 1 (the "none" is
  Sigrun d125 on 45846 — pantry empty, 0 spent, 5 shorted).
  Outing conversion 7/49 = 14.3% vs watch ≥ 25% — MISSES the watch.
- OUTING outcomes: blocked-forage 22, blocked-positioning 14,
  delivered-promise-kept 7, delivered-promise-NOT-kept 2,
  blocked-depart 3, unexpected-action:? 1.

## Arm A — verdict in the wild: the commit fix works, the chain stalls downstream

The 198-offers-0-presses defect is gone: B6 shows
`ask_favor:commit:s2->s3` 43 times panel-wide and the outing arm
recorded 49 attempts. But only 7 of 49 attempts were kept
(14.3%). The funnel now names the next starvation point:
blocked-forage (22) and blocked-positioning (14) — the depart/forage
blockers, not the commit step (prereg metric review anticipated
exactly this). One `unexpected-action:?` (seed 45846): the outing
arm expected `st.action === 'forage_start'` and found the action
undefined (driver lines 796/1046) — a single case of the dawn arm
meeting a villager state with no action; next-run probe, not a
defect claim at n=1.

## F6 — NO-GO by exactly one line

The single dry line is seed 45846, C-friendship, vid
`app_mgpspqw5921`, 4 turns, read verbatim from the JSON:

- NPC: "If you see that Big-Eyes again, don't try to be clever. Get
  back inside the palisade."
- YOU: "I hear you. I'll watch myself."
- NPC: "...Sorry, lost my train of thought."
- YOU: "Can I ask you something else?"
- NPC: "Sorry — I shouldn't load that on you. What's up?"

The r268 `convoLiveBeat` fix holds 468/469 conversations — this is
not a resume-site failure. The dry line fires as a turn inside a
live sitting: the warning thread ends after the acknowledgment with
no follow-up beat. The sitting recovers and ends naturally, and the
next sitting resumes the grief thread properly ("We never finished
talking about grief"). Next run: find which beat site serves the
post-acknowledgment turn after a warning and why it falls through
to the dry line — one site, one transcript, a proof test shaped
like the r268 one.

## F5W — NO-GO, same structural result as r268

Funnel: scanned 12,177 dawns; askFavor seeds 4,253 (distinct 174);
settled-at-last-sight 0; attempted 0; reasks 0; variants V1/V2/V3
all 0. No seed EVER survives to a settled favor — every seed's last
sighting is unsettled, then it vanishes (consumed by a sitting or
expired). Promises now flow (ledger max: forage_help promised 1,
water_haul promised 2; fulfilled 1 each on 45845/45846/45847) but
the settled re-ask still has no seed to serve. The seed-lifetime
design (seed survives sittings until the favor settles, or a
settlement-triggered re-ask) is still the next run's arm, with this
panel as its evidence. Do NOT lower the bar.

## M4 — NO-GO, teach-frame rotation still doesn't survive

25 conversational flags (per-seed 17 / 3 / 1 / 4). Seed 45845 alone
is 17, and teach-frame pairs are the bulk: Ines serves the same
teaching frame for four different plants in one sitting
("This one — Chanterelle / Baobab / Tulsi (Holy Basil). Leaf, stem,
smell."; "Murumuru / Loquat / Maypop — crush the leaf, smell it,
taste the stem."; "Huckleberry / Wild Amaranth / Chinese Chive.
Remember the leaf, the stem, the smell."). The r268 diagnosis is
confirmed, not superseded: per-sitting `teachFramesUsed` does not
survive the agency-ask path, and the pool exhausts past 4 teachings
anyway. Place-frame pairs (cellar/spring/ridge — "I'll mark it on
your map when we're back") add 2 more. The remaining flags are the
patch line ("Nothing came of that press..." ×2 on 45845, ×1 on
45847), the leadership pair on 45848, and the food-need / patch-up
pairs on 45846. Even reclassifying all template-frame pairs would
leave ~11 — the bar is close, but the fix is the rotation survival,
not the classifier (r268 metric review #1 stands: do NOT normalize
teaching frames away). Content arms, in prereg order: teach-frame
rotation survival through the agency-ask path; hunger-plea body
variety (absent this panel — no hunger-plea flags, the family did
not fire); mood-beat 'up:warm' pool widening ("Something eases in
their shoulders" appears in the Chantal candidate — 1 line, not a
flag this run).

## TRAIL — GO, but the pool is still kcal-slot variants

27 presses, 11 distinct, max recurrence 3. First panel where the
press fires at all. But of the 11 distinct lines, the carrying-kcal
variants dominate ("Between us we are carrying 330 / 270 / 420 /
300 / 450 / 1935 kcal. Onward — there is more green ahead.") plus
the two stock lines ("Two pairs of eyes, twice the ground." /
"The pantry is counting on us."). Per prereg metric review: the
next TRAIL question is new lines, not counting.

## Village assessment (plain words)

Two villages survived to the end of the window and two were lost
(45846 held to day 129 with one person left; 45847 broke on day 90
after a day-73 triple death). These are talkative villages — 458
full conversations, 75 feasts, bonds proposed 122 times and always
by the villagers themselves, the mantle passing 29 times. What
changed this run is that the village finally walks out together:
49 promised outings were attempted and 7 kept, bringing home 5,065
kcal, and the trail talk fired 27 times. What is still missing is
the return: nobody ever comes back to a favor once it is settled,
so no one is ever thanked for a finished job; and the outings
mostly die before they start — 22 times the forage itself blocked,
14 times the pair could not get into position. The people are alive
and bonded and now they do go out together; the shared ventures
start, they just rarely finish.

## People check (sense-testing)

Read the analyzer's four printed M4 candidates in full (see
`journey-social-life-r277-analyzer.log`). Conversations cohere:
- Earl's confession holds its line under pressure — pressed four
  times with "You said something odd the other day," he answers
  "We went over this," "I already told you the truth about that,"
  "I'm not confessing it twice for dramatic effect," then leaves
  on his own errand ("Alright, duty calls."). The already-confessed
  guard works; the driver pestering is the driver's, not the game's.
- Saltanat's regrets thread: the recap escalator fires correctly —
  "Still on your regrets" → "As I said — we're still on your
  regrets" → "We're going in circles — still on your regrets. Ask
  me something else if you want." A player hears the conversation
  defend itself against looping.
- Stan's old-life skills: "Being an exterminator taught me to read
  people fast — who's lying, who's scared, who needs a job. Turns
  out that's a survival skill." Then the laughter beat: "I laughed
  yesterday and it scared me — the sound of it. Like my body
  remembered something my head hadn't approved. Laughter's a
  mutiny. A good one."
- Chantal on grief: "We lost Zoe, Caleb and Aisha. I do the
  headcount without thinking. Then I think." "Trust is slow out
  here. It's the one thing the System can't grant us."
- The failures are repetition, not nonsense: the same teaching
  frame with a new plant, the same patch line, one dry line after
  a warning. No fabricated shared history spotted; no filler loops
  beyond the capped recap escalator (M9 holds). One driver artifact
  to note: "Wait — what were we talking about?" pressed 3× in the
  Saltanat sitting — the NPC handles it, but a real player would
  not hammer recap that way.

## Determinism

Seed 45845 re-run to a separate OUTDIR (`/tmp/r277-determinism`,
same driver + base): the two JSONs differ in exactly two fields —
`"ms": "113s"` vs `"ms": "285s"` (wall-clock runtime) and
`.manifest.date`: '2026-11-23' vs '2026-11-24' (midnight crossed
during the adoption). All game content byte-identical.
**Determinism: identical modulo runtime + manifest date.**

## Standing proofs (re-run on the worktree by this adoption)

- M4-split (r250): 49 passed, 0 failed
- F5 harness (r238): 50 passed, 0 failed
- F6 proof (r226): 49 passed, 0 failed
- TRAILTALK (r236): 30 passed, 0 failed
- repay-fallback (r238): 36 passed, 0 failed
- gossip-dry (r256): 9 passed, 0 failed
- resume-fallthrough (r268): 36 passed, 0 failed
- driver-commit (r277 Arm A): 9 passed, 0 failed

## Telemetry

No canonical baseline exists for the current metric set
(`telemetry-baselines/social.json` is an October snapshot on stale
`l3.*` keys). Ad-hoc comparison, r268 precedent: baseline built
from the r268 panel JSONs in /tmp (`/tmp/r277-social-baseline.json`,
seeded from `{}` — the "newly appeared" lines on the seed step are
seeding artifacts, not deviations), r277 checked against it with
`telemetry-check.js` on the real-signal metrics (`social.moots`,
`social.fullConvs`, `social.transcripts`, `bondProposed`,
`confrontEvents`, `outingArm`, `mootNotes`,
`funeralMendStats.funerals`). Baseline: moots 4, fullConvs 552,
transcripts 552, bondProposed 116, confrontEvents 17, outingArm 0,
mootNotes 4, funerals 17. **LOUD ×2, both explained, baseline NOT
rolled** (ad-hoc /tmp artifact, not committed):

- `outingArm` 0 → 49 (newly appeared): the Arm A driver fix working
  as intended — r268's 0 attempts become 49. This is the run's
  headline, not a deviation.
- `confrontEvents` 17 → 39 (+129%): same cause, not a bug. Sittings
  unblocked from the favor-requirements loop now reach doubt threads
  the r268 driver never got to: per-seed 10 / 15 / 9 / 5 (r268:
  8 / 6 / 3 / 0), every seed elevated, no single-seed outlier. The
  outcome mix is healthy — confessed 14, already-confessed 19 (the
  guard firing, see the Earl transcript), deflected 6 — no runaway
  and no double-confession. The guard, not the count, is the
  signal, and it holds.
- Quiet on the rest: moots 4 → 4, fullConvs 552 → 469,
  transcripts 552 → 469, bondProposed 116 → 122, mootNotes 4 → 4,
  funerals 17 → 13 (all within the check's quiet band; the B5
  per-funeral tally is 14 — a different count, see the panel
  section).

## Gate

`node scripts/check.js --quick` on the rebased tip (branch tip
`d59a98064`, base master `f5d2c3caa` — the batch-ship tip, so no
rebase was needed at closeout), run 00:34–00:53Z by the 0000Z
adoption, **328 passed, 16 failed in 1133s — 0 attributable**
(log `evidence/2026-11-23/journey-social-life-r277-gate.log`).

Standalone serialized re-runs on the same tip (log
`evidence/2026-11-23/journey-social-life-r277-gate-rerun.log`,
01:10–01:16Z, by the 0100Z finisher): **13/16 PASS** (exit 0) —
all 7 flap-EPERM failures, all 3 120s load timeouts (living-garden
206s, one-person-army 146s, capable-bot 45s), occupation-panels,
measurement-cache-flags, and `test-foodpower-20261014.js`. The
foodpower failure in the gate was the ontology validator reading a
worktree `docs/ONTOLOGY.md` the write flap had truncated to 0 bytes
mid-gate (00:46:28Z); restored from HEAD (`git checkout HEAD --
docs/ONTOLOGY.md`, 354,686 bytes) before the re-runs.

Remaining 3 are the standing set, identical to r268's finisher
gate: the measurement-proof staleness pair
(`test-measurement-proof-update.js`,
`test-measurement-workflow.js` — "Proof source inputs are not
current" / retained neutrality proof does not cover current
inputs) and `test-phone-frame-proof.js` (phone receipt stale vs
current source). All three key off src/js, src/data and index.html
inputs that r277 never touched — the r277 commit touches 0 src/
files (scripts/ + evidence/ only) — so they are pre-existing
master staleness, not this run. The balance-proof / phone-frame
refresh is owed by whoever next lands src changes, not by this
driver-only run.

Arm A proof test re-run on the final tip by the finisher:
`scripts/test-journey-social-life-r277-driver-commit-20261123.js`
**9/9 PASS**.

## Metric review (for the NEXT run, §14 — bars never re-scored)

1. **OUTING conversion watch (14.3% < 25%):** the next question is
   the depart/forage blockers (blocked-forage 22, blocked-positioning
   14), not the commit step. The `unexpected-action:?` case (1) is a
   probe: which outing state leaves `st.action` undefined.
2. **F5W bar (≥ 1):** the bar is fine; the path is unreachable (see
   F5W section). Do not lower the bar — build the seed-lifetime
   design.
3. **M4-SPLIT bar (≤ 12):** the bar held as written and failed
   honestly (25). The content arms are teach-frame rotation
   survival, hunger-plea body variety, mood-beat pool widening — in
   that order. Rotation is a defect; the other two are variety.
4. **F6 bar (0):** missed by exactly one line, at a non-resume
   site (post-warning acknowledgment). The next run investigates
   that one site with the r268-shaped proof test; do not re-open
   the resume fix.
5. **TRAIL bar (distinct ≥ 6):** passed, but the pool is kcal-slot
   variants. The next TRAIL question is new lines (r261 metric
   review), not counting.
6. **M12 door-req (88/169, 19.21%):** watch-level; worst sitting
   8 door serves (nadia_khoury, 45845, 10 turns). No bar change
   proposed.

## Handover / adoption notes

- Commits on `journey2-social`: [commit 1 — Arm A helper +
  proof test + driver + analyzer + prereg + panel JSONs + analyzer
  log + this run note: `d59a98064`]. No `src/js` changes this run
  (driver-side fix only). [commit 2 — gate log + gate re-run log +
  Gate section of this note: hash filled at merge].
- Panel JSONs: `evidence/2026-11-23/journey-social-life-r277-45845.json`
  … `-45848.json` (+ probe `-45829.json`, EXCLUDED from the panel:
  the analyzer globs `journey-social-life-r277-\d+.json`, so the
  probe was moved aside during the analysis run and restored after;
  the analyzer log covers the 4 panel seeds only).
- Determinism re-run JSON: `/tmp/r277-determinism/journey-social-life-r277-45845.json`
  (not committed — /tmp only).
- Analyzer log: `evidence/2026-11-23/journey-social-life-r277-analyzer.log`
  (721 lines).
- **Do NOT touch `src/js` in the worktree while any panel re-run is
  in flight** (the driver loads the game from disk per seed) —
  no re-runs remain.
- Next-run owed items: (1) F5 seed-lifetime design; (2) teach-frame
  rotation survival through the agency-ask path; (3) F6
  post-warning dry site; (4) outing depart/forage blockers +
  `unexpected-action:?` probe; (5) TRAIL new lines; (6) npcGoal /
  goal-branch flip (r268 filing, untouched); (7) hunger-plea body
  variety + mood-beat pool widening (content arms, after rotation).

## Finisher (0100Z occurrence, `playtest-loop-2-20261124T0100Z`)

- The 0000Z adoption ran the gate (00:34–00:53Z) but timed out
  before filling the Gate section or committing the logs. This
  occurrence adopted the adoption: liveness check at ~01:00Z — no
  node/check.js process, no live `oversight-playtest-loop-2`
  subagent, last file write 00:53:05Z (the completed gate log),
  run hour ended 01:00Z. The 0000Z run is DEAD; lock
  `playtest-loop-2-20261124T0000Z` held for closeout, deleted last.
- Recovered flap damage: worktree `docs/ONTOLOGY.md` truncated to 0
  bytes mid-gate (00:46:28Z); restored from HEAD, 354,686 bytes.
  No other worktree changes were uncommitted.
- Gate adjudicated 13/16 pass standalone (see Gate section above);
  0 attributable. Arm A proof re-run 9/9 on the final tip.
- Registry heartbeat could NOT be re-established: `REGISTRY.lock`
  still jammed (heartbeat attempt 01:11Z failed "registry lock held
  > 120s"; holder is Loop A's `sim-launchdiag-a` registration,
  pid 15888 — do NOT kill it). Last registry heartbeat 23:16:34Z;
  reaper margin ~4h (until ~03:16Z); closeout finished well inside
  it. Release step retried against the same jam; if it fails, the
  tree is clean, merged, and safe to reap once the lock clears.
- Rotation-b 5 → 6 written at closeout; next Lane B leg is crisis.
