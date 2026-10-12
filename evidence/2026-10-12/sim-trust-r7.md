# Long-run sim — trust & social lever r7: THE PROMISE SYSTEM, UN-DEADED (2026-10-12)

Lever index 5 (trust & social), round 7. Canon read first: docs/CANON.md,
docs/CONVERSATIONS.md, docs/PARTY.md, docs/KIN.md, docs/FANS.md.
Trust != reputation held throughout (no gossip/trust changes in this run).

## The blank (measured, not invented)

r5/r6 carried: "Promises: 0 made across 36 runs — the promise system is
player-initiated (conversation UI); no sim policy exercises it, so its
long-run behavior is unmeasured."

r7 found it is worse than unmeasured: **the promise system is unreachable,
not just unexercised.** The formal vow path (`offer_help` → `promiseHelp`)
has been dead since the person-card promise button was removed (the code
comment says "the button is gone"). Three compounding breaks in
src/js/conversation.js:

1. **Menu gate dead post-System.** `ask:goal` required `!goalKnown` — but
   post-System goals are auto-known (`canShow('npc', vid, 'mechanics')`
   returns true when `systemArrived`), so the goal thread was unreachable
   from the menu.
2. **Opening never fires.** The goal-thread conversation opening (priority
   5) never wins against the want system (priority 3, near-ubiquitous).
   Measured: **0 goal-thread openings across 170 conversations** in an
   instrumented 200d socialite run (seed 3).
3. **Dead circular in the offer gate.** `offer_help` required
   `hasDiscovered('promise') OR (thread==='goal' && depth>=2)` — but the
   gate also required `!onThread`, and leaving the thread clears
   thread/depth. The combination `!onThread && thread==='goal'` is
   unreachable, so the offer needed discovery, discovery needed the
   offer. Circular, forever.

