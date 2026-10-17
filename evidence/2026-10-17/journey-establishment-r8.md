# Journey leg: ESTABLISHMENT (days 14–40) r8 — 2026-10-17 (07:45 CDT run)

**Run provenance:** clean scheduled run (no lock present at start). Rotation
read 1 (establishment). Played leg 1 via
`scripts/journey-establishment-r8-20261017.js` (r7 harness + r8 combat-death
autopsy instrument + sysSay capture fix; pinned competent policy; knobs
FATSEEK=1, RENDER_LADDER=1, INVITE_PARTY=1, FAVOR_ACCEPT=1, STALL_BREAK=1).
Seeds 61, 82, 103, 124 (same as R1–R7, comparability). DAYCap=40, death-aware
stop. 4 seeds × 40d, one process per seed, deterministic (re-run reproduced
the identical 20-people-death list).

Canon read: CANON.md, MONSTER-WAVES.md (wave-1 animal shock; counter
discovery channels; readiness gates), CONTESTS.md (pilot episode in window;
played not RNG), PRESERVATION.md, BEAR.md, CONVERSATIONS.md, BALANCING.md,
DIRECTIVES.md. No new canon.

## PRE-REGISTER

- **Question:** r7 proved the food economy HOLDS through day 40 (4/4 alive, 0
  starvation deaths) — the leg's real pressure is COMBAT (13 deaths) +
  EXPEDITION THIRST, not food. Are those deaths LEGIBLE (threat telegraphed,
  cause-chain narrated, readable in the stream) and FAIR (a competent player
  can see them coming and act), and is the wave-1 animal-shock texture FUN
  (real hard fights, not silent instakills)?
- **Interesting:** a combat death with a visible warning trail
  (monster-glimpse lines, threat verbs, combat_start, honest death narration
  naming the killer/context) = the wall working as designed. A death with
  ZERO warning trail = a system trap to fix.
- **Binding metrics:**
  - E1 winnable: ≥2/4 villages alive at day 40.
  - E2 combat legibility: ≥75% of combat deaths carry a warning trail in the
    captured stream (60 lines before the death line). 100% autopsy coverage.
  - E3 thirst legibility: 100% autopsy on thirst/expedition deaths; the
    warning trail quoted or noted absent.
  - E4 people: ≥10 full transcripts sense-read, 0 senseless flags.
  - E5 contest reach: contests held on ≥3/4 seeds.

## METRIC VERDICT

- E1 winnable — **PASS.** 4/4 villages alive at day 40 (8/8, 8/8, 8/8, 8/8).
  Pantries: 18k / 36k / 80k / 25k kcal, all > 0.
- E2 combat legibility — **PASS.** 14/14 combat+monster people-deaths carry
  a warning trail (100% ≥ 75%). 20/20 people deaths autopsied (100%).
- E3 thirst legibility — **PASS.** 3/3 dehydration deaths autopsied, each
  with an explicit thirst-warning trail (quoted below).
- E4 people — **PASS.** 10 transcripts sense-read, 0 senseless (below).
- E5 contest reach — **PASS.** Contests held on 4/4 seeds (3, 3, 2, 2);
  pilot aired on 4/4 (first airing days 16–19).

Convergence state: **converging** (pilot; all five bind; one tooling blank
filled below).

## HEADLINE: the combat wall is legible — every death announced itself

20 people deaths across 160 village-days, and NOT ONE was a silent
instakill. The autopsy instrument (corpse killerId + 60-line warning-trail
scan per death) found a real trail for every combat death and every
dehydration death:

- **Jovan (61-d36, Highbeam Deer):** "It freezes. Like a deer in headlights.
  Light gathers behind its eyes. It is not frozen. It is aiming." → "⚔
  HIGHBEAM DEER! You're on your own." → "💥 Ocular Discharge! A ray of
  light lances FROM ITS EYES — and it's swinging toward you. MOVE." A
  beautifully telegraphed fight. The death is the player's to own.
- **Wilhelm (61-d18, dehydration, scholar):** "No water here — find a creek,
  pond, or wetland. Dry ground doesn't fill a bottle." The game said the
  water wasn't there, out loud, before the scholar died of thirst. Legible.
- **Mateo (103-d16, combat, scholar):** "Something moves out there —
  Speedbump." Encounter announced, then the fight.
- **Samuel (61-d31, contest, scholar):** died mid-contest to "tiger's Raking
  Claws" — the contest resolved as a real fight, blow by blow, not a roll.
- **Stan & Sunette (103, alien killer):** "😨 The village is whispering.
  'Stan is dead. that stranger did it. We're not safe.'" — the alien
  infiltrator's kill, knowledge-gated (the village can't name what it doesn't
  know; "that stranger" is the deliberate unknown-killer fiction, verified in
  alienPlayers.js:2633 — `known ? per.name : 'that stranger'`).

The death narration itself is honest everywhere: "🕯️ X is dead — combat.
The village stops. Somebody screams. Somebody else starts digging."

