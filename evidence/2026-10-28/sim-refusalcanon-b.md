# sim-refusalcanon-b — canon doc for ability-action refusals + pantry ledger accounting: GO

Run: fleshout-loop-b-20261028T1330Z, axis food-economy, arm
sim-refusalcanon-b. DOC ONLY: zero src/js changes, zero policy
changes, zero game behavior changes. Prereg:
evidence/2026-10-28/sim-refusalcanon-b-prereg.md, committed as
c48ef3241 BEFORE the doc was written (the commit hit the documented
safe-commit index-clobber variant — committed file showing as
staged-deleted plus an untracked duplicate; repaired per recipe via
HEAD-blob cacheinfo, verified with status empty + diff HEAD empty +
hash-object match before proceeding).

## Verdict: GO against the prereg

All four prereg legs hold:
(a) docs/ABILITY-REFUSALS.md exists and covers refusal timing,
    button honesty, once-a-day + day-roll predictor scope,
    caught-lift booking, pantry ledger accounting, and what a
    player actually sees — in plain words plus code/evidence
    citations.
(b) Every previously-named refusal/ledger blank from the grounding
    sources is either covered or explicitly listed as still-open
    with its evidence path (doc §8, nine items).
(c) Verification pass re-read the doc against its citations; three
    corrections were made before commit (see "Verification pass"
    below) and zero uncited claims remain.
(d) Worktree clean at handoff apart from this arm's committed work;
    committed via scripts/safe-commit.sh only; no push, no bump, no
    live check.

No sim band ran — a doc arm needs none, and no wall numbers are
claimed here. Wall numbers in this file are therefore absent by
design, not omitted: the grounding arms' bands are quoted inside
the doc where they belong (barwhy and calmbeast 8-seed bands,
stockdoors 8+12-seed bands), and no new national/table/wins
number is invented for this arm.

## What the doc covers

- **Refusal timing law**: refusals the game can see coming refuse
  BEFORE payment (precheck runs in _actionAvailable and in
  useAbility before cost); a refused tap costs nothing (0/0/0 on
  fixtures). Refusals discovered only after payment are real costs
  and must be narrated as such — the class the three world-state
  prechecks eliminated.
- **The three landed world-state prechecks**: war_cry.challenge,
  intimidating_presence.end_it_before, trophy_room.mark — with
  verbatim why sentences and the before/after pair (a paid night
  versus one line).
- **Button honesty**: the bar passes no target; prechecks are
  called with null; the scan-default pattern (challenge/end_it
  conversation scan, calm fight scan); disabled buttons show
  their why verbatim, enabled buttons carry no why (including
  legacy rows); availability parity.
- **Calm**: the button that lied ("Nothing here to calm." beside
  a live foe), the fight-scan fix, the monster guard, and the
  held monsters-uncalmable question.
- **Once-a-day + day-roll predictor**: pure prediction (0 deltas),
  exactly three actions in scope (challenge, end_it_before,
  dive_deep), the boundary rule (judged by the day the impl will
  see), the dive gap found and fixed, and the daily-gate inventory
  for the actions the predictor does not cover (and why each has
  no gap or is N/A).
- **Pantry ledger accounting**: the boundary-aware closing
  (post-run finalPantry, not last day-end), every door (meals,
  night surplus via stockSurplus, direct takes, spoil sweep, raid
  loot), closure numbers as barred, and the span-keyed dedup rule
  (the class is timing, not ability; PROBE-PROVEN means mechanism,
  never real play).
- **Raid loot**: the door the instruments missed
  (_removePantryKcal, villageAgencyDaily, 800 asked,
  longest-spoilDay-first), why tails looked like dried drops, and
  the to-the-kcal accounting on seeds 9738/9735/9825 plus the
  Canned soup corroboration.
- **Caught-lift booking (Appendix)**: −20 through bumpTrust with
  reason → tele('trust'); observe() table entry with witness
  effects and the seen-crime rule; trust ≠ reputation; a clean
  lift books nothing.
- **What a player actually sees** (§9, plain words) and a full
  source table mapping every claim family to its evidence file
  and code location.

