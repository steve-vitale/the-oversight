# sim-winnability-round-1430 — Loop B adoption run (2026-11-12 1630Z)

- **Run:** fleshout-loop-b-20261112T1630Z, Loop B, axis winnability chain —
  ADOPTION of the dead 1430Z run (stale-lock recovery, see below).
- **Loop A live** on its 1624Z claim (bisect ROUND 9 + stall-cut-49,
  scale-onramp) — NOT touched.
- **No new arm this run:** the adoption + landing closes the stranded
  1430Z work; the next blank needs its own pre-registration, not a
  rushed second arm (same call as the 2026-10-24 2130Z adoption run).

## Stale-lock recovery

- The 1430Z B lock (`fleshout-loop-b-20261112T1430Z`, created 14:33:09Z)
  was 117 minutes old at run start — past the 90-minute fallback — and
  its newest registered-tree heartbeat was 16:02:43Z, 27 minutes stale
  (past the 15-minute guard). No file in any of its three worktrees was
  written after 16:15Z. Dead by both rules; the lock was deleted and
  this run's lock written.
- All three 1430Z workers had finished: cut7confirm-b and proofrefresh-b9
  delivered done-reports; gateclassify-b was interrupted with its
  evidence file committed but its run sections unfilled (see arm 3).
- The 1430Z claim is retired to `.DEAD` at closeout, after all orphaned
  work was verified safely committed and merged (this file).

## Arm 1 — sim-cut7confirm-b: LANDED ea1ef5a75

Confirm duty on Loop A's most recent landed lever (bisect round-7 cut,
`21fc590d0`, 361st commit) on a fresh 16-seed band — the 1130Z next
blank #4 (ARC IV read pre-registered).

- **Verdict: CONFIRMED 4/16 + REGIONAL_INTACT 16/16 + ARC-TRACKS-RANK**
  on fresh seeds 190701–190716 (150d death-aware, competent verbatim,
  r131 roster-check fix swapped in uncommitted). The collapse
  generalizes at exactly the r7 rate (25%); the rank verdict goes
  unanimous; ARC IV fires on all 16 regional seeds (d42–d69).
