# Journey leg: DEEPENING (days 40–80) — 2026-10-11

Recovery-free run. Rotation 2 → 3. Worktree `journey-deepening`, lock held for
the run (run_id matched to registry; heartbeats sent). Main tree untouched
until landing.

## Method

Worker-built harness `scripts/test-journey-deepening-20261011.js` + probe
`scripts/probe-inside-20261011.js` — node, mulberry32 seeded before module
eval, full production script list, text capture on. Competent policy
(`scripts/policies/competent.js`) + leg extensions: wave 2–3 fight engagement
(flee only when outmatched), gear-up, regional play (propose links, answer
accord/counter/national/global beats, tribute), beasttricks askAbout.
Conversations on days 45–80 with engage-first + deep-follow-up policy.
Two passes × 3 seeds (20261011, 777, 424242) = 6 timelines. Pass 1 had a
harness blind spot (policy never called `enterBuilding()` — `travelTo` leaves
you outside the hall so the pantry refused all run; bearers starved next to
full pantries — the game is honest here, not buggy, verified by probe).
Pass 2 fixed it; all findings are pass 2 unless noted. Canon read first:
CANON.md, MONSTER-WAVES.md, SCALE.md, SYSTEMS.md, DISEASES.md,
CONVERSATIONS.md.

## Village assessment (plain words)

All three pass-2 villages **died out** (day 53, 59, 65) — honestly, not
softlocks:
- **20261011 — the ground-down village.** 12 → 0 by day 59. Wave-2 monsters
  bled them (5 combat deaths days 47–59, Moderator/Static Kite fights cost
  bearers), famine took the rest (3 starvation). Pantry 15k → 6k. The mantle
  passed until no bearer remained.
- **777 — the famine village.** 12 → 1 by day 65 (James, carpenter, trust 1,
  lonely, 22 plants known — the last man). Pantry 25k → 0: a genuine famine,
  eaten clean. 3 starved, 5 fell in combat. James knew 22 plants and had
  nobody left to teach.
- **424242 — the mauled village.** 12 → 1 by day 53. Monsters killed 4 (two
  on day 22), combat took 4 more, starvation 2, one sickness death (the only
  disease death observed). Pantry 42k → 0.

Who they were: ER nurses, plumbers, carpenters, exterminators, journalists,
electricians, gardeners — distinct people, trust 1–90, moods
lonely/steady/grieving. The food thesis held — villages that couldn't feed
themselves died honestly; the ones that fought wave-2s paid in blood.
Variance is enormous (pass-1 777: pantry 90k, regional, alive at 80; pass-2
777: pantry 0, dead at 65) — land productivity RNG dominates player skill.

## Play: waves, fights, regional, scale

- **Wave 2 unlocked day 32–33 in all seeds** (ledger bars working, per-type
  caps holding). **Wave 3 unlocked in 0/6 timelines** — best was 3/5 wave-2
  ledger points by day 80. Gate is day 25 + 5 wave-2 points; observed kill
  rate is 1–3 per 60–80 days. Binding constraint is encounter/kill volume.
- **Wave 2–3 fights are REAL, blow-by-blow — verified.** The Moderator (w2
  apex), 40 rounds, lost: suppression field mutes moves, violation stacking,
  real damage both ways. The Static Kite, 45 rounds, lost. Player won ~1/3 of
  wave-2 fights (4–10 round wins vs Extended Warranty/Performance Review;
  30–51 round grinds vs Kite/Moderator). Villagers kill wave-2s on their own
  (union_rep, paparazzo, voice_mimic_radio). **No wave-3 fight ever observed**
  — Spool/ToS/Redactor signature mechanics unfired in live play this leg.
