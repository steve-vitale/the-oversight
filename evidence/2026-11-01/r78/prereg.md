# Journey social r78 — PREREGISTRATION (lane B, 2026-11-01)

Leg 5 (social life). r77's named-next, adopted verbatim from its metric
review + run note, not re-scored: (1) HANDS-OFF-CASES CONTROL: a control
arm that picks NO case actions — the only clean npcMootTick test;
(2) DORMANT RE-ENTRY QUESTION: should a letlie-shelved case ever come
back to the fire, or is permanent shelving the design? (design question
for the run note, NOT a game change in this run); (3) BROKEN-ORIGIN BY
LOG TRACE: trace broken endings in the outing log itself, not the
final ledger; (4) SAY CENSUS TV EXCLUSION: exclude 📺/contest "Moot"
show lines from the convening census; (5) ACQUITTAL BATCH: keep
accumulating trials toward the 10-trial bar, reporting score-spread
means alongside margins; (6) LANGUAGE-BARRIER NIT: press investigation
proceeds through a no-shared-words frame (r77 Xavier) — investigate
whether that is intended or a gate gap; a fix, if any, lands as a
separate proof-tested commit AFTER the measurement seeds, never inside
them, and is reported as unmeasured in natural runs.

## What changes in r78 (driver policy + recording only, ZERO src/js in the measurement)

- Driver fork scripts/journey-social-r78-20261031.js: r77 verbatim
  except (a) fresh seeds + evidence dir (2026-11-01/r78); (b) ARMS:
  6801/6802 'handsoff' = r77 linger policy verbatim EXCEPT the
  fallback never picks a case-menu choice (see below); 6803/6804
  'mootprobe' = r77 probe arm verbatim (one betrayal:moot pick per
  case, convo ENDS after the pick; vote picks stay pickable in later
  convos, as r77); (c) SAY census gains the TV exclusion (below);
  (d) the wedge gains the broken-promise scan (below).
- HANDS-OFF FILTER (control arm only): the generic fallback forbids
  every case-menu pick: betrayal:site, witnesses, investigate, moot,
  letlie, expose, bribe, press, pressaccuser, approach, wounds,
  askheard, tellside, hearoffer, vote_guilty, vote_acquit (first
  segment after 'betrayal:'). The fallback rescue line is filtered
  the same way, so a convo whose only fresh picks are case picks
  ends without a case pick (the driver breaks out, as it does when
  no pick exists). NOT forbidden, deliberately, because they are
  not case actions: ambush survival picks (betrayal:run/talk/fight)
  and invitation picks (betrayal:accept/decline) stay pickable, so
  the hands-off arm does not distort survival or invitation
  outcomes. Seeded-speaker steering, gossip/ans/linger picks, and
  the forage_help favor-accept are unchanged on both arms. A
  hands-off seed with ANY case-menu pick in its betrayalPicks is a
  binding miss (the arm was not hands-off).
- SAY TV EXCLUSION: a beat matching the convening phrasing is
  excluded from mootSayLines when it carries a TV/contest marker:
  the 📺 character, a leading TONIGHT:, or the word 'contest'.
  The driver also counts mootSayTvExcluded (phrasing matches
  dropped by this rule) so the exclusion is auditable, not silent.
- Wedge fork scripts/journey-social-r78-outing-wedge.js: r77 verbatim
  EXCEPT startWedge gains a broken-promise scan after its per-favor
  loop: for each forage_help favor whose live promise reads kept ===
  'broken' and whose favorId is not yet in ctx.brokenSeen, push
  {step: 'promise-broken-seen', day, vid, vidName, favorId,
  deadline, promisedDay} and mark it seen. Pure reads; one entry per
  favor; the scan runs once per dawn (startWedge's own once-a-day
  guard). Broken promises are otherwise invisible to the wedge
  (startWedge skips kept-truthy promises), which is exactly why
  r77's final-ledger method could not catch them.

## Run shape (r77 verbatim otherwise)

Fresh seeds 6801-6804, smoke 6805 (30d), DAYCAP=140 death-aware,
competent policy, all linger, seeded-speaker steering ON. Pilot gate:
smoke PASS + first full seed completes before the remaining seeds
are trusted; a pilot seed that shows cases or outings is interesting
enough to expand to the full 4.

## Bindings (a miss is NO-GO, never re-scored)

- B1 (moot metric): every seed's per-seed JSON carries caseSnaps
  with trialDetail (or trial null) AND mootSayLines. The analyzer
  reports trials from first-trial-appearance + say count. v.moots
  is never a count.
- B2 (autonomous convening, hands-off arm only): an ELIGIBLE case
  is a hands-off seed case with NPC accused (no player accused),
  a target, no probe pick, no driver case-menu pick of any kind,
  playerConvened false, observed in status 'open' at some snap,
  and a run that reaches its mootIn day (case day + mootIn, tick
  default 3 when mootIn is null). IF >=1 eligible case exists, the
  analyzer reports whether a trial appeared by then / ever, and
  the convening SAY line if one fired. If NO eligible case exists,
  the verdict is UNISOLATED (reported, not failed).
- B3 (acquittal census): for every trial the analyzer reports NPC
  guilty, total, need, margin, convicted/advisory/resolution,
  wildDay, playerVoter, and whether the driver cast a vote (must be
  0 on hands-off trials and 0 inside probe convos). No
  acquittal-lean verdict on fewer than 10 trials CUMULATIVE
  (r77: 2 trials; r78 adds to that count) — descriptive only below.
- B4 (away return timing, replication guardrail): 100% of away
  start-blocks carry awayComputedReturnDay (a number). A block
  without it is a miss.
- B5 (broken-origin by log): the analyzer reports, per seed, every
  promise-broken-seen entry and whether a later same-villager start
  (any favorId, day > broken-seen day) follows, with day gaps. An
  unreported window (broken-seen entries exist, no later-start
  check performed) is a miss. No "gate freed" claim without a
  caught start.
- B6 (people): 5 reads, >= 2 outing-related, 0 fabricated-history,
  <= 1 weak ending. Probe-arm reads must show the convo ending
  after the convening pick (no post-convening fallback vote lines).
- Guardrails (report-only): pooled dryRate in [0.20, 0.40];
  NO-REGRESSION check.js --quick: the same 6 pre-existing failures
  as r73-r77, zero new, adjudicated by name.

## Decision note (delivered, not implemented)

Whether the r75 target-aware walk + dawn step-first retry fold into
policies/competent.js — still owed, still not taken here for the
same reason as r77 (panel re-baseline required). The dormant
re-entry question (item 2 above) is likewise delivered as a design
question with the r77 mechanism attached (open -> letlie -> dormant
-> npcMootTick skips), not decided inside this run.
