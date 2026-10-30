# sim-joinendlines-a — PREREGISTRATION (binding, committed BEFORE any judged analysis)

Run: flesh-out loop, run fleshout-20261029T1915Z (coordinator-assigned
worker sim-joinendlines-a). Axis: scale-onramp (blocking axis,
converging, NOT converged). Backlog: queued narration work from
sim-breakline-a, sim-tilejoin-a, sim-allydpr-a, sim-shoutrec-a (all on
master, evidence in evidence/2026-10-29/).

## The blank (from prior evidence, not re-judged here)

Joined field fights currently end with NO log line in two cases,
confirmed twice each in transcripts:

(a) DRIVE-OFF ends after a joined fight: the monster crosses its break
line after an ally answered a shout, and the log just stops (shoutrec
sense S3: Sandile vs moderator, s75106 d26, 9 rounds — reader cannot
tell the beast fled; allydpr S5 second confirmation).
(b) FLOOR-FLEE ends after a shout: the ally's entrance is narrated
("Dale charges in!") and then the fight silently ceases to exist
(shoutrec sense S2: Sanne vs suburb, s75103 d107 — the flee floor
fires in the same morale pass, no flee line, no consequence line;
allydpr S3 second confirmation).

## Canon read first

docs/CANON.md, then docs/MONSTER-WAVES.md (wave law; mBreak 0.25 wave 1,
0.15 wave 2+). NO CANON-registered doc covers joined field-fight
narration specifically — the mechanism below is derived from code,
stated exactly so it can be checked (src/js/fieldFights.js fieldFight,
morale block). The governing canon rule is CANON.md: "No silent
actions. Every action narrates honestly, including failures."

Mechanism (code-derived): at round >= 2, on a hopeless round with help
uncalled, allies > 0, allyVids non-empty and intent not learn, the
fighter shouts and one ally charges in (rec.calledHelp, rec.allyVid).
After the shout branch, the same morale pass continues to the flee-floor
check (vHp/vHpMax < fleeAt): if it fires, the fight ends vFlee with NO
log line — case (b). In a later round, if members[0].hp/maxHp < mBreak,
the fight ends mFlee with NO log line — case (a). The floor-pre-empts-
break ordering is a measured Steve-call question, NOT fixed here.

## Scope (binding)

NARRATION ONLY — zero mechanism change. Do NOT change damage, ordering,
flee floors, break checks, the one-ally rule, entry strength, or the
floor-pre-empts-break ordering. The change is two rec.log.push calls
in src/js/fieldFights.js, each gated on a shout having fired in this
fight (new local flag set only in the shout branch — NOT rec.calledHelp,
which is also set by the allyFromStart path, whose endings are out of
scope and unchanged). Solo endings (unjoined mFlee, unjoined floor
vFlee) are out of scope and unchanged; they are noted as a remaining
blank in the evidence file, not built here.

Exact lines (fixed here; wording drift mid-run is a prereg violation):

(a) mFlee branch, shout-joined only:
`mPhraseCap + ' breaks — wounded past its line, it turns and runs. '
+ allyName + ' answered ' + vName + '\'s shout.'`
Example: "The hushwolf breaks — wounded past its line, it turns and
runs. Fatima answered Sandile's shout." Both clauses are true in every
ally state: the break is the engine's own mBreak check, and the answer
is a past act even if the ally later went down ("X goes down!").

(b) floor branch, shout-joined only:
`allyName + ' answered ' + vName + '\'s shout, but ' + vName
+ ' is past holding — they run while running still works.'`
Example: "Dale answered Sanne's shout, but Sanne is past holding —
they run while running still works." True in both shapes: same-pass
(the ally just charged in and the floor fires immediately) and later-
round (the ally answered rounds ago and the leader has since dropped
below the floor). Phrasing echoes the existing hopeless-flee line
("runs while running still works") because it is the same act with
the ally context added.

## Band and substrate (binding)

- Seeds 75101–75108 (8, the tilejoin/shoutrec pilot band verbatim),
  180d death-aware, scripts/policies/tableseat-nowait.js VERBATIM,
  LEANLINKRESCUE=1, TABLESEATNOWAIT=1, FIELDPARTY=1, W4DPR=1,
  BREAKLINE=1, TILEJOIN=1, SHOUTREC=1, PLUS the new joinendlines
  recorder (scripts/policies/joinendlines-diag.js, record-only: it
  copies rec.log for calledHelp fights and never touches opts).
- BEFORE leg: current code (no narration change) + full recorder
  stack, into a scratch EVID dir. AFTER leg: narration change only +
  identical stack/seeds, into a second scratch EVID dir.
