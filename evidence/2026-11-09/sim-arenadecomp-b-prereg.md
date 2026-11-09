# sim-arenadecomp-b — arena decomposition prereg (DIAG, zero src/js)

**Arm:** sim-arenadecomp-b (DIAG, zero src/js) · **Run:** fleshout-loop-b-20261109T1739Z
(Loop B) · **Axis:** scale-onramp / winnability chain (converging, NOT converged) ·
**Branch:** sim-arenadecomp-b, base master `0fcff01ea` · **Instrument:**
`scripts/sweep-arenadecomp-b.js` (feveranat wrapper pattern + hurtVillager
per-villager-per-day damage record + contest/arena snapshots at death +
lean daily snapshot + say-wrap + fallen read at end) +
`scripts/analyze-arenadecomp-b.js` (reuses the prefloor `classifyCause`) +
`scripts/test-arenadecomp-b.js` (G1/G2/G3 proof, sicknessdiag pattern).
Committed BEFORE any judged computation; no corrections after except by a
dated correction commit.

## The question

Decompose pre-90 arena deaths on current master, controlling the band/base
confound. The sickness band (58201–58208) and the prefloor band (55201–55212)
were different seeds on different bases, with the medic-duty widening
(wideduty, 48c93b22b) landing in between — so the 12.1% vs 3.2% arena gap
(sicknessdiag 12/99 pre-90 vs prefloor 5/154) is a secondary finding, not a
verdict. This arm is the verdict: same substrate (winseek), same horizon
(150d death-aware), fresh band, current master.

## Canon

Read first: `docs/CANON.md`, then `docs/CONTESTS.md` (contests, incl. arena
fights: Blood pit/gauntlet/siege, the 2/week budget, mandatory teleport,
"Sometimes you're offered a choice… Sometimes not"). **No doc covers the
arena as its own system** — there is no ARENA.md; CONTESTS.md is the arena's
canon, and the rest is grounded in code (see "Code paths" below), not invented.

## Code paths that push 'the arena' (verified before the prereg)

- `src/js/game.js` `tbFightDeathCause(f)`: returns `'the arena'` when
  `state.arenaContest` is live at `tbEnd` time (a contest-arena fight), AND
  falls back to `'the arena'` for ANY fight loss that is not a proven wild
  fight (monster fighter, no hostile), betrayal, table trial, coalition
  arena, or alien-hostile fight. **'the arena' is therefore two things: a
  real contest-arena label AND a fallback label for unclassified fight
  losses.** The instrument must separate them (arenaContest snapshot at
  death) — it must NOT assume every 'the arena' death is a contest death.
- `src/js/game.js` `tbEnd('lost')` arena branch: playerDeath via
  `tbFightDeathCause(f)`; the benevolent-lifeline check runs first (a
  lifeline save turns the death into a 'lost' with the player barely alive);
  a held phoenix link also holds the death for the fire to decide.
- `src/js/contests.js` `_contestArenaAfter(arc, 'lost')`: runs AFTER
  playerDeath — death line, held-count, codex 'died', co-taken fates via
  `_contestResolveOthers`.
- `src/js/contests.js` `_cxKillContestant(pid, contestId)`: the choke point
  for VILLAGER contest deaths (watch path, co-taken fates) — registers
  cause **`'contest'`**, never 'the arena'. Villager contest deaths therefore
  land in class `other` (named `contest`), NOT in the arena class.
- `src/js/contests.js` `_contestDie(ac, how)`: non-arena contest deaths —
  player via `playerDeath('contest')`, villager via `_cxKillContestant`.
- Mandatory/voluntary split: **PROVEN UNRECORDED** (0015Z finding, re-verified
  this run). `givesChoice` is a local const at `contests.js:2266`
  (`contest.givesChoice || Math.random() < 0.3`), never stored on the contest
  object, and no choice-taken flag exists on it (`ac._refused` is set only on
  refusal). This arm does NOT guess the split. It records only what the
  engine exposes: (a) whether the engine's own choice-offer line
  ("The System offers you a choice: participate or refuse.") was said for
  the contest that killed (observed via the say-wrap, per contest take);
  (b) the winseek policy always participates (choice 0) when offered
  (`scripts/policies/winseek.js` contestRoad + harness default). A death
  with no choice line observed is reported as "no choice line observed",
  never as "mandatory".

## Pre-registered design

- **Seeds:** exactly 43001–43008 (8 seeds, FRESH band — verified below).
  **Policy:** winseek (`scripts/policies/winseek.js`, UNMODIFIED), default
  env. **Horizon:** 150 days, death-aware (dead villages stop simulating,
  +10d tail max) — the same horizon as sicknessdiag/prefloor so shares are
  comparable.
- **Primary metric:** arena share of pre-90 deaths (class `arena` per the
  prefloor registry, exact emitted string `'the arena'`) + full
  classification of EVERY arena death (**0 unclassified**). For each arena
  death the join records: who (scholar vs villager, name), day, wave (of the
  fight: `arenaContest.waveIdx` + beast wave where the engine exposes it),
  veteran status at death (waveKillLog entries by the victim: wave-3+ kills
  and wave-4 kills to date — a living wave-3+/wave-4 killer is a veteran
  candidate), entry HP and HP trajectory that day (`hurtVillager` damage per
  villager per day — the sicknessdiag gap (c): three wound deaths crashed
  from healthy morning HP during the policy day with the damage
  unattributed), what contest/fight it was (contestId, category, name from
  the `activeContest`/`arenaContest` snapshot at death; arenaContest-live
  vs fallback-labeled), and whether the death followed a lost field fight
  or an arena summons (arenaContest-live at death = arena summons; no
  arenaContest live = fallback label on a non-contest fight loss — reported
  as such, never re-labeled as a contest death).
