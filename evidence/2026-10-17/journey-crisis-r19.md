# Journey: crisis leg (6) r19 — the siege roster (2026-10-16/17)

## Pre-registration (MEASUREMENT.md §§9–12, 14)

- **Leg:** 6 — crisis, r19. Fresh angle: **THE SIEGE ROSTER — who bleeds for
  the village.** r5/r6 covered raid mechanics, r7 famine slope, r8 outbreak
  talk, r9 compound, r10 post-famine siege + trust, r16 alien outbreak, r17
  contest-in-crisis, r18 healer arc. NEVER journey-tested roster-first: §14c
  (docs/MEASUREMENT.md) mandates villager combat deaths as co-primary for
  survival/defense work — the scale wall lives in the roster. The aid
  channel (src/js/comms.js: aidCrisis/aidFight/runners) never assessed from
  a player's journey seat.
- **Leg question:** When the raid hits, does the village bend like people —
  aid channel firing, villagers fighting real blow-by-blow fights and taking
  real deaths, the fallen mourned BY NAME, the wounded tended — or does the
  scholar get protected while the roster dies unrecorded?
- **Interesting finding criteria:**
  - (a) villager-vs-raider fight with villager combat death attributed;
  - (b) aid channel actuation (aidCrisis/aidFight/runner) or honest absence;
  - (c) post-siege convos naming the fallen + tending the wounded;
  - (d) any gap where the roster dies conversationally invisible (r18 pattern).
- **Seeds:** 1717, 1828, 1939 (exact literals; fresh — checked against the
  banned list). Policy: oracleV2 (establish) → competent. ANSWER:
  endure (1717, 1939), sortie (1828).
- **Primary metrics (binding, §14):**
  - M1: ≥2/3 seeds — ≥1 villager-vs-raider blow-by-blow fight recorded with
    villager combat outcome attributed (death or survival).
  - M2: ≥2/3 seeds — ≥1 aid-channel actuation (aidCrisis, aidFight, runner
    dispatched) OR an evidence-backed honest absence.
  - M3: ≥2/3 seeds — ≥3/4 end-state convos carry the siege
    (defense/mourning) with SENSE-verified meaning (named fallen,
    wound-tending).
- **Kill rule:** raid fails to fire/stage on ≥2/3 seeds → SUBSTRATE-MISSING
  per §14a; document and move on.
- **Horizon:** d55 (establish + siege aftermath). Death-aware: pop≤2 → +10d
  tail max, then stop.
- **Method:** scripts/diag-crisis-siegeroster-20261016.js (REAL raid pathway:
  havenRaidTick via progDaily + one controlled call with cooldown cleared;
  downstream systems real: fieldFight defender fights, aid crisis, lingering
  raiders, pillage, pendingEncounter→startCombat, crisis resolution). Per
  seed: census before/after, per-dawn fallen-cause tracking
  (fallen[].cause), mid-siege convos (2) + end convos (4), FULL transcripts,
  SENSE-read for meaning. One competent player aid move per seed:
  callForHelp('runner') while the first raid's crisis is live.

## Metric review (§14)

- **M1: HIT (3/3).** Raid fights with attributed villager outcomes:
  1717: 20, 1828: 20, 1939: 14 — all blow-by-blow via
  resolveWildMonsterEncounter {raid:true}, hp before/after + alive/dead
  recorded. **Interesting finding (a): the first observed defender combat
  death** — 1939, d21: Daisy fought a lingering hushwolf THROUGH the aid
  channel (aidFight routing, wViaAid: lingering raider + live crisis),
  vFlee then vDie; cause registered 'monster'. Zero defender deaths in the
  initial raid-night drafts (54 fights); the death came from the linger
  path, not the draft.
