# Favor lifecycle and legacy midnight repair

Candidate build: `4b196689c-20261020-204829`. Runtime commits d0d92786a and
4b196689c; merge 999c69491 includes Muse recovery f11f1eab5. Shared ancestry
is preserved. The five restored Muse fixes were inspected in the actual diff;
contests.js and party-formal.js match f11f1eab5 byte-for-byte, and its added
game.js regions remain intact. Only generated stamps conflicted in the merge.
Do not use the intermediate a864 panel as this merged candidate's baseline.

## Player behavior

Menu → Journal → People displays accepted food/wound/illness requests, their
requirements, effective due day and completion/expiry. Task identity survives
same-word repeat jobs. Reading is pure. The existing journal now scrolls
internally with Back always visible; its existing entry moved from Place to
Menu. No duplicate journal or task panel was added.

Matching deeds remain valid during the due day; unrelated actions cannot
expire the promise early that morning. The nightly sweep expires unfinished
tasks, and late help does not rewrite the broken promise or earn kept credit.
Reminder questions no longer let generic yes/no replies hide the real action.
Five joint jobs remain explicitly unavailable with no active clock/penalty.

The expiry phone journey found a real old-save failure: the retained played
seven-square map crashed at midnight in fixed-nine-square regrowth and trap
scans. World traversals now use saved dimensions; absent tile rows return
undefined like absent columns. The real legacy map and terrain are preserved.
Current nine-square traversal order is unchanged. No numerical food, reward,
HP, damage or difficulty offset was introduced.

## Proof and limits

- `favor-journal-green-r4.log`: 33 focused shared-kit lifecycle checks.
- `favor-journal-actions-r2.log`: 50 existing physical action checks.
- `favor-journal-legacy-nightfall-red-r1.log` and `...green-r3.log`: the
  historical save failed real Wait at midnight; all6 checks now pass,
  including weekly depletion and unchanged saved map dimensions.
- `favor-journal-existing-lifecycle-green-r1.log`: existing81-check favor
  suite passes. Its old broken-journal assertion now requires explicit
  expired status AND original favor identity; it was not weakened.
- `favor-journal-phone-{736,844}-r5.json`: 19 trusted-touch checkpoints each,
  no outer scrolling/page errors, real acceptance, return-care, completion,
  due-day Wait, expiry and Continue. Prepared needs/clock in an actual retained
  played save are declared, not natural encounter or long-campaign evidence.
  Viewed screenshots retain Accepted, Completed and Expired rows at736, plus
  Accepted at844. Back remains visible; reader scrolling is deliberate.
- `favor-journal-frame-{736,844}-r2.json`:16 ordinary/combat touch checkpoints
  each,162 current boot inputs plus two verification sources, real zero-move
  Wait/escape, no page errors.
- `favor-journal-lifecycle-r2.json`: real installed Muse f11 build → candidate
  worker update preserves localStorage byte-for-byte; cold offline Continue
  boots the candidate. This checks update/boot; the separate favor journey
  checks actual midnight on the legacy map.
  The earlier r1 did not establish an installed old worker (the compact archive
  lacked manifest.json); it is superseded. r2 includes the original manifest
  and requires the old worker's actual controller URL/cache before updating.
- `favor-journal-quick-r3.log`:267 quick scripts green, including four added
  Muse recovery scripts covering all five restored fixes. The invitation
  proof failed on f11 too because its opportunity had no rendered residents;
  the prepared daytime/nearby-resident probe now passes6 checks. r20's RED
  reference is an immutable pre-fix commit, not a mutable master merge-base.
- `favor-journal-full-r2.log`:1,039 scripts pass,0 fail in210s.

The native journeys are Chromium/Edge touch emulation, not physical-device
release clearance. Broader conversation prose/callback quality remains open.
The reusable preparer/runner and retained helper are included beside these
receipts; use a fresh output tag rather than overwriting proof files.

## Balanced screen and decision

Retained `favor-journal-muse-{before,after}-r1.json.gz` use the same current
observer, harness and policies,16 matched seeds per capable/maker/merchant/
caregiver,150 controller iterations. Baseline is a compact immutable archive
of f11f1eab5 (src/scripts/tools/index/SW/version, no inherited parent Git HEAD).
Both arms are source-stable,64 observed cases plus four matching zero-warning
observer controls. Source/configuration hashes are in each panel; case caches
remain local and are not committed as gameplay artifacts.

All23 metrics and exploratory intervals are in `favor-journal-scorecard-r1`.
Wins:15→16,12→8,11→13,11→8. Decision **review_required**. Retain capable
death/day-60-coverage, maker Table/death, merchant survival/class and caregiver
Table/survival/death/class warnings. More wins cancel none. Craft/trade earned
tier3+ gear is zero in both arms under these mixed controllers; inspect actual
opportunity before interpreting that nonuse. This does not prove pacifism or
small-effect equivalence and is not64-seed holdout confirmation.

`favor-journal-replays-r1.cjs` preselects every binary win flip plus the largest
adverse deaths, NPC-hunger and earned-gear change per policy when present
(ties by seed), yielding21 pairs. Each replay matches its original full final
state, outcome, all metrics and warning/observer guards. Ordered boundary
comparison first differs in trust for20 pairs and NPC needs for one. Those
coarse associations do not establish ending causality. The raw compressed
replays, plans and compact review are retained. Decision: keep the correctness
repair, preserve warnings and ask Muse to calibrate the shared source; do not
restore false/early settlement or tune difficulty to recover a percentage.

## Follow-up

The next bounded goal is one complete water-hauling favor, with real travel,
carry/handoff, recipient/resource effects, durable progress/deadline and mobile
blocked/expiry choices. The other four joint jobs and public-release/physical
device gates stay open. Handoff: docs/MUSE-CALIBRATION-HANDOFF.md.

## Publication readback

Shared release d6880d7ade7b7fea0953e4ef58d1f93afe88488e fast-forwarded
origin/master, origin/main and origin/codex/favor-quest-deadlines-20261020
atomically. Production advertises build4b196689c-20261020-204829. The retained
publication receipt verifies all162 deployed boot inputs against local hashes
and a clean fresh390×736 touch browser boot,0 page errors. The primary local
master/main checkout was advanced normally; the foreign sweep-B.log edit was
preserved. A subsequent evidence-only commit retains this readback without a
new player-facing build stamp.
