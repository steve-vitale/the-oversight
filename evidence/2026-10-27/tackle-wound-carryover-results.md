# FIELD-WOUND CARRYOVER — results (tackle-wound2)

Pre-registration: `evidence/2026-10-27/tackle-wound-carryover-prereg.md`
(includes the B4b chain-band amendment and the chain-attempt increase, both
recorded before the after-run and before any verdict; no bar was dropped).
Proof script: `scripts/test-wound-carryover-20261027.js`
(one seed per process; seeds 101–108; band: wave-1 bulldozer, player at full
health, one Haven ally).

## The call (as documented in the pre-registration and in code)

**Field wounds carry into turn-based fights, because villagers follow the
same rules as the player.** A villager who gets hurt out in the field starts
their next turn-based fight exactly as hurt as they were — the same way the
player's fighter starts at their real health.

**This is a Muse call under Steve's standing intent, NOT a Steve ruling.**
Standing intent: "tackle all", "figure it out yourself", and "villagers are
not special, same rules as the player". **Steve can overrule this call.**

## What changed (`src/js/fieldFights.js` only)

1. A field-fight ally now enters at their REAL health — a Haven villager's
   `village.health` (default 100 when no entry exists), instead of a fixed
   70-health body. Foreign allies (aid parties from other villages) keep the
   old 70 body: their health lives in another village.
2. A surviving Haven ally's wounds now settle at the fight's end through the
   same once-only sealed record the lead fighter uses, so they land exactly
   once and can never double-apply. A downed ally is excluded (their fall
   already settled as the flat 30 during the fight).
3. The fight record now carries `allyTaken` / `allyHpLeft` / `allyEntryHp` /
   `allyWoundsSettled`, so the carryover is observable.
4. Turn-based entry needed NO code change: `tbHumanFighter` already starts a
   villager fighter at their real `village.health`. It is proof-locked by B2.

No gating change of any kind (freeze honored). No change to the downed-ally
flat 30, to foreign allies, or to turn-based entry/exit sync.

## Measured results (same seeds, same band, before vs after)

| Bar | Before | After | Verdict |
|-----|--------|-------|---------|
| B1 ally carryover: surviving damaged allies whose health fell by exactly the damage taken | 0 / 100 (0%) | 86 / 86 (100%) | GO |
| B2 turn-based entry: joins starting at exactly the villager's health (H = 30/45/60/80) | 32 / 32 | 32 / 32 | GO |
| B3 lead regression: surviving leads settled to the record's `vHpLeft` | 240 / 240 | 240 / 240 | GO |
| B4 winnability control: turn-based win rate, player + ally at 50 health | 96 / 96 (100%) | 96 / 96 (100%), diff 0.0pp | GO (bound: within 10pp) |
| B4b chain winnability: field fight, then turn-based fight with the same ally at post-field health | 89 / 89 (100%) | 99 / 99 (100%), diff 0.0pp | GO (bound: within 10pp) |
| B5 ally-survival guardrail: field-fight ally death rate | 31 / 240 (12.9%) | 3 / 240 (1.25%), diff −11.7pp | GO (bound: rise ≤ 10pp — it fell) |

Per-seed after-runs all exited 0 (within-run bars B1–B3 green on every seed).
Per-seed raw JSON: `evidence/2026-10-27/wound-carryover/base-*.json` (before)
and `after-*.json` (after).

## Sense check (B6)

A real fight log, seed 103, after the change — the ally reads as wounded,
round by round, and the wound is really there afterwards:

- "the woman in her 30s is already at the door — charges in with the person
  in their 30s, with a gap-toothed grin!"
- "R1: China-Shop Charge hits the woman in her 30s for 23 (77 left)"
- "R3: China-Shop Charge hits the woman in her 30s for 20 (57 left)"
- "R5: China-Shop Charge hits the woman in her 30s for 18 (39 left)"
- Fight record: `allyTaken 61, allyEntryHp 100, allyHpLeft 39, settled true`;
  `village.health` for the ally after the fight: **39**.

## Consequences, stated plainly (not buried)

- Parties with HEALTHY allies got stronger in field fights: a healthy ally
  used to fight at a fixed 70 health and now fights at their real 100. That
  is why the ally death rate fell from 12.9% to 1.25% on this band. It is the
  same rule as the lead fighter, not a new bonus — but it is a real ease
  shift on field fights, and a future balance pass may want to look at it.
- Parties with WOUNDED allies got more honest in the other direction: a
  wounded ally used to enter every fight at a fresh 70 and now enters at
  their real wounded health. That is the carryover itself.
- One knock-on inside field fights: the godpath `aegis_link` hook reads the
  ally's full-health reference, which for a healthy Haven ally is now 100
  instead of 70, so its half-health trigger sits at 50 instead of 35. That
  follows from the honest body; it was not separately tuned.

## Known gaps (NOT fixed here, NOT claimed fixed)

- Two rare field-fight call sites still drop even the LEAD's wounds:
  alien-villager fights (`alienPlayers.js`) and psycho attacks
  (`corruption.js`). Both also have their own broken outcome/death handling,
  so they need their own proof before anyone touches them.
- Nomad-drive kin fights also drop the fight record.
- Foreign allies' wounds still do not carry (their health lives elsewhere).

## Metric review

None — metrics held. B1 measured exactly the gap (0% before, 100% after);
B4b, added before the after-run, proved to be the sensitive winnability
channel (chain wins stayed 100% because turn-based bulldozer fights with a
spear-armed player are easy even with a wounded ally — the bound still
passed, and the chain sample, 89 before / 99 after, was large enough to
mean something). No metric was re-scored; the fresh-50 B4 band was kept as
a control alongside B4b.

## Verdict

**READY TO MERGE** (coordinator merges; this worker does not merge, push,
bump, or verify live). All pre-registered bars GO and the guardrail held.

Quick-suite triage (honest, not "all green"): `node scripts/check.js --quick`
on this branch finished 277 passed, 10 failed. A/B re-runs of the 10 failing
scripts with a pristine `fieldFights.js` showed 9 of them failing on the base
too (measurement-proof freshness, phone-frame receipt staleness, hide
discovery, mobile combat cadence, occupation panels, parity gear line,
establishment voice gate) — pre-existing, untouched by this workstream. The
10th, `test-foodpower-20261014.js`, failed only with this change, because
the ontology validator requires a `(code: …)` citation on the header bullet's
own line; fixed (citation moved onto the rule line, bullet made single-line
so the validator's doc refresh stays additive), and the test is green again
(30 passed, 0 failed). The validator's `docs/ONTOLOGY.md` refresh is
committed with this change and is exactly one added line. This branch
introduces NO new quick-suite failures versus its base.
