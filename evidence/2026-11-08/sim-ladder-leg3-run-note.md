# sim-ladder-leg3-run-note — 2026-11-08

Leg 3 of the victory-gating redesign (Steve approved the build 2026-11-07 19:28 CST).
Prereg: `evidence/2026-11-08/sim-ladder-leg3-prereg.md` (bars L3-1–L3-8).
Base: master `4fe571095` (journey-succession r157); master moved to `38e419d4b`
(sim-comparecontract-a, evidence-only) before the merge — rebased onto it, no
scope file touched by the move — and then to `a111b57f` (sim-tendtrust-b DIAG +
journey scale r111 + loop-A proof refresh) during the final gate: rebased onto
it too. The r111 landing touches `src/js/ladder.js` (one-line `ladderLine`
top-rung fix) and `scripts/balance-proof.json` (their refresh); the rebase
applied cleanly except the proof-refresh pick, which conflicted on
`balance-proof.json` and was resolved with THEIR version (their refresh is
current for the base tree), then refreshed again for this leg's tree (see
Gates). The rebase also hit the stop-at-pick quirk on the 2nd pick (overtime):
pick in both done and todo, tree clean, pick unapplied — verified with
`git diff <pick>` and recovered with `git rebase --continue`, per AGENTS.md.
Worktree `~/workspace/worktrees/build-ladder-leg3`,
branch `build-ladder-leg3`.

## What was built

### Overtime stretch (§b.6, Q5 overtime only)
`src/js/overtime.js` — new `overtimeInterval()`: `daysPerTier` (7, untouched in
titans.json) + `floor(counted / 4)` where counted is the ladder's counted total.
A 12-point village waits 10 days per tier, a 40-point village 17. `overtimeTick()`
uses the interval for `want`; the tier can never fall (the existing `want > pg.overtime`
guard). The tier-up announcement names it: "The wait stretches — the village's
standing buys time: N days between tiers, not 7." Only bites after the table
announces. No raid-cooldown stretch, no season-turn delay.

### Haven panel (§b.7, §b.10)
`src/js/app.js` — `panelHaven()` gains one compact ladder block after the
membership/shelter row, before the remote-applications list. It reads
`Game.villageLadder()` directly (NOT `tablePreview()`, which is null before day
90 / no seat — the bar must always show): stage name, per-track counted with
capped tracks marked ("Fight 9 → 7 · capped"), threshold, and the next rung's
missing pieces in the `fullSeatShortfall` voice (shortfall + capped tracks +
"the feast bundle is open" when the current stage has no bundle entry). At
National the target reads just "reached" (the bar's subject is already the
stage name — the same duplication journey scale r111 fixed in `ladderLine`).
A banked-head-start note shows when `detail.bankedHeadStart > 0`. One block, no
new view, one-screen rule holds.
- Buy-out button (`data-ladder-buyout`, "🍖 Buy out the feast bundle (8,000 kcal)"):
  shown while the current live stage has no bundle banked; calls
  `Game.feastBundleBuyOut()`; the engine refuses honestly on short pantry /
  already-banked / exiled / away (it returns sentences; the handler says them).
- Capstone buttons (`data-ladder-capstone="<kind>"`, one per ready capstone,
  label from `Game.ladderCapstones()`): shown only when
  `ladderCapstoneReady(kind).ready`; calls `Game.ladderDeliverCapstone(kind)`;
  refusal codes are mapped to sentences in the handler. A delivered capstone is
  named in the bar instead.
- Cash-out button (`data-ladder-cashout`, "🏳️ End the run as a Respected
  Village"): shown only when peak stage ≥ 2 (peak — a dip from deaths must not
  take away the dignified exit); calls `Game.ladderCashOut()`.

