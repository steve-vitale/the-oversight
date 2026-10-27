# Loop B round 1730Z — food-economy, 2 arms GO, merged locally pending ship

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261027T1730Z.
Axis: food-economy (second non-converged axis). Loop A live at run start on
scale-onramp (claim fleshout-20261027T1715Z, arms sim-w5block-a +
sim-defnoffer-screen-a, NOT touched); A landed mid-run (coordinator
evidence 61f326408, w5block DIAG-NO-GO + defnoffer SCREEN-NEGATIVE) and
freed both its trees. Both B arms worked the 1430Z next blanks (1) and the
0530Z carried garden blank, in order. Both arms DIAG/measurement only,
zero src/js, no default flips. Base at arm start: 61f326408. Final master
after both landings: 2487effc3.

## Arm 1 — sim-dedupspan-b: GO (worker + coordinator re-run agree)

Commits: prereg 418e9f72f (before any rule run) + rule/proof/evidence
c01555aa0. Proof scripts/test-dedupspan-b.js: 33/33 PASS in the worktree,
post-rebase, and on merged master.
Rule (general, not a 9954 special case): a ledger summing directRecords +
mealDrawRecords now excludes, item-for-item, meal draws whose draw entry
falls inside a useAbility span, against the direct record that span
creates. Excluded records are retained and flagged `span-duplicate` with
span identity preserved; unmatched items stay counted; with no span log
the rule changes nothing (never falls back to day labels).
9954 corpus (cultnest faithful replay): 26 spans, exactly 1 creating a
direct record; 206 draw pairs, all linked, 0 ambiguous; exactly 2
span-internal draws (meal 466 + 474). Seq 124: excluded generic 3,800 kcal
exactly, summed generic 0, retained + flagged (green_whisper.cultivate,
evt 241 -> 246); total excluded 3,820 incl. the 20 kcal Fish unit.
No other record changed (1 of 262 changed). Deduped correct-alignment
generic residual 0; analyzer boundary residual shifts 3,700 -> -100, which
is the already-proven day-100 inflow timing gap, not a new residual.
Standing analyzers still sum the old way — future ledger runs must use
the new module scripts/dedupspan-ledger-b.js or they re-create the
residual; wiring it in is follow-up work, deliberately not done here so
no published figure was silently rewritten. Span-log foodState gap:
nest drawExit items lack foodState/granaryDays, so the match key is four
fields, not five — exact for seq 124 (all foodState null), but the logger
should carry foodState before the key is extended. Only corpora with a
span log can be deduped after the fact.
Evidence: evidence/2026-10-27/sim-dedupspan-b.md + prereg.
Sense: this arm has no narration surface — stated explicitly, no sense
check claimed.

## Arm 2 — sim-gardendeposit-b: GO, with one disclosed caveat (numbers unchanged)

Commits: prereg 1d7218107 (fbcbd6979 after rebase; before any trace
judgment) + evidence/analyzer/proof 2575c64b2 (2487effc3 after rebase).
Proof scripts/test-gardendeposit-b.js: 28/28 PASS in the worktree,
post-rebase, and on merged master. Zero fresh seeds spent; re-derived
from the existing 9760-9767 corpus.
Answer in plain words: the plots DO ripen — just never at snapshot time.
All 129 Lamb's Quarters deposits on seed 9762 are ordinary player garden
harvests taking the pack road into the pantry: the player sows (first sow
day 11), coaxes daily with Green Thumb/Whisper magic, the crop ripens
during the day, the competent policy's workGarden harvests it into the
pack, and the same routine's donateHaul donates the surplus via
donateToPantry -> depositPantryPieces. The prior "plots never ripen"
premise was a snapshot artifact: ripeness is a transient intra-day state
(growthLeft <= 0), and after harvest the clock resets to 28 days
regrowth, so every end-of-day snapshot reads ripe 0. The steady cycle is
visible in the snapshots: harvest day (28) -> 15 -> 2 -> harvest again,
a 3-day cycle under daily coaxing. First snapshot harvest day 17, first
deposit day 20 — a 3-day pack lag, the signature of the pack road, not
direct stock.
Counts: 9762 traced set 129 records, 396,750 kcal, 0 unclassified —
deposit door 129, stock (`Garden harvest`) 0, pantryAdd garden 0.
Cross-checked exactly against the independent inflows instrument (130
deposit records = same 129 LQ + 1 non-garden Burdock; stock Garden
harvest 0 despite 6 pantryAdd inflows on 9762). Band-wide: 276
garden-attributed records, all deposit-door, 0 stock, 0 pantryAdd,
0 unclassified. Timing: 68 snapshot harvest days vs 71 deposit days
(57 both, 11 harvest-only, 14 deposit-only); 99/99 garden resolutions
throttle-engaged; 0 NPC sows; 28 player LQ sows. NPC stock is doubly
closed for Lamb's Quarters: 99/99 throttled resolutions AND LQ edibility
is `caution` vs the NPC safe-only gate.
What gardenShares proves: harvest YES (minted only by harvestGarden on
a ripe plot), sow NO, wild-forage attribution NO (forage never gets
gardenShares; blends only propagate existing shares), shared-stock
bookkeeping YES as the carrier mechanism.
Caveat (disclosed by the worker, does not change any number): per-record
mover identity is unattributed — depositPantryPieces has two other
gardenShares-forwarding callers (homecoming pool, exile amends) that the
corpus cannot distinguish without a call-stack/caller tag. Both deposit
into another village's pantry and both require a garden-harvested source,
so the origin conclusion is unaffected; a next provenance arm should
capture a caller tag. The corpus also records gardenShares only as a
boolean, so assisted vs ordinary harvest class cannot be split per
record. If prereg leg (c) is read strictly as requiring per-record mover
identity, that slice alone reads PARTIAL; the verdict stands GO on the
legs as written (origin step named with timing check), and nothing is
re-scored here.
Sense: garden-filtered sayLines (264) hold 89 keeper weed lines, 87 coax
lines, 30 sow lines, 0 `Harvest:` lines — the zero is a capture-filter
artifact (the harvest narration contains none of the filter markers),
stated explicitly, not claimed as absence of harvests. The keeper's "The
harvest can wait" is faithful about throttled NPC duty and silent about
the real player supply channel — a narration gap, not a behavior gap.
Evidence: evidence/2026-10-27/sim-gardendeposit-b.md + prereg.
Wall (this band, reused corpus): national/table/wins 0/8, wave 4-5 0/8,
median survival 100d (censored). The scale wall is untouched by this
axis this run (zero src/js, zero levers), as expected for ledger-closing
work. No new villager dialogue/behaviour sample beyond the garden
say-line read above.

