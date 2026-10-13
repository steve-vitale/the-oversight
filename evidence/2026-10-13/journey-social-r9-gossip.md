# Journey social r9 — gossip DISTORTION sense test (2026-10-13)

Steve's design: *"Information spreads by gossip, not broadcast — with distortion through retelling."*
r8 proved gossip **volume** (306–404 seeds/140d). This run proves the **distortion** half:
does it actually climb, do the "fragments by the fire" lines read like people, and
does the story visibly "grow" then "detach"?

## Pre-registration
- **Question:** does the distortion telephone game render sensibly to the player?
- **Interesting finding would be:** distortion never climbing past 1–2 (dead design),
  senseless/misattributed overheard lines, verbatim repeats across tellers, or rep
  landing on the wrong subject.
- **Seeds:** 101, 202, 303, 404 · **DAYCAP=100** (death-aware: dead villages stop;
  seeds 101/202 lost the village at d90/d54 — runs stopped, +10d tail max honored).
- **Policy:** socialite (competent + social layer) + deliberate gossip driver:
  one player-started rumor/week (`spreadRumor`, alternating stingy/untrustworthy,
  rotating subjects) + scheduled minor theft (`stealFrom`) with witnesses.

## Seed results

| seed | days | rumors | maxDist | ≥d4 | ≥d6 | overheard frag lines | thefts | end |
|------|------|--------|---------|-----|-----|----------------------|--------|-----|
| 101 | 90 | 360 | 10 | 302 | 280 | 464 | 13 | village-lost |
| 202 | 54 | 210 | 10 | 136 | 110 | 204 | 7  | village-lost |
| 303 | 94 | 353 | 10 | 251 | 204 | 349 | 14 | survived |
| 404 | 94 | 362 | 10 | 287 | 248 | 383 | 14 | survived |

**Distortion climbs — hard.** Every seed hit distortion 10. The large majority of
rumors pass the distortion≥2 mutation gate (136–302 hit ≥4, 110–280 hit ≥6), so the
"story mutates as it travels" design is not vestigial: it engages on most rumors.
Band population in overheard lines is balanced per seed (e.g. 303: 112 <4 / 104 at
4–5 / 133 at ≥6) — the player hears the full lifecycle: fresh story → growing →
detached.

## The lines read like people

Representative overheard lines (quoted verbatim, seed 101/303):

1. *"You catch fragments by the fire — A person, maybe 30s, with a broad frame telling Chadi about themself. Half of it's true anymore. You're not sure which half."* — reflexive "themself" when the story is about the listener. Sensible, no robotic name-doubling.
2. *"You catch fragments by the fire — Gerald telling A woman, maybe 20s, with deep-set eyes about James. It's barely the same story now. That's what fires do."* — the ≥6 detach band. The tail carries the design's voice.
3. *"You catch fragments by the fire — A person, maybe 50s, with restless hands telling Muktar about A woman, maybe 20s. Half of it's true anymore. You're not sure which half."*
4. *"You catch fragments by the fire — James telling Chadi about you. Half of it's true anymore. You're not sure which half."* — player-action (theft) gossip about "you". Correct attribution.
5. *"You catch fragments by the fire — A person, maybe 30s, with a broad frame telling A person, maybe 20s about A man, maybe 40s, with a limp. The story's getting bigger than what happened."* — the <4 "growing" band.
6. *"You catch fragments by the fire — David telling James about you. The truth left this story two fires ago. What's left is better theater."*

**Distortion progression is legible:** the same story retold across days moves from
"The retelling is already better than the event" → "Half of it's true anymore.
You're not sure which half" → "The truth left this story two fires ago. What's
left is better theater." Growing, then detaching — exactly the design.

## Verbatim repeats (the 2026-10-11 "cycles without repeats" claim)

- 9 distinct tails in the pool (3 per band, as designed); each tail repeats
  19–57× per 100d run — inevitable, they're a fixed pool.
