# sim-deferroffer — win-day-floor deferral re-offer (2026-10-14)

## Pre-registered header (§§9–12, 14)
- **Primary metric:** (a) the 7-door modal re-opens on previously-deferred seeds once
  winDayFloorOk() passes; (b) A/A trajectory byte-identical pristine-vs-fixed EXCEPT the
  re-offer beats and their consequences.
- **GO threshold:** proof RED→GREEN 32/32 + re-offer fires on both previously-deferred
  seeds (s22, s55) + all non-deferring seeds byte-identical + deferring seeds identical
  through day 89 (divergence begins exactly at the re-offer).
- **Horizon:** 180d death-aware (runDays stops on village-dead + 10d tail; matches the
  wincensus origin suites). Proof fixture: synthetic, days 67–105.
- **Why this horizon:** the bug is a 101–122 day stall — the measurement must cover the
  full stall window to show the win landing where the stall was.
- **Seeds:** proof 1–32 (det-gate); pilot 11/22/33/44/55/66/77/88 (the wincensus r31 set).
- **Policies:** leadfeast (FEASTSCALE_R13=1) + tableWalk driver (answers
  scholar.tableChoices first-option, winseek-style — scripts/wincensus-20261014.js).
  Bare leadfeast never answers the modal (wincensus T1, harness artifact), so the
  deferral path is unreachable without the walk driver; the driver is identical on
  both A/A arms, so the comparison stays honest.
- **Convergence state:** fixed (this run) — was the blocking axis's open item #202.

## The bug (sim-findings #131-T2, REAL BUG on the win path)
The pre-day-90 winDayFloorDefer (src/js/table.js) never re-opened the 7-door modal.
The beat promised "the table will still be here" but tableOfferPaths was one-shot:
after deferral, T.phase='paths', tableChoices=null, pg.tableDone=true — and NOTHING
re-opened the modal. Wincensus evidence: s22 deferred @67, stalled 101 days, died
d167, win never landed; s55 deferred @59, stalled 122 days to 180, win never landed.

## The fix (table.js ONLY — no other game-code changes)
1. `winDayFloorDefer(T)`: records `T.winDeferred = true` and re-arms the dawn driver
   (`pg.tableWaiting = true`, `pg.tableDone = false`). Sanctity is preserved:
   `tableActive()` treats `winDeferred` as sitting, so ambient pressure stays
   suspended through the deferral window (Steve 2026-10-12 TABLE SANCTITY canon).
2. `tableScene()`: new guard at the top — while `winDeferred` and the floor is unmet,
   the table waits silently (the deferral beat already spoke); once `winDayFloorOk()`
   passes, it says the TABLE RETURNS beat and re-opens the 7-door modal via
   `tableOfferPaths` — exactly once (flag clears on fire, sequence sits again with
   tableDone=true so the driver does not re-fire). Paths re-price live at re-offer
   time (tableEarnedPaths is called fresh).
3. `tableActive()`: winDeferred carve-out (see 1).

Design notes: the re-offer re-uses the existing ledger dawn driver
(`pg.tableWaiting && !pg.tableDone`, ledger.js:1424) — no driver changes needed.
The other two defer sites (tableResolveDemandPrice, the assimilated fallback) funnel
through the same winDayFloorDefer — one fix covers all three. Clearing tableDone
during the window is safe: the only external readers are the dawn driver (intended)
and progression.js:639's TABLE RE-FIRE (suppressed — tableWaiting is true).

