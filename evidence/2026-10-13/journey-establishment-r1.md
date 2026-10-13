# Journey leg: ESTABLISHMENT (days 14–40) R1 — 2026-10-13

## Pre-registration (docs/MEASUREMENT.md §§9–12)
- **Question:** does the establishment window cohere as a play leg — village routines
  (fishers, smoke racks, specialists), pantry pressure across days 14–40 for ~12
  villagers, party formation (System unlock day 7, cap 3→4 day 14 →5 day 30), first
  contests (unlock day 14, pilot guarantee ≥ day 21), wave-1/2 monsters as real fights,
  knowledge economy deepening?
- **Interesting:** pilot aired + playable; party invite machinery fires; preservation
  ladder climbed; pantry holds or cracks namably; OR confirmed silence = blank.
- **Seeds:** 61, 82, 103, 124 (pilot, 40d, death-aware). Policy: competent + FAVOR_ACCEPT=1.
- **Canon read:** CANON.md, PRESERVATION.md, CONTESTS.md, PARTY.md, MONSTER-WAVES.md.

## What ran
- Harness: `scripts/journey-establishment-r1-20261013.js` (adapted from landing-r10:
  40d, convo cadence every 6d, establishment telemetry — pantry by foodState,
  party roster/cap, assignments, specialist census, contest lifecycle watch).
- Pilot: 4 seeds × 40d. Seeds 61/82/124 reached day 40; seed 103 game-over day 20.
- 27 full transcripts, all sense-checked (zero "I just said"/Mara/stutter/fabric-history flags).

## Village assessments (plain words)
- **Seed 61 (Wilhelm):** 12→9. Lost Marcus (d17) and David (d32) to monsters, one
  generated villager (d23). Villagers killed hushwolf×3, hummice×4, nightcourt,
  white-noise heron, nightlight catfish in real fights. Pantry 47k→29k (raw 18k +
  preserved 15k — the smoke racks work). Pilot contest d23 (wrongmap), second d32.
  A going concern at day 40.
- **Seed 82 (Sidney):** 12→3 — a bloodbath. Days 21–24 (wave-2 era) took David, Sofia,
  Marcus + 2 generated villagers to monsters; a contest ('price') killed one (d23);
  Lena died d36 of "a wound that wouldn't close"; one starved d40. Pantry 47k→6.5k,
  raw only — no preserved food. Only ONE monster-codex entry (hushwolf "Ugly-Eyes")
  despite ~14 monster kills: NPC kills don't report to the codex (blank, documented).
  5 contests (d17/20/23/25/35) — at the letter of the 2/week budget (7-day blocks),
  but 4 in 9 days feels like a barrage (boundary artifact, noted not fixed).
- **Seed 103 (Mateo):** dead at day 20. Pantry 47k→0 by day 17 with a 16k cliff on
  days 11–14 (mechanism not fully traced — no feast/theft lines; documented with
  series data). James (d16) and Lena (d19) starved AT HAVEN with an empty pantry;
  Marcus died of sickness d20. The scholar survived on ~1500 kcal while villagers
  starved — the village-as-protagonist held, the village didn't.
- **Seed 124 (Jose):** 12→7. Wave-2 kills (mirrormoth, bright_idea, voice_mimic_radio
  in villager combat), one starvation d25, pantry 47k→15.7k (preserved 7.6k + raw
  7.8k). 4 contests. Holding.

## The people check (transcripts read in full)
- **James (s124 d13):** "I can't reach this properly. Will you help me clean it?"
  → "It's getting worse, not better. If it festers I'm no good to anyone" →
  player commits → "Careful with it. And — thank you." Reads like a person.
  (The promise then rotted — see fix 2.)
- **Kirollos (s124 d25):** opens "We never did finish talking about that question —
  that was 11 days back. Still on your mind?" (real 11-day callback), then a
  pantry-aware ask: "We're eating through stores faster than we replace them.
  Forage with me tomorrow? I know the south slope below the meadow." The village
  feels alive to its own pressure.
- Gossip renders 7/7 asks; lure declines acknowledged honestly 8/8; betrayal lures
  spoken or gestured, never silent (8 offered).

## Blanks FILLED (fixed in worktree, proof-tested)
1. **Background-survivor draw was deterministic** (game.js): the first-name-collision
   guard used `findIndex` — first non-colliding entry in file order — so the SAME
   six survivors (Lena Ruiz, Marcus Webb, Sofia Chen, James Okonkwo, Emma Larsen,
   David Kim) opened every run. The original code was splice-random (regressed in
   2d5c2467). Fix: pick randomly among non-colliding candidates; guard kept.
   This also starved the specialist economy: the file's 5 cook-ish survivors
   (Rosa Mendez, Hannah Kim, Jesse Cortez, Elena Petrova, Benoit Lambert) almost
   never appeared — measured 2 cook-ish villagers in 120 generated (expect ~6-7).
   Proof `scripts/test-bg-survivor-draw-20261013.js`: RED 7 distinct/20 runs with
   100% recurrence → GREEN 66 distinct, 25% max recurrence.
