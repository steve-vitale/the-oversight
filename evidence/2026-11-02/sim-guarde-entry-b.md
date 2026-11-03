# sim-guarde-entry-b — Guard-E ENTRY-CHECKED ALLOW fix shape, judged

Run: oversight-flesh-out-loop-b, arm sim-guarde-entry-b
(coordinator brief 2026-11-02, run
fleshout-loop-b-20261103T0230Z, axis food-economy).
Worktree sim-guarde-entry-b, branch sim-guarde-entry-b.
Base commit (pinned in prereg): 130566445.
Prereg: evidence/2026-11-02/sim-guarde-entry-b-prereg.md
(committed 87f5d8d8 BEFORE any judged sim).
Instruments: committed 2057dad3b (proof 30/30)
before the judged bands ran. This worker does NOT
push, bump, verify live, merge, or rebase; the
coordinator lands the branch. Status to coordinator:
committed in worktree, pending coordinator merge.

## Verdict (judged against the prereg header, never re-scored)

- **GO — fix shape validated on all three legs.**
  1. allow'-pass fidelity: A 24/24, C 1/1,
     POOLED 25/25 = 100% (>= 95% bar).
  2. VETOES UNCHANGED: 6 E-fail hops, all still
     vetoed identically under both rules —
     0 veto changes on E-fail hops,
     0 E-fail outcome changes.
  3. ENTRY MODEL AGREEMENT: checkHop blockers
     empty <=> engine moved on 37/37 attempted
     hops (A 34/34, C 3/3).
- The entry-checked allow does exactly what the
  creekhop DIAG predicted: the 4 A-band E-pass
  refusals and the 2 C-band E-pass refusals
  (6 conversions total: 5 creek, 1 washed_out)
  move from allowed to vetoed, and nothing else
  moves. No hop that the engine allows is newly
  vetoed; no hop the guard used to veto is newly
  allowed.
- GO here validates the fix SHAPE as a judged
  instrument. It is NOT a landing and NOT a
  default change: no live-loaded policy loads
  the variant module, no default flips, zero
  src/js changes. Deploy of the fix shape
  belongs to a later arm's decision.

## What was built (new files ONLY, zero game-code change)

- scripts/policies/competent-guarde-entry-b.js —
  allowPrime / allowPrimeFromRecord: allow' =
  escapeCheck(dest).ok AND checkHop(origin,
  dest).blockers empty, importing both guard
  functions VERBATIM from
  competent-homewardstep-b.js. No credit, no
  veto-memory, no narration change. Loaded only
  by the proof test and as the analyzer's
  definition — never by a campaign driver.
- scripts/analyze-guarde-entry-b.js — allow'
  fidelity analyzer: per-seed moved-pattern +
  control comparison (creekhop pilot format via
  --prior, homewardac C shadow format via
  --priorC), per-hop table, fidelity / veto /
  entry-agreement totals, conversion census.
- scripts/test-guarde-entry-b.js — proof 30/30
  (synthetic hops incl. the 69502 creek shape
  and a pocket-entry shape, veto invariance on
  the pilot corpus as a fixture, reused-files-
  unmodified git check, analyzer fixture
  reproduction, prereg band checks). Runs NO
  new sims.
- UNCHANGED, verified by the proof test's git
  check: guard policy, creekhop recorder,
  competent.js, src/js. Zero src/js changes,
  zero default flips, zero bundled fix.

## Control gate: base equality (STOP condition — PASSED, 8/8 A + 2/2 C)

Fresh recorder legs on base 130566445 reproduce
the prior corpora hop for hop:

A band (vs sim-guarde-creekhop-b-pilot.jsonl):

| Seed | Day-5 start | Moved-pattern | Control |
| 69501 | (4,4) | T T T T T T | PASS |
| 69502 | (4,4) | T T T T T F | PASS |
| 69503 | (4,4) | F | PASS |
| 69504 | (4,4) | T T T T T T | PASS |
| 69505 | (4,4) | T T T T T T | PASS |
| 69506 | (4,4) | T T T T T T | PASS |
| 69507 | (4,4) | T F | PASS |
| 69508 | (4,4) | F | PASS |

C inclusion gate (vs sim-homewardac-b-pilotC-shadow.jsonl
day-5 construct steps, route C1 via the recorder's
CONSTRUCT_ROUTE_A env var — a one-command change,
no new instrument):

