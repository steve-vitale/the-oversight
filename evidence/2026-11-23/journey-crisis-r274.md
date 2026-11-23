# Journey — Crisis r274

**Run:** `playtest-loop-2-20261123T1100Z`, scheduled 05:00 CST Mon 2026-11-23 / 11:00Z.
**Seeds:** after-panel 14599–14601 (same-seed before/after; r264 BEFORE on
identical seeds) + fresh band 14602–14604. **Base:** master `70120c554`.
**Rotation-b read 6 at run start; this run writes 7 at closeout.**
**Prereg (frozen):** `evidence/2026-11-23/journey-crisis-r274-prereg.md`.

## Leg question (prereg)

Build the two fixes r264 named, prove them, and re-panel before/after on
identical seeds plus a fresh band: (1) FIGHT-STALL disengage — the flee
fires 117×/day without closing the fight; (2) DOWNEDTWICE — the #2634
regression (aidFight entered twice for the same fall in the tick).

## Run-state handoff

- Lock: NO `playtest-loop-2.lock` existed at run start. Own lock created
  10:55:36Z, run_id `playtest-loop-2-20261123T1100Z`. Previous Lane B run
  (r270 endgame) finished and merged (`c2c6ed9eb`); the r268 social
  finisher advanced rotation 5→6. No `journey2-*` worktree existed; no
  live Lane B coordinator.
- Pre-flight: main tree clean at 10:55Z. Disk 46%. `git pull --ff-only`:
  already up to date (tip `70120c554`). `worktree-reap.sh`: exit 0,
  removed nothing, 11/16 active (LOUD dirty trees are other owners').
- Registration BLOCKED twice: (a) stale local branch `journey2-crisis`
  (r264 tip `52b71428f`, verified FULLY MERGED) — its delete failed on
  the flap; (b) the flap itself. See Flap below. Registration finally
  landed ~11:20Z (checkout ~8 min under load); heartbeat loop
  `journey2-crisis-hbloop-r274.sh` started 11:23:05Z (restarted after
  the machine replacement, hb 1 11:24:53Z).
- Machine replacement ~11:24Z (uptime 0 min at 11:24:43Z) killed the
  first probe run (probe JSON left 0 bytes) and the hbloop; heartbeat
  re-established first (registry 11:24:17Z, hbloop restarted), worktree
  verified intact (FIX 1 + all 5 staged files present), probe re-run.
- Canon read: `git log 8ec902e56..70120c554` on CANON.md, DISEASES.md,
  MONSTER-WAVES.md, CONTESTS.md, CONVERSATIONS.md, MEASUREMENT.md,
  DIRECTIVES.md is EMPTY — r264's canon read stands unchanged.

## Flap (window, this run)

Window active ~11:05Z–11:11Z (first `git branch -d` failure ~11:05Z;
O_EXCL probe OK 11:11:39Z). **Mechanism narrowed with strace proof:**
git opens the ref lock `O_RDWR|O_CREAT|O_EXCL|O_CLOEXEC` (open succeeds,
fd 3) and the first `write()` returns `-1 EPERM`. A python repro confirms
the discriminator: `open(O_EXCL)` succeeds, `write()` fails EPERM — in
BOTH `.git/refs/heads/` and `/tmp` — while plain `O_TRUNC` writes
(`printf > file`) succeed in the same minute in `/tmp`, home, and `.git/`.
The flap refuses writes on O_EXCL-opened fds; it is NOT "all fresh-file
writes". Prior phrasing ("fresh-file writes fail") is too broad. The
0-byte leftover `.lock` probe files in `.git/refs/heads/` (flap-mimic,
probe-*, `__oexcl_test__`) are consistent: open succeeds, write refused,
0-byte file left behind. Nothing was lost; the branch delete + registration
went through once the window cleared.

## FIX 1 — DOWNEDTWICE (aidAllyDown per-ally+day dedup)

`src/js/comms.js`, `aidAllyDown`: a per-(villageId, allyName, day) dedup
guard at the top of the function, before any say. The seen-map
(`this.state._aidAllyDownSeen = {day, keys}`) resets when the day
changes, so it never grows past one day's falls. Returns false when
deduped. The #2634 transition guard only covers one `fieldFight` call;
this guards the function itself, so every double-entry path is harmless.
Proof: `scripts/test-journey-crisis-r274-aidallydown-20261123.js` —
RED before (second call returned true), **19/19 GREEN after** (second
call same day returns false, trust/debt unmoved, no second line;
different ally same day still applies; same ally next day applies;
no-link fall says once and dedups).

## STALL-GEOMETRY probe (instrument D) — the fix shape

Probe: seed 14601 on code with FIX 1 only (comms.js — no fight-path
effect). Reproduced r264's stall days exactly (d26: 237, d84: 11,
d103: 237, d144: 241 failed calls). Geometry snapshots (one per stall
day, `rec.stallGeometry`):