- **Cause-class registry (reused verbatim from prefloor, prereg § Cause-class
  registry):** wild = `the wild`, `monster`, `ambush`, `combat`, `a stranger`
  (+ monsterName rule: any entry with `monsterName`/`monsterId` set is wild);
  arena = exact `'the arena'` ONLY (bare `'arena'` is other — the known
  53007-a classifier gap: that classifier's VIOLENT map keys `'arena'` but
  the game emits `'the arena'`; this registry registers the exact emitted
  string, and the proof asserts bare `'arena'` → other); starvation =
  `starvation`; sickness-disease = `sickness`, `wound_fever`,
  `a wound that wouldn't close`; everything else → other-NAMED (incl.
  `contest`, `the night`, `betrayal`, `thirst`, `dehydration` — never
  silently bucketed).
- **DIAG-GO bar (pre-registered):** all arena deaths classified (0
  unclassified); arena share measured with the confound controlled (fresh
  band, current master, same substrate/horizon as the parents); AND either
  a named next lever OR a named reason no lever follows. Pilot 8 seeds
  before any confirm spend; confirm only on pilot DIAG-GO.
- **Optional second leg ONLY if time allows after the fresh-band pilot
  judges:** same-seed re-run of 58201–58208 on current master as the
  base-change control, explicitly labeled a re-run, not a fresh band.
- **Wall numbers every run:** national / table / wins, wave 4–5 unlocks,
  median survival, floor-reach.

## Pre-pilot substrate checklist (§14b)

1. **Contact:** PASS — the phenomenon occurs on this substrate: arena deaths
   12/99 (sicknessdiag, winseek, base 0ba20ac1c) and 5/154 (prefloor,
   winseek, base 5e79679e4). The question is decomposition, not existence.
2. **Pool sizing:** PASS — the bar is classification completeness (0
   unclassified) plus a measured share, not a rate threshold; the expected
   pool (5–12 arena deaths per 8 seeds on the parent bands) is ample for a
   complete join. No pool-size failure mode.
3. **Verb existence:** PASS — `registerDeath`, `fallen`, `hurtVillager`,
   `state.waveKillLog`, `state.arenaContest` / `state.activeContest` all
   exist and are read (never written) by the instrument.
4. **Horizon fit:** PASS — 150d, same as the parents; arena deaths are
   pre-90 by construction of the question.

## Seed-band freshness check (per local_seed_band_freshness, run by this worker)

- **Band:** 43001–43008. **Scope searched:** (A) every dated prereg
  `evidence/*/sim-*-prereg.md`; (B) every evidence `.md` with word-boundary
  matching; (C) filenames containing `4300` under `evidence/`; (D) the
  forbidden/contaminated lists found
  (`evidence/2026-11-06/drive-practice-contaminated-baseline/`,
  goal `hidden_files/r53/arm-contaminated-backup/`); (E) preregs in the goal
  `hidden_files/evidence/` mirror; (F) `scripts/` + `docs/`; (G) dated
  screens naming bands (2026-11-01, 2026-11-07 corpora).
- **Result: CLEAN — no real collision.** (A)(B)(E)(F): zero hits. (C): one
  filename hit, `evidence/2026-11-06/panel-hold-both/cases/59457de63b…json`
  — a 64-hex case hash containing `4300` as a substring, not a seed.
  (D): zero hits in either contaminated list. (G): hits are all
  false-positive value substrings, each inspected: `"pantryKcal":43005/43006`
  and `"pantry": 43005` (calorie values, not seeds) in patchrot /
  lingergorge / journey-scale-r69 files, and float substrings
  (`1521.3430080468534`, `119.43001459818333`) in feveranat corpora.
  Sanity: the same method finds the prior bands (58201 in
  `sim-sicknessdiag-b-prereg.md`, 55201 in `sim-prefloor-deaths-b-prereg.md`),
  so a real naming would have shown.
- **Coordinator note (adopted, re-verified):** the only json hits were the
  false-positive substrings above (floats like 3.84300248, pantryKcal
  values like 43006), not seeds.

## Proof plan (G1/G2/G3, sicknessdiag pattern)

- **G1:** classifier fixtures for all five classes incl. `'the arena'`
  exact → arena, bare `'arena'` → other, monsterName rule, unknown-cause →
  other-named; arena-join fixtures (arenaContest-live vs fallback label,
  scholar vs villager, veteran / non-veteran, choice line observed /
  not observed); broken-classifier sensitivity.
- **G2:** neutrality recorded == bare on at least 2 seeds + determinism
  (one seed twice → identical per-seed JSON); zero sit-verb calls, fallen
  present with day + cause, zero instrument errors.
- **G3:** corpus integrity on all 8 pilot corpora (fallen present, day
  series length rule, no missing days on arena deaths).
- **Smoke gate:** 1 seed in /tmp before the sweep.

## Metric review (to be filled in the evidence file)

Pre-registered metrics bind the run (§14). A miss is NO-GO, never re-scored
against a friendlier metric mid-run. If the metric proves wrong, it is
written up under "metric review" and a revision proposed for the NEXT run.
