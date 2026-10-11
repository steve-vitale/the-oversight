# Journey leg: SCALE (days 80–140) — 2026-10-11

Recovery-free run. Rotation 3 → 4. Worktree `journey-scale`, lock held for
the run (run_id matched to registry; heartbeats sent). Main tree untouched
until landing.

## Method

Worker-built harness `scripts/test-journey-scale-20261011.js` (adapted from
the deepening harness) + courtship probe `scripts/probe-courtship-20261011.js`.
Node, mulberry32 seeded before module eval, full production script list, text
capture on. Competent policy (`scripts/policies/competent.js`) + leg
extensions:
- SURVIVAL-FIRST fights: wave 2+ taken only with overwhelming advantage;
  wave 4+ never. (Deepening already proved wave-2 fights are fought
  blow-by-blow; this leg is about living long enough to reach scale.)
- Scale-courtship: first link via proposeLink (day 25+, pantry >12k), then
  peer links (covenant first, then trade) toward the national bar of 3
  same-kind peers. Counters answered (sweeten when rich), tribute paid,
  demands honored, national/global beats answered, defense/trade calls
  answered aloud.
- gear-up, beasttricks askAbout, conversations on CONVO_DAYS (env-overridable).
4 seeds (20261011, 777, 424242, 99), DAYCAP=140, pass 1. Pass 2: seed 99,
DAYCAP=95, CONVODAYS=86,90,94 for extra scale-window conversations (RNG
diverged → labeled 99b). Canon read first: CANON.md, SCALE.md,
MONSTER-WAVES.md (waves 3–5), CONVERSATIONS.md.

## Village assessment (plain words)

**Seed 20261011 — dead day 78.** 16 proposals, all declined. Wave-2 fights
bled the village (Static Kite 45 rounds lost, Moderator 44 lost), famine took
the last. Pantry 15k → 0. Never left 'village'.

**Seed 777 — dead day 61.** 21 proposals, all declined. Died of combat +
starvation. Never left 'village'. Wave 1 only.

**Seed 424242 — dead day 78.** 11 proposals, all declined. Same story.
Never left 'village'.

**Seed 99 — the realm run. Dead day 95, NATIONAL from day 35, wave 3 at 75.**
Day 25: proposeLink to Emberhold ACCEPTED → day 26 accord gift → REGIONAL
(the Regional Dawn). Days 31–33: three covenant peer proposals all accepted
→ day 34: pendingNational answered 'pact' → NATIONAL (the Founding Council,
war-pact sworn, shared granary opened). Days 42/59: two trade links added.
Held national 60 days (day 35–95) through wave 3's unlock. Died honestly:
wave-3 fights (Redactor routed 39 rounds, Spool lost 44 rounds) + famine
(pantry 27k → 0, day 90–95). The original regional link broke; covenant
trust decayed 28 → 6–24 (honest relationship sim — links need tending).
Last man: James, carpenter, trust 3, grieving, 29 plants known — nobody left
to teach. 31 plants / 13 skills / 10 monsters / 12 counters known.

**Seed 99b — dead day 89** (RNG-diverged repeat). National day 35, wave 3,
same arc.

## Play: scale, waves, fights

- **The scale ladder is WALKABLE but a lottery.** Seed 99: village → regional
  (day 26) → national (day 35) in 10 days from first proposal, all on cold
  proposals that accepted. The Founding Council beat is genuinely played
  (speakers sit in a circle, pact/pool/walk + permanent REFUSE offered, real
  pantry debit for the founding pour — the thin-air mint is closed).
- **3/4 seeds never left 'village'.** 48 proposals across them, ALL declined,
  ZERO counters. The doc (hierarchy.js:67) claims "cold proposals usually
  draw a counter-offer in the 35-54 band (judgeLink base 38)" — empirically
  false: 0/48 counters. Each decline nudges opinion −5, so repeated asking is
  a death spiral: the more you court, the worse every future score gets.
  The climb verbs (joinVillage +5, studyVillageCodex +3, once each) total +8
  opinion ≈ +4 score — not enough to rescue a declining relationship.
- **Same-seed variance is extreme.** Probe (seed 20261011, plain-competent
  history to day 25): cold judgeLink median 67 = ACCEPT band 20/20.
  Scale-run history (same seed, survival-first policy): 16 straight declines.
  The score is hypersensitive to run history (rep standing, village
  standing, opinion) — a struggling village has no visible path to the table,
  and the player is never told the climb exists (the decline line shows
  reasons but never mentions joining/studying).
