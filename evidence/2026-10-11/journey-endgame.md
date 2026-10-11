# Journey leg: ENDGAME (days 140+) — 2026-10-11

Recovery-free run. Rotation 4 → 5. Worktree `journey-endgame`, lock held by
the coordinator (run_id matched to registry; heartbeats sent). Main tree
untouched — landing is the coordinator's job.

## Method

Worker-built harness `scripts/test-journey-endgame-20261011.js` (adapted from
the scale harness) + deed-seeking policy extension. Node, mulberry32 seeded
before module eval, full production script list (index.html order minus
DOM-only), text capture on. Competent policy (`scripts/policies/competent.js`)
+ leg extensions:
- DEED-SEEKING fights: take wave fights to fill the 5/5/4/3/2 deed bars
  (fleeing counts as fought — MONSTER-WAVES.md); flee honest deaths
  (hp<0.5, hopelessly outmatched). Wave 4/5: 3-round deed dips then leave —
  unless FEASTED, when the player stays for the kill (wave-5 unlock needs
  3 w4 LEDGER points = kills only).
- Sentiment: channel a keepsake daily once taught (devotion lane:
  surgeResonance>=35 arms the feast surge). Feast when armed + pantry>25k +
  at haven, then fight while feasted (feastSurgeUsed marks on real combat use).
- Scale-courtship: same regionalPlay as the scale leg (national is the deed
  bar). Every contest/crisis/beat answered aloud.
- The final live choice: when scholar.tableChoices is set, choose option 0
  and record frame + choice (a real player makes the choice).
- Wave-4/5 signature markers built from monster data (telegraph + cue words);
  narration hits recorded per fight — observe only, never fix (Steve's pick
  pending).
- Per-day series: deedGateReady() breakdown, wavesFaced counts, wave ledger,
  Arc-IV flags (sentimentTaught, feastSurgeUsed, stage, arc, tableWaiting),
  endingFrame.
8 seeds (20261011, 777, 424242, 99, 13, 42, 555, 90210), DAYCAP=180, pass 1.
Pass 2 used CONVODAYS=35,45,50,55 (the leg's nominal convo days 100–160 were
all post-mortem — see below). Canon read first: CANON.md, SCALE.md,
ENDGAME-BUILDS.md, MONSTER-WAVES.md (waves 4–5), PROGRESSION.md (deed gate).

## Village assessment (plain words)

**Seed 20261011 — dead day 58.** Regional by day 48. The village fought hard:
10 distinct wave-1 and 4 wave-2 monsters faced, 8 contests, 3 crises (breach,
first-grave, schism). Then the cascade: a Performance Review killed a
villager day 49, wave-2 fights bled them, famine took the last stores
(starvation day 55), and a final combat wiped the rest day 58. 25 plants,
7 skills, 6 counters known. Felt: feared.

**Seed 777 — dead day 64.** Never left 'village'. Wave 2 never unlocked (3
w1 ledger points). Died of attrition — combat plus starvation; Sofia died of
a wound that wouldn't close day 53, James starved day 56. Thin knowledge
(20 plants, 3 counters). Felt: feared.

**Seed 424242 — dead day 67.** Wave 2 day 48. Four belltoads killed villagers
day 50; starvation took Lena and David. 22 plants, 6 counters. Felt: feared.

**Seed 99 — dead day 60. The deep run.** National day 35, wave 3 day 48.
7 contests, feast surge USED in real combat, 29 plants / 9 skills / 9
counters. Fought Spool (45 rounds), The Callback (37), The Redactor (33)
blow-by-blow — lost all three; the player died in each and the mantle
passed. The village bled out in wave-3 fights plus famine. Closest to the
table of all 8: deed w3 at 3/4, crises 2/3. Felt: feared.

**Seed 13 — dead day 57.** Wave 2, 12 contests, arc 2. Died the honest way:
pantry hit 0 for three straight days and Haven scattered — "people started
walking, in different directions." (An alien player killed James the same
day; coincidence, not cause — the alien kill path excludes the scholar by
design.) 4 villagers still on the roster when the fire went out. Felt: feared.

**Seed 42 — SURVIVED 181 days. The peaceful empire.** National by ~day 35,
pantry 40–88k all run, 23 contests, all 6 ability slots, feast surge used,
20 feasts held, 158 keepsake channelings, 45 plants / 20 skills / 7 counters.
Jada's village is the good life — and it is STUCK: wave never passed 2
(zero wave-2 kills in 181 days despite 5 distinct types fought), exactly ONE
crisis in six months (arc frozen at 2), w3 deed 0. A rich, safe, stagnant
village. The table needs deeds this village never does. Felt: feared.

