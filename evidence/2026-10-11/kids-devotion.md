# Kids Devotion → Weight — evidence 2026-10-11

Reframe (Steve 2026-10-11, twice): the first build made the return an
AUTOMATIC ledger-gated prize — "your payoff scene is the wrong idea."
The second direction (devotion meter) was also rejected: "Still too
simple. We want this put upon the player. Not just devotion based."
Canon now (docs/KIN.md, "a weight, not a meter"): NO score. A HISTORY
of pod-related choices — what you did at each intrusion, what it cost,
who saw it. The village's social memory IS the system.

## What was built

**New module `src/js/pods.js`** (77th ontology system):
- `podRemember(kind, detail)` / `podHistory()` — the history. Every pod
  choice logged with day, kind, cost, witnesses. No meter anywhere
  (asserted by test: no `devotionScore` in pods.js or table.js).
- **Intrusions** (`podIntrusionTick` at dawn, `podIntrude`, `podAnswer`):
  three types — `camera` (System puts a pod on screen mid-show),
  `famine` (someone does the life-support math at the fire), `dangle`
  (System offers a bargain). Pacing: day > 14, ≥8 days since last,
  1/28 daily roll (~1/season). Pending 3 days unanswered auto-resolves
  as shrugged — silence is a choice.
- **Costs both ways**: act → favor owed (camera/dangle) or pantry debit
  (famine, 2000 kcal); shrug → mourner opinion -4, gossip, history.
- **The ask** (`podAsk`): post-day-7, 7-day cooldown, costs a favor owed;
  System deflects with escalating weariness; fulfills oldest open
  takenPromise.
- **Promise fuse**: open 21 days → `promise-broken`, said aloud, gossip,
  mourner opinion -10.
- **Social memory**: `v.podFeeling` per villager (score + notes); broken
  promises surface in Witness defense via `podWitnessMaterial()`.
- **The Jackpot** (`podJackpotStage/Choose/Approach/Spin/Win/Loss`):
  staged once per run; three approaches (conviction/finesse/ritual);
  15% win; loss is the quiet beat (below).
- **Table demand** (`podDemandAvailable/podDemandCost`): championed
  history (acted ≥2 AND kept ≥1 promise) on light branch → final
  "Demand the pods opened." The table charges: tribute (12k kcal),
  favor (2 owed), or standing (path strength -1). Player picks; no free
  version. Replaces the retired ledger-gate `kidsBackEligible`.
- **Callous oversight** (`podOversightEpilogue`, in tableEpilogue): light
  branch + kids not home + shrugged history → the sting (below).
  Accusations built from the actual history (promise/camera/famine/
  jackpot lines conditional).
- **Jackpot-loss carried** (`podJackpotLossEpilogue`): "You think about
  that tooth sometimes."
- **Dark conscript** (`podConscriptOffer/Answer`): offered at feared-dark
  and relay-dark path entry (standalone beat, challenge resumes after).
  Accept → horror (barracks opening, measured for boots, village quiet,
  ledger mark, mourners -20). Refuse → beat. Never clever, never winks.
