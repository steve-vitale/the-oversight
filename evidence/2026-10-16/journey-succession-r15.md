# journey-succession r15 (2026-10-16): "the second life"

## Pre-registration (§11; binding per §14)
- **Question:** the mantle passes; the successor was a villager with their own
  past — their work, their standing, their name already known at the fire.
  Does the game honor that, or does the village treat them as a stranger?
  (A) HANDOFF AUDIT: capture every death/transfer say-line — is the
  successor's OWN record ever named, or is the fiction only about the dead
  bearer? (B) FIRST-WEEK CONVERSATION AUDIT: two conversations per seed —
  highest-trust living villager + the living villager whose memory record
  mentions the new bearer most ("old associate"). Sense-tested against the
  conversation quality bar + no-fabricated-history (r12) + no
  stranger-treatment of a known face.
- **Binding metric:** transcript audit PASS/FAIL; GO = all 6 PASS; any FAIL →
  blank documented, fix drafted if safe. Census + handoff capture.
- **Horizon:** 16d competent + scripted death (r14 substrate, d18) + 10d tail.
  Death-aware: village survived all 3 seeds; no second bearer deaths this run.
- **Seeds:** 731, 732, 733. Policy: scripts/policies/competent.js.
- **Interesting-finding bar:** a transcript that treats the new bearer as a
  stranger despite a known past; a misattributed memory line; a handoff beat
  that breaks; a handoff that never names the successor's own standing.
- **What this run does NOT re-prove:** self-card (r14), death-cause (r14),
  promise release + re-ask (r11), mourning chains (r11/r14), snippet clip (r13).

## Metric review
- The binding metric held: all 6 transcripts PASS, no re-scoring. One
  borderline (Ivy Wang's "I don't know you well enough") investigated via a
  targeted memory dump — judged honest (rumor traced to the bearer, trust 20),
  not a FAIL. Details below.
- The handoff audit found the pre-registered blank on all 3 seeds
  (namesSuccessorRecord: False) → fixed same-run with proof test
  RED (15 fails) on pristine via patch-swap → ALL GREEN post-fix, 3 seeds.
- Leg script: scripts/journey-succession-r15-20261016.js (r14 substrate +
  handoff capture + two-partner convo picker + associate memory-hit field).

## Results

### (A) Handoff audit — BLANK FOUND AND FILLED
- Old bearers died with LOW office trust (13, 15, 15); successors had HIGH
  own-record trust as villagers (90, 90, 64). The inheritance formula's
  biggest term was own*0.4 — invisible in the fiction.
- What the handoff named: the dead bearer (death line, "you're not Cameron",
  "The Codex turns a page", burial beat), the transfer (System line, mirror
  line with name/age/occupation), and — only on 731 — the dead bearer's trust
  ("Cameron trusted them. We saw it."). NOTHING named the successor's own
  standing on any seed, even when the village trusted them far more than the
  dead bearer.
- Fix (src/js/ledger.js, playerDeath, after the vouch block): when the
  successor's pre-mantle own-record trust >= 40, the handoff says so —
  high tier (>= 70): "The fire knew Jerome before the Codex did — their name
  already carried weight here." / mid tier (40–69): "The fire knew Gina —
  solid ground, earned at this fire." Co-fires with the vouch line (different
  facts: the dead bearer's trust vs the village's own). Below 40: silence, as
  before. [needs-eyes] — new on-screen copy.
- Proof: scripts/test-succession-ownrecord-20261016.js — RED (15 fails: the
  5 own-record assertions × 3 seeds) on pristine → ALL GREEN post-fix. Tiers,
  co-fire, old-bearer-not-named, and low-tier silence all asserted; turns-a-
  page + mirror lines asserted intact in every variant.
- Regressions: blitz-succession 30/30, selfcard ALL GREEN, honest-death-cause
  ALL GREEN, orientation ALL GREEN, ontology 115/115, check.js --quick 96/98
  (2 pre-existing test-where-are-we, same named failures r14 verified
  byte-identical on pristine).

