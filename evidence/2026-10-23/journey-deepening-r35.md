# journey-deepening r35 — WAVE-3 ARRIVAL + SIGNATURE SURFACING (2026-10-23)

## Run note (run start)

- Rotation file read 2 (deepening). r34 (alien-pool ability proof, 13/13 PASS)
  landed; the quirk channel stays parked as Steve's call (r33 DOCUMENTED, 0/10
  seeds wild). This run plays deepening as r35 and will write 3 at the end.
- No prior lock at run start. Lock `playtest-loop-a-2026-10-23T11:43:36+00:00`
  created; worktree `journey-deepening` registered from master 6722215c6
  (base verified equal to main-tree master), heartbeated; re-heartbeat every
  <15 min for the run.

## Pre-register (§14 BINDING — written BEFORE the first sim ran)

**Leg question:** In the deepening window (d40–80), when does wave 3 actually
arrive in competent play (unlock cadence), and when its monsters fight, do the
wave-3 signature mechanics surface in real fights — or are the fights over
before the mechanics play? (Wave 3's nine signature mechanics — Spool, Chorus
Line, Terms of Service, Redactor, Gavel, Focus Group, Callback, Buffering,
Ad Break — are the leg's crown-jewel content; MONSTER-WAVES.md documents them
as engine-real with telegraph honesty as law.)

**Code read (2026-10-23, BEFORE instrumenting):**
- `unlockedWave()` (game.js): wave 3 = day 25+ AND 4 wave-2 ledger points
  (kills only, per-type cap 2). Waves 1–3 never readiness-gated.
- Signature mechanics live in sigW3a.js (Redactor/Gavel/Focus Group),
  sigW3b.js (Spool/Chorus/ToS), sigW3c.js (Callback/Buffering/Ad Break); every
  signature event narrates via say() (no_silent convention).
- `Game.waveLedgerPoints(w)` reads the ledger; `monsterWavePool()` filters by
  unlockedWave; wanderer casts via `castMonster()` are wave-gated.

**Interesting-finding bar:** median wave-3 unlock day + spread across 4 seeds;
≥1 wave-3 fight where a signature mechanic narrates = the crown-jewel content
reaches players. 0 unlocks by day 80, or wave-3 fights with zero mechanic
narration = a blank: root-cause (ledger too slow? fights too short? mechanics
unreachable?) and fix if bug, document if design.

**Binding metrics:**
- P1 (unlock cadence, PRIMARY): 4 seeds (9981–9984), competent policy,
  DAYCAP=80 (leg horizon), death-aware stop. Daily trace of unlockedWave() +
  waveLedgerPoints(2); first day wave≥3 = unlock day. 4/4 seeds complete,
  0 wrap errors. Metric: wave-3 unlock day per seed (or "not by day 80").
- P2 (signature surfacing, report-only): wave-3 fight count per seed; per
  fight, which of the 9 mechanic regexes fired (say-line capture, fight-tagged
  via startCombat wrap). Report mechanic-fire rate per fight.
- M1 winnable: ≥3/4 villages alive at end (leg standard).
- M2 people (report-only): ≥6 full villager transcripts sense-read, 0
  senseless expected.
- Panel telemetry (body step 14): per-seed JSON carries literal-key
  w3fights / engaged.w3 / fightsTotal / fightsByWave.3, summed by
  telemetry-check against telemetry-baselines/deepening.json
  (w3fights=8, engaged.w3=18, fightsTotal=82, fightsByWave.3=8).

**Seeds / horizon / policy:** 9981, 9982, 9983, 9984, competent pinned,
DAYCAP=80, death-aware stop (+10d tail max). Natural behavior, no probes.

**Race guards:** measurement only — no src/js, no data, no policy tweaks.
If a blank proves to be a clear bug (not design), a minimal fix + proof test
is in scope; the quirk channel and wave gates stay parked as Steve's calls.
Fix only instrument-class bugs if proven wrong.

**Metric review:** (to fill after the run)

## RESULTS (2026-10-23, seeds 9981–9984)

### P1 — wave-3 unlock cadence (PRIMARY): 4/4 seeds complete, 0 wrap errors

