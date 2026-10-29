# Journey crisis r66 — re-baseline pilot: bends, then one village breaks on its own safety net (lane B, leg 6)

Successor to crisis r63 (B3 NO-GO, leg closed on the 9407 bisection
question). This run does NOT re-litigate B3. It re-baselines the
crisis leg on current master and pilots the standing question: does
the village still bend without breaking under siege?
Pre-registration:
`hidden_files/evidence/2026-10-29/journey-crisis-r66-prereg.md`
Base: master 9d96bb738 (social r65 + ship bump
dbe19abad-20261029-113024 + departhold). No game change in this run:
measurement only.

## Run setup (done first, per the body)
- No lock present at run start — no stale-lock recovery needed.
  New lock written run 2026-10-29T11:55:33Z.
- Main-tree pre-flight: CLEAN (0 lines), disk 22%, `git pull`
  already up to date.
- Worktree journey2-crisis (body slug). First register attempt was
  cut by a service restart mid-checkout, leaving a partial
  evidence-only dir with no registry entry and no git worktree
  record; the partial dir was removed (a checkout of committed
  files only, nothing unique) and registration re-run cleanly
  (~6 min under sibling load). Heartbeat verified in registry
  (12:09:45Z) and re-heartbeated every 10 min by a logged loop
  (fresh at every check; the one stale-looking log line is the
  first broken loop's wrong-cwd failure, not a missed beat).
- Canon: docs/CANON.md read in full before playing. Gating freeze
  (2026-10-27) untouched.

## Fresh panel (r63 driver/analyzer verbatim -> r66, names only)
Instrument: `scripts/journey-crisis-r66-delayed-20261029.js` +
`scripts/analyze-crisis-r66-delayed-20261029.js`, policy oracleV2,
120d death-aware (+10d tail). EVID exported (r63's unexported-EVID
slip avoided): `hidden_files/evidence/2026-10-29/r66-panel/`.
All three seeds exit 0, sequential, never concurrent.
Analyzer output: `hidden_files/evidence/2026-10-29/r66-panel-analysis.txt`.

## C4 (9407 re-baseline) — GO, exact in band
r66-9407 is NORMALIZED-IDENTICAL to r63 C0-9407: ends horizon,
3 alive (Nora, Augustin, Zere), 2,100 kcal, 11 raids, 22 gorge
nights (same days: d25-28, d32-36, d99-101, d119-121), 5 sorties,
day-9 sayLines 110 = 110, total sayLines 12,706 = 12,706,
fabricHits []. The raw sha differs only because the instrument
labels changed (mode/id r63 -> r66). The trajectory did NOT move
again since r63. The 7 r66-9407 transcripts are byte-identical to
r63's fully-read set, so r63's people-check read stands for this
seed without re-reading.

## C2 (episodes fire + gates hold) — GO on all 3 seeds
- 9407: 11 raids, 22 gorge nights, 5 sorties (3 sortie-call
  clears: d29, d37, d102).
- 9408: 11 raids, 7 gorge nights, 2 sorties; ends horizon, 2 alive
  (Shuting, Odette), 0 pantry kcal — the exact band of r62's
  recomputed 9408 control.
- 9411: 6 raids, 12 gorge nights, 1 sortie (d79 sortie-call
  clear); ends game-over (see below).
- TRUE early 'fought' resolutions (r60 analyzer definition,
  lingeringAtResolutionTrue > 0) = 0 on all 3 seeds. The r59
  aidFight lingerer-first gate does not regress.
- Panel totals: attempts 8, ok 5, refused 3, cleared 4,
  deltaExact 5, deltaBad [], gorge kcal 47,852, sortieFights 7,
  D1 snapshots 8/8, fabricHits 0.

## C1 (bend, not break) — GO at 2/3, with the break documented
9407 and 9408 reach the 120d horizon alive. 9411 breaks — and the
cause is named, not averaged away (see next section). Per the
prereg, 2/3 horizon = GO, and the break is the interesting
finding, investigated below rather than expanded into more seeds:
the record identifies the cause completely, so extra seeds would
only re-measure frequency. Frequency of phoenix-link village wipes
is a follow-up question for a phoenix instrument, not this leg.

## The 9411 break: a village that dies rich, eaten by its own safety net
9411 ends game-over with 0 alive and 64,083 kcal in the pantry.
It does NOT die of famine, siege, or disease. It dies because the
player's death-cheat consumes the whole village in one fight:
- Day 63: Nikolai, then an NPC, takes Phoenix Clause at Combat 1
  ("Earned, chosen").
- Day 73: Mia dies in the arena; the mantle passes and the player
  wakes as Nikolai Volkov, 60, a welder — Iron Stomach,
  Cold-Blooded, Echo Location, Phoenix Clause. Succession hands
  the player a purpose-made character with a real build, not a
  blank (leg-7 behavior observed inside the crisis leg).
- Day 83, one fight: the player goes down; the fire takes them and
  Giulia steps in ("Take me. The village needs you more."),
  then Katarina, Paula, Saul, Ava, Alejandro, Greta — seven
  volunteers, each named, each seen. Then the fire chooses Emma,
  Ruby, Adaeze — "Both bodies are already burning. Everyone
  sees." The show airs every burn; the village knows Nikolai
  burned each of them to live. Then the clause stirs and finds no
  one: "No village, no villagers, no fire to trade. Your death
  sticks." The Codex turns its own page: "No one is left to pick
  up the Codex. The village dies out — quietly, the way villages
  do."
- Plain-words verdict: the mechanic is legible, narrated at every
  step, and socially consequential ("The village lets it stand.
  This time. (Standing 71 -- earn it or lose it.)"). A player
  watching this understands exactly what the bargain cost. This
  is the crisis leg working as drama, not a bug: the village
  bends through 6 raids, 12 gorge nights, and a sortie to day 83
  with a full pantry, then breaks on one dark bargain kept one
  burn too long. Whether a single fight should be allowed to
  chain ten burns is a Steve-call (the clause as designed has no
  per-fight cap in this record), not a defect found here.
- Instrument quirk, noted not judged: the 9411 record's `days`
  field reads 77 while its sayLines run to day 83 (the wipe day)
  and endReason is game-over with a final census (0 alive). The
  census and the narration agree; only the `days` counter lags
  the tail. A future instrument pass should say which day the
  counter stops at on game-over.

## C3 (people check) — GO
Read in full: all 7 new 9408 transcripts, all 4 new 9411
transcripts, plus the 9407 set verified byte-identical to r63's
full read. fabricHits [] panel-wide.
- NPCs want concrete things: Anh (d18) wants a persimmon run
  ("I did the count twice. The count doesn't change... come with
  me and we'll fill packs before dark"); Jada (d39) is burning up
  and begs for someone who knows sickness; Mara (d48) refuses to
  choose who eats and wants the plantain patch worked.
- Repeated asks escalate, then close — never loop: favor
  requirements climb "As I said —" / "Like I said —" / "Still the
  same thing —" / "I've told you three times now —" and then
  close ("Right. I get it." / "Okay. That's — I need a minute."
  / "Go. But sit with what I said."). Doubt escalates (careful
  → choosing words → rattled → done talking). Recap escalates
  then closes ("Okay. We'll pick this up later.", "Alright — I
  should get back to it.").
- Grief reads as people: Asher (d25) on Yuying ("Yuying always
  took the burnt piece. Said someone had to. I take it now.";
  "We bury, we grieve, we keep going. There's no step four.";
  "I keep turning over the last thing Yuying said to me. I can't
  tell if I'm remembering it right, and that's somehow the worst
  part.").
- Invitations are sometimes taken, in this leg too: Anh's ridge
  walk (d27 betrayal:accept), Asher's "I'd love to. Lead the way"
  (d25 dlg:invite), Mara's gift tool on acceptance (d81).
- No fabricated shared history flagged.
- R63 SEAM RE-CHARACTERIZED (blank closed, not a game defect):
  r63 noted driven conversations ending on invite/silence picks
  terminate as "(conversation ended by the engine)" with no
  closing line. In r66 the marker appears in all 18 transcripts
  — but it is the RECORDER's annotation (driver line 112;
  no src/js hit for the string), never player-facing text. And
  in every transcript the last NPC line before the close already
  resolves the thread ("You know where to find me", "I should
  get back to it", "Moving! But — good talk! More later!").
  Silence closing a conversation whose thread already resolved
  is an ending, not a cut. No game change follows; future notes
  should not cite the marker as a defect.

## Village assessment (plain words)
- 9407: survives 120 days but thin — 3 people (Nora, Augustin,
  Zere) and 2,100 kcal, after 11 raids and 22 gorge nights. Same
  village as r63, to the line.
- 9408: survives 120 days on empty — 2 people (Shuting, Odette)
  and 0 kcal. Deaths along the way include two villagers killed
  by the village's own pit traps — dark, legible, and the kind
  of thing a census-taker writes down without flinching.
- 9411: dies on day 83 with a full pantry (64,083 kcal) and no
  one left to eat it. The village that fed itself fine was eaten
  by its hero's bargain instead.

## Reachable / Fun / Winnable (crisis leg)
- REACHABLE: yes — raids, gorge nights, sorties, aid resolutions,
  refusals, and driven conversations all fire on current master
  across all 3 seeds.
- FUN: yes — the siege narration still reads as a real dilemma,
  conversations escalate instead of looping, and the 9411 wipe
  is the most memorable single-day story this leg has produced:
  horrifying, legible, and earned by a choice the player made
  (taking and then leaning on the clause).
- WINNABLE: the leg itself is not a win path; two villages
  survive it thin and one breaks on a bargain. No win verdict is
  drawn from this leg alone.

## Telemetry deviation check
`telemetry-check.js` over the three new JSONs vs
`telemetry-baselines/crisis.json` (metrics defenderFights,
playerFights, defendedCount, latelyDefenseCount): the same 2 LOUD
lines as r60/r62/r63 on all 3 seeds — defenderFights 95 -> 0,
defendedCount 21 -> 0. EXPLAINED, not a bug: the baseline's field
names describe an older instrument; current records carry
defendedFights, not defenderFights. No NEW loud line. Baseline
NOT rolled.

## Test-suite call (documented, not silent)
No src/js changed in this run (measurement only). Verification
run: r66 driver on 3 seeds (all exit 0), r66 analyzer (panel
verdicts above), node --check on both new scripts. A full
check-quick was NOT run, per r63's precedent for tooling-only
changes: it re-verifies the base, not a tooling-only change, the
two new scripts are not in the quick list, and sibling jest load
is heavy this morning. The next run that changes src/js runs the
full suite as normal.

## Metric review (§14)
- C4 judged on outcome band, not byte-equality — and the band
  held exactly (normalized-identical). The instrument-label-only
  hash difference is now documented so no future run mistakes a
  label change for trajectory drift.
- Pilot rule applied as written: the interesting finding (9411
  game-over) was investigated to a named cause from the existing
  record; expansion into more seeds was declined with the reason
  stated (frequency is a phoenix-instrument question, not a
  crisis-leg question). Steve can overrule and order the
  frequency seeds.
- Carried (unchanged): instrument wobble in the tail (pin day 116
  for 9408) — judge bands, not tail byte-equality; telemetry
  mapping proposal defenderFights -> defendedFights; dead
  discoverer's orphaned fireside entry (r51, Steve's call); unfed
  marches proceed (r50, Steve's call); stare-down cost as a class
  (Steve's call); gating freeze (2026-10-27) untouched.
- "Presentation only" caveat (r62, confirmed r63): a spoken beat
  moves seeded outcomes only where it fires.

## Blanks filled / held
- FILLED: crisis-leg re-baseline on current master (C1/C2/C3/C4
  all GO); r63's engine-cut seam re-characterized as a recorder
  annotation, not a game defect; 9411's break explained to a
  named mechanic with full narration.
- HELD (not this run's): frequency of phoenix-link village wipes
  (needs a phoenix instrument, not crisis seeds); whether one
  fight should chain ten burns (Steve-call on the clause's
  design, not a defect found here); the `days`-counter tail lag
  on game-over records (instrument note).
- No game change follows from this run. Rotation-b advances
  6 -> 7 (succession) on this landing.
