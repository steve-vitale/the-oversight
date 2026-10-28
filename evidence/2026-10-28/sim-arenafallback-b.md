# sim-arenafallback-b — tbEnd fallback origins named honestly + arena band proof

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261028T1930Z,
arm sim-arenafallback-b. Follow-up to sim-arenalabel-b (arena branch
was proof-leg-only; betrayal / table-trial / coalition-arena /
alien-hostile losses still read 'the arena' by fallback).
LABEL-ONLY game change: no damage, HP, kcal, death rule, lifeline,
contest-routing, or behavior change.

Preregistration: evidence/2026-10-28/sim-arenafallback-b-prereg.md
(committed d03800e9c BEFORE any judged sweep). Judged against that
prereg only.

## The lever

src/js/game.js Game.tbFightDeathCause(f) — the one tbEnd('lost')
playerDeath site (game.js:44294) — now names each origin. Order:
arenaContest -> 'the arena' (unchanged); betrayal -> 'betrayal';
tableTrial -> 'the table trial'; coalitionArena ->
'the coalition arena'; proven wild (monster, no hostile, no flags)
-> 'the wild' (unchanged, arenalabel); hostile fighter with
alienPid -> 'a stranger'; everything else -> 'the arena'
(unchanged conservative fallback). 'a stranger', not 'an alien',
is deliberate and pre-registered: pre-reveal the alien fighter is
named 'Stranger' (alienPlayers.js apBuildFighter), and the cause
must not leak a truth the player has not learned ("if you don't
know, it doesn't show"). Betrayal-hostile fights hit the betrayal
branch first, so the stranger branch is alien-only in practice.

No code branches on any of the new cause strings (checked), and
no code branches on cause === 'the arena' (arenalabel check);
relabeling cannot reroute any system. _contestArenaAfter's own
death line still hardcodes 'the arena' for arena losses only,
consistent with the playerDeath label there.

scripts/test-arenalabel-b.js L3–L6 expectations were updated in
the same change commit (design changed on purpose, repo rule):
they now assert the new labels instead of the old fallback.
The arenalabel proof is green again at 13/13.

## Substrates (real entry points, forced loss as in arenalabel L7/L8)

Each instance is one fresh harness game; the fight is started
through its real entry point and only the outcome is forced
(abilities cleared, phoenixLink nulled, player fighter HP -> 0,
tbEndCheck, then tbEnd('lost')):

- arena-pit: Game._contestArena({contestId:'pit'}, {waves:1})
- arena-gauntlet: Game._contestArena({contestId:'gauntlet'}, {waves:3}),
  loss on wave 1
- betrayal: Game.startBetrayalCombat(first roster villager != bearer)
- tableTrial: Game.startCombat('finale', {tableTrial:true})
- coalition: seeded muster (10 allied blades, herald, minAllies 10)
  + Game.startCombat('herald') — SEEDING DISCLOSED: a fresh day-1
  game has no coalition, so muster state is seeded; the
  coalitionArena FLAG is set by real code (wrapped startCombat ->
  titanInjectAllies -> titanPrepareArena; verified in every
  instance: coalitionArena true, 10 ally fighters). Seeding a
  prerequisite is not fabricating the flag; see metric review
  for the judgment call.
- alien: Game.apStartEncounter('pip_quindle')
- wild (control): Game.startCombat('bulldozer')

## Verdict against the prereg

PILOT-GO — all clauses hold (8 seeds 12100–12107 x 7 origins,
56 instances per leg; analyzer scripts/analyze-arenafallback-b.js
... pilot, exit 0):

- A-PILOT: 16/16 arena instances labeled 'the arena' in ALL
  fields (playerDeath, registerDeath, fallen, telemetry,
  lineage, death line) — bar was >= 14/16.
- B-PILOT per origin: 8/8 each for betrayal, tableTrial,
  coalition, alien — bar was >= 7/8.
- WILD-CONTROL: 8/8 stay 'the wild'.
- DETERMINISM: 0 non-label field differences, 0 unintended
  label changes across all 56 pairs.
- BEFORE-SANITY: all before instances match pre-change labels
  (fallback origins 'the arena', wild 'the wild', arena
  'the arena').
- PROOF: scripts/test-arenafallback-b.js 32/32 green BEFORE the
  judged after-band.

CONFIRM-GO — all clauses hold (16 FRESH seeds 12108–12123 x 7
origins, 112 instances per leg; analyzer ... confirm, exit 0):

- A-CONFIRM: 32/32 arena instances 'the arena' in all fields
  — bar was >= 28/32.
- B-CONFIRM per origin: 16/16 each for betrayal, tableTrial,
  coalition, alien — bar was >= 14/16.
- WILD-CONTROL: 16/16 stay 'the wild'.
- DETERMINISM: 0 non-label differences, 0 unintended changes
  across all 112 pairs.
- BEFORE-SANITY: holds on the confirm band too. The confirm
  before leg ran on a temporary pre-change game.js checkout
  inside this worktree only (HEAD~1 content, hash-verified),
  restored byte-identical to HEAD afterward (hash-verified)
  and re-proven (test-arenafallback-b.js 32/32 again).

Totals: 168 unique (seed, origin) pairs, 336 instance records,
0 field disagreements in either leg, 0 non-deterministic pairs.

## Before/after numbers (confirm band, seed 12108, same bearer)

| origin | before cause (tbEnd) | after cause | fields agree after |
| --- | --- | --- | --- |
| arena-pit | the arena | the arena | yes, all 6 |
| arena-gauntlet | the arena | the arena | yes, all 6 |
| betrayal | the arena | betrayal | yes, all 6 |
| tableTrial | the arena | the table trial | yes, all 6 |
| coalition | the arena | the coalition arena | yes, all 6 |
| alien | the arena | a stranger | yes, all 6 |
| wild (control) | the wild | the wild | yes, all 6 |

Analyzer: node scripts/analyze-arenafallback-b.js <beforeDir>
<afterDir> <pilot|confirm> — pilot summary: 56 compared, 0 missing
after, 0 non-label diffs; confirm summary: 112 compared, 0 missing
after, 0 non-label diffs.

## Sense test (plain words — what the player reads)

Seed 12108, bearer Angelo Martini, same fight shape before/after;
only the cause token moves, exactly as the prereg's determinism
clause requires. The mourning beat never changes — the village
still stops, somebody still screams, somebody else still starts
digging — but the record now answers "where / what killed him"
instead of lying about it.

- Arena (pit + gauntlet, unchanged): "Angelo Martini is dead —
  the arena." Correct before and after: the pit and the gauntlet
  ARE arena shows, with gates and a crowd in the fight's own
  framing. Leg A is what this band adds over arenalabel's proof
  leg: the label now survives a real _contestArena fight, with
  the contest's own aftermath running after it, on two different
  contest ids.
- Betrayal: before "dead — the arena" was a double lie — no
  arena, and the killer was a villager who turned (fight: player
  + one hostile villager, no monster, no crowd). After "dead —
  betrayal" names the human cause in one word, in the same terse
  style as 'starvation'. As a player, the after line tells you
  what to grieve and what to fear next: not a place, a person
  who turned.
- Table trial: before, a trial-by-combat at the galactic table
  read as a show-pit death. After "dead — the table trial" marks
  it as the graver, rarer event it is — the finale fighter, not
  a beast in a pit. A player who dies here now reads a record
  that matches the stakes of the fight they chose.
- Coalition arena: before, a titan field — a 24-grid battlefield
  with 10 allied blades standing beside you — read as 'the
  arena', the same word as the show pit. After "dead — the
  coalition arena" keeps the word 'arena' (it IS an arena) but
  distinguishes whose arena: the coalition's war, not the
  System's show. That distinction is the whole point — collapsing
  them hid the largest fight in the game inside the smallest one.
- Alien stranger: before "dead — the arena" for a fight that
  began with "A figure steps out of the treeline. Human-shaped.
  But something's wrong." After "dead — a stranger" is terse to
  the point of ambiguity in isolation — a stranger is a who, not
  a where — but in context it is exactly what the player knows:
  a person-shaped stranger killed them, and nothing in the line
  leaks the alien truth the player has not learned. It is the
  one wording Steve may want to tune, which is why the change
  commit carries [needs-eyes]; the counts are green either way.
- Wild (control): "dead — the wild" before and after, unchanged.

## Reachability verdict

Reachability is unchanged by construction and by measurement:
the change moves no gate, no wave, no scale, no table path —
determinism (identical fight flags, fighter kinds, bearers, and
non-label fields on all 168 pairs) is the evidence that nothing
reachable moved. Waves, arcs, regional -> national, the table,
and the win flag are exactly as reachable as before; this arm's
job was labels, and labels are the only thing that moved.
No tbEnd fallback origin is left unnamed: arena, betrayal,
table trial, coalition arena, stranger, and wild now cover every
origin the bands and probes could produce. The residual
'the arena' fallback covers only fights no known producer makes
(e.g. a hostile fighter with no alienPid and no betrayal flag).

## Village assessment (plain words)

These are substrate instances, not long sims, so the honest
village picture is narrow: a day-1 bearer in a fresh village,
facing one real fight through one real door — the pit gate,
a villager's turned blade, the table's trial, a titan field
with ten allies at his back, a stranger out of the treeline,
or a bulldozer in the grass. Nobody thrives or starves here;
the village's pantry, journal, and roster are the same before
and after in every pair. The blank this arm fills is the one
arenalabel left open: the village's own death record no longer
lies about five of its six kinds of death. A Codex that says
'betrayal' when a villager turned, 'the coalition arena' when
the army fell, and 'a stranger' when a stranger killed is a
record the next bearer — and the player reading it — can
trust to tell the village's story back straight. That trust was
arenalabel's point, and this arm finishes it.

## Guards

- scripts/test-arenafallback-b.js: 32/32 PROOF-GREEN (7 direct
  label legs + 6 real-tbEnd origin legs x 4 checks each, incl.
  fallen / telemetry / lineage agreement and death lines).
  Green before the after-band and again after the confirm
  before-leg restore.
- scripts/test-arenalabel-b.js: 13/13 PROOF-GREEN with updated
  L3–L6 expectations (was 9/13 before the update, exactly the
  4 superseded fallback legs — no other leg moved).
- scripts/test-grantdeath-b.js: 8/8 PROOF-GREEN (instrument
  unaffected by the label change).
- node scripts/check.js --quick: NOT COMPLETED in this run —
  killed at the 420s timeout with only the header + progress
  dots, no summary. Same stall class as arenalabel's 7+ minute
  no-output stall, and sibling lanes were running their own
  check.js --quick concurrently during this window, so the run
  is not clean evidence of a break. Reported here, not hidden:
  the targeted death-related guards above are green, but no
  full quick-check pass was obtained. The coordinator should
  treat that as an open item, not as a green light.
- No jest run in this arm (proofs are node scripts); no
  concurrent jest started by this arm.

## Balanced panel (MEASUREMENT.md §15 — explicit, not a fake)

No balance-panel compare .md is produced, as pre-registered:
a label-only change has no game leg a panel can judge, panel
metrics (national / table / wins, wave reach) cannot move
under it, and the determinism clauses are the binding guard
that they did not. If determinism had failed, a panel compare
would have been run before any landing claim.

## Metric review (MEASUREMENT.md §14)

Judged against the prereg as written, no mid-run re-scoring.
Three disclosures for the next run / coordinator, none a
verdict change:

- Coalition muster seeding: the prereg disclosed it and named
  it a judgment item. The counts hold and the flag is set by
  real code in every instance, so this arm judges the seeding
  honest and lands the coalition label — but the coordinator
  may overrule: if seeded musters are judged dishonest,
  coalition alone drops to DIAG-NO-GO and its label line
  should be reverted, leaving the other four origins standing.
- 'a stranger' wording: green on counts, terse in the sense
  test, and flagged [needs-eyes] in the change commit for
  Steve to tune. If he retunes the word, only the string
  changes; no band needs re-running unless the new word
  changes the branch structure.
- Proof L-real alien flag check is vacuous (there is no flag
  to check for the alien origin — the fighter's kind:'hostile'
  + alienPid is recorded in the sweep fight data instead).
  Disclosed, not hidden; the label legs L6/L7 + sweep fight
  records carry the alien proof.

## Proof

- node scripts/test-arenafallback-b.js — 32/32, exit 0 (proof
  green BEFORE the judged after-band, and again after the
  confirm before-leg restore).
- Pilot: before leg + after leg, 56 instances each, corpora
  evidence/2026-10-28/sim-arenafallback-b-corpus-before-pilot/
  and sim-arenafallback-b-corpus-after-pilot/; analyzer
  scripts/analyze-arenafallback-b.js (pilot VERDICT PASS).
- Confirm: before leg + after leg, 112 instances each,
  corpora evidence/2026-10-28/sim-arenafallback-b-corpus-before-confirm/
  and sim-arenafallback-b-corpus-after-confirm/; analyzer
  (confirm VERDICT PASS). Confirm before leg ran on a
  temporary pre-change game.js checkout, restored
  byte-identical to HEAD (hash-verified) afterward.
- Seeds: pilot 12100–12107, confirm 12108–12123 (fresh band,
  verified against dated evidence .md files + corpus names).

## Follow-ups (for the coordinator to append to the goal hidden_files/sim-findings.md — this arm does not edit that file from the worktree)

- [open] check.js --quick did not complete in this run either
  (420s timeout, header + dots only; sibling check runs
  concurrent) — same open item as arenalabel-b. Targeted
  death guards are green; no full quick-check pass obtained.
  (sim-arenafallback-b)
- [open] 'a stranger' death-cause wording is Steve's to tune
  ([needs-eyes] on the change commit); counts are green
  regardless. (sim-arenafallback-b)
- [open] Coalition muster seeding judgment: coordinator may
  overrule the honesty call — if so, revert only the
  coalition label line. (sim-arenafallback-b)
- [closed by this arm] tbEnd fallback origins: betrayal,
  table-trial, coalition-arena, alien-hostile now named;
  arena branch band-proven on real _contestArena losses
  (pit + gauntlet). Residual 'the arena' fallback covers only
  fights no known producer makes. (sim-arenafallback-b)

## Convergence line

tbEnd fallback-origin labels + arena band proof — pilot 8 seeds
x 7 origins (56/leg) + confirm 16 fresh seeds x 7 origins
(112/leg), before/after on identical seeds: arena-pit and
arena-gauntlet losses via real _contestArena read 'the arena'
in all 6 death-record fields (16/16 pilot, 32/32 confirm);
betrayal -> 'betrayal', table trial -> 'the table trial',
coalition arena -> 'the coalition arena', alien-hostile ->
'a stranger' (knowledge-gated, not 'an alien'), each 8/8 pilot
and 16/16 confirm in all fields; wild control stays 'the wild';
0 unintended label changes, 0 non-label field differences,
0 field disagreements; proof 32/32 including real-tbEnd legs
for all 6 origins; arenalabel proof updated to the new labels
(13/13), grantdeath proof 8/8. check.js --quick incomplete
(open item, sibling runs concurrent).

## Verdict (judged against the pre-registered bar, not re-scored): Leg A PILOT-GO + CONFIRM-GO; Leg B PILOT-GO + CONFIRM-GO on all four origins — ready for coordinator merge, pending ship