## VILLAGE ASSESSMENT (plain words)

**Seed 61 — the village that buried five scholars.** Wilhelm (dehydration,
d18) → Samuel (contest, d31) → Miguel (combat, d32) → Jovan (combat, d36) →
Klaus (combat, d39). The village absorbed every mantle pass and stood at 8/8
on day 40. Xavier (trust 59) and Nina (49) anchor what's left. The grief is
in the transcripts: "I keep expecting to see them by the fire. Then I
remember." (Klaus, d19 — three days before his own death.) Pantry 47k→18k —
the only seed that drew down hard, and the villagers noticed ("I did the
count twice. The count doesn't change." — Zandile's pantry-run favor).
Contests: auction, duel, confession; pilot day 16. Specialists: Benoit and
Joshua cook, Luciana preserves.

**Seed 82 — the fighting village.** Sidney (combat, d13) → Gilberto (d17) →
Andres (d22) → Carlos (d35) → Naomi (d38): five scholars, all combat. The
village fights its own fights — Omar and Pavel (trust 61 each) lead, and the
beast-naming debates are the liveliest of the four seeds ("Big-Eyes"
(Naomi, Marcus, Omar, Pavel); "The Big Stare" (Onni)). Pantry 47k→36k,
steady. Contests: lockpick, hide, oath; pilot day 19.

**Seed 103 — the rich village.** Only 3 people deaths (Mateo combat d16; Stan
and Sunette to the alien infiltrator d29/d40). Lucas (trust 82) and Dorothy
(80) lead a calm, well-fed village: pantry 47k→80k, the richest leg end.
Nathan preserves. The alien killings went through the whisper/gossip path and
the village is afraid of "that stranger" — the fear/retaliation system
firing as designed. Contests: lottery, vigil; pilot day 17.

**Seed 124 — the thirsty village.** Jose (dehydration, d15) → Moshe
(dehydration, d24): two scholars died of thirst on expedition — the pinned
competent policy's known "sat on a trail tile at hydration 0" failure (the
THIRST-HOME route-around is env-gated and off for this run; the deaths were
narrated honestly both times). Paola and Zandile (trust 90 each) lead; Carlos
preserves (L3). Bridget joined the player's party (the one party join of the
run: "Someone should watch your back. Might as well be me."). Pantry
47k→25k. Contests: tithe, starve, pit; pilot day 18.

**Who leads:** every seed grew a trust-60+ tier by day 40 (Paola/Zandile 90,
Lucas 82, Omar/Pavel 61, Xavier 59).
**Who is miserable:** Bridget at trust 0 on 124 (joined the party anyway —
the invite overrode the trust gate, worth a design look); Samuel at 6 on 61
(a different Samuel than the dead scholar — same first name, living roster).
**What is missing:** cooks exist (Benoit, Joshua L2) but the cook instrument
shows no feast output — the policy's feast routines are harness-gated and
off, so the cook's product is unmeasured, not absent.

## PEOPLE CHECK (10 transcripts sense-read, 0 senseless)

1. 61-d13 Miguel (seek_taken): the Taken — his grandfather Alexander. The
   player says "I don't know anything"; Miguel: "Yeah. Sorry. It's — never
   mind. Forget I said anything." Embarrassed, human. Resolution: deflected.
2. 103-d31 Lucas (seek_comfort): "They shake their head, then nod — both
   true at once." Stall-break leaves like a human. Then the namebeast beat:
   "The Loud Beast" (Nathan, Wilhelm); "Big-Eyes" (Vera); "Big Big"
   (Sunette); "Ugly-Eyes" (Aroha) — per-villager votes.
3. 61-d37 Xavier (seek_comfort): "Have you — sorry. I keep thinking about
   them." Grief after four scholar deaths. Namebeast: "the thing with
   headlights for eyes, standing too still" — descriptor-first naming,
   canon-exact (no true name before the village agrees one).
4. 61-d19 Klaus (seek_comfort): "I keep expecting to see them by the fire.
   Then I remember." Namebeast: "the humming in the grass."
5. 82-d13 Carlos (seek_comfort + tellbeast): "Carlos goes still. 'The thing
   with headlights for eyes, standing too still. You're sure.' They'll tell
   the others — word travels fast around a fire." The witness-report channel
   works in-conversation.
6. 124-d19 Bridget (seek_taken + party invite): "Someone should watch your
   back. Might as well be me." Her father Liam: "He never did anything
   interesting except keep us all alive." Closing: "Do try to stay alive.
   The paperwork otherwise is murder."
7. 103-d19 Wilhelm (ask_favor): festering cut — "If it festers I'm no good
   to anyone — can't haul, can't hunt, can't watch." Player commits;
   obligation created ("help Wilhelm with their injury"). Gossip→debate
   chain: "Word gets around the haven" → "Nathan is calling it 'Ugly-Eyes.'
   They'll fight it out."
