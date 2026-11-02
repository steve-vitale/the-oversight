# sim-scale-onramp-round-1424 — Loop A 20261102: roster-return mechanism + national-flag audit

Run: fleshout-loop-a-20261102T1424Z, axis scale-onramp. Claim written
before any sims; retired to .DEAD at closeout. Sibling Loop B live on
food-economy throughout (1345Z claim: vetobudget-confirm +
homeward-substrate — NOT touched; B's vetobudget evidence merged to
master mid-run, its tree closed by B itself). Zero src/js changes in
either arm. Merged locally, pending ship (NOT pushed, NOT bumped,
NOT live-verified — ship loop owns deploys).

Pre-flight: main tree clean at 479313589, disk 24%, reaper removed
nothing (all active/dirty sibling trees correctly refused). Master
moved under this run (sibling builds: loot taper a71ed0006, monster
commitment de884988a, journey social r110 adb8017c1, B vetobudget
evidence); both worker branches were rebased clean in their own
worktrees onto the new tip before merging (no rebase quirk this
time). Both arm proof suites re-run green on merged master
(rosterreturn 29/29, natflag 19/19).

## Arm 1 — sim-rosterreturn-a: DIAG-GO (the dead villager returns by re-applying)

Commits: b8d6d0591 (prereg, written and committed BEFORE any judged
sim), 259d4ae26 (results; rebased hashes). Proof:
scripts/test-rosterreturn-a.js, 29/29 green. Evidence:
evidence/2026-11-02/sim-rosterreturn-a.md (+ prereg). Instrument:
scripts/rosterreturn-driver-20261102.js. DIAGNOSIS ONLY — no
game-code change.

The mechanism, end to end on seed 97330: a dead villager re-applies
because the applicant generator never excludes the dead.
1. d106 death — ledger.js playerDeath → betrayal.js
   removeVillager('nora_wilson','killed'): roster drops her, trust
   entry survives (90), rec.dead=true set on her data record.
2. d109 re-application — membership.js genApplicant() draws her
   from src/data/background_survivors.json (entry nora_wilson); its
   `used` set is built from current roster + pending applications
   only — no dead/fallen check. Same day, villageAutoRecruit
   auto-accepts (roster 5 < 8, thin-village rule); arrivals entry
   arriveDay 111.
3. d111 endDay arrival — membership.js arrivalTick pushes her id
   appended last (rosterIndex 5). The trust guard doesn't fire
   (90 ≠ null), and ensureRosterPerson returns her existing record
   without clearing dead. At push: trust 90, vpDead true, isMember
   false.
4. d112 candidacy — betrayal.js npcIds() = roster minus bearer with
   NO dead filter, so she wins the mantle on sort-time trust (91 vs
   Omar 90) and rules as bearer with vpDead still true, then falls
   d122.

Reproduction: the 97330 death chain reproduces bearerorder exactly
(10 deaths, same days/names — the instrument moved nothing);
exactly one roster reappearance in the run (Nora, push d111, first
visible on the d112 snapshot). 97338 generality check: chain
reproduces, zero reappearances of any id. Timing correction for
the record: the push is d111 endDay; bearerorder's "d112" is the
snapshot day. Bearerorder's "no walks-in line captured" is
explained, not contradicted: that driver's saved fields filtered
walk-in lines out and never persisted the full say log.

Answers, plainly: (1) The bearerorder verdict is UNAFFECTED — at
choice time Nora was a legitimate candidate by the engine's own
list; only the input is newly understood (the roster can hold a
dead-flagged villager). (2) Do NOT build on roster membership as
"alive" until this is closed — use vpOf().dead / isMember() (which
already checks it). The fix is small and nameable (exclude
dead/fallen ids in genApplicant's used set and/or refuse
dead-flagged charIds in arrivalTick) but NOT made here. (3) Sense
check: the return IS narrated, not silent — d109 "Word came: Nora
Wilson of Stonebridge wants to join Haven", debate, auto-accept,
d111 "Nora Wilson walks in" — but identity-blind: no line notes
this is the woman buried d107. The gap is forgetfulness, not
silence.

## Arm 2 — sim-natflag-a: DIAG-GO (the flag is real reach, bounded, with no endgame consequence)

Commits: 3d5ec8db0 (prereg, BEFORE any judged sim), 15ac6077c
(results; rebased hashes). Proof: scripts/test-natflag-a.js, 19/19
green. Evidence: evidence/2026-11-02/sim-natflag-a.md (+ prereg).
Instrument: scripts/natflag-driver-20261102-a.js. DIAGNOSIS ONLY —
no game-code change.

