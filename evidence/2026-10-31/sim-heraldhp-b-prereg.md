# sim-heraldhp-b — PRE-REGISTRATION (written BEFORE any judged sims, 2026-10-31)

Run: Loop B worker, axis scale-onramp, arm sim-heraldhp-b, run
fleshout-loop-b-20261031T0436Z. Arm type: DIAG ONLY — zero src/js,
zero policy-default flips, zero edits to existing policy files.
Closes or sharpens findings-backlog #1595 (scale-onramp/titan-gate
— HERALD HP DROP UNEXPLAINED IN PART). Out-of-scope gaps go in the
evidence file's blanks section, NOT the backlog (coordinator owns
the backlog).

## Question (from sim-mustercall-b, NOT re-proved here)

Mustercall-b (evidence/2026-10-31/sim-mustercall-b.md, DIAG-GO)
ran a full refused-state census on the herald band: 35/35 refusals
sit on seed 85106 only, all omen stage 2 with the call button
OFFERED. Across that refusal window the Herald entity's HP fell
525/700 (first refusal, day 95) to 105/700 (last refusal, day
130) — a 420-HP drop — but the three captured field fights
explain only 70 of it (day 111: 37 dealt; day 113: 20; day 128:
13). The remaining 350 is OPEN in #1595. Re-reading mustercall-b's
own corpus sharpens the gap before any new sim: the field-fight
logs show entry HPs of 350 (day 111) and 118 (day 128), so the
unexplained drop is not one smear but three exact 175-HP chunks
— 700 (spawn, see below) -> 525 by day 95, 525 -> 350 between
days 97 and 111, 293 (post-day-113-fight) -> 118 by day 125.
Three identical 175-point steps smell like a mechanism, not
rolled fight damage — but that is a hypothesis to test, not a
claim. This arm attributes EVERY delta, chunk by chunk.

## Ground facts (verified against code on THIS base, not quoted)

- Spawn HP is fixed, not rolled: spawnWorldMonster (src/js/
  game.js) sets hp = maxHp = full.hp[0]; the herald def
  (src/data/monsters.json) has hp [700, 900], so a placed Herald
  spawns at exactly 700/700. titanPlace (src/js/titans.js)
  spawns with {titan:true} and no hp override. A first-refusal
  reading of 525 therefore already implies 175 HP lost before
  the window — the pre-window chunk is in scope.
- Field fights write back: fieldFights.js end-of-fight writes
  m.hp = rec.mHpLeft whenever a world entity m was passed and
  the outcome is not vKill. A field fight's lead starts at the
  world entity's current HP (members[0] takes m.hp for pi 0).
- Field channel is NOT wrapped by the titan gate:
  fieldFight (src/js/fieldFights.js) has no titan gate; the
  gate lives in titanWrapCombat (src/js/titans.js), which
  wraps startCombat only and refuses (no fight, no damage)
  when titanMusterReady is false. A refused TB attempt cannot
  damage the Herald.
