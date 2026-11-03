# sim-pocketpersist-b — MECHANISM-NAMED M6 SUCCESSION: the pocket never opened — the stranded scholar died day 11 and a successor started at home

Run: oversight-flesh-out-loop-b, run fleshout-loop-b-20261103T0535Z
(stale-lock recovery of dead run fleshout-loop-b-20261103T0330Z),
arm sim-pocketpersist-b, axis food-economy. Worktree
sim-pocketpersist-b, branch sim-pocketpersist-b. Base at prereg
writing: 29d3366adfb8f9585d5dd7025e0e3caac995e1e5.
MEASUREMENT ONLY: zero src/js changes, zero policy-default flips, zero
edits to any existing script or policy file. New files only, all named
*-pocketpersist-b.*. This worker does NOT push, bump, verify live,
merge, or rebase — the coordinator lands the branch. This diag does
NOT deploy anything.

Status to coordinator: JUDGED, COMMIT OF EVIDENCE PENDING (container
git-write EPERM flap, see end of file). Prereg + tools committed
(e15851ee4, proof 24/24 after the two pre-commit tool fixes below, no
judged leg before that commit); judged legs run after the commit;
evidence + corpora WRITTEN and intact in the worktree, uncommitted
because every git write currently fails with EPERM (safe-commit.sh
failed on its private-index lock write; git hash-object -w fails in
both this worktree and the main tree; plain file writes succeed).
DO NOT merge expecting the evidence commit — re-run the recovery
safe-commit command in the COMMIT PENDING note at the end of this
file once git writes recover, verify with `git show --stat HEAD`,
and only then merge. The dead run's worker wrote the prereg, driver,
analyzer, and proof test but never committed or ran a judged leg (its
proof failed 22/24 and the container git-write EPERM flap blocked its
commit); this run fixed the two tool bugs, re-proved, and ran the
judged legs. Nothing from the dead run's worker was re-judged: the
prereg text is unchanged since 04:55Z, and no judged output existed
before this run's commit.

## Tool fixes BEFORE the prereg commit (no judged leg run before either)

Two bugs, both caught by the dead run's own proof test (22/24). Both
fixes are to uncommitted new files only; the prereg's gates, bars, and
M1-M6 mapping are untouched, and the fix rationale is the prereg's own
standard ("exactly the homewardac shadow leg").