- RE-DERIVATION CLAUSE (coordinator note 2026-10-29): the BEFORE leg
  is run fresh on current master and IS the baseline. If it diverges
  from the published shoutrec corpus (29 calledHelp fights: 19 vFlee,
  4 mFlee, 3 vKill, 3 vDie), the divergence is reported, not forced —
  the verdict judges before-vs-after on identical seeds, never
  before-vs-old-numbers.

## Population

ALL shout-joined fights in the band: calledHelp true AND shoutRound
non-null (shoutRound is the engine's own shout snapshot field, landed
by sim-shoutrec-a). allyFromStart fights (shoutRound null) are
excluded from both denominators even though they are calledHelp —
their endings are out of scope. Caller/channel unrestricted: the
narration blank applies to any shout-joined fight.

## Primary metrics (binding)

Classifier (scripts/test-joinendlines-a.js, log-content based, fixed
here): a shout-joined fight ending mFlee is a BREAK DRIVE-OFF unless
its log carries the round-cap line ("Neither gives after") or the
judges line ("the judges give it"); a shout-joined fight ending vFlee
is a FLOOR FLEE unless its log carries the hopeless line ("sees how
this ends"), the learn line ("has seen enough"), the round-cap line,
or the judges line. (Before the fix, floor flees carry no end line at
all; after the fix they carry line (b). Before the fix, break
drive-offs carry no end line at all; after the fix they carry
line (a).)

- METRIC A — drive-off ends after a shout: denominator = shout-joined
  BREAK DRIVE-OFFS in the AFTER leg; numerator = those carrying
  line (a) verbatim. GO bar: >= 80% AND denominator >= 2
  (minimum-n 2). Below minimum-n: INSUFFICIENT-DATA, not GO.
- METRIC B — floor-flees after a shout: denominator = shout-joined
  FLOOR FLEES in the AFTER leg; numerator = those carrying line (b)
  verbatim. GO bar: >= 80% AND denominator >= 1 (minimum-n 1).
  Below minimum-n: INSUFFICIENT-DATA, not GO.
- Prior-corpus context (NOT thresholds): 4 joined mFlee and 19 joined
  vFlee in the published shoutrec corpus; known break drive-offs
  Farid, Oliver, Sandile; known floor-flee Sanne. The AFTER-leg
  denominators are whatever the identical-seed rerun produces.

## Neutrality gate (blocks GO)

- AFTER-leg per-seed rows byte-identical to BEFORE-leg rows after
  stripping EVERY log array (joinendlines log; shoutrec / breakline /
  tilejoin sense logs) from both legs. The only allowed difference
  is log content — the two new lines and nothing else.
- Band wall numbers identical per seed before/after (report-only
  fields, but a mismatch fails the gate): won, deaths total, table,
  entered, waveReach, nationalEver, nationalFinal, days, endReason.
- The recorder itself is proven record-only by this gate: it never
  touches opts, and any behavior change would break byte-identity.

## Sense bar (blocks GO)

>= 3 AFTER-leg transcripts read end to end, including at least one
drive-off-after-shout and at least one floor-flee-after-shout WHEN
each case occurs in-band. A case with zero in-band occurrences leaves
its count metric INSUFFICIENT-DATA, so sense cannot rescue it; the
evidence file names which case (if any) went unobserved in-band.

## Verdict rule

GO only if Metric A GO + Metric B GO + neutrality PASS + sense PASS.
A count miss or a neutrality failure is NO-GO. Below-minimum-n on
either metric is INSUFFICIENT-DATA. A miss is NO-GO, never re-scored
against a friendlier metric mid-run; metric doubts go under "metric
review" for the NEXT run. Every evidence file carries a "metric
review" section.

## Fixture tests (binding, before judging)

scripts/test-joinendlines-a.js must prove, before the band is judged:
- line (a) fires in a synthetic shout-joined mFlee and NOT in an
  unjoined mFlee, an allyFromStart mFlee, a round-cap mFlee, or a
  vKill/vDie/vFlee ending;
- line (b) fires in a synthetic shout-joined floor vFlee and NOT in
  an unjoined floor vFlee, an allyFromStart floor vFlee, a hopeless
  vFlee, a learn vFlee, or a round-cap vFlee;
- the classifier above agrees with the fixture outcomes on every
  synthetic log.
Node harness: eval the FULL src/js/*.js list in index.html order
(minus DOM-only app.js/sprites.js/tile-scenes.js/move-anim.js/
drama.js). Seed Math.random BEFORE eval. Never stub Game.save.
