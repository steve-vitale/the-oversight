# Table public entry owns one scene

2026-10-16. **Retain, needs-eyes:** align the public seat action with native
Haven access and refuse ongoing encounters/contests. Winning remains difficult.
No food price, health, damage, deed, invitation cadence, policy, observer or
23-metric contract changes were made. Base: `7b355c48ddcdd6d4d28f5d00430540170940a16d`.

The prior opportunity diagnostic showed capable10061 entering Table paths
while a real fight and player siege contest were active. `tableActive()`
already covers paths; changing ambient suspension would address the wrong
boundary. Public `tableTakeSeat()` had no ownership/access check. The native
Haven component already used `havenStoresAccess()`; narration's near-Haven
radius is a different predicate. This repair preserves existing integration
stage3 remote access and the existing exile exclusion. This access interpretation
is marked needs-eyes, rather than inventing a new physical-travel requirement.

`tableEntryBlock()` refuses ended/won runs, active contests, tactical or pending
encounters and unavailable Haven access. Eligible invited bearers keep a live
price and receive readiness/reason. The actual native button disables and
explains busy refusal. Stale clicks recheck; refusal spends nothing and locks
no ending. Success requires the actual Table commitment. Internal scene
construction and authored Table trials stay intact.

## Fixed experiment and tradeoff

The plan fixed16 screen seeds per capable/maker/merchant/caregiver and64
disjoint holdouts10001..10064 before inspecting outcomes.150 iterations,
Columbus/eastern woodlands, unchanged policies and flags. Both arms use the
same collector/contract/Node revision. The208-input manifests differ only in
`src/js/table.js` and `src/js/app.js`. Prior fraying-after panels/jobs are reused
only after exact manifest equality.656 retained jobs =328 prior +328 new;
640 observed campaigns and16 observer-off controls. No claim of656 fresh runs.
All panels are source-stable, neutral and warning/error-free.

All64 screen rows, full hashes and23-metric sets match. The holdout report is
**review_required**, with capable entry/community `regression_watch` and wins
`change_watch`. No weighted score or automatic rejection/improvement verdict.

| Policy (64 each) | Wins before -> after | Entries | Bearer deaths | Community losses |
| --- | --- | --- | --- | --- |
| capable |48 ->46|49 ->46|86 ->88|12 ->14|
| maker |21 ->21|21 ->21|86 ->86|24 ->24|
| merchant |26 ->26|26 ->26|52 ->52|26 ->26|
| caregiver |31 ->31|32 ->31|43 ->43|16 ->17|

Early bearer survival, invitation, national scale, player class and contest/show
gear access do not change. Capable earned good-gear access63->64 coexists with
low-food exposure .026200->.027772, low-water .031326->.031364, low-health
.015545->.015517, hungry-NPC .094989->.094966 and mean living NPCs8.41866->8.39167.
Caregiver low-food .008396->.008675 and hungry-NPC .048254->.048283 rise slightly.
Maker/merchant retain minor resource, class exposure and timing changes.
All metrics, intervals and eligibility denominators are in
`table-entry-{screen,holdout}-score.{json,md}`; day60 survival has62 eligible
merchant/63 caregiver cases, not64 uncensored observations. These mixed
policies do not establish pacifist viability or sufficiency of every reward.

## Every changed trajectory

Every changed full gameplay hash was selected, not only changed wins:
capable10, maker3, merchant3, caregiver2 =18 paired cases/36 replays.
Every replay matches its original row, hash and all23 metrics, without warnings.
Raw call context includes actual pending monster, contest, exile, access,
seating/ending commitment, bearer deaths and parent calls. The compact
`table-entry-case-decisions.jsonl` indexes all cases; complete traces are gzip JSON.

- Capable10016/10026: old public entry accepted day90 while exiled, despite
  integration100 and no native Haven access. Neither new run seats.10016 loses
  its successor on93 and community on99;10026 ends village-dead on103. These
  explain both lost wins; no easier survival lever compensates for the bypass.
- Capable10045: pending rerun delayed seating90->91 and an additional bearer
  death occurs; the run still wins. This cost remains in death totals.
