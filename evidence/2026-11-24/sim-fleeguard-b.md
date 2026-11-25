# sim-fleeguard-b — evidence (finding #2602, BUILD, GO)

**Arm:** sim-fleeguard-b, run fleshout-loop-b-20261124T2230Z (built),
adopted + landed by run fleshout-loop-b-20261125T0130Z.
**Type:** BUILD — default-OFF lever, pilot (8 seeds, before/after on identical seeds).
**Finding:** #2602, "WINNABLE FIGHTS END ON THE FLEE CALL, NOT ON DAMAGE"
(`evidence/2026-11-24/sim-fleecall-b.md`, DIAG-GO). Named next build from
Loop B arm sim-fleecall-b (run 20261124T2130Z).
**Base at build:** master tip `b48b195db` (fleecall DIAG-GO merged;
worktree `~/workspace/worktrees/sim-fleeguard-b`).
**Adoption:** the 2230Z run closed out partially at 01:25Z with the arm
GO-judged but in-flight — corpus + analysis + §15 panel on disk,
uncommitted, evidence unwritten, worker still running. The worker
has since finished (no sweep processes, heartbeat 01:24:55Z, final
report delivered); this file is the adopting coordinator's evidence,
written from the frozen prereg, the committed branch, and the
analyzer's `fleeguard-b-analysis.json`. Nothing was re-judged:
the verdict below is the analyzer's, on the frozen bars.

## Question (from the prereg)

On band 109501–109508, 11 of 20 fled launched fights end on the
"hopeless" branch — "sees how this ends" — judged on an imagined
fight: the engine compares rounds-to-kill against rounds-until-the-
lead-drops **as if the lead wore protection-4 armor**
(`fieldFights.js` FIGHTBLEND-B, `vTakenP4`), while the leads on this
band wear protection 27–37. On live numbers the sharpest case was
winning (monster 0.8 rounds from death, lead 5.7 rounds from
dropping) and still fled.

## Lever

`FLEEGUARD=1` (env flag, default OFF — off-mode byte-identical).
In `src/js/fieldFights.js`, situational morale, immediately after
the DOORFLEE2 block: when the P4 read says hopeless (round ≥ 2,
wave ≥ 4, not learn-first, not sealed), re-read the SAME race on
live numbers — live party HP left vs live damage taken per round,
same 1.1 winning margin — with the DOORFLEE2 lesson kept as
LEADER-SURVIVAL-ONLY: the leader's live HP must exceed their
incoming rate times the rounds left to kill (`vHp > leaderRate *
rtk`). If both hold, the fight holds (`hopeless = false`, `winning
= true`, `fleeAt = 0.05`), logs "(Live-numbers guard)", counts
`rec.fleeguardHold`. The bravery floor ("past holding", low HP) is
untouched — the guard applies to the hopeless race only. No RNG is
drawn. A party losing on live numbers flees exactly as before.

## Pre-registration

- Prereg `519dbc69b` (frozen before any judged sim) + correction
  `63c2c6bb6` (flee-variant cross-check is one-directional: a floor
  flee may legitimately carry `fleeHopeless=true`; corrected before
  any judged sim ran).
- Build commit `6742a0d8e` [needs-eyes]: guard + proof, driver,
  analyzer, panel builder.
- Horizon **150d, death-aware**; seeds **109501–109508** (the fleecall
  band, exact literals); policy **competent verbatim** (sha
  `1884c8852d38`); substrate (landed code, both legs)
  `SENSEEXPED=1 PARTYSIZE4=1 VETREENGAGE=1 FLEEREPAIR2=1
  FIGHTALLY2=1`, carriers FIELDCAPDMG/RAGEFREE/FREESTRIKE asserted
  OFF on both legs. Arm leg adds `FLEEGUARD=1` only.
- Frozen baseline (fleecall/basedmg corpus, re-verified before
  freezing): 27 launched wave-4+ meetings, 0 kills, vFlee 20,
  vDie 7, hopeless 11 / floor 9, within-one-round 1/20 (5.0%),
  median survival 142.5d, national 0/8, wins 0/8, wave 4 8/8,
  wave 5 4/8, community lost 5/8, starvation 1 total / 0 villager.

## Verdict: GO — all 9 frozen bars pass

Judged only against the frozen bars
(`evidence/2026-11-24/fleeguard-b-analysis.json`, verdict GO):

| Bar | Ctl | Arm | Bar | Result |
|---|---|---|---|---|
| Pool floor | 27 meetings | 23 meetings | ≥ 10 each | PASS |
| Zero drift (ctl) | 27 meetings, 0 kills, 20 vFlee, 7 vDie, 11 hopeless / 9 floor | — | reproduce baseline exactly | PASS |
| Primary: hopeless-flee count | 11 | 9 | arm ≤ ctl − 2 | PASS |
| Mechanism: guard fires | 0 | 6 | ≥ 2 | PASS |
| Floor untouched | 9 | 9 | ±1 | PASS |
| Co-primary: villager combat deaths (vDie) | 7 | 5 | arm ≤ ctl + 1 | PASS |
| Cost: starvation | 1 total / 0 villager | 1 / 0 | arm ≤ ctl + 2 | PASS |
| Cost: survival | median 142.5d | median 146d | arm ≥ 0.8× ctl | PASS |
| Instrument health | 0 parse errors, 0 instrument errors, selftest green, determinism byte-identical, proof green | — | all clean | PASS |

Secondaries (reported, never re-scored into the verdict): kill share
0/27 → 0/23; within-one-round share 1/20 (5.0%) → 0/18 (0%);
wave-5 unlocks 4/8 → 2/8 (see metric review); community lost 5/8 →
4/8; national 0/8, full-seat wins 0/8, wave 4 8/8, both legs.

