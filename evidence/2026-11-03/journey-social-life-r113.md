# Journey social life r113 — RUN NOTE (Lane B, 2026-11-03)

Leg 5 (social life). Base 4d595ebe6 (post-r112, no src/js change by r112).
Driver scripts/journey-social-life-r113-20261103.js (r112 verbatim +
dark-snapshot extension: plot leader, accomplices, grievanceTargetToLeader,
grievanceTargetToInviter, max accomplice grievance; plus fallenFull in the
evidence). Seeds 41301–41304, DAYCAP 140, narration on. Pre-reg:
evidence/2026-11-03/journey-social-life-r113-prereg.md.
Rotation-b: 5 → 6 written at closeout (next: crisis).

## Pre-registered verdicts (BINDING metrics, §14)

- **M1 dark motive, corrected pair: GO — on the revenge clause, with the
  target→leader half still zero.** Timing-corrected (grievance day <
  plot day, deduped): NO plot in the panel arms on a pre-existing
  target→leader grievance (0/6; the end-snapshot "3 plots with gT->L
  > 0" is post-arm contamination — two are the plot's own spring
  grievance, one is conflict tension, none predates arming). BUT the
  pre-registered OR clause fires exactly once, and it is the run's
  headline: seed 41304, Ming leads plot_1 against Rosa d6 (inviter
  Vasyl); it springs hurt, recording Rosa→Ming 'ambushed' sev 60 d6;
  the NEXT DAY Rosa leads plot_3 against Ming (inviter Vasyl again).
  Victim becomes avenger against her own ambusher within 24 hours —
  the grievance→plot link r112 could not see because it keyed plots
  by inviter and never recorded leaders. Revenge arcs fire; they
  fire early, and only early (see drought note below).
- **M2 invite refusal, corrected instrument: refusal is common, not
  rare.** Wrapper party decisions across the panel: 21 accept / 26
  decline — villagers refuse party invites MORE often than they
  accept. r112's "44/44 accepted" is confirmed as an instrument
  artifact of bs.invites histories and must never be cited again.
  Lures, separately: 6 taken / 2 declined — sometimes-taken holds
  a third consecutive panel.
- **M3 accomplice-gate fixture: PASS 9/9.**
  scripts/test-accomplice-gate-r113.js stages the real
  Game.recruitAccomplices: warm village (trust 60, same-group, motive
  0) recruits NOBODY (mates score exactly 18, gate is strict >18, so
  no plot can arm); cool village (trust 20) recruits exactly the 2
  mates (score 34); a 60-severity grievance breaks the warm block
  for its holder (motive 48, score 42) but one grievance alone still
  leaves < 2 accomplices, so a lone avenger cannot start a plot.
  r112's formula reading is now a proven mechanism, not an argument.
