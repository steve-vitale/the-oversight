# Villager goals system — proof and design (2026-11-03)

Branch `goals-sys`, base `ba2039f1b`. New module `src/js/villager-goals.js`
plus a 3-point hook in `src/js/villager-objectives.js` (objPick lottery bias,
goal fields carried onto the objective, goal reason appended to the departure
line), load lines in `index.html`/`sw.js`, regenerated `docs/ONTOLOGY.md`.
Proof script `scripts/test-villager-goals-20261103.js` (one harness per
process; sections `weights`, `gates`, `choices on|off`).

## Why this exists

Steve's 2026-11-03 orders: villagers must pursue winning strategies
themselves (party up, gear up, bank veterans, build standing) instead of only
reacting per situation, and every world system needs a villager-side reason
to touch it. Before this change, `npcGoal` was only a label: it nudged a few
lottery weights and range/danger numbers, but no villager carried a persistent
pursuit with progress, priority, or memory. This system adds that layer
without changing what winning costs (gating freeze: no win price, deed gate,
readiness bar, or table rule touched) and without new verbs, new brains, or
any planner above `objPick`.

## Design

**Eight goal types.** Winning-play drives: `party_up`, `gear_up`,
`bank_veterans`, `build_standing`. Life drives: `food_security`, `bonds`,
`knowledge`, `safety`. Each goal maps only onto EXISTING objective kinds:

| goal | feeds kinds |
|---|---|
| party_up | VISIT |
| gear_up | FORAGE, TRAPS |
| bank_veterans | HUNT |
| build_standing | VISIT |
| food_security | FORAGE, WATER, HAUL |
| bonds | VISIT, HAVEN_CHORE |
| knowledge | SEEK |
| safety | HAVEN_CHORE |

**Weight = character × state × perception, additive only.** A goal's weight
is a base from the villager's `npcGoal` label (primary 2.0, secondary 1.0,
background 0.25, unknown label 0.5), times a temperament multiplier where
meaningful (bold: veterans 1.4, safety 0.6; cautious: safety 1.5, veterans
0.6; warm: bonds/party 1.4; withdrawn: party 0.5; restless: standing/party
1.3; anxious: safety 1.4; intense: veterans 1.3; gentle: safety/bonds 1.2;
prickly: bonds/party 0.7; stoic: safety 1.2, party 0.8; others 1.0), plus
+0.5 for the villager's occupation top track lean (combat→veterans/gear,
field→food/gear, social→bonds/party/standing, craft→gear, strange→knowledge)
and +0.5 for primary intelligence (observant→knowledge, social→bonds/party,
analytical→knowledge, practical→food), times state factors (hunger>55:
food ×1.5; fear>55: safety ×1.5; social>65: bonds/party ×1.3; energy<35:
all ×0.25), times the perception gate (0..1, below). The result is ADDED
to the existing candidate weights in the `objPick` lottery — no candidate
is suppressed, no order is forced, no new RNG draw is made, so a game with
the bias disabled is bit-identical in draw sequence to a game before goals.

Character taxonomy is the code's real one: there is NO single "character
type" field. The three axes used are `npcGoal` (18 labels in
`characterGen.json`), temperament (16 values, `personality.temperament`),
and occupation (78 ids, via `occupationLean` top track) plus primary
intelligence. Range profile (`homebody/forager/wanderer/explorer`) is
deliberately NOT used: it is derived from temperament + goal + age, so
using it would double-count.

**Persistence.** `state.village.vgoals[vid] = {top, sinceDay}`. The stored
top goal gets +0.75 while it still scores, so a villager sticks with a
pursuit across days instead of flickering. Satisfaction zeroing applies
only to achievements (fully geared; veteran kill banked); party, bonds,
food, and safety are recurring needs and stay gated, not finished.

**Perception law (absolute).** Every gate reads only what that villager
personally perceived or learned; anything unseen scores zero:

| goal | gate (1 = open) |
|---|---|
| party_up | `villagerFightAllies(vid)` non-empty (sensed: same/adjacent node, trusted ≥15, crew) — else 0 |
| gear_up | 0 when the villager's own kit already has weapon AND armor; else 1 |
| bank_veterans | 0 if the villager already has a wave-4+ kill in `waveKillLog`; else 1 iff their agency `know.fought` is non-empty |
| build_standing | 1 iff their own knowledge-ledger lore (`villageLoreOf(vid)`) has ≥1 village |
| food_security | 1 if pantry <3 days or hunger >55; else 0.4 |
| bonds | 1 iff their own trust map has someone ≥40 |
| knowledge | 1 iff `villagerWantsKnowledge()` is non-null |
| safety | 1 if fear >55 or a heard gossip entry (heard-list filtered, attack/murder/raid ≤3 days); else 0.3 |

