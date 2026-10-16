# Journey leg: ESTABLISHMENT (days 14–40) r7 — 2026-10-16 (10:45 CDT run)

**Run provenance (stale-lock recovery):** the 14:53 UTC run created
`playtest-loop.lock` and registered `journey-establishment`, authored this
run's pre-registered script (`scripts/journey-establishment-r7-20261016.js`),
then died before executing it (no heartbeat, no evidence, one uncommitted
script). This run deleted the lock per the overlap guard, adopted the tree
(same loop, same leg — no concurrent instance), heartbeated it, and executed
the script unchanged. The pre-registration below is the dead run's, written
BEFORE any numbers were observed — honored as written (MEASUREMENT.md §14).

Rotation read 1 (establishment). Played leg 1 via
`scripts/journey-establishment-r7-20261016.js` (sim-harness + pinned competent
policy; knobs FATSEEK=1, RENDER_LADDER=1, INVITE_PARTY=1, FAVOR_ACCEPT=1,
STALL_BREAK=1). Seeds 61, 82, 103, 124 (same as R1–R6, comparability).
DAYCap=40, death-aware stop. 4 seeds × 40d ≈ 23s wall, deterministic.

Canon read: CANON.md, PRESERVATION.md, BEAR.md, CONTESTS.md, MONSTER-WAVES.md,
CONVERSATIONS.md, BALANCING.md, DIRECTIVES.md.

## PRE-REGISTER (from the script header, dead run's words)

- **Question:** the landing fortnight ends with healthy pantries (31k–46k kcal
  at day 14, r18). Where does that go by day 40 — does the establishment food
  economy HOLD, cascade into HONEST famine, or break SILENTLY? First
  establishment run on the 0152a2ce granularity substrate (pantry piece
  behavior watched alongside).
- **Interesting:** a famine cascade that is LEGIBLE (combat/wound bleed →
  fewer foragers → pantry drain → legible warning lines → starvation deaths,
  all readable in series/transcripts) = the early wall working as designed;
  a SILENT cascade (deaths with full pantry, no warning lines, no pantry
  warning path) = a system trap to fix.
- **Binding metrics:**
  - E1 holds: ≥2/4 villages alive at day 40 with pantry > 0.
  - E2 cascade honesty: starvation deaths ≤ 2 per seed on ≥3/4 seeds; any
    seed with ≥3 starvation deaths must show a legible warning trail.
  - E3 people: ≥10 full transcripts sense-read, 0 senseless flags.
  - E4 granularity sanity: max per-unit atom ≤ 500 kcal on all 4 seeds.
  - E5 winnable: ≥2/4 villages alive at day 40.

## METRIC VERDICT

- E1 holds — **PASS.** 4/4 alive at day 40. Pantries: 35.8k / 75.2k / 27.4k /
  36.4k kcal (raw + preserved), all > 0.
- E2 cascade honesty — **PASS.** 0 starvation deaths on all 4 seeds. No
  cascade occurred — nothing to judge legibility against (see headline).
- E3 people — **PASS.** 10 transcripts sense-read, 0 senseless (below).
- E4 granularity sanity — **PASS.** Max piece: 417 / 500 / 419 / 451 kcal.
  Seed 82 sits exactly ON the 500 boundary — drift-watch, not failure.
- E5 winnable — **PASS.** 4/4 villages alive at day 40.

Convergence state: **converging** (pilot; all five bind, new finding below).

## HEADLINE: the famine cascade is not reachable in this window anymore

The r7 question's answer is the first option, emphatically: the food economy
HOLDS. Pantry series (kcal): 61: 47.3k→30.1k→42.2k→47.6k→39.1k;
82: 47.3k→41.4k→49.7k→72.4k→75.2k; 103: 47.3k→54.0k→60.6k→62.5k→~64k;
124: 47.3k→22.9k→23.7k→28.9k→35.3k. Villages end the leg with 35–75k kcal —
roughly 2–5 village-days of food — and 0 starvation deaths across 160
village-days.

