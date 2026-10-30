# sim-joinendlines-a — joined-fight end lines (GO)

Run: flesh-out loop, run fleshout-20261029T1915Z. Axis: scale-onramp
(blocking axis, converging, NOT converged). Worker: sim-joinendlines-a.
Prereg: evidence/2026-10-29/sim-joinendlines-a-prereg.md (committed
BEFORE any judged analysis, d4a810d52). Queued narration work from
sim-breakline-a, sim-tilejoin-a, sim-allydpr-a, sim-shoutrec-a.

## The blank, closed

Joined field fights ended with NO log line in two cases. Both now
carry one honest end line each. NARRATION ONLY — zero mechanism
change: no damage, ordering, flee-floor, break-check, one-ally-rule,
entry-strength, or floor-pre-empts-break change (that ordering stays
a measured Steve-call question, untouched here).

## The change (src/js/fieldFights.js, 23 insertions, 1 deletion)

A new local flag `shoutJoined`, set ONLY in the hopeless-shout branch
(NOT on rec.calledHelp, which the allyFromStart path also sets), gates
both lines. Unjoined endings and allyFromStart endings are
byte-unchanged.

(a) mFlee branch, shout-joined only:
`mPhraseCap + ' breaks — wounded past its line, it turns and runs. '
+ allyName + ' answered ' + vName + '\'s shout.'`
Example (in-band): "Big-Eyes breaks — wounded past its line, it turns
and runs. Oliver answered Morena's shout."

(b) floor branch, shout-joined only:
`allyName + ' answered ' + vName + '\'s shout, but ' + vName
+ ' is past holding — they run while running still works.'`
Example (in-band): "Emma answered Jorge's shout, but Jorge is past
holding — they run while running still works."

