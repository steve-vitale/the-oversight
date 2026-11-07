# sim-routstall-b — the 159-round rout, diagnosed (DIAG ONLY, zero src/js)

- Run: `fleshout-loop-b-20261106T2300Z`, Loop B, arm `sim-routstall-b`,
  worktree `~/workspace/worktrees/sim-routstall-b`, branch `sim-routstall-b`
  (base 987766c0c; rebased onto master 82e55062 — see §9).
- Question (finding #1825, Loop A arm sim-baseline9-a,
  evidence/2026-11-06/sim-baseline9-a.md §4): seed 53001 day 41,
  Congregation, BOTH legs, 159 rounds, scholar HP 1.0 at end, monster at
  ~0.59 (0.584 baseline, 0.597 staged), outcome 'routed'. A fight neither
  side can finish, identical across legs on the same seed.
- Verdict: **DIAG-GO** — D1, D2, D3 all GO (see §1). Classification:
  **POLICY LOOP** (primary) — two stacked policy loops against a
  beam monster whose beams cannot hit an off-axis target behind tree
  cover — terminated correctly by the engine's whiff-forever guard.
  NOT a harness artifact, NOT designed attrition, NOT a monster flee.
- No new seed band consumed: deterministic reproduction of 53001 at the
  confirm anchor + existing corpora only.

## 1. Prereg verdict (judged against the header, §14)

- **D1 deterministic reproduction — GO.** Re-ran seed 53001 at the
  confirm anchor `2ff11cbfadfd` (the stageally-confirm corpus's own
  anchor) with the fightinterior recorder + a tbEnd call-stack recorder,
  150d death-aware, both policies verbatim. The reproduction is
  BIT-IDENTICAL to the confirm corpus for the whole run, not just the
  fight: baseline days 75 / village-lost / standing 125; staged days 51
  / village-lost / standing 125; all 9 baseline + 14 staged tbFight rows
  field-identical (the only diffs are the two trace-link fields the
  fightinterior instrument adds, `traceSeq`/`traceEnding`);
  `waveKillLog`, `killsLive`, `scholarDeaths` identical on both legs.
  The Congregation row reproduces exactly on both legs: day 41,
  159 rounds, scholar HP 1.0, beast 0.584 baseline / 0.597 staged.
  Proof `scripts/test-routstall-20261106.js` E-block: 10/10 corpus
  checks green.
- **D1 caveat (the exact reproduction condition).** On CURRENT master
  the same seed does NOT reproduce the fight: a 45d baseline run at
  06dc1dc4c diverged before day 41 (first TB fight day 29 Buffering,
  not day 33 Spool; no wave-4 TB fight in 45 days). The game moved
  between the anchor and now (armor retune K=20→6, wanderspawn HP fix,
  drive-practice, midnightkill matcher) and the sim path is chaotic —
  small damage changes re-route the whole run. So the reproduction
  condition is: **the fight reproduces deterministically at the confirm
  anchor 2ff11cbfadfd; on current master the run path diverges before
  day 41 and the exact fight does not re-occur.** The stall MECHANISM
  (below) is anchor-independent — it is made of the competent policy,
  the crossbow-ammo rule, the beam lane geometry, and the whiff guard,
  all still present on current master (line numbers in §3 are given for
  both the anchor and current master).
- **D2 round-by-round verb + HP census — GO.** Full census in §2/§4:
  every verb, hit, and turn of the 159 rounds, both legs, plus
  positions (scholar (8,1) all fight; monster (5,5) all fight) and the
  fight's own say lines.
- **D3 terminating condition named in code — GO.** The whiff-forever
  guard, `src/js/game.js` (anchor 2ff11cbf: `tbRoundWrap`
  guard at :37770–:37801, `WHIFF_ROUNDS = 120` at :37787; current
  master: :37929/:37942), firing through `tbEndCheck`'s routed branch
  (anchor :45310; current master :45479). The recorded tbEnd stack
  proves the path (see §3). The harness time-freeze watchdog never
  fired (frozenSleeps 0, no frozen streaks).

## 2. What the stall is (the census)

Baseline leg (staged differs only where noted). Entry: Congregation
900/900 HP, scholar full HP, no allies (baseline) / 1 ally
(Nino Kapanadze, 94/100 HP) staged. Scholar at (8,1) — a grid-edge
tile — for all 158 recorded verbs; monster at (5,5) for the whole
fight; neither ever moves again after round 1.

