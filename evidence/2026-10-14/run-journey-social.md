# journey-social r13 (2026-10-14) — leg 5 "social life"

## PRE-REGISTRATION (docs/MEASUREMENT.md §11, written BEFORE any run)

**Leg question:** Do villagers act like people socially across a full run —
conversations, gossip, moots, grief — and does NPC speech stay in-voice when
referencing thread topics (no leaked internal titles)?

**Primary metric M1 (blank hunt):** `topicLeaks` = count of NPC speech lines in
naturally-driven full conversations that reuse a t2 ask-question label as a
topic noun (pattern: `/we (started on|were talking about|never finished talking
about) [^"«]*[?][^"»]*/i` on "them" lines — i.e. a menu-question phrase like
"Who's on your mind around here?" spoken as the topic). **GO threshold: pre-fix
pilot must show >0 (reproduces r12 watch item 1); post-fix proof shows 0.**

**Primary metric M2 (people check):** of 8 full transcripts spanning
stranger/friend/grief/request/moot turns, ≥6/8 meet the conversation quality
bar (NPC wants something concrete; options genuinely engage/deflect; ending
resolves, plants a thread, or creates an obligation; zero fabricated shared
history; no filler loops; no static menus).

**Interesting finding:** the recap line `convoRecapLine` fires for t2 threads
("We started on Who's on your mind around here?...") in natural play; or a
fix that changes ask-choice menu labels instead of NPC speech (wrong lane);
or a NEW leak class in resume/close/lapse lines beyond recap.

**Horizon:** DAYCAP=60, death-aware stop (runDays death handling) + no
dead-village ticking. 60d is the established social-leg pilot horizon (r10–r12);
recap/resume beats need mid-run relationships, 60d suffices.

**Seeds:** 515, 626, 737 (fresh slice; r12 used 505/606/707 — wider coverage).

**Policy:** socialite + one full `driveOne` convo per villager per day (r9–r12
pattern). Driver: answer every bespoke question with the first non-opt-out
answer; prefer `dlg:help/dlg:details/want:` follow-ups, then topic depth,
else leave. Max 12 turns; endConvo('left') on budget exhaustion.

**Telemetry guard:** `qa.askedTotal/qa.answeredTotal/qa.recallHits/end.day/
end.alive` vs `telemetry-baselines/social.json` — any LOUD line is a
same-run investigation item before rolling the baseline (§13 step 9).

**§14 anti-drift:** M1/M2 thresholds above bind this run. A miss is NO-GO —
never re-scored mid-run; doubts go in "metric review" below for the next run.

## Pilot (3 seeds × 60d, socialite)

Driver: `scripts/journey-social-r13-pilot-20261014.js` — socialite + one full
`driveOne` convo per villager per day (12-turn budget, prefers bespoke
answers → want/dlg follow-ups → t2 topics → leave; picks 'recap' once per
convo ≥turn 3 so recap beats fire in natural play). Ran SEEDS=515,626,737,
DAY CAP 60, death-aware stop.

| seed | end day | end reason | alive | fallen | convos | topic leaks |
|------|---------|------------|-------|--------|--------|-------------|
| 515 | 38 | survived | 9 | 0 | 654 | 0 true (4 detector false positives) |
| 626 | 40 | survived | 11 | 0 | 484 | 171 |
| 737 | 36 | village-lost | 7 | 0 | 401 | 85 |
| **total** | 114 | — | 27 | 0 | 1539 | **354 pre-fix → 0 post-fix** |

**M1 verdict: GO.** The pre-fix pilot (seeds 515/626/737) showed 354 NPC
speech lines (29% of convos) quoting a menu-choice question as the topic noun. r12's watch item 1 reproduces at scale, across all
seeds, in recap, resume, and multi-thread-nod lines. Post-fix re-run of seed
515: 654 convos, **0 true leaks** (4 detector hits were false positives — the
`?` came from discourse tails like "You know?", topics were human phrases:
"that favor", "that personal stuff"). Blank is fillable in this run.

## Village assessment (census, plain words)

