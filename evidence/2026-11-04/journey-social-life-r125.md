# Journey social life r125 — RUN NOTE (Lane B, 2026-11-04)

Leg 5 (social life). Base master f01f7f026 (endgame r124 tip).
Driver scripts/journey-social-life-r125-20261104.js (r120 verbatim +
r120 metric-review fixes + expired-plot instrument; zero src/js
changes in the driver). Analyzer
scripts/analyze-journey-social-r125-20261104.js. Seeds 41501–41504
(fresh), DAYCAP 140, narration on. Pre-reg:
evidence/2026-11-04/journey-social-life-r125-prereg.md.
Rotation-b: 5 → 6 written at closeout (next: crisis).

## Pre-registered verdicts (BINDING metrics, §14)

- **M1 arming motive: GO — 3/3 grievance-linked at arming.** Every
  plot armed on a grievance motive with grievanceTargetToLeader >
  0: 41501 d7 Hattie→Sari (motive 43.5 grievance, gT->L 54.4,
  gL->T 54.4, mutual feud); 41502 d6 Penelope→Nikolai (39.0
  grievance, gT->L 48.8); 41502 d10 Nikolai→Penelope (motive 80,
  gT->L 45.6, gL->T 100) — the revenge arc again, measured at
  arming: plot_1 hurt Penelope's target on d7 recording
  Nikolai→Penelope 'ambushed' sev 60, and four days later
  Nikolai leads plot_3 against Penelope. Accomplices again NOT
  grievance-driven (motives 0, 25 'ambition'): hot leader + cold
  friends, fourth panel running. Drought bound holds: 0 plots
  after d30 (all armed d6–d10).
- **M2c escaped-spring trace (CORRECTED): UNMEASURED on escaped
  specifically — 0 escaped springs this panel** (outcomes: killed
  2, hurt 1). The broader case-surfacing held 3/3: every spring's
  case reached knownToPlayer/juror status (41501 case_2 murder
  acquitted, player juror, heardDay 10; 41502 case_2 ambush
  resolved + case_4 murder acquitted, both surfaced by snap d30).
  r120's overturn (escaped springs DO surface via the case
  channel) stands unchallenged but is NOT re-confirmed on escaped
  springs by this panel — the corrected metric needs an escaped
  spring to bite, and none occurred.
- **M2x expired-plot trace: UNMEASURED — 0 expired plots.**
  The instrument is proven wired (expireWrapped=true on all
  seeds) and the zero is mechanically forced, not a miss: every
  plot sprang ≤1 day after arming (arm d6→spring d7, d7→d8,
  d10→d11), while expiry needs 5 unsprung days. r120's expiries
  came from a vendetta seed with 10 lure declines; this panel had
  only 3 lure declines total. The expired-plot blank (silent
  expiry, no line/gossip/grievance) remains documented, not
  re-measured — it needs a decline-heavy seed to test.
- **M3 invite refusal, wrapper only: party 14 accept / 11
  decline; lures 3 accept / 3 decline.** Continuity note: party
  accepts lead for the first time in this series (r120: party 25
  decline / 14 accept). No threshold — closed metric, counts
  carried only.
