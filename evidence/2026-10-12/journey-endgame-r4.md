# Journey leg: ENDGAME (day 140+) — 2026-10-12 (run 4)

Rotation 4 → 5. Worktree `journey-endgame`. Stale-lock recovery: none needed
(no lock existed). Main tree untouched until landing.

## Mission

r1–r3 (2026-10-11) established the road problem: 0/48 runs reach the lesser
seat; the deed-bar/lever retune is owned by a separate flesh-out-loop worker
(sim-winpath-r4, ACTIVE). My territory is the endgame EXPERIENCE — what the
table FEELS like. So this run cheats the bars in-harness only (never shipped)
and plays the table itself: 14 full walks across all 7 paths (light/dark
variants, a forced stall→downgrade, a real trial-by-combat, the pods demand,
the callous-oversight sting), full transcripts read for sense.

Canon read first: CANON.md, TABLE.md, ENDGAME-BUILDS.md, KIN.md, FANS.md.
Tooling: `scripts/sweep-table-experience-20261012.js` (13 walks + pods
variants), transcripts in `evidence/2026-10-12/table-experience/walk-*.txt`.

## Village assessment (plain words)

The table villages are synthetic day-140 runs with real history: a real
ledger (protected/killed/betrayed/promises), three dead (combat day 61,
starvation day 92, combat day 118 — they live in the record: the witness
beats, the defiant's prices, the relay's person), real deed fights
(4/4/3 waves), 2 contests, 2 crises, regional standing. What's striking is
how much of the table runs on that history: the audit reads the run back
with real numbers; the defiant's second price names the most-trusted living
villager ("You look at Marcus — the one the village trusts most"); the
assimilated's intake scan asks what you're smuggling (the food truth); the
beloved casts real villagers (Lena's hunt, Marcus's funny one, Sofia's
truth). By day 140 the village is a real place and the table treats it
like one. Nobody feels like a number.

## The blank filled

**Trial-by-combat was UNFIREABLE — a softlock.** (table-feared.js × titans.js)

The feared path's "Demand the champion" choice — the single opt-in
existential risk, Steve's core law #5 — led to a dead end for every
realistic run. Root cause: `tableTrialByCombat` called
`startCombat('finale')`, but the finale is now the 3-node open-world
campaign (2026-10-12), whose entry gate REFUSES with a say + `return null`
(no throw) when the campaign isn't started or the 20-blade muster isn't
ready. The old code only caught throws, so the challenge stranded: modal
closed, no fight, `trialPending` stuck true forever, zero options. Two of
my sweep walks hit exactly this (`feared-dark`, `witness-dark` → "RESULT:
stall").

FIX (canon-honest, TABLE.md: "face the Table's Champion blow-by-blow"):
1. When the table issues the trial, the finale-campaign gates don't apply
   — the System brings the champion to the ring directly, one fight.
   `tableTrialByCombat` sets `Game._tableTrialDirect`; the titans
   `startCombat` wrapper consumes the flag and skips the campaign/muster
   gates, ally injection, and fight marking (so the open-world march is
   untouched). `tbEnd`'s existing table wrap resumes the challenge.
2. Belt-and-suspenders: if no fight begins (any silent refusal), the
   refusal is said aloud, the trial door is withdrawn for this walk
   (beat-1 choices become a function filtered on `T.trialRefused`), and
   the beat re-runs — the challenge continues, never stranded.

**Proof:** `scripts/test-table-trial-fire-20261012.js` — 18/18. RED: the
pre-fix path demonstrated (gate refusal with no bypass strands:
no throw, no fight, `trialPending` stuck, no options). GREEN: trial fires
a REAL fight (tbfight set, the Finale in the ring); win → terror maxes,
beat advances; loss with death → mantle passes mid-table, village
continues weakened, run NOT over; silent refusal → said aloud, door
withdrawn, challenge continues. Also fixed the 2026-10-11 feared test's
`startCombat` stub to honor startCombat's real contract (a started fight
leaves `tbfight` set) — the refusal net reads it.

**Regressions:** table-feared 27/27, table-core 31/31, assimilated 13/13,
beloved 24/24, defiant 20/20, indispensable 22/22, relay 49/49, witness
20/20, journey-sense 8/11 (3 failures PRE-EXISTING — the new 'grey' branch
from a sibling's 2026-10-12 landing changed the light/dark axis; verified
identical failures with my edits stashed), winpath-e2e chain complete,
lesser-invite 25/25, titan-class 32/32, titan-load ALL PASS, ontology 84/84.

## People check (SENSE-TESTING LAW — transcripts read in full)

- **Table scene + audit:** passes. "◈ THE TABLE — it is not a table. It's a
  ring of pale light... 'HUMANITY PRESENTS ITS CASE.'" The audit reads the
  run back with REAL numbers (seat, waves, contests, crises). Unearned
  paths are named and priced, never hidden.
