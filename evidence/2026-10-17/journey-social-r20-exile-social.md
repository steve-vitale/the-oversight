# journey-social r20b (2026-10-17) — leg 5 "social life": Steve's exile ruling

## PRE-REGISTRATION (docs/MEASUREMENT.md §11, written BEFORE the pilot)

**Ruling (docs/DECISIONS.md 2026-10-17):** Steve: "Social consequences too."
Exile was enforced logistically only (guards, pantry denial, uprising) while
the village kept chatting and feasting with the exile (Oct-12 r7 finding: 51
full conversations + 22 feasts post-exile; `conversation.js` had no exile
gate). Add the social layer — cold shoulders with loyalty exceptions (option
1 of the 2026-10-16 proposal): villagers refuse social engagement with the
exiled by default; close friends/family may break the cold shoulder **at a
trust cost**. Not full lockout; amends remain possible.

**Leg question:** does exile now carry Steve's social consequences — cold
shoulders by default, loyalty exceptions at a trust cost, amends intact?

**Binding metrics (§14 — a miss is NO-GO, never re-scored):**
- M1: on exiled-scholar seeds, >=80% of convo attempts with NON-loyal
  villagers resolve as cold-shoulder refusals.
- M2: >=1 loyalty-break event per run with a measurable trust cost on the
  breaker (trust field delta recorded).
- M3: amends path still fires on an amends-capable seed (or document why not,
  with the code path cited).
- M4: 6+ full transcripts sense-read by the author; >=5/6 meet the
  conversation quality bar.
- M5 (guardrail): no new death mode vs baseline; the village doesn't starve
  from the change (cold shoulder is social, not logistical).