### Per-stage rewards (§b.8, Q4: concrete grants, NOT memberBenefits)
`src/js/metaProgression.js` — `ladderGrantStageReward(stage)` grants every
ungranted rung up to `min(stage, liveStage)`; recorded on
`progState().ladderRewards` so a stage never grants twice; a grant that cannot
land is NOT recorded. Grants ride the `ladderStageBeat` wrap, so a 0→2 jump
grants both missed stages. The picks:
- **Village → a river trader arrives today.** `_ladderRewardTrader` writes
  `state.scholar.riverTrader = {day, greeted:false}` exactly as `evRiverTrader`
  does, so the panel's feed/trade/snub block appears. Why: the smallest
  immediately-useful benefit — trade access the player can use today, no
  permanent power. Already-here-today counts as granted.
- **Regional → a free shelter (+2 housing, no 10-wood cost).** `_ladderRewardShelter`
  writes `mshipState().housing += 2` — the `buildShelter()` effect with its price
  waived. Why: room is the mid-game choke (housing caps the roster); a free
  shelter is bigger than a trader but smaller than a polity.
- **National → a link.** `_ladderRewardLink` picks the best-known unlinked village
  by opinion, perception-gated via `knowsVillage`, via the existing `_formLink`
  (Haven primary, trust 30, 4000 kcal/wk). Why: the biggest short of the seat —
  a polity joins Haven's side of the table. Fallback when no known unlinked
  village exists: a free shelter (`shelter-fallback`).
The buys-time stretch (§b.6) is also a per-stage reward in effect.

### Banked points (§b.11, Q1 capped exception kept)
`src/js/metaProgression.js` — the store is `ladderBank: null` on the meta store
(`{points, at, kind}`; REPLACE — the most recent fallen/cashed-out village only,
never accumulate). Old stores merge to null safely. `ladderBankPoints(kind)`
('lost'|'cashout') is idempotent per run via `pg._ladderBanked` and reads the
UNWRAPPED `villageLadder` (via `__ladderBankOrig`) so a village banks its OWN
counted points, never the inherited head start (else the bank would ratchet
across villages). A fall with 0 counted points leaves an empty bank.
Read side (`_ladderBankApply`, a `villageLadder` wrap in `attach()`): adds
`min(bank.points, 6)` to `counted`/`total`, named in `detail.bankedHeadStart`,
outside the per-track cap (like the bundle bonus), ONLY while the village's live
peak stage is 0; the stage is recomputed as 1 iff counted ≥ 12. If the live peak
reaches 1, the bank is SPENT (cleared from the store) and the ladder passes
through untouched. So: the bank can open Village at 6 live points, can never
push a village to Regional/National, and is gone the moment the village earns
Village on its own. Wave Standing is never banked (`standing.js` untouched).
Banking triggers: `ladderCashOut()` banks explicitly first; the `wipe` wrap banks
on loss only when `over && villageLost && !won` (every game-over path ends in
`wipe()`; a won run and a live run never bank). The Records rule itself was NOT
rewritten; the bank is documented as the approved capped exception.
Design note: if the coordinator prefers the read side inside `ladder.js` proper,
it is a ~10-line change there (same flagged-amendment pattern as leg 2's bundle
bonus) and this wrapper is removed then — flagged in the prereg, not patched
silently.

