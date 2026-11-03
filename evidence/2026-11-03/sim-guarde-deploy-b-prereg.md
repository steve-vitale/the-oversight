# sim-guarde-deploy-b — PREREG (committed BEFORE any judged leg)

Run: oversight-flesh-out-loop-b, arm sim-guarde-deploy-b
(coordinator brief 2026-11-03, run
fleshout-loop-b-20261103T080700Z, axis food-economy).
Worktree sim-guarde-deploy-b, branch sim-guarde-deploy-b.
Base commit (pinned before any judged leg): 436da92f6
(coordinator evidence: stale-lock recovery, sensorconfirm2
INSUFFICIENT-DATA + pocketpersist M6 succession landed).
This worker does NOT push, bump, verify live, merge, or
rebase; the coordinator lands the branch. Status to
coordinator: committed in worktree, pending coordinator
merge.

## Canon note

docs/CANON.md read first; docs/MAP.md §6 states the way
home as travel through the same travelTo pipeline as
walking out. No canon doc covers the pocket guard
itself: it is a policy-side sim instrument (a competent
variant), not a game system, so there is no canon to
invent from — the guard's E(D) model is inherited
verbatim from scripts/policies/competent-homewardstep-b.js
(installGuard/escapeCheck/checkHop). This run is
INSTRUMENT DEPLOY + JUDGED PILOT/CONFIRM: zero src/js
changes, zero edits to scripts/policies/competent.js,
zero policy-default flips. The guard instrument is
default OFF (nothing loads it unless a driver names it
— verified by grep: no reference in src/js, index.html,
or scripts/policies/competent.js; only named drivers
and tools import it, sweep-compare via an opt-in policy
name). Editing the instrument's own veto rule is
therefore NOT a default flip and NOT a live rule
change: deploy means the instrument file itself now
vetoes on allow' instead of on E alone. If that
reading were wrong (e.g. the guard were a live-loaded
rule), the brief's STOP clause would apply; it is not
wrong on this base, so the run proceeds.

## Predecessors (read in full, never re-litigated, never re-judged)

- evidence/2026-11-02/sim-guarde-creekhop-b.md
  (creekhop DIAG): guard-E is ENTRY-BLIND —
  installGuard evaluates ONLY escapeCheck(D), escape
  FROM the destination, never entry INTO it; E-pass
  fidelity 24/28 = 85.71%; the guard's own checkHop
  with explicit origin predicted the engine exactly on
  34/34 hops.
- evidence/2026-11-02/sim-guarde-entry-b.md + prereg
  (entry-checked allow' VALIDATED GO as a judged
  instrument ONLY): allow' = E pass AND checkHop clear
  predicts engine movement 25/25 pooled on fresh
  69501-69508 + 69606/69607 legs, vetoes unchanged
  (6 E-fail hops, 0 veto changes), entry model agrees
  37/37; 6 allow-to-veto conversions, all
  engine-refused (5 creek, 1 washed_out). Deploy
  explicitly belongs to a later arm's decision, NOT
  that run. This run IS that deploy decision.

## Question

Does the entry-checked allow' DEPLOYED INTO the guard
instrument (installGuard vetoes on NOT allow' instead
of NOT E) hold its judged fidelity on fresh legs, keep
every old veto, and cost nothing in armed movement or
survival — with the two carried open questions decided
below BEFORE landing?

## DECISION (a) — VETO-LINE WORDING: DISTINGUISH (decided now)

