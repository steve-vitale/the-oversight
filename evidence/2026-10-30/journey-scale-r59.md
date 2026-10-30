# journey-scale r59 — Lane A, leg 3 SCALE (2026-10-30)

**Run id:** oversight-playtest-loop-20261030T2215Z (scheduled 16:45 CDT; lock created 22:15:29Z).
Rotation read 3 → leg 3 SCALE; write 3→0 at closeout on success.
Note on the repeated leg: r57 and r58 both ran scale, and the rotation
file still read 3 at this run's start (mtime 22:08Z, after r58's
closeout note). This run takes scale again — r58 left a scale question
explicitly open (the gear-fetch decomposition, answered here as Q2),
so staying on scale is the queue-correct move, not a silent repeat.
**Base:** master@359a384cc at worktree creation (Loop B closeout
1928Z). **Zero src/js changed by this run** — measurement plus one
driver + one analyzer (labels/EVIDIR only), and evidence. The Q2
fetch patch was temporary and reverted (see Q2); no src/js survives
in this run's change set.
**Pre-register:** evidence/2026-10-30/journey-scale-r59-prereg.md
(written and committed before any seed ran).
**Gating freeze honored; TACKLE ALL not claimed; perception law honored**
(no list-fed work; driver reads only engine-exposed state, as before).

## Infrastructure notes (loud, first)
- **No lock contention at start:** no playtest-loop.lock existed; this run
  created it and deletes it at closeout.
- **Heartbeat:** 10-min background loop plus manual heartbeat at
  registration; registry heartbeat verified landed after loop start
  (22:19:50Z) and re-verified fresh during the run (22:33, 22:48,
  23:05, 23:15, 23:25).