- **Wave 3 unlocked day 75** (4 w2 ledger points — the post-lever bar
  working). Wave-3 fights are REAL: The Redactor redacted the player's
  Machete mid-fight ("For two rounds it is just a shape in your hands.
  Strikes are unarmed." — strikes 47 → 8), ran its starve mechanic to flee;
  Spool RECORDed the player's actual turns (STRIKE ~17) then REPLAYed them
  back ("the tape plays your own swing back at you" — 19 damage). Signature
  mechanics are engine-real, not copy.
- **Wave 4: 0 observed** (needs 4 w3 points + regional; best was 0 w3 points
  by day 95). **Global: 0/4** (viewership bar 40 unreached in every run).
- **Contests:** rich when the village lives — seed 99: 8 distinct contests
  (wrongmap, fetch, informant, alibi, siege lost, wheel, vigil, oath) +
  4 shows (infomercial, rose_ceremony, grudge_pudding, stare_down), played
  not rolled. Dead seeds: 1–2 contests. **Pilot episode still unimplemented**
  (establishment blank #1 re-verified); no moot contest fired (blank #2
  stands).

## People check (transcripts read, not counted)

**Day 85 (Sofia, trust 90, ask_favor: wound-cleaning)** — a real memory
callback ("We never did finish talking about that question — that was 8 days
back"), a concrete want (clean and wrap a festering wound), commit →
"Careful with it. And — thank you.", two real teaching beats (Yarrow,
Groundnut — "I never knew that."), and coherent reactions when the player
backs off ("No — it's fine. I shouldn't have asked."). Resolution:
promised. Genuinely human.

**Day 86b (James, carpenter, trust 90, grieving, village dying)** —
"About that question — Has this changed you? Like, fundamentally?" Player:
"I don't recognize the person in my head anymore. I think that's good? I
don't know." → "The old you got you here. The new you keeps you here. Both
count." Pressing 'goon' cools him: "Whatever warmth was building cools to
politeness." Gossip with real content: "Did you hear? David just walked away
from Haven. Didn't look back." Closing: "...Thanks for being here. That's
all." (resolution: engaged). The dodge-followup mechanic works — dodging his
yes/no question makes him notice ("Sorry — I asked you something there.").

**Day 92 (David, grieving)** — harness chose to leave immediately; thin but
coherent (confront option from gossip exists: "You said something odd the
other day.").

**Fixed this run:** `encDamageSource` possessive-generic — a named monster
with a knowledge-gated attack rendered "Redactor's the attack hits you for
22." → now "Redactor's attack hits you for 22." Unnamed attackers still get
the dread noun ("The attack"). Proof: scripts/test-enc-damage-source-20261011.js
(4/4).

## Blanks documented (not fixed this run)

1. **Courtship spiral (new).** 48/48 cold proposals declined in 3 seeds, 0
   counters (doc claims counters are usual); decline −5 opinion spirals;
   climb verbs too weak to rescue; player never told the climb exists. The
   scale on-ramp is a lottery on run history. Tuning/design call for the
   longsim loop or Steve — probe: scripts/probe-courtship-20261011.js.
2. **Wave 4 / global unreachable in-leg** (0/4 runs; wave 3 only in 1/4).
   Consistent with the alignment note: the scale on-ramp is the binding wall.
3. **Pilot episode unimplemented** (establishment blank #1, re-verified).
4. **Contest scheduling high-variance** (establishment blank #2/#3 stand).
5. **Stale break-it assertions:** scripts/test-monsters-break-r14-20261010.js
   fails 3 checks on pristine master too (wave-3 bar assertions predate the
   5→4 lever). For the longsim loop's assertion hygiene.
6. Harness note: Game.say/emit text doesn't reach node stdout — decline-line
   wording and beat text verified from code, not from a played read.

## Verdict: reachable / fun / winnable

- **Reachable: PARTIAL.** Regional — yes (2 seeds got proposals judged;
  1 reached). National — yes, and it's a real played beat, but only 1/4 runs
  got there; the courtship gate is opaque and spirals against struggling
  villages. Wave 3 — yes (1/4, day 75, real fights). Wave 4 / global — no.
- **Fun: YES, when it fires.** Wave-3 signature mechanics are engine-real
  and surprising; the Founding Council beat has weight; trust-90
  conversations are the bar. The leg's problem is access, not quality.
- **Winnable: the leg resolves honestly.** 4/4 villages died (61, 78, 78,
  95/89) — all legible deaths (wave fights + famine). But with median
  competent survival ~70 days and wave 3 unlocking ~day 75, the endgame's
  "all 5 waves by ~day 100" pacing doesn't close at competent play.

## Files

- Harness: `scripts/test-journey-scale-20261011.js` (worker-built; CONVO_DAYS
  env-overridable)
- Probe: `scripts/probe-courtship-20261011.js` (worker-built)
- Proof: `scripts/test-enc-damage-source-20261011.js` (4/4)
- Fix: `src/js/game.js` (encDamageSource possessive-generic)
- Transcripts: /tmp/journey-scale-transcript-99-day85.txt,
  /tmp/journey-scale-transcript-99-day86.txt (99b),
  /tmp/journey-scale-transcript-99-day92.txt (ephemeral)
- Censuses: /tmp/journey-scale-census-{20261011,777,424242,99}.json (ephemeral)
