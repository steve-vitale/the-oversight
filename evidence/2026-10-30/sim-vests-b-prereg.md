# sim-vests-b — prereg (DIAG ONLY, committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261030T1130Z.
Axis: food-economy. Arm: sim-vests-b — MEASUREMENT ONLY.
Backlog item: sim-findings #1494 (2026-10-30, loop-B arm sim-wall-b):
vests 0/8 on competent play, 180d death-aware, seeds 9981–9988.
Base pin (HEAD at prereg time): fe1e46f53044453d864b195bb087929d05d993b6
(worktree branch sim-vests-b; coordinator merges, worker never pushes/bumps).

## Scope guard (binding)

DIAG ONLY. Zero src/js changes, zero policy-default changes, zero default
flips. Only instruments and recorders: scripts/sweep-vests-b.js (census
driver), scripts/test-vests-b.js (proof), evidence files. If a panel
compare needs leanlink in the sweep registry, that addition is
instrument-only (one additive registry line, zero behavior change to
existing entries) and is committed separately, never bundled silently
with a judged leg.

## Canon read first

docs/CANON.md, then docs/BALANCING.md / docs/SCALE.md as relevant.
Canon finding up front (from code, not invented): no canon doc covers a
vest-acquisition channel specifically. The mechanism comes from code:
- VEST_IDS (sweep definition): military_vest, swat_vest
  (scripts/sweep-compare.js stdSnapshot; equipment.js torso slot).
- Generation channel: game.js genItemCandidates — pool is class != food,
  lootTier <= 2, origin != alien. Both vest defs (items.json, no origin,
  no lootTier so 1) ARE in that pool; choosePersonalFive scores armor by
  protection x 5 (military 40, swat 35), so a dealt vest is usually kept
  among the villager's 5, the other 3 going to stashed.
- Alien-loot channel: game.js rollAlienLoot — pool filter is
  (origin == 'alien' OR id in rewardEconomy.extraItems[tier]) AND
  lootTier == tier. Neither vest has origin 'alien', and neither is in
  extraItems tiers 3/4 (reward-economy.json). So monster loot, contest
  prizes (_cxItemPrize) and trader wares (visitorWares, rewardSource
  'trade') can NEVER roll a vest. apWackyGift uses the same filter.
  This is the code-level hypothesis the census must check against play,
  not a verdict in advance: generation may still deal vests, and
  corpse-looting / trade / wear may still move them.
- Sweep blind spot (hypothesis, to be measured): sweep-compare's vest
  count reads ONLY the scholar's pack/equipped at daily snapshot, and
  reads entry `.id` while inventory entries are stored under `.itemId`.
  A villager-held vest, a stashed vest, or a vest stored under itemId
  would all read as 0. The census below therefore scans scholar +
  every roster villager, pack + equipped + stashed + fullPool, under
  itemId || id || plantId, every day, plus end-of-run.

## Question (two columns, identical seeds)

(a) competent play, fresh band, 180d death-aware — reproduce the
0-vests result and record, per seed, the vest-channel state from
recorded game state: vest items ever held (all holders, all locations),
by whom, first-seen day and location, source event if any (loot_dropped
/ loot_taken / broadcast_item_prize tele with that id, else day-0
generation), and the four-realm + seat-gate state with the blocking
gate named from code (deedGateReady() breakdown fields, tableSeat()
detail, hierarchyState links, scaleRank()).
(b) The SAME seeds under leanlink (scripts/policies/leanlink.js,
LEANLINK=1 — the existing default-OFF courtship instrument; competent
is untouched, no default flipped). If (b) produces vests, the gap is
policy behavior; if it also produces zero, the gap is channel
reachability. The verdict names one of: policy-behavior gap /
channel-reachability gap / mixed, with numbers (see decision rule).

## Primary metric (binding)

Per column, per seed: EVER-HELD vest count = distinct (holder, vest id)
pairs ever observed in pack or equipped (stashed and fullPool reported
separately, never folded into ever-held). Column totals and per-seed
census are the verdict. Secondary, for comparability with sim-wall-b:
sweep-definition vests (scholar pack/equipped snapshot max, itemId-aware
recount) per seed.

## DIAG-GO threshold (this is a diagnosis, not a landing)

GO (the question is answerable from this pilot) iff ALL of:
1. All 8 seeds complete in both columns (a seed that ends early by
   village-lost still counts — death-aware horizon, end state recorded).
2. Day-0 census present for every seed in both columns (generation
   visibility proven: fullPool + items + stashed scanned before day 1).
3. The leanlink instrument demonstrably fired in column (b): at least
   one proposal (ctx.proposedLead > 0) or counter/accord answer on
   >= 6/8 seeds, OR links formed — otherwise column (b) is not a
   courting column and the pair proves nothing (re-run, not re-score).
A miss on any leg is NO-GO for the verdict, never re-scored against a
friendlier metric. Metric doubts go under "metric review" below and in
the evidence file.

## Decision rule (pre-registered, applied to the pilot as run)

