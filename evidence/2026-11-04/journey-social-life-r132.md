# Journey social life r132 — RUN NOTE (Lane B, 2026-11-04)

Leg 5 (social life). Base master 570daa9c5 (post exphurt landing).
Driver scripts/journey-social-life-r132-20261104.js (r125 verbatim,
fresh seeds 41601–41604, DAYCAP 140, narration on). Analyzer
scripts/analyze-journey-social-r132-20261104.js. Fixture
scripts/test-journey-social-r132-escaped-expired.js (run BEFORE the
panel, so the panel cannot re-score it). Pre-reg:
evidence/2026-11-04/journey-social-life-r132-prereg.md.
Rotation-b: 5 → 6 written at closeout (next: crisis).
No src/js changes this run — both open blanks closed by measurement
(see M2c/M2x), per the prereg judgment rule.

## Pre-registered verdicts (BINDING metrics, §14)

- **M1 arming motive: GO — 4/4 grievance-linked at arming.**
  Every plot armed with motive 'grievance' and grievanceTargetToLeader
  44.8–49.6: 41601 Harold→Wiebke (d7), 41603 Willow→Elijah twice
  (d6, d8), 41604 Kate→Sanne (d8). Accomplices again NOT
  grievance-driven (motives 0, 25 'ambition'): hot leader + cold
  friends, fifth panel running. Drought bound holds: 0 plots
  after d30 (all armed d6–d8).
- **M2c escaped-spring trace: GO — fixture AND wild panel agree.**
  Fixture: an escaped spring opens an 'ambush' case with a
  playerHeardDay; caseDiscoveryTick on that day sets knownToPlayer,
  playerRole 'juror', emits 'Word reaches you, days late: …
  stands accused … There's going to be a moot', and writes the
  journal note. Wild panel: 3 escaped springs (41601 Harold→
  Wiebke d10, 41603 Willow→Elijah d7 AND d10), every one surfaced
  (surfaced=true by snap d30, heardDay passed, all three cases
  tried and acquitted). r125's unmeasured kind is now measured
  twice over: escaped springs DO surface through the case channel.
- **M2x expired-plot trace: MEASURED-SILENT, and per the prereg
  judgment rule that silence is COHERENT — M2x closes with NO
  surfacing line.** Fixture: a backdated plot expires via
  npcPlotTick (expired/active/resolved flags set), the pending
  lure clears, zero cases open, zero new grievances, zero say
  lines name the pair after expiry, the single-plot slot frees,
  and nobody is harmed. Nothing in the game reads the expired
  flag (grep: only the expiry site sets it). No event happened,
  so no trace is the fog-of-war-correct behavior — surfacing a
  secret conspiracy that fizzled would leak what the player never
  earned. The wild panel again produced 0 expiries (fast
  springing), but the fixture, not the panel, was the instrument
  for this kind. The r120/r125 "invisible kind" blank is closed
  as a documented non-blank, not a fix.
- **M3 invite refusal, wrapper only: party 13 accept / 22 decline;
  lures 4 accept / 9 decline.** Refusal still the norm for party
  invites; lures split the same way as r125 (3/3 then, 4/9 now).
  No threshold — counts carried only.
