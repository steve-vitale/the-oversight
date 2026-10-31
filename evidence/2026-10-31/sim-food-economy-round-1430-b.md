# sim-food-economy-round-1430-b — coordinator evidence (closeout recovered by main session)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261031T1430Z,
axis food-economy, arms sim-fedevening-b + sim-axefirst-b +
sim-corpsemove-b. The run's coordinator timed out at 7200s during
closeout. This file was written by the main-session closeout from
the run's draft (hidden_files/draft-round-1430-b.md), the three
landed arm evidence files, and git state verified before commit.
No arm content was re-run or re-judged in recovery; every verdict
below is the worker's own, quoted from its evidence file. Landed
hashes below are post-rebase master hashes; arm evidence files
cite their pre-rebase hashes.

## Run start (from the draft)

- Stale-lock recovery of 1230Z at 14:33Z: lock 130 min old, no
  registry entry, no worktree, no branch, no arm processes. Both
  1230Z arms had already LANDED on master (windowcarry NO-GO
  evidence 824b27c42 + cleanup af6ec60b8; toolloss DIAG-GO
  daabd0e2d). The 1230Z round evidence itself was recovered by
  this run and is committed alongside this file as
  evidence/2026-10-31/sim-food-economy-round-1230-b.md.
- Loop A live on scale-onramp for the whole run (1415Z claim) —
  NOT touched.
- Pre-flight: main tree clean (0 lines), disk 21%, reaper removed
  nothing (active sibling trees with uncommitted changes refused,
  per design).
- Claim: food-economy, arms sim-fedevening-b + sim-axefirst-b +
  sim-corpsemove-b (tracker blanks 2+3 from 1047Z plus the
  toolloss-b side observation).

## Infrastructure (EPERM flap, this run)

- Worktree registration: sim-fedevening-b registered clean
  (~14:47Z, a clear window). sim-axefirst-b + sim-corpsemove-b
  FAILED on the container EPERM flap ("couldn't write
  refs/heads/<slug>.lock") on the first chain AND on retry round
  1; a registry heartbeat write also PermissionError'd once.
  Retry round 2 (~14:55–14:59Z): axefirst registered 14:55:30Z,
  corpsemove registered 14:59:31Z; all three trees active. No
  ref surgery was attempted during the flap, ever.
- Registry-lock contention: the 1230Z closeout's register held /
  queued on REGISTRY.lock while its inner `git worktree add` sat
  stuck ~14:37Z; this run's first register queued behind it
  ~14:34–14:47Z.
- Safe-commit index clobber (known class): hit BOTH fedevening
  commits and the corpsemove prereg commit. Repaired each time
  via `git update-index --add --cacheinfo` from HEAD blobs;
  `git status --short` empty + `git diff HEAD` empty verified
  after each repair. The commits themselves were never in doubt
  (blob hashes match).
- Transport throughout: stdout-runner (sim prints one JSON line
  per seed to stdout) + idle splitter; no judged corpora staged
  in /tmp (sibling-cleanup wipe rule).
- Closeout discovery (main session): the sim-axefirst-datahold-b
  worktree directory was partially swept from disk — its .git
  pointer file was gone and 7,763 tracked files showed deleted,
  with 0 modified and 0 untracked files. Nothing was lost: the
  branch tip (9e22415eb) already equals master HEAD, so every
  deleted file is committed. The closeout restored the .git
  pointer from the surviving admin dir, verified the status
  breakdown, then removed the worktree and deleted the branch
  (see Closeout). The wipe class matches the /tmp sibling
  cleanup; worktrees under ~/workspace are not immune — commit
  early remains the protection.

## Arm 1 — sim-fedevening-b: DIAG (substrate void), lever UNJUDGED

- Landed: prereg cf9481a0d (binding, before judged legs),
  instruments 9be5362c7 (policy + trace driver + analyzer +
  splitter + pure proof 20/20), DIAG 4e2f9663c.
- Design (carried forward UNTESTED, not killed): strand-evening
  deadfall branch-fire substitution — on a still-creek evening
  after the failed bridge attempt, gather fallen branches
  (bare-hands, no axe, no food gate) and, if branches >= 2,
  light a BRANCH fire (never a log fire), so the bridge logs
  stay in the pack for tomorrow's bridge. Policy file
  scripts/policies/fedevening-diag.js, default-OFF, env-gated;
  zero src/js changes, zero policy-default flips.
- Verdict: DIAG, not NO-GO. The strand set is EMPTY on this
  base: 15215 guard [] / ON [] (was [7,8,9] / [7..16]);
  pilot 8 seeds, 0 creek evenings on every leg (26 legs
  total: 8 pilot + 16 fresh control + 2 drift-check, all
  stay-home, all 30 days survived). With zero still evenings
  the prereg's GO clauses have no denominator — UNEVALUABLE,
  not failed. Per staging no confirm spend followed the
  failed pilot sniff. The mechanism itself was never exercised
  (zero gathers, zero fires). Proof 24/24.
- Mechanism class (proven, draw unisolated): the strand was
  never a property of seed 15215 alone but of seed 15215 PLUS
  the exact RNG stream. The two lootabilities landings between
  the strand's characterization and this base (w2 field-fight
  ability coverage, w3 villager self-craft) both add RNG draws
  to the shared stream; mornings 2-3 match, then names,
  gossip, spoilage and the day-7 departure lottery diverge.
  Which exact draw shifted it is NOT isolated (no Arm 6 craft
  line in the pilot transcript) — a bisect is owed before
  anyone claims which landing moved it.
