# sim-winnability-round-0310 — Loop B coordinator evidence

Run: fleshout-loop-b-20261115T0310Z (Loop B), axis winnability chain.
INSTRUMENT RUN — no new gameplay lever. Both arms repair measurement
instruments, per the 0155Z round's next blanks (1) and (6). Master at
run start a4d0b2038; at closeout 0940c278e (proofrefresh closeout),
both arms merged ff-only, pending ship.

## Body-queue staleness (checked, not assumed)

The body's NEXT-RUN ARM QUEUE is stale and was NOT followed:
(1) arm-2 toggle run — CLOSED 2026-11-06, toggle-confirm family
(gearoff + trickoff landed; evidence/2026-11-06/sim-winnability-round-0630.md:
"No further toggle confirm is owed"). (2) flee-repair build — a Steve
call, held branch sim-fleerepair-a. (3) standing accumulation —
answered (standaccum3-b). This run instead took the 0155Z round's
next blanks (1) proof refresh round 19 and (6) succpolity G1 join fix.
The body queue needs re-pointing at the next schedule edit; the
tracker below now carries the live blanks.

## Arm 1 — sim-proofrefresh-b19 (MEASUREMENT PROOF): GO on the final tip

Branch sim-proofrefresh-b19, tip 0940c278e (rebased onto 7b2192b76
mid-run, all 6 legs re-verified). Evidence:
evidence/2026-11-14/sim-proofrefresh-b19.md (+ prereg, proof test,
retained panel evidence/2026-11-14/neutral-proofrefresh-b19.json.gz).
Zero src/js changes.

