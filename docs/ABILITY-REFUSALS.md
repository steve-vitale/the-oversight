# Ability-action refusals and pantry ledger accounting

Canon for two questions no other doc covers: when the game says no to
an ability tap, and how the pantry's numbers are allowed to move.
Built only from measured evidence and landed code (see §9). Nothing
here invents a rule: where the evidence runs out, the doc says so
under "Still open" (§8) instead of filling the gap.

Standing rules this doc rests on (docs/CANON.md): **no silent
actions** — every action narrates honestly, including failures;
**"if you don't know, it doesn't show"** — knowledge gates every
surface; **trust ≠ reputation** — gossip and rumors move reputation
only, never trust.

## 1. Refusal timing: refuse before payment, or say you paid

A tap has two moments: the button read (can I use this?) and the
payment (time, kcal, turn). The law, earned across four arms:

- **A refusal that the game can see coming must refuse BEFORE
  payment.** The precheck table (`ABILITY_ACTION_PRECHECKS` in
  src/js/abilityActions.js) runs both when the button state is read
  (`_actionAvailable`) and inside `useAbility` before any cost is
  paid. A refused tap costs nothing: no ticks, no kcal tier burn, no
  spent turn. Proven on fixtures: a non-boundary flag-set tap
  refuses with day, ticks, and kcal all unchanged (0/0/0), and the
  silent 40 kcal burn an earlier arm killed stays dead.
  [sim-onceaday-scope-b §1; sim-refusalprecheck-b]
- **A refusal the game only discovers after payment is a real cost,
  and must be narrated as one.** The three world-state refusals
  below used to be exactly this: the tap paid its time cost first,
  the day rolled inside the tap, and only then did the impl refuse.
  That is why a failed tap at day's end could still hold a night in
  the ledger (§6). The fix was prechecks, not cheaper failures.
  [sim-spandraw-design-b, "refused-but-crossed"; sim-refusalprecheck-b]
- **Pre-payment refusals cannot hold a night.** If the precheck
  refuses, the span never ticks, the day never rolls inside the tap,
  and no meal is swallowed. Post-payment refusals could — and did.
  Any future arm reasoning "failed taps are free" must first check
  which class the tap is in. [sim-spandraw-design-b]

## 2. The three world-state prechecks (landed)

These three actions used to refuse only after payment. They now
refuse before payment, mirroring their impls' world-state conditions
exactly — audience resolution and kill record, no new eligibility,
no narration change. [sim-refusalprecheck-b; code:
src/js/abilityActions.js, REFUSALPRECHECK entries]

- **war_cry.challenge** — refuses when no audience resolves: no
  active conversation partner who is on the roster and is not the
  player. (The sentence says "alive"; the code's test is the active
  conversation plus roster membership, not a separate liveness
  check.) Why, verbatim: "A challenge needs someone to
  challenge — and they have to be here, alive, and one of yours.
  Talk to them first."
- **intimidating_presence.end_it_before** — same audience rule for
  the dispute being ended. Why, verbatim: "Posturing needs an
  audience — someone whose dispute you are ending. Talk to them
  first."
- **trophy_room.mark** — refuses when `state.villageSlain` records
  no kills. Why, verbatim: "Trophy Room: no kills recorded yet —
  hunt something first, then mark it."

Before these prechecks, the before/after pair was one line versus a
paid night: before, a no-audience challenge tap paid and narrated
the refusal after the day rolled; after, the same tap is one line
and nothing else. [sim-refusalprecheck-b §R1/R3]

## 3. Button honesty: the bar passes no target

The action bar never tells the game who a tap is aimed at: the
button list stamps `target: 'none'` on every row, the click handler
calls `activateAbility(id)` with no target, and `_actionAvailable`
hard-calls every precheck with null (`preFn(this, null)`).
[sim-onceaday-scope-b §2; code: src/js/abilityActions.js
`_actionAvailable`]

