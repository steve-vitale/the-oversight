# Journey: crisis leg (6) r20 — the muster that never fires (2026-10-17)

## Pre-registration (MEASUREMENT.md §§9–12, 14)

- **Leg:** 6 — crisis, r20. Fresh angle: **THE MUSTER THAT NEVER FIRES.**
  r18 covered the healer arc (disease tending), r19 the siege roster (raid
  fights, aid channel, wound tending). NEVER journey-tested: the shelter
  verb (src/js/shelter.js, landed 2026-10-16 as substrate for the killed
  sim-siegeroster arm) had **no game-side surface** — no auto-muster beat,
  no UI button, no NPC initiative. Audit finding (this run): the ONLY caller
  was scripts/policies/shelter.js, a bot policy gated on SHELTER=1 (default
  OFF). In the game Steve plays, a wave-4+ monster near Haven triggered
  NOTHING — the village never mustered, villagers stayed exposed. The
  sim-siegeroster kill ("narration without a mechanism") had become its
  mirror: **a mechanism without a voice**.
- **Leg question:** When the horde is at the door, does the village muster
  like people — scouts report, everyone inside, the hall door barred — or
  does the shelter verb sit dead while villagers die at the treeline?
- **Interesting finding criteria:**
  - (a) the game-side muster beat fires in the progDaily path (no SHELTER
    policy) when a wave-4+ monster is within 2 tiles of Haven — scout
    report, knowledge-gated noun, never the true name;
  - (b) every non-scholar roster member sheltered (node=Haven, inside,
    flag); protection mechanical (zero wild jumps on sheltered villagers;
    raid draft excludes; duties skipped but assignments kept);
  - (c) threat gone → single all-clear beat, village released; the muster
    surfaces in live conversations (the 'muster' lately kind + on-ramp);
  - (d) the Haven panel shows muster state + manual stand-down / re-muster
    while a threat is near.
- **Seeds:** proof 7, 42, 99 (crisis-proof convention); pilot playthroughs
  2100, 2101, 2102 (fresh, off the coordinator's banned list).
- **Primary metrics (binding, §14):**
  - M1: ≥2/3 proof seeds — game-side muster fires on staged wave-4-at-Haven
    in the progDaily path with SHELTER unset; every non-scholar roster
    member sheltered; the beat names the monsterNoun, not the true name.
  - M2: ≥2/3 proof seeds — 80 real villagerMonsterTicks with the wave-4 at
    Haven: zero jumps on sheltered villagers while the unsheltered control
    is jumped (channel live).
  - M3: ≥2/3 pilot seeds — the muster episode fires in a real playthrough;
    mid-siege convos carry the muster/threat (SENSE-read); the all-clear
    releases everyone exactly once.
- **Kill rule:** game-side wiring regresses test-shelter-verb (35/35) or
  double-fires with SHELTER=1 → document as NO-GO, hand the design question
  to Steve.
- **Horizon:** proof: staged, same-day. Pilot: d60; staged wave-4 threat
  near Haven for a 7-day window starting d~17 (establish 15d), then removed;
  death-aware stop (pop≤2 → +10d tail max).
- **Method:** scripts/test-crisis-muster-game-20261017.js (RED→GREEN proof);
  scripts/diag-crisis-muster-20261017.js (pilot: oracleV2 establish →
  competent; staged threat pinned once adjacent then wandering naturally;
  census, per-dawn shelter counts, wild-jump spy, fallen causes, mid-siege
  + end convos with full transcripts, SENSE-read).

## Metric review (§14)

- **M1: HIT (3/3).** Game.shelterMusterCheck() fires in the progDaily path
  (SHELTER unset) on staged wave-4-at-Haven; all non-scholar roster
  sheltered (node=Haven, inside, flag); scholar never sheltered; the beat
  names the knowledge-gated noun ("scouts report The Congregation" post-
  System-arrival; "something"/descriptor pre-naming) — never the raw true
  name on a fresh codex. Episode flag set; 'mustered' memories booked.
- **M2: HIT (3/3).** 80 real villagerMonsterTicks per seed: zero jumps on
  sheltered villagers; the unsheltered control was jumped (channel live).
  Sheltered villagers keep (not lose) duty assignments while skipping them.
- **M3: PARTIAL.** The muster episode fires in real playthroughs (3/3 pilot
  seeds: 2100 d17→d24, 2101 d17→d24, 2102 d17→d21); the all-clear releases
  everyone exactly once; 7-8 'mustered' memories booked per seed; zero
  sheltered jumps. BUT the "mid-siege convos carry the muster/threat" clause
  is priority-dependent: in all 3 seeds, fresh grief (villagers died the
  muster day) outranked the muster in t2LatelyEvent, so convos led with
  mourning. The muster IS in the lately system (proven: t2LatelyEvent
  returns 'threat' kind days 0-3, 'muster' kind days 4-7) and the on-ramp
  exists (EV_LABELS). The threat kind's lines carry the muster story
  ("mustered inside — The Congregation hunts the treeline"). Grief
  outranking the collective is human, not a bug — but it means the muster
  is often not the LEAD topic. Design question for Steve: should an ACTIVE
  muster (v.shelterMustered) boost threat/muster priority over mourning?
- **Kill rule:** not triggered — test-shelter-verb still 35/35 (the
  SHELTER=1 policy delegates to the game episode, no double beats);
  test-crisis-care-lately + test-crisis-woundcare-lately ALL GREEN;
  validate-ontology green; check.js --only crisis 11/11; check.js --quick
  96/1 (the 1 failure is test-sprites-valid-20261014.js, 216 sprite asserts
  — the documented pre-existing asset-lane breakage from r19, untouched by
  this change).
- **On-ramp completion:** while verifying M3, found that 6 more lately
  kinds (defense, outbreak, show, realm, gratitude, cheer) had dialogue
  handlers but no EV_LABELS entry — they win the priority chain, block
  lower kinds (including muster/threat), and offer NO choice. Same blank
  class as 'care'/'muster'. Added all 6 labels (convo-scene.js). The
  'show' choice was picked in the 2102 re-run, proving the on-ramp works.
- **Found but not fixed:** in 2102, Declan's t2LatelyEvent returned
  'mourning' but his convo offered no event choice (Deiker got the mourning
  choice in the same run). Pre-existing scene-gating quirk, not muster
  logic. Noted for a future run.

## The blank: the shelter verb had no game-side surface (FIXED)

**Finding:** src/js/shelter.js (2026-10-16) built an engine-honest verb —
shelterVillagers moves villagers to Haven, inside, behind the flag; the
wild router, raid draft, and duty loops all exclude sheltered villagers —
but nothing in the game called it. The muster beat lived only in a
bot-only policy (SHELTER=1, default OFF). check-wired.js reported "0
unwired" only because the ontology header's provides-list names each
function (the tool counts same-file comment mentions as references — a
false negative worth knowing). In real play: wave-4+ near Haven → nothing.

**Fix** (design calls mine — Steve overrules):
- `src/js/shelter.js`: `Game.shelterMusterCheck()` — the game-side episode
  manager, fired daily from progDaily AHEAD of the havenGrowth raid tick
  (the muster precedes the draft). Threat (wave-4+, ≤2 tiles) + not
  mustered → scout-report beat (monsterNoun, never the true name) +
  shelterEveryoneBut([]) + `v.shelterMustered` flag + 'mustered' memories
  for the lately system. Threat gone → `shelterAllClear()` once + flag
  cleared. AUTO-muster, not a player button: wave-4+ vs villagers is a
  1–2-round death (siegeroster diagnosis) — people don't wait for orders
  to get inside. The player's calls remain: sortie vs endure (lingerer
  answers exist) and early stand-down.
