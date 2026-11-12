# sim-synergydisc-b — dawn resonance for double-passive synergy discovery

Run: `fleshout-loop-b-20261112T0730Z` (Loop B, 2026-11-12 01:30 CST).
Arm: sim-synergydisc-b — double-passive synergy discovery build.
Findings-backlog item: `sim-findings.md` line 2280 (claimed by this run).
Tracker: 0130Z blank #2 follow-up (the synergy-stall verdict).
Base: master `d98aae0f0` (worktree sim-synergydisc-b).
Prereg: `evidence/2026-11-12/sim-synergydisc-b-prereg.md` (committed
`6af998c16` BEFORE any code change).

## Verdict: GO — with a disclosed `review_required` on the panel

- **Primary metric (stall script, seed 20261011, god policy, 94d): GO.**
  Before: 0 synergies discovered, 4 attempts (all ringcraft), cornered_fury
  0 attempts while both legs held. After: **2 discovered —
  `cornered_fury` AND `stand_together`** (both 3/3 attempts, teases fired),
  cornered_fury attempts 3 > 0. ringcraft unchanged at 2 attempts; 157
  ability_granted events identical; held abilities and use-log tail
  identical. The run's trajectory is otherwise untouched.
- **Proof test `scripts/test-synergydisc-b.js`: 41/41 green.**
- **Cost bar (fresh band): PASS.** Starvation total 3 → 4 (bar ≤ 5);
  median survival 138.5d → 123.5d (bar ≥ 110.8d).
- **Panel compare decision: `review_required`** (exit 2) — two exploratory
  `regression_signal` rows on 8 seeds (village deaths/100d, eligible NPC
  named-class access). Investigated below (§Panel review); the prereg's
  binding cost bar passes, and no RNG is consumed by the dawn path itself,
  so the divergence is gameplay-mediated (synergies unlocking change
  combat/forage outcomes, which shift downstream draws). A 16-seed holdout
  is owed as follow-up before anyone leans on the deaths signal either way
  — recorded here, not hidden, and not a re-score of the GO bar.

## The correction: the class is 10, not 11 (re-derived this run)

The 0230Z table's 11 reproduce exactly from data — then the correction.
The 0230Z derivation counted activation only from the `actions` array in
`abilities.json`. It missed the live legacy activatables
(`src/js/abilityActions.js` `_legacyActivatables`, reached through the live
data-driven `activatableAbilities()` → `useAbility` → `gainAbilityXP` →
`noteAbilityUse`): `blood_magic, time_skip, dowsing, echo_location,
field_medicine, herbal_remedy, purify, compost_king, cannibal_frenzy`.
`blood_magic` has no `actions` array but IS a live button ("Blood Price",
2/day part, via `Game.activateAbility`) — using it notes it. `war_chest`
(sequential, order `[blood_magic, deep_reserves]`) therefore HAS a trigger
in ordinary play: spending blood while holding deep_reserves (passive,
resonant) is a combined use via the trigger-side resonance branch. The
other 10 have no leg in the legacy set and no other note path. Dawn
resonance covers the corrected 10 only — `war_chest` is explicitly excluded
(proof test asserts 0 dawn attempts for it, then 1 attempt from one Blood
Price use). The findings line's "11" should be corrected to 10 when the
backlog is updated on landing.

Also verified: the 4 leg ids that are not abilities (`blood_tracker`,
`clean_kill`, `fear_itself`, `unstoppable`) are synergy ids (synergy legs),
not missing data. And a secondary-count discrepancy: the 0230Z note's
"36/57 synergies have at least one passive-no-trigger leg" does not
reproduce under the documented definition — 31 (union over all paths,
synergy/tech/skill/item legs excluded), 33–38 under plausible variants.
Method difference, not affecting the build: the dawn filter is computed
from the same trigger set as the 10, not from the 36.

## The build: dawn resonance

`src/js/game.js`: new `dawnSynergyResonance()` (+92 lines, 0 deletions),
called from `endDay()` after the dawn header is said, wrapped in
try/catch like the other dawn beats. At each dawn, for each undiscovered
synergy with a path whose legs are ALL bare passive abilities currently
held at minLevel with no other note path (no activation incl. legacy
activatables checked live via `activatableAbilities()`, no ambient
`noteAbilityUse` literal, no `gainAbilityXP` literal site, no treat:
path), it runs `checkSynergyDiscovery` on the first leg of that path —
one note per qualifying synergy per dawn. The other leg resonates because
it is passive-held. Simultaneous/sequential = 1 attempt per dawn (3 dawns
co-held = unlock); sustained = 1 streak day per dawn (3 consecutive
dawns = unlock). The note calls `checkSynergyDiscovery` directly, NOT
`noteAbilityUse`: no use-log entry (a dawn resonance is not a use), no
signature flash. The filter is computed from data + the trigger set at
runtime, not a hardcoded list of 10 ids — a future data change that gives
a pair a trigger automatically drops it from dawn resonance. The other
47 synergies are untouched.