- Titan restore on tbEnd (src/js/game.js, "TITAN PIECES HOLD
  THEIR GROUND") puts a fought-but-unbeaten titan back at
  FULL HP (o.hp = o.maxHp) — but it only runs for fought
  fights (f.worldOrigin set in startCombat), and the Herald
  is never fought on this band, so it cannot explain a drop.
  It is listed so a rise toward 700 in the ledger is not
  misread as a heal.
- Other fieldFight callers (all route through Game.fieldFight,
  hence through this arm's wrapper): resolveWildMonsterEncounter
  and resolvePatrol (game.js), aidFight (comms.js, itself via
  fieldFight), havenGrowth.js, nomad-drive.js, nomad-wild.js,
  contestEngine.js (contest beasts, m=null — no world
  writeback), alienPlayers.js (m is a fake {name} object — no
  world writeback), villager-agency.js expeditionMonster
  (mdef = world object, m = null — no world writeback, but
  the fight IS recorded by a mid-based wrapper since
  mdef.id === 'herald').
- Titan escalation (titanEscalate, titans.js) touches pantry
  kcal and link trust only — never entity HP. titanDawnTick /
  titanAdvanceOmen / titanMusterUpkeep / titanTurnTick move
  omens, musters and upkeep, not HP, on code reading. If the
  ledger shows a drop inside any of them, that reading
  overturns this paragraph and is reported as such.
- Canon docs: docs/MONSTER-WAVES.md mentions "heralds" only
  as wave-6 network hearts (a different sense of the word)
  and docs/CONTESTS.md has no herald/titan content; the
  operative Herald canon is src/data/titans.json plus
  src/js/titans.js as read above. No canon doc is invented
  or rewritten here.

## Cause taxonomy (from the code paths above; the ledger maps
## every delta to exactly one)

1. FIELD — a fieldFight (any caller) whose mDealt equals the
   delta (cross-checked: ledger field row + world writeback).
2. TB — a fought TB fight's damage carried into the world
   entity (expected ZERO on this band; any nonzero is a
   finding, since TB Herald fights are refused).
3. GATE/WRAPPER — titanWrapCombat / titanResolveFight /
   tbEnd restore effects (expected ZERO drop; a rise to full
   would land here).
4. DAWN/TITAN-TICK — titanDawnTick internals (omen advance,
   escalation, upkeep, turn tick) with no inner fight row.
5. WORLD-TICK — monsterTurn / villagerMonsterTick /
   wander / maintain / worldTick with no inner fight row.
6. SPAWN/REPLACE — entity added, removed, or replaced:
   spawnWorldMonster / removeWorldMonster / titanPlace /
   titanRepairPlacements rows, judged by entity-identity
   tags, not by the HP number alone. A new tag at full HP
   after a damaged tag vanished is a REPLACEMENT, not a
   drop, and is reported separately from damage.
7. OTHER — any delta whose deepest wrapped call names no
   mechanism above. OTHER is unattributed for the primary
   metric. A delta inside sleep/dawn with no inner row stays
   OTHER until a follow-up leg narrows it; it is never
   relabeled FIELD on suspicion.

## Instrument (new, read-only; reuse of the mustercall stack)

- Policy stack identical to mustercall-b (so trajectories
  are comparable): withFullseatDiag(withSeatDrive(
  withWinDefer(TF leadfeast))), FEASTSCALE_R13=1 TRIBFLOOR=1
  WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1 FULLSEAT=1, plus
  HERALD=1 + MUSTER=1 recorders verbatim (herald-instrument
  -20261030.js, policies/muster-diag.js).
- NEW scripts/heraldhp-instrument-20261031.js (HERALDHP=1):
  tags every herald world entity by object identity
  (per-run WeakMap, never written to game state); snapshots
  ALL herald entities per call (tag, array index, tx, ty,
  mx, my, hp, maxHp, titan flag) — never just the first
  find() match, so a replacement cannot masquerade as a
  drop. Wraps (call-through, zero game-state writes, zero
  RNG draws): fieldFight (ALL waves/mids, not just >= 4),
  aidFight, startCombat, tbEnd, spawnWorldMonster,
  removeWorldMonster, titanPlace, titanRepairPlacements,
  titanDawnTick, titanAdvanceOmen, titanEscalate,
  titanTurnTick, titanMusterUpkeep, monsterTurn, animalTurn,
  villagerMonsterTick, resolveWildMonsterEncounter,
  resolvePatrol, worldTick, wanderWorldMonsters,
  maintainWorldMonsters, sleep. Every wrapped call that
  changes the herald snapshot set pushes a ledger row
  {fn, day, depth, before[], after[]}; analysis takes the
  DEEPEST row covering each delta (dedup by before/after
  pair) so a fight inside villagerMonsterTick inside
  worldTick attributes to the fight, not the tick. Daily
  snapshots at sleep exit bound every gap. Field rows
  carry vid, mid, mDealt, mHpLeft, entry/exit world HP.
- NEW scripts/heraldhp-sweep-20261031.js: mustercall sweep
  stack + the HP ledger installed on top; writes
  evidence/2026-10-31/perseed-heraldhp-b/leadfeast/s<seed>
  .json (mustercall corpus shape + heraldhp block). No
  timestamps, no fight ids persisted: re-runs byte-
  comparable. Every per-seed JSON carries its own
  anchorCommit — THIS worktree's HEAD at sweep time
  (re-anchored; mustercall-b's anchor is NOT assumed).
- NEW scripts/heraldhp-analyze-20261031.js: derives every
  judged number from the per-seed JSONs only.
- NEW scripts/test-heraldhp-20261031.js: proof on
  SYNTHETIC fixtures only (no band seeds): ledger
  deepest-row attribution, chunk splitting, replacement
  detection (tag change), field cross-check (sum mDealt
  vs ledger deltas), attributed-share arithmetic.

## Primary metric

Attributed share of the total Herald HP drop across the
seed-85106 refusal window ON THIS BASE: (sum of HP in
deltas mapped to taxonomy causes 1–6) / (HP at first
refusal entry − HP at last refusal entry), with each chunk
named by cause and each chunk's day-span. Window = seed
85106's REFUSED herald attempts on this base (same
definition as mustercall-b). Pre-window spawn→first-
refusal drop is reported as a separate chunk (spawn 700
→ first refusal), NOT folded into the window share — the
window share judges the 420-class question; the
pre-window chunk is attributed the same way and reported
alongside.

## Band verdict (stated now, judged later, never re-scored)

- DIAG-GO: attributed share ≥ 90% across the 85106 window
  with every chunk ≥ 1 HP named by cause, OR the drain
  mechanism is identified AND reproduced in a minimal
  instrument leg (a second sweep leg on 85106 only, with
  the narrowing wrapper, showing the same delta under
  the named call); instrumentErrors = 0 on all seeds;
  ≥ 8 usable seeds; evidence states (a) the chunk table
  (day-span, before→after, cause, evidence row), (b) the
  field cross-check, (c) the replacement verdict (tag
  continuity across the window), (d) wall numbers on the
  band, (e) the ranked next step (fix or follow-up leg).
- DIAG-NO-GO: attributed share < 90% with no mechanism
  identified, or instrumentErrors > 0 with no read-only
  explanation, or a required section (a)–(e) missing.
- DOES-NOT-REPRODUCE (a finding, not a failure of the
  arm): seed 85106 on this base produces ZERO refused
  Herald attempts, or a zero/negative window drop, or a
  window whose HP readings do not descend. Reported with
  the numbers (attempts, entry HPs, trajectory keys vs
  mustercall-b's corpus) — no hunt for a friendlier band,
  no substitution of another seed's window for 85106's.
  If 85106's window exists but the drop is zero, the
  share is vacuous and the verdict is this finding, NOT
  DIAG-GO on 0/0.
- INSUFFICIENT-DATA: fewer than 8 usable seeds.

## Pilot gate (8 seeds before any confirm spend, §9)

Pilot GO requires: ledger + herald + muster instruments
fire on all 8 pilot seeds with zero instrument errors;
per-seed JSONs valid (days > 0, census sorted, heraldhp
daily snapshots present, ledger rows well-formed); AND
an activity signal on ≥ 1 pilot seed (a Herald TB
attempt of any class, a Herald field fight, or omen
stage ≥ 2 reached) — otherwise the band is dry and the
run stops at pilot as INSUFFICIENT-DATA. Pilot size is
NOT the verdict: the confirm carries it. If the pilot
fails on instrument grounds, the verdict is DIAG-NO-GO.

## Horizon + why (death-aware, never a fixed 200d)

Cap 200 loop-days; stop rule is the harness's Game.over
(village lost or won). Identical to mustercall-b: the
refusal window ran to day 130 there, so a shorter cap
would censor the window tail; the death-aware stop keeps
cost at the survival distribution.

## Seeds (exact literals — the herald band, for comparability)

- Pilot: 85101, 85102, 85103, 85104, 85105, 85106, 85107,
  85108.
- Confirm (pilot GO only): 85109, 85110, 85111, 85112,
  85113, 85114, 85115, 85116 (16 seeds total).

## Policies (single-base measurement; no control leg by design)

Identical to mustercall-b, every seed (see Instrument).
Policy-side only, no game change. Neutrality note: the
HP ledger wraps with pure reads only (snapshots allocate,
no RNG, no state writes); the trajectory-identity check
against mustercall-b's corpus (same keys as mustercall-b
used vs herald-b) is reported, and any divergence is
flagged with its divergence day, not silently dropped.

## Wall numbers reported every run

national / table / wins, wave 4-5 unlocks, median
survival (game days), plus: Herald TB attempts by class
and reason, Herald field fights by outcome, wave-4 kills
by channel (TB vs field).

## Panel (§15)

Single-base DIAG measurement: no before/after comparison
exists in this arm, so scripts/balance-panel.js does not
apply. No panel compare is attached and none is
fabricated. Same declaration as mustercall-b.

## Sense-testing (SENSE-TESTING LAW)

Read the transcript slices on the window seed around the
unexplained chunks (the say ring is NOT captured by the
HP ledger, so reuse the herald instrument's refusal
slices + field-fight logs from this band's own capture).
Judge: does anything in the narration account for the
beast's wounds between refusals — a fight heard, a
scar, a report — or does the beast silently arrive more
wounded each time with no witness? Counts alone do not
pass this arm.

## Metric review

(To be filled at end of run. Doubts about the metric go
here and apply to the NEXT run, never to re-score this
one.)

## Convergence state

(One line at end of run: converging | converged | parked |
killed-at-pilot — for the scale-onramp axis measurement,
not a lever.)