The flag's source and flip point (seed 97338, closecommit
reproduction matching musterupkeep exactly): the field is
Game.state.globalLive (with nationalLive beneath it). The reader is
game code, Game.scaleRank() (src/js/hierarchy.js) — global >
national > regional > village. The driver only maps {national,
global} → 1; it invents nothing. Flips, all while alive: regional
d47 (Regional Dawn, networkLiveDay 46) → First Court staged d76
(LEAD shape, Haven + Emberhold + Stonebridge + Thornfield) →
NATIONAL d77 (answered 'feast' via the policy stack's leadcourt /
winseek legs → nationalLive=true, nationalDay=77, roster 8) →
Watchers staged d113 → GLOBAL d114 (answered 'feast' →
globalLive=true, roster 5) → village-lost d122, final read still
global.

Why death doesn't clear it: hierarchy.js never references
villageLost. scaleRank measures the polity (other villages'
bonds), not Haven's roster. The only clearing path is
_checkNational's dissolution branch — and the comparison seed
proves it works: 97330 also reached national (d86) but fell back
to regional d103 when Thornfield's trust hit 39 (below the
seasoned 40 bar), narrated aloud d102 ("The realm came apart").
97338 is special only in that its realm survived its village's
death (final polity LEAD size 4, links at trust 84/88/79, roster
0).

Game-path consequences checked on the same runs: final
deedGateReady() on 97338 is scale=true but ok=false — blocked on
waves (w3 2/4, w5 0/2); table 0, won 0, maxWave 4, wave 5 never
faced. Wave 4–5 unlocks run on Standing, not rank; rank only feeds
pointer narration. So: real scale-ladder reach, zero endgame
consequence. For wall numbers, 97338 counts as national 1
(global), table 0, won 0 — the blocker on this seed is wave-deed
breadth + survival, not scale.

Sense check: nothing narrates national standing at the death —
the standing was narrated at d76–77 and d113–114. The d118–d122
lines are muster hunger + Herald refusals as the roster collapses
5 → 1 → 0. The village simply died while its allied realm still
stood, which reads coherent: a realm is other people's promises.

Correct national-reach check for future runs (cite all three, same
run): (1) flip trace — day national/global first reads, with
nationalDay / nationalShape; (2) alive-at-flip — villageLost=false,
roster > 0 on the flip day; (3) consequence breakdown —
deedGateReady() (scale, waves, ok), table flags, won, maxWave.
The bare post-death final-read flag is a faithful state read but
an insufficient citation alone. Minor driver note for next time:
match "WATCHING" in the scale say-line regex — the global staging
say-lines were missed (only the d113 journal line was caught); the
d114 flip itself is trace-proven.

## Wall numbers (this run's legs, not a new wall panel)

Judged legs: 97330 + 97338, closecommit reproductions.
National: 97338 reached national d77 and global d114 while alive;
97330 reached national d86, dissolved to regional d103. Table 0,
wins 0, wave-5 unlocks 0, maxWave 4, wave 5 never faced in normal
play. Survival: villages lost d122 / d122.

## Reachability verdict + the directive question

No content reach changed this run: regional → national is now
proven real (not an artifact) on these seeds, but the table and
the win flag remain unreached, and both villages died before
either. The standing directive STANDS, and this run is explicit
about why one seed's national reach does not lift it: the axis is
the on-ramp — a village alive through national toward the table —
not a flag value. A realm that outlives its village is a polity
fact, not a village that climbed. The convergence bar remains:
scale-onramp recorded converged on measured evidence of villages
reaching national AND proceeding (alive) toward table/win. Until
then, Loop A keeps working this axis and Loop B keeps food-economy.

## Village assessment (plain words)

The village buried Nora Wilson, and three days later a messenger
announced that Nora Wilson of Stonebridge wanted to join Haven —
and nobody, not the game and not the village, noticed it was the
same woman. She walked in, was counted, and was chosen to lead
because she was trusted, while still carrying the mark of the
dead. Meanwhile the village's alliances outlived the village
itself: it rose to a national standing and then a global one while
it still lived, its friends' promises holding at trust in the
eighties even as its own roster fell to nothing — and then it died
anyway, its realm intact, its table unreached. The village is not
being lied to about its standing. It is being forgotten by its own
roster, and outlived by its own friendships.

## Blanks filled or documented

Filled (diagnosis closed): (3) dead-villager roster return —
DIAG-GO, mechanism named and traced; (5) 97338 national-flag
artifact — DIAG-GO, real reach bounded, correct citation standard
named.
Documented (evidence in arm files, not fixed): the dead-id
exclusion fix (genApplicant + arrivalTick) as the next buildable
blank; realm persistence past village death as an open coherence
question (hierarchy.js never references villageLost — by omission,
not by a stated ruling; if realms should dissolve when the home
village dies, that is a design call, not a bug fix to smuggle in).

