# Beastmaster pool filter — exclude flee-capable beasts from the contest pool

Arm: BEASTMASTER POOL FILTER (gap round, ordered by Steve 2026-11-02 23:32 CST).
Branch: `gap-beastpool2`, base `db98d8e1f` (current master at build time).
Contest-area files (`src/js/contestEngine.js`, `src/js/fieldFights.js`,
`src/data/monsters.json`) are identical between this base and the batch-ship
bump `1f170e60c`, so the arm applies cleanly to the ship tip.

## What it does, in plain words

The Beastmaster contest is a dominance contest: the System picks one beast,
a villager faces it, and if the beast bolts, that counts as a win
("dominated"). Before this change the System always picked the same beast —
the Lockpick raccoon, a little thief whose whole nature is to run away. So
the contest was usually "won" the moment the raccoon did what raccoons do:
about two in three of these contests ended with the beast bolting and the
villager declared the winner, and nobody ever died. Now the System picks
from the same pool minus any beast that can bolt. The next pick is the
Drum-Belly tanuki, a beast that stands and fights. The contest is now a
real fight: most villagers kill it, some walk away, and a few die.

What did NOT change, on purpose:

- The dominance rule is untouched: if a beast ever bolts in this contest
  (for example a future flee-capable beast reached some other way), that
  still counts as won. The rule is just nearly out of work now, because the
  pick itself cannot bolt.
- The raccoon keeps its flight everywhere else. It still bolts in the wild,
  in field fights, and anywhere else its nature applies. Only this contest's
  pick list excludes it.
- The blood contests (pit, gauntlet, siege) are untouched: they already
  fight in sealed arenas, and they still pick from the full pool. The hide
  seeker is untouched too — its win condition cannot be satisfied by flight.
- No gate, threshold, window, or rate was touched. This is a pick-list
  filter, not a retune.

## Spec verification (every claim checked in code before building)

| Claim from the brief | What the code actually says | Verdict |
|---|---|---|
| Beastmaster calls `contestBeastFor(1, 700)` | `src/js/contestEngine.js`, beastmaster branch of `_cxOther`: `this.contestBeastFor(1, 700)` | Confirmed |
| Pool is `monsterWavePool()`, no character filter | `contestBeastFor` takes the pool straight from `monsterWavePool()` (wave ≤ unlocked wave; earlier waves never leave) and picks closest log-threat to the target | Confirmed |
| Pick is closest fighting-strength to fixed 700 | Threat = pack × average damage × average HP; closest in log-distance to 700 | Confirmed |
| Lockpick raccoon is the closest of all 72, and the ONLY `flee: true` monster | Roster is 72 monsters; exactly one has `flee: true` — `lockpick_raccoon` (wave 1, threat 641.25). Closest to 700 in the full roster AND in the wave-1 pool | Confirmed, with one nuance below |
| Beastmaster fight is not sealed (no `noFlee`) | Beastmaster calls `fieldFight(pid, beast, null, { rng: R })` — no `noFlee`. Blood contests pass `noFlee: true`; beastmaster does not | Confirmed |
| Its rule counts bolting as won | `vKill` or `mFlee` → `won`, detail `slew` / `dominated` | Confirmed |
| Expected next pick: `drumbelly_tanuki` (788, committed) | Threat 787.5, wave 1, no `flee` flag; closest to 700 once the raccoon is excluded, in both the wave-1 and full-roster pools | Confirmed by the proof, not assumed |

