# sim-arrivalsurge-a — why wave-4 arrivals tripled (axis scale-onramp)

Run: fleshout loop A, run fleshout-loop-a-20261027T0840Z.
DIAG ONLY — code archaeology. Zero src/js changes, zero default flips,
no game lever, no lever proposal, no lever sweep. The deliverable is
the ANSWER, not a fix: spawn behavior is unchanged by this arm.

## PRE-REGISTRATION

Full text, committed FIRST before the evidence verdict:
evidence/2026-10-27/sim-arrivalsurge-a-prereg.md (commit 4961c6d00).
DIAG-GO rule (binding): a NAMED COMMIT that explains the surge, OR a
named "NO SINGLE COMMIT" verdict with EVERY plausible candidate commit
disposed of individually (explains / contributes / ruled out, each with
file-level evidence). A vague "something changed" is DIAG-NO-GO, never
re-scored mid-run.

## VERDICT: DIAG-GO — NO SINGLE COMMIT (leg (b) of the prereg)

There is no spawn-side commit to name, because the spawn side did not
change at all. The surge is a trajectory consequence of policy-side
changes, primarily the staffing fallbacks, acting through longer and
earlier wave-4-open windows at an UNCHANGED spawn rate. Every plausible
candidate is disposed of individually below, with commit + file
evidence. The proof script re-checks the load-bearing negatives
mechanically: scripts/test-arrivalsurge-a.js, 17/17 green.

## THE WINDOW, PINNED (not assumed)