That sameness is what makes most buttons honest — the button read
and the tap go through the same resolution — and its absence is
what broke Calm (§4). The honesty standard judged in the evidence
is the **player path** (bar tap, no target), not any programmatic
caller: a tap given an explicit roster target with no conversation
can succeed where the button refuses, but the UI never makes such
a call, so for the player the button tells the truth.
[sim-onceaday-scope-b §2, metric review]

### What the button shows

- **Disabled buttons show their why, verbatim.** The bar renders
  `<span class="ctx-why"> — {why}</span>` after the effect text on
  disabled buttons, and the button title gains the reason too. The
  player used to learn why only by wasting a tap on a refusing
  button; now the reason is on the button itself.
  [sim-barwhy-b leg (a); code: src/js/app.js `abilityBarHTML`]
- **Enabled buttons carry no why.** Every enabled row's why is
  null, including legacy rows (time_skip, echo_location,
  blood_magic, field_medicine, herbal_remedy, purify,
  compost_king), which used to carry refusal sentences on live
  buttons ("Used today.", "Need at least 11 HP.", "Already at
  full health.", "No food to bury."). A future surface that
  renders `why` must keep this rule: a reason on a live button is
  a lie about the room. [sim-barwhy-b leg (b); code:
  src/js/abilityActions.js `_legacyActivatables`]
- **Availability never changes because of display.** Surfacing the
  why changed no enabled/disabled state, no precheck, no cost, no
  narration text: 90/90 rows identical before/after except the
  display, and an 8-seed pilot band identical seed-for-seed.
  [sim-barwhy-b legs (c)–(d)]

### The scan-default pattern

When a precheck genuinely needs a target the bar cannot pass, it
resolves the null itself by scanning the world — never by refusing
unconditionally, and never by inventing new eligibility:

- **challenge / end_it_before** scan the active conversations for
  a roster member who is not the player (see §2).
- **calm_beast** scans the live fight (see §4).
- **Target-independent actions** need no scan: mediator refuses
  "No open disputes." only when no dispute is known; dress_game
  refuses "No game to dress. Hunt or trap something first, then
  break it down clean." only when the pack holds no carcass;
  green_thumb.ask refuses "The plants have told you enough
  today." only when its flag is set. The button follows the world,
  not a target. [sim-onceaday-scope-b §2]

## 4. Calm: the button that lied, and the scan that fixed it

Calm (animal_ken.calm_beast) is a combat action: spend your turn
trying to talk a fight down; about half the time the other side
walks away and the fight ends. Its old precheck looked up the
target as a fighter key, and with null there is never a fighter —
so the bar button was ALWAYS disabled with "Nothing here to
calm.", even beside a live hostile villager, while a tap naming
that fighter genuinely attempted the calm. The button lied about
the room, and the action was effectively unreachable from the UI.
[sim-onceaday-scope-b §2; sim-calmbeast-b §1]

The fix, landed, borrows challenge's pattern — a fight scan, NOT a
target picker (the bar has no picker; Calm ends the whole fight
whoever is named, so picking a foe would be theatre, not a
decision):

- New helper `_calmableFighter(game)` scans the live fight's
  fighters in order for the first one passing exactly the old
  check's own test (alive, kind not monster / player / villager).
  No new eligibility. [code: src/js/abilityActions.js]
- The precheck resolves a null target through that scan, so the
  button enables when someone calmable is in the fight and keeps
  "Nothing here to calm." otherwise. A named target keeps the old
  lookup untouched.
- The impl resolves a null target through the same scan, so a bar
  tap actually attempts instead of narrating a refusal after the
  turn is spent.
- Proof: 8/8 seeds, bar row disabled→enabled and bar tap
  refuse→attempt (5 calm-success, 3 calm-failure — the action's
  own coin, both narrations honest attempts); monster-only and
  no-foe guards unchanged; an 8-seed pilot band byte-identical.
  [sim-calmbeast-b §3–§4]

Held, deliberately: **monsters stay uncalmable.** Every
turn-based foe — including wave-1 animals — carries kind
'monster', and the impl refuses that kind outright. Whether a deer
or another wave-1 animal should be calmable contradicts the data
line ("non-predatory animal") as the code stands; changing it is a
design decision about which beasts count, not a bug fix. See §8.
[sim-calmbeast-b §8]

## 5. Once-a-day and the day-roll predictor

The only day-roll predictor is `_onceADayPostPaymentDay`
(src/js/abilityActions.js, private). It reads the action's
`time_min` cost, converts it the same way payment does
(max(1, round(min/2)) ticks), and returns the day the impl will
see after payment — day+1 only when dayTicks + ticks >= 512 and
no fight, nested tick, or game-over. It is pure: fixture reads
(button read, full button list, hunger-gate kcal read) move day,
dayTicks, and kcal by exactly 0 across repeats.
[sim-onceaday-scope-b §1; code: src/js/abilityActions.js]

### Scope: exactly three actions

| Action | Daily gate | Predictor? |
|---|---|---|
| war_cry.challenge | challengeDay | YES — day-roll-aware |
| intimidating_presence.end_it_before | postureDay | YES — day-roll-aware |
| water_breathing.dive_deep | diveDayTiles (tile+day) | YES — day-roll-aware (added by the dive fix; see below) |
| scream_cheese.scream | screamDay | NO, but no gap — combat turn cost; payment cannot roll a day mid-fight (tickAction no-ops under a fight) |
| cheese_wheel.hurl | _cheeseWheelDay | NO, but no gap — same combat reason |
| green_thumb.ask | _askPlantsDay | NO, but no gap — kcal-only cost; payment advances nothing |
| time_skip, echo_location | timeSkipDay, echoDay | N/A — legacy path bypasses _actionAvailable; the action IS the day-part advance |
| molt.shed_skin | moltWeek (weekly) | N/A — not a once-a-day action |
| blood_magic | 2/day part | N/A — day-part cap, not a day-roll question |

[sim-onceaday-scope-b §1, updated for the dive fix below]

### The boundary rule

A tap near day's end is judged against the day the impl will see,
not the day the button was read on. A boundary tap whose payment
rolls the day SUCCEEDS as the new day's action — the day roll
resets dayTicks to 0 and the remainder is discarded, not carried —
while the same tap on the old day, or a same-day reuse, refuses
before payment with all deltas 0. The boundary tap is expensive
because the day turns (day-roll metabolism, e.g. −2640 kcal on
the proven fixture), not because the button was read: prediction
rows at the same positions show 0. [sim-onceaday-scope-b §1, §3]

### The dive gap, found and fixed

Dive_deep's precheck used to key on the PRE-payment day while its
impl keyed on the POST-payment day, so a boundary dive was refused
("Already worked this water today.") though the impl would have
accepted it as tomorrow's dive. The dive fix extended the day-roll
predictor to dive_deep's precheck on the same pattern (null
prediction falls back to the pre-payment day, preserving baseline
behavior rather than guessing a refusal); the boundary false
refusal is fixed and same-day reuse still refuses.
[sim-onceaday-scope-b §3; sim-divedeep-fix-b; code:
src/js/abilityActions.js dive_deep precheck]

