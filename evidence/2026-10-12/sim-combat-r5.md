# Long-run sim — lever 1 r5: competent policy plays monster counters (2026-10-12)

## Lever played
**The competent policy now PLAYS monster counters tactically.** Blank from
sim-combat-r2: "counters discovered 91–103; policy still doesn't play them
tactically." The policy fled hopeless fights but never performed a counter
trick. Now it does — knowledge-gated, one attempt per monster per fight.

**`scripts/policies/competent.js`** — new `beastTrickPlay()` (called from
`fight()` after the flee assessment, before strike-the-weakest), plus helpers
`beastMidOf/beastCounterOf/beastTrickKnown/beastHintKnown/beastFreeTiles/
beastDodgeTile/beastStrikeTarget`. Exact behavior:

- **Knowledge gate** (Steve: "If you don't know, it doesn't show"): a trick
  is attempted only for a monster type the village has learned — fully
  discovered (`state.monsterCounters`, via trick or beasttricks teaching) OR
  hint-revealed in the Monster Codex (slaying a type surfaces `counter.hint`
  at codex stage 'slain' — the player read the carcass entry). Blind types get
  no tricks. Fully-known tricks are still played for their MECHANICAL benefit
  (the shout scatters, the sidestep dodges) — a competent player uses a known
  trick, not just discovers it.
