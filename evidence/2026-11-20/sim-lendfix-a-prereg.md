# sim-lendfix-a — PREREG (frozen BEFORE any judged sim)

**Arm:** sim-lendfix-a · **Loop A run:** fleshout-20261120T2015Z
**Type:** FIX + instrument — the borrower-death sink (finding #2629) + the
lend-opportunity pool counter (finding #2628). NO lend re-test in this arm.
**Frozen:** 2026-11-20 ~21:05 UTC, before any judged sim.
**Branch:** `sim-lendfix-a` (worktree
`~/workspace/worktrees/sim-lendfix-a`). **Base:** master 1fcd7edba
(verified with `git log` after rebase; registration base 9b14b0b93 had
moved — local master advanced through the r258 adoption record;
origin/master 4f91af362 is an ancestor of it).
**Builds on:** `evidence/2026-11-20/sim-lend-a.md` (§5/§9) and
`evidence/2026-11-20/sim-lend-a-prereg.md` (the lend spec this fix
rebuilds from), `evidence/2026-11-20/sim-gunrate-a.md` +
`evidence/2026-11-20/sim-cellgate-a.md` (the control substrate),
`sim-findings.md` entries #2628 / #2629 / #2630.

## The question (findings #2629 + #2628)

- **#2629:** as built, lending the gun to a fighter who dies LOSES the
  gun. The field engine strips a dead fighter's equipped weapon during
  the fight, before the `try/finally` return runs, so
  `_returnLentSearcaster` cannot find the gun entry in the borrower's
  items (`gunReturned: false`; one lent cell came back, the gun never
  reappeared in any living holder's census). The gun was granted day
  86, lent day 87, lost day 87. Any re-test of the lend must prove the
  return from a dead borrower in a fixture first.
- **#2628:** the lend fired once in 8 seeds. The participation floor
  (3 entries) was priced from the presence band, not from a measured
  lend-opportunity pool — the next arm needs the pool counter frozen
  first (this arm's instrument has none; pool rows count holders near
  fights, not lendable ones).
- **#2630 (noted, not fixed here):** the corpus encounter log cannot
  show lend/return lines (driver reads `rec.log` at fieldFight-return,
  before the hook annotates it). Recorder-timing blind spot; out of
  scope for this arm except that the new driver must not claim
  transcript coverage it does not have.

## The fix (frozen intent; exact strip location pinned by code read)

- **(a) Return-path fix.** `_returnLentSearcaster` must no longer
  require the lent gun entry to still sit in the borrower's `items`.
  The return recovers the lent entries by entry-object identity from
  wherever the fight engine put them — the dead fighter's gear before
  the strip, or the corpse/drop afterwards (the code read pins which
  location the strip actually uses) — removing the entry from that
  location first so the gun is never duplicated, then returning it to
  the living lender and re-seating it with `villagerGearUp`. If the
  strip destroys or transforms the entry so identity recovery is
  impossible, the fix instead captures the lent entries before the
  fight call and restores them from the lend record itself. Either
  way the return is deterministic (entry identity + roster reads,
  zero new `Math.random()` calls) and the live-borrower return path
  is unchanged. `src/js` diff is minimal: the return helper in
  `game.js`, plus `fieldFights.js` strip code ONLY if the sink lives
  there. Do NOT touch `havenGrowth.js` raid draft or the
  departure/bow-serve code.
- **(b) Pool counter (frozen).** A new `v4lendPool` recorder counts
  lendable moments per fight at the same choke point
  (`resolveWildMonsterEncounter`, after the WILDAVOID avoid-check,
  before the fight call — the exact place a lend would fire): the
  picked lead is unarmed-or-empty, a living armed holder
  (searcaster + ≥1 fusion cell, roster villager, never the scholar,
  health > 20, not sheltered, not post-flee resting) stands in
  earshot (monster's tile or adjacent, Chebyshev ≤ 1) and is NOT
  the lead. One row per lendable moment: day / seed / monster /
  lead / lender / kind (`gun` | `cells`) / from (`tile` |
  `adjacent`). Pure reads, zero `Math.random()` calls, zero
  game-state writes. The counter runs with the lend OFF — it
  measures the pool, it never lends.

## Substrate decision (disclosed before judging — my call, coordinator can overrule)

The lend lever code was NEVER committed: `git log --all -S
_lendSearcaster` shows only the lend-a instrument/evidence commits
(scripts + evidence only); the lever lived as uncommitted worktree
changes and was discarded on revert. GUNRATE and CELLGATE are
likewise absent from `src/` (0 refs on this base). So this arm
REBUILDS all three from their frozen in-tree specs — the lend-a
prereg (lend design + hook), the gunrate-a prereg + `test-gunrate-a.js`
(39 assertions), the cellgate-a prereg + `test-cellgate-a.js`
(12 assertions) — as env-gated code, OFF by default
(`LEND`/`GUNRATE`/`CELLGATE` unset = the old game). Rationale,
stated before judging: (1) the return fix needs lever code to exist
before it can be proven in a fixture; (2) a pool measured without
guns cannot price the next re-test's participation floor (base game
grants ~1 gun per band; the gunrate substrate grants ~6). The lend
stays REVERTED in behavior: it is NOT re-tested (no LEND=1 sim leg)
and NOT switched on. The fixed code is left in the tree env-gated
OFF — behaviorally reverted, code preserved for the next re-test
arm — and the guardrail below proves the dormant code changes
nothing. If the coordinator wants code-absence instead of
env-gated-off, the `src/` part reverts with one command and only
the fixture proof + counter survive as the record.

## Primary metric (BINDING, §14)

**GO iff ALL hold:**

1. **Fixture proof — dead-borrower return, 100%.** In
   `scripts/test-lendfix-a.js`, with REAL fights through
   `resolveWildMonsterEncounter` (not stubbed fights, not a
   faked `dead` flag — the strip must actually run): the gun is
   back in the living lender's `items` and re-seated immediately
   after the encounter returns, in 3/3 cases — (i) borrower dies
   round 1, (ii) borrower dies mid-fight (round ≥ 2), (iii)
   borrower survives. "Back" means the same entry object the
   lender held before the lend (entry identity), plus the
   unspent lent cells. Encounter-gear fixture throughout: a
   geared villager fighter with a party, never a fresh un-geared
   solo scholar.
2. **Regression — live-borrower return still works.**
   `scripts/test-lend-a.js` returns to **41/41** against the
   rebuilt lever + fix (it currently records 3/41 with the lever
   absent), and `scripts/test-gunrate-a.js` (39/39) +
   `scripts/test-cellgate-a.js` (12/12) stay green against the
   rebuilt substrate.
3. **Guardrail — dormant fix changes nothing.** With the lend
   OFF, the fresh band (below) run under the new lendfix driver
   is byte-identical to the no-fix control leg (same seeds, same
   substrate, old lend driver without the counter) on every
   simulation field, EXCEPT the new `v4lendPool` rows. Any other
   difference is a STOP-and-diagnose, not a metric error.

**Verdict ladder (frozen):** GO = all three hold → the fix +
counter land (env-gated code + instrument + evidence; no lend
re-test, no switch-on). NO-GO = any bar misses → the `src/`
fix does not land (reverted before commit); the counter may
still land if its own proof passes and the evidence says so
explicitly. A NO-GO on bar 1 is a FIX finding (the sink is not
closed — the next arm needs a different return design, not a
re-test). A NO-GO on bar 3 alone is a SUBSTRATE finding (the
dormant code is not dormant — investigate, do not ship).

## Secondary metric (supporting, never re-scored)

- **Pool measurement:** lendable moments per seed on the fresh
  band 107081–107088, 150d, competent, lend OFF, on the rebuilt
  substrate (GUNRATE=1 + CELLGATE=1). Reported as: moments per
  seed, by kind (`gun` | `cells`) and by source (`tile` |
  `adjacent`), with the distinct-fight count alongside the
  raw-moment count. This number — not the presence band — prices
  the next lend re-test's participation floor. If the pool is 0,
  that is a finding (the lend has no pool even with guns in the
  world), not a metric error.
- **Wall numbers every run:** national / table / wins, wave-4
  and wave-5 unlocks, median survival, per seed. Table: not
  instrumented by this driver — reported as null, never faked.

## Horizon, seeds, policies

- **Horizon:** 150d, death-aware (same as the lend/gunrate/
  cellgate/presence bands, for comparability). Dead villages stop
  simulating (+10d tail max).
- **Seeds: 107081, 107082, 107083, 107084, 107085, 107086, 107087,
  107088 — FRESH band.** Searched: every
  `evidence/*/sim-*-prereg.md` (grep `107081` / `10708`): no
  prereg names this band. No dedicated forbidden/contaminated
  band list names it (no such list file exists in the goal
  `hidden_files/`). Two legs, identical seeds, differing ONLY by
  driver (control = `scripts/lend-driver-a.js`, no counter;
  fix = `scripts/lendfix-driver-a.js`, counter + fix present in
  the tree). BOTH legs LEND unset, both GUNRATE=1 + CELLGATE=1.
  Substrate env (both legs): VETREENGAGE=1 + PARTYSIZE4=1 +
  FLEEREPAIR2=1 + FIGHTALLY2=1 + SENSEEXPED=1 + BOWOPEN=1 +
  SPEARGATE=1. SEARSUPPLY, BOWCRAFT, FUSIONCELL, PRESENCE unset.
- **Policies:** competent verbatim.
- **Instrument:** `scripts/lendfix-driver-a.js` (clone of
  `scripts/lend-driver-a.js` — all cell / searcaster census +
  grant wraps + lead-rule + flee-cause instrumentation kept
  verbatim — PLUS the `v4lendPool` recorder; the `v4lends`
  recorder is kept but must stay EMPTY on both legs, lend OFF);
  analyzer `scripts/analyze-lendfix-a.js` (clone of
  `scripts/analyze-lend-a.js`, same judge shapes, PLUS
  `poolStats`); proof test `scripts/test-lendfix-a.js` (the
  real-death return fixtures + pool-counter fixtures + analyzer
  selftest). **§15 panel:** a panel compare is NOT warranted
  for a lend-off guardrail pair (both legs are the same game);
  the guardrail is the byte-identity check in bar 3, run by the
  analyzer on the two corpora. If bar 3 fails, the panel is run
  as a diagnostic, not as the judge.
- **PILOT ONLY.** No 12–16 seed confirm in this run; the pool
  number stands as measured on 8 fresh seeds.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** the lend band saw 172–231 wave-4+ meetings on
   8 seeds; the gunrate substrate grants ~6 guns per band. If
   the fresh band grants ~1 gun, the pool is a SUPPLY finding
   about the rebuild (stop and diagnose the rebuild, do not
   judge the pool against a starved band).
2. **Mechanism pre-check (frozen, not a sim):** the proof tests
   (`test-gunrate-a.js` 39/39 + `test-cellgate-a.js` 12/12 +
   `test-lend-a.js` 41/41, GREEN before the pilot) prove the
   rebuilt substrate + lever, PLUS `test-lendfix-a.js` (GREEN
   before the pilot) proves the return from a real dead borrower
   and the pool counter on fixtures, and the analyzer
   `--selftest` covers the judge shapes (GO, NO-GO per bar,
   byte-identity guardrail, empty-`v4lends` assertion).
3. **Draw-neutrality check (frozen):** the rebuild + fix add
   ZERO `Math.random()` calls — verified by grep over the diff
   (`git diff -U0 | grep -c "Math.random"` on added lines must
   be 0, discounting comment-only mentions) before the pilot,
   and by the proof tests' draw-count assertions. The pool
   counter adds zero draws (pure reads).
4. **Fidelity check (frozen):** the control leg (old driver,
   lend OFF) on seed 107081 must reproduce the lend-a CONTROL
   corpus shape for a quiet seed — not byte-identical (fresh
   band), but the same substrate signature: holder-days > 0 on
   the band, gun grants ≈ 6, `v4lends` empty. If the band grants
   ~1 gun, the rebuild is not faithful — stop and investigate
   before judging anything.

## Canon note

`docs/CANON.md` (manifest) was consulted. **No canon doc covers
the searcaster, the contest-prize area, or the lend** — said here
rather than inventing canon (same as the lend/gunrate/cellgate/
presence arms). The prize, grant, equip, volley, lead,
expedition-holder, and world-tick rules are cited from code
(`contests.js` `_cxItemPrize`, `game.js` `rollAlienLoot` /
`alienLootGrant` / `villagerMonsterTick` /
`resolveWildMonsterEncounter`, `equipment.js` `rangedWeaponOf` /
`autoEquip`, `fieldFights.js` volley, `party-wiring.js`
`villagerFightAllies`), not from canon. The lend is a design call
(the lend-a arm's, Steve can overrule): when the village's best
weapon is standing in earshot of the hardest beast and the fighter
going in has no gun, the carrier hands it over for the fight and
takes it back after.
