# Playtest loop 2026-10-11 — relay dialogue sense pass (queue jump)

Rotation file said idx 6 (crisis), but leg 6 was already played TODAY with
6 seeds x 180d and a landed fix (commit 4903cd7e, evidence journey-crisis.md).
In fact all 8 journey legs have today's evidence (0,1,2,3,4,5,6,7) — the
rotation file desynced under concurrent runs (crisis + social-life both wrote
6; succession deliberately left it at 0). Replaying crisis would duplicate
fresh work. Queue jump per the body: commit b234535b (relay dialogue rework,
18 System scenes) landed 2026-10-11 17:46 EDT — after the leg runs — with
structural proofs only (27/27), zero sense-testing. This run sense-tests it.
Rotation file set to 0 afterward (cycle restarts; all legs covered today).

## What was played

**Tool**: `scripts/journey-relay-sense-20261011.js` (new) — walks ALL 18 relay
scenes through the REAL commune path (`relayCommuneScene` -> pending ->
`relayAnswer`) on two bearer profiles, dumping FULL transcripts:
- **bare**: fresh relay claim — no locket, no sanctuary, no rewrite uses
- **kitted**: Brass Locket in pack, sanctuary learned+used, rewrite used x2

24 communes each (curiosity ladder 1-5, then check-in/light/dark rotation),
alternating engage/deflect answers. World-honesty scan on every transcript.

## Sense verdict: FAIL -> FIXED (6 findings)

The writing is excellent — the System's voice is present, every scene has a
real want, choices engage/deflect with priced consequences. But 6 scenes
asserted things that weren't true of the actual bearer/world:

1. **light-locket** fired for a bearer with no locket: "YOU KEEP THE METAL
   CIRCLE... SHE IS GONE" — fabricated keepsake + fabricated dead woman.
   -> `needs: hasItem('locket')`. With the gate, the scene is perfect: the
   locket is a real sentimental item (`Brass Locket`, `${kp.full}'s locket`),
   so "she is gone" is consistent with the item's own fiction.
2. **chk-sanctuary** accused a fresh holder: "YOU MADE A ROOM I CANNOT ENTER"
   — the bearer never learned Sanctuary. -> `needs: relayHas('sanctuary')`.
3. **chk-argument** confronted a bearer who never rewrote: "YOU EDITED THEIR
   WORDS IN TRANSIT." -> `needs: rewrite uses > 0`.
4. **chk-cup** asserted a cracked cup the bearer never owned, and the engage
   choice invented a sister: "It was my sister's." -> rewritten around the
   bearer's ACTUAL keepsake (`{keepsake}` token, resolved live from inventory;
   observed: "YOU KEEP A Seed packet..."), `needs` a sentimental item present.
   New engage: "The wear is the point. This one's got history." The System's
   corrupted-packet confession survives, now personalized.
5. **dark-intercept** named "RIVER CROSSING VILLAGE" — no such village exists
   (world has Emberhold, Stonebridge, Thornfield, Ashford). -> `{vname}` =
   the hungriest real neighbor by pantryKcal (observed: Stonebridge, 15431 —
   so "THEIR GRANARY IS THIN" is now TRUE, not invented).
6. **dark-everywhere**: "THE REGIONAL MOOT VOTES TOMORROW. SEVEN VILLAGES." —
   no regional-moot mechanic exists; the world has 3-4 named villages. ->
   reframed: "THE NEXT VOTE." + real village names ("EMBERHOLD. STONEBRIDGE.
   THORNFIELD — ONE VOICE EACH"). Council votes are real (SCALE.md); the
   scene no longer schedules a fake one.

**Machinery** (all in `src/js/relay-dialogue.js`):
- `needs` gates on scene defs; `pickNext()` walks the rotation past blocked
  scenes (consumed; they cycle back when the bearer qualifies). Fallback
  always exists — the commune is never stranded.
- `{keepsake}` / `{vname}` / `{vname2}` / `{vnames}` tokens substituted in
  `relayOpenScene` against live world state; the RESOLVED scene is stored on
  the pending record so the answer speaks the same words the System said.
- `app.js` cockpit panel now prefers the resolved copy for answer buttons.
- Bond why-string: "the conversation" -> "The conversation did that."
  (was rendering "It is curious now. the conversation").

**Not fixed / documented**:
- Plants (`Planted: ...` via recordMoment) still have no payoff scenes —
  already documented as future work in relay-dialogue-tracks.md.
- Dark-engage narrated consequences ("THE GRAIN COMES NORTH") have no
  mechanical follow-through (pantry unchanged) — the price is lean/grounding
  only. Flagging for the relay designer; not building cross-village grain
  transfer in a playtest pass.
- chk-cup/chk-sanctuary are rotation-phase-dependent (only reachable when the
  check-in counter lands odd outside the grey both-hands interleave) — they
  fire, just not on every lean path. Acceptable.

## Proof results

- `scripts/test-relay-sense-20261011.js` — **23/23 x 3 seeds** (424242, 7, 999):
  R1 bare: gated scenes never fire; zero fabricated nouns/history/tokens in
  any transcript. R2 kitted: gated scenes DO fire; dark scenes name a real
  village; chk-cup names a real keepsake from the pack. R3: gradient law holds
  (max |nudge| = 10), all 18 scenes registered.
- Regressions: test-relay-dialogue 27/27, test-table-relay 49/49,
  test-table-core 31/31, ontology 74/74.

## Reachable / fun / winnable (relay dialogue)

- **Reachable**: yes — scenes fire through the normal commune verb on the
  relay panel; curiosity ladder is the first 5 communes. Gated scenes wait
  for their premise (locket/ability/deed) instead of lying.
- **Fun**: the strongest System writing in the game. "WE THREW AWAY THE ENGINE
  AND KEPT THE FUEL. OH. OH NO." / "I AM ACCUMULATING YOU, BEARER. ALL OF YOU.
  IS THAT — IS THAT ALRIGHT." / the corrupted packet doing the keeping.
  The dark chain prices conquest in self, honestly.
- **Winnable**: the gradient law holds — no single choice locks the branch;
  drift-backs reopen abilities. The meter is never hidden (NOTICED lines +
  honest label).

## Voice note (for Steve's voiced-dialogue direction)

These 18 scenes are prime ElevenLabs candidates once curated: the System's
register here (weather metaphors, caps-lock, jittery asides) is distinct from
villager speech and consistent with the Claptrap-unhinged direction. The
NOTICED lines and the chk-cup packet confession are the standouts.
