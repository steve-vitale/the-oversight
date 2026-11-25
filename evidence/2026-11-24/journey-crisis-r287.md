# Journey crisis r287 — RUN NOTE (Lane B, leg 6)

**Run:** `playtest-loop2-20261125T0100Z`, scheduled 19:00 CST Tue 2026-11-24 / 01:00Z.
Adoption chain: the 2200Z occurrence froze the prereg, implemented L1/L2
(proof 23/23) and cloned the r278 tooling, then ran seeds 14602 (22:48Z)
and 14603 (22:52Z) before dying; the 00:00Z occurrence ran seed 14604
(00:01Z) and died (lock `playtest-loop2-20261125T0000Z` 23:59:21Z,
heartbeat 23:59:37Z, no live coordinator process, no live agent owned by
`oversight-playtest-loop-2` — stale-lock recovery, lock deleted, new lock
`playtest-loop2-20261125T0100Z` 01:36:33Z). This occurrence adopted the
r287 branch, rebased it cleanly onto master `d6678e929` (3/3 picks, no
conflicts), re-ran the proof test green (23/23), and played the frozen
prereg's pilot + after-panel + fresh band. No judged sim had run under
the frozen prereg before this occurrence's pilot — the prereg's freeze
still binds.
**Base:** master `d6678e929` (sim-winnability-round-2230). The only src/
change between the r287 branch base (`4c1bb482e`) and this master is a
version bump — the 2200Z/00:00Z stale seed files ran on effectively
identical game code; the after-panel re-ran all six seeds on the
rebased code anyway.
**Rotation-b:** read 6 (crisis) at run start; this run writes 7.
**Canon:** `git log 6d841a318..d6678e929` on CANON.md, DISEASES.md,
MONSTER-WAVES.md, CONTESTS.md, CONVERSATIONS.md, MEASUREMENT.md,
DIRECTIVES.md is EMPTY — r278's canon read stands unchanged.
**Pre-flight:** main tree clean, disk 55%. `worktree-reap.sh` ran:
active 16/16 (cap full — this run adopted the registered
`journey2-crisis` tree rather than registering fresh); LOUD lines
about `sim-homecraft-gate-a` and `journey-scale` having uncommitted
changes (other loops' trees; the reaper correctly refuses them — not
this run's). Orphan `journey2-4` tree (not in the registry, locked)
shows 111,764 files staged-deleted in its index while the files exist
on disk — the known safe-commit index clobber at full-repo scale;
not this run's tree, untouched, flagged here for the main agent.

## Leg question (binding, from the frozen prereg)

r278 landed four fixes and the named residual days went clean, but the
stall count moved 2→3/4 via NEW days. This run builds r278's named
next levers for the two residual mechanisms (L1 edge-exit discipline,
L2 no-repeat-geometry wait — both policy-side in `oracleV2.js`, no
src/js change) and re-panels before/after on identical seeds plus a
fresh band. C3b is REPORT-ONLY this run (no fix); its bar (0) still
judges.

## Pre-registered metrics — verdicts (binding, §14)

| Metric | Pilot (14599–14601) | After (14599–14604) | Fresh (14608–14610) | Bar | Verdict |
|---|---|---|---|---|---|
| FIGHT-STALL-FIGHT (R264 split, ≥10 failed calls/day) | 0 stall days — named days 14600 d43/d73, 14601 d52 ALL CLEAR | **1** — 14603 d83 (10 failed calls) | 0 | 0 | **NO-GO** |
| FIGHT-STALL-TRAVEL | 0 | 0 | 0 | 0 | GO |
| DOWNEDTWICE | 0 dups | 0 dups | 0 dups | 0 | GO |
| C3b-TRANSCRIPT | TRUE 4 (same Alba pair as r278) | TRUE 4 | TRUE 0 | 0 | **NO-GO** |
| DRY | 0 | 0 | 0 | 0 | GO |
| WRAP | — | 48/48 marked, 0 unmarked | — | 0 | GO |
| M12 | 0 repeats | 0 repeats | 0 repeats | 0 | GO |
| ORACLE-CTX secondary | waited_edge 107 / waited_close 350 (after totals) | — | waited_edge 80 / waited_close 0 | — | measured |

R262 line-count cross-check: **GO — 0 line stall days.** The named days
collapsed on lines too: 14600 d43 119→4 lines, 14601 d52 11→5,
14603 d83 5→4. The R262/R264 disagreement stands (metric review item 2):
judge on the R264 split per the frozen rule.

## What the levers did

- **L1 (edge-exit discipline):** the pilot's named edge-tile days are
  gone. 14600 d43 (236 failed calls in r278) and 14601 d52 (236) show
  0 failed calls; 14600 d73 (22) shows 0. The waits fire and are
  narrated ("You wait. The light changes. Nothing asks anything of
  you.").
- **L2 (no-repeat-geometry wait):** `waited_close` fired 350 times
  across the after-panel — and the fights RESOLVED, not just quieter:
  seed 14600 paired 230 close-waits with 260 strikes and 19 flees;
  seed 14601 paired 113 close-waits with 50 strikes and 20 flees
  (metric review item 1 satisfied: waits show as strike/flee/dissolve
  resolutions in stuckTrace + sayLines).
- **After-panel: 3→1 stall days vs r278. Fresh band: 1/2→0/3.**
  The stall fight is narrower than four fixes ago — but not gone.

## Residual stall day — MECHANISM C (new, named this run)

**14603 d83, 10 failed calls (30 in r278).** Two fights in one day
(buffering, then redactor). Player (4,6), moveLeft 3, redactor (2,3)
hp 227; edge paths west 4 / east 4 / south 2 — edge-REACHABLE, not a
sealed pocket. The trace shows L1/L2 firing (wait-edge ×5, wait-close
×7 on the buffering fight, flees ×6) — and the fight still burning the
day:

- The close's `findPath` returns null (unpathable ground between
  player and monster, 3 squares out, weapon range 1) — "Too far — 3
  squares left." ×6.
- The flee's pushThrough fails ×5 — "You hurl yourself at the barrier
  — no escape that way. The fight continues here."
- **The monster repositions.** The buffering monster rewinds ("It
  stutters backward — three seconds ago it was THERE." ×3), changing
  its tile — and L2's gate only waits when the geometry is IDENTICAL
  to the last failed flee. Every rewind re-arms the close probe: one
  more failed call, one more flee, then the wait re-engages. Ten
  failed calls across the day, six of them silent (only 4 "No path
  there." lines reach the player).
- The fight DOES progress through the ally: Karen hits buffering for
  28/25 seven times (~180 damage). The day ends with the fight
  dissolving at the boundary ("You camp wild tonight").
- **Fix shape (next run, not this one):** the wait must trigger on
  repeated failed closes within one fight-day regardless of geometry
  change once the stuck counter is high — or the game-side
  mutual-stall disengage (metric review item 10, carried): if neither
  side can reach the other for N turns, dissolve with honest
  narration. The policy-side wait is the stopgap; the disengage ends
  the day early where the wait only quiets it.

## C3b adjudication (both TRUE sittings read in full)

**After TRUE 4 — Alba Lindqvist, 14600 d32 + d33: CONFIRMED FALSE
SETTLEMENT** (same pair as r278, deterministic). Favor `forage_help`
BROKEN in both sittings ("You said you'd help with the pantry run.
...It's handled now, not by you. Forget it."). d32: the player picks
"We're square", the NPC answers "No — that one's settled. I just like
saying it out loud." — and the recap in the SAME sitting says "Still on
that debt." d33: the cant-close says "settled, and counted", the final
closer says "what's been happening, settled" — and the recap says "still
on that debt" TWICE ("Like I said — we're still on that debt",
"We're going in circles — still on that debt"). The closer and the recap
disagree about one debt in one conversation, twice over. C3b bar (0)
NOT met. The fix is the next run's lever (FIX 4 coverage gap, r278:
(a) mid-sitting dlg:cant settle lines aren't convoCloseLine; (b) the
closing line carries the label 'what's been happening', not 'that debt';
(c) the recap reads the thread label, not the favor state).
**Fresh TRUE 0** — no settlement claim at all on the fresh seeds (10
settledLines, all negation/vote/closer). The false-settlement shape did
not appear on fresh seeds.

## Village assessment (plain words)

Nine villages, 150-day horizon. **Four died out:** 14599 (day 97, 3
left, pantry empty), 14602 (day 109, 1 left, pantry empty), 14608
(day 148, 1 left, pantry empty), 14610 (day 124, NOBODY left — wiped
out with 10,448 still in the pantry; food wasn't the killer). **Five
reached the horizon, thin:** 14600 down to 3 people with a full pantry
(15,113); 14601 the most alive (7) and the hungriest (555); 14603
7 alive, 3,200; 14604 6 alive, 16,352 — the best-fed village; 14609
2 alive, pantry empty. Every village faced 6–15 raids; 48 driven
conversations after-panel + 24 fresh; fabricHits 0; 62 sortie fights
after-panel, 29 fresh. The villages that lived did so hungry or thin —
the village that reaches the endgame arrives exhausted, which is the
winnability question, not a crisis verdict.

## People check

72 transcripts read by the analyzer (48 after + 24 fresh); fabricHits
0; DRY/M12/DODGE/LINK-ACCEPT all GO. Three sittings read in full:

- **Alba (14600 d32/d33):** nursing a real grudge about a pantry run
  someone else finished ("It's handled now, not by you"), honest
  about it, and the conversation ends warmly ("This was good."). The
  defect is the game's own bookkeeping contradicting her
  mid-conversation (settled vs still-on-debt), not her voice.
- **Luise Jung (14601 d37):** proposes the Thornfield link from what
  she's heard ("We should link with them — we'd be stronger
  together"), teaches field lore plant by plant (mugwort, greenbrier,
  persimmon, water chestnut), declines an invitation honestly ("I
  can't. Not today. Ask me when the work's done."), then accepts the
  second ask ("Someone should watch your back. Might as well be me."),
  laughs at learning mesquite. A person, not a menu.
- **The d83 stall fight:** nobody talks; the fighter fails to move
  while Karen lands the hits and the monster rewinds. A person-shaped
  hole in the day — narrower than r278 (10 failed calls vs 236), but
  still a stuck screen the player watches.

## Instruments fixed this run

- **Analyzer now prints `waited_edge` / `waited_close`** in ORACLE-CTX
  (prereg §3 intended the panel to see them; the driver merged them
  but the analyzer never surfaced them — verified 0 hits in the pilot
  log). Display-only change to
  `scripts/analyze-crisis-r287-delayed-20261124.js`; re-ran the
  analyzer on the frozen after-panel JSONs (no re-simulation) and the
  totals print 107/350, matching direct JSON reads; the diff of the
  verdict lines shows ONLY the ORACLE-CTX panel gaining the two
  fields — every other verdict identical. Re-run log:
  `journey-crisis-r287-analyzer-after-waited.log`.
- Proof test re-run green after the rebase: 23/23
  (`scripts/test-journey-crisis-r287-fight-levers-20261124.js`).

## Metric review (carried + new)

1. (Carried, satisfied) The bar counts failed closes, not unresolved
   fights — L1/L2 must end or disengage the fight. The waits resolve:
   14600's 230 close-waits pair with 260 strikes; the d83 waits pair
   with flees and a day-boundary dissolve.
2. **NEW — R262 vs R264 is now a verdict split, not just a count
   gap:** R262 GO (0 line stall days) vs R264 NO-GO (1 call stall
   day). The frozen rule (judge on R264) stands. The d83 gap — 4
   visible lines vs 10 failed calls — shows most failed calls are
   silent programmatic retries; a player-visible count would
   understate the stall.
3. **NEW — Mechanism C** (repositioning monster defeats the
   no-repeat-geometry gate) is the next run's lever; the game-side
   mutual-stall disengage (item 10) stays the long-term fix.
4. **NEW — C3b fresh TRUE 0:** the false-settlement shape is absent
   on fresh seeds; the after-band hits are the same deterministic Alba
   pair. The fix stays next run's.
5. (Carried) The analyzer crashes on a partial panel dir (empty
   per-seed JSON) — the skip-empty guard proposed in r278 item 6 is
   still owed.
6. (Carried) Census corpses omit scholar deaths.
7. (Carried) R58 refused-sortie book check reads a field the driver
   never populates.
8. (Carried) MARCH-REFUSAL and TRAIL 3-PRESS have no dedicated
   analyzer section on this leg — judged by the people check only.
9. (Carried) Telemetry units open: `playerFights` /
   `latelyDefenseCount` keys absent from the per-seed JSONs.
10. (Carried) The game-side mutual-stall disengage is the long-term
    fix for mechanism B/C: if neither side can reach the other for N
    turns, dissolve the fight with honest narration instead of burning
    the day. NOT built this run (src/js/game.js change, own proof +
    gate).
11. (Carried) The flee's opening pushThrough return is unread:
    tbBarrierExit returns true for "consumed the push attempt" as well
    as for a real exit; L1 checks the fight state, not the return
    value. A game-side split (exit vs refused as distinct returns)
    would be cleaner; not this run.

## Reachable / fun / winnable verdict (leg 6, crisis)

- **REACHABLE: yes** — crisis content (raids, sieges, arena, favors,
  debts) fires on every seed; 6–15 raids per village, 8 driven
  conversations per seed, defense beats throughout. Nothing in this
  run was unreachable.
- **FUN: mixed, improving.** The conversations are the fun — real
  grudges, gratitude, secrets, and the village carrying on after the
  scholar dies. The fights are better: the named stall days are gone
  and the worst remaining day burns 10 failed calls instead of 236 —
  but d83 is still a day the player watches a stuck defender while
  the monster rewinds. The stall fight is narrower, not gone.
- **WINNABLE: no verdict from this leg** — crisis is the middle of
  the run, not the win; no village here reached the table. What this
  run shows is that the crisis middle is survivable (5/9 villages
  reached day 150) but thin — the village that reaches the endgame
  arrives exhausted.

## Overall run verdict: NO-GO on the frozen bars — levers land

FIGHT-STALL 1/6 after + 0/3 fresh vs bar 0; C3b TRUE 4 vs bar 0. The
bars are not met. But L1/L2 land (proofs green, panel-measured):
named stall days cleared, after-panel 3→1, fresh band 1/2→0/3, d83
failed calls 30→10, R262 line-count GO. The next run's levers are
named above: mechanism C (geometry-change-tolerant wait) and the C3b
FIX 4 coverage gap — plus the long-term game-side mutual-stall
disengage.

## Evidence

- Prereg: `evidence/2026-11-24/journey-crisis-r287-prereg.md`
  (frozen 2200Z, adopted verbatim)
- Driver: `scripts/journey-crisis-r287-delayed-20261124.js`
- Analyzer: `scripts/analyze-crisis-r287-delayed-20261124.js`
  (+ waited_* print, this run)
- Panel: `scripts/journey-crisis-r287-panel-20261124.sh`
- L1/L2: `scripts/policies/oracleV2.js` (+150/−10) + proof
  `scripts/test-journey-crisis-r287-fight-levers-20261124.js` (23/23)
- Per-seed corpora + analyzer logs:
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-11-24/journey-crisis-r287-delayed-seed{14599..14604}.json`,
  `.../fresh/journey-crisis-r287-delayed-seed{14608..14610}.json`,
  `journey-crisis-r287-analyzer-{pilot,after,fresh}.log`
  (pilot log's 6-seed read mixed this run's pilot with the dead
  2200Z/00:00Z runs' stale 14602–14604 files; the after log is the
  judged panel — all six seeds re-run on the rebased code)
- Stale 2200Z/00:00Z corpora preserved at `/tmp/r287-seed1460{2,3,4}-stale.json`
  for the d83 analysis (same game code modulo a version bump)
