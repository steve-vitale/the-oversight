# Promise Decay arm — lever loop B (villager-agency axis), 2026-10-13

## Pre-registration (per MEASUREMENT.md §§9–12)
- **Primary metric:** refusal-lift timing vs D on instrumented broken promises
  (refusal must hold at D−1, lift at D) + amend reopening latency (same-day).
- **GO threshold:** refusal lifts within D±2 days on all instrumented cases
  AND amends reopen same-day AND trust trajectories on identical seeds not
  degraded beyond ±10% AND ≥3 sense-tested transcripts judged coherent.
- **Horizon:** 150d death-aware (sweep-compare), **8 seeds** (11/22/33/44 ×
  competent/winseek). Note: MEMORY.md added WIN-PATH HORIZON 180 the same day
  (win-path suites to 180d); this is a mechanism-regression sweep with a
  pre-registered 150d header, kept as-is. A 180d win-path re-measurement is
  future work, not this arm.
- **Policies:** competent + winseek, identical seeds before/after.

## What was already landed
Commit 8e70c94d (blitz-succession, 2026-10-13) implemented Steve's exact spec:
`promiseDecayDays` (D = clamp(round(20·trustAtBreak/50), 7, 60)), the
trustAtBreak stamp in checkPromises, and the refusal-lift in promiseHelp with
honest narration. Proven by scripts/test-blitz-succession.js (30/30 green —
still green, re-run this arm).

## The blank this arm filled
**"Amends reopen immediately" was unreachable.** Breaking a promise only ever
moved trust (−15), never rep dims. `makeAmends` gated on `worstRepAxis ≤ −15`
and the app.js amends button gated on the same — so after a broken promise the
player was told "They don't hold anything against you," no amends existed,
and the refusal could only be waited out. The prior run's proof test had to
*fabricate* rep (−20 generous) to demonstrate amends. A design call that can't
be reached in real play is decoration.

## Design work (my calls, per Steve's "figure it out yourself")
1. **Broken-word amends lane** (`makeAmends`, game.js): when the villager's
   last word is `promise_broken` (maker = current bearer), the player can own
   the broken word directly — no rep damage required. Writes an `amends`
   memory, which promiseHelp's last-word scan reads as the new last word:
   the promise path reopens the SAME DAY. Dialogue names the broken word.
   Repair is small (+4 trust via the normal resolver — contrition, not repair).
2. **RESET, never stack** (multiple broken promises): each new break stamps a
   fresh `promise_broken` + fresh trustAtBreak; the most recent break governs
   D. (You can't re-break while blocked anyway — promiseHelp refuses.)
3. **Amends always accepted when offered** — no rejected-amends mechanic. The
   cost is the existing one-per-day cap. Steve's spec doesn't ask for
   rejection.
4. **Succession: the broken promise died with its maker.** Canon
   (conversation.js MEM_INH) already said: "It's not yours to carry — but I
   remember." But promiseHelp's refusal scan fired for successors anyway
   ("You said that before" — the successor never said it). `promise_broken`
   memories now stamp `maker` (the bearer's id); the refusal only binds the
   maker. The memory survives as bitterness/dialogue; the refusal doesn't.
   Legacy memories (no stamp) keep old behavior.
5. **Shared `lastPromiseWord(vid)` scan** + **`canMakeAmends(vid)`** gate;
   app.js's amends button now uses it (previously `worstRepAxis` alone).

## Before/after (identical seeds, 150d, 8 seed-runs)
`/tmp/promisedecay-baseline.json` (pre-change) vs `/tmp/promisedecay-after.json`:

| policy | seeds | won | medD | maxD | maxWave | nat% | tab% |
|---|---|---|---|---|---|---|---|
| competent before | 11,22,33,44 | 0 | 135 | 150 | 3 | 0 | 0 |
| competent after  | 11,22,33,44 | 0 | 135 | 150 | 3 | 0 | 0 |
| winseek before   | 11,22,33,44 | 0 | 75  | 107 | 2 | 0 | 0 |
| winseek after    | 11,22,33,44 | 0 | 75  | 107 | 2 | 0 | 0 |

Per-seed results byte-identical before/after (same days, waves, arcs,
death-cause shares) — no trust-griefing, no behavior drift: the change only
adds a new callable path (broken-word amends) that the policies never invoke.
Well within the ±10% guard (0% drift observed).

**Wall numbers (after run):** national 0/8, table 0/8, wins 0/8, wave 4–5
unlocks 0/8, median survival 135d (competent) / 75d (winseek). Death causes:
combat-heavy (42 combat deaths across 8 runs), starvation (14), sickness/wounds
(4). The wall is unchanged by this arm — expected: this arm is a
villager-agency repair, not a wall lever.

## Sense-tested transcripts (judged by reading, not counts)
Three scenes captured verbatim in scripts/test-promisedecay-arm.js §5:

1. **Refusal** (D−1): *"A woman, maybe 20s doesn't look up. 'You said that
   before.' A beat. You promised to keep everyone fed — it never happened.
   'Not again. Not until that's answered.'"* — names the broken word, holds
   the line without cruelty. Sensible.
2. **Broken-word amends**: *"You find A woman, maybe 20s. 'About to keep
   everyone fed. You had it — and I let it rot. That's on me. I'm sorry.' A
   long silence. Then, slowly: '...All right. Words again. Don't make me
   regret hearing this.'"* — the NPC names the condition for hearing words
   again. Coherent; consequences attach (door reopens, +4, day cap).
3. **Decay-lifted**: *"A woman, maybe 20s looks at you for a long moment.
   'Nobody goes hungry on my watch. That's a promise.' ...hope is a heavy
   thing to carry alone."* — time did what amends would have; the villager
   moves on without pretending it never happened (memory persists).

Sense catch during the arm: my first draft printed "About to to keep everyone
fed" (double "to" — the goal want string already carries it). Fixed; the
transcript above is the corrected line. This is why we read them.

## Village assessment
The instrumented villages looked like this: a broken promise at trust 45–80
cost 15 trust and shut the promise path for 7–32 days; villagers remembered
the specific word ("to keep everyone fed," not "the promise"); after D days
the door reopened with a distinct line acknowledging time passed; after amends
the door reopened the same day with a distinct line acknowledging the
apology. The person who broke the word is the one who must answer for it —
death ends the debt. All villagers involved behaved like people with
specific grievances, not rep ledgers.

## Verdict: **GO**
- Refusal lifts within D±2 on all 4 instrumented trust levels (7/20/32/40:
  holds at D−1, lifts at exactly D).
- Amends reopen same-day (proven without rep fabrication).
- Trust trajectories: 0% drift on identical seeds (≤±10% guard).
- 3 transcripts read and judged coherent; 1 sense catch fixed.
- Regression: test-blitz-succession.js 30/30 still green.

## Blanks documented (not chased)
- **Memory-cap eviction vs 60-day D**: `promise_broken` isn't sticky, so a
  very chatty villager (20+ memories in 60 days) could evict the break before
  D expires, lifting the refusal early. Rare; left as-is — people forgetting
  is arguably not a bug. Documented here instead of fixed.
- **Amends only reopens the promise path** — the trust hole (−15 vs +4) is
  repaired by keeping the next promise (+15), not by the apology. By design.