1. UPKEEP PARITY (the live-leg failure). The probe driver built a bare
   `{daily}` policy, but runDays calls `policy.setup` and
   `policy.upkeep` (3x per loop-day, before daily) in addition to
   `policy.daily`. competent.upkeep runs the morning routine
   (food/water/gear) that sets day-start kcal — so the probe leg was
   never the homewardac shadow leg: on throwaway seed 69599, day-1
   start kcal already differed (2200 probe vs 2190 control), day-3
   start differed by 624, and day 7 the probe scholar was home healthy
   while the control scholar lay stranded at 0 kcal. The prereg's
   daily list ("pure competent.daily on all other days") described
   the daily calls but forgot the runDays upkeep hook. Fix: the probe
   policy is now the full constructShadow policy with ONLY daily
   replaced (probes + day-5 construct branch), so the probe leg IS
   the control leg plus read-only probes. After the fix, the 69599
   live validation leg matches the control leg exactly on days 1-12
   (the proof's live-69599-probe-identity-g2 check passes).
2. FIXTURE BUG (the g2-pass failure). gateG2 requires days 1-12 in
   both legs, but both proof fixtures omitted days 2, 3, 4, so the
   "pass" fixture failed on missing-day, not on divergence. Fix: days
   2-4 added to both fixtures with identical values bridging day-1
   end 1400 to day-5 start 1059. Test-only fix; no gate changed.

Proof after fixes: 24/24 (node scripts/test-pocketpersist-b.js), then
prereg + tools committed (e15851ee4) before any judged leg.

## Verdict: MECHANISM-NAMED — M6 SUCCESSION

Prereg: evidence/2026-11-02/sim-pocketpersist-b-prereg.md, committed
BEFORE any judged leg (e15851ee4). Judged legs, both after the commit:
fresh homeconstruct shadow leg (POLICY=construct-shadow, shape A,
seed 69501, 30d, substrate env) as control, and probe leg (same seed,
same substrate, same construction) as probe. Analyzer:
scripts/analyze-pocketpersist-b.js --probe <probe-jsonl> --control
<control-jsonl> --seed 69501 (full output in
sim-pocketpersist-b-analyze.txt).

| gate | result |
|---|---|
| G1 control gate (homewardac reported shape) | PASS — all clauses (detail below) |
| G2 probe identity (days 1-12 start/end pos+kcal) | PASS — 12/12 days exact |
| M6 signature | HOLDS IN FULL (detail below) |
| M1-M5 signatures | EXCLUDED on the recorded fields |

M6 holds, clause by clause: scholar identity changes between day-11
end and day-12 start (gen_q3vdldd -> gen_7yvzi60); a player:true
death record falls on day 11 (gen_q3vdldd, cause "the wild"); day-12
start pos is haven (4,4); and probe E from (7,1) NEVER passes at any
probe through day-11 end (ePassFromPocket(7,1) empty, firstLateralE
null, E ok=false at every days 5-11 probe, reason lateral-cap
throughout). M1-M5 are excluded by the identity change they forbid
(they all require the same person still at (7,1)): no E pass from the
pocket at any day-12 probe (day-12 start is already a new person at
home); revealedCount is flat at 42 from day-5 end through day-12
start (no M2 flip in the pocket interval); no lateral E pass ever
(M3); no swimmer flip and no bridge/crossing item gained before any
walk (M4 — the day-12-start Multitool belongs to the successor's
fresh inventory, and the old person's items vanish with them); no
real travel steps from (7,1) on day 12 (M5 — day 12 starts at home).

CORRECTION to the homewardac reading (as the prereg required if M6
held): the pocket did NOT open. The homewardac line "day 12 it walks
home (kcal 2085)" misread the day-12 person: the 2085-kcal person at
home on day 12 is Niamh Ruiz (gen_7yvzi60), the successor — not
Francisco Jordan (gen_q3vdldd), the stranded scholar, who died on
day 11 after five days at 0 kcal. A pocket story can end by
succession, with the pocket itself never opening. The homewardac
verdicts (A SUBSTRATE-FAIL, C NO-GO) are NOT re-judged here, per the
prereg; only the day-12 reading is corrected.

## Q — THE POCKET, DAY BY DAY (seed 69501, probe leg, days 5-12)

Day-5 start the scholar stands at haven (4,4), kcal 1059, E ok=true
(at home, nothing to escape). The forced walk-out runs the shape-A
route 5,4 -> 6,4 -> 7,4 -> 7,3 -> 7,2 -> 7,1 through the engine's own
travelTo, all six steps ok, ending at (7,1), kcal 989. From that
evening on, E fails every probe: reason lateral-cap, dayEndReturnSim
ok=false, every night.

| day | start (pos, id, kcal, hp) | end (pos, kcal, hp) | E from pocket | dayEndOk |
|---|---|---|---|---|
| 5 | (4,4) gen_q3vdldd 1059, 100 | (7,1) 989, 100 | end: false (lateral-cap) | false |
| 6 | (7,1) gen_q3vdldd 287, 100 | (7,1) 207, 100 | false | false |
| 7 | (7,1) gen_q3vdldd 0, 44.9 | (7,1) 0, 44.9 | false | false |
| 8 | (7,1) gen_q3vdldd 0, 39 | (7,1) 0, 39 | false | false |
| 9 | (7,1) gen_q3vdldd 0, 33 | (7,1) 0, 33 | false | false |
| 10 | (7,1) gen_q3vdldd 0, 25 | (7,1) 0, 25 | false | false |
| 11 | (7,1) gen_q3vdldd 0, 0 | (7,1) 0, 0 | false | false |
| 12 | (4,4) gen_7yvzi60 2355, 100 | (4,4) 2085, 100 | true (at home) | true |

The decline reads as slow starvation, not a single event: kcal 989
(day-5 end) -> 287 -> 207 -> 0 by day 7, then hp bleeding 44.9 ->
39 -> 33 -> 25 -> 0 across days 7-11 while the scholar keeps
foraging at the pocket (1-3 forages a day, unknown shoots/nuts/
berries, never identified, never food). The village's work goes on
around the pocket the whole week (travel, creek visits, stone-piling,
water-hauling in the say stream), exactly as homewardac reported.
Nothing in the ground changes under the scholar: the (6,1) washed-out
blocker persists at every probe, the revealed set is flat, and the
lateral candidates never offer a passing route. What ends the story
is not an opening but a death: day-11 player:true death,
gen_q3vdldd, "the wild" — and the next morning a new person wakes
at home with full health and a fresh pack.

G1 detail (control leg, all clauses pass): day-5 start (4,4);
walk-out completes to (7,1); day-5 end (7,1) + dayEnd ok false; days
6-11 end (7,1) + ok false each; day-12 end (4,4). G2 detail: probe
vs control match exactly on all 12 days' start/end pos+kcal (day-1
start 2190 is now identical on both legs — the upkeep fix closed
the gap the proof caught).

## Sense-testing law — quotes + judgement

Stranded days (day 7, at (7,1), 0 kcal). The pocket voice is there
in flashes:

- "Your stomach is a fist. Eat — anything real, now."
- "The pantry is in the hall. Your hands are not."
- "Nothing edible. (unknown shoots, unknown nuts — not food yet:
  identify it first — test cautiously from your pack, or sort it at
  camp.)"
