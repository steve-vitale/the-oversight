# Pre-registration — sim-fightgate-scope-b (Loop B run fleshout-loop-b-20261118T0130Z, axis: winnability chain)

Committed BEFORE any judged sweep. Judge strictly against this file; a miss
is DIAG-NO-GO or METRIC-BROKEN per the verdict mapping below, never
re-scored against a friendlier metric mid-run. Metric doubts go under
"metric review" in the evidence file, for the NEXT run.

## Run identity

- Arm: sim-fightgate-scope-b (Loop B) · Branch: `sim-fightgate-scope-b`,
  based on master `62b1e749d` (journey-endgame r239 run note; the task's
  cited master `b30a6367b` is 2 commits behind it).
- Finding: #2506 (Loop B arm sim-seekgate-b, run
  fleshout-loop-b-20261118T0026Z, evidence/2026-11-17/sim-seekgate-b.md):
  aid and world-tick meetings never consult the fight gate, so the SEEK
  gate's scope is expedition-only. The village learns the Suburb leave
  trick (3/8 seeds) but every post-learning Suburb meeting arrives by
  world-tick or aid. Next arm per the finding: a gate or diagnostic for
  the aid/world-tick meeting paths, or a re-judgement band where an
  expedition Suburb meeting follows trick-learning.
- Sibling arms sim-expedroster-b and sim-triodrought-b run concurrently
  under the same 0130Z run in their own worktrees with their own output
  files — no shared writes.

## Shape decision: DIAGNOSTIC (decided from the code, before any build)

This arm is a DIAGNOSTIC, not a gate, for three code-read reasons:

1. **There is no SEEK decision on the wild paths to gate.** `winPlanFightGate`
   (src/js/win-plan.js) is called from exactly one place:
   `expeditionMonster` (src/js/villager-agency.js). The wild routers —
   `resolveWildMonsterEncounter` (src/js/game.js, called from
   `villagerMonsterTick` = the world-tick path) and `resolvePatrol`
   (the patrol path), both routing a lingering raider through `aidFight`
   (src/js/comms.js) only during an aid crisis — never call the gate.
   The gate's SEEK clause withholds a *forced walk-in*; the wild paths
   never walk in on purpose, so extending the SEEK gate there would
   gate a decision that does not exist.
2. **The SEEK gate itself is not on this base.** SEEKGATE lives on the
   HELD branch sim-seekgate-b (tip 58fe5bb07, based on the held
   fleerepair2 branch); master has no `isLeaveCounterSpecies`, no
   SEEKGATE flag, no `seekLeaveWalks`. A gate arm would first have to
   adopt/port two held branches — a merge-order dependency this arm
   does not take on.
3. **The gateable thing on the wild paths would be a NEW avoid, and
   whether it matters is unmeasured.** The wild paths do not even run
   the awareness evade: `fieldFight` runs the pre-fight evade check
   only when `opts.awareness` is set; `expeditionMonster` passes
   `{awareness: !_wpSeek}`, the wild routers pass no awareness option,
   so wild contact is FORCED. A launched party or table-stage veteran
   jumped by a wave-4 beast on the road gets no outmatched-avoid and no
   veteran-guard. But the only protection the wild paths DO have — the
   in-fight trick — already fires there: `villagerTrickAction`
   (src/js/fieldFights.js) returns the round-1 `leave` for a Suburb
   whenever the village knows the trick, in ANY fieldFight, whatever
   the path. The seekgate evidence shows post-learning wild Suburb
   meetings already end in the wise leave. So the scope gap's harm, if
   any, is in wave-4 meetings generally (deaths/flees a gate would
   have avoided) — and that harm is unmeasured. Kill discipline says:
   measure first, gate second.

The diagnostic therefore censuses every wave-4+ meeting on the wild
paths (world-tick / aid / patrol) on a fresh band, classifies each one
by what the expedition gate WOULD have done (outmatched / veteran-guard
rules replicated verbatim, computed from a pre-fight snapshot — never
enforced), and reports the harm counts as the ANSWER. If the census
shows real harm (would-avoid deaths, launched parties mauled), the
next arm builds the gate with measured numbers; if it shows none, the
finding is answered as scope-without-harm and no gate is built.

## Canon (read first)

- docs/CANON.md: read. docs/MONSTER-WAVES.md (leave-counter canon): The
  Suburb — "comfort as a trap — you don't kill it, you ESCAPE it" — and
  monsters.json weaknesses: "you can't kill it — LEAVE. Navigation is
  victory; the fight is a timer". The 'leave' itself is CORRECT
  counterplay per canon. This arm does NOT touch it, does NOT touch
  monster stats, does NOT touch gates/prices/deeds, and changes NO game
  code at all (diagnostic only — the driver is a pure-read recorder).

## The scope gap (code-read, this tree)

- `winPlanFightGate` (src/js/win-plan.js): veteran-guard avoid
  (table-stage veteran, wave >= 3, party < 2 or not all armed),
  outmatched avoid (wave >= 4, party < 3 or not all armed/armored),
  trick-hold (returns null — withholds SEEK only), SEEK (walk in on
  purpose, awareness evade skipped). All four decisions exist only on
  the expedition path.
- `expeditionMonster` (villager-agency.js:645): the ONLY caller. It also
  calls `winPlanSeedFromFight` on evade and `winPlanNoteFight` after the
  fight — neither is called on the wild paths (the wild router seeds a
  plan only on vFlee under VETREENGAGE, and never notes a party fight).
- `resolveWildMonsterEncounter` (game.js:20852) and `resolvePatrol`
  (game.js:8102): straight to `aidFight` (lingering raider + aid crisis)
  or `fieldFight` with no awareness option — forced contact, no gate.
