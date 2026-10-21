# sim-thiefgate-b — backlog #720 verification: no lever needed (sibling fix already landed)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261021T0856Z.
Arm brief: backlog #720 — policy-scholar Light-Fingers theft spam
("Caught red-handed! Trust -20" ~30x in 10d, no cooldown).
Worktree: ~/workspace/worktrees/sim-thiefgate-b. Tree was created at
406893331, already rebased to master b76bcddd0 before work began
(HEAD == master, tree clean; `git rebase master` a no-op).
Axis: food-economy/trust surface.

## Pre-registration (binding, MEASUREMENT.md §14)

Recorded before any sims. PRIMARY: caught-spam events ("Caught
red-handed" -20 on ordinary communal takes) armed <= control/10 on the
finding's substrate (leadfeast, FEASTSCALE_R13=1, SEATDRIVE=0,
SURPLUSFEED unset). GUARDRAILS: genuine theft still punished (scenario
check); median survival >= control-10d; national >= control-2; no new
death mechanism. Horizon 180d death-aware. Fresh seeds 8921-8928 x
{leadthief,belongthief}, inline freshness assertion.

## Pre-sim discovery (no duplication)

Before writing a claim or running sims, this run read the tracker and
master history and found the arm's premise already answered: commit
e89c294b9 ("theft-detection: rate-bar the takeFromPantry trust nick
(fixes caught-red-handed spam on ordinary eating) [needs-eyes]",
landed 2026-10-21 02:32 UTC, run fleshout-loop-b-20261021T0134Z arm
sim-thiefcooldown-b) fixed exactly this finding on master. The
cumulative `net < -5000` bar in takeFromPantry / takeFromPantryBulk is
now `takeRate7(vid) - giveRate7(vid) >= 3000` (the #156 pre-registered
bar). The landed commit ships RED->GREEN proof
(scripts/test-thiefcooldown-b.js), two updated regression suites, a
post-fix 8-seed pilot corpus (evidence/2026-10-21/perseed-thiefcooldown-b/),
and full evidence (evidence/2026-10-21/sim-thiefcooldown-b.md).

Rerunning the pre-registered PRIMARY against "control" would have meant
re-introducing the defect to manufacture a control — the honest call is
NO LEVER: verify the landed fix holds on the new base (b76bcddd0) and
close #720. The metric is not re-scored; the premise is superseded.
This is recorded as the arm's verdict below, not a re-scored pilot.

## Verification on master b76bcddd0 (this run)

- scripts/test-thiefcooldown-b.js, MODE=green (Usage header read; no env
  trap — MODE is the only var): 10/10 GREEN. 30 paced ordinary takes
  (3x600 kcal/day x 10d, netRate7 ~1800/day) -> 0 caught events, trust
  15->15. Genuine-theft CONTROL: recorded 22000 kcal take history
  (netRate7 ~3142 >= 3000) -> caught coin voices "Caught red-handed!"
  and costs -20 (15->0); clean coin voices "You palm the food cleanly.
  No one sees." with no trust loss. DET-A donor byte-quiet, DET-B
  non-thief ordinary eater quiet post-fix (trust 15, 0 nicks).
- scripts/test-ledgerpenalty-20261014.js (#156 spec): 10/10 passed.
- scripts/test-takefrompantry-zero-trust-20261013.js: ALL GREEN.
- takeFromPantryBulk confirmed rate-barred on this base (netRate7b >= 3000,
  take history recorded before the bar). Zero file overlap with loop A's
  live trees (sim-twovets2/sim-windowreach2: kill-discipline policy +
  windowreach instrument) — file-disjointness guard holds; no fix lived
  inside their systems.
- Post-fix pilot corpus (landed): seed 8801 leadfeast, 100d survived,
  caughtTotal=0, caughtMaxPer10d=0, trustStart=15, trustEnd=85,
  trustMin=15, playerDeath combat d86. Finding observed ~30 caught in
  10 days pre-fix on the same seed/substrate. Wall numbers on the
  100d pilot: national 0/8, table 0/8, wins 0/8 (not a scale-onramp
  pilot; 6/8 survived to d100, 2 village-lost to combat attrition —
  the leadfeast policy's known profile, no new death modes).

## Sense read (SENSE-TESTING LAW)

Read the theft/trust voiced lines post-fix for meaning: "You palm the
food cleanly. No one sees." and "Caught red-handed! They saw you steal.
Trust -20." still fire with real stakes when a Light Fingers scholar
sustains over-share taking; the non-thief "Someone watches you take
food. They say nothing, but you feel it." now fires only above the
abuse bar. The fiction matches the mechanic — eating your share reads
as eating, theft reads as theft. Nothing robotic or repeated observed.

## Village assessment

No new sims were run by this arm (premise superseded); the landed pilot
covers it: eight thief-scholar villages on the finding's substrate look
like ordinary working villages — scholars eat their share from the
communal pantry and the village treats that as eating. Trust climbed
from 15 to 55-85 on every seed and never dipped below its start, vs
cratering to 0 within days of ordinary eating pre-fix. Who died and
why: every scholar died in combat (d54-91) or the village fell to
combat attrition — the leadfeast court's fighting-road profile, not a
trust mechanism. No starvation, no exile, no trust-collapse deaths.

## Design calls (numbered, for Steve's overrule)

1. NO LEVER / NO RE-BUILD: the defect class is closed in both take
   paths; building a second "cooldown" layer on top of the landed
   rate bar would be defense-in-depth theater (a new system where none
   is needed — ROOT-CAUSE-FIRST). If Steve wants a voiced "they're
   watching you" escalation beat before the -20, that's a fiction
   request, not a bug.
2. KNOWN REMAINDER (documented, not chased): justice.js moot-heat tiers
   still read the cumulative ledger (`net < -5000/-15000`) — same
   defect class, already open as #341's steve-call. Candidate next arm.

## Blanks filled / documented

- FILLED (by sibling, verified here): the takeFromPantry/Bulk
  cumulative theft bar. #720 closed in the findings backlog.
- DOCUMENTED: justice.js cumulative moot-heat tiers (same class as
  #341; steve-call already pending).

## Metric review

The pre-registered PRIMARY was not re-scored: the control premise was
superseded by a landed sibling fix, not by a failed measurement. Per
§14, the header stands as written and the verdict is recorded against
it: NO-LEVER (already fixed; verified on new base). No seeds from the
8921-8928 budget were consumed — none were needed; freshness assertion
moot.

## Convergence

Axis: food-economy/trust surface. State: this arm NO-LEVER — defect
fixed by sim-thiefcooldown-b (e89c294b9), verified GREEN on master
b76bcddd0. Zero-trace: no src/js touched, no layer to revert.
Instruments: reuse the landed scripts/test-thiefcooldown-b.js +
perseed-thiefcooldown-b corpus (no new scripts written).

Wall numbers (landed 8-seed 100d pilot): national 0/8, table 0/8, wins
0/8, wave-4/5 unlocks none observed, median survival ~100d (6/8 d100;
2 combat-attrition village losses at d85/d61).