| Phase | Rounds | Scholar verbs | Damage |
|---|---|---|---|
| Opening | 1 | 1× move to (8,1) (ok) | 0 |
| Rage loop | 2–30 | 29× `rage` / `unleash_rage` (all ok) | 0 |
| Real fight | 31–38 | 8× strike (all ok) | 374 (70, 68, 78, 31, 28, 32, 33, 34) |
| Empty-crossbow loop | 39–158 | 120× strike (all ok:false) | 0 |
| Close | 159 | — (guard fires at the round wrap) | 0 |

- **Monster side:** 158 monster turns, 0 hits, 0 damage dealt, 0 damage
  taken after round 38. Its Absolution beam fires 79 times ("The
  steeple RINGS", "ABSOLUTION falls like a beam" — 79 each); 24 of the
  resolves die on tree cover ("The light shreds leaves and dies
  against the trees. Cover works."); the other 55 fire down lanes that
  never contain the scholar's tile. The scholar is never hit, never
  targeted successfully, in 159 rounds.
- **Staged leg:** identical shape plus 1× rally in round 1 (the rally
  displaced round 1's strike — scholarStruckRallyRound false, as
  fightinterior-b measured). The 8 hits total 363 (70, 68, 70, 33, 29,
  28, 34, 31 — the same 3 rage-doubled + 5 normal shape; the 11-point
  gap vs baseline is the RNG on the strikes). Nino takes 158 villager
  turns and deals 0 damage, takes 0 damage — a spectator to the same
  stall. The staged monster ends at 537/900 (0.597) vs baseline
  526/900 (0.584) purely from the 11-point strike difference; the ally
  accounts for none of it.
- **The 8 hits, decoded:** the first three are rage-doubled ("Your next
  3 strikes deal +100% damage") at 70/68/78; the next five are normal
  crossbow strikes ~28–34; each hit notes "(congregation's hide
  absorbs 10)". The scholar's weapon is a crossbow with exactly 8
  bolts: after round 38 the quiver is empty and every further strike
  says "No bolt left. Your Crossbow is a stick you hold wrong." — 120
  times, once per failed strike.
- **The rage loop, decoded:** the policy's `abilityPressPlay` step 5
  ("winning and non-trivial: press the advantage — rage") fires before
  the strike every round while the scholar is at full HP. Each press
  costs 60 kcal ("−60 kcal — food becomes rage", ×29 = 1,740 kcal
  burned on re-presses) and, per the ragerepress-b finding, re-pressing
  rage is refresh churn — 0 doubled strikes beyond the first press's
  3-strike window. So the scholar spends rounds 2–30 re-roaring instead
  of firing the 8 bolts it holds, and only starts striking when rage
  can no longer be pressed.
- **The opening move, decoded:** round 1's single move to the edge
  (8,1) is consistent with the policy's one-shot walk-away assessment
  (new-fight assessment: 900 total monster HP vs a ~100-max-HP scholar
  trips the 2.5× bar; the assessment runs once per fight,
  `ctx._fightObj !== f`). The policy then never revisits fleeing — the
  35% eject never fires at full HP — so the scholar stands ON the grid
  edge for 158 rounds and never pushes through the barrier. The
  walk-away has no persistence: one step, then forgotten.
- **The monster's half of the stall:** the Congregation never steps,
  never re-aims, never closes. A beam fires down a fixed lane
  ("cannot re-aim once announced"), and the scholar at (8,1) is
  off-axis from (5,5) (delta 3,−4 — on no row, column, or diagonal),
  so the lane never contains the scholar's tile; where the lane is
  tree-blocked at declare time the beam dies on cover. The monster's
  BLOCKED-LANE REPOSITION never triggers — the beam declares and
  fires, so there is no "blocked lane" to reposition for; it just
  keeps firing a beam that cannot hit. No reposition, no fallback to
  closing in, for 79 beams.

## 3. What ends it (D3 — the terminating condition, in code)

The **whiff-forever guard** in `tbRoundWrap`
(`src/js/game.js`, anchor 2ff11cbf :37770–:37801; current master
:37929–:37942), built by longsim scale-wall r24 arm 2 (finding #108)
for exactly this class — "a fight where NOBODY loses HP for
WHIFF_ROUNDS consecutive rounds is not a fight, it's a softlock":

- `WHIFF_ROUNDS = 120` (anchor :37787; current :37929).
- Each round wrap, damage across all fighters is summed; no damage
  increments `f._whiffRounds`, any damage resets it (anchor :37800).
- At 120, if both sides are still living and no reinforcements are
  incoming, the guard marks every live monster fled, says "It comes
  apart — no one in reach, no one chasing. The fight ends; they melt
  back into the wilds.", and calls `tbEndCheck()` (anchor :37801–:37815).
- `tbEndCheck` then takes its routed branch — no monsters fighting but
  monsters alive: `if (!monstersFighting.length) {
  this.tbEnd(monstersAlive ? 'routed' : 'won'); ... }` (anchor
  :45310; current master :45479).

Arithmetic, measured: last damage round 38; no-damage rounds 39–158
= 120 consecutive rounds; the guard fires at the round-159 wrap and
`f.round` reads 159 at close. The recorded tbEnd stack proves the
path (both legs, frozenSleeps 0):

```
Game.tbEnd <- tbEndCheck (game.js:45310) <- encounters.js:3045
  <- party.js:1293 <- sigW5.js:1579 <- tbRoundWrap (game.js:37817)
```

(the three wrappers are pass-throughs). The harness time-freeze
watchdog is NOT in the stack, fired 0 times across both 150d runs
(`frozenStreaks: []`, `timeFreezeCleared` never incremented) — the
fight ends inside one loop-day, long before the watchdog's 8 frozen
loop-days could engage.

## 4. Classification: policy loop — and what it is not

**POLICY LOOP (primary).** The stall is two stacked policy loops
plus a monster that cannot hit:

1. **Rage re-press loop (29 rounds).** The base competent policy's
   `abilityPressPlay` step 5 re-presses rage every winning round.
   Already known: ragerepress-b found re-press is refresh churn
   (NO-GO, variant policy deleted) — but the BASE policy still carries
   the same press, and here it eats 29 rounds and 1,740 kcal before a
   single bolt is fired.
2. **Empty-crossbow strike loop (120 rounds).** The policy strikes with
   a dry crossbow 120 times and never varies: no ammo check before
   striking, no weapon switch, no move to close, no wait, no flee. A
   failed strike (`ok:false`) is treated as a turn spent, not as
   information. The approach/close-distance branch never runs because
   the policy computes itself in range (Chebyshev anchor distance ≤
   weapon range) while the engine refuses on ammo — the range math is
   fine; the missing piece is the ammo/failed-verb check.
3. **Monster-side geometry stall (contributing, not primary).** The
   Congregation fires 79 beams that cannot hit an off-axis target
   behind tree cover and never repositions. This is the monster's half
   of "neither side can finish": even a perfect policy that closed in
   would still face a beam that whiffs from range — but the scholar
   never tests that, because the policy never closes.

**What it is not:**

- **Not a harness artifact.** The time-freeze watchdog never fired
  (frozenSleeps 0, empty frozen streaks, stack through tbRoundWrap not
  sim-harness.js). The 'routed' outcome is an engine outcome via the
  whiff guard, recorded identically in the instrument's closeTrace.
- **Not designed attrition.** Nothing is attrited for the last 120
  rounds: no HP moves on either side, no kcal pressure that matters
  (the scholar burns 1,740 kcal on rage, but starvation is not the
  fight's clock), no positional play. A 4–6 round wave-4 fight (canon
  bands, MONSTER-WAVES.md) stretched to 159 rounds is not attrition.
- **Not a monster flee.** The Congregation cannot flee: no `fleeAt` in
  its def, no `flee` component (`monsterMayFlee` reads `mdef.flee`,
  game.js:42177 anchor / current), `follows: true` (so the tbEndCheck
  disengage rule cannot fire either). No flee path in the engine can
  end this fight; only the whiff guard can.
- **Not an engine softlock.** The whiff guard exists precisely for
  this class (finding #108) and fires on schedule at 120 no-damage
  rounds. The engine terminates the fight honestly; the defect is
  upstream, in the policy that feeds it 120 identical failed verbs.
- **Not the same stall as the 121-round Strike standoff, but the same
  family and the same terminator.** See §5.

## 5. Comparison: the 121-round Strike standoff (finding #1821)

| | 159-round Congregation (53001 d41) | 121-round Strike (51006 staged d105) |
|---|---|---|
| Rounds | 159 | 121 |
| Policy verb loop | 120× failed strike (empty crossbow) + 29× rage re-press | 120× failed move to (7,1) after 1 successful move to (8,0) |
| Damage dealt | 374 (all rounds 31–38) | 0 (never) |
| Damage taken | 0 (never hit) | 0 during fight (scholar entered at 38% HP) |
| Monster behavior | 158 turns, 79 beams, 0 damage, never moves | 120 turns, 0 damage (shutdown grid) |
| Terminator | Whiff guard at 120 no-damage rounds (last dmg r38 → close r159) | Whiff guard at 120 no-damage rounds (no dmg ever → close r121) |
| Arithmetic | 38 + 121 = 159 | 0 + 121 = 121 |
| Outcome | 'routed' (guard → tbEndCheck) | 'routed' (guard → tbEndCheck) |

Same family, same terminator, different policy verb: the Strike arm
loops a failed MOVE (approach path, blocked-step treatment already
named in finding #1821), the Congregation arm loops a failed STRIKE
(ammo-blind, no failed-verb treatment). The shared shape is the
diagnosis: **the competent policy re-issues a verb that returns
false, forever, without varying.** The Strike case had zero damage
ever; the Congregation case proves the same loop forms even when the
fight starts well (8 real hits) — the policy just needs one resource
to run dry (bolts) and it flatlines. Both fights read, in the trace,
as 120 identical failed verbs; both end only because the r24 guard
exists. Without the guard, both run forever (the Focus Group
precedent in the guard's own comment: 1M+ rounds).

## 6. The fix (named — NOT built; DIAG arm, zero src/js)

For the loop coordinator / a build arm. Three parts, in order:

1. **Failed-verb treatment in the competent policy's `fight()`**
   (primary, policy-side — the same blocked-step treatment finding
   #1821 names for the approach path, extended to strikes): track
   consecutive failed player verbs per fight (`tbPlayerStrike` /
   `tbPlayerMove` returning false). At 3 consecutive failures, stop
   re-issuing the verb and vary: for a strike, check ammo first
   (dry ranged weapon → switch to a melee weapon if one is carried,
   else close distance, else wait for the monster to move, else flee);
   for a move, re-pick a reachable tile or wait. A failed verb is
   information, not a spent turn to repeat. This one treatment closes
   both the Strike loop and the Congregation loop.
2. **Rage re-press cap in `abilityPressPlay`** (already evidenced by
   ragerepress-b's NO-GO): press rage at most once per fight unless a
   new trigger re-arms it (the variant policy was deleted; the base
   policy still presses every winning round — here 29 presses,
   1,740 kcal, 0 extra doubled strikes beyond the first press's
   window). Without this, the 29-round prologue to the stall remains
   even after the strike loop is fixed.
3. **Beam-monster repositioning** (secondary, engine-side, needs a
   design call): a beam monster whose beam resolves with the target
   never in its cells for N consecutive fires should step for a lane
   or close in, rather than firing 79 beams that cannot hit. The
   beam's "cannot re-aim once announced" honesty governs a single
   declared beam, not the monster's refusal to ever reposition between
   beams. This is the monster's half of the stall; fixing (1) alone
   leaves a scholar who closes in against a monster that still never
   moves — winnable by closing, but the monster still never plays.

Also worth a look while (1) is built: the one-shot walk-away (round
1's move to the edge, then never revisited) — the new-fight assessment
fires once per fight and the 35% eject never fires at full HP, so a
scholar who walks to the edge to flee stands there for 158 rounds
without pushing through. Either the assessment should re-fire when
the scholar is on the edge with a live outmatched monster, or the
walk-away should complete (push) once the edge is reached.

## 7. Sense-test (read the transcript, not just the counts)

The fight's own words, day 41 (438 say lines during the fight):

- The bell rings 79 times and Absolution falls 79 times; 24 times
  "The light shreds leaves and dies against the trees. Cover works."
- The scholar roars rage 29 times ("The red comes down. Your next 3
  strikes deal +100% damage.") and burns 60 kcal each time.
- Eight real hits, each noted with "(congregation's hide absorbs 10.)"
  and "+5 style — solid hit".
- Then, 120 times, the same line: "No bolt left. Your Crossbow is a
  stick you hold wrong."

As a fight it reads as a standoff that curdles into nothing
happening: the first 38 rounds are a real (if lopsided) fight — a
walking church ringing its bell while a scholar roars and fires eight
bolts — and the last 120 rounds are the same sentence 120 times. The
narration is honest throughout (no silent actions — every failed
strike says exactly why), which is why the stall is legible at all;
but a player watching this would read it as the game being stuck,
not as a fight. The whiff guard's closing line ("It comes apart — no
one in reach, no one chasing. The fight ends; they melt back into
the wilds.") is the only honest sentence left in the last 120 rounds,
and it is accurate: no one was in reach, no one was chasing. The
stall does NOT read as designed attrition or as a monster toying with
the scholar — it reads as two sides that cannot reach each other and
neither of which will move.

## 8. Proof and commits

- Proof `scripts/test-routstall-20261106.js`: **24/24 green** on this
  worktree (14 fixture checks: analyzer census, terminator
  classification incl. watchdog-vs-engine stacks, midnightkill
  matcher + rout normalization; 10 corpus checks: both legs reproduce
  day 41 / 159 rounds / scholar 1.0 / beast ~0.59, instrument clean,
  anchor is the confirm anchor).
- Driver `scripts/routstall-driver-20261106.js` (new): fightinterior
  recorder lineage + tbEnd call-stack recorder + frozen-sleep streak
  counter (read-only wrappers, zero RNG, zero game-state writes).
- Analyzer `scripts/routstall-analyze-20261106.js` (new): pure
  function over the corpus (verb/hit/turn census, HP curve,
  terminator classification, Strike comparison).
- Corpora `evidence/2026-11-06/perseed-routstall-b/`: the two 150d
  reproduction runs at anchor 2ff11cbfadfd
  (`routstall-s53001-routstall-baseline.json`,
  `routstall-s53001-routstall-staged.json`), the 45d
  current-master divergence leg
  (`fightinterior-s53001-routstall-baseline.json`, 0 wave-4 TB
  fights — the run path diverges before day 41), and the
  position-capture leg (`routstall-s53001-routstall-pos-baseline.json`,
  same fight with per-turn positions + all fight say lines; the
  position/size patches live ONLY in the disposable snapshot's copies,
  not in the committed instrument/driver).
- Reproduction method (for the next arm): the confirm anchor's tree
  was extracted with `git archive 2ff11cbfadfd src scripts index.html
  docs` into a plain directory (NOT a git worktree — the registry lock
  was contended by a sibling reap for 10+ minutes and the register
  blocked on it; the snapshot dir was deleted after the corpora were
  copied out), the committed instrument + driver copied in, both legs
  run 150d death-aware. The snapshot is gone; the corpora above are
  the record.
- Prereg committed 06dc1dc4c before any judged sim. The safe-commit
  index clobber hit on the prereg commit (file shown staged-as-deleted
  after a correct commit); repaired with HEAD-blob cacheinfo, verified
  `git status` empty + `git diff HEAD` empty + hash-object matches.
- Zero src/js. Zero new seed band.

## 9. Rebase record

- Base at task start: 987766c0c. Master at close: 82e55062
  (`82e550626642b3cabfd1de685be154e5c7011142`, a batch-ship version
  bump on top of 987766c0c). Rebased onto the explicit SHA, clean,
  no conflicts.
- Pre-rebase SHAs: prereg 06dc1dc4c, main commit 73f9ba7b7.
  Post-rebase SHAs: prereg eb4aeab94, main commit 63a3c0ff1, tip
  63a3c0ff10e38a521b30cf2dbd7d5f782021fe36.
- Proof re-run green on the rebased tip:
  `node scripts/test-routstall-20261106.js` 24/24.
- `check.js --quick` was NOT run on the rebased tip: a sibling
  check.js was in flight in another worktree (brain-design, since
  00:07Z) and this container forbids concurrent jest (phantom
  failures); my run sat at 0:00 CPU for ~8 min under load 29. The
  arm is scripts + evidence only (zero src/js) and its proof is
  green on the rebased tip. The repo-wide quick check belongs to
  the ship loop's landing gate, not this DIAG arm.

## Metric review

- D1–D3 were the right bars: D1's "or the exact reproduction
  condition named" fallback mattered — the fight reproduces at the
  anchor and NOT on current master, and naming that condition exactly
  (code moved; run path diverges before day 41) is the honest
  verdict, not a NO-GO. A D1 written as "reproduces on current master
  or fail" would have missed the diagnosis entirely.
- D2's "positions for both sides" needed a second, patched run — the
  shared recorder lineage carries no positions. The position capture
  should be a first-class recorder field (turn records already carry
  hpAfter; mx/my belong beside it) — proposed for the next recorder
  revision, not built here.
- The terminator classification (watchdog vs engine) needed the tbEnd
  stack, not just the outcome string: 'routed' is produced by both
  paths, and the pre-read hypothesis (watchdog) was WRONG — the stack
  proved the engine guard. Any future 'routed' diagnosis should
  capture the tbEnd stack by default.
- No metric revision proposed for the next run: D1/D2/D3 stand as
  written for the next stall diagnosis.

## Convergence

**scale-onramp: converging, NOT converged** (no change from
baseline9-a). Finding #1825 is answered (the stall is a policy loop
+ beam geometry, ended by the whiff guard) but NOT fixed — the fix
in §6 is named for a build arm. The binding constraint stays the
fight interior: this is the second 120-identical-failed-verb stall in
the family (Strike #1821, Congregation #1825), and the failed-verb
treatment in §6.1 is the single fix that closes both.
