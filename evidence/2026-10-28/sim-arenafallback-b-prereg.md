# sim-arenafallback-b — PREREGISTRATION (committed BEFORE any judged sweep)

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261028T1930Z,
arm sim-arenafallback-b. Follow-up to sim-arenalabel-b (tbEnd death
labels) + sim-grantdeath-b. LABEL-ONLY game change if it lands: no
damage, HP, kcal, death rule, lifeline, or contest-routing change.
tbFightDeathCause in src/js/game.js is the only game-code site in
scope; every other change is scripts/evidence.

## The two blanks (from sim-arenalabel-b)

- (A) The arena branch is proof-leg-only (arenalabel leg L8): no
  contest-arena loss occurs in the grantdeath substrate, so the
  'the arena' label on a real contest loss was never band-proven.
- (B) Betrayal, table-trial, titan coalition-arena, and alien-hostile
  tbEnd losses still read 'the arena' by conservative fallback.

## The lever

Extend Game.tbFightDeathCause(f) (label-only) so each fallback origin
names itself honestly, in the game's own terse cause style
("X is dead — <cause>", ledger.js:732; existing causes include
'the arena', 'the wild', 'starvation', 'the expedition',
'your own pit trap'). Order: arenaContest first, then the named
origins, then proven-wild, then alien-hostile, then the arena
fallback. Proposed labels (declared here, judged here):

| origin | after label | why this wording |
| --- | --- | --- |
| contest arena (state.arenaContest) | 'the arena' (unchanged) | already correct |
| betrayal fight (f.betrayal) | 'betrayal' | terse like 'starvation'; the fight IS the betrayal |
| table trial (f.tableTrial) | 'the table trial' | the galactic table's trial-by-combat, not an arena show |
| coalition arena (f.coalitionArena) | 'the coalition arena' | distinct from 'the arena'; the titan coalition's field |
| alien-hostile (kind:'hostile' fighter with alienPid, no flags above) | 'a stranger' | KNOWLEDGE GATE: pre-reveal the fighter is named 'Stranger' (alienPlayers.js apBuildFighter); 'an alien' would leak a truth the player has not learned. 'a stranger' names what the player actually faced. Betrayal-hostile fights are caught by the betrayal branch first, so this branch is alien-only in practice. |
| proven wild (monster, no hostile, no flags) | 'the wild' (unchanged) | arenalabel, control |
| everything else | 'the arena' (unchanged fallback) | conservative; no new lie |

No code anywhere branches on cause === 'the arena' (arenalabel
check, re-verified for the new strings: no code branches on
'betrayal', 'the table trial', 'the coalition arena', or
'a stranger' as a death cause). _contestArenaAfter's own
'\_contestDeathLine(contest, 'the arena', 'You')' line is a
second line on arena losses only and stays consistent.

## Substrates (all real entry points, forced loss as in arenalabel L7/L8)

Each instance is one fresh harness game (loadGame + setupGame per
instance, sequential in one sweep process as in grantdeath).
The loss is forced the arenalabel way: scholar abilities cleared,
phoenixLink nulled, player fighter HP set to 0, tbEndCheck, then
tbEnd('lost') if not already over. The fight itself is real —
the forcing only decides the outcome, as in arenalabel.

| instance origin | entry point (real code) | disclosure |
| --- | --- | --- |
| arena-pit | Game._contestArena({contestId:'pit'}, {waves:1}) | sets state.arenaContest + startCombat, as the pit phase engine does |
| arena-gauntlet | Game._contestArena({contestId:'gauntlet'}, {waves:3}) | loss on wave 1; waves list proves the gauntlet route, not just the pit |
| betrayal | Game.startBetrayalCombat(first roster villager != bearer) | real betrayal fight builder (party.js) |
| tableTrial | Game.startCombat('finale', {tableTrial:true}) | real table-trial route (game.js startCombat) |
| coalition | seeded muster (10 allied blades, herald, minAllies 10) + Game.startCombat('herald') | SEEDING DISCLOSURE: a fresh day-1 game has no coalition, so the muster state is seeded (10 fake-village blades; titanUniqueAllies counts them when no other-village record exists). The coalitionArena FLAG itself is set by real code: wrapped startCombat -> titanInjectAllies -> titanPrepareArena (verified in probe: coalitionArena true, 10 ally fighters). Seeding a prerequisite state is not fabricating the flag. If this seeding is judged dishonest, coalition falls to DIAG-NO-GO and its label line is dropped. |
| alien | Game.apStartEncounter('pip_quindle') | real alien-player encounter entry (alienPlayers.js) |
| wild (control) | Game.startCombat('bulldozer') | arenalabel wild route; must stay 'the wild' |

