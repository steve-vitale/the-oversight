# Journey leg: ESTABLISHMENT (days 14–40) r16 — 2026-10-19 (14:45 CDT run)

**Run provenance:** clean scheduled run (no lock at start). Rotation read 1
(establishment); playing leg 1, rotation advances to 2 at landing. Played via
`scripts/journey-establishment-r16-20261019.js` (r15 harness + r16
specialist-economy instruments: smoke-rack/teach/cook-duty line scan,
taught-delta snapshot, pantry preserved-by-village audit, party-join trust
probe; pinned competent policy; knobs FATSEEK=1, RENDER_LADDER=1,
INVITE_PARTY=1, FAVOR_ACCEPT=1, STALL_BREAK=1). Seeds 61, 82, 103, 124
(same as R1–R15, comparability). DAYCap=40, death-aware stop. 4 seeds × 40d,
one process per seed.

Canon read: CANON.md, PRESERVATION.md (the ladder; blind penalties teach),
MONSTER-WAVES.md, CONTESTS.md, CONVERSATIONS.md, DIRECTIVES.md. Specialist
canon: docs/DESIGN.md division of knowledge. No new canon.

**Base note:** local master e374e9a3a. `git pull --ff-only` could not
fast-forward: origin/master is 5 commits ahead (ship-loop reconcile lane:
"Ship reconciled Muse and phone/combat development build [needs-eyes]") and
15 behind. The divergence is the ship loop's lane; this loop works local
master per procedure. Noted, not touched.

## PRE-REGISTER

