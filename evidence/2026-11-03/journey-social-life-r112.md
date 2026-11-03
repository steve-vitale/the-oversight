# Journey social life r112 — RUN NOTE (Lane B, 2026-11-03)

Leg 5 (social life). Base 0c09dc602 (includes r111 recovery).
Driver scripts/journey-social-life-r112-20261103.js (r111 driver
verbatim, seeds/dates updated). Seeds 41201–41204, DAYCap 140,
narration on all seeds. Pre-reg:
evidence/2026-11-03/journey-social-life-r112-prereg.md.
Rotation-b: 5 → 6 written at closeout (next: crisis).

## Run context (before play)

Stale-lock recovery + r111 recovery, both in this run: the lock
named run 2026-11-03T00:02:06Z with no registry entry (>90 min
old) was deleted; the dead r111 tree (heartbeat 35+ min stale,
no sim processes, no writes since 00:43Z) had its 4 uncommitted
files safe-committed (0754f69cc), rebased cleanly, merged
ff-only (0c09dc602), tree released, branch deleted. The
safe-commit index clobber struck (staged deletions in the
worktree index); repaired with `git read-tree HEAD` and the
tree verified clean before rebasing. Nothing was lost.

## Pre-registered verdicts (BINDING metrics, §14)

- **M1 lure resolution: GO (within the lived window).** Lure
  decisions fired on 3/4 seeds (41201: 6 lure calls, 41202: 1,
  41203: 7; 41204: none). Across the panel, lures were both
  TAKEN (41201 d14 Yuki→Wei; 41202 d6 Elena→Diana; 41203 d10
  Alexandra→Petra, d19 Pule→Diana) and DECLINED (41201 d8/d11/
  d12; 41203 d9/d15/d16/d17/d18). Sometimes-taken holds in
  play — the 2026-10-27 ruling survives contact with real runs.
  Shape note: the same pair re-rolls DAILY until taken
  (Yuki→Wei d8–d14, Pule→Diana d15–d19) at near-identical
  chances (35→45, 51→52). That reads as dice-rolling, not a
  character changing their mind; the reasons stay thin
  ("relationship with inviter (+1)").
- **M2 grievance→motive: NO-GO.** Grievances exist now
  (unlike r111 partials): 5, 1, 5, 0 across seeds. But NO
  plot in the panel carries a grievance link:
  grievanceInviterToTarget = 0 on all 5 plots, and NO plot
  armed after d19 on any seed — so no grievance, of any
  direction, ever feeds a later plot here. The co-movement
  (grievances 5/1/5/0 vs plots 2/1/2/0) runs the WRONG way:
  plots CAUSE grievances (a sprung lure records an
  'ambushed' grievance, severity 60, on its victim), not
  the reverse. Per §14 this is reported as the NO-GO it is,
  not re-scored as a GO on correlation.
- **M3 player invites: REPORT (instrument-limited).** The
  dark snapshot's invite histories total 44 recorded invites
  (15/6/16/7), all accepted, zero recorded declines. But
  bs.invites is keyed per villager and the instrument
  cannot show whether declines are ever recorded there —
  while the lure-decision wrapper DOES record declines
  (10 across the panel). So "44/44 accepted" is an
  instrument property until proven otherwise, NOT a finding
  that villagers never refuse. Do not cite it as refusal
  evidence.
