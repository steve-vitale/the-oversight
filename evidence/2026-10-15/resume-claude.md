# Resuming the interrupted Claude session — 2026-10-15

## Source and recovery

Recovered **Ability/god-path system design**, cloud session
`session_01QPzbuApDmn3auifxsV7pNN`, which stopped at its weekly usage limit.
The last human correction is copied verbatim to
[`STEVE-ANSWERS.md`](../../docs/godpath/STEVE-ANSWERS.md).

The working line is upstream `master`, commit
`7d011395d99bdfca71892d0f3a23a8a332f3ab15`; the old `main` branch is not the
current game. Work is on `codex/resume-claude`.

Recovered the parent session's death fixes, the completed bot followups,
the unfinished god runtime and its companion engine/data/proofs, and the
tuning worker's cooking, treatment and skill-lesson helpers. Originals are
preserved locally under `.git/claude-recovery`; file hashes and recovery
limits are in [`claude-recovery-manifest.json`](claude-recovery-manifest.json).
The cloud file viewer truncated the 2.4 MB `game.js`: that prefix was **not**
applied. The sleep and arena fixes were ported to the complete Git source,
then checked against the recovered tests.

## Completed work

- **Coordinate regression:** drifting now treats map coordinate 0 as real.
  The new smoke-discovery proof fails on the recovered baseline and passes
  after the two-coordinate fix.
- **Death fixes:** palisade sleep protection follows the actual Haven
  location. Arena co-taken fates resolve before succession, preventing the
  successor dying in the same beat.
- **All ten gods:** recovered and finished the public `useAbility('god', …)`
  bridge, action-bar entries, automatic passives, villager casts and party/
  titan hooks. Costs and weaknesses remain real. A villager Ward protects
  the bearer too; No Lies pays for its daily sight; an empty garden action
  refuses before taking food. The capable bot uses daily and combat verbs.
- **Beam:** 65–85% of the target's actual max HP with human gear, then x0.7
  per resistant body slot. The eight existing tier-4 body-armor definitions
  now declare resistance. Full-body coverage and legacy slot aliases do
  not double-count. A shot aims for one full alien turn, then hits the
  declared tile before any heavy-strike routine can delay it. Moving away
  evades it. Damage uses the common protection/death funnel; ordinary armor
  cannot reduce an already calculated beam a second time. Keepsakes and
  unworn gear do not stop beams.
- **Raids:** only monsters of the **current** unlocked wave participate;
  campaign/titan pieces do not. Raiders occupy separate Haven/treeline
  world nodes and keep their posts at dawn. Adjacent surviving raiders keep
  the aid crisis alive; clearing only the first one cannot end the siege.
- **Bot:** restored fleeing through Haven's doors, sensible feast-draw and
  contest choices, beam/deer retreat, lockjaw care and raid calls. Finished
  cooking cleaned food before donating, treating sick villagers, taking
  skill lessons and following earned doubts offered in a conversation.
- **Measurement:** person deaths are split into allied villagers and hostile
  humans, rather than losing roughly half the villagers in "other". The
  greedy-mode test starts from a real ready seat and plays into Overtime.
- **Table:** wave 3+ encounters satisfy the lesser seat's late-wave bar.
  Feared/Beloved/Relay standing uses bounded evidence curves instead of
  immediately tying at 100. Failed doors cost 500 kcal, close for the sitting
  and reduce the next opening advantage; two failed challenges end without
  an agreement. The Feared closing bargain visibly requires terror 4+;
  standing 75+ adds one opening point. The Network key retains its every-path
  final. A lost agreement has its own living-village ending screen, and the
  replay button no longer calls a shadowed title string.

HP growth remains conditional, as Steve requested. A healthy human-geared
bearer survives one unresisted beam; a resistant advanced set takes 14 HP
from the maximum 85 HP shot. Equipment, abilities and allies carry this
patch's survival improvement. This does not promise solo wave-5 victories.

## Measured result

Same 64 seeds, capable policy, 150-day horizon, one game per process.
The **before** snapshot already includes recovered death/bot fixes and the
recovered god module; it predates completing the new gameplay/bot/Table
changes. It is not an untouched upstream baseline. Source was frozen for
both cohorts. The final source digest is in `resume-validation.json`.

| Metric | Recovered baseline | Completed changes |
|---|---|---|
| Won / seated / invited | 34 / 35 / 40 | 43 / 56 / 58 |
| Wins once seated | 34/35 (97.1%) | 43/56 (76.8%) |
| Village losses | 20 | 4 |
| Bearer deaths | 143 | 90 |
| Villager deaths (field + person) | 678 | 520 |
| Lessons learned by bearer / run | 0 | 9.1 |
| Lessons taught by bearer / run | 0 | 4 |

See [`dashboard-recovered-64.md`](dashboard-recovered-64.md) and
[`dashboard-resumed-64.md`](dashboard-resumed-64.md), with raw per-seed JSON
beside them. The 16-seed screens preserve the calibration: paid fallback
alone still gave 13/13 seated wins; the declared closing stake brought it
to 10/13. The final 64-seed result is the decision sample.