Design call (documented in the prereg; Steve can overrule): dawn resonance
over ambient situation-hooks (10 bespoke hooks, several pairs have no
situation that ever arises), discovery-on-grant (kills the tease arc),
and surge widening (changes the surge economy for every ability). Canon:
synergies are System grants, never taught, never bought — dawn resonance
keeps discovery System-granted (the System notices the held pair
overnight). No canon doc covers synergy discovery shape (checked CANON.md,
SYSTEMS.md, DIRECTIVES.md); the shape is a documented design call, not
canon implementation. No new narration: the tease/unlock lines are the
synergies' own, from `synergies.json`.

## Proof

- `node scripts/test-synergydisc-b.js` — **41 passed, 0 failed** (log
  `evidence/2026-11-12/test-synergydisc-b.log`): (a) cornered_fury 3
  dawns → discovered, tease1 + unlock lines spoken, no use-log entry for
  either leg; owl_hours 3-dawn streak → discovered; all 10 triggerless
  synergies progress exactly 1 per dawn; war_chest 3 dawns = 0 attempts,
  then 1 Blood Price use = 1 attempt (its own trigger intact); ringcraft
  3 dawns = 0; closed_loop 3 dawns = 0; (b) one leg held → 0 attempts;
  no legs → 0 attempts. Fixture note: legacy buttons are invoked via
  `Game.activateAbility`, NOT `useAbility` (which needs a data-driven
  action def — blood_magic has none, so useAbility answers "That action
  doesn't exist"). The stall script's god policy only ever calls
  useAbility, so it never presses Blood Price — war_chest's trigger is
  real for a human player but invisible to that policy.
- `node scripts/test-synergy-stall.js` verbatim, before/after (logs
  `evidence/2026-11-12/synergystall-baseline-20261112.log` /
  `synergystall-after-20261112.log`): see Verdict above. GO bar met.
- `node scripts/check.js --quick` — **335 passed, 5 failed in 915s**
  (second run; first run 340 scripts, 6 failed incl. a human-combat-parity
  write flake that passed on re-run). All 5 attributed, none mine:
  - `test-measurement-proof-update.js` — "Proof source inputs are not
    current". Fails IDENTICALLY on pristine HEAD (verified by
    file-swap attribution, no stash). Pre-existing: the retained proof was
    already stale on base `d98aae0f0`.
  - `test-measurement-workflow.js` — same 1 failing assertion ("retained
    neutrality proof covers the current Game/controller/harness inputs").
    Identical on pristine HEAD. Pre-existing.
  - `test-phone-frame-proof.js` — 3 failing assertions about retained
    browser inputs matching current source (index.html,
    foreignSpeech.json, regions.json, statusEffects.json,
    table-endings.json, alienPlayers.js) — files this change does not
    touch. Identical on pristine HEAD. Pre-existing.
  - `test-living-garden-deed-attainment.js` + `test-one-person-army-deed-
    attainment.js` — 120s timeouts under check.js's 4-parallel load.
    Solo they PASS on pristine HEAD (both, ~61s each); solo with my
    change, single-seed timing is identical (seed 7: 15.99s wall / 3.60s
    user with change vs 15.04s / 3.66s pristine, byte-identical output),
    and the dawn path microbenchmarks at 0.01ms/call
    (activatableAbilities, dawnSynergyResonance, checkSynergyDiscovery,
    recomputeActiveSynergies all ~0.01ms). Host-load artifacts, not a
    slowdown from this change.
  - `test-human-combat-parity.js` (first run only) — writeFileSync error,
    passed on re-run: host write-flap flake.
  - No green claimed that was not seen. The measurement-proof refresh
    (`scripts/balance-proof-update.js`) is owed as maintenance for ANY
    Game change on this base (the proof was already stale before this
    arm); it is not part of this arm's diff and is flagged for the
    coordinator/ship loop rather than silently regenerated here.

## Fresh band (before/after, balanced panel)

`scripts/balance-panel.js`, competent policy, seeds 190501–190508, 150d,
death-aware. Before `evidence/2026-11-12/synergydisc-b-panel-before`
(8 cases, validity sourcesStable + neutrality match); after
`evidence/2026-11-12/synergydisc-b-panel-after` (8 cases, same validity);
compare `evidence/2026-11-12/synergydisc-b-panel-compare`
(decision `review_required`, exit 2).

| | Before | After |
|---|---|---|
| Median survival | 138.5d | 123.5d (bar ≥ 110.8d ✓) |
| Survived | 2/8 | 1/8 |
| National | 0/8 | 0/8 |
| Table (invitation) | 8/8 | 7/8 |
| Won | 0/8 | 0/8 |
| Wave reach | 4×7, 5×1 | 4×6, 5×2 |
| Starvation deaths total | 3 | 4 (bar ≤ 5 ✓) |
| Seeds with any starvation death | 2 | 2 |

Per-seed days: before [135, 95, 150, 150, 142, 120, 106, 147];
after [137, 150, 101, 127, 136, 61, 87, 120].

## Panel review (the `review_required`, investigated not hidden)

Compare flags two exploratory `regression_signal` rows on 8 seeds:
village deaths per 100 calendar days 75.57 → 88.54 (+12.98, interval
0.99–25.44) and eligible NPC named-class access 0.2717 → 0.1849
(−0.0867, interval −0.179–−0.012); several `regression_watch` rows
(player deaths/run 11.125 → 12.875, community loss 0.75 → 0.875,
player named-class access 0.875 → 0.75). Luck percentiles also moved
(combined 0.786 → 0.515 on 4/8 pairs; trap 0.683 → 0.328 on 3/8).

Investigation — is the dawn path itself shifting the RNG stream? No:
the dawn path consumes no `Math.random` in the harness. Verified by
reading every function it touches: `activatableAbilities()` →
`_actionAvailable` → `ABILITY_ACTION_PRECHECKS` (no `Math.random` in the
precheck definitions or object) and `nearButcherableCorpse()` (pure scan,
`corruption.js:551`); `checkSynergyDiscovery` → tease/unlock voice
(`say`, `drama` in try/catch) and `audioEvent` (no-op in node: `Audio`
undefined); `recomputeActiveSynergies` (modifier recompute). The
divergence is gameplay-mediated: once a synergy unlocks, combat/forage
outcomes change, which consumes different RNG downstream — trajectories
diverge chaotically from the first unlock, exactly as any power-granting
fix would. On 8 seeds with unadjusted exploratory intervals, a
barely-nonzero deaths signal is consistent with that chaotic divergence,
not with a harmful mechanism (no mechanism in the change touches
villager mortality: discovery is scholar-scoped; the scholar gets
stronger, not weaker). The prereg's binding cost bar passes. Follow-up
owed (not a re-score): a 16-seed holdout to resolve the deaths signal
before anyone leans on it either way.

## Scale wall (this run)

Fresh band, both legs: national 0/8 → 0/8, table 8/8 → 7/8, wins 0/8 →
0/8, wave-5 reach 1 → 2 seeds, median survival 138.5d → 123.5d. The wall
did not move: villages reach the table and wave 5, none reach national
or a win, on either leg. Dawn resonance is a progression fix, not a wall
attack — it was never expected to move the wall, and it did not.

## Village assessment (plain words)

The diagnostic seed tells the story cleanly. Before the fix, the scholar
held the cornered-fighter pair for the whole endgame and the game never
once noticed — two abilities that only make sense together sat side by
side for 94 days while the System said nothing. After the fix, the System
notices the pair overnight: on the third dawn together it speaks up
("Outnumbered, your hands stopped shaking...") and the combination
unlocks. A second pair the scholar happened to hold along the way
(stand_together) unlocked the same way. Nothing else about the run
changed — same abilities held at day 94, same daily ability use, same
157 grants, same ringcraft stall at 2 attempts (its own trigger is a
fight-path alignment the dawn does not touch). The village itself is the
same village; the scholar is simply no longer carrying combinations the
game is blind to.

## Sense test (voice lines)

The tease/unlock lines are the synergies' own, reused unchanged — no new
narration was written. Read as dawn reflections they hold up: farsight's
"Eagle eyes found the herd; pathfinder legs ate the miles between" and
owl_hours' "At dusk your sharp eyes didn't fade — they changed" read as
overnight sense-making, which is what the fiction claims (the System
notices the pair overnight). One wrinkle, recorded honestly:
cornered_fury tease2 says "Cornered in the last fight..." — at dawn after
a quiet day with no fight, that line presumes a cornering that may not
have happened. It is a hypothetical ("One more corner and it won't turn
back"), and the hint line ("Let them surround you. Then stop holding
back.") is the honest guide, so the fiction survives — but a future
pass could give dawn-fired teases their own overnight wording instead of
reusing fight-presuming lines. Not a blocker: the lines are method-
agnostic by design (they never name a method), and dawn is now one more
method they cover.

## Metric review

No metric was re-scored mid-run. The prereg GO bar (≥1 of the corrected
10 discovered AND cornered_fury attempts > 0 AND cost bar) is met in
full. Two prereg framings were corrected during the run and are recorded,
not hidden: (1) the class is 10, not 11 — war_chest was rescued by
blood_magic's legacy activation, found by re-deriving the class from
data + code rather than trusting the 0230Z table; the GO bar's "11" is
read as the corrected 10 (2 discovered, so the bar clears under either
reading). (2) The secondary "36/57" count does not reproduce (31 under
the documented definition) — a reporting discrepancy only; the dawn
filter does not use it. The panel compare's `review_required` is a
scorecard verdict, not a prereg metric: the prereg's binding regression
leg is the cost bar, which passes. The deaths signal is disclosed above
with its investigation and a 16-seed holdout owed as follow-up.

## Run notes (infrastructure)

- **safe-commit.sh refused the first prereg commit** with a mass-deletion
  guard (287,847 lines in src/): two causes, both mine to record. (a) I
  passed a DIRECTORY path (`synergydisc-b-panel-before/`) — safe-commit
  does not accept directories (known AGENTS.md lesson); hash-object on a
  directory fails. (b) The host write flap was active at the time: git
  could not write a new private-index lock file (`fatal: sha1 file
  '/tmp/idx-...lock' write error: Operation not permitted`, reproduced
  twice, including under ~/workspace) while main-index writes still
  worked — an empty private index trips the guard. Recovery: explicit
  file lists + retry; commit `6af998c16` verified correct via
  `git show --stat` (12 files, 237 insertions, 0 deletions).
- **Index clobber struck on BOTH safe-commit commits in this worktree**
  (known class): after each correct commit the main index showed the
  committed files as staged-deleted (`D` + `??` for the same file).
  Repaired both times with `git ls-tree -r HEAD -- evidence/2026-11-12/
  | git update-index --add --index-info`, verified with `git status
  --short` empty + `git diff HEAD` empty. One case file was missed in
  the first commit by a typo'd hash filename and landed in a second
  commit `0fce1be9f` (1 insertion, verified).
- **check.js --quick first attempt** exited 1 in 2.9s with an empty log:
  the shell redirect target could not be created during a write-flap
  window (bash redirect failure, not a test failure). Re-ran capturing
  via the exec tool, then re-ran to a /tmp file for the full list.
- **Attribution method**: file-swap (`cp` + `git checkout HEAD --`
  + restore + sha256 verify), NOT the shared stash stack (documented
  stash-pop collision hazard on this repo).
- Loop A live trees untouched (sim-bisect-origin-a,
  sim-bisect-mergebase-a); main tree untouched; no push, no version bump.

## Telemetry deviation check

`node scripts/telemetry-check.js --baseline .../telemetry-baselines/
scale-wall.json --current '<after-panel rows>' --metrics national,table,
wins,exiled --sweep-rows`: `wall: table=7/8 entered=0/8 won=0/8`;
`LOUD: national disappeared: baseline 12 -> current 0`;
`LOUD: wins disappeared: baseline 16 -> current 0`. Both LOUD lines are
the regime artifact the baseline itself warns about: the baseline is the
winseat regime (win-stack flags on, 16/16 wins), while this panel is a
competent-policy substrate with no win-stack flags, where national/wins
are structurally 0 on BOTH legs (before: national 0/8, wins 0/8; after:
0/8, 0/8). Not a change caused by this arm — the before leg reads
identically.

## Proof (files)

- `src/js/game.js` (+92, −0): `dawnSynergyResonance()` + `endDay()` hook.
- `scripts/test-synergydisc-b.js` (new): 41/41.
- `evidence/2026-11-12/sim-synergydisc-b-prereg.md` (committed pre-change,
  `6af998c16` + case-file fix `0fce1be9f`).
- `evidence/2026-11-12/synergystall-baseline-20261112.log`,
  `synergystall-after-20261112.log` (stall script verbatim).
- `evidence/2026-11-12/test-synergydisc-b.log`.
- `evidence/2026-11-12/synergydisc-b-panel-before/`,
  `synergydisc-b-panel-after/` (+ `.log` files),
  `synergydisc-b-panel-compare.{json,md}`.
- Full check output retained at `/tmp/check-quick-full.log` (335 passed,
  5 failed, 915s); attribution logs `/tmp/attr-*.log`, `/tmp/attr2-*.log`,
  `/tmp/seed7-with.log`, `/tmp/seed7-pristine.log` (identical output).