Contrast: r4 (old substrate, 2026-10-15) measured pantry = 0 kcal at day 40
on ALL 4 seeds — hand-to-mouth. On the 0152a2ce granularity + haul-unrevealed
substrate, pantries hold and grow. The scale-r2 handoff's "d35 starvation
cascade after the combat bleed" did not reproduce. **The early wall in the
establishment window is now combat + expedition thirst, not food.** Whether
that matches Steve's "food scarcity pressure high" thesis is a design call
for him — the numbers are unambiguous, and this run is not re-scoring them.
Death causes across the leg: 13 combat, 3 expedition, 1 sickness, 1
dehydration (expedition thirst, see below), 1 "alien" (day-41 tail).

## VILLAGE ASSESSMENT (plain words)

**Seed 61 — the bleeding village.** Wilhelm, the first scholar, died in
combat on day 9. Four more villagers fell in combat/monster fights by day 35.
10 alive at day 40 — the village absorbed newcomers to replace the fallen.
Jovan (trust 76) and Nina (66) form the trusted core; Xavier asks for comfort.
Pantry 35.8k kcal in 156 pieces. Contests held: hide, calorie_run, echo —
the pilot aired day 23.

**Seed 82 — the mantle-pass village.** Four scholars in 38 days: Sidney
(combat, day 8) → Gilberto (combat, day 19) → Maricela (combat, day 24) →
Andres (dehydration on expedition, day 38, at map 7,0 with a forager's kit —
hickory nuts, branches, a spear). The village kept going anyway: 7 alive at
day 40, Marcus at trust 82 leading, Naomi at 65. Pantry 75.2k — the richest
of the four, 288 pieces. Contests: pantry_raid, lottery, moot, echo, hide,
siege. This village fights its own fights and buries its own scholars.

**Seed 103 — the grieving village.** Lucas fell sick on day 13, begged the
scholar for help ("achy and wrung out, barely keeping food down"), the
scholar promised and never came — Lucas died of the sickness on day 23.
Two more died in combat on day 34. 9 alive: Nathan (trust 88) leads, Vera 64,
Aroha 51; Petra 14 and Carlos 0 sit outside the circle. Pantry 27.4k — the
only seed with 0 preserved kcal (preserver staffed but nothing to preserve?
or nothing preserved). Contests: wrongmap, secrets, informant, witness.

**Seed 124 — the trusted village.** Three combat deaths days 13–20, one
"alien"-cause death in the day-41 tail. 8 alive: Moshe (trust 90) and Jae
(82) anchor a tight core, Paola (73) begged the scholar for a forage partner
because "we're eating through stores faster than we replace them" — the
pantry dipped 47k→23k mid-leg, so her fear was honest trend-reading, and the
village recovered to 36.4k. Contests: duel, pit ×2, starve. Pilot aired.

**Who leads:** every seed grew a trust-80+ tier by day 40 (Marcus 82, Nathan
88, Moshe 90/Jae 82; Jovan 76 on the bloodied seed 61).
**Who is miserable:** Carlos sits at trust 0 on seeds 103 and 124 (two
different generated people, same first name — cross-seed name-pool
coincidence, not a uniqueness violation); Petra 14 on 103.
**What is missing:** with pantries this full, smoke racks/preservation
finally has surplus to work — 3/4 seeds carry 11–15k preserved kcal.
Duties instrument is thin this run (specFinal only tracks
preserver/cook/fisher); cook/fisher show 0 staffed everywhere, which may be
an instrument naming gap rather than a village gap — not asserted.

## PEOPLE CHECK (10 transcripts sense-read, 0 senseless)

1. 61-d13 Oktay (curious): asks the scholar's first memory; the answer
   ("a kitchen, morning light") lands; she answers back honestly. Engaged.
2. 124-d31 Paola (ask_favor): wants a forage partner, names the shea patch
   past the treeline, the player commits — resolution=promised, obligation
   created. (The policy later broke this promise — see blanks.)
3. 82-d19 Andres (ask_favor): festering wound, "can't haul, can't hunt,
   can't watch" — escalates sensibly, the player commits, a betrayal-lure
   ("come get air with me") is declined cleanly. The namebeast beat then
   shows the village naming a monster by debate: "The Big Beast" (Maricela),
   "Loud-Eyes" (Carlos), "The Ugly Bastard" (Andres)… — canon naming,
   alive in the sim.
