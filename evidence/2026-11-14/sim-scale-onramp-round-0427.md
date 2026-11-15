# Scale-onramp round — run fleshout-20261115T0427Z (Loop A)

Axis: scale-onramp (converging, NOT converged). Loop B live on winnability
chain throughout (claim fleshout-loop-b-20261115T0411Z, arms
sim-funeral-mend-b + sim-fighterhold-b, heartbeats 04:24–04:26Z at run
start) — NOT touched. Master moved under the run (batch ship bump
542c6ecc2, Loop B fighterhold-b 5aa0863e2, journey-scale r206); both arms
rebased clean, zero file overlap, proofs green after every rebase.

## Arm 1 — sim-talktranscript-a (DIAG, blank #1: judged transcript run)

Verdict: NO-GO on the combined prereg bar — but ONLY on the length half.
The naming half passes wide, and the ove48-mech (b) NO-GO is SUPERSEDED
as a channel finding. Commits (rebased onto master tip 542c6ecc2, then
onto 73a7f8fa8 after the 8c merge; merged ff-only a1ffa74ae): prereg +
instrument 76486f8f9 (rebased eaefa1625 → 6ff882784), talk-base corpus
ba6625a6b (→ feb8535c8), talk-subj corpus 6d006ecd3 (→ fccb14f38),
evidence 22ebb9a26 (→ a1ffa74ae). Proof scripts/test-talktranscript.js:
stage 1 80/80 at prereg, stage 2 23/23 green on the rebased tip and on
merged master (coordinator re-ran; stage-1's 3 "failures" post-corpus
are the stale-by-design pre-run guards asserting no corpus exists yet).

Judged numbers (band 190457–190464, 150d, COMPETENT_TALK=1, same
trajectories as ove48-mech; capture channel c.transcript snapshot at
endConvo, 'them' beats only, Game.say never wrapped; smoke test proved
the channel first):

- Opens / held sittings: base 2,852 / 1,895; subj 3,097 / 2,057;
  pooled 5,949 / 3,952. Dawn-aligned share 26.5% base, 65.7% subj.
- Naming (non-opener transcript beat names the opener's dawn drive):
  base 62.5% (1,185), subj 68.9% (1,418), pooled 65.9% (2,603) vs
  the 25% bar. Sensitivities, pooled: ex-"promise" 54.8%,
  quoted-only 64.6%, drive-words-only ~45.2% — GO under every one.
- Length half: mean exchanges aligned vs misaligned 3.50 vs 3.54
  base, 3.53 vs 3.59 subj, pooled 3.52 vs 3.55 — numerically identical
  to the mech instrument's read, because exchanges do not depend on
  the capture channel. The energy budget, not alignment, sets sitting
  length.
- Validity V1/V2/V3/V4/V6 all pass on both legs. Zero src/js.
- The same 3,952 held sittings read 18.7% on Game.say and 65.9% on
  c.transcript — the channel artifact is confirmed and quantified.
  Naming is a property of held conversations, not of the pick (far
  end alone: 62.5%).
- Wall: base 3/8 survived (median 147d), subj 4/8 (median 150d);
  national/table/wins 0; wave-5 6/8 and 5/8.

Evidence: evidence/2026-11-14/sim-talktranscript-a.md (+ prereg).

### COORDINATOR DECISION — the combined NO-GO does not carry the revert-vs-keep call

The naming question is settled GO: villagers DO say the drive aloud
in held sittings (65.9%, every sensitivity ≥45%). Only the length
half misses, and it cannot discriminate by design — sitting length is
set by the energy budget, so no capture channel will ever separate
aligned from misaligned on exchanges. OVE-48 KEEP (0215Z) stands
unchanged; nothing in this arm re-opens it. If a length verdict is
wanted, the length metric needs redesigning (e.g. drive-thread depth),
not another capture channel — that is the next run's call, not this
run's. Safety is the weakest naming channel (48.6% base / 61.3%
subj) — a future tuning target, not an instrument issue.

## Arm 2 — sim-transplant8c-rerun-a (DIAG, blank #2: matched-band 8c rerun)

Verdict: NOT-CARRIER — narrowed family 8c is survival-inert on the
matched band. The 8c question is now measured and closed for survival.
Commits (rebased onto master tip 542c6ecc2; merged ff-only 73a7f8fa8):
prereg + proof fdcc32e18 (rebased d17f55bdb), evidence + corpora
faaa0abe4 (rebased 73a7f8fa8). Proof scripts/test-transplant8c-rerun.js
126/126 final (117/117 at prereg stage); test-culpritbisect-a.js
116/116 reused-tooling check. Zero src/js; subject branch untouched
at 2cd6720b0.

Judged numbers (matched band 190391–190398, 150d, competent a7ff5c51,
fix standing f8fda4295a99, 0 instrument errors both legs):

- Baseline ep-far-8c-rerun (far end 203a32775): survived 4/8, days
  86/144/150/43/150/87/150/150, median 150d. Baseline gate (≥3/8)
  PASSED — third identical read of the far end on the matched band
  (masterregress, 8b, this rerun). The 0215Z fresh-band 1/8 stays on
  the record; far-end health is band-sensitive, and this NOT-CARRIER
  is a matched-band verdict.
- Subject t8c-rerun (transplant-8c-subject @ 2cd6720b0): survived 4/8
  with BIT-IDENTICAL trajectories — same per-seed days, deaths, death
  causes, standing, wave reach. Per-seed corpora differ only in the
  `step` id and `anchorCommit` fields.