## Metric review (for the NEXT run, not these verdicts)

- A post-death final-read flag is not a reach citation. Future
  national claims must carry the three-part check above (flip
  trace + alive-at-flip + consequence breakdown).
- A roster snapshot day is not an arrival day: pushes happen at
  endDay, first visibility is the next snapshot. Instruments must
  record both or they misdate returns by a day.
- A driver's filtered transcript is not the full say log: the
  "no walks-in line" observation was a filter artifact. Return
  instruments must persist the full say log or state the filter.
- Same-day chains need distinct counting (carried from 1340Z):
  this run's arms satisfied their thresholds across distinct days
  and seeds, not via one day's cascade alone.

## Telemetry deviation check

Prescribed invocation REFUSES the recorder corpus (same class as
1030Z / 1135Z / 1155Z / 1254Z / 1340Z: per-seed rows carry
top-level anchorCommit, so they are sweep recorder rows, not
runs). No LOUD deviation lines; baseline NOT rolled. No
--update-baseline, no --allow-recorder-corpus override used.

## Infrastructure notes

- Registry-lock queue delayed both worktree registrations (first
  ~4.5 min, second ~3.5 min; concurrent sibling registrations +
  reaps contending on REGISTRY.lock). No state harmed; both trees
  registered with fresh heartbeats before workers started.
- Sibling lock convention found: Loop B holds its own
  fleshout-loop-b.lock; this run holds the body-named
  fleshout-loop.lock plus a lane fleshout-loop-a.lock, so a future
  Loop A run sees this lane as occupied. Both deleted at closeout.
- check.js --quick: started in the main tree after both merges,
  produced progress dots, still running at a 100s coordinator
  timeout, terminated by the coordinator, NOT awaited and NOT
  claimed green (same hanging-under-load class as 1340Z). NOT a
  verdict on the run: this run changed zero src/js, and both arm
  proof suites are green on merged master (29/29, 19/19). No stray
  tree changes from the terminated run (git status clean after).
- safe-commit index-clobber class hit BOTH workers on BOTH of
  their commits (committed files shown as deleted + untracked);
  each worker repaired via HEAD-blob cacheinfo and verified status
  empty + diff HEAD empty — commits themselves always correct.
  The coordinator commit below is checked the same way.
- Worktree removal quirk: the natflag tree directory was already
  gone (reap-pruned) when the coordinator's remove ran, so
  `worktree remove --force` failed validation and the first
  `branch -d` reported the branch as worktree-held; a re-check
  showed no worktree entry and no admin dir, and the branch was
  already deleted — master tip 15ac6077c is itself the natflag
  results commit, so nothing was lost. Both branches merged, both
  trees gone, main tree clean at closeout.

## Next blanks, in order

1. STEVE-CALL (unchanged, still pending): should a committed blade
   be allowed to become the bearer (options a–d in
   sim-bearerorder-a.md)?
2. Stores-draw upkeep proposal (Steve-call; needs ruling before
   any src/js work).
3. Dead-id exclusion build: exclude dead/fallen ids in
   genApplicant's used set and/or refuse dead-flagged charIds in
   arrivalTick, with proof (Nora no longer re-applies; no
   regression on legitimate joiners) — OR, if the return is to
   stay as story, an identity-aware narration line ("the woman we
   buried") instead of silent re-entry. Do not bundle exclusion
   and narration in one arm; the arm's prereg picks one.
4. Fed-scholar lair-contact cadence audit (carried).
5. Realm-persistence coherence question: should a realm dissolve
   when the home village dies, or is outliving-by-friendship
   intended? (Design question for a future arm, not smuggled in
   as a fix.)
6. Carried: primary-arrears trap (Steve-call candidate).
7. Roster-cap / free-adult constraint on trusted quotas.
8. Tend saturation / marginal tend capacity.
9. Surprise-refusal seed for refusal-memory.
10. Bridge-walk narration line.
11. 12 vs 3–4 contact attempts on d110.
12. Carried: call standing-cost trace, 97489-style no-contact
    arrivals, blocked-then-arrived mechanism (97369, 97409).

Rotation left at 3 (convergence work does not cycle it).

## Addendum — coordinator commit index-clobber hit + repair

The coordinator commit 4b48886c2 itself was correct (1 file, 265
insertions), but the safe-commit index-clobber class hit it too
(staged-deletion variant: the just-committed file shown as staged
D + untracked). Repaired via HEAD-blob cacheinfo
(blob 7265f99042cc5c8d9a09f67feb48facab17a45af); after repair
`git status --short` empty, `git diff HEAD` empty, hash-object
matches the HEAD blob. Third consecutive run with this class on a
coordinator commit (1340Z, both 1424Z workers, now coordinator).
