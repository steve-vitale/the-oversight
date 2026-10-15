# journey-succession r14 (2026-10-15): "the second week"

## Pre-registration (§11; binding per §14)
- **Question:** two threads.
  (A) FIX the r12-documented blank: the PEOPLE codex screen excludes the
  player character (journal.js peopleJournal filters out Game.villagerId),
  so the new bearer can never re-read their own backstory after the
  orientation beat scrolls by. Fix: include the bearer as the first card
  with self-framing, name/occupation/backstory known (you know who you are
  — "YOU BECOME THAT VILLAGER", Steve 2026-10-14).
  (B) ASSESS the bearer's second week: days ~16-26 after a day-16 death —
  does the village treat the bearer as bearer, do favors re-ask, does the
  dead bearer's name persist sensibly, do transcripts hold up?
- **Binding metric (GO/NO-GO):** proof test scripts/test-succession-selfcard-20261015.js —
  RED on pristine (via patch-swap, never stash), ALL GREEN post-fix.
  GO = all assertions green on 3 pilot seeds.
- **Horizon:** 16 days competent play + scripted death (r10 proved natural
  deaths drive the same chain; r12/r13 used the same script) + 10-day
  successor tail. Death-aware: village survived on all r12/r13 seeds.
- **Seeds:** 721, 722, 723. Policy: scripts/policies/competent.js.
- **Interesting-finding bar:** a broken/empty self-card; a continuity break
  in week 2; a senseless transcript; the dead bearer leaking into the self
  card or vice versa.
- **What this run does NOT re-prove:** C1-C6 continuity audit (r12, landed),
  snippet clipping (r13, landed), promise-maker succession (r11, landed),
  mourning-beat survival vs crisis (r11).

## Metric review
- The binding metric (proof test RED on pristine → ALL GREEN post-fix) held
  for both fixes with no re-scoring. test-succession-selfcard: 24 failures on
  pristine → ALL GREEN (33 assertions) post-fix. test-honest-death-cause-critzone:
  2 failures on pristine → ALL GREEN (7) post-fix.
- Harness correction during the run: the r14 leg script first compared the
  self-card against the scripted-death bearer id, but all 3 seeds saw the
  SECOND bearer die in the tail (third bearer took over) — the check was
  restated against the current bearer and re-run. The deaths themselves are
  findings (below), not metric changes.
- The people-check picker was fixed mid-run (no-repeat per sitting) after the
  first pass produced a comfort-loop artifact; transcripts re-captured.

## Results

### (A) Self-card fix — LANDED
- `peopleJournal()` (src/js/journal.js) pins the bearer as the first PEOPLE
  card with `self: true`; name/occupation/backstory written in from the char
  record, no knowledge gates. An NPC-era partial entry ("Kurt") is upgraded
  to the full identity ("Kurt Wozniak") — caught by the proof test, fixed
  same-run (you know your own name; the self card is not the place for
  partial knowledge).
- `peopleSection()` (src/js/app.js) renders it as "YOU — <name>" with a self
  line ("The Codex rides with you." post-System / "That's you." pre-System)
  instead of trust-relative text.
- Proof: scripts/test-succession-selfcard-20261015.js — RED (24 fails) on
  pristine via patch-swap → ALL GREEN post-fix on seeds 721/722/723.
  Live check in the leg sim: the self card pinned the CURRENT bearer on all
  3 seeds — including across a second succession (Sean Lang/Vintner,
  Frida Bergersen/Chef, Kayla Dube/Mortician, each with name/occ/backstory).
- Regressions: blitz-succession 30/30, orientation ALL GREEN, snippet-clip
  PASS, corpses 37/37, honest-death-causes 4/4, check.js --quick 96 passed
  2 failed (test-where-are-we's 2 failures verified byte-identical on
  pristine — pre-existing, a sibling's change since the 2026-10-14 green
  list; not this run).
  test-ledger's 2 failures (keepsake, declineChallenge) verified identical
  on pristine — pre-existing.

### (B) Trivial-deficit death-cause fix — LANDED
- Seed 722's second bearer (Tyrone Shah) slept at 1 HP after a Haven raid
  with kcal 2198 (deficit ~2, a full belly); the epitaph said 'starvation' —
  the wrong lesson ("eat more") for a death the day caused. Steve's
  2026-10-14 honest-causes rule demands better.
- Fix (src/js/engine/calories.js): the spiral takes credit only for a real
  deficit (>= STARVATION_THRESHOLD 500); a trivial deficit killing a critical
  scholar reports 'the night'. Real starvation (deficit 2100), dehydration,
  and 0-HP behavior unchanged — the pre-existing proof test stays 4/4 green.
- Proof: scripts/test-honest-death-cause-critzone-20261015.js — RED (2 fails)
  on pristine via patch-swap → ALL GREEN (7) post-fix, incl. the 499/500
  boundary.
- Flagged (not fixed): `scholar.wounds` is never written anywhere — the
  'wounds' killedBy branch is dead code (DEAD-LEDGER.md entry). Wiring combat
  damage into wound records is invasive; the deficit fix covers the observed
  misattribution.