- October 25 base = 120ea4d3a: the parent of the w4funnel-a evidence
  commit 2d1d35df2 (the w4funnel worktree's branch tip at commit time).
  Cross-check: zero src/js + src/data diff between the w5chain-a
  worktree base (d5d28d44, parent of 353bede41) and 120ea4d3a — the
  October 25 census ran on the same game tree as the w5chain band it
  reproduced exactly (deaths 234, median 135d).
- Surge window = 120ea4d3a..5c3c80013 (the 0615Z coordinator base):
  213 commits. Full-window `git diff -- src/js src/data`: 17 files,
  336 insertions, 72 deletions — every hunk read, none sampled.
- Re-pin window = 5c3c80013..fc57dd0bd: tested below (candidate K).

## THE ANSWER, FIRST (plain words)

Nothing about how wave-4 monsters are born changed. The game still
opens wave 4 the same way (village standing 100 plus a village ready
to fight), still rolls the same 60%-newest-wave dice when you walk
onto a tile, and still births a wave-4 monster about as often per day
the door is open. What changed is how LONG the door stays open, and
how early it opens. Between October 25 and October 27 the villages
started eating better — the bot player learned to staff its cooks and
fishers even when its first choice refused — so villages lived longer,
feasted more, and hit standing 100 sooner. A door open 27 days births
about three times what a door open 7 days births, at the same rate.
That is the whole surge: same dice, more rolls. The headlines stayed
identical because the headlines measure the END of the story (who won,
who reached national, who got invited) and the funnel measures the
MIDDLE (how many monsters walked in along the way). A village can win
the same lesser seat while meeting three times as many Mirror Draft
monsters on the road there — and on this band, it did, because the
two longest-lived villages (73671 and 73675, 13 arrivals each) simply
had more road.

## MECHANISM, STEP BY STEP (each link read from code, not inferred)

1. Wave 4 opens when villageStandingTotal() reaches t4 = 100 AND the
   readiness bars are met (src/js/standing.js, UNCHANGED in the
   window): war (+25 per wave-3+ ledger kill point), bonds (+34 per
   seasoned regional+ link), bread (+20 per major feast, quality>=1).
   Readiness (waveCombatReadiness): 3 armored @ P>=10 / 5 armed /
   3 tricks / 1 living wave-3+ killer. Neither the numbers nor the
   code moved — `git diff` for standing.js is empty, and -S searches
   for villageStandingTotal, waveCombatReadiness, readyDemand are all
   empty in the window.
2. While wave 4 is open, tile-entry births draw from monsterWavePool()
   with spawnWaveTarget(): 60% newest wave (top 4: 60/20/15/5).
   Both functions are UNCHANGED in the window (-S empty). The
   per-day-open birth rate is therefore the same on both bases.
3. Tile-entry births require an empty player tile
   (`!monsterAt(px, py)` in game.js, UNCHANGED) and happen on
   player movement — so births accumulate with days walked while the
   door is open. Median days-available 7 -> 27 is, by itself, a
   ~3.9x window expansion against a 2.8x arrival expansion (11 -> 31):
   the window story does not just fit, it OVER-fits slightly, leaving
   room for the seeds whose windows did not lengthen (four seeds
   still had zero arrivals on the new base).
4. The concentration fits too: the surge lives on the two longest runs
   (73671 survived 180d: 13 arrivals; 73675 lost d169: 13 arrivals),
   while 73673/73674/73676/73678 had zero on the new base. A spawn-rate
   change would lift all seeds; a window change lifts exactly the
   long-lived ones. And the sharpest single-seed flip is a window
   flip: 73675 on October 25 won on day 135 with wave 4 opened day
   134 (one day of window, zero births); on the new base it ran to
   day 169 with 13 births.
5. Scripted-titan births 2 -> 3 need no separate mechanism: titan
   nights arrive with longer runs, and titans.js changed only by a
   note-only line in the window (candidate I).

## CANDIDATE DISPOSITIONS (every plausible candidate, individually)

Disposition vocabulary: EXPLAINS (alone sufficient) / CONTRIBUTES
(moves the surge in the right direction, share unproven) / RULED OUT
(cannot move arrivals, with the reason). No candidate is EXPLAINS
alone — that is the verdict, not a gap in the table.

### A. Spawn / standing / readiness code — RULED OUT (as a class)

Files: src/js/standing.js, src/data/monsters.json,
src/data/wave-ledger.json — zero diff in the window. Symbol searches
(`git log -S` over src/js, window): spawnWaveTarget, waveCombatReadiness,
villageStandingTotal, readyDemand, monsterWavePool, scripted-titan,
tile-entry — ALL EMPTY. There is no spawn-side commit to name, so
prereg leg (a) is unavailable for any spawn/standing mechanism. This
negative is re-proven by scripts/test-arrivalsurge-a.js (checks 3-4).

### B. Staffing fallbacks — CONTRIBUTES (primary identified mover)

Commits: 908ad0f12 (sim-stafffallback-b, cook fallback, 2026-10-26
04:42Z) + 8a7540534 (sim-fishfallback-b, fish fallback, 2026-10-26
08:47Z). File: scripts/policies/competent.js (DEFAULT-ON changes, not
env-gated). Mechanism, read from the diff: the old assignAnother /
cook pick asked ONLY the top scorer and counted refusals as staffed;
the new code walks the scored list until someone accepts (refusal,
null, or exception moves to the next candidate; nobody accepting
returns false honestly). Why it runs on this band: leanlinkrescue.daily
calls competent.daily unconditionally (scripts/policies/leanlinkrescue.js
line 128), and tableseat-nowait wraps leanlinkrescue — the fallbacks
are inside the band's daily loop. Why it moves arrivals: more cooks
staffed -> more smoking/preserving; more fishers staffed -> more fish;
more food -> longer survival (more days with wave 4 open) + more
major feasts (bread standing +20 each) -> standing 100 earlier and
held + more living villagers -> readiness bars met earlier. All
three links push the wave-4-open window earlier and longer at an
unchanged spawn rate. Corroborating direction in the censuses:
starvation deaths fell 5 -> 2 while total deaths rose 234 -> 284 —
villages stopped starving and lived long enough to die fighting
instead, which is what longer, better-fed runs look like. Magnitude
note (honest): the fish fallback's own evidence (commit message)
records a 9754 rescue 34d -> 100d, wave 2 -> 4, national reached —
proof the fallback moves survival and scale materially on some seed.
NOT promoted to EXPLAINS: chaotic trajectories mean the exact 11 -> 31
count cannot be derived from code/history alone (see "Unsettled").

### C. Bystander hold — RULED OUT for arrivals (fate effect only)

Commit: c04d4e0cb (journey-scale r42, 2026-10-27 02:56Z). File:
src/js/game.js, startCombat. The change: a TB fight no longer lifts
the player-tile monster unless that monster IS one of the fight's
monsters; a bystander stays on its tile and no worldOrigin is
recorded. Why it cannot explain +20 births — the spawn reads say the
opposite: tile-entry spawns require `!monsterAt(px, py)` AND reset
the spawn-miss escalator when a monster occupies the tile, and
maintain-spawns are capped by worldMonsterCap(). Keeping monsters in
the world can only SUPPRESS further births, never increase them.
What it does explain is fate shape: still-present stays high (23/31)
because lingerers are no longer silently deleted by unrelated TB
fights — the old band's deletion path is gone, so monsters persist
to be counted. Arrival count: ruled out. Fate persistence:
contributes (and is the reason the new census has melts/departures
to count at all — monsters survive long enough to melt or leave).

### D. Social / conversation visibility family — CONTRIBUTES (secondary)

Commits: 92fa1c799 (journey-social r54: subject-menu discussed-'others'
re-list + pager rank lift), 6fdee4d5a (Lane B social r55: main-menu
discussed-'others' exemption), c509ec15a (journey social r59: party-menu
trim protects ask:others), 1377d03c3 (journey deepening r53: stage-0
ask_favor re-ask guard), de87ffe79 (journey-landing r54: winddown grace
beat returns as the closing line). Files: src/js/conversation.js,
src/js/party-formal.js. Mechanism: ask:others moves from rank 4
(sorts last, pages away) to rank 3, rides past topic caps, and survives
party-menu trims — the village-talk verb gets picked more often by
the policy's talk loop (inside competent.daily, hence live on this
band). More village talk -> more gossip/trust -> seasoned links sooner
-> diplomacy standing (+34 per seasoned regional+ link) sooner ->
wave 4 earlier. Same direction as B, smaller and unmeasured: menu-pick
frequency on this band was never censused, so the share is unproven.
The winddown grace beat is voice-adjacent (the sitting still ends;
only the closing line is now heard) and is carried here as negligible
within the family, not as its own mover.

