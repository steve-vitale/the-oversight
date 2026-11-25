# Loop B round — run fleshout-loop-b-20261124T2230Z (axis winnability-chain — wilddeath DIAG-GO landed; fleeguard GO-judged, IN-FLIGHT at closeout)

## Run shape

PARTIAL CLOSEOUT: the coordinator's execution window ended with arm 2
(sim-fleeguard-b) judged GO in its analysis JSON but its corpus +
analysis still uncommitted and its evidence file unwritten, worker
still running. Arm 1 (sim-wilddeath-b) is fully landed. This record
is the adoption handoff for the next B run: do NOT re-run wilddeath,
do NOT duplicate fleeguard — adopt it from its branch + worktree
(see §Fleeguard in-flight).

Pre-flight: main tree clean, disk 49%. Loop A live on scale-onramp
the whole run (2315Z claim: homecraft-gate, spearlead, leadworst) —
NOT touched. Master moved twice under the run (journey-deepening
r286: dd50d5914 + d1d61f517 adoption, zero overlap with either arm;
this run's wilddeath merge 23a5373f8).

Stale-queue correction (checked against master + evidence before
spawning, NOT re-taken): the body's re-point queue items (1) arm-2
toggle and (2) flee-repair are disposed — arm-2 toggle CLOSED
2026-11-06 (togglepin-b, MORALE CREDITED; commits 3aa547d35 /
9d1c4e857 / 240197925); flee-repair LANDED as fleerepair3-b in the
1030Z round today (d84d63ba0, parting hits 13→0). The 2130Z round's
"next blanks" re-listed both from stale body text; the tracker
entries from 2026-11-13 already record the disposal. The arms
taken instead are the two fresh named nexts: fleecall-b's
live-numbers guard BUILD and vetpair-b's wild-death attribution
DIAG (findings line 2734).

## Arm 1 — sim-wilddeath-b (DIAG-GO, merged 23a5373f8)

What actually kills a veteran "in the wild" (vetpair-b blank #2,
findings line 2734). Fresh 16-seed band 109447–109462, 150d,
competent verbatim, zero src/js. All four frozen bars pass:
18/18 wild veteran deaths classified (0 unclassified); instrument
health clean (proof 11/11, determinism replay byte-identical);
dominant wild-killer named with counts; veteran census reproduced
35/35. ANSWER: "the wild" is lost played field fights — 95/95
wild deaths (all 18 veteran, all 77 non-veteran) are the scholar
losing a turn-based field fight (`tbEnd`, game.js:48334), cause
stamped by `tbFightDeathCause`. Reunion the commonest killer
(11/27 monster mentions); 10/18 veterans died solo; 4 blooded
and died the same day; median blooding→death 12 days. Wall
(this census): wins 0/16, national 0/16, table 0/16, wave-5
unlocks 9/16, faced 7/16, kills 6, wave-4 faced 16/16, median
survival 150d (censored, 10/16 survived). Evidence:
evidence/2026-11-24/sim-wilddeath-b.md. Commits (rebased onto
d1d61f517 clean, proof 11/11 re-run green on the rebased tip):
prereg 3c40f3247, instrument 86c443097, corpus 4d990c257,
evidence 23a5373f8. Tree released done-merged, branch deleted.
Telemetry deviation check: NOT APPLICABLE (census, no
before/after; scale-wall baseline carries a DO NOT compare note
for pre-seat substrates).

## Arm 2 — sim-fleeguard-b (GO-judged, IN-FLIGHT, not landed)

Live-numbers guard BUILD on the hopeless flee read (fleecall-b
finding #2602 named next build). Default-OFF lever FLEEGUARD=1.
Branch sim-fleeguard-b, tip 6742a0d8e [needs-eyes] (lever + proof
+ driver + analyzer + panel builder), prereg 519dbc69b + correction
63c2c6bb6. Legs complete on the fleecall band 109501–109508, 150d,
competent: 8 ctl + 8 arm per-seed files + smoke0 legs, analysis
JSON `evidence/2026-11-24/fleeguard-b-analysis.json` (UNCOMMITTED
at closeout) judges GO on all 9 frozen bars: pool ctl 27 / arm 23;
zero drift (ctl reproduces the fleecall baseline exactly:
27 meetings, 0 kills, 20 vFlee, 7 vDie, 11 hopeless / 9 floor);
primary hopeless-flee count arm 9 vs ctl 11 (bar ≤ ctl−2);
mechanism guard fires 6× (bar ≥2, ctl 0); floor untouched 9 vs 9;
vDie 5 vs 7; starvation 1/0 vs 1/0; median survival 146d vs
142.5d; instrument health clean. Kill share is NOT the primary
here (prereg followed the fleecall metric note: the guard moves
hopeless flees, not kills) — the adoption run must judge ONLY on
the frozen prereg bars, never re-score.

ADOPTION (next B run): branch sim-fleeguard-b (tip 6742a0d8e,
base b48b195db) + worktree ~/workspace/worktrees/sim-fleeguard-b
(registered, heartbeated 01:11:31Z at this closeout — re-heartbeat
on adoption). Uncommitted at closeout: fleeguard-b-analysis.json,
perseed-fleeguard-b-arm/, perseed-fleeguard-b-ctl/,
perseed-fleeguard-b-smoke0-arm/, perseed-fleeguard-b-smoke0-ctl/
(all present on disk, verified 01:20Z). The worker was still
running at closeout — confirm it is dead before touching the
tree (subagent list + ps), then: commit corpus + analysis +
evidence (evidence file unwritten at closeout — the worker may
have finished it after this record; check the tree first), run
the §15 balanced-panel compare, rebase onto current master,
re-run the proof test on the rebased tip, merge --ff-only,
release the tree, delete the branch. Claim file narrowed to
["sim-fleeguard-b"] at this closeout and LEFT LIVE as the
anti-duplication record; retire it to .DEAD when the arm lands.
Do NOT re-run the legs (the analysis JSON is the judged record).

## Wall numbers (this round's judged corpora)

Wilddeath census: wins 0/16, national 0/16, table 0/16, wave-5
unlocks 9/16, faced 7/16, kills 6, median survival 150d
(censored). Fleeguard band (from the uncommitted analysis JSON,
judged but unlanded): ctl median 142.5d, arm 146d; kill share
not the primary (see above); hopeless flees 11→9. Villages
still reach wave 5, survive, and never reach national or win.

## Infrastructure

- Write flap: active at run start (~23:35Z lock/claim writes
  refused; probes passed 23:36, .git writes failed 23:37, cleared
  ~23:44) and in bursts through the run (wilddeath worker logs
  windows ~00:0x–00:08, ~00:10–00:26, ~00:30–00:38, ~00:39–00:43;
  all cleared on their own, nothing lost). Registration of
  sim-wilddeath-b failed once on a .git ref-lock write (23:47Z),
  succeeded on retry (23:52Z).
- Registry lock jammed repeatedly (journey-scale registration +
  Loop A heartbeats + my heartbeats queueing on the flock):
  heartbeats skipped twice at 120s waits; landed with
  HEARTBEAT_FLOCK_TIMEOUT=300. NEW FIX (this run): a stale
  0-byte REGISTRY.json.tmp blocks registry writes even after the
  flap clears — removing the 0-byte temp unblocked heartbeats
  twice (00:26, 00:47). Lesson appended to ~/AGENTS.md.
- Safe-commit index clobber struck all 3 wilddeath worker commits
  (repaired via `git ls-tree -r HEAD -- <paths> | git update-index
  --add --index-info`, commits verified correct). One empty commit
  (835468d23) on the wilddeath branch from safe-commit.sh passed a
  directory path — reset --soft on the private branch, corpus
  recommitted with explicit file paths.
- Rebase stop-at-pick quirk did NOT strike (clean wilddeath
  rebase, 4/4 picks).
- Master moved twice under the run (journey-deepening r286);
  wilddeath rebased clean, proofs re-run green.

## Next blanks, in order

1. Adopt + land sim-fleeguard-b (GO-judged; see above). On
   landing, the [needs-eyes] commit asks Steve to look at the
   feel of held fights, not the code.
2. The fight, not the label (wilddeath blank #1): veterans die
   losing played field fights, 10/18 solo, Reunion commonest.
   Next levers are the win-fielddmg lane (damage + staying) and
   the persistent-party build — coordinate, do not duplicate.
3. Reunion in the wild (wilddeath blank #2): over-lethal relative
   to spawn share? Join the bloodcluster contact denominator to
   this census's death rows — no new sims.
4. Call-sounding muster instrument (titanmuster: the call is
   never sounded, muster count structurally 0).
5. Launch-fitness fresh band (departure-stamping driver).
6. Same-fight different labels (wilddeath blank #3): scholar
   "the wild" vs companion "combat"/"monster" for one fight —
   small fix or canon note.

## Tracker state

winnability-chain stays converging (NOT converged): the wild is
now attributed end to end (lost field fights, not exposure) and
the flee guard is judged GO but unlanded — but villages still
reach wave 5, survive, and never reach national or win.
scale-onramp stays converging (untouched; sibling loop A).

Merged locally, pending ship: wilddeath-b 23a5373f8 (full merge).
In-flight: fleeguard-b (branch sim-fleeguard-b @ 6742a0d8e,
worktree registered + heartbeated, claim narrowed + left live).
Claim narrowed; B lock deleted at closeout (cat + delete in the
same call, run_id verified).