| Day | Player | Monster | Edge paths (findPath lengths) | Shape |
|-----|--------|---------|-------------------------------|-------|
| 26 | (4,7) mvLeft 1 | sweeps_week (3,4) hp 80 | W 4, E –, N 12, S 1 | EDGE-REACHABLE |
| 84 | (2,5) mvLeft 3 | algorithm (4,5) hp 438 | W –, E –, N –, S 3 | EDGE-REACHABLE |
| 103 | (4,7) mvLeft 3 | algorithm (5,0) hp 750 | W 5, E –, N –, S 1 | EDGE-REACHABLE |
| 144 | (4,1) mvLeft 1 | chorus_line (3,6) hp 312 | W 4, E 4, N 1, S 10 | EDGE-REACHABLE |

**Every stall day is EDGE-REACHABLE — the pocket is not sealed.** The
failure mix names the mechanism: d26/d144 are 236–237 "Too far" lines
and 0 "No path there."; d103 is 119 "No path there." (the close attempt
— the monster sits across unpathable ground) + 117 "Too far" (the flee).
The fighter is slowed (`tbBeginTurn`: moveLeft = speed × seMoveMod,
1–3 here) and the old flee aimed at the west/east edge at the current
row — a 4–5 step path it cannot afford — while a 1-step edge sits open
(d26 south, d103 south, d144 north). The fix is a smarter flee, not a
game-side disengage.

## FIX 2 — FIGHT-STALL (nearest-affordable-edge flee)

`scripts/policies/oracleV2.js`, `flee()`: instead of the fixed
`(0,py)`/`(8,py)` target, the flee now considers every edge tile on all
four edges, computes each tile's path COST (`tbTerrainCost` summed over
the `findPath` path), and moves to the cheapest tile whose cost fits
this turn's `moveLeft`; then `pushThrough()`. If no edge tile is
affordable, it falls back to the old target (fails honestly — the stall
is still reported, not hidden). The close attempt is untouched (a
distant-but-pathable target still flees at 3; the staged approach stays
a separate change per the r262 note).
Proof: `scripts/test-journey-crisis-r274-nearest-edge-20261123.js` —
**8/8 GREEN** (flee fires after 3 stuck turns; its move targets the
1-step south edge (4,8), never the 4-step west edge; the barrier exit is
attempted with the player on the edge; ≤4 failed moves across 3 turns;
no-affordable-edge fallback aims at the old target and never reaches
the barrier). The r264 stuck-trace proof still passes 16/16.

## Panel numbers

After-panel (FIXED code, seeds 14599–14601, base `70120c554` + FIX 1 + FIX 2;
r264 BEFORE on the same seeds in brackets):

| Metric | r264 BEFORE | r274 AFTER | Bar | Verdict |
|--------|-------------|------------|-----|---------|
| FIGHT-STALL fight / travel stall-days | 9 / 0 | **2 / 0** | 0 / 0 | **NO-GO** |
| DOWNEDTWICE duplicate groups | 1 | **0** | 0 | **GO** |
| C3b false settlements | (r264: GO) | 4 true hits, adjudicated genuine | 0 | **GO** |
| DRY dry lines | 0 | **0** | 0 | **GO** |
| WRAP wrapMissing | false | **false** (all 3 seeds) | 0 unmarked | **GO** |
| M12 same-reason repeats | 0 | **0** | 0 | **GO** |
| ORACLE-CTX fled / fled_unreachable / struck / engagedFavored | 750 / 618 / 71 / 3 | **311 / 28 / 109 / 4** | measured | — |

