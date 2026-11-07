# sim-arena-b — prereg: what the arena is, what "a stranger" is (DIAG only, zero src/js)

**Arm:** sim-arena-b (run fleshout-loop-b-20261107T0230Z, Loop B, axis
scale-onramp / winnability chain) · **DIAG only, zero src/js.** Name a fix
if one is needed; do not build game-code changes.
**Base:** master 5a4e3e4b5 · **Worktree:** ~/workspace/worktrees/sim-arena-b
**Canon read first:** docs/CANON.md, docs/CONTESTS.md.
**Context read:** evidence/2026-11-06/sim-killersurvive-a.md (death-channel
census; "Next blanks" #6), evidence/2026-11-06/sim-tbend-a.md (arena hook),
evidence/2026-11-06/sim-fightinterior-b.md (as needed).

## The two deaths under investigation (corpus, not new seeds)

No fresh seed band. Reuse the staged 53004/53006 fights and the
stageally-confirm corpus
`evidence/2026-11-06/perseed-stageally-confirm-b/` (anchor 2ff11cbf),
plus focused synthetic legs on current master.

| Death | Seed/leg | Corpus record |
|---|---|---|
| gen_93bg7ex ("Fritz"), d87 | 53004 baseline | fallen cause `the arena`; scholarDeaths causeArg `the arena`, atHaven True (4,4), inCombat True; tbFights d87: alien_tick wave 2 `won` (2 rounds, scholar 75% HP), audit wave 4 outcome `None`, scholarDiedInFight False |
| gen_76n8yer ("David"), d86 | 53006 baseline | fallen cause `a stranger`; scholarDeaths causeArg `a stranger`, atHaven False (4,2), inCombat True; NO tbFight row and NO fight row on d86 at all. Two more `a stranger` fallen entries on the same leg: gen_0djky10 (Blanca, d20), adaeze_nwosu (d96) |

## Pre-registered hypotheses (written before the replay and the proof test)

- **H-arena:** Fritz died in a 3-wave Blood contest (Gauntlet or Siege —
  the only multi-wave templates in contests.js; Pit is 1 wave), wave 1
  alien_tick won, wave 2 Audit lost; the scholar died on wave 2, so wave
  3 never started. `the arena` comes from `tbFightDeathCause`'s first
  branch (`state.arenaContest` live at tbEnd, game.js) via the tbEnd loss
  branch (game.js:46229 `playerDeath(this.tbFightDeathCause(f))`), and
  `_contestArenaAfter('lost')` then runs the 📺 death lines. The Audit
  tbFight row's outcome `None` + scholarDiedInFight False is the PRE-FIX
  tbend clobber: verified by code archaeology BEFORE this prereg — the
  corpus anchor 2ff11cbf predates the tbend-a instrument fix (1700ea5fc);
  the pre-fix stageally tbEnd wrapper at 2ff11cbf computes `isCurrent`
  at entry and then nulls `_currentTb` unconditionally, so the alien_tick
  tbEnd post-block destroys the chained Audit row's pointer (its own
  post-block still writes `won` + rounds + HP fracs to the alien_tick row
  because `isCurrent` was captured at entry, before the chain ran).
- **H-stranger:** `a stranger` is an alien-player persona — one of the
  twelve alien contestants — built by `apBuildFighter`
  (alienPlayers.js:417: kind `'hostile'`, `alienPid`, name `'Stranger'`
  pre-reveal, i.e. before the player has earned the reveal), fought via
  `startAlienCombat` (encounters.js:2710), which builds `this.tbfight`
  directly and NEVER calls `Game.startCombat` — so the TB-fight
  instruments (which wrap startCombat/tbEnd) record NO fight row, while
  the death itself still runs through tbEnd('lost') →
  `tbFightDeathCause`'s alien-hostile branch → `'a stranger'`.
  It is a PERSON, not a narrator label and not a fallback id: the
  fallback for an unclassifiable TB loss is `'the arena'`, not
  `'a stranger'`.