4. 103-d25 Naran (seek_comfort): the weakest read — three rounds of "are
   you okay?" get vague non-answers; the stall-breaker ends it like a human
   would. Thin but human, not senseless.
5. 103-d3 Vera (curious): "A full night's sleep. Just one." → "God, yes.
   That's the dream now. Eight hours of not being afraid." Short, real.
6. 61-d1 (curious): "what's the funniest thing you've seen?" — a real laugh,
   "the first real one you've heard in days." Human.
7. 82-d1 (curious): "What do YOU think actually happened to us?" — the
   NPC has a theory, spars with the player, pockets the disagreement.
   Engaged.
8. 103-d13 Lucas (ask_favor): sickness plea, the player commits ("help
   Lucas with their sickness"). Lucas dies day 23 of that sickness after
   the promise rotted — and the game says so out loud: "You said you'd
   help with the sickness I'm fighting — and it never happened. Promises
   rot. (-15 trust)." The system remembers. Honest consequences.
9. 124-d37 (curious): a villager confesses stealing medicine from the stash;
   the player says "I won't tell." A planted thread, in-voice, sensical.
10. 82-d37 Omar (curious): gossip beat — "Boris is back. Walked in like
    they'd never left." — then the beast-naming debate ("Ugly-Eyes" with
    per-villager votes from Carlos, Naomi, Omar, Boris). The village talks
    about itself. Sensical.

## BLANKS FILLED / DOCUMENTED

1. **Documented (design-level):** famine is unreachable in the establishment
   window on the new substrate (see headline). Not a bug — an emergent
   tuning outcome for Steve's call.
2. **Documented (policy gap, not game bug):** favorPromised=5, favorKept=0,
   favorBroken=5. The game side is exemplary — every broken promise fires
   the "won't meet your eye… Promises rot. (-15 trust)" line with the
   specific unkept promise named. The pinned competent policy accepts favors
   (FAVOR_ACCEPT=1) and never fulfills them. Likewise the seed-82 scholar's
   dehydration death: the THIRST-HOME route-around exists in the policy but
   is env-gated (COMPETENT_ROUTE_AROUND=1) and was OFF for this run, so the
   pinned policy repeated the known "sat on a trail tile at hydration 0"
   failure. The death itself was narrated honestly ("Andres Camacho is dead
   — dehydration").
3. **Verified clean (not a bug):** the `bearer <redacted>` strings visible in
   ledger.js/nomad-drive.js reads are DISPLAY-ONLY pipeline redaction —
   byte-verified (charCodes 72,79,77,69 = "HOME"; 100,101,97,116,104 =
   "death"). No corruption, no repair needed.
4. **Instrument choice, not a bug:** feasts=0 across all seeds — the policy's
   feast routines are harness-gated (`feastOn()`) and the gate was off.

## REACHABLE / FUN / WINNABLE

- **Reachable:** pilot + regular contests aired on 4/4 seeds (first airing
  days 16–23); monster fights, beast-naming, favor/wound/sickness beats all
  fired without staging. Yes.
- **Fun:** the transcripts read as people — confessions, grief, naming
  debates, broken promises with consequences. The leg's texture is intact.
  Caveat: with zero food pressure, the survival half of the fantasy leans
  entirely on combat/expedition risk in this window — see headline.
- **Winnable:** 4/4 villages alive at day 40, populations 7–10, pantries
  27–75k, trust cores formed. The leg is survivable clean (and bloody).

## METRIC REVIEW

Metrics held — no re-scoring. Two notes for the NEXT run: (a) E2's warning-
trail clause was untestable (no cascade occurred) — on a substrate this rich
the cascade-honesty metric needs a lever that actually threatens famine, or
it should be retired for this leg; (b) E4's 500-kcal atom bound was hit
exactly on seed 82 — if the cap is intentional, fine; if pieces should sit
well under it, the bound wants revisiting. Convergence: converging.

## Files

- Script: `scripts/journey-establishment-r7-20261016.js` (adopted from the
  dead run, unmodified, executed as written)
- Census JSON + transcripts + system logs:
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-16/journey-establishment-r7-*`
  (census-61/82/103/124.json, 22 transcript .txt, 4 system .txt, run log)