- **M4 sense: GO with two notes.** (1) A friendship transcript
  (Luis, 11 turns) passes: the NPC wants a walk and an honest opinion,
  shares real history (Sofia and Julio taken in Hide and Seek, watched
  by the whole fire), and ends warm and earned ("This was good. They
  mean it."). Thin middle turns ("What else?", "Tell me more") are
  driver-prompt repetition, not game fabrication. (2) An ambush-talk
  transcript passes on substance: Anna volunteers "There's still the
  matter of the ambush of Wei. Nobody's settled it," and the
  investigation options genuinely engage it (site, witnesses, food
  trail: "The ground remembers", "Dig again; the trail is still
  warm"). NOTE A (repeat of r112): the driver repeated the bribery
  choice 3× and got 3 flavors of "nothing yet" — filler when looped,
  though a real player would vary choices. NOTE B (softened): the
  aftermath IS voiced in ordinary friendship talk now, not only in
  recall menus — but no spring scene itself was witnessed; a lure
  spring is still learned afterward, never seen.
- **M5 census guardrail: NO-GO — again the headline.** 0/4 villages
  past d100 (d73, d67, d60, d92; endReason village-lost on all four).
  Dark-channel verdicts above are within-window only (plots d6–d9).
  Survival signal, now 0/8 across r112+r113 social panels on the same
  driver family (r110 pre-ship: 4/4 past d117). The bisect r112 called
  for is still owed; this panel adds four more matched points, it
  does not substitute for it.

## Village assessment, in plain words

Four villages, four endings, three shapes. Each starts with 12 people
and a full pantry. Each lives a rich social month or two — 47–96 full
conversations (89–97% natural ends), 8–13 feasts, 1–3 moots — and then
ends. Two end the r112 way: a cluster of "the wild" deaths over days
(41302: 4 dead on d50, 10 of 16 fallen to "the wild"; 41303: 6 dead on
d59, 11 of 12 fallen to "the wild" — a wipe, not attrition). One ends
differently: 41304 breaks on sickness (6) and starvation (3) over a
long d92 run, with 5 people still alive when the village scatters —
"lost" does not always mean extinct; 41302 also ends with 6 alive.
And 41301 spreads out: monster and wild deaths across d17–d72, no
single cluster. The through-line is not one cause; it is that no
village survives its second or third month, whatever breaks it.

Per-seed, plainly:
- 41301 (d73, 0 alive, 19 fallen): two plots, same pair (Nina→Wei
  via Oliver, d6 and d9), both sprung, neither leaving an 'ambushed'
  grievance — both springs resolved 'escaped' (the 55% outcome), which
  leaves no grievance trace. The dark channel's commonest spring
  outcome is invisible to grievance counting.
- 41302 (d67, 6 alive at scatter, 16 fallen): one plot (Ray→Vi d6);
  the end-snapshot grievanceTargetToLeader of 36.8 comes from
  unresolved conflict tension (46 × 0.8), not a recorded grievance —
  motive has a conflict channel the grievance list cannot see.
- 41303 (d60, 0 alive, 12 fallen): one plot (Nino→Somchai d7, sprung
  hurt, Somchai→Nino grievance 60 recorded); then a d59 wipe (6 dead)
  ends the village the next day.
- 41304 (d92, 5 alive at scatter, 15 fallen): the revenge pair.
  Ming→Rosa d6 springs hurt; Rosa→Ming d7 answers it. Both plots use
  Vasyl as inviter — the same trusted face, twice. Longest run of
  the panel, richest social volume (96 conversations), still ends
  on sickness and hunger, not violence.

## The drought, refined (design finding, not a bug)

r112 named the throttle (warm trust → accomplice scores ≤ 18). r113
proves it at unit level AND bounds it: the throttle is about motive
scarcity, not an absolute warm block. A fresh 60-severity grievance
recruits its holder even at trust 60 — so revenge plots CAN arm in a
warm village, but only when two motivated people exist at once, and
only while grievances are fresh. Late game has neither: trust stays
high, grievances age, and no plot has armed after d9 on this panel
(0/6 late). The dark channel is therefore an early-game system with
occasional revenge echoes, not a through-line. Whether that is the
intended shape is a Steve-call design question, held here under the
gating freeze — no src/js change made.

## Reachable / fun / winnable (leg 5)

- Reachable: the bright layer is fully reachable (conversations,
  feasts, moots, friendships all fire in volume). The dark layer is
  reachable only in week one, plus revenge echoes — and its commonest
  spring outcome (escaped) leaves no trace a player can follow up.
- Fun: conversations read as real people (see M4). The lure loop's
  daily re-roll (r112) was not re-measured here; the invite refusal
  rate is the new fun-relevant number — villagers say no, often.
- Winnable: not assessable on this leg's horizon — no village lived
  long enough for the social layer to matter to a win. M5 fails
  again, stated plainly.

## Fixes this run

None to src/js. Deliberately: the candidate changes (accomplice
threshold, spring-scene narration, survival lever) are Steve-call
design/gating decisions, and the survival cause is unbisected.
Delivered instead: the r113 panel + extended driver + analyzer, the
accomplice-gate proof test (9/9), and three named findings (revenge
arc fires; refusal is common; escaped springs leave no trace).

## Regression check

`node scripts/check.js --quick` in the worktree: 284 passed, 6 failed
in 967s (full log at
evidence/2026-11-03/journey-social-life-r113-checkquick.log). The 6
are exactly the standing pre-existing families
(measurement-proof-update, measurement-workflow,
mobile-combat-cadence, occupation-panels, phone-frame-proof,
establishment-r20-fixes) — no new failure from this run. No src/js,
docs, or test file changed except new files (driver, analyzer, proof
test, evidence), so no regression is expected from this run; the 6
are left for their owning lanes. Check run on base 4d595ebe6;
post-rebase (onto 9d489bcd3) proof test re-run 9/9.

## Metric review (§14)

- M1's end-snapshot grievance read is contaminated by post-arm
  grievances and conflict tension: the "3 plots with gT->L > 0"
  headline from the analyzer must NOT be quoted as motive evidence.
  The timing-corrected read (grievance day < plot day, deduped) is
  the valid one: pre-arm target→leader 0/6, holder→leader 1 case.
  Next run should snapshot motiveBetween(leader, target) AT ARMING
  (wrap the arming call driver-side) instead of reconstructing it
  from grievance days.
- M2 is closed: the wrapper is the refusal instrument; bs.invites
  histories must not be used for acceptance rates. Drop M2's old
  framing next run; report wrapper counts only.
- M5's guardrail did its job again: it stopped a thin-window read
  from being reported as a full-leg verdict.
- Telemetry check (closeout): ran against the social.json baseline
  plus the r113 per-seed JSONs — all five legacy l3.* keys
  LOUD-disappeared (bonds 318, deepBonds 168, betrayalCases 8,
  mootsConvened 7, gossipConvos 99 → current 0), the same schema
  drift r112 established, not a game deviation. Baseline NOT rolled
  forward this run.

## Evidence

- evidence/2026-11-03/journey-social-life-r113-prereg.md
- evidence/2026-11-03/journey-social-life-r113-41301.json
- evidence/2026-11-03/journey-social-life-r113-41302.json
- evidence/2026-11-03/journey-social-life-r113-41303.json
- evidence/2026-11-03/journey-social-life-r113-41304.json
- evidence/2026-11-03/journey-social-life-r113-panel.log
- evidence/2026-11-03/journey-social-life-r113-checkquick.log
- scripts/journey-social-life-r113-20261103.js
- scripts/analyze-journey-social-r113-20261103.js
- scripts/test-accomplice-gate-r113.js (9/9)
