# sim-food-economy-round-1730-b — coordinator record (loop B, axis food-economy)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261028T1730Z.
Axis: food-economy (converging) — the SECOND axis, because sibling loop A
held a live claim on scale-onramp for the whole run (1628Z claim:
sim-fieldfeed-a + sim-outdoorcrew-a, NOT touched). A's 1628Z round landed
mid-run (coordinator record 3f3275a0d: fieldfeed pilot-GO-only,
outdoorcrew NO-GO, both merged evidence-only, game change reverted);
journey-establishment-r53 (a84b7a1b8, tooling only) also landed under
this run. Both B branches rebased clean onto the moved master (zero file
overlap), proofs re-run green post-rebase, ff-only merges clean.

Pre-flight: main tree clean at start except loop A's coordinator record
still untracked (A mid-closeout) — waited the prescribed 10m, A landed
3f3275a0d, tree clean before registration. Disk 15%. Reap at start:
nothing to reap. B lock + claim written at 17:32Z before any sims.

Standing rule noted mid-run (memory, Steve 2026-10-28 12:48 CDT):
NO MAGIC LISTS / PERCEPTION LAW — villagers know who's around only
through their own senses; no global roster fed into a decision; the
field-feed fix was that pattern and stays reverted; list-feed arms stop.
Neither arm in this run uses a list feed (arenalabel is a death-label
fix; thiefinside is a position-gate demonstration), so no redirection
was needed. A's fieldfeed revert and the ruling agree.

## Arm 1 — sim-arenalabel-b (GAME CODE, label-only) — PILOT-GO + CONFIRM-GO, LANDED

Tracker next blank #1 (follow-up to sim-grantdeath-b, DIAG-GO).
Prereg aeab4d952 (rebased 9089f74b6, BEFORE any judged run).
Change b736d925e, evidence f9929ebc4, corpora 1b54c374a (branch tip).