- **M4 sense: GO.** Two reads from 41604 (the village that lived
  to d112). (1) Sanne — the d11 ambush victim — says on d15,
  unprompted in a talk request: "Nobody's settled the ambush
  against me yet", and the case menu then works: witnesses named,
  bribery investigation returning escalating honest non-answers
  ("Nothing you can prove — yet…", "Nothing solid. Keep
  looking.", "Innocent from every angle. It isn't — but you
  can't prove that yet."). Nina independently raises "the ambush
  of Sanne. Nobody's settled it." on d14: the dark channel lives
  in ordinary conversation, not just telemetry. (2) Day-1 nudge
  (Onni, d2): nervous, self-deprecating, real ("Strangers are
  just people you haven't disappointed yet."), ends warmly
  ("Good talk. I feel like I know you a little better now.").
  Driver artifact, same class as r125: the driver repeats one
  choice ("Why can't I do this now?" / bribery press) several
  times; NPC answers vary with honest escalation, so it reads as
  persistence, not filler — but a real player would vary choices.
- **M5 census guardrail: NO-GO on threshold (1/4 past d100) —
  but the second consecutive 1/4 after 0/12.** 41604 lived to d112
  (1 alive at the end, 18 fallen); 41601 d61, 41602 d50, 41603 d70.
  Per binding, dark-channel verdicts stay within-window only.
  Survival signal: 2 of the last 8 villages past d100 after 0/12
  before r125 — movement sustained, threshold still unmet.
  Death shapes this panel: the wild again dominates (12, 8, 11, 6
  per seed), monsters second (2, 0, 1, 5); no ≥3/day monster
  cluster anywhere; 41601 ends on a d61x5 wild wipe.

## Village assessment, in plain words

Four villages, one long-lived. 41604 lasts 112 days — Kate tries to
have Sanne ambushed on day 8, Sanne is hurt, not killed, the case
is tried and acquitted, and Sanne is still bringing it up herself a
week later ("Nobody's settled the ambush against me yet") while the
village slowly bleeds to monsters, contests, and the wild until one
person is left. 41603 is the vendetta village: Willow tries Elijah
twice in four days, Elijah escapes both times, both cases acquitted
— the same feud, not two feuds, and the game never blinks at the
repeat. 41601 and 41602 die young to the wild (a five-death day on
d61, a three-death day on d48). The social layer is loud everywhere
(254 full conversations, 213 natural ends, 40 feasts, 5 moots across
the panel); the villages underneath it still mostly don't last.

## Reachable / fun / winnable (leg 5)

- Reachable: bright layer fully reachable (conversations, feasts,
  moots in volume on every seed). Dark layer reachable in week one
  plus revenge echoes; every spring this panel — including all
  three escaped springs — surfaced through its case to the player.
  Expired plots are now a measured non-blank: nothing happens, and
  nothing should be shown.
- Fun: conversations read as real people (M4); the ambush victim
  herself keeps the unresolved case alive in talk; feuds escalate
  visibly and get tried, twice against the same man in 41603.
- Winnable: not assessable on this leg's horizon — only one
  village lived long enough for the social layer to matter to a
  win, and M5's threshold still fails. The direction moved again
  (second 1/4 in a row after 0/12), the verdict did not.

## Fixes this run

- None in src/js, deliberately: both open blanks closed by
  measurement under the prereg judgment rule (M2c surfaces, M2x
  silence is coherent). Landing a surfacing line for expired plots
  on speculation would have leaked a secret the player never
  earned and violated fog-of-war; the run note records that call
  so the next run does not re-open it as a fix candidate.
- **Fixture (new tooling):**
  scripts/test-journey-social-r132-escaped-expired.js, 17/17
  green. Two fixture lessons baked in: the escaped hunt re-picks
  a living pair after a killed roll (first attempt stopped at
  tries=0 on exactly that roll), and the discovery-line assertion
  checks surfacing content, not the name form (whoTag gates names
  for unmet villagers — "the person in their 40s" — while the
  journal note carries the displayName).

## Regression check

- test-journey-social-r132-escaped-expired.js 17/17 (new).
- test-journey-social-r125-ambush-fallen.js 6/6 (prior run's fix
  still holds on the new base).
- `node scripts/check.js --quick` in the worktree: 284 passed,
  6 failed in 424s (log at
  evidence/2026-11-04/journey-social-life-r132-checkquick.log).
  The 6 = exactly the 6 standing families from r125
  (measurement-proof-update, measurement-workflow,
  mobile-combat-cadence, occupation-panels, phone-frame-proof,
  establishment-r20-fixes). r125's 4 load-timeouts and flaky
  measurement-cache-flags did NOT recur. No new failures; this
  run changed no src/js, so no regression is attributable here.

## Metric review (§14)

- M2c is now CLOSED: fixture + 3 wild escaped springs, all
  surfaced. No further escaped-spring measurement needed; the
  r120 overturn stands confirmed on fresh seeds.
- M2x is now CLOSED as measured-silent-by-design: the fixture is
  the durable instrument (wild panels cannot produce expiries
  while plots spring in ≤1 day). If a future run wants expiries
  in the wild, it needs a decline-heavy seed, not another panel —
  but there is no longer a blank justifying one.
- M5's threshold (2/4) did its job again: 1/4 is movement, not a
  pass, reported that way for the second panel running. If the
  next panel also lands 1/4, the question becomes whether the
  guardrail threshold or the survival itself is the story — a
  next-run proposal, not a mid-run re-score.
- Telemetry check (closeout): ran against the social.json
  baseline plus the r132 per-seed JSONs with the same l3.* keys
  as r125 — all five legacy keys LOUD-disappeared (bonds 318,
  deepBonds 168, betrayalCases 8, mootsConvened 7, gossipConvos
  99 → current 0), the same schema drift r112/r113/r120/r125
  established: the social driver never emits l3.* fields, so the
  tool reads absence, not a game deviation. Verdict: explained,
  not a bug. Baseline NOT rolled forward.
- Observation, not a metric: 41603's repeat plot (Willow→Elijah
  twice in 4 days, both escaped, both acquitted) is a vendetta
  story, not a defect on this evidence — the leader's grievance
  persists and no rule forbids re-arming. A re-arm cooldown
  would be a design call for Steve, not a fix this run invents.

## Evidence

- evidence/2026-11-04/journey-social-life-r132-prereg.md
- evidence/2026-11-04/journey-social-life-r132-41601.json
- evidence/2026-11-04/journey-social-life-r132-41602.json
- evidence/2026-11-04/journey-social-life-r132-41603.json
- evidence/2026-11-04/journey-social-life-r132-41604.json
- evidence/2026-11-04/journey-social-life-r132-panel.log
- evidence/2026-11-04/journey-social-life-r132-analysis.txt
- evidence/2026-11-04/journey-social-life-r132-checkquick.log
- scripts/journey-social-life-r132-20261104.js
- scripts/analyze-journey-social-r132-20261104.js
- scripts/test-journey-social-r132-escaped-expired.js
