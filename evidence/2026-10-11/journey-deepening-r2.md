# Journey leg: DEEPENING (days 40–80), run 2 — 2026-10-11

Complementary to this morning's deepening run (evidence/2026-10-11/journey-deepening.md).
That run used seeds 20261011/777/424242 on the PRE-contest-adaptation master.
This run re-tests on CURRENT master (534c9300 contest adaptation, 0d5385fa
contest-fear levers, c8ef3c18 pilot episode, plus the longsim wave-2 bar 5→4
lever in src/data/wave-ledger.json) with a contest-system focus.

## Method

Worker-adapted harness `scripts/test-journey-deepening-r2-20261011.js` (from
the r1 script): 3 new seeds 31337/90210/161803 + 1 fight-seeking variant
(FIGHTSEEK=1, seed 271828: wave-2s engaged aggressively, flee only when
genuinely outmatched). Same competent policy + leg extensions, text capture
on. New in r2: every contestChoose call logs the phase's options + the choice
taken, and each contest dumps a full transcript to
/tmp/journey-deep-r2-contest-<seed>-<n>.txt. Pilot detection per timeline
("PILOT EPISODE" announced / "pilot is LIVE" at the grab).

## Contest findings (vs the earlier run)

Earlier run: pilot episode unimplemented; 0 contest events in 3/6 timelines.

This run, on current master:

- **Pilot announced in 3/3 timelines** (c8ef3c18 works). 90210 played the full
  arc: announcement ("PILOT EPISODE — a test broadcast", "Pardon the jank",
  "Our first-ever contestants: ... We practiced the names") → grab-day
  "The pilot is LIVE" → contest played. **BUT 2/3 pilots never aired**:
  161803 (Blood Tithe) and 31337 (tidepool) were announced, then the player
  was EXILED overnight by a village moot ("We've carried you long enough" —
  11 for exile, 0 against), and at grab-day resolveContest the System said
  "The System was going to take You. There is no one left to take instead —
  the show is cancelled. The galaxy boos." **with eleven living villagers at
  Haven.** Root cause (verified): contestEligible() required a grid position;
  positions are render state cleared for NPCs off the player's node; an
  exiled player is off-node, so everyone read "unaccounted for" and the
  recast pool was empty. → **FIXED this run** (see Blank).
- **Contest counts days 14–80**: 31337: 2 (1 show + 1 fired/cancelled),
  90210: 10, 161803: 1 (fired/cancelled), 271828: 0. Still high-variance;
  the earlier run's "scheduling thin" blank stands, though 90210 shows the
  system CAN fire densely (pattern, pit ×2, moot, informant, 2 shows,
  ratings summons).
- **Played-not-RNG: YES, verified by transcript.** 90210's pilot (Pattern
  Hunger): 4 phases, real choices each ("Smell everything first" / "Trust
  the chat" / "The elegant sequence"), real consequences (6 damage, win,
  +4 showbiz fans, prize, −5 health, +4 trauma). Full transcript:
  hidden_files/journey-r2-20261011/contest-pilot-90210.txt.