2. **Broken-favor line was senseless** (game.js checkPromises): "Maricela doesn't
   say anything. But about 'help Maricela with their injury' — silence. Promises
   rot." — double silence + third-person ledger task. Now: "Maricela won't meet
   your eye. You said you'd help with this wound — and it never happened. Promises
   rot. (-15 trust)" (uses the favor's NPC-voiced `short`). Fired in-sim post-fix.
   Proof `scripts/test-favor-broken-line-20261013.js`: RED→GREEN.
3. **sim-harness export clobbering** (tooling): game files' `module.exports = ...`
   guards (food.js, justice.js, audio-registry.js) executed under sim-harness's
   direct eval resolved `module` to the HARNESS's own module — the last such file
   silently replaced our exports (driveFights undefined for any require after
   loadGame; the journey harness only survived by destructuring before loadGame).
   Fix: evalFile shadows `module`/`exports` with a throwaway. Proof: post-loadGame
   require keeps driveFights/driveContests as functions, loadFails empty.

## Blanks DOCUMENTED (not fixed — future runs)
- **Trapline never fires:** 0 traps crafted/set in 160+ village-days (player AND
  NPCs). Player needs snare L1+ (taught by knowsSnare villager at trust 15+, or
  witnessing a catch); NPC TRAPS objective needs knowsSnare (hunting_guide,
  trail_crew, fishing_guide, rancher, forager — rare in casts). Chicken-and-egg
  when no cast member knows the wire. A core survival verb unreachable in 4/4 runs.
- **Preservation ladder stalls at smoking:** 181 smoke lines, 0 render, 0 pemmican
  across 4 runs. May be pacing-correct (rendering is mid-game); noted.
- **Party 0 joins in sims:** machinery proven working end-to-end via targeted probe
  (`scripts/test-party-invite-probe-20261013.js`: trust-gated invite → "Yes.
  Absolutely. I've been hoping you'd ask." → 1/3 members). The competent policy
  never invites — policy blank, not game blank. Harness has INVITE_PARTY knob now.
- **Monster codex thin:** NPC monster kills don't report (seed 82: 1 entry for
  ~14 kills). The tellbeast machinery exists for the player; village kills stay
  local.
- **Seed 103's 16k pantry cliff (d11–14):** mechanism untraced; series data kept in
  /tmp/journey-establishment-r1-census-103.json.
- **Triple thirst deaths** (seed 124 final run, d25): water-system event; for the
  water axis.

## Regressions
- favor-system 30/30, sick-favor 17/17, favor-register-r4 31/31,
  settled-favor-engage 18/18 (one assertion widened: the settled pool cycles 3
  honest variants, only one contains "handled" — the old /handled/i assertion was
  RNG-fragile and broke on the bg-draw fix's RNG-stream shift, not on behavior),
  deferred-favor 12/12, forage-favor-directions 12/12, ontology 86/86.
- Pre-existing failures, untouched: background-survivors data test (stale 75-baseline
  vs 97-entry file), soc-favor-followup (hardcoded seed setup no longer qualifies).
- New proof tests: test-bg-survivor-draw + test-favor-broken-line (both RED-verified
  pre-fix, GREEN post-fix).

## Verdicts
- **Reachable:** YES for contests (pilot d16–23 all seeds, 1–5/leg, on budget),
  smoking/preservation, party machinery. PARTIAL for the specialist economy
  (cook scarcity — now fixed at the draw) and trapping (unreachable 4/4).
- **Fun:** YES — conversations read like people with real continuity and
  situational awareness; contests fire with dread cadence; favors have teeth.
- **Winnable:** MIXED — 1/4 villages dead by day 20, 1 at 3/12, 2 holding.
  Days 20–30 (wave-2 deployment + contest cadence) hemorrhage named villagers.
  Whether that's designed brutality or overtuning is the flesh-out combat axis's
  call; as a leg observation the mid-establishment is a meat grinder in sims.

## Files
- src/js/game.js (2 fixes), scripts/sim-harness.js (export shield),
  scripts/test-bg-survivor-draw-20261013.js, scripts/test-favor-broken-line-20261013.js,
  scripts/test-party-invite-probe-20261013.js, scripts/test-est-settled-favor-engage-20261012.js (assertion),
  scripts/journey-establishment-r1-20261013.js (leg harness + INVITE_PARTY probe).
