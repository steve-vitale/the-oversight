# Journey endgame r144 — PRE-REGISTRATION (lane B, 2026-11-06 03:00 CST run, written before any scored seed)

Leg 4 (endgame). Rotation-b read 4 at run start. This run plays leg 4
and writes 5, social life, at closeout ONLY after a verified landing
— a failed or partial run does not advance the leg, per r135/r138/r140
precedent.

Run number basis: latest completed Lane B endgame run is r143
(2026-11-05, closed out by the main session after the coordinator
timed out; fixes landed as 030e34cd8). This run is r144.

Run-start incidents (infrastructure, not measurement):
- Lock: none present at start. New lock written (run_id
  2026-11-06T08:55:38Z).
- Main tree: `git status --short` 0 lines, disk 24% (fail line 85%).
- Reaper ran; 5/16 trees active, no cap pressure. Reaper flags
  build-smallfixes (owned by this lane, heartbeat 2026-11-05T16:25Z,
  ~16.5h stale) with uncommitted changes — this run recovers it in
  PARALLEL (see closeout section below). The pilot substrate is
  master b5fb49607 EXACTLY; the recovery lands as a separate merge,
  and the r144 branch rebases onto master+smallfixes at landing
  time if it lands first (proof tests re-run after the rebase).
  No scored seed runs on smallfixes code in this run.
- Registration: slow (~11 min, load high, sibling sims in flight)
  but clean on first attempt; heartbeat verified by read-back
  (09:22:46Z).
- Master at pull time: b5fb49607 (fetch: already up to date).

## build-smallfixes recovery (closeout, in parallel with the pilot)

Branch `build-smallfixes` (base e5e6aa59b), commit dd6f91a01
"[needs-eyes] preregs + pocket_sand flee-order fix + raid-cooldown
ship (gate removed)", plus uncommitted leftovers: results note
`evidence/2026-11-05/smallfixes-results-20261105.md`, prereg metric
correction, test-raiddensity-20261015.js design-changed update,
perseed corpora, 3 new scripts. Results file verdicts: pocket_sand
GO (proof 13/13, panel scholar press rate 96.7% vs 0% control),
raid-density ship GO with ONE disclosed marginal guardrail miss
(median survival −11d vs −10d bar on 16 divergent trajectories, no
new death mode, no plausible harm path — verdict stays GO with the
miss disclosed; the main agent / Steve can overrule or order a
re-run panel). Recovery plan: re-verify all 3 proofs green in the
worktree (DONE: 13/13, 28/28, 8/8), re-run `check.js --quick`
with full output to a log (in flight at prereg time), commit
leftovers via safe-commit.sh, rebase onto master, re-run proofs,
merge --ff-only, release the tree. If the gate re-run shows a NEW
failure caused by build-smallfixes, the merge is HELD and the
failure is reported as a same-run investigation item. The pilot
substrate is unaffected either way (master b5fb49607 exactly).

SUBSTRATE: r143 EXACTLY — capable + deedhunt + vetcommit + greedy
deferral (defaults MAXTIER 4 / LASTDAY 145, NOT tuned) + armorydrive
+ fullseat-diag + vetguard on waves seeds. FULLSEAT=1, VETCOMMIT=1,
CAPABLE_GREEDY=1, ARMORYDRIVE=1, CAPABLE_VETGUARD=1, TELEMETRY_FULL=1,
RELAYGREY=1. 180d, death-aware (+10d tail max on a dead village,
never ticked to fill the leg). Probe:
scripts/probe-endgame-r144-20261106.js (r143 probe verbatim EXCEPT
renames r143->r144, evidence dir 2026-11-06/perseed-endgame-r144,
header). Analyzer: scripts/analyze-endgame-r144-20261106.js (r143
analyzer verbatim EXCEPT input dir, r143->r144). No policy change,
no new instrument at pilot time. Diagnostics, if any, write ONLY to
perseed-endgame-r144-diag-<name>/, never the pilot dir.