- **Regional:** pass-1 seed 777 reached REGIONAL — day 47 `proposeLink`
  (Emberhold) → day 48 `answerAccord('gift')` → the Regional Dawn landed as
  a played moment ("2,000 kcal walks to Emberhold's fire — a gift, no
  strings. They count it, and they remember who sent it."). The link later
  broke (trust decayed, tribute neglected — honest relationship sim). A
  foreign 4-village polity formed off-screen day 47 ("the region lives
  without you" works). Pass 2: 0/3 reached regional (cold proposals
  declined; the courtship climb path untested by this policy).
- **Contests:** 0 events in 3/6 timelines; 6–9 in the others. Scheduling
  still thin/high-variance (establishment blank #2 stands). No moot contest
  fired. **Pilot episode still unimplemented** (establishment blank #1
  re-verified).
- **Knowledge economy:** 21–25 plants, 5–14 skills, 6–8 monsters codex'd per
  run; 3–5 monster counters discovered per run via beasttricks askAbout —
  the village-learns-together loop works. Ledger scoring correct (player +
  villager kills, per-type caps).

## People check (transcripts read, not counted)

**The good — genuinely human:** Lena (ER nurse, trust 29→90) with an active
betrayal case: "Walk the treeline with me tonight? …I just don't want to go
alone." → commit → "You don't know what that means right now." → resolved
`promised`. Teaching beat: "I never knew that." David: "Do you dream about
before?" → "Dreams are the one place they can't touch. Guard them." Wanda:
"I dream about soup. Actual soup, with a spoon." Fix E (establishment) held.

**The broken bits → all fixed this run:**
- seek_comfort `dlg:stay` filler loop: 6 stays cycled 3 lines verbatim, want
  stalled at stage 2, grief never named → now deepens on the 4th stay and
  resolves `comforted`.
- Gossip fresh-path (`game.js`): fetched `g`, ignored it, said "Word is
  you're doing right by people. Keep it up." → now renders the actual
  gossip's strongest positive dim, exaggerated at distortion ≥ 2 (the
  seedGossip third-retelling contract).
- 17 stray-`]` typos in convo-beats.js REPLY_POOLS (worker found 14, missed
  3) → all fixed; menus render clean.
- Voice composition: "Honestly, We never finished…" → comma-openers now
  continue lowercase for common sentence-starters; dash/sentence openers,
  pronoun I, and names keep case.

## Blanks documented (not fixed this run)

1. **Wave-3 gate unreachable in-leg** (0/6 timelines; 1–3 wave-2 points per
   60–80 days vs 5 needed). Recommend the wave-2 kill-throughput lever
   (encounter rate and/or bar) go to the long-sim loop's rotation — and the
   pacing audit's "a real fight every ~2 days" assumption doesn't match the
   observed ~1 player fight per 6 days.
2. **Pilot episode unimplemented** (CONTESTS.md promises it; absent from
   contests.js/broadcast.js/contestEngine.js).
3. **Contest scheduling thin/high-variance**: 0 events in 3/6 timelines.
4. **Harness lesson (not a game bug)**: sim policies must call
   `Game.enterBuilding()` after travel — `travelTo` leaves you outside and
   `havenStoresAccess()` gates the pantry. Also fixed in-harness:
   `Game.appointSwitchboard` (not `answerSwitchboard`), propose cooldown,
   temperament via `personality.temperament`.

## Verdict: reachable / fun / winnable

- **Reachable: PARTIAL.** Wave-2 content — yes, richly. Regional Dawn — yes
  (1/6 via cold proposal; courtship climb untested). **Wave 3 — no**: 0/6
  timelines; the leg's headline escalation is effectively endgame-leg
  content at current tuning. Contests — thin.
- **Fun: YES, when it fires.** Wave-2 fights are the real thing; trust-60+
  conversations are excellent (Lena's treeline favor is the bar). The leg's
  problem is absence, not quality.
- **Winnable: the leg resolves honestly.** 5/6 timelines ended in death by
  day 53–65, all legible. But the endgame needs all 5 waves faced by ~day
  100 — with wave 3 unlocking past day 80+ at competent-play kill rates,
  the win path's pacing doesn't close.

## Files

- Harness: `scripts/test-journey-deepening-20261011.js` (worker-built)
- Probe: `scripts/probe-inside-20261011.js` (worker-built)
- Proof: `scripts/test-journey-deepening-fixes-20261011.js` (473/473 ×3 seeds)
- Fixes: `src/js/convo-beats.js` (17 typos), `src/js/game.js` (gossip
  fresh-path), `src/js/conversation.js` (voiceLine case),
  `src/js/convo-dialogue.js` (dlg:stay deepening)
- Transcripts: /tmp/journey-deep-transcript-*-day*.txt (ephemeral)
- Censuses: /tmp/journey-deep-census-*.json (ephemeral)
