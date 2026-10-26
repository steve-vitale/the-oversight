# Journey crisis r51 — THE LETHAL SORTIE, FIRED (lane B, leg 6)

Direct handoff from r50's metric review §3(i): 0 vDie in 174 fights, the
lethal sortie path ("didn't come back / party carries the body home" +
deathGriefBeat) code-complete but unexercised. This run proves it fires
through the public sortie verb — and finds one real bug in its aftermath.

Pre-registration: `hidden_files/evidence/2026-10-26/journey-crisis-r51-prereg.md`
Instruments: `scripts/journey-crisis-r51-lethalscan-20261026.js` (v1, no
convo driver — SUPERSEDED, see below), `scripts/journey-crisis-r51-lethalscan2-20261026.js`
(v2, drive's convo driver verbatim), `scripts/journey-crisis-r51-lethal-20261026.js`
(r50 driver + fight logs, grief-beat wrap, muster snapshots).
Policy: oracleV2, 120d death-aware (+10d tail).
Panel: drives on seeds 9405, 9406, 9407, 9409, 9414 (15 sorties, 18 sortie
fights). Per-seed records: `hidden_files/evidence/2026-10-26/journey-crisis-r51-seed{9405,9406,9407,9409,9414}.{json,log}`
plus convo transcripts. Fix + proof: `src/js/game.js` (firesideTeaching
dead-teacher guard) + `scripts/test-fireside-dead-teacher.js`.

Numbering note: an unrelated instrument-only commit already uses the name
r51 (`scripts/journey-crisis-r51-famine-20261025.js`, no journey note).
This is lane B's r51 following r50's handoff; this run's files are named
`*-r51-lethal-*` / `*-r51-lethalscan*` to avoid collision.

## Headline verdict: THE LETHAL SORTIE FIRES. A leader can die on a sortie.

Seed 9407, day 83: Vyacheslav Matveev marched at 27 HP against the Spool
(130 HP, after staring down a hp-1 drumbelly_tanuki in the same march),
and died in round 4. The Spool records for three rounds (0 damage each —
"Replay hits for 0"), then plays the fight back: gear absorbs 5, Replay
hits for 29, Vyacheslav at 0. The sortie line fires in the same call
("faced Spool at the treeline... and didn't come back. The party carries
the body home. The sortie is over."), the Codex pages ("Vyacheslav is
dead. You didn't ask. It knew." / "The entry for Vyacheslav is finished.
1 deed recorded."), the fire goes small ("Nobody's talking much. The
fire feels smaller tonight."), the grief beat fires for him (wrapped
deathGriefBeat call, d83), a person corpse is recorded (Vyacheslav,
cause 'monster', d83), and he never fights, musters, or talks again —
the d116 muster is led by Andre, and the only later Vyacheslav lines
are the Callback wearing his face (d88, a monster mimic — legitimate
grief horror, not him acting) and the player taking his gear (d91).

## Pre-registered verdicts (§14 — bindings, not re-scores)

- M1 lethal window exists: GO — scan v2 found ratio >= 1.0 windows in
  the DRIVE timeline only as later-sortie wounds, not first lingerers
  (see instrument note). The driven panel produced two sub-30-HP
  leaders: 9414 d83 Elijah at 23 HP (survived a 19-damage round vs the
  Landlord, fled at 4 HP — a near-miss, one point of damage from
  death) and 9407 d83 Vyacheslav at 27 HP (died).
- M2 lethal path fires: GO — one driven sortie fight records outcome
  vDie AND the "didn't come back" line AND a deathGriefBeat call, all
  on 9407 d83 (fight log + call lines in the per-seed JSON).
- M3 aftermath honesty: GO WITH ONE RECORDED EXCEPTION — the leader is
  dead in the census (not among the 7 alive), the person corpse exists,
  no later fight/muster/talk shows him acting — EXCEPT one fireside
  lesson 338 say-lines after the death on the same game day
  ("Fireside lesson: Vyacheslav passes around Groundnut"). That is the
  bug below, fixed in this run; it does not overturn M3's core (he
  never fights or musters again), but it is a real post-death voice
  and is reported here, not hidden behind the GO.
- M4 regression (r50 filter holds): GO — 0 corpse-drafted lingerers and
  0 dead fighters in any muster across the driven panel.
- M5 people check: GO — 4 convos driven on 9407 (d36, d77, d101, d117),
  0 fabrication flags across all r51 transcripts (regex as r50). One
  thin beat noted below (d101 nod-loop); it is not fabrication.
- M6 no silent death: GO — the death is voiced in the same call as the
  fight, plus Codex + fire lines; no census-only death anywhere.