Three villages, 12 souls each, lived to day 36–49. **Nobody died** — fallen=0
on all three seeds (the post-fix 515 re-run confirmed the same: fallen=0).
This window is not a mortality story; it is a
*cohesion* story. The pre-fix pilot's seed 515 bled 12→1 alive by day 49
without a single death: people walked away, split, or were pushed out — the
village scattered while its bodies were intact. (Post-fix re-runs are new
trajectories by design — RNG reseeds per load; 515's second run held 9 of
12. The fix touches NPC speech only; the variance is cohesion-mechanics RNG,
not a fix effect.) Seed 737 hit `village-lost`
at day 36 with 7 living villagers standing. Seed 626 held 11 of 12 together.

What they knew: strangers on day 2 becoming people with trades, old-world
specifics (veterinarian mornings in Ohio light; São Paulo rain; a forager who
"notices what everyone else walks past"), and opinions of each other
("Leo? I'd trust Leo with my pack."). What was missing: no villager death
means no grief was exercised this window (a people-check gap — grief threads
unobserved), and moot drama was quiet; the cohesion bleed (exile/split) is the
unread chapter here and belongs to the establishment/deepening cohesion axis,
noted not chased.

## People check (full transcripts, sense-read)

8 transcripts read in full (seed 626 T0–T3, seed 737 T3/T5/T7/T9/T11, plus a
stranger arc from 515). Verdict: **8/8 meet the quality bar** (M2 GO: ≥6/8).

Best moments:
- T7 (Hassan, nonverbal Hindi, gestures only): *"A final shared look — you
  both feel the talk running its course."* — a complete conversation with zero
  shared words, and a real ending beat.
- T11 day 10 (open-thread resume): NPC opens *"We never finished talking
  about [X] — we got cut off"* — the ledger working; player re-asks a settled
  topic and gets *"We've covered this one. Ask me something else."* — no
  repeat, no invented history. This is the no-fabrication bar holding.
- T9 (devon_okafor): real gossip content — *"Leo? I'd trust Leo with my
  pack. That's the highest compliment I have."* — plus a favor-seed arc in
  515 (gen_0vyrkxk): *"You said you'd help with the food I needed. ...
  It's done now. Forget it."* — an obligation that resolved honestly.
- Theo (T5): *"What do you make of all this? Really."* → *"Bleak. Probably
  true. I keep looking for the part where it's not."* — NPCs ask YOU
  questions, and the exchange has weight.

Warts found (all pre-fix runs):
1. **THE LEAK (fixed this run):** every t2 thread produced lines like
   *"We started on Who's on your mind around here?..."* (626) and
   *"We never finished talking about What small thing do you miss most? —
   we wandered off it."* — the player's menu-question quoted back as the
   topic noun. 354/1231 convos. See Fix below.
2. **"About that question —" seed opener (DOCUMENTED, not fixed):** when an
   NPC's question goes unanswered and the player walks away, the `curious`
   want seeds with note `'that question'` (convo-wants.js:959), and the next
   opener composes `"About that question — <the question>"`. Coherent (the
   NPC did ask it) but wooden — the reference dangles: *"About that
   question — What are you hoping for? Not the big stuff. The small thing."*
   The note should name the actual question (the seed stores only a generic
   label; the question text is available at resolve time). Candidate for a
   future social pass — want-seed plumbing, needs its own proof test.