- **UI** (app.js, player's own tile): pending intrusions surface as
  speak/stay-quiet actions; "Ask about the pods" (cooldown); "Step up
  to the wheel" when the Jackpot is staged.
- **Witness**: `podWitnessMaterial()` injected into the defense beat —
  "Promises are evidence too."
- **Kept from the first build**: 19 kin fates, seek_taken + takenPromises
  (now also `podRemember('promise')`), day-7 pods beat, `kidsBackOutcome`
  reunion casting, adults deflected.

**Dark path choices (documented)**: feared-dark (domination — an army is
the point of terror; "what an amazing potential army") and relay-dark
(the instrument — "become its favorite instrument"; children as nodes).
Witness-dark is a trial, not a war — conscription doesn't fit its
grammar. Assimilated-dark is comfort, not power.

## The oversight epilogue (full text, sense-read)

> ◈ THE OVERSIGHT —
>
> You won. Say it plainly: you won. The village endures. The table
> signed. The galaxy applauds, and the applause is real, and you
> earned it.
>
> And somewhere out there — past the cameras, past the light — in rows
> of humming glass, the little ones are still napping.
>
> [history-specific accusations, e.g.:]
> The mourners asked you, and you changed the subject.
> The System put a pod on the screen, and you let the segment play.
> Someone did the math at the fire, and you let the question hang.
>
> They are still there. Still small. Still waiting for someone to
> decide they matter more than the moment.
>
> That is what the word means. Not the watching — anyone can watch.
> The oversight is the looking away. The most terrible thing the
> System ever did, it did by accident, because it was bored. You did
> it on purpose, because you were busy.
>
> The village will tell your story for years. It will be a good story.
> Listen for the part they don't tell.

Sense read: the accusations are particular (not "you failed" but "you
let the segment play"); the title's new meaning is said aloud ("the
oversight is the looking away"); the boredom/busy parallel is the
stinger; the last line curdles without resolving. It hurts.

## Jackpot loss scene (sense-read)

> The wheel slows. The pointer wobbles between fates. You can see
> where it wants to land. You can't do anything about it.
>
> It stops. Not on the pods.
>
> 📡 "...OOH. So close! SO close! The audience FELT that! ...Anyway!
> Coming up after the break —"
>
> The pods stay shut. The big screen cuts away. The show moves on,
> because the show always moves on.
>
> Somewhere below the lights, in rows of humming glass, the little
> ones keep napping. They don't know they were almost a prize. That's
> the worst part. Or the kindest. Nobody can tell anymore.

Sense read: the System's pivot ("...Anyway! Coming up after the
break —") is the cruelty; the last line refuses to resolve whether
ignorance is mercy. The game sits in it — no follow-up action, no
consolation prize.

## Sim: scripts/sim-kids-weight.js (3 policies × 6 seeds, 120d)

(a) **Intrusion frequency**: champion 3.3, shrug 2.5, gamble 3.8 per
120d (~1/season); min gap 8d — never two in a week. Present, not spammy.
(b) **Cost bite**: champion mean favors owed 9.3 vs shrug 0.0; famine
acts debit 2000 kcal from the pantry (unit-tested; famine fires when
pantry < 8000). Championing means having less for everything else.
(c) **History differentiation**: champion 6/6 championed → demand
available 4/6 (2/6 won the Jackpot outright — kids already home);
shrug 0/6 championed, 0/6 demand; gamble 0/6, 0/6. Genuinely different
possibility sets.
(d) **Oversight**: fired 6/6 on shrug-runs, 0/6 on champion-runs.
Jackpot: 3 won / 12 played (25%, n=12; design 15%).

Tuning note: no tuning needed — the weight is felt on the first pass.
Intrusions are rare enough to matter, costs are real, histories diverge.

## Proof
- `scripts/test-kids-devotion.js`: **47/47 × 3 seeds** (history/no-meter,
  intrusion costs both ways, ask+promise fuse, table possibilities,
  oversight, Jackpot distribution 10–50/200, conscript horror,
  adults unknown, Witness material).
- `scripts/test-kids-stasis.js`: **45/45 × 4 seeds** (section E rewritten
  for demand-at-cost; reunion casting kept).
- Regressions: table-beloved 24/24, table-core 31/31, ontology 77/77.
- `scripts/sim-kids-weight.js`: distributions above.

## Files
- `src/js/pods.js` (new, ~700 lines)
- `src/js/table.js` (demand final + price phase + conscript beat + epilogue hooks; `kidsBackEligible` retired)
- `src/js/table-witness.js` (broken-promise material in the defense)
- `src/js/convo-wants.js` (promise → history)
- `src/js/game.js` (dawn: intrusion tick + 21-day promise fuse)
- `src/js/app.js` (pod actions on the player's tile)
- `index.html` (pods.js after table.js)
- `scripts/test-kids-devotion.js`, `scripts/test-kids-stasis.js` (E rewritten),
  `scripts/sim-kids-weight.js`
- `evidence/2026-10-11/kids-devotion.md` (this file)