- Metric review carried forward (worker's own): Q1–Q3
  UNMEASURED (no branch fire, no gather, no bark); Q4
  (15337 retry-refusal) UNMEASURED and now MOOT on this base
  (15337 control [] too). Next run doubts: (1) whether ANY
  seed strands on current master — re-derivation must sweep
  wider than the 8-seed band; (2) whether strand arms should
  judge on a FROZEN stream (pinned base + pinned policy set)
  — a coordinator/Steve decision, not a worker call; (3)
  whether the stay-home trajectory itself deserves its own
  DIAG (a competent policy that never departs on 8/8 seeds
  in 30 days).
- §15 panel: non-applicability declared (strand census, same
  standing exception as prior strand arms).

## Arm 2 — sim-axefirst-b: DIAG-NO-STRAND, lever UNJUDGED

- Landed: prereg 8c138a569 (binding, before judged legs;
  pinned base 47162b801), DIAG 53f7ac444, datahold 9e22415eb.
- Design (carried forward UNJUDGED, not killed): AXEFIRST
  ruin-run lever — gameDays 2-6, vessel starts at haven
  holding no axe-tier tool → one deliberate ruin run
  (nearest ruin via engine-offered travelTargets, else
  visible-board scan; hop-walk, no force; doAction('forage')
  searches; walk back to the day's start tile), then the base
  daily runs as usual. Perception-law clean by construction
  (own tier/pack/position/kcal/ticks, visible board,
  engine-offered steps; no roster, no loot queue). Policy
  scripts/policies/axefirst-diag.js, env-gated, default-OFF;
  zero src/js changes.
- Verdict: DIAG-NO-STRAND by the prereg's own rule — NO seed
  strands on control legs at all, so the lever's joint proof
  cannot be exercised. Explicitly NOT a lever NO-GO.
- Pilot lever leg (the only lever leg judged anywhere): 4
  ruin runs, all to the (5,4) ruin next to haven, all
  returned home, 0 unreached, 8 searches, kcal healthy
  throughout (1987–2300 after each run). Finds: leather
  jacket, machete, memory lantern, oath ring, can soup,
  can corn x2, jar peaches — 0 hatchets. That is ordinary
  queue luck, not a lever failure: ruin queues are random
  with-replacement samples from the region's common pool
  (11 commons in the eastern pool → ~9% hatchet per draw,
  ~31% per 4-item queue; ~47% chance of no hatchet in 8
  draws). Pilot gate PASSES on completeness + determinism
  (lever re-run byte-identical). Two pilot-caught fixes,
  disclosed: (1) a stale-variable bug discarded the first
  pilot lever leg (deleted and re-run, never quoted);
  (2) the ticks guard is ticksLeft <= 64, not < 64, to honor
  the prereg's day-boundary invariant (proven on the buggy
  leg: a search landing ON the boundary fired endDay and
  burned the vessel's food to zero).
- Confirm control census (16 seeds: prereg bank + fresh
  band 15003/15009/15091/15211/15220/15221/15337/15376/15439/
  16401–16407): still creek evenings 0 on ALL 16 legs,
  strand mornings 0, pairing 0 — joint denominator EMPTY.
  Evening outcomes overwhelmingly 'completed' /
  'already-inside'; travel refusals exist but are never
  creek ('out-of-reach' 10, 'blocked-combat' 3). Every
  genuinely-away morning carries wood EXACTLY 4 — none is
  needs-wood even under a looser "slept away, any cause"
  definition. The strand is doubly dead. Survival to day 30:
  14/16 (16401 village-lost day 24, 16404 village-lost day
  12). Wave reach: wave 1 on 2 seeds, wave 2 on 12, wave 3
  on 2. Control axe by day 7: 2/16, reported not judged
  (15221 day 1 stash fetch at haven, never fell-capable;
  16402 day 5 succession-arrival — the successor ARRIVED
  carrying a hatchet equipped, refining 0841Z: a hatchet is
  NOT inherited at succession but a successor can arrive
  holding one of their own; the classifier has no
  succession-arrival class yet).
- DATAHOLD (commit 9e22415eb, on master): the arm's
  regions.json hatchet entries (42 insertions across the 6
  list-pool regions) were REVERTED — master regions.json is
  pre-axefirst. The lever is unjudged, so its data must not
  ship ahead of proof; re-apply when the strand set is
  re-derived. The sim-only policy + instruments stay on
  master (env-gated, default-OFF, scripts/ never ships to
  players); only game-content data was held. This is the
  data-vs-sim-prototype distinction, stated for the next
  datahold decision.
- Proof 155/155 with corpora (59/59 without); validate-
  regions.js 20 regions, 6 playable, 0 errors.
- Telemetry deviation check (this arm): LOUD for national
  (baseline 12 → current 0), table (16 → 0), wins (16 → 0) —
  investigated, NOT a deviation: the baseline is a
  long-horizon scale-wall baseline; the current legs are a
  30-day pre-seat stack on which national/table/wins are
  structurally 0. No exiled deviation line. Baseline NOT
  rolled.
- check.js --quick triage (this arm's tree, run twice):
  284 passed / 6 failed, then 283 passed / 7 failed (the set
  varies between runs). The ONLY failure with any plausible
  link to this diff, scripts/godpath/test-phone-frame-proof.js
  (it hashes boot inputs including regions.json), is PROVEN
  PRE-EXISTING by hash comparison: the retained hashes in
  scripts/phone-frame-proof.json match NEITHER the pinned base
  NOR this tree — for regions.json AND for index.html, a file
  this arm never touched (index.html byte-identical between
  pinned base and this tree, yet still mismatching retained).
  The proof was already stale on the pinned base; refreshing
  it needs a browser receipt task and hand-editing hashes is
  forbidden — flagged for the coordinator/ship loop, out of
  scope here. The other six failing scripts contain ZERO
  references to regions, scavenge, or data files (grepped) and
  fail on code areas untouched here. docs/ONTOLOGY.md was
  modified by the check run itself (validator refresh for the
  already-landed lootabilities Arm 6) and restored to base
  state before commit; it is not part of this arm's change.
- §15 panel: non-applicability declared (same strand-stack
  exception as prior strand arms).
- Metric review carried forward (worker's own): ticks guard
  (state the invariant, let the number follow); window on
  loop-days, not gameDays (base-daily day rolls skip
  gameDays); strand definition (decide whether "slept away,
  any cause, wood < 4" is the strand, and WHY creek refusals
  vanished); succession-arrival classifier class; MOOT-
  PACK-READY joint status (adopt or reject explicitly next
  time, don't inherit silently). No metric re-scored mid-run.

## Arm 3 — sim-corpsemove-b: DIAG-NO-GO (trajectory divergence), mechanism NAMED

- Landed: prereg 834e3c14c (binding, before judged legs),
  DIAG 41128e0e7. DIAG ONLY: zero src/js changes, zero
  policy-default flips, zero edits to any existing policy
  file or existing script. New files only.
- Verdict: DIAG-NO-GO against the prereg — a trajectory-
  divergence failure, NOT a failed mechanism hunt. The
  prereg's fresh-corpus condition was NOT met, so no GO is
  claimed per metric binding (a miss is NO-GO, never
  re-scored against a friendlier metric mid-run). On THIS
  tree's base, seed 15215 ON never strands, never dies, and
  never produces Gabriela's corpse at all: Gabriela Ludwig
  (gen_gyft62f) is the bearer on every morning 2-30, all 30
  evenings end at Haven, no bearer change on any of the 8
  pilot seeds. The divergence is the BASE, not the
  instrument, proven by control: the ORIGINAL toolloss-gap
  driver, run verbatim on this base for 15215, diverges
  identically (Gabriela alive all 30 days, evening 7 at
  Haven). This arm's driver reproduces the control driver's
  morning and evening sequences exactly on this base.
- The mechanism — NAMED and traced (finding, not a GO
  claim): THE VILLAGE BRINGS ITS DEAD BEARER HOME.
  Game.recoverBearer() in src/js/corpses.js (rule
  the_village_brings_its_bearer_home, journey-succession
  r9), called from Game.endDay() in src/js/game.js, queued
  by ledger.js playerDeath as village.pendingBurials
  { corpseId, villagerId, name, day } with day = the scholar
  day at death. Firing condition: scholar.day >
  pending.day (strictly greater), so the endDay of the
  death day itself does NOT fire. On 15215: death day 17,
  due endDay 18, body at Haven by morning 19 — which is why
  the corpse sits at the creek for TWO mornings after the
  death (17 and 18), not one. Effect (corpses.js:937-938):
  c.node = Haven (4,4), mx = 4, my = 4, recovered = true,
  deathKnown = true — the observed morning-19 snapshot's
  constants. The death pack rides home ON the corpse: items
  identical across the bracket, looted false throughout,
  Stone knife still aboard; nothing auto-transfers. It is
  the ONLY corpse-node writer in the codebase (grep).
  Excluded: daytime carrying (day-18 transcript has no body
  line), succession relocation (corpse still creek morning
  18), map recentering (all other corpses stable), any other
  node writer (none in src/js).
- Sense-test PASS on narration, with the honest limit: the
  move IS narrated in the overnight gap before morning 19
  ("That night, they bring Gabriela home. Nobody asks you
  to help carry; nobody has to. By morning the grave is dug
  by the fire, and the body is laid out beside it. The
  filling of it is yours.") — NOT a silent teleport. The
  carrier is "they" (the village as an anonymous collective),
  not a named villager — a texture note for when burial
  narration is next touched, not a bug claim, not built
  here (diag only).
- Pilot band (8 seeds, ON leg, this base): bearer changes 0
  on all 8, corpse moves 0 on all 8. Specificity confirmed:
  ONLY a dead bearer's body comes home (pendingBurials is
  queued only by the playerDeath ledger path); non-bearer
  corpses (villager + monster deaths on every seed) never
  move. No confirm band spent (confirm trigger — a second
  moved bearer corpse — could not fire with no bearer
  deaths).
- Proof 27/28. The single FAIL is the prereg-defined
  REPRODUCTION-GATE (the corpus does not reproduce the
  15215 creek/creek/Haven readings) — the expected
  divergence failure, recorded rather than hidden.
- Out-of-scope findings (for the backlog, NOT chased):
  [answered-by-trace, coordinator to mark] the corpse-move
  item itself (see Findings updates); [open] RECOVERY
  CARRIER IS ANONYMOUS (texture note); [open] SEEDED
  TRAJECTORIES ARE BASE-PINNED (method note: future
  preregs must pin the base commit and check base equality
  BEFORE the judged leg; the control-driver step — run the
  prior instrument verbatim on the new base first — should
  be standard).
- §15 panel: not applicable, as declared in the prereg
  (zero game-root changes; the before/after is morning vs
  evening snapshots on the same legs, never labeled a panel
  comparison).
- Instrument notes (disclosed): the first instrument run
  (8 seeds) was BROKEN (undefined variable in the morning
  block, daily() threw on day 2) and is NOT judged — caught
  by the counts check, fixed, full pilot re-run clean
  (29 mornings / 30 evenings per seed); the broken .jsonl
  was overwritten, never split, never judged.

## ROUND HEADLINE — one cause blocks all three arms

All three arms are substrate-blocked by the same cause: the
lootabilities Wave 2 + Wave 3 landings re-rolled the shared
RNG stream, voiding the 15215 strand trajectory (and the
toolloss trajectory with it). Seeded trajectories are
BASE-PINNED: seed equality is not trajectory equality across
bases, and a seeded sim's comparability dies with the base
that generated it. This overturns the strand program's working
assumption that the strandbank set (15215 guard [7,8,9] / ON
[7..16], re-derived 2026-10-30) stays quotable across bases.

NEXT STRAND ARM MUST RE-DERIVE THE STRAND SET ON CURRENT
MASTER FIRST — sweeping wider than the 8-seed band (the
10-seed bank, then fresh seeds) — before ANY judging. Do not
re-run any strand-dependent lever's confirm until that set
exists. Future strand preregs must pin the base commit and
run a base-equality check (prior instrument verbatim on the
new base) before the judged leg. Whether strand arms should
judge on a FROZEN stream (pinned base + pinned policy set)
rather than current master is a coordinator/Steve decision
about what strand evidence means, not a worker call.
The strandbank backlog line ("quote this set as current until
the next base move") is superseded: the next base move HAS
happened (lootabilities w2+w3); do NOT quote the old set as
current.

## Wall numbers — UNCHANGED

Full seat 0, wave 5 reached 0 stands. National / table / wins
NOT observable as reachability on 30-day pre-seat stacks —
reported, never fabricated (axefirst confirm control: wave 1
on 2 seeds, wave 2 on 12, wave 3 on 2, survival 14/16;
fedevening pilot: all 8 survived 30 days; corpsemove pilot:
all 8 survived 30 days, wave reach 1-2 only). No wave-4/5
reach on any arm's corpus.

## Telemetry deviation check (round)

Axefirst's check (scale-wall baseline, national/table/wins/
exiled): LOUD lines investigated as a WINSEAT-baseline regime
artifact (same class as 1230Z); baseline NOT rolled. No
exiled deviation line. Fedevening and corpsemove declared
§15 non-applicability (strand census / zero game-root delta);
no panel result is fabricated for them. Round-level telemetry
is therefore: one investigated LOUD (regime artifact), two
declared non-applicable — no same-run investigation item
remains open.

## check.js --quick (round) — NOT cited as green

The round is NOT check-quick green and must not be cited as
such. What holds instead: zero src/js changes across all
three arms, zero policy-default flips, the only game-content
data edit (axefirst regions.json) reverted by the datahold,
and arm proofs green (fedevening 24/24, axefirst 155/155
with corpora, corpsemove 27/28 with the single FAIL being
the prereg-defined reproduction gate). The axefirst tree's
own --quick runs (284/6, then 283/7) are triaged in that
arm's evidence (phone-frame-proof proven pre-existing stale
on the pinned base). The main-session closeout ran no
--quick: this commit is evidence-only, and a sibling run's
jest was active at closeout time (never run two jest
processes concurrently).

## Tracker + findings + memory (this closeout)

- Convergence tracker: 1430Z review entry appended (this
  file's summary); food-economy axis line unchanged — still
  CONVERGING (NOT converged). No default flipped, no balance
  change landed, no lever judged in this round.
- Sim-findings: (1) the line-1600 tool-tier flip was VERIFIED
  present at this closeout (inline [ANSWERED 2026-10-31 by
  toolloss-b] annotation on that line; the [open] prefix is
  retained by the file's convention) — the 1230Z recovery's
  stated flip stands, and corpsemove-b's corpse mechanics
  confirm the same succession picture; (2) the corpse-move
  item (line 1634) marked answered-by-trace with the
  re-proof caveat (fresh-corpus re-proof failed on the
  later base; needs a toolloss-base-pinned tree or a fresh
  bearer death on current master); (3) anonymous-carrier
  texture note appended [open]; (4) base-pinned-trajectories
  method note appended [open]; (5) strand-set-empty on
  current master appended [open] with the re-derivation
  directive, and the strandbank line superseded as above.
- Daily memory note appended 2026-10-31.

## Closeout (main session, verified against git + files)

- All three arms + datahold already on master at closeout
  start (HEAD 9e22415eb): fedevening cf9481a0d + 9be5362c7 +
  4e2f9663c; axefirst 8c138a569 + 53f7ac444 + datahold
  9e22415eb; corpsemove 834e3c14c + 41128e0e7. No merge was
  needed for them — the timed-out coordinator's merge step
  had in fact completed before the timeout; the closeout
  verified this by ancestry (branch tip == master HEAD) rather
  than trusting the timeout report.
- This closeout's commit (evidence files only, on closeout
  branch sim-food1430b-closeout, merged --ff-only): this
  file + the recovered 1230Z round evidence (with a
  main-session addendum: check-quick UNKNOWN disclosure and
  telemetry-LOUD note from the 1230Z worker's own report).
- Worktree/branch cleanup: sim-axefirst-datahold-b worktree
  removed (after the disk-wipe verification above) and its
  branch deleted (fully merged, tip == HEAD); the empty
  sim-food1230b-closeout branch (tip 19b3e1ae0, ancestor of
  master, 0 unique commits) deleted.
- Claim fleshout-loop-b-20261031T1430Z.json retired to .DEAD
  with note; fleshout-loop-b.lock deleted (run timed out;
  the next B run creates its own lock). The live 1535Z claim
  was NOT touched.
- Main tree verified clean after closeout. No push, no bump,
  no live verification — the batch ship job owns those.

## Disposition

No game change in this round: zero src/js changes, the only
game-content data edit held by the datahold, sim prototypes
env-gated and default-OFF. food-economy stays CONVERGING
(NOT converged). The round's product is a program correction,
not a lever verdict: the strand set is empty on current
master, and every future strand arm starts with re-derivation.
Merged locally, pending ship.
