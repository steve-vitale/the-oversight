# Journey succession r91 — NAMING-ANY + CHAIN5-CARRY ON CURRENT MASTER (lane B, pre-registration 2026-11-01, written before any play)

Leg 7 (succession). Rotation-b read 7 at run start → write 4 at closeout
(endgame next), and VERIFY the file reads 4 afterwards (rotation writes
have repeatedly failed to stick in recent Lane B runs; the file is the
authority, not this note's claim).

Run number basis: last numbered Lane B run is r90 (crisis, landed
2026-11-01 — closeout commit 1f9ee7549 on master, panel commit
c3eb9a19c; its tree released and removed, its branch deleted).
This run is r91.

Stale-lock recovery (at this run's start): the lock file held
2026-11-01T04:58:35Z — the r90 recovery run's own lock, whose closeout
claims deletion, but the file persisted. That run is finished, not
live: its commits are on master, it has no registry entry under that
run_id, no journey2 process was running, and its r91 tree was already
released. Per the loop body the previous run was DEAD: lock deleted,
new lock 2026-11-01T06:01:37Z written, recovery noted here. The held
trees flagged in r90's closeout (journey2-succession,
journey2-succession-r86, journey2-crisis-r90, all with uncommitted
changes) are NOT touched by this run — main-session inspection only.

Slug deviation, documented: the body slug journey2-succession is
unusable — the registry still holds a done-merged journey2-succession
entry and the orphan directory still sits on disk (same class as
r83/r87/r89). This run uses journey2-succession-r91. Registration
was slow (the hard reset over the multi-GB evidence tree took
~5 minutes) but completed clean: worktree status empty, heartbeat
read back from the registry and verified fresh.

Base: local master 3d0958360 (sim-contactfinish-a confirm, plus r90's
crisis transcript fix — the transcript fix touches transcript filing,
which is exactly why naming is re-measured on this master rather
than assumed carried). No push, no bump, no live check — ship loop
owns those. Gating freeze (2026-10-27) stands; no gate, deed-bar,
standing, wave, or table-price change is in scope. Perception law
untouched: invites here are player-chosen; no partner-selection
change is in scope. No canon doc covers succession/mantle
(CANON.md grep for succession/mantle is empty; r54 prereg, unchanged)
— none invented here. Instrument only, zero src/js changes (same
no-compete decision as r54/r55/r56/r64/r67/r70/r72/r75/r79/r83/r87/
r89: tackle-succession owns the succession inheritance build; this
run measures master for it and documents blanks, never fixes them
here).

## The question

r89 left one concrete proposal: report "grieves any recent dead"
beside first-bearer naming, because its seed 27154 grieved Jorge
(the second bearer, dead inside week 1) while scoring 0 on first-
bearer naming at d+7. This run implements that revision and tests
it, and carries CHAIN5 forward onto the new master:

1. NAMING-ANY: with the revised scorer (a transcript counts if it
   names the first bearer OR any person dead within 14 days before
   the transcript's day — first bearer from death.day, later
   bearers from chainDeaths detectedDay), does every pilot seed
   show grief acknowledgment? Is any seed silent under BOTH
   metrics, or does any-recent rescue every apparent silence?
2. CHAIN5-CARRY: on the new master, does the fifth handoff still
   record fully, with fifth-successor bonds survived == pre and
   affinity diff 0?
3. SENT-VANISH (descriptive): which sentimental item ids vanish at
   each handoff on fresh seeds — same class as r83/r87/r89, or a
   new class?
4. VOICE (people check): full sense-read of ALL pilot week-1
   transcripts — conversation bar (NPC wants something, options
   engage/deflect, endings resolve/plant/owe), no fabricated shared
   history, no filler loops, no static menus.

## Instrument (r89 files + renames + one stated scorer change)

- Driver: scripts/journey-succession-r89-20261031.js cloned with
  ONLY r89→r91 renames, date 20261031→20261101, EVID dir
  2026-10-31→2026-11-01, mode succession-r89→succession-r91.
  CONVO_DAYS unchanged [3, 7, 14, 30, 45, 53, 64].
- Naming scorer: r89 scorer cloned with ONLY the renames above
  PLUS the any-recent addition: scoreSeed now also returns
  recentDead (first bearer + chain deaths with death days),
  per-transcript anyRecent (whole-word hit on any recent-dead
  first name with transcript day minus death day in [0,14]),
  namedAny/total, anyLines, and pooled any counts. Existing
  first-bearer fields are UNCHANGED, so the r83/r89 fixture
  expectations still bind.
- Main analyzer: r89 analyzer cloned with ONLY renames, EVID dir,
  SEEDS 27151–27156 → 28151–28154, forced list
  [27151,27152,27153] → [28151,28152] (both occurrences).
- Proof: r89 proof test cloned with ONLY renames, plus (d):
  scorer on r89's own week-1 fixtures (tag r89,
  evidence/2026-10-31) must show namedAny >= named on every seed,
  and seed 27154 must gain at least one any-recent transcript
  over its first-bearer count (the Jorge mechanism, sense-checked
  by reading the hit lines, not just counted). (a)–(c) carried
  unchanged (r83 fixtures 8/28, wrong-name control 0, driver smoke
  on proof seed 24998 with fifthDeath + actual-day transcript
  files). Proof scratch deleted by the test, r56 pattern.