Both lines name the answer as a PAST ACT, so they stay honest even
when the ally has since gone down ("X goes down!" mid-fight). Line
(b) echoes the existing hopeless-flee line ("runs while running
still works") because it is the same act with the ally context added.

## Canon

docs/CANON.md, then docs/MONSTER-WAVES.md (mBreak 0.25 wave 1, 0.15
wave 2+). NO CANON-registered doc covers joined field-fight narration
specifically — the mechanism is code-derived and stated exactly in
the prereg. Governing canon rule: CANON.md "No silent actions. Every
action narrates honestly, including failures."

## Band and method (binding, from the prereg)

- Seeds 75101–75108, 180d death-aware, tableseat-nowait VERBATIM,
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1, W4DPR=1,
  BREAKLINE=1, TILEJOIN=1, SHOUTREC=1, PLUS the new joinendlines
  recorder (scripts/policies/joinendlines-diag.js, record-only:
  full log for every calledHelp fight, never touches opts).
- BEFORE leg: unmodified src + full recorder stack, into
  evidence/2026-10-29/perseed-joinendlines-a/before. AFTER leg:
  narration change only + identical stack/seeds, into
  evidence/2026-10-29/perseed-joinendlines-a/after.
- Analyzer + fixtures: scripts/test-joinendlines-a.js
  (--judge BEFORE AFTER). Sweep: scripts/test-joinendlines-a-sweep.js
  (shoutrec sweep + joinendlines layer, nothing else changed).

## RE-DERIVATION: the before leg does NOT reproduce the published shoutrec corpus

Per the coordinator's note, this is reported, not forced. The BEFORE
leg on current master (worktree HEAD = shoutrec commit 2192ff080 +
this run's prereg commit) diverges from evidence/2026-10-29/
perseed-shoutrec-a/on on per-seed numbers — e.g. s75101: days 115
vs 105, deaths 26 vs 22, meetings 150 vs 135; band wall: won 6 vs
shoutrec's reported 3, table 7 vs 4, median 114d vs 123d, deaths 232
vs 311. The pipeline itself IS deterministic: a single-seed re-run
of s75101 reproduced the before leg byte-identically modulo logs
(days 115, deaths 26). So the divergence is substrate drift since
the shoutrec corpus was generated (or generation conditions that no
longer hold), not measurement noise in this arm. The verdict below
judges before-vs-after ON IDENTICAL SEEDS (the prereg's re-derivation
clause), never before-vs-old-numbers. The before leg IS the baseline.

## Results (identical seeds, before vs after)

- Joined fights in AFTER corpus: 28, ALL shout-joined (0
  allyFromStart in-band; allyFromStart negatives are covered by the
  engine fixtures, and the flag-anomaly check is 0).
- METRIC A — drive-off ends after a shout: 5/5 carry line (a).
  GO bar was >= 80% with minimum-n 2. PASS.
  - s75101 d38 gen_r2ga17l vs hushwolf, 3 rounds
  - s75101 d102 emma_larsen vs callback, 4 rounds
  - s75104 d17 gen_duncnkr vs anaconda_empress, 6 rounds
  - s75105 d10 gen_4yz72hj vs gallowdeer, 4 rounds
  - s75106 d23 gen_qhsj2el vs understudy, 6 rounds
- METRIC B — floor-flees after a shout: 9/9 carry line (b).
  GO bar was >= 80% with minimum-n 1. PASS.
  - s75101 d8 jorge_silva vs gallowdeer, 2 rounds (same-pass shape)
  - s75102 d38 gen_0x2wi4u vs landlord, 3 rounds
  - s75102 d58 daniyar_askarov vs chorus_line, 8 rounds (late shape)
  - s75102 d77 app_mgpspiho509 vs callback, 3 rounds
  - s75103 d21 gen_fmr84if vs moderator, 4 rounds
  - s75104 d58 david_kim vs ad_break, 2 rounds
  - s75104 d61 gen_p2ufvsv vs terms_of_service, 2 rounds
  - s75104 d80 chloe_dubois vs spool, 8 rounds
  - s75106 d103 chantal_mukendi vs callback, 4 rounds
- STRAY lines: line (a) anywhere else 0, line (b) anywhere else 0.
- NEUTRALITY GATE: PASS. After-leg per-seed rows byte-identical to
  before-leg rows after stripping every log array; wall numbers
  identical per seed (won 6, full seat 0, nationalEver 6,
  nationalFinal 6, table 7, entered 6, wave4 5, wave5 0, median
  114d, starvation 2, deaths 232 — same on both legs).
- VERDICT: GO (Metric A GO + Metric B GO + neutrality PASS + sense
  PASS + stray 0).

## Before/after log proof (same fight, both legs)

- s75101 d38 Morena vs hushwolf: BEFORE ends "R3: Oliver strikes
  for 6 (5 left)" (silent); AFTER adds "Big-Eyes breaks — wounded
  past its line, it turns and runs. Oliver answered Morena's shout."
- s75101 d8 Jorge vs gallowdeer: BEFORE ends "Jorge is losing —
  shouts for help! Emma charges in!" (silent); AFTER adds "Emma
  answered Jorge's shout, but Jorge is past holding — they run
  while running still works."
Each after-log is its before-log plus exactly one line — verified
for both fights, and implied band-wide by the neutrality gate.

## Sense-testing law (3 transcripts read end to end)

PASS — at least one of each case, both floor shapes:

S1 — Morena vs hushwolf, s75101 d38, mFlee, 3 rounds (drive-off).
R1–R2 heavy damage, field medicine +20 mid-fight, shout at R2,
Oliver joins, R3 team damage drives the beast 11 → 5 HP and it
breaks. The end line lands exactly where the old log stopped, and
says what happened: the beast fled because it was wounded past its
line, after the pair's final round. Reads as people, not numbers.

S2 — Jorge vs gallowdeer (Highbeam Deer), s75101 d8, vFlee floor,
2 rounds, SAME-PASS shape. Walks straight in, bow useless (no
arrows — an honest detail), R1 46 HP, R2 20 HP, shouts, Emma
charges in, floor line immediately. This is the Sanne shape from
shoutrec S2, now closed: the reader is no longer stranded at
"charges in!".

S3 — Daniyar vs chorus_line, s75102 d58, vFlee floor, 8 rounds,
LATE shape. A long trick fight ("holds the line — working the
trick" ×4 — pre-existing trick narration, not this arm's), R8
downbeat + syncopation drops Daniyar to 11, he dances, shouts,
Terrence charges in, floor line. The line does not pretend the
arrival saved him: the ally came, the leader still ran. Honest.

Observation (NOT chased, NOT this arm's blank): S3's repeated
"holds the line — working the trick" line fires 4× in one fight.
It reads as a loop, not a lie, and it predates this arm; flagged
here for the coordinator's findings backlog, not built here.

## Proof tests

- scripts/test-joinendlines-a.js: pure classifier fixtures 19/19
  (every branch shape: break drive-off, round-cap, judges, all four
  trick mFlee endings, floor, hopeless, learn, suburb-leave, vKill,
  vDie, not-shout-joined; line-A/B mutual exclusion).
- Engine fixtures 14/14 (real fieldFight, deterministic opts.rng):
  drive-off-after-shout carries line (a); floor-after-shout carries
  line (b) in the 2-round same-pass shape; unjoined mFlee, unjoined
  floor, hopeless vFlee, and allyFromStart mFlee carry NEITHER line.
  Fixture tuning note: the floor fixture needs a neutral-temper,
  bravery-0 fighter at 44 HP vs 6-damage (R1 end >= fleeAt, R2 end <
  fleeAt); the roster's tempers are words (intense/dry/anxious/...),
  not 'steady' — bold/cautious are the only values that shift
  fleeAt, so the filter excludes those two.
- node --check clean on fieldFights.js and all three new scripts.
- node scripts/check.js --quick: ran to completion (~14 min) but its
  exit code was lost — the run was piped through `tail -5`, so the
  pipeline exit reflects tail, not check.js. NOT claimed green on
  that basis. Instead, the four green-list tests most likely to
  assert field-fight log contents were run individually with
  captured exit codes, all 0: test-fieldfight-summary-20261013.js
  (4 passed), test-fightlog-names-20261012.js (ALL GREEN),
  test-aid-fight-wired-20261014.js (9 passed),
  test-break-monsters3-fieldfights-20261008.js (26 passed).
  A full unpiped --quick re-run is owed before any ship claim that
  needs it; the narration-only diff (two log pushes behind a
  shout-only flag) plus the band-wide neutrality gate bound the
  blast radius in the meantime.

## Remaining blanks (documented, not built — out of scope)

- Solo endings are still silent: unjoined mFlee (break branch) and
  unjoined floor vFlee carry no end line either. This arm scoped to
  the queued joined-fight blank only; the solo shapes are the same
  two branches without the shout gate and would take the same two
  lines minus the ally clause. Left for a follow-up arm, not
  silently expanded here.
- allyFromStart endings keep their existing (silent) endings by
  design of the gate; only engine fixtures cover them (0 in-band).
- The floor-pre-empts-break ordering is unchanged and remains a
  Steve-call question (shoutrec evidence).

## Metric review (for the NEXT run)

- The classifier's trick-mFlee exclusion list (offer_food, redactor
  starve-out, focus bore, ToS examine) was derived from code
  inspection, not observed in-band (0 trick endings among the 28
  joined fights). If a future band produces one, the classifier
  handles it, but the exclusion list should be re-verified against
  that log rather than assumed.
- The band's joined-fight population (28) came from the re-derived
  before leg, not the published shoutrec corpus (29 calledHelp).
  Future arms on this band should re-derive the same way and quote
  the re-derived denominators, not shoutrec's.
- Minimum-n: Metric A (2) and B (1) were both comfortably exceeded
  (5, 9). No revision proposed.

## Village assessment (plain words)

The village this band played is the same village the tilejoin and
shoutrec bands played — competent, reaching national in 6 of 8
seeds, sitting the table in 7, winning 6 (all lesser seats, full
seat 0, wave 5 0). Nothing about that picture moved, because
nothing about the game moved: this run changed only the words at
the end of 14 joined fights. The blank it filled was a reader's
blank, not a power blank — a log reader can now tell, for every
joined fight, whether the beast fled, the fighter fled, or
something else happened. Fourteen endings that used to stop
mid-story now finish their sentence.