- Caregiver10024: old entry froze the story with rerun pending on104 and
  resolved a losing Table ending. New play retains that unresolved encounter
  and loses its community on110. This explains the extra community loss.
- Capable10061: old simultaneous fight/siege/Table ownership becomes a real
  siege refusal. It still ends village-lost on90. Correct ownership promises
  neither victory nor automatic settlement of an earlier activity.
- The other13 cases settle their encounter/contest and then enter, retaining
  their wins. Caregiver10038, for example, waits90->92 for editor to clear.

Decision: retain the ownership/access correction with all adverse directions.
Exile recovery and its generic Return-to-Haven message need a separate design
audit; unresolved pending-encounter policy behavior also remains open. Do not
grant exiles entry, clear pending encounters, force combat or weaken deeds
just to restore old rates. This panel establishes the repair's observed costs,
not overall balance or causal estimates for each component of the combined guard.

## Native phone and checks

Prepared375px phone fixture runs the full native app and extracts its actual
Haven Table markup/handler into a labelled diagnostic aside. It grants an
earned lesser seat/day100 and uses actual constructors; it does not call
checkArc/tableScene or force seating. Native main-panel access stays exercised.
This is prepared mechanism proof, not a naturally earned human campaign.

1. Start a real Moot, leave the previously enabled button stale, click it:
   refusal, contest remains active,1800kcal unchanged, no seat/ending key.
   Actual main-panel button disables with the contest reason. Save/load retains it.
2. Play Tell the truth / Double down / Whole truth. Actual health100->94->89,
   settle the contest and choose the earned Squirrel Friend gift. The actual
   main Haven button seats successfully into the seven priced paths.
   Save/load retains Table ownership and ending key.
3. Fresh prepared review-drone encounter: real tactical controls remain,
   seat disabled with encounter reason, no commitment/cost. Actual save/load
   retains the blocked fight. AX records and three screenshots accompany this audit.

Shared-kit entry target41/41; same test against before source10/41 (31 failures).
Initial quick181/182/full953/954 each exposed the old presentation fixture's
invalid entry context. It now explicitly prepares a live accessible Haven and
asserts it, preserving all original sound/visual checks:57/57. Final quick182/182,
full954/954; ontology111 systems. No tests quarantined or assertions loosened.
Existing unwired `tableTheme` is unchanged; the new entry helper has callers.

## Reproduce without changing historical receipts

From repo root, using the original raw collector bytes in the bundle:

```powershell
node evidence/2026-10-16/table-entry-verify.cjs
node evidence/2026-10-16/table-entry-verify.cjs --current
node evidence/2026-10-16/table-entry-reconstruct.cjs after .git/table-entry-review
node evidence/2026-10-16/table-entry-verify.cjs --recompute .git/table-entry-review
node .git/table-entry-review/scripts/godpath/test-table-entry.js
node .git/table-entry-review/scripts/test-feedback-moments-20261014.js
node evidence/2026-10-16/table-entry-probe.cjs .git/table-entry-review .git/table-entry-review capable 10061 .git/table-entry-review-case.json.gz
node evidence/2026-10-16/table-entry-server.cjs .git/table-entry-review table-entry-phone.html 8775
```

Use a fresh directory. `before` reconstructs the baseline with the candidate
entry test available to prove failure; the old feedback test predates the new
entry helper. Historical evidence-dependent full suites need their own fixtures,
so reconstruction only claims the two targeted tests and score recomputation.
Default verification validates immutable artifact hashes and both-arm worker
records; `--current` additionally checks live sources and executes41 assertions.
Raw collector bytes are preserved deliberately: newline normalization changes
observer identity. Runtime manifests use the repository's normal LF hashing.
The rebuilt candidate passed both targets, both report recomputations and a
complete unchanged10061 replay; those outputs are retained. The receipt pins
all artifacts and the four prior panel/job inputs. Normal check.js discovery
runs the new test automatically; update this evidence and survival log when
entry semantics change. No local hook install, player deployment or SW bump.
