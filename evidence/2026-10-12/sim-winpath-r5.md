# Longsim win-path lever r5 (lever 10: arcs → national → table → win) — 2026-10-12

Follow-up to `sim-winpath-r4.md` and the travel-r5 documented blank:
**"table scene never stages even at lesser seat + Arc IV (died one dawn
short — winpath lever's trigger timing)"** (travel r5, seed 1: lesser seat
+ Arc IV assembled, died day 79 before the table's dawn check).

## The prime-target investigation: the staging gate, reproduced

On current master (98c73e3e) the staging gate **works**. Instrumented
reproduction of the exact travel-r5 seed (fedseek, seed 1, pristine HEAD):

- d68: lesser seat prices (waves 11/6/4, 8 contests, 3 crises, national, stage 3, food deeds)
- d68: Arc IV (`want>=3` + seat → `want=4`; `arcBeat(4)` sets `tableWaiting=true`)
- d68/d69: the endDay wrapper fires `tableScene()` the same dawn — audit,
  paths offered, `tableDone=true`

The travel-r5 "never staged" was an **older-commit timing artifact**: on
that commit the seat assembled ~day 78 and death won the race on day 79.
Nothing in the trigger chain (`checkArc` → `tableWaiting` → dawn
`tableScene` → seat re-check) is broken. The deed-gate re-check at dawn
(withdraw-aloud path) never misfired in any instrumented run.

**The genuine block was one link further down.** The table challenge is a
*synchronous modal chain* — every answer immediately presents the next
beat; there is no design reason for a day boundary between beats. But the
winseek policy answered **once per game-day**, so a 5-prompt sequence
(path + 3 beats + final) cost ~4 game-days of ambient-death exposure. The
closest-ever runs died with the finals pending:
- completion-r1 arm B seed 1: table fired d70, village lost d72
- winpath r5 seed 1 (before): table fired d69, finals pending d72, bearer
  died that night, village lost d73-game-time

A human player clicks through the modal in one sitting. The once-per-day
was a harness artifact, not game design.

## The lever played (ONE change, scripts-only, no src/ touched)

`scripts/policies/winseek.js` — `tableRoad` now **drains the prompt
queue**: answer `options[0]`, re-read the prompt, repeat until no choice
is pending, the game ends, a real fight starts (trial-by-combat pauses the
challenge — the harness drives the fight), a 30-answer safety cap, or the
prompt stops changing (stall guard). It never picks the trial door
(options[0] is never the trial), never invents answers — it just doesn't
sleep between beats. `tableRoad` is now exported for direct testing.
`ctx.tableAnswers` counts drained answers for the sweep.