The HUNT kind itself is separately gated by `objHuntCandidate` (only the
villager who personally fought on that tile is offered HUNT back), so a
veterans weight with no HUNT candidate changes nothing. The system never
iterates the roster, never reads positions, wave/panel/standing numbers, or
the player's perception hints. Two older patterns were NOT copied:
`objVisitTarget` scores roster mates by trust without a position check
(predates the perception law), and `findCompanion`'s roster scan in
win-plan is a precedent, not a license — goals only boost the VISIT
weight; target selection stays with existing code. NODEWITNESS is env-flagged
off in live play and was not used.

**Narration, no new UI.** A boosted candidate carries `vgoal`/`vgoalLine`;
`objPick` copies them onto the objective as `goal`/`goalLine`; the
departure line appends the plain-words reason clause (e.g. party_up
"Company makes the road shorter.", bank_veterans "There's a kill out there
with their name on it.", safety "Better close to the fire today."). The
`purpose` field is never overwritten (it is the departure-line lookup key).

**Test seam.** `Game.vgoalDisabled = true` skips the bias entirely — the
no-goals baseline arm, and a safety valve.

**Weight table location.** The table lives in the module, not in `src/data/`,
because the boot loader enumerates data files explicitly; a new JSON would
not load without editing the `game.js` boot list, and the in-module table
keeps the integration to one hook.

## Proof (all on seed 98901, `mode:'herald'`)

**(a) Weights differ by character type — 3/3 legs pass.**
Identical villager, all gates opened identically, only one axis varied:

- Goal label (steady, same occupation): protect safety 0.6 vs prove 0.075;
  prove veterans 2.0 vs protect 1.0.
- Temperament (goal prove): cautious safety 0.112 vs bold 0.045; bold
  veterans 2.8 vs cautious 1.2.
- Occupation (goal prove, steady): combat-lean veterans 2.5 vs social-lean
  2.0; social-lean bonds 0.75 vs combat-lean 0.25.
(Safety values are gate-scaled by the 0.3 baseline; the direction is the
character effect.)

**(b) Goals change choices vs the no-goals baseline — pass.**
200 `objPick` calls per arm, identical seed, same fixture (belong + warm +
social occupation, all gates open, fed/rested, no hard gate; 0 hard-gated
calls in either arm):

| kind | goals ON | goals OFF |
|---|---|---|
| VISIT | 81 (40.5%) | 39 (19.5%) |
| HAVEN_CHORE | 51 (25.5%) | 32 (16.0%) |
| WATER | 51 (25.5%) | 115 (57.5%) |
| TRAPS | 17 (8.5%) | 14 (7.0%) |

VISIT share +21 points (bar: ≥10). Total distribution shift 64 points
(bar: ≥20). A belong+warm villager visibly goes visiting and does haven
chores instead of defaulting to water runs. No FORAGE candidate appeared in
either arm for this fixture (no forage memory/need trigger), so the gear/food
effect on FORAGE is not shown here — see limits.

**(c) Perception gating — 8/8 legs pass.**
Each gate reads 0 with the perception absent and >0 after adding ONLY that
perception: party (0→1 on a sensed trusted ally), gear (1→0 on a full kit),
veterans (0→1 on a fought entry, back to 0 on an own wave-4 kill), standing
(0→1 on a lore entry), bonds (0→1 on trust ≥40), knowledge (0→1 on a
knowledge want), safety (0.3 baseline →1 on fear 80 and →1 on heard raid
gossip), food (hunger 80 →1; the low-hunger 0.4 leg was skipped honestly:
fresh-village pantry reads 1 day, below the 3-day threshold, so the
low-hunger case also reads 1 — the gate logic is correct, the fixture
cannot produce a rich pantry). Two fixture lessons are recorded in the test
comments: a fresh village starts everyone co-located at Haven, so "untouched"
is not a closed party state — closing it required moving EVERY other
villager away and dropping trust below the sensing floor.

**(d) Wiring — 0 unwired.**
`node scripts/check-wired.js src/js/villager-goals.js` (and `--strict`):
25 functions, 0 with no caller in `src/`. All five public methods are
called: `vgoalBiasCands` from the objPick hook; `vgoalWeights`,
`vgoalTop`, `vgoalGate`, `vgoalState` from within the module's own methods.

**check --quick:** first run 271 passed / 19 failed (1232s). Every failure
triaged individually; a second full run after the attach fix is reported
below. Attribution of the 19:

- 10 caused by this change's first version (fixed, all re-pass standalone):
  a load-time bare-`Game` reference in the new module hit the temporal dead
  zone in old head-80 loaders (`Cannot access 'Game' before initialization'
  at the old line 382). Fixed by capturing `Game` from
  `globalThis.Scattering` at load, the pattern `villager-objectives.js`
  uses; the module no-ops instead of throwing if Game is not published
  yet. Fixed scripts, all green on re-run: test-foodpower-20261014 (30/30),
  test-ability-evolution (26/26), test-contest-prize-evolution-20261011
  (35/35), test-evolution-needles (32/32), test-blitz-titan (56/56),
  test-blitz-titan-async (6/6), test-table-ascension-20261013 (17/17),
  test-table-trial-fire-20261012 (18/18),
  proof-godhood-discoverability-20261013 (ALL GREEN),
  test-util-synergy-gift-20261010 (6/6).
- 3 parallel-load flakes (pass standalone with the change in place):
  test-trust-observer-neutrality (6/6), test-capable-bot-20261014 (38/38),
  test-measurement-cache-flags (4/4) — all three hit the 120s parallel
  timeout or load pressure in the quick run, then passed alone.
- 3 pre-existing failures, byte-identical on pristine base (verified by
  stashing this change and re-running): test-mobile-combat-cadence (13
  passed, same 2 Continue/announcement FAILs), test-establishment-r20
  (same racks-full voice-count FAIL), test-occupation-panels (requires
  `./lib/luck-instrument`, which is not tracked at HEAD at all).
- 3 pre-existing proof staleness, also failing on pristine base:
  test-phone-frame-proof, test-measurement-proof-update,
  test-measurement-workflow. These enforce that retained proofs match
  current sources; they were already stale before this change. Refreshing
  them honestly requires a fresh real observer-neutral panel run
  (`balance-proof-update.js` takes a retained real panel as input) and
  fresh real phone receipts at 390x736/844 (browser play) — maintenance-run
  products, not something a code change may fabricate. HELD for the
  ship/maintenance loop, with reason, not waived.

**check --quick (confirmatory re-run after the attach fix):** 282 passed /
8 failed (1544s). The 8 are exactly the 6 pre-existing failures above
plus the 2 standalone-green parallel flakes (measurement-cache-flags,
trust-observer-neutrality — both pass alone with this change in place;
capable-bot, which flaked in run 1, passed in run 2). No failure in either
run is attributable to this change after the attach fix.

## What villagers observably do differently

A villager with people they trust nearby, villages they know, and fights
they have survived now leans toward visiting (party, bonds, standing) and
haven chores (bonds, safety) instead of defaulting to water and traps; a
cautious villager leans to safety, a bold one to veteran-hunting, a social
one to bonds. When a goal tips a choice, the departure line says why in
plain words. Nothing about winning costs changed: no gate, price, or bar
moved.

## Collision with win-drives / win-intel

None in flight: both lines already landed on master (no `win-drives` or
`win-intel` worktrees or branches exist). The shared files they touched
(`villager-objectives.js`, `villager-agency.js`, `win-plan.js`, `game.js`)
were treated as hot: this change edits ONLY `villager-objectives.js`, at
three small points that do not touch the rally-guard block or any win-plan
hook, and adds a new module file. `win-plan.js`, `villager-agency.js`, and
`game.js` are untouched.

## Limits and open questions

- **Party v1 is a VISIT boost only.** It does not force companion asks
  (`objAskCompanion` untouched); winPlan already handles party formation on
  expeditions. Whether daily VISIT pursuit alone produces more real parties
  is unmeasured — a follow-up sim should count party formation with goals
  on vs off.
- **FORAGE effect unshown.** The choices fixture produced no FORAGE
  candidate in either arm, so gear_up/food_security effects on FORAGE are
  proven at the weight level only, not at the choice level. A fixture with
  forage memory would show it.
- **Food low-hunger leg skipped** (fresh pantry <3 days; see above).
- **Deviation noted for review:** the worktree `AGENTS.md` says no empty
  `catch (e) {}` in new code. This module uses silent catches in its
  defensive perception accessors, matching the neighboring landed modules
  (`win-plan.js`, `villager-objectives.js` use the same pattern for
  optional-helper reads), because fail-closed-to-zero is the documented
  gate semantics and these accessors run per villager per dawn — logging
  on every missing optional helper would flood sims. The hook's catch is
  likewise silent by design: a missing module must leave the lottery
  exactly as before. Reviewer may overrule and ask for counted errors.
- **Open:** should the commitment bonus (+0.75) also apply to the stored
  top goal's weight when its gate has closed (currently it does not — a
  closed gate zeroes the goal, and the top updates)? Current behavior is
  deliberate: a satisfied or impossible pursuit should release, not linger.
- **Open:** occupation/intelligence bonuses use only the TOP track/intel.
  A villager with a split lean gets one bonus, not two. Fine for v1; a
  fuller character model could weight the top two.