- Death causes identical in both legs (629): villager combat 267,
  combat 130, expedition 126, the wild 74, monster 13, starvation 1.
- Family test, judged separately: dlgmore script re-run — FAIL on
  the far end (exit 1, both cases) and PASS on the subject (exit 0,
  both cases). Reproduces the 0215Z result on the identical subject
  commit.
- Sense: rerun corpus says nothing different — 225 vetSays lines, 0
  "lost my train of thought", 0 "Still on", so the survival leg cannot
  speak to the hunk's dialogue behavior; only the dlgmore script does.
  Narration itself reads human.

Evidence: evidence/2026-11-14/sim-transplant8c-rerun-a.md (+ prereg).

With 8b + 8c both NOT-CARRIER, four of PR #22's five hunks are measured
non-carriers on their own. The four CONFLICTED hunks
(lesson-outcome/diegetic-act, favor settlement, favor-line sayLine,
blocked-repeat) remain unmeasured as a family — the next blank is the
next run's call.

## Wall (this run's judged corpora)

Survived: talktranscript 3–4/8 per leg, 8c rerun 4/8 both legs.
National 0, table 0, wins 0 on every judged corpus. Wave-5 2–6/8 per
leg. Telemetry deviation check: REFUSED (recorder-corpus class, as for
all prior bisect/transplant arms) — baseline NOT rolled, no LOUD lines.

## Infrastructure

- Merge contention (hot tree): the first ff-only merge of
  talktranscript failed on an index.lock held by concurrent sibling
  operations (ship-loop safe-commit + journey2-crisis merge running
  `git status` at the same time; each status scan takes 1+ min of CPU
  under contention). The `| tail -2` pipe masked the merge's nonzero
  exit, so the chain continued to the 8c merge, which landed first.
  Recovery: rebased talktranscript onto the new HEAD (73a7f8fa8),
  re-ran stage-2 proof 23/23, merged ff-only clean (a1ffa74ae).
  Lesson, carried forward: never pipe a merge through `tail` without
  PIPESTATUS — a masked merge failure silently reorders landings.
  No work lost; both branches' commits verified byte-identical after
  every rebase.
- Safe-commit index clobber struck on the 8c arm's both commits and
  all three talktranscript corpus/evidence commits — repaired with the
  documented ls-tree pipe each time, commits verified correct.
- A probe `git status` mid-run showed the 8c-rerun corpus files as
  untracked (`?? evidence/2026-11-13/...8c-rerun...`) — a transient
  read taken while the 8c merge was mid-flight (worktree updated,
  ref not yet moved). Verified after landing: all 20 files are in
  HEAD (73a7f8fa8) and byte-identical on disk; the main tree was
  clean at closeout. Not a real dirty-tree event.
- `git gc` warning at merge time (too many unreachable loose objects;
  `.git/gc.log` present) — housekeeping for the ship loop or a
  maintenance run, not this run's to fix mid-landing.
- check.js --quick NOT re-run (zero src/js both arms; loop precedent).

## Metric review

- The talktranscript prereg's combined bar (naming AND length) was
  judged exactly as written: NO-GO. The metric review in the arm
  evidence records the bar's flaw plainly — the length half measures
  a quantity the energy budget sets, so it cannot discriminate by
  design. No re-scoring: the 65.9% naming read is reported as a
  GO-half, not as a GO verdict. Proposed revision for the next run:
  replace the length half with a drive-thread-depth measure before
  any further length judgment.
- The 8c rerun prereg's baseline-gate design worked as intended on
  the matched band (gate passed 4/8, subject judged). The band-health
  pre-check note from 0215Z is now proven in both directions: fresh
  band 1/8, matched band 4/8, same code, same policy.
- The talktranscript lexicon is loose ("a thin smile" counts as
  food-talk; "committing it to memory" via generic "commit") and
  ~12.5% of 'them' beats are unquoted narration; the party-role menu
  list is spoken aloud as a them-beat. Sensitivities bound the
  looseness (worst case ~45% drive-words-only, still GO) — no
  revision owed to the naming verdict, but a tighter lexicon is owed
  before any fine-grained per-drive tuning.

## Findings appended

- Two new open findings filed by the talktranscript arm in
  sim-findings.md (lexicon looseness / unquoted narration + party
  menu spoken aloud — sense-testing notes); the "wrong channel"
  finding (ove48-mech (b)) marked FIXED.
- No backlog append from the 8c arm (nothing out-of-scope surfaced);
  process note in its evidence: the dlgmore script exists on neither
  the far end nor the subject tree, so family-test runs must copy it
  into the /tmp pathspec extracts from the arm branch.

scale-onramp stays converging (NOT converged): the spoken-drive
question is settled (naming GO, length unmeasurable by design) and
8c is closed NOT-CARRIER, but national / table / wins remain 0 on
every judged corpus and the collapse's carrier is still unfound.
food-economy stays converging (untouched; parked). winnability chain
stays converging (untouched; sibling loop B). Next blanks, in order:
(1) OVE-48 fresh-band survival re-test; (2) RNG-draw-parity probe;
(3) family 6b + narrowed 7b; (4) family 2b AMBIGUOUS stays on the
suspect list; (5) the four conflicted PR #22 hunks as a family;
(6) headcount-ceiling (Steve-call); (7) Reunion mirror pack in the
wild (Steve design call). Claim deleted; lock deleted. Evidence:
evidence/2026-11-14/sim-scale-onramp-round-0427.md (this file).
