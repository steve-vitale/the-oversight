# Playtest loop 2026-10-12 — journey leg 0: LANDING R6 (days 1–14)

Rotation idx 0 → played leg 0 (r5 ran today on 1e1afc81; this re-baselines on
fe09b7f3, which moved a lot: trapline end-to-end, succession count-honesty +
fabricated-history audit, crisis mantle-memory, social deflect-cycle r6,
establishment favor follow-up voice, scale freeloader fix, knowledge trade
hook, trust leadership pools, contests casting variety, wave kill channels,
abilities trial deeds, travel first-gesture).
Next: idx 1 (establishment).

Base: fe09b7f3.

## What was played
- `scripts/journey-landing-r6-20261012.js` — r5 harness REBUILT on the shared
  infrastructure instead of the hand-rolled day loop: `sim-harness.js`
  (loadGame/setupGame/driveFights/driveContests) + the full
  `policies/competent.js` (upkeep/daily/fight). The competent player now
  forages real trips (101 across 3 seeds), sorts/donates the haul, cooks,
  boils water, assigns water/wood workers, asks about beast tricks, takes
  the System's ability offers, fights tactically (flee-by-barrier, beast
  tricks) and loots the dead. Day clock is game-day-bounded with the
  villagerTurn-corrected wait pattern (doAction('wait') parts, never raw
  tickAction) + the sim-harness time-freeze watchdog. One full conversation
  per observed game-day with full transcript capture (32 sittings across the
  final run; 100 forage trips, 6 fights, 6 System ability choices taken).
- Seeds 444, 555, 666 × 14 game-days. 3 fresh seeds, seeded RNG before eval,
  window-stub-then-delete discipline. Dynamic script list from index.html
  (84 files now, was 78 in r5 — the head -80 in sim-harness only drops the
  4 DOM-only excludes; verified).
- Day 2's social beat deliberately sits a comm-level 'none' villager
  (robust to day skips — a forage trip can roll a day boundary
  mid-iteration, so it's keyed on "second observed game-day", not a fixed
  day number).

## Tooling fixes found while building (harness, not game)
- `Game.npcComm()` does not exist in src/js — r5's (and my) villager filter
  for nonverbal sits was dead code wrapped in try/catch, silently treating
  everyone as 'full'. The real API is `Game.commLevel(vid)`. Fixed; the NV
  sit now actually finds the comm-level 'none' villager (seed 444 has one:
  "A person, maybe 20s, with a wiry build" = Emilia, Italian-only).
- The r5 lure-regex missed two of the five INVITE_DEFS labels ('carry':
  "Help me haul something back", 'show': "Come see what I found") — one
  false "lure silent" flag in r6's first pass was the metric, not the game.
  Regex now covers all five labels.
- pickChoice anti-hammer: the harness's DEEPEN priority list made it pick
  `dlg:stay` three times running in a seek_comfort arc. The game's stay arc
  is a deliberate 4-beat deepening (stays 1-3 small talk, 4th names the
  grief and resolves 'comforted') — the hammering was the policy's, not a
  filler loop. The harness now deprioritizes its immediately-previous pick.

## Village assessment (plain words)

**Seed 444 (Dakota):** 11 of 12 alive at the fortnight's end. Arturo died
day 12 — monster, honestly recorded. The pantry ends FLUSH (47k → 84k
kcal): the competent forager over-contributes. Dakota ends at 51 HP —
fought and bled, survived. Trust 9–90 (mean 38): the player is known but
not loved. Everyone knows 13–15 plants; the village teaches itself. The
System arrived day 8; the player took 6 of its ability offers across the
run.

**Seed 555 (Jack):** 10 of 12 alive. Marcus died day 8 to a monster, one
more day 10 in combat — both honest violence. Pantry 47k → 58k. Jack
ends at 100 HP. Trust 14–67 (mean 42). 12–15 plants known per villager.

**Seed 666 (Pablo):** 10 of 12 alive. Two monster deaths (day 6, day 13).
Pantry 47k → 34k — leaner, still holding. Pablo ends at 100 HP. Trust
7–82 (mean 42). 11–15 plants known per villager.