These are bundle comparisons, not separate causal estimates for every lever.
Earlier wins also shorten exposure to later deaths and class recognition.
Player class recognition fell from 75% to 61%; 11/20 subclasses appeared
versus 12/20 before. This is not evidence that the unseen classes are useless.
The default bot still sits promptly, so it produces no Network campaign:
`CAPABLE_GREEDY=1` is available, but a titan-seeking bot layer remains a
separate future probe, as the original endgame diagnosis records. Coalition
turns and recoverable lost pieces were already fixed upstream.

## Verification and release

- Quick regression net: **106 scripts passed**.
- God-power proof: **115 assertions passed** for player/villager effects,
  fuel, weaknesses and party/titan interactions.
- Ontology: **111 systems validated**; strict wiring checks for the god
  runtime and godhood module: **0 unwired**.
- Final full regression result: **878 scripts passed, 0 failed** (163 seconds).
- Final browser boot reaches the title screen without warnings or errors.
- `git diff --check` passes.

Windows portability fixes keep LF text and use argument-based syntax probes,
normalize module-cache/attribution paths, and pin fixture conditions instead
of depending on random terrain or the cast. The tackle fixture now strips
both supported item-id shapes; hunter and bark checks use the seeded,
complete shared game instead of incomplete manual module lists. No assertions were removed;
legacy beam expectations were updated to the explicitly changed rules.
See `docs/SIMULATING.md` for running legacy shell-based tests on Windows.

Changes are local and reviewable. No release version was bumped and no
production deployment was made; the service-worker asset list includes the
new runtime/data for a later release. Gameplay/feel commits are marked
`[needs-eyes]` for Steve's review.

## Campaign continuation, 2026-10-15

The campaign-seeking policy is now implemented separately from capable,
with a matched waiting control and actual recruitment, provisions, donated
gear, travel and combat. The 16-seed screen yields six real Herald kills
and no Finale/Network entry. A hard-coded 9x9 AI movement boundary is fixed
for 12x12 battles; all 32 natural before/after state hashes remain identical.
Prepared advanced armies beat the Herald, but the Finale crew still drops
or routes the bearer while the army remains intact. These are not complete
campaign proofs or a demonstrated balance gain.

Phone playtesting found a separate next priority: the battle UI clamps to
81 cells and does not draw coalition fighters. That remains open. The
policy's later-node branches, natural food/overtime viability and Network
playthrough also remain open. Read `campaign-usage-audit.md` for exact
fixtures, raw evidence and next steps. Latest validation: **113 quick /
885 full scripts pass**, plus 25 new focused assertions and 111 ontology
systems. No release/push/deployment; the broad roadmap goal stays active.

## Coalition presentation continuation, 2026-10-15

The phone defect is repaired: active battle dimensions drive the board and
living named allies render at their combat positions. A prepared 390x844
phone fight shows 144 cells and 21 allies (five in outer rows), 12px labels,
full accessible names and no horizontal overflow. Real Wait turns moved
thirteen of twenty allies in the earlier movement fixture. Ordinary fights
still show 81 cells. Nineteen focused assertions, 114 quick scripts and
886 full scripts pass. See `coalition-presentation-audit.md`.

The old comment that Table's direct titan trial was nine cells was wrong:
the live trial uses twelve. The UI now follows actual dimensions. The
same live probe found that this direct trial also receives Finale campaign
narration/tools after the bypass flag is consumed inside the wrapper chain;
audit that boundary separately before claiming world/Table isolation.
Finale survival, natural food/overtime entry, Network completion and the
remaining broad roadmap/noncombat work stay open. No release or deployment.

## Direct Table trial isolation, 2026-10-15

Explicit trial context now survives both party wrappers and core combat.
The summoned champion does not lift or inherit a nearby world monster,
grant world crew tools, mark the Finale world heart or resolve its muster.
Old pending trials are recognized, leaked tools unusable, and their leaked
world-heart mark retired. A real phone loss passed the mantle from Carlos
to Benedetta and resumed the Table at beat three with reduced terror;
the separate world Herald and world muster data remained present.

Validation: 43 focused checks (original runtime fails 25), 115 quick /
887 full scripts pass, ontology 111 systems, no unwired Table/Finale
functions. Sixteen seeds × capable/campaigner have identical before/after
gameplay hashes in all 32 pairs; those ordinary runs did not choose a trial.
See `table-trial-isolation-audit.md` for fixture limits and actual UI proof.

Next investigate the committed-volunteer mantle transition: Benedetta was
already listed among Haven's blades, and current muster filtering does not
exclude the new bearer. Do not count raw entries as distinct active allies
until actual injection/upkeep/readiness are checked. Full campaign survival,
Network and the rest of the roadmap remain open; no release/deployment.