### In-combat button states, stated as a limit

In-combat button states for scream_cheese / cheese_wheel were not
fixture-proven (they need a real fight); by code their prechecks
read the pre-payment day, but a turn cost cannot roll a day, so no
boundary class exists for them. That is a limit of the evidence,
not a gap — see §8. [sim-onceaday-scope-b §2, §5]

## 6. Pantry ledger accounting

The pantry ledger is a bookkeeping instrument, not a game system:
it watches the pantry's flows and asks whether they close. Its
definitions are judged, not assumed.

### The closing definition (boundary-aware)

Every stock figure names its basis. Opening is the post-setupGame,
pre-first-policy-day snapshot: 47,250 kcal on every seed (Rice
13,000, Dried beans 12,000, Dried meat 8,800, Canned soup 7,500,
Peanuts 5,950). Day-end is the spoilDays entries. The JUDGED
closing is the **post-run snapshot** (`finalPantry`, a pure read
taken after runDays) — NOT the last day-end snapshot. The earlier
stockdoors NO-GO was judged under the last-day-end closing; its
failures were boundary artifacts, proven by re-running the same
corpora under the post-run closing (pilot generic 7/8 → 8/8,
confirm named 4/5 → 5/5 and generic 10/12 → 12/12). Future ledger
arms inherit both definitions — draws as below, closing as
post-run — and do not re-litigate them without a new prereg.
[sim-stockdoors-b, snapshot basis + control legs + metric review]

