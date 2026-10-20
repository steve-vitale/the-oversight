# Conversations

Real back-and-forth dialogue. Built because Steve said: "They just talk at me,
there's no conversation happening."

## The problem it solves

The old `talkTo` returned one NPC line per tap. The player clicked "Talk" and
got talked at — a vending machine, not a conversation.

## How it works

**Replies belong to the spoken exchange.** A question, invitation, price or
live request owns its decision menu. Other subjects and practical actions wait
behind an explicit subject change. A genuine queued beat can offer "Go on";
an exhausted topic offers a pivot or exit, rather than filler choices.

**Conversation threads.** Topics develop over multiple exchanges:
- `goal` — what they want (uses existing goal lines + new depth-2 follow-ups per goal)
- `past` — their old life (occupation/origin templates + follow-ups)
- `village` — how everyone's holding up (generated from live needs/moods/heat)
- `plans` — what they'll do tomorrow
- `request` / `grief` / `cheer` / `recall` — single-beat contextual threads
- `where` — "Where do you think we are?" A new run doesn't know its landing
  region or season (`state.scholar.placeKnown`). Locals tell you (known),
  visitors guess (rough), strangers can't. Raises the day-header season line.
  Generated topic in `src/js/whereAreWe.js`; lines in `climates.json` `talk`.

"Tell me more." goes deeper until the thread is honestly exhausted — then they
say so ("I've told you everything I know about that") instead of looping.

**NPCs ask YOU questions.** Six questions (origin, plans, fears, missing,
trust, worldview), gated by trust and mood. The first conversation with someone
always includes one — strangers are curious. Your answers are remembered
(`conv.answered`) and referenced later ("You told me you're from...").

**Emotional arc.** Each conversation has an energy budget (2–6 exchanges, from
temperament + social need). When it's spent, the NPC signals a natural ending
("I should get back to it — but this was nice.") and the conversation closes.
Short is fine: a 3-exchange conversation that feels real beats a 10-exchange
loop.

**Context-aware openings.** Priority: their pending talk request → remembering
what you told them → village grief/cheer → their goal (if they trust you
enough) → mood/temperament small talk → honest "we've covered it".

**No repeats, ever.** `convoPick` tracks said lines by TEXT across ALL threads
per villager (robust to pool changes from mood/rep shifts). Generic pools
(exits, "told you everything", acknowledgment filler) cycle in varying order.

**Language.** No shared language → the conversation is nonverbal (gesture
choices with varying outcomes). Partial → normal conversation.

**Silence and leaving are options.** Not every interaction needs to be
productive. NPCs fill silence in character.

## Costs & effects

- 10 kcal per conversation (charged on open — cheaper than the old per-tap cost,
  encouraging real exchanges)
- Trust +3 on natural end (same 40-cap as before: words only go so far)
- Eases their social need, diplomat XP, `observe('talk')`, promise checks,
  conflict fallout (favoritism noticed, old wounds unfold) — all preserved

## Files

- `src/js/conversation.js` — the engine, self-attaching to `Game`
  (overrides `talkTo` with a delegator; all `convo*` methods)
- `src/data/characterGen.json` → `convo` key — questions, exits, follow-ups,
  silence/joke/agree reactions
- `src/js/app.js` — person card renders transcript + choice buttons
- `playtests/test_conversations.js` — 28 tests, all passing

## Tuning levers

- `convoBudget` — conversation length
- Question probability (0.4/turn after the first-convo guarantee)
- `minTrust` per question in characterGen.json
- Goal-share trust thresholds by temperament in `convoOpening`

## Structural contract and repeatable audit (2026-10-20)

`sayLine` records `spokenBeat` only when text actually enters the transcript.
Generated candidates and the legacy player-move `lastBeat` cannot supply reply
context. Curious openers carry provisional questions; only accepting that
opener attaches answers and records it as asked. Fallback speech retires its
unspoken question. Menus keep the exact offered labels through rerenders and
pagination, and every handler records the selected words.

The final `convoMenuPage` filter runs after additive injectors. Questions,
invitations, trading and substantive wants retain ownership there too. Adding
a new wrapper must preserve that rule. Selecting injected topics must leave
`choosingSubject` before producing their replies. Topic continuation labels
must describe what their handler actually does; do not label a generic
continuation "When?" or "Who told you?" without an answering handler.