## Proof: scripts/test-deferroffer-20261014.js (RED→GREEN, 32/32)
Fixture drives the REAL `Game.tableResolveFinal('final:audience')` on the beloved
path at day 67 (mirrors s22's d67 deferral), then drives the EXACT ledger
dawn-driver gate days 68–100.
- **RED (pristine table.js): 0/32** — all 32 fail at the re-offer assertion
  (`reofferDay=null`): the deferred modal never re-opens. Bug reproduced, precisely
  at the claimed site. (Deferral assertions — phase='paths', beat spoken, game not
  over — pass on pristine; only the re-offer is missing.)
- **GREEN (fixed): 32/32** — modal re-opens at day 90, exactly one TABLE RETURNS
  beat, modal is the 7-door prompt with matching options, answerable
  (chooseTableOption('path:beloved') → phase='challenge'), no duplicates across
  days 91–105 + direct tableScene() calls, sanctity holds at day 80.

## A/A pilot: scripts/measure-deferroffer-20261014.js (8 seeds × leadfeast+tableWalk, 180d)
Per-day trajectory hashes, pristine vs fixed, identical seeds:

| seed | pristine | fixed | trajectory |
|------|----------|-------|------------|
| 11 | won d174 (walked late, no deferral) | won d174 | byte-identical 174d |
| 22 | deferral@67 → stall → died d167, won=false | re-offer@90 → **WON** | identical 89d, then re-offer+win |
| 33 | village-lost d32 | village-lost d32 | byte-identical |
| 44 | village-lost d101 | village-lost d101 | byte-identical |
| 55 | deferral@59 → 180d stall, won=false | re-offer@90 → **WON** | identical 89d, then re-offer+win |
| 66 | village-lost d51 | village-lost d51 | byte-identical |
| 77 | village-lost d79 | village-lost d79 | byte-identical |
| 88 | village-lost d69 | village-lost d69 | byte-identical |

Raw: evidence/2026-10-14/deferroffer-pristine.json, deferroffer-fixed.json.
**GO met:** 6/6 non-deferring seeds byte-identical; both deferring seeds identical
through day 89 with divergence beginning exactly at the day-90 re-offer; the only
deltas are the re-offer beats and the walked win that follows. The fix perturbs
nothing else.

## Reachability verdict
The win flag is now reachable through the deferral path: 2/2 previously-deferred
seeds (s22, s55) convert their 101/122-day stalls into wins. s11 still wins via the
late-walk path, unchanged. The deferral stall — a win-path sink — is closed.

## Village assessment (what the villages looked like)
- **s22** (fixed): Arc IV @67 on the lesser seat, feared/light walked to finals,
  deferred, waited honestly ("the table will still be here" — now true), re-offered
  @90, walked again, won. On pristine this same village lived 100 more days and died
  — the stall outlasted the village.
- **s55** (fixed): Arc IV @59, deferred, re-offered @90, won. The 122-day pristine
  stall was survivable but winless — the village waited faithfully for a promise the
  engine never kept.
- The six non-table seeds died or survived without reaching Arc IV — unchanged by
  the fix, as the A/A identity proves. The scale wall past wave-5 is still the table
  chain for villages that never earn a seat; this fix only repairs the chain for
  villages that do.

## Blanks filled
- **#202 DEFERRAL RE-OFFER (game-code): FIXED this run.** The mechanical re-offer —
  modal returns once the floor passes, exactly once, answerable, sanctity held.
- SENSE check: read the beats. The deferral beat ("Ninety days. We do not price a
  life half-lived...") is honest about the floor; the new RETURNS beat ("Ninety
  dawns. The life you priced is lived now — not half-lived. The table kept its
  word.") keeps the promise the old beat made. No silent actions: every transition
  narrates.

## Open questions (documented, not overreached — Steve-call territory)
- **Seat re-pricing at re-fire** (#202's second half): s22 earned FULL-seat deed bars
  by d165 while deferred on its d67 lesser seat. The re-offer re-prices PATHS live
  but keeps the original T.seat from the audit. Whether the seat itself should
  re-price at re-offer is a design call — left as-is.
- This is a win-modal behavior change: commit carries **[needs-eyes]**.

## Metric review (§14)
Primary metric and GO threshold held as pre-registered — no re-scoring. One
measurement trap documented for future runs: the pilot MUST run with
FEASTSCALE_R13=1 (as the wincensus did); without it leadfeast reaches the table on
0/8 seeds and the A/A is vacuously identical. First pilot attempt without the flag
showed 0 deferrals — caught and corrected before drawing conclusions.

## Tooling
- scripts/test-deferroffer-20261014.js — RED→GREEN proof (32-seed det-gate built in).
- scripts/measure-deferroffer-20261014.js — A/A pilot driver
  (`node scripts/measure-deferroffer-20261014.js <out.json>`, FEASTSCALE_R13=1).
- Patch-verification method: fix saved to ~/workspace/deferroffer-fix-20261014.patch,
  pristine checkout → RED run → git apply → GREEN run (no stash — repo-global stack).