- Diff verification: strip r89/r91, old/new dates, old/new seeds,
  and the scorer's any-recent block; the remaining files must be
  identical. Any other diff is a stop-and-explain item.

## Seeds, regime, policy

Fresh band 28151–28154 (no prior Lane B succession use; +1000
offset from the r89 band, same shape). Competent policy,
POST_DAYS=70, mature regime for all (EARLY_KILL_DAY=40):
28151–28152 CHAIN-FORCED (SECOND_KILL_DPLUS=20,
THIRD_KILL_DPLUS=20 measured from the second death day,
FOURTH_KILL_DPLUS=10 measured from the third death day,
FIFTH_KILL_DPLUS=10 measured from the fourth death day),
28153–28154 CONTROLS (no forced kills; organic chains, if any,
still recorded and tagged scriptedSecond=false / etc.).

Pilot-first (§9–12): these 4 seeds ARE the pilot. Expand to 6
(28155 forced, 28156 control, same config) ONLY if the pilot
shows something interesting: a seed silent under BOTH naming
metrics, a bond drop or affinity drift, a new vanish class, or
a naming-any vs first-bearer disagreement NOT explained by the
known second-death mechanism. Otherwise document the pilot and
stop — do not burn a full panel on a clean carry (r90 precedent).

## Binding metrics (§14 — a miss is NO-GO, never re-scored)

- WEEK1-READABLE (binds): on every panel seed, a d+3/d+7
  transcript file exists for every d+3/d+7 convoReads entry, and
  death.oldFirst resolves. A missing transcript or unresolvable
  dead name is a NO-GO on the instrument, not on the game.
- CHAIN5-READABLE (binds, r89 bar adapted to a 2-forced pilot):
  on ≥1/2 chain-forced seeds, a full fifth handoff record
  (relPreDeath5 + relPost5 + fifthDeath with linOk + moOk +
  inh5 readable). Any forced seed without a fifth must have a
  cause-known explanation (e.g. game over before the due day,
  r89's 27152 class) — never silently dropped. If the panel
  expands to 3 forced seeds, the bar reverts to r89's ≥2/3.
- CHAIN5-BONDS (binds, r89 bar carried): fifth-successor bonds
  survived == pre on all forced seeds with a fifth handoff, and
  affinity pre5 vs post5 identical (diff 0). A bond drop or
  affinity drift is a REGRESSION investigation item before any
  other verdict.
- DEATH-LEDGER (binds, r89 bar carried): every chain death
  cause-known (forced scripted flags true; organic causes honest
  and specific). A fallback to lineage cause is a regression item.
- CARRIED REGRESSION (binds, r89 bars adapted to 4 seeds):
  C1v3 0 missing; S1 0 missing bearerDeltaExact; MG2v2 0
  violations (r89's stated exception carried: old-mg2 false on
  a starving game-over seed is collapse, not a meal-line
  regression); M1/M4 hold; M3v2b ≥2 on ≥3/4 seeds (r89's ≥4/6
  allowance scaled to the pilot).
- NAMING-ANY (reported, pre-declared interpretation, §14 honest):
  per-seed first-bearer named/total AND any-recent namedAny/total
  + naming lines per lately+mourning draw. Interpretation
  declared NOW: a seed 0 on first-bearer but >0 on any-recent is
  the second-death mechanism, not silence. A seed 0 on BOTH with
  ≥2 lately+mourning draws is a real silence investigation item
  (name the distinguishing condition or report unexplained
  variance for tackle-succession, never a game-bug claim on
  counts alone). Pooled rates are descriptive against r89's
  17/27 (63%) first-bearer; no pass/fail threshold is set on
  either pooled rate (draw variance), EXCEPT a pooled 0 on both
  metrics would be a regression investigation item. No threshold
  is moved after seeing results.
- INVITE SEAM (reported, r89 bars): invite outcomes spoken /
  deflected / other across driven transcripts; any sibling
  deflection joined to its SAYTRACE pool draw.
- PHANTOM5 + INH5 (descriptive, via main analyzer): per dead
  bearer (original + successors 1–4), never pooled across them;
  fifth successor's own pre-death NPC record vs post-handoff
  scholar state.

## Telemetry deviation check

After writing evidence, telemetry-check.js against
telemetry-baselines/succession.json with metrics
deaths.bearer, census.alive, census.fallen,
census.integrationStage, week2.deadBearerMentions. The forced
panel must NOT roll the unforced baseline (r89 precedent) — any
LOUD line gets a verdict (explained vs real bug) before any
baseline decision, and the baseline stays untouched unless a
verdict explicitly justifies rolling it.