Fresh band (seeds 14602–14604): FIGHT-STALL **1 / 0 NO-GO**; DOWNEDTWICE
**GO** (5 goes-down lines, 0 dup groups); C3b **TRUE 1 — NO-GO** (see below);
DRY GO; WRAP GO (wrapMissing false, all 3); M12 GO.

## FIGHT-STALL — NO-GO (2 after / 1 fresh; was 9)

FIX 2 works — the wild-field edge-reachable stalls are gone. The r264
probe's four stall days (d26/d84/d103/d144, all edge-reachable wild-field)
do not recur on the after-panel; no stall day on seed 14599 at all, and
the unreachable-flee count collapsed 618 → 28 (−95%). The residual is
three stall days across six seeds, each a DIFFERENT mechanism — none of
them is the r264 "flee aims at the wrong tile" shape:

1. **14600 d78 (12 failed calls) — SEALED POCKET.** Player (3,3), monster
   `spool` (2,2) hp 205; every edge path null. STUCK-TRACE: maxStuck 0,
   flees 0 — the close counter never engages. The failing call is the
   flee's move (oracleV2.js:350, via v2Fight:401 — a neardeath/outmatched
   flee, not the unreachable one). The monster is ADJACENT (distance 1,
   in range) — the policy flees on low HP before considering the strike,
   and the flee cannot reach any edge. Next lever: when the monster is
   in range and the pocket is sealed, strike instead of fleeing.
2. **14601 d100 (13 failed calls) — SEALED ARENA.** Player (1,0),
   monster `callback` (4,4) hp 279; edges reachable (W 1, E 7, N 1, S 8)
   but `arenaContest: true` — the barrier holds, the fight cannot end by
   leaving. STUCK-TRACE: stable key, maxStuck 13, flees 11. The flee
   fires 11×, moves to the edge fine (FIX 2 works), the barrier exit is
   consumed but the fight does NOT end — and the close attempt fails
   13× (the monster sits where the player cannot reach it). Next lever:
   in a sealed arena the flee must not fire — close and fight instead.
3. **14603 d127 (23 failed calls, fresh) — NO AFFORDABLE EDGE.**
   Player (7,4) moveLeft 1, monster `voice_mimic_radio` (4,5) hp 61;
   edges reachable but cheapest costs 4 (south), north 6 — both over
   this turn's moveLeft 1, every turn (the fighter stays slowed).
   STUCK-TRACE: maxStuck 1, flees 0 (unreachable-flee counter) — the
   failures are the repeated neardeath/outmatched flee (v2Fight:401)
   falling back to the old target and failing honestly. Next lever:
   partial-progress flee — when no edge tile is affordable, target the
   farthest tile along the cheapest edge's path that fits moveLeft, so
   the fighter walks toward the exit turn by turn instead of failing
   in place.

The bar (0) is not met, so the leg question's first half is NO-GO —
but the residual is 3 stall-days on 6 seeds (was 9 on 3), all
characterized, with a named lever each. The next round takes those
three levers; no re-keying of the counter was needed or done.

## DOWNEDTWICE — GO

0 goes-down lines after-panel, 0 duplicate groups; fresh band 5 lines,
0 duplicate groups. FIX 1 holds in the wild — the double-entry layer
is closed.

## C3b — GO after-panel; NO-GO fresh (1 false settlement)

After-panel: 5 settled lines, 0 negation, 0 vote, 1 closer, 4 true —
all 4 true hits in ONE sitting (14600 d41, Alba Lindqvist). Adjudicated
GENUINE: the favor was `heal_help`, state `thanked`, "already closed";
the player did the healing, the NPC thanked them, both agreed "we're
square." The closer ("that debt, settled") matches what happened.
C3b GO after-panel.

