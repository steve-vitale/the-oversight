# sim-soloendlines-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261030T0215Z (coordinator-assigned
worker sim-soloendlines-a). Axis: scale-onramp (blocking axis,
converging, NOT converged). Backlog #1458, follow-up to
sim-joinendlines-a (evidence/2026-10-29/sim-joinendlines-a.md,
prereg evidence/2026-10-29/sim-joinendlines-a-prereg.md).

## The blank (from prior evidence, not re-judged here)

sim-joinendlines-a closed the silent endings for SHOUT-JOINED fights:
(a) the mFlee break branch and (b) the flee-floor vFlee branch now
carry honest end lines when a shout fired. SOLO (unjoined) endings
in the SAME two branches are still silent: the log just stops, and a
reader cannot tell the beast fled or the villager ran. This arm adds
the same two lines MINUS the ally clause, with NO shout gate, to
solo fights only.

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; mBreak is
code-derived at src/js/fieldFights.js:618 — 0.25 wave 1, 0.15 wave 2+,
"nastier things hold longer"). NO CANON-registered doc covers field-
fight narration specifically — the mechanism below is derived from
code, stated exactly so it can be checked (src/js/fieldFights.js
fieldFight, morale block). The governing canon rule is CANON.md:
"No silent actions. Every action narrates honestly, including
failures."

Mechanism (code-derived, same morale block as joinendlines-a): at
round >= 2, in the morale pass, if (vHp/vHpMax) < fleeAt the fight
ends vFlee — case (b), the FLOOR branch — with NO log line unless
the shout-joined line fired; if members[0].hp/maxHp < mBreak the
fight ends mFlee — case (a), the BREAK branch — with NO log line
unless the shout-joined line fired. The floor-pre-empts-break
ordering is a measured Steve-call question, NOT fixed here.

## Scope (binding)

NARRATION ONLY — zero mechanism change. Do NOT change damage,
ordering, flee floors, break checks, the one-ally rule, entry
strength, or the floor-pre-empts-break ordering. The change is two
rec.log.push calls in src/js/fieldFights.js, each gated on the fight
being SOLO: NOT shout-joined AND NOT allyFromStart. Concretely the
gate is `!shoutJoined && !opts.allyFromStart` alongside the existing
shout-joined pushes, so:

- shout-joined fights keep their existing lines (a)/(b) from
  sim-joinendlines-a, byte-unchanged — the solo lines must NOT fire
  there;
- allyFromStart fights keep their existing endings, byte-unchanged —
  the solo lines must NOT fire there (an allyFromStart fight can
  never also be shout-joined: the shout branch requires
  !helpCalled, and the allyFromStart path sets helpCalled);
- solo fights gain exactly one line in each of the two branches.

Exact lines (fixed here; wording drift mid-run is a prereg
violation):

(a) mFlee break branch, solo only:
`mPhraseCap + ' breaks — wounded past its line, it turns and runs.'`
Example: "The hushwolf breaks — wounded past its line, it turns and
runs." This is the joinendlines line (a) minus the ally clause
("X answered Y's shout") and its preceding space.

(b) floor branch, solo only:
`vName + ' is past holding — they run while running still works.'`
Example: "Sanne is past holding — they run while running still
works." This is the joinendlines line (b) minus the ally clause
("X answered Y's shout, but "). It shares the "runs while running
still works" tail with the existing hopeless-flee line ("sees how
this ends — and runs while running still works") but is a distinct
line: the hopeless line carries the "sees how this ends" prefix and
fires in the hopeless branch, never in the floor branch.

## Band and substrate (binding)

- Seeds 75101–75108 (8, the tilejoin/shoutrec/joinendlines pilot
  band verbatim), 180d death-aware, scripts/policies/
  tableseat-nowait.js VERBATIM, LEANLINKRESCUE=1, TABLESEATNOWAIT=1,
  FIELDPARTY=1, W4DPR=1, BREAKLINE=1, TILEJOIN=1, SHOUTREC=1, PLUS
  the joinendlines recorder (scripts/policies/joinendlines-diag.js,
  record-only: full log for every calledHelp fight) AND the new
  soloendlines recorder (scripts/policies/soloendlines-diag.js,
  record-only, same guarantees: full log only for SOLO fights
  ending mFlee or vFlee — the only outcomes the two new lines can
  carry — never touches opts).
- BEFORE leg: current code (joinendlines lines live, no solo lines)
  + full recorder stack, into evidence/2026-10-29/
  perseed-soloendlines-a/before. AFTER leg: solo narration change
  only + identical stack/seeds, into evidence/2026-10-29/
  perseed-soloendlines-a/after.