### (C) Second-week assessment findings
- Second-bearer mortality: 3/3 second bearers died within the 10-day tail
  (d23 raid-aftermath "starvation"→now 'the night', d26 combat, d28 combat).
  The world at day 18+ is brutal and the competent policy defends Haven and
  doesn't heal — this reads as policy weakness + honest brutality, not a game
  bug: damage numbers, warnings, and health are all visible. Noted for the
  sim loop (policy healing), not fixed here.
- Grief composes across successions: seed 722's third bearer (Frida) hears
  George grieve Tyrone (second bearer) BY NAME — "Since Tyrone died... I keep
  expecting to see Tyrone at the fire", "I sleep with one ear uncovered,
  always for Tyrone, now." The mourning system chains correctly through
  multiple mantle passes; nobody confuses the new face with the dead.
- Week-2 fiction is alive: corpse recovery beat, villagers teaching the new
  bearer plants by name ("Kurt showed Farid the Huckleberry"), people sitting
  with them, burial by the fire.
- Census (day 28): 9–10 alive, pantry 44k–78k kcal, codex breadth 40–48,
  integration stage 3, bearer trust 36–45 (0 on 723 — Kayla at trust 0 as
  third bearer; the office's standing transfers discounted, as designed).

## Village assessment (plain words)
Day 28, three villages. The first bearer died to a hushwolf on day 18 in all
three runs; the village brought each body home, dug the grave by the fire,
and grieved by name. The second bearers — Kurt Wozniak, Tyrone Shah, Adrian
Joshi — each held the Codex for 5–10 days: they were taught plants, sat with,
fought beside. All three died (raid, combat, combat); the mantle passed a
second time without breaking anything — the third bearers (Sean Lang,
Frida Bergersen, Kayla Dube) woke with their own names, kits, and backstories
on the PEOPLE screen. Pantries are full (44k–78k kcal), the codex knows
40–48 plants, the System rides at stage 3. The dead are on the memorial roll;
the living are working. The design holds through two deaths in ten days.

## People check (SENSE-TESTING LAW — full transcript read raw)
- Seed 721 (Sean Lang → Harper Barnes, trust 90): Harper grieves Kurt, the
  SECOND bearer, to the third bearer's face — "Have you — sorry. I keep
  thinking about them." Honest deflections ("Someday I'll tell it right. Not
  tonight."), a working recap ("Still on grief."), a party invite that lands
  ("Someone should watch your back. Might as well be me."), and the grief
  beat returning on its own ("Since Kurt died... I keep expecting to see Kurt
  at the fire. Stupid."). Earned ending: "This was good." They mean it.
  PASSES the bar — the NPC wants comfort, the middle is real, nobody
  fabricates history with Sean.
- Seed 722 (Frida Bergersen → Stan Kowalski, trust 55): Stan wants his wound
  treated ("If it festers I'm no good to anyone — can't haul, can't hunt,
  can't watch. Just clean it out and wrap it tight."), detours through the
  monster-naming debate ("what to even CALL it. 'Loud-Eyes' got shouted
  down. What's your vote?"), joins the party ("Alright. But I'm not carrying
  your stuff."). PASSES — want, engagement, honest ending.
- Harness artifact noted: the first capture's picker repeated dlg:comfort 7×;
  the NPC answered with 7 fresh grief lines instead of deflecting. Fixed the
  picker (no-repeat per sitting); a real player wouldn't ask 7 times. Minor
  flag for the convo loop: repeated identical questions could earn a
  "you already asked" deflection.

## Reachable / fun / winnable
- Reachable: yes — the self card renders from the same journal every player
  opens; the death-cause fix is invisible plumbing with honest epitaphs.
- Fun: yes — re-reading your own backstory after waking as a stranger closes
  the r12 gap; "YOU — Kurt Wozniak" with his full story is a moment, not a UI
  row. Grief that chains across two successions is the village-as-protagonist
  thesis working.
- Winnable: yes for the leg — continuity holds through double succession;
  nothing in the transfer blocks progression. (Second-bearer mortality is a
  difficulty/policy observation, not a blocker.)

## Flags for other loops
- Sim loop: competent.js doesn't heal — 3/3 second bearers died in 10 days
  with visible warnings and no treatment sought. A treatment-seeking competent
  variant would measure the game's real difficulty instead of the policy's.
- Convo loop: repeated identical player questions get fresh NPC answers
  instead of a deflection (seed 721 first capture: 7× "Are you okay?").
- Flesh-out: `scholar.wounds` write-never — the honest-causes 'wounds'
  branch is dead (DEAD-LEDGER.md FLAGGED). Wiring combat→wound records would
  let raid deaths report 'wounds' instead of 'the night'.

## Files
- scripts/journey-succession-r14-20261015.js — the r14 leg harness
- scripts/test-succession-selfcard-20261015.js — proof test (RED→GREEN)
- scripts/test-honest-death-cause-critzone-20261015.js — proof test (RED→GREEN)
- src/js/journal.js — self entry in peopleJournal
- src/js/app.js — YOU card rendering in peopleSection
- src/js/engine/calories.js — trivial-deficit killedBy honesty
- docs/DEAD-LEDGER.md — scholar.wounds FLAGGED entry
- evidence/2026-10-15/journey-succession-r14.md — this note
- evidence/2026-10-15/journey-succession-r14-seeds.jsonl — per-seed records
