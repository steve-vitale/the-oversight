# Break-it: DISEASE system — round 14 (2026-10-11)

Target: disease system (index 11). Canon: docs/DISEASES.md (two pools, never mix).
Proof: `scripts/test-disease-break-r14-20261011.js` — **63/63 green × 3 seeds (7, 999, 4242)**.
Full harness (index.html order, minus DOM-only app.js/sprites.js/tile-scenes.js/move-anim.js/drama.js), seeded before eval.

## Verdict: HELD — with one real copy catch fixed

The two-pools law, the vector rates, the cure tiers, and every alien ability promise
survived hostile probing. One genuine catch: the `{name}'s` possessive rendered as
**"You's"** for the player across 7 disease texts ("You's neck", "You's jaw",
"You's hands", "You's muscles", "You's back", "You's senses"), plus "You are been
beaten" and "Youself". Fixed at the engine level + 5 data rewordings. Proof H12
guards the whole class.

## Attacks

### 1. EXPLOIT — pool-mix, permanence, cure tiers, save/load
- **E1**: `contractDisease` refuses all 9 alien ids. Held.
- **E2**: `cureStatus` / `diagnoseDisease` / `easeDisease` refuse all 9 alien ids
  (prior rounds fixed eurika-only; this round verified the full roster). Held.
- **E3**: eurika/east_nile/lemons never expire — 500 dayPart ticks, still present;
  meat-quirks expire on schedule (howlbelly 12 parts). Held — permanent warping is real.
- **E4**: cure-table audit — no folk remedy cures anything outright; trembles is `no`
  at every tier, survives Fever's End synergy + L3 herbal_remedy + diagnosed
  antiparasitic; antiparasitic DOES cure diagnosed trichinosis (canon: specific ruin
  medicine); trembles kills at exactly 40 day-parts (certain, narrated, mantle passes).
  The Fever's End upgrade branch only touches `ease`/`support` → `cure`, never `no`. Held.
- **E5**: real save→load round trip — no duplicated entries, mirror counts match,
  `_seq` reseed keeps seqs unique across the load boundary, post-load cure drops
  exactly the right mirror. Held (alien defs carry no legacy bridge — mirrors equal
  the mundane entries only, asserted).

### 2. SOFTLOCK
- **S1**: `tick_attached` never expires on its own — but blind removal is always
  offered and always resolves (never stuck). Documented condition, not a softlock.
- **S2**: lockjaw (folk `none`) expires untreated on its own clock — no
  permanent-debuff-without-exit exists. Trembles = death (canon), not softlock.
- **S3**: zero-medicine player — folk rest still moves folk-`slow` diseases; folk rest
  is honest about lockjaw ("rest alone won't move it"). No dead ends.

### 3. HONESTY (copy vs engine)
- **H1**: shellgut triple-risk meal (p=1 poison + fever + trichinosis): control
  contracts all three; shellgut blocks all three; -25% kcal exact (75 vs 100). Honest.
- **H2**: witness_maw "night half as dark" — lightLevel math exact: l → 1−(1−l)/2
  (0.15 → 0.575); daylight untouched. Honest.
- **H3**: lemons engorge +20% kcal on a real meal (120 vs 100). Honest.
- **H4**: howlbelly 50% fear-check — small monsters (hp<50) pass ~50%, big never.
  Note: hushwolf (hp 50–65) does NOT qualify as "small" — the bar is hpMax<50. Honest.
- **H5**: croakbelly→belltoad and flockmind→ducks_in_a_row pass-through deterministic
  ("won't start anything"). Honest.
- **H6**: giant mosquito 50/50 virus split (400 bites, ratio in [0.4,0.6]); a Bearer <redacted>
  one can still catch the other on a later bite. Honest.
- **H7**: trembles 15%/meal via eatCannibal (200 meals, rate in [0.08,0.25]); cooking
  irrelevant (no cooking check in the roll). Honest.
- **H8**: ambient tick escalation 3%→15% capped, never guaranteed (statistical,
  day-1 vs day-5). Honest. (Test-harness note: full setup() per trial decimates the
  seeded LCG — per-trial light resets used instead.)
- **H9**: blind tick removal botches 40% → wound_fever, tick never stuck. Honest.
- **H10**: trichinosis — smoked meat still carries it, undercooked counts as uncooked,
  only `cooked` clears. Honest.
- **H11**: source/data checks — mosquito 1.5% (`mr < 0.015`), escalation formula,
  gristlefit exactly ×1.25, blood-sense +2 vs bleeding, eurika 2 sites / east_nile 1,
  tick latch 50%, cooking.json days ×4 == durations, JSON roster == canon 6+9. Honest.
- **H12 (NEW — the catch)**: `{name}'s` → "You's" for the player. **BROKE, FIXED.**
  - Engine: `seFill` now maps `{name}'s` → "your" for the player (ASCII + curly
    apostrophe variants), before the plain `{name}` replacement. Fixes the whole
    class everywhere, including future texts.
  - Data (things seFill can't fix): trichinosis "like {name} {verb} been beaten" →
    "like they've been beaten"; trichinosis "{name}self" → "moving freely again";
    eurika "how {name} hears" → "how you hear"; eurika/east_nile "part of {name}" →
    "part of you"; lockjaw "opening {name} mouth" → "the jaw opens…".
  - Sibling sweep: the only other `{name}'s` sites (justiceVoice, truth.js) use
    villager names, never 'You' — not affected.
  - Sense-read transcript (catching East Nile): bite narration, tick damage lines,
    affliction chip with transformation, examine honesty, and the cure-refusal line
    ("Earthly medicine doesn't touch alien biology — the East Nile stays.") all read
    sensibly.

### 4. DEAD CODE
- statusEffects.js loaded in index.html ✓; ontology 63/63 ✓.
- `seIsDisease` admits mundane only (all 15 ids + bleed control) ✓.
- `tbMosquitoTurn`/`tbTickTurn` defined AND dispatched via mosquitoIs/tickIs ✓.
- giant_mosquito + alien_tick in monsters.json (wave 2), monsterBehaviors.json,
  sprites.js, and castable via castMonster's wave filter ✓.
- Afflictions panel renders alien rows (name, description, transformation,
  permanent-vs-passing note, NO treatment buttons) ✓ — the prior round's D1 fix held.

## Files changed
- `src/js/statusEffects.js` — seFill possessive handling (+5 lines, comment).
- `src/data/statusEffects.json` — 5 copy fixes (surgical, rest byte-identical).
- `scripts/test-disease-break-r14-20261011.js` — 63-assertion proof (new).
- `evidence/2026-10-11/break-diseases.md` — this file.

## Notes for the coordinator
- Pre-existing failure (not mine, fails on HEAD too): `scripts/test-disease-break2-20261010.js`
  "control: suspect food still bites without shellgut (-5)".
- No push/bump — merged locally, pending ship.
- Needs-eyes: copy-only change, no feel impact. No [needs-eyes] flag.
