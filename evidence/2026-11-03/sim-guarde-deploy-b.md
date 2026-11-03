# sim-guarde-deploy-b — Guard-E entry fix DEPLOYED into the guard, judged

Run: oversight-flesh-out-loop-b, arm sim-guarde-deploy-b
(coordinator brief 2026-11-03, run
fleshout-loop-b-20261103T080700Z, axis food-economy).
Worktree sim-guarde-deploy-b, branch sim-guarde-deploy-b.
Base commit (pinned in prereg): 436da92f6.
Prereg: evidence/2026-11-03/sim-guarde-deploy-b-prereg.md
(committed 3f007c6ef BEFORE any judged leg).
Instruments: committed b178cd707 (proof 28/28)
before the NEW-guard judged legs ran; the OLD-guard
armed baseline (24 legs) ran before the guard edit,
as pre-registered. This worker does NOT push, bump,
verify live, merge, or rebase; the coordinator lands
the branch. Status to coordinator: committed in
worktree, pending coordinator merge.

## Verdict (judged against the prereg header, never re-scored)

- **GO — the deploy lands. All five prereg legs pass
  on the pilot AND on the fresh confirm band.**
  1. allow'-pass fidelity: pilot 24/24; confirm
     pooled 65/65 (A2 38/38, C2 27/27) — >= 95%
     pooled, >= 90% per band, both bands with
     denominators >= 4.
  2. VETOES UNCHANGED: pilot 0 veto changes on
     E-fail hops, 0 E-fail outcome changes;
     confirm 0 / 0 pooled and per band.
  3. ENTRY MODEL AGREEMENT: pilot 34/34; confirm
     75/75 (A2 43/43, C2 32/32).
  4. COST GUARDRAIL (armed old-vs-new pairs, 30d,
     identical seeds): pilot false vetoes 0,
     daysAlive 240 = 240, forageOk 150 = 150;
     confirm false vetoes 0, daysAlive 480 = 480,
     forageOk 260 = 260 — and per seed-set (A2
     240 = 240 / 131 = 131; C2 240 = 240 / 129 =
     129). Trajectories are identical, not merely
     no-worse: every seed's daysAlive and
     forageOk match exactly between arms.
  5. SENSE-TEST: spoken entry vetoes and spoken
     escape vetoes both occur in vivo on pilot and
     confirm; say-line counts match hop-log spoken
     counts on every seed; line-cause confusion 0.
- The deploy is NOT a default flip and NOT a live
  rule change: the guard instrument file is
  default-OFF (verified by grep: no reference in
  src/js, index.html, or scripts/policies/
  competent.js; only named drivers/tools import
  it). Deploy means the instrument file itself now
  vetoes on NOT allow' instead of NOT E. Zero
  src/js changes, zero edits to competent.js, the
  entry-variant module, the recorder, or the armed
  driver.

## The two decisions (decided in the prereg, before landing)

### (a) VETO-LINE WORDING: DISTINGUISH — landed as decided

- ESCAPE veto (E fail, old veto set, unchanged):
  "You don't walk there — you couldn't get home
  from there." (verbatim).
- ENTRY veto (E pass, entry blocked, new vetoes
  only): "You can't step there — you couldn't get
  in from here."
- The entry line is generic, not blockType-specific:
  checkHop blockers can be multiple and can sit on
  intermediate tiles of a multi-tile jump, so naming
  one blocker could mislead; "couldn't get in from
  here" is true for every entry veto and carries the
  side-specific truth (the same tile may be enterable
  from another side). Veto cause is recorded per hop
  (vetoCause: 'escape' | 'entry' | null); a hop that
  is BOTH E-fail and entry-blocked is an ESCAPE veto
  (it belongs to the old veto set). Veto memory is
  unchanged (first veto of a destination speaks,
  repeats silent, still vetoed) — so a destination
  vetoed 9 times speaks once, as the confirm legs
  show (69609: 9 entry vetoes, 1 spoken).

### (b) CREDIT-POOL CARVE-OUT: RAW checkHop, NO credit — landed as decided, and now CLOSED BY LIVE EVIDENCE

The deployed entry check keeps RAW checkHop
(blockers empty), without E's roadwork credit.
The prereg rationale stands (credit answers "could
you get home if you cleared rubble on the way",
entry answers "can you step on from here"; the
engine grants no credit on a real hop, so a
credit-inheriting allow' would re-create
entry-blindness for rubble hops). What changed
during this run: the question is no longer
unprobed-in-the-wild.

