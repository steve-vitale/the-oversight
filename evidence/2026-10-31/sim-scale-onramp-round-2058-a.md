# Coordinator evidence — run fleshout-20261031T2058Z (Loop A, axis scale-onramp)

Loop B live on food-economy for the whole run (1830Z claim, then its
2030Z closeout — NOT touched) -> A worked scale-onramp (converging).
Claim filed before any sims (this run's claim also names the closeout
step); rotation file untouched (convergence-directed axis work
supersedes rotation, per the 1535Z/1702Z precedent).

## Step 0: stale-lock recovery of run fleshout-20261031T1850Z

Takeover state: 1850Z lock 120+ min old (past the 90-minute fallback),
fieldfinish2-a tree heartbeat 76+ min stale, no fieldfinish processes,
tree writes quiet 22+ min (last write 20:33Z). Per the guard, the 1850Z
run was DEAD; lock deleted, claim retired to .DEAD with note. Loop B's
2030Z food-economy claim was live at takeover and was NOT touched.
Two of the 1850Z arms had already landed on master before recovery
(soleprotect 3964c936e, rosterlot 6fd6b448d); the third
(fieldfinish2-a) was adopted as this run's closeout. One 1850Z claim
note item needed NO action: its step-0 adoption of branch
sim-food1630b-closeout was already done by the 1830Z B run (00e1bd4db
on master); that branch was NOT rebased or merged here.

## Arm 0 (closeout): sim-fieldfinish2-a — PILOT NO-GO, reverted, landed

Worker's pilot corpus was complete at adoption; the coordinator judged
it from the artifacts and re-verified each leg (direct corpus
tabulation, det-gate re-check, proof re-runs). Verdict: PILOT NO-GO.
Converted wave-3+ field kills 0 (bar >= 2); wave-3 field vKills 0 vs 0;
median survival 90 vs 118.5 (bar 94.8 — fails as written, read as
early lesser wins, not collapse: 7 lever wins by day 97, only 2
national, village-lost 1v1); field wave-3 deaths 5 vs 4 + 3 bar PASSES;
national 2 vs 7 - 2 bar FAILS. The rule fired 61 times, ALL wave 1–2
(57 ending vKill) — fights the baseline already wins — and never on
wave 3 (0/71 fights). Panel decision review_required, national
regression_signal. Confirm NOT run, per prereg. Game code reverted and
verified byte-identical to base pin 00e1bd4db (diff vs HEAD, vs base,
and vs base over all of src/ all empty). Det-gate green (ON vs OFF
dayHash arrays + end fields byte-identical, both seeds); corpus
determinism green (87104 re-run byte-identical); proof 81/81
PRE-revert. Landed: prereg (rebased 915be95f4) + evidence/corpora/
panel/analyzer (rebased 2d25029bb). No [needs-eyes] (no feel change
lands — the change was reverted).

LOUD — instrument loss during recovery: six uncommitted instrument
files present in the adopted worktree at revert time were found missing
before the landing commit (policies/ dir mtime 20:59Z), with no
coordinator delete/rebase/commit in between: the fieldfinish2 sweep,
splitter, panels, det scripts, and diag recorder. Never committed
anywhere, so LOST, not misplaced — a new surface of the container's
silent-loss class (cf. the 2026-10-30 registry truncation). Nothing
was fabricated to fill the gap; the rebuild recipe (copy of the
fieldkill sweep/recorder + one captured field + env rename) is
documented in the arm evidence. The verdict stands on the surviving
corpus + analyzer + panel.
LOUD — proof-test disposition: post-revert the proof test is 78/81,
the 3 failures being exactly the engine-positive legs asserting the
reverted rule — by-design failures, not regressions. The proof test
was therefore NOT landed. The 81/81 figure in the arm evidence is
pre-revert truth only, labeled as such.

## Arm 1: sim-finishgate-a — DIAG-GO (gate-gap measurement)

Analyzer-only on the landed fieldfinish2 corpus; no new sims, zero
src/js. Prereg 82914aed3 (rebased de14c5180) committed before judged
analysis; evidence + analyzer + proof 682b3a16c (rebased 3a49d25b5).
Proof 51/51 on the branch and post-rebase. Coverage 40/40 = 100% of
baseline wave-3 mFlee rows classified (bar >= 90%); all counts
reconcile to corpus totals on both legs. Headline (baseline PRIMARY):
only 5 of 40 wave-3 mFlee rows are fought break-line flights — the
dominant class is contact-break volley drive-offs (27/40), which no
in-round gate can touch. Gap-table gaps: +24, +12, −16, −30, −94
(median −16). Only 2 rows are blocked by the one-strike gate alone
(short by 12 and 30 HP); 3 more meet the strike gate but fail another
gate (fighter HP 17%/29%, learn intent). Two-strike reach covers 2 of
the 4 positive-gap rows. Finding: strike size is mostly NOT the
blocker, and the addressable universe is tiny (5 fought break flights
per 40 flights). Strongest redesign candidate for a future BUILD arm:
a two-blow window (converts the +12 pure near-miss); a threshold
multiplier is weak (+12 needs ~1.6x, +30 needs ~5.3x); HP-gate
relaxation is argued AGAINST on this evidence (17%/29% rows +
HOLD-pilot history). Sense: the +12 fight reads as a believable
near-miss; the −16 fight reads as a hold correctly refused.