| Seed | Day-5 start | Moved-pattern | Control |
| 69606 | (4,4) | T F | PASS |
| 69607 | (4,4) | F | PASS |

No substrate drift. The C legs are INCLUDED in
the judged band (pooled figures above); the
per-band figures are reported separately so the
pool never hides a band. No C-route limit applies
— the one-command route change worked and its
control reproduced. 69502 hop (7,2)->(7,1)
reproduces exactly: E pass, entry creek, engine
creek, moved false.

## Judged fidelity table (fresh legs, 37 forced hops)

allow' = E pass AND entry (checkHop) clear.
E = escapeCheck ok; entry = checkHop blockTypes;
engine = travelBlockage blockType or —.

A band (69501-69508, route A):

| Seed | Hop | E | Entry | allow' | Engine | Moved |
| 69501 | 4,4->5,4 | pass | — | pass | — | yes |
| 69501 | 5,4->6,4 | pass | — | pass | — | yes |
| 69501 | 6,4->7,4 | pass | — | pass | — | yes |
| 69501 | 7,4->7,3 | FAIL | — | FAIL | — | yes |
| 69501 | 7,3->7,2 | FAIL | — | FAIL | — | yes |
| 69501 | 7,2->7,1 | FAIL | — | FAIL | — | yes |
| 69502 | 4,4->5,4 | pass | — | pass | — | yes |
| 69502 | 5,4->6,4 | pass | — | pass | — | yes |
| 69502 | 6,4->7,4 | pass | — | pass | — | yes |
| 69502 | 7,4->7,3 | pass | — | pass | — | yes |
| 69502 | 7,3->7,2 | pass | — | pass | — | yes |
| 69502 | 7,2->7,1 | pass | creek | FAIL | creek | NO |
| 69503 | 4,4->5,4 | pass | creek | FAIL | creek | NO |
| 69504 | 4,4->5,4 | pass | — | pass | — | yes |
| 69504 | 5,4->6,4 | pass | — | pass | — | yes |
| 69504 | 6,4->7,4 | pass | — | pass | — | yes |
| 69504 | 7,4->7,3 | FAIL | — | FAIL | — | yes |
| 69504 | 7,3->7,2 | FAIL | — | FAIL | — | yes |
| 69504 | 7,2->7,1 | FAIL | — | FAIL | — | yes |
| 69505 | 4,4->5,4 | pass | — | pass | — | yes |
| 69505 | 5,4->6,4 | pass | — | pass | — | yes |
| 69505 | 6,4->7,4 | pass | — | pass | — | yes |
| 69505 | 7,4->7,3 | pass | — | pass | — | yes |
| 69505 | 7,3->7,2 | pass | — | pass | — | yes |
| 69505 | 7,2->7,1 | pass | — | pass | — | yes |
| 69506 | 4,4->5,4 | pass | — | pass | — | yes |
| 69506 | 5,4->6,4 | pass | — | pass | — | yes |
| 69506 | 6,4->7,4 | pass | — | pass | — | yes |
| 69506 | 7,4->7,3 | pass | — | pass | — | yes |
| 69506 | 7,3->7,2 | pass | — | pass | — | yes |
| 69506 | 7,2->7,1 | pass | — | pass | — | yes |
| 69507 | 4,4->5,4 | pass | — | pass | — | yes |
| 69507 | 5,4->6,4 | pass | washed_out | FAIL | washed_out | NO |
| 69508 | 4,4->5,4 | pass | creek | FAIL | creek | NO |

A totals: E-pass fidelity 24/28 (unchanged from
creekhop — the old rule is unmoved, as it must
be); allow'-pass fidelity 24/24; entry agreement
34/34; E-fail moved (pocket entries) 6, all on
69501/69504; E-fail refused 0.

C band (69606-69607, route C1):

| Seed | Hop | E | Entry | allow' | Engine | Moved |
| 69606 | 4,4->4,5 | pass | — | pass | — | yes |
| 69606 | 4,5->4,6 | pass | creek | FAIL | creek | NO |
| 69607 | 4,4->4,5 | pass | creek | FAIL | creek | NO |

C totals: E-pass fidelity 1/3 (the old rule's
north-road failure, stated for contrast, not
judged); allow'-pass fidelity 1/1; entry
agreement 3/3; E-fail hops 0.

