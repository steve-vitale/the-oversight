# sim-scale-onramp-round-0815 — Loop A coordinator evidence (run fleshout-20261103T0815Z, axis scale-onramp)

## Stale-lock recovery (dead 0518Z run)

Lock fleshout-20261103T0518Z (05:18:55Z) was present at run start, but its
tree sim-feastdraww4-a heartbeat 06:25:04Z was ~2h stale at 08:23Z and no
feastdraw/curious worker processes existed — DEAD per the 15-min rule, not
by lock age. Its claim was retired to .DEAD with a recovery note. The
0518Z run's curiousw4 arm had already landed as KILLED (08cd8ab54); its
feastdraww4 arm had NOT landed — 2 commits lived only on branch
sim-feastdraww4-a, with a dirty prereg addendum and 16 pilot JSONs plus
two 0-byte confirm placeholders in the worktree. This run adopted that
tree (heartbeat refreshed 08:33:50Z) instead of re-merging blindly.
Sibling Loop B was live on food-economy throughout (claim
20261103T080700Z, then sensorconfirm3) — NOT touched. Pre-flight: main
tree clean, disk 32%, reaper removed nothing (16/16 worktree cap at run
start, all active trees dirty-protected).

## Arm 1 — sim-feastdraww4-a (recovery): KILLED, merged 5a38438cb

Question: does raising the rate of fresh armed feasts (armed cadence
7 days -> first dusk after buff expiry, policy-side only) convert the
wave-4 deed gap into wave-4 deeds? Pilot band 98601–98608, 180d
death-aware cap, closecommit baseline stack, same 7-flag env.

Pilot legs, recomputed from the 16 per-seed JSONs (the dirty addendum's
GO claim did NOT survive recomputation):

- (a) seeds with >= 1 wave-4 fought: baseline 3/8 -> variant 5/8,
  delta +2, exactly the GO bar. PASS.
- (b1) starvation deaths: 2 -> 2, bar baseline+2. PASS.
- (b2) fighter-attributed arm deaths: wrap count 0, bar <= 2 — PASS on
  the wrap, FAIL in substance. The driver's faceFeastDraw wrap reads
  Game.tbfight.id AFTER the wrapped call returns; node combat runs
  synchronously and tbfight is nulled at fight end, so the check can
  never fire (fdArmFightCount = 0 across all 15 layer draws while deed
  fights for drawn monsters exist). Transcript fight-sequence
  attribution (circling line -> fight header -> "You go down" ->
  death line -> mantle transfer, no intervening fight) finds THREE
  scholar deaths inside layer-draw fights: 98601 day 70 THE AUDIT,
  98604 day 62 THE EATER, 98606 day 44 THE CALLBACK. True b2 = 3 > 2.
  FAIL. Per prereg, anything else = KILLED.
- (b3) median survival: 86d -> 86d, bar 0.8x. PASS.

Confirm: NOT run to verdict. Per the brief, no confirm proceeds on a
failed pilot; the confirm band 98701–98712 remains fresh (its two
0-byte baseline placeholders were deleted as unjudged, never counted).
Kill protocol followed: policy + proof test deleted (proof was green
14/14 before deletion — it proves the deleted policy's gates, not a
landed change); prereg + driver + pilot JSONs + compare + evidence
kept. Wall numbers (pilot): national 0/8 -> 0/8, table waiting/done
1/4 -> 0/4, wins 4 -> 4, wave-4 unlocked 5/8 -> 5/8, wave-5 0/0, median
survival 86d -> 86d, max 114d -> 92d. The knob moved draws (15 layer
feasts -> 15 draws, 3 wave-4) and wave-4 facing, but nothing on the
wall itself — and its cost is concentrated in scholar deaths, which is
why b2, not the death totals (331 -> 323), is the right bar. No
competent.js change, no deploy. Full evidence:
evidence/2026-11-03/sim-feastdraww4-a.md, compare
evidence/2026-11-03/feastdraww4-compare.md. Landing: rebased 4/4 clean
onto the moving master (Loop B guarde-deploy/sensor landings, zero
file overlap, arm-file diff identical: 20 files, +14842), merged
--ff-only as 5a38438cb, policy/proof absence verified on merged tip,
tree released/removed, branch deleted.

## Arm 2 — sim-sortiev2-a (diagnostic): RETRY BLOCKED ON Q2, merged e88e9c1ff

Questions the 0316Z entry said must be settled before any sortie
retry, after sortie-b was KILLED. Prereg committed before any judged
work (ab337fcaf). No fresh sims ran — neither probe-clause trigger
fired — so wall numbers below are archive-only, never new movement.

- Q1 stale-offer invalidation: SETTLED-YES. A policy layer CAN skip
  stale offers on legal inputs only: on a verb return of 'none',
  invalidate every offer recorded before that return; a fresh gorge
  line after it may be answered; 'no-fighters' does NOT invalidate.
  The engine keeps no offer objects — a "queued offer" is purely the
  policy's record of a spoken gorge line; every lingering monster
  gorges nightly while the policy answers at most once/day, and the
  6-night drift valve then empties the treeline while the backlog
  remains. Corpus replay over the archive sortie-b variant JSONs:
  attempts 47 -> kept 30, suppressed 17; 'none' attempts 24 -> 7
  (exactly one per empty stretch); all 16 ok and all 7 no-fighters
  attempts kept — zero useful attempts lost; suppressed attempts are
  state-neutral ('none' returns before any muster/ration spend).
  Proactive age expiry was examined and rejected. Per-name moved-on
  invalidation is code-grounded with a knowledge-gating caveat (two
  unidentified lingerers can share one spoken string).