Probe results (unjudged exploration, seed 777, pre-change code):
all 7 starters succeed; every before-loss label reads 'the arena'
except wild ('the wild'); every forced loss records 'the arena'
(or 'the wild') in playerDeath, fallen, telemetry, and death line.
Coalition probe: musterReady true, coalitionArena true.

## Seeds (freshness verified before judging)

Pilot: 12100–12107 (8 seeds). Confirm: 12108–12123 (16 FRESH
seeds, disjoint from pilot). Verified against dated evidence
.md files and corpus filenames: recent B bands 10040–10065,
104xx, 10510–10517 are heavily used; no judged band uses
12100–12123 (26121 journey files are a different seed).
Instances per leg: pilot 8 seeds x 7 origins = 56; confirm
16 seeds x 7 origins = 112.

## Horizon + policies

Horizon: DEATH-AWARE, never a fixed 200d. Each instance ends
at its single forced fight (day 1); the label is fixed at
tbEnd time, so no multi-day sim can change it — the same
class of measurement as arenalabel's proof legs, now banded.
Policies: NONE — direct harness fights, not bot policies;
there is no policy question here (the label is a function of
fight state at tbEnd, not of play). Death-aware horizon +
no-policy is declared, not hidden.

## Primary metrics + GO thresholds (judged ONLY against this file)

Fields checked per instance (all must agree): playerDeath arg,
registerDeath cause, fallen cause, telemetry cause, lineage
cause, narration death line.

- A-PILOT (Leg A pilot): >= 14/16 arena instances (pit +
  gauntlet x 8 seeds) labeled 'the arena' in ALL fields.
- A-CONFIRM (Leg A confirm): >= 28/32 arena instances on the
  16 fresh confirm seeds, same field agreement.
- B-PILOT (Leg B pilot, per origin): >= 7/8 instances of that
  origin distinctly labeled with its new label in ALL fields.
- B-CONFIRM (Leg B confirm, per origin): >= 14/16 fresh-seed
  instances of that origin distinctly labeled, all fields.
- DETERMINISM (binding, both legs, both phases): 0 unintended
  label changes before -> after (wild stays 'the wild',
  arena stays 'the arena', each fallback origin changes ONLY
  'the arena' -> its new label); 0 non-label field differences
  (fight flags, fighter kinds, monster ids, bearer, fallen /
  telemetry except cause, death line except cause token).
- PROOF: scripts/test-arenafallback-b.js green BEFORE the
  judged after-band.
- BEFORE-LEG SANITY: in the before leg, all 4 fallback
  origins read 'the arena' in all fields, wild reads
  'the wild', arena reads 'the arena' — if the before leg
  disagrees, the band is invalid, not a pass.

Landing rule (per origin, kill discipline): an origin lands
ONLY if it meets its pilot + confirm + determinism clauses.
A failing origin's label line is removed before the landing
commit — a failed leg leaves no game-code trace. Leg A
landing requires A-PILOT + A-CONFIRM + determinism (its
label is unchanged code, so "landing" for Leg A means the
band proof is recorded; no game-code commit is needed for
Leg A alone). If every Leg B origin fails, the verdict is
DIAG/NO-GO with evidence only and nothing to merge for
Leg B.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

No balance-panel compare .md is produced, as in arenalabel:
a label-only change has no game leg a panel can judge,
panel metrics (national / table / wins, wave reach) cannot
move under it, and the determinism clauses above are the
binding guard that they did not. If determinism fails, a
panel compare would be run before any landing claim.

## Metric review

To be written in the evidence file after judging (MEASUREMENT.md
§14). A miss is NO-GO, never re-scored mid-run. Known
pre-declared judgment calls: (1) coalition muster seeding is
disclosed above and is itself a judgment item — if the
coordinator judges it dishonest, coalition is DIAG-NO-GO
regardless of counts; (2) 'a stranger' for the alien origin
is a knowledge-gating compromise declared here — if it
reads as a lie in the sense test, that origin is NO-GO
even on green counts.

## Sense test (in the evidence file)

One death beat per labeled origin, read as a player would
read it: the before line vs the after line on the same
instance, judged for meaning/coherence (SENSE-TESTING LAW),
never just counts.