Conversions (allowed under E, vetoed under
allow'): 6 total — creek 5 (69502, 69503,
69508, 69606, 69607), washed_out 1 (69507).
Every conversion is an engine-refused hop; no
conversion is an engine-allowed hop. That is
the whole effect: the fix removes exactly the
false allows and nothing else, on both roads.

Veto invariance, precisely: the old veto set
(E-fail hops) is 6 hops; the new veto set is
those 6 plus the 6 conversions. No E-fail hop
changes veto status (0 changes), no E-fail
hop changes outcome (0 changes) — the 6
pocket entries on 69501/69504 are still
vetoed under allow' exactly as under E, and
still move on recorder legs (where no guard
is installed) exactly as before.

## Sense-testing (transcripts, not just counts)

The entry-checked allow changes NO spoken line
— as expected, and the expectation is now
measured, not assumed. The guard in shadow
mode never speaks, and the variant adds no
narration; the recorder legs install no guard
at all, so the only voices on refused hops are
the engine's own refusal lines, identical to
the creekhop pilot:

- 69502 (7,2)->(7,1), 69503 (4,4)->(5,4),
  69508 (4,4)->(5,4), 69606 (4,5)->(4,6),
  69607 (4,4)->(4,5): "The creek runs fast here
  — no crossing without a bridge or a swim."
- 69507 (5,4)->(6,4): "The path is washed out."

