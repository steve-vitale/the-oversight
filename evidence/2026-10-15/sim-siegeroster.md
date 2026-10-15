# sim-siegeroster — GO TO GROUND (scale-onramp, run fleshout-a-20261015T001539Z)

Roster-level siege defense arm. The siegedef2r kill (evidence/2026-10-15/sim-siegedef2r.md)
proved the post-unlock wall is roster-level: the defended scholar lived longer
(5.00→3.20 deaths/unlocker) but the village died around it (median 85→85d).
This arm's mechanism protects VILLAGERS, not the scholar — genuinely different
in whom it protects.

## Pre-registration (MEASUREMENT.md §§9–12, 14)

- SUBSTRATE: leadfeast, FEASTSCALE_R13=1 (the siegedef2r road).
- CONTROL: SIEGEROSTER unset (pure leadfeast delegation). ARMED: SIEGEROSTER=1.
- Same code tree, identical seeds, env-var only. Policy-side only, no game-code.
- PRIMARY: post-unlock villager (non-scholar, kind villager/person — NEVER
  monsters) combat deaths per wave-5 unlocker <= control x 0.70 (>=30% roster
  death reduction).
- CO-PRIMARY: post-unlock scholar combat deaths per unlocker <= control
  (must not trade scholar for roster).
- GUARDRAILS: median >= control-10d; national >= control-2; no new death mode
  (family level); table/wins not regressed.
- HORIZON: 180d death-aware (runDays stops on Game.over / village-dead tail).
  Why: WIN-PATH HORIZON 180 (Steve 2026-10-13) — post-unlock survival is a
  late metric; shorter caps truncate exactly the long survivors it needs.
- SEEDS: 11/22/33/44/55/66/77/88 (pilot 8). Confirm (12-16) ONLY if GO.
- POLICIES: scripts/policies/siegeroster.js via measure-roster-20261015.js.
- A miss is NO-GO — never re-scored against a friendlier metric mid-run.

## Diagnosis (control substrate, scripts/diag-roster-20261015.js, full telemetry)

Post-unlock villager combat deaths: 12 across 5 unlockers = **2.4/unlocker**.
Channels (fieldFight vDie, post-unlock): RAID 6, WILD 6, OTHER 2.
Killer waves: w4 9, w5 2, w3 1, w2 1, w1 1.
Every raid/wild vDie: intent='learn', rounds 1-2 — villagers die BEFORE
learn-first's round-3 withdrawal fires. The matchup (w4/w5 vs 100 HP) is
hopeless; the judgment never gets a chance.

- RAID: raiders teleport to Haven, draft defenders (health>40, round-robin)
  fight 1v1 via fieldFight, die in 1-2 rounds.
- WILD: the wild router jumps NPCs on the monster's node — but SKIPS the
  player's tile. Villagers at Haven get jumped WHEN THE SCHOLAR IS AWAY.
  The scholar's absence IS the exposure.

## Mechanism (scripts/policies/siegeroster.js, SIEGEROSTER=1)

GO TO GROUND — threat-gated (wave>=4 within 2 tiles of Haven) during the
post-unlock window (unlock..unlock+60):
1. **holdHaven**: the scholar stays at / returns to Haven. The wild router
   skips the player's tile — a held Haven closes the wild channel.
2. **goToGround**: villagers on hunt/patrol/scout → garden (opportunistic;
   the base policy rarely assigns these).