- Q2 target agreement: SETTLED-NO, on two independent grounds:
  answerLingerer(how) takes only the choice string and
  lingererSortie() takes no arguments — it fights every current
  lingerer in world-array order, and the offered name is never an
  input; and no legal way exists to know which lingerer is which
  (roster read or name-to-id lookup both fail perception law, and
  even with an id there is no parameter to pass it to). Exhaustive
  hook census: harness hooks, direct lingererSortie() call,
  world-array mutation, and the beats panel (one row, one button, no
  id) all fail. Correction to the brief's grounding: in game code
  the sole caller is app.js, but sim-side callers also call it — all
  pass only the bare 'sortie' string, which changes nothing.
- Retry readiness: RETRY-BLOCKED-ON-Q2 — needs a game-code arm. The
  fix shape is named in the evidence, not landed: thread an optional
  target through answerLingerer(how, targetId?) ->
  lingererSortie(targetId?), fight the match first (or only — a
  design call for that arm), and carry the id on per-lingerer
  beats-panel buttons; that arm must also solve the legal name-to-id
  join.

Proof test 6/6 green on the rebased tip. Zero src/js changes. No
[needs-eyes] — a diagnostic with no game change. Landing: rebased 2/2
clean onto the moving master (journey-scale r90, zero file overlap,
arm-file diff identical: 4 files, +571), merged --ff-only as
e88e9c1ff, tree released/removed, branch deleted. Full evidence:
evidence/2026-11-03/sim-sortiev2-a.md.

## Telemetry deviation check

Prescribed invocation on the feastdraw pilot glob REFUSED by design
(recorder-corpus rows carry anchorCommit — "compared with
sweep-compare tables, never against a run baseline here"). No LOUD
lines, and NO baseline roll-forward was made; the scale-wall baseline
is untouched. Same refusal class as the 0316Z and 0115Z runs.

## Metric review

- Never reuse a post-return tbfight.id attribution wrap — capture
  fight identity at fight start and prove the wrap fires on a known
  draw fight before any judged leg uses it; any future zero from an
  attribution wrap must be reported with its fire count alongside
  it. (Appended to sim-findings.md as a [method] item.)
- The fdDeedFightCount monsterId-match metric (60 for 15 draws)
  inflates wildly and must never be quoted as a fight count.
- Diagnostic verdicts are not GO/KILL bars: sortiev2's Q1/Q2 verdicts
  are mechanism settlements, and a future retry arm must pre-register
  its own bars (including a correct attribution instrument) rather
  than inheriting these.
- Lever rotation file NOT bumped (still 3): this run worked the
  scale-onramp axis under the standing directive, which overrides
  the lever rotation; bumping would misattribute axis work to a
  rotation lever.

## Village assessment, in plain words

Feasting more often did put more wave-4 monsters in front of villages
— three of the extra feasts drew a wave-4 beast, and two seeds that
had never faced one now had — but the price was paid by the scholars
themselves: three of them died in exactly the fights the extra feasts
summoned, while not one village moved closer to national standing or
the full seat. The feast knob is therefore dead as a scale lever, not
because it does nothing, but because what it does costs the people
the village can least afford to lose. On sorties, the good news is
that a village CAN learn to stop answering empty invitations — the
rule for telling a stale one is proven and loses nothing useful. The
bad news is that even a perfectly aimed invitation cannot choose its
fight: the game, not the villager, picks who shows up, and fixing
that needs a change to the game itself, not a smarter policy. So the
sortie road stays closed until that game-code arm lands.

## Infrastructure

- Worktree cap 16/16 at run start; both arms landed without new slots
  by adopting (feastdraw) and by waiting out the queue (sortiev2
  registration queued ~17 min on REGISTRY.lock; one register attempt
  was interrupted by a service restart with NO partial effect —
  verified no tree/branch/registry entry existed before retrying).
- Safe-commit index clobber struck on worker commits (repaired via
  HEAD-blob cacheinfo each time, commits verified correct).
- Master moved under both arms (Loop B landings, journey-scale r90);
  zero file overlap in both cases; rebases clean.
- check.js --quick NOT re-run: zero src/js, zero default flips,
  standing profile from prior runs.

## Convergence state

scale-onramp stays converging (NOT converged): the feast-cadence knob
is now a measured dead end on its cost leg, and the sortie retry is
now precisely blocked (Q1 settled, Q2 needs game code) — but no game
change landed in this run, the full seat is still unwon, and wave 5
is still unfought in normal play. food-economy untouched (sibling
Loop B lane).

Merged locally, pending ship (feastdraww4 KILLED 5a38438cb +
sortiev2 diagnostic e88e9c1ff + this coordinator evidence).