A grep over both judged jsonls finds zero
occurrences of the guard's veto line ("You
don't walk there") — the guard says nothing
anywhere in these legs, under either rule.
In plain words: a player on an armed leg with
the fix would hear nothing new and nothing
different at the refusal itself — the scholar
simply would not step, instead of stepping
and being refused. What the player would NOT
hear is any guard voice explaining why the
step was fenced: the veto line ("You don't
walk there — you couldn't get home from
there.") would be spoken for the newly vetoed
creek/washout hops, and on a creek hop that
line names the wrong reason (the hop is fenced
because the creek cannot be entered, not
because home cannot be reached from beyond
it). That wording gap is a property of the
existing veto line meeting a new veto cause,
not of the allow' rule itself.

OPEN QUESTION (carried, not answered): should
the guard speak when an allowed hop is
engine-refused — and, now sharper, if the fix
lands, should the veto line distinguish an
entry veto ("you can't step there") from an
escape veto ("you couldn't get home from
there")? The creekhop narration question
survives this run unchanged, plus this wording
wrinkle. It belongs to the deploy arm, not to
this judged instrument.

## Village assessment (plain words)

Ten villages, five days each, two roads walked
ten times. On the east road the story is the
same as the pilot told it, now with the fix
measured against it: six roads walk clean to
the far tile, two roads walk into pocket
ground the guard would fence (and still fence
— those vetoes are untouched), and four roads
are stopped by the land itself — fast creeks
with no bridge, twice on the very first step
out of haven, and one washed-out path even a
swimmer cannot take. On the north road the
same creek story repeats at smaller scale: one
village walks one step into a grove and is
stopped by a fast creek, another is stopped by
a fast creek on its very first step out of
haven. Under the old allow, all six of those
stopped steps were called fine by the guard;
under the entry-checked allow, all six are
fenced and every step the engine actually
allows is still allowed. Nothing here is a
village growing or failing — these are five-
day recorder legs, not campaigns — but the
guard's map of "where can you step" now
matches the land's own answers on every hop
on both roads.

## Wall numbers (day-5 limit stated)

Recorder legs stop on day 5 by design, so NO
national / table / win claims are made from
this run, and no wall movement is shown:
- Day-5 walk-out reached: A 8/8 legs, C 2/2
  legs (10/10 total).
- National reach: not measured (window ends
  day 5). Table reach: not measured. Wins: not
  measured. Wave reach beyond the walk-out:
  not measured. Median survival: not measured
  beyond day 5 (all 10 scholars alive at the
  walk-out).
Any wall number quoted from this run beyond
"10/10 legs reached the day-5 walk-out" would
be fabrication.

## Metric review (for the NEXT run, never a re-score)

- The three-leg GO structure held up: fidelity
  alone would have hidden a veto regression,
  and entry agreement alone would have hidden a
  fidelity failure. Keep all three legs for any
  follow-up guard-allow judgement.
- The pooled GO figure (25/25) is dominated by
  the A band (24 of 25 allow'-pass hops); the
  C band contributes 1 allow'-pass hop. The
  per-band split is reported above so the pool
  cannot hide a weak band — and on this run
  neither band is weak. A future band with a
  1-hop allow'-pass denominator should not be
  pooled silently; keep reporting per-band.
- The prereg's roadwork-credit carve-out never
  fired: no refused hop on either band is
  rubble-only, so no hop tests whether allow'
  should consult the credit pool. If a later
  band produces a rubble-blocked E-pass hop,
  that hop will read as an allow' refusal under
  this definition — the deploy arm should
  decide explicitly whether the entry check
  keeps raw checkHop or inherits E's credit,
  before landing, rather than discovering it
  on a live leg.
- The veto-line wording wrinkle (sense-test
  above) is a metric-adjacent gap, not a
  metric failure: no prereg leg measured
  narration, and none failed. It is carried as
  an open question for the deploy arm.
- No metric was moved mid-run; the verdict is
  the prereg header's verdict on the prereg
  header's numbers.

## Balanced panel (§15)

INAPPLICABLE, as declared in the prereg — not
fabricated. The panel expresses guard policies
on natural campaigns; this run's before/after
IS the recorder leg vs the prior shadow/pilot
leg on identical seeds (the control gate),
with allow' computed from the same recorded
hops. The recorder leg vs shadow leg
comparison on identical seeds is the
comparison; no panel was built and no compare
file is fabricated. The creekhop reasoning
stands: a panel would measure campaign
trajectories, while this run judges a
hop-level allow rule on forced walk-outs.

## Findings for the coordinator (sim-findings format; NOT
written to hidden_files/sim-findings.md — coordinator appends)

- [open] 2026-11-02 — guard-E-fidelity — entry-
  checked allow' VALIDATED (GO, this run):
  allow' = E pass AND checkHop clear predicts
  engine movement 25/25 pooled (A 24/24, C
  1/1) on fresh 69501-69508 + 69606/69607 legs,
  vetoes unchanged (6 E-fail hops, 0 veto
  changes, 0 E-fail outcome changes), entry
  model agrees with the engine 37/37. 6
  allow-to-veto conversions, all engine-refused
  (5 creek, 1 washed_out). Fix shape is a
  judged instrument only — deploy belongs to a
  later arm's decision.
- [open] 2026-11-02 — guard-narration — veto-line
  wording wrinkle for the deploy arm (this
  run's sense-test): the existing veto line
  ("You don't walk there — you couldn't get
  home from there.") names the wrong reason
  for an entry veto (the hop is fenced because
  the destination cannot be entered, not
  because home cannot be reached from beyond
  it). Deploy arm should decide whether the
  veto line distinguishes entry vetoes from
  escape vetoes. Carried open question: should
  the guard speak when an allowed hop is
  engine-refused?
- [open] 2026-11-02 — guard-E-fidelity — credit
  carve-out untested (this run's metric
  review): no rubble-only refused hop occurred
  on either judged band, so whether allow'
  should consult E's roadwork credit pool is
  still undecided. Deploy arm to decide
  explicitly before landing.

## Census (proof, not judged evidence)

scripts/test-guarde-entry-b.js: ALL PASS (30
checks — synthetic 69502 creek shape, synthetic
pocket-entry shape, synthetic clean allow,
record-form agreement, pilot fixture 34 hops /
E-pass 24/28 / allow' 24/24 / veto invariance /
entry 34/34 / 69502 hop, reused-files-
unmodified, analyzer fixture reproduction,
prereg band checks). Predecessor proof test
re-run post-band as a regression check:
test-guarde-creekhop-b 17/17, green, not
re-authored.

## Corpora

- evidence/2026-11-02/sim-guarde-entry-b-prereg.md
- evidence/2026-11-02/sim-guarde-entry-b.md (this file)
- evidence/2026-11-02/sim-guarde-entry-b-pilot.jsonl
- evidence/2026-11-02/sim-guarde-entry-b-pilot.log
- evidence/2026-11-02/sim-guarde-entry-b-c.jsonl
- evidence/2026-11-02/sim-guarde-entry-b-c.log
- evidence/2026-11-02/sim-guarde-entry-b-fidelity.txt
- scripts/policies/competent-guarde-entry-b.js
- scripts/analyze-guarde-entry-b.js
- scripts/test-guarde-entry-b.js
