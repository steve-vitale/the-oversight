# Scale-onramp round fleshout-20261029T1215Z — coordinator evidence

Axis: scale-onramp (converging, NOT converged). Run: flesh-out loop,
run fleshout-20261029T1215Z. Both arms LANDED, merged locally pending
ship. Measurement only — zero src/js, zero game-behavior changes, zero
default flips, zero policy changes anywhere in this round.

## Run-start guard + collision check (read before judging the arms)

- No live flesh-out lock at run start. Main tree clean, disk 23%.
  Loop B live on food-economy for the whole run (claim
  fleshout-loop-b-20261029T1130Z, arms sim-blocktype-b +
  sim-recallpolicy-b) — NOT touched.
- STALE-CLAIM RECOVERY at start: the 0145Z scale-onramp claim was
  still live but dead — its arms (funnel-a, w4dpr2) are already on
  master, it had no registered trees and no heartbeat. Retired to
  .DEAD; its arms were NOT re-run.
- ARM REVISION after the collision check (the original lottery +
  holds plan did not survive contact with the live lanes):
  lottery-competition was already tried and KILLED today
  (sim-lottery-a, NO-GO pilot, departures leg fails); the
  HUNT-holds-through-danger lever was already live in the build
  lane (build-pickdepart, heartbeat fresh — NOT touched); the
  trail-follow arrival mechanism was already live in build-returns
  (NOT touched). Revised arms, claim rewritten before any sims:
  (1) homebody census DIAG (funnel-a ranked blank 2, measurement
  only, sizing steve-call backlog #1409); (2) pick-to-departure
  lag census DIAG (funnel-a ranked blank 3, lag half only;
  arrival mechanism stays with build-returns).
- Master moved twice under the run from sibling lanes, zero file
  overlap with either arm: loop-B blocktype merge (ef4e3f8be) and
  the build lane's hunthold landing (a6fa0710c: sim-hunthold-a
  pilot NO-GO — mechanism works, 209 holds, P1/G1/G2 fail).
  Both branches rebased clean in their own worktrees; proofs
  re-ran green after every rebase and on merged master.

## Pre-registration (both arms, committed before any judged run)

- Homebody (sim-homebody-a-prereg.md, 5bb9ac823 after rebase):
  primary = range classification of the 19 funnel triples on band
  75101–75116, tableseat-nowait substrate verbatim
  (LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1, RETURNS=1,
  FUNNEL=1, recorders reused verbatim), 180d death-aware.
  DIAG-GO required: 19/19 triples range-classified with OTHER
  <= 1; determinism (75106 scratch byte-identical); neutrality
  (funnel-a wall reproduced exactly); structural prediction (0
  offered picks at maxD 0); sense bar (verbatim homebody trace).
- Departlag (sim-departlag-a-prereg.md, fe738e8c9 after rebase):
  same band and substrate. DIAG-GO required: join completeness
  (every wave-4 HUNT pick classified departed / superseded /
  died-holding / held-to-horizon, UNKNOWN <= 1); determinism
  (75106 scratch byte-identical); neutrality (funnel-a wall
  reproduced exactly); sense bar (one departed + one
  picked-never-departed chain verbatim).

## Arm 1 — sim-homebody-a: DIAG-GO, LANDED

Commits (rebased onto a6fa0710c, merged --ff-only):
5bb9ac823 prereg, 3d1ac60ea instruments, 511ccb860 sense
wording fix (words only — fresh-pick counts corrected, no count
or GO leg moved), 1b45c33c0 corpus + analysis + evidence.
Proofs green post-rebase and on merged master: fixtures 30/30,
census PASS (legs 1 + 3), sense PASS.

- The block is 2 of 19 survivor triples: s75109 visjoin_138 /
  algorithm (funnel headline MEMORY-OVERWRITTEN; fresh window
  d142–d144 homebody-blocked, eviction 32 days later is an
  epilogue) and s75109 visjoin_174 / eulogy (headline
  GATE-BLOCKED-AT-PICK; the gate is range, homebody range
  specifically). Both fought ONE tile from haven.
- 2 of 11 pick-recorded villagers are maxD 0 (18%); 2 of 14
  wave-4 memories held at pick time are held by homebodies;
  0 of 59 maxD-0 picks were ever offered (the range rule never
  leaks — if stay-home is the intent, it already works
  perfectly). maxD was stable per villager across picks.
- Counterfactual UPPER BOUND (labeled, not a lever result):
  2 lottery entries — not 2 returns, not 2 kills, not a wave-5
  door. At the band's take rate (2/36 triple-window offered
  picks), departure rate (1/2 takes), and meeting rate (0/1
  departures), a homebody ruling alone moves nothing measurable
  here without the lottery / departure / arrival work alongside.
