# Playtest loop 2026-10-12 — journey leg 0: LANDING R5 (days 1–14)

Rotation idx 0 → played leg 0 (r4 ran today on ab71fe80; this re-baselines on
1e1afc81, which moved: combat-r5 beast-trick policy, succession comma-closer,
food-r4 aid pipes, crisis-r3 outbreak honesty, muster dialog fix, winpath-r3).
Next: idx 1 (establishment).

Base: 1e1afc81.

## What was played
- `scripts/journey-landing-r5-20261012.js` — r4 harness refreshed: the script
  list is now extracted DYNAMICALLY from index.html in order (r4 hardcoded 75
  files and silently dropped sigW4.js/sigW5.js/finale-campaign.js; r5 loads
  all 78), seeded RNG before eval, window-stub discipline. Daily routine adds
  two competent-player habits: answer aid offers/begs (food-r4 pipes) and
  loot corpses (never human meat). 3 fresh seeds (111, 222, 333) × 14 days,
  33 full transcripts. Engagement policy now prefers `alive:want:*` choices
  (r5 tooling fix — the r4 policy left favor wants unengaged).
- New R5 sense metrics: comma-closer stutter scan (succession ab655181),
  spoken-lure coverage (r4's own fix — verified on this tree), aid
  telemetry, disease-death naming, beasttrick honesty.
- 2 proof tests, both RED-verified on pristine HEAD → GREEN fixed.

## Village assessment (plain words)
All three villages live through the fortnight. Seed 111 loses one villager
(Marcus, day 12 — a Choir Toad got him, honestly recorded kind 'villager' /
cause 'Choir Toad'; the player looted his corpse); 222 and 333 lose nobody.
Nobody starves. The player ends at 80–100 HP (two seeds took monster hits,
honestly). Trust runs 5–41 — the player is still the stranger by day 14.
Everyone knows 9–14 plants by day 14; the village teaches itself. Pantries
diverge hard: 111 stays flush (43.3k → 26.9k), 222 runs lean (41.1k → 3.9k),
333 mid (43.8k → 10.6k) — all hold. The System arrives on day 8 in all three
seeds; the arrival sequence remains the leg's best writing. The water chorus
persists (cistern hits 0L early, DEHYDRATED warnings fire — the sim loop's
documented lever, still true, still not mine to pull). Aid pipes: zero offers
and zero begs fired in days 1–14 across 3 seeds — the instrument exists but
the leg never triggers it (aid is for struggling villages; expected).

## People check (SENSE-TESTING LAW — full transcripts read for meaning)

**New-fix verification on the current tree:**
- Comma-closer stutter (succession fix): ZERO `[.!?]`+comma stutters in 33
  sittings. The fix holds in the wild.
- Spoken lure (r4's own fix): 4 sittings offered a betrayal invite; 3 were
  spoken in the fiction. The 4th was nonverbal (Iyasus, Amharic-only) — the
  verbal block in startConvo is unreachable on the nonverbal early-return
  path. FIXED this run (blank 1).
- "I just said" fallback: ZERO in 33 sittings. Phantom Maras: ZERO.
- NPC questions: 222 fired (curiosity-first first meetings intact —
  "You look handy. What did you do with your hands, before?" → "Useful.
  Everything useful matters now. I mean that as a compliment.").

**The favor arc, played straight (222-day10, Emma):** wound ask →
"Right. That's what I figured — which is why I asked you, not them." →
concrete ask ("It's getting worse, not better... Just clean it out and
wrap it tight.") → honest deflect ("I'm sorry, I can't.") → "No, yeah, of
course. Forget I asked." They won't forget. They'll just stop asking. —
resolution=deflected, and a planted thread. Exactly the quality bar:
the NPC wants something, options engage/deflect it, the ending plants.

**The case machinery (222-day11, David):** an open case on the ambush of
Deirdre (she survived — she's alive in the census) with site/witnesses/
bribery-investigation/moot/let-lie options, all fireable, all coherent.
David's paranoia ("some people here are performing, not surviving") reads
as a person living under an open murder case, not a menu glitch.

**Nonverbal (111-day4, Iyasus):** the barrier is stated plainly, then real
Amharic. No English from his mouth — the fiction holds.

**Remaining grit (documented, not fixed here):**
- The 440 raw re-offer flags are structural (leave/silence/teach/ask:*
  legitimately persist) — same as r4.
- Favor stage-2/3 lines are templates shared across runs (cross-run
  repetition). Convo loop's text-pool territory, noted in r4.
- PUNCT_STUTTER metric refinement: all 19 hits were literary ellipses
  ("...") — the voice system uses them deliberately. Regex narrowed to
  `[!?]` doubles / 4+ dots for r6.

## Blank 1 FILLED: the silent betrayal invite, nonverbal sequel
r4 fixed the verbal case; the nonverbal path (`comm.level === 'none'`)
returns from nvOpen BEFORE the spoken-lure block — a pending invite
surfaced only as English menu labels the NPC never communicated, and
accepting blind can spring an armed plot (observed 111-day4, Iyasus).
Fix (`src/js/conversation.js`, nvOpen): they can't SAY it (no English —
not even a little), so they SHOW it — one stage-direction beat,
narration not quoted speech ("(They mime walking — pointing at themselves,
then at you, then toward the trap line. The meaning is unmistakable:
come with me.)"), once per pending (`inv.spoken`, also honored by the
verbal path later), gesturing at the invite def's spot. The no-English
rule holds: nothing is put in their mouth.
Proof: `scripts/test-landing-nv-lure-20261012.js` — RED 4 fails on
pristine HEAD → GREEN 10/10 fixed (incl. verbal-path control + cross-path
no-respeak).

## Blank 2 FILLED: the dishonest decline
Seed 222 day 11: David's spoken invitation declined → THEM: "...Sorry,
lost my train of thought." Root cause: James's day-9 decline had ledgered
the verbatim decline line on the run-wide no-repeat ledger (defect-7
backstop, working as designed), so David's decline got run-blocked and
sayLine fell back to the generic dry pool — a non-sequitur after a direct
"Not this time." Fix (`src/js/betrayal.js`, new `declineLine(vid)`):
canonical line when fresh; otherwise the first un-ledgered
decline-ACKNOWLEDGING alternate ("Right — another time." / "Fair enough.
Rain check." / "Suit yourself.") — same no-verbatim-parroting guarantee,
kept in the fiction of being declined. Trust cost (-1) untouched.
Proof: `scripts/test-landing-decline-line-20261012.js` — RED 5 fails on
pristine HEAD (declines 2–3 return the dry line) → GREEN 7/7 fixed
(canonical → alternate → alternate, no parrot chain; trust still -1).
Test artifact noted: endConvo's natural-end trust grant (+1) masks the
decline cost if measured after — measured before, in the test.

## Regressions (sequential, node proof scripts)
- test-landing-nv-lure-20261012 (new): RED 4 on pristine → GREEN 10/10
- test-landing-decline-line-20261012 (new): RED 5 on pristine → GREEN 7/7
- test-succession-closer-fold: ALL GREEN ✓
- test-dialog-coherence-20261011: 37/37 ✓
- test-dialog-gating-20261011: ALL GREEN ✓
- test-dialog-stream-20261011: 43/43 ✓
- test-succession-spent-choices-20261012: ALL GREEN ✓
- scripts/validate-ontology.js: 83/83 ✓

## Reachable / fun / winnable
- **Reachable: yes.** Full leg end-to-end on the current tree; System
  contact day 8; favors, gossip, teaching, murder cases, moots, spoken and
  gestured invites all fire naturally.
- **Fun: yes.** The favor arcs and the arrival sequence hold up; the David
  case transcript reads like a village living under a murder investigation.
  The two blanks filled remove real "menus glitching" moments.
- **Winnable: yes for the leg.** 35/36 villagers alive; the one death was
  honest monster violence, not attrition. Player at 80–100 HP every seed.

## Files
- Harness: scripts/journey-landing-r5-20261012.js (dynamic 78-file list,
  aid+loot routine, alive:want:* engagement, refined stutter regex)
- Proofs: scripts/test-landing-nv-lure-20261012.js,
  scripts/test-landing-decline-line-20261012.js
- Fixes: src/js/conversation.js (nonverbal lure gesture in nvOpen),
  src/js/betrayal.js (declineLine alternates)
- Transcripts: /tmp/journey-landing-r5-transcript-*.txt (33, ephemeral)
- Censuses: /tmp/journey-landing-r5-census-{111,222,333}.json (ephemeral)

Status: fixed in worktree; coordinator lands. No bump, no push
(ship loop owns it).