- "You wait. The light changes. Nothing asks anything of you."

But much of each stranded day's stream still reads as haven life —
other villagers hauling wood, arguing by the fire, telling stories
about the scholar — with no consistent marker that the viewpoint
character is stuck a week's walk from the pantry. The stranding is
voiced, not placed: a player reading day 7 would feel hungry and
ignored, but would not reliably know WHERE they are stranded. That
is a narration gap, not a mechanism gap — the probes, not the prose,
carry this verdict.

The day-11/12 boundary (say stream tags these day 11; the probe
shows the new person at day-12 start — the say day-tag lags the
loop-day boundary by one at dawn). The succession IS marked, and
marked well — the old person's story is closed, not silently
swapped:

- "The Codex doesn't pause for grief. Niamh blinks — and it's
  already there, overlaying everything, syncing. No pen. No paper.
  The mantle just... transfers."
- "🌟 "MANTLE TRANSFER DETECTED. ...Oh! New face! Same job! Whole
  new set of tricks. We hardly noticed. (That is a lie. We noticed.
  The audience CRIED.)""
- "📖 The Codex turns a page: Francisco Jordan, 11 days. The mantle
  passes to Niamh Ruiz."
- "🪞 You wake up somebody else. Niamh Ruiz, 62 — a Dentist. Her
  hands know different work now: Iron Stomach, Green Whisper."

Judgement, in plain words: the "release" is not a person finding a
way home, and it is not an unexplained teleport either. It is a
death and a handover, told as one: Francisco starves in the pocket
over five days, the Codex turns his page, and Niamh wakes at home
with different hands and different tricks. The pocket never opened;
the story continued anyway, with someone else. That is the honest
shape of a pocket story's end — and it means "the pocket opened on
day 12" must stop being quoted as a homewardac finding.

## Village assessment (plain words)

The village itself is healthy throughout: pantry full (~51 days of
fresh on hand by day 12 in the say stream), wood pile growing (81-87
logs), stone pile growing, water runs steady, knowledge deepening
(Greenbrier Shoots, Assacu learned by handling). The tragedy is
narrow, not systemic: one person walked six tiles from home on an
empty stomach (1059 kcal at walk-out, 989 on arrival) and could not
get back, while the village ate communal meals a few tiles away.
The pocket is a knowledge trap, not a food trap — the scholar
foraged unknown plants daily but never identified them, so nothing
found at (7,1) ever became dinner. The village did not rescue him:
no say line shows anyone walking to (7,1), and the guard's E model
says no route existed for the scholar himself. Whether anyone
noticed he was missing is unmeasured — the fires kept telling
stories about him while he starved, which is its own bleak detail.

## Wall numbers (30d construction leg — window-limited, NOT wall movement)

Construction legs, not natural play: seed 69501, shape A, 30d
horizon, both legs survived the full 30d. Probe leg: maxWaveUnlocked
3, wave kills 1:20, 2:4. National / table / wins: not applicable to
a constructed trip — no wall movement is claimed. Median survival:
n/a (single leg, survived). This arm answers a mechanism question
(pocket persistence), not the scale wall.

## Balanced panel (§15)

INAPPLICABLE as verdict, per the prereg (same constructed-trip
reasoning as cband): the panel expresses guard policies on natural
campaigns; this run's before/after IS the fresh shadow leg vs the
probe leg on one identical seed (Gate G2), and the mechanism
question is answered from one constructed trip's trace, not a
campaign compare. No compare file is fabricated.

