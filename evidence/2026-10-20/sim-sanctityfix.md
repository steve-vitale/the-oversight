# sim-sanctityfix — table-sanctity ambient-router gates (flesh-out loop, 2026-10-19, FIX arm)

Run: oversight-flesh-out-loop, arm sim-sanctityfix (the named next from
fleshout-20261020T0015Z's arm sim-sanctityaudit, commit 74fa846ed —
DIAG-GO). Axis: scale-onramp (standing directive); the table is the
scale-onramp's endpoint and its sanctity is the contract that makes the
finale legible.
GAME-CODE FIX. File scope: src/js/game.js (4 surgical gates),
scripts/test-sanctityfix.js (new proof), scripts/test-sanctityaudit-20261019.js
(re-pinned SITES/GATES tables + cover fields — the fix moved its pinned
lines), this evidence file.

Canon: docs/CANON.md + docs/TABLE.md — sanctity of the table (Steve
2026-10-12): "When the table sits, the world holds its breath: ambient
monster pressure against villagers is suspended for the whole sequence —
no random field fights, no wild encounters, no patrol contact, and no new
raids. ... ALL stakes during the finale are the table's own — pricing,
branches, trial by combat (the one opt-in existential risk). Deaths during
the finale must be meaningful, never background wolves." Plus the
"hold but do not gorge" law: "Raiders already at the treeline hold but do
not gorge nightly; the crisis stays open and the player may still answer
the call for help."

## PRE-REGISTRATION (binding, docs/MEASUREMENT.md §§9–12, 14 — written BEFORE the fix)

**PRIMARY (fix-arm GO):** the harness REPLAY of the s64203 d90-suburb
incident (suburb lingerer on the Haven tile, bearer at Haven,
tableActive()=true, tick monsterTurn()):
1. RED pre-fix: startCombat fires at an ambient site with tableActive()=true
   (reproduces the corpus incident).