### Cash-out (§b.10)
`ladderCashOut()` in `metaProgression.js`: guards — peak stage ≥ 2 (PEAK reading,
same as leg 2's seat-gate call), not already over/won/cashed-out. Banks via
`ladderBankPoints('cashout')`; says the ending lines from `_ladderCashOutEnding`
(top counted track → `respected-village` light entry); `recordMoment`;
`recordLegend({outcome:'table', frame:'respected-village', choice:title})`;
writes the frame to Records store `table.frames['respected-village']=1` DIRECTLY
— deliberately NOT via `metaNoteTable`, which would grant the "Reach the
galactic table" achievement for a run that never reached the table. Sets
`pg.ladderCashedOut`, `pg.tableWaiting=false`, `over=true; won=true; wipe();
save()` (mirroring the table.js table-win sequence; wipe/save in try/catch).

### Respected Village ending entry
`src/data/table-endings.json` — `paths.respected-village`: one light entry per
ladder track (`track:combat/field/craft/social/strange`), each `{title: "THE
RESPECTED VILLAGE", lines: [2 spare second-person lines]}`. Not a Table path:
no finals, no path. `scripts/validate-table-endings.js` gains a minimal special
case for it (track:* selectors from tracks.json, moral light only, title/lines
only, finals forbidden, lines non-empty, tokens checked).

### Tribute scholar-readiness fix (leg-1 follow-up)
`src/js/ladder.js` — the ONLY ladder.js change: `_ladderLivingVeterans(minWave)`
now excludes the scholar (`vid === this.villagerId`). It has exactly one caller
(the `military_tribute` branch of `ladderCapstoneReady`), so the fix affects only
tribute readiness. Delivery (table.js `ladderDeliverCapstone`) already excluded
the scholar and required 2 non-scholar veterans; readiness and delivery now
agree both directions.
NOTE for the coordinator: table.js still carries the leg-2 comment naming this
as a KNOWN GAP ("readiness counts the scholar as a payable veteran") — the gap
is now fixed by this leg; the stale comment in table.js was left untouched
(table.js is outside leg-3 scope) and wants a one-line correction.

## Proof results

Unit proofs (all standalone green):
- `scripts/test-ladder-time-20261108.js` — **19/19**. Interval math 7/10/17 at
  0/12/40 counted (plus 8/9/11 boundary points); a real `overtimeTick()` tiers a
  12-point village at 10 days not 7, a 0-point village at 7; the announcement
  names the stretch at 10 days and does not claim one at 7; the tier never falls
  when the interval grows (tier 2 needs 34 banked days at interval 17);
  `daysPerTier` stays 7 in titans.json; no clock before the table announces.
- `scripts/test-ladder-cashout-20261108.js` — **35/35**. Cash-out refused below
  Regional; at Regional records the ending (legend frame `respected-village`,
  Records frame present, `mt-table` NOT unlocked, ending said aloud), banks the
  counted points, ends the run won; the next village sees at most 6 (live 6 +
  bank 6 = 12 opens Village; live 12 alone counts 12 — the bank is spent at
  live Village peak, and it is NOT spent by opening Village on banked points);
  Regional/National ignore the bank (live 20 stays 20, stage 1); the bank
  REPLACES (second fall overwrites the first; idempotent within a run; never
  ratchets through the head start); a real game-over `wipe()` banks, a won run
  and a live run do not; tribute: scholar-veteran + 1 villager reads NOT-ready
  (`veterans-short`, veterans 1) and delivery refuses the same way, 2 non-scholar
  veterans reads ready.
- `scripts/test-ladder-rewards-20261108.js` — **24/24**. Village: trader arrives
  today, recorded once, no re-summon; 0→2 jump grants both stages; Regional:
  +2 housing; 0→3 jump grants all three; National: a link forms (Haven primary,
  trust 30, 4000 kcal/wk) with a known village; fallback shelter when no village
  is known (+2 housing on top of the Regional shelter); no re-grant on repeat.
- `scripts/test-ladder-panel-20261108.js` — **17/17**. Node DOM-stub proof
  following the `test-feast-host-food.js` precedent: `panelHaven` sliced out of
  app.js and rendered with the real Game + the full status builder
  (`Game._fullStatus` — the harness slims `Game.status()` for sim speed). Proves
  the bar renders at Unranked (threshold, shortfall, per-track counts), the
  buy-out button with the 8,000 kcal price, no cash-out below Regional, capped
  tracks marked ("Fight 15 → 7 · capped"), the cash-out button at Regional peak,
  the capstone button when ready, buy-out hidden when the stage banked its
  bundle, and the banked head start named ("+6 from the last village").
  NOT proven here: a finger tapping the buttons on a phone — the P5 human check
  at 390×844 is leg 4's, per the prereg. The handlers call the engine functions
  proven by leg 2's bundle test and this leg's cash-out/rewards tests.

Gates:
- `node scripts/check-wired.js` on metaProgression/overtime/ladder/app: **0
  unwired** in the three leg-3 modules; app.js shows the same 6 pre-existing
  unwired as master (statRow, feedbackHTML, clearSheets, renderPersonInline,
  remoteAssignSheet, panelCombat) — none of them mine.
- `node scripts/validate-ontology.js`: **135/135 validated**, ONTOLOGY.md
  regenerated (committed).
- `node scripts/validate-table-endings.js`: **OK — 0 errors, codas 70/70,
  beats 4/675 bespoke**.
- `node scripts/check.js --quick`, first run (pre-rebase tip `44a38638`):
  **283 passed, 15 failed in 1401s**. The run was degraded by a sibling gate
  running concurrently (load 13–24); its full failure list was not retained
  (output buffered, only the tail kept), but the tail showed establishment-r20
  plus three 120s timeouts (capable-bot, phase-shawl, solo-campaign-endings).
- `node scripts/check.js --quick`, second run (rebased tip `60612f08`,
  full list captured in `/tmp/check-quick-ladder-leg3-rebased.log`):
  **286 passed, 12 failed in 1215s**:
  - 4 pre-existing, adjudicated in legs 1/2 (fail identically on master):
    mobile-combat-cadence, occupation-panels, establishment-r20,
    phone-frame-proof (stale browser receipts — owed to a browser-capable
    agent, do not hand-edit hashes).
  - 3 measurement, all from the stale neutral proof (the pair was already
    red at the base per leg 2): measurement-proof-update,
    measurement-workflow, measurement-cache-flags. Fixed by the refresh
    below; all three green standalone after it (9/9, 9/9, 4/4).
  - 3 design-change tests whose assertions encoded the OLD behavior:
    test-ladder-minting (tribute ready case rigged scholar+1 villager),
    test-ladder-bundle (the KNOWN-GAP section asserted readiness counts the
    scholar), test-overtime-network (7/21-day tier cadence assumed the
    un-stretched interval). Updated in commit `533ec277f` to the intended
    behavior — no assertion loosened, each change explained in the test.
    After the update: minting 36/36, bundle 79/79, overtime-network 41/41.
  - 2 load-artifact timeouts (120s under the concurrent sibling gate),
    each verified green standalone: trust-observer-neutrality 6/6,
    capable-bot 42/42.
- Neutral-proof refresh (after the second gate): fresh panel, leg-1/2 shape
  (seed 7 × capable / risk-aware / socialite / winseek × 150d, 4 cases, 0
  cached jobs), exit 0 — neutrality 4/4, 0 warnings (the panel script throws
  on any neutrality failure, so exit 0 is the validity proof). Retained as
  `evidence/2026-11-08/neutral-ladder-leg3-20261108.json.gz` (cases/ deleted
  per §15); `scripts/balance-proof.json` refreshed with
  `scripts/balance-proof-update.js` (commit `7cb6179c4`). Measurement pair
  9/9 + 9/9 and cache-flags 4/4 standalone after the refresh.
- SECOND rebase + SECOND refresh: after the rebase onto `a111b57f` the pair
  went red again (the new base moved the sources — the leg-1/2 pattern), and
  the rebased refresh commit held THEIR `balance-proof.json` (conflict
  resolution, see above). Re-ran the same panel shape against the rebased
  tree (seed 7 × 4 policies × 150d, 4 cases, 0 cached, exit 0 — neutrality
  4/4, 0 warnings), retained the same evidence file
  (`neutral-ladder-leg3-20261108.json.gz`, overwritten), refreshed
  `scripts/balance-proof.json` again (commit `ef0798108`). Measurement trio
  green standalone after it (9/9, 9/9, 4/4). The panel fix (National "reached")
  is commit `1b45d44b6` (app.js + panel test, now 19/19).
- `node scripts/check.js --quick`, THIRD run (tip `7cb6179c4`, after the test
  updates + first proof refresh; solo gate, load ~5, log
  `/tmp/check-quick-ladder-leg3-final.log`): **294 passed, 4 failed in 636s**
  — the 4 failures are exactly the pre-existing adjudicated set
  (mobile-combat-cadence, occupation-panels, phone-frame-proof,
  establishment-r20, same signatures as legs 1/2). No NEW attributable
  failure on that tree.
- `node scripts/check.js --quick`, FINAL run (tip `ef0798108`, after the
  second rebase + second refresh): [FILL IN — result, breakdown, log path.]

## Commits (branch build-ladder-leg3, after the `a111b57f` rebase)
- `33ff73553` prereg
- `78e6b9df0` overtime stretch
- `b1c8e730c` tribute readiness fix
- `1aba12f05` metaProgression (bank + rewards + cash-out) [needs-eyes]
- `8ee4f1ec1` Respected Village ending + validator [needs-eyes]
- `682f850d4` Haven panel bar + buy-out + capstone + cash-out [needs-eyes]
- `a18d7438c` unit proofs + green list + regenerated ontology [needs-eyes]
- `21e961332` three tests updated for the intended behavior changes
- `9d38f3629` neutral-proof refresh (first; holds THEIR balance-proof.json
  after the rebase conflict resolution — superseded by `ef0798108`)
- `e3122850a` run note (first version; updated below)
- `1b45d44b6` panel National bar drops the repeated stage name + test
- `ef0798108` second neutral-proof refresh after the `a111b57f` rebase
- (run note — this file, final version — committed last, SHA in the final report)

## House notes
- Base moved twice before the build (journey-deepening r119, journey-succession
  r157) and once during it (sim-comparecontract-a, `38e419d4b`, evidence-only);
  none touched a leg-3 scope file. Rebase onto `38e419d4b` before merging.
- EPERM write flap at registration (~12:40–12:53Z): `git worktree add` checkout
  reached 100% then failed twice on index reset; registered on the third attempt
  per the flap-response skill (probe first, wait for a window, no manual ref edits).
- Index clobber struck after EVERY safe-commit (committed file shows as D/?? or
  MM; worktree byte-identical to HEAD). Repaired each time with
  `git ls-tree -r HEAD -- <paths> | git update-index --add --index-info`, then
  verified `git status --short` empty + `git diff HEAD` empty. All 7 commits
  verified clean.
- The gate ran while a sibling gate was also running (it started after mine;
  the slot was free when I launched). If any failure looks like a load-artifact
  timeout, re-run alone before trusting it.
- `~/MEMORY.md` changed outside this session during the build (pellet reframe,
  medic-cure ruling) — no leg-3 scope impact.

## What leg 4 needs
- Panel surface is complete: the Haven bar, buy-out, capstone, and cash-out
  buttons are wired. P5 human phone check at 390×844 (tap each button, watch
  the one-screen rule, confirm the bar reads at a glance).
- P6/P7 panel bars (table-preview bar, seat-taker bar) and the final proof
  refresh / calibration panels.
- The measurement pair (`test-measurement-proof-update` /
  `test-measurement-workflow`): if the gate went red on it, the neutral proof
  refresh (fresh panel seed 7 × capable/risk-aware/socialite/winseek × 150d +
  `scripts/balance-proof-update.js`) is owed before merge — see the gate result
  above.
- Stale table.js comment naming the tribute gap (see above) wants a one-line
  correction.
- No fresh seed band was used in this leg; leg 4's calibration panels need the
  seed-band freshness check against ALL dated preregs + forbidden-band lists.
