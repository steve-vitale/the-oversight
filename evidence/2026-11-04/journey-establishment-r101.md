# Journey leg ESTABLISHMENT — r101 run note (2026-11-04, Lane A)

## Prereg
`evidence/2026-11-04/journey-establishment-r101-prereg.md` (committed
0750cf2e BEFORE any seed ran; two instrument corrections committed
dcf883f + 5764d5c before any panel scoring — see below). Driver
`scripts/journey-establishment-r101-20261104.js` (r99 clone + one
dawn teaching conversation per day, player-teaches only), analyzer
`scripts/analyze-journey-establishment-r101-20261104.js`. Seeds
1401–1404 (fresh band), competent policy, 42-iteration horizon
(scholar-day labels run 2–43; 1404 reaches 44 — see observations),
death-aware tail (10 all-dead days; never hit — no village went over).
Base: master 3f92c4d3d at branch time; branch `journey-establishment`
fast-forwarded to master before any work (no foreign commits carried:
branch HEAD == master after registration, verified).

## Leg question
r99 proved villagers teach each other in-window but left the player
side untested (teacher='player' lessons 0/4, because competent policy
never holds teaching conversations). This run asks: if the player
deliberately seeks a teaching conversation every dawn, can they teach
a villager a real skill — does the lesson land, read as a real
conversation, and ever get used or taught onward?

## Panel verdict (BINDING metrics)
- M1 PLAYER-TEACHES: **INTERESTING 4/4 — the verb is reachable, and
  it is not rare.** Player lessons per seed: 27/32/33/34 (126 total).
  Every single one verified twice: the learner's `npcKnowsSkill`
  flips False -> True at the lesson, and the telemetry
  `skill_lesson` row (teacher='player') matches the driver record on
  day, learner, and skill for all 126. Distinct learners 10/10/10/12
  per seed (telemetry names, not the driver's pre-acquaintance
  display placeholders); distinct skills 4/7/8/9. First lesson day 1 on all four
  seeds. The r99 zero was purely a policy artifact — a player who
  talks to people teaches from day one.
- M2 OFFER-RATE: lessons on 126 of 168 teaching days (75%).
  Remaining days: `nomenu` 34, `nocandidate` 8 (all on 1401). Zero
  menu-mismatches on the v3 driver: whenever the computation promised
  a teachable skill AND the convo reached a teach-capable menu, the
  offer appeared. The failures are navigation/state blocks, not
  fidelity bugs (see below).
- M3 GATE-CENSUS: **the binding constraint is the player's own skill
  pool, not trust or language.** The only `nocandidate` days are
  1401 d21–28, all `no-gap` for all 9 living villagers: by day 21 the
  player had taught everyone everything teachable they knew, and
  teaching only resumed (d29+) after the player learned new skills
  (haymaker, diplomat) through play. Trust <15 and shared-language
  failures never appear as the dominant gate on any day of the panel.
  The specialist economy breathes: teach -> exhaust -> learn more
  -> teach again.
- M4 SURVIVAL-42: **GO 4/4.** No village went over; alive at 42 on
  all four seeds (8/8/9/7 at day 40; 1404 ends at 8 after a joiner).
- M5 PANTRY-GUARDRAIL: **GO 3/4.** 1401/1402/1403 zero starvation
  deaths. 1404 NO-GO: two real thirst deaths (Aki d30, Ines d31)
  during a dry spell (pantry 5,203 at wave-3 arrival d29, 1,416 d30,
  200 d31, recovering to 1,000 d32) — the roster shrank 7 -> 6, then
  recovered to 8 by day 42. A genuine food/water failure inside a
  surviving village, not a scatter: the r99 scatter story (pantry
  zero -> walk-away) did not repeat on this panel.