Nuance on "all 72": the pool is wave-scoped by `unlockedWave()`, not the
whole roster at once. At wave 1 (the proof's game state) the pool is 25
monsters. The pick is the raccoon either way, and the filtered pick is the
tanuki either way — the nuance changes no outcome, but the brief's "72" is
the roster size, not the pool size at contest time.

Two beastmaster presentations exist, and only one picks a beast: the
player-facing phase show (`contests.js` `_contestBeastmaster`) is driven by
player choices and picks no beast at all. The engine resolution
(`contestEngine.js` `_cxOther`, reached via `contestResolveVillager` /
`contestResolveGroup` for taken and watched villagers) is the path that
calls `contestBeastFor(1, 700)` and counts bolting as won. The filter lives
in that engine path only.

## The change (2 spots, one file)

`src/js/contestEngine.js`:

1. `contestBeastFor(wave, targetThreat, opts)` gains an optional
   `opts.excludeFlee`: when set, the pool is filtered to `!m.flee` before
   the closest-threat pick. Callers that pass nothing see the pool exactly
   as before (blood at line ~371, hide seeker fallback at line ~606).
   If a filtered pool were ever empty, the function returns `null`, which
   the beastmaster branch already handles as a loss (`no fight`) — that
   cannot happen with today's roster (24 of 25 wave-1 beasts stay).
2. The beastmaster branch passes `{ excludeFlee: true }` and carries a
   comment citing the 2026-11-02 decision and the untouched dominance rule.

## Proof (node scripts, never jest)

Proof script: `scripts/test-beastmaster-pool-filter.js`.

- `pick` mode prints the beast the beastmaster path picks
  (`contestBeastFor(1, 700, { excludeFlee: true })`). On pre-filter code
  the extra argument is ignored, so the same script reports the pre-filter
  pick there — the before/after comparison is apples to apples. (A plain
  `contestBeastFor(1, 700)` call is NOT the beastmaster pick post-filter;
  the other callers deliberately stay unfiltered. An early draft of this
  script labeled the panel with the plain call and showed the old beast
  next to the new outcomes; the script was fixed and the panel re-run.)
- `panel` mode resolves the beastmaster contest for the first 6 roster
  villagers (excluding the bearer) per seed, at day 20, via the real
  `contestResolveVillager`. One process per seed (harness rule). Buckets:
  kill = won/slew, dominated = won/dominated, died, walked-away =
  lost/vFlee, other-lost = anything else.

Before (unmodified tree, seeds 70001–70020, 6 villagers each, N = 120):

| Beast | Kill | Dominated (bolt = win) | Walked away | Died |
|---|---|---|---|---|
| `lockpick_raccoon` (all 120) | 3 (2.5%) | 75 (62.5%) | 42 (35.0%) | 0 (0%) |

After (same seeds, same villagers, N = 120):

| Beast | Kill | Dominated | Walked away | Died |
|---|---|---|---|---|
| `drumbelly_tanuki` (all 120) | 70 (58.3%) | 0 (0%) | 47 (39.2%) | 3 (2.5%) |

Pick check, seed 70001: before `lockpick_raccoon`, threat 641.25,
`flee: true`, pool 25 (1 fleeing member), unlocked wave 1; after
`drumbelly_tanuki`, threat 787.5, `flee: false`, wave 1. The expected next
pick verified, not assumed.

Reading the panel honestly: this measures fresh, unequipped roster
villagers at day 20 — the engine-resolution population — not the
notability-weighted villagers actually taken by the show, who are usually
stronger. So 58% kills here is NOT a claim that the contest is fairly
tuned. The tanuki's win rate for the real taken population is still
unmeasured, and no fair-tuning claim is made. What the panel does prove:
the contest is no longer decided by the pick bolting (dominated 62.5% →
0%), deaths are possible again (0 → 3), and the outcome spread is a real
fight's spread.

## Regression notes

- `node scripts/test-contest-engine-break-3.js` (green-list line 233) fails
  on this tree AND identically on the unmodified main tree: `ReferenceError:
  Text is not defined` at `genRoster` setup, before any contest code runs.
  Pre-existing tooling drift in that script's stale eval list (it predates
  the Text module), not caused by this change. The same failure appears
  under `check.js --only contest-engine-break-3`.
- `check.js --quick` on this tree: 282 passed, 8 failed (470s). None of
  the 8 is caused by this change:
  - `test-measurement-proof-update` + `test-measurement-workflow`:
    "proof source inputs are not current" — expected for ANY `src/`
    change; the measurement proof refresh is merge-time workflow, not
    this arm's scope.
  - `test-foodpower-20261014`: failed only on its ontology-validator
    step while `docs/ONTOLOGY.md` was truncated mid-run (see below);
    re-run after the restore passes 30/0.
  - `test-sw-audio-cache-20261012`: `EPERM` copying `sw.js` to /tmp —
    the container write flap, not code.
  - `test-phone-frame-proof`, `test-occupation-panels`,
    `test-mobile-combat-cadence`, `test-establishment-r20-fixes`:
    phone-receipt staleness, CLI workflow, combat-Continue cadence, and
    a racks-full voice-gating count — none touch contest code or this
    diff. (Whether they also fail on the base was not re-baselined; the
    coordinator's merge-time `--quick` run is the gate, and this arm's
    own proof script is the contest-area evidence.)
- Flap incident during the quick run: `docs/ONTOLOGY.md` was truncated to
  0 bytes mid-run (a quick test rewrote it and the write flap struck).
  It was restored from its HEAD blob and the hash verified identical
  (`3105895e0…`, `git hash-object` match) before committing; the tree
  shows only this arm's 3 files afterward. The file was never edited by
  this arm.
- Worktree registration note: the first `gap-beastpool` registration
  stalled (its `git worktree add` hung, then the branch was left behind
  with no worktree, and the register script's attach-fallback failed twice
  for reasons its output hides). Registering under the fresh slug
  `gap-beastpool2` succeeded. The empty orphan branch `gap-beastpool`
  (at `db98d8e1f`, no commits of this arm) is left for the coordinator to
  delete; it was not touched by this arm.

## Files in this commit

- `src/js/contestEngine.js` — the filter (2 spots).
- `scripts/test-beastmaster-pool-filter.js` — the proof script.
- `evidence/2026-11-02/beastmaster-pool-filter.md` — this note.