- `villagerTrickAction` (fieldFights.js): the Suburb `leave` fires at
  round 1 whenever `knownSig` (village knows the trick) — path-independent.
  Pre-learning, the same meeting is a mauling (and the learning path).

## Pre-registered metrics

Single census leg (no contrast leg — nothing is built, nothing differs).

- D1a (completeness): wild wave-4+ meetings with an unclassified
  would-avoid verdict == 0. A null/incomplete `wild` snapshot counts
  as unclassified, never as a silent "no avoid".
- D1b (population): wild wave-4+ meetings (origin world-tick / aid /
  patrol) >= 40 across the band.
- D2 (Suburb presence): wild Suburb meetings >= 3 (any trick state).
- D3 (classifier validity): on expedition rows carrying a gate snapshot,
  the analyzer's would-avoid replica agrees with the real gate's
  avoid/null/seek result on >= 95% of rows; n >= 5 required.
- Instrument: 8 files, exactly the frozen seed list, 0 instrument
  errors, every FOUGHT encounter row carries mHpStart (evades and kills
  exempt, per the fleerepair2 rule).
- Proof: scripts/test-fightgate-scope-b.js green on the final tip, and
  scripts/analyze-fightgate-scope-b.js --selftest green.

**Verdict: DIAG-GO iff D1a && D1b && D2 && D3 && instrument clean.**
**METRIC-BROKEN iff D1b or D2 fails, or D3 has < 5 gate rows**
(population absent — the question is unanswered, not answered-no).
**DIAG-NO-GO iff D1a fails, D3 agreement fails, or the instrument is
dirty** (the instrument, not the world, is wrong). No re-scoring.

Reported as the ANSWER (not gated): wild would-avoid count by rule
(outmatched / veteran-guard); would-avoid deaths and flees (with damage
taken); wild meetings hitting a launched plan, and of those the
would-avoid subset; wild plan-stage fighters (hunt/standing/table);
the Suburb slice — wild Suburb meetings by trick-known, outcomes,
wise leaves, deaths, damage taken; expedition would-avoid count as
context (how often the gate avoids where it runs).

## Calibration (frozen before the census)

From the fleerepair2 control corpus on master
(evidence/2026-11-17/perseed-fleerepair2-b-ctl, 8 seeds, 150d, same
substrate family): wave-4+ encounters by origin — expedition 23,
world-tick 50, aid 84 (wild 134); Suburb — world-tick 3, aid 1,
expedition 2 (wild 4); wild outcomes — vDie 17 (aid 13, world-tick 4),
vFlee 97, vKill 7, mFlee 13. D1b (40) sits well below the observed wild
134; D2 (3) sits below the observed wild Suburb 4. Both bars are
population floors, not effect sizes: if the fresh band runs dry, the
verdict is METRIC-BROKEN, not a re-scored GO.

## Design (seeds, policy, horizon, instruments)

- Census band: **104301–104308** (8 seeds, FRESH — verified 2026-11-18:
  grep of evidence/*/sim-*-prereg.md for each seed 104301–104308
  returns 0 hits; grep of evidence/2026-11-1*/*.md returns 0 hits;
  standalone-token grep of all evidence/*.md returns 0 hits; no
  filenames contain 10430x. Rejected collisions found during the check:
  104201–104208 belongs to the sibling arm sim-expedroster-b
  (evidence/2026-11-18/sim-expedroster-b-prereg.md, committed
  1c763a592); 103601–103608 is the seekgate/fleerepair2 diagnosis band;
  103901–103908 is the launchparty band. Per the seed-band skill, a
  named band counts as used even without a judged corpus — 104201 was
  first picked, then abandoned on finding the expedroster naming, and
  104301–104308 was picked instead.)
- Horizon: 150d death-aware. Policy: competent verbatim
  (scripts/policies/competent.js).
- Substrate: VETREENGAGE=1 PARTYSIZE4=1 FLEEREPAIR2=1 (the seekgate
  substrate, so launched parties exist and suburb plans cannot be
  seeded). FIGHTALLY2 unset. SEEKGATE unset (not on this base).
  Single leg: MODE=diag.
- Instruments (new files, distinct names — never modify shared
  analyzers): scripts/fightgate-scope-driver-b.js (fleerepair2 driver
  copy: same recorder; adds the `wild` pre-fight snapshot — plan +
  party + gear + isTableVeteran — to every wave-4+ encounter row, and
  `isTableVeteran` to gate rows; MODE/env validation for this census —
  diag requires all three substrate flags and SEEKGATE unset),
  scripts/analyze-fightgate-scope-b.js (fleerepair2 analyzer copy:
  same launch join; adds classifyWouldAvoid — the gate's two avoid
  rules verbatim — the wild census tables, the Suburb slice, the D3
  gate-agreement cross-check, and the frozen D1/D2/D3/instrument
  judges; --selftest on synthetic legs),
  scripts/test-fightgate-scope-b.js (proof: §1 live wild-path Suburb
  leave with trick known / none without; §2 live wildSnapshot +
  fightOrigin taxonomy; §3 analyzer incl. --selftest; §4 driver
  exports).
- No balanced panel: there is no game-code change and no contrast leg,
  so there is no before/after to compare. The validity gate is D3
  (replica vs live gate) plus the instrument bar — stated here, not
  waived silently.
- PILOT GATE: the census IS the pilot (8 seeds, one leg). A 1-seed
  30d driver smoke precedes the full census to prove the recorder
  writes rows with `wild` snapshots; the smoke seed is 104301 (the
  first census seed, same substrate) and its output is discarded, not
  judged — the judged corpus is the 8-seed 150d run only.