- **Kind → tb\* action** (mirrors `checkMonsterCounter`'s observation contract):
  - `shout` → `Game.tbPlayerShout()` (hummice, belltoad)
  - `offer_food` → `Game.tbPlayerOfferFood()` (lockpick_raccoon; needs food in pack)
  - `wait` → `Game.tbPlayerWait()` (heckler, moderator; auto-advances, never endTurn after)
  - `move_windup` → move during the telegraph (gallowdeer, glasswing, memory_projector, paparazzo, statickite); waits for the windup, fights normally meanwhile
  - `move_x2` → dodge on two consecutive rounds (nightcourt, landlord plain; review_drone honors `counter.vary` — never the same net direction; warranty_caller honors `counter.tiles: 2` — path must cover 2 tiles); sequence resets if rounds aren't consecutive
  - `sidestep` → step off the telegraph lane (bulldozer, white_noise_heron, mirror_stag, nevermore); only when actually IN the lane
  - `keep_distance` → end the turn at EXACTLY `counter.tiles` (default 3) — not farther
  - `strike_lead` → strike the first-spawned of the type (hushwolf; counterIsLead logic)
  - `strike_windup` → strike while it telegraphs (mirrormoth, sunbasker)
  - `strike_recovery` → strike while `_counterDischarged` and no new telegraph (giant_mosquito)
  - `strike_first` → the fight's first strike targets it (union_rep; skips if `urWalkout`)
  - `strike_nonhead` → strike a `segmentIndex > 0` segment (ducks_in_a_row)
  - `fresh_weapon` → switch to an unseen weapon mid-fight (understudy; requires `usSeen` non-empty; picks a weapon the understudy hasn't seen; handles the melee/ranged slot split — `equippedWeapon()` reads melee first, so a ranged switch unequips melee first; verifies the strike weapon actually changed)
- **One attempt per monster per fight**; setup-dependent tricks wait for their
  setup while the policy fights normally in between. After the trick fires or
  proves unavailable, normal fighting resumes. Never overrides flee.
- Movement stays on interior tiles (1..7) — grid edges are the flee-by-barrier.

**`src/js/game.js`** (+7/−1): beasttricks `none`-case dialogue honesty fix. The
old line — "Nobody's figured out anything clever yet" — fired even when the
village knew every trick for every slain type (there was just nothing NEW to
teach). Now it says so: "We've told you every trick we've figured out. The
rest — we kill them or they kill us, and nobody's cracked those yet."

## Design note: keep_distance vs DISENGAGE (engine tension, documented not fixed)
`tbAfterPlayerAction` runs `tbEndCheck()` BEFORE the `round_end` counter
observation. The DISENGAGE rule ends fights vs non-chasers (`follows: false`)
beyond `max(2, reach)`. Consequence:
- speedbump_turtle / nightlight_catfish / alien_tick (need 2): backing off to
  exactly 2 holds the fight and the trick registers. ✓
- voice_mimic_radio (need 3, `follows: true`): chasers hold the fight. ✓
- **bright_idea (need 3, `follows: false`, reach 2): backing off to 3 ends the
  fight via disengage BEFORE the observation fires.** The trick is still the
  right survival play (you walk clear of something that can't chase), but it
  cannot discover via `round_end` while disengage fires first. The policy backs
  off to exactly 3 (honest play); the ledger discovery for bright_idea must come
  via the taught channel or a telegraph-committed turn. Flagging for a future
  engine pass — this is round 5, not a rebuild.

## Before / after (identical seeds 1–16, 200 days, competent policy)

| metric | before | after | delta |
|---|---|---|---|
| median survival | 56d | 68d | **+12d** |
| max survival | 151d | 157d | +6d |
| mean per-seed delta | — | +6.4d | (seeds 14: +51, 15: +33) |
| win rate / table | 0 / 0 | 0 / 0 | upstream still binds |
| wave reach (runs w1/w2/w3) | 16 / 11 / 5 | 16 / 12 / 5 | w2 +1 |
| max wave unlocked (runs) | w1:2, w2:9, w3:5 | w2:9, w3:7 | **w3 +2** |
| player deaths | 64 | 69 | +5 (more fights taken) |
| player combat share | 46.9% | 47.8% | flat |
| player starvation share | 51.6% | 49.3% | −2.3pp |
| villager deaths | 78 | 74 | −4 |
| villager combat share | 83.3% | 70.3% | **−13pp** |
| counters discovered | 128 | 144 | **+16** |
| counter-kill proxy | 60 | 72 | **+12** |
| wave-1 fights / loss | 81 / 35% | 79 / 32% | −3pp |
| wave-2 fights / loss | 35 / 20% | 44 / 25% | +5pp (more fights) |
| wave-3 fights / loss | 18 / 67% | 12 / 58% | −9pp |
| national reach | 0/16 | 0/16 | upstream still binds |

**Reading the lever:** the policy now discovers counters via tricks in the
field (not just via haven teaching) — discoveries +16, counter-kills +12.
Counter-kills score 2 ledger points, and wave-3 unlocks rose 5→7 runs: the
ledger accelerator the design intends is now actually firing. Median survival
+12d. Villager combat deaths dropped sharply (65→52 absolute) — the player
clears threats more efficiently, and the village lives longer (starvation/
disease deaths tick up as villagers survive to die of other things). The
wave-2 loss RATE rose (20%→25%) because the policy takes MORE wave-2 fights
(35→44) — it survives to reach them — winning more (17→23) and losing more
(7→11) in absolute terms. The trick turns have an opportunity cost in hard
fights; net is still positive.

## Reachability verdict (combat content)
- **Waves 1–3:** reachable (16/16, 12/16, 5/16 runs; wave-3 UNLOCKS 5→7).
  Waves 4–5: 0/16 — still lever 2's bar.
- **Counters:** all 30 wave 1–2 types carry counter data; the policy now plays
  all 13 kinds (proof test 36/36); discoveries 128→144 in long sims.
- **Win flag / table:** 0/32. Upstream still binds.

## Village assessment (plain words)
The village fights smarter now — or rather, the scholar does, and it shows.
Before, the competent scholar knew the tricks (the village had figured out
9+ counters by day 42 on seed 7) but never USED them in the moment — the
knowledge sat in the codex while the scholar swung blindly. Now the scholar
bellows at hummice choirs, steps off bulldozer lanes, backs away from turtles,
waits out hecklers, and switches weapons on the understudy. The ledger feels
it: counter-kills are up, wave-3 unlocks rose 5→7, median survival +12 days.

Who thrived: seeds 14 (+51d) and 15 (+33d) — runs where the scholar lived
long enough for counter knowledge to compound. Who died: scholars still die,
mostly to combat and starvation at the same shares — the tricks don't save a
doomed run, they stretch a viable one. Villagers died less to combat (65→52):
when the scholar clears beasts efficiently, fewer of them reach the village.

What's missing: the tricks fire rarely (~10–13 per 200-day run) because
knowledge is the bottleneck — the policy can only play tricks it has learned,
and learning requires slays. The taught channel (ask at haven) and the trick
channel (do it in the field) are substitutes; the field channel's edge is
timing (discover mid-expedition, score 2pts on the next kill). Waves 4–5 and
the table remain unreachable — that's lever 2 and lever 10's territory, not
this one's.

## Sense-testing (transcripts read)
**Beasttricks teaching is coherent.** Emma (seed 7): 'leans in, voice low.
"Here's what we figured out about Flashbulb Moth. Hit it while it folds. The
Wing Flash only fires FORWARD — it must face you..."' — specific, in-character,
uses the village name. The `none`-case line was dishonest when tricks were
known (fixed — see above).

**The village learns fast:** seed 7 day-42: 9 types slain, all 9 counters
already discovered (2 via taught, rest via trick performance). The teaching
channel and the trick channel are substitutes — the policy's upkeep asks about
beasttricks at haven, so counters get learned one way or another.

## Proofs & tooling
- `scripts/test-counterplay-20261012.js`: 36/36 green ×2 runs (SEED default).
  Red-checked: 24/35 failed before the policy change (trick cases), then
  iterated to green. Covers all 13 counter kinds (trick performed + discovered),
  the knowledge gate (no hint → no trick), known-trick mechanical use (shout
  once, not looped), and flee regression (tricks never override walk-away).
- `scripts/sense-beasttricks-20261012.js`: transcript sampler (SEED, DAYS env).

## Files changed
- `scripts/policies/competent.js` (+~330): `beastTrickPlay` + helpers, hook in `fight()`
- `src/js/game.js` (+7/−1): beasttricks none-case honesty
- `scripts/test-counterplay-20261012.js` (new): 36-check proof
- `scripts/sense-beasttricks-20261012.js` (new): transcript sampler

## Blanks filled / documented
- **Filled:** policy plays monster counters tactically (the r2 blank).
- **Filled:** beasttricks none-case dialogue honesty.
- **Documented:** bright_idea keep_distance vs disengage engine tension (see above).
- **Documented:** the taught channel and trick channel are substitutes — total
  discovery is bounded by slain types, so the lever shifts channels more than
  it raises totals. The tactical (mechanical) benefits are the real lever.
