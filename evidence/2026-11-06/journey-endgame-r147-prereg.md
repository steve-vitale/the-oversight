# Journey endgame r147 — PRE-REGISTRATION (lane B, 2026-11-06 12:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start. This run plays leg 4
and writes 5, social life, at closeout ONLY after a verified landing
— a failed or partial run does not advance the leg, per r135/r138/r140
precedent.

Run number basis: latest completed Lane B endgame run is r144
(2026-11-06 03:00 CST, closed out by the main session after the
coordinator timed out). Legs 5 (social r145) and 7 (succession r146)
ran since; rotation returned to 4. This run is r147.

Run-start incidents (infrastructure, not measurement):
- Lock: none present at start. New lock written (run_id
  2026-11-06T17:55:29Z).
- Main tree: `git status --short` 0 lines, disk 27% (fail line 85%).
- Reaper ran; 6/16 trees active, no cap pressure. Reaper flags 5
  sibling trees with uncommitted changes — none owned by this lane,
  left alone.
- Registration: slow (~11 min, registry-lock contention under sibling
  sim load) but clean on first attempt; heartbeat verified by
  read-back (18:07:21Z) and a 10-min heartbeat loop is running
  (pid 1968).
- Master at pull time: 1e8db620d (fetch: already up to date).

SUBSTRATE: master 1e8db620d EXACTLY, PLUS this run's own Fix B volume
build (see below) — the pilot runs on the POST-fix substrate and
judges the fix there, per r144's rule ("that fix, if built, gets its
own proof test and is judged on the post-fix pilot, not claimed from
the pre-fix one"). No other src/js change in this run. Probe:
scripts/probe-endgame-r147-20261106.js (r144 probe verbatim EXCEPT
renames r144->r147, evidence dir 2026-11-06/perseed-endgame-r147,
header). Analyzer: scripts/analyze-endgame-r147-20261106.js (r144
analyzer verbatim EXCEPT input dir, r144->r147). No policy change,
no new instrument at pilot time. Diagnostics, if any, write ONLY to
perseed-endgame-r147-diag-<name>/, never the pilot dir.

HEAD DELTA SINCE r144 SUBSTRATE (b5fb49607 -> 1e8db620d, verified by
git diff --stat in the worktree; b5fb49607 IS an ancestor of HEAD):
10 src files, 276 insertions, 71 deletions. Attributed:
(a) 3e82c17d1 + 8ee4aed6e build-smallfixes (landed in the r144
closeout): pocket_sand flee-order fix (scripts/policies/competent.js
— POLICY ONLY: the scholar presses a held pocket_sand in the losing
window (<35% HP) instead of fleeing; once per fight) + raid-density
cooldown ship (src/js/game.js _rdOn() unconditional + src/js/
hierarchy.js unconditional stamp: young-national raid staging now
respects the 7-day cooldown with no env gate). Proofs re-run
post-rebase: pocket_sand 13/13, raid-density 28/28, raid-ship 8/8.
(b) 3b00c7a4b sim-tableoffer-b: STICKY TABLE OFFER (Steve 2026-11-06
07:06 CST ruling — "once the table offers a seat, the offer does not
withdraw"): table.js +99 — tableWithdrawLine now voices ONLY the
pre-offer beat; tableHoldingLine + tableReturnLine added; tableScene
/ tableAnnounce gate withdrawal on pg.tableAnnounced. Proof:
scripts/test-tableoffer-20261106.js (Parts A–D: sticky hold, pre-offer
withdrawal preserved, decline preserved, voicing). The r144 "do not
build until he picks" hold is SUPERSEDED by Steve's ruling — the
fix is landed; this run verifies it in the wild.
(c) 2b710899b succession r146 FIZZLE-FIX: convo-wants.js — favor
asks name the live need instead of drying (ask_favor want-fizzle).
(d) 2a33c6afc + 01d072575 social r145: cross-structure dedupe fix
(16 goalFollow lines) + full-pool convo dedupe scan/fix (13
same-beat lines) — dialogue variety; the people check watches for
recurrence.
(e) 6aeba1c88 sim-gorgeharness-a: gate nightly gorge line at Haven,
relay drift-off line (narration delivery; no mechanics change).
(f) e53e86531 sim-mootgate-a: gate trial-moot convening on scholar
at Haven (mootConveneHeld; exile exception; proof 60/60).
(g) 7db5b4115 journey-landing r109: stop re-testing known-poison
flesh in villager experiments.
(h) version bumps (stamp only).
NO gate, price, deed, seat, or table change in any of (a)–(h)
except (b), which is Steve's own ruling; gating freeze (Steve
2026-10-27 16:53) stands. This pilot is a NEAR-REPRODUCTION check
under deltas (a)–(g) plus this run's Fix B volume build.
(a) pocket_sand: a scholar holding pocket_sand now presses it
instead of fleeing below 35% HP — wild fight outcomes on sitting
seeds may move. (b) sticky offer: an announced seat that dips now
HOLDS (holding line, once per dip) and re-fires on recovery instead
of withdrawing — 89702's r144 trajectory (pre-offer, pellet-blocked
food thesis, never announced) is NOT the sticky case: the pre-offer
withdrawal beat is preserved by design (proof Part B) and TABLE.md
canon ("Below the lesser bar the table does not come"). The sticky
case needs an announced seat that later dips — this pilot watches
for it. (c) raid-density: young-national raids now respect the
7-day cooldown — raid clustering on the pilot seeds should thin.
(d)–(g) are narration/convening gates; transcript TIMING may shift,
mechanics run identically.
NOT in this pilot: nothing withheld — all of (a)–(g) are in the
substrate, and their wild verification is this run's job.
Any OTHER headline difference is a same-run investigation item,
never a road claim, and is attributed first to this delta before
any wider claim.

