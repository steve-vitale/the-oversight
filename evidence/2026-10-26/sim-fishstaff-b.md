# sim-fishstaff-b — fish refusal vs fish assignment persistence (DIAG arm)

Loop B, run fleshout-loop-b-20261026T0530Z, axis food-economy. Worktree
branch sim-fishstaff-b. Base commit de87ffe79 (journey-landing r54).
INSTRUMENT ONLY: zero src/js changes in this arm; new files are scripts/
instruments, an analyzer, a test, and this evidence file plus its corpus.

## Canon read first

- docs/CANON.md (manifest) and docs/PRESERVATION.md (the food ladder:
  cleaned < cooked < smoked < rendered < pemmican; blind penalties teach).
  Fish staffing itself has no dedicated canon doc — the fish duty is game.js
  code (FISH DUTY, bal-survival 2026-10-10) plus the competent-policy
  creek-crew rule. No canon is invented here; the code citations below are
  the source of truth for this diagnostic.
- docs/MEASUREMENT.md §§9–12, 14–15 apply as staged below.

## Background (quoted, NOT re-judged)

sim-onzero9754-b assign logs, seed 9754: assignTask('fish') refused
223/223 (preserver-OFF pd0), 196/198 (OFF pd1), 192/194 (ON pd0), 239/239
(ON pd1), while snapshot fish assignments still appear (17 days on pd0).
The refusals and the persisting assignments were observed, not reconciled,
and are not part of the cook-capture verdict. The cook-capture staffing
fallback already LANDED as commit 908ad0f12 in scripts/policies/competent.js
— NOT re-run, re-judged, or re-landed here. The preserver-widening verdicts
(preserveact, rotdecide2) are NOT re-judged here.

## Question

Reconcile fish refusal vs fish assignment persistence. Hypotheses, to be
separated with counts, not guesses:

- (a) refusals come from one caller/path and assignments from another;
- (b) snapshot assignments are stale (assigned, then refused/unassigned
      later, snapshot lags);
- (c) assignments are made by a path that never calls assignTask('fish');
- (d) a different refusal reason per caller.

## Code facts established BEFORE sims (read, not assumed)

- The only game-side writers of village.assignments are assignTask,
  offerDeal (via 'deal'), and appealToGoal (via 'appeal') in src/js/game.js.
  The competent policy calls only assignTask for fish, from counterPlay →
  assignAnother('fish') — the creek-crew loop, 2 fishers from day one
  (3 when the pantry is critical). No policy path calls offerDeal or
  appealToGoal for fish.
- assignTask refusal shapes: (i) null when the scholar is not at Haven
  (not a refusal — a location miss); (ii) {ok:false, refused:true} from
  checkObedience when trust is below the gate; (iii) {ok:false, refused:
  true, reason:'wounded'} for outdoor tasks under 40 HP — 'fish' is NOT in
  OUTDOOR_TASKS, so the wounded gate cannot refuse fish.
- checkObedience gates food work (fish, garden) at trust 10, other work at
  20. Starting trust is 5 + floor(rand*16) = 5..20 per villager, so a
  fisherman with trust 5..9 refuses fish while one at 10+ accepts.
- counterPlay's fish loop re-reads free villagers on every iteration and
  picks the top scorer: a refused top scorer stays free and stays top, so
  one refuser can absorb every iteration of the loop in a day. That is a
  candidate mechanism for high refusal counts, to be confirmed by
  per-vid refusal counts (not assumed).