Fresh band: 1 true hit (14603 d84, Raul Schumacher) — adjudicated
FALSE. The favor is `water_haul`, state `broken` ("This creek request
is closed"); the NPC says the promise is dead but the need is still
open, and on "Don't worry about it" answers "...Fine. But I don't like
owing." — **"The debt stays on their face."** The recap still says
"Still on that debt." Then the silence-ending closer declares "Good —
that debt, settled. Feels better said out loud." — contradicting the
conversation's own content. The closer fires unconditionally on the
silence ending, whether or not the debt was settled. Next lever: gate
the "settled" closer on the favor/debt state (broken/open → no
"settled" line). The fresh negation hit (14602 d13, Maya Sanchez:
"Nobody's settled it" about Mateo's ambush) is correctly a negation —
the matter genuinely is unresolved there.

## DRY — GO

0 dry lines after-panel and fresh. 24 transcripts each band.

## WRAP — GO

wrapMissing false on all 6 seeds, both bands. Every ending is marked.

## M12 — GO

0 same-reason repeats after-panel and fresh. (Mild note: the d41 Alba
sitting recaps "still on that debt" three times with different wording —
the driver's recap picks circle the topic, but the reasons differ, so
M12 does not trip.)

## People check — PASS (fabricHits 0)

Four sittings read in full (14599 d8 Kenji Sato; 14600 d41 Alba
Lindqvist; 14601 d62 Luise Jung; fresh 14602 d13 Maya Sanchez):

- **Kenji (d8):** a real secret with stakes — confronted about
  something odd he said, he admits he's from Seattle, not Denver, and
  was protecting someone else. A second confrontation is correctly
  deflected ("We went over this... I already told you the truth").
  A trust beat hands over a real tool ("I made an extra"). Ends warm:
  "Same time tomorrow, maybe."
- **Alba (d41):** gratitude for a wound tended, a genuine settlement
  both sides agree on, then regrets that land ("I didn't say what I
  needed to say. To someone. Now I can't." / "I'd pay anything for one
  annoyed morning now."). The NPC wants something (to close the debt)
  and the options engage it.
- **Luise (d62):** a link proposal to The Bloodied the player carries
  ("We should link with them — we'd be stronger together"), a hidden
  thinking-place shown in trust, a question about the player's past
  with a real consequence for deflecting ("Their face closes like a
  door").
- **Maya (d13, fresh):** the richest sitting — a saved candy bar, the
  ambush of Mateo unresolved, a real investigation (no witnesses, a
  bribery trail "still warm"), a vote that counts, a secret kept
  ("That stays between us"). The NPC wants the truth about Mateo and
  the options pursue it.

No fabricated shared history, no filler loops, no static menus.
fabricHits 0. One small observation: the transcript renders the vote
line as "⚖️ VOTE: GUILTY" — the game's own text carries a scales
glyph there (text, not a sprite; noted, not a failure).

## Village assessment

Plain words: the villages live through the crisis leg and keep going —
deaths happen (first death days 48–74 on the fresh band, death cleanups
16, no dead holders left behind), plans seed early (first plan day
6–7), and people keep talking, linking, and settling debts. The
fights are the pinch point: a slowed fighter can still get stuck in
a pocket or a sealed arena, and the endgame gate stays shut — THE
HERALD refused 20 times on the fresh band ("muster 10 allied blades
(you have 0)"), the same line on twelve different days. The village
never musters. That is the winnability wall behind this leg, unchanged
by this run's fixes.

## Metric review

1. The bar counts failed closes, not unresolved fights (carried from
   r264 item 7) — FIX 2 was judged on the fight ENDING, and the
   after-panel shows it: the flee now succeeds and the wild-field
   stalls are gone. The residual stall days are not failed closes —
   they are sealed pockets, sealed arenas, and unaffordable edges.
   The bar held (0) and the run is honestly NO-GO on it; the metric
   is not the problem, the three mechanisms are.
2. The write-flap phrasing in the standing record is too broad (see
   Flap above): the discriminator is writes on O_EXCL-opened fds,
   not "all fresh-file writes." Strace + python repro this run.
3. C3b's "true" bucket needs the adjudication step every run — the
   after-panel's 4 true hits were genuine and the fresh band's 1 was
   false. The bucket alone cannot tell them apart; the sitting read
   can. Keep the adjudication.
4. ORACLE-CTX's `fled_unreachable` is the cleanest FIX 2 signal
   (618 → 28). The next round should pre-register it as the
   secondary metric for the three residual levers.

## Gate — PASS on the standing-5 basis (finisher #2, 1300Z)

`node scripts/check.js --quick --cacheDirectory=/tmp/jest-cache-r274-gate`
in the worktree on the rebased tip (`13793c1a5`, on master `c60b3c4e5`):
**337 passed, 7 failed in 1040s** (log
`hidden_files/journey-crisis-r274-gate.log`). The 7 failures: the
standing 5 exactly — phone-frame stale receipt
(`test-phone-frame-proof.js`), two 120s deed-attainment timeouts
(`test-living-garden-deed-attainment.js`,
`test-one-person-army-deed-attainment.js`), measurement-proof staleness
pair (`test-measurement-proof-update.js`,
`test-measurement-workflow.js`, failing identically on r156/r155/r151,
pre-existing staleness) — plus 2 extra 120s TIMEOUTs under load
(`test-trust-observer-neutrality.js`, `test-capable-bot-20261014.js`),
both re-run standalone GREEN after the gate (6/0 and 40/0; log
`hidden_files/journey-crisis-r274-timeout-reruns.log`). 0 failures
attributable to this run's changes (comms.js dedup, oracleV2.js flee);
neither file appears in the gate log. Gate verdict: PASS.
Proofs re-run on the rebased tip before the gate: DOWNEDTWICE 19/19,
FIGHT-STALL nearest-edge 8/8, r264 stuck-trace 16/16.

## Closeout — PENDING (finisher handoff)

- Worktree: `~/workspace/worktrees/journey2-crisis`, branch
  `journey2-crisis`, base `70120c554`. Committed below (safe-commit);
  NOT merged. **MASTER MOVED during this run:** Lane A r273 landed
  (`cc5fc220a`, `db2e9a3df`) + ship version bump (`fdd7042b8`) — the
  finisher MUST rebase `journey2-crisis` onto `fdd7042b8` and re-run
  both proof tests before merging (ff-only will fail on the stale
  base). The 3 new commits touch NONE of this run's files, so the
  rebase should be clean. Lock `hidden_files/playtest-loop-2.lock`
  still held (run_id `playtest-loop-2-20261123T1100Z`) — DO NOT
  delete until the merge lands; the lock protects the unmerged
  worktree from the next Lane B run.
- Finisher steps, in order: (1) re-verify worktree state + heartbeat;
  (2) gate (see above); (3) `git merge --ff-only journey2-crisis`
  in the main tree (rebase + re-run proofs first if master moved);
  (4) `bash scripts/worktree-release.sh journey2-crisis merged`,
  `git worktree remove --force` + `git branch -d journey2-crisis`,
  `bash scripts/worktree-reap.sh`; verify main tree clean; (5) write
  rotation-b 6→7 (read back); (6) delete the lock LAST, same-call
  per-line run_id match; (7) telemetry check
  (`--baseline .../telemetry-baselines/crisis.json --metrics
  defendedFights`); (8) append to `~/memory/2026-11-23.md` and the
  goal tracking entry if not already done.
- Do NOT bump, push, or verify live — the ship loop owns those.

## Finisher #2 — 1300Z occurrence (this run)

The 1100Z occurrence timed out before the gate; finisher #1 (chat agent
47860c77, spawned ~11:50Z) paused before the rebase after ~3 min and
completed with closeout unfinished. This 1300Z occurrence adopted the
closeout instead of playing a fresh leg (rotation still read 6; the
`journey2-crisis` slug/branch/lock were still held by r274, so a fresh
run would have collided). Overlap guard at 12:55Z: lock held
`playtest-loop-2-20261123T1100Z` (2h old); registry heartbeat 24 min
stale — but the staleness was a registry-lock jam (hbloop log: "registry
lock held > 120s" at 12:36/12:43/12:50Z, Lane A registration holding it),
not a live coordinator: the occurrence had timed out, finisher #1 was
done, no live r274 coordinator processes. Lock NOT deleted (it protects
the unmerged branch); this run finishes the closeout it guards.

- Rebase: first pass wrongly onto `origin/master` (`fdd7042b8`, stale —
  local master is ahead, pending ship); re-did onto local master
  `c60b3c4e5`, clean, both commits replayed exactly once (new tip
  `13793c1a5` → this gate-section commit). No file overlap between
  r274's 9 files and the 8 commits since base `70120c554`.
- Proofs re-run on the rebased tip: DOWNEDTWICE 19/19, FIGHT-STALL
  nearest-edge 8/8, r264 stuck-trace 16/16 (all GREEN).
- Gate: see Gate section above (337/7, standing-5 PASS).
- Merge: ff-only into master `c60b3c4e5` (tip recorded in the memory
  note); release/reap; rotation-b 6→7; telemetry check; lock deleted
  LAST. No push, no bump, no live verification — ship loop owns those.