- **Question:** the establishment leg's defining texture is the village
  specialist economy — the cook's smoke racks (game.js: the cook duty
  holder smokes about-to-rot pantry surplus at the SPECIALIST rate
  0.95+0.02*skill when a preserver, 0.80x blind otherwise) and the haven
  TEACH duty ("the teacher actually teaches: one plant they know, passed
  on" via villagerLearnsPlant 'taught' — real state, generic narration).
  Is this economy player-VISIBLE in the stream (not just state-true)?
  Are the racks and the teaching legible as specialist work — named cook,
  specialist-vs-blind rate named, plants/learners named — and does village
  plant knowledge actually move in-run?
- **Interesting:** smoke-rack lines naming the cook + "keeps for weeks"
  (specialist) vs "a couple of weeks" (blind) = the economy visible as
  designed. Teach beats naming plant+learner = the knowledge economy
  legible. Generic-or-silent specialist work = a blank to fix.
- **Binding metrics:**
  - E1 winnable: ≥2/4 villages alive at day 40.
  - E2 smoke-racks visible: ≥3/4 seeds show ≥1 "worked the smoke racks" line.
  - E3 teaching visible + real: ≥2/4 seeds show ≥1 "taught what they know"
    line AND v.taught grew in-run on ≥3/4 seeds.
  - E4 people: ≥10 full transcripts sense-read, 0 senseless flags.
  - E5 contest reach: contests held on ≥3/4 seeds.
- **Side probe (not binding):** r8's Bridget design note — party join at
  trust 0. Record trust at join time on both paths (invite vs follower
  auto-enroll in unlockPartySystem, which has no trust check).

## METRIC VERDICT

- E1 winnable — **PASS.** 4/4 villages alive at day 40 (8/8, 9/9, 10/10, 7/7).
- E2 smoke-racks visible — **PASS (3/4).** Seeds 61/82/103 show 12
  smoke-rack beats each; seed 124 shows 0 (never staffed a cook — lean
  pantry, no about-to-rot surplus to preserve; coherent).
- E3 teaching visible + real — **NO-GO.** teachBeats = 0 on 4/4 seeds (the
  haven TEACH duty never fired in 160 village-days). v.taught grew on 4/4
  (182–249 entries) — knowledge moves fast through ambient channels
  (fieldwork, foraging, fireside, word of mouth). The duty itself verified
  WORKING when assigned (+2 plants, narrated) — it is never chosen by
  competent play, not broken. See metric review.
- E4 people — **PASS.** 10 transcripts sense-read, 0 senseless (below).
- E5 contest reach — **PASS.** Contests held 2/4/4/4; pilot aired 4/4.

## HEADLINE: the racks are visible; the menu cap had a hole

The village smoke technique is player-visible and legible: "🍲 Angelo
cooked for the haven — meals stretched. Angelo worked the smoke racks too
— 3 batches preserved (~1920 kcal, keeps a couple of weeks)." Named cook,
batch count, kcal, and the rate named — "keeps for weeks" when the
preserver (Arturo, seed 103) works the racks vs "a couple of weeks" for
blind hands. Ground truth: 15.7k / 16.7k / 11.3k kcal village-preserved
on 61/82/103 (specFinal preservers: 0/0/1 — the blind rate does most of
the work, the specialist rate is the upgrade).

But the people check caught a real bug: seed 124-d13's opening menu had
**15 choices** — the crisis r22 menu cap's reactive exemption
(`isReactive` in villager-agency.js) is all-or-nothing, so a hanging
question (3 gq:open) + a live betrayal case (9 prepends) blew past the
one-screen budget. Two more 9-item hybrids (61-d19, 82-d13). Fixed:
reactive answers stay protected-first, total caps at reactiveCount+2.
Proof `scripts/test-menu-cap-reactive-20261019.js` RED→GREEN (patch
round-trip), 18/18 × 3 seeds; r22's own test still 39/39; check.js
--quick 96/96.

## VILLAGE ASSESSMENT (plain words)

**Seed 61 — Angelo's kitchen.** 8/8 alive, pantry 72k. Angelo cooked 97
times (blind hands — no preserver on this roster) and the racks saved
15.7k kcal. Liezl (trust 90) and Owen (82) anchor. 11 deaths, all absorbed
— the succession carried every mantle. Taught +217 (everyone learned
15–20 plants). Contests: 2, pilot aired.

**Seed 82 — Elena's kitchen.** 9/9 alive, pantry 40k. Elena (cook L2)
held the cook duty; 16.7k kcal rack-preserved. James (90) and Giulia (67)
lead. 15 deaths including a Night Court kill. Taught +182. Contests: 4.

**Seed 103 — Arturo's kitchen.** 10/10 alive, pantry 53k, the calmest
run. Arturo is the run's only preserver (L3) — 2 of his 12 rack beats
ran at the specialist rate ("keeps for weeks"), 4.3k kcal of the 11.3k
rack total. Victor (66) leads. 14 deaths, one starvation. Taught +249,
the fastest-learning village. Contests: 4. Sung joined the party via
invite at trust 36.

**Seed 124 — the lean village.** 7/7 alive, pantry 7k, 22 deaths — the
hardest run. Never staffed a cook (no surplus to preserve; coherent).
Jorge (69) leads; Peyton joined via invite at trust 24. Taught +186.
Contests: 4. The village that needed the racks most had nothing to put
on them — the cook duty is a surplus instrument, correctly idle here.

**Who leads:** every seed grew a trust-60+ tier (Liezl 90, James 90,
Victor 66, Jorge 69).
**Who is miserable:** nobody flagged at trust 0 this run (the r8
Bridget case not reproduced).
**What is missing:** preservers are rare (1 across 4 villages) — the
blind rack rate carries the economy; the specialist upgrade is real but
thinly held.

## PEOPLE CHECK (10 transcripts sense-read, 0 senseless)

1. 61-d13 Owen (ask_favor): fever that won't break — "I need help — real
   help, not just water." Player commits; favor promised with the
   specific sickness named.
2. 103-d19 Sung (curious): asks the player's plan, then joins the party
   — "Someone should watch your back. Might as well be me." (trust 36,
   the probe's invite-path record).
3. 124-d25 Malachy (ask_favor): festering wound — "If it festers I'm no
   good to anyone — can't haul, can't hunt, can't watch." Promised.
4. 82-d19 Lillian (curious): "Broken isn't the same as ruined." A
   fixer who believes bodies want to heal; namebeast votes
   ("Loud-Bane" (James, Saleh); "The Big Beast" (Lillian)).
5. 61-d31 Giulia (seek_comfort): grief ("I keep expecting to see them by
   the fire") crowded out by a live betrayal menu — player bailed.
   Observation, not a bug: the r22 confrontation priority can starve a
   grief beat of engageable options.
6. 103-d31 Theo (curious): "what's the funniest thing you've seen?" —
   the first real laugh in days. Human.
7. 124-d13 Peyton (ask_favor): water-haul favor + spoken lure declined +
   namebeast ("Mister Never" (5 votes)). **The 15-choice menu.**
8. 61-d19 Angelo (ask_favor): the village cook with a wound he can't
   reach; lure declined honestly; 6-vote namebeast. A person, not a
   job title.
9. 103-d7 "A person, maybe 60s" (seek_comfort): "Have you — sorry. I
   keep thinking about them." Comfort lands; tellbeast: "A red moon
   rising between the trees, breathing." (Name correctly gated —
   Courtney unknown.)
10. 124-d37 Jorge (ask_favor): pantry-run favor DECLINED — "No, yeah, of
    course. Forget I asked. They won't forget. They'll just stop
    asking." (deflected memory marker). Consequences persist.

Hard-flag scan: 0 fallback lines, 0 phantom names, 0 verbatim repeats,
0 fabricated-history flags. Menus ≤8 everywhere except the three
reactive hybrids (fixed).

## BLANKS FILLED / DOCUMENTED

1. **FILLED (game bug): the reactive menu-cap hole.** villager-agency.js
   outermost wrapper: `isReactive` exempted the whole menu when ANY
   ans:/gq: item was present. Fix: reactive answers protected-first,
   total capped at reactiveCount+2 (the answers+2 contract). Proof:
   `scripts/test-menu-cap-reactive-20261019.js` — RED (14 items pass
   through) → GREEN (7 items, all 4 gq answers kept), 18/18 × seeds
   61/82/103; r22 test 39/39; check.js --quick 96/96. No [needs-eyes]
   (menu ordering only, no feel change).
2. **Verified working (not a bug):** the haven TEACH duty resolves
   correctly when assigned (+2 plants via villagerLearnsPlant, narrated).
   It is never assigned by competent play — ambient channels already
   move 182–249 plants/run. Whether the deliberate duty needs more pull
   is a design question, not a defect.
3. **Side probe (not reproduced):** both party joins this run went
   through the trust-gated invite path (Sung trust 36, Peyton trust 24;
   floor is 20). The follower auto-enroll path had no followers to
   convert. The r8 trust-0 case remains unexplained but unreproduced —
   likely the auto-enroll path with a trust-0 follower, which is
   by-design ("the System formalizes what was already happening").
4. **Documented (design note):** seed 124 never staffed a cook — the
   rack duty only fires on about-to-rot surplus (freshKcal > 1500), so
   the leanest village correctly idles it. Coherent, not a gap.

## REACHABLE / FUN / WINNABLE

- **Reachable:** smoke racks on 3/4 seeds with named cooks and named
  rates; pilot + contests 4/4; namebeast debates, favors, lures all
  fired without staging. The teach duty is reachable (assignable) but
  unchosen — documented above.
- **Fun:** the leg's texture holds — a cook with a wound he can't reach,
  grief that names the dead, a declined favor that remembers being
  declined, rack lines that read like a kitchen log. The 15-item menu
  was the one real wart, now fixed.
- **Winnable:** 4/4 villages alive through 11–22 deaths each; pantries
  7–72k; succession carried every mantle.

## METRIC REVIEW

E3 recorded as NO-GO per §14, not re-scored. The metric's second half
(knowledge moving: 4/4) passed; the first half (teach beats visible:
0/4) failed because the haven teach duty is never assigned by competent
play. The duty works when assigned (verified). Proposal for the NEXT
run: split E3 — E3a (village knowledge velocity: v.taught gained/run,
bind ≥150) measures the economy that actually runs; E3b (deliberate
teach duty fires when a player assigns it) becomes a targeted probe,
not a binding metric. The current E3 conflates "visible" with
"chosen," and competent play correctly chooses the ambient channels.

## Files

- Script: `scripts/journey-establishment-r16-20261019.js`
- Proof test: `scripts/test-menu-cap-reactive-20261019.js` (18/18 GREEN)
- Census JSON + 29 transcripts + aggregate:
  `~/workspace/goals/the-scattering-roguelite-survival-game/hidden_files/evidence/2026-10-19/journey-establishment-r16-*`
- Run logs: `/tmp/r16-seed{61,82,103,124}.log`
