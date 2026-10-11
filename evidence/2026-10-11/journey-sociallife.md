# Journey leg: SOCIAL LIFE (across full runs) — 2026-10-11

Worktree `journey-sociallife`, branch `journey-sociallife` (base 7a10a395).
Harness: `scripts/test-journey-sociallife-20261011.js` (worker-built) — full
production script list, mulberry32 seeded BEFORE eval, competent policy
(`scripts/policies/competent.js`) + social overlay: 2 conversations/day
(engage-first, run to natural end), talk requests prioritized, open favor
obligations fulfilled with real deeds (giveFood / heal / water / social),
moot votes cast with the evidence, gossip followed. Full transcripts saved
per conversation to /tmp (ephemeral).

Canon read first: CANON.md, CONVERSATIONS.md, PARTY.md, DIRECTIVES.md,
evidence/2026-10-11/convo-rebuild.md, evidence/2026-10-11/journey-deepening.md.

## Method

Two full harness passes × 3 seeds (20261011, 777, 424242), day 1 → death or
180:
- **Pass 1** (pre-fix baseline for the favor system): 48–70 days, 297 convos.
- **Pass 2** (with the favor-followup menu fix): 50–63 days, 293 convos.
- **Pass 3** (all fixes, 1 seed × 60d validation): running at commit time.

Every run died before day 70 (see verdict). Sense-reading: full transcripts
judged for MEANING per Steve's bar (NPC wants something real; options
engage/deflect; endings resolve/plant/owe; no fabricated history, filler
loops, static menus).

## Village assessment (plain words)

**Seed 20261011 — the starved village.** 12 → 0 by day 63. Trust climbed
16.6 → ~39 by day 14 (two conversations a day works), then famine set in:
4 starved, 10+ fell fighting monsters (blow-by-blow field fights — the
village fought back, killing 5 monsters itself). The player starved at the
end (kcal 0, hydration 0 for days). David the plumber — 32 conversations, a
kept water-haul promise, trust 90 on day 66 — watched the village die around
him. The takes/gives ledger did its honest work: a starving player taking
from an empty pantry cratered trust 90 → 1 in the last days. Theft allowed,
socially punished — the system working as designed.

**Seed 777 — the mauled village.** 12 → ~2 by day 50. 13 combat deaths
(monster wave pressure), 1 monster kill outright. Lena (ER nurse, trust 35,
20 conversations) and David (trust 1, 10 conversations) outlived everyone.
The village never recovered from the day-23/24 bloodbath (5 dead in two
days).

**Seed 424242 — the ground-down village.** 12 → ~5 by day 58. 8 combat
deaths, 3 starvation, 6 monsters slain by villagers. Trust actually ROSE
17.7 → 31.8 — the survivors were the ones the player invested in.

Who they were: plumbers, ER nurses, pharmacists, beekeepers, exterminators,
carpenters, morticians, bush pilots — distinct people, trust 1–90, moods
steady/grieving/scared. Nobody led formally (no leadership challenge fired
in any run). The miserable: the grieving (Hattie, Lena — mourning threads
fired and read true), the scared (David, day-50 777). What's missing: any
rivalry content (no rivalries formed — the policy was kind), any romance
(none observed), any moot (zero in ~175 village-days — see blanks).

## People check (transcripts read, not counted)

**The good — genuinely human:**
- Vikram (pharmacist, prickly, trust 47) asks "So what's your plan here?
  Just... get through it?" → player: "One day at a time." → "Practical view:
  Honest. I can work with honest." Then real gossip: "Did you hear? Ursula
  just walked away from Haven. Didn't look back." The gossip was TRUE
  (Ursula left). Questions, answers, gossip — all alive.
- Hattie (beekeeper, warm, grieving, trust 80): "Stay near tonight? Please.
  Would you stay close?" → commit → "Thank you. Just knowing you're there —
  it helps." Mourning: "Grief doesn't schedule itself. It just shows up at
  dinner." / "I check the treeline every hour. It doesn't bring anyone back.
  It just keeps my hands from shaking." / "We bury, we grieve, we keep
  going. There's no step four."
- Tamika (mortician, intense): "We're down to 4 liters of clean water." —
  favors name real, live needs (cistern liters are real state).
- NPCs ask the player questions and remember answers (David: 6 answered —
  q_regret, q_fun, q_alone_time, q_origin — referenced later).