## Instrument honesty: scan v1 was wrong, scan v2 is the instrument

Scan v1 (no convo driver) reported strong first-lingerer windows
(9405: Redactor 260 HP vs a 37-HP leader, ratio 1.351; 9414: Callback
143 HP vs a 23-HP leader, ratio 2.0). The drive on 9414 did NOT
reproduce its v1 window at all: first lingerer d44, hp-1 beasts, a
64-HP leader. Root cause, proven by reproduction: conversations consume
seeded RNG, so a scan without the convo driver plays a different
timeline from the first raid day onward (drive's first convo was d10,
after raid d8). Scan v2 runs the drive's convo driver verbatim and
reproduces the drive's first lingerer EXACTLY (9414: d44, sweeps_week
hp-1 + drumbelly_tanuki hp-1, muster Francisco 64 / Lucas 52 /
Everett 60 — identical to the drive record). Lesson for every future
scan: the scan instrument must consume RNG exactly like the driver, or
its windows are fiction. The v1 files are kept (superseded, not
deleted) so the mistake stays auditable.

With parity, the real shape emerged: FIRST lingerers arrive while
leaders are still healthy (scan v2 panel: leaders 48–100 HP, best
ratio 0.46 on 9409). The lethal window is a LATER-sortie phenomenon —
leaders worn down by defended fights and earlier marches, then sent
out again. The drive (answer every set, up to 2x per object) is the
right instrument for it, and it found the window on its second panel
seed with a lethal outcome.

## The bug found and fixed: the dead still teach at the fire

Root cause: `firesideTeaching()` picks its lesson from the
sharedKnowledge queue (`entry.discoveredBy`) and never re-checks that
the discoverer is still alive. Vyacheslav discovered Groundnut while
alive; the queued lesson drained after his death and was voiced as if
he were still at the fire. The same class applies to the animal-story
branch (`learnedBy`).

Fix (`src/js/game.js`, 14 insertions): both branches now skip a lesson
whose teacher reads dead via the established `vpOf(id).dead` pattern
(villager-agency.js:727 precedent). A skipped entry is left untaught
(no voice, no deed credit) so a later call may pick another entry;
nothing is re-voiced as a memorial — that would be a new beat, and it
is Steve's call, not a silent fix. Orphaned-entry tradeoff recorded
here: a dead discoverer's plant stays untaught through the fireside
channel (other channels still teach it).