- **H-canon:** the arena IS described in canon (CONTESTS.md: Blood
  pit/gauntlet/siege, "the grid is the arena", arena flavor text; CANON.md
  manifest lists CONTESTS.md). The alien-player / stranger system is NOT
  described in any canon design doc — it is documented only in
  docs/ONTOLOGY.md (`alienPlayers` entry) and in code comments. Canon
  coverage is therefore: arena covered, stranger undescribed.

## Method

1. **Replay legs (same seeds, same policies, 150d):** baseline 53004 and
   baseline 53006 with the killerdeath + stageally instruments plus a
   capture wrapper that records, at every tbEnd and every playerDeath:
   `state.arenaContest`, `state.activeContest` (contestId),
   `state.alienEncounter`, the live tbfight's fighters
   (kind/alienPid/name), and the Game.log lines around the death. Output
   to `evidence/2026-11-07/perseed-arena-b/` (sims write once, on
   purpose). Contingency, stated now: the killersurvive verify leg found
   staged 53004 diverges on newer master and baseline 53006 reproduces
   exactly; if a replay leg diverges from its corpus trajectory, report
   the divergence and judge the mechanism from the synthetic legs
   instead of re-deriving from a diverged leg.
2. **Synthetic proof legs** (`scripts/test-arena-20261107.js`, focused,
   on current master, using scripts/godpath/lib.js + sim-harness):
   (a) a multi-wave arena chain live — win wave 1, lose wave 2, assert
   the death cause is `the arena`, `state.arenaContest` was live at the
   losing tbEnd, and the 📺 death lines were said;
   (b) an alien-player fight live — assert the fighter is kind
   `hostile` with `alienPid`, named `Stranger` pre-reveal, and losing
   the fight records cause `a stranger` while the stageally instrument
   records NO tbFight row for it (reproducing the corpus shape);
   (c) with the CURRENT (post-tbend-fix) instrument, the chained bout's
   row records its outcome — the corpus `None` is the pre-fix shape,
   not a current-instrument shape.
3. **Sense-test:** read the arena-death and stranger-death transcripts
   (deathSays + replay capture); judge whether they read as people
   dying in a place / at a person's hands, or as bookkeeping labels.
   Quote the lines.
4. **Instrument-fix naming:** if the trace shows a recorder gap (e.g.
   arena deaths unclassifiable in the fight taxonomy, or the stranger
   unnamed where a name exists), NAME the instrument fix precisely;
   do not build it.

## DIAG-GO (binding — judge ONLY against this)

DIAG-GO iff ALL of (a), (b), (c):
- (a) the arena death path is traced end-to-end in code with the firing
  condition named (what opens an arena bout, when it fires, what
  `fallen: the arena` records, how an arena death differs from a
  TB-fight death in the recorders);
- (b) `a stranger` is identified with at least one quoted trace (who
  the stranger was that day, what they did);
- (c) canon coverage is stated (arena described in CANON/CONTESTS, or
  undescribed; same for the stranger system).

DIAG-NO-GO if any of (a)–(c) fails. No metric is re-scored mid-run; if
a metric proves wrong it goes under "metric review" and is proposed for
the NEXT run.

## Wall numbers

Report where applicable from the two replay legs (national / table /
wins, wave 4–5 unlocks, median survival). The replays are single-seed
legs, not a panel — report per-seed values and say so plainly; do not
fabricate a panel median. Balanced panel (§15): INAPPLICABLE — no armed
leg exists in this arm (DIAG only, no before/after pair); no compare
`.md` is fabricated. Telemetry check: run against the replay corpus if
it accepts recorder input, else record the refusal as the prior arms did.

## What this arm does NOT claim

- Not a fix: zero src/js. Any instrument fix is NAMED, not built.
- Not a re-verdict on stageally/killersurvive: the census stands; this
  arm explains two of its residual channels.
- Not a contest-balance claim: no win/rate numbers are judged here.
- "A stranger by the road" (d57, 53006: a road stranger who teaches
  Mediation/System Theology/Rally) is a DIFFERENT stranger system
  (road-stranger encounters) from the fallen cause `a stranger`
  (alien-player killer) — the word is overloaded; do not conflate them.