Naming: docs/ABILITY-REFUSALS.md follows the repo's docs naming
(uppercase topical, e.g. docs/MONSTER-WAVES.md). docs/SYSTEMS.md
covers abilities generally but no refusal or ledger rule, so a
dedicated doc — not a SYSTEMS.md section — is the right shape.
The doc is registered in docs/CANON.md's manifest plus change log
(the repo's own convention for canon docs); both edits are
docs-only.

## What stays open (doc §8, nine items — none resolved here)

1. Pantry-lift conversation line — Steve-call, OPEN. Who should
   remember a victimless pantry theft is a design question; the
   doc records it as open and does not resolve it.
2. Sibling re-proof (branch sim-postpayrefusal-b) — UNMERGED, not
   claimed. Its tip ab51f772c is a prereg commit only ("re-proof
   of landed prechecks, scope correction"), NOT an ancestor of
   this tree's HEAD. The prechecks themselves ARE landed via
   sim-refusalprecheck-b (10ef1e627, ancestor of HEAD) — the doc
   keeps those two facts separate and does not depend on the
   sibling's files or code.
3. Monsters uncalmable — Steve-call, OPEN.
4. Fled-fighter edge in the calm scan — OPEN, same class before
   and after.
5. In-combat button states for scream_cheese / cheese_wheel — NOT
   fixture-proven (code argument only).
6. Ledger paths still unproven in band play: event-take,
   bulk-take, child pantry-eat (lift and raid have since been
   proven by fixtures and the driedhunt re-run).
7. Real-play promotion band for the 15 PROBE-PROVEN span keys —
   OPEN (mechanism only until an unscripted band recurs one).
8. Cultivate hall gate on fresh setup — fixture fact, not a defect.
9. Message-log ring named for future preregs (sentence, not a
   booked move).

## Village assessment (plain words — what a player actually sees)

Nothing in this arm changes what any village does; it writes down
rules the village already lives by, so a future builder does not
have to re-derive them from fixtures. In the player's own terms:
a greyed-out button now explains itself instead of making you tap
to find out, and a live button never carries a dead reason. A tap
at the last hour of the day is judged by tomorrow, not by the day
you started on. Trying to calm a fight is a real attempt that
costs your turn, not a button that claims nobody is there. Getting
caught stealing costs 20 trust and is written down with its
reason, and if someone saw you, they think worse of you and the
story travels. Raiders who hit the stores while nobody answered
the treeline call take named, narrated loot — and the pantry
number moves through a door the ledger can now see. Behind it
all, the pantry closes: food in, meals out, surplus saved,
spoilage swept, loot taken, no dinner counted twice because a tap
happened to hold the night. That is the whole doc in one
paragraph, and it is all already true in the game — the doc's job
was to say it in one place, with the receipts attached.

## Verification pass (re-read of the doc against its citations)

Three corrections made before commit; no other uncited claim found:
- Challenge bullet first draft asserted an "alive" check the code
  does not make: the precheck tests active conversation plus
  roster membership, and "alive" lives only in the refusal
  sentence. Reworded to match the code, sentence still quoted
  verbatim.
- §8 item 6 first draft miscounted the remaining unproven ledger
  paths as four: the stockdoors zero list has five paths, of
  which lift (fixtures) and raid (driedhunt re-run) have since
  been proven, leaving three (event-take, bulk-take, child
  pantry-eat). Corrected.
- Sources table first draft cited the refusalprecheck evidence
  under 2026-10-27; the file lives under 2026-10-28
  (evidence/2026-10-28/sim-refusalprecheck-b.md). Corrected.
  (The committed prereg carries no file path for that evidence,
  so no prereg correction was needed.)

## Doc/code discrepancies found while writing

None requiring a fix. Two evidence statements have been superseded
by landed code, and the doc states the landed code with the
motivating evidence cited — this is evidence aging, not a repo
discrepancy:
- sim-onceaday-scope-b said the predictor is called ONLY by
  challenge/end_it_before; the dive fix (0761aab9b, ancestor of
  HEAD) added dive_deep. Doc §5 scope table lists exactly three.
- sim-spandraw-design-b said the three world-state actions had NO
  precheck; sim-refusalprecheck-b (10ef1e627, ancestor of HEAD)
  landed them. Doc §2 states the landed prechecks; §1/§6 keep
  the refused-but-crossed finding as the history that motivated
  them.
No TABLE.md/sysBond-class discrepancy (doc claiming what code
contradicts) was found in this arm's area.

## Checks and limits

- No jest run: there is nothing to test in jest — this arm changes
  zero src/js and zero scripts. No node check is claimed for the
  doc itself; the sanity grep below (no leftover drafting
  artifacts, no TODO) is the only mechanical check, and it is
  reported as such, not as a test suite.
- No balance-panel compare: there is no before/after game leg
  (zero game changes), so the panel has no pair to compare — the
  standing panel exception, stated not faked.
- Landing status of cited fixes verified by git log in this
  worktree (ancestor-of-HEAD checks): refusalprecheck-b 10ef1e627
  YES, divedeep-fix 0761aab9b YES, calmbeast 2d9ef7c7e YES,
  barwhy 60f873319 YES, caughtlift-fix 98784fc00 YES;
  sibling postpayrefusal tip ab51f772c NOT an ancestor (prereg
  only). If master moves before the coordinator merges this arm,
  re-check the sibling branch before repeating item 2 above.
- Out of scope, untouched: scale-onramp work, home-village birth
  work, the main tree, every other run's worktree, the tracker,
  and the findings backlog (coordinator-owned; this arm's open
  items live in the doc's §8 for the coordinator to route).

## Metric review

- The prereg's GO bar judged a document, not a sim effect; all
  four legs held exactly as written, with no re-scoring. The three
  verification corrections above were fixes to the doc, not
  re-scoring of the bar.
- Doubt for the NEXT run, not this one: canon follows measured
  evidence, so if later code contradicts a rule here, revise the
  doc first with the new evidence cited — do not silently keep a
  rule the game no longer follows. The doc's change note says
  this explicitly.

## Commits (branch sim-refusalcanon-b, no push, no bump, no live check)

- c48ef3241 — prereg (committed before writing; clobber repaired
  and verified).
- (this run) — docs/ABILITY-REFUSALS.md + docs/CANON.md manifest
  registration + this evidence file. Worktree clean at handoff
  apart from this commit; report 'ready for coordinator merge,
  pending ship'.