- M6 PEOPLE: **PASS on all four lesson transcripts read in full**
  (one per seed, first lesson each). The pattern is human throughout:
  the NPC opens with a real question, the player's honest pass is
  accepted gracefully ("Understood. A quiet beat that isn't awkward
  — just room."), the subject change lands ("Forget I said anything.
  What did you want?"), the offer is plain ("I could show you Wound
  Care."), and the lesson beat is honest if templated ("You walk
  them through Wound Care, then let them try. Clumsy, then less so.
  'Huh. I can see how that'd keep me alive.'"). Caveat, stated not
  hidden: the lesson sentence is IDENTICAL for every skill — the
  beat is real but not skill-specific. That is polish, not a blank:
  nothing in the transcript is nonsensical, fabricated, or filler.
  End-of-run control convos (Paul comfort thread, Leonie fear
  thread) still read coherently after 42 dawn convos, so the
  intervention does not corrupt later conversation state.
- M7 ONWARD-USE (descriptive, NON-binding): **taught-onward 2/126**
  (Paul teaches gossip_network onward on 1401; Chester teaches
  herbal_medicine onward on 1402). Every lesson carries exactly one
  later `villager_skill` row for learner+skill — but that row is the
  track-level echo of the lesson itself (tracks.js emits
  `villager_skill` on grant), not proven independent use, so it is
  NOT claimed as use. Within 42 days, player-taught skills almost
  never propagate a second hop. That is a horizon limit, not a
  failure of M1: the first hop is the finding.

## Why the first two pilots lied (instrument corrections, pre-scoring)
- v1 checked only the OPENING menu: 42/42 'mismatch'. Wrong: the
  conversation suppresses pivots (including skill lessons) while a
  direct question hangs (`suppressPivot = reactiveQ || genericQ ||
  grief/cheer thread`, conversation.js:4628), and skill lessons also
  ride the subject menu. A real player answers, then changes subject.
- v2 navigated answers + subject but stopped at the first subject
  page and could not answer generic questions (`gq:*` menus have no
  `ans:` choice): 40 `nomenu` on 1401. Wrong again: subject menus
  paginate (`menu:more`), and `gq:yn`/`gq:open` questions must be
  answered before the menu opens.
- v3 (scored): answer `ans:*` (prefer honest_pass, vague, deflect)
  and `gq:*` (prefer unsure, honest_pass), take `dlg:subject`, page
  `menu:more` (max 4, repeat-menu guard), up to 14 turns, picking any
  `skill_teach:*` found. Betrayal case menus are NOT decided by the
  driver (a verdict is a story decision, not navigation). M1's bar
  never changed; only the search procedure changed, to match real
  play. v1/v2 pilots discarded from scoring; 1401 re-run on v3, so
  the whole panel shares one instrument.

## What blocks teaching on the 34 nomenu days (descriptive)
- Betrayal case menus (majority): the convo IS the case
  (accept/decline only, no subject choice). Teaching is unreachable
  while a villager's case hangs over the conversation — by design of
  the case modal, and the driver correctly refuses to decide it.
- Comfort/grief threads (1401 d13/d18, 1402 d28-type): subject pages
  cycle without any skill choice because `suppressPivot` holds on
  grief/cheer threads. Coherent, not a bug: you do not pivot a
  grieving person to a silver-tongue lesson. A player CAN teach
  that villager another day, when no grief thread is open.
- Favor/case subject menus that page through case options without
  ever reaching a teach-capable page (1402 d12/d14/d18/d25): the
  subject menu is occupied by the open case/favor. Same shape as
  above — open business crowds out teaching, it does not break it.

## Village assessment, in plain words
Four villages started with 12 people each. All four are still
standing at day 42 — the first establishment panel in this run
series with no scatter — and all four reached wave 3 (d25/d25/d25/
d29) and survived it, three of them wearing bark armor on arrival
day. Pantries end fat on two seeds (43,865; 39,698 kcal) and lean on
two (9,608; 8,375), and 1404's thirst episode is the panel's one
real food failure — but it bent the village without breaking it.
The new thing in these villages is not survival, it is the
classroom: the player taught wound care to people who then had it
(1402: 8 wound_care lessons), steady hands and tool-knapping to a
whole roster (1404), and gossip networks that then carried further
(1401/1402 onward hops). Villager-to-villager teaching continued
alongside (npcToNpc 32/9/33/26) —
the player joins an economy that was already running, and on 1402
the player is the majority teacher (32 of 41 lessons). Nobody on any
final roster was dead (rosterDead 0 on all four seeds); the 26–39
death records per seed are fight records, as in r99 (see telemetry).

## Contests (r99 metric-review rule applied)
Fired/ended per seed: 3/3, 7/7, 5/5, 4/5 (1404: one duplicate
`contest_end` row for the d19 tithe, ended twice on d21 — a
telemetry duplicate, not a second contest; the re-fired tithe d21
ended lost d23, and the last fired contest d29 ended won d31).
Under the corrected rule (exclude fired within 2 days of run end or
on the scatter day), ZERO stuck contests on any seed. No seed fired
zero contests.

## Telemetry deviation check (step 14)
Baseline: `telemetry-baselines/establishment.json` (r40 re-seed).
Per-seed JSONs carry derived `guardrails` + `c3` blocks (deaths /
aliveEnd / pantryKcalEnd / starvation count, computed from each
file's own fields, same shape as r85/r86/r99 — the tool reads 0s
without them, which produced false "newly appeared" LOUD lines on
the first attempt; the derivation step is recorded here, not hidden).
- LOUD: `guardrails.deaths` 41 -> 137 (+234%).
- Quiet: popAlive, pantryKcal, starvationDeaths.
- Verdict: same as r85/r86/r99, now on a fourth consecutive panel.
  NOT a village-mortality regression — rosterDead 0 on all four
  seeds, and 'villager combat' / expedition rows dominate every
  seed's death list, so most death records are fight records, not
  village deaths. **Baseline NOT rolled forward** in this run; four
  consecutive panels at this level strengthen the case for a re-seed
  at the next baseline review, but that roll needs its own regime
  note (per the baselines NOTES.md) and is not done silently here.

## Metric review (for the NEXT run, not this one)
- The `usedRows` onward-use instrument counts the lesson's own
  track echo (tracks.js `villager_skill` on grant). A real
  independent-use instrument must exclude rows on the lesson day
  itself, or require the skill to fire in a fight/craft row.
  M7's 2/126 taught-onward figure stands; the 1-each usedRows do
  not stand as use.
- Scholar-day labels skip and repeat (1404: jumps 3->5, 9->11,
  repeats 9->9, 12->12, 21->21, 27->27): "day 42" in this run means
  42 driver iterations, and scholar-day labels are not a clean
  1..42 sequence. `aliveAt40` still resolves (a day-40 entry exists
  on all seeds), but any future metric that counts days between
  scholar-day labels must handle skips/repeats. Pre-existing
  harness/day-count behavior, not caused by the teaching
  intervention — flagged here, not fixed here.
- Census `equipped` first-row duplication (r99) and census `skills`
  null (r99) both still hold; neither was relied on this run.

## Reachable / fun / winnable (establishment)
- Reachable: YES — decisively for teaching. A player who talks to
  people teaches from day one, across 4–9 skills per village, with
  the menu honestly offering the verb once questions are answered
  and subjects changed. The two genuine blocks (open case, grief
  thread) read as the conversation having other business, not as
  the verb being missing.
- Fun: YES — the lesson beat lands ("Clumsy, then less so"), the
  honest-pass answers are gracefully received, and the teach ->
  exhaust -> learn-more -> teach-again rhythm gives the player a
  visible reason to keep learning skills themselves. The identical
  lesson sentence for every skill is the one flat note.
- Winnable: PARTIAL, same shape as r99 but healthier — survival,
  wave progression, contests, and now player teaching all work
  in-window, and no village scattered this panel. The remaining
  establishment risk is the one 1404 showed: a dry spell that kills
  two people to thirst while the village still stands. Food/water
  remains the binding constraint; teaching is not.

## Files
- Driver: `scripts/journey-establishment-r101-20261104.js` (v3 scored)
- Analyzer: `scripts/analyze-journey-establishment-r101-20261104.js`
- Prereg + per-seed JSON + convos:
  `evidence/2026-11-04/journey-establishment-r101-*`
- Analyzer output: goal hidden_files/r101-analyzer-full.log
  (bookkeeping; the /tmp copy is the same output)

## Status
Tooling + evidence only; NO src/js change. To be committed via
safe-commit in the worktree, merged --ff-only locally, pending ship.

## Infra incidents (disclosed, not hidden)
- safe-commit index clobber struck on all three commits (prereg,
  v2, v3): committed files shown deleted/modified + untracked, or
  index stuck on prior blobs, while worktree == HEAD in every case.
  Repaired each time via HEAD-blob cacheinfo, verified with status
  empty + diff HEAD empty + hash-object matches. The commits
  themselves were correct.
- Analyzer first run truncated by SIGPIPE (`| head -100` closed the
  pipe mid-1403); re-ran cleanly to a file (212 lines, exit 0) and
  judged only on the full output.
- check.js --quick (`--cacheDirectory=/tmp/jest-cache-playtest`):
  **279 passed, 11 failed in 1502s.** The 11 = r96–r99's standing 6
  (godpath/test-measurement-proof-update, test-measurement-workflow,
  test-mobile-combat-cadence, test-occupation-panels,
  test-phone-frame-proof, test-establishment-r20-fixes-20261020) +
  2 load flakes + 3× 120s timeouts (test-solo-campaign-endings,
  test-time-save-crashes, test-capable-bot-20261014 — the same
  timeout class r97/r99 showed under sibling load). Both flakes
  re-run solo GREEN: test-measurement-cache-flags 4/4,
  test-trust-observer-neutrality 6/6. This run changed zero src/js,
  so none of the 11 can be regressions of r101's files. Full log:
  goal hidden_files/r101-check-quick.log (bookkeeping).
- Heartbeat loop died mid-run (original loop pid gone; beats stopped
  after the 23:11:33Z manual beat while a sibling reaper pass held
  REGISTRY.lock from 23:19); a manual beat landed 23:29:42Z once the
  lock freed, and a fresh loop was started (first beat 23:32:16Z,
  verified in the registry). The tree was dirty throughout, so the
  reaper could not have removed it in any case. Recorded here so
  the next run's overlap guard is not surprised by the stale window.
