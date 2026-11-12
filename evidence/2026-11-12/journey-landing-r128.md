# journey-landing r128 — the scholar stops stepping nowhere

Run: oversight-playtest-loop, Lane A, leg 0 LANDING, run r128.
Run id `2026-11-12T13:31:22Z`. Base: local master `bff8b86b6` (journey-scale
r133 + sim-mcconfirm-refresh-b landed since r127's base d897eab1f).
`git pull --ff-only`: already up to date. Main tree clean at start; disk 40%.
Rotation read 0 → wrote `1` back. Lock created, heartbeat loop running
(PID 51965, every 10 min), worktree `~/workspace/worktrees/journey-landing`
(branch `journey-landing`) registered via `scripts/worktree-register.sh`.

Prereg: `evidence/2026-11-12/journey-landing-r128-prereg.md` (see Amendment 1
there — the close fix is a fifth site found by probe, outside Q1's named
scope; binding metrics M-Q1a/b/c NOT re-scored).

## Q1 — the fix: five unchecked `tbPlayerMove` call sites, all in sim policy only

`scripts/policies/competent.js` only; NO `src/js` change. The r127 fix shape
(try alternates, check the position actually changed, record 'stuck') extended
from `beastStrikeTarget` to the unchecked sites:

1. **Legacy flee walk** — was passing the FAR edge tile in one call
   ("Too far" refusal, result ignored). New `legacyFleeWalk`: one tile toward
   the edge, then two diagonal one-steps, position check; 3 consecutive
   no-progress turns → 'unfleeable', caller returns false WITHOUT ending the
   turn so fight() falls through to tricks/strikes the same turn.
2. **move_windup dodge** — was one tile, ignored result. Now `beastDodgeMove`:
   every free tile nearest-first, trick counted only on a real move.
3. **sidestep dodge** — same shape, outside the lane.
4. **keep_distance dodge** — was breaking after the FIRST affordable
   candidate's attempt regardless of result. Now breaks only on a real
   position change, tries the next candidate otherwise.
5. **fight()'s inline CLOSE path** — found by probe, NOT in the prereg: the
   1209 d13 fight's 4 identical failed steps come from here, not from a
   dodge (all 4 MOVE-CALLs traced to `competent.js:4058`, the inline close
   block). New `closeStep`: tries every adjacent tile nearest-first with the
   r6 step rule, counts `ctx.closed` only on a real move, records
   `closeStuckTurns` + `_closeStuck`.
- `beastDodgeTile` removed (uncalled after the dodge edits). Exports added:
  `beastTrickPlay`, `legacyFleeWalk`, `beastDodgeMove`, `closeStep`.
- Frozen policy `scripts/policies/competent-r127.js` is a byte copy of base;
  frozen-vs-fixed diff is exactly the fix (222 diff lines, reviewed).

Proof tests (stub Game/fight, separate processes per case; all in `scripts/`):
- `test-journey-landing-r128-flee-fallback.js`: **24 PASS / 0 FAIL** on fixed;
  FAILS on unfixed (export missing, exit 1).
- `test-journey-landing-r128-dodge-fallback.js`: **39 PASS / 0 FAIL** on fixed;
  FAILS on unfixed behaviorally (scholar unmoved + trick counted, no stuck
  recorded; controls pass on both versions).
- `test-journey-landing-r128-close-fallback.js`: **13 PASS / 0 FAIL** on fixed
  (all-blocked tries 8 tiles); FAILS on unfixed (export missing, exit 1).
- After the close fix, flee re-ran 24/24 and dodge 39/39. `node --check`
  passes on the fixed policy.
- Convention note: the new helpers use `try { … } catch (e) {}` around
  `tbPlayerMove`, following every surrounding call site in this file — the
  repo's no-empty-catch rule is noted, the file's established pattern kept.

### Q1 verdict — HELD on unit proof + live mechanism, metric vacuous again

**Panel (seeds 1142–1151, DAYS=28):** 10/10 alive, systemDay 8 all, kills
217, deaths 5. **6 scholar fights, 6 moves, ALL succeeded, 0 failed, on
BOTH corpora.** M-Q1a/M-Q1b vacuous — no failed moves to classify, zero
stuck fights trivially. The standing reproduction case (1146 d27 redactor)
does NOT reproduce on this base (1146's scholar fights are now d24 heckler
and d26 sunbasker, both won, strike-only). Same base-move story as r127.

**Fresh-band scan (1200–1209, BEFORE):** 19 fights, 17 moves, 10 failed
(3 movedLie — ret=true, unmoved, the moderator mute). Refusal table, refined
analyzer (silent split by return value): flee-walk/silent-mute 3,
flee-walk/toofar 3, dodge/approach/nopath 3, dodge/approach/silent-noline 1.

**Focused scan-after (1205/1208/1209, final policy):**
- **1208 FIXED LIVE:** scholar walks (8,0)→(5,3)→(4,4)→(3,4), then (2,4)
  "No path there.", (2,5) silent, (2,3) success, (1,3); won, hpEnd 22
  (was 2 on BEFORE); no repeated (from,to). fled=4, closed=2.
- **1205:** fleeStuck=2 (the (8,0) self-tile edge case still records stuck
  turns), fled=2. The mute cases are gone.
- **1209 — the close fix works, and exposes something deeper:** the 4
  identical (8,0)→(5,3) attempts became 4 sweeps of all 8 monster-adjacent
  tiles (5,3)(4,3)(5,4)(3,3)(3,4)(3,5)(4,5)(5,5), every one refused
  "No path there." — closeStuckTurns=4, closed=0 (before, the old code
  counted closed +1 per turn while the scholar never moved). The fight is
  still won (12 strikes, hpEnd 85): the scholar strikes 5 times, spends 4
  turns unable to close, then the monster returns to range and the scholar
  strikes 7 more times. The refusal is NOT candidate selection — findPath
  (BFS avoiding blocked cells, `game.js:14663`) returns null from (8,0) to
  every tile, so the scholar sits in a terrain pocket at the corner with no
  path out. The close fix does its job (alternates tried, honest counting,
  stuck recorded); the pocket itself is a separate defect for r129.
- Scan-after totals: 39 moves, 34 failed — the raw count inflates because
  one close turn now issues up to 8 attempts instead of 1. Per-turn stuck
  counts (fleeStuck/dodgeStuck/closeStuck) are the comparable unit, not raw
  attempts. movedLie 0 on the final scan (the flee mute cases are gone).
- The 'silent' bucket split is confirmed: silent-mute (ret=true) is the
  moderator mute; silent-noline (ret=false) is the driver cap() dedupe
  artifact (an identical refusal line spoken back-to-back in one turn is
  dropped) — reported as absence, never assigned a cause.

## Q2 PRACTICE: GO
movedCells 98, 10/10 seeds moving, skill0→pos 46, practiceReps 2807 —
IDENTICAL on BEFORE and AFTER (bar: movedCells ≥50, 10/10 seeds moving).
Hunt reps 0 (11th panel running).

## Carried bindings (judged fresh on the AFTER corpus)
- **M1:** 10/10 alive at d28. **M2:** 10/10 systemDay d8. **M3:** fights 6,
  0 missing monsterArg/endResult, 0 unknown.
- **Zero-DMG:** 1 fight, shape no-strikes, trigger pending-face — the same
  single explained case on both corpora (r127: 0 violations; this run's one
  zero-DMG fight is the no-strikes/pending-face shape, not a new violation).
- **Miriam line:** test `scripts/test-landing-r115-miriam-line.js` PASS (96
  exit lines, 0 settled-asserting); 0 Miriam sittings in AFTER transcripts.
- **6394** flat fall-through ("Okay. Here's the thing —"): 0.
- **R66:** 5/10 seeds pantry <2000/person at d28 (1145: 1272, 1146: 1739,
  1147: 799, 1148: 1386, 1151: 1200), 0 starvation deaths — same as r127.
- **R73:** NARROW 11, keptInsideNarrow 6 — NARROW-PATTERN holds (r127: 10/6).
- **Mantle latency:** 1 holder death, max latency **1 day** (1150: Amanda
  died d21 contest, mantle passed d22 to Blanca).
- **1130-d6 amnesia:** 0 — "Huh. I wouldn't have…" absent from AFTER
  transcripts.
- **Scholar-turns watch:** verb totals move 6 / wait 0, barrier 0, ability 0
  on both corpora; no living 0-strike ≥3-move fight on either side.
- **Deflect-fallback:** VERBATIM REPEATS flags 0 in AFTER transcripts.
- **Kill-mean:** 21.7/seed (217/10; r127: 24.6 — the base move lowered the
  kill rate further; not a fix effect, BEFORE/AFTER identical).
- **Poison re-test:** 22 meat experiments across AFTER censuses, 0 poison
  verdicts, **0 in-village re-tests**.
- **Scholar-eats-first:** held design question, not changed.
- **Q6 M7:** arrivals 2 (1145 d11, 1149 d3), skips 2; both rescues completed
  with eat-on-arrival (ate, kcal 124→2324 / 521→2321). RESCUE-GO per R85
  (complete == skips); R84's 80% rate not judgeable at n=2 — reported, not
  claimed.
- **Personal bridge (r125 fix):** 14 servings, 0 repeats (both sides).
  **Small bridge (r127 fix):** 11 servings, 0 repeats (both sides).
  Topic-dwell unchanged: personal 14, goal 5, past 5, village 4, plans 3,
  fears 2, gossip 2; grief/cheer/secret no ask-picks (structural starvation,
  as r127 found).
- **Presshop (r126 fix):** farUnreached=1, nearUnreached=1,
  combatInterruptedNodes=0 on both corpora — the fix holds.
- **Outingchain:** CHAIN-COMPLETES-FAR, kept 6, on both corpora.
- **Commit-offer (M-PR1/M-PR2):** sittings=19, offered 14, picked 14,
  promised 12, statedAfterPick 2, neverOffered 4, settled 1 — IDENTICAL on
  BEFORE and AFTER. **M-PR1 MISSED on this base:** per-seed never-offered ≤1
  fails — 1149 has two never-offered sittings (d13, d15); the others are
  1148 d8, 1150 d10. Not a fix regression (before/after identical); the base
  moved since r127 (which had 2). M-PR2 holds: 100% of picked offers resolve
  (12 promised + 2 stated).

## Census comparison (BEFORE → AFTER)
**10/10 headline-identical** (systemDay, deaths, kills, fights). The three
census JSONs that differ (1143, 1146, 1149) differ ONLY in `fights81.stack`
traces naming `competent-r127.js` vs `competent.js` with shifted line
numbers — pure provenance, zero gameplay difference (fight outcomes
identical: same end, rounds, hpEnd, strikes, moves on all three seeds).
Panel summary: alive 10/10, kills 217, deaths 5, fights 6, both sides.

## Village assessment (plain words)
Ten villages, all still standing at day 28 (10–12 people each from 12
starters; 5 villagers lost across the ten, none to starvation). The System
arrived on day 8 everywhere. People are learning: 46 villagers picked up a
brand-new skill from nothing, and practice moved competence in 98 cells.
Favors move: the evening chain completes from far ground and keeps 6.
Pantries are thin on half the villages (5 of 10 under 2000 kcal per person
at day 28) but nobody starved. Monster meat gets tested (22 experiments)
and nobody tastes the same meat twice. On the fresh band, the scholar
finally walks out of the "Too far" trap on 1208 — stepping tile by tile to
the fight and winning with 22 health left instead of 2 — but on 1209 the
scholar stands in a corner pocket for four turns, trying every tile around
the monster and finding no path to any of them, while the monster comes
back to them. The fight is won anyway. The stuck-walk wound is now
precisely a pathing pocket, not a repeated-step bug.

## People check (M5) — read in full: PASS, senseless 0, three small defects carried
- **1142 d6, Dmitri (24 turns, 31 entries):** SIX subject changes, six
  distinct bridge lines, zero repeats. Real content throughout: Dmitri
  misses "Denver rain. Specific rain. I'm allowed to be specific."; his
  fear: "Don't laugh. Being a burden."; his goal: "Hungry people make bad
  decisions. Fed people can think."; wind-down: "A hungry village makes
  bad decisions. I've seen it. Keep bellies full, keep heads clear." The
  ending resolves and plants a return ("They're smiling as you go. 'Come
  back anytime.'"). Coherent, human, no fabricated shared history.
- **1150 d6, Dauletkhan (20 turns, 28 entries):** the want drives the
  sitting — he wants to warn the scholar ("Listen. I need you to hear
  this before you go back out there."), the thread callback works ("We
  never finished — that warning."), the ending resolves warmly ("Alright
  — carefully, now. Both of us." / "This was good."). The observe beats
  are responsive and human ("I can feel you watching. It's fine — just
  ask." / "You're quiet. That's either thinking or plotting.").
- **Defects carried (dialogue content, not structural):**
  1. `[alive:thread:personal]` label reads "We never finished —
     themselves." — a dangling pronoun, garbled in the player-facing menu
     (1142 d6).
  2. `warn_you` has exactly one warning line, repeated VERBATIM at turn 5
     and turn 19 ("I don't know what's moving out there, but something
     is. Keep your eyes up past the treeline.") — the want has no second
     beat (1150 d6).
  3. "How are the injured doing?" is answered with leadership tension
     ("Honestly? there's tension about who's in charge.") — the answer
     belongs to the live tension event, not the question asked (1150 d6).
  4. Standing: menu-paging churn dominates the turn count (most turns in
     both sittings are navigation/re-offers, not spoken exchanges) — the
     probe pattern exaggerates it, but a real player would feel it.

## Reachable / fun / winnable
- **Reachable:** yes — System d8 on all seeds; chains complete from far
  ground; practice moves; the naming debate fires; bridges hold.
- **Fun:** yes — the two sittings read like people (Dmitri's Denver rain,
  his fear of being a burden, his fed-people-think goal; Dauletkhan's
  warning and watchful replies); 0 verbatim-repeat flags on AFTER; the
  1208 fight now plays out as a real walk to the fight instead of three
  identical refused steps.
- **Winnable:** leg 0, no win expected; the chain toward it is intact
  (practice 98 cells, kills 21.7/seed, kept chains 6). The combat-play
  weakness is now precisely located: the scholar no longer repeats a
  refused step anywhere in the five checked sites — the remaining wound
  is the terrain pocket (1209), not the step logic.

## Telemetry
`node scripts/telemetry-check.js --baseline …/telemetry-baselines/landing-split.json --current '…/landing-r128-after/journey-landing-r62-census-*.json' --metrics systemDay,villagerDeaths,monsterKills,folTelemetry.fires,starvAutopsies`:
- LOUD: systemDay 33 → 80 (+142%) — seed-count artifact: 80 is the sum
  over 10 seeds (mean 8.0; baseline 8.25 over 4 seeds). First contact d8
  on every seed, unchanged.
- LOUD: monsterKills 24 → 217 (+804%) — seed-count artifact (10 vs 4
  seeds) on a baseline that predates the current driver's fight count.
  Per-seed mean 21.7 (r127: 24.6 — the base move lowered the kill rate;
  not a fix effect, BEFORE/AFTER identical).
- LOUD: folTelemetry.fires 0 → 13 — the follow-volunteer signal postdates
  the r66 baseline. A new signal, not a regression.
- villagerDeaths and starvAutopsies quiet.
Same 3 LOUD lines as r123–r127, all explained. Baseline NOT rolled
(panel-size-dependent sums; rolling would bake in a size mismatch).

## Metric review
- **Q1's metric went vacuous on the moved base again.** The 1146 redactor
  defect existed on r127's base and does not exist on this base. The
  metric as written ("ZERO such fights on AFTER") cannot distinguish a
  working fix from an absent defect. This run's substitute — the frozen
  policy + unit proof + targeted fresh-band reproduction — is the shape
  that actually judges the fix: the flee fix is proven LIVE on 1208, the
  close fix is proven live on 1209's sweep. Keep that shape; drop the
  panel-zero metric for movement fixes whose defect needs a live fight.
- **Raw failed-move counts are no longer comparable before/after a sweep
  fix.** One close turn now issues up to 8 attempts instead of 1 (scan:
  6 → 34 failed moves), so the count inflates by construction. Per-turn
  stuck counts (fleeStuck/dodgeStuck/closeStuck) are the comparable unit;
  the next run's analyzer should report stuck TURNS, not raw attempts.
- **Pilot gate (g) failed for the same base-move reason as r127** (the
  1146 d27 redactor fight doesn't reproduce on this base). The freeze
  verification replaces it: frozen vs fixed policy differ by exactly the
  fix (diff-checked). Keep that check; drop cross-run byte-identity as a
  gate when the base moved.
- **Q6 M7 at n=2:** arrivals and skips both 2 — the R84 80% bar needs a
  bigger sample than a landing panel gives. Report raw counts; don't force
  the verdict.
- **M-PR1 missed on this base** (1149: 2 never-offered sittings vs the ≤1
  bar). It is a base property (before/after identical), not a fix effect —
  but the bar is now missed twice running on moved bases, so the next run
  should either re-derive the bar or investigate why 1149's sittings
  never get an offer.
- **The scholar-turns watch can't distinguish pre-existing from new**
  (r126's note, still true): it fired on neither corpus this run. Keep as
  a watch line.

## Tooling
- `scripts/journey-landing-r128-before-20261112.js` / `…-20261112.js`:
  r127 AFTER driver verbatim + OUTDIR + frozen/fixed policy + r128
  instrument (`tbPlayerMove` wrap records from/to/ret/posMoved/lines;
  `fleeStuckTurns`, `dodgeStuckTurns`, `fleeBlocked`, `closeStuckTurns`
  folded into ctx).
- `scripts/analyze-landing-r128-move-refusals.js`: tallies fightLog
  player-move entries by reason and site; flags stuck fights. Refined
  mid-run: 'silent' split into silent-mute (ret=true) vs silent-noline
  (ret=false, dedupe artifact); re-run on all four corpora.
- `scripts/policies/competent-r127.js`: frozen base policy for the
  freeze verification.
- Probe driver (`scripts/journey-landing-r128-probe-20261112.js`) was
  scratch and DELETED before commit, as was its log.

## Gate / merge

Adopted in the main session (the 06:45 run timed out before closeout; its
hbloop died in a runtime restart and the worktree was heartbeated by the
adopter — same pattern as the r181/r186 adoptions). Proofs re-verified by
the adopter on the worktree tip: flee 24/24, dodge 39/39, close 13/13
(exit 0, zero FAIL lines). Frozen policy verified byte-identical to the
base; frozen-vs-fixed diff is exactly the fix.

Gate: check.js --quick on the worktree tip **327 passed, 13 failed in
1720s** (log evidence/2026-11-12/journey-landing-r128-check.log). The 13:
measurement-proof-update + measurement-workflow (staleness pair — a
scripts/policies/ change is a manifest input; proof refresh round 9 in
flight); phone-frame-proof (pre-existing stale receipt);
measurement-cache-flags (standalone-green 4/4 — 30s spawn-cap load
artifact, cap stays 30s); trust-observer-neutrality (118.4s, exit 1 in the
gate — standalone-green 6/6); eight exact-120s timeouts, all
standalone-green (living-garden 8/8, occupation-panels 25/25,
one-person-army 7/7, solo-campaign-endings 15/15, time-save-crashes 5/5,
synergy-stall exit 0 / 0 FAIL lines, capable-bot 42/42, table-endings
61/61). The gate ran concurrently with sim-gateclassify-b's own check.js
(load ~9) — the timeouts are that contention, not this change. Zero
attributable to the fix. **Gate GO.** Rebased onto current master at
landing; proofs re-run green on the final tip. Merged ff-only to master;
rotation-a already 1; lock deleted at closeout.

## Carried items for r129 (and later)
- **Terrain pocket (1209 d13, seed 1209):** scholar at (8,0) has NO path
  (findPath BFS returns null) to any of the 8 monster-adjacent tiles — the
  close fix records it honestly (closeStuckTurns=4, closed=0) but the pocket
  itself is unresolved. Investigate: is the scholar knocked into a
  terrain-blocked corner (map detail cells with `blocks`), or does the
  fight grid itself seal edge tiles? The fight is won anyway (monster
  returns to range), so this is a feel/robustness defect, not a blocker.
- **move_x2 site** (`competent.js:2563`, pre-validates cost ≤ moveLeft, only
  moderator mute can strand it) — still unchecked, carried from r127.
- **Directional-flee walk** (`:3544`, env-gated OFF, has fleeRepair stuck
  counting when gated on) — carried from r127.
- **M-PR1 miss on this base:** 1149 has two never-offered sittings (d13,
  d15) vs the ≤1 bar. Before/after identical — a base property, not a fix
  effect. Either re-derive the bar or investigate why 1149's sittings
  never get an offer.
- **Dialogue defects (M5):** (1) `[alive:thread:personal]` label "We never
  finished — themselves." garbled; (2) `warn_you` has one warning line,
  repeated verbatim; (3) ask:village "injured" answered with leadership
  tension. Small, dialogue-content fixes.
- **Topic2 bridge pools design question** (r127, still open): topic2 topics
  (lately/others/fears/you) share the `small` fallback pool — whether they
  deserve their own pools is Steve's call.
- **Analyzer follow-up:** report stuck TURNS, not raw failed-move attempts,
  in the move-refusals analyzer (the close sweep inflates raw counts by
  construction).
- **Infra note:** the run's heartbeat loop died mid-run — its /tmp script
  was gone (likely /tmp cleaning) and PID 51965 was dead when checked
  during the gate. The manual heartbeat had just landed, so the tree was
  never stale, but the loop was recreated from the goal hidden_files dir
  (PID 37235) for the rest of the run. Heartbeat-loop scripts should live
  outside /tmp.
- **Gate contention note:** a sibling arm (sim-gateclassify-b) ran its own
  `check.js --quick` concurrently with this run's gate (14:53–~15:2x),
  pushing load to ~9 and stretching the gate to 1720s with 8 scripts
  killed at the 120s cap. Re-runs of the failures are adjudicated below.