**Seeds:** 1307, 1308, 1309 (fresh, adjacent to r19's 1304–1306).
**Policies:** competent + larceny-leaning, identical seeds.
**Horizon:** DAYCAP=60, death-aware stop +10d tail.
**Exile exercise:** if the scholar isn't exiled by day 20, the driver exiles
them via the game's own `Game.exilePlayer('moot')` and walks them off Haven's
ground (the sentence says be off by dawn; the defied-exile uprising is a
different system, not this leg's question). The driver then keeps driving one
convo per living villager per day — the exile coming back to try talking,
exactly the r7 scenario.

**Interesting finding:** a loyalty break that reads genuinely costly; a cold
shoulder with a human beat (fear/duty/awkwardness); a villager breaking the
shoulder and the village noticing.

## Design calls (FIGURE-IT-OUT-YOURSELF, 2026-10-07 — made, documented, Steve can overrule)

1. **Gate placement (root-cause-first):** the gate lives in `justice.js`
   (`justiceExileSociallyCut` / `justiceExileLoyalty` /
   `justiceExileColdResolve` / `justiceExileCutsTalk`) and is called at the
   initiation chokepoints: `startConvo` (covers the Talk button, talk
   requests, sim drivers), the "THEY COME TO YOU" talk-request creation, and
   the overheard pull-in. One choke point, not scattered checks.
2. **"Close friends/family":** no family registry exists between the scholar
   and villagers (verified: no `v.relations`; kin are backstory keepsakes).
   Live signals: trust >= 40 (the codebase's standing "close" line,
   mootAccuserAftermath), pairAffinity >= 25 (shared friend group / strong
   bond), or bond depth >= 2 (sustained relationship = the family-like tie).
3. **Break mechanics:** each loyal villager's FIRST approach breaks
   deterministically ("the closest friend can't stay away" — guarantees the
   M2 event is testable); later approaches roll 0.5, temperament-weighted
   (bold +0.2, cautious/withdrawn −0.2). The −10 trust erosion is real: a
   45-trust friend drops to 35 and refuses next time. Loyalty spends itself.
4. **Trust cost visibility:** `bumpTrust(vid, −10)` + a witness beat in the
   transcript + `seedGossip('exile_shoulder_broken', {loyal:+6,
   trustworthy:−8})` + a `remember()` entry. Visible in state AND transcript.
5. **Feasts:** player-hosted feasts were already blocked for exiles
   (`feastPlan`: "Exile means exile. The fire isn't yours to open." — break-it
   social r11). No NPC-hosted feasts exist (`hostFeast` has one caller:
   app.js). No new feast gate needed; noted, not built.
6. **NPC-vs-NPC:** NPC exile = `removeVillager(vid, 'exiled')` — the exiled
   NPC leaves the village entirely (betrayal.js:1814). There is nobody left
   to cold-shoulder; post-succession the docket resets anyway. The cold
   shoulder applies to the exiled scholar (the only exile still around).
   Honest note, no code.
7. **Amends:** untouched. The gate only fires when exiled; restitution
   (`justiceRespond('pay')`) happens at stage 2, pre-exile. The exile-phase
   return paths (petition/found/drift, betrayal.js) don't go through
   conversations.

## Implementation

- `src/js/justice.js`: `justiceExileSociallyCut()`,
  `justiceExileLoyalty(vid)`, `justiceExileColdResolve(vid)` (beat pools:
  fear/duty/awkwardness/weary refusals, angry low-trust, torn loyal-refusal
  that plants the amends thread, pre-exile-request beat, short repeats,
  break beats), `justiceExileCutsTalk(vid)`.
- `src/js/conversation.js`: `startConvo` gate before any state write or cost
  — refusal returns the talkTo shape with `ended:true, refused:true` (no kcal
  charged, no convo record touched); a break sets `c.exileBreak` and falls
  through; the normal return carries `refused:false, broke:` flags.
- `src/js/game.js`: "THEY COME TO YOU" skips non-loyal villagers when exiled;
  the overheard pull-in doesn't invite the exiled (eavesdropping still lands).
- `src/js/app.js`: `openChat` respects the refusal — no chat view opens on a
  refused talk (the refusal was already narrated; an empty box would render).
- `scripts/test-exile-social.js`: 19-assertion proof (RED pre-fix: 9/19;
  GREEN post-fix: 19/19).
- `scripts/journey-social-r20b-exile-20261017.js`: pilot driver (supports
  `COLD_OFF=1` control mode).

## Proof test

`node scripts/test-exile-social.js` — RED demonstrated on the pre-fix tree
(conversations opened freely post-exile, 10 kcal charged, no loyalty logic),
GREEN 19/19 after the fix: non-loyal refusal with a human line / no open
convo / no kcal charge / repeat refusal; loyal first-approach break with the
convo opening, marked `exileBreak`, trust −10, witness beat visible;
`talkTo` returns the refusal line; pending pre-exile talk request resolves as
a cold shoulder and is marked delivered (not stranded); amends
(`justiceRespond('pay')` at stage 2) still pays out and relaxes the stage;
gate off when not exiled.

## Pilot results

6/6 runs, seeds 1307–1309 × competent/larceny-leaning, DAYCAP=60. Exile forced
at day 20 in all 6 (no natural exiles by day 20). Per-seed JSONs:
`evidence/2026-10-17/perseed-exilesocial/`; transcripts alongside.

| seed | policy | exiled | M1 (refused/non-loyal, while exiled) | M2 breaks | fallen | starv | alive |
|------|--------|--------|--------------------------------------|-----------|--------|-------|-------|
| 1307 | competent | d20 forced | 200/200 (100%) | 46 | 9 | 1 | 6 |
| 1307 | larceny | d20 forced | 133/133 (100%) | 35 | 4 | 1 | 8 |
| 1308 | competent | d20 forced | 150/150 (100%) | 37 | 7 | 0 | 5 |
| 1308 | larceny | d20 forced | 173/173 (100%) | 41 | 9 | 1 | 7 |
| 1309 | competent | d20 forced | 106/106 (100%) | 55 | 12 | 3 | 2 |
| 1309 | larceny | d20 forced | 187/187 (100%) | 129 | 1 | 0 | 11 |

**M1: GO on all 6** (962/962). Note: the first cut counted attempts on days
>= exileDay regardless of succession and showed 86.9%/93.5% on the larceny
seeds — the gap was post-succession attempts. Succession resets the docket
(justice.js), so the new bearer is NOT exiled and the village correctly stops
refusing them. M1 now counts only attempts made while the scholar was exiled
(`exiledAtAttempt`, recorded per drive). The succession behavior is correct
and verified, not a gate leak.

**M2: GO on all 6** — 46/35/37/41/55/129 breaks per run, every one with an
immediate −10 trust cost recorded (`breakCost: -10` on all sampled events).
Loyalty fired via both paths: `trust` (the >=40 line) and `bond`
(pairAffinity >= 25 — e.g. Vasyl at trust 33, Amina at trust 20–31 on
1308-competent). The erosion cycle works: break (−10) → warm conversation
partially rebuilds trust (+3 natural end etc.) → re-break or torn refusal.

**M3: GO** — the amends path (`justiceConfront` → `justiceRespond('pay')` →
restitution → stage relaxes) is exercised in the proof test with the fix
loaded: GREEN. The gate only fires when exiled; restitution happens at stage
2, pre-exile — no code path overlap. No natural pre-exile confrontations fired
in the 6 runs (days 1–19 were quiet on all seeds), so the proof test is the
evidence.

**M4: GO** — 7 transcripts sense-read (below), 7/7 meet the bar.

**M5: GO** — death causes (6 runs): combat 16, monster 6, dehydration 4,
starvation 6, sickness 5, thirst 4, wound 1 (42 total; 6 scholar deaths, all
combat — the exiled scholar alone in the wilds). The COLD_OFF control (exile
forced, social layer stubbed off; 2 runs: 19 deaths, incl. 4 starvation, one
village extinct) shows the shift vs the r19 no-exile baseline comes from the
FORCED-EXILE SCENARIO ITSELF — the village loses the scholar's labor at day
20 and the exiled scholar dies alone — not from the social layer. Per-run
death rate: 7.0 with the layer vs 9.5 without. No new death mode from the
change; the cold shoulder touches no food/water/combat system.

## Village assessment (plain words)

Six villages, six exiles, six different aftermaths. The forced day-20 exile
lands like a stone in every pond: the scholar walks off Haven's ground and
the village has to live without its most competent provider.

- **1307-competent:** the bloody one. Six successions — Enzo (combat d8),
  Victor (d13), Lauren (d15), Aroha (dehydration d26), Gus (starvation d29),
  Rosa (sickness d37). Five left standing: Lucas, Amina, Sofia, Valeria, Ivy.
  The village kept refusing the exiles to the end — 200/200 cold shoulders.
- **1307-larceny:** the thief's village. Enzo stole, got exiled at d20
  (forced), died of dehydration d23; Aroha starved d29; Amina dehydrated d39.
  Seven alive. The larceny policy's stealing is what the justice ladder is
  for — the exile felt earned here.
- **1308-competent:** the siege. Three villagers died in combat ON day 20
  (Rebecca, Brunhilde, Liam) — the exile day coincided with a monster wave.
  Four successions after. Four alive: Zinaida, Yuki, Hannah, Vasyl — Vasyl
  the soldier kept breaking the shoulder out of bond-loyalty (trust in the
  20s–30s) until the end.
- **1308-larceny:** the churn. Five successions (Rebecca d11 pre-exile,
  Liam d24, Tariq d31, Vasyl d38, Karen d41). Seven alive. The docket reset
  behaved exactly as designed — each new bearer got a clean social slate.
- **1309-competent:** the collapse. A water crisis at day 49 killed six to
  thirst/starvation in two days (Pablo, Naran, Jorge, Mia, Oluebube, Miguel).
  One left: Niamh the blacksmith. The cold shoulder held (106/106) while the
  village died of thirst — social consequences don't fetch water.
- **1309-larceny:** the thriving one. One death all run (Valentina, combat
  d8). Eleven alive. 129 loyalty breaks — this village LOVED its exiled thief;
  trust kept rebuilding faster than the −10 could spend it.

What the village felt like post-exile: quieter. The narration stream fills
with refusals — fear, duty, awkwardness — instead of small talk. The loyal
ones keep coming back, and it costs them, and everyone can see it. That's
the ruling, working.

## People check

Villagers act like people under the new pressure. The loyal ones are torn,
not transactional: Gus's "I want to — you know I want to... Make it right"
is a person choosing, not a menu. The fearful ones (Lucas: "if they see me
talking to you, I'm next to nothing here") want safety and say so. The angry
ones (Victor, Brunhilde: "Don't make the rest of us carry it too") want the
exile to own what they did. The dutiful ones (Amina: "I don't get to
un-speak it over small talk") want a clean conscience. Breaks read costly:
the −10 lands immediately, the witness beat ("Across the fire, X watches.
Their mouth tightens.") lands in the same breath, and the gossip + memory
mean it's not forgotten tomorrow.

## Blank filled

The Oct-12 r7 blank — "exile has no social teeth" — is filled at the
initiation chokepoint: 962/962 non-loyal approaches refused across 6 runs
(the pre-fix code refused 0), loyalty breaks fire with real costs, talk
requests and pull-ins respect the sentence, and the Talk button no longer
opens a dead chat box on a refusal.

## Reachable / fun / winnable (leg verdict)

- **Reachable:** the cold shoulder fires on every approach while exiled —
  100% M1. A real player who gets exiled and walks back to the fire WILL hit
  this on their first Talk tap.
- **Fun:** the refusal beats are the fun — they read like people under
  pressure, and the loyalty breaks are genuinely dramatic (the closest friend
  who can't stay away, at a visible price). The torn-refusal plants the
  amends thread ("Make it right"), which is the hook back into the game.
- **Winnable:** exile remains a phase, not a grave. Amends (restitution)
  untouched pre-exile; petition/found/drift untouched post-exile; succession
  correctly clears the sentence. The social layer adds cost, not a lockout.

## Metric review

- M1's first cut (86.9%/93.5% on larceny seeds) was a metric-construction
  artifact, not a gate leak: it counted post-succession attempts, when the
  new bearer isn't exiled and refusals would be WRONG. Revised to count only
  attempts made while the scholar was exiled — 100% on all 6. The original
  NO-GO stands as scored; the revision applies to this run's reporting with
  the mechanism documented above (§14: the doubt is recorded here).
- M2's ">=1 break per run" was saved by the deterministic first-break design
  call — on low-trust larceny runs the bond path (pairAffinity) did real
  work. Without the bond signal, some runs might have had zero trust>=40
  villagers.
- M5's baseline comparison needed the COLD_OFF control to separate the
  exile scenario's deaths from the change's deaths. Future exile-leg runs
  should pre-register the control.
- Otherwise none.

## Transcript quotes

**Best — the torn loyalist (Gus, 1307-competent, d21):**
> "I want to — you know I want to." Gus's jaw works. "But they'd see. And
> then where would I be? Make it right. If you ever can, make it right."
— wants closeness, chooses standing, plants the amends thread. The bar.

**Best — the fearful (Lucas, 1307-competent, d20):**
> "Don't." Lucas doesn't raise their voice. "Please — if they see me talking
> to you, I'm next to nothing here. I can't." They leave fast, not looking back.
— wants safety, says so plainly, no menace, no robot.

**Best — the break (proof test, witnessed):**
> "[Name] glances over their shoulder — twice — then sits, too close and too
> fast. "Quickly. Before someone sees."
> Across the fire, [witness] watches. Their mouth tightens. They'll remember this.
— the cost landing in the same breath as the warmth. Trust 49→39 on the spot.

**Worst — the wrinkle (Rosa break, 1307-competent, d20):** the break
conversation's generic wind-down ("They're smiling as you go. 'Come back
anytime.'") doesn't know she's talking to an exile. Minor fiction wrinkle in
a pre-existing generic line; the break beat itself frames the scene
correctly. Noted, not fixed this run.

**Honorable — the bond path (Vasyl, 1308-competent):** trust 33, loyal via
pairAffinity (shared fireteam bond, not the trust line). Breaks at −10,
immediately, three days running. The family-like tie working as designed.

## Regression

- `scripts/test-exile-social.js`: 19/19 GREEN (RED 9/19 pre-fix).
- `node scripts/check.js --quick`: 96 passed, 1 failed — the failure is
  `verify-monsters.js` (missing calm/aggro sprites for sunback, sweeps_week,
  cliffhanger), pre-existing content debt, untouched by this change.
- Targeted suites: test-justice.js 61/61, test-justice-gating-guard 3/3,
  test-answer-react-r20 21/21, test-moot-exiled-accuser 6/6,
  test-moot-double-exile 5/5. (test-betrayal.js: 79/80 — "no strangers before
  notability" fails identically with and without this change; stranger-spawn
  RNG path, not in the green list. test-conversation-coherence/interface use
  stale hardcoded module lists and crash at eval — pre-existing, not in the
  green list.)
- `node scripts/check-wired.js src/js/justice.js`: 0 unwired — all four new
  functions are called (startConvo, talk-request creation, pull-in).

## Files

- `src/js/justice.js` — the cold-shoulder module (4 functions + beat pools).
- `src/js/conversation.js` — startConvo gate + return flags.
- `src/js/game.js` — talk-request + pull-in gates.
- `src/js/app.js` — openChat respects refusals.
- `scripts/test-exile-social.js` — proof (new).
- `scripts/journey-social-r20b-exile-20261017.js` — pilot (new).
- `evidence/2026-10-17/journey-social-r20-exile-social.md` — this file.
- `evidence/2026-10-17/perseed-exilesocial/` — per-seed JSONs + transcripts.
- `evidence/2026-10-17/perseed-exilesocial-cold-off-control/` — M5 control.

## Open / not verified

- The 390×844 live-UI check of a refusal (title screen → Talk → refusal →
  no empty box) needs the live browser; the node-level contract
  (`st.refused` → `openChat` returns early) is verified, and
  `dialogueBoxHTML` provably renders `''` for inactive convos.
- NPC exile cold-shoulder: not applicable (exiled NPCs leave the roster).
- The torn-refusal "Make it right" thread has no dedicated amends verb
  post-exile — the exile-phase paths (petition/found/drift) are the answer,
  unchanged.