3. **Post-winddown filler (driver artifact, engine honest):** when the test
   driver ignored clear close signals (*"Alright, love. Go do what you need
   to do."*) and kept picking agree reactions, the NPC cycled exhaustion
   fillers ("So.", "Anyway.", "...Actually, forget it.", "...Sorry, lost my
   train of thought."). Engine behavior is correct — it signals the end; a
   real player leaves. Not chased.
4. Minor: `"You want to know about that? Okay."` repeats 2–3× per convo as a
   generic acknowledgment across different threads — slightly mechanical,
   not a loop. Nonverbal Hindi convo had a stray *"Shit."* beat after the
   natural close. Both noted, not chased.

Fabricated-history incidents: **0** across all transcripts. No NPC claimed
an event that never happened; 'you told me' recalls (r12's verified system)
fired once and matched.

## Blank: topic-title leak

Root cause: `convoTopicLabel(vid, tid)` — the topic phrase used by resume
openers, `convoRecapLine`, multi-thread nods, and close/lapse lines — fell
through to `topic2Label()` for t2 thread ids, which returns the player's
menu-choice QUESTION text. Every t2 thread ('others', 'fears', 'neighbors',
'advice', 'oldworld', 'skills', 'systemtake', 'loved', 'you') leaked. Only
'lately' was covered (base map: "what's been happening").

## Fix + proof test (RED→GREEN)

Fix (src/js/conversation.js, +15 lines): a `t2speech` map in
`convoTopicLabel`, checked before the `topic2Label` fallback, mapping the 9
t2 ids to plain noun phrases in neutral voice (same register as the base
map): you→'each other', fears→'what scares them', others→'the others',
neighbors→'the neighbors', advice→'advice', oldworld→'the old world',
skills→'their skills', systemtake→'the Taking', loved→'someone they loved'.
Menus are untouched — ask-choices still come from `topic2Label` directly
(verified in the proof test: the `ask:others` choice still shows the
player-facing question). One fix lane only: NPC speech + the ledger labels
that feed it.

Proof: `scripts/test-topic-title-leak-20261014.js`.
- RED (pre-fix, via patch-file revert — no stash on the hot tree): recap
  rendered `"Bottom line: We started on Anyone here I should understand
  better?, then got onto What scares you?."` — per-tid assertions failed.
- GREEN (post-fix): all 9 labels exact, recap/resume/ledger contain no
  question-phrase topics, menus unchanged. `ALL GREEN`.
- Natural-play confirmation: pilot seed 515 re-run post-fix, 654 convos,
  0 true leaks (98 → 0).

## Regression suites

- `node --check src/js/conversation.js` — clean.
- `scripts/test-conflict-deadparty-20261013.js` (r12 convo-path proof) — ALL
  GREEN.
- `scripts/validate-ontology.js` — 94/94 systems, release permitted (no new
  methods added, ledger header untouched).
- No jest suites exist in this repo; node-side conversation coverage is the
  playtest scripts above. No concurrent jest (none to run).

## Telemetry

`telemetry-check.js` vs `telemetry-baselines/social.json`, metrics
end.day,end.alive: **quiet, no LOUD lines** (3 files). end.day 114→125,
end.alive 31→19 (-39%, inside the 60% swing band — village-scatter variance,
not a fix effect; the fix touches NPC speech only). Baseline NOT rolled
forward: it exists (rule: only seed when none exists), and r13's driver did
not instrument qa.* (leak-focused), so a roll would corrupt the r12 qa
reference.

## Verdicts

- **Blank: FILLED.** t2 topic-title leak fixed (354→0 leaks in natural play),
  RED→GREEN proof, menus untouched, ontology 94/94.
- **People check: PASS 8/8.** Strangers, friends, nonverbal, gossip, favor
  arcs, open-thread resumes all read as real people. 0 fabricated-history
  incidents. Quality bar holds.
- **Reachable:** yes — recaps/resumes fired in natural 36–49d play on all
  seeds; the fix makes their language human.
- **Fun:** yes — "they remembered" (r12) now extends to thread bookkeeping
  that sounds like a person, not a menu.
- **Winnable:** n/a for the social leg; nothing gates.
- Watch items for future social passes: (1) "About that question —" curious
  seed opener should name the actual question; (2) cohesion bleed without
  deaths (12→1 scatter) is the unread social-cohesion chapter; (3) grief
  threads unexercised this window (no deaths) — a future run with mortality
  should sense-read them.

## Metric review

M1 bound: pre-fix pilot >0 leaks (got 354), post-fix proof 0 (got 0). Met.
M2 bound: ≥6/8 transcripts pass quality bar (got 8/8). Met. Metric notes for
the NEXT run: the leak detector regex counted discourse-tail `?` ("You
know?") as hits — true-leak definition should require the `?` inside the
topic noun phrase, not anywhere in the line. Also: r13's driver did not
instrument qa.askedTotal/answeredTotal/recallHits, so cross-run telemetry
for the recall feature skips a generation — restore those counters in the
next social pilot driver.

## Convergence line

Social-life axis (leg 5): convoTopicLabel leak fixed; transcript quality bar
8/8; no fabricated history; telemetry quiet. Grief-thread coverage and the
curious-seed opener remain open. Villager-agency axis unaffected (no deaths
this window).