- Zero verbatim NPC repeats in 293 pass-2 conversations (totalDupes: 0).
- Zero fabricated history, zero "(last time)" leaks.

**The broken bits → fixed this run:**

1. **Favor-followup menu hijack (structural).** An uncommitted favor ask
   ('asked' state) resurfaced via seed: "About the pantry run — still need
   hands. Are you in?" The want def's opener set stage=2 ("menu goes straight
   to commit/deflect"), but startConvo's generic-Q classifier re-classified
   the trailing "Are you in?" as a fresh yes/no question, suppressing the
   want menu. The menu was gq:yn:* only — answering "Yes." did NOT commit;
   the favor stayed 'asked' and re-seeded for 60+ days ("still need hands?"
   from 5 villagers, dozens of times). Fix: when the opener came from the
   live want def at stage ≥ 2 and the def supplies its own menu options, the
   want def OWNS the question — skip reactive/generic-Q classification.
   Fresh-ask flow (stage 0/1) untouched. Proof:
   `scripts/test-soc-favor-followup-20261011.js` — 14/14 × 3 seeds
   (before: followup menu = gq:yn only, no commit; after: dlg:commit +
   dlg:cant, commit → promised + tracked obligation). Live transcripts
   confirm: "About the creek water run — I hate to ask twice, but it's
   still open. Will you?" → [dlg:commit] "I'll do it." → promised.

2. **Re-ask verbatim loop.** The 'asked' followup was one template for every
   villager, every time. Now 4 cycling variants via convoPickCycle, all
   leading with "About {short}" (seed-prefix safe — the opener wraps
   non-"About"-leading lines, which produced "About the help they asked you
   for — That the pantry run — ..." in the first draft; caught by the proof
   test, fixed). Covered in the same proof script.