- Control that proves the distinction works: diana_osei/eulogy
  is GATE-BLOCKED like 174 but post-flee (otherGate, maxD >= 3)
  — same headline, different mechanism.
- Scope limit, stated not hidden: the distribution covers
  pick-recorded villagers only (the funnel recorder records
  picks only for wave-4 memory holders). 15 formed wave-4
  memories belong to villagers with no pick record; their maxD
  is unobserved and NOT counted either way. The 4
  died-before-pick triples with unknown maxD are NOT in the
  upper bound.
- Backlog #1409 stays a steve-call item awaiting ruling, now
  numbered: does Steve intend maxD-0 villagers to never hunt,
  including for beasts one tile from haven? NOT marked fixed.

## Arm 2 — sim-departlag-a: DIAG-GO, LANDED

Commits (rebased onto 1b45c33c0, merged --ff-only):
fe738e8c9 prereg, 521675a07 instruments, 2a533a857 analyzer
fix (wave lookup returns the true wave for any known id —
caught on a predecessor-corpus preview BEFORE any judged
number was read; repaired the secondary census, which had
collapsed onto the primary with 7 false unknownWave),
b2f40994e corpus + analysis + evidence.
Proofs green post-rebase and on merged master: fixtures 18/18,
legs PASS (join + neutrality), sense PASS. Full-corpus check:
all 16 rows BYTE-IDENTICAL to the funnel-a rows.

- Primary universe (wave-4 HUNT picks): n=2, both seed 75106,
  eulogy, picked d135 part 536 — visjoin_113 and visjoin_115,
  who fought it together three days before.
  - Departed 1: visjoin_115, lag 2 days / 8 parts, departed
    stale at memory age 5 (picked at age 3, the last fresh
    day; sickness hold per departhold-a: 5 held-ready
    evaluations, reason sick, then danger go/1). Arrived to
    an empty tile d137 at (5,3).
  - Superseded 1: visjoin_113, lag 0 days / 3 parts, sub-kind
    NEEDS (EAT, same afternoon, while eulogy was still the
    offered candidate). Died-holding 0, held-to-horizon 0,
    UNKNOWN 0.
- Secondary census (all HUNT picks by wave-4 memory holders,
  n=9, reported NOT judged): departed 5/9 (lags 0,0,0,0,2
  days; same-day 4/5; stale-at-departure 1/5 — again only the
  eulogy pick); superseded 4/9 (RE-PICK 1, OTHER 1, NEEDS 2;
  lags 0,0,0,1 days — every supersession within a day, three
  within hours). True drops 5/5 — EVERY departure arrived to
  an empty tile, including all four same-day departures.
  Speed does not rescue arrival on this band (descriptive:
  the beast wanders independently, not a causal claim).
- Caveat carried forward (do not drop it): SUPERSEDED-by-
  re-pick can hide a danger overwrite between picks — the
  murkcap pair shows tighten-overwrites at parts 429/432
  reading as re-pick / forage supersessions in a pick-only
  join. Any HUNT-holds prereg must join the departhold
  verdict channel (lag + verdicts in one analyzer) or it
  re-inherits this blind spot. This census deliberately does
  not join verdicts, so held picks cannot split into
  danger-held vs heal-held vs never-checked.
- The departure work now has numbers instead of the single
  d135→d137 anecdote — but n=2 cannot support a lag
  distribution, only two dated facts. The next departure
  prereg must keep wave-4-only and accept anecdote scale
  (secondary as shape), or pre-register a matched-triple
  design. The primary 1/1 stale share and 2-day median must
  never be quoted as rates without their n.

## Wall (both arms' judged corpora — reported, NOT movement)

Identical to funnel-a on both arms (neutrality exact, not
approximate): wins 4/16, all lesser, full seat 0/16.
National ever 13/16, final 9/16. Table invited 10/16,
entered 4/16. Wave-4 reach 11/16, wave-5 0/16. Median 180d —
HORIZON-CAPPED (the cap, not a survival gain). Deaths 600,
starvation 4. No wave-4 field party has yet killed in the
field; the binding breaks remain the lottery, the departure
gate, and the empty tile — in that order — and the homebody
question is a footnote to the lottery, sized and filed.

## Telemetry deviation check (loop body step 10)

Both corpora vs scale-wall baseline, metrics
national,table,wins,exiled: 2 LOUD lines each (national
12→0, wins 16→0; n=17 files = 16 rows + summary.json).
Verdict: EXPLAINED, baseline NOT rolled, no investigation
item — the known field-shape + regime artifact class (rows
carry nationalEver/entered/won, not top-level
national/table/wins paths; the WINSEAT baseline's own
_regime note forbids comparing pre-seat tableseat-nowait
substrates against it; true values nationalEver 13/16,
entered 4/16, wins 4/16). Exiled: no LOUD line.