- **Defiant:** the reverse auction is the best-written sequence I read.
  Prices land on real things ("A full harvest. The ships load heavy.
  Haven's shelves echo"), the relay's person is a named villager, the
  de-integration beat ("The HUD dies first — then the warmth, then the
  quiet voice that helped") is devastating. The forced stall fired the
  downgrade honestly: "◈ THE TABLE FALTERS — the pantry is too thin —
  the shelves would be bare and the table knows it... Defiance without
  the means is just posture." → weakened Assimilated, full ending.
  Failure RESOLVES the story. Pass.
- **Pods demand (defiant-pods):** fires on a championed history. "◈ THE
  DEMAND — you name it aloud: the pods. Opened. Every one... 'Ooh. The
  BIG ask. ...Alright. Everything costs. PICK your price.'" Tribute/favor/
  standing — the table always charges. Pass.
- **Callous oversight (KIN sting):** FIRES on a shrug history (2 shrugged
  intrusions, never acted). "◈ THE OVERSIGHT — ...the little ones are
  still napping... That is what the word means. Not the watching — anyone
  can watch. The oversight is the looking away. The most terrible thing
  the System ever did, it did by accident, because it was bored. You did
  it o[n purpose]." This stings exactly as Steve designed. Pass.
- **Feared conscript offer (dark):** "An army, little terror... Small
  soldiers. Loyal — they'd grow up knowing exactly who woke them."
  Refusing: "But... the EFFICIENCY. Huh. Well. Your loss. Our... also
  loss, honestly, we'd already named the battalion." Then: "The mourners
  exhale." HORROR handled right — never clever. Pass.
- **Relay light:** sysBond arc reads on the page ("It is champion now" /
  "It is kin now"); three backfires → honest failure → downgrade to
  Beloved → the variety finale casts real villagers; "The feast song —
  the one about eating like it matters, because it does. Trillions of
  beings who never ate anything hear it and feel hungry for the first
  time." Pass.
- **Relay dark:** landed the new 'grey' branch (sibling's axis change);
  the contract outcome is top-tier writing ("I WILL SIGN THEM IN EVERY
  COLOR OF WEATHER I HAVE"). Pass.
- **Witness:** full-trial beats read well (cold charges, the settlement
  twist: "Refuse the quiet... The judges bow. It costs them everything
  to do it"). Testimony-person-specific was covered by r3's sense test.
- **Assimilated:** "the only private channel" (sanctuary), the dead-drop
  seed, "The grey list. Unwatched, unhelped, unowned." Pass.
- **Indispensable:** treaty drafting with exit-ramp twist ("REMOVE IT,"
  the System says — not performing now, almost *asking*) — needed the
  full-seat cheat, but the content holds up.
- **Epilogues:** every ending names the Bearer and ends "...walks out of
  the light alone, which is how they walked in. The village endures. That
  was always the story." — the repeated coda across all 14 endings is a
  bit formulaic (noted, not changed; it reads as a deliberate tagline).
- **Day-140 conversations:** generic but human; no fabricated shared
  history, no loops. The conversation system is the main game's domain,
  not endgame's.

## Reachable / Fun / Winnable

- **Reachable (as experienced): NO — same as r3, and still the lever
  worker's territory.** 0/48 real runs reach the lesser seat. The
  experience past the bars is strong; the bars are the problem.
- **Fun: YES.** The table is the best content in the game. The audit,
  the priced paths, the played challenges, the live finals — all of it
  lands. 14 walks, zero dead ends post-fix.
- **Winnable: demonstrated 14/14 walks reach endings** (11 full path
  endings + 2 downgrades + 1 trial-resolved). The endgame resolves
  stories honestly: win, downgrade, death-with-mantle — never a wipe.

## Files

- Fix: `src/js/table-feared.js` (tableTrialByCombat: direct summon +
  refusal net; beat-1 trial door withdraws after refusal), `src/js/titans.js`
  (wrapper honors `Game._tableTrialDirect`, consumed on use)
- Proof: `scripts/test-table-trial-fire-20261012.js` (18/18)
- Test contract fix: `scripts/test-table-feared-20261011.js` (stub sets
  tbfight — startCombat's real contract; 27/27)
- Tooling: `scripts/sweep-table-experience-20261012.js` (14-walk driver)
- Transcripts: `evidence/2026-10-12/table-experience/` (14 walks,
  people-check, summary)

## Notes for the win-path lever worker

1. 0/48 real runs still reach the lesser seat (unchanged since r3) —
   binding constraints per r3: feastSurgeUsed (0/48) and wave-3 fights.
2. The endgame experience is DONE past the bars — don't retune content,
   just reachability.
3. TABLE.md now diverges from code: a sibling added a THIRD branch
   ('grey', the pragmatist band — table.js:183-191, 441) while TABLE.md
   still documents light/dark only. The 2026-10-11 journey-sense test's
   relay section fails 3 checks against it (pre-existing, verified with
   my edits stashed). Someone should reconcile canon vs code.