HEAD DELTA SINCE r143 SUBSTRATE (4c7bf78cc -> b5fb49607, src only,
verified by git diff --stat in the worktree): 10 files, 366
insertions, 28 deletions. Attributed:
(a) 030e34cd8 r143 fixes (IN master): combat.js Fix C help-branch
fallback (+9), game.js Fix B narrated waits (+5), havenGrowth.js
gorge fix (+9/−1).
(b) c67e28ba2 awaynaming-cap-a: game.js +66 — naming-burst +
settle delivery gated on being at Haven, UNCAPPED queue (re-do of
killed gossipfix gate; relay keeps tale/witness).
(c) 477fa724d enddaybeats-fix-a: comms.js +16, exposure.js +9,
game.js +46, havenGrowth.js +23, ledger.js +33 — endDay family
beats gated/relayed on being at Haven.
(d) 1754764e3 catchup-summary-a: game.js +90 — held naming
catch-up summarized (framing + 1 burst + 1 settle summary per
return, <=3 lines).
(e) 4fa01558e journey-deepening r107: betrayal.js +15,
convo-wants.js +79 (new) — pocketed-thing fix (D-THING closed,
fired in the wild) + survival control.
(f) de065b4c6 version bump (stamp only).
PLUS, NOT in this pilot's substrate (parallel recovery, lands
separately; its wild verification falls to the next endgame run):
(g) pocket_sand flee-order (scripts/policies/competent.js —
POLICY ONLY): the scholar presses a held pocket_sand in the
losing window (<35% HP) instead of fleeing; once per fight.
(h) raid-density cooldown ship (src/js/game.js _rdOn()
unconditional + src/js/hierarchy.js unconditional stamp):
young-national raid staging now respects the 7-day cooldown with
no env gate. NO gate, price, deed, seat, or table change in any
of (a)–(h); gating freeze (Steve 2026-10-27 16:53) stands. This
pilot is a NEAR-REPRODUCTION check under deltas (a)–(f) only.
(a) r143 Fix C: helpers who cannot reach a hurt player fight from
where they stand — wild fight outcomes on sitting seeds may move
(r143 post-fix pilot already showed 89702 sat d108 vs d102, alive
7 vs 5). (b) r143 Fix B: waits narrate — hold-line VOLUME is this
run's measured follow-up (see question 6). (c) r143 gorge fix:
empty-pantry lingerers say the stores are empty, no "gorges — 0
kcal gone". (d) naming/relay changes (b)–(d): transcript TIMING
may shift on travel-heavy seeds; mechanics (kick/proposals/
majority/knowers/tale-log) run identically. (e) D-THING: pocketed
things now fire in the wild — a pocketed item may appear in a
pilot transcript where r143 showed nothing.
NOT in this pilot: (g) pocket_sand and (h) raid-density (see
above) — the scholar still flees at <35% with sand held, and
young-national raids may still cluster; both are the next
endgame run's wild-verification items, not this run's.
Any OTHER headline difference is a same-run investigation item,
never a road claim, and is attributed first to this delta before
any wider claim.

PILOT SEEDS (explicit SEEDS env — r131 lesson, never rely on the
probe default; this run passes ONLY the 4 pre-registered seeds):
89701 (waves), 89702 (waves), 89704 (forcedrift control), 89705
(wavesnw). Plan is keyed by seed value in the probe, so the subset
keeps correct plans. Seed reuse is DELIBERATE (matched before/after
per the r118/r135/r140/r143 precedent: same seeds, same probe
policy, only the game code changed) — no fresh band is needed or
claimed for the pilot.

R143 PILOT BASELINE (per-seed, from the r143 run note; judged on
these 4 only):
- 89701 waves: village-LOST — scattered day 80, pantry 0, alive 1.
  (r140: scattered d53. The flip PERSISTS — still a scatter, no
  lesser win, just later.)
- 89702 waves: WON LESSER (witness/light, final:wayback),
  announced d90, sat d102, alive 5. Standing peak 199.
  (Post-fix pilot: still WON LESSER, sat d108, alive 7, census
  6 → 12 fights, path witness → beloved, final:wayback →
  final:quiet.)