- **Immediate** consecutive identical tails: 7–19 per 204–464 lines (3–4%).
  Same teller→listener pair repeating the same tail on consecutive days happens
  (e.g. "Isaac telling Muktar about you. The retelling is already better than
  the event." on d5 and d6) — reads as the same rumor still circulating, not a
  glitch. Acceptable; the anti-repeat claim holds *within* a fireside moment.
- One false alarm chased down: lines like "Emma telling Lena about you" where
  Emma was the end-of-run player name. Verified via player-character history:
  Emma was an NPC for the whole run (became the player only at d90 in a
  re-trajectory check) — the lines are NPC-Emma gossiping about the player,
  correctly rendered. **No observed case of the player rendered as their own
  gossip teller** (0 anomalies in the targeted check run).

## Rep attribution (the 2026-10-10 "about you" fix, extended)

Tagged every gossip-hop rep write (`weight 0.4 + noTrust` path signature), seed
303, matched to spawned rumors by dims signature:

| rumor | writes | on subject | on player self-slot |
|-------|--------|-----------|---------------------|
| untrustworthy about Vito (d17) | 9 | 9 | 0 |
| untrustworthy about Lena (d31) | 8 | 8 | 0 |
| untrustworthy about Sofia (d45) | 8 | 8 | 0 |
| stingy about Marcus (d38) | 8 | 8 | 0 |
| stingy about Muktar (d24) | 31 | 9 (subject) | 0 |
| stingy about Isaac (d10) | 0 | — | — |
| theft/bully (player-action) | 34 | n/a (hearer-routed) | **0** |

- Subject-targeted rumors land on the **subject**, never the player self-slot.
  The Muktar remainder (22) is concurrent natural NPC stingy gossip, also
  subject-routed — checked the code path, same `repTarget = subject` branch.
- The d10 Isaac rumor never traveled (heard=1, distortion=0) → zero rep writes.
  Sensible: an unrepeated rumor changes no one's mind.
- Player-action theft gossip lands on **hearers**, zero writes to the player's
  self-slot. The 2026-10-10 + DETECTIVE-r12 fixes hold.

## Documented gaps (no code changed — probe worker, evidence only)

1. **Self-talk in third person** (~4% of frag lines, 11–22 per 100d run).
   `"Nabila telling Gerald about Nabila. It's picking up decorations as it travels."`
   When the *teller* is the rumor's subject, the line renders their name twice —
   nobody talks about themselves that way. The reflexive machinery in
   `spreadGossip()` (`src/js/game.js` ~14661) covers `fragSubject===listener`
   ("about herself") and `fragSubject===player` ("about you"), but not
   `fragSubject===teller`. Same class as the 2026-10-12 self-gossip first-person
   fix, which covered the askAbout/conversation path but not this fireside line.
   Suggested: reflexive "herself/himself/themself" for teller==subject.
2. **Theoretical edge (not observed):** after respawn-as-another-villager, the new
   player character can sit in an old gossip's `heard` list (they were an NPC when
   seeded). The retell loop has no player exclusion — it could render "Emma
   telling Lena about you" where Emma *is* you: the player overhearing themselves
   gossip about themselves. Zero occurrences in 4 seeds + targeted check, but the
   code path allows it. Worth a guard (`teller === this.villagerId` skip) if the
   respawn code ever keeps heard-lists warm across lives.

## Verdict

**Distortion renders sensibly.** It climbs (max 10, most rumors mutate), the
three bands are all audible in play, the lines read like people talking by a fire
with correct attribution ("about you" only when it's actually about the player),
no verbatim-repeat pathology, and rep lands on the right subject every time it
travels. The telephone game is working as designed. One real sense gap filed
(#1, teller==subject third-person), one edge flagged (#2). Neither touches the
core verdict.

## Files

- `evidence/2026-10-13/journey-social-r9-gossip.json` — combined summary,
  per-seed table, rep-attribution results, gap records
- `evidence/2026-10-13/journey-social-r9-gossip-seed{101,202,303,404}.json` —
  per-seed timelines (rumor table, frag lines with bands, rep chains)
- `scripts/journey-social-r9-gossip-20261013.js` — the probe (SEEDS/DAYCAP env)