- The live probe sweep (28 recorder legs, 136 hops:
  route A 69521-69540 + route C1 69616-69623,
  non-judged) found NO rubble-only E-pass hop
  (conversions 13: creek 9, washed_out 3,
  fallen_tree 1; allow' 115/115; entry 136/136).
- The JUDGED confirm band then produced one:
  69514 (6,4)->(7,4), E pass, entry rubble,
  engine rubble, moved FALSE, tile forest_floor.
  A rubble-only hop the engine refuses is exactly
  what raw checkHop vetoes and a credit variant
  would falsely allow. The credit decision is
  therefore confirmed by live evidence, not just
  by argument.
- Armed play corroborates: 69614 carries 11
  entry vetoes on (4,3)->(3,4) with rubble blockers
  in natural play, with that seed's daysAlive and
  forageOk identical between old and new arms —
  vetoing the rubble step cost nothing, because
  the engine would have refused it anyway.
- Overturn evidence (an E-pass rubble-only hop
  that MOVES) never appeared anywhere: probe 0,
  pilot 0, confirm 0 such hops. The carve-out is
  closed; a future rubble-moving hop would reopen
  it, and none is known.

## What was built (guard instrument edit + new files ONLY)

- scripts/policies/competent-homewardstep-b.js
  (installGuard ONLY; escapeCheck, checkHop,
  attemptHop, simulateReturnPool, lateralCandidates,
  offersFrom, havenOf untouched): per guarded hop,
  entry = checkHop(origin, dest); allow' = esc.ok
  AND entry blockers empty; veto IFF NOT allow'
  (was: IFF NOT esc.ok); spoken line by vetoCause
  per decision (a); shadow mode unchanged; hop
  log gains allowPrime, vetoCause, entryBlockers
  (blockType strings) and removes nothing (simOk
  stays E for prior analyzers); new counter
  homewardstepEntryVetoes. Header comment updated
  to describe the deploy.
- scripts/test-guarde-deploy-b.js — proof 28/28
  (stub-Guard entry/escape lines, veto memory,
  shadow silence, rubble synthetic probe with the
  raw-vs-credit difference, fixture veto-set
  agreement with exactly the 6 known conversions,
  reused-files-unmodified, prereg band checks).
  Runs NO new sims.
- scripts/analyze-guarde-deploy-b.js — armed-pair
  analyzer: per-seed daysAlive / forageOk /
  veto-cause census / false vetoes / say-line
  census, plus band totals and the guardrail
  verdict line.
- UNCHANGED, verified by the proof test's git
  check: competent.js, competent-guarde-entry-b.js,
  creekhop-b-recorder.js, homewardstep-rpt-b-
  driver.js, analyze-guarde-entry-b.js, src/js.
  The entry-variant module was NOT edited and is
  NOT loaded by the deployed guard — the guard
  computes allow' from its own functions directly.

## Control gate: base equality (STOP condition — PASSED, 8/8)

Fresh pilot recorder legs reproduce the entry
corpus moved-patterns hop for hop, day-5 start
(4,4) on all 8 A seeds (69501 TTTTTT, 69502
TTTTTF, 69503 F, 69504 TTTTTT, 69505 TTTTTT,
69506 TTTTTT, 69507 TF, 69508 F). No substrate
drift. Every judged recorder number below is a
fresh leg on base 436da92f6, not a reused corpus
(the entry corpus served ONLY as the control
comparison).

## Judged recorder tables

### Pilot (69501-69508, route A, 34 forced hops)

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

Pilot totals: E-pass fidelity 24/28 (the old rule,
unmoved, as it must be); allow' 24/24; entry
34/34; E-fail hops 6 (all moved, pocket entries on
69501/69504); E-fail refused 0; conversions 4
(creek 3, washed_out 1) — all engine-refused.

### Confirm A2 (69511-69518, route A, 43 hops)

Moved-patterns: 69511 TTTTTT, 69512 TTTTTT,
69513 TTTTTT, 69514 TTF, 69515 TTTTTT, 69516 TTTF,
69517 TTTTTT, 69518 TTTTTT; day-5 start (4,4) 8/8.
E-pass fidelity 38/39; allow' 38/38; entry 43/43;
E-fail hops 4 (moved 3: 69512 7,3->7,2 and
7,2->7,1, 69517 7,2->7,1; refused 1: 69516
7,4->7,3, E-fail AND creek-blocked — an escape
veto under cause precedence, not a conversion).
Conversions 1: 69514 6,4->7,4 rubble (E pass,
engine rubble, moved false) — the live
rubble-only hop that closes decision (b).

### Confirm C2 (69608-69615, route C1, 32 hops)

Moved-patterns: 69608 TTTTTT, 69609 F, 69610 TTF,
69611 TTF, 69612 TTTTTT, 69613 TTTTTT, 69614
TTTTTT, 69615 F; day-5 start (4,4) 8/8.
E-pass fidelity 27/31; allow' 27/27; entry 32/32;
E-fail hops 1 (moved 1: 69613 4,8->3,8; refused
0). Conversions 4, all creek: 69609 4,4->4,5,
69610 4,6->4,7, 69611 4,6->4,7, 69615 4,4->4,5
(all engine-refused).
Full per-hop tables: evidence/2026-11-03/
sim-guarde-deploy-b-confirm-a-fidelity.txt and
sim-guarde-deploy-b-confirm-c-fidelity.txt.

### Confirm pooled

Hops 75; allow' 65/65 = 100% (A2 38/38, C2
27/27); entry agreement 75/75; E-fail hops 5
(moved 4, refused 1); veto changes on E-fail
hops 0; E-fail outcome changes 0; conversions 5
(creek 4, rubble 1), every one engine-refused.
No hop the engine allows is newly vetoed; no hop
the old guard vetoed is newly allowed.