All three villages live through the fortnight. Nobody starves — the one
binding pressure is monsters, not food, which is the designed wave-1
animal shock doing its job. The player is competent but not dominant:
trust means sit in the 30s–40s, the stranger's seat at the fire. The
village knows its plants, buries its dead, and keeps foraging. What is
missing: nobody yet knows trap-making (the snare recipe never reached
level 1 in 14 days — earned knowledge, correctly out of leg range), and
the aid pipes never fire in-leg (aid is for struggling villages;
expected, same as r5).

## People check (SENSE-TESTING LAW — full transcripts read for meaning)

**New-fix verification on the current tree:**
- declineLine alternates (r5 fix): 11 invitation-declines across the run,
  11 acknowledged in the fiction ("Another time, then.", "Right — another
  time.", "Fair enough. Rain check.", "Suit yourself." cycling), 0 dry
  non-sequiturs. Holds.
- Spoken lure (r4 fix): 11 betrayal-invite menus offered, 11 spoken aloud
  as a second opener beat ("Help me haul something back? Too much for
  one.", "Walk my trap line with me? Extra hands, extra eyes.", "Come get
  air with me. I need to think out loud.", "Come see what I found."). 0
  silent. Holds.
- NV lure gesture (r5 fix): no nonverbal villager held a pending invite in
  the wild this run, so a targeted verification was run instead — seed 444's
  real comm-level 'none' villager, pending 'traps' invite planted:
  the gesture beat fired exactly once ("(They mime walking — pointing at
  themselves, then at you, then toward the trap line. The meaning is
  unmistakable: come with me.)"), as narration (who=you, not quoted
  speech — the no-English rule holds), gesturing at the invite def's spot,
  and did NOT re-fire on the second conversation (inv.spoken honored).
  7/7 pass on the current tree.
- Comma-closer stutter: 0. Punct stutter: 0. "I just said": 0. Phantom
  Maras: 0. Third-person favor heads (establishment r4): 0. Fabricated
  people counts: 0 — "we're twelve people" was TRUE when said (pop 12 on
  day 12; the succession r5 convoFillPeople fix holds in the wild).
- Verbatim repeats within a conversation: 0 (social r6 deflect-cycle fix
  holds — a 4-deep dlg:more chain produced 4 distinct beats).
- Curiosity-first first meetings intact: "You look handy. What did you do
  with your hands, before?", "When's the last time you really laughed?",
  "Do you still sing? ...Sorry — weird question. I just realized I haven't
  heard anyone sing."

**The favor arc, played straight (444-day10, Sofia):** resume opener
("We never did finish talking about that question — that was 8 days back.
Still on your mind?") → concrete ask ("The pantry's nearly bare. Forage
with me tomorrow? I know the east treeline.") → honest deflect ("Actually
— I can't.") → "No, yeah, of course. Forget I asked." They won't forget.
They'll just stop asking. — and the deflected memory surfaces IN the same
conversation ("About what I asked before..."). The NPC wants something,
options engage/deflect it, the ending plants. Quality bar met.

**The grief arc (666-day7, Emma, day after a villager died to a monster):**
"Do you ever — no. Never mind." They don't look away, though. They want
you to ask. → comforted gradually → "...I keep thinking about them. About
— everyone. Sorry. It just comes out, sitting here." → "You're kind.
Don't let this place change that." → resolution=comforted. The want
responds to a real death in the fiction. A person grieving, not a menu.

**The gossip arc (555-day12, David):** "You'll never guess what I saw by
the treeline." → "something moved out there, big" → "James. Turns out they
weren't what they said — they're a carpenter. Don't say I told you."
→ "There's a real argument going about what to call that thing. People
are heated." (the naming debate — monster names by village agreement,
diegetic) → "That's everything I've got. You know as much as I do now."
Gossip with a secret, specific and consequential.

**Nonverbal (444-day3, Emilia, Italian-only):** barrier stated plainly,
real Italian («Che posto è questo? Dove siamo?»), the one English word
grinned proudly ("Fuck you." this run — the pool's dark humor intact),
closing stage direction ("They press their palms together — thanks, or
goodbye, or both."). No English from her mouth. The fiction holds.

**Known grit (documented, still true):**
- The ~540 re-offer flags are the structural kind (leave/silence/teach
  legitimately persist across turns) — metric noise, same as r5.
- Favor stage-2/3 ASK lines are a small pool ("The pantry's nearly bare.
  Forage with me tomorrow? I know the east treeline." / "Pantry's thin and
  getting thinner. Come forage with me tomorrow — two of us can fill
  packs."): no verbatim cross-seed repeats this run, but the same idea in
  two sentences. Convo-loop text-pool territory, as documented in r4/r5.
- Trapline: 0 crafts / 0 sets across ~100 forage trips per run in 14 days.
  The snare recipe never reached level 1 — knowledge is earned over time,
  and the landing leg doesn't get there. The instrument exists (food r5
  proofed it end-to-end); it is simply not reachable in days 1–14.
  Documented, not a bug.

## Blank FILLED: the verbatim favor-deflect beat
Observed 3× in one run (444-day10 Sofia, 444-day12 Emma, 666-day9):
every ask_favor deflect spoke the identical line verbatim —
"No, yeah, of course. Forget I asked." They won't forget. They'll just
stop asking. — across villagers and runs. Root cause: all six want defs'
`deflectBeat` in src/js/convo-wants.js were single hardcoded strings,
while the same defs' commitBeat/closeLine already pool through
convoPickCycle. Fix: all six deflectBeats pool 3 in-voice variants via
convoPickCycle (ask_favor keyed by favor kind, like commitBeat); every
favor variant keeps the plant ("they won't forget / won't raise it
again"); emission still goes through sayLine so the no-repeat ledger
applies; villageLineFresh + run-ledger preference in convoPick steer
repeat deflects across villagers to fresh lines.
Proof: `scripts/test-landing-deflect-pool-20261012.js` — RED 6 fails on
pristine HEAD (3 deflects → 1 distinct line, all six wants) → GREEN 16/16
fixed (3 distinct per want, plant preserved, e2e dlg:cant through the real
flow lands an acknowledging non-dry line and resolves 'deflected').
Wild check on the final run (with the fix live): 4 favor deflects fired —
"...Okay. I'll figure it out." ×1 and "Right. I get it." ×3 — the verbatim
3× repetition is gone, and the plant survives in every variant.

## Regressions (sequential, node proof scripts)
- test-landing-deflect-pool-20261012 (new): RED 6 on pristine → GREEN 16/16
- test-landing-decline-line-20261012: 7/7 ✓
- test-landing-nv-lure-20261012: 10/10 ✓
- test-landing-spoken-lure-20261012: 10/10 ✓
- test-dialog-coherence-20261011: 37/37 ✓
- test-dialog-gating-20261011: ALL GREEN ✓
- test-dialog-stream-20261011: 43/43 ✓
- test-convo-deflect-cycle-20261012-r6: 13/13 ✓
- test-convo-norepeat-fallback-20261011: 9/9 ✓
- test-favor-system-20261011: 30/30 ✓
- test-want-more-exhaustion-20261012: 5/5 ✓
- test-succession-spent-choices-20261012: ALL GREEN ✓
- scripts/validate-ontology.js: 84/84 ✓

## Reachable / fun / winnable
- **Reachable: yes.** Full leg end-to-end on the current tree; System
  contact day 8 all three seeds; favors, gossip, grief, teaching, spoken
  and gestured invites, nonverbal conversations, beast-trick counters, and
  System ability offers all fire naturally.
- **Fun: yes.** The favor/grief/gossip arcs read like people living
  through the first fortnight; the arrival sequence and the nightlight
  fight remain the leg's best beats. The one pooled deflect removes the
  last verbatim "menu glitch" moment found this run.
- **Winnable: yes for the leg.** All three villages survive; deaths are
  honest monster violence (wave-1 animal shock doing its job), never
  attrition. Pantries hold (34k–84k). The player ends at 51–100 HP every
  seed — Dakota bled down to 51 fighting and lived — fed and watered, with
  System ability choices taken.

## Files
- Harness: scripts/journey-landing-r6-20261012.js (sim-harness +
  competent policy, per-game-day conversations, NV sit, sense metrics)
- Proof: scripts/test-landing-deflect-pool-20261012.js (16/16, RED-verified)
- Fix: src/js/convo-wants.js (six pooled deflectBeats)
- Transcripts: /tmp/journey-landing-r6-transcript-*.txt (32, ephemeral)
- Censuses: /tmp/journey-landing-r6-census-{444,555,666}.json (ephemeral)

Status: fixed in worktree; coordinator lands. No bump, no push
(ship loop owns it).