## Metric review (for the NEXT run — never a mid-run re-score)

- Both arms were judged against their own prereg headers;
  no metric changed mid-run on either arm. The homebody
  sense-wording fix and the departlag wave-lookup fix were
  both documented in their evidence, not hidden, and neither
  moved a GO leg or a judged number.
- Window-free vs windowed flags (homebody): per-triple range
  flags ignore the funnel window by design; on this band both
  YES triples' fresh blocks fall in their anchor windows, so
  the distinction costs nothing here — a future band should
  report windowed and window-free flags side by side.
- Single-verdict priority (homebody analyzer artifact): the
  analyzer's one-word rangeVerdict ranks homebody >
  out-of-range > other-gate > offered, so a lottery triple
  with offered picks elsewhere reads OUT-OF-RANGE. The arm
  evidence reports flags, not the single verdict; a future
  analyzer should drop it or rank OFFERED above occurrence
  flags when the question is "was this triple ever offered."
- Small-n discipline (departlag): primary n=2 is anecdote
  scale; the secondary n=9 is the shape. Never quote 1/1
  stale or 2-day median as rates.
- Panel note (standing): scripts/balance-panel.js has no
  census-ingest mode; identical-seed before/after corpora
  are the section 15 substitute, as in funnel-a. No panel
  artifact faked, no panel verdict claimed.

## Infrastructure

- Worktree registration for departlag took ~19 min (checkout
  under heavy sibling load; 3.9G tree, git worktree add
  I/O-blocked at 0 CPU) — slow, not failed; waited out, no
  ref surgery. Homebody registered first and its worker
  started while departlag registration was still running.
- Container EPERM flap hit worker commits (homebody
  safe-commit failed 3x on /tmp index locks ~13:01 UTC,
  clean after ~90 s; departlag sweep writer retried one
  EPERM row with read-back verification) — waited out, no
  force, no seed lost.
- Safe-commit index clobber hit worker commits on both
  branches (staged-deletion twins, one staged+worktree MM
  variant) — repaired via HEAD-blob cacheinfo with
  status-empty + diff-HEAD-empty + hash-match verification,
  never git reset. No clobber on the coordinator merges
  (both --ff-only, verified ancestor of HEAD, main tree
  clean at closeout).
- check.js --quick NOT re-run at coordinator level: zero
  src/js, zero green-list files on both arms; arm proofs
  (re-run post-rebase and on merged master, all green) are
  the landing gate, per the standing practice for
  tooling-only arms.
- Final reap: only other owners' uncommitted trees noted
  (sim-creekpath-armc-b, build-returns, journey-scale,
  journey2-succession) — never touched. Active 10/16 at
  closeout.

## Convergence

scale-onramp stays converging (NOT converged): the homebody
block is now sized (2/19, upper bound 2 lottery entries) and
the pick-to-departure lag is now measured end to end (wave-4
lag 2d stale, supersession 0d dinner, secondary shape with
same-day departures and universal empty-tile arrivals) — but
no wave-4 field party has yet killed in the field, the full
seat stays 0, wave 5 stays 0, and the hunthold pilot that
landed mid-run (build lane) went NO-GO on its own legs.
The directive stands until the tracker records this axis
converged on measured evidence. Rotation left at 3
(convergence work does not cycle it). Claim deleted; lock
deleted.

Next blanks, in order: (1) the homebody ruling itself —
steve-call #1409, now numbered (2/19, upper bound 2 lottery
entries), still awaiting his word; (2) the HUNT-holds work
continues in the build lane (its pilot went NO-GO on
P1/G1/G2 with the mechanism working — the sim loop does NOT
rebuild it; the next sim measurement on holds must join lag
+ departhold verdicts in one analyzer per the murkcap
caveat); (3) the arrival mechanism (build-returns owns it) —
the sim loop measures against it once it lands, since
same-day departures already arrive empty and no departure
fix alone can produce meetings; (4) the pickcensus scarcity
finding — only a band where more villagers survive a wave-4
fight and get the offer can grow the wave-4 pick population;
(5) whether waiting matters on bands where the seat stays
unready longer (standing older blank, still open).

Evidence: evidence/2026-10-29/sim-homebody-a.md +
sim-homebody-a-prereg.md + homebody-a-analysis.json +
homebody-a-funnel.json + perseed-homebody-a/ (on master,
1b45c33c0) + sim-departlag-a.md + sim-departlag-a-prereg.md
+ departlag-a-analysis.json + perseed-departlag-a/ (on
master, b2f40994e).
