# Loop B 0933Z — ADOPTION RUN (stale-lock recovery): falseclose LANDED, homewardstep HELD

Run: oversight-flesh-out-loop-b, run_id fleshout-loop-b-20261102T0933Z,
axis food-economy (converging). Sibling Loop A live on scale-onramp
throughout (0915Z claim: sim-titanroute-a + sim-stancelayer-a) — NOT
touched. No Loop A file, tree, or branch was read for writing, merged,
or released by this run.

## Stale-lock recovery (at run start, before any sims)

The previous Loop B run's lock (fleshout-loop-b-20261102T084841Z,
created 2026-11-02T08:48:41Z) was still present at this run's start
(09:29Z). Its freshest registered worker heartbeat was
sim-homewardstep-b at 09:10:44Z — 22 minutes stale at the 09:32Z
decision, past the body's 15-minute guard; sim-falseclose-b's
heartbeat was 08:52:07Z (40 minutes stale). Both workers' evidence
commits were already present and both worktrees clean, and a re-check
showed no heartbeat movement. Verdict: previous coordinator DEAD by
the guard. Its claim was retired to
lever-claims/fleshout-loop-b-20261102T084841Z.json.DEAD and its lock
deleted; this run's own lock + claim (0933Z) were written before any
further work. Disclosure, because the timing is tight: the falseclose
worker's evidence commit is timestamped 09:27:41Z — the worker
finished two minutes before this run started, after its coordinator's
last heartbeat. That is the documented dead-coordinator /
finishing-worker pattern (repo AGENTS.md, 2026-10-30), not a live
coordinator: no coordinator evidence, landing, or heartbeat followed
it. As a guard against the reverse error, every merge in this run was
preceded by a same-call liveness re-check (registry heartbeats still
this run's own 09:32:45Z stamps, branch tips and master tip unchanged);
nothing was rebased or merged on a stale read.

## Arms adopted (verbatim from the 0848Z run, 0741Z blanks 1 and 4)

- sim-homewardstep-b — homeward-step guard check (0741Z blank 1).
  Worker evidence: evidence/2026-11-02/sim-homewardstep-b.md.
- sim-falseclose-b — false-close proxy arrival condition (0741Z
  blank 4). Worker evidence: evidence/2026-11-02/sim-falseclose-b.md.

## Arm 1 — sim-falseclose-b: LANDED (instrument only, no game change)

Rebased onto master a9b63b886 clean (3/3, no conflicts; master had
not touched scripts/sweep-compare.js since the workers' base, and
scripts/policies/competent-latescape-b.js was absent from master, so
no collision). Proof re-run by the coordinator: 15/15 on the rebased
tip AND 15/15 on merged master. Merged --ff-only as 755b4ae41
(prereg 4ff4fa98e, build 42773194b, evidence 755b4ae41 — rebased
hashes of a00192eca / 41713e944 / 5b8f72a6d). Worktree released
done-merged, branch deleted, main tree clean at closeout.

What landed: the arrival-conditioned false-close proxy. The ported
policy (scripts/policies/competent-latescape-b.js) gains one
instrumentation field, `arrived`, set after the real travelTo call
(true iff post-travel position equals the hop destination; vetoed
hops record false); no behavior change — the worker's diff is
confined to the `arrived` lines and diagnostic trajectories match
the predecessor's row exactly. The analyzer
(scripts/analyze-falseclose-b.js) reports old vs new proxy side by
side and classifies every dropped old entry. Results on the
pre-registered bars (all PASS): diagnostic 61802 OLD 3 -> NEW 0
with forages byte-identical; fresh band 62201–62208 OLD 24 -> NEW
0, all 24 dropped for no-arrival-evidence (all on 62205,
(4,4)->(6,4), days 23–30, three engine-refused attempts a day the
scholar never arrived at); fixture + fake-game positive control
counted by the new proxy; proof 15/15 before and after the judged
runs. Verdict, exactly as preregistered: GO — for quoting the
proxy only. It lands no guard, flips no default, changes no game
behavior. The old exact-hop count must no longer be quoted as
false closes; the arrival-conditioned count may.

Balanced panel (§15, context never verdict): both-policy campaign
(competent + competent-latescape-b, 8 seeds, 30d), 16 cases, 0
reused, sourcesStable, neutrality matched on both policies;
per-seed outcomes identical both legs (survived 8/8, won /
national / table 0, wave reach 1:2 / 2:5 / 3:1, maxArc 3).
Single-policy base-vs-lever compare returns INVALID by design
(matched-policy rule), attached as-is — the same refusal class
as the predecessor runs, not a verdict. Judged from driver
tables, per the prereg.

## Arm 2 — sim-homewardstep-b: HELD (pilot UNDER-POWERED + B5 FAIL)

NOT merged. Branch sim-homewardstep-b kept at 4de106b7c, worktree
kept with a fresh heartbeat for re-port. Coordinator re-ran the
worker's proof on the held tip: 48/48 PASS, tree still clean
(cited here so the held branch's proof state is on the record,
not as a landing gate).

What the worker built (policy-side only, zero src/js): a port of
the latescape escape model E(D) with the one change that the
"never veto a return" passthrough is REMOVED — every guarded hop,
outward or homeward, is evaluated with the same E(D) and vetoed
only if E(D) fails; a hop into haven itself always passes. On a
vetoed homeward step the scholar stays where it stands (no
same-day re-pick, no injected lateral pick, no trip abort);
the next day's competent daily re-picks normally.

Judged pilot (band 62001–62008, 30d, competent vs
competent-homewardstep-b, identical seeds, DEPOSITGATE=0):
PRIMARY prevented homeward-hop pocket entries NOT JUDGEABLE —
the band carries 1 baseline homeward episode (bar needs >= 2)
and the homeward extension fired 0 vetoes on it (31 vetoes
band-wide, all inherited outward vetoes). B1 away day-ends
11 -> 5 PASS; B2 new-or-worsened none PASS; B4 failed-trip
share 0.531 = 0.531 PASS (exact tie); B5 mean daily haul
166.8 -> 147.1 (0.88x < 0.95x) FAIL, driven entirely by 62003,
where the inherited outward guard diverts the scholar away
from the rich (0,2) patch (away 11 -> 5, home day 25, but an
almost empty bag); B6 median survival 30d = 30d PASS;
veto-created pockets 0 PASS. Screening (disclosed): 3 fresh
bands yielded 1 homeward episode total (24 seeds) — homeward
pockets are rarer than outward pockets on this substrate.
Unjudged diagnostic 61807 (mechanism demonstration only):
2 homeward vetoes, pocket episode 1 -> 0, scholar home day 5.
Per §14 the B5 miss is not re-scored and no re-confirm was
run to chase a cleaner result. The worker's instruction
stands: re-port on a qualifying band, or pair with the
stepwalk re-confirm question — NOT both in one run.

Sense note carried from the worker: the 62003 baseline
"pocket" fails day-end E only days 20–22, passes via lateral
from day 23, and the scholar is fed throughout — a
comfortable camp, not a stranding. And the 62001 false-close
alarm that motivated this run's sibling arm was trace-proven
a proxy artifact (19 firings for a hop the scholar never
arrived at) — which is why the falseclose instrument landed
first: the next guard prereg quotes arrival-conditioned
numbers, not attempts.

## Wall numbers (in-window only, never pooled across arms)

Both arms' judged corpora are 30d pre-seat windows: national /
table / wins 0 on both legs of both arms (expected measurement
profile, not a regression); median survival 30d both legs both
arms; wave reach (panel) homewardstep 2 on 6–7/8, wave 1 on
62005/62006 both legs, wave 3 on armed 62003 only; falseclose
1:2 / 2:5 / 3:1 identical both legs. Full seat 0 / wave 5
fought 0 stand as last measured (Loop A lane) — UNCHANGED in
kind by this instrument + held-pilot run.

## Village assessment (plain words)

Nothing about the village changed this run — one arm fixed a
measuring stick, the other is still waiting for its trap. The
measuring stick was lying in a specific, now understandable
way: when a scholar keeps trying a path the ground itself
won't let them take, three tries a day for days on end, the
old count wrote down "the guard wrongly stopped them" once
per try, even though the scholar never once stood where the
guard stopped them going. The new count only writes it down
when the scholar actually arrived there and the day still
ended at home — when the guard really did cost them a trip
that would have worked. On the bands measured here that
stricter count is zero: on these seeds the guard never
wrongly closed a real trip. On the one seed where trouble
actually showed up, the village spent eleven days camped at
the far western edge — not starving, just settled on a rich
patch it could walk to but for three days couldn't walk home
from, and then never bothered to leave. The guard, given its
new homeward eyes, never once had to use them on fresh
ground: no scholar stepped toward home into a trap there.
What the old outward guard did instead was steer that
scholar away from the patch entirely — home five days
sooner, but with an almost empty bag, because the patch it
was kept from was where the food was.

## Telemetry deviation check (§15 step 10)

`node scripts/telemetry-check.js --baseline
hidden_files/telemetry-baselines/scale-wall.json --current
'evidence/2026-11-02/sim-falseclose-b-band-*.jsonl' --metrics
national,table,wins,exiled` (with and without --sweep-rows)
returns one LOUD line: the script cannot parse the driver
jsonl (whole-file JSON parse against one-object-per-line
rows: "Unexpected non-whitespace character after JSON at
position 418798"). Investigated in-run: the files are valid
one-object-per-line driver rows (8 lines each, seed field
present); the refusal is a corpus-shape mismatch in the
checker, the same refusal class as the panel-compare
matched-policy refusals — NOT a metric deviation. No LOUD
metric line, no baseline roll. The homewardstep pilot glob
matches nothing in the main tree because that arm is held,
not merged; no telemetry claim is made for it. Baseline NOT
rolled.

## Metric review (for the NEXT run, never a re-score)

Carried from the workers, unchanged:
- Homewardstep: episode definition over-weights transient
  E-fails (a fed, lateral-passing camp counts as a pocket);
  the conservative prevented rule scores diversion-to-home
  as 0 prevented — a future prereg needs a stated secondary
  (e.g. away-day reduction) decided up front; B5's pooled
  haul bar is hostage to one rich-patch seed — a per-seed
  haul guard alongside the pooled bar would separate
  systemic harm from single-patch diversion; screening
  yield is low (1 episode / 24 seeds) so the next prereg
  must budget more screening bands or a far-travel
  substrate, decided up front.
- Falseclose: legacy fallback classes (b)/(c) prove the
  scholar was ON the destination tile that day, not that
  THIS hop carried them there — a future legacy
  re-analysis that counts a fallback entry must say so;
  fallback class (d) is unreachable through the gated
  counter in practice and is kept as defense in depth;
  per-occurrence counting (3 vetoes = 3 entries) is
  retained so old/new counts stay comparable — a
  "distinct hops" definition would be a NEXT-prereg change.

## Findings appended

- sim-findings.md: the 2026-11-02 false-close-proxy [open]
  line (sim-latescape-b evidence) updated to fixed by this
  run's landed instrument (sim-falseclose-b, GO, 755b4ae41);
  one new [open] line for the homewardstep pilot
  (under-powered + B5 fail + re-port requirement).
- No other backlog item was claimed or closed this run.

## Infrastructure

- No EPERM flap this run. Rebase 3/3 clean; ff-only merge
  clean; no index clobber on the coordinator merge (main
  tree clean before and after). Worker commits had clobber
  repaired by the workers (falseclose prereg + build),
  commits verified correct.
- Master did not move under this run (a9b63b886 at start,
  755b4ae41 at closeout — this run's own landing only).
  Loop A 0915Z had not landed at closeout.
- check.js --quick NOT re-run by the coordinator: zero
  src/js in the landed arm; the worker's run (284 passed,
  6 failed in 557s, all 6 proven pre-existing on this base
  lineage by the arm-file-removal method) stands, and the
  arm proof re-ran green twice (rebased tip, merged master).

## Next blanks (food-economy, in order)

0741Z blank 4 (false-close proxy arrival condition) is FILLED
by this run and leaves the list. The rest carry forward:
(1) homewardstep re-port on a qualifying band (own prereg;
  budget more screening bands or a far-travel substrate;
  decide pooled-vs-fresh-band and per-seed haul guard up
  front; NOT paired with (2) in one run); (2) stepwalk
  re-confirm under a NEXT prereg deciding up front between
  a pooled failed-trip tolerance and a fresh band under the
  same hard bar; (3) fed-at-home "wild" death cause
  instrument (61901); (4) 60501-shape roadwork-credit band
  (still owed); (5) guard + return-capability pairing OR
  veto-budget expedition abort, decided up front; (6)
  sensor non-pantry collapse signal; (7) gatediseng confirm
  band 76701-76712; (8) pantry-cap-as-garden-bottleneck
  (74007); (9) standing-load remainder; (10) pack-full
  refusal narration; (11) HUNGER WINTER relief passivity
  (steve-call candidate); (12) shelling default-flip call;
  (13) P3 reset follow-ups; (14) patrol-departure narration;
  (15) garden/fish/traps early path; (16) creek clearance
  wood-bound; (17) rubble daytime-clearing habit; (18)
  washed_out scramble narration; (19) 96-tick bridge edge;
  (20) 120d window only on a new horizon-cut episode.

food-economy stays converging (NOT converged): the false-close
measuring stick is fixed and quotable, but the homeward guard
itself is unproven on judged seeds, no gate change landed, no
default flipped. scale-onramp untouched (sibling Loop A lane).
Claim deleted; lock deleted.

Merged locally, pending ship (falseclose instrument landed;
homewardstep held on its branch).
