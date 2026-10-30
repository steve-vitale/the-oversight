# sim-soloendlines-a — solo-fight end lines (NO-GO on the binding classifier; the change itself is proven on its branches)

Run: flesh-out loop, run fleshout-20261030T0215Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-soloendlines-a.
Prereg: evidence/2026-10-29/sim-soloendlines-a-prereg.md (committed
BEFORE any judged analysis, d876c2367). Follow-up to sim-joinendlines-a
(backlog #1458; evidence/2026-10-29/sim-joinendlines-a.md).

READ THIS FIRST: the verdict below is NO-GO, and it is an instrument
verdict, not a game verdict. The binding prereg classifier counts
every solo mFlee without a round-cap / judges / trick marker as a
"break drive-off" — but it misses a whole ending class the joined
corpus could never contain: the pre-round BOW drive-off ("drove X
off with the bow — it broke before it ever closed"), 507 fights,
each already carrying its own end line and each structurally unable
to reach the break branch (the bow fires before round 1; the break
branch runs inside the round loop). On the branches this arm
actually changed, the lines fire 165/165 and 12/12. The metric
review at the end proposes the one-marker classifier fix for the
NEXT run; this run does NOT re-score itself. The coordinator can
re-judge the SAME retained corpora under a corrected prereg with
no new sims.

## The blank, and what changed

Solo (unjoined) field fights ended with NO log line in the same two
branches sim-joinendlines-a closed for shout-joined fights. Both now
carry one honest end line each. NARRATION ONLY — zero mechanism
change: no damage, ordering, flee-floor, break-check, one-ally-rule,
entry-strength, or floor-pre-empts-break change.

## The change (src/js/fieldFights.js, 15 insertions, 1 deletion)

Each new push sits beside its joined line, gated on
`!shoutJoined && !opts.allyFromStart`, so shout-joined fights keep
their joined lines byte-unchanged and allyFromStart fights keep
their endings byte-unchanged:

(a) mFlee break branch, solo only:
`mPhraseCap + ' breaks — wounded past its line, it turns and runs.'`
Example (in-band): "Hushpuppy breaks — wounded past its line, it
turns and runs."

(b) floor branch, solo only:
`vName + ' is past holding — they run while running still works.'`
Example (in-band): "Fatima is past holding — they run while
running still works."

Both are the joined lines minus the ally clause, exactly as the
prereg fixed them. A comment on the `shoutJoined` declaration was
also updated (it previously said unjoined endings were
byte-unchanged by the joinendlines arm — true then, no longer
true now).

## Canon

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; mBreak is
code-derived at fieldFights.js:618 — 0.25 wave 1, 0.15 wave 2+).
NO CANON-registered doc covers field-fight narration specifically
— the mechanism is code-derived and stated exactly in the prereg.
Governing canon rule: CANON.md "No silent actions. Every action
narrates honestly, including failures."

## Band and method (binding, from the prereg)

- Seeds 75101–75108, 180d death-aware, tableseat-nowait VERBATIM,
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1, W4DPR=1,
  BREAKLINE=1, TILEJOIN=1, SHOUTREC=1, JOINENDLINES=1, PLUS the new
  soloendlines recorder (scripts/policies/soloendlines-diag.js,
  record-only: full log for every solo fight ending mFlee or vFlee
  — the only outcomes the two new lines can carry — never touches
  opts). The joinendlines recorder runs in the same rows as the
  stray corpus (every calledHelp fight).
- BEFORE leg: pre-change fieldFights.js (HEAD~1 file, restored
  temporarily, hash-verified) + full recorder stack, into
  evidence/2026-10-29/perseed-soloendlines-a/before. AFTER leg:
  narration change only + identical stack/seeds, into
  evidence/2026-10-29/perseed-soloendlines-a/after. The temporary
  before-leg file was restored with `git checkout --` afterwards
  and hash-verified against HEAD (63fdb596...).
- Analyzer + fixtures: scripts/test-soloendlines-a.js
  (--judge BEFORE AFTER). Sweep: scripts/test-soloendlines-a-sweep.js
  (shoutrec sweep + joinendlines layer + soloendlines layer,
  nothing else changed).

## RE-DERIVATION: the before leg REPRODUCES the published joinendlines corpus

Unlike joinendlines-a (whose before leg diverged from the shoutrec
corpus), this run's BEFORE leg matches the published joinendlines
numbers exactly — no substrate drift this time. Band wall: won 6,
full seat 0, nationalEver 6, nationalFinal 6, table 7, entered 6,
wave4 5, wave5 0, median 114d, starvation 2, deaths 232 — identical
to sim-joinendlines-a, per seed as well (s75101 115d/26 deaths …
s75108 31d/9 deaths). Joined corpus in the before leg: 28 fights,
the same count as joinendlines-a. The before leg IS the baseline,
and it agrees with the old numbers, so the verdict below judges
before-vs-after on identical seeds as the prereg requires.

## Results (identical seeds, before vs after)

- Solo fights in AFTER corpus: 760, ALL classifiable solo (0
  instrument anomalies: no calledHelp, no allyFromStart, no
  shoutRound in the solo corpus). Joined fights (stray corpus): 28.
- METRIC A — solo drive-offs, LITERAL prereg classifier:
  165/672 carry solo line (a) = 24.6%. GO bar was >= 80% with
  minimum-n 2. NO-GO on the literal classifier.
- METRIC B — solo floor-flees: 12/12 carry solo line (b). GO bar
  was >= 80% with minimum-n 1. PASS.
- STRAY lines: solo-corpus A elsewhere 0, solo-corpus B elsewhere
  0, joined-corpus A 0, joined-corpus B 0, TOTAL 0. PASS. The solo
  lines fire on NO shout-joined fight and NO allyFromStart fight.
- NEUTRALITY GATE: PASS. After-leg per-seed rows byte-identical
  to before-leg rows after stripping every log array; wall
  numbers identical per seed (see below).
- VERDICT: NO-GO (Metric A miss on the binding classifier +
  Metric B GO + stray 0 + neutrality PASS + sense PASS).

## Decomposition: what the 672 "drive-offs" actually are

Every mFlee assignment in fieldFights.js was enumerated (bow
pre-round; five trick types; break branch; round-cap; judges) and
every in-band solo mFlee was sorted by its own end line. Counts
are IDENTICAL in both legs (the change moved no fight between
endings — further neutrality evidence):

| ending (own line) | before | after | solo line (a) in after |
|---|---|---|---|
| BREAK branch (silent before) | 165 | 165 | 165 (100%) |
| bow drive-off ("drove X off with the bow — it broke before it ever closed") | 507 | 507 | 0 — correctly: never reaches the break branch |
| trick: terms-of-service ("hereby DISMISSED") | 4 | 4 | 0 — own line already |
| trick: food / redactor / focus / poison | 0 | 0 | — none in-band |
| round-cap / judges mFlee | 0 | 0 | — none in-band |

And solo vFlee: floor branch 12/12 carry line (b) in after
(0/12 in before — the blank, confirmed); hopeless 69 (own line);
learn 3 (own line). The true break-branch rate is 165/165 and the
true floor rate is 12/12. The 507 bow fights are the entire
Metric A shortfall: the literal denominator is 672 = 165 break
+ 507 bow (the 4 trick-tos fights ARE excluded by the prereg's
trick markers; the bow fights are not, because the bow marker
is missing).
The bow ending was invisible to the joinendlines classifier
because a bow drive-off fires before round 1, and a shout can
only fire at round >= 2 — the joined corpus could never contain
one. That is why the copied classifier passed there and fails
here. See metric review.

## Before/after log proof (same fight, both legs)

- s75108 d17 Ruby vs hushwolf (solo drive-off, 6 rounds): BEFORE
  ends "R6: Ruby strikes for 12 (3 left)" (silent); AFTER adds
  exactly one line: "Hushpuppy breaks — wounded past its line, it
  turns and runs." Log diff: +1 line, −0.
- s75106 d94 Fatima vs gallowdeer (solo floor flee, 1 round):
  BEFORE ends "R1: Fatima's eyes go red. Next 3 strikes hit twice
  as hard. (Rage)" (silent); AFTER adds exactly one line:
  "Fatima is past holding — they run while running still works."
  Log diff: +1 line, −0.

## Per-seed counts (literal prereg classifier; after leg)

| seed | days | won | wave | natEver | deaths | solo | drives | drivesWith | floors | floorsWith |
|---|---|---|---|---|---|---|---|---|---|---|
| 75101 | 115 | 1 | 4 | 1 | 26 | 113 | 106 | 25 | 1 | 1 |
| 75102 | 86 | 0 | 4 | 0 | 45 | 60 | 46 | 14 | 5 | 5 |
| 75103 | 90 | 1 | 3 | 1 | 16 | 106 | 100 | 21 | 1 | 1 |
| 75104 | 101 | 1 | 4 | 1 | 31 | 116 | 107 | 28 | 0 | 0 |
| 75105 | 165 | 1 | 4 | 1 | 59 | 97 | 92 | 21 | 0 | 0 |
| 75106 | 115 | 1 | 3 | 1 | 26 | 147 | 117 | 28 | 2 | 2 |
| 75107 | 114 | 1 | 4 | 1 | 20 | 99 | 89 | 18 | 2 | 2 |
| 75108 | 31 | 0 | 2 | 0 | 9 | 22 | 15 | 10 | 1 | 1 |
| TOTAL | med 114 | 6 | w4 5, w5 0 | 6 | 232 | 760 | 672 | 165 | 12 | 12 |

Before leg per-seed wall numbers are identical to the after leg
on every row (neutrality PASS); before-leg drivesWith and
floorsWith are 0 on every seed — the blank existed band-wide
before the change. "Drives" here includes the 507 bow fights
(see decomposition); true break-branch drives per seed are
drivesWith (25/14/21/28/21/28/18/10 = 165).

## Before/after wall numbers (identical both legs)

won 6, full seat 0, national ever 6, national final 6, table 7,
entered 6, wave 4 reached 5, wave 5 reached 0, median survival
114d, starvation deaths 2, deaths total 232. Deaths by cause
(after leg, same as before): villager combat 90, villager-vs-
villager combat 73, player:the wild 23, expedition 15, monster
11, sickness 4, ambush 3, starvation 2, arena 2, stranger 2, plus
singletons (alien, the night, a red moon rising, Big Ugly, a
wound that wouldn't close, contest, Highbeam Deer).

## Sense-testing law (3 transcripts read end to end)

PASS — one of each case, both legs compared line by line:

S1 — Ruby vs hushwolf, s75108 d17, solo drive-off, 6 rounds.
Ruby's sling is useless (no arrows — an honest detail), the pack
harasses her down to 55 HP, she binds a wound mid-fight (+20),
then drives the beast 50 → 3 HP across R5–R6 and it breaks. The
line lands exactly where the old log stopped and says what
happened: wounded past its line, it ran. Reads as people, not
numbers.

S2 — Fatima vs gallowdeer, s75106 d94, solo floor flee, 1 round.
One brutal round: Ocular Discharge for 24 drops Fatima to 33, her
Rage eyes go red — and the floor line follows immediately: she
is past holding and runs while running still works. The same
day, same pair, Fatima fought the same beast a second time and
fled via the HOPELESS branch instead ("sees how this ends") —
the two branches are genuinely different shapes, and the
classifier (and the reader) can tell them apart. Before the fix,
the floor version ended at the Rage line with no consequence.

S3 — Farid vs sanjun, s75101 d6, solo drive-off, 4 rounds.
Clean damage race (17/17/19/19), the beast 80 → 8 HP, break line
at the close. The day after, the same Farid met the same beast
and drove it off with the bow in a single pre-round line
("drove the stripes resolving out of the bamboo off with the
bow — it broke before it ever closed", rounds=0) — the contrast
case that explains the metric: bow fights end WITH a line, in
zero rounds, before the break branch can ever run.

Observation (NOT chased, NOT this arm's blank): the bow line
naming ("the stripes resolving out of the bamboo") is the
monster's descriptive phrase, same as the break line's
"Hushpuppy" — consistent voice, no action needed.

## Proof tests

- scripts/test-soloendlines-a.js: pure classifier fixtures 23/23
  (solo/joined mutual exclusion both ways; cap/judges/trick/
  hopeless/learn/leave exclusions; not-solo on calledHelp,
  allyFromStart, and shoutRound).
- Engine fixtures 24/24 (real fieldFight, deterministic opts.rng):
  solo drive-off carries solo (a) not joined (a); solo floor
  carries solo (b) not joined (b); shout-joined drive-off still
  carries joined (a) not solo (a); shout-joined floor still
  carries joined (b) not solo (b); hopeless solo vFlee carries
  neither solo line; allyFromStart mFlee and allyFromStart floor
  vFlee carry neither solo line nor joined lines.
- node --check clean on fieldFights.js and all three new scripts.
- The three green-list-adjacent tests most likely to assert
  field-fight log contents, run individually with captured exit
  codes, all 0: test-fieldfight-summary-20261013.js (4 passed),
  test-fightlog-names-20261012.js (ALL GREEN),
  test-aid-fight-wired-20261014.js (9 passed).
- Full check.js was NOT re-run: joinendlines-a already proved its
  6 failures pre-existing on the pre-change base, and this arm's
  change is two log pushes in the same two branches (no test
  touches those lines except the arm's own fixtures, green).

## Metric review (for the NEXT run — this run is not re-scored)

The prereg classifier's mflee-other marker list is incomplete
for a solo population. It was copied from joinendlines-a, where
it was sufficient because bow drive-offs cannot be shout-joined
(pre-round ending; shouts need round >= 2). For solo fights the
list must also exclude:
- the BOW marker: a log line containing "off with the bow" (the
  pre-round bow drive-off, fieldFights.js bow branch);
- the POISON marker: "VOMITS out of the fight" (trick-poison
  mFlee — 0 in-band this run, but the same omission class as the
  bow marker; the other four trick markers were already listed).
Proposed revision: a solo mFlee is a break drive-off unless its
log carries the round-cap, judges, trick (all six types), bow,
or poison marker. Under that corrected classifier, THIS run's
retained corpora judge: Metric A 165/165 GO, Metric B 12/12 GO,
stray 0, neutrality PASS — i.e. GO with no new sims required.
That re-judgment is the next run's (or the coordinator's) call
under a corrected prereg; this run's verdict stands NO-GO as
written, because a miss is NO-GO, never re-scored mid-run.

## Commits (worktree branch sim-soloendlines-a, pending coordinator merge)

- d876c2367 prereg (binding, before judged analysis) [needs-eyes]
- 500fb7d56 tooling: solo recorder + fixtures/judge + sweep
  (record-only, no game change) [needs-eyes]
- 163def510 game change: solo end lines, narration only
  [needs-eyes]
- Evidence + corpora: this file and
  evidence/2026-10-29/perseed-soloendlines-a/{before,after}/
  (committed below, same worktree branch).

Index-clobber notes (safe-commit variant, all three commits):
every safe-commit.sh commit in this run left the main index
lying (staged deletions / stale blobs for exactly the committed
files, worktree files byte-identical to HEAD). Each was repaired
the same way — hash-object vs HEAD blob verified equal, then
`git update-index --add --cacheinfo` (or plain --cacheinfo for
the stale-blob variant) — and `git status --short` verified
empty afterwards. The commits themselves were always correct;
only the main index lied. Reported here so the coordinator's
merge step re-verifies status before merging.