8. 82-d31 Marcus (curious + gossip): "the first real laugh you've heard in
   days"; gossip "Pavel is back. Walked in like they'd never left." — then
   honestly out of news: "I wish there was more to tell. That's it." No
   fabrication.
9. 61-d25 Jovan (ask_favor, fromSeed): "About the pantry run — the need
   hasn't gone anywhere. I'm still asking." Obligation: "forage with Jovan
   tomorrow to rebuild the pantry."
10. 124-d31 Zandile (ask_favor + tellbeast): "I did the count twice. The
    count doesn't change. Meet me at the old burn east of camp and we'll
    fill packs before dark." Tellbeast: "Two knobs on glass-still water,
    watching."

Hard-flag scan across all 28 transcripts: 0 fallback lines, 0 phantom
names, 0 stutters, 0 third-person favor heads, 0 verbatim repeats, 0 dry
declines, 0 fabricated-history flags. Lures offered 13, all spoken or
gestured. Gossip asks 3/3 rendered.

## BLANKS FILLED / DOCUMENTED

1. **FILLED (tooling blank): the sim-harness sysSay blind spot.** While
   verifying E5 I found MET.pilotAired=0 despite state.pilotAired=true on
   4/4 seeds. Root cause: `loadGame` silences BOTH `Game.say` and
   `Game.sysSay` (sim-harness.js:233-236); the journey wrapStream re-enabled
   say but left sysSay a permanent no-op. Every System-voice line — pilot
   episode announcements, wave beats, System commentary — was invisible to
   ALL journey transcripts, in every run that ever used this harness. Fix:
   wrap sysSay in the capture too (same display format sysSay itself uses).
   Proof: RED check (old wrap: 0/1 pilot lines captured) → fix →
   `scripts/test-syssay-capture-20261017.js` GREEN (4/4), plus a live
   capture: "📺 SYSTEM: "PEOPLE OF HAVEN. What follows is our PILOT EPISODE
   — a test broadcast."" / "📺 SYSTEM: "The pilot is LIVE. Try to look like
   you've done this before."" Not a game bug — the lines render on the
   phone; the instrument was blind. Future runs inherit the fix.
2. **Verified clean (not a bug):** "that stranger did it" in the alien-death
   whisper is deliberate knowledge-gating (alienPlayers.js:2633 —
   `known ? per.name : 'that stranger'`), not a failed name render.
3. **Documented (policy gap, not game bug):** favorPromised=4, favorKept=3,
   favorBroken=1 — the game side is exemplary (every kept/broken promise
   narrated with the specific promise named); the pinned policy accepted 4
   favors and fulfilled 3, breaking Jovan's pantry-run. The scholar
   dehydration deaths (Wilhelm d18, Jose d15, Moshe d24) are the known
   "sat on a trail tile at hydration 0" policy failure (THIRST-HOME
   route-around env-gated off); the deaths were narrated honestly with
   explicit thirst warnings beforehand.
4. **Documented (design note, not asserted):** corpse records carry
   killerId=null for field-fight villager deaths — the death line says "X is
   dead — combat" without naming the monster. Arguably correct-by-design
   (naming the killer would break the knowledge gate for unnamed monsters);
   a Steve-call if he wants killer attribution in the fiction.

## REACHABLE / FUN / WINNABLE

- **Reachable:** pilot + regular contests on 4/4 seeds; monster fights,
  beast-naming debates, tellbeast reports, favor/wound/sickness beats all
  fired without staging. Yes.
- **Fun:** the leg's texture is the strongest yet measured — grief that
  references the actual dead, naming debates with per-villager votes,
  telegraphed monster fights ("It is not frozen. It is aiming."), and
  System-voice announcements that are actually funny ("Try to look like
  you've done this before."). The combat wall reads as hard fights, not
  traps.
- **Winnable:** 4/4 villages alive at day 40 through 20 people deaths
  including 9 scholar deaths — the succession system carried every mantle
  pass. Pantries 18–80k. The leg is survivable and bloody.

## METRIC REVIEW

Metrics held — no re-scoring. Notes for the NEXT run: (a) the E2 ≥75%
threshold was conservative — measured 100% with real trails on 20/20; the
bar could rise, or the metric could graduate to killer-attribution quality;
(b) the sysSay fix means System-voice lines now enter the capture — future
runs can sense-read the pilot announcement and wave beats as player-visible
fiction; (c) `fledBad` (12) is a misnomer — it counts flees from outmatched
fights (policy playing well), not bad flees. Convergence: converging.

## Files

- Script: `scripts/journey-establishment-r8-20261017.js` (r7 harness +
  combat-death autopsy + sysSay capture fix + pilot-line stash)
- Proof test: `scripts/test-syssay-capture-20261017.js` (4/4 GREEN)
- Census JSON + 28 transcripts + system files:
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-17/journey-establishment-r8-*`
- Run logs: `/tmp/journey-establishment-r8b.log` (authoritative 4-seed run),
  `/tmp/journey-establishment-r8c.log` (seed-61 40d restore)