The lever: src/js/game.js gains Game.tbFightDeathCause(f), called from
the ONE existing tbEnd('lost') playerDeath site. Origin is derived at
tbEnd time from live state (nothing new persisted):
state.arenaContest present -> 'the arena' (unchanged); otherwise PROVEN
WILD only (at least one kind:'monster' fighter, no kind:'hostile'
fighter, none of betrayal / tableTrial / coalitionArena) -> 'the wild'
(ledger.js's own wild fallback word); otherwise -> 'the arena'
(conservative fallback). Diff: +35/-4 in game.js, one call site.
No other playerDeath site changes; worker checked no code branches on
cause === 'the arena', so the relabel cannot reroute any system.

Verdict against the prereg (judged only against it, not re-scored):
- PILOT-GO (8 seeds x 7 keys, 56 instances/leg, COMPETENT_FEAST=0
  SEATDRIVE=0 PLENTYDEPRI=0 DEPOSITGATE=1): P1 reproduces all 7
  grantdeath losses (starvation x1, 'the arena' x6); P2 relabels all
  6 grant tbEnd wild losses + 2 successor-tail tbEnd deaths (8 total)
  'the arena' -> 'the wild' in ALL FIVE fields (playerDeath arg,
  registerDeath, fallen, telemetry, narration line), starvation
  unchanged; P3 determinism 0 non-deterministic, every other cause
  identical, say lines identical except the 8 relabeled death lines;
  P4 proof 13/13 incl. real-tbEnd wild + arena legs and lineage
  agreement; P5 arena branch judged by proof leg L8 (no
  arena-contest loss occurs in the band — disclosed in advance).
- CONFIRM-GO (16 seeds 10040-10055 x 7 keys, 112 instances/leg):
  0 before/after cause differences except proven-wild relabels
  (18 relabels, 0 OTHER changes); every tbEnd wild loss reads
  'the wild' in all five fields; determinism as pilot on all 16
  seeds; AMBIGUOUS-UNCHANGED count 0 (fallback never exercised by
  the bands; exercised by proof legs L3-L6).

Sense test (plain words): before, a bearer killed by the Swarm Hum in
the grass at night reads "is dead — the arena" — nothing in that
night was an arena. After, same fight, same blows: "is dead — the
wild." The mourning beat is unchanged; the place-name now answers
the question the before line raised.

Guards: test-grantdeath-b.js 8/8 PROOF-GREEN (instrument unaffected);
test-abilities-breakit-r4-20261011.js 36 passed / 2 failed, the 2
verified PRE-EXISTING on pre-change game.js (dead-ability 28 vs 14
expected, undiscoverable-synergy 17 vs 15 — counts drift, not this
arm's). check.js --quick stalled with no output 7+ min in the worker
run (killed to unblock); coordinator re-ran it on merged master —
see "Full check" below. No jest in this arm (proofs are node).

Balanced panel (§15 — explicit, not a fake): no panel compare .md.
A label-only change has no game leg a panel can judge; panel metrics
cannot move under it; determinism clauses P3/C4 are the binding guard
that they did not. If P3/C4 had failed, a panel compare would have
run before any landing claim.

Metric review (§14): judged against the prereg as written. Two
disclosures, neither a verdict change: (1) P2 counted "the 6 tbEnd
wild losses" but the band holds 8 tbEnd deaths (6 grant + 2
successor-tail); all 8 relabeled under the same rule; a future
prereg should count "every tbEnd death in the band" explicitly.
(2) The arena branch remains proof-only, not band-proven — the
grantdeath substrate produces only sleep-interruption wild fights;
a future arm should build a contest-loss substrate.

Known limit, documented not hidden: betrayal, table-trial, titan
coalition-arena, and alien-hostile tbEnd losses still read 'the
arena' by the conservative fallback. Follow-up, not a verdict change.

## Arm 2 — sim-thiefinside-b (MEASUREMENT ONLY, zero src/js) — GO, LANDED

Tracker next blank #2 (follow-up to sim-thiefhall-b, DIAG-GO).
Prereg 2838f72dc (rebased), confirm addendum 51f5c0546 (BEFORE any
confirm run), evidence + corpus 1f0d36001.

The question: thiefhall proved 40/40 competent tap days 'none' (35 on
the haven tile OUTSIDE the hall, 0 inside) because competent evenings
never step inside. Does a human "go inside, then tap" evening open
the gate, and what does the thief tap do from inside?

Verdict against the prereg: GO — gate opens on the BUTTON-HANDLER
ROUTE + genuine thief tap; DOM-tap entry remains unproven (browser
follow-up). The verdict line must keep "button-handler" in it; any
summary that drops it misstates this arm.
- Pilot (8 seeds 10040-10047, 2 lead + 5 tap days): 8/8 seeds reach
  the inside thief tap (bar >= 6/8); havenStoresAccess() reads
  'inside' on 36/36 inside taps; outcomes 18 success-clean /
  18 success-caught (the impl's 50% coin, dead even); 0 hall
  refusals from inside; every success moves exactly 400 kcal
  pantry -> pack; tap-only +5 ticks / -120 kcal; evening price
  3-5 walked squares + tap, separately accounted. Pre-evening
  access 'none' on all 36 completed evenings (same-day
  before/after pairs: grounds -> hall -> lift).
- Confirm (16 fresh seeds 10050-10065): CONFIRM-GO, 16/16 seeds
  (bar >= 12/16); 73/73 inside taps read 'inside'; outcomes
  42 clean / 30 caught / 1 ownership refusal (seed 10054 tap day 6:
  grant lost by then — classified as ownership loss, NOT a gate
  observation, exactly as preregistered); 0 hall refusals from
  inside on the confirm band too. Combined: 109 inside taps,
  60 clean / 48 caught / 1 ownership refusal. Evenings not
  attempted: 6 away + 1 in-combat, enumerated, not failures.
- Played vs instrumented (honest split): the thief tap is a GENUINE
  PLAYED TAP (bar read via _actionAvailable, issued through
  activateAbility with no target); the walk is PLAYED MOVEMENT
  (beginPathWalk + pathStep, the browser's "Walk here" verbs);
  the ENTRY is BUTTON-HANDLER-EQUIVALENT (adjacency <= 1 to a
  lodge cell + cellActions returns 'Go inside' + doContextAction
  mapping invoked, proof leg T4 enforces it) — never labelled
  "played entry" here, because node cannot render the DOM card.
  A finger-on-phone lodge tap is NOT claimed.

Sense test: seed 10040 tap day 3 — grounds (4,0), 1,010 kcal, pantry
31,600, access 'none'; "Walking 5 squares (10 kcal)…", "You step
into the Haven hall.", then "The food disappears. Magic. (It's not
magic. Nobody saw. Light Fingers.)" The position and the narration
agree at every step; the gate itself never rolls — the caught/clean
coin is the only chance. One silence named: nothing in the game's
own lines tells a grounds-standing player to go inside first.

The design question (specified next arm's grounding, NOT landed):
a §2-style pre-payment precheck for thief.steal_pantry. Mechanical
case is clean: call havenStoresAccess() itself (never re-implement
the conjunct, never substitute playerAtHaven() distance); gate
inputs (position, exile, stage) are payment-stable and
target-independent, so no target scan is needed. Gate-only is the
safe exact mirror; gate+empty+heavy is complete with a day-crossing
edge (a day roll between precheck read and dispatch can empty the
pantry). Saving per refused tap: +5 ticks / -120 kcal thiefhall
proved are currently paid before refusal, plus the day-roll tail
risk. False refusal is the worst failure (a working lift stranded
behind a greyed button — the calm bug's shape); false pass is the
status quo. What needs STEVE'S CALL before any build: (1) whether
thief deserves a §2 precheck at all (is the paid "hands are not"
lesson part of theft's feel, or the same paid-refusal class §2
already fixed?); (2) button why wording (verbatim impl sentence vs
directive "Go inside the hall first."); (3) scope gate-only vs
gate+empty+heavy; (4) whether remote (stage >= 3) stays a pass on
the button too. The next arm preregisters ONE scope and proves it;
it does not drift between them.

Balanced panel (§15 — explicit, not a fake): no panel compare .md.
No before/after game leg exists (zero game changes); panel metrics
do not exist for 7-day instances and are not estimated. The
thiefhall comparison (same seeds, different evening: 37 hall-refused
there, 36 inside taps here) is a corpus comparison, labelled so —
only tap day 3's pre-evening state is identical seed-for-seed
(proof T7, 8/8); later days diverge because the evening itself
consumes ticks/kcal and moves the player.

Metric review (§14): walk-quote variance observed not explained
(35/36 walks 2 kcal/square; one 5-square walk quoted 15 kcal —
recorded, not traced, verdict-neutral); pantry uniformity (400
kcal/lift) is this band's pantries, not a rule (impl takes
min(units, 2) of the largest stack — do not generalize); away days
are enumerated, excluded from numerator and gate denominator both;
absent exile/systemArrived fields read falsy, stated as absent not
measured-false; confirm determinism field false is the EXPECTED
value for fresh seeds (no thiefhall rows to compare), determinism
proven on the pilot band.

Proof: test-thiefinside-b.js PROOF-GREEN (T1-T8);
test-thiefinside-confirm-b.js CONFIRM-PROOF-GREEN (C1-C4, C6, C8).
No jest. No [needs-eyes]: measurement/tooling only.

## Wall (this round)

No judged wall corpus — both corpora are tap-instance / death-label
traces on a pre-seat substrate, with no wall fields. No wall movement
claimed. Reachability is unchanged by arenalabel by construction
(determinism clauses) and thiefinside demonstrates a new reachable
position (inside the hall) for an existing tap, not a new scale step.

## Telemetry deviation check (body step 10)

On both corpora vs scale-wall.json baseline: 3 LOUD lines each
(national 12->0, table 16->0, wins 16->0), the known field-shape +
regime artifact class (trace rows carry no top-level national/table/
wins fields; WINSEAT baseline regime does not match tap/death-trace
substrates). Baseline NOT rolled, no investigation item. Same class
as the 1530Z/1635Z rounds.

## Full check (coordinator, on merged master)

node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-coord-1730b:
275 passed, 15 failed in 708s (log /tmp/check-1730b.log — transient;
failure list below is the record). Worker suites re-ran green
post-rebase in their own worktrees (arenalabel 13/13 + grantdeath
8/8; thiefinside PROOF-GREEN + CONFIRM-PROOF-GREEN); ff-only merges
guarantee the merged tree equals those rebased tips for the arm
files, so no separate main-tree proof re-run was needed.

Adjudication of the 15 (diagnostic run below settles all of them):
- 7 are container-EPERM write failures, proven by the error itself,
  not by attribution: human-combat-parity (writeFileSync EPERM),
  measurement-source-text (EPERM write), measurement-flags (EPERM
  write), prepared-runner-custody (EPERM writeFileSync),
  proof-text-identity (EPERM write), telemetry-check-recorder
  (EPERM write), sw-audio-cache (EPERM copyfile sw.js -> /tmp).
  These fail on any base while the flap is active.
- test-foodpower-20261014 (ontology validator leg): docs/ONTOLOGY.md
  sat at 0 bytes (2016 deletions) during the check run — the known
  transient sibling-writer anomaly (same shape as 2026-10-24).
  The validator reads that file; the failure follows the empty
  file, not this run's arms (neither arm touches ONTOLOGY.md).
- test-phone-frame-proof (receipt staleness) and
  test-establishment-r20-fixes (racks-voice gate) match the
  pre-existing failure classes recorded by the 1530Z round
  (racks-voice, phone-frame receipt staleness).
- Remaining 5 (measurement-cache-flags, measurement-proof-update
  "Proof source inputs are not current",
  measurement-workflow "retained neutrality proof covers the current
  Game/controller/harness inputs", mobile-combat-cadence Continue
  round-wrap legs, occupation-panels "real CLI workflow completed"):
  adjudicated by the diagnostic run below.

DIAG RESULT (sim-diag1730-b, all 15 scripts re-run at pre-arms base
a84b7a1b8 in a detached worktree, 2026-10-28 ~19:17Z): 15/15
explained, ZERO attributable to this run's arms.
- 8 PASS pre-arms (their merged-master failures were flap artifacts,
  not code): human-combat-parity, measurement-cache-flags,
  measurement-source-text, measurement-flags,
  prepared-runner-custody, proof-text-identity,
  telemetry-check-recorder, sw-audio-cache. All 8 fail on merged
  master only through EPERM writes (proven by the error class in the
  check log); with the flap quiet they pass on the pre-arms base.
- 6 FAIL pre-arms too (pre-existing, NOT caused by this run):
  measurement-proof-update ("Proof source inputs are not current"),
  measurement-workflow ("retained neutrality proof covers the
  current Game/controller/harness inputs"), mobile-combat-cadence
  (Continue round-wrap legs), occupation-panels ("real CLI workflow
  completed"), phone-frame-proof (receipt staleness),
  establishment-r20-fixes (racks-voice gate). The stale
  observer-neutral proof predates this run (repo AGENTS.md: changed
  Game inputs require a fresh proof via balance-proof-update.js) —
  it is maintenance debt for the measurement owner, documented here,
  NOT silently re-minted by this run (re-minting would mask that
  the staleness predates the arenalabel change).
- 1 (foodpower ontology leg) PASSES pre-arms because the diag tree
  carries the intact ONTOLOGY.md; on merged master it failed only
  because the file sat at 0 bytes during check.js (see transient
  note below). Attributed to the transient file, not to either arm.
Diag tree left clean (no script wrote into it).

## Infrastructure

- EPERM flap (container write denials, same class as 2026-10-23/24)
  hit this run's closeout: coordinator worktree registration failed
  once (index-reset fatal), diag worktree registration failed once
  (same), and branch deletions failed intermittently with empty
  reason. No ref surgery performed during the flap; dangling
  branches were verified tip == master tip before deletion, and
  deletions were retried only after the flap cleared (the flap is
  intermittent — a delete that fails one minute succeeds the next).
  No commits were forced. Diagnostic registration succeeded on
  retry after a 4-minute wait.
- Safe-commit index clobber: NOT reported by either worker this run
  (unlike most prior rounds) and no coordinator repair was needed.
- ONTOLOGY.md transient: 0 bytes / 2016 deletions in the main tree
  at 18:55Z during check.js (same anomaly as 2026-10-24). Left
  alone throughout per precedent — never reset, never committed,
  never touched. If it has not self-restored by the next run, check
  for a live doc-sync writer before touching it.
- Master moved three times under the run (A 1628Z record 3f3275a0d,
  journey r53 a84b7a1b8, both zero-overlap with either arm; then
  A's shoutgate round 9a768563b after both arm merges — game change
  reverted at its closeout, net evidence-only). Both arm branches
  rebased clean in their own worktrees with proofs green after
  every rebase; this coordinator record rebased clean onto
  9a768563b before its ff-only merge.
- Arm worktrees released as done-merged, branches deleted, before
  this record; coordinator and diagnostic trees are released as
  part of this closeout. Main tree verified on master at closeout
  except the ONTOLOGY.md transient below (not this run's).
  No push, no bump, no live verification (ship-loop line).
  Merged locally, pending ship.

food-economy stays converging (NOT converged): the tbEnd death-label
lie is fixed and band-proven, and the inside-hall thief evening is
demonstrated and confirmed — but no food-economy fix in this run
touches the scale wall, and the thief precheck is specified, not
built. scale-onramp stays converging (untouched; sibling loop A
lane). Claim deleted; lock deleted.

Next blanks, in order:
(1) thief precheck arm — ONLY after Steve's calls (whether a
precheck at all, why wording, scope gate-only vs gate+empty+heavy);
the next arm preregisters ONE scope and proves it.
(2) DOM-tap browser follow-up: a phone playtest tapping the lodge
card's 'Go inside' button, then Light Fingers — the remaining step
to call the inside evening fully played.
(3) arenalabel fallback origins: betrayal / table-trial / titan
coalition-arena / alien-hostile tbEnd losses still read 'the arena'
— name them honestly once a substrate reproduces them.
(4) arena-contest loss band: build a contest-loss substrate so the
arena branch is band-proven, not proof-leg-only.
(5) competent evenings end outside: a policy whose evenings end
inside would change every inside-gated tap's reachability.
(6) breakit tripwire drift (dead-ability 28 vs 14, synergy 17 vs 15,
pre-existing, verified on pre-change code) — somebody owns it, not
this run.

Evidence: evidence/2026-10-28/sim-arenalabel-b.md,
sim-arenalabel-b-prereg.md, sim-arenalabel-b-corpus-before/,
sim-arenalabel-b-corpus-after/, sim-arenalabel-b-corpus-confirm-before/,
sim-arenalabel-b-corpus-confirm-after/; evidence/2026-10-28/sim-thiefinside-b.md,
sim-thiefinside-b-prereg.md, sim-thiefinside-b-confirm-prereg.md,
sim-thiefinside-b-corpus/, sim-thiefinside-b-confirm-corpus/;
this file.