The veto line DISTINGUISHES entry vetoes from escape
vetoes. Rationale: the existing line ("You don't walk
there — you couldn't get home from there.") names the
wrong reason for an entry veto (entry-b run
sense-test), and canon's standing rule is "No silent
actions. Every action narrates honestly." A single
line would keep speaking a false reason on every
newly vetoed creek/washout hop. The fix is two lines,
same voice, parallel structure:

- ESCAPE veto (E fail, old veto set, unchanged):
  "You don't walk there — you couldn't get home from
  there." (verbatim, untouched).
- ENTRY veto (E pass, entry blocked, new vetoes only):
  "You can't step there — you couldn't get in from
  here."

The entry line is deliberately generic, NOT
blockType-specific: checkHop blockers can be multiple
and can sit on intermediate tiles of a multi-tile
jump, so naming one blocker could mislead; "couldn't
get in from here" is true for every entry veto and
carries the side-specific truth (the same tile may be
enterable from another side). Veto cause is recorded
per hop in the guard log (vetoCause: 'escape' |
'entry' | null). Veto MEMORY is unchanged (first veto
of a destination speaks, repeats silent, still
vetoed) — if one destination is first vetoed for one
cause and later for the other, the second is silent;
that is a narration-count effect only, trajectory
unchanged, and it is disclosed here rather than
re-keying memory by cause (a bigger change than the
wording question asks for). Cause precedence: a hop
that is BOTH E-fail and entry-blocked is an ESCAPE
veto (it belongs to the old veto set; entry vetoes
are exactly the E-pass + entry-blocked conversions).

## DECISION (b) — CREDIT-POOL CARVE-OUT: RAW checkHop, NO credit (decided now)

The deployed entry check keeps RAW checkHop
(blockers.length === 0), and does NOT inherit E's
roadwork credit pool. Rationale, in order:

1. Fidelity: the entry run validated RAW checkHop
   against the engine 37/37. E's credit is a concession
   inside the RETURN sim (one rubble clearance the
   scholar could do on the way home); the engine's
   travelTo grants no such credit on the real hop — a
   rubble-blocked destination from this origin is
   engine-refused. Inheriting credit into entry would
   therefore re-create entry-blindness in a new
   costume: allow' would pass a hop the engine
   refuses, and allow'-pass fidelity would fall by
   exactly those hops.
2. Scope: credit answers "could you get home from
   there if you cleared one rubble tile on the way?"
   Entry answers "can you step onto there from here?"
   Different questions; the credit belongs to the
   first, not the second.
3. Precedent: the entry prereg deliberately kept raw
   checkHop, and its GO verdict rests on that
   definition. Changing the definition at deploy time
   without new evidence would void the validation
   this deploy is meant to land.

PROBE (non-judged, runs after this prereg commit,
before the judged pilot verdict is written): (i) a
synthetic unit probe in the proof test — a stub Game
whose destination travelBlockage returns rubble-only
from the hop origin, with E passing — must yield
allow' FALSE under raw checkHop and would yield TRUE
under a credit-inheriting variant, proving the two
definitions differ exactly on rubble-only hops;
(ii) a LIVE probe sweep — recorder legs, route A
seeds 69521-69540 + route C1 seeds 69616-69623,
non-judged, reported separately — searching for a
rubble-only E-pass hop in the wild.

OVERTURN EVIDENCE (stated now, before any probe
result): the raw decision is overturned ONLY by a
live or engine-faithful hop in which an E-pass hop
with rubble-only entry blockers MOVES (engine
allows it). That would prove the engine itself
grants rubble passage and raw over-blocks. A
rubble-only E-pass hop that is engine-REFUSED
confirms raw (and condemns the credit variant).
Finding NO rubble-only hop leaves the decision
standing on rationale (1)–(3) above, documented as
unprobed-in-the-wild, not as proven-in-the-wild.
If overturn evidence appears, the verdict is NO-GO
and the arm is KILLED (revert, see below) — the
decision is not re-argued mid-run.

## Deploy shape (fixed now, no other change)

In scripts/policies/competent-homewardstep-b.js,
installGuard ONLY (escapeCheck, checkHop,
attemptHop, simulateReturnPool, lateralCandidates,
offersFrom, havenOf, dailyWithGuard untouched):

- Per guarded hop, compute entry = checkHop(px, py,
  x, y) alongside esc = escapeCheck(x, y, hv.x, hv.y).
- allow' = esc.ok AND entry.blockers empty.
- Veto IFF NOT allow' (was: IFF NOT esc.ok).
  Shadow mode unchanged (never vetoes, never says).
- Veto cause: !esc.ok => 'escape'; else (entry
  blocked) => 'entry'. Spoken line by cause per
  decision (a); silent-repeat memory unchanged.
- Guard hop log gains fields, removes none:
  allowPrime (bool), vetoCause, entryBlockers
  (array of blockTypes). simOk stays E (backward
  compatibility with prior analyzers).
- No other file's logic changes. The entry-variant
  module (competent-guarde-entry-b.js) is NOT edited
  and NOT loaded by the deployed guard; the guard
  computes allow' from its own functions directly,
  so the deploy does not depend on a judged-only
  module. The proof test asserts the deployed guard
  and the entry-variant module AGREE on the pilot
  fixture (same allow' on every recorded hop).

## Measurement design (before/after on identical seeds)

Two paired measurements, both pre-registered:

(A) RECORDER legs (no guard installed; guard numbers
computed from records — the entry-run method):
fresh legs via scripts/creekhop-b-recorder.js
VERBATIM (zero edits), analyzed by the reused
scripts/analyze-guarde-entry-b.js (zero edits) for
allow' fidelity / veto invariance / entry agreement,
plus the new scripts/analyze-guarde-deploy-b.js for
the deploy-specific census. The deployed guard's
rule and allow' are the same predicate, so recorder
legs judge the deployed rule's fidelity.

(B) ARMED pair (guard installed, veto mode, via the
reused scripts/homewardstep-rpt-b-driver.js VERBATIM,
POLICY=competent-homewardstep-b, DAYS=30): OLD guard
vs NEW guard on identical seeds. ORDERING
CONSTRAINT, pre-registered: the OLD-guard armed legs
for BOTH pilot and confirm seed sets run BEFORE the
guard edit (they use already-committed code and are
baseline, not candidate spend); the NEW-guard armed
legs run AFTER the edit + proof commit. The pilot
gate (below) judges only after both pilot halves
exist; running baseline legs early does not judge
anything and does not spend candidate legs.

Cost guardrail (armed pair, per band): PASS requires
ALL of: (i) ZERO false vetoes in the new-guard log
(a vetoed hop with E pass AND empty entry blockers
— i.e. a hop allow' passes); (ii) band daysAlive
total (new) >= band daysAlive total (old); (iii)
band forage-success total (forages ok=true, new)
>= band forage-success total (old). Sims are
deterministic on identical seeds, so any deficit
traces to veto-path handling and is a regression
until proven otherwise. A guardrail failure is a
NO-GO even if fidelity passes.

## Pilot (8 seeds) — before ANY confirm spend

Recorder: A band 69501-69508, route A
(5,4;6,4;7,4;7,3;7,2;7,1), fresh legs.
Armed pair: same 8 seeds, 30d, old vs new guard.

Control gate (STOP condition, before any judged
number): fresh recorder legs must reproduce the
entry corpus moved-patterns (evidence/2026-11-02/
sim-guarde-entry-b-pilot.jsonl + -c.jsonl for the
pilot's A legs; C legs are not in the pilot) hop
for hop, day-5 start (4,4) on all 8. If ANY fails:
STOP, verdict INSUFFICIENT-DATA, report substrate
drift, do NOT judge allow'.

Pilot GO requires ALL of:
1. allow'-pass fidelity >= 95% on the pilot
   recorder band.
2. VETOES UNCHANGED: 0 veto changes on E-fail hops;
   0 E-fail outcome changes (same operationalization
   as the entry run).
3. ENTRY MODEL AGREEMENT: checkHop blockers empty
   <=> engine moved on EVERY attempted pilot
   recorder hop (N/N).
4. COST GUARDRAIL (armed pilot pair): (i)–(iii)
   above, all pass.
5. SENSE-TEST (armed pilot legs): every SPOKEN
   entry veto line in the new-guard say transcript
   is the entry line, every spoken escape veto line
   is the escape line (census from sayLines +
   hop-log vetoCause on spoken vetoes); at least
   one entry veto and one escape veto must occur
   across the pilot armed legs for the wording
   decision to be sense-tested in vivo — if no
   entry veto occurs on armed pilot legs, the
   wording check falls back to the proof test's
   stub-Guard spoken-line assertions plus the
   recorder conversions, and the evidence file says
   so explicitly (wording in vivo: untested, not
   passed).

Pilot verdicts: GO => run confirm. NO-GO (any leg
1–4 fails, or rubble overturn evidence) => KILL
immediately, no confirm spend. INSUFFICIENT-DATA
(control gate fails, or < 6 pilot recorder legs
reach day-5 haven, or an armed pilot pair fails
with a driver error) => report, no confirm spend.

## Confirm (fresh band, 16 seeds) — only if pilot GO

Recorder: A2 69511-69518 route A + C2 69608-69615
route C1 (4,5;4,6;4,7;4,8;3,8;2,8 via
CONSTRUCT_ROUTE_A), fresh legs, per-band split
reported (A2 and C2 separately AND pooled).
Armed pair: same 16 seeds, 30d, old vs new guard.

Confirm GO requires ALL of:
1. allow'-pass fidelity >= 95% POOLED, and >= 90%
   PER BAND for any band with >= 4 allow'-pass
   hops (a band with < 4 allow'-pass hops reports
   counts only; the pooled bar governs it, so a
   1-hop band cannot silently pass or fail the run).
2. VETOES UNCHANGED: 0 / 0 on the confirm recorder
   band (pooled and per band).
3. ENTRY MODEL AGREEMENT: N/N on the confirm
   recorder band (pooled and per band).
4. COST GUARDRAIL (armed confirm pair): (i)–(iii)
   above, all pass, pooled and per seed-set (A2
   seeds and C2 seeds separately for (ii)–(iii)
   counts, so a weak set cannot hide in a pool).
5. SENSE-TEST (armed confirm legs): same line-cause
   census as pilot; entry-line / escape-line
   confusion count must be 0.

Confirm verdicts: GO => arm LANDS (edit + proof +
analyzer + evidence committed in worktree, pending
coordinator merge). NO-GO => KILL (below).
INSUFFICIENT-DATA (< 12/16 confirm recorder legs
reach day-5 haven, or < 12/16 armed pairs complete
without driver error) => report, do NOT land, do
NOT kill the instrument (the edit stays committed
in worktree, unlanded, with the insufficiency
stated — coordinator decides; a data shortage is
not a falsification).

## KILL procedure (NO-GO only)

Revert scripts/policies/competent-homewardstep-b.js
to HEAD (no trace of the deploy in the instrument
file), DELETE scripts/test-guarde-deploy-b.js and
scripts/analyze-guarde-deploy-b.js (they test a
reverted change), KEEP prereg, recorder/armed
jsonls, logs, probe results, and the evidence file
(which records the NO-GO leg and its numbers).
Verify the worktree then contains only committed
work plus the kept evidence (all committed before
reporting).

## Horizon + wall numbers (death-aware)

Recorder legs stop on day 5 by design; armed legs
run 30d. NO national / table / win claims are made
from this run: wall numbers are day-5 walk-out
reach (recorder) and 30d survival (armed pair),
with those limits stated in the evidence file. A
longer window is NOT run here — the question is
hop-level fidelity + armed cost, not survival.

## Balanced panel (§15)

INAPPLICABLE, as declared in the entry run (not
fabricated): the panel expresses guard policies on
natural campaigns; this run's before/after IS the
recorder leg vs the prior leg on identical seeds
(control gate) plus the old-vs-new armed pair on
identical seeds. No panel is built and no compare
file is fabricated. The armed pair IS a natural
campaign comparison, but the panel's all23
per-policy metrics are not the pre-registered
judge here — the prereg legs above are.

## Sense-testing law

Read the refusal transcripts on armed legs (new
guard): do the veto lines read true for their cause
(entry vs escape)? Judge meaning, not just counts.
Quote entry-veto and escape-veto lines in the
evidence file, with the hop that produced each.
Also read one engine-refusal line on an old-guard
armed leg for contrast (the voice the entry veto
replaces). The evidence file carries a village
assessment in plain words, wall numbers with the
day-5/30d limits stated, a "metric review" section,
and findings for the coordinator in sim-findings
format (NOT written to hidden_files/sim-findings.md
by this worker — the coordinator appends).

## Census (proof, not judged evidence)

BEFORE any NEW-guard judged leg runs, the proof
test scripts/test-guarde-deploy-b.js must show:
(a) the deployed installGuard (from the edited
instrument file) vetoes an E-pass + entry-blocked
hop with the ENTRY line, vetoes an E-fail hop with
the ESCAPE line, and allows an E-pass + entry-clear
hop (stub Game, no full game load);
(b) veto-memory: a repeated entry veto of the same
destination is silent but still vetoed;
(c) shadow mode never vetoes and never says, even
on an entry-blocked hop;
(d) rubble-only synthetic probe: stub destination
travelBlockage returns rubble-only from the hop
origin, E passes => deployed guard vetoes (raw
checkHop), while a credit-inheriting allow variant
computed in-test would pass — proving the
definitions differ exactly here;
(e) deployed-guard vs entry-variant agreement on
the entry pilot fixture (every recorded hop: same
allow' from the guard's predicate as from
allowPrimeFromRecord);
(f) reused-files-unmodified: git check that
scripts/policies/competent.js, scripts/policies/
competent-guarde-entry-b.js, scripts/creekhop-b-
recorder.js, scripts/homewardstep-rpt-b-driver.js,
scripts/analyze-guarde-entry-b.js, and src/js are
unmodified in this worktree; the ONLY game-adjacent
edit is scripts/policies/competent-homewardstep-b.js
installGuard + log fields;
(g) prereg band checks (pilot/confirm/probe seed
sets and routes exactly as above).
Any proof failure is a proof failure: fix the
instrument, do not judge legs against a failing
one. The proof test runs NO new sims.

## Deliverable

Evidence file evidence/2026-11-03/sim-guarde-deploy-b.md
(prereg header, control-gate result, per-hop table
for judged recorder bands, armed-pair cost table,
sense-test transcript sample + judgement, village
assessment in plain words, wall numbers with limits
stated, metric review section, findings for the
coordinator in sim-findings format), plus the
guard edit + proof test + deploy analyzer + fresh
recorder/armed jsonls/logs, all committed on branch
sim-guarde-deploy-b. Report to coordinator: verdict
(GO / NO-GO / INSUFFICIENT-DATA with the
pre-registered legs), the two decisions (wording +
credit) with rationale, fidelity numbers per leg,
cost-guardrail numbers, sense-test finding, commit
hashes, proof-test result, anything left uncommitted
or failed.

## Explicitly excluded

No src/js changes; no edits to competent.js, the
entry-variant module, the creekhop recorder, the
armed driver, or the entry analyzer; no default
flip; no bundled fix; no guard-allow rule change in
any live-loaded policy (the instrument file is
default-OFF, driver-named only); no seeds outside
the pilot/confirm/probe sets above judged; no push,
bump, live verification, merge, or rebase; no edit
to hidden_files/sim-findings.md.
