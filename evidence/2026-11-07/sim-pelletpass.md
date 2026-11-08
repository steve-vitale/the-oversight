# sim-pelletpass — the pellet passes to hungrier hands: VERDICT GO

Date: 2026-11-07. Build worker: pellet pass (BUILD 3).
Steve's ruling (2026-11-07 17:55 CST): the pellet PASSES to hungrier hands.
Prereg: `sim-pelletpass-prereg.md` + `sim-pelletpass-prereg-amendment-1.md`.

## What was built

`Game.maybePassPellet()` in `src/js/progression.js`, called once per dawn
from `progDaily()` (before `checkArc`, so the reactor-seat beat does not
fire on the same dawn the pellet passes). At dawn, when a bearer is actually
pellet-fed (scholar: `fusionReactorOnline()`; villager: alive +
`npcHasAbility(vid, 'fusion_reactor')`) while >=3 living present villagers
sit above hunger 70 (the game's own "hungry" line, `needs.hunger`), the
pellet passes to the hungriest of them. 30-day cooldown between passes.
Transfer: strip the old bearer (scholar: remove the ability + delete
`fusionReactor`; villager: remove from `npcAbilities`), clear the holder,
`npcGrantAbility(newVid, 'fusion_reactor')` re-sets it — the holder is
never left null, so the one-reactor-per-world singularity holds and the old
bearer can never reinstall. The new bearer's hunger is set to 0. Voiced in
plain words ("The little star inside X goes quiet — and wakes up inside Y.
X never got hungry while the village did, so the pellet moved to hungrier
hands…"), plus `tele('pellet_pass', {from, to, day})`. Exile Q4 untouched.

Trigger history (honest): the prereg first pinned a 3-consecutive-dawn
streak on the hunger meter. A probe (`/tmp/pellet-dynamics.js`, seed 42)
showed the meter falls ~70 on one fed day (self-production feeds every
villager first), so a 3-dawn streak above 70 would make the lever nearly
dead — the exact failure mode Steve rebuked. Amendment A1 removed the
streak (single-dawn read; the meter above 70 IS the sustained-deprivation
fact, it takes ~2 weeks of under-eating to get there). The trigger numbers
(N=3, cooldown 30) and the GO bar did not change after seeing panel results.

## Proof test

`scripts/test-pellet-pass-20261107.js`: **43 passed, 0 failed.**
Proves: pass fires under the trigger (direct call AND the real `endDay`
dawn hook); no pass when fed; new bearer is the hungriest villager, old
bearer loses pellet + ability, holder moved, singularity holds; the pass
is voiced naming the new bearer in plain words, no unexplained "mantle";
no pass on a stale holder (bearer died, flag stayed); no second pass
inside the 30-day cooldown; a villager bearer passes it on too; and the
unblock chain (feast grants after the pass, a real combat strike spends
the surge, the table prices the FULL seat).

## Panel (matched constructed 99767-shape states, 8 seeds)

Seeds: 99767, 7, 42, 99, 1234, 555, 777, 2026. Each state: day 181,
scholar pellet-installed, integration 80 (stage 3), national rank, waves
5/5/4/3/3 faced, 3 contests, 3 crises, sentiment taught, surge armed
1.5, 6 villagers at hunger 95..90. Arms: armed vs baseline (pass stubbed
off in the driver). Raw rows: `sim-pelletpass-panel.jsonl`.

| seed | armed pass day | feast | surge used | seat | baseline pass | baseline seat | fed pass |
|------|------|-------|------|------|------|------|------|
| 99767 | 1 | granted | yes | full | — | none | — |
| 7 | 1 | granted | yes | full | — | none | — |
| 42 | 1 | granted | yes | full | — | none | — |
| 99 | 1 | granted | yes | full | — | none | — |
| 1234 | 1 | granted | yes | full | — | none | — |
| 555 | 1 | granted | yes | full | — | none | — |
| 777 | 1 | granted | yes | full | — | none | — |
| 2026 | 1 | granted | yes | full | — | none | — |

GO bar (prereg + A1):

1. Pass on dawn 1, armed/hungry: **8/8** (need >=7) — PASS
2. Feast + spend + seat after pass: **8/8** (need >=7) — PASS
3. Fed control passes: **0/8** (need 0) — PASS
4. Baseline passes/seats: **0 passes, 0 seats /8** (need 0/0) — PASS

**VERDICT: GO.**

## Notes

- The first panel run scored item 2 at 3/8 — a PANEL-DRIVER bug, not a
  game failure: the fight driver struck from 4 tiles away (unarmed range
  1), so `tbPlayerStrike` returned false 40 times and the turn never
  advanced. Fixed the driver (move adjacent with `tbPlayerMove`, then
  strike; no `tbAdvance` after a strike/wait — both advance themselves),
  shared as `driveSpend()` in `scripts/lib/pellet-pass-shape-20261107.js`,
  and re-ran the full panel. The trigger, the bar, and the game code were
  not changed between the two runs.
- `nationalLive` is derived state: `endDay`'s hierarchy tick clears it on
  a linkless constructed state. The panel/proof re-assert it after the
  dawn ticks (documented in the shape builder). A real village holds the
  rank through its links.
- The fight in the chain uses a 500-HP fixture fighter: it proves the
  SPEND mechanic, not a day-181 scholar's survivability (the fixture
  scholar carries no gear). Documented in `driveSpend()`.
- Gate: see `pellet-pass-gate.log` — `check.js --quick`: **284 passed,
  6 failed in 609s**. All 6 failures were re-run with this build's
  `progression.js` change stashed and fail identically on the worktree
  base, so NONE is caused by this build (pre-existing on this base):
  `test-measurement-proof-update` + `test-measurement-workflow`
  (retained neutrality proof already stale before this change),
  `test-mobile-combat-cadence`, `test-occupation-panels`,
  `test-phone-frame-proof` (retained phone receipt stale),
  `test-establishment-r20-fixes-20261020` (racks-full voice gate).
  The measurement-proof refresh (`balance-proof-update.js`, needs a fresh
  neutral proof) is separate maintenance, not part of this build.
  This build's own proof test (`test-pellet-pass-20261107.js`, 43/43)
  passed in the gate run's 284.
- [needs-eyes]: new voiced beat + a rule change players will feel (the
  pellet can leave the player for a hungrier villager).