## Armed-pair cost tables (30d, guard installed, veto mode)

### Pilot (69501-69508)

| Seed | daysAlive old/new | forageOk old/new | vetoes old/new | entry vetoes new | false vetoes new |
| 69501 | 30/30 | 9/9 | 0/0 | 0 | 0 |
| 69502 | 30/30 | 27/27 | 0/2 | 2 | 0 |
| 69503 | 30/30 | 20/20 | 0/0 | 0 | 0 |
| 69504 | 30/30 | 2/2 | 4/6 | 2 | 0 |
| 69505 | 30/30 | 23/23 | 0/0 | 0 | 0 |
| 69506 | 30/30 | 19/19 | 0/0 | 0 | 0 |
| 69507 | 30/30 | 22/22 | 0/0 | 0 | 0 |
| 69508 | 30/30 | 28/28 | 12/12 | 0 | 0 |

Pilot totals: daysAlive 240 = 240, forageOk 150 =
150, false vetoes 0. New vetoes 20 vs old 16:
delta +4 = exactly the pilot entry vetoes (69502
2, 69504 2). Escape vetoes are unchanged in
count where they occur (69504: 4 old, 4 new;
69508: 12 old, 12 new).

### Confirm (69511-69518 + 69608-69615)

| Seed | daysAlive old/new | forageOk old/new | vetoes old/new | entry vetoes new | false vetoes new |
| 69511 | 30/30 | 9/9 | 0/2 | 2 | 0 |
| 69512 | 30/30 | 14/14 | 0/0 | 0 | 0 |
| 69513 | 30/30 | 19/19 | 0/0 | 0 | 0 |
| 69514 | 30/30 | 19/19 | 0/0 | 0 | 0 |
| 69515 | 30/30 | 20/20 | 0/0 | 0 | 0 |
| 69516 | 30/30 | 27/27 | 0/0 | 0 | 0 |
| 69517 | 30/30 | 11/11 | 0/0 | 0 | 0 |
| 69518 | 30/30 | 12/12 | 0/0 | 0 | 0 |
| 69608 | 30/30 | 17/17 | 0/0 | 0 | 0 |
| 69609 | 30/30 | 27/27 | 0/9 | 9 | 0 |
| 69610 | 30/30 | 10/10 | 0/0 | 0 | 0 |
| 69611 | 30/30 | 9/9 | 57/63 | 6 | 0 |
| 69612 | 30/30 | 19/19 | 0/1 | 1 | 0 |
| 69613 | 30/30 | 11/11 | 5/7 | 2 | 0 |
| 69614 | 30/30 | 18/18 | 0/17 | 17 | 0 |
| 69615 | 30/30 | 18/18 | 0/1 | 1 | 0 |

Confirm totals: daysAlive 480 = 480, forageOk 260
= 260, false vetoes 0. New vetoes 100 vs old 62:
delta +38 = exactly the confirm entry vetoes
(69511 2, 69609 9, 69611 6, 69612 1, 69613 2,
69614 17, 69615 1). Escape veto counts are
unchanged where they occur (69611: 57 old, 57
new; 69613: 5 old, 5 new). Entry vetoes in
natural play include multi-tile jumps with
intermediate blockers (69502 7,2->7,0 creek+creek;
69613 2,7->2,4 creek+creek; 69611 4,4->2,4 creek)
— the retry-jump shape the creekhop run noted —
and destination blockers of every kind seen so
far (creek, washed_out, fallen_tree, rubble).