- **Ratings summons soft-lock (harness-amplified, game-honest):** 90210's
  summons looped 2,401× on "Do the stunt" — the player was starving
  (<200 kcal), so contestChoose refused out loud every time ("You don't have
  the body for that... Eat first. The cameras wait.") and the modal never
  closed. The game is honest (refused aloud, no silent advance); a real
  player has "Phone it in"/"Refuse on camera". The harness's always-pick-[0]
  policy is what looped. Not a game bug; noted for harness policy (pick a
  non-blocked choice when blocked).

## Wave-3 gate (secondary question)

- **161803 UNLOCKED WAVE 3 on day 51** — with the standard competent policy
  (not the fight-seek variant). 4 wave-2 ledger points: giant_mosquito ×2
  (counter-kill mastery bonus), bright_idea, warranty_caller. The longsim
  wave-2 bar 5→4 lever (src/data/wave-ledger.json, 2026-10-11) is what makes
  this reachable — the earlier run's 0/6 was on the pre-lever master.
- **Fight-seek variant (271828): did NOT reach wave 3** — only 1 wave-2
  point by day 68 despite 10 fights and 0 assessment-flees. Aggression alone
  doesn't move the ledger; counter-kills and villager kills do.
- **Caveat: no wave-3 FIGHT was observed.** 161803 died day 61, ten days
  after unlock, before any wave-3 monster was encountered. The gate is
  reachable in-leg now; the encounter volume to actually FIGHT wave 3 in-leg
  is still thin. Spool/ToS/Redactor signature mechanics remain unfired in
  live play.

## Village assessment (plain words)

All four villages died out (days 58–68), honestly — starvation + combat, the
food thesis holding (pantries 28k–50k → 0):

- **31337 — the exiled village.** 12 → 1 (David, plumber, trust 1, steady,
  15 plants known) by day 62. Deaths: 1 monster, 1 lockjaw, 4 combat,
  1 wound, 1 starvation. The player was exiled day ~16 (schism moot); the
  pilot (tidepool) died with the exile. 10 fights, wave 2 only. 15 plants,
  9 skills, 7 monsters, 8 counters known.
- **90210 — the show village.** 12 → 1 (David, plumber, trust 0, lonely, 18
  plants) by day 58. Deaths: 4 combat, 1 starvation, 1 wound. Started the leg
  nearly pantry-empty (1.5k). The pilot played fully; 10 contest/show events
  — the richest contest timeline observed. 21 plants, 3 skills known.
- **161803 — the wave-3 village.** 12 → 0 by day 61. Deaths: 1 monster,
  3 combat, 1 sickness, 4 starvation. Exiled day 16 (pilot cancelled);
  wave 3 unlocked day 51 via villager + counter kills. 20 plants, 5 skills,
  9 monsters, 10 counters — the most knowledgeable village, and nobody left
  to teach.
- **271828 (fightseek) — the starved village.** 12 → 0 by day 68. Deaths:
  6 starvation, 4 combat, 1 expedition. The aggressive policy fought 10
  fights but starved the village (pantry 28k → 1.2k). No contests fired.

Who they were: plumbers, veterinarians, carpenters, street artists — distinct
people, trust 0–64, moods steady/lonely. The mantle passed until no bearer
remained. Villagers kill monsters on their own (hushwolf, union_rep,
bright_idea, giant_mosquito — all "villager combat" deaths).

## People check (transcripts read, not counted)

**Best — Chang-min's deflection (271828, day 45, ask_favor):** the player
teaches plants instead of giving food, then picks "Can't right now." Chang-min:
"No, yeah, of course. Forget I asked. They won't forget. They'll just stop
asking." The menu then offers "About what I asked before..." — the deflection
is REMEMBERED. A real want, a real consequence, a planted thread. This is the
bar.

**Worst — Emma's exhausted news (31337, day 50, share_news):** the first three
news items are good ("David... they're a plumber. Don't say I told you.";
"There's a real argument going about what to call that thing."; "The treeline,
this morning — something moved out there, big."). Then "Tell me more" stays
in the menu and produces FOUR consecutive deflections: "That's everything
I've got." / "That's the whole of it. Sorry." / "That's... pretty much all of
it, honestly." / "I wish there was more to tell. That's it." — a filler loop
the quality bar forbids. Also the opening leaks a stage direction: "About that
news they were bursting to share — Have you heard?"

**Recurring senselessness (both ask_favor transcripts):** the opening
contradicts itself — "Never mind the food they needed — we got it handled.
Thanks anyway." → immediately "My stomach's been empty so long I've stopped
feeling it... Help me get back on my feet." And the teach template repeats
verbatim 3× ("Their eyes widen. 'I never knew that.'"). Documented, not fixed
this run (conversation system is another loop's blank; this run's blank is
contest-side).

## Blank filled

**Exile collapses contest eligibility → pilot cancelled with "no one left to
take" while the village stands at Haven.**

- Fix (src/js/contests.js, contestEligible): the no-grid-position branch now
  consults npcNode() — the authoritative location, defaulting home to Haven —
  instead of raw nodePos. At-Haven-but-off-camera villagers are eligible
  ("The System doesn't need a grid square to take someone"); the genuinely
  away still read "away from Haven". The "unaccounted for" reason is gone.
- Proof: scripts/test-exile-eligibility-deepening-r2-20261011.js — 24/24
  (was 12/24 RED pre-fix: eligible empty, "no one left to take" said aloud).
  End-to-end: announced contest + overnight exile → grab day now recasts
  ("The show must go on — it takes X instead").
- Regressions: test-break-contests-r12 (34/34 — 2 assertions updated to the
  corrected behavior, old ones codified the render-state leak),
  test-contests.js 29/29, test-pilot-episode 45/45, test-contest-fear 21/21,
  r15 55/55, validate-ontology 72/72. test-break-contests.js 64/65 — the 1
  failure ("engine pays 2x stake") is pre-existing on pristine master,
  unrelated.
- Player-noticeable: yes — build-notes.json entry prepended (pruned to 15).

Blanks documented (not fixed): contest scheduling variance (0–10 events);
ratings-summons copy ("Eat first" implies an action the blocking modal
doesn't allow); ask_favor opening contradiction + teach-template ×3 repeats +
share_news 4× deflection loop; wave-3 encounter volume post-unlock.

## Verdict: reachable / fun / winnable

- **Reachable: IMPROVED.** Pilot episode — yes, announced 3/3, fully played
  1/3 (2/3 hit the exile bug, now fixed). Wave 3 — YES, unlocked in-leg
  (1/4, day 51, via the 5→4 lever + counter-kills); no wave-3 fight observed
  yet. Contests — present but high-variance (0–10).
- **Fun: YES, when it fires.** The pilot frame reads well ("We practiced the
  names"), Pattern Hunger is a real played contest, the exile-then-recast
  sequence is now dramatic instead of broken. The leg's problem remains
  absence, not quality.
- **Winnable: the leg resolves honestly.** 4/4 villages died days 58–68, all
  legible (starvation + combat). The endgame needs all 5 waves faced by
  ~day 100 — wave 3 unlocking day 51 keeps the pacing plausible, but wave-3
  encounter volume needs watching.

## Files

- Harness: scripts/test-journey-deepening-r2-20261011.js (seeds
  31337/90210/161803; FIGHTSEEK=1 variant; contest transcript capture;
  CXDUMP/INSPECT debug flags)
- Proof: scripts/test-exile-eligibility-deepening-r2-20261011.js (24/24)
- Fix: src/js/contests.js (contestEligible no-position branch)
- Test update: scripts/test-break-contests-r12-20261010.js (2 assertions)
- Build note: src/data/build-notes.json (prepended, 15 entries)
- Evidence: evidence/2026-10-11/journey-deepening-r2.md (this file)
- Preserved: goals/the-scattering-roguelite-survival-game/hidden_files/
  journey-r2-20261011/ (4 censuses, pilot transcript, 2 convo transcripts)