- **Registry-lock queue (twice, loud, not this run's fault):** the
  registry lock is held across slow git worktree creation by other
  lanes' register scripts, so heartbeats queue behind it — once for
  ~7 min (loop heartbeat of 22:41 landed 22:48, behind
  sim-fedexile-b's register) and once for ~10 min (22:58 heartbeat
  landed 23:05, behind sim-kcalshort-b's register). The 15-min
  staleness threshold was never breached (worst age ~14 min at
  22:47, then the queue cleared), and the reaper queues on the same
  lock, so it cannot act on a heartbeat that is merely queued. A
  redundant manual heartbeat was started during the first queue and
  killed by this run to reduce contention — the loop heartbeat is
  the only one that needs to exist.
- **VM/container restart 23:26Z (loud):** uptime shows the box
  restarted at 23:26Z (systemd start 23:26, up 4 min at 23:29). It
  killed the first `check.js --quick` run mid-stream at 166/290
  scripts (160 dots + 6 F markers in the log, no summary) and killed
  the heartbeat loop, and wiped /tmp (the old heartbeat log is
  gone). The registry heartbeat at 23:25:40Z was fresh enough that
  the reaper (running again at 23:29) left the tree alone; the
  worktree, evidence, and prereg commit all survived — only the
  suite run and the /tmp log were lost. Recovery: heartbeat loop
  restarted at 23:30 with its log in goal hidden_files
  (journey-scale-r59-heartbeat.log, survives /tmp wipes), verified
  landed 23:30:32Z; suite re-run from scratch into
  journey-scale-r59-checkquick-rerun.log. The interrupted log is
  kept as evidence of the restart kill, not deleted.
- **Safe-commit index clobber struck on the prereg commit**, same
  class as r56/r57/r58: after a correct private-index commit, the
  worktree's main index showed all 3 committed files
  staged-as-deleted plus untracked. Repaired via HEAD-blob cacheinfo
  (`git update-index --add --cacheinfo`), then verified: `git
  status` empty, `git diff HEAD` empty, worktree hash-object ==
  HEAD blob for all 3 files. The commit itself was correct.
- **Driver-copy discipline (r57 lesson) kept:** copies made with
  absolute worktree paths, verified 577 lines non-empty, `node
  --check` clean, zero remaining r58 labels in driver or analyzer.

## Verdicts (binding questions, answered)

### 1. QUAD-CURRENT-R59: FULL PARITY WITH r58 — 4/4 seeds, captures byte-identical
Same 4 seeds, control picker, policy scalecourt-nogate UNCHANGED,
DAYcap 180. Pilot gate passed (85001 ran clean, pilgrimages 4, not 0).

| seed | r58 | r59 | moved |
|---|---|---|---|
| 85001 | d135, died 0/0, GLOBAL nat77 glob92 court76, lesser arc4, deaths44, cov34/40/32, pilg4, fusion T, abil iron_stomach | IDENTICAL on every scalar | none |
| 85002 | d132, died 0/0, REGIONAL, lesser arc4, deaths62, cov 2, pilg54, fusion T, abil bloodhound/cornered_rat | IDENTICAL | none |
| 85003 | d134, died 1/1, regional, lesser arc4, deaths44, cov30/34/34, pilg6, fusion F, abil iron_stomach | IDENTICAL | none |
| 85004 | d178, died 0/0, regional nat94 glob117 court93, seat NONE arc3, deaths47, cov58/31/22, pilg5, fusion F, abil green_whisper/dowsing/echo_location | IDENTICAL | none |

Capture diffs vs r58: 0 lines on all four seeds. Descriptive quad
count, unchanged from r58: alive at end 0/4, global-final 1/4,
lesser seat waiting 3/4, full seat 0/4, wave 5 reached 0/4 (maxWave
4 on all four).
**Attribution:** the r58→r59 range's only src/js landings are
titanexcl (exclude titans from the castMonster wanderer-cast pool)
and sickstale (sick records die with roster membership; tick skips
dead/off-roster records). On this quad they move NOTHING — no
titan-cast line and no sick-tick line appears in any divergence,
because there is no divergence at all. That does NOT clear either
landing in general (a titan leak or a stale-sick hit could still
matter on other seeds); it says neither fired on these four
trajectories. The r58 fate is the current base's fate, stable
across this range.

### 2. FETCH-DECOMPOSITION (r58 open item): FETCHES ARE IMPLICATED ON THIS QUAD
Same 4 seeds, same policy, DAYcap 180, separate EVIDIR, driver
identical except labels/EVIDIR — plus a temporary worktree-only
patch neutralising the two daily fetch calls in villagerBuildDay
(vesselStashFetch + vesselArmorFetch). Patch applied only for this
arm, reverted with `git checkout -- src/js/villager-build.js`
immediately after the arm, verified: `git diff -- src/js/` 0
lines, no R59-NOFETCH marker remains in the file. The patch was
never committed and never lands; it is an instrument, not a fix.
Pilot gate passed (85001: pilgrimages 4, not 0).
First-divergence audit nofetch-vs-current, 4/4 seeds: the first
differing lines are EXACTLY the absent day-1 fetch lines (85001:
Sling + Deep Earth Boots; 85002: Crossbow + Denim Jacket; 85003:
Crowbar + Flannel Shirt; 85004: Hunting spear + Work Gloves),
followed on 85001/85002/85003/85004 by the absent Equipped lines
— so every nofetch difference after day 1 is attributable to the
patch, not to arm drift.

| seed | current (r59 = r58) | nofetch | moved |
|---|---|---|---|
| 85001 | d135, died 0/0, GLOBAL lesser arc4, deaths44, cov34/40/32, pilg4, fusion T, abil iron_stomach | d160, ALIVE 1/1, GLOBAL nat155 glob156 court102, lesser arc4, deaths42, cov54/43/51, pilg4, fusion T, abil iron_stomach/cornered_rat/lucky_rock/pocket_sand/switcheroo | lives 25d longer, alive at end |
| 85002 | d132, died 0/0, REGIONAL lesser arc4, deaths62, cov 2, pilg54, fusion T | d181, NOT OVER, ALIVE 7/7, pantry 5,581, GLOBAL nat104 glob105 court103, lesser arc4, deaths45, cov79/96/59, pilg10, fusion T, abil beast_calm/echo_location/war_cry/green_whisper/turncoat/last_rites | village that died at regional now survives to the cap at global |
| 85003 | d134, died 1/1, regional lesser arc4, deaths44, cov30/34/34, pilg6, fusion F | d126, died 1/1, regional lesser arc4, deaths43, cov21/13/19, pilg8, fusion T | essentially unchanged (8d earlier, same ending class) |
| 85004 | d178, died 0/0, regional nat94 glob117 court93, seat NONE arc3, deaths47, cov58/31/22, pilg5, fusion F | d181, NOT OVER, ALIVE 8/8, pantry 14,347, REGIONAL, seat NONE arc3, deaths35, cov NONE, pilg13, fusion T | survives to the cap, still no seat |

Descriptive counts, prereg classification: current alive 0/4 →
nofetch alive 3/4; current global-final 1/4 → nofetch 2/4; lesser
waiting 3/4 → 3/4; full seat 0/4 → 0/4; wave 5 reached 0/4 → 0/4
(census maxWave 4 on all four in both arms). By the prereg rule,
nofetch moves the counts back toward r57 (alive 2/4, global 2/4)
relative to current — **fetches are implicated as harming the long
climb on this quad**. 85002's climb timing is a curiosity worth
naming, not a claim: nofetch nationalDay 104 / globalDay 105 /
firstCourt 103 are EXACTLY r57's 85002 climb days, even though the
ending differs (r57: d178 alive 8/8 pantry 18,308; nofetch: d181
alive 7/7 pantry 5,581, different ability set). 85001's nofetch
wantwatch detail carries w5=1 where current carries w5=0, while
census maxWave stays 4 in both arms — the w5 detail field is not
the maxWave metric, so the wave-5 verdict stands 0/4, and the
detail discrepancy is an open observation, not a finding.
**What this does NOT decide:** 4 seeds cannot convict a mechanic
in general, and removing the fetches is NOT the proposed landing —
the fetches were landed because stashed gear never reached the
vessel's hands, and that problem is real. The honest statement is
narrower: on this quad, the daily own-stash fetch changes four
fates, and on three of them the change is for the worse (two
villages that survive without it die with it; one dies 25 days
earlier). Why a fetched weapon/armor hurts the long climb — the
mechanism, e.g. which fetched item, fight, or pantry/attachment
chain turns the trajectory — is NOT established by this arm; it
needs a mechanism trace (fetched-item → attachment/enhancement →
fight/pantry chain), and any fix needs its own proof design. The
candidate for the next run is a wider-band nofetch re-test (more
seeds) plus that trace — not a fetch removal landing. The
r57→r58 range's other landings (hidearmor, contestdeath) are NOT
cleared by this arm either: they were present in both arms here, so
their contribution to the r57→r58 move is still unmeasured; what
is measured is that fetches alone move the current base's fates
this much.

### 3. PEOPLE CHECK (sense law — all 8 quad transcripts read in full)
6 of 8 fully real, 2 blemishes (same classes as r58, not new breaks).
No fabricated shared history, no static menus, no filler loops
except the Meera tail noted below.
- **85001 d90 Irving (displacement class, reproduced):** goal-thread
  opener ("I keep their faces in my head like photographs"),
  pending betrayal invitation owns the turn-0 menu, seeded
  ask_favor stays stage 0 at pre-close. This is r57/r58's known
  displacement, now known one-sitting-only (r58 Q2) — not a new bug.
- **85001 d120 Irving:** a fresh ask_favor surfaces ("Never mind
  the creek water run — we got it handled… have you got anything
  to spare? My hands shake"), commits ("I'll come back to help"),
  stage 1→3, ends resolved ("I won't forget who fed me").
- **85002 d120 Sanne:** seeded favor surfaces ("About the food I
  needed — I hate to ask twice, but it's still open"), commits,
  stage 2→3, ends resolved.
- **85002 d90 Jian:** legacy goal thread, coherent throughout
  ("I don't need a statue. I need one good story that outlives
  me"), a field lesson ("Saw things with too many joints. Give
  them room"), ends planting ("Someday kids will sit by a fire
  and hear what I did").
- **85003 d120 Thabo (blemish, r58 class recurs):** withdrawal-only
  talk — opener withdraws the want ("Never mind the sickness I'm
  fighting — we got it handled"), the only moves are goon/subject/
  leave, and goon returns a generic line ("You can feel the
  history in how they greet you"). Not a softlock, but the want
  never engages; the closing line jokes about it ("That was almost
  a conversation"). Thin, not broken.
- **85003 d90 Henry:** belief question engages honestly ("Do you
  believe in anything? … Just... be straight with me"), the
  player's answer lands ("That's not naive. That's load-bearing"),
  Henry's breakfast belief resolves it ("I believe in breakfast.
  In people showing up. Small, provable things").
- **85004 d120 Meera (partial blemish):** grief opening is real
  ("Every laugh out there feels wrong today. Then I feel wrong
  for thinking it"), comfort engages and resolves ("I'll get
  there. Just needed a minute where I didn't have to be fine") —
  but the gossip tail drifts generic ("Word is you told it
  straight", "Word is you know what you're doing out there").
  Opening real, tail filler.
- **85004 d90 Marisol:** favor engages with specific place and
  time ("Where the muscadine grapes grows thick, at sunup. Pack
  and knife. We travel light"), commits, stage 1→3. The leg's best
  example of a want with a concrete plan.
**Village assessment, plain words:** with fetches, all four
villages end in the same place — dead or down to one person, the
lesser seat waiting on three, the full seat never priced, wave 5
never met, deaths dominated by combat and the wild (85002: 28
combat + 15 villager-combat of 62 deaths; 85004: 23 villager-
combat of 47). Without fetches, two of those villages are still
alive and thriving at the day-180 cap with full pantries (85002:
7/7, 5,581 kcal; 85004: 8/8, 14,347 kcal) — the climb's machinery
works, but something in the fetched-gear days is costing villages
their people. The table still waits: even the thriving nofetch
villages sit at lesser (85002) or no seat at all (85004, arc 3,
foodDeeds false in both arms), so the full seat stays unwon in
every arm of this run.

## FUN / REACHABLE / WINNABLE (scale leg, plain words)
- REACHABLE: the climb's machinery still fires in both arms
  (courts, covenants, pilgrimages, priced table voicing on 3/4
  seeds in each arm) — and the nofetch arm shows the climb is
  reachable-to-survival, not just reachable-to-a-waiting-seat.
  The fetch question is now the leg's sharpest reachability
  question: does the first-day gear help a real player, or cost
  them the village?
- FUN: unchanged in kind — the table voicing and the seed loop's
  memory are still the leg's best writing, and Marisol's muscadine
  plan plus Henry's breakfast belief are the kind of specific,
  human talk that carries a long run. The thin spots are Thabo's
  withdrawal-only talk and Meera's gossip tail — blemishes, not
  breaks.
- WINNABLE: not shown, again. The lesser seat waits on 3/4 seeds
  in both arms; the full seat stays unwon (w5 0); but the nofetch
  arm moves winnability's precondition — villages alive at the
  cap — from 0/4 to 3/4, which is the first movement in that
  direction since r57. The full seat itself still needs a
  wave-5-meeting, table-pricing story that no arm here tells.

## TABLE-APPROACH (standing, report-only)
Current quad, end state: 85001 lesser arc4 waiting+announced
(w1 13, w2 7, w3 7, w4 4, w5 0, foodDeeds true); 85002 lesser arc4
waiting+announced (w1 17, w2 13, w3 4, w4 2→3, foodDeeds true);
85003 lesser arc4 waiting+announced (w1 16, w2 8, w3 5, w4 2,
foodDeeds true); 85004 seat NONE arc3, never waiting/announced
(w1 17, w2 6, w3 4, w4 3, foodDeeds FALSE — the only seed without
food deeds, in both arms). Nofetch quad: same seat/arc pattern
(lesser, lesser, lesser, none), with 85001's w5 detail 1 (see Q2
curiosity note) and 85004 still foodDeeds false. Continuity with
r58 holds exactly on the current quad; the seat story does not
move with the fetch patch, even though survival does.

## BARRIER PIN (standing instrument, re-confirmed)
sayOncePerFight calls per seed (current quad): 85001: 2, 85002: 3,
85003: 2, 85004: 2. Every logged call carries a refusal narration
("Not in the middle of a fight." / "Not mid-fight — finish it
first.") — guard-holds, not guard-broken, in r55 form. The pin
stands; it does not overturn.

## Metric review
- Census scalars unchanged from r51's list (19 scalars + covenant
  trusts), plus the fusion/ability columns (reads, not scores).
- r58's PARITY-BROKEN verdict is EXTENDED, not re-scored: r59
  shows full parity with r58 under the same fixed rule, so the
  r58 fate is stable across the titanexcl/sickstale range. No
  scalar was re-scored against a friendlier metric; the nofetch
  verdict used the prereg count rule (alive/global/lesser/full/
  wave-5 counts vs both current and r57) exactly as written.
- r58's Irving-displacement answer STANDS (one-sitting-only; the
  d90 displacement transcript recurs here, and the d120 favor
  commits as r58's Q2 predicted). r58's subject-menu correction
  STANDS unre-tested (no subject-first arm here). r58's Boris
  nod-loop stands UNRE-TESTED (no Boris transcript arose). r56's
  chooseAbility-unguarded note stands (no duplicate ability id in
  any control seed's abilitiesHeld — all 4 lists are distinct;
  nofetch lists are also distinct). r52's barrier pin stands in
  its r55 form (see above).
- No metric was re-scored mid-run. One metric observation for the
  NEXT run: the table detail's w5 field and census maxWave disagree
  on nofetch 85001 (w5=1, maxWave=4) — the next run should define
  which field counts as "wave 5 reached" before scoring it, rather
  than discovering the split mid-run.

## Telemetry deviation check (step 14 — NOT rolled)
New census baseline seeded from r58's quad aggregates BEFORE this
run's seeds (hidden_files/telemetry-baselines/scale-census.json:
census.day=579, census.popAlive=1, census.pantryKcal=0,
census.maxWave=16, census.pilgrimages=69; scale.json NOT
overwritten, per r58's proposal):
`node scripts/telemetry-check.js --baseline .../scale-census.json
--current 'evidence/2026-10-30/journey-scale-r59/journey-scale-r59-trust-*.json'
--metrics census.day,census.popAlive,census.pantryKcal,census.maxWave,census.pilgrimages`
→ quiet (4 files, 5 metrics, no large deviations), exit 0. Expected:
the current quad is scalar-identical to r58, the baseline's source.
Baseline NOT rolled on this run's numbers (prereg said so; rolling
an identical quad would be a no-op anyway).

## Tests
- `node --check` clean on the r59 driver (at creation) and the r59
  analyzer (at creation).
- `node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
  first run KILLED by the 23:26Z VM restart at 166/290 scripts
  (160 dots + 6 F markers, no summary; log kept at
  hidden_files/journey-scale-r59-checkquick.log). Re-run from
  scratch: **284 passed, 6 failed in 975s** (290 scripts, exit 1
  from the failures). Output logged whole to
  hidden_files/journey-scale-r59-checkquick-rerun.log, not piped
  through tail.
- The 6 are EXACTLY r57/r58's 6 pre-existing assertion-failure
  scripts, same families, same signatures —
  measurement-proof-update, measurement-workflow,
  mobile-combat-cadence, occupation-panels, phone-frame-proof, and
  the establishment-r20 family
  (test-establishment-r20-fixes-20261020.js: "NEW: next day voices
  once more (gate resets daily): expected 2, got 1"). No quick-list
  test imports this run's scripts (the failing scripts are all
  godpath/phase-0 and establishment-r20, none of them the r59
  driver or analyzer), and this run's change set is driver +
  analyzer + evidence with ZERO src/js, so it cannot have caused
  any of the 6.
- Suite side effect, discarded not committed: the suite modified
  docs/ONTOLOGY.md (one Provides line gaining vesselArmorFetch(),
  the armorfetch landing's entry — the same side effect r58 saw).
  That is another landing's documentation, not this run's work —
  reverted with `git checkout -- docs/ONTOLOGY.md` before
  committing, so the commit holds only this run's files.
- Zero src/js changes, so no game-code regression surface exists
  in this run's change set; the suite above is the standing proof,
  not a response to a suspected regression.
Verdict: zero regressions attributable to this run.

## Landing (filled at closeout)
Master at worktree creation: 359a384cc. Master did NOT move during
the run (verified 359a384cc still HEAD at closeout) — no rebase
needed. Proof re-run after the suite: `node --check` on driver +
analyzer still clean; measured files untouched by the suite (only
docs/ONTOLOGY.md was suite-touched, reverted above).
Merged locally, pending ship (no bump, no push, no live verify —
ship loop owns those).

## CHECK-QUICK (filled at closeout)
`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-playtest`:
**284 passed, 6 failed in 975s** (re-run after the 23:26Z VM
restart killed the first run at 166/290).
The 6 are EXACTLY r57/r58's 6 pre-existing assertion-failure scripts,
same families, same signatures — measurement-proof-update,
measurement-workflow, mobile-combat-cadence, occupation-panels,
phone-frame-proof, and the establishment-r20 family.
Verdict: zero regressions attributable to this run.
Worktree status after the suite: only this run's entries (run note
+ two evidence dirs) — the one suite-touched file
(docs/ONTOLOGY.md) was reverted, not committed.

## TELEMETRY (filled at closeout)
Quiet, no LOUD lines (see Telemetry section above). Baseline NOT rolled.
