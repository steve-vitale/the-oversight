# sim-scale-onramp round 0416 — run fleshout-20261028T0416Z (axis scale-onramp — 3 arms LANDED, all GO, merged locally pending ship)

Loop B live on food-economy the whole run (0330Z claim at start, 0444Z claim
during closeout, arms sim-onceaday-b / sim-outflowzero-b / sim-culthall-b /
sim-childbirth-b, NOT touched); tackle-all / journey / gap / panel trees NOT
touched. This run took the tracker's scale-onramp blanks in order: (1) the
wall-wounds-finished fix (#1300), (2) path diversity per the waitlong-a
recommendation, plus the kill-scarcity conversion census (#1267). The
fighter-construction footnote audit (#1301) was NOT taken — it remains open
for a future run.

## Pre-registration (binding, per arm)

Each arm committed its prereg before any judged sweep (see arm evidence).
Shared substrate, VERBATIM from sim-w4damage-a: seeds 75101–75108,
LEANLINKRESCUE=1, TABLESEATNOWAIT=1, 180d death-aware, full env set plus a
substrate-activation gate (courtship counters non-zero). No arm re-scored a
prior arm's verdict or corpus; the lethality verdict and the rebaseline
verdict stand untouched.

## Arm 1 — sim-wallwounds-a (backlog #1300, GAME FIX) — GO 4/4

Commits: prereg 146f11c93, fix + instruments + evidence + corpora
1af4ddfd9 (rebased twice onto moving master; final tip merged).
Fix, in plain words: when a lingering raider loses a turn-based fight, the
village no longer hands its wounds back. The monster returns to the treeline
at the worse of its pre-fight health and its fight-end health, so a wound
the wall already dealt can never be healed by losing a fight. One line in
src/js/game.js tbEnd(), lingerer branch only; titan full-restore untouched.

- (a) Reproduction on unmodified code PASS: 75106 seq 55 eulogy, toll
  900→675, TB lost, fighter end 740, world restored 740 (snapshot AND next
  fight-start agree).
- (b) Post-fix same case restores to 675, no crash PASS. The toll is whole
  at last: net −225, not −160.
- (c) 8-seed before/after gates PASS: detgate 75101 132/132 days,
  tsNationalDay 77, both code versions; median 162d → 162d (ratio 1.000);
  starvation 2 → 2; courtship 121, 8/8 active, both bands.
- (d) No other restore path regressed PASS: unit proof 6/6 (RED pre-fix,
  GREEN post-fix); corpus census 15 joined lingerer re-entries, 0
  violations post-fix (was 6 healing, worst: 75102 seq 21 ratcheted
  300 → 1,200 full strength across two lost fights in one day — now held
  at 300).
- Band totals identical before/after on every headline: national ever/final
  7/8 / 5/8, table invited/entered 6/8 / 3/8, wins 3/8 (3 lesser / 0 full),
  wave-4 5/8, wave-5 0/8, deaths 299. Honest limit, stated in the arm
  evidence: stopping the numbers lying does not by itself get any village
  to wave 5.
- Sense: the raid beat still names the toll once per raid with no numbers
  or victims; no beat claims a monster came back healthier. The numbers
  now agree with the words.
- Evidence: evidence/2026-10-28/sim-wallwounds-a.md (+ prereg),
  corpus perseed-wallwounds-a/ (before/ + after/), proof
  scripts/test-wallwounds.js + scripts/test-wallwounds-restore.js.
- check.js --quick on the arm: 278 passed, 9 failed, all 9 proven
  pre-existing by re-running them on the fix reverted.

## Arm 2 — sim-w4convert-a (backlog #1267, MEASUREMENT ONLY) — GO

Commits: prereg 2b9a41ade, census + instruments + evidence + corpus
7b4d4ca7c (rebased onto merged master; final tip merged). Zero src/js
changes. Detgate PASS on old numbers exactly (75101: 132/132 days,
tsNationalDay 77); parity vs the w4damage corpus PASS EXACT on all 8 seeds
× 13 checks; substrate gate courtship combined 121, 8/8 active.

Conversion funnel, universe = 51 fresh wave-4 world spawns:

| channel | faced | engaged | killed |
|---|---|---|---|
| field | 16 | 16 | 0 |
| raid | 22 | 4 | 0 |
| TB | 18 | 18 | 0 |
| band (distinct instances) | 31 | 29 | 0 |

51 spawned → 31 faced (61%) → 29 engaged → 0 killed. The funnel does not
narrow at engagement — it narrows at meeting and at killing, completely.

- Never-met: 20/51 (39%) — 19 still present at run end, 1 departed
  unfaced, 0 vanished. All 3 scripted-titan heralds never met. Spawn
  sources: tile-entry 45, scripted-titan 3, maintain 3 (all 75102),
  wanderer-contact 0.
- Met-but-no-kill: 31/31 faced (100%). Field fights (39 rows, 432 total
  damage, 0–33 per fight) end only flee/die, never kill. All 25
  world-origin TB fights end 'lost'. 12 of 22 raid drafts were
  tolled-and-released with no fight at all.
- 75101 is the unlocked-but-empty seed: wave 4 unlocked, lesser seat won
  d132, zero wave-4 world spawns.
- Killer identity (#1268): kills 0, so the killer field is empty by fact,
  not by missing data; every kill slot is present and empty. A new daily
  scholar-history capture is proven on this band (75103 changed scholars
  11 times, 75106 12 times), so a future band with kills gets a day-matched
  scholar/villager split. TB kills, when they occur, will read as
  'scholar-led TB party' — the recorders carry no killing-blow attribution
  and none was invented.
- Mechanism hypothesis (counts-grounded, not a lever claim): (1) meeting
  is the first filter (39% never met; 12/22 raid drafts never become a
  fight); (2) field fights cannot accumulate a kill (432 damage across 39
  fights vs 850–1500 HP monsters; per-instance field damage tops at 82);
  (3) TB fights reset the board upward — in 23/25 TB fights the monster
  ended with MORE health than it started, because TB scaling plus the
  (now fixed) lingerer restore wrote the higher number back.
- Sense (75103, seq 48 audit): raid-drafted d116 ("Nobody met The Audit —
  it's still out there at the treeline"), then a 17-round TB fight d117,
  lost, monster 499/1214 — the band's longest TB fight and its only real
  dent.
- Analyzer disclosure: first run judged mechanical FAIL (unclassified 2);
  both records were non-world expedition-leg fights mis-bucketed as world
  touches; fixed to bucket them as non-world field fights, re-run passes
  with unclassified 0. GO rule, prereg, and corpus untouched.
- Evidence: evidence/2026-10-28/sim-w4convert-a.md (+ prereg),
  corpus perseed-w4convert-a/, instruments scripts/test-w4convert*.js.

## Arm 3 — sim-seatpath-a (path diversity, POLICY ONLY) — GO

Commit: 0846603f0 (rebased onto merged master; final tip merged, prereg
inside the same commit set). Zero src/js changes; new policy
scripts/policies/tablepaths-relay.js wraps tableseat-nowait (relay if
offered, else first non-Feared, else flagged Feared); tableseat-nowait
untouched. RELAY chosen from docs before any sweep: TABLE.md names its
stage-3 qualification the most reachable route by design and the only door
qualified by integration depth instead of territory.

- Baseline replication exact: entered 3/8, won 3/8, all lesser/Feared.
- Armed: entered 3/8, won 3/8, ALL lesser/Relay (rule `relay` on all 3;
  fallback rules never fired). Relay won 3/3.
- Detgate 75101 PASS (132/132 days, relay counters absent with the switch
  off); substrate gate PASS (courtship combined 38, 8/8 non-zero); cost
  bar PASS (starvation 2 = baseline 2, arm-only 0, median 162 = 162);
  death totals byte-identical between arms — the door changed nothing
  except the path walked and won.
- No gate blocked relay. All six lesser doors were offered on 75101/75105,
  five on 75104 (witness unearned, 1 exposure). Indispensable never
  offered (full-seat-only, as expected). Full seat is not this arm's
  target and was not reached — every seating is lesser, stated plainly.
- Sense (75101, non-measured replay): reads as the Relay, not re-voiced
  Feared — switchboard plug-in, probe/backfire beats, Relay-sight /
  Sanctuary / Advocate granted in play, grey-band "both-hands" final.
- Doc/code gap documented, not fixed: TABLE.md names sysBond ≥ 2 for
  relay, but code earns it on stage ≥ 3 alone — all three relay earnings
  carry sysBond 0. Filed as a backlog item by this run.
- Evidence: evidence/2026-10-28/sim-seatpath-a.md (+ prereg),
  corpus perseed-seatpath-a/ (16 rows + summary), proof
  scripts/test-tablepaths-relay-sweep.js.

## Wall (this band only, never pooled — all three arms agree)

National ever/final 7/8 / 5/8; table invited/entered 6/8 / 3/8; wins 3/8
(3 lesser / 0 full); wave-4 5/8; wave-5 0/8; median survival 162d;
starvation 2; deaths 299, combat family dominant. The scale wall moved in
one honest respect this run: wall wounds no longer heal themselves. It did
not move on reach: the full seat stays 0/8, wave 5 stays 0/8, and the
conversion census says why the next fix must pick a half — meetings
already convert at 0% kills, so a meeting-count lever cannot be judged by
meetings alone.

## Village assessment (plain words)

The village on this band is a competent, courtship-active village that
reaches national standing more often than not, sits at the lesser table
about a third of the time, and wins there — through Feared or through
Relay, the door does not matter, the first-option beats underneath do.
What it cannot do is kill a wave-4 monster: it meets barely three-fifths
of the ones that spawn, fights the ones it meets, and never finishes one,
because field damage is a scratch against 850–1500 health and turn-based
fights rebuild the monster stronger than it walked in. The fix landed
here removes one quiet cheat — lost fights healing toll wounds — but the
village still has no language for a wounded monster: no beat names a
toll-wounded lingerer, no trip is routed to finish one. That visibility
blank, and the meeting half (why raid drafts never become fights, why
heralds are never met), are the next work — not another door.

## Metric review

Pre-registered metrics bound every arm and were honored: wallwounds GO
4/4 on its own legs; w4convert GO on census completeness (unclassified 0);
seatpath GO on relay entered ≥ 1 with the cost bar. No metric was
re-scored mid-run; the w4convert analyzer fix corrected a bucketing bug on
the unchanged corpus (disclosed in arm evidence), not a threshold. The
balanced-panel §15 exception stands (balance-panel.js has no
corpus-ingest mode — the standing limitation, same as prior rounds);
paired before/after sweep tables + exact parity are the substitute, and
no panel artifact was faked.

## Telemetry deviation check

Ran on the wallwounds after-corpus (9 files): 3 LOUD lines (national
12→0, table −62% 16→6, wins 16→0) — the known WINSEAT-baseline vs
tableseat-nowait-substrate regime mismatch plus per-seed field-shape
artifact class, identical to the w4damage arm's lines. No exiled line.
Baseline NOT rolled.

## Infrastructure notes

- Registry-lock contention queued all three worktree registrations (~100s
  each, sibling loop B live); waited out, no bypass.
- Safe-commit index clobber hit all three worker commits (bogus staged
  deletions for files byte-identical to HEAD); repaired via HEAD-blob
  cacheinfo each time, commits verified correct.
- LANDING INCIDENT (coordinator, disclosed): the first merge batch
  merged wallwounds only — the next two ff-only merges correctly refused
  because a branch rebased onto HEAD N is not fast-forward-mergeable
  after another branch lands on HEAD N+1. The release step had already
  marked all three done-merged and removed the two unmerged worktrees;
  the branches themselves were intact and the registry entries were gone
  on release, so recovery was clean: re-registered both slugs (attached
  to the existing branches), rebased each onto the new HEAD one at a time
  with proof re-runs, and merged one at a time. Final master
  0846603f0, main tree clean, all three branches deleted. Lesson for the
  next run: merge strictly one branch at a time — rebase, prove, merge,
  release, remove — before touching the next branch.
- Coordinator post-rebase proofs on the final base: wallwounds analyzer
  GO + unit 6/6 + detgate 75101 PASS (132/132, tsNationalDay 77) + a fresh
  75106 run byte-identical to the committed AFTER row; w4convert analyzer
  PASS; seatpath detgate PASS (132/132, delegation byte-identical).
  Analyzer re-runs rewrote only `generated` timestamps in analysis /
  summary JSONs; those churn files were reverted, not committed.
- Master moved three times under this run (sibling B 0330Z + 0444Z rounds,
  journey-deepening r59); zero file overlap with any arm in every delta;
  no re-sweep was needed beyond the proofs above, because the final-base
  delta carried zero src/js and zero policies changes for the two
  measurement arms, and wallwounds got a live single-seed re-run.
- No EPERM flap this run. No push, no bump, no live verification
  (ship-loop line).

scale-onramp stays converging (NOT converged): a real game fix landed and
the kill funnel is now censused end to end, but no lethality fix has
landed, the full seat is still 0, and wave 5 still unlocks nowhere. The
directive stands until the tracker records this axis converged on measured
evidence. food-economy stays converging (untouched; sibling B loop live).
Rotation left at 3. Claim deleted; lock deleted.

Next blanks, in order: (1) visibility for toll-wounded lingerers (the
w4damage option (b): name them in the village's language, measure whether
they get finished more often); (2) a KILL-judged arm on one half of the
conversion split — either the meeting half (why 12/22 raid drafts never
become a fight, why 3/3 heralds are never met) or the TB half (why TB
monster health scales above world health, whether a won TB fight is
reachable at all), pre-registering a kill or won TB fight as GO, not a
meeting count; (3) the fighter-construction footnote audit (#1301);
(4) the TABLE sysBond doc/code gap (sysBond ≥ 2 in docs, stage ≥ 3 alone
in code).