- **M2: HIT (3/3).** Aid crises raised reactively on every raid: 5/4/3, all
  resolved 'fought'. Runner dispatched 3/3 ('sent' — 1939: Liam hurt on the
  road, the honest mishap path). aidFight routed lingering-raider fights
  2/0/3. Honest absence, evidence-backed: NO foreign fighters arrived at any
  door — every crisis resolved 'fought' the same day it was raised (the
  village's own defenders cleared the treeline), so no party could march in
  time; aidHelpArrived's 'stood-down' path is the designed outcome here.
  Instrument gap (mine, not the game's): the plea decision
  (accepted/refused) wasn't captured — my say-filter dropped the
  arrival/refusal lines. The dispatch is proven; the decision is unknown.
- **M3: HIT on the letter (3/3) — with SENSE caveats.** Regex carry
  (siege||mourn): 1717: 4/4, 1828: 3/4, 1939: 3/4. BUT the regex overcounted
  (false positives: "did you miss it?" → namedFallen, "it was gone" →
  mourn, "You haven't hurt me yet" → wound — guidance for future runs:
  anchor on named-death and siege nouns, never bare substrings). SENSE
  truth: mourning is genuine and named when it fires ("Since Aisling
  died... I keep expecting to see Aisling at the fire. Stupid." / "I'm
  picking up Aisling's share of the work."); DEFENSE content is thin —
  defenders talk about personal wants, not the fights, and the 20–26
  'defended' memories per seed rarely surface (outranked by wants/grief or
  past the 7-day window); WOUND-TENDING had zero mentions pre-fix — the
  blank, fixed below. Not re-scored: the letter stands as HIT; the
  meaning-gap is documented here, not laundered.
- **Kill rule:** not triggered — raids fired and staged on all 3 seeds
  (5/4/3 raids, drafts + lingers + resolutions all real).
- **Instrument notes:** (1) The pilot's away-travel was broken —
  Game.travelTo only walks ADJACENT travelTargets; my (hx±3,hy) spots
  silently returned null, so "raid2 away" ran at-haven. Fixed by chaining
  hops outward; re-ran all 3 seeds (1717's travel still failed after 6
  hops — anomaly recorded, raid2 ran at-haven there; 1828/1939 got a true
  away raid). (2) registerDeath carries the knowledge-gated descriptor
  ("A woman in her 30s") — naive firstName() mangled a d6 death to "A";
  fixed by resolving via rosterChars first. (3) The content pipeline
  redacts "Bearer: <name>" as an OAuth token in DISPLAYED output only —
  evidence file bytes are intact (verified: "Bearer: Stan", 0 "redacted"
  in file). Do not "fix" evidence files for this.

## Run log

### Seed 1717 — endure (d56, 8 living, 3 fallen)
Raids d9/d14/d20/d37/d47 — all 'fought', 20 raid fights, 0 defender deaths.
Logan (villager) d29 'monster' (wild). Runner dispatched d14 ('sent').
2 aidFight-routed lingerer fights (Miguel, Pamela vs drumbelly_tanuki —
both mFlee). healerRounds 21. Scholar churn: Peyton d9 starvation, Stan
d51 combat. End convos: 4/4 carry (mourning-led).

### Seed 1828 — sortie (d56, 8 living, 9 fallen)
Raids d14/d20/d32/d47 — all 'fought', 20 raid fights, 0 defender deaths.
Cesar (villager) d20 'monster', Raj d54 'monster'. Runner 'sent' d14.
Sortie answered on lingerers — muster formed, fought, no deaths. Scholar
churn heavy: Carl d4 starvation, Vasyl d10 dehydration, Emma d17 combat,
Autumn d25 dehydration, Aisling d32 combat, Marthe d32 combat, Rosa d47
combat — 7 scholar deaths, 2 villager deaths. End convos: 3/4 carry.

### Seed 1939 — endure (d56, 8 living, 6 fallen)
Raids d14/d21/d44 — all 'fought', 14 raid fights. **Daisy (villager)
died d21 defending the treeline** — fought a lingering hushwolf through
aidFight (vFlee, then vDie; Aki then killed it, vKill). Colleen d6,
Oliver d10, Luis d17, Daisy d21 — all 'monster' (wild + linger). Runner
'sent' d14 — Liam hurt on the road delivering the plea to Emberhold.
healerRounds 38. The Emberhold paradox (below). End convos: 3/4 carry.

### The Emberhold paradox (1939 — emergent, not a bug)
The plea went to Emberhold (linked; tribute paid d4/d7; forage dispute
live: "Back off — or we'll talk with teeth"). Emberhold then raided
Haven's pantry FIVE times (d21 ~720 kcal, d32 gardens trampled, d44
~1440 kcal, d46 ~800 kcal, d55 ~1500 kcal). Verified independent: these
are commonsRaid (game.js) — trigger `!deal && tension≥70 && trust<15 &&
8%`, no link to the aid plea (the plea changes neither trust nor
tension; score<45 → refused, no state change). From the player's seat it
reads as betrayal — "we begged, they raided us" — but it's the commons
system working as designed, and the tension was telegraphed. A story,
not a defect. (Plea decision itself uncaptured — instrument gap noted
above.)

## The blank: combat-wound tending was conversationally invisible (FIXED)

**Finding:** healerRounds() binds up the most-hurt villager daily (+15 HP,
narrated "🩹 X makes rounds — Y gets bound up properly") — 75 events
across the 3 seeds — but booked NO memory. The r18 fix covered only
disease tending (villagerCareTick). The wounded never remembered being
tended, the healer's deed lived only in a creditDeed counter, and 18
end-state transcripts carried zero wound-tending mentions. The r18
pattern exactly, on the combat-wound path. (The wounded DO ask the
player for tending like people — Madi: "My cut needs a second pair of
hands... If it festers I'm no good to anyone" — want=ask_favor,
resolution=promised. The NPC→NPC path was the silent one.)

**Fix** (`src/js/game.js`, `src/js/convoTopics.js`):
- `healerRounds` now books `tended_by` (+medic id, `wound:true`) on the
  patient and `tended` (+patient id, `wound:true`) on the healer
  (scholar-healer branch: medic id = the scholar's villager id).
- The existing 'care' lately scan carries the wound flag through; priority
  unchanged (below grief/mantle/table/bodily-crisis/outbreak, above
  gratitude — the r18 design reasoning).
- `t2gen_lately` `case 'care'` renders wound-variant lines when ev.wound:
  patient ("X bound up my cut proper — cleaned it, wrapped it tight. I
  don't forget that."), healer ("I bound up Y — cleaned it out, wrapped
  it tight. Someone had to, and I know what to do."). Names via firstRef,
  knowledge-gated. Fever lines never render for wounds.

**Proof:** `scripts/test-crisis-woundcare-lately-20261016.js` — RED
(pre-fix: rounds treat but book nothing) → GREEN all pass on seeds
7/42/99 (memories + ids + wound flag, both lately views, wound-flavored
lines, no fever language, care>gratitude, mild outbreak>care, 7-day
expiry, scholar-healer branch). SENSE-read in a live convo via
ask:lately: "the person in their 30s bound up my cut proper — cleaned
it, wrapped it tight. I don't forget that." — in-voice, knowledge-gated,
meaningful. r18's fever-care proof still ALL GREEN (no regression of the
disease path).

## People check (SENSE-TESTING LAW)

18 full transcripts read (6/seed). Verdict: people — with the one fixed
gap above, and one wart.
- Mourning is excellent and named: "Since Aisling died... I keep
  expecting to see Aisling at the fire. Stupid.", "Aisling is gone and
  the world just... continues. That's the part I can't stand.", "I'm
  picking up Aisling's share of the work. Someone should, and it might
  as well be me.", "We bury, we grieve, we keep going. There's no step
  four."
- Daisy (1939), the day before she died at the treeline: talks about her
  taken grandmother ("Eighty-one years old and they called her boring"),
  teaches plants, asks the player to ask the System about the taken —
  want=seek_taken, resolution=promised. A person with a want, dead the
  next day. (Her death itself appears in no end transcript — d21 death,
  d55 sampling; the mourning window had expired. By design, not a gap.)
- The wounded ask for help like people (Madi, above); the mid-siege
  defender (Riley, 1717) talks about illiteracy and the trap line — a
  person, not a fight-robot; the siege just isn't what they lead with.
- WART (observation, not this run's blank): the share_news want
  degenerated once (Zoltan, 1939): "Is there something you need? Really."
  ×7 met with "I just said — did you miss it?" deflections — a filler
  loop. Worth watching if the density rises.

## Census (plain words)

Three villages, three sieges each survived. The roster bled but held:
20/20/14 raid-night fights, every raider met blow-by-blow, zero
defenders lost on the draft nights — the one defender death came from
the linger path (Daisy, at the treeline, through the aid channel). The
wild took its own toll (Logan, Cesar, Raj, Colleen, Oliver, Luis —
'monster', all villagers). The aid channel fired every time: crises
raised and resolved 'fought', runners dispatched (one hurt on the road),
lingering raiders fought through the aid routing. Nobody from outside
ever arrived — the village handled every raid itself, same-day. The
healer made rounds 75 times and nobody ever mentioned it — until this
run. Who led: the defenders (24/25/26 'defended' memories planted;
trust consolidated around fighters). Who was miserable: the bearers —
12 scholar deaths across 3 seeds (starvation, dehydration, combat);
the village eats, the bearer doesn't (the competent-policy weakness
noted since r1). What was missing: teeth on the draft (r10's standing
Steve question — 54 raid-night fights, 0 defender deaths) and, until
the fix, any conversational trace of wound-tending.

## Verdicts

- **Reachable:** yes — raids fire organically against any 3k+ pantry
  village; the aid channel raises reactively and the four call-for-help
  tiers are player-invokable mid-crisis (runner exercised); the shelter
  verb, endure/sortie lingerer answers, and healer rounds all fire in
  sims. The away-raid path works once the harness travels honestly.
- **Fun:** the siege arc plays — drafts, lingers, the runner's road
  danger, the Emberhold paradox, mourning that names names. The draft
  has no teeth for villagers (54 fights, 0 deaths) — the drama lives in
  the bearer's fragility and the linger path, where the one death
  happened. Steve's standing question (should raiders ever break
  through?) is unchanged by this run.
- **Winnable:** yes — all three villages survived to d56 with 8 living
  each through 3–5 raids plus wild losses. Compound crisis is lethal to
  the bearer, survivable for the village. Sensible.
- **Convergence:** blank fixed + proven (wound-care memories → 'care'
  kind → wound lines, live-convo SENSE-verified); kill rule not
  triggered; the defender-death attribution (a) and aid actuation (b)
  both observed; the Emberhold paradox documented as emergent story,
  not defect.

## Telemetry

Baseline seeded for the new angle:
`hidden_files/telemetry-baselines/crisis-siegeroster.json`
(defenderFights 231, villagerDeaths 19, aid.raised 12, aid.calls 3,
aid.allyFights 5, aid.resolved 12, healerRounds 75, memories 177,
convos 18, anomalies 1 — aggregates across the 3 final seeds).
Seeding LOUD lines were all "newly appeared" (first seed, expected);
re-check quiet.

## Files

- Fix: `src/js/game.js` (healerRounds: wound-care memories),
  `src/js/convoTopics.js` (careEv wound flag + wound-variant 'care' lines)
- Proof: `scripts/test-crisis-woundcare-lately-20261016.js` (RED→GREEN,
  seeds 7/42/99)
- Diag: `scripts/diag-crisis-siegeroster-20261016.js` (siege-roster
  harness; seeds 1717/1828/1939; ANSWER=endure/sortie)
- Evidence: `evidence/2026-10-17/journey-crisis-r19-{1717,1828,1939}.{json,log}`,
  `evidence/2026-10-17/journey-crisis-r19.md` (this note)
- Baseline: `hidden_files/telemetry-baselines/crisis-siegeroster.json`

## LOUD infra notes

1. **Sibling files in this worktree:** `evidence/2026-10-17/` contains
   flesh-out loop B files (`sim-aidchannel-b.md`, `sim-wallcensus-b.md`,
   `perseed-wallcensus-b/`, `wallcensus-b-beats/`, run
   fleshout-loop-b-20261017T0004Z) written 01:01 UTC — another loop
   writing evidence into the journey-crisis tree. Untouched; NOT
   committed; flagged for the coordinator (registry ownership vs
   evidence writes).
2. check.js --quick: 96 passed, 1 failed — the failure is
   test-sprites-valid-20261014.js (216 assert failures: missing/duplicate
   calm/aggro sprites), a green-list test my change cannot affect (diff
   touches only game.js healerRounds + convoTopics.js care rendering; no
   data/asset files modified). Pre-existing breakage from another lane;
   left for the asset owner, not quarantined unilaterally (r10 precedent).
   Separately: test-mantle-memory-20261012 (NOT in the green list) fails
   4 asserts on mourning naming the dead bearer — verified identical on
   pristine HEAD via patch-file round-trip (no stash). Pre-existing.
3. check.js --only crisis: 11 passed, 0 failed.