**Seed 555 — dead day 61.** One contest, arc 3 (all three crises), died of
combat + starvation. 18 plants. Felt: feared.

**Seed 90210 — dead day 55.** Regional, EIGHTEEN contests, arc 3 — the show
loved Lily's village and it still died day 55 in combat. Felt: feared.

## Play: waves, fights, the table

- **The table: 0/8.** Deed gate OK: 0/8. tableScene fired: 0 times.
  endingFrame computed every run — all 8 came back **feared** (the
  deed-seeking fighter is read by the world as feared; the ledger beats fire
  and the frame is felt before arrival — the mechanism works, the playstyle
  just never earns another frame).
- **Wave 3: 1/8** (seed 99, day 48). Wave 4: 0/8. Wave 5: 0/8. Best deed
  bars at death: w1 11/5, w2 5/5, w3 3/4 (seed 99), w4 0/3, w5 0/2.
- **Wave-3 signature mechanics are engine-real** (observed, not fixed):
  Spool RECORDed the player's actual strikes then REPLAYed them back
  ("the tape plays your own swing back at you" — 19 damage); The Callback
  wore Emma Larsen's actual face and borrowed her swing; The Redactor
  POINTed then REDACTed the Phase blade ("For two rounds it is just a shape
  in your hands"). All three fights lost — 240–420 HP vs ~50–84/round
  player DPS is a real fight.
- **Wave 4/5: unobserved.** Never unlocked, so no signature-mechanic markers
  to report. The copy-only debt stands exactly where Steve left it — his
  mechanism pick is still pending, nothing touched.
- **KILLS are the binding constraint.** Wave unlocks need ledger points
  (kills only); the deed bars need fought (fleeing counts). Seed 42 proves
  the gap: 181 days, 5 distinct wave-2 types FOUGHT, **zero wave-2 KILLED**
  (villageSlain all wave-1). A competent player who flees honest deaths
  fills deed bars but never unlocks the next wave. Seed 99's 4 w2 points
  came from two counter-kills (giant_mosquito, memory_projector — 2 pts
  each). The pacing audit's "strong run unlocks w5 ~day 77–93" assumes a
  fight every ~2 days AND kills landing; competent play delivers the first
  and not the second.
- **Crises are sparse for stable villages.** Table needs 3+, Arc III needs
  2. Seed 42: exactly 1 crisis ("breach") in 181 days — arc frozen at 2 the
  whole run. Turbulent villages (555, 90210) hit 3; the peaceful empire
  never does.
- **The feast-surge loop works end to end** (2/8 runs): channel keepsakes
  daily → surgeResonance 35–42 → surge armed → feast held → fight while
  feasted → feastSurgeUsed marked. Seed 42 held 20 feasts. sentimentTaught
  fired in all 8 (slot-moment beat). The food-thesis deeds are reachable;
  the wave deeds are not.
- **Contests are rich when the village lives**: 23 distinct contests in
  seed 42 (informant, how_to_human, wrongmap, the_leak, guest, secrets,
  auction, riddle, echo, exchange, whoate, longodds), 18 in seed 90210 —
  played, not rolled.

**Fixed this run:** possessive-generic in the DIRECT strike path
(game.js ~31682). The scale-leg fix covered encDamageSource, but the generic
direct-strike path composed its own `"<name>'s " + hitName` — and hitName is
'the attack' while the pattern is knowledge-gated. Live evidence from seed
99's wave-3 fights: "Redactor's the attack hits you for 34." /
"Callback's the attack hits you for 20." Now routes through encDamageSource
like every other strike path: named+generic → "Redactor's attack", unnamed
→ "The attack". Proof: scripts/test-possessive-generic-direct-20261011.js
(9/9). Regressions: test-enc-damage-source (4/4), test-wave3-5-20261010.js
(215 × 3 seeds).

## People check (transcripts read, not counted)

16 transcripts, days 3–55 (the leg's nominal convo days 100+ were all
post-mortem — every village but one died by day 67). No verbatim repeats,
no "(last time)" leaks, resolutions genuinely varied
(engaged/promised/comforted/deflected/stated/unresolved).

**Best — seed 42 day 50 (Marcus, electrician, trust 89, curious):** a real
memory callback ("We never did finish talking about that question — we got
cut off"), a genuine question ("Has this changed you? Like,
fundamentally?") → "The old you got you here. The new you keeps you here.
Both count." → "Changed or revealed? I go back and forth. Maybe both."
Gossip with real content ("Did you hear? Sofia just walked away from Haven.
Didn't look back."), the dodge-followup working ("Sorry — I asked you
something there."). Resolution: engaged. This is the bar.

**Also good — seed 90210 day 35 (Lena, ER nurse, trust 90, seek_comfort):**
want is real (she's grieving, wants company), staying is rewarded
("They shift over, making room. 'Stay as long as you like.'"), the long
stay cracks her open ("...I keep thinking about them. About — everyone.
Sorry. It just comes out, sitting here."), ending resolves: comforted
("Alright, duty calls. This was a good pause."). Two nits: the opener
"About whatever's been weighing on them" reads like a template seam
(third-person "them" for her own grief), and "Here's what I think —
Thanks. ...Thanks for saying that." has an awkward prefix. Documented
below; meaning intact.

**Worst — seed 90210 day 50 (David, plumber, trust 32, ask_favor):** the
want is concrete (pantry run needs hands: "About the pantry run — still
need hands. Are you in? …sorry.") but the menu is yes/no/unsure/pass and
the harness left immediately. Thin but coherent — resolution: stated.
Same shape in seed 13 day 55 (Lena). The favor menu's yes/no framing is
honest; a real player would answer it.

## Blanks

**Filled (1):** possessive-generic in the direct strike path (above).

**Documented (not fixed):**
1. **Wave 4/5 unreachable at competent play (0/8).** The endgame's
   "all 5 waves by ~day 100" pacing doesn't close: median competent
   survival is ~60 days, wave 3 unlocks ~day 48 at best, and unlocks need
   KILLS while competent fighters flee honest deaths (seed 42: 0 w2 kills
   in 181 days). The deed gate's 5/5/4/3/2 + national + 3 crises + Arc-IV
   flags never all hold at once. This is the longsim loop's lever
   question — or Steve's: is the table meant for godhood builds only?
2. **Crisis sparsity.** A stable village sees ~1 crisis per 180 days; the
   table needs 3 and Arc III needs 2. Seed 42 sat at arc 2 for six months.
   The peaceful empire can never reach the table — deeds or turbulence are
   required, and nothing tells the player that.
3. **seek_comfort opener seam** ("About whatever's been weighing on them"
   + "Here's what I think — Thanks."). Minor; conversation still resolves
   with meaning.
4. **Wave 4/5 signature-mechanic markers: unobserved.** No fights reached
   them; Steve's mechanism pick still pending. Nothing to report beyond
   out-of-reach.
5. **All 8 runs read as "feared."** The ledger frame mechanism works, but a
   deed-seeking playstyle never earns another frame in 8 runs — worth
   checking whether beloved/indispensable are reachable at all in the
   current tuning.

## Verdict: reachable / fun / winnable

- **Reachable: NO, at competent play.** 0/8 reached the table; 0/8 reached
  wave 4; 1/8 reached wave 3 and died 12 days later. The road exists
  (seed 99 walked it to wave 3; seed 42 walked the scale road to national)
  but the bars don't close inside a competent lifespan. The binding
  constraints are kills (ledger), crisis cadence (3 needed), and survival
  (~60-day median vs ~day-48 wave-3 unlock at best).
- **Fun: YES, when it fires.** Wave-3 signature fights are engine-real and
  dramatic; the feast-surge loop pays off; trust-85+ conversations are the
  bar; the national-scale game (seed 42) is rich. The leg's problem is
  access, not quality.
- **Winnable: not demonstrated.** No seed won. The ~100-day win target
  assumes godhood builds the competent policy never assembles — whether
  that's the intended audience for the table is Steve's call.

## Files

- Harness: `scripts/test-journey-endgame-20261011.js` (worker-built;
  SEEDS/DAYCAP/CONVODAYS env-overridable; deed-seeking policy + per-day
  deedGate telemetry + table-choice answering + w4/5 signature markers)
- Proof: `scripts/test-possessive-generic-direct-20261011.js` (9/9)
- Fix: `src/js/game.js` (direct-strike damage source routes through
  encDamageSource)
- Transcripts: /tmp/journey-endgame-transcript-{seed}-day{day}.txt
  (16 files, ephemeral)
- Censuses: /tmp/journey-endgame-census-{20261011,777,424242,99,13,42,555,90210}.json
  (ephemeral)