THIS RUN'S BUILD — Fix B volume (r144 carry-forward, question 6):
r144 counted "holds and watches" 547x on 89701 (r143 post-fix:
120x), clustering in threes — the same fixed line, a stuck record.
The build: the wait branch in game.js tbVillagerTurn rotates the
hold line through a small fixed set via a transient fight-level
counter (f._waitCount), so consecutive waits in one fight never
read the same line twice. No silent turns (canon: no silent
actions) — every wait still narrates, only the wording varies.
Deterministic, no RNG, no mechanics change. Proof test:
scripts/test-tbwait-variety-20261106.js — (1) the line rotates
through the set without repeating adjacently across many waits in
one fight; (2) the full set is reachable; (3) a fresh fight starts
the rotation at the first line; (4) the old single line is gone
from the wait path (no "holds and watches" monopoly: in a 12-wait
sequence the first line appears at most ceil(12/5) times). The fix
is judged on the post-fix pilot (V-WAITVARIETY binding below), not
claimed from the proof test alone.

PILOT SEEDS (explicit SEEDS env — r131 lesson, never rely on the
probe default; this run passes ONLY the 4 pre-registered seeds):
89701 (waves), 89702 (waves), 89704 (forcedrift control), 89705
(wavesnw). Plan is keyed by seed value in the probe, so the subset
keeps correct plans. Seed reuse is DELIBERATE (matched before/after
per the r118/r135/r140/r143/r144 precedent: same seeds, same probe
policy, only the game code changed) — no fresh band is needed or
claimed for the pilot.

R144 PILOT BASELINE (per-seed, from the r144 run note; judged on
these 4 only):
- 89701 waves: village-LOST — scattered d78, pantry 0, alive 1.
  Standing peak 135, uw=4. (r140: scattered d53; r143: d80. The
  flip PERSISTS — still a scatter, no lesser win, just later.)
- 89702 waves: village-LOST via WITHDRAWAL d90, alive 1. Standing
  peak 199, uw=4. Pre-offer withdrawal: the pellet blocked the
  food-thesis deeds (no feast surge on the record), table never
  announced. Second withdrawn-table datapoint (first: 99767).
- 89704 forcedrift: village-LOST — scattered d48, alive 4.
  Standing 0, uw=3. Control behaves as control.
- 89705 wavesnw: WON LESSER — announced d90, sat d90, feared/light,
  final:mercy, alive 1. Standing peak 199, uw=4. Flipped from r143
  (village-lost scattered d99 → lesser win).

Tally r144: lesser 1/4, full 0/4, wave-5 unlocked 0/4, faced 0/4.

R147 QUESTIONS: (1) does the pilot reproduce r144 modulo the named
deltas? (2) does the 89701 scatter persist a fourth time (r140 d53,
r143 d80, r144 d78) or revert — the away-ration attribution is still
the leading hypothesis, still not proven? (3) Fix B volume in the
wild: do hold lines vary (V-WAITVARIETY)? (4) sticky offer in the
wild: does any announced seat hold through a dip instead of
withdrawing (V-STICKYOFFER), and does the pre-offer withdrawal beat
still fire only on a never-announced table (V-PREOFFER)? (5) do
r144-carried fixes show in the wild: pocket_sand pressed in the
losing window (V-POCKETSAND), raid clustering thinned (V-RAIDDENSITY),
helpers fight from where they stand (V-FixC), waits narrated
(V-FixB), empty-pantry gorge line (V-Gorge)? (6) dark re-verify:
re-run the FULL dark probe as r147 (all 7 variants, same policy,
fresh evidence dir perseed-endgame-r147-dark/) and confirm the v3
walk-out line names Amelia Moon, not Bill Palmer, and that D1–D4/D6
still hold on the new substrate. (7) people check: does the sitting
seed's finale read as people, and do the r143/r144-carried polish
items recur? (8) 89702 pellet question: does the pellet still block
the food-thesis deeds, and does the transcript voice it as a
tradeoff ("The mantle may pass to hungrier hands") rather than a
silent dead end?