### (B) First-week conversation audit — 6/6 PASS
- 731 / Divya Contreras (trust 90, the voucher): deep opener ("Any regrets?
  The real kind"), party invite lands, naming-debate thread, honest resume
  beats, earned ending ("This was good." They mean it.). PASS.
- 731 / Farid Ahmed (old associate): INHERITED ASK fires correctly — "I asked
  Cameron about the pantry run — Cameron's gone. Still need hands." Names the
  predecessor, never pretends the ask is new. Honest deflection ("I just said
  — did you miss it?"), commitment with stakes ("First light. The pantry's
  counting on us."). PASS.
- 732 / Oliver Braun (trust 90): grief by name ("Naomi is gone and the world
  just... continues."), trap-line want, fire-tending grief beat ("It doesn't
  bring anyone back. It just keeps my hands from shaking."). PASS.
- 732 / Fatima Hassan (old associate): full language-barrier sitting (Hindi
  only) — gestures, partial word-catch, taught phrase, "laughs — with you,
  mostly." The barrier game works as designed; warm, no filler. PASS.
- 733 / Fernando Chopra (trust 70): KIN-canon want ("You talk to it — the
  System. Have you ever asked? About Sarah?"), taken-sister grief tied to the
  Scattering, "Thanks for listening. Most people change the subject." The NPC
  addresses the bearer as the office ("You talk to the System"), never as a
  stranger. PASS.
- 733 / Ivy Wang (trust 20, old associate, 3 memory hits): party-invite
  refusal — "I don't know you well enough for that. Ask me again when we've
  survived something together." BORDERLINE under the no-stranger-treatment
  criterion (she ate with Sergio twice). Targeted memory dump: the third hit
  is "heard a rumor about themselves, traced to Sergio" (day 18) — mild
  wariness is honest at trust 20, and the refusal is about a dangerous
  activity, not about having met. Judged PASS, not a FAIL. The teach beat
  ("You show them Burdock... 'I'll remember that one.'") lands.

### Census (day 28)
- 731: Jerome Shaw (Mushroom grower), bearer trust 45, 11 alive, pantry
  full, codex breadth 40s, integration 3. Fallen: Cameron Myers (d18, hushwolf).
- 732: Aubrey Castillo (fishing guide), bearer trust 42, 10 alive. Fallen:
  Clara Hinterberger (d9, monster), Naomi Mora (d18, hushwolf).
- 733: Sergio Healy (Mushroom grower), bearer trust 32, 11 alive. Fallen:
  Zoey Conti (d18, hushwolf).
- No second-bearer deaths in the tail this run (contrast r14's 3/3 — the
  world is brutal but not deterministic; policy healing still the sim loop's
  thread, not this leg's).

## Village assessment (plain words)
Day 28, three villages. Each buried its bearer by the fire — Cameron, Naomi,
Zoey — and grieved them by name to the new bearer's face, honestly, without
ever confusing the new face for the dead. The successors — Jerome, Aubrey,
Sergio — were already known quantities: the village trusted them (90/90/64)
more than the bearers they replaced. They were taught, sat with, argued with
about monster names, asked for pantry-run hands, and refused a trap-line
walk when trust didn't cover it. The Codex rode along; the pantry stayed
full; the fire kept talking about the new face ("Ivy telling Fernando about
you. Half of it's true anymore."). The village-as-protagonist thesis holds
through the handoff — and now the handoff says the village knew these hands
before the Codex came.

## Reachable / fun / winnable
- Reachable: yes — the new line fires from the same handoff every player sees
  on death; the conversations are the ordinary talk UI.
- Fun: yes — "The fire knew Jerome before the Codex did" closes the r15 gap:
  the village's acceptance now has the right author. The transcripts read as
  people, not systems — grief, wariness, teaching, the Hindi barrier game.
- Winnable: yes for the leg — continuity holds; nothing in the transfer
  blocks progression; the own-record line is fiction-only, no numbers moved.

## Flags for other loops
- Sim loop: competent.js still doesn't heal — noted again for the policy-
  healing thread (r14's flag stands; r15's successors survived, so it's
  variance, not certainty).
- Convo loop (minor, documented not fixed): trust-gated refusals ("I don't
  know you well enough") don't consult shared history — fine at trust 20 with
  a rumor trace, but a high-memory + low-trust pairing could read as
  forgetful. No FAIL observed; leave unless a transcript shows it.