### E. Dead-teacher guard — RULED OUT (direction opposite)

Commit: e68a15e5f (journey crisis r51, 2026-10-26 12:34Z). File:
src/js/game.js (fireside lesson branches: dead discoverer/teacher no
longer grants knowledge). A surge toward MORE arrivals needs EARLIER
readiness; this change reduces knowledge spread, which lowers the
tricks bar and meets readiness LATER. The surge happened DESPITE it,
not because of it.

### F. Corpses falsy-0 family — RULED OUT (negligible, mixed direction)

Commits: 1204c06f5 (journey-deepening r51: corpse-range `|| 4` -> `?? 4`),
88b8d7e32 (journey-deepening r52: butcher/death-spawn/grave-robber
falsy-0 siblings), 1377d03c3 (villageAgency splinter placement
`|| 4` -> `?? 4`), abilityActions node check. Files:
src/js/corpses.js, src/js/corruption.js, src/js/abilityActions.js,
src/js/villageAgency.js. These correct edge-cell (coordinate 0) reads:
a scholar at (4,0) was previously read as (4,4). Effect is a handful
of corpse interactions at map edges — no path to standing, readiness,
or spawn rates, and no path to +20 wave-4 births.

### G. Expedid fallen push — RULED OUT for arrivals

Commit: e12e5ad07 (sim-expedid-b, 2026-10-25 20:51Z). File:
src/js/villager-agency.js (expedDeath threads monsterId into
registerDeath and pushes v.fallen for expedition deaths). Fallen
entries are records: readiness reads waveKillLog + vpOf, standing
reads ledger/links/feasts — neither reads v.fallen. No spawn or
standing path exists. (It affects how a census READS a killer's death,
not whether monsters are born.)

### H. Voice-only family — RULED OUT (zero RNG, zero behavior)

Commits: 2e2cc03a2 (gap W4-narr: sayOncePerFight, sayGated, rotLine,
witness-pool expansion 2 -> 3/4 lines, water-departure rotation),
758a9d8bc (sim-racksvoice-gate-b: village-level first complaint),
9465c8d4e (sim-reminder-b: frozen-stretch reminder rule R). Files:
src/js/game.js, src/js/food.js, src/js/storage.js,
src/js/villager-objectives.js. RNG audit, read from code: sayGated /
sayOncePerFight / rotLine draw zero Math.random (rotLine's own comment
states zero draws, by design); racksvoice markers are off-state voice
flags; witness lines use say(), not the sayLine parrot ledger, so the
picked line cannot gate later conversation. The one subtle case —
witness-pool expansion — does NOT perturb the RNG stream: pickFresh
draws exactly one random per call regardless of pool size, so stream
position is unchanged (only which line is picked differs, and lines
are voice). No behavior, no state, no draws -> no trajectory effect.