## What the guard actually did

The guard fired on 2 meetings, 6 holds total:

- **s109503 d35, eulogy** (5 holds): Jovan Milic leads Zoe Adams and
  Pedro Gallagher against a 1062-HP eulogy. The P4 read says hopeless
  from round 4; the guard holds the fight 5 rounds on live numbers
  (lead in 45P armor, taking 50 damage over 9 rounds against the
  P4-imagined 214). The party deals 710 damage — monster down to 352
  HP — and then flees at lead HP 23 (0.23 frac) when the live race
  finally turns. The hold bought a real fight; it did not buy a kill.
- **s109505 d104, audit** (1 hold): held once on live numbers (lead
  51 HP, monster 1061 HP remaining, 19.4 damage/round), then fled.
  A single-round stay of execution, not a turnaround.

The "(Live-numbers guard)" log line fires in 6 of the 8 arm per-seed
files. The guard moves hopeless flees 11 → 9 and villager combat
deaths 7 → 5 while the floor (9 = 9) never moves — exactly the shape
the prereg predicted: it touches only the hopeless race.

## Sense-test (SENSE-TESTING LAW)

Two fled fights on the arm leg + the held fight, read as human calls:

- **Fled, s109501 d36, algorithm, hopeless:** 4 rounds, monster at
  941/1062 HP, party dealing 53.8/round (18 rounds to kill), lead at
  39 HP. A party losing the damage race by an order of magnitude
  leaves while it still can. Sensible — the guard correctly did not
  fire (live numbers agree with the P4 read here).
- **Fled, s109501 d73, eater, floor:** 2 rounds, monster at 1036 HP,
  lead at 5 HP (0.05 frac). A last-legs leader calls the retreat
  before dropping. Sensible — and the guard correctly never touches
  the floor.
- **Held then fled, s109503 d35, eulogy (above):** stayed while the
  race was winnable on real armor, left when the lead was down to 23
  HP and the monster still had 352 HP. That is a person changing
  their mind on new evidence, not a tripwire flipping. Sensible.

No transcript reads as robotic or mechanical: every flee in the
corpus has a legible reason in its own numbers (losing race, low
lead HP, or a floor call), and the holds fire only where the live
race disagrees with the imagined one.

## Balanced panel (§15)

`scripts/build-fleeguard-b-panels-20261124.js` + `balance-panel.js`:
8 paired cases, decision **review_required** (screen only). No
material signal on any metric: table win rate 0 → 0, national 0 →
0, player deaths 11 → 9.75 per run, village deaths 111.25 →
102.875 per run (both directionally favorable, flagged
no_material_signal by the panel). The panel is the instrument; the
frozen bars above are the judge.

## Metric review

- **Kill share stays a secondary, as pre-registered.** The guard
  buys rounds, not kills: kills are 0/27 → 0/23. That is consistent
  with the basedmg census (damage, not the flee call alone, is the
  binding constraint on this band) and is not a verdict item.
- **Wave-5 unlocks dip 4/8 → 2/8.** Not a frozen bar; reported
  plainly as a diagnostic. On 8 seeds it is within noise (the arm
  leg's median survival is higher and community loss lower), but the
  next band that touches wave-5 reach should re-check it rather
  than assume it away.
- **Meeting population moves 27 → 23.** Held fights run longer and
  the village launches fewer subsequent meetings inside the horizon.
  The pool bar (≥ 10 each) still passes with room; the population
  shift is observed, not adjudicated.
- **Within-one-round share 1/20 → 0/18** is the direction the
  fleecall metric review asked for (fewer fights fled one round
  from a kill), but it is a secondary with no threshold and is not
  claimed as a win.
- **Smoke0 legs** (2 seeds per leg, `perseed-fleeguard-b-smoke0-*/`)
  ran for the determinism check; the analyzer's instrument bar
  (determinism byte-identical on re-run) covers them.

## Village assessment (plain words)

The villages on this band are the same ones the fleecall census
watched: strong enough to reach wave-4 monsters, brave enough to
launch, and still losing the fights they launch. The guard fixes
the narrow thing it was built for — twice it stopped a party from
walking away from a fight it was actually winning on real numbers,
and one of those holds turned a 4-round walkout into a 9-round
fight that left the monster at a third of its health. But nobody
killed anything on either leg, and the villages still reach wave 5,
survive, and never reach national or win. The flee call was a real
defect and it is now smaller; the fight itself — damage, and getting
all three fighters into it from the first round — is still the wall.
That is the next arm's job (wilddeath blank #1).

## Proof and landing

- Proof: `scripts/test-fleeguard-b.js` — **50 passed, 0 failed**,
  re-run green by the adopting coordinator on the branch tip
  (pre-rebase, 2026-11-25 ~01:53Z, 303s). Re-run again post-rebase
  and on merged master before landing.
- Determinism: analyzer instrument bar, byte-identical on re-run.
- Adoption note: the building worker's final report carried a
  correction that `node scripts/check.js --quick` on the branch
  finished with **344 scripts, 3 failures** — the three failing
  scripts' identities were NOT captured (the `tail -15` cut them).
  That is an open reporting gap, not a green claim: the adopting
  run re-runs check.js --quick after the merge and records the
  failing scripts by name.

## Infrastructure

Adoption run notes (fleshout-loop-b-20261125T0130Z): worktree cap
hit at registration (16/16 active) — freed one slot by releasing
the previous B run's `sim-allystart-b` tree (branch content already
on master as rebased `55c776319`; tree clean, heartbeat 23:18Z
stale; branch left in place, not force-deleted). Registry lock
jams delayed registration and the proof re-run (heartbeats landing
with long flock waits, as in the 2230Z run).
