# TB retreat-and-refind — PRE-REGISTRATION (arm sim-tbretreat-refind-b)

Run: fleshout-loop-b-20261105T1830Z. Axis: scale-onramp / winnability
chain (wild ally-join → wave-4 kills → veterans → readiness-5 release
→ wave-5 facing → full seat). Tracker's next blank (#2 from the 1322Z
run, sim-grindfinish-b): the grind step's price — a TB fight ends
death-or-win, so every grind step costs a scholar's life. Committed
BEFORE any judged sim.

POLICY-SIDE ONLY. Zero src/js changes, zero default flips, no changes
to any existing policy file. This is the policy-side answer to the
sibling game-code arm's NO-GO: the restore works, the retreat almost
never happens — so this arm fixes the RETREAT, in policy, and measures
whether a fighter who leaves early lives to fight again.

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/MONSTER-WAVES.md` §§Wave 4/5 and
  "Combat readiness gates the standing unlock": wave-4 bands (anchored):
  damage 35–95, HP 850–1500, pierce 0.2–0.5. Wave 5 demands 2 LIVING
  villagers with wave-4+ kills. No canon invented here.
- Steve 2026-11-02 monster-commitment ruling (MONSTER-WAVES.md,
  fieldFights.js `mCanFlee`): monsters do NOT flee unless their kind
  carries an explicit flee component. This arm changes NO monster flee
  behavior: the monster never withdraws, never flees, never routs
  because of this lever. Only the FIGHTER withdraws — the player /
  scholar walking out through the barrier, exactly as the engine
  already allows (tbBarrierExit).
- Steve 2026-10-08 (MONSTER-WAVES.md / CANON.md): "Monster encounters
  are fought, not rolled" — blow-by-blow with real stats. This arm
  measures fought retreats and re-engagements, never an outcome table.
- `~/workspace/custom-skills/local_perception_first/SKILL.md`:
  the trigger reads only the scholar's own HP and the monsters in
  front of them in this fight; the exit direction reads mapSeen /
  monsterAt / tileAt — the same sense channels competent's own
  directional flee uses. No roster, no snapshot, no list is fed to
  any decision. Re-engagement is a measurement join (day + monster
  id), never a decision input.

## Prior evidence read (not re-run, not re-proved)

- `evidence/2026-11-05/sim-tbretreat-b-confirm.md` (band 99731–99742,
  150d, 12 seeds, NO-GO): the restore mechanism works (fidelity 2/2)
  but the retreat almost never happens — G1 retreat survival 5/49 =
  **10.2%** vs the 25% bar; **22 sealed fallbacks vs 5 exits**; the
  staypolicy 50/50 trigger "fires LATE and the barrier is sealed".
  The restore channel produced zero kills; the veterans bar never
  reached 2 living; no seed opened the wave-5 door. The revert is
  landed on branch sim-tbretreat-b (no src/js trace remains) — so in
  THIS arm's world a fled beast MELTS: there is no same-beast re-find
  to measure, only re-engagement with fresh beasts (see G2 note).
- `evidence/2026-11-05/sim-staypolicy-a.md` (band 99241–99248, 150d,
  8+8 seeds, NO-GO on kills): the policy-side disengage (flee-when-
  losing, frozen 50/50 trigger, nearest-x-edge verbs) works
  mechanically — trigger fired 17/23 armed TB fights, TB flees 0 → 6,
  TB deaths 21 → 16 — but kills did not move (armed 1/49 = 2.0% vs
  baseline 0/43). Exact accounting of the 17 firings: 6 exits, 5
  sealed-fallback deaths, 6 died mid-retreat.
- `evidence/2026-11-05/sim-grindfinish-b.md` (band 99309–99316, 150d,
  8 seeds, DIAG-NO): TB fights end death-or-win — 32 death, 2 won,
  **0 fled** band-wide. The grind's plumbing works (lift 88%, TB→TB
  continuation 13/14) but each grind step costs a scholar's life.
- `evidence/2026-11-04/sim-fleerepair-confirm-a.md` (12-seed confirm,
  GO): the flee-branch repair (directional flee, exit-verified, stuck
  fallbacks) is confirmed policy-side; its game-code port is a Steve
  call and is NOT claimed here. This arm reuses its guards
  (stuck/sealed fallbacks) inside its own disengage step; it does not
  touch the flee branch, competent.js, or any fleerepair file.

## The mechanism map (read from the code in this worktree, before any sim)

All line numbers are this worktree (branch sim-tbretreat-refind-b,
base 5ffbdaa1a):

1. **A wild TB fight is NEVER sealed at start** —
   `src/js/game.js:34336` builds `tbfight` with no `noFlee` field,
   and NO src/js code ever assigns `f.noFlee` on a wild fight (the
   only writers are the contest `fieldFight(..., {noFlee: true})`
   arena seal, `contestEngine.js:383`, and save/load copies,
   `game.js:9127,9652`). `arenaContest` is contest-only. The sibling
   confirm's "the barrier is sealed" is therefore a MISLABELLED
   BUCKET: staypolicy's `disengageStep`
   (`scripts/policies/flee-when-losing.js`) counts ANY barrier push
   that does not end the fight as a `sealedFallback` — including the
   two cases below. The 22 "sealed" fallbacks are not 22 sealed
   barriers. This arm classifies every push at push time (see
   instrument), so the pilot can say how many were truly sealed.
2. **A barrier push usually does NOT end the fight — the chase
   continues on the new node** — `game.js:36440-36474`: when chasers
   persist, the push crosses, the scholar re-enters from the opposite
   edge, the monsters re-enter on the far side, and the fight is
   STILL LIVE. `chasePersistence` (`game.js:36293`) is 2 by default
   (belltoad 1, bulldozer 2, lockpick_raccoon 3; the relentless
   hushwolf never gives up). A single push ends the fight outright
   ONLY when there are no chasers (4 of 9 wave-4 kinds carry
   `follows: false` — strike, audit, suburb, eulogy — verified from
   `src/data/monsters.json`), the destination is Haven, or the
   chaser's persistence is 1. Staypolicy marks the fight unfleeable
   after ONE push that does not end it — it abandons exactly the
   fights that need a second push. This is the mechanism this arm
   fixes: PERSISTENT chase fleeing.
3. **Re-entry geometry favors the runner** — after a crossing the
   scholar enters at grid centre + 3 in the push direction (near the
   next edge in the same direction) while chasers enter at centre −
   3 (far side) (`game.js:36457-36470`). The second push costs ~1
   walk step + push. Continuing STRAIGHT is cheap; turning
   havenward mid-chase costs a full-grid walk while the monsters
   close in. So the direction is frozen at trigger time and the
   chase is run out in that direction.
4. **Direction matters at the world edge** — staypolicy pushes along
   x only (nearest edge). When the scholar's node sits at the world
   edge (map.px 0/8), the push is refused ("The known world ends
   here", `game.js:36330-36333`) and consumed. Competent's own
   `chooseFleeDir` (exported, `scripts/policies/competent.js:2813`)
   scores haven +10, havenward +4, lateral +1, away −2, known +2,
   monster-active −6, and HOLDS at the haven node — the direction
   this arm uses. A haven destination ends even a relentless chase
   (`game.js:36429-36437`).
5. **The restore is gone, so the refind half is re-engagement** —
   the sibling NO-GO reverted TBRETREAT_RESTORE: a fled ordinary
   wild beast melts (grindfinish rule 5, unchanged). A retreated
   fighter cannot re-find the SAME beast. What the retreat buys is
   the fighter's LIFE — measured as re-engagement: the same scholar
   faces a wave-4+ beast again within 7 days. The grind continues
   through fresh beasts, not wounded ones.
6. **Baseline already flees at entry and at 35%** — competent's
   NEW-FIGHT ASSESSMENT flees outmatched fights on turn 1 and the
   legacy 35%-HP line flees mid-fight. This wrapper fires FIRST in
   wave-4+ fights, between those two lines.

## Lever picked — TBRETREAT_REFIND (policy variant, default N/A)

**New file** `scripts/policies/tbretreat-refind.js` (a competent
wrapper in the flee-when-losing shape; no existing file touched, no
env gate — the variant IS the module). Fight hook ONLY; every other
hook is base competent, unchanged; every non-wave-4+ fight delegates
to base.fight untouched. No pending-encounter handling of any kind:
startCombat is the single pending-clearer and this policy never
touches it (FORBIDDEN: clearing a pending encounter from policy
code is harness manipulation, not a game action).

**F1 — EARLIER trigger (frozen): scholar HP frac < 0.75 AND live
wave-4+ monsters' remaining HP frac > 0.75** (summed over live
wave-4+ fighters; wave read from mdef.wave, else the data roster —
same convention as flee-when-losing). Fires mid-fight, not at fight
start; a monster already below 3/4 is never abandoned, however hurt
the scholar is. Rationale: at 50% the scholar has ~1–2 hits left
against wave-4 damage (35–95); the chase costs a walk plus up to
two more crossings, and the sibling's own accounting shows 6/17
staypolicy firings died mid-retreat. "I'm hurt and I haven't hurt
it — leave now while I can still walk" is the fighter's own read of
the two HP bars in front of them.
**F2 — HAVENWARD direction (frozen per fight):** at trigger time,
`chooseFleeDir(Game, map.px, map.py)` (competent's exported scorer)
picks the exit once; the disengage walks to that edge and pushes
that way. At the haven node it returns null → HOLD: the trigger
does not fire (the village is right there; counted separately).
**F3 — PERSISTENT chase:** after a push, if the fight continues
AND the map node changed (crossed, chase continues), the disengage
KEEPS GOING in the same frozen direction — never marked unfleeable
on a crossing. Crossings are counted; a safety cap of 6 crossings
then falls through to base (relentless/odd geometry valve — no
wave-4 kind is relentless, verified from the roster).
**F4 — CONSUMED pushes still mark unfleeable:** a push that ends
with the fight live AND the map node unchanged was consumed
without moving — sealed arena, world edge, or blocked far side —
and marks the fight unfleeable; later turns delegate to base (the
fleerepair lesson). The push outcome is classified at push time:
`sealed` (arenaContest or f.noFlee — the scholar reads the sealed
barrier), `world-edge` (target node outside 0..8), `blocked`
(otherwise — blocked far side / stasis folded together, stated),
`crossed-chase`, `exited-haven` (new node is Haven), `exited-gaveup`.
**F5 — STUCK guard:** a flee step that moves the scholar nowhere
for 3 consecutive turns falls through to a strike when a monster is
in range, else marks unfleeable (same shape as staypolicy /
fleerepair). **F6 — SEALED guard:** the trigger does not fire when
`Game.state.arenaContest` or `f.noFlee` is set at trigger time (the
scholar reads the sealed barrier and stays; counted separately) —
table trials and contest arenas are commitments, not walk-outs.

**Shapes considered and NOT taken (stated so the pilot is not
misread):** entering with a different party/gear state (map-level
fight decline) is the already-measured w4abstain / fight-assess
axis, not this arm; field fights are engine-driven and untouched
(the untouched control channel, as in staypolicy); directional
re-picking after every crossing was rejected by the re-entry
geometry (rule 3) — straight is cheap, turning is a full-grid
walk under fire.

## Pre-registered gates (judged on the pilot band; a miss is NO-GO)

Band: **96811–96818** (8 seeds, 150d death-aware horizon — same as
staypolicy / tbretreat / grindfinish, so the numbers are
comparable). Legs: baseline = competent VERBATIM; armed =
tbretreat-refind. Identical seeds both legs. Balanced panel
(`scripts/balance-panel.js`) per §15 if there is a before/after
pair to judge; the analyzer's two-leg compare on identical seeds
is the before/after instrument (see §15 note below).

- **G1 (primary) retreat survival:** exits / trigger-fired wave-4+
  TB fights ≥ 25% (armed). Same bar as the sibling confirm (their
  result: 10.2%). Exits are policy-observed (the push ended the
  fight); fires are policy-counted. The wave-4-only slice is also
  reported for direct comparability with the sibling's 10.2%.
- **G2 (primary) TB-fight survival:** (wave-4+ TB fights NOT ending
  in scholar death) / all wave-4+ TB fights; armed > baseline.
  Baseline is ~2–3% (grindfinish: 2 won / 34). This is the
  survival-per-fight half of the blank: the disengage must save
  lives per fight entered, not just exit sometimes.
- **G3 (guard) kill rate not halved:** armed wave-4+ kill rate
  (strict same-day matched kills / wave-4+ fights, same discipline
  as the staypolicy analyzer) ≥ ½ baseline.
- **G4 (guard) survival not harmed:** armed median survival ≥ 0.8×
  baseline.
- **Denominator guard (lesson from the sibling pilot):** the pilot's
  45.5% G1 on 11 firings was a small-denominator fluke; the
  confirm's 10.2% on 49 firings was the verdict. If trigger fires
  < 15 across the pilot band, the pilot is THIN — no GO verdict is
  taken; the pilot is extended with 8 more FRESH seeds
  (**96821–96828**, pre-registered here as the extension band;
  freshness to be re-verified at extension time) before judging.
- **GO requires G1 ∧ G2 ∧ G3 ∧ G4.** Confirm (12–16 fresh seeds)
  ONLY on pilot GO. A miss on any gate is NO-GO, never re-scored
  against a friendlier metric.

## Freshness — band 96811–96818 (verified before this prereg)

Whole-token grep of each candidate seed across ALL dated preregs
(`evidence/*/sim-*-prereg.md`): zero hits, per seed (0/8 each).
Whole-token grep across all dated evidence `.md` files: zero hits,
per seed. No perseed filename in `evidence/` or the goal
`hidden_files/` names any 96811–96818 seed. The band avoids every
named band (991xx/992xx/993xx/996xx/997xx/736xx/998xx/995xx/994xx/
981xx/975xx/972xx/961xx). False-positive notes, checked and
dismissed: "96814" appears 3× in dated evidence .md files only as
the tail of the git hash `723b96814` (not a seed token — the
whole-token grep is 0); two 64-hex content-hash case filenames in
hidden_files merely contain the digit substrings "96803"/"96818"
(sim-homecoming-diag-b and storageshed panel cases — hashes, not
seeds). Extension band 96821–96828: 0/0/0 on all three checks, per
seed (verified at prereg time; re-verify at extension time).

## Base / branch note

Branch: sim-tbretreat-refind-b. Base: master 5ffbdaa1a as present in
this worktree (journey-scale r100). `git fetch origin master` FAILED
at prereg time (connection reset by peer); origin/master's
last-known ref is 1a898136c (batch-ship version bump
05d82de89-20261105-172446), and local HEAD is not an ancestor of it
— the worktree's local master has diverged from origin/master.
The coordinator owns landing and must rebase/verify against a
fresh origin/master at merge time; no rebase is attempted here.

## §15 note (balanced panel) + telemetry

`balance-panel.js --help` requires `--out <panel-directory>` and
installs its own observer into fresh live sims under registered
policies — it takes no corpus input and offers no two-corpus
comparison, and `tbretreat-refind` is not in its registry (same
finding as the sibling confirm). Running it would re-run different
policies on different seeds and answer nothing about this arm's
before/after. The attempt is recorded in the evidence; no compare
`.md` is fabricated. The analyzer's two-leg compare on identical
seeds is the before/after instrument. Telemetry deviation check
(`telemetry-check.js` vs the scale-wall baseline) is attempted the
same way; if it refuses the recorder corpus, that refusal is
reported, not worked around.

## Metric review (to fill in the evidence file)

- Whether G1's 25% bar is the right bar for a policy that also has
  to survive the chase (the sibling's bar was set for a restore
  lever, not a retreat lever).
- Whether the push-outcome classification (sealed vs world-edge vs
  blocked vs crossed-chase) matches the say-line record — the
  sibling's "sealed" bucket is the number this arm exists to
  correct, so any mismatch between the state classification and the
  narration is itself a finding.
- Whether the 75/75 trigger abandons winnable fights (G3 is the
  guard; the per-fight HP-at-trigger vs damage-dealt split is the
  diagnostic).
- Whether re-engagement within 7d (same scholar, fresh beast) is
  the right refind measure now the restore is gone, or whether the
  refind half of the blank is closed by G2 alone.