### I. Notes-only / string-only / shape-identical — RULED OUT

Commits: dad2255de (journey-scale r36: _linkNote additions; the
comment states "Note only; the numbers are unchanged"),
811bd8976 (journey-establishment r39: taken-kin closing-quote fix),
hierarchy.js + titans.js _linkNote additions, convo-wants.js quote fix.
Files: src/js/hierarchy.js, src/js/titans.js, src/js/convo-wants.js,
src/js/food.js, src/js/storage.js (too-heavy early returns). The
food/storage change deserves one line because it LOOKS behavioral:
old `return refuse(...)` vs new `{ sayGated(...); return { ok: false,
why, taken: 0 } }` — but refuse() itself is defined in the same
function as `why => { this.say(why); return { ok: false, why,
taken: 0 } }`, so the new code returns the IDENTICAL shape with
gated voice. Behavior identical; voice only.

### J. Armor-vine seek — RULED OUT for this band

Commit: 43a0786f8 (journey-deepening r48, 2026-10-25 23:10Z). File:
scripts/policies/competent.js (armorWantsVine). Env-gated
COMPETENT_ARMOR_VINE_SEEK=1, default OFF, with the comment "every
other competent user is byte-identical" — and grep over the sweep,
tableseat-nowait, and leanlinkrescue files finds no setter. Live only
in journey drivers that opt in, never in the w4funnel sweep.

### K. Journey-scale r43 (0615Z -> re-pin) — RULED OUT

Commits: a33fe3c74 + fc57dd0bd, exactly two, verified by git log.
Both are evidence/scripts-only (analyzer + driver scripts + corpus
notes); `git diff -- src/js` for the window is empty. The re-pin
evidence's claim "master movement since the 0615Z run is ONLY r43"
is TRUE — and it answers the wrong window for the surge. The surge
predates 0615Z: the 0615Z band IS the re-pin band (deaths 284, median
130d, identical per-seed trajectories), so whatever tripled arrivals
had already happened by 0615Z. r43's scripts never run inside the
w4funnel sweep. Note the subtlety the re-pin leaves open: repin proves
r43 did not move HEADLINES 0615Z -> re-pin, but arrivals were never
censused at 0615Z; the scripts-only nature of r43 closes that gap
too — r43 cannot move arrivals either.

### L. Instrument artifact (the count moved, not the game) — RULED OUT

The five census recorders (spawnsrc-diag, oldcore-diag, raftdraft-diag,
w5births-diag, defwound-diag), leanlinkrescue, tableseat-nowait, the
sim harness, and sweep-compare are BYTE-IDENTICAL between the October
25 base and the 0615Z base (empty `git diff`). The repin analyzer is
the w4funnel analyzer reused verbatim, and the repin's armed-vs-plain
exactness gate proves recorders do not move shared fields. A counting
change would have to hide in identical files. The 11 -> 31 is a
game-side change, not a counting change.

## WHAT THE OLD BAND'S HEADLINES DO AND DO NOT SAY

A trap in this question: the task statement says headlines stayed
identical between the censuses, but the OCTOBER 25 census's own
headlines (deaths 234, median 135d, wave-4 6/8, national-final 6/8)
are NOT the re-pin headlines (deaths 284, median 130d, wave-4 5/8,
national-final 5/8). The "identical headlines" in the question are
0615Z vs re-pin — the surge window's END, not its start. Across the
actual surge window (Oct 25 -> 0615Z) the WHOLE band moved: deaths
234 -> 284, median 135d -> 130d, and all eight per-seed trajectories
changed (73673 won d124 -> lost d32; 73675 won d135 -> lost d169;
73677 lost d143 -> won d130; 73676 lost d70 -> won d144). The surge
is one facet of a wholesale band movement, not an isolated funnel
anomaly — which is exactly what a policy-side trajectory mover (B,
with D) predicts, and what a spawn-code change would NOT need. Any
future account that treats 11 -> 31 as a spawn-gating mystery without
the band movement is answering the wrong question.

