# Journey social r12 — the long-tail recalls (2026-10-13)

**Pre-register:**
- QUESTION: r11 added answer-specific `recalls` to the 11 most-asked of the
  28 ask-and-forget questions (19/36 recall-bearing). Do the remaining 17
  long-tail questions get recalls of equal quality — do they fire in natural
  play, match the answer, stay silent on opt-outs?
- INTERESTING FINDING would be: a tail question never firing in natural play
  (dead content), a recall misquoting the player's answer, or an opt-out firing.
- SEEDS: 505/606/707 (r10/r11's seeds, comparability) x DAYCAP=60, death-aware.
- POLICY: socialite + one full driveOne convo per villager per day (r9/r10/r11
  pattern). Driver answers every bespoke question with the first non-opt-out
  answer.

## Fix 1 (data only): recalls for the last 17 questions

- `src/data/characterGen.json`: answer-specific `recalls` maps spliced into
  all 17 remaining no-recall questions (q_first_memory 27 asks down to
  q_name_day 19 in the r11 probe): q_first_memory, q_song, q_change, q_useful,
  q_dream, q_fun, q_system_fear, q_kindness, q_guilty, q_regret, q_hope,
  q_before_skill, q_left_behind, q_believe, q_stay, q_teach_me, q_name_day.
  Opt-out answers (`honest_opt_out`) get NO recall entry. Pure-addition splice
  (94 insertions; the 17 "deletions" are `follow` lines gaining a comma, same
  as r11). The r10 generalized recall loop in conversation.js needed no changes.
- Proof test `scripts/test-qrecall-r12-20261013.js`: RED on pristine (43/43
  answer cases: no recall thread), GREEN after (43 answer-matched + 8
  opt-out/no-recall cases silent).
- r10 `test-qrecall-canon` + r11 `test-qrecall-r11` still ALL GREEN. One r11
  control retired: its `['q_useful','a_hunger']` "no-recall question stays
  silent" control is obsolete now that r12 adds recalls to q_useful (replaced
  with a comment; covered by the r12 test).
- Tooling: `scripts/apply-r12-recalls.py` (splice; same brace-matcher pattern),
  `scripts/journey-social-r12-pilot-20261013.js` (pilot; adapted from r11's).

## Pilot results (3 seeds x 60d, post-fix data)

| seed | game-days | alive | asked | answered | recall hits | new-17 hits |
|------|-----------|-------|-------|----------|-------------|-------------|
| 505 | 35 | 14 | 355 | 355 | 192 | 90 |
| 606 | 49 | 7 | 218 | 218 | 106 | 49 |
| 707 | 30 | 10 | 211 | 211 | 117 | 55 |

- **All 17 new questions fired in natural play** (194/194 hits; q_stay 9,
  q_guilty 12, q_regret 14 — even the minTrust 35–45 gated ones).
- **0 answer mismatches, 0 without record** across all 194 hits — every recall
  matched the words the player actually said.
- **All 36 bespoke questions are now recall-bearing.** The
  docs/CONVERSATIONS.md "answers are remembered and referenced later" promise
  holds for every question in the picker.

## Sense reads (full transcripts)

- q_guilty/a_tell (Ethan d9): *"You said yes — the worst thing. You didn't
  want to get into what. I won't ask. Just — are you carrying it any
  lighter?"* — the heavy answer gets a heavy, respectful memory; no probing.
- q_left_behind/a_yes: *"You said yes — you left someone behind. I never asked
  who. I won't. But I'm still here, asking nothing, if that helps."* — no
  invented name, no invented history.
- q_stay/a_tell: *"You said you're staying — you didn't expect to say it, but
  you said it. Still true?"* — echoes the player's own surprise.
- q_regret/a_tell (Khalwale d9): *"You said there was something you needed to
  say, to someone, and now you can't. Found another way to say it yet?"*
- q_name_day/a_count (Waimarie d9): *"You said you count the days — someone
  has to. What's the count today? Still keeping it?"*
- Note: my first transcript dump mislabeled speakers (the driver writes who
  as the literal strings 'YOU'/'NPC'); the raw data was always correct.
- Pre-existing wart spotted, not chased: the engine's thread-recap line
  ("We started on Who's on your mind around here?...") leaks the internal
  topic title into NPC speech; choice-label echoes from the driver already
  known from r11. Candidate for a future pass.

## Fix 2 (r11 watch item 4 — conflicts outliving dead parties): DOCUMENTED, engine already correct

- r10/r11 censuses listed "active conflicts" with a dead party (Adaeze x
  Carlos). Investigation: `socialSimmer()` already resolves dead-party
  conflicts (weirdness hunt 2026-10-10 — resolve + tension 0 + grief journal
  trace); `conversation.js` skips resolved conflicts; `mediateConflict`
  refuses them. The census PRINTER was listing resolved conflicts as
  "active" — a tooling label artifact, not a game bug.
- Verified with `scripts/test-conflict-deadparty-20261013.js` (ALL GREEN:
  resolved by simmer, tension 0, grief trace written, mediation refused).
- Small hygiene fixes, behavior-identical: `betrayal.js` grievanceBetween now
  skips resolved conflicts (all resolve paths already zero tension), and the
  census printer filters resolved conflicts, reporting "laid to rest" count
  instead.

## Village assessment (census, seed 505 socialite, d60 scatter)

Village scattered by d60, 10 fallen: 4 monster, 6 combat. Pantry held 24,150
kcal — the food-secure bleed-out pattern from r11 repeats (combat-balance
territory, loop B's claim, noted not touched). Fallen: Carlos d23, Khalwale
d26, Adaeze d38, Hazel d42, Deirdre d49, Ethan+Jovan d52, Waimarie d56,
Raj d59, Lena d60. One resolved conflict properly laid to rest.

## Telemetry

1 LOUD line vs baseline, investigated and EXPLAINED:
- `qa.recallHits` 183 -> 415 (+127%): the feature — 17 more recall-bearing
  questions (19 -> 36). No bug indicated.
- askedTotal 667->784, answeredTotal 667->784, end.day 124->114,
  end.alive 24->31 — all within quiet bands.
Baseline rolled forward (telemetry-baselines/social.json).

## Verdicts

- **Blank: FILLED.** All 36 bespoke questions now have answer-specific recalls;
  the "referenced later" doc promise holds universally. Second blank
  (dead-party conflicts) documented: engine was already correct, tooling
  label fixed.
- **People check: PASS.** 6 full recall arcs sense-read; zero
  fabricated-history, zero opt-out fires, zero answer mismatches. Heavy
  answers (guilt, regret, left-behind) get heavy, respectful memories.
- **Reachable:** yes — all 17 fired in natural 60d play, including the
  minTrust 40–45 gated ones.
- **Fun:** yes — "they remembered" now covers every conversation question;
  the mechanic's weight through social cohesion (r11's butterfly-effect
  observation) stands.
- **Winnable:** n/a for the social leg; recalls gate nothing.

## Watch items

1. Topic-title leakage into NPC speech ("We started on Who's on your mind
   around here?...") — pre-existing, minor; future social pass.
2. Food-secure combat bleed-out repeats across r11/r12 censuses — loop B's
   combat-balance axis; noted, not touched.