## Metric review (for the NEXT run)

1. The prereg's substrate prose ("pure competent.daily on all other
   days") under-described the leg: runDays' upkeep hook is part of
   any policy leg, and a driver that builds a bare {daily} policy
   silently runs a different game. Next driver prereg should name
   the FULL policy object (setup + upkeep + daily), not just the
   daily calls — this run's fix is the template.
2. The proof test's live validation leg (throwaway seed) earned its
   keep twice over: it caught both the upkeep gap and, by failing
   loudly, stopped a judged leg on a broken instrument. Keep the
   live-leg proof pattern for future probe drivers.
3. Say-line day tags lag the loop-day boundary at dawn (succession
   lines tagged day 11 describe the day-12 start state). Future
   sense reads should anchor on probe ids/positions, not say tags,
   at day boundaries.
4. Open sense gap (not a verdict-changer): stranded-day narration
   does not consistently place the viewpoint character at the
   pocket. A future narration arm could tag pocket days, but this
   diag does not need it.

## Files

- Prereg: evidence/2026-11-02/sim-pocketpersist-b-prereg.md
  (commit e15851ee4, before any judged leg)
- Proof test: scripts/test-pocketpersist-b.js (24/24 after fixes;
  commit e15851ee4)
- Probe driver: scripts/pocketpersist-b-driver.js (commit e15851ee4)
- Analyzer: scripts/analyze-pocketpersist-b.js (commit e15851ee4)
- Evidence: evidence/2026-11-02/sim-pocketpersist-b.md (this file)
- Corpora: evidence/2026-11-02/sim-pocketpersist-b-control.jsonl
  (fresh homeconstruct shadow leg, seed 69501),
  evidence/2026-11-02/sim-pocketpersist-b-probe.jsonl (probe leg,
  same seed), evidence/2026-11-02/sim-pocketpersist-b-analyze.txt
  (analyzer output: G1 PASS, G2 PASS, trace, candidates),
  evidence/2026-11-02/sim-pocketpersist-b-control.log,
  evidence/2026-11-02/sim-pocketpersist-b-probe.log (driver stderr)
- Reused verbatim, never edited: scripts/homeconstruct-b-driver.js,
  scripts/policies/competent-homewardconstruct-b.js,
  scripts/policies/competent-homewardstep-b.js,
  scripts/policies/competent.js, scripts/creekhop-b-recorder.js
  (method only), scripts/analyze-homeconstruct-b.js,
  scripts/analyze-homeward-shapes-b.js. Zero src/js changes, zero
  edits to any existing script or policy file, zero policy-default
  flips.
- Consumed by this run (no longer fresh as a constructed trip):
  seed 69501 shape-A shadow leg (the judged pair; a future pocket
  arm must use a different seed or state its reuse).

## COMMIT PENDING note (coordinator, once git writes recover)

At ~05:57Z the container git-write EPERM flap returned (it had passed
at ~05:37Z long enough for the sensorconfirm2 corpus commit and the
pocketpersist prereg+tools commit, then closed again): safe-commit.sh
fails writing its private-index lock, `git hash-object -w` fails in
every repo tested, and the registry heartbeat write fails the same
way, while plain file writes succeed. No hand-rolled object surgery
was attempted. The six files below are written and intact in the
worktree, uncommitted; the judged numbers in this file do not depend
on the commit (they come from the analyzer output cross-checked
against the probe/control jsonls above).
RECOVERY (coordinator, verify first with
`git hash-object -w <any small file>` succeeding, and re-run the
proof test to 24/24 — its live leg needs /tmp writes):
bash scripts/safe-commit.sh "sim-pocketpersist-b evidence: MECHANISM-NAMED M6 succession (pocket never opened; homewardac day-12 reading corrected)" -- evidence/2026-11-02/sim-pocketpersist-b.md evidence/2026-11-02/sim-pocketpersist-b-control.jsonl evidence/2026-11-02/sim-pocketpersist-b-probe.jsonl evidence/2026-11-02/sim-pocketpersist-b-analyze.txt evidence/2026-11-02/sim-pocketpersist-b-control.log evidence/2026-11-02/sim-pocketpersist-b-probe.log
then verify `git show --stat HEAD` lists all six files and the
tracked status is clean (repair the known safe-commit index clobber
via HEAD-blob cacheinfo if it strikes again), rebase onto the then
current master tip, re-run the proof test, and merge --ff-only.
