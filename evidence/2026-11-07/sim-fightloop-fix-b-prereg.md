# sim-fightloop-fix-b — prereg

**Arm:** sim-fightloop-fix-b (game-code BUILD) · **Run:** fleshout-loop-b-20261108T0245Z · **Axis:** scale-onramp / winnability chain · **Tracker blank:** (1) · **Findings:** #1885 (the combat-divergence account; fix-shape candidate (b)) · **Branch:** sim-fightloop-b, cut at master `c9fea16ee` (worktree HEAD == main-tree master tip at prereg time, verified 03:03Z) · **Base for sweeps:** this worktree, before (baseline) and after (candidate) the fix — no detached checkouts, no archive trees.

## The question

Does decoupling the field-fight hopeless/flee evaluation from mitigated per-hit damage restore the frozen band? The combat-divergence arm (`evidence/2026-11-07/sim-combatdiv-b.md`, DIAG-GO) settled the mechanism: the gear-protection retune collapses band 53001–53008 through the flee/hopeless calculus, not through loadouts or a re-roll. Worked example — 53002, Kieran vs the cliffhanger, day 4: at C1 (protection 4) he takes 62 damage over 6 rounds, judges the fight hopeless at 38 HP, and runs alive; at P2 (protection 5) he takes *less per round* (8.7 vs 10.3) but the fight never looks hopeless, so he stays 10 rounds, kills at 13 HP, and the village thins out. Better armor turned a survivable retreat into a near-death kill. The harm is not the damage number; it is the decision the damage number feeds.

## The fix — candidate (b), exact construction

In `src/js/fieldFights.js` only, in the `fieldFight` morale block:

- Track a parallel accumulator of **unmitigated incoming damage**: the monster-phase `total` as it stands *before* the `armorReduction` block — i.e. after board/ability modifiers (freeze tag, hogtie, peacemaker, godpath `fieldIncoming`, signature overrides) but before armor absorption, `wornDamage` (shawl avoidance), unbreakable brace, and shield wall. Lead hits accumulate into `rec.vTakenRaw`; ally hits into `rec.allyTakenRaw` (leech share split at the same ratio as the mitigated share, so the party raw total is exactly the raw incoming). The current-ally raw total resets when a new ally is called in, mirroring the existing `_allyTakenLive` (current-ally-only) read.
- The morale trajectory read uses the raw totals: solo `mDpr = rec.vTakenRaw / round`; party variant `rtd = (vHp + allyHp) / ((rec.vTakenRaw + currentAllyRaw) / round)`. `hopeless = rtd < rtk * 0.85` and `winning = rtk <= rtd * 1.1` are unchanged in form — only their incoming-damage input changes.
- NOTHING else changes: `rec.vTaken` (actual damage taken), HP, settlement (`hurtVillager`/`sealDamageResult`), narration, the floor flee (`vHp / vHpMax < fleeAt`), the committed-finish hold, trick holds, war cry / rally, and all round caps are byte-identical in behavior. No RNG draws are added or removed (pure arithmetic on values already computed), so baseline and candidate share the same RNG stream until the first morale decision differs — the fix is decision-only, and the streams stay aligned up to that decision.
- Player turn-based fight paths (`tbFightTrajectory`, `tbVillagerFlee`, `game.js` tactical engine) are NOT touched: the settled mechanism is the villager field fight, and the brief scopes the fix to it. If the pilot shows the TB path also needs the decoupling, that is a separate arm, not a silent scope widening here.

