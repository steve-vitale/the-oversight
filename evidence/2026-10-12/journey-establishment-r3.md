# Journey leg: ESTABLISHMENT (days 14–40) R3 — 2026-10-12 (22:00 run)

Rotation idx 1 → played leg 1 (third establishment pass; r2 was 2026-10-11
17:30). Re-baselined on the current tree (7ca9cc33): since r2, the multi-move
engine (wave-1 kits), wave-2 kits, combat-matrix fixes, agency r4 teaching,
and the spoken-lure fix all landed. Canon read: CANON.md, CONTESTS.md,
PRESERVATION.md, MONSTER-WAVES.md (+ r2's evidence note).

## What was played
- `scripts/test-journey-establishment-r3-20261012.js` — r2 harness refreshed
  to the FULL current 75-module list (was 21: missing voice-piper,
  voice-system, galactic-cast, spawn-knack, table/*, pods, titans, godhood,
  relay-*, sigW3a/b/c). Seeded RNG before eval, window-stub discipline,
  competent policy, DEATHLOG env flag (prints scholar/tbfight/telemetry at
  Game.over). Seeds 20261011 / 777 / 424242 × 40 days. 16 transcripts.
- `scripts/test-est-deferred-favor-20261012.js` — proof test for the blank
  (below): RED 6 fails on pristine HEAD → GREEN 12/12 fixed.

## Village assessment (plain words)

**Seed 20261011 — the starving village, scattered day 27.** Pantry 38.8k → 0
by day 26; one starvation death (d23), an ambush murder (Sofia, d21 — the
moot menu names the real case), monster kills, a wound that wouldn't close.
The scholar lived (0 kcal, not dead) — the village dissolved around them:
the famine scattering beat, narrated, same designed failure mode as r2.
8 contests/shows fired (tiny_door, pattern ×2, calorie_run ×3, ends won and
lost). Wave stayed 1.

**Seed 777 — the scattered village, day 14.** Pantry 37.2k → 0 by day 13;
two combat deaths (d9), one starvation (d13, pantry at 0). Scholar alive at
1251 kcal. Game.over = the scattering, not a death — DEATHLOG confirms
`dead=false`. One contest fired (tidepool, day 14) as the village walked.

**Seed 424242 — the surviving village.** 12 → 6 alive at day 41. Wave 2
unlocked (ledger points from villager + player kills: hummice, mirrormoth,
hushwolf, nightlight_catfish, paparazzo, nevermore — villagers fight their
own fights). Pantry 41.3k → 4.6k, preserved 0 (smoke technique staffed but
the village ate the buffer). 6 contests/shows (confession, lies ×2) +
**prize_knowledge_dump (d23)** and **prize_ability_offer (d40)** — the prize
lanes r2 flagged as rare ARE firing in-leg now. Survivors: Jimena (bush
pilot, trust 1, scared), Lena (ER nurse, 41, lonely), Marcus (electrician,
74, lonely), James (carpenter, 39, steady), Emma (vet, 29, lonely), David
(plumber, 16, lonely). Everyone knows 16–18 plants; agency XP differentiates
(tracking 0–2 per villager — the r2 tooling fix holds).

## People check (SENSE-TESTING — full transcripts read)

- **Spoken-lure fix VERIFIED on this leg** (424242-day35, Lena): the pending
  betrayal invite is spoken as a second opener beat
  ("About their injury — still need hands. Are you in?" "Walk with me? I
  want another pair of eyes on something.") with matching accept/decline
  menu choices. The r4 landing fix holds on fresh seeds.
- **Favor follow-ups carry real continuity** (424242-day30, Jimena):
  "About the help I asked you for — I asked Hattie about the pantry run —
  Hattie's gone. Still need hands. Are you in?" Hattie was the predecessor
  (mantle passed); the favor system tracks the ask across succession.
  Commit → "Good. East treeline, first light. Bring a pack." — concrete.
- **Honest deflects** (424242-day40, Lena): the festering-wound ask declined
  → "Forget I asked. They won't forget. They'll just stop asking." + a
  memory:deflected choice surfaces later. Consequences persist.
- **Inherited-thread openers name real predecessors** ("Casey and I never
  did finish talking about that question — that was 13 days back. You're not
  Casey."). Casey/Hattie are the dead bearers (mantleOf), ledger-backed —
  NOT fabricated. But see the blank: the opener's invitation went
  unanswered by the want machinery.
- **Curiosity wants land** (20261011-day15, Tamika the mortician): "what's
  the funniest thing you've seen since we got here? I desperately need it."
  → "They laugh — really laugh, the first real one you've heard in days."
  Betrayal case menu names the real open cases ("put the ambush of Sofia /
  the murder of Sofia to the village" — Sofia's d21 ambush death).
- **Minor grit (documented, not fixed):** favor seed follow-ups say "About
  their injury" without naming whose (424242-day30 is the exception — it
  names Hattie). Third-person ambiguity in one line template.

## Blank FILLED: the deferred favor opener (phantom promise)

**The bug.** When the resume opener preempts the want's opener in startConvo
(an unfinished thread resurfaces instead of the want's ask), an ask_favor
want is selected on a real need but its favor is never built or stated. The
want menu still ran the full arc on nothing — observed in three r3
transcripts (424242-day15/25 Luz, 20261011-day20 Marcus):
- "How can I help?" → hollow fallback ("Nothing I can name. Company's
  enough." / "Honestly? I'm alright right now.")
- "Count me in." / "I'll do it." → hollow "Thank you. Seriously — thank
  you." → resolution **'promised'** with NO favor obligation created
- endConvo plants a phantom repay seed `{wantId:'repay', note:'what you
  promised'}` with **no favorId** — an obligation owed for nothing, and a
  follow-up ("About what you promised — ...") that can never resolve

This violates the favor system's own structural guarantee ("Only dlg:commit
sets 'promised', and only when a real obligation was created").

**Fix (src/js/convo-wants.js, ask_favor only):**
1. `engageBeat`: when no favor was stated, run the deferred want opener —
   engaging the want now states the real ask (opener builds the favor once;
   fromSeed/inherited paths handled there) instead of the hollow fallback.
2. `menuOptions`: at stage ≥ 2 with no favor, offer engagement, never
   commit/deflect — nothing committable exists.
3. `resolve('promised')`: with no favor, plant nothing — never the
   contentless repay seed.

**Proof:** `scripts/test-est-deferred-favor-20261012.js` — forces the
resume-preempt path (stubbed resume opener + ask_favor selected on a wound).
PRISTINE=1 (HEAD's convo-wants.js): 6 RED — hollow fallback spoken
("Nothing I can name. Company's enough."), no favor built, 'promised' with
no obligation, phantom `{note:'what you promised', favorId:null}` seed.
Fixed: 12/12 GREEN — real favor asked ("I can't reach this properly. Will
you help me clean it?"), tracked obligation with the favor id, repay seed
carries the favor id.

## Regressions (node proof scripts, sequential)
- test-est-deferred-favor-20261012 (new): RED 6 on pristine → GREEN 12/12
- test-dialog-coherence-20261011: 37/37 ✓
- test-dialog-gating-20261011: ALL GREEN ✓
- test-dialog-stream-20261011: 43/43 ✓
- test-favor-system-20261011: 30/30 ✓
- test-succession-spent-choices-20261012: ALL GREEN ✓
- test-landing-spoken-lure-20261012: 10/10 ✓
- scripts/validate-ontology.js: 82/82 ✓

## Reachable / fun / winnable
- **Reachable: yes.** Pilot-episode-era contests fire in budget (6–8
  events/leg), prize lanes fire in-leg (knowledge dump d23, ability offer
  d40), wave-2 unlocks via villager+player kills, favor arcs span succession.
- **Fun: yes.** The leg's heartbeat is the show interrupting + villagers
  with real needs and memories. The deferred-favor fix removes the one
  recurring mushy beat (promising nothing to no one).
- **Winnable: the leg is the on-ramp.** 2 of 3 seeds ended in the narrated
  famine scattering (the designed food-wall failure, Steve 2026-10-11 —
  not a bug); the third survives into wave 2 with the pantry nearly dry.
  Food pressure is the thesis, working as designed. The competent policy
  feeds the player, not the pantry — a policy gap, not a game bug.

## Files
- Fix: src/js/convo-wants.js (ask_favor: engageBeat/menuOptions/resolve)
- Harness: scripts/test-journey-establishment-r3-20261012.js (75-module
  refresh + DEATHLOG flag)
- Proof: scripts/test-est-deferred-favor-20261012.js (12/12; 6 red pristine)
- Transcripts: /tmp/journey-est-transcript-*.txt (16, ephemeral)
- Censuses: /tmp/journey-est-census-{20261011,777,424242}.json

Status: fixed in worktree; coordinator lands. No bump, no push (ship loop owns it).