- HYSTERESIS: muster at radius 2, stand down only past radius 3
  (`shelterThreatNearHaven(radius)`). Seed-2100 probe: the congregation
  paced at dist 3 → hair-trigger all-clear → a normal pantry raid fired
  the same dawn → Omolara (freshly released) drafted and killed. We don't
  unbar the door while it's still pacing out there.
- `Game.shelterStandDown()` — manual release; stamps THIS threat's monster
  `shelterStoodDown` so dawn doesn't re-muster behind the player's back; a
  new threat still musters. `Game.shelterMuster()` — manual re-muster
  (clears stamps). The scholar is never auto-sheltered (existing rule).
- `src/js/app.js`: Haven panel shows the muster state while mustered
  ("🚪 Mustered: N inside, the hall door barred — {threat} hunts the
  treeline") + 📯 Stand down button; a stood-down threat offers the
  re-muster button instead of re-firing. data-beat handler wired.
- `src/js/convoTopics.js`: 'mustered' memories → the 'muster' lately kind
  (7-day window; below care, above gratitude — the shared story once the
  door unbars). Active vs past variants ("Nobody walks the treeline while
  {threat} is out there. Inside, door barred, we wait it out." /
  "When {threat} came hunting near Haven, we got everyone inside and barred
  the hall door. Nobody walked the treeline that night.").
- `src/js/convo-scene.js`: the on-ramp — EV_LABELS entries for 'muster'
  ("About the muster — everyone inside, the door barred. How are you
  holding up?") and 'care' (completing r18/r19's intended on-ramp — the
  'care' lately kind had no EV_LABELS entry either, so tending the sick was
  still unaskable in live convos; same one-line pattern, explicitly noted).
  Without the entry the `alive:event:<kind>` choice is never offered.
- `scripts/policies/shelter.js`: delegates musterCheck to the game episode
  (no double beats, no double musters); SHELTER=1 keeps working for bot arms.

**Proof:** scripts/test-crisis-muster-game-20261017.js — RED (pre-fix:
Game.shelterMusterCheck undefined; verified via patch-file round-trip,
~/workspace/muster-r20-fix.patch) → GREEN 35/35 on seeds 7/42/99
(muster fires; knowledge-gated naming; everyone sheltered; scholar skipped;
evacuated+inside; flag+memories; idempotent; 80-tick protection with live
control; duty skip-not-strip; single all-clear + release; no re-muster
after stand-down; new threat re-musters; policy delegation with exactly one
beat; the progDaily path).

## Run log

- 2100: muster d17 (The Congregation staged), 7 sheltered, all-clear d24
  (threat wandered past radius 3). 0 sheltered jumps. 7 fallen (Klaus d7
  monster, Anna d10 starvation, Hannah d11 monster, Angela d14 combat,
  Peiyu d18 combat, Mia d23 monster, Omolara d58 combat). Mid convos (Lily,
  Omolara) led with mourning (Angela).
- 2101: muster d17, 5 sheltered (small village), all-clear d24. 0 sheltered
  jumps. Mid convos (Kelsey, Chen) — no event choice (scene-gating).
- 2102: muster d17, 8 sheltered, all-clear d21 (threat left naturally).
  DeShawn + Brian died d17 to the monster BEFORE the muster (the muster
  isn't instantaneous — honest). 0 sheltered jumps. Mid convos: Declan
  (mourning, no choice offered — the found quirk), Deiker (mourning
  choice offered and picked). End convo picked the 'show' event choice
  (on-ramp completion verified live).
- Re-ran 2102 on final code (with 6-label on-ramp completion): identical
  muster behavior, 'show' choice now offered and picked.

## People check (SENSE-TESTING LAW)

- The muster beat reads well: "📯 MUSTER — scouts report The Congregation
  hunting near Haven, and it is beyond us. Everyone inside. No one walks
  the treeline alone — the garden crews double up, the hunters stand down.
  We outlast it."
- The threat lines (days 0-3): "Something's wrong out there. Have you felt
  it?" → "That thing — mustered inside — The Congregation hunts the
  treeline..." (the note carries the muster).
- The muster lines (days 4-7, when top): "When The Congregation came
  hunting near Haven, we got everyone inside and barred the hall door.
  Nobody walked the treeline that night."
- Grief leading during the muster is human: Deiker mourning DeShawn/Brian
  (died the muster day to the threat) IS the muster story through the
  grief lens. The village reacts as people, not as a bulletin board.
- The stand-down beat: "You give the word — the hall door unbars and the
  village files back out, eyes on the treeline. The Congregation still
  hunts out there; the muster waits on your word now." (Player's call,
  their risk — legible.)

## Census (plain words)

- 2100: 12 landed, 7 fell. The muster saved the 7 sheltered (0 jumps).
  Klaus/Hannah/Mia took monster deaths in the wild (pre-muster or
  unsheltered). Anna starved (food, not monsters). The village endured.
- 2101: 5 villagers, all sheltered, all survived the muster. Small but
  unbroken.
- 2102: 12 landed, 6 fell. DeShawn/Brian died to the Congregation on d17
  before the muster fired (dawn muster, daytime deaths — the muster can't
  be everywhere). The 8 sheltered survived. Eduardo/Declan fell d21 to
  combat (post-all-clear, normal channels).

## Verdicts

- **Reachable:** YES. The muster fires automatically from the game loop —
  no policy flag, no player action required. The Haven panel shows it and
  offers stand-down/re-muster. The conversation on-ramp exists for muster,
  threat, care, defense, outbreak, show, realm, gratitude, cheer.
- **Fun:** YES, with a caveat. The muster beat lands; the village visibly
  reacts (everyone inside, door barred); the all-clear releases. The
  caveat: grief often outranks the muster conversationally, so the player
  may not hear the village "talk about" the muster as much as the beat
  promises. Design question for Steve (noted above).
- **Winnable:** YES. The muster is pure upside for survival (0 sheltered
  jumps across 3 seeds). The cost is lost production (duties skipped) and
  the existing havenGrowth gorge mechanic — legible tradeoffs.
- **Convergence:** blank fixed + proven at the mechanism level + pilot-
  verified in real playthroughs. M3 partial on the conversational-lead
  clause (priority-dependent, documented).

## Telemetry

(Pending — seed hidden_files/telemetry-baselines/crisis-muster.json.)

## Files

- Fix: `src/js/shelter.js` (game-side episode + hysteresis + manual verbs),
  `src/js/convoTopics.js` ('muster' lately kind), `src/js/convo-scene.js`
  (EV_LABELS on-ramps: muster + care + defense/outbreak/show/realm/
  gratitude/cheer), `src/js/app.js` (Haven-panel muster row + stand-down/
  re-muster buttons), `scripts/policies/shelter.js` (delegates to the game),
  `docs/ONTOLOGY.md` (regenerated)
- Proof: `scripts/test-crisis-muster-game-20261017.js` (RED→GREEN, 35/35 ×
  seeds 7/42/99)
- Diag: `scripts/diag-crisis-muster-20261017.js` (pilot playthroughs)
- Evidence: `evidence/2026-10-17/journey-crisis-r20.md`,
  `evidence/2026-10-17/journey-crisis-r20-{2100,2101,2102}.{json,log}`
- Patch record: `~/workspace/muster-r20-fix.patch` (RED-verification round-trip)