2. GREEN post-fix: zero ambient fires across 200 monsterTurn ticks; the
   lingerer stays pinned on the Haven tile (siege persists — "hold but do
   not gorge"); the glasswing trap trigger (the player's own device) stays
   live during sanctity; the trial-by-combat entry
   (startCombat('finale', {tableTrial:true})) still fires; startCombat's own
   body contains no sanctity gate.
3. REGRESSION: fixed tree vs pristine-HEAD baseline tree, identical seeds,
   sanctity never active — per-day trajectory hashes byte-identical (the
   change alters nothing outside sanctity).

**GO bar:** A1 RED pre-fix AND all GREEN post-fix, and the DET leg
byte-identical. A miss is NO-GO, never re-scored (§14).

**Seeds:** replay seed 64203 (the corpus incident seed); DET seeds 7, 42 ×
60d, idle/zero policy (the table can never sit — sanctity stays OFF).

**Metric review:** (filled at end of run — see below)

## The gap (from the audit)

The engine's sanctity gates covered patrols (game.js:7307) and
villagerMonsterTick (game.js:18804) — NOT monsterTurn()'s stance machine
(8 ambient startCombat sites) and NOT reengageWaitingMonsters. The
corpus incident: pre-sitting raid lingerers re-pinned to the Haven tile
(havenGrowth.js — the re-pinning is UNGATED, only the gorge is gated),
engaged via the ungated monsterTurn path while tableActive()=true —
d90 'suburb' + d91 'eulogy' wave-4 fights at Haven, killing two
post-trial scholars (Olivia, Ekua).

## The fix (src/js/game.js, 4 gates — surgical, no other files touched)

1. **monsterTurn() — game.js:21678** (after the glasswing-trap block):
   `if (this.tableActive && this.tableActive()) return;` — the single
   choke point covering all 8 ambient stance sites (hummice sonar/bump,
   dark-bump, ambush, territorial, hungry, cautious, default). The
   glasswing trigger above is the player's own device and stays live.
   During sanctity the world-monster holds position — the lingerer stays
   pinned but never engages ("hold but do not gorge").
2. **reengageWaitingMonsters() — game.js:11081**: belt-and-braces
   `if (this.tableActive && this.tableActive()) return;` — never a silent
   stash consumption.
3. **exitBuilding() hall-door caller — game.js:11061**: the stash
   consumption + re-engage wrapped in
   `if (!(this.tableActive && this.tableActive()))` — the siege holds
   mid-finale: nothing consumed, nothing re-engaged. They'll be here after.
4. **treelineAmbush() — game.js:11122**: early `return false` during
   sanctity, before stash consumption — no treeline ambush mid-finale, the
   stash untouched, the crisis stays open for after the table rises.

Deliberately untouched: the trial (table-feared.js:158 — the table's own
stake, must NEVER be gated); contests; player-initiated paths (trap,
tent, feast draw, UI); the lingerer treeline re-pinning (the siege
persists — only mid-finale ENGAGEMENT is gated); fights already underway
pre-sitting (monsterTurn never ticks with tbfight active — verified at
game.js:18434 `if (!this.tbfight) this.monsterTurn();`).

## Proof: scripts/test-sanctityfix.js

RED-verified on the pristine-HEAD baseline tree (/tmp/sanctbase, game.js
restored from `git show HEAD:src/js/game.js`, byte-identical), all GREEN
on the fixed tree:

**RED (baseline, pre-fix):**
- A1 FAIL — suburb fired with tableActive()=true (the corpus incident reproduced: 5 monsterTurn ticks)
- B1 FAIL — exitBuilding re-engaged during sanctity (fires=1, stash partially consumed)
- B2 FAIL — treelineAmbush fired during sanctity (amb=true, fires=1)
- B3/B4 PASS — sanctity-off behavior intact (the control)

**GREEN (fixed tree, post-fix):**
- PART A (replay): A1 PASS (200 monsterTurn ticks, zero ambient fires);
  A2 PASS (linger still pinned at Haven); A3 PASS (glasswing trigger live
  during sanctity); A4 PASS (trial entry ungated); A5 PASS (startCombat
  body contains no sanctity gate — the trial can never be blocked)
- PART B (re-engage): B1 PASS (sanctity ON: no re-engage, stash held at
  len=2); B2 PASS (sanctity ON: ambush refused, stash held); B3 PASS
  (sanctity OFF: exitBuilding re-engages — 1 fire); B4 PASS (sanctity OFF:
  direct reengage fires — the gate is the causal delta)
- PART C (DET): s7 + s42 × 60d, baseline-vs-fixed BYTE-IDENTICAL
  (60 day-hashes each), sanctity never active on either leg — the change
  alters nothing outside sanctity

`node scripts/check.js --quick`: 253 passed, 4 failed in 619s. All 4
failures are the two assertions in scripts/godpath/test-phone-frame-proof.js
("every retained browser input matches current source" + "current phone
evidence is required"). INVESTIGATED, not mine to fix: the retained receipt
hashes 13 source files as stale — 12 of them (index.html, build-notes.json,
characterGen.json, betrayal.js, build.js, contests.js, conversation.js,
convo-wants.js, havenGrowth.js, ledger.js, table.js, villager-agency.js) I
never touched, so the proof was ALREADY failing on pristine HEAD (siblings'
commits after the last receipt refresh). My game.js change adds the 13th
stale input. Refreshing requires real Chromium touch receipts via
scripts/phone-frame-proof-update.js (16-stage, 390×736 + 390×844, real
conversation + Wait/escape journey) — browser work this arm cannot do;
proof hashes must never be hand-edited. Flagged for the coordinator: the
phone-frame receipt needs a browser-capable refresh run.

## Village assessment (what the fix means for the fiction)

Before: the finale could be ambushed by background wolves — the audit's
say-log at the breach had the fiction screaming "THE BREACH. It got
INSIDE" while the table sat, with no table voice, no stake, no meaning.
Two post-trial scholars died as seated-raid background deaths — exactly
what TABLE.md forbids. After: when the table sits, the treeline holds its
breath. Raiders already at the walls stay there — the player can SEE the
siege waiting (the lingerer is still pinned, patrols walk an empty
perimeter) but it does not gorge mid-finale. The crisis stays open: after
the table rises, the stash is intact and the killer is still pacing where
the walls end. Every death during the finale is now the table's own.

## Sense-testing note

Read the incident fiction against TABLE.md: the d89 eulogy aid-fight
(pre-sitting, player answers the call for help) is legitimate and
untouched by this fix. The d90 suburb and d91 eulogy fights were the
violations — both routed through the now-gated monsterTurn stance
machine. Post-fix, the same construction produces 200 silent ticks: the
monster holds, the table's own stakes (pricing, branches, trial) are the
only things that can draw blood. The fiction and the canon now agree.

## Metric review

The pre-registered metric (REPLAY RED→GREEN + DET byte-identical) proved
the right instrument — no revision proposed. One construction note for
the next run: the A3 glasswing leg needs the incident lingerer removed
first (playerMonster() returns the nearest monster, so the suburb shadows
the glasswing) — recorded in the script. The DET leg's baseline tree
lives in /tmp and is wiped by service restarts; the script's partC
rebuild expectation is documented in its header (the coordinator run
rebuilt it once mid-run).

## Convergence note

Axis: scale-onramp (standing directive). This arm does not move the
national/table/wins numbers — it repairs the table's sanctity contract,
which the scale-onramp's endpoint depends on: a finale that can be
ambushed by background wolves is not a legible endpoint for any run that
reaches it. The wall numbers are the sibling loop's beat; this arm's
convergence state: the audit's DIAG-GO is now FIXED-and-proven
(converging → the two uncovered routers are covered; the audit's static
instrument re-pinned and PASSing with 0 uncovered ambient sites).
No new systems, per ROOT-CAUSE-FIRST — 4 early-returns on an existing
predicate, exactly where the audit pointed.

## Backlog check

sim-findings.md checked before planning: no claimed item matched this
arm's scope. One observation filed for the backlog (not chased — stayed
on axis): checkEncounter() has no tableActive gate, but it early-returns
on safe tiles and the seated bearer is at Haven (safe) for the whole
sequence — inert during the finale by construction, not a live gap.

## Coordinator addendum — sibling collision (2026-10-20, run fleshout-20261020T0215Z)

The playtest loop's journey-scale r10 (commit 7024fd22b, landed 02:43Z)
implemented the IDENTICAL fix from the same audit named next 35 minutes
before this arm's commit (38c40cd94, 03:18Z): monsterTurn contact block +
both reengageWaitingMonsters callers (hall-door exitBuilding, treelineAmbush)
gated on tableActive(), trial/player paths/lingerer re-pinning untouched,
with its own RED→GREEN proof (11/11) + 8-seed sweep (0 ambient fights
during sanctity). Hunk-by-hunk comparison: functionally equivalent —
the sibling adds a voiced hall-door line during sanctity ("They're still
out there. Waiting. Even they hold their breath while the table sits.")
where this arm was silent; gate order in treelineAmbush differs with
identical outcomes; this arm's extra internal reengageWaitingMonsters
gate is unreachable once both callers are gated (dead code — correctly
not landed).

This commit therefore lands ZERO game.js: it is the independent
verification record. scripts/test-sanctityfix.js was re-run by the
coordinator against master (the sibling's fix):
- PART A/B --ab-only on the pre-fix baseline (/tmp/sanctbase, game.js from
  065a2d5fd): RED — A1 FAIL (suburb startCombat fires with tableActive()=true),
  B1/B2 FAIL, B3/B4 PASS. The proof detects the bug.
- PART A/B --ab-only on master: ALL GREEN (9/9 — 200 monsterTurn ticks,
  zero ambient fires; lingerer pinned; glasswing live; trial ungated;
  startCombat body gate-free; stash held; sanctity-off behavior intact).
- PART C det-gate (pre-fix baseline vs master, s7+s42 x60d, sanctity never
  active): BYTE-IDENTICAL — the landed fix alters nothing outside sanctity.

Two independent proofs now pin the sanctity gate. The audit's DIAG-GO is
FIXED on master by 7024fd22b and independently verified here.