## SENSE NOTE (no new transcript read)

No new narration transcript was read for this archaeology — the
question is answered from code and history, and SENSE-TESTING LAW
applies to transcripts read, not to counts re-derived. The published
sense threads in the two censuses are consistent with the window
story, cited as color, not as new evidence: October 25's 73678 thread
("the monster the village was supposed to prove itself against walks
past unseen") versus the re-pin's 73671 thread ("thirteen monsters,
most of them scenery, arriving faster than the village can introduce
itself to them"). The fiction changed from "never met" to "met as a
crowd" — which is what a longer open window reads like from inside
the village.

## UNSETTLED (named, not hidden) + CONFIRMING MEASUREMENT

Unsettled from code/history alone: the ATTRIBUTION SHARE. B is the
primary identified mover and D a secondary one, but chaotic
trajectories mean the exact split of 11 -> 31 (fallback vs social vs
plain trajectory chaos) cannot be derived without running. No lever
was pulled here to settle it, per assignment.

Exact confirming measurement for a future arm (DIAG, same substrate):
rerun the identical band (seeds 73671-73678, tableseat-nowait policy,
180d death-aware horizon, same five recorders) in two arms — (1) the
October 25 base tree (120ea4d3a) and (2) the current base with ONLY
the 908ad0f12 + 8a7540534 fallback hunks reverted (or equivalently
the October 25 base with ONLY those two hunks applied) — and compare
per seed: (i) wave-4 arrivals, (ii) first day standing >= 100,
(iii) first day readiness-met for wave 4, (iv) major-feast counts,
(v) cook/fish staffed counts. Promotion rule, fixed now: if the
fallback-only arm reproduces most of the arrival gain AND earlier
standing-100 days, B is promoted from CONTRIBUTES to EXPLAINS; if
arrivals stay near 11 while standing-100 days move, the surge is
chaotic-trajectory noise and B is demoted to a contributor to
survival, not to arrivals. A third arm adding ONLY the social family
(D) would separate B from D; do not run it until the fallback arm
reports.

## METRIC REVIEW (§14 — binding, no mid-run re-scores)

Judged exactly against the prereg's DIAG-GO rule, leg (b): a named
"NO SINGLE COMMIT" verdict with every plausible candidate disposed
individually. Delivered: 12 candidate groups (A-L), each with commit
hashes, files, and the reason for its disposition; the spawn/standing
family is empty by proof (empty diff + empty -S searches + 17/17
proof script), not by assertion. No metric was re-scored: the
tempting re-score — naming the staffing fallbacks as EXPLAINS on the
strength of their direction — was NOT taken, because code/history
cannot prove the count. The verdict is the no-single-commit verdict
the prereg allows, with B as primary contributor and the confirming
measurement named above. One method note, not a revision: the
October 25 base pin was established from the evidence commit's
parent (120ea4d3a) and cross-checked against the w5chain base
(d5d28d44) with an empty game-tree diff — had that check failed, the
window would have been re-pinned and the verdict re-derived, not
adjusted. No game code changed in this run; no [needs-eyes] flag
applies (code archaeology, not a feel/combat/UI change).

## Infrastructure notes

- Proof: scripts/test-arrivalsurge-a.js (read-only git queries),
  17/17 green. No sims run (archaeology only); no jest run (no jest
  surface touched).
- Safe-commit index clobber hit the prereg commit (4961c6d00) — the
  known class: commit correct, main index showing a bogus staged
  deletion after. Repaired via HEAD-blob cacheinfo, verified with
  `git status --short` empty + `git diff HEAD` empty + worktree files
  intact, before any further work. Same repair to be verified after
  the evidence commit.
- No EPERM flap blocked this run's writes; no /tmp fallback needed
  (all outputs written directly into evidence/ and scripts/).
- Master movement check: local master tip == this worktree's HEAD
  (3a12db1aa) at run end — no rebase needed; branch base is current.
- Commit: sim-arrivalsurge-a, DIAG-GO (no-single-commit verdict),
  zero src/js diff. Ready for coordinator merge; NOT pushed, NOT
  bumped, live NOT verified (coordinator/ship-loop line, not this
  arm's). No [needs-eyes] flag: code archaeology, not a
  feel/combat/UI change.