- resolveAssignments deletes each assignment after it resolves ("one part
  per assignment — reassign to continue"), EXCEPT a sheltered (mustered)
  villager's assignment, which is KEPT. So a fish assignment seen in a
  post-daily snapshot normally lives at most until the next day-part's
  resolution — a snapshot-day fish assignment whose assignedDay is EARLIER
  than the snapshot day is stale/persisting by construction, and a
  snapshot-day fish assignment with via 'deal'/'appeal' is path (c).
- Timing: policy.daily runs AFTER the day's 3 parts and BEFORE sleep, so a
  post-daily snapshot sees assignments created by that day's daily before
  they resolve. One successful assignTask('fish') can therefore explain at
  most one post-daily snapshot day (its own day) — unless it persists via
  shelter or another path.

## PRE-REGISTRATION (written BEFORE any sim runs; judged ONLY against this)

- Substrate (identical on all configs): policy leadfeast,
  DEPOSITGATE=1, FEASTSCALE_R13=1, SEATDRIVE=0, 100d death-aware horizon
  (dead villages stop, +10d tail max). PLENTYDEPRI per side as noted.
- Seeds: PILOT GATE first — seed 9754, both pd sides (the observation
  seed). Then the pilot band 9750-9757, pd0 (8 seeds). Never below 8 seeds
  for the band judgment.
- Primary metric: per-seed fish classification — fish assign calls,
  refused, ok, snapshot fish-assignment days, and the named reconciling
  mechanism.
- GO threshold (DIAG-GO): on seed 9754 BOTH sides the mechanism is named
  with exact counts (calls/refused/ok/assignment-days plus the caller/path
  split), AND the same classification holds on >=6/8 band seeds (pd0),
  with any deviating seed named individually. Otherwise DIAG-NO-GO
  (mechanism unnamed or band-inconsistent) — report exactly which leg
  failed.
- Guards (reported, never verdict-flipping post-hoc): daysAlive, deaths,
  starvation share vs the onzero corpus shape; if the instrument changes
  any numeric field vs a recorder-free baseline, say so and the arm is
  NO-GO on neutrality.
- Instrument: scripts/sweep-fishstaff-b.js — wraps assignTask (with caller
  stack, trust-before, playerAtHaven, full return), offerDeal and
  appealToGoal (the other two assignment writers), resolveAssignments
  (fish entries before/after resolution, sheltered-kept), and pre/post
  policy-daily snapshots carrying the FULL assignment objects
  (vid, assignedDay, assignedPart, via). Every post-daily snapshot
  fish-holder is classified exactly one way: FRESH-OK (an ok assignTask
  call for that vid that day), DEAL, APPEAL, STALE (assignedDay earlier
  than the snapshot day), or GAP (no explaining call and assignedDay ==
  snapshot day — an instrument miss, reported as such, never papered over).
- Neutrality: FISHSTAFF_NEUTRAL=1 runs the same driver with all wrappers
  off; seed 9754 both sides must match the instrumented run on daysAlive,
  deaths, win, wave, national — else NO-GO on neutrality (reported, and
  the classification is not trusted).

## Metric review (§14)

The primary metric proved right: per-seed fish classification (calls /
refused / ok / snapshot fish-assignment days + caller/path split) named the
mechanism on both 9754 sides and held on 8/8 band seeds. One metric caveat,
recorded for the NEXT run, not re-scored here: the snapshot "day" is the
scholar day at post-daily time, and scholar days stall and skip relative to
loop days (9757 has 100 loop-dailies but only 96 distinct scholar days).
Two of 9757's 181 ok calls (day 98: olivia_bennett, oliver_moore) have no
same-day snapshot holder because of that seam; their assignments are
visible in resolve events (all 181 ok calls resolved), so nothing is lost
— but a future instrument should key snapshots to loop-day as well as
scholar day. No metric was re-scored mid-run; the GO judgment below uses
exactly the pre-registered threshold.

## Balanced panel (§15)

Attempted and NOT attached, honestly: scripts/balance-panel.js builds its
own panels from its own sim inputs — it cannot ingest recorder corpora,
and this DIAG arm has no lever change to compare (one substrate, no
before/after arms), so there is no panel comparison to fabricate. The
attempt itself died on a write EPERM inside the panel's own worker. No
panel inputs were invented.

## Results — VERDICT: DIAG-GO

GO leg 1 (9754, both sides, mechanism named with exact counts): MET.
GO leg 2 (same classification on >=6/8 band seeds pd0): MET — 8/8, with
zero deviating seeds. No DEAL, APPEAL, or GAP holder on any of the 9
instrumented runs. Neutrality: instrumented runs match recorder-free
baselines exactly on both 9754 sides (pd0: 34 days, wave 2; pd1: 52 days,
wave 3) — see the instrument-bug disclosure below; the verdict rests on
the FIXED instrument's runs, not the perturbed ones.

### The reconciling mechanism, in plain words

Refusals and assignments are two different villagers' stories, and the
long tail is shelter — not fresh staffing:

1. THE REFUSALS ARE ONE REPEATED ASK. The only caller of assignTask('fish')
   anywhere in the policy is counterPlay → assignAnother (the creek-crew
   loop). It re-reads free villagers every iteration and always picks the
   top scorer — so when the top scorer refuses, they stay free, stay top,
   and absorb every iteration of the loop that day. On 9754, every refusal
   is rosa_mendez (pd0: 19/19; pd1: 14/14), all on the trust gate
   ("Trust too low"), all with stored trust below 10 (pd0: 8×8, 3×3, 1×8;
   pd1: 8×8, 6×3, 5×3). Across the band, every refusal on every seed is
   trust-below-10, zero at 10+, zero nulls (the scholar is always at Haven
   when counterPlay runs, because counterPlay itself gates on that).
2. THE ASSIGNMENTS ARE FRESH OK CALLS — except when shelter holds them.
   Every post-daily snapshot fish-holder is either FRESH-OK (an ok
   assignTask call for that villager that day, via 'in-person') or STALE.
   No assignment ever came from offerDeal or appealToGoal (0 calls on all
   runs), so hypothesis (c) is DEAD: there is no second path.
3. STALE MEANS SHELTERED, PROVEN. Across the whole corpus, 179 STALE
   holders — and all 179 read sheltered=true at snapshot time, with
   matching kept (not resolved) resolve events at every part while
   sheltered. Zero unsheltered STALE holders. Shelter is the game's honest
   rule ("mustered villagers are inside, not working; the assignment is
   KEPT — they resume it on release"), so a sheltered fisher keeps the
   creek-crew slot while catching nothing — and counterPlay counts that
   stale holder as a fisher, so it staffs fewer fresh fishers while the
   muster lasts. That is the background cell's 17 days, decomposed: the
   on-pd0 background run had 2 fresh ok calls (greta_hansen, days 84 and
   85) and then ONE assignment that stopped resolving from day 86 to day
   100 (15 pre-daily days + the 2 fresh days = 17 snapshot days). The
   background corpus does not record shelter, so its keep-cause could not
   be named from that corpus alone — this arm's instrument names it.
4. THE TRUST-0 QUIRK (reproduced, fix shape below). Rosa's pd1 ok call
   (day 17) happened at stored trust 0: checkObedience reads trust with
   `|| 10`, so a stored 0 reads as "unknown" → 10, which passes the fish
   gate of 10. A villager at rock-bottom trust can therefore accept fish
   duty while a villager at trust 5 refuses it. (The perturbed first run
   showed the same shape at day 88; the fixed runs reproduce it at day 17
   on pd1.)

### Per-seed numbers (fixed instrument; substrate leadfeast, dg1, r13, seatdrive 0)

| seed/side | days | calls | ok | refused | snap fish-days | holders FRESH-OK / STALE / GAP | wave | national |
|---|---|---|---|---|---|---|---:|---|
| 9754 pd0 | 34, village-lost | 19 | 0 | 19 (rosa) | 0 | 0 / 0 / 0 | 2 | no |
| 9754 pd1 | 52, village-lost | 16 | 2 | 14 (rosa) | 1 | 2 / 0 / 0 | 3 | no |
| 9750 pd0 | 100, survived | 173 | 173 | 0 | 100 | 173 / 14 / 0 | 4 | yes |
| 9751 pd0 | 100, survived | 279 | 271 | 8 | 96 | 271 / 0 / 0 | 3 | no |
| 9752 pd0 | 100, village-lost | 92 | 92 | 0 | 99 | 92 / 54 / 0 | 4 | yes |
| 9753 pd0 | 93, village-lost | 76 | 74 | 2 | 91 | 74 / 34 / 0 | 4 | yes |
| 9754 pd0 | 34, village-lost | 19 | 0 | 19 | 0 | 0 / 0 / 0 | 2 | no |
| 9755 pd0 | 78, village-lost | 120 | 107 | 13 | 71 | 107 / 25 / 0 | 4 | yes |
| 9756 pd0 | 100, survived | 204 | 122 | 82 | 87 | 122 / 40 / 0 | 4 | yes |
| 9757 pd0 | 100, survived | 185 | 181 | 4 | 97 | 179 / 12 / 0 | 4 | yes |

Guards: deaths 3–15 per run; starvation 0–3 (9754 pd0: 3 of 8 deaths
starvation, the rest arena/dehydration — the early-death shape matches a
village that never staffed the creek). No wins on any run; the table was
not reached here (expected for a fish-staffing diagnostic, not a
reachability claim).

Background comparison (NOT re-judged, reconciled): the background's
on-pd0 numbers (194 calls, 2 ok, 192 refused, 17 snapshot days) do not
reproduce exactly on current master — 9754 now dies day 34 (pd0) / 52
(pd1) instead of surviving 100, because the base moved — but the
STRUCTURE reproduces exactly: one refuser (rosa) + a handful of fresh ok
calls + a shelter-stale tail. The background's 223/223 off-pd0 shape
(zero ok, zero snapshot days) likewise matches this arm's 9754-pd0 shape
(zero ok, zero snapshot days), at different counts.

### Village assessment (plain words)

On seeds where the creek crew staffs, the village fishes every day and
the crew turns over normally — people take the job, work the creek, and
the job opens again tomorrow. On 9754 the village never gets that going:
the same person is asked over and over, says no over and over (she
doesn't trust the leader enough yet), and the village dies young
(day 34 / 52) with the creek unstaffed. When a crisis musters the village
inside, fishers keep their assignments but catch nothing — and because
the crew count includes them, the leader staffs fewer replacements, so a
muster quietly thins the food line even after the danger passes. The
villagers are not acting robotically here: the refuser refuses for a
named reason (low trust), the sheltered villagers are inside for a named
reason (muster), and the rest work when asked. The robotic-looking part
is the LEADER's loop — asking the same refuser up to 3 times a day
instead of moving to the next candidate — which is exactly the
cook-fallback shape that already landed for cooks (commit 908ad0f12) and
is the natural fix shape for fish (below).

### Sense-testing note (honest limit)

No fish narration lines were captured: the emit tap recorded 0 fish
say-samples on all runs because fish resolution lines go through
encounters.js's G.say override, not Game.emit. The sense judgment above
therefore rests on assignment / resolution / shelter traces (which are
complete: 0 GAP holders), not on captured dialogue. A future instrument
that wants fish dialogue should wrap G.say, not Game.emit.

### Fix shapes for a FUTURE arm (NOT implemented here — zero src/js changes)

1. Fish staffing fallback (mirror the landed cook fallback): counterPlay's
   fish loop should walk down the scored candidate list until someone
   accepts, instead of re-asking the top scorer. That single change would
   end the 19–239-refusal pileups on one villager.
2. Trust-0 vs unknown in checkObedience: read stored trust with an
   explicit undefined check (as offerDeal already does) so a stored 0
   does not pass as 10. Design call for Steve: should a 0-trust villager
   refuse food work honestly, or is "0 means unmeasured" intended?
3. Stale-holder crew counting (design question, not a bug claim):
   counterPlay counts sheltered fishers as staffed. If a muster lasts
   weeks, the creek stays thin. A future arm could decide whether
   sheltered holders should still count toward wantFishers.

### Instrument-bug disclosure (read this before trusting any number above)

The FIRST instrument version had a real bug: its registerDeath wrapper
counted deaths but never delegated to the original — deaths were never
registered, so villages lived far longer (9754 pd0: 95 days instead of
34) and every number from that first pass was trajectory-perturbed. The
bug was caught by the pre-registered neutrality check (neutral runs died
at 34/52 days vs instrumented 95/98), fixed (delegate, then count), and
EVERYTHING was re-run with the fixed instrument; all numbers in the
table above are from the fixed runs, and neutrality now matches exactly
on both 9754 sides. The perturbed first-pass numbers are NOT in this
evidence's table and must not be quoted. The structural findings (single
refuser, single caller, shelter-stale) appeared in both passes, but only
the fixed pass is cited.

### Infrastructure notes

- EPERM write flap (known container class) hit this run repeatedly:
  band seed 9757 + both neutral runs lost their first writes; recovery
  was deterministic re-runs + a @@FALLBACK stdout path added to the
  instrument's writeRobust (payloads recovered from the captured run log
  with readback verification) + a band summary regenerated from the
  per-seed files. The corpus on disk is complete and test-green.
- The corpus test initially passed vacuously on the partial corpus (it
  only checked files present); it now asserts the full 11-file manifest,
  so a missing file fails loudly.

## Results

[See above — full results section.]