- 89704 forcedrift: village-lost — no-successor d40, alive 0.
- 89705 wavesnw: village-LOST — scattered d99, pantry 0, alive 2.

Tally r143: lesser 1/4, full 0/4, wave-5 unlocked 0/4, faced 0/4.

R144 QUESTION: (1) does the pilot reproduce r143 modulo the named
deltas? (2) does the 89701 scatter persist a third time (r140 d53,
r143 d80) or revert — the away-ration attribution is still the
leading hypothesis, still not proven? (3) do r143's fixes show in
the wild: helpers fight from where they stand (Fix C), waits
narrated (Fix B), empty-pantry gorge line (gorge fix)? (4) dark
re-verify: re-run the FULL dark probe as r144 (all 7 variants, same
policy, fresh evidence dir perseed-endgame-r144-dark/) and confirm
the v3 walk-out line names Amelia Moon, not Bill Palmer, and that
D1–D4/D6 still hold on the new substrate. (5) people check: does
the sitting seed's finale read as people, and do the r143-carried
polish items recur? (6) Fix B volume: count "holds and watches"
per seed (r143 post-fix: 120× on 89701, 62× on 89705) — if it
still clusters repetitively, the follow-up is varied hold lines
(or a once-per-fight cap); that fix, if built, gets its own proof
test and is judged on the post-fix pilot, not claimed from the
pre-fix one.

INTERESTING FINDING (what would count): any pilot-vs-r143-pilot
headline difference other than the named deltas; any full-seat
win; any wave-5 unlock or face; any mFlee carrying monFled=true on
a non-flee kind (monster-commitment violation); any hurt-return
misfire; any ambush death missing from fallen; any dark re-verify
(v3) step failing; any transcript passage senseless, robotic, or
self-contradictory; a stuck helper waiting silently in a finale
(Fix C failing in the wild); a "holds and watches" cluster that
reads as a stuck record (Fix B volume question).

BINDINGS (pilot-scaled from r143; metric binding §14 — a miss is
NO-GO, never re-scored mid-run; PRIMARY-BINDINGS is the headline,
per r135's metric review):
- M1-guard: >=3/4 seeds reach the window (announceDay != null) OR
  resolve via a voiced non-table path (honest-death / withdrawal).
- M2-census: every census fight carries a named outcome; engine
  opens == census fights.
- M2c/M2d: uncommitted classification complete (as r143).
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
  failures (same reading as r121/r124/r128/r130/r131/r135/r140/r143).

BINDINGS (dark re-verify — a miss is NO-GO, never re-scored mid-run):
- S1-sitter-coda: the re-run v3 walk-out line names Amelia Moon
  (the sitter) with her pronouns, not Bill Palmer.
- S2-dark-holds: the full r144 dark re-run keeps D1–D4/D6 green on
  the new substrate (same steps, same expectations as r138/r140/
  r143; v1a's by-design curdle step stays the one expected non-ok).

BINDINGS (r143-fix verification — each fix is verified in the wild
from pilot/dark transcripts; a fix failing in the wild is recorded
as a same-run investigation item, not forced):
- V-FixC: no stuck helper waits silently in a finale fight when
  the foe is in harry/strike range (help-branch fallback fires).
- V-FixB: no silent villager turn in any transcript (every 'wait'
  narrated).
- V-Gorge: no "gorges — 0 kcal gone" line in any transcript.
(V-PocketSand and V-RaidDensity are WITHDRAWN for r144 — the
smallfixes code is not in this pilot's substrate; they fall to
the next endgame run.)

METRIC REVIEW: (filled after the pilot — if a metric proves wrong,
the revision is proposed here for the NEXT run, never applied
mid-run.) Carried: telemetry baseline re-seed is a panel decision,
not this run's; baseline NOT rolled on a quiet check. SIT-DAY-DEATHS
dedupe (r124 proposal) stays open until a sitting seed with a
sit-day death recurs. The 89701 flip investigation (r140) stays
open: this run's 89701 headline is its next data point. Fix B
hold-line variety (r143) is this run's question 6, not a carried
metric.