3. **musterBeat**: narrated 📯 beat when the village goes to ground and when
   it stands down (sim-findings #245: the muster must be player-visible).
The scholar does NOT seek fights — the apex is outlasted, not engaged
(r35 lesson: AVOID w5). The raid channel is not addressed (raiders draft
regardless) — the arm targets the wild 6/12 and measures honestly.

## Runs

### Proof (RED -> GREEN)
`node scripts/test-siegeroster-20261015.js`: 31/31 PASS.
- RED: mechanism absent at bogus path (Cannot find module).
- GREEN: window timing (opens at unlock, closes unlock+60), threat detection
  (w4 at Haven / w1 ignored / w4 far ignored), goToGround reassigns,
  musterBeat narrates once per episode + stand-down, holdHaven travels,
  gate-off delegates.

### Det-gate
`node scripts/det-gate-siegeroster-20261015.js`: 2/2 seeds bit-identical
(days|endReason|deaths). The layer uses no RNG.

### SMOKE
`SMOKE=1 node scripts/measure-roster-20261015.js`: GREEN — policy drives
(4.8 calls/day), muster beat fires on scripted threat, 📯 line player-visible.

### Pilot (8 seeds x 180d death-aware, identical seeds)

| metric | control | armed | GO | verdict |
|---|---|---|---|---|
| PRIMARY villager post-unlock combat deaths/unlocker | 2.40 (12/5) | 2.40 (12/5) | <= 1.68 | **MISS** |
| CO-PRIMARY scholar post-unlock combat deaths/unlocker | 5.00 (25/5) | 5.00 (25/5) | <= 5.00 | PASS (equal) |
| median survival | 86d | 86d | >= 76d | PASS |
| national | 3/8 | 3/8 | >= 1/8 | PASS |
| table / wins / wave5 | 1 / 0 / 5 | 1 / 0 / 5 | not regressed | PASS |
| death modes | {scholar:combat, villager:monster, ...} | identical families | no new | PASS |

Per-seed (armed): s11 145d/3v/5s, s33 111d/7v/8s, s44 180d/1v/6s, s66 75d/0v/0s,
s77 75d/1v/6s (s22/s55/s88 no unlock). Layer fired: srBeats 63, srGrounded 0,
srHoldTravels 0.

**VERDICT: KILLED AT PILOT — NO-GO per §14.** PRIMARY missed with ZERO
movement (2.40 → 2.40, byte-identical on every aggregate). The layer engaged
(63 muster beats across 5 unlockers) but the deaths did not move.

### Sense (transcript read, SENSE-TESTING LAW)
`SEED=33 DAYS=120` armed → evidence/2026-10-15/siegeroster-transcript-s33.txt.
- The muster beats FIRE and READ WELL: "📯 MUSTER — The Reunion hunts near
  Haven, and it is beyond us. Everyone inside. No one walks the treeline
  alone — the garden crews double up, the hunters stand down. We outlast it."
  The beat is player-visible (fixes #245's silent-muster blank at the
  narration level). All-clears fire when threats move off.
- But the village does not ACT on the beat — villagers keep dying (7 postV
  on s33 armed, same as control). The beat is a narration without a
  mechanism. The discipline reads as the village ANNOUNCING defense, not
  DEFENDING.

## Metric review (§14)

PRIMARY missed (2.40 vs <=1.68) with zero movement — not a near-miss, a
structural inertness. No metric was moved; the arm stands killed.

1. **The holdHaven theory was wrong.** The wild router skips the player's
   tile, but the scholar was already "at Haven" (dist ≤1) when threats were
   up (srHoldTravels 0 — never needed to travel). Either the wild deaths
   are not on the Haven tile (villagers on wild duties), or dist-1 presence
   doesn't block the router (it needs exact tile match). The diagnostic's
   wild channel was never localized to the tile — the arm was built on an
   untested assumption.
2. **goToGround was inert by construction.** The base policy never assigns
   hunt/patrol/scout (it assigns water/wood/cook). The shelterRule blank
   from siegedef2r (sdShelters 0) was not revisited — the arm repeated it.
3. **The beat is the keep.** The muster beat design (threat-named, episode-
   deduped, stand-down) works and reads well. Future defense arms should
   reuse the beat with a mechanism that actually moves villagers or kills
   the threat. The beat without a mechanism is theater.
4. **Design question (steve-call):** The policy has no verb to move villagers
   off a threatened tile, and no safe way to kill a wave-4/5 monster at
   Haven. Villagers die in 1-2 rounds on learn-first before any withdrawal.
   Roster protection against the apex may need a game-side verb (shelter/
   evacuate) or a design ruling that the apex doesn't camp Haven.

## Village assessment

The village post-unlock is a roster being ground down by wave-4/5 monsters
it cannot fight (12 villager combat deaths vs 25 scholar deaths across 5
unlockers — the scholar dies 2x the roster rate, but the roster deaths are
the ones the policy was asked to move). The raid drafts defenders who die
in 1-2 rounds; the wild jumps villagers when the scholar is away. The
village does not have a defense — it has a muster beat that announces a
defense. The wall is not a policy-tuning problem; it's a missing verb.

## Blanks filled / documented

- FILLED: The muster-beat narration blank (#245) — the beat design works,
  fires correctly, reads as a real muster. The BEAT is proven; the MECHANISM
  is not.
- DOCUMENTED: Roster protection against wave-4/5 needs a game-side verb or
  design ruling (steve-call) — appended to sim-findings.
- DOCUMENTED: The wild channel was never tile-localized — future arms must
  measure WHERE villagers die before building the defense.

## Wall numbers

national 3/8 · table 1/8 · wins 0/8 · wave-5 unlocks 5/8 · median 86d.
(Both sides identical — the arm moved nothing.)
