# sim-dangerfit-a — PREREGISTRATION (written BEFORE any judged sims)

Arm: sim-dangerfit-a, Loop A run fleshout-20261031T1702Z, axis
scale-onramp. BUILD arm: implements the danger-before-fit lever
sketched (Option A) by sim-killscred-a for the sim-findings item
"KILLS-EARNED CRED DANGER-BRANCH LEVER" (Loop A
sim-patrolsilent-a, finding N1, DIAG-GO). Sibling Loop B is live
on food-economy — this arm touches NO food-economy code, only
scripts/policies/delegate.js pickTask order plus proof/test and
measurement tooling.

## Question

Killscred located the loss exactly: in scripts/policies/
delegate.js pickTask, the fit-first block returns BEFORE the
danger branch is evaluated, so kills-earned holders with a fit
route never patrol (85111 mechanic: mend 271x, 0 patrols; 85114
farmer: cook 257x, 0 patrols; both re-measured on killscred's
base). Does moving the danger evaluation BEFORE the fit branches
— gated on kills > 0 only — make trapped holders patrol, without
collapsing the specialist economy they carry and without changing
non-killers' routing at all?

## The lever (exact change, policy layer only, no game code)

In scripts/policies/delegate.js pickTask, AFTER the hp < 40 ->
'rest' return and BEFORE the fit-first block, insert:

- if hp >= 60 AND killsEarned(Game, vid) (raw agency
  monsterKills > 0, read RAW from state.village.agency.stats
  — never via Game.agencyOf, so the check mutates no state and
  draws no RNG), roll danger FIRST: prand() < 0.35 -> 'patrol';
  prand() < 0.6 -> 'hunt'; otherwise fall through to the fit
  branches exactly as today.
- killsEarned is kills > 0 ONLY. Occupation cred alone does NOT
  trigger the override: a non-killer (kills 0 or null) takes the
  identical code path as today — same branch order, same prand
  draws (zero new draws: the kills check draws nothing and the
  danger roll is skipped), same returns. Non-killers route
  exactly as before, by construction and by proof test.
- The existing danger branch below the fit block is UNCHANGED
  (still hp >= 60 + combatCred, 35% patrol / 25% hunt): it keeps
  serving danger-reaching holders (occupation-cred and
  non-fit kills holders) exactly as today. The override only
  ADDS an earlier evaluation for kills-earned holders; it never
  removes a branch.
- No game-code change, no policy-default flip, no food-economy
  change, no teach/mend/cook numbers changed. [needs-eyes]:
  this changes villager behavior the player sees (who patrols),
  so the landing commit carries [needs-eyes].

## Canon

docs/CANON.md read first. NO canon doc covers delegate pickTask
branch order or patrol assignment specifically (docs/PARTY.md
covers parties/villagers generally; it does not prescribe
fit-first vs danger order). Stated, not invented around: the
branch order is a policy-layer fact (delegate.js), not a Steve
canon ruling, and this lever is a measurement-judged change to
that policy, not canon.

## Primary metric

Per-seed, per-kills-earned-holder routing table on the IDENTICAL
S-PATROL stack as killscred (leadfeast + windefer + seatdrive +
fullseat + delegate + deadfall; FEASTSCALE_R13=1 TRIBFLOOR=1
WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1 DEADFALL_B=1),
reusing the patrolsilent instrument
(scripts/patrolsilent-diag-20261031.js v2) verbatim and the
killscred analyzer (scripts/killscred-analyze-20261031.js)
verbatim. Two legs on THIS base, identical seeds and stack:
  - BASELINE leg: delegate.js unmodified (this base's code).
  - LEVER leg: delegate.js with the override above.
Runner: scripts/dangerfit-runner-20261031.js (stdout-runner:
same oneRun logic as the patrolsilent sweep, but each seed's
full per-seed JSON is printed as ONE line to stdout; an idle
splitter, scripts/dangerfit-split-20261031.js, writes the
per-seed files). Judged corpora are NEVER staged in /tmp and
never written by the game-loaded process: stdout -> file +
stderr -> file in a foreground exec, splitter separate.
Analyzer tables: evidence/2026-10-31/sim-dangerfit-a-base-table.json
(baseline leg) and evidence/2026-10-31/sim-dangerfit-a-lever-table.json
(lever leg). Judged numbers come ONLY from these two legs on
this base. Killscred's corpus is prior-base context, NEVER
re-judged and never quoted as this run's results.

Holder fields judged (analyzer output): patrolAttempts
(delegate patrol picks, post-kill holder-beats), huntPicks,
branches (fit-* vs danger-hit vs danger-fallthrough vs hp-low
vs already-assigned vs pre-claimed), allBeatsDuty (mend/cook
totals, all beats — the frame that reproduces "271x/257x"),
heldTasks (held-patrol beats reported as secondary), credVB /
credFit / credDanger.

## GO threshold (judged exactly)

GO iff ALL of:
1. Pilot (8 seeds, below) completes on BOTH legs with
   instrument errors 0 on every seed.
2. Trapped flip, BOTH seeds, lever leg: the 85111 mechanic
   (kills-earned holder, mend route) records patrolAttempts > 0
   AND the 85114 farmer (kills-earned holder, cook route)
   records patrolAttempts > 0. Holder identity is stable by
   construction: pre-first-kill trajectories are identical
   across legs (non-killer paths draw identical RNG), so the
   first kill reproduces and the holder exists on both legs;
   the table identifies holders by occupation + vid from each
   leg's own corpus.
3. Band coverage (16 seeds, confirm): seeds with >= 1
   kills-earned holder at patrolAttempts > 0 on the lever leg
   >= the same count on the baseline leg + 2 (the two trapped
   seeds flip; 85108 already had a patrolling holder on the
   prior base, so it cannot contribute to the +2).
4. Guardrails, lever leg, all-beats frame:
   a. 85111 mechanic allBeatsDuty.mend >= 100 (killscred base:
      271; floor = 37% of that — mending must not collapse to
      near-zero even though ~60% of the holder's beats now
      roll danger first).
   b. 85114 farmer allBeatsDuty.cook >= 100 (killscred base:
      257; floor = 39% of that).
   c. Non-killer routing intact: at least one occupation-cred
      holder with kills = 0 records patrolPicks > 0 on the band
      (danger branch below the fit block still serves
      non-killers), AND the proof test's non-killer cases pass
      (fit returns unchanged, zero new prand draws).
5. Proof test scripts/test-dangerfit-20261031.js GREEN on the
   branch (synthetic pickTask branch cases + corpus-structure
   reconciliation for both legs).
6. Sense read: a trapped holder's day read before (baseline
   leg) and after (lever leg) from the corpora, judged for
   meaning, not just counts.