Required answer acknowledgments and commitment confirmations are dialogue
grammar, not interchangeable flavor. The repeat ledger must not replace a
successful promise with "lost my train of thought." Generic yes/no replies
cannot assert shared visions, prior knowledge or events absent from the ask.
Both voice backends receive complete quoted speech only; narration remains
visible and silent. The persona API supplies explicitly spoken text that its
call sites already display in quotes. Unclosed NPC quotes are not guessed as
speech. Ambush actions take priority before the old question's budget can trim
them, not merely at the final filter.

Run `node scripts/check.js --quick` after changes; it automatically includes
the spoken-context, answer-context and voice-boundary regressions. Use
`scripts/lib/conversation-playtest.js` to reach real paged offers in prepared
tests. Do not bypass an unresolved opening exchange by invoking an unoffered
handler. Prepared scene state belongs in fixtures, never in production UI.

For broader evidence, use fresh output prefixes:

```text
node scripts/conversation-audit.js --root <baseline-root> --out evidence/<date>/dialogue-before
node scripts/conversation-audit.js --seeds 1,7,42,99,1234,2026,11,23,55,321,888,4545 --out evidence/<date>/dialogue-after
node scripts/review-conversation-audit.js evidence/<date>/dialogue-before.json.gz evidence/<date>/dialogue-after.json.gz evidence/<date>/dialogue-review
```

The sampler retains full displayed lines, real pages, selected words and
emitted replies, with seeded campaign stages at 0/30/90 controller iterations.
Report actual days and terminal outcomes, not requested iterations as late-game
coverage. It interviews living roster members directly, including remote NPCs;
this does not prove nearby mobile availability. Interviews stop at 12 turns.
Unknowns, still-active interviews and manual prose issues remain visible.
The reviewer flags context/label failures; it is not a prose-quality oracle.
Read the stratified exchanges and every flag, then replay important failures
through the phone UI at 390x736 and 390x844. A voiced vocative can produce a
question-stem checker false positive: inspect the actual words before fixing
or dismissing one.

These structural changes can alter bot choices, trust, promises and survival
without changing numeric costs. Follow SIMULATING and MEASUREMENT-PLAN for a
matched balanced panel, source-bound phone proof and survival-lever review.

Authored formal questions require the same review: question, each answer,
reaction, follow-up and answer-specific recall form one contract. Review the
whole catalogue when a sampled pair is wrong. A callback cannot claim an
unnamed person was identified or an unperformed lesson succeeded. Current
source review and the four repaired families are retained in
evidence/2026-10-20/conversation-authored-review-r7.json.

### Favor requests: actions and requirements (2026-10-20)

A request must connect to an executable deed or explain the blocker in its
conversation menu. `convoFavorAction` is the read-only source for readiness,
requirements and the dispatch recheck. `convoFavorActionMenu` exposes an action
when ready and a requirements explanation in either case. Menu identity includes
readiness so collecting food or approaching the recipient updates the offer.

Food sharing invokes `giveFood(vid, 'meal')`, removes up to three actual edible
pack portions and spends its ordinary action. Wound and illness care invoke
`tendVillager`: 32 ticks (roughly half an hour), ordinary time costs, no invented
medical skill requirement and no instant-cure claim. Its null return is not a
failure receipt. Death, combat, missing/dead recipients, map node, Haven door and
local adjacency are checked at dispatch. Completion cannot replay the deed.
A future promise remains distinct from performing the action; ready actions stay
available immediately after committing and on later promise reminders.

Five authored jobs still lack an executable joint activity: creek hauling,
shared snare repair, watch handover, overnight company and joint foraging.
Their menus explicitly explain this and offer no new unkeepable promise. Old
open jobs have a no-penalty close route, no completion reward, and no deadline
penalty while the unsupported job remains open. This is a disclosed release
blocker, not implementation of those jobs. Do not substitute any NPC assignment,
food gift or brief conversation for those specific jobs.

Typed favor promises require deed receipts: physical food, wound care or illness
care. General non-favor promises keep their existing behavior. Words cannot keep
a physical-care favor; unrelated assignments cannot keep a joint-job favor.
Treatment with no illness benefit cannot keep the illness favor. Request and
promise lines bypass random semantic voice additions; requirement explanations
are unquoted interface narration and stay silent in generated speech.

Verify with `node scripts/godpath/test-favor-action-contract.js`, the full green
list, and the prepared native-touch recipe `evidence/2026-10-20/favor-phone-r2.js`
at both phone heights. It uses declared prepared needs in a played save, actual
UI choices and save/Continue, with no browser outcome grants. Preserve the broad
r7 transcript review as historical evidence, then refresh balanced and frame
proofs whenever runtime changes. See the dated favor-action audit for final
source hashes, limitations and tradeoffs.
