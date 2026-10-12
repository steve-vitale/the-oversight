# Wave 3–5 Multi-Move Attack Kits

**Date:** 2026-10-12
**Branch:** w35-kits (worktree `~/workspace/worktrees/w35-kits`)
**Parent:** multi-move engine (evidence/2026-10-12/multi-move-engine.md)

## What was built

All 26 wave 3/4/5 monsters now have 2–3 move `attacks` kits in `src/data/monsters.json`
(861-line pure addition, 0 deletions). `attacks[0]` mirrors the legacy `attack`
(back-compat preserved); tile patterns (beam/burst/charge/line) missing windup got
windup 2 (engine rule). Signatures untouched — kits complement, never duplicate.

## Per-monster method palettes (Steve's direction: right method per monster)

**Wave 3 — The System's HR department:**

| Monster | Kit | Methods |
|---|---|---|
| redactor | Redact, Return | (a) multi-move, (f) wacky — redacted things come back (cooldown 3) |
| gavel | Verdict, Accusation (1st-turn), Contempt (bloodied) | (a), (d) procedure-as-stance, (c) bloodied — the court loses patience |
| focus_group | Deliberation, Cold Open (1st-turn), Second Take (rally) | (a), (d) organize, (f) wacky |
| spool | Replay, Record (model) | (a), (d) record/replay cycle — the watching IS a move |
| chorus_line | Downbeat, Syncopation, Crescendo (bloodied, windup 3) | (a), (b) windup, (c) bloodied, (f) rhythm |
| terms_of_service | Clause, Amendment, Binding Arbitration (bloodied) | (a), (d) clause machine, (c) bloodied |
| callback | Encore, Method Acting (1st-turn model), Standing Ovation | (a), (d) face-study, (b) windup |
| buffering | Catch Up, Rewind (reposition), Fast Forward | (a), (d) time-slip, (f) wacky |
| ad_break | Sponsored Pause, Product Placement (recover/exposed), Targeted Ad | (a), (d) sponsor machine, (f) wacky |

**Wave 4 — The Mirror Draft:**

| Monster | Kit | Methods |
|---|---|---|
| congregation | Absolution, Invitation (1st-turn rally), Excommunication (bloodied) | (a), (d) liturgy, (c) bloodied, (b) windup |
| strike | Walkout, Slowdown, Picket Line (withdraw) | (a), (d) labor machine |
| influencer | Ratio, Sponcon (rally), Callout Post (bloodied) | (a), (d) audience machine, (c) bloodied |
| audit | Assessment, Field Audit, Penalty Phase (bloodied) | (a), (d) schedule machine, (c) bloodied, (f) wacky |
| reunion | Your Move, Plus One (rally), Family Photo (bloodied) | (a), (d) mirror machine, (c) bloodied |
| suburb | Property Tax, HOA Fine, Cul-de-sac (reposition) | (a), (d) sprawl machine, (f) wacky |
| eulogy | Final Chapter, Epitaph, Denouement (bloodied) | (a), (d) narration machine, (c) bloodied |
| algorithm | Engagement, Recommended For You, Demonetized (bloodied) | (a), (d) prediction machine, (c) bloodied |
| eater (TITAN Herald) | Gorge, Smack-Rush (charge, windup 2), Graze (recover) | (a), (d) hunger machine, titan-scale; recover = punish window |

**Wave 5 — The Producers:**