Candidate (a) (revert the retune's protection values) is NOT substituted if (b) proves unimplementable cleanly — the brief forbids it, and the evidence file will say so instead.

## Proof (written with the fix, run before any judged candidate sweep)

`scripts/test-fightloop-fix-b.js`:
- **Unit leg — decision invariant to protection:** the same scripted field fight (fixed seed, fixed monster, fixed weapon) run at two worn-protection values straddling the retune's bump; assert the hopeless/flee outcome (outcome, flee round, `fleeHopeless`) is IDENTICAL while `vTaken` differs (armor still absorbs — protection still changes HP, only the stay-or-flee call is decoupled). Fails on unfixed code (the two protections diverge in outcome), passes on fixed code.
- **Before/after leg — the 53002 Kieran day-4 fight shape:** replay the frozen-band fight (seed 53002, day 4, Kieran vs cliffhanger) on baseline vs candidate code and assert the candidate returns the C1 behavior — `vFlee` with `fleeHopeless`, ~6 rounds, HP left in the high-30s — while the baseline reproduces the P2 behavior (10 rounds, `vKill`, ~13 HP left). Read off the pilot corpora's `fieldFights` streams (same driver, same seeds), not a separate harness.
- **No-regression leg:** `node scripts/check.js --quick` green on the fixed tree (or the failing line named in the evidence file with its cause).

## Sweeps — pilot first, confirm only on GO

- **Instrument:** `scripts/combatdiv-20261107.js` (the combatdiv driver, committed, unmodified) — doorwalk baseline leg, policy `competent-doorwalk-b`, `TAKESEAT_B=1`, door drive off, 150d death-aware. Corpora: `evidence/2026-11-07/perseed-fightloop-fix-b-baseline/` and `evidence/2026-11-07/perseed-fightloop-fix-b-candidate/`. The driver's `fieldFights` streams carry `outcome` / `rounds` / `vTaken` / `vHpLeft` / `fleeHopeless` per fight, so the fix's effect is readable fight by fight.
- **Baseline leg runs FIRST, on the unfixed worktree** (before the fix is applied), so the before/after is identical seeds, identical code except the fix.
- **Pilot seeds:** 53001–53008, FROZEN — the bisect's diagnostic band, reused deliberately as the tuning target is the collapse itself. **Horizon:** 150d death-aware (`runDays` stops on village death / win, +10d tail max). Justification: the GO bars need the median/sits bars, which only a 150d horizon supplies; the mechanism fires on days 3–7 but the verdict is village survival.
- **Policy:** doorwalk baseline leg, as the bisect, loadoutcensus, and combatdiv did — the same substrate the collapse was measured on.
- **Confirm (only if pilot GO):** FRESH band **53801–53812**, 12 seeds, same policy/horizon, baseline + candidate legs. **Freshness check (recorded here, per the seed-band skill):** grep over ALL `evidence/*/sim-*-prereg.md` for `5380`/`5381` → zero hits; grep over ALL `evidence/*/sim-*.md` for each of 53801–53812 → zero hits; forbidden/contaminated lists named in preregs (standacc-b 99201–99208 et al.) name no 538xx seed. **Rejected bands, recorded so the next worker does not repeat them:** 53201–53212 (named in sim-doorwalk-b-prereg.md, sim-doorwalk-confirm-b-prereg.md, sim-feareddoor-b-prereg.md — used); 53701–53712 (53704/53707/53708 used by sim-compvet 2026-10-18); 53501–53512 and 53601–53612 (named in preregs — used). Note: sim-combatdiv-b.md named 53201–53212 as the *planned* confirm band for this fix, but the prereg search shows it was already spent by the doorwalk/feareddoor arms — the plan is superseded by the freshness check, not followed blindly.
- **Balanced panel (§15):** `scripts/balance-panel.js` run on the before tree (unfixed worktree, `--seeds 53001,53002,53003,53004,53005,53006,53007,53008 --policies capable,risk-aware,socialite,winseek --days 150`) and again on the after tree (fixed worktree, same seeds/policies/days); `compare --before <before-panel> --after <after-panel>` and the compare `.md` attached to the evidence file. The panel is the instrument; the pre-registered GO bars below are the judge. (comparePanels flags only scripts/policy changes as errors; src/js changes are the intervention, not an error — verified in `scripts/lib/balance-scorecard.js` before this prereg.)

## GO bars (binding, §14)

Primary metric: frozen-band pilot (53001–53008, 150d, doorwalk leg), candidate vs baseline on identical seeds.

- **GO (pilot):** median survival **≥120d** AND table sits **≥4/8** AND the scalemetric cost bars: starvation **≤ control+2** on totals AND on arm-only deaths; median survival **≥0.8× control median**. Control = the baseline leg run in this arm (current master, retune live), NOT the combatdiv P2 corpus (different code base — P2 was C1+retune, master has moved since).
- **NO-GO:** any bar missed. A miss is NO-GO, never re-scored against a friendlier metric mid-run. Pilot NO-GO kills honestly: leave no game-code trace (commit prereg + instruments + evidence only; the fix branch is abandoned, not landed).
- **Confirm GO (fresh band 53801–53812):** same bars against the fresh-band baseline leg (median ≥120d, sits ≥4/8, starvation ≤ control+2 totals and arm-only, median ≥0.8× control median). Confirm NO-GO holds the fix for re-judgment; it does not land.
- **Proof bars:** `scripts/test-fightloop-fix-b.js` green (unit leg + 53002 leg + check-quick); pilot corpora complete (8/8 seeds both legs, 0 instrument errors); panel compare `.md` attached.
- **Sense-test:** the 53002 Kieran fight read in plain words on both legs (who fought what, what changed, what it meant), plus the village assessment (what the villages looked like, who thrived/died and why).

## Scale-wall numbers (reported for baseline and candidate pilot corpora, and for the confirm band if run)

National / table / wins, wave 4–5 unlocks, median survival — per leg.

## Non-goals

- No candidate (a) substitution; no TB-fight-path changes; no loadout/equip-score changes; no retune-value changes. The fix touches the morale decision input only.
- No landing, no merge, no push, no version bump — report ready-to-merge; the coordinator lands it.
- No new measurement arm on an already-proven constraint beyond this fix's own before/after (the re-point's standing rule).

## Metric review (pre-registered note)

- The GO bars are the bisect sketch's bars (median ≥120d, sits ≥4/8) plus the scalemetric cost bars from the brief — the same bars the collapse was judged against, applied to the fix. No friendlier re-scoring is available. If the baseline leg fails to reproduce the collapse shape (median ~76d, sits ~2/8), the metric is not wrong, the base/instrument is — that is a NO-GO with cause, recorded in the evidence file, and the arm stops before judging the candidate.
- One known limit, stated before the read: the pilot reuses the frozen band the collapse was diagnosed on, so it can show the fix restores *that* band; the fresh-band confirm is what shows it generalizes. A pilot GO with a confirm NO-GO holds the fix.
- The `winning` read shares the `rtd` input with `hopeless`, so it moves with the fix too — that is the same decision input, not a second change. The floor flee reads live HP, not the trajectory, so it is untouched by design: protection still saves HP, and a fighter at 5% still runs.