| seed | days | end | wave | w3 unlock day | w2 ledger at end | scholar fights |
|------|------|-----|------|---------------|------------------|----------------|
| 9981 | 81 | survived | 3 | **47** | 6 pts | 10 (7 w1, 3 w2, 0 w3) |
| 9982 | 81 | survived | 2 | never (by 81) | 1 pt | 6 (all w1) |
| 9983 | 36 | village-lost | 2 | — (died d36) | 0 pts | 4 (all w1) |
| 9984 | 81 | survived | 3 | **53** | 10 pts | 13 (5 w1, 5 w2, 3 w3) |

The gate is the kill ledger, not the calendar: day-25 floor is long past by
the deepening window; what varies is the 4 wave-2 kill points. 9982 fought
only 6 times in 81 days (all wave-1) and crawled to 1 ledger point — a quiet
village may never see wave 3 inside the leg window. 9981 unlocked day 47.
Median unlock of the two that unlocked: ~day 50. Working as designed
(day 25 + 4 kills), but the leg named "wave 2–3" does not guarantee wave 3.

### P2 — signature surfacing (report-only): 3/3 fights surfaced mechanics

All three wave-3 fights happened on 9984 (the only seed that both unlocked
AND engaged):

| fight | monster | mechanic lines | surfaced |
|-------|---------|----------------|----------|
| d56 | Gavel | gavel ×4 | YES — full trial: "THE ACCUSED WILL RISE… Day 55: Raul Cruz died. Lucia picked up the Codex." VERDICT for 60/56, player went down, succession followed |
| d59 | Ad Break | adbreak ×30 | YES — progress bar (AD ▓░→▓▓), sponsor-creature, "SKIP AD is available" |
| d71 | Focus Group | focusgroup ×16 | YES — murmur ratings through the fight |

**100% surfacing rate (3/3).** When the fights happen, the crown-jewel content
plays. The Gavel fight was sense-read end-to-end: the accusation named a REAL
event from the run's log, the Object/Recess/Confess choices were offered, the
verdict had teeth (60/56 through armor), the Codex learned Accusation+Verdict.
SENSE-TESTING LAW: meaning, coherence, consequences — all present.