## Sense-testing (transcripts, not just counts)

The deployed guard speaks, and it speaks true to
cause. Spoken lines on armed legs, new guard:

- ENTRY (pilot): 69502 day 5, twice — "You can't
  step there — you couldn't get in from here."
  (the 7,2->7,1 creek hop and the 7,2->7,0 retry
  jump over it); 69504 day 4, once (4,3->5,4
  creek).
- ESCAPE (pilot): 69504 day 23, twice — "You don't
  walk there — you couldn't get home from there.";
  69508 day 16, once (same line).
- ENTRY (confirm): 69511 (2 spoken), 69609 (1
  spoken of 9 vetoes — one destination, memory),
  69612 (1, fallen_tree), 69613 (2, creek and
  washed_out), 69614 (2 spoken of 17 vetoes — two
  destinations, rubble and creek), 69615 (1).
- ESCAPE (confirm): 69611 (1 spoken of 57 vetoes),
  69613 (5 spoken).
- Line-cause confusion: 0 on every seed — every
  spoken entry line sits on a vetoCause='entry'
  hop, every spoken escape line on a
  vetoCause='escape' hop, and say-line counts equal
  hop-log spoken counts seed by seed.

Contrast (the voice the entry veto replaces): on
the OLD-guard 69502 leg, day 5, the engine speaks
twice — "The creek runs fast here — no crossing
without a bridge or a swim." — after the scholar
has already stepped and been refused. On the NEW
leg the guard speaks twice on the same day, before
any step, and names the step itself as blocked
rather than the way home. The trade is honest in
both directions: the player loses the engine's
obstacle-specific line (creek, with its bridge-or-
swim remedy) and gains a veto spoken before the
step, with the cause correctly named but the
obstacle unnamed. That trade was the prereg's
decision (a) bargain — generic-but-true over
specific-but-sometimes-wrong — and it reads true
in vivo. What the player is NOT told on an entry
veto is which obstacle blocks the step; if Steve
wants obstacle-named entry lines, that is a
follow-up narration decision, not a defect in this
deploy: no line spoken here is false.

One wrinkle, disclosed: on 69611, six entry vetoes
on (4,4)->(2,4) speak zero times — not because the
cause is wrong but because veto memory had already
spoken for that destination earlier in the run (as
an escape veto: spokenEscape 1). The memory key is
destination-only, as pre-registered: a destination
first vetoed for one cause and later for the other
speaks only the first time. The trajectory is
unaffected and the log still records the cause;
the spoken count is a narration-count effect only,
disclosed here rather than hidden.

## Village assessment (plain words)

Twenty-four villages lived thirty days each under
both guards, and nothing about their lives changed
except the voice at the fence. Every village
survived all thirty days under both guards; every
village brought home exactly the same food under
both guards, seed by seed. The difference is
entirely at the blocked step: where the old guard
let the scholar walk into a fast creek, a
washout, a fallen tree, or a rubble-choked path
and be turned back by the land, the new guard
stops them first and says the step itself cannot
be taken. Twice on one road the scholar tried the
same creek nine times in a month and heard the
guard once, then silence — the guard does not
nag. On another road the scholar spent a month
trying a pocket road fifty-seven times under the
old guard and sixty-three under the new, and
still came home every night: the fence is not a
prison, it is a map that finally matches the
land. Nothing here reaches national, the table,
or a win — the recorder stops on day 5 and the
armed legs on day 30 by design, so no wall
movement is claimed beyond: day-5 walk-out
reached 8/8 pilot + 16/16 confirm legs, and 30d
survival 24/24 legs under both guards.

## Wall numbers (limits stated)

- Day-5 walk-out reached: pilot 8/8, confirm
  16/16 (24/24 total recorder legs).
- 30d survival (armed pairs): 24/24 legs survived
  30d under BOTH guards (daysAlive 30 on every
  seed, both arms).
- National reach: not measured (windows end day
  5 / day 30). Table reach: not measured. Wins:
  not measured. Wave reach beyond the walk-out:
  not measured. Median survival beyond 30d: not
  measured. Any wall number quoted from this run
  beyond the two bullets above would be
  fabrication.

## Metric review (for the NEXT run, never a re-score)