- Edges, stated plainly: 4/16 sits exactly on the CONFIRMED band's edge
  (one more survivor would read INCONCLUSIVE), and the ARC negative half
  is vacuous on this band (no village-rank seed — it still rests on
  cut2confirm-b's two silent seeds). Full detail in
  `evidence/2026-11-12/sim-cut7confirm-b.md` (§§1–9).
- Wave-5 choke exact a third time: peak living wave-4+ veterans reach 2
  on exactly the seven unlocking seeds; fully-ready days equal pair days
  on six of seven (190707 holds the pair 20 days, fully ready 11 —
  weapons/armor-blocked the other 9). First tribute-ready end state on
  the r7 base (190710: Lena Ruiz + Amara Albrecht, both wave-4 killers
  d132, every wave-5 bar met) — still no tribute paid in the sim, and
  the capture still says nothing about it (tribute voiceless, still open).
- Roster-check fix holds: 0 phantom days on all 16 seeds; 17
  shadow-prevented days on 190708 (largest shadow read since anchor2-a).
  The collapse is not a phantom-veteran artifact.
- **Landing:** rebased clean onto fd0ee0b43; coordinator re-ran the proof
  on the rebased tree — `scripts/test-cut7confirm-b.js` **79/79 green**;
  merged ff-only as ea1ef5a75 (prereg b9b33a546 + evidence ea1ef5a75);
  ancestry verified; tree released done-merged, branch deleted.
  Zero src/js changes.

## Arm 2 — sim-proofrefresh-b9: LANDED fd0ee0b43

Measurement-proof refresh round 9 — the 1130Z next blank #3. Owed:
the b8 panel went stale on 4 manifest keys (index.html, build.js,
conversation.js, game.js).

- **Verdict: GO on its generation tip 5c4361ccc** (11/12 legs +
  manual cache-flags 4/4, two consecutive standalone 4/4 runs; fresh
  uncached probe spawn 2m42s vs the 30s test cap under load avg ~9.5 —
  the cap, not the cache-flag logic, trips). Fresh real neutral panel
  (64 rows, 16 seeds × 4 policies, 150d): national 14/64, wins 15/64
  (all capable), entered 15/64, wave-5 12/64, wave-4 63/64, median 90d.
  Neutrality reproduces the b8 and b7 panels identically — regeneration
  moved no verdict. Full detail in
  `evidence/2026-11-12/sim-proofrefresh-b9.md`.
- **Landing (adoption addendum):** rebased clean onto 87f00547d; on the
  landing tip the proof reads **9/12** — the 3 failing legs are one root
  cause, manifest staleness: exactly **2 of 525 keys** differ
  (`src/js/convo-wants.js`, crisis r186; `scripts/policies/competent.js`,
  landing r128). The panel artifact is intact (sourcesStable true,
  neutrality matches, 64/64 rows, ontology 138, cache-flags 4/4 in-run).
  The b8 panel it replaces was stale by 6 keys on this tip, so the
  re-point improves staleness 6 → 2; the proof-update and workflow tests
  already failed on master before this landing and still fail after it
  — no gate regression, only a smaller stale count.
- Merged ff-only as fd0ee0b43 (panel b0f0ec909 + addendum fd0ee0b43);
  ancestry verified; tree released done-merged, branch deleted.
- **Proof refresh round 10 is owed** on the next manifest change:
  regenerate a real panel on the then-current tip and re-point. Do not
  hand-edit the manifest. (The 2-seed capable wave-5 dip vs b8, 6→4, is
  reported as carried panel noise unless a later round reproduces it.)

## Arm 3 — sim-gateclassify-b: LANDED f80673eb3

Classify the round-6 gate's 16 unclassified failures (1130Z blank #5).
The worker was interrupted mid-classification (evidence sections
unfilled, 2 logs uncommitted); the 1630Z coordinator finished the arm.

- **Gate run (worker):** `check.js --quick` under setsid, 340 scripts,
  **327 passed, 13 failed in 1734s.** The parser extracts all 13 names
  — the round-6 loss does not repeat.
- **Verdict: GO — 13/13 classified, 0 unclassified, 0 (d) real failures:**
  (a) CPU-starvation timeout 9, (b) stale-panel 2, (c) known artifact 2.
  Every timeout failure passed standalone on the first attempt
  (living-garden 117s, one-person-army 81s, occupation-panels 33s,
  synergy-stall 17s, capable-bot 15s, solo-campaign 15s, time-save 12s,
  table-endings 8s). The two (b) failures are the stale-panel root
  cause b9 was generated to fix (still failing: b9 is stale by 2 keys
  on the landing tip — round 10 owed). Cache-flags fails standalone
  (86s, 0/4 — the known 30s cap artifact, cap stays 30s); phone-frame
  fails standalone (9s, 3 passed/3 failed — known stale phone
  evidence). The trust-observer gate Error looked like the one real
  failure and is not one: it passes 6/6 standalone in 47s.
- Watch item (not a finding): living-garden passes at 117s, 3s under
  the 120s cap — it will keep flaking in gates under load.
- **Landing:** rebased clean onto ea1ef5a75, then again onto f9e41d347
  after Loop A landed both r9 arms mid-run; coordinator re-ran the
  proof on the rebased tree — `scripts/test-gateclassify-parse-20261112.js`
  **11/11 green**, parser extracts 13/13 from the real log; merged
  ff-only as f80673eb3 (prereg 45c60154f + classification f80673eb3);
  ancestry verified; tree released done-merged, branch deleted.
  Zero src/js changes.

## Wall numbers (this run's judged corpora)

| | cut7confirm-b (fresh 16) | proofrefresh-b9 panel (64 rows) |
|---|---|---|
| Survived | 4/16, median 127d | 5 survived / 15 over-other / 44 village-lost |
| National | 0/16 | 14/64 |
| Table (entered/won) | 0/16 | entered 15/64, won 15/64 |
| Wins | 0/16 | 15/64 (all capable) |
| Wave-5 unlocks | 7/16 | 12/64 |
| Wave-4 unlocks | 16/16 | 63/64 |
| Deaths | 1370 (96.8% combat/expedition/wild/monster) | — |

The scale wall stands on the confirm leg (national/table/wins 0) while
the panel — a capable-policy instrument, not a win-seeking run — shows
wins only through capable play. The collapse generalizes; the stall
stays gone on fresh seeds; the wave-5 choke is exact a third time.

## Telemetry deviation check

Attempted on the cut7confirm corpus
(`evidence/2026-11-12/perseed-cut7confirm-b/*.json`, metrics
national,table,wins,exiled): **REFUSED by the tool itself** — same
refusal class as every bisect arm since vetphantom-b ("refusing
recorder-corpus input: all 16 --current rows carry top-level
anchorCommit, so they are sweep recorder rows, not runs. Recorder
corpora are compared with sweep-compare tables, never against a run
baseline here."). Recorded, not waived. No `--update-baseline` passed;
baseline NOT rolled.

## Metric review (§14)

- Cut7confirm judged only against its prereg (CONFIRMED ≤4/16,
  REGIONAL_INTACT ≥11/16, ARC-TRACKS-RANK rule) — never re-scored; the
  evidence file flags the thin margin and the vacuous ARC negative half
  rather than celebrating them. The analyzer is the judge; it exits 0.
- Proofrefresh-b9 judged on its generation tip (GO 11/12 + manual 4/4);
  the adoption re-ran the proof on the landing tip and reports 9/12
  honestly — the landing does not claim the proof is green on the merged
  tip. The staleness is a property of master moving (r186 + r128), not
  of the arm.
- Gateclassify judged only against its prereg (100% classified with a
  standalone reproduction): GO, 13/13, 0 (d). The classes are the
  prereg's classes applied as written; no failure was re-scored after
  the fact (the trust-observer gate Error was classified (a) only
  after a green 6/6 standalone run, not by assumption).
- No `--update-baseline` was passed anywhere in this run. No baseline
  was rolled.

## Infrastructure

- Stale-lock recovery at start (see above); dead 1430Z claim retired to
  `.DEAD` after its work was verified committed and merged.
- Safe-commit index clobber struck the b9 addendum commit (MM on the
  single committed file) — repaired via the `ls-tree -r HEAD |
  update-index --add --index-info` pipe; commit verified correct
  (worktree hash == HEAD blob) before merging.
- No EPERM flap observed this run. No rebase stop-at-pick quirk on any
  of the three rebases (all clean, first attempt).
- Master moved twice under this run after adoption started: Loop A
  landed both r9 arms mid-run (bisect-r9-cut-a 6dc03a94e, INCONCLUSIVE
  4/8 + REGIONAL_INTACT 7/8; stallcut49-a f9e41d347,
  STALLCUT49_COLLAPSED + STALL_STILL_IN, 1/8 survived, 0/8 regional,
  median 102d). Both are evidence/scripts-only — zero manifest-key
  overlap, so the b9 stale count stays 2 and no re-proof was needed;
  gateclassify rebased onto the new tip clean and re-proved 11/11.
  Loop A's coordinator evidence for the 1624Z run was not yet on master
  at closeout — the next run's tracker read should pick it up.

## Next blanks, in order

1. Proof refresh round 10 on the next manifest change (b9 landed
   stale-by-2; regenerate + re-point, do not hand-edit).
2. Gateclassify is DONE (arm 3 above) — the 1130Z blank #5 closes; the
   next gate run reuses the parser, and any new failure gets a
   standalone reproduction the same run.
3. Player named-class `regression_watch` (13/16→10/16) — one line in
   the next synergy follow-up (carried from 1130Z blank #2).
4. A third fresh band on the r7 base to test whether 25% is the true
   collapse rate or the edge of it (cut7confirm §7) — and a band with
   village-rank seeds to test the ARC negative half.
5. The wave-5 choke is now a two-veteran coincidence problem measured
   on three bands: the next winnability build should make the second
   wave-4 killer form while the first still lives, or keep the first
   alive longer — not re-measure the choke.

scale-onramp stays converging (NOT converged): national/table/wins still
0 on the confirm leg; the bisect has narrowed the collapse to the final
16 commits (378–393) and the stall to commits 33–65, and the collapse
now generalizes across two independent bands — but no lever has moved
the wall numbers. winnability chain: the r7 collapse is confirmed, the
rank stall is gone on fresh seeds, the wave-5 choke is exact a third
time, the measurement proof is refreshed (stale-by-2 on landing).
Claim deleted; lock deleted.

## Correction (coordinator, same run)

The Infrastructure section misstates the landing order: Loop A's
coordinator evidence `1df1a506d` (16:57:42Z) is the parent of this
file's commit `5c5fbafc2` (16:58:40Z) — A's commit landed first, this
one on top of it. No interference either way; the substance stands.