3. **Topic-thread exhaustion repeat (structural).** The mourning 'lately'
   thread holds exactly one line per level (cope/next/part). Past
   exhaustion, three stacked failures produced "My part? I remember them.
   Someone has to do it properly." ×3 on the PLAYER-VISIBLE surface while
   the transcript ledger stayed clean: (a) topic2Beat's index clamp
   re-served the last level, (b) t2pick's `|| pool[0]` fallback defeated the
   no-repeat ledger, (c) the dlg:more/dlg:react handlers returned the
   composed line even when sayLine blocked it (null). Fixes: topic2Beat
   returns null when opener + one beat per level are consumed
   (topic2HasMore's contract); both handlers treat a sayLine block as dry —
   honest admission ("I wish there was more to tell. That's it."), menu
   retires "tell me more". Proof:
   `scripts/test-soc-thread-exhaustion-20261011.js` — 4/4 × 3 seeds
   (before: 3 verbatim repeats on screen, no dry admission; after: 3 beats,
   dry admission, menu retires).

4. **Decided-want "can't" filler loop (menu hygiene).** After deflecting a
   favor, the want menu correctly empties (stage 3) — but the generic beat
   pool kept offering "Can't right now". One transcript shows 7 consecutive
   "Can't right now." picks cycling 2 lines ("No — it's fine. I shouldn't
   have asked." ×4) after the refusal was already spoken. Fix
   (`convo-beats.js`): symmetric with the existing defect-6 retirement of
   "How can I help?" once the want is engaged — the generic dlg:cant now
   retires once the want is decided (stage ≥ 3). Backing out of a real open
   promise keeps its honest verb (dlg:renounce on the repay want). Proof:
   TEST 6 in `scripts/test-soc-favor-followup-20261011.js` — deflect →
   resolution 'deflected', dlg:cant absent from the menu (17/17 × 3 seeds).
   This path change exposed a test-strictness gap in
   test-convo-beats-20261006.js: on generic-Q turns the question owns the
   menu BY DESIGN (beat matrix bypassed), and the engagement reply is the
   bare 'more' id (gated on the thread honestly having more). The test's
   news-beat assertion now accepts 'more' alongside 'dlg:more'/'dlg:react' —
   a correction, not a weakening (43/0).

## Blanks documented (not fixed this run)

1. **Moots never fire in peaceful play.** ~175 village-days, 0 justice cases,
   0 moots, 0 player votes. The moot machinery (callMoot, castPlayerVote) is
   real but crime-gated; competent honest play never triggers it. A social
   leg with no moots is a leg with its headline beat unfired. Recommend: the
   long-sim loop should run a larceny/betrayal-leaning policy to exercise
   the moot path, or seed an NPC crime wave. (Break-it covered moots
   adversarially; natural-play coverage is the gap.)
2. **No rivalries, no romances observed.** The policy was uniformly kind.
   Rivalry/friendship arcs need a mixed policy (or longer-lived villages) to
   sense-test. Left for a future run.
3. **The rebuild's own proof tests decayed.** test-convo-engine-day1 (10/2)
   and test-convo-engine-trust (5/2) fail identically on clean HEAD —
   seed-fragile after the favor-system rebase shifted the RNG stream
   (commit 75b9d9d3 notes the same for the gossip proof test). Not caused by
   this run's changes; needs a re-baseline by the convo owner. Do NOT
   weaken — re-baseline against current master.
4. **dialog-phase2 "alive:memory routes"** fails on clean HEAD too
   (pre-existing). test-convo-mood and test-convo-coherence-choices throw on
   clean HEAD (incomplete module lists — noted in the rebuild evidence).
5. **Voice closers on question lines.** "Are you in? You know?" /
   "Are you in? — ask anyone!" / "Are you in? Not that it matters." — the
   voiceLine closer pool appends after '?' lines. Minor; left alone (broad
   voice-behavior change needs its own proof).
6. **Teach reaction template.** "Their eyes widen. 'I never knew that.'" is
   one template per teach; 3 teaches in a conversation reads robotic.
   Cosmetic; noted.
7. **Runs die ~day 50–70.** 6/6 timelines (both passes) ended in village
   death by day 70 — famine + monster pressure. Matches the deepening leg's
   finding (5/6 dead by day 65). The social content that needs a living
   village past day 70 (deep friendships, succession, late arcs) is
   unreachable at competent-play survival rates. This is the pacing question
   for the long-sim loop, not this leg.

## Verdict: reachable / fun / winnable

- **Reachable: YES for the core, NO for the headline beats.** Conversations,
  favors, promises, gossip, grief, NPC questions — all fire naturally and
  read human. Moots, rivalries, romances — unfired in 6 timelines.
- **Fun: YES.** The trust-40+ conversations are the game's best content
  (Vikram's interrogation, Hattie's grief, Tamika's water math). The fixed
  favor loop now resolves instead of nagging. The mourning thread now ends
  honestly instead of looping.
- **Winnable: the leg resolves honestly, but the village doesn't survive
  it.** Every timeline ended in death by day 70 — legible deaths (famine,
  monster pressure), and the social systems behaved truthfully throughout
  (trust crashed when the player stole from a starving pantry; grief fired
  when people died). A real player CAN reach this content — it's the first
  60 days where the social game already lives.

## Files

- Harness: `scripts/test-journey-sociallife-20261011.js` (worker-built)
- Proof: `scripts/test-soc-favor-followup-20261011.js` (17/17 × 3 seeds)
- Proof: `scripts/test-soc-thread-exhaustion-20261011.js` (4/4 × 3 seeds)
- Test correction: `scripts/test-convo-beats-20261006.js` (bare 'more'
  accepted on question-owned menus — 43/0)
- Fixes: `src/js/conversation.js` (want-owned question), `src/js/convo-wants.js`
  (re-ask variants), `src/js/convoTopics.js` (topic2Beat exhaustion),
  `src/js/convo-dialogue.js` (sayLine-block respect in dlg:more/dlg:react),
  `src/js/convo-beats.js` (generic cant retires on decided want)
- Transcripts: /tmp/journey-soc-transcript-*.txt (ephemeral, ~290 files)
- Censuses: /tmp/journey-soc-census-{20261011,777,424242}.json (ephemeral)

## Regressions

- dialog-coherence 37/37, dialog-gating ALL GREEN, dialog-grammar 39/39,
  dialog-layout 26/26, dialog-leakfix ALL GREEN, dialog-stream 43/43,
  dialog-phase1 56/56, convo-beats 43/43 (with the test correction above),
  convo-engine-taught 8/8, favor-system 30/30, establishment-fixes 75/75.
- Pre-existing failures (identical on clean HEAD, not this run):
  convo-engine-day1 10/2, convo-engine-trust 5/2 (RNG-shift seed fragility),
  dialog-phase2 34/1 (alive:memory routes), test-convo-mood +
  test-convo-coherence-choices (throw — incomplete module lists).
