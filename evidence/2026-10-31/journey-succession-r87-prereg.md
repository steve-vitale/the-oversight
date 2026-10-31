# Journey succession r87 — WEEK-1 DRIVEN NAMING, second attempt (lane B, pre-registration 2026-10-31, written before any play)

Leg 7 (succession). Rotation-b read 7 at run start → write 4 at closeout
(endgame next), and VERIFY the file reads 4 afterwards (rotation writes
have repeatedly failed to stick in recent Lane B runs; the file is the
authority, not this note's claim).

Run number basis: r86 (2026-10-31) wrote a prereg for this exact question
but NEVER RAN — no seeds, no results, no run note. Its driver and main
analyzer copies landed 0 bytes in the EPERM write flap and its worktree
still sits registered-active with a heartbeat last updated 13:22:38Z.
This run (r87) ADOPTS r86's pre-registration verbatim in substance
(names/dates/base/slug changed, noted below) and executes it. Nothing in
this prereg was written after seeing any r87 result, because no r87
result exists yet. r83's baseline (8/28 week-1 transcripts naming, below)
stands as the comparison baseline.

Stale-lock recovery (this run's open): predecessor Lane B lock
(run_id 2026-10-31T12:55:40+00:00, r86) was present at this run's start
with registry heartbeat 13:22:38Z. Per the overlap guard that alone
would mean dead — but r86's worktree showed file activity at
13:55:19Z, minutes before this run, so this run did NOT delete the
lock on first sight. Instead it watched 14:00–14:10 UTC: no new r86
file activity, no process with cwd in the r86 tree, heartbeat still
13:22:38Z (48 min stale at 14:10), and the main tree — dirty at run
start with a single 0-byte `test-c.lock` (13:50, another agent's flap
probe) — came clean by ~14:07. Only then was the lock replaced
(14:11:43Z, this run's run_id) with "stale-lock recovery" noted here.
The r86 worktree and branch were NOT touched, NOT merged, NOT removed;
if its coordinator revives it owns that tree, not this run.

Base: local master 0fe9bc4ee (r86's base 4c92bbb04 + exactly one commit:
sim-sighit-a signature-hit measurement, scripts/evidence only, zero
src/js — no trajectory effect expected on grief/lately lines). No
push, no bump, no live check — ship loop owns those. Master moved
during this run's pre-flight (the sighit landing); this run's base is
the post-move tip, verified by `git log` before registration.

Slug deviation: body slug journey2-succession is unusable — the
registry still holds a done-merged journey2-succession entry and the
orphan journey2-succession/ directory still sits on disk, and r86's
slug is registered active by the predecessor run. Same class as
r83's journey2-succession-r83 and r86's journey2-succession-r86
deviations: this run uses journey2-succession-r87. Orphan dir and
r86 tree untouched.

Infrastructure note (pre-flight): the intermittent host EPERM write
flap blocked this run's worktree registration for ~5 min (first
attempt: checkout wrote 62340 files, then index reset failed; attempts
1–6 with /tmp-redirected logs returned rc=120 with 0-byte logs — the
redirect itself was flap-broken; attempt 7 succeeded 14:19 UTC).
Registration finally succeeded; heartbeat verified by read-back
(14:20:51Z). `git fetch origin master` fails on pre-existing broken
0-byte probe refs (refs/heads/__probe4__–__probe9__, sibling flap
probes, 13:47–14:10 UTC) — left untouched, not mine, not real
branches. Local master is 64 commits ahead of origin/master
(b6fe7ad58, the last shipped version), so no pull is needed; the
fetch failure changes nothing about the base. Pre-flight reaper
(14:11–14:14) removed lootabilities-w1's worktree (heartbeat 4.6h
stale; branch kept, 6 commits ahead) and LOUD-flagged the usual dirty
trees including r86 — none touched beyond the reaper's own action.

Instrument only, zero src/js changes. Same no-compete decision as
r54/r55/r56/r64/r67/r70/r72/r75/r79/r83/r86: tackle-succession owns
the succession inheritance build; this run measures master for it and
documents blanks, never fixes them here. Gating freeze (2026-10-27)
stands; no gate, deed-bar, standing, wave, or table-price change is
in scope. Perception law untouched: invites here are player-chosen;
no partner-selection change is in scope. No canon doc covers
succession/mantle (r54 prereg, unchanged; docs/CANON.md re-read this
run) — none invented here.

## The question

r83 proved the FIFTH handoff keeps the web intact (31/31) and that
late grief names the right bearer (d+64). r38 proved ambient social
echo in villager talk (M3, 3/4 GO). What nobody has scored is the
PLAYED surface in the first week: in the driven d+3/d+7
conversations — the ones a real player actually plays through with
partners — does anyone name the just-dead bearer?

Baseline (mechanical whole-word scan of r83's own week-1
transcripts, done as prep for r86, NOT as this run's result): 8/28
week-1 transcripts name the dead first bearer. Per seed: 26151 2/5
(Landon d+3 lately line; Kate d+7 mourning line), 26152 1/4 (Tomas
d+3, twice), 26153 1/5 (Sizwe d+7 lately line), 26154 1/5 (Adaeze d+7,
twice), 26155 0/5 (SILENCE — high-trust partners 90/91, incl. a
bond-partner at depth 2/v 64, never name Marta; the one ask:lately
draw on that seed returned Murkcap gossip, not grief), 26156 3/4.
So week-1 naming EXISTS but is uneven, and the lately/mourning pools
draw from broad pools (gossip, names, grief) — naming variance is
substantially DRAW VARIANCE, not a gate. This run scores the same
panel fresh on current master and asks:

1. WEEK1-NAMING: per seed, how many d+3/d+7 driven transcripts name
   the dead first bearer (sense-confirmed, whole-word, collisions
   flagged)? And per lately+mourning DRAW (the mechanism-level
   denominator), how often does a grief naming come out?
2. SILENCE REPRODUCTION: does 26155 repeat silent on current
   master? If yes, is it still draw variance (lately/mourning draws
   present but returning non-grief lines) or a new pattern?
3. MECHANISM INVENTORY: which mechanisms produce week-1 naming —
   lately-pool grief lines, mourning-event lines, react/more grief
   lines, other? Any naming outside those three is a mechanism
   inventory update.
4. VOICE (people check): full sense-read of ALL week-1 transcripts
   — do they still satisfy the conversation bar (NPC wants
   something, options engage/deflect, endings resolve/plant/owe),
   with no fabricated shared history, filler loops, or static menus?

## Instrument (r83 driver verbatim + NAMING scorer)

- Driver: scripts/journey-succession-r83-20261031.js cloned with
  ONLY names/date/mode changed (r83→r87, mode succession-r87,
  transcript/tele/stdout filenames r87). Verified by diff: no logic
  change. CONVO_DAYS unchanged [3, 7, 14, 30, 45, 53, 64]; week-1
  transcripts are the d+3/d+7 firings (top-2 by trust + bond-partner
  at d+3 when not already talked to).
- Naming scorer: scripts/analyze-journey-succession-r86-naming-20261031.js
  cloned with ONLY r86→r87 renames (tag default r87). This file
  survived intact in r86's tree (4767 bytes, verified non-empty);
  r86's main-analyzer copy did not (0 bytes, flap loss) and was NOT
  used — the main analyzer below is cloned from r83 in master.
- Main analyzer: scripts/analyze-journey-succession-r83-20261031.js
  cloned with ONLY r83→r87 renames, for the carried regression bars.
- Proof: scripts/test-journey-succession-r86-naming-20261031.js
  cloned with ONLY r86→r87 renames (driver path, EVID filenames,
  tag). (a) Scorer on r83's week-1 transcripts as fixtures expects
  8/28 transcripts naming, per-seed 2/5, 1/4, 1/5, 1/5, 0/5, 3/4.
  (b) Wrong-name control: the same fixtures scored against a dead
  name from another seed expect 0 naming (proves the scorer keys on
  the right name). (c) Driver rename smoke: r87 driver on proof
  seed 24998 (short config, all five kills forced) emits fifthDeath
  + d+3/d+7 transcripts. Proof scratch (seed 24998 evidence files)
  deleted by the test, r56 pattern.

## Seeds, regime, policy

Matched band 26151–26156 (same as r75/r79/r83 — first-death regimes
reproduced seed by seed on r83). CORRECTION (pre-play, carried from
r86): two src/js changes landed between r83's base 98aec3d59 and
r86's base — r85's bribery-investigate single-advance
(src/js/betrayal.js) and the deadfall-duty prototype
(src/js/game.js, src/js/perceive.js). Neither touches grief/
lately-pool lines directly, but both are trajectory-divergence
candidates, so the band is expected to reproduce APPROXIMATELY and
any divergence is itself a finding to be attributed (or not) to
those two changes — never assumed away. competent policy,
POST_DAYS=70, mature regime for all (EARLY_KILL_DAY=40):
26151–26153 CHAIN-FORCED (SECOND_KILL_DPLUS=20,
THIRD_KILL_DPLUS=20 measured from the second death day,
FOURTH_KILL_DPLUS=10 measured from the third death day,
FIFTH_KILL_DPLUS=10 measured from the fourth death day),
26154–26156 CONTROLS (no forced kills; organic chains, if any,
still recorded and tagged scriptedSecond=false / etc.).
Pilot FIRST (26151 forced + 26154 control, full config): the panel
expands only if WEEK1-READABLE holds on both pilot seeds (see
binding metrics). If the pilot's week-1 transcripts are missing or
unreadable, that is an instrument NO-GO, not a game verdict, and
the panel does not burn.

## Binding metrics (§14 — a miss is NO-GO, never re-scored)

- WEEK1-READABLE (binds): on every panel seed, a d+3/d+7 transcript
  file exists for every d+3/d+7 convoReads entry, and death.oldFirst
  resolves. A missing transcript or unresolvable dead name is a
  NO-GO on the instrument, not on the game.
- CHAIN5-READABLE (binds, r83 bar carried): on ≥2/3 chain-forced
  seeds, a full fifth handoff record (relPreDeath5 + relPost5 +
  fifthDeath with linOk + moOk + inh5 readable). A forced seed with
  no fifthDeath is a NO-GO on the instrument/regression
  investigation item, never silently dropped.
- CHAIN5-BONDS (binds, r83 bar carried): fifth-successor bonds
  survived == pre on all forced seeds with a fifth handoff, and
  affinity pre5 vs post5 identical (diff 0). A bond drop or affinity
  drift is a REGRESSION investigation item before any other verdict.
- DEATH-LEDGER (binds, r83 bar carried): every chain death
  cause-known (forced scripted flags true; organic causes honest
  and specific). A fallback to lineage cause is a regression item.
- CARRIED REGRESSION (binds, r83 bars unchanged): C1v3 0 missing;
  S1 0 missing bearerDeltaExact; MG2v2 0 violations; M1/M4 hold;
  M3v2b reported (bar ≥ 2 on ≥ 4/6 seeds; r83's miss was a no-chain
  control — the same allowance applies, stated here, not invented
  after seeing results).
- WEEK1-NAMING (reported, NOT scored as pass/fail — pre-declared
  interpretation, §14 honest): per-seed named/total transcripts +
  naming lines per lately+mourning draw + mechanism per naming line
  (lately / mourning / react-more / other, sense-confirmed).
  Interpretation declared NOW: naming on ≥5/6 seeds with ≥1 = the
  driven surface acknowledges fresh death consistently (variance is
  draw-level, as the baseline suggests); 0-naming on ≥2 seeds =
  variance finding — name the distinguishing condition (partner
  trust, bond, draw counts) or report it as unexplained variance
  for tackle-succession, never as a game bug claim (want-driven
  convos are by design; the finding is about acknowledgment
  presence). No threshold is moved after seeing results.
- INVITE SEAM (reported, r83 bars): invite outcomes spoken /
  deflected / other across driven transcripts; any sibling
  deflection joined to its SAYTRACE pool draw.

## What would count as an interesting finding

- 26155 repeats silent AND its lately/mourning draws return
  non-grief lines again (systematic draw-level silence, not noise).
- Naming vanishes or collapses on current master vs the r83
  baseline (trajectory drift — the r85 betrayal and deadfall
  changes are the first candidates; investigate before claiming a
  grief-pool change).
- A naming mechanism outside lately/mourning/react-more (inventory
  update).
- A week-1 transcript that fails the conversation bar (fabricated
  history, filler loop, static menu) — a people-check failure,
  reported as such.
- A fifth-handoff bond drop or affinity drift (regression — the
  carried bars exist to catch exactly this).

## Horizon

70 days (matched to r83: fifth kill ~d+61 since first death with
~9 days of fifth-bearer life). Death-aware stop: a dead/scattered
village stops simulating (+10d tail max). Never tick a dead village
to fill the leg. Week-1 transcripts land in the first 10 days after
the first death regardless of the long window.

## Telemetry

Same baseline + metrics as r83:
node scripts/telemetry-check.js --baseline
.../telemetry-baselines/succession.json --current
'evidence/2026-10-31/journey-succession-r87-tele-*.json' --metrics
deaths.bearer,census.alive,census.fallen,census.integrationStage,week2.deadBearerMentions.
Forced-chain panel sums must NOT roll over the unforced baseline
(r83 precedent — regime difference, not drift). Any LOUD line is a
same-run investigation item before any baseline decision.

## Metric review (carried)

- r83: POST_DAYS 55 → 70 is an instrument change, not a game
  change: window-length-sensitive counts are compared to r79 only
  qualitatively, never as regressions on raw counts. Same applies
  r83 → r87 (same 70-day window, so raw-count comparison IS valid
  between r83 and r87; comparison to pre-r83 windows stays
  qualitative).
- FIFTH-KILL DPLUS HAS FOUR HONEST BASES (dplus since fourth /
  third / second / first death). No metric in this run reads "d+10"
  or "d+61" without naming its base.
- POLICY FALLBACKS ARE NOT DRIVEN DEFLECTIONS. The SEAM metric
  counts driven transcripts only.
- Phantom reporting quotes per-dead-bearer counts, never pooled
  (carried for the CHAIN5 section).
- Telemetry baseline (succession.json) is an unforced-panel
  baseline; this forced-chain panel must not roll over it. A
  forced-chain baseline, if wanted, is a separate decision for a
  future run, not a silent roll here.
- NEW (r86, carried): week-1 naming's denominator matters.
  Transcript counts alone understate the mechanism: a seed with 0
  naming but 0 lately/mourning draws is uninformative, while 0
  naming across several draws is a real silence. Both denominators
  are reported; neither is substituted for the other mid-run.
- NEW (r87): r86 never ran, so there is no r86 result to compare
  against and no r86 metric to revise. Its prereg is adopted, not
  its (nonexistent) results. The r83→r87 comparison is the valid
  raw-count comparison (same 70-day window, same seeds, same
  regimes); the only base change since r83 that touches src/js is
  r85 + deadfall (carried above), plus one scripts/evidence-only
  commit (sighit) that cannot move trajectories.