INTERESTING FINDING (what would count): any pilot-vs-r144-pilot
headline difference other than the named deltas; any full-seat
win; any wave-5 unlock or face; any mFlee carrying monFled=true on
a non-flee kind (monster-commitment violation); any hurt-return
misfire; any ambush death missing from fallen; any dark re-verify
(v3) step failing; any transcript passage senseless, robotic, or
self-contradictory; a stuck helper waiting silently in a finale
(Fix C failing in the wild); an offered seat withdrawing (sticky
offer failing in the wild); a "holds and watches" cluster that
reads as a stuck record (Fix B volume failing in the wild); a
pocket_sand held but never pressed in a losing window where the
scholar fled instead.

BINDINGS (pilot-scaled from r144; metric binding §14 — a miss is
NO-GO, never re-scored mid-run; PRIMARY-BINDINGS is the headline,
per r135's metric review):
- M1-guard: >=3/4 seeds reach the window (announceDay != null) OR
  resolve via a voiced non-table path (honest-death / withdrawal).
- M2-census: every census fight carries a named outcome; engine
  opens == census fights.
- M2c/M2d: uncommitted classification complete (as r144).
- MFLEE-routed-coverage: 100% of mFlee fights carry gotAwayLines
  array + closeSnapResult field.
- KILL-ANATOMY-coverage: >=90% of multi-turn census fights carry
  anatomy.
- M5-voicing-canonical: sitting seeds carry canonical voicing or a
  named fallback; control-dead-before-window + zero relay finals
  in block = INFO/vacuous, not NO-GO (r124 rule, kept).
- M10-fullseat-gap: every sitting seed's full-seat gap is named
  (r130 revised rule: seat-kind pass — lesser despite full bars
  met is a named gap, not NO-GO).
- M11-standing-peak: standing peak reported for 4/4 seeds.
- FIRENARR/HURTRETURN-captured: every pilot JSON carries firenarr
  + hurtreturn arrays (instrument health; counts descriptive).
- FALLEN-ambush: every pilot JSON carries the fallen-ambush check.
- CORPUS-PURITY (gating, from r129/r130): pilot JSON summaries
  match pilot log summaries seed-for-seed (summary PROJECTIONS, not
  file-vs-log equality — r135 correction); zero diagnostic files
  in the pilot dir.
- ROAD-TALLY (tally only, not gated): uw5 count, w5faces count,
  full-seat count. M3-conversion, M4-wave5-or-full, W5-question
  NO-GO on a closed road are the expected road reading, not pilot
  failures (same reading as r121/r124/r128/r130/r131/r135/r140/r143/
  r144).

BINDINGS (dark re-verify — a miss is NO-GO, never re-scored mid-run):
- S1-sitter-coda: the re-run v3 walk-out line names Amelia Moon
  (the sitter) with her pronouns, not Bill Palmer.
- S2-dark-holds: the full r147 dark re-run keeps D1–D4/D6 green on
  the new substrate (same steps, same expectations as r138/r140/
  r143/r144; v1a's by-design curdle step stays the one expected non-ok).

BINDINGS (fix verification — each fix is verified in the wild
from pilot/dark transcripts; a fix failing in the wild is recorded
as a same-run investigation item, not forced):
- V-WAITVARIETY: in every pilot transcript, scanning hold lines in
  order, no two consecutive hold lines are identical (the rotation
  guarantees adjacency variety; a repeat after intervening different
  hold lines is allowed).
- V-FixB: no silent villager turn in any transcript (every 'wait'
  narrated) — carried from r144.
- V-Gorge: no "gorges — 0 kcal gone" line in any transcript —
  carried from r144.
- V-FixC: no stuck helper waits silently in a finale fight when
  the foe is in harry/strike range (help-branch fallback fires) —
  carried from r144 (no case arose there; falls again if none
  arises here).
- V-POCKETSAND: if a pilot transcript shows a scholar holding
  pocket_sand entering the losing window (<35% HP), the sand is
  pressed at least once before any flee; a flee-with-sand-held is
  a same-run investigation item.
- V-RAIDDENSITY: young-national raid staging gaps >=7 days on
  pilot seeds (no two raids within 6 days of each other on the
  same young national); a cluster is a same-run investigation item.
- V-STICKYOFFER: if any pilot seed announces a seat and a bar
  later dips, the transcript carries the holding line (not the
  withdrawal line) and the offer re-fires on recovery; an offered
  seat withdrawing is a same-run investigation item. If no seed
  announces-then-dips, V-STICKYOFFER is UNMEASURED (not failed).
- V-PREOFFER: a withdrawal beat fires ONLY on a seed whose table
  was never announced (announceDay null); a withdrawal on an
  announced seat fails this binding.

METRIC REVIEW: (filled after the pilot — if a metric proves wrong,
the revision is proposed here for the NEXT run, never applied
mid-run.) Carried: telemetry baseline re-seed is a panel decision,
not this run's; baseline NOT rolled on a quiet check. SIT-DAY-DEATHS
dedupe (r124 proposal) stays open until a sitting seed with a
sit-day death recurs. The 89701 flip investigation (r140) stays
open: this run's 89701 headline is its next data point. The
withdrawn-table steve-call is CLOSED by Steve's 2026-11-06 07:06
ruling + the landed sticky fix — the remaining question is wild
verification (V-STICKYOFFER), not the rule.