**9981's nuance (DOCUMENTED, not a bug):** unlocked day 47, wave-3 wanderers
spawned and were SEEN (Chorus Line "moves out there", Spool "followed you…
is here", Redactor "followed you"), and the village learned Spool's
counterplay by observation ("💡 COUNTER LEARNED — Spool: Feed it nothing…"
via the villagerTricks channel) — but the scholar never fought one in 34 days
of availability. Unlock ≠ fights: the signature mechanics are reachable
(9984 proves it) but fight-gated behind wanderer contact, which a cautious
player can dodge. Design tension, not a defect.

### M1 winnable: PASS (3/4 alive at end)
9981/9982/9984 survived to day 81. 9983 lost the village day 36: combat
attrition (belltoad, hushwolf, nightcourt, rut_king kills + elif_demir's
monster death) into a starvation spiral (henry_zhang, gen_a29exbk) plus a
ducks_in_a_row expedition loss — an establishment-window death spiral, before
the leg window opened. Not a deepening wall.

### M2 people: PASS (6 transcripts sense-read, 0 senseless)
- Nia (9981, lawyer): ask_favor — food stores low, "Forage with me tomorrow?
  I know where the coconut grows thick." Player declines → "They won't raise
  it again." Real want, deflection with consequence.
- David (9984, plumber): ask_favor pantry run, same honest decline arc.
- June (9982, mechanic): curious — "Are you angry? At whoever did this…"
  Player: "Furious. Most days." June: "Anger's a fire — useful if you cook
  with it, deadly if you sleep next to it. I cook with mine." A real voice.
- Aaron (9983, postal worker): wound-help ask, player commits — promise
  recorded on the day the village died. Poignant, coherent.
- Franz (9981, aquarium keeper): wound-cleaning ask, player commits.
- Brian (9984, zookeeper): thin but coherent — want already self-resolved
  ("Never mind the food I needed — we got it handled").

### Regional links / scale pressure (leg texture)
WORD TRAVELS beats fire: 9982 drew 6 (riders from Thornfield, Stonebridge,
Ashford, The Red Table), reputation evolving "they call you the Feared" →
"they call you the Indispensable. Other villages send envoys now. They need
what you know." Present but light — appropriate; leg 3 (scale) owns the
hierarchy.

## VILLAGE ASSESSMENT (plain words)

- **9981:** Ten alive at day 81, wave 3. The village that saw the new draft
  but never fought it — Chorus Line, Spool, Redactor all walked the treeline;
  the fire learned Spool's trick by watching. Quiet, competent, intact.
- **9982:** Nine alive at day 81, wave 2. The quiet village — 6 fights all
  run, 1 ledger point. The deepening window passed it by; the riders still
  came, and the riders talked.
- **9983:** The village that died at day 36. Monsters took five, hunger took
  two, the ducks took the expedition. Aaron's wound never got its hands.
- **9984:** Eight alive at day 81, wave 3. The village that FOUGHT the new
  draft — Gavel tried Lucia for Raul's death and put her down; the mantle
  moved and the village held. Ad Break and the Focus Group came after. Three
  signature mechanics, all narrated, all real.

## BLANKS FILLED / DOCUMENTED

1. **FILLED — wave-3 signature mechanics surface in real fights (3/3).**
   Gavel, Ad Break, Focus Group all narrated their mechanics on their real
   trigger paths; the Gavel trial used genuine run history. The crown-jewel
   content reaches players who fight.
2. **DOCUMENTED — unlock cadence is kill-gated and highly variable**
   (day 47 / day 53 / never-by-81 / died-first). A quiet village (9982: 6
   fights, 1 ledger pt) never sees wave 3 in the leg window. Working as
   designed — but the "wave 2–3" leg doesn't guarantee wave 3.
3. **DOCUMENTED — 9981: unlock without fights.** Wave-3 wanderers spawn and
   narrate; the village learns counterplay by observation; the scholar can
   still dodge every fight. Reachable but contact-gated — a design tension
   for Steve's awareness, not a defect.
4. **FILLED (doc) — MONSTER-WAVES.md "counter-less" imprecision.** The doc
   said waves 3–5 are "deliberately counter-less"; the `counter` DATA FIELD
   is indeed absent, but signature counterplay IS learnable through the
   separate `villagerTricks` observation channel (two survived encounters →
   "COUNTER LEARNED" beat). Clarified in-docs with the r35 Spool observation
   as the live proof. The doc's "wiring it to the ledger convention is their
   call" now names the channel that answered.

## JUDGMENT: reachable / fun / winnable (deepening leg)

- **Reachable:** yes, with variance — wave 3 unlocks for fighting villages
  (~day 50 median); quiet villages may miss it in-window. The mechanics fire
  when fought (3/3).
- **Fun:** yes — the Gavel trial is the best thing this leg has produced in
  a while: a real accusation from your own history, real choices, real cost.
  Ad Break's bar and the Focus Group's murmur both read on the page.
- **Winnable:** yes — 3/4 villages reached day 81; the loss was a
  pre-window death spiral, not a deepening wall.

## METRIC REVIEW

- P1's cadence stands; no metric proved wrong. The 80-day leg horizon (vs
  r33/r34's 100) is the correct leg framing per DEATH-AWARE HORIZONS.
- P2's "≥1 wave-3 fight with a mechanic" bar was met 3× over on 9984 alone.
- M1 PASS (3/4), M2 PASS (6 transcripts, 0 senseless).
- TELEMETRY CHECK (body step 14): RAN — 3 LOUD lines (w3fights 8→3,
  engaged.w3 18→3, fightsByWave.3 8→3). INVESTIGATED, verdict EXPLAINED not
  bug: (a) horizon 80 vs the baseline's presumed 100; (b) 9983's day-36
  death contributed 4 fights; (c) 9982's quiet seed (6 fights, 1 ledger pt)
  and 9981's contact-dodging (0 w3 fights despite unlock) are seed variance
  + cautious engagement, not spawn failure — wanderer encounter lines are
  healthy (22–54/seed) and no recent commit touched castMonster or the
  competent policy's fight behavior (COMPETENT_WARM gate is byte-identical
  by default). Baseline NOT rolled forward: its provenance (which run? what
  horizon/policy?) is unknown and my 80-day horizon differs — mixing them
  would corrupt it. Baseline provenance should be recorded next time it is
  seeded.
- Instrument note (mine): the per-seed JSON saves `fightsByWave` aggregates
  but not the raw fight list — 9981's "0 w3 fights despite unlock" needed a
  capture grep to explain. Next wave-cadence run: save the fight list.