- RE-DERIVATION CLAUSE (backlog #1457 warning, binding): do NOT
  quote published shoutrec/joinendlines band numbers as current.
  The BEFORE leg is run fresh on current master and IS the
  baseline. If it diverges from the published joinendlines corpus
  (28 calledHelp fights in-band, wall won 6 / table 7 / median
  114d / deaths 232), the divergence is reported, not forced — the
  verdict judges before-vs-after on identical seeds, never
  before-vs-old-numbers. Substrate drift is real.

## Population

ALL solo field fights in the band ending mFlee or vFlee: NOT
calledHelp (rec.calledHelp false — this excludes both the
shout-joined path and the allyFromStart path, since both set
calledHelp) AND opts.allyFromStart false (the recorder stores the
flag; any solo-corpus fight with allyFromStart true is an
instrument anomaly, reported, not counted). Caller/channel
unrestricted: the narration blank applies to any solo fight.

## Primary metrics (binding)

Classifier (scripts/test-soloendlines-a.js, log-content based,
fixed here): a solo fight ending mFlee is a BREAK DRIVE-OFF unless
its log carries the round-cap line ("Neither gives after"), the
judges line ("the judges give it"), or a trick-mFlee marker
("stuffs its cheeks, bolts.", "folds out of the fight",
"They LEAVE", "hereby DISMISSED"); a solo fight ending vFlee is a
FLOOR FLEE unless its log carries the hopeless line ("sees how
this ends"), the learn line ("has seen enough"), the round-cap
line, the judges line, or the leave line ("walk out. (Navigation
is victory.)"). (Before the fix, solo floor flees and solo break
drive-offs carry no end line at all; after the fix they carry
line (b) and line (a) respectively.)

Line matchers (fixed here; names variable):
- SOLO-A: a log line ENDING in "breaks — wounded past its line,
  it turns and runs." — the trailing period anchors it: the
  shout-joined line (a) continues past "runs." with "X answered
  Y's shout.", so it does NOT match SOLO-A.
- SOLO-B: a log line ENDING in "is past holding — they run while
  running still works." AND NOT containing "answered" — the
  shout-joined line (b) contains "answered Y's shout, but", so it
  does NOT match SOLO-B.

- METRIC A — solo drive-off ends: denominator = solo BREAK
  DRIVE-OFFS in the AFTER leg; numerator = those carrying line
  (a) verbatim. GO bar: >= 80% AND denominator >= 2
  (minimum-n 2). Below minimum-n: INSUFFICIENT-DATA, not GO.
- METRIC B — solo floor-flees: denominator = solo FLOOR FLEES in
  the AFTER leg; numerator = those carrying line (b) verbatim.
  GO bar: >= 80% AND denominator >= 1 (minimum-n 1). Below
  minimum-n: INSUFFICIENT-DATA, not GO.

## Stray-lines gate (blocks GO)

STRAY = 0, counted across BOTH corpora in the AFTER leg:
- solo line (a) or (b) on any shout-joined fight (joinendlines
  corpus: calledHelp, shoutRound non-null);
- solo line (a) or (b) on any allyFromStart fight (joinendlines
  corpus: allyFromStart true);
- solo line (a) on any solo fight NOT classified break-driveoff,
  or solo line (b) on any solo fight NOT classified floor-flee.
Any stray > 0 fails the gate (NO-GO), even if both metrics pass.

## Neutrality gate (blocks GO)

- AFTER-leg per-seed rows byte-identical to BEFORE-leg rows after
  stripping EVERY log array (soloendlines log; joinendlines log;
  shoutrec / breakline / tilejoin sense logs) from both legs. The
  only allowed difference is log content — the two new lines and
  nothing else.
- Band wall numbers identical per seed before/after (report-only
  fields, but a mismatch fails the gate): won, deaths total,
  table, entered, waveReach, nationalEver, nationalFinal, days,
  endReason.
- The recorder itself is proven record-only by this gate: it never
  touches opts, and any behavior change would break byte-identity.

## Sense bar (blocks GO)

>= 3 AFTER-leg transcripts read end to end, including at least one
solo drive-off and at least one solo floor-flee WHEN each case
occurs in-band. A case with zero in-band occurrences leaves its
count metric INSUFFICIENT-DATA, so sense cannot rescue it; the
evidence file names which case (if any) went unobserved in-band.

## Verdict rule

GO only if Metric A GO + Metric B GO + stray 0 + neutrality PASS
+ sense PASS. A count miss, a stray, or a neutrality failure is
NO-GO. Below-minimum-n on either metric is INSUFFICIENT-DATA. A
miss is NO-GO, never re-scored against a friendlier metric mid-run;
metric doubts go under "metric review" for the NEXT run. Every
evidence file carries a "metric review" section.

## Fixture tests (binding, before judging)

scripts/test-soloendlines-a.js must prove, before the band is
judged:
- line (a) fires in a synthetic solo mFlee and NOT in a
  shout-joined mFlee (which carries joined line (a) instead), an
  allyFromStart mFlee, a round-cap mFlee, or a vKill/vDie/vFlee
  ending;
- line (b) fires in a synthetic solo floor vFlee and NOT in a
  shout-joined floor vFlee (which carries joined line (b)
  instead), an allyFromStart floor vFlee, a hopeless vFlee, a
  learn vFlee, or a round-cap vFlee;
- the classifier above agrees with the fixture outcomes on every
  synthetic log;
- SOLO-A / SOLO-B matchers do NOT match the joined lines (mutual
  exclusion), and the joined matchers do NOT match the solo lines.
Node harness: eval the FULL src/js/*.js list in index.html order
(minus DOM-only app.js/sprites.js/tile-scenes.js/move-anim.js/
drama.js). Seed Math.random BEFORE eval. Never stub Game.save.
