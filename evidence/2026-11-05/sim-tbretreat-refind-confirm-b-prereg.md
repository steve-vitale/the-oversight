# TB retreat-and-refind — CONFIRM PRE-REGISTRATION (arm sim-tbretreat-refind-confirm-b)

Run: fleshout-loop-b-20261105T2130Z. Axis: scale-onramp / winnability
chain (wild ally-join → wave-4 kills → veterans → readiness-5 release
→ wave-5 facing → full seat). Committed BEFORE any judged sim.

POLICY-SIDE ONLY. Zero src/js changes, zero default flips, no existing
policy file touched. Reuses `scripts/policies/tbretreat-refind.js` +
its driver (`scripts/tbretreat-refind-driver-20261105.js`) and analyzer
(`scripts/tbretreat-refind-analyze-20261105.js`) from master, landed as
4a065f050 (pilot GO). The pilot proof
(`scripts/test-tbretreat-refind-20261105.js`) re-run green 42/42 in
this worktree before this prereg was written.

## Canon read before this prereg

- `docs/CANON.md` (manifest) + `docs/MONSTER-WAVES.md` §§Wave 4/5 and
  "Combat readiness gates the standing unlock": wave-4 bands (anchored):
  damage 35–95, HP 850–1500, pierce 0.2–0.5. Wave 5 demands 2 LIVING
  villagers with wave-4+ kills. No canon invented here.
- Steve 2026-11-02 monster-commitment ruling (MONSTER-WAVES.md,
  fieldFights.js `mCanFlee`): monsters do NOT flee unless their kind
  carries an explicit flee component. This arm changes NO monster flee
  behavior: only the FIGHTER withdraws — the player / scholar walking
  out through the barrier, exactly as the engine already allows
  (tbBarrierExit).
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