Result: 0 promises in 36 r5/r6 runs AND 0 in real play — the lever's
centerpiece mechanic (KIN.md: "promises become debts"; "the village's
memory of your choices IS the system") was decoration.

## The lever played (src/js/conversation.js, +~40/-8 lines)

Three coordinated repairs, all in `buildMenu`/`asks`:

1. **Promise discovery hook.** While the promise concept is undiscovered,
   `ask:goal` stays askable (gated on the existing `goalOpen`: trust ≥35
   or relAge ≥8) and rides FIRST in the asks — a discovery action, not a
   topic, so it can't starve behind the topic cap. After the first vow it
   behaves as before. Honors Steve's "discovered, not menued": the hook
   vanishes on discovery.
2. **Sticky opened-up.** `c.goalOpenedUp` persists on the convo record once
   the goal thread reaches depth 2 (set at the top of `buildMenu` — the
   beat-menu early returns would skip it lower down). The old live-state
   computation was the dead circular.
3. **offer_help as earned verb.** Computed in the discovery block, pushed
   after the caps like teach/trade — the old `choices.length < MAXC`
   check starved it behind the topic budget (measured: missing from a
   10-item menu with openedUp set).

`[needs-eyes]` in commit message: this adds a conversation menu choice —
Steve should see the discovery flow on his phone.

## Before/after (identical seeds — 12 seeds × 3 policies × 200d = 36 runs)

Harness: `scripts/sweep-trust-r7.js` (r6 fork). New policies in
`scripts/policies/promiser.js`: **promiser** (makes vows through the real
convo path, keeps via giveFood/tendVillager/substantive talk) and
**oathbreaker** (makes vows, never keeps — the rot path). Also fixed two
harness bugs the measurement exposed: the r6 `promiseHelp` wrap probed
wrong names (`makePromise`/`promise`/`makeVow` — the real name is
`promiseHelp`, so `promisesMade` never fired), and the `checkPromises`
keep/break diff shallow-copied promise objects (mutations invisible —
kept/broken always read 0).

BEFORE (pristine, 3 seeds × promiser/oathbreaker): **0 made / 0 kept /
0 broken** — the dead path, documented on identical seeds.

AFTER (fix, 12 seeds × 3 policies):

| | competent (control) | promiser | oathbreaker |
|---|---|---|---|
| promises made | 0 | **37** | **35** |
| promises kept | 0 | **27** (73%) | 9 (incidental*) |
| promises broken | 0 | 2 | **18** (51%) |
| promise memories (made/kept/broken) | 0/0/0 | 4/1/0 | 3/0/0 |
| trust end mean | 19.2 | 20.4 | 49.0 |
| wins | 0 | 0 | 0 |

*The oathbreaker's 9 incidental keeps are honest: broadcast keep-kinds
(travel/fight/task via travelTo/tbEnd/resolveAssignments) fire from
normal play — you can't vow "I'll watch the roads" and then never travel.

The trust-end means are noise on 1–2 endgame survivors (per-seed values
are 0.0 or 83–90 depending on who lived — the r6 butterfly, not a lever
effect). The honest measurement is the lifecycle: **0 → 72 vows, keeps
and breaks both firing, memories recorded.**

Trust-audit side-finding (blank #5, partial): promise trust events
(`promise:made` +6, `promise:kept` +15) never crack the village top-8 —
deeds dominate (water 2593, fish 1902, feeding 1606). Promises are a
precision instrument (one relationship, big spike), not a trust farm.
That matches the design: "fulfilling a promise is one of the biggest
trust gains in the game" — for THAT villager.

## Reachability verdict

- **The promise system is reachable and now leaves traces**: 72 vows
  across 24 promiser/oathbreaker runs (1–7 per run); keeps pay +15 trust
  with `promise_kept` memories; breaks cost −15 with `promise_broken`
  memories and the quiet devastating line ("Promises rot.").
- **Discovery works when driven**: ask:goal (hook) → goal thread →
  deepen to 2 → offer_help → vow → discovered. Proof test 15/15,
  red-checked (6 discovery assertions fail on pristine).
- **The vow is goal-specific**: "Nobody goes hungry on my watch" (feed),
  "I'll watch the roads" (family), "We make it. All of us" (survive).
- Unchanged: wins 0 (the wall is still food/monsters — all 36 runs
  village-lost); betrayals 0; the favor-commit path (`dlg:commit`) still
  never taken by any policy (documented sub-blank).

## Sense-testing (SENSE-TESTING LAW — transcripts read)

`scripts/sense-trust-r7-20261012.js`, seed 11. The three beats:

**The vow** (David, survive): "David looks at you for a long moment.
'We make it. All of us. That's the deal.' Something in them settles —
hope is a heavy thing to carry alone." — Specific, weighty, no filler.

**The keep**: "David catches your eye across the fire. You kept your
word. That meant everything." — Quiet, earned. The deed line before it
("You press 3 portions of Trail mix into their hands. No one sees. That
matters, somehow.") makes the keep legible as action, not words.

**The break** (Lena, family): "Lena doesn't say anything. But they
stopped looking at you the way they used to. Promises rot. (-15 trust)"
— Understated and devastating. The Codex files it ("a promise you
broke"). This is the tone the system needs.

No sense flags: the lines are goal-specific, the consequences are
legible, and nothing reads robotic.

## Village assessment

The villages that vowed: ordinary struggling villages (median death
day ~80). The promiser's villages look like socialite villages that
also make promises — the vow is a social layer on survival, not a
survival strategy. Who thrived: villagers the promiser vowed to and fed
— one `promise_kept` memory per few runs, small warm lights. Who died:
everyone eventually; the promise system doesn't move the survival curve
(this lever's scope, working as designed).

The meaningful change is qualitative: before r7, villagers could never
hold the player to their word because the player could never give it.
Now they can — and the engine remembers.

## Blanks filled vs documented

**FILLED (this run):**
- Promise discovery: the dead circular repaired (hook + sticky
  opened-up + earned-verb placement). Proof:
  `scripts/test-promise-discovery-20261012.js` **15/15** (red-checked:
  6 discovery assertions fail on pristine, mechanics pass).
- Promise lifecycle measured: 72 vows, 27+9 keeps, 2+18 breaks, trust
  ±15, memories — first long-run data the system has ever had.
  Harness: `scripts/sweep-trust-r7.js`, policies
  `scripts/policies/promiser.js`.
- Harness bugs fixed: `promiseHelp` wrap (wrong names), keep/break
  diff (shallow copy).
- Sense-tested: vow/keep/break transcripts read and judged.

**DOCUMENTED (not this run):**
- takeoversEst negativity when yielded leads die (r4/r5/r6-carried;
  needs the challenge-lifecycle event log).
- `Game.delegateTask` dead path in competent.js (r4/r5/r6-carried;
  confirmed: only `delegateTasks()` plural exists; the policy's
  garden-staffing call no-ops).
- Leave-arc rarity tuning (r5/r6-carried).
- Favor-commit path (`dlg:commit`): no policy takes it; its long-run
  behavior is still unmeasured (sub-blank of the promise economy).
- Promise rate is low (1–7/run) — the discovery dance is multi-step;
  tuning the hook's visibility is future work.
- `test-gossip-drama.js` is flaky (3/6 fail runs with the fix applied —
  but conversation.js isn't loaded by that test; inherent unseeded
  randomness, pre-existing).
- `test-agency-lever-20261011.js`: 1 failure, identical on pristine
  (animal display-name, pre-existing).

## Proof & regressions

- `scripts/test-promise-discovery-20261012.js`: **15/15** (hook, thread,
  sticky flag, offer, vow, discovery, hook-vanish, keep, deed-keep,
  break ×3). Red-checked via stash: 6 discovery FAILs on pristine,
  9 mechanics PASSes.
- `scripts/sense-trust-r7-20261012.js`: vow/keep/break transcripts read.
- Regressions: gossip-norepeat 17/17, convo-engine-trust 7/7,
  social-gossip 9/9, agency-teachv 20/20 — green; agency-lever 16/17
  (1 pre-existing, identical pristine); gossip-drama flaky pre-existing
  (see above); ontology 85/85.
- Stream note: competent was not run in BEFORE (only promiser/
  oathbreaker on 3 seeds); the AFTER competent (12 seeds) is the
  control. The fix adds no Math.random draws to the sim path (hook
  uses unshift, flag is assignment, earned-verb is push) — the
  competent stream is unaffected by construction.

## Files

- `src/js/conversation.js` — promise discovery hook, sticky
  goalOpenedUp, offer_help as earned verb (+~40/−8)
- `scripts/policies/promiser.js` — promiser + oathbreaker policies (new)
- `scripts/sweep-trust-r7.js` — r6 fork + promise telemetry fixes (new)
- `scripts/test-promise-discovery-20261012.js` — proof (new, 15/15)
- `scripts/sense-trust-r7-20261012.js` — sense capture (new)
- `sweep-out/trust-r7-before.json` — 6 pristine runs (0 promises)
- `sweep-out/trust-r7-after.json` — 36 runs (72 vows)
- `evidence/2026-10-12/sim-trust-r7.md` — this file