A miss on any clause is NO-GO, never re-scored against a
friendlier metric mid-run. If NO-GO, the lever is REVERTED
before any commit of game/policy code — killed arms leave no
trace (tooling + prereg + evidence of the kill may still be
committed, labeled NO-GO, so the next arm does not repeat it).
Metric doubts go under "metric review" for the NEXT run.

## Horizon + why

Death-aware, never fixed 200d: DAYS=200 cap, runDays early-ends
on over / village-lost / won exactly as the killscred sweep
did, so legs are comparable seed-for-seed. The question is
about assignment over a village's life, not a fixed window.

## Seeds (fixed, no band-shopping)

- Pilot: 85111, 85114 (the two trapped-holder seeds) + 85101
  (police-officer contrast), 85103, 85104 (firefighter
  contrast), 85107 (no-holder CRED contrast), 85108
  (multi-holder contrast), 85110 (street-artist kills-earned
  ACTIVE contrast). 8 seeds, same as killscred's pilot.
- Confirm: the remaining killscred band seeds only (85102,
  85105, 85106, 85109, 85112, 85113, 85115, 85116) if the pilot
  fires cleanly; never below 8, never outside the band.
- Policies: S-PATROL stack verbatim (see Primary metric). No
  other policy layer, no game change.

## Base commit

Worktree branch sim-dangerfit-a, HEAD at prereg time:
f536e3ad33da39ed7c4ed6cc620277287405bed3 ("sim-scale-onramp-round-1535-a:
coordinator evidence — 4 scale-onramp diag arms landed").
Killscred's corpus anchor 0690fbddad81 is NOT an ancestor of
this HEAD (its landing commit 75cb7c8d9 is, via the coordinator
evidence commit above) — so base drift is EXPECTED and the
band status is re-derived here on this base (baseline leg),
never assumed from killscred's numbers. Base equality is
checked before judged legs: both legs run on this commit with
only the lever diff between them (verified with git diff of
scripts/policies/delegate.js between legs).

## What is NOT judged

- Wall numbers (national/table/wins, wave reach, median
  survival) are reported where observable on this substrate,
  never as 0s where unobservable. Arc II/III/IV reach,
  four-realm formation, trap acquisition by source, counter
  discovery/kill rates, and young-link succession survival are
  NOT instrumented in this substrate and are NOT reported.
- Killscred's corpus is NOT re-judged; its numbers appear only
  as prior-base context, labeled as such.
- Trajectories WILL diverge between legs after the first kill
  in each village (the override draws policy RNG where the
  baseline drew none for fit-routed killers). Legs are paired
  by seed + stack, not trajectory-identical; the GO clauses
  are written to survive that divergence (holder identity via
  first-kill reproduction, band counts, absolute guardrail
  floors).

## Panel (section 15)

Before/after comparison runs through scripts/balance-panel.js
per §15 — as panels built in the balance-panel schema from the
two legs' per-seed corpora (armory precedent:
scripts/build-armory-panels.js), because the official panel
driver runs sweep-compare registry policies only and cannot
express the S-PATROL stack + patrolsilent instrument. The
deviation is stated on the face of the compare file. Contract
metrics mapped where observable (won, table, national,
survival30/60, communityLost); the rest null, never
fabricated. The panel is the instrument; the GO threshold
above is the judge. Compare output:
evidence/2026-10-31/sim-dangerfit-a-panel-compare.md (+ .json,
+ before/after panel .json.gz).

## Metric review

(To be filled at end of run; never a re-score of this run.)
