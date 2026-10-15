# Nomad changed-reunion choice UI (2026-10-15)

## What
The 'changed' reunion at The Long Way Home used to narrate the situation and then silently walk on (the road default). Now it holds three real choices open as a beats-row beat: **ASK / LEAVE / FIGHT**.

## Design
- **ASK** — a spoken scene per changed kind (leads / ascended / hostile). The NPC wants something (a leader's blessing to stay, a shining thing's message for the System, a hostile survivor's terms). Leads kind sends the party off with a 1,500 kcal pack (the old 'trade' content, folded in honestly).
- **LEAVE** — the old road default, now narrated honestly per kind.
- **FIGHT** — a real DUEL: the bearer steps up alone against their kin, one blow-by-blow bout through `Game.fieldFight` with the kin's real attack kit (person-scale: 50hp, knife/swing/lunge). Never an outcome table.
  - vKill → 'grave' (dark; `moralLedger.kinKills++`). Rare with fresh bearers — the window opens as the bearer gears up (kill needs one round dealing >25% of kin hp).
  - mFlee → the kin breaks; the party (four pairs of legs) runs them down and brings them home FORCED → 'alive' as a companion (`forced: true`). A reunion, but not the one anyone wanted.
  - vDie → bearer falls → `nomadKill` (mantle stays in the party; wiped ends the road); the kin flees in horror → 'changed'.
  - vFlee/evade → bearer backs down → 'changed', bloodied, -25% food.
- An unanswered choice auto-resolves to LEAVE at the next tick — never a prompt, deterministic for sims (the old behavior, preserved).
- UI: beats-row statrow with three `btn sm` buttons (`data-beat="nch:<id>"`), routed to `Game.nomadDrive.changedTap()` → `chooseReunion()` → `refresh()`. Same pattern as the other open beats.
- Knowledge-gating: labels reveal nothing unknowable; the beat only renders after the reunion scene played.

## Design findings while building
- The engine's morale model makes vKill nearly unreachable for a lone opponent (the break always fires first) — 0/300 at 70hp, 0/120 at 35hp. The duel + forced-capture design works WITH this instead of against it.
- Pre-existing bug fixed: the all-found epilogue joined `foundKin` objects directly → "[object Object]" in the ending text. Now maps to `.name`.

## Proofs
`scripts/test-nomadchanged-ui.js` — 40/40 green (seeded, sim-harness).
- (a) exactly ask/leave/fight, labels knowledge-safe, kind deterministic.
- (b) ASK: real scene, names the kin, no template rot; leads +1500 kcal.
- (c) LEAVE: narrates walking on; matches old default.
- (d) FIGHT: 12 bouts across seeds, all real rounds with logs; WIN (joined-forced) 5/12, LOSE (bloodied) 7/12 observed; state matches each outcome (forced companion recorded, food loss on lose).
- (e) road closes all-found, supplies/legs consistent.
- Auto-resolve: unanswered choice → leave at next tick.
- RED: with `chooseReunion` removed, the harness fails (`D.chooseReunion is not a function`).

Regression: all 13 nomad suites green (check 4/4, wild 53/53, scenes 54/54, integration 11/11, drive 21/21, ui 13/13, changed-ui 40/40). Ontology 114/114.

## Needs eyes on a phone
The beats-row buttons render in the statgrid area (above the fold, no scroll) — but the reunion scene's lines go to the narration box while the buttons sit in the beats row. On a phone, verify the player connects the three buttons to the reunion they just read. If it feels disconnected, the beat may need the kin's name more prominently (it has it: "◈ <name> — the choice sits open.").