Steve's laws hold: the seat bars are untouched (table PRICES the run —
the audit still reads the real ledger aloud); failure still resolves the
story (downgrade paths, never wipe); no food/combat/wave retuning (other
levers' territory). No `[needs-eyes]` — sim policy only, zero game-feel
change.

## Before/after (identical seeds 1–16 × competent/winseek/fedseek × 200d = 48 runs)

Baseline: pristine HEAD (worktree clean at 98c73e3e; policies
`require`d once at sweep start, before the policy edit — no
contamination). After: same seeds, drain policy.

| metric | before | after |
|---|---|---|
| table fired | 1 | 1 |
| **won** | **0** | **1** |
| arc ≥ 4 | 1 | 1 |
| lesser seat (end-state) | 1 | 1 |
| national reach | 1 | 1 |
| wave-3 faced ≥ 3 | 6 | 6 |
| median / max days | 40 / 152 | 40 / 152 |
| death causes | combat 191, villager-combat 149, monster 107, starvation 35 | combat 190, villager-combat 149, monster 107, starvation 35 |

The drain moved **exactly one thing**: the table sequence resolves. Every
upstream number is identical — the lever is pure chain-resolution, as
designed.

**The win** (after, fedseek seed 1): lesser seat d68 → Arc IV d68 →
table d69 → 5 answers drained (path:feared + 3 beats + final:mercy) →
**`won=true` d69, `endReason=over-other`, branch light, phase done.**
First organic win in any winpath/completion sweep. The winning row:
national d60, 11/6/4 faced, 7 contests, 3 crises, breadth 53, stage 3,
12 counters discovered / 7 counter-kills, 6 successions (mantle passed 6
times — the village-as-protagonist continuity carried the run to the
table), vests: belong (four-realm formed).

## Reachability verdict per chain link (200-day sims, n=48)

| link | verdict |
|---|---|
| Arc II / III | reachable (48/46) |
| Arc IV | reachable (1/48 — the seat is the gate, and the gate is honest) |
| regional / national | reachable (23 / 1) |
| lesser seat | reachable (1/48, end-state) — priced, never gifted |
| full seat | **0/48 — decoration so far** (needs all five waves; waves 4–5 unreachable) |
| table staging | **works** — fires the dawn the seat+Arc IV assemble |
| table → win | **works** — the full chain resolves once staged (1/1 staged runs won after the drain) |
| waves 4–5 | **0/48 — unreachable organically** (wave lever's on-ramp owns this) |
| global | 0/48 |
| havenTier 2 | 0/48 (separate axis; never reached even at national) |

## Sense-testing (transcript read — SENSE-TESTING LAW)

**PASS — the win transcript is the best thing this loop has read.**
The d69 feared run, beat by beat:

- The audit is honest: *"A lesser seat — national standing, waves 1–3
  faced (11/6/4), 7 contests survived, 3 crises weathered. The table does
  not rise. It prices."* — every number true.
- Door gifts with flavor (War-table: *"You read the table's fear the way
  you read weather. The Nielsen flinches first — you saw it."*;
  Oathbound: *"Your terror is pledged as a shield"*).
- The beats cohere as an arc: *"The deer. The cleanest kill. The table
  goes very still. Behind you, your own people go still too — a different
  stillness."* → *"You let them see it. All of it."* → *"You spend it —
  the shield, not the sword."* → finals: *"The most frightening thing you
  ever did... the audience weeps, and the galaxy learns that the feared
  one chose gentleness."*
- The ending lands: *"You won. Say it plainly: you won. The village
  endures. The table signed."*

**PASS — the climb's scenes read like people, not systems.**
- d57: *"🤝 James kneels at Thornfield's court and swears the oath —
  sealed with 3,000 kcal of Haven's harvest. The realm has its fires now,
  and one of them is yours. (Trust +12.)"* — named villager, real kcal,
  real consequence.
- d62: *"💬 Lena says: 'My kid asked if the watchers have favorites. I
  didn't know what to tell her.'"* — a mother, a kid, a real question.
- d67–68 (grief beats): *"With Haven grieving, Emberhold installs their
  own speaker at the table. Tribute rises to 11,250 kcal/week. Grief is
  leverage, and they know it. The link holds — it was never with one
  person."* For young bonds the verdict delays honestly (*"send grain
  (1,500 kcal), send a speaker (2 days), or let the silence answer"*) —
  and the policy's grain answer pays off: *"🕊️ Haven sends 1,580 kcal to
  The Bloodied's fire — grief met with grain... (Trust +8.)"*
- d68: *"The table is being set — a lesser seat, priced for what you
  built."* then the Arc IV beat, honest about the lesser seat (*"yours,
  though unfinished, are undeniable"*).

**NOTED (not fixed — routine status, not dialogue):** *"Tribute is
already current this week — the pantry keeps its food."* repeats ~10×;
*"Tribute paid: X kcal walks out of the pantry toward Y. The relationship
holds."* repeats with varying numbers. Ledger lines, honest, not blanks.

## Village assessment (plain words)

Forty-eight villages, and they mostly die the way villages die: in
fights. Combat and villager-combat and monsters account for ~83% of the
447 recorded deaths; starvation takes 7%, wounds that won't close another
few. Median life is 40 days; the longest run made 152. Twenty-three
reached regional, eight vested (all belong-shape four-realms), one made
national — and that one, fed through the food wall, climbed the whole
ladder: regional at day 25, the oath sworn at Thornfield's court on day
57 by a villager named James, national on day 60, Arc IV and a priced
lesser seat on day 68, the table on day 69, and then — for the first time
in any of these sweeps — the win. Six times the bearer died and the
mantle passed, twice in the two days before the table; the village, not
the hero, is what reached the ring of pale light. The other 47 villages
never got near: they bled out in waves 1–3, most before day 45, with
wave-3 deeds the far wall (6/48 faced 3+). What was missing was never
mysterious — time, food, and surviving the fights. The chain itself, once
a village lives long enough to touch it, is all walkable: every rung
fired, every beat answered, the audit honest, the win real.

## Blanks: filled vs documented

- **FILLED**: the table→win link — the prompt-drain (scripts-only). The
  full chain arcs→national→table→win is now proven end to end on current
  master: 0/48 → 1/48 wins on identical seeds, with the staged run
  resolving to `won=true`.
- **FILLED (investigation)**: the travel-r5 "table never stages" blank —
  reproduced and closed: the staging gate works on current master; the
  old report was a timing artifact of an earlier commit.
- **DOCUMENTED**: full seat 0/48 — decoration until waves 4–5 are
  reachable (wave lever's on-ramp, not this lever).
- **DOCUMENTED**: waves 4–5 0/48 both arms — unchanged, wave lever's
  territory.
- **DOCUMENTED**: havenTier 2 0/48 — never reached even at national;
  unowned by any current lever rotation slot; filed for a future round.
- **DOCUMENTED**: the once-per-day artifact also inflated every prior
  "died during the table" report — completion-r1's arm-B seed-1 loss
  (table fired d70, lost d72) was measured under the old policy.

## Proof test

`scripts/test-tablechain-20261012.js`: **15/15 green** (real lesser-seat
state, no stubs — seat prices, scene stages, drain walks path→beats→
finals→WON in one call, stall guard terminates, stops on game-over,
mantle pass keeps the table answerable and the successor wins).

## Files

- Policy: `scripts/policies/winseek.js` (`tableRoad` drains the prompt
  queue; exported for testing; `ctx.tableAnswers`)
- Instrument: `scripts/sweep-winpath-r5.js` (48-run funnel: arcs, waves,
  ranks, seats, table path/phase/answers, won, vests/four-realm,
  havenTier, traps by source, counter-kills, successions/young-link,
  death shares)
- Proof: `scripts/test-tablechain-20261012.js` (15/15)
- Diag (sense-testing): `scripts/diag-tabletranscript-20261012.js`,
  `scripts/diag-winpathscenes-20261012.js` (+ chain forensics:
  `diag-tablechain/-tableseq/-tablefinals/-tableiter/-tabledeaths/-tableloop-20261012.js`)
- Evidence: this file
- Data: `/tmp/wp-r5-baseline.json`, `/tmp/wp-r5-after.json`,
  `/tmp/wp-r5-baseline.log`, `/tmp/wp-r5-after.log`

## Regressions

- test-tablechain-20261012: 15/15 green
- test-table-core-20261011: 31/31 green
- ontology: 85/85 validated, "Release permitted"
- No src/ touched — game code, balance, and feel unchanged