### The doors (every pantry flow has a door)

- **Meals**: pantryDraw + drawSpoiled draws (the night meal and
  villager meals). All stock figures are FRESH kcal only; spoiled
  stock leaves via the spoil sweep, itself a counted flow.
- **Night surplus**: `stockSurplus(v, give)` — one villager's
  uneaten share becomes tomorrow's stock (a 200-kcal Foraged-food
  unit, spoilDay = vDay + 3, in the proven example). 4,881 records
  pilot / 8,669 confirm on the stockdoors bands.
  [sim-stockdoors-b; code: src/js/game.js `stockSurplus`]
- **Direct takes**: player takes, NPC adult pantry eats (one unit
  at a time — "a hungry villager feeding themselves outside the
  meal"), NPC child pantry eats, event takes, bulk takes. Direct
  records: 433 pilot / 1,452 confirm. A direct take reads as what
  it is — a person eating, not a system drain.
  [sim-stockdoors-b coverage census + sense transcripts]
- **Spoil sweep**: large non-draw removals on current master ARE
  the recorded sweep, not a mystery door (largest single-day
  non-draw removal on the band, seed 9822 day 83: 21,321 kcal,
  100% sweep, 0 direct — a spoil cliff of stacks expiring
  together). [sim-stockdoors-b case diagnostic (a)]
- **Raid loot**: see §7.

### Closure, as barred (not "to zero everywhere")

Under the post-run closing: named families 6/6 pilot (pooled
residual 0 / 973,680) and 5/5 confirm (0 / 286,220); generic
families 8/8 pilot (−1,021 / 2,103,491 = 0.049%) and 12/12 confirm
(−3,040 / 3,473,310 = 0.088%); dried channel −1,021 / 610,566
(0.17%) pilot and −3,040 / 1,033,545 (0.29%) confirm. GO here
means "closes as barred" — the small generic dried residuals were
real, and §7 says what they were. [sim-stockdoors-b legs 3–5]

### Span-keyed dedup: the class is timing, not ability

ANY useAbility span that holds a night swallows that night's meals
in a naive direct+meal ledger, because the snapshot-diff wrapper
records the whole span's pantry decrease as one "direct" record
attributed to the tap — and the night's meals are most of that
decrease. Proof: per-seed exclusions are IDENTICAL across keys
(seed 9981: 5,990 kcal for tracker.track, thief.steal_pantry, AND
molt.shed_skin alike). The ability type is irrelevant; what
matters is only whether the span holds a night. The already-wired
span-keyed dedup rule therefore scopes by span, not by ability
and not by success — a refused tap that paid and crossed counts
the same as a successful one (§1). 15 non-cultivate keys reached
PROBE-PROVEN (mechanism) on boundary fixtures and recurred on 12
fresh seeds; PROBE-PROVEN means the mechanism exists, never that
real players tap at that hour — real-play promotion needs a
separate unscripted band and is still open (§8). The one key with
a real-play proof remains cultivate (belongseek 9954, 3,820 kcal).
[sim-spandraw-design-b verdict + sense trace + anti-rushed-probe
guard]

Combat actions cannot day-cross by construction (tickAction
returns early while a fight is live; the day advances only via
tickAction reaching 512 or the dayPart path, neither of which runs
mid-fight). Kcal-only actions (ask, push_through) fire without
ticking and cannot cross from any position. Legacy activatables
and god/keepsake verbs sit outside the census span logger by
construction, not as failures. [sim-spandraw-design-b inventory]

## 7. Raid loot: the door the instruments missed

Unanswered-raid loot is real village behavior with a real
consequence, and it was invisible to the ledger because
`_removePantryKcal` was the ONE pantry-removal method no capture
wrapped. [sim-driedhunt-b]

- **The take**: `villageAgencyDaily` (src/js/villageAgency.js):
  "an unanswered raid at the treeline doesn't wait — they take and
  go." A pending raid defense unanswered past its day takes
  `_removePantryKcal(800)` — longest-spoilDay-first, so opening
  Canned soup (spoilDay 366) goes first, then the longest-lived
  dried stacks. The game says it aloud: "You weren't at the
  treeline. [champion] of [village] didn't wait — they hit the
  stores and melted back into the dark with [taken] kcal."
  [sim-driedhunt-b; code: src/js/villageAgency.js ~197–205]
- **Why the residuals looked like dried drops**: a raid take
  drains whole stacks from the longest-spoilDay end and stops
  mid-stack on the last stack it touches. The partially-clipped
  stack keeps being eaten by meals, leaving a tail (created −
  consumed − swept > 0) that is exactly the raid's clip. The
  stacks' later expiry is a red herring — the loot left days
  before expiry, not at it.
- **Accounting, to the kcal**: seed 9738 residual −2,240 = three
  raid clips (days 60/63/65); 9735 −800 = one clip (day 77); 9825
  −1,021 = two clips across four stacks (days 62/79, including a
  221-kcal unit from a 276-kcalEach fresh input at the 0.80x
  blind racks rate). The same raids explain the Canned soup
  residuals on all three seeds exactly (9738 −1,250; 9735 −1,000;
  9825 −1,750), and every other opening staple family closes at
  0. Asked 800 does not mean taken 800: whole-stack draining
  returns 1,000 / 890 / 910 / 861 on the proven takes.
  [sim-driedhunt-b per-seed hunt + soup corroboration]
- **Instrument note, not a game rule**: the driedhunt capture (a
  snapshot-diff wrapper on `_removePantryKcal` with caller-stack
  capture) is a DIAG script committed for future arms to reuse.
  A future ledger arm should install it — or fold its wrapper
  into the stockdoors capture — before judging any family ledger
  on a band where raids, tributes, gifts, or other
  `_removePantryKcal` callers can fire; otherwise the same class
  reappears as an unexplained residual. [sim-driedhunt-b village
  assessment]

## 8. Still open (explicit, with evidence paths)

Nothing here is resolved by this doc. Each item names its evidence
so a future arm can take it without re-finding it.

1. **Pantry-lift conversation line — Steve-call, OPEN.** The
   convoTopics line "I know about my pack. Hands where I can see
   them, next time." keys on a victim-keyed
   'caught_you_stealing' memory. A pantry lift has no victim
   villager, and writing the memory under the player's own id
   would be a self-memory no villager's conversation ever reads —
   so the line is still not reachable from a pantry lift alone,
   even though booking is fixed (see the Appendix). Who should
   remember a victimless pantry theft is a design question for
   Steve, not a measurement tweak. [sim-caughtlift-fix-b decisions
   + residual; sim-caughtlift-b]
2. **Sibling re-proof of the landed prechecks — unmerged, NOT
   claimed.** Branch sim-postpayrefusal-b's tip (ab51f772c) is a
   prereg commit only ("re-proof of landed prechecks, scope
   correction"), not an ancestor of this tree's HEAD. Its
   re-proof of the §2 prechecks is pending; the prechecks
   themselves are landed via sim-refusalprecheck-b (10ef1e627,
   ancestor of HEAD). Do not report the re-proof as done until
   its commit lands.
3. **Monsters uncalmable — Steve-call, OPEN.** Whether a deer or
   another wave-1 animal should be calmable is a design decision
   about which beasts count, not a bug fix; the current refusal
   is preserved exactly. [sim-calmbeast-b §8]
4. **Fled-fighter edge — OPEN, same class before and after.** The
   calm scan does not exclude fled fighters, matching the
   explicit-target path (which also attempts on a fled key).
   Not "fixed" by inventing a new eligibility rule mid-arm.
   [sim-calmbeast-b §8]
5. **In-combat button states for scream_cheese / cheese_wheel —
   NOT fixture-proven.** Code argument only (a turn cost cannot
   roll a day); a real-fight fixture is the follow-up.
   [sim-onceaday-scope-b §2, §5]
6. **Ledger paths still unproven in band play.** On the 20
   stockdoors seeds, five paths recorded zero: alien-raid,
   thief.steal_pantry, event-take, player-take-bulk, and
   npc-child-pantry — no raid, lift, event take, bulk take, or
   child pantry eat fired there. Lift accounting has since been
   proven by the caughtlift fixtures and raid accounting by the
   driedhunt re-run; the remaining three — event-take,
   bulk-take, and child pantry-eat — still need a band where they
   fire. [sim-stockdoors-b coverage census]
7. **Real-play promotion for the 15 PROBE-PROVEN span keys —
   OPEN.** An unscripted sim band in which a key's span recurs
   with an exclusion; until then the keys stay PROBE-PROVEN
   (mechanism), never real-play double-counts.
   [sim-spandraw-design-b follow-up]
8. **Cultivate hall gate on fresh setup — fixture fact, not a
   defect.** Probe instances start inside the hall and the garden
   gate refuses "Step outside the hall"; cultivate is silent in
   the span probe while proven in the belongseek replay for this
   reason. [sim-spandraw-design-b; evidence/2026-10-28/sim-culthall-b.md]
9. **Message-log ring, named for future preregs.** The saved
   40-line message log holds the caught-lift sentence, not a
   booked move; a future leg-(c) record list should name it
   explicitly so the argument cannot recur. It would not change
   any verdict here, since the tele event now books the move.
   [sim-caughtlift-b metric review; sim-caughtlift-fix-b metric
   review]

## 9. What a player actually sees (plain words)

You tap a greyed-out button and it tells you why, in the game's
own voice — "The plants have told you enough today", "Posturing
needs an audience" — instead of making you tap to find out. A
button that is live never carries a dead reason. When you tap at
the last hour of the day and the day turns under your tap, the
game judges you by tomorrow, not by the day you started on — a
dive you already did today becomes tomorrow's dive, and it works.
When you try to calm a fight, the button no longer claims nobody
is there while someone stands in front of you; it lets you try,
and trying costs your turn whether it works or not. When you get
caught stealing from the pantry, one hand closes on your wrist
and the village remembers it in its own record — and if someone
actually saw you, they think worse of you and the story starts
travelling. When raiders hit the stores because nobody answered
the treeline call, the pantry number moves and the game says why,
out loud, with a name attached. And behind all of it, the pantry
itself is a ledger that closes: food in, meals out, surplus saved,
spoilage swept, loot taken — every kcal with a door it came
through, and no dinner counted twice because a tap happened to
hold the night.

## Appendix: caught lifts are booked (the trust rule)

This section is placed last so the refusal rules above are not
confused with the trust-booking rule, which the evidence proved
separately. A caught pantry theft moves trust through exactly one
path:

- **The move**: caught Light Fingers lift and caught ordinary take
  both route −20 through `bumpTrust(vid, -20, 'caught stealing
  from the pantry')` — never a direct write to `v.trust`. Losses
  land whole under bumpTrust, so 50 → 30 exactly, and an unset
  villager still floors at 0 (the old direct write's `|| 15`
  default versus bumpTrust's undefined → 10 is numerically
  invisible for a −20 loss: both floor at 0, and every defined
  value is identical). [sim-caughtlift-fix-b decision; code:
  src/js/abilityActions.js thief.steal_pantry caught branch,
  src/js/game.js takeFromPantry thief-caught branch]
- **The record**: bumpTrust fires `tele('trust', {who, delta,
  reason})` (src/js/game.js ~8118) — the durable trace. The old
  direct write fired no telemetry, created no memory, seeded no
  gossip, and moved no ledger entry; the narration ("The pantry
  remembers") was a sentence, not a memory. Now the sentence is
  true. [sim-caughtlift-b leg (c) autopsy; sim-caughtlift-fix-b
  fixtures]
- **The witnesses**: `observe('caught_you_stealing')` now has a
  live action-table entry (honest −25, generous −15, brave −3,
  competent 0 — the same dims as 'theft'). Witnesses actually
  present read it (probe: honest 0 → −20 at the 0.8 non-target
  witness weight, generous 0 → −12, 1 gossip entry seeded); with
  no positioned witnesses and no party, the seen-crime rule
  correctly seeds nothing. Gossip moves reputation only, never
  trust, and the player's own −20 is never double-moved (the
  roster loop excludes the player id). Before the fix, observe()
  was a full no-op for this action — no table entry — so the
  call site's promised social consequence never happened.
  [sim-caughtlift-b; sim-caughtlift-fix-b witness probe; code:
  src/js/game.js observe() table]
- **A clean lift books nothing.** Trust 50 → 50, zero tele
  events, narration verbatim ("The food disappears. Magic. (It's
  not magic. Nobody saw. Light Fingers.)"). A thief who got away
  clean leaves no trace — the honest version of the same rule.
  [sim-caughtlift-b clean-palm control; sim-caughtlift-fix-b
  controls]
- **The conversation blank stays open** — see §8 item 1. Booking
  is fixed; the pantry-lift convo line is not reachable from a
  pantry lift alone, and that question belongs to Steve.

## Sources (every rule above traces to one of these)

| Claim family | Evidence file | Code location read in this worktree |
|---|---|---|
| Predictor pure; boundary rule; daily-gate inventory; target=null honesty | evidence/2026-10-28/sim-onceaday-scope-b.md | src/js/abilityActions.js `_onceADayPostPaymentDay`, `_actionAvailable` |
| Why on disabled, none on enabled; availability parity; 8-seed band identical | evidence/2026-10-28/sim-barwhy-b.md | src/js/app.js `abilityBarHTML` (ctx-why), src/js/abilityActions.js `_legacyActivatables` |
| Calm scan fix; monster guard; fled edge; monsters held | evidence/2026-10-28/sim-calmbeast-b.md | src/js/abilityActions.js `_calmableFighter`, calm_beast precheck/impl |
| Caught lift unbooked (before) | evidence/2026-10-28/sim-caughtlift-b.md | — (diagnosis, pre-fix) |
| Caught lift booked (after); clean lift books nothing; convo line open | evidence/2026-10-28/sim-caughtlift-fix-b.md | src/js/abilityActions.js thief caught branch; src/js/game.js takeFromPantry caught branch, observe() table, bumpTrust tele('trust') |
| World-state prechecks landed; once-a-day day-roll-aware | evidence/2026-10-28/sim-refusalprecheck-b.md (commit 10ef1e627, ancestor of HEAD) | src/js/abilityActions.js REFUSALPRECHECK entries |
| Dive boundary fix | evidence/2026-10-28/sim-onceaday-scope-b.md §3 + evidence/2026-10-28/sim-divedeep-fix-b.md (commit 0761aab9b, ancestor of HEAD) | src/js/abilityActions.js dive_deep precheck |
| Span timing class; span-keyed dedup; refused-but-crossed; 68/68 wiring | evidence/2026-10-27/sim-spandraw-design-b.md | scripts/dedupspan-ledger-b.js (rule, via dedupspan-apply-b.js) |
| Boundary-aware closing; doors census; closure numbers; zero-record paths | evidence/2026-10-27/sim-stockdoors-b.md | src/js/game.js `stockSurplus` |
| Raid loot via _removePantryKcal; tails = clips; soup corroboration | evidence/2026-10-27/sim-driedhunt-b.md | src/js/villageAgency.js villageAgencyDaily (~197–205); src/js/hierarchy.js `_removePantryKcal` |
| Sibling re-proof status (unmerged) | branch sim-postpayrefusal-b tip ab51f772c (prereg only, NOT ancestor of HEAD) | git log in this worktree, 2026-10-28 |

## Change note

- 2026-10-28 (sim-refusalcanon-b): doc created from the eight
  grounding evidence files above plus code read in this worktree.
  No game rule was changed to write it; where the code has since
  moved past an evidence file (dive predictor scope, calm scan),
  the doc states the landed code, with the evidence file that
  motivated it.