Proof (`scripts/test-fireside-dead-teacher.js`, sim-harness): control
(alive teacher) voices the lesson and marks it taught; dead teacher
voices nothing and leaves the entry untaught. BEFORE the fix the test
fails exactly the two dead-case checks; AFTER it passes all 7 checks.
(The first proof draft keyed lesson detection on the plant display
name and missed the bug — the display name itself changes once the
lesson teaches it. Detection now keys on teacher name + lesson
phrasing; the draft's failure is documented, not hidden.)

## Panel totals (5 driven seeds)

- Sorties 15, sortie fights 18: vKill 1, mFlee 15, vFlee 1, vDie 1.
- The vKill: 9406 d75 Kamon vs nightcourt (20 taken, 3 rounds).
- The vFlee: 9414 d83 Elijah vs landlord (19 taken from 23 HP, fled
  at 4 HP).
- Pantry-delta spot check (r50's revised M3 formula, held): 9407 d83
  20,872 -> 16,795 = 4,077 paid, exactly the sortie line's figure.
- No sortie death other than Vyacheslav; no leader death in any other
  panel fight.

## Village assessment (plain words)

9407's village lived, but it bled all run: 7 alive at horizon (Lucas,
Andre, Nora, Caleb, Rajab, Nina, Orlando) with stores at 18,309 kcal,
against 14 dead — starvation early (Sung, d12), arena deaths (Violet,
Huguette, Emma, Gulmira), monsters (Zoe, Sanne, Waman), sickness
(Luis), the night (Pavel, Mia), and the sortie (Vyacheslav). The
sortie death did not break the village: Andre led the next march
(d116, cleared the treeline), the fire kept burning, and the Callback
wearing Vyacheslav's face on d88 turned his death into dread rather
than a footnote. 9405 wiped (game-over, 4 alive, pantry 0, 1 sortie);
9406 held (6 alive, 17,855 kcal); 9409 thinned to one survivor (Yuki,
1,597 kcal); 9414 held (5 alive, 4,507 kcal). Survival here is still
what r50 said: anyone left standing, anything left to eat — and now,
provably, whether the march itself brings everyone home.

## People check (transcripts read in full, seed 9407)

- d36 Vyacheslav (alive): confronted — he wants to preserve who "they"
  were, admits the performed self isn't real, warns to watch the quiet
  ones. Real want, engaged, resolved by leaving. No fabrication.
- d77 Vyacheslav (alive, 6 days before his death): "Has this changed
  you? Like, fundamentally?" — answered honestly, resolved ("The old
  you got you here. The new you keeps you here."). The recap picked
  twice is a driver artifact (same class as r49/r50); the NPC handles
  it honestly ("Like I said —").
- d101 Sanne: THIN BEAT — six consecutive nods, German glosses
  ("So ist es", "Richtig", "Ja", "Stimmt") with no want, no question,
  no ending beyond "the talk running its course." Language-learning
  content, but a nod-loop, not a conversation. Recorded, not fixed:
  the driver picked what was offered; whether a human would be offered
  more is a question for the conversation lane, not this leg.
- d117 Andre (after the deaths): grief ("I dreamed Gulmira was still
  here. Woke up angry at the dream."), a work-alone boundary deflected
  honestly twice ("I just said — did you miss it?"), strange sleep,
  tending the fire at odd hours. Real mourning, real deflection.
- 0 fabrication flags across all r51 transcripts. No dead villager
  talks after death; the fireside lesson was the only post-death
  voice, and it is fixed above.

## Reachable / fun / winnable (crisis leg)

- Reachable: YES — the lethal path fired on an unforced driven panel
  (no state construction, no wounding by hand; the driver only
  answered the beat panel's own sortie offer). A human player who
  keeps sending a wounded bench out will meet it.
- Fun: YES, grimly — the death is the siege's highest stake made real:
  priced in the open, fought blow-by-blow (three silent recording
  rounds, then the replay kills), mourned by Codex, fire, grief beat,
  corpse, and a face-stealing Callback. The near-miss on 9414 (4 HP)
  is the same tension from the other side.
- Winnable: YES — 4/5 driven villages reached horizon; the one wipe
  (9405) was earned (empty pantry, attrition), not a sortie death.

## Metric review (§14)

No metric was re-scored mid-run. Notes for the NEXT run:
1. r50's revised pantry formula (delta-exact, paid = actual whole-unit
   draw) held on the spot check; it stands as the price metric.
2. Scan instruments must consume RNG exactly like their drivers
   (convo driver included) or their windows are fiction — scan v2 is
   now the template.
3. M3's "no later line shows the dead leader acting" bar caught a real
   bug (fireside lesson); the bar stays, and the animal-story branch
   got the same guard.
4. Open items carried forward (documented, not fixed): (i) the d101
   nod-loop thin beat — conversation lane's question; (ii) whether a
   dead discoverer's orphaned fireside entry should be picked up by a
   living villager who knows the plant, or voiced as village memory —
   Steve's call; (iii) unfed marches proceed (r50 open item, still
   Steve's call).

## Telemetry check

Baseline `hidden_files/telemetry-baselines/crisis-sortie.json` (r50)
vs r51 panel glob: one LOUD line — gorgeNights 52 -> 20 (-62%).
Investigated, EXPLAINED, baseline NOT rolled: gorge nights count
nights a set is left to gorge, which falls when sorties are answered
promptly and benches aren't bare. r51's panel replaced r50's wiped,
refusal-heavy 9408 (19 gorge nights) with 9414 (6), answered every
set at first sight, and ran on a moved build (sibling landings between
r50 and r51 legitimately re-rolled raid histories). The count is a
timeline-sensitive emergent number, not a stable instrument reading;
rolling it would erase r50's reference for a non-comparable panel.
Other metrics were quiet (sorties/raids/convos/fabricHits/sortieFights
within band for n=5 files).

## Regressions

No other src/js change this run (game.js guard only, 14 insertions).
- New proof test: green before/after (fails 2 checks pre-fix, passes
  all 7 post-fix). `check.js --only fireside`: 1 passed, 1 failed —
  the failure is `test-break-knowledge-firesidewrong-20261008.js`
  (`Text is not defined` in its old break-monsters harness), proven
  pre-existing by running it on pristine HEAD game.js (identical
  failure; old-harness drift, not this fix).
- `check.js --only crisis`: 10 passed, 4 failed — all 4 proven
  pre-existing (sleep-crisis-bedtime, util-raid-crisis,
  winpath-crisis-kinds fail identically on pristine HEAD game.js;
  blitz-crisis hits its 120s per-test cap in both runs).
- The full `check.js --quick` (22 min in r50) was not re-run; the
  relevant slices above cover the changed area, and the game.js diff
  is confined to two fireside guards.

## Landing note

[TBD at landing: commit hash, master movement, re-verification.]