- **M4 sense: GO with two notes.** (1) A full friendship
  transcript (41203) passes the bar cleanly: the NPC wants
  something real (ask the System about taken sister Lauren
  and the pods), the player engages, the ending owes
  ("If it answers — you'll tell me? ... This was good.
  They mean it."). (2) A full ambush-recall talk-request
  transcript passes on its opening: Petra, victim of a
  sprung lure, says "Nobody's settled the ambush against
  me yet," and the investigation options genuinely engage
  it (site, witnesses, food-trail). NOTE A: the driver
  repeated one investigation choice 4× and got 4 flavors
  of "nothing yet" — that loop reads as filler when
  repeated, though a real player would vary choices.
  NOTE B: no dedicated spring narration passage was
  captured — a lure spring is learned afterward (recall,
  cases), never witnessed as a scene. That is a soft gap,
  documented, not fixed this run.
- **M5 census guardrail: NO-GO — and it is the headline.**
  0/4 villages past d100 (d69, d58, d82, d51; alive 0 at
  end on all four). The dark-channel reads above are
  within-window only (plots d6–d19, grievances by d30);
  the panel cannot speak to late-game dark channels
  because villages do not live that long.

## Village assessment, in plain words

Four villages, four collapses. Each starts with 12 people
and a full pantry (~40k kcal). Each holds together for a
month or two — dozens of real conversations (33–78 full
ones per run, 85–100% natural ends), feasts, a moot or two,
friendships forming — and then breaks. The break has a
shape: a cluster of "the wild" deaths over 1–2 days
(41204: six people across d35–d36; 41201: four across
d57–d59), the population cliffs from ~9 to ~3, the pantry
runs to zero (0 kcal at end on 41201/41202/41204; 1500 on
41203), and the remnant starves or scatters. "The wild" as
a cause covers monster-fight deaths (a proven wild fight —
monster present, no hostile fighter — reads 'the wild'),
so these clusters are consistent with field-fight wipes,
but the evidence does not prove the fight composition;
the cluster shape itself is the finding, not its cause.

Per-seed, plainly:
- 41201 (d69, 0 alive, 17 fallen): Yuki lures Wei for a
  week, takes on d14; Wei carries an 'ambushed' grievance
  against ALIYU (the plot's leader), not Yuki (the trusted
  face). Village dies in a d57–d67 attrition run, pantry 0.
- 41202 (d58, 0 alive, 16 fallen): one lure, taken d6;
  one grievance all run. Monster deaths early (d7, d19,
  d28), pantry 0 by d56.
- 41203 (d82, 0 alive, 14 fallen): two lures taken
  (d10, d19); richest social run (78 conversations, 11
  feasts); still dies, pantry 1500 left — this one broke
  on people, not food.
- 41204 (d51, 0 alive, 15 fallen): no lures, no plots,
  no grievances at all — the dark channel simply never
  switched on — and the village still dies first, in the
  d35–d36 cluster.

## The survival regression signal (LOUD, cross-leg)

r110 (base 6674df432, pre-ship) lived 117–141 days on all
four seeds. r111 partials (post-ship base) died d30/d99.
r112 (current master) died d51–d82 on all four seeds.
That is 0/6 post-ship villages past d100 against 4/4
pre-ship villages past d117, on the same driver family.
Between r110's base and now, 19 src/js commits landed,
including the Nov 2 ship: monster commitment (beasts hold
their ground, de884988a), loot taper, archer arrow-making,
dead-id filters, outing-attempt, meat channel, DEAD-AIM.
Monster commitment is the most mechanistically plausible
suspect (fights now fight to the death; 'the wild' deaths
are fight deaths), but it is NOT proven — 19 commits is a
bisect, not a verdict. Corroboration: Lane B crisis r111
the same week also found villages breaking on
famine/attrition. What is owed: a survival bisect across
the 19 commits, or a matched pre/post panel on the ship
boundary. No src change is made this run: the Nov 2
monster ruling stands, and the gating freeze stands.

## The plot drought, named (design finding, not a bug)

Why no plots after d19? The wiring is consistent —
recordGrievance, grievanceBetween, and motiveBetween all
read the same betrayal store, and a 60-severity grievance
gives motive 48, clearing the 35 bar. The throttle is
`recruitAccomplices`: a plot needs TWO accomplices scoring
>18, where score = motive×0.5 + 30 (same group) or 10 +
(30 − trust)×0.4. In a warm village (trust ~60), a
same-group mate scores 30 − 12 = 18 — NOT >18, excluded
by a hair; a non-mate scores ~0–10. Early villages (trust
~10–40) recruit fine, which is why plots arm only in the
first two weeks. As the socialite policy warms trust, the
dark channel throttles itself to zero. Related design
note: the victim's grievance names the plot LEADER, never
the trusted INVITER face ("the cruelest cut" walks away
clean by construction). Both are Steve-call design
questions, held here, not changed: the accomplice gate
sits under the gating freeze, and the leader/inviter split
is deliberate code (betrayal.js armPlot + spring lines
1020–1028, 1231).

## Reachable / fun / winnable (leg 5)

- Reachable: the bright social layer is fully reachable
  (conversations, feasts, moots, friendships all fire in
  volume). The dark layer is reachable only in the first
  two weeks and only as background (all recorded plots
  were villager-vs-villager pairs).
- Fun: the conversations read as real people (see M4).
  The lure loop's daily re-roll is the thinnest beat.
- Winnable: not assessable on this leg's horizon — no
  village lived long enough for the social layer to matter
  to a win. That is the M5 failure, stated plainly.

## Fixes this run

None to src/js. Deliberately: the two candidate changes
(accomplice threshold, survival lever) are both Steve-call
design/gating decisions, and the survival cause is
unbisected. Delivered instead: the r111 recovery (4 files,
merged 0c09dc602), the r112 panel + driver + this note,
and the two named findings above (plot drought mechanism,
survival regression signal).

## Regression check

`node scripts/check.js --quick` in the worktree: 284 passed,
6 failed in 393s. The 6 failures are all pre-existing on base
0c09dc602 in areas this run did not touch (no src/js, docs,
or test file changed — only a new driver script, which
check.js does not run, plus evidence): measurement-proof-
update, measurement-workflow, mobile-combat-cadence,
occupation-panels, phone-frame-proof (stale phone receipt /
proof freshness), establishment-r20-fixes ("next day voices
once more", expected 2 got 1). None references r112 files.
Left for their owning lanes; not fixed here.

## Metric review (§14)

- M2's inviter→target grievance test measures the wrong
  pair by construction: grievances run victim→leader, and
  the driver's snapshot keys plots by inviter. Next run
  should ALSO record grievanceBetween(victim, leader) and
  whether any grievance-holder later leads a plot. The
  NO-GO verdict stands regardless — no later plot armed
  at all.
- M3's invite-history instrument does not capture
  declines (see M3). Next run should instrument the
  invite decision directly, as r111/r112 did for lures,
  or drop M3's acceptance reading.
- M5's guardrail did its job: it stopped a thin-window
  read from being reported as a full-leg verdict.
- Telemetry check: social.json baseline uses legacy l3.*
  keys (l3.bonds, l3.betrayalCases, ...), while current
  evidence uses days/social.* — all three checked metrics
  report "newly appeared" (schema drift, explained, not
  a game deviation). Baseline NOT rolled forward this
  run; re-seeding it is a separate deliberate decision.

## Evidence

- evidence/2026-11-03/journey-social-life-r112-prereg.md
- evidence/2026-11-03/journey-social-life-r112-41201.json
- evidence/2026-11-03/journey-social-life-r112-41202.json
- evidence/2026-11-03/journey-social-life-r112-41203.json
- evidence/2026-11-03/journey-social-life-r112-41204.json
- evidence/2026-11-03/journey-social-life-r112-console.log
- scripts/journey-social-life-r112-20261103.js
- Recovered r111: evidence/2026-11-02/journey-social-life-r111-*.json
  + prereg + driver (merged 0c09dc602).