- policy-behavior gap: column (b) ever-held total > column (a) total,
  AND the holder histories explain the difference (e.g. (a) holders
  lost by death without looting, (b) holders kept / looted / traded),
  with the histories quoted per seed.
- channel-reachability gap: both columns 0 ever-held in pack/equipped,
  AND (generation dealt vests into fullPool/stash on >= 1 seed, or the
  rollAlienLoot exclusion proof holds for all three loot paths) — the
  channel never converts a dealt vest into a held one, or never deals
  one at all, regardless of courting.
- mixed: generation deals vests to villagers but the scholar never
  holds one (sweep metric blind to villager holders), and/or courting
  moves the scholar-held count while villager-held stays flat. Report
  both parts separately; never collapse mixed into one label.

## Horizon + why

180d cap, death-aware: runDays stops at Game.over; a run reaching the
cap is reported AT CAP, never as a death; +10d tail max is inherent
(runDays ends the run when the village is lost). Why 180: identical to
sim-wall-b, so the reproduction is on the same horizon; the wave-4/5
window and the table approach are inside it, and no fixed 200d is used.
Dead/scattered villages stop simulating.

## Seeds (fixed up front, never re-screened)

Pilot: 9911–9918 consecutive. Freshness check (done before writing this
prereg): no evidence/2026-10-29 or 2026-10-30 *.md run uses 9911–9918
as a seed band, and no evidence/2026-10-30 corpus filename uses them;
the wall band 9981–9988 is deliberately NOT reused. (Older files
contain these numerals incidentally as values, not as seed bands —
the check is against run bands and corpus filenames, as tasked.)
Confirm (only if the pilot verdict is AMBIGUOUS, defined below):
9919–9934 (16 seeds), same two columns, same horizon. Ambiguous =
total ever-held events across both columns <= 1, OR any seed missing
its day-0 census, OR the columns differ by exactly 1 holder-event.
Otherwise the pilot verdict stands and no confirm spend is made.

## Policies (exact)

- Column (a): scripts/policies/competent.js, defaults only, no env flags.
- Column (b): scripts/policies/leanlink.js with LEANLINK=1 for that
  process only (separate node process per column, so the env gate
  cannot leak into column (a)). No other env flags.
- Driver: scripts/sweep-vests-b.js (new instrument). Command per column:
  SEEDS="9911,...,9918" POLICY=<competent|leanlink> DAYS=180
  OUT=evidence/2026-10-30/sim-vests-b-corpus-<policy>.json
  PERSEED_DIR=evidence/2026-10-30/sim-vests-b-corpus-<policy>
  node scripts/sweep-vests-b.js
  (LEANLINK=1 prefixed for the leanlink column only.)
- The driver wraps policy.daily the way sweep-compare does (census
  BEFORE the day's verbs), reads only: scholar inventory/equipped,
  roster villagers via data.villagers lookup (never getPerson on an
  unknown id — no hydration), hierarchyState(), scaleRank(),
  deedGateReady(), tableSeat(). It records tele events
  (loot_dropped, loot_taken, broadcast_item_prize) with vest ids only.
  PERCEPTION LAW: the recorder reads game state; it never feeds a
  roster or list into a villager decision and never decides for a
  villager.

## Balanced panel (§15)

Best-effort instrument artifact; the judge is the census + the
thresholds above, not the panel scorecard. Attempt: one panel per
column (balance-panel.js --seeds 9911,...,9918 --policies <column>
--days 180), then `compare --before <competent panel> --after
<leanlink panel> --out <prefix>` with the compare .md attached. The
stock sweep registry lacks leanlink; if the compare needs the additive
registry line, it is committed separately as instrument-only and its
neutrality is proven by the panel's own observe on/off proof plus the
determinism gate below. If panel cost exceeds the run budget or the
registry addition fails neutrality, the fallback (stated, not hidden)
is the wall pattern: a single competent panel as instrument artifact
plus the identical-seed census JSON as the §15 substitute, with the
missing compare named in the evidence file.

## Determinism gate

- Re-run: one seed x both columns, full 180d, twice; per-seed JSONs
  byte-identical (no wall-clock or timestamps inside the JSON).
- Instrument neutrality spot check: driver competent 40d on one seed
  vs sweep-compare competent 40d on the same seed — days, wave, rank
  and death totals must match (census reads must not move the game).

## Sense-testing

Sample villager days from the census itself: for one competent seed
and one leanlink seed, report roster trajectories (who held/stashed a
vest, who died holding what, whether courting talk reads as people
courting or as counters). Robotic/static/repeated flags named or
explicitly "none found" with the sample named.

## Wall numbers reported for this corpus

national / table invited / table entered / wins, wave 4 unlocks,
wave 5 unlocks, median + max survival, death-cause shares, Arc reach,
rank reach — per column, from the same per-seed rows.

## Metric review (filled at evidence time, not now)

- (To be filled in sim-vests-b.md: was the ever-held definition right?
  Did stashed/fullPool need separate treatment? Did the panel compare
  materialize? Any metric that proved wrong is proposed for the NEXT
  run here, never re-scored mid-run.)