- `evidence/2026-11-05/sim-tbretreat-refind-b.md` (band 96811–96828,
  150d, 16 seeds, pilot GO): G1 6/15 = **40.0%** (exits / trigger
  fires), G2 TB-fight survival **18.2% vs 15.0%**, G3 kill rate
  **5.4% vs 9.0%, ratio 0.60×**, G4 median survival **86.5d vs
  86.5d, 1.0×**. Zero sealed fallbacks in 15 fires; 5 haven-holds
  (fighter already on the haven node — counted in the denominator
  per this prereg's rule); 4 died mid-retreat on the walk. 2 of 6
  exits re-engaged within 7 days (1 same-kind). Denominator guard
  cleared exactly at 15 fires — the pilot GO earns this confirm; it
  is not a confirm. The 8-seed interim read 62.5% G1 (5/8) and the
  full 16-seed pilot 40.0% (6/15): the extension band added 7 fires
  and only 1 exit — small-denominator movement in the other
  direction, and the reason this confirm re-tests the 40% on fresh
  seeds before anyone cites it as the lever's rate.
- `evidence/2026-11-05/sim-tbretreat-b-confirm.md` (band 99731–99742,
  150d, 12 seeds, NO-GO): the sibling game-code arm — restore works,
  retreat almost never happens (G1 10.2%, 5/49, 22 sealed
  fallbacks). The policy arm's G1 is the verdict the sibling arm was
  missing; the confirm judges whether it holds at scale.
- `evidence/2026-11-05/sim-staypolicy-a.md` (band 99241–99248, 150d,
  8+8 seeds, NO-GO on kills): policy-side disengage, 6 exits / 17
  firings, kills did not move.

## Lever — TBRETREAT_REFIND (unchanged from the pilot)

Frozen shape (see the pilot prereg for the full mechanism map):
**F1** trigger scholar HP frac < 0.75 AND live wave-4+ monsters'
remaining HP frac > 0.75. **F2** havenward direction frozen at
trigger time via competent's `chooseFleeDir`; haven node → HOLD
(counted separately). **F3** persistent chase — a crossing never
marks the fight unfleeable (cap 6 crossings). **F4** consumed pushes
mark unfleeable, classified at push time (sealed / world-edge /
blocked / crossed-chase / exited-haven / exited-gaveup). **F5**
stuck guard (3 turns nowhere → strike or unfleeable). **F6** sealed
guard (arena / noFlee suppresses the trigger). No code changes of
any kind in this arm — the confirm re-runs the pilot's frozen
variant on fresh seeds.

## Pre-registered gates (same as the pilot, judged strictly)

Band: **93011–93026** (16 seeds, 150d death-aware horizon). Legs:
baseline = competent VERBATIM; armed = tbretreat-refind. Identical
seeds both legs. The analyzer's two-leg compare on identical seeds
is the before/after instrument (see §15 note below).

- **G1 (primary) retreat survival:** exits / trigger-fired wave-4+
  TB fights ≥ 25% (armed). Judged on the prereg's denominator: ALL
  trigger fires, haven-holds INCLUDED (they are trigger-fired
  fights, as in the pilot). The attempts-only slice (excluding
  haven-holds) is reported DIAGNOSTICALLY ONLY — it never judges
  G1, and a GO on the attempts-only slice alone is not a GO.
- **G2 (primary) TB-fight survival:** (wave-4+ TB fights NOT ending
  in scholar death) / all wave-4+ TB fights; armed > baseline.
- **G3 (guard) kill rate not halved:** armed wave-4+ kill rate
  (strict same-day matched kills / wave-4+ fights) ≥ ½ baseline.
- **G4 (guard) survival not harmed:** armed median survival ≥ 0.8×
  baseline.
- **Denominator guard:** if trigger fires < 15 across the confirm
  band, the confirm is THIN — no GO verdict is taken; the confirm
  is extended with 8 more FRESH seeds (**92011–92018**,
  pre-registered here as the extension band; freshness verified at
  prereg time, see below) before judging.
- **GO requires G1 ∧ G2 ∧ G3 ∧ G4 ∧ fires ≥ 15.** A miss on any
  gate is NO-GO, never re-scored against a friendlier metric. A
  THIN denominator is THIN, never GO.

## Freshness — band 93011–93026 (verified before this prereg)

Whole-token grep of each candidate seed across ALL dated preregs
(`evidence/*/sim-*-prereg.md`): zero hits, per seed (0/16 each).
Whole-token grep across all dated evidence `.md` files: zero hits,
per seed (0/16 each). No perseed filename in `evidence/` or the
goal `hidden_files/` names any 93011–93026 seed. The band avoids
every named band (991xx/992xx/993xx/995xx/996xx/997xx/998xx/968xx/
898xx/736xx/981xx/975xx/972xx/961xx).

Collision found and avoided during this check: the first candidate
band **94011–94026** collided — it was the sim-pdvalue-b confirm
band (evidence/2026-10-24/sim-pdvalue-b.md: "CONFIRM 94011–94026
(16 fresh...)", plus sim-belongcost-b.md naming the same band).
940xx had 0 prereg hits but was named in dated evidence files; the
full-scope check caught it. 94011–94026 is NOT used here.

Extension band 92011–92018: 0/0/0 on all three checks, per seed
(verified at prereg time; re-verify at extension time if used).

## Base / branch note

Branch: sim-tbretreat-refind-confirm-b. Base: worktree HEAD
2d72f104a, which contains the pilot landing 4a065f050. `git fetch
origin master` succeeded at prereg time; origin/master is
1a898136c (batch-ship version bump 05d82de89-20261105-172446) and
is an ancestor of local HEAD — the worktree is strictly ahead of
origin/master (unshipped journey + pilot work). The coordinator
owns landing and must rebase/verify against a fresh origin/master
at merge time; no rebase is attempted here.

## §15 note (balanced panel) + telemetry

`balance-panel.js --help` requires `--out <panel-directory>` and
installs its own observer into fresh live sims under registered
policies — it takes no corpus input and offers no two-corpus
comparison, and `tbretreat-refind` is not in its registry (same
finding as the pilot prereg and the sibling confirm). Running it
would re-run different policies on different seeds and answer
nothing about this arm's before/after. The attempt is recorded in
the evidence; no compare `.md` is fabricated. The analyzer's
two-leg compare on identical seeds is the before/after instrument.
Telemetry deviation check (`telemetry-check.js` vs the scale-wall
baseline) is attempted the same way; if it refuses the recorder
corpus, that refusal is reported, not worked around.

## Metric review (to fill in the evidence file)

From the pilot evidence, carried forward — the confirm must answer
these on the fresh band:

- Whether G1's 25% bar fits a retreat lever (it was set for a
  restore lever): the pilot cleared it at 40% on the prereg
  denominator and 60% (6/10) on genuine retreat attempts. Does the
  bar still fit at confirm scale, and does the haven-hold share
  reproduce?
- Whether the push-outcome classification matches the say-line
  record (the pilot: 4 surviving barrier lines, all consistent, 0
  sealed lines; classification is push-time observation, not say
  lines).
- Whether the 75/75 trigger abandons winnable fights (G3 is the
  guard — the pilot's kill-rate ratio was 0.60×, a 0.10 margin; the
  confirm is where that margin is tested).
- Whether re-engagement within 7d is the right refind measure now
  the restore is gone, or whether G2 alone closes the refind half
  (pilot: 2/6 re-engaged, 1 same-kind — report as description, not
  a gate).