- The five-leg GO structure (fidelity + veto
  invariance + entry agreement + cost guardrail +
  sense-test) held up: fidelity alone would have
  hidden a veto regression, the guardrail alone
  would have hidden a fidelity failure, and the
  sense-test alone would have hidden both. Keep
  all five for any follow-up guard-allow judgement.
- The per-band split mattered even at 100%: the
  confirm pooled figure (65/65) is A2-dominated
  (38 of 65 allow'-pass hops), and the C2 band is
  where the creek census lives (4 of 5 pooled
  conversions). Reporting pooled alone would have
  hidden that shape. Keep per-band reporting.
- The rubble question resolved itself through the
  judged band, not the probe: the 28-leg probe
  found no rubble-only hop, and the 16-seed
  confirm band found one on its fourth leg. A
  probe sweep is a weak instrument for rare
  blockers; judged bands are the instrument. Do
  not cite "probe found none" as evidence of
  absence — this run proves the opposite.
- The cost guardrail's strict form (exact equality
  on daysAlive and forageOk) turned out to be
  exactly right for deterministic sims: it passed
  exactly, not approximately, on all 24 pairs.
  A future guard change that moves either total by
  even one should be treated as a trajectory
  change to explain, not noise to tolerate.
- No metric was moved mid-run; the verdict is the
  prereg header's verdict on the prereg header's
  numbers. The one judgement made after the
  numbers (the homext parity break, below) is
  NOT a prereg leg and did not change the verdict.

## Known predecessor-test breaks (diagnosed, NOT verdict legs, disclosed loudly)

Running predecessor proofs as regression checks
after the deploy:

- test-guarde-entry-b: 29/30 — the one failure is
  its "reused-files-unmodified" check naming
  scripts/policies/competent-homewardstep-b.js,
  which this deploy intentionally edits. All
  fidelity assertions still pass (E-pass 24/28,
  allow' 24/24, entry 34/34, veto invariance).
- test-guarde-creekhop-b: 16/17 — same check,
  same cause; all fidelity assertions still pass.
- test-homext-abl-b: FAILS on exactly one check,
  "A4 parity outward creek pocket (0,2)->(3,2):
  outward decisions identical" — the deployed full
  guard vetoes a d=3 jump over an intermediate
  creek tile (2,2), while the outward-only variant
  (E-only) allows it. Diagnosis, verified three
  ways: (1) the TRUE pristine guard (base
  436da92f6) passes homext 21/21, so the break is
  caused by the deploy, not pre-existing; (2) the
  REAL engine refuses exactly this jump —
  src/js/game.js travelTo, INTERMEDIATE BLOCKAGES
  (lines ~12472-12512): every tile on a shortest
  path must be enterable from the tile before it,
  and the first blockage refuses — so the deployed
  veto matches the engine and the outward-only
  allow is the entry-blindness this deploy fixes;
  (3) the homext stub's travelTo checks the
  DESTINATION only and never models intermediates,
  so its parity premise ("full == outward-only on
  outward hops") held only while full was E-only.
  The deploy deliberately retires that premise for
  entry-blocked hops. This worker did NOT edit the
  homext test (outside its allowed files, and
  loosening a predecessor assertion to fit a change
  is forbidden): the follow-up is a coordinator
  decision — update the parity premise to
  "identical except entry-blocked hops, where full
  vetoes and the engine refuses" — with this
  evidence attached. The break does not touch any
  prereg leg: all five pass on pilot and confirm,
  and armed trajectories are identical, which is
  in-vivo proof that intermediate vetoes replaced
  engine refusals rather than allowed moves.
- test-homewardstep-rpt-b: PASS 48 checks.
  test-vetobudget-b: 27/27 checks pass.

## Balanced panel (§15)

INAPPLICABLE, as declared in the prereg (not
fabricated): the panel expresses guard policies on
natural campaigns; this run's before/after IS the
recorder leg vs the prior leg on identical seeds
(control gate) plus the old-vs-new armed pair on
identical seeds (which ARE natural 30d campaigns,
judged by the prereg legs, not by panel metrics).
No panel was built and no compare file is
fabricated.

## Findings for the coordinator (sim-findings format; NOT
written to hidden_files/sim-findings.md — coordinator appends)

- [open] 2026-11-03 — guard-E-fidelity — entry-
  checked allow' DEPLOYED (GO, this run): the
  guard instrument now vetoes on NOT allow'
  (E pass AND raw checkHop clear) with
  distinguished veto lines; pilot allow' 24/24,
  confirm pooled 65/65 (A2 38/38, C2 27/27),
  vetoes unchanged 0/0 on both bands, entry
  agreement 34/34 + 75/75, armed cost guardrail
  exact (daysAlive 240=240 pilot, 480=480
  confirm; forageOk 150=150 pilot, 260=260
  confirm; false vetoes 0). Lands as committed
  work pending coordinator merge.
- [open] 2026-11-03 — guard-E-fidelity — credit
  carve-out CLOSED by live evidence (this run):
  69514 (6,4)->(7,4) is a rubble-only E-pass hop
  the engine refuses (moved false); raw checkHop
  vetoes it, a credit-inheriting allow' would
  falsely allow it. Armed 69614 corroborates (11
  rubble entry vetoes, trajectory identical).
  No E-pass rubble-only hop that MOVES is known.
- [open] 2026-11-03 — guard-narration — entry
  veto line landed (this run): "You can't step
  there — you couldn't get in from here."
  speaks on entry vetoes in vivo (pilot + confirm,
  0 line-cause confusions); escape vetoes keep
  the old line verbatim. Open follow-up (not a
  defect): entry lines name no obstacle, while
  the engine lines they replace named the obstacle
  and its remedy — obstacle-named entry lines
  are a Steve-facing narration decision for a
  later arm, if wanted.
- [open] 2026-11-03 — guard-tests — homext A4
  parity premise retired by the deploy (this
  run, diagnosed, needs a coordinator-owned test
  update): test-homext-abl-b fails one check
  because the deployed guard vetoes an
  intermediate-blocked multi-tile jump the
  E-only outward-only variant allows; the real
  engine refuses that jump (game.js travelTo
  intermediate scan), so the veto is correct and
  the test's parity premise is stale. Do NOT
  loosen the test silently — update its premise
  with this evidence attached. Entry/creekhop
  proof "unmodified guard" checks fail for the
  same intentional-edit reason (fidelity assertions
  all still pass).

## Census (proof, not judged evidence)

scripts/test-guarde-deploy-b.js: ALL PASS (28
checks — deployed stub-Guard entry/escape lines,
veto memory, shadow silence, rubble synthetic
probe, fixture veto-set agreement with exactly
the 6 known conversions, reused-files-unmodified,
prereg band checks). Predecessor proofs re-run
post-deploy as regression checks (see the
known-breaks section above, not re-authored):
test-guarde-entry-b 29/30 (guard-unmodified
check only), test-guarde-creekhop-b 16/17
(same check only), test-homewardstep-rpt-b 48
checks PASS, test-vetobudget-b 27/27 PASS,
test-homext-abl-b 1 A4 parity failure (diagnosed
above). Infrastructure note: scripts/safe-commit.sh
left the staged-deletion index-clobber artifact
twice in this worktree (prereg commit and
instruments commit); both commits verified correct
via git show --stat and the index repaired with
git update-index --cacheinfo from HEAD blobs
before further work — no content was lost.

## Corpora

- evidence/2026-11-03/sim-guarde-deploy-b-prereg.md
- evidence/2026-11-03/sim-guarde-deploy-b.md (this file)
- evidence/2026-11-03/sim-guarde-deploy-b-pilot.jsonl (+ .log, -pilot-fidelity.txt)
- evidence/2026-11-03/sim-guarde-deploy-b-armed-old-pilot.jsonl (+ .log)
- evidence/2026-11-03/sim-guarde-deploy-b-armed-new-pilot.jsonl (+ .log, -armed-pilot-compare.txt)
- evidence/2026-11-03/sim-guarde-deploy-b-confirm-a.jsonl (+ .log, -confirm-a-fidelity.txt)
- evidence/2026-11-03/sim-guarde-deploy-b-confirm-c.jsonl (+ .log, -confirm-c-fidelity.txt)
- evidence/2026-11-03/sim-guarde-deploy-b-armed-old-confirm.jsonl (+ .log)
- evidence/2026-11-03/sim-guarde-deploy-b-armed-new-confirm.jsonl (+ .log, -armed-confirm-compare.txt)
- evidence/2026-11-03/sim-guarde-deploy-b-probe-a.jsonl (+ .log)
- evidence/2026-11-03/sim-guarde-deploy-b-probe-c.jsonl (+ .log)
- scripts/policies/competent-homewardstep-b.js (deploy edit)
- scripts/test-guarde-deploy-b.js
- scripts/analyze-guarde-deploy-b.js