| Monster | Kit | Methods |
|---|---|---|
| cancellation | Under Review, Pilot Season (1st-turn), Pulled From Schedule (bloodied) | (a), (d) network machine, (c) bloodied |
| editor | Cut, Trim, Director's Cut (bloodied, windup 3) | (a), (b) windup ladder 2→3, (c) bloodied |
| rerun | Take Twelve, Cold Open (1st-turn), Notes Session | (a), (d) take machine, (f) wacky |
| spoiler | Leaked Ending, Post-Credits Scene (bloodied) | MINIMAL by design — the announcement hook IS the fight (ae3ae9f4); PCS only below 50% |
| timeslot | Reschedule, Lead-In, Sweeps Stunt (bloodied, windup 3) | (a), (b) windup, (c) bloodied, (d) venue machine |
| nielsen (TITAN) | Sweeps Week, Overnight Ratings (model), Demo Derby (bloodied) | (a), (d) ratings machine, (f) wacky, titan-scale |
| finale (TITAN) | Season Finale, Previously On, Cliffhanger | (a), (b) windup, (d) escalation; signature countdown untouched — NOT weakened |
| network_note | Just Fix It, Circle Back (rally), Per My Last Email | (a), (d) notes machine, (f) wacky |

EXT = fiction-fitting extension where the codex documents fewer moves than the kit
needs (same convention as wave-2 kits). No EXT move contradicts a codex entry.

## Proof

`scripts/test-multi-move-w35-20261012.js` — **216/216 × 3 seeds** (20261012, 777, 424242):
- A: all 26 have ≥2 attacks; attacks[0] == legacy; every codex-documented move in kit; every move has telegraph text
- B: all tile patterns windup ≥ 2
- C: firstTurn openers legal/illegal; bloodied phases legal/illegal; cooldowns fire then rest
- D: telegraph commits chosen move; odds at stage 2 unlearned → exact when learned
- E: tactics execute (rally buffs allies, reposition moves, withdraw retreats, recover exposes, model increments)
- F: spoiler minimal (2 moves, PCS bloodied-gated so the hook dominates)
- G: titan kits present; kit top damage ≥ legacy (undiminished)

Regressions (all green):
- `test-wave35-mechanics.js` 40/40
- `test-sigW5.js` 144/144
- `test-multi-move-20261012.js` 139/139 (needed a table.js load-order fix in the test harness — the shared /tmp/harness-list.txt orders table.js after table-*.js; pre-existing, unrelated to this change)
- `test-titan-class.js` 31/31
- `test-combat-break-20261010.js` 19/19

## Balance notes for the matrix worker (NOT retuned here — your job)

1. **Editor stalemate (known):** 81-turn stalemate vs tier C — flat monster armor reduces spear hits to ~1 while terrain permanently blocks Editor's Cut. Kits add Trim (smaller line, cooldown 2) and Director's Cut (bloodied nuke) but do NOT fix the blocked-lane AI. Needs monster repositioning around blocked lanes.
2. **Finale burst stacking:** Cliffhanger [70,100] direct (cooldown 4) + signature's unavoidable [150,200] countdown can land in the same window. Intentional titan pressure, but verify the combined burst doesn't one-shot through intended counters (sacrifice/DPS race).
3. **Wave-4 HP pools (900–1500) vs new damage:** kits raise monster damage output ~15–30% on bloodied/cooldown-gated moves. The wave-3→4 discontinuity was already steep; re-measure tier C/D win rates.
4. **Eater Graze (recover):** exposes the titan (+50% damage taken, 2 turns) below 60% HP every 4 turns. Intended punish window, but at titan HP (950–1150) verify it doesn't become a DPS-race shortcut that trivializes the Herald gate.
5. **Nielsen Demo Derby [68,98] + Sweeps Week [50,80]:** titan single-target pressure is high; the intended counter is fighting boring (ratings starvation), which the matrix sims don't model — expect sims to overstate Nielsen difficulty vs real play.
6. **Spoiler:** kit is minimal (2 moves); the hook does the real work. Sims measuring only `attacks` will understate it.

## Files

- `src/data/monsters.json` — 26 kits (861 insertions, 0 deletions)
- `scripts/test-multi-move-w35-20261012.js` — proof (216 × 3 seeds)
- `scripts/test-multi-move-20261012.js` — harness load-order fix (table.js before table-*.js)
- `/tmp/w35-kits.js` — build script (ephemeral; kits now live in the JSON)
