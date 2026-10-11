# Break-it r16 — shows & broadcast (2026-10-11)

Hostile-player attack on `src/js/broadcast.js` + `src/js/contests.js` show/summons paths.
Prior rounds r10–r15 covered: dip-flag re-summon, phase-graph termination, 2/week budget,
watch-mode bet, villager-show end paths, show whim, dead-code sweep of modules/beats,
care-package/boon gates. This round attacked what was NOT covered. Canon read first:
docs/CANON.md, docs/CONTESTS.md.

## K1 (BROKE + FIXED): dead commentary pool — BROADCAST_LINES.summons never fired

**The attack.** Three authored summons commentary lines ("BREAKING: the numbers are
soft...") existed in `G.BROADCAST_LINES.summons` but no code path ever drew them.
`broadcastBeat` is only ever called with beat names classifying (via `classifyBeat`) to
declare/triumph/embarrassment/refused/together/feast/deathreel — the summons phase
declares `beat: 'showDeclare'` (→ declare) and `_showEnd` fires SHOW_WON/LOST/MIXED/REFUSED.
`fireRatingsSummons` never called `broadcastBeat` at all after `broadcastStart`. Dead
copy, written and paid for, never heard.

**Proof (before).** Instrumented `broadcastBeat` around `fireRatingsSummons` + all three
choice paths (stunt / phone-in / refuse): beats fired were `["showDeclare","SHOW_REFUSED"]`
— zero beats classifying to `summons`. Static sweep: the `summons` pool had no producer
across all literal `broadcastBeat(...)` call sites + dynamic SHOW_/SHOW_VILLAGER_ + phase
beats. (Proof script `scripts/test-shows-breakit-r16-20261011.js` K1, K3b — failed pre-fix.)

**Fix.** `src/js/contests.js`, `fireRatingsSummons`: after `broadcastStart`, added
`try { this.broadcastBeat('__summons', {}); } catch (e) {}` — mirrors the `'__pull'`
pattern in `broadcastStart`; `classifyBeat` already maps `'__summons'` to the summons
pool via the `/summons/i` rule, so no broadcast.js change needed.

**Proof (after).** K1: a summons-classified beat fires during `fireRatingsSummons`; the
fired line is byte-identical to a `BROADCAST_LINES.summons` entry and lands in the
ticker. 22/22 assertions × 3 seeds (424242, 777001, 999983).

## K2 (BROKE + FIXED): undisclosed choice costs — 52/90 SHOW_BEATS choices

**The attack.** The standing convention (ratings summons "Do the stunt" → sub
"200 kcal, 4 trauma — full commitment"; showTogether "Bring the good snacks" → sub
"150 kcal, worth it") says expensive buttons name their cost. A programmatic audit of
all 30 SHOW_BEATS / 90 choices (extracted the `G.SHOW_BEATS` literal from source,
compared each choice's `do` fields against its label/sub text) found **52 choices with
material costs/rewards nowhere disclosed**: kcal deltas (e.g. why_eat "Cook the comfort
dish" −150 kcal, sub "the one your grandmother made"), trauma ≥2 (37 choices, up to
museum_of_you "Open one closed room" 8 trauma, sub "the bravest TV"), one dmg range
(mouth_race "Speed, no fear" dmg [0,4], sub "burners up, fingers down"), one heal
(nap_wars "Commit to the nap" heal 5, sub "sleep like the dead"), and three `prize:true`
(tiny_door "Go through", lost_found "Take it back", infomercial "Buy it yourself").

**Three sharper breaks inside the audit:**
- **Silent heal.** `contestChoose` narrated `d.dmg` ("You take N damage") but `d.heal`
  landed with zero narration — nap_wars +5 health was described only as a nap. Proof:
  ran the choice in the harness, health moved 70→75, no heal line in sysSay (failed pre-fix).
- **Win-text lie.** mystery_smell "Follow your nose" `win:` said "The catering crate
  feeds the village" while the engine grants +200 kcal to the PLAYER only. Proof:
  harness `_showEnd` won path, scholar kcal +200, text claimed the village ate (failed pre-fix).
- **Pre-commit silence.** All 52 above (static audit, failed pre-fix at 52/90).

**Fix.** (1) All 52 subs annotated in Steve's terse voice — costs appended as
"— -150 kcal", "— 3 trauma", "— 0-4 dmg", "— +5 health", "— +200 kcal, prize",
"— 3 trauma, prize", "— prize, 2 trauma". (2) `contestChoose`: `d.heal` now says
`📺 You recover ${d.heal} health.` next to the damage line. `d.heal` is used by exactly
one choice in the codebase (nap_wars) — verified by grep across src/js — so the new
line fires nowhere unintended. (3) mystery_smell `win:` rewritten: "The catering crate
feeds YOU. \"Mistake,\" the System says. Nobody believes it. You eat. The village
watches, envious, for once on the other side of the screen."

**Proof (after).** Static audit re-extracted from the fixed source: **0/90 flagged**;
heal sysSay present; win text no longer claims the village eats and says the player
ate. 22/22 × 3 seeds.

## Held (attacked, did not break)

- **K3a — contest phase-builder disclosure (sibling sweep).** 293 `do:` lines with
  material fields outside SHOW_BEATS/summons (kcal 70, trauma 68, dmg 80, heal 1,
  reqKcal 0, prize 74). Active-contradiction scan (sub claims safe/free/painless while
  `do` costs dmg/trauma/kcal): exactly one hit — contestDice "Play it safe / small
  bets" with kcal −50 — and the 50-kcal ante is said out loud in the phase text
  ("ANTE, FIFTY"); the sub names the cheaper line of play relative to staking
  memories/pride. Not misleading; no change. Contest subs otherwise don't name
  exact numbers, which matches the contest fear design (death on the table is the
  announced premise) — shows are the honest-cost surface per the established convention.
- **K3c — end values.** Every SHOW_BEATS choice `end` ∈ {won,lost,mixed} (no strays).
  complaint_box, karaoke, rose_ceremony, AND infomercial carry `lose: ''` texts — none
  has a 'lost' choice, so all four are unreachable, and `_showEnd`'s lose fallback
  ("It went badly...") covers the gap. Confirmed, not changed (the fallback is the
  designed cover).
- **K3b — pool coverage.** After the K1 fix, all 11 BROADCAST_LINES pools have a real
  producer (declare, pull via `__pull`, tension via Escalate/Climax beats, triumph,
  embarrassment, deathreel via `__replay`, summons via `__summons`, together, feast,
  refused, generic). The `beat: 'name'` triple (moot show phases) falls through to
  `generic` — acceptable, not dead.

## Regressions

- r16: 22/22 × 3 seeds · r15: 486/486 · test-shows-break-20261010: 81/81 ·
  test-break-contests-20261010: 50/50 · test-fameseeker-20261010: 41/41 ·
  test-break-contest-r10: 20/20 — all green.
- Ontology: 63/63 validated.

## Files

- `src/js/contests.js` — K1 (summons beat fire + comment), K2a (heal sysSay + comment),
  K2b (mystery_smell win rewrite), K2c (52 sub annotations).
- `scripts/test-shows-breakit-r16-20261011.js` — 22 assertions × 3 seeds (harness).
- No broadcast.js change needed (classifyBeat already mapped `__summons`).

## Canon gaps (noted, not built)

- `fracture`/`unity`/`fanLane` moves in show choices remain undisclosed by design
  scope — they're social, not mechanical, costs ("the village remembers what you
  traded"). Candidate for a future convention pass; Steve's call.
- Pilot episode + "the show is restless" teaser: still unimplemented, still
  unclaimed by any copy (r15 noted, no change).