## Arm 2: sim-contactbreak-a — DIAG-GO (contact-break class census)

Analyzer-only on the same corpus; no new sims, zero src/js. Prereg
004e57d8c (rebased 6a7ce0322) committed before judged analysis;
evidence + analyzer + proof 758920ed6 (rebased 078b49472). Proof 40/40
on the branch and post-rebase. 100% of wave-3 rows on both legs
classified CONTACT vs FOUGHT or explicitly UNCLASSIFIED with reason;
all counts reconcile. Headline: baseline CONTACT 27/104 (26.0%),
FOUGHT 62, UNCLASSIFIED 15; lever CONTACT 0/71, FOUGHT 64,
UNCLASSIFIED 7. Baseline contact mHpStart median 4 HP (range 1–36);
descriptive thresholds within the class: <= 15 HP 14/27, <= 30 HP
24/27, <= 45 HP 27/27. All 27 are rounds-0 mFlee; log census: every
one is a single bow drive-off line, zero strike lines, zero
classifier/log disagreements. Lever zero is NOT proof the class
doesn't exist — the lever leg never met a classifiable sub-break
wave-3 beast (lowest met fraction 0.157); legs must not be pooled.
Sensitivity (stated, not folded in): true class range baseline 27–36,
lever 0–4 — the judged share is a floor, and evade rows
systematically lack HP fields (a recorder gap for any future BUILD
arm). Sense: a 1-HP beast fleeing a drawn bow reads believable, but
10/27 logs say the villager had NO arrows and then say the bow drove
the beast off — an empty threat the narration doesn't notice. A
future contact-finish rule must cost a real action (close and
strike, or loose an actual arrow) to read as earned; at 1 HP the
honest fiction is a put-down, at 28–36 HP the beast still has
teeth. CANDIDATE for a future BUILD arm only, never a landed change.

## Landing

All three arms rebased clean onto master and merged via --ff-only
(no conflicts, no force): fieldfinish2 (2d25029bb), finishgate
(3a49d25b5), contactbreak (078b49472 = master HEAD at closeout).
Trees released as merged, branches deleted, main tree clean at
closeout. Safe-commit index clobber hit the fieldfinish2 landing
commit and both DIAG workers' commits (commit correct each time,
repaired via --add --cacheinfo, verified status + diff HEAD empty
before each merge); the finishgate worker additionally repaired a
mass staged-deletion clobber on arrival (bulk index-info from ls-tree
HEAD, staged = 0 verified). One registration (contactbreak) was
SIGTERM-killed mid-checkout (partial evidence-only dir); the partial
dir was removed and registration re-run clean with heartbeat
readback. Registry contention with sibling loops slowed every
register/heartbeat/release call to minutes; retries only, no force.
Pre-flight deviation: the opening worktree-reap was deferred to
closeout because sibling loops were mid-landing at takeover; main
tree was verified clean and disk 21% at start, and the closeout reap
removed nothing (sibling dirty trees journey2-crisis-r88 and
sim-strandred-b refused, never touched). No check.js --quick is cited
(zero src/js in all arms; arm proofs green on rebased branches).
Telemetry check on the fieldfinish2 lever corpus: REFUSED by the tool
itself (anchorCommit recorder rows), no LOUD lines, baseline NOT
rolled.

## Wall numbers (per-band, never pooled)

Fieldfinish2 pilot band (8 seeds): baseline national 7, table 7,
wins 7, wave-4 4, wave-5 0, median 118.5d, max 197d; lever national 2,
table 7, wins 7, wave-4 5, wave-5 0, median 90d, max 97d. Finishgate /
contactbreak add no new wall band (analyzer-only on that corpus).
Overall wall UNCHANGED: full seat 0, wave 5 reached 0 stands — but
now mechanistically narrowed: the wave-3 kill-manufacture gap is NOT
one gate short. It is three stacked scarcities: few fought break
flights at all (5/40), a one-strike gate that mostly isn't the
blocker, and a large contact-break class (27/104) that no in-round
rule can touch.

## Blanks filled or documented

- FILLED (answered NO-GO): the narrow committed-finish lever does not
  manufacture wave-3+ killers; its survivability companion remains
  untested (never engaged). The 1702Z blank (3) is closed for this
  gate shape.
- FILLED (answered DIAG-GO): the wave-3 gate gap is quantified
  (finishgate) and the contact-break class is sized (contactbreak).
  Next BUILD candidates, in order: (1) two-blow finish window (needs
  its own prereg + survivability companion — the HOLD/NOFLEE lesson
  still binds); (2) contact-finish rule costing a real action
  (close-and-strike or a real arrow), with the evade-HP recorder gap
  fixed first so the class is measurable. Neither is built here.
- DOCUMENTED (open, not chased): silent loss of 6 uncommitted
  instrument files in a registered worktree (infra finding appended
  to the backlog); engine-cap decision (steve-call); full-seat price
  voicing (steve-call); second-veteran manufacture as a whole (the
  gap stands; only these two measurement questions are closed).
- NOT re-opened: the sim-food1630b-closeout branch (already on master
  via 00e1bd4db — a future run must NOT rebase+merge it).

scale-onramp stays converging (NOT converged): no wave-5 or full-seat
reachability shown, no game change landed. food-economy untouched
(sibling Loop B lane). Claim retired to .DEAD; lock deleted.
Merged locally, pending ship.