- Owed-check OWED: proof test failed exit 1 ("Proof source inputs
  are not current") on base a4d0b2038; vs the retained b18 panel, 3
  new policy files (competent-answercourt-b, competent-scaleclimb-b,
  competent-succpolity-b from the 0155Z merges) + 4 differing keys —
  betrayal.js (Lane B r206 invite-small fix), game.js (r139 spotter
  wiring), build.js + index.html (batch-ship version bump).
  Observer/contract digests matched.
- Panel: single attempt 03:19–03:59Z, 64 cases, 0 cached jobs, sha256
  8ea3a8bdcb8b72d6988a2fb7bf181623480eecca1f104f9c6241439fa5266e8e.
  sourceHeadStart == sourceHeadEnd == 92a61952; 0 keys differ vs tip
  manifest; neutrality 4/4, warnings 0; 0/64 rows differ vs b18.
  Re-pointed via scripts/balance-proof-update.js (exit 0, no
  hand-edited hashes). Cases cache deleted at closeout.
- GO legs on the final tip (7b2192b76): (a) proof-update 9/9 exit 0;
  (b) workflow 9/9; (c) cache-flags 4/4 outright, first run; (d)
  neutrality reproduces b18 and b17, warnings 0; (e)
  scripts/test-proofrefresh-b19-20261114.js 12/12 incl. stale-input
  negatives (b18 and b17 fail validate()); (f) ontology exit 0, 138
  systems, ONTOLOGY.md 2198 lines, no diff.
- Brief-staleness note (worker's): the brief named b13/b12 negatives
  (copied from the round-13 brief); rounds 14–18 have since landed
  and b18 is the retained panel. The pattern-faithful negatives are
  b18/b17; b13/b12 were also verified failing validate() in the
  owed-check and recorded in the arm evidence, so the brief's literal
  requirement is met too. Future briefs should name the two most
  recent prior panels.
- Master moved a4d0b2038 → 7b2192b76 during the panel (Loop A
  transplant8c evidence + this run's g1join arm, zero manifest
  files). Branch rebased cleanly (3 picks, no quirk); leg (a) and
  the full 12-leg test re-verified on the rebased tip. No
  version-stamp hazard (the 910bff7f4 bump predates the panel).
- Safe-commit index clobber struck all 4 commits (incl. one MM
  manifestation) — repaired each time with the documented ls-tree -r
  pipe; commits verified correct, no work lost.

## Arm 2 — sim-succpolity-g1join-b (INSTRUMENT FIX): GO on all four bars

Branch sim-succpolity-g1join-b, tip 4c9d3c940 (prereg b615df4af + fix).
Evidence: evidence/2026-11-14/sim-succpolity-g1join-b.md (+ prereg,
re-judgment analysis, RED/GREEN logs). Zero src/js changes.

- The fix (scripts/analyze-succpolity-b.js, succgraceAccounting
  only): staged beats = union of pr 0→1 transitions (beats surviving
  to a snapshot) + one entry per `succgrace-answer` policy event
  (beats answered before any snapshot); genuine iff a matching policy
  event exists OR prSg=1 on/before the answer day (legacy fallback);
  dedup for the retry case; per-seed policy/analyzer cross-check
  (informational, mismatch-only CLI line). Root cause verified in
  code + corpus: the policy answers at the start of daily, before
  the driver's post-daily snapshot, and answerRenegotiation clears
  pendingRenegotiation first — a staged+answered beat never appears
  as prSg=1 in any snapshot. Both patterns occur (100203 staged d89 /
  answered d90; 100208 staged d100 / answered d100). Young beats do
  survive to snapshots (pr=1, prSg=0), so prSg is only valid for
  lapsed beats.
- Bar (a) GO: re-judged 0155Z pilot corpus — youngAnswers=0 on all
  three legs; leg (b) 6 genuine answers, all via policy events; 12
  distinct young beats per leg, all lapsed; cross-check agrees on
  every seed; every staged beat accounted.
- Bar (b) GO: both RED pins green — same-day genuine answer counts
  genuine; genuinely-young answer still flagged. RED captured
  pre-fix: 39 passed / 17 failed, including leg (b) youngAnswers=6
  reproduced.
- Bar (c) GO: new proof test 56/56 green; old test untouched
  (verified verbatim + git diff empty) and green — 67/67 static +
  16/16 game.
- Bar (d) GO: per-leg wall/pilot/verdict and per-seed non-succgrace
  fields deep-equal to the 0155Z analysis JSON.
- NON-RE-SCORING (§14): the three 0155Z pilot kills stand exactly as
  judged (killed on dissolutions). The 0155Z evidence and analysis
  JSON are untouched. The snapshot roll's trust never reflecting the
  gift's +8 is noted as context; dissolutions still read from
  scaleRank transitions. New blind channel disclosed in the arm
  evidence: the join now depends on the policy logging
  succgrace-answer events — the cross-check flags any future
  mismatch.
- Safe-commit index clobber struck after both commits — repaired
  with the documented pipe; blobs verified matching HEAD. A git gc
  warning about unreachable loose objects appeared during the merge
  — pre-existing repo hygiene, not touched.

## Wall numbers

No winnability-band sim corpus this run (both arms are
infrastructure/instrument — no seeds run against a lever). The
0155Z wall numbers stand as the latest winnability-band read:
table 0/40, wins 0/40, national ever 7–8/8, wave-5 4/8 on the
succpolity pilot band. The proofrefresh panel's own rows (neutral
observer panel, 64 cases, 4 policies — NOT a lever result): national
11/64, wins 16/64 (all capable, 16/16), entered 16/64, table 56/64
(Arc-IV reach), wave-5 13/64, wave-4 63/64 (sole miss: winseek seed
42, lost d30 wave 3 — same row as b8–b13), median survival 90d,
max 150, vests 23, vestsVillager 39.

## Telemetry deviation check

Attempted by the coordinator on the retained b19 panel .gz: LOUD
line is the known parse refusal ("could not parse
evidence/2026-11-14/neutral-proofrefresh-b19.json.gz: Unexpected
token ... is not valid JSON") — telemetry-check cannot parse .gz
panels, same limitation as b11–b13. Investigated, not waived: no
per-seed evidence exists for this infrastructure arm, and neutrality
reproduction (0/64 rows differ vs b18) stands in its place. Baseline
NOT rolled, no new investigation item.

## Findings appended (sim-findings.md)

- Line 2364 (succpolity G1 join false positive) marked [fixed]:
  fixed by this run's sim-succpolity-g1join-b (commit 4c9d3c940,
  proof 56/56, corpus re-judged youngAnswers=0 all legs, kills
  un-rescored per §14).

## Infrastructure

- Registry lock queue very slow all run: both worktree registrations
  took ~5.5 min each (reaper holds REGISTRY.lock for its whole run);
  the reaper itself skipped cleanup this run ("registry lock held by
  another reaper run", consecutive skips: 2). Nothing was reaped or
  touched that wasn't ours.
- Loop A live on scale-onramp throughout (fleshout-20261115T0215Z,
  sim-ove48-mech-a + sim-transplant8c-a) — transplant8c landed
  mid-run as 7b2192b76 (evidence-only, zero manifest overlap with
  either arm); ove48-mech-a still in flight at closeout. NOT touched.
- Write flap quiet this run (all writes clean; no truncated files).
- check.js --quick NOT re-run by the coordinator (zero src/js in
  either landed branch; both workers' proof tests green on the
  merged tips).

## Village assessment (plain words)

This run changed nothing in the game itself — it fixed the tools
that measure the game. The proof that says "these numbers are
honest" had gone stale when the last round's new policies landed,
so it was rebuilt from scratch and now passes clean again. And the
counter that watches funerals and friendship-pledges was miscounting:
six times it called a real, answered pledge a "too-young" one,
because the pledge was answered before the day's snapshot was taken.
Those six were real answers all along — the counter now sees them.
The hard question itself hasn't moved: realms still fall apart when
a funeral wounds three old friendships at once, and the people who
would hold a realm still die fighting while it stands.

## Convergence state

winnability chain stays converging (NOT converged): both 0155Z
blanks taken this run are closed (proof refresh round 19 GO;
G1 join fix GO, kills un-rescored), but no hold lever has landed;
the answercourt cost call is still with Steve / the main session;
table and wins remain 0 on every winnability band. scale-onramp
stays converging (untouched; sibling Loop A). food-economy stays
converging (untouched; parked). Next blanks, in order: (1)
answercourt cost call (Steve / main session); (2) competent
seat-taking BUILD (Steve-call); (3) the hold, next lever — the
binding constraint on the pilot band is now combat deaths of
national villages + three-link erosion per funeral; a next hold arm
must repair more than one link per funeral or keep fighters alive
through wave 4 (coordinator observation, not a Steve call); (4)
veterans survivorship (design question); (5) phone-frame receipt
refresh; (6) only-lead-shape second band; (7) family 2b AMBIGUOUS
(Loop A suspect list). Claim deleted; lock deleted. Evidence:
evidence/2026-11-14/sim-winnability-round-0310.md (this file).
