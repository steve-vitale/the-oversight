# Playtest loop 2026-10-12 — journey leg 0: LANDING R4 (days 1–14)

Rotation idx 0 → played leg 0 (r3 territory; re-baselines on the current
tree, which moved a lot since r2). Next: idx 1 (establishment).

Base: ab71fe80 (succession spent-choice ledger, convo want-economy
rebalance, run-ledger dry lines, day7 soft-lock fix, multi-move engine,
wave-2 kits).

## What was played
- `scripts/test-journey-landing-r4-20261012.js` — r3 harness refreshed to
  the FULL current index.html script list (75 files: +voice-system.js,
  galactic-cast.js, spawn-knack.js, pods.js, titans.js, godhood.js),
  seeded RNG before eval, window-stub discipline, engagement policy
  unchanged. 3 fresh seeds (515, 616, 717) × 14 days. 32 transcripts.
- New R4 sense metrics: per-sitting choice re-offers, NPC-question
  occurrences, want distribution, "I just said" fallbacks, "Mara" phantoms.
- `scripts/test-landing-spoken-lure-20261012.js` — proof test for the
  blank (below): RED 2 fails on pristine HEAD → GREEN 10/10 fixed.

## Village assessment (plain words)
All three villages live through the fortnight. 33 of 36 villagers alive
at day 14; the 3 deaths were all murders — villager-on-villager ambush
plots, honestly recorded as kind 'person' / cause 'ambush', picked up by
the case/moot machinery (seed 515's open case names the real dead
villager; no phantoms). Nobody starves; the player ends every seed at
100 HP. Trust runs 5–41 — the player sits at the bottom, still the
stranger. By day 14 everyone knows 9–14 plants; the village teaches
itself (fireside pairs linger, Sofia-style teaching beats fire).
Pantries diverge: 515 stays flush (41.8k → 37.4k kcal — two fewer mouths
help), 616/717 run lean (42k → ~5.6–6k) but hold. The System arrives on
day 8 in all three seeds, and the arrival sequence is still the leg's
best writing — unhinged, funny, world-changing, cast entirely from the
living roster ("Jessica grabs your arm. 'Tell me you hear that too.'").
The water chorus persists: cistern hits 0L early, DEHYDRATED warnings
fire, the favor economy leans on water hauls — the sim loop's documented
lever, still true, still not mine to pull.

## People check (SENSE-TESTING LAW — full transcripts read for meaning)

**The convo loop's post-r2 work VERIFIED on the current tree:**
- First-meeting curiosity (their deliberate fix for r2's fizzle #3):
  `curious` won 29/32 sittings; NPC questions fired 202 times (was ZERO
  in 66 r2 conversations). The questions read human — "What did you do
  for fun? Before. The thing you'd do on a perfect Saturday." → "Nothing
  fancy. Just — people." → "The free things. Turns out they were the
  expensive ones." Strangers being curious about the stranger: the
  CONVERSATIONS.md guarantee is alive again.
- Run-ledger dry lines: "I just said — did you miss it?" fired ZERO
  times in 32 sittings. The honest dry lines
  ("...Sorry, lost my train of thought." / "Hm. Never mind — go on.")
  replaced the lying fallback, and the ledger is now a 48-entry window
  instead of whole-run history.
- Spent-choice ledger (succession fix): only 3 post-use re-offers in 32
  sittings, all generic `agree` — no resume/memory/event/invite_party
  re-offers after use. (The 543 raw re-offer flags are structural:
  leave/silence/teach/ask:* legitimately persist across menus.)
- F1/F2/F3 hold: bedtime gate, roster-cast beats, day-1 spawn names.
  The r2 phantom fix verified again in the wild: "Lena mutters:
  'Should've smoked that…'" — a real living villager, zero Maras.
- Favor arcs still resolve honestly (717-day9: wound ask → escalate →
  honest deflect → "Forget I asked." They won't forget.)

**Remaining grit (documented, not fixed here):**
- agree-ack stall: a player mashing "You're right." gets
  agree-back loops ("Yes. I was hoping you'd say that." /
  "I think so too. Quietly, but — yes.") with no stall detection.
  Mostly a harness-policy artifact (the menu offered good ask:* pivots);
  a real player wouldn't. Noted for the convo loop.
- Favor stage-2/3 lines are templates shared across runs (the 717-day9
  wound favor reads verbatim like r2's 777-day10 one). Within-run
  per-instance holds; cross-run it doesn't. Convo loop's text-pool
  territory.

## Blank FILLED: the silent betrayal invite (cross-wire, safety-relevant)

r2 documented it "for the convo loop"; it was still live on this tree,
so I fixed the narrow sense gap: a pending invite surfaced ONLY as
`betrayal:accept`/`decline` menu choices — the NPC never spoke the lure.
7/32 r4 conversations offered "Sure. Walk my trap line with me? Extra
hands, extra eyes." while the NPC talked about something else entirely.
The player was asked to accept an invitation they were never given — and
accepting blind can spring an armed ambush plot (acceptInvite → the
plot). The decline's real line ("Another time, then.") could also get
run-ledger-blocked into a dry line, reading as confusion.

Fix (`src/js/conversation.js`, startConvo): when the NPC holds a pending
invite, they SPEAK it as a second opener beat — once per pending
(`inv.spoken`; plot invites still travel the indistinguishable normal
channel, tells remain the warning cue). The accept label then echoes
words the player actually heard.

Before: THEM: "What got you through the first week?" + menu ["Sure.
Come get air with me…" / "Not this time."] (never spoken).
After: THEM: "Do you dream about before? Or is it all — this — now?"
"Walk my trap line with me? Extra hands, extra eyes." + the same menu,
now coherent.

Proof: `scripts/test-landing-spoken-lure-20261012.js` — RED 2 fails on
pristine HEAD (opener lacks the lure), GREEN 10/10 fixed (lure spoken;
decline/accept consume the pending; lure not re-spoken on a second
sitting with the same pending).

## Regressions (sequential, node proof scripts)
- test-landing-spoken-lure-20261012 (new proof): RED 2 on pristine →
  GREEN 10/10 fixed
- test-dialog-coherence-20261011: 37/37 ✓
- test-dialog-gating-20261011: ALL GREEN ✓
- test-dialog-stream-20261011: 43/43 ✓
- test-succession-spent-choices-20261012: ALL GREEN ✓
- scripts/validate-ontology.js: 80/80 ✓

## Reachable / fun / winnable
- **Reachable: yes.** Full leg end-to-end on the current tree; System
  contact day 8; favors, gossip, teaching, murder cases, moots, spoken
  invites all fire naturally.
- **Fun: yes.** The curiosity-first first meetings are a genuine upgrade
  over r2's favor-monoculture; favor arcs and the arrival sequence hold
  up. The spoken lure makes the trap-line invitations feel like people
  talking, not menus glitching.
- **Winnable: yes for the leg.** 33/36 villagers alive; the 3 deaths
  were honest betrayal-system violence, not attrition. Player at 100 HP
  every seed.

## Files
- Harness: scripts/test-journey-landing-r4-20261012.js (75-file list,
  sense metrics)
- Proof: scripts/test-landing-spoken-lure-20261012.js
- Fix: src/js/conversation.js (spoken lure in startConvo)
- Transcripts: /tmp/journey-landing-r4-transcript-*.txt (32, ephemeral)
- Censuses: /tmp/journey-landing-r4-census-{515,616,717}.json

Status: fixed in worktree; coordinator lands. No bump, no push
(ship loop owns it).
