# natwindow prereg — ARM 4 (winnability push), 2026-11-03

## Question
Why do scale-courting (closecommit-stack) runs stall below national, and
does protecting the national window with existing verbs lift the
national rate on identical seeds?

## Diagnosis (already measured, pilot — NOT judged here)
On current master, the closecommit stack (leadfeast + windefer +
seatdrive + fullseat-diag + titanroute + musterclose + mustergap,
FEASTSCALE_R13=1 TRIBFLOOR=1 WINPURSUIT=1 WINDEFER=1 SEATDRIVE=1
FULLSEAT=1 HERALD=1, mode 'herald') reaches national-ever on only
1/6 pilot seeds (97338). Stage breakdown from the natprobe instrument
(daily link/polity/scale snapshots, reads only — never
villageStandingTotal, _otherVillage, titanCallReadiness, or any
roster generator):
- Links form fast (day 25-35, 3 primary subs) and season at
  first-link+30 (day 55-62); the LEAD polity qualifies then.
- The Regional Dawn lands at first-link+21 (day 46-49), so
  _checkNational cannot stage a beat until Dawn+30 (day 76-79).
  The polity must therefore survive a 16-21 day wait.
- In the wait, trusts decay: tending stops when the pantry falls
  below leadcourt's 20,000 kcal gate; weekly tribute shortfalls
  cost -1/-2; bearer deaths cost -8 and gag tending 7 days; and
  a sounded titan muster bleeds -2/link/DAY while hungry
  (1000 kcal/blade/day from the scholar's pack, almost never
  covered — musterfed proved the pantry cannot sustain it).
- 97339: polity day 57-69 (marginal link pinned at exactly 40),
  call day 69, muster hunger kills the marginal link day 70,
  gate day 76 missed by 6 days. 97342: polity day 61-66, call
  ~day 58, hunger kills it day 67, gate day 76 missed by 9 days.
  97330/97333: trusts fall below 40 BEFORE seasoning age, so no
  polity ever forms. 97338 (success): marginal trust 57 at
  polity, 48 at the gate; its call sounded day 90, AFTER
  national day 79. Plain competent (no scale code by design)
  forms ZERO links ever (98903/98912 probes) — its 0/20
  national is a policy blank, not a game mechanism, and is NOT
  the judged population here.

## The leg (POLICY ONLY, zero src/js changes)
scripts/policies/natwindow.js, wrapping the closecommit stack:
- TEND: while national is not live and Haven holds >=2 primary
  links, tend every primary link with trust < 50 once/week when
  pantry-days >= 3 (musterclose's survival floor). 50 = seasoned
  bar 40 + 10 margin. Engine verb, real 1,500 kcal/link/week,
  credited to the subordinate's pantry too (fewer shortfalls).
- STAND DOWN (v2): while a herald muster stands HUNGRY (own pack
  < blades x 1000 kcal), national is not live, no beat is
  pending, the regional-season gate has NOT passed, >=2 subs are
  seasoned or the polity qualifies, the muster is >= 3 days old,
  and the weakest primary link is below 55, stand the muster
  down (one -5/link, upkeep stops). The 55 bar is load-bearing:
  the -5 must leave the weakest link >= 40; v1 waited until
  < 45 on seasoned links only and stood down AFTER the polity
  had died (97342). titanroute sounds once per run, so this
  abandons the titan road for the run — a real tradeoff, taken
  only when the pre-national window is at stake. After national
  is live the leg is idle.
- PERCEPTION LAW: reads only own links, own pantry/pack, own
  muster, own scale flags. No roster, world-monster, or
  titanCallReadiness reads. No RNG consumed.

## Judged batch (this prereg binds it)
- Seeds: the 12 npcdeadfilter-clean seeds
  97330, 97331, 97332, 97333, 97334, 97335, 97336, 97338, 97339,
  97340, 97341, 97342. Horizon DAYS=180, death-aware.
- Arms (identical seeds, same probe harness, same env gates):
  baseline = closecommit stack; variant = closecommit + natwindow.
- Instrument: scripts/natprobe-driver-20261103.js (daily stage
  snapshots + end state). Corpus:
  evidence/2026-11-03/perseed-natwindow-a/.
- Analyzer: scripts/natwindow-analyze-20261103.js reproduces the
  verdict from the corpus alone.

## Bars (judged exactly as written)
- PRIMARY: national-ever variant > baseline, variant >= 4/12,
  delta >= +3 seeds.
- MECHANISM: on seeds where baseline forms a polity that dies
  before the regional-season gate, variant holds a polity to
  the gate on at least half of them.
- GUARDRAILS: won variant >= won baseline - 1; median survival
  variant >= 0.8 x baseline median; zero instrument errors;
  zero crashes. (Standing down abandons the titan road, so a
  titan-win dip is expected and is NOT counted here; won is
  the guardrail, not titan slays.)
- Anything else = HELD: diagnosis stands, leg does not land.

## Gating freeze (standing)
No changes to win prices, deed gates, standing thresholds, or
readiness numbers are in this arm. The leg changes no src/js
at all. If the judged delta fails, the return is diagnosis-
only with the gate-sequencing question (polity must survive a
16-21 day wait; staging remembers nothing) as a Steve decision
— not a silent threshold edit.

## Anchor note (added at staging, before judged runs)
- Pilot anchor: master 81cb0cc4a (probe + variant runs in /tmp
  against the main tree, no main-tree edits).
- Judged anchor: worktree branch win-national at 6fb93c5c4.
  git diff 81cb0cc4a..6fb93c5c4 touches src/ not at all and
  no policy in the closecommit stack (only evidence + a new
  sortieretry policy file), so the judged batch is expected
  to reproduce pilot trajectories; the batch re-runs both arms
  on the judged anchor regardless, and the analyzer judges
  only the judged corpus.