- **M4 sense: GO.** Full friendship transcript (41501, Diana,
  8 turns, natural end, endTrust 90): Diana opens with identity
  ("I've talked down three fights this month. It's a skill. A
  tiring one."), wants something real ("Walk with me? I want
  another pair of eyes on something."), the walk happens, and
  her philosophy arrives in her own voice ("Peace isn't the
  absence of fighting. It's the presence of dinner." /
  "Arguments cost calories. I do the math out loud until people
  stop."), closing warmly with an open thread ("...Think about
  it? I'll be around."). Options engage or leave throughout.
  Driver artifact, same class as r120's bribery repeat: the
  driver repeats one choice ("Tell me more" / "Why can't I do
  this now?" / "Wait — what were we talking about?") several
  times per conversation; NPC answers vary with honest
  escalation ("As I said —", "Like I said —") and real reasons
  (door side, partner position), so it reads as persistence,
  not filler — but a real player would vary choices.
- **M5 census guardrail: NO-GO on threshold (1/4 past d100) —
  but first movement in four panels.** 41501 SURVIVED to d141
  (5 alive), the first d100+ village in the r112/r113/r120/r125
  series (previously 0/12). Per binding, dark-channel verdicts
  stay within-window only — the threshold is 2/4, and 1/4 does
  not meet it — but the survival signal moved: 1/4 past d100
  after 0/12, on the current master. Death shapes this panel:
  41502 sickness + d41 wild cluster x4 (0 alive d42); 41503
  monster attrition 12 + wild 5, scattered d69 with 2 alive;
  41504 wild wipe d35x5 + d36x3 (0 alive d37). No ≥3/day
  monster cluster anywhere; the wild, not monsters, wiped two
  villages in days.

## Village assessment, in plain words

Four villages, one survivor. 41501 lives the whole 140 days and
is still standing at the end with five people — Hattie, Fritz,
Francisco, Ruby, James, trust 46–90, 130 full conversations
(122 natural ends), 20 feasts, 3 moots — having buried 14 of its
own along the way, mostly to monsters. Its dark arc is short and
complete: a feud plot on day 7, a killing on day 8, a trial the
player sits on as juror, an acquittal. The other three villages
die young and differently: 41502 burns through a revenge pair
(hurt, then a killing, then two trials) before sickness and a
wild cluster finish it at day 42 with nobody left; 41503 bleeds
to monsters for two months and scatters at day 69 with two
people still standing; 41504 is eaten by the wild in two days
at the end of its first month. The social layer is loud in all
four (47–130 conversations, feasts and moots everywhere); the
villages underneath it still mostly don't last.

## Reachable / fun / winnable (leg 5)

- Reachable: bright layer fully reachable (conversations, feasts,
  moots, friendships in volume on every seed). Dark layer
  reachable in week one plus revenge echoes; every spring this
  panel surfaced through its case to the player as juror.
  Expired plots remain the unmeasured invisible kind — no
  expiries occurred to test.
- Fun: conversations read as real people (M4); villagers still
  refuse often (lures 3/3, party 11 declines); feuds escalate
  visibly and get tried.
- Winnable: not assessable on this leg's horizon — only one
  village lived long enough for the social layer to matter to a
  win, and M5's threshold still fails. The direction moved
  (first d100+ village in four panels), the verdict did not.

## Fixes this run

- **BLANK FILLED — ambush-murder victims now enter
  village.fallen (src/js/betrayal.js, simNpcAmbush killed
  branch).** r125 found it in the wild twice: 41501 Sari (d8)
  and 41502 Penelope (d11) were killed by NPC-NPC ambushes,
  got a telemetry death (cause 'ambush'), a corpse, a grief
  event, and a murder case — but NO village.fallen entry, while
  every other death path (monster, wild, sickness, wounds,
  combat, contest) pushes one. The village's own death record
  forgot its murder victims, and any census reading fallen
  undercounted dark-channel kills. Fix pushes
  { villagerId, day, cause: 'ambush', name } beside
  registerDeath. simNpcAmbush is the only caller of
  removeVillager('ambushed'), so it cannot double-count.
  Proof scripts/test-journey-social-r125-ambush-fallen.js:
  2/6 red pre-fix (victim leaves roster, no fallen entry),
  6/6 green post-fix. No [needs-eyes]: a death-record fix,
  not a feel/combat/UI change.
- **Driver fixes (no src/js):** monotonic timer via
  process.hrtime (r120's ms field was nonsense under the frozen
  harness clock; r125 panel times are real: 150s/60s/76s/35s),
  extended ambushLines filter ('stands accused', 'Word reaches
  you'), knownToPlayer on darkSnap cases, expired-plot
  npcPlotTick wrap (proven wired, 0 events this panel).

## Regression check

- test-journey-social-r125-ambush-fallen.js 6/6 (red pre-fix).
- test-journey-social-r110-moot-recall.js 8/8.
- test-betrayal.js fails identically to HEAD (pre-existing
  `Text is not defined` harness error in genCharacter/genRoster
  at setup, before any edited code runs — not caused here).
- `node scripts/check.js --quick` in the worktree: 279 passed,
  11 failed in 1563s (log at
  evidence/2026-11-04/journey-social-life-r125-checkquick.log).
  The 11 = the 6 standing families from r120 (measurement-proof-
  update, measurement-workflow, mobile-combat-cadence,
  occupation-panels, phone-frame-proof, establishment-r20-fixes)
  + 4 load-timeouts at check.js's 120s cap (trust-observer-
  neutrality, synergy-stall, throttlefeast, capable-bot — all
  green standalone after: 6/6, EXIT 0, 17/0, 40/0) + 1 flaky
  measurement-cache-flags. The flaky one was chased, not assumed:
  standalone it scored 1/3 with the fix, 3/1 on pristine base
  (stashed fix), then 4/4 with the fix on re-run — run-order /
  cache-state sensitive, failing on base too, so NOT a regression
  from this run; left for its owning measurement lane.
  test-betrayal.js's `Text` failure is the same pre-existing
  setup-time error as r120, before any edited code runs.

## Metric review (§14)

- M2c's corrected clause ("knownToPlayer or non-bystander role")
  is the right test — it matched the discovery event exactly
  (caseDiscoveryTick sets both plus the 'Word reaches you' line
  and a journal note) — but it needs escaped springs to bite.
  Next run: keep M2c, and if another panel yields 0 escaped
  springs, consider seeding an escaped-spring fixture rather
  than waiting on the 55% roll across short-lived villages.
- M2x needs a decline-heavy seed: expiry requires 5 unsprung
  days, and fast-springing panels cannot test it. Next run:
  either accept M2x as untestable on fast panels or run a
  targeted fixture (backdated plot + npcPlotTick) instead of
  another wild panel.
- M5's threshold (2/4) did its job again: 1/4 is movement, not
  a pass, and the note reports it that way. If the next panel
  also lands 1/4, the question becomes whether the guardrail
  threshold or the survival itself is the story — that is a
  next-run proposal, not a mid-run re-score.
- Telemetry check (closeout): ran against the social.json
  baseline plus the r125 per-seed JSONs with the correct l3.*
  keys — all five legacy keys LOUD-disappeared (bonds 318,
  deepBonds 168, betrayalCases 8, mootsConvened 7, gossipConvos
  99 → current 0), the same schema drift r112/r113/r120
  established: the social driver never emits l3.* fields, so
  the tool reads absence, not a game deviation. Baseline NOT
  rolled forward.

## Evidence

- evidence/2026-11-04/journey-social-life-r125-prereg.md
- evidence/2026-11-04/journey-social-life-r125-41501.json
- evidence/2026-11-04/journey-social-life-r125-41502.json
- evidence/2026-11-04/journey-social-life-r125-41503.json
- evidence/2026-11-04/journey-social-life-r125-41504.json
- evidence/2026-11-04/journey-social-life-r125-panel.log
- evidence/2026-11-04/journey-social-life-r125-analysis.txt
- evidence/2026-11-04/journey-social-life-r125-checkquick.log
- scripts/journey-social-life-r125-20261104.js
- scripts/analyze-journey-social-r125-20261104.js
- scripts/test-journey-social-r125-ambush-fallen.js