## Wall (judged material only)

Dedupspan: 9954 corpus only (single seed, wave 4, national, survived
100d). Gardendeposit: reused 9760-9767 band (national/table/wins 0/8,
wave 4-5 0/8, median 100d censored). No new win-seeking band this run.
Standing wall from the 1430Z review is unchanged: raid adjustment now
exercised under a generalized GO, 9954 mechanism proved nested with fix
target settled — and now the dedup rule itself is landed and the garden
deposit blank is closed.

## Telemetry deviation check

Run on the reused stock9762 corpus glob (8 files): 3 LOUD lines
(national 12->0, table 16->0, wins 16->0), all the KNOWN regime-artifact
class (WINSEAT baseline vs competent-nofeast pre-seat measurement corpus;
per-seed rows carry nationalEver/won at band level, not top-level
national/wins paths; glob counts files, not seeds). No exiled LOUD line.
Baseline NOT rolled, no investigation. No new per-seed band corpus exists
this run (both arms reused corpora), so no fresh-corpus check was run.

## Infrastructure

- Worktree cap jam at run start: 16/16 active; registration of
  sim-dedupspan-b failed loudly on attempts 1-3 (17:31/17:36/17:41Z).
  Bounded retry loop (5 attempts x 5 min) held instead of aborting; loop
  A landed at ~17:47Z and freed both its trees; attempt 4 registered
  sim-dedupspan-b at 17:47Z, and sim-gardendeposit-b registered right
  after (active back to 16/16). Stale-but-dirty trees still blocking
  slots at closeout (reaper refuses them, correctly): sim-leg2drift-b,
  sim-belongcost-b, panel-contract-rulings (all 2026-10-24),
  sim-fullpantry-casecount-b (2026-10-25), sim-finalloss-a,
  pack-refresh-20261027. No tree was pruned, released, or removed that
  this run did not register.
- Merge-batch lock race (recovered, no loss): the first dedupspan
  merge batch hit a transient sibling .git/index.lock, so the merge did
  not land while the release step ran ahead (registry said done-merged
  early). The branch and its commits were intact; the lock cleared on
  its own, the merge was retried alone and landed clean (c01555aa0),
  branch deleted, proof re-run green on merged master. The registry
  state is now true. Lesson carried: run merge and release as separate
  verified steps, never one batch, under sibling git contention.
- Safe-commit index clobber hit both worker commits on both arms +
  (per worker reports) repaired via HEAD-blob cacheinfo each time;
  coordinator commits verified correct (status empty + diff HEAD empty
  + hash match). No EPERM flap blocked this run's writes. check.js
  --quick NOT re-run: zero src/js, arm proofs are the attributable
  verification (1016Z/1130Z/1230Z/1330Z/1430Z precedent).
- Master moved once under the run before landing (loop A 61f326408,
  already the arm base); gardendeposit rebased clean onto c01555aa0,
  proof green post-rebase, then merged ff-only. No conflicts, no file
  overlap between arms. Sibling trees (gap-*, journey-scale,
  panel-contract, stale B trees) NOT touched.

## Convergence state

food-economy stays converging (NOT converged): the ability-span
de-duplication rule is landed and the garden-attributed deposit blank is
closed with a corrected mechanism (plots ripen intra-day; the pack road
carries the harvest), but the scale wall is untouched by this axis, the
standing analyzers still sum the old way, and the carried blanks stand.
scale-onramp stays converging (untouched; sibling loop A).
Claim deleted; lock deleted. Merged locally, pending ship. No push, no
bump, no live verification.

Next blanks, in order: (1) wire the dedupspan module into the standing
analyzers (or document that future ledger runs must use it) and verify
no published figure moves except the 9954 residual; (2) a caller-tag
provenance arm for depositPantryPieces (homecoming pool / exile amends
vs donateHaul) + assisted-vs-ordinary harvest split per record;
(3) span-draw class beyond cultivate (cultnest evidence note);
(4) the optional focal-row raid arm (fresh sweep, focal-only prereg);
(5) the 0530Z carried blanks, still open: garden-attributed deposits
CLOSED by this run; remaining: starting-stock draw order,
spoilage-boundary split (meal vs cook), ~5,900 kcal non-draw removal
day-82/83; (6) a treeline give/overrun band (seeds where holds fail).
